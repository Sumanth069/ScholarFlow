'use client';

import React, { useState } from 'react';
import {
  UserCheck,
  Lock,
  Unlock,
  AlertCircle,
  CheckCircle,
  Send,
  FileText,
  Clock,
  ShieldAlert,
  ChevronRight,
  Eye,
} from 'lucide-react';

interface QueueItem {
  id: string;
  publicRef: string;
  applicantName: string;
  category: string;
  institution: string;
  status: string;
  flagReason: string;
  submittedAt: string;
}

const SAMPLE_QUEUE: QueueItem[] = [
  {
    id: 'app-1',
    publicRef: 'SF-2026-000412',
    applicantName: 'K Sumanth',
    category: 'SC',
    institution: 'Bangalore Institute of Technology',
    status: 'MANUAL_REVIEW',
    flagReason: 'Name Variation: Initials expansion (K Sumanth vs Kumar Sumanth)',
    submittedAt: '2026-10-04 10:15 IST',
  },
  {
    id: 'app-2',
    publicRef: 'SF-2026-000415',
    applicantName: 'Priya Sharma',
    category: 'SC',
    institution: 'Mysore National College of Engineering',
    status: 'NEEDS_CORRECTION',
    flagReason: 'Expired Income Certificate (>12 months)',
    submittedAt: '2026-10-04 11:30 IST',
  },
  {
    id: 'app-3',
    publicRef: 'SF-2026-000419',
    applicantName: 'Ramesh Babu',
    category: 'ST',
    institution: 'Mangalore Government Polytechnic',
    status: 'MANUAL_REVIEW',
    flagReason: 'Duplicate Aadhaar Hash Alert (Cross-district check)',
    submittedAt: '2026-10-04 12:05 IST',
  },
];

export default function ReviewerPage() {
  const [selectedCase, setSelectedCase] = useState<QueueItem>(SAMPLE_QUEUE[0]!);
  const [claimed, setClaimed] = useState(false);
  const [correctionNote, setCorrectionNote] = useState(
    'Please re-upload an active income certificate issued within the past 12 months from Nadakacheri.'
  );
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleClaim = () => {
    setClaimed(!claimed);
    setActionNotice(
      !claimed
        ? `Case ${selectedCase.publicRef} locked to your reviewer session.`
        : `Lock released on ${selectedCase.publicRef}.`
    );
  };

  const handleSendCorrection = () => {
    setActionNotice(
      `Scoped correction link dispatched via SMS & Email for ${selectedCase.publicRef}. Application moved to CORRECTION_SENT.`
    );
  };

  const handleApprove = () => {
    setActionNotice(`Application ${selectedCase.publicRef} APPROVED. Moved to SANCTIONED.`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600">
            <UserCheck className="w-4 h-4" />
            <span>Department Verification Desk</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Reviewer Adjudication Queue</h1>
          <p className="text-sm text-slate-500">
            Verify flagged cases, resolve phonetic name drift, and compose remedial correction requests.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-xs font-medium text-blue-800">
            3 Cases in Verification Backlog
          </div>
        </div>
      </div>

      {actionNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Main Grid: Queue on Left, Case Detail on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Queue List */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Queue</h3>
          <div className="space-y-3">
            {SAMPLE_QUEUE.map((item) => {
              const isSelected = selectedCase.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedCase(item);
                    setClaimed(false);
                    setActionNotice(null);
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition ${
                    isSelected
                      ? 'bg-white border-blue-600 shadow-md ring-2 ring-blue-500/10'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {item.publicRef}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.submittedAt}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm">{item.applicantName}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{item.institution}</p>

                  <div className="mt-3 p-2 rounded-lg bg-amber-50 border border-amber-200/60 text-xs text-amber-800 flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                    <span>{item.flagReason}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Case Dossier */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          {/* Claim Lock Banner */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  claimed ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {claimed ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
              </div>
              <div>
                <span className="text-xs font-semibold uppercase text-slate-500">Concurrency Lock</span>
                <p className="text-sm font-bold text-slate-900">
                  {claimed ? 'Locked to You (Editing Allowed)' : 'Unlocked (Read-Only Mode)'}
                </p>
              </div>
            </div>

            <button
              onClick={handleClaim}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                claimed
                  ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
              }`}
            >
              {claimed ? (
                <>
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Release Claim</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Claim Application</span>
                </>
              )}
            </button>
          </div>

          {/* Dossier Header */}
          <div className="border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-sm font-bold text-blue-600">{selectedCase.publicRef}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800">
                {selectedCase.status}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{selectedCase.applicantName}</h2>
            <p className="text-xs text-slate-500 mt-1">
              Category: {selectedCase.category} • Institution: {selectedCase.institution}
            </p>
          </div>

          {/* Side-by-side Evidence Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-bold uppercase text-slate-500">Applicant Form Input</span>
              <div className="text-sm space-y-1 font-mono text-slate-800">
                <div>Name: {selectedCase.applicantName}</div>
                <div>Aadhaar: XXXX-XXXX-5678 (Masked)</div>
                <div>Category: {selectedCase.category}</div>
                <div>Annual Income: ₹1,80,000</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-2">
              <span className="text-xs font-bold uppercase text-blue-700">Document OCR Extraction</span>
              <div className="text-sm space-y-1 font-mono text-slate-800">
                <div>Marksheet Name: &ldquo;Kumar Sumanth&rdquo; (95% Jaro-Winkler match)</div>
                <div>Income Cert: Issued 10-May-2026 (Valid)</div>
                <div>Bank Passbook: SBIN0001234 (Active DBT)</div>
              </div>
            </div>
          </div>

          {/* Correction Composer */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Send className="w-4 h-4 text-blue-600" />
                <span>Compose Actionable Correction Notice</span>
              </h4>
              <span className="text-xs text-slate-500">Dispatched via SMS, WhatsApp & Email</span>
            </div>

            <textarea
              disabled={!claimed}
              rows={3}
              value={correctionNote}
              onChange={(e) => setCorrectionNote(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-300 p-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
            />

            <div className="flex flex-wrap justify-between items-center gap-3 pt-2">
              <div className="text-xs text-slate-500">
                Generates a single-use scoped link valid for 7 days.
              </div>

              <div className="flex gap-2">
                <button
                  disabled={!claimed}
                  onClick={handleSendCorrection}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs shadow-sm transition disabled:opacity-50"
                >
                  Send Correction Request
                </button>
                <button
                  disabled={!claimed}
                  onClick={handleApprove}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-sm transition disabled:opacity-50"
                >
                  Approve Application
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
