// export interface Pattern {
//   name: string;
//   regex: RegExp;
//   severity: 'high' | 'medium' | 'low';
//   type: string;
//   description: string;
// }

// export const SECRET_PATTERNS: Pattern[] = [
//   // ---------- HIGH confidence (strict, long, entropy-rich) ----------
//   {
//     name: 'Google AI API Key',
//     regex: /AIza[0-9A-Za-z-_]{35}/g,
//     severity: 'high',
//     type: 'API Key',
//     description: 'Google AI/API Key detected'
//   },
//   {
//     name: 'AWS Access Key ID',
//     regex: /AKIA[0-9A-Z]{16}/g,
//     severity: 'high',
//     type: 'AWS Credentials',
//     description: 'AWS Access Key ID detected'
//   },
//   {
//     name: 'AWS Secret Access Key',
//     regex: /(?:aws)?_?(?:secret)?_?(?:access)?_?key["\s:=]+["']?[A-Za-z0-9/+=]{40}["']?/gi,
//     severity: 'high',
//     type: 'AWS Credentials',
//     description: 'AWS Secret Access Key detected'
//   },
//   {
//     name: 'Private Key Block',
//     regex: /-----BEGIN\s+(?:RSA\s+|EC\s+|DSA\s+|OPENSSH\s+)?PRIVATE\s+KEY-----/g,
//     severity: 'high',
//     type: 'Private Key',
//     description: 'Private key block detected'
//   },
//   {
//     name: 'JWT Token',
//     regex: /eyJ[A-Za-z0-9-*]+\.eyJ[A-Za-z0-9-*]+\.[A-Za-z0-9-_+]+/g,
//     severity: 'high',
//     type: 'JWT Token',
//     description: 'JSON Web Token detected'
//   },
//   {
//     name: 'Bearer Token',
//     regex: /Bearer\s+[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/g,
//     severity: 'high',
//     type: 'Bearer Token',
//     description: 'Bearer authentication token detected'
//   },
//   {
//     name: 'Database Connection String',
//     regex: /(?:mongodb|mysql|postgresql|postgres|redis|mssql):\/\/[^\s"']+/gi,
//     severity: 'high',
//     type: 'Connection String',
//     description: 'Database connection string detected'
//   },
//   {
//     name: 'Slack Token',
//     regex: /xox[baprs]-[0-9]{10,13}-[0-9]{10,13}[a-zA-Z0-9-]*/g,
//     severity: 'high',
//     type: 'API Token',
//     description: 'Slack token detected'
//   },
//   {
//     name: 'GitHub Token',
//     regex: /gh[pousr]_[A-Za-z0-9_]{36,}/g,
//     severity: 'high',
//     type: 'API Token',
//     description: 'GitHub token detected'
//   },
//   {
//     name: 'Stripe Key',
//     regex: /sk_live_[0-9a-zA-Z]{24,}/g,
//     severity: 'high',
//     type: 'Payment Key',
//     description: 'Stripe live API key detected'
//   },
//   {
//     name: 'SendGrid API Key',
//     regex: /SG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43}/g,
//     severity: 'high',
//     type: 'API Key',
//     description: 'SendGrid API key detected'
//   },
//   {
//     name: 'Twilio API Key',
//     regex: /SK[a-zA-Z0-9]{32}/g,
//     severity: 'high',
//     type: 'API Key',
//     description: 'Twilio API key detected'
//   },
//   {
//     name: 'NPM Token',
//     regex: /npm_[A-Za-z0-9]{36}/g,
//     severity: 'high',
//     type: 'API Token',
//     description: 'NPM authentication token detected'
//   },

//   // ---------- MEDIUM confidence (longer but generic / known formats) ----------
//   {
//     name: 'Stripe Publishable Key',
//     regex: /pk_live_[0-9a-zA-Z]{24,}/g,
//     severity: 'medium',
//     type: 'Payment Key',
//     description: 'Stripe publishable key detected'
//   },
//   {
//     name: 'Mailchimp API Key',
//     regex: /[a-f0-9]{32}-us[0-9]{1,2}/gi,
//     severity: 'medium',
//     type: 'API Key',
//     description: 'Mailchimp API key detected'
//   },
//   {
//     name: 'Basic Auth',
//     regex: /[Bb]asic\s+[A-Za-z0-9+/=]{20,}/g,
//     severity: 'medium',
//     type: 'Authentication',
//     description: 'Basic authentication header detected'
//   },
//   {
//     name: 'Generic API Key (long)',
//     regex: /(?:api|apikey|api_key|apiKey)["\s:=]+["']?[A-Za-z0-9_-]{32,}["']?/gi,
//     severity: 'medium',
//     type: 'API Key',
//     description: 'Possible API key detected (length ≥32)'
//   },
//   {
//     name: 'Secret Assignment (long)',
//     regex: /(?:secret|client_secret)["\s:=]+["'][^"']{8,}["']/gi,
//     severity: 'medium',
//     type: 'Secret',
//     description: 'Secret value detected'
//   },
//   {
//     name: 'Generic Secret Token (long)',
//     regex: /(?:token|auth_token|access_token)["\s:=]+["']?[A-Za-z0-9_.-]{20,}["']?/gi,
//     severity: 'medium',  // upgraded from 'low' because length ≥20
//     type: 'Secret',
//     description: 'Possible authentication token detected'
//   },

