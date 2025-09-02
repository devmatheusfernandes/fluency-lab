import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory store for rate limiting
// In production, you should use Redis or another distributed store
const rateLimitStore: Map<string, { count: number; resetTime: number }> = new Map();

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime <= now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

// Rate limiting function
export function rateLimit(
  request: NextRequest,
  windowMs: number = 15 * 60 * 1000, // 15 minutes
  maxRequests: number = 100
): { limited: boolean; remaining?: number; resetTime?: number } {
  const ip = getClientIP(request);
  const key = `${ip}:${request.nextUrl.pathname}`;
  const now = Date.now();
  
  const record = rateLimitStore.get(key);
  
  // If no record exists or the window has expired, create a new one
  if (!record || record.resetTime <= now) {
    const newRecord = {
      count: 1,
      resetTime: now + windowMs
    };
    rateLimitStore.set(key, newRecord);
    return { 
      limited: false, 
      remaining: maxRequests - 1, 
      resetTime: newRecord.resetTime 
    };
  }
  
  // Increment the count
  record.count += 1;
  rateLimitStore.set(key, record);
  
  // Check if limit is exceeded
  if (record.count > maxRequests) {
    return { 
      limited: true, 
      remaining: 0, 
      resetTime: record.resetTime 
    };
  }
  
  return { 
    limited: false, 
    remaining: maxRequests - record.count, 
    resetTime: record.resetTime 
  };
}

// Utility function to get client IP
export function getClientIP(request: NextRequest): string {
  // Check for X-Forwarded-For header (common in proxy setups)
  const xForwardedFor = request.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    // Take the first IP if there are multiple (comma-separated)
    return xForwardedFor.split(',')[0].trim();
  }
  
  // Check for X-Real-IP header
  const xRealIP = request.headers.get('x-real-ip');
  if (xRealIP) {
    return xRealIP;
  }
  
  // Fallback to unknown
  return 'unknown';
}

// Predefined rate limiters
export const generalRateLimiter = (request: NextRequest) => 
  rateLimit(request, 15 * 60 * 1000, 100); // 100 requests per 15 minutes

export const authRateLimiter = (request: NextRequest) => 
  rateLimit(request, 15 * 60 * 1000, 5); // 5 requests per 15 minutes

export const paymentRateLimiter = (request: NextRequest) => 
  rateLimit(request, 15 * 60 * 1000, 20); // 20 requests per 15 minutes