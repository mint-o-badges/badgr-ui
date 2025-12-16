import { test, expect } from '@playwright/test';

test.describe('Line Chart Year Filter Bug', () => {
	const BASE_URL = 'http://localhost:4200';
	const NETWORK_SLUG = '0GJ6D38bQE6KDtxDDlKQUg';
	const BADGE_ANALYSIS_URL = `${BASE_URL}/issuer/networks/${NETWORK_SLUG}/badge-analysis`;

	test.beforeEach(async ({ page }) => {
		test.setTimeout(120000);

		// Listen for console logs to debug
		page.on('console', (msg) => {
			const text = msg.text();
			if (text.includes('NETWORK-BADGE-ANALYSIS') ||
				text.includes('BADGES-YEARLY-LINE-CHART') ||
				text.includes('badge awards timeline') ||
				text.includes('renderLineChart') ||
				text.includes('ngOnChanges')) {
				console.log(`[Browser] ${text}`);
			}
		});
	});

	test('should display data when switching from year with no data back to year with data', async ({ page }) => {
		console.log('=== Starting Year Filter Bug Test ===');

		// Step 1: Navigate to badge analysis page
		console.log('Step 1: Navigate to badge analysis page');
		await page.goto(BADGE_ANALYSIS_URL);
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(3000);

		// Check if redirected to login
		const currentUrl = page.url();
		console.log('Current URL:', currentUrl);

		if (currentUrl.includes('login') || currentUrl.includes('auth')) {
			console.log('Redirected to login - test requires authentication');
			test.skip(true, 'Test requires authentication');
			return;
		}

		// Take initial screenshot
		await page.screenshot({ path: 'e2e/screenshots/year-filter-01-initial.png', fullPage: true });

		// Step 2: Find the year dropdown in the line chart component
		console.log('Step 2: Find year dropdown');

		// Look for the year select dropdown within the line chart
		const yearDropdown = page.locator('app-badges-yearly-line-chart select').first();

		if (!await yearDropdown.isVisible({ timeout: 10000 }).catch(() => false)) {
			console.log('Year dropdown not found in line chart component');
			// Try alternative selector
			const altDropdown = page.locator('select').filter({ hasText: /202[0-9]/ }).first();
			if (await altDropdown.isVisible({ timeout: 5000 }).catch(() => false)) {
				console.log('Found alternative dropdown');
			} else {
				await page.screenshot({ path: 'e2e/screenshots/year-filter-error-no-dropdown.png', fullPage: true });
				test.fail(true, 'Year dropdown not found');
				return;
			}
		}

		// Get current year value
		const currentYear = await yearDropdown.inputValue();
		console.log(`Current selected year: ${currentYear}`);

		// Step 3: Verify chart has data initially (2025 should have data)
		console.log('Step 3: Verify initial chart has data');
		await page.waitForTimeout(2000);

		// Check for the line path (data line) or "no data" message
		const chartSvg = page.locator('app-badges-yearly-line-chart svg').first();
		await expect(chartSvg).toBeVisible({ timeout: 10000 });

		// Check initial state - should have data path
		const initialDataPath = page.locator('app-badges-yearly-line-chart svg path[stroke="#492E98"]');
		const initialNoDataText = page.locator('app-badges-yearly-line-chart svg text').filter({ hasText: /keine.*daten|no.*data/i });

		const hasInitialData = await initialDataPath.count() > 0;
		const hasInitialNoDataMsg = await initialNoDataText.count() > 0;

		console.log(`Initial state - Has data path: ${hasInitialData}, Has "no data" message: ${hasInitialNoDataMsg}`);
		await page.screenshot({ path: 'e2e/screenshots/year-filter-02-initial-chart.png', fullPage: true });

		// We expect 2025 to have data
		if (!hasInitialData && hasInitialNoDataMsg) {
			console.log('WARNING: Initial year (2025) shows no data - test may not be valid');
		}

		// Step 4: Switch to 2024 (year with no data)
		console.log('Step 4: Switch to 2024 (no data year)');
		await yearDropdown.selectOption('2024');
		await page.waitForTimeout(3000); // Wait for API call and re-render

		await page.screenshot({ path: 'e2e/screenshots/year-filter-03-after-2024.png', fullPage: true });

		// Verify 2024 shows "no data" message
		const noDataAfter2024 = page.locator('app-badges-yearly-line-chart svg text').filter({ hasText: /keine.*daten|no.*data/i });
		const dataPathAfter2024 = page.locator('app-badges-yearly-line-chart svg path[stroke="#492E98"]');

		const has2024NoData = await noDataAfter2024.count() > 0;
		const has2024DataPath = await dataPathAfter2024.count() > 0;

		console.log(`After 2024 - Has "no data" message: ${has2024NoData}, Has data path: ${has2024DataPath}`);

		// Step 5: Switch back to 2025 (year with data) - THIS IS THE BUG SCENARIO
		console.log('Step 5: Switch back to 2025 (data year) - BUG SCENARIO');
		await yearDropdown.selectOption('2025');
		await page.waitForTimeout(5000); // Give extra time for API and render

		await page.screenshot({ path: 'e2e/screenshots/year-filter-04-after-back-to-2025.png', fullPage: true });

		// Step 6: Verify 2025 shows data again (THIS IS WHERE THE BUG MANIFESTS)
		console.log('Step 6: Verify 2025 shows data after switching back');

		const dataPathAfterBack = page.locator('app-badges-yearly-line-chart svg path[stroke="#492E98"]');
		const noDataAfterBack = page.locator('app-badges-yearly-line-chart svg text').filter({ hasText: /keine.*daten|no.*data/i });

		const hasDataAfterBack = await dataPathAfterBack.count() > 0;
		const hasNoDataMsgAfterBack = await noDataAfterBack.count() > 0;

		console.log(`After back to 2025 - Has data path: ${hasDataAfterBack}, Has "no data" message: ${hasNoDataMsgAfterBack}`);

		// Check SVG content
		const svgContent = await chartSvg.innerHTML();
		console.log(`SVG content length: ${svgContent.length}`);
		console.log(`SVG contains path: ${svgContent.includes('<path')}`);
		console.log(`SVG contains text "keine": ${svgContent.toLowerCase().includes('keine')}`);

		// THE CRITICAL ASSERTION - 2025 should have data, not "no data" message
		if (hasInitialData) {
			// Only check this if initial state had data
			expect(hasDataAfterBack, 'Chart should show data line after switching back to 2025').toBe(true);
			expect(hasNoDataMsgAfterBack, 'Chart should NOT show "no data" message after switching back to 2025').toBe(false);
		}

		console.log('=== Year Filter Bug Test Complete ===');
	});

	test('debug: log all ngOnChanges and render calls', async ({ page }) => {
		console.log('=== Debug Test: Tracing ngOnChanges ===');

		// Inject debug logging into the page
		await page.addInitScript(() => {
			// @ts-ignore
			window.__debugLogs = [];
			const originalConsoleLog = console.log;
			console.log = (...args) => {
				const msg = args.join(' ');
				if (msg.includes('ngOnChanges') || msg.includes('render') || msg.includes('timeline')) {
					// @ts-ignore
					window.__debugLogs.push({ time: Date.now(), msg });
				}
				originalConsoleLog.apply(console, args);
			};
		});

		await page.goto(BADGE_ANALYSIS_URL);
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(3000);

		const currentUrl = page.url();
		if (currentUrl.includes('login')) {
			test.skip(true, 'Test requires authentication');
			return;
		}

		const yearDropdown = page.locator('app-badges-yearly-line-chart select').first();
		if (!await yearDropdown.isVisible({ timeout: 10000 }).catch(() => false)) {
			test.skip(true, 'Year dropdown not visible');
			return;
		}

		console.log('Switching to 2024...');
		await yearDropdown.selectOption('2024');
		await page.waitForTimeout(3000);

		console.log('Switching back to 2025...');
		await yearDropdown.selectOption('2025');
		await page.waitForTimeout(3000);

		// Get debug logs from page
		const debugLogs = await page.evaluate(() => {
			// @ts-ignore
			return window.__debugLogs || [];
		});

		console.log('Debug logs from page:', JSON.stringify(debugLogs, null, 2));
	});
});
