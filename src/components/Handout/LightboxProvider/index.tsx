import React, { createContext, useContext, useEffect, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import { Download, Fullscreen, Share, Zoom } from "yet-another-react-lightbox/plugins";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { useLocation } from "@docusaurus/router";

interface Slide {
  src: string;
  title?: string;
  description?: React.ReactNode;
}

interface LightboxContextValue {
  openLightbox: (slides: Slide[], startIndex?: number) => void;
}

const LightboxContext = createContext<LightboxContextValue | null>(null);

export function useLightbox() {
  const ctx = useContext(LightboxContext);
  if (!ctx) throw new Error("useLightbox must be used inside provider");
  return ctx;
}

export function LightboxProvider({ children }: { children: React.ReactNode }) {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [index, setIndex] = useState<number | null>(null);

  const openLightbox = (slides: Slide[], startIndex = 0) => {
    setSlides(slides);
    setIndex(startIndex);
  };

  const closeLightbox = () => setIndex(null);
  const baseUrl = useBaseUrl("/");
  const location = useLocation();


  useEffect(() => {
    closeLightbox(); // close lightbox on every route change
  }, [location.pathname, location.search]);

  return (
    <LightboxContext.Provider value={{ openLightbox }}>
      {children}

      {index !== null && (
        <Lightbox
          styles={{
            root: {
              "--yarl__color_backdrop": "rgba(0,0,0,0.5)",
              "--yarl__slide_title_color": "#fff",
              "--yarl__slide_description_color": "#fff",
              backdropFilter: "blur(8px)"
            },
            captionsTitleContainer: {
              backdropFilter: "blur(8px)"
            },
            captionsDescriptionContainer: {
              backdropFilter: "blur(8px)"
            }
          }}
          open={true}
          close={closeLightbox}
          index={index}
          slides={slides.map((s) => ({ ...s, src: baseUrl + s.src }))}
          plugins={[Fullscreen, Captions, Zoom, Download, Share]}
          carousel={{ imageFit: "contain", padding: "5%" }}
          controller={{ closeOnPullDown: true, closeOnBackdropClick: true }}
          zoom={{ maxZoomPixelRatio: 5, minZoom: 0.8, zoomInMultiplier: 2 }}
          captions={{
            descriptionTextAlign: "center",
            descriptionMaxLines: 20,
            showToggle: true,
          }}
          animation={{ fade: 250, swipe: 300 }}
          render={{
            buttonPrev: slides.length <= 1 ? () => null : undefined,
            buttonNext: slides.length <= 1 ? () => null : undefined,
          }}
        />
      )}
    </LightboxContext.Provider>
  );
}