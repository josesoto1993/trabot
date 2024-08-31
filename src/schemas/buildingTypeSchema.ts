import mongoose, { Document, Model, Schema } from "mongoose";
import { IBuildingCategorySchema } from "./buildingCategorySchema";

export interface IBuildingTypeSchema extends Document {
  structureId: number;
  name: string;
  category: mongoose.Schema.Types.ObjectId | IBuildingCategorySchema;
  slot?: number | null;
}

const BuildingTypeSchema: Schema<IBuildingTypeSchema> = new Schema({
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

const BuildingTypeModel: Model<IBuildingTypeSchema> =
  mongoose.model<IBuildingTypeSchema>("BuildingType", BuildingTypeSchema);

export default BuildingTypeModel;
