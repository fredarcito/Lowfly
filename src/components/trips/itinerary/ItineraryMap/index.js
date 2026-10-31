"use client";

import { useEffect, useRef } from "react";

// Esri basemaps: streets in the light theme, dark grey in the dark one. With Lowfly's key (NEXT_PUBLIC_ESRI_KEY,
// ArcGIS Location Platform: 2 million tiles a month free, only from lowfly.travel and localhost), its static tiles
// service, 512 px tiles; without it (tests, previews), the old keyless one
const ESRI_KEY = process.env.NEXT_PUBLIC_ESRI_KEY;
const STATIC_TILES = "https://static-map-tiles-api.arcgis.com/arcgis/rest/services/static-basemap-tiles-service/v1/arcgis";
const TILES = ESRI_KEY
  ? {
      light: `${STATIC_TILES}/streets/static/tile/{z}/{y}/{x}?token=${ESRI_KEY}`,
      dark: `${STATIC_TILES}/dark-gray/static/tile/{z}/{y}/{x}?token=${ESRI_KEY}`,
    }
  : {
      light: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
      dark: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    };
// 512 px tiles cover what four of 256 px did: one zoom level lower for the same map
const TILE_OPTIONS = ESRI_KEY ? { tileSize: 512, zoomOffset: -1 } : {};
const ATTRIBUTION = "Powered by Esri";

const theme = () => (document.documentElement.dataset.theme === "light" ? "light" : "dark");

const CORAL = "#ed604e";
const GREEN = "#2f9e6e";

// A map pin 28 × 36 (round head, pointed tip at the bottom centre), drawn with room around it for its outline
const PIN_PATH = "M14 0C6.3 0 0 6.2 0 13.9 0 24.3 14 36 14 36s14-11.7 14-22.1C28 6.2 21.7 0 14 0z";
const PIN_MARGIN = 4;

// Numbered coral pin (green with a tick once visited); the active one is bigger and outlined in dark. Its tip is on
// the stop, so the dashed line meets the tips.
const markerIcon = (leaflet, number, active, visited) => {
  const scale = active ? 1.3 : 1;
  const width = (28 + PIN_MARGIN * 2) * scale;
  const height = (36 + PIN_MARGIN * 2) * scale;
  const outline = active ? `<path d="${PIN_PATH}" fill="none" stroke="rgb(14 41 61/.55)" stroke-width="6" stroke-linejoin="round"/>` : "";
  return leaflet.divIcon({
    className: "",
    html: `<span style="position:relative;display:block;width:${width}px;height:${height}px;filter:drop-shadow(0 2px 3px rgb(0 0 0/.35))">
      <svg width="${width}" height="${height}" viewBox="${-PIN_MARGIN} ${-PIN_MARGIN} ${28 + PIN_MARGIN * 2} ${36 + PIN_MARGIN * 2}" style="display:block">
        ${outline}<path d="${PIN_PATH}" fill="${visited ? GREEN : CORAL}" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>
      </svg>
      <span style="position:absolute;left:0;right:0;top:${PIN_MARGIN * scale}px;height:${28 * scale}px;display:grid;place-items:center;color:#fff;font:700 ${active ? 15 : 12}px/1 system-ui">${visited ? "✓" : number}</span>
    </span>`,
    iconSize: [width, height],
    iconAnchor: [width / 2, height - PIN_MARGIN * scale],
  });
};

// The day's stops, numbered in order, joined by a dashed line (straight: no routing service).
// `stops`: [{ number, name, lat, lng }]. `focus`: the stops to frame at first (without the airport).
// `active`: the highlighted stop number; `visited`: numbers already visited; `onSelect(number)` when a pin is tapped.
// Leaflet only runs in the browser, so it is loaded when the map mounts.
const ItineraryMap = ({ stops, focus = stops, active, visited = [], onSelect, className }) => {
  const box = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef(new Map()); // number → marker
  const leafletRef = useRef(null);
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);
  const key = stops.map((stop) => `${stop.lat},${stop.lng}`).join(";");

  useEffect(() => {
    let observer;
    let cancelled = false;
    const markers = markersRef.current;
    // Leaflet and its styles only once a map is shown: imported at the top, its CSS was preloaded with the trips
    // route (prefetched from the menu on every page) and never used there
    Promise.all([import("leaflet"), import("leaflet/dist/leaflet.css")]).then(([{ default: leaflet }]) => {
      if (cancelled || !box.current || !stops.length) return;
      leafletRef.current = leaflet;
      const map = leaflet.map(box.current, { scrollWheelZoom: false, attributionControl: true });
      mapRef.current = map;
      const addTiles = () => leaflet.tileLayer(TILES[theme()], { attribution: ATTRIBUTION, maxZoom: 19, ...TILE_OPTIONS }).addTo(map);
      let tiles = addTiles();

      const points = stops.map((stop) => [stop.lat, stop.lng]);
      if (points.length > 1) leaflet.polyline(points, { color: CORAL, weight: 3, opacity: 0.85, dashArray: "6 7" }).addTo(map);
      for (const stop of stops) {
        const marker = leaflet
          .marker([stop.lat, stop.lng], { icon: markerIcon(leaflet, stop.number, false), title: `${stop.number}. ${stop.name}` })
          .addTo(map)
          .on("click", () => onSelectRef.current?.(stop.number));
        markers.set(stop.number, marker);
      }
      const framed = focus.map((stop) => [stop.lat, stop.lng]);
      // More room on top: the pins stand above their stops
      map.fitBounds(framed.length > 1 ? framed : [framed[0], framed[0]], { paddingTopLeft: [32, 56], paddingBottomRight: [32, 24], maxZoom: 15 });

      // Theme switch: swap the tiles
      observer = new MutationObserver(() => {
        map.removeLayer(tiles);
        tiles = addTiles();
      });
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    });
    return () => {
      cancelled = true;
      observer?.disconnect();
      mapRef.current?.remove();
      mapRef.current = null;
      markers.clear();
    };
    // `key` stands for the stops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Highlight the active stop (and bring it into view) and tick the visited ones
  const visitedKey = visited.join(",");
  useEffect(() => {
    const leaflet = leafletRef.current;
    if (!leaflet) return;
    for (const [number, marker] of markersRef.current) {
      const isActive = number === active;
      marker.setIcon(markerIcon(leaflet, number, isActive, visited.includes(number)));
      marker.setZIndexOffset(isActive ? 1000 : 0);
      if (isActive) mapRef.current?.panInside(marker.getLatLng(), { padding: [48, 48] });
    }
    // `visitedKey` stands for `visited`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, key, visitedKey]);

  return <div ref={box} className={className} />;
};

export default ItineraryMap;
