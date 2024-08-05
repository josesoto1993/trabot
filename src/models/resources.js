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
}

module.exports = Resources;
