export interface Pattern {
  name: string;
  regex: RegExp;
  severity: 'high' | 'medium' | 'low';
  type: string;
  description: string;
}

export const SECRET_PATTERNS: Pattern[] = [
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
    name: 'Generic API Key',
    regex: /(?:api|apikey|api_key|apiKey)["\s:=]+["']?[A-Za-z0-9_-]{32,}["']?/gi,
    severity: 'medium',
    type: 'API Key',
    description: 'Possible API key detected'
  },
  {
    name: 'Password Assignment',
    regex: /(?:password|passwd|pwd)["\s:=]+["'][^"']{4,}["']/gi,
    severity: 'medium',
    type: 'Password',
    description: 'Password assignment detected'
  },
  {
    name: 'Secret Assignment',
    regex: /(?:secret|client_secret)["\s:=]+["'][^"']{8,}["']/gi,
    severity: 'medium',
    type: 'Secret',
    description: 'Secret value detected'
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
    name: 'Stripe Publishable Key',
    regex: /pk_live_[0-9a-zA-Z]{24,}/g,
    severity: 'medium',
    type: 'Payment Key',
    description: 'Stripe publishable key detected'
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
    name: 'Mailchimp API Key',
    regex: /[a-f0-9]{32}-us[0-9]{1,2}/gi,
    severity: 'medium',
    type: 'API Key',
    description: 'Mailchimp API key detected'
  },
  {
    name: 'NPM Token',
    regex: /npm_[A-Za-z0-9]{36}/g,
    severity: 'high',
    type: 'API Token',
    description: 'NPM authentication token detected'
  },
  {
    name: 'Generic Secret',
    regex: /(?:token|auth_token|access_token)["\s:=]+["']?[A-Za-z0-9_.-]{20,}["']?/gi,
    severity: 'low',
    type: 'Secret',
    description: 'Possible authentication token detected'
  },
  {
    name: 'Basic Auth',
    regex: /[Bb]asic\s+[A-Za-z0-9+/=]{20,}/g,
    severity: 'medium',
    type: 'Authentication',
    description: 'Basic authentication header detected'
  }
];

export const SUPPORTED_EXTENSIONS = [
  '.js', '.ts', '.jsx', '.tsx', '.py', '.env',
  '.json', '.yaml', '.yml', '.java', '.go', '.cpp',
  '.c', '.h', '.rb', '.php', '.cs', '.swift',
  '.kt', '.scala', '.txt', '.md', '.xml', '.toml'
];
