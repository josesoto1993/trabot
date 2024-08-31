const mongoose = require("mongoose");
import { PriorityLevels } from "../constants/priorityLevels";

const PriorityBuildingSchema = new mongoose.Schema({
  priority: {
    type: String,
    required: true,
    enum: Object.values(PriorityLevels),
  },
  building: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BuildingType",
    required: true,
  },
  buildingAuxName: {
    type: String,
    required: true,
  },
  targetLevel: {
    type: Number,
    required: true,
  },
});

const PriorityBuildingModel = mongoose.model(
  "PriorityBuilding",
  PriorityBuildingSchema
);

module.exports = PriorityBuildingModel;
