import mongoose, { Document, Model, Schema } from "mongoose";
import TileTypes from "../constants/tileTypes"; // Import your TileTypes enum

export interface ITileSchema extends Document {
  _id: mongoose.Schema.Types.ObjectId;
  coordinateX: number;
  coordinateY: number;
  tileName: string;
  tileType: TileTypes;
  villaData: string;
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

const TileSchema: Schema<ITileSchema> = new Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  coordinateX: {
    type: Number,
    required: true,
  },
  coordinateY: {
    type: Number,
    required: true,
  },
  tileName: {
    type: String,
    required: true,
  },
  tileType: {
    type: String,
    required: true,
    enum: Object.values(TileTypes),
  },
  villaData: {
    type: String,
    required: false,
  },
  att: {
    type: Number,
    required: false,
  },
  attC: {
    type: Number,
    required: false,
  },
  def: {
    type: Number,
    required: false,
  },
  defC: {
    type: Number,
    required: false,
  },
  wood: {
    type: Number,
    required: false,
  },
  clay: {
    type: Number,
    required: false,
  },
  iron: {
    type: Number,
    required: false,
  },
  crop: {
    type: Number,
    required: false,
  },
  upkeep: {
    type: Number,
    required: false,
  },
});

const TileModel: Model<ITileSchema> = mongoose.model<ITileSchema>(
  "Tile",
  TileSchema
);

export default TileModel;
