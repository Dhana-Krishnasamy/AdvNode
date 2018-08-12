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

test("When signed in, shows Logout button", async () => {
  const id = "5b6fde09f82cc2db3b7c57f3";
  const Buffer = require("safe-buffer").Buffer;
  const sessionObject = {
    passport: { user: id }
  };
  const sessionString = Buffer.from(JSON.stringify(sessionObject)).toString(
    "base64"
  );

  const Keygrip = require("keygrip");
  const keys = require("../config/keys");
  const keygrip = new Keygrip([keys.cookieKey]);
  const sig = keygrip.sign("session=" + sessionString);

  await page.setCookie({ name: "session", value: sessionString });
  await page.setCookie({ name: "session.sig", value: sig });
  await page.goto("localhost:3000");
  //await page.reload();
  await page.waitFor("a[href='/auth/logout']");

  const text = await page.$eval("a[href='/auth/logout']", el => el.innerHTML);
  expect(text).toEqual("Logout");
});
