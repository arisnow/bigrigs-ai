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

export interface HazmatAnalysisResult {
  documentIsValid: boolean;
  missingFields: string[];
  placards: string[];
  placardReasoning: string;
  incompatibilities: string[];
  complianceScore: string;
  lineItems: HazmatLineItem[];
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