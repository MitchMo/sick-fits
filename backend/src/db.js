//This file connects to remote prisma db, and gives us the ability to query it with Javascript
const { Prisma } = require('prisma-binding');

const db = new Prisma({
    typeDefs: 'src/generated/prisma.graphql',
    endpoint: process.env.PRISMA_ENDPOINT,
    secret: process.env.PRISMA_SECRET,
    debug: false //If this is true it will console.log all queries and mutations
});

module.exports = db;