#!/opt/homebrew/opt/node/bin/node
import * as cdk from 'aws-cdk-lib';
import { AiReminderBotStack } from '../lib/ai-reminder-bot-stack';

const app = new cdk.App();
new AiReminderBotStack(app, 'AiReminderBotStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
