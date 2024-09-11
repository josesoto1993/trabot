enum BuildingNames {
  ACADEMY = "Academy",
  BAKERY = "Bakery",
  BARRACKS = "Barracks",
  BRICKYARD = "Brickyard",
  CRANNY = "Cranny",
  EMBASSY = "Embassy",
  GRAIN_MILL = "Grain Mill",
  GRANARY = "Granary",
  HEROS_MANSION = "Hero's Mansion",
  HOSPITAL = "Hospital",
  IRON_FOUNDRY = "Iron Foundry",
  MAIN_BUILDING = "Main Building",
  MARKETPLACE = "Marketplace",
  PALACE = "Palace",
  PALISADE = "Palisade",
  RALLY_POINT = "Rally Point",
  RESIDENCE = "Residence",
  SAWMILL = "Sawmill",
  SMITHY = "Smithy",
  STABLE = "Stable",
  STONEMASONS_LODGE = "Stonemason's Lodge",
  TRAPPER = "Trapper",
  TOWN_HALL = "Town Hall",
  TOURNAMENT_SQUARE = "Tournament Square",
  TRADE_OFFICE = "Trade Office",
  TREASURY = "Treasury",
  WAREHOUSE = "Warehouse",
  WORKSHOP = "Workshop",
}

export const getBuildingName = (buildingName: string): BuildingNames | null => {
  const matchenBuilding = Object.values(BuildingNames).find(
    (building) => building.toLowerCase() === buildingName.toLowerCase()
  );

  return matchenBuilding || null;
};
export default BuildingNames;
