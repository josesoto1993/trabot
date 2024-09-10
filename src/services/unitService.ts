import UnitModel, { IUnitSchema } from "../schemas/unitSchema";
import { IBuildingTypeSchema } from "../schemas/buildingTypeSchema";
import UnitNames from "../constants/unitsNames";
import { IBuildingType } from "./buildingTypeService";
import TribeNames from "../constants/tribes";

export interface IUnitUpsertData {
  name: UnitNames;
  tribe: TribeNames;
  selector: string;
  building?: IBuildingTypeSchema;
  att: number;
  attC: number;
  def: number;
  defC: number;
  wood: number;
  clay: number;
  iron: number;
  crop: number;
  upkeep: number;
}
export interface IUnit extends IUnitSchema {
  building: IBuildingType;
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

export const getUnit = async (name: UnitNames): Promise<IUnit | undefined> => {
  const units = await getUnits();
  return units[name];
};

export const getUnitsByTribe = async (
  tribe: TribeNames
): Promise<IUnit[] | undefined> => {
  const units = await getUnits();
  const filteredUnits = Object.values(units).filter(
    (unit) => unit.tribe === tribe
  );

  return filteredUnits.length > 0 ? filteredUnits : undefined;
};

export const upsertUnit = async (
  data: IUnitUpsertData
): Promise<IUnitSchema | null> => {
  const filter = { name: data.name };
  const update = {
    tribe: data.tribe,
    selector: data.selector,
    building: data.building ? data.building._id : null,
    att: data.att,
    attC: data.attC,
    def: data.def,
    defC: data.defC,
    wood: data.wood,
    clay: data.clay,
    iron: data.iron,
    crop: data.crop,
    upkeep: data.upkeep,
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
