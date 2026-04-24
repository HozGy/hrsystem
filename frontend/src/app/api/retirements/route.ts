import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { calculateRetirementYear, getYearsUntilRetirement, isRetiringSoon, isRetiringThisYear } from '@/lib/retirement';

export async function GET() {
  try {
    const db = await getDb();
    const employees = await db.collection('employees')
      .find({ status: 'active' })
      .toArray();

    const retirementData = employees
      .filter((emp: any) => emp.birthDate && emp.birthDate.trim() !== '') // Only process employees with valid birth dates
      .map((emp: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        const retirementYear = calculateRetirementYear(emp.birthDate);
        const yearsUntil = getYearsUntilRetirement(emp.birthDate);
        const retiringSoon = isRetiringSoon(emp.birthDate);
        const retiringThisYear = isRetiringThisYear(emp.birthDate);

        return {
          employee_id: emp._id.toString(),
          employee_code: emp.employee_code ?? '',
          first_name: emp.firstName ?? '',
          last_name: emp.lastName ?? '',
          birth_date: emp.birthDate,
          retirement_year: retirementYear,
          years_until_retirement: yearsUntil,
          retiring_soon: retiringSoon,
          retiring_this_year: retiringThisYear,
        };
      });

    return NextResponse.json(retirementData);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch retirement data' }, { status: 500 });
  }
}
