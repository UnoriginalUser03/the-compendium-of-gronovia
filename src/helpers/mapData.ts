import LZString from "lz-string";
import {
  MapExportData,
  MapSaveShareState,
  MapShareState,
  MapView,
  MarkerData,
  MarkerType,
} from "../components/Map/LeafletTypes";

/* =========================================================
   SSR SAFETY
========================================================= */

const isBrowser = typeof window !== "undefined";

/* =========================================================
   STORAGE KEYS
========================================================= */

const sessionKey = (mapId: string) =>
  `map-camera-session-${mapId}`;

const defaultKey = (mapId: string) =>
  `map-camera-default-${mapId}`;

const selectedMarkerKey = (mapId: string) =>
  `map-selected-marker-${mapId}`;

/* =========================================================
   CAMERA STORAGE (SAFE)
========================================================= */

export function saveSessionCamera(view: MapView, mapId: string) {
  if (!isBrowser) return;
  localStorage.setItem(sessionKey(mapId), JSON.stringify(view));
}

export function loadSessionCamera(mapId: string): MapView | null {
  if (!isBrowser) return null;

  const raw = localStorage.getItem(sessionKey(mapId));
  return raw ? (JSON.parse(raw) as MapView) : null;
}

export function clearSessionCamera(mapId: string) {
  if (!isBrowser) return;
  localStorage.removeItem(sessionKey(mapId));
}

export function saveUserDefaultCamera(view: MapView, mapId: string) {
  if (!isBrowser) return;
  localStorage.setItem(defaultKey(mapId), JSON.stringify(view));
}

export function loadUserDefaultCamera(mapId: string): MapView | null {
  if (!isBrowser) return null;

  const raw = localStorage.getItem(defaultKey(mapId));
  return raw ? (JSON.parse(raw) as MapView) : null;
}

export function clearUserDefaultCamera(mapId: string) {
  if (!isBrowser) return;
  localStorage.removeItem(defaultKey(mapId));
}

/* =========================================================
   SELECTED MARKER STORAGE (SAFE)
========================================================= */

export function saveSelectedMarker(
  markerId: string | null,
  mapId: string
) {
  if (!isBrowser) return;

  if (!markerId) {
    localStorage.removeItem(selectedMarkerKey(mapId));
  } else {
    localStorage.setItem(selectedMarkerKey(mapId), markerId);
  }
}

export function loadSelectedMarker(mapId: string): string | null {
  if (!isBrowser) return null;

  return localStorage.getItem(selectedMarkerKey(mapId));
}

/* =========================================================
   SHARE STATE FACTORIES
========================================================= */

export function createMapShareState(
  visibleMarkerTypes: Record<MarkerType, boolean>,
  sessionCamera: MapView,
  selectedMarkerId: string | null
): MapShareState {
  return {
    visibleMarkerTypes,
    sessionCamera,
    selectedMarkerId,
  };
}

export function createMapSaveShareState(
  visibleMarkerTypes: Record<MarkerType, boolean>,
  userMarkers: MarkerData[],
  selectedMarkerId: string | null,
  sessionCamera?: MapView,
  userDefaultCamera?: MapView
): MapSaveShareState {
  return {
    visibleMarkerTypes,
    userMarkers,
    selectedMarkerId,
    sessionCamera,
    userDefaultCamera,
  };
}

/* =========================================================
   ENCODING HELPERS
========================================================= */

function encode<T>(data: T): string {
  return LZString.compressToEncodedURIComponent(
    JSON.stringify(data)
  );
}

function decode<T>(value: string): T | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(value);
    if (!json) return null;
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

/* =========================================================
   VIEW SHARE
========================================================= */

export function encodeViewState(state: MapShareState) {
  return encode(state);
}

export function decodeViewState(hash: string): MapShareState | null {
  return decode<MapShareState>(hash);
}

/* =========================================================
   FULL SHARE
========================================================= */

export function encodeMapSaveState(state: MapSaveShareState) {
  return encode(state);
}

export function decodeMapSaveState(
  hash: string
): MapSaveShareState | null {
  return decode<MapSaveShareState>(hash);
}

/* =========================================================
   FILE EXPORT FORMAT
========================================================= */

export function createMapExport(
  userMarkers: MarkerData[],
  visibleMarkerTypes: Record<MarkerType, boolean>,
  selectedMarkerId: string | null,
  sessionCamera?: MapView,
  userDefaultCamera?: MapView
): MapExportData {
  return {
    version: 2,
    userMarkers,
    visibleMarkerTypes,
    selectedMarkerId,
    sessionCamera,
    userDefaultCamera,
  };
}

export function encodeMapFile(data: MapExportData): string {
  return LZString.compressToBase64(JSON.stringify(data));
}

export function decodeMapFile(raw: string): MapExportData {
  const json = LZString.decompressFromBase64(raw);

  if (!json) {
    throw new Error("Invalid or corrupted map file");
  }

  const data = JSON.parse(json);

  if (!Array.isArray(data.userMarkers) || !data.visibleMarkerTypes) {
    throw new Error("Invalid map file structure");
  }

  return {
    version: data.version ?? 1,
    userMarkers: data.userMarkers,
    visibleMarkerTypes: data.visibleMarkerTypes,
    sessionCamera: data.sessionCamera,
    userDefaultCamera: data.userDefaultCamera,
    selectedMarkerId: data.selectedMarkerId,
  };
}

/* =========================================================
   DOWNLOAD
========================================================= */

export function getBaseName(path: string): string {
  const clean = path.split("?")[0];
  const file = clean.split("/").pop() || "";
  return file.replace(/\.[^/.]+$/, "");
}

function getDateStamp(): string {
  const now = new Date();

  const d = String(now.getDate()).padStart(2, "0");
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const y = now.getFullYear();

  return `${d}-${m}-${y}`;
}

export function downloadMapExport(
  data: MapExportData,
  filename: string
) {
  if (!isBrowser) return;

  const baseName = getBaseName(filename);
  const date = getDateStamp();

  const encoded = encodeMapFile(data);

  const blob = new Blob([encoded], {
    type: "application/octet-stream",
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${date}-${baseName}.mapdata`;

  a.click();
  URL.revokeObjectURL(url);
}

/* =========================================================
   MERGE LOGIC
========================================================= */

export function mergeMarkers(
  existing: MarkerData[],
  incoming: MarkerData[]
): MarkerData[] {
  const ids = new Set(existing.map((m) => m.id));

  return [
    ...existing,
    ...incoming.map((m) =>
      ids.has(m.id)
        ? { ...m, id: crypto.randomUUID() }
        : m
    ),
  ];
}

/* =========================================================
   FILE LOADER
========================================================= */

export function readMapFile(file: File): Promise<MapExportData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const raw = e.target?.result as string;
        const json = LZString.decompressFromBase64(raw);

        if (!json) throw new Error("Corrupted file");

        const data = JSON.parse(json);

        if (!Array.isArray(data.userMarkers)) {
          throw new Error("Invalid file structure");
        }

        resolve({
          version: data.version ?? 1,
          userMarkers: data.userMarkers,
          visibleMarkerTypes: data.visibleMarkerTypes,
          sessionCamera: data.sessionCamera,
          userDefaultCamera: data.userDefaultCamera,
          selectedMarkerId: data.selectedMarkerId,
        });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = reject;
    reader.readAsText(file);
  });
}