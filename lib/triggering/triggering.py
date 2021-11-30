import boto3
import logging
import json
import os
from aws_xray_sdk.core import xray_recorder
from aws_xray_sdk.core import patch_all

logger = logging.getLogger()
logger.setLevel(logging.INFO)
patch_all()


def handler(event, context):
    logger.info("This is the triggering lambda")
    logger.info(event)

    logger.info("Listing buckets to generate a segment...")
    s3_client = boto3.client("s3")
    buckets = s3_client.list_buckets()
    logger.info(f'Found {len(buckets["Buckets"])} S3 buckets.')

    logger.info("Async invoking the lamdba...")
    lambda_client = boto3.client("lambda")
    lambda_client.invoke(
        FunctionName=os.environ.get("TRIGGERED_FUNCTION_NAME"),
        InvocationType="Event",
        Payload=json.dumps({"invokingFunctionRequestId": context.aws_request_id}),
    )
    logger.info("Invoked lambda! Ending!")
