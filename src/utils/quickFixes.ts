import { ScanResult } from '../types';

export interface QuickFix {
  title: string;
  description: string;
  code: string;
}

export const generateQuickFixes = (result: ScanResult): QuickFix[] => {
  const fixes: QuickFix[] = [];
  
  switch (result.type) {
    case 'API Key':
    case 'AWS Access Key':
    case 'Generic Secret':
      fixes.push({
        title: 'Use Environment Variable',
        description: 'Move the secret to a .env file',
        code: `// .env file\n${result.type.toUpperCase().replace(/ /g, '_')}=your_secret_here\n\n// In your code\nconst apiKey = process.env.${result.type.toUpperCase().replace(/ /g, '_')};`
      });
      break;
      
    case 'Password':
      fixes.push({
        title: 'Use Environment Variable',
        description: 'Store password securely',
        code: `// .env file\nPASSWORD=your_password_here\n\n// In your code\nconst password = process.env.PASSWORD;`
      });
      fixes.push({
        title: 'Use Hash Instead',
        description: 'Never store plain text passwords',
        code: `import bcrypt from 'bcrypt';\n\nconst hashedPassword = await bcrypt.hash(password, 10);\n// Store hashedPassword instead`
      });
      break;
      
    case 'Private Key':
      fixes.push({
        title: 'Use File System',
        description: 'Load private key from secure file',
        code: `import fs from 'fs';\n\nconst privateKey = fs.readFileSync('./keys/private.key', 'utf8');`
      });
      break;
      
    case 'Database Connection':
      fixes.push({
        title: 'Use Environment Variables',
        description: 'Separate credentials from code',
        code: `// .env file\nDB_HOST=localhost\nDB_USER=username\nDB_PASS=password\nDB_NAME=dbname\n\n// In your code\nconst connection = {\n  host: process.env.DB_HOST,\n  user: process.env.DB_USER,\n  password: process.env.DB_PASS,\n  database: process.env.DB_NAME\n};`
      });
      break;
      
    case 'JWT Token':
      fixes.push({
        title: 'Generate Dynamically',
        description: 'Never hardcode JWT tokens',
        code: `import jwt from 'jsonwebtoken';\n\nconst token = jwt.sign(\n  { userId: user.id },\n  process.env.JWT_SECRET,\n  { expiresIn: '1h' }\n);`
      });
      break;
  }
  
  // Add gitignore suggestion for all types
  fixes.push({
    title: 'Add to .gitignore',
    description: 'Prevent committing sensitive files',
    code: `.env\n.env.local\n.env.*.local\n*.key\n*.pem\nconfig/secrets.*`
  });
  
  return fixes;
};
