import { getTrainList } from "../services/trainService";

const ensureTrainCollectionExists = async (): Promise<void> => {
  console.log("Ensure train table exists or else create");
  try {
    await getTrainList();
    console.log("Train collection ensured.");
  } catch (error) {
    console.error("Error ensuring Train collection exists:", error);
  }
};

export default ensureTrainCollectionExists;
