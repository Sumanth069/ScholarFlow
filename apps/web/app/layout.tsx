import './globals.css';
import type { Metadata } from 'next';
import { Navbar } from '../components/Navbar';

export const metadata: Metadata = {
  title: 'ScholarFlow | Transparent, Explainable Scholarship Integrity Platform',
  description:
    'Scholarship intake, extraction, pure deterministic rule engine, humane correction loop, and cryptographic audit chain for Indian public welfare schemes.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
            <div>
              <strong>ScholarFlow</strong> — Built for Algothon &apos;26. Aligned with DPDP Act 2023.
            </div>
            <div className="flex gap-4">
              <span>Zero-Plaintext Aadhaar</span>
              <span>•</span>
              <span>SHA-256 Audit Chain</span>
              <span>•</span>
              <span>Kannada / English Bilingual</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
