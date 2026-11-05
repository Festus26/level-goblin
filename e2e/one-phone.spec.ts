import { expect, test, type Page } from '@playwright/test';

async function startGame(page: Page, names: string[], winClicksDown = 0) {
  await page.goto('/');
  await page.getByRole('button', { name: 'English' }).click();
  await page.getByRole('button', { name: 'New game on this phone' }).click();
  const input = page.getByLabel('Player name');
  for (const name of names) {
    await input.fill(name);
    await input.press('Enter');
  }
  for (let i = 0; i < winClicksDown; i++) {
    await page.getByRole('button', { name: 'Winning level -1' }).click();
  }
  await page.getByRole('button', { name: 'Start game' }).click();
}

const card = (page: Page, name: string) =>
  page.locator('.player-card').filter({ has: page.getByRole('heading', { name }) });
const levelUp = (page: Page, name: string) =>
  page.getByRole('button', { name: `Increase Level for ${name}` });
const gearUp = (page: Page, name: string) =>
  page.getByRole('button', { name: `Increase Gear for ${name}` });

test('tracks stats and keeps them after a refresh', async ({ page }) => {
  await startGame(page, ['Ada', 'Bo']);
  await levelUp(page, 'Ada').click();
  await gearUp(page, 'Ada').click();
  await gearUp(page, 'Ada').click();
  await expect(card(page, 'Ada').locator('.strength strong')).toHaveText('4');

  await page.reload();
  await page.getByRole('button', { name: 'Continue game' }).click();
  await expect(card(page, 'Ada').locator('.strength strong')).toHaveText('4');
  await expect(card(page, 'Bo').locator('.strength strong')).toHaveText('1');
});

test('moves turns and rolls the die', async ({ page }) => {
  await startGame(page, ['Ada', 'Bo']);
  await expect(page.getByText('Turn: Ada')).toBeVisible();
  await page.getByRole('button', { name: 'Next turn' }).click();
  await expect(page.getByText('Turn: Bo')).toBeVisible();
  await page.getByRole('button', { name: 'Roll' }).click();
  await expect(page.getByRole('button', { name: /^Rolled [1-6]$/ })).toBeVisible();
});

test('runs a fight with a helper and bonuses', async ({ page }) => {
  await startGame(page, ['Ada', 'Bo']);
  await page.getByRole('button', { name: 'Fight' }).click();
  await page.getByRole('button', { name: 'Monster level +1' }).click();
  await page.getByRole('button', { name: 'Monster level +1' }).click();
  await page.getByRole('button', { name: 'Start fight' }).click();
  await expect(page.getByRole('status')).toHaveText('Monster is winning');

  await page.getByLabel('Helper').selectOption({ label: 'Bo (1)' });
  await page.getByRole('button', { name: 'Player bonus +1' }).click();
  await page.getByRole('button', { name: 'Player bonus +1' }).click();
  await expect(page.getByRole('status')).toHaveText('Players are winning');

  await page.getByRole('button', { name: 'End fight' }).click();
  await expect(page.getByRole('button', { name: 'Start fight' })).toBeVisible();
});

test('undoes a change from the log', async ({ page }) => {
  await startGame(page, ['Ada']);
  await levelUp(page, 'Ada').click();
  await page.getByRole('button', { name: 'Log', exact: true }).click();
  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(page.getByText('Undone', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(card(page, 'Ada').locator('.strength strong')).toHaveText('1');
});

test('announces the winner and clears it on level loss', async ({ page }) => {
  await startGame(page, ['Ada'], 8);
  await levelUp(page, 'Ada').click();
  await expect(page.getByText('Ada wins!')).toBeVisible();
  await page.getByRole('button', { name: 'Decrease Level for Ada' }).click();
  await expect(page.getByText('Ada wins!')).toBeHidden();
});

test('manages players and ends the game', async ({ page }) => {
  page.on('dialog', (dialog) => dialog.accept());
  await startGame(page, ['Ada', 'Bo']);
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByLabel('Add a player').fill('Cy');
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await page.getByRole('button', { name: 'Remove Bo' }).click();
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(card(page, 'Cy')).toBeVisible();
  await expect(card(page, 'Bo')).toHaveCount(0);

  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('button', { name: 'End game' }).click();
  await expect(page.getByRole('button', { name: 'Continue game' })).toHaveCount(0);
});

test('switches to Turkish and has no sideways scroll at phone width', async ({ page }) => {
  await startGame(page, ['Çağrı Yıldırımoğlu Uzun İsim', 'Bo']);
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('button', { name: 'Türkçe' }).click();
  await page.getByRole('button', { name: 'Kapat' }).click();
  await expect(page.getByRole('button', { name: 'Zar at' })).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBe(0);
  await page.screenshot({ path: process.env.SHOT_DIR + '/table-tr.png' });
});
