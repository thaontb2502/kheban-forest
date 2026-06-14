const OSM_STANDARD = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const DATA_URL = 'forest_blocks.geojson';
const BASEMAP_STORAGE_KEY = 'kheban-forest-basemap';

const BASEMAPS = {
  esriSatellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    maxZoom: 19,
    maxNativeZoom: 19,
    attribution: '&copy; Esri, Maxar, Earthstar Geographics',
  },
  googleSatellite: {
    url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    maxZoom: 20,
    maxNativeZoom: 20,
    attribution: '&copy; Google',
  },
  googleHybrid: {
    url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    maxZoom: 20,
    maxNativeZoom: 20,
    attribution: '&copy; Google',
  },
  osm: {
    url: OSM_STANDARD,
    maxZoom: 19,
    maxNativeZoom: 19,
    attribution: '&copy; OpenStreetMap contributors',
  },
};

const IMAGERY_YEARS = {
  2023: {
    name: '2023',
    url: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/2023-01-01/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg',
    maxNativeZoom: 9,
    attribution: '&copy; NASA GIBS',
  },
  2024: {
    name: '2024',
    url: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/2024-01-01/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg',
    maxNativeZoom: 9,
    attribution: '&copy; NASA GIBS',
  },
  2025: {
    name: '2025',
    url: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/2025-01-01/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg',
    maxNativeZoom: 9,
    attribution: '&copy; NASA GIBS',
  },
  2026: {
    name: '2026',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    maxNativeZoom: 19,
    attribution: '&copy; Esri, Maxar, Earthstar Geographics',
  },
};

const FOREST_STYLES = {
  TXN: { fillColor: '#15803d', color: '#064e3b', textColor: '#ffffff' },
  TXK: { fillColor: '#86efac', color: '#15803d', textColor: '#073b1a' },
  RTG: { fillColor: '#f97316', color: '#9a3412', textColor: '#ffffff' },
  DT1: { fillColor: '#ffffff', color: '#6b7280', textColor: '#111827' },
};

const DEFAULT_FOREST_STYLE = {
  fillColor: '#94a3b8',
  color: '#334155',
  textColor: '#ffffff',
};

const state = {
  map: null,
  baseLayer: null,
  layer: null,
  features: [],
  byId: new Map(),
  locationMarker: null,
  locationAccuracyCircle: null,
  gpsWatchId: null,
  gpsFollow: false,
  gpsLastLatLng: null,
  currentLocationFeatureId: null,
  selectedFeatureId: null,
  imageryYear: '2026',
  baseType: 'esriSatellite',
  polygonsVisible: true,
  labelsVisible: true,
  layerMenuOpen: false,
  legendOpen: false,
  largeLabelAreaThreshold: 0,
  measureMode: null,
  measurePoints: [],
  measureLayer: null,
  measureMarkers: [],
};

const els = {
  searchForm: document.getElementById('searchForm'),
  searchInput: document.getElementById('searchInput'),
  locateButton: document.getElementById('locateButton'),
  followButton: document.getElementById('followButton'),
  recenterButton: document.getElementById('recenterButton'),
  clearButton: document.getElementById('clearButton'),
  esriSatelliteButton: document.getElementById('esriSatelliteButton'),
  googleSatelliteButton: document.getElementById('googleSatelliteButton'),
  googleHybridButton: document.getElementById('googleHybridButton'),
  osmButton: document.getElementById('osmButton'),
  yearButtons: {
    2023: document.getElementById('year2023Button'),
    2024: document.getElementById('year2024Button'),
    2025: document.getElementById('year2025Button'),
    2026: document.getElementById('year2026Button'),
  },
  polygonsToggle: document.getElementById('polygonsToggle'),
  labelsToggle: document.getElementById('labelsToggle'),
  layerMenuButton: document.getElementById('layerMenuButton'),
  layerPanel: document.getElementById('layerPanel'),
  legendCard: document.getElementById('legendCard'),
  legendToggleButton: document.getElementById('legendToggleButton'),
  resultsPanel: document.getElementById('resultsPanel'),
  resultsList: document.getElementById('resultsList'),
  resultsCount: document.getElementById('resultsCount'),
  detailSheet: document.getElementById('detailSheet'),
  detailTitle: document.getElementById('detailTitle'),
  detailXa: document.getElementById('detailXa'),
  detailTk: document.getElementById('detailTk'),
  detailKhoanh: document.getElementById('detailKhoanh'),
  detailLo: document.getElementById('detailLo'),
  detailDtich: document.getElementById('detailDtich'),
  detailLdlr: document.getElementById('detailLdlr'),
  detailNamtr: document.getElementById('detailNamtr'),
  closeDetailButton: document.getElementById('closeDetailButton'),
  goToPolygonButton: document.getElementById('goToPolygonButton'),
  currentBlockCard: document.getElementById('currentBlockCard'),
  currentTk: document.getElementById('currentTk'),
  currentKhoanh: document.getElementById('currentKhoanh'),
  currentLo: document.getElementById('currentLo'),
  currentLdlr: document.getElementById('currentLdlr'),
  currentDtich: document.getElementById('currentDtich'),
  measureDistanceButton: document.getElementById('measureDistanceButton'),
  measureAreaButton: document.getElementById('measureAreaButton'),
  measureClearButton: document.getElementById('measureClearButton'),
  measureCard: document.getElementById('measureCard'),
  measureTitle: document.getElementById('measureTitle'),
  measurePrimary: document.getElementById('measurePrimary'),
  measureSecondary: document.getElementById('measureSecondary'),
  networkStatus: document.getElementById('networkStatus'),
};

