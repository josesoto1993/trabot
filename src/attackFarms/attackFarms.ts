import { Page } from "puppeteer";
import { goPage, CLICK_DELAY } from "../browser/browserService";
import Links from "../constants/links";
import { formatTime } from "../utils/timePrint";
import { TaskResult } from "..";

let lastAttackTime: number = 0;
let randomAttackInterval: number = 0;
let attackCount: number = 1;
const MIN_ATTACK_INTERVAL: number = 5 * 60;

const attackFarms = async (page: Page): Promise<TaskResult> => {
  const remainingTime = getRemainingTime();
  if (remainingTime > 0) {
    return { nextExecutionTime: remainingTime, skip: true };
  }
  console.log("Enough time has passed since the last attack, go for attack!");

  const successfullyAttack = await performAttack(page);

  if (successfullyAttack) {
    updateNextAttackTime();
  }

  return { nextExecutionTime: getRemainingTime(), skip: false };
};

const getRemainingTime = (): number => {
  const currentTime = Date.now();
  const timePassed = (currentTime - lastAttackTime) / 1000;
  return MIN_ATTACK_INTERVAL + randomAttackInterval - timePassed;
};

const updateNextAttackTime = (): void => {
  console.log(`Next attack in ${formatTime(MIN_ATTACK_INTERVAL)}`);
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
