import PriorityBuildingModel, {
  IPriorityBuildingSchema,
} from "../schemas/priorityBuildingSchema";
import PriorityLevels from "../constants/priorityLevels";
import { IBuildingType } from "./buildingTypeService";

export interface IPriorityBuildingUpsertData {
  priority: PriorityLevels;
  buildingType: IBuildingType;
  targetLevel: number;
}
export interface IPriorityBuilding extends IPriorityBuildingSchema {
  buildingType: IBuildingType;
}

export const getAllPriorityBuilding = async (): Promise<
  IPriorityBuilding[]
> => {
  const options = {
    path: "buildingType",
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

export const getPriorityBuildingByPriority = async (
  priority: PriorityLevels
): Promise<IPriorityBuilding[]> => {
  if (!Object.values(PriorityLevels).includes(priority)) {
    throw new Error(`Invalid priority level: ${priority}`);
  }

  const filter = { priority: priority };
  const options = {
    path: "buildingType",
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
    buildingType: data.buildingType._id,
  };
  const update = {
    priority: data.priority,
    buildingType: data.buildingType._id,
    buildingAuxName: data.buildingType.name,
    targetLevel: data.targetLevel,
  };
  const options = { new: true, upsert: true };

  return await PriorityBuildingModel.findOneAndUpdate(
    filter,
    update,
    options
  ).exec();
};

export const removePriorityBuilding = async (
  priority: PriorityLevels,
  buildingType: IBuildingType
): Promise<IPriorityBuildingSchema | null> => {
  if (!Object.values(PriorityLevels).includes(priority)) {
    throw new Error(`Invalid priority level: ${priority}`);
  }

  const filter = { priority, buildingType };
  return await PriorityBuildingModel.findOneAndDelete(filter).exec();
};
