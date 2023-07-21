// Code : https://github.com/aws/aws-sdk-js-v3/blob/main/clients/client-s3/src/S3Client.ts#L713

import { S3Client } from "@aws-sdk/client-s3";

require('dotenv').config()

const {
  S3_BUCKET_NAME: bucketName = '',
  S3_REGION: region = '',
  S3_ACCESS_KEY_ID: accessKeyId = '',
  S3_SECRET_ACCESS_KEY: secretAccessKey = '',
} = process.env;

if (!bucketName || !region || !accessKeyId || !secretAccessKey) {
  console.warn('YOU MUST DEFINE S3 ENVIRONMENT VARIABLES!');
}

const s3Config = {
  credentials: {
    accessKeyId,
    secretAccessKey
  },
  region,
};

// Create an Amazon S3 service client object.
const s3Client = new S3Client(s3Config);
export { s3Client, s3Config, bucketName };
