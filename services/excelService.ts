import * as XLSX from 'xlsx';
import { EmployeeData, LeaveInfo, AllocationStats } from '../types';

// Helper: Parse Excel Date Serial to JS Date
function parseExcelDate(value: any): Date | null {
  if (!value) return null;
  if (typeof value === 'number') {
    return new Date(Date.UTC(1899, 11, 30 + value));
  }
  if (typeof value === 'string') {
    const date = new Date(value);
    if (!isNaN(date.getTime())) return date;
  }
  return null;
}

// Helper: Normalize Date to YYYY-MM-DD
function formatDate(date: Date | null): string {
  if (!date) return '';
  return date.toISOString().split('T')[0];
}

// Helper: Get Category (1-6) based on Job Title
function getCategoryByTitle(title: any): string {
  if (!title) return '未分類';
  const t = title.toString().trim();
  const categoryMap: Record<string, string> = {
    '資深協理': '1', '主任秘書': '1', '處長': '1',
    '副處長': '2', '中心主任': '2', '中心副主任': '2', '經理': '2', '副理': '2', '襄理': '2', '副管理師': '2', '主任控制員': '2',
    '資深控制員': '3', '資深專員': '3', '資深工程員': '3', '股長': '3',
    '事務長': '4', '站長': '4', '領班': '4', '控制員': '4', '工程員': '4', '專員': '4', '護理師': '4',
    '助理事務長': '5', '助理工程員': '5', '助理專員': '5', '資深司機員': '5', '副站長': '5', '技術士': '5',
    '司機員': '6', '運務員': '6', '技術員': '6', '事務員': '6'
  };
  return categoryMap[t] || '未分類';
}

// 1. Read Excel File (Updated to search sheets)
export function readExcelFile(file: File, mustInclude: string[] = ['工號']): Promise<any[][] | null> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        let targetSheetData: any[][] | null = null;

        // Iterate through all sheets to find the one with valid data
        for (const sheetName of workbook.SheetNames) {
           const ws = workbook.Sheets[sheetName];
           const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
           
           // Check first 20 rows for existence of ALL mustInclude keywords
           const found = jsonData.slice(0, 20).some(row => 
             row && mustInclude.every(keyword => 
               row.some(cell => cell && String(cell).includes(keyword))
             )
           );

           if (found) {
             console.log(`Found valid data in sheet: ${sheetName}`);
             targetSheetData = jsonData;
             break;
           }
        }
        
        // If no matching sheet found, resolve with null
        resolve(targetSheetData);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

// 2. Process Leave Data
export function processLeaveData(leaveData: any[][]): Record<string, LeaveInfo> {
  if (!leaveData || leaveData.length === 0) return {};

  let headerRowIndex = -1;
  let headers: any[] = [];

  // Find header row containing "員工工號" and ("總計" or "合計")
  for (let i = 0; i < Math.min(leaveData.length, 20); i++) {
    const row = leaveData[i];
    if (row && row.some(c => c && c.toString().includes('員工工號')) &&
      (row.some(c => c && c.toString().includes('總計')) || row.some(c => c && c.toString().includes('合計')))) {
      headerRowIndex = i;
      headers = row;
      break;
    }
  }

  if (headerRowIndex === -1) return {};

  const dataRows = leaveData.slice(headerRowIndex + 1);
  const empIdIndex = headers.findIndex(c => c && c.toString().includes('員工工號'));
  const totalLeaveIndex = headers.findIndex(c => c && (c.toString().includes('總計') || c.toString() === '合計'));

  const personalIndices: number[] = [];
  headers.forEach((h, i) => { if (h && h.toString().includes('事假')) personalIndices.push(i); });

  const sickIndices: number[] = [];
  headers.forEach((h, i) => {
    const title = h ? h.toString() : '';
    if (title.includes('病假') || title.includes('傷病假')) sickIndices.push(i);
  });

  const leaveMap: Record<string, LeaveInfo> = {};

  dataRows.forEach(row => {
    if (!row || !row[empIdIndex]) return;
    let rawId = row[empIdIndex].toString();
    // Clean up ID (e.g., "11001 合計")
    let empId = rawId.replace(' 合計', '').replace('合計', '').trim();

    let personalSum = 0;
    personalIndices.forEach(idx => { const val = parseFloat(row[idx]); if (!isNaN(val)) personalSum += val; });

    let sickSum = 0;
    sickIndices.forEach(idx => { const val = parseFloat(row[idx]); if (!isNaN(val)) sickSum += val; });

    let totalSum = 0;
    if (totalLeaveIndex !== -1) {
      totalSum = parseFloat(row[totalLeaveIndex]) || 0;
    } else {
      totalSum = personalSum + sickSum;
    }

    if (empId) {
      leaveMap[empId] = { total: totalSum, personal: personalSum, sick: sickSum };
    }
  });

  return leaveMap;
}

