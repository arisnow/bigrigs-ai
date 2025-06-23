"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { HazmatAnalysisResult } from "@bigrigs/types";
import ResultsDisplay from "@/components/ResultsDisplay";
import DriverView from "@/components/DriverView";
import ComplianceChecklist from "@/components/ComplianceChecklist";

function normalizeResult(data: unknown): HazmatAnalysisResult {
  const d = data as Partial<HazmatAnalysisResult>;
  return {
    documentIsValid: d.documentIsValid ?? false,
    missingFields: Array.isArray(d.missingFields) ? d.missingFields : [],
    placards: Array.isArray(d.placards) ? d.placards : [],
    placardReasoning: d.placardReasoning ?? "",
    incompatibilities: Array.isArray(d.incompatibilities) ? d.incompatibilities : [],
    complianceScore: d.complianceScore ?? "0/10",
    lineItems: Array.isArray(d.lineItems) ? d.lineItems : [],
    documentValidation: d.documentValidation ?? {
      hasEmergencyContact: false,
      hasShipperCertification: false,
      hasDateOfAcceptance: false,
      hasProperSequence: false,
      hasRequiredQuantity: false,
      hasPackageDescription: false,
      missingCriticalFields: [],
      validationErrors: []
    },
    placardingRequirements: Array.isArray(d.placardingRequirements) ? d.placardingRequirements : [],
    safetyAlerts: Array.isArray(d.safetyAlerts) ? d.safetyAlerts : [],
    immediateActions: Array.isArray(d.immediateActions) ? d.immediateActions : [],
    complianceViolations: Array.isArray(d.complianceViolations) ? d.complianceViolations : [],
    cfrReferences: Array.isArray(d.cfrReferences) ? d.cfrReferences : [],
    driverSummary: d.driverSummary ?? {
      canDrive: false,
      primaryActions: [],
      placardPlacements: [],
      emergencyInfo: {
        evacuationDistance: "",
        ppeRequired: [],
        fireResponse: "",
        emergencyContact: ""
      },
      missingCriticalItems: [],
      complianceScore: "0/10"
    }
  };
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<HazmatAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'driver' | 'detailed' | 'checklist'>('checklist');

  useEffect(() => {
    const raw = searchParams.get("data");
    if (raw) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(raw));
        setData(normalizeResult(parsedData));
      } catch (e) {
        setError("Failed to parse results data. It may be malformed.");
        console.error(e);
      }
    } else {
      setError("No analysis data found in URL.");
    }
  }, [searchParams]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-red-500 text-lg font-semibold">Error</div>
        <div className="text-red-700 mt-2">{error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-lg">Loading results...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* View Toggle */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-md mx-auto">
          <div className="flex bg-gray-200 rounded-lg p-1">
            <button
              onClick={() => setViewMode('checklist')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'checklist'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ✅ Checklist
            </button>
            <button
              onClick={() => setViewMode('driver')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'driver'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🚛 Driver View
            </button>
            <button
              onClick={() => setViewMode('detailed')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'detailed'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📋 Detailed View
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'checklist' ? (
        <ComplianceChecklist data={data} />
      ) : viewMode === 'driver' ? (
        <DriverView data={data} />
      ) : (
        <ResultsDisplay data={data} />
      )}
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-lg">Loading...</div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
} 