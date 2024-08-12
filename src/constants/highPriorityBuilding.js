const BuildingTypes = require("./buildingTypes");

const HighPriorityBuildings = [
  { type: BuildingTypes["Residence"], level: 10 },
  { type: BuildingTypes["Main Building"], level: 20 },
  { type: BuildingTypes["Grain Mill"], level: 5 },
  { type: BuildingTypes["Brickyard"], level: 5 },
  { type: BuildingTypes["Sawmill"], level: 5 },
  { type: BuildingTypes["Iron Foundry"], level: 5 },
  { type: BuildingTypes["Bakery"], level: 5 },
  { type: BuildingTypes["Warehouse"], level: 9 },
  { type: BuildingTypes["Granary"], level: 8 },
  { type: BuildingTypes["Marketplace"], level: 3 },
];

module.exports = HighPriorityBuildings;
