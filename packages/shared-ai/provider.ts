import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { HazmatAnalysisResult, RawHazmatData } from "../types";
import { PLACARDING_GUIDELINES, BOL_REQUIREMENTS, SAFETY_PRIORITIES, CFR_REFERENCES } from "./guidelines";

// Enhanced extraction prompt with regulatory requirements
const HAZMAT_EXTRACTION_PROMPT = `You are an expert at reading hazardous materials shipping documents according to 49 CFR regulations. Your task is to extract all visible data from the document image and return it in a structured JSON format.

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
  "missingFields": ["array of missing field names"],
  "emergencyContact": "string (if visible)",
  "shipperCertification": "string (if visible)",
  "dateOfAcceptance": "string (if visible)",
  "totalQuantity": "string (if visible)",
  "packageDescription": "string (if visible)",
  "documentType": "bill_of_lading|manifest|other"
}

REGULATORY REQUIREMENTS TO CHECK:
- Mandatory sequence: UN/NA Number → Proper Shipping Name → Hazard Class → Packing Group
- Essential fields: Emergency contact, Shipper certification, Date of acceptance, Total quantity, Package description
- Shipper certification must contain specific regulatory language
- All quantities must have proper units
- Package descriptions must be clear and complete

If any field is not visible or unclear, use null for that field. Do not include any explanatory text, just the JSON object.`;

// Enhanced analysis prompt with comprehensive compliance checking
const HAZMAT_ANALYSIS_PROMPT = `You are an expert in U.S. hazardous materials transportation regulations (49 CFR). Analyze the extracted shipping document data and provide a comprehensive compliance assessment with safety-first prioritization.

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
  "incompatibilities": ["array of incompatibility warnings"],
  "documentValidation": {
    "hasEmergencyContact": boolean,
    "hasShipperCertification": boolean,
    "hasDateOfAcceptance": boolean,
    "hasProperSequence": boolean,
    "hasRequiredQuantity": boolean,
    "hasPackageDescription": boolean,
    "missingCriticalFields": ["array of critical missing fields"],
    "validationErrors": ["array of validation error messages"]
  },
  "placardingRequirements": [
    {
      "placardName": "string",
      "required": boolean,
      "quantityThreshold": "string (any|1001+ lbs)",
      "reasoning": "string",
      "cfrReference": "string"
    }
  ],
  "safetyAlerts": [
    {
      "severity": "critical|warning|info",
      "title": "string",
      "message": "string",
      "actionRequired": "string",
      "cfrReference": "string"
    }
  ],
  "immediateActions": ["array of immediate action items"],
  "complianceViolations": ["array of CFR violations"],
  "cfrReferences": ["array of relevant CFR citations"]
}

COMPLIANCE ANALYSIS REQUIREMENTS:

1. DOCUMENT VALIDATION (49 CFR 172.200-205):
   - Check mandatory sequence: UN/NA → Proper Shipping Name → Hazard Class → Packing Group
   - Verify emergency contact is present and monitored
   - Validate shipper certification contains required regulatory language
   - Confirm date of acceptance is included
   - Check total quantity with proper units
   - Verify package description is complete

2. PLACARDING REQUIREMENTS (49 CFR 172.504):
   - ANY QUANTITY materials (Table 1): Class 1 (1.1, 1.2, 1.3, 1.5), Class 2.3, Class 4.3, Class 5.2, Class 6.1 (inhalation), Class 7
   - QUANTITY THRESHOLD materials (Table 2): 1001+ lbs for Class 1.4, 1.6, 2.1, 2.2, 3, 4.1, 4.2, 5.1, 6.1, 8, 9
   - Calculate aggregate quantities by hazard class
   - Provide specific reasoning for each placard requirement

3. SAFETY PRIORITIES:
   - CRITICAL: Evacuation distances, PPE requirements, fire response, incompatibilities
   - WARNING: Missing fields, incorrect placarding, quantity violations
   - INFO: ERG guides, CFR references, technical details

4. ERG SAFETY DATA:
   - Look up guide numbers for each UN number
   - Provide evacuation distances and PPE requirements
   - Include fire response procedures
   - List specific hazards

5. COMPLIANCE VIOLATIONS:
   - Identify any CFR violations with specific citations
   - Flag missing critical safety information
   - Note quantity threshold violations
   - Highlight documentation errors

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
    })) : [],
    // Enhanced compliance fields
    documentValidation: {
      hasEmergencyContact: data.documentValidation?.hasEmergencyContact ?? false,
      hasShipperCertification: data.documentValidation?.hasShipperCertification ?? false,
      hasDateOfAcceptance: data.documentValidation?.hasDateOfAcceptance ?? false,
      hasProperSequence: data.documentValidation?.hasProperSequence ?? false,
      hasRequiredQuantity: data.documentValidation?.hasRequiredQuantity ?? false,
      hasPackageDescription: data.documentValidation?.hasPackageDescription ?? false,
      missingCriticalFields: Array.isArray(data.documentValidation?.missingCriticalFields) ? data.documentValidation.missingCriticalFields : [],
      validationErrors: Array.isArray(data.documentValidation?.validationErrors) ? data.documentValidation.validationErrors : []
    },
    placardingRequirements: Array.isArray(data.placardingRequirements) ? data.placardingRequirements.map((req: any) => ({
      placardName: req.placardName ?? "",
      required: req.required ?? false,
      quantityThreshold: req.quantityThreshold ?? "",
      reasoning: req.reasoning ?? "",
      cfrReference: req.cfrReference ?? ""
    })) : [],
    safetyAlerts: Array.isArray(data.safetyAlerts) ? data.safetyAlerts.map((alert: any) => ({
      severity: alert.severity ?? "info",
      title: alert.title ?? "",
      message: alert.message ?? "",
      actionRequired: alert.actionRequired ?? "",
      cfrReference: alert.cfrReference ?? ""
    })) : [],
    immediateActions: Array.isArray(data.immediateActions) ? data.immediateActions : [],
    complianceViolations: Array.isArray(data.complianceViolations) ? data.complianceViolations : [],
    cfrReferences: Array.isArray(data.cfrReferences) ? data.cfrReferences : []
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