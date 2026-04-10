import { useMapEvents } from "react-leaflet";

export default function LeafletUserMarkers({
  measureEnabled,
  onStartCreateMarker,
  dialogOpen, // 👈 add this
}: {
  measureEnabled: boolean;
  dialogOpen: boolean;
  onStartCreateMarker?: (position: [number, number]) => void;
}) {
  useMapEvents({
    click(e) {
      if (measureEnabled || dialogOpen) return;

      onStartCreateMarker?.([e.latlng.lat, e.latlng.lng]);
    },
  });

  return null;
}