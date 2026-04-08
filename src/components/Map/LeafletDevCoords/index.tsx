import React, { useState } from "react";
import { useMapEvents } from "react-leaflet";

type DevCoordsProps = {
    measureEnabled: boolean;
    devMode?: boolean;
};

export default function LeafletDevCoords({ measureEnabled, devMode = false }: DevCoordsProps) {
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

    useMapEvents({
        mousemove(e) {
            if (!devMode) return;
            setCoords(e.latlng);
        },
        click(e) {
            if (!devMode || measureEnabled) return;
            const text = `${Math.round(e.latlng.lat)}, ${Math.round(e.latlng.lng)}`;
            navigator.clipboard.writeText(text).then(() => {
                console.log("Copied to clipboard:", text);
            });
        },
        mouseout() {
            if (!devMode) return;
            setCoords(null);
        },
    });

    if (!devMode || !coords) return null;

    return (
        <div
            style={{
                position: "absolute",
                bottom: 10,
                left: 10,
                zIndex: 1000,
                background: "var(--ifm-background-surface-color)",
                padding: "4px 8px",
                borderRadius: 4,
                boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                fontSize: "0.75rem",
                fontFamily: "var(--ifm-font-family-base)",
                pointerEvents: "none",
            }}
        >
            Lat: {Math.round(coords.lat)}, Lng: {Math.round(coords.lng)}
        </div>
    );
}