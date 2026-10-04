'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Hash,
  Database,
} from 'lucide-react';
import { computeAuditHash, verifyAuditChain } from '@scholarflow/db';

interface AuditLogItem {
  id: number;
  at: string;
  actorId: string;
  actorRole: string;
  entity: string;
  entityId: string;
  event: string;
  payload: Record<string, unknown>;
  prevHash: string;
  hash: string;
}

const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

function buildInitialChain(): AuditLogItem[] {
  const chain: AuditLogItem[] = [];

  // Block 1
  const b1: Omit<AuditLogItem, 'hash'> = {
    id: 1,
    at: '2026-10-04T10:00:00.000Z',
    actorId: 'usr_applicant_001',
    actorRole: 'APPLICANT',
    entity: 'Application',
    entityId: 'SF-2026-000412',
    event: 'APPLICATION_CREATED',
    payload: { scheme: 'post-matric-sc-st', institution: 'INST-BLR-001' },
    prevHash: GENESIS_HASH,
  };
  const h1 = computeAuditHash(b1);
  chain.push({ ...b1, hash: h1 });

  // Block 2
  const b2: Omit<AuditLogItem, 'hash'> = {
    id: 2,
    at: '2026-10-04T10:05:00.000Z',
    actorId: 'sys_inngest_worker',
    actorRole: 'SYSTEM',
    entity: 'Application',
    entityId: 'SF-2026-000412',
    event: 'DOCUMENTS_EXTRACTED',
    payload: { marksheetExtracted: true, nameConfidence: 0.95 },
    prevHash: h1,
  };
  const h2 = computeAuditHash(b2);
  chain.push({ ...b2, hash: h2 });

  // Block 3
  const b3: Omit<AuditLogItem, 'hash'> = {
    id: 3,
    at: '2026-10-04T10:05:02.000Z',
    actorId: 'sys_rule_engine',
    actorRole: 'SYSTEM',
    entity: 'Evaluation',
    entityId: 'SF-2026-000412',
    event: 'EVALUATION_COMPLETED',
    payload: { outcome: 'MANUAL_REVIEW', reason: 'Initial expansion match' },
    prevHash: h2,
  };
  const h3 = computeAuditHash(b3);
  chain.push({ ...b3, hash: h3 });

  // Block 4
  const b4: Omit<AuditLogItem, 'hash'> = {
    id: 4,
    at: '2026-10-04T11:15:00.000Z',
    actorId: 'usr_reviewer_099',
    actorRole: 'REVIEWER',
    entity: 'ReviewAction',
    entityId: 'SF-2026-000412',
    event: 'CLAIM_LOCKED',
    payload: { reviewerName: 'District Nodal Officer 4' },
    prevHash: h3,
  };
  const h4 = computeAuditHash(b4);
  chain.push({ ...b4, hash: h4 });

  return chain;
}

export default function AuditPage() {
  const [chain, setChain] = useState<AuditLogItem[]>(buildInitialChain);
  const [verifyState, setVerifyState] = useState<{
    tested: boolean;
    valid: boolean;
    brokenIndex: number;
  }>({
    tested: true,
    valid: true,
    brokenIndex: -1,
  });

  const handleRunVerify = () => {
    const res = verifyAuditChain(chain);
    setVerifyState({ tested: true, valid: res.valid, brokenIndex: res.brokenIndex });
  };

  const handleSimulateTamper = (targetId: number) => {
    const modified = chain.map((item) => {
      if (item.id === targetId) {
        return {
          ...item,
          payload: { ...item.payload, tamperedField: 'ILLEGAL_MODIFICATION_DETECTED' },
        };
      }
      return item;
    });
    setChain(modified);
    const res = verifyAuditChain(modified);
    setVerifyState({ tested: true, valid: res.valid, brokenIndex: res.brokenIndex });
  };

  const handleReset = () => {
    const fresh = buildInitialChain();
    setChain(fresh);
    const res = verifyAuditChain(fresh);
    setVerifyState({ tested: true, valid: res.valid, brokenIndex: res.brokenIndex });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600">
            <ShieldCheck className="w-4 h-4" />
            <span>Cryptographic Proof of Governance</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Immutable Audit Hash Chain</h1>
          <p className="text-sm text-slate-500">
            Every status transition, document extraction, and approval decision is linked in a SHA-256
            hash chain. Tamper-proof defense against institutional collusion.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunVerify}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-sm transition flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Re-verify Chain Integrity</span>
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium transition flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Verification Status Banner */}
      <div
        className={`p-5 rounded-2xl border transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
          verifyState.valid
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              verifyState.valid ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
            }`}
          >
            {verifyState.valid ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : (
              <ShieldAlert className="w-6 h-6" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-base">
              {verifyState.valid
                ? 'Cryptographic Ledger Verified: 100% Intact'
                : `TAMPERING DETECTED at Block #${verifyState.brokenIndex + 1}!`}
            </h3>
            <p className="text-xs opacity-90">
              {verifyState.valid
                ? `All ${chain.length} audit blocks match canonical sha256(prevHash + payload) signatures.`
                : `Hash mismatch discovered. The payload was altered without recalculating downstream blocks.`}
            </p>
          </div>
        </div>

        <div className="text-xs font-mono">
          Last Check: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Chain Blocks */}
      <div className="space-y-4">
        {chain.map((block, index) => {
          const isBroken = !verifyState.valid && verifyState.brokenIndex === index;
          return (
            <div
              key={block.id}
              className={`p-6 rounded-2xl border transition relative ${
                isBroken
                  ? 'bg-rose-50/50 border-rose-400 ring-2 ring-rose-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
              }`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-slate-900 text-white text-xs font-bold flex items-center justify-center font-mono">
                    #{block.id}
                  </span>
                  <span className="font-bold text-sm text-slate-900">{block.event}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-100 font-medium text-slate-600">
                    {block.actorRole}: {block.actorId}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">{block.at}</span>
                  <button
                    onClick={() => handleSimulateTamper(block.id)}
                    className="text-xs text-rose-600 hover:text-rose-800 underline font-medium"
                  >
                    Simulate Tamper
                  </button>
                </div>
              </div>

              {/* Hashes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono bg-slate-50 p-3 rounded-xl border border-slate-100 mb-3">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Previous Hash</span>
                  <span className="text-slate-600 truncate block">{block.prevHash}</span>
                </div>
                <div>
                  <span className="text-emerald-700 block text-[10px] uppercase font-bold">Block Hash</span>
                  <span className="text-emerald-800 truncate block font-bold">{block.hash}</span>
                </div>
              </div>

              {/* Payload */}
              <div className="text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400">Canonical Payload</span>
                <pre className="mt-1 p-2.5 rounded-lg bg-slate-100/70 text-slate-700 overflow-x-auto text-[11px]">
                  {JSON.stringify(block.payload, null, 2)}
                </pre>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