boot().catch((error) => {
  console.error(error);
  els.networkStatus.textContent = 'App failed to load';
});

async function boot() {
  updateNetworkStatus();
  window.addEventListener('online', updateNetworkStatus);
  window.addEventListener('offline', updateNetworkStatus);
  if (!window.L) {
    throw new Error('Leaflet failed to load. Check Leaflet CDN requests in the browser console.');
  }

  state.map = L.map('map', {
    zoomControl: false,
    preferCanvas: true,
  }).setView([16.75, 106.95], 11);

  L.control.zoom({ position: 'bottomright' }).addTo(state.map);
  state.map.on('zoomend', () => {
    syncLayerVisibility();
  });
  state.map.on('moveend', () => {
    refreshForestLabels();
  });
  setBasemap(getSavedBasemap());

  attachUiEvents();
  const geojson = await loadForestData();
  renderFeatures(geojson.features);
  updateResults('');
  syncLayerVisibility();
  syncLegendVisibility();
}

function attachUiEvents() {
  els.searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    runSearch();
  });
  els.locateButton.addEventListener('click', locateMe);
  els.followButton.addEventListener('click', toggleGpsFollow);
  els.recenterButton.addEventListener('click', recenterToGps);
  els.clearButton.addEventListener('click', clearSearch);
  els.closeDetailButton.addEventListener('click', hideDetailSheet);
  els.goToPolygonButton.addEventListener('click', goToSelectedPolygon);
  document.addEventListener('click', handlePolygonActionClick);
  els.esriSatelliteButton.addEventListener('click', () => setBasemap('esriSatellite'));
  els.googleSatelliteButton.addEventListener('click', () => setBasemap('googleSatellite'));
  els.googleHybridButton.addEventListener('click', () => setBasemap('googleHybrid'));
  els.osmButton.addEventListener('click', () => setBasemap('osm'));
  els.measureDistanceButton.addEventListener('click', () => setMeasureMode('distance'));
  els.measureAreaButton.addEventListener('click', () => setMeasureMode('area'));
  els.measureClearButton.addEventListener('click', clearMeasurement);
  els.polygonsToggle.addEventListener('change', () => {
    state.polygonsVisible = els.polygonsToggle.checked;
    syncLayerVisibility();
  });
  els.labelsToggle.addEventListener('change', () => {
    state.labelsVisible = els.labelsToggle.checked;
    syncLayerVisibility();
  });
  els.layerMenuButton.addEventListener('click', toggleLayerPanel);
  els.legendToggleButton.addEventListener('click', toggleLegendCard);
  Object.entries(els.yearButtons).forEach(([year, button]) => {
    button.addEventListener('click', () => setImageryYear(year));
  });

  state.map.on('click', (event) => {
    if (state.measureMode) {
      addMeasurePoint(event.latlng);
      return;
    }
    closeLayerPanel();
  });
}

function toggleLayerPanel() {
  state.layerMenuOpen = !state.layerMenuOpen;
  els.layerPanel.classList.toggle('hidden', !state.layerMenuOpen);
  els.layerMenuButton.classList.toggle('active', state.layerMenuOpen);
  els.layerMenuButton.setAttribute('aria-expanded', String(state.layerMenuOpen));
}

