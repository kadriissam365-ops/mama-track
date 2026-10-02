// Diversification alimentaire 4-36 mois (France)
// Sources : Santé publique France 2021 (PNNS), Société française de pédiatrie,
// recommandations EAACI 2020 sur les allergènes.

export type FoodCategory =
  | "legumes"
  | "fruits"
  | "feculents"
  | "viandes"
  | "poissons"
  | "oeufs"
  | "laitages"
  | "legumineuses"
  | "matieres-grasses";

export type Food = {
  code: string;
  label: string;
  category: FoodCategory;
  emoji: string;
  introMonthMin: number; // âge minimum pour introduire (mois)
  introMonthMax: number; // âge max recommandé pour introduction (réduit le risque allergique)
  isMajorAllergen?: boolean;
  prepHint?: string; // conseil prep adapté à l'âge
  notes?: string;
};

export const CATEGORY_META: Record<
  FoodCategory,
  { label: string; emoji: string; intro: string }
> = {
  legumes: {
    label: "Légumes",
    emoji: "🥕",
    intro:
      "Premiers aliments à introduire. Cuits vapeur, mixés en purée lisse au début, puis écrasés à la fourchette vers 8-10 mois.",
  },
  fruits: {
    label: "Fruits",
    emoji: "🍎",
    intro:
      "Cuits puis crus mûrs. Compote sans sucre ajouté. Mixés au début, puis morceaux fondants.",
  },
  feculents: {
    label: "Féculents & céréales",
    emoji: "🌾",
    intro:
      "Riz, semoule, pâtes, pommes de terre, pain. Le gluten s'introduit entre 4 et 6 mois pour réduire le risque de maladie cœliaque.",
  },
  viandes: {
    label: "Viandes",
    emoji: "🥩",
    intro:
      "À partir de 6 mois, 10-20 g/jour mixés. Augmente progressivement jusqu'à 20-30 g vers 1 an. Privilégie volailles et viandes maigres.",
  },
  poissons: {
    label: "Poissons",
    emoji: "🐟",
    intro:
      "Dès 6 mois, 2 fois/semaine (dont 1 poisson gras). 10-20 g/jour. Évite poissons à forte teneur en mercure (espadon, thon, requin) avant 3 ans.",
  },
  oeufs: {
    label: "Œufs",
    emoji: "🥚",
    intro:
      "Œuf entier (jaune + blanc) dès 6 mois selon recommandations actuelles, BIEN cuit. Introduction précoce réduit le risque d'allergie.",
  },
  laitages: {
    label: "Laitages",
    emoji: "🧀",
    intro:
      "Yaourts nature, fromage blanc, fromages cuits dès 6 mois. PAS de lait de vache liquide avant 12 mois (en boisson). Lait infantile reste la base jusqu'à 1 an.",
  },
  legumineuses: {
    label: "Légumineuses",
    emoji: "🫘",
    intro:
      "Lentilles, pois cassés, pois chiches : à partir de 8-10 mois, BIEN cuits et mixés. Riches en fer et protéines végétales.",
  },
  "matieres-grasses": {
    label: "Matières grasses",
    emoji: "🫒",
    intro:
      "Indispensables au cerveau ! Ajoute 1-2 cc d'huile (colza, olive, noix) ou de beurre dans chaque purée dès le début de la diversification.",
  },
};

