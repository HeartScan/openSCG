import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combine multiple class values into a single string and efficiently merge Tailwind CSS classes
 * 
 * @param inputs - Class values to be combined
 * @returns Merged and deduplicated class string
 * 
 * @example
 * // Returns "p-4 bg-blue-500" (duplicated padding is removed)
 * cn("p-4 bg-red-500", "bg-blue-500 p-4")
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
