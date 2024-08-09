const { URL } = require("url");
const { goPage } = require("../browser/browserService");
const { TRAVIAN_BUILD_VIEW } = require("../constants/links");

const upgradeExistingBuilding = async (page, villageId, slotId) => {
  await selectBuilding(villageId, slotId);
  return await upgradeSelectedBuilding(page);
};

const selectBuilding = async (villageId, slotId) => {
  const villageUrl = new URL(TRAVIAN_BUILD_VIEW);
  villageUrl.searchParams.append("newdid", villageId);
  villageUrl.searchParams.append("id", slotId);
  await goPage(villageUrl);

  console.log(`Clicked on city with id ${villageId} building ${slotId}`);
};

const upgradeSelectedBuilding = async (page) => {
  const buildButton = await getBuildButton(page);
  if (!buildButton) {
    console.log("No build button found.");
    return null;
  }

  const durationValue = await getDurationValue(page);

  await buildButton.click();
  console.log("Clicked on the build button.");
  return durationValue;
};

const getBuildButton = async (page) => {
  const buildSelector =
    "#build .upgradeBuilding .upgradeButtonsContainer .section1";
  const buildButtonSelector = buildSelector + " .build";

  await page.waitForSelector(buildSelector);

  const buildButton = await page.$(buildButtonSelector);
  if (buildButton) {
    const buttonText = await page.evaluate(
      (button) => button.innerText,
      buildButton
    );
    if (buttonText.includes("Upgrade to level")) {
      return buildButton;
    }
  }

  return null;
};

const getDurationValue = async (page) => {
  const buildTimerSelector =
    ".upgradeButtonsContainer .section1 .duration .value";

  await page.waitForSelector(buildTimerSelector);
  const durationValue = await page.$eval(buildTimerSelector, (span) => {
    const timeString = span.textContent.trim();
    const [hours, minutes, seconds] = timeString.split(":").map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  });
  console.log(`Upgrade duration: ${durationValue}`);
  return durationValue;
};

module.exports = upgradeExistingBuilding;
