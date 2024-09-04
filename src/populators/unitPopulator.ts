import { IUnitUpsertData, upsertUnit } from "../services/unitService";
import { getBuildingType } from "../services/buildingTypeService";
import BuildingNames from "../constants/buildingNames";
import UnitNames from "../constants/unitsNames";

const populateUnits = async (): Promise<void> => {
  console.log("start populating units");

  const units = await getBaseUnits();
  for (const unit of units) {
    try {
      await upsertUnit(unit);
    } catch (error) {
      console.error(`Error upserting unit "${unit.name}":`, error);
    }
  }

  console.log("finish populating units");
};

const getBaseUnits = async (): Promise<IUnitUpsertData[]> => {
  const barracks = await getBuildingType(BuildingNames.BARRACKS);
  const stable = await getBuildingType(BuildingNames.STABLE);
  const workshop = await getBuildingType(BuildingNames.WORKSHOP);
  const residence = await getBuildingType(BuildingNames.RESIDENCE);

  return [
    {
      name: UnitNames.PHALANX,
      selector: "t1",
      building: barracks,
    },
    {
      name: UnitNames.SWORDSMAN,
      selector: "t2",
      building: barracks,
    },
    {
      name: UnitNames.PATHFINDER,
      selector: "t3",
      building: stable,
    },
    {
      name: UnitNames.THEUTATES_THUNDER,
      selector: "t4",
      building: stable,
    },
    {
      name: UnitNames.DRUIDRIDER,
      selector: "t5",
      building: stable,
    },
    {
      name: UnitNames.HAEDUAN,
      selector: "t6",
      building: stable,
    },
    {
      name: UnitNames.RAM,
      selector: "t7",
      building: workshop,
    },
    {
      name: UnitNames.TREBUCHET,
      selector: "t8",
      building: workshop,
    },
    {
      name: UnitNames.CHIEFTAIN,
      selector: "t9",
      building: residence,
    },
    {
      name: UnitNames.SETTLER,
      selector: "t10",
      building: residence,
    },
    {
      name: UnitNames.TRAPS,
      selector: "t911",
      building: residence,
    },
  ];
};

export default populateUnits;
