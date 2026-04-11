import { Map } from "leaflet";
import React from "react";
import {
    Anvil,
    Castle,
    Landmark,
    MapPin,
    ScrollText,
    Sword,
    Tent,
    WandSparkles,
} from "lucide-react";

/* =========================================================
   MARKER STYLES
========================================================= */

export const MarkerColors = {
    blue: "#3B82F6",
    green: "#22C55E",
    orange: "#F97316",
    red: "#EF4444",
    purple: "#A855F7",
    teal: "#14B8A6",
    pink: "#FF69B4",
    gray: "#6B7280",
} as const;

/* =========================================================
   MARKER TYPES
========================================================= */

export const MarkerTypes = {
    poi: {
        label: "Point of Interest",
        icon: MapPin,
        color: MarkerColors.blue,
    },
    town: {
        label: "Town",
        icon: Anvil,
        color: MarkerColors.green,
    },
    city: {
        label: "City",
        icon: Castle,
        color: MarkerColors.teal,
    },
    landmark: {
        label: "Landmark",
        icon: Landmark,
        color: MarkerColors.orange,
    },
    camp: {
        label: "Camp",
        icon: Tent,
        color: MarkerColors.gray,
    },
    quest: {
        label: "Quest",
        icon: ScrollText,
        color: MarkerColors.purple,
    },
    danger: {
        label: "Danger",
        icon: Sword,
        color: MarkerColors.red,
    },
    magic: {
        label: "Magic",
        icon: WandSparkles,
        color: MarkerColors.pink,
    },
} as const;

/* =========================================================
   GROUPING (UI FILTERS)
========================================================= */

export const MarkerTypeGroups = {
    player: {
        poi: MarkerTypes.poi,
        camp: MarkerTypes.camp,
        quest: MarkerTypes.quest,
        danger: MarkerTypes.danger,
        magic: MarkerTypes.magic,
    },
    dm: MarkerTypes,
} as const;

/* =========================================================
   TYPES
========================================================= */

export type MarkerType = keyof typeof MarkerTypes;

export type MarkerData = {
    id: string;
    position: [number, number];
    title: string;
    link?: string;
    icon?: React.ReactNode;
    type?: MarkerType;
    isUser?: boolean;
    note?: string;
    locked?: boolean;
};

/* =========================================================
   CAMERA
========================================================= */

export type MapView = {
    center: [number, number];
    zoom: number;
};

/* =========================================================
   SHARE PAYLOADS (IMPORTANT CLEAN SPLIT)
========================================================= */

/**
 * VIEW SHARE (safe, read-only)
 * - ONLY affects camera + filters
 * - NEVER touches markers
 */
export type MapViewSharePayload = {
    visibleMarkerTypes: Record<MarkerType, boolean>;
    sessionCamera: MapView;
};

/**
 * FULL SHARE / FILE LOAD
 * - can modify markers
 * - triggers overwrite/merge modal
 */
export type MapFullSharePayload = {
    userMarkers: MarkerData[];
    visibleMarkerTypes: Record<MarkerType, boolean>;
    sessionCamera?: MapView;
    userDefaultCamera?: MapView;
};

/**
 * FILE EXPORT FORMAT
 */
export type MapExportData = {
    version: 2;
    userMarkers: MarkerData[];
    visibleMarkerTypes: Record<MarkerType, boolean>;
    sessionCamera?: MapView | null;
    userDefaultCamera?: MapView | null;
};

/* =========================================================
   DIALOG STATE (CLEANED + EXPLICIT BEHAVIOUR)
========================================================= */

export type DialogState =
    | { mode: "closed" }

    // marker creation
    | { mode: "create"; position: [number, number] }

    // edit/delete marker
    | { mode: "edit" | "delete"; marker: MarkerData }

    /**
     * FULL LOAD (FILE OR FULL SHARE URL)
     * ALWAYS shows overwrite/merge modal
     */
    | {
        mode: "load-warning";
        file?: File;
        payload: MapFullSharePayload;
    }

    // optional generic share modal
    | {
        mode: "share";
    };

/* =========================================================
   FORM FIELDS (UNCHANGED)
========================================================= */

export type ModalField =
    | {
        name: string;
        placeholder?: string;
        defaultValue?: string;
        type?: "text";
        required?: boolean;
    }
    | {
        name: string;
        type: "select";
        defaultValue?: string;
        required?: boolean;
        options: { label: string; value: string }[];
    };

/* =========================================================
   SHARE STATE HELPERS
========================================================= */

export type MapShareState = MapViewSharePayload;

export type MapSaveShareState = MapFullSharePayload;

/* =========================================================
   LEAFLET PROPS
========================================================= */

export type LeafletMapProps = {
    image: string;
    scaleRatio: number;
    bounds: [[number, number], [number, number]];
    defaultZoom?: number;


    markers?: MarkerData[];
    userMarkers?: MarkerData[];

    setUserMarkers: React.Dispatch<React.SetStateAction<MarkerData[]>>;

    handleDeleteMarker?: (marker: MarkerData) => void;

    visibleMarkerTypes: Record<MarkerType, boolean>;
    setVisibleMarkerTypes: React.Dispatch<
        React.SetStateAction<Record<MarkerType, boolean>>
    >;

    measureEnabled?: boolean;
    setMeasureEnabled?: (v: boolean) => void;

    displayDistance?: number | null;
    travelInfo?: { pace: string; days: number; hours: number }[];

    onHoverDistanceChange?: (miles: number | null) => void;
    onSelectedDistanceChange?: (miles: number | null) => void;

    onStartCreateMarker?: (position: [number, number]) => void;

    selectedLineId: string | null;
    setSelectedLineId: (id: string | null) => void;

    layersOpen: boolean;
    setLayersOpen: (open: boolean | null) => void;

    dialog: DialogState;
    setDialog: React.Dispatch<React.SetStateAction<DialogState>>;

    camera: MapView | null;
    setCamera: (view: MapView | null, animate: boolean, persist: boolean) => void;

    animateCamera: MapView | null;
    setAnimateCamera: (view: MapView | null) => void;

    userDefaultCamera: MapView | null;

    systemDefaultCamera: MapView;
    hasUserDefault: boolean;

    onSaveUserDefaultCamera: (map?: MapView) => void;
    onClearUserDefaultCamera: () => void;

    onSave: () => void;
    onLoad: () => void;

    onShare: (map: Map | null) => void;

    onRecenter: () => void;
};