import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await getDb();
    
    const employees = await db.collection('employees').find().toArray();

    const activeEmployees = employees.filter((e: any) => e.status === 'active').length; // eslint-disable-line @typescript-eslint/no-explicit-any
    const resignedEmployees = employees.filter((e: any) => e.status === 'resigned').length; // eslint-disable-line @typescript-eslint/no-explicit-any

    return NextResponse.json({
      totalEmployees: employees.length,
      activeEmployees,
      resignedEmployees,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
