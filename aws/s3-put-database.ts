import { putS3File } from "./s3-functions";

setTimeout(async () => {
  const filePath = '../keystone.db';
  const fileKey = 'keystone.db';
  await putS3File(filePath, fileKey);
}, 5);
