import {
  expect,
  test,
  type Browser,
  type BrowserContext,
  type Page,
  type WebSocketRoute,
} from '@playwright/test';

const API = 'http://localhost:8787';

/** Each player gets a separate browser context, the same as a separate phone. */
async function phone(browser: Browser) {
  const context = await browser.newContext({ locale: 'en-US' });
  return { context, page: await context.newPage() };
}

async function createSession(page: Page, name: string, rights?: string) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Create a session' }).click();
  await page.getByLabel('Your name').fill(name);
  if (rights) await page.getByLabel(rights).check();
  await page.getByRole('button', { name: 'Create session' }).click();
  const code = (await page.locator('.session-code').textContent())!;
  await page.getByRole('button', { name: 'Close' }).click();
  return code;
}

async function joinByLink(page: Page, code: string, name: string) {
  await page.goto(`/?join=${code}`);
  await page.getByLabel('Your name').fill(name);
  await page.getByRole('button', { name: 'Join the table' }).click();
  await expect(page.getByRole('heading', { name })).toBeVisible();
}

const card = (page: Page, name: string) =>
  page.locator('.player-card').filter({ has: page.getByRole('heading', { name }) });
const strengthOf = (page: Page, name: string) => card(page, name).locator('.strength strong');
const levelUp = (page: Page, name: string) =>
  page.getByRole('button', { name: `Increase Level for ${name}` });

async function openSettings(page: Page) {
  await page.getByRole('button', { name: 'Settings' }).click();
}

test('three phones stay in sync', async ({ browser }) => {
  const [ada, bo, cy] = [await phone(browser), await phone(browser), await phone(browser)];
  const code = await createSession(ada.page, 'Ada');
  await joinByLink(bo.page, code, 'Bo');
  await joinByLink(cy.page, code, 'Cy');

  await levelUp(bo.page, 'Bo').click();
  for (const { page } of [ada, bo, cy]) await expect(strengthOf(page, 'Bo')).toHaveText('2');

  await cy.page.getByRole('button', { name: 'Roll' }).click();
  for (const { page } of [ada, bo, cy]) {
    await expect(page.getByRole('button', { name: /^Rolled [1-6]$/ })).toBeVisible();
  }
});

test('join by typing a code on the home screen', async ({ browser }) => {
  const [ada, bo] = [await phone(browser), await phone(browser)];
  const code = await createSession(ada.page, 'Ada');
  await bo.page.goto('/');
  await bo.page.getByLabel('Session code').fill(code.toLowerCase());
  await bo.page.getByRole('button', { name: 'Join', exact: true }).click();
  await bo.page.getByLabel('Your name').fill('Bo');
  await bo.page.getByRole('button', { name: 'Join the table' }).click();
  await expect(card(ada.page, 'Bo')).toBeVisible();
});

test('the invite sheet shows a working QR code and link', async ({ browser }) => {
  const { page } = await phone(browser);
  await page.goto('/');
  await page.getByRole('button', { name: 'Create a session' }).click();
  await page.getByLabel('Your name').fill('Ada');
  await page.getByRole('button', { name: 'Create session' }).click();
  await expect(page.getByRole('img', { name: 'QR code for the invite link' })).toBeVisible();
  await expect(page.locator('.session-code')).toHaveText(/^[A-HJKMNP-Z2-9]{5}$/);
});

test('edit rights lock the right buttons', async ({ browser }) => {
  const [ada, bo] = [await phone(browser), await phone(browser)];
  const code = await createSession(ada.page, 'Ada', 'Players edit only themselves');
  await joinByLink(bo.page, code, 'Bo');

  await expect(levelUp(ada.page, 'Bo')).toBeDisabled();
  await expect(levelUp(bo.page, 'Ada')).toBeDisabled();
  await expect(levelUp(bo.page, 'Bo')).toBeEnabled();

  await openSettings(ada.page);
  // The selection only changes once the server has confirmed it.
  await ada.page.getByLabel('Everyone edits everyone').click();
  await expect(ada.page.getByLabel('Everyone edits everyone')).toBeChecked();
  await ada.page.getByRole('button', { name: 'Close' }).click();
  await expect(levelUp(bo.page, 'Ada')).toBeEnabled();
  await levelUp(bo.page, 'Ada').click();
  await expect(strengthOf(ada.page, 'Ada')).toHaveText('2');
});

