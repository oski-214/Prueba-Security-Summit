/**
 * avatarImages.ts
 * ─────────────────────────────────────────────────────────────────
 * Maps each profile's avatar_style_key to the corresponding avatar
 * image imports. Vite handles these as static assets (hashed URLs).
 *
 * Male avatars are used by default. Both sets are exported so the
 * app can switch if a gender selector is added later.
 * ─────────────────────────────────────────────────────────────────
 */

import type { Profile } from "./profiles";

// ── Male avatar imports ──
import defenderM from "./maleAvatars/defender_new.png";
import sentinelM from "./maleAvatars/sentinel_new.png";
import entraM from "./maleAvatars/entra_new.png";
import purviewM from "./maleAvatars/purview_new.png";
import copilotM from "./maleAvatars/copilot_new.png";

// ── Female avatar imports ──
import defenderF from "./femaleAvatars/defender_new.png";
import sentinelF from "./femaleAvatars/sentinel_new.png";
import entraF from "./femaleAvatars/entra_new.png";
import purviewF from "./femaleAvatars/purview_new.png";
import copilotF from "./femaleAvatars/copilot_new.png";

export const MALE_AVATARS: Record<Profile["avatar_style_key"], string> = {
  defender: defenderM,
  sentinel: sentinelM,
  entra: entraM,
  purview: purviewM,
  copilot: copilotM,
};

export const FEMALE_AVATARS: Record<Profile["avatar_style_key"], string> = {
  defender: defenderF,
  sentinel: sentinelF,
  entra: entraF,
  purview: purviewF,
  copilot: copilotF,
};

/** Get the avatar URL for a profile, given a gender preference */
export function getAvatarUrl(
  key: Profile["avatar_style_key"],
  gender: "male" | "female" = "male"
): string {
  return gender === "female" ? FEMALE_AVATARS[key] : MALE_AVATARS[key];
}

/**
 * Banner images: wide horizontal images used as card header.
 * Currently none — all profiles use the standard avatar layout.
 */
const BANNERS: Partial<Record<Profile["avatar_style_key"], string>> = {
  // Add wide panoramic banners here if needed in the future
};

/** Get the banner URL for a profile, or undefined if none exists */
export function getBannerUrl(key: Profile["avatar_style_key"]): string | undefined {
  return BANNERS[key];
}
