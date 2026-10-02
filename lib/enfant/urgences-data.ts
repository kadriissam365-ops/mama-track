// Numéros et fiches d'urgences pédiatriques (France)
// Sources : Santé publique France, SAMU, Centre antipoison.
// IMPORTANT : ces fiches ne remplacent pas un appel au 15 ni un avis médical.

export type EmergencyNumber = {
  slug: string;
  label: string;
  number: string;
  description: string;
  emoji: string;
  priority: "vital" | "urgent" | "info";
};

export const EMERGENCY_NUMBERS: EmergencyNumber[] = [
  {
    slug: "samu",
    label: "SAMU",
    number: "15",
    description:
      "Urgence médicale vitale ou avis médical urgent (24 h/24). Pour bébé : appelle si tu hésites.",
    emoji: "🚑",
    priority: "vital",
  },
  {
    slug: "europe",
    label: "Numéro européen d'urgence",
    number: "112",
    description:
      "Joignable partout en Europe, depuis tout téléphone même sans crédit. Redirige vers SAMU/pompiers/police.",
    emoji: "🆘",
    priority: "vital",
  },
  {
    slug: "pompiers",
    label: "Pompiers",
    number: "18",
    description:
      "Accident, incendie, secours à victime. Intervient en cas d'étouffement, de chute grave, de noyade.",
    emoji: "🚒",
    priority: "vital",
  },
  {
    slug: "antipoison",
    label: "Centre antipoison",
    number: "01 40 05 48 48",
    description:
      "Ingestion de produit toxique, médicament, plante. Numéro Paris — chaque région a le sien (CAP).",
    emoji: "☠️",
    priority: "urgent",
  },
  {
    slug: "pharmacie-garde",
    label: "Pharmacie de garde",
    number: "32 37",
    description:
      "Trouver une pharmacie ouverte la nuit ou un dimanche (0,35 €/min depuis fixe).",
    emoji: "💊",
    priority: "info",
  },
  {
    slug: "enfance-en-danger",
    label: "Enfance en danger",
    number: "119",
    description:
      "Numéro national gratuit, 24 h/24, pour signaler une situation de danger pour un enfant.",
    emoji: "🛡️",
    priority: "urgent",
  },
];

export type EmergencyFiche = {
  slug: string;
  title: string;
  emoji: string;
  severity: "vital" | "urgent" | "consultation";
  whenToCall: string; // Quand appeler le 15
  steps: string[]; // Étapes à suivre
  doNot?: string[]; // Ce qu'il NE faut PAS faire
};

