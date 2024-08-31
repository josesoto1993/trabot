import Village from "./village";
import Resources from "./resources";

class Trade {
  from: Village;
  to: Village;
  resources: Resources;

  constructor(from: Village, to: Village, resources: Resources) {
    this.from = from;
    this.to = to;
    this.resources = resources;
  }

  toString(): string {
    return `Trade from ${this.from.name}[${this.from.availableMerchants}] to ${this.to.name}[${this.to.availableMerchants}] with ${this.resources}`;
  }
}

export default Trade;
