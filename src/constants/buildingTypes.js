const BuildingCategory = require("./buildingCategory");

const BuildingTypes = {
  "": {
    id: 0,
    name: "",
    category: BuildingCategory.other,
  },
  Academy: {
    id: 22,
    name: "Academy",
    category: BuildingCategory.military,
  },
  Bakery: {
    id: 9,
    name: "Bakery",
    category: BuildingCategory.resources,
  },
  Barracks: {
    id: 19,
    name: "Barracks",
    category: BuildingCategory.military,
  },
  Brickyard: {
    id: 6,
    name: "Brickyard",
    category: BuildingCategory.resources,
  },
  Cranny: {
    id: 23,
    name: "Cranny",
    category: BuildingCategory.infrastructure,
  },
  Embassy: {
    id: 18,
    name: "Embassy",
    category: BuildingCategory.infrastructure,
  },
  "Grain Mill": {
    id: 8,
    name: "Grain Mill",
    category: BuildingCategory.resources,
  },
  Granary: {
    id: 11,
    name: "Granary",
    category: BuildingCategory.infrastructure,
  },
  Hospital: {
    id: 46,
    name: "Hospital",
    category: BuildingCategory.military,
  },
  "Iron Foundry": {
    id: 7,
    name: "Iron Foundry",
    category: BuildingCategory.resources,
  },
  "Main Building": {
    id: 15,
    name: "Main Building",
    category: BuildingCategory.infrastructure,
  },
  Marketplace: {
    id: 17,
    name: "Marketplace",
    category: BuildingCategory.infrastructure,
  },
  Palace: {
    id: 26,
    name: "Palace",
    category: BuildingCategory.infrastructure,
  },
  Palisade: {
    id: 33,
    name: "Palisade",
    category: BuildingCategory.other,
    slot: 40,
  },
  "Rally Point": {
    id: 16,
    name: "Rally Point",
    category: BuildingCategory.other,
    slot: 39,
  },
  Residence: {
    id: 25,
    name: "Residence",
    category: BuildingCategory.infrastructure,
  },
  Sawmill: {
    id: 5,
    name: "Sawmill",
    category: BuildingCategory.resources,
  },
  Smithy: {
    id: 13,
    name: "Smithy",
    category: BuildingCategory.military,
  },
  Stable: {
    id: 20,
    name: "Stable",
    category: BuildingCategory.military,
  },
  "Stonemason's Lodge": {
    id: 34,
    name: "Stonemason's Lodge",
    category: BuildingCategory.infrastructure,
  },
  "Tournament Square": {
    id: 14,
    name: "Tournament Square",
    category: BuildingCategory.military,
  },
  "Town Hall": {
    id: 24,
    name: "Town Hall",
    category: BuildingCategory.infrastructure,
  },
  Treasury: {
    id: 27,
    name: "Treasury",
    category: BuildingCategory.infrastructure,
  },
  Warehouse: {
    id: 10,
    name: "Warehouse",
    category: BuildingCategory.infrastructure,
  },
  Workshop: {
    id: 21,
    name: "Workshop",
    category: BuildingCategory.military,
  },
};

module.exports = BuildingTypes;
