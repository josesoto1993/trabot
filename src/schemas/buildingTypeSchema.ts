import mongoose, { Document, Model, Schema } from "mongoose";
import { IBuildingCategorySchema } from "./buildingCategorySchema";
import BuildingNames from "../constants/buildingNames";

export interface IBuildingTypeSchema extends Document {
  _id: mongoose.Schema.Types.ObjectId;
  structureId: number;
  name: BuildingNames;
  category: mongoose.Schema.Types.ObjectId | IBuildingCategorySchema;
  slot?: number | null;
}

const BuildingTypeSchema: Schema<IBuildingTypeSchema> = new Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  structureId: {
    type: Number,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    unique: true,
    enum: Object.values(BuildingNames),
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

const BuildingTypeModel: Model<IBuildingTypeSchema> =
  mongoose.model<IBuildingTypeSchema>("BuildingType", BuildingTypeSchema);

export default BuildingTypeModel;
