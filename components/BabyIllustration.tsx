"use client";

import { motion } from "framer-motion";

interface BabyIllustrationProps {
  week: number;
  /** Compact mode for dashboard widget */
  compact?: boolean;
}

/**
 * Animated SVG baby illustration that evolves across 7 visual stages:
 *   1. Weeks 1-4:   Dividing cells / blastocyst
 *   2. Weeks 5-8:   Early embryo with heartbeat
 *   3. Weeks 9-13:  Embryo with limb buds
 *   4. Weeks 14-20: Small fetus, features forming
 *   5. Weeks 21-28: Active baby, proportioned
 *   6. Weeks 29-36: Curled fetus, chubby
 *   7. Weeks 37-42: Full-term baby, ready
 *
 * Uses Framer Motion for floating, heartbeat, and breathing animations.
 * Palette: pink (#f9a8d4, #fda4af), purple (#c084fc, #d8b4fe), mint (#6ee7b7, #a7f3d0).
 */
export default function BabyIllustration({ week, compact = false }: BabyIllustrationProps) {
  const size = compact ? "w-32 h-32" : "w-52 h-52";

  return (
    <div className={`flex items-center justify-center ${compact ? "py-2" : "py-5"}`}>
      <div className={`relative ${size}`}>
        {/* Background: amniotic glow */}
        <svg viewBox="0 0 200 200" className="w-full h-full absolute inset-0">
          <defs>
            <radialGradient id={`amnio-${week}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fce7f3" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#ede9fe" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#d1fae5" stopOpacity="0.1" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="96" fill={`url(#amnio-${week})`} />
          <circle cx="100" cy="100" r="96" fill="none" stroke="#f9a8d4" strokeWidth="1.5" strokeOpacity="0.3" />
        </svg>

        {/* Floating particles */}
        <svg viewBox="0 0 200 200" className="w-full h-full absolute inset-0">
          {[...Array(5)].map((_, i) => (
            <motion.circle
              key={`p-${i}`}
              cx={40 + i * 30}
              cy={30 + (i % 3) * 50}
              r={1.5}
              fill="#d8b4fe"
              opacity={0.3}
              animate={{
                y: [0, -8, 0],
                opacity: [0.15, 0.4, 0.15],
              }}
              transition={{
                repeat: Infinity,
                duration: 3 + i * 0.5,
                delay: i * 0.4,
                ease: "easeInOut",
              }}
            />
          ))}
        </svg>

        {/* Main illustration */}
        <motion.div
          key={week}
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <motion.svg
            viewBox="0 0 200 200"
            className="w-full h-full"
            animate={{ y: [0, -2.5, 0] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
          >
            <g transform="translate(100, 100)">
              {week <= 4 && <StageCells week={week} />}
              {week >= 5 && week <= 8 && <StageEarlyEmbryo week={week} />}
              {week >= 9 && week <= 13 && <StageEmbryo week={week} />}
              {week >= 14 && week <= 20 && <StageSmallFetus week={week} />}
              {week >= 21 && week <= 28 && <StageActiveBaby week={week} />}
              {week >= 29 && week <= 36 && <StageCurledFetus week={week} />}
              {week >= 37 && <StageFullTerm week={week} />}
            </g>
          </motion.svg>
        </motion.div>

        {/* Pulsing outer ring */}
        <motion.svg
          viewBox="0 0 200 200"
          className="w-full h-full absolute inset-0"
          animate={{ scale: [1, 1.025, 1] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        >
          <circle cx="100" cy="100" r="93" fill="none" stroke="#c084fc" strokeWidth="0.6" strokeOpacity="0.25" strokeDasharray="4 6" />
        </motion.svg>

        {/* Week label badge */}
        {!compact && (
          <motion.div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-sm rounded-full px-3 py-0.5 border border-pink-200 shadow-sm"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-[10px] font-semibold text-pink-500">SA {week}</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   Stage 1 : Weeks 1-4 - Dividing cells
   ============================================================ */
function StageCells({ week }: { week: number }) {
  const count = Math.min(16, Math.pow(2, week));
  const scale = 0.3 + week * 0.12;

  // Generate cluster positions
  const cells: { x: number; y: number; r: number }[] = [];
  if (count <= 2) {
    const r = 14;
    cells.push({ x: count === 1 ? 0 : -r * 0.5, y: 0, r });
    if (count === 2) cells.push({ x: r * 0.5, y: 0, r });
  } else {
    const r = count <= 8 ? 9 : 6;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.PI / 6;
      const dist = r * (count <= 4 ? 0.7 : count <= 8 ? 1.1 : 1.5);
      cells.push({
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        r,
      });
    }
  }

  return (
    <g transform={`scale(${scale})`}>
      {/* Zona pellucida (outer membrane) */}
      <circle cx="0" cy="0" r={count <= 2 ? 22 : count <= 8 ? 20 : 22} fill="none" stroke="#f9a8d4" strokeWidth="1.5" strokeOpacity="0.5" strokeDasharray="3 3" />
      {cells.map((c, i) => (
        <motion.circle
          key={i}
          cx={c.x}
          cy={c.y}
          r={c.r}
          fill="#fda4af"
          stroke="#f472b6"
          strokeWidth="0.8"
          animate={{
            scale: [1, 1.06, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
      {/* Nuclei dots */}
      {cells.map((c, i) => (
        <circle key={`n-${i}`} cx={c.x} cy={c.y} r={c.r * 0.3} fill="#ec4899" opacity="0.4" />
      ))}
    </g>
  );
}

/* ============================================================
   Stage 2 : Weeks 5-8 - Early embryo with heartbeat
   ============================================================ */
function StageEarlyEmbryo({ week }: { week: number }) {
  const p = (week - 5) / 3; // 0 to 1
  const scale = 0.55 + p * 0.15;
  const bodyLen = 14 + p * 8;
  const headR = 8 + p * 4;

  return (
    <g transform={`scale(${scale})`}>
      {/* Amniotic sac */}
      <ellipse cx="0" cy="0" rx={bodyLen + 16} ry={bodyLen + 12} fill="#fce7f3" opacity="0.35" />
      <ellipse cx="0" cy="0" rx={bodyLen + 16} ry={bodyLen + 12} fill="none" stroke="#f9a8d4" strokeWidth="0.8" strokeOpacity="0.4" />

      {/* C-shaped body */}
      <path
        d={`M 0 ${-bodyLen * 0.6}
            C ${bodyLen * 0.5} ${-bodyLen * 0.3}, ${bodyLen * 0.5} ${bodyLen * 0.3}, 0 ${bodyLen * 0.7}
            C ${-bodyLen * 0.1} ${bodyLen * 0.8}, ${-bodyLen * 0.15} ${bodyLen * 0.6}, 0 ${bodyLen * 0.7}`}
        fill="#fda4af"
        stroke="none"
      />

      {/* Head */}
      <circle cx="0" cy={-bodyLen * 0.55} r={headR} fill="#fda4af" />
      <circle cx="0" cy={-bodyLen * 0.55} r={headR * 0.85} fill="#fecdd3" opacity="0.4" />

      {/* Eye spot (week 7+) */}
      {week >= 7 && (
        <circle cx={headR * 0.2} cy={-bodyLen * 0.6} r={1.2 + p * 0.3} fill="#881337" opacity="0.7" />
      )}

      {/* Limb buds (week 6+) */}
      {week >= 6 && (
        <>
          <ellipse cx={bodyLen * 0.35} cy={-bodyLen * 0.1} rx={2 + p * 2} ry={1.5 + p} fill="#fda4af" />
          <ellipse cx={-bodyLen * 0.1} cy={bodyLen * 0.1} rx={2 + p * 2} ry={1.5 + p} fill="#fda4af" />
        </>
      )}

      {/* Tail */}
      <path
        d={`M 0 ${bodyLen * 0.65} Q ${bodyLen * 0.15} ${bodyLen * 0.9} ${bodyLen * 0.1} ${bodyLen}`}
        fill="none"
        stroke="#fda4af"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Heartbeat */}
      <motion.circle
        cx={bodyLen * 0.15}
        cy={-bodyLen * 0.15}
        r={2.2}
        fill="#ef4444"
        animate={{ scale: [1, 1.7, 1], opacity: [1, 0.4, 1] }}
        transition={{ repeat: Infinity, duration: 0.7 }}
      />

      {/* Umbilical cord hint */}
      <path
        d={`M ${-bodyLen * 0.2} ${bodyLen * 0.1} Q ${-bodyLen * 0.6} ${bodyLen * 0.4} ${-bodyLen * 0.8} ${bodyLen * 0.7}`}
        fill="none"
        stroke="#c084fc"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.35"
      />
    </g>
  );
}

/* ============================================================
   Stage 3 : Weeks 9-13 - Embryo with limbs forming
   ============================================================ */
function StageEmbryo({ week }: { week: number }) {
  const p = (week - 9) / 4; // 0 to 1
  const scale = 0.6 + p * 0.1;
  const headR = 16 + p * 3;
  const bodyH = 20 + p * 8;
  const bodyW = 11 + p * 3;

  return (
    <g transform={`scale(${scale})`}>
      {/* Head */}
      <circle cx="0" cy={-bodyH * 0.4} r={headR} fill="#fda4af" />
      {/* Cheek blush */}
      <circle cx={-headR * 0.35} cy={-bodyH * 0.32} r={headR * 0.18} fill="#f9a8d4" opacity="0.4" />
      <circle cx={headR * 0.35} cy={-bodyH * 0.32} r={headR * 0.18} fill="#f9a8d4" opacity="0.4" />

      {/* Eyes */}
      <circle cx={-headR * 0.25} cy={-bodyH * 0.44} r={2 + p * 0.5} fill="#881337" opacity="0.8" />
      <circle cx={headR * 0.25} cy={-bodyH * 0.44} r={2 + p * 0.5} fill="#881337" opacity="0.8" />
      {/* Eye highlights */}
      <circle cx={-headR * 0.2} cy={-bodyH * 0.46} r={0.8} fill="white" opacity="0.6" />
      <circle cx={headR * 0.3} cy={-bodyH * 0.46} r={0.8} fill="white" opacity="0.6" />

      {/* Nose */}
      <circle cx="0" cy={-bodyH * 0.35} r={1} fill="#fb7185" opacity="0.5" />

      {/* Mouth */}
      {p > 0.3 && (
        <path
          d={`M ${-headR * 0.12} ${-bodyH * 0.29} Q 0 ${-bodyH * 0.27} ${headR * 0.12} ${-bodyH * 0.29}`}
          fill="none"
          stroke="#e11d48"
          strokeWidth="0.8"
          strokeLinecap="round"
          opacity="0.5"
        />
      )}

      {/* Body */}
      <ellipse cx="0" cy={bodyH * 0.15} rx={bodyW} ry={bodyH * 0.45} fill="#fda4af" />

      {/* Arms */}
      <path
        d={`M ${-bodyW} ${bodyH * 0.02} Q ${-bodyW - 8 - p * 5} ${bodyH * 0.08} ${-bodyW - 6 - p * 4} ${bodyH * 0.22 + p * 5}`}
        fill="none"
        stroke="#fda4af"
        strokeWidth={3.5 + p * 1.5}
        strokeLinecap="round"
      />
      <path
        d={`M ${bodyW} ${bodyH * 0.02} Q ${bodyW + 8 + p * 5} ${bodyH * 0.08} ${bodyW + 6 + p * 4} ${bodyH * 0.22 + p * 5}`}
        fill="none"
        stroke="#fda4af"
        strokeWidth={3.5 + p * 1.5}
        strokeLinecap="round"
      />

      {/* Tiny fingers (later) */}
      {p > 0.5 && (
        <>
          <circle cx={-bodyW - 6 - p * 4} cy={bodyH * 0.22 + p * 5 + 2} r={2} fill="#fda4af" />
          <circle cx={bodyW + 6 + p * 4} cy={bodyH * 0.22 + p * 5 + 2} r={2} fill="#fda4af" />
        </>
      )}

      {/* Legs */}
      <path
        d={`M ${-bodyW * 0.4} ${bodyH * 0.55} Q ${-bodyW * 0.7} ${bodyH * 0.75} ${-bodyW * 0.35} ${bodyH * 0.85 + p * 6}`}
        fill="none"
        stroke="#fda4af"
        strokeWidth={3.5 + p * 1.5}
        strokeLinecap="round"
      />
      <path
        d={`M ${bodyW * 0.4} ${bodyH * 0.55} Q ${bodyW * 0.7} ${bodyH * 0.75} ${bodyW * 0.35} ${bodyH * 0.85 + p * 6}`}
        fill="none"
        stroke="#fda4af"
        strokeWidth={3.5 + p * 1.5}
        strokeLinecap="round"
      />

      {/* Heartbeat */}
      <motion.circle
        cx={0}
        cy={bodyH * 0.05}
        r={2}
        fill="#ef4444"
        animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0.3, 0.8] }}
        transition={{ repeat: Infinity, duration: 0.85 }}
      />
    </g>
  );
}

/* ============================================================
   Stage 4 : Weeks 14-20 - Small fetus, features forming
   ============================================================ */
function StageSmallFetus({ week }: { week: number }) {
  const p = (week - 14) / 6; // 0 to 1
  const scale = 0.7 + p * 0.08;
  const headR = 19 + p * 2;
  const bodyH = 30 + p * 8;
  const bodyW = 14 + p * 3;

  return (
    <g transform={`scale(${scale})`}>
      {/* Head */}
      <circle cx="0" cy={-bodyH * 0.35} r={headR} fill="#fda4af" />

      {/* Hair hint (week 18+) */}
      {week >= 18 && (
        <path
          d={`M ${-headR * 0.6} ${-bodyH * 0.35 - headR * 0.8} Q 0 ${-bodyH * 0.35 - headR * 1.05} ${headR * 0.6} ${-bodyH * 0.35 - headR * 0.8}`}
          fill="none"
          stroke="#be185d"
          strokeWidth="1.2"
          opacity="0.25"
        />
      )}

      {/* Ears */}
      <ellipse cx={-headR * 0.92} cy={-bodyH * 0.35} rx={headR * 0.13} ry={headR * 0.22} fill="#fb7185" opacity="0.45" />
      <ellipse cx={headR * 0.92} cy={-bodyH * 0.35} rx={headR * 0.13} ry={headR * 0.22} fill="#fb7185" opacity="0.45" />

      {/* Closed eyes with lashes */}
      <path
        d={`M ${-headR * 0.38} ${-bodyH * 0.37} Q ${-headR * 0.2} ${-bodyH * 0.39} ${-headR * 0.05} ${-bodyH * 0.37}`}
        fill="none" stroke="#881337" strokeWidth="1.5" strokeLinecap="round"
      />
      <path
        d={`M ${headR * 0.05} ${-bodyH * 0.37} Q ${headR * 0.2} ${-bodyH * 0.39} ${headR * 0.38} ${-bodyH * 0.37}`}
        fill="none" stroke="#881337" strokeWidth="1.5" strokeLinecap="round"
      />
      {/* Tiny lashes */}
      <line x1={-headR * 0.22} y1={-bodyH * 0.39} x2={-headR * 0.22} y2={-bodyH * 0.42} stroke="#881337" strokeWidth="0.6" opacity="0.4" />
      <line x1={headR * 0.22} y1={-bodyH * 0.39} x2={headR * 0.22} y2={-bodyH * 0.42} stroke="#881337" strokeWidth="0.6" opacity="0.4" />

      {/* Nose */}
      <ellipse cx="0" cy={-bodyH * 0.31} rx={1.5} ry={1} fill="#fb7185" opacity="0.5" />

      {/* Smile */}
      <path
        d={`M ${-headR * 0.18} ${-bodyH * 0.26} Q 0 ${-bodyH * 0.23} ${headR * 0.18} ${-bodyH * 0.26}`}
        fill="none" stroke="#e11d48" strokeWidth="1" strokeLinecap="round" opacity="0.45"
      />

      {/* Cheeks */}
      <circle cx={-headR * 0.4} cy={-bodyH * 0.3} r={headR * 0.15} fill="#f9a8d4" opacity="0.35" />
      <circle cx={headR * 0.4} cy={-bodyH * 0.3} r={headR * 0.15} fill="#f9a8d4" opacity="0.35" />

      {/* Body */}
      <ellipse cx="0" cy={bodyH * 0.12} rx={bodyW} ry={bodyH * 0.4} fill="#fda4af" />
      {/* Belly */}
      <circle cx="0" cy={bodyH * 0.15} r={1.2} fill="#fb7185" opacity="0.3" />

      {/* Arms */}
      <path
        d={`M ${-bodyW} ${bodyH * -0.02} Q ${-bodyW - 12} ${bodyH * 0.12} ${-bodyW - 6} ${bodyH * 0.28}`}
        fill="none" stroke="#fda4af" strokeWidth={4.5 + p} strokeLinecap="round"
      />
      <path
        d={`M ${bodyW} ${bodyH * -0.02} Q ${bodyW + 12} ${bodyH * 0.12} ${bodyW + 6} ${bodyH * 0.28}`}
        fill="none" stroke="#fda4af" strokeWidth={4.5 + p} strokeLinecap="round"
      />
      {/* Hands */}
      <circle cx={-bodyW - 6} cy={bodyH * 0.3} r={3 + p * 0.5} fill="#fda4af" />
      <circle cx={bodyW + 6} cy={bodyH * 0.3} r={3 + p * 0.5} fill="#fda4af" />

      {/* Legs */}
      <path
        d={`M ${-bodyW * 0.45} ${bodyH * 0.48} Q ${-bodyW * 0.8} ${bodyH * 0.72} ${-bodyW * 0.45} ${bodyH * 0.88}`}
        fill="none" stroke="#fda4af" strokeWidth={4.5 + p * 1.5} strokeLinecap="round"
      />
      <path
        d={`M ${bodyW * 0.45} ${bodyH * 0.48} Q ${bodyW * 0.8} ${bodyH * 0.72} ${bodyW * 0.45} ${bodyH * 0.88}`}
        fill="none" stroke="#fda4af" strokeWidth={4.5 + p * 1.5} strokeLinecap="round"
      />
      {/* Feet */}
      <ellipse cx={-bodyW * 0.45} cy={bodyH * 0.91} rx={3.5 + p} ry={2} fill="#fda4af" />
      <ellipse cx={bodyW * 0.45} cy={bodyH * 0.91} rx={3.5 + p} ry={2} fill="#fda4af" />

      {/* Breathing animation */}
      <motion.ellipse
        cx="0" cy={bodyH * 0.12}
        rx={bodyW} ry={bodyH * 0.4}
        fill="#fda4af"
        animate={{ ry: [bodyH * 0.4, bodyH * 0.42, bodyH * 0.4] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
      />
    </g>
  );
}

/* ============================================================
   Stage 5 : Weeks 21-28 - Active baby
   ============================================================ */
function StageActiveBaby({ week }: { week: number }) {
  const p = (week - 21) / 7; // 0 to 1
  const scale = 0.78 + p * 0.06;
  const headR = 20 + p * 2;
  const bodyH = 34 + p * 6;
  const bodyW = 16 + p * 3;

  return (
    <g transform={`scale(${scale})`}>
      {/* Head */}
      <circle cx="0" cy={-bodyH * 0.33} r={headR} fill="#fda4af" />

      {/* Hair */}
      <path
        d={`M ${-headR * 0.7} ${-bodyH * 0.33 - headR * 0.75}
            Q ${-headR * 0.3} ${-bodyH * 0.33 - headR * 1.1} 0 ${-bodyH * 0.33 - headR * 0.95}
            Q ${headR * 0.3} ${-bodyH * 0.33 - headR * 1.1} ${headR * 0.7} ${-bodyH * 0.33 - headR * 0.75}`}
        fill="none" stroke="#9f1239" strokeWidth="1.5" opacity="0.2"
      />

      {/* Ears */}
      <ellipse cx={-headR * 0.93} cy={-bodyH * 0.33} rx={headR * 0.14} ry={headR * 0.24} fill="#fb7185" opacity="0.4" />
      <ellipse cx={headR * 0.93} cy={-bodyH * 0.33} rx={headR * 0.14} ry={headR * 0.24} fill="#fb7185" opacity="0.4" />

      {/* Eyes - animated blink */}
      <motion.g
        animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
        transition={{ repeat: Infinity, duration: 4, times: [0, 0.45, 0.5, 0.55, 1] }}
        style={{ transformOrigin: `0 ${-bodyH * 0.36}px` }}
      >
        <path
          d={`M ${-headR * 0.38} ${-bodyH * 0.36} Q ${-headR * 0.22} ${-bodyH * 0.39} ${-headR * 0.06} ${-bodyH * 0.36}`}
          fill="none" stroke="#881337" strokeWidth="1.5" strokeLinecap="round"
        />
        <path
          d={`M ${headR * 0.06} ${-bodyH * 0.36} Q ${headR * 0.22} ${-bodyH * 0.39} ${headR * 0.38} ${-bodyH * 0.36}`}
          fill="none" stroke="#881337" strokeWidth="1.5" strokeLinecap="round"
        />
      </motion.g>

      {/* Nose */}
      <ellipse cx="0" cy={-bodyH * 0.29} rx={1.8} ry={1.2} fill="#fb7185" opacity="0.5" />

      {/* Smile */}
      <path
        d={`M ${-headR * 0.2} ${-bodyH * 0.24} Q 0 ${-bodyH * 0.2} ${headR * 0.2} ${-bodyH * 0.24}`}
        fill="none" stroke="#e11d48" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"
      />

      {/* Cheeks */}
      <circle cx={-headR * 0.42} cy={-bodyH * 0.28} r={headR * 0.14} fill="#f9a8d4" opacity="0.4" />
      <circle cx={headR * 0.42} cy={-bodyH * 0.28} r={headR * 0.14} fill="#f9a8d4" opacity="0.4" />

      {/* Body */}
      <motion.ellipse
        cx="0" cy={bodyH * 0.1}
        rx={bodyW} ry={bodyH * 0.38}
        fill="#fda4af"
        animate={{ ry: [bodyH * 0.38, bodyH * 0.39, bodyH * 0.38] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
      />
      {/* Belly button */}
      <circle cx="0" cy={bodyH * 0.12} r={1.3} fill="#fb7185" opacity="0.3" />

      {/* Left arm - animated kick */}
      <motion.path
        d={`M ${-bodyW} ${bodyH * -0.04} Q ${-bodyW - 14} ${bodyH * 0.08} ${-bodyW - 8} ${bodyH * 0.25}`}
        fill="none" stroke="#fda4af" strokeWidth={5 + p * 1.5} strokeLinecap="round"
        animate={{ d: [
          `M ${-bodyW} ${bodyH * -0.04} Q ${-bodyW - 14} ${bodyH * 0.08} ${-bodyW - 8} ${bodyH * 0.25}`,
          `M ${-bodyW} ${bodyH * -0.04} Q ${-bodyW - 16} ${bodyH * 0.0} ${-bodyW - 10} ${bodyH * 0.18}`,
          `M ${-bodyW} ${bodyH * -0.04} Q ${-bodyW - 14} ${bodyH * 0.08} ${-bodyW - 8} ${bodyH * 0.25}`,
        ] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
      />
      {/* Right arm */}
      <path
        d={`M ${bodyW} ${bodyH * -0.04} Q ${bodyW + 14} ${bodyH * 0.08} ${bodyW + 8} ${bodyH * 0.25}`}
        fill="none" stroke="#fda4af" strokeWidth={5 + p * 1.5} strokeLinecap="round"
      />
      {/* Hands */}
      <motion.circle
        cx={-bodyW - 8} cy={bodyH * 0.27}
        r={3.5 + p * 0.5} fill="#fda4af"
        animate={{ cy: [bodyH * 0.27, bodyH * 0.2, bodyH * 0.27] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
      />
      <circle cx={bodyW + 8} cy={bodyH * 0.27} r={3.5 + p * 0.5} fill="#fda4af" />

      {/* Legs - one kicks */}
      <path
        d={`M ${-bodyW * 0.5} ${bodyH * 0.44} Q ${-bodyW * 0.9} ${bodyH * 0.65} ${-bodyW * 0.5} ${bodyH * 0.82}`}
        fill="none" stroke="#fda4af" strokeWidth={5 + p * 1.5} strokeLinecap="round"
      />
      <motion.path
        d={`M ${bodyW * 0.5} ${bodyH * 0.44} Q ${bodyW * 0.9} ${bodyH * 0.65} ${bodyW * 0.5} ${bodyH * 0.82}`}
        fill="none" stroke="#fda4af" strokeWidth={5 + p * 1.5} strokeLinecap="round"
        animate={{ d: [
          `M ${bodyW * 0.5} ${bodyH * 0.44} Q ${bodyW * 0.9} ${bodyH * 0.65} ${bodyW * 0.5} ${bodyH * 0.82}`,
          `M ${bodyW * 0.5} ${bodyH * 0.44} Q ${bodyW * 1.1} ${bodyH * 0.6} ${bodyW * 0.7} ${bodyH * 0.78}`,
          `M ${bodyW * 0.5} ${bodyH * 0.44} Q ${bodyW * 0.9} ${bodyH * 0.65} ${bodyW * 0.5} ${bodyH * 0.82}`,
        ] }}
        transition={{ repeat: Infinity, duration: 4, delay: 1.5, ease: "easeInOut" }}
      />
      {/* Feet */}
      <ellipse cx={-bodyW * 0.5} cy={bodyH * 0.85} rx={4 + p} ry={2.2} fill="#fda4af" />
      <motion.ellipse
        cx={bodyW * 0.5} cy={bodyH * 0.85}
        rx={4 + p} ry={2.2} fill="#fda4af"
        animate={{ cx: [bodyW * 0.5, bodyW * 0.7, bodyW * 0.5] }}
        transition={{ repeat: Infinity, duration: 4, delay: 1.5, ease: "easeInOut" }}
      />

      {/* Umbilical cord */}
      <path
        d={`M 0 ${bodyH * 0.12} Q ${-bodyW * 0.8} ${bodyH * 0.5} ${-bodyW * 1.2} ${bodyH * 0.7}`}
        fill="none" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" opacity="0.25"
      />
    </g>
  );
}

/* ============================================================
   Stage 6 : Weeks 29-36 - Curled/chubby fetus
   ============================================================ */
function StageCurledFetus({ week }: { week: number }) {
  const p = (week - 29) / 7; // 0 to 1
  const scale = 0.82 + p * 0.06;
  const headR = 23 + p * 2;

  return (
    <g transform={`scale(${scale}) rotate(-15)`}>
      {/* Head */}
      <circle cx={-5} cy={-26} r={headR} fill="#fda4af" />

      {/* Hair */}
      <g opacity={0.2 + p * 0.15}>
        <path d={`M ${-5 - headR * 0.6} ${-26 - headR * 0.75} Q ${-5} ${-26 - headR * 1.05} ${-5 + headR * 0.6} ${-26 - headR * 0.75}`} fill="none" stroke="#9f1239" strokeWidth="1.3" />
        <path d={`M ${-5 - headR * 0.45} ${-26 - headR * 0.85} Q ${-5 - headR * 0.1} ${-26 - headR * 1.1} ${-5 + headR * 0.35} ${-26 - headR * 0.9}`} fill="none" stroke="#9f1239" strokeWidth="1" />
      </g>

      {/* Ear */}
      <ellipse cx={-5 + headR * 0.88} cy={-28} rx={headR * 0.12} ry={headR * 0.22} fill="#fb7185" opacity="0.4" />

      {/* Closed eyes */}
      <path
        d={`M ${-5 - headR * 0.32} ${-28} Q ${-5 - headR * 0.15} ${-30} ${-5} ${-28}`}
        fill="none" stroke="#881337" strokeWidth="1.5" strokeLinecap="round"
      />
      <path
        d={`M ${-5 + headR * 0.05} ${-28} Q ${-5 + headR * 0.2} ${-30} ${-5 + headR * 0.35} ${-28}`}
        fill="none" stroke="#881337" strokeWidth="1.5" strokeLinecap="round"
      />

      {/* Nose */}
      <ellipse cx={-3} cy={-23} rx={1.5} ry={1} fill="#fb7185" opacity="0.5" />

      {/* Mouth */}
      <path d="M -8 -20 Q -5 -18 -2 -20" fill="none" stroke="#e11d48" strokeWidth="1" strokeLinecap="round" opacity="0.45" />

      {/* Cheeks (chubby) */}
      <circle cx={-5 - headR * 0.35} cy={-22} r={headR * 0.18} fill="#f9a8d4" opacity="0.4" />
      <circle cx={-5 + headR * 0.35} cy={-22} r={headR * 0.18} fill="#f9a8d4" opacity="0.4" />

      {/* Curled body */}
      <motion.path
        d={`M 0 ${-26 + headR * 0.7}
            C 18 -5, 20 18, 10 32
            C 4 42, -10 40, -16 30
            C -22 20, -20 2, -14 ${-26 + headR * 0.5}`}
        fill="#fda4af"
        animate={{
          d: [
            `M 0 ${-26 + headR * 0.7} C 18 -5, 20 18, 10 32 C 4 42, -10 40, -16 30 C -22 20, -20 2, -14 ${-26 + headR * 0.5}`,
            `M 0 ${-26 + headR * 0.7} C 19 -4, 21 19, 11 33 C 5 43, -9 41, -15 31 C -21 21, -19 3, -13 ${-26 + headR * 0.5}`,
            `M 0 ${-26 + headR * 0.7} C 18 -5, 20 18, 10 32 C 4 42, -10 40, -16 30 C -22 20, -20 2, -14 ${-26 + headR * 0.5}`,
          ],
        }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
      />

      {/* Arm near face (sucking thumb) */}
      <path
        d="M -3 2 Q -14 -4 -12 -14"
        fill="none" stroke="#fb7185" strokeWidth={5 + p * 2} strokeLinecap="round" opacity="0.55"
      />
      {/* Hand near mouth */}
      <circle cx={-11} cy={-15} r={4 + p} fill="#fda4af" />

      {/* Other arm */}
      <path
        d="M 8 6 Q 14 14 10 22"
        fill="none" stroke="#fb7185" strokeWidth={4.5 + p * 1.5} strokeLinecap="round" opacity="0.45"
      />

      {/* Legs curled */}
      <path
        d="M 2 30 Q 12 36 7 44"
        fill="none" stroke="#fda4af" strokeWidth={6.5 + p * 2} strokeLinecap="round"
      />
      <path
        d="M -6 32 Q 0 40 -4 46"
        fill="none" stroke="#fda4af" strokeWidth={6.5 + p * 2} strokeLinecap="round"
      />
      {/* Feet */}
      <ellipse cx={7} cy={46} rx={4.5 + p} ry={2.5} fill="#fda4af" transform="rotate(-10 7 46)" />
      <ellipse cx={-4} cy={48} rx={4.5 + p} ry={2.5} fill="#fda4af" transform="rotate(10 -4 48)" />

      {/* Umbilical cord */}
      <path
        d={`M 4 15 Q -12 25 -20 38 Q -25 45 -18 50`}
        fill="none" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" opacity="0.2"
      />
    </g>
  );
}

/* ============================================================
   Stage 7 : Weeks 37-42 - Full-term baby, ready to meet world
   ============================================================ */
function StageFullTerm({ week }: { week: number }) {
  const p = Math.min(1, (week - 37) / 5); // 0 to 1
  const scale = 0.88 + p * 0.05;
  const headR = 25 + p * 1;

  return (
    <g transform={`scale(${scale}) rotate(-20)`}>
      {/* Glow behind baby */}
      <circle cx={-2} cy={5} r={55} fill="#fce7f3" opacity="0.15" />

      {/* Head */}
      <circle cx={-5} cy={-25} r={headR} fill="#fda4af" />

      {/* Hair - more defined */}
      <g opacity={0.3 + p * 0.1}>
        <path d={`M ${-5 - headR * 0.65} ${-25 - headR * 0.7} Q ${-5 - headR * 0.2} ${-25 - headR * 1.15} ${-5 + headR * 0.2} ${-25 - headR * 1.0}`} fill="none" stroke="#9f1239" strokeWidth="1.5" />
        <path d={`M ${-5 + headR * 0.1} ${-25 - headR * 1.0} Q ${-5 + headR * 0.45} ${-25 - headR * 1.1} ${-5 + headR * 0.7} ${-25 - headR * 0.7}`} fill="none" stroke="#9f1239" strokeWidth="1.5" />
        <path d={`M ${-5 - headR * 0.5} ${-25 - headR * 0.8} Q ${-5 - headR * 0.1} ${-25 - headR * 1.2} ${-5 + headR * 0.5} ${-25 - headR * 0.85}`} fill="none" stroke="#9f1239" strokeWidth="1" />
      </g>

      {/* Ears */}
      <ellipse cx={-5 - headR * 0.88} cy={-27} rx={headR * 0.13} ry={headR * 0.22} fill="#fb7185" opacity="0.4" />
      <ellipse cx={-5 + headR * 0.88} cy={-27} rx={headR * 0.13} ry={headR * 0.22} fill="#fb7185" opacity="0.4" />

      {/* Closed eyes with lashes */}
      <path
        d={`M ${-5 - headR * 0.34} ${-27} Q ${-5 - headR * 0.17} ${-29.5} ${-5} ${-27}`}
        fill="none" stroke="#881337" strokeWidth="1.5" strokeLinecap="round"
      />
      <path
        d={`M ${-5 + headR * 0.04} ${-27} Q ${-5 + headR * 0.2} ${-29.5} ${-5 + headR * 0.36} ${-27}`}
        fill="none" stroke="#881337" strokeWidth="1.5" strokeLinecap="round"
      />
      {/* Lashes */}
      <line x1={-5 - headR * 0.17} y1={-29.2} x2={-5 - headR * 0.17} y2={-31} stroke="#881337" strokeWidth="0.7" opacity="0.3" />
      <line x1={-5 - headR * 0.25} y1={-28.8} x2={-5 - headR * 0.28} y2={-30.5} stroke="#881337" strokeWidth="0.7" opacity="0.3" />
      <line x1={headR * 0.15 - 5} y1={-29.2} x2={headR * 0.15 - 5} y2={-31} stroke="#881337" strokeWidth="0.7" opacity="0.3" />
      <line x1={headR * 0.25 - 5} y1={-28.8} x2={headR * 0.28 - 5} y2={-30.5} stroke="#881337" strokeWidth="0.7" opacity="0.3" />

      {/* Nose */}
      <ellipse cx={-3} cy={-22} rx={1.8} ry={1.2} fill="#fb7185" opacity="0.5" />

      {/* Tiny smile */}
      <path d="M -9 -19 Q -5 -16.5 -1 -19" fill="none" stroke="#e11d48" strokeWidth="1" strokeLinecap="round" opacity="0.5" />

      {/* Rosy cheeks */}
      <circle cx={-5 - headR * 0.38} cy={-21} r={headR * 0.18} fill="#f9a8d4" opacity="0.45" />
      <circle cx={-5 + headR * 0.38} cy={-21} r={headR * 0.18} fill="#f9a8d4" opacity="0.45" />

      {/* Curled body - breathing */}
      <motion.path
        d={`M 2 ${-25 + headR * 0.65}
            C 20 -4, 22 20, 12 34
            C 6 44, -8 42, -16 32
            C -24 20, -22 0, -15 ${-25 + headR * 0.45}`}
        fill="#fda4af"
        animate={{
          d: [
            `M 2 ${-25 + headR * 0.65} C 20 -4, 22 20, 12 34 C 6 44, -8 42, -16 32 C -24 20, -22 0, -15 ${-25 + headR * 0.45}`,
            `M 2 ${-25 + headR * 0.65} C 21 -3, 23 21, 13 35 C 7 45, -7 43, -15 33 C -23 21, -21 1, -14 ${-25 + headR * 0.45}`,
            `M 2 ${-25 + headR * 0.65} C 20 -4, 22 20, 12 34 C 6 44, -8 42, -16 32 C -24 20, -22 0, -15 ${-25 + headR * 0.45}`,
          ],
        }}
        transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
      />

      {/* Arm - hand near face (sucking thumb) */}
      <path
        d="M -2 2 Q -14 -5 -10 -15"
        fill="none" stroke="#fb7185" strokeWidth={6 + p} strokeLinecap="round" opacity="0.5"
      />
      <circle cx={-9} cy={-16} r={4.5 + p * 0.5} fill="#fda4af" />

      {/* Other arm */}
      <path
        d="M 10 8 Q 16 16 12 24"
        fill="none" stroke="#fb7185" strokeWidth={5.5 + p} strokeLinecap="round" opacity="0.4"
      />
      <circle cx={12} cy={26} r={4 + p * 0.5} fill="#fda4af" />

      {/* Legs curled tight */}
      <path
        d="M 4 32 Q 14 38 9 46"
        fill="none" stroke="#fda4af" strokeWidth={7 + p * 2} strokeLinecap="round"
      />
      <path
        d="M -5 34 Q 2 42 -2 48"
        fill="none" stroke="#fda4af" strokeWidth={7 + p * 2} strokeLinecap="round"
      />
      {/* Chubby feet */}
      <ellipse cx={9} cy={48} rx={5 + p} ry={3} fill="#fda4af" transform="rotate(-8 9 48)" />
      <ellipse cx={-2} cy={50} rx={5 + p} ry={3} fill="#fda4af" transform="rotate(8 -2 50)" />

      {/* Sparkles for "ready" */}
      {week >= 39 && (
        <g>
          <motion.g
            animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
            transition={{ repeat: Infinity, duration: 2, delay: 0 }}
          >
            <path d="M -40 -40 l 3 -5 l 3 5 l -3 5 z" fill="#d8b4fe" opacity="0.5" />
          </motion.g>
          <motion.g
            animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
            transition={{ repeat: Infinity, duration: 2, delay: 0.7 }}
          >
            <path d="M 35 -35 l 2 -4 l 2 4 l -2 4 z" fill="#f9a8d4" opacity="0.5" />
          </motion.g>
          <motion.g
            animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
            transition={{ repeat: Infinity, duration: 2, delay: 1.4 }}
          >
            <path d="M 40 20 l 2 -3 l 2 3 l -2 3 z" fill="#6ee7b7" opacity="0.5" />
          </motion.g>
        </g>
      )}
    </g>
  );
}
