import mongoose, { Document, Schema, Model } from "mongoose";
import { ITile } from "../services/tileService";
import { IUnit } from "../services/unitService";

export interface IOasisFarmSchema extends Document {
  _id: mongoose.Schema.Types.ObjectId;
  villageName: string;
  tile: mongoose.Schema.Types.ObjectId | ITile;
  unit: mongoose.Schema.Types.ObjectId | IUnit;
  unitQtty: number;
  lastAttack?: Date;
}

const OasisFarmSchema: Schema<IOasisFarmSchema> = new Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  villageName: {
    type: String,
    required: true,
  },
  tile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tile",
    required: true,
    unique: true,
  },
  unit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Unit",
    required: true,
  },
  unitQtty: {
    type: Number,
    required: true,
  },
  lastAttack: {
    type: Date,
    default: Date.now(),
  },
});

const OasisFarmModel: Model<IOasisFarmSchema> =
  mongoose.model<IOasisFarmSchema>("OasisFarm", OasisFarmSchema);

export default OasisFarmModel;
