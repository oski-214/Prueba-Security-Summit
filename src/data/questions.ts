/**
 * questions.ts
 * ─────────────────────────────────────────────────────────────────
 * Bank of 40 security quiz questions, each categorized by profile.
 *
 * When a user answers correctly, the score vector for that question's
 * profile category is added to their accumulated score. Wrong answers
 * add nothing. This preserves the existing L2-distance-based profile
 * assignment from state.ts.
 * ─────────────────────────────────────────────────────────────────
 */

import type { ProfileId, ScoreVector } from "./profiles";
import { PROFILE_PROTOTYPES } from "./profiles";

export type OptionId = "A" | "B" | "C" | "D";

export type QuestionOption = {
  option_id: OptionId;
  label: string;
};

export type Question = {
  id: string;
  category: ProfileId;
  question: string;
  options: QuestionOption[];
  correctAnswer: OptionId;
};

/** Number of questions shown per session (1 from each of 3 random categories) */
export const QUESTIONS_PER_SESSION = 3;

/**
 * Weight vectors per category, derived from PROFILE_PROTOTYPES.
 * Each correct answer adds the full prototype vector, since we only
 * ask 1 question per category in a 3-question session.
 */
export const CATEGORY_WEIGHTS: Record<ProfileId, ScoreVector> = {
  DEFENDER_CHAMPION: { ...PROFILE_PROTOTYPES.DEFENDER_CHAMPION },
  SENTINEL_ORCHESTRATOR: { ...PROFILE_PROTOTYPES.SENTINEL_ORCHESTRATOR },
  ENTRA_IDENTITY_ARCHITECT: { ...PROFILE_PROTOTYPES.ENTRA_IDENTITY_ARCHITECT },
  PURVIEW_TRUST_STEWARD: { ...PROFILE_PROTOTYPES.PURVIEW_TRUST_STEWARD },
  COPILOT_NAVIGATOR: { ...PROFILE_PROTOTYPES.COPILOT_NAVIGATOR },
};

// ── Full question bank (40 questions) — Spanish ───────────────────

