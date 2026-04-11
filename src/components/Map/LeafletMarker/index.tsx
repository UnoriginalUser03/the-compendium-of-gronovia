import { Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { useMemo } from "react";
import Link from "@docusaurus/Link";
import { MarkerData, MarkerTypes } from "../LeafletTypes";
import styles from "./styles.module.css";
import { Edit2, Lock, Unlock } from "lucide-react";

const iconButtonStyle = {
  background: "none",
  border: "none",
  padding: 0,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  color: "var(--ifm-color-primary)",
  lineHeight: 0,
}

export default function LeafletMarker({
  marker,
  interactable = true,
  onRequestDelete,
  onRequestEdit,
  onRequestMove,
  onToggleLock,
}: {
  marker: MarkerData;
  interactable?: boolean;
  onRequestDelete?: (marker: MarkerData) => void;
  onRequestEdit?: (marker: MarkerData) => void;
  onRequestMove?: (marker: MarkerData, pos: [number, number]) => void;
  onToggleLock?: (marker: MarkerData) => void;

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

  const map = useMap();

  return (
    <Marker
      position={marker.position}
      icon={icon}
      interactive={interactable}
      draggable={marker.isUser && !marker.locked}
      eventHandlers={
        marker.isUser
          ? {
            contextmenu: (e) => {
              L.DomEvent.stopPropagation(e);
              onRequestDelete?.(marker);
            },
            dblclick: (e) => {
              L.DomEvent.stopPropagation(e);
              onRequestEdit?.(marker);
            },
            dragend: (e) => {
              const latlng = e.target.getLatLng();

              onRequestMove?.(marker, [
                latlng.lat,
                latlng.lng,
              ]);
            },
          }
          : undefined
      }
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
              {marker.isUser && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleLock?.(marker);
                  }}
                  title={marker.locked ? "Unlock marker" : "Lock marker"}
                  style={iconButtonStyle}
                >
                  {marker.locked ? <Lock size={14} /> : <Unlock size={14} />}
                </button>
              )}

              {marker.link ? (
                <Link to={marker.link}>{marker.title}</Link>
              ) : (
                marker.title
              )}

              {marker.isUser && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRequestEdit?.(marker);
                  }}
                  title="Edit marker"
                  style={iconButtonStyle}
                >
                  <Edit2 size={16} />
                </button>
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