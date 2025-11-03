// Simple token counter (approximate)
// In production, you might want to use tiktoken library via a Python service

export const countTokens = (text) => {
  if (!text || typeof text !== 'string') return 0;
  
  // Approximate token count: 1 token ≈ 4 characters for English text
  // This is a rough estimation - for accurate counts, use tiktoken
  const wordCount = text.trim().split(/\s+/).length;
  const charCount = text.length;
  
  // Average of word-based and character-based estimation
  const estimatedTokens = Math.round((wordCount + (charCount / 4)) / 2);
  
  return Math.max(1, estimatedTokens);
};

export const calculateCost = (model, promptTokens, completionTokens) => {
  const modelPricing = {
    'gpt-3.5-turbo': {
      input: 0.0015 / 1000,  // $0.0015 per 1K tokens
      output: 0.002 / 1000   // $0.002 per 1K tokens
    },
    'gpt-4': {
      input: 0.03 / 1000,    // $0.03 per 1K tokens
      output: 0.06 / 1000    // $0.06 per 1K tokens
    },
    'claude-2': {
      input: 0.01102 / 1000, // $0.01102 per 1K tokens
      output: 0.03268 / 1000 // $0.03268 per 1K tokens
    },
    'llama-2-70b': {
      input: 0.0009 / 1000,  // $0.0009 per 1K tokens
      output: 0.0009 / 1000  // $0.0009 per 1K tokens
    },
    'mistral-7b': {
      input: 0.0002 / 1000,  // $0.0002 per 1K tokens
      output: 0.0002 / 1000  // $0.0002 per 1K tokens
    }
  };

  const pricing = modelPricing[model] || modelPricing['gpt-3.5-turbo'];
  
  const inputCost = promptTokens * pricing.input;
  const outputCost = completionTokens * pricing.output;
  
  return parseFloat((inputCost + outputCost).toFixed(6));
};