import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
} from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface LocationEvent {
  id: string;
  latitude: number;
  longitude: number;
  capturedAt: string;
}

interface Props {
  locations: LocationEvent[];
}

const latestLocationIcon = L.divIcon({
  className: "",
  html: `
    <div
      style="
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: #DC2626;
        border: 4px solid white;
        box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.22),
                    0 4px 12px rgba(15, 23, 42, 0.25);
      "
    ></div>
  `,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

export default function SessionMap({
  locations,
}: Props) {
  if (!locations.length) {
    return null;
  }

  const sortedLocations = [...locations].sort(
    (a, b) =>
      new Date(b.capturedAt).getTime() -
      new Date(a.capturedAt).getTime(),
  );

  const latest = sortedLocations[0];

  return (
    <div className="overflow-hidden border border-[#D5E1EB] bg-white">
      <MapContainer
        key={`${latest.latitude}-${latest.longitude}`}
        center={[
          Number(latest.latitude),
          Number(latest.longitude),
        ]}
        zoom={16}
        scrollWheelZoom
        style={{
          height: "390px",
          width: "100%",
        }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {sortedLocations.map(
          (location, index) => {
            const isLatest = index === 0;

            return (
              <Marker
                key={location.id}
                position={[
                  Number(location.latitude),
                  Number(location.longitude),
                ]}
                icon={
                  isLatest
                    ? latestLocationIcon
                    : new L.Icon.Default()
                }
              >
                <Popup>
                  <div className="min-w-[180px]">
                    <p className="font-semibold text-slate-900">
                      {isLatest
                        ? "Latest captured location"
                        : "Previous location"}
                    </p>

                    <p className="mt-1 text-sm text-slate-600">
                      {new Date(
                        location.capturedAt,
                      ).toLocaleString("en-ZA")}
                    </p>

                    <p className="mt-2 font-mono text-xs text-slate-500">
                      {Number(
                        location.latitude,
                      ).toFixed(6)}
                      ,{" "}
                      {Number(
                        location.longitude,
                      ).toFixed(6)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            );
          },
        )}
      </MapContainer>
    </div>
  );
}