'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Scale,
  Lock,
  FileCheck2,
} from 'lucide-react';
import { matchNames, verhoeffValid } from '@scholarflow/matching';
import { evaluate, allRules } from '@scholarflow/rules';
import { Facts, Outcome, RuleResult } from '@scholarflow/shared';

interface DemoScenario {
  id: string;
  title: string;
  tag: string;
  description: string;
  facts: Facts;
}

const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'clean',
    title: 'Clean Eligible Applicant',
    tag: 'AUTO_CLEARED',
    description: 'All certificates valid, names align with high confidence, DBT active.',
    facts: {
      now: new Date('2026-10-04T12:00:00Z'),
      scheme: {
        slug: 'post-matric-sc-st',
        name: 'Post-Matric Scholarship Scheme',
        version: 1,
        minPercentage: 60.0,
        maxFamilyIncome: 250000,
        allowedCategories: ['SC', 'ST'],
        maxDocAgeMonths: 12,
        submissionDeadline: '2026-12-31T23:59:59Z',
      },
      form: {
        applicantName: 'Sumanth Kumar',
        dateOfBirth: '2005-06-15',
        gender: 'MALE',
        category: 'SC',
        statedIncome: 180000,
        statedPercentage: 82.5,
        aadhaarLast4: '5678',
        aadhaarHash: 'hash_sumanth_clean',
        accountNumber: '123456789012',
        ifscCode: 'SBIN0001234',
        mobile: '9876543210',
        email: 'sumanth@example.com',
        institutionCode: 'INST-BLR-001',
      },
      docs: {
        MARKSHEET: {
          docType: 'MARKSHEET',
          fields: {
            studentName: { value: 'Sumanth Kumar', confidence: 0.98 },
            marksObtained: { value: 495, confidence: 0.95 },
            totalMarks: { value: 600, confidence: 0.95 },
          },
        },
        INCOME_CERT: {
          docType: 'INCOME_CERT',
          fields: {
            holderName: { value: 'Sumanth Kumar', confidence: 0.96 },
            annualIncome: { value: 180000, confidence: 0.95 },
            issuedDate: { value: '2026-05-10', confidence: 0.95 },
          },
        },
        PASSBOOK: {
          docType: 'PASSBOOK',
          fields: {
            accountHolder: { value: 'Sumanth Kumar', confidence: 0.97 },
            accountNumber: { value: '123456789012', confidence: 0.97 },
            ifsc: { value: 'SBIN0001234', confidence: 0.97 },
          },
        },
      },
      registry: {
        income: { valid: true, annualIncome: 180000 },
        caste: { valid: true, category: 'SC' },
      },
      bank: { ifscKnown: true, dbtActive: true },
      institution: { listed: true, active: true },
      dedupe: {
        aadhaarHashApps: [],
        bankHashApps: [],
        phoneApps: [],
        fileHashApps: [],
      },
    },
  },
  {
    id: 'name_drift',
    title: 'Initials & Spelling Variation',
    tag: 'INTELLIGENT MATCH',
    description: 'Applicant entered "K Sumanth" but marksheet states "Kumar Sumanth".',
    facts: {
      now: new Date('2026-10-04T12:00:00Z'),
      scheme: {
        slug: 'post-matric-sc-st',
        name: 'Post-Matric Scholarship Scheme',
        version: 1,
        minPercentage: 60.0,
        maxFamilyIncome: 250000,
        allowedCategories: ['SC', 'ST'],
        maxDocAgeMonths: 12,
        submissionDeadline: '2026-12-31T23:59:59Z',
      },
      form: {
        applicantName: 'K Sumanth',
        dateOfBirth: '2005-06-15',
        gender: 'MALE',
        category: 'SC',
        statedIncome: 180000,
        statedPercentage: 82.5,
        aadhaarLast4: '5678',
        aadhaarHash: 'hash_sumanth_initials',
        accountNumber: '123456789012',
        ifscCode: 'SBIN0001234',
        mobile: '9876543210',
        email: 'sumanth@example.com',
        institutionCode: 'INST-BLR-001',
      },
      docs: {
        MARKSHEET: {
          docType: 'MARKSHEET',
          fields: {
            studentName: { value: 'Kumar Sumanth', confidence: 0.98 },
            marksObtained: { value: 495, confidence: 0.95 },
            totalMarks: { value: 600, confidence: 0.95 },
          },
        },
        INCOME_CERT: {
          docType: 'INCOME_CERT',
          fields: {
            holderName: { value: 'K Sumanth', confidence: 0.96 },
            annualIncome: { value: 180000, confidence: 0.95 },
            issuedDate: { value: '2026-05-10', confidence: 0.95 },
          },
        },
        PASSBOOK: {
          docType: 'PASSBOOK',
          fields: {
            accountHolder: { value: 'K Sumanth', confidence: 0.97 },
            accountNumber: { value: '123456789012', confidence: 0.97 },
            ifsc: { value: 'SBIN0001234', confidence: 0.97 },
          },
        },
      },
      registry: {
        income: { valid: true, annualIncome: 180000 },
        caste: { valid: true, category: 'SC' },
      },
      bank: { ifscKnown: true, dbtActive: true },
      institution: { listed: true, active: true },
      dedupe: {
        aadhaarHashApps: [],
        bankHashApps: [],
        phoneApps: [],
        fileHashApps: [],
      },
    },
  },
  {
    id: 'expired_income',
    title: 'Expired Income Certificate',
    tag: 'NEEDS_CORRECTION',
    description: 'Income certificate is 18 months old. Triggers targeted correction link instead of hard rejection.',
    facts: {
      now: new Date('2026-10-04T12:00:00Z'),
      scheme: {
        slug: 'post-matric-sc-st',
        name: 'Post-Matric Scholarship Scheme',
        version: 1,
        minPercentage: 60.0,
        maxFamilyIncome: 250000,
        allowedCategories: ['SC', 'ST'],
        maxDocAgeMonths: 12,
        submissionDeadline: '2026-12-31T23:59:59Z',
      },
      form: {
        applicantName: 'Priya Sharma',
        dateOfBirth: '2004-11-20',
        gender: 'FEMALE',
        category: 'SC',
        statedIncome: 140000,
        statedPercentage: 79.0,
        aadhaarLast4: '9921',
        aadhaarHash: 'hash_priya_exp',
        accountNumber: '987654321098',
        ifscCode: 'CNRB0000567',
        mobile: '9123456789',
        email: 'priya@example.com',
        institutionCode: 'INST-MYS-002',
      },
      docs: {
        MARKSHEET: {
          docType: 'MARKSHEET',
          fields: {
            studentName: { value: 'Priya Sharma', confidence: 0.99 },
            marksObtained: { value: 474, confidence: 0.98 },
            totalMarks: { value: 600, confidence: 0.98 },
          },
        },
        INCOME_CERT: {
          docType: 'INCOME_CERT',
          fields: {
            holderName: { value: 'Priya Sharma', confidence: 0.96 },
            annualIncome: { value: 140000, confidence: 0.95 },
            issuedDate: { value: '2024-03-01', confidence: 0.98 }, // Expired (>12 mo)
          },
        },
        PASSBOOK: {
          docType: 'PASSBOOK',
          fields: {
            accountHolder: { value: 'Priya Sharma', confidence: 0.97 },
            accountNumber: { value: '987654321098', confidence: 0.97 },
            ifsc: { value: 'CNRB0000567', confidence: 0.97 },
          },
        },
      },
      registry: {
        income: { valid: true, annualIncome: 140000 },
        caste: { valid: true, category: 'SC' },
      },
      bank: { ifscKnown: true, dbtActive: true },
      institution: { listed: true, active: true },
      dedupe: {
        aadhaarHashApps: [],
        bankHashApps: [],
        phoneApps: [],
        fileHashApps: [],
      },
    },
  },
  {
    id: 'duplicate_fraud',
    title: 'Syndicate Duplicate Fraud',
    tag: 'FRAUD_GUARD',
    description: 'Aadhaar hash matches an existing active claim in another district.',
    facts: {
      now: new Date('2026-10-04T12:00:00Z'),
      scheme: {
        slug: 'post-matric-sc-st',
        name: 'Post-Matric Scholarship Scheme',
        version: 1,
        minPercentage: 60.0,
        maxFamilyIncome: 250000,
        allowedCategories: ['SC', 'ST'],
        maxDocAgeMonths: 12,
        submissionDeadline: '2026-12-31T23:59:59Z',
      },
      form: {
        applicantName: 'Ramesh Babu',
        dateOfBirth: '2003-03-10',
        gender: 'MALE',
        category: 'ST',
        statedIncome: 120000,
        statedPercentage: 88.0,
        aadhaarLast4: '3344',
        aadhaarHash: 'hash_duplicate_aadhaar_882',
        accountNumber: '556677889900',
        ifscCode: 'SBIN0001234',
        mobile: '9888877777',
        email: 'ramesh@example.com',
        institutionCode: 'INST-MNG-003',
      },
      docs: {
        MARKSHEET: {
          docType: 'MARKSHEET',
          fields: {
            studentName: { value: 'Ramesh Babu', confidence: 0.98 },
            marksObtained: { value: 528, confidence: 0.98 },
            totalMarks: { value: 600, confidence: 0.98 },
          },
        },
        INCOME_CERT: {
          docType: 'INCOME_CERT',
          fields: {
            holderName: { value: 'Ramesh Babu', confidence: 0.97 },
            annualIncome: { value: 120000, confidence: 0.95 },
            issuedDate: { value: '2026-04-12', confidence: 0.98 },
          },
        },
        PASSBOOK: {
          docType: 'PASSBOOK',
          fields: {
            accountHolder: { value: 'Ramesh Babu', confidence: 0.97 },
            accountNumber: { value: '556677889900', confidence: 0.97 },
            ifsc: { value: 'SBIN0001234', confidence: 0.97 },
          },
        },
      },
      registry: {
        income: { valid: true, annualIncome: 120000 },
        caste: { valid: true, category: 'ST' },
      },
      bank: { ifscKnown: true, dbtActive: true },
      institution: { listed: true, active: true },
      dedupe: {
        aadhaarHashApps: ['SF-2026-000881'],
        bankHashApps: [],
        phoneApps: [],
        fileHashApps: [],
      },
    },
  },
];

