// =====================================================================
//  FASES · contido (textos, preguntas, pistas) + lóxica de cada capítulo
//  Os textos están arriba de todo para poder cambialos sen tocar a lóxica.
// =====================================================================
import { CONFIG } from "./config.js";
import * as scenes from "./scenes.js";
import { h, btn, wait } from "./ui.js";
import * as V from "./validators.js";
import { createCodeLock } from "./puzzles/lockPuzzle.js";
import { createPhotoPuzzle } from "./puzzles/photoPuzzle.js";
import { createFamilyArchive } from "./puzzles/childrenPuzzle.js";
import { createTokenBoard, placementMatches } from "./puzzles/tokenBoard.js";
import { createFreeThrows } from "./puzzles/basketGame.js";
import { createReform } from "./puzzles/reformPuzzle.js";
import { createQuiz } from "./puzzles/quizShow.js";

// ---------------------------------------------------------------------
//  OBXECTOS
// ---------------------------------------------------------------------
export const ITEMS = {
  torre: { id: "frag-torre", name: "Fragmento da Torre", icon: "fragment", desc: "Un anaco de pedra morna. Aínda garda o eco dunha frase moi oportuna." },
  postal: { id: "postal-ny", name: "Postal de Nova York", icon: "postal", desc: "«O que levabamos, o que nos levou e o que nos deixou sen palabras.»" },
  ny: { id: "frag-ny", name: "Fragmento de Nova York", icon: "fragment", desc: "Brilla coma unha fiestra de rañaceos ás tres da mañá." },
  maldivas: { id: "frag-maldivas", name: "Cuncha das Maldivas", icon: "shell", desc: "Se a achegas ao oído, escóitase o mar. E, moi baixiño, unha lúa." },
  voda: { id: "frag-voda", name: "Chave da voda", icon: "key", desc: "Abriu un candado. E, de paso, outro capítulo." },
  saba: { id: "saba", name: "Saba sospeitosa", icon: "sheet", desc: "Proba principal dun caso que nunca debeu chegar á recepción." },
  hotel: { id: "frag-hotel", name: "Fragmento do hotel", icon: "fragment", desc: "Leva unha nota: «Caso pechado. Culpable: o mesmo que reclamou»." },
  lua: { id: "frag-lua", name: "Fragmento lunar", icon: "moon", desc: "Soa baixiño cando ninguén mira." },
  foto: { id: "foto-restaurada", name: "Fotografía restaurada", icon: "photo", desc: "A imaxe estaba rota. A lembranza, non." },
  familia: { id: "frag-familia", name: "Fragmento familiar", icon: "family", desc: "28 · 05. O día no que comezou a historia que traería dous novos protagonistas." },
  tempo: { id: "frag-tempo", name: "Fragmento do tempo", icon: "clock", desc: "Todos os recordos, por fin, na súa orde." },
  friends: { id: "frag-friends", name: "Chave do apartamento", icon: "key", desc: "Gañada nun concurso de preguntas. Co seu marco amarelo e todo." },
  lentellas: { id: "frag-lentellas", name: "Lentella absolta", icon: "lentil", desc: "Inocente de todos os cargos. Desde aquela noite, na casa trátana con moito respecto." },
  leyma: { id: "frag-leyma", name: "Carné de socio", icon: "ball", desc: "Leyma Coruña. Socios nas boas e nas malas (sobre todo nas malas)." },
  fogar: { id: "frag-fogar", name: "Chave do fogar", icon: "house", desc: "Abre unha casa que xa é un fogar. E, moi pronto, outra en Aldán." }
};

