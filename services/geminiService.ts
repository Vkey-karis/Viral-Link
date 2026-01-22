
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ProductData, AdCopyPackage, VideoScript, TrendingProduct, VideoTemplate } from "../types";

const getClient = () => new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

/**
 * Custom Error Class for Gemini API issues
 */
export class GeminiApiError extends Error {
  public code?: number;
  public type: 'API_KEY' | 'QUOTA' | 'SAFETY' | 'NETWORK' | 'UNKNOWN';

  constructor(message: string, type: 'API_KEY' | 'QUOTA' | 'SAFETY' | 'NETWORK' | 'UNKNOWN', code?: number) {
    super(message);
    this.name = 'GeminiApiError';
    this.type = type;
    this.code = code;
  }
}

// --- Helpers ---
export const checkApiKey = async (): Promise<boolean> => {
  if (window.aistudio && window.aistudio.hasSelectedApiKey) {
    return await window.aistudio.hasSelectedApiKey();
  }
  return !!import.meta.env.VITE_GEMINI_API_KEY;
};

export const requestApiKey = async () => {
  if (window.aistudio && window.aistudio.openSelectKey) {
    await window.aistudio.openSelectKey();
  }
};

export const refreshApiKey = async () => {
  if (window.aistudio && window.aistudio.openSelectKey) {
    await window.aistudio.openSelectKey();
  }
}

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const callWithRetry = async <T>(fn: () => Promise<T>, retries = 5, delay = 3000): Promise<T> => {
  try {
    return await fn();
  } catch (err: any) {
    const code = err.code || err.error?.code || err.status;
    const msg = err.message || JSON.stringify(err);

    if (code === 401 || code === 403 || msg.includes('API key not valid')) {
      throw new GeminiApiError("Invalid or expired API Key.", 'API_KEY', code);
    }

    if (msg.includes('SAFETY') || msg.includes('blocked')) {
      throw new GeminiApiError("Content blocked by safety filters.", 'SAFETY', code);
    }

    const isRetryable = code === 429 || code === 503 || code === 504 ||
      msg.includes('quota') || msg.includes('limit') ||
      msg.includes('overloaded');

    if (retries > 0 && isRetryable) {
      await sleep(delay);
      return callWithRetry(fn, retries - 1, delay * 1.5);
    }

    if (code === 429) {
      throw new GeminiApiError("API Quota exceeded.", 'QUOTA', 429);
    }

    throw new GeminiApiError(msg || "Unexpected error.", 'UNKNOWN', code);
  }
};

// Robust JSON Parsing
// Robust JSON Parsing with Brace Counting
const cleanAndParseJson = <T>(text: string): T => {
  if (!text) throw new Error("Empty response from AI");

  const startObject = text.indexOf('{');
  const startArray = text.indexOf('[');

  // Decide where to start
  let start = -1;
  let isObject = false;
  if (startObject !== -1 && (startArray === -1 || startObject < startArray)) {
    start = startObject;
    isObject = true;
  } else if (startArray !== -1) {
    start = startArray;
    isObject = false;
  }

  if (start === -1) {
    if (text.includes("I am sorry") || text.includes("I cannot")) {
      throw new Error("AI Refusal: The model refused to process this link. content: " + text.substring(0, 100));
    }
    // No JSON found, try parsing the whole thing (might be a number or string)
    // or just fail.
    return JSON.parse(text);
  }

  // Iterate to find the matching closing brace
  let count = 0;
  let inString = false;
  let escape = false;
  let end = -1;

  const openChar = isObject ? '{' : '[';
  const closeChar = isObject ? '}' : ']';

  for (let i = start; i < text.length; i++) {
    const char = text[i];

    if (escape) {
      escape = false;
      continue;
    }

    if (char === '\\') {
      escape = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (!inString) {
      if (char === openChar) {
        count++;
      } else if (char === closeChar) {
        count--;
        if (count === 0) {
          end = i;
          break;
        }
      }
    }
  }

  if (end !== -1) {
    const jsonStr = text.substring(start, end + 1);
    try {
      return JSON.parse(jsonStr);
    } catch (e) {
      // If our fancy parser failed, fallback to the old "try everything" approach
      // This can happen if we messed up string counting
    }
  }

  // Fallback: Naive cleanup
  let clean = text.replace(/```json/g, '').replace(/```/g, '');
  const legacyStart = clean.indexOf(openChar);
  const legacyEnd = clean.lastIndexOf(closeChar);
  if (legacyStart !== -1 && legacyEnd !== -1) clean = clean.substring(legacyStart, legacyEnd + 1);
  return JSON.parse(clean);
};

// --- Feature 0: Global Discovery ---
export const findTrendingProducts = async (keyword: string): Promise<TrendingProduct[]> => {
  const ai = getClient();
  await sleep(500);

  const prompt = `
    Act as a Global Market Intelligence Engine. 
    Find 12 products related to "${keyword}" that satisfy these criteria:
    1. HIGH SEARCH VOLUME: Must be currently viral, trending, or have massive search intent.
    2. 40+ MARKETPLACE REACH: Search across Jumia, Selar, Amazon, Gumroad, Walmart, Shopee, Lazada, ClickBank, etc.
    
    RETURN ONLY A STRICTLY VALID JSON ARRAY.
    Keys: "title", "price", "store", "reason", "url".
  `;

  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });
    return cleanAndParseJson<TrendingProduct[]>(response.text || "[]");
  }, 3, 4000); // Increased initial delay to 4s to handle 429s
};

