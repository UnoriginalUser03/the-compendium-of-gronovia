import React, {
  useMemo,
  useState,
  useRef,
  KeyboardEventHandler,
  FocusEventHandler,
} from "react";
import Fuse from "fuse.js";
import styles from "./styles.module.css";

export interface HandoutsFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;

  campaign: string;
  onCampaignChange: (value: string) => void;
  campaigns: string[];

  session: string;
  onSessionChange: (value: string) => void;

  tags: string[];
  onToggleTag: (tag: string) => void;

  onReset: () => void;

  sessions: string[];
  allTags: string[];
}

export function HandoutsFilters({
  search,
  onSearchChange,

  campaign,
  onCampaignChange,
  campaigns,

  session,
  onSessionChange,

  tags,
  onToggleTag,
  onReset,

  sessions,
  allTags,
}: HandoutsFiltersProps) {
  const [tagQuery, setTagQuery] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [highlightIndex, setHighlightIndex] = useState<number>(0);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Fuse for tag autocomplete
  const tagFuse = useMemo(
    () =>
      new Fuse<string>(allTags, {
        threshold: 0.3,
      }),
    [allTags]
  );

  const suggestions: string[] = useMemo(() => {
    if (!tagQuery.trim()) return allTags.slice(0, 20);
    return tagFuse.search(tagQuery).map((r) => r.item).slice(0, 20);
  }, [tagQuery, tagFuse, allTags]);

  const visibleSuggestions: string[] = suggestions.filter(
    (t: string) => !tags.includes(t)
  );

  const handleSelectTag = (tag: string): void => {
    onToggleTag(tag);
    setTagQuery("");
    setOpen(false);
    setHighlightIndex(0);
  };

  const handleTagKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
      return;
    }

    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) =>
        Math.min(i + 1, Math.max(visibleSuggestions.length - 1, 0))
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const choice = visibleSuggestions[highlightIndex];
      if (choice) handleSelectTag(choice);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const handleBlur: FocusEventHandler<HTMLInputElement | HTMLDivElement> = (
    e
  ) => {
    const nextTarget = e.relatedTarget as Node | null;

    if (
      dropdownRef.current &&
      nextTarget &&
      dropdownRef.current.contains(nextTarget)
    ) {
      return;
    }

    setOpen(false);
  };

  return (
    <>
      <div className={styles.filterBar}>
        {/* Search */}
        <input
          type="text"
          placeholder="Search handouts..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className={styles.searchInput}
        />

        {/* Campaign dropdown */}
        <select
          value={campaign}
          onChange={(e) => onCampaignChange(e.target.value)}
          className={styles.select}
        >
          <option value="all">All Campaigns</option>
          {campaigns.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Session dropdown */}
        <select
          value={session}
          onChange={(e) => onSessionChange(e.target.value)}
          className={styles.select}
        >
          <option value="all">All Sessions</option>
          {sessions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {/* Tag autocomplete */}
        <div className={styles.tagInputWrapper}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Filter by tags…"
            value={tagQuery}
            onChange={(e) => {
              setTagQuery(e.target.value);
              setOpen(true);
              setHighlightIndex(0);
            }}
            onFocus={() => setOpen(true)}
            onBlur={handleBlur}
            onKeyDown={handleTagKeyDown}
            className={styles.tagInput}
          />

          {open && visibleSuggestions.length > 0 && (
            <div
              ref={dropdownRef}
              className={styles.tagDropdown}
              tabIndex={-1}
              onBlur={handleBlur}
            >
              {visibleSuggestions.map((t, idx) => {
                const [ns, rest] = t.split("/", 2);
                const active = idx === highlightIndex;

                return (
                  <button
                    key={t}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectTag(t);
                    }}
                    className={`${styles.tagOption} ${
                      active ? styles.tagOptionActive : ""
                    }`}
                  >
                    <span className={styles.tagNamespace}>{ns}</span>
                    <span className={styles.tagName}>{rest ?? ""}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Reset */}
        <button type="button" onClick={onReset} className={styles.reset}>
          Reset
        </button>
      </div>

      {/* Selected tag pills */}
      {tags.length > 0 && (
        <div className={styles.tagPillsRow}>
          {tags.map((t) => (
            <button
              key={t}
              type="button"
              className={`${styles.tagPill} ${styles.tagPillActive}`}
              onClick={() => onToggleTag(t)}
            >
              {t} <span className={styles.tagPillClose}>×</span>
            </button>
          ))}
        </div>
      )}
    </>
  );
}
