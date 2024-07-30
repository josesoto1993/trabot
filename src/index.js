const { open, close, goPage } = require("./services/browserService");

(async () => {
  try {
    const page = await open();
    await goPage("https://www.google.com/");

    // Your logic here

    // For demonstration, wait for 10 seconds
    await page.waitForTimeout(10000);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await close();
  }
})();