// 3. Process Employee Data & Merge Logic
export function processEmployeeData(employeeRawData: any[][], leaveMap: Record<string, LeaveInfo>): EmployeeData[] {
  const processedData: EmployeeData[] = [];
  if (!employeeRawData || employeeRawData.length === 0) return processedData;

  let headerRowIndex = -1;
  let headers: any[] = [];

  // Find header row
  for (let i = 0; i < Math.min(employeeRawData.length, 20); i++) {
    const row = employeeRawData[i];
    if (row && row.some(c => c && c.toString().includes('工號')) && row.some(c => c && c.toString().includes('姓名'))) {
      headerRowIndex = i;
      headers = row;
      break;
    }
  }

  if (headerRowIndex === -1) return processedData;

  const dataRows = employeeRawData.slice(headerRowIndex + 1);
  const findIdx = (keywords: string[]) => headers.findIndex(h => h && keywords.some(k => h.toString().includes(k)));

  const idx = {
    id: findIdx(['員工工號', '工號']),
    name: findIdx(['中文姓名', '員工姓名', '姓名']),
    dept: findIdx(['部門名稱']),
    title: findIdx(['職務名稱']),
    hire: findIdx(['到職日期', '到職']),
    level: findIdx(['類組', '分類', '職等']),
    leaveStart: findIdx(['留職停薪日', '留職停薪']),
    leaveEnd: findIdx(['留停復職日', '留停復職']),
    status: findIdx(['在職狀態', '狀態'])
  };

  const CURRENT_YEAR = 2025; // As per user requirement
  const YEAR_START = new Date(Date.UTC(CURRENT_YEAR, 0, 1));
  const YEAR_END = new Date(Date.UTC(CURRENT_YEAR, 11, 31));
  const MS_PER_DAY = 1000 * 60 * 60 * 24;

  dataRows.forEach(row => {
    if (!row || idx.id === -1 || !row[idx.id]) return;

    const status = (idx.status !== -1 && row[idx.status]) ? row[idx.status].toString().trim() : '';
    if (status.includes('離職') || status.includes('約聘')) return;

    const empId = String(row[idx.id]).trim();
    const hireDate = idx.hire !== -1 ? parseExcelDate(row[idx.hire]) : null;
    const leaveInfo = leaveMap[empId] || { total: 0, personal: 0, sick: 0 };

    let level = (idx.level !== -1 && row[idx.level]) ? row[idx.level].toString().trim() : '';
    let jobTitle = (idx.title !== -1 && row[idx.title]) ? row[idx.title].toString().trim() : '';
    let itemCategory = getCategoryByTitle(jobTitle);

    let appraisalType: '年考' | '另考' | '特考' | '不予考核' = '特考';
    let lwopDeduction = 0;

    if (hireDate) {
      let effectiveStartDate = hireDate < YEAR_START ? YEAR_START : hireDate;
      let potentialDays = 0;
      if (effectiveStartDate <= YEAR_END) {
        potentialDays = Math.floor((YEAR_END.getTime() - effectiveStartDate.getTime()) / MS_PER_DAY) + 1;
      }

      if (idx.leaveStart !== -1 && row[idx.leaveStart]) {
        const lwopStart = parseExcelDate(row[idx.leaveStart]);
        let lwopEnd = YEAR_END;
        if (idx.leaveEnd !== -1 && row[idx.leaveEnd]) {
          const parsedEnd = parseExcelDate(row[idx.leaveEnd]);
          if (parsedEnd) lwopEnd = parsedEnd;
        }

        if (lwopStart) {
          const overlapStart = lwopStart < YEAR_START ? YEAR_START : lwopStart;
          const overlapEnd = lwopEnd > YEAR_END ? YEAR_END : lwopEnd;
          if (overlapEnd >= overlapStart) {
            lwopDeduction = Math.floor((overlapEnd.getTime() - overlapStart.getTime()) / MS_PER_DAY) + 1;
          }
        }
      }

      const actualServiceDays = potentialDays - lwopDeduction;
      const isHiredBeforeYear = hireDate < YEAR_START;

      if (isHiredBeforeYear && lwopDeduction === 0) {
        appraisalType = '年考';
      } else {
        if (actualServiceDays >= 183) {
          appraisalType = '另考';
        } else {
          appraisalType = '不予考核';
        }
      }
    }

    processedData.push({
      employeeId: empId,
      name: idx.name !== -1 ? row[idx.name] : '',
      department: idx.dept !== -1 ? row[idx.dept] : '',
      jobTitle: jobTitle,
      hireDate: formatDate(hireDate),
      totalLeave: leaveInfo.total,
      personalLeave: leaveInfo.personal,
      sickLeave: leaveInfo.sick,
      appraisalType: appraisalType,
      level: level,
      itemCategory: itemCategory
    });
  });

  return processedData;
}

