import { Injectable } from '@nestjs/common';

@Injectable()
export class TranslationService {
  private readonly apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;

  async detectLanguage(text: string): Promise<string> {
    if (!this.apiKey) return 'ar'; // default to Arabic
    try {
      const response = await fetch(
        `https://translation.googleapis.com/language/translate/v2/detect?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ q: text }),
        },
      );
      const data = await response.json();
      return data?.data?.detections?.[0]?.[0]?.language || 'ar';
    } catch {
      return 'ar';
    }
  }

  async translateText(
    text: string,
    targetLang: string,
    sourceLang?: string,
  ): Promise<string | null> {
    if (!this.apiKey) {
      console.log(
        `[Translation Mock] ${sourceLang} -> ${targetLang}: "${text.substring(0, 50)}..."`,
      );
      return null; // mock: original text served
    }
    try {
      const response = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ q: text, target: targetLang, source: sourceLang }),
        },
      );
      const data = await response.json();
      return data?.data?.translations?.[0]?.translatedText || null;
    } catch {
      return null;
    }
  }
}
