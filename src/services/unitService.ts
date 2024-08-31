import UnitModel, { IUnitSchema } from "../schemas/unitSchema";
import { IBuildingTypeSchema } from "../schemas/buildingTypeSchema";

export interface IUnit extends IUnitSchema {
  building: IBuildingTypeSchema;
}

let cachedUnits: Record<string, IUnit> | null = null;

const loadUnits = async (): Promise<Record<string, IUnit>> => {
  if (!cachedUnits) {
    const units = await UnitModel.find().populate("building").exec();
    cachedUnits = {};
    units.forEach((unit) => {
      const unitWithBuilding = unit as IUnit;
      cachedUnits[unitWithBuilding.name] = unitWithBuilding;
    });
  }
  return cachedUnits;
};

export const getUnits = async (): Promise<Record<string, IUnit>> => {
  return await loadUnits();
};

export const getUnit = async (name: string): Promise<IUnit | undefined> => {
  const units = await getUnits();
  return units[name];
};

export const upsertUnit = async (unitData: IUnit): Promise<IUnit | null> => {
  const filter = { name: unitData.name };
  const update = {
    selector: unitData.selector,
    building: unitData.building._id,
  };
  const options = { new: true, upsert: true };

  const result = await UnitModel.findOneAndUpdate(
    filter,
    update,
    options
  ).exec();

  cleanCache();

  return result as IUnit;
};

const cleanCache = (): void => {
  cachedUnits = null;
};
