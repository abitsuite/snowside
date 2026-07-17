// packages/web/src/data/whitepaper/figures/gas-flow.ts
// Vector figure for BTC gas flow (section 5).
//
// Visual intent: Users pay BTC for gas → block producers collect fees →
// BMM miners receive settlement incentives. No new token. Pure Bitcoin
// economic model preserved.

import type { Figure } from '../types';

const BTC_ORG = [247, 147, 26] as const;
const PURPLE  = [107, 45, 91] as const;
const SNOW    = [56, 189, 248] as const;
const INK     = [15, 15, 15] as const;
const LIGHT   = [240, 240, 245] as const;
const AXIS    = [102, 102, 115] as const;

export const gasFlow: Figure = {
  kind: 'figure',
  caption:
    'Figure: BTC gas flow. Users pay BTC for transaction fees. Block ' +
    'producers collect fees and distribute BMM settlement incentives to ' +
    'Bitcoin miners. No new token is minted — the Bitcoin economic model ' +
    'is preserved end-to-end.',
  height: 110,

  draw: ({ doc, x, y, width }) => {
    const dr = (c: readonly number[]) => doc.setDrawColor(c[0], c[1], c[2]);
    const fl = (c: readonly number[]) => doc.setFillColor(c[0], c[1], c[2]);
    const tx = (c: readonly number[]) => doc.setTextColor(c[0], c[1], c[2]);
    const ctext = (t: string, cx: number, ty: number) =>
      doc.text(t, cx - doc.getTextWidth(t) / 2, ty);

    const padT = 12;
    const boxH = 56;
    const boxW = 100;
    const boxY = y + padT;
    const gap = (width - 3 * boxW) / 2;
    const x0 = x;
    const x1 = x + boxW + gap;
    const x2 = x + 2 * (boxW + gap);
    const cy = boxY + boxH / 2;

    const boxes = [
      { x: x0, color: SNOW, label: 'Users', sub: 'Pay BTC gas' },
      { x: x1, color: PURPLE, label: 'Producers', sub: 'Collect fees' },
      { x: x2, color: BTC_ORG, label: 'Miners', sub: 'BMM incentive' },
    ];

    boxes.forEach((b) => {
      fl(LIGHT);
      dr(b.color);
      doc.setLineWidth(1.2);
      doc.roundedRect(b.x, boxY, boxW, boxH, 5, 5, 'FD');
      doc.setFont('NotoSans', 'bold');
      doc.setFontSize(9);
      tx(b.color);
      ctext(b.label, b.x + boxW / 2, cy - 4);
      doc.setFont('NotoSans', 'normal');
      doc.setFontSize(7.5);
      tx(AXIS);
      ctext(b.sub, b.x + boxW / 2, cy + 10);
    });

    const arrow = (x1: number, x2: number, ay: number, color: readonly number[], label: string) => {
      dr(color);
      doc.setLineWidth(1.5);
      doc.line(x1, ay, x2, ay);
      fl(color);
      doc.triangle(x2, ay, x2 - 5, ay - 3, x2 - 5, ay + 3, 'F');
      doc.setFont('NotoSans', 'normal');
      doc.setFontSize(7);
      tx(INK);
      ctext(label, (x1 + x2) / 2, ay - 6);
    };

    arrow(x0 + boxW + 3, x1 - 3, cy, SNOW, 'BTC fees');
    arrow(x1 + boxW + 3, x2 - 3, cy, BTC_ORG, 'Settlement');

    doc.setFont('NotoSans', 'italic');
    doc.setFontSize(7);
    tx(AXIS);
    ctext('No new token minted. No pre-mine. Pure Bitcoin economics.', x + width / 2, boxY + boxH + 14);
  },
};
