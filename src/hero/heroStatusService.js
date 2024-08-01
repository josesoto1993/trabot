const fs = require("fs");
const path = require("path");
const HeroStatus = require("../constants/heroStatus");

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

const parseClassOfHeroIcon = (classToFind) => {
  const heroStatus = Object.keys(HeroStatus).find(
    (key) => HeroStatus[key] === classToFind
  );

  if (heroStatus) {
    console.log("Hero status found:", heroStatus);
    return heroStatus;
  } else {
    console.log("No matching hero status found for class:", classToFind);
    return addNewClassOfHeroIcon(classToFind);
  }
};

const addNewClassOfHeroIcon = (classToFind) => {
  const newStatus = `Status${Object.keys(HeroStatus).length + 1}`;
  HeroStatus[newStatus] = classToFind;

  const heroStatusPath = path.resolve(__dirname, "../constants/heroStatus.js");

  const updatedContent = `const HeroStatus = ${JSON.stringify(HeroStatus, null, 2)};
  
  module.exports = HeroStatus;`;

  fs.writeFileSync(heroStatusPath, updatedContent, "utf8");

  console.log(`Added new hero status: ${newStatus} with class: ${classToFind}`);
  return newStatus;
};

module.exports = {
  getClassOfHeroIcon,
};
