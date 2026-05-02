const DATA_PATHS = {
  locations: "./data/locations.json",
  riskData: "./data/riskData.json",
  sources: "./data/sources.json",
  countries: "https://datahub.io/core/geo-countries/_r/-/data/countries.geojson",
  regions: "https://datahub.io/core/geo-ne-admin1/_r/-/data/admin1.geojson",
  conflictZones: "./data/conflictZones.sample.geojson",
};

export { DATA_PATHS };

async function fetchJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Unable to load ${path}: ${response.status}`);
  }
  return response.json();
}

export async function loadRiskMapData() {
  const [locations, riskData, sources, countries, regions, conflictZones] = await Promise.all([
    fetchJson(DATA_PATHS.locations),
    fetchJson(DATA_PATHS.riskData),
    fetchJson(DATA_PATHS.sources),
    fetchJson(DATA_PATHS.countries),
    fetchJson(DATA_PATHS.regions),
    fetchJson(DATA_PATHS.conflictZones),
  ]);

  normalizeBoundaryLayer(countries, "country");
  normalizeBoundaryLayer(regions, "region");

  const synthesizedLocations = synthesizeBoundaryLocations(countries, regions);
  const synthesizedRisk = synthesizePlaceholderRisk(synthesizedLocations, riskData);
  const mergedLocations = mergeById(synthesizedLocations, locations);
  const mergedRiskData = mergeByLocationId(synthesizedRisk, riskData);

  return {
    locations: mergedLocations,
    riskData: mergedRiskData,
    sources,
    countries,
    regions,
    conflictZones,
    locationsById: indexBy(mergedLocations, "id"),
    riskByLocationId: indexBy(mergedRiskData, "location_id"),
    sourcesByLocationId: groupBy(sources, "location_id"),
  };
}

function normalizeBoundaryLayer(collection, type) {
  collection.features?.forEach((feature) => {
    const properties = feature.properties || {};
    const locationId = type === "country" ? countryId(properties) : regionId(properties);
    feature.properties = {
      ...properties,
      location_id: locationId,
      riskmap_type: type,
    };
  });
}

function synthesizeBoundaryLocations(countries, regions) {
  const countryLocations = (countries.features || []).map((feature) => {
    const properties = feature.properties || {};
    return {
      id: properties.location_id,
      name: properties.name || properties.ADMIN || properties.admin || "Unknown country",
      type: "country",
      iso2: properties["ISO3166-1-Alpha-2"] || properties.iso_a2,
      iso3: properties["ISO3166-1-Alpha-3"] || properties.adm0_a3 || properties.iso_a3,
      placeholder: true,
    };
  });

  const regionLocations = (regions.features || []).map((feature) => {
    const properties = feature.properties || {};
    return {
      id: properties.location_id,
      name: properties.name || "Unknown region",
      type: "region",
      parent_id: properties.adm0_a3 ? `country-${properties.adm0_a3.toLowerCase()}` : undefined,
      iso_3166_2: properties.iso_3166_2,
      placeholder: true,
    };
  });

  return [...countryLocations, ...regionLocations];
}

function synthesizePlaceholderRisk(locations, overrides) {
  const overriddenIds = new Set(overrides.map((risk) => risk.location_id));
  return locations
    .filter((location) => !overriddenIds.has(location.id))
    .map((location) => ({
      location_id: location.id,
      risk_level: 2,
      summary: `Placeholder ${location.type} risk record. Replace this with advisory-backed coverage when available.`,
      override_flag: false,
      placeholder: true,
      updated_at: new Date().toISOString().slice(0, 10),
    }));
}

function countryId(properties) {
  const iso3 = properties["ISO3166-1-Alpha-3"] || properties.adm0_a3 || properties.iso_a3;
  return iso3 ? `country-${String(iso3).toLowerCase()}` : `country-${slug(properties.name || properties.ADMIN)}`;
}

function regionId(properties) {
  const iso = properties.iso_3166_2;
  const country = properties.adm0_a3 || properties.admin || "region";
  return iso
    ? `region-${slug(iso)}`
    : `region-${slug(country)}-${slug(properties.name || "unknown")}`;
}

function mergeById(generated, overrides) {
  return Object.values({
    ...indexBy(generated, "id"),
    ...indexBy(overrides, "id"),
  });
}

function mergeByLocationId(generated, overrides) {
  return Object.values({
    ...indexBy(generated, "location_id"),
    ...indexBy(overrides, "location_id"),
  });
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

function slug(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
