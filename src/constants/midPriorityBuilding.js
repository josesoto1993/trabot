const BuildingTypes = require("./buildingTypes");

const HighPriorityBuildings = [
  { type: BuildingTypes["Barracks"], level: 3 },
  { type: BuildingTypes["Academy"], level: 20 },
  { type: BuildingTypes["Town Hall"], level: 10 },
  { type: BuildingTypes["Marketplace"], level: 10 },
];

module.exports = HighPriorityBuildings;
