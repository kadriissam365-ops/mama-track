"use client";

interface BabyVisualProps {
  week: number;
}

const stageEmojis: Record<string, { emoji: string; label: string }> = {
  cell: { emoji: "🫧", label: "Cellule en division" },
  embryo: { emoji: "🌱", label: "Petit embryon" },
  small: { emoji: "👶", label: "Mini bébé" },
  growing: { emoji: "👶", label: "Bébé en croissance" },
  full: { emoji: "👶", label: "Prêt à naître" },
};

function getStage(week: number): string {
  if (week <= 4) return "cell";
  if (week <= 8) return "embryo";
  if (week <= 16) return "small";
  if (week <= 28) return "growing";
  return "full";
}

function getBabyScale(week: number): number {
  if (week <= 4) return 0.4;
  if (week <= 8) return 0.5;
  if (week <= 16) return 0.6 + ((week - 9) / 7) * 0.15;
  if (week <= 28) return 0.75 + ((week - 17) / 11) * 0.15;
  return 0.9 + ((week - 29) / 13) * 0.1;
}

export default function BabyVisual({ week }: BabyVisualProps) {
  const stage = getStage(week);
  const { label } = stageEmojis[stage];
  const scale = getBabyScale(week);
  const emojiSize = Math.max(3, scale * 8);

  return (
    <div className="flex flex-col items-center justify-center py-6 gap-3">
      {/* Soft glow background */}
      <div className="relative">
        <div
          className="absolute inset-0 rounded-full blur-2xl pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(249,168,212,0.3) 0%, rgba(233,213,255,0.1) 70%, transparent 100%)",
            width: `${emojiSize + 4}rem`,
            height: `${emojiSize + 4}rem`,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />

        {/* Baby illustration */}
        <div className="relative z-10 flex items-center justify-center">
          {stage === "cell" ? (
            <CellVisual week={week} size={emojiSize} />
          ) : stage === "embryo" ? (
            <EmbryoVisual week={week} size={emojiSize} />
          ) : (
            <BabyIllustration week={week} size={emojiSize} />
          )}
        </div>
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">{label}</p>
    </div>
  );
}

function CellVisual({ week, size }: { week: number; size: number }) {
  const count = Math.min(8, Math.pow(2, week - 1));
  return (
    <div
      className="flex items-center justify-center flex-wrap gap-1"
      style={{ width: `${size}rem`, height: `${size}rem` }}
    >
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="rounded-full bg-gradient-to-br from-pink-200 to-purple-200 border border-pink-300/40"
          style={{
            width: `${Math.max(1, size / (count > 4 ? 3.5 : 2.5))}rem`,
            height: `${Math.max(1, size / (count > 4 ? 3.5 : 2.5))}rem`,
          }}
        />
      ))}
    </div>
  );
}

function EmbryoVisual({ week, size }: { week: number; size: number }) {
  return (
    <div
      className="flex items-center justify-center"
      style={{ width: `${size}rem`, height: `${size}rem` }}
    >
      <div className="relative">
        <div
          className="rounded-full bg-gradient-to-br from-pink-100 via-pink-200 to-purple-100 border border-pink-200 dark:border-pink-800/60 flex items-center justify-center"
          style={{
            width: `${size * 0.7}rem`,
            height: `${size * 0.7}rem`,
          }}
        >
          <span style={{ fontSize: `${size * 0.35}rem` }}>🌱</span>
        </div>
        {week >= 6 && (
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-300/40"
            style={{
              width: `${size * 0.15}rem`,
              height: `${size * 0.15}rem`,
              marginTop: `${size * 0.12}rem`,
            }}
          />
        )}
      </div>
    </div>
  );
}

function BabyIllustration({ week, size }: { week: number; size: number }) {
  const progress = week <= 16 ? 0 : week <= 28 ? (week - 16) / 12 : 0.8 + ((week - 28) / 14) * 0.2;

  return (
    <div className="flex items-center justify-center">
      <svg
        viewBox="0 0 200 200"
        style={{ width: `${size}rem`, height: `${size}rem` }}
      >
        <defs>
          <radialGradient id="wombBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fce7f3" stopOpacity="0.5" />
            <stop offset="70%" stopColor="#f5d0fe" stopOpacity="0.2" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <radialGradient id="skin" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#ffe4d6" />
            <stop offset="100%" stopColor="#fdd0bc" />
          </radialGradient>
          <radialGradient id="blush" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fca5a5" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#fca5a5" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Soft ambient glow */}
        <circle cx="100" cy="100" r="90" fill="url(#wombBg)" />

        {week <= 28 ? (
          <UpBaby progress={progress} week={week} />
        ) : (
          <CurledBaby progress={(week - 28) / 14} week={week} />
        )}
      </svg>
    </div>
  );
}

