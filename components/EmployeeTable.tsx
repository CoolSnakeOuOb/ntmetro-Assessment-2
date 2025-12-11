import React, { useState } from 'react';
import { EmployeeData } from '../types';
import { ArrowUpDown, Filter, Download } from 'lucide-react';
import { generateCSV } from '../services/excelService';

interface Props {
  data: EmployeeData[];
  onUpdateType: (id: string, type: EmployeeData['appraisalType']) => void;
}

const EmployeeTable: React.FC<Props> = ({ data, onUpdateType }) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = data.filter(emp => {
    const matchesFilter = filterType === 'all' || emp.appraisalType === filterType;
    const matchesSearch = emp.name.includes(searchTerm) || emp.employeeId.includes(searchTerm) || emp.department.includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h3 className="font-semibold text-lg text-gray-800">待評核同仁列表 ({filteredData.length})</h3>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="搜尋姓名、工號..."
              className="pl-3 pr-10 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <select 
              className="pl-8 pr-4 py-2 border rounded-lg text-sm bg-white appearance-none focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">所有類別</option>
              <option value="年考">年考</option>
              <option value="另考">另考</option>
              <option value="特考">特考</option>
              <option value="不予考核">不予考核</option>
            </select>
            <Filter className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400 pointer-events-none" />
          </div>

          <button 
            onClick={() => generateCSV(data)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            匯出
          </button>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
              <th className="p-4 font-medium border-b">工號</th>
              <th className="p-4 font-medium border-b">姓名</th>
              <th className="p-4 font-medium border-b">部門</th>
              <th className="p-4 font-medium border-b">職務</th>
              <th className="p-4 font-medium border-b">到職日</th>
              <th className="p-4 font-medium border-b text-center">事假</th>
              <th className="p-4 font-medium border-b text-center">病假</th>
              <th className="p-4 font-medium border-b text-center">請假合計</th>
              <th className="p-4 font-medium border-b">考核類別</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-100">
            {filteredData.length === 0 ? (
               <tr><td colSpan={9} className="p-8 text-center text-gray-500">無符合資料</td></tr>
            ) : (
              filteredData.map((emp) => (
                <tr key={emp.employeeId} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-900">{emp.employeeId}</td>
                  <td className="p-4 text-gray-700">{emp.name}</td>
                  <td className="p-4 text-gray-600">{emp.department}</td>
                  <td className="p-4 text-gray-600">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {emp.jobTitle}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">{emp.hireDate}</td>
                  <td className="p-4 text-center text-gray-600">{emp.personalLeave}</td>
                  <td className="p-4 text-center text-gray-600">{emp.sickLeave}</td>
                  <td className="p-4 text-center font-medium text-gray-800">{emp.totalLeave}</td>
                  <td className="p-4">
                    <select
                      className={`block w-full text-xs font-medium py-1.5 pl-2 pr-6 border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500
                        ${emp.appraisalType === '特考' ? 'text-blue-600 bg-blue-50 border-blue-200' : ''}
                        ${emp.appraisalType === '不予考核' ? 'text-gray-400 bg-gray-50' : ''}
                      `}
                      value={emp.appraisalType}
                      onChange={(e) => onUpdateType(emp.employeeId, e.target.value as any)}
                    >
                      <option value="年考">年考</option>
                      <option value="另考">另考</option>
                      <option value="特考">特考</option>
                      <option value="不予考核">不予考核</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 flex justify-between">
         <span>顯示 {filteredData.length} 筆資料</span>
         <span>分類: {filterType}</span>
      </div>
    </div>
  );
};

export default EmployeeTable;
