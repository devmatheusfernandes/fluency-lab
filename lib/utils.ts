import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely converts a date value to ISO string, handling invalid dates
 * @param dateValue - Date, string, number, or any date-like value
 * @returns ISO string if valid, undefined if invalid
 */
export function safeDateToISO(dateValue: any): string | undefined {
  if (!dateValue) return undefined;
  
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) {
      return undefined;
    }
    return date.toISOString();
  } catch {
    return undefined;
  }
}
