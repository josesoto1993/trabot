const mongoose = require("mongoose");

const BuildingCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  value: {
    type: Number,
    required: true,
  },
});

const BuildingCategoryModel = mongoose.model(
  "BuildingCategory",
  BuildingCategorySchema
);

module.exports = BuildingCategoryModel;
