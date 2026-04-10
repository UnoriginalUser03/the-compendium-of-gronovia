import { useEffect } from "react";
import { useMap } from "react-leaflet";

export default function LeafletInteractionController({ locked }: { locked: boolean }) {
    const map = useMap();

    useEffect(() => {
        if (locked) {
            map.dragging.disable();
            map.scrollWheelZoom.disable();
            map.doubleClickZoom.disable();
            map.boxZoom.disable();
            map.keyboard.disable();
            map.touchZoom.disable();
            map.tapHold?.disable();
        } else {
            map.dragging.enable();
            map.scrollWheelZoom.enable();
            map.doubleClickZoom.enable();
            map.boxZoom.enable();
            map.keyboard.enable();
            map.touchZoom.enable();
            map.tapHold?.enable();
        }
    }, [locked, map]);

    return null;
}