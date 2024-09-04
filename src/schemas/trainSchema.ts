import mongoose, { Document, Model, Schema } from "mongoose";

export interface ITrainSchema extends Document {
  _id: mongoose.Schema.Types.ObjectId;
  villageName: string;
  unitName: string;
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
  },
});

const TrainModel: Model<ITrainSchema> = mongoose.model<ITrainSchema>(
  "Train",
  TrainSchema
);

export default TrainModel;
