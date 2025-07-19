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
  
  // CRITICAL: Identify and wrap mathematical expressions from text
  console.log('🔍 Processing content for math rendering:', processed.substring(0, 200));
  
  // Skip if already heavily wrapped
  if (processed.includes('\\(') && processed.includes('\\)')) {
    console.log('✅ Content already contains LaTeX delimiters');
    return processed
      .replace(/\n\n+/g, '</p><p>')
      .replace(/^(?!<p>)/, '<p>')
      .replace(/(?!<\/p>)$/, '</p>')
      .replace(/<p><\/p>/g, '')
      .replace(/\n/g, '<br>');
  }
  
  // 1. Convert corrupted patterns first
  processed = processed.replace(/(\w+)\s+to\s+the\s+power\s+of\s+(\w+)/g, '\\($1^{$2}\\)');
  processed = processed.replace(/(\w+)\s+subscript\s+(\w+)/g, '\\($1_{$2}\\)');
  processed = processed.replace(/(\w+)\s+superscript\s+(\w+)/g, '\\($1^{$2}\\)');
  processed = processed.replace(/bmatrix\s+([^b]+?)\s+bmatrix/g, '\\(\\begin{bmatrix} $1 \\end{bmatrix}\\)');
  processed = processed.replace(/(\w+)\s+over\s+(\w+)/g, '\\(\\frac{$1}{$2}\\)');
  
  // 2. Wrap unwrapped LaTeX expressions
  processed = processed.replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '\\(\\frac{$1}{$2}\\)');
  processed = processed.replace(/\\lim_\{([^}]*)\}/g, '\\(\\lim_{$1}\\)');
  processed = processed.replace(/\\int(?:_\{([^}]*)\})?(?:\^\{([^}]*)\})?/g, (match) => `\\(${match}\\)`);
  processed = processed.replace(/\\sum_\{([^}]*)\}\^\{([^}]*)\}/g, '\\(\\sum_{$1}^{$2}\\)');
  processed = processed.replace(/\\sqrt\{([^}]*)\}/g, '\\(\\sqrt{$1}\\)');
  processed = processed.replace(/\\begin\{bmatrix\}(.*?)\\end\{bmatrix\}/g, '\\(\\begin{bmatrix}$1\\end{bmatrix}\\)');
  
  // 3. Mathematical expressions in normal text
  
  // Function expressions: f(x), g(x,y), etc.
  processed = processed.replace(/\b([a-zA-Z])(\([^)]+\))/g, '\\($1$2\\)');
  
  // Mathematical equations with equals
  processed = processed.replace(/\b([a-zA-Z](?:\([^)]*\))?)\s*=\s*([a-zA-Z0-9c](?:\([^)]*\))?)\b/g, '\\($1 = $2\\)');
  
  // Variables with subscripts/superscripts in normal text (F_x, x^2)
  processed = processed.replace(/\b([a-zA-Z])_([a-zA-Z0-9])\b/g, '\\($1_$2\\)');
  processed = processed.replace(/\b([a-zA-Z])\^([a-zA-Z0-9])\b/g, '\\($1^$2\\)');
  
  // Mathematical operators and comparisons
  processed = processed.replace(/([a-zA-Z](?:\([^)]*\))?)\s*>\s*([a-zA-Z0-9])/g, '\\($1 > $2\\)');
  processed = processed.replace(/([a-zA-Z](?:\([^)]*\))?)\s*<\s*([a-zA-Z0-9])/g, '\\($1 < $2\\)');
  processed = processed.replace(/([a-zA-Z](?:\([^)]*\))?)\s*>=\s*([a-zA-Z0-9])/g, '\\($1 \\geq $2\\)');
  processed = processed.replace(/([a-zA-Z](?:\([^)]*\))?)\s*<=\s*([a-zA-Z0-9])/g, '\\($1 \\leq $2\\)');
  
  // Simple variable expressions
  processed = processed.replace(/\b(\d+)([a-zA-Z])\b/g, '\\($1$2\\)');
  processed = processed.replace(/\b([a-zA-Z])\s*\+\s*([a-zA-Z])\b/g, '\\($1 + $2\\)');
  processed = processed.replace(/\b([a-zA-Z])\s*-\s*([a-zA-Z])\b/g, '\\($1 - $2\\)');
  
  // Common mathematical elements
  processed = processed.replace(/\b(dx|dy|dt|du|dv)\b/g, '\\($1\\)');
  processed = processed.replace(/\b([a-zA-Z])\^2\b/g, '\\($1^2\\)');
  processed = processed.replace(/\b([a-zA-Z])\^3\b/g, '\\($1^3\\)');
  
  // Greek letters
  const greekLetters = ['alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta', 'iota', 'kappa', 'lambda', 'mu', 'nu', 'xi', 'omicron', 'pi', 'rho', 'sigma', 'tau', 'upsilon', 'phi', 'chi', 'psi', 'omega'];
  greekLetters.forEach(letter => {
    const regex = new RegExp(`\\b${letter}\\b`, 'g');
    processed = processed.replace(regex, `\\(\\${letter}\\)`);
  });
  
  console.log('🎯 Math processing complete, result length:', processed.length);
  
  // Convert to HTML paragraphs
  return processed
    .replace(/\n\n+/g, '</p><p>')
    .replace(/^(?!<p>)/, '<p>')
    .replace(/(?!<\/p>)$/, '</p>')
    .replace(/<p><\/p>/g, '')
    .replace(/\n/g, '<br>');
}