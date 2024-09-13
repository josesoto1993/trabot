import ConstructionStatus from "../constants/constructionStatus";
import FieldType from "../constants/fieldType";

class ResourceField {
  slotId: number;
  level: number;
  constructionStatus: ConstructionStatus;
  fieldType: FieldType;

  constructor(
    slotId: number,
    level: number,
    constructionStatus: ConstructionStatus,
    fieldType: FieldType
  ) {
    this.slotId = slotId;
    this.level = level;
    this.constructionStatus = constructionStatus;
    this.fieldType = fieldType;
  }

  toString(): string {
    return `Field(slotId: ${this.slotId}, level: ${this.level}, constructionStatus: ${this.constructionStatus}, fieldType: ${this.fieldType})`;
  }
}

export default ResourceField;
