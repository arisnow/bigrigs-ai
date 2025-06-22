import { IAiProvider, OpenAiProvider, GoogleGeminiProvider } from "./provider";

export interface AiConfig {
  provider: 'openai' | 'gemini';
  model?: string;
}

/**
 * The AI Service Factory.
 * This is the single point of control for selecting the AI provider.
 * It reads the AI_PROVIDER environment variable to make its decision.
 */
class AiServiceFactory {
  private defaultProvider: IAiProvider;

  constructor() {
    const providerName = process.env.AI_PROVIDER || 'openai';

    console.log(`Initializing default AI provider: ${providerName}`);

    if (providerName === 'gemini') {
      const geminiModel = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
      this.defaultProvider = new GoogleGeminiProvider(geminiModel);
    } else {
      // Default to OpenAI if the variable is not set or is set to 'openai'
      const openaiModel = process.env.OPENAI_MODEL || 'gpt-4o';
      this.defaultProvider = new OpenAiProvider(openaiModel);
    }
  }

  getProvider(config?: AiConfig): IAiProvider {
    if (!config) {
      return this.defaultProvider;
    }

    console.log(`Creating AI provider with config:`, config);

    if (config.provider === 'gemini') {
      return new GoogleGeminiProvider(config.model);
    } else {
      return new OpenAiProvider(config.model);
    }
  }

  getDefaultProvider(): IAiProvider {
    return this.defaultProvider;
  }
}

// Export a singleton instance of the factory
export const aiServiceFactory = new AiServiceFactory();

// Export the default provider for backward compatibility
export const aiProvider = aiServiceFactory.getDefaultProvider(); 