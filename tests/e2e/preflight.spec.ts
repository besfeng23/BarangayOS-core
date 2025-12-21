import { test, expect, Page } from '@playwright/test';

const demoLogin = async (page: Page) => {
  await page.goto('/login');
  await page.getByRole('button', { name: /Continue as Demo/ }).click();
};

test('Resident form loads without crashing', async ({ page }) => {
  await demoLogin(page);
  await page.goto('/residents/new');
  await expect(page.getByText(/New Resident Record/i)).toBeVisible();
  await expect(page.getByLabel('Last Name *')).toBeVisible();
});

test('Digital Payments opens without white screen', async ({ page }) => {
  await demoLogin(page);
  await page.goto('/emango');
  await expect(page.getByText(/eMango Wallet/i)).toBeVisible();
  await expect(page.getByText(/Digital Payments is in demo mode/i)).toBeVisible();
});

test('City Health queue to consultation flow works', async ({ page }) => {
  await demoLogin(page);
  await page.goto('/city-health/queue');
  await page.getByPlaceholder('Search resident or enter manually').fill('Juan');
  await page.getByText('Or, enter name manually').click();
  await page.getByPlaceholder('Enter full name for non-resident').fill('Juan Demo');
  await page.getByPlaceholder('Hal: Lagnat at ubo for 3 days...').fill('Fever and cough for testing');
  await page.getByRole('button', { name: /Add to Queue/ }).click();
  await expect(page.getByText('Juan Demo')).toBeVisible();
  await page.getByRole('button', { name: 'Start Consult' }).click();
  await expect(page.getByText('Consultation Room')).toBeVisible();
});

test('Print Center disables Print Next when empty', async ({ page }) => {
  await demoLogin(page);
  await page.goto('/print');
  const printNext = page.getByRole('button', { name: /Print Next in Queue/ });
  await expect(printNext).toBeDisabled();
  await expect(page.getByText(/No jobs in queue/)).toBeVisible();
});
