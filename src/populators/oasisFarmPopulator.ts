import {
  IOasisFarmUpsertData,
  upsertOasisFarm,
} from "../services/oasisFarmService";
import UnitNames from "../constants/unitsNames";

const populateOasisFarms = async (): Promise<void> => {
  console.log("Populate Oasis Farm table");
  try {
    const oasisFarmData = getOasisFarmData();
    if (oasisFarmData.length > 0) {
      Promise.all(
        oasisFarmData.map(async (oasis) => await upsertOasisFarm(oasis))
      );
      console.log("Oasis added/updated:", oasisFarmData.length);
    }
  } catch (error) {
    console.error("Error Populating Oasis Farm collection:", error);
  }
};

const getOasisFarmData = (): IOasisFarmUpsertData[] => {
  const coords = [
    { x: 29, y: 101 },
    { x: 11, y: 99 },
    { x: 10, y: 100 },
    { x: 25, y: 107 },
    { x: 21, y: 98 },
    { x: 13, y: 98 },
    { x: 20, y: 105 },
    { x: 9, y: 107 },
    { x: 8, y: 98 },
    { x: 19, y: 101 },
  ];

  return coords.map((coord) => ({
    coordinateX: coord.x,
    coordinateY: coord.y,
    unitName: UnitNames.SWORDSMAN,
    unitQtty: 400,
    lastAttack: new Date(),
  }));
};

export default populateOasisFarms;
