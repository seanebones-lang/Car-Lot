import { TranslationServiceClient } from '@google-cloud/translate';
import { getDatabase } from '../database';

export class TranslationService {
  private client: TranslationServiceClient | null = null;
  private apiKey: string | null = null;

  constructor() {
    this.loadApiKey();
  }

  private loadApiKey() {
    const db = getDatabase();
    const setting = db.prepare('SELECT value FROM settings WHERE key = ?').get('translationApiKey') as { value: string } | undefined;
    if (setting) {
      this.apiKey = JSON.parse(setting.value);
      this.initializeClient();
    }
  }

  private initializeClient() {
    if (this.apiKey) {
      try {
        this.client = new TranslationServiceClient({
          keyFilename: this.apiKey, // This should be a path to credentials JSON file
          // Alternatively, use GOOGLE_APPLICATION_CREDENTIALS environment variable
        });
      } catch (error) {
        console.error('Failed to initialize translation client:', error);
        this.client = null;
      }
    }
  }

  async translate(text: string, targetLanguage: string): Promise<string> {
    if (!this.client) {
      throw new Error('Translation service not configured. Please set up Google Cloud Translation API key in settings.');
    }

    try {
      const projectId = 'your-project-id'; // This should come from settings or environment
      const location = 'global';
      const request = {
        parent: `projects/${projectId}/locations/${location}`,
        contents: [text],
        mimeType: 'text/plain',
        targetLanguageCode: targetLanguage,
      };

      const [response] = await this.client.translateText(request);
      
      if (response?.translations && response.translations.length > 0) {
        return response.translations[0]?.translatedText || text;
      }
      
      return text;
    } catch (error) {
      console.error('Translation error:', error);
      throw error;
    }
  }

  updateApiKey(apiKey: string) {
    const db = getDatabase();
    db.prepare('INSERT OR REPLACE INTO settings (key, value, updatedAt) VALUES (?, ?, CURRENT_TIMESTAMP)')
      .run('translationApiKey', JSON.stringify(apiKey));
    this.apiKey = apiKey;
    this.initializeClient();
  }
}
