// Documentation : https://www.npmjs.com/package/blurhash

const sharp = require("sharp");
import { encode } from "blurhash";

import type { Readable } from 'stream';

const readStreamChunks = (createReadStream: Readable): Promise<any[]> =>
  new Promise((resolve, reject) => {
    const promises: any[] = [];
    createReadStream
      .on("data", chunk => promises.push(chunk))
      .on("error", reject)
      .on("end", () => {
        resolve(Promise.all(promises));
      });
  });

const encodeImageToBlurhash = (src: any): Promise<string> =>
  new Promise((resolve, reject) => {
    sharp(src)
      .raw()
      .ensureAlpha()
      .resize(64, 64, { fit: "inside" })
      .toBuffer((err, buffer, { width, height }) => {
        if (err) return reject(err);
        resolve(encode(new Uint8ClampedArray(buffer), width, height, 4, 4));
      });
  });

export { encodeImageToBlurhash, readStreamChunks };