import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import * as AiReminderBot from '../lib/ai-reminder-bot-stack';
import * as bedrock from 'aws-cdk-lib/aws-bedrock';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as events from 'aws-cdk-lib/aws-events';
import * as sns from 'aws-cdk-lib/aws-sns';

describe('AiReminderBotStack', () => {
  let stack: AiReminderBot.AiReminderBotStack;
  let template: Template;

  beforeEach(() => {
    // Mock environment variables
    process.env.RECEPIENT_PHONE_NUMBER = '+1234567890';

    const app = new cdk.App();
    stack = new AiReminderBot.AiReminderBotStack(app, 'TestStack');
    template = Template.fromStack(stack);
  });

  test('SNS Topic is created', () => {
    template.hasResourceProperties('AWS::SNS::Topic', {});
  });

  test('SNS Subscription is created with the correct phone number', () => {
    template.hasResourceProperties('AWS::SNS::Subscription', {
      Protocol: 'sms',
      Endpoint: '+1234567890'
    });
  });

  test('Lambda function is created with correct properties', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      Runtime: 'nodejs22.x',
      Handler: 'index.handler',
      Timeout: 30,
      MemorySize: 128,
      Environment: {
        Variables: {
          RECEPIENT_PHONE_NUMBER: '+1234567890',
          BEDROCK_TITAN_MODEL_ID: Match.anyValue(),
          SNS_TOPIC_ARN: Match.anyValue()
        }
      }
    });
  });

  test('EventBridge rule is created with correct schedule', () => {
    template.hasResourceProperties('AWS::Events::Rule', {
      ScheduleExpression: 'cron(0 6 * * ? *)'
    });
  });

  test('Lambda has permission to publish to SNS', () => {
    template.hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: Match.arrayWith([
          Match.objectLike({
            Action: 'sns:Publish',
            Effect: 'Allow'
          })
        ])
      }
    });
  });

  test('Lambda has permission to invoke Bedrock model', () => {
    template.hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: Match.arrayWith([
          Match.objectLike({
            Action: 'bedrock:InvokeModel',
            Effect: 'Allow'
          })
        ])
      }
    });
  });
});
