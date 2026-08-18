// packages/web/src/data/whitepaper/figures/role-separation.ts
// Vector figure for validator vs settlement proposer separation (section 4).
//
// Visual intent: Two distinct roles shown as parallel tiers — Validators
// (top, run Snowball consensus, produce blocks, BTC bonding) and Settlement
// Proposers (bottom, submit BMM commitments, no bonding, permissionless).
// Arrow shows finalized blocks flowing from validators to settlement proposers.

import type { Figure } from '../types';

const PURPLE  = [107, 45, 91] as const;
const BTC_ORG = [247, 147, 26] as const;
const SNOW    = [56, 189, 248] as const;
const INK     = [15, 15, 15] as const;
const LIGHT   = [240, 240, 245] as const;
const AXIS    = [102, 102, 115] as const;

export const roleSeparation: Figure = {
  kind: 'figure',
  caption:
    'Figure: Role separation. Validators (top) run Snowball consensus and ' +
    'produce blocks with BTC bonding. Settlement Proposers (bottom) submit ' +
    'BMM commitments to eCash L1 \u2014 permissionless, no bonding required, ' +
    'compensated from the Snowside Treasury\u2019s captured Contract Fees.',
  height: 170,

  draw: ({ doc, x, y, width }) => {
    const dr = (c: readonly number[]) => doc.setDrawColor(c[0], c[1], c[2]);
    const fl = (c: readonly number[]) => doc.setFillColor(c[0], c[1], c[2]);
    const tx = (c: readonly number[]) => doc.setTextColor(c[0], c[1], c[2]);
    const ctext = (t: string, cx: number, ty: number) =>
      doc.text(t, cx - doc.getTextWidth(t) / 2, ty);

    const padT = 10;
    const boxW = width - 40;
    const boxH = 56;
    const gap = 24;
    const boxX = x + 20;

    // --- Validators box (top) ---
    const valY = y + padT;
    fl(LIGHT);
    dr(PURPLE);
    doc.setLineWidth(1.4);
    doc.roundedRect(boxX, valY, boxW, boxH, 6, 6, 'FD');
    doc.setFont('NotoSans', 'bold');
    doc.setFontSize(10);
    tx(PURPLE);
    doc.text('Validators', boxX + 12, valY + 16);
    doc.setFont('NotoSans', 'normal');
    doc.setFontSize(7.5);
    tx(AXIS);
    doc.text('Run Snowball consensus \u00b7 Produce + finalize blocks', boxX + 12, valY + 30);
    doc.text('BTC bonding (Phase 2+) \u00b7 Subject to slashing', boxX + 12, valY + 42);
    doc.text('Earn Priority Fees + Treasury distribution (85%)', boxX + 12, valY + 52);

    // --- Arrow: finalized blocks flow down ---
    const arrowX = boxX + boxW / 2;
    const arrowY1 = valY + boxH + 2;
    const arrowY2 = arrowY1 + gap - 4;
    dr(SNOW);
    doc.setLineWidth(1.5);
    doc.line(arrowX, arrowY1, arrowX, arrowY2);
    fl(SNOW);
    doc.triangle(arrowX, arrowY2 + 4, arrowX - 4, arrowY2 - 2, arrowX + 4, arrowY2 - 2, 'F');
    doc.setFont('NotoSans', 'normal');
    doc.setFontSize(7);
    tx(INK);
    ctext('Finalized blocks', arrowX + 50, (arrowY1 + arrowY2) / 2 + 2);

    // --- Settlement Proposers box (bottom) ---
    const spY = arrowY2 + 8;
    fl(LIGHT);
    dr(BTC_ORG);
    doc.setLineWidth(1.4);
    doc.roundedRect(boxX, spY, boxW, boxH, 6, 6, 'FD');
    doc.setFont('NotoSans', 'bold');
    doc.setFontSize(10);
    tx(BTC_ORG);
    doc.text('Settlement Proposers', boxX + 12, spY + 16);
    doc.setFont('NotoSans', 'normal');
    doc.setFontSize(7.5);
    tx(AXIS);
    doc.text('Submit BMM commitments to eCash L1 \u00b7 No bonding required', boxX + 12, spY + 30);
    doc.text('Permissionless from day one \u00b7 Treasury-compensated (5%)', boxX + 12, spY + 42);
    doc.text('Cannot forge blocks \u2014 only anchor existing finalized blocks', boxX + 12, spY + 52);
  },
};
