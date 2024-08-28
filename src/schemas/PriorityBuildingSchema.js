const mongoose = require("mongoose");
const PRIORITY_LEVELS = require("../constants/priorityLevels");

const PriorityBuildingSchema = new mongoose.Schema({
  priority: {
    type: String,
    required: true,
    enum: Object.values(PRIORITY_LEVELS),
  },
  building: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BuildingType",
    required: true,
  },
  targetLevel: {
    type: mongoose.Schema.Types.ObjectId,
    type: Number,
    required: true,
  },
});

const PriorityBuildingModel = mongoose.model(
  "PriorityBuilding",
  PriorityBuildingSchema
);

module.exports = PriorityBuildingModel;
