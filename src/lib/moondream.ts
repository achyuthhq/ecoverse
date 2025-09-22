/**
 * Moondream API client for image analysis
 * This module provides a simple client for the Moondream API
 */

// API settings
const MOONDREAM_API_URL = "https://api.moondream.ai/v1/caption";
const MOONDREAM_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlfaWQiOiIzYzg3OGRiNi1iZjM2LTRmNDQtOTRmNC1jYTM1YmIwOWZmZmMiLCJvcmdfaWQiOiJTemJwM01lcERtOWVuYTRDM0Y1bEtjR3BzVHFONWFuQyIsImlhdCI6MTc1MTk3ODc5NywidmVyIjoxfQ.Axo3V5_Eg2dTrONgQh78Uy7N4GGiTMfk8xacvG11q2g";

export interface MoondreamCaptionOptions {
  image: string | Buffer; // Base64 string or Buffer
  length?: "short" | "normal"; // Caption length (default: "normal")
  stream?: boolean; // Whether to stream the response (default: false)
}

export interface MoondreamCaptionResponse {
  request_id: string;
  caption: string;
}

export interface MoondreamStreamResponse {
  request_id: string;
  chunk: AsyncIterable<string>;
}

/**
 * Moondream API client
 */
export class MoondreamClient {
  private apiKey: string;
  private apiUrl: string;

  /**
   * Create a new Moondream client
   * @param options Client options
   */
  constructor(options?: { apiKey?: string; apiUrl?: string }) {
    this.apiKey = options?.apiKey || MOONDREAM_API_KEY;
    this.apiUrl = options?.apiUrl || MOONDREAM_API_URL;
  }

  /**
   * Generate a caption for an image
   * @param options Caption options
   * @returns Caption response
   */
  async caption(options: MoondreamCaptionOptions): Promise<MoondreamCaptionResponse | MoondreamStreamResponse> {
    // Convert Buffer to base64 if needed
    let imageBase64: string;
    if (Buffer.isBuffer(options.image)) {
      imageBase64 = options.image.toString('base64');
    } else if (typeof options.image === 'string') {
      // If it's already a base64 string, check if it has the data URL prefix
      if (options.image.startsWith('data:')) {
        // Extract the base64 part
        imageBase64 = options.image.split(',')[1];
      } else {
        imageBase64 = options.image;
      }
    } else {
      throw new Error('Image must be a base64 string or Buffer');
    }

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'X-Moondream-Auth': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: `data:image/jpeg;base64,${imageBase64}`,
        length: options.length || 'normal',
        stream: options.stream || false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Moondream API error: ${response.status} ${errorText}`);
    }

    if (options.stream) {
      // Handle streaming response
      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      // Create an async generator to yield chunks
      const stream = {
        request_id: `stream-${Date.now()}`,
        chunk: (async function* () {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            yield decoder.decode(value, { stream: true });
          }
        })(),
      };

      return stream as MoondreamStreamResponse;
    } else {
      // Handle regular response
      const data = await response.json();
      return data as MoondreamCaptionResponse;
    }
  }
}

// Export a default instance for convenience
export const moondream = new MoondreamClient();

/**
 * Extract main items from a caption
 * This is a utility function to extract the main objects from a caption
 * @param caption The caption to extract items from
 * @returns An array of detected items
 */
export function extractMainItems(caption: string): string[] {
  // Common waste items to look for
  const wasteItems = [
    "bottle", "can", "cup", "container", "bag", "box", "paper", "cardboard", 
    "plastic", "glass", "metal", "aluminum", "steel", "wood", "textile", 
    "electronic", "battery", "food", "organic", "plant", "vegetable", "fruit",
    "wrapper", "packaging", "foil", "styrofoam", "ceramic", "porcelain"
  ];
  
  // Convert caption to lowercase for case-insensitive matching
  const lowerCaption = caption.toLowerCase();
  
  // First, try to find exact matches of waste items
  const foundItems = wasteItems.filter(item => lowerCaption.includes(item));
  
  if (foundItems.length > 0) {
    return foundItems;
  }
  
  // If no waste items found, extract nouns using simple heuristics
  const words = caption.split(/\s+/);
  const nouns = words.filter(word => 
    // Filter out common articles, prepositions, etc.
    !["a", "an", "the", "in", "on", "at", "with", "by", "for", "to", "and", "or", "but", "is", "are"].includes(word.toLowerCase())
  );
  
  return nouns.length > 0 ? [nouns[0]] : ["unidentified object"];
} 