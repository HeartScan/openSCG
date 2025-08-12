"use client";

import { useState, useEffect } from "react";
import useIsMobile from "./hooks/useIsMobile";
import DesktopView from "./components/DesktopView";
import MobileView from "./components/MobileView";

export default function Home() {
  const isMobile = useIsMobile();
  const [hasMounted, setHasMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 font-sans bg-gray-900 text-white">
      <div className="w-full max-w-4xl text-center">
        <header className="mb-8">
          <h1 className="text-5xl font-bold mb-2">OpenSCG</h1>
          <p className="text-xl text-gray-400">Live Heart Signal Sharing</p>
        </header>

        <div className="mb-8 p-6 bg-gray-800 rounded-xl shadow-lg">
          <p className="text-gray-300">
            This is an open-source project for real-time seismocardiography (SCG) signal acquisition and streaming.
            You can find more information and contribute on{' '}
            <a
              href="https://github.com/HeartScan/openSCG"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              GitHub
            </a>
            .
          </p>
        </div>

        {hasMounted && (isMobile ? <MobileView onError={setError} /> : <DesktopView onError={setError} />)}

        {error && (
          <div className="mt-8 w-full max-w-4xl bg-red-800 p-4 rounded-lg text-center">
            <p className="text-white font-bold">{error}</p>
          </div>
        )}
      </div>
    </main>
  );
}
