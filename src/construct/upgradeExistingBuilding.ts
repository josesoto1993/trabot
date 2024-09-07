import { ElementHandle, Page } from "puppeteer";
import { URL } from "url";
import { goPage, CLICK_DELAY } from "../browser/browserService";
import Links from "../constants/links";
import {
  updatePlayerBuilding,
  updatePlayerField,
  updatePlayerVillageBuildFinishIn,
} from "../player/playerHandler";
import { IBuildingType } from "../services/buildingTypeService";
import { formatTimeMillis } from "../utils/timePrint";

interface UpgradeResult {
  durationInMillis: number | null;
  level: number | null;
}

export const upgradeExistingBuilding = async (
  page: Page,
  villageId: string,
  slotId: number,
  buildingType: IBuildingType
): Promise<boolean> => {
  await selectBuilding(villageId, slotId);
  const { durationInMillis, level } = await upgradeSelectedBuilding(page);
  if (!durationInMillis) {
    return false;
  }

  updatePlayerBuilding(villageId, slotId, buildingType, level + 1);
  updatePlayerVillageBuildFinishIn(villageId, durationInMillis);
  return true;
};

export const upgradeExistingField = async (
  page: Page,
  villageId: string,
  slotId: number
): Promise<number | null> => {
  await selectBuilding(villageId, slotId);
  const { durationInMillis: duration, level } =
    await upgradeSelectedBuilding(page);
  if (!duration) {
    return null;
  }

  updatePlayerField(villageId, slotId, level + 1);
  updatePlayerVillageBuildFinishIn(villageId, duration);
  return duration;
};

const selectBuilding = async (
  villageId: string,
  slotId: number
): Promise<void> => {
  const villageUrl = new URL(Links.TRAVIAN_BUILD_VIEW);
  villageUrl.searchParams.append("newdid", villageId);
  villageUrl.searchParams.append("id", slotId.toString());
  await goPage(villageUrl);

  console.log(`Clicked on city with id ${villageId} building ${slotId}`);
};

const upgradeSelectedBuilding = async (page: Page): Promise<UpgradeResult> => {
  const buildButton = await getBuildButton(page);
  if (!buildButton) {
    console.log("No build button found.");
    return { durationInMillis: null, level: null };
  }

  const durationInMillis = await getDurationValue(page);
  const oldLevel = await getLevelValue(page);

  await buildButton.click();
  await new Promise((resolve) => setTimeout(resolve, CLICK_DELAY));
  console.log("Clicked on the build button.");
  return { durationInMillis, level: oldLevel };
};

const getBuildButton = async (
  page: Page
): Promise<ElementHandle<Element> | null> => {
  const buildSelector =
    "#build .upgradeBuilding .upgradeButtonsContainer .section1";
  const buildButtonSelector = buildSelector + " .build:not(.disabled)";

  await page.waitForSelector(buildSelector);

  const buildButton = await page.$(buildButtonSelector);
  if (buildButton) {
    const buttonText = await page.evaluate(
      (button: any) => button.innerText,
      buildButton
    );
    if (buttonText.includes("Upgrade to level")) {
      return buildButton;
    }
  }

  return null;
};

const getDurationValue = async (page: Page): Promise<number> => {
  const buildTimerSelector =
    ".upgradeButtonsContainer .section1 .duration .value";

  await page.waitForSelector(buildTimerSelector);
  const durationValue = await page.$eval(buildTimerSelector, (span: any) => {
    const timeString = span.textContent.trim();
    const [hours, minutes, seconds] = timeString.split(":").map(Number);
    return (hours * 3600 + minutes * 60 + seconds) * 1000;
  });
  console.log(`Upgrade duration: ${formatTimeMillis(durationValue)}`);
  return durationValue;
};

const getLevelValue = async (page: Page): Promise<number> => {
  const contentSelector = "#content .titleInHeader .level";

  await page.waitForSelector(contentSelector);

  return await page.$eval(contentSelector, (span: any) => {
    const levelText = span.textContent.trim();
    return parseInt(levelText.replace(/\D/g, ""), 10);
  });
};
