import React, { useRef, useState } from 'react';
import { UploadCloud, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';

interface Props {
  onUpload: (empFile: File, leaveFile: File) => void;
  isProcessing: boolean;
}

const FileUpload: React.FC<Props> = ({ onUpload, isProcessing }) => {
  const [empFile, setEmpFile] = useState<File | null>(null);
  const [leaveFile, setLeaveFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');

  const handleUpload = () => {
    if (!empFile || !leaveFile) {
      setError('請同時上傳兩個檔案');
      return;
    }
    setError('');
    onUpload(empFile, leaveFile);
  };

  const FileInput = ({ label, file, setFile }: { label: string, file: File | null, setFile: (f: File | null) => void }) => (
    <div className="flex-1">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className={`relative border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center transition-colors
        ${file ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'}
      `}>
        <input 
          type="file" 
          accept=".xls,.xlsx" 
          onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        {file ? (
            <>
                <FileSpreadsheet className="w-8 h-8 text-green-600 mb-2" />
                <span className="text-sm font-medium text-green-800 truncate max-w-full px-2">{file.name}</span>
                <span className="text-xs text-green-600 mt-1">點擊更換</span>
            </>
        ) : (
            <>
                <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">點擊上傳 Excel</span>
                <span className="text-xs text-gray-400 mt-1">支援 .xlsx, .xls</span>
            </>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <h3 className="font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
        <UploadCloud className="w-5 h-5 text-primary-600" />
        資料匯入
      </h3>
      
      <div className="flex flex-col sm:flex-row gap-6">
        <FileInput label="1. 員工名單 (Excel)" file={empFile} setFile={setEmpFile} />
        <FileInput label="2. 請假明細 (Excel)" file={leaveFile} setFile={setLeaveFile} />
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleUpload}
          disabled={isProcessing || !empFile || !leaveFile}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-white font-medium transition-all shadow-sm
            ${isProcessing || !empFile || !leaveFile
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-primary-600 hover:bg-primary-700 hover:shadow-md'
            }
          `}
        >
          {isProcessing ? '處理中...' : (
            <>
              <CheckCircle className="w-4 h-4" />
              開始分析
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default FileUpload;
