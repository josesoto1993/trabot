import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUpgradeUnitSchema extends Document {
  villageName: string;
  unitName: string;
}

const UpgradeUnitSchema: Schema<IUpgradeUnitSchema> = new Schema({
  villageName: {
    type: String,
    required: true,
  },
  unitName: {
    type: String,
    required: true,
  },
});

const UpgradeUnitModel: Model<IUpgradeUnitSchema> =
  mongoose.model<IUpgradeUnitSchema>("UpgradeUnit", UpgradeUnitSchema);

export default UpgradeUnitModel;
