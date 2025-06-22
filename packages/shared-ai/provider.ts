import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { HazmatAnalysisResult, RawHazmatData } from "../types";

// Move prompts here since they're part of the AI service
const HAZMAT_EXTRACTION_PROMPT = `You are an expert at reading hazardous materials shipping documents. Your task is to extract all visible data from the document image and return it in a structured JSON format.

IMPORTANT: Return ONLY valid JSON with no additional text, markdown formatting, or code fences.

Extract the following information and return it as a JSON object with this exact structure:
{
  "lineItems": [
    {
      "unNumber": "string (e.g., '1203')",
      "properShippingName": "string",
      "hazardClass": "string (e.g., '3', '8', '5.1')",
      "packingGroup": "string (I, II, or III)",
      "quantity": "string"
    }
  ],
  "missingFields": ["array of missing field names"]
}

If any field is not visible or unclear, use null for that field. Do not include any explanatory text, just the JSON object.`;

const HAZMAT_ANALYSIS_PROMPT = `You are an expert in U.S. hazardous materials transportation regulations (49 CFR). Analyze the extracted shipping document data and provide a comprehensive compliance assessment.

IMPORTANT: Return ONLY valid JSON with no additional text, markdown formatting, or code fences.

Return a JSON object with this exact structure:
{
  "documentIsValid": boolean,
  "complianceScore": "string (e.g., '9/10')",
  "missingFields": ["array of missing field names"],
  "placards": ["array of required placard names"],
  "placardReasoning": "string explaining placard requirements",
  "lineItems": [
    {
      "lineNumber": number,
      "unNumber": "string",
      "properShippingName": "string",
      "hazardClass": "string",
      "packingGroup": "string",
      "quantity": "string",
      "ergSummary": {
        "un_number": "string",
        "guide_number": "string",
        "hazards": ["array of hazard descriptions"],
        "ppe": ["array of PPE requirements"],
        "evacuation_distance": "string",
        "fire_response": "string"
      }
    }
  ],
  "incompatibilities": ["array of incompatibility warnings"]
}

Apply these rules:
1. Check for required fields per 49 CFR §172.200-205
2. Determine placard requirements per 49 CFR §172.504
3. Look up ERG guide numbers and provide safety summaries
4. Check for material incompatibilities
5. Identify any routing restrictions

Do not include any explanatory text, just the JSON object.`;

/**
 * The standard contract for any AI provider.
 * Any AI service we use (OpenAI, Gemini, etc.) must implement this interface.
 */
export interface IAiProvider {
  analyzeDocument(file: File): Promise<HazmatAnalysisResult>;
}

/**
 * Validates and normalizes the AI response to match the expected interface.
 */
function validateAndNormalizeResponse(data: any): HazmatAnalysisResult {
  return {
    documentIsValid: data.documentIsValid ?? false,
    missingFields: Array.isArray(data.missingFields) ? data.missingFields : [],
    placards: Array.isArray(data.placards) ? data.placards : [],
    placardReasoning: data.placardReasoning ?? "",
    incompatibilities: Array.isArray(data.incompatibilities) ? data.incompatibilities : [],
    complianceScore: data.complianceScore ?? "0/10",
    lineItems: Array.isArray(data.lineItems) ? data.lineItems.map((item: any, index: number) => ({
      lineNumber: item.lineNumber ?? index + 1,
      unNumber: item.unNumber ?? "",
      properShippingName: item.properShippingName ?? "",
      hazardClass: item.hazardClass ?? "",
      packingGroup: item.packingGroup ?? "",
      quantity: item.quantity ?? "",
      ergSummary: {
        un_number: item.ergSummary?.un_number ?? "",
        guide_number: item.ergSummary?.guide_number ?? "",
        hazards: Array.isArray(item.ergSummary?.hazards) ? item.ergSummary.hazards : [],
        ppe: Array.isArray(item.ergSummary?.ppe) ? item.ergSummary.ppe : [],
        evacuation_distance: item.ergSummary?.evacuation_distance ?? "",
        fire_response: item.ergSummary?.fire_response ?? ""
      }
    })) : []
  };
}

type ApiContent = (
  | { type: "image_url"; image_url: { url: string } }
  | { type: "text"; text: string }
)[];

/**
 * The concrete implementation for OpenAI's GPT-4o model.
 */
export class OpenAiProvider implements IAiProvider {
  private model: string;

  constructor(model?: string) {
    this.model = model || "gpt-4o";
  }

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
    const parsedResponse = JSON.parse(response);
    return validateAndNormalizeResponse(parsedResponse);
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
        model: this.model,
        messages: [
          { 
            role: "system", 
            content: `${prompt}\n\nCRITICAL: You must respond with ONLY valid JSON. Do not include any markdown formatting, code fences, or explanatory text. The response must be parseable by JSON.parse().` 
          },
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
  private modelConfig: any;

  constructor(model?: string) {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error("Google API key not set on the server.");
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    
    this.modelConfig = {
      model: model || "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.1,
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
    
    // Remove Markdown code fences if present
    const cleaned = jsonText.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned) as RawHazmatData;
  }

  private async performAnalysis(rawData: RawHazmatData): Promise<HazmatAnalysisResult> {
    const model = this.genAI.getGenerativeModel(this.modelConfig);
    const prompt = `${HAZMAT_ANALYSIS_PROMPT}\n\nHere is the extracted data from the shipping document. Please perform a compliance analysis:\n\n${JSON.stringify(rawData, null, 2)}`;
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const jsonText = response.text();
    
    // Remove Markdown code fences if present
    const cleaned = jsonText.replace(/```json|```/g, '').trim();
    const parsedResponse = JSON.parse(cleaned);
    return validateAndNormalizeResponse(parsedResponse);
  }
} 