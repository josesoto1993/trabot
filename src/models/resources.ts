class Resources {
  lumber: number;
  clay: number;
  iron: number;
  crop: number;

  constructor(lumber: number, clay: number, iron: number, crop: number) {
    this.lumber = lumber;
    this.clay = clay;
    this.iron = iron;
    this.crop = crop;
  }

  toString(): string {
    return `Resources(lumber: ${this.lumber}, clay: ${this.clay}, iron: ${this.iron}, crop: ${this.crop})[${this.getTotal()}]`;
  }

  getTotal(): number {
    return this.lumber + this.clay + this.iron + this.crop;
  }

  static add(obj: Resources, other: Resources): Resources {
    return new Resources(
      obj.lumber + other.lumber,
      obj.clay + other.clay,
      obj.iron + other.iron,
      obj.crop + other.crop
    );
  }

  static subtract(obj: Resources, other: Resources): Resources {
    return new Resources(
      obj.lumber - other.lumber,
      obj.clay - other.clay,
      obj.iron - other.iron,
      obj.crop - other.crop
    );
  }

  static factor(obj: Resources, factor: number): Resources {
    return new Resources(
      Math.round(obj.lumber * factor),
      Math.round(obj.clay * factor),
      Math.round(obj.iron * factor),
      Math.round(obj.crop * factor)
    );
  }

  static getKeys(): string[] {
    return ["lumber", "clay", "iron", "crop"];
  }
}

export default Resources;
