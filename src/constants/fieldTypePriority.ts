import FieldType from "../constants/fieldType";

const FieldTypePriority: Record<FieldType, number> = {
  [FieldType.CLAY]: 1,
  [FieldType.WOOD]: 2,
  [FieldType.IRON]: 3,
  [FieldType.CROP]: 4,
};

export default FieldTypePriority;
