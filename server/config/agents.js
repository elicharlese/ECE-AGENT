// Basic agent configurations used by the REST endpoints
// Extend this list as needed for your application

const agents = [
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    model: 'gpt-4o-mini',
    description: 'Fast, cost-efficient model suitable for drafts and quick replies.'
  },
  {
    id: 'claude-3-5',
    name: 'Claude 3.5',
    model: 'claude-3-5-sonnet-latest',
    description: 'Anthropic flagship for high-quality reasoning and tool use.'
  },
  {
    id: 'llama-3-70b',
    name: 'Llama 3 70B',
    model: 'llama-3-70b-instruct',
    description: 'Open model with strong performance for general tasks.'
  },
  {
    id: 'mock-agent',
    name: 'Mock Agent',
    model: 'mock',
    description: 'Local mock agent for development and testing.'
  }
];

module.exports = agents;
