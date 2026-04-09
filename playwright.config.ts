import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./tests",
	fullyParallel: true,
	retries: 0,
	reporter: "html",
	use: {
		baseURL: "http://localhost:3000",
		trace: "on-first-retry",
	},
	projects: [
		{
			name: "Mobile Safari (iPhone 14)",
			use: { ...devices["iPhone 14"] },
		},
		{
			name: "Mobile Safari (iPhone SE)",
			use: { ...devices["iPhone SE"] },
		},
	],
	webServer: {
		command: "npm run dev",
		url: "http://localhost:3000",
		reuseExistingServer: !process.env.CI,
	},
});
