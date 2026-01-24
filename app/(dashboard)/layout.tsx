"use client";

import React from "react";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const { isAuthenticated, isLoading } = useAuth();

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			router.replace("/login");
		}
	}, [isAuthenticated, isLoading, router]);

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gray-50">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1C64F2] border-t-transparent" />
			</div>
		);
	}

	if (!isAuthenticated) {
		return null;
	}

	return (
		<div className="flex min-h-screen flex-col bg-gray-50">
			<Header />
			<main className="flex-1 px-4 py-6 md:px-6 lg:px-8">
				<div className="mx-auto max-w-6xl space-y-4">
					<div className="rounded-lg rounded-lg bg-white shadow-[var(--shadow-subtleCombo)] p-6">
						{children}
					</div>
					<Footer />
				</div>
			</main>
		</div>
	);
}

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<AuthProvider>
			<DashboardLayoutContent>{children}</DashboardLayoutContent>
		</AuthProvider>
	);
}
