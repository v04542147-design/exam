// CRUD helper functions using the Node.js MongoDB Driver

async function createStudent(db, doc) {
  const result = await db.collection('students').insertOne(doc);
  return result;
}

async function findStudents(db, filter = {}, projection = {}) {
  const cursor = db.collection('students').find(filter, { projection });
  return cursor.toArray();
}

async function updateStudent(db, filter, update, options = {}) {
  const result = await db.collection('students').updateOne(filter, update, options);
  return result;
}

async function deleteStudent(db, filter) {
  const result = await db.collection('students').deleteOne(filter);
  return result;
}

module.exports = { createStudent, findStudents, updateStudent, deleteStudent };
