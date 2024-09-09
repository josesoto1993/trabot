import TileTypes from "../constants/tileTypes";
import UnitNames from "../constants/unitsNames";
import OasisFarmModel, { IOasisFarmSchema } from "../schemas/oasisFarmSchema";
import { getTile, ITile } from "./tileService";
import { getUnit, IUnit } from "./unitService";

export interface IOasisFarmUpsertData {
  villageName: string;
  coordinateX: number;
  coordinateY: number;
  unitName: UnitNames;
  unitQtty: number;
  lastAttack?: Date;
}
export interface IOasisFarm extends IOasisFarmSchema {
  tile: ITile;
  unit: IUnit;
}

export const getAllOasisFarms = async (): Promise<IOasisFarm[]> => {
  const options = [
    { path: "tile" },
    {
      path: "unit",
      populate: {
        path: "building",
        model: "BuildingType",
        populate: {
          path: "category",
          model: "BuildingCategory",
        },
      },
    },
  ];

  const populatedOasisFarms = await OasisFarmModel.find()
    .populate(options)
    .exec();
  return populatedOasisFarms.map((doc) => doc.toObject() as IOasisFarm);
};

export const deleteOasisFarm = async (
  coordinateX: number,
  coordinateY: number
): Promise<boolean> => {
  const tile = await getTile(coordinateX, coordinateY);
  if (!tile) {
    console.log(
      `ERROR! cant find oasis to delete at: (${coordinateX}|${coordinateY})`
    );
    return false;
  }

  const filter = { tile: tile._id };
  const result = await OasisFarmModel.deleteOne(filter);

  return result.deletedCount > 0;
};

export const upsertOasisFarm = async (
  oasisFarmData: IOasisFarmUpsertData
): Promise<IOasisFarmSchema | null> => {
  const tile = await getTile(
    oasisFarmData.coordinateX,
    oasisFarmData.coordinateY
  );
  if (!tile) {
    console.log(
      `ERROR! Can't find oasis to add at: (${oasisFarmData.coordinateX}|${oasisFarmData.coordinateY})`
    );
    return null;
  }
  if (
    tile.tileType !== TileTypes.UNOCUPPIED_OASIS &&
    tile.tileType !== TileTypes.OCCUPIED_OASIS
  ) {
    console.log(
      `ERROR! tile at (${oasisFarmData.coordinateX}|${oasisFarmData.coordinateY}) is not an oasis`
    );
    return null;
  }

  const unit = await getUnit(oasisFarmData.unitName);
  if (!unit) {
    console.log(`ERROR! Can't find unit ${oasisFarmData.unitName}`);
    return null;
  }

  const filter = {
    tile: tile._id,
  };
  const update: any = {
    villageName: oasisFarmData.villageName,
    unit: unit._id,
    unitQtty: oasisFarmData.unitQtty,
  };
  if (oasisFarmData.lastAttack) {
    update.lastAttack = oasisFarmData.lastAttack;
  }
  const options = { new: true, upsert: true };

  return await OasisFarmModel.findOneAndUpdate(filter, update, options);
};

export const updateOasisFarmTime = async (
  oasisFarm: IOasisFarm
): Promise<IOasisFarmSchema | null> => {
  const filter = {
    _id: oasisFarm._id,
  };
  const update = { lastAttack: new Date() };
  const options = { new: true, upsert: true };

  return await OasisFarmModel.findOneAndUpdate(filter, update, options);
};
