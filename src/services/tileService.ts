import mongoose from "mongoose";
import ICoordinates from "../commonInterfaces/coordinates";
import TileTypes from "../constants/tileTypes";
import { ITileTitleData } from "../mapScanner/tileData";
import TileModel, { ITileSchema } from "../schemas/tileSchema";

export interface ITileUpsertData {
  tileName: string;
  coordinates: ICoordinates;
  tileType: TileTypes;
  villaData?: string;
  att?: number;
  attC?: number;
  def?: number;
  defC?: number;
  wood?: number;
  clay?: number;
  iron?: number;
  crop?: number;
  upkeep?: number;
}
export interface ITile {
  _id: mongoose.Schema.Types.ObjectId;
  coordinates: ICoordinates;
  tileName: string;
  tileType: TileTypes;
  villaData: string;
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

export const getAllTiles = async (): Promise<ITile[]> => {
  const tiles: ITileSchema[] = await TileModel.find();
  return tiles.map(parseTileSchemaToTile);
};

export const getTile = async (
  coordinates: ICoordinates
): Promise<ITile | null> => {
  const filter = { coordinateX: coordinates.x, coordinateY: coordinates.y };
  const tileSchema = await TileModel.findOne(filter);
  return tileSchema ? parseTileSchemaToTile(tileSchema) : null;
};

export const deleteTile = async (
  coordinates: ICoordinates
): Promise<boolean> => {
  const filter = { coordinateX: coordinates.x, coordinateY: coordinates.y };
  const result = await TileModel.deleteOne(filter);
  return result.deletedCount > 0;
};

export const upsertTile = async (
  tile: ITileUpsertData | ITileTitleData
): Promise<ITileSchema | null> => {
  const data = parseTileDataToTileUpsert(tile);

  const filter = {
    coordinateX: data.coordinates.x,
    coordinateY: data.coordinates.y,
  };
  const update = {
    tileName: data.tileName,
    tileType: data.tileType,
    villaData: data.villaData || null,
    att: data.att || 0,
    attC: data.attC || 0,
    def: data.def || 0,
    defC: data.defC || 0,
    wood: data.wood || 0,
    clay: data.clay || 0,
    iron: data.iron || 0,
    crop: data.crop || 0,
    upkeep: data.upkeep || 0,
  };
  const options = { new: true, upsert: true };

  return await TileModel.findOneAndUpdate(filter, update, options);
};

const parseTileDataToTileUpsert = (
  tile: ITileTitleData | ITileUpsertData
): ITileUpsertData => {
  if (isTileUpsertData(tile)) {
    return tile;
  }

  const { tileName, coordinates, tileType, villaData, troopData } = tile;
  return {
    tileName,
    coordinates,
    tileType,
    villaData,
    att: troopData.att,
    attC: troopData.attC,
    def: troopData.def,
    defC: troopData.defC,
    wood: troopData.wood,
    clay: troopData.clay,
    iron: troopData.iron,
    crop: troopData.crop,
    upkeep: troopData.upkeep,
  };
};

const isTileUpsertData = (
  tile: ITileTitleData | ITileUpsertData
): tile is ITileUpsertData => {
  return (tile as ITileUpsertData).att !== undefined;
};

export const parseTileSchemaToTile = (tileSchema: ITileSchema): ITile => {
  return {
    _id: tileSchema._id,
    coordinates: {
      x: tileSchema.coordinateX,
      y: tileSchema.coordinateY,
    },
    tileName: tileSchema.tileName,
    tileType: tileSchema.tileType,
    villaData: tileSchema.villaData,
    att: tileSchema.att,
    attC: tileSchema.attC,
    def: tileSchema.def,
    defC: tileSchema.defC,
    wood: tileSchema.wood,
    clay: tileSchema.clay,
    iron: tileSchema.iron,
    crop: tileSchema.crop,
    upkeep: tileSchema.upkeep,
  };
};
