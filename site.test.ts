import { describe, expect, test } from "bun:test";
import { existsSync, readdirSync, readFileSync } from "node:fs";

const pages = readdirSync(".").filter((file) => file.endsWith(".html"));

describe.each(pages)("%s", (file) => {
  const html = readFileSync(file, "utf8");

  test("has core document metadata", () => {
    expect(html).toMatch(/<html\s[^>]*lang=/i);
    expect(html).toMatch(/<meta\s+name=["']viewport["']/i);
    expect(html).toMatch(/<title>[^<]+<\/title>/i);
  });

  test("has unique IDs", () => {
    const ids = [...html.matchAll(/\bid=["']([^"']+)["']/gi)].map((match) => match[1]);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("references existing local files", () => {
    const references = [...html.matchAll(/(?:href|src)=["']([^"']+)["']/gi)]
      .map((match) => match[1])
      .filter((value) => !/^(?:https?:|data:|#|javascript:)/i.test(value))
      .map((value) => value.split(/[?#]/)[0]);

    for (const reference of references) {
      expect(existsSync(reference), `${file}: missing ${reference}`).toBe(true);
    }
  });

  test('scripts are served locally', () => {
    const srcs = [...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/gi)].map(
      (match) => match[1],
    );
    for (const src of srcs) {
      expect(src).not.toMatch(/^(?:https?:)?\/\//);
    }
  });

  test("inline scripts parse", () => {
    for (const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)) {
      expect(() => new Function(match[1])).not.toThrow();
    }
  });

  test("range inputs have accessible names", () => {
    const ranges = [...html.matchAll(/<input\b[^>]*type=["']range["'][^>]*>/gi)].map(
      (match) => match[0],
    );
    for (const input of ranges) {
      expect(input).toMatch(/\baria-(?:label|labelledby)=["'][^"']+["']/i);
    }
  });

  test("buttons have explicit types", () => {
    const buttons = [...html.matchAll(/<button\b[^>]*>/gi)].map((match) => match[0]);
    for (const button of buttons) {
      expect(button).toMatch(/\btype=["'](?:button|submit|reset)["']/i);
    }
  });

  test("toggle buttons expose their state", () => {
    const toggles = [...html.matchAll(/<button\b[^>]*class=["'][^"']*\btoggle-btn\b[^"']*["'][^>]*>/gi)]
      .map((match) => match[0]);
    for (const toggle of toggles) {
      expect(toggle).toMatch(/\baria-pressed=["'](?:true|false)["']/i);
    }
  });
});

test("shared scene navigation points to every live page", () => {
  const common = readFileSync("common.js", "utf8");
  for (const page of pages.filter((file) => !file.includes(" (1)"))) {
    expect(common, `navigation does not include ${page}`).toContain(`href: '${page}'`);
  }
});

test("the obsolete duplicate page is not shipped", () => {
  expect(existsSync("sun-earth-moon (1).html")).toBe(false);
});

test("shared assets use a consistent cache-busting version", () => {
  const versions = new Set<string>();
  for (const page of pages) {
    const html = readFileSync(page, "utf8");
    for (const match of html.matchAll(/common\.(?:css|js)\?v=([^"'&]+)/g)) {
      versions.add(match[1]);
    }
  }
  expect(versions.size).toBe(1);
});

test("interactive info panels use the shared mobile drawer", () => {
  const commonJs = readFileSync("common.js", "utf8");
  const commonCss = readFileSync("common.css", "utf8");
  expect(commonJs).toContain("initMobileInfoPanels");
  expect(commonJs).toContain("aria-expanded");
  expect(commonCss).toContain(".info-panel.mobile-info-panel:not(.is-expanded)");
});

test("small-screen chrome stays compact and controls do not reflow", () => {
  const commonCss = readFileSync("common.css", "utf8");
  expect(commonCss).toContain("@media (max-width: 1024px)");
  expect(commonCss).toMatch(/\.subtitle,\s*\.header-meta,[\s\S]*?display:\s*none\s*!important/);
  expect(commonCss).toMatch(/\.controls,[\s\S]*?flex-wrap:\s*nowrap\s*!important/);
  expect(commonCss).toContain("overflow-x: auto");
});

test("current mission figures remain current", () => {
  const missions = readFileSync("missions.html", "utf8");
  expect(missions).toContain("about <b>24 hours</b>");
  expect(missions).toContain("more than <b>1.7 million observations</b>");
});
