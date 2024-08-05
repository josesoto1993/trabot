class Trade {
  constructor(from, to, lumber, clay, iron, crop) {
    this.from = from;
    this.to = to;
    this.lumber = lumber;
    this.clay = clay;
    this.iron = iron;
    this.crop = crop;
  }

  toString() {
    return `Trade from ${this.from.name} to ${this.to.name}, resources: {${this.lumber}, ${this.clay}, ${this.iron}, ${this.iron}}`;
  }
}

module.exports = Trade;
