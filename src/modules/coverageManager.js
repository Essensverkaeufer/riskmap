import { DATA_PATHS } from "./dataLoader.js";

const DATA_KEYS = {
  locationsFile: "locations",
  riskFile: "riskData",
  sourcesFile: "sources",
  countriesFile: "countries",
  regionsFile: "regions",
};

export function bindCoverageManager(currentData, managerEl) {
  const openButton = document.querySelector("#openCoverageManager");
  const closeButton = document.querySelector("#closeCoverageManager");
  const summaryEl = document.querySelector("#coverageSummary");
  const workingData = {
    locations: currentData.locations,
    riskData: currentData.riskData,
    sources: currentData.sources,
    countries: currentData.countries,
    regions: currentData.regions,
  };

  openButton.addEventListener("click", () => {
    managerEl.hidden = false;
    renderSummary(summaryEl, workingData);
  });

  closeButton.addEventListener("click", () => {
    managerEl.hidden = true;
  });

  document.querySelector("#loadCurrentData").addEventListener("click", async () => {
    Object.assign(workingData, await loadCurrentFiles());
    renderSummary(summaryEl, workingData);
  });

  Object.entries(DATA_KEYS).forEach(([inputId, key]) => {
    document.querySelector(`#${inputId}`).addEventListener("change", async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      workingData[key] = JSON.parse(await file.text());
      renderSummary(summaryEl, workingData);
    });
  });

  bindDownload("#downloadManifest", "riskmap-data-manifest.json", () => buildManifest(workingData));
  bindDownload("#downloadLocations", "locations.json", () => workingData.locations);
  bindDownload("#downloadRisk", "riskData.json", () => workingData.riskData);
  bindDownload("#downloadSources", "sources.json", () => workingData.sources);
}

async function loadCurrentFiles() {
  const entries = await Promise.all(
    Object.entries(DATA_PATHS).map(async ([key, path]) => {
      if (key === "conflictZones") return null;
      const response = await fetch(path);
      return [key, await response.json()];
    }),
  );

  return Object.fromEntries(entries.filter(Boolean));
}

function renderSummary(summaryEl, data) {
  const locations = Array.isArray(data.locations) ? data.locations : [];
  const riskData = Array.isArray(data.riskData) ? data.riskData : [];
  const sources = Array.isArray(data.sources) ? data.sources : [];
  const countryFeatures = data.countries?.features || [];
  const regionFeatures = data.regions?.features || [];
  const locationIds = new Set(locations.map((location) => location.id));
  const riskIds = new Set(riskData.map((risk) => risk.location_id));
  const sourceIds = new Set(sources.map((source) => source.location_id));
  const missingRisk = locations.filter((location) => !riskIds.has(location.id));
  const missingSources = locations.filter((location) => !sourceIds.has(location.id));
  const orphanRisk = riskData.filter((risk) => !locationIds.has(risk.location_id));
  const orphanSources = sources.filter((source) => !locationIds.has(source.location_id));
  const countryCount = locations.filter((location) => location.type === "country").length;
  const regionCount = locations.filter((location) => location.type === "region").length;
  const cityCount = locations.filter((location) => location.type === "city").length;

  summaryEl.innerHTML = `
    <div class="coverage-stat-grid">
      ${stat("Countries", countryCount)}
      ${stat("Regions", regionCount)}
      ${stat("Cities", cityCount)}
      ${stat("Country shapes", countryFeatures.length)}
      ${stat("Region shapes", regionFeatures.length)}
      ${stat("Source rows", sources.length)}
    </div>
    ${issueList("Missing risk records", missingRisk)}
    ${issueList("Missing source records", missingSources)}
    ${issueList("Risk rows with unknown location_id", orphanRisk)}
    ${issueList("Source rows with unknown location_id", orphanSources)}
  `;
}

function stat(label, value) {
  return `
    <div class="coverage-stat">
      <span>${escapeHtml(label)}</span>
      <strong>${value}</strong>
    </div>
  `;
}

function issueList(title, items) {
  const status = items.length === 0 ? "OK" : `${items.length} to fix`;
  return `
    <details class="coverage-issues" ${items.length ? "open" : ""}>
      <summary>${escapeHtml(title)}: ${status}</summary>
      <ul>
        ${
          items
            .slice(0, 12)
            .map((item) => `<li>${escapeHtml(item.id || item.location_id || "unknown")}</li>`)
            .join("") || "<li>No issues found.</li>"
        }
      </ul>
    </details>
  `;
}

function buildManifest(data) {
  const locations = Array.isArray(data.locations) ? data.locations : [];
  return {
    generated_at: new Date().toISOString(),
    files: {
      locations: "data/locations.json",
      riskData: "data/riskData.json",
      sources: "data/sources.json",
      countries: "data/countries.sample.geojson",
      regions: "data/regions.sample.geojson",
    },
    coverage: {
      countries: locations.filter((location) => location.type === "country").length,
      regions: locations.filter((location) => location.type === "region").length,
      cities: locations.filter((location) => location.type === "city").length,
      country_shapes: data.countries?.features?.length || 0,
      region_shapes: data.regions?.features?.length || 0,
    },
  };
}

function bindDownload(selector, filename, getData) {
  document.querySelector(selector).addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(getData(), null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  });
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