//   // ---------- LOW confidence (shorter keys, fake markers, assignments) ----------
//   // NEW: catches let apiKey = "short-key" (length 8-31) in JS/TS/Swift/Python etc.
//   {
//     name: 'Variable Assignment – API Key (short)',
//     regex: /\b(?:let|const|var)\s+(\w*(?:api|key|token|secret)\w*)\s*=\s*["']([A-Za-z0-9_\-]{8,31})["']/gi,
//     severity: 'low',
//     type: 'Potential Secret',
//     description: 'Short API key / secret assigned to a variable (length 8-31) – may be fake or test key'
//   },
//   // NEW: catches password assignments of any length (already had medium, but adding low for very short)
//   {
//     name: 'Password Assignment (any length)',
//     regex: /(?:password|passwd|pwd)["\s:=]+["'][^"']{4,}["']/gi,
//     severity: 'medium',
//     type: 'Password',
//     description: 'Password assignment detected'
//   },
//   // NEW: Swift-specific let/var without semicolon confusion
//   {
//     name: 'Swift Key Assignment',
//     regex: /\b(?:let|var)\s+(\w*(?:api|key|secret|token)\w*)\s*=\s*["']([A-Za-z0-9_\-]{8,})["']/gi,
//     severity: 'low',
//     type: 'Potential Secret',
//     description: 'Swift variable assignment with key-like name – could be a real or fake secret'
//   },
//   // NEW: catches obvious fake/test keys (contains FAKE, TEST, DEMO, EXAMPLE) – lowest severity
//   {
//     name: 'Fake / Test Key (placeholder)',
//     regex: /["'][A-Za-z0-9_\-]*(?:fake|test|demo|example|placeholder)[A-Za-z0-9_\-]*["']/gi,
//     severity: 'low',
//     type: 'Placeholder',
//     description: 'Contains "fake", "test", "demo", etc. – likely not a real secret'
//   },
//   // NEW: catches any variable assignment with key-like name and short value (8-31) in any language style
//   {
//     name: 'Generic Key Assignment (short)',
//     regex: /\b\w*(?:api|key|secret|token|auth)\w*\s*[=:]\s*["']([A-Za-z0-9_\-]{8,31})["']/gi,
//     severity: 'low',
//     type: 'Potential Secret',
//     description: 'Short string assigned to a key-like variable (8-31 chars) – review manually'
//   }
// ];

// export const SUPPORTED_EXTENSIONS = [
//   '.js', '.ts', '.jsx', '.tsx', '.py', '.env',
//   '.json', '.yaml', '.yml', '.java', '.go', '.cpp',
//   '.c', '.h', '.rb', '.php', '.cs', '.swift',
//   '.kt', '.scala', '.txt', '.md', '.xml', '.toml'
// ];

export interface Pattern {
  name: string;
  regex: RegExp;
  severity: 'high' | 'medium' | 'low';
  type: string;
  description: string;
}

