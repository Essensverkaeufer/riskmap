const DATA_PATHS = {
  locations: "./data/locations.json",
  riskData: "./data/riskData.json",
  sources: "./data/sources.json",
  countries: "./data/countries.sample.geojson",
  conflictZones: "./data/conflictZones.sample.geojson",
};

async function fetchJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Unable to load ${path}: ${response.status}`);
  }
  return response.json();
}

export async function loadRiskMapData() {
  const [locations, riskData, sources, countries, conflictZones] = await Promise.all([
    fetchJson(DATA_PATHS.locations),
    fetchJson(DATA_PATHS.riskData),
    fetchJson(DATA_PATHS.sources),
    fetchJson(DATA_PATHS.countries),
    fetchJson(DATA_PATHS.conflictZones),
  ]);

  return {
    locations,
    riskData,
    sources,
    countries,
    conflictZones,
    locationsById: indexBy(locations, "id"),
    riskByLocationId: indexBy(riskData, "location_id"),
    sourcesByLocationId: groupBy(sources, "location_id"),
  };
}

function indexBy(items, key) {
  return Object.fromEntries(items.map((item) => [item[key], item]));
}

function groupBy(items, key) {
  return items.reduce((groups, item) => {
    const value = item[key];
    groups[value] ||= [];
    groups[value].push(item);
    return groups;
  }, {});
}
