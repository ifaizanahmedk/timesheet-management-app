"use client";

import {
	createContext,
	useContext,
	useCallback,
	useEffect,
	useState,
	type ReactNode,
} from "react";
import type { AuthState, LoginCredentials, User } from "@/types";

interface AuthContextType extends AuthState {
	login: (
		credentials: LoginCredentials,
	) => Promise<{ success: boolean; error?: string }>;
	logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DUMMY_USER: User = {
	id: "1",
	email: "john.doe@example.com",
	name: "John Doe",
};

const DUMMY_PASSWORD = "password123";

export function AuthProvider({ children }: { children: ReactNode }) {
	const [state, setState] = useState<AuthState>({
		user: null,
		token: null,
		isAuthenticated: false,
		isLoading: true,
	});

	useEffect(() => {
		const checkSession = () => {
			try {
				const token = sessionStorage.getItem("auth_token");
				const userJson = sessionStorage.getItem("auth_user");

				if (token && userJson) {
					const user = JSON.parse(userJson) as User;
					setState({
						user,
						token,
						isAuthenticated: true,
						isLoading: false,
					});
				} else {
					setState((prev) => ({ ...prev, isLoading: false }));
				}
			} catch {
				setState((prev) => ({ ...prev, isLoading: false }));
			}
		};

		checkSession();
	}, []);

	const login = useCallback(
		async (
			credentials: LoginCredentials,
		): Promise<{ success: boolean; error?: string }> => {
			setState((prev) => ({ ...prev, isLoading: true }));

			try {
				const response = await fetch("/api/auth/login", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(credentials),
				});

				const data = await response.json();

				if (!response.ok || !data.success) {
					setState((prev) => ({ ...prev, isLoading: false }));
					return {
						success: false,
						error: data.error || "Login failed",
					};
				}

				const { user, token } = data;

				sessionStorage.setItem("auth_token", token);
				sessionStorage.setItem("auth_user", JSON.stringify(user));

				setState({
					user,
					token,
					isAuthenticated: true,
					isLoading: false,
				});

				return { success: true };
			} catch (error) {
				setState((prev) => ({ ...prev, isLoading: false }));
				return {
					success: false,
					error: "An error occurred during login",
				};
			}
		},
		[],
	);

	const logout = useCallback(() => {
		sessionStorage.removeItem("auth_token");
		sessionStorage.removeItem("auth_user");

		setState({
			user: null,
			token: null,
			isAuthenticated: false,
			isLoading: false,
		});
	}, []);

	return (
		<AuthContext.Provider value={{ ...state, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);

	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}

	return context;
}
