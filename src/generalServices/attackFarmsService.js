const { waitRandomTime, goPage } = require("../browser/browserService");
const { TRAVIAN_FARM_LIST } = require("../constants/links");

let lastAttackTime = 0;
let randomAttackInterval = 0;
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
  const timePased = currentTime - lastAttackTime;
  const remaningTime = MIN_ATTACK_INTERVAL + randomAttackInterval - timePased;
  console.log(`Time pased since last attack ${timePased}s`);
  console.log(`Remaning time to attack farms ${remaningTime}s`);
  return remaningTime < 0;
};

const updateNextAttackTime = () => {
  randomAttackInterval = Math.floor(
    Math.random() * RANDOM_INTERVAL_VARIATION * 2 - RANDOM_INTERVAL_VARIATION
  );
  console.log(`Next attack in ${MIN_ATTACK_INTERVAL + randomAttackInterval}s`);
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
