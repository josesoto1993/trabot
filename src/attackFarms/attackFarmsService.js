const { goPage } = require("../browser/browserService");
const { TRAVIAN_FARM_LIST } = require("../constants/links");
const { formatTime } = require("../utils/timePrintService");

let lastAttackTime = 0;
let randomAttackInterval = 0;
let attackCount = 1;
const MIN_ATTACK_INTERVAL = 5 * 60;
const RANDOM_INTERVAL_VARIATION_MILLIS = 0.5 * 60 * 1000;
const MIN_CLICK_INTERVAL_MILLIS = 3 * 1000;
const MAX_CLICK_INTERVAL_MILLIS = 5 * 1000;

const attackFarms = async (page) => {
  const remaningTime = getRemaningTime();
  if (remaningTime > 0) {
    return remaningTime;
  }
  console.log("Enough time has passed since the last attack, go for attack!");

  const successfullyAttack = await performAttack(page);

  if (successfullyAttack) {
    updateNextAttackTime();
  }

  return getRemaningTime();
};

const getRemaningTime = () => {
  const currentTime = Date.now();
  const timePased = (currentTime - lastAttackTime) / 1000;
  return MIN_ATTACK_INTERVAL + randomAttackInterval - timePased;
};

const updateNextAttackTime = () => {
  let randomAttackIntervalMillis = Math.floor(
    Math.random() * RANDOM_INTERVAL_VARIATION_MILLIS * 2 -
      RANDOM_INTERVAL_VARIATION_MILLIS
  );
  randomAttackInterval = randomAttackIntervalMillis / 1000;
  console.log(
    `Next attack in ${formatTime(MIN_ATTACK_INTERVAL + randomAttackInterval)}`
  );
  lastAttackTime = Date.now();
  attackCount = attackCount + 1;
};

const performAttack = async (page) => {
  try {
    await goPage(TRAVIAN_FARM_LIST);

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

const waitForButtonsToLoad = async (page) => {
  await page.waitForSelector("button.startAllFarmLists");
  console.log("Buttons load successfully.");
};

const clickButtons = async (page) => {
  const buttons = await page.$$("button.startAllFarmLists:not(.disabled)");

  console.log(`There are ${buttons.length} buttons`);
  for (const button of buttons) {
    await button.click();
    console.log("Click button successfully.");
    const randomTime =
      Math.floor(
        Math.random() * (MAX_CLICK_INTERVAL_MILLIS - MIN_CLICK_INTERVAL_MILLIS)
      ) + MIN_CLICK_INTERVAL_MILLIS;
    await new Promise((resolve) => setTimeout(resolve, randomTime));
  }
};

module.exports = {
  attackFarms,
};
