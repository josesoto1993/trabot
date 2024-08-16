const Resources = require("../models/resources");

const DEFICIT_THRESHOLD = 0.4;
const DEFICIT_MAX_VALUE = 35000;
const REQUEST_THRESHOLD = 0.6;

const OVERFLOW_THRESHOLD = 0.8;
const OVERFLOW_SAFE_LEVEL = 0.6;

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
    upgradeTroopTime = null,
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
    this.barracksTime = barracksTime;
    this.stableTime = stableTime;
    this.workshopTime = workshopTime;
    this.upgradeTroopTime = upgradeTroopTime;
    this.capital = capital;
  }

  toString() {
    return `Village(id: ${this.id}, name: ${this.name})`;
  }

  getOverflowResources = () => {
    const futureResources = Resources.add(
      this.resources,
      this.ongoingResources
    );
    const overflowResources = new Resources(0, 0, 0, 0);

    Resources.getKeys().forEach((resourceType) => {
      const actual = this.futureResources[resourceType];
      const maxCapacity = this.capacity[resourceType];

      if (actual > maxCapacity * OVERFLOW_THRESHOLD) {
        overflowResources[resourceType] =
          actual - maxCapacity * OVERFLOW_SAFE_LEVEL;
      }
    });

    return overflowResources;
  };

  getDeficitResources = () => {
    const futureResources = Resources.add(
      this.resources,
      this.ongoingResources
    );
    const deficitResources = new Resources(0, 0, 0, 0);

    Resources.getKeys().forEach((resourceType) => {
      const actual = futureResources[resourceType];
      const maxCapacity = this.capacity[resourceType];
      const negativeProduction = this.production[resourceType] < 0;

      const thresholdDeficit = this.getThresholdDeficit(
        maxCapacity,
        negativeProduction
      );

      if (actual < thresholdDeficit) {
        const thresholdRequest = this.getThresholdRequest(
          maxCapacity,
          negativeProduction
        );
        deficitResources[resourceType] = thresholdRequest - actual;
      }
    });

    return deficitResources;
  };

  getThresholdRequest = (maxCapacity, negativeProduction) => {
    if (negativeProduction) {
      return maxCapacity * REQUEST_THRESHOLD;
    } else {
      return Math.min(maxCapacity * REQUEST_THRESHOLD, DEFICIT_MAX_VALUE);
    }
  };

  getThresholdDeficit = (maxCapacity, negativeProduction) => {
    if (negativeProduction) {
      return maxCapacity * DEFICIT_THRESHOLD;
    } else {
      return Math.min(maxCapacity * DEFICIT_THRESHOLD, DEFICIT_MAX_VALUE);
    }
  };
}

module.exports = Village;