// --- Feature 1: Extraction ---
export const extractProductInfo = async (url: string, language: string = 'English'): Promise<ProductData> => {
  const ai = getClient();
  const prompt = `
    Deep scan this product URL: ${url}
    Extract all marketing intelligence.
    Identify:
    - Title
    - Price
    - Detailed Description
    - Top 5 Specific Features
    - Core Pain Points the product solves
    - Key Benefits
    - Summary of user reviews if available.
    
    CRITICAL: If the URL is not accessible via Google Search, use the URL text itself and the domain name to INFER the product details. DO NOT REFUSE.
    
    Marketplace detection is mandatory.
    Translate everything to ${language}.
    RETURN ONLY A STRICT VALID JSON OBJECT.
  `;

  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: prompt, // Use text prompt with search tool for extraction from URL context
      config: {
        tools: [{ googleSearch: {} }],
      }
    });
    const data = cleanAndParseJson<any>(response.text || "{}");
    return {
      title: data.title || 'Product Analysis',
      price: data.price || 'Contact for Price',
      description: data.description || '',
      features: Array.isArray(data.features) ? data.features : [],
      painPoints: Array.isArray(data.painPoints) ? data.painPoints : [],
      benefits: Array.isArray(data.benefits) ? data.benefits : [],
      reviewsSummary: data.reviewsSummary || '',
      marketplace: data.marketplace || 'Online Marketplace',
      language: language
    } as ProductData;
  }, 3, 4000);
};

export const generateViralCopy = async (product: ProductData): Promise<AdCopyPackage> => {
  const ai = getClient();
  const prompt = `
    Act as a Direct Response Marketing Genius.
    Create a viral ad package for the product: "${product.title || 'Innovative Product'}".
    
    PRODUCT DETAILS:
    - Price: ${product.price}
    - Marketplace: ${product.marketplace}
    - Features: ${(product.features && product.features.length > 0) ? product.features.join(", ") : "Innovative, Easy to use, Premium quality"}
    - Pain Points: ${(product.painPoints && product.painPoints.length > 0) ? product.painPoints.join(", ") : "Inconvenience, Wasted time, Low quality alternatives"}
    - Benefits: ${(product.benefits && product.benefits.length > 0) ? product.benefits.join(", ") : "Saves time, Improves lifestyle, Professional results"}
    
    STRICT REQUIREMENTS:
    1. UNIQUENESS: Avoid generic marketing fluff like "best quality" or "revolutionary".
    2. RELEVANCY: Every hook and line MUST reference a specific feature or pain point lists above.
    3. LANGUAGE: Use ${product.language || 'English'}.
    4. FRAMEWORK: Use PAS (Problem-Agitation-Solution) for the long copy and AIDA for the hooks.
    5. DATA INTEGRITY: loops or variables must not be returned. Return filled strings.
    
    RETURN ONLY A STRICT VALID JSON OBJECT with keys: "hooks", "shortCopy", "longCopy", "ctaLines", "hashtags".
  `;
  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });
    const data = cleanAndParseJson<AdCopyPackage>(response.text || "{}");
    return {
      hooks: Array.isArray(data.hooks) ? data.hooks : [],
      shortCopy: data.shortCopy || '',
      longCopy: data.longCopy || '',
      ctaLines: Array.isArray(data.ctaLines) ? data.ctaLines : [],
      hashtags: Array.isArray(data.hashtags) ? data.hashtags : []
    };
  }, 3, 2000);
};

