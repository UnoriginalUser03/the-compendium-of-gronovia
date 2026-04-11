import React, { useMemo } from "react";
import LeafletModal from "../LeafletModal";
import { DialogState, MapView, MarkerData, MarkerType } from "../LeafletTypes";
import { mergeMarkers, readMapFile } from "../../../helpers/mapData";
import { ArrowDownToLine, Layers, X } from "lucide-react";

type Props = {
    dialog: DialogState;
    setDialog: (d: DialogState) => void;

    setUserMarkers: React.Dispatch<React.SetStateAction<MarkerData[]>>;
    setVisibleMarkerTypes: React.Dispatch<
        React.SetStateAction<Record<MarkerType, boolean>>
    >;

    setUserDefaultCamera: (v?: MapView) => void;
    setCamera: (v: MapView | null, animate: boolean, persist: boolean) => void;
    setAnimateCamera: (v: MapView | null) => void;
    setSelectedMarker: (markerId: string | null) => void;
};

export default function LeafletLoadModal({
    dialog,
    setDialog,
    setUserMarkers,
    setVisibleMarkerTypes,
    setUserDefaultCamera,
    setCamera,
    setAnimateCamera,
    setSelectedMarker,
}: Props) {
    if (dialog.mode !== "load-warning") return null;

    const close = () => setDialog({ mode: "closed" });

    const loadData = async () => {
        let markers: MarkerData[] = [];
        let visibility: Record<string, boolean> = {};
        let sessionCamera: MapView | undefined;
        let userDefaultCamera: MapView | undefined;
        let selectedMarkerId: string | undefined;

        if (dialog.file) {
            const data = await readMapFile(dialog.file);

            markers = data.userMarkers ?? [];
            visibility = data.visibleMarkerTypes ?? {};
            sessionCamera = data.sessionCamera ?? undefined;
            userDefaultCamera = data.userDefaultCamera ?? undefined;
            selectedMarkerId = data.selectedMarkerId ?? undefined
        }

        if (dialog.payload) {
            markers = dialog.payload.userMarkers ?? [];
            visibility = dialog.payload.visibleMarkerTypes ?? {};
            sessionCamera = dialog.payload.sessionCamera ?? undefined;
            userDefaultCamera = dialog.payload.userDefaultCamera ?? undefined;
            selectedMarkerId = dialog.payload.selectedMarkerId ?? undefined

        }

        return {
            markers,
            visibility,
            sessionCamera,
            userDefaultCamera,
            selectedMarkerId
        };
    };

    const actions = useMemo(
        () => [
            {
                label: "Overwrite",
                icon: <ArrowDownToLine size={16} />,
                variant: "danger" as const,
                onClick: async () => {
                    const {
                        markers,
                        visibility,
                        sessionCamera,
                        userDefaultCamera,
                        selectedMarkerId
                    } = await loadData();

                    setUserMarkers(markers);
                    setVisibleMarkerTypes(visibility);
                    setSelectedMarker(selectedMarkerId ?? null);

                    if (userDefaultCamera) {
                        setUserDefaultCamera(userDefaultCamera);
                    }

                    if (sessionCamera) {
                        setCamera(sessionCamera, true, false);
                        setAnimateCamera(sessionCamera);
                    }

                    close();
                },
            },

            {
                label: "Merge",
                icon: <Layers size={16} />,
                variant: "primary" as const,
                onClick: async () => {
                    const { markers } = await loadData();

                    setUserMarkers((prev) =>
                        mergeMarkers(prev, markers)
                    );

                    close();
                },
            },

            {
                role: "cancel" as const,
                label: "Cancel",
                icon: <X size={16} />,
                variant: "secondary" as const,
                onClick: close,
            },
        ],
        [dialog.file, dialog.payload]
    );

    return (
        <LeafletModal
            title="Load Map Data"
            actionsLayout="column"
            actionsMode="replace"
            actions={actions}
            onCancel={close}
        />
    );
}