import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs/promises';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const PUBLIC_DIR = path.join(process.cwd(), 'public');

async function generateFavicons() {
  console.log('Generating favicons using Puppeteer...');
  
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // HTML content that renders the logo accurately
  // Using the exact styles from Logo.tsx and global CSS context
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        body { margin: 0; padding: 0; background: transparent; }
        .logo-container {
          width: 512px;
          height: 512px;
          background-color: #eff6ff; /* bg-blue-50 */
          color: #2563eb; /* text-blue-600 */
          border-radius: 15%; /* approximate rounded-xl */
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* shadow-sm */
        }
        svg {
          width: 60%;
          height: 60%;
        }
      </style>
    </head>
    <body>
      <div id="logo" class="logo-container">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      </div>
    </body>
    </html>
  `;

  await page.setContent(htmlContent);
  const element = await page.$('#logo');

  if (!element) {
    console.error('Could not find logo element');
    await browser.close();
    return;
  }

  const sizes = [
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'android-chrome-192x192.png', size: 192 },
    { name: 'android-chrome-512x512.png', size: 512 }
  ];

  for (const { name, size } of sizes) {
    console.log(`Generating ${name} (${size}x${size})...`);
    // Adjust container size for capture
    await page.evaluate((s) => {
      const el = document.getElementById('logo');
      el.style.width = `${s}px`;
      el.style.height = `${s}px`;
    }, size);

    await element.screenshot({
      path: path.join(PUBLIC_DIR, name),
      omitBackground: true,
    });
  }

  console.log('Generating favicon.ico (copying 32x32)...');
  await fs.copyFile(path.join(PUBLIC_DIR, 'favicon-32x32.png'), path.join(PUBLIC_DIR, 'favicon.ico'));

  await browser.close();
  console.log('Done!');
}

generateFavicons().catch(console.error);
