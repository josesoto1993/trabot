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

const waitRandomTime = async (min, max) => {
  if (min > max) {
    throw new Error("Min value cannot be greater than max value");
  }
  const randomTime = Math.floor(Math.random() * (max - min + 1)) + min;
  await new Promise((resolve) => setTimeout(resolve, randomTime));
};

module.exports = {
  open,
  close,
  goPage,
  waitRandomTime,
};
