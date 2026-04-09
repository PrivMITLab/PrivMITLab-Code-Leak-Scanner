import { ScanResult, FileData } from '../types';
import { SECRET_PATTERNS, Pattern } from './patterns';

// ----------------------------------------------------------------------
//  Utilities
// ----------------------------------------------------------------------

function generateId(): string {
  return `scan_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return text.replace(/[&<>"']/g, ch => map[ch]);
}

/**
 * Advanced masking:
 * - Very short (≤8) → fully masked.
 * - Short (9‑15) → first 2 + last 2.
 * - Medium (16‑31) → first 4 + last 4.
 * - Long (≥32) → first 6 + last 6.
 * - JWT tokens → keep header & signature, mask payload.
 */
function maskSecret(secret: string, pattern: Pattern): string {
  const len = secret.length;
  if (len <= 8) return '*'.repeat(len);

  // JWT special handling
  if (pattern.name === 'JWT Token' && secret.includes('.')) {
    const parts = secret.split('.');
    if (parts.length === 3) {
      const maskedPayload = '*'.repeat(parts[1].length);
      return `${parts[0]}.${maskedPayload}.${parts[2]}`;
    }
  }

  let visibleStart: number, visibleEnd: number;
  if (len <= 15) {
    visibleStart = 2;
    visibleEnd = 2;
  } else if (len <= 31) {
    visibleStart = 4;
    visibleEnd = 4;
  } else {
    visibleStart = 6;
    visibleEnd = 6;
  }

  const start = secret.slice(0, visibleStart);
  const end = secret.slice(-visibleEnd);
  const middle = '*'.repeat(len - visibleStart - visibleEnd);
  return start + middle + end;
}

/**
 * Optionally skip comment lines to reduce false positives
 */
function shouldSkipLine(line: string, ignoreComments: boolean = true): boolean {
  if (!ignoreComments) return false;
  const trimmed = line.trim();
  return trimmed.startsWith('//') || trimmed.startsWith('#');
}

// ----------------------------------------------------------------------
//  Core scanning logic (advanced, performance-optimized)
// ----------------------------------------------------------------------

export function scanText(
  content: string,
  fileName?: string,
  patterns: Pattern[] = SECRET_PATTERNS,
  options?: { ignoreComments?: boolean }
): ScanResult[] {
  const ignoreComments = options?.ignoreComments ?? true;
  const results: ScanResult[] = [];

  // Normalize line endings
  const normalized = content.replace(/\r\n/g, '\n');
  const lines = normalized.split('\n');

  // Pre‑compile regexes once (performance)
  const compiledPatterns = patterns.map(p => ({
    ...p,
    regex: new RegExp(p.regex.source, p.regex.flags)
  }));

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    if (shouldSkipLine(line, ignoreComments)) continue;

    for (const pattern of compiledPatterns) {
      pattern.regex.lastIndex = 0; // reset because we reuse
      let match: RegExpExecArray | null;

      while ((match = pattern.regex.exec(line)) !== null) {
        const matchedText = match[0];

        // Build context (30 chars before/after)
        const ctxStart = Math.max(0, match.index - 30);
        const ctxEnd = Math.min(line.length, match.index + matchedText.length + 30);
        let context = '';
        if (ctxStart > 0) context += '...';
        context += line.substring(ctxStart, ctxEnd);
        if (ctxEnd < line.length) context += '...';

        results.push({
          id: generateId(),
          type: pattern.type,
          pattern: pattern.name,
          severity: pattern.severity,
          line: lineIdx + 1,
          column: match.index + 1,
          matchedText: maskSecret(matchedText, pattern),
          context: escapeHtml(context),
          fileName,
          startIndex: match.index,
          endIndex: match.index + matchedText.length
        });
      }
    }
  }

  // Deduplicate identical findings (same file, line, column, pattern)
  const unique = new Map<string, ScanResult>();
  for (const r of results) {
    const key = `${r.fileName}|${r.line}|${r.column}|${r.pattern}`;
    if (!unique.has(key)) unique.set(key, r);
  }

  return Array.from(unique.values());
}

export function scanFiles(
  files: FileData[],
  options?: { ignoreComments?: boolean }
): ScanResult[] {
  const allResults: ScanResult[] = [];
  for (const file of files) {
    const fileResults = scanText(file.content, file.name, SECRET_PATTERNS, options);
    allResults.push(...fileResults);
  }

  // Sort: high severity first, then medium, then low, then by line number
  allResults.sort((a, b) => {
    const rank = { high: 0, medium: 1, low: 2 };
    const rankDiff = rank[a.severity] - rank[b.severity];
    if (rankDiff !== 0) return rankDiff;
    return a.line - b.line;
  });

  return allResults;
}

// ----------------------------------------------------------------------
//  Highlighting helpers (signatures unchanged)
// ----------------------------------------------------------------------

export function getLineWithHighlights(
  content: string,
  lineNumber: number,
  findings: ScanResult[]
): { line: string; highlights: Array<{ start: number; end: number; severity: string }> } {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const line = lines[lineNumber - 1] || '';
  const highlights = findings
    .filter(f => f.line === lineNumber)
    .map(f => ({
      start: f.startIndex,
      end: f.endIndex,
      severity: f.severity
    }));
  highlights.sort((a, b) => a.start - b.start);
  return { line: escapeHtml(line), highlights };
}

export function highlightCode(
  content: string,
  findings: ScanResult[],
  fileName?: string
): string {
  const normalized = content.replace(/\r\n/g, '\n');
  const lines = normalized.split('\n');
  const fileFindings = fileName
    ? findings.filter(f => f.fileName === fileName)
    : findings;

  // Group highlights by line number
  const lineHighlights = new Map<number, Array<{ start: number; end: number; severity: string }>>();
  for (const f of fileFindings) {
    const list = lineHighlights.get(f.line) || [];
    list.push({ start: f.startIndex, end: f.endIndex, severity: f.severity });
    lineHighlights.set(f.line, list);
  }

  let result = '';
  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    const rawLine = lines[i];
    const highlights = lineHighlights.get(lineNum) || [];

    if (highlights.length === 0) {
      result += `<span class="code-line"><span class="line-number">${String(lineNum).padStart(4, ' ')}</span><span class="line-content">${escapeHtml(rawLine)}</span></span>\n`;
    } else {
      highlights.sort((a, b) => a.start - b.start);
      let highlighted = '';
      let lastIdx = 0;
      for (const hl of highlights) {
        if (hl.start > lastIdx) {
          highlighted += escapeHtml(rawLine.substring(lastIdx, hl.start));
        }
        highlighted += `<mark class="highlight-${hl.severity}">${escapeHtml(rawLine.substring(hl.start, hl.end))}</mark>`;
        lastIdx = hl.end;
      }
      if (lastIdx < rawLine.length) {
        highlighted += escapeHtml(rawLine.substring(lastIdx));
      }
      result += `<span class="code-line"><span class="line-number">${String(lineNum).padStart(4, ' ')}</span><span class="line-content">${highlighted}</span></span>\n`;
    }
  }
  return result;
}

// ----------------------------------------------------------------------
//  Optional: generate a full ScanReport (not in original, but useful)
// ----------------------------------------------------------------------

export function generateScanReport(
  files: FileData[],
  findings: ScanResult[]
): ScanReport {
  const totalLines = files.reduce((sum, f) => sum + f.content.split(/\r?\n/).length, 0);
  const summary = {
    total: findings.length,
    high: findings.filter(f => f.severity === 'high').length,
    medium: findings.filter(f => f.severity === 'medium').length,
    low: findings.filter(f => f.severity === 'low').length
  };
  return {
    timestamp: new Date().toISOString(),
    totalLines,
    filesScanned: files.length,
    findings,
    summary
  };
}
