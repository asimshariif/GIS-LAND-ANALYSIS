import { useEffect, useRef, useState } from "react";
import { getParcels } from "../api/client";

export default function MapView({ onBoundsChange }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (mapInstanceRef.current) return;

    let mounted = true;

    Promise.all([
      import("leaflet"),
      import("leaflet/dist/leaflet.css"),
    ]).then(([L]) => {
      if (!mounted || !mapRef.current) return;

      const map = L.map(mapRef.current).setView([39.5, -98.35], 4);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);
      mapInstanceRef.current = map;

      getParcels()
        .then((parcels) => {
          if (!mounted) return;
          parcels.forEach((parcel) => {
            if (!parcel.geometry_json) return;
            try {
              const geo = JSON.parse(parcel.geometry_json);
              L.geoJSON(geo, {
                style: { color: "#2c7be5", weight: 1, fillOpacity: 0.2 },
              })
                .bindPopup(
                  `<b>Parcel ID:</b> ${parcel.parcel_id || "N/A"}<br>
                   <b>Land Use:</b> ${parcel.land_use || "N/A"}<br>
                   <b>Area:</b> ${parcel.area_acres?.toFixed(3) ?? "N/A"} acres`
                )
                .addTo(map);
            } catch (_) {}
          });
        })
        .catch((err) => {
          if (mounted) setError(err.message);
        });

      map.on("moveend", () => {
        const b = map.getBounds();
        onBoundsChange?.({
          minX: b.getWest(),
          minY: b.getSouth(),
          maxX: b.getEast(),
          maxY: b.getNorth(),
        });
      });
    });

    return () => {
      mounted = false;
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  return (
    <section className="map-container">
      {error && <div className="error">Map error: {error}</div>}
      <div ref={mapRef} style={{ height: "100%", width: "100%", minHeight: "400px" }} />
    </section>
  );
}
