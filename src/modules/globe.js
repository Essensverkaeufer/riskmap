import { getRiskMeta, hasSourceDisagreement } from "./riskScale.js";

export function createGlobe(containerId) {
  Cesium.Ion.defaultAccessToken = "";

  const viewer = new Cesium.Viewer(containerId, {
    animation: false,
    baseLayerPicker: false,
    fullscreenButton: false,
    geocoder: false,
    homeButton: false,
    infoBox: false,
    navigationHelpButton: false,
    sceneModePicker: false,
    selectionIndicator: false,
    timeline: false,
    terrainProvider: new Cesium.EllipsoidTerrainProvider(),
  });

  viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString("#20292d");
  viewer.scene.skyAtmosphere.show = true;
  viewer.scene.requestRenderMode = true;
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(12, 24, 18500000),
  });

  return viewer;
}

export async function addCountries(viewer, data) {
  const source = await Cesium.GeoJsonDataSource.load(data.countries, {
    clampToGround: false,
  });

  source.name = "countries";
  viewer.dataSources.add(source);

  source.entities.values.forEach((entity) => {
    const locationId = entity.properties?.location_id?.getValue();
    const risk = data.riskByLocationId[locationId];
    const sources = data.sourcesByLocationId[locationId] || [];
    const meta = getRiskMeta(risk?.risk_level);
    const disagreement = hasSourceDisagreement(sources);

    entity.properties.location_id = locationId;
    entity.polygon.material = Cesium.Color.fromCssColorString(meta.color).withAlpha(0.68);
    entity.polygon.outline = true;
    entity.polygon.outlineColor = disagreement
      ? Cesium.Color.WHITE
      : Cesium.Color.fromCssColorString("#101416");
    entity.polygon.outlineWidth = disagreement ? 3 : 1;
  });
}

export async function addConflictZones(viewer, conflictZones) {
  const source = await Cesium.GeoJsonDataSource.load(conflictZones, {
    clampToGround: false,
  });

  source.name = "conflict-zones";
  viewer.dataSources.add(source);

  source.entities.values.forEach((entity) => {
    if (!entity.polygon) return;

    entity.polygon.material = Cesium.Color.fromCssColorString("#ff3d5a").withAlpha(0.3);
    entity.polygon.outline = true;
    entity.polygon.outlineColor = Cesium.Color.fromCssColorString("#ffb1bd");
  });
}
