"use client";

import { useState, useEffect, useCallback } from "react";
import { StatusBadge } from "./status-badge";
import type { TimesheetWeek, TimesheetStatus, PaginationState } from "@/types";

interface TableViewProps {
	onViewWeek: (week: TimesheetWeek) => void;
	onCreateEntry: (week: TimesheetWeek) => void;
}

export function TableView({ onViewWeek, onCreateEntry }: TableViewProps) {
	const [timesheets, setTimesheets] = useState<TimesheetWeek[]>([]);
	const [pagination, setPagination] = useState<PaginationState>({
		currentPage: 1,
		totalPages: 1,
		perPage: 5,
		total: 0,
	});
	const [statusFilter, setStatusFilter] = useState<TimesheetStatus | "all">(
		"all",
	);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isPerPageOpen, setIsPerPageOpen] = useState(false);
	const [isStatusOpen, setIsStatusOpen] = useState(false);

	const fetchTimesheets = useCallback(async () => {
		setIsLoading(true);
		setError(null);

		try {
			const params = new URLSearchParams({
				page: pagination.currentPage.toString(),
				perPage: pagination.perPage.toString(),
			});

			if (statusFilter !== "all") {
				params.append("status", statusFilter);
			}

			const response = await fetch(`/api/timesheets?${params}`);
			const data = await response.json();

			if (!response.ok || !data.success) {
				throw new Error(data.error || "Failed to fetch timesheets");
			}

			setTimesheets(data.data);
			setPagination(data.pagination);
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setIsLoading(false);
		}
	}, [pagination.currentPage, pagination.perPage, statusFilter]);

	useEffect(() => {
		fetchTimesheets();
	}, [fetchTimesheets]);

	const handlePageChange = (page: number) => {
		setPagination((prev) => ({ ...prev, currentPage: page }));
	};

	const handlePerPageChange = (value: number) => {
		setPagination((prev) => ({ ...prev, perPage: value, currentPage: 1 }));
		setIsPerPageOpen(false);
	};

	const handleStatusFilterChange = (value: TimesheetStatus | "all") => {
		setStatusFilter(value);
		setPagination((prev) => ({ ...prev, currentPage: 1 }));
		setIsStatusOpen(false);
	};

	const getActionButton = (week: TimesheetWeek) => {
		switch (week.status) {
			case "COMPLETED":
				return (
					<button
						onClick={() => onViewWeek(week)}
						className="text-sm font-medium text-[#1C64F2] cursor-pointer">
						View
					</button>
				);
			case "INCOMPLETE":
				return (
					<button
						onClick={() => onViewWeek(week)}
						className="text-sm font-medium text-[#1C64F2] cursor-pointer">
						Update
					</button>
				);
			case "MISSING":
				return (
					<button
						onClick={() => onCreateEntry(week)}
						className="text-sm font-medium text-[#1C64F2] cursor-pointer">
						Create
					</button>
				);
		}
	};

	const renderPagination = () => {
		const pages: (number | string)[] = [];
		const { currentPage, totalPages } = pagination;

		pages.push(1);

		if (currentPage > 3) {
			pages.push("...");
		}

		for (
			let i = Math.max(2, currentPage - 1);
			i <= Math.min(totalPages - 1, currentPage + 1);
			i++
		) {
			if (!pages.includes(i)) {
				pages.push(i);
			}
		}

		if (currentPage < totalPages - 2) {
			pages.push("...");
		}

		if (totalPages > 1) {
			pages.push(totalPages);
		}

		return (
			<div className="flex items-stretch rounded-xl divide-x divide-gray-200 border border-gray-200 bg-white">
				<button
					onClick={() => handlePageChange(currentPage - 1)}
					disabled={currentPage === 1}
					className="px-3 py-1.5 text-sm font-medium 
            text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
					Previous
				</button>

				{pages.map((page, index) => {
					if (page === "...") {
						return (
							<span
								key={`ellipsis-${index}`}
								className="h-9 w-9 text-center align-baseline leading-[2] text-gray-500">
								...
							</span>
						);
					}

					const pageNum = page as number;
					return (
						<button
							key={pageNum}
							onClick={() => handlePageChange(pageNum)}
							className={`h-9 w-9 text-sm font-medium transition-colors font-medium text-sm leading-5 cursor-pointer 
								${currentPage === pageNum ? "text-[#1447E6] bg-gray-50" : "hover:bg-gray-50"}`}>
							{pageNum}
						</button>
					);
				})}

				<button
					onClick={() => handlePageChange(currentPage + 1)}
					disabled={currentPage === totalPages}
					className="px-3 py-1.5 text-sm font-medium 
            text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
					Next
				</button>
			</div>
		);
	};

	return (
		<div className="flex flex-col gap-6 w-full">
			<h1 className="font-bold text-2xl leading-[1]">Your Timesheets</h1>

			<div className="flex flex-wrap gap-3">
				<div className="relative">
					<button
						className="flex h-10 w-36 items-center justify-between rounded-md border border-gray-300 
            bg-white px-3 font-normal text-sm leading-[1.25] hover:bg-gray-50">
						<span>Date Range</span>
						<svg
							className="h-4 w-4 font-normal text-sm leading-[1.25]"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M19 9l-7 7-7-7"
							/>
						</svg>
					</button>
				</div>

				<div className="relative">
					<button
						onClick={() => setIsStatusOpen(!isStatusOpen)}
						className="flex h-10 w-36 items-center justify-between rounded-md border border-gray-300 
              bg-white px-3 t font-normal text-sm leading-[1.25] hover:bg-gray-50">
						<span>
							{statusFilter === "all" ? "Status" : statusFilter}
						</span>
						<svg
							className="h-4 w-4 font-normal text-sm leading-[1.25]"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M19 9l-7 7-7-7"
							/>
						</svg>
					</button>

					{isStatusOpen && (
						<div className="absolute left-0 top-full z-50 mt-1 w-36 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
							{(
								[
									"all",
									"COMPLETED",
									"INCOMPLETE",
									"MISSING",
								] as const
							).map((status) => (
								<button
									key={status}
									onClick={() =>
										handleStatusFilterChange(status)
									}
									className={`block w-full px-3 py-2 text-left  font-normal text-sm leading-[1.25] hover:bg-gray-100
                    ${statusFilter === status ? "bg-gray-100 font-medium" : ""}`}>
									{status === "all" ? "All Status" : status}
								</button>
							))}
						</div>
					)}
				</div>
			</div>

			<div className="overflow-hidden rounded-lg shadow-[var(--shadow-subtleCombo)] bg-white">
				<table className="w-full table-fixed divide-y divide-gray-200">
					<thead className="bg-gray-50">
						<tr>
							<th className="w-[107px] p-4 text-left font-semibold text-xs leading-[1.5] tracking-normal uppercase text-gray-500">
								<div className="flex items-center gap-1">
									Week #
									<svg
										className="h-3 w-3"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M19 9l-7 7-7-7"
										/>
									</svg>
								</div>
							</th>
							<th className="w-1/2 p-4 text-left font-semibold text-xs leading-[1.5] tracking-normal uppercase text-gray-500">
								<div className="flex items-center gap-1">
									Date
									<svg
										className="h-3 w-3"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M19 9l-7 7-7-7"
										/>
									</svg>
								</div>
							</th>
							<th className="w-1/2 p-4 text-left font-semibold text-xs leading-[1.5] tracking-normal uppercase text-gray-500">
								<div className="flex items-center gap-1">
									Status
									<svg
										className="h-3 w-3"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M19 9l-7 7-7-7"
										/>
									</svg>
								</div>
							</th>
							<th className="w-[121px] p-4 font-semibold text-center text-xs leading-[1.5] tracking-normal uppercase text-gray-500">
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-200">
						{isLoading ? (
							<tr>
								<td colSpan={4} className="h-32 text-center">
									<div className="flex items-center justify-center">
										<div className="h-6 w-6 animate-spin rounded-full border-2 border-[#1C64F2] border-t-transparent" />
									</div>
								</td>
							</tr>
						) : timesheets.length === 0 ? (
							<tr>
								<td
									colSpan={4}
									className="h-32 text-center text-gray-500">
									No timesheets found
								</td>
							</tr>
						) : (
							timesheets.map((week) => (
								<tr key={week.id} className="hover:bg-gray-50">
									<td className="p-4 text-sm font-medium text-gray-900 bg-gray-50">
										{week.weekNumber}
									</td>
									<td className="p-4 text-sm text-gray-500">
										{week.startDate} - {week.endDate}
									</td>
									<td className="p-4">
										<StatusBadge status={week.status} />
									</td>
									<td className="p-4 text-center">
										{getActionButton(week)}
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			<div className="flex flex-wrap items-center justify-between gap-4">
				<div className="relative">
					<button
						onClick={() => setIsPerPageOpen(!isPerPageOpen)}
						className="flex items-center rounded-xl px-3 py-2 gap-[6px] shadow-[var(--shadow-thin)]
                text-sm text-gray-700 font-medium 
								border border-[#E5E7EB] bg-[#F9FAFB] hover:bg-gray-50">
						{pagination.perPage} per page
						<svg
							className="h-4 w-4 text-gray-500"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M19 9l-7 7-7-7"
							/>
						</svg>
					</button>

					{isPerPageOpen && (
						<div
							className="absolute bottom-full left-0 z-50 mb-1 w-28 rounded-xl 
						border border-gray-200 bg-white py-1 shadow-lg">
							{[5, 10, 20].map((num) => (
								<button
									key={num}
									onClick={() => handlePerPageChange(num)}
									className={`block w-full px-3 py-2 text-left text-sm hover:bg-gray-100
                      ${pagination.perPage === num ? "bg-gray-100 font-medium" : ""}`}>
									{num} per page
								</button>
							))}
						</div>
					)}
				</div>

				{renderPagination()}
			</div>
		</div>
	);
}
