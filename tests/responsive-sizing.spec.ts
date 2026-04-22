import { expect, test } from "@playwright/test";

test.describe("Fluid responsive sizing", () => {
	test("html font-size scales with viewport via clamp()", async ({ page }) => {
		await page.goto("/");

		// iPhone SE (375×667) — clamp should resolve near minimum (14px)
		await page.setViewportSize({ width: 375, height: 667 });
		const seFontSize = await page.evaluate(() =>
			parseFloat(getComputedStyle(document.documentElement).fontSize),
		);

		// iPhone 15 Pro Max (430×932) — clamp should resolve near maximum (~18px)
		await page.setViewportSize({ width: 430, height: 932 });
		const proFontSize = await page.evaluate(() =>
			parseFloat(getComputedStyle(document.documentElement).fontSize),
		);

		// Font-size should scale upward on larger viewport
		expect(proFontSize).toBeGreaterThan(seFontSize);

		// SE: clamp(14px, 2*3.75 + 6.67, 18px) ≈ 14.17px
		expect(seFontSize).toBeGreaterThanOrEqual(14);
		expect(seFontSize).toBeLessThan(15.5);

		// Pro Max: clamp(14px, 2*4.3 + 9.32, 18px) ≈ 17.9px
		expect(proFontSize).toBeGreaterThan(16);
		expect(proFontSize).toBeLessThanOrEqual(18);
	});

	test("slide snap still engages after font-size change", async ({ page }) => {
		await page.goto("/");
		const snapType = await page
			.getByTestId("scroll-container")
			.evaluate((el) => getComputedStyle(el).scrollSnapType);
		expect(snapType).toMatch(/mandatory/);
	});
});
