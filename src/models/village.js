const Resources = require("../models/resources");

const DEFICIT_THRESHOLD = 0.4;
const DEFICIT_THRESHOLD_NEGATIVE_PRODUCTION = 0.7;
const DEFICIT_MAX_VALUE = 35000;
const REQUEST_THRESHOLD = 0.6;
const REQUEST_THRESHOLD_NEGATIVE_PRODUCTION = 0.8;

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
    consumption = null,
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
    capital = false,
    skipOverflow = false,
    skipDeficit = false,
    skipCreation = false,
    skipUpgrade = false
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
    this.consumption = consumption;
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
    this.skipOverflow = skipOverflow;
    this.skipDeficit = skipDeficit;
    this.skipCreation = skipCreation;
    this.skipUpgrade = skipUpgrade;
  }

  toString() {
    return `Village(id: ${this.id}, name: ${this.name})`;
  }

  getFutureResources = () => {
    return Resources.add(this.resources, this.ongoingResources);
  };

  getOverflowResources = () => {
    const overflowResources = new Resources(0, 0, 0, 0);

    Resources.getKeys().forEach((resourceType) => {
      const negativeProduction = this.getNetProduction()[resourceType] < 0;
      if (negativeProduction) {
        return 0;
      }

      const futureResources = this.getFutureResources()[resourceType];
      const maxCapacity = this.capacity[resourceType];

      if (futureResources > maxCapacity * OVERFLOW_THRESHOLD) {
        overflowResources[resourceType] =
          futureResources - maxCapacity * OVERFLOW_SAFE_LEVEL;
      }
    });

    return overflowResources;
  };

  getDeficitResources = () => {
    const deficitResources = new Resources(0, 0, 0, 0);

    Resources.getKeys().forEach((resourceType) => {
      const futureResources = this.getFutureResources()[resourceType];
      const maxCapacity = this.capacity[resourceType];
      const negativeProduction = this.getNetProduction()[resourceType] < 0;

      const thresholdDeficit = this.getThresholdDeficit(
        maxCapacity,
        negativeProduction
      );

      if (futureResources < thresholdDeficit) {
        const thresholdRequest = this.getThresholdRequest(
          maxCapacity,
          negativeProduction
        );
        deficitResources[resourceType] = thresholdRequest - futureResources;
      }
    });

    return deficitResources;
  };

  getThresholdRequest = (maxCapacity, negativeProduction) => {
    if (negativeProduction) {
      return maxCapacity * REQUEST_THRESHOLD_NEGATIVE_PRODUCTION;
    } else {
      return Math.min(maxCapacity * REQUEST_THRESHOLD, DEFICIT_MAX_VALUE);
    }
  };

  getThresholdDeficit = (maxCapacity, negativeProduction) => {
    if (negativeProduction) {
      return maxCapacity * DEFICIT_THRESHOLD_NEGATIVE_PRODUCTION;
    } else {
      return Math.min(maxCapacity * DEFICIT_THRESHOLD, DEFICIT_MAX_VALUE);
    }
  };

  getNetProduction = () => {
    return Resources.subtract(
      this.production,
      new Resources(0, 0, 0, this.consumption)
    );
  };
}

module.exports = Village;
