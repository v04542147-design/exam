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

// store last run results so /view can show them
let lastResults = null;

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

      // store last results for viewing
      lastResults = { success: true, results, usingInMemory: !!clientInfo.isMemory };

      res.json(lastResults);

    await client.close();
    if (clientInfo.mongod) await clientInfo.mongod.stop();
  } catch (err) {
    console.error('Error running demo:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// simple browser view to show last run results
app.get('/view', (req, res) => {
  if (!lastResults) return res.send('<p>No demo run yet. POST to <code>/run-demo</code> to create sample data.</p>');
  const pretty = JSON.stringify(lastResults, null, 2)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  res.send(`<!doctype html><html><head><meta charset="utf-8"><title>Demo Results</title><style>body{font-family:system-ui,Segoe UI,Roboto,Arial;margin:20px}pre{background:#f6f8fa;padding:16px;border-radius:6px;overflow:auto}</style></head><body><h1>Last /run-demo results</h1><pre>${pretty}</pre></body></html>`);
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  // Run the demo once at startup to populate /view automatically
  (async () => {
    try {
      console.log('Running initial demo on startup...');
      const clientInfo = await getClient();
      const client = clientInfo.client;
      const dbName = process.env.DB_NAME || 'studentDB';
      const db = client.db(dbName);
      const results = await runCrudDemo(db);
      lastResults = { success: true, results, usingInMemory: !!clientInfo.isMemory };
      await client.close();
      if (clientInfo.mongod) await clientInfo.mongod.stop();
      console.log('Initial demo complete.');
    } catch (err) {
      console.error('Initial demo failed:', err);
    }
  })();
});
