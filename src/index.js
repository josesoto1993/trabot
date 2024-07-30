require("dotenv").config();

const { open } = require("./services/browserService");
const { attackFarms } = require("./services/attackFarmsService");
const { login } = require("./services/loginService");

const START_TIMER = 30 * 1000;
const INTERVAL = 1 * 60 * 1000;

let page;

const mainLoop = async () => {
  await initializeBrowser();
  await login();

  while (true) {
    await runAttackFarms();

    console.log(
      `Waiting for ${INTERVAL / 1000 / 60} minutes before next run...`
    );
    await new Promise((resolve) => setTimeout(resolve, INTERVAL));
  }
};

const initializeBrowser = async () => {
  try {
    page = await open();
    console.log(
      `Browser opened ${START_TIMER / 1000}s to login and configure it`
    );
    await new Promise((resolve) => setTimeout(resolve, START_TIMER));
  } catch (error) {
    console.error("Error opening browser:", error);
    process.exit(1);
  }
};

const runAttackFarms = async () => {
  try {
    await attackFarms(page);
  } catch (error) {
    console.error("Error during attack:", error);
  }
};

mainLoop();
