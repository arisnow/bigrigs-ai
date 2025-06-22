"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { HazmatAnalysisResult } from "@/types/hazmat";
import ResultsDisplay from "@/components/ResultsDisplay";

function ResultsContent() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<HazmatAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw = searchParams.get("data");
    if (raw) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(raw));
        setData(parsedData);
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