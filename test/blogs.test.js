const Page = require("./helpers/page");

let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto("localhost:3000");
});
afterEach(async () => {
  await page.close();
});
it("when logged in, can see blog create form", async () => {
  await page.login();
  await page.waitFor("a.btn-floating");
  await page.click("a.btn-floating");
  const label = await page.$eval(".title label", el => el.innerText);
  expect(label).toEqual("Blog Title");
});
