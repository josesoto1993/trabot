const { goPage } = require("../browser/browserService");
const { getClassOfHeroIcon } = require("./heroStatusService");
const { TRAVIAN_HERO_ADVENTURES } = require("../constants/links");
const { HeroStatus } = require("../constants/heroStatus");

const ADVENTURE_BUTTON_SELECTOR_TIMEOUT = 15000;

const goAdventure = async (page) => {
  const heroStatusClass = await getClassOfHeroIcon(page);
  const atHome = heroStatusClass === HeroStatus.home;
  if (!atHome) {
    return;
  }

  console.log(
    "Hero is at home and there are adventures, trying to go for a new adventure!"
  );

  await performAdventure(page);
};

const performAdventure = async (page) => {
  try {
    await goPage(TRAVIAN_HERO_ADVENTURES);
    await clickAdventureButton(page);
  } catch (error) {
    console.error("Error during adventure:", error);
  }
};

const clickAdventureButton = async (page) => {
  const adventureButtonSelector = ".adventureList tbody tr td .textButtonV2";
  try {
    await page.waitForSelector(adventureButtonSelector, {
      timeout: ADVENTURE_BUTTON_SELECTOR_TIMEOUT,
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