export const FOODS: Food[] = [
  // Légumes (4-6m)
  { code: "carotte", label: "Carotte", category: "legumes", emoji: "🥕", introMonthMin: 4, introMonthMax: 6, prepHint: "Cuite vapeur, mixée lisse." },
  { code: "courgette", label: "Courgette", category: "legumes", emoji: "🥒", introMonthMin: 4, introMonthMax: 6, prepHint: "Sans peau ni pépins au début, mixée." },
  { code: "haricot-vert", label: "Haricot vert", category: "legumes", emoji: "🫛", introMonthMin: 4, introMonthMax: 6 },
  { code: "potiron", label: "Potiron / Courge", category: "legumes", emoji: "🎃", introMonthMin: 4, introMonthMax: 6 },
  { code: "patate-douce", label: "Patate douce", category: "legumes", emoji: "🍠", introMonthMin: 4, introMonthMax: 6 },
  { code: "brocoli", label: "Brocoli", category: "legumes", emoji: "🥦", introMonthMin: 5, introMonthMax: 7 },
  { code: "epinards", label: "Épinards", category: "legumes", emoji: "🥬", introMonthMin: 6, introMonthMax: 8, notes: "Limiter à 1 fois/semaine au début (nitrates)." },
  { code: "petits-pois", label: "Petits pois", category: "legumes", emoji: "🫛", introMonthMin: 6, introMonthMax: 8 },
  { code: "tomate", label: "Tomate", category: "legumes", emoji: "🍅", introMonthMin: 8, introMonthMax: 10, prepHint: "Sans peau ni pépins jusqu'à 12 mois." },
  { code: "concombre", label: "Concombre", category: "legumes", emoji: "🥒", introMonthMin: 9, introMonthMax: 12, prepHint: "Cru râpé fin." },

  // Fruits (4-6m)
  { code: "pomme", label: "Pomme", category: "fruits", emoji: "🍎", introMonthMin: 4, introMonthMax: 6, prepHint: "Compote cuite sans sucre au début." },
  { code: "poire", label: "Poire", category: "fruits", emoji: "🍐", introMonthMin: 4, introMonthMax: 6 },
  { code: "banane", label: "Banane", category: "fruits", emoji: "🍌", introMonthMin: 5, introMonthMax: 7, prepHint: "Bien mûre, écrasée à la fourchette." },
  { code: "abricot", label: "Abricot", category: "fruits", emoji: "🍑", introMonthMin: 5, introMonthMax: 7 },
  { code: "peche", label: "Pêche / Nectarine", category: "fruits", emoji: "🍑", introMonthMin: 5, introMonthMax: 7 },
  { code: "fraise", label: "Fraise", category: "fruits", emoji: "🍓", introMonthMin: 8, introMonthMax: 12, isMajorAllergen: true, notes: "Allergène modéré, bien que rarement sévère. Introduire après 8 mois." },
  { code: "kiwi", label: "Kiwi", category: "fruits", emoji: "🥝", introMonthMin: 8, introMonthMax: 12, isMajorAllergen: true },
  { code: "agrumes", label: "Agrumes (orange, mandarine)", category: "fruits", emoji: "🍊", introMonthMin: 8, introMonthMax: 12 },

  // Féculents & céréales (4-7m)
  { code: "riz", label: "Riz", category: "feculents", emoji: "🍚", introMonthMin: 4, introMonthMax: 6, prepHint: "Sans gluten — bien cuit, mixé." },
  { code: "pomme-de-terre", label: "Pomme de terre", category: "feculents", emoji: "🥔", introMonthMin: 5, introMonthMax: 7 },
  { code: "ble-gluten", label: "Blé / Gluten (pain, pâtes, semoule)", category: "feculents", emoji: "🍞", introMonthMin: 4, introMonthMax: 6, isMajorAllergen: true, notes: "Introduction entre 4-6m réduit le risque de maladie cœliaque (reco ESPGHAN)." },
  { code: "avoine", label: "Avoine", category: "feculents", emoji: "🌾", introMonthMin: 6, introMonthMax: 9 },

  // Viandes (6m+)
  { code: "poulet", label: "Poulet", category: "viandes", emoji: "🍗", introMonthMin: 6, introMonthMax: 8, prepHint: "10-15 g mixés, augmenter à 20 g vers 1 an." },
  { code: "dinde", label: "Dinde", category: "viandes", emoji: "🦃", introMonthMin: 6, introMonthMax: 8 },
  { code: "boeuf", label: "Bœuf", category: "viandes", emoji: "🥩", introMonthMin: 6, introMonthMax: 9, prepHint: "Très cuit (jamais saignant)." },
  { code: "agneau", label: "Agneau", category: "viandes", emoji: "🐑", introMonthMin: 6, introMonthMax: 9 },
  { code: "jambon-blanc", label: "Jambon blanc", category: "viandes", emoji: "🥓", introMonthMin: 8, introMonthMax: 12, notes: "1 tranche fine — limiter le sel." },

  // Poissons (6m+)
  { code: "cabillaud", label: "Cabillaud", category: "poissons", emoji: "🐟", introMonthMin: 6, introMonthMax: 9, isMajorAllergen: true, prepHint: "10 g cuit, mixé. Bien retirer les arêtes." },
  { code: "sole", label: "Sole / Limande", category: "poissons", emoji: "🐠", introMonthMin: 6, introMonthMax: 9, isMajorAllergen: true },
  { code: "saumon", label: "Saumon", category: "poissons", emoji: "🍣", introMonthMin: 6, introMonthMax: 9, isMajorAllergen: true, notes: "Poisson gras = oméga 3 essentiels." },
  { code: "sardine", label: "Sardine", category: "poissons", emoji: "🐟", introMonthMin: 8, introMonthMax: 12, isMajorAllergen: true },
  { code: "crustaces", label: "Crustacés (crevettes...)", category: "poissons", emoji: "🦐", introMonthMin: 12, introMonthMax: 24, isMajorAllergen: true, notes: "Allergène majeur — introduire après 12 mois en petite quantité." },

  // Œufs (6m)
  { code: "oeuf-entier", label: "Œuf entier (jaune + blanc)", category: "oeufs", emoji: "🥚", introMonthMin: 6, introMonthMax: 8, isMajorAllergen: true, prepHint: "TRÈS cuit (dur ou omelette bien cuite). Commence par 1/4, augmente progressivement." },

  // Laitages (6m)
  { code: "yaourt-nature", label: "Yaourt nature", category: "laitages", emoji: "🥛", introMonthMin: 6, introMonthMax: 9, isMajorAllergen: true, prepHint: "Sans sucre. Yaourt au lait entier." },
  { code: "fromage-blanc", label: "Fromage blanc", category: "laitages", emoji: "🥣", introMonthMin: 6, introMonthMax: 9, isMajorAllergen: true },
  { code: "fromage-cuit", label: "Fromage à pâte cuite (gruyère, emmental)", category: "laitages", emoji: "🧀", introMonthMin: 6, introMonthMax: 12, isMajorAllergen: true, prepHint: "Râpé ou en lamelle fine." },
  { code: "lait-vache", label: "Lait de vache (en boisson)", category: "laitages", emoji: "🥛", introMonthMin: 12, introMonthMax: 18, isMajorAllergen: true, notes: "Lait entier obligatoire jusqu'à 3 ans (lipides essentiels au cerveau). Avant 12 mois UNIQUEMENT en cuisson." },

  // Légumineuses (8m+)
  { code: "lentilles", label: "Lentilles", category: "legumineuses", emoji: "🫘", introMonthMin: 8, introMonthMax: 12, prepHint: "Bien cuites, mixées. Source de fer." },
  { code: "pois-chiches", label: "Pois chiches", category: "legumineuses", emoji: "🫘", introMonthMin: 9, introMonthMax: 15 },
  { code: "haricots-blancs", label: "Haricots blancs / rouges", category: "legumineuses", emoji: "🫘", introMonthMin: 10, introMonthMax: 15, prepHint: "Mixés ou écrasés." },

  // Matières grasses
  { code: "huile-colza", label: "Huile de colza", category: "matieres-grasses", emoji: "🫒", introMonthMin: 4, introMonthMax: 6, prepHint: "1-2 cc dans la purée. Riche en oméga 3." },
  { code: "huile-olive", label: "Huile d'olive", category: "matieres-grasses", emoji: "🫒", introMonthMin: 4, introMonthMax: 6 },
  { code: "beurre", label: "Beurre", category: "matieres-grasses", emoji: "🧈", introMonthMin: 5, introMonthMax: 8, isMajorAllergen: true, prepHint: "Une noisette dans la purée, doux et non salé." },

  // Allergènes spéciaux (souvent en dehors des catégories standard)
  { code: "arachide", label: "Arachide / Cacahuète", category: "legumineuses", emoji: "🥜", introMonthMin: 4, introMonthMax: 8, isMajorAllergen: true, prepHint: "Beurre de cacahuète lisse dilué dans la purée. JAMAIS entier (étouffement)." },
  { code: "fruits-coque", label: "Fruits à coque (amande, noix)", category: "legumineuses", emoji: "🌰", introMonthMin: 6, introMonthMax: 12, isMajorAllergen: true, prepHint: "En poudre fine ou purée d'oléagineux. JAMAIS entier avant 4-5 ans." },
  { code: "sesame", label: "Sésame", category: "legumineuses", emoji: "🌱", introMonthMin: 6, introMonthMax: 12, isMajorAllergen: true, prepHint: "Tahini dilué ou graines moulues." },
  { code: "soja", label: "Soja", category: "legumineuses", emoji: "🫘", introMonthMin: 6, introMonthMax: 12, isMajorAllergen: true },
  { code: "moutarde", label: "Moutarde", category: "matieres-grasses", emoji: "🌶️", introMonthMin: 12, introMonthMax: 24, isMajorAllergen: true },
];

