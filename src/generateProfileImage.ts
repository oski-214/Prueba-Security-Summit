/**
 * generateProfileImage.ts
 * ─────────────────────────────────────────────────────────────────
 * Renders the user's Security Profile result as a downloadable PNG
 * using the Canvas API. Fully client-side, zero backend.
 *
 * The card is drawn with Microsoft-style colours:
 *   - White card on a soft blue-grey gradient background
 *   - #0078d4 (Microsoft Blue) accents
 *   - Segoe UI typography (falls back to system-ui)
 * ─────────────────────────────────────────────────────────────────
 */

import type { Profile } from "./data/profiles";

/** Palette matching the app's Microsoft design system */
const COLORS = {
  bgGradientStart: "#b4d5f0",
  bgGradientEnd: "#c4b8e8",
  cardBg: "#ffffff",
  primary: "#0078d4",
  text: "#242424",
  textSubtle: "#616161",
  border: "#e0e0e0",
  msRed: "#f25022",
  msGreen: "#7fba00",
  msBlue: "#00a4ef",
  msYellow: "#ffb900",
};

const FONT = '"Segoe UI", system-ui, sans-serif';

// ── Canvas dimensions (optimized for mobile screens / sharing) ──
const W = 720;       // px width
const CARD_PAD = 40; // padding inside the white card
const CARD_MARGIN = 40;
const CARD_W = W - CARD_MARGIN * 2;

/**
 * Word-wrap helper: splits `text` into lines that fit within `maxWidth`
 * at the given font size on the provided canvas context.
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/**
 * Draw the Microsoft four-square logo at (x, y) with given `size`.
 */
function drawMsLogo(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
) {
  const half = size / 2 - 1;
  const gap = 2;
  ctx.fillStyle = COLORS.msRed;
  ctx.fillRect(x, y, half, half);
  ctx.fillStyle = COLORS.msGreen;
  ctx.fillRect(x + half + gap, y, half, half);
  ctx.fillStyle = COLORS.msBlue;
  ctx.fillRect(x, y + half + gap, half, half);
  ctx.fillStyle = COLORS.msYellow;
  ctx.fillRect(x + half + gap, y + half + gap, half, half);
}

/**
 * Renders a section (title + body text) and returns the new Y position.
 */
function drawSection(
  ctx: CanvasRenderingContext2D,
  title: string,
  body: string,
  y: number,
  maxTextW: number
): number {
  // Section title
  ctx.fillStyle = COLORS.text;
  ctx.font = `600 15px ${FONT}`;
  ctx.fillText(title, CARD_MARGIN + CARD_PAD, y);
  y += 20;

  // Section body (word-wrapped)
  ctx.fillStyle = COLORS.textSubtle;
  ctx.font = `14px ${FONT}`;
  const lines = wrapText(ctx, body, maxTextW);
  for (const line of lines) {
    ctx.fillText(line, CARD_MARGIN + CARD_PAD, y);
    y += 20;
  }

  return y + 8; // small spacing after section
}

/**
 * Main export: generates a PNG data-URL of the profile card.
 * Returns a Promise that resolves to the data URL string.
 */
