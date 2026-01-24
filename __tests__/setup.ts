"use client";

import "@testing-library/jest-dom";
import { jest } from "@jest/globals";
import { beforeEach } from "@jest/environment";

jest.mock("next/navigation", () => ({
	useRouter() {
		return {
			push: jest.fn(),
			replace: jest.fn(),
			prefetch: jest.fn(),
			back: jest.fn(),
		};
	},
	usePathname() {
		return "";
	},
}));

const sessionStorageMock = {
	getItem: jest.fn(),
	setItem: jest.fn(),
	removeItem: jest.fn(),
	clear: jest.fn(),
};

Object.defineProperty(window, "sessionStorage", {
	value: sessionStorageMock,
});

global.fetch = jest.fn();

beforeEach(() => {
	jest.clearAllMocks();
});