// ---------------------------------------------------------------------
//  CONTIDO EDITABLE
// ---------------------------------------------------------------------
export const CONTENT = {
  torre: {
    intro: [
      "A Coruña. O vento sopra coma sempre.",
      "O faro máis antigo do mundo leva séculos vendo pasar historias... pero esta tarde só lle interesa unha."
    ],
    tower: ["A Torre de Hércules.", "Dous mil anos alumando barcos. Esa tarde decidiu alumar outra cousa."],
    couple: [
      "Dúas persoas. Unha fala e fala. A outra leva un anaco pensando noutra cousa.",
      "E entón Gonzalo dixo unha frase que pasou á historia. Polo menos, á vosa."
    ],
    question: "Que frase dixo Gonzalo para o recordo?",
    feedback: {
      "kiss-only": ["Case.", "Lembras a parte importante, pero falta saber que estaba facendo Gonzalo mentres tanto..."],
      "second-only": ["Vas ben: alguén falaba moito ou algo se estaba a perder...", "Pero falta o máis importante: o motivo da frase."],
      none: ["A Torre non lembra iso.", "Non fai falta que sexa exacta: abonda coa idea."]
    },
    success: ["EXACTO.", "E, segundo as crónicas, a resposta foi bastante clara.", "A Torre gardou o segredo durante anos. Ata hoxe."],
    hints: ["Era unha pregunta. E tiña dúas opcións.", "Unha opción era un bico. A outra tiña que ver con seguir... facendo o que estabades a facer."]
  },

  // Fase 2 · provisional: secuencia de chegada guiada pola postal.
  // Para engadir unha pregunta persoal despois, enche personalQuestion:
  //   personalQuestion: { question: "...", accept: ["resposta", "outra"], hints: ["...", "..."] }
  newYork: {
    intro: [
      "Primeira viaxe xuntos a Nova York.",
      "Luces, ruído, taxis amarelos... e unha maleta que pesaba bastante máis do necesario."
    ],
    spots: {
      suitcase: { label: "Maleta", text: ["A maleta. Está a piques de reventar.", "Entre a roupa aparece unha postal sen selo."] },
      taxi: { label: "Taxi amarelo", text: ["Un taxi amarelo. O condutor leva un bo anaco tocando o claxon.", "Aquí todo o mundo ten présa. Menos vós."] },
      skyline: { label: "Rañaceos", text: ["Rañaceos ata onde chega a vista.", "Hai unha fiestra acesa por cada recordo daquela viaxe."] }
    },
    afterPostal: ["A postal conta a chegada en tres momentos.", "Toca os obxectos da escena na mesma orde na que pasaron."],
    sequence: ["suitcase", "taxi", "skyline"],
    stepOk: ["Iso foi o primeiro.", "Despois veu iso.", "E entón, a cidade deixouvos sen palabras."],
    wrong: ["Non, non. Así non foi a chegada.", "Le outra vez a postal (está no inventario)."],
    success: ["A cidade que nunca dorme.", "Vós, despois daquela viaxe, tampouco durmistes moito."],
    personalQuestion: null,
    hints: ["Tres cousas, tres momentos: o que levabades, o que vos levou e o que vistes.", "Maleta, taxi... e ao final levantar a vista."]
  },

  maldivas: {
    intro: [
      "Lúa de mel nas Maldivas.",
      "A praia, de noite, parece outro planeta. Hai palabras escondidas pola escena."
    ],
    words: {
      bungalow: { label: "Bungalow", word: "VIAXE", text: "Dentro do bungalow, maletas abertas e area por todas partes. Na etiqueta pon:" },
      moon: { label: "Lúa", word: "LÚA", text: "A lúa reflíctese no mar coma se quixese dicir algo. Só di unha palabra:" },
      palm: { label: "Palmeira", word: "LEMBRANZA", text: "Alguén gravou un corazón no tronco. Debaixo, unha palabra:" },
      sea: { label: "Mar", word: "MAREA", text: "O mar murmura unha palabra. Non parece moi importante, pero vale:" }
    },
    bottle: {
      label: "Botella",
      text: ["Unha mensaxe nunha botella. Falta tinta nalgúns sitios:", "«Unha ____ á luz da ____ convértese en ____.»"]
    },
    phrase: [
      { label: "Unha", id: "w1", answer: "VIAXE" },
      { label: "á luz da", id: "w2", answer: "LÚA" },
      { label: "convértese en", id: "w3", answer: "LEMBRANZA" }
    ],
    wrong: ["A frase soa rara. Coma se a escribise un pirata despistado."],
    success: [
      "«Unha viaxe á luz da lúa convértese en lembranza.»",
      "A lúa tomou nota. Algún día pedirá a súa propia canción..."
    ],
    hints: ["Explora toda a praia: hai catro palabras, pero só fan falta tres.", "Primeiro a viaxe, despois a luz... e ao final o que queda."]
  },

  voda: {
    intro: ["Pazo de Mondoi. Un campo verde, cadeiras brancas e un arco de flores.", "Baixo o arco agarda un candado de seis cifras.", "Hai días que non precisan explicación. Só hai que lembrar cando comezou outro capítulo."],
    code: "250714",
    reordered: ["Case. Os números están ben, pero o candado le as datas á galega: día, mes e ano."],
    wrong: ["O candado nin se move.", "Click. Nada. Proba outra vez."],
    success: ["ACCESO CONCEDIDO", "25 de xullo de 2014. Media Galicia estaba de festa. Vós tiñades un motivo extra."],
    hints: ["Ese día media Galicia estaba de festa. Vós tamén.", "Día, mes e ano. Dous díxitos cada un."]
  },

  saba: {
    intro: [
      "Un hotel (probablemente en Tenerife). Unhas vacacións tranquilas.",
      "Ata que Gonzalo descubriu algo terrible na cama..."
    ],
    bed: ["A cama do crime. Hai unha mancha misteriosa na saba."],
    examine: ["Gonzalo baixou á recepción indignadísimo. Reclamación formal. Cara de inspector.", "Obxecto recollido: Saba sospeitosa."],
    window: ["Pola fiestra vese un volcán.", "O Teide observa en silencio. El sabe a verdade."],
    lamp: ["Unha lámpada. Ilumina pouco.", "Aínda así, máis ca a investigación de Gonzalo daquel día."],
    question: "Quen era finalmente responsable da misteriosa mancha?",
    feedback: {
      us: ["Moi xenerosa repartindo culpas...", "pero neste caso só houbo un responsable. E non es ti."],
      tania: ["Tania declárase inocente.", "E, por unha vez, éo de verdade."],
      hotel: ["O hotel recibiu a reclamación con moita paciencia.", "E tiña razón: eles non foron."],
      ghost: ["Os fantasmas de Tenerife negan calquera implicación."],
      none: ["O detective non está convencido.", "Pensa en quen durmía alí..."]
    },
    success: [
      "GONZALO. Caso pechado.",
      "Despois de baixar indignadísimo á recepción e poñer unha reclamación formal, descubriu que o culpable da mancha era... el mesmo.",
      "O hotel merecía unha desculpa. E probablemente unha boa propina.",
      "O narrador prefire non facer máis preguntas."
    ],
    hints: ["O culpable non estaba lonxe. De feito, estaba moi indignado.", "Quen baixou á recepción a queixarse?"]
  },

  lua: {
    intro: ["A lúa das Maldivas volveu.", "E esta vez trae algo que tararear."],
    moon: ["A lúa está enorme.", "Hai cancións que soan mellor baixo ela."],
    question: "Que canción pertence a esta lembranza?",
    feedback: {
      artist: ["O artista, si. Pero que canción?", "A lúa está a mirar para ti con moita intención."],
      moon: ["Vas pola boa lúa.", "Pero como estaba esa lúa?"],
      none: ["Esa non soa.", "Mira ben o ceo."]
    },
    qrText: "Hai lembranzas que precisan a súa propia banda sonora.",
    success: ["Agora esta lembranza xa ten banda sonora."],
    hints: ["É dun cantante asturiano.", "Fíxate na lúa: está enteira, redonda... chea."]
  },

  foto: {
    intro: ["Unha foto caeu do álbum e rompeu en nove anacos.", "Toca unha peza e despois outra para cambialas de sitio."],
    success: ["A imaxe estaba rota.", "A lembranza, non."],
    missing: ["Parece que este recordo se perdeu polo camiño."],
    hints: ["Empeza polas esquinas: son as máis doadas de recoñecer.", "Agora as pezas que xa están no seu sitio teñen un marco dourado."]
  },

  // Fase 8 · O ARQUIVO FAMILIAR
  familia: {
    intro: ["O ARQUIVO FAMILIAR", "Dous expedientes incompletos. Coloca cada ficha no seu oco: toca unha ficha e despois o oco."],
    children: [
      { name: "Martiño", date: ["15", "11", "2016"] },
      { name: "Xoel", date: ["17", "06", "2022"] }
    ],
    tokens: ["15", "17", "2016", "05", "11", "22", "2022", "14", "06", "2014"],
    wrongDates: ["Algunha data non encaixa.", "O arquivo protesta cun ruído de caixón vello."],
    recovered: ["Dúas datas correctas.", "Pero o arquivo non busca as súas datas.", "Busca unha clave máis antiga."],
    // Clave: 28/05, o día no que comezou a relación (día e mes).
    clueHint: "Martiño e Xoel non chegaron de repente. Antes deles houbo outro día: aquel no que comezou a historia que lles daría a vida. O arquivo pide ese día: día e mes.",
    code: "2805",
    codeLabel: "28 · 05",
    swapped: ["Case. O arquivo le as datas á galega: primeiro o día, despois o mes."],
    kidsCode: ["Os días dos nenos son importantes...", "pero o arquivo busca algo anterior. Moito anterior."],
    kidsCodes: ["1517", "1715", "1511", "1706", "1106", "1622"],
    weddingCode: ["A voda foi un gran día...", "pero a historia comezara bastante antes."],
    weddingCodes: ["2507"],
    yearCode: ["Anos, non. O arquivo pide un día e un mes."],
    wrongCode: ["O candado familiar segue pechado."],
    success: [
      "CLAVE FAMILIAR RECUPERADA",
      "28 · 05",
      "Un día de maio comezou unha historia.",
      "Anos despois, esa historia tivo dous novos protagonistas:",
      "15 · 11 · 2016 · Martiño\n17 · 06 · 2022 · Xoel",
      "Martiño e Xoel uníronse á partida."
    ],
    hints: ["Martiño chegou no outono. Xoel, en pleno verán.", "Martiño: novembro de 2016. Xoel: xuño de 2022."],
    codeHints: ["Non é unha data dos nenos. É anterior a eles.", "O día no que comezou a vosa relación. Día e mes, catro cifras."]
  },

  // Fase 9 · Ordena os recordos cronoloxicamente.
  // Comproba que a orde é correcta para vós (a primeira é a máis antiga).
  tempo: {
    intro: [
      "ARQUIVO TEMPORAL",
      "Os fragmentos comezan a vibrar. Hai unha orde escondida neles.",
      "Colócaos do primeiro ao último, tal e como pasaron."
    ],
    order: ["Torre de Hércules", "Nova York", "Voda", "Maldivas", "Martiño e Xoel"],
    wrong: ["O tempo enredouse.", "Algo está fóra do seu sitio."],
    solved: ["Todos os recordos, por fin, na súa orde.", "E todos apuntan cara ao mesmo sitio..."],
    gonzalo: [
      "Chegaches demasiado lonxe para abandonar agora.",
      "Pero hai unha cousa que esta máquina non sabe.",
      "Terás que preguntarma a min."
    ],
    hints: ["Todo comezou nun faro.", "A voda e a lúa de mel van xuntas. A familia chegou despois."]
  },

  // Friends: concurso para fans de verdade. answer ten que coincidir exactamente cunha das options.
  friends: {
    intro: [
      "Hai series que se ven. E hai series que se saben de memoria.",
      "Benvida ao concurso do apartamento: sete preguntas sobre Friends e tres vidas. Só para fans de verdade."
    ],
    questions: [
      { q: "Cal é o segundo nome de Chandler?", options: ["Francis", "Muriel", "Eugene", "Matthew"], answer: "Muriel" },
      { q: "No concurso no que se xogan o apartamento, Rachel non sabe a que se dedica Chandler. Que responde?", options: ["Estatístico", "Contable", "Transponster", "Procesador de datos"], answer: "Transponster" },
      { q: "Como se chama o pingüín de peluche de Joey?", options: ["Waddles", "Hugsy", "Pingu", "Snowy"], answer: "Hugsy" },
      { q: "Cantas veces se divorcia Ross ao longo da serie?", options: ["Unha", "Dúas", "Catro", "Tres"], answer: "Tres" },
      { q: "Que nome falso usa Phoebe cando quere facerse pasar por outra persoa?", options: ["Regina Phalange", "Ursula Pepper", "Phoebe Abbott", "Gina Bing"], answer: "Regina Phalange" },
      { q: "Que personaxe interpreta Joey na telenovela Days of Our Lives?", options: ["Dr. Richard Burke", "Dr. Drake Ramoray", "Dr. Mike Hannigan", "Dr. Joey Tribbiani"], answer: "Dr. Drake Ramoray" },
      { q: "Como se chaman os xemelgos de Monica e Chandler?", options: ["Ben e Emma", "Jack e Judy", "Jack e Erica", "Frank e Alice"], answer: "Jack e Erica" }
    ],
    right: ["Correcto!", "Iso é!", "Exacto. Fan de verdade.", "Nin dubidaches.", "Moi ben. Gunther estaría orgulloso.", "Correctísimo.", "Iso é!"],
    wrong: [
      "Ups. Iso non.",
      "Non. E non, non estabades nun descanso.",
      "Joey non comparte comida. E esta resposta non a comparte ninguén: está mal."
    ],
    gameOver: ["Sen vidas.", "Ata Ross volvería empezar despois disto. O concurso comeza de novo!"],
    success: ["SETE DE SETE.", "O apartamento é teu.", "Podería alguén SER máis fan?"]
  },

  // A noite das lentellas (o día no que naceu Martiño)
  lentellas: {
    intro: [
      "O XUÍZO DAS LENTELLAS",
      "Unha noite, volvendo do ximnasio, Tania sentiuse rara. A cea fora lentellas, e a sentenza parecía clara.",
      "Hoxe xúlgase aquela acusación. Examina as probas antes de dar o veredicto."
    ],
    evidence: {
      accused: { label: "Acusadas", text: ["As lentellas, no banco dos acusados.", "Declaran: «Nós só eramos a cea»."] },
      gym: { label: "Bolsa do ximnasio", text: ["Proba 1: a bolsa do ximnasio.", "Viñades de adestrar. Tania, embarazadísima, con máis enerxía ca o monitor."] },
      witness: { label: "Testemuña", text: ["Proba 2: a testemuña, Gonzalo.", "Diagnóstico daquela noite: «Serán as lentellas». Estudos de medicina: ningún."] },
      towel: { label: "Toalla", text: ["Proba 3: unha toalla e un charquiño sospeitoso.", "As lentellas, polo que se sabe, non adoitan facer iso."] }
    },
    needed: ["gym", "witness", "towel"],
    verdictQ: "Veredicto: quen foi o verdadeiro responsable do que pasou aquela noite?",
    options: ["As lentellas", "O ximnasio", "O chourizo das lentellas", "Martiño"],
    answer: "Martiño",
    wrong: {
      "As lentellas": ["Obxección! As lentellas teñen coartada:", "levan séculos cenándose sen facer nacer a ninguén."],
      "O ximnasio": ["O ximnasio declara que el só pon as máquinas.", "O que pasou despois non é cousa súa."],
      "O chourizo das lentellas": ["O chourizo é culpable de moitas cousas.", "Pero desta, non."]
    },
    success: [
      "MARTIÑO.",
      "Que xa daquela tiña présa por coñecervos. Unhas horas despois, chegou á partida.",
      "As lentellas quedan absoltas de todos os cargos.",
      "Gonzalo, condenado a non volver diagnosticar nada nunca máis."
    ]
  },

  // Leyma Coruña (datos comprobados: primeira tempada ACB 2024-25, balance 7-27)
  leyma: {
    intro: [
      "O Coliseum. Noite de partido.",
      "Hai uns anos fixestes socios do Leyma Coruña e, desde entón, as fins de semana teñen outro ritmo."
    ],
    throws: ["O teu xogador favorito, Guillem Jou, pásache o balón.", "Tres tiros libres. Toca LANZAR cando o indicador estea na zona verde."],
    short: ["Curto. Nin rozou o aro."],
    long: ["Longo. Taboleiro... e fóra."],
    scored: ["Dentro!", "Dentro outra vez! O Coliseum ferve.", "TRES DE TRES!"],
    board: [
      "O marcador ilumínase cunha pregunta só para socios de verdade:",
      "Na primeira tempada da historia do club na ACB (2024-25), cantas vitorias conseguiu o Leyma?"
    ],
    code: "07",
    losses: ["Esas foron as derrotas.", "Mellor non lembralas."],
    tooMany: ["Iso quixeramos...", "Foi unha tempada bastante máis dura."],
    tooFew: ["Algunha máis houbo.", "Poucas, pero houbo."],
    success: [
      "7 VITORIAS.",
      "Poucas? Si. Pero o Coliseum encheuse igual.",
      "Un ano despois o Leyma volveu subir, e agora está outra vez na ACB.",
      "Os socios non abandonan. Nin nas derrotas."
    ],
    hints: ["Foi unha tempada dura: o equipo rematou último e baixou.", "Busca \"Leyma Coruña ACB 2024-25\": o balance foi de X vitorias e 27 derrotas."]
  },

  // A reforma da casa + a casiña de Aldán
  fogar: {
    intro: [
      "A REFORMA",
      "Po, orzamentos que medran sós e decisións imposibles sobre azulexos.",
      "Arranxa todas as pezas da casa. Ollo: cada arranxo move tamén as pezas do lado. Coma nunha obra de verdade."
    ],
    solved: [
      "Obra rematada.",
      "Moitos dores de cabeza e bastantes cartos... pero agora tedes unha casa que é, de verdade, o voso fogar."
    ],
    aldanIntro: [
      "E agora, segunda obra: a casiña de Tania en Aldán, un paraíso nas Rías Baixas.",
      "Despois dunha xornada de obra só hai un sitio onde ir... pero o vento tirou as letras do letreiro."
    ],
    house: ["A casiña de Aldán.", "Andamios, po... e moita ilusión."],
    ria: ["A ría de Aldán.", "Hai sitios que non precisan filtro."],
    restaurant: ["O voso restaurante favorito.", "Polo menos o era cando tiña letreiro."],
    word: "CHINCHORRO",
    scrambled: "HORCINOCHR",
    signWrong: ["Ese restaurante non existe.", "E se existise, non sería o voso favorito."],
    success: [
      "O CHINCHORRO.",
      "Mesa de sempre, vistas á ría e a sensación de que a obra pode esperar ata mañá.",
      "Aldán xa é un pouco máis fogar."
    ],
    hints: ["Cada toque cambia a peza tocada e as que ten arriba, abaixo e aos lados.", "Truco de obreiro: se unha peza está en obras, toca a que ten xusto debaixo. Vai fila por fila."],
    signHints: ["É o voso restaurante favorito en Aldán.", "Empeza por CH... e remata en ...ORRO."]
  },

  caixa: {
    intro: [
      "{n} fragmentos. Unha caixa forte. E unha clave que esta máquina non coñece.",
      "O último fragmento non está aquí: terás que pedirllo a Gonzalo."
    ],
    eggs: {
      "2805": ["Un bo comezo.", "Pero non é o final."],
      "1622": ["2016 e 2022.", "Dous grandes anos, pero esta caixa busca outra cousa."],
      "2507": ["O día da voda. Bonita data...", "pero esta caixa xa sabe que estades casados."],
      "250714": ["O día da voda. Bonita data...", "pero esta caixa xa sabe que estades casados."],
      "2014": ["2014: o ano no que todo se fixo oficial.", "A caixa aproba a nostalxia, pero quere outra cousa."],
      "0000": ["Iso é o que poñería calquera.", "E ti non es calquera."],
      "1234": ["Iso é o que poñería calquera.", "E ti non es calquera."],
      "4040": ["40, si. Pero non é tan doado."],
      "0040": ["40, si. Pero non é tan doado."]
    },
    wrong: [
      ["A caixa nin se inmuta."],
      ["Click. Nada. A caixa ten moita paciencia."],
      ["Esa non é.", "Quizais Gonzalo saiba algo..."],
      ["A caixa boceza.", "Pregúntalle a quen a pechou."]
    ],
    notConfigured: ["A caixa aínda non ten clave.", "Alguén (que se chama Gonzalo) terá que configurala."],
    reveal: [
      "40 anos.",
      "22 anos xuntos.",
      "Unha historia enteira chea de lugares, datas, viaxes, erros, risas e lembranzas.",
      "E aínda queda o mellor."
    ],
    emptyGift: "O segredo aínda non foi escrito."
  }
};

