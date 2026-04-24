/* eslint-disable */
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { MongoClient, ObjectId } from 'mongodb';

interface EmployeeRow {
  'รหัสพนักงาน': string;
  'ชื่อ': string;
  'นามสกุล': string;
  'เลขบัตรประชาชน': string;
  'วันเกิด': string;
  'เบอร์โทร': string;
  'ที่อยู่': string;
  'วันที่เริ่มงาน': string;
  'วันที่ลาออก': string;
  'สถานะ': string;
}

function parseThaiDate(dateStr: string): string | null {
  if (!dateStr || dateStr.trim() === '') return null;
  
  // Format: "18 ธ.ค. 52" or "29 01 1973"
  const parts = dateStr.trim().split(' ');
  
  if (parts.length < 3) return null;
  
  let day = parseInt(parts[0]);
  let month: number;
  let year = parseInt(parts[2]);
  
  // Check if month is Thai abbreviation
  const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const monthIndex = thaiMonths.indexOf(parts[1]);
  
  if (monthIndex !== -1) {
    month = monthIndex + 1;
    // Thai year (e.g., 52) -> add 2500
    if (year < 100) {
      year += 2500;
    }
  } else {
    // Numeric month (e.g., "29 01 1973")
    month = parseInt(parts[1]);
    // If year is 19xx or 20xx, it's AD
    if (year < 2500) {
      year += 543; // Convert to Buddhist era
    }
  }
  
  // Convert to YYYY-MM-DD
  const date = new Date(year - 543, month - 1, day);
  return date.toISOString().split('T')[0];
}

const mongoUri = 'mongodb+srv://hoz:0856213847@cluster0.xkkakz6.mongodb.net/employee-management?retryWrites=true&w=majority';
const client = new MongoClient(mongoUri);
const db = client.db('employee-management');

async function main() {
  const csvPath = 'c:\\Users\\Computer\\Desktop\\employees.csv';
  const csvContent = fs.readFileSync(csvPath, 'utf-8');

  const records: EmployeeRow[] = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
  });

  const employees = records.map((row, index) => {
    const birthDate = parseThaiDate(row['วันเกิด']);
    const hireDate = parseThaiDate(row['วันที่เริ่มงาน']);
    const resignationDate = parseThaiDate(row['วันที่ลาออก']);

    return {
      employee_code: row['รหัสพนักงาน'] || `EMP${String(index + 1).padStart(4, '0')}`,
      first_name: row['ชื่อ'],
      last_name: row['นามสกุล'],
      id_card: row['เลขบัตรประชาชน'],
      birth_date: birthDate,
      phone: row['เบอร์โทร'] || null,
      address: row['ที่อยู่'] || null,
      hire_date: hireDate,
      resignation_date: resignationDate,
      status: resignationDate ? 'resigned' : 'active',
    };
  }).filter(emp => emp.first_name && emp.last_name);

  console.log(`Found ${employees.length} employees to import`);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    // Insert employees into MongoDB
    for (const emp of employees) {
      try {
        const result = await db.collection('employees').insertOne(emp);
        const employeeId = result.insertedId;
        console.log(`Inserted: ${emp.first_name} ${emp.last_name}`);

        // Insert hire record if hire_date exists
        if (emp.hire_date) {
          try {
            await db.collection('hires').insertOne({
              employee_id: employeeId,
              hire_date: emp.hire_date,
            });
            console.log(`  Created hire record`);
          } catch (hireError) {
            console.error(`  Failed to create hire record:`, hireError);
          }
        }

        // Insert resignation record if resignation_date exists
        if (emp.resignation_date) {
          try {
            await db.collection('resignations').insertOne({
              employee_id: employeeId,
              resignation_date: emp.resignation_date,
              reason: null,
            });
            console.log(`  Created resignation record`);
          } catch (resError) {
            console.error(`  Failed to create resignation record:`, resError);
          }
        }
      } catch (empError) {
        console.error(`Failed to insert ${emp.first_name} ${emp.last_name}:`, empError);
      }
    }

    console.log(`\nImport complete!`);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

main().catch(console.error);
