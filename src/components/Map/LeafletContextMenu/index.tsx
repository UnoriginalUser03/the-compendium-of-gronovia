import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
} from "react";

import { useMapEvents } from "react-leaflet";
import { MapPin, Edit2, Trash2, Unlock, Lock } from "lucide-react";
import type {
  LeafletContextMenuHandle,
  LockState,
  MarkerData,
} from "../LeafletTypes";

import styles from "./styles.module.css";

type ContextTarget =
  | {
    type: "map";
    x: number;
    y: number;
    latlng: [number, number];
  }
  | {
    type: "marker";
    x: number;
    y: number;
    marker: MarkerData;
  }
  | null;

type Props = {
  measureEnabled?: boolean;
  onCreateMarker?: (pos: [number, number]) => void;
  onEditMarker?: (marker: MarkerData) => void;
  onDeleteMarker?: (marker: MarkerData) => void;
  onToggleLock?: (marker: MarkerData) => void;
  onLockAll?: () => void;
  onUnlockAll?: () => void;
  lockState?: LockState;
};
const LeafletContextMenu = forwardRef<
  LeafletContextMenuHandle,
  Props
>(function LeafletContextMenu(
  { onCreateMarker, onEditMarker, onDeleteMarker, onToggleLock, measureEnabled, onLockAll, onUnlockAll, lockState },
  ref
) {
  if (measureEnabled) return;
  const [menu, setMenu] = useState<ContextTarget>(null);

  const closeTimer = useRef<number | null>(null);
  const isHovering = useRef(false);

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const scheduleClose = (delay = 200) => {
    clearCloseTimer();

    closeTimer.current = window.setTimeout(() => {
      if (!isHovering.current) {
        setMenu(null);
      }
    }, delay);
  };

  const close = () => {
    clearCloseTimer();
    setMenu(null);
  };

  useImperativeHandle(ref, () => ({
    openMapMenu: ({ x, y, latlng }) => {
      setMenu({ type: "map", x, y, latlng });
    },
    openMarkerMenu: ({ x, y, marker }) => {
      setMenu({ type: "marker", x, y, marker });
    },
    close,
  }));

  useMapEvents({
    contextmenu(e) {
      setMenu({
        type: "map",
        x: e.originalEvent.clientX,
        y: e.originalEvent.clientY,
        latlng: [e.latlng.lat, e.latlng.lng],
      });
    },
    dragstart() {
      scheduleClose(100);
    },
    zoomstart() {
      scheduleClose(100);
    },
    click() {
      scheduleClose(150);
    },
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (!menu) return null;

  const style: React.CSSProperties = {
    top: menu.y - 2,
    left: menu.x - 2,
  };

  const handleEnter = () => {
    isHovering.current = true;
    clearCloseTimer();
  };

  const handleLeave = () => {
    isHovering.current = false;
    scheduleClose();
  };

  // =====================================================
  // MAP MENU
  // =====================================================
  if (menu.type === "map") {
    return (
      <div
        className={styles.menu}
        style={style}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        <div className={styles.container}>

          <button
            className={styles.item}
            onClick={() => {
              onCreateMarker?.(menu.latlng);
              close();
            }}
          >
            <MapPin size={14} />
            Create marker here
          </button>

          <div className={styles.separator} />

          {/* CONDITIONAL BULK ACTIONS */}
          {(lockState === "all-unlocked" || lockState === "mixed") && (
            <button
              className={styles.item}
              onClick={() => {
                onLockAll?.();
                close();
              }}
            >
              <Lock size={14} />
              Lock all markers
            </button>
          )}

          {(lockState === "all-locked" || lockState === "mixed") && (
            <button
              className={styles.item}
              onClick={() => {
                onUnlockAll?.();
                close();
              }}
            >
              <Unlock size={14} />
              Unlock all markers
            </button>
          )}

        </div>
      </div>
    );
  }

  // =====================================================
  // MARKER MENU
  // =====================================================
  if (menu.type === "marker") {
    return (
      <div
        className={styles.menu}
        style={style}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        <div className={styles.container}>
          <button
            className={styles.item}
            onClick={() => {
              onEditMarker?.(menu.marker);
              close();
            }}
          >
            <Edit2 size={14} />
            Edit Marker
          </button>

          <button
            className={styles.item}
            onClick={() => {
              onToggleLock?.(menu.marker);
              close();
            }}
          >
            {menu.marker.locked ?
              <>
                <Lock size={14} />
                Unlock Marker
              </> : <>
                <Unlock size={14} />
                Lock Marker
              </>
            }
          </button>

          <button
            className={`${styles.item} ${styles.danger}`}
            onClick={() => {
              onDeleteMarker?.(menu.marker);
              close();
            }}
          >
            <Trash2 size={14} />
            Delete Marker
          </button>
        </div>
      </div>
    );
  }

  return null;
});

export default LeafletContextMenu;