import { ElementHandle, Page } from "puppeteer";
import { URL } from "url";
import { goPage, CLICK_DELAY } from "../browser/browserService";
import Link from "../constants/links";
import {
  updatePlayerBuilding,
  updatePlayerField,
  updatePlayerVillageBuildFinishAt,
} from "../player/playerHandler";
import { IBuildingType } from "../services/buildingTypeService";

interface UpgradeResult {
  duration: number | null;
  level: number | null;
}

export const upgradeExistingBuilding = async (
  page: Page,
  villageId: string,
  slotId: number,
  buildingType: IBuildingType
): Promise<number | null> => {
  await selectBuilding(villageId, slotId);
  const { duration, level } = await upgradeSelectedBuilding(page);
  if (!duration) {
    return null;
  }

  updatePlayerBuilding(villageId, slotId, buildingType, level + 1);
  updatePlayerVillageBuildFinishAt(villageId, duration);
  return duration;
};

export const upgradeExistingField = async (
  page: Page,
  villageId: string,
  slotId: number
): Promise<number | null> => {
  await selectBuilding(villageId, slotId);
  const { duration, level } = await upgradeSelectedBuilding(page);
  if (!duration) {
    return null;
  }

  updatePlayerField(villageId, slotId, level + 1);
  updatePlayerVillageBuildFinishAt(villageId, duration);
  return duration;
};

const selectBuilding = async (
  villageId: string,
  slotId: number
): Promise<void> => {
  const villageUrl = new URL(Link.TRAVIAN_BUILD_VIEW);
  villageUrl.searchParams.append("newdid", villageId);
  villageUrl.searchParams.append("id", slotId.toString());
  await goPage(villageUrl);

  console.log(`Clicked on city with id ${villageId} building ${slotId}`);
};

const upgradeSelectedBuilding = async (page: Page): Promise<UpgradeResult> => {
  const buildButton = await getBuildButton(page);
  if (!buildButton) {
    console.log("No build button found.");
    return { duration: null, level: null };
  }

  const durationValue = await getDurationValue(page);
  const oldLevel = await getLevelValue(page);

  await buildButton.click();
  await new Promise((resolve) => setTimeout(resolve, CLICK_DELAY));
  console.log("Clicked on the build button.");
  return { duration: durationValue, level: oldLevel };
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
    return hours * 3600 + minutes * 60 + seconds;
  });
  console.log(`Upgrade duration: ${durationValue}`);
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
