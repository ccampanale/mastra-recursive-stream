import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { getBedrockModel } from '../llms/aws-bedrock';

export const demoAgent = new Agent({
  id: 'demo-agent',
  name: 'Demo Agent',
  instructions: `
    You are a helpful assistant for demonstrating client-side tool calls.

    You have access to a client-side tool called "getUserInfo" that retrieves information about a user by their ID.

    When a user asks about a person or user, ALWAYS call the "getUserInfo" tool first to look up their information, then respond using the data returned by the tool.

    Be concise and factual in your responses.
  `,
  model: await getBedrockModel(
    process.env.AWS_BEDROCK_PROVIDER_ID ||
      'us.anthropic.claude-sonnet-4-6'
  ),
  memory: new Memory(),
});
