"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { HazmatAnalysisResult, HazmatLineItem, SafetyAlert as SafetyAlertType } from "@bigrigs/types";

interface ResultsDisplayProps {
  data: HazmatAnalysisResult;
}

// Safety-first color scheme for mobile
const statusColors = {
  critical: "bg-red-500 text-white",
  warning: "bg-yellow-500 text-black", 
  safe: "bg-green-500 text-white",
  info: "bg-blue-500 text-white"
};

function SafetyAlert({ item }: { item: HazmatLineItem }) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-2xl mr-3">⚠️</span>
          <div>
            <h3 className="font-bold text-red-800 text-lg">
              {item.properShippingName}
            </h3>
            <p className="text-red-700 text-sm">
              UN {item.unNumber} • Class {item.hazardClass}
            </p>
          </div>
        </div>
        <button 
          onClick={() => setExpanded(!expanded)}
          className="text-red-600 font-bold text-lg"
        >
          {expanded ? "−" : "+"}
        </button>
      </div>
      
      {expanded && (
        <div className="mt-3 pt-3 border-t border-red-200">
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="bg-white p-2 rounded">
              <span className="font-bold text-red-800">🚨 EVACUATE:</span> {item.ergSummary.evacuation_distance}
            </div>
            <div className="bg-white p-2 rounded">
              <span className="font-bold text-red-800">🛡️ PPE:</span> {item.ergSummary.ppe.join(", ")}
            </div>
            <div className="bg-white p-2 rounded">
              <span className="font-bold text-red-800">🔥 FIRE:</span> {item.ergSummary.fire_response}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EnhancedSafetyAlert({ alert }: { alert: SafetyAlertType }) {
  const alertColors = {
    critical: "bg-red-50 border-red-500 text-red-800",
    warning: "bg-yellow-50 border-yellow-500 text-yellow-800",
    info: "bg-blue-50 border-blue-500 text-blue-800"
  };
  
  const alertIcons = {
    critical: "🚨",
    warning: "⚠️",
    info: "ℹ️"
  };
  
  return (
    <div className={`border-l-4 p-4 mb-4 ${alertColors[alert.severity]}`}>
      <div className="flex items-start">
        <span className="text-2xl mr-3">{alertIcons[alert.severity]}</span>
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">{alert.title}</h3>
          <p className="text-sm mb-2">{alert.message}</p>
          <div className="bg-white p-2 rounded text-sm">
            <span className="font-bold">Action Required:</span> {alert.actionRequired}
          </div>
          {alert.cfrReference && (
            <p className="text-xs mt-2 opacity-75">Reference: {alert.cfrReference}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ComplianceStatus({ data }: { data: HazmatAnalysisResult }) {
  const hasCriticalIssues = data.safetyAlerts.some(alert => alert.severity === 'critical') || 
                           data.complianceViolations.length > 0;
  
  const canDrive = data.documentIsValid && !hasCriticalIssues;
  
  return (
    <div className={`${canDrive ? statusColors.safe : statusColors.critical} p-4 rounded-lg mb-4`}>
      <div className="text-center">
        <div className="text-3xl mb-2">
          {canDrive ? "✅" : "❌"}
        </div>
        <h2 className="text-xl font-bold mb-1">
          {canDrive ? "SAFE TO DRIVE" : "DO NOT DRIVE"}
        </h2>
        <p className="text-sm opacity-90">
          {canDrive 
            ? "Document is compliant with regulations" 
            : hasCriticalIssues 
              ? "Critical compliance violations detected"
              : "Document has issues that must be addressed"
          }
        </p>
        {data.complianceScore && (
          <p className="text-xs mt-2 opacity-75">
            Compliance Score: {data.complianceScore}
          </p>
        )}
      </div>
    </div>
  );
}

function DocumentValidation({ data }: { data: HazmatAnalysisResult }) {
  const validation = data.documentValidation;
  const hasIssues = validation.missingCriticalFields.length > 0 || validation.validationErrors.length > 0;
  
  if (!hasIssues) return null;
  
  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
      <h3 className="font-bold text-orange-800 mb-2">📋 DOCUMENT VALIDATION ISSUES:</h3>
      <div className="space-y-2 text-sm">
        {validation.missingCriticalFields.length > 0 && (
          <div>
            <span className="font-bold text-orange-700">Missing Critical Fields:</span>
            <ul className="mt-1 ml-4">
              {validation.missingCriticalFields.map((field, index) => (
                <li key={index} className="text-orange-600">• {field}</li>
              ))}
            </ul>
          </div>
        )}
        {validation.validationErrors.length > 0 && (
          <div>
            <span className="font-bold text-orange-700">Validation Errors:</span>
            <ul className="mt-1 ml-4">
              {validation.validationErrors.map((error, index) => (
                <li key={index} className="text-orange-600">• {error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function QuickActions({ data }: { data: HazmatAnalysisResult }) {
  const hasIssues = !data.documentIsValid || 
                   data.missingFields.length > 0 || 
                   data.immediateActions.length > 0;
  
  if (!hasIssues) return null;
  
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <h3 className="font-bold text-yellow-800 mb-2">🚨 IMMEDIATE ACTIONS NEEDED:</h3>
      <div className="space-y-2 text-sm">
        {data.immediateActions.length > 0 ? (
          data.immediateActions.map((action, index) => (
            <div key={index} className="flex items-center">
              <span className="text-yellow-600 mr-2">⚡</span>
              <span>{action}</span>
            </div>
          ))
        ) : (
          <>
            {data.missingFields.length > 0 && (
              <div className="flex items-center">
                <span className="text-yellow-600 mr-2">📝</span>
                <span>Complete missing fields: {data.missingFields.join(", ")}</span>
              </div>
            )}
            {data.placards.length > 0 && (
              <div className="flex items-center">
                <span className="text-yellow-600 mr-2">🚩</span>
                <span>Install placards: {data.placards.join(", ")}</span>
              </div>
            )}
            {data.incompatibilities.length > 0 && (
              <div className="flex items-center">
                <span className="text-yellow-600 mr-2">⚠️</span>
                <span>Check incompatibilities: {data.incompatibilities.join(", ")}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function EnhancedPlacardInfo({ data }: { data: HazmatAnalysisResult }) {
  if (data.placardingRequirements.length === 0) return null;
  
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <h3 className="font-bold text-blue-800 mb-2">🚩 PLACARDING REQUIREMENTS:</h3>
      <div className="space-y-3">
        {data.placardingRequirements.map((req, index) => (
          <div key={index} className="bg-white p-3 rounded">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-blue-800">{req.placardName}</span>
              <span className={`text-xs px-2 py-1 rounded ${
                req.required ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'
              }`}>
                {req.required ? 'REQUIRED' : 'NOT REQUIRED'}
              </span>
            </div>
            <div className="text-sm text-blue-700 mb-2">
              <span className="font-semibold">Threshold:</span> {req.quantityThreshold}
            </div>
            <div className="text-sm text-blue-600 mb-2">
              {req.reasoning}
            </div>
            <div className="text-xs text-blue-500">
              {req.cfrReference}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComplianceViolations({ data }: { data: HazmatAnalysisResult }) {
  if (data.complianceViolations.length === 0) return null;
  
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <h3 className="font-bold text-red-800 mb-2">🚫 COMPLIANCE VIOLATIONS:</h3>
      <div className="space-y-2 text-sm">
        {data.complianceViolations.map((violation, index) => (
          <div key={index} className="bg-white p-2 rounded text-red-700">
            • {violation}
          </div>
        ))}
      </div>
    </div>
  );
}

function MaterialDetails({ data }: { data: HazmatAnalysisResult }) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-800">📦 MATERIALS ({data.lineItems.length})</h3>
        <button 
          onClick={() => setExpanded(!expanded)}
          className="text-blue-600 font-bold"
        >
          {expanded ? "Hide" : "Show"}
        </button>
      </div>
      
      {expanded && (
        <div className="mt-3 space-y-3">
          {data.lineItems.map((item) => (
            <div key={item.lineNumber} className="bg-white p-3 rounded border">
              <div className="font-bold text-gray-800">
                {item.properShippingName}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                UN {item.unNumber} • Class {item.hazardClass} • PG {item.packingGroup}
              </div>
              <div className="text-sm text-gray-600">
                Quantity: {item.quantity}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ResultsDisplay({ data }: ResultsDisplayProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Hazmat Analysis
          </h1>
          <p className="text-gray-600 text-sm">
            {new Date().toLocaleDateString()} • {new Date().toLocaleTimeString()}
          </p>
        </div>

        {/* Enhanced Safety Alerts - Show First */}
        {data.safetyAlerts.map((alert, index) => (
          <EnhancedSafetyAlert key={index} alert={alert} />
        ))}

        {/* Legacy Safety Alerts for backward compatibility */}
        {data.safetyAlerts.length === 0 && data.lineItems.map((item) => (
          <SafetyAlert key={item.lineNumber} item={item} />
        ))}

        {/* Can I Drive? - Most Important Question */}
        <ComplianceStatus data={data} />

        {/* Document Validation Issues */}
        <DocumentValidation data={data} />

        {/* Compliance Violations */}
        <ComplianceViolations data={data} />

        {/* What Do I Need To Do Right Now? */}
        <QuickActions data={data} />

        {/* Enhanced Placard Requirements */}
        <EnhancedPlacardInfo data={data} />

        {/* Legacy Placard Info for backward compatibility */}
        {data.placardingRequirements.length === 0 && data.placards.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="font-bold text-blue-800 mb-2">🚩 REQUIRED PLACARDS:</h3>
            <div className="space-y-2">
              {data.placards.map((placard, index) => (
                <div key={index} className="bg-white p-2 rounded text-sm">
                  <span className="font-bold">{placard}</span>
                </div>
              ))}
            </div>
            {data.placardReasoning && (
              <details className="mt-3">
                <summary className="text-blue-600 text-sm cursor-pointer">
                  Why these placards?
                </summary>
                <p className="mt-2 text-sm text-blue-700 bg-white p-2 rounded">
                  {data.placardReasoning}
                </p>
              </details>
            )}
          </div>
        )}

        {/* Material Details - Collapsed by Default */}
        <MaterialDetails data={data} />

        {/* Footer Actions */}
        <div className="space-y-3 mt-6">
          <button 
            className="w-full bg-blue-600 text-white rounded-lg py-3 px-4 font-bold text-lg"
            onClick={() => router.push("/")}
          >
            📷 Analyze Another Document
          </button>
          
          <div className="text-center text-xs text-gray-500">
            <p>Keep this document with your shipment</p>
            {data.cfrReferences.length > 0 && (
              <p className="mt-1">References: {data.cfrReferences.join(", ")}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 