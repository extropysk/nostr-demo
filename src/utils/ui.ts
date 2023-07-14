import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getProperty(key: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(key)
}
