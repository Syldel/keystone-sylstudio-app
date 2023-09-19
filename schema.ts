// Welcome to your schema
//   Schema driven development is Keystone's modus operandi
//
// This file is where we define the lists, fields and hooks for our data.
// If you want to learn more about how lists are configured, please read
// - https://keystonejs.com/docs/config/lists

import { list } from '@keystone-6/core';
import { allowAll, unfiltered } from '@keystone-6/core/access';

// see https://keystonejs.com/docs/fields/overview for the full list of fields
//   this is a few common fields for an example
import {
  text,
  relationship,
  password,
  timestamp,
  select,
  checkbox,
  image,
} from '@keystone-6/core/fields';

// the document field is a more complicated field, so it has it's own package
import { document } from '@keystone-6/fields-document';
// if you want to make your own fields, see https://keystonejs.com/docs/guides/custom-fields

// when using Typescript, you can refine your types to a stricter subset by importing
// the generated types from '.keystone/types'
import type { Lists } from '.keystone/types';
import { hooks } from './hooks/hooks';
import { postHooks } from './hooks/post-hooks';

/* ************************************************************************************* */
export type Session = {
  listKey: string,
  itemId: string,
  data: {
    isAdmin: boolean;
  }
};

function hasSession({ session }: { session?: Session }) {
  return Boolean(session);
}

function isAdminOrSameUser({ session, item }: { session?: Session; item: Lists.User.Item }) {
  // you need to have a session to do this
  if (!session) return false;

  // admins can do anything
  if (session.data.isAdmin) return true;

  // the authenticated user needs to be equal to the user we are updating
  return session.itemId === item.id;
}

function isAdminOrSameUserFilter({ session }: { session?: Session }) {
  // you need to have a session to do this
  if (!session) return false;

  // admins can see everything
  if (session.data?.isAdmin) return {};

  // the authenticated user can only see themselves
  return {
    id: {
      equals: session.itemId,
    },
  };
}

function isAdmin({ session }: { session?: Session }) {
  // you need to have a session to do this
  if (!session) return false;

  // admins can do anything
  if (session.data.isAdmin) return true;

  // otherwise, no
  return false;
}

/* ************************************************************************************* */

const dateMatch = {
  regex: RegExp(/^((19|2[0-9])[0-9]{2})-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/),
  explanation: "Cette date doit correspondre au format YYYY-MM-DD",
};

/* ************************************************************************************* */

export const lists: Lists = {
  User: list({
    // More about access at https://keystonejs.com/docs/guides/auth-and-access-control
    //access: allowAll,

    access: {
      operation: {
        query: hasSession,
        create: isAdmin,
        update: isAdmin,
        delete: isAdmin,
      },
      filter: {
        query: isAdminOrSameUserFilter,
      },
    },

    // this is the fields for our User list
    fields: {
      // by adding isRequired, we enforce that every User should have a name
      //   if no name is provided, an error will be displayed
      name: text({ validation: { isRequired: true } }),

      email: text({
        validation: { isRequired: true },
        // by adding isIndexed: 'unique', we're saying that no user can have the same
        // email as another user - this may or may not be a good idea for your project
        isIndexed: 'unique',
      }),

      password: password({ validation: { isRequired: true } }),

      // we can use this field to see what Posts this User has authored
      //   more on that in the Post list below
      posts: relationship({ ref: 'Post.author', many: true }),

      createdAt: timestamp({
        // this sets the timestamp to Date.now() when the user is first created
        defaultValue: { kind: 'now' },
      }),

      isAdmin: checkbox(),
    },

    hooks,
  }),

  Post: list({
    // More about access at https://keystonejs.com/docs/guides/auth-and-access-control
    //access: allowAll,

    access: {
      operation: {
        query: allowAll,
        create: isAdmin,
        update: isAdmin,
        delete: isAdmin,
      },
      filter: {
        // this is redundant as it is the default
        //   but it may help readability
        query: unfiltered,
      },
    },

    // this is the fields for our Post list
    fields: {
      title: text({ validation: { isRequired: true } }),

      // the document field can be used for making rich editable content
      //   you can find out more at https://keystonejs.com/docs/guides/document-fields
      content: document({
        formatting: true,
        layouts: [
          [1, 1],
          [1, 1, 1],
          [2, 1],
          [1, 2],
          [1, 2, 1],
        ],
        links: true,
        dividers: true,
      }),

      startDate: text({
        validation: {
          match: dateMatch,
        },
      }),

      endDate: text({
        validation: {
          match: dateMatch,
        },
      }),

      // with this field, you can set a User as the author for a Post
      author: relationship({
        // we could have used 'User', but then the relationship would only be 1-way
        ref: 'User.posts',

        // this is some customisations for changing how this will look in the AdminUI
        ui: {
          displayMode: 'cards',
          cardFields: ['name', 'email'],
          inlineEdit: { fields: ['name', 'email'] },
          linkToItem: true,
          inlineConnect: true,
        },

        // a Post can only have one author
        //   this is the default, but we show it here for verbosity
        many: false,
      }),

      // with this field, you can add some Tags to Posts
      tags: relationship({
        // we could have used 'Tag', but then the relationship would only be 1-way
        ref: 'Tag.posts',

        // a Post can have many Tags, not just one
        many: true,

        // this is some customisations for changing how this will look in the AdminUI
        ui: {
          displayMode: 'cards',
          cardFields: ['name'],
          inlineEdit: { fields: ['name'] },
          linkToItem: true,
          inlineConnect: true,
          inlineCreate: { fields: ['name'] },
        },
      }),

      image: image({ storage: 'sylstudio_S3_images' }),

      blurhash: text(),

      image_40: text(),
      image_150: text(),
      image_300: text(),
      image_600: text(),
    },

    hooks: {
      ...hooks, ...postHooks
    },
  }),

  // this last list is our Tag list, it only has a name field for now
  Tag: list({
    // More about access at https://keystonejs.com/docs/guides/auth-and-access-control
    //access: allowAll,

    access: {
      operation: {
        query: allowAll,
        create: isAdmin,
        update: isAdmin,
        delete: isAdmin,
      },
      filter: {
        // this is redundant as it is the default
        //   but it may help readability
        query: unfiltered,
      },
    },

    // setting this to isHidden for the user interface prevents this list being visible in the Admin UI
    ui: {
      isHidden: true,
    },

    // this is the fields for our Tag list
    fields: {
      name: text(),
      // this can be helpful to find out all the Posts associated with a Tag
      posts: relationship({ ref: 'Post.tags', many: true }),
    },

    hooks,
  }),
};
