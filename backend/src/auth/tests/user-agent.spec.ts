import 'reflect-metadata';
import { describe, it, expect } from '@jest/globals';
import { parseUserAgent, describeUserAgent } from '../utils/user-agent';

// [Body_Sadek] #732 — active-sessions stored the raw UA in both browser and
// deviceName. parseUserAgent yields a friendly browser + device instead.
describe('[Body_Sadek] parseUserAgent (#732)', () => {
  it('parses Chrome on Windows', () => {
    const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';
    expect(parseUserAgent(ua)).toEqual({ browser: 'Chrome', device: 'Windows' });
  });

  it('parses Safari on iPhone', () => {
    const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
    expect(parseUserAgent(ua)).toEqual({ browser: 'Safari', device: 'iPhone' });
  });

  it('parses Edge over Chrome token', () => {
    const ua = 'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/120.0 Safari/537.36 Edg/120.0';
    expect(parseUserAgent(ua).browser).toBe('Edge');
  });

  it('parses Firefox on Android', () => {
    expect(parseUserAgent('Mozilla/5.0 (Android 13; Mobile; rv:120.0) Gecko/120.0 Firefox/120.0'))
      .toEqual({ browser: 'Firefox', device: 'Android' });
  });

  it('degrades gracefully for empty UA and builds a label', () => {
    expect(parseUserAgent('')).toEqual({ browser: 'Unknown browser', device: 'Unknown device' });
    expect(describeUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) Version/17.0 Safari/605.1.15'))
      .toBe('Safari on macOS');
  });
});
