// Advanced Math Delimiter and Currency Protection Service
// Implements intelligent LaTeX math delimiter detection with robust currency protection

export function sanitizeMathAndCurrency(text: string): string {
  console.log('🔧 Starting text cleanup - removing LaTeX markup');
  
  // Step 1: Remove all LaTeX delimiters and commands completely
  let cleaned = text;
  
  // Remove LaTeX delimiters completely
  cleaned = cleaned.replace(/\\\(/g, '');
  cleaned = cleaned.replace(/\\\)/g, '');
  cleaned = cleaned.replace(/\$\$/g, '');
  cleaned = cleaned.replace(/\\\[/g, '');
  cleaned = cleaned.replace(/\\\]/g, '');
  
  // Remove all LaTeX commands but keep the content where possible
  cleaned = cleaned.replace(/\\([a-zA-Z]+)\{([^}]*)\}/g, '$2'); // \command{content} -> content
  cleaned = cleaned.replace(/\\([a-zA-Z]+)/g, ''); // Remove standalone commands
  
  // Convert common math symbols to readable text
  const symbolToText: { [key: string]: string } = {
    // Greek letters to their names
    'α': 'alpha', 'β': 'beta', 'γ': 'gamma', 'δ': 'delta', 'ε': 'epsilon', 'ζ': 'zeta',
    'η': 'eta', 'θ': 'theta', 'ι': 'iota', 'κ': 'kappa', 'λ': 'lambda', 'μ': 'mu',
    'ν': 'nu', 'ξ': 'xi', 'π': 'pi', 'ρ': 'rho', 'σ': 'sigma',
    'τ': 'tau', 'υ': 'upsilon', 'φ': 'phi', 'χ': 'chi', 'ψ': 'psi', 'ω': 'omega',
    
    // Arrows to text
    '→': ' goes to ', '←': ' comes from ', '↔': ' corresponds to ',
    '⇒': ' implies ', '⇐': ' is implied by ', '⇔': ' if and only if ',
    
    // Math symbols to text
    '≤': ' less than or equal to ', '≥': ' greater than or equal to ', 
    '≠': ' not equal to ', '≡': ' is equivalent to ', '≈': ' approximately equals ',
    '∞': ' infinity ', '√': ' square root of ', '±': ' plus or minus ', 
    '×': ' times ', '÷': ' divided by ', '∑': ' sum of ', '∫': ' integral of ',
    '∂': ' partial derivative ', '∇': ' gradient ', '∴': ' therefore ', '∵': ' because ',
    '⊥': ' perpendicular to ', '∥': ' parallel to ', '∠': ' angle ', '°': ' degrees ',
    '∅': ' empty set ', '∈': ' is in ', '∉': ' is not in ', '⊆': ' is subset of ',
    '∪': ' union ', '∩': ' intersection ', '∀': ' for all ', '∃': ' there exists '
  };
  
  // Apply symbol to text conversions
  for (const [symbol, text] of Object.entries(symbolToText)) {
    const regex = new RegExp(symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    cleaned = cleaned.replace(regex, text);
  }
  
  // Remove any remaining curly braces, backslashes, and LaTeX artifacts
  cleaned = cleaned.replace(/[{}]/g, '');
  cleaned = cleaned.replace(/\\/g, '');
  cleaned = cleaned.replace(/\^(\w+)/g, ' to the power of $1');
  cleaned = cleaned.replace(/_(\w+)/g, ' subscript $1');
  
  // Clean up multiple spaces and normalize text
  cleaned = cleaned.replace(/\s+/g, ' ');
  cleaned = cleaned.replace(/\s*,\s*/g, ', ');
  cleaned = cleaned.replace(/\s*\.\s*/g, '. ');
  cleaned = cleaned.trim();
  
  console.log('🔧 Text cleaned - all LaTeX markup removed');
  return cleaned;
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