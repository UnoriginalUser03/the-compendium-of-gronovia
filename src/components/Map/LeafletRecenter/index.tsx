import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { CircleDot, Save, Check, Undo2 } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";

type Props = {
  onRecenter: () => void;
  onSaveDefault: () => void;
  onClearDefault: () => void;
  hasUserDefault: boolean;
  defaultViewSaved: boolean;
  isRecentered: boolean;
};

export default function LeafletRecenter({
  onRecenter,
  onSaveDefault,
  onClearDefault,
  hasUserDefault,
  defaultViewSaved,
  isRecentered,
}: Props) {
  const map = useMap();

  useEffect(() => {
    const zoomControl = map.zoomControl;
    if (!zoomControl) return;

    const container = zoomControl.getContainer();
    if (!container) return;

    let btnReset: HTMLAnchorElement | null = null;
    let btnRecenter: HTMLAnchorElement | null = null;
    let btnSave: HTMLAnchorElement | null = null;

    // buttons
    if (!isRecentered) {
      btnRecenter = L.DomUtil.create("a", "leaflet-btn recenter", container);
      btnSave = L.DomUtil.create("a", "leaflet-btn save", container);

      btnRecenter.innerHTML = renderToStaticMarkup(
        <span><CircleDot size={18} /></span>
      );
      btnSave.innerHTML = renderToStaticMarkup(
        <span>{defaultViewSaved ? <Check size={18} color={"var(--ifm-color-success)"} /> : <Save size={18} />}</span>
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
    }

    if (hasUserDefault && isRecentered) {
      btnReset = L.DomUtil.create("a", "leaflet-btn reset", container);

      btnReset.innerHTML = renderToStaticMarkup(
        <span><Undo2 size={18} /></span>
      );

      btnReset.title = "Reset to system default";

      L.DomEvent.disableClickPropagation(btnReset);

      L.DomEvent.on(btnReset, "click", (e) => {
        L.DomEvent.preventDefault(e);
        onClearDefault();
      });
    }


    return () => {
      btnRecenter?.remove();
      btnSave?.remove();
      btnReset?.remove();
    };
  }, [map, onRecenter, onSaveDefault, onClearDefault, hasUserDefault, defaultViewSaved, isRecentered]);

  return null;
}