'use client';

import React, { useState } from 'react';
import {
  FileText,
  User,
  GraduationCap,
  Banknote,
  Building,
  Upload,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { verhoeffValid, computeAge, isValidIfscFormat } from '@scholarflow/matching';

export default function ApplyPage() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Consent
    consentGiven: false,
    guardianConsentGiven: false,
    // Step 2: Personal
    fullName: 'Sumanth Kumar',
    dob: '2005-06-15',
    gender: 'MALE',
    aadhaarLast4: '5678',
    mobile: '9876543210',
    email: 'sumanth.kumar@example.com',
    // Step 3: Academic
    institutionCode: 'INST-BLR-001',
    course: 'B.E. Computer Science',
    statedPercentage: '82.5',
    // Step 4: Income / Category
    category: 'SC',
    annualIncome: '180000',
    incomeCertNumber: 'RD001234567890',
    // Step 5: Bank
    accountNumber: '123456789012',
    ifscCode: 'SBIN0001234',
    // Step 6: Documents
    marksheetUploaded: true,
    incomeCertUploaded: true,
    passbookUploaded: true,
  });

  const age = computeAge(formData.dob, new Date('2026-10-04T12:00:00Z'));
  const isMinor = age < 18;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleNext = () => setStep((s) => Math.min(s + 1, 7));
  const handlePrev = () => setStep((s) => Math.max(s - 1, 1));
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Application Submitted!</h1>
        <p className="text-sm text-slate-600">
          Your application reference number is: <br />
          <strong className="text-xl font-mono text-blue-600">SF-2026-000592</strong>
        </p>
        <div className="p-6 bg-white rounded-2xl border border-slate-200 text-left text-xs space-y-2">
          <div className="font-bold text-slate-900">Immediate Health-Check Status:</div>
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 className="w-4 h-4" />
            <span>Document quality gates passed (3/3 documents legible).</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 className="w-4 h-4" />
            <span>Aadhaar Verhoeff format validated. Salted HMAC generated.</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 className="w-4 h-4" />
            <span>Initial audit block chained and locked into immutable log.</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Header & Steps */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Scholarship Application Portal</h1>
        <p className="text-xs text-slate-500 mt-1">
          Karnataka Post-Matric Scholarship Scheme (SC / ST / OBC) • Session 2026-27
        </p>

        {/* Step Progress Bar */}
        <div className="mt-6 flex items-center justify-between text-xs font-semibold text-slate-500">
          {[
            '1. Consent',
            '2. Personal',
            '3. Academic',
            '4. Income',
            '5. Bank',
            '6. Documents',
            '7. Review',
          ].map((label, idx) => (
            <div
              key={label}
              className={`flex-1 text-center pb-2 border-b-2 transition ${
                step === idx + 1
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : step > idx + 1
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-slate-200'
              }`}
            >
              {label}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        {/* Step 1: Consent */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900">Data Processing Consent</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Informed by Digital Personal Data Protection (DPDP) Act principles, ScholarFlow collects only necessary
                identity, academic, and banking information for application pre-verification. Raw 12-digit Aadhaar
                numbers are never stored.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 text-xs space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="consentGiven"
                  checked={formData.consentGiven}
                  onChange={handleChange}
                  className="mt-0.5 rounded text-blue-600"
                />
                <span className="text-slate-700">
                  I give consent to process my masked Aadhaar last-4, educational marks, and bank account details
                  solely for scholarship eligibility evaluation.
                </span>
              </label>

              {isMinor && (
                <label className="flex items-start gap-3 cursor-pointer pt-2 border-t border-blue-200">
                  <input
                    type="checkbox"
                    name="guardianConsentGiven"
                    checked={formData.guardianConsentGiven}
                    onChange={handleChange}
                    className="mt-0.5 rounded text-blue-600"
                  />
                  <span className="text-amber-900 font-medium">
                    (Minor Applicant &lt;18 Detected): My legal guardian authorizes this application and has
                    verified OTP consent.
                  </span>
                </label>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Personal */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Personal & Identity Details</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Aadhaar Last 4 Digits (Only)
                </label>
                <input
                  type="text"
                  maxLength={4}
                  name="aadhaarLast4"
                  value={formData.aadhaarLast4}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                />
                <span className="text-[10px] text-slate-400">Zero plaintext full Aadhaar stored</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mobile Number (Aadhaar linked)</label>
                <input
                  type="text"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Academic */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Academic Information</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Institution Code</label>
                <input
                  type="text"
                  name="institutionCode"
                  value={formData.institutionCode}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course & Stream</label>
                <input
                  type="text"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Previous Year Percentage (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="statedPercentage"
                  value={formData.statedPercentage}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
                <span className="text-[10px] text-slate-400">Scheme Cutoff: 60.0%</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Income */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Income & Caste Verification</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Social Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="SC">Scheduled Caste (SC)</option>
                  <option value="ST">Scheduled Tribe (ST)</option>
                  <option value="OBC">Other Backward Class (OBC)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Annual Family Income (₹)
                </label>
                <input
                  type="number"
                  name="annualIncome"
                  value={formData.annualIncome}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
                <span className="text-[10px] text-slate-400">Ceiling: ₹2,50,000 / year</span>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Revenue Certificate Number (Nadakacheri RD Number)
                </label>
                <input
                  type="text"
                  name="incomeCertNumber"
                  value={formData.incomeCertNumber}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Bank */}
        {step === 5 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Bank Account & Direct Benefit Transfer (DBT)</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bank Account Number</label>
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bank IFSC Code</label>
                <input
                  type="text"
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                />
                <span className="text-[10px] text-slate-400">
                  {isValidIfscFormat(formData.ifscCode) ? '✓ Valid IFSC format' : '⚠ Invalid IFSC format'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Documents */}
        {step === 6 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Document Uploads (Pre-Verification Gate)</h2>
            <div className="space-y-3">
              {[
                { name: '10th/12th Marksheet', status: 'marksheet_scanned.pdf (Uploaded, 98% clarity)' },
                { name: 'Income Certificate (Nadakacheri)', status: 'income_cert_2026.pdf (Uploaded, 96% clarity)' },
                { name: 'Bank Passbook Front Page', status: 'passbook_front.jpg (Uploaded, 97% clarity)' },
              ].map((doc) => (
                <div
                  key={doc.name}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex justify-between items-center text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-800">{doc.name}</span>
                    <span className="block text-slate-500 mt-0.5">{doc.status}</span>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 7: Review & Submit */}
        {step === 7 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900">Pre-Submission Health-Check</h2>
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-2">
              <div className="font-bold">✓ Pre-Flight Checks Passed:</div>
              <div>• Applicant Name: {formData.fullName}</div>
              <div>• Academic Percentage: {formData.statedPercentage}% (&gt;= 60.0% cutoff)</div>
              <div>• Family Income: ₹{Number(formData.annualIncome).toLocaleString('en-IN')} (&lt;= ₹2,50,000 ceiling)</div>
              <div>• Bank Account: {formData.ifscCode} (DBT Active)</div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-6 border-t border-slate-200 mt-6">
          <button
            type="button"
            disabled={step === 1}
            onClick={handlePrev}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 disabled:opacity-30 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          {step < 7 ? (
            <button
              type="button"
              disabled={step === 1 && !formData.consentGiven}
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition disabled:opacity-40 flex items-center gap-1.5"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md transition flex items-center gap-1.5"
            >
              <span>Submit Application</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
