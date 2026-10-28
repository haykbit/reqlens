import type { Locale, LocalizedText, ViewId } from "@/types";

export const localize = (value: LocalizedText, locale: Locale) => value[locale];

const dictionary = {
  currentReview: { en: "Current review", es: "Revisión actual" },
  evidence: { en: "Evidence", es: "Evidencias" },
  acceptance: { en: "Acceptance", es: "Aceptación" },
  openPreview: { en: "Open preview", es: "Abrir preview" },
  requestChanges: { en: "Request changes", es: "Solicitar cambios" },
  verified: { en: "Verified", es: "Verificado" },
  needsEvidence: { en: "Needs evidence", es: "Falta evidencia" },
  inReview: { en: "In review", es: "En revisión" },
  pending: { en: "Pending", es: "Pendiente" },
  failed: { en: "Failed", es: "Fallido" },
  overview: { en: "Overview", es: "Resumen" },
  changes: { en: "Changes", es: "Cambios" },
  tests: { en: "Tests", es: "Tests" },
  replay: { en: "Replay", es: "Replay" },
  activity: { en: "Activity", es: "Actividad" },
  acceptanceChain: { en: "Acceptance chain", es: "Cadena de aceptación" },
  acceptanceChainHint: {
    en: "Trace the ticket from product intent to the reviewed revision.",
    es: "Sigue el ticket desde la intención de producto hasta la revisión.",
  },
  criteria: { en: "Acceptance criteria", es: "Criterios de aceptación" },
  criteriaHint: {
    en: "Every claim opens to its implementation and proof.",
    es: "Cada afirmación se conecta con su implementación y evidencia.",
  },
  reviewSummary: { en: "Review summary", es: "Resumen de revisión" },
  reviewSummaryHint: {
    en: "Open findings reported for this evidence snapshot.",
    es: "Hallazgos abiertos reportados para este snapshot de evidencias.",
  },
  testsLinked: { en: "linked tests", es: "tests vinculados" },
  implementation: { en: "Implementation", es: "Implementación" },
  selectedCriterion: { en: "Selected criterion", es: "Criterio seleccionado" },
  proof: { en: "Proof", es: "Evidencia" },
  changedFiles: { en: "Changed files", es: "Archivos modificados" },
  changedFilesHint: {
    en: "Every file is mapped to scope and product intent.",
    es: "Cada archivo se relaciona con alcance e intención de producto.",
  },
  whyThisChange: { en: "Why this change exists", es: "Por qué existe este cambio" },
  relatedRequirements: { en: "Related requirements", es: "Requisitos relacionados" },
  testEvidence: { en: "Test evidence", es: "Evidencias de test" },
  testEvidenceHint: {
    en: "Deterministic results remain separate from agent judgment.",
    es: "Los resultados deterministas se mantienen separados del juicio del agente.",
  },
  assertions: { en: "assertions", es: "assertions" },
  acceptanceReplay: { en: "Acceptance Replay", es: "Acceptance Replay" },
  acceptanceReplayHint: {
    en: "A recorded product journey tied to the reviewed commit.",
    es: "Un recorrido de producto grabado y vinculado al commit revisado.",
  },
  recordedRun: { en: "Recorded run", es: "Ejecución registrada" },
  step: { en: "Step", es: "Paso" },
  timeline: { en: "Timeline", es: "Timeline" },
  timelineHint: {
    en: "Product, agent, Git, test, and review events in one place.",
    es: "Eventos de producto, agente, Git, tests y revisión en un solo lugar.",
  },
  localOnly: { en: "Local only", es: "Solo local" },
  revision: { en: "Revision", es: "Revisión" },
  checks: { en: "Checks", es: "Comprobaciones" },
  openFindings: { en: "Open findings", es: "Hallazgos abiertos" },
  replayStatus: { en: "Replay status", es: "Estado del replay" },
  loading: { en: "Loading evidence…", es: "Cargando evidencias…" },
  errorTitle: { en: "ReqLens could not load this review", es: "ReqLens no pudo cargar esta revisión" },
  errorBody: {
    en: "Make sure the local API is running, then try again.",
    es: "Comprueba que la API local está activa y vuelve a intentarlo.",
  },
  retry: { en: "Retry", es: "Reintentar" },
  actionQueued: { en: "Action queued", es: "Acción en cola" },
  copied: { en: "Copied", es: "Copiado" },
  evidenceStaysLocal: { en: "Evidence stays on this machine.", es: "Las evidencias permanecen en este equipo." },
  required: { en: "Required", es: "Obligatorio" },
  verification: { en: "Verification", es: "Verificación" },
  nextAction: { en: "Next action", es: "Siguiente acción" },
  diffAt: { en: "Diff at", es: "Diff en" },
  verificationGate: { en: "Verification gate", es: "Control de verificación" },
  syncRepository: { en: "Sync repository", es: "Sincronizar repositorio" },
  refreshEvidence: { en: "Refresh evidence", es: "Actualizar evidencias" },
  noReviews: { en: "No reviews are being tracked", es: "No hay revisiones en seguimiento" },
  noReviewsBody: {
    en: "Ask Codex to start ReqLens when it begins a real ticket. The agent supplies product context; ReqLens reads Git directly.",
    es: "Pide a Codex que inicie ReqLens al comenzar un ticket real. El agente aporta el contexto de producto y ReqLens lee Git directamente.",
  },
  agentBridge: { en: "Agent bridge", es: "Puente con el agente" },
  agentBridgeBody: {
    en: "Linear, Jira, Asana, or GitHub stay connected to your coding agent. ReqLens receives one normalized contract instead of storing every provider credential.",
    es: "Linear, Jira, Asana o GitHub siguen conectados a tu agente. ReqLens recibe un único contrato normalizado sin guardar credenciales de cada proveedor.",
  },
  startCommand: { en: "Start from a real repository", es: "Iniciar desde un repositorio real" },
  startCommandBody: {
    en: "The ReqLens skill executes this command after reading the ticket.",
    es: "La skill de ReqLens ejecuta este comando después de leer el ticket.",
  },
  waitingForAgent: { en: "Waiting for agent evidence", es: "Esperando evidencias del agente" },
  noCriteria: { en: "No acceptance criteria were reported with this ticket.", es: "El ticket no incluye criterios de aceptación." },
  noChanges: { en: "No Git changes since the base revision.", es: "No hay cambios Git desde la revisión base." },
  noTests: { en: "No test results have been reported by the agent.", es: "El agente todavía no ha reportado resultados de test." },
  noReplay: { en: "No acceptance replay has been reported.", es: "Todavía no se ha reportado un replay de aceptación." },
  noFindings: { en: "No open findings", es: "Sin hallazgos abiertos" },
  workingTree: { en: "Working tree", es: "Working tree" },
  clean: { en: "Clean", es: "Limpio" },
  dirty: { en: "Uncommitted changes", es: "Cambios sin commit" },
  updated: { en: "Updated", es: "Actualizado" },
  realData: { en: "Live data", es: "Datos reales" },
  openTicket: { en: "Open ticket", es: "Abrir ticket" },
  source: { en: "Source", es: "Origen" },
} as const;

export type CopyKey = keyof typeof dictionary;

export function ui(key: CopyKey, locale: Locale) {
  return dictionary[key][locale];
}

export const viewLabel: Record<ViewId, CopyKey> = {
  overview: "overview",
  changes: "changes",
  tests: "tests",
  replay: "replay",
  activity: "activity",
};
