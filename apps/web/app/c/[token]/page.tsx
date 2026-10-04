'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  Lock,
  CheckCircle2,
  Upload,
  ArrowRight,
  ShieldCheck,
  FileText,
} from 'lucide-react';

export default function ScopedCorrectionPage() {
  const [otpEntered, setOtpEntered] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [newFileSelected, setNewFileSelected] = useState(false);

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpEntered.trim().length >= 4) {
      setAuthenticated(true);
    }
  };

  const handleSubmitCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600">
          <AlertTriangle className="w-4 h-4" />
          <span>Single-Use Scoped Correction Session</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">Application Correction Portal</h1>
        <p className="text-sm text-slate-500">
          Application Ref: <strong className="text-slate-800 font-mono">SF-2026-000415</strong> • Target Scheme: Post-Matric SC/ST
        </p>
      </div>

      {!authenticated ? (
        /* OTP Gate */
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm max-w-md mx-auto space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 mx-auto">
            <Lock className="w-6 h-6" />
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-lg font-bold text-slate-900">Security Verification Gate</h2>
            <p className="text-xs text-slate-500">
              To edit your application, please enter the 6-digit OTP sent to your registered mobile ending in <strong>****89</strong>.
            </p>
          </div>

          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Enter One-Time Password (OTP)
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpEntered}
                onChange={(e) => setOtpEntered(e.target.value)}
                placeholder="Enter 123456"
                className="w-full text-center tracking-widest text-lg font-mono p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="block text-[11px] text-slate-400 mt-1 text-center">
                (Demo mode: enter any 4-6 digits)
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition"
            >
              Verify OTP & Access Scoped Form
            </button>
          </form>
        </div>
      ) : submitted ? (
        /* Success Confirmation */
        <div className="bg-emerald-50 border border-emerald-200 p-8 rounded-3xl text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-emerald-900">Correction Successfully Resubmitted!</h2>
          <p className="text-sm text-emerald-700 max-w-md mx-auto">
            Your updated income certificate has been queued for re-extraction and automated re-evaluation.
            Application status is now <span className="font-mono font-bold">RESUBMITTED</span>.
          </p>
          <div className="text-xs text-slate-500 pt-2">
            This correction token has now been permanently invalidated.
          </div>
        </div>
      ) : (
        /* Scoped Form */
        <form onSubmit={handleSubmitCorrection} className="space-y-6">
          {/* Defect Explanation Card */}
          <div className="bg-amber-50/70 border border-amber-200 p-6 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Flagged Field: documents.INCOME_CERT</span>
            </div>
            <p className="text-sm text-slate-800">
              <strong>English:</strong> The uploaded Income Certificate was issued on <strong>01-Mar-2024</strong>, which is older than the allowed 12-month validity period.
            </p>
            <p className="text-xs text-slate-600">
              <strong>ಕನ್ನಡ:</strong> ನೀವು ಸಲ್ಲಿಸಿರುವ ಆದಾಯ ಪ್ರಮಾಣಪತ್ರವು 12 ತಿಂಗಳಿಗಿಂತ ಹಳೆಯದಾಗಿದೆ. ದಯವಿಟ್ಟು ಚಾಲ್ತಿಯಲ್ಲಿರುವ ಪ್ರಮಾಣಪತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.
            </p>
          </div>

          {/* Editable Field (Scoped) */}
          <div className="bg-white p-6 rounded-2xl border border-blue-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-600" />
              <span>Upload Fresh / Valid Income Certificate</span>
            </h3>

            <div
              onClick={() => setNewFileSelected(true)}
              className={`p-6 border-2 border-dashed rounded-xl text-center cursor-pointer transition ${
                newFileSelected
                  ? 'border-emerald-500 bg-emerald-50/40 text-emerald-800'
                  : 'border-slate-300 hover:border-blue-400 bg-slate-50'
              }`}
            >
              {newFileSelected ? (
                <div className="flex items-center justify-center gap-2 text-sm font-semibold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>income_certificate_2026_valid.pdf (Uploaded & Ready)</span>
                </div>
              ) : (
                <div className="space-y-1">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-medium text-slate-600">
                    Click to select new Nadakacheri Income Certificate (PDF / JPG)
                  </p>
                  <p className="text-[11px] text-slate-400">Must be issued within last 12 months</p>
                </div>
              )}
            </div>
          </div>

          {/* Locked Non-Defective Fields (Display Only) */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3 opacity-75">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500">
              <Lock className="w-3.5 h-3.5" />
              <span>Locked Fields (Verified & Non-Editable)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono text-slate-600">
              <div>Applicant Name: Priya Sharma</div>
              <div>Marksheet Score: 474 / 600 (79.0%)</div>
              <div>Bank Account: CNRB0000567 (DBT Active)</div>
              <div>Aadhaar: XXXX-XXXX-9921</div>
            </div>
          </div>

          {/* Resubmit Action */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="submit"
              disabled={!newFileSelected}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition disabled:opacity-50 flex items-center gap-2"
            >
              <span>Submit Corrected Dossier</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
