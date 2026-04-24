const { MongoClient } = require('mongodb');

async function cleanNullRecords() {
  const client = new MongoClient('mongodb+srv://hoz:0856213847@cluster0.xkkakz6.mongodb.net/employee-management?retryWrites=true&w=majority');
  await client.connect();
  const db = client.db();

  const result = await db.collection('employees').deleteMany({ citizenId: null });
  console.log('Deleted records:', result.deletedCount);

  const remaining = await db.collection('employees').countDocuments();
  console.log('Remaining records:', remaining);

  await client.close();
}

cleanNullRecords().catch(console.error);