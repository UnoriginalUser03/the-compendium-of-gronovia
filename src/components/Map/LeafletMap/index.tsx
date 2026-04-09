import React, { useRef } from "react";
import L from "leaflet";
import { MapContainer, ImageOverlay } from "react-leaflet";
import LeafletMarker from "../LeafletMarker";
import LeafletDevCoords from "../LeafletDevCoords";
import LeafletFullscreen from "../LeafletFullscreen";
import useBaseUrl from "@docusaurus/useBaseUrl";
import LeafletRecenter from "../LeafletRecenter";
import LeafletMeasureControls from "../LeafletMeasureControls";
import LeafletDistancePanel from "../LeafletDistancePanel";
import LeafletMeasure from "../LeafletMeasure";

type MarkerType = {
  id: string;
  position: [number, number];
  title: string;
  link?: string;
  Icon?: React.ReactNode;
};

type LeafletMapProps = {
  image: string;
  bounds: [[number, number], [number, number]];
  markers?: MarkerType[];
  scaleRatio?: number;
  measureEnabled?: boolean;
  setMeasureEnabled?: (v: boolean) => void;
  displayDistance?: number | null;
  travelInfo?: { pace: string; days: number; hours: number }[];
  onDistanceMeasured?: (miles: number) => void;
  onHoverDistanceChange?: (miles: number | null) => void;
};

export default function LeafletMap({
  image,
  bounds,
  markers = [],
  scaleRatio = 1,
  measureEnabled = false,
  setMeasureEnabled,
  displayDistance = null, // ✅ default to null
  travelInfo = [],
  onDistanceMeasured,
  onHoverDistanceChange,
}: LeafletMapProps) {
  const center: [number, number] = [
    (bounds[0][0] + bounds[1][0]) / 2,
    (bounds[0][1] + bounds[1][1]) / 2,
  ];
  const measureRef = useRef<{ clear: () => void }>(null);

  return (
    <MapContainer
      crs={L.CRS.Simple}
      bounds={bounds}
      center={center}
      zoom={-3}
      maxZoom={3}
      minZoom={-3}
      style={{
        height: "600px",
        width: "100%",
        backgroundColor: "var(--ifm-background-color)",
        position: "relative",
      }}
    >
      <ImageOverlay url={useBaseUrl(image)} bounds={bounds} />

      {markers.map((marker) => (
        <LeafletMarker key={`${marker.id}-${measureEnabled}`} marker={marker} interactable={!measureEnabled} />
      ))}

      <LeafletMeasureControls
        measureEnabled={measureEnabled}
        setMeasureEnabled={setMeasureEnabled!}
        onClear={() => measureRef.current?.clear()}
      />

      <LeafletDistancePanel
        displayDistance={displayDistance}
        travelInfo={travelInfo}
      />

      <LeafletDevCoords
        measureEnabled={measureEnabled}
        devMode={process.env.NODE_ENV === "development"}
      />

      {measureEnabled && (
        <LeafletMeasure
          scaleRatio={scaleRatio}
          onDistanceMeasured={onDistanceMeasured}
          onHoverDistanceChange={onHoverDistanceChange}
          measureEnabled={measureEnabled}
          ref={measureRef}
        />
      )}

      <LeafletFullscreen />
      <LeafletRecenter center={center} zoom={-3} />

    </MapContainer>
  );
}