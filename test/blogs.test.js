const Page = require("./helpers/page");

let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto("localhost:3000");
});
afterEach(async () => {
  await page.close();
});

describe("When logged in", () => {
  beforeEach(async () => {
    await page.login();
    await page.click("a.btn-floating");
  });

  it("Can see blog create form", async () => {
    const label = await page.getContentsOf(".title label");
    expect(label).toEqual("Blog Title");
  });

  describe("And using valid inputs", async () => {
    beforeEach(async () => {
      await page.type('input[name="title"]', "Test Blog");
      await page.type(".content input", "Test Content");
      await page.click("form button");
    });
    test("submitting takes user to review screen", async () => {
      const text = await page.getContentsOf("h5");
      expect(text).toEqual("Please confirm your entries");
    });
    test("Submitting on saves and adds blogs to index page", async () => {
      await page.click("button.green");
      await page.waitFor("div.card");
      const titleTxt = await page.getContentsOf(".card-title");
      const contentTxt = await page.getContentsOf(".card-content p");
      expect(titleTxt).toEqual("Test Blog");
      expect(contentTxt).toEqual("Test Content");
    });
  });

  describe("And using invalid inputs", async () => {
    beforeEach(async () => {
      await page.click("form button");
    });
    it("the form shows an error message", async () => {
      const titleError = await page.getContentsOf(".title .red-text");
      const contentError = await page.getContentsOf(".content .red-text");
      expect(titleError).toEqual("You must provide a value");
      expect(contentError).toEqual("You must provide a value");
    });
  });
});

describe("When not logged in ", () => {
  //Executing script from Chrome
  it("User cannot create blog posts", async () => {
    const result = await page.post("/api/blogs", {
      title: "My console title",
      content: "My content"
    });
    expect(result).toEqual({ error: "You must log in!" });
  });
  it("User cannot see a list of blogs", async () => {
    const result = await page.get("/api/blogs");
    expect(result).toEqual({ error: "You must log in!" });
  });
});
