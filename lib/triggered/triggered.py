import boto3
import logging
from aws_xray_sdk.core import xray_recorder
from aws_xray_sdk.core import patch_all

logger = logging.getLogger()
logger.setLevel(logging.INFO)
patch_all()


def handler(event, context):
    logger.info("This is the trigged lambda")
    logger.info(event)

    logger.info("Listing buckets to generate a segment...")
    s3_client = boto3.client("s3")
    buckets = s3_client.list_buckets()
    logger.info(f'Found {len(buckets["Buckets"])} S3 buckets.')
