const BuildingTypeModel = require("../schemas/buildingTypeSchema");

let cachedBuildingTypes = null;

const loadBuildingTypes = async () => {
  if (!cachedBuildingTypes) {
    const buildingTypes = await BuildingTypeModel.find().populate("category");
    cachedBuildingTypes = {};
    buildingTypes.forEach((buildingType) => {
      cachedBuildingTypes[buildingType.name] = buildingType;
    });
  }
  return cachedBuildingTypes;
};

const getBuildingTypes = async () => {
  return await loadBuildingTypes();
};

const getBuildingType = async (name) => {
  const buildingTypes = await getBuildingTypes();
  return buildingTypes[name];
};

const upsertBuildingType = async (buildingTypeData) => {
  const filter = { name: buildingTypeData.name };
  const update = {
    structureId: buildingTypeData.structureId,
    category: buildingTypeData.category._id,
    slot: buildingTypeData.slot,
  };
  const options = { new: true, upsert: true };

  const result = await BuildingTypeModel.findOneAndUpdate(
    filter,
    update,
    options
  );

  cleanCache();

  return result;
};

const cleanCache = () => {
  cachedBuildingTypes = null;
};

module.exports = { getBuildingTypes, getBuildingType, upsertBuildingType };
