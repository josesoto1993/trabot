const {
  getVillages,
  getNextBuildFinishAt,
} = require("../player/playerHandler");
const createOrUpdateMainBuilding = require("./createOrUpdateMainBuilding");
const upgradeResources = require("./upgradeResources");

const DEFAULT_INTERVAL = 15 * 60;

const build = async (page) => {
  const skipBuild = shouldSkipBuild();
  if (skipBuild) {
    return skipBuild;
  }

  console.log("Time to build, starting the build process...");

  await processVillagesBuild(page);

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
  let minBuildDuration = Infinity;

  for (const village of villages) {
    const villageBuildDuration = await processVillageBuild(page, village);
    if (villageBuildDuration !== null) {
      minBuildDuration = Math.min(minBuildDuration, villageBuildDuration);
    }
  }

  return minBuildDuration === Infinity ? DEFAULT_INTERVAL : minBuildDuration;
};

const processVillageBuild = async (page, village) => {
  if (village.actualFinishAt >= Date.now()) {
    return null;
  }

  const mbDuration = await createOrUpdateMainBuilding(page, village);
  const resDuration = await upgradeResources(page, village);

  return Math.min(mbDuration, resDuration);
};

module.exports = build;
