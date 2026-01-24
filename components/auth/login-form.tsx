"use client";

import React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

interface FormErrors {
	email?: string;
	password?: string;
	general?: string;
}

export function LoginForm() {
	const router = useRouter();
	const { login, isLoading } = useAuth();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [rememberMe, setRememberMe] = useState(false);
	const [errors, setErrors] = useState<FormErrors>({});

	const validateForm = (): boolean => {
		const newErrors: FormErrors = {};

		if (!email.trim()) {
			newErrors.email = "Email is required";
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			newErrors.email = "Please enter a valid email address";
		}

		if (!password) {
			newErrors.password = "Password is required";
		} else if (password.length < 6) {
			newErrors.password = "Password must be at least 6 characters";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});

		if (!validateForm()) {
			return;
		}

		const result = await login({ email, password, rememberMe });

		if (result.success) {
			router.push("/dashboard");
		} else {
			setErrors({ general: result.error });
		}
	};

	return (
		<form onSubmit={handleSubmit} className="w-full space-y-5">
			<div className="mb-5">
				<h1 className="text-xl font-bold text-gray-900">
					Welcome back
				</h1>
			</div>

			{errors.general && (
				<div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
					{errors.general}
				</div>
			)}

			<div className="space-y-5">
				<div className="space-y-2">
					<label
						htmlFor="email"
						className="block text-sm font-medium text-gray-900">
						Email
					</label>
					<input
						id="email"
						type="email"
						placeholder="name@example.com"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						aria-invalid={!!errors.email}
						disabled={isLoading}
						className={`w-full rounded-md border px-4 py-3 text-sm outline-none transition-colors
              placeholder:text-gray-500 
              focus:border-[#1C64F2] focus:ring-1 focus:ring-[#1C64F2]
              disabled:cursor-not-allowed disabled:bg-gray-50
              ${errors.email ? "border-red-500" : "border-gray-300"}`}
					/>
					{errors.email && (
						<p className="text-sm text-red-600">{errors.email}</p>
					)}
				</div>

				<div className="space-y-2">
					<label
						htmlFor="password"
						className="block text-sm font-medium text-gray-900">
						Password
					</label>
					<input
						id="password"
						type="password"
						placeholder="••••••••••••"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						aria-invalid={!!errors.password}
						autoComplete="off"
						disabled={isLoading}
						className={`w-full rounded-md border px-4 py-3 text-sm outline-none transition-colors
              placeholder:text-gray-500
              focus:border-[#1C64F2] focus:ring-1 focus:ring-[#1C64F2]
              disabled:cursor-not-allowed disabled:bg-gray-50
              ${errors.password ? "border-red-500" : "border-gray-300"}`}
					/>
					{errors.password && (
						<p className="text-sm text-red-600">
							{errors.password}
						</p>
					)}
				</div>

				<div className="flex items-center gap-2">
					<input
						id="remember"
						type="checkbox"
						checked={rememberMe}
						onChange={(e) => setRememberMe(e.target.checked)}
						disabled={isLoading}
						className="h-4 w-4 rounded border-gray-300 text-[#1C64F2] focus:ring-[#1C64F2]"
					/>
					<label
						htmlFor="remember"
						className="text-sm text-gray-500 cursor-pointer">
						Remember me
					</label>
				</div>
			</div>

			<button
				type="submit"
				className="w-full rounded-md bg-[#1C64F2] px-4 py-2.5 text-sm font-medium text-white 
          transition-colors hover:bg-[#364fc7] focus:outline-none focus:ring-2 
          focus:ring-[#1C64F2] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
				disabled={isLoading}>
				{isLoading ? "Signing in..." : "Sign in"}
			</button>

			<p className="text-center text-sm text-gray-500">
				Demo credentials: john.doe@example.com / password123
			</p>
		</form>
	);
}
