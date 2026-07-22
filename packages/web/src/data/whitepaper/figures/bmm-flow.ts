// packages/web/src/data/whitepaper/figures/bmm-flow.ts
// Vector figure for Blind Merged Mining flow (section 4).
//
// Visual intent: Bitcoin miners on the left include a small data commitment
// in their coinbase tx. Settlement proposers on the right submit BMM
// commitments and pay BTC fees back to miners. The key takeaway: zero
// marginal cost for miners, full hashrate security for Snowside.

import type { Figure } from '../types';

const BTC_ORG = [247, 147, 26] as const;
const SNOW    = [56, 189, 248] as const;
const SNOW_D  = [14, 165, 233] as const;
const INK     = [15, 15, 15] as const;
const LIGHT   = [240, 240, 245] as const;
const AXIS    = [102, 102, 115] as const;

export const bmmFlow: Figure = {
  kind: 'figure',
  caption:
    'Figure: Blind Merged Mining. Bitcoin miners include a compact header ' +
    'commitment (zero marginal cost) and earn BTC fees from settlement ' +
    'proposers. No additional hardware or software required.',
  height: 120,

  draw: ({ doc, x, y, width }) => {
    const dr = (c: readonly number[]) => doc.setDrawColor(c[0], c[1], c[2]);
    const fl = (c: readonly number[]) => doc.setFillColor(c[0], c[1], c[2]);
    const tx = (c: readonly number[]) => doc.setTextColor(c[0], c[1], c[2]);
    const ctext = (t: string, cx: number, ty: number) =>
      doc.text(t, cx - doc.getTextWidth(t) / 2, ty);

    const padT = 12;
    const boxW = 130;
    const boxH = 70;
    const boxY = y + padT;
    const leftX = x;
    const rightX = x + width - boxW;
    const cy = boxY + boxH / 2;

    // --- Bitcoin miners box ---
    fl(LIGHT);
    dr(BTC_ORG);
    doc.setLineWidth(1.2);
    doc.roundedRect(leftX, boxY, boxW, boxH, 6, 6, 'FD');
    doc.setFont('NotoSans', 'bold');
    doc.setFontSize(10);
    tx(BTC_ORG);
    ctext('Bitcoin Miners', leftX + boxW / 2, cy - 6);
    doc.setFont('NotoSans', 'normal');
    doc.setFontSize(8);
    tx(AXIS);
    ctext('Coinbase commitment', leftX + boxW / 2, cy + 8);
    ctext('No Snowside node needed', leftX + boxW / 2, cy + 20);

    // --- Settlement Proposers box ---
    fl(LIGHT);
    dr(SNOW_D);
    doc.setLineWidth(1.2);
    doc.roundedRect(rightX, boxY, boxW, boxH, 6, 6, 'FD');
    doc.setFont('NotoSans', 'bold');
    doc.setFontSize(10);
    tx(SNOW_D);
    ctext('Settlement Proposers', rightX + boxW / 2, cy - 6);
    doc.setFont('NotoSans', 'normal');
    doc.setFontSize(8);
    tx(AXIS);
    ctext('Submit BMM commitments', rightX + boxW / 2, cy + 8);
    ctext('Pay BTC to miners', rightX + boxW / 2, cy + 20);

    // --- arrows ---
    const gapL = leftX + boxW + 6;
    const gapR = rightX - 6;
    const midX = (gapL + gapR) / 2;

    const arrow = (
      x1: number, x2: number, ay: number,
      color: readonly number[], label: string,
    ) => {
      dr(color);
      doc.setLineWidth(2);
      doc.line(x1, ay, x2, ay);
      const dir = x2 > x1 ? 1 : -1;
      fl(color);
      doc.triangle(x2, ay, x2 - dir * 7, ay - 4, x2 - dir * 7, ay + 4, 'F');
      doc.setFont('NotoSans', 'normal');
      doc.setFontSize(7.5);
      tx(INK);
      ctext(label, (x1 + x2) / 2, ay - 8);
    };

    // top arrow: commitment flows right
    arrow(gapL, gapR, cy - 14, BTC_ORG, 'Header commitment');

    // bottom arrow: fees flow left
    arrow(gapR, gapL, cy + 14, SNOW, 'BTC fee reward');
  },
};
