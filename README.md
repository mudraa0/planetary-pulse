# Planetary Pulse · NASA Space Apps Challenge 2026

**Planetary Pulse** is a digital twin of Earth floating in deep space. It features interactive 3D WebGL globe visualization and 2D equirectangular maps, live atmospheric and marine layer telemetry, physical anomaly detection, and deep drill-down analytics.

---

## Key Features

- **Photorealistic 3D Globe & Shaders**:
  - Realistic NASA satellite imagery (Blue Marble albedo, normal perturbation, specular ocean sun-glint reflection).
  - Atmospheric Rayleigh rim glow with additive Fresnel blending.
  - Cartographic coastlines and 15° graticule coordinate lines derived from `world-atlas`.
  - Seamless antimeridian continuous UV wrapping.

- **7 Calibrated Science Layers**:
  - **Atmosphere**: Near-surface Temperature (°C), Temperature Anomaly (°C), Air Quality Index (AQI), 10m Wind Velocity (m/s).
  - **Ocean & Marine**: Sea Surface Temperature (°C), Significant Wave Height (m), Ocean Circulation Currents (m/s).
  - Vector streamline particles for Wind and Ocean Currents.

- **Deep Drill-down Analytical Deck**:
  - Interactive click and zoom-based coordinate sampling.
  - 30-Day historical trend, 12-month climatology, and 5-year cyclical baselines.
  - Signed monthly anomaly distribution bars with reference lines.
  - Context-aware physical factor breakdown (marine boundary layer flux, synoptic fronts, albedo forcing).
  - One-click CSV export of historical telemetry series.

- **Seamless Dual Projection**:
  - 3D Spherical globe (Three.js / React Three Fiber).
  - 2D Cylindrical Equirectangular map (Leaflet with custom dark basemap).

- **Data Provenance Seam**:
  - Out of the box: deterministic physically calibrated reanalysis mock generator.
  - Live data toggle: Open-Meteo free real-time weather bridge with zero required API keys.

---

## Keyboard Shortcuts

| Key | Action |
| --- | --- |
| `1` | Select Surface Temperature |
| `2` | Select Temperature Anomaly |
| `3` | Select Air Quality (AQI) |
| `4` | Select Wind Velocity |
| `5` | Select Sea Surface Temperature |
| `6` | Select Significant Wave Height |
| `7` | Select Ocean Currents |
| `M` | Switch Projection (3D Globe ↔ 2D Map) |
| `P` | Toggle Streamline Particles |
| `R` | Reset Camera to Default Frame |
| `Esc` | Close Drill-down Drawer / Modals |
| `?` | Open Keyboard Shortcuts Guide |

---

## Quick Start

```bash
# Install dependencies
npm install

# Fetch cartographic topology assets
npm run geo

# Run unit and calibration tests
npm run test

# Launch development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
Add `?debug=1` to the URL to enable the live GL-Diagnostic overlay.

---

## Quality & Architecture

- **Strict Type Safety**: TypeScript strict mode with no `any` assertions.
- **Design System**: Opaque matte control deck using CSS variable tokens; no glassmorphism or blur filters.
- **Performance**: `frameloop="demand"` with reactive invalidation on user interaction, keeping GPU usage light and smooth at 60 FPS.
