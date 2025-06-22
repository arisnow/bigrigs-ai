# Hazmate - AI-Powered Hazmat Compliance Tool

**Hazmate** is the first application under the **bigrigs.ai** brand - an AI-powered hazmat compliance analysis tool designed for U.S. truck drivers and safety personnel who handle hazardous materials.

## 🎯 Project Overview

**Primary Goal**: Enable hazmat truckers to snap a photo of a shipping document (manifest or BOL) and immediately receive clear, actionable compliance insights optimized for mobile use on the road.

**Target Users**: U.S. truck drivers and dispatchers who need quick hazmat compliance answers on the road using their mobile phones.

## 🚀 Current Status

**✅ COMPLETED:**
- **Monorepo Architecture** - Refactored into `bigrigs-ai` monorepo with shared packages
- **Mobile-First Trucker Experience** - Complete redesign optimized for mobile phones and non-technical users
- Next.js app scaffolded with TypeScript + Tailwind CSS
- Mobile-first upload interface (camera + file upload)
- **Flexible, Provider-Agnostic AI Service Layer**
  - Implemented OpenAI GPT-4o Provider
  - Implemented Google Gemini 2.0 Flash Provider
- **Robust Two-Step AI Pipeline (Extractor & Analyst)**
- Structured JSON response parsing and validation
- **Safety-First Results Display** - Critical safety info prioritized, actionable alerts
- Advanced error handling and loading states
- Production build working and validated
- **Advanced prompt engineering with reasoning enforcement**
- **Clean architecture successfully implemented and refined**
- **Git repository setup** - Clean monorepo history published to GitHub

**🔧 TECHNICAL IMPLEMENTATION:**
- **Frontend**: Next.js 15.3.4, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes (Node.js runtime)
- **AI**: **Provider-agnostic service** using OpenAI GPT-4o or Google Gemini
- **File Handling**: Image/PDF upload with base64 encoding
- **Deployment**: Configured for Netlify (including runtime fixes)
- **Prompt Management**: **Separate prompts for Extraction and Analysis**
- **Architecture**: **AI Service Factory** to switch providers via env variables
- **Monorepo**: **Shared packages** for AI logic and types across future applications

## 📱 User Flow

1. **Upload**: User takes a photo or uploads a hazmat shipping document using their mobile phone.
2. **Analysis**: The image is processed through a two-step AI pipeline by the currently configured AI provider (OpenAI or Gemini).
    - **Step 1 (Extractor)**: An AI vision model reads the document and extracts the raw, visible data.
    - **Step 2 (Analyst)**: A second AI model receives the clean data, applies complex CFR regulations, and generates the final compliance analysis.
3. **Results**: **Mobile-optimized results** with safety alerts first, clear "SAFE TO DRIVE" / "DO NOT DRIVE" status, and actionable next steps.

## 🧠 AI Analysis Output

The app extracts and displays:
- **Safety Alerts**: Critical ERG data (evacuation distances, PPE requirements, fire response) prominently displayed
- **Compliance Status**: Clear "SAFE TO DRIVE" or "DO NOT DRIVE" with large visual indicators
- **Immediate Actions**: What needs to be fixed right now (missing fields, placards, incompatibilities)
- **Placard Requirements**: Exactly which placards to install with reasoning
- **Material Details**: Technical information available but collapsed by default

## 🏗️ Project Structure

