import mongoose, { Document, Model, Schema } from "mongoose";

export interface IBuildingCategorySchema extends Document {
  name: string;
  value: number;
}

const BuildingCategorySchema: Schema<IBuildingCategorySchema> = new Schema({
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

const BuildingCategoryModel: Model<IBuildingCategorySchema> =
  mongoose.model<IBuildingCategorySchema>(
    "BuildingCategory",
    BuildingCategorySchema
  );

export default BuildingCategoryModel;
