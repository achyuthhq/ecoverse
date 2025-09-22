import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date to readable string
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Extract file extension from filename
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
}

// Convert file to base64
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result as string;
      // Remove the data:image/jpeg;base64, part
      const base64Content = base64String.split(',')[1];
      resolve(base64Content);
    };
    reader.onerror = error => reject(error);
  });
}

// Parse JSON strings safely
export function parseJsonArray(jsonString: string | null | undefined): any[] {
  if (!jsonString) return [];
  
  try {
    const parsed = JSON.parse(jsonString);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Error parsing JSON array:", error);
    return [];
  }
}

export function parseJsonObject(jsonString: string | null | undefined): any {
  if (!jsonString) return {};
  
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error parsing JSON object:", error);
    return {};
  }
} 

export function getRandomGreeting(name: string): string {
  const greetings = [
    `Welcome back, ${name}!`,
    `Good to see you, ${name}!`,
    `Hello, ${name}!`,
    `Hey there, ${name}!`,
    `Great to have you back, ${name}!`
  ];
  
  return greetings[Math.floor(Math.random() * greetings.length)];
} 