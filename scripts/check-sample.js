const { MongoClient } = require('mongodb');

async function checkSample() {
  const client = new MongoClient('mongodb+srv://hoz:0856213847@cluster0.xkkakz6.mongodb.net/employee-management?retryWrites=true&w=majority');
  await client.connect();
  const db = client.db();

  const sample = await db.collection('employees').find().limit(5).toArray();
  console.log('Sample records:');
  sample.forEach((emp, i) => {
    console.log(`Record ${i+1}:`, {
      firstName: emp.firstName,
      lastName: emp.lastName,
      citizenId: emp.citizenId,
      employeeCode: emp.employeeCode
    });
  });

  await client.close();
}

checkSample().catch(console.error);