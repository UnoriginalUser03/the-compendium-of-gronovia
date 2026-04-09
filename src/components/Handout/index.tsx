import React, { useMemo, useCallback } from "react";
import Image from '@theme/IdealImage';
import { handouts } from "../../data/handouts";
import { HandoutDescription } from "./HandoutDescription";
import { useLightbox } from "./LightboxProvider";
import type { Slide } from "../../helpers/buildSlides";
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

  const resolvedUrl = useBaseUrl(handout.url);

  // --- Build slides with NO nulls (type-safe) ---
  const slides = useMemo<Slide[]>(() => {
    if (group?.length) {
      return group.flatMap((gid) => {
        const h = handouts.find((x) => x.id === gid);
        if (!h) return []; // no nulls → no union type

        return [
          {
            src: h.url,
            title: h.title,
            description: <HandoutDescription handout={h} />,
          },
        ];
      });
    }

    return [
      {
        src: handout.url,
        title: handout.title,
        description: <HandoutDescription handout={handout} />,
      },
    ];
  }, [group, handout]);

  const startIndex = group?.indexOf(id) ?? 0;

  const open = useCallback(() => {
    if (onOpenGallery) return onOpenGallery(id);
    openLightbox(slides, startIndex);
  }, [id, slides, startIndex, onOpenGallery, openLightbox]);

  return children ? (
    <span className={styles.inline} onClick={open}>
      {children}
    </span>
  ) : (
    <div className={`${styles.card} ${styles[size]}`} onClick={open}>
      <Image img={resolvedUrl} alt={handout.title} className={styles.thumbnail} />
      <div className={styles.cardTitle}>{handout.title}</div>
    </div>
  );
}