export async function generateProfileImage(
  profile: Profile,
  userName?: string,
  trait?: string
): Promise<string> {
  // ── 1. Pre-compute text to determine dynamic card height ──────
  const canvas = document.createElement("canvas");
  canvas.width = W;
  // Temporary height; we'll resize after measuring text
  canvas.height = 1200;
  const ctx = canvas.getContext("2d")!;
  const maxTextW = CARD_W - CARD_PAD * 2;

  // Measure all sections to compute total height
  ctx.font = `14px ${FONT}`;

  const summaryLines = wrapText(ctx, profile.summary_template, maxTextW);
  const strengthLines = wrapText(ctx, profile.strength_template, maxTextW);
  const blindspotLines = wrapText(ctx, profile.blindspot_template, maxTextW);
  const challengeLines = wrapText(ctx, profile.challenge_template, maxTextW);

  // Calculate card content height
  let contentH = 0;
  contentH += 60;  // top padding + MS logo + header
  contentH += 40;  // profile name
  contentH += 10;  // spacing
  contentH += summaryLines.length * 20 + 16;  // summary
  contentH += 28 + strengthLines.length * 20 + 8;   // strength section
  contentH += 28 + blindspotLines.length * 20 + 8;  // blindspot section
  contentH += 28 + challengeLines.length * 20 + 8;  // challenge section
  if (trait) contentH += 28; // trait line
  contentH += 50;  // product anchor + bottom padding
  contentH += 40;  // footer

  const CARD_H = contentH;
  const H = CARD_MARGIN * 2 + CARD_H;

  // Resize canvas to final dimensions
  canvas.height = H;

  // ── 2. Draw background gradient ──────────────────────────────
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, COLORS.bgGradientStart);
  bgGrad.addColorStop(1, COLORS.bgGradientEnd);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // ── 3. Draw white card with rounded corners ──────────────────
  const cardX = CARD_MARGIN;
  const cardY = CARD_MARGIN;
  const r = 16; // border-radius

  ctx.beginPath();
  ctx.moveTo(cardX + r, cardY);
  ctx.lineTo(cardX + CARD_W - r, cardY);
  ctx.quadraticCurveTo(cardX + CARD_W, cardY, cardX + CARD_W, cardY + r);
  ctx.lineTo(cardX + CARD_W, cardY + CARD_H - r);
  ctx.quadraticCurveTo(cardX + CARD_W, cardY + CARD_H, cardX + CARD_W - r, cardY + CARD_H);
  ctx.lineTo(cardX + r, cardY + CARD_H);
  ctx.quadraticCurveTo(cardX, cardY + CARD_H, cardX, cardY + CARD_H - r);
  ctx.lineTo(cardX, cardY + r);
  ctx.quadraticCurveTo(cardX, cardY, cardX + r, cardY);
  ctx.closePath();

  ctx.fillStyle = COLORS.cardBg;
  ctx.fill();

  // Subtle border
  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = 1;
  ctx.stroke();

  // ── 4. Card content ──────────────────────────────────────────
  let y = cardY + CARD_PAD;
  const textX = cardX + CARD_PAD;

  // Microsoft logo + "Security Summit" header
  drawMsLogo(ctx, textX, y, 20);
  ctx.fillStyle = COLORS.text;
  ctx.font = `600 16px ${FONT}`;
  ctx.fillText("Security Summit", textX + 28, y + 15);
  y += 40;

  // Thin separator line under header
  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(textX, y);
  ctx.lineTo(cardX + CARD_W - CARD_PAD, y);
  ctx.stroke();
  y += 20;

  // Profile title (user name + "tu perfil" or just "Tu perfil")
  ctx.fillStyle = COLORS.text;
  ctx.font = `600 22px ${FONT}`;
  const titleText = userName
    ? `${userName}, tu perfil`
    : "Tu perfil";
  ctx.fillText(titleText, textX, y);
  y += 32;

  // Profile name in Microsoft Blue
  ctx.fillStyle = COLORS.primary;
  ctx.font = `700 20px ${FONT}`;
  ctx.fillText(profile.name, textX, y);
  y += 28;

  // Summary text
  ctx.fillStyle = COLORS.textSubtle;
  ctx.font = `14px ${FONT}`;
  for (const line of summaryLines) {
    ctx.fillText(line, textX, y);
    y += 20;
  }
  y += 12;

  // Sections: Fortaleza, Punto ciego, Reto
  y = drawSection(ctx, "Fortaleza", profile.strength_template, y, maxTextW);
  y = drawSection(ctx, "Punto ciego potencial", profile.blindspot_template, y, maxTextW);
  y = drawSection(ctx, "Reto", profile.challenge_template, y, maxTextW);

  // Trait line (if present)
  if (trait) {
    ctx.fillStyle = COLORS.textSubtle;
    ctx.font = `italic 13px ${FONT}`;
    ctx.fillText(trait, textX, y);
    y += 24;
  }

  // Product anchor footer
  ctx.fillStyle = COLORS.textSubtle;
  ctx.font = `12px ${FONT}`;
  ctx.fillText(`Capacidades representadas: ${profile.product_anchor}`, textX, y);

  // ── 5. Export as PNG data URL ────────────────────────────────
  return canvas.toDataURL("image/png");
}
