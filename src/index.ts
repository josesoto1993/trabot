import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";

import { Page } from "puppeteer";
import { formatDateTime, formatTimeMillis } from "./utils/timePrint";
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
import { getTaskInterval, isTaskActive } from "./services/taskService";
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
  process.exit();
};

const initPlayer = async (page: Page) => {
  await updateVillages(page);
  console.log(`Player loaded: ${getPlayer()}`);
};

const mainLoop = async (page: Page) => {
  try {
    let loopNumber = 0;
    while (true) {
      loopNumber += 1;
      console.log(`\n\n\n---------------- loop ${loopNumber} ----------------`);

      const nextExecutionTime = Math.min(
        await runTaskWithTimer(TaskNames.MAP_SCANNER, (interval: number) =>
          scannerRunner(page, interval)
        ),
        await runTaskWithTimer(TaskNames.DEFICIT, (interval: number) =>
          manageDeficit(page, interval)
        ),
        await runTaskWithTimer(TaskNames.OVERFLOW, (interval: number) =>
          manageOverflow(page, interval)
        ),
        await runTaskWithTimer(TaskNames.ATTACK_FARMS, (interval: number) =>
          attackFarms(page, interval)
        ),
        await runTaskWithTimer(TaskNames.TRAIN_TROOPS, (interval: number) =>
          trainTroops(page, interval)
        ),
        await runTaskWithTimer(TaskNames.UPGRADE_TROOPS, (_: number) =>
          upgradeTroops(page)
        ),
        await runTaskWithTimer(TaskNames.GO_ADVENTURE, (interval: number) =>
          goAdventure(page, interval)
        ),
        await runTaskWithTimer(TaskNames.BUILD, (interval: number) =>
          build(page, interval)
        ),
        await runTaskWithTimer(TaskNames.REDEEM, (interval: number) =>
          redeem(page, interval)
        ),
        await runTaskWithTimer(TaskNames.CELEBRATIONS, (interval: number) =>
          manageCelebrations(page, interval)
        )
      );
      console.log(`next loop at ${formatDateTime(nextExecutionTime)}`);
      const nextLoop = Math.max(nextExecutionTime - Date.now(), 0);

      console.log(
        `\n---------------- Waiting for ${formatTimeMillis(nextLoop)} before next run ----------------`
      );
      await new Promise((resolve) => setTimeout(resolve, nextLoop));
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
  task: (interval: number) => Promise<TaskResult>
): Promise<number> => {
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
    const interval = await getTaskInterval(taskName);
    const { nextExecutionTime, skip } = await task(interval);

    const endTime = Date.now();
    const duration = endTime - startTime;

    if (!skip) {
      taskStats[taskName].totalDuration += duration;
      taskStats[taskName].count += 1;
    } else {
      console.log("task internal skip");
    }

    const averageDuration =
      taskStats[taskName].totalDuration / (taskStats[taskName].count || 1);

    console.log(
      `${taskName} ended, took ${formatTimeMillis(duration)}, next at ${formatDateTime(nextExecutionTime)}`
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
