import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";

import { Page } from "puppeteer";
import { formatTime, formatTimeMillis } from "./utils/timePrint";
import { open, close } from "./browser/browserService";
import login from "./browser/loginService";
import attackFarms from "./attackFarms/attackFarms";
import trainTroops from "./troops/troopCreator";
import upgradeTroops from "./troops/troopUpdater";
import goAdventure from "./hero/heroAdventure";
import build from "./construct/build";
import redeem from "./redeemTask/redeemTask";
import manageOverflow from "./market/manageOverflow";
import manageDeficit from "./market/manageDeficit";
import manageCelebrations from "./celebration/celebration";
import { updateVillages, getPlayer } from "./player/playerHandler";
import populate from "./populators/populator";
import TaskNames from "./constants/taskNames";
import { isTaskActive } from "./services/taskService";
import scannerRunner from "./mapScanner/scannerRunner";

const taskStats: Record<string, { totalDuration: number; count: number }> = {};

export interface TaskResult {
  nextExecutionTime: number;
  skip: boolean;
}

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
  const page = await initializeBrowser();
  await login(page);
  await initPlayer(page);
  await mainLoop(page);
  await finalizeBrowser();
};

const initPlayer = async (page: Page) => {
  await updateVillages(page);
  console.log(`Player loaded: ${getPlayer()}`);
};

const mainLoop = async (page: Page) => {
  try {
    let loopNumber = 0;
    let nextLoop = 0;
    while (true) {
      loopNumber += 1;
      console.log(`\n\n\n---------------- loop ${loopNumber} ----------------`);

      nextLoop = Math.min(
        await runTaskWithTimer(TaskNames.MAP_SCANNER, () =>
          scannerRunner(page)
        ),
        await runTaskWithTimer(TaskNames.DEFICIT, () => manageDeficit(page)),
        await runTaskWithTimer(TaskNames.OVERFLOW, () => manageOverflow(page)),
        await runTaskWithTimer(TaskNames.ATTACK_FARMS, () => attackFarms(page)),
        await runTaskWithTimer(TaskNames.TRAIN_TROOPS, () => trainTroops(page)),
        await runTaskWithTimer(TaskNames.UPGRADE_TROOPS, () =>
          upgradeTroops(page)
        ),
        await runTaskWithTimer(TaskNames.GO_ADVENTURE, () => goAdventure(page)),
        await runTaskWithTimer(TaskNames.BUILD, () => build(page)),
        await runTaskWithTimer(TaskNames.REDEEM, () => redeem(page)),
        await runTaskWithTimer(TaskNames.CELEBRATIONS, () =>
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

const runTaskWithTimer = async (
  taskName: TaskNames,
  task: () => Promise<TaskResult>
) => {
  const taskStatus = await isTaskActive(taskName);
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
