import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock';
import { fromNodeProviderChain } from '@aws-sdk/credential-providers';

export function getBedrockClient() {
  const credentialsProvider = fromNodeProviderChain();

  return createAmazonBedrock({
    region: process.env.AWS_REGION || 'us-east-1',
    credentialProvider: async () => {
      const credentials = await credentialsProvider();
      return {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        sessionToken: credentials.sessionToken,
      };
    },
  });
}

// Export a function that gets a specific model
export async function getBedrockModel(modelId: string) {
  const client = await getBedrockClient();
  return client(modelId);
}
