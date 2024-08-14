const BuildingTypes = require("../constants/buildingTypes");
const {
  getVillages,
  updateVillagesOverviewInfo,
  updateVillageBuildings,
} = require("../player/playerHandler");
const { formatTime } = require("../utils/timePrint");
const { goBuilding } = require("../village/goVillage");
const { CLICK_DELAY } = require("../browser/browserService");

const CELEBRATION_TIME_GAP = 4 * 60 * 60;
const TOWN_HALL = BuildingTypes["Town Hall"];

const manageCelebrations = async (page) => {
  const skipBuild = shouldSkipCelebrations();
  if (skipBuild) {
    return skipBuild;
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

const shouldSkipCelebrations = () => {
  const remainingTimes = getVillages()
    .map((village) => village.celebrationTime)
    .filter((time) => time !== null);

  const remainingTime = Math.min(...remainingTimes, Infinity);

  return remainingTime > CELEBRATION_TIME_GAP
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
    if (village.buildings.length === 0) {
      await updateVillageBuildings(page, village.id);
    }
    await processVillageCelebration(page, village);
  }
};

const processVillageCelebration = async (page, village) => {
  const villageTownHall = village.buildings.find(
    (building) => building.name === TOWN_HALL.name
  );

  if (!villageTownHall) {
    village.celebrationTime = CELEBRATION_TIME_GAP * 2;
    console.log(
      `Village ${village.name} does not need celebration as does not have town hall[!${villageTownHall}], set time to ${village.celebrationTime}`
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
  await goBuilding(village, TOWN_HALL.name);
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
    console.log("No celebration can be selected.");
    return null;
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

module.exports = manageCelebrations;
