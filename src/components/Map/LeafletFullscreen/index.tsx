import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { FullScreen } from "leaflet.fullscreen";
import { Maximize, Minimize } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";

// Extend FullScreen type to include internal 'link' property
interface FullScreenWithLink extends FullScreen {
    link: HTMLAnchorElement;
}

export default function LeafletFullscreen() {
    const map = useMap();

    useEffect(() => {
        if (!map) return;

        // Helper to render React icon to inline SVG
        const renderIcon = (icon: React.ReactNode) =>
            renderToStaticMarkup(icon);

        // Create the fullscreen control
        const fsControl = new FullScreen({
            position: "topleft",
            content: renderToStaticMarkup(
                <span><Maximize /></span>
            )
        }) as FullScreenWithLink;

        map.addControl(fsControl);

        // Event handlers to swap icons
        const handleEnter = () => {
            fsControl.link.innerHTML = renderToStaticMarkup(
                <span><Minimize /></span>
            );

        };

        const handleExit = () => {
            fsControl.link.innerHTML = renderToStaticMarkup(
                <span><Maximize /></span>
            );
        };

        map.on("enterFullscreen", handleEnter);
        map.on("exitFullscreen", handleExit);

        // Cleanup on unmount
        return () => {
            map.removeControl(fsControl);
            map.off("enterFullscreen", handleEnter);
            map.off("exitFullscreen", handleExit);
        };
    }, [map]);

    return null;
}