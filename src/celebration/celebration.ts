import { ElementHandle, Page } from "puppeteer";
import { formatTime } from "../utils/timePrint";
import { goBuilding } from "../village/goVillage";
import { CLICK_DELAY } from "../browser/browserService";
import BuildingNames from "../constants/buildingNames";
import {
  getVillages,
  updateVillagesOverviewInfo,
} from "../player/playerHandler";
import { TaskResult } from "../index";
import Village from "../models/village";

const CELEBRATION_TIME_GAP = 4 * 60 * 60;
const AWAIT_MORE_RESOURCES_TIME = 15 * 60;

interface CelebrationButton {
  button: ElementHandle<HTMLButtonElement>;
  celebrationTime: number | null;
  exist: boolean;
}

const manageCelebrations = async (page: Page): Promise<TaskResult> => {
  const skip = shouldSkip();
  if (skip) {
    return skip;
  }

  console.log("Time to start celebrations process...");

  await processVillagesCelebration(page);

  const nextExecutionTime = getNextCelebrationFinishAt() - CELEBRATION_TIME_GAP;

  console.log(
    `Celebration process finished, next in ${formatTime(nextExecutionTime)}`
  );

  return {
    nextExecutionTime,
    skip: false,
  };
};

const shouldSkip = (): TaskResult | null => {
  const remainingTimes = getVillages()
    .map((village) => village.celebrationTime)
    .filter((time): time is number => time !== null);

  const remainingTime =
    Math.min(...remainingTimes, Infinity) - CELEBRATION_TIME_GAP;

  return remainingTime > 0
    ? { nextExecutionTime: remainingTime, skip: true }
    : null;
};

const getNextCelebrationFinishAt = (): number => {
  const minCelebrationFinishAt = Math.min(
    ...getVillages().map((village) => village.celebrationTime || Infinity)
  );

  return minCelebrationFinishAt;
};

const processVillagesCelebration = async (page: Page) => {
  await updateVillagesOverviewInfo(page);
  const villages = getVillages();
  for (const village of villages) {
    if (
      village.celebrationTime !== null &&
      village.celebrationTime > CELEBRATION_TIME_GAP
    ) {
      console.log(
        `Village ${village.name} does not need celebration, remaining time ${formatTime(village.celebrationTime)} > desired ${formatTime(CELEBRATION_TIME_GAP)} `
      );
      continue;
    }
    await processVillageCelebration(page, village);
  }
};

const processVillageCelebration = async (page: Page, village: Village) => {
  const villageTownHall = village.buildings.find(
    (building) => building.name === BuildingNames.TOWN_HALL
  );

  if (!villageTownHall) {
    village.celebrationTime = CELEBRATION_TIME_GAP * 2;
    console.log(
      `Village ${village.name} does not need celebration as it does not have a town hall, set time to ${village.celebrationTime}`
    );
    return;
  }

  const celebrationTime = await celebrate(page, village);
  if (!celebrationTime) {
    village.celebrationTime = CELEBRATION_TIME_GAP + AWAIT_MORE_RESOURCES_TIME;
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
    return greatCelebration.celebrationTime;
  } else if (
    smallCelebration.exist &&
    smallCelebration.button &&
    !greatCelebration.exist
  ) {
    await smallCelebration.button.click();
    console.log("Small celebration selected.");
    await new Promise((resolve) => setTimeout(resolve, CLICK_DELAY));
    return smallCelebration.celebrationTime;
  } else {
    const remainingTime = await getRemainingCelebrationTime(page);
    console.log(
      `No celebration can be selected. Keep remainingTime ${formatTime(remainingTime)}`
    );
    return remainingTime;
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
  return hours * 3600 + minutes * 60 + seconds;
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

  return isNaN(duration) ? null : duration;
};

export default manageCelebrations;
