import UnitNames from "../constants/unitsNames";
import { getUnit } from "../services/unitService";

export interface ITroopInputData {
  unitName: UnitNames;
  quantity: number;
}
export interface ITroopData {
  att: number;
  attC: number;
  def: number;
  defC: number;
  wood: number;
  clay: number;
  iron: number;
  crop: number;
  upkeep: number;
}

const calculateUnitsData = async (
  troops: ITroopInputData[]
): Promise<ITroopData> => {
  const totals: ITroopData = {
    att: 0,
    attC: 0,
    def: 0,
    defC: 0,
    wood: 0,
    clay: 0,
    iron: 0,
    crop: 0,
    upkeep: 0,
  };

  for (const troop of troops) {
    const troopData = await calculateUnitData(troop);

    totals.att += troopData.att;
    totals.attC += troopData.attC;
    totals.def += troopData.def;
    totals.defC += troopData.defC;
    totals.wood += troopData.wood;
    totals.clay += troopData.clay;
    totals.iron += troopData.iron;
    totals.crop += troopData.crop;
    totals.upkeep += troopData.upkeep;
  }

  return totals;
};

const calculateUnitData = async (
  troop: ITroopInputData
): Promise<ITroopData> => {
  const unit = await getUnit(troop.unitName);

  if (!unit) {
    return {
      att: 0,
      attC: 0,
      def: 0,
      defC: 0,
      wood: 0,
      clay: 0,
      iron: 0,
      crop: 0,
      upkeep: 0,
    };
  }

  return {
    att: unit.att * troop.quantity,
    attC: unit.attC * troop.quantity,
    def: unit.def * troop.quantity,
    defC: unit.defC * troop.quantity,
    wood: unit.wood * troop.quantity,
    clay: unit.clay * troop.quantity,
    iron: unit.iron * troop.quantity,
    crop: unit.crop * troop.quantity,
    upkeep: unit.upkeep * troop.quantity,
  };
};

export default calculateUnitsData;
