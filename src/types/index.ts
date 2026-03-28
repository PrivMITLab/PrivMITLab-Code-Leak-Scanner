export interface ScanResult {
  id: string;
  type: string;
  pattern: string;
  severity: 'high' | 'medium' | 'low';
  line: number;
  column: number;
  matchedText: string;
  context: string;
  fileName?: string;
  startIndex: number;
  endIndex: number;
}

export interface ScanReport {
  timestamp: string;
  totalLines: number;
  filesScanned: number;
  findings: ScanResult[];
  summary: {
    total: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface FileData {
  name: string;
  content: string;
  size: number;
}

export type InputMode = 'paste' | 'upload' | 'dragdrop';
