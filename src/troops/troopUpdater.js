const { CLICK_DELAY } = require("../browser/browserService");
const { formatTime, formatDateTime } = require("../utils/timePrint");
const { getVillages } = require("../player/playerHandler");
const { goBuilding } = require("../village/goVillage");
const BuildingTypes = require("../constants/buildingTypes");
const UpgradeList = require("../constants/troopsToUpgrade");

const MIN_UPGRADE_DELAY = 5 * 60;

const upgradeTroops = async (page) => {
  const skipBuild = shouldSkipBuild();
  if (skipBuild) {
    return skipBuild;
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

const shouldSkipBuild = () => {
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
  const unitLevelElement = await page.evaluate((unitName) => {
    const researchElements = document.querySelectorAll(
      "div.researches div.research"
    );

    for (let research of researchElements) {
      const titleElement = research.querySelector("div.information div.title");

      if (titleElement) {
        const links = titleElement.querySelectorAll("a");

        const match = Array.from(links).find((link) =>
          link.textContent.toLowerCase().includes(unitName.toLowerCase())
        );

        if (match) {
          const levelElement = titleElement.querySelector("span.level");
          if (levelElement) {
            const levelText = levelElement.textContent;
            return parseInt(levelText.replace(/\D/g, ""), 10);
          }
        }
      }
    }

    return null;
  }, unitName);

  return unitLevelElement;
};

const improveUnit = async (page, unitName) => {
  const researchSections = await page.$$("div.researches div.research");

  for (const section of researchSections) {
    const titleElements = await section.$$("div.information div.title a");

    const matchingTitleElement = await page.evaluate(
      (titleElements, unitName) => {
        for (const el of titleElements) {
          const textContent = el.textContent?.trim().toLowerCase();
          if (textContent && textContent.includes(unitName.toLowerCase())) {
            return true;
          }
        }
        return false;
      },
      titleElements,
      unitName
    );

    if (matchingTitleElement) {
      const button = await section.$(
        "div.information div.cta button.contracting"
      );

      if (button) {
        await button.click();
        console.log(`${unitName} improvement initiated.`);
        await new Promise((resolve) => setTimeout(resolve, CLICK_DELAY));
        return true;
      } else {
        console.log(`No contracting button found for ${unitName}.`);
        return false;
      }
    }
  }

  console.log(`No matching unit found for ${unitName}.`);
  return false;
};

const updateVillageTroopTime = (village, unit, finalRemainingTime) => {
  const finishTime = finalRemainingTime + Date.now() / 1000;

  village.upgradeTroopTime = finishTime;

  console.log(
    `Village ${village.name} / ${unit.name} -> duration ${formatTime(finalRemainingTime)} will finish ${formatDateTime(finishTime)}`
  );
};

module.exports = upgradeTroops;
