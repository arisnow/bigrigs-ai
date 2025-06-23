export interface ErgSummary {
  un_number: string;
  guide_number: string;
  hazards: string[];
  ppe: string[];
  evacuation_distance: string;
  fire_response: string;
}

export interface HazmatLineItem {
  lineNumber: number;
  unNumber: string;
  properShippingName: string;
  hazardClass: string;
  packingGroup: string;
  quantity: string;
  ergSummary: ErgSummary;
}

// Driver-focused action types
export interface DriverAction {
  priority: 'critical' | 'high' | 'medium' | 'low';
  action: string;
  location?: string; // "front", "left side", "right side", etc.
  reasoning?: string;
  cfrReference?: string;
}

export interface PlacardPlacement {
  placardName: string;
  required: boolean;
  locations: string[]; // ["front", "left side", "right side"]
  reasoning: string;
  cfrReference: string;
}

export interface EmergencyInfo {
  evacuationDistance: string;
  ppeRequired: string[];
  fireResponse: string;
  emergencyContact?: string;
}

export interface DriverSummary {
  canDrive: boolean;
  primaryActions: DriverAction[];
  placardPlacements: PlacardPlacement[];
  emergencyInfo: EmergencyInfo;
  missingCriticalItems: string[];
  complianceScore: string;
}

// Enhanced compliance checking types
export interface DocumentValidation {
  hasEmergencyContact: boolean;
  hasShipperCertification: boolean;
  hasDateOfAcceptance: boolean;
  hasProperSequence: boolean;
  hasRequiredQuantity: boolean;
  hasPackageDescription: boolean;
  missingCriticalFields: string[];
  validationErrors: string[];
}

export interface PlacardingRequirement {
  placardName: string;
  required: boolean;
  quantityThreshold: string; // "any" or "1001+ lbs"
  reasoning: string;
  cfrReference: string;
}

export interface SafetyAlert {
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  actionRequired: string;
  cfrReference?: string;
}

export interface HazmatAnalysisResult {
  documentIsValid: boolean;
  missingFields: string[];
  placards: string[];
  placardReasoning: string;
  incompatibilities: string[];
  complianceScore: string;
  lineItems: HazmatLineItem[];
  // Enhanced compliance fields
  documentValidation: DocumentValidation;
  placardingRequirements: PlacardingRequirement[];
  safetyAlerts: SafetyAlert[];
  immediateActions: string[];
  complianceViolations: string[];
  cfrReferences: string[];
  // Driver-focused summary
  driverSummary: DriverSummary;
}

// New type for raw data extraction
export interface RawHazmatData {
  lineItems: {
    unNumber: string;
    properShippingName: string;
    hazardClass: string;
    packingGroup: string;
    quantity: string;
  }[];
  missingFields: string[]; // Fields the extractor noticed were missing
  // Enhanced extraction fields
  emergencyContact?: string;
  shipperCertification?: string;
  dateOfAcceptance?: string;
  totalQuantity?: string;
  packageDescription?: string;
  documentType?: 'bill_of_lading' | 'manifest' | 'other';
}

export interface UploadState {
  uploading: boolean;
  error: string;
}

export interface FileUploadData {
  name: string;
  type: string;
  size: number;
} 