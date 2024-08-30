const UpgradeUnitModel = require("../schemas/upgradeUnitSchema");

const getUpgradeList = async () => {
  const upgradeList = await UpgradeUnitModel.find();

  const populatedUpgradeList = await Promise.all(
    upgradeList.map(async (upgrade) => {
      const unit = await getUnit(upgrade.unitName);
      return {
        villageName: upgrade.villageName,
        unit: unit,
      };
    })
  );

  return populatedUpgradeList;
};

const clearVillage = async (villageName) => {
  const filter = { villageName };
  await UpgradeUnitModel.deleteMany(filter);
};

const removeUpgrade = async (villageName, unitName) => {
  const filter = { villageName, unitName };
  await TrainModel.deleteOne(filter);
};

const insertUpgrade = async (villageName, unitName) => {
  const unit = await getUnit(unitName);
  if (!unit) {
    throw new Error(`Unit "${unitName}" not found`);
  }

  const filter = { villageName, unitName };
  const newUpgrade = new TrainModel(filter);
  await newUpgrade.save();

  return newUpgrade;
};

module.exports = {
  getUpgradeList,
  clearVillage,
  removeUpgrade,
  insertUpgrade,
};
