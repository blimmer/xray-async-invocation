# X-Ray Async Invocation Issue

This is some simple sample code that illustrates an issue where X-Ray Segments are lost when asynchronously invoking
another lambda from an instrumented lambda.

## Code Layout

There are two lambda functions defined in this repository:

- [triggering lambda](https://github.com/blimmer/xray-async-invocation/blob/main/lib/xray-async-invocation-stack.triggering.ts)
  - lists all s3 buckets (to generate a segment)
  - invokes the triggered lambda
- [triggered lambda](https://github.com/blimmer/xray-async-invocation/blob/main/lib/xray-async-invocation-stack.triggered.ts)
  - lists all s3 buckets (to generate a segment)

In both lambdas, the `captureAWSClient` method from `aws-xray-sdk` is used as recommended by
[this documentation](https://docs.aws.amazon.com/lambda/latest/dg/nodejs-tracing.html).

## To Deploy

This is an [aws-cdk](https://aws.amazon.com/cdk/) application.

1. Run `npm install`
1. Run `npx cdk deploy 'TestXrayAsyncInvocationStack'`

This will create a CloudFormation stack in your AWS account called `TestXrayAsyncInvocationStack`.

## Reproduction Steps

1. Visit the Lambda console for the `test-xray-triggering`. For instance, if you deploy to `us-east-1` the URL will be https://console.aws.amazon.com/lambda/home?region=us-east-1#/functions/test-xray-triggering?tab=code.
1. Click the "Test" tab and then the "Test" button to trigger the lambda. The contents of the event do not matter.

### Observed Behavior

The last segment is a `202` HTTP status code, meaning that the async invocation of the test lambda
succeeded.

![](https://i.imgur.com/KoCp9bZ.png)

However, the triggered lambda produced no traces at all:

![](https://i.imgur.com/FUKsXJv.png)

Even though it was definitely invoked:

![](https://i.imgur.com/Zzc7mFI.png[/img)

### Expected Behavior

Because these two lambdas are triggered by the same "logical request", I expected the X-Ray
tracing segment generated by the triggering lambda to be passed as metadata to the async
invocation of the triggered lambda.

At the very least, even if the traces were not linked, I expected a trace to be produced by
the triggered lambda.

## Tearing Down the Infrastructure

After you're done testing, you can tear down the infrastructure by running:

```
npx cdk destroy 'TestXrayAsyncInvocationStack'
```
