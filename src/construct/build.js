const {
  updateVillages,
  getVillages,
  getNextBuildFinishAt,
  updatePlayerVillageBuildFinishAt,
} = require("../player/playerHandler");
const upgradeResources = require("./upgradeResources");
const createFundamentals = require("./createFundamentals");
const updateBuildingList = require("./updateBuildingList");
const { formatTime } = require("../utils/timePrint");
const HighPriorityBuildings = require("../constants/highPriorityBuilding");
const MidPriorityBuildings = require("../constants/midPriorityBuilding");
const LowPriorityBuildings = require("../constants/lowPriorityBuilding");

const DEFAULT_INTERVAL = 15 * 60;
let totalBuilds = 0;

const build = async (page) => {
  const skipBuild = shouldSkipBuild();
  if (skipBuild) {
    return skipBuild;
  }

  console.log("Time to build, starting the build process...");

  await updateVillages(page); // TODO: its better if we just look for the one we are interested in
  await processVillagesBuild(page);

  console.log(
    `Build process finish, next in ${formatTime(getNextBuildFinishAt())}, total builds: ${totalBuilds}`
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

  if (!village.capital) {
    const fundamentalsCreated = await createFundamentals(page, village);
    if (fundamentalsCreated) {
      totalBuilds += 1;
      return;
    }
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
  await updatePlayerVillageBuildFinishAt(page, village.id, DEFAULT_INTERVAL);
};

module.exports = build;
