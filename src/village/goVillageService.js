const { goPage } = require("../browser/browserService");
const { TRAVIAN_RESOURCES_VIEW } = require("../constants/links");

const goVillage = async (village) => {
  const villageUrl = new URL(TRAVIAN_RESOURCES_VIEW);
  villageUrl.searchParams.append("newdid", village.id);

  await goPage(villageUrl);
  console.log(`Navigated to village: ${village.name}`);
};

module.exports = goVillage;
