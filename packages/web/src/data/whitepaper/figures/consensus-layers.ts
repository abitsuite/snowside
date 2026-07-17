// packages/web/src/data/whitepaper/figures/consensus-layers.ts
// Vector figure for Snowside's two-layer consensus model (section 8).
//
// Visual intent: three horizontal tiers stacked vertically — Instant
// (Avalanche, ~1-3s), Confirmed (validator consensus, ~2min), Settled
// (BMM anchor to Bitcoin, ~10-20min). Each tier shows its confirmation time.

import type { Figure } from '../types';

const PURPLE  = [107, 45, 91] as const;
const BTC_ORG = [247, 147, 26] as const;
const SNOW    = [56, 189, 248] as const;
const SNOW_D  = [14, 165, 233] as const;
const INK     = [15, 15, 15] as const;
const LIGHT   = [240, 240, 245] as const;
const AXIS    = [102, 102, 115] as const;

export const consensusLayers: Figure = {
  kind: 'figure',
  caption:
    'Figure: Three-tier confirmation model. Instant (Avalanche, ~1-3s), ' +
    'Confirmed (PoW block, ~2min), Settled (BMM anchor to Bitcoin, ~10-20min). ' +
    'Users choose the tier that matches their trust requirement.',
  height: 150,

  draw: ({ doc, x, y, width }) => {
    const dr = (c: readonly number[]) => doc.setDrawColor(c[0], c[1], c[2]);
    const fl = (c: readonly number[]) => doc.setFillColor(c[0], c[1], c[2]);
    const tx = (c: readonly number[]) => doc.setTextColor(c[0], c[1], c[2]);
    const ctext = (t: string, cx: number, ty: number) =>
      doc.text(t, cx - doc.getTextWidth(t) / 2, ty);

    const tierH = 36;
    const gap = 8;
    const tierW = width - 40;
    const tierX = x + 20;

    const tiers = [
      { label: 'Instant', desc: 'Avalanche consensus — sub-second finality', time: '~1-3s', color: SNOW },
      { label: 'Confirmed', desc: 'Validator consensus block', time: '~2min', color: PURPLE },
      { label: 'Settled', desc: 'BMM anchor to Bitcoin L1', time: '~10-20min', color: BTC_ORG },
    ];

    tiers.forEach((tier, i) => {
      const ty = y + 12 + i * (tierH + gap);

      fl(LIGHT);
      dr(tier.color);
      doc.setLineWidth(1.2);
      doc.roundedRect(tierX, ty, tierW, tierH, 5, 5, 'FD');

      doc.setFont('NotoSans', 'bold');
      doc.setFontSize(10);
      tx(INK);
      doc.text(tier.label, tierX + 12, ty + 16);

      doc.setFont('NotoSans', 'normal');
      doc.setFontSize(8);
      tx(AXIS);
      doc.text(tier.desc, tierX + 12, ty + 27);

      doc.setFont('NotoSans', 'bold');
      doc.setFontSize(9);
      tx(tier.color);
      const tw = doc.getTextWidth(tier.time);
      doc.text(tier.time, tierX + tierW - tw - 12, ty + 22);
    });

    //connecting line between tiers
    dr(AXIS);
    doc.setLineWidth(0.6);
    doc.setLineDashPattern([2, 2], 0);
    const lineX = tierX + tierW / 2;
    for (let i = 0; i < tiers.length - 1; i++) {
      const y1 = y + 12 + (i + 1) * tierH + i * gap;
      const y2 = y + 12 + (i + 1) * (tierH + gap);
      doc.line(lineX, y1, lineX, y2);
    }
    doc.setLineDashPattern([], 0);
  },
};