function closeLayerPanel() {
  if (!state.layerMenuOpen) {
    return;
  }
  state.layerMenuOpen = false;
  els.layerPanel.classList.add('hidden');
  els.layerMenuButton.classList.remove('active');
  els.layerMenuButton.setAttribute('aria-expanded', 'false');
}

function toggleLegendCard() {
  state.legendOpen = !state.legendOpen;
  syncLegendVisibility();
}

function syncLegendVisibility() {
  els.legendCard.classList.toggle('legend-collapsed', !state.legendOpen);
  els.legendToggleButton.setAttribute('aria-expanded', String(state.legendOpen));
}

function setBasemap(type) {
  const basemap = BASEMAPS[type] || BASEMAPS.esriSatellite;
  const basemapType = BASEMAPS[type] ? type : 'esriSatellite';
  state.baseType = basemapType;
  if (state.baseLayer) {
    state.map.removeLayer(state.baseLayer);
  }

  state.baseLayer = L.tileLayer(basemap.url, {
    maxZoom: basemap.maxZoom,
    maxNativeZoom: basemap.maxNativeZoom,
    crossOrigin: true,
    attribution: basemap.attribution,
  }).addTo(state.map);
  syncBasemapButtons(basemapType);
  saveBasemap(basemapType);
}

function setImageryYear(year) {
  state.imageryYear = year;
  Object.entries(els.yearButtons).forEach(([buttonYear, button]) => {
    button.classList.toggle('active', buttonYear === year);
  });
  if (state.baseType === 'esriSatellite') {
    setBasemap('esriSatellite');
  }
}

function syncBasemapButtons(type) {
  els.esriSatelliteButton.classList.toggle('active', type === 'esriSatellite');
  els.googleSatelliteButton.classList.toggle('active', type === 'googleSatellite');
  els.googleHybridButton.classList.toggle('active', type === 'googleHybrid');
  els.osmButton.classList.toggle('active', type === 'osm');
}

function getSavedBasemap() {
  try {
    const saved = window.localStorage.getItem(BASEMAP_STORAGE_KEY);
    return BASEMAPS[saved] ? saved : 'esriSatellite';
  } catch {
    return 'esriSatellite';
  }
}

function saveBasemap(type) {
  try {
    window.localStorage.setItem(BASEMAP_STORAGE_KEY, type);
  } catch {
    // Local storage can be unavailable in private browsing or file mode.
  }
}

function setMeasureMode(mode) {
  state.measureMode = state.measureMode === mode ? null : mode;
  clearMeasurement(false);
  syncMeasureButtons();
  updateMeasureCard();
}

function syncMeasureButtons() {
  els.measureDistanceButton.classList.toggle('active', state.measureMode === 'distance');
  els.measureAreaButton.classList.toggle('active', state.measureMode === 'area');
}

function addMeasurePoint(latlng) {
  state.measurePoints.push(latlng);
  const marker = L.circleMarker(latlng, {
    radius: 4,
    color: '#ffffff',
    weight: 2,
    fillColor: '#4aa063',
    fillOpacity: 1,
    interactive: false,
  }).addTo(state.map);
  state.measureMarkers.push(marker);
  redrawMeasurement();
  updateMeasureCard();
}

function redrawMeasurement() {
  if (state.measureLayer) {
    state.map.removeLayer(state.measureLayer);
    state.measureLayer = null;
  }

  if (state.measurePoints.length < 2) {
    return;
  }

  if (state.measureMode === 'area' && state.measurePoints.length >= 3) {
    state.measureLayer = L.polygon(state.measurePoints, {
      color: '#f8fafc',
      weight: 2,
      opacity: 1,
      fillColor: '#4aa063',
      fillOpacity: 0.18,
      interactive: false,
    }).addTo(state.map);
    return;
  }

  state.measureLayer = L.polyline(state.measurePoints, {
    color: '#f8fafc',
    weight: 3,
    opacity: 1,
    interactive: false,
  }).addTo(state.map);
}

function clearMeasurement(resetMode = true) {
  state.measurePoints = [];
  state.measureMarkers.forEach((marker) => state.map.removeLayer(marker));
  state.measureMarkers = [];
  if (state.measureLayer) {
    state.map.removeLayer(state.measureLayer);
    state.measureLayer = null;
  }
  if (resetMode) {
    state.measureMode = null;
    syncMeasureButtons();
  }
  updateMeasureCard();
}

