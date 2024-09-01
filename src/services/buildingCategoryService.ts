import BuildingCategoryModel, {
  IBuildingCategorySchema,
} from "../schemas/buildingCategorySchema";

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
  category: IBuildingCategory
): Promise<IBuildingCategorySchema | null> => {
  const filter = { name: category.name };
  const update = { value: category.value };
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
