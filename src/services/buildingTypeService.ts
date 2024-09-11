import mongoose from "mongoose";
import BuildingTypeModel, {
  IBuildingTypeSchema,
} from "../schemas/buildingTypeSchema";
import { IBuildingCategory } from "./buildingCategoryService";

export interface IBuildingTypeUpsertData {
  structureId: number;
  name: string;
  category: IBuildingCategory;
  slot?: number | null;
}
export interface IBuildingType extends IBuildingTypeSchema {
  category: IBuildingCategory;
}

let cachedBuildingTypes: IBuildingType[] = [];

const loadBuildingTypes = async (): Promise<IBuildingType[]> => {
  if (!cachedBuildingTypes || cachedBuildingTypes.length === 0) {
    const buildingTypes = await BuildingTypeModel.find()
      .populate("category")
      .exec();
    cachedBuildingTypes = buildingTypes as IBuildingType[];
  }
  return cachedBuildingTypes;
};

export const getBuildingTypes = async (): Promise<IBuildingType[]> => {
  return await loadBuildingTypes();
};

export const getBuildingType = async (
  name: string
): Promise<IBuildingType | undefined> => {
  const buildingTypes = await loadBuildingTypes();
  return buildingTypes.find((buildingType) => buildingType.name === name);
};

export const getBuildingTypeById = async (
  id: mongoose.Schema.Types.ObjectId | string
): Promise<IBuildingType | undefined> => {
  const buildingTypes = await loadBuildingTypes();
  return buildingTypes.find(
    (buildingType) => buildingType._id.toString() === id.toString()
  );
};

export const getBuildingTypeBy = async (
  buildingType: IBuildingTypeSchema | mongoose.Schema.Types.ObjectId | string
): Promise<IBuildingType | undefined> => {
  if (!buildingType) {
    return undefined;
  }

  if (typeof buildingType === "string") {
    return await getBuildingTypeById(buildingType);
  } else if (buildingType instanceof mongoose.Types.ObjectId) {
    return await getBuildingTypeById(
      buildingType as mongoose.Schema.Types.ObjectId
    );
  } else {
    return await getBuildingTypeById((buildingType as IBuildingTypeSchema)._id);
  }
};

export const upsertBuildingType = async (
  data: IBuildingTypeUpsertData
): Promise<IBuildingTypeSchema | null> => {
  const filter = { name: data.name };
  const update = {
    structureId: data.structureId,
    category: data.category._id,
    slot: data.slot ?? null,
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
  cachedBuildingTypes = [];
};