function UpBaby({ progress, week }: { progress: number; week: number }) {
  const headR = 22 + progress * 6;
  const bodyW = 14 + progress * 6;
  const bodyH = 25 + progress * 12;
  const armW = 3.5 + progress * 2;
  const legW = 3.5 + progress * 2;

  return (
    <g transform="translate(100, 105)">
      {/* Body - soft rounded */}
      <ellipse cx="0" cy={bodyH * 0.1} rx={bodyW} ry={bodyH * 0.42} fill="url(#skin)" />

      {/* Arms */}
      <path
        d={`M ${-bodyW * 0.85} ${-bodyH * 0.05} q ${-7} ${bodyH * 0.15} ${-4} ${bodyH * 0.28}`}
        fill="none" stroke="#fdd0bc" strokeWidth={armW} strokeLinecap="round"
      />
      <path
        d={`M ${bodyW * 0.85} ${-bodyH * 0.05} q ${7} ${bodyH * 0.15} ${4} ${bodyH * 0.28}`}
        fill="none" stroke="#fdd0bc" strokeWidth={armW} strokeLinecap="round"
      />

      {/* Hands */}
      <circle cx={-bodyW - 4} cy={bodyH * 0.25} r={2 + progress} fill="url(#skin)" />
      <circle cx={bodyW + 4} cy={bodyH * 0.25} r={2 + progress} fill="url(#skin)" />

      {/* Legs */}
      <path
        d={`M ${-bodyW * 0.4} ${bodyH * 0.46} q ${-2} ${bodyH * 0.18} ${0} ${bodyH * 0.3}`}
        fill="none" stroke="#fdd0bc" strokeWidth={legW} strokeLinecap="round"
      />
      <path
        d={`M ${bodyW * 0.4} ${bodyH * 0.46} q ${2} ${bodyH * 0.18} ${0} ${bodyH * 0.3}`}
        fill="none" stroke="#fdd0bc" strokeWidth={legW} strokeLinecap="round"
      />

      {/* Head */}
      <circle cx="0" cy={-bodyH * 0.38} r={headR} fill="url(#skin)" />

      {/* Ears */}
      <ellipse cx={-headR * 0.9} cy={-bodyH * 0.38} rx={headR * 0.12} ry={headR * 0.18} fill="#f5c4b0" />
      <ellipse cx={headR * 0.9} cy={-bodyH * 0.38} rx={headR * 0.12} ry={headR * 0.18} fill="#f5c4b0" />

      {/* Eyes - cute closed crescents */}
      <path
        d={`M ${-headR * 0.35} ${-bodyH * 0.41} q ${headR * 0.12} ${-2.5} ${headR * 0.24} 0`}
        fill="none" stroke="#7a4a5a" strokeWidth="1.5" strokeLinecap="round"
      />
      <path
        d={`M ${headR * 0.1} ${-bodyH * 0.41} q ${headR * 0.12} ${-2.5} ${headR * 0.24} 0`}
        fill="none" stroke="#7a4a5a" strokeWidth="1.5" strokeLinecap="round"
      />

      {/* Nose */}
      <circle cx="0" cy={-bodyH * 0.33} r={1} fill="#e8b0a0" />

      {/* Mouth - gentle smile */}
      <path
        d={`M ${-headR * 0.12} ${-bodyH * 0.28} q ${headR * 0.12} ${2.5} ${headR * 0.24} 0`}
        fill="none" stroke="#e8a0a0" strokeWidth="1" strokeLinecap="round"
      />

      {/* Cheek blush */}
      <circle cx={-headR * 0.5} cy={-bodyH * 0.33} r={4} fill="url(#blush)" />
      <circle cx={headR * 0.5} cy={-bodyH * 0.33} r={4} fill="url(#blush)" />

      {/* Hair wisps for later weeks */}
      {week >= 20 && (
        <g opacity="0.25">
          <path
            d={`M ${-headR * 0.5} ${-bodyH * 0.38 - headR * 0.85} q ${headR * 0.3} ${-4} ${headR * 0.7} ${-1}`}
            fill="none" stroke="#9a6a6a" strokeWidth="1.5" strokeLinecap="round"
          />
          <path
            d={`M ${-headR * 0.2} ${-bodyH * 0.38 - headR * 0.9} q ${headR * 0.2} ${-3} ${headR * 0.5} ${1}`}
            fill="none" stroke="#9a6a6a" strokeWidth="1.2" strokeLinecap="round"
          />
        </g>
      )}
    </g>
  );
}

