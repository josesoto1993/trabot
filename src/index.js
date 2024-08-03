require("dotenv").config();

const { formatTime } = require("./util/timePrintService");
const { open } = require("./browser/browserService");
const { login } = require("./browser/loginService");
const { attackFarms } = require("./attackFarms/attackFarmsService");
const { trainTroops } = require("./createTroops/troopCreatorService");
const { goAdventure } = require("./hero/heroAdventureService");

const mainLoop = async () => {
  let nextAttackFarms = 0;
  let nextTrainTroops = 0;
  let nextGoAdventure = 0;
  let nextLoop = 0;

  let page = await initializeBrowser();
  await login(page);

  while (true) {
    nextAttackFarms = await runAttackFarms(page);
    nextTrainTroops = await runTrainTroops(page);
    nextGoAdventure = await runGoAdventure(page);
    nextLoop = Math.min(nextAttackFarms, nextTrainTroops, nextGoAdventure);

    console.log(`Waiting for ${formatTime(nextLoop)} before next run...`);
    await new Promise((resolve) => setTimeout(resolve, nextLoop * 1000));
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
  }
};

const runTrainTroops = async (page) => {
  try {
    return await trainTroops(page);
  } catch (error) {
    console.error("Error during train task:", error);
  }
};

const runGoAdventure = async (page) => {
  try {
    return await goAdventure(page);
  } catch (error) {
    console.error("Error during adventure task:", error);
  }
};

mainLoop();
