import BuildingTypeModel, {
  IBuildingTypeSchema,
} from "../schemas/buildingTypeSchema";
import { IBuildingCategorySchema } from "../schemas/buildingCategorySchema";
import mongoose from "mongoose";

export interface IBuildingType extends IBuildingTypeSchema {
  category: IBuildingCategorySchema;
}

let cachedBuildingTypes: Record<string, IBuildingType> | null = null;

const loadBuildingTypes = async (): Promise<Record<string, IBuildingType>> => {
  if (!cachedBuildingTypes) {
    const buildingTypes = await BuildingTypeModel.find()
      .populate("category")
      .exec();
    cachedBuildingTypes = {};
    buildingTypes.forEach((buildingType) => {
      const buildingTypeWithCategory = buildingType as IBuildingType;
      cachedBuildingTypes![buildingType.name] = buildingTypeWithCategory;
    });
  }
  return cachedBuildingTypes;
};

export const getBuildingTypes = async (): Promise<
  Record<string, IBuildingType>
> => {
  return await loadBuildingTypes();
};

export const getBuildingType = async (
  name: string
): Promise<IBuildingType | undefined> => {
  const buildingTypes = await getBuildingTypes();
  return buildingTypes[name];
};

export const upsertBuildingType = async (buildingTypeData: {
  structureId: number;
  name: string;
  category: mongoose.Schema.Types.ObjectId;
  slot?: number | null;
}): Promise<IBuildingTypeSchema | null> => {
  const filter = { name: buildingTypeData.name };
  const update = {
    structureId: buildingTypeData.structureId,
    category: buildingTypeData.category,
    slot: buildingTypeData.slot ?? null,
  };
  const options = { new: true, upsert: true };

  const result = await BuildingTypeModel.findOneAndUpdate(
    filter,
    update,
    options
  ).exec();

  cleanCache();

  return result;
};

const cleanCache = (): void => {
  cachedBuildingTypes = null;
};
