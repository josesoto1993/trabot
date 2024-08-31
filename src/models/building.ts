class Building {
  constructor(structureId, slotId, name, level, constructionStatus) {
    this.structureId = structureId;
    this.slotId = slotId;
    this.name = name;
    this.level = level;
    this.constructionStatus = constructionStatus;
  }

  toString() {
    return `Building(structureId: ${this.structureId}, citySlotId: ${this.slotId}, name: ${this.name}, level: ${this.level}, constructionStatus: ${this.constructionStatus})`;
  }
}

module.exports = Building;
