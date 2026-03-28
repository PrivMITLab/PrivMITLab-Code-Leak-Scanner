# PrivMITLab Code Leak Scanner

<div align="center">

![PrivMITLab Logo](https://img.shields.io/badge/PrivMITLab-Code%20Leak%20Scanner-22d3ee?style=for-the-badge)
![Privacy](https://img.shields.io/badge/Privacy-100%25%20Client%20Side-10b981?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

**Block Everything. Trust Nothing. Control Everything.**

A privacy-first secret detection tool that scans code for accidentally exposed API keys, tokens, and passwords. 100% client-side. No telemetry.

[Features](#features) • [Quick Start](#quick-start) • [Privacy](#privacy) • [Deployment](#deployment) • [Contributing](#contributing)

</div>

---

## ✨ Features

### 🆕 Version 2.0 Enhancements

#### 🎨 **Enhanced User Experience**
- **🌓 Dark/Light Theme Toggle** - Comfortable viewing in any lighting condition
- **📱 Fully Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **⌨️ Keyboard Shortcuts** - Efficient navigation with hotkeys (Ctrl+Enter to scan, Ctrl+K to clear, etc.)
- **📊 Scan History** - Session-based tracking of your last 10 scans with statistics
- **🔍 Search & Filter** - Instantly find specific issues in scan results
- **📈 Statistics Dashboard** - Visual risk distribution with progress bars
- **⚡ Full Screen Mode** - Distraction-free scanning experience

#### 💡 **Smart Features**
- **Quick Fix Suggestions** - Context-aware code examples to fix each security issue
- **Code Sanitization** - Preview your code with secrets automatically redacted
- **Copy to Clipboard** - One-click copy for code snippets and sanitized versions
- **Multiple Export Options** - Download as JSON, TXT, or print directly
- **Enhanced Toast Notifications** - Non-intrusive feedback for all actions
- **Modal Dialogs** - Keyboard shortcuts help, quick fixes, and scan history

### 🔒 Privacy-First Design
- **100% Client-Side**: All scanning happens in your browser
- **Zero Data Transmission**: Your code never leaves your device
- **No Telemetry**: No analytics, no tracking, no external calls
- **Open Source**: Full transparency on how the tool works

### 🔍 Secret Detection
Detects 20+ types of sensitive information including:
- Google AI API Keys
- AWS Access Keys & Secret Keys
- Private Key Blocks (RSA, EC, DSA, OpenSSH)
- JWT Tokens
- Bearer Authentication Tokens
- Database Connection Strings
- Slack, GitHub, Stripe, SendGrid, Twilio Tokens
- Generic API Keys & Passwords

### 💻 Developer-Friendly
- **Multiple Input Methods**: Paste code, upload files, or drag & drop
- **File Support**: .js, .ts, .py, .env, .json, .yaml, .yml, .java, .go, .cpp, .txt, and more
- **Syntax Highlighting**: Detected secrets are highlighted in your code
- **Line Numbers**: Easy navigation to problematic lines
- **Export Reports**: Download results as JSON or TXT

### 📊 Security Report
- Severity classification (High, Medium, Low)
- Summary dashboard with issue counts
- Detailed findings with context
- Click-to-navigate to issue locations

---

## 🚀 Quick Start

### Option 1: Use the Live Version
Visit the deployed version at **(Add your Vercel deployment URL here)**

### Option 2: Run Locally

```bash
# Clone the repository
git clone https://github.com/PrivMITLab/privmitlab-code-leak-scanner.git

# Navigate to the project
cd privmitlab-code-leak-scanner

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 🔐 Privacy

### Our Privacy Promise

> **"Your code never leaves your browser."**

This tool is designed with privacy as its core principle:

| ✅ What We Do | ❌ What We Don't Do |
|--------------|---------------------|
| Process code locally in browser | Send code to external servers |
| Generate detection patterns client-side | Use cloud-based scanning APIs |
| Store nothing | Log or store your code |
| Zero analytics | Include telemetry or tracking |
| Open source | Require API keys or registration |

### Technical Privacy Measures

- All regex pattern matching happens in the browser
- No external network requests during scanning
- No cookies or local storage of code
- No third-party scripts or CDN dependencies
- Content-Disposition headers for all exports

---

## ⌨️ Keyboard Shortcuts

Speed up your workflow with these keyboard shortcuts:

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + Enter` | Run scan |
| `Ctrl/Cmd + K` | Clear all data |
| `Ctrl/Cmd + H` | Toggle scan history |
| `Ctrl/Cmd + /` | Show keyboard shortcuts help |
| `Esc` | Close modals |

---

## 🛠️ How Scanning Works

### Detection Patterns

The scanner uses a comprehensive set of regex patterns to identify secrets:

```javascript
// Example patterns (simplified)
const patterns = [
  { name: 'Google AI API Key', regex: /AIza[0-9A-Za-z-_]{35}/ },
  { name: 'AWS Access Key', regex: /AKIA[0-9A-Z]{16}/ },
  { name: 'JWT Token', regex: /eyJ[A-Za-z0-9-*]+\.eyJ[A-Za-z0-9-*]+\.[A-Za-z0-9-_+]+/ },
  // ... 20+ more patterns
];
```

### Severity Levels

| Level | Color | Description |
|-------|-------|-------------|
| **High** | 🔴 Red | Critical security risks (API keys, private keys, tokens) |
| **Medium** | 🟠 Orange | Potential exposures (passwords, connection strings) |
| **Low** | 🟡 Yellow | Informational findings (generic secrets) |

### Scanning Flow

```
User Input → Parse Content → Line-by-Line Analysis → Pattern Matching
     ↓
Collect Results → Sort by Severity → Generate Report → Display
```

---

## 📦 Supported File Types

| Extension | Description |
|-----------|-------------|
| `.js` `.jsx` | JavaScript / React |
| `.ts` `.tsx` | TypeScript |
| `.py` | Python |
| `.env` | Environment files |
| `.json` | JSON files |
| `.yaml` `.yml` | YAML files |
| `.java` | Java |
| `.go` | Go |
| `.cpp` `.c` `.h` | C/C++ |
| `.txt` | Plain text |

**Max file size:** 5MB per file  
**Max files:** 10 files per scan

---

## 🚢 Deployment

### Deploy to Vercel

1. Fork this repository
2. Connect to Vercel
3. Deploy with zero configuration

```bash
# Or use Vercel CLI
vercel
```

### Deploy to Other Platforms

The built output in `dist/` can be deployed to any static hosting:

- GitHub Pages
- Netlify
- Cloudflare Pages
- Any web server

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/privmitlab-code-leak-scanner.git

# Create feature branch
git checkout -b feature/amazing-feature

# Make changes and test
npm run build

# Commit and push
git commit -m 'Add amazing feature'
git push origin feature/amazing-feature
```

### Adding New Detection Patterns

Edit `src/scanner/patterns.ts`:

```typescript
{
  name: 'New Secret Type',
  regex: /your-pattern-here/g,
  severity: 'high', // 'high' | 'medium' | 'low'
  type: 'Secret Type',
  description: 'Description of what this detects'
}
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🛡️ Security

If you discover a security vulnerability or have concerns about the tool's security:

1. **Do NOT** create a public GitHub issue
2. Email security concerns to **(Add your contact)**
3. We will respond within 48 hours

Remember: This tool scans for security issues, so we take security seriously.

---

## 🙏 Acknowledgments

- Inspired by the need for privacy-first developer tools
- Built with React, TypeScript, and Tailwind CSS
- Maintained by the **PrivMITLab** team

---

<div align="center">

**Made with ❤️ by [PrivMITLab](https://github.com/PrivMITLab)**

*Block Everything. Trust Nothing. Control Everything.*

</div>