```
bigrigs-ai/                    # Monorepo root
├── apps/
│   └── hazmate/              # Next.js application
│       ├── src/
│       │   ├── app/          # Next.js App Router
│       │   │   ├── page.tsx  # Home page (uses UploadForm)
│       │   │   ├── results/page.tsx # Results page (uses ResultsDisplay)
│       │   │   └── api/analyze/route.ts # API endpoint (uses factory)
│       │   ├── components/   # Reusable UI components
│       │   │   ├── UploadForm.tsx # File upload component
│       │   │   └── ResultsDisplay.tsx # Mobile-optimized results display
│       │   └── types/        # TypeScript interfaces (imports from shared)
│       │       └── hazmat.ts # Local type definitions
│       ├── .env.local        # Environment variables
│       └── package.json
├── packages/
│   ├── shared-ai/            # Shared AI service layer
│   │   ├── factory.ts        # AI provider factory
│   │   ├── provider.ts       # AI provider implementations
│   │   └── package.json
│   └── types/                # Shared TypeScript types
│       ├── hazmat.ts         # Core hazmat type definitions
│       └── package.json
├── package.json              # Root workspace configuration
└── README.md
```

## 🚀 Quick Start for Development

```bash
# From the monorepo root
npm install                    # Install all dependencies
npm run dev -w hazmate-app     # Start development server (http://localhost:3000)
npm run build -w hazmate-app   # Create production build
```

## 🔑 Environment Variables

Create a `.env.local` file in the `apps/hazmate` directory with the following:

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

- **Mobile-first** - Designed specifically for truckers on the road with mobile phones
- **Safety-first** - Critical safety information (ERG data) displayed prominently
- **Action-oriented** - Clear "what to do next" guidance
- **Non-technical language** - Plain English, no regulatory jargon
- **One-handed operation** - Everything accessible with thumb navigation
- **Glance-able information** - Can read while safely pulled over

## 🔧 Key Technical Decisions

1. **Monorepo Architecture**: Moved to `bigrigs-ai` monorepo to enable sharing AI logic and types across future applications.
2. **Mobile-First Redesign**: Complete UI overhaul prioritizing safety alerts, compliance status, and actionable information for truckers.
3. **AI Provider Abstraction**: Implemented an interface (`IAiProvider`) and factory pattern to decouple the application from any single AI vendor.
4. **Two-Step AI Pipeline**: Separating data extraction from rule-based analysis proved critical for accuracy.
5. **Safety Information Prioritization**: ERG safety data (evacuation, PPE, fire response) is now prominently displayed.
6. **Progressive Disclosure**: Technical details are collapsed by default, expand on demand.
7. **Structured JSON**: Using `response_format: "json_object"` for reliable parsing.
8. **TypeScript**: Full type safety across shared packages and applications.

## 🏛️ Architecture Overview

The application uses a **monorepo structure** with shared packages:

- **`packages/shared-ai`**: Contains the AI service factory and provider implementations
- **`packages/types`**: Shared TypeScript interfaces used across applications
- **`apps/hazmate`**: The main Next.js application that imports from shared packages

The core is the `AiServiceFactory`, which reads the `AI_PROVIDER` environment variable and returns an instance of a class that implements the `IAiProvider` interface.

## 🚫 Known Limitations

- **Static Routing** - No real-time routing (planned for future)
- **Basic Auth** - No authentication (MVP approach)
- **Offline Support** - Requires internet connection
- **Image Quality** - Depends on photo quality for accuracy
- **ESLint Warning** - Minor Next.js ESLint configuration warning (non-blocking)

## 🎯 Next Development Priorities

1. **Test & Compare Providers** - Run both test documents through the Gemini provider to compare its accuracy and speed against OpenAI.
2. **PWA Features** - Add Progressive Web App capabilities for better offline access and a native-like feel.
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
  "placardReasoning": "Class 3 total weight: 2 lbs (Isopropanol) + 880 lbs (Flammable liquid, n.o.s.) + 1760 lbs (Benzene) = 2642 lbs. Class 3 requires a placard as the total weight exceeds 1001 lbs.",
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

## 🎪 Brand Context

**bigrigs.ai** - Brand focused on AI-powered tools for the trucking industry. Hazmate is the first application, establishing the foundation for future trucking-focused AI solutions.

---

**Last Updated**: December 2024  
**Status**: MVP Complete with Mobile-First Design, Monorepo Architecture, Ready for Testing & Deployment  
**Next Session Goal**: Test with real documents, add PWA features, or deploy to production 