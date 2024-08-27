const { getTrainList } = require("../services/trainService");

const ensureTrainCollectionExists = async () => {
  console.log("Ensure train table exist or else create");
  try {
    await getTrainList();
    console.log("Train collection ensured.");
  } catch (error) {
    console.error("Error ensuring Train collection exists:", error);
  }
};

module.exports = ensureTrainCollectionExists;
