import { NextRequest, NextResponse } from "next/server";
import type { TimesheetEntry, TimesheetDay } from "@/types";

// In-memory store for entries (in production, use database)
let entries: TimesheetEntry[] = generateInitialEntries();

function generateInitialEntries(): TimesheetEntry[] {
	const mockEntries: TimesheetEntry[] = [];
	const projects = [
		{ id: "proj-1", name: "Project Alpha" },
		{ id: "proj-2", name: "Project Beta" },
		{ id: "proj-3", name: "Project Gamma" },
	];
	const workTypes = [
		"Development",
		"Bug fixes",
		"Testing",
		"Documentation",
		"Meetings",
	];
	const descriptions = [
		"Homepage Development",
		"API Integration",
		"Unit Testing",
		"Code Review",
		"Feature Implementation",
	];

	// Generate entries for the current week
	const today = new Date();
	const weekStart = new Date(today);
	weekStart.setDate(today.getDate() - today.getDay() + 1); // Monday

	for (let day = 0; day < 5; day++) {
		const currentDate = new Date(weekStart);
		currentDate.setDate(weekStart.getDate() + day);
		const dateStr = currentDate.toISOString().split("T")[0];

		// Add 2-3 entries per day
		const entriesPerDay = Math.floor(Math.random() * 2) + 2;
		for (let i = 0; i < entriesPerDay; i++) {
			const project =
				projects[Math.floor(Math.random() * projects.length)];
			mockEntries.push({
				id: `entry-${day}-${i}`,
				date: dateStr,
				projectId: project.id,
				projectName: project.name,
				workType:
					workTypes[Math.floor(Math.random() * workTypes.length)],
				description:
					descriptions[
						Math.floor(Math.random() * descriptions.length)
					],
				hours: 4,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			});
		}
	}

	return mockEntries;
}

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const weekStart = searchParams.get("weekStart");
		const weekEnd = searchParams.get("weekEnd");

		let filteredEntries = entries;

		if (weekStart && weekEnd) {
			filteredEntries = entries.filter((entry) => {
				return entry.date >= weekStart && entry.date <= weekEnd;
			});
		}

		// Group entries by day
		const entriesByDate: Record<string, TimesheetEntry[]> = {};
		filteredEntries.forEach((entry) => {
			if (!entriesByDate[entry.date]) {
				entriesByDate[entry.date] = [];
			}
			entriesByDate[entry.date].push(entry);
		});

		// Convert to TimesheetDay array
		const days: TimesheetDay[] = Object.entries(entriesByDate)
			.map(([date, dayEntries]) => {
				const dateObj = new Date(date);
				return {
					date,
					dayLabel: dateObj.toLocaleDateString("en-US", {
						month: "short",
						day: "numeric",
					}),
					entries: dayEntries,
					totalHours: dayEntries.reduce((sum, e) => sum + e.hours, 0),
				};
			})
			.sort((a, b) => a.date.localeCompare(b.date));

		const totalHours = filteredEntries.reduce((sum, e) => sum + e.hours, 0);

		return NextResponse.json({
			success: true,
			data: {
				days,
				totalHours,
				targetHours: 40,
			},
		});
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: "Failed to fetch entries" },
			{ status: 500 },
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { projectId, workType, description, hours, date } = body;

		// Validation
		if (!projectId || !workType || !description || !hours || !date) {
			return NextResponse.json(
				{ success: false, error: "All fields are required" },
				{ status: 400 },
			);
		}

		if (hours < 1 || hours > 24) {
			return NextResponse.json(
				{ success: false, error: "Hours must be between 1 and 24" },
				{ status: 400 },
			);
		}

		// Get project name
		const projects: Record<string, string> = {
			"proj-1": "Project Alpha",
			"proj-2": "Project Beta",
			"proj-3": "Project Gamma",
		};

		const newEntry: TimesheetEntry = {
			id: `entry-${Date.now()}`,
			date,
			projectId,
			projectName: projects[projectId] || "Unknown Project",
			workType,
			description,
			hours,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		entries.push(newEntry);

		return NextResponse.json({
			success: true,
			data: newEntry,
		});
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: "Failed to create entry" },
			{ status: 500 },
		);
	}
}

export async function PUT(request: NextRequest) {
	try {
		const body = await request.json();
		const { id, projectId, workType, description, hours, date } = body;

		if (!id) {
			return NextResponse.json(
				{ success: false, error: "Entry ID is required" },
				{ status: 400 },
			);
		}

		const entryIndex = entries.findIndex((e) => e.id === id);

		if (entryIndex === -1) {
			return NextResponse.json(
				{ success: false, error: "Entry not found" },
				{ status: 404 },
			);
		}

		const projects: Record<string, string> = {
			"proj-1": "Project Alpha",
			"proj-2": "Project Beta",
			"proj-3": "Project Gamma",
		};

		entries[entryIndex] = {
			...entries[entryIndex],
			projectId: projectId || entries[entryIndex].projectId,
			projectName: projectId
				? projects[projectId] || "Unknown Project"
				: entries[entryIndex].projectName,
			workType: workType || entries[entryIndex].workType,
			description: description || entries[entryIndex].description,
			hours: hours || entries[entryIndex].hours,
			date: date || entries[entryIndex].date,
			updatedAt: new Date().toISOString(),
		};

		return NextResponse.json({
			success: true,
			data: entries[entryIndex],
		});
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: "Failed to update entry" },
			{ status: 500 },
		);
	}
}

export async function DELETE(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const id = searchParams.get("id");

		if (!id) {
			return NextResponse.json(
				{ success: false, error: "Entry ID is required" },
				{ status: 400 },
			);
		}

		const entryIndex = entries.findIndex((e) => e.id === id);

		if (entryIndex === -1) {
			return NextResponse.json(
				{ success: false, error: "Entry not found" },
				{ status: 404 },
			);
		}

		entries.splice(entryIndex, 1);

		return NextResponse.json({
			success: true,
			message: "Entry deleted successfully",
		});
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: "Failed to delete entry" },
			{ status: 500 },
		);
	}
}
