class Building {
  structureId: number;
  slotId: number;
  name: string;
  level: number;
  constructionStatus: string;

  constructor(
    structureId: number,
    slotId: number,
    name: string,
    level: number,
    constructionStatus: string
  ) {
    this.structureId = structureId;
    this.slotId = slotId;
    this.name = name;
    this.level = level;
    this.constructionStatus = constructionStatus;
  }

  toString(): string {
    return `Building(structureId: ${this.structureId}, citySlotId: ${this.slotId}, name: ${this.name}, level: ${this.level}, constructionStatus: ${this.constructionStatus})`;
  }
}

export default Building;
