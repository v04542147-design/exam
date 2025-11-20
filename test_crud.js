const { connectToMongo } = require('./src/db');
const { createStudent, findStudents, updateStudent, deleteStudent } = require('./src/crud');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'studentDB';

(async function main() {
  console.log('Connecting to', MONGO_URI);
  const client = await connectToMongo(MONGO_URI).catch(err => { console.error('Connection error:', err); process.exit(1); });
  const db = client.db(DB_NAME);

  try {
    console.log('\n--- INSERT: creating students');
    await db.collection('students').deleteMany({}); // clean slate for demo

    const docs = [
      { roll_no: 1, name: 'Alice', department: 'CSE', marks: 85 },
      { roll_no: 2, name: 'Bob', department: 'ECE', marks: 78 },
      { roll_no: 3, name: 'Charlie', department: 'CSE', marks: 92 },
      { roll_no: 4, name: 'David', department: 'MECH', marks: 67 }
    ];

    const insertPromises = docs.map(d => createStudent(db, d));
    const insertResults = await Promise.all(insertPromises);
    console.log('Inserted IDs:', insertResults.map(r => r.insertedId));

    console.log('\n--- FIND: all students');
    const all = await findStudents(db);
    console.log(all);

    console.log('\n--- FIND: department CSE');
    const cse = await findStudents(db, { department: 'CSE' });
    console.log(cse);

    console.log('\n--- UPDATE: set status=Passed for department CSE');
    const updateRes = await db.collection('students').updateMany({ department: 'CSE' }, { $set: { status: 'Passed' } });
    console.log('Matched:', updateRes.matchedCount, 'Modified:', updateRes.modifiedCount);

    console.log('\n--- FIND: projection name and marks only');
    const proj = await findStudents(db, {}, { name: 1, marks: 1, _id: 0 });
    console.log(proj);

    console.log('\n--- DELETE: remove roll_no 4');
    const del = await deleteStudent(db, { roll_no: 4 });
    console.log('Deleted count:', del.deletedCount);

    console.log('\n--- FINAL: remaining documents');
    const finalDocs = await findStudents(db);
    console.log(finalDocs);

  } catch (err) {
    console.error('Demo error:', err);
  } finally {
    await client.close();
    console.log('\nDisconnected');
  }
})();
