/**
 * generateProfileImage.ts
 * ─────────────────────────────────────────────────────────────────
 * Renders the user's Security Profile result as a downloadable PNG
 * using the Canvas API. Fully client-side, zero backend.
 *
 * Layout: integrated horizontal card with banner/orb background,
 * avatar on the right, and text flowing alongside.
 * ─────────────────────────────────────────────────────────────────
 */

import type { Profile } from "./data/profiles";
import { getAvatarUrl, getBannerUrl } from "./data/avatarImages";
import orbImage from "./data/background/orb.png";
import msSecurityLogoSrc from "./data/background/Microsoft-Security-logo-horiz-c-gray-rgb.png";

const COLORS = {
  bgGradientStart: "#1b1b3a",
  bgGradientEnd: "#0f2847",
  cardBg: "#ffffff",
  cardBgAlpha: "rgba(255,255,255,0.92)",
  primary: "#0078d4",
  text: "#242424",
  textLight: "#ffffff",
  textSubtle: "#616161",
  textLightSubtle: "rgba(255,255,255,0.75)",
  border: "#e0e0e0",
  msRed: "#f25022",
  msGreen: "#7fba00",
  msBlue: "#00a4ef",
  msYellow: "#ffb900",
};

const FONT = '"Segoe UI", system-ui, sans-serif';

const W = 1400;
const H_MIN = 800;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
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

