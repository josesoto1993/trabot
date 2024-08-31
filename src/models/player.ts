import Village from "../models/village"; // Adjust the import path if needed

class Player {
  villages: Village[];

  constructor(villages: Village[]) {
    this.villages = villages;
  }

  toString(): string {
    return `Player(villages: ${this.villages.map((v) => v.name).join(", ")})`;
  }
}

export default Player;
