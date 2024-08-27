const mongoose = require("mongoose");

const TrainSchema = new mongoose.Schema({
  villageName: {
    type: String,
    required: true,
  },
  unitName: {
    type: String,
    required: true,
  },
});

const TrainModel = mongoose.model("Train", TrainSchema);

module.exports = TrainModel;
