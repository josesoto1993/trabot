import { Page } from "puppeteer";
import {
  updateVillagesOverviewInfo,
  updateVillageResources,
  updateVillageBuildings,
  getVillages,
  updatePlayerVillageBuildFinishIn,
} from "../player/playerHandler";
import upgradeResources from "./upgradeResources";
import createFundamentals from "./createFundamentals";
import updateBuildingList from "./updateBuildingList";
import { formatTimeMillis } from "../utils/timePrint";
import { getAllByPriority } from "../services/PriorityBuildingService";
import PriorityLevels from "../constants/priorityLevels";
import { TaskResult } from "../index";
import Village from "../models/village";

const build = async (page: Page, interval: number): Promise<TaskResult> => {
  const skip = shouldSkip();
  if (skip) {
    return skip;
  }

  console.log("Time to build, starting the build process...");

  await processVillagesBuild(page, interval);

  return {
    nextExecutionTime: getNextExecutionTime(),
    skip: false,
  };
};

const shouldSkip = (): TaskResult | null => {
  const nextExecutionTime = getNextExecutionTime();
  return nextExecutionTime > Date.now()
    ? { nextExecutionTime, skip: true }
    : null;
};

const getNextExecutionTime = (): number => {
  const villages = getVillages();

  const minBuildFinishAt = Math.min(
    ...villages.map((village) => village.buildFinishTime)
  );

  return minBuildFinishAt;
};

const processVillagesBuild = async (
  page: Page,
  interval: number
): Promise<void> => {
  await updateVillagesOverviewInfo(page);
  const villages = getVillages();
  for (const village of villages) {
    if (village.skipUpgrade && village.skipCreation) {
      console.log(`Skipping ${village.name} build and upgrade`);
      updatePlayerVillageBuildFinishIn(village.id, interval);
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
    await processVillageBuild(page, village, interval);
  }
};

const processVillageBuild = async (
  page: Page,
  village: Village,
  interval: number
): Promise<void> => {
  if (!village.capital && !village.skipCreation) {
    const fundamentalsCreated = await createFundamentals(page, village);
    if (fundamentalsCreated) {
      return;
    }
  }

  if (village.skipUpgrade) {
    console.log(`Skipping upgrade in ${village.name}`);
    updatePlayerVillageBuildFinishIn(village.id, interval);
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
  updatePlayerVillageBuildFinishIn(village.id, interval);
};

export default build;
