/**
 * Screenshot Automation Script — Northgate Dental
 * Captures high-res screenshots of Frontend and Backend Admin Portal
 * SPManchester Private Limited — spmanchester.com
 */

'use strict';

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_PATHS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
];

const executablePath = CHROME_PATHS.find(p => fs.existsSync(p));
if (!executablePath) {
  console.error('❌ Neither Chrome nor Edge executable was found!');
  process.exit(1);
}

const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots');
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function capture() {
  console.log(`\n📸 Launching browser from: ${executablePath}`);
  const browser = await puppeteer.launch({
    executablePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 });

  console.log('\n--- 1. CAPTURING FRONTEND (PATIENT WEBSITE) ---');

  // 1.1 Homepage Hero
  console.log('Capturing: 01-frontend-hero.png');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01-frontend-hero.png'), clip: { x: 0, y: 0, width: 1440, height: 850 } });

  // 1.2 Story / Why Us Section
  console.log('Capturing: 02-frontend-story.png');
  const storyEl = await page.$('#story');
  if (storyEl) {
    await storyEl.scrollIntoView();
    await page.evaluate(() => new Promise(r => setTimeout(r, 400)));
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02-frontend-story.png') });
  }

  // 1.3 Treatments Catalogue
  console.log('Capturing: 03-frontend-treatments.png');
  const treatEl = await page.$('#treatments');
  if (treatEl) {
    await treatEl.scrollIntoView();
    await page.evaluate(() => new Promise(r => setTimeout(r, 400)));
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03-frontend-treatments.png') });
  }

  // 1.4 Booking Section (Step 1)
  console.log('Capturing: 04-frontend-booking.png');
  const bookEl = await page.$('#book');
  if (bookEl) {
    await bookEl.scrollIntoView();
    await page.evaluate(() => new Promise(r => setTimeout(r, 400)));
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04-frontend-booking.png') });
  }

  // 1.5 Reviews Section
  console.log('Capturing: 05-frontend-reviews.png');
  const revEl = await page.$('#reviews');
  if (revEl) {
    await revEl.scrollIntoView();
    await page.evaluate(() => new Promise(r => setTimeout(r, 400)));
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05-frontend-reviews.png') });
  }

  // 1.6 FAQ & Contact Section
  console.log('Capturing: 06-frontend-faq-contact.png');
  const faqEl = await page.$('#faq');
  if (faqEl) {
    await faqEl.scrollIntoView();
    await page.evaluate(() => new Promise(r => setTimeout(r, 400)));
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '06-frontend-faq-contact.png') });
  }

  // 1.7 Full Page Long Screenshot
  console.log('Capturing: 07-frontend-fullpage.png (Full Scroll)');
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '07-frontend-fullpage.png'), fullPage: true });

  console.log('\n--- 2. CAPTURING BACKEND ADMIN PORTAL ---');

  // 2.1 Admin Login Page
  console.log('Capturing: 08-admin-login.png');
  // Clear any existing localStorage
  await page.goto('http://localhost:3000/admin/', { waitUntil: 'networkidle2' });
  await page.evaluate(() => { localStorage.clear(); location.reload(); });
  await page.waitForNavigation({ waitUntil: 'networkidle2' });
  await page.evaluate(() => new Promise(r => setTimeout(r, 300)));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '08-admin-login.png') });

  // 2.2 Sign In and capture Dashboard Overview
  console.log('Logging in and Capturing: 09-admin-dashboard.png');
  await page.click('#login-form button[type="submit"]');
  await page.waitForSelector('#recent-appts-body tr', { timeout: 8000 });
  await page.evaluate(() => new Promise(r => setTimeout(r, 800)));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '09-admin-dashboard.png') });

  // 2.3 Appointments Management Page
  console.log('Capturing: 10-admin-appointments.png');
  await page.click('.nav-item[data-page="appointments"]');
  await page.waitForSelector('#appts-table-body tr', { timeout: 8000 });
  await page.evaluate(() => new Promise(r => setTimeout(r, 600)));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '10-admin-appointments.png') });

  // 2.4 Confirm Appointment Modal
  console.log('Capturing: 11-admin-confirm-modal.png');
  const confirmBtn = await page.$('#appts-table-body button.btn-success');
  if (confirmBtn) {
    await confirmBtn.click();
    await page.evaluate(() => new Promise(r => setTimeout(r, 500)));
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '11-admin-confirm-modal.png') });
    await page.keyboard.press('Escape');
    await page.evaluate(() => new Promise(r => setTimeout(r, 300)));
  }

  // 2.5 Treatments & Fees Page
  console.log('Capturing: 12-admin-treatments.png');
  await page.click('.nav-item[data-page="treatments"]');
  await page.waitForSelector('#treatments-body tr', { timeout: 8000 });
  await page.evaluate(() => new Promise(r => setTimeout(r, 600)));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '12-admin-treatments.png') });

  // 2.6 Patient Reviews Moderation
  console.log('Capturing: 13-admin-reviews.png');
  await page.click('.nav-item[data-page="reviews"]');
  await page.waitForSelector('#reviews-body tr', { timeout: 8000 });
  await page.evaluate(() => new Promise(r => setTimeout(r, 600)));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '13-admin-reviews.png') });

  // 2.7 Enquiries / Contact Messages
  console.log('Capturing: 14-admin-messages.png');
  await page.click('.nav-item[data-page="messages"]');
  await page.waitForSelector('#messages-body tr', { timeout: 8000 });
  await page.evaluate(() => new Promise(r => setTimeout(r, 600)));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '14-admin-messages.png') });

  // 2.8 Newsletter Subscribers & Export
  console.log('Capturing: 15-admin-newsletter.png');
  await page.click('.nav-item[data-page="newsletter"]');
  await page.waitForSelector('#newsletter-body tr', { timeout: 8000 });
  await page.evaluate(() => new Promise(r => setTimeout(r, 600)));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '15-admin-newsletter.png') });

  // 2.9 Settings & System Diagnostics
  console.log('Capturing: 16-admin-settings.png');
  await page.click('.nav-item[data-page="settings"]');
  await page.evaluate(() => new Promise(r => setTimeout(r, 600)));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '16-admin-settings.png') });

  // 2.10 Mobile Responsive Admin View
  console.log('Capturing: 17-admin-mobile-dashboard.png');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.evaluate(() => navigateTo('dashboard'));
  await page.evaluate(() => new Promise(r => setTimeout(r, 600)));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '17-admin-mobile-dashboard.png') });

  // 2.11 Mobile Admin Drawer Open
  console.log('Capturing: 18-admin-mobile-drawer.png');
  await page.click('#sidebar-toggle');
  await page.evaluate(() => new Promise(r => setTimeout(r, 400)));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '18-admin-mobile-drawer.png') });

  // 1.8 Mobile Patient Website
  console.log('Capturing: 19-frontend-mobile.png');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
  await page.evaluate(() => new Promise(r => setTimeout(r, 400)));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '19-frontend-mobile.png') });

  // Create primary portfolio preview
  fs.copyFileSync(
    path.join(SCREENSHOTS_DIR, '01-frontend-hero.png'),
    path.join(SCREENSHOTS_DIR, 'preview-homepage.png')
  );

  await browser.close();

  console.log('\n======================================================');
  console.log('🎉 ALL SCREENSHOTS CREATED SUCCESSFULLY!');
  console.log(`📁 Directory: ${SCREENSHOTS_DIR}`);
  console.log('======================================================\n');
}

capture().catch(err => {
  console.error('\n❌ Screenshot capture failed:', err);
  process.exit(1);
});
