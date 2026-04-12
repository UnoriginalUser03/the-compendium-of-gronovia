import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
  useCallback,
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
  {
    onCreateMarker,
    onEditMarker,
    onDeleteMarker,
    onToggleLock,
    onLockAll,
    onUnlockAll,
    lockState,
    measureEnabled,
  },
  ref
) {
  // ✅ IMPORTANT: do not render anything when measure mode is active
  if (measureEnabled) return null;

  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menu, setMenu] = useState<ContextTarget>(null);

  const closeTimer = useRef<number | null>(null);
  const isHovering = useRef(false);

  // =====================================================
  // CLOSE HANDLING
  // =====================================================

  const clearCloseTimer = useCallback(() => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const close = useCallback(() => {
    clearCloseTimer();
    setMenu(null);
  }, [clearCloseTimer]);

  const scheduleClose = useCallback(
    (delay = 200) => {
      clearCloseTimer();

      closeTimer.current = window.setTimeout(() => {
        if (!isHovering.current) {
          setMenu(null);
        }
      }, delay);
    },
    [clearCloseTimer]
  );

  // =====================================================
  // IMPERATIVE API
  // =====================================================

  useImperativeHandle(ref, () => ({
    openMapMenu: ({ x, y, latlng }) => {
      setMenu({ type: "map", x, y, latlng });
    },
    openMarkerMenu: ({ x, y, marker }) => {
      setMenu({ type: "marker", x, y, marker });
    },
    close,
  }));

  // =====================================================
  // LEAFLET EVENTS
  // =====================================================

  useMapEvents({
    contextmenu(e) {
      setMenu({
        type: "map",
        x: e.originalEvent.clientX,
        y: e.originalEvent.clientY,
        latlng: [e.latlng.lat, e.latlng.lng],
      });
    },

    movestart() {
      scheduleClose(100);
    },

    zoomstart() {
      scheduleClose(100);
    },

    preclick() {
      scheduleClose(100);
    },
  });

  // =====================================================
  // KEYBOARD ESC CLOSE
  // =====================================================

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [close]);

  // =====================================================
  // OUTSIDE CLICK (MOBILE + DESKTOP FIX)
  // =====================================================

  useEffect(() => {
    if (!menu) return;

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node;

      if (menuRef.current && !menuRef.current.contains(target)) {
        close();
      }
    };

    // capture phase = more reliable with Leaflet/map layers
    document.addEventListener("pointerdown", handlePointerDown, true);

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown,
        true
      );
    };
  }, [menu, close]);

  // =====================================================
  // EARLY EXIT
  // =====================================================

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
        ref={menuRef}
        className={styles.menu}
        style={style}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className={styles.container}>
          <button
            className={styles.item}
            onClick={() => {
              onCreateMarker?.(menu.latlng);
              close();
            }}
          >
            <MapPin size={16} />
            Create marker here
          </button>

          <div className={styles.separator} />

          {(lockState === "all-unlocked" ||
            lockState === "mixed") && (
            <button
              className={styles.item}
              onClick={() => {
                onLockAll?.();
                close();
              }}
            >
              <Lock size={16} />
              Lock all markers
            </button>
          )}

          {(lockState === "all-locked" ||
            lockState === "mixed") && (
            <button
              className={styles.item}
              onClick={() => {
                onUnlockAll?.();
                close();
              }}
            >
              <Unlock size={16} />
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
        ref={menuRef}
        className={styles.menu}
        style={style}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className={styles.container}>
          <button
            className={styles.item}
            onClick={() => {
              onEditMarker?.(menu.marker);
              close();
            }}
          >
            <Edit2 size={16} />
            Edit Marker
          </button>

          <button
            className={styles.item}
            onClick={() => {
              onToggleLock?.(menu.marker);
              close();
            }}
          >
            {menu.marker.locked ? (
              <>
                <Lock size={16} />
                Unlock Marker
              </>
            ) : (
              <>
                <Unlock size={16} />
                Lock Marker
              </>
            )}
          </button>

          <button
            className={`${styles.item} ${styles.danger}`}
            onClick={() => {
              onDeleteMarker?.(menu.marker);
              close();
            }}
          >
            <Trash2 size={16} />
            Delete Marker
          </button>
        </div>
      </div>
    );
  }

  return null;
});

export default LeafletContextMenu;