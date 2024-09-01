import PriorityBuildingModel, {
  IPriorityBuildingSchema,
} from "../schemas/PriorityBuildingSchema";
import PriorityLevels from "../constants/priorityLevels";
import { IBuildingTypeSchema } from "../schemas/buildingTypeSchema";

export interface IPriorityBuilding extends IPriorityBuildingSchema {
  building: IBuildingTypeSchema;
}

export const getAll = async (): Promise<IPriorityBuilding[]> => {
  const options = {
    path: "building",
    populate: {
      path: "category",
      model: "BuildingCategory",
    },
  };

  const priorityBuildings = await PriorityBuildingModel.find()
    .populate(options)
    .exec();
  return priorityBuildings as IPriorityBuilding[];
};

export const getAllByPriority = async (
  priority: PriorityLevels
): Promise<IPriorityBuilding[]> => {
  if (!Object.values(PriorityLevels).includes(priority)) {
    throw new Error(`Invalid priority level: ${priority}`);
  }

  const filter = { priority: priority };
  const options = {
    path: "building",
    populate: {
      path: "category",
      model: "BuildingCategory",
    },
  };

  const priorityBuildings = await PriorityBuildingModel.find(filter)
    .populate(options)
    .exec();
  return priorityBuildings as IPriorityBuilding[];
};

export const upsert = async (
  priority: PriorityLevels,
  building: IBuildingTypeSchema,
  targetLevel: number
): Promise<IPriorityBuildingSchema | null> => {
  if (!Object.values(PriorityLevels).includes(priority)) {
    throw new Error(`Invalid priority level: ${priority}`);
  }

  const filter = { priority, building };
  const update = {
    priority: priority,
    building: building,
    buildingAuxName: building.name,
    targetLevel: targetLevel,
  };
  const options = { new: true, upsert: true };

  return await PriorityBuildingModel.findOneAndUpdate(
    filter,
    update,
    options
  ).exec();
};

export const remove = async (
  priority: PriorityLevels,
  building: IBuildingTypeSchema
): Promise<IPriorityBuildingSchema | null> => {
  if (!Object.values(PriorityLevels).includes(priority)) {
    throw new Error(`Invalid priority level: ${priority}`);
  }

  const filter = { priority, building };
  return await PriorityBuildingModel.findOneAndDelete(filter).exec();
};
