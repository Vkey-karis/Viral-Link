
export interface ProductData {
  title: string;
  price: string;
  description: string;
  features: string[];
  painPoints: string[];
  benefits: string[];
  reviewsSummary: string;
  marketplace: string;
  affiliateLink?: string;
  language?: string;
  imageData?: string; // Base64 string
  imageMimeType?: string;
}

export interface TrendingProduct {
  title: string;
  price: string;
  store: string;
  reason: string;
  url: string;
}

export interface AdCopyPackage {
  hooks: string[];
  shortCopy: string;
  longCopy: string;
  ctaLines: string[];
  hashtags: string[];
}

export type VideoTemplate = 'VIRAL_HOOK' | 'BEFORE_AFTER' | 'UNBOXING' | 'TOP_LIST' | 'PROBLEM_SOLVER' | 'WAKE_UP_CALL' | 'MEDICAL_CONTRAST' | 'STOP_LYING';

export interface VideoScript {
  duration: '15s' | '30s' | '40s';
  voiceName: string;
  template: VideoTemplate;
  scenes: {
    visual: string;
    audio: string;
    overlayText: string;
    transition: string;
  }[];
}

export interface GeneratedAsset {
  sceneIndex: number;
  videoUrl: string | null;
  audioUrl: string | null;
  visualPrompt: string;
  audioScript: string;
}

export interface SavedProject {
  id: string;
  createdAt: number;
  productData: ProductData;
  adCopy: AdCopyPackage;
  script: VideoScript;
}

export enum AppStep {
  LANDING = 0,
  INPUT = 1,
  STRATEGY = 2,
  VIDEO = 3,
  EXPORT = 4,
  HISTORY = 5,
  SEO_GUIDES = 6,
  PROFILE = 8
}