// =============================================================
// Major allergens — used for the dedicated "Allergènes" tab
// =============================================================
export const MAJOR_ALLERGENS = FOODS.filter((f) => f.isMajorAllergen);

// =============================================================
// Foods to AVOID (dangerous before specific age)
// =============================================================
export const FOOD_RULES = [
  {
    rule: "Pas de miel avant 1 an",
    reason: "Risque de botulisme infantile.",
    until: 12,
    emoji: "🍯",
  },
  {
    rule: "Pas de sel ajouté avant 1 an",
    reason: "Reins immatures. Limiter à < 1 g/jour ensuite.",
    until: 12,
    emoji: "🧂",
  },
  {
    rule: "Pas de sucre ajouté avant 2 ans",
    reason: "Habitue au goût sucré et risque de surpoids/caries.",
    until: 24,
    emoji: "🍬",
  },
  {
    rule: "Pas de lait de vache liquide en boisson avant 12 mois",
    reason: "Pauvre en fer, allergène. OK en cuisson.",
    until: 12,
    emoji: "🥛",
  },
  {
    rule: "Pas de fromage au lait cru avant 5 ans",
    reason: "Risque listeria, salmonelle, E. coli.",
    until: 60,
    emoji: "🧀",
  },
  {
    rule: "Pas de poisson cru / sushi / charcuterie crue avant 5 ans",
    reason: "Risque parasitaire et bactérien.",
    until: 60,
    emoji: "🍣",
  },
  {
    rule: "Pas de fruits à coque entiers avant 4-5 ans",
    reason: "Risque d'étouffement (taille + forme).",
    until: 48,
    emoji: "🥜",
  },
  {
    rule: "Pas d'aliments durs ronds entiers avant 4 ans",
    reason: "Raisins, tomates cerises, bonbons durs : étouffement. Toujours couper en quartiers.",
    until: 48,
    emoji: "🍇",
  },
];

