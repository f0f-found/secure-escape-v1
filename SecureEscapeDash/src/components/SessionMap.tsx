import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";

// Fix missing marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
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

export default function SessionMap({ locations }: Props) {
  if (!locations.length) return null;

  const latest = locations[locations.length - 1];

  return (
    <MapContainer
      center={[latest.latitude, latest.longitude]}
      zoom={15}
      scrollWheelZoom
      style={{
        height: "400px",
        width: "100%",
        borderRadius: "16px",
      }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {locations.map((loc) => (
        <Marker key={loc.id} position={[loc.latitude, loc.longitude]}>
          <Popup>
            <strong>Captured</strong>
            <br />
            {new Date(loc.capturedAt).toLocaleString()}
            <br />
            {loc.latitude}, {loc.longitude}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
