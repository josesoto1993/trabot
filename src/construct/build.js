const upgradeResources = require("./upgradeResources");
const { formatTime } = require("../utils/timePrint");
const upgradeMainBuildings = require("./upgradeMainBuildings");

let lastBuildTime = 0;
let buildDuration = 0;

const build = async (page) => {
  const remainingTime = getRemainingTime();
  if (remainingTime > 0) {
    return { nextExecutionTime: remainingTime, skip: true };
  }

  console.log("Time to build, starting the build process...");

  const mbDuration = await upgradeMainBuildings(page);
  const resDuration = await upgradeResources(page);

  buildDuration = Math.min(mbDuration, resDuration);

  updateNextBuildTime(buildDuration);
  return { nextExecutionTime: getRemainingTime(buildDuration), skip: false };
};

const getRemainingTime = (buildDuration) => {
  const currentTime = Date.now();
  const timePassed = (currentTime - lastBuildTime) / 1000;
  return buildDuration - timePassed;
};

const updateNextBuildTime = (buildDuration) => {
  console.log(`Next build in ${formatTime(buildDuration)}`);
  lastBuildTime = Date.now();
};

module.exports = build;
