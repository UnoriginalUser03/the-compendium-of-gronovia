import React from "react";

type DistanceProps = {
  measureEnabled: boolean;
  setMeasureEnabled: (v: boolean) => void;
  displayDistance: number | null;
  travelInfo: { pace: string; days: number; hours: number }[];
};

export default function LeafletDistance({
  measureEnabled,
  setMeasureEnabled,
  displayDistance,
  travelInfo,
  onClearMeasurements, // ✅ new prop
}: DistanceProps & { onClearMeasurements: () => void }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 1000,
        pointerEvents: "none",
      }}
    >
      {/* Measure toggle */}
      <button
        onClick={() => setMeasureEnabled(!measureEnabled)}
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          padding: "8px 12px",
          background: measureEnabled
            ? "var(--ifm-color-danger)"
            : "var(--ifm-color-primary)",
          color: "white",
          borderRadius: 4,
          border: "none",
          cursor: "pointer",
          pointerEvents: "auto",
          fontFamily: "var(--ifm-font-family-base)",
        }}
      >
        {measureEnabled ? "Exit Measure Mode" : "Measure Distance"}
      </button>

      {/* Clear measurements button */}
      {measureEnabled && (
        <button
          onClick={onClearMeasurements}
          style={{
            position: "absolute",
            top: 50,
            right: 10,
            padding: "8px 12px",
            background: "var(--ifm-color-warning)",
            color: "white",
            borderRadius: 4,
            border: "none",
            cursor: "pointer",
            pointerEvents: "auto",
            fontFamily: "var(--ifm-font-family-base)",
          }}
        >
          Clear Measurements
        </button>
      )}

      {/* Distance panel */}
      {displayDistance !== null && (
        <div
          style={{
            position: "absolute",
            bottom: 10,
            right: 10,
            padding: "10px 14px",
            background: "var(--ifm-background-surface-color)",
            borderRadius: 6,
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            minWidth: 160,
            pointerEvents: "auto",
            fontFamily: "var(--ifm-font-family-base)",
            fontSize: "var(--ifm-font-size-base)",
          }}
        >
          <strong>Distance:</strong> {displayDistance.toFixed(2)} miles
          <br />
          {travelInfo.map((t) => (
            <div key={t.pace}>
              {t.pace[0].toUpperCase() + t.pace.slice(1)} pace: {t.days} day
              {t.days !== 1 ? "s" : ""} {t.hours} hour
              {t.hours !== 1 ? "s" : ""}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}