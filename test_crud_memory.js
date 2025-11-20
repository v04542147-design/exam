const { MongoMemoryServer } = require('mongodb-memory-server');
const { MongoClient } = require('mongodb');
const { createStudent, findStudents, updateStudent, deleteStudent } = require('./src/crud');

(async function main() {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  console.log('In-memory MongoDB URI:', uri);

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('studentDB');

  try {
    console.log('\n--- INSERT: creating students');
    await db.collection('students').deleteMany({}); // clean slate for demo

    const docs = [
      { roll_no: 1, name: 'Alice', department: 'CSE', marks: 85 },
      { roll_no: 2, name: 'Bob', department: 'ECE', marks: 78 },
      { roll_no: 3, name: 'Charlie', department: 'CSE', marks: 92 },
      { roll_no: 4, name: 'David', department: 'MECH', marks: 67 }
    ];

    const insertPromises = docs.map(d => db.collection('students').insertOne(d));
    const insertResults = await Promise.all(insertPromises);
    console.log('Inserted IDs:', insertResults.map(r => r.insertedId));

    console.log('\n--- FIND: all students');
    const all = await db.collection('students').find().toArray();
    console.log(all);

    console.log('\n--- UPDATE: set status=Passed for department CSE');
    const updateRes = await db.collection('students').updateMany({ department: 'CSE' }, { $set: { status: 'Passed' } });
    console.log('Matched:', updateRes.matchedCount, 'Modified:', updateRes.modifiedCount);

    console.log('\n--- FIND: projection name and marks only');
    const proj = await db.collection('students').find({}, { projection: { name: 1, marks: 1, _id: 0 } }).toArray();
    console.log(proj);

    console.log('\n--- DELETE: remove roll_no 4');
    const del = await db.collection('students').deleteOne({ roll_no: 4 });
    console.log('Deleted count:', del.deletedCount);

    console.log('\n--- FINAL: remaining documents');
    const finalDocs = await db.collection('students').find().toArray();
    console.log(finalDocs);

  } catch (err) {
    console.error('Demo error:', err);
  } finally {
    await client.close();
    await mongod.stop();
    console.log('\nMemory server stopped and disconnected');
  }
})();