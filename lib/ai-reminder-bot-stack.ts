import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as bedrock from 'aws-cdk-lib/aws-bedrock';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as sns_subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';

export class AiReminderBotStack extends cdk.Stack {
  private readonly bedrockTitan: bedrock.FoundationModel;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bedrockTitan = bedrock.FoundationModel.fromFoundationModelId(
      this,
      'Titan',
      bedrock.FoundationModelIdentifier.AMAZON_TITAN_TEXT_EXPRESS_V1_0_8K
    );

    const reminderTopic = new sns.Topic(this, 'ReminderTopic');

    const smsSubscription = new sns_subscriptions.SmsSubscription(
      process.env.RECEPIENT_PHONE_NUMBER ?? ''
    );

    reminderTopic.addSubscription(smsSubscription);

    const reminderFunction = new lambda.Function(this, 'ReminderFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('src/functions/reminder'),
      environment: {
        BEDROCK_TITAN_MODEL_ID: bedrockTitan.modelId,
        RECEPIENT_PHONE_NUMBER: process.env.RECEPIENT_PHONE_NUMBER ?? '',
        SNS_TOPIC_ARN: reminderTopic.topicArn,
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 128,
    });

    // Add permission for the Lambda to publish to SNS
    reminderFunction.addToRolePolicy(
      new cdk.aws_iam.PolicyStatement({
        actions: ['sns:Publish'],
        resources: [reminderTopic.topicArn],
      })
    );

    // Add permission for the Lambda to use Bedrock model
    reminderFunction.addToRolePolicy(
      new cdk.aws_iam.PolicyStatement({
        actions: ['bedrock:InvokeModel'],
        resources: [bedrockTitan.modelArn.replace(':0:8k', '')],
      })
    );

    // Schedule the reminder function to run every day at 8:00 AM CEST
    const eventRule = new events.Rule(this, 'ReminderRule', {
      schedule: events.Schedule.cron({
        minute: '0',
        hour: '6',
      }),
    });

    eventRule.addTarget(new targets.LambdaFunction(reminderFunction));
  }
}
