import { Facts, Outcome, RuleResult, Severity } from '@scholarflow/shared';

export interface Rule {
  id: string;
  version: string;
  group: 'ID' | 'AC' | 'IN' | 'BK' | 'DQ' | 'EL';
  description: string;
  run(f: Facts): RuleResult | RuleResult[];
}

/**
 * Outcome reduction (pure function):
 * 1. Any HARD_FAIL with status FAIL -> REJECTED_INELIGIBLE
 * 2. Else any FIXABLE with status FAIL -> NEEDS_CORRECTION
 * 3. Else any WARN with status FAIL, low-confidence decisive field, or STRONG fraud signal -> MANUAL_REVIEW
 * 4. Else -> AUTO_CLEARED
 *
 * An uncaught exception in any rule returns RuleStatus 'ERROR', and an ERROR forces MANUAL_REVIEW.
 */
export function reduceOutcome(results: RuleResult[]): Outcome {
  // If any rule crashed with ERROR -> force MANUAL_REVIEW (never a silent auto-pass)
  const hasError = results.some(r => r.status === 'ERROR');
  if (hasError) {
    return 'MANUAL_REVIEW';
  }

  // 1. Any HARD_FAIL that failed -> REJECTED_INELIGIBLE
  const hasHardFail = results.some(
    r => r.severity === 'HARD_FAIL' && r.status === 'FAIL'
  );
  if (hasHardFail) {
    return 'REJECTED_INELIGIBLE';
  }

  // 2. Else any FIXABLE that failed -> NEEDS_CORRECTION
  const hasFixableFail = results.some(
    r => r.severity === 'FIXABLE' && r.status === 'FAIL'
  );
  if (hasFixableFail) {
    return 'NEEDS_CORRECTION';
  }

  // 3. Else any WARN that failed -> MANUAL_REVIEW
  const hasWarnFail = results.some(
    r => r.severity === 'WARN' && r.status === 'FAIL'
  );
  if (hasWarnFail) {
    return 'MANUAL_REVIEW';
  }

  // 4. Otherwise, completely clean -> AUTO_CLEARED
  return 'AUTO_CLEARED';
}

/**
 * Evaluates all provided rules against the facts in pure memory.
 * No database I/O, no network calls, fully deterministic.
 */
export function evaluate(
  facts: Facts,
  rules: Rule[]
): { results: RuleResult[]; outcome: Outcome } {
  const results: RuleResult[] = [];

  for (const rule of rules) {
    try {
      const output = rule.run(facts);
      if (Array.isArray(output)) {
        results.push(...output);
      } else {
        results.push(output);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      results.push({
        ruleId: rule.id,
        severity: 'WARN',
        status: 'ERROR',
        evidence: [{ label: 'Rule Execution Exception', snippet: errorMsg }],
        msg: {
          en: `Rule ${rule.id} encountered an unexpected error during evaluation.`,
          kn: `ನಿಯಮ ${rule.id} ಮೌಲ್ಯಮಾಪನ ಮಾಡುವಾಗ ದೋಷ ಸಂಭವಿಸಿದೆ.`,
        },
        reviewerMsg: `Rule thrown an exception: ${errorMsg}. Requires manual verification.`,
        fields: [],
      });
    }
  }

  const outcome = reduceOutcome(results);
  return { results, outcome };
}
