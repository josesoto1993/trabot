class Village {
  constructor(id, name, coordinateX, coordinateY, active) {
    this.id = id;
    this.name = name;
    this.coordinateX = coordinateX;
    this.coordinateY = coordinateY;
    this.active = active;
  }

  toString() {
    return `Village(id: ${this.id}, name: ${this.name}, coordX: ${this.coordinateX}, coordY: ${this.coordinateY}, active: ${this.active})`;
  }
}

module.exports = Village;
