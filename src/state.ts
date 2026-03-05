import type { OptionId } from "./data/scenarios";
import type { ProfileId, ScoreVector } from "./data/profiles";
import { SCENARIOS } from "./data/scenarios";
import { PROFILE_PROTOTYPES } from "./data/profiles";

export type Step =
  | "landing"
  | "name"
  | "brief"
  | "scenario"
  | "computing"
  | "result";

export type Answer = {
  scenarioId: string;
  optionId: OptionId;
  ts: number;
};

export type TraitId = "IMPULSOR" | "ANALITICO" | "ORQUESTADOR" | "EQUILIBRADO";

export type SessionResult = {
  profileId: ProfileId;
  trait?: TraitId;
  score: ScoreVector;
};

export type SessionState = {
  sessionId: string;
  userName?: string;
  step: Step;
  scenarioIndex: number;
  answers: Answer[];
  score: ScoreVector;
  result?: SessionResult;
};

const SCORE_UI_MIN = -2;
const SCORE_UI_MAX = 2;

export const initialScore = (): ScoreVector => ({
  tech_depth: 0,
  posture: 0,
  governance: 0,
  risk_style: 0
});

export const createEmptySessionState = (sessionId: string): SessionState => ({
  sessionId,
  step: "landing",
  scenarioIndex: 0,
  answers: [],
  score: initialScore()
});

export const normalizeScoreForUi = (score: ScoreVector): ScoreVector => ({
  tech_depth: clamp(score.tech_depth, SCORE_UI_MIN, SCORE_UI_MAX),
  posture: clamp(score.posture, SCORE_UI_MIN, SCORE_UI_MAX),
  governance: clamp(score.governance, SCORE_UI_MIN, SCORE_UI_MAX),
  risk_style: clamp(score.risk_style, SCORE_UI_MIN, SCORE_UI_MAX)
});

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

export const recomputeScore = (answers: Answer[]): ScoreVector => {
  const aggregate = answers.reduce<ScoreVector>(
    (acc, answer) => {
      const scenario = SCENARIOS.find(
        (s) => s.scenario_id === answer.scenarioId
      );
      if (!scenario) return acc;
      const option = scenario.options.find(
        (o) => o.option_id === answer.optionId
      );
      if (!option) return acc;
      return {
        tech_depth: acc.tech_depth + option.weights.tech_depth,
        posture: acc.posture + option.weights.posture,
        governance: acc.governance + option.weights.governance,
        risk_style: acc.risk_style + option.weights.risk_style
      };
    },
    initialScore()
  );

  // Intentionally no clamp here: distances must use raw score.
  return aggregate;
};

export const computeTrait = (score: ScoreVector): TraitId => {
  const entries: Array<["tech_depth" | "posture" | "governance" | "risk_style", number]> =
    [
      ["tech_depth", Math.abs(score.tech_depth)],
      ["posture", Math.abs(score.posture)],
      ["governance", Math.abs(score.governance)],
      ["risk_style", Math.abs(score.risk_style)]
    ];

  const sorted = entries.sort((a, b) => b[1] - a[1]);
  const [dimension, magnitude] = sorted[0];

  if (magnitude < 1.5) {
    return "EQUILIBRADO";
  }

  switch (dimension) {
    case "posture":
      return "IMPULSOR";
    case "tech_depth":
      return "ANALITICO";
    case "governance":
      return "ORQUESTADOR";
    default:
      return "EQUILIBRADO";
  }
};

const EPS = 0.9;

export const chooseProfile = (scoreRaw: ScoreVector, sessionId: string): ProfileId => {
  const profileIds = Object.keys(PROFILE_PROTOTYPES) as ProfileId[];

  const distances = profileIds
    .map((id) => ({ id, d: l2Distance(scoreRaw, PROFILE_PROTOTYPES[id]) }))
    .sort((a, b) => a.d - b.d);

  const best = distances[0]?.d ?? Number.POSITIVE_INFINITY;
  const candidates = distances.filter((x) => x.d - best <= EPS);

  if (candidates.length <= 1) {
    return (candidates[0]?.id ?? profileIds[0]) as ProfileId;
  }

  const idx = stableHash(sessionId) % candidates.length;
  return candidates[idx].id;
};

const stableHash = (input: string): number => {
  // FNV-1a 32-bit
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
};

const l2Distance = (a: ScoreVector, b: ScoreVector): number => {
  const dt = a.tech_depth - b.tech_depth;
  const dp = a.posture - b.posture;
  const dg = a.governance - b.governance;
  const dr = a.risk_style - b.risk_style;
  return Math.sqrt(dt * dt + dp * dp + dg * dg + dr * dr);
};

export const computeResult = (answers: Answer[], sessionId: string): SessionResult => {
  const scoreRaw = recomputeScore(answers);
  const profileId = chooseProfile(scoreRaw, sessionId);
  const trait = computeTrait(normalizeScoreForUi(scoreRaw));
  return { profileId, trait, score: scoreRaw };
};

