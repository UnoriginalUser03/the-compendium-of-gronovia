import React, { useEffect, useState } from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import { travelTimeEstimate } from "../../helpers/TravelCalculator";

export default function Map(props: any) {
    const [measureEnabled, setMeasureEnabled] = useState(false);
    const [activeDistance, setActiveDistance] = useState<number | null>(null);
    const [hoverDistance, setHoverDistance] = useState<number | null>(null);

    const displayDistance =
        hoverDistance !== null
            ? hoverDistance
            : activeDistance !== null
                ? activeDistance
                : null;

    const travelInfo = displayDistance ? travelTimeEstimate(displayDistance) : [];

    useEffect(() => {
        if (!measureEnabled) {
            setActiveDistance(null);
            setHoverDistance(null);
        }
    }, [measureEnabled]);

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
                            onDistanceMeasured={setActiveDistance}
                            onHoverDistanceChange={setHoverDistance}
                        />
                    </div>
                );
            }}
        </BrowserOnly>
    );
}