test('a non-host sees host controls locked', async ({ browser }) => {
  const [ada, bo] = [await phone(browser), await phone(browser)];
  const code = await createSession(ada.page, 'Ada');
  await joinByLink(bo.page, code, 'Bo');
  await openSettings(bo.page);
  await expect(bo.page.getByRole('button', { name: 'Winning level +1' })).toBeDisabled();
  await expect(bo.page.getByRole('button', { name: 'End game' })).toHaveCount(0);
});

test('a refresh keeps your seat and your stats', async ({ browser }) => {
  const [ada, bo] = [await phone(browser), await phone(browser)];
  const code = await createSession(ada.page, 'Ada');
  await joinByLink(bo.page, code, 'Bo');
  await levelUp(bo.page, 'Bo').click();
  await expect(strengthOf(bo.page, 'Bo')).toHaveText('2');

  await bo.page.reload();
  await expect(strengthOf(bo.page, 'Bo')).toHaveText('2');
  await expect(levelUp(bo.page, 'Bo')).toBeEnabled();
  await expect(card(ada.page, 'Bo').locator('.tag.away')).toHaveCount(0);
});

/**
 * Sits between a phone and the server. Browser offline mode leaves open WebSockets
 * alone, so this is how a test can really cut a connection or silence it.
 */
async function controlNetwork(context: BrowserContext) {
  const net = { blocked: false, silent: false };
  const sockets: WebSocketRoute[] = [];
  await context.routeWebSocket(/\/ws\?/, (socket) => {
    if (net.blocked) {
      void socket.close();
      return;
    }
    const server = socket.connectToServer();
    socket.onMessage((message) => {
      if (!net.silent) server.send(message);
    });
    server.onMessage((message) => {
      if (!net.silent) socket.send(message);
    });
    sockets.push(socket);
  });
  return {
    net,
    cut: async () => {
      net.blocked = true;
      for (const socket of sockets.splice(0)) await socket.close();
    },
  };
}

test('a lost connection warns, reconnects, and catches up', async ({ browser }) => {
  const [ada, bo] = [await phone(browser), await phone(browser)];
  const { net, cut } = await controlNetwork(bo.context);
  const code = await createSession(ada.page, 'Ada');
  await joinByLink(bo.page, code, 'Bo');

  await cut();
  await expect(bo.page.locator('.connection')).toBeVisible();
  await expect(card(ada.page, 'Bo').locator('.tag.away')).toBeVisible();
  await levelUp(ada.page, 'Ada').click();
  await expect(strengthOf(bo.page, 'Ada')).toHaveText('1');

  net.blocked = false;
  await expect(strengthOf(bo.page, 'Ada')).toHaveText('2', { timeout: 15_000 });
  await expect(bo.page.locator('.connection')).toHaveCount(0);
  await expect(card(ada.page, 'Bo').locator('.tag.away')).toHaveCount(0);
});

test('a silent connection is noticed and replaced', async ({ browser }) => {
  test.setTimeout(60_000);
  const [ada, bo] = [await phone(browser), await phone(browser)];
  const { net } = await controlNetwork(bo.context);
  const code = await createSession(ada.page, 'Ada');
  await joinByLink(bo.page, code, 'Bo');

  // The socket stays open but nothing gets through, like a phone waking from sleep.
  net.silent = true;
  await levelUp(ada.page, 'Ada').click();
  await expect(bo.page.locator('.connection')).toBeVisible({ timeout: 35_000 });

  net.silent = false;
  await expect(strengthOf(bo.page, 'Ada')).toHaveText('2', { timeout: 15_000 });
  await expect(bo.page.locator('.connection')).toHaveCount(0);
});

test('the host frees a seat and a new phone takes it back', async ({ browser }) => {
  const [ada, bo, spare] = [await phone(browser), await phone(browser), await phone(browser)];
  const code = await createSession(ada.page, 'Ada');
  await joinByLink(bo.page, code, 'Bo');
  await levelUp(bo.page, 'Bo').click();
  await bo.context.close();

  await expect(card(ada.page, 'Bo').locator('.tag.away')).toBeVisible();
  await openSettings(ada.page);
  await ada.page.getByRole('button', { name: 'Free the seat of Bo' }).click();
  await ada.page.getByRole('button', { name: 'Close' }).click();

  await spare.page.goto(`/?join=${code}`);
  await spare.page.getByRole('button', { name: 'Bo', exact: true }).click();
  await expect(strengthOf(spare.page, 'Bo')).toHaveText('2');
  await expect(levelUp(spare.page, 'Bo')).toBeEnabled();
});

