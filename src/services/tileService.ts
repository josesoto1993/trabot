import TileTypes from "../constants/tileTypes";
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

export const getAllTiles = async (): Promise<ITileSchema[]> => {
  return await TileModel.find();
};

export const getTile = async (
  coordinateX: number,
  coordinateY: number
): Promise<ITileSchema | null> => {
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
  tile: ITileUpsertData
): Promise<ITileSchema | null> => {
  const filter = {
    coordinateX: tile.coordinateX,
    coordinateY: tile.coordinateY,
  };
  const update = {
    tileName: tile.tileName,
    tileType: tile.tileType,
    villaData: tile.villaData || null,
    att: tile.att || 0,
    attC: tile.attC || 0,
    def: tile.def || 0,
    defC: tile.defC || 0,
    wood: tile.wood || 0,
    clay: tile.clay || 0,
    iron: tile.iron || 0,
    crop: tile.crop || 0,
    upkeep: tile.upkeep || 0,
  };
  const options = { new: true, upsert: true };

  return await TileModel.findOneAndUpdate(filter, update, options);
};
