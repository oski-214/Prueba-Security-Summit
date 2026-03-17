export type ProfileId =
  | "DEFENDER_CHAMPION"
  | "SENTINEL_ORCHESTRATOR"
  | "ENTRA_IDENTITY_ARCHITECT"
  | "PURVIEW_TRUST_STEWARD"
  | "COPILOT_NAVIGATOR";

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
  avatar_style_key: "entra" | "sentinel" | "defender" | "purview" | "copilot";
  summary_template: string;
  strength_template: string;
  blindspot_template: string;
  challenge_template: string;
};

export const PROFILES: Profile[] = [
  {
    profile_id: "DEFENDER_CHAMPION",
    name: "Champion de Contención",
    product_anchor: "Microsoft Defender XDR",
    avatar_style_key: "defender",
    summary_template:
      "Tiendes a priorizar contención rápida y continuidad operativa. Buscas frenar la propagación y mantener el negocio en marcha incluso bajo presión.",
    strength_template:
      "Eres eficaz reduciendo impacto inmediato y coordinando la respuesta.",
    blindspot_template:
      "Puedes dejar riesgos estructurales para más adelante si no afectan al corto plazo.",
    challenge_template:
      "Esa velocidad de contención que te define, combinada con la coordinación de Defender XDR, convierte cada amenaza en una oportunidad para blindar el negocio."
  },
  {
    profile_id: "SENTINEL_ORCHESTRATOR",
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
      "Tu capacidad de decidir con evidencia eleva toda la operación. Con Sentinel, cada señal que correlacionas se convierte en precisión que otros equipos no pueden igualar."
  },
  {
    profile_id: "ENTRA_IDENTITY_ARCHITECT",
    name: "Arquitecto de Identidad",
    product_anchor: "Microsoft Entra",
    avatar_style_key: "entra",
    summary_template:
      "En tu enfoque la identidad y el control de acceso son el punto de partida. Prefieres decisiones estructurales que reduzcan superficie de ataque de forma consistente.",
    strength_template:
      "Alineas controles de acceso con el modelo de negocio y las funciones críticas.",
    blindspot_template:
      "Puedes generar fricción si los cambios en identidad no se coordinan bien con los equipos de negocio.",
    challenge_template:
      "Al alinear acceso con negocio, reduces superficie de ataque sin que nadie lo note. Con Entra, esas decisiones estructurales se convierten en la base de toda la estrategia Zero Trust."
  },
  {
    profile_id: "PURVIEW_TRUST_STEWARD",
    name: "Responsable de Confianza",
    product_anchor: "Microsoft Purview",
    avatar_style_key: "purview",
    summary_template:
      "Lees la seguridad desde el prisma de datos, cumplimiento y confianza. Buscas coherencia entre regulación, políticas internas y expectativas de los grupos de interés.",
    strength_template:
      "Generas coherencia y legitimidad en decisiones críticas.",
    blindspot_template:
      "El exceso de proceso puede ralentizar ejecución técnica.",
    challenge_template:
      "Esa coherencia que aportas entre regulación y decisión es lo que da legitimidad a toda la estrategia. Con Purview, tu visión de gobernanza escala a toda la organización."
  },
  {
    profile_id: "COPILOT_NAVIGATOR",
    name: "Navegador Asistido",
    product_anchor: "Microsoft Security Copilot",
    avatar_style_key: "copilot",
    summary_template:
      "Tiendes a apoyarte en asistentes y síntesis inteligentes para tomar decisiones. Buscas contexto rápido, recomendaciones accionables y comunicación clara hacia negocio.",
    strength_template:
      "Aceleras el entendimiento de situaciones complejas y facilitas la toma de decisiones conjunta.",
    blindspot_template:
      "Puedes depender demasiado de la recomendación inicial si no contrastas con tus propios criterios.",
    challenge_template:
      "Tu habilidad para sintetizar situaciones complejas y facilitar decisiones conjuntas se multiplica con Security Copilot. Eres el puente entre la IA y el criterio experto."
  }
];

export const PROFILE_PROTOTYPES: Record<ProfileId, ScoreVector> = {
  DEFENDER_CHAMPION: {
    tech_depth: 1,
    posture: 1,
    governance: 1,
    risk_style: 6
  },
  SENTINEL_ORCHESTRATOR: {
    tech_depth: 4,
    posture: 0,
    governance: 0,
    risk_style: 2
  },
  ENTRA_IDENTITY_ARCHITECT: {
    tech_depth: 1,
    posture: 2,
    governance: 3,
    risk_style: 0
  },
  PURVIEW_TRUST_STEWARD: {
    tech_depth: -1,
    posture: 0,
    governance: 2,
    risk_style: 1
  },
  COPILOT_NAVIGATOR: {
    tech_depth: -4,
    posture: 0,
    governance: 2,
    risk_style: -2
  }
};

