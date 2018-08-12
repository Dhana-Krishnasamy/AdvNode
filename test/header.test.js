const puppeteer = require("puppeteer");

let page, browser;
beforeEach(async () => {
  browser = await puppeteer.launch({
    headless: false
  });
  page = await browser.newPage();
  await page.goto("localhost:3000");
});

afterEach(async () => {
  await browser.close();
});

test("Header has the correct text", async () => {
  //$eval callback gets serialised and excuted in the browser
  const text = await page.$eval("a.brand-logo", el => el.innerHTML);
  expect(text).toEqual("Blogster");
});

test("Clicking login takes to oauth screen", async () => {
  await page.click(".right a");
  const url = await page.url();
  expect(url).toMatch(/accounts\.google\.com/);
});
