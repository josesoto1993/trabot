class Village {
  constructor(
    id,
    name,
    coordinateX,
    coordinateY,
    active,
    resources,
    production,
    capacity
  ) {
    this.id = id;
    this.name = name;
    this.coordinateX = coordinateX;
    this.coordinateY = coordinateY;
    this.active = active;
    this.resources = resources;
    this.production = production;
    this.capacity = capacity;
  }

  toString() {
    return `Village(id: ${this.id}, name: ${this.name}, coordX: ${this.coordinateX}, coordY: ${this.coordinateY}, active: ${this.active}, resources: ${this.resources}, production: ${this.production}, capacity: ${this.capacity})`;
  }
}

module.exports = Village;
