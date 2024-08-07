class Trade {
  constructor(from, to, resources) {
    this.from = from;
    this.to = to;
    this.resources = resources;
  }

  toString() {
    return `Trade from ${this.from.name} to ${this.to.name} with ${this.resources}`;
  }
}

module.exports = Trade;
