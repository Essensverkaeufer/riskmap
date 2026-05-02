import { getRiskMeta, hasSourceDisagreement } from "./riskScale.js";

export function bindSelectionPanel(viewer, data, panelEl, closePanelEl) {
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

  handler.setInputAction((movement) => {
    const picked = viewer.scene.pick(movement.position);
    if (!Cesium.defined(picked?.id)) return;

    const locationId = picked.id.properties?.location_id?.getValue();
    if (!locationId) return;

    renderLocationPanel(locationId, data, panelEl);
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  closePanelEl.addEventListener("click", () => {
    renderEmptyPanel(panelEl);
  });
}

function renderEmptyPanel(panelEl) {
  panelEl.innerHTML = `
    <button class="panel-close" id="closePanel" type="button" aria-label="Close details">&times;</button>
    <p class="panel-kicker">Select a country</p>
    <h2>Explore the globe</h2>
    <p class="panel-summary">Click a country, region, or city to inspect its unified risk level, source comparisons, and manual override status.</p>
  `;

  panelEl.querySelector("#closePanel").addEventListener("click", () => {
    panelEl.innerHTML = `
      <button class="panel-close" id="closePanel" type="button" aria-label="Close details">&times;</button>
      <p class="panel-kicker">Select a country</p>
      <h2>Explore the globe</h2>
      <p class="panel-summary">Click a country, region, or city to inspect its unified risk level, source comparisons, and manual override status.</p>
    `;
  });
}

function renderLocationPanel(locationId, data, panelEl) {
  const location = data.locationsById[locationId];
  const risk = data.riskByLocationId[locationId];
  const sources = data.sourcesByLocationId[locationId] || [];
  const meta = getRiskMeta(risk?.risk_level);
  const disagreement = hasSourceDisagreement(sources);

  panelEl.innerHTML = `
    <button class="panel-close" id="closePanel" type="button" aria-label="Close details">&times;</button>
    <p class="panel-kicker">${escapeHtml(location?.type || "location")}</p>
    <h2>${escapeHtml(location?.name || "Unknown location")}</h2>
    <span class="risk-badge" style="background:${meta.color}">${escapeHtml(meta.label)}</span>
    <p class="panel-summary">${escapeHtml(risk?.summary || "No summary has been added yet.")}</p>
    <div class="detail-row"><span>Manual override</span><strong>${risk?.override_flag ? "Yes" : "No"}</strong></div>
    <div class="detail-row"><span>Source agreement</span><strong>${disagreement ? "Mixed" : "Aligned"}</strong></div>
    <details open>
      <summary>Source comparison</summary>
      <div class="source-list">
        ${sources.map(renderSource).join("") || "<p class=\"panel-summary\">No source records yet.</p>"}
      </div>
    </details>
  `;

  panelEl.querySelector("#closePanel").addEventListener("click", () => {
    renderEmptyPanel(panelEl);
  });
}

function renderSource(source) {
  const meta = getRiskMeta(source.normalized_level);
  return `
    <article class="source-item">
      <strong>${escapeHtml(source.source_name)}</strong>
      <p class="panel-summary">Original: ${escapeHtml(source.original_level)} - Normalized: ${escapeHtml(meta.label)}</p>
      <a href="${escapeAttribute(source.link)}" target="_blank" rel="noreferrer">Open source</a>
    </article>
  `;
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value = "") {
  return escapeHtml(value).replaceAll("`", "&#096;");
}
