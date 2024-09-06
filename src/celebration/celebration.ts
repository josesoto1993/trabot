import { ElementHandle, Page } from "puppeteer";
import { formatTime, formatTimeMillis } from "../utils/timePrint";
import { goBuilding } from "../village/goVillage";
import { CLICK_DELAY } from "../browser/browserService";
import BuildingNames from "../constants/buildingNames";
import {
  getVillages,
  updateVillagesOverviewInfo,
} from "../player/playerHandler";
import { TaskResult } from "../index";
import Village from "../models/village";

const AWAIT_MORE_RESOURCES_TIME = 15 * 60 * 1000;

interface CelebrationButton {
  button: ElementHandle<HTMLButtonElement>;
  celebrationTime: number | null;
  exist: boolean;
}

const manageCelebrations = async (
  page: Page,
  interval: number
): Promise<TaskResult> => {
  const skip = shouldSkip(interval);
  if (skip) {
    return skip;
  }

  console.log("Time to start celebrations process...");

  await processVillagesCelebration(page, interval);

  const nextExecutionTime = getNextExecutionTime(interval);

  return {
    nextExecutionTime,
    skip: false,
  };
};

const shouldSkip = (interval: number): TaskResult | null => {
  const nextExecutionTime = getNextExecutionTime(interval);

  return nextExecutionTime > Date.now()
    ? { nextExecutionTime, skip: true }
    : null;
};

const getNextExecutionTime = (interval: number): number => {
  const minCelebrationFinishAt = Math.min(
    ...getVillages().map((village) => village.celebrationTime || Infinity)
  );

  return minCelebrationFinishAt - interval;
};

const processVillagesCelebration = async (page: Page, interval: number) => {
  await updateVillagesOverviewInfo(page);
  const villages = getVillages();
  for (const village of villages) {
    if (
      village.celebrationTime !== null &&
      village.celebrationTime > Date.now() + interval
    ) {
      console.log(
        `Village ${village.name} does not need celebration, remaining time ${formatTimeMillis(village.celebrationTime - Date.now())} > desired ${formatTime(interval)} `
      );
      continue;
    }
    await processVillageCelebration(page, village, interval);
  }
};

const processVillageCelebration = async (
  page: Page,
  village: Village,
  interval: number
) => {
  const villageTownHall = village.buildings.find(
    (building) => building.name === BuildingNames.TOWN_HALL
  );

  if (!villageTownHall) {
    village.celebrationTime = Date.now() + interval * 2;
    console.log(
      `Village ${village.name} does not need celebration as it does not have a town hall, set time to ${village.celebrationTime}`
    );
    return;
  }

  const celebrationTime = await celebrate(page, village);
  if (!celebrationTime) {
    village.celebrationTime = Date.now() + interval + AWAIT_MORE_RESOURCES_TIME;
    console.log(
      `Set await resources celebration time ${village.celebrationTime} on ${village.name}`
    );
    return;
  }

  village.celebrationTime = celebrationTime;
};

const celebrate = async (
  page: Page,
  village: Village
): Promise<number | null> => {
  console.log(`Celebrate village ${village.name}`);
  await goBuilding(village, BuildingNames.TOWN_HALL);
  return await selectCelebration(page);
};

const selectCelebration = async (page: Page): Promise<number | null> => {
  const { smallCelebration, greatCelebration } = await getValidButtons(page);

  if (greatCelebration.exist && greatCelebration.button) {
    await greatCelebration.button.click();
    console.log("Great celebration selected.");
    await new Promise((resolve) => setTimeout(resolve, CLICK_DELAY));
    return greatCelebration.celebrationTime + Date.now();
  } else if (
    smallCelebration.exist &&
    smallCelebration.button &&
    !greatCelebration.exist
  ) {
    await smallCelebration.button.click();
    console.log("Small celebration selected.");
    await new Promise((resolve) => setTimeout(resolve, CLICK_DELAY));
    return smallCelebration.celebrationTime + Date.now();
  } else {
    const remainingTime = await getRemainingCelebrationTime(page);
    console.log(
      `No celebration can be selected. Keep remainingTime ${formatTime(remainingTime)}`
    );
    return remainingTime + Date.now();
  }
};

const getValidButtons = async (
  page: Page
): Promise<{
  smallCelebration: CelebrationButton;
  greatCelebration: CelebrationButton;
}> => {
  const researchSections = await page.$$("div.researches div.research");

  let smallCelebration: CelebrationButton = {
    button: null,
    celebrationTime: null,
    exist: false,
  };
  let greatCelebration: CelebrationButton = {
    button: null,
    celebrationTime: null,
    exist: false,
  };

  for (const researchSection of researchSections) {
    const titleElement = await researchSection.$("div.information div.title a");

    if (titleElement) {
      const titleText = await page.evaluate(
        (el) => el.textContent.trim(),
        titleElement
      );

      const button = await getValidButton(page, researchSection);
      const celebrationTime = await getCelebrationTime(page, researchSection);

      if (titleText === "Small celebration") {
        smallCelebration = {
          button,
          celebrationTime,
          exist: true,
        };
      } else if (titleText === "Great celebration") {
        greatCelebration = {
          button,
          celebrationTime,
          exist: true,
        };
      }
    }
  }

  return { smallCelebration, greatCelebration };
};

const getValidButton = async (
  page: Page,
  researchSection: ElementHandle<Element>
): Promise<ElementHandle<HTMLButtonElement>> => {
  const button = await researchSection.$("div.information div.cta button");
  if (!button) {
    return null;
  }

  const isValidButton = await page.evaluate(
    (btn) =>
      !btn.classList.contains("gold") && !btn.classList.contains("disabled"),
    button
  );
  if (!isValidButton) {
    return null;
  }

  return button;
};

const getCelebrationTime = async (
  page: Page,
  researchSection: ElementHandle<Element>
): Promise<number> => {
  const durationElement = await researchSection.$(
    "div.cta div.duration span.value"
  );
  const durationText = await page.evaluate(
    (el) => el.textContent.trim(),
    durationElement
  );
  const [hours, minutes, seconds] = durationText.split(":").map(Number);
  return (hours * 3600 + minutes * 60 + seconds) * 1000;
};

const getRemainingCelebrationTime = async (
  page: Page
): Promise<number | null> => {
  const durationElement = await page.$("table tbody tr td.dur span.timer");

  if (!durationElement) {
    return null;
  }

  const duration = await page.evaluate(
    (el) => parseInt(el.getAttribute("value") || "0", 10),
    durationElement
  );

  return isNaN(duration) ? null : duration * 1000;
};

export default manageCelebrations;
