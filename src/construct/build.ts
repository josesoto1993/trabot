import { Page } from "puppeteer";
import {
  updateVillagesOverviewInfo,
  updateVillageResources,
  updateVillageBuildings,
  getVillages,
  updatePlayerVillageBuildFinishAt,
} from "../player/playerHandler";
import upgradeResources from "./upgradeResources";
import createFundamentals from "./createFundamentals";
import updateBuildingList from "./updateBuildingList";
import { formatTime, formatTimeMillis } from "../utils/timePrint";
import { getAllByPriority } from "../services/PriorityBuildingService";
import PriorityLevels from "../constants/priorityLevels";
import { TaskResult } from "../index";
import Village from "../models/village";

const DEFAULT_INTERVAL = 15 * 60;

const build = async (page: Page): Promise<TaskResult> => {
  const skip = shouldSkip();
  if (skip) {
    return skip;
  }

  console.log("Time to build, starting the build process...");

  await processVillagesBuild(page);

  console.log(
    `Build process finished, next in ${formatTime(getNextBuildFinishAt())}`
  );

  return {
    nextExecutionTime: getNextBuildFinishAt(),
    skip: false,
  };
};

const shouldSkip = (): TaskResult | null => {
  const remainingTime = getNextBuildFinishAt();
  return remainingTime > 0
    ? { nextExecutionTime: remainingTime, skip: true }
    : null;
};

const getNextBuildFinishAt = (): number => {
  const currentTime = Date.now();
  const villages = getVillages();

  const minBuildFinishAt = Math.min(
    ...villages.map((village) => village.buildFinishTime)
  );

  return (minBuildFinishAt - currentTime) / 1000;
};

const processVillagesBuild = async (page: Page): Promise<void> => {
  await updateVillagesOverviewInfo(page);
  const villages = getVillages();
  for (const village of villages) {
    if (village.skipUpgrade && village.skipCreation) {
      console.log(`Skipping ${village.name} build and upgrade`);
      updatePlayerVillageBuildFinishAt(village.id, DEFAULT_INTERVAL * 10);
      continue;
    }

    if (village.buildFinishTime >= Date.now()) {
      console.log(
        `Skipping village ${village.name}, next build try: ${formatTimeMillis(village.buildFinishTime - Date.now())}`
      );
      continue;
    }

    await updateVillageResources(page, village.id);
    await updateVillageBuildings(page, village.id);
    await processVillageBuild(page, village);
  }
};

const processVillageBuild = async (
  page: Page,
  village: Village
): Promise<void> => {
  if (!village.capital && !village.skipCreation) {
    const fundamentalsCreated = await createFundamentals(page, village);
    if (fundamentalsCreated) {
      return;
    }
  }

  if (village.skipUpgrade) {
    console.log(`Skipping upgrade in ${village.name}`);
    updatePlayerVillageBuildFinishAt(village.id, DEFAULT_INTERVAL);
    return;
  }

  const highPriorityBuilding = await getAllByPriority(PriorityLevels.HIGH);
  const highUpgraded = await updateBuildingList(
    page,
    village,
    highPriorityBuilding,
    PriorityLevels.HIGH
  );
  if (highUpgraded) {
    return;
  }

  const resourcesUpgraded = await upgradeResources(page, village);
  if (resourcesUpgraded) {
    return;
  }

  const midPriorityBuilding = await getAllByPriority(PriorityLevels.MID);
  const midUpgraded = await updateBuildingList(
    page,
    village,
    midPriorityBuilding,
    PriorityLevels.MID
  );
  if (midUpgraded) {
    return;
  }

  const lowPriorityBuilding = await getAllByPriority(PriorityLevels.LOW);
  const lowUpgraded = await updateBuildingList(
    page,
    village,
    lowPriorityBuilding,
    PriorityLevels.LOW
  );
  if (lowUpgraded) {
    return;
  }

  console.log(`Nothing to update in ${village.name}`);
  updatePlayerVillageBuildFinishAt(village.id, DEFAULT_INTERVAL);
};

export default build;
