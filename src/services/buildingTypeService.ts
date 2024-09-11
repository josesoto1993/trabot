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

let cachedBuildingTypes: Record<string, IBuildingType> | null = null;

const loadBuildingTypes = async (): Promise<Record<string, IBuildingType>> => {
  if (!cachedBuildingTypes) {
    const buildingTypes = await BuildingTypeModel.find()
      .populate("category")
      .exec();
    cachedBuildingTypes = {};
    buildingTypes.forEach((buildingType) => {
      const buildingTypeWithCategory = buildingType as IBuildingType;
      cachedBuildingTypes[buildingType.name] = buildingTypeWithCategory;
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
  cachedBuildingTypes = null;
};
