// packages/web/src/data/whitepaper/figures/icm-bridge.ts
// Vector figure for the ICM USDC bridge (section 6).
//
// Visual intent: USDC flows bidirectionally between C-Chain and Snowside via
// Avalanche's native Interchain Messaging. No third-party custodian.
// Trust-minimized. Available from day one. Contract Owner USDC share
// auto-bridges to C-Chain by default; Treasury USDC remains on Snowside.

import type { Figure } from '../types';

const USDC_BL = [39, 117, 202] as const;
const PURPLE  = [107, 45, 91] as const;
const SNOW    = [56, 189, 248] as const;
const INK     = [15, 15, 15] as const;
const LIGHT   = [240, 240, 245] as const;
const AXIS    = [102, 102, 115] as const;

export const icmBridge: Figure = {
  kind: 'figure',
  caption:
    'Figure: ICM USDC bridge. USDC moves trust-minimized between Avalanche ' +
    'C-Chain and Snowside via native Interchain Messaging — no third-party ' +
    'custodian, no wrapped tokens. Contract Owner USDC shares auto-bridge ' +
    'to C-Chain by default; the Treasury\u2019s USDC remains on Snowside under ' +
    'Foundation management.',
  height: 140,

  draw: ({ doc, x, y, width }) => {
    const dr = (c: readonly number[]) => doc.setDrawColor(c[0], c[1], c[2]);
    const fl = (c: readonly number[]) => doc.setFillColor(c[0], c[1], c[2]);
    const tx = (c: readonly number[]) => doc.setTextColor(c[0], c[1], c[2]);
    const ctext = (t: string, cx: number, ty: number) =>
      doc.text(t, cx - doc.getTextWidth(t) / 2, ty);

    const padT = 12;
    const boxW = 130;
    const boxH = 64;
    const boxY = y + padT;
    const leftX = x;
    const rightX = x + width - boxW;
    const cy = boxY + boxH / 2;

    // C-Chain box
    fl(LIGHT);
    dr(USDC_BL);
    doc.setLineWidth(1.2);
    doc.roundedRect(leftX, boxY, boxW, boxH, 6, 6, 'FD');
    doc.setFont('NotoSans', 'bold');
    doc.setFontSize(10);
    tx(USDC_BL);
    ctext('C-Chain', leftX + boxW / 2, cy - 6);
    doc.setFont('NotoSans', 'normal');
    doc.setFontSize(8);
    tx(AXIS);
    ctext('USDC native', leftX + boxW / 2, cy + 8);
    ctext('Avalanche Primary', leftX + boxW / 2, cy + 20);

    // Snowside box
    fl(LIGHT);
    dr(PURPLE);
    doc.setLineWidth(1.2);
    doc.roundedRect(rightX, boxY, boxW, boxH, 6, 6, 'FD');
    doc.setFont('NotoSans', 'bold');
    doc.setFontSize(10);
    tx(PURPLE);
    ctext('Snowside', rightX + boxW / 2, cy - 6);
    doc.setFont('NotoSans', 'normal');
    doc.setFontSize(8);
    tx(AXIS);
    ctext('USDC bridged', rightX + boxW / 2, cy + 8);
    ctext('DeFi-ready', rightX + boxW / 2, cy + 20);

    // Bridge arrows — bidirectional
    const gapL = leftX + boxW + 6;
    const gapR = rightX - 6;
    const midX = (gapL + gapR) / 2;

    // Top arrow: C-Chain -> Snowside (incoming)
    const yTop = cy - 10;
    dr(USDC_BL);
    doc.setLineWidth(2);
    doc.line(gapL, yTop, gapR, yTop);
    fl(USDC_BL);
    doc.triangle(gapR, yTop, gapR - 7, yTop - 4, gapR - 7, yTop + 4, 'F');
    doc.setFont('NotoSans', 'normal');
    doc.setFontSize(6.5);
    tx(INK);
    ctext('USDC in', midX, yTop - 6);

    // Bottom arrow: Snowside -> C-Chain (auto-bridge out)
    const yBot = cy + 10;
    dr(SNOW);
    doc.setLineWidth(2);
    doc.line(gapR, yBot, gapL, yBot);
    fl(SNOW);
    doc.triangle(gapL, yBot, gapL + 7, yBot - 4, gapL + 7, yBot + 4, 'F');
    doc.setFont('NotoSans', 'normal');
    doc.setFontSize(6.5);
    tx(INK);
    ctext('Owner USDC out (auto)', midX, yBot + 10);

    // Center label
    doc.setFont('NotoSans', 'bold');
    doc.setFontSize(7.5);
    tx(INK);
    ctext('ICM (trust-minimized)', midX, cy + 1);
  },
};
