const PriorityBuildingModel = require("../schemas/PriorityBuildingSchema");
const PRIORITY_LEVELS = require("../constants/priorityLevels");

const getAll = async () => {
  return await PriorityBuildingModel.find().populate("building");
};

const getAllByPriority = async (priority) => {
  if (!Object.values(PRIORITY_LEVELS).includes(priority)) {
    throw new Error(`Invalid priority level: ${priority}`);
  }

  const filter = { priority };
  return await PriorityBuildingModel.find(filter).populate({
    path: "building",
    populate: {
      path: "category",
      model: "BuildingCategory",
    },
  });
};

const upsert = async (priority, building, targetLevel) => {
  if (!Object.values(PRIORITY_LEVELS).includes(priority)) {
    throw new Error(`Invalid priority level: ${priority}`);
  }

  const filter = { priority, building };
  const update = { priority, building, targetLevel };
  const options = { new: true, upsert: true };

  return await PriorityBuildingModel.findOneAndUpdate(filter, update, options);
};

const remove = async (priority, building) => {
  if (!Object.values(PRIORITY_LEVELS).includes(priority)) {
    throw new Error(`Invalid priority level: ${priority}`);
  }

  const filter = { priority, building };
  return await PriorityBuildingModel.findOneAndDelete(filter);
};

module.exports = {
  getAll,
  getAllByPriority,
  upsert,
  remove,
};