function updateMeasureCard() {
  if (!state.measureMode) {
    els.measureCard.classList.add('hidden');
    return;
  }

  const distanceMeters = calculateDistanceMeters(state.measurePoints);
  const areaSquareMeters = state.measureMode === 'area' ? calculateAreaSquareMeters(state.measurePoints) : 0;
  els.measureTitle.textContent = state.measureMode === 'area' ? 'Area measurement' : 'Distance measurement';
  els.measurePrimary.textContent = state.measureMode === 'area'
    ? `${formatNumber(areaSquareMeters / 10000)} ha`
    : `${formatNumber(distanceMeters)} m`;
  els.measureSecondary.textContent = `Distance: ${formatNumber(distanceMeters)} m / ${formatNumber(distanceMeters / 1000)} km · Area: ${formatNumber(areaSquareMeters / 10000)} ha`;
  els.measureCard.classList.remove('hidden');
}

function calculateDistanceMeters(points) {
  if (points.length < 2) {
    return 0;
  }
  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    total += state.map.distance(points[i - 1], points[i]);
  }
  return total;
}

function calculateAreaSquareMeters(points) {
  if (points.length < 3) {
    return 0;
  }
  const earthRadius = 6378137;
  const projected = points.map((point) => {
    const lat = point.lat * Math.PI / 180;
    const lng = point.lng * Math.PI / 180;
    return {
      x: earthRadius * lng * Math.cos(lat),
      y: earthRadius * lat,
    };
  });

  let sum = 0;
  for (let i = 0, j = projected.length - 1; i < projected.length; j = i++) {
    sum += (projected[j].x * projected[i].y) - (projected[i].x * projected[j].y);
  }
  return Math.abs(sum / 2);
}

function updateNetworkStatus() {
  const online = navigator.onLine;
  els.networkStatus.textContent = online ? 'Online' : 'Offline';
  els.networkStatus.style.color = online ? 'var(--accent)' : '#ffd29d';
}

async function loadForestData() {
  const response = await fetch(DATA_URL);
  if (!response.ok) {
    throw new Error(`Failed to load ${DATA_URL}: HTTP ${response.status}`);
  }
  const text = await response.text();
  if (text.trim().startsWith('<')) {
    throw new Error(`${DATA_URL} returned HTML instead of GeoJSON. Check Netlify publish directory and deploy forest_blocks.geojson.`);
  }
  let data;
  try {
    data = JSON.parse(text);
  } catch (error) {
    throw new Error(`Failed to parse ${DATA_URL} as GeoJSON: ${error.message}`);
  }
  if (!data || data.type !== 'FeatureCollection' || !Array.isArray(data.features)) {
    throw new Error(`${DATA_URL} is not a valid GeoJSON FeatureCollection.`);
  }
  const features = data.features
    .map(normalizeFeature)
    .filter(Boolean);
  state.features = features;
  state.largeLabelAreaThreshold = computeLargeLabelThreshold(features);
  features.forEach((feature) => {
    if (feature.id) {
      state.byId.set(feature.id, feature);
    }
  });
  return { ...data, features };
}

function normalizeFeature(feature) {
  if (!feature || !feature.geometry || !feature.properties) {
    return null;
  }
  const props = feature.properties;
  const bounds = computeBounds(feature.geometry);
  if (!bounds) {
    return null;
  }
  const key = `${String(props.tk ?? '').trim()}/${String(props.khoanh ?? '').trim()}/${String(props.lo ?? '').trim()}`;
  const area = Number(props.dtich);
  return {
    ...feature,
    id: key,
    properties: {
      tk: String(props.tk ?? '').trim(),
      khoanh: String(props.khoanh ?? '').trim(),
      lo: String(props.lo ?? '').trim(),
      dtich: props.dtich,
      area: Number.isFinite(area) ? area : null,
      ldlr: String(props.ldlr ?? '').trim(),
      namtr: props.namtr,
      xa: String(props.xa ?? '').trim(),
    },
    bounds,
  };
}

