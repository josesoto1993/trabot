const { goPage } = require("./browserService");
const { TARVIAN_MAIN_BARRACKS } = require("../config/constants");

let lastTrainTime = 0;
let randomTrainInterval = 0;
let trainCount = 0;
const MIN_TRAIN_INTERVAL = 60 * 60 * 1000;
const RANDOM_INTERVAL_VARIATION = 10 * 60 * 1000;
const MAX_TRAIN_TIME = 4 * 60 * 60;

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
  return (
    currentTime - lastTrainTime >= MIN_TRAIN_INTERVAL + randomTrainInterval
  );
};

const updateNextTrainTime = () => {
  randomTrainInterval = Math.floor(Math.random() * RANDOM_INTERVAL_VARIATION);
  lastTrainTime = Date.now();
  trainCount = trainCount + 1;
};

const performTrain = async (page) => {
  try {
    await goPage(TARVIAN_MAIN_BARRACKS);

    let remainingTime = await getRemainingTime(page);
    if (remainingTime < MAX_TRAIN_TIME) {
      console.log(
        `Need to train, remaining time=${remainingTime} is lower than MAX_TRAIN_TIME=${MAX_TRAIN_TIME}`
      );
      await writeInputValueToMax(page);
      await submit(page);
    } else {
      console.log(
        `No need to train, remaining time=${remainingTime} is higher than MAX_TRAIN_TIME=${MAX_TRAIN_TIME}`
      );
    }

    updateNextTrainTime();
    console.log(
      `Training completed successfully. Total trains done: ${trainCount}`
    );
  } catch (error) {
    console.log("Error during train:", error);
  }
};

const getRemainingTime = async (page) => {
  try {
    await page.waitForSelector("td.dur span.timer");
    const remainingTimes = await page.$$eval("td.dur span.timer", (spans) =>
      spans.map((span) => parseInt(span.getAttribute("value"), 10))
    );
    const maxRemainingTime = Math.max(...remainingTimes);
    console.log(`Maximum remaining time: ${maxRemainingTime}`);
    return maxRemainingTime;
  } catch (error) {
    console.log("Error getting remaining time:", error);
    return 0;
  }
};

const writeInputValueToMax = async (page) => {
  const inputName = 'input[name="t2"]';
  try {
    await page.waitForSelector(inputName);
    await page.type(inputName, "999", { delay: 100 });
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
