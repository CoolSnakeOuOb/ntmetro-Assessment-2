export enum UserRole {
  SUPERVISOR = 'supervisor',
  EMPLOYEE = 'employee',
}

export interface User {
  id: string;
  name: string;
  department: string;
  title: string;
  role: UserRole;
}

export interface EmployeeData {
  employeeId: string;
  name: string;
  department: string;
  jobTitle: string;
  hireDate: string;
  totalLeave: number;
  personalLeave: number;
  sickLeave: number;
  appraisalType: '年考' | '另考' | '特考' | '不予考核';
  level: string;
  itemCategory: string; // 1-6
}

export interface AllocationStats {
  catName: string;
  D: number; // Total eligible (受考人數)
  d: number; // Special cases (特考+另考+年考 but leave>0) roughly
  E: number; // D - d
  F: number; // 2nd grade quota
  G: number; // E - F
  H: number; // 3rd grade quota
  I: number; // 4th grade quota
  J: number; // 5th grade quota
}

export interface LeaveInfo {
  total: number;
  personal: number;
  sick: number;
}