// ---------------------------------------------------------------------
//  Utilidades comúns
// ---------------------------------------------------------------------
function sceneWrap(svgMarkup, extraCls = "") {
  return h("div.scene" + (extraCls ? "." + extraCls : ""), { html: svgMarkup });
}

function continueBtn(ctx, label = "CONTINUAR") {
  return btn(label, () => ctx.complete(), "primary");
}

function hintsFor(ctx, hints) {
  return ctx.ui.hintButton(ctx.pst, hints, CONFIG.HINT_AFTER_ATTEMPTS, () => ctx.save());
}

// ---------------------------------------------------------------------
//  FASE 1 · A TORRE DE HÉRCULES
// ---------------------------------------------------------------------
function phase1(ctx) {
  const C = CONTENT.torre;
  const { ui, pst } = ctx;
  const stage = ui.stage(sceneWrap(scenes.tower()), "scene-stage");

  const showQuestion = () => {
    const hintEl = hintsFor(ctx, C.hints);
    const form = ui.answerForm({
      label: C.question,
      placeholder: "A frase, máis ou menos…",
      onSubmit: (v, input) => {
        const r = V.validateTowerPhrase(v);
        if (r.ok) {
          pst.solved = true;
          ctx.audio.sfx("success");
          ctx.save();
          ui.say(C.success);
          ui.controls(continueBtn(ctx));
        } else {
          ctx.attempt();
          ctx.audio.sfx("error");
          ui.say(C.feedback[r.code] || C.feedback.none);
          input.select();
          hintEl.refresh();
        }
      }
    });
    ui.controls(form, hintEl);
  };

  ui.hotspots([
    { label: "Torre de Hércules", x: 26, y: 6, w: 20, h: 68, onTap: () => ui.say(C.tower) },
    {
      label: "A parella", x: 50, y: 48, w: 14, h: 26,
      onTap: () => {
        ui.say(C.couple);
        if (!pst.asked) {
          pst.asked = true;
          ctx.save();
        }
        if (!pst.solved) showQuestion();
      }
    }
  ]);

  if (pst.solved) {
    ui.say(C.success, { instant: true });
    ui.controls(continueBtn(ctx));
  } else if (pst.asked) {
    ui.say(C.couple, { instant: true });
    showQuestion();
  } else {
    ui.say(C.intro);
    ui.controls(h("p.tip", {}, "Toca os puntos brillantes da escena para investigar."));
  }
  return stage;
}

