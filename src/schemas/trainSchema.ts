import mongoose, { Document, Model, Schema } from "mongoose";
import UnitNames from "../constants/unitsNames";

export interface ITrainSchema extends Document {
  _id: mongoose.Schema.Types.ObjectId;
  villageName: string;
  unitName: UnitNames;
}

const TrainSchema: Schema<ITrainSchema> = new Schema({
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

const TrainModel: Model<ITrainSchema> = mongoose.model<ITrainSchema>(
  "Train",
  TrainSchema
);

export default TrainModel;
