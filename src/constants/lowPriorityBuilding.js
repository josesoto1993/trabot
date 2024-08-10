const BuildingTypes = require("./buildingTypes");

const LowPriorityBuildings = [
  { type: BuildingTypes["Warehouse"], level: 20 },
  { type: BuildingTypes["Granary"], level: 20 },
  { type: BuildingTypes["Marketplace"], level: 20 },
  { type: BuildingTypes["Embassy"], level: 20 },
  { type: BuildingTypes["Smithy"], level: 20 },
  { type: BuildingTypes["Hospital"], level: 5 },
];

module.exports = LowPriorityBuildings;