test('a player can take over when the host disappears', async ({ browser }) => {
  const [ada, bo] = [await phone(browser), await phone(browser)];
  const code = await createSession(ada.page, 'Ada');
  await joinByLink(bo.page, code, 'Bo');
  await ada.context.close();

  await expect(card(bo.page, 'Ada').locator('.tag.away')).toBeVisible();
  await openSettings(bo.page);
  await bo.page.getByRole('button', { name: 'Take over as host' }).click();
  await expect(bo.page.getByRole('button', { name: 'End game' })).toBeVisible();
});

test('removing a player sends them home with a reason', async ({ browser }) => {
  const [ada, bo] = [await phone(browser), await phone(browser)];
  ada.page.on('dialog', (dialog) => dialog.accept());
  const code = await createSession(ada.page, 'Ada');
  await joinByLink(bo.page, code, 'Bo');

  await openSettings(ada.page);
  await ada.page.getByRole('button', { name: 'Remove Bo' }).click();
  await expect(bo.page.getByRole('alert')).toHaveText('You no longer have a seat in that session.');
});

test('ending the session sends everyone home', async ({ browser }) => {
  const [ada, bo] = [await phone(browser), await phone(browser)];
  ada.page.on('dialog', (dialog) => dialog.accept());
  const code = await createSession(ada.page, 'Ada');
  await joinByLink(bo.page, code, 'Bo');

  await openSettings(ada.page);
  await ada.page.getByRole('button', { name: 'End game' }).click();
  await expect(bo.page.getByRole('alert')).toHaveText('That session has ended.');
  await expect(ada.page.getByRole('alert')).toHaveText('That session has ended.');

  await bo.page.goto(`/?join=${code}`);
  await expect(bo.page.getByRole('alert')).toHaveText('No session with that code.');
});

test('a wrong code explains itself', async ({ browser }) => {
  const { page } = await phone(browser);
  await page.goto('/?join=ZZZZZ');
  await expect(page.getByRole('alert')).toHaveText('No session with that code.');
});

test('one-phone mode works with the server down', async ({ browser }) => {
  const { context, page } = await phone(browser);
  await context.route(`${API}/**`, (route) => route.abort());
  await page.goto('/');
  await page.getByRole('button', { name: 'One-phone game' }).click();
  await page.getByLabel('Player name').fill('Ada');
  await page.getByRole('button', { name: 'Start game' }).click();
  await levelUp(page, 'Ada').click();
  await expect(strengthOf(page, 'Ada')).toHaveText('2');
});

test('pressing Enter creates the session', async ({ browser }) => {
  const { page } = await phone(browser);
  await page.goto('/');
  await page.getByRole('button', { name: 'Create a session' }).click();
  await page.getByLabel('Your name').fill('Ada');
  await page.getByLabel('Your name').press('Enter');
  await expect(page.locator('.session-code')).toBeVisible();
});

test('a stalled server ends in an error, not a dead button', async ({ browser }) => {
  test.setTimeout(30_000);
  const { context, page } = await phone(browser);
  await context.route(`${API}/**`, () => {
    // Never answers, like a connection that hangs.
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Create a session' }).click();
  await page.getByLabel('Your name').fill('Ada');
  await page.getByRole('button', { name: 'Create session' }).click();
  await expect(page.getByRole('button', { name: 'Connecting…' })).toBeDisabled();
  await expect(page.getByRole('alert')).toContainText('Could not reach the server', {
    timeout: 15_000,
  });
  await expect(page.getByRole('button', { name: 'Create session' })).toBeEnabled();
});

test('creating a session explains when the server is down', async ({ browser }) => {
  const { context, page } = await phone(browser);
  await context.route(`${API}/**`, (route) => route.abort());
  await page.goto('/');
  await page.getByRole('button', { name: 'Create a session' }).click();
  await page.getByLabel('Your name').fill('Ada');
  await page.getByRole('button', { name: 'Create session' }).click();
  await expect(page.getByRole('alert')).toContainText('Could not reach the server');
});

