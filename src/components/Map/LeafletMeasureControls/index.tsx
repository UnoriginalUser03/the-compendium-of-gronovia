import { Ruler, Trash, X } from "lucide-react";
import LeafletControl from "../LeafletControl";

type Props = {
    measureEnabled: boolean;
    setMeasureEnabled: (v: boolean) => void;
    onClear: () => void;
};

export default function LeafletMeasureControls({
    measureEnabled,
    setMeasureEnabled,
    onClear,
}: Props) {
    return (
        <LeafletControl position="topright">
            <div className="leaflet-bar">
                <a
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation(); // 🔥 THIS is the key
                        setMeasureEnabled(!measureEnabled);
                    }}
                    title="Measure"
                >
                    <span>
                        {measureEnabled ? <X /> : <Ruler />}
                    </span>

                </a>

                {measureEnabled && (
                    <a
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation(); // 🔥 same here
                            onClear();
                        }}
                        title="Clear"
                    >
                        <span>
                            <Trash />
                        </span>
                    </a>
                )}
            </div>
        </LeafletControl>
    );
}