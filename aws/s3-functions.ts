import { PutObjectCommand, GetObjectCommand, ListObjectsCommand, GetObjectCommandOutput } from "@aws-sdk/client-s3";
import { s3Client, bucketName } from "./s3-client.js";
import path from "path";
import { readFileSync, writeFileSync } from "fs";

const putS3File = async (filePath: string, fileKey = 'filename') => {
  const resolvedFilePath = path.resolve(__dirname, filePath);
  let fileContent: Buffer;
  try {
    fileContent = readFileSync(resolvedFilePath);
  } catch (err) {
    console.log('putS3File readFileSync error:', err);
    return;
  }

  const params = {
    Bucket: bucketName, // required
    Key: fileKey, // required
    Body: fileContent,
    // CacheControl: 'max-age=604800',
    Tagging: "type=database",
  };

  // Create an object and upload it to the Amazon S3 bucket.
  try {
    const results = await s3Client.send(new PutObjectCommand(params));
    console.log(
      "S3 PutObjectCommand - Successfully created " +
      params.Key +
      " and uploaded it to " +
      params.Bucket +
      "/" +
      params.Key
    );

    return results;
  } catch (err) {
    console.error("S3 PutObjectCommand error:", err);
  }
}

const getS3List = async () => {
  let contents;
  try {
    const { Contents } = await s3Client.send(
      new ListObjectsCommand({ Bucket: bucketName })
    );
    contents = Contents;
  } catch (err) {
    console.error("S3 ListObjectsCommand error:", err);
  }

  return contents;
}

const getS3File = async (key: string) => {
  const params = {
    Bucket: bucketName, // required
    Key: key, // required
  };

  try {
    const result = await s3Client.send(new GetObjectCommand(params));
    console.log(
      "S3 GetObjectCommand - Success : " +
      params.Bucket +
      "/" +
      params.Key
    );

    if (!result.Body) {
      throw new Error(`File ${key} is empty!`);
    }

    return result;
  } catch (err) {
    console.error("S3 GetObjectCommand error:", err);
  }
}

const writeS3File = async (filePath: string, object: GetObjectCommandOutput) => {
  if (object.Body) {
    const resolvedFilePath = path.resolve(__dirname, filePath);
    try {
      writeFileSync(resolvedFilePath, await object.Body.transformToByteArray());
      console.log(`writeS3File - Success : ${filePath}`);
    } catch (err) {
      console.log(`writeS3File ${filePath} error:`, err);
    }
  }
}

export { putS3File, getS3File, getS3List, writeS3File };