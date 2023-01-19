import {
  defaultConfig,
  keifyPath,
  loadConfig,
  normalizeTemplateKey,
} from "./utils";

describe("test loadConfig", () => {
  it("should load default config", () =>
    expect(loadConfig()).toBe(defaultConfig));
});

describe("test keifying", () => {
  it("should remove root dir from path", () =>
    expect(keifyPath("./test/foo/bar.test", "./test/foo")).toBe("bar.test"));

  it("should keifyPath and normalize to forward slashes", () =>
    expect(normalizeTemplateKey("test\\foo\\baz\\bar.test", "test\\foo")).toBe(
      "baz/bar.test"
    ));
});