// ---------------------------------------------------------------------
//  FASE 2 · NOVA YORK
// ---------------------------------------------------------------------
function phase2(ctx) {
  const C = CONTENT.newYork;
  const { ui, pst } = ctx;
  ui.stage(sceneWrap(scenes.newYork()), "scene-stage");
  pst.seq = pst.seq || 0;
  let hintEl = null;

  const finishSequence = () => {
    pst.sequenceDone = true;
    ctx.save();
    ctx.audio.sfx("success");
    if (C.personalQuestion && !pst.personalDone) return askPersonal();
    pst.solved = true;
    ctx.save({ silent: true });
    ui.say(C.success);
    ui.controls(continueBtn(ctx));
  };

  const askPersonal = () => {
    const Q = C.personalQuestion;
    const hEl = ctx.ui.hintButton(pst.personal || (pst.personal = { attempts: 0, hints: 0 }), Q.hints || [], CONFIG.HINT_AFTER_ATTEMPTS, () => ctx.save());
    ui.say([Q.question]);
    ui.controls(ui.answerForm({
      label: Q.question,
      onSubmit: (v, input) => {
        if (V.matchesAny(v, Q.accept) || Q.accept.some((a) => V.normalize(v).includes(V.normalize(a)))) {
          pst.personalDone = true;
          pst.solved = true;
          ctx.save();
          ctx.audio.sfx("success");
          ui.say(C.success);
          ui.controls(continueBtn(ctx));
        } else {
          pst.personal.attempts++;
          ctx.save({ silent: true });
          ctx.audio.sfx("error");
          ui.say(["Non é iso. Proba outra vez."]);
          input.select();
          hEl.refresh();
        }
      }
    }), hEl);
  };

  const tap = (key) => {
    const spot = C.spots[key];
    if (pst.solved) return ui.say(spot.text);
    if (!ctx.S.hasItem(ITEMS.postal.id)) {
      ui.say(spot.text);
      if (key === "suitcase") {
        ctx.addItem(ITEMS.postal);
        setTimeout(() => {
          ui.say([...C.afterPostal, ITEMS.postal.desc]);
          renderControls();
        }, 900);
      }
      return;
    }
    if (pst.sequenceDone) return finishSequence();
    // Modo secuencia
    if (C.sequence[pst.seq] === key) {
      pst.seq++;
      ctx.audio.sfx("item");
      ctx.save();
      ui.say([C.stepOk[pst.seq - 1] || "Ben."]);
      if (pst.seq >= C.sequence.length) setTimeout(finishSequence, 700);
    } else {
      pst.seq = 0;
      ctx.attempt();
      ctx.audio.sfx("error");
      ui.say(C.wrong);
      hintEl && hintEl.refresh();
    }
  };

  const renderControls = () => {
    if (pst.solved) return ui.controls(continueBtn(ctx));
    if (!ctx.S.hasItem(ITEMS.postal.id)) return ui.controls(h("p.tip", {}, "Toca os puntos brillantes da escena para investigar."));
    hintEl = hintsFor(ctx, C.hints);
    ui.controls(h("p.tip", {}, `Progreso da chegada: ${"■".repeat(pst.seq)}${"□".repeat(C.sequence.length - pst.seq)}`), hintEl);
  };

  ui.hotspots([
    { label: C.spots.skyline.label, x: 38, y: 2, w: 24, h: 40, onTap: () => { tap("skyline"); renderControls(); } },
    { label: C.spots.suitcase.label, x: 8, y: 64, w: 18, h: 24, onTap: () => { tap("suitcase"); renderControls(); } },
    { label: C.spots.taxi.label, x: 56, y: 62, w: 32, h: 26, onTap: () => { tap("taxi"); renderControls(); } }
  ]);

  if (pst.solved) ui.say(C.success, { instant: true });
  else if (pst.sequenceDone && C.personalQuestion) return askPersonal();
  else if (ctx.S.hasItem(ITEMS.postal.id)) ui.say([...C.afterPostal, ITEMS.postal.desc], { instant: true });
  else ui.say(C.intro);
  renderControls();
}

