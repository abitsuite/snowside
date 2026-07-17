// packages/web/src/pages/whitepaper.pdf.ts
// Static PDF whitepaper — generated at build time, served at /whitepaper.pdf
// Astro static endpoint: exports a GET that returns raw bytes + content-type

import { meta } from '../data/whitepaper/meta';
import { WHITEPAPER } from '../data/whitepaper/content';
import { jsPDF } from 'jspdf';
import fs from 'node:fs';
import path from 'node:path';
import type { APIRoute } from 'astro';

const COLORS = {
  snow:      [56, 189, 248],
  snowDeep:  [14, 165, 233],
  aval:      [107, 45, 91],
  btc:       [247, 147, 26],
  usdc:      [39, 117, 202],
  dark:      [10, 15, 26],
  white:     [255, 255, 255],
  lightGray: [240, 240, 245],
  medGray:   [102, 102, 115],
  black:     [15, 15, 15],
} as const;

function stripNumberPrefix(h: string): string {
  return h.replace(/^\d+\.\s+/, '');
}

async function generateWhitepaper(): Promise<ArrayBuffer> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });

  const fontsDir = path.resolve('src/fonts');
  const regularB64 = fs.readFileSync(path.join(fontsDir, 'NotoSans-Regular.ttf')).toString('base64');
  const boldB64 = fs.readFileSync(path.join(fontsDir, 'NotoSans-Bold.ttf')).toString('base64');
  const italicB64 = fs.readFileSync(path.join(fontsDir, 'NotoSans-Italic.ttf')).toString('base64');
  doc.addFileToVFS('NotoSans-Regular.ttf', regularB64);
  doc.addFileToVFS('NotoSans-Bold.ttf', boldB64);
  doc.addFileToVFS('NotoSans-Italic.ttf', italicB64);
  doc.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal');
  doc.addFont('NotoSans-Bold.ttf', 'NotoSans', 'bold');
  doc.addFont('NotoSans-Italic.ttf', 'NotoSans', 'italic');

  doc.setProperties({
    title: `Snowside Whitepaper v${meta.version}`,
    author: meta.author,
    subject: 'A dedicated Avalanche Layer-1 for the eCash hard-fork',
    keywords: 'blockchain, Snowside, Avalanche, eCash, BMM, BIP-301, Bitcoin sidechain, EVM, NodΞRunr',
    creator: 'snowside.network',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginLeft = 60;
  const marginRight = 60;
  const marginTop = 60;
  const marginBottom = 60;
  const contentWidth = pageWidth - marginLeft - marginRight;

  const TITLE_SIZE = 28;
  const SUBTITLE_SIZE = 14;
  const HEADING_SIZE = 16;
  const BODY_SIZE = 10;
  const TAGLINE_SIZE = 16;
  const SUBTAGLINE_SIZE = 11;
  const FOOTER_SIZE = 8;
  const HEADING_LINE_HEIGHT = HEADING_SIZE * 1.6;
  const BODY_LINE_HEIGHT = BODY_SIZE * 1.6;
  let cursorY = marginTop;
  let pageNum = 1;

  const setFill = (c: readonly number[]) => doc.setFillColor(c[0], c[1], c[2]);
  const setTextCol = (c: readonly number[]) => doc.setTextColor(c[0], c[1], c[2]);
  const setDrawCol = (c: readonly number[]) => doc.setDrawColor(c[0], c[1], c[2]);

  function addPageFooter(num: number) {
    setDrawCol(COLORS.lightGray);
    doc.setLineWidth(0.5);
    doc.line(marginLeft, pageHeight - marginBottom + 15, pageWidth - marginRight, pageHeight - marginBottom + 15);
    const numStr = String(num);
    doc.setFont('NotoSans', 'normal');
    doc.setFontSize(FOOTER_SIZE);
    setTextCol(COLORS.medGray);
    const numWidth = doc.getTextWidth(numStr);
    doc.text(numStr, pageWidth - marginRight - numWidth, pageHeight - marginBottom + 28);
    doc.setFont('NotoSans', 'italic');
    doc.text('Snowside — A dedicated Avalanche Layer-1 for the eCash hard-fork', marginLeft, pageHeight - marginBottom + 28);
  }

  function ensureSpace(needed: number) {
    if (cursorY + needed > pageHeight - marginBottom) {
      addPageFooter(pageNum);
      doc.addPage();
      cursorY = marginTop;
      pageNum++;
    }
  }

  // ── Cover page ──
  setFill(COLORS.dark);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  setFill(COLORS.snow);
  doc.rect(0, 0, pageWidth, 6, 'F');
  doc.setFont('NotoSans', 'bold');
  doc.setFontSize(TITLE_SIZE);
  setTextCol(COLORS.white);
  const titleWidth = doc.getTextWidth(WHITEPAPER.title);
  doc.text(WHITEPAPER.title, (pageWidth - titleWidth) / 2, pageHeight / 2 - 80);
  doc.setFont('NotoSans', 'normal');
  doc.setFontSize(SUBTITLE_SIZE);
  setTextCol(COLORS.snow);
  const subtitleWidth = doc.getTextWidth(WHITEPAPER.subtitle);
  doc.text(WHITEPAPER.subtitle, (pageWidth - subtitleWidth) / 2, pageHeight / 2 - 50);
  doc.setFont('NotoSans', 'italic');
  doc.setFontSize(TAGLINE_SIZE);
  setTextCol(COLORS.snowDeep);
  const taglineWidth = doc.getTextWidth(WHITEPAPER.tagline);
  doc.text(WHITEPAPER.tagline, (pageWidth - taglineWidth) / 2, pageHeight / 2);
  doc.setFontSize(SUBTAGLINE_SIZE);
  setTextCol(COLORS.medGray);
  const subTaglineWidth = doc.getTextWidth(WHITEPAPER.subTagline);
  doc.text(WHITEPAPER.subTagline, (pageWidth - subTaglineWidth) / 2, pageHeight / 2 + 18);
  doc.setFont('NotoSans', 'normal');
  doc.setFontSize(BODY_SIZE);
  setTextCol(COLORS.medGray);
  const dateWidth = doc.getTextWidth(WHITEPAPER.date);
  doc.text(WHITEPAPER.date, (pageWidth - dateWidth) / 2, pageHeight / 2 + 45);
  const authorWidth = doc.getTextWidth(meta.author);
  doc.text(meta.author, (pageWidth - authorWidth) / 2, pageHeight / 2 + 65);
  setTextCol(COLORS.snow);
  const urlWidth = doc.getTextWidth(meta.url);
  doc.text(meta.url, (pageWidth - urlWidth) / 2, pageHeight - marginBottom - 20);

  // ── Table of Contents ──
  doc.addPage();
  pageNum++;
  let tocY = marginTop;
  doc.setFont('NotoSans', 'bold');
  doc.setFontSize(HEADING_SIZE + 4);
  setTextCol(COLORS.black);
  doc.text('Table of Contents', marginLeft, tocY);
  tocY += HEADING_LINE_HEIGHT * 2;
  setFill(COLORS.snow);
  doc.rect(marginLeft, tocY - HEADING_LINE_HEIGHT + 4, 100, 2, 'F');
  for (let i = 0; i < WHITEPAPER.sections.length; i++) {
    const section = WHITEPAPER.sections[i];
    if (tocY > pageHeight - marginBottom) break;
    const num = i + 1;
    const entry = `${num}. ${stripNumberPrefix(section.heading)}`;
    doc.setFont('NotoSans', 'normal');
    doc.setFontSize(BODY_SIZE + 1);
    setTextCol(COLORS.black);
    doc.text(entry, marginLeft + 10, tocY);
    tocY += BODY_LINE_HEIGHT * 1.4;
  }

  // ── Content pages ──
  doc.addPage();
  pageNum++;
  cursorY = marginTop;
  let isFirstSection = true;
  WHITEPAPER.sections.forEach((section, idx) => {
    const sectionNumber = idx + 1;
    const heading = `${sectionNumber}. ${stripNumberPrefix(section.heading)}`;
    if (!isFirstSection) {
      doc.addPage();
      pageNum++;
      cursorY = marginTop;
    }
    isFirstSection = false;
    ensureSpace(HEADING_LINE_HEIGHT * 3);
    setFill(COLORS.snow);
    doc.rect(marginLeft - 12, cursorY - 8, 5, 5, 'F');
    doc.setFont('NotoSans', 'bold');
    doc.setFontSize(HEADING_SIZE);
    setTextCol(COLORS.black);
    doc.text(heading, marginLeft, cursorY);
    cursorY += HEADING_LINE_HEIGHT * 1.5;
    let subSectionNum = 0;
    for (const block of section.body) {
      if (typeof block !== 'string') {
        ensureSpace(block.height + BODY_LINE_HEIGHT);
        block.draw({ doc, x: marginLeft, y: cursorY, width: contentWidth });
        cursorY += block.height + BODY_LINE_HEIGHT * 0.5;
        if (block.caption) {
          doc.setFont('NotoSans', 'italic');
          doc.setFontSize(BODY_SIZE - 1);
          doc.setTextColor(COLORS.medGray[0], COLORS.medGray[1], COLORS.medGray[2]);
          const captionLines = doc.splitTextToSize(block.caption, contentWidth);
          doc.text(captionLines, marginLeft, cursorY);
          cursorY += captionLines.length * BODY_LINE_HEIGHT * 0.8 + BODY_LINE_HEIGHT * 0.5;
        }
        continue;
      }
      const paragraph = block as string;
      if (paragraph === '') {
        cursorY += BODY_LINE_HEIGHT * 0.5;
        continue;
      }
      const mdHeadingMatch = paragraph.match(/^##\s+(.+)$/);
      if (mdHeadingMatch) {
        subSectionNum++;
        const subText = `${sectionNumber}.${subSectionNum} ${mdHeadingMatch[1]}`;
        ensureSpace(BODY_LINE_HEIGHT * 2);
        doc.setFont('NotoSans', 'bold');
        doc.setFontSize(BODY_SIZE + 1);
        setTextCol(COLORS.black);
        doc.text(subText, marginLeft + 4, cursorY);
        cursorY += BODY_LINE_HEIGHT * 1.4;
        continue;
      }
      const isBullet = paragraph.startsWith('\u2022');
      const indent = isBullet ? 15 : 0;
      const effectiveWidth = contentWidth - indent;
      doc.setFont('NotoSans', 'normal');
      doc.setFontSize(BODY_SIZE);
      setTextCol(COLORS.black);
      const lines = doc.splitTextToSize(paragraph, effectiveWidth);
      ensureSpace(lines.length * BODY_LINE_HEIGHT + BODY_LINE_HEIGHT);
      for (const line of lines) {
        doc.text(line, marginLeft + indent, cursorY);
        cursorY += BODY_LINE_HEIGHT;
      }
      cursorY += BODY_LINE_HEIGHT * 0.4;
    }
    cursorY += HEADING_LINE_HEIGHT * 0.5;
  });
  addPageFooter(pageNum);

  return doc.output('arraybuffer');
}

export const GET: APIRoute = async () => {
  try {
    const pdfBytes = await generateWhitepaper();
    return new Response(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="snowside-whitepaper-v${meta.version}.pdf"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error generating PDF';
    console.error('[whitepaper] PDF generation failed:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
