import BrandMark from "@/components/BrandMark";
import JourneyArtwork from "@/components/JourneyArtwork";
import { Heart, ShieldCheck, Users } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mt-auth-scene">
      <aside className="mt-auth-story">
        <BrandMark />
        <h2 className="mt-display">
          Un tout petit plus.
          <br />
          Pour chaque grande étape.
        </h2>
        <JourneyArtwork phase="baby" />
        <div>
          <p>
            De la première rencontre aux premières aventures, votre famille a
            son petit refuge.
          </p>
          <div className="mt-landing-proof mt-6">
            <span>
              <Heart size={13} /> Grossesse → 6 ans
            </span>
            <span>
              <Users size={13} /> Ensemble
            </span>
            <span>
              <ShieldCheck size={13} /> Carnet privé
            </span>
          </div>
        </div>
      </aside>
      <div className="mt-auth-content">
        <div className="mb-6 sm:hidden">
          <BrandMark />
        </div>
        {children}
      </div>
    </div>
  );
}
