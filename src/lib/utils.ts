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
  const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL 
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` 
    : 'http://localhost:3000';
  
  return `${baseUrl}/api${path.startsWith('/') ? path : `/${path}`}`;
}
