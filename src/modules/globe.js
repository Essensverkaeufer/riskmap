import { getRiskMeta, hasSourceDisagreement } from "./riskScale.js";

export function createGlobe(containerId) {
  const baseLayer = Cesium.ImageryLayer.fromProviderAsync(
    Cesium.TileMapServiceImageryProvider.fromUrl(
      Cesium.buildModuleUrl("Assets/Textures/NaturalEarthII"),
    ),
  );

  const viewer = new Cesium.Viewer(containerId, {
    animation: false,
    baseLayer,
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

  viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString("#263238");
  viewer.scene.skyAtmosphere.show = true;
  viewer.scene.requestRenderMode = true;
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(12, 18, 42000000),
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
    entity.polygon.material = Cesium.Color.fromCssColorString(meta.color).withAlpha(0.38);
    entity.polygon.outline = true;
    entity.polygon.outlineColor = disagreement
      ? Cesium.Color.WHITE
      : Cesium.Color.fromCssColorString("#101416");
    entity.polygon.outlineWidth = disagreement ? 3 : 1;
  });
}

export async function addRegions(viewer, data) {
  const source = await Cesium.GeoJsonDataSource.load(data.regions, {
    clampToGround: false,
  });

  source.name = "regions";
  viewer.dataSources.add(source);

  source.entities.values.forEach((entity) => {
    const locationId = entity.properties?.location_id?.getValue();
    const risk = data.riskByLocationId[locationId];
    const sources = data.sourcesByLocationId[locationId] || [];
    const meta = getRiskMeta(risk?.risk_level);
    const disagreement = hasSourceDisagreement(sources);

    entity.properties.location_id = locationId;
    entity.polygon.material = Cesium.Color.fromCssColorString(meta.color).withAlpha(0.72);
    entity.polygon.outline = true;
    entity.polygon.outlineColor = disagreement
      ? Cesium.Color.WHITE
      : Cesium.Color.fromCssColorString("#f5f8f7");
    entity.polygon.outlineWidth = disagreement ? 3 : 1.5;
  });
}

export function addCities(viewer, data) {
  data.locations
    .filter((location) => location.type === "city")
    .forEach((city) => {
      const risk = data.riskByLocationId[city.id];
      const meta = getRiskMeta(risk?.risk_level);

      viewer.entities.add({
        name: city.name,
        position: Cesium.Cartesian3.fromDegrees(city.longitude, city.latitude, 50000),
        properties: new Cesium.PropertyBag({
          location_id: city.id,
        }),
        point: {
          color: Cesium.Color.fromCssColorString(meta.color),
          pixelSize: 11,
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2,
          heightReference: Cesium.HeightReference.NONE,
        },
        label: {
          text: city.name,
          font: "12px sans-serif",
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 3,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new Cesium.Cartesian2(0, -18),
          showBackground: true,
          backgroundColor: Cesium.Color.fromCssColorString("#101416").withAlpha(0.72),
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 12000000),
        },
      });
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
