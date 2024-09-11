import { Page } from "puppeteer";
import { goPage, CLICK_DELAY } from "../browser/browserService";
import Links from "../constants/links";
import { formatDateTime } from "../utils/timePrint";
import { TaskResult } from "../index";

let lastAttackTime: number = 0;

const attackFarms = async (
  page: Page,
  interval: number
): Promise<TaskResult> => {
  const nextExecutionTime = getNextExecutionTime(interval);
  if (nextExecutionTime > Date.now()) {
    return { nextExecutionTime: nextExecutionTime, skip: true };
  }
  console.log("Enough time has passed since the last attack, go for attack!");

  const successfullyAttack = await performAttackFarms(page);

  if (successfullyAttack) {
    updateNextAttackTime();
  }

  console.log(
    `Next attack at ${formatDateTime(getNextExecutionTime(interval))}`
  );
  return { nextExecutionTime: getNextExecutionTime(interval), skip: false };
};

const getNextExecutionTime = (interval: number): number => {
  return interval + lastAttackTime;
};

const updateNextAttackTime = (): void => {
  lastAttackTime = Date.now();
};

const performAttackFarms = async (page: Page): Promise<boolean> => {
  try {
    await goPage(Links.TRAVIAN_FARM_LIST);

    await waitForButtonsToLoad(page);
    await clickButtons(page);

    return true;
  } catch (error) {
    console.error("Error during attack:", error);

    return false;
  }
};

const waitForButtonsToLoad = async (page: Page): Promise<void> => {
  await page.waitForSelector("button.startAllFarmLists");
  console.log("Buttons load successfully.");
};

const clickButtons = async (page: Page): Promise<void> => {
  const buttons = await page.$$("button.startAllFarmLists:not(.disabled)");

  console.log(`There are ${buttons.length} buttons`);
  for (const button of buttons) {
    await button.click();
    console.log("Click button successfully.");
    await new Promise((resolve) => setTimeout(resolve, CLICK_DELAY));
  }
};

export default attackFarms;
