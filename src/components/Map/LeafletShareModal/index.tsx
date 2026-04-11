import React, { useEffect } from "react";
import LeafletModal from "../LeafletModal";
import { DialogState, MapView, MarkerData, MarkerType } from "../LeafletTypes";
import {
    createMapSaveShareState,
    createMapShareState,
    encodeMapSaveState,
    encodeViewState,
} from "../../../helpers/mapData";

import { Eye, Map, X } from "lucide-react";

type Props = {
    dialog: DialogState;
    setDialog: (d: DialogState) => void;

    visibleMarkerTypes: Record<MarkerType, boolean>;
    userMarkers: MarkerData[];

    sessionCamera: MapView;
    userDefaultCamera: MapView;

    selectedMarkerId: string | null;
    onLinkCopied: () => void;
};

export default function LeafletShareModal({
    dialog,
    setDialog,
    visibleMarkerTypes,
    selectedMarkerId,
    userMarkers,
    sessionCamera,
    userDefaultCamera,
    onLinkCopied
}: Props) {
    if (dialog.mode !== "share") return null;

    const close = () => setDialog({ mode: "closed" });

    const baseUrl =
        `${window.location.origin}${window.location.pathname}`;

    useEffect(() => 
    {
        console.log(selectedMarkerId)
    }, [selectedMarkerId])

    return (
        <LeafletModal
            title="Share Map"
            actionsLayout="column"
            actions={[
                /**
                 * VIEW SHARE (SAFE)
                 * - camera + filters only
                 * - no markers
                 */
                {
                    label: "Share View",
                    icon: <Eye size={16} />,
                    variant: "primary",
                    onClick: async () => {
                        const state = createMapShareState(
                            visibleMarkerTypes,
                            sessionCamera,
                            selectedMarkerId
                        );


                        const url = `${baseUrl}?view=${encodeViewState(state)}`;

                        await navigator.clipboard.writeText(url);
                        onLinkCopied();
                        close();
                    },
                },

                /**
                 * FULL SHARE (RISKY)
                 * - includes markers + cameras + filters
                 */
                {
                    label: "Share Full Map",
                    icon: <Map size={16} />,
                    variant: "primary",
                    onClick: async () => {
                        
                        const state = createMapSaveShareState(
                            visibleMarkerTypes,
                            userMarkers,
                            selectedMarkerId,
                            sessionCamera,
                            userDefaultCamera
                        );

                        

                        const url = `${baseUrl}?data=${encodeMapSaveState(state)}`;

                        await navigator.clipboard.writeText(url);
                        onLinkCopied();
                        close();
                    },
                },

                {
                    role: "cancel",
                    label: "Close",
                    icon: <X size={16} />,
                    variant: "secondary",
                    onClick: close,
                },
            ]}
            actionsMode="replace"
            onCancel={close}
        />
    );
}