import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await getDb();
    const employees = await db.collection('employees')
      .find()
      .sort({ hire_date: -1 })
      .toArray();

    return NextResponse.json(employees || []);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = await getDb();
    
    const result = await db.collection('employees').insertOne(body);
    const inserted = await db.collection('employees').findOne({ _id: result.insertedId });

    return NextResponse.json(inserted, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 });
  }
}
