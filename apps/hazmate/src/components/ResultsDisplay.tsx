"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { HazmatAnalysisResult, HazmatLineItem } from "@bigrigs/types";

interface ResultsDisplayProps {
  data: HazmatAnalysisResult;
}

const icons = {
  placards: "🚩",
  missing_fields: "❗",
  compliance_score: "✅",
  incompatibilities: "🚫",
  document_valid: "✔️",
  line_item: "📦",
};

function ResultCard({ icon, title, content, color = "bg-white" }: { icon: string, title: string, content: React.ReactNode, color?: string }) {
  return (
    <div className={`${color} rounded-lg shadow p-4`}>
      <div className="flex items-start gap-4">
        <span className="text-2xl mt-1">{icon}</span>
        <div className="w-full">
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <div className="text-gray-700 mt-1">{content}</div>
        </div>
      </div>
    </div>
  );
}

function LineItemCard({ item }: { item: HazmatLineItem }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <h4 className="font-bold text-lg text-gray-800">
        Line Item #{item.lineNumber}: {item.properShippingName}
      </h4>
      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <div><strong>UN Number:</strong> {item.unNumber}</div>
        <div><strong>Hazard Class:</strong> {item.hazardClass}</div>
        <div><strong>Packing Group:</strong> {item.packingGroup}</div>
        <div><strong>Quantity:</strong> {item.quantity}</div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h5 className="font-semibold text-gray-700">ERG Summary (Guide #{item.ergSummary.guide_number})</h5>
        <div className="mt-2 space-y-1 text-xs text-gray-600">
          <p><strong>Hazards:</strong> {item.ergSummary.hazards.join(", ")}</p>
          <p><strong>PPE:</strong> {item.ergSummary.ppe.join(", ")}</p>
          <p><strong>Evacuation:</strong> {item.ergSummary.evacuation_distance}</p>
          <p><strong>Fire Response:</strong> {item.ergSummary.fire_response}</p>
        </div>
      </div>
    </div>
  );
}

export default function ResultsDisplay({ data }: ResultsDisplayProps) {
  const router = useRouter();
  const [showReasoning, setShowReasoning] = useState(false);

  return (
    <div className="flex flex-col items-center min-h-screen p-4 bg-gray-50 text-gray-800">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-900">Compliance Analysis</h1>
        
        {/* Document Level Summary */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">Document Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ResultCard 
              icon={icons.document_valid} 
              title="Document Validity"
              content={data.documentIsValid ? "Valid" : "Invalid"}
              color={data.documentIsValid ? "bg-green-100" : "bg-red-100"}
            />
            <ResultCard 
              icon={icons.compliance_score} 
              title="Compliance Score"
              content={data.complianceScore}
              color="bg-blue-100"
            />
            <ResultCard 
              icon={icons.placards} 
              title="Placards Needed"
              content={
                <div>
                  <p className="font-semibold">{data.placards.join(", ") || "None"}</p>
                  {data.placardReasoning && (
                    <div className="mt-2">
                      <button 
                        onClick={() => setShowReasoning(!showReasoning)}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {showReasoning ? "Hide Reasoning" : "Show Reasoning"}
                      </button>
                      {showReasoning && (
                        <p className="mt-2 text-xs text-gray-600 bg-gray-100 p-2 rounded">
                          {data.placardReasoning}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              }
              color="bg-yellow-100"
            />
            {data.missingFields?.length > 0 && (
              <ResultCard 
                icon={icons.missing_fields} 
                title="Missing Fields"
                content={data.missingFields.join(", ")}
                color="bg-orange-100"
              />
            )}
            {data.incompatibilities?.length > 0 && (
              <ResultCard 
                icon={icons.incompatibilities} 
                title="Incompatibilities"
                content={data.incompatibilities.join(", ")}
                color="bg-red-100"
              />
            )}
          </div>
        </div>

        {/* Line Items Analysis */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">Hazardous Materials Details</h2>
          <div className="space-y-4">
            {data.lineItems.map((item) => (
              <LineItemCard key={item.lineNumber} item={item} />
            ))}
          </div>
        </div>
      
        <div className="text-center mt-8">
          <button 
            className="bg-blue-600 text-white rounded-lg py-3 px-8 text-lg font-semibold hover:bg-blue-700 transition-colors shadow-md" 
            onClick={() => router.push("/")}
          >
            Analyze Another Document
          </button>
        </div>
      </div>
    </div>
  );
} 