'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, FileText, UserCheck, Search, Activity } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-sm">
                SF
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-slate-900">ScholarFlow</span>
                <span className="block text-xs text-blue-600 font-medium">GovTech Integrity Platform</span>
              </div>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-1 font-medium text-sm text-slate-600">
            <Link
              href="/"
              className={`px-3 py-2 rounded-lg transition ${
                pathname === '/' ? 'text-blue-600 bg-blue-50 font-semibold' : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Demo & Overview
            </Link>
            <Link
              href="/apply"
              className={`px-3 py-2 rounded-lg transition ${
                pathname === '/apply' ? 'text-blue-600 bg-blue-50 font-semibold' : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                Apply (Applicant)
              </span>
            </Link>
            <Link
              href="/reviewer"
              className={`px-3 py-2 rounded-lg transition ${
                pathname === '/reviewer' ? 'text-blue-600 bg-blue-50 font-semibold' : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-4 h-4" />
                Reviewer Desk
              </span>
            </Link>
            <Link
              href="/audit"
              className={`px-3 py-2 rounded-lg transition ${
                pathname === '/audit' ? 'text-blue-600 bg-blue-50 font-semibold' : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Audit Chain
              </span>
            </Link>
            <Link
              href="/c/sample-token"
              className={`px-3 py-2 rounded-lg transition ${
                pathname.startsWith('/c/') ? 'text-blue-600 bg-blue-50 font-semibold' : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-amber-600" />
                Correction Flow
              </span>
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              DPDP 2023 Aligned
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
