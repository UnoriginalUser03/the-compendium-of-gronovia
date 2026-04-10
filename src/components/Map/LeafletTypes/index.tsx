// MarkerTypes.ts
import {
    Anvil,
    Castle,
    Landmark,
    MapPin,
    ScrollText,
    Sword,
    Tent,
    WandSparkles
} from "lucide-react";

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
    }
} as const;


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

export type MarkerType = keyof typeof MarkerTypes;

export type MarkerData = {
    id: string;
    position: [number, number];
    title: string;
    link?: string;
    icon?: React.ReactNode;
    type?: MarkerType;
    isUser?: boolean;
};

export type LeafletMapProps = {
    image: string;
    bounds: [[number, number], [number, number]];
    markers?: MarkerData[];
    userMarkers?: MarkerData[];
    scaleRatio?: number;
    measureEnabled?: boolean;
    setMeasureEnabled?: (v: boolean) => void;
    handleDeleteMarker?: (id: string) => void;
    setUserMarkers: React.Dispatch<React.SetStateAction<MarkerData[]>>;
    displayDistance?: number | null;
    travelInfo?: { pace: string; days: number; hours: number }[];
    onHoverDistanceChange?: (miles: number | null) => void;
    onSelectedDistanceChange?: (miles: number | null) => void;
};

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