import React, { useEffect, useState, useCallback } from "react";
import { PROFILES } from "./data/profiles";
import { selectRandomQuestions } from "./data/questions";
import {
  Answer,
  Gender,
  SessionState,
  Step,
  TraitId,
  computeResult,
  createEmptySessionState
} from "./state";
import { Avatar } from "./components/Avatar";
import { getBannerUrl } from "./data/avatarImages";
import { generateProfileImage } from "./generateProfileImage";
import maleAvatar from "./data/maleAvatars/male_avatar.png";
import maleAvatarSelected from "./data/maleAvatars/male_avatar_selected.png";
import femaleAvatar from "./data/femaleAvatars/female_avatar.png";
import femaleAvatarSelected from "./data/femaleAvatars/female_avatar_selected.png";
import msSecurityLogo from "./data/background/Microsoft-Security-logo-horiz-c-gray-rgb.png";
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
      // Validate the session has the new `questions` field;
      // old sessions without it are discarded to avoid broken state.
      if (parsed && Array.isArray(parsed.questions)) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  // Clear stale data and start fresh
  try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
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
  const [pendingGender, setPendingGender] = useState<Gender | null>(null);
  const [hoveredGender, setHoveredGender] = useState<Gender | null>(null);

  // -- Slide transition state --
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [prevStep, setPrevStep] = useState<Step | null>(null);

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
    if (state.step === "scenario" && state.questions.length > 0) {
      const question = state.questions[state.scenarioIndex];
      const existing = state.answers.find(
        (a) => a.scenarioId === question.id
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
        traitText,
        state.gender
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
      shareParams.set("g", state.gender);
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
    link.download = `security-profile-${state?.userName || "result"}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [profileImageUrl, state?.userName]);

  // Auto-generate the profile image when arriving at the result step
  useEffect(() => {
    if (!state || state.step !== "result" || !state.result) return;
    if (profileImageUrl || isGenerating) return;
    handleGenerateShare();
  }, [state?.step, state?.result, profileImageUrl, isGenerating, handleGenerateShare]);

  // ── Early return: nothing to render until state is loaded ──
  if (!state) {
    return null;
  }

  const profile =
    state.result &&
    (PROFILES.find((p) => p.profile_id === state.result.profileId) ??
      PROFILES[0]);

  const currentQuestion =
    state.step === "scenario" && state.questions.length > 0
      ? state.questions[state.scenarioIndex]
      : null;

  const totalQuestions = state.questions.length;

  /** Navigate between steps with a fade-out / fade-in transition */
  const handleGoToStep = (step: Step) => {
    if (isTransitioning) return;
    setPrevStep(state.step);
    setIsTransitioning(true);
    // After exit animation completes, switch to new step
    setTimeout(() => {
      setState((prev) => (prev ? { ...prev, step } : prev));
      setIsTransitioning(false);
      setPrevStep(null);
    }, 250); // matches CSS exit animation duration
  };

  const handleStart = () => {
    if (isTransitioning) return;
    const newSessionId = createSessionId();
    const fresh: SessionState = {
      ...createEmptySessionState(newSessionId),
      step: "landing", // will transition to "name"
      questions: selectRandomQuestions(),
    };
    setPendingName("");
    setPendingGender(null);
    setHoveredGender(null);
    setState(fresh);
    // Transition to name step
    setPrevStep("landing");
    setIsTransitioning(true);
    setTimeout(() => {
      setState((prev) => prev ? { ...prev, step: "name" } : prev);
      setIsTransitioning(false);
      setPrevStep(null);
    }, 250);
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
            gender: pendingGender || "male",
          }
        : prev
    );
    handleGoToStep("brief");
  };

  const handleSkipName = () => {
    setPendingName("");
    setState((prev) =>
      prev
        ? {
            ...prev,
            userName: undefined,
            gender: pendingGender || "male",
          }
        : prev
    );
    handleGoToStep("brief");
  };

  const handleSelectOption = (optionId: string) => {
    if (!currentQuestion) return;
    setSelectedOption(optionId);
  };

  const handleNextScenario = () => {
    if (!currentQuestion || !selectedOption || isAdvancing) return;

    setIsAdvancing(true);
    setTimeout(() => setIsAdvancing(false), 300);

    setState((prev) => {
      if (!prev) return prev;
      const now = Date.now();
      const filtered = prev.answers.filter(
        (a) => a.scenarioId !== currentQuestion.id
      );
      const updatedAnswers: Answer[] = [
        ...filtered,
        {
          scenarioId: currentQuestion.id,
          optionId: selectedOption as any,
          ts: now
        }
      ];

      const isLast = prev.scenarioIndex === prev.questions.length - 1;

      if (isLast) {
        const nextState: SessionState = {
          ...prev,
          answers: updatedAnswers,
          step: "computing"
        };

        setTimeout(() => {
          setState((current) => {
            if (!current) return current;
            const result = computeResult(updatedAnswers, current.sessionId, current.questions);
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
    newSession.questions = selectRandomQuestions();
    setProfileImageUrl(null);
    setQrCodeUrl(null);
    setPendingName("");
    setPendingGender(null);
    setHoveredGender(null);
    setState(newSession);
  };

  return (
    <div className="app-root">
      <main className="shell">
        {/* Microsoft-branded header for Security Summit */}
        <header className="app-header">
          <img
            src={msSecurityLogo}
            alt="Microsoft Security"
            className="header-logo"
          />
          <div className="app-subtitle">
            3 preguntas de seguridad. 1 minuto.
          </div>
        </header>

        <section className={`screen-container ${isTransitioning ? "screen-exiting" : ""}`}>
          {state.step === "landing" && (
            <div className="screen screen-visible">
              <div className="card">
                <h2 className="screen-title">Tu perfil en seguridad</h2>
                <p className="screen-body">
                  Quiz rápido de seguridad: responde 3 preguntas y descubre
                  tu perfil.
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
                  <div className="progress-label">Preguntas 0/{totalQuestions}</div>
                  <div className="progress-bar">
                    <div
                      className="progress-bar-fill"
                      style={{ width: "0%" }}
                    />
                  </div>
                </div>
                <h2 className="screen-title">Antes de empezar</h2>
                <ul className="brief-list">
                  <li>3 preguntas de opción múltiple.</li>
                  <li>Solo una respuesta es correcta.</li>
                  <li>
                    Tu perfil se asigna según tus aciertos en cada área.
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
              <div className="card card-name">
                {/* Avatar selector: both avatars side by side at the top */}
                <div className="avatar-selector">
                  <button
                    type="button"
                    className={`avatar-pick ${
                      pendingGender === "male" ? "avatar-pick-selected" : ""
                    } ${pendingGender === "female" ? "avatar-pick-dimmed" : ""}`}
                    onClick={() => setPendingGender("male")}
                    onMouseEnter={() => setHoveredGender("male")}
                    onMouseLeave={() => setHoveredGender(null)}
                  >
                    <img
                      src={pendingGender === "male" || hoveredGender === "male" ? maleAvatarSelected : maleAvatar}
                      alt="Avatar masculino"
                      className="avatar-pick-img"
                    />
                  </button>
                  <button
                    type="button"
                    className={`avatar-pick avatar-pick-female ${
                      pendingGender === "female" ? "avatar-pick-selected" : ""
                    } ${pendingGender === "male" ? "avatar-pick-dimmed" : ""}`}
                    onClick={() => setPendingGender("female")}
                    onMouseEnter={() => setHoveredGender("female")}
                    onMouseLeave={() => setHoveredGender(null)}
                  >
                    <img
                      src={pendingGender === "female" || hoveredGender === "female" ? femaleAvatarSelected : femaleAvatar}
                      alt="Avatar femenino"
                      className="avatar-pick-img"
                    />
                  </button>
                  {/* Bottom fade that blends avatars into the card */}
                  <div className="avatar-selector-fade" />
                </div>

                <div className="name-section">
                  <h2 className="screen-title">Elige tu avatar</h2>
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
                </div> {/* end name-section */}
              </div>
            </div>
          )}

          {state.step === "scenario" && currentQuestion && (
            <div className="screen screen-visible">
              <div className="card">
                <div className="progress">
                  <div className="progress-label">
                    Pregunta {state.scenarioIndex + 1}/{totalQuestions}
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${(state.scenarioIndex / totalQuestions) * 100}%`
                      }}
                    />
                  </div>
                </div>
                <p className="scenario-step">
                  Pregunta {state.scenarioIndex + 1} de {totalQuestions}
                </p>
                <h2 className="screen-title">{currentQuestion.question}</h2>

                <div className="options-grid">
                  {currentQuestion.options.map((option) => {
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
                {/* Show the generated profile image as the result card */}
                {profileImageUrl ? (
                  <div className="share-preview">
                    <img
                      src={profileImageUrl}
                      alt="Tu perfil de seguridad"
                      className="share-preview-img"
                    />
                  </div>
                ) : (
                  <div className="card-centered">
                    <div className="loader" aria-hidden="true" />
                    <p className="screen-body computing-text">
                      Generando tu perfil…
                    </p>
                  </div>
                )}

                {/* Actions: download as image / QR or restart */}
                <div className="result-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      setQrCodeUrl(null);
                      handleGoToStep("share");
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

