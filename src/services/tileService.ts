import TileTypes from "../constants/tileTypes";
import { ITileTitleData } from "../mapScanner/tileData";
import TileModel, { ITileSchema } from "../schemas/tileSchema";

export interface ITileUpsertData {
  tileName: string;
  coordinateX: number;
  coordinateY: number;
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
export interface ITile extends ITileSchema {}

export const getAllTiles = async (): Promise<ITile[]> => {
  return await TileModel.find();
};

export const getTile = async (
  coordinateX: number,
  coordinateY: number
): Promise<ITile | null> => {
  const filter = { coordinateX, coordinateY };
  return await TileModel.findOne(filter);
};

export const deleteTile = async (
  coordinateX: number,
  coordinateY: number
): Promise<boolean> => {
  const filter = { coordinateX, coordinateY };
  const result = await TileModel.deleteOne(filter);
  return result.deletedCount > 0;
};

export const upsertTile = async (
  tile: ITileUpsertData | ITileTitleData
): Promise<ITileSchema | null> => {
  const data = parseTileDataToTileUpsert(tile);

  const filter = {
    coordinateX: data.coordinateX,
    coordinateY: data.coordinateY,
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

  const { tileName, coordinateX, coordinateY, tileType, villaData, troopData } =
    tile;
  return {
    tileName,
    coordinateX,
    coordinateY,
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
