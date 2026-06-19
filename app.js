const OSM_STANDARD = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const DATA_URL = 'forest_blocks.geojson';
const GALLERY_URL = 'gallery.json';
const BASEMAP_STORAGE_KEY = 'kheban-forest-basemap';

const DEFAULT_GALLERY_GROUPS = [
  {
    title: 'Ảnh hiện trường',
    items: [
      { src: 'images/RUNG1.png', caption: 'Ảnh hiện trường 1' },
      { src: 'images/RUNG2.png', caption: 'Ảnh hiện trường 2' },
      { src: 'images/RUNG3.png', caption: 'Ảnh hiện trường 3' },
      { src: 'images/RUNG4.png', caption: 'Ảnh hiện trường 4' },
      { src: 'images/RUNG5.png', caption: 'Ảnh hiện trường 5' },
    ],
  },
  {
    title: 'Ảnh Drone',
    items: [
      { src: 'images/RUNG6.png', caption: 'Ảnh drone 1' },
      { src: 'images/RUNG7.png', caption: 'Ảnh drone 2' },
      { src: 'images/RUNG9.png', caption: 'Ảnh drone 3' },
      { src: 'images/RUNG10.png', caption: 'Ảnh drone 4' },
    ],
  },
  {
    title: 'Ảnh vệ tinh',
    items: [
      { src: 'images/RUNG11.png', caption: 'Ảnh vệ tinh 1' },
      { src: 'images/RUNG12.png', caption: 'Ảnh vệ tinh 2' },
      { src: 'images/RUNG13.png', caption: 'Ảnh vệ tinh 3' },
      { src: 'images/RUNG14.png', caption: 'Ảnh vệ tinh 4' },
    ],
  },
  {
    title: 'Google Earth',
    items: [
      { src: 'images/RUNG15.png', caption: 'Google Earth 1' },
      { src: 'images/RUNG16.png', caption: 'Google Earth 2' },
      { src: 'images/Rung2016.png', caption: 'Google Earth 2016' },
    ],
  },
];

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
  searchHighlightFeatureIds: new Set(),
  pulseTimer: null,
  pulseOn: false,
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
  galleryLoaded: false,
};

const els = {
  appShell: document.querySelector('.app-shell'),
  mapViewButton: document.getElementById('mapViewButton'),
  galleryViewButton: document.getElementById('galleryViewButton'),
  searchForm: document.getElementById('searchForm'),
  searchInput: document.getElementById('searchInput'),
  locateButton: document.getElementById('locateButton'),
  quickLocateButton: document.getElementById('quickLocateButton'),
  followButton: document.getElementById('followButton'),
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
  detailContent: document.getElementById('detailContent'),
  closeDetailButton: document.getElementById('closeDetailButton'),
  currentBlockCard: document.getElementById('currentBlockCard'),
  currentXa: document.getElementById('currentXa'),
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
  galleryPage: document.getElementById('galleryPage'),
  galleryContent: document.getElementById('galleryContent'),
  lightbox: document.getElementById('lightbox'),
  lightboxCloseButton: document.getElementById('lightboxCloseButton'),
  lightboxImage: document.getElementById('lightboxImage'),
  lightboxCaption: document.getElementById('lightboxCaption'),
};

boot().catch((error) => {
  console.error(error);
  els.networkStatus.textContent = 'App failed to load';
});

