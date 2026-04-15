"use client";

interface BabyVisualProps {
  week: number;
}

export default function BabyVisual({ week }: BabyVisualProps) {
  return (
    <div className="flex items-center justify-center py-5">
      <div className="relative w-52 h-52">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <defs>
            <radialGradient id="wombGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fce7f3" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#f5d0fe" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#e9d5ff" stopOpacity="0.1" />
            </radialGradient>
            <radialGradient id="skinTone" cx="40%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#fde0d9" />
              <stop offset="100%" stopColor="#f8c4b8" />
            </radialGradient>
            <radialGradient id="cheekBlush" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fca5a5" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#fca5a5" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Background glow */}
          <circle cx="100" cy="100" r="92" fill="url(#wombGlow)" />
          <circle cx="100" cy="100" r="92" fill="none" stroke="#f9a8d4" strokeWidth="0.8" strokeOpacity="0.3" />

          {/* Baby illustration by stage */}
          {week <= 4 && <CellStage week={week} />}
          {week >= 5 && week <= 8 && <EarlyEmbryo week={week} />}
          {week >= 9 && week <= 16 && <SmallBaby week={week} />}
          {week >= 17 && week <= 28 && <GrowingBaby week={week} />}
          {week >= 29 && <FullBaby week={week} />}
        </svg>
      </div>
    </div>
  );
}

function CellStage({ week }: { week: number }) {
  const cells = Math.min(8, Math.pow(2, week - 1));
  const positions = getCellPositions(cells);
  const r = week <= 2 ? 10 : 7;

  return (
    <g transform="translate(100, 100)">
      {positions.map((pos, i) => (
        <g key={i}>
          <circle cx={pos.x} cy={pos.y} r={r + 1} fill="#f9a8d4" opacity="0.3" />
          <circle cx={pos.x} cy={pos.y} r={r} fill="url(#skinTone)" />
          <circle cx={pos.x - r * 0.2} cy={pos.y - r * 0.2} r={r * 0.3} fill="white" opacity="0.3" />
        </g>
      ))}
    </g>
  );
}

function getCellPositions(count: number): { x: number; y: number }[] {
  if (count === 1) return [{ x: 0, y: 0 }];
  if (count === 2) return [{ x: -6, y: 0 }, { x: 6, y: 0 }];
  if (count === 4) return [{ x: -5, y: -5 }, { x: 5, y: -5 }, { x: -5, y: 5 }, { x: 5, y: 5 }];
  const positions: { x: number; y: number }[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    positions.push({ x: Math.cos(angle) * 8, y: Math.sin(angle) * 8 });
  }
  return positions;
}

function EarlyEmbryo({ week }: { week: number }) {
  const size = 12 + (week - 5) * 3;
  return (
    <g transform="translate(100, 100)">
      {/* Amniotic sac */}
      <ellipse cx="0" cy="0" rx={size + 12} ry={size + 10} fill="#fce7f3" opacity="0.4" />
      <ellipse cx="0" cy="0" rx={size + 12} ry={size + 10} fill="none" stroke="#f9a8d4" strokeWidth="0.5" opacity="0.3" />

      {/* Body - soft peanut shape */}
      <ellipse cx="0" cy="3" rx={size * 0.55} ry={size * 0.75} fill="url(#skinTone)" />

      {/* Head - proportionally large */}
      <circle cx="0" cy={-size * 0.45} r={size * 0.42} fill="url(#skinTone)" />

      {/* Eye dot */}
      {week >= 7 && (
        <circle cx={size * 0.08} cy={-size * 0.5} r={1} fill="#4a2040" opacity="0.6" />
      )}

      {/* Tiny heartbeat indicator */}
      {week >= 6 && (
        <circle cx={0} cy={2} r={1.5} fill="#f87171" opacity="0.6" />
      )}
    </g>
  );
}

