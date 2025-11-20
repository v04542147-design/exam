# MongoDB — Quick Install, Atlas Setup, and Local Demo Output

This file contains a compact set of instructions (local install + mongosh + Atlas) and the exact JSON output produced by the local demo endpoint `/run-demo`.

---

## Part A — Install MongoDB locally (quick)

Windows (MSI):
1. Download from https://www.mongodb.com/try/download/community and choose the MSI for your Windows version.
2. Run the MSI → choose "Complete" installation.
3. (Optional) Check "Install MongoDB as a Service" so it starts automatically.
4. Install `mongosh` (MongoDB Shell) from https://www.mongodb.com/try/download/shell or via the MongoDB installer.

Verify:
```powershell
mongosh --version
```

Start the shell and create a DB:
```powershell
mongosh
use studentDB
db.students.insertOne({ roll_no: 1, name: 'Alice', department: 'CSE', marks: 85 })
db.students.find().pretty()
```

---

## Installing mongosh (quick)

- Windows: download the MSI from https://www.mongodb.com/try/download/shell and run it.
- macOS: `brew install mongosh` or download the pkg.
- Linux: use distro package instructions on the MongoDB site.

---

## Part B — MongoDB Atlas (quick)

Step 1: Create Account
- Visit https://www.mongodb.com/cloud/atlas and sign up.

Step 2: Create Cluster
1. Click "Build a Database".
2. Choose Free tier (M0) for testing.
3. Select cloud provider and a nearby region.
4. Click Create Cluster (~1–3 minutes).

Step 3: Create Database User
1. Security → Database Access → Add New Database User.
2. Set username/password and role (readWrite to any DB for dev).
3. Click Add User.

Step 4: Configure Network Access
1. Security → Network Access → Add IP Address.
2. For testing: add `0.0.0.0/0` (not for production). For production: add your IP.
3. Save.

Step 5: Connect
- Clusters → Connect → Connect your application → copy the connection string `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/myFirstDatabase` and replace placeholders.

Step 6: Connect via Node.js (example)
```js
const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/myDB";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');
    const db = client.db('myDB');
    const result = await db.collection('test').insertOne({ name: 'Atlas Connection', status: 'OK' });
    console.log(result);
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
```

---

## Part C — Shell-style CRUD examples (mongosh)

Create / Use a Database
```
use studentDB
# Output: switched to db studentDB
```

Insert documents
```
# Insert one
db.students.insertOne({ roll_no: 1, name: "Alice", department: "CSE", marks: 85 })
# Insert many
db.students.insertMany([
  { roll_no: 2, name: "Bob", department: "ECE", marks: 78 },
  { roll_no: 3, name: "Charlie", department: "CSE", marks: 92 },
  { roll_no: 4, name: "David", department: "MECH", marks: 67 }
])
```

Find documents
```
# Find all
db.students.find()

# Find with condition
db.students.find({ department: "CSE" })

# Projection
db.students.find({}, { name: 1, marks: 1, _id: 0 })

# Find one
db.students.findOne({ roll_no: 2 })
```

Update documents
```
# Update one
db.students.updateOne({ roll_no: 2 }, { $set: { marks: 82 } })

# Update many
db.students.updateMany({ department: "CSE" }, { $set: { status: "Passed" } })
```

Delete documents
```
# Delete one
db.students.deleteOne({ roll_no: 4 })

# Delete many
db.students.deleteMany({ department: "MECH" })

# Delete all (dangerous)
db.students.deleteMany({})
```

---

## Local demo endpoint run (from http://localhost:3000/run-demo)

I triggered the local demo endpoint which performs the insert/find/update/delete sequence and returned JSON. Here is the full JSON response captured from your running server (exact raw output from the endpoint):

```json
{"success":true,"results":{"insertedCount":4,"insertedIds":{"0":"691eba5062eca23d188c288e","1":"691eba5062eca23d188c288f","2":"691eba5062eca23d188c2890","3":"691eba5062eca23d188c2891"},"all":[{"_id":{"$oid":"691eba5062eca23d188c288e"},"roll_no":1,"name":"Alice","department":"CSE","marks":85},{"_id":{"$oid":"691eba5062eca23d188c288f"},"roll_no":2,"name":"Bob","department":"ECE","marks":78},{"_id":{"$oid":"691eba5062eca23d188c2890"},"roll_no":3,"name":"Charlie","department":"CSE","marks":92},{"_id":{"$oid":"691eba5062eca23d188c2891"},"roll_no":4,"name":"David","department":"MECH","marks":67}],"updateMatched":2,"updateModified":2,"projection":[{"name":"Alice","marks":85},{"name":"Bob","marks":78},{"name":"Charlie","marks":92},{"name":"David","marks":67}],"deletedCount":1,"final":[{"_id":{"$oid":"691eba5062eca23d188c288e"},"roll_no":1,"name":"Alice","department":"CSE","marks":85,"status":"Passed"},{"_id":{"$oid":"691eba5062eca23d188c288f"},"roll_no":2,"name":"Bob","department":"ECE","marks":78},{"_id":{"$oid":"691eba5062eca23d188c2890"},"roll_no":3,"name":"Charlie","department":"CSE","marks":92,"status":"Passed"}]}}
```

Notes:
- The endpoint returns ObjectIds; in the JSON above I represented them using a `$oid` object wrapper to show the ObjectId values captured from the run.
- `insertedCount` = 4, `updateMatched` = 2, `updateModified` = 2, `deletedCount` = 1.

---

## Quick reproduction commands (PowerShell)

Start the server locally (in project folder):
```powershell
# optionally copy env
copy .env.example .env
# start server in background
Start-Process -NoNewWindow -FilePath node -ArgumentList server.js
# check health
curl http://localhost:3000/health -UseBasicParsing
# run demo
curl -Method POST http://localhost:3000/run-demo -UseBasicParsing
```

If you want me to format the above JSON as the classic mongosh-style outputs (with `ObjectId('...')` and arrays printed) say so and I will produce that variant.

---

If you want this saved to a different filename or want me to push and commit this file to your GitHub repo for you, tell me and I will commit & push it (you have already pushed earlier but some files were untracked — I can add and commit this file as well if you'd like).