export default function LandingPage() {
  const [selectedScenario, setSelectedScenario] = useState<DemoScenario>(DEMO_SCENARIOS[0]!);
  const [evalResult, setEvalResult] = useState<{
    outcome: Outcome;
    results: RuleResult[];
  }>(() => evaluate(DEMO_SCENARIOS[0]!.facts, allRules));

  const handleSelectScenario = (scenario: DemoScenario) => {
    setSelectedScenario(scenario);
    const res = evaluate(scenario.facts, allRules);
    setEvalResult(res);
  };

  const getOutcomeBadge = (outcome: Outcome) => {
    switch (outcome) {
      case 'AUTO_CLEARED':
        return {
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
          label: 'AUTO CLEARED (Eligible)',
        };
      case 'NEEDS_CORRECTION':
        return {
          bg: 'bg-amber-100 text-amber-800 border-amber-300',
          icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
          label: 'ACTION REQUIRED (Needs Correction)',
        };
      case 'MANUAL_REVIEW':
        return {
          bg: 'bg-blue-100 text-blue-800 border-blue-300',
          icon: <RefreshCw className="w-5 h-5 text-blue-600" />,
          label: 'MANUAL REVIEW (Human Verification)',
        };
      case 'REJECTED_INELIGIBLE':
        return {
          bg: 'bg-rose-100 text-rose-800 border-rose-300',
          icon: <ShieldAlert className="w-5 h-5 text-rose-600" />,
          label: 'REJECTED (Ineligible / Fraud Alert)',
        };
    }
  };

  const badge = getOutcomeBadge(evalResult.outcome);

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8 pb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Generation Indian Public Digital Welfare Stack</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
          No More Silent Rejections. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Explainable, Dignified Scholarships.
          </span>
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
          ScholarFlow replaces bureaucratic &ldquo;defective&rdquo; application tags with automated
          correction loops, regional transliteration-tolerant name matching, and cryptographic audit chains.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/apply"
            className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition flex items-center gap-2"
          >
            <span>Start Live Application</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/reviewer"
            className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-sm shadow-sm transition flex items-center gap-2"
          >
            <span>Open Reviewer Desk</span>
          </Link>
          <Link
            href="/audit"
            className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-sm shadow-sm transition flex items-center gap-2"
          >
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>Verify Audit Chain</span>
          </Link>
        </div>
      </section>

      {/* Pillars Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Humane Correction Loops</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Never get silently rejected for a minor initial variation or an expired certificate.
              Receive a single-use scoped link with plain Kannada and English explanations.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
              <Scale className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">LLM Reads, Pure Rules Decide</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              No hallucinations in civic decisions. Multimodal models perform structured OCR,
              while a 100% deterministic, zero-I/O pure rule engine enforces eligibility.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">DPDP Act 2023 Aligned</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Zero plaintext Aadhaar storage (salted HMAC only), encrypted bank vaults,
              and tamper-evident SHA-256 audit block chains preventing syndicate fraud.
            </p>
          </div>
        </div>
      </section>

      {/* Live Interactive Health-Check Engine Sandbox */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
          <div className="p-6 sm:p-8 bg-slate-900 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400">
                <FileCheck2 className="w-4 h-4" />
                <span>Interactive Live Engine Benchmark</span>
              </div>
              <h2 className="text-2xl font-bold mt-1">Rule Engine & Name Matching Simulator</h2>
              <p className="text-slate-400 text-sm mt-1">
                Select a simulated citizen scenario below to see the deterministic evaluation in real time.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-mono text-emerald-400 border border-slate-700">
                Engine: @scholarflow/rules v1.0.0 (Pure TS)
              </div>
            </div>
          </div>

          {/* Scenario Tabs */}
          <div className="p-6 bg-slate-50 border-b border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {DEMO_SCENARIOS.map((sc) => {
                const isSelected = selectedScenario.id === sc.id;
                return (
                  <button
                    key={sc.id}
                    onClick={() => handleSelectScenario(sc)}
                    className={`text-left p-4 rounded-xl border transition ${
                      isSelected
                        ? 'bg-white border-blue-600 shadow-sm ring-2 ring-blue-500/20'
                        : 'bg-white/60 border-slate-200 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                      <span className="font-semibold text-slate-800">{sc.title}</span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">{sc.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Engine Output Display */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-2xl border bg-slate-50">
              <div>
                <span className="text-xs uppercase font-semibold text-slate-500 tracking-wider">
                  Deterministic Engine Outcome
                </span>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-bold ${badge.bg}`}
                  >
                    {badge.icon}
                    <span>{badge.label}</span>
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    Evaluation Time: &lt; 2ms (Injected IST Clock)
                  </span>
                </div>
              </div>

              {evalResult.outcome === 'NEEDS_CORRECTION' && (
                <Link
                  href="/c/sample-token"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs shadow-sm transition flex items-center gap-1.5"
                >
                  <span>Experience Scoped Correction Link</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            {/* Rule Results Matrix */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-3">Evaluated Rules & Evidence Panel</h4>
              <div className="space-y-3">
                {evalResult.results.map((res) => {
                  const isPass = res.status === 'PASS';
                  return (
                    <div
                      key={res.ruleId}
                      className={`p-4 rounded-xl border transition ${
                        isPass ? 'bg-white border-slate-200' : 'bg-red-50/50 border-red-200'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-100 text-slate-800">
                            {res.ruleId}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-bold ${
                              res.severity === 'HARD_FAIL'
                                ? 'bg-red-100 text-red-800'
                                : res.severity === 'FIXABLE'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {res.severity}
                          </span>
                          <span className="text-xs font-semibold text-slate-900">{res.reviewerMsg}</span>
                        </div>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded ${
                            isPass ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {res.status}
                        </span>
                      </div>

                      {/* Bilingual Messages */}
                      <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div>
                          <strong>English:</strong> {res.msg.en}
                        </div>
                        <div className="text-slate-500">
                          <strong>ಕನ್ನಡ:</strong> {res.msg.kn}
                        </div>
                        {res.fixHint && (
                          <div className="text-amber-800 font-medium pt-1">
                            <strong>Remedial Action:</strong> {res.fixHint}
                          </div>
                        )}
                      </div>

                      {/* Evidence Chips */}
                      {res.evidence.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                          {res.evidence.map((ev, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700"
                            >
                              <span className="font-semibold text-slate-500">{ev.label}:</span>
                              <span>{ev.entered || ev.extracted || ev.snippet}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