export const QUESTION_BANK: Question[] = [
  // ═══ DEFENDER_CHAMPION (8) — Endpoint, amenazas, vulnerabilidades, parcheo ═══
  {
    id: "Q4",
    category: "DEFENDER_CHAMPION",
    question: "¿Qué control de seguridad ayuda a prevenir la exfiltración de datos por USB?",
    options: [
      { option_id: "A", label: "Firewall de red" },
      { option_id: "B", label: "DLP de endpoint con control de dispositivos" },
      { option_id: "C", label: "Filtrado de correo" },
      { option_id: "D", label: "Software antivirus" },
    ],
    correctAnswer: "B",
  },
  {
    id: "Q20",
    category: "DEFENDER_CHAMPION",
    question: "¿Cuál es el plazo recomendado para parchear vulnerabilidades críticas según las mejores prácticas?",
    options: [
      { option_id: "A", label: "30 días" },
      { option_id: "B", label: "14 días o menos" },
      { option_id: "C", label: "90 días" },
      { option_id: "D", label: "6 meses" },
    ],
    correctAnswer: "B",
  },
  {
    id: "Q26",
    category: "DEFENDER_CHAMPION",
    question: "¿Cuál es el principal beneficio de usar IA para la detección de malware?",
    options: [
      { option_id: "A", label: "Solo puede detectar malware conocido" },
      { option_id: "B", label: "Puede identificar amenazas de día cero mediante análisis de comportamiento" },
      { option_id: "C", label: "Elimina la necesidad de antivirus" },
      { option_id: "D", label: "Hace que los sistemas vayan más rápido" },
    ],
    correctAnswer: "B",
  },
  {
    id: "Q28",
    category: "DEFENDER_CHAMPION",
    question: "¿Cuál es el riesgo de no mantener un inventario completo de activos para la gestión de parches?",
    options: [
      { option_id: "A", label: "No hay riesgo significativo" },
      { option_id: "B", label: "El Shadow IT y los sistemas sin parchear crean puntos ciegos de seguridad" },
      { option_id: "C", label: "Solo afecta al rendimiento" },
      { option_id: "D", label: "Reduce los costes de licencias" },
    ],
    correctAnswer: "B",
  },
  {
    id: "Q29",
    category: "DEFENDER_CHAMPION",
    question: "¿Qué es CVSS y cómo se usa en la gestión de vulnerabilidades?",
    options: [
      { option_id: "A", label: "Una herramienta de automatización de parches" },
      { option_id: "B", label: "Un sistema de puntuación que califica la severidad de vulnerabilidades de 0 a 10" },
      { option_id: "C", label: "Un tipo de certificado de seguridad" },
      { option_id: "D", label: "Un protocolo de escaneo de red" },
    ],
    correctAnswer: "B",
  },
  {
    id: "Q32",
    category: "DEFENDER_CHAMPION",
    question: "¿Qué es una vulnerabilidad de \"día cero\"?",
    options: [
      { option_id: "A", label: "Una vulnerabilidad que tarda cero días en parchearse" },
      { option_id: "B", label: "Una vulnerabilidad explotada antes de que exista un parche" },
      { option_id: "C", label: "Una vulnerabilidad sin impacto" },
      { option_id: "D", label: "Una vulnerabilidad encontrada el primer día de despliegue" },
    ],
    correctAnswer: "B",
  },
  {
    id: "Q36",
    category: "DEFENDER_CHAMPION",
    question: "¿Qué es el \"Patch Tuesday\" en el ecosistema Microsoft?",
    options: [
      { option_id: "A", label: "Un día aleatorio para actualizaciones" },
      { option_id: "B", label: "El segundo martes de cada mes, cuando Microsoft publica actualizaciones de seguridad" },
      { option_id: "C", label: "Un calendario de parcheo semanal" },
      { option_id: "D", label: "Una conferencia anual de seguridad" },
    ],
    correctAnswer: "B",
  },
  {
    id: "Q40",
    category: "DEFENDER_CHAMPION",
    question: "¿Qué capacidad de seguridad ofrece un Secure Web Gateway (SWG)?",
    options: [
      { option_id: "A", label: "Solo filtrado de URLs" },
      { option_id: "B", label: "Inspección de tráfico web, protección contra malware y aplicación de políticas" },
      { option_id: "C", label: "Solo seguridad del correo" },
      { option_id: "D", label: "Control de acceso físico a edificios" },
    ],
    correctAnswer: "B",
  },

  // ═══ SENTINEL_ORCHESTRATOR (8) — SIEM, SOC, detección, analítica ═══
  {
    id: "Q5",
    category: "SENTINEL_ORCHESTRATOR",
    question: "¿Qué significa UEBA en la detección de amenazas internas?",
    options: [
      { option_id: "A", label: "User Event Behavioral Analysis" },
      { option_id: "B", label: "Unified Endpoint Behavioral Analytics" },
      { option_id: "C", label: "User and Entity Behavior Analytics" },
      { option_id: "D", label: "Universal Endpoint Behavior Assessment" },
    ],
    correctAnswer: "C",
  },
  {
    id: "Q6",
    category: "SENTINEL_ORCHESTRATOR",
    question: "¿Qué comportamiento podría indicar una amenaza interna?",
    options: [
      { option_id: "A", label: "Iniciar sesión en horario laboral" },
      { option_id: "B", label: "Acceder solo a aplicaciones asignadas" },
      { option_id: "C", label: "Acceder a archivos fuera de su ámbito laboral en horas no laborables" },
      { option_id: "D", label: "Restablecer una contraseña olvidada" },
    ],
    correctAnswer: "C",
  },
  {
    id: "Q8",
    category: "SENTINEL_ORCHESTRATOR",
    question: "Un empleado que se va descarga un gran volumen de datos de clientes. ¿Qué debería hacer un sistema DLP?",
    options: [
      { option_id: "A", label: "Permitir la transferencia pero registrarla" },
      { option_id: "B", label: "Cifrar los datos automáticamente" },
      { option_id: "C", label: "Bloquear la transferencia y alertar al equipo de seguridad" },
      { option_id: "D", label: "Ignorar la acción" },
    ],
    correctAnswer: "C",
  },
  {
    id: "Q19",
    category: "SENTINEL_ORCHESTRATOR",
    question: "¿En qué se diferencia SSE de SASE (Secure Access Service Edge)?",
    options: [
      { option_id: "A", label: "SSE y SASE son idénticos" },
      { option_id: "B", label: "SSE es el componente de seguridad de SASE, sin la red SD-WAN" },
      { option_id: "C", label: "SASE es un subconjunto de SSE" },
      { option_id: "D", label: "SSE solo funciona on-premises" },
    ],
    correctAnswer: "B",
  },
  {
    id: "Q22",
    category: "SENTINEL_ORCHESTRATOR",
    question: "¿Cuáles son los tres componentes principales de Security Service Edge (SSE)?",
    options: [
      { option_id: "A", label: "Firewall, VPN y Antivirus" },
      { option_id: "B", label: "CASB, SWG y ZTNA" },
      { option_id: "C", label: "SIEM, SOAR y EDR" },
      { option_id: "D", label: "DNS, DHCP y NAT" },
    ],
    correctAnswer: "B",
  },
  {
    id: "Q30",
    category: "SENTINEL_ORCHESTRATOR",
    question: "¿Cómo mejora la IA la detección de phishing respecto a los métodos tradicionales?",
    options: [
      { option_id: "A", label: "Bloqueando todos los correos" },
      { option_id: "B", label: "Analizando patrones de escritura, comportamiento del remitente y anomalías contextuales" },
      { option_id: "C", label: "Revisando solo las cabeceras del correo" },
      { option_id: "D", label: "Ignorando los archivos adjuntos" },
    ],
    correctAnswer: "B",
  },
  {
    id: "Q31",
    category: "SENTINEL_ORCHESTRATOR",
    question: "¿Cómo puede la IA mejorar la eficiencia de un Centro de Operaciones de Seguridad (SOC)?",
    options: [
      { option_id: "A", label: "Reemplazando a todos los analistas humanos" },
      { option_id: "B", label: "Automatizando el triaje de alertas y reduciendo falsos positivos" },
      { option_id: "C", label: "Generando más alertas" },
      { option_id: "D", label: "Ralentizando la respuesta a incidentes" },
    ],
    correctAnswer: "B",
  },
  {
    id: "Q39",
    category: "SENTINEL_ORCHESTRATOR",
    question: "¿Cómo mejora ZTNA (Zero Trust Network Access) respecto a una VPN tradicional?",
    options: [
      { option_id: "A", label: "ZTNA es más lento pero más seguro" },
      { option_id: "B", label: "ZTNA proporciona acceso a nivel de aplicación en lugar de a nivel de red" },
      { option_id: "C", label: "ZTNA solo funciona para usuarios remotos" },
      { option_id: "D", label: "ZTNA elimina la necesidad de autenticación" },
    ],
    correctAnswer: "B",
  },

  // ═══ ENTRA_IDENTITY_ARCHITECT (8) — Identidad, MFA, control de acceso ═══
  {
    id: "Q2",
    category: "ENTRA_IDENTITY_ARCHITECT",
    question: "¿Qué método de MFA es más resistente a ataques de SIM-swapping?",
    options: [
      { option_id: "A", label: "OTP basado en SMS" },
      { option_id: "B", label: "Verificación por email" },
      { option_id: "C", label: "Notificaciones push" },
      { option_id: "D", label: "Llaves de seguridad hardware (FIDO2)" },
    ],
    correctAnswer: "D",
  },
  {
    id: "Q12",
    category: "ENTRA_IDENTITY_ARCHITECT",
    question: "¿Qué es un ataque de fatiga de MFA?",
    options: [
      { option_id: "A", label: "Deshabilitar los servicios de MFA" },
      { option_id: "B", label: "Enviar repetidamente solicitudes de MFA para engañar al usuario y que apruebe" },
      { option_id: "C", label: "Credential stuffing con MFA" },
      { option_id: "D", label: "Ataque de replay de tokens" },
    ],
    correctAnswer: "B",
  },
  {
    id: "Q13",
    category: "ENTRA_IDENTITY_ARCHITECT",
    question: "¿Qué es el principio de mínimo privilegio?",
    options: [
      { option_id: "A", label: "Dar acceso de administrador a todos los usuarios" },
      { option_id: "B", label: "Dar acceso temporal a todos" },
      { option_id: "C", label: "Conceder solo el acceso necesario" },
      { option_id: "D", label: "Eliminar accesos después de incidentes" },
    ],
    correctAnswer: "C",
  },
  {
    id: "Q14",
    category: "ENTRA_IDENTITY_ARCHITECT",
    question: "Una huella dactilar utilizada para autenticación se clasifica como:",
    options: [
      { option_id: "A", label: "Algo que sabes" },
      { option_id: "B", label: "Algo que tienes" },
      { option_id: "C", label: "Algo que eres" },
      { option_id: "D", label: "Algo que compartes" },
    ],
    correctAnswer: "C",
  },
  {
    id: "Q16",
    category: "ENTRA_IDENTITY_ARCHITECT",
    question: "En Azure AD, las políticas de Acceso Condicional se usan para:",
    options: [
      { option_id: "A", label: "Crear usuarios automáticamente" },
      { option_id: "B", label: "Asignar licencias" },
      { option_id: "C", label: "Requerir MFA según condiciones" },
      { option_id: "D", label: "Cifrar mensajes de correo" },
    ],
    correctAnswer: "C",
  },
  {
    id: "Q17",
    category: "ENTRA_IDENTITY_ARCHITECT",
    question: "¿Cuál es el enfoque recomendado para añadir MFA a aplicaciones legacy?",
    options: [
      { option_id: "A", label: "Reescribir la aplicación" },
      { option_id: "B", label: "Deshabilitar la aplicación" },
      { option_id: "C", label: "Usar un proxy inverso o proveedor de identidad" },
      { option_id: "D", label: "Ignorar los requisitos de MFA" },
    ],
    correctAnswer: "C",
  },
  {
    id: "Q18",
    category: "ENTRA_IDENTITY_ARCHITECT",
    question: "¿Cuál es una señal de alerta común en correos de phishing?",
    options: [
      { option_id: "A", label: "Saludo personalizado" },
      { option_id: "B", label: "Logo de la empresa" },
      { option_id: "C", label: "Lenguaje urgente exigiendo acción inmediata" },
      { option_id: "D", label: "Gramática correcta" },
    ],
    correctAnswer: "C",
  },
  {
    id: "Q38",
    category: "ENTRA_IDENTITY_ARCHITECT",
    question: "¿Qué significa \"agilidad criptográfica\" en el contexto de amenazas cuánticas?",
    options: [
      { option_id: "A", label: "Mayor velocidad de cifrado" },
      { option_id: "B", label: "La capacidad de cambiar rápidamente de algoritmo criptográfico" },
      { option_id: "C", label: "Desarrollo ágil de software criptográfico" },
      { option_id: "D", label: "Criptografía móvil" },
    ],
    correctAnswer: "B",
  },

  // ═══ PURVIEW_TRUST_STEWARD (8) — Protección de datos, cumplimiento, gobernanza ═══
  {
    id: "Q1",
    category: "PURVIEW_TRUST_STEWARD",
    question: "¿Qué cabecera de correo deberías revisar para verificar el remitente real?",
    options: [
      { option_id: "A", label: "Solo la cabecera From" },
      { option_id: "B", label: "La cabecera Reply-To" },
      { option_id: "C", label: "Las cabeceras Return-Path y Received" },
      { option_id: "D", label: "El asunto del correo" },
    ],
    correctAnswer: "C",
  },
  {
    id: "Q3",
    category: "PURVIEW_TRUST_STEWARD",
    question: "Recibes un correo diciendo que tu suscripción de Microsoft 365 será cancelada si no actualizas tu método de pago. El enlace apunta a \"microsoft-secure-payment.xyz\". ¿Qué tipo de ataque es?",
    options: [
      { option_id: "A", label: "Spam" },
      { option_id: "B", label: "Phishing" },
      { option_id: "C", label: "Spear phishing" },
      { option_id: "D", label: "Business Email Compromise (BEC)" },
    ],
    correctAnswer: "C",
  },
  {
    id: "Q9",
    category: "PURVIEW_TRUST_STEWARD",
    question: "¿Qué es el \"whaling\" en ataques de phishing?",
    options: [
      { option_id: "A", label: "Phishing masivo aleatorio" },
      { option_id: "B", label: "Phishing dirigido al equipo de TI" },
      { option_id: "C", label: "Phishing dirigido a ejecutivos" },
      { option_id: "D", label: "Phishing usando solo archivos adjuntos" },
    ],
    correctAnswer: "C",
  },
  {
    id: "Q10",
    category: "PURVIEW_TRUST_STEWARD",
    question: "Recibes un correo de \"IT-Support@microso0ft.com\" pidiéndote que verifiques tus credenciales. ¿Qué deberías hacer?",
    options: [
      { option_id: "A", label: "Hacer clic en el enlace y verificar" },
      { option_id: "B", label: "Responder pidiendo confirmación" },
      { option_id: "C", label: "Ignorar el correo" },
      { option_id: "D", label: "Reportar el correo como phishing" },
    ],
    correctAnswer: "D",
  },
  {
    id: "Q21",
    category: "PURVIEW_TRUST_STEWARD",
    question: "¿Cuál es la función principal de un Cloud Access Security Broker (CASB)?",
    options: [
      { option_id: "A", label: "Bloquear todas las aplicaciones cloud" },
      { option_id: "B", label: "Proporcionar visibilidad, cumplimiento y protección de datos en aplicaciones SaaS" },
      { option_id: "C", label: "Acelerar las conexiones a internet" },
      { option_id: "D", label: "Gestionar los costes de infraestructura cloud" },
    ],
    correctAnswer: "B",
  },
  {
    id: "Q23",
    category: "PURVIEW_TRUST_STEWARD",
    question: "¿Qué método de cifrado actual es más vulnerable a ataques de computación cuántica?",
    options: [
      { option_id: "A", label: "AES-256" },
      { option_id: "B", label: "RSA-2048" },
      { option_id: "C", label: "SHA-256" },
      { option_id: "D", label: "ChaCha20" },
    ],
    correctAnswer: "B",
  },
  {
    id: "Q24",
    category: "PURVIEW_TRUST_STEWARD",
    question: "¿Cómo detecta la distribución cuántica de claves (QKD) las escuchas?",
    options: [
      { option_id: "A", label: "Usando cifrado más fuerte" },
      { option_id: "B", label: "Detectando perturbaciones en los estados cuánticos causadas por la medición" },
      { option_id: "C", label: "Usando claves más largas" },
      { option_id: "D", label: "Monitorizando el tráfico de red" },
    ],
    correctAnswer: "B",
  },
  {
    id: "Q25",
    category: "PURVIEW_TRUST_STEWARD",
    question: "¿Qué es \"Harvest Now, Decrypt Later\" en seguridad cuántica?",
    options: [
      { option_id: "A", label: "Una técnica de optimización agrícola" },
      { option_id: "B", label: "Recopilar datos cifrados ahora para descifrarlos con futuros ordenadores cuánticos" },
      { option_id: "C", label: "Un método de distribución cuántica de claves" },
      { option_id: "D", label: "Una estrategia de copia de seguridad" },
    ],
    correctAnswer: "B",
  },

  // ═══ COPILOT_NAVIGATOR (8) — Seguridad IA, amenazas ML, operaciones asistidas ═══
  {
    id: "Q7",
    category: "COPILOT_NAVIGATOR",
    question: "¿Qué es un ataque de \"prompt injection\" en modelos de lenguaje (LLM)?",
    options: [
      { option_id: "A", label: "Inyectar malware en la infraestructura de IA" },
      { option_id: "B", label: "Sobrecargar el modelo con peticiones" },
      { option_id: "C", label: "Crear entradas que anulan las instrucciones del sistema" },
      { option_id: "D", label: "Robar conjuntos de datos de entrenamiento" },
    ],
    correctAnswer: "C",
  },
  {
    id: "Q11",
    category: "COPILOT_NAVIGATOR",
    question: "¿Qué es el \"envenenamiento de modelos\" (model poisoning) en seguridad de machine learning?",
    options: [
      { option_id: "A", label: "Robar un modelo entrenado" },
      { option_id: "B", label: "Inyectar prompts maliciosos" },
      { option_id: "C", label: "Manipular los datos de entrenamiento" },
      { option_id: "D", label: "Deshabilitar los endpoints del modelo" },
    ],
    correctAnswer: "C",
  },
  {
    id: "Q15",
    category: "COPILOT_NAVIGATOR",
    question: "¿Qué defensa ayuda a proteger contra ejemplos adversarios en clasificación de imágenes?",
    options: [
      { option_id: "A", label: "Conjuntos de datos más grandes" },
      { option_id: "B", label: "Cifrado" },
      { option_id: "C", label: "Entrenamiento adversario y preprocesamiento" },
      { option_id: "D", label: "Limitación de peticiones (rate limiting)" },
    ],
    correctAnswer: "C",
  },
  {
    id: "Q27",
    category: "COPILOT_NAVIGATOR",
    question: "¿Qué es un ataque de \"inversión de modelo\" (model inversion)?",
    options: [
      { option_id: "A", label: "Ejecutar modelos al revés" },
      { option_id: "B", label: "Extraer datos de entrenamiento o características sensibles a partir de las salidas del modelo" },
      { option_id: "C", label: "Invertir los pesos del modelo" },
      { option_id: "D", label: "Convertir modelos entre frameworks" },
    ],
    correctAnswer: "B",
  },
  {
    id: "Q33",
    category: "COPILOT_NAVIGATOR",
    question: "¿Qué estándar de criptografía post-cuántica del NIST se basa en problemas de retículas (lattice)?",
    options: [
      { option_id: "A", label: "RSA-4096" },
      { option_id: "B", label: "CRYSTALS-Kyber" },
      { option_id: "C", label: "Triple DES" },
      { option_id: "D", label: "Blowfish" },
    ],
    correctAnswer: "B",
  },
  {
    id: "Q34",
    category: "COPILOT_NAVIGATOR",
    question: "En los principios de IA Responsable de Microsoft, ¿cuál NO es un principio fundamental?",
    options: [
      { option_id: "A", label: "Equidad" },
      { option_id: "B", label: "Privacidad y Seguridad" },
      { option_id: "C", label: "Maximización de beneficios" },
      { option_id: "D", label: "Transparencia" },
    ],
    correctAnswer: "C",
  },
  {
    id: "Q35",
    category: "COPILOT_NAVIGATOR",
    question: "En Microsoft Copilot for Security, ¿qué capacidad ofrece la IA para la caza de amenazas?",
    options: [
      { option_id: "A", label: "Solo genera informes" },
      { option_id: "B", label: "Consultas en lenguaje natural para investigar amenazas y resumir incidentes" },
      { option_id: "C", label: "Bloquea todo el tráfico de red" },
      { option_id: "D", label: "Reemplaza las herramientas de seguridad por completo" },
    ],
    correctAnswer: "B",
  },
  {
    id: "Q37",
    category: "COPILOT_NAVIGATOR",
    question: "¿Qué consideración clave hay al desplegar IA para respuesta automatizada a incidentes?",
    options: [
      { option_id: "A", label: "La IA debe tomar todas las decisiones sin supervisión humana" },
      { option_id: "B", label: "Validación con humano en el bucle para acciones críticas" },
      { option_id: "C", label: "Deshabilitar todos los controles de seguridad existentes" },
      { option_id: "D", label: "Las respuestas de la IA deben retrasarse 24 horas" },
    ],
    correctAnswer: "B",
  },
];

/**
 * Select N random questions from different categories.
 * Picks 3 random categories (out of 5), then 1 random question from each.
 * Result is shuffled so order is unpredictable.
 */
export function selectRandomQuestions(count: number = QUESTIONS_PER_SESSION): Question[] {
  const categories: ProfileId[] = [
    "DEFENDER_CHAMPION",
    "SENTINEL_ORCHESTRATOR",
    "ENTRA_IDENTITY_ARCHITECT",
    "PURVIEW_TRUST_STEWARD",
    "COPILOT_NAVIGATOR",
  ];

  // Shuffle categories and pick `count` of them
  const shuffledCats = [...categories].sort(() => Math.random() - 0.5);
  const selectedCats = shuffledCats.slice(0, Math.min(count, categories.length));

  const selected: Question[] = [];
  for (const cat of selectedCats) {
    const catQuestions = QUESTION_BANK.filter((q) => q.category === cat);
    const shuffled = [...catQuestions].sort(() => Math.random() - 0.5);
    selected.push(shuffled[0]); // 1 question per category
  }

  // Shuffle the final selection
  return selected.sort(() => Math.random() - 0.5);
}
