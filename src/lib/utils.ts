import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Constructs a proper API URL with protocol
 * Ensures the URL always has https:// for production and http:// for localhost
 */
export function getApiUrl(path: string): string {
  // Use the production domain for production, fallback to localhost for development
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://ledgerone-one.vercel.app'
    : 'http://localhost:3000';
  
  return `${baseUrl}/api${path.startsWith('/') ? path : `/${path}`}`;
}
