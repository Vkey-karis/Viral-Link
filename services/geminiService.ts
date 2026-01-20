
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

// --- Helper to validate API Key for Veo ---
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

// --- Helper: Sleep ---
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Robust Retry Wrapper for API calls
 */
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

const cleanAndParseJson = <T>(text: string): T => {
  if (!text) throw new Error("Empty response from AI");
  let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
  const start = cleanText.indexOf(cleanText.startsWith('[') ? '[' : '{');
  const end = cleanText.lastIndexOf(cleanText.startsWith('[') ? ']' : '}');
  if (start !== -1 && end !== -1) cleanText = cleanText.substring(start, end + 1);
  return JSON.parse(cleanText);
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
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });
    return cleanAndParseJson<TrendingProduct[]>(response.text || "[]");
  });
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
    Marketplace detection is mandatory.
    Translate everything to ${language}.
    RETURN ONLY A STRICT VALID JSON OBJECT.
  `;

  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });
    const data = cleanAndParseJson<any>(response.text || "{}");
    // Ensure arrays are initialized to prevent downstream .join() errors
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
  });
};

export const generateViralCopy = async (product: ProductData): Promise<AdCopyPackage> => {
  const ai = getClient();
  const prompt = `
    Act as a Direct Response Marketing Genius.
    Create a viral ad package for the product: "${product.title}".
    
    PRODUCT DETAILS:
    - Price: ${product.price}
    - Marketplace: ${product.marketplace}
    - Features: ${(product.features || []).join(", ")}
    - Pain Points: ${(product.painPoints || []).join(", ")}
    - Benefits: ${(product.benefits || []).join(", ")}
    
    STRICT REQUIREMENTS:
    1. UNIQUENESS: Avoid generic marketing fluff like "best quality" or "revolutionary".
    2. RELEVANCY: Every hook and line MUST reference a specific feature or pain point listed above.
    3. LANGUAGE: Use ${product.language || 'English'}.
    4. FRAMEWORK: Use PAS (Problem-Agitation-Solution) for the long copy and AIDA for the hooks.
    
    RETURN ONLY A STRICT VALID JSON OBJECT.
  `;
  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hooks: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 unique, hyper-specific hooks using product features." },
            shortCopy: { type: Type.STRING, description: "Punchy, benefit-driven short copy." },
            longCopy: { type: Type.STRING, description: "Detailed PAS framework copy referencing specific pain points." },
            ctaLines: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Direct calls to action including the marketplace name." },
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["hooks", "shortCopy", "longCopy", "ctaLines", "hashtags"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  });
};

export const generateVideoScript = async (product: ProductData, duration: string, template: VideoTemplate = 'VIRAL_HOOK'): Promise<VideoScript> => {
  const ai = getClient();
  const prompt = `
    Act as a Viral Video Production Director for TikTok and IG Reels.
    Produce a ${duration} video script for: "${product.title}".
    
    CONTEXT:
    - Description: ${product.description}
    - Top Features: ${(product.features || []).join(", ")}
    - Pain Points: ${(product.painPoints || []).join(", ")}
    - Core Benefits: ${(product.benefits || []).join(", ")}
    - Template Style: ${template}
    
    STRICT PRODUCTION REQUIREMENTS:
    1. HYPER-SPECIFICITY: Do not use "a person using the product." Use "A close-up of the [Specific Feature] in action" or "Visualizing the [Specific Pain Point] being solved."
    2. TEMPLATE ADHERENCE: If template is 'BEFORE_AFTER', clearly contrast the pain point and benefit. If 'UNBOXING', focus on the tactile features.
    3. TRANSITIONS: Every scene MUST include a professional transition (e.g., "Fast Zoom", "Whip Pan", "Glitch").
    4. VEO PROMPTS: The 'visual' field must be a high-quality prompt for the Veo image-to-video engine.
    
    RETURN ONLY A STRICT VALID JSON OBJECT.
  `;
  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            duration: { type: Type.STRING },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  visual: { type: Type.STRING, description: "Hyper-specific cinematic description for Veo AI. Must describe the product specifically." },
                  audio: { type: Type.STRING, description: "The vocal script. Must mention a specific benefit or feature." },
                  overlayText: { type: Type.STRING, description: "On-screen punchy text." },
                  transition: { type: Type.STRING }
                },
                required: ["visual", "audio", "overlayText", "transition"]
              }
            }
          }
        }
      }
    });
    const result = JSON.parse(response.text || "{}") as VideoScript;
    result.voiceName = 'Puck';
    result.template = template;
    return result;
  });
};

export const generateSpeech = async (text: string, voiceName: string = 'Puck'): Promise<string> => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
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
