const getActualVillages = async (page) => {
  try {
    const slotText = await getVillageSlotsInfo(page);
    const { villages } = parseVillageSlots(slotText);
    return villages;
  } catch (error) {
    console.error("Error getting number of actual villages:", error);
    throw error;
  }
};

const getMaxVillages = async (page) => {
  try {
    const slotText = await getVillageSlotsInfo(page);
    const { maxVillages } = parseVillageSlots(slotText);
    return maxVillages;
  } catch (error) {
    console.error("Error getting maximum number of villages:", error);
    throw error;
  }
};

const getVillageSlotsInfo = async (page) => {
  try {
    await page.waitForSelector(
      "#sidebarBoxVillagelist div.content div.expansionSlotInfo div.boxTitle span.slots"
    );

    const slotText = await page.$eval(
      "#sidebarBoxVillagelist div.content div.expansionSlotInfo div.boxTitle span.slots",
      (el) => el.textContent.trim()
    );

    return slotText;
  } catch (error) {
    console.error("Error getting village slots info:", error);
    throw error;
  }
};

const parseVillageSlots = (slotText) => {
  const cleanedText = slotText.replace(/[^\d\/]/g, "");

  const slotMatch = cleanedText.match(/(\d+)\/(\d+)/);
  if (slotMatch) {
    return {
      villages: parseInt(slotMatch[1], 10),
      maxVillages: parseInt(slotMatch[2], 10),
    };
  } else {
    throw new Error(
      `Slot text "${slotText}" format does not match expected pattern.`
    );
  }
};

module.exports = {
  getActualVillages,
  getMaxVillages,
};
