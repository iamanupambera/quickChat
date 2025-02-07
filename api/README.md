# REST API Example

This example shows how to implement a **REST API with TypeScript** using [Express](https://expressjs.com/) and [Prisma Client](https://www.prisma.io/docs/concepts/components/prisma-client).

## Getting started

### 1. Create and seed the database

Run the following command to create your database. This also creates the `User` and `Post` tables that are defined in [`prisma/schema.prisma`](./prisma/schema.prisma):

```
npx prisma migrate dev --name init
```

When `npx prisma migrate dev` is executed against a newly created database, seeding is also triggered. The seed file in [`prisma/seed.ts`](./prisma/seed.ts) will be executed and your database will be populated with the sample data.

**If you switched to Prisma Postgres in the previous step**, you need to trigger seeding manually (because Prisma Postgres already created an empty database instance for you, so seeding isn't triggered):

```
npx prisma db seed
```


### 2. Start the REST API server

```
npm run dev
```

The server is now running on `http://localhost:3000`. You can now run the API requests, e.g. [`http://localhost:3000/feed`](http://localhost:3000/feed).

Once you've updated your data model, you can execute the changes against your database with the following command:

```
npx prisma migrate dev --name <table_name>
```

This adds another migration to the `prisma/migrations` directory and creates the new `table_name` table in the database.