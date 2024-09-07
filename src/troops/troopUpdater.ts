import { ElementHandle, Page } from "puppeteer";
import { CLICK_DELAY } from "../browser/browserService";
import { formatDateTime, formatTimeMillis } from "../utils/timePrint";
import { getVillages } from "../player/playerHandler";
import { goBuilding } from "../village/goVillage";
import {
  getUpgradeList,
  IUpgradeUnit,
  removeUpgrade,
} from "../services/upgradeUnitService";
import BuildingNames from "../constants/buildingNames";
import { TaskResult } from "../index";
import { IUnit } from "../services/unitService";
import Village from "../models/village";

const MIN_UPGRADE_DELAY = 5 * 60 * 1000;

const upgradeTroops = async (page: Page): Promise<TaskResult> => {
  const upgradeList = await getUpgradeList();
  const skip = shouldSkip(upgradeList);
  if (skip) {
    return skip;
  }

  const villages = getVillages();
  let anyUpgradePerformed = false;
  for (const upgrade of upgradeList) {
    const upgradePerformed = await performUpgrade(page, upgrade, villages);
    if (upgradePerformed) {
      anyUpgradePerformed = true;
    }
  }

  const nextExecutionTime = Math.max(
    getNextExecutionTime(upgradeList),
    Date.now() + MIN_UPGRADE_DELAY
  );
  return {
    nextExecutionTime,
    skip: !anyUpgradePerformed,
  };
};

const shouldSkip = (upgradeList: IUpgradeUnit[]): TaskResult => {
  if (upgradeList.length === 0) {
    return {
      nextExecutionTime: MIN_UPGRADE_DELAY * 10 + Date.now(),
      skip: true,
    };
  }

  const nextExecutionTime = getNextExecutionTime(upgradeList);
  return nextExecutionTime > Date.now()
    ? { nextExecutionTime, skip: true }
    : null;
};

const getNextExecutionTime = (upgradeList: IUpgradeUnit[]): number => {
  const villages = getVillages();

  const minTroopUpgradeTime = villages.reduce((minTime, village) => {
    if (upgradeList.some((upgrade) => village.name === upgrade.villageName)) {
      const upgradeTime = village.upgradeTroopTime || 0;
      return Math.min(minTime, upgradeTime);
    }
    return minTime;
  }, Infinity);

  return minTroopUpgradeTime;
};

const performUpgrade = async (
  page: Page,
  upgrade: IUpgradeUnit,
  villages: Village[]
): Promise<boolean> => {
  const village = villages.find(
    (village) => village.name === upgrade.villageName
  );

  const villageSmithy = village?.buildings.find(
    (building) => building.name === BuildingNames.SMITHY
  );
  if (!villageSmithy) {
    console.log(
      `Can't upgrade ${village?.name}-${upgrade.unit.name} as it does not have a Smithy`
    );
    await removeUpgrade({
      villageName: upgrade.villageName,
      unitName: upgrade.unit.name,
    });
  }

  return await upgradeUnit(page, upgrade.unit, village);
};

const upgradeUnit = async (
  page: Page,
  unit: IUnit,
  village: Village
): Promise<boolean> => {
  try {
    await goBuilding(village, BuildingNames.SMITHY);
    const remainingTime = await getRemainingTime(page);

    if (remainingTime > 0) {
      console.log(
        `No need to upgrade [${village.name} / ${unit.name}], remaining time=${formatTimeMillis(
          remainingTime
        )}`
      );
      updateVillageTroopTime(village, unit, remainingTime);
      return false;
    }

    const unitLevel = await getUnitLevel(page, unit.name);
    if (unitLevel === 20) {
      console.log(
        `No need to upgrade [${village.name} / ${unit.name}], as it is level 20`
      );
      await removeUpgrade({ villageName: village.name, unitName: unit.name });
      return false;
    }

    console.log(
      `Need to upgrade [${village.name} / ${unit.name} / level ${unitLevel}]`
    );
    const unitUpgraded = await improveUnit(page, unit.name);
    if (!unitUpgraded) {
      console.log(`Can't upgrade [${village.name} / ${unit.name}]`);
    }

    const finalRemainingTime = await getRemainingTime(page);
    updateVillageTroopTime(village, unit, finalRemainingTime);
    return true;
  } catch (error) {
    console.log("Error during train:", error);
    return false;
  }
};

const getRemainingTime = async (page: Page): Promise<number> => {
  const upgradesTimeout = 5 * 1000;
  const timerSelector = "td.dur span.timer";
  try {
    await page.waitForSelector(timerSelector, {
      timeout: upgradesTimeout,
    });
    const remainingTimes = await page.$$eval(timerSelector, (spans: any[]) =>
      spans.map((span) => parseInt(span.getAttribute("value"), 10))
    );
    const maxRemainingTime = Math.max(...remainingTimes) * 1000;
    console.log(
      `Maximum remaining time: ${formatTimeMillis(maxRemainingTime)}`
    );
    return maxRemainingTime;
  } catch (error) {
    if (error.name === "TimeoutError") {
      console.log("No troops are currently being upgraded.");
      return 0;
    } else {
      console.log("Error getting remaining time:", error);
      return -1;
    }
  }
};

const getUnitLevel = async (
  page: Page,
  unitName: string
): Promise<number | null> => {
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

  const levelText = await page.evaluate(
    (el: Element) => el.textContent,
    levelElement
  );
  return parseInt(levelText?.replace(/\D/g, "") || "0", 10);
};

const improveUnit = async (page: Page, unitName: string): Promise<boolean> => {
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

const getSection = async (
  page: Page,
  unitName: string
): Promise<ElementHandle<Element> | null> => {
  const researchSections = await page.$$("div.researches div.research");

  for (const section of researchSections) {
    const titleElement = await section.$("div.information div.title");

    if (titleElement) {
      const titleText = await page.evaluate(
        (el: Element) =>
          el.textContent
            ?.replace(/[^a-zA-Z]/g, "")
            .trim()
            .toLowerCase(),
        titleElement
      );

      const normalizedUnitName = unitName
        .replace(/[^a-zA-Z]/g, "")
        .toLowerCase();

      if (titleText?.includes(normalizedUnitName)) {
        return section;
      }
    }
  }

  console.log(`No matching section found for ${unitName}.`);
  return null;
};

const updateVillageTroopTime = (
  village: Village,
  unit: IUnit,
  durationInMillis: number
): void => {
  const finishTime = durationInMillis + Date.now();

  village.upgradeTroopTime = finishTime;

  console.log(
    `Village ${village.name} / ${unit.name} -> will finish ${formatDateTime(finishTime)}`
  );
};

export default upgradeTroops;
