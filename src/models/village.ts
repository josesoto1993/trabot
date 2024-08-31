import Building from "./building";
import ResourceField from "./resourceField";
import Resources from "./resources";

const DEFICIT_THRESHOLD = 0.4;
const DEFICIT_THRESHOLD_NEGATIVE_PRODUCTION = 0.7;
const DEFICIT_MAX_VALUE = 35000;
const REQUEST_THRESHOLD = 0.6;
const REQUEST_THRESHOLD_NEGATIVE_PRODUCTION = 0.8;
const OVERFLOW_THRESHOLD = 0.8;
const OVERFLOW_SAFE_LEVEL = 0.6;

class Village {
  id: string;
  name: string;
  coordinateX: number;
  coordinateY: number;
  active: boolean;
  resources: Resources | null = new Resources(0, 0, 0, 0);
  production: Resources | null = new Resources(0, 0, 0, 0);
  capacity: Resources | null = new Resources(0, 0, 0, 0);
  ongoingResources: Resources | null = new Resources(0, 0, 0, 0);
  consumption: number | null = 0;
  celebrationTime: number | null = null;
  availableMerchants: number | null = null;
  maxMerchants: number | null = null;
  resourceFields: ResourceField[] = [];
  buildings: Building[] = [];
  buildFinishTime: number | null = null;
  barracksTime: number | null = null;
  stableTime: number | null = null;
  workshopTime: number | null = null;
  upgradeTroopTime: number | null = null;
  capital: boolean = false;
  skipOverflow: boolean = false;
  skipDeficit: boolean = false;
  skipCreation: boolean = false;
  skipUpgrade: boolean = false;

  constructor(
    id: string,
    name: string,
    coordinateX: number,
    coordinateY: number,
    active: boolean = false
  ) {
    this.id = id;
    this.name = name;
    this.coordinateX = coordinateX;
    this.coordinateY = coordinateY;
    this.active = active;
  }

  toString(): string {
    return `Village(id: ${this.id}, name: ${this.name})`;
  }

  getFutureResources(): Resources {
    return Resources.add(
      this.resources || new Resources(0, 0, 0, 0),
      this.ongoingResources || new Resources(0, 0, 0, 0)
    );
  }

  getOverflowResources(): Resources {
    const overflowResources = new Resources(0, 0, 0, 0);

    Resources.getKeys().forEach((resourceType) => {
      const negativeProduction = this.getNetProduction()[resourceType] < 0;
      if (negativeProduction) {
        return;
      }

      const futureResources = this.getFutureResources()[resourceType];
      const maxCapacity = this.capacity?.[resourceType] ?? 0;

      if (futureResources > maxCapacity * OVERFLOW_THRESHOLD) {
        overflowResources[resourceType] =
          futureResources - maxCapacity * OVERFLOW_SAFE_LEVEL;
      }
    });

    return overflowResources;
  }

  getDeficitResources(): Resources {
    const deficitResources = new Resources(0, 0, 0, 0);

    Resources.getKeys().forEach((resourceType) => {
      const futureResources = this.getFutureResources()[resourceType];
      const maxCapacity = this.capacity?.[resourceType] ?? 0;
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
  }

  getThresholdRequest(
    maxCapacity: number,
    negativeProduction: boolean
  ): number {
    if (negativeProduction) {
      return maxCapacity * REQUEST_THRESHOLD_NEGATIVE_PRODUCTION;
    } else {
      return Math.min(maxCapacity * REQUEST_THRESHOLD, DEFICIT_MAX_VALUE);
    }
  }

  getThresholdDeficit(
    maxCapacity: number,
    negativeProduction: boolean
  ): number {
    if (negativeProduction) {
      return maxCapacity * DEFICIT_THRESHOLD_NEGATIVE_PRODUCTION;
    } else {
      return Math.min(maxCapacity * DEFICIT_THRESHOLD, DEFICIT_MAX_VALUE);
    }
  }

  getNetProduction(): Resources {
    return Resources.subtract(
      this.production || new Resources(0, 0, 0, 0),
      new Resources(0, 0, 0, this.consumption ?? 0)
    );
  }
}

export default Village;
