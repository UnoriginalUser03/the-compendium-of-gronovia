import React, { useMemo } from "react";
import { Handout } from "..";
import { useLightbox } from "../LightboxProvider";
import { handouts } from "../../../data/handouts";
import { HandoutDescription } from "../HandoutDescription";
import styles from "./styles.module.css";

interface HandoutGroupProps {
    ids?: string[]; // manual list of handout IDs
    session?: string; // filter by session name
    campaign?: string; // filter by campaign
    tags?: string[]; // filter by tags (all must match)
    size?: "sm" | "md" | "lg";
    children?: React.ReactNode; // optional custom wrapper
}

export function HandoutGroup({
    ids,
    session,
    campaign,
    tags = [],
    size = "md",
    children,
}: HandoutGroupProps) {
    const { openLightbox } = useLightbox();

    // Compute the list of handout IDs
    const filteredIds = useMemo(() => {
        if (ids && ids.length > 0) return ids;

        return handouts
            .filter(h => {
                const matchesSession = session ? h.session?.name === session : true;
                const matchesCampaign = campaign ? h.campaign === campaign : true;
                const matchesTags =
                    tags.length === 0 || tags.every(t => h.tags?.includes(t));
                return matchesSession && matchesCampaign && matchesTags;
            })
            .map(h => h.id);
    }, [ids, session, campaign, tags]);

    const openGroup = (clickedId: string) => {
        const slides = filteredIds.map(id => {
            const h = handouts.find(h => h.id === id)!; // guaranteed to exist
            return {
                src: h.url,
                title: h.title,
                description: <HandoutDescription handout={h} />,
            };
        });

        const startIndex = filteredIds.indexOf(clickedId);
        openLightbox(slides, startIndex);
    };

    return (
        <div className={styles.grid}>
            {filteredIds.map(id => (
                <Handout
                    key={id}
                    id={id}
                    size={size}
                    group={filteredIds}
                    onOpenGallery={openGroup}
                />
            ))}
            {children}
        </div>
    );
}