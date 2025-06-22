import { NextRequest, NextResponse } from "next/server";
import { aiServiceFactory, AiConfig } from "@bigrigs/shared-ai";

export const runtime = 'nodejs'; // Force Node.js runtime

export async function POST(req: NextRequest) {
  try {
    console.log("API route called");
    const formData = await req.formData();
    const file = formData.get("file");
    const provider = formData.get("provider") as string;
    const model = formData.get("model") as string;
    
    if (!file || typeof file === "string") {
      console.log("Invalid file:", file);
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    console.log("File received:", { 
      name: (file as File).name, 
      type: (file as File).type, 
      size: (file as File).size 
    });

    // Create AI config if provider is specified
    let aiConfig: AiConfig | undefined;
    if (provider) {
      aiConfig = {
        provider: provider as 'openai' | 'gemini',
        model: model || undefined
      };
      console.log("Using AI config:", aiConfig);
    }

    // Use the AI provider from the factory for analysis
    const aiProvider = aiServiceFactory.getProvider(aiConfig);
    const result = await aiProvider.analyzeDocument(file as File);
    
    return NextResponse.json(result);
  } catch (err) {
    console.log("Server error:", err);
    const errorMessage = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 