async function boot() {
  updateNetworkStatus();
  window.addEventListener('online', updateNetworkStatus);
  window.addEventListener('offline', updateNetworkStatus);
  registerServiceWorker();
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
  els.mapViewButton.addEventListener('click', showMapView);
  els.galleryViewButton.addEventListener('click', showGalleryView);
  els.searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    runSearch();
  });
  els.locateButton.addEventListener('click', locateMe);
  els.quickLocateButton.addEventListener('click', quickLocate);
  els.followButton.addEventListener('click', toggleGpsFollow);
  els.clearButton.addEventListener('click', clearSearch);
  els.closeDetailButton.addEventListener('click', hideDetailSheet);
  document.addEventListener('click', handlePopupDetailClick);
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
  els.galleryContent.addEventListener('click', handleGalleryClick);
  els.lightboxCloseButton.addEventListener('click', closeLightbox);
  els.lightbox.addEventListener('click', (event) => {
    if (event.target === els.lightbox) {
      closeLightbox();
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeLightbox();
    }
  });
  Object.entries(els.yearButtons).forEach(([year, button]) => {
    button.addEventListener('click', () => setImageryYear(year));
  });

  state.map.on('click', (event) => {
    if (state.measureMode) {
      addMeasurePoint(event.latlng);
      return;
    }
    closeLayerPanel();
    clearSearchHighlight();
    state.map.closePopup();
    hideDetailSheet();
  });
}

function showMapView() {
  els.appShell.classList.remove('gallery-mode');
  els.galleryPage.classList.add('hidden');
  closeLightbox();
  setActiveViewButton('map');
  setTimeout(() => state.map?.invalidateSize(), 0);
}

async function showGalleryView() {
  els.appShell.classList.add('gallery-mode');
  els.galleryPage.classList.remove('hidden');
  closeLayerPanel();
  hideDetailSheet();
  state.map.closePopup();
  setActiveViewButton('gallery');
  if (!state.galleryLoaded) {
    await loadGallery();
  }
}

function setActiveViewButton(view) {
  const isMap = view === 'map';
  els.mapViewButton.classList.toggle('active', isMap);
  els.galleryViewButton.classList.toggle('active', !isMap);
  els.mapViewButton.setAttribute('aria-pressed', String(isMap));
  els.galleryViewButton.setAttribute('aria-pressed', String(!isMap));
}

async function loadGallery() {
  els.galleryContent.innerHTML = '<div class="gallery-empty">Đang tải thư viện ảnh...</div>';
  try {
    const response = await fetch(GALLERY_URL);
    if (!response.ok) {
      throw new Error(`Failed to load ${GALLERY_URL}: HTTP ${response.status}`);
    }
    const data = await response.json();
    renderGallery(Array.isArray(data.groups) ? data.groups : []);
    state.galleryLoaded = true;
  } catch (error) {
    console.error(error);
    renderGallery(DEFAULT_GALLERY_GROUPS);
    state.galleryLoaded = true;
  }
}

function renderGallery(groups) {
  if (!groups.length) {
    els.galleryContent.innerHTML = '<div class="gallery-empty">Chưa có ảnh trong thư viện.</div>';
    return;
  }

  els.galleryContent.innerHTML = groups.map((group) => {
    const items = Array.isArray(group.items) ? group.items : [];
    const cards = items.map(renderGalleryCard).join('');
    return `
      <section class="gallery-group">
        <h2>${escapeHtml(group.title || 'Thư viện ảnh')}</h2>
        <div class="gallery-grid">
          ${cards || '<div class="gallery-empty">Chưa có ảnh.</div>'}
        </div>
      </section>
    `;
  }).join('');
}

function renderGalleryCard(item) {
  const src = String(item?.src || '').trim();
  if (!src) {
    return '';
  }
  const caption = String(item?.caption || '').trim();
  return `
    <figure class="gallery-card" data-src="${escapeHtml(src)}" data-caption="${escapeHtml(caption)}">
      <img src="${escapeHtml(src)}" alt="${escapeHtml(caption || 'Ảnh thư viện')}" loading="lazy">
      ${caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ''}
    </figure>
  `;
}

function handleGalleryClick(event) {
  const card = event.target.closest('.gallery-card');
  if (!card) {
    return;
  }
  openLightbox(card.dataset.src, card.dataset.caption || '');
}

function openLightbox(src, caption) {
  if (!src) {
    return;
  }
  els.lightboxImage.src = src;
  els.lightboxImage.alt = caption || 'Ảnh thư viện';
  els.lightboxCaption.textContent = caption || '';
  els.lightbox.classList.remove('hidden');
}

