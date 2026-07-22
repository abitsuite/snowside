// packages/web/src/data/whitepaper/figures/validator-economics.ts
// Vector figure for validator economics (section 9).
//
// Visual intent: show the cost/revenue balance for running a Snowside
// validator. Low cost (Avalanche9000 subscription ~$10-20/mo + BTC bond)
// vs revenue (Priority Fees + Contract Fees in BTC). NodΞRunr handles all
// operational overhead.

import type { Figure } from '../types';

const PURPLE  = [107, 45, 91] as const;
const SNOW    = [56, 189, 248] as const;
const INK     = [15, 15, 15] as const;
const LIGHT   = [240, 240, 245] as const;
const AXIS    = [102, 102, 115] as const;

export const validatorEconomics: Figure = {
  kind: 'figure',
  caption:
    'Figure: Validator economics. Operational cost is ~$10-20/month via ' +
    'Avalanche9000 subscription plus BTC bond (0.3 BTC minimum, Phase 2+). ' +
    'Revenue comes from Priority Fees and Contract Fees (BTC). NodΞRunr ' +
    'eliminates manual maintenance, making community-run validation feasible.',
  height: 110,

  draw: ({ doc, x, y, width }) => {
    const dr = (c: readonly number[]) => doc.setDrawColor(c[0], c[1], c[2]);
    const fl = (c: readonly number[]) => doc.setFillColor(c[0], c[1], c[2]);
    const tx = (c: readonly number[]) => doc.setTextColor(c[0], c[1], c[2]);
    const ctext = (t: string, cx: number, ty: number) =>
      doc.text(t, cx - doc.getTextWidth(t) / 2, ty);

    const padT = 12;
    const boxW = (width - 30) / 2;
    const boxH = 64;
    const boxY = y + padT;
    const leftX = x;
    const rightX = x + boxW + 30;
    const cy = boxY + boxH / 2;

    // Cost box
    fl(LIGHT);
    dr(AXIS);
    doc.setLineWidth(1);
    doc.roundedRect(leftX, boxY, boxW, boxH, 5, 5, 'FD');
    doc.setFont('NotoSans', 'bold');
    doc.setFontSize(10);
    tx(INK);
    doc.text('Cost', leftX + 12, cy - 10);
    doc.setFont('NotoSans', 'normal');
    doc.setFontSize(8);
    tx(AXIS);
    doc.text('Avalanche9000 subscription', leftX + 12, cy + 4);
    doc.text('~$10-20 / month per validator', leftX + 12, cy + 16);
    doc.text('AVAX (Phase 1-2) + 0.3 BTC bond (Phase 2+)', leftX + 12, cy + 28);

    // Revenue box
    fl(LIGHT);
    dr(SNOW);
    doc.setLineWidth(1.2);
    doc.roundedRect(rightX, boxY, boxW, boxH, 5, 5, 'FD');
    doc.setFont('NotoSans', 'bold');
    doc.setFontSize(10);
    tx(PURPLE);
    doc.text('Revenue', rightX + 12, cy - 10);
    doc.setFont('NotoSans', 'normal');
    doc.setFontSize(8);
    tx(AXIS);
    doc.text('Priority Fees (BTC, 100% to producer)', rightX + 12, cy + 4);
    doc.text('Contract Fees (BTC, vesting split)', rightX + 12, cy + 16);
    doc.text('Permissionless \u2014 anyone can run', rightX + 12, cy + 28);
  },
};
