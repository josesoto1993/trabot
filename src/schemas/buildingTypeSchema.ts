const mongoose = require("mongoose");

const BuildingTypeSchema = new mongoose.Schema({
  structureId: {
    type: Number,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BuildingCategory",
    required: true,
  },
  slot: {
    type: Number,
    default: null,
  },
});

const BuildingTypeModel = mongoose.model("BuildingType", BuildingTypeSchema);

module.exports = BuildingTypeModel;