function CurledBaby({ progress, week }: { progress: number; week: number }) {
  const headR = 24 + progress * 3;

  return (
    <g transform="translate(100, 100) rotate(-12)">
      {/* Curled body */}
      <path
        d={`M -1 ${-28 + headR * 0.7}
            C 16 -8, 19 12, 10 28
            C 4 37, -7 35, -13 25
            C -18 15, -16 -2, -9 ${-28 + headR * 0.5}`}
        fill="url(#skin)"
      />

      {/* Arm tucked near face */}
      <path
        d="M -3 -1 q -7 5 -5 13"
        fill="none" stroke="#fdd0bc" strokeWidth={5 + progress * 2} strokeLinecap="round"
      />
      <circle cx={-8} cy={-11} r={3 + progress * 0.5} fill="url(#skin)" />

      {/* Other arm */}
      <path
        d="M 6 4 q 6 7 3 15"
        fill="none" stroke="#fdd0bc" strokeWidth={4 + progress * 1.5} strokeLinecap="round" opacity="0.8"
      />

      {/* Legs curled */}
      <path
        d="M 2 25 q 7 5 3 13"
        fill="none" stroke="#fdd0bc" strokeWidth={5.5 + progress * 2} strokeLinecap="round"
      />
      <path
        d="M -5 27 q -2 7 -3 13"
        fill="none" stroke="#fdd0bc" strokeWidth={5.5 + progress * 2} strokeLinecap="round"
      />

      {/* Feet */}
      <ellipse cx={4} cy={40} rx={4 + progress} ry={2.3} fill="url(#skin)" transform="rotate(-8 4 40)" />
      <ellipse cx={-4} cy={42} rx={4 + progress} ry={2.3} fill="url(#skin)" transform="rotate(8 -4 42)" />

      {/* Head */}
      <circle cx={-5} cy={-28} r={headR} fill="url(#skin)" />

      {/* Ear */}
      <ellipse cx={-5 + headR * 0.88} cy={-30} rx={headR * 0.1} ry={headR * 0.17} fill="#f5c4b0" />

      {/* Eyes - peacefully closed */}
      <path
        d={`M ${-5 - headR * 0.32} ${-30} q ${headR * 0.13} ${-2.5} ${headR * 0.26} 0`}
        fill="none" stroke="#7a4a5a" strokeWidth="1.4" strokeLinecap="round"
      />
      <path
        d={`M ${-5 + headR * 0.06} ${-30} q ${headR * 0.13} ${-2.5} ${headR * 0.26} 0`}
        fill="none" stroke="#7a4a5a" strokeWidth="1.4" strokeLinecap="round"
      />

      {/* Nose */}
      <ellipse cx={-3} cy={-24} rx={1.2} ry={0.8} fill="#e8b0a0" />

      {/* Peaceful smile */}
      <path
        d="M -8 -21 q 4 2.5 8 0"
        fill="none" stroke="#e8a0a0" strokeWidth="1" strokeLinecap="round"
      />

      {/* Cheeks */}
      <circle cx={-5 - headR * 0.4} cy={-25} r={4} fill="url(#blush)" />
      <circle cx={-5 + headR * 0.45} cy={-25} r={4} fill="url(#blush)" />

      {/* Hair */}
      {week >= 34 && (
        <g opacity="0.25">
          <path
            d={`M ${-5 - headR * 0.4} ${-28 - headR * 0.75} q ${headR * 0.2} ${-headR * 0.2} ${headR * 0.5} ${-headR * 0.1}`}
            fill="none" stroke="#9a6a6a" strokeWidth="1.3" strokeLinecap="round"
          />
          <path
            d={`M ${-5 + headR * 0.05} ${-28 - headR * 0.8} q ${headR * 0.2} ${-3} ${headR * 0.4} ${1}`}
            fill="none" stroke="#9a6a6a" strokeWidth="1.2" strokeLinecap="round"
          />
        </g>
      )}
    </g>
  );
}
