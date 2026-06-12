import { expect, test, type Page } from '@playwright/test';

const waitForApp = (page: Page) =>
  page.locator('html[data-openrisk-ready="true"]').waitFor();

test('capture default and evidence workflows', async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  const suffix = testInfo.project.name;

  await page.goto('/');
  await waitForApp(page);
  await expect(page.getByRole('heading', { name: /Compare protocol evidence/i })).toBeVisible();
  await page.screenshot({ path: `/private/tmp/openrisk-home-${suffix}.png`, fullPage: true });

  await page.goto('/matrix');
  await waitForApp(page);
  await expect(page.getByRole('heading', { name: /One evidence surface/i })).toBeVisible();
  await expect(page.locator('.mobile-matrix-card')).toHaveCount(20);
  await page.screenshot({ path: `/private/tmp/openrisk-matrix-default-${suffix}.png`, fullPage: true });

  await page.getByLabel('Focus feed').selectOption('defipunkd');
  await page.getByLabel('Status').selectOption('partial');
  await expect(page.getByText('12 protocols shown')).toBeVisible();
  await page.screenshot({ path: `/private/tmp/openrisk-matrix-filtered-${suffix}.png`, fullPage: true });

  await page.goto('/protocols/aave');
  await waitForApp(page);
  await expect(page.getByRole('heading', { name: 'Aave' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'What each feed publishes' })).toBeVisible();
  await page.screenshot({ path: `/private/tmp/openrisk-aave-${suffix}.png`, fullPage: true });

  await page.goto('/protocols/lido');
  await waitForApp(page);
  await expect(page.getByRole('heading', { name: 'Lido' })).toBeVisible();
  await page.getByRole('tab', { name: /Governance/ }).click();
  await expect(page.getByText('Governance model', { exact: true }).first()).toBeVisible();
  await page.screenshot({ path: `/private/tmp/openrisk-lido-governance-${suffix}.png`, fullPage: true });

  await page.goto('/info');
  await waitForApp(page);
  await expect(page.getByRole('heading', { name: 'How OpenRisk works' })).toBeVisible();
  await page.screenshot({ path: `/private/tmp/openrisk-info-${suffix}.png`, fullPage: true });

});
