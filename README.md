# RiskMap

RiskMap is a static, browser-only 3D globe prototype for visualizing travel and security risk by country, internal region, and city. It uses CesiumJS, static JSON overrides, remote public GeoJSON boundaries, and satellite imagery, so it can be hosted on GitHub Pages without a backend or database.

## What is included

- CesiumJS globe setup with satellite imagery
- Static JSON override loading from `data/`
- Full country coverage synthesized from Natural Earth/DataHub country boundaries
- Full admin-1 region coverage synthesized from Natural Earth/DataHub region boundaries
- Placeholder risk records for every generated country and region
- Individual city markers tied to the same risk/source model
- Click-to-open detail panel for countries, regions, or cities
- Source comparison display
- Basic source disagreement outline styling
- Conflict-zone GeoJSON overlay support

## Data files

- `data/locations.json`: curated/override location metadata and city points
- `data/riskData.json`: curated/override normalized risk level, summary, and manual override flag
- `data/sources.json`: curated source-by-source advisory comparison
- Countries are loaded from the Natural Earth/DataHub countries GeoJSON URL by default.
- Regions are loaded from the Natural Earth/DataHub global admin-1 GeoJSON URL by default.
- `data/conflictZones.sample.geojson`: starter overlay layer

Local JSON files are the override layer. The app synthesizes placeholder country and region records from boundary GeoJSON, then overlays any matching records from `locations.json`, `riskData.json`, and `sources.json`.

## Location levels

RiskMap treats locations as layered records:

- `country`: national boundary from the country GeoJSON
- `region`: internal state/province/canton boundary from admin-1 GeoJSON
- `city`: point marker using `latitude` and `longitude` in `locations.json`

All three levels use the same `riskData.json` and `sources.json` structure, which keeps the later backend upgrade path clean.

## Recommended source datasets

- Natural Earth/DataHub: public-domain country and admin-1 boundaries for lightweight global defaults.
- geoBoundaries: CC BY 4.0 country and administrative-region boundaries when you need more official administrative coverage country by country.
- GeoNames: CC BY populated-place records for broader city coverage.

For GitHub Pages, keep checked-in GeoJSON simplified or remotely loaded. Large full-detail global administrative files can make the app slow and expensive for visitors to load.

## Coverage Manager

Open Coverage Manager in the app to load the current static data, upload replacement JSON/GeoJSON files, inspect missing risk/source records, and export updated files. This keeps coverage work browser-based while preserving the no-backend architecture.

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
