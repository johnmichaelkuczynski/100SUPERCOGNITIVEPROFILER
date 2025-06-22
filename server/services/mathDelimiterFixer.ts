// Advanced Math Delimiter and Currency Protection Service
// Implements intelligent LaTeX math delimiter detection with robust currency protection

export function sanitizeMathAndCurrency(text: string): string {
  console.log('🔧 ACTIVE: Converting mathematical expressions to proper LaTeX delimiters');
  
  // Step 1: Protect currency expressions with placeholders
  const currencyPlaceholders: { [key: string]: string } = {};
  let placeholderIndex = 0;
  
  // Protect obvious currency patterns
  const currencyPatterns = [
    /\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\b/g, // $1,000.00 format
    /\$(\d+\.?\d*)\s*(?:USD|dollars?|bucks?)\b/gi, // $50 USD, $25 dollars
    /\$(\d+(?:\.\d+)?[km]?)\b/gi // $50k, $2.5m, etc.
  ];
  
  let protectedText = text;
  currencyPatterns.forEach(pattern => {
    protectedText = protectedText.replace(pattern, (match) => {
      const placeholder = `__CURRENCY_${placeholderIndex++}__`;
      currencyPlaceholders[placeholder] = match;
      return placeholder;
    });
  });
  
  // Step 2: Convert mathematical expressions to proper LaTeX delimiters
  // Look for expressions with mathematical indicators
  const mathIndicators = /[\^_{}\\]|\\[a-zA-Z]+|\b(?:sin|cos|tan|log|ln|exp|sqrt|sum|int|lim|alpha|beta|gamma|theta|pi|sigma|mu|lambda|delta|epsilon|omega|phi|psi|chi|rho|tau|zeta|eta|nu|xi|kappa|upsilon)\b/;
  
  // Convert single dollar pairs that contain mathematical content
  protectedText = protectedText.replace(/\$([^$]+)\$/g, (match, content) => {
    // Check if content has mathematical indicators
    if (mathIndicators.test(content)) {
      return `\\(${content}\\)`;
    }
    // Otherwise leave as is (might be non-math content)
    return match;
  });
  
  // Step 3: Restore protected currency expressions
  Object.entries(currencyPlaceholders).forEach(([placeholder, original]) => {
    protectedText = protectedText.replace(placeholder, original);
  });
  
  console.log('Math delimiter conversion completed');
  return protectedText;
}

export function validateMathDelimiters(text: string): {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
  analysis: {
    currencyCount: number;
    mathExpressions: number;
    ambiguousDollars: number;
  };
} {
  const issues: string[] = [];
  const suggestions: string[] = [];
  
  // Analyze currency patterns
  const currencyPattern = /\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\b|\$(\d+\.?\d*)\s*(?:USD|dollars?|bucks?)\b/gi;
  const currencyMatches = text.match(currencyPattern) || [];
  
  // Analyze math expressions
  const mathIndicators = /[\^_{}\\]|\\[a-zA-Z]+|\b(?:sin|cos|tan|log|ln|exp|sqrt|sum|int|lim|alpha|beta|gamma|theta|pi|sigma|mu|lambda|delta|epsilon|omega)\b/;
  const dollarPairs = text.match(/\$([^$]+)\$/g) || [];
  
  let mathExpressions = 0;
  let ambiguousDollars = 0;
  
  dollarPairs.forEach(pair => {
    const content = pair.slice(1, -1); // Remove the $ delimiters
    if (mathIndicators.test(content)) {
      mathExpressions++;
    } else if (!/^\d+\.?\d*$/.test(content.trim())) {
      // Not a number, not clearly math - potentially ambiguous
      ambiguousDollars++;
      issues.push(`Ambiguous dollar expression: ${pair}`);
      suggestions.push(`If "${pair}" is math, add LaTeX symbols. If not, consider rewording.`);
    }
  });
  
  // Check for proper LaTeX delimiters
  const properInlineMath = text.match(/\\\\?\([^)]+\\\\?\)/g) || [];
  const properDisplayMath = text.match(/\\\\?\[[^\]]+\\\\?\]/g) || [];
  const doubleDollarMath = text.match(/\$\$[^$]+\$\$/g) || [];
  
  const analysis = {
    currencyCount: currencyMatches.length,
    mathExpressions,
    ambiguousDollars
  };
  
  console.log('Advanced math delimiter analysis:', {
    currency: analysis.currencyCount,
    mathExpressions: analysis.mathExpressions,
    ambiguous: analysis.ambiguousDollars,
    properInline: properInlineMath.length,
    properDisplay: properDisplayMath.length,
    doubleDollar: doubleDollarMath.length
  });
  
  return {
    isValid: issues.length === 0,
    issues,
    suggestions,
    analysis
  };
}

export function preprocessForMathJax(text: string): string {
  // Apply our sanitization before MathJax processing
  let processedText = sanitizeMathAndCurrency(text);
  
  // Ensure proper escaping for display math
  processedText = processedText.replace(/\\\[/g, '\\[');
  processedText = processedText.replace(/\\\]/g, '\\]');
  
  // Ensure proper escaping for inline math
  processedText = processedText.replace(/\\\(/g, '\\(');
  processedText = processedText.replace(/\\\)/g, '\\)');
  
  return processedText;
}

// Comprehensive test cases for the new intelligent system
export const testCases = {
  pureCurrenty: '$25 pasta, $3.50 coffee, $1,000 rent, $5 million budget',
  pureMath: '$U^{\\text{Veblen}}$ utility function, $\\alpha + \\beta$ coefficient',
  mixedContent: '$U^{\\text{Veblen}}$ utility with $25 price and $\\theta$ parameter',
  properLaTeX: '\\[U_{Smith} = \\max \\sum...\\] and \\(x^2\\) with $50 cost',
  doubleDollar: '$$E = mc^2$$ physics and $50 fee',
  ambiguous: '$hello world$ and $25 dollars$',
  complexCurrency: '$1,250.99 USD, dollars $500, $10k budget, $2.5 billion'
};

// Advanced test function with detailed analysis
export function runTests(): void {
  console.log('🧪 Testing intelligent math delimiter and currency protection:');
  
  Object.entries(testCases).forEach(([name, input]) => {
    console.log(`\n📝 Test: ${name}`);
    console.log(`Input:  ${input}`);
    
    const validation = validateMathDelimiters(input);
    console.log(`Analysis: ${validation.analysis.currencyCount} currency, ${validation.analysis.mathExpressions} math, ${validation.analysis.ambiguousDollars} ambiguous`);
    
    const output = sanitizeMathAndCurrency(input);
    console.log(`Output: ${output}`);
    
    if (validation.issues.length > 0) {
      console.log(`Issues: ${validation.issues.join(', ')}`);
    }
  });
}