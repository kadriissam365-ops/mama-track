"use client";

import { motion } from "framer-motion";

interface BabyVisualProps {
  week: number;
}

export default function BabyVisual({ week }: BabyVisualProps) {
  // Scale factor: baby grows from tiny to full size
  const scale = getScale(week);
  const opacity = Math.min(1, 0.4 + week * 0.015);

  return (
    <div className="flex items-center justify-center py-4">
      <div className="relative w-48 h-48">
        {/* Gradient background circle */}
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <defs>
            <radialGradient id="bgGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f9a8d4" stopOpacity="0.3" />
              <stop offset="60%" stopColor="#c084fc" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#e9d5ff" stopOpacity="0.1" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="95" fill="url(#bgGradient)" />
          <circle
            cx="100"
            cy="100"
            r="95"
            fill="none"
            stroke="#f9a8d4"
            strokeWidth="1"
            strokeOpacity="0.4"
          />
        </svg>

        {/* Animated baby SVG overlay */}
        <motion.div
          key={week}
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <motion.svg
            viewBox="0 0 200 200"
            className="w-full h-full"
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          >
            <g
              transform={`translate(100, 100) scale(${scale})`}
              style={{ transformOrigin: "center" }}
            >
              {week <= 4 && <CellStage week={week} />}
              {week >= 5 && week <= 8 && <EarlyCellStage week={week} />}
              {week >= 9 && week <= 16 && <EmbryoStage week={week} />}
              {week >= 17 && week <= 28 && <BabyStage week={week} />}
              {week >= 29 && <FetalStage week={week} />}
            </g>
          </motion.svg>
        </motion.div>

        {/* Subtle pulsing ring */}
        <motion.div
          className="absolute inset-0"
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        >
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <circle
              cx="100"
              cy="100"
              r="92"
              fill="none"
              stroke="#d8b4fe"
              strokeWidth="0.5"
              strokeOpacity={opacity * 0.5}
            />
          </svg>
        </motion.div>
      </div>
    </div>
  );
}

function getScale(week: number): number {
  if (week <= 4) return 0.15 + week * 0.05;
  if (week <= 8) return 0.3 + (week - 4) * 0.05;
  if (week <= 16) return 0.5 + (week - 8) * 0.03;
  if (week <= 28) return 0.7 + (week - 16) * 0.015;
  return 0.88 + (week - 28) * 0.008;
}

/* Weeks 1-4: dividing cells */
function CellStage({ week }: { week: number }) {
  const cells = Math.min(8, Math.pow(2, week - 1));
  const r = week <= 2 ? 12 : 8;
  const positions = getCellPositions(cells, r);

  return (
    <g>
      {positions.map((pos, i) => (
        <circle
          key={i}
          cx={pos.x}
          cy={pos.y}
          r={r}
          fill="#f9a8d4"
          stroke="#ec4899"
          strokeWidth="1"
          opacity="0.85"
        />
      ))}
    </g>
  );
}

function getCellPositions(
  count: number,
  r: number
): { x: number; y: number }[] {
  if (count === 1) return [{ x: 0, y: 0 }];
  if (count === 2)
    return [
      { x: -r * 0.6, y: 0 },
      { x: r * 0.6, y: 0 },
    ];
  if (count === 4)
    return [
      { x: -r * 0.55, y: -r * 0.55 },
      { x: r * 0.55, y: -r * 0.55 },
      { x: -r * 0.55, y: r * 0.55 },
      { x: r * 0.55, y: r * 0.55 },
    ];
  // 8 cells
  const positions: { x: number; y: number }[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    positions.push({
      x: Math.cos(angle) * r * 0.8,
      y: Math.sin(angle) * r * 0.8,
    });
  }
  return positions;
}

