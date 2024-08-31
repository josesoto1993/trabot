const { getUpgradeList } = require("../services/upgradeUnitService");

const ensureUpgradeCollectionExists = async () => {
  console.log("Ensure upgrade table exist or else create");
  try {
    await getUpgradeList();
    console.log("Upgrade collection ensured.");
  } catch (error) {
    console.error("Error ensuring Upgrade collection exists:", error);
  }
};

module.exports = ensureUpgradeCollectionExists;
