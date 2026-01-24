import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "@/components/auth/login-form";
import { AuthProvider } from "@/contexts/auth-context";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

const renderWithAuth = (component: React.ReactNode) => {
	return render(<AuthProvider>{component}</AuthProvider>);
};

describe("LoginForm", () => {
	beforeEach(() => {
		(global.fetch as jest.Mock).mockReset();
	});

	it("renders login form with all fields", () => {
		renderWithAuth(<LoginForm />);

		expect(screen.getByText("Welcome back")).toBeInTheDocument();
		expect(screen.getByLabelText("Email")).toBeInTheDocument();
		expect(screen.getByLabelText("Password")).toBeInTheDocument();
		expect(screen.getByLabelText("Remember me")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /sign in/i }),
		).toBeInTheDocument();
	});

	it("shows validation errors for empty fields", async () => {
		renderWithAuth(<LoginForm />);

		const submitButton = screen.getByRole("button", { name: /sign in/i });
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText("Email is required")).toBeInTheDocument();
			expect(
				screen.getByText("Password is required"),
			).toBeInTheDocument();
		});
	});

	it("shows validation error for invalid email", async () => {
		renderWithAuth(<LoginForm />);
		const user = userEvent.setup();

		const emailInput = screen.getByLabelText("Email");
		await user.type(emailInput, "invalid-email");

		const passwordInput = screen.getByLabelText("Password");
		await user.type(passwordInput, "password123");

		const submitButton = screen.getByRole("button", { name: /sign in/i });
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(
				screen.getByText("Please enter a valid email address"),
			).toBeInTheDocument();
		});
	});

	it("displays demo credentials hint", () => {
		renderWithAuth(<LoginForm />);

		expect(
			screen.getByText(
				/Demo credentials: john\.doe@example\.com \/ password123/i,
			),
		).toBeInTheDocument();
	});
});
