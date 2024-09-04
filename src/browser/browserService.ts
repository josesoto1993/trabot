import puppeteer, { Browser, Page } from "puppeteer";

let browser: Browser | null = null;
let page: Page | null = null;

const WINDOW_WIDTH: number = parseInt(process.env.WINDOW_WIDTH || "1366", 10);
const WINDOW_HEIGHT: number = parseInt(process.env.WINDOW_HEIGHT || "768", 10);
const TYPE_DELAY: number = 100;
export const CLICK_DELAY: number = 3 * 1000;

export const open = async (): Promise<Page> => {
  if (!browser) {
    browser = await puppeteer.launch({ headless: false });
  }
  if (!page || page.isClosed()) {
    page = await browser.newPage();
  }
  const pages = await browser.pages();
  for (const otherPage of pages) {
    if (otherPage !== page) {
      await otherPage.close();
    }
  }

  await page.setViewport({ width: WINDOW_WIDTH, height: WINDOW_HEIGHT });

  return page;
};

export const close = async (): Promise<void> => {
  if (browser) {
    await browser.close();
    browser = null;
    page = null;
  }
};

export const goPage = async (url: string | URL): Promise<void> => {
  const urlString = url.toString();
  console.log(`Go to page ${urlString}`);
  if (!page) {
    throw new Error("Browser is not open");
  }
  await page.goto(urlString);
};

export const typeInSelector = async (
  selector: string,
  text: string | number
): Promise<void> => {
  if (!page) {
    throw new Error("Browser is not open");
  }
  const options = { delay: TYPE_DELAY };
  await page.type(selector, text.toString(), options);
};
