import { expect, test } from '@playwright/test';

test('login page renders with primary CTA', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Sign in to BarangayOS' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
});

test('residents list renders rows with chevrons', async ({ page }) => {
  await page.goto('/residents');
  await expect(page.getByText('Resident Records')).toBeVisible();
  await expect(page.getByText('Demo Resident')).toBeVisible();
  const chevron = page.locator('svg[data-lucide="chevron-right"]').first();
  await expect(chevron).toBeVisible();
});

test('add resident form fields render with large inputs', async ({ page }) => {
  await page.goto('/residents/new');
  const firstNameInput = page.getByLabel('First Name');
  await expect(firstNameInput).toBeVisible();
  const box = await firstNameInput.boundingBox();
  expect(box?.height).toBeGreaterThanOrEqual(56);
});
