const { goPage } = require("./browserService");
const { TRAVIAN_BASE } = require("../config/constants");

const USERNAME = process.env.TARVIAN_USERNAME;
const PASSWORD = process.env.TARVIAN_PASSWORD;
const START_DELAY = 15 * 1000;

if (!USERNAME || !PASSWORD) {
  throw new Error("Environment variables USERNAME and PASSWORD must be set.");
}

const login = async (page) => {
  try {
    await goPage(TRAVIAN_BASE);

    await writeUser(page);
    await writePassword(page);
    await submit(page);

    console.log(`Waiting for ${START_DELAY / 1000}s before start...`);
    await new Promise((resolve) => setTimeout(resolve, START_DELAY));
    console.log("Login process completed.");
  } catch (error) {
    console.error("Error during login:", error);
  }
};

const writeUser = async (page) => {
  try {
    await page.waitForSelector('input[name="name"]');
    await page.type('input[name="name"]', USERNAME, { delay: 100 });
    console.log("Username entered.");
  } catch (error) {
    console.error("Error entering username:", error);
  }
};

const writePassword = async (page) => {
  try {
    await page.waitForSelector('input[name="password"]');
    await page.type('input[name="password"]', PASSWORD, { delay: 100 });
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
