class Resources {
  constructor(lumber, clay, iron, crop) {
    this.lumber = lumber;
    this.clay = clay;
    this.iron = iron;
    this.crop = crop;
  }

  toString() {
    return `Resources(lumber: ${this.lumber}, clay: ${this.clay}, iron: ${this.iron}, crop: ${this.crop})`;
  }

  getTotal() {
    return this.lumber + this.clay + this.iron + this.crop;
  }

  static add(obj, other) {
    return new Resources(
      obj.lumber + other.lumber,
      obj.clay + other.clay,
      obj.iron + other.iron,
      obj.crop + other.crop
    );
  }

  static subtract(obj, other) {
    return new Resources(
      obj.lumber - other.lumber,
      obj.clay - other.clay,
      obj.iron - other.iron,
      obj.crop - other.crop
    );
  }

  static factor(obj, factor) {
    return new Resources(
      Math.round(obj.lumber * factor),
      Math.round(obj.clay * factor),
      Math.round(obj.iron * factor),
      Math.round(obj.crop * factor)
    );
  }

  static getKeys() {
    return ["lumber", "clay", "iron", "crop"];
  }
}

module.exports = Resources;
