import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { DevNav } from "@/components/dev-nav";
import { Eruda } from "./eruda";
import { ThemeColorSync } from "./theme-color-sync";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Snap Scroll",
	appleWebApp: {
		capable: true,
		title: "Snap Scroll",
		// black-translucent: status bar overlays the page content,
		// so theme-color shows through the full top area with no white bar
		statusBarStyle: "black-translucent",
	},
	formatDetection: { telephone: false },
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
	viewportFit: "cover", // content extends under notch + home indicator
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
			suppressHydrationWarning
		>
			<body className="min-h-full flex flex-col">
				<ThemeProvider
					attribute="class"
					storageKey="color-scheme"
					enableSystem
					disableTransitionOnChange
				>
					<ThemeColorSync />
					{process.env.NODE_ENV === "development" && <Eruda />}
					{process.env.NODE_ENV === "development" && <DevNav />}
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}
