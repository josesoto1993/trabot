const { URL } = require("url");
const { getVillagesInfo } = require("../village/listVillageIdsService");
const { goPage } = require("../browser/browserService");
const { TRAVIAN_TASK_VIEW } = require("../constants/links");
const TaskTabs = require("../constants/taskTabs");

let redeemTaskCount = 0;
let lastRedeemTime = 0;

const REDEEM_TASK_INTERVAL = 1 * 60 * 60;
const CLICK_BUTTON_DELAY = 5;
const REDEEM_TASK_VIEW_SELECTOR = ".taskOverview";
const REDEEM_BUTTONS_SELECTOR = ".taskOverview .achieved .progress .collect";

const redeem = async (page) => {
  const remainingTime = getRemainingTime();
  if (remainingTime > 0) {
    return remainingTime;
  }
  console.log("Enough time has passed since the redeem, try redeem new tasks");

  await redeemTask(page);

  updateNextBuildTime();
  return getRemainingTime();
};

const getRemainingTime = () => {
  const currentTime = Date.now();
  const timePassed = (currentTime - lastRedeemTime) / 1000;
  return REDEEM_TASK_INTERVAL - timePassed;
};

const updateNextBuildTime = () => {
  console.log(`Next redeem in ${formatTime(REDEEM_TASK_INTERVAL)}`);
  lastRedeemTime = Date.now();
};

const redeemTask = async (page) => {
  try {
    let redeemedThisRun = 0;
    const villages = await getVillagesInfo(page);

    for (const village of villages) {
      const redeemed = await redeemAllFromVillage(page, village);
      if (!redeemed) {
        continue;
      }

      redeemedThisRun += redeemed;
      redeemTaskCount += redeemed;
    }
    const redeemed = await redeemAllFromUser(page);
    if (redeemed) {
      redeemedThisRun += redeemed;
      redeemTaskCount += redeemed;
    }

    if (redeemedThisRun > 0) {
      console.log(`Redeems done this time: ${redeemedThisRun}`);
      console.log(`Total redeems done: ${redeemTaskCount}`);
    } else {
      console.log("Nothing to update");
    }
  } catch (error) {
    console.error("Error in buildResources:", error);
  }
};

const redeemAllFromVillage = async (page, village) => {
  await openTask(TaskTabs.CityTab, village);
  return redeemAll(page);
};

const redeemAllFromUser = async (page, village) => {
  await openTask(TaskTabs.PlayerTab, village);
  return redeemAll(page);
};

const openTask = async (tab, village) => {
  const redeemUrl = new URL(TRAVIAN_TASK_VIEW);
  redeemUrl.searchParams.append(TaskTabs.QueryParamKey, tab);
  redeemUrl.searchParams.append("newdid", village.id);
  await goPage(redeemUrl.toString());
};

const redeemAll = async (page) => {
  try {
    await page.waitForSelector(REDEEM_TASK_VIEW_SELECTOR);

    let buttonsClicked = 0;
    let hasCollectButtons = true;

    do {
      await page.waitForSelector(REDEEM_TASK_VIEW_SELECTOR);

      const redeemButtons = await page.$$(REDEEM_BUTTONS_SELECTOR);

      if (redeemButtons.length > 0) {
        await redeemSingle(redeemButtons[0]);
        buttonsClicked += 1;
      } else {
        hasCollectButtons = false;
      }
    } while (hasCollectButtons);

    return buttonsClicked;
  } catch (error) {
    console.error("Error in redeemAll:", error);
    return 0;
  }
};

const redeemSingle = async (buttonToClick) => {
  await buttonToClick.click();
  await new Promise((resolve) =>
    setTimeout(resolve, CLICK_BUTTON_DELAY * 1000)
  );
};

module.exports = redeem;
