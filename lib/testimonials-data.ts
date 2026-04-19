export interface Testimonial {
  text: string;
  author?: string;
  weeks?: number;
}

export const weekTestimonials: Record<number, Testimonial[]> = {
  1: [
    { text: "Je n'ose même pas y croire... je viens d'arrêter la pilule et je rêve déjà du jour où je verrai deux traits.", author: "Camille" },
    { text: "On s'y est mis avec mon mari cette semaine. Acide folique pris, et l'espoir en ligne de mire 🌱", author: "Léa" },
    { text: "Premier cycle d'essai, je me sens à la fois excitée et terrifiée. C'est un vrai tourbillon d'émotions.", author: "Sarah" },
  ],
  2: [
    { text: "Je sens mon corps changer, c'est subtil mais bien réel. Petite pointe en bas du ventre aujourd'hui 🤍", author: "Inès" },
    { text: "Attendre les règles qui ne viendront peut-être pas... chaque minute semble durer une heure 😅", author: "Marion" },
    { text: "Quelques saignements rosés ce matin, mon médecin m'a rassurée : implantation possible !", author: "Fatima" },
  ],
  3: [
    { text: "Mon test est positif !!! Je suis sous le choc, je relis la notice trois fois pour être sûre 🥹", author: "Amélie" },
    { text: "J'ai appelé ma sœur en pleurant, elle m'a dit que j'étais folle. Je crois bien que je le suis un peu ✨", author: "Clara" },
    { text: "Deux ans d'attente en FIV et enfin... ce petit trait rose change tout.", author: "Nadia", weeks: 3 },
  ],
  4: [
    { text: "Je viens de voir le test positif, je n'en reviens pas encore ! 🥹", author: "Juliette" },
    { text: "Mon ventre est tout plat mais je sais que tu es là 💕", author: "Chloé" },
    { text: "Premier test, puis deuxième, puis troisième... je crois que je vais arrêter d'en acheter 😂", author: "Manon" },
  ],
  5: [
    { text: "Les seins qui tirent, la fatigue qui frappe en début d'après-midi... bienvenue, petit être.", author: "Pauline" },
    { text: "J'ai pleuré devant une pub pour des croquettes ce matin. Les hormones sont bien là 😂", author: "Emma" },
    { text: "Première prise de sang : hCG qui double, je respire enfin 🌿", author: "Lucie" },
  ],
  6: [
    { text: "Les nausées ont commencé... gingembre et crackers sont mes meilleurs amis 😅", author: "Sophie" },
    { text: "Fatiguée mais tellement heureuse malgré tout 🌸", author: "Marie" },
    { text: "Premier bébé, j'ai l'impression de dormir 14h par jour et c'est pas assez !", author: "Anaïs" },
  ],
  7: [
    { text: "Écho de datation demain, j'ai pas fermé l'œil de la nuit. J'ai juste envie d'entendre ce petit cœur 💗", author: "Mélanie" },
    { text: "L'odeur du café me retourne l'estomac. Dire que je ne pouvais pas commencer ma journée sans 😭", author: "Élise" },
    { text: "Je suis passée par un parcours PMA, chaque semaine qui passe est une victoire ✨", author: "Karine", weeks: 7 },
  ],
  8: [
    { text: "Premier écho prévu la semaine prochaine, j'ai tellement hâte d'entendre son cœur ❤️", author: "Laura" },
    { text: "Je mange des choses bizarres à 3h du matin, grossesse quand tu nous tiens 😂", author: "Nolwenn" },
    { text: "J'ai craqué au boulot, j'ai tout dit à ma chef. Elle a été adorable, ouf.", author: "Ophélie" },
  ],
  9: [
    { text: "J'ai entendu son cœur ce matin. Je suis rentrée et j'ai pleuré toute l'après-midi, de bonheur cette fois.", author: "Hélène" },
    { text: "Petit ventre qui pointe le bout de son nez, mes pantalons commencent à me serrer 🌼", author: "Caroline" },
    { text: "Nausées matin midi soir, mais j'ai arrêté de m'en plaindre. Tout pour toi, bébé.", author: "Roxane" },
  ],
  10: [
    { text: "Les nausées diminuent un peu, enfin je peux manger autre chose que du riz blanc 🙏", author: "Valentine" },
    { text: "On commence à imaginer la chambre de bébé, alors que le ventre est à peine visible ✨", author: "Margaux" },
    { text: "Prise de sang ce matin, j'attends les résultats de la trisomie. Un peu anxieuse.", author: "Sabine" },
  ],
  11: [
    { text: "Écho du premier trimestre demain ! J'ai préparé un petit mot pour l'annoncer à mes parents 💌", author: "Estelle" },
    { text: "Je lui ai trouvé un surnom et maintenant je lui parle dans la douche, complètement gaga 🫶", author: "Lina" },
    { text: "Les vertiges m'ont obligée à m'asseoir dans le métro ce matin. Dur de cacher la nouvelle...", author: "Delphine" },
  ],
  12: [
    { text: "Nous avons fait l'annonce à notre famille et tout le monde a pleuré de joie ! 🥹", author: "Anaïs" },
    { text: "Le fameux cap du 1er trimestre passé, je respire enfin 🙏", author: "Julie" },
    { text: "Écho de datation : bébé gigotait dans tous les sens, j'ai ri aux larmes.", author: "Adèle" },
  ],
  13: [
    { text: "Deuxième trimestre, on m'a dit que c'était le plus beau. J'ai hâte de le vérifier 🌸", author: "Marine" },
    { text: "L'énergie revient doucement, j'ai même refait du sport cette semaine ! Marche tranquille.", author: "Aurélie" },
    { text: "Ma libido est revenue d'un coup, mon mari ne s'en plaint pas 😅", author: "Jade" },
  ],
  14: [
    { text: "J'ai enfin annoncé au boulot, soulagée. Mes collègues ont été adorables ❤️", author: "Audrey" },
    { text: "Les nausées disparaissent, j'ai retrouvé l'appétit, bonjour les fringales !", author: "Charlotte" },
    { text: "On a notre premier rendez-vous avec la sage-femme libérale. Tellement hâte.", author: "Océane" },
  ],
  15: [
    { text: "On hésite entre savoir le sexe ou garder la surprise jusqu'au bout... casse-tête !", author: "Morgane" },
    { text: "Petit ventre rond visible en maillot à la piscine, je suis tellement fière 🌺", author: "Émilie" },
    { text: "J'ai commencé à tenir un journal pour bébé, chaque semaine une lettre. Ça me fait du bien.", author: "Camille" },
  ],
  16: [
    { text: "Premiers petits papillons dans le ventre cette semaine ! C'est magique 🦋", author: "Mélanie" },
    { text: "On pense savoir le sexe à la prochaine écho, l'impatience est à son comble 💕", author: "Laure" },
    { text: "J'ai lu que bébé m'entend déjà, maintenant je lui chante des chansons le soir.", author: "Noémie" },
  ],
  17: [
    { text: "Petites crampes ligamentaires, rien de grave. Mon corps s'adapte à toute vitesse.", author: "Vanessa" },
    { text: "On a commencé à chercher des prénoms, c'est un sujet brûlant à la maison 😂", author: "Tiphaine" },
    { text: "Première fois que je sens vraiment bouger bébé, on aurait dit un petit poisson qui pirouette.", author: "Sophie" },
  ],
  18: [
    { text: "Écho morphologique la semaine prochaine, j'espère que tout sera parfait 🤞", author: "Anne-Laure" },
    { text: "J'ai dormi 10h hier et je me sens encore fatiguée. Le 2ème trimestre n'est pas de tout repos finalement !", author: "Paulette" },
    { text: "Je relis déjà mon plan de naissance pour la 10ème fois, j'ai besoin de tout contrôler 😅", author: "Hortense" },
  ],
  19: [
    { text: "Demain on sait si c'est une fille ou un garçon ! Mon mari parie sur une fille.", author: "Léna" },
    { text: "Les mouvements sont de plus en plus nets le soir, c'est notre moment à nous deux 💫", author: "Justine" },
    { text: "J'ai pris 4kg pour l'instant, la sage-femme m'a dit que c'était parfait. Ouf !", author: "Agathe" },
  ],
  20: [
    { text: "Échographie morphologique passée ! Bébé va bien, c'est une fille 💕", author: "Alice" },
    { text: "Mid-parcours ! On a commencé à acheter les premières affaires 🌷", author: "Caroline" },
    { text: "Tout est normal à l'écho, je n'ai pas arrêté de pleurer de soulagement.", author: "Myriam" },
  ],
  21: [
    { text: "Elle bouge tellement le soir que je dors mal, mais je ne m'en lasse pas 🌙", author: "Joséphine" },
    { text: "Les brûlures d'estomac ont commencé, bienvenue au club apparemment 😩", author: "Inès" },
    { text: "J'ai senti bébé réagir à la voix de son papa, trop mignon 🥰", author: "Ludivine" },
  ],
  22: [
    { text: "La liste de naissance est ouverte, nos proches sont aux petits soins ❤️", author: "Hélène" },
    { text: "Mon ventre a explosé cette semaine, je ne rentre plus dans la plupart de mes pantalons !", author: "Céline" },
    { text: "On a choisi le prénom ! On le garde secret jusqu'à la naissance, mais quel soulagement.", author: "Romane" },
  ],
  23: [
    { text: "Mon mari a senti bébé bouger pour la première fois cette semaine, moment hors du temps 🫶", author: "Laetitia" },
    { text: "Je me suis inscrite aux cours de prépa à l'accouchement, un peu anxieuse mais motivée.", author: "Victoire" },
    { text: "Je commence à avoir le masque de grossesse, je mets de la crème solaire même à l'intérieur 😂", author: "Nora" },
  ],
  24: [
    { text: "On a fait notre première séance de préparation à la naissance, émouvant 🌸", author: "Sarah" },
    { text: "Bébé donne des coups de pied la nuit, je ne dors plus mais c'est tellement magique 💖", author: "Charlotte" },
    { text: "Test du diabète gestationnel passé, on attend les résultats. Fingers crossed.", author: "Éléonore" },
  ],
  25: [
    { text: "La liste de naissance prend forme, c'est excitant 🛍️", author: "Camille" },
    { text: "Je sens bébé hoqueter, c'est tellement mignon 💕", author: "Amélie" },
    { text: "J'ai craqué pour une petite gigoteuse en coton bio, j'ai les larmes aux yeux en la pliant.", author: "Maëlle" },
  ],
  26: [
    { text: "On a visité la maternité cette semaine, je me projette enfin dans l'accouchement.", author: "Sandra" },
    { text: "Tension un peu élevée, on surveille. Je me repose beaucoup, tout va bien.", author: "Béatrice" },
    { text: "Le 3ème trimestre approche, je commence à sentir le poids du ventre dans le dos 🌷", author: "Oriane" },
  ],
  27: [
    { text: "Dernière semaine du 2ème trimestre, je savoure chaque moment avant la dernière ligne droite 🌿", author: "Élodie" },
    { text: "Les jambes lourdes le soir sont infernales, je dors avec un coussin sous les pieds maintenant.", author: "Flora" },
    { text: "On a commencé à monter les meubles de la chambre, mon mari pleurait en lisant la notice du berceau 😂", author: "Céliane" },
  ],
  28: [
    { text: "Le 3ème trimestre commence, j'ai hâte et peur à la fois 💓", author: "Léa" },
    { text: "Je prépare la valise de maternité, c'est concret maintenant 🧸", author: "Sophie" },
    { text: "Première séance d'haptonomie avec papa, une vraie bulle d'émotion à trois.", author: "Salomé" },
  ],
  29: [
    { text: "Les contractions de Braxton-Hicks ont commencé, c'est perturbant la première fois.", author: "Anaëlle" },
    { text: "J'ai plus de place dans mon ventre pour respirer ! Les reflux sont mes nouveaux amis 😩", author: "Laurence" },
    { text: "On a fait la séance photo grossesse ce weekend, j'ai hâte de voir le résultat 🌸", author: "Maud" },
  ],
  30: [
    { text: "Plus que 10 semaines... ou 12... ou 14, on verra bien 😅", author: "Pauline" },
    { text: "Je n'arrive plus à dormir sur le dos, le côté gauche devient inconfortable aussi. Le coussin d'allaitement me sauve.", author: "Aurore" },
    { text: "J'ai préparé un playlist pour le jour J, ça m'aide à visualiser 🎵", author: "Violette" },
  ],
  31: [
    { text: "Écho du 3ème trimestre rassurante, bébé est en bonne position. Soulagement total 🙏", author: "Inès" },
    { text: "Les cours de préparation m'aident à dédramatiser l'accouchement, je me sens plus sereine.", author: "Marjorie" },
    { text: "Je ne peux plus fermer mon manteau, il va falloir investir dans une parka XXL 😂", author: "Hortense" },
  ],
  32: [
    { text: "La valise de maternité est prête, je relis ma liste 10 fois par jour 😅", author: "Claire" },
    { text: "J'ai hâte de le rencontrer ! Plus que quelques semaines 💕", author: "Julie" },
    { text: "J'ai rencontré ma sage-femme du suivi post-partum, ça m'a rassurée pour la suite.", author: "Luna" },
  ],
  33: [
    { text: "Les oedèmes aux chevilles sont arrivés, magnésium et jambes en l'air 🦶", author: "Typhaine" },
    { text: "Je croise les doigts pour que bébé se retourne à temps, il est encore en siège.", author: "Alexia" },
    { text: "On a visité la pédiatre ce matin pour prendre contact, super feeling.", author: "Raphaëlle" },
  ],
  34: [
    { text: "Écho du 3ème trimestre : tout est parfait, bébé a la tête en bas. Ouf !", author: "Stéphanie" },
    { text: "J'ai installé la nacelle dans la voiture aujourd'hui, le papa était trop ému 🥹", author: "Louise" },
    { text: "Les nuits sont courtes, les réveils fréquents. C'est un entraînement à ce qui m'attend 😂", author: "Fanny" },
  ],
  35: [
    { text: "Le congé maternité commence enfin, je ne réalise pas encore que je vais devenir maman !", author: "Vanessa" },
    { text: "On a fait un dernier resto en amoureux, on savoure chaque tête-à-tête 🥂", author: "Marion" },
    { text: "J'ai un rendez-vous avec l'anesthésiste demain pour la péridurale, un peu stressée.", author: "Axelle" },
  ],
  36: [
    { text: "On va bientôt le rencontrer, je n'y crois pas encore ! 👶", author: "Laura" },
    { text: "Les contractions de Braxton-Hicks se multiplient, le corps se prépare 🌿", author: "Manon" },
    { text: "Le plan de naissance est signé avec la sage-femme, je me sens prête.", author: "Lila" },
  ],
  37: [
    { text: "Bébé est officiellement à terme ! Je peux accoucher à tout moment, c'est vertigineux.", author: "Alicia" },
    { text: "Je marche 1h par jour pour aider bébé à descendre. Aux grands maux les grands remèdes 😅", author: "Gwladys" },
    { text: "J'ai tout lavé, tout plié, tout rangé. Le nesting à son comble 🧺", author: "Éloïse" },
  ],
  38: [
    { text: "J'attends le grand jour avec impatience et anxiété 💗", author: "Émilie" },
    { text: "Plus que quelques jours avant la date prévue 🌟", author: "Claire" },
    { text: "La poche des eaux a commencé à fuir cette nuit, on part à la maternité ! À bientôt 💫", author: "Pauline" },
  ],
  39: [
    { text: "Cette attente est interminable, chaque contraction j'espère que c'est la bonne !", author: "Léa" },
    { text: "J'ai perdu le bouchon muqueux ce matin, ça se prépare doucement 🌸", author: "Anne-So" },
    { text: "Rendez-vous de monitoring à la maternité toutes les 48h maintenant, bébé va bien.", author: "Sybille" },
  ],
  40: [
    { text: "40 semaines ! Bébé, tu peux arriver quand tu veux 🎉", author: "Sophie" },
    { text: "La date prévue, c'est aujourd'hui ! On attend bébé 👶", author: "Marie" },
    { text: "On a fait un tour en voiture sur les routes les plus cabossées de la région... on verra bien 😂", author: "Coralie" },
  ],
  41: [
    { text: "Toujours là, toujours enceinte. La patience est la clé 🫠", author: "Lucile" },
    { text: "Déclenchement programmé dans 2 jours si rien ne se passe, on y est presque.", author: "Ariane" },
    { text: "Un tour à la maternité pour monitoring, tout va bien. On rentre et on attend encore.", author: "Inès" },
  ],
  42: [
    { text: "Il est enfin là !!! Mon petit miracle, je n'ai plus de mots 🤍", author: "Julia" },
    { text: "Longue journée, mais quel bonheur de le tenir enfin dans mes bras. Mission accomplie.", author: "Agnès" },
    { text: "On est rentrés à la maison à trois, la vraie aventure commence 🏡", author: "Florine" },
  ],
};

export function getTestimonialsForWeek(week: number): Testimonial[] {
  const bounded = Math.min(42, Math.max(1, week));
  return weekTestimonials[bounded] ?? [];
}

export function getTestimonialTextsForWeek(week: number): string[] {
  return getTestimonialsForWeek(week).map((t) => t.text);
}
