require("dotenv").config();

const { open } = require("./services/browserService");
const { attackFarms } = require("./services/attackFarmsService");
const { login } = require("./services/loginService");

const INTERVAL = 1 * 60 * 1000;

const mainLoop = async () => {
  let page = await initializeBrowser();
  await login(page);

  while (true) {
    await runAttackFarms(page);

    console.log(
      `Waiting for ${INTERVAL / 1000 / 60} minutes before next run...`
    );
    await new Promise((resolve) => setTimeout(resolve, INTERVAL));
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
    await attackFarms(page);
  } catch (error) {
    console.error("Error during attack:", error);
  }
};

mainLoop();
