import mongoose, { Document, Model, Schema } from "mongoose";
import { IBuildingTypeSchema } from "../schemas/buildingTypeSchema";

export interface IUnitSchema extends Document {
  _id: mongoose.Schema.Types.ObjectId;
  name: string;
  selector: string;
  building: mongoose.Schema.Types.ObjectId | IBuildingTypeSchema;
}

const UnitSchema: Schema<IUnitSchema> = new Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  selector: {
    type: String,
    required: true,
    unique: true,
  },
  building: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BuildingType",
    required: true,
  },
});

const UnitModel: Model<IUnitSchema> = mongoose.model<IUnitSchema>(
  "Unit",
  UnitSchema
);

export default UnitModel;
