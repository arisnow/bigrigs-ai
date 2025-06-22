"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { HazmatAnalysisResult } from "@bigrigs/types";
import ResultsDisplay from "@/components/ResultsDisplay";

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
    cfrReferences: Array.isArray(d.cfrReferences) ? d.cfrReferences : []
  };
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<HazmatAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  return <ResultsDisplay data={data} />;
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