class Player {
  constructor(villages) {
    this.villages = villages;
  }

  toString() {
    return `Player(villages: ${this.villages.map((v) => v.name).join(", ")})`;
  }
}

module.exports = Player;