function renderFeatures(features) {
  if (state.layer) {
    state.map.removeLayer(state.layer);
  }

  state.layer = L.geoJSON(
    { type: 'FeatureCollection', features },
    {
      style: featureStyle,
      onEachFeature: (feature, layer) => {
        const key = feature.id || feature.properties?.id || `${feature.properties.tk}/${feature.properties.khoanh}/${feature.properties.lo}`;
        layer._khebanKey = key;
        bindForestLabel(feature, layer);
        layer.on('click', () => selectFeature(feature, layer, true));
      },
    },
  );

  syncLayerVisibility();

  const bounds = state.layer.getBounds();
  if (bounds.isValid()) {
    state.map.fitBounds(bounds, { animate: false });
  }
}

function featureStyle(feature) {
  const style = getForestStyle(feature.properties?.ldlr);
  const key = feature.id || `${feature.properties?.tk}/${feature.properties?.khoanh}/${feature.properties?.lo}`;
  const isCurrent = key === state.currentLocationFeatureId;
  return {
    color: isCurrent ? '#facc15' : style.color,
    weight: isCurrent ? 4 : 1.4,
    opacity: 1,
    fillColor: style.fillColor,
    fillOpacity: 0.58,
    dashArray: isCurrent ? '6 4' : null,
  };
}

function getForestStyle(ldlr) {
  return FOREST_STYLES[String(ldlr || '').trim().toUpperCase()] || DEFAULT_FOREST_STYLE;
}

function bindForestLabel(feature, layer) {
  const ldlr = String(feature.properties?.ldlr || '').trim().toUpperCase();
  if (!FOREST_STYLES[ldlr]) {
    return;
  }
  const style = getForestStyle(ldlr);
  layer._khebanLabel = {
    text: ldlr,
    style,
    area: Number(feature.properties?.area ?? feature.properties?.dtich ?? 0) || 0,
    center: layer.getBounds().getCenter(),
  };

  if (!layer._khebanLabelHooked) {
    layer._khebanLabelHooked = true;
    layer.on('add', () => {
      applyForestLabel(layer);
    });
  }

  applyForestLabel(layer);
}

function applyForestLabel(layer) {
  const label = layer._khebanLabel;
  if (!label) {
    return;
  }

  const zoom = state.map.getZoom();
  if (!state.labelsVisible || !shouldShowLabel(layer, zoom)) {
    if (layer.getTooltip()) {
      layer.unbindTooltip();
    }
    return;
  }

  if (layer.getTooltip()) {
    layer.setTooltipContent(label.text);
  } else {
    layer.bindTooltip(label.text, {
      permanent: true,
      direction: 'center',
      className: `polygon-label label-${label.text.toLowerCase()}`,
      opacity: 1,
    });
  }

  const tooltip = layer.getTooltip()?.getElement();
  if (tooltip) {
    tooltip.style.color = label.style.textColor;
  }
}

function syncLayerVisibility() {
  if (!state.layer) {
    return;
  }

  if (state.polygonsVisible) {
    if (!state.map.hasLayer(state.layer)) {
      state.layer.addTo(state.map);
    }
  } else if (state.map.hasLayer(state.layer)) {
    state.map.removeLayer(state.layer);
  }

  state.layer.eachLayer((layer) => {
    if (state.labelsVisible) {
      const key = layer._khebanKey;
      if (key) {
        const feature = state.byId.get(key);
        if (feature) {
          bindForestLabel(feature, layer);
        }
      }
    } else if (layer.getTooltip()) {
      layer.unbindTooltip();
    }
  });

  refreshForestLabels();
}

function refreshForestLabels() {
  if (!state.layer || !state.map) {
    return;
  }

  const zoom = state.map.getZoom();
  const labeledLayers = [];

  state.layer.eachLayer((layer) => {
    if (!layer._khebanLabel) {
      return;
    }
    if (!state.labelsVisible || !shouldShowLabel(layer, zoom)) {
      if (layer.getTooltip()) {
        layer.unbindTooltip();
      }
      return;
    }

    if (zoom >= 16) {
      applyForestLabel(layer);
      return;
    }

    const point = state.map.latLngToContainerPoint(layer._khebanLabel.center);
    const collides = labeledLayers.some((previous) => previous.distanceTo(point) < 56);
    if (collides) {
      if (layer.getTooltip()) {
        layer.unbindTooltip();
      }
      return;
    }

    labeledLayers.push(point);
    applyForestLabel(layer);
  });
}

function shouldShowLabel(layer, zoom) {
  return zoom >= 15;
}

