import { useEffect, useRef } from "react";
import { useMapEvents, useMap } from "react-leaflet";
import { MapView } from "../LeafletTypes";
import L from "leaflet";

type Props = {
  setCamera?: (view: MapView, animate: boolean, persist: boolean) => void;
  animateCamera?: MapView | null;
  onAnimationComplete?: () => void;
  defaultView: MapView | null;
  setIsAtDefaultView: (v: boolean) => void;
};

export default function LeafletViewController({
  setCamera,
  animateCamera,
  onAnimationComplete,
  setIsAtDefaultView,
  defaultView
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

      if (defaultView) {
        const atDefault = isAtDefaultView(map, defaultView);
        setIsAtDefaultView(atDefault);
      }

      onAnimationComplete?.();
      map.off("moveend", handleEnd);
    };

    map.on("moveend", handleEnd);
  }, [animateCamera, map, onAnimationComplete]);

  useMapEvents({
    moveend: () => {
      if (isAnimatingRef.current) return;

      const current: MapView = {
        center: [map.getCenter().lat, map.getCenter().lng],
        zoom: map.getZoom(),
      };

      setCamera?.(current, false, true);

      if (!defaultView) return;

      const atDefault = isAtDefaultView(map, defaultView);

      setIsAtDefaultView(atDefault);
    },
  });

  return null;
}

const DEFAULT_PIXEL_THRESHOLD = 15;

function isAtDefaultView(map: any, defaultView: MapView) {
  const currentCenter = map.getCenter();

  const currentPoint = map.latLngToContainerPoint(currentCenter);

  const defaultPoint = map.latLngToContainerPoint(
    L.latLng(defaultView.center[0], defaultView.center[1])
  );

  const dx = currentPoint.x - defaultPoint.x;
  const dy = currentPoint.y - defaultPoint.y;

  const pixelDistance = Math.sqrt(dx * dx + dy * dy);

  const zoomDiff = Math.abs(map.getZoom() - defaultView.zoom);

  return pixelDistance < DEFAULT_PIXEL_THRESHOLD && zoomDiff < 0.01;
}