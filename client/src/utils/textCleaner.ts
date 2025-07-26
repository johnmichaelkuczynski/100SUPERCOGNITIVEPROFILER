/**
 * Text Cleaner Utility
 * 
 * Removes hidden formatting artifacts and normalizes text without altering content.
 * This is NOT a rewriting function - it only cleans formatting.
 */

export function cleanText(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  let cleaned = input;

  // Step 1: Remove invisible control characters
  // Zero-width characters, BOM, line separators, paragraph separators
  cleaned = cleaned.replace(/[\u200B\u200C\u200D\uFEFF\u2028\u2029]/g, '');
  
  // Step 2: Convert smart quotes to straight quotes
  // Opening/closing double quotes
  cleaned = cleaned.replace(/[\u201C\u201D]/g, '"');
  // Opening/closing single quotes
  cleaned = cleaned.replace(/[\u2018\u2019]/g, "'");
  // Double prime to double quote
  cleaned = cleaned.replace(/\u2033/g, '"');
  // Prime to single quote
  cleaned = cleaned.replace(/\u2032/g, "'");

  // Step 3: Replace non-breaking spaces with regular spaces
  cleaned = cleaned.replace(/\u00A0/g, ' ');
  
  // Step 4: Replace other unusual space characters
  // En quad, em quad, en space, em space, three-per-em space, etc.
  cleaned = cleaned.replace(/[\u2000-\u200A\u202F\u205F]/g, ' ');
  
  // Step 5: Convert dashes to standard forms
  // En dash and em dash to hyphen-minus (optional normalization)
  cleaned = cleaned.replace(/[\u2013\u2014]/g, '-');
  
  // Step 6: Convert ellipsis character to three dots
  cleaned = cleaned.replace(/\u2026/g, '...');
  
  // Step 7: Remove other invisible formatting characters
  // Soft hyphen, word joiner, etc.
  cleaned = cleaned.replace(/[\u00AD\u2060]/g, '');
  
  // Step 8: Normalize consecutive spaces to single spaces (but preserve intentional spacing)
  // Only collapse multiple regular spaces, preserve line breaks
  cleaned = cleaned.replace(/ {2,}/g, ' ');
  
  // Step 9: Unicode normalization to NFKC form
  // Compatibility decomposition followed by canonical composition
  cleaned = cleaned.normalize('NFKC');
  
  // Step 10: Clean up whitespace at line boundaries while preserving structure
  // Remove trailing spaces at end of lines
  cleaned = cleaned.replace(/ +$/gm, '');
  // Remove leading spaces at start of lines (but preserve intentional indentation)
  // Only remove single leading space (likely formatting artifact)
  cleaned = cleaned.replace(/^ /gm, '');
  
  // Step 11: Normalize line endings to \n
  cleaned = cleaned.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Step 12: Remove excessive blank lines (more than 2 consecutive)
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
  // Step 13: Trim start and end whitespace
  cleaned = cleaned.trim();

  return cleaned;
}

/**
 * Get detailed statistics about what was cleaned
 */
export function getCleaningStats(original: string, cleaned: string): {
  originalLength: number;
  cleanedLength: number;
  charactersRemoved: number;
  invisibleCharsRemoved: number;
  smartQuotesConverted: number;
  spacesNormalized: number;
} {
  const originalLength = original.length;
  const cleanedLength = cleaned.length;
  const charactersRemoved = originalLength - cleanedLength;
  
  // Count specific types of characters that were cleaned
  const invisibleChars = (original.match(/[\u200B\u200C\u200D\uFEFF\u2028\u2029\u00AD\u2060]/g) || []).length;
  const smartQuotes = (original.match(/[\u201C\u201D\u2018\u2019\u2032\u2033]/g) || []).length;
  const nonBreakingSpaces = (original.match(/[\u00A0\u2000-\u200A\u202F\u205F]/g) || []).length;
  
  return {
    originalLength,
    cleanedLength,
    charactersRemoved,
    invisibleCharsRemoved: invisibleChars,
    smartQuotesConverted: smartQuotes,
    spacesNormalized: nonBreakingSpaces
  };
}

/**
 * Preview function to show what characters will be cleaned
 */
export function previewCleaning(input: string): {
  invisibleChars: string[];
  smartQuotes: string[];
  specialSpaces: string[];
  otherIssues: string[];
} {
  const invisibleChars = Array.from(new Set(input.match(/[\u200B\u200C\u200D\uFEFF\u2028\u2029\u00AD\u2060]/g) || []));
  const smartQuotes = Array.from(new Set(input.match(/[\u201C\u201D\u2018\u2019\u2032\u2033]/g) || []));
  const specialSpaces = Array.from(new Set(input.match(/[\u00A0\u2000-\u200A\u202F\u205F]/g) || []));
  const consecutiveSpaces = input.match(/ {2,}/g) || [];
  const excessiveLineBreaks = input.match(/\n{3,}/g) || [];
  
  const otherIssues = [
    ...consecutiveSpaces.map(s => `${s.length} consecutive spaces`),
    ...excessiveLineBreaks.map(s => `${s.length} consecutive line breaks`)
  ];
  
  return {
    invisibleChars,
    smartQuotes,
    specialSpaces,
    otherIssues
  };
}