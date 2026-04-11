import { X } from "lucide-react";
import LeafletControl from "../LeafletControl";
import { MarkerTypes, MarkerType } from "../LeafletTypes";
import styles from "./styles.module.css";

export default function LeafletLayersPanel({
  open,
  setOpen,
  visibleMarkerTypes,
  setVisibleMarkerTypes,
  hidden,
}: {
  open: boolean| null;
  setOpen: (v: boolean) => void;
  visibleMarkerTypes: Record<MarkerType, boolean>;
  setVisibleMarkerTypes: React.Dispatch<
    React.SetStateAction<Record<MarkerType, boolean>>
  >;
  hidden: boolean;
}) {
  if (!open || hidden) return null;

  const toggle = (type: MarkerType) => {
    setVisibleMarkerTypes((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const showAll = () => {
    setVisibleMarkerTypes(
      Object.keys(MarkerTypes).reduce((acc, key) => {
        acc[key as MarkerType] = true;
        return acc;
      }, {} as Record<MarkerType, boolean>)
    );
  };

  const hideAll = () => {
    setVisibleMarkerTypes(
      Object.keys(MarkerTypes).reduce((acc, key) => {
        acc[key as MarkerType] = false;
        return acc;
      }, {} as Record<MarkerType, boolean>)
    );
  };

  return (
    <LeafletControl position="topright">
      <div
        className={styles.panel}
        onMouseDown={(e) => e.stopPropagation()} // extra safety
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Layers</h2>

          <button
            className={styles.closeButton}
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button
            className="button button--secondary button--sm"
            onClick={hideAll}
          >
            Hide All
          </button>
          <button
            className="button button--primary button--sm"
            onClick={showAll}
          >
            Show All
          </button>
        </div>

        {/* List */}
        <div className={styles.list}>
          {Object.entries(MarkerTypes).map(([key, value]) => {
            const type = key as MarkerType;
            const Icon = value.icon;
            const isEnabled = visibleMarkerTypes[type];

            return (
              <label
                key={type}
                className={`${styles.item} ${
                  !isEnabled ? styles.itemDisabled : ""
                }`}
              >
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={isEnabled}
                  onChange={() => toggle(type)}
                />

                <div
                  className={styles.icon}
                  style={{ color: value.color }}
                >
                  <Icon size={16} strokeWidth={2.2} />
                </div>

                <span className={styles.label}>{value.label}</span>
              </label>
            );
          })}
        </div>
      </div>
    </LeafletControl>
  );
}