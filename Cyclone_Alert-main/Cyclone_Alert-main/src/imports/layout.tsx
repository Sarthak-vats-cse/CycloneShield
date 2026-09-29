import './globals.css';
import 'leaflet/dist/leaflet.css'; // Prevents broken grid map tile rendering
import { Inter, Syne } from 'next/font/google';
import { Sidebar } from '@/components/layout/Sidebar';

// Configure design system fonts
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const syne = Syne({ subsets: ['latin'], variable: '--font-syne' });

export const metadata = {
  title: 'CycloneShield',
  description: 'AI-Powered Cyclone Risk and Advisory Dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${syne.variable}`}>
      <body className="flex min-h-screen bg-[#07111F] text-zinc-100 font-sans antialiased">
        {/* Persistent Navigation Sidebar */}
        <Sidebar />
        
        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
