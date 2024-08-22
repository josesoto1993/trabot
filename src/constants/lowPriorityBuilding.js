const { getBuildingType } = require("../services/buildingTypeService");

const getLowPriorityBuildings = async () => {
  return [
    { type: await getBuildingType("Warehouse"), level: 20 },
    { type: await getBuildingType("Granary"), level: 20 },
    { type: await getBuildingType("Marketplace"), level: 20 },
    { type: await getBuildingType("Stonemason's Lodge"), level: 20 },
    { type: await getBuildingType("Palace"), level: 20 },
    { type: await getBuildingType("Rally Point"), level: 10 },
    { type: await getBuildingType("Palisade"), level: 10 },
    { type: await getBuildingType("Trade Office"), level: 10 },
    { type: await getBuildingType("Embassy"), level: 20 },
  ];
};

module.exports = getLowPriorityBuildings;
