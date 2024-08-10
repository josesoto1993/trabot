const BuildingTypes = require("./buildingTypes");

const HighPriorityBuildings = [
  { type: BuildingTypes["Grain Mill"], level: 5 },
  { type: BuildingTypes["Brickyard"], level: 5 },
  { type: BuildingTypes["Sawmill"], level: 5 },
  { type: BuildingTypes["Iron Foundry"], level: 5 },
  { type: BuildingTypes["Bakery"], level: 5 },
  { type: BuildingTypes["Residence"], level: 10 },
  { type: BuildingTypes["Barracks"], level: 3 },
  { type: BuildingTypes["Academy"], level: 20 },
  { type: BuildingTypes["Town Hall"], level: 10 },
];

module.exports = HighPriorityBuildings;