/* Weeks 5-8: growing cell/early embryo with heartbeat indicator */
function EarlyCellStage({ week }: { week: number }) {
  const size = 10 + (week - 5) * 4;
  return (
    <g>
      {/* Amniotic sac */}
      <ellipse cx="0" cy="0" rx={size + 8} ry={size + 6} fill="#fce7f3" opacity="0.5" />
      {/* Body */}
      <ellipse cx="0" cy="2" rx={size * 0.6} ry={size * 0.8} fill="#f9a8d4" />
      {/* Head bulge */}
      <circle cx="0" cy={-size * 0.5} r={size * 0.4} fill="#f9a8d4" />
      {/* Eye dot (week 7-8) */}
      {week >= 7 && (
        <circle cx={size * 0.1} cy={-size * 0.55} r={1.2} fill="#6b2148" />
      )}
      {/* Tail (early embryo) */}
      <path
        d={`M 0 ${size * 0.6} Q ${size * 0.3} ${size * 0.9} ${size * 0.15} ${size}`}
        fill="none"
        stroke="#f9a8d4"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Heart beat indicator */}
      {week >= 5 && (
        <motion.circle
          cx={-size * 0.1}
          cy={0}
          r={2}
          fill="#ef4444"
          animate={{ scale: [1, 1.6, 1], opacity: [1, 0.5, 1] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
        />
      )}
    </g>
  );
}

/* Weeks 9-16: small embryo becoming baby */
function EmbryoStage({ week }: { week: number }) {
  const progress = (week - 9) / 7; // 0 to 1
  const headR = 14 + progress * 4;
  const bodyH = 18 + progress * 10;
  const bodyW = 10 + progress * 4;

  return (
    <g>
      {/* Head */}
      <circle cx="0" cy={-bodyH * 0.4} r={headR} fill="#fda4af" />
      {/* Face features */}
      <circle cx={-headR * 0.25} cy={-bodyH * 0.45} r={1.5 + progress * 0.5} fill="#881337" />
      <circle cx={headR * 0.25} cy={-bodyH * 0.45} r={1.5 + progress * 0.5} fill="#881337" />
      {/* Mouth */}
      {progress > 0.3 && (
        <ellipse cx="0" cy={-bodyH * 0.3} rx={2} ry={1} fill="#e11d48" opacity="0.6" />
      )}
      {/* Body */}
      <ellipse cx="0" cy={bodyH * 0.15} rx={bodyW} ry={bodyH * 0.45} fill="#fda4af" />
      {/* Arms */}
      <path
        d={`M ${-bodyW} ${bodyH * 0.05} Q ${-bodyW - 8 - progress * 4} ${bodyH * 0.1} ${-bodyW - 5 - progress * 3} ${bodyH * 0.25 + progress * 3}`}
        fill="none"
        stroke="#fda4af"
        strokeWidth={3 + progress}
        strokeLinecap="round"
      />
      <path
        d={`M ${bodyW} ${bodyH * 0.05} Q ${bodyW + 8 + progress * 4} ${bodyH * 0.1} ${bodyW + 5 + progress * 3} ${bodyH * 0.25 + progress * 3}`}
        fill="none"
        stroke="#fda4af"
        strokeWidth={3 + progress}
        strokeLinecap="round"
      />
      {/* Legs */}
      <path
        d={`M ${-bodyW * 0.4} ${bodyH * 0.55} Q ${-bodyW * 0.6} ${bodyH * 0.8} ${-bodyW * 0.3} ${bodyH * 0.85 + progress * 4}`}
        fill="none"
        stroke="#fda4af"
        strokeWidth={3 + progress}
        strokeLinecap="round"
      />
      <path
        d={`M ${bodyW * 0.4} ${bodyH * 0.55} Q ${bodyW * 0.6} ${bodyH * 0.8} ${bodyW * 0.3} ${bodyH * 0.85 + progress * 4}`}
        fill="none"
        stroke="#fda4af"
        strokeWidth={3 + progress}
        strokeLinecap="round"
      />
      {/* Heart */}
      <motion.circle
        cx={0}
        cy={bodyH * 0.05}
        r={2}
        fill="#ef4444"
        animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0.4, 0.8] }}
        transition={{ repeat: Infinity, duration: 0.9 }}
      />
    </g>
  );
}

