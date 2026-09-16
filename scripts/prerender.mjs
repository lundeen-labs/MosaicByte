import puppeteer from 'puppeteer';
import { preview } from 'vite';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../dist');

const routesToPrerender = [
  '/',
  '/work',
  '/about',
  '/contact',
  '/privacy'
];

async function prerender() {
  console.log('Starting Vite preview server...');
  const server = await preview({
    preview: { port: 4173 },
    build: { outDir: distDir }
  });

  const urlBase = server.resolvedUrls.local[0];
  console.log(`Server running at ${urlBase}`);

  console.log('Launching Puppeteer...');
  const browser = await puppeteer.launch({
    headless: true,
    // GitHub Actions' ubuntu runners sit on Ubuntu 23.10+, where AppArmor
    // blocks unprivileged user namespaces. Puppeteer's *downloaded* Chrome
    // ships no AppArmor profile of its own, so its zygote aborts with
    // "No usable sandbox!" and the whole build fails. Disabling the sandbox
    // is the documented workaround (https://pptr.dev/troubleshooting) and is
    // safe here: this browser only ever loads localhost:4173, serving dist/
    // built from this repo in the same job. It never visits the network.
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  
  // Suppress external script errors
  page.on('pageerror', err => {
    if (!err.message.includes('Turnstile')) {
      console.warn('Page error during prerender:', err.message);
    }
  });

  const results = [];

  for (const route of routesToPrerender) {
    const url = `${urlBase}${route === '/' ? '' : route.slice(1)}`;
    console.log(`Prerendering ${route}...`);
    
    await page.goto(url, { waitUntil: 'networkidle0' });
    let html = await page.content();
    results.push({ route, html });
    console.log(`Rendered ${route}`);
  }

  console.log('Prerendering /404...');
  await page.goto(`${urlBase}404-not-found-dummy`, { waitUntil: 'networkidle0' });
  const html404 = await page.content();
  results.push({ route: '/404', html: html404 });
  console.log('Rendered /404');

  await browser.close();
  server.httpServer.close();

  console.log('Writing files to disk...');
  for (const { route, html } of results) {
    let filePath;
    if (route === '/') {
      filePath = path.join(distDir, 'index.html');
    } else if (route === '/404') {
      filePath = path.join(distDir, '404.html');
    } else {
      filePath = path.join(distDir, `${route.slice(1)}.html`);
      const dirPath = path.join(distDir, route.slice(1));
      await fs.mkdir(dirPath, { recursive: true });
      await fs.writeFile(path.join(dirPath, 'index.html'), html);
    }
    await fs.writeFile(filePath, html);
    console.log(`Saved ${route}`);
  }
  
  console.log('Prerender complete.');
}

prerender().catch(err => {
  console.error('Prerender failed:', err);
  process.exit(1);
});
