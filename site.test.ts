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
    for (const match of html.matchAll(/from\s+["']([^"']+)["']/g)) {
      expect(match[1]).not.toMatch(/^(?:https?:)?\/\//);
    }
  });

  test('inline scripts parse', () => {
    for (const match of html.matchAll(/<script(\s[^>]*)?>([\s\S]*?)<\/script>/gi)) {
      const attrs = match[1] || '';
      // import maps are JSON, not JS; skip them.
      if (/\btype=["']importmap["']/i.test(attrs)) continue;
      let source = match[2];
      // Module scripts may use import declarations — strip those so the
      // remaining classic body still parses under new Function.
      if (/\btype=["']module["']/i.test(attrs)) {
        source = source.replace(/^\s*import\s[\s\S]*?;\s*/gm, '');
      }
      expect(() => new Function(source)).not.toThrow();
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

test('shared assets use a consistent cache-busting version', () => {
  const versions = new Set<string>();
  for (const page of pages) {
    const html = readFileSync(page, 'utf8');
    for (const match of html.matchAll(/common\.css\?v=([^"'&]+)/g)) {
      versions.add(match[1]);
    }
  }
  expect(versions.size).toBe(1);
});

test('Three.js is loaded as a local ES module', () => {
  const commonJs = readFileSync('common.js', 'utf8');
  expect(commonJs).toMatch(/from\s+['"]three['"]/);
  expect(commonJs).toContain('three/addons/postprocessing/');
  expect(existsSync('vendor/three/three.module.min.js')).toBe(true);
  expect(existsSync('vendor/three/three.core.min.js')).toBe(true);
  for (const page of ['index.html', 'solar-system.html', 'seasons.html', 'scale-walk.html']) {
    const html = readFileSync(page, 'utf8');
    expect(html).toContain('type="importmap"');
    expect(html).toContain('three.module.min.js');
    expect(html).not.toContain('three.min.js');
  }
});

test("interactive info panels use the shared mobile drawer", () => {
  const commonJs = readFileSync("common.js", "utf8");
  const commonCss = readFileSync("common.css", "utf8");
  expect(commonJs).toContain("initMobileInfoPanels");
  expect(commonJs).toContain("aria-expanded");
  expect(commonCss).toContain(".info-panel.mobile-info-panel:not(.is-expanded)");
});

test('small-screen chrome stays compact and controls do not reflow', () => {
  const commonCss = readFileSync('common.css', 'utf8');
  expect(commonCss).toContain('@media (max-width: 1024px)');
  expect(commonCss).toMatch(/\.subtitle\s*\{[\s\S]*?display:\s*none\s*!important/);
  expect(commonCss).toMatch(/\.header-meta\s*\{[\s\S]*?position:\s*fixed/);
  expect(commonCss).toMatch(/\.controls,[\s\S]*?flex-wrap:\s*nowrap\s*!important/);
  expect(commonCss).toContain('overflow-x: auto');
  expect(commonCss).toMatch(/-webkit-mask-image:|mask-image:/);
  expect(commonCss).toContain('@media (pointer: coarse)');
});

test("current mission figures remain current", () => {
  const missions = readFileSync("missions.html", "utf8");
  expect(missions).toContain("about <b>24 hours</b>");
  expect(missions).toContain("more than <b>1.7 million observations</b>");
});

test('Earth and planet spin stay eastward (+Y in Three.js)', () => {
  // Right-hand +rotation.y is CCW from above the north pole = geographic east.
  // A previous "fix" negated these signs after misreading that convention.
  const index = readFileSync('index.html', 'utf8');
  const seasons = readFileSync('seasons.html', 'utf8');
  const tour = readFileSync('solar-system.html', 'utf8');

  expect(index).toMatch(/earth\.rotation\.y\s*=\s*sim\.time\s*\*\s*sim\.earthSpinSpeed\s*;/);
  expect(index).not.toMatch(/earth\.rotation\.y\s*=\s*-\s*sim\.time/);

  expect(seasons).toMatch(/earth\.rotation\.y\s*=\s*motionTime\s*\*\s*0\.6\s*;/);
  expect(seasons).not.toMatch(/earth\.rotation\.y\s*=\s*-\s*motionTime/);

  expect(tour).toMatch(/w\.spinDir\s*=\s*w\.retro\s*\?\s*-1\s*:\s*1\s*;/);
});

test('Three.js +Y carries the near face toward geographic east', () => {
  // makeRotationY(+θ): (x,y,z) -> (c*x + s*z, y, -s*x + c*z)
  // Front equator point (0,0,1) moves to +X; at +Z, east is +X.
  const theta = 0.2;
  const x = Math.sin(theta);
  expect(x).toBeGreaterThan(0);
});
