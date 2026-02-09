import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import { defaultMarkerIcon } from "@/lib/leafletIcon";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type NominatimItem = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    road?: string;
    house_number?: string;
    city?: string;
    town?: string;
    village?: string;
    postcode?: string;
    country?: string;
  };
};

function MapClickPicker({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FlyTo({ position }: { position: LatLngExpression | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, Math.max(map.getZoom(), 14), { duration: 0.6 });
  }, [position, map]);
  return null;
}

export function LocationPicker({
  value,
  onChange,
  initialCenter = [60.1699, 24.9384], // Helsinki fallback
}: {
  value: {
    latitude: number | null;
    longitude: number | null;
    address?: string;
    city?: string;
    postal_code?: string;
    country?: string;
  };
  onChange: (next: {
    latitude: number | null;
    longitude: number | null;
    address?: string;
    city?: string;
    postal_code?: string;
    country?: string;
  }) => void;
  initialCenter?: [number, number];
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NominatimItem[]>([]);
  const [searching, setSearching] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const markerPos: LatLngExpression | null =
    value.latitude != null && value.longitude != null ? [value.latitude, value.longitude] : null;

  const center: LatLngExpression = markerPos ?? initialCenter;

  // Debounced search
  useEffect(() => {
    const q = query.trim();
    if (q.length < 3) {
      setResults([]);
      return;
    }

    const t = setTimeout(async () => {
      try {
        abortRef.current?.abort();
        const ac = new AbortController();
        abortRef.current = ac;

        setSearching(true);

        // Tip: include city/country in query for better results
        const url =
          `https://nominatim.openstreetmap.org/search?` +
          `format=json&addressdetails=1&limit=6&q=${encodeURIComponent(q)}`;

        const res = await fetch(url, {
          signal: ac.signal,
          headers: {
            Accept: "application/json",
          },
        });

        if (!res.ok) throw new Error(`Geocode failed: ${res.status}`);
        const data = (await res.json()) as NominatimItem[];
        setResults(data);
      } catch (e) {
        // ignore abort errors
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);

    return () => clearTimeout(t);
  }, [query]);

  const pretty = useMemo(() => {
    const a = value.address ?? "";
    const c = value.city ?? "";
    const p = value.postal_code ?? "";
    const co = value.country ?? "";
    return [a, [p, c].filter(Boolean).join(" "), co].filter(Boolean).join(", ");
  }, [value.address, value.city, value.postal_code, value.country]);

  const applyResult = (item: NominatimItem) => {
    const lat = Number(item.lat);
    const lng = Number(item.lon);

    const addr = item.address?.road
      ? `${item.address.road}${item.address.house_number ? " " + item.address.house_number : ""}`
      : item.display_name;

    const city = item.address?.city ?? item.address?.town ?? item.address?.village ?? "";
    const postal = item.address?.postcode ?? "";
    const country = item.address?.country ?? "";

    onChange({
      ...value,
      latitude: lat,
      longitude: lng,
      address: addr,
      city: city || value.city,
      postal_code: postal || value.postal_code,
      country: country || value.country,
    });

    setResults([]);
    setQuery("");
  };

  return (
    <div className="space-y-3">
      {/* Search input */}
      <div className="space-y-2">
        <div className="text-sm font-medium">Location</div>
        <Input
          placeholder="Search address (e.g. 'Mannerheimintie 1, Helsinki')"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {/* Suggestions */}
        {results.length > 0 && (
          <div className="rounded-md border bg-background shadow-sm">
            {results.map((r) => (
              <button
                type="button"
                key={r.place_id}
                onClick={() => applyResult(r)}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-muted"
              >
                {r.display_name}
              </button>
            ))}
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          Tip: you can also click the map or drag the marker to fine-tune.
        </div>

        {(value.latitude != null && value.longitude != null) && (
          <div className="text-xs text-muted-foreground">
            Selected: {pretty || "—"} • lat {value.latitude.toFixed(6)}, lng {value.longitude.toFixed(6)}
          </div>
        )}
      </div>

      {/* Map */}
      <div className="overflow-hidden rounded-lg border" style={{ height: 320, width: "100%" }}>
        <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          <MapClickPicker
            onPick={(lat, lng) => onChange({ ...value, latitude: lat, longitude: lng })}
          />

          <FlyTo position={markerPos} />

          {markerPos && (
            <Marker
              position={markerPos}
              icon={defaultMarkerIcon}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const m = e.target;
                  const p = m.getLatLng();
                  onChange({ ...value, latitude: p.lat, longitude: p.lng });
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      {/* Optional button to clear */}
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => onChange({ ...value, latitude: null, longitude: null })}
          disabled={value.latitude == null || value.longitude == null}
        >
          Clear pin
        </Button>
      </div>

      {searching && <div className="text-xs text-muted-foreground">Searching…</div>}
    </div>
  );
}