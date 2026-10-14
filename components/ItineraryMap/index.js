"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

// Esri basemaps (no key needed): streets in the light theme, dark grey in the dark one
const TILES = {
  light: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
  dark: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
};
const ATTRIBUTION = "Tiles &copy; Esri";

const theme = () => (document.documentElement.dataset.theme === "light" ? "light" : "dark");

// The day's stops, numbered in order, joined by a line. `stops`: [{ number, name, lat, lng }].
// `focus`: the stops to frame at first (without the airport, which would zoom the city out).
// Leaflet only runs in the browser, so it is loaded when the map mounts.
export default function ItineraryMap({ stops, focus = stops, className }) {
  const box = useRef(null);
  const key = stops.map((stop) => `${stop.lat},${stop.lng}`).join(";");

  useEffect(() => {
    let map;
    let observer;
    let cancelled = false;
    import("leaflet").then(({ default: leaflet }) => {
      if (cancelled || !box.current || !stops.length) return;
      map = leaflet.map(box.current, { scrollWheelZoom: false, attributionControl: true });
      const addTiles = () => leaflet.tileLayer(TILES[theme()], { attribution: ATTRIBUTION, maxZoom: 19 }).addTo(map);
      let tiles = addTiles();

      const points = stops.map((stop) => [stop.lat, stop.lng]);
      if (points.length > 1) leaflet.polyline(points, { color: "#ed604e", weight: 3, opacity: 0.8, dashArray: "6 6" }).addTo(map);
      for (const stop of stops) {
        const icon = leaflet.divIcon({
          className: "",
          html: `<span style="display:grid;place-items:center;width:26px;height:26px;border-radius:9999px;background:#ed604e;color:#fff;font:700 12px/1 system-ui;box-shadow:0 0 0 2px #fff,0 2px 6px rgb(0 0 0/.35)">${stop.number}</span>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });
        leaflet.marker([stop.lat, stop.lng], { icon, title: stop.name }).addTo(map).bindPopup(`<b>${stop.number}. ${stop.name}</b>`);
      }
      const framed = focus.map((stop) => [stop.lat, stop.lng]);
      map.fitBounds(framed.length > 1 ? framed : [framed[0], framed[0]], { padding: [28, 28], maxZoom: 15 });

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
      map?.remove();
    };
    // `key` stands for the stops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return <div ref={box} className={className} />;
}
