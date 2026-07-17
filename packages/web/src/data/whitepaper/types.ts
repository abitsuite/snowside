// packages/web/src/data/whitepaper/types.ts

import type { jsPDF } from 'jspdf';

export interface WhitepaperMeta {
  brand: string;
  version: string;
  title: string;
  subtitle: string;
  date: string;
  tagline: string;
  author: string;
  url: string;
}

export interface FigureContext {
  doc: jsPDF;
  x: number;      // content left edge (pt)
  y: number;      // top of the figure area (pt)
  width: number;  // content width (pt)
}

export interface Figure {
  kind: 'figure';
  caption: string;
  height: number; // vertical space to reserve (pt)
  draw: (ctx: FigureContext) => void;
}

export type Block = string | Figure;

export interface WhitepaperSection {
  heading: string;
  body: Block[];
}
