import { handler } from '../src/index';
import * as bedrock from '@aws-sdk/client-bedrock-runtime';
import * as sns from '@aws-sdk/client-sns';

// Mock the AWS SDK clients
jest.mock('@aws-sdk/client-bedrock-runtime');
jest.mock('@aws-sdk/client-sns');

describe('Reminder Lambda Function', () => {
  // Mock environment variables
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset mocks before each test
    jest.resetAllMocks();

    // Set up environment variables
    process.env = {
      ...originalEnv,
      BEDROCK_TITAN_MODEL_ID: 'amazon.titan-text-express-v1:0',
      RECEPIENT_PHONE_NUMBER: '+1234567890',
      SNS_TOPIC_ARN: 'arn:aws:sns:eu-west-1:123456789012:test-topic'
    };

    // Mock Bedrock client
    const mockBedrockClient = {
      send: jest.fn()
    };
    // @ts-ignore
    bedrock.BedrockRuntimeClient = jest.fn().mockImplementation(() => mockBedrockClient);

    // Mock SNS client
    const mockSnsClient = {
      send: jest.fn()
    };
    // @ts-ignore
    sns.SNSClient = jest.fn().mockImplementation(() => mockSnsClient);
  });

  afterEach(() => {
    // Restore original environment variables
    process.env = originalEnv;
  });

  it('should generate a haiku and send it via SNS', async () => {
    // Mock Bedrock response
    const mockBedrockResponse = {
      body: new TextEncoder().encode(JSON.stringify({
        results: [{
          outputText: 'Suplementy codziennie\nWitalność rośnie w ciele\nZdrowie wraca nam'
        }]
      }))
    };

    // Get the Bedrock client instance and mock its send method
    const bedrockClient = new bedrock.BedrockRuntimeClient({ region: 'eu-west-1' });
    // @ts-ignore
    bedrockClient.send.mockResolvedValue(mockBedrockResponse);

    // Get the SNS client instance and mock its send method
    const snsClient = new sns.SNSClient({ region: 'eu-west-1' });
    // @ts-ignore
    snsClient.send.mockResolvedValue({});

    // Call the handler
    await handler({});

    // Verify Bedrock was called
    expect(bedrockClient.send).toHaveBeenCalledTimes(1);

    // Verify SNS was called
    expect(snsClient.send).toHaveBeenCalledTimes(1);
  });

  it('should handle Bedrock API errors gracefully', async () => {
    // Mock Bedrock error
    const bedrockClient = new bedrock.BedrockRuntimeClient({ region: 'eu-west-1' });
    // @ts-ignore
    bedrockClient.send.mockRejectedValue(new Error('Bedrock API error'));

    // Get the SNS client instance
    const snsClient = new sns.SNSClient({ region: 'eu-west-1' });

    // Expect the handler to throw an error
    await expect(handler({})).rejects.toThrow('Bedrock API error');

    // Verify SNS was not called
    expect(snsClient.send).not.toHaveBeenCalled();
  });

  it('should handle SNS API errors gracefully', async () => {
    // Mock Bedrock response
    const mockBedrockResponse = {
      body: new TextEncoder().encode(JSON.stringify({
        results: [{
          outputText: 'Suplementy codziennie\nWitalność rośnie w ciele\nZdrowie wraca nam'
        }]
      }))
    };

    // Get the Bedrock client instance and mock its send method
    const bedrockClient = new bedrock.BedrockRuntimeClient({ region: 'eu-west-1' });
    // @ts-ignore
    bedrockClient.send.mockResolvedValue(mockBedrockResponse);

    // Mock SNS error
    const snsClient = new sns.SNSClient({ region: 'eu-west-1' });
    // @ts-ignore
    snsClient.send.mockRejectedValue(new Error('SNS API error'));

    // Expect the handler to throw an error
    await expect(handler({})).rejects.toThrow('SNS API error');

    // Verify Bedrock was called
    expect(bedrockClient.send).toHaveBeenCalledTimes(1);
  });

  it('should handle missing environment variables', async () => {
    // Remove environment variables
    delete process.env.BEDROCK_TITAN_MODEL_ID;

    // Expect the handler to throw an error
    await expect(handler({})).rejects.toThrow();
  });
});