// ---------------------------------------------------------------------
//  FASE 3 · MALDIVAS
// ---------------------------------------------------------------------
function phase3(ctx) {
  const C = CONTENT.maldivas;
  const { ui, pst } = ctx;
  ui.stage(sceneWrap(scenes.maldives()), "scene-stage");
  pst.found = pst.found || [];
  pst.placement = pst.placement || {};
  let hintEl = null;

  const renderBoard = () => {
    if (pst.solved) {
      ui.controls(continueBtn(ctx));
      return;
    }
    hintEl = hintsFor(ctx, C.hints);
    if (!pst.bottleRead) {
      ui.controls(h("p.tip", {}, `Palabras atopadas: ${pst.found.length ? pst.found.join(", ") : "ningunha"}. Hai algo na area...`), hintEl);
      return;
    }
    const tokens = pst.found.map((w) => ({ id: "w-" + w, label: w }));
    const groups = C.phrase.map((p) => ({ label: p.label, slots: [{ id: p.id, hint: "____" }] }));
    const expected = Object.fromEntries(C.phrase.map((p) => [p.id, p.answer]));
    const board = createTokenBoard({
      groups,
      tokens,
      placement: pst.placement,
      save: () => ctx.save(),
      layout: "column",
      onChange: (pl) => {
        if (placementMatches(pl, tokens, expected)) {
          pst.solved = true;
          ctx.save({ silent: true });
          ctx.audio.sfx("success");
          board.lock();
          ui.say(C.success);
          setTimeout(() => ui.controls(board.el, continueBtn(ctx)), 50);
        } else if (C.phrase.every((p) => pl[p.id])) {
          ctx.attempt();
          ctx.audio.sfx("error");
          ui.say(C.wrong);
          hintEl.refresh();
        }
      }
    });
    const missing = Object.keys(C.words).length - pst.found.length;
    ui.controls(board.el, missing > 0 ? h("p.tip", {}, `Aínda quedan ${missing} palabra(s) por atopar na escena.`) : null, hintEl);
  };

  const wordSpot = (key) => () => {
    const w = C.words[key];
    ui.say([w.text, `«${w.word}»`]);
    if (!pst.found.includes(w.word)) {
      pst.found.push(w.word);
      ctx.audio.sfx("item");
      ctx.save();
      renderBoard();
    }
  };

  ui.hotspots([
    { label: C.words.moon.label, x: 64, y: 8, w: 18, h: 26, onTap: wordSpot("moon") },
    { label: C.words.bungalow.label, x: 40, y: 28, w: 26, h: 34, onTap: wordSpot("bungalow") },
    { label: C.words.palm.label, x: 4, y: 34, w: 20, h: 44, onTap: wordSpot("palm") },
    { label: C.words.sea.label, x: 30, y: 63, w: 28, h: 15, onTap: wordSpot("sea") },
    {
      label: C.bottle.label, x: 34, y: 82, w: 14, h: 12,
      onTap: () => {
        ui.say(C.bottle.text);
        if (!pst.bottleRead) {
          pst.bottleRead = true;
          ctx.save();
          renderBoard();
        }
      }
    }
  ]);

  ui.say(pst.solved ? C.success : C.intro, { instant: pst.solved });
  renderBoard();
}

// ---------------------------------------------------------------------
//  FASE 4 · O CANDADO DA VODA
// ---------------------------------------------------------------------
function phase4(ctx) {
  const C = CONTENT.voda;
  const { ui, pst } = ctx;
  const stage = ui.stage(sceneWrap(scenes.pazo()), "scene-stage lock-stage");
  let hintEl;

  const lock = createCodeLock({
    length: C.code.length,
    kind: "padlock",
    label: "Candado de seis cifras",
    onSubmit: async (code) => {
      if (code === C.code) {
        pst.solved = true;
        ctx.save();
        ui.say(["…"], { instant: true });
        await lock.open();
        ui.say(C.success);
        ui.controls(continueBtn(ctx));
        return { ok: true };
      }
      ctx.attempt();
      const sorted = (s) => s.match(/../g).sort().join("");
      const reordered = sorted(code) === sorted(C.code);
      ui.say(reordered ? C.reordered : C.wrong);
      hintEl.refresh();
      return { ok: false };
    }
  });
  stage.append(h("div.stage-overlay", {}, lock.top));

  if (pst.solved) {
    lock.visual.classList.add("open", "unlocking");
    ui.say(C.success, { instant: true });
    ui.controls(continueBtn(ctx));
  } else {
    hintEl = hintsFor(ctx, C.hints);
    ui.say(C.intro);
    ui.controls(lock.keys, hintEl);
  }
}

// ---------------------------------------------------------------------
//  FASE 5 · O INCIDENTE DA SABA
// ---------------------------------------------------------------------
function phase5(ctx) {
  const C = CONTENT.saba;
  const { ui, pst } = ctx;
  ui.stage(sceneWrap(scenes.hotel()), "scene-stage");

  const showQuestion = () => {
    const hintEl = hintsFor(ctx, C.hints);
    ui.controls(ui.answerForm({
      label: C.question,
      placeholder: "O culpable é…",
      onSubmit: (v, input) => {
        const r = V.validateSheetCulprit(v);
        if (r.ok) {
          pst.solved = true;
          ctx.save();
          ctx.audio.sfx("success");
          ui.say(C.success);
          ui.controls(continueBtn(ctx));
        } else {
          ctx.attempt();
          ctx.audio.sfx("error");
          ui.say(C.feedback[r.code] || C.feedback.none);
          input.select();
          hintEl.refresh();
        }
      }
    }), hintEl);
  };

  const examine = () => {
    ctx.addItem(ITEMS.saba);
    ui.say(C.examine);
    showQuestion();
  };

  ui.hotspots([
    {
      label: "Cama", x: 6, y: 42, w: 50, h: 36,
      onTap: () => {
        if (pst.solved) return ui.say(C.success);
        ui.say(C.bed);
        if (!ctx.S.hasItem(ITEMS.saba.id)) ui.controls(btn("EXAMINAR SABA", examine, "primary"));
        else showQuestion();
      }
    },
    { label: "Fiestra", x: 64, y: 10, w: 30, h: 34, onTap: () => ui.say(C.window) },
    { label: "Lámpada", x: 56, y: 40, w: 9, h: 30, onTap: () => ui.say(C.lamp) }
  ]);

  if (pst.solved) {
    ui.say(C.success, { instant: true });
    ui.controls(continueBtn(ctx));
  } else if (ctx.S.hasItem(ITEMS.saba.id)) {
    ui.say([C.question], { instant: true });
    showQuestion();
  } else {
    ui.say(C.intro);
    ui.controls(h("p.tip", {}, "Algo non cadra nesta habitación. Investiga."));
  }
}

// ---------------------------------------------------------------------
//  FASE 6 · CON LA LUNA LLENA
// ---------------------------------------------------------------------
export function spotifyUrl() {
  const u = CONFIG.SPOTIFY_URL;
  return u && u !== "TODO" ? u : CONFIG.SPOTIFY_FALLBACK_URL;
}

