const { goPage } = require("../browser/browserService");
const { getClassOfHeroIcon, getHeroAdventures } = require("./heroStatus");
const { TRAVIAN_HERO_ADVENTURES } = require("../constants/links");
const { formatTime } = require("../utils/timePrint");
const HeroStatus = require("../constants/heroStatus");

const ADVENTURE_BUTTON_SELECTOR_TIMEOUT_MILLIS = 15000;
const ADVENTURE_INTERVAL = 15 * 60;
let lastAdventureTime = 0;

const goAdventure = async (page) => {
  const remainingTime = getremainingTime();
  if (remainingTime > 0) {
    return { nextExecutionTime: remainingTime, skip: true };
  }
  console.log("Enough time has passed since the last adventure, try go");

  const heroStatusClass = await getClassOfHeroIcon(page);
  const atHome = heroStatusClass === HeroStatus.home;
  if (!atHome) {
    console.log(
      `Hero is not at home (${heroStatusClass}), await ${formatTime(ADVENTURE_INTERVAL)}`
    );
    return { nextExecutionTime: ADVENTURE_INTERVAL, skip: true };
  }
  const heroAdventures = await getHeroAdventures(page);
  if (heroAdventures <= 0) {
    console.log(
      `There are no adventures (${heroAdventures}), await ${formatTime(ADVENTURE_INTERVAL)}`
    );
    return { nextExecutionTime: ADVENTURE_INTERVAL, skip: true };
  }

  const successfullyAdventure = await performAdventure(page);
  if (successfullyAdventure) {
    updateNextAdventureTime();
  }

  return { nextExecutionTime: ADVENTURE_INTERVAL, skip: false };
};

const getremainingTime = () => {
  const currentTime = Date.now();
  const timePassed = (currentTime - lastAdventureTime) / 1000;
  return ADVENTURE_INTERVAL - timePassed;
};

const updateNextAdventureTime = () => {
  lastAdventureTime = Date.now();
};

const performAdventure = async (page) => {
  try {
    await goPage(TRAVIAN_HERO_ADVENTURES);
    await clickAdventureButton(page);
    return true;
  } catch (error) {
    console.error("Error during adventure:", error);
    return false;
  }
};

const clickAdventureButton = async (page) => {
  const adventureButtonSelector =
    ".adventureList tbody tr td .textButtonV2:not(.disabled)";
  try {
    await page.waitForSelector(adventureButtonSelector, {
      timeout: ADVENTURE_BUTTON_SELECTOR_TIMEOUT_MILLIS,
    });
    const button = await page.$(adventureButtonSelector);
    if (button) {
      await button.click();
      console.log("First adventure button clicked.");
    } else {
      console.log("No adventures available.");
    }
  } catch (error) {
    console.log("No adventures available.");
  }
};

module.exports = {
  goAdventure,
};
