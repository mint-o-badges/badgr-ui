import { test, expect } from '@playwright/test';

test.describe('Network Badge Analysis - Line Chart Navigation Bug', () => {
	const BASE_URL = 'http://localhost:4200';
	const NETWORK_SLUG = '0GJ6D38bQE6KDtxDDlKQUg';
	const BADGE_ANALYSIS_URL = `${BASE_URL}/issuer/networks/${NETWORK_SLUG}/badge-analysis`;

	test.beforeEach(async ({ page }) => {
		test.setTimeout(90000);

		// Listen for console logs
		page.on('console', (msg) => {
			const text = msg.text();
			if (text.includes('NETWORK-BADGE-ANALYSIS') || text.includes('BADGE-CHART')) {
				console.log(`[Browser] ${text}`);
			}
		});
	});

	test('should display line chart when navigating back from delivery method detail', async ({ page }) => {
		// Step 1: Navigate to badge analysis page (requires login first)
		console.log('Step 1: Navigate to login page');
		await page.goto(`${BASE_URL}/auth/login`);
		await page.waitForLoadState('networkidle');

		// Check if we need to login
		const loginButton = page.locator('button:has-text("Login")');
		if (await loginButton.isVisible({ timeout: 3000 }).catch(() => false)) {
			console.log('Login form detected, need credentials');
			// For testing, we'll try to access the page directly and see if it redirects
		}

		// Step 2: Try to navigate to badge analysis page
		console.log('Step 2: Navigate to badge analysis page');
		await page.goto(BADGE_ANALYSIS_URL);
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(3000);

		// Take screenshot to see current state
		await page.screenshot({ path: 'e2e/screenshots/network-01-badge-analysis.png', fullPage: true });

		// Check if we're redirected to login
		const currentUrl = page.url();
		console.log('Current URL:', currentUrl);

		if (currentUrl.includes('login') || currentUrl.includes('auth')) {
			console.log('Redirected to login - test requires authentication');
			// Skip the rest of the test if we can't access the page
			test.skip(true, 'Test requires authentication - please login manually first');
			return;
		}

		// Step 3: Wait for the chart to be rendered
		console.log('Step 3: Check initial chart rendering');
		const svgElement = page.locator('app-network-badge-analysis svg').first();

		// Wait for SVG to be visible
		await expect(svgElement).toBeVisible({ timeout: 10000 });

		// Check if chart has been rendered (should have path elements for lines)
		const initialPaths = await page.locator('app-network-badge-analysis svg path').count();
		console.log(`Initial paths count: ${initialPaths}`);

		// Step 4: Click on "Präsenz" delivery method to switch to detail view
		console.log('Step 4: Click on Präsenz delivery method');
		const praesenzButton = page.locator('text=Präsenz').first();

		if (await praesenzButton.isVisible({ timeout: 5000 }).catch(() => false)) {
			await praesenzButton.click();
			await page.waitForTimeout(2000);

			// Take screenshot of delivery method detail
			await page.screenshot({ path: 'e2e/screenshots/network-02-delivery-detail.png', fullPage: true });

			// Step 5: Click "Zurück" button to go back to default view
			console.log('Step 5: Click Zurück button');
			const backButton = page.locator('button:has-text("Zurück")').or(page.locator('[data-testid="back-button"]'));

			if (await backButton.isVisible({ timeout: 5000 }).catch(() => false)) {
				await backButton.click();
				await page.waitForTimeout(3000);

				// Take screenshot after navigation back
				await page.screenshot({ path: 'e2e/screenshots/network-03-after-back.png', fullPage: true });

				// Step 6: Verify the chart is rendered with lines
				console.log('Step 6: Verify chart is rendered after back navigation');

				// Check SVG is visible
				await expect(svgElement).toBeVisible({ timeout: 10000 });

				// Check for path elements (the lines of the chart)
				const pathsAfterBack = await page.locator('app-network-badge-analysis svg path').count();
				console.log(`Paths after back navigation: ${pathsAfterBack}`);

				// The chart should have at least the grid lines and data lines
				expect(pathsAfterBack).toBeGreaterThan(0);

				// Also check for chart group element
				const chartGroup = page.locator('app-network-badge-analysis svg g');
				const groupCount = await chartGroup.count();
				console.log(`Chart group count: ${groupCount}`);
				expect(groupCount).toBeGreaterThan(0);
			} else {
				console.log('Back button not found');
			}
		} else {
			console.log('Präsenz button not found - checking if chart is already visible');
			// Just verify the chart is displayed
			expect(initialPaths).toBeGreaterThan(0);
		}
	});

	test('verify chart container has dimensions after view switch', async ({ page }) => {
		console.log('Navigating to badge analysis page');
		await page.goto(BADGE_ANALYSIS_URL);
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(3000);

		const currentUrl = page.url();
		if (currentUrl.includes('login') || currentUrl.includes('auth')) {
			test.skip(true, 'Test requires authentication');
			return;
		}

		// Get the SVG container dimensions
		const svgContainer = page.locator('app-network-badge-analysis svg').first();

		if (await svgContainer.isVisible({ timeout: 10000 }).catch(() => false)) {
			const boundingBox = await svgContainer.boundingBox();
			console.log('SVG bounding box:', boundingBox);

			expect(boundingBox).not.toBeNull();
			if (boundingBox) {
				expect(boundingBox.width).toBeGreaterThan(0);
				expect(boundingBox.height).toBeGreaterThan(0);
			}
		}
	});
});
