const puppeteer = require("puppeteer");

let browser;
let page;

const WINDOW_WIDTH = parseInt(process.env.WINDOW_WIDTH, 10) || 1366;
const WINDOW_HEIGHT = parseInt(process.env.WINDOW_HEIGHT, 10) || 768;

const open = async () => {
  if (!browser) {
    browser = await puppeteer.launch({ headless: false });
  }
  if (!page || page.isClosed()) {
    page = await browser.newPage();
  }
  const pages = await browser.pages();
  for (const otherPages of pages) {
    if (otherPages !== page) {
      await otherPages.close();
    }
  }

  await page.setViewport({ width: WINDOW_WIDTH, height: WINDOW_HEIGHT });

  return page;
};

const close = async () => {
  if (browser) {
    await browser.close();
    browser = null;
    page = null;
  }
};

const goPage = async (url) => {
  const urlString = url.toString();
  console.log(`Go to page ${urlString}`);
  if (!page) {
    throw new Error("Browser is not open");
  }
  await page.goto(urlString);
};

const typeInSelector = async (selector, text) => {
  await page.type(selector, text.toString(), { delay: 100 });
};

module.exports = {
  open,
  close,
  goPage,
  typeInSelector,
};
