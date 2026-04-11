import React, { useRef } from "react";
import L from "leaflet";
import { MapContainer, ImageOverlay } from "react-leaflet";

import useBaseUrl from "@docusaurus/useBaseUrl";

import LeafletMarker from "../LeafletMarker";
import LeafletDevCoords from "../LeafletDevCoords";
import LeafletFullscreen from "../LeafletFullscreen";
import LeafletRecenter from "../LeafletRecenter";
import LeafletDistancePanel from "../LeafletDistancePanel";
import LeafletMeasure from "../LeafletMeasure";
import LeafletUserMarkers from "../LeafletContextMenu";
import LeafletInteractionController from "../LeafletInteractionController";
import LeafletLayersPanel from "../LeafletLayersPanel";
import LeafletMapControls from "../LeafletMapControls";
import LeafletViewTracker from "../LeafletViewController";
import LeafletMarkerEditorModal from "../LeafletMarkerEditorModal";
import LeafletShareModal from "../LeafletShareModal";
import LeafletLoadModal from "../LeafletLoadModal";

import { LeafletMapProps } from "../LeafletTypes";
import LeafletContextMenu from "../LeafletContextMenu";

export default function LeafletMap({
  image,
  bounds,
  markers = [],
  userMarkers = [],
  scaleRatio = 1,

  measureEnabled = false,
  setMeasureEnabled,

  handleDeleteMarker,

  setUserMarkers,

  displayDistance = null,
  travelInfo = [],

  onHoverDistanceChange,
  onSelectedDistanceChange,

  onStartCreateMarker,

  dialog,
  setDialog,

  selectedLineId,
  setSelectedLineId,

  visibleMarkerTypes,
  setVisibleMarkerTypes,

  layersOpen,
  setLayersOpen,

  onSave,
  onLoad,
  onShare,

  camera,
  setCamera,

  animateCamera,
  setAnimateCamera,

  systemDefaultCamera,

  userDefaultCamera,

  hasUserDefault,

  onRecenter,
  onSaveUserDefaultCamera,
  onClearUserDefaultCamera,

  contextMenu,

  selectedMarkerId,
  setSelectedMarkerId,

  lockAllMarkers,
  unlockAllMarkers,
  lockState,

  onLinkCopied,
  linkCopied,
  defaultViewSaved
}: LeafletMapProps) {

  const measureRef = useRef<{
    clear: () => void;
    removeLine: (id: string) => void;
  }>(null);

  const activeCamera = userDefaultCamera ?? systemDefaultCamera;

  return (
    <MapContainer
      crs={L.CRS.Simple}
      bounds={bounds}
      center={activeCamera.center}
      zoom={activeCamera.zoom}
      maxZoom={3}
      minZoom={-3}
      style={{
        height: "600px",
        width: "100%",
        position: "relative",
      }}
    >
      {/* =====================================================
          IMAGE OVERLAY
      ===================================================== */}
      <ImageOverlay url={useBaseUrl(image)} bounds={bounds} />

      {/* =====================================================
          MARKERS
      ===================================================== */}
      {[...markers, ...userMarkers]
        .filter((m) => !m.type || visibleMarkerTypes[m.type])
        .map((marker) => (
          <LeafletMarker
            key={`${marker.id}`}
            marker={marker}
            interactable={!measureEnabled}
            onRequestEdit={(m) => setDialog({ mode: "edit", marker: m })}
            onRequestMove={(marker, pos) => {
              setUserMarkers((prev) =>
                prev.map((item) =>
                  item.id === marker.id
                    ? { ...item, position: pos }
                    : item
                )
              );
            }}
            onRequestMarkerMenu={(marker, x, y) => {
              contextMenu.current?.openMarkerMenu({
                marker,
                x,
                y,
              });
            }}
            isSelected={selectedMarkerId === marker.id}
            onSelect={() => setSelectedMarkerId(marker.id)}
            onDeselect={() => setSelectedMarkerId(null)}
          />
        ))}

      {/* =====================================================
          USER MARKER CREATION
      ===================================================== */}
      <LeafletContextMenu
        ref={contextMenu}
        onCreateMarker={onStartCreateMarker}
        onEditMarker={(m) => setDialog({ mode: "edit", marker: m })}
        onDeleteMarker={handleDeleteMarker}
        onToggleLock={(marker) => {
          setUserMarkers((prev) =>
            prev.map((item) =>
              item.id === marker.id
                ? { ...item, locked: !item.locked }
                : item
            )
          );
        }}
        measureEnabled={measureEnabled}
        onLockAll={lockAllMarkers}
        onUnlockAll={unlockAllMarkers}
        lockState={lockState}
      />

      {/* =====================================================
          CONTROLS
      ===================================================== */}
      <LeafletMapControls
        measureEnabled={measureEnabled}
        setMeasureEnabled={setMeasureEnabled!}
        selectedLineId={selectedLineId}
        onClearSelected={(id) => {
          if (id) measureRef.current?.removeLine(id);
          else measureRef.current?.clear();
        }}
        layersOpen={layersOpen}
        setLayersOpen={setLayersOpen}
        onSave={onSave}
        onLoadRequest={onLoad}
        onShareRequest={onShare}
        linkCopied={linkCopied}
      />

      {/* =====================================================
          LAYERS PANEL
      ===================================================== */}
      <LeafletLayersPanel
        open={layersOpen}
        setOpen={setLayersOpen}
        visibleMarkerTypes={visibleMarkerTypes}
        setVisibleMarkerTypes={setVisibleMarkerTypes}
        hidden={measureEnabled}
      />

      {/* =====================================================
          INTERACTION LOCK
      ===================================================== */}
      <LeafletInteractionController
        locked={dialog.mode !== "closed"}
      />

      {/* =====================================================
          DISTANCE PANEL
      ===================================================== */}
      <LeafletDistancePanel
        displayDistance={displayDistance}
        travelInfo={travelInfo}
      />

      {/* =====================================================
          MEASURE TOOL
      ===================================================== */}
      {measureEnabled && (
        <LeafletMeasure
          ref={measureRef}
          scaleRatio={scaleRatio}
          measureEnabled={measureEnabled}
          onHoverDistanceChange={onHoverDistanceChange}
          onSelectedDistanceChange={onSelectedDistanceChange}
          selectedId={selectedLineId}
          setSelectedId={setSelectedLineId}
        />
      )}

      {/* =====================================================
          CAMERA TRACKER
      ===================================================== */}
      <LeafletViewTracker
        animateCamera={animateCamera}
        setCamera={setCamera}
        onAnimationComplete={() => setAnimateCamera(null)}
      />

      {/* =====================================================
          DEV + UI UTILITIES
      ===================================================== */}
      <LeafletDevCoords
        measureEnabled={measureEnabled}
        devMode={process.env.NODE_ENV === "development"}
      />

      <LeafletFullscreen />

      <LeafletRecenter
        hasUserDefault={hasUserDefault}
        onRecenter={onRecenter}
        onSaveDefault={onSaveUserDefaultCamera}
        onClearDefault={onClearUserDefaultCamera}
        defaultViewSaved={defaultViewSaved}
      />

      {/* =====================================================
          MODALS
      ===================================================== */}
      <LeafletMarkerEditorModal
        dialog={dialog}
        setDialog={setDialog}
        setUserMarkers={setUserMarkers}
      />

      <LeafletShareModal
        dialog={dialog}
        setDialog={setDialog}
        visibleMarkerTypes={visibleMarkerTypes}
        selectedMarkerId={selectedMarkerId}
        userMarkers={userMarkers}
        sessionCamera={camera ?? systemDefaultCamera}
        userDefaultCamera={userDefaultCamera ?? systemDefaultCamera}
        onLinkCopied={onLinkCopied}
      />

      <LeafletLoadModal
        dialog={dialog}
        setDialog={setDialog}
        setUserMarkers={setUserMarkers}
        setVisibleMarkerTypes={setVisibleMarkerTypes}
        setUserDefaultCamera={onSaveUserDefaultCamera}
        setCamera={setCamera}
        setAnimateCamera={setAnimateCamera}
        setSelectedMarker={setSelectedMarkerId}
      />
    </MapContainer>
  );
}