function SmallBaby({ week }: { week: number }) {
  const p = (week - 9) / 7;
  const headR = 16 + p * 5;
  const bodyH = 20 + p * 12;
  const bodyW = 11 + p * 5;

  return (
    <g transform="translate(100, 105)">
      {/* Head */}
      <circle cx="0" cy={-bodyH * 0.4} r={headR} fill="url(#skinTone)" />

      {/* Eyes - cute closed curves */}
      <path
        d={`M ${-headR * 0.3} ${-bodyH * 0.43} q ${headR * 0.12} ${-2.5} ${headR * 0.24} 0`}
        fill="none" stroke="#6b3a5a" strokeWidth="1.3" strokeLinecap="round"
      />
      <path
        d={`M ${headR * 0.06} ${-bodyH * 0.43} q ${headR * 0.12} ${-2.5} ${headR * 0.24} 0`}
        fill="none" stroke="#6b3a5a" strokeWidth="1.3" strokeLinecap="round"
      />

      {/* Nose - tiny dot */}
      <circle cx="0" cy={-bodyH * 0.34} r={0.8} fill="#e8a090" />

      {/* Mouth - gentle smile */}
      {p > 0.3 && (
        <path
          d={`M ${-headR * 0.12} ${-bodyH * 0.28} q ${headR * 0.12} ${2} ${headR * 0.24} 0`}
          fill="none" stroke="#d4878f" strokeWidth="0.8" strokeLinecap="round"
        />
      )}

      {/* Cheek blush */}
      <circle cx={-headR * 0.45} cy={-bodyH * 0.35} r={3} fill="url(#cheekBlush)" />
      <circle cx={headR * 0.45} cy={-bodyH * 0.35} r={3} fill="url(#cheekBlush)" />

      {/* Body */}
      <ellipse cx="0" cy={bodyH * 0.12} rx={bodyW} ry={bodyH * 0.42} fill="url(#skinTone)" />

      {/* Arms */}
      <path
        d={`M ${-bodyW * 0.9} ${bodyH * 0.0} q ${-6 - p * 3} ${bodyH * 0.15} ${-4 - p * 2} ${bodyH * 0.25}`}
        fill="none" stroke="#f0b8a8" strokeWidth={3 + p * 1.5} strokeLinecap="round"
      />
      <path
        d={`M ${bodyW * 0.9} ${bodyH * 0.0} q ${6 + p * 3} ${bodyH * 0.15} ${4 + p * 2} ${bodyH * 0.25}`}
        fill="none" stroke="#f0b8a8" strokeWidth={3 + p * 1.5} strokeLinecap="round"
      />

      {/* Legs */}
      <path
        d={`M ${-bodyW * 0.4} ${bodyH * 0.48} q ${-2} ${bodyH * 0.2} ${0} ${bodyH * 0.3}`}
        fill="none" stroke="#f0b8a8" strokeWidth={3 + p * 1.5} strokeLinecap="round"
      />
      <path
        d={`M ${bodyW * 0.4} ${bodyH * 0.48} q ${2} ${bodyH * 0.2} ${0} ${bodyH * 0.3}`}
        fill="none" stroke="#f0b8a8" strokeWidth={3 + p * 1.5} strokeLinecap="round"
      />
    </g>
  );
}

