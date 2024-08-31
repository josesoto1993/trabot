require("dotenv").config();
const mongoose = require("mongoose");

const { formatTime, formatTimeMillis } = require("./utils/timePrint");
const { open, close } = require("./browser/browserService");
const login = require("./browser/loginService");
const attackFarms = require("./attackFarms/attackFarms");
const trainTroops = require("./troops/troopCreator");
const upgradeTroops = require("./troops/troopUpdater");
const goAdventure = require("./hero/heroAdventure");
const build = require("./construct/build");
const redeem = require("./redeemTask/redeemTask");
const manageOverflow = require("./market/manageOverflow");
const manageDeficit = require("./market/manageDeficit");
const manageCelebrations = require("./celebration/celebration");
const { updateVillages, getPlayer } = require("./player/playerHandler");
const populate = require("./populators/populator");
const TASK_NAMES = require("./constants/taskNames");
const { isActive } = require("./services/taskService");

const taskStats = {};

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("Connected to MongoDB Atlas");
    await populate();
  })
  .then(() => {
    console.log("Starting main application");
    return main();
  })
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });

const main = async () => {
  let page = await initializeBrowser();
  await login(page);
  await initPlayer(page);
  await mainLoop(page);
  await finalizeBrowser();
};

const initPlayer = async (page) => {
  await updateVillages(page);
  console.log(`Player loaded: ${getPlayer()}`);
};

const mainLoop = async (page) => {
  try {
    let loopNumber = 0;
    let nextLoop = 0;
    while (true) {
      loopNumber += 1;
      console.log(`\n\n\n---------------- loop ${loopNumber} ----------------`);

      nextLoop = Math.min(
        await runTaskWithTimer(TASK_NAMES.DEFICIT, () => manageDeficit(page)),
        await runTaskWithTimer(TASK_NAMES.OVERFLOW, () => manageOverflow(page)),
        await runTaskWithTimer(TASK_NAMES.ATTACK_FARMS, () =>
          attackFarms(page)
        ),
        await runTaskWithTimer(TASK_NAMES.TRAIN_TROOPS, () =>
          trainTroops(page)
        ),
        await runTaskWithTimer(TASK_NAMES.UPGRADE_TROOPS, () =>
          upgradeTroops(page)
        ),
        await runTaskWithTimer(TASK_NAMES.GO_ADVENTURE, () =>
          goAdventure(page)
        ),
        await runTaskWithTimer(TASK_NAMES.BUILD, () => build(page)),
        await runTaskWithTimer(TASK_NAMES.REDEEM, () => redeem(page)),
        await runTaskWithTimer(TASK_NAMES.CELEBRATIONS, () =>
          manageCelebrations(page)
        )
      );

      console.log(
        `\n---------------- Waiting for ${formatTime(nextLoop)} before next run----------------`
      );
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
  const taskStatus = await isActive(taskName);
  if (!taskStatus) {
    console.log(`\n---------------- ${taskName} skip ----------------`);
    return Infinity;
  }

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
    return 0;
  }
};
