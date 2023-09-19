// Documentation : https://keystonejs.com/docs/guides/hooks

import { ListHooks } from "@keystone-6/core/types";
import { getS3File, putS3File, writeS3File } from "../aws/s3-functions";

const filePath = '../keystone.db';
const fileKey = 'keystone.db';

export const hooks: ListHooks<any> = {
  beforeOperation: async ({ operation }) => {
    if (process.env.NODE_ENV !== 'production') {
      // Development environment
      console.log('Development environment => Skip beforeOperation getS3File', fileKey)
    } else {
      // Production environment
      const s3Object = await getS3File(fileKey);
      if (s3Object) {
        await writeS3File(filePath, s3Object);
      }
    }
  },
  afterOperation: async ({ operation }) => {
    await putS3File(filePath, fileKey);
  }
};