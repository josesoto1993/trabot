import mongoose, { Document, Model, Schema } from "mongoose";
import { IBuildingTypeSchema } from "../schemas/buildingTypeSchema";
import UnitNames from "../constants/unitsNames";

export interface IUnitSchema extends Document {
  _id: mongoose.Schema.Types.ObjectId;
  name: UnitNames;
  selector: string;
  building: mongoose.Schema.Types.ObjectId | IBuildingTypeSchema;
  att: number;
  attC: number;
  def: number;
  defC: number;
  wood: number;
  clay: number;
  iron: number;
  crop: number;
  upkeep: number;
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
    enum: Object.values(UnitNames),
  },
  selector: {
    type: String,
    required: true,
    unique: false,
  },
  building: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BuildingType",
    required: false,
  },
  att: {
    type: Number,
    required: true,
  },
  attC: {
    type: Number,
    required: true,
  },
  def: {
    type: Number,
    required: true,
  },
  defC: {
    type: Number,
    required: true,
  },
  wood: {
    type: Number,
    required: true,
  },
  clay: {
    type: Number,
    required: true,
  },
  iron: {
    type: Number,
    required: true,
  },
  crop: {
    type: Number,
    required: true,
  },
  upkeep: {
    type: Number,
    required: true,
  },
});

const UnitModel: Model<IUnitSchema> = mongoose.model<IUnitSchema>(
  "Unit",
  UnitSchema
);

export default UnitModel;
