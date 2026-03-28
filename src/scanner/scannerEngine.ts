import { ScanResult, FileData } from '../types';
import { SECRET_PATTERNS, Pattern } from './patterns';

function generateId(): string {
  return `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, char => map[char]);
}

function maskSecret(text: string, _pattern: Pattern): string {
  if (text.length <= 8) {
    return '*'.repeat(text.length);
  }
  const visibleStart = Math.min(4, Math.floor(text.length * 0.2));
  const visibleEnd = Math.min(4, Math.floor(text.length * 0.2));
  return text.substring(0, visibleStart) + '*'.repeat(text.length - visibleStart - visibleEnd) + text.substring(text.length - visibleEnd);
}

export function scanText(
  content: string,
  fileName?: string,
  patterns: Pattern[] = SECRET_PATTERNS
): ScanResult[] {
  const results: ScanResult[] = [];
  const lines = content.split('\n');

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    
    for (const pattern of patterns) {
      const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
      let match: RegExpExecArray | null;
      
      while ((match = regex.exec(line)) !== null) {
        const matchedText = match[0];
        
        const contextStart = Math.max(0, match.index - 30);
        const contextEnd = Math.min(line.length, match.index + matchedText.length + 30);
        let context = '';
        
        if (contextStart > 0) context += '...';
        context += line.substring(contextStart, contextEnd);
        if (contextEnd < line.length) context += '...';

        results.push({
          id: generateId(),
          type: pattern.type,
          pattern: pattern.name,
          severity: pattern.severity,
          line: lineIndex + 1,
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

  return results;
}

export function scanFiles(files: FileData[]): ScanResult[] {
  const allResults: ScanResult[] = [];
  
  for (const file of files) {
    const fileResults = scanText(file.content, file.name);
    allResults.push(...fileResults);
  }
  
  allResults.sort((a, b) => {
    if (a.severity === 'high' && b.severity !== 'high') return -1;
    if (a.severity !== 'high' && b.severity === 'high') return 1;
    if (a.severity === 'medium' && b.severity === 'low') return -1;
    if (a.severity === 'low' && b.severity === 'medium') return 1;
    return a.line - b.line;
  });

  return allResults;
}

export function getLineWithHighlights(
  content: string,
  lineNumber: number,
  findings: ScanResult[]
): { line: string; highlights: Array<{ start: number; end: number; severity: string }> } {
  const lines = content.split('\n');
  const line = lines[lineNumber - 1] || '';
  
  const highlights: Array<{ start: number; end: number; severity: string }> = [];
  
  for (const finding of findings) {
    if (finding.line === lineNumber) {
      highlights.push({
        start: finding.startIndex,
        end: finding.endIndex,
        severity: finding.severity
      });
    }
  }
  
  highlights.sort((a, b) => a.start - b.start);
  
  return { line: escapeHtml(line), highlights };
}

export function highlightCode(
  content: string,
  findings: ScanResult[],
  fileName?: string
): string {
  const lines = content.split('\n');
  const fileFindings = fileName 
    ? findings.filter(f => f.fileName === fileName)
    : findings;

  const lineHighlights = new Map<number, Array<{ start: number; end: number; severity: string }>>();
  
  for (const finding of fileFindings) {
    if (!lineHighlights.has(finding.line)) {
      lineHighlights.set(finding.line, []);
    }
    lineHighlights.get(finding.line)!.push({
      start: finding.startIndex,
      end: finding.endIndex,
      severity: finding.severity
    });
  }

  let result = '';
  
  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    const line = lines[i];
    const highlights = lineHighlights.get(lineNum) || [];
    
    if (highlights.length === 0) {
      result += `<span class="code-line"><span class="line-number">${String(lineNum).padStart(4, ' ')}</span><span class="line-content">${escapeHtml(line)}</span></span>\n`;
    } else {
      highlights.sort((a, b) => a.start - b.start);
      let highlightedLine = '';
      let lastEnd = 0;
      
      for (const hl of highlights) {
        if (hl.start > lastEnd) {
          highlightedLine += escapeHtml(line.substring(lastEnd, hl.start));
        }
        highlightedLine += `<mark class="highlight-${hl.severity}">${escapeHtml(line.substring(hl.start, hl.end))}</mark>`;
        lastEnd = hl.end;
      }
      
      if (lastEnd < line.length) {
        highlightedLine += escapeHtml(line.substring(lastEnd));
      }
      
      result += `<span class="code-line"><span class="line-number">${String(lineNum).padStart(4, ' ')}</span><span class="line-content">${highlightedLine}</span></span>\n`;
    }
  }
  
  return result;
}
