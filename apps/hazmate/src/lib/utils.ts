import { HazmatAnalysisResult } from "@/types/hazmat";

/**
 * Validates if a file is an acceptable image or PDF
 */
export function isValidFileType(file: File): boolean {
  const validTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'application/pdf'
  ];
  return validTypes.includes(file.type);
}

/**
 * Formats file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validates hazmat analysis result structure
 */
export function isValidAnalysisResult(data: unknown): data is HazmatAnalysisResult {
  if (typeof data !== 'object' || data === null) return false;

  const result = data as HazmatAnalysisResult;

  return (
    typeof result.documentIsValid === 'boolean' &&
    Array.isArray(result.missingFields) &&
    Array.isArray(result.placards) &&
    Array.isArray(result.incompatibilities) &&
    typeof result.complianceScore === 'string' &&
    Array.isArray(result.lineItems) &&
    result.lineItems.every(item => 
      typeof item.lineNumber === 'number' &&
      typeof item.unNumber === 'string' &&
      typeof item.properShippingName === 'string' &&
      typeof item.ergSummary === 'object' &&
      item.ergSummary !== null
    )
  );
}

/**
 * Gets the appropriate background color class for compliance score
 */
export function getComplianceScoreColor(score: string): string {
  const numericScore = parseInt(score.split('/')[0]);
  const total = parseInt(score.split('/')[1]);
  const percentage = (numericScore / total) * 100;
  
  if (percentage >= 90) return 'bg-green-100';
  if (percentage >= 70) return 'bg-yellow-100';
  return 'bg-red-100';
}

/**
 * Formats UN number for display
 */
export function formatUNNumber(unNumber: string): string {
  return `UN${unNumber.padStart(4, '0')}`;
}

/**
 * Truncates text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
} 