function phase6(ctx) {
  const C = CONTENT.lua;
  const { ui, pst } = ctx;
  const stage = ui.stage(sceneWrap(scenes.fullMoon()), "scene-stage");

  const showSoundtrack = () => {
    stage.querySelector(".scene").classList.add("moon-awake");
    let qr;
    try {
      qr = window.QRMini ? window.QRMini.svg(spotifyUrl(), { ecl: "M", border: 3, label: "Código QR da canción en Spotify" }) : "";
    } catch (e) {
      console.error("[tania40] Erro xerando QR", e);
      qr = "";
    }
    ui.controls(
      h("div.qr-card", {},
        h("p.qr-text", {}, C.qrText),
        qr ? h("div.qr", { html: qr }) : h("p", {}, "Non se puido xerar o QR, pero a ligazón funciona."),
        h("a.btn.primary.spotify", { href: spotifyUrl(), target: "_blank", rel: "noopener", onclick: () => ctx.audio.sfx("click") }, "ABRIR EN SPOTIFY"),
        btn("XA ESTÁ SOANDO", () => ctx.complete())
      )
    );
  };

  ui.hotspots([{ label: "Lúa chea", x: 30, y: 12, w: 40, h: 54, onTap: () => ui.say(pst.solved ? C.success : C.moon) }]);

  if (pst.solved) {
    ctx.app.suppressMusic();
    ui.say(C.success, { instant: true });
    showSoundtrack();
    return;
  }
  const hintEl = hintsFor(ctx, C.hints);
  ui.say(C.intro);
  ui.controls(ui.answerForm({
    label: C.question,
    placeholder: "Título da canción…",
    onSubmit: (v, input) => {
      const r = V.validateSong(v);
      if (r.ok) {
        pst.solved = true;
        ctx.save();
        ctx.app.suppressMusic();
        ctx.audio.sfx("success");
        ui.say(C.success);
        showSoundtrack();
      } else {
        ctx.attempt();
        ctx.audio.sfx("error");
        ui.say(C.feedback[r.code] || C.feedback.none);
        input.select();
        hintEl.refresh();
      }
    }
  }), hintEl);
}

// ---------------------------------------------------------------------
//  FASE 7 · FOTOGRAFÍA ROTA
// ---------------------------------------------------------------------
function phase7(ctx) {
  const C = CONTENT.foto;
  const { ui, pst } = ctx;
  const stage = ui.stage(null, "puzzle-stage");
  let hintEl;

  const finish = (animate) => {
    ctx.addItem(ITEMS.foto);
    ui.say(C.success, { instant: !animate });
    ui.controls(continueBtn(ctx));
  };

  const puzzle = createPhotoPuzzle({
    src: CONFIG.PHOTO_PUZZLE,
    version: CONFIG.PHOTO_PUZZLE_VERSION,
    pst,
    save: (o) => ctx.save(o),
    onMove: (ps) => {
      pst.attempts = Math.floor(ps.moves / 8);
      if (hintEl) hintEl.refresh();
    },
    onReady: (ps) => {
      stage.classList.toggle("show-in-place", (pst.hints || 0) >= 2);
      if (ps.solved) finish(false);
    },
    onSolved: () => {
      ctx.audio.sfx("success");
      pst.solved = true;
      ctx.save({ silent: true });
      finish(true);
    },
    onError: () => {
      ui.say(C.missing);
      ui.controls(h("p.tip", {}, "Gonzalo: revisa o ficheiro da foto ou usa a consola para saltar esta fase."));
    }
  });
  stage.append(puzzle);

  if (!(pst.photoPuzzle && pst.photoPuzzle.solved)) {
    hintEl = ctx.ui.hintButton(pst, C.hints, CONFIG.HINT_AFTER_ATTEMPTS, () => {
      ctx.save();
      stage.classList.toggle("show-in-place", (pst.hints || 0) >= 2);
    });
    ui.say(C.intro);
    ui.controls(hintEl);
  }
}

// ---------------------------------------------------------------------
//  FASE 8 · O ARQUIVO FAMILIAR
// ---------------------------------------------------------------------
function phase8(ctx) {
  const C = CONTENT.familia;
  const { ui, pst } = ctx;

  const part1 = () => {
    ui.stage(sceneWrap(scenes.archive()), "scene-stage");
    const hintEl = hintsFor(ctx, C.hints);
    const board = createFamilyArchive({
      content: C,
      pst,
      save: () => ctx.save(),
      onWrong: () => {
        ctx.attempt();
        ctx.audio.sfx("error");
        ui.say(C.wrongDates);
        hintEl.refresh();
      },
      onSolved: async () => {
        ctx.audio.sfx("success");
        ui.stageEl().classList.add("files-recovered");
        ui.stageEl().append(h("div.stage-banner", {}, "ARQUIVOS RECUPERADOS"));
        await ui.say(C.recovered);
        ui.controls(board.el, btn("CONTINUAR", () => {
          pst.part = 2;
          ctx.save();
          part2();
        }, "primary"));
      }
    });
    ui.say(C.intro);
    ui.controls(board.el, hintEl);
  };

  const part2 = () => {
    const stage = ui.stage(null, "code-stage");
    const [m, x] = C.children;
    stage.append(
      h("div.family-diagram", { "aria-label": "Diagrama: un día descoñecido do que veñen Martiño e Xoel" },
        h("div.fd-label", {}, "O COMEZO"),
        h("div.fd-target", {}, "?? · ??"),
        h("div.fd-col", {}, h("span.fd-arrow", {}, "↓"), h("span.fd-name", {}, m.name.toUpperCase()), h("span.fd-date", {}, m.date.join(" · "))),
        h("div.fd-col", {}, h("span.fd-arrow", {}, "↓"), h("span.fd-name", {}, x.name.toUpperCase()), h("span.fd-date", {}, x.date.join(" · "))))
    );
    if (pst.solved) {
      stage.querySelector(".fd-target").textContent = C.codeLabel || C.code;
      stage.prepend(h("div.stage-banner", {}, "CLAVE FAMILIAR RECUPERADA"));
      ui.say(C.success, { instant: true });
      ui.controls(continueBtn(ctx));
      return;
    }
    pst.codeState = pst.codeState || { attempts: 0, hints: 0 };
    const hintEl = ctx.ui.hintButton(pst.codeState, C.codeHints, CONFIG.HINT_AFTER_ATTEMPTS, () => ctx.save());
    const lock = createCodeLock({
      length: C.code.length,
      kind: "padlock",
      label: "Candado familiar de catro cifras",
      onSubmit: async (code) => {
        if (code === C.code) {
          pst.solved = true;
          ctx.addItem(ITEMS.familia);
          ctx.save();
          await lock.open();
          stage.querySelector(".fd-target").textContent = C.codeLabel || C.code;
          stage.prepend(h("div.stage-banner", {}, "CLAVE FAMILIAR RECUPERADA"));
          ui.say(C.success);
          ui.controls(continueBtn(ctx));
          return { ok: true };
        }
        pst.codeState.attempts++;
        ctx.save({ silent: true });
        const swapped = code === C.code.slice(2) + C.code.slice(0, 2);
        const year = C.children.some((c) => c.date[2] === code) || /^(19|20)\d\d$/.test(code);
        const msg = swapped ? C.swapped
          : C.kidsCodes.includes(code) ? C.kidsCode
          : C.weddingCodes.includes(code) ? C.weddingCode
          : year ? C.yearCode : C.wrongCode;
        ui.say(msg);
        hintEl.refresh();
        return { ok: false };
      }
    });
    stage.append(h("div.small-lock", {}, lock.top));
    ui.say([C.clueHint]);
    ui.controls(lock.keys, hintEl);
  };

  if (pst.part === 2) part2();
  else part1();
}

