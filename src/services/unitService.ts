import UnitModel, { IUnitSchema } from "../schemas/unitSchema";
import { IBuildingTypeSchema } from "../schemas/buildingTypeSchema";
import UnitNames from "../constants/unitsNames";
import { getBuildingTypeBy, IBuildingType } from "./buildingTypeService";
import TribeNames from "../constants/tribes";
import mongoose from "mongoose";

export interface IUnitUpsertData {
  name: UnitNames;
  tribe: TribeNames;
  selector: string;
  buildingType?: IBuildingTypeSchema;
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
export interface IUnit {
  _id: mongoose.Schema.Types.ObjectId;
  name: UnitNames;
  tribe: TribeNames;
  selector: string;
  buildingType: IBuildingType;
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

let cachedUnits: IUnit[] = [];
const loadUnits = async (): Promise<IUnit[]> => {
  if (!cachedUnits || cachedUnits.length === 0) {
    const units = await UnitModel.find().populate("buildingType").exec();
    const unitsSchemas = units as IUnitSchema[];
    cachedUnits = await Promise.all(
      unitsSchemas.map(
        async (unitSchema) => await parseUnitSchemaToUnit(unitSchema)
      )
    );
  }
  return cachedUnits;
};

const getUnits = async (): Promise<IUnit[]> => {
  return await loadUnits();
};

export const getUnit = async (name: UnitNames): Promise<IUnit | undefined> => {
  const units = await getUnits();
  return units.find((unit) => unit.name === name);
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
    buildingType: data.buildingType ? data.buildingType._id : null,
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
  cachedUnits = [];
};

export const parseUnitSchemaToUnit = async (
  unitSchema: IUnitSchema
): Promise<IUnit> => {
  const initialBuildingType = unitSchema.buildingType;
  const buildingType = await getBuildingTypeBy(initialBuildingType);

  return {
    _id: unitSchema._id,
    name: unitSchema.name,
    tribe: unitSchema.tribe,
    selector: unitSchema.selector,
    buildingType,
    att: unitSchema.att,
    attC: unitSchema.attC,
    def: unitSchema.def,
    defC: unitSchema.defC,
    wood: unitSchema.wood,
    clay: unitSchema.clay,
    iron: unitSchema.iron,
    crop: unitSchema.crop,
    upkeep: unitSchema.upkeep,
  };
};
