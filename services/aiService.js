import axios from 'axios';
import { countTokens, calculateCost } from '../utils/tokenCounter.js';

class AIService {
  constructor() {
    this.hfApiKey = process.env.HUGGING_FACE_API_KEY;
    this.baseURL = process.env.HF_API_URL;
  }

  async processPrompt(prompt, model = 'gpt-3.5-turbo') {
    const startTime = Date.now();
    
    try {
      // Count prompt tokens
      const promptTokens = countTokens(prompt);
      
      let response;
      let completionTokens = 0;
      
      if (model.startsWith('gpt-')) {
        // Simulate OpenAI API call (replace with actual API call)
        response = await this.simulateOpenAIResponse(prompt);
      } else {
        // Hugging Face API call
        response = await this.callHuggingFaceAPI(prompt, model);
      }
      
      // Count completion tokens
      completionTokens = countTokens(response);
      const totalTokens = promptTokens + completionTokens;
      
      // Calculate response time
      const responseTime = Date.now() - startTime;
      
      // Calculate cost
      const estimatedCost = calculateCost(model, promptTokens, completionTokens);
      
      return {
        success: true,
        data: {
          prompt,
          response,
          modelUsed: model,
          promptTokens,
          completionTokens,
          totalTokens,
          estimatedCost,
          responseTime,
          status: 'success'
        }
      };
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        success: false,
        error: error.message,
        data: {
          prompt,
          response: '',
          modelUsed: model,
          promptTokens: countTokens(prompt),
          completionTokens: 0,
          totalTokens: countTokens(prompt),
          estimatedCost: 0,
          responseTime,
          status: 'error',
          errorMessage: error.message
        }
      };
    }
  }

  async callHuggingFaceAPI(prompt, model) {
    const modelMap = {
      'mistral-7b': 'mistralai/Mistral-7B-Instruct-v0.1',
      'llama-2-70b': 'meta-llama/Llama-2-70b-chat-hf',
      'claude-2': 'anthropic/claude-2' // Note: Claude may not be available on HF
    };

    const hfModel = modelMap[model] || 'microsoft/DialoGPT-large';
    
    try {
      const response = await axios.post(
        `${this.baseURL}/${hfModel}`,
        {
          inputs: prompt,
          parameters: {
            max_new_tokens: 500,
            temperature: 0.7,
            do_sample: true
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.hfApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      // Extract generated text from response
      if (response.data && response.data[0] && response.data[0].generated_text) {
        return response.data[0].generated_text;
      } else {
        throw new Error('Unexpected response format from Hugging Face API');
      }
    } catch (error) {
      if (error.response) {
        throw new Error(`Hugging Face API error: ${error.response.status} - ${error.response.data.error || error.response.statusText}`);
      } else if (error.request) {
        throw new Error('No response received from Hugging Face API');
      } else {
        throw new Error(`Hugging Face API request failed: ${error.message}`);
      }
    }
  }

  async simulateOpenAIResponse(prompt) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate a simulated response based on the prompt
    const responses = [
      `I understand you're asking about: "${prompt.substring(0, 100)}...". This is a simulated response from the AI model.`,
      `Based on your query "${prompt.substring(0, 50)}...", here's what I can share: This is a demonstration response for the token tracking system.`,
      `Thank you for your question. I've processed your request about "${prompt.substring(0, 80)}..." and here's my simulated analysis.`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  async getAvailableModels() {
    return [
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        description: 'Fast and cost-effective for most tasks',
        maxTokens: 4096,
        supportsStreaming: true
      },
      {
        id: 'gpt-4',
        name: 'GPT-4',
        description: 'Most capable model for complex tasks',
        maxTokens: 8192,
        supportsStreaming: true
      },
      {
        id: 'claude-2',
        name: 'Claude 2',
        description: 'Anthropic\'s conversational AI',
        maxTokens: 100000,
        supportsStreaming: false
      },
      {
        id: 'llama-2-70b',
        name: 'Llama 2 70B',
        description: 'Meta\'s open-source large language model',
        maxTokens: 4096,
        supportsStreaming: false
      },
      {
        id: 'mistral-7b',
        name: 'Mistral 7B',
        description: 'High-quality open-source model',
        maxTokens: 8192,
        supportsStreaming: false
      }
    ];
  }
}

export default new AIService();