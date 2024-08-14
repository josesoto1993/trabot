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
    celebrationTime = null,
    availableMerchants = null,
    maxMerchants = null,
    resourceFields = [],
    buildings = [],
    buildFinishAt = null,
    barracksTime = null,
    stableTime = null,
    workshopTime = null,
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
    this.celebrationTime = celebrationTime;
    this.availableMerchants = availableMerchants;
    this.maxMerchants = maxMerchants;
    this.resourceFields = resourceFields;
    this.buildings = buildings;
    this.buildFinishAt = buildFinishAt;
    this.capital = capital;
    this.barracksTime = barracksTime;
    this.stableTime = stableTime;
    this.workshopTime = workshopTime;
  }

  toString() {
    return `Village(id: ${this.id}, name: ${this.name})`;
  }
}

module.exports = Village;
