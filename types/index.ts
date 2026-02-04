export interface User {
	id: string;
	email: string;
	name: string;
	avatar?: string;
}

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

export type TimesheetStatus = "COMPLETED" | "INCOMPLETE" | "MISSING";

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

export interface TimesheetEntryFormData {
	projectId: string;
	workType: string;
	description: string;
	hours: number;
	date: string;
}

export interface Project {
	id: string;
	name: string;
}

export type WorkType =
	| "Development"
	| "Bug fixes"
	| "Testing"
	| "Documentation"
	| "Meetings"
	| "Other";

export interface PaginationState {
	currentPage: number;
	totalPages: number;
	perPage: number;
	total: number;
}

export interface TimesheetFilters {
	dateRange?: {
		start: string;
		end: string;
	};
	status?: TimesheetStatus | "all";
}

export interface ApiResponse<T> {
	data: T;
	success: boolean;
	message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
	pagination: PaginationState;
}
