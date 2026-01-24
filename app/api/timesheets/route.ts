import { NextRequest, NextResponse } from "next/server";
import type { TimesheetWeek, TimesheetStatus } from "@/types";

function generateMockTimesheets(): TimesheetWeek[] {
	const timesheets: TimesheetWeek[] = [];
	const statuses: TimesheetStatus[] = ["COMPLETED", "INCOMPLETE", "MISSING"];

	const startDate = new Date("2024-01-01");

	for (let i = 0; i < 99; i++) {
		const weekStart = new Date(startDate);
		weekStart.setDate(startDate.getDate() + i * 7);

		const weekEnd = new Date(weekStart);
		weekEnd.setDate(weekStart.getDate() + 6);

		let status: TimesheetStatus;
		if (i < 85) {
			status = i % 7 === 2 ? "INCOMPLETE" : "COMPLETED";
		} else {
			status = "MISSING";
		}

		const totalHours =
			status === "COMPLETED"
				? 40
				: status === "INCOMPLETE"
					? Math.floor(Math.random() * 30) + 10
					: 0;

		timesheets.push({
			id: `week-${i + 1}`,
			weekNumber: i + 1,
			startDate: formatDate(weekStart),
			endDate: formatDate(weekEnd),
			status,
			totalHours,
			targetHours: 40,
		});
	}

	return timesheets;
}

function formatDate(date: Date): string {
	const day = date.getDate();
	const month = date.toLocaleString("en-US", { month: "long" });
	const year = date.getFullYear();
	return `${day} ${month}, ${year}`;
}

let mockTimesheets: TimesheetWeek[] | null = null;

function getTimesheets(): TimesheetWeek[] {
	if (!mockTimesheets) {
		mockTimesheets = generateMockTimesheets();
	}
	return mockTimesheets;
}

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);

		const page = parseInt(searchParams.get("page") || "1");
		const perPage = parseInt(searchParams.get("perPage") || "5");
		const status = searchParams.get("status") as
			| TimesheetStatus
			| "all"
			| null;

		let timesheets = getTimesheets();

		if (status && status !== "all") {
			timesheets = timesheets.filter((t) => t.status === status);
		}

		const total = timesheets.length;
		const totalPages = Math.ceil(total / perPage);
		const startIndex = (page - 1) * perPage;
		const endIndex = startIndex + perPage;

		const paginatedData = timesheets.slice(startIndex, endIndex);

		return NextResponse.json({
			success: true,
			data: paginatedData,
			pagination: {
				currentPage: page,
				totalPages,
				perPage,
				total,
			},
		});
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: "Failed to fetch timesheets" },
			{ status: 500 },
		);
	}
}
