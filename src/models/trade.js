class Trade {
  constructor(from, to, ammount) {
    this.from = from;
    this.to = to;
    this.ammount = ammount;
  }

  toString() {
    return `Trade from ${this.from.name} to ${this.to.name} with ${this.ammount}`;
  }
}

module.exports = Trade;