// ---------------------------------------------------------------------
//  FASE 9 · ARQUIVO TEMPORAL + GONZALO
// ---------------------------------------------------------------------
function phase9(ctx) {
  const C = CONTENT.tempo;
  const { ui, pst } = ctx;
  pst.placement = pst.placement || {};

  const showGonzalo = () => {
    const stage = ui.stage(sceneWrap(scenes.npcRoom()), "scene-stage");
    stage.append(h("div.npc", { html: scenes.gonzaloSprite() }));
    pst.npcStep = pst.npcStep || 0;
    const step = () => {
      const i = pst.npcStep;
      ui.say([C.gonzalo[i]], { speaker: "GONZALO" });
      if (i < C.gonzalo.length - 1) {
        ui.controls(btn("SEGUINTE", () => {
          pst.npcStep++;
          ctx.save({ silent: true });
          step();
        }, "primary"));
      } else {
        ui.controls(continueBtn(ctx));
      }
    };
    step();
  };

  if (pst.solved) return showGonzalo();

  // Baralla determinista para que non saia xa ordenado.
  const shuffledOrder = [...C.order].map((label, i) => ({ id: "e" + i, label })).sort((a, b) => ((a.id.charCodeAt(1) * 7) % 5) - ((b.id.charCodeAt(1) * 7) % 5));
  const tokens = shuffledOrder;
  const groups = C.order.map((_, i) => ({ label: `${i + 1}º`, slots: [{ id: "pos" + i, hint: "…" }] }));
  const expected = Object.fromEntries(C.order.map((label, i) => ["pos" + i, label]));

  const stage = ui.stage(sceneWrap(scenes.npcRoom()), "scene-stage");
  stage.append(h("div.stage-banner.soft", {}, "ARQUIVO TEMPORAL"));
  const hintEl = hintsFor(ctx, C.hints);
  const board = createTokenBoard({
    groups,
    tokens,
    placement: pst.placement,
    layout: "column",
    save: () => ctx.save(),
    onChange: async (pl) => {
      if (placementMatches(pl, tokens, expected)) {
        pst.solved = true;
        ctx.save({ silent: true });
        board.lock();
        ctx.audio.sfx("success");
        await ui.say(C.solved);
        await wait(1200);
        ctx.audio.sfx("phase");
        showGonzalo();
      } else if (C.order.every((_, i) => pl["pos" + i])) {
        ctx.attempt();
        ctx.audio.sfx("error");
        ui.say(C.wrong);
        hintEl.refresh();
      }
    }
  });
  ui.say(C.intro);
  ui.controls(board.el, hintEl);
}

// ---------------------------------------------------------------------
//  FASE 10 · A CAIXA FORTE
// ---------------------------------------------------------------------
export function finalCodeLength() {
  const c = String(CONFIG.FINAL_CODE || "");
  return /^\d+$/.test(c) ? c.length : 4;
}

function phase10(ctx) {
  const C = CONTENT.caixa;
  const { ui, pst } = ctx;
  const stage = ui.stage(sceneWrap(scenes.vault()), "scene-stage lock-stage");
  pst.wrongIdx = pst.wrongIdx || 0;

  const lock = createCodeLock({
    length: finalCodeLength(),
    kind: "safe",
    label: "Caixa forte",
    onSubmit: async (code) => {
      const configured = /^\d+$/.test(String(CONFIG.FINAL_CODE));
      if (configured && code === String(CONFIG.FINAL_CODE)) {
        await lock.open();
        ctx.app.finalReveal();
        return { ok: true };
      }
      ctx.attempt();
      if (C.eggs[code]) ui.say(C.eggs[code]);
      else if (!configured) ui.say(C.notConfigured);
      else {
        ui.say(C.wrong[pst.wrongIdx % C.wrong.length]);
        pst.wrongIdx++;
      }
      ctx.save({ silent: true });
      return { ok: false };
    }
  });
  stage.append(h("div.stage-overlay", {}, lock.top));
  const n = numberGl(PHASES.length - 1);
  ui.say(C.intro.map((t) => t.replace("{n}", n.charAt(0).toUpperCase() + n.slice(1))));
  ui.controls(lock.keys);
}

// ---------------------------------------------------------------------
//  FRIENDS · O CONCURSO DO APARTAMENTO
// ---------------------------------------------------------------------
function phaseFriends(ctx) {
  const C = CONTENT.friends;
  const { ui, pst } = ctx;
  const stage = ui.stage(sceneWrap(scenes.livingRoom()), "scene-stage");
  const status = h("div.quiz-status");
  stage.append(h("div.tv-screen", {}, h("div.tv-title", {}, "CONCURSO"), status));

  if (pst.solved) {
    status.append(h("div.quiz-progress", {}, `${C.questions.length} / ${C.questions.length}`));
    ui.say(C.success, { instant: true });
    ui.controls(continueBtn(ctx));
    return;
  }
  const quiz = createQuiz({
    questions: C.questions,
    lives: 3,
    pst,
    save: (o) => ctx.save(o),
    status,
    say: (lines) => ui.say(lines, { instant: true }),
    texts: { right: C.right, wrong: C.wrong, gameOver: C.gameOver },
    onWin: () => {
      pst.solved = true;
      ctx.save({ silent: true });
      ctx.audio.sfx("success");
      ui.say(C.success);
      ui.controls(continueBtn(ctx));
    }
  });
  ui.say(C.intro);
  ui.controls(quiz.el);
}

// ---------------------------------------------------------------------
//  O XUÍZO DAS LENTELLAS
// ---------------------------------------------------------------------
function phaseLentils(ctx) {
  const C = CONTENT.lentellas;
  const { ui, pst } = ctx;
  ui.stage(sceneWrap(scenes.court()), "scene-stage");
  pst.evidence = pst.evidence || [];

  const renderControls = () => {
    if (pst.solved) return ui.controls(continueBtn(ctx));
    const found = C.needed.filter((k) => pst.evidence.includes(k)).length;
    if (found < C.needed.length) {
      return ui.controls(h("div.dive-log", {},
        h("div.dive-log-title", {}, `PROBAS EXAMINADAS · ${found}/${C.needed.length}`),
        ...C.needed.map((k) => h("div.dive-log-row" + (pst.evidence.includes(k) ? ".done" : ""), {}, pst.evidence.includes(k) ? `✓ ${C.evidence[k].label}` : "· ???"))));
    }
    const grid = h("div.quiz-options");
    C.options.forEach((opt) => grid.append(btn(opt, () => verdict(opt), "quiz-opt")));
    ui.controls(h("div.quiz", {}, h("div.quiz-q", {}, C.verdictQ), grid));
  };

  const verdict = (opt) => {
    if (opt === C.answer) {
      pst.solved = true;
      ctx.save();
      ctx.audio.sfx("success");
      ui.stageEl().append(h("div.stage-banner", {}, "ABSOLTAS!"));
      ui.say(C.success);
      renderControls();
    } else {
      ctx.attempt();
      ctx.audio.sfx("error");
      ui.say(C.wrong[opt] || ["Non."]);
    }
  };

  const examine = (k) => {
    ui.say(C.evidence[k].text);
    if (C.needed.includes(k) && !pst.evidence.includes(k)) {
      pst.evidence.push(k);
      ctx.audio.sfx("item");
      ctx.save();
      renderControls();
    }
  };

  ui.hotspots([
    { label: C.evidence.accused.label, x: 3, y: 44, w: 24, h: 34, onTap: () => examine("accused") },
    { label: C.evidence.gym.label, x: 34, y: 70, w: 18, h: 18, onTap: () => examine("gym") },
    { label: C.evidence.witness.label, x: 77, y: 32, w: 20, h: 38, onTap: () => examine("witness") },
    { label: C.evidence.towel.label, x: 60, y: 78, w: 26, h: 16, onTap: () => examine("towel") }
  ]);

  if (pst.solved) ui.say(C.success, { instant: true });
  else if (C.needed.every((k) => pst.evidence.includes(k))) ui.say([C.verdictQ], { instant: true });
  else ui.say(C.intro);
  renderControls();
}

