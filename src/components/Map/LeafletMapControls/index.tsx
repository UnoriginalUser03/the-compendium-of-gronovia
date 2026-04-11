import { useMap } from "react-leaflet";
import LeafletControl from "../LeafletControl";
import { Filter, Ruler, X, Trash2, Trash, Download, FolderOpen, Forward, Share2, Check } from "lucide-react";
import { Map } from "leaflet";
import { useState } from "react";

type Props = {
  layersOpen: boolean;
  setLayersOpen: (v: boolean) => void;
  measureEnabled: boolean;
  setMeasureEnabled: (v: boolean) => void;
  selectedLineId: string | null;
  onClearSelected: (id: string | null) => void;
  onSave?: () => void;
  onLoadRequest?: () => void;
  onShareRequest?: (map: Map | null) => void;
  linkCopied: boolean;
};

export default function LeafletMapControls({
  layersOpen,
  setLayersOpen,
  measureEnabled,
  setMeasureEnabled,
  selectedLineId,
  onClearSelected,
  onSave,
  onLoadRequest,
  onShareRequest,
  linkCopied,
}: Props) {
  const map = useMap();

  return (
    <LeafletControl position="topright">
      <div className="leaflet-bar">

        {/* Measure toggle */}
        <a
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setMeasureEnabled(!measureEnabled);
          }}
          title="Measure"
        >
          <span>{measureEnabled ? <X size={18} /> : <Ruler size={18} />}</span>
        </a>

        {/* Measure actions (only when enabled) */}
        {measureEnabled && (
          <a
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClearSelected(selectedLineId);
            }}
            title={selectedLineId ? "Delete selected line" : "Clear all"}
          >
            <span>{selectedLineId ? <Trash2 size={18} /> : <Trash size={18} />}</span>
          </a>
        )}


        {/* Layers */}
        {!measureEnabled && (
          <div>
            <a
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setLayersOpen(!layersOpen);
              }}
              title="Layers"
            >
              <span><Filter size={18} /></span>
            </a>
            {/* Save */}
            <a
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSave?.();
              }}
              title="Save Map"
            >
              <span>
                <Download size={18} />
              </span>
            </a>

            {/* Load */}
            <a
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onLoadRequest?.();
              }}
              title="Load Map"
            >
              <span>
                <FolderOpen size={18} />
              </span>
            </a>

            {/* Share */}
            <a
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                onShareRequest?.(map);
              }}
              title="Share Map"
            >
              <span>
                <span>
                  {linkCopied ? <Check size={18} color={"var(--ifm-color-success)"} /> : <Share2 size={18} />}
                </span>
              </span>
            </a>
          </div>
        )}


      </div>
    </LeafletControl>
  );
}