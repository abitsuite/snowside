// packages/web/src/data/whitepaper/figures/architecture-diagram.ts
// Vector figure for Snowside's full system architecture (section 3).
// All coordinates in points (pt), matching the jsPDF doc unit.
//
// Visual intent: three horizontal boxes — Bitcoin (orange) → Snowside L1
// (snow-blue/purple) → C-Chain (USDC-blue). Arrows show BMM commitments
// flowing left-to-right and ICM bridge flowing right-to-left.

import type { Figure } from '../types';

const PURPLE  = [107, 45, 91] as const;   // #6B2D5B — aval-600
const BTC_ORG = [247, 147, 26] as const;  // #F7931A — bitcoin orange
const USDC_BL = [39, 117, 202] as const;  // #2775CA — usdc blue
const SNOW    = [56, 189, 248] as const;  // #38BDF8 — snow-400
const SNOW_D  = [14, 165, 233] as const;  // #0EA5E9 — snow-500
const INK     = [15, 15, 15] as const;
const LIGHT   = [240, 240, 245] as const;
const AXIS    = [102, 102, 115] as const;

export const architectureDiagram: Figure = {
  kind: 'figure',
  caption:
    'Figure: System architecture. Bitcoin miners secure Snowside via BMM ' +
    'commitments (left). Avalanche C-Chain provides USDC liquidity via ICM ' +
    'bridge (right). Snowside operates as a sovereign EVM L1 in the center.',
  height: 165,

  draw: ({ doc, x, y, width }) => {
    const dr = (c: readonly number[]) => doc.setDrawColor(c[0], c[1], c[2]);
    const fl = (c: readonly number[]) => doc.setFillColor(c[0], c[1], c[2]);
    const tx = (c: readonly number[]) => doc.setTextColor(c[0], c[1], c[2]);
    const ctext = (t: string, cx: number, ty: number) =>
      doc.text(t, cx - doc.getTextWidth(t) / 2, ty);

    // --- layout ---
    const padT = 10;
    const boxH = 70;
    const boxY = y + padT;
    const boxW = (width - 80) / 3;  // 3 boxes with gaps
    const gap = 40;
    const leftX = x;
    const midX = x + boxW + gap;
    const rightX = x + 2 * (boxW + gap);
    const cy = boxY + boxH / 2;

    // --- Bitcoin box (left, orange border) ---
    fl(LIGHT);
    dr(BTC_ORG);
    doc.setLineWidth(1.5);
    doc.roundedRect(leftX, boxY, boxW, boxH, 6, 6, 'FD');
    doc.setFont('NotoSans', 'bold');
    doc.setFontSize(10);
    tx(BTC_ORG);
    ctext('Bitcoin L1', leftX + boxW / 2, cy - 6);
    doc.setFont('NotoSans', 'normal');
    doc.setFontSize(8);
    tx(AXIS);
    ctext('Proof-of-Work', leftX + boxW / 2, cy + 8);
    ctext('SHA-256d mining', leftX + boxW / 2, cy + 20);

    // --- Snowside box (center, purple/snow border) ---
    fl(LIGHT);
    dr(PURPLE);
    doc.setLineWidth(1.5);
    doc.roundedRect(midX, boxY, boxW, boxH, 6, 6, 'FD');
    doc.setFont('NotoSans', 'bold');
    doc.setFontSize(10);
    tx(PURPLE);
    ctext('Snowside L1', midX + boxW / 2, cy - 6);
    doc.setFont('NotoSans', 'normal');
    doc.setFontSize(8);
    tx(AXIS);
    ctext('Avalanche consensus', midX + boxW / 2, cy + 8);
    ctext('EVM execution', midX + boxW / 2, cy + 20);

    // --- C-Chain box (right, USDC-blue border) ---
    fl(LIGHT);
    dr(USDC_BL);
    doc.setLineWidth(1.5);
    doc.roundedRect(rightX, boxY, boxW, boxH, 6, 6, 'FD');
    doc.setFont('NotoSans', 'bold');
    doc.setFontSize(10);
    tx(USDC_BL);
    ctext('C-Chain', rightX + boxW / 2, cy - 6);
    doc.setFont('NotoSans', 'normal');
    doc.setFontSize(8);
    tx(AXIS);
    ctext('Avalanche Primary', rightX + boxW / 2, cy + 8);
    ctext('USDC liquidity', rightX + boxW / 2, cy + 20);

    // --- arrow helper ---
    const arrow = (
      x1: number, x2: number, ay: number,
      color: readonly number[], label: string, dashed: boolean,
    ) => {
      dr(color);
      doc.setLineWidth(2);
      if (dashed) doc.setLineDashPattern([4, 3], 0);
      doc.line(x1, ay, x2, ay);
      doc.setLineDashPattern([], 0);
      const dir = x2 > x1 ? 1 : -1;
      fl(color);
      doc.triangle(x2, ay, x2 - dir * 7, ay - 4, x2 - dir * 7, ay + 4, 'F');
      doc.setFont('NotoSans', 'normal');
      doc.setFontSize(7.5);
      tx(INK);
      ctext(label, (x1 + x2) / 2, ay - 8);
    };

    // --- BMM arrow: Bitcoin → Snowside (top, orange, solid) ---
    const yBmm = cy - 16;
    arrow(leftX + boxW + 4, midX - 4, yBmm, BTC_ORG, 'BMM commitment', false);

    // --- ICM arrow: Snowside ← C-Chain (bottom, USDC-blue, solid) ---
    const yIcm = cy + 16;
    arrow(rightX - 4, midX + boxW + 4, yIcm, USDC_BL, 'ICM bridge (USDC)', false);

    // --- BTC gas note below Snowside ---
    doc.setFont('NotoSans', 'italic');
    doc.setFontSize(7.5);
    tx(AXIS);
    ctext('Native gas: BTC', midX + boxW / 2, boxY + boxH + 14);
  },
};
