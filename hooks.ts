// Documentation : https://keystonejs.com/docs/guides/hooks

import { ListHooks } from "@keystone-6/core/types";
import { getS3File, putS3File, writeS3File } from "./aws/s3-functions";

const filePath = '../keystone.db';
const fileKey = 'keystone.db';

export const hooks: ListHooks<any> = {
  beforeOperation: async ({ operation }) => {
    const s3Object = await getS3File(fileKey);
    if (s3Object) {
      await writeS3File(filePath, s3Object);
    }
  },
  afterOperation: async ({ operation }) => {
    await putS3File(filePath, fileKey);
  }
};