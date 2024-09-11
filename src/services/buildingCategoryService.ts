import BuildingCategoryModel, {
  IBuildingCategorySchema,
} from "../schemas/buildingCategorySchema";

export interface IBuildingCategoryUpsertData {
  name: string;
  value: number;
}
export interface IBuildingCategory extends IBuildingCategorySchema {}

let cachedCategories: IBuildingCategory[] = [];

const loadBuildingCategories = async (): Promise<IBuildingCategory[]> => {
  if (!cachedCategories || cachedCategories.length === 0) {
    const categories = await BuildingCategoryModel.find().exec();
    cachedCategories = categories as IBuildingCategory[];
  }
  return cachedCategories;
};

const getCategories = async (): Promise<IBuildingCategory[]> => {
  return await loadBuildingCategories();
};

export const getBuildingCategory = async (
  name: string
): Promise<IBuildingCategory | undefined> => {
  const categories = await getCategories();
  return categories.find((category) => category.name === name);
};

export const upsertBuildingCategory = async (
  data: IBuildingCategoryUpsertData
): Promise<IBuildingCategorySchema | null> => {
  const filter = { name: data.name };
  const update = { value: data.value };
  const options = { new: true, upsert: true, setDefaultsOnInsert: true };

  const result = await BuildingCategoryModel.findOneAndUpdate(
    filter,
    update,
    options
  ).exec();

  cleanCache();

  return result;
};

const cleanCache = () => {
  cachedCategories = [];
};
