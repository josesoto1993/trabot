import { getAllTiles } from "../services/tileService";

const ensureTileCollectionExists = async (): Promise<void> => {
  console.log("Ensure Tile table exists or else create");
  try {
    await getAllTiles();
    console.log("Tile collection ensured.");
  } catch (error) {
    console.error("Error ensuring Tile collection exists:", error);
  }
};

export default ensureTileCollectionExists;
