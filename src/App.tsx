import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { ScanResult, FileData, InputMode } from './types';
import { scanText, scanFiles, highlightCode } from './scanner/scannerEngine';
import { readFiles, validateFiles, formatFileSize } from './utils/fileReader';
import { createScanReport, generateJsonReport, generateTxtReport, downloadReport } from './utils/reportGenerator';
import { SUPPORTED_EXTENSIONS } from './scanner/patterns';
import { loadScanHistory, saveScanHistory, clearScanHistory, ScanHistoryItem } from './utils/scanHistory';
import { sanitizeCode, getSanitizationSuggestion } from './utils/sanitizer';
import { generateQuickFixes } from './utils/quickFixes';

function App() {
  const [inputMode, setInputMode] = useState<InputMode>('paste');
  const [code, setCode] = useState('');
  const [files, setFiles] = useState<FileData[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [highlightedCode, setHighlightedCode] = useState('');
  const [selectedResult, setSelectedResult] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
  const [showQuickFix, setShowQuickFix] = useState<ScanResult | null>(null);
  const [sanitizedCode, setSanitizedCode] = useState('');
  const [showSanitized, setShowSanitized] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLDivElement>(null);
  const dragCounter = useRef(0);

  // Load scan history on mount
  useEffect(() => {
    setScanHistory(loadScanHistory());
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const canScan = inputMode === 'paste' ? code.trim().length > 0 : files.length > 0;
      // Ctrl/Cmd + K - Clear all
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        clearAll();
      }
      // Ctrl/Cmd + Enter - Scan
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (canScan) handleScan();
      }
      // Ctrl/Cmd + H - Toggle history
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        setShowHistory(prev => !prev);
      }
      // Ctrl/Cmd + / - Show shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setShowKeyboardShortcuts(prev => !prev);
      }
      // Escape - Close modals
      if (e.key === 'Escape') {
        setShowQuickFix(null);
        setShowKeyboardShortcuts(false);
        setShowHistory(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [inputMode, code, files]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const totalLines = useMemo(() => {
    if (inputMode === 'paste') {
      return code.split('\n').length;
    }
    return files.reduce((acc, f) => acc + f.content.split('\n').length, 0);
  }, [code, files, inputMode]);

  const totalIssues = useMemo(() => results.length, [results]);
  const highIssues = useMemo(() => results.filter(r => r.severity === 'high').length, [results]);
  const mediumIssues = useMemo(() => results.filter(r => r.severity === 'medium').length, [results]);
  const lowIssues = useMemo(() => results.filter(r => r.severity === 'low').length, [results]);

  const filteredResults = useMemo(() => {
    if (!searchQuery) return results;
    return results.filter(r => 
      r.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.matchedText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.line.toString().includes(searchQuery)
    );
  }, [results, searchQuery]);

  const handleScan = useCallback(async () => {
    setIsScanning(true);
    setScanComplete(false);
    setResults([]);
    setSelectedResult(null);
    setShowSanitized(false);

    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      let findings: ScanResult[] = [];
      let contentToHighlight = '';

      if (inputMode === 'paste') {
        if (!code.trim()) {
          showToast('Please enter some code to scan', 'error');
          setIsScanning(false);
          return;
        }
        findings = scanText(code);
        contentToHighlight = code;
      } else {
        if (files.length === 0) {
          showToast('Please upload or drop some files to scan', 'error');
          setIsScanning(false);
          return;
        }
        findings = scanFiles(files);
        contentToHighlight = files.map(f => f.content).join('\n');
      }

      setResults(findings);
      setHighlightedCode(highlightCode(contentToHighlight, findings));
      setSanitizedCode(sanitizeCode(contentToHighlight, findings));
      setScanComplete(true);

      // Save to history
      const historyItem: ScanHistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        totalIssues: findings.length,
        highIssues: findings.filter(r => r.severity === 'high').length,
        mediumIssues: findings.filter(r => r.severity === 'medium').length,
        lowIssues: findings.filter(r => r.severity === 'low').length,
        filesScanned: inputMode === 'paste' ? 1 : files.length,
        linesScanned: totalLines,
        results: findings,
      };
      saveScanHistory(historyItem);
      setScanHistory(loadScanHistory());

      if (findings.length === 0) {
        showToast('No secrets detected! Your code looks clean.', 'success');
      } else {
        showToast(`Found ${findings.length} potential issue${findings.length > 1 ? 's' : ''}`, 'info');
      }
    } catch (error) {
      showToast('An error occurred during scanning', 'error');
    } finally {
      setIsScanning(false);
    }
  }, [code, files, inputMode, showToast, totalLines]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const { valid, errors } = validateFiles(selectedFiles);
    
    if (errors.length > 0) {
      errors.forEach(err => showToast(err, 'error'));
    }

    if (valid.length > 0) {
      try {
        const fileData = await readFiles(selectedFiles);
        const validFileData = fileData.filter(f => 
          valid.some(v => v.name === f.name)
        );
        setFiles(prev => [...prev, ...validFileData].slice(0, 10));
        showToast(`${validFileData.length} file(s) uploaded successfully`, 'success');
      } catch (error) {
        showToast('Failed to read files', 'error');
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [showToast]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length === 0) return;

    const { valid, errors } = validateFiles(droppedFiles);
    
    if (errors.length > 0) {
      errors.forEach(err => showToast(err, 'error'));
    }

    if (valid.length > 0) {
      try {
        const fileData = await readFiles(droppedFiles);
        const validFileData = fileData.filter(f => 
          valid.some(v => v.name === f.name)
        );
        setFiles(prev => [...prev, ...validFileData].slice(0, 10));
        showToast(`${validFileData.length} file(s) added successfully`, 'success');
      } catch (error) {
        showToast('Failed to read dropped files', 'error');
      }
    }
  }, [showToast]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearAll = useCallback(() => {
    setCode('');
    setFiles([]);
    setResults([]);
    setHighlightedCode('');
    setScanComplete(false);
    setSelectedResult(null);
    setSearchQuery('');
    setShowSanitized(false);
    showToast('Cleared all data', 'info');
  }, [showToast]);

  const handleExportJson = useCallback(() => {
    if (results.length === 0 && !scanComplete) return;
    const report = createScanReport(results, totalLines, files.length);
    const content = generateJsonReport(report);
    downloadReport(content, `scan-report-${Date.now()}.json`, 'application/json');
    showToast('JSON report downloaded', 'success');
  }, [results, totalLines, files.length, scanComplete, showToast]);

  const handleExportTxt = useCallback(() => {
    if (results.length === 0 && !scanComplete) return;
    const report = createScanReport(results, totalLines, files.length);
    const content = generateTxtReport(report);
    downloadReport(content, `scan-report-${Date.now()}.txt`, 'text/plain');
    showToast('TXT report downloaded', 'success');
  }, [results, totalLines, files.length, scanComplete, showToast]);

  const handleCopyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Copied to clipboard', 'success');
    }).catch(() => {
      showToast('Failed to copy to clipboard', 'error');
    });
  }, [showToast]);

  const handlePrintReport = useCallback(() => {
    if (results.length === 0) return;
    const report = createScanReport(results, totalLines, files.length);
    const content = generateTxtReport(report);
    
    const printWindow = window.open('', '', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>PrivMITLab Scan Report</title>
            <style>
              body { font-family: monospace; padding: 20px; }
              pre { white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <pre>${content}</pre>
            <script>window.print(); window.close();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  }, [results, totalLines, files.length]);

  const scrollToLine = useCallback((line: number) => {
    setSelectedResult(line.toString());
    if (codeRef.current) {
      const lineElement = codeRef.current.querySelector(`[data-line="${line}"]`);
      if (lineElement) {
        lineElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  const canScan = inputMode === 'paste' ? code.trim().length > 0 : files.length > 0;

  const bgClass = theme === 'dark' ? 'bg-[#0a0e17]' : 'bg-gray-50';
  const textClass = theme === 'dark' ? 'text-slate-100' : 'text-gray-900';
  const cardBg = theme === 'dark' ? 'bg-[#111827]' : 'bg-white';
  const borderClass = theme === 'dark' ? 'border-slate-700/50' : 'border-gray-200';

  return (
    <div className={`min-h-screen ${bgClass} ${textClass} font-mono ${isFullScreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg border shadow-lg animate-slide-in ${
          toast.type === 'error' ? 'bg-red-900/90 border-red-500' :
          toast.type === 'success' ? 'bg-emerald-900/90 border-emerald-500' :
          'bg-cyan-900/90 border-cyan-500'
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-sm text-white">{toast.message}</span>
            <button onClick={() => setToast(null)} className="text-lg text-white opacity-70 hover:opacity-100">×</button>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      {showKeyboardShortcuts && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowKeyboardShortcuts(false)}>
          <div className={`${cardBg} rounded-xl p-6 max-w-md w-full border ${borderClass}`} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Keyboard Shortcuts</h3>
              <button onClick={() => setShowKeyboardShortcuts(false)} className="text-2xl opacity-70 hover:opacity-100">×</button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-700/30">
                <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}>Scan code</span>
                <kbd className="px-2 py-1 bg-slate-700/50 rounded">Ctrl + Enter</kbd>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-700/30">
                <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}>Clear all</span>
                <kbd className="px-2 py-1 bg-slate-700/50 rounded">Ctrl + K</kbd>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-700/30">
                <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}>Toggle history</span>
                <kbd className="px-2 py-1 bg-slate-700/50 rounded">Ctrl + H</kbd>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-700/30">
                <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}>Show shortcuts</span>
                <kbd className="px-2 py-1 bg-slate-700/50 rounded">Ctrl + /</kbd>
              </div>
              <div className="flex justify-between py-2">
                <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}>Close modal</span>
                <kbd className="px-2 py-1 bg-slate-700/50 rounded">Esc</kbd>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Fix Modal */}
      {showQuickFix && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowQuickFix(null)}>
          <div className={`${cardBg} rounded-xl p-6 max-w-2xl w-full border ${borderClass} my-8`} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Quick Fix Suggestions</h3>
              <button onClick={() => setShowQuickFix(null)} className="text-2xl opacity-70 hover:opacity-100">×</button>
            </div>
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-1 rounded text-xs ${
                  showQuickFix.severity === 'high' ? 'bg-red-900/30 text-red-400' :
                  showQuickFix.severity === 'medium' ? 'bg-orange-900/30 text-orange-400' :
                  'bg-yellow-900/30 text-yellow-400'
                }`}>
                  {showQuickFix.severity.toUpperCase()}
                </span>
                <span className="text-sm font-semibold">{showQuickFix.type}</span>
              </div>
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'} mb-4`}>
                {getSanitizationSuggestion(showQuickFix.type)}
              </p>
            </div>
            <div className="space-y-4">
              {generateQuickFixes(showQuickFix).map((fix, idx) => (
                <div key={idx} className={`p-4 rounded-lg border ${borderClass} ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm">{fix.title}</h4>
                    <button
                      onClick={() => handleCopyToClipboard(fix.code)}
                      className="text-xs px-2 py-1 bg-cyan-600 hover:bg-cyan-700 rounded transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                  <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'} mb-2`}>{fix.description}</p>
                  <pre className={`text-xs p-3 rounded ${theme === 'dark' ? 'bg-black/30' : 'bg-white'} overflow-x-auto`}>
                    <code>{fix.code}</code>
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className={`border-b ${borderClass} ${cardBg} sticky top-0 z-40`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <path d="M9 12l2 2 4-4"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold tracking-tight">PrivMITLab</h1>
                  <p className="text-xs text-slate-400">Code Leak Scanner</p>
                </div>
              </div>
              
              {/* Mobile action buttons */}
              <div className="flex sm:hidden items-center gap-2">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg hover:bg-slate-700/30 transition-colors"
                  title="Toggle theme"
                >
                  {theme === 'dark' ? '☀️' : '🌙'}
                </button>
                <button
                  onClick={() => setShowKeyboardShortcuts(true)}
                  className="p-2 rounded-lg hover:bg-slate-700/30 transition-colors text-sm"
                  title="Keyboard shortcuts"
                >
                  ⌨️
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6">
              <p className="hidden lg:block text-xs sm:text-sm text-slate-400 italic">
                Block Everything. Trust Nothing. Control Everything.
              </p>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-emerald-900/30 border border-emerald-700">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <path d="M9 12l2 2 4-4"/>
                  </svg>
                  <span className="text-[10px] sm:text-xs text-emerald-400 font-medium">100% Client-Side</span>
                </div>
                
                {/* Desktop action buttons */}
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    onClick={() => setShowHistory(true)}
                    className="p-2 rounded-lg hover:bg-slate-700/30 transition-colors"
                    title="View scan history (Ctrl+H)"
                  >
                    📊
                  </button>
                  <button
                    onClick={() => setIsFullScreen(prev => !prev)}
                    className="p-2 rounded-lg hover:bg-slate-700/30 transition-colors"
                    title="Toggle fullscreen"
                  >
                    {isFullScreen ? '⬇️' : '⬆️'}
                  </button>
                  <button
                    onClick={toggleTheme}
                    className="p-2 rounded-lg hover:bg-slate-700/30 transition-colors"
                    title="Toggle theme"
                  >
                    {theme === 'dark' ? '☀️' : '🌙'}
                  </button>
                  <button
                    onClick={() => setShowKeyboardShortcuts(true)}
                    className="p-2 rounded-lg hover:bg-slate-700/30 transition-colors"
                    title="Keyboard shortcuts (Ctrl+/)"
                  >
                    ⌨️
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Scan History Sidebar */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowHistory(false)}>
          <div
            className={`fixed right-0 top-0 h-full w-full sm:w-96 ${cardBg} border-l ${borderClass} p-4 sm:p-6 overflow-y-auto transform transition-transform`}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Scan History</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    clearScanHistory();
                    setScanHistory([]);
                    showToast('History cleared', 'info');
                  }}
                  className="text-xs px-2 py-1 bg-red-600 hover:bg-red-700 rounded transition-colors"
                >
                  Clear
                </button>
                <button onClick={() => setShowHistory(false)} className="text-2xl opacity-70 hover:opacity-100">×</button>
              </div>
            </div>
            
            {scanHistory.length === 0 ? (
              <p className={`text-sm text-center py-8 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                No scan history yet
              </p>
            ) : (
              <div className="space-y-3">
                {scanHistory.map((item) => (
                  <div key={item.id} className={`p-3 rounded-lg border ${borderClass} ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-400">
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                      <span className={`text-xs font-semibold ${
                        item.totalIssues === 0 ? 'text-emerald-400' :
                        item.highIssues > 0 ? 'text-red-400' :
                        'text-orange-400'
                      }`}>
                        {item.totalIssues} issues
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className={theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}>
                        <div className="font-semibold">{item.highIssues}</div>
                        <div className="text-[10px]">High</div>
                      </div>
                      <div className={theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}>
                        <div className="font-semibold">{item.mediumIssues}</div>
                        <div className="text-[10px]">Medium</div>
                      </div>
                      <div className={theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}>
                        <div className="font-semibold">{item.lowIssues}</div>
                        <div className="text-[10px]">Low</div>
                      </div>
                    </div>
                    <div className={`text-[10px] mt-2 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>
                      {item.filesScanned} files • {item.linesScanned} lines
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Privacy Banner */}
        <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg bg-cyan-900/20 border border-cyan-700/50 flex items-start sm:items-center gap-3`}>
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 flex-shrink-0 mt-0.5 sm:mt-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4M12 8h.01"/>
          </svg>
          <p className="text-xs sm:text-sm text-cyan-300">
            <strong>Your code never leaves your browser.</strong> All scanning happens locally. No telemetry. No external API calls. No data storage.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Left Panel - Input */}
          <div className="space-y-4">
            <div className={`${cardBg} rounded-xl border ${borderClass} overflow-hidden`}>
              {/* Tabs */}
              <div className={`flex border-b ${borderClass}`}>
                <button
                  onClick={() => setInputMode('paste')}
                  className={`flex-1 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors ${
                    inputMode === 'paste' 
                      ? 'text-cyan-400 border-b-2 border-cyan-400 bg-slate-800/50' 
                      : `${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-gray-600 hover:text-gray-900'}`
                  }`}
                >
                  📝 Paste
                </button>
                <button
                  onClick={() => setInputMode('upload')}
                  className={`flex-1 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors ${
                    inputMode === 'upload' 
                      ? 'text-cyan-400 border-b-2 border-cyan-400 bg-slate-800/50' 
                      : `${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-gray-600 hover:text-gray-900'}`
                  }`}
                >
                  📁 Upload
                </button>
                <button
                  onClick={() => setInputMode('dragdrop')}
                  className={`flex-1 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors ${
                    inputMode === 'dragdrop' 
                      ? 'text-cyan-400 border-b-2 border-cyan-400 bg-slate-800/50' 
                      : `${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-gray-600 hover:text-gray-900'}`
                  }`}
                >
                  🎯 Drop
                </button>
              </div>

              {/* Input Content */}
              <div className="p-3 sm:p-4">
                {inputMode === 'paste' && (
                  <div>
                    <textarea
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Paste your code here..."
                      className={`w-full h-64 sm:h-96 p-3 sm:p-4 rounded-lg border ${borderClass} ${
                        theme === 'dark' ? 'bg-black/30 text-slate-100' : 'bg-white text-gray-900'
                      } font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none`}
                    />
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                        {code.split('\n').length} lines • {code.length} characters
                      </span>
                      {code && (
                        <button
                          onClick={() => setCode('')}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {inputMode === 'upload' && (
                  <div className="space-y-4">
                    <div className={`border-2 border-dashed ${borderClass} rounded-lg p-6 sm:p-8 text-center`}>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept={SUPPORTED_EXTENSIONS.join(',')}
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 sm:px-6 py-2 sm:py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors text-sm sm:text-base"
                      >
                        Choose Files
                      </button>
                      <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'} mt-3 sm:mt-4`}>
                        Supported: .js, .ts, .py, .env, .json, .yaml, .yml, .java, .go, .cpp, .txt
                      </p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'} mt-2`}>
                        Max 10 files • 5MB per file
                      </p>
                    </div>

                    {files.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-semibold">{files.length} file(s) loaded</span>
                          <button
                            onClick={() => setFiles([])}
                            className="text-xs text-red-400 hover:text-red-300"
                          >
                            Clear All
                          </button>
                        </div>
                        {files.map((file, idx) => (
                          <div key={idx} className={`flex items-center justify-between p-2 sm:p-3 rounded-lg border ${borderClass} ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-gray-50'}`}>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs sm:text-sm font-medium truncate">{file.name}</p>
                              <p className={`text-[10px] sm:text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                                {formatFileSize(file.size)} • {file.content.split('\n').length} lines
                              </p>
                            </div>
                            <button
                              onClick={() => removeFile(idx)}
                              className="ml-2 text-red-400 hover:text-red-300 text-lg"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {inputMode === 'dragdrop' && (
                  <div
                    onDrop={handleDrop}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    className={`border-2 border-dashed rounded-lg p-8 sm:p-12 text-center transition-colors ${
                      isDragging 
                        ? 'border-cyan-500 bg-cyan-500/10' 
                        : `${borderClass} ${theme === 'dark' ? 'hover:border-cyan-700' : 'hover:border-cyan-300'}`
                    }`}
                  >
                    <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📂</div>
                    <p className="text-sm sm:text-base font-semibold mb-2">Drop your files here</p>
                    <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                      or click to browse
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept={SUPPORTED_EXTENSIONS.join(',')}
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-4 px-4 sm:px-6 py-2 sm:py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors text-sm sm:text-base"
                    >
                      Browse Files
                    </button>
                    <p className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'} mt-4`}>
                      Max 10 files • 5MB per file
                    </p>
                  </div>
                )}

                {inputMode === 'dragdrop' && files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-semibold">{files.length} file(s) loaded</span>
                      <button
                        onClick={() => setFiles([])}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Clear All
                      </button>
                    </div>
                    {files.map((file, idx) => (
                      <div key={idx} className={`flex items-center justify-between p-2 sm:p-3 rounded-lg border ${borderClass} ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-gray-50'}`}>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-medium truncate">{file.name}</p>
                          <p className={`text-[10px] sm:text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                            {formatFileSize(file.size)} • {file.content.split('\n').length} lines
                          </p>
                        </div>
                        <button
                          onClick={() => removeFile(idx)}
                          className="ml-2 text-red-400 hover:text-red-300 text-lg"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={handleScan}
                disabled={!canScan || isScanning}
                className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-lg font-semibold transition-all text-sm sm:text-base ${
                  canScan && !isScanning
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 shadow-lg shadow-cyan-500/20'
                    : 'bg-slate-700 cursor-not-allowed opacity-50'
                }`}
              >
                {isScanning ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Scanning...
                  </span>
                ) : (
                  '🔍 Scan Code'
                )}
              </button>
              <button
                onClick={clearAll}
                className={`px-4 sm:px-6 py-3 sm:py-4 rounded-lg font-semibold transition-colors border ${borderClass} hover:bg-slate-700/30 text-sm sm:text-base`}
              >
                🗑️ Clear
              </button>
            </div>

            {/* Sanitized Code Toggle */}
            {scanComplete && results.length > 0 && (
              <div className={`${cardBg} rounded-xl border ${borderClass} p-3 sm:p-4`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm sm:text-base font-semibold">Code Sanitization</h3>
                  <button
                    onClick={() => setShowSanitized(prev => !prev)}
                    className="text-xs sm:text-sm px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 rounded transition-colors"
                  >
                    {showSanitized ? 'Show Original' : 'Show Sanitized'}
                  </button>
                </div>
                {showSanitized && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                        Secrets have been masked
                      </p>
                      <button
                        onClick={() => handleCopyToClipboard(sanitizedCode)}
                        className="text-xs px-2 py-1 bg-emerald-600 hover:bg-emerald-700 rounded transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                    <pre className={`text-xs p-3 rounded-lg ${theme === 'dark' ? 'bg-black/30' : 'bg-gray-50'} overflow-x-auto max-h-48`}>
                      <code>{sanitizedCode}</code>
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Panel - Results */}
          <div className="space-y-4">
            {/* Statistics Dashboard */}
            {showStats && scanComplete && (
              <div className={`${cardBg} rounded-xl border ${borderClass} p-3 sm:p-4`}>
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="text-sm sm:text-base font-semibold">Security Summary</h3>
                  <button
                    onClick={() => setShowStats(false)}
                    className={`text-xs ${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    Hide
                  </button>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
                  <div className={`p-3 rounded-lg border ${borderClass} ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-gray-50'}`}>
                    <div className="text-xl sm:text-2xl font-bold">{totalIssues}</div>
                    <div className={`text-[10px] sm:text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>Total Issues</div>
                  </div>
                  <div className={`p-3 rounded-lg border border-red-500/30 ${theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'}`}>
                    <div className="text-xl sm:text-2xl font-bold text-red-400">{highIssues}</div>
                    <div className={`text-[10px] sm:text-xs ${theme === 'dark' ? 'text-red-300' : 'text-red-600'}`}>High Risk</div>
                  </div>
                  <div className={`p-3 rounded-lg border border-orange-500/30 ${theme === 'dark' ? 'bg-orange-900/20' : 'bg-orange-50'}`}>
                    <div className="text-xl sm:text-2xl font-bold text-orange-400">{mediumIssues}</div>
                    <div className={`text-[10px] sm:text-xs ${theme === 'dark' ? 'text-orange-300' : 'text-orange-600'}`}>Medium Risk</div>
                  </div>
                  <div className={`p-3 rounded-lg border border-yellow-500/30 ${theme === 'dark' ? 'bg-yellow-900/20' : 'bg-yellow-50'}`}>
                    <div className="text-xl sm:text-2xl font-bold text-yellow-400">{lowIssues}</div>
                    <div className={`text-[10px] sm:text-xs ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-600'}`}>Low Risk</div>
                  </div>
                </div>

                {/* Progress Bar */}
                {totalIssues > 0 && (
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}>Risk Distribution</span>
                      <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}>
                        {totalLines} lines scanned
                      </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden bg-slate-700/30 flex">
                      {highIssues > 0 && (
                        <div
                          className="bg-red-500"
                          style={{ width: `${(highIssues / totalIssues) * 100}%` }}
                        />
                      )}
                      {mediumIssues > 0 && (
                        <div
                          className="bg-orange-500"
                          style={{ width: `${(mediumIssues / totalIssues) * 100}%` }}
                        />
                      )}
                      {lowIssues > 0 && (
                        <div
                          className="bg-yellow-500"
                          style={{ width: `${(lowIssues / totalIssues) * 100}%` }}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Export Buttons */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <button
                    onClick={handleExportJson}
                    disabled={!scanComplete}
                    className={`flex-1 min-w-[100px] px-3 py-2 text-xs sm:text-sm rounded-lg transition-colors ${
                      scanComplete
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-slate-700 cursor-not-allowed opacity-50'
                    }`}
                  >
                    📥 JSON
                  </button>
                  <button
                    onClick={handleExportTxt}
                    disabled={!scanComplete}
                    className={`flex-1 min-w-[100px] px-3 py-2 text-xs sm:text-sm rounded-lg transition-colors ${
                      scanComplete
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-slate-700 cursor-not-allowed opacity-50'
                    }`}
                  >
                    📥 TXT
                  </button>
                  <button
                    onClick={handlePrintReport}
                    disabled={!scanComplete}
                    className={`flex-1 min-w-[100px] px-3 py-2 text-xs sm:text-sm rounded-lg transition-colors ${
                      scanComplete
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-slate-700 cursor-not-allowed opacity-50'
                    }`}
                  >
                    🖨️ Print
                  </button>
                </div>
              </div>
            )}

            {!showStats && scanComplete && (
              <button
                onClick={() => setShowStats(true)}
                className={`w-full px-4 py-2 text-sm rounded-lg border ${borderClass} ${theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-gray-50'} transition-colors`}
              >
                Show Statistics
              </button>
            )}

            {/* Search Results */}
            {results.length > 0 && (
              <div className={`${cardBg} rounded-xl border ${borderClass} p-3 sm:p-4`}>
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="🔍 Search results..."
                    className={`flex-1 px-3 py-2 rounded-lg border ${borderClass} ${
                      theme === 'dark' ? 'bg-black/30 text-slate-100' : 'bg-white text-gray-900'
                    } text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-xs text-slate-400 hover:text-slate-200"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                  {filteredResults.length} of {results.length} results
                </p>
              </div>
            )}

            {/* Results List */}
            <div className={`${cardBg} rounded-xl border ${borderClass} overflow-hidden`}>
              <div className={`p-3 sm:p-4 border-b ${borderClass}`}>
                <h3 className="text-sm sm:text-base font-semibold">
                  {scanComplete 
                    ? `Security Report (${filteredResults.length} issue${filteredResults.length !== 1 ? 's' : ''})`
                    : 'Scan Results'}
                </h3>
              </div>
              
              <div className={`p-3 sm:p-4 ${theme === 'dark' ? 'bg-slate-800/30' : 'bg-gray-50'}`}>
                {!scanComplete && (
                  <div className="text-center py-8 sm:py-12">
                    <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🔍</div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                      Run a scan to see results
                    </p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'} mt-2`}>
                      Press Ctrl+Enter to scan
                    </p>
                  </div>
                )}

                {scanComplete && filteredResults.length === 0 && results.length > 0 && (
                  <div className="text-center py-8 sm:py-12">
                    <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🔍</div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                      No results match your search
                    </p>
                  </div>
                )}

                {scanComplete && results.length === 0 && (
                  <div className="text-center py-8 sm:py-12">
                    <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">✅</div>
                    <p className="text-base sm:text-lg font-semibold text-emerald-400 mb-2">All Clear!</p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                      No secrets detected in your code
                    </p>
                  </div>
                )}

                {filteredResults.length > 0 && (
                  <div className="space-y-2 sm:space-y-3 max-h-[500px] sm:max-h-[600px] overflow-y-auto pr-2">
                    {filteredResults.map((result, idx) => (
                      <div
                        key={idx}
                        className={`p-3 sm:p-4 rounded-lg border transition-all cursor-pointer ${
                          selectedResult === result.line.toString()
                            ? 'border-cyan-500 bg-cyan-500/10'
                            : `${borderClass} ${theme === 'dark' ? 'bg-slate-800/50 hover:bg-slate-800' : 'bg-white hover:bg-gray-50'}`
                        }`}
                        onClick={() => scrollToLine(result.line)}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-1 rounded text-[10px] sm:text-xs font-semibold ${
                              result.severity === 'high' ? 'bg-red-900/30 text-red-400 border border-red-500/30' :
                              result.severity === 'medium' ? 'bg-orange-900/30 text-orange-400 border border-orange-500/30' :
                              'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30'
                            }`}>
                              {result.severity.toUpperCase()}
                            </span>
                            <span className="text-xs sm:text-sm font-semibold">{result.type}</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowQuickFix(result);
                            }}
                            className="text-xs px-2 py-1 bg-cyan-600 hover:bg-cyan-700 rounded transition-colors self-start"
                          >
                            💡 Fix
                          </button>
                        </div>
                        
                        <div className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'} mb-2`}>
                          {result.fileName && (
                            <div className="mb-1">
                              📄 <span className="font-medium">{result.fileName}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-3 flex-wrap">
                            <span>Line {result.line}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyToClipboard(result.matchedText);
                              }}
                              className="text-cyan-400 hover:text-cyan-300 text-xs"
                            >
                              📋 Copy
                            </button>
                          </div>
                        </div>
                        
                        <div className={`text-xs sm:text-sm p-2 sm:p-3 rounded ${theme === 'dark' ? 'bg-black/30' : 'bg-gray-100'} font-mono overflow-x-auto`}>
                          <code className="text-red-400">{result.matchedText}</code>
                        </div>
                        
                        <div className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'} mt-2`}>
                          💡 {getSanitizationSuggestion(result.type)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Code Preview with Highlighting */}
            {scanComplete && highlightedCode && (
              <div className={`${cardBg} rounded-xl border ${borderClass} overflow-hidden`}>
                <div className={`p-3 sm:p-4 border-b ${borderClass} flex items-center justify-between`}>
                  <h3 className="text-sm sm:text-base font-semibold">Code Preview</h3>
                  <button
                    onClick={() => handleCopyToClipboard(showSanitized ? sanitizedCode : highlightedCode)}
                    className="text-xs px-2 py-1 bg-cyan-600 hover:bg-cyan-700 rounded transition-colors"
                  >
                    📋 Copy
                  </button>
                </div>
                <div
                  ref={codeRef}
                  className={`p-3 sm:p-4 ${theme === 'dark' ? 'bg-black/30' : 'bg-gray-50'} overflow-x-auto max-h-64 sm:max-h-96 overflow-y-auto`}
                >
                  <pre className="text-xs sm:text-sm font-mono">
                    <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`border-t ${borderClass} ${cardBg} mt-8 sm:mt-12`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="text-xs sm:text-sm text-center sm:text-left">
              <p className={theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}>
                Made with ❤️ by <a href="https://github.com/PrivMITLab" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300">@PrivMITLab</a>
              </p>
              <p className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'} mt-1`}>
                Open Source • Privacy-First • Client-Side Only
              </p>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/PrivMITLab"
                target="_blank"
                rel="noopener noreferrer"
                className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
              >
                GitHub
              </a>
              <span className={theme === 'dark' ? 'text-slate-600' : 'text-gray-300'}>•</span>
              <button
                onClick={() => window.open('https://github.com/PrivMITLab', '_blank')}
                className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
              >
                Report Issue
              </button>
              <span className={theme === 'dark' ? 'text-slate-600' : 'text-gray-300'}>•</span>
              <button
                onClick={() => setShowKeyboardShortcuts(true)}
                className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
              >
                Shortcuts
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
