import React from "react";
import { handouts } from "../../data/handouts";
import { HandoutDescription } from "./HandoutDescription";
import { useLightbox } from "./LightboxProvider";
import styles from "./styles.module.css";
import useBaseUrl from "@docusaurus/useBaseUrl";

interface HandoutProps {
  id: string;
  children?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  group?: string[];
  onOpenGallery?: (id: string) => void;
}

export function Handout({ id, children, size = "md", group, onOpenGallery }: HandoutProps) {
  const { openLightbox } = useLightbox();

  const handout = handouts.find((h) => h.id === id);
  if (!handout) return <span>[Missing handout: {id}]</span>;

  const open = () => {
    if (onOpenGallery) return onOpenGallery(id);

    const slidesForGroup =
      group && group.length > 0
        ? handouts
            .filter((h) => group.includes(h.id))
            .map((h) => ({
              src: h.url,
              title: h.title,
              description: <HandoutDescription handout={h} />,
            }))
        : [
            {
              src: handout.url,
              title: handout.title,
              description: <HandoutDescription handout={handout} />,
            },
          ];

    const startIndex = group?.indexOf(id) ?? 0;
    openLightbox(slidesForGroup, startIndex);
  };

  return children ? (
    <span className={styles.inline} onClick={open}>
      {children}
    </span>
  ) : (
    <div className={`${styles.card} ${styles[size]}`} onClick={open}>
      <img src={useBaseUrl(handout.url)} alt={handout.title} className={styles.thumbnail} />
      <div className={styles.cardTitle}>{handout.title}</div>
    </div>
  );
}