import mongoose, { Document, Model, Schema } from "mongoose";

export interface ITrainSchema extends Document {
  villageName: string;
  unitName: string;
}

const TrainSchema: Schema<ITrainSchema> = new Schema({
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