function closeLightbox() {
  if (els.lightbox.classList.contains('hidden')) {
    return;
  }
  els.lightbox.classList.add('hidden');
  els.lightboxImage.removeAttribute('src');
  els.lightboxCaption.textContent = '';
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

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', async () => {
    try {
      await navigator.serviceWorker.register('sw.js');
    } catch (error) {
      console.warn('Service worker registration failed', error);
    }
  });
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
      ...props,
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
      bubblingMouseEvents: false,
      style: featureStyle,
      onEachFeature: (feature, layer) => {
        const key = feature.id || feature.properties?.id || `${feature.properties.tk}/${feature.properties.khoanh}/${feature.properties.lo}`;
        layer._khebanKey = key;
        bindForestLabel(feature, layer);
        layer.on('click', (event) => {
          if (event.originalEvent) {
            L.DomEvent.stop(event.originalEvent);
          }
          selectFeature(feature);
        });
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
  const isSearchHighlighted = state.searchHighlightFeatureIds.has(key);
  const isCurrent = key === state.currentLocationFeatureId;
  const isHighlighted = isSearchHighlighted || isCurrent;
  return {
    color: isHighlighted ? '#facc15' : style.color,
    weight: isSearchHighlighted ? (state.pulseOn ? 6 : 5) : (isCurrent ? 4 : 1.4),
    opacity: isSearchHighlighted && state.pulseOn ? 0.82 : 1,
    fillColor: style.fillColor,
    fillOpacity: isSearchHighlighted ? 0.68 : 0.58,
    dashArray: null,
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

function parseQueryParts(raw) {
  const value = raw.trim().toLowerCase();
  if (!value) {
    return [];
  }

  const normalized = value.replace(/\s+/g, ' ').replace(/\btk\s+/g, 'tk');
  const parts = normalized.includes('/')
    ? normalized.split('/').map((part) => part.trim()).filter(Boolean)
    : normalized.split(' ').map((part) => part.trim()).filter(Boolean);

  return parts.map((part) => part.replace(/^tk/, '').replace(/^k/, '').replace(/^l/, ''));
}

function findSearchResults(rawQuery) {
  const parts = parseQueryParts(rawQuery);
  if (!parts.length) {
    return { type: 'all', results: state.features };
  }

  const candidates = [];
  const startsWithTk = /^\s*tk/i.test(rawQuery);
  if (parts.length >= 3) {
    candidates.push({
      type: 'tk-khoanh-lo',
      query: { tk: parts[0], khoanh: parts[1], lo: parts[2] },
    });
  }
  if (parts.length === 2 && startsWithTk) {
    candidates.push({
      type: 'tk-khoanh',
      query: { tk: parts[0], khoanh: parts[1] },
    });
  }
  if (parts.length === 2) {
    candidates.push({
      type: 'khoanh-lo',
      query: { khoanh: parts[0], lo: parts[1] },
    });
  }
  if (parts.length === 1) {
    candidates.push({ type: 'khoanh', query: { khoanh: parts[0] } });
    candidates.push({ type: 'lo', query: { lo: parts[0] } });
  }

  for (const candidate of candidates) {
    const results = state.features.filter((feature) => matchesQuery(feature, candidate.query));
    if (results.length) {
      return { type: candidate.type, results };
    }
  }

  return { type: 'none', results: [] };
}

function matchesQuery(feature, query) {
  if (!query) {
    return true;
  }
  const props = feature.properties;
  return (
    (!query.tk || String(props.tk).toLowerCase() === query.tk) &&
    (!query.khoanh || String(props.khoanh).toLowerCase() === query.khoanh) &&
    (!query.lo || String(props.lo).toLowerCase() === query.lo)
  );
}

function updateResults(rawQuery) {
  const search = findSearchResults(rawQuery);
  const results = search.results;
  els.resultsCount.textContent = `${results.length} kết quả`;
  els.resultsList.innerHTML = '';

  if (!rawQuery.trim()) {
    els.resultsPanel.classList.remove('visible');
    clearSearchHighlight();
    state.map.closePopup();
    hideDetailSheet();
    fitAllForestPolygons();
    return;
  }

  els.resultsPanel.classList.add('visible');

  if (!results.length) {
    clearSearchHighlight();
    state.map.closePopup();
    fitAllForestPolygons();
    return;
  }

  if (search.type === 'khoanh' || search.type === 'tk-khoanh') {
    showKhoanhSearchSummary(results);
    focusSearchResults(results, { openParcelDetail: false, keepResultsOpen: true });
    return;
  }

  renderSearchResultList(results);

  if (search.type === 'lo' && results.length > 1) {
    clearSearchHighlight();
    state.map.closePopup();
    hideDetailSheet();
    return;
  }

  focusSearchResults([results[0]]);
}

function renderSearchResultList(results) {
  results.slice(0, 20).forEach((feature) => {
    const button = document.createElement('button');
    button.className = 'result-item';
    button.type = 'button';
    button.innerHTML = `
      <strong>Khoảnh ${escapeHtml(feature.properties.khoanh)} - Lô ${escapeHtml(feature.properties.lo)}</strong>
      <span>${escapeHtml(feature.properties.xa)} · ${escapeHtml(formatArea(feature.properties.dtich))} · ${escapeHtml(feature.properties.ldlr)}</span>
    `;
    button.addEventListener('click', () => focusSearchResults([feature]));
    els.resultsList.appendChild(button);
  });
}

function showKhoanhSearchSummary(results) {
  const first = results[0];
  const totalArea = results.reduce((sum, feature) => {
    const area = Number(feature.properties?.dtich);
    return Number.isFinite(area) ? sum + area : sum;
  }, 0);
  els.resultsCount.textContent = `Khoảnh ${first.properties.khoanh}`;
  els.resultsList.innerHTML = `
    <div class="result-summary">
      <strong>Khoảnh ${escapeHtml(first.properties.khoanh)}</strong>
      <span>Số lô: ${results.length}</span>
      <span>Tổng diện tích: ${formatNumber(totalArea)} ha</span>
    </div>
  `;
}

function runSearch() {
  updateResults(els.searchInput.value);
}

function clearSearch() {
  els.searchInput.value = '';
  els.resultsList.innerHTML = '';
  els.resultsCount.textContent = '0 results';
  els.resultsPanel.classList.remove('visible');
  clearSearchHighlight();
  state.map.closePopup();
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

function focusSearchResults(features, options = {}) {
  const { openParcelDetail = true, keepResultsOpen = false } = options;
  const validFeatures = features.filter(Boolean);
  if (!validFeatures.length) {
    return;
  }

  const keys = validFeatures.map(getFeatureKey);
  setSearchHighlights(keys);

  const bounds = getFeaturesBounds(validFeatures);
  if (bounds?.isValid()) {
    state.map.fitBounds(bounds.pad(0.15), { maxZoom: validFeatures.length > 1 ? 16 : 17, animate: true });
  }

  const first = validFeatures[0];
  if (!keepResultsOpen) {
    collapseSearchResults();
  }
  if (openParcelDetail) {
    selectFeature(first);
  } else {
    state.map.closePopup();
    hideDetailSheet();
  }
}

function focusFeature(feature, openDetail = true) {
  const key = feature.id || feature.properties?.id || `${feature.properties.tk}/${feature.properties.khoanh}/${feature.properties.lo}`;
  const layer = findLayerByKey(key);
  if (layer) {
    state.map.fitBounds(layer.getBounds().pad(0.15), { maxZoom: 17, animate: true });
  } else if (feature.bounds) {
    state.map.fitBounds(feature.bounds.pad(0.15), { maxZoom: 17, animate: true });
  }

  collapseSearchResults();

  if (openDetail) {
    selectFeature(feature);
  } else {
    state.selectedFeatureId = key;
    setSearchHighlights([key]);
  }
}

function selectFeature(feature) {
  const key = getFeatureKey(feature);
  state.selectedFeatureId = key;
  setSearchHighlights([key]);
  hideDetailSheet();
  openFeaturePopup(feature);
}

function showDetailSheet(feature) {
  els.detailTitle.textContent = 'THÔNG TIN LÔ RỪNG';
  els.detailContent.innerHTML = renderDetailGroups(feature.properties);
  els.detailSheet.classList.remove('hidden');
}

function hideDetailSheet() {
  els.detailSheet.classList.add('hidden');
}

function renderDetailGroups(props) {
  const sections = [
    {
      title: 'THÔNG TIN HIỆN TRẠNG',
      fields: ['dtich', 'ldlr', 'sldlr', 'namtr', 'nggocr', 'nggocrt'],
    },
    {
      title: 'THÔNG TIN QUẢN LÝ',
      fields: ['mdsd', 'nguoink', 'nguoitrch', 'quyensd', 'thoihansd', 'trchap'],
    },
    {
      title: 'THÔNG TIN TÀI NGUYÊN',
      fields: ['thanhrung', 'mgolo', 'mgo'],
    },
    {
      title: 'THÔNG TIN VỊ TRÍ',
      fields: ['tk', 'khoanh', 'lo', 'diadanh'],
    },
  ];

  return sections
    .map((section) => renderDetailSection(section.title, section.fields, props))
    .filter(Boolean)
    .join('');
}

function renderDetailSection(title, fields, props) {
  const rows = fields
    .map((field) => renderDetailField(field, props?.[field]))
    .filter(Boolean)
    .join('');

  if (!rows) {
    return '';
  }

  return `
    <section class="detail-section">
      <h3>${escapeHtml(title)}</h3>
      <dl class="detail-list">
        ${rows}
      </dl>
    </section>
  `;
}

function renderDetailField(field, value) {
  const text = formatDetailValue(field, value);
  if (!text) {
    return '';
  }
  return `<div><dt>${escapeHtml(field)}</dt><dd>${escapeHtml(text)}</dd></div>`;
}

function formatDetailValue(field, value) {
  if (value === null || value === undefined) {
    return '';
  }

  const text = String(value).trim();
  if (!text) {
    return '';
  }

  const lower = text.toLowerCase();
  if (lower === 'null' || lower === 'undefined' || lower === 'nan') {
    return '';
  }

  if (isZeroValue(text) && shouldHideZeroDetailValue(field)) {
    return '';
  }

  return text;
}

function isZeroValue(value) {
  return Number(value) === 0;
}

function shouldHideZeroDetailValue(field) {
  return new Set([
    'namtr',
  ]).has(field);
}

function getFirstValue(props, keys) {
  for (const key of keys) {
    const value = formatPopupValue(key, props?.[key]);
    if (value) {
      return value;
    }
  }
  return '';
}

function handlePopupDetailClick(event) {
  const button = event.target.closest('[data-detail-feature]');
  if (!button) {
    return;
  }
  event.preventDefault();
  event.stopPropagation();
  const feature = findFeatureById(button.dataset.detailFeature);
  if (feature) {
    showDetailSheet(feature);
  }
}

function openFeaturePopup(feature) {
  const layer = findLayerByKey(getFeatureKey(feature));
  const latlng = layer?.getBounds().getCenter() || feature.bounds?.getCenter();
  if (!latlng) {
    return;
  }
  const props = feature.properties;
  const rows = [
    ['dtich', props.dtich],
    ['ldlr', props.ldlr],
    ['sldlr', props.sldlr],
    ['namtr', props.namtr],
  ]
    .map(([label, value]) => buildPopupRow(label, value))
    .filter(Boolean)
    .join('');

  L.popup({ closeButton: true, maxWidth: 280, className: 'parcel-popup' })
    .setLatLng(latlng)
    .setContent(`
      <div class="popup-card">
        <div class="popup-title">Khoảnh ${escapeHtml(props.khoanh || '-')} / Lô ${escapeHtml(props.lo || '-')}</div>
        ${rows}
        <button class="popup-detail-button" type="button" data-detail-feature="${escapeHtml(getFeatureKey(feature))}">Chi tiết</button>
      </div>
    `)
    .openOn(state.map);
}

function buildPopupRow(label, value) {
  const text = formatPopupValue(label, value);
  if (!text) {
    return '';
  }
  return `<div class="popup-row"><strong>${escapeHtml(label)}:</strong> ${escapeHtml(text)}</div>`;
}

function formatPopupValue(field, value) {
  if (value === null || value === undefined) {
    return '';
  }
  const text = String(value).trim();
  if (!text) {
    return '';
  }
  const lower = text.toLowerCase();
  if (lower === 'null' || lower === 'undefined' || lower === 'nan') {
    return '';
  }
  if (isZeroValue(text) && shouldHideZeroDetailValue(field)) {
    return '';
  }
  return text;
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
  processGpsUpdate({
    latlng: [position.coords.latitude, position.coords.longitude],
    accuracy: Math.max(Number(position.coords.accuracy) || 0, 5),
    centerMap: state.gpsFollow,
  });
}

function quickLocate() {
  if (state.gpsWatchId === null) {
    locateMe();
    return;
  }

  state.gpsFollow = true;
  syncGpsButtons();

  if (state.gpsLastLatLng) {
    state.map.setView(state.gpsLastLatLng, Math.max(state.map.getZoom(), 17), { animate: true });
    updateCurrentForestBlock(state.gpsLastLatLng);
  }
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
  els.currentXa.textContent = props.xa || '-';
  els.currentTk.textContent = props.tk || '-';
  els.currentKhoanh.textContent = props.khoanh || '-';
  els.currentLo.textContent = props.lo || '-';
  els.currentLdlr.textContent = props.ldlr || '-';
  els.currentDtich.textContent = formatArea(props.dtich);
  els.currentBlockCard.classList.remove('hidden');
}

function processGpsUpdate({ latlng, accuracy, centerMap }) {
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

  if (centerMap) {
    state.map.setView(latlng, Math.max(state.map.getZoom(), 17), { animate: true });
  }

  updateCurrentForestBlock(latlng);
}

function setSearchHighlights(keys) {
  const nextKeys = keys.filter(Boolean);
  if (!nextKeys.length) {
    clearSearchHighlight();
    return;
  }
  state.searchHighlightFeatureIds = new Set(nextKeys);
  startHighlightPulse();
  refreshPolygonStyles();
}

function clearSearchHighlight() {
  if (!state.searchHighlightFeatureIds.size) {
    return;
  }
  state.searchHighlightFeatureIds.clear();
  stopHighlightPulse();
  refreshPolygonStyles();
}

function startHighlightPulse() {
  if (state.pulseTimer) {
    return;
  }
  state.pulseOn = false;
  state.pulseTimer = window.setInterval(() => {
    if (!state.searchHighlightFeatureIds.size) {
      stopHighlightPulse();
      return;
    }
    state.pulseOn = !state.pulseOn;
    refreshPolygonStyles();
  }, 700);
}

function stopHighlightPulse() {
  if (state.pulseTimer) {
    window.clearInterval(state.pulseTimer);
    state.pulseTimer = null;
  }
  state.pulseOn = false;
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

function findFeatureById(key) {
  return state.features.find((feature) => feature.id === key) || null;
}

function getFeatureKey(feature) {
  return feature.id || feature.properties?.id || `${feature.properties.tk}/${feature.properties.khoanh}/${feature.properties.lo}`;
}

function getFeaturesBounds(features) {
  const bounds = features.reduce((acc, feature) => {
    const layer = findLayerByKey(getFeatureKey(feature));
    const featureBounds = layer?.getBounds() || feature.bounds;
    return featureBounds ? acc.extend(featureBounds) : acc;
  }, L.latLngBounds([]));
  return bounds.isValid() ? bounds : null;
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
