MongoDB — Installation, Atlas Setup, and CRUD (Concise 1-page answer)

Part A — Install MongoDB locally (quick steps)

Windows (MSI):
1. Download: https://www.mongodb.com/try/download/community — choose Windows, MSI.
2. Run MSI → Next → Accept → Complete.
3. Select “Install MongoDB as a Service” (auto-start).
4. (Optional) Install MongoDB Compass.

Install mongosh (shell):
1. Download: https://www.mongodb.com/try/download/shell (Windows MSI).
2. Run installer. Verify:
   mongosh --version

Quick verify (PowerShell):
```powershell
mongosh
use studentDB
db.students.insertOne({ roll_no:1, name:'Alice', department:'CSE', marks:85 })
db.students.find().pretty()
```

Part B — MongoDB Atlas (cloud)
1. Sign up: https://www.mongodb.com/cloud/atlas → Try Free.
2. Create Cluster: Build a Database → Free tier (M0) → choose provider & region → Create.
3. Create DB user: Security → Database Access → Add New Database User (username/password, readWrite role).
4. Network Access: Security → Network Access → Add IP (for testing: 0.0.0.0/0).
5. Connect: Clusters → Connect → Connect your application → copy URI:
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/myDB
6. Use the URI in your app or MongoDB Compass.

Node.js sample connection:
```js
const { MongoClient } = require('mongodb');
const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);
async function run(){
  await client.connect();
  const db = client.db('myDB');
  await db.collection('test').insertOne({ name:'ok' });
  await client.close();
}
run().catch(console.error);
```

Part C — CRUD examples (exam-ready answers)
Use DB: `use studentDB`

CREATE (Insert)
- Insert one:
  `db.students.insertOne({ roll_no:1, name:'Alice', department:'CSE', marks:85 })`
- Insert many:
  `db.students.insertMany([...])`

READ (Find)
- All: `db.students.find().pretty()`
- Condition: `db.students.find({ department:'CSE' })`
- Projection: `db.students.find({}, { projection:{ name:1, marks:1, _id:0 } })`
- Find one: `db.students.findOne({ roll_no:2 })`

UPDATE
- Update one: `db.students.updateOne({ roll_no:2 }, { $set: { marks:82 } })`
- Update many: `db.students.updateMany({ department:'CSE' }, { $set: { status:'Passed' } })`

DELETE
- Delete one: `db.students.deleteOne({ roll_no:4 })`
- Delete many: `db.students.deleteMany({ department:'MECH' })`

Notes
- Use modern methods: insertOne/insertMany, updateOne/updateMany, deleteOne/deleteMany.
- For production: never use 0.0.0.0/0; use least-privilege users and env vars for credentials.

Last run (sample output) — /run-demo (local in-memory server):

```json
{
  "success": true,
  "results": {
    "insertedCount": 4,
    "updateMatched": 2,
    "updateModified": 2,
    "deletedCount": 1,
    "final": [
      { "roll_no": 1, "name": "Alice", "status": "Passed" },
      { "roll_no": 2, "name": "Bob" },
      { "roll_no": 3, "name": "Charlie", "status": "Passed" }
    ]
  },
  "usingInMemory": true
}
```

How to run the demo locally (fast)
```powershell
cd C:\workspace
npm install
# in-memory demo (no MongoDB required)
npm run start:memory
# or run the server and call endpoints
Start-Process -NoNewWindow -FilePath node -ArgumentList server.js
curl -Method POST http://localhost:3000/run-demo -UseBasicParsing
start http://localhost:3000/view
```

This one-page answer is ready to paste into an assignment or print. If you want a PDF or PPT, I can produce them next.
