const {
  getVillages,
  updateVillagesOverviewInfo,
} = require("../player/playerHandler");
const { formatTime } = require("../utils/timePrint");
const { goBuilding } = require("../village/goVillage");
const { CLICK_DELAY } = require("../browser/browserService");
const BUILDING_NAMES = require("../constants/buildingNames");

const CELEBRATION_TIME_GAP = 4 * 60 * 60;

const manageCelebrations = async (page) => {
  const skip = shouldSkip();
  if (skip) {
    return skip;
  }

  console.log("Time to start celebrations process...");

  await processVillagesCelebration(page);

  const nextExecutionTime = getNextCelebrationFinishAt() - CELEBRATION_TIME_GAP;

  console.log(
    `Celebration process finish, next in ${formatTime(nextExecutionTime)}`
  );

  return {
    nextExecutionTime: nextExecutionTime,
    skip: false,
  };
};

const shouldSkip = () => {
  const remainingTimes = getVillages()
    .map((village) => village.celebrationTime)
    .filter((time) => time !== null);

  const remainingTime =
    Math.min(...remainingTimes, Infinity) - CELEBRATION_TIME_GAP;

  return remainingTime > 0
    ? { nextExecutionTime: remainingTime, skip: true }
    : null;
};

const getNextCelebrationFinishAt = () => {
  const minCelebrationFinishAt = Math.min(
    ...getVillages().map((village) => village.celebrationTime)
  );

  return minCelebrationFinishAt;
};

const processVillagesCelebration = async (page) => {
  await updateVillagesOverviewInfo(page);
  const villages = getVillages();
  for (const village of villages) {
    if (
      village.celebrationTime !== null &&
      village.celebrationTime > CELEBRATION_TIME_GAP
    ) {
      console.log(
        `Village ${village.name} does not need celebration, remaning time ${formatTime(village.celebrationTime)} > desired ${formatTime(CELEBRATION_TIME_GAP)} `
      );
      continue;
    }
    await processVillageCelebration(page, village);
  }
};

const processVillageCelebration = async (page, village) => {
  const villageTownHall = village.buildings.find(
    (building) => building.name === BUILDING_NAMES.TOWN_HALL
  );

  if (!villageTownHall) {
    village.celebrationTime = CELEBRATION_TIME_GAP * 2;
    console.log(
      `Village ${village.name} does not need celebration as does not have town hall, set time to ${village.celebrationTime}`
    );
    return;
  }

  const celebrationTime = await celebrate(page, village);
  if (!celebrationTime) {
    const awaitMoreResourcesTime = CELEBRATION_TIME_GAP + 15 * 60;
    village.celebrationTime = awaitMoreResourcesTime;
    console.log(
      `Set await resources celebration time ${village.celebrationTime} on ${village.name}`
    );
    return;
  }

  village.celebrationTime = celebrationTime;
};

const celebrate = async (page, village) => {
  console.log(`celebrate village ${village.name}`);
  await goBuilding(village, BUILDING_NAMES.TOWN_HALL);
  return await selectCelebration(page);
};

const selectCelebration = async (page) => {
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

const getValidButtons = async (page) => {
  const researchSections = await page.$$("div.researches div.research");

  let smallCelebration = { button: null, celebrationTime: null, exist: false };
  let greatCelebration = { button: null, celebrationTime: null, exist: false };

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

const getValidButton = async (page, researchSection) => {
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

const getCelebrationTime = async (page, researchSection) => {
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

const getRemainingCelebrationTime = async (page) => {
  const durationElement = await page.$("table tbody tr td.dur span.timer");

  if (!durationElement) {
    return null;
  }

  const duration = await page.evaluate(
    (el) => parseInt(el.getAttribute("value")),
    durationElement
  );

  return isNaN(duration) ? null : duration;
};

module.exports = manageCelebrations;
