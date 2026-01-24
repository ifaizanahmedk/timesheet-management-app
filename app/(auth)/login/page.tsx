"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
	const router = useRouter();
	const { isAuthenticated, isLoading } = useAuth();

	useEffect(() => {
		if (!isLoading && isAuthenticated) {
			router.replace("/dashboard");
		}
	}, [isAuthenticated, isLoading, router]);

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1C64F2] border-t-transparent" />
			</div>
		);
	}

	return (
		<div className="flex min-h-screen">
			<div className="flex flex-1 items-center justify-center px-8 lg:px-18">
				<LoginForm />
			</div>

			<div className="hidden lg:flex lg:flex-1 bg-[#1C64F2] items-center justify-center px-8 lg:px-18 space-y-3">
				<div className="w-full text-white">
					<h2 className="font-inter font-semibold text-[40px] leading-[1.5] tracking-normal align-middle">
						ticktock
					</h2>
					<p className="font-inter font-normal text-base leading-[1.5] tracking-normal">
						Introducing ticktock, our cutting-edge timesheet web
						application designed to revolutionize how you manage
						employee work hours. With ticktock, you can effortlessly
						track and monitor employee attendance and productivity
						from anywhere, anytime, using any internet-connected
						device.
					</p>
				</div>
			</div>
		</div>
	);
}
