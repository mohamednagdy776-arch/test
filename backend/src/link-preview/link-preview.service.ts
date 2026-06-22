import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { lookup } from 'dns/promises';
import { isIP } from 'net';
import * as ipaddr from 'ipaddr.js';
import { RedisCacheService } from '../common/services/redis-cache.service';

export interface LinkPreview {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
}

const PREVIEW_TTL = 24 * 60 * 60; // 24h — OG data rarely changes
const FETCH_TIMEOUT = 8000;
// Big sites (YouTube, etc.) ship multi-MB documents with heavy inline JS in the
// <head> before the OG tags. 1MB was too small — the download threw and we lost
// the preview entirely. Cap generously; results are cached, so cost is one-off.
const MAX_BYTES = 6 * 1024 * 1024; // 6MB
// How far into the body to scan for meta tags when there's no </head> marker.
const HEAD_SCAN_FALLBACK = 2 * 1024 * 1024; // 2MB
const UA =
  'Mozilla/5.0 (compatible; TayyibtBot/1.0; +https://tayyibt.app) link-preview';

// The first http(s) URL in a block of text (used by chat + post enrichment).
const URL_RE = /\bhttps?:\/\/[^\s<>"')]+/i;

@Injectable()
export class LinkPreviewService {
  constructor(private redis: RedisCacheService) {}

  extractFirstUrl(text?: string | null): string | null {
    if (!text) return null;
    const match = text.match(URL_RE);
    return match ? match[0].replace(/[.,;:!?)]+$/, '') : null;
  }

  async getPreview(rawUrl: string): Promise<LinkPreview | null> {
    let url: URL;
    try {
      url = new URL(rawUrl);
    } catch {
      return null;
    }
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;

    const cacheKey = `link_preview:${url.href}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        /* fall through and refetch */
      }
    }

    if (!(await this.isPublicHost(url.hostname))) return null;

    // YouTube (and similar) serve datacenter IPs a consent/bot page with no OG
    // tags, so HTML scraping returns nothing on the server. Use oEmbed for those
    // providers; fall back to generic HTML parsing if it doesn't apply/fails.
    const preview =
      (this.isYouTube(url.hostname) ? await this.fetchYouTubeOembed(url) : null) ||
      (await this.fetchAndParse(url));
    if (preview) {
      // Cache successes longer; cache "no preview" briefly to avoid hammering.
      await this.redis.set(cacheKey, JSON.stringify(preview), PREVIEW_TTL);
    } else {
      await this.redis.set(cacheKey, JSON.stringify({ url: url.href }), 10 * 60);
      return { url: url.href };
    }
    return preview;
  }

  private isYouTube(hostname: string): boolean {
    const h = hostname.replace(/^www\./, '').toLowerCase();
    return (
      h === 'youtube.com' ||
      h === 'm.youtube.com' ||
      h === 'music.youtube.com' ||
      h === 'youtu.be'
    );
  }

  private async fetchYouTubeOembed(url: URL): Promise<LinkPreview | null> {
    try {
      const res = await axios.get('https://www.youtube.com/oembed', {
        params: { url: url.href, format: 'json' },
        timeout: FETCH_TIMEOUT,
        validateStatus: (s) => s >= 200 && s < 300,
      });
      const d = res.data || {};
      if (!d.title) return null;
      return {
        url: url.href,
        title: this.decode(String(d.title)),
        description: d.author_name ? this.decode(String(d.author_name)) : undefined,
        image: d.thumbnail_url ? String(d.thumbnail_url) : undefined,
        siteName: d.provider_name ? String(d.provider_name) : 'YouTube',
      };
    } catch {
      return null;
    }
  }

  // SSRF guard: never fetch URLs that resolve to private/loopback/link-local IPs.
  private async isPublicHost(hostname: string): Promise<boolean> {
    try {
      const addrs = isIP(hostname)
        ? [{ address: hostname }]
        : await lookup(hostname, { all: true });
      return addrs.every((a) => !this.isPrivateIp(a.address));
    } catch {
      return false;
    }
  }

  // Allow-list approach (fail closed): only globally-routable unicast addresses
  // are permitted. ipaddr.js canonicalises every notation — compressed IPv6,
  // IPv4-mapped (::ffff:a.b.c.d and its hex form), etc. — so the classification
  // can't be bypassed with non-canonical literals. Anything it can't parse, or
  // that isn't plain "unicast", is treated as private.
  private isPrivateIp(ip: string): boolean {
    let addr: ipaddr.IPv4 | ipaddr.IPv6;
    try {
      addr = ipaddr.parse(ip);
    } catch {
      return true;
    }
    if (addr.kind() === 'ipv6') {
      const v6 = addr as ipaddr.IPv6;
      // Resolve IPv4-mapped addresses to the embedded IPv4 and classify that.
      if (v6.isIPv4MappedAddress()) {
        return v6.toIPv4Address().range() !== 'unicast';
      }
    }
    return addr.range() !== 'unicast';
  }

  private async fetchAndParse(url: URL): Promise<LinkPreview | null> {
    let html: string;
    try {
      const res = await axios.get(url.href, {
        timeout: FETCH_TIMEOUT,
        maxContentLength: MAX_BYTES,
        maxRedirects: 3,
        responseType: 'text',
        headers: { 'User-Agent': UA, Accept: 'text/html,application/xhtml+xml' },
        // Only HTML is useful for OG parsing.
        validateStatus: (s) => s >= 200 && s < 400,
      });
      const contentType = String(res.headers['content-type'] || '');
      if (contentType && !contentType.includes('html')) return null;
      html = typeof res.data === 'string' ? res.data : String(res.data);
    } catch {
      return null;
    }

    // OG/meta tags live in <head>, but on big sites that can be hundreds of KB
    // in. Scan up to </head> (with a generous fallback) rather than a fixed
    // small prefix, so YouTube et al. resolve.
    const headEnd = html.indexOf('</head>');
    const head = headEnd > 0 ? html.slice(0, headEnd) : html.slice(0, HEAD_SCAN_FALLBACK);
    const meta = (...names: string[]): string | undefined => {
      for (const name of names) {
        const v = this.readMeta(head, name);
        if (v) return v;
      }
      return undefined;
    };

    const title =
      meta('og:title', 'twitter:title') || this.readTitle(head) || undefined;
    const description = meta('og:description', 'twitter:description', 'description');
    const rawImage = meta('og:image', 'og:image:url', 'twitter:image', 'twitter:image:src');
    const siteName = meta('og:site_name');

    const image = rawImage ? this.absolutize(rawImage, url) : undefined;

    if (!title && !description && !image) return null;
    return {
      url: url.href,
      title: this.decode(title),
      description: this.decode(description),
      image,
      siteName: this.decode(siteName) || url.hostname,
    };
  }

  private readMeta(html: string, name: string): string | undefined {
    // Match <meta property|name="<name>" content="..."> in either attr order.
    const esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const patterns = [
      new RegExp(
        `<meta[^>]+(?:property|name)\\s*=\\s*["']${esc}["'][^>]*?content\\s*=\\s*["']([^"']*)["']`,
        'i',
      ),
      new RegExp(
        `<meta[^>]+content\\s*=\\s*["']([^"']*)["'][^>]*?(?:property|name)\\s*=\\s*["']${esc}["']`,
        'i',
      ),
    ];
    for (const re of patterns) {
      const m = html.match(re);
      if (m && m[1]) return m[1].trim();
    }
    return undefined;
  }

  private readTitle(html: string): string | undefined {
    const m = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    return m ? m[1].trim() : undefined;
  }

  private absolutize(src: string, base: URL): string | undefined {
    try {
      return new URL(src, base).href;
    } catch {
      return undefined;
    }
  }

  private decode(s?: string): string | undefined {
    if (!s) return s;
    return s
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#0?39;/g, "'")
      .replace(/&#x27;/gi, "'")
      .replace(/&apos;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .trim();
  }
}