function GrowingBaby({ week }: { week: number }) {
  const p = (week - 17) / 11;
  const headR = 20 + p * 4;
  const bodyH = 30 + p * 10;
  const bodyW = 15 + p * 5;

  return (
    <g transform="translate(100, 108)">
      {/* Head */}
      <circle cx="0" cy={-bodyH * 0.35} r={headR} fill="url(#skinTone)" />

      {/* Ear */}
      <ellipse
        cx={headR * 0.92} cy={-bodyH * 0.35}
        rx={headR * 0.12} ry={headR * 0.2}
        fill="#f0b8a8" opacity="0.6"
      />

      {/* Eyes - sweet closed arcs */}
      <path
        d={`M ${-headR * 0.35} ${-bodyH * 0.38} q ${headR * 0.15} ${-3} ${headR * 0.3} 0`}
        fill="none" stroke="#5a2d45" strokeWidth="1.4" strokeLinecap="round"
      />
      <path
        d={`M ${headR * 0.05} ${-bodyH * 0.38} q ${headR * 0.15} ${-3} ${headR * 0.3} 0`}
        fill="none" stroke="#5a2d45" strokeWidth="1.4" strokeLinecap="round"
      />

      {/* Nose */}
      <ellipse cx={headR * 0.02} cy={-bodyH * 0.31} rx={1.2} ry={0.8} fill="#e0a090" />

      {/* Smile */}
      <path
        d={`M ${-headR * 0.15} ${-bodyH * 0.26} q ${headR * 0.15} ${3} ${headR * 0.3} 0`}
        fill="none" stroke="#d4878f" strokeWidth="0.9" strokeLinecap="round"
      />

      {/* Cheek blush */}
      <circle cx={-headR * 0.5} cy={-bodyH * 0.3} r={4} fill="url(#cheekBlush)" />
      <circle cx={headR * 0.5} cy={-bodyH * 0.3} r={4} fill="url(#cheekBlush)" />

      {/* Body - rounder, softer */}
      <ellipse cx="0" cy={bodyH * 0.12} rx={bodyW} ry={bodyH * 0.38} fill="url(#skinTone)" />

      {/* Belly button */}
      {p > 0.3 && (
        <circle cx="0" cy={bodyH * 0.15} r={0.8} fill="#e0a090" opacity="0.4" />
      )}

      {/* Arms - softly curved toward body */}
      <path
        d={`M ${-bodyW * 0.95} ${bodyH * -0.02} q ${-9} ${bodyH * 0.12} ${-5} ${bodyH * 0.28}`}
        fill="none" stroke="#f0b8a8" strokeWidth={4.5 + p * 2} strokeLinecap="round"
      />
      <path
        d={`M ${bodyW * 0.95} ${bodyH * -0.02} q ${9} ${bodyH * 0.12} ${5} ${bodyH * 0.28}`}
        fill="none" stroke="#f0b8a8" strokeWidth={4.5 + p * 2} strokeLinecap="round"
      />

      {/* Hands - small circles */}
      <circle cx={-bodyW - 5} cy={bodyH * 0.28} r={2.5 + p} fill="url(#skinTone)" />
      <circle cx={bodyW + 5} cy={bodyH * 0.28} r={2.5 + p} fill="url(#skinTone)" />

      {/* Legs */}
      <path
        d={`M ${-bodyW * 0.45} ${bodyH * 0.45} q ${-3} ${bodyH * 0.2} ${-1} ${bodyH * 0.32}`}
        fill="none" stroke="#f0b8a8" strokeWidth={4.5 + p * 2} strokeLinecap="round"
      />
      <path
        d={`M ${bodyW * 0.45} ${bodyH * 0.45} q ${3} ${bodyH * 0.2} ${1} ${bodyH * 0.32}`}
        fill="none" stroke="#f0b8a8" strokeWidth={4.5 + p * 2} strokeLinecap="round"
      />

      {/* Feet */}
      <ellipse cx={-bodyW * 0.5} cy={bodyH * 0.8} rx={3.5 + p} ry={2} fill="url(#skinTone)" />
      <ellipse cx={bodyW * 0.5} cy={bodyH * 0.8} rx={3.5 + p} ry={2} fill="url(#skinTone)" />
    </g>
  );
}