function computeLargeLabelThreshold(features) {
  const values = features
    .map((feature) => Number(feature.properties?.area ?? feature.properties?.dtich))
    .filter((value) => Number.isFinite(value) && value > 0)
    .sort((a, b) => a - b);
  if (!values.length) {
    return 0;
  }
  const index = Math.floor((values.length - 1) * 0.75);
  return values[index] || 0;
}

function parseQuery(raw) {
  const value = raw.trim().toLowerCase();
  if (!value) {
    return null;
  }

  const normalized = value.replace(/\s+/g, ' ').replace(/\btk\s+/g, 'tk');
  const parts = normalized.includes('/')
    ? normalized.split('/').map((part) => part.trim()).filter(Boolean)
    : normalized.split(' ').map((part) => part.trim()).filter(Boolean);

  if (!parts.length) {
    return null;
  }

  const cleaned = parts.map((part, index) => {
    if (index === 0) {
      return part.replace(/^tk/, '');
    }
    if (index === 1) {
      return part.replace(/^k/, '');
    }
    if (index === 2) {
      return part.replace(/^l/, '');
    }
    return part;
  });

  return {
    tk: cleaned[0] || '',
    khoanh: cleaned[1] || '',
    lo: cleaned[2] || '',
  };
}

function matches(feature, query) {
  if (!query) {
    return true;
  }
  const props = feature.properties;
  return (
    (!query.tk || props.tk.toLowerCase() === query.tk) &&
    (!query.khoanh || props.khoanh.toLowerCase() === query.khoanh) &&
    (!query.lo || props.lo.toLowerCase() === query.lo)
  );
}

function updateResults(rawQuery) {
  const query = parseQuery(rawQuery);
  const results = state.features.filter((feature) => matches(feature, query));
  els.resultsCount.textContent = `${results.length} result${results.length === 1 ? '' : 's'}`;
  els.resultsList.innerHTML = '';

  if (!rawQuery.trim()) {
    els.resultsPanel.classList.remove('visible');
    fitAllForestPolygons();
    return;
  }

  els.resultsPanel.classList.add('visible');
  results.slice(0, 20).forEach((feature) => {
    const button = document.createElement('button');
    button.className = 'result-item';
    button.type = 'button';
    button.innerHTML = `
      <strong>TK ${escapeHtml(feature.properties.tk)} / K ${escapeHtml(feature.properties.khoanh)} / L ${escapeHtml(feature.properties.lo)}</strong>
      <span>${escapeHtml(feature.properties.xa)} · ${escapeHtml(formatArea(feature.properties.dtich))} · ${escapeHtml(feature.properties.ldlr)}</span>
    `;
    button.addEventListener('click', () => focusFeature(feature));
    els.resultsList.appendChild(button);
  });

  if (results.length) {
    const first = results[0];
    const bounds = results.reduce((acc, feature) => acc.extend(feature.bounds), L.latLngBounds(results[0].bounds));
    state.map.fitBounds(bounds.pad(0.12), { maxZoom: 16, animate: true });
    focusFeature(first, false);
  } else {
    fitAllForestPolygons();
  }
}

function runSearch() {
  updateResults(els.searchInput.value);
}

function clearSearch() {
  els.searchInput.value = '';
  els.resultsList.innerHTML = '';
  els.resultsCount.textContent = '0 results';
  els.resultsPanel.classList.remove('visible');
  hideDetailSheet();
  fitAllForestPolygons();
}

function collapseSearchResults() {
  els.resultsPanel.classList.remove('visible');
}

function fitAllForestPolygons() {
  if (!state.layer) {
    return;
  }
  const bounds = state.layer.getBounds();
  if (bounds.isValid()) {
    state.map.fitBounds(bounds, { animate: true });
  }
}

function focusFeature(feature, openDetail = true) {
  const key = feature.id || feature.properties?.id || `${feature.properties.tk}/${feature.properties.khoanh}/${feature.properties.lo}`;
  state.selectedFeatureId = key;
  const layer = findLayerByKey(key);
  if (layer) {
    state.map.fitBounds(layer.getBounds().pad(0.15), { maxZoom: 17, animate: true });
  } else if (feature.bounds) {
    state.map.fitBounds(feature.bounds.pad(0.15), { maxZoom: 17, animate: true });
  }

  collapseSearchResults();

  if (openDetail) {
    showDetailSheet(feature);
  }
}

