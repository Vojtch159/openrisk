import { expect, test, type Page } from '@playwright/test';

const waitForApp = (page: Page) =>
  page.locator('html[data-openrisk-ready="true"]').waitFor();

test('search-first home renders registry and protocol links', async ({ page }, testInfo) => {
  const hydrationMessages: string[] = [];
  page.on('console', (message) => {
    if (/hydration/i.test(message.text())) hydrationMessages.push(message.text());
  });

  await page.goto('/');
  await waitForApp(page);
  await expect(page.getByRole('heading', { name: /Compare protocol evidence/i })).toBeVisible();
  await expect(page.getByText('20 protocols', { exact: true })).toBeVisible();
  await expect(page.getByText('136', { exact: true })).toBeVisible();
  await expect(page.getByText('320', { exact: true })).not.toBeVisible();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await expect(page.locator('.provider-head')).toHaveCount(16);
  await expect(page.locator('header').getByRole('link', { name: 'GitHub' })).toHaveCount(0);
  await expect(page.locator('.protocol-row').first()).toContainText('Lido');
  await expect(page.locator('.protocol-row').filter({ hasText: 'Aave' })).toContainText('1 missing');
  if (testInfo.project.name === 'desktop') {
    const [heroWidth, mainFrame] = await Promise.all([
      page.locator('section').first().locator('> div').evaluate((element) => element.getBoundingClientRect().width),
      page.locator('main main').evaluate((element) => ({
        maxWidth: getComputedStyle(element).maxWidth,
        width: element.getBoundingClientRect().width,
      })),
    ]);
    expect(Math.abs(heroWidth - mainFrame.width)).toBeLessThanOrEqual(1);
    expect(mainFrame.maxWidth).toBe('1280px');

    const tableScroll = page.getByTestId('evidence-table-scroll');
    const tableBox = await tableScroll.boundingBox();
    expect(tableBox).not.toBeNull();
    if (tableBox) {
      await page.mouse.move(tableBox.x + tableBox.width - 80, tableBox.y + 120);
      await page.mouse.down();
      await page.mouse.move(tableBox.x + tableBox.width - 380, tableBox.y + 120, { steps: 6 });
      await page.mouse.up();
      await expect.poll(() => tableScroll.evaluate((element) => element.scrollLeft)).toBeGreaterThan(200);
      await expect(page).toHaveURL('/');
    }
  }
  if (testInfo.project.name === 'mobile') {
    const aaveCard = page.locator('.protocol-card').filter({ has: page.locator('a[href="/protocols/aave"]') });
    await aaveCard.getByRole('button', { name: /2 protocol versions/ }).click();
    await expect(aaveCard.locator('.mobile-versions')).toContainText('v3');
    await expect(aaveCard.locator('.mobile-versions')).toContainText('v4');
  } else {
    const aaveVersions = page.getByRole('button', { name: 'Expand Aave versions' });
    await expect(aaveVersions).toHaveAttribute('aria-expanded', 'false');
    await aaveVersions.click();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('button', { name: 'Collapse Aave versions' })).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('.version-row')).toHaveCount(2);
  }
  await page.getByPlaceholder(/Search protocol/i).fill('Aave');
  if (testInfo.project.name === 'mobile') await expect(page.locator('.protocol-card a.card-heading[href="/protocols/aave"]')).toBeVisible();
  else await expect(page.locator('.protocol-cell a[href="/protocols/aave"]')).toBeVisible();
  const documentOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(documentOverflow).toBeLessThanOrEqual(1);
  expect(hydrationMessages).toEqual([]);
});

test('theme toggle switches between dark and light', async ({ page }) => {
  await page.goto('/');
  await waitForApp(page);
  await page.getByRole('button', { name: 'Use light theme' }).click();
  await expect(page.locator('html')).not.toHaveClass(/dark/);
  await page.getByRole('button', { name: 'Use dark theme' }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);
});

