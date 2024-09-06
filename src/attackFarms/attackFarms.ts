import { Page } from "puppeteer";
import { goPage, CLICK_DELAY } from "../browser/browserService";
import Links from "../constants/links";
import { formatTimeMillis } from "../utils/timePrint";
import { TaskResult } from "../index";

let lastAttackTime: number = 0;
let attackCount: number = 1;
const MIN_ATTACK_INTERVAL: number = 5 * 60 * 1000;

const attackFarms = async (page: Page): Promise<TaskResult> => {
  const nextExecutionTime = getNextExecutionTime();
  if (nextExecutionTime > Date.now()) {
    return { nextExecutionTime: nextExecutionTime, skip: true };
  }
  console.log("Enough time has passed since the last attack, go for attack!");

  const successfullyAttack = await performAttack(page);

  if (successfullyAttack) {
    updateNextAttackTime();
  }

  console.log(`Next attack in ${formatTimeMillis(MIN_ATTACK_INTERVAL)}`);
  return { nextExecutionTime: getNextExecutionTime(), skip: false };
};

const getNextExecutionTime = (): number => {
  return MIN_ATTACK_INTERVAL + lastAttackTime;
};

const updateNextAttackTime = (): void => {
  lastAttackTime = Date.now();
  attackCount = attackCount + 1;
};

const performAttack = async (page: Page): Promise<boolean> => {
  try {
    await goPage(Links.TRAVIAN_FARM_LIST);

    await waitForButtonsToLoad(page);
    await clickButtons(page);

    console.log(
      `Attack completed successfully. Total attacks done ${attackCount}`
    );

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
