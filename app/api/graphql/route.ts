import { createYoga, createSchema } from 'graphql-yoga';
import { NextRequest } from 'next/server';
import { typeDefs } from '../../../schema/typeDefs';
import { resolvers } from '../../../schema/resolvers';
import { connectMongo } from '../../../lib/db';
import { selfTriggerInit } from '../../../lib/selfTrigger';
// import { ensureBucketAndCors } from '../lib/minio';
// Update the path below to the correct location of minio if needed
import { ensureBucketAndCors } from '../../../lib/minio';


connectMongo();
selfTriggerInit();
ensureBucketAndCors(); 

const yoga = createYoga<{ req: NextRequest }>({
  schema: createSchema({ typeDefs, resolvers }),
  graphqlEndpoint: '/api/graphql',
  cors: {
    origin: process.env.ALLOWED_ORIGIN || '*',
    credentials: false,
  },
  landingPage: true,
});

export { yoga as GET, yoga as POST, yoga as OPTIONS };
