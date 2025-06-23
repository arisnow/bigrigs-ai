# Hazmate - AI-Powered Hazmat Compliance Tool

**Hazmate** is the first application under the **bigrigs.ai** brand - an AI-powered hazmat compliance analysis tool designed for U.S. truck drivers and safety personnel who handle hazardous materials.

## 🎯 Project Overview

**Primary Goal**: Bridge the gap between complex regulatory requirements and the practical needs of truckers on the road. Enable hazmat truckers to snap a photo of a shipping document (manifest or BOL) and immediately receive clear, actionable compliance insights optimized for mobile use.

**Target Users**: U.S. truck drivers and dispatchers who need quick hazmat compliance answers on the road using their mobile phones.

**Bigger Vision**: Democratize compliance for the trucking industry by making complex regulations accessible and actionable for drivers who just want to do the right thing and get home safely.

## 🚀 Current Status

**✅ COMPLETED:**
- **Monorepo Architecture** - Refactored into `bigrigs-ai` monorepo with shared packages
- **Mobile-First Trucker Experience** - Complete redesign optimized for mobile phones and non-technical users
- **Driver-Focused UI** - New "Driver View" with action-oriented interface and expandable regulatory backup
- Next.js app scaffolded with TypeScript + Tailwind CSS
- Mobile-first upload interface (camera + file upload)
- **Flexible, Provider-Agnostic AI Service Layer**
  - Implemented OpenAI GPT-4o Provider
  - Implemented Google Gemini 2.0 Flash Provider
- **Robust Two-Step AI Pipeline (Extractor & Analyst)**
- **Comprehensive Regulatory Integration** - Full 49 CFR guidelines for placarding and BOL requirements
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
- **Regulatory Framework**: Comprehensive 49 CFR integration with driver-focused action generation

## 📱 User Flow

1. **Upload**: User takes a photo or uploads a hazmat shipping document using their mobile phone.
2. **Analysis**: The image is processed through a two-step AI pipeline by the currently configured AI provider (OpenAI or Gemini).
    - **Step 1 (Extractor)**: An AI vision model reads the document and extracts the raw, visible data.
    - **Step 2 (Analyst)**: A second AI model receives the clean data, applies complex CFR regulations, and generates the final compliance analysis.
3. **Results**: **Driver-focused results** with clear "GOOD TO GO" / "STOP - NEED TO FIX" status, immediate action items, and expandable regulatory backup.

## 🧠 AI Analysis Output

The app now provides **two complementary views**:

### **Driver View (Default)**
- **Can I Drive?** - Clear "GOOD TO GO" or "STOP - NEED TO FIX" decision
- **What to Do Right Now** - Prioritized action items with locations and reasoning
- **Placards Needed** - Visual guide with exact placement instructions
- **Emergency Reference** - Consolidated safety information for crisis situations
- **Missing Critical Items** - Items that prevent driving

### **Detailed View**
- **Safety Alerts**: Critical ERG data (evacuation distances, PPE requirements, fire response) prominently displayed
- **Compliance Status**: Clear "SAFE TO DRIVE" or "DO NOT DRIVE" with large visual indicators
- **Document Validation**: Comprehensive BOL compliance checking
- **Placard Requirements**: Detailed placarding analysis with CFR references
- **Material Details**: Technical information available but collapsed by default

## 🏗️ Project Structure

