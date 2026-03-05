import type { ScoreVector } from "./profiles";

export type OptionId = "A" | "B" | "C";

export type ScenarioOption = {
  option_id: OptionId;
  label: string;
  weights: ScoreVector;
};

export type Scenario = {
  scenario_id: `S${number}`;
  title: string;
  context: string;
  question: string;
  options: ScenarioOption[];
};

export const SCENARIOS: Scenario[] = [
  {
    scenario_id: "S1",
    title: "Señal temprana en tu entorno",
    context:
      "Aparece una señal temprana de posible actividad maliciosa. Aún no sabes si hay impacto real.",
    question: "¿Qué haces primero?",
    options: [
      {
        option_id: "A",
        label:
          "Correlacionar señales y confirmar alcance antes de intervenir.",
        weights: {
          tech_depth: 2,
          posture: 0,
          governance: 0,
          risk_style: 1
        }
      },
      {
        option_id: "B",
        label:
          "Revisar identidades críticas y endurecer accesos de forma reversible.",
        weights: {
          tech_depth: 1,
          posture: 1,
          governance: 1,
          risk_style: 0
        }
      },
      {
        option_id: "C",
        label:
          "Contener de inmediato para limitar impacto aunque haya fricción.",
        weights: {
          tech_depth: 1,
          posture: 1,
          governance: 1,
          risk_style: 3
        }
      }
    ]
  },
  {
    scenario_id: "S2",
    title: "Riesgo de datos y cumplimiento",
    context:
      "Surge una preocupación por exposición de información sensible y exigencias de cumplimiento. No hay incidente confirmado.",
    question: "¿Qué haces primero?",
    options: [
      {
        option_id: "A",
        label:
          "Clasificar datos críticos, revisar accesos y aplicar controles de gobierno.",
        weights: {
          tech_depth: -1,
          posture: 0,
          governance: 2,
          risk_style: 1
        }
      },
      {
        option_id: "B",
        label:
          "Pedir a un asistente de seguridad que sintetice el riesgo y proponga un plan accionable.",
        weights: {
          tech_depth: -2,
          posture: 0,
          governance: 1,
          risk_style: -1
        }
      },
      {
        option_id: "C",
        label:
          "Ajustar detección y respuesta por si aparece evidencia de exfiltración.",
        weights: {
          tech_depth: 1,
          posture: 1,
          governance: 1,
          risk_style: 2
        }
      }
    ]
  },
  {
    scenario_id: "S3",
    title: "Modelo operativo (decisión en 60 minutos)",
    context:
      "Tienes 60 minutos para presentar una decisión clara: qué priorizar primero mientras el equipo investiga.",
    question: "¿Qué haces primero?",
    options: [
      {
        option_id: "A",
        label:
          "Mejorar calidad de señal: unificar telemetría y reglas de correlación para decidir con evidencia.",
        weights: {
          tech_depth: 2,
          posture: 0,
          governance: 0,
          risk_style: 1
        }
      },
      {
        option_id: "B",
        label:
          "Estandarizar controles de identidad y acceso entre equipos para reducir variabilidad de riesgo.",
        weights: {
          tech_depth: 0,
          posture: 1,
          governance: 2,
          risk_style: 0
        }
      },
      {
        option_id: "C",
        label:
          "Usar un copiloto para resumir hallazgos, recomendar acciones y preparar comunicación interna.",
        weights: {
          tech_depth: -2,
          posture: 0,
          governance: 1,
          risk_style: -1
        }
      }
    ]
  }
];

