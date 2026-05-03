export type ConfidenceScore = 'High' | 'Medium' | 'Low';

export interface ArchitecturalIntent {
  topic: string;
  decision: string;
  rationale: string;
  tradeoffs?: string[];
}

export interface ContextCapsule {
  timestamp: string;
  projectContext: string;
  architecturalIntent: ArchitecturalIntent[];
  confidenceScore: ConfidenceScore;
  stylePreferences?: string[];
  openIssues?: string[];
}

export function isContextCapsule(value: unknown): value is ContextCapsule {
  if (!isRecord(value)) return false;

  return (
    typeof value.timestamp === 'string' &&
    typeof value.projectContext === 'string' &&
    Array.isArray(value.architecturalIntent) &&
    value.architecturalIntent.every(isArchitecturalIntent) &&
    isConfidenceScore(value.confidenceScore)
  );
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isArchitecturalIntent(value: unknown): value is ArchitecturalIntent {
  if (!isRecord(value)) return false;

  return (
    typeof value.topic === 'string' &&
    typeof value.decision === 'string' &&
    typeof value.rationale === 'string' &&
    (value.tradeoffs === undefined ||
      (Array.isArray(value.tradeoffs) &&
        value.tradeoffs.every((tradeoff) => typeof tradeoff === 'string')))
  );
}

function isConfidenceScore(value: unknown): value is ConfidenceScore {
  return value === 'High' || value === 'Medium' || value === 'Low';
}
