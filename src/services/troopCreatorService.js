const { goPage } = require("./browserService");
const { TARVIAN_MAIN_BARRACKS } = require("../config/constants");

let lastTrainTime = 0;
let randomInterval = 0;
let trainCount = 0;
const MIN_TRAIN_INTERVAL = 60 * 60 * 1000;
const RANDOM_INTERVAL_VARIATION = 10 * 60 * 1000;

const trainTroops = async (page) => {
  const currentTime = Date.now();
  if (!hasEnoughTimePassed(currentTime)) {
    return;
  }
  console.log(
    "Enough time has passed since the last training, go for more troops!"
  );

  await performTrain(page);
};

const hasEnoughTimePassed = (currentTime) => {
  return currentTime - lastTrainTime >= MIN_TRAIN_INTERVAL + randomInterval;
};

const updateNextTrainTime = () => {
  randomInterval = Math.floor(Math.random() * RANDOM_INTERVAL_VARIATION);
  lastTrainTime = Date.now();
  attackCount = trainCount + 1;
};

const performTrain = async (page) => {
  try {
    await goPage(TARVIAN_MAIN_BARRACKS);

    await writeInputValueToMax(page);
    await submit(page);

    updateNextTrainTime();
    console.log(
      `Train completed successfully. Total trains done ${attackCount}`
    );
  } catch (error) {
    console.log("Error during attack:", error);
  }
};

const writeInputValueToMax = async (page) => {
  try {
    await page.waitForSelector('input[name="t1"]');
    await page.type('input[name="t1"]', "999", { delay: 100 });
    console.log("Input entered.");
  } catch (error) {
    console.log("Error entering value for train troops:", error);
  }
};

const submit = async (page) => {
  try {
    await page.click('button[type="submit"]');
    console.log("Train troops submitted.");
  } catch (error) {
    console.log("Error submitting train troops form:", error);
  }
};

module.exports = {
  trainTroops,
};
