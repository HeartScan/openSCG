import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, '..', 'reports', 'renders');
const BASE_URL = 'http://localhost:3000/science/studies';

async function renderStudy(studyId = 'S017') {
  try {
    if (!await fs.access(OUTPUT_DIR).catch(() => false)) {
      await fs.mkdir(OUTPUT_DIR, { recursive: true });
    }

    console.log(`Launching browser for study ${studyId}...`);
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 1600, deviceScaleFactor: 2 });

    const url = `${BASE_URL}/${studyId}`;
    console.log(`Navigating to ${url}...`);
    
    try {
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    } catch (e) {
      console.error('Failed to load page. Is the dev server running?');
      await browser.close();
      return;
    }

    // Wait for content to render
    await page.waitForSelector('article', { timeout: 5000 });

    const outputPath = path.join(OUTPUT_DIR, `study_${studyId}.png`);
    await page.screenshot({ path: outputPath, fullPage: true });

    console.log(`Rendered study ${studyId} to ${outputPath}`);
    await browser.close();
  } catch (error) {
    console.error('Error during rendering:', error);
  }
}

// Get study ID from command line or use random
async function main() {
  let studyId = process.argv[2];
  
  if (!studyId) {
    const studiesDir = path.join(__dirname, '..', 'public', 'science-hub', 'studies');
    const files = await fs.readdir(studiesDir);
    const mdFiles = files.filter(f => f.endsWith('.md'));
    const randomFile = mdFiles[Math.floor(Math.random() * mdFiles.length)];
    studyId = randomFile.replace('.md', '');
  }

  await renderStudy(studyId);
}

main();
