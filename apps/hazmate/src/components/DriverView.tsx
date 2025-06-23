"use client";
import { useState } from "react";
import { HazmatAnalysisResult, DriverAction, PlacardPlacement, EmergencyInfo } from "@bigrigs/types";

interface DriverViewProps {
  data: HazmatAnalysisResult;
}

const priorityIcons = {
  critical: "🚨",
  high: "⚠️", 
  medium: "⚡",
  low: "ℹ️"
};

function DriverDecision({ data }: { data: HazmatAnalysisResult }) {
  const canDrive = data.driverSummary.canDrive;
  
  return (
    <div className={`${canDrive ? 'bg-green-500' : 'bg-red-500'} text-white p-6 rounded-lg mb-4 text-center`}>
      <div className="text-4xl mb-2">
        {canDrive ? "✅" : "❌"}
      </div>
      <h1 className="text-2xl font-bold mb-1">
        {canDrive ? "GOOD TO GO" : "STOP - NEED TO FIX"}
      </h1>
      <p className="text-sm opacity-90">
        {canDrive 
          ? "Document is compliant - you can drive" 
          : "Critical issues must be fixed before driving"
        }
      </p>
      {data.driverSummary.complianceScore && (
        <p className="text-xs mt-2 opacity-75">
          Compliance: {data.driverSummary.complianceScore}
        </p>
      )}
    </div>
  );
}

function ActionList({ actions }: { actions: DriverAction[] }) {
  const [expandedActions, setExpandedActions] = useState<Set<number>>(new Set());

  const toggleAction = (index: number) => {
    const newExpanded = new Set(expandedActions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedActions(newExpanded);
  };

  if (actions.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <h2 className="font-bold text-gray-800 text-lg mb-3">⚡ WHAT TO DO RIGHT NOW:</h2>
      <div className="space-y-2">
        {actions.map((action, index) => (
          <div key={index} className="border-l-4 border-gray-200 pl-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center flex-1">
                <span className="text-lg mr-2">{priorityIcons[action.priority]}</span>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">
                    {action.action}
                    {action.location && (
                      <span className="text-gray-600 text-sm ml-1">({action.location})</span>
                    )}
                  </div>
                  {action.reasoning && (
                    <button 
                      onClick={() => toggleAction(index)}
                      className="text-blue-600 text-sm mt-1 hover:underline"
                    >
                      {expandedActions.has(index) ? "Hide details" : "Why?"}
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            {expandedActions.has(index) && action.reasoning && (
              <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                <div className="text-gray-700 mb-1">{action.reasoning}</div>
                {action.cfrReference && (
                  <div className="text-gray-500 text-xs">
                    Reference: {action.cfrReference}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function PlacardGuide({ placements }: { placements: PlacardPlacement[] }) {
  if (placements.length === 0) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <h2 className="font-bold text-blue-800 text-lg mb-3">🚩 PLACARDS NEEDED:</h2>
      <div className="space-y-3">
        {placements.map((placement, index) => (
          <div key={index} className="bg-white p-3 rounded border">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-blue-800 text-lg">
                [{placement.placardName}]
              </span>
              <span className={`text-xs px-2 py-1 rounded ${
                placement.required ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'
              }`}>
                {placement.required ? 'REQUIRED' : 'NOT REQUIRED'}
              </span>
            </div>
            
            <div className="text-sm text-blue-700 mb-2">
              <span className="font-semibold">Place on:</span> {placement.locations.join(", ")}
            </div>
            
            <details className="text-sm">
              <summary className="text-blue-600 cursor-pointer hover:underline">
                Why this placard?
              </summary>
              <div className="mt-2 p-2 bg-blue-50 rounded">
                <div className="text-blue-700 mb-1">{placement.reasoning}</div>
                <div className="text-blue-500 text-xs">{placement.cfrReference}</div>
              </div>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmergencyReference({ emergencyInfo }: { emergencyInfo: EmergencyInfo }) {
  if (!emergencyInfo.evacuationDistance && !emergencyInfo.fireResponse) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <h2 className="font-bold text-red-800 text-lg mb-3">🚨 IN THE EVENT OF AN EMERGENCY:</h2>
      <div className="space-y-2 text-sm">
        {emergencyInfo.evacuationDistance && (
          <div className="bg-white p-2 rounded">
            <span className="font-bold text-red-800">🚨 EVACUATE:</span> {emergencyInfo.evacuationDistance}
          </div>
        )}
        {emergencyInfo.ppeRequired.length > 0 && (
          <div className="bg-white p-2 rounded">
            <span className="font-bold text-red-800">🛡️ PPE:</span> {emergencyInfo.ppeRequired.join(", ")}
          </div>
        )}
        {emergencyInfo.fireResponse && (
          <div className="bg-white p-2 rounded">
            <span className="font-bold text-red-800">🔥 FIRE:</span> {emergencyInfo.fireResponse}
          </div>
        )}
        {emergencyInfo.emergencyContact && (
          <div className="bg-white p-2 rounded">
            <span className="font-bold text-red-800">📞 CALL:</span> {emergencyInfo.emergencyContact}
          </div>
        )}
      </div>
    </div>
  );
}

function MissingItems({ items }: { items: string[] }) {
  if (items.length === 0) return null;

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
      <h2 className="font-bold text-orange-800 text-lg mb-2">❌ MISSING CRITICAL ITEMS:</h2>
      <div className="space-y-1">
        {items.map((item, index) => (
          <div key={index} className="flex items-center">
            <span className="text-orange-600 mr-2">•</span>
            <span className="text-orange-700">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DriverView({ data }: DriverViewProps) {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Driver View
          </h1>
          <p className="text-gray-600 text-sm">
            {new Date().toLocaleDateString()} • {new Date().toLocaleTimeString()}
          </p>
        </div>

        {/* Can I Drive? */}
        <DriverDecision data={data} />

        {/* Missing Critical Items */}
        <MissingItems items={data.driverSummary.missingCriticalItems} />

        {/* What to do right now */}
        <ActionList actions={data.driverSummary.primaryActions} />

        {/* Placard Guide */}
        <PlacardGuide placements={data.driverSummary.placardPlacements} />

        {/* Emergency Reference */}
        <EmergencyReference emergencyInfo={data.driverSummary.emergencyInfo} />

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 mt-6">
          <p>Keep this document with your shipment</p>
          <p>Tap items for more details</p>
        </div>
      </div>
    </div>
  );
} 