import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { HazmatAnalysisResult, RawHazmatData } from "@/types/hazmat";
import { HAZMAT_ANALYSIS_PROMPT, HAZMAT_EXTRACTION_PROMPT } from "@/lib/prompts";

/**
 * The standard contract for any AI provider.
 * Any AI service we use (OpenAI, Gemini, etc.) must implement this interface.
 */
export interface IAiProvider {
  analyzeDocument(file: File): Promise<HazmatAnalysisResult>;
}

type ApiContent = (
  | { type: "image_url"; image_url: { url: string } }
  | { type: "text"; text: string }
)[];

/**
 * The concrete implementation for OpenAI's GPT-4o model.
 */
export class OpenAiProvider implements IAiProvider {
  private getApiKey(): string {
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      throw new Error("OpenAI API key not set on the server.");
    }
    return key;
  }

  async analyzeDocument(file: File): Promise<HazmatAnalysisResult> {
    try {
      console.log("--- Starting OpenAI Step 1: Data Extraction ---");
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64Data = buffer.toString("base64");
      
      const rawData = await this.performExtraction(file.type, base64Data);
      console.log("--- Finished OpenAI Step 1: Data Extraction ---");
      
      console.log("--- Starting OpenAI Step 2: Compliance Analysis ---");
      const analysisResult = await this.performAnalysis(rawData);
      console.log("--- Finished OpenAI Step 2: Compliance Analysis ---");

      return analysisResult;
    } catch (error) {
      console.error("OpenAI analysis pipeline failed:", error);
      throw error;
    }
  }

  private async performExtraction(fileType: string, base64Data: string): Promise<RawHazmatData> {
    const response = await this.makeApiCall(HAZMAT_EXTRACTION_PROMPT, [
      {
        type: "image_url",
        image_url: { url: `data:${fileType};base64,${base64Data}` },
      },
    ]);
    return JSON.parse(response) as RawHazmatData;
  }

  private async performAnalysis(rawData: RawHazmatData): Promise<HazmatAnalysisResult> {
    const response = await this.makeApiCall(HAZMAT_ANALYSIS_PROMPT, [
      {
        type: "text",
        text: `Here is the extracted data from the shipping document. Please perform a compliance analysis:\n\n${JSON.stringify(rawData, null, 2)}`,
      },
    ]);
    return JSON.parse(response) as HazmatAnalysisResult;
  }

  private async makeApiCall(prompt: string, content: ApiContent): Promise<string> {
    const apiKey = this.getApiKey();

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: prompt },
          { role: "user", content },
        ],
        max_tokens: 2048,
        temperature: 0.1,
        response_format: { type: "json_object" },
      }),
    });

    console.log("OpenAI API call status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API Error:", errorText);
      throw new Error(`OpenAI API error: ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    const contentString = result.choices?.[0]?.message?.content;
    
    if (!contentString) {
      throw new Error("No content received from OpenAI");
    }

    return contentString;
  }
}

/**
 * The concrete implementation for Google's Gemini model.
 */
export class GoogleGeminiProvider implements IAiProvider {
  private genAI: GoogleGenerativeAI;
  private modelConfig = {
    model: "gemini-2.5-flash",
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json",
    },
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
    ],
  };

  constructor() {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error("Google API key not set on the server.");
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async analyzeDocument(file: File): Promise<HazmatAnalysisResult> {
    try {
      console.log("--- Starting Gemini Step 1: Data Extraction ---");
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64Data = buffer.toString("base64");
      
      const rawData = await this.performExtraction(file.type, base64Data);
      console.log("--- Finished Gemini Step 1: Data Extraction ---");
      
      console.log("--- Starting Gemini Step 2: Compliance Analysis ---");
      const analysisResult = await this.performAnalysis(rawData);
      console.log("--- Finished Gemini Step 2: Compliance Analysis ---");

      return analysisResult;
    } catch (error) {
      console.error("Gemini analysis pipeline failed:", error);
      throw error;
    }
  }

  private async performExtraction(fileType: string, base64Data: string): Promise<RawHazmatData> {
    const model = this.genAI.getGenerativeModel(this.modelConfig);
    const prompt = HAZMAT_EXTRACTION_PROMPT;
    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: fileType,
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = result.response;
    const jsonText = response.text();

    return JSON.parse(jsonText) as RawHazmatData;
  }

  private async performAnalysis(rawData: RawHazmatData): Promise<HazmatAnalysisResult> {
    const model = this.genAI.getGenerativeModel(this.modelConfig);
    const prompt = `${HAZMAT_ANALYSIS_PROMPT}\n\nHere is the extracted data from the shipping document. Please perform a compliance analysis:\n\n${JSON.stringify(rawData, null, 2)}`;
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const jsonText = response.text();
    
    return JSON.parse(jsonText) as HazmatAnalysisResult;
  }
} 