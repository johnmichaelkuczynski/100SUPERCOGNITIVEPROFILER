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
  // Only collapse multiple regular spaces within lines, preserve line breaks and paragraph structure
  cleaned = cleaned.replace(/[^\S\n]{2,}/g, ' ');
  
  // Step 9: Unicode normalization to NFKC form
  // Compatibility decomposition followed by canonical composition
  cleaned = cleaned.normalize('NFKC');
  
  // Step 10: Normalize line endings first
  cleaned = cleaned.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Step 11: Preserve paragraph structure - don't collapse intentional line breaks
  // Remove trailing spaces at end of lines
  cleaned = cleaned.replace(/ +$/gm, '');
  
  // Step 12: Remove excessive blank lines (more than 2 consecutive) but preserve paragraph breaks
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
  // Step 13: Remove single leading spaces (formatting artifacts) but preserve intentional indentation
  cleaned = cleaned.replace(/^\s{1}(?!\s)/gm, '');
  
  // Step 14: Ensure proper paragraph separation
  // If we have very long lines without breaks, add paragraph breaks at sentence endings
  const lines = cleaned.split('\n');
  const processedLines = lines.map(line => {
    if (line.length > 500 && !line.includes('\n')) {
      // Split very long lines at sentence boundaries
      return line.replace(/([.!?])\s+([A-Z])/g, '$1\n\n$2');
    }
    return line;
  });
  cleaned = processedLines.join('\n');
  
  // Step 15: Final cleanup - remove excessive spaces but preserve structure
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
  // Step 16: Trim start and end whitespace
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