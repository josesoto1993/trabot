import { Page } from "puppeteer";
import { typeInSelector } from "../browser/browserService";
import { formatDateTime, formatTimeMillis } from "../utils/timePrint";
import { getVillages } from "../player/playerHandler";
import { goBuilding } from "../village/goVillage";
import { getTrainList, ITrainUnit } from "../services/trainService";
import BuildingNames from "../constants/buildingNames";
import Village from "../models/village";
import { TaskResult } from "../index";
import { IUnit } from "../services/unitService";

const UNITS_TO_TRAIN = "999";
const MAX_TRAIN_TIME = 4 * 60 * 60 * 1000;
const MIN_TRAIN_DELAY = 5 * 60 * 1000;

const trainTroops = async (page: Page): Promise<TaskResult> => {
  const trainList = await getTrainList();

  const skip = shouldSkip(trainList);
  if (skip) {
    return skip;
  }

  const villages = getVillages();

  let anyTrainPerformed = false;
  for (const train of trainList) {
    const village = villages.find((v) => v.name === train.villageName);
    if (!village) {
      continue;
    }

    const trainPerformed = await performTrain(page, train.unit, village);
    if (trainPerformed) {
      anyTrainPerformed = true;
    }
  }

  const nextExecutionTime = Math.max(
    getNextExecutionTime(trainList),
    Date.now() + MIN_TRAIN_DELAY
  );
  return {
    nextExecutionTime,
    skip: !anyTrainPerformed,
  };
};

const shouldSkip = (trainList: ITrainUnit[]): TaskResult | null => {
  const nextExecutionTime = getNextExecutionTime(trainList);
  return nextExecutionTime > Date.now()
    ? { nextExecutionTime, skip: true }
    : null;
};

const getNextExecutionTime = (trainList: ITrainUnit[]): number => {
  const villages = getVillages();

  const minTroopTime = villages.reduce((minTime: number, village: Village) => {
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

  return minTroopTime;
};

const performTrain = async (
  page: Page,
  unit: IUnit,
  village: Village
): Promise<boolean> => {
  try {
    await goBuilding(village, unit.building.name);
    const remainingTime = await getRemainingTime(page);

    if (remainingTime < MAX_TRAIN_TIME) {
      console.log(
        `Need to train [${village.name} / ${unit.name}], remaining time=${formatTimeMillis(remainingTime)} is lower than MAX_TRAIN_TIME=${formatTimeMillis(MAX_TRAIN_TIME)}`
      );
      await writeInputValueToMax(page, unit.selector);
      await submit(page);
      const finalRemainingTime = await getRemainingTime(page);
      updateVillageTroopTime(village, unit, finalRemainingTime);
    } else {
      console.log(
        `No need to train [${village.name} / ${unit.name}], remaining time=${formatTimeMillis(remainingTime)} is higher than MAX_TRAIN_TIME=${formatTimeMillis(MAX_TRAIN_TIME)}`
      );
      updateVillageTroopTime(village, unit, remainingTime);
    }

    return true;
  } catch (error) {
    console.log("Error during train:", error);
    return false;
  }
};

const getRemainingTime = async (page: Page): Promise<number> => {
  const troopsTimeoutMillis = 3 * 1000;
  const timerSelector = "td.dur span.timer";
  try {
    await page.waitForSelector(timerSelector, {
      timeout: troopsTimeoutMillis,
    });
    const remainingTimes = await page.$$eval(timerSelector, (spans) =>
      spans.map((span) => parseInt(span.getAttribute("value") || "0", 10))
    );
    const maxRemainingTime = Math.max(...remainingTimes) * 1000;
    console.log(
      `Maximum remaining time: ${formatTimeMillis(maxRemainingTime)}`
    );
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

const writeInputValueToMax = async (
  page: Page,
  unitSelector: string
): Promise<void> => {
  const inputName = `input[name="${unitSelector}"]`;
  try {
    await page.waitForSelector(inputName);
    await typeInSelector(inputName, UNITS_TO_TRAIN);
    console.log("Input entered.");
  } catch (error) {
    console.log("Error entering value for train troops:", error);
  }
};

const submit = async (page: Page): Promise<void> => {
  try {
    await page.click('button[type="submit"]');
    console.log("Train troops submitted.");
  } catch (error) {
    console.log("Error submitting train troops form:", error);
  }
};

const updateVillageTroopTime = (
  village: Village,
  unit: IUnit,
  durationInMillis: number
): void => {
  const buildingName = unit.building.name;
  const finishTime = durationInMillis * 1000 + Date.now();

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
    `Village ${village.name} / ${unit.name} -> will finish ${formatDateTime(finishTime)}`
  );
};

export default trainTroops;
