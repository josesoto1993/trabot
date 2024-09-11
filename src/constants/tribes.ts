enum TribeNames {
  ROMANS = "Romans",
  TEUTONS = "Teutons",
  GAULS = "Gauls",
  EGYPTIANS = "Egyptians",
  HUNS = "Huns",
  NATURE = "Nature",
  NATARS = "Natars",
  SPECIAL = "Special",
}

export const getTribeName = (tribeName: string): TribeNames | null => {
  const matchedTribe = Object.values(TribeNames).find(
    (tribe) => tribe.toLowerCase() === tribeName.toLowerCase()
  );

  return matchedTribe || null;
};

export default TribeNames;
