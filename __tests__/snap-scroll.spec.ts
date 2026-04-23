import { expect, test } from "@playwright/test";

test.describe("Snap scroll", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
	});

	test("renders all 5 slides", async ({ page }) => {
		for (let i = 1; i <= 5; i++) {
			await expect(page.getByTestId(`slide-${i}`)).toBeAttached();
		}
	});

	test("slide 1 is visible on load", async ({ page }) => {
		await expect(page.getByTestId("slide-1")).toBeInViewport();
	});

	test("each slide has a distinct height", async ({ page }) => {
		const heights = await Promise.all(
			[1, 2, 3, 4, 5].map((i) =>
				page
					.getByTestId(`slide-${i}`)
					.evaluate((el) => el.getBoundingClientRect().height),
			),
		);
		// No two adjacent slides should have identical height
		for (let i = 0; i < heights.length - 1; i++) {
			expect(heights[i]).not.toBe(heights[i + 1]);
		}
	});

	test("programmatic scroll snaps to each slide", async ({ page }) => {
		const container = page.getByTestId("scroll-container");

		for (let i = 1; i <= 5; i++) {
			const offsetTop = await container.evaluate((el, idx) => {
				const slide = el.querySelector(
					`[data-testid="slide-${idx}"]`,
				) as HTMLElement;
				return slide.offsetTop;
			}, i);

			await container.evaluate((el, top) => {
				el.scrollTop = top;
			}, offsetTop);

			await page.waitForTimeout(300);
			await expect(page.getByTestId(`slide-${i}`)).toBeInViewport();
		}
	});

	test("scroll container has correct snap CSS", async ({ page }) => {
		const snapType = await page
			.getByTestId("scroll-container")
			.evaluate((el) => getComputedStyle(el).scrollSnapType);

		expect(snapType).toMatch(/mandatory/);
	});

	test("each slide has snap-start align", async ({ page }) => {
		for (let i = 1; i <= 5; i++) {
			const snapAlign = await page
				.getByTestId(`slide-${i}`)
				.evaluate((el) => getComputedStyle(el).scrollSnapAlign);

			expect(snapAlign).toMatch(/start/);
		}
	});
});