function FullBaby({ week }: { week: number }) {
  const p = (week - 29) / 13;
  const headR = 24 + p * 3;

  return (
    <g transform="translate(100, 100) rotate(-15)">
      {/* Head - tucked position */}
      <circle cx={-6} cy={-28} r={headR} fill="url(#skinTone)" />

      {/* Ear */}
      <ellipse cx={-6 + headR * 0.88} cy={-30} rx={headR * 0.1} ry={headR * 0.18} fill="#f0b8a8" opacity="0.5" />

      {/* Eyes - peacefully closed */}
      <path
        d={`M ${-6 - headR * 0.32} ${-30} q ${headR * 0.14} ${-2.5} ${headR * 0.28} 0`}
        fill="none" stroke="#5a2d45" strokeWidth="1.3" strokeLinecap="round"
      />
      <path
        d={`M ${-6 + headR * 0.04} ${-30} q ${headR * 0.14} ${-2.5} ${headR * 0.28} 0`}
        fill="none" stroke="#5a2d45" strokeWidth="1.3" strokeLinecap="round"
      />

      {/* Nose */}
      <ellipse cx={-4} cy={-24} rx={1.3} ry={0.9} fill="#e0a090" />

      {/* Peaceful smile */}
      <path
        d="M -9 -21 q 4 2.5 8 0"
        fill="none" stroke="#d4878f" strokeWidth="0.9" strokeLinecap="round"
      />

      {/* Cheek blush */}
      <circle cx={-6 - headR * 0.4} cy={-25} r={4} fill="url(#cheekBlush)" />
      <circle cx={-6 + headR * 0.45} cy={-25} r={4} fill="url(#cheekBlush)" />

      {/* Hair wisps */}
      {week >= 34 && (
        <g opacity="0.3">
          <path
            d={`M ${-6 - headR * 0.4} ${-28 - headR * 0.75} q ${headR * 0.2} ${-headR * 0.2} ${headR * 0.5} ${-headR * 0.1}`}
            fill="none" stroke="#8b5a5a" strokeWidth="1.2" strokeLinecap="round"
          />
          <path
            d={`M ${-6 + headR * 0.05} ${-28 - headR * 0.82} q ${headR * 0.25} ${-headR * 0.15} ${headR * 0.45} ${headR * 0.05}`}
            fill="none" stroke="#8b5a5a" strokeWidth="1.2" strokeLinecap="round"
          />
          <path
            d={`M ${-6 - headR * 0.55} ${-28 - headR * 0.55} q ${-headR * 0.1} ${-headR * 0.2} ${headR * 0.1} ${-headR * 0.3}`}
            fill="none" stroke="#8b5a5a" strokeWidth="1" strokeLinecap="round"
          />
        </g>
      )}

      {/* Curled body - softer organic shape */}
      <path
        d={`M -1 ${-28 + headR * 0.7}
            C 16 -8, 20 12, 10 28
            C 4 38, -8 36, -14 26
            C -19 16, -17 -2, -10 ${-28 + headR * 0.5}`}
        fill="url(#skinTone)"
      />

      {/* Arm tucked - hand near face */}
      <path
        d="M -4 -2 q -8 6 -6 14"
        fill="none" stroke="#f0b8a8" strokeWidth={5 + p * 2} strokeLinecap="round"
      />
      <circle cx={-10} cy={-12} r={3.5 + p * 0.5} fill="url(#skinTone)" />

      {/* Other arm */}
      <path
        d="M 6 3 q 7 8 4 16"
        fill="none" stroke="#f0b8a8" strokeWidth={4 + p * 2} strokeLinecap="round" opacity="0.7"
      />

      {/* Legs curled */}
      <path
        d="M 2 26 q 8 6 4 14"
        fill="none" stroke="#f0b8a8" strokeWidth={6 + p * 2} strokeLinecap="round"
      />
      <path
        d="M -6 28 q -2 8 -4 14"
        fill="none" stroke="#f0b8a8" strokeWidth={6 + p * 2} strokeLinecap="round"
      />

      {/* Feet */}
      <ellipse cx={5} cy={42} rx={4 + p} ry={2.5} fill="url(#skinTone)" transform="rotate(-10 5 42)" />
      <ellipse cx={-5} cy={44} rx={4 + p} ry={2.5} fill="url(#skinTone)" transform="rotate(10 -5 44)" />
    </g>
  );
}