export const EMERGENCY_FICHES: EmergencyFiche[] = [
  {
    slug: "etouffement",
    title: "Étouffement",
    emoji: "😶",
    severity: "vital",
    whenToCall:
      "Appelle le 15 IMMÉDIATEMENT si bébé ne peut plus tousser, parler ou respirer.",
    steps: [
      "Bébé tousse fort : laisse-le tousser, c'est efficace.",
      "Bébé ne tousse plus : moins de 1 an → 5 claques dans le dos, tête en bas, allongé sur ton avant-bras.",
      "Si pas d'amélioration : retourne-le sur le dos, 5 compressions thoraciques avec 2 doigts au milieu du sternum.",
      "Alterne 5 claques / 5 compressions jusqu'à dégagement ou arrivée des secours.",
      "Plus de 1 an : manœuvre de Heimlich adaptée — derrière l'enfant, poing entre nombril et sternum, compressions vers l'intérieur et le haut.",
    ],
    doNot: [
      "Ne mets jamais tes doigts au fond de la bouche au hasard — tu risques d'enfoncer le corps étranger.",
      "Ne secoue pas bébé.",
    ],
  },
  {
    slug: "fievre-nourrisson",
    title: "Fièvre chez le nourrisson",
    emoji: "🌡️",
    severity: "vital",
    whenToCall:
      "Appelle le 15 immédiatement pour tout bébé de moins de 3 mois avec fièvre ≥ 38 °C, ou tout bébé fébrile et apathique/inconsolable.",
    steps: [
      "Mesure la température au thermomètre rectal (le plus fiable avant 2 ans).",
      "Découvre bébé (body + couche), pièce à 18-20 °C.",
      "Propose à boire fréquemment (lait, eau).",
      "Paracétamol (Doliprane) selon le poids : 15 mg/kg toutes les 6 h max — JAMAIS d'ibuprofène avant 3 mois ni en cas de varicelle.",
      "Surveille : couleur, comportement, diurèse (couches mouillées), respiration.",
    ],
    doNot: [
      "Pas de bain frais (recommandation abandonnée — provoque frissons et augmente la T°).",
      "Pas d'aspirine (jamais avant 16 ans : risque de syndrome de Reye).",
      "Pas d'alternance paracétamol/ibuprofène sans avis médical.",
    ],
  },
  {
    slug: "convulsion-febrile",
    title: "Convulsion fébrile",
    emoji: "⚡",
    severity: "vital",
    whenToCall:
      "Appelle le 15 dès le début de la crise, surtout si c'est la première, si elle dure plus de 5 min ou se répète.",
    steps: [
      "Allonge bébé sur le côté en position latérale de sécurité.",
      "Dégage l'espace autour, retire ce qui pourrait blesser.",
      "Note l'heure de début et observe : durée, mouvements, conscience.",
      "Ne mets RIEN dans la bouche.",
      "Après la crise, baisse la fièvre (paracétamol) et garde bébé surveillé.",
    ],
    doNot: [
      "Ne le ceins pas, n'essaie pas d'arrêter les mouvements.",
      "Ne lui donne rien à boire pendant ou juste après la crise.",
    ],
  },
  {
    slug: "chute-tete",
    title: "Chute avec choc à la tête",
    emoji: "🤕",
    severity: "urgent",
    whenToCall:
      "Appelle le 15 si : perte de connaissance même brève, vomissements répétés, somnolence anormale, convulsion, écoulement par nez/oreilles, plaie qui saigne beaucoup.",
    steps: [
      "Garde bébé allongé, calme, surveille respiration et conscience.",
      "Applique du froid (poche de glace dans linge) 10 min sur la bosse, pas directement sur la peau.",
      "Surveille les 24-48 h : éveil, comportement, alimentation, marche, équilibre.",
      "Si bébé dort, réveille-le toutes les 2 h la première nuit pour vérifier qu'il répond normalement.",
    ],
    doNot: [
      "Ne le secoue pas pour le réveiller.",
      "Ne lui donne pas d'aspirine (favorise les saignements).",
    ],
  },
  {
    slug: "brulure",
    title: "Brûlure",
    emoji: "🔥",
    severity: "urgent",
    whenToCall:
      "Appelle le 15 si : brûlure du visage, mains, organes génitaux, plis ; > paume de la main de l'enfant ; profonde (peau blanche/noire) ; brûlure électrique ou chimique.",
    steps: [
      "Refroidis sous eau tiède (15-20 °C) pendant 15-20 min, dès que possible.",
      "Retire vêtements et bijoux SAUF s'ils collent à la peau.",
      "Couvre avec un linge propre et humide, sans coton qui colle.",
      "Garde bébé au chaud (couverture sur le reste du corps).",
      "Va aux urgences si tu hésites sur la gravité.",
    ],
    doNot: [
      "Pas de glace, pas d'eau froide brutale (aggrave la brûlure).",
      "Pas de beurre, dentifrice, huile, miel ni \"remède de grand-mère\".",
      "Ne perce pas les cloques.",
    ],
  },
  {
    slug: "intoxication",
    title: "Ingestion / intoxication",
    emoji: "☠️",
    severity: "urgent",
    whenToCall:
      "Appelle le Centre antipoison ou le 15 immédiatement. Garde le produit/médicament avec toi pour le décrire.",
    steps: [
      "Identifie ce qui a été ingéré, quelle quantité, à quelle heure.",
      "Ne provoque PAS le vomissement (sauf consigne explicite du médecin).",
      "Ne donne ni eau, ni lait, ni rien à boire avant l'avis du centre antipoison.",
      "Si bébé est inconscient : position latérale de sécurité, appelle le 15.",
      "Pile bouton ingérée → urgence absolue, va aux urgences immédiatement (risque de perforation en quelques heures).",
    ],
    doNot: [
      "Pas de vomissement provoqué (risque de fausse route, double agression).",
      "Pas de lait \"pour absorber\" — peut accélérer l'absorption de certains toxiques.",
    ],
  },
  {
    slug: "deshydratation",
    title: "Déshydratation",
    emoji: "💧",
    severity: "urgent",
    whenToCall:
      "Appelle le 15 si : moins de 3 couches mouillées en 24 h, fontanelle creuse, yeux cernés/enfoncés, pleurs sans larmes, somnolence, perte de poids > 5 %.",
    steps: [
      "Propose une solution de réhydratation orale (SRO en pharmacie : Adiaril, Picolite) à la cuillère ou seringue, par petites quantités fréquentes.",
      "Continue allaitement / lait habituel.",
      "Évite jus, soda, eau seule (pas adaptés en cas de diarrhée/vomissements).",
      "Surveille : couches, poids, comportement.",
      "Pèse bébé matin et soir pendant l'épisode.",
    ],
    doNot: [
      "Pas de Coca dégazé ni jus de pomme (recettes obsolètes — déséquilibrent les électrolytes).",
      "Ne réduis pas les apports en lait sauf indication médicale.",
    ],
  },
  {
    slug: "noyade",
    title: "Noyade",
    emoji: "🌊",
    severity: "vital",
    whenToCall:
      "Appelle le 15 ET les pompiers (18) IMMÉDIATEMENT, même si bébé semble \"aller bien\" après — la noyade secondaire peut survenir des heures après.",
    steps: [
      "Sors bébé de l'eau, allonge-le sur le dos sur surface dure.",
      "Vérifie respiration (10 sec max) : si absente, débute la réanimation : 5 insufflations bouche à bouche/nez, puis 30 compressions / 2 insufflations.",
      "Compressions sur 1/3 de l'épaisseur du thorax, 100-120/min.",
      "Si conscient : sèche-le, couvre-le, position semi-assise, surveille respiration.",
      "Vas aux urgences même si bébé semble OK : risque de noyade secondaire (œdème pulmonaire) jusqu'à 72 h.",
    ],
    doNot: [
      "Ne tente pas de \"vider l'eau\" en suspendant bébé tête en bas.",
      "Ne le laisse pas seul ensuite, même s'il semble en forme.",
    ],
  },
  {
    slug: "saignement",
    title: "Plaie qui saigne",
    emoji: "🩸",
    severity: "consultation",
    whenToCall:
      "Vas aux urgences si : saignement abondant qui ne s'arrête pas, plaie profonde, béante, sale, par animal, sur le visage, ou si bébé n'est pas vacciné contre le tétanos.",
    steps: [
      "Lave-toi les mains, mets des gants si possible.",
      "Comprime la plaie avec une compresse propre 10 min sans regarder.",
      "Si ça traverse, ajoute une compresse par-dessus sans retirer la première.",
      "Une fois saignement contrôlé, nettoie à l'eau et savon, désinfecte (chlorhexidine).",
      "Pansement adapté, surveillance signes d'infection (rougeur, chaleur, pus, fièvre).",
    ],
    doNot: [
      "Ne mets pas de coton directement (fibres dans la plaie).",
      "Pas d'éther, pas d'alcool fort sur plaie ouverte (douloureux et abîme les tissus).",
      "Ne pose pas de garrot sauf hémorragie incontrôlable d'un membre.",
    ],
  },
  {
    slug: "secouement",
    title: "Syndrome du bébé secoué",
    emoji: "🚨",
    severity: "vital",
    whenToCall:
      "Si tu sens que tu craques face aux pleurs : POSE bébé dans son lit en sécurité et SORS de la pièce. Appelle le 119, le 15, ou un proche.",
    steps: [
      "Ne secoue JAMAIS un bébé, même quelques secondes : risque de lésions cérébrales irréversibles ou décès.",
      "Pleurs prolongés = phase normale, surtout 0-4 mois (pic à 6-8 semaines).",
      "Pose bébé en sécurité, ferme la porte, prends 5 min pour respirer.",
      "Appelle quelqu'un (conjoint, famille, ami, 119, SOS Allaitement, PMI).",
      "Tu n'es pas une mauvaise mère/un mauvais père de demander de l'aide. C'est l'inverse.",
    ],
    doNot: [
      "Ne secoue pas, ne lance pas en l'air, ne fais pas \"sauter\" trop fort.",
      "Ne reste pas seul(e) si tu sens la limite arriver.",
    ],
  },
];
