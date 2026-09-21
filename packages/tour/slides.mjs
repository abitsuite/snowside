// packages/tour/slides.mjs
//
// SLIDE MODEL for the Snowside Tour.
//
// This module is the bridge between CONTENT (content.mjs, the copy) and
// PRESENTATION (scripts/build-tour.mjs, the renderer). It contains no prose
// of its own: every string is read out of content.mjs, so the copy still has
// exactly one home.
//
// WHY A SEPARATE MODULE
// ---------------------
// The tour is rendered in ONE pass into TWO files that must never drift:
//   dist/index.html          desktop + tablet (fixed 980x552 canvas, scaled)
//   dist/mobile/index.html   phones (reflowing, one slide per screen)
// Both are produced by scripts/build-tour.mjs from this single slide list, so
// editorial order, slide count and slide identity are defined once.
//
// REPLACES SLIDEV
// ---------------
// This model previously lived in slides.md as Slidev frontmatter + MDC markup.
// The deck has been rebuilt as a dependency-free static site (see
// scripts/build-tour.mjs for the full rationale). Slidev, UnoCSS and Vue are
// no longer used by this package.

import {
  cover,
  whatIsSnowside,
  twoAssets,
  howItWorks,
  whyAvalanche,
  agenticPayments,
  comparison,
  risks,
  roadmap,
  opportunities,
  faqs,
  connect,
} from './content.mjs'

/* ------------------------------------------------------------------ *
 * Slide kinds
 * ------------------------------------------------------------------ *
 * 'cover'   — full-bleed title slide with the poster banner.
 * 'default' — heading + optional lead + a body built from `blocks`.
 * 'connect' — the closing call-to-action slide (centred button grid).
 *
 * `blocks` is a list of { type, ... } descriptors the renderer understands:
 *   { type: 'cards',  cols: 2|3|4, cards: [{kicker,title,body}] }
 *   { type: 'assets', cols: 2,      cards: [{kicker,title,body}] }
 *   { type: 'note',   strong, rest }
 *   { type: 'comparison' }
 *   { type: 'risks' }
 *   { type: 'roadmap' }
 *   { type: 'revenue', cards: [{title,apy,note}] }
 *   { type: 'faqs',   items: [{q,a}] }
 * ------------------------------------------------------------------ */

export const slides = [
  /* 1 --------------------------------------------------------------- */
  {
    id: 'cover',
    kind: 'cover',
    label: 'Cover',
    kicker: cover.kicker,
    banner: cover.banner,
    bannerAlt: cover.bannerAlt,
    tagline: cover.tagline,
    subtitle: cover.subtitle,
  },

  /* 2 --------------------------------------------------------------- */
  {
    id: 'what-is-snowside',
    kind: 'default',
    label: 'What Is Snowside?',
    heading: whatIsSnowside.heading,
    lead: whatIsSnowside.lead,
    blocks: [{ type: 'cards', cols: 2, cards: whatIsSnowside.cards }],
  },

  /* 3 --------------------------------------------------------------- */
  {
    id: 'two-assets',
    kind: 'default',
    label: 'Two Native Assets',
    heading: twoAssets.heading,
    lead: twoAssets.lead,
    blocks: [
      { type: 'cards', cols: 2, cards: twoAssets.cards },
      {
        type: 'note',
        strong: twoAssets.footnoteStrong,
        rest: twoAssets.footnoteRest,
      },
    ],
  },

  /* 4 --------------------------------------------------------------- */
  {
    id: 'how-it-works',
    kind: 'default',
    label: 'How It Works',
    heading: howItWorks.heading,
    lead: howItWorks.lead,
    blocks: [{ type: 'cards', cols: 4, cards: howItWorks.cards }],
  },

  /* 5 --------------------------------------------------------------- */
  {
    id: 'why-avalanche',
    kind: 'default',
    label: 'Why Avalanche',
    heading: whyAvalanche.heading,
    lead: whyAvalanche.lead,
    blocks: [{ type: 'cards', cols: 3, cards: whyAvalanche.cards }],
  },

  /* 6 --------------------------------------------------------------- */
  {
    id: 'agentic-payments',
    kind: 'default',
    label: 'Agentic Payments',
    heading: agenticPayments.heading,
    lead: agenticPayments.lead,
    blocks: [{ type: 'cards', cols: 3, cards: agenticPayments.cards }],
  },

  /* 7 --------------------------------------------------------------- */
  {
    id: 'comparison',
    kind: 'default',
    label: 'How Snowside Compares',
    heading: comparison.heading,
    lead: comparison.lead,
    blocks: [{ type: 'comparison' }],
  },

  /* 8 --------------------------------------------------------------- */
  {
    id: 'risks',
    kind: 'default',
    label: 'Risks & Mitigations',
    heading: risks.heading,
    lead: risks.lead,
    blocks: [{ type: 'risks' }],
  },

  /* 9 --------------------------------------------------------------- */
  {
    id: 'roadmap',
    kind: 'default',
    label: 'Roadmap',
    heading: roadmap.heading,
    lead: roadmap.lead,
    blocks: [{ type: 'roadmap' }],
  },

  /* 10 -------------------------------------------------------------- */
  {
    id: 'opportunities',
    kind: 'default',
    label: 'Opportunities',
    heading: opportunities.heading,
    lead: opportunities.lead,
    blocks: [
      { type: 'revenue', cards: opportunities.cards },
      { type: 'note', strong: opportunities.footnote },
    ],
  },

  /* 11 -------------------------------------------------------------- */
  {
    id: 'faqs',
    kind: 'default',
    label: 'FAQ',
    heading: faqs.heading,
    lead: faqs.lead,
    blocks: [{ type: 'faqs', items: faqs.items }],
  },

  /* 12 -------------------------------------------------------------- */
  {
    id: 'connect',
    kind: 'connect',
    label: 'Connect with Us',
    heading: connect.heading,
    lead: connect.lead,
    links: connect.links,
    footer: connect.footer,
  },
]

export const totalSlides = slides.length