export const SECRET_PATTERNS: Pattern[] = [
  // ---------- HIGH confidence (strict, long, entropy-rich) ----------
  {
    name: 'Google AI API Key',
    regex: /AIza[0-9A-Za-z-_]{35}/g,
    severity: 'high',
    type: 'API Key',
    description: 'Google AI/API Key detected'
  },
  {
    name: 'AWS Access Key ID',
    regex: /AKIA[0-9A-Z]{16}/g,
    severity: 'high',
    type: 'AWS Credentials',
    description: 'AWS Access Key ID detected'
  },
  {
    name: 'AWS Secret Access Key',
    regex: /(?:aws)?_?(?:secret)?_?(?:access)?_?key["\s:=]+["']?[A-Za-z0-9/+=]{40}["']?/gi,
    severity: 'high',
    type: 'AWS Credentials',
    description: 'AWS Secret Access Key detected'
  },
  {
    name: 'Private Key Block',
    regex: /-----BEGIN\s+(?:RSA\s+|EC\s+|DSA\s+|OPENSSH\s+)?PRIVATE\s+KEY-----/g,
    severity: 'high',
    type: 'Private Key',
    description: 'Private key block detected'
  },
  {
    name: 'JWT Token',
    regex: /eyJ[A-Za-z0-9-*]+\.eyJ[A-Za-z0-9-*]+\.[A-Za-z0-9-_+]+/g,
    severity: 'high',
    type: 'JWT Token',
    description: 'JSON Web Token detected'
  },
  {
    name: 'Bearer Token',
    regex: /Bearer\s+[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/g,
    severity: 'high',
    type: 'Bearer Token',
    description: 'Bearer authentication token detected'
  },
  {
    name: 'Database Connection String',
    regex: /(?:mongodb|mysql|postgresql|postgres|redis|mssql):\/\/[^\s"']+/gi,
    severity: 'high',
    type: 'Connection String',
    description: 'Database connection string detected'
  },
  {
    name: 'Slack Token',
    regex: /xox[baprs]-[0-9]{10,13}-[0-9]{10,13}[a-zA-Z0-9-]*/g,
    severity: 'high',
    type: 'API Token',
    description: 'Slack token detected'
  },
  {
    name: 'GitHub Token',
    regex: /gh[pousr]_[A-Za-z0-9_]{36,}/g,
    severity: 'high',
    type: 'API Token',
    description: 'GitHub token detected'
  },
  {
    name: 'Stripe Key',
    regex: /sk_live_[0-9a-zA-Z]{24,}/g,
    severity: 'high',
    type: 'Payment Key',
    description: 'Stripe live API key detected'
  },
  {
    name: 'SendGrid API Key',
    regex: /SG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43}/g,
    severity: 'high',
    type: 'API Key',
    description: 'SendGrid API key detected'
  },
  {
    name: 'Twilio API Key',
    regex: /SK[a-zA-Z0-9]{32}/g,
    severity: 'high',
    type: 'API Key',
    description: 'Twilio API key detected'
  },
  {
    name: 'NPM Token',
    regex: /npm_[A-Za-z0-9]{36}/g,
    severity: 'high',
    type: 'API Token',
    description: 'NPM authentication token detected'
  },

  // ---------- MEDIUM confidence (longer but generic / known formats) ----------
  {
    name: 'Stripe Publishable Key',
    regex: /pk_live_[0-9a-zA-Z]{24,}/g,
    severity: 'medium',
    type: 'Payment Key',
    description: 'Stripe publishable key detected'
  },
  {
    name: 'Mailchimp API Key',
    regex: /[a-f0-9]{32}-us[0-9]{1,2}/gi,
    severity: 'medium',
    type: 'API Key',
    description: 'Mailchimp API key detected'
  },
  {
    name: 'Basic Auth',
    regex: /[Bb]asic\s+[A-Za-z0-9+/=]{20,}/g,
    severity: 'medium',
    type: 'Authentication',
    description: 'Basic authentication header detected'
  },
  {
    name: 'Generic API Key (long)',
    regex: /(?:api|apikey|api_key|apiKey)["\s:=]+["']?[A-Za-z0-9_-]{32,}["']?/gi,
    severity: 'medium',
    type: 'API Key',
    description: 'Possible API key detected (length ≥32)'
  },
  // ✅ FIXED: Now matches aws_secret, db_secret, etc.
  {
    name: 'Secret Assignment (long)',
    regex: /(?:\w+_)?(?:secret|client_secret)["\s:=]+["'][^"']{8,}["']/gi,
    severity: 'medium',
    type: 'Secret',
    description: 'Secret value detected'
  },
  {
    name: 'Generic Secret Token (long)',
    regex: /(?:token|auth_token|access_token)["\s:=]+["']?[A-Za-z0-9_.-]{20,}["']?/gi,
    severity: 'medium',
    type: 'Secret',
    description: 'Possible authentication token detected'
  },

  // ---------- LOW confidence (shorter keys, fake markers, assignments) ----------
  {
    name: 'Variable Assignment – API Key (short)',
    regex: /\b(?:let|const|var)\s+(\w*(?:api|key|token|secret)\w*)\s*=\s*["']([A-Za-z0-9_\-]{8,31})["']/gi,
    severity: 'low',
    type: 'Potential Secret',
    description: 'Short API key / secret assigned to a variable (length 8-31) – may be fake or test key'
  },
  {
    name: 'Password Assignment (any length)',
    regex: /(?:password|passwd|pwd)["\s:=]+["'][^"']{4,}["']/gi,
    severity: 'medium',
    type: 'Password',
    description: 'Password assignment detected'
  },
  {
    name: 'Swift Key Assignment',
    regex: /\b(?:let|var)\s+(\w*(?:api|key|secret|token)\w*)\s*=\s*["']([A-Za-z0-9_\-]{8,})["']/gi,
    severity: 'low',
    type: 'Potential Secret',
    description: 'Swift variable assignment with key-like name – could be a real or fake secret'
  },
  {
    name: 'Fake / Test Key (placeholder)',
    regex: /["'][A-Za-z0-9_\-]*(?:fake|test|demo|example|placeholder)[A-Za-z0-9_\-]*["']/gi,
    severity: 'low',
    type: 'Placeholder',
    description: 'Contains "fake", "test", "demo", etc. – likely not a real secret'
  },
  {
    name: 'Generic Key Assignment (short)',
    regex: /\b\w*(?:api|key|secret|token|auth)\w*\s*[=:]\s*["']([A-Za-z0-9_\-]{8,31})["']/gi,
    severity: 'low',
    type: 'Potential Secret',
    description: 'Short string assigned to a key-like variable (8-31 chars) – review manually'
  }
];

export const SUPPORTED_EXTENSIONS = [
  '.js', '.ts', '.jsx', '.tsx', '.py', '.env',
  '.json', '.yaml', '.yml', '.java', '.go', '.cpp',
  '.c', '.h', '.rb', '.php', '.cs', '.swift',
  '.kt', '.scala', '.txt', '.md', '.xml', '.toml'
];
