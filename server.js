require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
const PORT = process.env.PORT || 3000;

async function getClient() {
  const uri = process.env.MONGO_URI;
  if (uri) {
    // Try connecting to provided URI
    const client = new MongoClient(uri);
    try {
      await client.connect();
      return { client, isMemory: false };
    } catch (err) {
      console.warn('Failed to connect to provided MONGO_URI, falling back to in-memory MongoDB:', err.message);
      // fallthrough to memory
    }
  }

  // Start in-memory MongoDB
  const mongod = await MongoMemoryServer.create();
  const memUri = mongod.getUri();
  const client = new MongoClient(memUri);
  await client.connect();
  return { client, isMemory: true, mongod };
}

async function runCrudDemo(db) {
  const results = {};
  await db.collection('students').deleteMany({});
  const docs = [
    { roll_no: 1, name: 'Alice', department: 'CSE', marks: 85 },
    { roll_no: 2, name: 'Bob', department: 'ECE', marks: 78 },
    { roll_no: 3, name: 'Charlie', department: 'CSE', marks: 92 },
    { roll_no: 4, name: 'David', department: 'MECH', marks: 67 }
  ];

  const insertRes = await db.collection('students').insertMany(docs);
  results.insertedCount = insertRes.insertedCount;
  results.insertedIds = insertRes.insertedIds;

  results.all = await db.collection('students').find().toArray();

  const updateRes = await db.collection('students').updateMany({ department: 'CSE' }, { $set: { status: 'Passed' } });
  results.updateMatched = updateRes.matchedCount;
  results.updateModified = updateRes.modifiedCount;

  results.projection = await db.collection('students').find({}, { projection: { name: 1, marks: 1, _id: 0 } }).toArray();

  const delRes = await db.collection('students').deleteOne({ roll_no: 4 });
  results.deletedCount = delRes.deletedCount;

  results.final = await db.collection('students').find().toArray();

  return results;
}

app.get('/', (req, res) => {
  res.send({ name: 'MongoDB CRUD Demo Server', info: 'POST /run-demo to run CRUD demo against MONGO_URI or in-memory fallback' });
});

app.get('/health', (req, res) => {
  res.send({ status: 'ok' });
});

app.post('/run-demo', async (req, res) => {
  let clientInfo;
  try {
    clientInfo = await getClient();
    const client = clientInfo.client;
    const dbName = process.env.DB_NAME || 'studentDB';
    const db = client.db(dbName);

    const results = await runCrudDemo(db);

    res.json({ success: true, results, usingInMemory: !!clientInfo.isMemory });

    await client.close();
    if (clientInfo.mongod) await clientInfo.mongod.stop();
  } catch (err) {
    console.error('Error running demo:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
