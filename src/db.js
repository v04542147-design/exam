const { MongoClient } = require('mongodb');
require('dotenv').config();

async function connectToMongo(uri) {
  if (!uri) throw new Error('MongoDB URI is required');
  const client = new MongoClient(uri);
  await client.connect();
  return client;
}

module.exports = { connectToMongo };
