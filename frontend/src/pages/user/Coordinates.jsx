import { useState } from 'react';

export default function Coordinates() {
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  const handleMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const scaleX = 1402 / rect.width;
    const scaleY = 1122 / rect.height;

    const x = Math.round((event.clientX - rect.left) * scaleX);
    const y = Math.round((event.clientY - rect.top) * scaleY);

    setCoords({ x, y });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_30%),linear-gradient(135deg,#020617_0%,#111827_50%,#0f172a_100%)] px-4 py-10 text-white">
      <div className="flex h-full gap-5">
        <div className="flex-2 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 shadow-xl shadow-black/20">
          <div className="flex flex-col gap-5">
            <p className="text-5xl font-extrabold text-slate-200">Certificate Coordinate Tracker</p>
            <div className="rounded-2xl border border-sky-400/20 bg-sky-500/10 font-mono text-sky-300 text-8xl p-5 flex flex-col gap-5">
              <span>X: {coords.x}</span>
              <span>Y: {coords.y}</span>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 shadow-2xl shadow-black/40">
          <img
            src="/certificate_temp.png"
            alt="Certificate template"
            onMouseMove={handleMouseMove}
            className="h-180 w-full rounded-2xl object-contain"
          />
        </div>
      </div>
    </div>
  );
}
