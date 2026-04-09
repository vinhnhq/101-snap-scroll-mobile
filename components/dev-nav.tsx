"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
	{ href: "/", label: "Scroll" },
	{ href: "/theme-test", label: "Theme" },
];

export function DevNav() {
	const pathname = usePathname();
	return (
		<div
			style={{
				position: "fixed",
				bottom: 24,
				right: 16,
				zIndex: 9999,
				display: "flex",
				flexDirection: "column",
				gap: 8,
			}}
		>
			{LINKS.filter((l) => l.href !== pathname).map((l) => (
				<Link
					key={l.href}
					href={l.href}
					style={{
						background: "rgba(0,0,0,0.6)",
						color: "#fff",
						fontSize: 12,
						fontWeight: 600,
						padding: "8px 14px",
						borderRadius: 20,
						textDecoration: "none",
						backdropFilter: "blur(8px)",
						WebkitBackdropFilter: "blur(8px)",
					}}
				>
					→ {l.label}
				</Link>
			))}
		</div>
	);
}
