const { CLICK_DELAY } = require("../browser/browserService");
const { formatTime, formatDateTime } = require("../utils/timePrint");
const { getVillages } = require("../player/playerHandler");
const { goBuilding } = require("../village/goVillage");
const BuildingTypes = require("../constants/buildingTypes");
const UpgradeList = require("../constants/troopsToUpgrade");

const MIN_UPGRADE_DELAY = 5 * 60;

const upgradeTroops = async (page) => {
  const skip = shouldSkip();
  if (skip) {
    return skip;
  }

  const villages = getVillages();

  let anyUpgradePerformed = false;
  for (const upgrade of UpgradeList) {
    const village = villages.find(
      (village) => village.name === upgrade.villageName
    );
    const trainPerformed = await performUpgrade(page, upgrade.unit, village);
    if (trainPerformed) {
      anyUpgradePerformed = true;
    }
  }

  const nextExecutionTime = Math.max(
    getNextUpgradeRemaining(),
    MIN_UPGRADE_DELAY
  );

  return {
    nextExecutionTime: nextExecutionTime,
    skip: !anyUpgradePerformed,
  };
};

const shouldSkip = () => {
  const remainingTime = getNextUpgradeRemaining();
  return remainingTime > 0
    ? { nextExecutionTime: remainingTime, skip: true }
    : null;
};

const getNextUpgradeRemaining = () => {
  const villages = getVillages();

  const minTroopUpgradeTime = villages.reduce((minTime, village) => {
    if (UpgradeList.some((upgrade) => village.name === upgrade.villageName)) {
      const upgradeTime = village.upgradeTroopTime || 0;
      return Math.min(minTime, upgradeTime);
    }
    return minTime;
  }, Infinity);

  return minTroopUpgradeTime - Date.now() / 1000;
};

const performUpgrade = async (page, unit, village) => {
  try {
    await goBuilding(village, BuildingTypes["Smithy"].name);
    const remainingTime = await getRemainingTime(page);

    if (remainingTime !== 0) {
      console.log(
        `No need to upgrade [${village.name} / ${unit.name}], remaining time=${formatTime(remainingTime)}`
      );
      updateVillageTroopTime(village, unit, remainingTime);
      return false;
    }

    const unitLevel = await getUnitLevel(page, unit.name);
    if (unitLevel === 20) {
      console.log(
        `No need to upgrade [${village.name} / ${unitName}], as it is level 20`
      );

      UpgradeList = UpgradeList.filter((item) => item.unit.name !== unitName);

      return false;
    }

    console.log(
      `Need to upgrade [${village.name} / ${unit.name} / level ${unitLevel}] `
    );
    const unitUpgraded = await improveUnit(page, unit.name);
    if (!unitUpgraded) {
      console.log(`Cant upgrade [${village.name} / ${unit.name}]`);
    }

    const finalRemainingTime = await getRemainingTime(page);
    updateVillageTroopTime(village, unit, finalRemainingTime);
    return true;
  } catch (error) {
    console.log("Error during train:", error);
    return false;
  }
};

const getRemainingTime = async (page) => {
  const upgradesTimeoutMillis = 5 * 1000;
  const timerSelector = "td.dur span.timer";
  try {
    await page.waitForSelector(timerSelector, {
      timeout: upgradesTimeoutMillis,
    });
    const remainingTimes = await page.$$eval(timerSelector, (spans) =>
      spans.map((span) => parseInt(span.getAttribute("value"), 10))
    );
    const maxRemainingTime = Math.max(...remainingTimes);
    console.log(`Maximum remaining time: ${formatTime(maxRemainingTime)}`);
    return maxRemainingTime;
  } catch (error) {
    if (error.name === "TimeoutError") {
      console.log("No troops are currently being upgrading.");
      return 0;
    } else {
      console.log("Error getting remaining time:", error);
      return -1;
    }
  }
};

const getUnitLevel = async (page, unitName) => {
  const section = await getSection(page, unitName);

  if (!section) {
    console.log(`No level section found for ${unitName}.`);
    return null;
  }

  const levelElement = await section.$("div.information div.title span.level");
  if (!levelElement) {
    console.log(`No level information found for ${unitName}.`);
    return null;
  }

  const levelText = await page.evaluate((el) => el.textContent, levelElement);
  return parseInt(levelText.replace(/\D/g, ""), 10);
};

const improveUnit = async (page, unitName) => {
  const section = await getSection(page, unitName);

  if (!section) {
    console.log(`No matching unit found for ${unitName}.`);
    return false;
  }

  const button = await section.$("div.information div.cta button.contracting");
  if (!button) {
    console.log(`No contracting button found for ${unitName}.`);
    return false;
  }

  await button.click();
  console.log(`${unitName} improvement initiated.`);
  await new Promise((resolve) => setTimeout(resolve, CLICK_DELAY));
  return true;
};

const getSection = async (page, unitName) => {
  const researchSections = await page.$$("div.researches div.research");

  for (const section of researchSections) {
    const titleElement = await section.$("div.information div.title");

    if (titleElement) {
      const titleText = await page.evaluate(
        (el) => el.textContent?.trim(),
        titleElement
      );

      if (
        titleText &&
        titleText.toLowerCase().includes(unitName.toLowerCase())
      ) {
        return section;
      }
    }
  }

  console.log(`No matching section found for ${unitName}.`);
  return null;
};

const updateVillageTroopTime = (village, unit, finalRemainingTime) => {
  const finishTime = finalRemainingTime + Date.now() / 1000;

  village.upgradeTroopTime = finishTime;

  console.log(
    `Village ${village.name} / ${unit.name} -> duration ${formatTime(finalRemainingTime)} will finish ${formatDateTime(finishTime)}`
  );
};

module.exports = upgradeTroops;
