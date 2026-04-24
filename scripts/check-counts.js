const { MongoClient } = require('mongodb');

async function checkCounts() {
  const client = new MongoClient('mongodb+srv://hoz:0856213847@cluster0.xkkakz6.mongodb.net/employee-management?retryWrites=true&w=majority');
  await client.connect();
  const db = client.db();

  const withCitizenId = await db.collection('employees').countDocuments({ citizenId: { $ne: null } });
  const withoutCitizenId = await db.collection('employees').countDocuments({ citizenId: null });
  const total = await db.collection('employees').countDocuments();

  console.log('Total records:', total);
  console.log('Records with citizenId:', withCitizenId);
  console.log('Records with null citizenId:', withoutCitizenId);

  await client.close();
}

checkCounts().catch(console.error);