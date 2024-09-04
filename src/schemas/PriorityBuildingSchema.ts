import mongoose, { Document, Model, Schema } from "mongoose";
import PriorityLevels from "../constants/priorityLevels";
import { IBuildingTypeSchema } from "./buildingTypeSchema";

export interface IPriorityBuildingSchema extends Document {
  _id: mongoose.Schema.Types.ObjectId;
  priority: PriorityLevels;
  building: mongoose.Schema.Types.ObjectId | IBuildingTypeSchema;
  buildingAuxName: string;
  targetLevel: number;
}

const PriorityBuildingSchema: Schema<IPriorityBuildingSchema> = new Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
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

const PriorityBuildingModel: Model<IPriorityBuildingSchema> =
  mongoose.model<IPriorityBuildingSchema>(
    "PriorityBuilding",
    PriorityBuildingSchema
  );

export default PriorityBuildingModel;
