import mongoose from "mongoose";
import ICoordinates from "../commonInterfaces/coordinates";
import TileTypes from "../constants/tileTypes";
import UnitNames from "../constants/unitsNames";
import OasisFarmModel, { IOasisFarmSchema } from "../schemas/oasisFarmSchema";
import { getTile, getTileById, ITile } from "./tileService";
import { getUnit, getUnitById, IUnit } from "./unitService";
import ISquadron from "../commonInterfaces/squadron";

export interface IOasisFarmUpsertData {
  villageName: string;
  coordinates: ICoordinates;
  unitName: UnitNames;
  unitQtty: number;
  lastAttack?: Date;
}
export interface IOasisFarm {
  _id: mongoose.Schema.Types.ObjectId;
  villageName: string;
  tile: ITile;
  squadron: ISquadron;
  lastAttack?: Date;
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

  const populatedOasisFarms: IOasisFarmSchema[] = await OasisFarmModel.find()
    .populate(options)
    .exec();

  return Promise.all(
    populatedOasisFarms.map((doc) => parseOasisFarmSchemaToOasisFarm(doc))
  );
};

export const deleteOasisFarm = async (
  coordinates: ICoordinates
): Promise<boolean> => {
  const tile = await getTile(coordinates);
  if (!tile) {
    console.log(
      `ERROR! cant find oasis to delete at: (${coordinates.x}|${coordinates.y})`
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
  const tile = await getTile(oasisFarmData.coordinates);
  if (!tile) {
    console.log(
      `ERROR! Can't find oasis to add at: (${oasisFarmData.coordinates.x}|${oasisFarmData.coordinates.y})`
    );
    return null;
  }
  if (
    tile.tileType !== TileTypes.UNOCUPPIED_OASIS &&
    tile.tileType !== TileTypes.OCCUPIED_OASIS
  ) {
    console.log(
      `ERROR! tile at (${oasisFarmData.coordinates.x}|${oasisFarmData.coordinates.y}) is not an oasis`
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
  oasisFarm: IOasisFarm | IOasisFarmSchema
): Promise<IOasisFarmSchema | null> => {
  const filter = {
    _id: oasisFarm._id,
  };
  const update = { lastAttack: new Date() };
  const options = { new: true, upsert: true };

  return await OasisFarmModel.findOneAndUpdate(filter, update, options);
};

export const parseOasisFarmSchemaToOasisFarm = async (
  oasisFarm: IOasisFarmSchema
): Promise<IOasisFarm> => {
  const tile = mongoose.isValidObjectId(oasisFarm.tile)
    ? await getTileById(oasisFarm.tile as mongoose.Schema.Types.ObjectId)
    : (oasisFarm.tile as ITile);

  if (!tile) {
    throw new Error(`Tile could not be found`);
  }

  const unit = mongoose.isValidObjectId(oasisFarm.unit)
    ? await getUnitById(oasisFarm.unit as mongoose.Schema.Types.ObjectId)
    : (oasisFarm.unit as IUnit);

  if (!unit) {
    throw new Error(`Unit could not be found`);
  }

  return {
    _id: oasisFarm._id,
    villageName: oasisFarm.villageName,
    tile,
    squadron: {
      unit,
      quantity: oasisFarm.unitQtty,
    },
    lastAttack: oasisFarm.lastAttack,
  };
};
