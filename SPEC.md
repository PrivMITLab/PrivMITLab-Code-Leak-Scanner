# PrivMITLab Code Leak Scanner - Specification v2.0

## 1. Concept & Vision

A privacy-first code security tool that scans for accidentally exposed secrets, API keys, tokens, and passwords entirely within the browser. Built for developers who need to audit their code before publishing or pushing to GitHub. The tool embodies a "trust nothing, block everything" philosophy—paranoid by design, transparent in execution.

**Core Promise:** Your code never leaves your browser. Zero telemetry. Zero external calls. 100% client-side.

## 1.1 Version 2.0 New Features

### Enhanced User Experience
- **Theme System**: Dark/Light mode toggle with persistent preference
- **Keyboard Shortcuts**: Full keyboard navigation support
- **Scan History**: Session storage of last 10 scans with statistics
- **Search & Filter**: Real-time filtering of scan results
- **Full Screen Mode**: Distraction-free scanning experience
- **Toast Notifications**: Non-intrusive feedback system
- **Modal Dialogs**: Contextual help and information

### Advanced Scanning Features
- **Quick Fix Suggestions**: Context-aware code examples for each issue type
- **Code Sanitization**: Automatic secret redaction with preview
- **Copy to Clipboard**: One-click copy for code snippets
- **Multiple Export Formats**: JSON, TXT, and print-ready reports
- **Statistics Dashboard**: Visual risk distribution with progress bars
- **Enhanced Code Highlighting**: Better visual distinction of issues

### Responsive Design
- **Mobile-First**: Optimized for all screen sizes
- **Touch-Friendly**: Enhanced touch targets for mobile devices
- **Adaptive Layout**: Smart grid system that adjusts to viewport
- **Collapsible Panels**: Better space utilization on small screens

## 2. Design Language

### Aesthetic Direction
Cybersecurity terminal aesthetic meets modern developer tooling. Think VS Code meets a security operations dashboard—dark mode by default with neon accent highlights that evoke scanning lasers and threat detection.

### Color Palette
- **Background Primary:** `#0a0e17` (deep space black)
- **Background Secondary:** `#111827` (panel dark)
- **Background Tertiary:** `#1e293b` (elevated surfaces)
- **Border:** `#374151` (subtle dividers)
- **Text Primary:** `#f1f5f9` (high contrast white)
- **Text Secondary:** `#94a3b8` (muted labels)
- **Accent Cyan:** `#22d3ee` (primary actions, scan indicators)
- **Accent Green:** `#10b981` (safe/success states)
- **Severity High:** `#ef4444` (critical red)
- **Severity Medium:** `#f97316` (warning orange)
- **Severity Low:** `#eab308` (caution yellow)
- **Highlight Background:** `rgba(239, 68, 68, 0.2)` (secret highlight)

### Typography
- **Primary Font:** 'JetBrains Mono', monospace (code and UI)
- **Fallback:** 'Fira Code', 'Consolas', monospace
- **Scale:** 12px (small), 14px (body), 16px (headings), 24px (hero)

### Spatial System
- Base unit: 4px
- Component padding: 16px (4 units)
- Section gaps: 24px (6 units)
- Border radius: 8px (subtle rounding)

### Motion Philosophy
- Scanning animation: pulsing cyan glow during active scan
- Results reveal: staggered fade-in from top (50ms delay between items)
- Highlight pulse: subtle red glow pulse on detected secrets
- Transitions: 200ms ease-out for hover states
- Drag feedback: scale(1.02) with cyan border glow

## 3. Layout & Structure

### Page Architecture
```
┌─────────────────────────────────────────────────────┐
│ HEADER (Logo + Tagline + Privacy Badge)             │
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────┐ ┌─────────────────────────┐  │
│ │                     │ │                         │  │
│ │   CODE INPUT PANEL  │ │    RESULTS PANEL        │  │
│ │   - Tab: Paste      │ │    - Summary Stats      │  │
│ │   - Tab: Upload     │ │    - Issue List         │  │
│ │   - Tab: Drag&Drop  │ │    - Export Buttons     │  │
│ │                     │ │                         │  │
│ │   [Code Editor]     │ │    [Security Report]    │  │
│ │                     │ │                         │  │
│ └─────────────────────┘ └─────────────────────────┘  │
├─────────────────────────────────────────────────────┤
│ FOOTER (Privacy Statement + Version)               │
└─────────────────────────────────────────────────────┘
```

### Responsive Strategy
- **Desktop (>1024px):** Side-by-side panels (50/50 split)
- **Tablet (768-1024px):** Stacked panels with collapsible results
- **Mobile (<768px):** Full-width stacked, sticky scan button

## 4. Features & Interactions

### Input Methods

**1. Paste Code Tab**
- Textarea with syntax-aware styling
- Line numbers displayed
- Placeholder with example code snippet
- Clear button (top-right corner)

**2. Upload File Tab**
- File input accepting multiple files
- Supported: .js, .ts, .py, .env, .json, .yaml, .yml, .java, .go, .cpp, .txt
- File list showing uploaded files with remove option
- Max 10 files, 5MB each

**3. Drag & Drop Zone**
- Full tab area as drop zone
- Visual feedback: cyan dashed border, background tint on dragover
- Accepts multiple files
- Rejects non-supported file types with error toast

