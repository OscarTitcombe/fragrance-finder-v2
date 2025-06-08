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
  const [, setPulse] = useState([false, false, false]);
  const [, setCompleted] = useState([false, false, false]);


  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];
    // Bar 1: smooth fill
    setProgress([100, 0, 0]);
    timeouts.push(setTimeout(() => {
      setPulse([true, false, false]);
      setTimeout(() => setPulse([false, false, false]), 400);
      // Bar 2: fill to 50% slowly
      setProgress([100, 50, 0]);
      timeouts.push(setTimeout(() => {
        setProgress([100, 100, 0]);
        setCompleted([true, true, false]);
        setPulse([false, true, false]);
        setTimeout(() => setPulse([false, false, false]), 400);
        // Bar 3: smooth fill
        timeouts.push(setTimeout(() => {
          setProgress([100, 100, 100]);
          setCompleted([true, true, true]);
          setPulse([false, false, true]);
          setTimeout(() => setPulse([false, false, false]), 400);
          // Redirect after all bars are filled and pulse is done
          timeouts.push(setTimeout(() => router.push("/results"), 2200 + 400));
        }, 2200));
      }, 900)); // 900ms for bar 2 to fill from 50% to 100%
    }, 2200)); // 2200ms for bar 1 to fill
    return () => timeouts.forEach(clearTimeout);
  }, [router]);

  return (
    <main className="min-h-screen w-full flex flex-col justify-center items-center bg-gradient-to-b from-white to-gray-100 font-jakarta">
      <div className="w-full max-w-md mx-auto flex flex-col items-center space-y-4">
        <h1 className="text-2xl sm:text-3xl font-bold mb-10 text-center">Calculating Your Perfect Fragrance Match</h1>
        <div className="w-full flex flex-col gap-6">
          {steps.map((step, i) => (
            <div key={step.label} className="w-full">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{step.label}</span>
              </div>
              <div className="w-full h-3 bg-neutral-200 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all bg-gradient-to-r from-black to-neutral-700"
                  style={{ width: `${progress[i]}%`, transitionDuration: i === 1 ? (progress[i] === 50 ? '1800ms' : '900ms') : '2200ms' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

/* Add to globals.css:
@keyframes bar-pulse {
  0% { transform: scaleY(1); }
  40% { transform: scaleY(1.18); }
  100% { transform: scaleY(1); }
}
.animate-bar-pulse {
  animation: bar-pulse 0.4s cubic-bezier(.36,.07,.19,.97) both;
}
.bar-green-transition {
  background-image: linear-gradient(to right, #22c55e, #16a34a);
  transition: background-image 0.3s;
}
*/ 