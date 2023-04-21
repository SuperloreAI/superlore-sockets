import { OpenAI } from "langchain/llms";
import { getOpenAIKey } from "@/lib/secrets/secrets";

class OpenAISingleton {
  private static instance: OpenAISingleton;
  private model?: OpenAI;
  private isInitialized: boolean;

  private constructor() {
    this.isInitialized = false;
  }

  public static async getOpenAIModel(): Promise<OpenAI> {
    if (!OpenAISingleton.instance) {
      OpenAISingleton.instance = new OpenAISingleton();
    }

    if (!OpenAISingleton.instance.isInitialized) {
      await OpenAISingleton.instance.initialize();
    }

    if (!OpenAISingleton.instance.model) {
      throw new Error("OpenAI model is not initialized");
    }

    return OpenAISingleton.instance.model;
  }

  private async initialize(): Promise<void> {
    const apiKey = await getOpenAIKey();

    this.model = new OpenAI({
      openAIApiKey: apiKey,
      temperature: 0.9,
      maxTokens: 2000,
    });

    this.isInitialized = true;
  }
}

export default OpenAISingleton;
