enum UnitNames {
  PHALANX = "Phalanx",
  SWORDSMAN = "Swordsman",
  PATHFINDER = "Pathfinder",
  THEUTATES_THUNDER = "TheutatesThunder",
  DRUIDRIDER = "Druidrider",
  HAEDUAN = "Haeduan",
  RAM = "Ram",
  TREBUCHET = "Trebuchet",
  CHIEFTAIN = "Chieftain",
  SETTLER = "Settler",
  TRAPS = "Traps",
  RAT = "Rat",
  SPIDER = "Spider",
  SNAKE = "Snake",
  BAT = "Bat",
  WILD_BOAR = "Wild Boar",
  WOLF = "Wolf",
  BEAR = "Bear",
  CROCODILE = "Crocodile",
  TIGER = "Tiger",
  ELEPHANT = "Elephant",
}

export const getUnit = (unitName: string): UnitNames | null => {
  const matchedUnit = Object.values(UnitNames).find(
    (unit) => unit.toLowerCase() === unitName.toLowerCase()
  );

  return matchedUnit || null;
};
export default UnitNames;
