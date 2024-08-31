const fs = require("fs");
const path = require("path");
import {
  HeroIconStatus,
  HeroIconStatusKeys,
} from "../constants/heroIconStatus";

const getClassOfHeroIcon = async (page) => {
  const heroStatusSelector = ".heroStatus a i";
  try {
    await page.waitForSelector(heroStatusSelector);
    const classToFind = await page.$eval(
      heroStatusSelector,
      (iconElement) => iconElement.className
    );
    console.log("Class found for hero icon:", classToFind);
    return parseClassOfHeroIcon(classToFind);
  } catch (error) {
    console.log("Error finding the class for hero icon:", error);
    return null;
  }
};

const parseClassOfHeroIcon = (classToFind: string): string | undefined => {
  const heroStatusKey = HeroIconStatusKeys.find(
    (key) => HeroIconStatus[key] === classToFind
  );

  if (heroStatusKey) {
    console.log("Hero status found:", heroStatusKey);
    return HeroIconStatus[heroStatusKey];
  } else {
    console.log("No matching hero status found for class:", classToFind);
    return addNewClassOfHeroIcon(classToFind);
  }
};

const addNewClassOfHeroIcon = (newStatusValue: string): string => {
  const logFilePath = path.resolve(__dirname, "src/todo/newHeroStatus.txt");
  const logMessage = `New hero status found: ${newStatusValue}\n`;
  fs.appendFileSync(logFilePath, logMessage, "utf8");
  console.log(logMessage);
  return newStatusValue;
};

const getHeroAdventures = async (page) => {
  try {
    await page.waitForSelector("a.adventure");

    const adventureLink = await page.$("a.adventure");

    if (!adventureLink) {
      throw new Error("No adventure link found.");
    }

    const svgElement = await adventureLink.$("svg.adventure");
    if (svgElement) {
      return 0;
    }

    const contentDiv = await adventureLink.$("div.content");

    if (contentDiv) {
      const contentValue = await page.evaluate(
        (el) => parseInt(el.textContent, 10),
        contentDiv
      );
      if (!isNaN(contentValue)) {
        return contentValue;
      } else {
        throw new Error("Content value is not a number.");
      }
    } else if (svgElement) {
      return 0;
    } else {
      throw new Error("No relevant elements found within the adventure link.");
    }
  } catch (error) {
    console.error("Error getting hero adventures:", error);
    throw error;
  }
};

module.exports = {
  getClassOfHeroIcon,
  getHeroAdventures,
};
