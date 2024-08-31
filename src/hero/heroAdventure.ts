import { Page } from "puppeteer";
import { goPage, CLICK_DELAY } from "../browser/browserService";
import { getClassOfHeroIcon, getHeroAdventures } from "./heroStatus";
import { TRAVIAN_HERO_ADVENTURES } from "../constants/links";
import { formatTime } from "../utils/timePrint";
import { HeroIconStatus } from "../constants/heroIconStatus";
import { TaskResult } from "../index";

const ADVENTURE_BUTTON_SELECTOR_TIMEOUT_MILLIS: number = 15000;
const ADVENTURE_INTERVAL: number = 15 * 60;
let lastAdventureTime: number = 0;

const goAdventure = async (page: Page): Promise<TaskResult> => {
  const remainingTime = getRemainingTime();
  if (remainingTime > 0) {
    return { nextExecutionTime: remainingTime, skip: true };
  }
  console.log("Enough time has passed since the last adventure, try go");

  const heroStatusClass = await getClassOfHeroIcon(page);
  const atHome = heroStatusClass === HeroIconStatus.HOME;
  if (!atHome) {
    console.log(
      `Hero is not at home (${heroStatusClass}), await ${formatTime(ADVENTURE_INTERVAL)}`
    );
    updateNextAdventureTime();
    return { nextExecutionTime: ADVENTURE_INTERVAL, skip: true };
  }

  const heroAdventures = await getHeroAdventures(page);
  if (heroAdventures <= 0) {
    console.log(
      `There are no adventures (${heroAdventures}), await ${formatTime(ADVENTURE_INTERVAL)}`
    );
    updateNextAdventureTime();
    return { nextExecutionTime: ADVENTURE_INTERVAL, skip: true };
  }

  const successfullyAdventure = await performAdventure(page);
  if (successfullyAdventure) {
    updateNextAdventureTime();
  }

  return { nextExecutionTime: ADVENTURE_INTERVAL, skip: false };
};

const getRemainingTime = (): number => {
  const currentTime = Date.now();
  const timePassed = (currentTime - lastAdventureTime) / 1000;
  return ADVENTURE_INTERVAL - timePassed;
};

const updateNextAdventureTime = (): void => {
  lastAdventureTime = Date.now();
};

const performAdventure = async (page: Page): Promise<boolean> => {
  try {
    await goPage(TRAVIAN_HERO_ADVENTURES);
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
    await page.waitForSelector(adventureButtonSelector, {
      timeout: ADVENTURE_BUTTON_SELECTOR_TIMEOUT_MILLIS,
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
