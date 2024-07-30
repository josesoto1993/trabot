const { goPage } = require("./browserService");
const { TRAVIAN_BASE } = require("../config/constants");

const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;

if (!USERNAME || !PASSWORD) {
  throw new Error("Environment variables USERNAME and PASSWORD must be set.");
}

const login = async (page) => {
  try {
    await goPage(TRAVIAN_BASE);

    await writeUser();
    await writePassword();
    await submit();

    console.log("Login process completed.");
  } catch (error) {
    console.error("Error during login:", error);
  }
};

const writeUser = async (page) => {
  try {
    await page.waitForSelector('div.fromV2 input[name="name"]');
    await page.type('div.fromV2 input[name="name"]', USERNAME);
    console.log("Username entered.");
  } catch (error) {
    console.error("Error entering username:", error);
  }
};

const writePassword = async (page) => {
  try {
    await page.waitForSelector('div.fromV2 input[name="password"]');
    await page.type('div.fromV2 input[name="password"]', PASSWORD);
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
