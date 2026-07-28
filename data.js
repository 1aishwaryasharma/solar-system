/* ─────────────────────────────────────────────────────────
   SPACE_DATA — one canonical body catalog for every scene.
   Physical identity, sky elements, and Grand Tour story live
   here. common.js stays render-only; pages that need bodies
   load this file. Missions does not.
   ───────────────────────────────────────────────────────── */
'use strict';
window.SPACE_DATA = (function () {
  const F = (size, day, year, moons, weight) => ({ day, moons, size, weight, year });

  const BODIES = {
    ceres: {
      au: 2.77,
      blurb: 'The biggest object in the asteroid belt, and the closest dwarf planet to the Sun. It is round, like a tiny planet.',
      dot: '#9a9088',
      dwarf: true,
      facts: F('Tiny — you could fit thousands of Ceres inside Earth.', 'One spin takes just <strong>9 hours</strong>.',
        'One trip around the Sun takes about <strong>4.6 Earth years</strong>.', '<strong>No moons.</strong>', 'A 30&nbsp;kg kid would weigh less than <strong>1&nbsp;kg</strong> here.'),
      g: 0.029,
      key: 'ceres',
      moons: 0,
      name: 'Ceres',
      num: '◦',
      periodDays: 1682,
      radiusKm: 473,
      retro: false,
      rotationHours: 9.07,
      tiltDeg: 4,
      type: 'rock',
      wow: 'Ceres may hide salty water beneath its surface — and it has bright, shiny spots made of salt!'
    },
    earth: {
      L0: 100.46435,
      au: 1.0,
      blurb: 'Our home — the only place we know of with oceans, air to breathe, and living things.',
      dot: '#6ab0ff',
      facts: F('<strong>This is home!</strong> Everything you know lives here.', 'One spin takes <strong>24 hours</strong> — one day and night.',
        'One trip around the Sun takes <strong>365 days</strong>.', '<strong>1 moon</strong> — the one you see at night.', 'This is where your weight starts: <strong>30&nbsp;kg</strong>.'),
      g: 1.0,
      key: 'earth',
      moonList: [{ color: '#cfcabd', name: 'Moon', orbit: 2.6, period: 27.3, size: 0.27 }],
      moons: 1,
      n: 0.98560912,
      naked: true,
      name: 'Earth',
      num: '03',
      periodDays: 365.25,
      radiusKm: 6371,
      retro: false,
      rotationHours: 23.93,
      tiltDeg: 23.4393,
      type: 'earth',
      wow: 'Earth is the only planet with liquid water oceans on its surface — a big part of why life can live here.'
    },
    eris: {
      au: 67.78,
      blurb: 'A faraway, icy dwarf planet about the same size as Pluto. Discovering it is what led scientists to invent the word "dwarf planet"!',
      dot: '#d8d2c4',
      dwarf: true,
      facts: F('About the same size as Pluto.', 'One spin takes about <strong>26 hours</strong>.',
        'One trip around the Sun takes about <strong>558 Earth years</strong>!', '<strong>1 moon</strong>, called Dysnomia.', 'A 30&nbsp;kg kid would weigh only about <strong>2&nbsp;kg</strong> here.'),
      g: 0.084,
      key: 'eris',
      moons: 1,
      name: 'Eris',
      num: '◦',
      periodDays: 203830,
      radiusKm: 1163,
      retro: false,
      rotationHours: 25.9,
      tiltDeg: 44,
      type: 'rock',
      wow: 'Eris is so far away that from its surface, the Sun would look like just a very bright star.'
    },
    jupiter: {
      L0: 34.40438,
      au: 5.203,
      bands: ['#c9a06b', '#ddc196', '#a9713f', '#e8d6b0', '#93613c', '#d0aa78'],
      blurb: 'The biggest planet of all — a giant ball of gas with colourful stripes and a storm bigger than Earth.',
      dot: '#d9b48a',
      facts: F('More than <strong>1,300 Earths</strong> could fit inside!', 'It spins the fastest — one spin takes only <strong>10 hours</strong>.',
        'A year is almost <strong>12 Earth years</strong> long.', '<strong>101 moons</strong> are officially recognized!', 'At the cloud tops a 30&nbsp;kg kid would weigh about <strong>76&nbsp;kg</strong>.'),
      g: 2.53,
      key: 'jupiter',
      moonList: [
        { color: '#e8df8a', name: 'Io', orbit: 1.9, period: 1.77, size: 0.10 },
        { color: '#d8cdbf', name: 'Europa', orbit: 2.3, period: 3.55, size: 0.09 },
        { color: '#a89a86', name: 'Ganymede', orbit: 2.9, period: 7.15, size: 0.14 },
        { color: '#7d7266', name: 'Callisto', orbit: 3.6, period: 16.7, size: 0.13 }
      ],
      moons: 101,
      n: 0.08308676,
      naked: true,
      name: 'Jupiter',
      num: '05',
      periodDays: 4331,
      radiusKm: 69911,
      retro: false,
      rotationHours: 9.93,
      spot: { color: '#b5573a', rx: 0.09, ry: 0.05, x: 0.62, y: 0.60 },
      tiltDeg: 3.13,
      type: 'gas',
      wow: 'The Great Red Spot is a storm bigger than the entire Earth that has been swirling for hundreds of years.'
    },
    mars: {
      L0: 355.45332,
      au: 1.524,
      blurb: 'The red planet — a cold, dusty desert world. Robots from Earth are rolling across it right now!',
      dot: '#d0674a',
      facts: F('Earth could hold about <strong>6 Mars-sized worlds</strong>.', 'A day is 24.6 hours — <strong>almost like Earth\'s</strong>.',
        'A year is 687 Earth days — nearly <strong>2 Earth years</strong>.', '<strong>2 tiny moons</strong>, Phobos and Deimos.', 'A 30&nbsp;kg kid would weigh about <strong>11&nbsp;kg</strong> here.'),
      g: 0.38,
      key: 'mars',
      moonList: [
        { color: '#9a8d7f', name: 'Phobos', orbit: 2.0, period: 0.32, size: 0.06 },
        { color: '#9a8d7f', name: 'Deimos', orbit: 2.8, period: 1.26, size: 0.05 }
      ],
      moons: 2,
      n: 0.52403304,
      naked: true,
      name: 'Mars',
      num: '04',
      periodDays: 687,
      polarCaps: true,
      radiusKm: 3390,
      retro: false,
      rotationHours: 24.62,
      tiltDeg: 25.19,
      type: 'rock',
      wow: 'Mars has the tallest volcano in the whole solar system — three times higher than Mount Everest.'
    },
    mercury: {
      L0: 252.25084,
      au: 0.387,
      blurb: 'The smallest planet and the closest to the Sun. It races around the Sun faster than any other world.',
      dot: '#b9b2a6',
      facts: F('Earth could swallow about <strong>18 Mercurys</strong>.', 'One slow spin takes <strong>59 Earth days</strong>.',
        'A whole year is just <strong>88 Earth days</strong>.', '<strong>No moons.</strong>', 'A 30&nbsp;kg kid would weigh about <strong>11&nbsp;kg</strong> here.'),
      g: 0.38,
      key: 'mercury',
      moons: 0,
      n: 4.09233445,
      naked: true,
      name: 'Mercury',
      num: '01',
      periodDays: 88,
      radiusKm: 2440,
      retro: false,
      rotationHours: 1407.6,
      tiltDeg: 0.03,
      type: 'rock',
      wow: 'Its days are boiling hot and its nights are freezing cold, because it has almost no air to hold in the warmth.'
    },
    neptune: {
      L0: 304.88003,
      au: 30.07,
      bands: ['#3b6fd0', '#4f80dc', '#3160b8', '#5a8ae0'],
      blurb: 'The farthest planet — a deep blue world with the fastest, wildest winds in the whole solar system.',
      dot: '#3f6fd8',
      facts: F('About <strong>57 Earths</strong> could fit inside.', 'A day is about <strong>16 hours</strong> long.',
        'A year is <strong>165 Earth years</strong> — it completed its first post-discovery orbit in 2011!', 'At least <strong>16 moons</strong>.', 'At the cloud tops a 30&nbsp;kg kid would weigh about <strong>34&nbsp;kg</strong>.'),
      g: 1.14,
      key: 'neptune',
      moonList: [{ color: '#cdd6d8', name: 'Triton', orbit: 2.4, period: -5.9, size: 0.10 }],
      moons: 16,
      n: 0.00598103,
      naked: false,
      name: 'Neptune',
      num: '08',
      periodDays: 60190,
      radiusKm: 24622,
      retro: false,
      rotationHours: 16.11,
      spot: { color: '#20407e', rx: 0.06, ry: 0.045, x: 0.40, y: 0.44 },
      tiltDeg: 28.32,
      type: 'ice',
      wow: 'Its winds scream faster than 2,000 km/h — faster than any jet plane on Earth.'
    },
    pluto: {
      au: 39.48,
      blurb: 'Once called the ninth planet, Pluto is now a "dwarf planet" — small and icy, sharing its zone with many other little worlds far past Neptune.',
      dot: '#c9b8a0',
      dwarf: true,
      facts: F('Smaller than our own Moon!', 'One spin takes about <strong>6.4 Earth days</strong>.',
        'One trip around the Sun takes <strong>248 Earth years</strong>.', '<strong>5 moons</strong> — the biggest is Charon.', 'A 30&nbsp;kg kid would weigh only about <strong>2&nbsp;kg</strong> here.'),
      g: 0.063,
      key: 'pluto',
      moons: 5,
      name: 'Pluto',
      num: '◦',
      periodDays: 90560,
      radiusKm: 1188,
      retro: true,
      rotationHours: 153.3,
      tiltDeg: 122.5,
      type: 'rock',
      wow: 'Pluto and its moon Charon always face each other as they spin — like two dancers holding hands.'
    },
    saturn: {
      L0: 49.94432,
      au: 9.537,
      bands: ['#d8c69a', '#e9dbb8', '#c9b184', '#efe3c6', '#cbb98d', '#e2d3aa'],
      blurb: 'Famous for its dazzling rings, made of billions of chunks of ice and rock all circling the planet.',
      dot: '#e6d3a0',
      facts: F('About <strong>760 Earths</strong> could fit inside.', 'A day is only about <strong>11 hours</strong> long.',
        'A year is about <strong>29 Earth years</strong>.', '<strong>274 moons</strong> are confirmed!', 'At the cloud tops a 30&nbsp;kg kid would weigh about <strong>32&nbsp;kg</strong>.'),
      g: 1.07,
      key: 'saturn',
      moonList: [
        { color: '#c9a24b', name: 'Titan', orbit: 3.2, period: 15.9, size: 0.13 },
        { color: '#b7b2a6', name: 'Rhea', orbit: 2.5, period: 4.5, size: 0.07 }
      ],
      moons: 274,
      n: 0.03344414,
      naked: true,
      name: 'Saturn',
      num: '06',
      periodDays: 10747,
      radiusKm: 58232,
      retro: false,
      rings: true,
      rotationHours: 10.66,
      tiltDeg: 26.73,
      type: 'gas',
      wow: 'Saturn is so light for its size that it would float in a giant bathtub of water — if you could find one big enough!'
    },
    uranus: {
      L0: 313.23218,
      au: 19.19,
      bands: ['#a9d8e0', '#bfe4ea', '#98cdd6', '#b6e0e6'],
      blurb: 'A cold, blue-green world that is tipped right over — it spins on its side, like a ball rolling around the Sun.',
      dot: '#a9e0e2',
      facts: F('About <strong>63 Earths</strong> could fit inside.', 'A day is about <strong>17 hours</strong> long.',
        'A year is <strong>84 Earth years</strong>!', 'At least <strong>28 moons</strong>.', 'At the cloud tops a 30&nbsp;kg kid would weigh about <strong>27&nbsp;kg</strong>.'),
      g: 0.90,
      key: 'uranus',
      moonList: [
        { color: '#b9c7c9', name: 'Titania', orbit: 2.2, period: 8.7, size: 0.07 },
        { color: '#a9b6b8', name: 'Oberon', orbit: 2.8, period: 13.5, size: 0.06 }
      ],
      moons: 28,
      n: 0.01172834,
      naked: false,
      name: 'Uranus',
      num: '07',
      periodDays: 30589,
      radiusKm: 25362,
      retro: true,
      rotationHours: 17.24,
      tiltDeg: 97.77,
      type: 'ice',
      wow: 'Uranus is tipped over on its side, so each of its summers and winters lasts about 21 Earth years.'
    },
    venus: {
      L0: 181.97973,
      au: 0.723,
      blurb: 'The hottest planet of all, wrapped in thick, swirling yellow clouds. It is almost exactly the same size as Earth.',
      dot: '#e8cd8a',
      facts: F('Almost the same size as Earth — like a <strong>twin</strong>.', 'It spins <strong>backwards</strong>! One spin takes 243 Earth days.',
        'A year is 225 Earth days — <strong>shorter than its day</strong>!', '<strong>No moons.</strong>', 'A 30&nbsp;kg kid would weigh about <strong>27&nbsp;kg</strong> here.'),
      g: 0.91,
      key: 'venus',
      moons: 0,
      n: 1.60213047,
      naked: true,
      name: 'Venus',
      num: '02',
      periodDays: 224.7,
      radiusKm: 6052,
      retro: true,
      rotationHours: 5832.5,
      tiltDeg: 177.4,
      type: 'venus',
      wow: 'It is hot enough to melt lead — the hottest planet, even though Mercury sits closer to the Sun.'
    }
  };

  const PLANET_ORDER = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
  const DWARF_ORDER = ['ceres', 'pluto', 'eris'];

  const OTHER = {
    comet: {
      blurb: 'A giant dirty snowball from the edge of the solar system. When it swoops near the Sun, its ice turns to gas and streams out into a bright, glowing tail.',
      dot: '#9fd8ff',
      facts: F('A small, icy ball — only a few kilometres across.', 'It tumbles as it flies — no steady day.',
        'One long loop around the Sun takes about <strong>75 years</strong>.', '<strong>No moons</strong> — just a glowing tail.', 'Far too small and icy to ever stand on.'),
      key: 'comet',
      name: 'The Comet',
      num: '☄',
      wow: 'A comet\'s tail always points away from the Sun — even when the comet is flying back out into space, the tail leads the way!'
    },
    sun: {
      blurb: 'Our star — a giant, glowing ball of hot gas that gives every planet its light and warmth.',
      dot: '#f4c560',
      facts: F('About <strong>1.3 million Earths</strong> could fit inside!', 'It spins around about once every <strong>25 Earth days</strong>.',
        'It circles the Milky Way about once every <strong>230 million Earth years</strong>.', '<strong>8 planets</strong> circle it, plus moons, dwarf planets and comets.',
        'You could never stand on it — it\'s all glowing gas and far too hot!'),
      key: 'sun',
      name: 'The Sun',
      num: '☀',
      wow: 'The Sun holds more than 99 out of every 100 bits of stuff in the whole solar system.'
    }
  };

  function copies(order) {
    return order.map((key) => {
      const body = BODIES[key];
      if (!body) throw new Error('Unknown body key: ' + key);
      return Object.assign({}, body);
    });
  }

  return {
    BODIES,
    DWARF_ORDER,
    OTHER,
    PLANET_ORDER,
    dwarfs: () => copies(DWARF_ORDER),
    list: copies,
    planets: () => copies(PLANET_ORDER)
  };
})();
