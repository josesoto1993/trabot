class Village {
  constructor(
    id,
    name,
    coordinateX,
    coordinateY,
    active,
    resources,
    production,
    capacity,
    ongoingResources,
    availableMerchants,
    maxMerchants
  ) {
    this.id = id;
    this.name = name;
    this.coordinateX = coordinateX;
    this.coordinateY = coordinateY;
    this.active = active;
    this.resources = resources;
    this.production = production;
    this.capacity = capacity;
    this.ongoingResources = ongoingResources;
    this.availableMerchants = availableMerchants;
    this.maxMerchants = maxMerchants;
  }

  toString() {
    return `Village(id: ${this.id}, name: ${this.name}, coordX: ${this.coordinateX}, coordY: ${this.coordinateY}, active: ${this.active}, resources: ${this.resources}, production: ${this.production}, capacity: ${this.capacity}, ongoingResources: ${this.ongoingResources}, availableMerchants: ${this.availableMerchants}, maxMerchants: ${this.maxMerchants})`;
  }
}

module.exports = Village;
