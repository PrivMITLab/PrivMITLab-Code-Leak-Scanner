import { FileData } from '../types';
import { SUPPORTED_EXTENSIONS } from '../scanner/patterns';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 10;

export interface FileReadResult {
  success: boolean;
  files?: FileData[];
  error?: string;
}

export function readFile(file: File): Promise<FileData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target?.result as string;
      resolve({
        name: file.name,
        content,
        size: file.size
      });
    };
    
    reader.onerror = () => {
      reject(new Error(`Failed to read file: ${file.name}`));
    };
    
    reader.readAsText(file);
  });
}

export function readFiles(files: FileList | File[]): Promise<FileData[]> {
  return Promise.all(Array.from(files).map(readFile));
}

export function validateFiles(files: FileList | File[]): { valid: FileData[]; errors: string[] } {
  const valid: FileData[] = [];
  const errors: string[] = [];
  const fileArray = Array.from(files);

  if (fileArray.length > MAX_FILES) {
    errors.push(`Maximum ${MAX_FILES} files allowed. ${fileArray.length} files provided.`);
    return { valid, errors };
  }

  for (const file of fileArray) {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!SUPPORTED_EXTENSIONS.includes(ext)) {
      errors.push(`Unsupported file type: ${file.name}. Supported: ${SUPPORTED_EXTENSIONS.join(', ')}`);
      continue;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`File too large: ${file.name}. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
      continue;
    }
    
    valid.push({
      name: file.name,
      content: '',
      size: file.size
    });
  }

  return { valid: valid.slice(0, MAX_FILES), errors };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}