export const generateVideoScript = async (product: ProductData, duration: string, template: VideoTemplate = 'VIRAL_HOOK'): Promise<VideoScript> => {
  const ai = getClient();
  const prompt = `
    Act as a Viral Video Production Director for TikTok and IG Reels.
    Produce a ${duration} video script for: "${product.title}".
    
    CONTEXT:
    - Description: ${product.description || 'A revolutionary new product.'}
    - Top Features: ${(product.features && product.features.length > 0) ? product.features.join(", ") : "Innovative design, Premium materials"}
    - Pain Points: ${(product.painPoints && product.painPoints.length > 0) ? product.painPoints.join(", ") : "Inefficiency, Frustration"}
    - Core Benefits: ${(product.benefits && product.benefits.length > 0) ? product.benefits.join(", ") : "Efficiency, Peace of mind"}
    - Template Style: ${template}
    
    STRICT PRODUCTION REQUIREMENTS:
    1. HYPER-SPECIFICITY: Do not use "a person using the product." Use "A close-up of the [Specific Feature] in action" or "Visualizing the [Specific Pain Point] being solved."
    2. TEMPLATE ADHERENCE: If template is 'BEFORE_AFTER', clearly contrast the pain point and benefit. If 'UNBOXING', focus on the tactile features.
    3. TRANSITIONS: Every scene MUST include a professional transition (e.g., "Fast Zoom", "Whip Pan", "Glitch").
    4. VEO PROMPTS: The 'visual' field must be a high-quality prompt for the Veo image-to-video engine.
    
    RETURN ONLY A STRICT VALID JSON OBJECT with this EXACT schema:
    {
      "scenes": [
        {
          "visual": "Detailed description of the visual scene...",
          "audio": "Voiceover line...",
          "overlayText": "Text on screen...",
          "transition": "Transition type..."
        }
      ]
    }
    ENSURE the "scenes" array is NOT empty. Generate at least 5 scenes.
    If product details are vague, use CREATIVE FREEDOM to invent plausible visuals and specialized benefits based on the product name: "${product.title}". DO NOT RETURN EMPTY SCENES.
  `;
  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });
    const result = cleanAndParseJson<VideoScript>(response.text || "{}");
    result.scenes = Array.isArray(result.scenes) ? result.scenes : [];
    result.voiceName = 'Puck';
    result.template = template;
    return result;
  }, 3, 2000);
};

export const generateSpeech = async (text: string, voiceName: string = 'Puck'): Promise<string> => {
  const ai = getClient();
  // Using gemini-2.0-flash-exp for Audio capability
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash-exp",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
    },
  });
  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("Audio generation failed.");
  const binaryString = window.atob(base64Audio);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return URL.createObjectURL(new Blob([bytes], { type: 'audio/wav' }));
};

export const generateVeoVideo = async (visualPrompt: string, product: ProductData, isImageToVideo: boolean = false): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
  const enhancedPrompt = `Cinematic advertising, 4k resolution, vertical 9:16 aspect ratio. ${visualPrompt}. Professional product cinematography.`;
  let operation;
  // Veo 3.1 is correct for video
  if (isImageToVideo && product.imageData && product.imageMimeType) {
    const base64Data = product.imageData.split(',')[1];
    operation = await ai.models.generateVideos({
      model: 'veo-3.1-generate-preview',
      prompt: enhancedPrompt,
      image: { imageBytes: base64Data, mimeType: product.imageMimeType },
      config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '9:16' }
    });
  } else {
    operation = await ai.models.generateVideos({
      model: 'veo-3.1-generate-preview',
      prompt: enhancedPrompt,
      config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '9:16' }
    });
  }
  while (!operation.done) {
    await sleep(10000);
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }
  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
  const authenticatedUrl = `${videoUri}&key=${import.meta.env.VITE_GEMINI_API_KEY}`;
  const response = await fetch(authenticatedUrl);
  return URL.createObjectURL(await response.blob());
};
