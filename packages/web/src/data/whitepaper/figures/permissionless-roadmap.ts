// packages/web/src/data/whitepaper/figures/permissionless-roadmap.ts
// Vector figure for the two-phase permissionless validation roadmap (section 12).
//
// Visual intent: Two horizontal phases shown left-to-right — Phase 1
// (permissioned, seeded validators) and Phase 2 (permissionless, AVAX + BTC
// bonding).

import type { Figure } from '../types';

const SNOW_D  = [14, 165, 233] as const;
const INK     = [15, 15, 15] as const;
const LIGHT   = [240, 240, 245] as const;
const AXIS    = [102, 102, 115] as const;

export const permissionlessRoadmap: Figure = {
  kind: 'figure',
  caption:
    'Figure: Two-phase permissionless validation roadmap. Phase 1: ' +
    'permissioned launch with seeded validators. Phase 2: open registration ' +
    'with AVAX + BTC bonding and slashing.',
  height: 150,

  draw: ({ doc, x, y, width }) => {
    const dr = (c: readonly number[]) => doc.setDrawColor(c[0], c[1], c[2]);
    const fl = (c: readonly number[]) => doc.setFillColor(c[0], c[1], c[2]);
    const tx = (c: readonly number[]) => doc.setTextColor(c[0], c[1], c[2]);
    const ctext = (t: string, cx: number, ty: number) =>
      doc.text(t, cx - doc.getTextWidth(t) / 2, ty);

    const padT = 12;
    const gap = 30;
    const boxW = (width - gap) / 2;
    const boxH = 92;
    const boxY = y + padT;
    const p1X = x;
    const p2X = x + boxW + gap;

    // Phase 1 — Permissioned
    fl(LIGHT);
    dr(AXIS);
    doc.setLineWidth(1.2);
    doc.roundedRect(p1X, boxY, boxW, boxH, 5, 5, 'FD');
    doc.setFont('NotoSans', 'bold');
    doc.setFontSize(9);
    tx(INK);
    ctext('Phase 1', p1X + boxW / 2, boxY + 14);
    doc.setFontSize(8);
    tx(AXIS);
    ctext('Permissioned', p1X + boxW / 2, boxY + 26);
    doc.setFontSize(7);
    ctext('3-5 seeded validators', p1X + boxW / 2, boxY + 40);
    ctext('AVAX staking', p1X + boxW / 2, boxY + 52);
    ctext('Three-part fees active', p1X + boxW / 2, boxY + 64);
    ctext('BMM settlement open', p1X + boxW / 2, boxY + 76);

    // Phase 2 — Permissionless + AVAX + BTC
    fl(LIGHT);
    dr(SNOW_D);
    doc.setLineWidth(1.2);
    doc.roundedRect(p2X, boxY, boxW, boxH, 5, 5, 'FD');
    doc.setFont('NotoSans', 'bold');
    doc.setFontSize(9);
    tx(SNOW_D);
    ctext('Phase 2', p2X + boxW / 2, boxY + 14);
    doc.setFontSize(8);
    tx(AXIS);
    ctext('Permissionless', p2X + boxW / 2, boxY + 26);
    doc.setFontSize(7);
    ctext('Open registration', p2X + boxW / 2, boxY + 40);
    ctext('AVAX + 0.3 BTC bond', p2X + boxW / 2, boxY + 52);
    ctext('Slashing active', p2X + boxW / 2, boxY + 64);
    ctext('Target: 10+ validators', p2X + boxW / 2, boxY + 76);

    // Arrows between phases
    const arrowY = boxY + boxH / 2;
    const arrow = (x1: number, x2: number) => {
      dr(AXIS);
      doc.setLineWidth(1.5);
      doc.line(x1, arrowY, x2, arrowY);
      fl(AXIS);
      doc.triangle(x2, arrowY, x2 - 5, arrowY - 3, x2 - 5, arrowY + 3, 'F');
    };
    arrow(p1X + boxW + 2, p2X - 2);
  },
};
