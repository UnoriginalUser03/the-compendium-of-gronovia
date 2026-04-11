import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { createRoot, Root } from "react-dom/client";

type Props = {
  position?: "topleft" | "topright" | "bottomleft" | "bottomright";
  children: React.ReactNode;
};

export default function LeafletControl({
  position = "topright",
  children,
}: Props) {
  const map = useMap();

  const controlRef = useRef<L.Control | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<Root | null>(null); // ✅ persist root

  // ✅ Create control + root ONCE
  useEffect(() => {
    if (!containerRef.current) {
      containerRef.current = L.DomUtil.create("div");
      L.DomEvent.disableClickPropagation(containerRef.current);
      L.DomEvent.disableScrollPropagation(containerRef.current);
    }

    if (!controlRef.current) {
      const control = new L.Control({ position });
      control.onAdd = () => containerRef.current!;
      control.addTo(map);
      controlRef.current = control;
    }

    // ✅ Create root once
    if (!rootRef.current) {
      rootRef.current = createRoot(containerRef.current);
    }

    return () => {
      rootRef.current?.unmount();
      rootRef.current = null;

      if (controlRef.current) {
        controlRef.current.remove();
        controlRef.current = null;
      }
    };
  }, [map, position]);

  // ✅ Render updates separately
  useEffect(() => {
    rootRef.current?.render(<>{children}</>);
  }, [children]);

  return null;
}