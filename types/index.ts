// User types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

// Auth types
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Timesheet types
export type TimesheetStatus = 'COMPLETED' | 'INCOMPLETE' | 'MISSING';

export interface TimesheetWeek {
  id: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
  status: TimesheetStatus;
  totalHours: number;
  targetHours: number;
}

export interface TimesheetEntry {
  id: string;
  date: string;
  projectId: string;
  projectName: string;
  workType: string;
  description: string;
  hours: number;
  createdAt: string;
  updatedAt: string;
}

export interface TimesheetDay {
  date: string;
  dayLabel: string;
  entries: TimesheetEntry[];
  totalHours: number;
}

// Form types
export interface TimesheetEntryFormData {
  projectId: string;
  workType: string;
  description: string;
  hours: number;
  date: string;
}

// Project types
export interface Project {
  id: string;
  name: string;
}

// Work type options
export type WorkType = 'Development' | 'Bug fixes' | 'Testing' | 'Documentation' | 'Meetings' | 'Other';

// Pagination types
export interface PaginationState {
  currentPage: number;
  totalPages: number;
  perPage: number;
  total: number;
}

// Filter types
export interface TimesheetFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  status?: TimesheetStatus | 'all';
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: PaginationState;
}
