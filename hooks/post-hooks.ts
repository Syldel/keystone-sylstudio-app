// Documentation : https://keystonejs.com/docs/guides/hooks

import type { ReadStream } from 'fs';

import { ListHooks } from "@keystone-6/core/types";

import { deleteS3File } from "../aws/s3-functions";

import { encodeImageToBlurhash, readStreamChunks } from "./blurhash";
import { resizeImage } from "./resize-image";

type FileUpload = {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream(): ReadStream;
};

export const postHooks: ListHooks<any> = {
  resolveInput: async ({ inputData, item, resolvedData }) => {
    // Info: "listKey" gives something like "Post"
    const { image: inputImage } = inputData;

    if (inputImage) {
      const imageUploadData: FileUpload = await inputImage.upload;
      const chunks = await readStreamChunks(imageUploadData.createReadStream());
      const buffer = Buffer.concat(chunks);

      let blurhash = '';
      try {
        blurhash = await encodeImageToBlurhash(buffer);
      } catch (err) {
        console.error("blurhash encode error:", err);
      }

      // VERY IMPORTANT : Need to define sizes here!
      const resizeSizes = [40, 150, 300, 600]; // According schema.ts definitions

      if (item) {
        // Delete previous resized images
        const deleteResizePromises: Promise<any>[] = [];
        resizeSizes.forEach(size => {
          if (item[`image_${size}`]) {
            deleteResizePromises.push(deleteS3File(item[`image_${size}`]));
          }
        });

        try {
          await Promise.all(deleteResizePromises);
        } catch (err) {
          console.error("deleteS3File promise error:", err); // Promise.all has at least one rejection
        }
      }

      // Create resized images
      const resizePromises: Promise<string>[] = [];
      resizeSizes.forEach(size => {
        resizePromises.push(resizeImage(buffer, size, resolvedData.image.id));
      });

      let resizeResults: string[] = [];
      try {
        resizeResults = await Promise.all(resizePromises);
      } catch (err) {
        console.error("resizeImage error:", err); // Promise.all has at least one rejection
      }

      const dataToReturn = {
        ...resolvedData,
        blurhash
      };

      resizeSizes.forEach((size, index) => {
        dataToReturn[`image_${size}`] = resizeResults[index];
      });

      return dataToReturn;
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