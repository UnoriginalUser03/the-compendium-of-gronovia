import React, { useEffect, useMemo, useRef, useState } from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import { travelTimeEstimate } from "../../helpers/travelCalculator";

import {
  DialogState,
  LeafletContextMenuHandle,
  LeafletMapProps,
  MapView,
  MarkerData,
  MarkerType,
  MarkerTypes,
} from "./LeafletTypes";

import {
  clearUserDefaultCamera,
  decodeMapSaveState,
  decodeViewState,
  downloadMapExport,
  getBaseName,
  loadSessionCamera,
  loadUserDefaultCamera,
  saveUserDefaultCamera,
  readMapFile,
  createMapExport,
  saveSessionCamera,
  loadSelectedMarker,
  saveSelectedMarker,
} from "../../helpers/mapData";

import { useLocation, useHistory } from "@docusaurus/router";

export default function Map(props: LeafletMapProps) {
  const location = useLocation();
  const history = useHistory();

  const mapId = useMemo(() => getBaseName(props.image), [props.image]);

  // =========================================================
  // SYSTEM DEFAULT CAMERA
  // =========================================================
  const systemDefaultCamera: MapView = useMemo(
    () => ({
      center: [
        (props.bounds[0][0] + props.bounds[1][0]) / 2,
        (props.bounds[0][1] + props.bounds[1][1]) / 2,
      ],
      zoom: props.defaultZoom ?? -3,
    }),
    [props.bounds, props.defaultZoom]
  );

  // =========================================================
  // USER DEFAULT CAMERA (SINGLE SOURCE)
  // =========================================================
  const [userDefaultCamera, setUserDefaultCameraState] =
    useState<MapView | null>(() => loadUserDefaultCamera(mapId));

  // =========================================================
  // CAMERA STATE (ONLY SOURCE OF TRUTH)
  // =========================================================
  const [camera, setCamera] = useState<MapView>(() => {
    const session = loadSessionCamera(mapId);
    const userDefault = loadUserDefaultCamera(mapId);

    return session ?? userDefault ?? systemDefaultCamera;
  });

  const [animateCamera, setAnimateCamera] = useState<MapView | null>(null);

  // Leaflet internal sync reference (NOT a second state source)
  const cameraRef = useRef(camera);

  const updateCamera = (view: MapView, animate = false, persist = false) => {
    cameraRef.current = view;
    setCamera(view);

    if (persist) {
      persistCamera(view);
    }

    if (animate) {
      setAnimateCamera(view);
    }
  };

  // keep ref in sync with state
  useEffect(() => {
    cameraRef.current = camera;
  }, [camera]);

  // =========================================================
  // MAP STATE
  // =========================================================
  const [measureEnabled, setMeasureEnabled] = useState(false);
  const [userMarkers, setUserMarkers] = useState<MarkerData[]>([]);
  const [hoverDistance, setHoverDistance] = useState<number | null>(null);
  const [selectedDistance, setSelectedDistance] = useState<number | null>(null);
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [defaultViewSaved, setDefaultViewSaved] = useState(false);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(() => {
    return loadSelectedMarker(mapId);
  });
  const [layersOpen, setLayersOpen] = useState(false);

  const [dialog, setDialog] = useState<DialogState>({ mode: "closed" });

  const [visibleMarkerTypes, setVisibleMarkerTypes] = useState<
    Record<MarkerType, boolean>
  >(() =>
    Object.keys(MarkerTypes).reduce((acc, key) => {
      acc[key as MarkerType] = true;
      return acc;
    }, {} as Record<MarkerType, boolean>)
  );

  const displayDistance = hoverDistance ?? selectedDistance ?? null;
  const travelInfo = displayDistance
    ? travelTimeEstimate(displayDistance)
    : [];

  const markers = props.markers ?? [];

  const allMarkerIds = useMemo(() => {
    const ids = new Set<string>();

    for (const m of markers) ids.add(m.id);
    for (const m of userMarkers) ids.add(m.id);

    return ids;
  }, [markers, userMarkers]);

  useEffect(() => {
    if (!selectedMarkerId) return;

    if (!allMarkerIds.has(selectedMarkerId)) {
      setSelectedMarkerId(null);
    }
  }, [allMarkerIds, selectedMarkerId]);

  const lockState = useMemo(() => {
    if (userMarkers.length === 0) {
      return "empty";
    }

    const allLocked = userMarkers.every(m => m.locked);
    const allUnlocked = userMarkers.every(m => !m.locked);

    if (allLocked) return "all-locked";
    if (allUnlocked) return "all-unlocked";
    return "mixed";
  }, [userMarkers]);

  // =========================================================
  // INITIAL CAMERA LOAD (MOUNT ONLY)
  // =========================================================
  useEffect(() => {
    const session = loadSessionCamera(mapId);
    const userDefault = loadUserDefaultCamera(mapId);

    const initial = session ?? userDefault ?? systemDefaultCamera;

    updateCamera(initial, true, false);
  }, []);
  // =========================================================
  // URL HANDLING
  // =========================================================
  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const viewParam = params.get("view");
    const dataParam = params.get("data");

    if (dataParam) {
      const decoded = decodeMapSaveState(dataParam);

      if (decoded) {
        setDialog({
          mode: "load-warning",
          payload: decoded,
        });
      }

      history.replace({ search: "" });
      return;
    }

    if (viewParam) {
      const decoded = decodeViewState(viewParam);

      if (decoded) {
        const target = decoded.sessionCamera ?? cameraRef.current;

        updateCamera(target, true, false);
        setVisibleMarkerTypes(decoded.visibleMarkerTypes);
        setSelectedMarkerId(decoded.selectedMarkerId ?? null);
      }

      history.replace({ search: "" });
    }
  }, []);

  useEffect(() => {
    saveSelectedMarker(selectedMarkerId, mapId);
  }, [selectedMarkerId, mapId]);
  // =========================================================
  // FILE IMPORT
  // =========================================================
  const handleLoadRequest = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".mapdata,application/x-mapdata";

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const decoded = await readMapFile(file);

      setDialog({
        mode: "load-warning",
        payload: {
          userMarkers: decoded.userMarkers,
          visibleMarkerTypes: decoded.visibleMarkerTypes,
          sessionCamera: decoded.sessionCamera ?? undefined,
          userDefaultCamera: decoded.userDefaultCamera ?? undefined,
          selectedMarkerId: decoded.selectedMarkerId ?? undefined,
        },
      });
    };

    input.click();
  };

  // =========================================================
  // SAVE / SHARE
  // =========================================================
  const handleSaveMap = () => {
    const data = createMapExport(
      userMarkers,
      visibleMarkerTypes,
      selectedMarkerId ?? "",
      cameraRef.current,
      userDefaultCamera ?? undefined
    );

    downloadMapExport(data, props.image);
  };

  const handleShare = () => {
    setDialog({ mode: "share" });
  };

  // =========================================================
  // RECENTER
  // =========================================================
  const handleRecenter = () => {
    const target = userDefaultCamera ?? systemDefaultCamera;
    updateCamera(target, true, true);
  };

  // =========================================================
  // USER DEFAULT CAMERA
  // =========================================================
  const handleSetUserDefaultCamera = () => {
    const current = cameraRef.current;

    saveUserDefaultCamera(current, mapId);
    setUserDefaultCameraState(current);

    setDefaultViewSaved(true);
    setTimeout(() => setDefaultViewSaved(false), 800);
  };

  const handleClearUserDefaultCamera = () => {
    clearUserDefaultCamera(mapId);
    setUserDefaultCameraState(null);

    setDefaultViewSaved(true);
    setTimeout(() => setDefaultViewSaved(false), 800);
  };

  const persistCamera = (view: MapView) => {
    saveSessionCamera(view, mapId);
  };

  // =========================================================
  // MARKER CREATE
  // =========================================================
  const handleCreateMarker = (position: [number, number]) => {
    setDialog({ mode: "create", position });
  };

  const handleDeleteMarker = (marker: MarkerData) => {
    setDialog({ mode: "delete", marker });
  }

  const handleLockAllMarkers = () => {
    setUserMarkers(prev =>
      prev.map(m => ({
        ...m,
        locked: true,
      }))
    );
  };

  const handleUnlockAllMarkers = () => {
    setUserMarkers(prev =>
      prev.map(m => ({
        ...m,
        locked: false,
      }))
    );
  };

  const onLinkCopied = () => {
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 1200);
  };


  const contextMenuRef = useRef<LeafletContextMenuHandle>(null);

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <BrowserOnly fallback={<div>Loading map...</div>}>
      {() => {
        const LeafletMap = require("./LeafletMap").default;

        return (
          <div style={{ position: "relative" }}>
            <LeafletMap
              {...props}
              measureEnabled={measureEnabled}
              setMeasureEnabled={setMeasureEnabled}
              displayDistance={displayDistance}
              travelInfo={travelInfo}
              userMarkers={userMarkers}
              setUserMarkers={setUserMarkers}
              onHoverDistanceChange={setHoverDistance}
              onSelectedDistanceChange={setSelectedDistance}
              onStartCreateMarker={handleCreateMarker}
              handleDeleteMarker={handleDeleteMarker}
              dialog={dialog}
              setDialog={setDialog}
              selectedLineId={selectedLineId}
              setSelectedLineId={setSelectedLineId}
              visibleMarkerTypes={visibleMarkerTypes}
              setVisibleMarkerTypes={setVisibleMarkerTypes}
              layersOpen={layersOpen}
              setLayersOpen={setLayersOpen}
              onSave={handleSaveMap}
              onLoad={handleLoadRequest}
              onShare={handleShare}
              camera={camera}
              setCamera={updateCamera}
              animateCamera={animateCamera}
              setAnimateCamera={setAnimateCamera}
              systemDefaultCamera={systemDefaultCamera}
              userDefaultCamera={userDefaultCamera}
              hasUserDefault={!!userDefaultCamera}
              onRecenter={handleRecenter}
              onSaveUserDefaultCamera={handleSetUserDefaultCamera}
              onClearUserDefaultCamera={handleClearUserDefaultCamera}
              contextMenu={contextMenuRef}
              selectedMarkerId={selectedMarkerId}
              setSelectedMarkerId={setSelectedMarkerId}
              lockAllMarkers={handleLockAllMarkers}
              unlockAllMarkers={handleUnlockAllMarkers}
              lockState={lockState}
              onLinkCopied={onLinkCopied}
              linkCopied={linkCopied}
              defaultViewSaved={defaultViewSaved}
            />
          </div>
        );
      }}
    </BrowserOnly>
  );
}