test('matrix is complete, filterable, and opens sourced evidence', async ({ page }, testInfo) => {
  await page.goto('/matrix');
  await waitForApp(page);
  await expect(page.getByRole('heading', { name: /One evidence surface/i })).toBeVisible();
  await expect(page.getByText('136', { exact: true }).first()).toBeVisible();
  await expect(page.locator('.mobile-matrix-card')).toHaveCount(20);
  if (testInfo.project.name === 'desktop') {
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.locator('.mobile-matrix')).toBeHidden();
  } else {
    await expect(page.getByRole('table')).toBeHidden();
    await expect(page.locator('.mobile-matrix')).toBeVisible();
  }

  await page.getByLabel('Focus feed').selectOption('defipunkd');
  await page.getByLabel('Status').selectOption('partial');
  await expect(page.getByText('12 protocols shown')).toBeVisible();
  if (testInfo.project.name === 'mobile') {
    await expect(page.locator('.mobile-matrix a[href="/protocols/cow-swap"]')).toBeVisible();
    await expect(page.locator('.mobile-matrix a[href="/protocols/spark"]')).not.toBeVisible();
  }

  await page.getByRole('button', { name: /Reset/i }).click();
  await expect(page.getByText('20 protocols shown')).toBeVisible();

  if (testInfo.project.name === 'desktop') {
    await page.getByRole('button', { name: /Aave.*Partial/ }).first().click();
    await expect(page.getByRole('heading', { name: 'Aave' })).toBeVisible();
    await expect(page.getByText('Provider methodology', { exact: true })).toBeVisible();
  } else {
    await expect(page.locator('.mobile-matrix-card')).toHaveCount(20);
    await page.getByLabel('Focus feed').selectOption('defiscan');
    await expect(page.getByRole('button', { name: /DeFiScan/i }).first()).toBeVisible();
  }

  const documentOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(documentOverflow).toBeLessThanOrEqual(1);
});

test('protocol page has tabs for feeds, governance, incidents, and audits', async ({ page }) => {
  await page.goto('/protocols/aave');
  await waitForApp(page);
  await expect(page.getByRole('heading', { name: 'Aave' })).toBeVisible();
  await expect(page.getByText('Capital metric', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Evidence at a glance' })).toBeVisible();
  await expect(page.getByText(/Generated only from this static registry snapshot/i)).toBeVisible();

  await expect(page.getByRole('tab', { name: /Feeds/ })).toBeVisible();
  await expect(page.getByRole('tab', { name: /Governance/ })).toBeVisible();
  await expect(page.getByRole('tab', { name: /Incidents/ })).toBeVisible();
  await expect(page.getByRole('tab', { name: /Audits/ })).toBeVisible();
  await expect(page.locator('.coverage-strip')).not.toContainText('Governance');
  await expect(page.locator('.coverage-strip')).not.toContainText('Security events');
  await expect(page.getByText('Capital metric · defillama')).toBeVisible();
  await page.getByRole('button', { name: 'v4' }).click();
  await expect(page.getByText(/Showing only evidence.*v4/i)).toBeVisible();
  await expect(page.locator('.coverage-strip')).toContainText('3');
  await expect(page.locator('.coverage-strip')).toContainText('11');
});

test('source directory supports overview and filtering', async ({ page }, testInfo) => {
  await page.goto('/feeds');
  await waitForApp(page);
  await expect(page.getByRole('heading', { name: 'Meet the risk intelligence sources.' })).toBeVisible();
  await expect(page.getByText('16 sources', { exact: true })).toBeVisible();
  await expect(page.getByText('Reporting cells', { exact: true })).toHaveCount(0);
  if (testInfo.project.name === 'desktop') {
    await expect.poll(() => page.locator('main main').evaluate((element) => getComputedStyle(element).maxWidth)).toBe('1280px');
  }
  const sourceGridColumns = await page.locator('main > .grid').last().evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ').length);
  expect(sourceGridColumns).toBe(testInfo.project.name === 'desktop' ? 4 : 1);
  await page.getByPlaceholder(/Search provider/i).fill('DeFiScan');
  await expect(page.locator('a.group')).toHaveCount(1);
  await expect(page.getByRole('link', { name: /DeFiScan/ })).toBeVisible();
});

test('feed profile shows all assessed protocol states', async ({ page }) => {
  await page.goto('/feeds/defiscan');
  await waitForApp(page);
  await expect(page.getByRole('heading', { name: 'DeFiScan' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Protocol coverage' })).toBeVisible();
  await expect(page.locator('a[href^="/protocols/"]')).toHaveCount(20);
});

test('methodology documents neutrality and registry stats', async ({ page }) => {
  await page.goto('/info');
  await waitForApp(page);
  await expect(page.getByRole('heading', { name: 'How OpenRisk works' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'On this page' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: /Oracle diversity/i })).toBeVisible();
  await expect(page.locator('.methodology-grid article')).toHaveCount(4);
  await expect(page.getByText('Protocol selection', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: /three states/i })).toBeVisible();
  await expect(page.getByText(/Partially covered/).first()).toBeVisible();
});

test('corrections and footer expose GitHub contribution paths', async ({ page }) => {
  await page.goto('/contribute');
  await waitForApp(page);
  await expect(page.getByRole('button', { name: 'Copy issue template' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Open GitHub issue/ })).toHaveAttribute('href', /github\.com\/PWNDAO\/openrisk\/issues\/new/);
  await expect(page.getByRole('link', { name: 'GitHub repository' })).toHaveAttribute('href', /github\.com\/PWNDAO\/openrisk/);
});
