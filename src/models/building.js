class Building {
  constructor(id, citySlotId, name, level, constructionStatus) {
    this.id = id;
    this.citySlotId = citySlotId;
    this.name = name;
    this.level = level;
    this.constructionStatus = constructionStatus;
  }

  toString() {
    return `Building(id: ${this.id}, citySlotId: ${this.citySlotId}, name: ${this.name}, level: ${this.level}, constructionStatus: ${this.constructionStatus})`;
  }
}

module.exports = Building;
