// src/pages/handouts.tsx
import React, { useState, useMemo, useEffect } from 'react';
import Layout from '@theme/Layout';
import handouts from './data/handouts';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { useLocation } from 'react-router-dom';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/captions.css';
import { Zoom, Captions, Fullscreen, Download, Counter, Share } from 'yet-another-react-lightbox/plugins';
import { motion, AnimatePresence } from 'framer-motion';

import './handoutstyles.css';

const ITEMS_PER_PAGE = 12;

export default function HandoutsPage() {
  const [index, setIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const location = useLocation();

  const baseUrl = useBaseUrl('');
  const handoutsBase = useBaseUrl('/handouts');

  const withBase = (url: string) => url.startsWith('/') ? baseUrl + url.slice(1) : url;

  // All tags for filter buttons
  const allTags = useMemo(
    () => Array.from(new Set(handouts.flatMap(h => h.tags || []))),
    []
  );

  // Filter handouts
  const filteredHandouts = useMemo(() =>
    filter ? handouts.filter(h => h.tags?.includes(filter)) : handouts,
    [filter]
  );

  // Pagination
  const totalPages = Math.ceil(filteredHandouts.length / ITEMS_PER_PAGE);
  const paginatedHandouts = useMemo(
    () => filteredHandouts.slice(0, page * ITEMS_PER_PAGE),
    [filteredHandouts, page]
  );

  // Lightbox slides
  const slides = paginatedHandouts.map(item => ({
    src: withBase(item.image),
    title: item.title,
    description: `${item.foundBy ? `Found by ${item.foundBy}` : ''} ${item.location ? `in ${item.location}` : ''} ${item.session ? `(${item.session})` : ''}${item.description ? `\n${item.description}` : ''}`,
    slug: item.slug,
  }));

  // Open lightbox if hash is present
  useEffect(() => {
    if (!location.hash) return;
    const slug = location.hash.replace('#', '');
    const idx = paginatedHandouts.findIndex(h => h.slug === slug);
    if (idx >= 0) {
      setIndex(idx);
      const el = document.getElementById(`handout-card-${slug}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [location.hash, paginatedHandouts]);

  // Open handout and update hash
  const openHandout = (i: number) => {
    setIndex(i);
    const slug = paginatedHandouts[i].slug;
    window.history.replaceState(null, '', `${handoutsBase}#${slug}`);
  };

  // Close lightbox and reset hash
  const closeLightbox = () => {
    setIndex(null);
    window.history.replaceState(null, '', handoutsBase);
  };

  // Load more handler
  const loadMore = () => setPage(prev => Math.min(prev + 1, totalPages));

  return (
    <Layout title="Handouts">
      <div className="container">

        {/* PAGE HEADER */}
        <motion.h1
          className="handouts-title"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Handouts
        </motion.h1>

        {/* TAG FILTERS */}
        <div className="tag-filters">
          <button className={!filter ? 'active' : ''} onClick={() => { setFilter(null); setPage(1); }}>
            All
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              className={filter === tag ? 'active' : ''}
              onClick={() => { setFilter(tag); setPage(1); }}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* GRID */}
        <div className="grid">
          <AnimatePresence>
            {paginatedHandouts.map((item, i) => (
              <motion.div
                id={`handout-card-${item.slug}`}
                key={item.id}
                className="card"
                onClick={() => openHandout(i)}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <img src={withBase(item.image)} alt={item.title} loading="lazy" />
                <h3>{item.title}</h3>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* LOAD MORE */}
        {page < totalPages && (
          <div className="load-more-container">
            <button onClick={loadMore} className="load-more-button">
              Load more
            </button>
          </div>
        )}
      </div>

      {/* LIGHTBOX */}
      <Lightbox
        open={index !== null}
        close={closeLightbox}
        index={index ?? 0}
        slides={slides}
        plugins={[Zoom, Captions, Fullscreen, Download, Counter, Share]}
        zoom={{ maxZoomPixelRatio: 4 }}
        captions={{ descriptionTextAlign: 'center', descriptionMaxLines: 6 }}
        counter={{ style: { color: '#fff' } }}
      />
    </Layout>
  );
}