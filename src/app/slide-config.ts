export const SLIDE_COLORS = {
	"slide-1": { light: "#7c3aed", dark: "#4c1d95" }, // violet
	"slide-2": { light: "#09090b", dark: "#09090b" }, // zinc — always dark
	"slide-3": { light: "#fbbf24", dark: "#92400e" }, // amber
	"slide-4": { light: "#f1f5f9", dark: "#0f172a" }, // slate
	"slide-5": { light: "#f43f5e", dark: "#9f1239" }, // rose
} as const;

export type SlideId = keyof typeof SLIDE_COLORS;
