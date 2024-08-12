class Village {
  constructor(
    id,
    name,
    coordinateX,
    coordinateY,
    active = false,
    resources = null,
    production = null,
    capacity = null,
    ongoingResources = null,
    availableMerchants = null,
    maxMerchants = null,
    resourceFields = [],
    buildings = [],
    buildFinishAt = null,
    capital = false
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
    this.resourceFields = resourceFields;
    this.buildings = buildings;
    this.buildFinishAt = buildFinishAt;
    this.capital = capital;
  }

  toString() {
    return `Village(id: ${this.id}, name: ${this.name})`;
  }
}

module.exports = Village;
