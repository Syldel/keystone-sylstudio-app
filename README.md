# Keystone Syl-Studio Backoffice

Run

```
yarn dev
```

If you want an overview of all the features Keystone offers, check out our [features](https://keystonejs.com/why-keystone#features) page.

## Some Quick Notes On Getting Started

### Changing the database

We've set you up with an [SQLite database](https://keystonejs.com/docs/apis/config#sqlite) for ease-of-use. If you're wanting to use PostgreSQL, you can!

Just change the `db` property on line 16 of the Keystone file [./keystone.ts](./keystone.ts) to

```typescript
db: {
    provider: 'postgresql',
    url: process.env.DATABASE_URL || 'DATABASE_URL_TO_REPLACE',
}
```

And provide your database url from PostgreSQL.

For more on database configuration, check out or [DB API Docs](https://keystonejs.com/docs/apis/config#db)

### Auth

We've put auth into its own file to make this humble starter easier to navigate. To explore it without auth turned on, comment out the `isAccessAllowed` on line 21 of the Keystone file [./keystone.ts](./keystone.ts).

For more on auth, check out our [Authentication API Docs](https://keystonejs.com/docs/apis/auth#authentication-api)

### Adding a frontend

As a Headless CMS, Keystone can be used with any frontend that uses GraphQL. It provides a GraphQL endpoint you can write queries against at `/api/graphql` (by default [http://localhost:3000/api/graphql](http://localhost:3000/api/graphql)). At Thinkmill, we tend to use [Next.js](https://nextjs.org/) and [Apollo GraphQL](https://www.apollographql.com/docs/react/get-started/) as our frontend and way to write queries, but if you have your own favourite, feel free to use it.

A walkthrough on how to do this is forthcoming, but in the meantime our [todo example](https://github.com/keystonejs/keystone-react-todo-demo) shows a Keystone set up with a frontend. For a more full example, you can also look at an example app we built for [Prisma Day 2021](https://github.com/keystonejs/prisma-day-2021-workshop)

### fetch API javascript example

```
const GRAPHQL_URL = 'http://localhost:3000/api/graphql';

async function fetchPosts() {
  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      query: `
        query Posts{
          posts{id, title
            content {
              document
            }
            tags {
              id
            }
          }
        }
      `,
    }),
  });
  const responseBody = await response.json();

  if (responseBody?.data?.posts) {
    console.log('=====> fetchPosts() data?.posts:', responseBody?.data?.posts);
  } else {
    console.log('=====> fetchPosts():', responseBody);
  }
}
```

### Production

- Il faut définir la variable d'environnement SESSION_SECRET (32 digits) (https://www.browserling.com/tools/random-hex)
- Il faut être en https (Ou mettre secure de statelessSessions à false)
  D'une manière générale, étudier de près la configuration de statelessSessions pour la sécurité en production.

### CURL et GraphQL

Exemple de requête CURL pour récupérer des données GraphQL :

```
curl -i -X POST -H "Content-Type:application/json" -d "{\"query\":\"query Posts {posts{id}}\"}" http://localhost:3000/api/graphql
```

### Amazon S3 - Accès public

https://keystonejs.com/docs/guides/images-and-files

1. Se connecter à AWS
2. Créer Utilisateur IAM avec "Clé d'accès" et "Politiques des autorisations" avec AmazonS3FullAccess
   https://console.aws.amazon.com/iamv2
3. - Créer un bucket S3 et dans "Autorisations"
     https://console.aws.amazon.com/s3/
   - Décocher "Bloquer tous les accès publics"
   - Dans "Stratégie de compartiment", définissez le code suivant :

```
   {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "Allow-Public-Access-To-Bucket",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::DOC-EXAMPLE-BUCKET/*"
        }
    ]
}
```
