'use client';

import { useEffect, useState } from 'react';

interface RetirementData {
  employee_id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  retirement_year: number;
  years_until_retirement: number;
  months_until_retirement: number;
  retiring_soon: boolean;
}

export default function RetirementsPage() {
  const [retirements, setRetirements] = useState<RetirementData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRetirements() {
      try {
        const res = await fetch('/api/retirements');
        const data = await res.json();
        setRetirements(data);
      } catch (error) {
        console.error('Failed to fetch retirements:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchRetirements();
  }, []);

  function formatDate(dateStr: string) {
    if (!dateStr || dateStr.trim() === '') {
      return '-';
    }

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    // Format as DD MMMM YYYY (BE) in Thai
    const day = date.getDate();
    const month = date.toLocaleString('th-TH', { month: 'long' });
    const yearBE = date.getFullYear() + 543;

    return `${day} ${month} ${yearBE}`;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <p className="text-slate-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-800 mb-8 flex items-center gap-3">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">คำนวณวันเกษียณ</span>
          <span className="text-2xl">🎂</span>
        </h1>
        
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">พนักงาน</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">วันเกิด</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">ปีเกษียณ</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">อีกกี่ปี</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {retirements.map((ret) => (
                  <tr key={ret.employee_id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-semibold">
                      {ret.first_name} {ret.last_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {formatDate(ret.birth_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {ret.retirement_year + 543}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {ret.years_until_retirement > 0 ? `${ret.years_until_retirement} ปี` : 'ถึงเกษียณแล้ว'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {ret.retiring_soon ? (
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
                          เกษียณเร็วๆ นี้
                        </span>
                      ) : (
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          ปกติ
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