// =============================================================
// Mini-guide content (rendered as collapsible cards on the page)
// =============================================================
export const GUIDE_SECTIONS: { title: string; emoji: string; body: string }[] =
  [
    {
      title: "Quand démarrer ?",
      emoji: "📅",
      body:
        "Entre 4 et 6 mois révolus, jamais avant 4 mois. Les signes : bébé tient sa tête seul, montre de l'intérêt pour la nourriture, ouvre la bouche à la cuillère. L'allaitement / lait infantile reste l'aliment principal jusqu'à 1 an — la diversification vient en complément.",
    },
    {
      title: "Purées vs DME (Diversification Menée par l'Enfant)",
      emoji: "🥄",
      body:
        "Purées : texture lisse au début, écrasées vers 8-10 mois, morceaux fondants vers 10-12 mois. DME : bébé mange seul des aliments en bâtonnets dès 6 mois (besoin de tenir assis seul). Les deux fonctionnent — mixe les approches selon ce que tu observes chez ton bébé.",
    },
    {
      title: "Allergènes : introduire tôt, pas tard",
      emoji: "⚠️",
      body:
        "Les recommandations actuelles (EAACI, INSERM) disent d'introduire les allergènes (œuf, gluten, arachide, poisson) ENTRE 4 ET 6 mois pour réduire le risque d'allergie. Un nouvel aliment à la fois, sur 2-3 jours, en petite quantité. Surveille rougeurs, vomissements, gonflement, difficultés à respirer.",
    },
    {
      title: "Quantités indicatives",
      emoji: "⚖️",
      body:
        "6 mois : 100-130 g de purée légumes + 30-50 g compote + 10-15 g protéines. 9 mois : 150-200 g + 50-80 g + 15-20 g. 12 mois : repas familial adapté, 200-250 g. Bébé sait réguler — ne le force pas à finir.",
    },
    {
      title: "Matières grasses : essentielles",
      emoji: "🫒",
      body:
        "Le cerveau de bébé est composé à 60 % de lipides. Ajoute 1-2 cuillères à café d'huile (colza, noix, olive en alternance) ou de beurre doux dans chaque purée — sans cela, l'apport est insuffisant.",
    },
    {
      title: "Eau",
      emoji: "💧",
      body:
        "Avant 6 mois : pas besoin (lait suffit). À partir de la diversification, propose un peu d'eau aux repas dans un verre ou tasse à bec. Eau du robinet OK en France (contrôlée), ou eau faiblement minéralisée.",
    },
  ];

// =============================================================
// Helpers
// =============================================================
export function foodsForAge(months: number): Food[] {
  return FOODS.filter((f) => months >= f.introMonthMin);
}

export function foodsToIntroduceSoon(months: number, alreadyTried: Set<string>): Food[] {
  // Aliments dont la fenêtre d'intro est ouverte (>= introMonthMin et <= introMonthMax + 2)
  return FOODS.filter(
    (f) =>
      months >= f.introMonthMin &&
      months <= f.introMonthMax + 2 &&
      !alreadyTried.has(f.code),
  );
}
