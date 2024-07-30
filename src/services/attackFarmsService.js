const { waitRandomTime, goPage } = require("./browserService");
const { TRAVIAN_FARM_LIST } = require("../config/constants");

let lastAttackTime = 0;
let randomInterval = 0;
let attackCount = 0;
const MIN_ATTACK_INTERVAL = 5 * 60 * 1000;
const RANDOM_INTERVAL_VARIATION = 0.5 * 60 * 1000;
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
  randomInterval = Math.floor(
    Math.random() * RANDOM_INTERVAL_VARIATION * 2 - RANDOM_INTERVAL_VARIATION
  );
  lastAttackTime = Date.now();
  attackCount = attackCount + 1;
};

const performAttack = async (page) => {
  try {
    await goPage(TRAVIAN_FARM_LIST);

    await waitForButtonsToLoad(page);
    await clickButtons(page);

    updateNextAttackTime();
    console.log(
      `Attack completed successfully. Total attacks done ${attackCount}`
    );
  } catch (error) {
    console.error("Error during attack:", error);
  }
};

const waitForButtonsToLoad = async (page) => {
  await page.waitForSelector("button.startFarmList");
  console.log("Buttons load successfully.");
};

const clickButtons = async (page) => {
  const buttons = await page.$$("button.startFarmList:not(.disabled)");

  console.log(`There are ${buttons.length} buttons`);
  for (const button of buttons) {
    await button.click();
    console.log("Click button successfully.");
    await waitRandomTime(MIN_CLICK_INTERVAL, MAX_CLICK_INTERVAL);
  }
};

module.exports = {
  attackFarms,
};
