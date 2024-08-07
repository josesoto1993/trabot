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
    let nextLoop = 0;
    while (true) {
      nextLoop = Math.min(
        await runAttackFarms(page),
        await runTrainTroops(page),
        await runGoAdventure(page),
        await runBuild(page),
        await runRedeem(page),
        await runManageOverflow(page),
        await runManageDeficit(page)
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

const runAttackFarms = async (page) => {
  try {
    return await attackFarms(page);
  } catch (error) {
    console.error("Error during attack task:", error);
    return 0;
  }
};

const runTrainTroops = async (page) => {
  try {
    return await trainTroops(page);
  } catch (error) {
    console.error("Error during train task:", error);
    return 0;
  }
};

const runGoAdventure = async (page) => {
  try {
    return await goAdventure(page);
  } catch (error) {
    console.error("Error during adventure task:", error);
    return 0;
  }
};

const runBuild = async (page) => {
  try {
    return await build(page);
  } catch (error) {
    console.error("Error during build task:", error);
    return 0;
  }
};

const runRedeem = async (page) => {
  try {
    return await redeem(page);
  } catch (error) {
    console.error("Error during redeemTask task:", error);
    return 0;
  }
};

const runManageOverflow = async (page) => {
  try {
    return await manageOverflow(page);
  } catch (error) {
    console.error("Error during manageOverflow task:", error);
    return 0;
  }
};

const runManageDeficit = async (page) => {
  try {
    return await manageDeficit(page);
  } catch (error) {
    console.error("Error during manageDeficit task:", error);
    return 0;
  }
};

main();
