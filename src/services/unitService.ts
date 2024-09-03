import UnitModel, { IUnitSchema } from "../schemas/unitSchema";
import { IBuildingTypeSchema } from "../schemas/buildingTypeSchema";
import UnitNames from "../constants/unitsNames";

export interface IUnitUpsertData {
  name: UnitNames;
  selector: string;
  building: IBuildingTypeSchema;
}
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

export const upsertUnit = async (
  data: IUnitUpsertData
): Promise<IUnitSchema | null> => {
  const filter = { name: data.name };
  const update = {
    selector: data.selector,
    building: data.building._id,
  };
  const options = { new: true, upsert: true };

  const result = await UnitModel.findOneAndUpdate(
    filter,
    update,
    options
  ).exec();

  cleanCache();

  return result;
};

const cleanCache = (): void => {
  cachedUnits = null;
};
