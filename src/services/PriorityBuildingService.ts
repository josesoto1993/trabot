import PriorityBuildingModel, {
  IPriorityBuildingSchema,
} from "../schemas/PriorityBuildingSchema";
import PriorityLevels from "../constants/priorityLevels";
import { IBuildingType } from "./buildingTypeService";

export interface IPriorityBuildingUpsertData {
  priority: PriorityLevels;
  building: IBuildingType;
  targetLevel: number;
}
export interface IPriorityBuilding extends IPriorityBuildingSchema {
  building: IBuildingType;
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

export const upsertPriorityBuilding = async (
  data: IPriorityBuildingUpsertData
): Promise<IPriorityBuildingSchema | null> => {
  if (!Object.values(PriorityLevels).includes(data.priority)) {
    throw new Error(`Invalid priority level: ${data.priority}`);
  }

  const filter = {
    priority: data.priority,
    building: data.building._id,
  };
  const update = {
    priority: data.priority,
    building: data.building._id,
    buildingAuxName: data.building.name,
    targetLevel: data.targetLevel,
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
  building: IBuildingType
): Promise<IPriorityBuildingSchema | null> => {
  if (!Object.values(PriorityLevels).includes(priority)) {
    throw new Error(`Invalid priority level: ${priority}`);
  }

  const filter = { priority, building };
  return await PriorityBuildingModel.findOneAndDelete(filter).exec();
};
