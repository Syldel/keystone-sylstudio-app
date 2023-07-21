import { getS3File, writeS3File } from "./s3-functions";

setTimeout(async () => {
  const filePath = '../keystone.db';
  const fileKey = 'keystone.db';

  const s3Object = await getS3File(fileKey);
  if (s3Object) {
    await writeS3File(filePath, s3Object);
  }
}, 5);
