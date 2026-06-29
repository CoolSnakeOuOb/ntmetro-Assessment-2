import React from 'react';
import { AllocationStats } from '../types';
import { Download } from 'lucide-react';
import { generateStatsExcel } from '../services/excelService';

interface Props {
  stats: AllocationStats[];
}

const StatsTable: React.FC<Props> = ({ stats }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
            <h3 className="font-semibold text-lg text-gray-800">項目考核類別員額統計表</h3>
            <p className="text-sm text-gray-500 mt-1">根據員工考績類別與請假狀況自動計算分配名額</p>
        </div>
        <button 
            onClick={() => generateStatsExcel(stats)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            匯出 Excel
          </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm border-b">
              <th className="p-4 font-semibold text-center border-r">類別</th>
              <th className="p-4 font-bold text-center border-r bg-green-50 text-green-700">2等員額</th>
              <th className="p-4 font-bold text-center border-r bg-yellow-50 text-yellow-700">3等員額</th>
              <th className="p-4 font-bold text-center border-r bg-orange-50 text-orange-700">4等員額</th>
              <th className="p-4 font-bold text-center bg-red-50 text-red-700">5等員額</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-100">
            {stats.length === 0 ? (
               <tr><td colSpan={5} className="p-8 text-center text-gray-500">尚無統計資料</td></tr>
            ) : (
              stats.map((row) => (
                <tr key={row.catName} className="hover:bg-gray-50">
                  <td className="p-4 text-center font-bold text-gray-900 border-r">{row.catName}</td>
                  <td className="p-4 text-center font-bold text-green-700 border-r bg-green-50/30">{row.F} 人</td>
                  <td className="p-4 text-center font-bold text-yellow-700 border-r bg-yellow-50/30">{row.H} 人</td>
                  <td className="p-4 text-center font-bold text-orange-700 border-r bg-orange-50/30">{row.I} 人</td>
                  <td className="p-4 text-center font-bold text-red-700 bg-red-50/30">{row.J} 人</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StatsTable;