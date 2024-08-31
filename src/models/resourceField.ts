class ResourceField {
  slotId: string;
  level: number;
  constructionStatus: string;
  fieldType: string;

  constructor(
    slotId: string,
    level: number,
    constructionStatus: string,
    fieldType: string
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