// ---------------------------------------------------------------------
//  LEYMA CORUÑA
// ---------------------------------------------------------------------
function phaseBasket(ctx) {
  const C = CONTENT.leyma;
  const { ui, pst } = ctx;

  const part2 = () => {
    const stage = ui.stage(sceneWrap(scenes.coliseum()), "scene-stage lock-stage");
    pst.codeState = pst.codeState || { attempts: 0, hints: 0 };
    const lock = createCodeLock({
      length: C.code.length,
      kind: "none",
      label: "Vitorias no marcador",
      onSubmit: async (code) => {
        if (code === C.code) {
          pst.solved = true;
          ctx.save();
          ctx.audio.sfx("success");
          await lock.open();
          stage.querySelector(".scoreboard").classList.add("win");
          ui.say(C.success);
          ui.controls(continueBtn(ctx));
          return { ok: true };
        }
        pst.codeState.attempts++;
        ctx.save({ silent: true });
        const n = parseInt(code, 10);
        ui.say(n === 27 ? C.losses : n > 7 ? C.tooMany : C.tooFew);
        hintEl.refresh();
        return { ok: false };
      }
    });
    stage.append(h("div.stage-overlay", {},
      h("div.scoreboard" + (pst.solved ? ".win" : ""), {},
        h("div.sb-title", {}, "LEYMA CORUÑA · ACB 2024-25"),
        h("div.sb-label", {}, "VITORIAS"),
        lock.top)));
    const hintEl = ctx.ui.hintButton(pst.codeState, C.hints, CONFIG.HINT_AFTER_ATTEMPTS, () => ctx.save());
    if (pst.solved) {
      lock.top.querySelectorAll(".code-slot").forEach((el, i) => (el.textContent = C.code[i]));
      ui.say(C.success, { instant: true });
      ui.controls(continueBtn(ctx));
      return;
    }
    ui.say(C.board);
    ui.controls(lock.keys, hintEl);
  };

  if (pst.part === 2) return part2();

  const stage = ui.stage(sceneWrap(scenes.coliseum()), "scene-stage");
  const ball = stage.querySelector(".ball");
  const game = createFreeThrows({
    goal: 3,
    pst,
    ball,
    save: () => ctx.save(),
    onScore: (n) => ui.say([C.scored[n - 1] || "Dentro!"]),
    onMiss: (kind) => ui.say(kind === "short" ? C.short : C.long),
    onDone: () => {
      ctx.audio.sfx("success");
      setTimeout(() => {
        pst.part = 2;
        ctx.save({ silent: true });
        part2();
      }, 1400);
    }
  });
  ui.say([...C.intro, ...C.throws]);
  ui.controls(game.el);
}

// ---------------------------------------------------------------------
//  O FOGAR: a reforma + Aldán
// ---------------------------------------------------------------------
function phaseHome(ctx) {
  const C = CONTENT.fogar;
  const { ui, pst } = ctx;

  const part2 = () => {
    ui.stage(sceneWrap(scenes.aldan()), "scene-stage");
    pst.sign = pst.sign || { attempts: 0, hints: 0, placement: {} };
    ui.hotspots([
      { label: "Casiña", x: 1, y: 40, w: 31, h: 36, onTap: () => ui.say(C.house) },
      { label: "Ría", x: 34, y: 44, w: 26, h: 20, onTap: () => ui.say(C.ria) },
      { label: "Restaurante", x: 63, y: 38, w: 36, h: 38, onTap: () => ui.say(pst.solved ? C.success : C.restaurant) }
    ]);
    if (pst.solved) {
      ui.say(C.success, { instant: true });
      ui.controls(h("div.sign-done", {}, `O ${C.word}`), continueBtn(ctx));
      return;
    }
    const tokens = C.scrambled.split("").map((l, i) => ({ id: "l" + i, label: l }));
    const slots = C.word.split("").map((_, i) => ({ id: "s" + i, hint: "_" }));
    const expected = Object.fromEntries(C.word.split("").map((l, i) => ["s" + i, l]));
    const hintEl = ctx.ui.hintButton(pst.sign, C.signHints, CONFIG.HINT_AFTER_ATTEMPTS, () => ctx.save());
    const board = createTokenBoard({
      groups: [{ label: "O", slots }],
      tokens,
      placement: pst.sign.placement,
      save: () => ctx.save(),
      onChange: (pl) => {
        if (placementMatches(pl, tokens, expected)) {
          pst.solved = true;
          ctx.save({ silent: true });
          board.lock();
          ctx.audio.sfx("success");
          ui.say(C.success);
          ui.controls(board.el, continueBtn(ctx));
        } else if (slots.every((sl) => pl[sl.id])) {
          pst.sign.attempts++;
          ctx.save({ silent: true });
          ctx.audio.sfx("error");
          ui.say(C.signWrong);
          hintEl.refresh();
        }
      }
    });
    board.el.classList.add("sign-board");
    ui.say(C.aldanIntro);
    ui.controls(board.el, hintEl);
  };

  if (pst.part === 2) return part2();

  const stage = ui.stage(null, "puzzle-stage reform-stage");
  const hintEl = hintsFor(ctx, C.hints);
  const reform = createReform({
    pst,
    save: (o) => ctx.save(o),
    onMove: (st) => {
      pst.attempts = Math.floor(st.moves / 6);
      hintEl.refresh();
    },
    onSolved: () => {
      ctx.audio.sfx("success");
      ui.say(C.solved);
      ui.controls(btn("IR A ALDÁN", () => {
        pst.part = 2;
        ctx.save();
        part2();
      }, "primary"));
    }
  });
  stage.append(reform.el);
  if (reform.solved()) {
    ui.say(C.solved, { instant: true });
    ui.controls(btn("IR A ALDÁN", () => {
      pst.part = 2;
      ctx.save();
      part2();
    }, "primary"));
  } else {
    ui.say(C.intro);
    ui.controls(hintEl);
  }
}

// ---------------------------------------------------------------------
//  Definición das fases (a orde do array é a orde do xogo)
// ---------------------------------------------------------------------
const PHASE_LIST = [
  { key: "torre", title: "A Torre de Hércules", items: [ITEMS.torre], reward: ITEMS.torre, render: phase1 },
  { key: "ny", title: "Nova York", items: [ITEMS.postal, ITEMS.ny], reward: ITEMS.ny, render: phase2 },
  { key: "maldivas", title: "Maldivas", items: [ITEMS.maldivas], reward: ITEMS.maldivas, render: phase3 },
  { key: "voda", title: "O candado da voda", items: [ITEMS.voda], reward: ITEMS.voda, render: phase4 },
  { key: "saba", title: "O incidente da saba", items: [ITEMS.saba, ITEMS.hotel], reward: ITEMS.hotel, render: phase5 },
  { key: "friends", title: "O concurso do apartamento", items: [ITEMS.friends], reward: ITEMS.friends, render: phaseFriends },
  { key: "lua", title: "Con la luna llena", items: [ITEMS.lua], reward: ITEMS.lua, render: phase6 },
  { key: "foto", title: "Fotografía rota", items: [ITEMS.foto], reward: ITEMS.foto, render: phase7 },
  { key: "leyma", title: "Noite no Coliseum", items: [ITEMS.leyma], reward: ITEMS.leyma, render: phaseBasket },
  { key: "lentellas", title: "O xuízo das lentellas", items: [ITEMS.lentellas], reward: ITEMS.lentellas, render: phaseLentils },
  { key: "familia", title: "O arquivo familiar", items: [ITEMS.familia], reward: ITEMS.familia, render: phase8 },
  { key: "fogar", title: "O noso fogar", items: [ITEMS.fogar], reward: ITEMS.fogar, render: phaseHome },
  { key: "tempo", title: "Arquivo temporal", items: [ITEMS.tempo], reward: ITEMS.tempo, render: phase9 },
  { key: "caixa", title: "A caixa forte", items: [], reward: null, render: phase10 }
];

export const PHASES = PHASE_LIST.map((p, i) => ({ ...p, id: i + 1 }));
export const PHASE_ITEMS = Object.fromEntries(PHASES.map((p) => [p.id, p.items]));
export const getPhase = (id) => PHASES.find((p) => p.id === id);

const NUMBERS_GL = { 8: "oito", 9: "nove", 10: "dez", 11: "once", 12: "doce", 13: "trece", 14: "catorce", 15: "quince", 16: "dezaseis", 17: "dezasete", 18: "dezaoito", 19: "dezanove", 20: "vinte" };
export const numberGl = (n) => NUMBERS_GL[n] || String(n);
