const { goPage } = require("../browser/browserService");
const { TARVIAN_MAIN_BARRACKS } = require("../constants/links");
const { formatTime } = require("./timePrintService");
const Unit = require("../constants/units");

const trainUnit = Unit.Swordsman;
let lastTrainTime = 0;
let randomTrainInterval = 0;
let trainCount = 0;
const UNITS_TO_TRAIN = "999";
const MIN_TRAIN_INTERVAL = 60 * 60 * 1000;
const RANDOM_INTERVAL_VARIATION = 10 * 60 * 1000;
const MAX_TRAIN_TIME = 4 * 60 * 60;

const trainTroops = async (page) => {
  let remaningTime = getRemaningTime();
  if (remaningTime > 0) {
    return remaningTime;
  }
  console.log(
    "Enough time has passed since the last training, go for more troops!"
  );

  await performTrain(page);
  updateNextTrainTime();
  return getRemaningTime();
};

const getRemaningTime = () => {
  const currentTime = Date.now();
  const timePased = currentTime - lastTrainTime;
  const remaningTime = MIN_TRAIN_INTERVAL + randomTrainInterval - timePased;
  return remaningTime;
};

const updateNextTrainTime = () => {
  randomTrainInterval =
    Math.random() * RANDOM_INTERVAL_VARIATION * 2 - RANDOM_INTERVAL_VARIATION;
  console.log(
    `Next train in ${formatTime(MIN_TRAIN_INTERVAL + randomTrainInterval)}`
  );
  lastTrainTime = Date.now();
  trainCount = trainCount + 1;
};

const performTrain = async (page) => {
  try {
    await goPage(TARVIAN_MAIN_BARRACKS);

    let remainingTime = await getRemainingTime(page);
    if (remainingTime < MAX_TRAIN_TIME) {
      console.log(
        `Need to train, remaining time=${formatTime(remainingTime)} is lower than MAX_TRAIN_TIME=${formatTime(MAX_TRAIN_TIME)}`
      );
      await writeInputValueToMax(page);
      await submit(page);
    } else {
      console.log(
        `No need to train, remaining time=${formatTime(remainingTime)} is higher than MAX_TRAIN_TIME=${formatTime(MAX_TRAIN_TIME)}`
      );
    }

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
    console.log(`Maximum remaining time: ${formatTime(maxRemainingTime)}`);
    return maxRemainingTime;
  } catch (error) {
    console.log("Error getting remaining time:", error);
    return 0;
  }
};

const writeInputValueToMax = async (page) => {
  const inputName = `input[name="${trainUnit}"]`;
  try {
    await page.waitForSelector(inputName);
    await page.type(inputName, UNITS_TO_TRAIN, { delay: 100 });
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
