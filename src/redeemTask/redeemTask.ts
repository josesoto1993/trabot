import { Page, ElementHandle } from "puppeteer";
import { URL } from "url";
import getVillagesInfo from "../village/listVillagesSimple";
import { goPage, CLICK_DELAY } from "../browser/browserService";
import { formatTimeMillis } from "../utils/timePrint";
import Links from "../constants/links";
import TaskTabs from "../constants/taskTabs";
import { TaskResult } from "../index";

let lastRedeemTime = 0;

const REDEEM_TASK_VIEW_SELECTOR = ".taskOverview";
const REDEEM_BUTTONS_SELECTOR = ".taskOverview .achieved .progress .collect";

const redeem = async (page: Page, interval: number): Promise<TaskResult> => {
  const nextExecutionTime = getNextExecutionTime(interval);
  if (nextExecutionTime > Date.now()) {
    return { nextExecutionTime, skip: true };
  }
  console.log("Enough time has passed since the redeem, try redeem new tasks");

  await redeemTask(page);

  updateNextBuildTime(interval);
  return { nextExecutionTime: getNextExecutionTime(interval), skip: false };
};

const getNextExecutionTime = (interval: number): number => {
  return lastRedeemTime + interval;
};

const updateNextBuildTime = (interval: number): void => {
  console.log(`Next redeem in ${formatTimeMillis(interval)}`);
  lastRedeemTime = Date.now();
};

const redeemTask = async (page: Page): Promise<void> => {
  try {
    const villages = await getVillagesInfo(page);

    for (const village of villages) {
      await redeemAllFromVillage(page, village);
    }

    await redeemAllFromUser(page);
  } catch (error) {
    console.error("Error in redeem task:", error);
  }
};

const redeemAllFromVillage = async (
  page: Page,
  village: { id: string }
): Promise<void> => {
  await openTask(TaskTabs.CITY_TAB, village.id);
  await redeemAll(page);
};

const redeemAllFromUser = async (page: Page): Promise<void> => {
  await openTask(TaskTabs.PLAYER_TAB, null);
  await redeemAll(page);
};

const openTask = async (
  tab: string,
  villageId: string | null
): Promise<void> => {
  const redeemUrl = new URL(Links.TRAVIAN_TASK_VIEW);
  redeemUrl.searchParams.append(TaskTabs.QUERY_PARAM_KEY, tab);
  if (villageId) {
    redeemUrl.searchParams.append("newdid", villageId);
  }
  await goPage(redeemUrl);
};

const redeemAll = async (page: Page): Promise<void> => {
  try {
    let hasCollectButtons = true;

    do {
      await page.waitForSelector(REDEEM_TASK_VIEW_SELECTOR);

      const redeemButtons: ElementHandle<Element>[] = await page.$$(
        REDEEM_BUTTONS_SELECTOR
      );

      if (redeemButtons.length > 0) {
        await redeemSingle(redeemButtons[0]);
      } else {
        hasCollectButtons = false;
      }
    } while (hasCollectButtons);
  } catch (error) {
    console.error("Error in redeemAll:", error);
  }
};

const redeemSingle = async (
  buttonToClick: ElementHandle<Element>
): Promise<void> => {
  await buttonToClick.click();
  await new Promise((resolve) => setTimeout(resolve, CLICK_DELAY));
};

export default redeem;
