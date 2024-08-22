const { getBuildingType } = require("../services/buildingTypeService");

const getMidPriorityBuildings = async () => {
  return [
    { type: await getBuildingType("Barracks"), level: 3 },
    { type: await getBuildingType("Town Hall"), level: 10 },
    { type: await getBuildingType("Marketplace"), level: 10 },
    { type: await getBuildingType("Academy"), level: 20 },
  ];
};

module.exports = getMidPriorityBuildings;
