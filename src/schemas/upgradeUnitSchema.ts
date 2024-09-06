import mongoose, { Document, Model, Schema } from "mongoose";
import UnitNames from "../constants/unitsNames";

export interface IUpgradeUnitSchema extends Document {
  _id: mongoose.Schema.Types.ObjectId;
  villageName: string;
  unitName: UnitNames;
}

const UpgradeUnitSchema: Schema<IUpgradeUnitSchema> = new Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  villageName: {
    type: String,
    required: true,
  },
  unitName: {
    type: String,
    required: true,
    enum: Object.values(UnitNames),
  },
});

const UpgradeUnitModel: Model<IUpgradeUnitSchema> =
  mongoose.model<IUpgradeUnitSchema>("UpgradeUnit", UpgradeUnitSchema);

export default UpgradeUnitModel;
