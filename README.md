# AI Reminder Bot

A personalized medication reminder system built with AWS CDK that uses AI to send friendly, encouraging messages to help maintain a consistent medication routine.

## Overview

This application was created to help my wife organize her daily medication routine. It sends personalized, AI-generated messages via SMS at a scheduled time each day, making medication reminders more engaging and supportive.

## Features

- **Daily SMS Reminders**: Sends medication reminders at a consistent time (6:00 AM UTC / 8:00 AM CEST)
- **AI-Generated Messages**: Uses Amazon Bedrock's Titan model to generate personalized haikus about the benefits of taking supplements
- **Friendly Tone**: Ensures messages are positive, encouraging, and personalized
- **Automated Deployment**: CI/CD pipeline for easy updates and maintenance

## Architecture

The application is built using AWS CDK and consists of the following components:

- **Lambda Function**: Generates personalized messages using Amazon Bedrock
- **EventBridge Rule**: Triggers the Lambda function on a daily schedule
- **SNS Topic**: Delivers the generated messages via SMS
- **IAM Roles**: Manages permissions for AWS services

## Getting Started

### Prerequisites

- Node.js 22.x
- AWS CLI configured with appropriate credentials
- AWS CDK CLI installed globally (`npm install -g aws-cdk`)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/kacperek0/ai-reminder-bot.git
   cd ai-reminder-bot
   ```

2. Install dependencies:
   ```bash
   npm install
   cd src/functions/reminder
   npm install
   cd ../../..
   ```

3. Create a `.env` file with the following variables:
   ```
   RECEPIENT_PHONE_NUMBER="+1234567890"
   CDK_DEFAULT_ACCOUNT="your-aws-account-id"
   CDK_DEFAULT_REGION="your-aws-region"
   ```

### Deployment

1. Synthesize the CloudFormation template:
   ```bash
   npm run cdk synth
   ```

2. Deploy the stack:
   ```bash
   npm run cdk deploy
   ```

## Customization

### Changing the Reminder Time

The reminder is scheduled to run at 6:00 AM UTC (8:00 AM CEST) by default. To change this, modify the cron expression in `lib/ai-reminder-bot-stack.ts`:

```typescript
schedule: events.Schedule.cron({
  minute: '0',
  hour: '6', // Change this value to your desired hour (UTC)
}),
```

### Customizing the Message

To change the prompt for the AI-generated message, modify the `prompt` variable in `src/functions/reminder/index.js`:

```javascript
const prompt = 'Your custom prompt here';
```

## Development

### Running Tests

```bash
# Run infrastructure tests
npm test

# Run Lambda function tests
cd src/functions/reminder
npm test
cd ../../..
```

### Local Development

```bash
# Watch for changes and compile
npm run watch

# Compare deployed stack with current state
npm run cdk diff
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [AWS CDK](https://aws.amazon.com/cdk/)
- Powered by [Amazon Bedrock](https://aws.amazon.com/bedrock/)
- Inspired by the need to support loved ones in maintaining their health routines
