import './globals.css';
import type { Metadata } from 'next';
import { Navbar } from '../components/Navbar';

export const metadata: Metadata = {
  title: 'ScholarFlow | Scholarship Application Pre-Verification & Correction',
  description:
    'Scholarship application pre-verification layer that explains problems and routes them for correction. Designed with DPDP principles in mind.',
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
              <strong>ScholarFlow</strong> — Pre-verification and correction layer. Designed with DPDP principles in mind.
            </div>
            <div className="flex gap-4 text-slate-400">
              <span>Masked Aadhaar storage</span>
              <span>•</span>
              <span>Audit hash chain</span>
              <span>•</span>
              <span>Bilingual support (EN / KN)</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
