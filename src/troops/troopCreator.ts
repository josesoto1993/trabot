const { typeInSelector } = require("../browser/browserService");
const { formatTime, formatDateTime } = require("../utils/timePrint");
const { getVillages } = require("../player/playerHandler");
const { goBuilding } = require("../village/goVillage");
const { getTrainList } = require("../services/trainService");
import { BuildingNames } from "../constants/buildingNames";

const UNITS_TO_TRAIN = "999";
const MAX_TRAIN_TIME = 4 * 60 * 60;
const MIN_TRAIN_DELAY = 5 * 60;

const trainTroops = async (page) => {
  const trainList = await getTrainList();

  const skip = shouldSkip(trainList);
  if (skip) {
    return skip;
  }

  const villages = getVillages();

  let anyTrainPerformed = false;
  for (const train of trainList) {
    const village = villages.find(
      (village) => village.name === train.villageName
    );
    const trainPerformed = await performTrain(page, train.unit, village);
    if (trainPerformed) {
      anyTrainPerformed = true;
    }
  }

  const nextExecutionTime = Math.max(
    getNextTrainRemaining(trainList),
    MIN_TRAIN_DELAY
  );

  return {
    nextExecutionTime: nextExecutionTime,
    skip: !anyTrainPerformed,
  };
};

const shouldSkip = (trainList) => {
  const remainingTime = getNextTrainRemaining(trainList);
  return remainingTime > 0
    ? { nextExecutionTime: remainingTime, skip: true }
    : null;
};

const getNextTrainRemaining = (trainList) => {
  const villages = getVillages();

  const minTroopTime = villages.reduce((minTime, village) => {
    for (const train of trainList) {
      if (village.name === train.villageName) {
        const buildingName = train.unit.building.name;

        if (buildingName === BuildingNames.BARRACKS) {
          minTime = Math.min(minTime, village.barracksTime);
        }
        if (buildingName === BuildingNames.STABLE) {
          minTime = Math.min(minTime, village.stableTime);
        }
        if (buildingName === BuildingNames.WORKSHOP) {
          minTime = Math.min(minTime, village.workshopTime);
        }
      }
    }
    return minTime;
  }, Infinity);
  return minTroopTime - Date.now() / 1000 - MAX_TRAIN_TIME;
};

const performTrain = async (page, unit, village) => {
  try {
    await goBuilding(village, unit.building.name);
    const remainingTime = await getRemainingTime(page);

    if (remainingTime < MAX_TRAIN_TIME) {
      console.log(
        `Need to train [${village.name} / ${unit.name}], remaining time=${formatTime(remainingTime)} is lower than MAX_TRAIN_TIME=${formatTime(MAX_TRAIN_TIME)}`
      );
      await writeInputValueToMax(page, unit.selector);
      await submit(page);
      const finalRemainingTime = await getRemainingTime(page);
      updateVillageTroopTime(village, unit, finalRemainingTime);
    } else {
      console.log(
        `No need to train [${village.name} / ${unit.name}], remaining time=${formatTime(remainingTime)} is higher than MAX_TRAIN_TIME=${formatTime(MAX_TRAIN_TIME)}`
      );
      updateVillageTroopTime(village, unit, remainingTime);
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
  const finishTime = finalRemainingTime + Date.now() / 1000;

  if (buildingName === BuildingNames.BARRACKS) {
    village.barracksTime = finishTime;
  }
  if (buildingName === BuildingNames.STABLE) {
    village.stableTime = finishTime;
  }
  if (buildingName === BuildingNames.WORKSHOP) {
    village.workshopTime = finishTime;
  }

  console.log(
    `Village ${village.name} / ${unit.name} -> duration ${formatTime(finalRemainingTime)} will finish ${formatDateTime(finishTime)}`
  );
};

module.exports = trainTroops;
