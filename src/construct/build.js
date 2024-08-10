const {
  getVillages,
  getNextBuildFinishAt,
  updatePlayerVillageBuildFinishAt,
} = require("../player/playerHandler");
const createOrUpdateMainBuilding = require("./createOrUpdateMainBuilding");
const upgradeResources = require("./upgradeResources");
const createFundamentals = require("./createFundamentals");
const updateBuildingList = require("./updateBuildingList");
const { formatTime } = require("../utils/timePrint");
const HighPriorityBuildings = require("../constants/highPriorityBuilding");
const LowPriorityBuildings = require("../constants/lowPriorityBuilding");

const DEFAULT_INTERVAL = 15 * 60;

const build = async (page) => {
  const skipBuild = shouldSkipBuild();
  if (skipBuild) {
    return skipBuild;
  }

  console.log("Time to build, starting the build process...");

  await processVillagesBuild(page);

  console.log(
    `Build process finish, next in ${formatTime(getNextBuildFinishAt())}`
  );

  return {
    nextExecutionTime: getNextBuildFinishAt(),
    skip: false,
  };
};

const shouldSkipBuild = () => {
  const remainingTime = getNextBuildFinishAt();
  return remainingTime > 0
    ? { nextExecutionTime: remainingTime, skip: true }
    : null;
};

const processVillagesBuild = async (page) => {
  const villages = getVillages();
  for (const village of villages) {
    await processVillageBuild(page, village);
  }
};

const processVillageBuild = async (page, village) => {
  if (village.actualFinishAt >= Date.now()) {
    return;
  }

  const mainBuildingUpgraded = await createOrUpdateMainBuilding(page, village);
  if (mainBuildingUpgraded) {
    return;
  }

  const fundamentalsCreated = await createFundamentals(page, village);
  if (fundamentalsCreated) {
    return;
  }

  const resourcesUpgraded = await upgradeResources(page, village);
  if (resourcesUpgraded) {
    return;
  }

  const highUpgraded = await updateBuildingList(
    page,
    village,
    HighPriorityBuildings
  );
  if (highUpgraded) {
    return;
  }

  const lowUpgraded = await updateBuildingList(
    page,
    village,
    LowPriorityBuildings
  );
  if (lowUpgraded) {
    return;
  }

  console.log(`Nothing to update in ${village.name}`);
  await updatePlayerVillageBuildFinishAt(page, village.id, DEFAULT_INTERVAL);
};

module.exports = build;
