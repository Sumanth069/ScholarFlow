import { Rule } from './engine';
import { ruleId001, ruleId002, ruleId003 } from './rules/identity';
import { ruleAc001, ruleAc002 } from './rules/academic';
import { ruleIn001, ruleIn002 } from './rules/income';
import { ruleBk001, ruleBk002 } from './rules/banking';
import { ruleDq001, ruleDq002 } from './rules/documents';
import { ruleEl001, ruleEl002 } from './rules/eligibility';

export * from './engine';
export * from './rules/identity';
export * from './rules/academic';
export * from './rules/income';
export * from './rules/banking';
export * from './rules/documents';
export * from './rules/eligibility';

export const allRules: Rule[] = [
  ruleId001,
  ruleId002,
  ruleId003,
  ruleAc001,
  ruleAc002,
  ruleIn001,
  ruleIn002,
  ruleBk001,
  ruleBk002,
  ruleDq001,
  ruleDq002,
  ruleEl001,
  ruleEl002,
];
