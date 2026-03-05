import React, { useEffect, useState, useCallback } from "react";
import { SCENARIOS } from "./data/scenarios";
import { PROFILES } from "./data/profiles";
import {
  Answer,
  SessionState,
  Step,
  TraitId,
  computeResult,
  createEmptySessionState
} from "./state";
import { Avatar } from "./components/Avatar";
import { generateProfileImage } from "./generateProfileImage";
import QRCode from "qrcode";

const STORAGE_KEY = "security-profile-session";

const createSessionId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "session-" + Math.random().toString(36).slice(2) + Date.now();
};

const loadInitialState = (): SessionState => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as SessionState;
      return parsed;
    }
  } catch {
    // ignore
  }
  return createEmptySessionState(createSessionId());
};

const traitLabel = (trait?: TraitId): string | undefined => {
  switch (trait) {
    case "IMPULSOR":
      return "Rasgo predominante: tiendes a impulsar acción temprana.";
    case "ANALITICO":
      return "Rasgo predominante: analizas en profundidad antes de decidir.";
    case "ORQUESTADOR":
      return "Rasgo predominante: orquestas actores y decisiones de forma coordinada.";
    case "EQUILIBRADO":
    default:
      return undefined;
  }
};

export const App: React.FC = () => {
  const [state, setState] = useState<SessionState | null>(null);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [pendingName, setPendingName] = useState("");

  // -- Share step state: generated profile image + QR code --
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setState(loadInitialState());
  }, []);

  useEffect(() => {
    if (!state) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state]);

  useEffect(() => {
    if (!state) return;
    if (state.step === "scenario") {
      const scenario = SCENARIOS[state.scenarioIndex];
      const existing = state.answers.find(
        (a) => a.scenarioId === scenario.scenario_id
      );
      setSelectedOption(existing?.optionId ?? null);
    } else {
      setSelectedOption(null);
    }
  }, [state]);

  /**
   * Generate the profile card image and a QR code that triggers its download.
   * Both are created as data URLs — fully client-side, no backend.
   */
  const handleGenerateShare = useCallback(async () => {
    if (!state?.result || isGenerating) return;

    const prof = PROFILES.find((p) => p.profile_id === state.result!.profileId) ?? PROFILES[0];

    setIsGenerating(true);
    try {
      // 1. Render the result card to a PNG data-URL via Canvas
      const traitText = traitLabel(state.result.trait);
      const imageDataUrl = await generateProfileImage(
        prof,
        state.userName,
        traitText
      );
      setProfileImageUrl(imageDataUrl);

      // 2. Build a URL pointing to this same app with query params.
      //    When scanned, the app opens in DownloadView mode, regenerates
      //    the image on-the-fly, and offers a download button.
      //    Params: p = profileId, n = userName, t = trait
      const baseUrl = window.location.origin + window.location.pathname;
      const shareParams = new URLSearchParams();
      shareParams.set("p", state.result!.profileId);
      if (state.userName) shareParams.set("n", state.userName);
      if (state.result!.trait) shareParams.set("t", state.result!.trait);
      const shareUrl = `${baseUrl}?${shareParams.toString()}`;

      const qrDataUrl = await QRCode.toDataURL(shareUrl, {
        width: 200,
        margin: 2,
        color: { dark: "#242424", light: "#ffffff" },
      });
      setQrCodeUrl(qrDataUrl);
    } catch (err) {
      console.error("Error generating share assets:", err);
    } finally {
      setIsGenerating(false);
    }
  }, [state, isGenerating]);

  /**
   * Trigger a file download of the generated PNG image.
   * Creates a temporary <a> element with download attribute.
   */
  const handleDownloadImage = useCallback(() => {
    if (!profileImageUrl) return;
    const link = document.createElement("a");
    link.href = profileImageUrl;
    link.download = `security-profile-${state?.userName || "result"}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [profileImageUrl, state?.userName]);

  // ── Early return: nothing to render until state is loaded ──
  if (!state) {
    return null;
  }

  const profile =
    state.result &&
    (PROFILES.find((p) => p.profile_id === state.result.profileId) ??
      PROFILES[0]);

  const currentScenario =
    state.step === "scenario" ? SCENARIOS[state.scenarioIndex] : null;

  const handleGoToStep = (step: Step) => {
    setState((prev) => (prev ? { ...prev, step } : prev));
  };

  const handleStart = () => {
    const newSessionId = createSessionId();
    const fresh: SessionState = {
      ...createEmptySessionState(newSessionId),
      step: "name"
    };
    setPendingName("");
    setState(fresh);
  };

  const handleContinueFromBrief = () => {
    handleGoToStep("scenario");
  };

  const handleConfirmName = () => {
    setState((prev) =>
      prev
        ? {
            ...prev,
            userName: pendingName.trim().slice(0, 24) || undefined,
            step: "brief"
          }
        : prev
    );
  };

  const handleSkipName = () => {
    setPendingName("");
    setState((prev) =>
      prev
        ? {
            ...prev,
            userName: undefined,
            step: "brief"
          }
        : prev
    );
  };

  const handleSelectOption = (optionId: string) => {
    if (!currentScenario) return;
    setSelectedOption(optionId);
  };

  const handleNextScenario = () => {
    if (!currentScenario || !selectedOption || isAdvancing) return;

    setIsAdvancing(true);
    setTimeout(() => setIsAdvancing(false), 300);

    setState((prev) => {
      if (!prev) return prev;
      const now = Date.now();
      const filtered = prev.answers.filter(
        (a) => a.scenarioId !== currentScenario.scenario_id
      );
      const updatedAnswers: Answer[] = [
        ...filtered,
        {
          scenarioId: currentScenario.scenario_id,
          optionId: selectedOption as any,
          ts: now
        }
      ];

      const isLast = prev.scenarioIndex === SCENARIOS.length - 1;

      if (isLast) {
        const nextState: SessionState = {
          ...prev,
          answers: updatedAnswers,
          step: "computing"
        };

        setTimeout(() => {
          setState((current) => {
            if (!current) return current;
            const result = computeResult(updatedAnswers, current.sessionId);
            return {
              ...current,
              answers: updatedAnswers,
              score: result.score,
              result,
              step: "result"
            };
          });
        }, 1000);

        return nextState;
      }

      return {
        ...prev,
        answers: updatedAnswers,
        scenarioIndex: prev.scenarioIndex + 1
      };
    });
  };

  const handlePrevScenario = () => {
    if (state.scenarioIndex === 0) return;
    setState((prev) =>
      prev
        ? {
            ...prev,
            scenarioIndex: prev.scenarioIndex - 1
          }
        : prev
    );
  };

  const handleReset = () => {
    const newSession = createEmptySessionState(createSessionId());
    setState(newSession);
  };

  const answeredCount = state.answers.length;

  return (
    <div className="app-root">
      <main className="shell">
        {/* Microsoft-branded header for Security Summit */}
        <header className="app-header">
          <div className="app-brand">
            {/* Microsoft four-square logo */}
            <svg className="ms-logo" viewBox="0 0 21 21" aria-hidden="true">
              <rect x="0" y="0" width="10" height="10" fill="#f25022" />
              <rect x="11" y="0" width="10" height="10" fill="#7fba00" />
              <rect x="0" y="11" width="10" height="10" fill="#00a4ef" />
              <rect x="11" y="11" width="10" height="10" fill="#ffb900" />
            </svg>
            <span className="brand-title">Security Summit</span>
          </div>
          <div className="app-subtitle">
            Decisiones rápidas en 3 situaciones. 3 minutos.
          </div>
        </header>

        <section className="screen-container">
          {state.step === "landing" && (
            <div className="screen screen-visible">
              <div className="card">
                <h2 className="screen-title">Tu perfil en seguridad</h2>
                <p className="screen-body">
                  Simulación breve para explorar cómo decides en situaciones de
                  seguridad reales.
                </p>
                <button
                  className="btn btn-primary"
                  onClick={handleStart}
                  type="button"
                >
                  Empezar
                </button>
                <p className="microcopy">
                  No guardamos datos personales. Respuestas anónimas.
                </p>
              </div>
            </div>
          )}

          {state.step === "brief" && (
            <div className="screen screen-visible">
              <div className="card">
                <div className="progress">
                  <div className="progress-label">Situaciones 0/3</div>
                  <div className="progress-bar">
                    <div
                      className="progress-bar-fill"
                      style={{ width: "0%" }}
                    />
                  </div>
                </div>
                <h2 className="screen-title">Antes de empezar</h2>
                <ul className="brief-list">
                  <li>No hay respuestas correctas.</li>
                  <li>Elige lo que harías primero, con información incompleta.</li>
                  <li>
                    Responde pensando en tu entorno real, no en el ideal.
                  </li>
                </ul>
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={handleContinueFromBrief}
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {state.step === "name" && (
            <div className="screen screen-visible">
              <div className="card">
                <h2 className="screen-title">Antes de empezar</h2>
                <p className="screen-body">
                  ¿Cómo te llamas? Lo usaremos solo para personalizar tu
                  resultado.
                </p>
                <div className="name-field">
                  <label className="name-label" htmlFor="user-name-input">
                    ¿Cómo te llamas?
                  </label>
                  <input
                    id="user-name-input"
                    className="name-input"
                    type="text"
                    placeholder="Nombre (opcional)"
                    maxLength={24}
                    value={pendingName}
                    onChange={(e) => setPendingName(e.target.value)}
                  />
                  <p className="name-helper">
                    Lo usaremos solo para personalizar tu resultado.
                  </p>
                </div>
                <div className="scenario-actions">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={handleSkipName}
                  >
                    Saltar
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleConfirmName}
                  >
                    Continuar
                  </button>
                </div>
              </div>
            </div>
          )}

          {state.step === "scenario" && currentScenario && (
            <div className="screen screen-visible">
              <div className="card">
                <div className="progress">
                  <div className="progress-label">
                    Situaciones {answeredCount}/{SCENARIOS.length}
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${(state.scenarioIndex / SCENARIOS.length) * 100}%`
                      }}
                    />
                  </div>
                </div>
                <p className="scenario-step">
                  Situación {state.scenarioIndex + 1} de {SCENARIOS.length}
                </p>
                <h2 className="screen-title">{currentScenario.title}</h2>
                <p className="screen-body">{currentScenario.context}</p>
                <p className="scenario-question">
                  <span className="scenario-question-label">
                    ¿Qué haces primero?
                  </span>
                </p>

                <div className="options-grid">
                  {currentScenario.options.map((option) => {
                    const selected = selectedOption === option.option_id;
                    return (
                      <button
                        key={option.option_id}
                        type="button"
                        className={`option-card ${
                          selected ? "option-card-selected" : ""
                        }`}
                        onClick={() =>
                          handleSelectOption(option.option_id)
                        }
                      >
                        <span className="option-badge">
                          {option.option_id}
                        </span>
                        <span className="option-label">{option.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="scenario-actions">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={handlePrevScenario}
                    disabled={state.scenarioIndex === 0}
                  >
                    Atrás
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleNextScenario}
                    disabled={!selectedOption || isAdvancing}
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </div>
          )}

          {state.step === "computing" && (
            <div className="screen screen-visible">
              <div className="card card-centered">
                <div className="loader" aria-hidden="true" />
                <p className="screen-body computing-text">
                  Generando tu perfil…
                </p>
              </div>
            </div>
          )}

          {state.step === "result" && state.result && profile && (
            <div className="screen screen-visible">
              <div className="card">
                <h2 className="screen-title">
                  {state.userName
                    ? `${state.userName}, tu perfil`
                    : "Tu perfil"}
                </h2>
                <Avatar profile={profile} />
                <h3 className="profile-name">{profile.name}</h3>
                <p className="screen-body">{profile.summary_template}</p>

                <div className="result-section">
                  <h4>Fortaleza</h4>
                  <p>{profile.strength_template}</p>
                </div>

                <div className="result-section">
                  <h4>Punto ciego potencial</h4>
                  <p>{profile.blindspot_template}</p>
                </div>

                <div className="result-section">
                  <h4>Reto</h4>
                  <p>{profile.challenge_template}</p>
                </div>

                {traitLabel(state.result.trait) && (
                  <p className="trait-line">
                    {traitLabel(state.result.trait)}
                  </p>
                )}

                <p className="microcopy microcopy-anchor">
                  Capacidades representadas: {profile.product_anchor}.
                </p>

                {/* Actions: download as image / QR or restart */}
                <div className="result-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      // Navigate to share step and generate image + QR
                      setProfileImageUrl(null);
                      setQrCodeUrl(null);
                      handleGoToStep("share");
                      // Start generation after navigating
                      setTimeout(() => handleGenerateShare(), 50);
                    }}
                  >
                    Descargar resultado
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={handleReset}
                  >
                    Repetir
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Share step: QR code + downloadable image ── */}
          {state.step === "share" && state.result && profile && (
            <div className="screen screen-visible">
              <div className="card">
                <h2 className="screen-title">Tu resultado</h2>

                {isGenerating ? (
                  /* Loading state while canvas renders */
                  <div className="card-centered">
                    <div className="loader" aria-hidden="true" />
                    <p className="screen-body computing-text">
                      Generando imagen…
                    </p>
                  </div>
                ) : profileImageUrl && qrCodeUrl ? (
                  /* Generated: show preview, QR, and download button */
                  <div className="share-content">
                    {/* Small preview of the generated profile card */}
                    <div className="share-preview">
                      <img
                        src={profileImageUrl}
                        alt="Tu perfil de seguridad"
                        className="share-preview-img"
                      />
                    </div>

                    {/* QR code — scan to open/download the image */}
                    <div className="share-qr">
                      <img
                        src={qrCodeUrl}
                        alt="Código QR para descargar tu perfil"
                        className="share-qr-img"
                      />
                      <p className="share-qr-hint">
                        Escanea para descargar tu perfil
                      </p>
                    </div>

                    {/* Direct download button */}
                    <div className="result-actions">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleDownloadImage}
                      >
                        Descargar imagen
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => handleGoToStep("result")}
                      >
                        Volver
                      </button>
                    </div>

                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={handleReset}
                      style={{ marginTop: 8, width: "100%" }}
                    >
                      Empezar de nuevo
                    </button>
                  </div>
                ) : (
                  /* Error fallback */
                  <div className="card-centered">
                    <p className="screen-body">
                      No se pudo generar la imagen. Inténtalo de nuevo.
                    </p>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleGenerateShare}
                    >
                      Reintentar
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

