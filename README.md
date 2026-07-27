# Sol · Terra · Luna

An interactive Three.js study of the Sun, Earth, and Moon, with animated
orbits, lighting, eclipses, lunar phases, and configurable viewing presets.

## Run locally

Open `index.html` in a modern browser, or serve the directory with any static
web server:

```sh
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.

## Technology

- Three.js 0.128.0
- WebGL and custom GLSL shaders
- Vanilla HTML, CSS, and JavaScript
- Earth surface, normal, specular, and night-light maps from the
  [Three.js planet texture examples](https://threejs.org/examples/textures/planets/)

## Scientific model

This is an Earth-centered reference view with compressed display distances.
Body spacing and the Sun's visible size are not to scale, which keeps the
complete system legible on one screen. The model uses:

- Earth's 23.4393° obliquity and a 365.256-day year
- The Moon's 27.321661-day sidereal period, 5.145° orbital inclination,
  0.0549 eccentricity, synchronous rotation, and 18.6-year node precession
- Angular eclipse tests that are independent of the compressed display scale

Small effects such as lunar libration, Earth's oblateness, nutation, and
short-period orbital perturbations are intentionally omitted. Reference values
come from [NASA Earth facts](https://science.nasa.gov/earth/facts/),
[NASA Moon facts](https://science.nasa.gov/moon/facts/), and
[NASA eclipse orbital data](https://eclipse.gsfc.nasa.gov/SEhelp/moonorbit.html).
