import { ScanReport, ScanResult } from '../types';

export function generateJsonReport(report: ScanReport): string {
  return JSON.stringify(report, null, 2);
}

export function generateTxtReport(report: ScanReport): string {
  const lines: string[] = [];
  const separator = '='.repeat(60);
  const subSeparator = '-'.repeat(60);

  lines.push(separator);
  lines.push('         PRIVMITLAB CODE LEAK SCANNER REPORT');
  lines.push(separator);
  lines.push('');
  lines.push(`Generated: ${new Date(report.timestamp).toISOString()}`);
  lines.push(`Files Scanned: ${report.filesScanned}`);
  lines.push(`Total Lines: ${report.totalLines}`);
  lines.push('');
  lines.push('--- SUMMARY ---');
  lines.push(`Total Issues Found: ${report.summary.total}`);
  lines.push(`  High Risk:   ${report.summary.high}`);
  lines.push(`  Medium Risk: ${report.summary.medium}`);
  lines.push(`  Low Risk:    ${report.summary.low}`);
  lines.push('');

  if (report.summary.total > 0) {
    lines.push(subSeparator);
    lines.push('                    DETAILED FINDINGS');
    lines.push(subSeparator);
    lines.push('');

    const severityOrder: Array<'high' | 'medium' | 'low'> = ['high', 'medium', 'low'];
    
    for (const severity of severityOrder) {
      const findings = report.findings.filter(f => f.severity === severity);
      
      if (findings.length > 0) {
        lines.push(`[${severity.toUpperCase()} RISK]`.padEnd(20) + `${findings.length} issue(s)`);
        lines.push('');
        
        for (const finding of findings) {
          lines.push(`  Type: ${finding.type}`);
          lines.push(`  Pattern: ${finding.pattern}`);
          lines.push(`  Location: ${finding.fileName ? `${finding.fileName}:` : ''}Line ${finding.line}`);
          lines.push(`  Matched: ${finding.matchedText}`);
          lines.push(`  Context: ${finding.context}`);
          lines.push('');
        }
      }
    }
  } else {
    lines.push('');
    lines.push('              ✓ NO SECRETS DETECTED');
    lines.push('');
    lines.push('    Your code appears to be clean!');
    lines.push('');
  }

  lines.push(separator);
  lines.push('     Privacy-First Security by PrivMITLab');
  lines.push('     Your code never left your browser.');
  lines.push(separator);

  return lines.join('\n');
}

export function downloadReport(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function createScanReport(
  findings: ScanResult[],
  totalLines: number,
  filesScanned: number
): ScanReport {
  return {
    timestamp: new Date().toISOString(),
    totalLines,
    filesScanned,
    findings,
    summary: {
      total: findings.length,
      high: findings.filter(f => f.severity === 'high').length,
      medium: findings.filter(f => f.severity === 'medium').length,
      low: findings.filter(f => f.severity === 'low').length
    }
  };
}
