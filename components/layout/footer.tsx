export function Footer() {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="h-[85px] rounded-lg bg-white shadow-[var(--shadow-subtleCombo)] p-4 lg:p-8">
			<div className="text-center text-sm text-gray-500">
				&copy; {currentYear} tentwenty. All rights reserved.
			</div>
		</footer>
	);
}
