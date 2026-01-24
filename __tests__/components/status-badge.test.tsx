import { render, screen } from "@testing-library/react";
import { StatusBadge } from "@/components/timesheet/status-badge";

describe("StatusBadge", () => {
	it("renders COMPLETED status correctly", () => {
		render(<StatusBadge status="COMPLETED" />);

		const badge = screen.getByText("COMPLETED");
		expect(badge).toBeInTheDocument();
		expect(badge).toHaveClass("bg-emerald-100", "text-emerald-700");
	});

	it("renders INCOMPLETE status correctly", () => {
		render(<StatusBadge status="INCOMPLETE" />);

		const badge = screen.getByText("INCOMPLETE");
		expect(badge).toBeInTheDocument();
		expect(badge).toHaveClass("bg-amber-100", "text-amber-700");
	});

	it("renders MISSING status correctly", () => {
		render(<StatusBadge status="MISSING" />);

		const badge = screen.getByText("MISSING");
		expect(badge).toBeInTheDocument();
		expect(badge).toHaveClass("bg-red-100", "text-red-700");
	});
});
