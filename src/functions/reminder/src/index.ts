import * as bedrock from '@aws-sdk/client-bedrock-runtime'
import * as sns from '@aws-sdk/client-sns'

const decoder = new TextDecoder();

export const handler = async (event: any) => {

  const BEDROCK_TITAN_MODEL_ID = process.env.BEDROCK_TITAN_MODEL_ID!;
  const RECEPIENT_PHONE_NUMBER = process.env.RECEPIENT_PHONE_NUMBER!;
  const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN!;

  const bedrockClient = new bedrock.BedrockRuntimeClient({
    region: 'eu-west-1'
  });

  const snsClient = new sns.SNSClient({
    region: 'eu-west-1'
  });

  const prompt = 'Napisz haiku o korzyściach płynących z regularnego przyjmowania suplementów. Napisz TYLKO haiku. Bądź uprzejmy i pozytywny.';

  // Format payload for Amazon Titan model
  const payload = {
    inputText: prompt,
    textGenerationConfig: {
      maxTokenCount: 100,
      temperature: 0.7,
      topP: 1,
      stopSequences: []
    }
  };
  console.info('payload', payload);

  const modelId = BEDROCK_TITAN_MODEL_ID.split(':')[0];
  console.info('Using model ID:', modelId);

  const request = new bedrock.InvokeModelCommand({
    contentType: 'application/json',
    accept: 'application/json',
    modelId: modelId,
    body: JSON.stringify(payload),
  });
  console.info('request', request);

  const response = await bedrockClient.send(request);
  console.info('response', response);
  const completion = JSON.parse(decoder.decode(response.body));
  console.info('completion', completion);

  // Extract the generated text from Titan's response format
  const haiku = completion.results[0].outputText.toString().trim();
  console.info('haiku', haiku);

  const message = `Kochanie, weź suple ❤️\n\n${haiku}`;
  console.info('message', message);

  console.info('sending message to SNS');
  await snsClient.send(
    new sns.PublishCommand({
      Message: message,
      TopicArn: SNS_TOPIC_ARN
    })
  );
  console.info('message sent to SNS');
};
