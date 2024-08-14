require("dotenv").config();

const { formatTime, formatTimeMillis } = require("./utils/timePrint");
const { open, close } = require("./browser/browserService");
const { login } = require("./browser/loginService");
const { attackFarms } = require("./attackFarms/attackFarms");
const { trainTroops } = require("./createTroops/troopCreator");
const { goAdventure } = require("./hero/heroAdventure");
const build = require("./construct/build");
const redeem = require("./redeemTask/redeemTask");
const manageOverflow = require("./market/manageOverflow");
const manageDeficit = require("./market/manageDeficit");
const manageCelebrations = require("./celebration/celebration");
const { updateVillages, getPlayer } = require("./player/playerHandler");

const taskStats = {};

const main = async () => {
  let page = await initializeBrowser();
  await login(page);
  await initPlayer(page);
  await mainLoop(page);
  await finalizeBrowser();
};

const initPlayer = async (page) => {
  await updateVillages(page);
  console.log(`Player loaded: ${getPlayer()}. Extended object:`);
};

const mainLoop = async (page) => {
  try {
    let loopNumber = 0;
    let nextLoop = 0;
    while (true) {
      loopNumber += 1;
      console.log(`\n\n\n---------------- loop ${loopNumber} ----------------`);

      nextLoop = Math.min(
        await runTaskWithTimer("Attack Farms", () => attackFarms(page)),
        await runTaskWithTimer("Train Troops", () => trainTroops(page)),
        await runTaskWithTimer("Go Adventure", () => goAdventure(page)),
        await runTaskWithTimer("Build", () => build(page)),
        await runTaskWithTimer("Redeem", () => redeem(page)),
        await runTaskWithTimer("Overflow", () => manageOverflow(page)),
        await runTaskWithTimer("Deficit", () => manageDeficit(page)),
        await runTaskWithTimer("Celebrations", () => manageCelebrations(page))
      );

      console.log(`Waiting for ${formatTime(nextLoop)} before next run...`);
      await new Promise((resolve) => setTimeout(resolve, nextLoop * 1000));
    }
  } catch (error) {
    console.error("Error in main loop:", error);
    await new Promise((resolve) => setTimeout(resolve, 10000));
  }
};

const initializeBrowser = async () => {
  try {
    return await open();
  } catch (error) {
    console.error("Error opening browser:", error);
    process.exit(1);
  }
};

const finalizeBrowser = async () => {
  try {
    return await close();
  } catch (error) {
    console.error("Error closing browser:", error);
    process.exit(1);
  }
};

const runTaskWithTimer = async (taskName, task) => {
  if (!taskStats[taskName]) {
    taskStats[taskName] = { totalDuration: 0, count: 0 };
  }

  try {
    console.log(`\n---------------- ${taskName} start ----------------`);
    const startTime = Date.now();
    const { nextExecutionTime, skip } = await task();

    const endTime = Date.now();
    const duration = endTime - startTime;

    if (!skip) {
      taskStats[taskName].totalDuration += duration;
      taskStats[taskName].count += 1;
    }

    const averageDuration =
      taskStats[taskName].totalDuration / (taskStats[taskName].count || 1);

    console.log(
      `${taskName} ended, took ${formatTimeMillis(duration)}, next in ${formatTime(nextExecutionTime)}`
    );
    console.log(
      `Average duration of ${taskName}: ${formatTimeMillis(averageDuration)} for total runs ${taskStats[taskName].count}`
    );

    return nextExecutionTime;
  } catch (error) {
    console.error(`Error during ${taskName} task:`, error);
    return { nextExecutionTime: 0, skip: true };
  }
};

main();
