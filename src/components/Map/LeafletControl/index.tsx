import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { createRoot } from "react-dom/client";

type Props = {
  position?: "topleft" | "topright" | "bottomleft" | "bottomright";
  children: React.ReactNode;
};

export default function LeafletControl({ position = "topright", children }: Props) {
  const map = useMap();
  const controlRef = useRef<L.Control | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create container if not exists
    if (!containerRef.current) {
      containerRef.current = L.DomUtil.create("div");
      L.DomEvent.disableClickPropagation(containerRef.current); // prevent map interaction
      L.DomEvent.disableScrollPropagation(containerRef.current);
    }

    // Create control if not exists
    if (!controlRef.current) {
      const control = new L.Control({ position });
      control.onAdd = () => containerRef.current!;
      control.addTo(map);
      controlRef.current = control;
    }

    // Render React children
    const root = createRoot(containerRef.current);
    root.render(<>{children}</>);

    return () => {
      root.unmount();
      if (controlRef.current) {
        controlRef.current.remove();
        controlRef.current = null;
      }
    };
  }, [map, children, position]);

  return null;
}