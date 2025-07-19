// Clean KaTeX math renderer - following user's exact specifications

export function renderMathContent(element: HTMLElement): void {
  if (!element || typeof window === 'undefined') return;
  
  if (window.renderMathInElement && typeof window.renderMathInElement === 'function') {
    try {
      window.renderMathInElement(element, {
        delimiters: [
          {left: "$$", right: "$$", display: true},
          {left: "\\(", right: "\\)", display: false}
        ],
        throwOnError: false
      });
      console.log('✅ KaTeX math rendered');
    } catch (error) {
      console.error('❌ KaTeX rendering failed:', error);
    }
  }
}

export function processContentForMathRendering(content: string): string {
  let processed = content;
  
  // CRITICAL: Convert the corrupted text patterns from user's image to proper LaTeX
  
  // Convert "to the power of" patterns: "R to the power of n" -> \(R^n\)
  processed = processed.replace(/(\w+)\s+to\s+the\s+power\s+of\s+(\w+)/g, '\\($1^{$2}\\)');
  processed = processed.replace(/(\w+)\s+to\s+the\s+power\s+of\s+(\d+)/g, '\\($1^$2\\)');
  
  // Convert subscript patterns: "subscript i" -> \(_i\), "subscript rev" -> \(_{rev}\)
  processed = processed.replace(/(\w+)\s+subscript\s+(\w+)/g, '\\($1_{$2}\\)');
  processed = processed.replace(/subscript\s+(\w+)/g, '\\(_{$1}\\)');
  
  // Convert superscript patterns: "superscript 2" -> \(^2\)
  processed = processed.replace(/(\w+)\s+superscript\s+(\w+)/g, '\\($1^{$2}\\)');
  processed = processed.replace(/superscript\s+(\w+)/g, '\\(^{$1}\\)');
  
  // Convert matrix notation: "bmatrix" -> proper matrix notation
  processed = processed.replace(/bmatrix\s+([^b]+?)\s+bmatrix/g, '\\(\\begin{bmatrix} $1 \\end{bmatrix}\\)');
  
  // Convert fractions with "over": "Q over T" -> \(\frac{Q}{T}\)
  processed = processed.replace(/(\w+)\s+over\s+(\w+)/g, '\\(\\frac{$1}{$2}\\)');
  
  // Convert already properly formatted LaTeX (unwrapped): frac{...}{...} -> \(\frac{...}{...}\)
  processed = processed.replace(/\bfrac\{([^}]*)\}\{([^}]*)\}/g, '\\(\\frac{$1}{$2}\\)');
  
  // Convert limits: lim_{...} -> \(\lim_{...}\)
  processed = processed.replace(/\blim_\{([^}]*)\}/g, '\\(\\lim_{$1}\\)');
  processed = processed.replace(/\blim\s+to\s+([^}\s]+)/g, '\\(\\lim \\to $1\\)');
  
  // Convert integrals: int_{...}^{...} or int -> \(\int_{...}^{...}\) or \(\int\)
  processed = processed.replace(/\bint_\{([^}]*)\}\^\{([^}]*)\}/g, '\\(\\int_{$1}^{$2}\\)');
  processed = processed.replace(/\bint\b/g, '\\(\\int\\)');
  
  // Convert summations: sum_{...}^{...} -> \(\sum_{...}^{...}\)
  processed = processed.replace(/\bsum_\{([^}]*)\}\^\{([^}]*)\}/g, '\\(\\sum_{$1}^{$2}\\)');
  
  // Convert square roots: sqrt{...} -> \(\sqrt{...}\)
  processed = processed.replace(/\bsqrt\{([^}]*)\}/g, '\\(\\sqrt{$1}\\)');
  
  // Convert simple variables with superscripts/subscripts: x^2, x_1, etc.
  processed = processed.replace(/\b([a-zA-Z])\^(\d+|\{[^}]*\})/g, '\\($1^$2\\)');
  processed = processed.replace(/\b([a-zA-Z])_(\d+|\{[^}]*\})/g, '\\($1_$2\\)');
  
  // Convert Greek letters: alpha, beta, gamma, etc.
  const greekLetters = ['alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta', 'iota', 'kappa', 'lambda', 'mu', 'nu', 'xi', 'omicron', 'pi', 'rho', 'sigma', 'tau', 'upsilon', 'phi', 'chi', 'psi', 'omega'];
  greekLetters.forEach(letter => {
    const regex = new RegExp(`\\b${letter}\\b`, 'g');
    processed = processed.replace(regex, `\\(\\${letter}\\)`);
  });
  
  // Convert common operators: -> becomes \rightarrow, <= becomes \leq, etc.
  processed = processed.replace(/\s+->\s+/g, ' \\(\\rightarrow\\) ');
  processed = processed.replace(/\s*<=\s*/g, ' \\(\\leq\\) ');
  processed = processed.replace(/\s*>=\s*/g, ' \\(\\geq\\) ');
  processed = processed.replace(/\s*!=\s*/g, ' \\(\\neq\\) ');
  processed = processed.replace(/\binfinity\b/g, '\\(\\infty\\)');
  
  // Convert to HTML paragraphs
  return processed
    .replace(/\n\n+/g, '</p><p>')
    .replace(/^(?!<p>)/, '<p>')
    .replace(/(?!<\/p>)$/, '</p>')
    .replace(/<p><\/p>/g, '')
    .replace(/\n/g, '<br>');
}