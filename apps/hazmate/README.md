# Hazmate - AI-Powered Hazmat Compliance Tool

**Hazmate** is the first application under the **bigrigs.ai** brand - an AI-powered hazmat compliance analysis tool designed for U.S. truck drivers and safety personnel who handle hazardous materials.

## 🎯 Project Overview

**Primary Goal**: Enable hazmat truckers to snap a photo of a shipping document (manifest or BOL) and immediately receive clear, actionable compliance insights.

**Target Users**: U.S. truck drivers and dispatchers who need quick hazmat compliance answers on the road.

## 🚀 Current Status

**✅ COMPLETED:**
- Next.js app scaffolded with TypeScript + Tailwind CSS
- Mobile-first upload interface (camera + file upload)
- **Flexible, Provider-Agnostic AI Service Layer**
-   - Implemented OpenAI GPT-4o Provider
-   - Implemented Google Gemini 2.5 Flash Provider
- **Robust Two-Step AI Pipeline (Extractor & Analyst)**
- Structured JSON response parsing and validation
- **Redesigned results page with collapsible reasoning display**
- Advanced error handling and loading states
- Production build working and validated
- **Advanced prompt engineering with reasoning enforcement**
- **Clean architecture successfully implemented and refined**

**🔧 TECHNICAL IMPLEMENTATION:**
- **Frontend**: Next.js 15.3.4, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes (Node.js runtime)
- **AI**: **Provider-agnostic service** using OpenAI GPT-4o or Google Gemini
- **File Handling**: Image/PDF upload with base64 encoding
- **Deployment**: Configured for Netlify (including runtime fixes)
- **Prompt Management**: **Separate prompts for Extraction and Analysis**
- **Architecture**: **AI Service Factory** to switch providers via env variables

## 📱 User Flow

1. **Upload**: User takes a photo or uploads a hazmat shipping document.
2. **Analysis**: The image is processed through a two-step AI pipeline by the currently configured AI provider (OpenAI or Gemini).
    - **Step 1 (Extractor)**: An AI vision model reads the document and extracts the raw, visible data.
    - **Step 2 (Analyst)**: A second AI model receives the clean data, applies complex CFR regulations, and generates the final compliance analysis.
3. **Results**: Structured compliance data is displayed with a document-level summary and a detailed breakdown for each hazardous material.

## 🧠 AI Analysis Output

The app extracts and displays:
- **Document-Level Summary**: Validity, compliance score, missing fields, and overall placard requirements with detailed reasoning.
- **Line Item Details**: A breakdown of each hazardous material, including UN Number, Hazard Class, and ERG summary.
- **Incompatibilities**: Segregation warnings based on CFR regulations.

## 🏗️ Project Structure

```
hazmate/
├── hazmate-app/                 # Next.js application
│   ├── src/
│   │   ├── app/                 # Next.js App Router
│   │   │   ├── page.tsx         # Home page (uses UploadForm)
│   │   │   ├── results/page.tsx # Results page (uses ResultsDisplay)
│   │   │   └── api/analyze/route.ts # API endpoint (uses factory)
│   │   ├── components/          # Reusable UI components
│   │   │   ├── UploadForm.tsx   # File upload component
│   │   │   └── ResultsDisplay.tsx # Results display with reasoning
│   │   ├── services/            # Business logic layer
│   │   │   └── ai/
│   │   │       ├── provider.ts    # IAiProvider interface, OpenAI & Gemini classes
│   │   │       └── factory.ts     # Selects AI provider based on env
│   │   ├── types/               # TypeScript interfaces
│   │   │   └── hazmat.ts        # All data type definitions
│   │   └── lib/                 # Shared utilities
│   │       ├── prompts.ts       # Extraction & Analysis AI prompts
│   │       └── utils.ts         # Helper functions
│   ├── .env.local               # OpenAI API key
│   └── package.json
└── projectoutline.txt           # Original project requirements
```

## 🚀 Quick Start for Development

```bash
cd hazmate-app
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Create production build
```

## 🔑 Environment Variables

Create a `.env.local` file in the `hazmate-app` directory with the following:

```
# --- AI Provider Selection ---
# Set to "openai" or "gemini" to choose the active AI provider
AI_PROVIDER="gemini"

# --- API Keys ---
# Required for the OpenAI provider
OPENAI_API_KEY="your-openai-api-key"

# Required for the Google Gemini provider
GOOGLE_API_KEY="your-google-api-key"
```

## 🎨 Design Philosophy

