# RiskMap

RiskMap is a static, browser-only 3D globe prototype for visualizing travel and security risk by country. It uses CesiumJS, local JSON files, and GeoJSON overlays, so it can be hosted on GitHub Pages without a backend or database.

## What is included

- CesiumJS globe setup
- Static JSON data loading from `data/`
- Country coloring by unified 1-5 risk level
- Region/sub-country boundary overlays for province/state/canton style risk
- Individual city markers tied to the same risk/source model
- Click-to-open detail panel for countries, regions, or cities
- Source comparison display
- Basic source disagreement outline styling
- Conflict-zone GeoJSON overlay support

## Data files

- `data/locations.json`: location identity and metadata
- `data/riskData.json`: normalized risk level, summary, and manual override flag
- `data/sources.json`: source-by-source advisory comparison
- `data/countries.sample.geojson`: starter country polygons linked by `location_id`
- `data/regions.sample.geojson`: starter internal region polygons linked by `location_id`
- `data/conflictZones.sample.geojson`: starter overlay layer

Replace the sample GeoJSON with complete boundaries when you are ready. Keep every `properties.location_id` value aligned with `locations.json`.

## Location levels

RiskMap treats locations as layered records:

- `country`: national boundary in `countries.sample.geojson`
- `region`: internal state/province/canton boundary in `regions.sample.geojson`
- `city`: point marker using `latitude` and `longitude` in `locations.json`

All three levels use the same `riskData.json` and `sources.json` structure, which keeps the later backend upgrade path clean.

## Risk scale

1. Safe
2. Caution
3. Elevated Risk
4. High Risk
5. Do Not Travel

## Run locally

Because the app loads JSON files with `fetch`, open it through a local web server rather than directly from the file system.

```bash
npm start
```

Then visit `http://127.0.0.1:8080`.

## GitHub Pages

This app is ready for GitHub Pages as a static site. Publish from the repository root or from a `docs/` folder if you later move these files there.

## Upgrade path

The frontend reads through a single data loader in `src/modules/dataLoader.js`. A later Node.js/PostgreSQL/PostGIS backend can replace those JSON fetches with API calls while leaving the globe, styling, and panel logic largely intact.
