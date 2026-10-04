import { AppStatus } from '@scholarflow/shared';

export const EDGES: Record<AppStatus, readonly AppStatus[]> = {
  DRAFT: ['SUBMITTED', 'WITHDRAWN'],
  SUBMITTED: ['PROCESSING', 'WITHDRAWN'],
  PROCESSING: [
    'AUTO_CLEARED',
    'NEEDS_CORRECTION',
    'MANUAL_REVIEW',
    'REJECTED_INELIGIBLE',
  ],
  NEEDS_CORRECTION: ['CORRECTION_SENT'],
  CORRECTION_SENT: [
    'RESUBMITTED',
    'LAPSED',
    'WITHDRAWN',
    'HELP_REQUIRED',
  ],
  RESUBMITTED: ['PROCESSING'],
  LAPSED: ['REOPENED', 'WITHDRAWN'],
  REOPENED: ['CORRECTION_SENT'],
  MANUAL_REVIEW: [
    'APPROVED_BY_REVIEWER',
    'NEEDS_CORRECTION',
    'REJECTED_INELIGIBLE',
  ],
  AUTO_CLEARED: ['SANCTIONED', 'MANUAL_REVIEW'],
  APPROVED_BY_REVIEWER: ['SANCTIONED'],
  REJECTED_INELIGIBLE: ['APPEALED'],
  APPEALED: ['MANUAL_REVIEW'],
  HELP_REQUIRED: ['NEEDS_CORRECTION', 'MANUAL_REVIEW'],
  SANCTIONED: [],
  WITHDRAWN: [],
} as const;

export class InvalidTransitionError extends Error {
  constructor(from: AppStatus, to: AppStatus) {
    super(`Invalid application state transition from "${from}" to "${to}".`);
    this.name = 'InvalidTransitionError';
  }
}

export class ConcurrentModificationError extends Error {
  constructor(appId: string) {
    super(`Concurrent modification detected on application "${appId}". Version conflict.`);
    this.name = 'ConcurrentModificationError';
  }
}

/**
 * Validates whether transition from one AppStatus to another is permissible.
 */
export function canTransition(from: AppStatus, to: AppStatus): boolean {
  const allowed = EDGES[from];
  return allowed ? allowed.includes(to) : false;
}

/**
 * Asserts valid transition, throws InvalidTransitionError if disallowed.
 */
export function assertValidTransition(from: AppStatus, to: AppStatus): void {
  if (!canTransition(from, to)) {
    throw new InvalidTransitionError(from, to);
  }
}
