const { waitRandomTime, goPage } = require("./browserService");
const { TRAVIAN_FARM_LIST } = require("../config/constants");

let lastAttackTime = 0;
let randomInterval = 0;
const MIN_ATTACK_INTERVAL = 4 * 60 * 1000;
const RANDOM_INTERVAL_VARIATION = 2 * 60 * 1000;
const MIN_CLICK_INTERVAL = 3 * 1000;
const MAX_CLICK_INTERVAL = 5 * 1000;

const attackFarms = async (page) => {
  const currentTime = Date.now();
  if (!hasEnoughTimePassed(currentTime)) {
    return;
  }
  console.log("Enough time has passed since the last attack, go for attack!");

  await performAttack(page);
};

const hasEnoughTimePassed = (currentTime) => {
  return currentTime - lastAttackTime >= MIN_ATTACK_INTERVAL + randomInterval;
};

const updateNextAttackTime = () => {
  randomInterval = Math.floor(Math.random() * RANDOM_INTERVAL_VARIATION);
  lastAttackTime = Date.now();
};

const performAttack = async (page) => {
  try {
    await goPage(TRAVIAN_FARM_LIST);

    await waitForButtonsToLoad(page);
    await clickButtons(page);

    updateNextAttackTime();
    console.log("Attack completed successfully.");
  } catch (error) {
    console.error("Error during attack:", error);
  }
};

const waitForButtonsToLoad = async (page) => {
  await page.waitForSelector("button.startFarmList");
};

const clickButtons = async (page) => {
  const buttons = await page.$$("button.startFarmList:not(.disabled)");

  for (const button of buttons) {
    await button.click();
    await waitRandomTime(MIN_CLICK_INTERVAL, MAX_CLICK_INTERVAL);
  }
};

module.exports = {
  attackFarms,
};
