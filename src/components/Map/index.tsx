import React, { useEffect, useState, useRef } from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import { travelTimeEstimate } from "../../helpers/travelCalculator";
import { LeafletMapProps, MarkerData } from "./LeafletTypes";

import LeafletDialog from "./LeafletModal";

type MarkerDialogState =
  | { mode: "closed" }
  | { mode: "create"; position: [number, number] }
  | { mode: "delete"; id: string };

export default function Map(props: LeafletMapProps) {
  const [measureEnabled, setMeasureEnabled] = useState(false);
  const [userMarkers, setUserMarkers] = useState<MarkerData[]>([]);
  const [hoverDistance, setHoverDistance] = useState<number | null>(null);
  const [selectedDistance, setSelectedDistance] = useState<number | null>(null);
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);

  const [dialog, setDialog] = useState<MarkerDialogState>({ mode: "closed" });

  // ✅ FIX: stable click position
  const pendingMarkerPosition = useRef<[number, number] | null>(null);

  const storageKey = `map-markers-${props.image}`;

  const displayDistance =
    hoverDistance ?? selectedDistance ?? null;

  const travelInfo = displayDistance
    ? travelTimeEstimate(displayDistance)
    : [];

  useEffect(() => {
    if (!measureEnabled) {
      setHoverDistance(null);
      setSelectedDistance(null);
    }
  }, [measureEnabled]);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setUserMarkers(JSON.parse(saved));
      } catch {
        console.warn("Failed to parse saved markers");
      }
    }
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(userMarkers));
  }, [userMarkers, storageKey]);

  const handleCreateMarker = (position: [number, number]) => {
    pendingMarkerPosition.current = position;
    console.log(position);
    setDialog({ mode: "create", position });
  };

  const handleDeleteMarker = (id: string) => {
    setDialog({ mode: "delete", id });
  };

  const closeDialog = () => {
    pendingMarkerPosition.current = null;
    setDialog({ mode: "closed" });
  };

  return (
    <BrowserOnly fallback={<div>Loading map...</div>}>
      {() => {
        const LeafletMap = require("./LeafletMap").default;

        return (
          <div style={{ position: "relative" }}>
            <LeafletMap
              {...props}
              measureEnabled={measureEnabled}
              setMeasureEnabled={setMeasureEnabled}
              displayDistance={displayDistance}
              travelInfo={travelInfo}
              scaleRatio={props.scaleRatio ?? 1}
              userMarkers={userMarkers}
              handleDeleteMarker={handleDeleteMarker}
              setUserMarkers={setUserMarkers}
              onHoverDistanceChange={setHoverDistance}
              onSelectedDistanceChange={setSelectedDistance}
              onStartCreateMarker={handleCreateMarker}
              dialog={dialog}
              setDialog={setDialog}
            />
          </div>
        );
      }}
    </BrowserOnly>
  );
}