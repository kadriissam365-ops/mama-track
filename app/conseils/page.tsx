"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import { getCurrentWeek, getWeekData } from "@/lib/pregnancy-data";
import { ChevronDown, ChevronUp } from "lucide-react";

type Tab = "week" | "nutrition" | "sport" | "faq";

const TABS: { id: Tab; label: string }[] = [
  { id: "week", label: "✨ Cette semaine" },
  { id: "nutrition", label: "🥗 Alimentation" },
  { id: "sport", label: "🏃‍♀️ Sport" },
  { id: "faq", label: "❓ FAQ" },
];

// ---- FAQ DATA ----
interface FAQItem {
  q: string;
  a: string;
  warning?: string;
}

interface FAQSection {
  title: string;
  emoji: string;
  items: FAQItem[];
}

const faqData: FAQSection[] = [
  {
    title: "1er Trimestre",
    emoji: "🌱",
    items: [
      {
        q: "Les nausées vont-elles durer toute la grossesse ?",
        a: "Les nausées touchent environ 70% des femmes enceintes et sont très intenses au 1er trimestre à cause de l'hormone hCG. La bonne nouvelle : elles disparaissent généralement entre la 12e et la 16e semaine. En attendant, fractionnez vos repas, grignotez des crackers le matin avant de vous lever et essayez le gingembre en infusion ou en biscuits.",
        warning: "Consultez votre médecin si les vomissements sont très fréquents et vous empêchent de vous alimenter (hyperémèse gravidique).",
      },
      {
        q: "Puis-je prendre du paracétamol si j'ai mal ?",
        a: "Oui, le paracétamol est le seul antidouleur autorisé pendant la grossesse, à dose standard (max 3g/j). Il faut l'éviter à forte dose et le moins possible, mais une prise ponctuelle est sans danger. En revanche, l'ibuprofène, l'aspirine et tous les anti-inflammatoires sont contre-indiqués.",
        warning: "Consultez votre médecin avant tout traitement, même naturel.",
      },
      {
        q: "Combien de café puis-je boire par jour ?",
        a: "Les recommandations officielles conseillent de limiter la caféine à 200 mg/jour maximum (soit environ 2 cafés express). Cela inclut aussi le thé, le chocolat et les sodas. La caféine traverse le placenta et peut impacter le développement de bébé en excès.",
      },
      {
        q: "Dois-je avertir mon employeur de ma grossesse ?",
        a: "Non, vous n'avez aucune obligation légale de déclarer votre grossesse avant votre 3ème mois (sauf pour certains postes à risque). Vous devez cependant déclarer votre grossesse à votre caisse d'assurance maladie avant la fin de la 14ème semaine pour bénéficier de vos droits (congé maternité, examens remboursés à 100%).",
      },
      {
        q: "J'ai de légers saignements, est-ce dangereux ?",
        a: "De légers saignements (spotting) sont fréquents au 1er trimestre, notamment lors de l'implantation ou en début de grossesse. Ils n'indiquent pas forcément une fausse couche. Cependant, tout saignement mérite d'être signalé à votre médecin.",
        warning: "Consultez en urgence si les saignements sont abondants, accompagnés de douleurs intenses ou de fièvre.",
      },
      {
        q: "Puis-je prendre l'avion au 1er trimestre ?",
        a: "L'avion est généralement sans risque au 1er et 2ème trimestre. La pression de cabine est normale. Hydratez-vous bien, levez-vous régulièrement pour éviter les phlébites et portez des bas de contention. En revanche, vérifiez les règles de votre compagnie aérienne car certaines refusent les femmes après 36 semaines.",
        warning: "Consultez votre médecin avant tout long voyage, surtout si vous avez des complications.",
      },
      {
        q: "Puis-je continuer le sport au 1er trimestre ?",
        a: "Oui, sauf si vous avez des contre-indications médicales ! La pratique d'une activité physique modérée est même bénéfique. Adaptez l'intensité : arrêtez si vous êtes trop essoufflée pour parler. Évitez les sports de contact, la plongée sous-marine et les activités à risque de chute.",
      },
    ],
  },
  {
    title: "2ème Trimestre",
    emoji: "🌸",
    items: [
      {
        q: "Quand vais-je sentir les premiers mouvements de bébé ?",
        a: "Les premiers mouvements foetaux (appelés 'quickening' ou 'papillonnements') se sentent généralement entre la 16e et la 22e semaine pour un premier bébé. Pour les grossesses suivantes, vous les ressentirez plus tôt (dès 14-16 SA). C'est une sensation merveilleuse, comme des bulles ou de légères pulsations.",
        warning: "Consultez si vous n'avez senti aucun mouvement après 22 semaines.",
      },
      {
        q: "Quelle prise de poids est normale ?",
        a: "La prise de poids recommandée dépend de votre IMC de départ. En moyenne : +1-1,5 kg au 1er trimestre, puis +500g par semaine au 2ème et 3ème trimestre, pour un total de 11-16 kg. Ce poids comprend bébé, placenta, liquide amniotique, augmentation du volume sanguin et réserves pour l'allaitement.",
        warning: "Une prise de poids très rapide ou insuffisante mérite d'en parler avec votre médecin.",
      },
      {
        q: "Dans quelle position dois-je dormir ?",
        a: "Dormir sur le côté gauche est la position idéale au 2ème et 3ème trimestre. Elle optimise le flux sanguin vers bébé et vers vos reins. Utilisez un coussin de grossesse (coussin en C ou corps entier) pour soutenir votre ventre et réduire les douleurs de dos. Ne vous inquiétez pas si vous vous réveillez sur le dos – changez simplement de position.",
      },
      {
        q: "La vie sexuelle est-elle possible pendant la grossesse ?",
        a: "Oui, tout à fait ! La grossesse non compliquée n'est pas une contre-indication à la sexualité. Votre bébé est bien protégé par le liquide amniotique et le col de l'utérus. Certaines femmes trouvent que leur libido augmente au 2ème trimestre. Adaptez les positions selon votre confort (sur le côté, femme au-dessus).",
        warning: "Votre médecin peut vous conseiller l'abstinence en cas de placenta bas, de menace d'accouchement prématuré ou de saignements.",
      },
      {
        q: "Comment prévenir et traiter les vergetures ?",
        a: "Les vergetures sont en partie génétiques, mais une bonne hydratation de la peau peut les limiter. Massez votre ventre, hanches et seins quotidiennement avec de l'huile de rose musquée, de l'huile d'argan ou une crème riche en vitamine E, dès le 1er trimestre. Restez bien hydratée et évitez les prises de poids trop rapides.",
      },
      {
        q: "Dois-je me faire dépister pour la toxoplasmose ?",
        a: "Si vous n'êtes pas immunisée contre la toxoplasmose (vérifiable dès le 1er bilan sanguin), vous devez être surveillée chaque mois jusqu'à l'accouchement. Pendant ce temps : évitez les charcuteries crues, les viandes rosées, lavez-vous les mains après jardinage, faites laver la litière du chat par quelqu'un d'autre.",
      },
    ],
  },
  {
    title: "3ème Trimestre",
    emoji: "🌟",
    items: [
      {
        q: "Comment distinguer le vrai travail des contractions de Braxton-Hicks ?",
        a: "Les contractions de Braxton-Hicks (fausses contractions) sont irrégulières, ne s'intensifient pas, disparaissent en changeant de position ou en marchant, et ne sont pas très douloureuses. Le vrai travail se caractérise par des contractions régulières (toutes les 5-7 min), qui s'intensifient progressivement, durent 45-60 secondes et ne cèdent pas au repos.",
        warning: "Appelez la maternité si les contractions sont régulières toutes les 5 min depuis 1 heure.",
      },
      {
        q: "Qu'est-ce que la péridurale et comment ça se passe ?",
        a: "La péridurale est une analgésie loco-régionale qui bloque la douleur des contractions. Un anesthésiste place un fin cathéter dans l'espace péridural de votre dos. Elle prend effet en 10-20 min et peut être dosée. Elle n'empêche pas de pousser correctement. C'est votre choix personnel – informez-vous et décidez librement.",
      },
      {
        q: "Qu'est-ce que le bouchon muqueux et que faire s'il part ?",
        a: "Le bouchon muqueux est une substance gélatineuse qui scelle le col de l'utérus pendant la grossesse. Sa perte (teinté de rose ou de sang) indique que le col commence à se modifier. Ce n'est pas toujours immédiatement suivi du travail – il peut se passer plusieurs jours. C'est un signe que l'accouchement approche.",
        warning: "Consultez si la perte est très abondante ou très sanglante.",
      },
      {
        q: "Quand partir à la maternité ?",
        a: "En règle générale, partez quand les contractions sont régulières toutes les 5 min, durent 1 min chacune, depuis 1 heure (règle du 5-1-1). Partez immédiatement si votre poche des eaux se rompt (même sans contractions), si vous saignez abondamment, si vous ne sentez plus bouger bébé ou si vous avez un fort mal de tête.",
      },
      {
        q: "Qu'est-ce que le peau-à-peau et pourquoi est-ce important ?",
        a: "Le peau-à-peau consiste à placer bébé nu sur votre poitrine dès la naissance. Il régule la température, la glycémie et le rythme cardiaque de bébé, favorise la production de lait, réduit le stress du nourrisson et renforce le lien d'attachement. Mentionnez votre souhait dans votre plan de naissance.",
      },
      {
        q: "Quels sont les signes d'un accouchement prématuré ?",
        a: "Un accouchement est prématuré avant 37 semaines. Les signes d'alerte : contractions régulières avant terme, sensation de pression pelvienne intense, pertes vaginales inhabituelles (liquide, sang), douleurs dans le dos qui ne cèdent pas.",
        warning: "Appelez immédiatement la maternité si vous présentez ces symptômes avant 37 SA. Ne conduisez pas vous-même.",
      },
      {
        q: "Comment se préparer à l'allaitement ?",
        a: "L'allaitement est naturel mais peut nécessiter de l'apprentissage. Pendant la grossesse : assistez à une réunion de préparation, regardez des vidéos sur la mise au sein, parlez à des mères qui allaitent. Votre corps est déjà prêt – pas besoin de préparer vos seins. La clé : une bonne mise au sein dès la 1ère heure.",
      },
      {
        q: "Les examens de fin de grossesse, lesquels sont obligatoires ?",
        a: "La 3ème échographie (entre 30-35 SA) vérifie la position de bébé, la croissance et le placenta. Le test de dépistage du streptocoque B (entre 34-38 SA) est aussi important. Des consultations mensuelles de suivi avec sage-femme ou gynécologue sont essentielles. À partir de 41 SA, les consultations deviennent bihebdomadaires.",
      },
      {
        q: "Comment gérer la douleur pendant l'accouchement sans péridurale ?",
        a: "Il existe de nombreuses alternatives : bain chaud ou douche, ballon de naissance pour bouger le bassin, massage du bas du dos par votre partenaire, TENS (neurostimulation électrique), acupuncture, sophrologie, hypnobirthing. Le mouvement est votre alliée – bouger aide bébé à descendre et soulage la douleur.",
      },
    ],
  },
];