function selectFeature(feature, layer, openDetail) {
  state.selectedFeatureId = feature.id || layer._khebanKey;
  const content = `
    <div class="popup-card">
      <strong>Xa:</strong> ${escapeHtml(feature.properties.xa)}<br>
      <strong>Tk:</strong> ${escapeHtml(feature.properties.tk)}<br>
      <strong>Khoanh:</strong> ${escapeHtml(feature.properties.khoanh)}<br>
      <strong>Lo:</strong> ${escapeHtml(feature.properties.lo)}<br>
      <strong>Dientich:</strong> ${escapeHtml(formatArea(feature.properties.dtich))}<br>
      <strong>LDLR:</strong> ${escapeHtml(feature.properties.ldlr)}
      <button class="popup-action" type="button" data-go-polygon="${escapeHtml(state.selectedFeatureId)}">Go to polygon</button>
    </div>
  `;
  layer.bindPopup(content, { closeButton: true, maxWidth: 280 });
  layer.openPopup();
  if (openDetail) {
    showDetailSheet(feature);
  }
}

function showDetailSheet(feature) {
  const props = feature.properties;
  els.detailTitle.textContent = `TK ${props.tk} / K ${props.khoanh} / L ${props.lo}`;
  els.detailXa.textContent = props.xa || '-';
  els.detailTk.textContent = props.tk || '-';
  els.detailKhoanh.textContent = props.khoanh || '-';
  els.detailLo.textContent = props.lo || '-';
  els.detailDtich.textContent = formatArea(props.dtich);
  els.detailLdlr.textContent = props.ldlr || '-';
  els.detailNamtr.textContent = formatYear(props.namtr);
  els.goToPolygonButton.dataset.goPolygon = feature.id || `${props.tk}/${props.khoanh}/${props.lo}`;
  els.detailSheet.classList.remove('hidden');
}

function hideDetailSheet() {
  els.detailSheet.classList.add('hidden');
}

function handlePolygonActionClick(event) {
  const button = event.target.closest('[data-go-polygon]');
  if (!button) {
    return;
  }
  goToPolygon(button.dataset.goPolygon);
}

function goToSelectedPolygon(event) {
  event?.stopPropagation();
  goToPolygon(state.selectedFeatureId || els.goToPolygonButton.dataset.goPolygon);
}

function goToPolygon(key) {
  if (!key) {
    return;
  }
  const layer = findLayerByKey(key);
  if (!layer) {
    return;
  }
  const center = layer.getBounds().getCenter();
  state.map.setView(center, Math.max(state.map.getZoom(), 17), { animate: true });
}

async function locateMe() {
  if (!navigator.geolocation) {
    alert('GPS is not available in this browser.');
    return;
  }

  if (state.gpsWatchId !== null) {
    return;
  }

  state.gpsFollow = true;
  syncGpsButtons();
  state.gpsWatchId = navigator.geolocation.watchPosition(
    handleGpsPosition,
    handleGpsError,
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 3000,
    },
  );
}

function handleGpsPosition(position) {
  const latlng = [position.coords.latitude, position.coords.longitude];
  const accuracy = Math.max(Number(position.coords.accuracy) || 0, 5);
  state.gpsLastLatLng = latlng;

  if (!state.locationMarker) {
    state.locationMarker = L.circleMarker(latlng, {
      radius: 7,
      color: '#ffffff',
      weight: 2,
      fillColor: '#2f6bff',
      fillOpacity: 1,
      interactive: false,
    }).addTo(state.map);
  } else {
    state.locationMarker.setLatLng(latlng);
  }

  if (!state.locationAccuracyCircle) {
    state.locationAccuracyCircle = L.circle(latlng, {
      radius: accuracy,
      color: '#2f6bff',
      weight: 1,
      opacity: 0.35,
      fillColor: '#2f6bff',
      fillOpacity: 0.12,
      interactive: false,
    }).addTo(state.map);
  } else {
    state.locationAccuracyCircle.setLatLng(latlng);
    state.locationAccuracyCircle.setRadius(accuracy);
  }

  state.locationMarker.bindPopup('Current GPS location');
  if (state.gpsFollow) {
    state.map.setView(latlng, Math.max(state.map.getZoom(), 17), { animate: true });
  }

  updateCurrentForestBlock(latlng);
}

function handleGpsError() {
  alert('Unable to access GPS location.');
  stopGpsWatch();
}

