export interface WeekData {
  week: number;
  sizeMm: number;
  weightG: number;
  fruit: string;
  fruitEmoji: string;
  babyDevelopment: string;
  momTips: string;
  trimester: 1 | 2 | 3;
  weeklyTip: string;
  weeklySymptoms: string[];
  weeklyMilestone?: string;
  testimonials?: string[];
}

export const pregnancyData: WeekData[] = [
  {
    week: 1,
    sizeMm: 0,
    weightG: 0,
    fruit: "Graine de pavot",
    fruitEmoji: "🌱",
    babyDevelopment: "La fécondation vient d'avoir lieu. L'œuf fécondé, appelé zygote, commence son voyage vers l'utérus. La division cellulaire a commencé.",
    momTips: "Commencez à prendre de l'acide folique si ce n'est pas déjà fait. Évitez l'alcool et la caféine.",
    trimester: 1,
    weeklyTip: "Prenez 400 µg d'acide folique par jour pour protéger le tube neural de bébé. C'est le moment le plus important pour ce supplément.",
    weeklySymptoms: ["Aucun symptôme visible", "Légère fatigue possible", "Règles absentes"],
    weeklyMilestone: "Le voyage commence ! ✨",
  },
  {
    week: 2,
    sizeMm: 0.1,
    weightG: 0,
    fruit: "Graine de sésame",
    fruitEmoji: "🫘",
    babyDevelopment: "L'embryon s'implante dans la paroi utérine. Le blastocyste se développe et les premières cellules spécialisées apparaissent.",
    momTips: "Continuez l'acide folique. Consultez votre médecin pour confirmer la grossesse.",
    trimester: 1,
    weeklyTip: "Hydratez-vous bien (1,5 à 2 litres d'eau par jour) et continuez vos compléments d'acide folique sans interruption.",
    weeklySymptoms: ["Implantation (légères crampes)", "Spotting d'implantation possible", "Seins sensibles"],
  },
  {
    week: 3,
    sizeMm: 0.5,
    weightG: 0,
    fruit: "Graine de chia",
    fruitEmoji: "🌰",
    babyDevelopment: "Les trois couches germinales se forment : l'ectoderme, le mésoderme et l'endoderme. Le système nerveux commence à se former.",
    momTips: "Vous pourriez ressentir les premiers signes de grossesse : fatigue, nausées légères. Reposez-vous.",
    trimester: 1,
    weeklyTip: "Évitez la charcuterie crue, les fromages à pâte molle et les œufs crus dès maintenant pour protéger bébé des infections.",
    weeklySymptoms: ["Fatigue inhabituelle", "Légères nausées", "Seins gonflés"],
    weeklyMilestone: "Le système nerveux se met en place !",
  },
  {
    week: 4,
    sizeMm: 1,
    weightG: 0,
    fruit: "Grain de riz",
    fruitEmoji: "🍚",
    babyDevelopment: "Le tube neural se forme, précurseur du cerveau et de la moelle épinière. Le cœur primitif commence à battre.",
    momTips: "Testez votre grossesse à la maison. Prenez rendez-vous chez votre gynécologue.",
    trimester: 1,
    weeklyTip: "Un test de grossesse positif ? Félicitations ! Prenez rendez-vous rapidement avec votre médecin ou sage-femme.",
    weeklySymptoms: ["Test de grossesse positif", "Nausées légères le matin", "Envies fréquentes d'uriner"],
    weeklyMilestone: "Grossesse confirmée ! 🎉",
  },
  {
    week: 5,
    sizeMm: 4,
    weightG: 0,
    fruit: "Graine de sésame",
    fruitEmoji: "🫘",
    babyDevelopment: "Le cœur bat pour la première fois ! Les bourgeons des membres apparaissent. Le cerveau, les yeux et les oreilles commencent à se former.",
    momTips: "Les nausées matinales peuvent commencer. Mangez de petits repas fréquents et restez hydratée.",
    trimester: 1,
    weeklyTip: "Contre les nausées : grignotez des crackers avant de lever, buvez du gingembre en infusion, fractionnez vos repas en 5-6 petites prises.",
    weeklySymptoms: ["Nausées matinales", "Fatigue intense", "Sautes d'humeur"],
    weeklyMilestone: "Le cœur de bébé bat pour la première fois ! 💓",
  },
  {
    week: 6,
    sizeMm: 8,
    weightG: 0,
    fruit: "Lentille",
    fruitEmoji: "🟢",
    babyDevelopment: "Le visage prend forme avec les yeux, les narines et la bouche. Les bras et les jambes s'allongent. Le cœur a maintenant 4 chambres.",
    momTips: "Évitez les odeurs fortes si elles causent des nausées. Le gingembre peut aider à soulager les nausées.",
    trimester: 1,
    weeklyTip: "Le gingembre (tisane, biscuits au gingembre) est votre allié contre les nausées. Gardez toujours un en-cas à portée de main.",
    weeklySymptoms: ["Nausées et vomissements", "Hypersensibilité aux odeurs", "Poitrine très sensible"],
  },
  {
    week: 7,
    sizeMm: 13,
    weightG: 0,
    fruit: "Myrtille",
    fruitEmoji: "🫐",
    babyDevelopment: "Le cerveau se développe rapidement. Les doigts et les orteils commencent à apparaître. Le foie produit les globules rouges.",
    momTips: "Votre utérus a doublé de taille. Vous pourriez ressentir des ballonnements. Portez des vêtements confortables.",
    trimester: 1,
    weeklyTip: "Misez sur les légumes verts (épinards, brocolis) riches en folates naturels, en plus de votre supplément d'acide folique.",
    weeklySymptoms: ["Ballonnements", "Constipation", "Salive excessive"],
  },
  {
    week: 8,
    sizeMm: 16,
    weightG: 1,
    fruit: "Framboise",
    fruitEmoji: "🍓",
    babyDevelopment: "Tous les organes vitaux sont en place. Le bébé peut faire de petits mouvements. Les paupières se forment.",
    momTips: "Première échographie possible. Parlez à votre médecin de vos médicaments habituels.",
    trimester: 1,
    weeklyTip: "Évitez tout médicament sans avis médical. Même l'ibuprofène est contre-indiqué ; préférez le paracétamol si nécessaire.",
    weeklySymptoms: ["Fatigue intense", "Nausées persistantes", "Envies et aversions alimentaires"],
    weeklyMilestone: "Première échographie possible 🖤",
  },
  {
    week: 9,
    sizeMm: 23,
    weightG: 2,
    fruit: "Cerise",
    fruitEmoji: "🍒",
    babyDevelopment: "Le bébé ressemble maintenant à un petit humain. Les muscles faciaux se développent. Les dents commencent à se former sous les gencives.",
    momTips: "La fatigue est normale au premier trimestre. Dormez autant que possible et acceptez l'aide de vos proches.",
    trimester: 1,
    weeklyTip: "Consultez un dentiste si besoin : les hormones fragilisent les gencives. La santé dentaire est liée à la santé de bébé.",
    weeklySymptoms: ["Fatigue extrême", "Gencives sensibles", "Pertes blanches légères"],
  },
  {
    week: 10,
    sizeMm: 31,
    weightG: 4,
    fruit: "Kumquat",
    fruitEmoji: "🍊",
    babyDevelopment: "Le bébé commence à bouger librement dans le liquide amniotique. Tous les organes sont formés. Les ongles apparaissent.",
    momTips: "Votre ventre commence à s'arrondir. Profitez du 2ème trimestre qui approche pour vous sentir mieux.",
    trimester: 1,
    weeklyTip: "Intégrez des protéines à chaque repas : œufs, légumineuses, viande maigre. Elles sont essentielles à la croissance de bébé.",
    weeklySymptoms: ["Nausées qui s'atténuent", "Légère prise de poids", "Moins de fatigue"],
  },
  {
    week: 11,
    sizeMm: 41,
    weightG: 7,
    fruit: "Figue",
    fruitEmoji: "🫐",
    babyDevelopment: "Les dents de lait se forment. Le bébé peut sucer son pouce. Son corps se redresse et il commence à ressembler à un bébé.",
    momTips: "La dépistage de la trisomie 21 (clarté nucale + prise de sang) se fait entre 11 et 13 semaines.",
    trimester: 1,
    weeklyTip: "Bientôt le dépistage du 1er trimestre ! Assurez-vous d'avoir un rendez-vous pour la clarté nucale entre SA 11 et SA 13+6.",
    weeklySymptoms: ["Nausées en diminution", "Constipation", "Légères douleurs ligamentaires"],
    weeklyMilestone: "Dépistage T1 à programmer 🩺",
  },
  {
    week: 12,
    sizeMm: 54,
    weightG: 14,
    fruit: "Lime",
    fruitEmoji: "🍋",
    babyDevelopment: "Les réflexes apparaissent. Le bébé peut ouvrir et fermer les poings. Son sexe commence à se différencier.",
    momTips: "Fin du premier trimestre ! Le risque de fausse couche diminue considérablement. Vous pouvez annoncer votre grossesse.",
    trimester: 1,
    weeklyTip: "Fin du 1er trimestre ! Vous pouvez commencer à masser votre ventre avec de l'huile de calendula pour prévenir les vergetures.",
    weeklySymptoms: ["Nausées qui s'atténuent", "Seins moins douloureux", "Légère rondeur abdominale"],
    weeklyMilestone: "Fin du 1er trimestre ! 🎊",
  },
  {
    week: 13,
    sizeMm: 74,
    weightG: 23,
    fruit: "Pois chiche",
    fruitEmoji: "🫛",
    babyDevelopment: "Le bébé développe ses empreintes digitales uniques. Son intestin se forme. Les os commencent à se durcir.",
    momTips: "Bienvenue au 2ème trimestre ! L'énergie revient souvent. Profitez-en pour faire de l'exercice doux.",
    trimester: 2,
    weeklyTip: "Bienvenue au 2ème trimestre ! Augmentez votre apport en fer avec des épinards, lentilles et viande rouge maigre.",
    weeklySymptoms: ["Regain d'énergie", "Appétit qui revient", "Légère congestion nasale"],
    weeklyMilestone: "Entrée dans le 2ème trimestre 🌸",
  },
  {
    week: 14,
    sizeMm: 85,
    weightG: 43,
    fruit: "Citron",
    fruitEmoji: "🍋",
    babyDevelopment: "Le bébé commence à faire des grimaces. Ses sourcils et ses cils poussent. Il peut avaler du liquide amniotique.",
    momTips: "Le risque de nausées diminue. Profitez de cet élan d'énergie pour préparer la chambre de bébé.",
    trimester: 2,
    weeklyTip: "Consommez du calcium quotidiennement : 3-4 portions de produits laitiers ou équivalents végétaux (amandes, tofu, brocolis).",
    weeklySymptoms: ["Énergie retrouvée", "Appétit augmenté", "Ventre qui s'arrondit"],
  },
  {
    week: 15,
    sizeMm: 100,
    weightG: 70,
    fruit: "Orange",
    fruitEmoji: "🍊",
    babyDevelopment: "Le bébé peut former des expressions faciales. Il s'agite beaucoup mais vous ne le sentez pas encore. Ses os deviennent plus solides.",
    momTips: "Vous pouvez reprendre une activité sportive douce. La natation et le yoga prénatal sont idéaux.",
    trimester: 2,
    weeklyTip: "La marche 30 min/jour est idéale à ce stade. Elle améliore la circulation, réduit les œdèmes et prépare votre corps à l'accouchement.",
    weeklySymptoms: ["Ventre visible", "Fourmillements dans les mains", "Légers maux de dos"],
  },
  {
    week: 16,
    sizeMm: 116,
    weightG: 100,
    fruit: "Avocat",
    fruitEmoji: "🥑",
    babyDevelopment: "Le bébé peut entendre vos sons cardiaques et votre voix. Ses mouvements deviennent coordonnés. Le système circulatoire fonctionne bien.",
    momTips: "Parlez et chantez à votre bébé - il peut vous entendre ! Débutez la lecture ou la musique douce.",
    trimester: 2,
    weeklyTip: "Bébé entend ! Parlez-lui, lisez-lui des histoires, mettez de la musique douce. Votre voix le rassure déjà.",
    weeklySymptoms: ["Rondeurs de grossesse visibles", "Légères douleurs ligamentaires", "Peau plus lumineuse"],
    weeklyMilestone: "Bébé vous entend ! 👂",
  },
  {
    week: 17,
    sizeMm: 130,
    weightG: 140,
    fruit: "Poire",
    fruitEmoji: "🍐",
    babyDevelopment: "Le bébé accumule de la graisse sous sa peau. Ses empreintes digitales sont définitives. Il peut faire des grimaces et cligner des yeux.",
    momTips: "Les ronds de ligament (douleurs sur les côtés) sont normaux. Évitez les mouvements brusques.",
    trimester: 2,
    weeklyTip: "Les douleurs ligamentaires sont normales. Le yoga prénatal et les étirements doux soulagent considérablement ces tensions.",
    weeklySymptoms: ["Douleurs ligamentaires", "Léger gain de poids", "Nez bouché"],
  },
  {
    week: 18,
    sizeMm: 142,
    weightG: 190,
    fruit: "Poivron",
    fruitEmoji: "🫑",
    babyDevelopment: "Les os de l'oreille interne sont développés. Le bébé peut entendre des sons externes. Il grimace et fait des mimiques.",
    momTips: "Deuxième échographie morphologique à prévoir entre 20 et 24 semaines. Pensez à prendre rendez-vous.",
    trimester: 2,
    weeklyTip: "Augmentez votre apport en oméga-3 avec du saumon, des sardines ou des noix. Ils sont essentiels au développement cérébral de bébé.",
    weeklySymptoms: ["Premiers mouvements perceptibles", "Douleurs dans le bas du dos", "Constipation"],
    weeklyMilestone: "Les premiers coups de pied approchent ! 🥊",
  },
  {
    week: 19,
    sizeMm: 152,
    weightG: 240,
    fruit: "Mangue",
    fruitEmoji: "🥭",
    babyDevelopment: "Le vernix caseosa protège la peau du bébé. Son cerveau se développe massivement. Les reins produisent de l'urine.",
    momTips: "Vous pourriez sentir les premiers mouvements du bébé (papillonnements). C'est une sensation unique !",
    trimester: 2,
    weeklyTip: "Sentez les premiers papillonnements ? Notez chaque jour les mouvements de bébé – cela vous aidera à connaître son rythme.",
    weeklySymptoms: ["Premiers mouvements (papillonnements)", "Vertige léger", "Gonflement des pieds"],
  },
  {
    week: 20,
    sizeMm: 160,
    weightG: 300,
    fruit: "Banane",
    fruitEmoji: "🍌",
    babyDevelopment: "Mi-grossesse ! Le bébé avale, digère et urine. Ses sens s'affinent. Ses sourcils et ses cils sont bien formés.",
    momTips: "Félicitations, vous êtes à mi-parcours ! L'échographie morphologique est très importante. Profitez de ce moment.",
    trimester: 2,
    weeklyTip: "Mi-parcours ! L'échographie morphologique va tout vérifier. C'est normal d'être émue – profitez pleinement de ce moment.",
    weeklySymptoms: ["Ventre bien arrondi", "Essoufflement léger", "Brûlures d'estomac"],
    weeklyMilestone: "Mi-grossesse ! Échographie morphologique 🔬",
  },
  {
    week: 21,
    sizeMm: 267,
    weightG: 360,
    fruit: "Carotte",
    fruitEmoji: "🥕",
    babyDevelopment: "Le bébé goûte le liquide amniotique. Ses doigts et orteils sont bien formés avec des ongles. Il dort et se réveille régulièrement.",
    momTips: "Dormez sur le côté gauche pour une meilleure circulation. Utilisez un coussin de grossesse pour le confort.",
    trimester: 2,
    weeklyTip: "Dormez sur le côté gauche : cela améliore la circulation vers bébé et réduit les gonflements. Un coussin de grossesse est votre meilleure amie !",
    weeklySymptoms: ["Mouvements foetaux fréquents", "Reflux gastriques", "Chevilles gonflées"],
  },
  {
    week: 22,
    sizeMm: 278,
    weightG: 430,
    fruit: "Épi de maïs",
    fruitEmoji: "🌽",
    babyDevelopment: "Le bébé réagit aux sons forts. Ses lèvres et ses sourcils sont bien définis. Il a des cycles de sommeil de 12 à 14 heures.",
    momTips: "Des crampes aux jambes ? Étirez vos mollets, hydratez-vous et augmentez votre apport en magnésium.",
    trimester: 2,
    weeklyTip: "Les crampes nocturnes ? Le magnésium (amandes, chocolat noir, bananes) peut aider. Parlez-en à votre sage-femme.",
    weeklySymptoms: ["Crampes nocturnes", "Douleurs pelviennes", "Varices légères"],
  },
  {
    week: 23,
    sizeMm: 288,
    weightG: 501,
    fruit: "Pamplemousse",
    fruitEmoji: "🍊",
    babyDevelopment: "Le bébé pèse maintenant plus de 500g. Ses poumons se préparent à respirer. Il peut percevoir la lumière à travers la paroi abdominale.",
    momTips: "Votre ventre grossit vite. Hydratez votre peau pour éviter les vergetures. Les massages à l'huile sont agréables.",
    trimester: 2,
    weeklyTip: "Massez votre ventre avec de l'huile de rose musquée ou d'argan chaque soir – cela prévient les vergetures et renforce le lien avec bébé.",
    weeklySymptoms: ["Vergetures possibles", "Insomnie légère", "Brûlures d'estomac"],
  },
  {
    week: 24,
    sizeMm: 300,
    weightG: 600,
    fruit: "Maïs",
    fruitEmoji: "🌽",
    babyDevelopment: "La viabilité foetale est atteinte. Le bébé pèse environ 600g. Il peut survivre avec une aide médicale intensive s'il naît maintenant.",
    momTips: "Parlez du congé maternité avec votre employeur. Commencez à penser à la préparation à la naissance.",
    trimester: 2,
    weeklyTip: "Inscrivez-vous aux cours de préparation à la naissance (haptonomioe, yoga prénatal, sophrologie). Les places partent vite !",
    weeklySymptoms: ["Fond utérin à hauteur du nombril", "Gêne respiratoire légère", "Troubles du sommeil"],
    weeklyMilestone: "Seuil de viabilité foetale atteint 💪",
  },
  {
    week: 25,
    sizeMm: 345,
    weightG: 660,
    fruit: "Rutabaga",
    fruitEmoji: "🟡",
    babyDevelopment: "Les mains sont pleinement développées. Le bébé répond à la lumière. Sa peau devient moins translucide.",
    momTips: "Commencez à penser à l'allaitement. Consultez une consultante en lactation si nécessaire.",
    trimester: 2,
    testimonials: [
      "Semaine 25 et babé gigote comme un poisson ! Les nuits sont animées mais je kiffe chaque mouvement 😊 — Yasmine, 30 ans",
      "J'ai commencé les cours de hapto cette semaine, mon mari adore. Babé répond quand on lui parle ! — Sophie, maman de Jules"
    ],
    weeklyTip: "Testez de dépistage du diabète gestationnel (HGPO) prévu vers 24-28 semaines. Ne sautez pas cette analyse importante.",
    weeklySymptoms: ["Mouvements fréquents et forts", "Gonflements des mains", "Fatigue après effort"],
  },
  {
    week: 26,
    sizeMm: 360,
    weightG: 760,
    fruit: "Laitue romaine",
    fruitEmoji: "🥬",
    babyDevelopment: "Les yeux s'ouvrent pour la première fois. Le bébé peut cligner des yeux. Le cerveau connaît une croissance rapide.",
    momTips: "Reposez-vous quand vous pouvez. Les crampes nocturnes sont fréquentes - étirez vos mollets avant de dormir.",
    trimester: 2,
    weeklyTip: "Les yeux de bébé s'ouvrent ! Éclairez doucement votre ventre avec une lampe de poche – bébé peut réagir à la lumière.",
    weeklySymptoms: ["Crampes dans les jambes", "Fourmillements (syndrome du canal carpien)", "Prise de poids régulière"],
    weeklyMilestone: "Bébé ouvre les yeux ! 👀",
  },
  {
    week: 27,
    sizeMm: 370,
    weightG: 875,
    fruit: "Chou-fleur",
    fruitEmoji: "🥦",
    babyDevelopment: "Le cerveau continue de se développer rapidement. Le bébé peut reconnaître votre voix. Les cycles de sommeil/éveil sont établis.",
    momTips: "Dernier mois du 2ème trimestre. Préparez votre valise de maternité (vous avez encore le temps !)",
    trimester: 2,
    weeklyTip: "Bébé reconnaît votre voix ! Parlez-lui de votre journée, lisez-lui des histoires – c'est le début de votre relation.",
    weeklySymptoms: ["Douleurs sciatiques", "Gêne abdominale", "Mouvements rythmiques (hoquet fœtal)"],
  },
  {
    week: 28,
    sizeMm: 380,
    weightG: 1005,
    fruit: "Aubergine",
    fruitEmoji: "🍆",
    babyDevelopment: "Le bébé peut rêver (phase REM). Les poumons sont presque matures. La peau se lisse grâce à la graisse sous-cutanée.",
    momTips: "Bienvenue au 3ème trimestre ! Troisième échographie prévue. Commencez à compter les mouvements quotidiennement.",
    trimester: 3,
    testimonials: [
      "3ème trimestre, le ventre est lourd mais chaque coup de pied me rappelle que c'est bientôt ! Je tiens le coup 💪 — Clara, 34 ans",
      "L'écho du 3ème trim. était émotionnelle, j'ai failli craquer. Voir son visage, c'est indicible 😍 — Emilie, maman de Tom"
    ],
    weeklyTip: "Augmentez votre apport en vitamine D (soleil, poissons gras, œufs). Elle est essentielle pour les os de bébé en cette phase de croissance rapide.",
    weeklySymptoms: ["Essoufflement plus marqué", "Contractions de Braxton-Hicks", "Insomnie"],
    weeklyMilestone: "Entrée dans le 3ème trimestre ! 🌟",
  },
  {
    week: 29,
    sizeMm: 390,
    weightG: 1150,
    fruit: "Butternut",
    fruitEmoji: "🎃",
    babyDevelopment: "Le bébé accumule de la graisse. Les muscles et les poumons mûrissent. Il peut saisir solidement si quelque chose touche sa main.",
    momTips: "Vous pourriez avoir du mal à dormir. Utilisez des coussins pour trouver une position confortable.",
    trimester: 3,
    weeklyTip: "Mangez de petits repas fréquents (5-6/jour) pour éviter les brûlures d'estomac. Évitez de vous allonger juste après manger.",
    weeklySymptoms: ["Brûlures d'estomac intenses", "Dos douloureux", "Fatigue retour"],
  },
  {
    week: 30,
    sizeMm: 400,
    weightG: 1300,
    fruit: "Chou",
    fruitEmoji: "🥬",
    babyDevelopment: "Le bébé produit des globules rouges. Son cerveau grandit vite avec des circonvolutions. Il a maintenant les yeux ouverts quand il est éveillé.",
    momTips: "Le souffle court est fréquent car bébé appuie sur votre diaphragme. Prenez des pauses régulières.",
    trimester: 3,
    weeklyTip: "Commencez les exercices de Kegel : 3 séries de 10 contractions par jour pour renforcer le périnée et préparer l'accouchement.",
    weeklySymptoms: ["Souffle court", "Fréquence urinaire élevée", "Douleurs pelviennes"],
  },
  {
    week: 31,
    sizeMm: 410,
    weightG: 1500,
    fruit: "Noix de coco",
    fruitEmoji: "🥥",
    babyDevelopment: "Les reins fonctionnent pleinement. Le bébé peut tourner la tête. Ses pupilles réagissent à la lumière et à l'obscurité.",
    momTips: "Réfléchissez à votre plan de naissance. Visitez la maternité si ce n'est pas encore fait.",
    trimester: 3,
    weeklyTip: "Rédigez votre plan de naissance : péridurale ou non, positions souhaitées, peau-à-peau, allaitement. Partagez-le avec l'équipe médicale.",
    weeklySymptoms: ["Contractions de Braxton-Hicks plus fréquentes", "Lourdeur des jambes", "Œdèmes des chevilles"],
  },
  {
    week: 32,
    sizeMm: 420,
    weightG: 1700,
    fruit: "Jicama",
    fruitEmoji: "⚪",
    babyDevelopment: "Le bébé pratique la respiration. Ses ongles et cheveux continuent de pousser. Il se positionne souvent tête en bas.",
    momTips: "Les contractions de Braxton-Hicks peuvent commencer. Ce sont des contractions d'entraînement, normales.",
    trimester: 3,
    weeklyTip: "Pratiquez la respiration abdominale et la relaxation pour gérer les contractions. La sophrologie ou l'hypnobirthing peuvent vraiment aider.",
    weeklySymptoms: ["Contractions d'entraînement", "Difficulté à respirer profondément", "Mouvements de bébé très perceptibles"],
    weeklyMilestone: "Bébé se met souvent en position tête en bas 👶",
  },
  {
    week: 33,
    sizeMm: 430,
    weightG: 1900,
    fruit: "Ananas",
    fruitEmoji: "🍍",
    babyDevelopment: "Le crâne reste souple pour faciliter l'accouchement. Le bébé coordonne respiration, succion et déglutition.",
    momTips: "Commencez à préparer votre valise de maternité si ce n'est pas encore fait. Notez les contractions.",
    trimester: 3,
    weeklyTip: "Préparez votre valise de maternité ! Checklist : documents, vêtements confortables, affaires de bébé, snacks pour le travail.",
    weeklySymptoms: ["Lourdeur abdominale", "Difficultés à dormir", "Brûlures d'estomac persistantes"],
  },
  {
    week: 34,
    sizeMm: 450,
    weightG: 2100,
    fruit: "Melon cantaloup",
    fruitEmoji: "🍈",
    babyDevelopment: "Le système nerveux central est presque mature. Le bébé reconnaît les voix familières. Sa peau est de moins en moins ridée.",
    momTips: "Consultez votre sage-femme plus fréquemment. Apprenez les signes du travail prématuré.",
    trimester: 3,
    weeklyTip: "Connaissez les signes du travail : contractions régulières toutes les 5 min, perte des eaux, diminution des mouvements. N'hésitez pas à appeler la maternité.",
    weeklySymptoms: ["Descente de bébé possible", "Pression pelvienne accrue", "Épuisement"],
  },
  {
    week: 35,
    sizeMm: 460,
    weightG: 2400,
    fruit: "Melon de miel",
    fruitEmoji: "🍈",
    babyDevelopment: "Les reins sont pleinement développés. La plupart des bébés nés à 35 semaines se portent bien. La graisse sous-cutanée continue de s'accumuler.",
    momTips: "Reposez-vous le plus possible. La fatigue est normale. Préparez-vous mentalement pour l'accouchement.",
    trimester: 3,
    weeklyTip: "Mangez des aliments riches en vitamine K (brocolis, choux, épinards) pour une bonne coagulation sanguine à l'accouchement.",
    weeklySymptoms: ["Fréquence urinaire très élevée", "Douleurs pubis (SPD)", "Fatigue importante"],
  },
  {
    week: 36,
    sizeMm: 470,
    weightG: 2600,
    fruit: "Papaye",
    fruitEmoji: "🥭",
    babyDevelopment: "Le bébé est considéré comme prématuré tardif. Il a la taille d'une papaye. Les poumons sont presque totalement matures.",
    momTips: "Votre ventre peut descendre (engagement). La pression sur le diaphragme diminue mais sur la vessie augmente.",
    trimester: 3,
    weeklyTip: "Avec l'engagement de bébé, vous respirez mieux mais courez plus souvent aux toilettes. Profitez de ce soulagement !",
    weeklySymptoms: ["Engagement de bébé (descente)", "Facilité à respirer", "Envies urinaires très fréquentes"],
    weeklyMilestone: "Bébé est en position d'engagement ! ⬇️",
  },
  {
    week: 37,
    sizeMm: 480,
    weightG: 2900,
    fruit: "Chou frisé",
    fruitEmoji: "🥬",
    babyDevelopment: "Le bébé est considéré à terme précoce. Ses poumons sont matures. Il continue de prendre du poids.",
    momTips: "Le bébé peut naître à tout moment maintenant. Finalisez votre valise. Connaissez les signes du travail.",
    trimester: 3,
    weeklyTip: "Bébé est à terme précoce ! Finalisez tout : valise prête, trajet maternité répété, téléphones chargés, personnes prévenues.",
    weeklySymptoms: ["Contractions irrégulières fréquentes", "Bouchon muqueux possible", "Pelvienne lourde"],
    weeklyMilestone: "À terme précoce ! Bébé peut arriver 🏥",
  },
  {
    week: 38,
    sizeMm: 490,
    weightG: 3100,
    fruit: "Poireau",
    fruitEmoji: "🧅",
    babyDevelopment: "Le bébé est à terme. Il a perdu la plupart du vernix. Ses organes sont pleinement fonctionnels.",
    momTips: "La date d'accouchement approche ! Restez active avec des promenades douces. Reposez-vous quand possible.",
    trimester: 3,
    weeklyTip: "Continuez la marche douce, elle aide bébé à s'engager. Reposez-vous aussi : vous aurez besoin de toute votre énergie pour l'accouchement.",
    weeklySymptoms: ["Bouchon muqueux possible", "Fausse route possible", "Anxiété avant accouchement"],
  },
  {
    week: 39,
    sizeMm: 500,
    weightG: 3300,
    fruit: "Pastèque mini",
    fruitEmoji: "🍉",
    babyDevelopment: "Le bébé est pleinement à terme. Il continue de prendre du poids. Son cerveau continue de se développer même après la naissance.",
    momTips: "Chaque jour compte pour la maturation du cerveau. Soyez attentive aux contractions régulières et à la perte des eaux.",
    trimester: 3,
    weeklyTip: "Restez attentive à la perte des eaux (liquide clair et abondant) et aux contractions régulières toutes les 5 min. C'est LE signal !",
    weeklySymptoms: ["Contractions régulières possibles", "Perte des eaux possible", "Nesting (envie de tout préparer)"],
    weeklyMilestone: "Bébé est prêt ! L'accouchement est imminent 🌅",
  },
  {
    week: 40,
    sizeMm: 510,
    weightG: 3500,
    fruit: "Citrouille",
    fruitEmoji: "🎃",
    babyDevelopment: "C'est la semaine prévue ! Le bébé est prêt à naître. Il pèse en moyenne 3,5 kg et mesure environ 51 cm.",
    momTips: "C'est la date prévue d'accouchement. Soyez patiente si bébé n'est pas encore là - c'est normal jusqu'à 42 semaines.",
    trimester: 3,
    weeklyTip: "Soyez patiente si bébé n'est pas encore là : moins de 5% des bébés naissent à leur terme exact. Bébé choisit son moment !",
    weeklySymptoms: ["Contractions régulières", "Pression pelvienne maximale", "Anxiété et excitation"],
    weeklyMilestone: "Terme officiel ! Bébé arrive bientôt 🎉",
  },
  {
    week: 41,
    sizeMm: 515,
    weightG: 3600,
    fruit: "Pastèque",
    fruitEmoji: "🍉",
    babyDevelopment: "Le bébé continue de prendre du poids. Le placenta commence à vieillir. Le liquide amniotique peut diminuer légèrement.",
    momTips: "Votre médecin surveillera de près votre bébé. Un déclenchement peut être envisagé. Restez calme.",
    trimester: 3,
    weeklyTip: "Des rendez-vous de surveillance rapprochée sont prévus. Restez sereine – votre équipe médicale veille sur vous et bébé.",
    weeklySymptoms: ["Surveillance médicale renforcée", "Anxiété de l'attente", "Contractions sporadiques"],
  },
  {
    week: 42,
    sizeMm: 520,
    weightG: 3700,
    fruit: "Pastèque géante",
    fruitEmoji: "🍉",
    babyDevelopment: "Le bébé est post-terme. Un déclenchement du travail sera probablement recommandé. Bébé est prêt !",
    momTips: "Vous êtes suivie de très près par l'équipe médicale. La naissance est imminente. Vous avez fait un travail incroyable !",
    trimester: 3,
    weeklyTip: "Un déclenchement sera très probablement proposé. C'est une décision médicale sage pour le bien de bébé et de vous. Faites confiance à votre équipe.",
    weeklySymptoms: ["Déclenchement probable", "Fatigue de fin de grossesse", "Impatience"],
    weeklyMilestone: "La naissance est toute proche – vous avez été formidable ! 💪",
  },
];

