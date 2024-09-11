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
  const targetsCoordinates = [{ x: 16, y: 100 }];

  return targetsCoordinates.map((coordinates) => ({
    villageName: "HDS 01",
    coordinates,
    unitName: UnitNames.SWORDSMAN,
    unitQtty: 400,
  }));
};

export default populateOasisFarms;
