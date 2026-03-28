import { ScanResult } from '../types';

export const sanitizeCode = (code: string, results: ScanResult[]): string => {
  let sanitized = code;
  const lines = code.split('\n');
  
  // Sort results by line number in reverse to avoid index shifts
  const sortedResults = [...results].sort((a, b) => b.line - a.line);
  
  sortedResults.forEach(result => {
    const lineIndex = result.line - 1;
    if (lineIndex >= 0 && lineIndex < lines.length) {
      const line = lines[lineIndex];
      const pattern = result.pattern;
      
      // Replace matched pattern with masked version
      lines[lineIndex] = line.replace(new RegExp(pattern, 'g'), (match) => {
        // Keep first 4 and last 4 characters, mask the rest
        if (match.length <= 8) {
          return '***REDACTED***';
        }
        return match.substring(0, 4) + '***REDACTED***' + match.substring(match.length - 4);
      });
    }
  });
  
  sanitized = lines.join('\n');
  return sanitized;
};

export const getSanitizationSuggestion = (type: string): string => {
  const suggestions: Record<string, string> = {
    'API Key': 'Move to environment variables (.env file)',
    'AWS Access Key': 'Use AWS IAM roles or AWS Secrets Manager',
    'Private Key': 'Store in secure key management service',
    'Password': 'Use environment variables or secrets management',
    'JWT Token': 'Store in secure HTTP-only cookies',
    'Database Connection': 'Use environment variables for credentials',
    'OAuth Token': 'Store securely and refresh periodically',
    'Generic Secret': 'Move to environment variables',
  };
  
  return suggestions[type] || 'Move sensitive data to environment variables';
};
