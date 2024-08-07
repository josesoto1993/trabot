require("dotenv").config();

const { formatTime } = require("./utils/timePrint");
const { open } = require("./browser/browserService");
const { login } = require("./browser/loginService");
const { attackFarms } = require("./attackFarms/attackFarms");
const { trainTroops } = require("./createTroops/troopCreator");
const { goAdventure } = require("./hero/heroAdventure");
const build = require("./construct/build");
const redeem = require("./redeemTask/redeemTask");
const manageOverflow = require("./market/manageOverflow");
const manageDeficit = require("./market/manageDeficit");

const main = async () => {
  let page = await initializeBrowser();
  await login(page);

  await mainLoop(page);
};

const mainLoop = async (page) => {
  try {
    let loopNumber = 0;
    let nextLoop = 0;
    while (true) {
      loopNumber += 1;
      console.log("\n\n");
      console.log(`---------------- loop ${loopNumber} ----------------`);

      nextLoop = Math.min(
        await runTaskWithTimer("Attack Farms", () => attackFarms(page)),
        await runTaskWithTimer("Train Troops", () => trainTroops(page)),
        await runTaskWithTimer("Go Adventure", () => goAdventure(page)),
        await runTaskWithTimer("Build", () => build(page)),
        await runTaskWithTimer("Redeem", () => redeem(page)),
        await runTaskWithTimer("Manage Overflow", () => manageOverflow(page)),
        await runTaskWithTimer("Manage Deficit", () => manageDeficit(page))
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

const runTaskWithTimer = async (taskName, task) => {
  const startTime = Date.now();
  try {
    const result = await task();
    return result;
  } catch (error) {
    console.error(`Error during ${taskName} task:`, error);
    return 0;
  } finally {
    const endTime = Date.now();
    const duration = endTime - startTime;
    console.log(`${taskName} ended, took ${formatTime(duration)}`);
  }
};

main();
