'use client';

import { useEffect, useState } from 'react';

interface Employee {
  _id: string;
  employeeCode: string | null;
  firstName: string;
  lastName: string;
  citizenId: string;
  birthDate: string;
  phone: string;
  address: string;
  startDate: string;
  endDate: string | null;
  status: string;
  resignationReason: string | null;
  profileImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('firstName');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    employeeCode: '',
    firstName: '',
    lastName: '',
    citizenId: '',
    birthDate: '',
    phone: '',
    address: '',
    startDate: '',
    endDate: '',
    status: 'active',
    resignationReason: '',
    profileImageUrl: '',
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/employees');
        const data = await res.json();
        setEmployees(data);
      } catch (error) {
        console.error('Failed to fetch employees:', error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm('ยืนยันการลบพนักงาน?')) return;

    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setEmployees(prev => prev.filter(emp => emp._id !== id));
      }
    } catch (error) {
      console.error('Failed to delete employee:', error);
    }
  }

  function compressImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Resize to max 300px width/height while maintaining aspect ratio
          const maxSize = 300;
          let { width, height } = img;

          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;

          ctx?.drawImage(img, 0, 0, width, height);

          // Convert to base64 with 80% quality
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
          resolve(compressedBase64);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
      return;
    }

    // Validate file size (max 5MB before compression)
    if (file.size > 5 * 1024 * 1024) {
      alert('ไฟล์รูปภาพต้องไม่เกิน 5MB');
      return;
    }

    try {
      const compressedImage = await compressImage(file);
      setFormData(prev => ({ ...prev, profileImageUrl: compressedImage }));
    } catch (error) {
      console.error('Failed to compress image:', error);
      alert('เกิดข้อผิดพลาดในการบีบอัดรูปภาพ');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAddLoading(true);

    try {
      let res;
      if (editingEmployee) {
        // Update existing employee
        res = await fetch(`/api/employees/${editingEmployee._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          const updatedEmployee = await res.json();
          setEmployees(prev => prev.map(emp => 
            emp._id === editingEmployee._id ? updatedEmployee : emp
          ));
          setShowAddModal(false);
          setEditingEmployee(null);
        }
      } else {
        // Add new employee
        res = await fetch('/api/employees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          const newEmployee = await res.json();
          setEmployees(prev => [newEmployee, ...prev]);
          setShowAddModal(false);
        }
      }

      // Reset form
      setFormData({
        employeeCode: '',
        firstName: '',
        lastName: '',
        citizenId: '',
        birthDate: '',
        phone: '',
        address: '',
        startDate: '',
        endDate: '',
        status: 'active',
        resignationReason: '',
        profileImageUrl: '',
      });
    } catch (error) {
      console.error('Failed to save employee:', error);
    } finally {
      setAddLoading(false);
    }
  }

  function handleEdit(employee: Employee) {
    setEditingEmployee(employee);
    setFormData({
      employeeCode: employee.employeeCode || '',
      firstName: employee.firstName,
      lastName: employee.lastName,
      citizenId: employee.citizenId,
      birthDate: employee.birthDate,
      phone: employee.phone,
      address: employee.address,
      startDate: employee.startDate,
      endDate: employee.endDate || '',
      status: employee.status,
      resignationReason: employee.resignationReason || '',
      profileImageUrl: employee.profileImageUrl || '',
    });
    setShowAddModal(true);
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH');
  }

  const filteredEmployees = employees
    .filter(emp => {
      const matchesSearch = !search ||
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        (emp.employeeCode && emp.employeeCode.toLowerCase().includes(search.toLowerCase())) ||
        emp.citizenId.includes(search);

      const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'firstName':
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        case 'startDate':
          return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-blue-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
          </div>
          <p className="text-slate-600 font-medium">กำลังโหลดข้อมูลพนักงาน...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 flex items-center gap-3">
                <span className="text-3xl">👥</span>
                <span>รายชื่อพนักงาน</span>
              </h1>
              <p className="text-slate-600 text-lg">จัดการข้อมูลพนักงานทั้งหมดในระบบ</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2"
            >
              <span>+</span>
              เพิ่มพนักงาน
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-slate-200">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-72">
              <input
                type="text"
                placeholder="ค้นหาชื่อ, รหัสพนักงาน, หรือเลขบัตรประชาชน..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-700">สถานะ:</label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
              >
                <option value="all">ทั้งหมด</option>
                <option value="active">ทำงานอยู่</option>
                <option value="inactive">ลาออก</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-700">เรียงตาม:</label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
              >
                <option value="firstName">ชื่อ</option>
                <option value="startDate">วันที่เริ่มงาน</option>
                <option value="status">สถานะ</option>
              </select>
            </div>

            <div className="text-sm text-slate-600">
              แสดง {filteredEmployees.length} จาก {employees.length} รายการ
            </div>
          </div>
        </div>

        {/* Employee Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((emp) => (
            <div
              key={emp._id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 overflow-hidden"
            >
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white border-opacity-20">
                    {emp.profileImageUrl ? (
                      <img
                        src={emp.profileImageUrl}
                        alt={`${emp.firstName} ${emp.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-white bg-opacity-20 flex items-center justify-center text-2xl font-bold">
                        {(emp.firstName || '?')[0]}{(emp.lastName || '?')[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{emp.firstName || 'ไม่ระบุ'} {emp.lastName || ''}</h3>
                    <p className="text-blue-200 text-sm">
                      {emp.employeeCode || 'รหัส: ไม่ระบุ'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Employee Details */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600 font-medium">เลขบัตรประชาชน</p>
                    <p className="text-slate-900">{emp.citizenId}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 font-medium">วันเกิด</p>
                    <p className="text-slate-900">{formatDate(emp.birthDate)}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 font-medium">วันที่เริ่มงาน</p>
                    <p className="text-slate-900">{formatDate(emp.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 font-medium">สถานะ</p>
                    <p className={`text-sm font-medium ${emp.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                      {emp.status === 'active' ? 'ทำงานอยู่' : 'ลาออก'}
                    </p>
                  </div>
                </div>

                {emp.status === 'inactive' && emp.endDate ? (
                  <div className="border-t border-slate-200 pt-4">
                    <div className="space-y-2">
                      <div>
                        <p className="text-slate-600 font-medium text-sm">วันที่ลาออก</p>
                        <p className="text-slate-900 text-sm">{formatDate(emp.endDate)}</p>
                      </div>
                      {emp.resignationReason && (
                        <div>
                          <p className="text-slate-600 font-medium text-sm">เหตุผลการลาออก</p>
                          <p className="text-slate-900 text-sm">{emp.resignationReason}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}

                <div className="space-y-2">
                  <div>
                    <p className="text-slate-600 font-medium">เบอร์โทร</p>
                    <p className="text-slate-900">{emp.phone || '-'}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 font-medium">ที่อยู่</p>
                    <p className="text-slate-900 text-sm">{emp.address || '-'}</p>
                  </div>
                </div>

                {/* Status and Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    emp.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {emp.status === 'active' ? 'ทำงานอยู่' : 'ลาออก'}
                  </span>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(emp)}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1 rounded-lg transition-colors text-sm font-medium"
                    >
                      แก้ไข
                    </button>
                    <button
                      onClick={() => handleDelete(emp._id)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors text-sm font-medium"
                    >
                      ลบ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredEmployees.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-slate-500 text-lg">ไม่พบพนักงานที่ตรงกับเงื่อนไขการค้นหา</p>
          </div>
        )}
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800">
                  {editingEmployee ? 'แก้ไขข้อมูลพนักงาน' : 'เพิ่มพนักงานใหม่'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingEmployee(null);
                  }}
                  className="text-slate-400 hover:text-slate-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-2">รหัสพนักงาน</label>
                  <input
                    type="text"
                    value={formData.employeeCode}
                    onChange={e => setFormData(prev => ({ ...prev, employeeCode: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
                    placeholder="เช่น EMP001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-2">ชื่อ *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
                    placeholder="ชื่อจริง"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-2">นามสกุล *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={e => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
                    placeholder="นามสกุล"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-2">เลขบัตรประชาชน *</label>
                  <input
                    type="text"
                    required
                    value={formData.citizenId}
                    onChange={e => setFormData(prev => ({ ...prev, citizenId: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
                    placeholder="เลขบัตร 13 หลัก"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-2">วันเกิด *</label>
                  <input
                    type="date"
                    required
                    value={formData.birthDate}
                    onChange={e => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-2">วันที่เริ่มงาน *</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-2">สถานะการทำงาน *</label>
                  <select
                    required
                    value={formData.status}
                    onChange={e => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
                  >
                    <option value="active">ทำงานอยู่</option>
                    <option value="inactive">ลาออก</option>
                  </select>
                </div>

                {formData.status === 'inactive' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-800 mb-2">วันที่ลาออก *</label>
                      <input
                        type="date"
                        required
                        value={formData.endDate}
                        onChange={e => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-800 mb-2">เหตุผลการลาออก</label>
                      <textarea
                        value={formData.resignationReason}
                        onChange={e => setFormData(prev => ({ ...prev, resignationReason: e.target.value }))}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 h-24 resize-none"
                        placeholder="ระบุเหตุผลการลาออก"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-2">เบอร์โทร</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
                    placeholder="0812345678"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-800 mb-2">ที่อยู่</label>
                  <textarea
                    value={formData.address}
                    onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 h-24 resize-none"
                    placeholder="ที่อยู่ปัจจุบัน"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-800 mb-2">รูปภาพพนักงาน</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {formData.profileImageUrl && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-blue-200">
                        <img
                          src={formData.profileImageUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    รูปภาพจะถูกบีบอัดอัตโนมัติเพื่อประหยัดพื้นที่ (สูงสุด 300px, JPEG 80% quality)
                  </p>
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingEmployee(null);
                  }}
                  className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-lg font-semibold hover:bg-slate-200 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addLoading ? (editingEmployee ? 'กำลังแก้ไข...' : 'กำลังเพิ่ม...') : (editingEmployee ? 'แก้ไขพนักงาน' : 'เพิ่มพนักงาน')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
