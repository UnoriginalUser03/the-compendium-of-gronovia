import React, {
    useState,
    useEffect,
    useRef,
    forwardRef,
    useImperativeHandle,
} from "react";
import {
    useMapEvents,
    Polyline,
    CircleMarker,
    useMap,
    FeatureGroup,
} from "react-leaflet";
import L, { LeafletMouseEvent } from "leaflet";

type CompletedLine = {
    id: string;
    points: [number, number][];
    distance: number;
};

const LeafletMeasure = forwardRef(function LeafletMeasure(
    {
        scaleRatio,
        onHoverDistanceChange,
        onLineSelected,
        onSelectedDistanceChange,
        measureEnabled,
        onSelectedLineChange
    }: {
        scaleRatio: number;
        onHoverDistanceChange?: (miles: number | null) => void;
        onLineSelected?: (line: CompletedLine | null) => void;
        onSelectedDistanceChange?: (miles: number | null) => void;
        measureEnabled: boolean;
        onSelectedLineChange?: (id: string | null) => void;
        selectedId?: string | null;
        setSelectedId?: (id: string | null) => void;
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
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(
        null
    );

    // Refs (avoid stale closures)
    const completedRef = useRef(completed);
    const hoveredIdRef = useRef(hoveredId);

    useEffect(() => {
        completedRef.current = completed;
    }, [completed]);

    useEffect(() => {
        hoveredIdRef.current = hoveredId;
    }, [hoveredId]);

    // Reset when disabled
    useEffect(() => {
        if (!measureEnabled) clearAll();
    }, [measureEnabled]);

    useEffect(() => {
        if (!measureEnabled) {
            map.doubleClickZoom.enable();
            return;
        }

        if (currentPoints.length > 1) {
            map.doubleClickZoom.disable();
        } else {
            map.doubleClickZoom.enable();
        }

    }, [map, measureEnabled, currentPoints.length]);

    useEffect(() => {
        if (selectedId) {
            const line = completedRef.current.find(c => c.id === selectedId) || null;
            onSelectedDistanceChange?.(line?.distance ?? null);
        } else {
            onSelectedDistanceChange?.(null);
        }
    }, [selectedId, onSelectedDistanceChange]);

    useImperativeHandle(ref, () => ({
        clear: clearAll,
    }));

    function clearAll() {
        setCurrentPoints([]);
        setPreviewPoint(null);
        setCompleted([]);
        setHoveredId(null);
        setSelectedId(null);
        setTooltipPos(null);
        onHoverDistanceChange?.(null);
        onLineSelected?.(null);
    }

    // Ensure panes exist
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
        let total = 0;
        for (let i = 1; i < points.length; i++) {
            const [aLat, aLng] = points[i - 1];
            const [bLat, bLng] = points[i];
            const dx = bLat - aLat;
            const dy = bLng - aLng;
            total += Math.sqrt(dx * dx + dy * dy);
        }
        return total * scaleRatio;
    };

    const distToSegment = (p: any, a: any, b: any) => {
        const A = p.x - a.x;
        const B = p.y - a.y;
        const C = b.x - a.x;
        const D = b.y - a.y;

        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = lenSq !== 0 ? dot / lenSq : -1;

        if (param < 0) param = 0;
        else if (param > 1) param = 1;

        const xx = a.x + param * C;
        const yy = a.y + param * D;

        const dx = p.x - xx;
        const dy = p.y - yy;

        return Math.sqrt(dx * dx + dy * dy);
    };

    const handleLineClick = (id: string) => (e: LeafletMouseEvent) => {
        L.DomEvent.stopPropagation(e);
        setSelectedId(id);

        const line = completedRef.current.find((c) => c.id === id) || null;
        onLineSelected?.(line);
    };

    useMapEvents({
        click(e) {
            // Deselect if not drawing
            if (currentPoints.length === 0 && selectedId !== null) {
                setSelectedId(null);
                onLineSelected?.(null);
                return;
            }

            const p: [number, number] = [e.latlng.lat, e.latlng.lng];
            setCurrentPoints((prev) => [...prev, p]);
            setPreviewPoint(null);
        },

        dblclick() {
            if (currentPoints.length > 1) {
                const dist = calculateDistance(currentPoints);
                const id = crypto.randomUUID();

                setCompleted((prev) => [
                    ...prev,
                    {
                        id: id,
                        points: currentPoints,
                        distance: dist,
                    },
                ]);
                setSelectedId(id)
            }

            setCurrentPoints([]);
            setPreviewPoint(null);
        },

        mousemove(e) {
            const cursor = map.latLngToContainerPoint(e.latlng);
            const isDrawing = currentPoints.length > 0;

            if (isDrawing) {
                setPreviewPoint([e.latlng.lat, e.latlng.lng]);
                setTooltipPos({ x: cursor.x, y: cursor.y });
            }

            let found: string | null = null;

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

                    if (distToSegment(cursor, a, b) < 8) {
                        found = line.id;
                        break;
                    }
                }
                if (found) break;
            }

            if (found !== hoveredIdRef.current) {
                setHoveredId(found);

                if (found) {
                    const line = completedRef.current.find((c) => c.id === found)!;
                    onHoverDistanceChange?.(line.distance);
                } else {
                    onHoverDistanceChange?.(null);
                }
            }

            if (found || isDrawing) {
                setTooltipPos({ x: cursor.x, y: cursor.y });
            } else {
                setTooltipPos(null);
            }
        },

        contextmenu() {
            setCurrentPoints((prev) => prev.slice(0, -1));
            setPreviewPoint(null); // 👈 add this
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
            {completed.map((line) => {
                const isHovered = hoveredId === line.id;
                const isSelected = selectedId === line.id;
                const paneName = `measure-${line.id}`;

                return (
                    <FeatureGroup key={line.id} pane={paneName}>
                        <Polyline
                            key={`${line.id}-${isHovered}-${isSelected}`}
                            positions={line.points}
                            color={
                                isSelected
                                    ? primary
                                    : isHovered
                                        ? primary
                                        : secondary
                            }
                            weight={
                                isSelected
                                    ? 7
                                    : isHovered
                                        ? 6
                                        : 4
                            }
                            eventHandlers={{
                                click: handleLineClick(line.id),
                            }}
                        />

                        {line.points.map((p, idx) => (
                            <CircleMarker
                                key={`${line.id}-dot-${idx}-${isHovered}-${isSelected}`}
                                center={p}
                                radius={
                                    isSelected ? 6 : isHovered ? 5 : 4
                                }
                                color={
                                    isSelected
                                        ? primary
                                        : isHovered
                                            ? primary
                                            : secondary
                                }
                                fillColor={
                                    isSelected
                                        ? primary
                                        : isHovered
                                            ? primary
                                            : secondary
                                }
                                fillOpacity={
                                    isSelected ? 1 : isHovered ? 0.9 : 0.7
                                }
                                weight={2}
                                eventHandlers={{
                                    click: handleLineClick(line.id),
                                }}
                            />
                        ))}
                    </FeatureGroup>
                );
            })}

            {activeLine.length > 1 && (
                <Polyline
                    positions={activeLine}
                    color={previewPoint ? secondary : primary}
                    weight={3}
                />
            )}

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
                    }}
                >
                    <strong>
                        {hoveredId
                            ? completedRef.current
                                .find((c) => c.id === hoveredId)
                                ?.distance.toFixed(1)
                            : activeDistance?.toFixed(1)}
                    </strong>{" "}
                    miles
                </div>
            )}
        </>
    );
});

export default LeafletMeasure;