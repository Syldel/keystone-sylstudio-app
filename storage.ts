// Documentation : https://keystonejs.com/docs/config/config#storage-images-and-files

import { StorageConfig } from "@keystone-6/core/types";

import { s3Config, bucketName } from "./aws/s3-client";

const region = s3Config.region;
const accessKeyId = s3Config.credentials.accessKeyId;
const secretAccessKey = s3Config.credentials.secretAccessKey;

export const storage: Record<string, StorageConfig> = {
  sylstudio_S3_images: {
    kind: 's3',
    type: 'image',
    bucketName,
    region,
    accessKeyId,
    secretAccessKey,
    // proxied: { baseUrl: '/images-proxy' },
    // signed: { expiry: 5000 }, // Sets signing of the asset - for use when you want private assets
    // endpoint: 'http://127.0.0.1:9000/', // to be provided if you are not using AWS as your endpoint
    forcePathStyle: false, // If true, will force the 'old' S3 path style of putting bucket name at the start of the pathname of the URL
    preserve: false, // Sets whether the assets should be preserved locally on removal from keystone's database
  },
};
