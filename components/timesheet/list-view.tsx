"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { TimesheetDay, TimesheetEntry, TimesheetWeek } from "@/types";

interface ListViewProps {
	week: TimesheetWeek | null;
	onAddEntry: (date: string) => void;
	onEditEntry: (entry: TimesheetEntry) => void;
	onDeleteEntry: (entryId: string) => void;
	refreshKey?: number;
}

export function ListView({
	week,
	onAddEntry,
	onEditEntry,
	onDeleteEntry,
	refreshKey,
}: ListViewProps) {
	const [days, setDays] = useState<TimesheetDay[]>([]);
	const [totalHours, setTotalHours] = useState(0);
	const [targetHours, setTargetHours] = useState(40);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [openMenuId, setOpenMenuId] = useState<string | null>(null);
	const menuRef = useRef<HTMLDivElement>(null);

	const getWeekDates = useCallback(() => {
		const today = new Date();
		const monday = new Date(today);
		monday.setDate(today.getDate() - today.getDay() + 1);

		const friday = new Date(monday);
		friday.setDate(monday.getDate() + 4);

		return {
			start: monday.toISOString().split("T")[0],
			end: friday.toISOString().split("T")[0],
			label: `${monday.getDate()} - ${friday.getDate()} ${monday.toLocaleString("en-US", { month: "long" })}, ${monday.getFullYear()}`,
		};
	}, []);

	const fetchEntries = useCallback(async () => {
		setIsLoading(true);
		setError(null);

		try {
			const { start, end } = getWeekDates();
			const response = await fetch(
				`/api/timesheets/entries?weekStart=${start}&weekEnd=${end}`,
			);
			const data = await response.json();

			if (!response.ok || !data.success) {
				throw new Error(data.error || "Failed to fetch entries");
			}

			const weekDays: TimesheetDay[] = [];
			const startDate = new Date(start);

			for (let i = 0; i < 5; i++) {
				const currentDate = new Date(startDate);
				currentDate.setDate(startDate.getDate() + i);
				const dateStr = currentDate.toISOString().split("T")[0];
				const dayLabel = `${currentDate.toLocaleString("en-US", { month: "short" })} ${currentDate.getDate()}`;

				const existingDay = data.data.days.find(
					(d: TimesheetDay) => d.date === dateStr,
				);

				weekDays.push({
					date: dateStr,
					dayLabel,
					entries: existingDay?.entries || [],
					totalHours: existingDay?.totalHours || 0,
				});
			}

			setDays(weekDays);
			setTotalHours(data.data.totalHours);
			setTargetHours(data.data.targetHours);
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setIsLoading(false);
		}
	}, [getWeekDates]);

	useEffect(() => {
		fetchEntries();
	}, [fetchEntries, refreshKey]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				menuRef.current &&
				!menuRef.current.contains(event.target as Node)
			) {
				setOpenMenuId(null);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const progressPercentage = Math.min((totalHours / targetHours) * 100, 100);
	const { label: weekLabel } = getWeekDates();

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div>
					<h2 className="font-bold text-2xl leading-[24px]">
						This week&apos;s timesheet
					</h2>
					<p className="text-sm text-gray-500">{weekLabel}</p>
				</div>

				<div className="text-right">
					<p className="text-sm font-medium text-gray-900">
						{totalHours}/{targetHours} hrs
					</p>
					<div className="mt-1 flex items-center gap-2">
						<div className="h-2 w-32 overflow-hidden rounded-full bg-gray-200">
							<div
								className="h-full bg-orange-500 transition-all duration-300"
								style={{ width: `${progressPercentage}%` }}
							/>
						</div>
						<span className="text-xs text-gray-500">100%</span>
					</div>
				</div>
			</div>

			<div className="space-y-4">
				{isLoading ? (
					<div className="flex items-center justify-center py-12">
						<div className="h-6 w-6 animate-spin rounded-full border-2 border-[#1C64F2] border-t-transparent" />
					</div>
				) : (
					days.map((day) => (
						<div key={day.date} className="space-y-2">
							<h3 className="text-sm font-medium text-gray-500">
								{day.dayLabel}
							</h3>

							<div className="space-y-2">
								{day.entries.map((entry) => (
									<div
										key={entry.id}
										className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
										<div className="flex-1">
											<p className="text-sm font-medium text-gray-900">
												{entry.description}
											</p>
										</div>

										<div className="flex items-center gap-3">
											<span className="text-sm text-gray-500">
												{entry.hours} hrs
											</span>
											<span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
												{entry.projectName}
											</span>

											<div
												className="relative"
												ref={
													openMenuId === entry.id
														? menuRef
														: null
												}>
												<button
													onClick={() =>
														setOpenMenuId(
															openMenuId ===
																entry.id
																? null
																: entry.id,
														)
													}
													className="rounded p-1 hover:bg-gray-100">
													<svg
														className="h-4 w-4 text-gray-500"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor">
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
														/>
													</svg>
												</button>

												{openMenuId === entry.id && (
													<div className="absolute right-0 top-full z-50 mt-1 w-32 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
														<button
															onClick={() => {
																onEditEntry(
																	entry,
																);
																setOpenMenuId(
																	null,
																);
															}}
															className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100">
															Edit
														</button>
														<button
															onClick={() => {
																onDeleteEntry(
																	entry.id,
																);
																setOpenMenuId(
																	null,
																);
															}}
															className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100">
															Delete
														</button>
													</div>
												)}
											</div>
										</div>
									</div>
								))}

								<button
									onClick={() => onAddEntry(day.date)}
									className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed 
                    border-[#1C64F2] bg-blue-50/50 py-3 text-sm font-medium text-[#1C64F2] 
                    transition-colors hover:bg-blue-50">
									<svg
										className="h-4 w-4"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M12 4v16m8-8H4"
										/>
									</svg>
									Add new task
								</button>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
}
