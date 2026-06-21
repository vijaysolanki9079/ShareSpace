/**
 * Generates ShareSpace-Work-Updates.docx in docs/work-updates.
 * Run: npm run guide:docx
 * Requires: npm package `docx` (present in node_modules from project install).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  TableLayoutType,
} from "docx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..', '..');
const docsDir = path.join(projectRoot, 'docs', 'work-updates');

const DATE_STR = "Saturday, April 4, 2026";

function headerTable() {
  return new Table({
    layout: TableLayoutType.FIXED,
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [5000, 5000],
    borders: {
      top: { style: "none", size: 0, color: "FFFFFF" },
      bottom: { style: "none", size: 0, color: "FFFFFF" },
      left: { style: "none", size: 0, color: "FFFFFF" },
      right: { style: "none", size: 0, color: "FFFFFF" },
      insideHorizontal: { style: "none", size: 0, color: "FFFFFF" },
      insideVertical: { style: "none", size: 0, color: "FFFFFF" },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            margins: { top: 80, bottom: 80 },
            borders: {
              top: { style: "none", size: 0, color: "FFFFFF" },
              bottom: { style: "none", size: 0, color: "FFFFFF" },
              left: { style: "none", size: 0, color: "FFFFFF" },
              right: { style: "none", size: 0, color: "FFFFFF" },
            },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Work updates",
                    bold: true,
                    size: 36,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            margins: { top: 80, bottom: 80 },
            borders: {
              top: { style: "none", size: 0, color: "FFFFFF" },
              bottom: { style: "none", size: 0, color: "FFFFFF" },
              left: { style: "none", size: 0, color: "FFFFFF" },
              right: { style: "none", size: 0, color: "FFFFFF" },
            },
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: DATE_STR,
                    bold: true,
                    size: 24,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function parseMarkdownishBody(raw) {
  const lines = raw.split(/\r?\n/);
  /** @type {import('docx').Paragraph[]} */
  const out = [];
  let i = 0;
  let paraBuf = [];

  function flushPara() {
    const t = paraBuf.join("\n").trim();
    paraBuf = [];
    if (t)
      out.push(
        new Paragraph({
          children: [new TextRun({ text: t })],
        }),
      );
  }

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === "") {
      flushPara();
      i++;
      continue;
    }

    if (trimmed.startsWith("```")) {
      flushPara();
      i++;
      const code = [];
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        code.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++;
      const codeText = code.join("\n").trimEnd();
      if (codeText)
        out.push(
          new Paragraph({
            shading: { fill: "F5F5F5" },
            children: [
              new TextRun({
                text: codeText,
                font: "Consolas",
                size: 20,
              }),
            ],
          }),
        );
      continue;
    }

    if (trimmed.startsWith("### ")) {
      flushPara();
      out.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 120, after: 80 },
          children: [new TextRun({ text: trimmed.slice(4) })],
        }),
      );
      i++;
      continue;
    }
    if (trimmed.startsWith("## ")) {
      flushPara();
      out.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
          children: [new TextRun({ text: trimmed.slice(3) })],
        }),
      );
      i++;
      continue;
    }
    if (trimmed.startsWith("# ")) {
      flushPara();
      out.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 },
          children: [new TextRun({ text: trimmed.slice(2) })],
        }),
      );
      i++;
      continue;
    }

    paraBuf.push(line);
    i++;
  }
  flushPara();
  return out;
}

const preferredBodyPath = path.join(docsDir, "work-updates-body.txt");
const fallbackBodyPath = path.join(docsDir, "REPO_AUDIT_SUMMARY.md");
const bodyPath = fs.existsSync(preferredBodyPath) ? preferredBodyPath : fallbackBodyPath;
const raw = fs.readFileSync(bodyPath, "utf8");
const bodyChildren = parseMarkdownishBody(raw);

const doc = new Document({
  sections: [
    {
      properties: {},
      children: [
        headerTable(),
        new Paragraph({ text: "" }),
        ...bodyChildren,
      ],
    },
  ],
});

const outPath = path.join(docsDir, "ShareSpace-Work-Updates.docx");
const buffer = await Packer.toBuffer(doc);
fs.writeFileSync(outPath, buffer);
console.log("Wrote", outPath);
