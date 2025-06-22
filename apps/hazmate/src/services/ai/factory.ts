import { IAiProvider, OpenAiProvider, GoogleGeminiProvider } from "./provider";

/**
 * The AI Service Factory.
 * This is the single point of control for selecting the AI provider.
 * It reads the AI_PROVIDER environment variable to make its decision.
 */
class AiServiceFactory {
  private provider: IAiProvider;

  constructor() {
    const providerName = process.env.AI_PROVIDER || 'openai';

    console.log(`Initializing AI provider: ${providerName}`);

    if (providerName === 'gemini') {
      this.provider = new GoogleGeminiProvider();
    } else {
      // Default to OpenAI if the variable is not set or is set to 'openai'
      this.provider = new OpenAiProvider();
    }
  }

  getProvider(): IAiProvider {
    return this.provider;
  }
}

// Export a singleton instance of the factory's provider
export const aiProvider = new AiServiceFactory().getProvider(); 