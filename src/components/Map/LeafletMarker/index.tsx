import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { Anvil, Castle, Landmark, MapPin } from "lucide-react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { useMemo } from "react";
import Link from "@docusaurus/Link";

export const MarkerIcons = {
    town: <Anvil />,
    city: <Castle />,
    landmark: <Landmark />,
    poi: <MapPin />,
};

type MarkerType = keyof typeof MarkerIcons;

type MarkerData = {
    id: string;
    position: [number, number];
    title: string;
    link?: string;
    icon?: React.ReactNode;
    type?: MarkerType;
};

export default function LeafletMarker({ marker, interactable = true }: { marker: MarkerData, interactable?: boolean }) {
    // Priority: custom icon > type icon > fallback
    const iconNode =
        marker.icon ??
        (marker.type ? MarkerIcons[marker.type] : <MapPin />);

    const html = renderToStaticMarkup(
        <div className={interactable ? "" : "disabled"}>{iconNode}</div>
    );

    const icon = useMemo(() => {
        return L.divIcon({
            className: "",
            html,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
        });
    }, [html]);

    return (
        <Marker position={marker.position} icon={icon} interactive={interactable}>
            <Popup>
                {marker.link ? (
                    <Link to={marker.link}>{marker.title}</Link>
                ) : (
                    marker.title
                )}
            </Popup>


        </Marker>
    );
}