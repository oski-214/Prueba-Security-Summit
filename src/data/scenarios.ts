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
    title: "Señales en cuentas privilegiadas",
    context:
      "Se detecta actividad anómala en identidades con privilegios. No hay impacto confirmado y el equipo pide dirección.",
    question: "¿Qué haces primero?",
    options: [
      {
        option_id: "A",
        label:
          "Reducir privilegios y endurecer accesos de inmediato, aunque afecte operación.",
        weights: {
          tech_depth: 1,
          posture: 2,
          governance: 1,
          risk_style: 1
        }
      },
      {
        option_id: "B",
        label:
          "Activar responsables clave y evaluar implicaciones antes de tocar sistemas.",
        weights: {
          tech_depth: -1,
          posture: 0,
          governance: 2,
          risk_style: -1
        }
      },
      {
        option_id: "C",
        label:
          "Analizar telemetría y validar alcance antes de intervenir.",
        weights: {
          tech_depth: 2,
          posture: 1,
          governance: 0,
          risk_style: 0
        }
      }
    ]
  },
  {
    scenario_id: "S2",
    title: "Proveedor estratégico comprometido",
    context:
      "Un proveedor estratégico sufre ransomware. No tienes evidencia clara de impacto directo en tu entorno.",
    question: "¿Qué haces primero?",
    options: [
      {
        option_id: "A",
        label: "Aislar conexiones preventivamente, asumiendo impacto potencial.",
        weights: {
          tech_depth: 1,
          posture: 2,
          governance: 1,
          risk_style: -1
        }
      },
      {
        option_id: "B",
        label:
          "Esperar evidencia más concreta antes de interrumpir operaciones clave.",
        weights: {
          tech_depth: 1,
          posture: 0,
          governance: 0,
          risk_style: 2
        }
      },
      {
        option_id: "C",
        label:
          "Activar comité de crisis y coordinar comunicación con negocio y proveedor.",
        weights: {
          tech_depth: -1,
          posture: 1,
          governance: 2,
          risk_style: 0
        }
      }
    ]
  },
  {
    scenario_id: "S3",
    title: "Inversión anual limitada",
    context:
      "Este año solo puedes priorizar una gran línea estratégica en seguridad. El resto solo recibirá mantenimiento mínimo.",
    question: "¿Qué haces primero?",
    options: [
      {
        option_id: "A",
        label:
          "Reforzar arquitectura e identidad estructural para reducir superficie de ataque.",
        weights: {
          tech_depth: 1,
          posture: 2,
          governance: 1,
          risk_style: 1
        }
      },
      {
        option_id: "B",
        label:
          "Mejorar capacidades de correlación y análisis avanzado para ganar visibilidad.",
        weights: {
          tech_depth: 2,
          posture: 1,
          governance: 0,
          risk_style: 1
        }
      },
      {
        option_id: "C",
        label:
          "Fortalecer resiliencia y recuperación operativa ante incidentes graves.",
        weights: {
          tech_depth: 0,
          posture: 1,
          governance: 1,
          risk_style: -2
        }
      }
    ]
  },
  {
    scenario_id: "S4",
    title: "Autonomía de unidades de negocio",
    context:
      "Las unidades de negocio piden poder decidir más sobre controles de seguridad que aplican a sus equipos y aplicaciones.",
    question: "¿Qué haces primero?",
    options: [
      {
        option_id: "A",
        label:
          "Definir estándares centrales obligatorios y supervisión continua desde seguridad.",
        weights: {
          tech_depth: 0,
          posture: 1,
          governance: 2,
          risk_style: 1
        }
      },
      {
        option_id: "B",
        label:
          "Permitir que cada unidad defina sus controles, con solo principios generales comunes.",
        weights: {
          tech_depth: 0,
          posture: 0,
          governance: -2,
          risk_style: -1
        }
      },
      {
        option_id: "C",
        label:
          "Diseñar un modelo híbrido con métricas formales de riesgo por unidad.",
        weights: {
          tech_depth: -1,
          posture: 1,
          governance: 1,
          risk_style: 1
        }
      }
    ]
  },
  {
    scenario_id: "S5",
    title: "Incidente contenido sin impacto material",
    context:
      "Has gestionado un incidente que quedó contenido y sin impacto material aparente. No hay obligación regulatoria clara de comunicar.",
    question: "¿Qué haces primero?",
    options: [
      {
        option_id: "A",
        label:
          "Cerrar internamente el incidente sin comunicarlo externamente.",
        weights: {
          tech_depth: 0,
          posture: 0,
          governance: 1,
          risk_style: -2
        }
      },
      {
        option_id: "B",
        label:
          "Comunicar de forma transparente a socios clave el incidente y lecciones aprendidas.",
        weights: {
          tech_depth: -1,
          posture: 1,
          governance: 1,
          risk_style: 2
        }
      },
      {
        option_id: "C",
        label:
          "Esperar al análisis técnico completo y decidir después si comunicar.",
        weights: {
          tech_depth: 2,
          posture: 1,
          governance: 0,
          risk_style: 1
        }
      }
    ]
  }
];

