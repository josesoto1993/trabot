const puppeteer = require("puppeteer");

let browser;
let page;

const open = async () => {
  if (!browser) {
    browser = await puppeteer.launch({ headless: false });
    page = await browser.newPage();
  }
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
  if (!page) {
    throw new Error("Browser is not open");
  }
  await page.goto(url);
};

module.exports = {
  open,
  close,
  goPage,
};
