// Welcome to Keystone!
//
// This file is what Keystone uses as the entry-point to your headless backend
//
// Keystone imports the default export of this file, expecting a Keystone configuration object
//   you can find out more at https://keystonejs.com/docs/apis/config

import { config } from '@keystone-6/core';

// to keep this file tidy, we define our schema in a different file
import { lists } from './schema';

// authentication is configured separately here too, but you might move this elsewhere
// when you write your list-level access control functions, as they typically rely on session data
import { withAuth, session } from './auth';

import { storage } from './storage';

export default withAuth(
  config({
    db: {
      // we're using sqlite for the fastest startup experience
      //   for more information on what database might be appropriate for you
      //   see https://keystonejs.com/docs/guides/choosing-a-database#title
      provider: 'sqlite',
      url: 'file:./keystone.db',
    },
    lists,
    session,
    ui: {
      // only admins can view the AdminUI
      isAccessAllowed: ({ session }) => {
        return session?.data?.isAdmin ?? false;
      },
    },
    storage,
    server: {
      cors: {
        origin: [process.env.SERVER_CORS_ORIGIN || ''], // Autorise les requêtes venant de ces domaines
        credentials: true, // Autorise l'envoi de cookies ou d'autres credentials
      },
    },
    graphql: {
      // The CORS configuration to use on the GraphQL API endpoint.
      // Default: { origin: 'https://studio.apollographql.com', credentials: true }
      // cors: { origin: '*', credentials: true },
      playground: true,
      apolloConfig: {
        introspection: true
      }
    }
  })
);
