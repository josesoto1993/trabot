const { goPage, typeInSelector } = require("./browserService");
const { TRAVIAN_BASE } = require("../constants/links");
const { formatTime } = require("../utils/timePrint");

const USERNAME = process.env.TARVIAN_USERNAME;
const PASSWORD = process.env.TARVIAN_PASSWORD;
const START_DELAY = 15;

if (!USERNAME || !PASSWORD) {
  throw new Error("Environment variables USERNAME and PASSWORD must be set.");
}

const login = async (page) => {
  try {
    await goPage(TRAVIAN_BASE);

    await writeUser(page);
    await writePassword(page);
    await submit(page);

    console.log(`Waiting for ${formatTime(START_DELAY)} before start...`);
    await new Promise((resolve) => setTimeout(resolve, START_DELAY * 1000));
    console.log("Login process completed.");
  } catch (error) {
    console.error("Error during login:", error);
  }
};

const writeUser = async (page) => {
  try {
    await page.waitForSelector('input[name="name"]');
    await typeInSelector('input[name="name"]', USERNAME);
    console.log("Username entered.");
  } catch (error) {
    console.error("Error entering username:", error);
  }
};

const writePassword = async (page) => {
  try {
    await page.waitForSelector('input[name="password"]');
    await typeInSelector('input[name="password"]', PASSWORD);
    console.log("Password entered.");
  } catch (error) {
    console.error("Error entering password:", error);
  }
};

const submit = async (page) => {
  try {
    await page.click('button[type="submit"]');
    console.log("Login form submitted.");
  } catch (error) {
    console.error("Error submitting login form:", error);
  }
};

module.exports = {
  login,
};
