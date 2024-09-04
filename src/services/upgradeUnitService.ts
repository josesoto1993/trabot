import { getUnit, IUnit } from "./unitService";
import UpgradeUnitModel, {
  IUpgradeUnitSchema,
} from "../schemas/upgradeUnitSchema";
import UnitNames from "../constants/unitsNames";

export interface IUpgradeUnitUpsertData {
  villageName: string;
  unitName: UnitNames;
}
export interface IUpgradeUnit {
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
  upgrade: IUpgradeUnitUpsertData
): Promise<void> => {
  const filter = {
    villageName: upgrade.villageName,
    unitName: upgrade.unitName,
  };
  await UpgradeUnitModel.deleteOne(filter).exec();
};

export const insertUpgrade = async (
  upgrade: IUpgradeUnitUpsertData
): Promise<IUpgradeUnitSchema> => {
  const unit = await getUnit(upgrade.unitName);
  if (!unit) {
    throw new Error(`Unit "${upgrade.unitName}" not found`);
  }

  const newUpgrade = new UpgradeUnitModel({
    villageName: upgrade.villageName,
    unitName: upgrade.unitName,
  });
  return await newUpgrade.save();
};
