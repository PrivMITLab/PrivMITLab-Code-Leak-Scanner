# Changelog

All notable changes to PrivMITLab Code Leak Scanner will be documented in this file.

## [2.0.0] - 2026-01-XX - Major Enhancement Release

### ✨ New Features

#### 🎨 **Enhanced User Interface**
- **Dark/Light Theme Toggle** - Switch between themes with one click or keyboard shortcut
- **Fully Responsive Design** - Optimized layouts for mobile (320px+), tablet (768px+), and desktop (1024px+)
- **Full Screen Mode** - Distraction-free scanning experience
- **Toast Notifications** - Non-intrusive feedback for all user actions
- **Modal Dialogs** - Clean interfaces for keyboard shortcuts, quick fixes, and history

#### ⌨️ **Keyboard Shortcuts**
- `Ctrl/Cmd + Enter` - Run scan
- `Ctrl/Cmd + K` - Clear all data
- `Ctrl/Cmd + H` - Toggle scan history
- `Ctrl/Cmd + /` - Show keyboard shortcuts help
- `Esc` - Close modals

#### 📊 **Scan History**
- Session-based storage of last 10 scans
- Quick access to previous scan statistics
- Visual timeline of scan results
- One-click clear history

#### 🔍 **Search & Filter**
- Real-time search across scan results
- Filter by issue type, matched text, or line number
- Live result count updates

#### 💡 **Quick Fix Suggestions**
- Context-aware code examples for each issue type
- Multiple fix suggestions per issue
- One-click copy of fix code
- Best practice recommendations

#### 🔒 **Code Sanitization**
- Automatic secret masking/redaction
- Side-by-side comparison (original vs sanitized)
- Copy sanitized code to clipboard
- Smart pattern-based redaction

#### 📈 **Statistics Dashboard**
- Visual risk distribution with color-coded progress bars
- Total issues breakdown (High/Medium/Low)
- Lines scanned counter
- Files processed counter

#### 📥 **Enhanced Export Options**
- **JSON Export** - Machine-readable reports
- **TXT Export** - Human-readable reports
- **Print Report** - Print-friendly formatted output
- Timestamped filenames for easy organization

#### 📋 **Copy to Clipboard**
- Copy individual detected secrets
- Copy entire code snippets
- Copy sanitized code
- Copy quick fix suggestions
- Visual feedback on successful copy

### 🎯 **Improved Features**

#### Enhanced Code Input
- Better emoji icons for tabs (📝 Paste, 📁 Upload, 🎯 Drop)
- Live character and line count for paste mode
- Improved file size display
- Better drag-and-drop visual feedback

#### Better Results Display
- Color-coded severity badges with borders
- Expandable result cards
- Click-to-scroll to specific lines
- Enhanced code preview with syntax awareness
- File-specific results in multi-file scans

#### Responsive Enhancements
- Mobile-optimized header (compact on small screens)
- Collapsible statistics on mobile
- Touch-friendly buttons and controls
- Adaptive text sizes (10px to 16px based on screen)
- Smart gap adjustments (3px to 6px based on breakpoint)

### 🛠️ **Technical Improvements**

#### New Utility Modules
- `src/utils/scanHistory.ts` - Session storage management
- `src/utils/sanitizer.ts` - Code sanitization and suggestions
- `src/utils/quickFixes.ts` - Fix generation logic

#### Performance Optimizations
- Memoized computed values for better performance
- Efficient state management
- Reduced re-renders with useCallback hooks
- Optimized search/filter with useMemo

#### Code Quality
- Better TypeScript type safety
- Improved component structure
- Clean separation of concerns
- Enhanced error handling

### 🎨 **UI/UX Enhancements**

#### Visual Improvements
- Smoother animations and transitions
- Better color contrast for accessibility
- Enhanced focus states
- Improved loading states
- Better empty states with helpful messages

#### User Feedback
- Informative toast messages
- Progress indicators
- Loading animations
- Success/error states
- Helpful tooltips

### 📱 **Mobile Experience**

#### Mobile-Specific Features
- Hamburger-style action buttons
- Bottom-sheet-style modals on mobile
- Swipe-friendly interfaces
- Touch-optimized button sizes (44px minimum)
- Reduced motion for better mobile performance

#### Responsive Breakpoints
- **Mobile**: 320px - 639px (sm)
- **Tablet**: 640px - 1023px (md/lg)
- **Desktop**: 1024px+ (lg/xl)

### 🔐 **Privacy Maintained**

All new features maintain the core privacy promise:
- ✅ Scan history stored in sessionStorage only (cleared on tab close)
- ✅ No external API calls
- ✅ No telemetry or analytics
- ✅ No permanent data storage
- ✅ 100% client-side processing

### 📦 **Bundle Size**

- **v1.0**: ~269 KB (78 KB gzipped)
- **v2.0**: ~272 KB (78.45 KB gzipped)
- **Increase**: +3 KB (~1.1% increase) for all new features

---

## [1.0.0] - Initial Release

### Features
- Privacy-first secret scanning
- 20+ detection patterns
- Multiple input methods (paste, upload, drag-drop)
- Severity classification
- Code highlighting
- JSON/TXT export
- Supported file types: .js, .ts, .py, .env, .json, .yaml, .yml, .java, .go, .cpp, .txt
- Dark mode UI
- Responsive design

---

## Semantic Versioning

This project follows [Semantic Versioning](https://semver.org/):
- **MAJOR** version for incompatible changes
- **MINOR** version for new features (backwards-compatible)
- **PATCH** version for bug fixes

---

## Future Roadmap

### Planned for v2.1
- [ ] Custom pattern editor
- [ ] Batch file scanning improvements
- [ ] Export templates customization
- [ ] More language-specific patterns
- [ ] Regex pattern tester

### Under Consideration
- [ ] Browser extension version
- [ ] CLI version
- [ ] Git hook integration
- [ ] CI/CD integration examples
- [ ] Pattern sharing (privacy-safe)