/* Weeks 17-28: recognizable baby, growing */
function BabyStage({ week }: { week: number }) {
  const progress = (week - 17) / 11; // 0 to 1
  const headR = 18 + progress * 3;
  const bodyH = 28 + progress * 8;
  const bodyW = 14 + progress * 4;

  return (
    <g>
      {/* Head */}
      <circle cx="0" cy={-bodyH * 0.35} r={headR} fill="#fda4af" />
      {/* Ear */}
      <ellipse
        cx={headR * 0.95}
        cy={-bodyH * 0.35}
        rx={headR * 0.15}
        ry={headR * 0.25}
        fill="#fb7185"
        opacity="0.5"
      />
      {/* Eyes closed */}
      <path
        d={`M ${-headR * 0.35} ${-bodyH * 0.38} Q ${-headR * 0.2} ${-bodyH * 0.4} ${-headR * 0.05} ${-bodyH * 0.38}`}
        fill="none"
        stroke="#881337"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d={`M ${headR * 0.05} ${-bodyH * 0.38} Q ${headR * 0.2} ${-bodyH * 0.4} ${headR * 0.35} ${-bodyH * 0.38}`}
        fill="none"
        stroke="#881337"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Nose */}
      <circle cx={headR * 0.02} cy={-bodyH * 0.32} r={1.2} fill="#fb7185" opacity="0.6" />
      {/* Mouth (smile) */}
      <path
        d={`M ${-headR * 0.15} ${-bodyH * 0.27} Q 0 ${-bodyH * 0.24} ${headR * 0.15} ${-bodyH * 0.27}`}
        fill="none"
        stroke="#e11d48"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.5"
      />
      {/* Body */}
      <ellipse cx="0" cy={bodyH * 0.15} rx={bodyW} ry={bodyH * 0.4} fill="#fda4af" />
      {/* Belly button (later weeks) */}
      {progress > 0.3 && (
        <circle cx="0" cy={bodyH * 0.15} r={1} fill="#fb7185" opacity="0.4" />
      )}
      {/* Arms - slightly curved toward body */}
      <path
        d={`M ${-bodyW} ${bodyH * 0.0} Q ${-bodyW - 10} ${bodyH * 0.15} ${-bodyW - 4} ${bodyH * 0.3}`}
        fill="none"
        stroke="#fda4af"
        strokeWidth={4 + progress * 2}
        strokeLinecap="round"
      />
      <path
        d={`M ${bodyW} ${bodyH * 0.0} Q ${bodyW + 10} ${bodyH * 0.15} ${bodyW + 4} ${bodyH * 0.3}`}
        fill="none"
        stroke="#fda4af"
        strokeWidth={4 + progress * 2}
        strokeLinecap="round"
      />
      {/* Hands */}
      <circle cx={-bodyW - 4} cy={bodyH * 0.32} r={2.5 + progress} fill="#fda4af" />
      <circle cx={bodyW + 4} cy={bodyH * 0.32} r={2.5 + progress} fill="#fda4af" />
      {/* Legs */}
      <path
        d={`M ${-bodyW * 0.5} ${bodyH * 0.5} Q ${-bodyW * 0.8} ${bodyH * 0.75} ${-bodyW * 0.4} ${bodyH * 0.85}`}
        fill="none"
        stroke="#fda4af"
        strokeWidth={4 + progress * 2}
        strokeLinecap="round"
      />
      <path
        d={`M ${bodyW * 0.5} ${bodyH * 0.5} Q ${bodyW * 0.8} ${bodyH * 0.75} ${bodyW * 0.4} ${bodyH * 0.85}`}
        fill="none"
        stroke="#fda4af"
        strokeWidth={4 + progress * 2}
        strokeLinecap="round"
      />
      {/* Feet */}
      <ellipse cx={-bodyW * 0.4} cy={bodyH * 0.88} rx={3 + progress} ry={2} fill="#fda4af" />
      <ellipse cx={bodyW * 0.4} cy={bodyH * 0.88} rx={3 + progress} ry={2} fill="#fda4af" />
    </g>
  );
}

