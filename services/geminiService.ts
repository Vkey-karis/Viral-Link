
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

  const productsSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        price: { type: Type.STRING },
        store: { type: Type.STRING },
        reason: { type: Type.STRING },
        url: { type: Type.STRING }
      },
      required: ["title", "price", "store", "reason", "url"]
    }
  };

  const prompt = `
    Act as a Global Market Intelligence Engine. 
    Find 12 products related to "${keyword}" that satisfy these criteria:
    1. HIGH SEARCH VOLUME: Must be currently viral, trending, or have massive search intent.
    2. 40+ MARKETPLACE REACH: Search across Jumia, Selar, Amazon, Gumroad, Walmart, Shopee, Lazada, ClickBank, etc.
    
    For each product, provide:
    - title: Product name
    - price: Price with currency (e.g., "$29.99" or "₦15,000")
    - store: Marketplace name
    - reason: Why it's trending (1 sentence)
    - url: Direct product URL
    
    Return ONLY valid JSON conforming to the schema.
  `;

  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: productsSchema,
        tools: [{ googleSearch: {} }],
      }
    });

    const data = JSON.parse(response.text || "[]");
    return Array.isArray(data) ? data : [];
  }, 3, 4000);
};

// --- Feature 1: Extraction ---
export const extractProductInfo = async (url: string, language: string = 'English'): Promise<ProductData> => {
  const ai = getClient();

  const prompt = `
    Deep scan this product URL: ${url}
    
    TASK: Extract all marketing intelligence.
    
    STRICT REQUIREMENTS:
    1.  **ACCURACY**: Extract actual data from the page. If the URL is not accessible via Google Search, infer from the URL structure and common knowledge about such products.
    2.  **LANGUAGE**: Translate ALL output to ${language}.
    3.  **LISTS**: Ensure 'features', 'painPoints', and 'benefits' have at least 3-5 items each.
    4.  **FORMAT**: Return ONLY a valid JSON object. Do not include markdown formatting like \`\`\`json.
    
    Keys to Identify:
    - title
    - price (with currency)
    - description (detailed)
    - features (array of strings)
    - painPoints (array of strings)
    - benefits (array of strings)
    - reviewsSummary
    - marketplace (e.g. Amazon, Jumia)
  `;

  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: prompt,
      config: {
        // Removed googleSearch tool to avoid conflict with JSON parsing
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

  const copySchema = {
    type: Type.OBJECT,
    properties: {
      hooks: { type: Type.ARRAY, items: { type: Type.STRING } },
      shortCopy: { type: Type.STRING },
      longCopy: { type: Type.STRING },
      ctaLines: { type: Type.ARRAY, items: { type: Type.STRING } },
      hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
    required: ["hooks", "shortCopy", "longCopy", "ctaLines", "hashtags"]
  };

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
    
    Generate the response strictly conforming to the JSON schema provided.
  `;

  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: copySchema
      }
    });

    const data = JSON.parse(response.text || "{}");

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

  const scriptSchema = {
    type: Type.OBJECT,
    properties: {
      scenes: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            visual: { type: Type.STRING, description: "Detailed visual description for the scene." },
            audio: { type: Type.STRING, description: "Voiceover script for the scene." },
            overlayText: { type: Type.STRING, description: "Text overlay on the video." },
            transition: { type: Type.STRING, description: "Transition to the next scene." },
          },
          required: ["visual", "audio", "overlayText", "transition"],
        },
      },
    },
    required: ["scenes"],
  };

  const prompt = `
    Act as a Viral Video Production Director.
    Create a ${duration} video script for the product: "${product.title}".

    PRODUCT DATA (YOU MUST USE THIS):
    - Description: ${product.description}
    - Features: ${(product.features && product.features.length > 0) ? product.features.join(", ") : "Innovative features"}
    - Pain Points: ${(product.painPoints && product.painPoints.length > 0) ? product.painPoints.join(", ") : "Common struggles"}
    - Benefits: ${(product.benefits && product.benefits.length > 0) ? product.benefits.join(", ") : "Key advantages"}
    - Template: ${template}

    STRICT INSTRUCTIONS:
    1.  **RELEVANCE**: The 'visual' and 'audio' fields MUST explicitly reference the product's specific features. Do NOT use generic phrases like "using the device". Instead use "Pressing the [Feature Name] button" or "Showing the [Benefit] result".
    2.  **SCENE COUNT**: Generate exactly 5-8 scenes for a ${duration} video.
    3.  **HOOK**: The first scene detailed visual must be a scroll-stopper related to "${product.painPoints?.[0] || 'the problem'}".
    4.  **CTA**: The final scene must include a strong Call to Action.

    Generate the response strictly conforming to the JSON schema provided.
  `;

  try {
    return await callWithRetry(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: scriptSchema,
        }
      });

      const result = JSON.parse(response.text || "{}");

      if (!result.scenes || !Array.isArray(result.scenes) || result.scenes.length === 0) {
        throw new Error("Empty scenes generated");
      }

      // Post-processing to ensure no hallucinated fields
      result.scenes = result.scenes.map(s => ({
        visual: s.visual || "Product showcase",
        audio: s.audio || "",
        overlayText: s.overlayText || "",
        transition: s.transition || "Cut"
      }));

      result.voiceName = 'Puck'; // Default defaults
      result.template = template;
      return result;
    }, 3, 2000);
  } catch (error) {
    console.error("Gemini Script Gen Failed, using fallback:", error);
    // Fallback Template
    return {
      duration: duration as any,
      voiceName: 'Puck',
      template: template,
      scenes: [
        {
          visual: `Close up of ${product.title} in a well-lit environment.`,
          audio: `Stop scrolling! You need to see this.`,
          overlayText: "STOP SCROLLING 🛑",
          transition: "None"
        },
        {
          visual: `Demonstration of ${product.title} being used efficiently.`,
          audio: `This is the solution we've all been waiting for.`,
          overlayText: "GAME CHANGER 🚀",
          transition: "Whip Pan"
        },
        {
          visual: `Comparison shot showing the old way vs the new way with ${product.title}.`,
          audio: `Forget about the old struggle. This is the future.`,
          overlayText: "BEFORE vs AFTER",
          transition: "Split Screen"
        },
        {
          visual: `Happy user enjoying ${product.title}.`,
          audio: `Get yours today and feel the difference.`,
          overlayText: "LINK IN BIO 🔗",
          transition: "Fade"
        }
      ]
    };
  }
};

export const generateSpeech = async (text: string, voiceName: string = 'Puck'): Promise<string> => {
  const ai = getClient();

  try {
    // Using gemini-2.0-flash for Audio capability
    console.log("Generating speech with model: gemini-2.0-flash");
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ parts: [{ text }] }],
      config: {
        // responseModalities: [Modality.AUDIO], // Removed to fix 400 error
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
      },
    });
    console.log("Speech generation response received.");

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("Audio generation failed - no audio data returned.");

    const binaryString = window.atob(base64Audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return URL.createObjectURL(new Blob([bytes], { type: 'audio/wav' }));
  } catch (error: any) {
    console.error('Audio generation error:', error);
    throw new Error(`Failed to generate audio: ${error.message || 'Unknown error'}`);
  }
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