// ---- ACCORDION COMPONENT ----
function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div key={idx} className="bg-white dark:bg-gray-900 rounded-2xl border border-pink-100 dark:border-pink-900/30 overflow-hidden">
          <button
            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            className="w-full flex items-center justify-between px-4 py-3 text-left"
          >
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 pr-2">{item.q}</span>
            {openIndex === idx ? (
              <ChevronUp className="w-4 h-4 text-pink-400 flex-shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
            )}
          </button>
          <AnimatePresence>
            {openIndex === idx && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{item.a}</p>
                  {item.warning && (
                    <div className="mt-3 flex items-start gap-2 bg-amber-50 dark:bg-amber-950/30 rounded-xl px-3 py-2">
                      <span className="text-base">⚠️</span>
                      <p className="text-xs text-amber-700">{item.warning}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

// ---- NUTRITION TAB CONTENT ----
function NutritionGuide() {
  const [activeTrimestre, setActiveTrimestre] = useState<1 | 2 | 3>(1);

  const content = {
    1: {
      title: "1er Trimestre (S1 - S12)",
      color: "from-green-400 to-emerald-500",
      bgColor: "bg-green-50 dark:bg-green-950/30",
      borderColor: "border-green-200 dark:border-green-800/30",
      intro: "Le 1er trimestre est crucial pour la formation des organes. L'acide folique est la star absolue !",
      tips: [
        { emoji: "🫚", title: "Nausées : votre stratégie", text: "Fractionnez en 5-6 petits repas. Mangez des crackers avant de vous lever. Le gingembre (tisane, biscuits) est votre meilleur allié." },
        { emoji: "🌿", title: "Acide folique", text: "400-800 µg/jour en supplément. Sources naturelles : épinards, brocolis, lentilles, haricots. Continue jusqu'à 12 SA minimum." },
        { emoji: "💧", title: "Hydratation", text: "1,5 à 2 litres d'eau par jour. Optez pour des eaux riches en minéraux. Évitez les sodas et jus de fruits sucrés." },
      ],
      good: [
        "🥦 Légumes verts (brocolis, épinards, haricots verts)",
        "🍊 Agrumes (vitamine C & folates)",
        "🫘 Légumineuses (lentilles, pois chiches)",
        "🥚 Œufs bien cuits",
        "🥣 Céréales enrichies en acide folique",
        "🫐 Fruits rouges (antioxydants)",
        "🥜 Amandes (magnésium)",
        "🧀 Fromages à pâte dure (emmental, comté)",
      ],
      bad: [
        "🍷 Alcool (aucune dose n'est sûre)",
        "🥩 Viande et poisson crus (listeria, toxoplasma)",
        "🧀 Fromages à pâte molle non pasteurisés (camembert, brie, roquefort)",
        "🥓 Charcuterie crue (jambon cru, saucisson)",
        "☕ Caféine > 200 mg/jour (2 expressos max)",
        "🐟 Grands poissons (thon, espadon) → mercure",
        "🥗 Graines germées crues",
        "🐚 Coquillages crus",
      ],
    },
    2: {
      title: "2ème Trimestre (S13 - S27)",
      color: "from-pink-400 to-rose-500",
      bgColor: "bg-pink-50 dark:bg-pink-950/30",
      borderColor: "border-pink-200 dark:border-pink-800/30",
      intro: "Les nausées s'atténuent, l'appétit revient. Concentrez-vous sur le fer, le calcium et les bonnes protéines.",
      tips: [
        { emoji: "🥩", title: "Fer : priorité absolue", text: "Vos besoins en fer doublent ! Mangez de la viande rouge 2x/sem, des légumineuses, des céréales complètes. Associez-les à la vitamine C pour mieux absorber le fer végétal." },
        { emoji: "🥛", title: "Calcium pour les os", text: "3-4 portions/jour : lait, yaourts, fromages. Si intolérance : tofu, amandes, eau calcique (Hépar, Contrex). Bébé a besoin de 300 mg/jour de calcium supplémentaire." },
        { emoji: "🌾", title: "+300 kcal/jour", text: "À partir du 2ème trimestre, ajoutez environ 300 kcal/jour. Optez pour des calories de qualité : avocat, noix, féculents complets, légumineuses." },
        { emoji: "🥕", title: "Contre la constipation", text: "Augmentez les fibres (légumes, fruits, céréales complètes), buvez plus, bougez quotidiennement. Pruneaux et figues sont vos alliés naturels." },
      ],
      good: [
        "🥩 Viande rouge 2x/semaine (fer héminique)",
        "🫘 Lentilles, pois chiches, haricots (fer végétal)",
        "🥛 Laitages 3-4/jour (calcium)",
        "🥦 Brocolis, chou (calcium végétal)",
        "🥑 Avocat (acides gras sains)",
        "🌾 Céréales complètes (fibres, magnésium)",
        "🍠 Patate douce (bêta-carotène)",
        "🐟 Petits poissons gras (sardines, maquereau)",
      ],
      bad: [
        "🍷 Alcool (toujours interdit)",
        "🧀 Fromages non pasteurisés",
        "🥩 Viande et poisson crus",
        "🍕 Fast-food trop régulièrement (sel, graisses saturées)",
        "🧃 Jus de fruits industriels (sucres cachés)",
        "🥓 Charcuterie crue",
        "🐟 Grands poissons à mercure élevé",
        "🧂 Excès de sel (favorise les œdèmes)",
      ],
    },
    3: {
      title: "3ème Trimestre (S28 - S42)",
      color: "from-purple-400 to-violet-500",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
      borderColor: "border-purple-200 dark:border-purple-800/30",
      intro: "Bébé grandit très vite ! Les oméga-3, la vitamine K et les petits repas fréquents sont vos alliés.",
      tips: [
        { emoji: "🐟", title: "Oméga-3 pour le cerveau", text: "Essentiels au développement cérébral de bébé en fin de grossesse. Consommez du saumon, des sardines, du maquereau 2-3x/semaine. Ou complétez avec de l'huile de lin ou des noix." },
        { emoji: "🥦", title: "Vitamine K pour la coagulation", text: "Importante pour la coagulation sanguine à l'accouchement. Sources : brocolis, choux de Bruxelles, épinards, laitue. Aussi présente dans l'huile d'olive et de colza." },
        { emoji: "🍽️", title: "Petits repas fréquents", text: "L'utérus comprime l'estomac. Mangez 5-6 petites portions plutôt que 3 gros repas. Attendez 30 min avant de vous allonger pour éviter les reflux." },
        { emoji: "🫐", title: "Antioxydants et immunité", text: "Fruits et légumes colorés riches en vitamines C et E pour renforcer votre immunité avant l'accouchement. Myrtilles, poivrons, kiwis, oranges." },
      ],
      good: [
        "🐟 Saumon, sardines, maquereau (oméga-3)",
        "🥦 Brocolis, choux (vitamine K)",
        "🫐 Fruits rouges (antioxydants)",
        "🥚 Œufs (protéines complètes, vitamine D)",
        "🥜 Noix et graines (oméga-3 végétaux)",
        "🍠 Patate douce (potassium)",
        "🥛 Laitages (calcium pour les os de bébé)",
        "🌾 Avoine, quinoa (fibres, protéines)",
      ],
      bad: [
        "🍷 Alcool (toujours interdit)",
        "🧀 Fromages non pasteurisés",
        "🥩 Viande et poisson crus",
        "🌶️ Plats très épicés (aggrave les reflux)",
        "🍫 Chocolat après 17h (caféine, insomnie)",
        "🧂 Excès de sel (œdèmes)",
        "🍕 Repas copieux le soir (reflux nocturnes)",
        "🥤 Boissons gazeuses (ballonnements)",
      ],
    },
  };

  const c = content[activeTrimestre];

  return (
    <div className="space-y-4">
      {/* Trimester selector */}
      <div className="flex gap-2">
        {([1, 2, 3] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTrimestre(t)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTrimestre === t
                ? `bg-gradient-to-r ${content[t].color} text-white shadow-md`
                : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:bg-gray-700"
            }`}
          >
            T{t}
          </button>
        ))}
      </div>

      {/* Content */}
      <motion.div
        key={activeTrimestre}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        <div className={`${c.bgColor} rounded-2xl p-4`}>
          <h3 className="font-bold text-gray-800 dark:text-gray-200 text-base mb-1">{c.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">{c.intro}</p>
        </div>

        {/* Tips */}
        <div className="space-y-3">
          {c.tips.map((tip, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{tip.emoji}</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{tip.title}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{tip.text}</p>
            </div>
          ))}
        </div>

        {/* Good & Bad */}
        <div className="grid grid-cols-1 gap-3">
          <div className={`bg-green-50 dark:bg-green-950/30 rounded-2xl p-4 border ${c.borderColor}`}>
            <h4 className="font-bold text-green-700 dark:text-green-300 text-sm mb-3">✅ À privilégier ce trimestre</h4>
            <ul className="space-y-1">
              {c.good.map((item, i) => (
                <li key={i} className="text-sm text-gray-700 dark:text-gray-300">{item}</li>
              ))}
            </ul>
          </div>
          <div className="bg-red-50 dark:bg-red-950/30 rounded-2xl p-4 border border-red-100 dark:border-red-900/30">
            <h4 className="font-bold text-red-600 dark:text-red-400 text-sm mb-3">❌ À éviter</h4>
            <ul className="space-y-1">
              {c.bad.map((item, i) => (
                <li key={i} className="text-sm text-gray-700 dark:text-gray-300">{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ---- SPORT TAB CONTENT ----
function SportGuide() {
  const [activeTrimestre, setActiveTrimestre] = useState<1 | 2 | 3>(1);

  const trimestreInfo = {
    1: {
      title: "1er trimestre",
      text: "Écoutez votre corps ! La fatigue et les nausées peuvent limiter vos séances. Privilégiez l'intensité légère à modérée. Si vous vous sentiez essoufflée, ralentissez.",
      icon: "🌱",
    },
    2: {
      title: "2ème trimestre",
      text: "C'est souvent le trimestre le plus confortable pour le sport. Vous pouvez maintenir une activité régulière. Évitez la position allongée sur le dos après 16 semaines.",
      icon: "🌸",
    },
    3: {
      title: "3ème trimestre",
      text: "Diminuez l'intensité, privilégiez les activités douces. La marche et la natation restent idéales jusqu'à terme. Les exercices de Kegel sont vos meilleurs alliés.",
      icon: "🌟",
    },
  };

  return (
    <div className="space-y-4">
      {/* Golden rule */}
      <div className="bg-gradient-to-r from-pink-400 to-rose-500 rounded-2xl p-4 text-white">
        <p className="text-lg font-bold mb-1">💬 La règle d'or</p>
        <p className="text-base font-medium italic">"Si tu peux parler, le rythme est bon."</p>
        <p className="text-sm mt-1 text-pink-100">Gardez une intensité où vous pouvez tenir une conversation.</p>
      </div>

      {/* Trimester selector */}
      <div className="flex gap-2">
        {([1, 2, 3] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTrimestre(t)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTrimestre === t
                ? "bg-gradient-to-r from-pink-400 to-rose-500 text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:bg-gray-700"
            }`}
          >
            T{t}
          </button>
        ))}
      </div>

      {/* Trimester info */}
      <motion.div
        key={activeTrimestre}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-pink-50 dark:bg-pink-950/30 rounded-2xl p-4"
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">{trimestreInfo[activeTrimestre].icon}</span>
          <span className="font-bold text-gray-800 dark:text-gray-200">{trimestreInfo[activeTrimestre].title}</span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300">{trimestreInfo[activeTrimestre].text}</p>
      </motion.div>

      {/* Recommended */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-green-200 dark:border-green-800/30 p-4">
        <h3 className="font-bold text-green-700 dark:text-green-300 text-sm mb-3">✅ Sports recommandés</h3>
        <div className="space-y-3">
          {[
            { emoji: "🚶‍♀️", title: "Marche douce", text: "30 min/jour, idéal toute la grossesse. Améliore la circulation, prépare le périnée, réduit les œdèmes." },
            { emoji: "🏊‍♀️", title: "Natation", text: "Soulage les douleurs dorsales, zéro impact sur les articulations. Idéale dès le 2ème trimestre." },
            { emoji: "🧘‍♀️", title: "Yoga prénatal", text: "Améliore la souplesse, gère le stress, prépare aux positions d'accouchement. Cherchez un cours spécialisé." },
            { emoji: "🚴‍♀️", title: "Vélo stationnaire", text: "Sans risque de chute, idéal au 1er et 2ème trimestre. Restez sur le plat au 3ème." },
            { emoji: "💃", title: "Danse douce", text: "Pilates prénatal, aquagym, stretching léger sont également excellents." },
          ].map((item, i) => (
            <div key={i} className="flex gap-3">
              <span className="text-2xl flex-shrink-0">{item.emoji}</span>
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{item.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Avoid */}
      <div className="bg-red-50 dark:bg-red-950/30 rounded-2xl border border-red-100 dark:border-red-900/30 p-4">
        <h3 className="font-bold text-red-600 dark:text-red-400 text-sm mb-3">❌ Sports à éviter</h3>
        <div className="space-y-2">
          {[
            "🥊 Sports de contact (boxe, judo, football)",
            "🤿 Plongée sous-marine (risque de bulles d'azote)",
            "⛷️ Sports à risque de chute (ski, équitation, vélo de montagne)",
            "🏋️ Musculation lourde (poids importants, effort intense)",
            "🏃 Course à pied à haute intensité (au 3ème trimestre)",
            "🧗 Escalade et activités en altitude",
          ].map((item, i) => (
            <p key={i} className="text-sm text-gray-700 dark:text-gray-300">{item}</p>
          ))}
        </div>
      </div>

      {/* Kegel */}
      <div className="bg-purple-50 dark:bg-purple-950/30 rounded-2xl border border-purple-200 dark:border-purple-800/30 p-4">
        <h3 className="font-bold text-purple-700 dark:text-purple-300 text-sm mb-2">💪 Exercices de Kegel – Périnée</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          Les exercices de Kegel renforcent le périnée pour prévenir les fuites urinaires et faciliter la récupération post-partum.
        </p>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-3 mb-3">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">Comment faire ?</p>
          <ol className="text-sm text-gray-600 dark:text-gray-300 space-y-1 list-decimal list-inside">
            <li>Contractez les muscles du périnée (comme si vous vouliez arrêter d'uriner)</li>
            <li>Maintenez la contraction 5-8 secondes</li>
            <li>Relâchez complètement 10 secondes</li>
            <li>Répétez 10 fois → 1 série</li>
          </ol>
        </div>
        <div className="bg-purple-100 dark:bg-purple-900/30 rounded-xl px-3 py-2 flex items-center gap-2">
          <span className="text-lg">🎯</span>
          <p className="text-sm font-medium text-purple-800 dark:text-purple-300">Objectif : 3 séries de 10 contractions par jour</p>
        </div>
      </div>
    </div>
  );
}

// ---- MAIN PAGE ----
export default function ConseilsPage() {
  const store = useStore();
  const [activeTab, setActiveTab] = useState<Tab>("week");

  const dueDate = store.dueDate ? new Date(store.dueDate) : null;
  const week = dueDate ? getCurrentWeek(dueDate) : 20;
  const weekData = getWeekData(week);

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-28">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5"
      >
        <p className="text-xs font-medium text-pink-400 uppercase tracking-wider mb-1">Semaine {week}</p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Conseils & Bien-être</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1">Tout ce dont vous avez besoin pour cette semaine</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-pink-50 dark:bg-pink-950/30 rounded-2xl p-1 mb-5 overflow-x-auto scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 flex-1 py-1.5 text-xs font-medium rounded-xl transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-white dark:bg-gray-900 text-pink-600 shadow-sm"
                : "text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:text-pink-400"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ---- CETTE SEMAINE ---- */}
        {activeTab === "week" && (
          <motion.div
            key="week"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Week milestone */}
            {weekData.weeklyMilestone && (
              <div className="bg-gradient-to-r from-pink-400 to-rose-500 rounded-2xl p-4 text-white">
                <p className="text-lg font-bold">🎉 {weekData.weeklyMilestone}</p>
              </div>
            )}

            {/* Baby development */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-pink-100 dark:border-pink-900/30 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-2xl flex items-center justify-center text-2xl">
                  {weekData.fruitEmoji}
                </div>
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">Bébé cette semaine</p>
                  <p className="font-bold text-gray-800 dark:text-gray-200">Taille d'un(e) {weekData.fruit}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{weekData.babyDevelopment}</p>
            </div>

            {/* Weekly tip */}
            <div className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-100 dark:border-amber-900/30 p-4">
              <p className="text-sm font-bold text-amber-700 mb-1">💡 Conseil de la semaine</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{weekData.weeklyTip}</p>
            </div>

            {/* Mom tips */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">🌷 Pour vous</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{weekData.momTips}</p>
            </div>

            {/* Symptoms */}
            {weekData.weeklySymptoms && weekData.weeklySymptoms.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-2xl border border-blue-100 dark:border-blue-900/30 p-4">
                <p className="text-sm font-bold text-blue-700 dark:text-blue-300 mb-3">💙 Symptômes courants cette semaine</p>
                <div className="space-y-2">
                  {weekData.weeklySymptoms.map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-300 rounded-full flex-shrink-0" />
                      <p className="text-sm text-gray-600 dark:text-gray-300">{s}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">Ces symptômes sont normaux. Consultez si ils vous inquiètent.</p>
              </div>
            )}
          </motion.div>
        )}

        {/* ---- ALIMENTATION ---- */}
        {activeTab === "nutrition" && (
          <motion.div
            key="nutrition"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <NutritionGuide />
          </motion.div>
        )}

        {/* ---- SPORT ---- */}
        {activeTab === "sport" && (
          <motion.div
            key="sport"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <SportGuide />
          </motion.div>
        )}

        {/* ---- FAQ ---- */}
        {activeTab === "faq" && (
          <motion.div
            key="faq"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-5"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">Réponses médicalement fiables aux questions les plus fréquentes, par trimestre.</p>
            {faqData.map((section) => (
              <div key={section.title}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{section.emoji}</span>
                  <h3 className="font-bold text-gray-800 dark:text-gray-200">{section.title}</h3>
                </div>
                <FAQAccordion items={section.items} />
              </div>
            ))}
            <div className="bg-pink-50 dark:bg-pink-950/30 rounded-2xl p-4 mt-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 text-center">
                Ces informations sont générales et ne remplacent pas l'avis médical. En cas de doute, contactez toujours votre médecin ou sage-femme. 💗
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
