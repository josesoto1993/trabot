const { getBuildingType } = require("../services/buildingTypeService");

const getHighPriorityBuildings = async () => {
  return [
    { type: await getBuildingType("Residence"), level: 10 },
    { type: await getBuildingType("Main Building"), level: 20 },
    { type: await getBuildingType("Grain Mill"), level: 5 },
    { type: await getBuildingType("Brickyard"), level: 5 },
    { type: await getBuildingType("Sawmill"), level: 5 },
    { type: await getBuildingType("Iron Foundry"), level: 5 },
    { type: await getBuildingType("Bakery"), level: 5 },
    { type: await getBuildingType("Warehouse"), level: 9 },
    { type: await getBuildingType("Granary"), level: 8 },
    { type: await getBuildingType("Marketplace"), level: 3 },
  ];
};

module.exports = getHighPriorityBuildings;
