import { NextRequest, NextResponse } from "next/server";
import type { User } from "@/types";

const VALID_EMAIL = "john.doe@example.com";
const VALID_PASSWORD = "password123";

const DUMMY_USER: User = {
	id: "1",
	email: VALID_EMAIL,
	name: "John Doe",
};

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { email, password } = body;

		if (!email || !password) {
			return NextResponse.json(
				{ success: false, error: "Email and password are required" },
				{ status: 400 },
			);
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return NextResponse.json(
				{ success: false, error: "Invalid email format" },
				{ status: 400 },
			);
		}

		if (email !== VALID_EMAIL || password !== VALID_PASSWORD) {
			return NextResponse.json(
				{ success: false, error: "Invalid email or password" },
				{ status: 401 },
			);
		}

		const token = `token_${Date.now()}_${Math.random().toString(36).substring(2)}`;

		return NextResponse.json({
			success: true,
			user: DUMMY_USER,
			token,
		});
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: "Internal server error" },
			{ status: 500 },
		);
	}
}
