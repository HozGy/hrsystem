'use client';

import { useEffect, useState } from 'react';

interface Stats {
  totalEmployees: number;
  activeEmployees: number;
  resignedEmployees: number;
}

interface RetirementAlert {
  employee_id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  retirement_year: number;
  years_until_retirement: number;
  retiring_soon: boolean;
  retiring_this_year: boolean;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [retirementAlerts, setRetirementAlerts] = useState<RetirementAlert[]>([]);
  const [retiringThisYearCount, setRetiringThisYearCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, retirementsRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/retirements'),
        ]);

        const statsData = await statsRes.json();
        const retirementsData = await retirementsRes.json();

        setStats(statsData);
        setRetirementAlerts(retirementsData.filter((r: RetirementAlert) => r.retiring_soon));
        setRetiringThisYearCount(retirementsData.filter((r: RetirementAlert) => r.retiring_this_year).length);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
          </div>
          <p className="text-slate-600 font-medium">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'พนักงานทั้งหมด', value: stats?.totalEmployees || 0, icon: '👥', gradientFrom: 'from-blue-600', gradientTo: 'to-blue-400' },
    { label: 'พนักงานทำงานอยู่', value: stats?.activeEmployees || 0, icon: '✅', gradientFrom: 'from-green-600', gradientTo: 'to-green-400' },
    { label: 'พนักงานลาออก', value: stats?.resignedEmployees || 0, icon: '📤', gradientFrom: 'from-red-600', gradientTo: 'to-red-400' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 flex items-center gap-3">
            <span className="text-3xl">📊</span>
            <span>Dashboard</span>
          </h1>
          <p className="text-slate-500 text-lg">ข้อมูลสรุปสำคัญของระบบจัดการพนักงาน</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {statCards.map((card) => (
            <div 
              key={card.label} 
              className={`bg-gradient-to-br ${card.gradientFrom} ${card.gradientTo} rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group border border-white border-opacity-30`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="text-4xl group-hover:scale-125 transition-transform duration-300">{card.icon}</div>
              </div>
              <div className="text-5xl font-bold text-white mb-2 group-hover:scale-105 transition-transform duration-300 origin-left">
                {card.value.toLocaleString('th-TH')}
              </div>
              <div className="text-sm text-white text-opacity-95 font-medium">{card.label}</div>
            </div>
          ))}
        </div>

        {/* Retirement Alerts Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200 mb-8">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-3xl">⚠️</span>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">แจ้งเตือนเกษียณเร็วๆ นี้</h2>
            <span className="ml-auto bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 px-4 py-2 rounded-full font-semibold text-sm border border-amber-300">
              {retirementAlerts.length} คน
            </span>
          </div>

          {retirementAlerts.length === 0 ? (
            <div className="text-center py-12 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200">
              <span className="text-6xl mb-4 block animate-bounce">✅</span>
              <p className="text-green-700 font-semibold text-lg mb-1">ไม่มีข้อห่วง</p>
              <p className="text-green-600">ไม่มีพนักงานที่จะเกษียณใน 12 เดือนนี้</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {retirementAlerts.map((alert) => (
                <div 
                  key={alert.employee_id} 
                  className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border-l-4 border-amber-500 hover:shadow-lg transition-shadow duration-300 hover:border-orange-500"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">{alert.first_name} {alert.last_name}</h3>
                      <p className="text-sm text-slate-600">รหัส: {alert.employee_code}</p>
                    </div>
                    <span className="text-2xl">👤</span>
                  </div>
                  <div className="bg-white rounded-xl p-4 space-y-2 border border-orange-200">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 text-sm font-medium">ปีเกษียณ (พ.ศ.)</span>
                      <span className="font-bold text-slate-800">{alert.retirement_year + 543}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-orange-200">
                      <span className="text-slate-600 text-sm font-medium">เหลือเวลา</span>
                      <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                        {alert.years_until_retirement} ปี
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Retiring This Year Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-3xl">📅</span>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">เกษียณในปีงบประมาณนี้</h2>
            <span className="ml-auto bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-4 py-2 rounded-full font-semibold text-sm border border-blue-300">
              {retiringThisYearCount} คน
            </span>
          </div>

          {retiringThisYearCount === 0 ? (
            <div className="text-center py-12 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl border-2 border-slate-200">
              <span className="text-6xl mb-4 block">ℹ️</span>
              <p className="text-slate-700 font-semibold text-lg mb-1">ไม่มีการเกษียณในปีนี้</p>
              <p className="text-slate-600">ไม่มีพนักงานที่จะเกษียณในปีงบประมาณนี้</p>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
              <p className="text-center text-2xl font-bold text-blue-800">
                มีพนักงานที่จะเกษียณในปีงบประมาณนี้ <span className="text-4xl">{retiringThisYearCount}</span> คน
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
