// Documentation : https://sharp.pixelplumbing.com/api-resize

import sharp from "sharp";

import { putS3Buffer } from "../aws/s3-functions";

const resizeImage = (src: Buffer, size: number, keyname: string): Promise<string> =>
  new Promise((resolve, reject) => {
    sharp(src)
      .raw()
      .ensureAlpha()
      .resize(size)
      .png()
      .toBuffer(async (err, buffer, { width, height }) => {
        if (err) return reject(err);
        const s3key = `${keyname}_${width}x${height}.png`;
        await putS3Buffer(buffer, s3key);
        resolve(s3key);
      });
  });

export { resizeImage };