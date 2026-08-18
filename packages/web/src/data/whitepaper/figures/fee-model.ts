// packages/web/src/data/whitepaper/figures/fee-model.ts
// Vector figure for the three-part fee model (section 5).
//
// Visual intent: User transaction fee splits into three streams —
// Base Fee (to eCash L1 miners via BMM), Priority Fee (to block-producing
// validator), Contract Fee (optional, opt-in by contract owner, BTC or USDC,
// split between Contract Owner and Snowside Treasury with vesting schedule
// 50% -> 80% over 18 months). Treasury distributes to Foundation (10%),
// Settlement Proposers (5%), and Validators (85%, proportional to bonded BTC).

import type { Figure } from '../types';

const BTC_ORG = [247, 147, 26] as const;
const PURPLE  = [107, 45, 91] as const;
const SNOW    = [56, 189, 248] as const;
const SNOW_D  = [14, 165, 233] as const;
const INK     = [15, 15, 15] as const;
const LIGHT   = [240, 240, 245] as const;
const AXIS    = [102, 102, 115] as const;

export const feeModel: Figure = {
  kind: 'figure',
  caption:
    'Figure: Three-part fee model. Base Fees flow to eCash L1 miners via ' +
    'BMM commitments (non-negotiable). Priority Fees go to the block-producing ' +
    'validator. Contract Fees (optional, opt-in by contract owner, BTC or USDC) ' +
    'split between the Contract Owner (50% -> 80% vesting over 18 months) and ' +
    'the Snowside Treasury (50% -> 20%). The Treasury distributes to the ' +
    'Foundation (10% retained), Settlement Proposers (5%), and Validators ' +
    '(85%, 100% proportional to bonded BTC).',
  height: 260,

  draw: ({ doc, x, y, width }) => {
    const dr = (c: readonly number[]) => doc.setDrawColor(c[0], c[1], c[2]);
    const fl = (c: readonly number[]) => doc.setFillColor(c[0], c[1], c[2]);
    const tx = (c: readonly number[]) => doc.setTextColor(c[0], c[1], c[2]);
    const ctext = (t: string, cx: number, ty: number) =>
      doc.text(t, cx - doc.getTextWidth(t) / 2, ty);

    // --- Top box: Transaction Fee ---
    const topBoxW = 180;
    const topBoxH = 32;
    const topBoxY = y + 10;
    const topBoxX = x + (width - topBoxW) / 2;

    fl(LIGHT);
    dr(INK);
    doc.setLineWidth(1);
    doc.roundedRect(topBoxX, topBoxY, topBoxW, topBoxH, 5, 5, 'FD');
    doc.setFont('NotoSans', 'bold');
    doc.setFontSize(10);
    tx(INK);
    ctext('Transaction Fee (BTC) \u2014 Contract Fees optionally USDC', topBoxX + topBoxW / 2, topBoxY + 20);

    // --- Three middle boxes: fee types ---
    const midBoxW = (width - 40) / 3;
    const midBoxH = 52;
    const midBoxY = topBoxY + topBoxH + 30;
    const gap = 20;
    const baseX = x;
    const prioX = x + midBoxW + gap;
    const contractX = x + 2 * (midBoxW + gap);

    // Base Fee box
    fl(LIGHT);
    dr(BTC_ORG);
    doc.setLineWidth(1.2);
    doc.roundedRect(baseX, midBoxY, midBoxW, midBoxH, 5, 5, 'FD');
    doc.setFont('NotoSans', 'bold');
    doc.setFontSize(9);
    tx(BTC_ORG);
    ctext('Base Fee', baseX + midBoxW / 2, midBoxY + 14);
    doc.setFont('NotoSans', 'normal');
    doc.setFontSize(7.5);
    tx(AXIS);
    ctext('Required, algorithmic', baseX + midBoxW / 2, midBoxY + 26);
    ctext('-> eCash L1 miners', baseX + midBoxW / 2, midBoxY + 38);
    ctext('(100% via BMM)', baseX + midBoxW / 2, midBoxY + 48);

    // Priority Fee box
    fl(LIGHT);
    dr(PURPLE);
    doc.setLineWidth(1.2);
    doc.roundedRect(prioX, midBoxY, midBoxW, midBoxH, 5, 5, 'FD');
    doc.setFont('NotoSans', 'bold');
    doc.setFontSize(9);
    tx(PURPLE);
    ctext('Priority Fee', prioX + midBoxW / 2, midBoxY + 14);
    doc.setFont('NotoSans', 'normal');
    doc.setFontSize(7.5);
    tx(AXIS);
    ctext('Optional, user-set', prioX + midBoxW / 2, midBoxY + 26);
    ctext('-> Block-producing', prioX + midBoxW / 2, midBoxY + 38);
    ctext('validator (100%)', prioX + midBoxW / 2, midBoxY + 48);

    // Contract Fee box
    fl(LIGHT);
    dr(SNOW_D);
    doc.setLineWidth(1.2);
    doc.roundedRect(contractX, midBoxY, midBoxW, midBoxH, 5, 5, 'FD');
    doc.setFont('NotoSans', 'bold');
    doc.setFontSize(9);
    tx(SNOW_D);
    ctext('Contract Fee', contractX + midBoxW / 2, midBoxY + 14);
    doc.setFont('NotoSans', 'normal');
    doc.setFontSize(7);
    tx(AXIS);
    ctext('Optional, opt-in', contractX + midBoxW / 2, midBoxY + 26);
    ctext('BTC or USDC', contractX + midBoxW / 2, midBoxY + 36);
    ctext('-> Owner + Treasury', contractX + midBoxW / 2, midBoxY + 48);

    // --- Arrows from top box to three boxes ---
    const arrowFromTop = (tx_x: number, bx: number, color: readonly number[]) => {
      dr(color);
      doc.setLineWidth(1);
      const startY = topBoxY + topBoxH;
      const endY = midBoxY;
      doc.line(tx_x, startY, tx_x, startY + 12);
      doc.line(tx_x, startY + 12, bx, startY + 12);
      doc.line(bx, startY + 12, bx, endY);
      fl(color);
      doc.triangle(bx, endY, bx - 3, endY - 5, bx + 3, endY - 5, 'F');
    };

    arrowFromTop(topBoxX + topBoxW / 2 - 50, baseX + midBoxW / 2, BTC_ORG);
    arrowFromTop(topBoxX + topBoxW / 2, prioX + midBoxW / 2, PURPLE);
    arrowFromTop(topBoxX + topBoxW / 2 + 50, contractX + midBoxW / 2, SNOW_D);

    // --- Contract Fee split: vesting schedule ---
    const vestY = midBoxY + midBoxH + 28;
    const vestW = midBoxW;
    const vestH = 44;
    const vestX = contractX;

    fl(LIGHT);
    dr(AXIS);
    doc.setLineWidth(0.8);
    doc.setLineDashPattern([3, 2], 0);
    doc.roundedRect(vestX, vestY, vestW, vestH, 4, 4, 'FD');
    doc.setLineDashPattern([], 0);
    doc.setFont('NotoSans', 'bold');
    doc.setFontSize(8);
    tx(INK);
    ctext('Vesting Schedule', vestX + vestW / 2, vestY + 12);
    doc.setFont('NotoSans', 'normal');
    doc.setFontSize(7);
    tx(AXIS);
    ctext('t=0: Owner 50% | Treasury 50%', vestX + vestW / 2, vestY + 24);
    ctext('t=18: Owner 80% | Treasury 20%', vestX + vestW / 2, vestY + 34);

    // Arrow from Contract Fee box to vesting
    dr(AXIS);
    doc.setLineWidth(0.8);
    doc.line(contractX + midBoxW / 2, midBoxY + midBoxH, vestX + vestW / 2, vestY);
    fl(AXIS);
    doc.triangle(vestX + vestW / 2, vestY, vestX + vestW / 2 - 3, vestY - 5, vestX + vestW / 2 + 3, vestY - 5, 'F');

    // --- Treasury distribution ---
    const distY = vestY + vestH + 24;
    fl(LIGHT);
    dr(AXIS);
    doc.setLineWidth(0.8);
    doc.setLineDashPattern([3, 2], 0);
    doc.roundedRect(vestX, distY, vestW, 58, 4, 4, 'FD');
    doc.setLineDashPattern([], 0);
    doc.setFont('NotoSans', 'bold');
    doc.setFontSize(8);
    tx(INK);
    ctext('Treasury Distribution', vestX + vestW / 2, distY + 12);
    doc.setFont('NotoSans', 'normal');
    doc.setFontSize(6.5);
    tx(AXIS);
    ctext('Foundation: 10% (retained)', vestX + vestW / 2, distY + 24);
    ctext('Proposers: 5% (configurable)', vestX + vestW / 2, distY + 34);
    ctext('Validators: 85% (prop. to bonded BTC)', vestX + vestW / 2, distY + 44);
    ctext('(governance: mechanism TBD)', vestX + vestW / 2, distY + 54);

    // Arrow from vesting to Treasury distribution
    dr(AXIS);
    doc.setLineWidth(0.8);
    doc.line(vestX + vestW / 2, vestY + vestH, vestX + vestW / 2, distY);
    fl(AXIS);
    doc.triangle(vestX + vestW / 2, distY, vestX + vestW / 2 - 3, distY - 5, vestX + vestW / 2 + 3, distY - 5, 'F');
  },
};
