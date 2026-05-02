import { loadRiskMapData } from "./modules/dataLoader.js";
import { bindCoverageManager } from "./modules/coverageManager.js";
import { createGlobe, addCities, addCountries, addConflictZones, addRegions } from "./modules/globe.js";
import { bindSelectionPanel } from "./modules/interaction.js";

const statusEl = document.querySelector("#dataStatus");
const panelEl = document.querySelector("#infoPanel");
const closePanelEl = document.querySelector("#closePanel");
const coverageManagerEl = document.querySelector("#coverageManager");

async function boot() {
  const data = await loadRiskMapData();
  const globe = createGlobe("cesiumContainer");

  await addCountries(globe, data);
  await addRegions(globe, data);
  addCities(globe, data);
  await addConflictZones(globe, data.conflictZones);
  bindSelectionPanel(globe, data, panelEl, closePanelEl);
  bindCoverageManager(data, coverageManagerEl);

  statusEl.textContent = `${data.locations.length} locations loaded`;
}

boot().catch((error) => {
  console.error(error);
  statusEl.textContent = "Data load failed";
  panelEl.innerHTML = `
    <p class="panel-kicker">Startup error</p>
    <h2>RiskMap could not load</h2>
    <p class="panel-summary">Check that the site is served from a web server and that the /data JSON files are present.</p>
  `;
});
