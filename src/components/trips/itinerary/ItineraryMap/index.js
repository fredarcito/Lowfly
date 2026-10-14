"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

// Esri basemaps (no key needed): streets in the light theme, dark grey in the dark one
const TILES = {
  light: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
  dark: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
};
const ATTRIBUTION = "Tiles &copy; Esri";
const CORAL = "#ed604e";
const GREEN = "#2f9e6e";

const theme = () => (document.documentElement.dataset.theme === "light" ? "light" : "dark");

// Numbered coral pin (green with a tick once visited); the active one is bigger and outlined in dark
function markerIcon(leaflet, number, active, visited) {
  const size = active ? 34 : 26;
  const ring = active ? "0 0 0 3px #fff,0 0 0 6px rgb(14 41 61/.55)" : "0 0 0 2px #fff";
  return leaflet.divIcon({
    className: "",
    html: `<span style="display:grid;place-items:center;width:${size}px;height:${size}px;border-radius:9999px;background:${visited ? GREEN : CORAL};color:#fff;font:700 ${active ? 14 : 12}px/1 system-ui;box-shadow:${ring},0 2px 6px rgb(0 0 0/.35);transition:all .15s">${visited ? "✓" : number}</span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// The day's stops, numbered in order, joined by a dashed line (straight: no routing service).
// `stops`: [{ number, name, lat, lng }]. `focus`: the stops to frame at first (without the airport).
// `active`: the highlighted stop number; `visited`: numbers already visited; `onSelect(number)` when a pin is tapped.
// Leaflet only runs in the browser, so it is loaded when the map mounts.
export default function ItineraryMap({ stops, focus = stops, active, visited = [], onSelect, className }) {
  const box = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef(new Map()); // number → marker
  const leafletRef = useRef(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const key = stops.map((stop) => `${stop.lat},${stop.lng}`).join(";");

  useEffect(() => {
    let observer;
    let cancelled = false;
    const markers = markersRef.current;
    import("leaflet").then(({ default: leaflet }) => {
      if (cancelled || !box.current || !stops.length) return;
      leafletRef.current = leaflet;
      const map = leaflet.map(box.current, { scrollWheelZoom: false, attributionControl: true });
      mapRef.current = map;
      const addTiles = () => leaflet.tileLayer(TILES[theme()], { attribution: ATTRIBUTION, maxZoom: 19 }).addTo(map);
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
      map.fitBounds(framed.length > 1 ? framed : [framed[0], framed[0]], { padding: [32, 32], maxZoom: 15 });

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
}
