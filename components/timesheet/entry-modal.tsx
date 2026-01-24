"use client";

import React from "react";

import { useState, useEffect, useRef } from "react";
import type { TimesheetEntry, Project, TimesheetEntryFormData } from "@/types";

interface EntryModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: TimesheetEntryFormData) => Promise<void>;
	entry?: TimesheetEntry | null;
	date?: string;
}

const WORK_TYPES = [
	"Development",
	"Bug fixes",
	"Testing",
	"Documentation",
	"Meetings",
	"Other",
];

interface FormErrors {
	projectId?: string;
	workType?: string;
	description?: string;
	hours?: string;
}

export function EntryModal({
	isOpen,
	onClose,
	onSubmit,
	entry,
	date,
}: EntryModalProps) {
	const [projects, setProjects] = useState<Project[]>([]);
	const [projectId, setProjectId] = useState("");
	const [workType, setWorkType] = useState("");
	const [description, setDescription] = useState("");
	const [hours, setHours] = useState(4);
	const [errors, setErrors] = useState<FormErrors>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isProjectOpen, setIsProjectOpen] = useState(false);
	const [isWorkTypeOpen, setIsWorkTypeOpen] = useState(false);

	const modalRef = useRef<HTMLDivElement>(null);
	const projectDropdownRef = useRef<HTMLDivElement>(null);
	const workTypeDropdownRef = useRef<HTMLDivElement>(null);

	const isEditing = !!entry;

	useEffect(() => {
		const fetchProjects = async () => {
			try {
				const response = await fetch("/api/projects");
				const data = await response.json();
				if (data.success) {
					setProjects(data.data);
				}
			} catch (err) {
				console.error("Failed to fetch projects");
			}
		};

		if (isOpen) {
			fetchProjects();
		}
	}, [isOpen]);

	useEffect(() => {
		if (isOpen) {
			if (entry) {
				setProjectId(entry.projectId);
				setWorkType(entry.workType);
				setDescription(entry.description);
				setHours(entry.hours);
			} else {
				setProjectId("");
				setWorkType("Bug fixes");
				setDescription("");
				setHours(4);
			}
			setErrors({});
		}
	}, [isOpen, entry]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				projectDropdownRef.current &&
				!projectDropdownRef.current.contains(event.target as Node)
			) {
				setIsProjectOpen(false);
			}
			if (
				workTypeDropdownRef.current &&
				!workTypeDropdownRef.current.contains(event.target as Node)
			) {
				setIsWorkTypeOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onClose();
			}
		};
		if (isOpen) {
			document.addEventListener("keydown", handleEscape);
		}
		return () => document.removeEventListener("keydown", handleEscape);
	}, [isOpen, onClose]);

	const validateForm = (): boolean => {
		const newErrors: FormErrors = {};

		if (!projectId) {
			newErrors.projectId = "Please select a project";
		}

		if (!workType) {
			newErrors.workType = "Please select a type of work";
		}

		if (!description.trim()) {
			newErrors.description = "Description is required";
		} else if (description.trim().length < 3) {
			newErrors.description = "Description must be at least 3 characters";
		}

		if (hours < 1 || hours > 24) {
			newErrors.hours = "Hours must be between 1 and 24";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		setIsSubmitting(true);

		try {
			await onSubmit({
				projectId,
				workType,
				description: description.trim(),
				hours,
				date:
					entry?.date ||
					date ||
					new Date().toISOString().split("T")[0],
			});
			onClose();
		} catch (err) {
			setErrors({
				description: "Failed to save entry. Please try again.",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const incrementHours = () => {
		if (hours < 24) {
			setHours(hours + 1);
		}
	};

	const decrementHours = () => {
		if (hours > 1) {
			setHours(hours - 1);
		}
	};

	const getProjectName = () => {
		const project = projects.find((p) => p.id === projectId);
		return project?.name || "Project Name";
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div
				className="fixed inset-0 bg-gray-600/50"
				onClick={onClose}
				aria-hidden="true"
			/>

			<div
				ref={modalRef}
				className="relative z-50 w-full max-w-[646px] rounded-lg bg-white divide-y divide-gray-200"
				role="dialog"
				aria-modal="true">
				<div className="flex items-center justify-between p-5">
					<h2 className="text-lg font-semibold text-gray-900">
						{isEditing ? "Edit Entry" : "Add New Entry"}
					</h2>
					<button
						onClick={onClose}
						className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
						<svg
							className="h-5 w-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4.5 p-5">
					<div className="space-y-2">
						<div className="flex items-center gap-1">
							<label className="text-sm font-medium text-gray-900">
								Select Project *
							</label>
							<svg
								className="h-3.5 w-3.5 text-gray-400"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>
						<div className="relative" ref={projectDropdownRef}>
							<button
								type="button"
								onClick={() => setIsProjectOpen(!isProjectOpen)}
								className={`flex w-full max-w-[364px] items-center justify-between rounded-md border p-3 text-sm
                  ${errors.projectId ? "border-red-500" : "border-gray-300"}
                  ${projectId ? "text-gray-900" : "text-gray-500"}`}>
								<span>{getProjectName()}</span>
								<svg
									className="h-4 w-4 text-gray-400"
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

							{isProjectOpen && (
								<div className="absolute left-0 top-full z-10 mt-1 max-h-48 w-full max-w-[364px] overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg">
									{projects.map((project) => (
										<button
											key={project.id}
											type="button"
											onClick={() => {
												setProjectId(project.id);
												setIsProjectOpen(false);
											}}
											className={`block w-full px-3 py-2 text-left text-sm hover:bg-gray-100
                        ${projectId === project.id ? "bg-gray-100 font-medium" : ""}`}>
											{project.name}
										</button>
									))}
								</div>
							)}
						</div>
						{errors.projectId && (
							<p className="text-xs text-red-600">
								{errors.projectId}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<div className="flex items-center gap-1">
							<label className="text-sm font-medium text-gray-900">
								Type of Work *
							</label>
							<svg
								className="h-3.5 w-3.5 text-gray-400"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>
						<div className="relative" ref={workTypeDropdownRef}>
							<button
								type="button"
								onClick={() =>
									setIsWorkTypeOpen(!isWorkTypeOpen)
								}
								className={`flex w-full max-w-[364px] items-center justify-between rounded-md border p-3 text-sm
                  ${errors.workType ? "border-red-500" : "border-gray-300"}
                  ${workType ? "text-gray-900" : "text-gray-500"}`}>
								<span>{workType || "Select type"}</span>
								<svg
									className="h-4 w-4 text-gray-400"
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

							{isWorkTypeOpen && (
								<div className="absolute left-0 top-full z-10 mt-1 w-full max-w-[364px] rounded-md border border-gray-200 bg-white py-1 shadow-lg">
									{WORK_TYPES.map((type) => (
										<button
											key={type}
											type="button"
											onClick={() => {
												setWorkType(type);
												setIsWorkTypeOpen(false);
											}}
											className={`block w-full px-3 py-2 text-left text-sm hover:bg-gray-100
                        ${workType === type ? "bg-gray-100 font-medium" : ""}`}>
											{type}
										</button>
									))}
								</div>
							)}
						</div>
						{errors.workType && (
							<p className="text-xs text-red-600">
								{errors.workType}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<label className="block text-sm font-medium text-gray-900">
							Task description *
						</label>
						<textarea
							placeholder="Write text here ..."
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							className={`w-full resize-none rounded-md border p-3 text-sm outline-none
                placeholder:text-gray-500 focus:border-[#1C64F2] focus:ring-1 focus:ring-[#1C64F2]
                ${errors.description ? "border-red-500" : "border-gray-300"}`}
							rows={5}
						/>
						<p className="text-xs text-gray-500">
							A note for extra info
						</p>
						{errors.description && (
							<p className="text-xs text-red-600">
								{errors.description}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<label className="block text-sm font-medium text-gray-900">
							Hours *
						</label>
						<div className="flex items-center">
							<button
								type="button"
								onClick={decrementHours}
								disabled={hours <= 1}
								className="flex h-9 w-9 items-center justify-center rounded-l-lg border border-gray-300 bg-gray-100 hover:bg-gray-300 text-gray-900
                  disabled:cursor-not-allowed disabled:opacity-50">
								<svg
									className="h-4 w-4"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M20 12H4"
									/>
								</svg>
							</button>
							<div className="flex h-9 w-12 items-center justify-center border-y border-gray-300 bg-white text-sm font-medium">
								{hours}
							</div>
							<button
								type="button"
								onClick={incrementHours}
								disabled={hours >= 24}
								className="flex h-9 w-9 items-center justify-center rounded-r-lg border border-gray-300 bg-gray-100 hover:bg-gray-300 text-gray-900
                  disabled:cursor-not-allowed disabled:opacity-50">
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
							</button>
						</div>
						{errors.hours && (
							<p className="text-xs text-red-600">
								{errors.hours}
							</p>
						)}
					</div>
				</form>

				<div className="flex gap-3 p-5">
					<button
						type="submit"
						className="flex-1 rounded-lg bg-[#1C64F2] p-2 text-xs font-medium text-white 
                transition-colors hover:bg-[#364fc7] disabled:cursor-not-allowed disabled:opacity-50"
						disabled={isSubmitting}>
						{isSubmitting
							? "Saving..."
							: isEditing
								? "Update entry"
								: "Add entry"}
					</button>
					<button
						type="button"
						onClick={onClose}
						disabled={isSubmitting}
						className="flex-1 rounded-lg border border-gray-200 bg-white p-2 text-xs 
                font-medium text-gray-900 transition-colors hover:bg-gray-50 
                disabled:cursor-not-allowed disabled:opacity-50">
						Cancel
					</button>
				</div>
			</div>
		</div>
	);
}
