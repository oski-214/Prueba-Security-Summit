/**
 * DownloadView.tsx
 * ─────────────────────────────────────────────────────────────────
 * Standalone view shown when the app is opened via a QR code URL.
 *
 * The URL contains query params with the user's profile result:
 *   ?p=PROFILE_ID&n=UserName&t=TRAIT_ID
 *
 * This component:
 *   1. Reads the params from the URL
 *   2. Generates the profile card image (PNG via Canvas)
 *   3. Shows the image with a "Download" button
 *
 * Fully client-side — no backend needed.
 * ─────────────────────────────────────────────────────────────────
 */

import React, { useEffect, useState } from "react";
import { PROFILES } from "./data/profiles";
import type { ProfileId } from "./data/profiles";
import type { TraitId } from "./state";
import { generateProfileImage } from "./generateProfileImage";

/** Map trait IDs to their display labels */
const TRAIT_LABELS: Record<TraitId, string> = {
  IMPULSOR: "Rasgo predominante: tiendes a impulsar acción temprana.",
  ANALITICO: "Rasgo predominante: analizas en profundidad antes de decidir.",
  ORQUESTADOR: "Rasgo predominante: orquestas actores y decisiones de forma coordinada.",
  EQUILIBRADO: "",
};

/**
 * Parse URL search params and return profile data, or null if invalid.
 */
function parseShareParams(): {
  profileId: ProfileId;
  userName?: string;
  trait?: TraitId;
  gender: "male" | "female";
} | null {
  const params = new URLSearchParams(window.location.search);
  const profileId = params.get("p") as ProfileId | null;
  if (!profileId) return null;

  const profile = PROFILES.find((pr) => pr.profile_id === profileId);
  if (!profile) return null;

  const userName = params.get("n") || undefined;
  const trait = (params.get("t") as TraitId) || undefined;
  const gender = params.get("g") === "female" ? "female" as const : "male" as const;

  return { profileId, userName, trait, gender };
}

/**
 * Check if the current URL has share params (?p=...).
 * Used by main.tsx to decide which component to render.
 */
export function hasShareParams(): boolean {
  return new URLSearchParams(window.location.search).has("p");
}

export const DownloadView: React.FC = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const shareData = parseShareParams();
  const profile = shareData
    ? PROFILES.find((pr) => pr.profile_id === shareData.profileId)
    : null;

  useEffect(() => {
    if (!shareData || !profile) {
      setError(true);
      setLoading(false);
      return;
    }

    // Generate the profile card image from the URL params
    const traitText = shareData.trait
      ? TRAIT_LABELS[shareData.trait] || undefined
      : undefined;

    generateProfileImage(profile, shareData.userName, traitText, shareData.gender)
      .then((dataUrl) => {
        setImageUrl(dataUrl);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Download the image as a PNG file */
  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `security-profile-${shareData?.userName || "result"}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /** Navigate to the main app (remove query params) */
  const handleGoToApp = () => {
    window.location.href = window.location.origin + window.location.pathname;
  };

  return (
    <div className="app-root">
      <main className="shell">
        <section className="screen-container">
          <div className="screen screen-visible">
            <div className="card">
              {loading ? (
                /* Loading state */
                <div className="card-centered">
                  <div className="loader" aria-hidden="true" />
                  <p className="screen-body computing-text">
                    Generando tu imagen…
                  </p>
                </div>
              ) : error || !imageUrl ? (
                /* Error / invalid params */
                <div className="card-centered">
                  <p className="screen-title">Enlace no válido</p>
                  <p className="screen-body">
                    Este enlace no contiene un perfil válido.
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleGoToApp}
                  >
                    Ir al inicio
                  </button>
                </div>
              ) : (
                /* Success: show image + download */
                <div className="share-content">
                  <h2 className="screen-title" style={{ textAlign: "center" }}>
                    {shareData?.userName
                      ? `${shareData.userName}, tu perfil`
                      : "Tu perfil de seguridad"}
                  </h2>

                  {profile && (
                    <p
                      className="screen-body"
                      style={{ textAlign: "center", marginBottom: 8 }}
                    >
                      {profile.name} — {profile.product_anchor}
                    </p>
                  )}

                  {/* Profile card image preview */}
                  <div className="share-preview">
                    <img
                      src={imageUrl}
                      alt="Tu perfil de seguridad"
                      className="share-preview-img"
                    />
                  </div>

                  {/* Download + go to app buttons */}
                  <div className="result-actions">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleDownload}
                    >
                      Descargar imagen
                    </button>
                  </div>

                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={handleGoToApp}
                    style={{ marginTop: 8, width: "100%" }}
                  >
                    Descubre tu perfil
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
