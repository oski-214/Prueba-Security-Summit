import type { OptionId } from "./data/scenarios";
import type { ProfileId, ScoreVector } from "./data/profiles";
import { SCENARIOS } from "./data/scenarios";
import { PROFILE_PROTOTYPES } from "./data/profiles";

export type Step =
  | "landing"
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
  step: Step;
  scenarioIndex: number;
  answers: Answer[];
  score: ScoreVector;
  result?: SessionResult;
};

const SCORE_MIN = -2;
const SCORE_MAX = 2;

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

export const normalizeScore = (score: ScoreVector): ScoreVector => ({
  tech_depth: clamp(score.tech_depth, SCORE_MIN, SCORE_MAX),
  posture: clamp(score.posture, SCORE_MIN, SCORE_MAX),
  governance: clamp(score.governance, SCORE_MIN, SCORE_MAX),
  risk_style: clamp(score.risk_style, SCORE_MIN, SCORE_MAX)
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

  return normalizeScore(aggregate);
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

export const chooseProfile = (score: ScoreVector): ProfileId => {
  let bestProfile: ProfileId | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  (Object.keys(PROFILE_PROTOTYPES) as ProfileId[]).forEach((profileId) => {
    const proto = PROFILE_PROTOTYPES[profileId];
    const distance = l2Distance(score, proto);

    if (distance < bestDistance) {
      bestDistance = distance;
      bestProfile = profileId;
    } else if (distance === bestDistance && bestProfile) {
      const currentGovernance = Math.abs(
        PROFILE_PROTOTYPES[bestProfile].governance
      );
      const candidateGovernance = Math.abs(proto.governance);
      if (candidateGovernance > currentGovernance) {
        bestProfile = profileId;
      }
    }
  });

  // Fallback, should not happen
  return bestProfile ?? "IDENTITY_ARCHITECT";
};

const l2Distance = (a: ScoreVector, b: ScoreVector): number => {
  const dt = a.tech_depth - b.tech_depth;
  const dp = a.posture - b.posture;
  const dg = a.governance - b.governance;
  const dr = a.risk_style - b.risk_style;
  return Math.sqrt(dt * dt + dp * dp + dg * dg + dr * dr);
};

export const computeResult = (answers: Answer[]): SessionResult => {
  const score = recomputeScore(answers);
  const profileId = chooseProfile(score);
  const trait = computeTrait(score);
  return { profileId, trait, score };
};

