// Conseils par tranche d’âge (0–6 ans)
// Sources : Santé publique France, Société française de pédiatrie, OMS, mpedia.fr
// Contenu indicatif — ne remplace pas l'avis du pédiatre.

export type ConseilCategory =
  | "sommeil"
  | "alimentation"
  | "securite"
  | "developpement"
  | "sante"
  | "quotidien";

export type Conseil = {
  slug: string;
  title: string;
  category: ConseilCategory;
  body: string; // 2-4 phrases, ton bienveillant
};

export type AgeRange = {
  slug: string;
  label: string; // ex "0-3 mois"
  emoji: string;
  minMonths: number;
  maxMonths: number;
  intro: string;
  conseils: Conseil[];
};

export const CATEGORY_META: Record<
  ConseilCategory,
  { label: string; emoji: string }
> = {
  sommeil: { label: "Sommeil", emoji: "😴" },
  alimentation: { label: "Alimentation", emoji: "🍼" },
  securite: { label: "Sécurité", emoji: "🛡️" },
  developpement: { label: "Développement", emoji: "🌱" },
  sante: { label: "Santé", emoji: "🌡️" },
  quotidien: { label: "Quotidien", emoji: "🧸" },
};

export const AGE_RANGES: AgeRange[] = [
  {
    slug: "0-3-mois",
    label: "0-3 mois",
    emoji: "👶",
    minMonths: 0,
    maxMonths: 3,
    intro:
      "Les premières semaines sont une phase d'adaptation. Le rythme se met en place petit à petit — fais-toi confiance.",
    conseils: [
      {
        slug: "couchage-sur-le-dos",
        title: "Toujours sur le dos pour dormir",
        category: "sommeil",
        body: "Pour réduire le risque de mort inattendue du nourrisson, couche bébé sur le dos, sur un matelas ferme, dans une gigoteuse adaptée à sa taille. Pas d'oreiller, de couverture, de tour de lit ni de peluche dans le lit avant 1 an.",
      },
      {
        slug: "temperature-chambre",
        title: "Chambre à 18-20 °C",
        category: "sommeil",
        body: "Une chambre légèrement fraîche limite le risque d'hyperthermie. Évite de trop couvrir bébé : une gigoteoise et un body suffisent souvent.",
      },
      {
        slug: "allaitement-a-la-demande",
        title: "Allaitement à la demande",
        category: "alimentation",
        body: "Au sein comme au biberon, propose à la demande sans imposer d'horaire fixe les premières semaines. Bébé sait réguler ses besoins. En moyenne 8-12 tétées par 24 h les premiers mois.",
      },
      {
        slug: "rots",
        title: "Faire faire le rot",
        category: "alimentation",
        body: "Après chaque tétée ou biberon, garde bébé en position verticale 10-15 min, dos contre toi. S'il s'endort sans avoir fait son rot, ce n'est pas grave — couche-le sur le côté quelques minutes si tu peux le surveiller.",
      },
      {
        slug: "peau-a-peau",
        title: "Peau à peau quotidien",
        category: "developpement",
        body: "Le contact peau à peau régule la température, le rythme cardiaque, et renforce le lien d'attachement. Profites-en après le bain ou pendant les tétées, papa comme maman.",
      },
      {
        slug: "tummy-time",
        title: "Temps sur le ventre éveillé",
        category: "developpement",
        body: "Quand bébé est éveillé et surveillé, mets-le quelques minutes sur le ventre plusieurs fois par jour. Ça muscle son cou, prévient la plagiocéphalie (tête plate) et l'aide à se retourner plus tard.",
      },
      {
        slug: "vitamine-d",
        title: "Vitamine D quotidienne",
        category: "sante",
        body: "Le pédiatre prescrit une supplémentation en vitamine D dès la maternité, à donner tous les jours jusqu'à 18 mois (puis en hiver jusqu'à 5 ans). Indispensable pour la croissance osseuse.",
      },
      {
        slug: "siege-auto-dos",
        title: "Siège auto dos à la route",
        category: "securite",
        body: "Garde bébé en siège auto dos à la route le plus longtemps possible — au moins jusqu'à 15 mois, idéalement jusqu'à 4 ans. C'est 5x plus sûr en cas de choc frontal.",
      },
      {
        slug: "pleurs",
        title: "Les pleurs ne sont pas un caprice",
        category: "quotidien",
        body: "À cet âge, pleurer est le seul moyen de communiquer. Réponds rapidement : tu ne le rendras pas capricieux. Le pic de pleurs survient vers 6-8 semaines puis diminue.",
      },
    ],
  },
  {
    slug: "3-6-mois",
    label: "3-6 mois",
    emoji: "🍼",
    minMonths: 3,
    maxMonths: 6,
    intro:
      "Bébé devient plus interactif : sourires, gazouillis, premiers retournements. Les nuits commencent (souvent) à se structurer.",
    conseils: [
      {
        slug: "rythme-jour-nuit",
        title: "Différencier jour et nuit",
        category: "sommeil",
        body: "Le jour : lumière, bruits normaux, interactions. La nuit : pénombre, voix basse, change rapide. Cette différenciation aide bébé à structurer son rythme circadien.",
      },
      {
        slug: "rituel-coucher",
        title: "Mettre en place un rituel du coucher",
        category: "sommeil",
        body: "Bain, doudou, berceuse, câlin… toujours dans le même ordre. Le rituel rassure et signale à bébé qu'il est temps de dormir. Garde-le court (15-20 min).",
      },
      {
        slug: "lait-exclusif",
        title: "Lait exclusif jusqu'à 4-6 mois",
        category: "alimentation",
        body: "L'OMS recommande l'allaitement exclusif (ou lait infantile) jusqu'à 6 mois. Pas d'eau, pas de jus, pas de tisane sauf avis médical. Le lait couvre tous les besoins, y compris en hydratation.",
      },
      {
        slug: "rgo",
        title: "Régurgitations : quand s'inquiéter",
        category: "sante",
        body: "Les régurgitations sont normales et passent souvent vers 6-9 mois. Consulte si bébé pleure beaucoup pendant ou après, refuse de manger, ne prend pas de poids, ou vomit en jet.",
      },
      {
        slug: "jouets-eveil",
        title: "Jouets adaptés",
        category: "developpement",
        body: "Tapis d'éveil avec arches, hochets, livres en tissu, miroir. À cet âge, les jouets contrastés (noir/blanc/rouge) captent le mieux l'attention. Évite les écrans, même en arrière-plan.",
      },
      {
        slug: "retournements",
        title: "Premiers retournements",
        category: "developpement",
        body: "Vers 4-5 mois, bébé peut se retourner du dos sur le ventre. Sécurise immédiatement la table à langer (ne le laisse jamais seul) et adapte son couchage.",
      },
      {
        slug: "vaccins-2-mois",
        title: "Vaccinations obligatoires",
        category: "sante",
        body: "Le calendrier vaccinal commence à 2 mois (DTP-Coqueluche-Hib-HepB-Pneumocoque-Méningocoque B), avec rappels à 4 et 11 mois. La fièvre post-vaccin est normale 24-48 h, paracétamol si nécessaire.",
      },
    ],
  },
  {
    slug: "6-12-mois",
    label: "6-12 mois",
    emoji: "🥄",
    minMonths: 6,
    maxMonths: 12,
    intro:
      "Diversification, premiers déplacements, anxiété de séparation… une période riche en découvertes pour bébé comme pour toi.",
    conseils: [
      {
        slug: "diversification-debut",
        title: "Démarrer la diversification",
        category: "alimentation",
        body: "Entre 4 et 6 mois selon avis pédiatre, propose un nouvel aliment à la fois sur 2-3 jours pour repérer une éventuelle allergie. Commence par les légumes cuits, puis fruits, puis céréales. Pas de sel, pas de sucre ajouté avant 1 an.",
      },
      {
        slug: "allergenes-precoces",
        title: "Introduire les allergènes tôt",
        category: "alimentation",
        body: "Les recommandations actuelles : introduire les allergènes (œuf, arachide, gluten, poisson) entre 4 et 6 mois, en petites quantités, plutôt que les retarder. Cela réduit le risque d'allergie.",
      },
      {
        slug: "miel-interdit",
        title: "Pas de miel avant 1 an",
        category: "alimentation",
        body: "Le miel peut contenir des spores de botulisme dangereuses pour le nourrisson. Aucune exception, même cuit. Idem pour le lait de vache (avant 1 an pour la boisson, ok dans la cuisson).",
      },
      {
        slug: "securite-maison",
        title: "Sécuriser la maison",
        category: "securite",
        body: "Bébé va bientôt ramper et explorer. Bloque les escaliers, range les produits ménagers en hauteur, mets des cache-prises, fixe les meubles instables. Vérifie ce qui est à hauteur de bouche : pile bouton = urgence vitale.",
      },
      {
        slug: "anxiete-separation",
        title: "L'angoisse de séparation",
        category: "developpement",
        body: "Vers 8 mois, bébé peut pleurer dès que tu sors de la pièce ou refuser les inconnus. C'est normal et signe d'un attachement sain. Annonce toujours quand tu pars et quand tu reviens, même quelques secondes.",
      },
      {
        slug: "regression-sommeil",
        title: "Régression du sommeil",
        category: "sommeil",
        body: "Vers 8-10 mois, beaucoup de bébés se réveillent à nouveau la nuit (apprentissage moteur, dents, angoisse). Phase transitoire — maintiens le rituel, ça repart en quelques semaines.",
      },
      {
        slug: "dents",
        title: "Premières dents",
        category: "sante",
        body: "Salivation, joues rouges, tétée gencive : la poussée dentaire arrive. Anneau de dentition au frigo (jamais au congélateur), massage gencive, paracétamol si douleur. Brossage dès la première dent avec dentifrice fluoré (pois).",
      },
      {
        slug: "marche",
        title: "Pas de trotteur",
        category: "developpement",
        body: "Le trotteur (youpala) est interdit dans plusieurs pays car il retarde la marche, déséquilibre le bassin et cause des chutes graves. Préfère un chariot de marche stable que bébé pousse.",
      },
    ],
  },
  {
    slug: "12-24-mois",
    label: "12-24 mois",
    emoji: "🚶",
    minMonths: 12,
    maxMonths: 24,
    intro:
      'Premiers pas, premiers mots, premiers "non". Bébé devient un petit explorateur qui teste sans cesse les limites — c\'est sain.',
    conseils: [
      {
        slug: "lait-vache",
        title: "Passage au lait de vache",
        category: "alimentation",
        body: "À partir de 12 mois, lait de vache entier (pas demi-écrémé) jusqu'à 3 ans pour les apports en lipides essentiels au cerveau. 500 ml/jour environ, en alternance avec laitages.",
      },
      {
        slug: "neophobie",
        title: "Néophobie alimentaire",
        category: "alimentation",
        body: "Vers 18-24 mois, bébé refuse souvent des aliments qu'il aimait. C'est une phase de protection (instinct contre l'empoisonnement). Re-propose sans forcer, parfois 10-15 fois avant acceptation.",
      },
      {
        slug: "ecrans",
        title: "Pas d'écrans avant 3 ans",
        category: "developpement",
        body: "L'Académie de médecine recommande zéro écran avant 3 ans : TV en arrière-plan incluse. Ça impacte le langage, le sommeil et l'attention. Préfère lecture, jeux libres, contact extérieur.",
      },
      {
        slug: "langage",
        title: "Stimuler le langage",
        category: "developpement",
        body: 'Parle beaucoup à bébé, nomme les objets, lis des livres tous les jours, chante. Reformule sans corriger (s\'il dit "o" pour eau, réponds "oui, tu veux de l\'eau"). À 24 mois, vocabulaire moyen : 50-200 mots.',
      },
      {
        slug: "colere",
        title: "Crises de colère",
        category: "quotidien",
        body: 'Vers 18 mois apparaît le "terrible two". Les crises sont liées à un cerveau qui n\'arrive pas encore à gérer la frustration. Reste calme, valide l\'émotion ("tu es très en colère"), pose la limite avec bienveillance.',
      },
      {
        slug: "noyade",
        title: "Risque de noyade",
        category: "securite",
        body: "Une noyade silencieuse en 20 secondes dans 5 cm d'eau. Bain, piscine, bassine, mare : surveillance constante à portée de bras. Jamais de bracelets/brassards comme seule sécurité.",
      },
      {
        slug: "sommeil-nuit-complete",
        title: "Faire ses nuits",
        category: "sommeil",
        body: "À 18-24 mois, la majorité des enfants dort 10-12 h d'affilée + 1 sieste. Si réveils nocturnes persistent, vérifie : trop de sieste l'après-midi, faim, douleur dentaire, peur du noir.",
      },
    ],
  },
  {
    slug: "24-36-mois",
    label: "24-36 mois",
    emoji: "🎨",
    minMonths: 24,
    maxMonths: 36,
    intro:
      "Personnalité affirmée, langage riche, autonomie grandissante. C'est aussi l'âge de la propreté et souvent de l'entrée en collectivité.",
    conseils: [
      {
        slug: "proprete",
        title: "Apprentissage de la propreté",
        category: "developpement",
        body: "Pas avant que bébé monte/descend les escaliers seul (signe de maturité neuro). Souvent entre 24 et 36 mois. Sans pression : pot accessible, retire la couche par phases, félicite sans surjouer les accidents.",
      },
      {
        slug: "alimentation-variee",
        title: "Repas en famille",
        category: "alimentation",
        body: "Mange avec ton enfant : il imite ce qu'il voit. Présente 1 légume + 1 protéine + 1 féculent par repas, taille adaptée. Ne le force pas à finir — il sait réguler. L'eau est la seule boisson nécessaire.",
      },
      {
        slug: "cauchemars",
        title: "Cauchemars et terreurs nocturnes",
        category: "sommeil",
        body: "Cauchemar : bébé se réveille, te cherche, se souvient. Rassure, valide, raccompagne. Terreur nocturne : il crie sans te reconnaître, ne le réveille pas, sécurise et attend. Phase normale, passe avec le temps.",
      },
      {
        slug: "socialisation",
        title: "Premiers conflits sociaux",
        category: "developpement",
        body: "Crèche, square, fratrie : bébé apprend le partage, qui ne s'acquiert pas avant 3-4 ans réellement. Il mord, pousse, prend les jouets — c'est de l'apprentissage, pas de la méchanceté. Verbalise : \"tu voulais ce jouet\".",
      },
      {
        slug: "autonomie",
        title: "Encourager l'autonomie",
        category: "quotidien",
        body: "Laisse-le faire seul ce qu'il peut : s'habiller (lentement), mettre la table, choisir entre 2 vêtements, se brosser les dents (puis tu repasses). Ça renforce l'estime de soi et réduit les conflits.",
      },
      {
        slug: "lecture-quotidienne",
        title: "Lire tous les jours",
        category: "developpement",
        body: "10-15 min de lecture/jour est la meilleure préparation à l'école. Vocabulaire, attention, imaginaire, lien parent-enfant. Laisse-le choisir, accepte les répétitions du même livre — c'est rassurant pour lui.",
      },
      {
        slug: "rdv-pediatre-suivi",
        title: "Rendez-vous de suivi",
        category: "sante",
        body: "Apportez le carnet de santé aux examens de suivi entre 23 et 24 mois, puis chaque année de 2 à 6 ans. Vérifiez le calendrier vaccinal avec le médecin et parlez-lui des questions qui vous préoccupent sur son développement.",
      },
    ],
  },
  {
    slug: "3-6-ans",
    label: "3–6 ans",
    emoji: "🎒",
    minMonths: 36,
    maxMonths: 73,
    intro:
      "Ses idées grandissent et son monde s’agrandit. Des repères pour l’accompagner, à votre rythme.",
    conseils: [
      {
        slug: "parler-jouer",
        title: "Un moment vraiment ensemble",
        category: "developpement",
        body: "Laissez votre enfant inventer un jeu et vous expliquer ses idées. Un livre, une chanson ou un dessin peuvent ouvrir la conversation. Ses questions comptent autant que les réponses.",
      },
      {
        slug: "petits-choix",
        title: "L’autonomie par de petits choix",
        category: "quotidien",
        body: "Proposez deux options simples, comme choisir une tenue ou un livre. Confiez une petite tâche adaptée à ses capacités. Encouragez son essai sans exiger un résultat parfait.",
      },
      {
        slug: "rituels-souples",
        title: "Des rituels qui rassurent",
        category: "sommeil",
        body: "Créez une suite de petits gestes familiers avant le coucher : se préparer, lire une histoire, se dire bonne nuit. Ajustez-la à votre famille et prenez le temps d’écouter ce qui le préoccupe.",
      },
      {
        slug: "visites-enfance",
        title: "Préparer les visites de santé",
        category: "sante",
        body: "Entre 3 et 6 ans, les examens de suivi permettent de discuter de sa croissance, de son développement, de la vue, de l’audition et de son quotidien. Apportez son carnet de santé et vos questions. Vérifiez avec le médecin les examens réalisés à l’école et le rappel vaccinal des 6 ans.",
      },
    ],
  },
];

export function ageRangeForMonths(months: number): AgeRange | null {
  return (
    AGE_RANGES.find((r) => months >= r.minMonths && months < r.maxMonths) ??
    null
  );
}
