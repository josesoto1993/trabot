const buildResources = require("./buildResources");
const { formatTime } = require("../utils/timePrintService");

const BUILD_INTERVAL = 5 * 60;

let lastBuildTime = 0;

const build = async (page) => {
  const remainingTime = getRemainingTime();
  if (remainingTime > 0) {
    return remainingTime;
  }

  console.log("Time to build resources, starting the build process...");

  await buildResources(page);

  updateNextBuildTime();
  return getRemainingTime();
};

const getRemainingTime = () => {
  const currentTime = Date.now();
  const timePassed = (currentTime - lastBuildTime) / 1000;
  return BUILD_INTERVAL - timePassed;
};

const updateNextBuildTime = () => {
  console.log(`Next build in ${formatTime(BUILD_INTERVAL)}`);
  lastBuildTime = Date.now();
};

module.exports = build;
