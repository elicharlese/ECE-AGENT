// Agent configurations

const agentConfigs = [
  {
    id: 'gpt-4-agent',
    name: 'GPT-4 Assistant',
    description: 'An intelligent assistant powered by OpenAI GPT-4',
    model: 'gpt-4',
    capabilities: ['text-generation', 'reasoning', 'analysis'],
    avatar: 'https://placehold.co/400',
    systemPrompt: 'You are a helpful AI assistant. Answer questions clearly and concisely.'
  },
  {
    id: 'claude-agent',
    name: 'Claude Assistant',
    description: 'A thoughtful assistant powered by Anthropic Claude',
    model: 'claude-3-opus',
    capabilities: ['text-generation', 'creative-writing', 'analysis'],
    avatar: 'https://placehold.co/400',
    systemPrompt: 'You are a thoughtful AI assistant. Provide detailed and nuanced responses.'
  },
  {
    id: 'gemini-agent',
    name: 'Gemini Assistant',
    description: 'A versatile assistant powered by Google Gemini',
    model: 'gemini-pro',
    capabilities: ['text-generation', 'multimodal', 'coding'],
    avatar: 'https://placehold.co/400',
    systemPrompt: 'You are a versatile AI assistant. Help with a wide range of tasks.'
  }
];

module.exports = agentConfigs;
