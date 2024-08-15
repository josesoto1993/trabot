const {
  updateVillagesOverviewInfo,
  updateVillageResources,
  updateVillageBuildings,
  getVillages,
  updatePlayerVillageBuildFinishAt,
} = require("../player/playerHandler");
const upgradeResources = require("./upgradeResources");
const createFundamentals = require("./createFundamentals");
const updateBuildingList = require("./updateBuildingList");
const { formatTime, formatTimeMillis } = require("../utils/timePrint");
const HighPriorityBuildings = require("../constants/highPriorityBuilding");
const MidPriorityBuildings = require("../constants/midPriorityBuilding");
const LowPriorityBuildings = require("../constants/lowPriorityBuilding");
const { SkipCreation, SkipUpgrade } = require("../constants/skipBuild");

const DEFAULT_INTERVAL = 15 * 60;
let totalBuilds = 0;

const build = async (page) => {
  const skip = shouldSkip();
  if (skip) {
    return skip;
  }

  console.log("Time to build, starting the build process...");

  await processVillagesBuild(page);

  console.log(
    `Build process finish, next in ${formatTime(getNextBuildFinishAt())}, total builds: ${totalBuilds}`
  );

  return {
    nextExecutionTime: getNextBuildFinishAt(),
    skip: false,
  };
};

const shouldSkip = () => {
  const remainingTime = getNextBuildFinishAt();
  return remainingTime > 0
    ? { nextExecutionTime: remainingTime, skip: true }
    : null;
};

const getNextBuildFinishAt = () => {
  const currentTime = Date.now();
  const villages = getVillages();

  const minBuildFinishAt = Math.min(
    ...villages.map((village) => village.buildFinishAt)
  );

  return (minBuildFinishAt - currentTime) / 1000;
};

const processVillagesBuild = async (page) => {
  await updateVillagesOverviewInfo(page);
  const villages = getVillages();
  for (const village of villages) {
    if (
      SkipUpgrade.includes(village.name) &&
      SkipCreation.includes(village.name)
    ) {
      console.log(`Skip ${village.name} build and upgrade`);
      updatePlayerVillageBuildFinishAt(village.id, DEFAULT_INTERVAL * 999);
      continue;
    }

    if (village.buildFinishAt >= Date.now()) {
      console.log(
        `skip village ${village.name}, next build try: ${formatTimeMillis(village.buildFinishAt - Date.now())}`
      );
      continue;
    }
    await updateVillageResources(page, village.id);
    await updateVillageBuildings(page, village.id);
    await processVillageBuild(page, village);
  }
};

const processVillageBuild = async (page, village) => {
  if (!village.capital && !SkipCreation.includes(village.name)) {
    const fundamentalsCreated = await createFundamentals(page, village);
    if (fundamentalsCreated) {
      totalBuilds += 1;
      return;
    }
  }

  if (SkipUpgrade.includes(village.name)) {
    console.log(`Nothing to update in ${village.name}`);
    updatePlayerVillageBuildFinishAt(village.id, DEFAULT_INTERVAL);
    return;
  }

  const highUpgraded = await updateBuildingList(
    page,
    village,
    HighPriorityBuildings,
    "high"
  );
  if (highUpgraded) {
    totalBuilds += 1;
    return;
  }

  const resourcesUpgraded = await upgradeResources(page, village);
  if (resourcesUpgraded) {
    totalBuilds += 1;
    return;
  }

  const midUpgraded = await updateBuildingList(
    page,
    village,
    MidPriorityBuildings,
    "mid"
  );
  if (midUpgraded) {
    totalBuilds += 1;
    return;
  }

  const lowUpgraded = await updateBuildingList(
    page,
    village,
    LowPriorityBuildings,
    "low"
  );
  if (lowUpgraded) {
    totalBuilds += 1;
    return;
  }

  console.log(`Nothing to update in ${village.name}`);
  updatePlayerVillageBuildFinishAt(village.id, DEFAULT_INTERVAL);
};

module.exports = build;
