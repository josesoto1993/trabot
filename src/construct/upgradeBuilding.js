const { URL } = require("url");
const { goPage } = require("../browser/browserService");
const { TRAVIAN_BUILD_VIEW } = require("../constants/links");

const upgradeBuilding = async (page, villageId, slotId) => {
  await selectBuilding(villageId, slotId);
  return await upgradeSelectedBuilding(page);
};

const selectBuilding = async (village, slotId) => {
  const villageUrl = new URL(TRAVIAN_BUILD_VIEW);
  villageUrl.searchParams.append("newdid", village.id);
  villageUrl.searchParams.append("id", slotId);
  await goPage(villageUrl);

  console.log(`Clicked on city ${village.name} building ${slotId}`);
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
  const buildButtonSelector = ".upgradeButtonsContainer .section1 .build";

  await page.waitForSelector(buildButtonSelector);
  return await page.$(buildButtonSelector);
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

module.exports = upgradeBuilding;
