import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { ParkingSpot } from "@/store/parkingSpotStore";
import { defaultMarkerIcon } from "@/lib/leafletIcon";

type Props = {
  spots: ParkingSpot[];
  height?: string; // e.g. "60vh"
};

function averageCenter(spots: ParkingSpot[]): [number, number] {
  const withCoords = spots.filter(
    (s) => typeof s.latitude === "number" && typeof s.longitude === "number"
  );

  if (withCoords.length === 0) return [60.1699, 24.9384]; 

  const lat = withCoords.reduce((sum, s) => sum + (s.latitude as number), 0) / withCoords.length;
  const lng = withCoords.reduce((sum, s) => sum + (s.longitude as number), 0) / withCoords.length;
  return [lat, lng];
}

export function ParkingSpotsMap({ spots, height = "60vh" }: Props) {
  const center = useMemo(() => averageCenter(spots), [spots]);

  const markers = spots.filter(
    (s) => typeof s.latitude === "number" && typeof s.longitude === "number"
  );

  return (
    <div style={{ height, width: "100%" }} className="overflow-hidden rounded-lg border">
      <MapContainer center={center} zoom={12} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {markers.map((s) => (
          <Marker
            key={s.id}
            position={[s.latitude as number, s.longitude as number]}
            icon={defaultMarkerIcon}
          >
            <Popup>
              <div className="space-y-1">
                <div className="font-semibold">{s.title}</div>
                <div className="text-sm">{s.address}</div>
                <div className="text-sm">
                  {s.city} {s.postal_code}
                </div>
                <div className="text-sm">€/h: {s.price_per_hour}</div>
                <div className="text-sm">€/day: {s.price_per_day}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}