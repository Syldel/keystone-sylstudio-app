// Documentation : https://keystonejs.com/docs/guides/hooks

import type { ReadStream } from 'fs';

import { ListHooks } from "@keystone-6/core/types";

import { encodeImageToBlurhash, readStreamChunks } from "./blurhash";

type FileUpload = {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream(): ReadStream;
};

export const postHooks: ListHooks<any> = {
  resolveInput: async ({ inputData, resolvedData }) => {
    const { image: inputImage } = inputData;

    if (inputImage) {
      const imageUploadData: FileUpload = await inputImage.upload;
      const chunks = await readStreamChunks(imageUploadData.createReadStream());

      let blurhash = '';
      try {
        blurhash = await encodeImageToBlurhash(Buffer.concat(chunks));
      } catch (err) {
        console.error("blurhash encode error:", err);
      }

      return {
        ...resolvedData,
        blurhash
      }
    }

    /*
    const { image } = resolvedData;
    if (image) {
      const s3Object = await getS3File(`${image.id}.${image.extension}`);
      if (s3Object) {
        const byteArray = await s3Object.Body?.transformToByteArray();

        let blurhash = '';
        try {
          blurhash = await encodeImageToBlurhash(byteArray?.buffer);
          console.log('encodeImageToBlurhash(byteArray?.buffer)', blurhash);
        } catch (err) {
          console.error("blurhash encode error:", err);
        }

        return {
          ...resolvedData,
          blurhash
        }
      }
    }
    */

    // We always return resolvedData from the resolveInput hook
    return resolvedData;
  }
};