import { getUnit, IUnit } from "./unitService";
import UpgradeUnitModel, {
  IUpgradeUnitSchema,
} from "../schemas/upgradeUnitSchema";

interface IUpgradeUnit {
  villageName: string;
  unit: IUnit;
}

export const getUpgradeList = async (): Promise<IUpgradeUnit[]> => {
  const upgradeList = await UpgradeUnitModel.find().exec();

  const populatedUpgradeList: IUpgradeUnit[] = await Promise.all(
    upgradeList.map(async (upgrade) => {
      const unit = await getUnit(upgrade.unitName);
      if (!unit) {
        throw new Error(`Unit "${upgrade.unitName}" not found`);
      }
      return {
        villageName: upgrade.villageName,
        unit: unit,
      };
    })
  );

  return populatedUpgradeList;
};

export const clearVillage = async (villageName: string): Promise<void> => {
  const filter = { villageName };
  await UpgradeUnitModel.deleteMany(filter).exec();
};

export const removeUpgrade = async (
  villageName: string,
  unitName: string
): Promise<void> => {
  const filter = { villageName, unitName };
  await UpgradeUnitModel.deleteOne(filter).exec();
};

export const insertUpgrade = async (
  villageName: string,
  unitName: string
): Promise<IUpgradeUnitSchema> => {
  const unit = await getUnit(unitName);
  if (!unit) {
    throw new Error(`Unit "${unitName}" not found`);
  }

  const newUpgrade = new UpgradeUnitModel({ villageName, unitName });
  return await newUpgrade.save();
};
