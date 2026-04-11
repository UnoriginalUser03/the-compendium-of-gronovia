import { useEffect } from "react";
import { useMap } from "react-leaflet";

export default function LeafletInteractionController({ locked }: { locked: boolean }) {
    const map = useMap();

    useEffect(() => {
        if (!map) return;

        const handlePreClick = () => {
            map.closePopup();
        };

        if (locked) {
            map.dragging.disable();
            map.scrollWheelZoom.disable();
            map.doubleClickZoom.disable();
            map.boxZoom.disable();
            map.keyboard.disable();
            map.touchZoom.disable();

            map.off("preclick"); // safe cleanup
        } else {
            map.dragging.enable();
            map.scrollWheelZoom.enable();
            map.doubleClickZoom.enable();
            map.boxZoom.enable();
            map.keyboard.enable();
            map.touchZoom.enable();

            map.on("preclick", handlePreClick);
        }

        return () => {
            map.off("preclick", handlePreClick);
        };
    }, [locked, map]);

    return null;
}