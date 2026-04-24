const { MongoClient } = require('mongodb');

async function checkNullCitizenId() {
  const client = new MongoClient('mongodb+srv://hoz:0856213847@cluster0.xkkakz6.mongodb.net/employee-management?retryWrites=true&w=majority');
  await client.connect();
  const db = client.db();

  const nullRecords = await db.collection('employees').find({ citizenId: null }).limit(3).toArray();
  console.log('Records with null citizenId:');
  nullRecords.forEach((emp, i) => {
    console.log(`Record ${i+1}:`, {
      firstName: emp.firstName,
      lastName: emp.lastName,
      citizenId: emp.citizenId,
      employeeCode: emp.employeeCode
    });
  });

  await client.close();
}

checkNullCitizenId().catch(console.error);