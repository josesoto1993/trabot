import ICoordinates from "../commonInterfaces/coordinates";
import ISquadron from "../commonInterfaces/squadron";
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
const RECEIVER_THRESHOLD = 0.7;
const DONOR_SAFE_LEVEL = 0.5;
const DONOR_SAFE_VALUE = 40000;
const MERCHANTS_CAPACITY = Number(process.env.MERCHANTS_CAPACITY);

class Village {
  id: string;
  name: string;
  coordinates: ICoordinates;
  active: boolean;
  resources: Resources | null = null;
  production: Resources | null = null;
  capacity: Resources | null = null;
  ongoingResources: Resources | null = null;
  consumption: number | null = 0;
  celebrationTime: number | null = null;
  availableMerchants: number | null = null;
  maxMerchants: number | null = null;
  merchantsCapacity: number = MERCHANTS_CAPACITY;
  resourceFields: ResourceField[] = [];
  buildings: Building[] = [];
  squadrons: ISquadron[] = [];
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
    coordinates: ICoordinates,
    active: boolean = false
  ) {
    this.id = id;
    this.name = name;
    this.coordinates = coordinates;
    this.active = active;
  }

  toString(): string {
    return `Village(id: ${this.id}, name: ${this.name})`;
  }

  getMaxCargo(): number {
    return this.availableMerchants * this.merchantsCapacity;
  }

  getFutureResources(): Resources {
    return Resources.add(
      this.resources || new Resources(0, 0, 0, 0),
      this.ongoingResources || new Resources(0, 0, 0, 0)
    );
  }

  getMaxReceiveResources(): Resources {
    const possibleDonation = new Resources(0, 0, 0, 0);

    Resources.getKeys().forEach((resourceType) => {
      const maxToHave = this.capacity[resourceType] * RECEIVER_THRESHOLD;
      const maxDonation = maxToHave - this.resources[resourceType];

      possibleDonation[resourceType] = Math.max(maxDonation, 0);
    });

    return possibleDonation;
  }

  getMaxSendResources(): Resources {
    const maxSendResources = new Resources(0, 0, 0, 0);

    Resources.getKeys().forEach((resourceType) => {
      const minToKeep = Math.min(
        this.capacity[resourceType] * DONOR_SAFE_LEVEL,
        DONOR_SAFE_VALUE
      );
      const maxSend = this.resources[resourceType] - minToKeep;

      maxSendResources[resourceType] = Math.max(maxSend, 0);
    });

    return maxSendResources;
  }

  getOverflowResources(): Resources {
    const overflowResources = new Resources(0, 0, 0, 0);

    Resources.getKeys().forEach((resourceType) => {
      const negativeProduction = this.getNetProduction()[resourceType] < 0;
      if (negativeProduction) {
        return;
      }

      const futureResources = this.getFutureResources()[resourceType];
      const maxCapacity = this.capacity[resourceType] ?? 0;

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
      const maxCapacity = this.capacity[resourceType] ?? 0;
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

  haveSquadron(squadron: ISquadron): boolean {
    const existingSquadron = this.squadrons.find(
      (s) => s.unit.name === squadron.unit.name
    );

    if (!existingSquadron) {
      return false;
    }

    return existingSquadron.quantity >= squadron.quantity;
  }

  haveSquadrons(squadrons: ISquadron[]): boolean {
    return squadrons.every((squadron) => this.haveSquadron(squadron));
  }

  subtractSquadron(squadron: ISquadron): void {
    const existingSquadron = this.squadrons.find(
      (s) => s.unit.name === squadron.unit.name
    );
    if (!existingSquadron) {
      console.error(`Squadron ${squadron.unit.name} not found.`);
      return;
    }

    const newQuantity = existingSquadron.quantity - squadron.quantity;
    existingSquadron.quantity = Math.max(newQuantity, 0);
  }

  subtractSquadrons(squadrons: ISquadron[]): void {
    for (const squadron of squadrons) {
      this.subtractSquadron(squadron);
    }
  }
}

export default Village;
