"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const steps = [
  { label: "Analyzing Notes" },
  { label: "Blending Scents" },
  { label: "Finding Matches" },
];

export default function LoadingPage() {
  const router = useRouter();
  const [progress, setProgress] = useState([0, 0, 0]);

  useEffect(() => {
    // Animate each bar sequentially
    let timeouts: NodeJS.Timeout[] = [];
    timeouts.push(
      setTimeout(() => setProgress([100, 0, 0]), 400)
    );
    timeouts.push(
      setTimeout(() => setProgress([100, 80, 0]), 1200)
    );
    timeouts.push(
      setTimeout(() => setProgress([100, 100, 100]), 2000)
    );
    // Redirect after all bars are filled
    timeouts.push(
      setTimeout(() => router.push("/results"), 2700)
    );
    return () => timeouts.forEach(clearTimeout);
  }, [router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 font-jakarta">
      <div className="w-full max-w-md mx-auto flex flex-col items-center">
        <h1 className="text-2xl sm:text-3xl font-bold mb-10 text-center">Calculating Your Perfect Fragrance Match</h1>
        <div className="w-full flex flex-col gap-6">
          {steps.map((step, i) => (
            <div key={step.label} className="w-full">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{step.label}</span>
              </div>
              <div className="w-full h-3 bg-neutral-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-black to-neutral-700 transition-all duration-700"
                  style={{ width: `${progress[i]}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
} 