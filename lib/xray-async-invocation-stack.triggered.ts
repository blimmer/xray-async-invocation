import { Handler } from "aws-lambda";
import { captureAWSClient } from "aws-xray-sdk";
import { S3 } from "aws-sdk";

const handler: Handler = async (event) => {
  console.info("This is the triggered lambda");
  console.info(JSON.stringify(event));

  console.info("Listing buckets to generate a segment...");
  const s3 = captureAWSClient(new S3());
  const { Buckets } = await s3.listBuckets().promise();
  console.info(`Found ${Buckets?.length || 0} S3 buckets.`);
};

export { handler };