// 4. Calculate Stats
export function calculateAllocation(data: EmployeeData[]): AllocationStats[] {
  const categoryStats: Record<string, { A: number, a: number, B: number, b: number, C: number, c: number, total: number }> = {};
  const TARGET_CATEGORIES = ['1', '2', '3', '4', '5', '6'];

  TARGET_CATEGORIES.forEach(cat => {
    categoryStats[cat] = { A: 0, a: 0, B: 0, b: 0, C: 0, c: 0, total: 0 };
  });

  data.forEach(emp => {
    const type = emp.appraisalType;
    const leave = emp.totalLeave;
    const cat = String(emp.itemCategory).trim();

    if (TARGET_CATEGORIES.includes(cat)) {
      const stats = categoryStats[cat];
      if (type === '年考') {
        leave === 0 ? stats.A++ : stats.a++;
      } else if (type === '另考') {
        leave === 0 ? stats.B++ : stats.b++;
      } else if (type === '特考') {
        leave === 0 ? stats.C++ : stats.c++;
      }

      if (type !== '不予考核') {
        stats.total++;
      }
    }
  });

  return Object.keys(categoryStats).map(catName => {
    const s = categoryStats[catName];
    const D = s.total;
    
    // d = Sum of all employees with leave > 0 (A+B+C where leave > 0 => a+b+c)
    // Reference from user script: const d = s.a + s.b + s.c;
    const d = s.a + s.b + s.c;
    
    // E = Total (D) - d
    const E = D - d;
    
    const F = Math.floor(E * 0.25);
    const G = E - F;
    const H = Math.floor(G * 0.60);
    const I = Math.ceil((G - H) + (d / 2.0));
    let J = D - F - H - I;
    if (J < 0) J = 0;

    return { catName, D, d, E, F, G, H, I, J };
  });
}

// 5. Generate CSV
export function generateCSV(data: EmployeeData[]) {
    const headers = ["員工工號","姓名","部門","職務","到職日","事假","病假","請假(合計)","項目考核類別","考核類別"];
    const rows: (string | number)[][] = [headers];
    data.forEach(r => {
        rows.push([
            r.employeeId,
            r.name,
            r.department,
            r.jobTitle,
            r.hireDate,
            r.personalLeave,
            r.sickLeave,
            r.totalLeave,
            r.itemCategory,
            r.appraisalType
        ]);
    });
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "名單");
    const date = new Date();
    const dateStr = date.getFullYear() +
                    String(date.getMonth() + 1).padStart(2, '0') +
                    String(date.getDate()).padStart(2, '0');
    XLSX.writeFile(wb, `appraisal_list_${dateStr}.csv`, { bookType: 'csv' });
}

// 6. Generate Stats Excel
export function generateStatsExcel(stats: AllocationStats[]) {
    const headers = ["類別", "2等員額", "3等員額", "4等員額", "5等員額"];
    const rows: (string | number)[][] = [headers];
    stats.forEach(r => {
        rows.push([
            r.catName,
            r.F,
            r.H,
            r.I,
            r.J
        ]);
    });
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "統計表");
    const date = new Date();
    const dateStr = date.getFullYear() +
                    String(date.getMonth() + 1).padStart(2, '0') +
                    String(date.getDate()).padStart(2, '0');
    XLSX.writeFile(wb, `allocation_stats_${dateStr}.xlsx`);
}