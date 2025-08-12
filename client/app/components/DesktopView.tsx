"use client";

import { useEffect } from "react";
import getApiBaseUrl from "../utils/getApiBaseUrl";
import QRCode from "qrcode.react";
import Image from "next/image";

interface DesktopViewProps {
  onError: (message: string) => void;
}

export default function DesktopView({ onError }: DesktopViewProps) {
  useEffect(() => {
    const warmUpBackend = async () => {
      try {
        const url = await getApiBaseUrl(process.env.NEXT_PUBLIC_API_URL);
        await fetch(`${url}/health`);
      } catch (err) {
        console.error("Failed to warm up backend:", err);
        onError("Failed to connect to the backend. Please check the server.");
      }
    };
    warmUpBackend();
  }, []);

  return (
    <div className="w-full md:flex md:space-x-8">
      <div className="mb-8 md:mb-0 md:w-1/2 p-6 bg-gray-800 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">Instructions</h2>
        <Image
          src="/images/boy.webp"
          alt="Instruction on how to place the phone"
          width={200}
          height={200}
          className="mx-auto mb-4 rounded-lg"
        />
        <p className="text-gray-300">
          Place your phone on your chest as shown in the image to measure your
          heart's vibrations.
        </p>
      </div>

      <div className="md:w-1/2">
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg text-center h-full flex flex-col justify-center">
          <h2 className="text-xl font-semibold mb-3">Scan to Open on Mobile</h2>
          <p className="text-gray-400 mb-4">
            This application is designed for mobile devices. Please scan the QR
            code with your phone to continue.
          </p>
          <div className="p-4 bg-white inline-block rounded-lg mx-auto">
            <QRCode
              value={typeof window !== "undefined" ? window.location.href : ""}
              size={128}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
