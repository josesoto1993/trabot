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
  const urlString = url.toString();
  console.log(`Go to page ${urlString}`);
  if (!page) {
    throw new Error("Browser is not open");
  }
  await page.goto(urlString, { waitUntil: "networkidle0" });
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
