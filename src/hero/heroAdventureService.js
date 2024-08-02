const { goPage } = require("../browser/browserService");
const { getClassOfHeroIcon } = require("./heroStatusService");
const { TRAVIAN_HERO_ADVENTURES } = require("../constants/links");
const { formatTime } = require("../generalServices/timePrintService");
const HeroStatus = require("../constants/heroStatus");

const ADVENTURE_BUTTON_SELECTOR_TIMEOUT_MILLIS = 15000;
const ADVENTURE_INTERVAL = 15 * 60;
let lastAdventureTime = 0;

const goAdventure = async (page) => {
  const remaningTime = getRemaningTime();
  if (remaningTime > 0) {
    return remaningTime;
  }
  console.log("Enough time has passed since the last adventure, try go");

  const heroStatusClass = await getClassOfHeroIcon(page);
  const atHome = heroStatusClass === HeroStatus.home;
  if (!atHome) {
    console.log(
      `Hero is not at home or there are no adventures, await ${formatTime(ADVENTURE_INTERVAL)}`
    );
    return ADVENTURE_INTERVAL;
  }

  console.log(
    "Hero is at home and there are adventures, trying to go for a new adventure!"
  );

  const successfullyAdventure = await performAdventure(page);
  if (successfullyAdventure) {
    updateNextAdventureTime();
  }

  return ADVENTURE_INTERVAL;
};

const getRemaningTime = () => {
  const currentTime = Date.now();
  const timePased = (currentTime - lastAdventureTime) / 1000;
  return ADVENTURE_INTERVAL - timePased;
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
