import { getUpgradeList } from "../services/upgradeUnitService";

const ensureUpgradeCollectionExists = async (): Promise<void> => {
  console.log("Ensure upgrade table exists or else create");
  try {
    await getUpgradeList();
    console.log("Upgrade collection ensured.");
  } catch (error) {
    console.error("Error ensuring Upgrade collection exists:", error);
  }
};

export default ensureUpgradeCollectionExists;
