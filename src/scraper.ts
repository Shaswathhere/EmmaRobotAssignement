import { chromium } from 'playwright';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

export async function downloadKaggleCsv(): Promise<string> {
  console.log('🚀 Starting browser automation...');

  if (!process.env.KAGGLE_EMAIL || !process.env.KAGGLE_PASSWORD) {
    throw new Error('Kaggle email or password not found in .env file.');
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();

  console.log('Navigating to Kaggle login page...');
  await page.goto('https://www.kaggle.com/account/login');

  await page.click('button:has-text("Sign in with Email")');
  await page.waitForSelector('input[name="email"]', { timeout: 10000 });

  console.log('Logging in with credentials...');
  await page.fill('input[name="email"]', process.env.KAGGLE_EMAIL);
  await page.fill('input[name="password"]', process.env.KAGGLE_PASSWORD);
  await page.click('button:has-text("Sign In")');

  await page.waitForTimeout(5000);

  console.log('Login successful. Navigating to dataset page...');

  await page.goto('https://www.kaggle.com/datasets/thedevastator/us-baby-names-by-year-of-birth?select=babyNamesUSYOB-full.csv');

  await page.waitForTimeout(3000);
  console.log('Starting file download...');

  const [download] = await Promise.all([
    page.waitForEvent('download'),

    page.getByLabel('Download', { exact: true }).click()
  ]);

  console.log('Download event detected. Saving the file...');
  const downloadPath = path.join(__dirname, '..', 'downloads', 'kaggle-data.zip');
  await download.saveAs(downloadPath);

  console.log(`✅ File downloaded and saved to: ${downloadPath}`);
  await browser.close();
  return downloadPath;
}