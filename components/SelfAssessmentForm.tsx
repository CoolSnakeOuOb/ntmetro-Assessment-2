import React, { useState } from 'react';
import { User } from '../types';
import { Save, Send } from 'lucide-react';

interface Props {
  user: User;
}

const SelfAssessmentForm: React.FC<Props> = ({ user }) => {
  const [formData, setFormData] = useState({
    hostingBusiness: '',
    major: '',
    trialStart: '',
    trialEnd: '',
    satisfactionWork: '滿意',
    satisfactionRelation: '滿意',
    careerWish: '1',
    positionChange: '',
    unitChange: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="bg-gradient-to-r from-primary-800 to-primary-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex justify-between items-start">
            <div>
                <h2 className="text-2xl font-bold mb-2">從業人員考核自評表</h2>
                <div className="flex gap-6 text-sm opacity-90">
                    <span>姓名: <span className="font-semibold">{user.name}</span></span>
                    <span>工號: <span className="font-semibold">{user.id}</span></span>
                    <span>部門: <span className="font-semibold">{user.department}</span></span>
                    <span>職稱: <span className="font-semibold">{user.title}</span></span>
                </div>
            </div>
            <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                <div className="text-xs uppercase tracking-wider opacity-75">Status</div>
                <div className="font-bold text-green-300">考核進行中</div>
            </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center text-sm">1</span>
            基本資料確認
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">主辦業務</label>
            <input 
              type="text" id="hostingBusiness"
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 p-2 border"
              placeholder="請填寫主要負責業務"
              value={formData.hostingBusiness} onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">專業領域</label>
            <input 
              type="text" id="major"
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 p-2 border"
              placeholder="例如: 軌道工程、行政管理"
              value={formData.major} onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">試用期間（起）</label>
            <input 
              type="date" id="trialStart"
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 p-2 border"
              value={formData.trialStart} onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">試用期間（止）</label>
            <input 
              type="date" id="trialEnd"
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 p-2 border"
              value={formData.trialEnd} onChange={handleChange}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center text-sm">2</span>
            自我評價與職涯
        </h3>
        
        <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">1. 對試用期間在公司的表現感到：</label>
                    <select 
                        id="satisfactionWork"
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 p-2 border"
                        value={formData.satisfactionWork} onChange={handleChange}
                    >
                        <option>非常滿意</option>
                        <option>滿意</option>
                        <option>尚可</option>
                        <option>不滿意</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">2. 對與同事與主管間關係感到：</label>
                    <select 
                        id="satisfactionRelation"
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 p-2 border"
                        value={formData.satisfactionRelation} onChange={handleChange}
                    >
                        <option>非常滿意</option>
                        <option>滿意</option>
                        <option>尚可</option>
                        <option>不滿意</option>
                    </select>
                </div>
            </div>

            <div className="pt-4">
                 <label className="block text-sm font-medium text-gray-700 mb-2">3. 對您所從擔任職務希望：</label>
                 <select 
                    id="careerWish"
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 p-2 border mb-3"
                    value={formData.careerWish} onChange={handleChange}
                >
                    <option value="1">繼續擔任現職</option>
                    <option value="2">如能調整至同單位其他職務</option>
                    <option value="3">如能變更至其他單位</option>
                </select>

                {formData.careerWish === '2' && (
                    <input 
                        type="text" id="positionChange"
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 p-2 border animate-in fade-in slide-in-from-top-2"
                        placeholder="請填寫希望調整之職務"
                        value={formData.positionChange} onChange={handleChange}
                    />
                )}
                {formData.careerWish === '3' && (
                     <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                        <input 
                            type="text" id="unitChange"
                            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 p-2 border"
                            placeholder="希望單位"
                            value={formData.unitChange} onChange={handleChange}
                        />
                         <input 
                            type="text" id="positionChange"
                            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 p-2 border"
                            placeholder="希望職務"
                            value={formData.positionChange} onChange={handleChange}
                        />
                     </div>
                )}
            </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button className="flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors">
            <Save className="w-5 h-5" />
            暫存草稿
        </button>
        <button className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 shadow-md hover:shadow-lg transition-all">
            <Send className="w-5 h-5" />
            送出考核
        </button>
      </div>
    </div>
  );
};

export default SelfAssessmentForm;
