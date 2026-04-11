import { Marker, Popup } from "react-leaflet";
import L, { Marker as LeafletMarkerType } from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { useEffect, useMemo, useRef } from "react";
import Link from "@docusaurus/Link";
import { DialogState, MarkerData, MarkerTypes } from "../LeafletTypes";
import styles from "./styles.module.css";
import { Edit2, Lock, Unlock } from "lucide-react";

export default function LeafletMarker({
  marker,
  interactable,
  onRequestEdit,
  onRequestMove,
  onRequestMarkerMenu,
  isSelected,
  onSelect,
  onDeselect,
}: {
  marker: MarkerData;
  interactable?: boolean;
  onRequestEdit?: (marker: MarkerData) => void;
  onRequestMove?: (marker: MarkerData, pos: [number, number]) => void;
  onToggleLock?: (marker: MarkerData) => void;
  onRequestMarkerMenu?: (marker: MarkerData, x: number, y: number) => void;
  isSelected?: boolean;
  onSelect?: () => void;
  onDeselect?: () => void;
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
  const markerRef = useRef<LeafletMarkerType | null>(null);

  useEffect(() => {
    if (!markerRef.current) return;

    if (isSelected) {
      markerRef.current?.openPopup();
    } else {
      markerRef.current.closePopup();
    }
  }, [isSelected]);

  return (
    <Marker
      position={marker.position}
      ref={markerRef}
      icon={icon}
      interactive={interactable}
      draggable={marker.isUser && !marker.locked && interactable}
      eventHandlers={{
        popupopen: (e) => {
          L.DomEvent.stopPropagation(e);
          onSelect?.();
        },

        popupclose: () => {
          onDeselect?.();
        },

        ...(marker.isUser && {
          contextmenu: (e: any) => {
            L.DomEvent.stopPropagation(e);
            onRequestMarkerMenu?.(
              marker,
              e.originalEvent.clientX,
              e.originalEvent.clientY
            );
          },

          dblclick: (e: any) => {
            L.DomEvent.stopPropagation(e);
            onRequestEdit?.(marker);
          },

          dragend: (e: any) => {
            const latlng = e.target.getLatLng();
            onRequestMove?.(marker, [latlng.lat, latlng.lng]);
          },
        }),
      }}
    >
      <Popup minWidth={150} maxWidth={340}>
        <div style={{ position: "relative", padding: "6px 0" }}>

          {/* CENTERED TITLE */}
          <h3
            style={{
              margin: 0,
              textAlign: "center",
              position: "relative",
              display: "block",
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              {marker.isUser &&
                marker.locked && <Lock size={14} />}


              {marker.link ? (
                <Link to={marker.link}>{marker.title}</Link>
              ) : (
                marker.title
              )}
            </span>
          </h3>

          {/* NOTE */}
          {marker.note && (
            <p
              style={{
                marginTop: 8,
                whiteSpace: "pre-wrap",
                textAlign: "left",
                color: "var(--ifm-font-color-secondary)",
              }}
            >
              {marker.note}
            </p>
          )}
        </div>
      </Popup>
    </Marker >
  );
}