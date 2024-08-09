const upgradeResources = require("./upgradeResources");
const { formatTime } = require("../utils/timePrint");

let lastBuildTime = 0;
let buildDuration = 0;

const build = async (page) => {
  const remainingTime = getRemainingTime();
  if (remainingTime > 0) {
    return { nextExecutionTime: remainingTime, skip: true };
  }

  console.log("Time to build resources, starting the build process...");

  buildDuration = await upgradeResources(page);

  updateNextBuildTime(buildDuration);
  return { nextExecutionTime: getRemainingTime(), skip: false };
};

const getRemainingTime = () => {
  const currentTime = Date.now();
  const timePassed = (currentTime - lastBuildTime) / 1000;
  return buildDuration - timePassed;
};

const updateNextBuildTime = (buildDuration) => {
  console.log(`Next build in ${formatTime(buildDuration)}`);
  lastBuildTime = Date.now();
};

module.exports = build;
