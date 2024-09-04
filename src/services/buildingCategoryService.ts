import BuildingCategoryModel, {
  IBuildingCategorySchema,
} from "../schemas/buildingCategorySchema";

export interface IBuildingCategoryUpsertData {
  name: string;
  value: number;
}
export interface IBuildingCategory extends IBuildingCategorySchema {}

let cachedCategories: Record<string, IBuildingCategory> | null = null;

const loadBuildingCategories = async (): Promise<
  Record<string, IBuildingCategory>
> => {
  if (!cachedCategories) {
    const categories = await BuildingCategoryModel.find().exec();
    cachedCategories = {};
    categories.forEach((category) => {
      cachedCategories[category.name] = category;
    });
  }
  return cachedCategories;
};

export const getBuildingCategory = async (
  name: string
): Promise<IBuildingCategory | undefined> => {
  const categories = await loadBuildingCategories();
  return categories[name];
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
  cachedCategories = null;
};
