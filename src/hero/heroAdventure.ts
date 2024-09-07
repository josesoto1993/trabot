import { Page } from "puppeteer";
import { goPage, CLICK_DELAY } from "../browser/browserService";
import { getClassOfHeroIcon, getHeroAdventures } from "./heroStatus";
import Links from "../constants/links";
import { formatDateTime } from "../utils/timePrint";
import HeroIconStatus from "../constants/heroIconStatus";
import { TaskResult } from "../index";

let lastAdventureTime: number = 0;

const goAdventure = async (
  page: Page,
  interval: number
): Promise<TaskResult> => {
  const nextExecutionTime = getNextExecutionTime(interval);
  if (nextExecutionTime > Date.now()) {
    return { nextExecutionTime, skip: true };
  }
  console.log("Enough time has passed since the last adventure, try go");

  const heroStatusClass = await getClassOfHeroIcon(page);
  const atHome = heroStatusClass === HeroIconStatus.HOME;
  if (!atHome) {
    console.log(`Hero is not at home (${heroStatusClass})`);
    updateNextAdventureTime();
    return { nextExecutionTime: getNextExecutionTime(interval), skip: true };
  }

  const heroAdventures = await getHeroAdventures(page);
  if (heroAdventures <= 0) {
    console.log(
      `There are no adventures (${heroAdventures}), until ${formatDateTime(getNextExecutionTime(interval))}`
    );
    updateNextAdventureTime();
    return { nextExecutionTime: getNextExecutionTime(interval), skip: true };
  }

  const successfullyAdventure = await performAdventure(page);
  if (successfullyAdventure) {
    updateNextAdventureTime();
  }

  return { nextExecutionTime: getNextExecutionTime(interval), skip: false };
};

const getNextExecutionTime = (interval: number): number => {
  return lastAdventureTime + interval;
};

const updateNextAdventureTime = (): void => {
  lastAdventureTime = Date.now();
};

const performAdventure = async (page: Page): Promise<boolean> => {
  try {
    await goPage(Links.TRAVIAN_HERO_ADVENTURES);
    await clickAdventureButton(page);
    return true;
  } catch (error) {
    console.error("Error during adventure:", error);
    return false;
  }
};

const clickAdventureButton = async (page: Page): Promise<void> => {
  const adventureButtonSelector =
    ".adventureList tbody tr td .textButtonV2:not(.disabled)";
  try {
    const adventureBtnTimeout = 15 * 1000;
    await page.waitForSelector(adventureButtonSelector, {
      timeout: adventureBtnTimeout,
    });
    const button = await page.$(adventureButtonSelector);
    if (button) {
      await button.click();
      await new Promise((resolve) => setTimeout(resolve, CLICK_DELAY));
      console.log("First adventure button clicked.");
    } else {
      console.log("No adventures available.");
    }
  } catch (error) {
    console.log("No adventures available.");
  }
};

export default goAdventure;
