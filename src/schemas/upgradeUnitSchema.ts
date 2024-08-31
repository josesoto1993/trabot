const mongoose = require("mongoose");

const UpgradeUnitSchema = new mongoose.Schema({
  villageName: {
    type: String,
    required: true,
  },
  unitName: {
    type: String,
    required: true,
  },
});

const UpgradeUnitModel = mongoose.model("UpgradeUnit", UpgradeUnitSchema);

module.exports = UpgradeUnitModel;
