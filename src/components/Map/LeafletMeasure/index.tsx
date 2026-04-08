import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import {
    useMapEvents,
    Polyline,
    CircleMarker,
    useMap,
    FeatureGroup,
} from "react-leaflet";

type CompletedLine = {
    id: string;
    points: [number, number][];
    distance: number;
};

const LeafletMeasure = forwardRef(function LeafletMeasure(
    { scaleRatio, onDistanceMeasured, onHoverDistanceChange, measureEnabled }: {
        scaleRatio: number;
        onDistanceMeasured?: (miles: number) => void;
        onHoverDistanceChange?: (miles: number | null) => void;
        measureEnabled: boolean;
    },
    ref: React.Ref<{ clear: () => void }>
) {
    const map = useMap();

    const [currentPoints, setCurrentPoints] = useState<[number, number][]>([]);
    const [previewPoint, setPreviewPoint] = useState<[number, number] | null>(
        null
    );
    const [completed, setCompleted] = useState<CompletedLine[]>([]);
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(
        null
    );

    // Refs to avoid stale closures
    const completedRef = useRef(completed);
    const hoveredIdRef = useRef(hoveredId);

    useEffect(() => { completedRef.current = completed; }, [completed]);
    useEffect(() => { hoveredIdRef.current = hoveredId; }, [hoveredId]);

    // Reset on measure mode off
    useEffect(() => {
        if (!measureEnabled) clearAll();
    }, [measureEnabled]);

    // Expose clear method
    useImperativeHandle(ref, () => ({
        clear: clearAll
    }));

    function clearAll() {
        setCurrentPoints([]);
        setPreviewPoint(null);
        setCompleted([]);
        setHoveredId(null);
        setTooltipPos(null);
        onHoverDistanceChange?.(null);
    }

    // Ensure each completed line has its own pane
    useEffect(() => {
        completed.forEach((line) => {
            const paneName = `measure-${line.id}`;
            if (!map.getPane(paneName)) {
                map.createPane(paneName);
                const pane = map.getPane(paneName);
                if (pane) {
                    pane.style.zIndex = "450";
                    pane.style.pointerEvents = "auto";
                }
            }
        });
    }, [completed, map]);

    const calculateDistance = (points: [number, number][]) => {
        let totalUnits = 0;

        for (let i = 1; i < points.length; i++) {
            const [aLat, aLng] = points[i - 1];
            const [bLat, bLng] = points[i];
            const dx = bLat - aLat;
            const dy = bLng - aLng;
            totalUnits += Math.sqrt(dx * dx + dy * dy);
        }

        return totalUnits * scaleRatio;
    };

    // Distance from point to segment in pixel space
    const distToSegment = (p: any, a: any, b: any) => {
        const x = p.x,
            y = p.y;
        const x1 = a.x,
            y1 = a.y;
        const x2 = b.x,
            y2 = b.y;

        const A = x - x1;
        const B = y - y1;
        const C = x2 - x1;
        const D = y2 - y1;

        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = lenSq !== 0 ? dot / lenSq : -1;

        if (param < 0) param = 0;
        else if (param > 1) param = 1;

        const xx = x1 + param * C;
        const yy = y1 + param * D;

        const dx = x - xx;
        const dy = y - yy;

        return Math.sqrt(dx * dx + dy * dy);
    };

    useMapEvents({
        click(e) {
            const p: [number, number] = [e.latlng.lat, e.latlng.lng];
            setCurrentPoints((prev) => [...prev, p]);
            setPreviewPoint(null);
        },

        dblclick() {
            if (currentPoints.length > 1) {
                const distMiles = calculateDistance(currentPoints);
                onDistanceMeasured?.(distMiles);

                setCompleted((prev) => [
                    ...prev,
                    {
                        id: crypto.randomUUID(),
                        points: currentPoints,
                        distance: distMiles,
                    },
                ]);
            }

            setCurrentPoints([]);
            setPreviewPoint(null);
        },

        mousemove(e) {
            const cursor = map.latLngToContainerPoint(e.latlng);

            const isDrawing = currentPoints.length > 0;

            // Active preview
            if (isDrawing) {
                setPreviewPoint([e.latlng.lat, e.latlng.lng]);
                setTooltipPos({ x: cursor.x, y: cursor.y });
            }

            let foundHover: string | null = null;

            for (const line of completedRef.current) {
                for (let i = 1; i < line.points.length; i++) {
                    const a = map.latLngToContainerPoint({
                        lat: line.points[i - 1][0],
                        lng: line.points[i - 1][1],
                    });
                    const b = map.latLngToContainerPoint({
                        lat: line.points[i][0],
                        lng: line.points[i][1],
                    });

                    const dist = distToSegment(cursor, a, b);
                    if (dist < 8) {
                        foundHover = line.id;
                        break;
                    }
                }
                if (foundHover) break;
            }

            // Update hovered line state
            if (foundHover !== hoveredIdRef.current) {
                setHoveredId(foundHover);

                if (foundHover) {
                    const line = completedRef.current.find(
                        (c) => c.id === foundHover
                    )!;
                    onHoverDistanceChange?.(line.distance);
                } else {
                    onHoverDistanceChange?.(null);
                }
            }

            // Update tooltip position only if hovering or drawing
            if (foundHover || isDrawing) {
                setTooltipPos({ x: cursor.x, y: cursor.y });
            } else {
                setTooltipPos(null);
            }
        },

        contextmenu() {
            setCurrentPoints((prev) => prev.slice(0, -1));
        },
    });

    const activeLine =
        previewPoint && currentPoints.length > 0
            ? [...currentPoints, previewPoint]
            : currentPoints;

    const activeDistance =
        activeLine.length > 1 ? calculateDistance(activeLine) : null;

    const primary = "var(--ifm-color-primary)";
    const secondary = "var(--ifm-font-color-base)";

    return (
        <>
            {/* Completed measurements */}
            {completed.map((line) => {
                const isHovered = hoveredId === line.id;
                const paneName = `measure-${line.id}`;

                return (
                    <FeatureGroup key={line.id} pane={paneName}>
                        <Polyline
                            key={`${line.id}-${isHovered}`} // 🔥 FORCE re-render
                            positions={line.points}
                            color={isHovered ? primary : secondary}
                            weight={isHovered ? 6 : 4}
                        />

                        {line.points.map((p, idx) => (
                            <CircleMarker
                                key={`${line.id}-dot-${idx}-${isHovered}`}
                                center={p}
                                radius={isHovered ? 5 : 4}
                                color={isHovered ? primary : secondary}
                                fillColor={isHovered ? primary : secondary}
                                fillOpacity={isHovered ? 0.9 : 0.7}
                                weight={2}
                            />
                        ))}
                    </FeatureGroup>
                );
            })}

            {/* Active measurement */}
            {activeLine.length > 1 && (
                <Polyline
                    positions={activeLine}
                    color={previewPoint ? secondary : primary}
                    weight={3}
                />
            )}

            {/* Active dots */}
            {currentPoints.map((p, i) => (
                <CircleMarker
                    key={i}
                    center={p}
                    radius={4}
                    color={secondary}
                    fillOpacity={1}
                    weight={2}
                />
            ))}

            {/* Preview dot */}
            {previewPoint && (
                <CircleMarker
                    center={previewPoint}
                    radius={4}
                    color={primary}
                    fillColor={primary}
                    fillOpacity={1}
                    weight={1}
                />
            )}

            {/* Tooltip */}
            {tooltipPos && (hoveredId || currentPoints.length > 0) && (
                <div
                    style={{
                        position: "absolute",
                        left: tooltipPos.x + 12,
                        top: tooltipPos.y + 12,
                        background: "var(--ifm-background-surface-color)",
                        padding: "6px 10px",
                        borderRadius: 6,
                        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                        pointerEvents: "none",
                        zIndex: 2000,
                        fontSize: "0.85rem",
                        fontFamily: "var(--ifm-font-family-base)",
                    }}
                >
                    <strong>
                        {hoveredId
                            ? completed.find((c) => c.id === hoveredId)?.distance.toFixed(2)
                            : activeDistance?.toFixed(2)}
                    </strong>{" "}
                    miles
                </div>
            )}
        </>
    );
});

export default LeafletMeasure;