export function getWeekData(week: number): WeekData {
  const data = pregnancyData.find((d) => d.week === week);
  return data ?? pregnancyData[39]; // default to week 40
}

export function getCurrentWeek(dueDate: Date): number {
  const now = new Date();
  const diffMs = dueDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const weeksRemaining = Math.ceil(diffDays / 7);
  const currentWeek = 40 - weeksRemaining;
  return Math.max(1, Math.min(42, currentWeek));
}

export function getDaysRemaining(dueDate: Date): number {
  const now = new Date();
  const diffMs = dueDate.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

export function getProgressPercent(dueDate: Date): number {
  const week = getCurrentWeek(dueDate);
  return Math.min(100, Math.round((week / 40) * 100));
}

// ---- Date due calculation utilities ----

/** Calculate due date from Last Menstrual Period (DDR) — Naegele's rule: +280 days */
export function calculateDueDateFromDDR(ddr: Date): Date {
  const result = new Date(ddr);
  result.setDate(result.getDate() + 280);
  return result;
}

/** Calculate due date from conception date: +266 days */
export function calculateDueDateFromConception(conceptionDate: Date): Date {
  const result = new Date(conceptionDate);
  result.setDate(result.getDate() + 266);
  return result;
}

/** Calculate due date from FIV transfer date.
 *  J3 embryo: +263 days  /  J5 blastocyst: +261 days
 */
export function calculateDueDateFIV(transfertDate: Date, stade: "J3" | "J5"): Date {
  const result = new Date(transfertDate);
  const days = stade === "J3" ? 263 : 261;
  result.setDate(result.getDate() + days);
  return result;
}

/** Calculate due date from egg retrieval (ponction) date — fresh FIV: +266 days */
export function calculateDueDateFromPonction(ponctionDate: Date): Date {
  const result = new Date(ponctionDate);
  result.setDate(result.getDate() + 266);
  return result;
}
