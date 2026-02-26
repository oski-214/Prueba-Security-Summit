export type ProfileId =
  | "IDENTITY_ARCHITECT"
  | "SIGNAL_ORCHESTRATOR"
  | "TOTAL_GUARDIAN"
  | "TRUST_STRATEGIST";

export type ScoreVector = {
  tech_depth: number;
  posture: number;
  governance: number;
  risk_style: number;
};

export type Profile = {
  profile_id: ProfileId;
  name: string;
  product_anchor: string;
  avatar_style_key: "entra" | "sentinel" | "defender" | "purview";
  summary_template: string;
  strength_template: string;
  blindspot_template: string;
  challenge_template: string;
};

export const PROFILES: Profile[] = [
  {
    profile_id: "IDENTITY_ARCHITECT",
    name: "Arquitecto de Identidad",
    product_anchor: "Microsoft Entra",
    avatar_style_key: "entra",
    summary_template:
      "Tiendes a reducir superficie de ataque antes que negociar excepciones. Prefieres controles consistentes y decisiones estructurales que disminuyan exposición a largo plazo.",
    strength_template: "Conviertes complejidad en reglas claras y sostenibles.",
    blindspot_template:
      "Puedes generar fricción operativa si no equilibras agilidad y control.",
    challenge_template:
      "¿Tienes métricas periódicas sobre privilegios, identidades críticas y excepciones activas?"
  },
  {
    profile_id: "SIGNAL_ORCHESTRATOR",
    name: "Orquestador de Señales",
    product_anchor: "Microsoft Sentinel",
    avatar_style_key: "sentinel",
    summary_template:
      "Decides con base en datos, patrones y señales antes de intervenir. Prefieres precisión antes que reacción impulsiva.",
    strength_template:
      "Elevas la calidad de decisión con evidencia.",
    blindspot_template:
      "Esperar demasiada certeza puede retrasar acciones necesarias.",
    challenge_template:
      "¿Tu organización mide tiempo desde señal temprana hasta decisión ejecutiva?"
  },
  {
    profile_id: "TOTAL_GUARDIAN",
    name: "Guardián Integral",
    product_anchor: "Microsoft Defender XDR",
    avatar_style_key: "defender",
    summary_template:
      "Priorizas continuidad operativa y capacidad de respuesta coordinada. Buscas contener impacto sin paralizar el negocio.",
    strength_template: "Mantienes estabilidad incluso bajo presión.",
    blindspot_template:
      "Puedes aceptar riesgos estructurales si no afectan de inmediato la operación.",
    challenge_template:
      "¿Tus planes de resiliencia están probados en escenarios interdependientes reales?"
  },
  {
    profile_id: "TRUST_STRATEGIST",
    name: "Estratega de Confianza",
    product_anchor: "Microsoft Purview",
    avatar_style_key: "purview",
    summary_template:
      "Enfocas la seguridad como elemento de gobierno y confianza organizativa. Alineas riesgo, cumplimiento y dirección ejecutiva.",
    strength_template:
      "Generas coherencia y legitimidad en decisiones críticas.",
    blindspot_template:
      "El exceso de proceso puede ralentizar ejecución técnica.",
    challenge_template:
      "¿Tus métricas de riesgo están conectadas con decisiones reales del comité?"
  }
];

export const PROFILE_PROTOTYPES: Record<ProfileId, ScoreVector> = {
  IDENTITY_ARCHITECT: {
    tech_depth: 1,
    posture: 2,
    governance: 1,
    risk_style: 1
  },
  SIGNAL_ORCHESTRATOR: {
    tech_depth: 2,
    posture: 1,
    governance: 0,
    risk_style: 1
  },
  TOTAL_GUARDIAN: {
    tech_depth: 1,
    posture: 1,
    governance: 1,
    risk_style: -2
  },
  TRUST_STRATEGIST: {
    tech_depth: -1,
    posture: 1,
    governance: 2,
    risk_style: 0
  }
};

