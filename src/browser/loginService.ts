import { Page } from "puppeteer";
import { goPage, typeInSelector } from "../browser/browserService";
import { TRAVIAN_BASE } from "../constants/links";
import { formatTime } from "../utils/timePrint";

const USERNAME: string | undefined = process.env.TARVIAN_USERNAME;
const PASSWORD: string | undefined = process.env.TARVIAN_PASSWORD;
const START_DELAY: number = 15;

if (!USERNAME || !PASSWORD) {
  throw new Error("Environment variables USERNAME and PASSWORD must be set.");
}

export const login = async (page: Page): Promise<void> => {
  try {
    await goPage(TRAVIAN_BASE);

    await writeUser(page);
    await writePassword(page);
    await submit(page);

    console.log(`Waiting for ${formatTime(START_DELAY)} before start...`);
    await new Promise((resolve) => setTimeout(resolve, START_DELAY * 1000));
    console.log("Login process completed.");
  } catch (error) {
    console.error("Error during login:", error);
  }
};

const writeUser = async (page: Page): Promise<void> => {
  try {
    await page.waitForSelector('input[name="name"]');
    await typeInSelector('input[name="name"]', USERNAME as string);
    console.log("Username entered.");
  } catch (error) {
    console.error("Error entering username:", error);
  }
};

const writePassword = async (page: Page): Promise<void> => {
  try {
    await page.waitForSelector('input[name="password"]');
    await typeInSelector('input[name="password"]', PASSWORD as string);
    console.log("Password entered.");
  } catch (error) {
    console.error("Error entering password:", error);
  }
};

const submit = async (page: Page): Promise<void> => {
  try {
    await page.click('button[type="submit"]');
    console.log("Login form submitted.");
  } catch (error) {
    console.error("Error submitting login form:", error);
  }
};