function toggleGpsFollow() {
  if (state.gpsWatchId === null) {
    locateMe();
    return;
  }
  state.gpsFollow = !state.gpsFollow;
  syncGpsButtons();
  if (state.gpsFollow && state.gpsLastLatLng) {
    state.map.setView(state.gpsLastLatLng, Math.max(state.map.getZoom(), 17), { animate: true });
  }
}

function recenterToGps() {
  if (state.gpsLastLatLng) {
    state.map.setView(state.gpsLastLatLng, Math.max(state.map.getZoom(), 17), { animate: true });
    return;
  }
  locateMe();
}

function syncGpsButtons() {
  els.followButton.classList.toggle('active', state.gpsFollow);
  els.followButton.setAttribute('aria-pressed', String(state.gpsFollow));
}

function stopGpsWatch() {
  if (state.gpsWatchId !== null) {
    navigator.geolocation.clearWatch(state.gpsWatchId);
    state.gpsWatchId = null;
  }
  state.gpsFollow = false;
  syncGpsButtons();
}

function updateCurrentForestBlock(latlng) {
  const feature = findFeatureAtLatLng(latlng);
  const nextId = feature?.id || null;
  if (state.currentLocationFeatureId !== nextId) {
    state.currentLocationFeatureId = nextId;
    refreshPolygonStyles();
  }

  if (!feature) {
    els.currentBlockCard.classList.add('hidden');
    return;
  }

  const props = feature.properties;
  els.currentTk.textContent = props.tk || '-';
  els.currentKhoanh.textContent = props.khoanh || '-';
  els.currentLo.textContent = props.lo || '-';
  els.currentLdlr.textContent = props.ldlr || '-';
  els.currentDtich.textContent = formatArea(props.dtich);
  els.currentBlockCard.classList.remove('hidden');
}

function refreshPolygonStyles() {
  if (!state.layer) {
    return;
  }
  state.layer.setStyle(featureStyle);
}

function findFeatureAtLatLng(latlng) {
  const point = [latlng[1], latlng[0]];
  return state.features.find((feature) => featureContainsPoint(feature, point)) || null;
}

function featureContainsPoint(feature, point) {
  const geometry = feature.geometry;
  if (!geometry) {
    return false;
  }
  if (geometry.type === 'Polygon') {
    return polygonContainsPoint(geometry.coordinates, point);
  }
  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.some((polygon) => polygonContainsPoint(polygon, point));
  }
  return false;
}

function polygonContainsPoint(rings, point) {
  if (!Array.isArray(rings) || !rings.length) {
    return false;
  }
  if (!ringContainsPoint(rings[0], point)) {
    return false;
  }
  return !rings.slice(1).some((hole) => ringContainsPoint(hole, point));
}

function ringContainsPoint(ring, point) {
  let inside = false;
  const [x, y] = point;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersects = ((yi > y) !== (yj > y)) &&
      (x < ((xj - xi) * (y - yi)) / ((yj - yi) || Number.EPSILON) + xi);
    if (intersects) {
      inside = !inside;
    }
  }
  return inside;
}

function findLayerByKey(key) {
  let result = null;
  state.layer?.eachLayer((layer) => {
    if (layer._khebanKey === key) {
      result = layer;
    }
  });
  return result;
}

function computeBounds(geometry) {
  const coords = [];
  collectCoordinates(geometry.coordinates, coords);
  if (!coords.length) {
    return null;
  }
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;
  for (const [lng, lat] of coords) {
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) continue;
    minLng = Math.min(minLng, lng);
    minLat = Math.min(minLat, lat);
    maxLng = Math.max(maxLng, lng);
    maxLat = Math.max(maxLat, lat);
  }
  return L.latLngBounds([[minLat, minLng], [maxLat, maxLng]]);
}

function collectCoordinates(input, output) {
  if (!Array.isArray(input)) {
    return;
  }
  if (input.length >= 2 && typeof input[0] === 'number' && typeof input[1] === 'number') {
    output.push([input[0], input[1]]);
    return;
  }
  for (const item of input) {
    collectCoordinates(item, output);
  }
}

function formatArea(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return '-';
  }
  return `${number.toFixed(2)} ha`;
}

function formatNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return '0';
  }
  if (Math.abs(number) >= 100) {
    return number.toFixed(0);
  }
  if (Math.abs(number) >= 10) {
    return number.toFixed(1);
  }
  return number.toFixed(2);
}

function formatYear(value) {
  if (value === null || value === undefined || value === '') {
    return '-';
  }
  return String(value);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
