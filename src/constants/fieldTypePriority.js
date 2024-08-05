const FieldType = require("../constants/fieldType");

const FieldTypePriority = {
  [FieldType.clay]: 1,
  [FieldType.wood]: 2,
  [FieldType.iron]: 3,
  [FieldType.crop]: 4,
};

module.exports = FieldTypePriority;