```
bigrigs-ai/                    # Monorepo root
├── apps/
│   └── hazmate/              # Next.js application
│       ├── src/
│       │   ├── app/          # Next.js App Router
│       │   │   ├── page.tsx  # Home page (uses UploadForm)
│       │   │   ├── results/page.tsx # Results page (Driver/Detailed toggle)
│       │   │   └── api/analyze/route.ts # API endpoint (uses factory)
│       │   ├── components/   # Reusable UI components
│       │   │   ├── UploadForm.tsx # File upload component
│       │   │   ├── ResultsDisplay.tsx # Detailed compliance display
│       │   │   └── DriverView.tsx # Driver-focused action interface
│       │   └── types/        # TypeScript interfaces (imports from shared)
│       │       └── hazmat.ts # Local type definitions
│       ├── .env.local        # Environment variables
│       └── package.json
├── packages/
│   ├── shared-ai/            # Shared AI service layer
│   │   ├── factory.ts        # AI provider factory
│   │   ├── provider.ts       # AI provider implementations
│   │   ├── guidelines.ts     # Regulatory guidelines and CFR references
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

- **Driver-First** - Designed specifically for truckers on the road with mobile phones
- **Action-Oriented** - Clear "what to do next" guidance with specific locations and reasoning
- **Safety-First** - Critical safety information (ERG data) displayed prominently
- **Regulatory Backup** - Expandable details with CFR references for credibility
- **Non-Technical Language** - Plain English, no regulatory jargon in primary view
- **One-Handed Operation** - Everything accessible with thumb navigation
- **Glance-Able Information** - Can read while safely pulled over

## 🔧 Key Technical Decisions

1. **Monorepo Architecture**: Moved to `bigrigs-ai` monorepo to enable sharing AI logic and types across future applications.
2. **Driver-Focused Redesign**: Complete UI overhaul prioritizing quick actions and clear decisions for truckers.
3. **Dual View System**: Driver View for quick actions, Detailed View for comprehensive compliance information.
4. **Regulatory Integration**: Comprehensive 49 CFR guidelines embedded in AI prompts for accurate compliance checking.
5. **AI Provider Abstraction**: Implemented an interface (`IAiProvider`) and factory pattern to decouple the application from any single AI vendor.
6. **Two-Step AI Pipeline**: Separating data extraction from rule-based analysis proved critical for accuracy.
7. **Action-Oriented Output**: AI generates specific, actionable steps with locations and reasoning.
8. **TypeScript**: Full type safety across shared packages and applications.

## 🏛️ Architecture Overview

The application uses a **monorepo structure** with shared packages:

- **`packages/shared-ai`**: Contains the AI service factory, provider implementations, and regulatory guidelines
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
2. **Pre-Trip Inspection Module** - Extend the platform to include comprehensive pre-trip inspection checklists and compliance monitoring.
3. **Route Compliance Assistant** - Add features for weight restrictions, hazmat routing, and hours of service compliance.
4. **Real-Time Compliance Monitor** - Implement live compliance alerts and predictive compliance warnings.
5. **PWA Features** - Add Progressive Web App capabilities for better offline access and a native-like feel.
6. **User Accounts & History** - Allow users to create accounts to save and review their analysis history.
7. **Performance** - Implement client-side image compression before upload to reduce bandwidth and improve speed.
8. **Deployment** - Finalize production deployment on Netlify.

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
  ],
  "driverSummary": {
    "canDrive": false,
    "primaryActions": [
      {
        "priority": "critical",
        "action": "Get emergency contact number from shipper",
        "location": "shipper office",
        "reasoning": "Required by CFR 172.604 for all hazmat shipments",
        "cfrReference": "49 CFR 172.604"
      },
      {
        "priority": "high",
        "action": "Put FLAMMABLE placard on front",
        "location": "front of truck",
        "reasoning": "Total Class 3 weight exceeds 1001 lbs threshold",
        "cfrReference": "49 CFR 172.504(e) Table 2"
      }
    ],
    "placardPlacements": [
      {
        "placardName": "FLAMMABLE",
        "required": true,
        "locations": ["front", "left side", "right side"],
        "reasoning": "Class 3 materials over 1001 lbs require FLAMMABLE placard",
        "cfrReference": "49 CFR 172.504(e) Table 2"
      }
    ],
    "emergencyInfo": {
      "evacuationDistance": "100 meters",
      "ppeRequired": ["Protective gloves", "Eye protection"],
      "fireResponse": "Use water spray, alcohol-resistant foam",
      "emergencyContact": "1-800-424-9300"
    },
    "missingCriticalItems": ["Emergency contact number"],
    "complianceScore": "7/10"
  }
}
```

## 🎪 Brand Context

**bigrigs.ai** - Brand focused on AI-powered tools for the trucking industry. Hazmate is the first application, establishing the foundation for future trucking-focused AI solutions that democratize compliance and make complex regulations accessible to drivers.

## 🌟 The Bigger Vision

**Democratizing Compliance for the Trucking Industry**

The trucking industry faces a fundamental challenge: complex, ever-changing regulations that are impossible for any individual to master, yet compliance is mandatory with severe penalties for violations. Our vision is to bridge this gap by making compliance accessible, actionable, and driver-friendly.

**Future Applications:**
- **Pre-Trip Inspection Assistant** - Comprehensive vehicle and load compliance checking
- **Route Compliance Monitor** - Real-time routing restrictions and permit requirements
- **Hours of Service Tracker** - Automated compliance monitoring and rest break alerts
- **Document Management** - Automated document validation and expiration tracking
- **Safety Incident Assistant** - Step-by-step guidance for accidents and spills

Every trucker who doesn't get fined, every accident that doesn't happen, every family that gets their driver home safely - that's the real impact we're building toward.

---

**Last Updated**: December 2024  
**Status**: MVP Complete with Driver-Focused Design, Regulatory Integration, Ready for Testing & Deployment  
**Next Session Goal**: Test with real documents, add pre-trip inspection features, or deploy to production 