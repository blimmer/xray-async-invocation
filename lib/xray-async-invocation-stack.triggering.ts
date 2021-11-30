import { Handler } from "aws-lambda";
import { captureAWSClient } from "aws-xray-sdk";
import { Lambda, S3 } from "aws-sdk";

const handler: Handler = async (event, context) => {
  console.info("This is the triggering lambda");
  console.info(JSON.stringify(event));

  console.info("Listing buckets to generate a segment...");
  const s3 = captureAWSClient(new S3());
  const { Buckets } = await s3.listBuckets().promise();
  console.info(`Found ${Buckets?.length || 0} S3 buckets.`);

  console.info("Async invoking the lambda...");
  const lambda = captureAWSClient(new Lambda());
  await lambda
    .invokeAsync({
      FunctionName: process.env.TRIGGERED_FUNCTION_NAME!,
      InvokeArgs: JSON.stringify({
        invokingFunctionRequestId: context.awsRequestId,
      }),
    })
    .promise();
  console.info("Invoked lambda. Ending!");
};

export { handler };
