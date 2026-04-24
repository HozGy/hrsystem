import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const db = await getDb();
    
    const { ObjectId } = await import('mongodb');
    const result = await db.collection('employees').updateOne(
      { _id: new ObjectId(id) },
      { $set: body }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    const updated = await db.collection('employees').findOne({ _id: new ObjectId(id) });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Failed to update employee' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDb();
    
    const { ObjectId } = await import('mongodb');
    await db.collection('employees').deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete employee' }, { status: 500 });
  }
}
