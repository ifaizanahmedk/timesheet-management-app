import type { TimesheetStatus } from "@/types";

interface StatusBadgeProps {
	status: TimesheetStatus;
}

const statusConfig: Record<
	TimesheetStatus,
	{ label: string; className: string }
> = {
	COMPLETED: {
		label: "COMPLETED",
		className: "bg-[#DEF7EC] text-[#03543F]",
	},
	INCOMPLETE: {
		label: "INCOMPLETE",
		className: "bg-[#FDF6B2] text-[#723B13]",
	},
	MISSING: {
		label: "MISSING",
		className: "bg-[#FCE8F3] text-[#99154B]",
	},
};

export function StatusBadge({ status }: StatusBadgeProps) {
	const config = statusConfig[status];

	return (
		<span
			className={`inline-flex items-center rounded-md px-2.5 py-0.5 font-medium text-xs leading-[1.5] text-center align-middle ${config.className}`}>
			{config.label}
		</span>
	);
}
