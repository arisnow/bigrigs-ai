"use client";
import { useRouter } from "next/navigation";
import UploadForm from "@/components/UploadForm";
import { HazmatAnalysisResult } from "@/types/hazmat";

export default function Home() {
  const router = useRouter();

  const handleAnalysisComplete = (result: HazmatAnalysisResult) => {
    // Navigate to results page with data
    router.push(`/results?data=${encodeURIComponent(JSON.stringify(result))}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background text-foreground">
      <UploadForm onAnalysisComplete={handleAnalysisComplete} />
    </div>
  );
}
