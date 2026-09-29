'use client';

import dynamic from 'next/dynamic';

// Dynamically import MapView with SSR disabled
const MapView = dynamic(() => import('@/components/MapView'), { 
  ssr: false,
  loading: () => <div className="w-full h-[650px] bg-slate-900 animate-pulse rounded-2xl" />
});

export default function Home() {
  return (
    <main className="p-6 bg-slate-950 min-h-screen">
      <MapView />
    </main>
  );
}