### Scan Engine
- Regex-based pattern matching
- Patterns checked:
  - Google AI API Key: `AIza[0-9A-Za-z-_]{35}`
  - AWS Access Key: `AKIA[0-9A-Z]{16}`
  - AWS Secret Key: `[A-Za-z0-9/+=]{40}` (with context)
  - Private Key Block: `-----BEGIN PRIVATE KEY-----`
  - Generic API Key: `[a-zA-Z0-9_-]{32,}` (with context)
  - JWT Token: `eyJ[A-Za-z0-9-*]+.[A-Za-z0-9-*]+.[A-Za-z0-9-_]+`
  - Password Assignment: `password\s*=\s*["'][^"']+["']`
  - Connection String: `(mongodb|mysql|postgresql|redis):\/\/[^"\s]+`
  - Generic Secret: `secret\s*=\s*["'][^"']+["']`
  - Bearer Token: `Bearer\s+[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+`

### Scan Button
- Disabled state when no input
- Loading state: "Scanning..." with pulsing animation
- Shows progress for large files

### Results Panel

**Summary Dashboard**
- Total issues count (large number)
- Severity breakdown with color-coded badges
- Progress ring visualization

**Issue List**
- Each issue card shows:
  - Severity icon (colored)
  - Issue type (e.g., "API Key Detected")
  - File name + Line number
  - Matched pattern (truncated)
- Click to jump: scrolls code editor to line, highlights it
- Hover: shows full pattern match

**Empty State**
- Shield icon with checkmark
- "No secrets detected" message
- Encouraging message: "Your code looks clean!"

### Code Highlighting
- Detected secrets wrapped in highlight spans
- Red background with pulsing animation
- Tooltip on hover showing severity

### Export Options
- **JSON Export:** Full structured report
- **TXT Export:** Human-readable summary
- Buttons disabled until scan complete

## 5. Component Inventory

### Header
- Logo: Shield icon + "PrivMITLab" text
- Tagline: "Block Everything. Trust Nothing. Control Everything."
- Privacy badge: Green checkmark + "100% Client-Side"
- States: Default only (static)

### Tab Navigation
- Three tabs: Paste, Upload, Drag & Drop
- States: Default (gray), Active (cyan underline), Hover (lighter gray)

### Code Editor
- Line numbers column (fixed width)
- Code area with horizontal scroll
- States: Empty (placeholder), Filled, With highlights

### File Chip
- Shows filename + file size
- Remove (X) button
- States: Default, Hover (X highlighted)

### Scan Button
- Full width in mobile, fixed width in desktop
- States: Disabled (gray), Ready (cyan), Scanning (pulsing), Complete (green flash)

### Issue Card
- Severity indicator stripe on left
- Content area with issue details
- States: Default, Hover (elevated shadow), Clicked (cyan border)

### Severity Badge
- Pill shape with icon + count
- Colors: Red/High, Orange/Medium, Yellow/Low

### Export Button
- Secondary style (outlined)
- States: Disabled (dimmed), Ready (hover glow), Clicked (download trigger)

### Toast Notification
- Position: Top-right
- Types: Error (red), Success (green), Info (cyan)
- Auto-dismiss: 4 seconds
- Manual dismiss: X button

## 6. Technical Approach

### Stack
- React 18 + Vite
- Tailwind CSS for styling
- No external CDN dependencies
- No external runtime dependencies

### Architecture
```
src/
├── App.tsx              # Main application component
├── components/
│   ├── Header.tsx
│   ├── CodeInputPanel.tsx
│   ├── ResultsPanel.tsx
│   ├── ScanButton.tsx
│   ├── IssueCard.tsx
│   ├── FileChip.tsx
│   ├── SummaryDashboard.tsx
│   └── ExportButtons.tsx
├── scanner/
│   ├── patterns.ts      # Regex patterns definition
│   └── scannerEngine.ts # Core scanning logic
├── utils/
│   ├── fileReader.ts    # File upload handling
│   └── reportGenerator.ts # Export functionality
├── hooks/
│   └── useScanner.ts    # Scanning state management
└── types/
    └── index.ts         # TypeScript interfaces
```

### Scanner Engine Logic
1. Receive input (text string or file list)
2. Split content by lines for line-number tracking
3. Apply each regex pattern sequentially
4. Collect matches with: line number, column, matched text, pattern name, severity
5. Return structured array of findings
6. Apply syntax highlighting based on findings

### Data Model
```typescript
interface ScanResult {
  id: string;
  type: string;          // "API Key", "JWT Token", etc.
  pattern: string;       // Which pattern matched
  severity: "high" | "medium" | "low";
  line: number;
  column: number;
  matchedText: string;   // The actual secret (masked in display)
  context: string;      // Surrounding code (before/after)
  fileName?: string;    // If from file upload
}

interface ScanReport {
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
```

### Performance Considerations
- Web Worker for scanning large files (>1MB)
- Incremental rendering for results
- Debounced scanning trigger
- Virtual scrolling for large result sets

### Security Safeguards
- All input treated as text (never executed)
- Content-Disposition headers for downloads
- Input sanitization for display (XSS prevention)
- No eval() or innerHTML with user content
