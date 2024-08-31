const mongoose = require("mongoose");

const UnitSchema = new mongoose.Schema({
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

const UnitModel = mongoose.model("Unit", UnitSchema);

module.exports = UnitModel;
