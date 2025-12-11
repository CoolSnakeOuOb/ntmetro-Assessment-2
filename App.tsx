import React, { useState, useEffect } from 'react';
import { User, UserRole, EmployeeData, AllocationStats } from './types';
import * as ExcelService from './services/excelService';
import FileUpload from './components/FileUpload';
import EmployeeTable from './components/EmployeeTable';
import StatsTable from './components/StatsTable';
import SelfAssessmentForm from './components/SelfAssessmentForm';
import { LogOut, User as UserIcon, LayoutDashboard, PieChart, Users, Menu, X, Trash2 } from 'lucide-react';

const MOCK_USERS: Record<string, User & { password: string }> = {
  "10001": { id: "10001", name: "主管Ａ", department: "管理部", title: "經理", role: UserRole.SUPERVISOR, password: "123" },
  "11001": { id: "11001", name: "員工A", department: "技術部", title: "工程師", role: UserRole.EMPLOYEE, password: "123" },
};

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loginId, setLoginId] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Supervisor Data State with LocalStorage Persistence
  const [employees, setEmployees] = useState<EmployeeData[]>(() => {
    const saved = localStorage.getItem('ntmc_employees');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [stats, setStats] = useState<AllocationStats[]>(() => {
    const saved = localStorage.getItem('ntmc_stats');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentView, setCurrentView] = useState<'list' | 'stats'>('list');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Restore session
  useEffect(() => {
    const savedUser = sessionStorage.getItem('loggedInUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Persist Data whenever it changes
  useEffect(() => {
    localStorage.setItem('ntmc_employees', JSON.stringify(employees));
    localStorage.setItem('ntmc_stats', JSON.stringify(stats));
  }, [employees, stats]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const targetUser = MOCK_USERS[loginId];
    if (targetUser && targetUser.password === loginPass) {
      const { password, ...safeUser } = targetUser;
      setUser(safeUser);
      sessionStorage.setItem('loggedInUser', JSON.stringify(safeUser));
      setLoginError('');
    } else {
      setLoginError('員工編號或密碼錯誤 (試試 10001/123)');
    }
  };

  const handleLogout = () => {
    setUser(null);
    sessionStorage.removeItem('loggedInUser');
    // We do NOT clear employees/stats on logout by default, 
    // so the data persists if they log back in.
  };

  const handleClearData = () => {
    if (window.confirm('確定要清除所有已匯入的資料嗎？這將無法復原。')) {
        setEmployees([]);
        setStats([]);
        localStorage.removeItem('ntmc_employees');
        localStorage.removeItem('ntmc_stats');
    }
  };

  const handleUpload = async (empFile: File, leaveFile: File) => {
    setIsProcessing(true);
    try {
      // 1. Read files with specific keywords to find the correct sheets
      // Employee file: must contain '工號' and '姓名' (matches 員工工號/工號, 中文姓名/員工姓名)
      // Leave file: must contain '工號' and '計' (matches 員工工號, 總計/合計)
      const [empData, leaveData] = await Promise.all([
        ExcelService.readExcelFile(empFile, ['工號', '姓名']),
        ExcelService.readExcelFile(leaveFile, ['工號', '計'])
      ]);

      if (!empData) {
        alert("無法讀取員工名單，請確認檔案是否包含「工號」與「姓名」欄位");
        return;
      }
      if (!leaveData) {
        alert("無法讀取請假明細，請確認檔案是否包含「工號」與「總計/合計」欄位");
        return;
      }

      // 2. Process logic
      const leaveMap = ExcelService.processLeaveData(leaveData);
      const processedEmployees = ExcelService.processEmployeeData(empData, leaveMap);
      
      // 3. Update state
      setEmployees(processedEmployees);
      setStats(ExcelService.calculateAllocation(processedEmployees));
      setCurrentView('list');
    } catch (err) {
      console.error(err);
      alert("處理檔案時發生錯誤，請確認檔案格式是否正確。");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateAppraisalType = (id: string, type: EmployeeData['appraisalType']) => {
    const updatedEmployees = employees.map(e => e.employeeId === id ? { ...e, appraisalType: type } : e);
    setEmployees(updatedEmployees);
    setStats(ExcelService.calculateAllocation(updatedEmployees));
  };

  // --- LOGIN VIEW ---
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
          <div className="bg-primary-600 p-8 text-center">
            <h1 className="text-2xl font-bold text-white tracking-wide">新北捷運公司</h1>
            <p className="text-primary-100 mt-2">考核管理系統</p>
          </div>
          <div className="p-8">
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">員工編號</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    className="pl-10 w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                    placeholder="例如: 10001"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">密碼</label>
                <input
                  type="password"
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                  placeholder="••••••"
                  required
                />
              </div>
              
              {loginError && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{loginError}</div>}

              <button type="submit" className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg">
                登入系統
              </button>
            </form>
            <div className="mt-6 text-xs text-gray-500 bg-gray-50 p-3 rounded border border-gray-200">
               <p className="font-semibold mb-1">測試帳號：</p>
               <p>主管: 10001 / 123</p>
               <p>員工: 11001 / 123</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN APP VIEW ---
  return (
    <div className="h-screen overflow-hidden bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out shadow-2xl
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}>
        <div className="p-6 flex items-center justify-between border-b border-slate-700">
          <span className="text-lg font-bold tracking-wider">NTMC HR</span>
          <button className="lg:hidden" onClick={() => setIsSidebarOpen(false)}><X className="w-5 h-5"/></button>
        </div>
        
        <div className="p-4">
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center font-bold text-lg">
              {user.name[0]}
            </div>
            <div>
              <div className="font-medium">{user.name}</div>
              <div className="text-xs text-slate-400">{user.department}</div>
            </div>
          </div>

          <nav className="space-y-2">
            {user.role === UserRole.SUPERVISOR ? (
              <>
                <button 
                  onClick={() => setCurrentView('list')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentView === 'list' ? 'bg-primary-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}
                >
                  <Users className="w-5 h-5" />
                  考核名單
                </button>
                <button 
                   onClick={() => setCurrentView('stats')}
                   className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentView === 'stats' ? 'bg-primary-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}
                >
                  <PieChart className="w-5 h-5" />
                  員額統計
                </button>
                {employees.length > 0 && (
                    <button 
                    onClick={handleClearData}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-red-900/50 text-red-300 mt-4 border border-red-900/30"
                    >
                    <Trash2 className="w-5 h-5" />
                    清除資料
                    </button>
                )}
              </>
            ) : (
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-primary-600 text-white">
                <LayoutDashboard className="w-5 h-5" />
                我的考核
              </button>
            )}
          </nav>
        </div>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white transition-colors">
            <LogOut className="w-5 h-5" />
            登出系統
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-auto">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40 px-6 py-4 flex items-center justify-between shadow-sm">
           <div className="flex items-center gap-4">
             <button className="lg:hidden p-2 text-gray-600" onClick={() => setIsSidebarOpen(true)}>
               <Menu className="w-6 h-6" />
             </button>
             <h2 className="text-xl font-semibold text-gray-800">
                {user.role === UserRole.SUPERVISOR 
                  ? (currentView === 'list' ? '考核管理看板' : '統計分析看板')
                  : '個人考核中心'}
             </h2>
           </div>
           <div className="text-sm text-gray-500 hidden sm:block">
             系統日期: {new Date().toLocaleDateString('zh-TW')}
           </div>
        </header>

        <div className="p-6">
          {user.role === UserRole.SUPERVISOR ? (
            <div className="max-w-7xl mx-auto space-y-6">
              <FileUpload onUpload={handleUpload} isProcessing={isProcessing} />
              
              {currentView === 'list' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                   <EmployeeTable data={employees} onUpdateType={handleUpdateAppraisalType} />
                </div>
              )}
              
              {currentView === 'stats' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <StatsTable stats={stats} />
                </div>
              )}
            </div>
          ) : (
            <SelfAssessmentForm user={user} />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;