function drawMsLogo(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
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

/** Draw rounded rect path (helper) */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * Main export: generates an integrated profile card PNG.
 *
 * Layout when banner exists:
 * ┌─────────────────────────────────────────┐
 * │  [Banner full background]               │
 * │  ┌─ Semi-transparent text panel ──────┐ │
 * │  │ MS logo  Security Summit           │ │
 * │  │ Name, tu perfil                    │ │
 * │  │ Profile name        [Avatar]       │ │
 * │  │ Summary...                         │ │
 * │  │ Fortaleza / Punto ciego / Reto     │ │
 * │  └────────────────────────────────────┘ │
 * └─────────────────────────────────────────┘
 */
export async function generateProfileImage(
  profile: Profile,
  userName?: string,
  trait?: string,
  gender: "male" | "female" = "male"
): Promise<string> {
  // Load images
  const avatarSrc = getAvatarUrl(profile.avatar_style_key, gender);
  const bannerSrc = getBannerUrl(profile.avatar_style_key);

  let avatarImg: HTMLImageElement | null = null;
  let bannerImg: HTMLImageElement | null = null;

  try { avatarImg = await loadImage(avatarSrc); } catch { /* skip */ }
  // Only use the banner for male — the banner image contains the male character.
  // For female, we use the female avatar instead.
  if (bannerSrc && gender === "male") {
    try { bannerImg = await loadImage(bannerSrc); } catch { /* skip */ }
  }

  // ── Measure text to compute dynamic height ──────────────────
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = 2200;
  const ctx = canvas.getContext("2d")!;

  const PAD = 56;
  // Text panel takes ~60% of width, rest is for the avatar
  const panelW = Math.round(W * 0.6);
  const textAreaW = panelW - 76;

  ctx.font = `22px ${FONT}`;
  const summaryLines = wrapText(ctx, profile.summary_template, textAreaW);
  const strengthLines = wrapText(ctx, profile.strength_template, textAreaW);
  const blindspotLines: string[] = []; // Removed from display
  const challengeLines = wrapText(ctx, profile.challenge_template, textAreaW);

  // Calculate needed height
  let textH = 0;
  textH += 56;  // header (logo + Microsoft Security)
  textH += 44;  // separator + spacing
  textH += 46;  // "Name, tu perfil"
  textH += 44;  // profile name
  textH += 12;  // gap
  textH += summaryLines.length * 30 + 20;
  textH += 34 + strengthLines.length * 28 + 10;
  textH += 34 + blindspotLines.length * 28 + 10;
  textH += 34 + challengeLines.length * 28 + 10;
  if (trait) textH += 36;
  textH += 36; // product anchor
  textH += 24; // bottom pad

  const H = Math.max(H_MIN, textH + PAD * 2);
  canvas.height = H;

  // ── 1. Background: same gradient as the app page ────────────
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, "#b4d5f0");
  bgGrad.addColorStop(0.2, "#c9daea");
  bgGrad.addColorStop(0.45, "#dde5ef");
  bgGrad.addColorStop(0.65, "#d5dced");
  bgGrad.addColorStop(0.85, "#bfc8e6");
  bgGrad.addColorStop(1, "#c4b8e8");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // ── 1a. Banner or avatar on the RIGHT ───────────────────────
  if (bannerImg) {
    // Wide banner image (e.g. copilot background) — draw full
    const imgAspect = bannerImg.width / bannerImg.height;
    const drawH = H;
    const drawW = drawH * imgAspect;
    const drawX = W - drawW;
    ctx.drawImage(bannerImg, drawX, 0, drawW, drawH);

    const fadeGrad = ctx.createLinearGradient(W * 0.35, 0, W * 0.65, 0);
    fadeGrad.addColorStop(0, "rgba(255, 255, 255, 1)");
    fadeGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = fadeGrad;
    ctx.fillRect(0, 0, W * 0.65, H);
  } else if (avatarImg) {
    // Avatar image — draw large on the right, preserving aspect ratio
    const imgAspect = avatarImg.width / avatarImg.height;
    const drawH = gender === "female" ? H * 1.02 : H * 1.08;
    const drawW = drawH * imgAspect;
    // Female avatars need more offset to the right (different image proportions)
    const offsetX = gender === "female" ? 230 : 100;
    const avatarX = W - drawW + offsetX;
    const avatarY = H - drawH + 10;
    ctx.drawImage(avatarImg, avatarX, avatarY, drawW, drawH);
  }

  // ── 1b. Orb image on the LEFT (behind the panel) ───────────
  try {
    const orbImg = await loadImage(orbImage);
    const orbSize = H * 0.7;
    const orbX = -orbSize * 0.25;
    const orbY = (H - orbSize) / 2;
    ctx.drawImage(orbImg, orbX, orbY, orbSize, orbSize);
  } catch {
    // Orb fails to load — skip
  }

  // ── 2. Semi-transparent text panel on the left ──────────────
  const panelX = PAD;
  const panelY = PAD;
  const panelH = H - PAD * 2;

  ctx.save();
  roundRect(ctx, panelX, panelY, panelW, panelH, 20);
  ctx.fillStyle = "rgba(255, 255, 255, 0.88)";
  ctx.fill();
  ctx.strokeStyle = "rgba(0, 0, 0, 0.08)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();

  // ── 3. Text content inside the panel ────────────────────────
  const tX = panelX + 38;
  const maxTW = textAreaW;
  let y = panelY + 44;

  // Microsoft Security Summit Madrid 2026 header (text only)
  ctx.fillStyle = COLORS.text;
  ctx.font = `600 22px ${FONT}`;
  ctx.fillText("Microsoft Security Summit Madrid 2026", tX, y + 22);
  y += 50;

  // Thin separator
  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(tX, y);
  ctx.lineTo(tX + maxTW, y);
  ctx.stroke();
  y += 40;

  // Title: "Name, tu perfil"
  ctx.fillStyle = COLORS.text;
  ctx.font = `600 32px ${FONT}`;
  const titleText = userName ? `${userName}, tu perfil` : "Tu perfil";
  ctx.fillText(titleText, tX, y + 4);
  y += 44;

  // Profile name in blue
  ctx.fillStyle = COLORS.primary;
  ctx.font = `700 28px ${FONT}`;
  ctx.fillText(profile.name, tX, y);
  y += 40;

  // Summary
  ctx.fillStyle = COLORS.textSubtle;
  ctx.font = `20px ${FONT}`;
  for (const line of summaryLines) {
    ctx.fillText(line, tX, y);
    y += 28;
  }
  y += 12;

  // Sections
  const drawSmallSection = (title: string, lines: string[]) => {
    ctx.fillStyle = COLORS.text;
    ctx.font = `600 20px ${FONT}`;
    ctx.fillText(title, tX, y);
    y += 28;
    ctx.fillStyle = COLORS.textSubtle;
    ctx.font = `18px ${FONT}`;
    for (const line of lines) {
      ctx.fillText(line, tX, y);
      y += 26;
    }
    y += 6;
  };

  drawSmallSection("Fortaleza", strengthLines);
  drawSmallSection("Tu superpoder", challengeLines);

  // Trait
  if (trait) {
    ctx.fillStyle = COLORS.textSubtle;
    ctx.font = `italic 18px ${FONT}`;
    ctx.fillText(trait, tX, y);
    y += 30;
  }

  // Product anchor
  ctx.fillStyle = COLORS.textSubtle;
  ctx.font = `16px ${FONT}`;
  ctx.fillText(`Capacidades representadas: ${profile.product_anchor}`, tX, y);

  // ── 5. Export as JPEG ──────────────────────────────────────
  return canvas.toDataURL("image/jpeg", 0.92);
}
