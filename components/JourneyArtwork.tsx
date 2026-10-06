import type { JourneyPhase } from "@/lib/family-journey";

/** Decorative artwork contains no medical measurements or representation. */
export default function JourneyArtwork({
  phase = "pregnancy",
  className = "",
}: {
  phase?: JourneyPhase;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 360 320"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <ellipse
        cx="181"
        cy="284"
        rx="130"
        ry="12"
        fill="#274C40"
        opacity=".08"
      />
      <path
        d="M76 274V144C76 85 119 43 179 43C239 43 280 85 280 144V274"
        fill={phase === "child" ? "#DCE6CE" : "#F2D5C0"}
      />
      <path
        d="M113 274V147C113 108 140 80 179 80C218 80 245 108 245 147V274"
        fill="#FAF7EF"
      />
      <circle cx="291" cy="58" r="26" fill="#D9916C" />
      <path
        d="M291 18V9M291 107V99M330 58H339M243 58H235M264 30L258 24M318 87L324 93M318 30L324 24"
        stroke="#D9916C"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M60 276C67 238 61 218 38 201C25 234 34 261 60 276Z"
        fill="#718E75"
      />
      <path
        d="M62 253C74 213 92 202 112 211C107 236 90 250 62 253Z"
        fill="#A9BEA4"
      />
      <path
        d="M294 277C300 246 306 222 329 207C338 240 326 264 294 277Z"
        fill="#A9BEA4"
      />
      <path
        d="M297 255C285 228 266 227 258 235C264 250 277 257 297 255Z"
        fill="#718E75"
      />
      {phase === "pregnancy" ? (
        <>
          <path
            d="M181 115C136 115 130 163 157 187L181 211L205 187C232 163 226 115 181 115Z"
            fill="#D9916C"
          />
          <path
            d="M155 198L159 240M207 198L203 240M181 211V240"
            stroke="#9A7151"
            strokeWidth="2"
          />
          <path d="M153 240H209L202 268H160L153 240Z" fill="#CDA976" />
          <path d="M165 250H198M168 259H195" stroke="#F6E7D0" strokeWidth="2" />
          <path
            d="M159 159C159 150 167 145 175 150L182 157L189 150C197 145 205 150 205 159C205 168 182 184 182 184C182 184 159 168 159 159Z"
            fill="#FAF7EF"
          />
        </>
      ) : phase === "baby" ? (
        <>
          <path d="M124 201H237L228 262H132L124 201Z" fill="#CDA976" />
          <path
            d="M136 211H225M135 222H225M136 234H225M139 246H222"
            stroke="#E9D6B8"
            strokeWidth="3"
          />
          <path
            d="M139 270L134 288M223 270L228 288"
            stroke="#886C4B"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <ellipse cx="182" cy="197" rx="46" ry="23" fill="#F2D5C0" />
          <circle cx="182" cy="165" r="23" fill="#DFAB83" />
          <path
            d="M164 168C168 172 172 172 175 168M190 168C194 172 198 172 201 168"
            stroke="#886C4B"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path d="M136 196C153 177 201 176 228 196" fill="#DCE6CE" />
          <path
            d="M206 111C196 88 196 74 207 62C182 67 172 89 180 104C185 114 196 117 206 111Z"
            fill="#CDA976"
          />
        </>
      ) : (
        <>
          <path d="M156 202L192 144L229 202L192 244L156 202Z" fill="#D9916C" />
          <path d="M192 145V244M157 202H227" stroke="#F2D5C0" strokeWidth="2" />
          <path
            d="M192 244C223 269 141 259 164 290"
            stroke="#9A7151"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path d="M166 274L158 269L167 264L175 269L166 274Z" fill="#D9916C" />
          <rect x="116" y="237" width="36" height="36" rx="6" fill="#718E75" />
          <circle cx="134" cy="255" r="8" stroke="#DCE6CE" strokeWidth="2" />
          <rect x="218" y="251" width="31" height="31" rx="5" fill="#CDA976" />
          <path d="M226 270L233 260L242 270Z" fill="#FAF7EF" />
        </>
      )}
      <path
        d="M62 105L66 114L75 118L66 122L62 131L58 122L49 118L58 114Z"
        fill="#CDA976"
      />
      <circle cx="244" cy="27" r="4" fill="#A9BEA4" />
      <circle cx="97" cy="58" r="3" fill="#D9916C" />
    </svg>
  );
}
