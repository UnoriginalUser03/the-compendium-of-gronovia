import LeafletControl from "../LeafletControl";

type Props = {
    displayDistance: number | null;
    travelInfo: { pace: string; days: number; hours: number }[];
};

export default function LeafletDistancePanel({
    displayDistance,
    travelInfo,
}: Props) {
    if (displayDistance === null) return null;

    return (
        <LeafletControl position="bottomright">
            <div className="leaflet-distance-panel">
                <strong>Distance:</strong> {displayDistance?.toFixed(2)} miles
                {travelInfo.map((t) => (
                    <div key={t.pace}>
                        {t.pace}: {t.days}d {t.hours}h
                    </div>
                ))}
            </div>
        </LeafletControl>
    );
}