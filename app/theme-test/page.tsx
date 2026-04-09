"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

/**
 * Platform-aware theme-color defaults
 *
 * iOS Safari  light → #ffffff (Safari chrome is white)
 * iOS Safari  dark  → #000000 (iOS true-black system background)
 *
 * Android Chrome light → #ffffff
 * Android Chrome dark  → #121212 (Material Design dark surface)
 */
const PLATFORM_COLORS = {
	ios: { light: "#ffffff", dark: "#000000" },
	android: { light: "#ffffff", dark: "#121212" },
	web: { light: "#ffffff", dark: "#000000" },
} as const;

type Platform = keyof typeof PLATFORM_COLORS;

function detectPlatform(): Platform {
	if (typeof navigator === "undefined") return "web";
	const ua = navigator.userAgent;
	if (/iPhone|iPad|iPod/.test(ua)) return "ios";
	if (/Android/.test(ua)) return "android";
	return "web";
}

export default function ThemeTestPage() {
	const { resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	const [platform, setPlatform] = useState<Platform>("web");

	useEffect(() => {
		setPlatform(detectPlatform());
		setMounted(true);
	}, []);

	const isDark = resolvedTheme === "dark";
	const scheme = isDark ? "dark" : "light";
	const themeColor = PLATFORM_COLORS[platform][scheme];

	// Sync theme-color meta + body background on every change
	useEffect(() => {
		if (!mounted) return;
		setThemeColor(themeColor);
		document.documentElement.style.setProperty("--page-bg", themeColor);
		return () => {
			document.documentElement.style.removeProperty("--page-bg");
		};
	}, [themeColor, mounted]);

	if (!mounted) return <div className="h-dvh" />;

	const isLight = !isDark;
	const textColor = isLight ? "#000000" : "#ffffff";
	const mutedColor = isLight ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.4)";
	const cardBg = isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.08)";

	return (
		<div
			className="h-dvh flex flex-col justify-center px-6 gap-6"
			style={{ backgroundColor: themeColor, color: textColor }}
		>
			<div>
				<p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: mutedColor, marginBottom: 8 }}>
					Theme Color Test
				</p>
				<h1 style={{ fontSize: 40, fontWeight: 900, margin: 0, lineHeight: 1.1 }}>
					{isDark ? "Dark" : "Light"} Mode
				</h1>
			</div>

			<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
				<Row label="Platform" value={platform} muted={mutedColor} card={cardBg} text={textColor} />
				<Row label="Scheme" value={scheme} muted={mutedColor} card={cardBg} text={textColor} />
				<Row label="theme-color" value={themeColor} muted={mutedColor} card={cardBg} text={textColor} accent={themeColor} />
			</div>

			{/* Colour swatch */}
			<div
				style={{
					width: 64,
					height: 64,
					borderRadius: 16,
					backgroundColor: themeColor,
					border: `2px solid ${mutedColor}`,
				}}
			/>

			<p style={{ fontSize: 12, color: mutedColor }}>
				Top bar follows system chrome · Bottom bar untouched
			</p>
		</div>
	);
}

function Row({ label, value, muted, card, text, accent }: {
	label: string; value: string; muted: string; card: string; text: string; accent?: string;
}) {
	return (
		<div style={{ backgroundColor: card, borderRadius: 12, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
			<span style={{ fontSize: 13, color: muted }}>{label}</span>
			<span style={{ fontSize: 13, fontWeight: 600, color: accent && accent !== "#ffffff" && accent !== "#000000" ? accent : text }}>
				{value}
			</span>
		</div>
	);
}

function setThemeColor(color: string) {
	const old = document.querySelector('meta[name="theme-color"]');
	if (old) old.remove();
	const meta = document.createElement("meta");
	meta.name = "theme-color";
	meta.content = color;
	document.head.appendChild(meta);
}
