const { typeInSelector } = require("../browser/browserService");
const { formatTime } = require("../utils/timePrint");
const { getVillages } = require("../player/playerHandler");
const { goBuilding } = require("../village/goVillage");
const BuildingTypes = require("../constants/buildingTypes");
const TrainList = require("../constants/trainList");

const UNITS_TO_TRAIN = "999";
const MAX_TRAIN_TIME = 4 * 60 * 60;

const trainTroops = async (page) => {
  const skipBuild = shouldSkipBuild();
  if (skipBuild) {
    return skipBuild;
  }

  const villages = getVillages();

  let anyTrainPerformed = false;
  for (const train of TrainList) {
    const village = villages.find(
      (village) => village.name === train.villageName
    );
    const trainPerformed = await performTrain(page, train.unit, village);
    if (trainPerformed) {
      anyTrainPerformed = true;
    }
  }

  return {
    nextExecutionTime: getNextTrainRemaning(),
    skip: !anyTrainPerformed,
  };
};

const shouldSkipBuild = () => {
  const remainingTime = getNextTrainRemaning();
  return remainingTime > 0
    ? { nextExecutionTime: remainingTime, skip: true }
    : null;
};

const getNextTrainRemaning = () => {
  const villages = getVillages();

  const minTroopTime = Math.min(
    ...villages.map((village) => village.barracksTime),
    ...villages.map((village) => village.stableTime),
    ...villages.map((village) => village.workshop),
    ...villages.map((village) => village.hospitalTime)
  );

  return minTroopTime - MAX_TRAIN_TIME;
};

const performTrain = async (page, unit, village) => {
  try {
    await goBuilding(village, unit.building.name);
    const remainingTime = await getRemainingTime(page);

    if (remainingTime < MAX_TRAIN_TIME) {
      console.log(
        `Need to train, remaining time=${formatTime(remainingTime)} is lower than MAX_TRAIN_TIME=${formatTime(MAX_TRAIN_TIME)}`
      );
      await writeInputValueToMax(page, unit.selector);
      await submit(page);
      const finalRemainingTime = await getRemainingTime(page);
      updateVillageTroopTime(village, unit, finalRemainingTime);
    } else {
      console.log(
        `No need to train, remaining time=${formatTime(remainingTime)} is higher than MAX_TRAIN_TIME=${formatTime(MAX_TRAIN_TIME)}`
      );
    }

    return true;
  } catch (error) {
    console.log("Error during train:", error);
    return false;
  }
};

const getRemainingTime = async (page) => {
  const troopsTimeoutMillis = 5 * 1000;
  const timerSelector = "td.dur span.timer";
  try {
    await page.waitForSelector(timerSelector, {
      timeout: troopsTimeoutMillis,
    });
    const remainingTimes = await page.$$eval(timerSelector, (spans) =>
      spans.map((span) => parseInt(span.getAttribute("value"), 10))
    );
    const maxRemainingTime = Math.max(...remainingTimes);
    console.log(`Maximum remaining time: ${formatTime(maxRemainingTime)}`);
    return maxRemainingTime;
  } catch (error) {
    if (error.name === "TimeoutError") {
      console.log("No troops are currently being trained.");
      return 0;
    } else {
      console.log("Error getting remaining time:", error);
      return -1;
    }
  }
};

const writeInputValueToMax = async (page, unitSelector) => {
  const inputName = `input[name="${unitSelector}"]`;
  try {
    await page.waitForSelector(inputName);
    await typeInSelector(inputName, UNITS_TO_TRAIN);
    console.log("Input entered.");
  } catch (error) {
    console.log("Error entering value for train troops:", error);
  }
};

const submit = async (page) => {
  try {
    await page.click('button[type="submit"]');
    console.log("Train troops submitted.");
  } catch (error) {
    console.log("Error submitting train troops form:", error);
  }
};

const updateVillageTroopTime = (village, unit, finalRemainingTime) => {
  const buildingName = unit.building.name;

  if (buildingName === BuildingTypes["Barracks"].name) {
    village.barracksTime = finalRemainingTime;
  }
  if (buildingName === BuildingTypes["Stable"].name) {
    village.stableTime = finalRemainingTime;
  }
  if (buildingName === BuildingTypes["Workshop"].name) {
    village.workshopTime = workshopTime;
  }

  console.log(
    `Village status -> {barracks: ${formatTime(village.barracksTime)}, stable: ${formatTime(village.stableTime)}, workshop: ${formatTime(village.workshopTime)}}`
  );
};

module.exports = {
  trainTroops,
};
