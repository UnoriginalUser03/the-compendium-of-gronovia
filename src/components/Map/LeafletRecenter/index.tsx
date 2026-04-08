import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { CircleDot } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";

type LeafletRecenterProps = {
  center: [number, number];
  zoom?: number;
};

export default function LeafletRecenter({ center, zoom = -3 }: LeafletRecenterProps) {
  const map = useMap();

  useEffect(() => {
    // Wait until the zoom control exists
    const zoomControl = map.zoomControl;
    if (!zoomControl) return;

    const container = zoomControl.getContainer();
    if (!container) return;

    // Create button
    const btn = L.DomUtil.create("a", "leaflet-control-zoom-reset", container);
    btn.innerHTML = renderToStaticMarkup(<span><CircleDot/></span>); // Replace with icon if you want
    btn.title = "Recenter map";
    // Prevent map drag when clicking
    L.DomEvent.disableClickPropagation(btn);
    L.DomEvent.on(btn, "click", (e) => {
      L.DomEvent.preventDefault(e);
      map.setView(center, zoom, { animate: true });
    });

    // Cleanup on unmount
    return () => {
      if (btn && btn.parentNode) {
        btn.parentNode.removeChild(btn);
      }
    };
  }, [map, center, zoom]);

  return null;
}
