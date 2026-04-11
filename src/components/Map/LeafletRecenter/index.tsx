import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { CircleDot, Save, RotateCcw } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";

type Props = {
  onRecenter: () => void;
  onSaveDefault: () => void;
  onClearDefault: () => void;
  hasUserDefault: boolean;
};

export default function LeafletRecenter({
  onRecenter,
  onSaveDefault,
  onClearDefault,
  hasUserDefault,
}: Props) {
  const map = useMap();

  useEffect(() => {
    const zoomControl = map.zoomControl;
    if (!zoomControl) return;

    const container = zoomControl.getContainer();
    if (!container) return;

    // buttons
    const btnRecenter = L.DomUtil.create("a", "leaflet-btn recenter", container);
    const btnSave = L.DomUtil.create("a", "leaflet-btn save", container);

    let btnReset: HTMLAnchorElement | null = null;

    btnRecenter.innerHTML = renderToStaticMarkup(
      <span><CircleDot size={16} /></span>
    );
    btnSave.innerHTML = renderToStaticMarkup(
      <span><Save size={16} /></span>
    );

    btnRecenter.title = "Recenter";
    btnSave.title = "Save default view";

    L.DomEvent.disableClickPropagation(btnRecenter);
    L.DomEvent.disableClickPropagation(btnSave);

    L.DomEvent.on(btnRecenter, "click", (e) => {
      L.DomEvent.preventDefault(e);
      onRecenter();
    });

    L.DomEvent.on(btnSave, "click", (e) => {
      L.DomEvent.preventDefault(e);
      onSaveDefault();
    });

    if (hasUserDefault) {
      btnReset = L.DomUtil.create("a", "leaflet-btn reset", container);

      btnReset.innerHTML = renderToStaticMarkup(
        <span><RotateCcw size={16} /></span>
      );

      btnReset.title = "Reset to system default";

      L.DomEvent.disableClickPropagation(btnReset);

      L.DomEvent.on(btnReset, "click", (e) => {
        L.DomEvent.preventDefault(e);
        onClearDefault();
      });
    }

    return () => {
      btnRecenter.remove();
      btnSave.remove();
      btnReset?.remove();
    };
  }, [map, onRecenter, onSaveDefault, onClearDefault, hasUserDefault]);

  return null;
}