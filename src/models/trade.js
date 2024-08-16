class Trade {
  constructor(from, to, resources) {
    this.from = from;
    this.to = to;
    this.resources = resources;
  }

  toString() {
    return `Trade from ${this.from.name}[${this.from.availableMerchants}] to ${this.from.name}[${this.from.availableMerchants}] with ${this.resources}`;
  }
}

module.exports = Trade;
