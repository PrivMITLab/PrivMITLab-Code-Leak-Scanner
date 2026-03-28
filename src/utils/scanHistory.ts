import { ScanResult } from '../types';

export interface ScanHistoryItem {
  id: string;
  timestamp: number;
  totalIssues: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
  filesScanned: number;
  linesScanned: number;
  results: ScanResult[];
}

const HISTORY_KEY = 'privmitlab_scan_history';
const MAX_HISTORY = 10;

export const loadScanHistory = (): ScanHistoryItem[] => {
  try {
    const stored = sessionStorage.getItem(HISTORY_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

export const saveScanHistory = (item: ScanHistoryItem): void => {
  try {
    const history = loadScanHistory();
    const updated = [item, ...history].slice(0, MAX_HISTORY);
    sessionStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save scan history', error);
  }
};

export const clearScanHistory = (): void => {
  try {
    sessionStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('Failed to clear scan history', error);
  }
};
