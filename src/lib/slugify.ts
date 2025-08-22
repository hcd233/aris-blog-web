/**
 * Slug generation utility for English, Chinese, and Japanese text
 * Supports automatic language detection and appropriate slug generation
 */

import { pinyin } from 'pinyin-pro';

// kuroshiro is primarily designed for browser environments
// We'll use dynamic imports for browser compatibility
let kuroshiroInstance: any = null;
let kuroshiroInitialized = false;

// Language detection patterns
const LANGUAGE_PATTERNS = {
  CHINESE: /[\u4e00-\u9fff]/, // Chinese characters
  JAPANESE: /[\u3040-\u309f\u30a0-\u30ff\u31f0-\u31ff]/, // Hiragana, Katakana
  ENGLISH: /[a-zA-Z]/ // Basic Latin
};

/**
 * Detect the primary language of the input text
 */
function detectLanguage(text: string): 'chinese' | 'japanese' | 'english' | 'mixed' {
  const hasChinese = LANGUAGE_PATTERNS.CHINESE.test(text);
  const hasJapanese = LANGUAGE_PATTERNS.JAPANESE.test(text);
  const hasEnglish = LANGUAGE_PATTERNS.ENGLISH.test(text);

  const languageCount = [hasChinese, hasJapanese, hasEnglish].filter(Boolean).length;
  
  if (languageCount > 1) return 'mixed';
  if (hasChinese) return 'chinese';
  if (hasJapanese) return 'japanese';
  return 'english';
}

/**
 * Convert Chinese characters to pinyin using pinyin-pro
 */
function chineseToPinyin(text: string): string {
  try {
    return pinyin(text, {
      toneType: 'none',      // Remove tone marks
      type: 'string',        // Return as string
      separator: ' ',        // Separate words with spaces
      nonZh: 'consecutive'   // Handle non-Chinese characters
    });
  } catch (error) {
    console.warn('Failed to convert Chinese to pinyin:', error);
    return text; // Fallback to original text
  }
}

/**
 * Initialize kuroshiro for Japanese conversion (browser only)
 */
async function initializeKuroshiro(): Promise<boolean> {
  if (kuroshiroInitialized) return true;
  
  // Only initialize in browser environments
  if (typeof window === 'undefined') {
    return false;
  }
  
  try {
    // Dynamic imports for browser compatibility
    const { default: Kuroshiro } = await import('kuroshiro');
    const { default: KuromojiAnalyzer } = await import('kuroshiro-analyzer-kuromoji');
    
    kuroshiroInstance = new Kuroshiro();
    
    // Configure kuromoji analyzer with proper dictionary path
    const analyzer = new KuromojiAnalyzer({
      dictPath: '/dict/' // Dictionary files are served from public/dict/
    });
    
    await kuroshiroInstance.init(analyzer);
    kuroshiroInitialized = true;
    return true;
  } catch (error) {
    console.warn('Failed to initialize kuroshiro (browser only):', error);
    kuroshiroInstance = null;
    return false;
  }
}

/**
 * Convert Japanese text to romaji using kuroshiro
 */
async function japaneseToRomaji(text: string): Promise<string> {
  if (!kuroshiroInitialized) {
    const initialized = await initializeKuroshiro();
    if (!initialized || !kuroshiroInstance) {
      console.warn('Kuroshiro not available, using fallback conversion');
      return text; // Fallback to original text
    }
  }

  try {
    return await kuroshiroInstance!.convert(text, {
      to: 'romaji',
      mode: 'normal',
      romajiSystem: 'hepburn'
    });
  } catch (error) {
    console.warn('Failed to convert Japanese to romaji:', error);
    return text; // Fallback to original text
  }
}

/**
 * Generate a slug from text, supporting multiple languages
 */
export async function generateSlug(text: string): Promise<string> {
  if (!text || typeof text !== 'string') return '';
  
  const language = detectLanguage(text);
  let processedText = text;

  switch (language) {
    case 'chinese':
      processedText = chineseToPinyin(text);
      break;
    case 'japanese':
      processedText = await japaneseToRomaji(text);
      break;
    case 'mixed':
      // For mixed content, process each language segment separately
      const segments = text.split(/([\u4e00-\u9fff]+|[\u3040-\u309f\u30a0-\u30ff\u31f0-\u31ff]+|[a-zA-Z]+)/);
      const processedSegments = await Promise.all(
        segments.map(async segment => {
          if (LANGUAGE_PATTERNS.CHINESE.test(segment)) {
            return chineseToPinyin(segment);
          } else if (LANGUAGE_PATTERNS.JAPANESE.test(segment)) {
            return await japaneseToRomaji(segment);
          }
          return segment;
        })
      );
      processedText = processedSegments.join(' ');
      break;
  }

  // Convert to lowercase and generate slug
  return processedText
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with hyphens
    .replace(/[^\w\-]+/g, '')       // Remove non-word characters except hyphens
    .replace(/\-\-+/g, '-')         // Replace multiple hyphens with single
    .replace(/^-+/, '')             // Trim hyphens from start
    .replace(/-+$/, '');            // Trim hyphens from end
}

/**
 * Generate a slug with fallback options
 */
export async function generateSlugWithFallback(
  text: string, 
  options: { 
    fallback?: string; 
    maxLength?: number; 
    separator?: string 
  } = {}
): Promise<string> {
  const {
    fallback = 'untitled',
    maxLength = 60,
    separator = '-'
  } = options;

  let slug = await generateSlug(text);
  
  if (!slug) {
    slug = await generateSlug(fallback);
  }

  // Ensure slug doesn't exceed max length
  if (slug.length > maxLength) {
    slug = slug.substring(0, maxLength);
    // Don't end with a separator
    if (slug.endsWith(separator)) {
      slug = slug.substring(0, slug.length - 1);
    }
  }

  return slug;
}