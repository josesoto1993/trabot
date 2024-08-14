const BuildingTypes = require("./buildingTypes");

const LowPriorityBuildings = [
  { type: BuildingTypes["Warehouse"], level: 20 },
  { type: BuildingTypes["Granary"], level: 20 },
  { type: BuildingTypes["Marketplace"], level: 20 },
  { type: BuildingTypes["Embassy"], level: 20 },
  { type: BuildingTypes["Smithy"], level: 20 },
  { type: BuildingTypes["Hospital"], level: 5 },
  { type: BuildingTypes["Stonemason's Lodge"], level: 20 },
  { type: BuildingTypes["Palace"], level: 20 },
  { type: BuildingTypes["Rally Point"], level: 10 },
  { type: BuildingTypes["Palisade"], level: 10 },
];

module.exports = LowPriorityBuildings;
