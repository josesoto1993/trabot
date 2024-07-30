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
    await new Promise((resolve) => setTimeout(resolve, 10 * 1000));

    await writeUser(page);
    await writePassword(page);
    await submit(page);

    await new Promise((resolve) => setTimeout(resolve, 15 * 1000));
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
