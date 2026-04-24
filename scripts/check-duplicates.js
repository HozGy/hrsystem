const { MongoClient } = require('mongodb');

async function checkDuplicates() {
  const client = new MongoClient('mongodb+srv://hoz:0856213847@cluster0.xkkakz6.mongodb.net/employee-management?retryWrites=true&w=majority');
  await client.connect();
  const db = client.db();

  // Check for duplicate citizenId
  const citizenDuplicates = await db.collection('employees').aggregate([
    { $group: { _id: '$citizenId', count: { $sum: 1 }, docs: { $push: '$_id' } } },
    { $match: { count: { $gt: 1 } } }
  ]).toArray();

  console.log('Duplicate citizenId count:', citizenDuplicates.length);
  console.log('Sample duplicates:', citizenDuplicates.slice(0, 3));

  // Check for duplicate employeeCode (if exists)
  const codeDuplicates = await db.collection('employees').aggregate([
    { $group: { _id: '$employeeCode', count: { $sum: 1 }, docs: { $push: '$_id' } } },
    { $match: { count: { $gt: 1 }, _id: { $ne: null } } }
  ]).toArray();

  console.log('Duplicate employeeCode count:', codeDuplicates.length);

  await client.close();
}

checkDuplicates().catch(console.error);