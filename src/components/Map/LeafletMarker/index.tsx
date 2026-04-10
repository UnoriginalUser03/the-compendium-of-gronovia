import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { useMemo } from "react";
import Link from "@docusaurus/Link";
import { MarkerData, MarkerTypes } from "../LeafletTypes";
import styles from "./styles.module.css";

export default function LeafletMarker({
  marker,
  interactable = true,
  onRequestDelete,
}: {
  marker: MarkerData;
  interactable?: boolean;
  onRequestDelete?: (id: string) => void;
}) {
  const type = marker.type ? MarkerTypes[marker.type] : null;

  const color = type?.color ?? "#6B7280";
  const Icon = type?.icon;

  const iconNode = marker.icon ? marker.icon : Icon ? <Icon /> : null;

  const html = renderToStaticMarkup(
    <div
      className={styles.pinWrapper}
      style={{
        opacity: interactable ? 1 : 0.5,
      }}
    >
      <div
        className={styles.pin}
        style={{
          backgroundColor: color,
          boxShadow: `0 2px 8px ${color}55`,
        }}
      >
        <div className={styles.pinIcon}>
          {iconNode}
        </div>
      </div>
    </div>
  );

  const icon = useMemo(
    () =>
      L.divIcon({
        className: "",
        html,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      }),
    [html]
  );

  return (
    <Marker
      position={marker.position}
      icon={icon}
      interactive={interactable}
      eventHandlers={
        marker.isUser
          ? {
            contextmenu: (e) => {
              L.DomEvent.stopPropagation(e);
              onRequestDelete?.(marker.id);
            },
          }
          : undefined
      }
    >
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