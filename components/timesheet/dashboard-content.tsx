"use client";

import { useState } from "react";
import { TableView } from "./table-view";
import { ListView } from "./list-view";
import { EntryModal } from "./entry-modal";
import type {
	TimesheetWeek,
	TimesheetEntry,
	TimesheetEntryFormData,
} from "@/types";

type TabType = "table" | "list";

export function DashboardContent() {
	const [activeTab, setActiveTab] = useState<TabType>("table");
	const [selectedWeek, setSelectedWeek] = useState<TimesheetWeek | null>(
		null,
	);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingEntry, setEditingEntry] = useState<TimesheetEntry | null>(
		null,
	);
	const [selectedDate, setSelectedDate] = useState<string>("");
	const [refreshKey, setRefreshKey] = useState(0);

	const handleViewWeek = (week: TimesheetWeek) => {
		setSelectedWeek(week);
		setActiveTab("list");
	};

	const handleCreateEntry = (week: TimesheetWeek) => {
		setSelectedWeek(week);
		setActiveTab("list");
		const startDate = parseDate(week.startDate);
		if (startDate) {
			setSelectedDate(startDate);
			setEditingEntry(null);
			setIsModalOpen(true);
		}
	};

	const handleAddEntry = (date: string) => {
		setSelectedDate(date);
		setEditingEntry(null);
		setIsModalOpen(true);
	};

	const handleEditEntry = (entry: TimesheetEntry) => {
		setEditingEntry(entry);
		setIsModalOpen(true);
	};

	const handleDeleteEntry = async (entryId: string) => {
		if (!confirm("Are you sure you want to delete this entry?")) {
			return;
		}

		try {
			const response = await fetch(
				`/api/timesheets/entries?id=${entryId}`,
				{
					method: "DELETE",
				},
			);
			const data = await response.json();

			if (!response.ok || !data.success) {
				throw new Error(data.error || "Failed to delete entry");
			}

			setRefreshKey((prev) => prev + 1);
		} catch (err) {
			alert(
				err instanceof Error ? err.message : "Failed to delete entry",
			);
		}
	};

	const handleModalSubmit = async (formData: TimesheetEntryFormData) => {
		const isEditing = !!editingEntry;
		const url = "/api/timesheets/entries";
		const method = isEditing ? "PUT" : "POST";
		const body = isEditing
			? { id: editingEntry.id, ...formData }
			: formData;

		const response = await fetch(url, {
			method,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});

		const data = await response.json();

		if (!response.ok || !data.success) {
			throw new Error(data.error || "Failed to save entry");
		}

		setRefreshKey((prev) => prev + 1);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setEditingEntry(null);
		setSelectedDate("");
	};

	return (
		<div className="w-full">
			{activeTab === "table" ? (
				<TableView
					onViewWeek={handleViewWeek}
					onCreateEntry={handleCreateEntry}
				/>
			) : (
				<ListView
					week={selectedWeek}
					onAddEntry={handleAddEntry}
					onEditEntry={handleEditEntry}
					onDeleteEntry={handleDeleteEntry}
					refreshKey={refreshKey}
				/>
			)}

			<EntryModal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				onSubmit={handleModalSubmit}
				entry={editingEntry}
				date={selectedDate}
			/>
		</div>
	);
}

function parseDate(dateStr: string): string | null {
	try {
		const cleanStr = dateStr.replace(",", "");
		const date = new Date(cleanStr);
		if (isNaN(date.getTime())) {
			return null;
		}
		return date.toISOString().split("T")[0];
	} catch {
		return null;
	}
}
