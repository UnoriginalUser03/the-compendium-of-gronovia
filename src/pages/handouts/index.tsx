import React, { useEffect, useMemo, useState } from "react";
import Layout from "@theme/Layout";
import { useLocation, useHistory } from "@docusaurus/router";
import Fuse from "fuse.js";

import { handouts } from "../../data/handouts";
import { Handout } from "../../components/Handout";
import { HandoutsFilters } from "../../components/Handout/HandoutsFilters";
import { useLightbox } from "../../components/Handout/LightboxProvider";
import { HandoutDescription } from "../../components/Handout/HandoutDescription";
import useBaseUrl from "@docusaurus/useBaseUrl";

import styles from "./index.module.css";

interface UrlParams {
  q?: string;
  campaign?: string;
  session?: string;
  tag?: string[];
  page?: string;
}

export default function HandoutsGallery() {
  const location = useLocation();
  const history = useHistory();

  const params = useMemo<UrlParams>(() => {
    const p = new URLSearchParams(location.search);
    return {
      q: p.get("q") ?? undefined,
      campaign: p.get("campaign") ?? undefined,
      session: p.get("session") ?? undefined,
      tag: p.getAll("tag"),
      page: p.get("page") ?? undefined,
    };
  }, [location.search]);

  const { openLightbox } = useLightbox();

  const [search, setSearch] = useState<string>(params.q ?? "");
  const [campaign, setCampaign] = useState<string>(params.campaign ?? "all");
  const [session, setSession] = useState<string>(params.session ?? "all");
  const [tags, setTags] = useState<string[]>(params.tag ?? []);
  const [page, setPage] = useState<number>(Number(params.page ?? 1));

  const pageSize = 20;

  // --- Helper to update URL dynamically ---
  const updateUrl = (updates: Partial<UrlParams>, mode: "push" | "replace" = "replace") => {
    const newParams = new URLSearchParams(location.search);

    Object.entries(updates).forEach(([key, value]) => {
      newParams.delete(key);

      if (Array.isArray(value)) {
        value.forEach(v => newParams.append(key, v));
      } else if (value !== undefined && value !== "" && value !== "all") {
        newParams.set(key, value);
      }
    });

    const method = mode === "push" ? history.push : history.replace;
    method({ pathname: location.pathname, search: newParams.toString() });
  };


  // --- SEARCH ---
  const fuse = useMemo(() =>
    new Fuse(handouts, {
      keys: ["title", "description", "tags", "session.name", "location.name", "foundBy.name"],
      threshold: 0.35,
      ignoreLocation: true,
    }), []
  );

  const searched = useMemo(() => {
    if (!search.trim()) return handouts;
    return fuse.search(search).map(r => r.item);
  }, [search, fuse]);

  // --- FILTER ---
  const filtered = useMemo(() => {
    return searched.filter(h => {
      const matchesCampaign = campaign === "all" || h.campaign === campaign;
      const matchesSession = session === "all" || h.session?.name === session;
      const matchesTags = tags.length === 0 || tags.every(t => h.tags?.includes(t));
      return matchesCampaign && matchesSession && matchesTags;
    });
  }, [searched, campaign, session, tags]);

  // --- PAGINATION ---
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const filteredIds = filtered.map(h => h.id);

  const slides = useMemo(() => {
    return filtered.map(h => ({
      src: h.url,
      title: h.title,
      description: <HandoutDescription handout={h} />,
    }));
  }, [filtered]);

  const openGallery = (clickedId: string) => {
    const index = filteredIds.indexOf(clickedId);
    openLightbox(slides, index);
  };

  // --- FILTER OPTIONS ---
  const campaigns = useMemo(() =>
    Array.from(new Set(handouts.map(h => h.campaign).filter(Boolean))).sort(), []
  );

  const sessions = useMemo(() => {
    const set = new Set<string>();
    handouts.forEach(h => {
      if (campaign === "all" || h.campaign === campaign) {
        if (h.session) set.add(h.session.name);
      }
    });
    return Array.from(set).sort();
  }, [campaign]);

  const allTags = useMemo(() => Array.from(new Set(searched.flatMap(h => h.tags ?? []))).sort(), [searched]);

  useEffect(() => {
    setSearch(params.q ?? "");
    setCampaign(params.campaign ?? "all");
    setSession(params.session ?? "all");
    setTags(params.tag ?? []);
    setPage(Number(params.page ?? 1));
  }, [params.q, params.campaign, params.session, params.tag, params.page]);


  return (
    <Layout title="Handouts">
      <div className="container margin-vert--lg">
        <h1 className="text--center">Handouts</h1>

        <HandoutsFilters
          search={search}
          onSearchChange={v => {
            setSearch(v);
            setPage(1);
            updateUrl({ q: v, page: "1" });
          }}
          campaign={campaign}
          onCampaignChange={v => {
            setCampaign(v);
            setPage(1);
            updateUrl({ campaign: v, page: "1" });
          }}
          campaigns={campaigns}
          session={session}
          onSessionChange={v => {
            setSession(v);
            setPage(1);
            updateUrl({ session: v, page: "1" });
          }}
          sessions={sessions}
          tags={tags}
          onToggleTag={tag => {
            const newTags = tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag];
            setTags(newTags);
            setPage(1);
            updateUrl({ tag: newTags, page: "1" });
          }}
          allTags={allTags}
          onReset={() => {
            setSearch("");
            setCampaign("all");
            setSession("all");
            setTags([]);
            setPage(1);
            updateUrl({ q: "", campaign: "all", session: "all", tag: [], page: "1" });
          }}
        />

        {paginated.length > 0 ? (
          <div className={styles.grid}>
            {paginated.map(h => (
              <Handout key={h.id} id={h.id} onOpenGallery={openGallery} />
            ))}
          </div>
        ) : (
          <p className="text--center">No handouts found.</p>
        )}

        {/* --- PAGINATION CONTROLS --- */}
        {totalPages > 1 && (
          <div className={styles.pagination}>

            {/* Prev button */}
            <button
              onClick={() => {
                const prev = Math.max(1, currentPage - 1);
                setPage(prev);
                updateUrl({ page: String(prev) }, "push");
              }}
              disabled={currentPage === 1}
              className={`${styles.pageButton} ${styles.prev}`}
            >
              Prev
            </button>

            {/* Numeric pages */}
            {(() => {
              const pages: (number | string)[] = [];
              const maxDisplay = 3; // how many middle pages to show

              // Always include first page
              pages.push(1);

              // Window calculations
              const half = Math.floor(maxDisplay / 2);
              let start = Math.max(2, currentPage - half);
              let end = Math.min(totalPages - 1, currentPage + half);

              // Adjust window near edges
              if (currentPage <= half + 1) {
                start = 2;
                end = Math.min(totalPages - 1, maxDisplay + 1);
              } else if (currentPage >= totalPages - half) {
                start = Math.max(2, totalPages - maxDisplay);
                end = totalPages - 1;
              }

              // Ellipsis before window
              if (start > 2) pages.push("…");

              // Middle pages
              for (let i = start; i <= end; i++) {
                pages.push(i);
              }

              // Ellipsis after window
              if (end < totalPages - 1) pages.push("…");

              // Always include last page
              if (totalPages > 1) pages.push(totalPages);

              return pages.map((p, idx) =>
                p === "…" ? (
                  <span key={`dots-${idx}`} className={styles.pageDots}>
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    className={[
                      styles.pageButton,
                      styles.number, // mark all numeric buttons
                      p === 1 ? styles.first : "",
                      p === totalPages ? styles.last : "",
                      Math.abs(Number(p) - currentPage) <= 1 ? styles.visible : "", // <-- show 3 pages on mobile
                      p === currentPage ? styles.pageButtonActive : ""
                    ].join(" ")}
                    onClick={() => {
                      setPage(Number(p));
                      updateUrl({ page: String(p) }, "push");
                    }}
                  >
                    {p}
                  </button>
                )
              );
            })()}

            {/* Next button */}
            <button
              onClick={() => {
                const next = Math.min(totalPages, currentPage + 1);
                setPage(next);
                updateUrl({ page: String(next) }, "push");
              }}
              disabled={currentPage === totalPages}
              className={`${styles.pageButton} ${styles.next}`}
            >
              Next
            </button>

          </div>
        )}

      </div>
    </Layout>
  );
}