import React, { useEffect, useState } from "react";
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
      step: "brief"
    };
    setState(fresh);
  };

  const handleContinueFromBrief = () => {
    handleGoToStep("scenario");
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
            const result = computeResult(updatedAnswers);
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
        <header className="app-header">
          <div className="app-brand">
            <span className="brand-dot" />
            <span className="brand-title">Tu perfil en seguridad</span>
          </div>
          <div className="app-subtitle">
            Decisiones rápidas en 5 situaciones. 3 minutos.
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
                  <div className="progress-label">Situaciones 0/5</div>
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
                <h2 className="screen-title">Tu perfil</h2>
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

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleReset}
                >
                  Repetir
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