/* Weeks 29-42: full baby in fetal position */
function FetalStage({ week }: { week: number }) {
  const progress = (week - 29) / 13; // 0 to 1
  const headR = 22 + progress * 3;

  return (
    <g transform="rotate(-20)">
      {/* Head - larger, tucked */}
      <circle cx={-8} cy={-25} r={headR} fill="#fda4af" />
      {/* Ear */}
      <ellipse cx={-8 + headR * 0.85} cy={-27} rx={headR * 0.12} ry={headR * 0.22} fill="#fb7185" opacity="0.5" />
      {/* Eyes closed */}
      <path
        d={`M ${-8 - headR * 0.3} ${-27} Q ${-8 - headR * 0.15} ${-29} ${-8} ${-27}`}
        fill="none"
        stroke="#881337"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d={`M ${-8 + headR * 0.05} ${-27} Q ${-8 + headR * 0.2} ${-29} ${-8 + headR * 0.35} ${-27}`}
        fill="none"
        stroke="#881337"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Nose */}
      <circle cx={-6} cy={-22} r={1.3} fill="#fb7185" opacity="0.6" />
      {/* Mouth */}
      <path
        d="M -10 -19 Q -7 -17 -4 -19"
        fill="none"
        stroke="#e11d48"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.5"
      />
      {/* Curled body */}
      <path
        d={`M -2 ${-25 + headR * 0.7}
            C 15 -5, 18 15, 8 30
            C 2 40, -10 38, -15 28
            C -20 18, -18 0, -12 ${-25 + headR * 0.5}`}
        fill="#fda4af"
        stroke="none"
      />
      {/* Arm tucked in front */}
      <path
        d="M -5 0 Q -15 8 -12 18"
        fill="none"
        stroke="#fb7185"
        strokeWidth={5 + progress * 2}
        strokeLinecap="round"
        opacity="0.6"
      />
      {/* Hand near face */}
      <circle cx={-12} cy={-10} r={3.5 + progress} fill="#fda4af" />
      {/* Other arm */}
      <path
        d="M 5 5 Q 12 12 8 20"
        fill="none"
        stroke="#fb7185"
        strokeWidth={4 + progress * 2}
        strokeLinecap="round"
        opacity="0.5"
      />
      {/* Legs curled up */}
      <path
        d="M 0 28 Q 10 35 5 42"
        fill="none"
        stroke="#fda4af"
        strokeWidth={6 + progress * 2}
        strokeLinecap="round"
      />
      <path
        d="M -8 30 Q -2 38 -6 44"
        fill="none"
        stroke="#fda4af"
        strokeWidth={6 + progress * 2}
        strokeLinecap="round"
      />
      {/* Feet */}
      <ellipse cx={5} cy={44} rx={4 + progress} ry={2.5} fill="#fda4af" transform="rotate(-10 5 44)" />
      <ellipse cx={-6} cy={46} rx={4 + progress} ry={2.5} fill="#fda4af" transform="rotate(10 -6 46)" />
      {/* Hair wisps (late weeks) */}
      {week >= 34 && (
        <g opacity="0.4">
          <path d={`M ${-8 - headR * 0.5} ${-25 - headR * 0.7} Q ${-8 - headR * 0.3} ${-25 - headR * 1} ${-8} ${-25 - headR * 0.85}`} fill="none" stroke="#9f1239" strokeWidth="1" />
          <path d={`M ${-8 + headR * 0.1} ${-25 - headR * 0.9} Q ${-8 + headR * 0.4} ${-25 - headR * 1} ${-8 + headR * 0.6} ${-25 - headR * 0.7}`} fill="none" stroke="#9f1239" strokeWidth="1" />
        </g>
      )}
    </g>
  );
}