- **Mobile-first** - Designed for truckers on the road
- **Simple & Fast** - One task per screen, minimal clicks
- **Clear Language** - Plain English, no jargon
- **Trust & Transparency** - Provides reasoning for AI conclusions

## 🔧 Key Technical Decisions

1.  **AI Provider Abstraction**: Implemented an interface (`IAiProvider`) and factory pattern to decouple the application from any single AI vendor. This allows for easy switching between OpenAI, Google Gemini, and future providers.
2.  **Two-Step AI Pipeline**: Separating data extraction from rule-based analysis proved critical for accuracy. An "Extractor" AI reads the document, and an "Analyst" AI applies regulations to the clean data.
3.  **Reasoning Enforcement**: Forcing the AI to "show its work" (e.g., for placarding) was the final step to eliminate stubborn reasoning errors and improve transparency.
4.  **Forced Node.js Runtime**: Explicitly setting `export const runtime = 'nodejs'` in the API route was necessary to fix deployment issues on Netlify by ensuring `Buffer` support.
5.  **Structured JSON**: Using `response_format: "json_object"` for reliable parsing.
6.  **Node.js Runtime**: Chosen over Edge runtime for Buffer support.
7.  **Base64 Images**: Data URLs for OpenAI Vision API.
8.  **TypeScript**: Full type safety for maintainability.
9.  **Clean Architecture**: Components, services, types, and utilities are properly separated, enabling rapid iteration and debugging.

## 🏛️ Architecture Overview

The core of the application is the `AiServiceFactory`, which reads the `AI_PROVIDER` environment variable and returns an instance of a class that implements the `IAiProvider` interface.

- **`OpenAiProvider`**: Contains all logic for the two-step pipeline using the OpenAI API.
- **`GoogleGeminiProvider`**: Contains all logic for the two-step pipeline using the Google AI SDK.

This separation isolates the vendor-specific logic and allows the rest of the application to work with a standardized interface.

## 🚫 Known Limitations

- **Static Routing** - No real-time routing (planned for future)
- **Basic Auth** - No authentication (MVP approach)
- **Offline Support** - Requires internet connection
- **Image Quality** - Depends on photo quality for accuracy

## 🎯 Next Development Priorities

1. **Test & Compare Providers** - Run both test documents through the Gemini provider to compare its accuracy and speed against OpenAI.
2. **PWA Features** - Add Progressive Web App capabilities for better offline access and a native-like feel (e.g., add to home screen, basic offline fallback).
3. **User Accounts & History** - Allow users to create accounts to save and review their analysis history.
4. **Performance** - Implement client-side image compression before upload to reduce bandwidth and improve speed.
5. **Deployment** - Finalize production deployment on Netlify.

## 📋 API Response Schema

```json
{
  "documentIsValid": false,
  "missingFields": [
    "Carrier Name",
    "Carrier Signature"
  ],
  "placards": [
    "FLAMMABLE"
  ],
  "placardReasoning": "Class 3 total weight: 2 lbs (Isopropanol) + 880 lbs (Flammable liquid, n.o.s.) + 1760 lbs (Benzene) = 2642 lbs. Class 8 total weight: 66 lbs. Class 3 requires a placard as the total weight exceeds 1001 lbs. Class 8 does not require a placard as the total weight is below 1001 lbs.",
  "incompatibilities": [],
  "complianceScore": "7/10",
  "lineItems": [
    {
      "lineNumber": 1,
      "unNumber": "UN1219",
      "properShippingName": "Isopropanol",
      "hazardClass": "3",
      "packingGroup": "II",
      "quantity": "2 lb",
      "ergSummary": {
        "un_number": "UN1219",
        "guide_number": "129",
        "hazards": ["Highly flammable liquid and vapor.", "May cause drowsiness or dizziness."],
        "ppe": ["Protective gloves", "Eye protection"],
        "evacuation_distance": "100 meters",
        "fire_response": "Use water spray, alcohol-resistant foam, dry chemical or carbon dioxide"
      }
    }
  ]
}
```

---

**Last Updated**: June 2025  
**Status**: Core analysis feature is architecturally complete and provider-agnostic. Ready for cross-provider testing.
**Next Session Goal**: Test Gemini provider accuracy and implement PWA features.

## 🎪 Brand Context

**bigrigs.ai** - Brand focused on AI-powered tools for the trucking industry. Hazmate is the first application, establishing the foundation for future trucking-focused AI solutions.

---

**Last Updated**: June 2025  
**Status**: MVP Complete with Clean Architecture, Ready for Testing & Deployment  
**Next Session Goal**: Test with real documents, add PWA features, or deploy to production 