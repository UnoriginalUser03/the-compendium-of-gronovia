import { useEffect, useRef } from "react";
import { useMapEvents, useMap } from "react-leaflet";
import { MapView } from "../LeafletTypes";

type Props = {
  setCamera?: (view: MapView, animate: boolean, persist: boolean) => void;
  animateCamera?: MapView | null;
  onAnimationComplete?: () => void;
};

export default function LeafletViewController({
  setCamera,
  animateCamera,
  onAnimationComplete,
}: Props) {
  const map = useMap();
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    if (!animateCamera) return;

    const { center, zoom } = animateCamera;

    isAnimatingRef.current = true;

    map.flyTo(center, zoom, {
      animate: true,
      duration: 1.3,
    });

    const handleEnd = () => {
      isAnimatingRef.current = false;
      onAnimationComplete?.();
      map.off("moveend", handleEnd);
    };

    map.on("moveend", handleEnd);
  }, [animateCamera, map, onAnimationComplete]);

  useMapEvents({
    moveend: () => {
      if (isAnimatingRef.current) return;

      const center = map.getCenter();
      const zoom = map.getZoom();

      setCamera?.({
        center: [center.lat, center.lng],
        zoom,
      }, false, true);
    },
  });

  return null;
}