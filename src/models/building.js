class Building {
  constructor(id, slotId, name, level, constructionStatus) {
    this.id = id;
    this.slotId = slotId;
    this.name = name;
    this.level = level;
    this.constructionStatus = constructionStatus;
  }

  toString() {
    return `Building(id: ${this.id}, citySlotId: ${this.slotId}, name: ${this.name}, level: ${this.level}, constructionStatus: ${this.constructionStatus})`;
  }
}

module.exports = Building;
