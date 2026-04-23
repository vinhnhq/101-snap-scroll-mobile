"use client";

import { useEffect } from "react";

export function ThemeColorSync() {
	useEffect(() => {
		const isDark = () => document.documentElement.classList.contains("dark");

		const apply = () => {
			const color = isDark() ? "#000000" : "#ffffff";
			const meta =
				document.querySelector<HTMLMetaElement>('meta[name="theme-color"]') ??
				Object.assign(document.createElement("meta"), { name: "theme-color" });
			if (!meta.parentNode) document.head.appendChild(meta);
			if (meta.content !== color) meta.content = color;
		};

		// Watch for next-themes toggling class="dark" on <html>
		const observer = new MutationObserver(apply);
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class"],
		});

		apply();
		return () => observer.disconnect();
	}, []);

	return null;
}
