class ResourceField {
  constructor(id, level, constructionStatus, fieldType) {
    this.id = id;
    this.level = level;
    this.constructionStatus = constructionStatus;
    this.fieldType = fieldType;
  }

  toString() {
    return `Field(id: ${this.id}, level: ${this.level}, constructionStatus: ${this.constructionStatus}, fieldType: ${this.fieldType})`;
  }
}

module.exports = ResourceField;
