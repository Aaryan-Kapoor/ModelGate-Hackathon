const { test } = require('@playwright/test');

test('upload updates UI', async ({ page }) => {
  page.on('console', msg => console.log('console', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('pageerror', err.message));
  await page.goto('http://127.0.0.1:3000/customers/new');
  await page.setInputFiles('input[type="file"]', '/home/cbak/programming/ksu-sg-hackathon/backend/data/sample_contracts/acme_support.txt');
  await page.waitForTimeout(1000);
  const body = await page.textContent('body');
  console.log(JSON.stringify({
    hasFileName: body.includes('acme_support.txt'),
    hasCustomerNameLabel: body.includes('Customer Name'),
    bodySnippet: body.slice(0, 800)
  }, null, 2));
});
