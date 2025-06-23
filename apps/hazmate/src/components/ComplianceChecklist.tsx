"use client";
import { useState } from "react";
import { HazmatAnalysisResult, DriverAction, PlacardPlacement } from "@bigrigs/types";

interface ComplianceChecklistProps {
  data: HazmatAnalysisResult;
}

interface ChecklistStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed' | 'failed' | 'skipped';
  items: ChecklistItem[];
  actionButton?: string;
  skipButton?: string;
  canTakePhoto?: boolean;
  aiAssisted?: boolean;
}

interface ChecklistItem {
  id: string;
  text: string;
  status: 'pending' | 'completed' | 'failed';
  details?: string;
  cfrReference?: string;
  canMarkComplete?: boolean;
  requiresPhoto?: boolean;
  photoUrl?: string;
  aiConfirmation?: boolean;
}

export default function ComplianceChecklist({ data }: ComplianceChecklistProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [expandedDetails, setExpandedDetails] = useState<Set<string>>(new Set());
  const [checklistState, setChecklistState] = useState<Record<string, ChecklistItem>>({});
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);

  // Build checklist steps from analysis data
  const checklistSteps: ChecklistStep[] = [
    {
      id: 'document',
      title: '📋 Document Check',
      description: 'Verify BOL/manifest compliance',
      status: data.documentIsValid ? 'completed' : 'failed',
      items: [
        {
          id: 'bol-valid',
          text: 'BOL is compliant with regulations',
          status: data.documentIsValid ? 'completed' : 'failed',
          details: 'Document meets 49 CFR 172.200-205 requirements',
          cfrReference: '49 CFR 172.200-205',
          canMarkComplete: true
        },
        {
          id: 'emergency-contact',
          text: 'Emergency contact number present',
          status: data.documentValidation.hasEmergencyContact ? 'completed' : 'failed',
          details: 'Required by CFR 172.604 for all hazmat shipments',
          cfrReference: '49 CFR 172.604',
          canMarkComplete: true
        },
        {
          id: 'shipper-certification',
          text: 'Shipper certification complete',
          status: data.documentValidation.hasShipperCertification ? 'completed' : 'failed',
          details: 'Must contain specific regulatory language',
          cfrReference: '49 CFR 172.204',
          canMarkComplete: true
        }
      ],
      actionButton: 'ALL GOOD',
      skipButton: 'SKIP FOR NOW'
    },
    {
      id: 'placards',
      title: '🚩 Placard Check',
      description: 'Install required placards',
      status: data.placardingRequirements.length === 0 ? 'completed' : 'pending',
      items: data.placardingRequirements.map((placement, index) => ({
        id: `placard-${index}`,
        text: `${placement.placardName} placard required`,
        status: placement.required ? 'pending' : 'completed',
        details: placement.reasoning,
        cfrReference: placement.cfrReference,
        canMarkComplete: true,
        requiresPhoto: true
      })),
      actionButton: 'TAKE PHOTO',
      skipButton: 'SKIP FOR NOW',
      canTakePhoto: true,
      aiAssisted: true
    },
    {
      id: 'packages',
      title: '📦 Package Check',
      description: 'Inspect package markings and integrity',
      status: 'pending',
      items: [
        {
          id: 'package-markings',
          text: 'Package markings match BOL',
          status: 'pending',
          details: 'UN numbers, proper shipping names, and hazard classes must match exactly',
          cfrReference: '49 CFR 172.300-338',
          canMarkComplete: true,
          requiresPhoto: true
        },
        {
          id: 'package-integrity',
          text: 'No damage, leaks, or spills',
          status: 'pending',
          details: 'Packages must be in proper condition for transportation',
          cfrReference: '49 CFR 173.24',
          canMarkComplete: true,
          requiresPhoto: true
        },
        {
          id: 'package-labels',
          text: 'Required labels present and correct',
          status: 'pending',
          details: 'Primary and subsidiary hazard labels must be affixed',
          cfrReference: '49 CFR 172.400-450',
          canMarkComplete: true,
          requiresPhoto: true
        }
      ],
      actionButton: 'TAKE PHOTO',
      skipButton: 'SKIP FOR NOW',
      canTakePhoto: true,
      aiAssisted: true
    },
    {
      id: 'emergency',
      title: '🚨 Emergency Info',
      description: 'Review emergency response procedures',
      status: 'pending',
      items: [
        {
          id: 'evacuation',
          text: `Evacuate ${data.driverSummary.emergencyInfo.evacuationDistance}`,
          status: 'completed',
          details: 'Distance to evacuate in case of incident',
          cfrReference: 'ERG Guide',
          canMarkComplete: true
        },
        {
          id: 'ppe',
          text: `PPE: ${data.driverSummary.emergencyInfo.ppeRequired.join(', ')}`,
          status: 'completed',
          details: 'Personal protective equipment required',
          cfrReference: 'ERG Guide',
          canMarkComplete: true
        },
        {
          id: 'fire-response',
          text: `Fire: ${data.driverSummary.emergencyInfo.fireResponse}`,
          status: 'completed',
          details: 'Fire response procedures',
          cfrReference: 'ERG Guide',
          canMarkComplete: true
        }
      ],
      actionButton: 'REVIEWED',
      skipButton: 'SKIP FOR NOW'
    }
  ];

  const toggleDetails = (stepId: string) => {
    const newExpanded = new Set(expandedDetails);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedDetails(newExpanded);
  };

  const markItemComplete = (itemId: string) => {
    setChecklistState(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], status: 'completed' as const }
    }));
  };

  const markItemFailed = (itemId: string) => {
    setChecklistState(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], status: 'failed' as const }
    }));
  };

  const markItemPending = (itemId: string) => {
    setChecklistState(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], status: 'pending' as const }
    }));
  };

  const takePhoto = async (itemId: string) => {
    setIsTakingPhoto(true);
    try {
      // Simulate photo capture and AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      setAiAnalyzing(true);
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulate AI confirmation
      setChecklistState(prev => ({
        ...prev,
        [itemId]: { 
          ...prev[itemId], 
          status: 'completed' as const,
          photoUrl: '/placeholder-photo.jpg',
          aiConfirmation: true
        }
      }));
    } catch (error) {
      console.error('Photo capture failed:', error);
    } finally {
      setIsTakingPhoto(false);
      setAiAnalyzing(false);
    }
  };

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'border-green-500 bg-green-50';
      case 'failed': return 'border-red-500 bg-red-50';
      case 'skipped': return 'border-gray-300 bg-gray-50';
      default: return 'border-blue-500 bg-blue-50';
    }
  };

  const getItemStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'failed': return '❌';
      default: return '⏳';
    }
  };

  // Calculate step status based on individual items
  const getStepStatus = (step: ChecklistStep) => {
    const items = step.items.map(item => checklistState[item.id] || item);
    const completedCount = items.filter(item => item.status === 'completed').length;
    const failedCount = items.filter(item => item.status === 'failed').length;
    const totalCount = items.length;

    if (failedCount > 0) return 'failed';
    if (completedCount === totalCount) return 'completed';
    if (completedCount > 0) return 'in-progress';
    return 'pending';
  };

  const getStepProgress = (step: ChecklistStep) => {
    const items = step.items.map(item => checklistState[item.id] || item);
    const completedCount = items.filter(item => item.status === 'completed').length;
    const totalCount = items.length;
    return { completed: completedCount, total: totalCount };
  };

  const canDrive = data.driverSummary.canDrive;
  const completedSteps = checklistSteps.filter(step => getStepStatus(step) === 'completed').length;
  const totalSteps = checklistSteps.length;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Hazmat Compliance Checklist
          </h1>
          <p className="text-gray-600 text-sm">
            {new Date().toLocaleDateString()} • {new Date().toLocaleTimeString()}
          </p>
        </div>

        {/* Overall Status */}
        <div className={`${canDrive ? 'bg-green-500' : 'bg-red-500'} text-white p-4 rounded-lg mb-6 text-center`}>
          <div className="text-2xl mb-2">
            {canDrive ? "✅" : "❌"}
          </div>
          <h2 className="text-xl font-bold mb-1">
            {canDrive ? "GOOD TO GO" : "FIX ISSUES FIRST"}
          </h2>
          <p className="text-sm opacity-90">
            {completedSteps} of {totalSteps} checks complete
          </p>
        </div>

        {/* Photo/AI Status */}
        {(isTakingPhoto || aiAnalyzing) && (
          <div className="bg-blue-500 text-white p-3 rounded-lg mb-4 text-center">
            <div className="text-lg mb-1">
              {isTakingPhoto ? "📸" : "🤖"}
            </div>
            <div className="text-sm">
              {isTakingPhoto ? "Taking photo..." : "AI analyzing..."}
            </div>
          </div>
        )}

        {/* Checklist Steps */}
        <div className="space-y-4">
          {checklistSteps.map((step, index) => (
            <div 
              key={step.id}
              className={`border-2 rounded-lg p-4 ${getStepStatusColor(getStepStatus(step))} ${
                index === currentStep ? 'ring-2 ring-blue-400' : ''
              }`}
            >
              {/* Step Header */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                  {step.aiAssisted && (
                    <p className="text-xs text-blue-600">🤖 AI Assisted</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {(() => {
                      const progress = getStepProgress(step);
                      return `${progress.completed} of ${progress.total} items complete`;
                    })()}
                  </p>
                </div>
                <div className="text-2xl">
                  {getItemStatusIcon(getStepStatus(step))}
                </div>
              </div>

              {/* Step Items */}
              <div className="space-y-2 mb-4">
                {step.items.map((item) => {
                  const itemState = checklistState[item.id] || item;
                  return (
                    <div key={item.id} className="flex items-start p-2 bg-white rounded border">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-sm font-medium">{itemState.text}</div>
                          <div className="text-lg">
                            {getItemStatusIcon(itemState.status)}
                          </div>
                        </div>
                        {itemState.details && (
                          <button 
                            onClick={() => toggleDetails(item.id)}
                            className="text-blue-600 text-xs hover:underline"
                          >
                            {expandedDetails.has(item.id) ? "Hide details" : "Why?"}
                          </button>
                        )}
                        {expandedDetails.has(item.id) && itemState.details && (
                          <div className="mt-1 p-2 bg-gray-50 rounded text-xs">
                            <div className="text-gray-700 mb-1">{itemState.details}</div>
                            {itemState.cfrReference && (
                              <div className="text-gray-500">Reference: {itemState.cfrReference}</div>
                            )}
                          </div>
                        )}
                        {itemState.photoUrl && (
                          <div className="mt-1 text-xs text-green-600">
                            📸 Photo verified by AI
                          </div>
                        )}
                      </div>
                      {/* Action Buttons */}
                      {itemState.canMarkComplete && (
                        <div className="flex space-x-1 ml-2">
                          {itemState.requiresPhoto ? (
                            <button
                              onClick={() => takePhoto(item.id)}
                              disabled={isTakingPhoto}
                              className={`px-3 py-2 rounded text-sm font-medium disabled:opacity-50 ${
                                itemState.status === 'completed' 
                                  ? 'bg-green-100 text-green-700 border border-green-300'
                                  : 'bg-blue-500 text-white'
                              }`}
                            >
                              {itemState.status === 'completed' ? '✅ Done' : '📸'}
                            </button>
                          ) : (
                            <div className="flex space-x-1">
                              <button
                                onClick={() => markItemComplete(item.id)}
                                className={`px-3 py-2 rounded text-sm font-medium ${
                                  itemState.status === 'completed' 
                                    ? 'bg-green-500 text-white'
                                    : 'bg-green-100 text-green-700 border border-green-300'
                                }`}
                              >
                                ✅
                              </button>
                              <button
                                onClick={() => markItemFailed(item.id)}
                                className={`px-3 py-2 rounded text-sm font-medium ${
                                  itemState.status === 'failed' 
                                    ? 'bg-red-500 text-white'
                                    : 'bg-red-100 text-red-700 border border-red-300'
                                }`}
                              >
                                ❌
                              </button>
                              {itemState.status !== 'pending' && (
                                <button
                                  onClick={() => markItemPending(item.id)}
                                  className="px-3 py-2 rounded text-sm font-medium bg-gray-100 text-gray-700 border border-gray-300"
                                >
                                  ↺
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Step Action Buttons */}
              <div className="flex space-x-2">
                {step.actionButton && (
                  <button 
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded font-medium text-sm"
                    onClick={() => {
                      if (index < checklistSteps.length - 1) {
                        setCurrentStep(index + 1);
                      }
                    }}
                  >
                    {step.actionButton}
                  </button>
                )}
                {step.skipButton && (
                  <button 
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded font-medium text-sm"
                    onClick={() => {
                      if (index < checklistSteps.length - 1) {
                        setCurrentStep(index + 1);
                      }
                    }}
                  >
                    {step.skipButton}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 mt-6">
          <p>Complete all checks before driving</p>
          <p>Tap ✅/❌ to mark items • 📸 for AI photo analysis</p>
        </div>
      </div>
    </div>
  );
} 