import React, { useEffect, useRef } from "react";
import L from "leaflet";
import { MapContainer, ImageOverlay, useMap } from "react-leaflet";
import LeafletMarker from "../LeafletMarker";
import LeafletDevCoords from "../LeafletDevCoords";
import LeafletFullscreen from "../LeafletFullscreen";
import LeafletRecenter from "../LeafletRecenter";
import LeafletMeasureControls from "../LeafletMeasureControls";
import LeafletDistancePanel from "../LeafletDistancePanel";
import LeafletMeasure from "../LeafletMeasure";
import LeafletUserMarkers from "../LeafletUserMarkers";
import LeafletModal from "../LeafletModal";
import { LeafletMapProps, MarkerTypeGroups, MarkerTypes } from "../LeafletTypes";
import useBaseUrl from "@docusaurus/useBaseUrl";
import LeafletInteractionController from "../LeafletInteractionController";

type MarkerDialogState =
  | { mode: "closed" }
  | { mode: "create"; position: [number, number] }
  | { mode: "delete"; id: string };

type ExtendedProps = LeafletMapProps & {
  onStartCreateMarker?: (position: [number, number]) => void;
  dialog: MarkerDialogState;
  setDialog: React.Dispatch<React.SetStateAction<MarkerDialogState>>;
};

export default function LeafletMap({
  image,
  bounds,
  markers = [],
  userMarkers = [],
  scaleRatio = 1,
  measureEnabled = false,
  setUserMarkers,
  handleDeleteMarker,
  setMeasureEnabled,
  displayDistance = null,
  travelInfo = [],
  onHoverDistanceChange,
  onSelectedDistanceChange,
  onStartCreateMarker,
  dialog,
  setDialog,
}: ExtendedProps) {
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
        position: "relative",
      }}
    >
      <ImageOverlay url={useBaseUrl(image)} bounds={bounds} />

      {[...markers, ...userMarkers].map((marker) => (
        <LeafletMarker
          key={`${marker.id}-${!measureEnabled}`}
          marker={marker}
          interactable={!measureEnabled}   // visual + interaction lock
          onRequestDelete={handleDeleteMarker}
        />
      ))}

      <LeafletUserMarkers
        measureEnabled={measureEnabled}
        dialogOpen={dialog.mode !== "closed"} // 👈 add this
        onStartCreateMarker={onStartCreateMarker}
      />

      <LeafletMeasureControls
        measureEnabled={measureEnabled}
        setMeasureEnabled={setMeasureEnabled!}
        onClear={() => measureRef.current?.clear()}
      />

      <LeafletInteractionController locked={dialog.mode !== "closed"} />

      <LeafletDistancePanel
        displayDistance={displayDistance}
        travelInfo={travelInfo}
      />

      {measureEnabled && (
        <LeafletMeasure
          ref={measureRef}
          scaleRatio={scaleRatio}
          measureEnabled={measureEnabled}
          onHoverDistanceChange={onHoverDistanceChange}
          onSelectedDistanceChange={onSelectedDistanceChange}
        />
      )}

      <LeafletDevCoords
        measureEnabled={measureEnabled}
        devMode={process.env.NODE_ENV === "development"}
      />

      <LeafletFullscreen />
      <LeafletRecenter center={center} zoom={-3} />

      {/* ✅ MODAL INSIDE MAP (fullscreen-safe) */}
      {dialog.mode !== "closed" && (
        <LeafletModal
          title={
            dialog.mode === "create"
              ? "Create Marker"
              : "Delete Marker"
          }
          fields={
            dialog.mode === "create"
              ? [
                {
                  name: "title",
                  placeholder: "Marker name",
                  required: true,
                },
                {
                  name: "type",
                  type: "select",
                  required: true,
                  defaultValue: "poi",
                  options: Object.entries(MarkerTypeGroups.player).map(
                    ([key, v]) => ({
                      value: key,
                      label: v.label,
                    })
                  ),
                },
              ]
              : []
          }
          confirmLabel={dialog.mode === "delete" ? "Delete" : "Create"}
          cancelLabel="Cancel"
          onCancel={() => setDialog({ mode: "closed" })}
          onConfirm={(values) => {
            if (dialog.mode === "create") {
              setUserMarkers((prev) => [
                ...prev,
                {
                  id: crypto.randomUUID(),
                  position: dialog.position,
                  title: values.title,
                  type: values.type as any,
                  isUser: true,
                },
              ]);
            }

            if (dialog.mode === "delete") {
              setUserMarkers((prev) =>
                prev.filter((m) => m.id !== dialog.id)
              );
            }

            setDialog({ mode: "closed" });
          }}
        />
      )}
    </MapContainer>
  );
}