import type { ProfileId, ScoreVector } from "./data/profiles";
import { PROFILE_PROTOTYPES } from "./data/profiles";
import type { OptionId, Question } from "./data/questions";
import { CATEGORY_WEIGHTS } from "./data/questions";

export type { OptionId };

export type Step =
  | "landing"
  | "name"
  | "brief"
  | "scenario"
  | "computing"
  | "result"
  | "share"; // Final step: QR code + downloadable profile image

export type Answer = {
  scenarioId: string;  // maps to Question.id
  optionId: OptionId;
  ts: number;
};

export type TraitId = "IMPULSOR" | "ANALITICO" | "ORQUESTADOR" | "EQUILIBRADO";

export type SessionResult = {
  profileId: ProfileId;
  trait?: TraitId;
  score: ScoreVector;
};

export type Gender = "male" | "female";

export type SessionState = {
  sessionId: string;
  userName?: string;
  gender: Gender;
  step: Step;
  scenarioIndex: number;
  answers: Answer[];
  score: ScoreVector;
  result?: SessionResult;
  /** The random subset of questions selected for this session */
  questions: Question[];
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
  gender: "male",
  scenarioIndex: 0,
  answers: [],
  score: initialScore(),
  questions: [],
});

export const normalizeScoreForUi = (score: ScoreVector): ScoreVector => ({
  tech_depth: clamp(score.tech_depth, SCORE_UI_MIN, SCORE_UI_MAX),
  posture: clamp(score.posture, SCORE_UI_MIN, SCORE_UI_MAX),
  governance: clamp(score.governance, SCORE_UI_MIN, SCORE_UI_MAX),
  risk_style: clamp(score.risk_style, SCORE_UI_MIN, SCORE_UI_MAX)
});

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

/**
 * Recompute the score vector from answers.
 * For each correctly answered question, add the category weight vector.
 * Wrong answers contribute nothing.
 * `questions` must be the session's selected question set.
 */
export const recomputeScore = (answers: Answer[], questions: Question[]): ScoreVector => {
  const aggregate = answers.reduce<ScoreVector>(
    (acc, answer) => {
      const question = questions.find((q) => q.id === answer.scenarioId);
      if (!question) return acc;

      // Only add weight if the answer is correct
      if (answer.optionId !== question.correctAnswer) return acc;

      const weight = CATEGORY_WEIGHTS[question.category];
      return {
        tech_depth: acc.tech_depth + weight.tech_depth,
        posture: acc.posture + weight.posture,
        governance: acc.governance + weight.governance,
        risk_style: acc.risk_style + weight.risk_style
      };
    },
    initialScore()
  );

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

export const computeResult = (answers: Answer[], sessionId: string, questions: Question[]): SessionResult => {
  const scoreRaw = recomputeScore(answers, questions);
  const profileId = chooseProfile(scoreRaw, sessionId);
  const trait = computeTrait(normalizeScoreForUi(scoreRaw));
  return { profileId, trait, score: scoreRaw };
};

