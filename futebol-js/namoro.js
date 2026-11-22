/* =====================================================================
   FUTEBOL JS · namoro.js · OS ENCONTROS SEGUINTES COM A LÚCIA (arquivo SEPARADO, como barbearia.js / cinema.js)
   ---------------------------------------------------------------------
   - Registrado com FutebolJS.registrarFase({ id: 'namoro' }) só para o jogo saber baixar o arquivo; NÃO roda como fase.
     A cidade baixa em segundo plano (Fases.carregar('namoro')) e chama criar(api) com o que ela empresta (apiNamoro, cidade.js).
   - O 1º encontro continua na cidade.js (restaurante, pizzaria ou a sua casa). Os seguintes começam sempre na PORTA DA CASA DELA:
       · 2º: no dia seguinte ao 1º ela manda mensagem de manhã chamando para a CASA DELA (interiores.js 'casaLucia': gato, bolo e
         café). Café com bolo da avó, o sonho da confeitaria e o GRÃO, o gato: com a aura tranquila ele pula no seu colo e ronrona;
         puxando para problemático ele te arranha e foge. No fim, na porta, a despedida: abraço ou toca aqui.
       · 3º ('lago'): você bate, ela sai e vocês vão a pé até a ponta do píer do lago, de noite (lanternas, lua, grilos). Sentados com
         os pés para fora do píer, a conversa é sobre ELES (família, a avó do café, sonhos, medos), não sobre a cidade.
       · 4º em diante ('jantar'): só cortes, sem nenhuma fala: o caminho pela rua, o jantar no restaurante, pega-pega na praça e um
         toca aqui embaixo do poste. A despedida também é muda.
   - Os BOLOS (cidade.js decide quando; aqui só as mensagens no celular, com respostas):
       · 1º bolo (depois do 1º encontro): ela pergunta, preocupada, se aconteceu alguma coisa. Mentir: ela acredita.
         Dizer que esqueceu: −25 e ela fica brava (dá para pedir desculpas no café: cidade.js pedirDesculpasLucia).
       · 2º bolo: −50 e ela não sai mais com você (se você mentiu da outra vez, ela diz que agora tem certeza que era mentira).
   - Em toda escolha há uma GROSSERIA: −5 corações e +0,25 em Arrogante e em Problemático (api.falaGrossa, cidade.js).
   - Salvo em historia.cidade: encontros, encontroLucia { lugar, dia, hora }, conviteCasa { dia, feito }, visitouCasa, foiLago,
     luciaBolos, luciaBrava, luciaMentiu, luciaFechou.
   ===================================================================== */
(function () {
  'use strict';

  // ------------------------------------------------------------------ textos (pt, en, es, it, fr)
  const TR = {
    // porta da casa dela
    'Oi! Pontual, hein?': ['Hi! Right on time, huh?', '¡Hola! Puntual, ¿eh?', 'Ciao! Puntuale, eh?', 'Salut ! Pile à l’heure, hein ?'],
    'Achei que você tinha esquecido de mim!': ['I thought you’d forgotten about me!', '¡Pensé que te habías olvidado de mí!', 'Pensavo ti fossi dimenticato di me!', 'Je croyais que tu m’avais oubliée !'],
    'Pronta pro lugar especial?': ['Ready for the special place?', '¿Lista para el lugar especial?', 'Pronta per il posto speciale?', 'Prête pour l’endroit spécial ?'],
    'Prontíssima! Pra onde a gente vai?': ['Totally ready! Where are we going?', '¡Listísima! ¿A dónde vamos?', 'Prontissima! Dove andiamo?', 'Plus que prête ! On va où ?'],
    'Surpresa. Vem comigo.': ['It’s a surprise. Come with me.', 'Sorpresa. Ven conmigo.', 'Sorpresa. Vieni con me.', 'Surprise. Viens avec moi.'],
    'Buscar a Lúcia': ['Pick up Lucy', 'Buscar a Lucía', 'Passare a prendere Lucia', 'Aller chercher Lucie'],
    // o píer
    'Que lindo... eu moro aqui a vida toda e nunca vim no lago de noite.': ['How beautiful... I’ve lived here my whole life and never came to the lake at night.', 'Qué bonito... vivo aquí toda la vida y nunca vine al lago de noche.', 'Che bello... vivo qui da sempre e non sono mai venuta al lago di notte.', 'Que c’est beau... j’habite ici depuis toujours et je ne suis jamais venue au lac la nuit.'],
    'Eu sabia que você ia gostar.': ['I knew you’d like it.', 'Sabía que te iba a gustar.', 'Sapevo che ti sarebbe piaciuto.', 'Je savais que ça te plairait.'],
    'Eu venho aqui pra pensar.': ['I come here to think.', 'Vengo aquí a pensar.', 'Vengo qui a pensare.', 'Je viens ici pour réfléchir.'],
    'É só um lago, nada demais.': ['It’s just a lake, nothing special.', 'Es solo un lago, nada del otro mundo.', 'È solo un lago, niente di che.', 'C’est juste un lac, rien de spécial.'],
    'A-ah... você pensou em mim pra isso? Obrigada.': ['O-oh... you thought of me for this? Thank you.', 'A-ah... ¿pensaste en mí para esto? Gracias.', 'O-oh... hai pensato a me per questo? Grazie.', 'O-oh... tu as pensé à moi pour ça ? Merci.'],
    'Então obrigada por dividir o seu cantinho comigo.': ['Then thanks for sharing your little spot with me.', 'Entonces gracias por compartir tu rinconcito conmigo.', 'Allora grazie per aver condiviso il tuo angolino con me.', 'Alors merci de partager ton petit coin avec moi.'],
    'Ah... desculpa, achei que era especial.': ['Oh... sorry, I thought it was special.', 'Ah... perdón, pensé que era especial.', 'Ah... scusa, pensavo fosse speciale.', 'Ah... pardon, je croyais que c’était spécial.'],
    'Eu trouxe uma coisa... brigadeiro! A primeira fornada do meu curso de confeitaria.': ['I brought something... brigadeiros! The first batch from my baking class.', 'Traje algo... ¡brigadeiros! La primera hornada de mi curso de repostería.', 'Ho portato una cosa... brigadeiro! La prima infornata del mio corso di pasticceria.', 'J’ai apporté un truc... des brigadeiros ! La première fournée de mon cours de pâtisserie.'],
    'Tá perfeito!': ['It’s perfect!', '¡Está perfecto!', 'È perfetto!', 'C’est parfait !'],
    'Você começou o curso mesmo?': ['You really started the class?', '¿De verdad empezaste el curso?', 'Hai iniziato davvero il corso?', 'Tu as vraiment commencé le cours ?'],
    'Tá meio duro, né?': ['It’s kind of hard, isn’t it?', 'Está medio duro, ¿no?', 'È un po’ duro, no?', 'C’est un peu dur, non ?'],
    'Sério? Ai, que alívio! Eu tava morrendo de medo de você não gostar.': ['Really? Oh, what a relief! I was so scared you wouldn’t like it.', '¿En serio? ¡Ay, qué alivio! Tenía mucho miedo de que no te gustara.', 'Davvero? Ah, che sollievo! Avevo una paura che non ti piacesse.', 'C’est vrai ? Ah, quel soulagement ! J’avais trop peur que tu n’aimes pas.'],
    'Comecei! Toda terça à noite. A professora disse que eu tenho mão boa pra doce.': ['I did! Every Tuesday night. The teacher said I have a good hand for sweets.', '¡Empecé! Todos los martes a la noche. La profesora dijo que tengo buena mano para lo dulce.', 'Sì! Ogni martedì sera. L’insegnante dice che ho la mano buona per i dolci.', 'Oui ! Tous les mardis soir. La prof dit que j’ai la main pour les desserts.'],
    'Ah... é que esfriou no caminho. Da próxima eu acerto.': ['Oh... it got cold on the way. I’ll get it right next time.', 'Ah... es que se enfrió en el camino. La próxima me sale bien.', 'Ah... si è raffreddato per strada. La prossima volta lo faccio meglio.', 'Ah... il a refroidi en route. La prochaine fois je réussirai.'],
    'Sobre o que vocês conversam?': ['What do you talk about?', '¿De qué hablan?', 'Di cosa parlate?', 'De quoi vous parlez ?'],
    'Me conta da sua família.': ['Tell me about your family.', 'Cuéntame de tu familia.', 'Parlami della tua famiglia.', 'Parle-moi de ta famille.'],
    'O que você mais quer da vida?': ['What do you want most in life?', '¿Qué es lo que más quieres de la vida?', 'Cosa vuoi di più dalla vita?', 'Qu’est-ce que tu veux le plus dans la vie ?'],
    'Do que você tem medo?': ['What are you afraid of?', '¿A qué le tienes miedo?', 'Di cosa hai paura?', 'De quoi tu as peur ?'],
    'Como você veio parar no café?': ['How did you end up at the café?', '¿Cómo terminaste en el café?', 'Come sei finita al bar?', 'Comment tu t’es retrouvée au café ?'],
    'Lembra daquele dia na escola?': ['Remember that day at school?', '¿Te acuerdas de aquel día en la escuela?', 'Ti ricordi quel giorno a scuola?', 'Tu te souviens de ce jour à l’école ?'],
    'O que você pensou de mim quando me viu no café?': ['What did you think of me when you saw me at the café?', '¿Qué pensaste de mí cuando me viste en el café?', 'Cosa hai pensato di me quando mi hai visto al bar?', 'Tu as pensé quoi de moi quand tu m’as vu au café ?'],
    'Ficar só olhando o lago': ['Just watch the lake', 'Solo mirar el lago', 'Guardare il lago e basta', 'Juste regarder le lac'],
    'Meus pais moram no interior, numa chácara. Essa casa onde eu moro era da minha vó Cida.': ['My parents live in the countryside, on a small farm. The house I live in was my grandma Cida’s.', 'Mis padres viven en el interior, en una chacra. La casa donde vivo era de mi abuela Cida.', 'I miei genitori vivono in campagna, in una piccola fattoria. La casa dove abito era di mia nonna Cida.', 'Mes parents vivent à la campagne, dans une petite ferme. La maison où j’habite était à ma grand-mère Cida.'],
    'Foi ela que me ensinou a passar café no coador de pano. Toda tarde, às três horas, a casa inteira cheirava a café.': ['She taught me to make coffee with a cloth filter. Every afternoon at three, the whole house smelled of coffee.', 'Fue ella quien me enseñó a colar café en filtro de tela. Todas las tardes, a las tres, la casa entera olía a café.', 'È stata lei a insegnarmi a fare il caffè col filtro di stoffa. Ogni pomeriggio alle tre, la casa intera profumava di caffè.', 'C’est elle qui m’a appris à faire le café au filtre en tissu. Chaque après-midi à trois heures, toute la maison sentait le café.'],
    'Ela devia ser incrível.': ['She must have been amazing.', 'Debía de ser increíble.', 'Doveva essere fantastica.', 'Elle devait être incroyable.'],
    'Você sente falta dela?': ['Do you miss her?', '¿La extrañas?', 'Ti manca?', 'Elle te manque ?'],
    'Que história triste, muda de assunto.': ['What a sad story, change the subject.', 'Qué historia triste, cambia de tema.', 'Che storia triste, cambia argomento.', 'Quelle histoire triste, change de sujet.'],
    'Era. Às vezes eu ainda passo café às três só pra sentir que ela tá por perto.': ['She was. Sometimes I still make coffee at three just to feel she’s close.', 'Lo era. A veces todavía hago café a las tres solo para sentir que está cerca.', 'Lo era. A volte faccio ancora il caffè alle tre solo per sentirla vicina.', 'Oui. Parfois je fais encore du café à trois heures juste pour la sentir près de moi.'],
    'Todo dia. Mas aí eu olho pro café cheio de gente e penso que ela ia ficar orgulhosa.': ['Every day. But then I look at the café full of people and think she’d be proud.', 'Todos los días. Pero miro el café lleno de gente y pienso que estaría orgullosa.', 'Ogni giorno. Ma poi guardo il bar pieno di gente e penso che sarebbe orgogliosa.', 'Tous les jours. Mais je regarde le café plein de monde et je me dis qu’elle serait fière.'],
    'Ah... tá. Desculpa.': ['Oh... okay. Sorry.', 'Ah... vale. Perdón.', 'Ah... ok. Scusa.', 'Ah... d’accord. Pardon.'],
    'Ter a minha própria cafeteria. Com bolo saindo do forno, o Grão dormindo na vitrine... e gente feliz.': ['Having my own café. With cake coming out of the oven, Grão sleeping in the window... and happy people.', 'Tener mi propia cafetería. Con torta saliendo del horno, Grão durmiendo en la vidriera... y gente feliz.', 'Avere un bar tutto mio. Con le torte appena sfornate, Grão che dorme in vetrina... e gente felice.', 'Avoir mon propre café. Avec des gâteaux qui sortent du four, Grão qui dort dans la vitrine... et des gens heureux.'],
    'E você? O que você quer da vida?': ['And you? What do you want from life?', '¿Y tú? ¿Qué quieres de la vida?', 'E tu? Cosa vuoi dalla vita?', 'Et toi ? Qu’est-ce que tu veux dans la vie ?'],
    'Ser jogador de futebol profissional.': ['To be a professional football player.', 'Ser jugador de fútbol profesional.', 'Diventare un calciatore professionista.', 'Devenir footballeur professionnel.'],
    'Ser jogadora de futebol profissional.': ['To be a professional football player.', 'Ser jugadora de fútbol profesional.', 'Diventare una calciatrice professionista.', 'Devenir footballeuse professionnelle.'],
    'Ainda tô descobrindo.': ['I’m still figuring it out.', 'Todavía lo estoy descubriendo.', 'Lo sto ancora scoprendo.', 'Je cherche encore.'],
    'Ninguém tem nada a ver com isso.': ['That’s nobody’s business.', 'Eso no es asunto de nadie.', 'Non sono affari di nessuno.', 'Ça ne regarde personne.'],
    'Eu sabia! Então eu vou estar na arquibancada no seu primeiro jogo no estádio. Prometo.': ['I knew it! Then I’ll be in the stands at your first stadium game. I promise.', '¡Lo sabía! Entonces voy a estar en la tribuna en tu primer partido en el estadio. Lo prometo.', 'Lo sapevo! Allora sarò in tribuna alla tua prima partita allo stadio. Promesso.', 'Je le savais ! Alors je serai dans les tribunes à ton premier match au stade. Promis.'],
    'Tudo bem não saber ainda. O importante é não parar de procurar.': ['It’s okay not to know yet. What matters is not to stop looking.', 'Está bien no saber todavía. Lo importante es no dejar de buscar.', 'Va bene non saperlo ancora. L’importante è non smettere di cercare.', 'C’est normal de ne pas encore savoir. L’important, c’est de continuer à chercher.'],
    'Nossa... desculpa ter perguntado.': ['Wow... sorry I asked.', 'Vaya... perdón por preguntar.', 'Wow... scusa se te l’ho chiesto.', 'Waouh... désolée d’avoir demandé.'],
    'De ficar parada. De acordar daqui a vinte anos no mesmo lugar, fazendo a mesma coisa, sem ter tentado.': ['Of standing still. Of waking up twenty years from now in the same place, doing the same thing, without ever having tried.', 'De quedarme quieta. De despertar dentro de veinte años en el mismo lugar, haciendo lo mismo, sin haberlo intentado.', 'Di restare ferma. Di svegliarmi tra vent’anni nello stesso posto, a fare la stessa cosa, senza averci provato.', 'De rester immobile. De me réveiller dans vingt ans au même endroit, à faire la même chose, sans avoir essayé.'],
    'E... do escuro, um pouquinho. Mas isso é segredo.': ['And... of the dark, a little. But that’s a secret.', 'Y... de la oscuridad, un poquito. Pero es un secreto.', 'E... del buio, un pochino. Ma è un segreto.', 'Et... du noir, un petit peu. Mais c’est un secret.'],
    'Então da próxima eu trago uma lanterna.': ['Then next time I’ll bring a flashlight.', 'Entonces la próxima traigo una linterna.', 'Allora la prossima volta porto una torcia.', 'Alors la prochaine fois, j’apporte une lampe de poche.'],
    'Eu tenho medo de não ser bom o bastante.': ['I’m afraid of not being good enough.', 'Tengo miedo de no ser lo bastante bueno.', 'Ho paura di non essere abbastanza bravo.', 'J’ai peur de ne pas être assez bon.'],
    'Eu tenho medo de não ser boa o bastante.': ['I’m afraid of not being good enough.', 'Tengo miedo de no ser lo bastante buena.', 'Ho paura di non essere abbastanza brava.', 'J’ai peur de ne pas être assez bonne.'],
    'Medo do escuro? Que coisa de criança.': ['Afraid of the dark? How childish.', '¿Miedo a la oscuridad? Qué cosa de niños.', 'Paura del buio? Roba da bambini.', 'Peur du noir ? C’est un truc de gamin.'],
    'Haha, combinado! Uma lanterna e mais brigadeiro.': ['Haha, deal! A flashlight and more brigadeiros.', '¡Jaja, trato hecho! Una linterna y más brigadeiros.', 'Haha, affare fatto! Una torcia e altri brigadeiro.', 'Haha, marché conclu ! Une lampe de poche et encore des brigadeiros.'],
    'Você é. Eu vejo isso em você, sabia?': ['You are. I can see it in you, you know?', 'Lo eres. Lo veo en ti, ¿sabías?', 'Lo sei. Lo vedo in te, sai?', 'Tu l’es. Je le vois en toi, tu sais ?'],
    'Hunf. Todo mundo tem um medo bobo, tá?': ['Hmph. Everyone has a silly fear, okay?', 'Hmpf. Todo el mundo tiene un miedo tonto, ¿vale?', 'Hmpf. Tutti hanno una paura sciocca, ok?', 'Pff. Tout le monde a une peur idiote, d’accord ?'],
    'Eu comecei limpando mesa lá com dezesseis anos. Aí o dono antigo se aposentou, me deixou cuidando de tudo... e eu fiquei.': ['I started wiping tables there at sixteen. Then the old owner retired, left me in charge of everything... and I stayed.', 'Empecé limpiando mesas ahí a los dieciséis. Después el dueño anterior se jubiló, me dejó a cargo de todo... y me quedé.', 'Ho iniziato pulendo i tavoli lì a sedici anni. Poi il vecchio proprietario è andato in pensione, mi ha lasciato tutto in mano... e sono rimasta.', 'J’ai commencé à essuyer les tables là-bas à seize ans. Puis l’ancien patron a pris sa retraite, m’a laissé tout gérer... et je suis restée.'],
    'Você é muito corajosa.': ['You’re really brave.', 'Eres muy valiente.', 'Sei davvero coraggiosa.', 'Tu es vraiment courageuse.'],
    'Você nunca pensou em largar?': ['Have you never thought about quitting?', '¿Nunca pensaste en dejarlo?', 'Non hai mai pensato di mollare?', 'Tu n’as jamais pensé à arrêter ?'],
    'Limpando mesa? Não subiu muito, né.': ['Wiping tables? You didn’t climb very far, huh.', '¿Limpiando mesas? No subiste mucho, ¿eh?', 'Pulendo tavoli? Non hai fatto molta strada, eh.', 'Essuyer des tables ? Tu n’as pas beaucoup monté, hein.'],
    'Para... assim eu fico sem graça. Mas obrigada.': ['Stop... you’re making me blush. But thanks.', 'Para... así me da vergüenza. Pero gracias.', 'Smettila... così mi imbarazzo. Ma grazie.', 'Arrête... tu vas me faire rougir. Mais merci.'],
    'Todo dia às seis da manhã, haha. Mas aí o cheiro do café me convence de novo.': ['Every day at six in the morning, haha. But then the smell of coffee convinces me again.', 'Todos los días a las seis de la mañana, jaja. Pero el olor a café me convence otra vez.', 'Ogni giorno alle sei del mattino, haha. Ma poi l’odore del caffè mi convince di nuovo.', 'Tous les jours à six heures du matin, haha. Mais l’odeur du café me convainc à nouveau.'],
    '... Uau. Isso doeu.': ['... Wow. That hurt.', '... Guau. Eso dolió.', '... Wow. Questa ha fatto male.', '... Waouh. Ça fait mal.'],
    'Lembra que você chegou atrasado naquela aula da Dona Graça e mesmo assim acertou tudo? A sala inteira ficou de boca aberta.': ['Remember when you came late to Mrs. Graça’s class and still got everything right? The whole class was speechless.', '¿Te acuerdas de que llegaste tarde a la clase de doña Graça y aun así acertaste todo? La clase entera quedó boquiabierta.', 'Ti ricordi che sei arrivato in ritardo alla lezione della signora Graça e hai indovinato tutto lo stesso? Tutta la classe era a bocca aperta.', 'Tu te souviens que tu étais arrivé en retard au cours de Mme Graça et que tu avais quand même tout bon ? Toute la classe était bouche bée.'],
    'Lembra que você chegou atrasada naquela aula da Dona Graça e mesmo assim acertou tudo? A sala inteira ficou de boca aberta.': ['Remember when you came late to Mrs. Graça’s class and still got everything right? The whole class was speechless.', '¿Te acuerdas de que llegaste tarde a la clase de doña Graça y aun así acertaste todo? La clase entera quedó boquiabierta.', 'Ti ricordi che sei arrivata in ritardo alla lezione della signora Graça e hai indovinato tutto lo stesso? Tutta la classe era a bocca aperta.', 'Tu te souviens que tu étais arrivée en retard au cours de Mme Graça et que tu avais quand même tout bon ? Toute la classe était bouche bée.'],
    'Lembra que eu falei que ia te ajudar se você travasse na atividade? Eu fiquei a aula inteira de olho, esperando você travar, haha.': ['Remember I said I’d help you if you got stuck on the exercise? I watched you the whole class, waiting for you to get stuck, haha.', '¿Te acuerdas de que dije que te ayudaría si te trababas en la actividad? Estuve toda la clase atenta, esperando que te trabaras, jaja.', 'Ti ricordi che ti avevo detto che ti avrei aiutato se ti fossi bloccato? Ti ho tenuto d’occhio tutta la lezione, aspettando che ti bloccassi, haha.', 'Tu te souviens que j’avais dit que je t’aiderais si tu bloquais sur l’exercice ? Je t’ai surveillé tout le cours en attendant que tu bloques, haha.'],
    'Você ficou me olhando a aula inteira?': ['You were watching me the whole class?', '¿Me estuviste mirando toda la clase?', 'Mi hai guardato per tutta la lezione?', 'Tu m’as regardé pendant tout le cours ?'],
    'Eu lembro! Eu tava morrendo de vergonha.': ['I remember! I was so embarrassed.', '¡Me acuerdo! Me moría de vergüenza.', 'Mi ricordo! Morivo di vergogna.', 'Je m’en souviens ! J’étais mort de honte.'],
    'Vergonha? Você foi o assunto da escola a semana inteira, haha.': ['Embarrassed? You were the talk of the school all week, haha.', '¿Vergüenza? Fuiste el tema de la escuela toda la semana, jaja.', 'Vergogna? Sei stato l’argomento della scuola per tutta la settimana, haha.', 'La honte ? Toute l’école a parlé de toi pendant une semaine, haha.'],
    'Não lembro de nada disso.': ['I don’t remember any of that.', 'No me acuerdo de nada de eso.', 'Non mi ricordo niente di tutto questo.', 'Je ne me souviens de rien de tout ça.'],
    'Haha, fiquei! Eu queria muito ajudar alguém, sabe? Mas você nem precisou.': ['Haha, I did! I really wanted to help someone, you know? But you didn’t even need it.', '¡Jaja, sí! Tenía muchas ganas de ayudar a alguien, ¿sabes? Pero ni lo necesitaste.', 'Haha, sì! Volevo tanto aiutare qualcuno, sai? Ma non ne hai avuto nemmeno bisogno.', 'Haha, oui ! J’avais trop envie d’aider quelqu’un, tu vois ? Mais tu n’en as même pas eu besoin.'],
    'Ah... tá. Tudo bem.': ['Oh... okay. That’s fine.', 'Ah... vale. Está bien.', 'Ah... ok. Va bene.', 'Ah... d’accord. C’est pas grave.'],
    'Que você parecia ser gente boa.': ['That you seemed like a good person.', 'Que parecías buena onda.', 'Che sembravi una brava persona.', 'Que tu avais l’air sympa.'],
    'Que o café devia ser bom, pela fila.': ['That the coffee must be good, judging by the line.', 'Que el café debía de ser bueno, por la fila.', 'Che il caffè doveva essere buono, vista la fila.', 'Que le café devait être bon, vu la file.'],
    'Nada. Nem reparei em você.': ['Nothing. I didn’t even notice you.', 'Nada. Ni me fijé en ti.', 'Niente. Non ti ho nemmeno notata.', 'Rien. Je ne t’ai même pas remarquée.'],
    'Ah, que fofo! Eu acho o mesmo de você.': ['Aw, that’s sweet! I think the same about you.', '¡Ay, qué lindo! Yo pienso lo mismo de ti.', 'Oh, che carino! Io penso lo stesso di te.', 'Oh, c’est gentil ! Je pense la même chose de toi.'],
    'Haha! Pelo menos é sincero.': ['Haha! At least you’re honest.', '¡Jaja! Por lo menos eres sincero.', 'Haha! Almeno sei sincero.', 'Haha ! Au moins tu es honnête.'],
    'Haha! Pelo menos é sincera.': ['Haha! At least you’re honest.', '¡Jaja! Por lo menos eres sincera.', 'Haha! Almeno sei sincera.', 'Haha ! Au moins tu es honnête.'],
    'Ah... entendi.': ['Oh... I see.', 'Ah... entiendo.', 'Ah... capisco.', 'Ah... je vois.'],
    'Dá vontade de ficar aqui a noite toda, né?': ['Makes you want to stay here all night, right?', 'Dan ganas de quedarse aquí toda la noche, ¿no?', 'Viene voglia di restare qui tutta la notte, eh?', 'Ça donne envie de rester ici toute la nuit, hein ?'],
    'Brindar com o café da garrafa': ['Toast with the coffee from the thermos', 'Brindar con el café del termo', 'Brindare col caffè del thermos', 'Trinquer avec le café du thermos'],
    'Um brinde às noites no lago!': ['A toast to nights at the lake!', '¡Un brindis por las noches en el lago!', 'Un brindisi alle notti al lago!', 'Un toast aux soirées au lac !'],
    'E aos brigadeiros da melhor confeiteira da cidade!': ['And to the brigadeiros of the best baker in town!', '¡Y por los brigadeiros de la mejor repostera de la ciudad!', 'E ai brigadeiro della miglior pasticcera della città!', 'Et aux brigadeiros de la meilleure pâtissière de la ville !'],
    'Obrigada por me trazer aqui. Sério.': ['Thanks for bringing me here. Really.', 'Gracias por traerme aquí. En serio.', 'Grazie per avermi portata qui. Davvero.', 'Merci de m’avoir emmenée ici. Vraiment.'],
    'Ficar em silêncio olhando o lago': ['Stay quiet, watching the lake', 'Quedarse en silencio mirando el lago', 'Restare in silenzio a guardare il lago', 'Rester silencieux à regarder le lac'],
    'Tá ficando tarde, bora logo.': ['It’s getting late, let’s go already.', 'Se está haciendo tarde, vámonos ya.', 'Si sta facendo tardi, andiamo.', 'Il se fait tard, on y va.'],
    'Ah... tá. Vamos.': ['Oh... okay. Let’s go.', 'Ah... vale. Vamos.', 'Ah... ok. Andiamo.', 'Ah... d’accord. On y va.'],
    // o convite e os bolos (celular)
    'Lúcia Alves': ['Lucy Allen', 'Lucía Álvarez', 'Lucia Alberti', 'Lucie Alard'],
    'digitando...': ['typing...', 'escribiendo...', 'sta scrivendo...', 'écrit...'],
    'Visualizada': ['Seen', 'Visto', 'Visualizzato', 'Vu'],
    'Bom dia!': ['Good morning!', '¡Buen día!', 'Buongiorno!', 'Bonjour !'],
    'Ontem foi muito divertido! Obrigada pela noite.': ['Yesterday was so much fun! Thanks for the evening.', '¡Ayer fue muy divertido! Gracias por la noche.', 'Ieri è stato divertentissimo! Grazie per la serata.', 'Hier, c’était trop bien ! Merci pour la soirée.'],
    'Quer vir aqui em casa hoje à noite? Eu faço um bolo e passo um café pra gente. Às 19h?': ['Want to come over to my place tonight? I’ll bake a cake and make us some coffee. At 7 PM?', '¿Quieres venir a mi casa esta noche? Hago una torta y preparo un café para nosotros. ¿A las 19h?', 'Vuoi venire a casa mia stasera? Faccio una torta e preparo un caffè per noi. Alle 19?', 'Tu veux venir chez moi ce soir ? Je fais un gâteau et un café pour nous. À 19 h ?'],
    'Quer vir aqui em casa hoje, depois do seu turno? Eu faço um bolo e passo um café pra gente. Umas 22h15?': ['Want to come over to my place today, after your shift? I’ll bake a cake and make us some coffee. Around 10:15 PM?', '¿Quieres venir a mi casa hoy, después de tu turno? Hago una torta y preparo un café para nosotros. ¿Tipo 22:15?', 'Vuoi venire a casa mia oggi, dopo il turno? Faccio una torta e preparo un caffè per noi. Verso le 22:15?', 'Tu veux venir chez moi aujourd’hui, après ton service ? Je fais un gâteau et un café pour nous. Vers 22 h 15 ?'],
    'Claro! Vou sim.': ['Of course! I’ll be there.', '¡Claro! Voy.', 'Certo! Vengo.', 'Bien sûr ! Je viens.'],
    'Só se tiver bolo de chocolate, hein!': ['Only if there’s chocolate cake, huh!', '¡Solo si hay torta de chocolate, eh!', 'Solo se c’è la torta al cioccolato, eh!', 'Seulement s’il y a du gâteau au chocolat, hein !'],
    'Pode ser, não tenho nada melhor pra fazer mesmo.': ['Sure, I’ve got nothing better to do anyway.', 'Puede ser, no tengo nada mejor que hacer.', 'Va bene, tanto non ho niente di meglio da fare.', 'Pourquoi pas, j’ai rien de mieux à faire de toute façon.'],
    'Combinado! O Grão vai adorar te conhecer.': ['Deal! Grão is going to love meeting you.', '¡Trato hecho! A Grão le va a encantar conocerte.', 'Affare fatto! Grão sarà felicissimo di conoscerti.', 'Marché conclu ! Grão va adorer te rencontrer.'],
    'Haha, vai ter! Combinado então. O Grão vai adorar te conhecer.': ['Haha, there will be! Deal then. Grão is going to love meeting you.', '¡Jaja, va a haber! Trato hecho entonces. A Grão le va a encantar conocerte.', 'Haha, ci sarà! Affare fatto allora. Grão sarà felicissimo di conoscerti.', 'Haha, il y en aura ! Marché conclu alors. Grão va adorer te rencontrer.'],
    'Nossa... quanta empolgação. Tá, combinado então.': ['Wow... so much enthusiasm. Fine, it’s a deal then.', 'Vaya... cuánto entusiasmo. Bueno, trato hecho entonces.', 'Wow... che entusiasmo. Va bene, affare fatto allora.', 'Waouh... quel enthousiasme. Bon, d’accord alors.'],
    'Oi... o bolo tá pronto e o café já esfriou.': ['Hi... the cake is ready and the coffee is already cold.', 'Hola... la torta está lista y el café ya se enfrió.', 'Ciao... la torta è pronta e il caffè si è già raffreddato.', 'Salut... le gâteau est prêt et le café a déjà refroidi.'],
    'Oi... eu tô aqui pronta te esperando faz um tempão.': ['Hi... I’ve been ready and waiting for you for ages.', 'Hola... estoy aquí lista esperándote hace un montón.', 'Ciao... sono qui pronta ad aspettarti da un sacco.', 'Salut... je suis prête et je t’attends depuis une éternité.'],
    'Aconteceu alguma coisa? Tá tudo bem com você?': ['Did something happen? Are you okay?', '¿Pasó algo? ¿Estás bien?', 'È successo qualcosa? Stai bene?', 'Il s’est passé quelque chose ? Tu vas bien ?'],
    'Desculpa!! Minha mãe passou mal e eu fiquei no telefone com ela até agora.': ['Sorry!! My mom got sick and I was on the phone with her until now.', '¡¡Perdón!! Mi mamá se sintió mal y estuve al teléfono con ella hasta ahora.', 'Scusa!! Mia madre è stata male e sono stato al telefono con lei fino ad ora.', 'Pardon !! Ma mère a eu un malaise et j’étais au téléphone avec elle jusqu’à maintenant.'],
    'Meu celular descarregou e eu apaguei no sofá... acordei agora!': ['My phone died and I passed out on the couch... I just woke up!', '¡Se me descargó el celular y me quedé dormido en el sofá... me desperté recién!', 'Mi si è scaricato il telefono e sono crollato sul divano... mi sono appena svegliato!', 'Mon téléphone s’est déchargé et je me suis endormi sur le canapé... je viens de me réveiller !'],
    'Putz... desculpa, eu esqueci completamente.': ['Oh man... sorry, I completely forgot.', 'Uf... perdón, me olvidé por completo.', 'Accidenti... scusa, me ne sono completamente dimenticato.', 'Mince... désolé, j’ai complètement oublié.'],
    'Ah, nem deu vontade de ir.': ['Eh, I just didn’t feel like going.', 'Ah, ni ganas me dieron de ir.', 'Mah, non mi andava proprio di venire.', 'Bof, j’avais même pas envie de venir.'],
    'Nossa! E ela tá bem?': ['Oh no! Is she okay?', '¡Ay! ¿Y ella está bien?', 'Oddio! E lei sta bene?', 'Oh non ! Et elle va bien ?'],
    'Tá sim, já passou o susto. Desculpa por não avisar.': ['Yes, the scare’s over. Sorry I didn’t let you know.', 'Sí, ya pasó el susto. Perdón por no avisar.', 'Sì, lo spavento è passato. Scusa se non ti ho avvisata.', 'Oui, la frayeur est passée. Désolé de ne pas avoir prévenu.'],
    'Imagina! Família em primeiro lugar. A gente marca outro dia, tá? Melhoras pra ela.': ['Don’t worry! Family comes first. We’ll set another day, okay? Hope she feels better.', '¡Para nada! La familia primero. Quedamos otro día, ¿sí? Que se mejore.', 'Figurati! La famiglia prima di tutto. Facciamo un altro giorno, ok? Auguri a lei.', 'T’inquiète ! La famille d’abord. On prévoit un autre jour, d’accord ? Bon rétablissement à elle.'],
    'Ufa, achei que tinha acontecido alguma coisa séria!': ['Phew, I thought something serious had happened!', '¡Uf, pensé que había pasado algo grave!', 'Fiuu, pensavo fosse successo qualcosa di grave!', 'Ouf, je croyais qu’il s’était passé quelque chose de grave !'],
    'Tudo bem, acontece. Vai descansar. A gente marca outro dia, tá?': ['It’s okay, it happens. Go get some rest. We’ll set another day, okay?', 'Está bien, pasa. Ve a descansar. Quedamos otro día, ¿sí?', 'Va bene, succede. Vai a riposare. Facciamo un altro giorno, ok?', 'C’est pas grave, ça arrive. Va te reposer. On prévoit un autre jour, d’accord ?'],
    'Esqueceu?!': ['You forgot?!', '¡¿Te olvidaste?!', 'Te ne sei dimenticato?!', 'Tu as oublié ?!'],
    'Eu me arrumei toda, fiquei aqui esperando feito boba...': ['I got all dressed up, I sat here waiting like a fool...', 'Me arreglé toda, me quedé acá esperando como una tonta...', 'Mi sono preparata tutta, sono rimasta qui ad aspettare come una scema...', 'Je me suis toute préparée, j’ai attendu ici comme une idiote...'],
    'Tô com muita raiva de você agora. Nem fala comigo.': ['I’m really angry with you right now. Don’t even talk to me.', 'Estoy muy enojada contigo ahora. Ni me hables.', 'Sono arrabbiatissima con te adesso. Non parlarmi nemmeno.', 'Je suis très en colère contre toi là. Ne me parle même pas.'],
    'Nem deu vontade?!': ['You didn’t even feel like it?!', '¡¿Ni ganas te dieron?!', 'Non ti andava nemmeno?!', 'Même pas envie ?!'],
    'Sério isso? DE NOVO?': ['Seriously? AGAIN?', '¿En serio? ¿¡OTRA VEZ!?', 'Sul serio? DI NUOVO?', 'Sérieusement ? ENCORE ?'],
    'Sabe aquela desculpa da outra vez? Agora eu tenho certeza que era mentira.': ['You know that excuse from last time? Now I’m sure it was a lie.', '¿Sabes aquella excusa de la otra vez? Ahora estoy segura de que era mentira.', 'Sai quella scusa dell’altra volta? Adesso sono sicura che era una bugia.', 'Tu sais, l’excuse de l’autre fois ? Maintenant je suis sûre que c’était un mensonge.'],
    'Você tá de zoação com a minha cara, só pode.': ['You must be messing with me, there’s no other explanation.', 'Me estás tomando el pelo, no hay otra.', 'Mi stai prendendo in giro, non c’è altra spiegazione.', 'Tu te fiches de moi, c’est pas possible autrement.'],
    'Não me chama mais pra sair. Acabou.': ['Don’t ask me out anymore. It’s over.', 'No me invites más a salir. Se terminó.', 'Non chiedermi più di uscire. È finita.', 'Ne m’invite plus à sortir. C’est fini.'],
    'Lúcia, espera, eu posso explicar!': ['Lucy, wait, I can explain!', '¡Lucía, espera, puedo explicarlo!', 'Lucia, aspetta, posso spiegare!', 'Lucie, attends, je peux t’expliquer !'],
    'Desculpa... de verdade.': ['Sorry... really.', 'Perdón... de verdad.', 'Scusa... davvero.', 'Pardon... vraiment.'],
    'Tanto faz.': ['Whatever.', 'Me da igual.', 'Fa lo stesso.', 'Peu importe.'],
    'Fechar': ['Close', 'Cerrar', 'Chiudi', 'Fermer'],
    // o jantar (cortes) e a casa dela
    'Bater na porta': ['Knock on the door', 'Tocar la puerta', 'Bussare alla porta', 'Frapper à la porte'],
    'Oi! Entra, entra! Não repara a bagunça.': ['Hi! Come in, come in! Don’t mind the mess.', '¡Hola! ¡Pasa, pasa! No mires el desorden.', 'Ciao! Entra, entra! Non fare caso al disordine.', 'Salut ! Entre, entre ! Ne fais pas attention au désordre.'],
    'Senta aí no sofá que eu já trago o café e o bolo!': ['Have a seat on the couch, I’ll bring the coffee and the cake!', '¡Siéntate en el sofá que ya traigo el café y la torta!', 'Siediti sul divano che porto il caffè e la torta!', 'Assieds-toi sur le canapé, j’apporte le café et le gâteau !'],
    'Prontinho! Café passado na hora e bolo de cenoura com chocolate. Receita da minha vó.': ['All set! Freshly brewed coffee and carrot cake with chocolate. My grandma’s recipe.', '¡Listo! Café recién colado y torta de zanahoria con chocolate. Receta de mi abuela.', 'Ecco qua! Caffè appena fatto e torta di carote al cioccolato. La ricetta di mia nonna.', 'Et voilà ! Café tout juste fait et gâteau aux carottes au chocolat. La recette de ma grand-mère.'],
    'Que tal? Fala a verdade.': ['How is it? Be honest.', '¿Qué tal? Di la verdad.', 'Com’è? Dimmi la verità.', 'Alors ? Dis la vérité.'],
    'Tá incrível!': ['It’s amazing!', '¡Está increíble!', 'È incredibile!', 'C’est incroyable !'],
    'Você devia vender isso no café!': ['You should sell this at the café!', '¡Deberías vender esto en el café!', 'Dovresti venderla al bar!', 'Tu devrais vendre ça au café !'],
    'Tá meio seco, né?': ['It’s a bit dry, isn’t it?', 'Está medio seca, ¿no?', 'È un po’ secca, no?', 'Il est un peu sec, non ?'],
    'Ai, que bom! Fiquei a manhã inteira na cozinha por causa dele.': ['Oh, good! I spent the whole morning in the kitchen because of it.', '¡Ay, qué bien! Me pasé la mañana entera en la cocina por ella.', 'Ah, che bello! Ci ho passato tutta la mattina in cucina.', 'Ah, tant mieux ! J’ai passé toute la matinée en cuisine pour lui.'],
    'Sabe que eu tô pensando nisso? Bolo de pote no balcão... ia ser um sucesso.': ['You know I’ve been thinking about that? Cake jars on the counter... it would be a hit.', '¿Sabes que lo estoy pensando? Torta en frasco en el mostrador... sería un éxito.', 'Sai che ci sto pensando? Torte in barattolo sul bancone... sarebbe un successone.', 'Tu sais que j’y pense ? Des gâteaux en pot sur le comptoir... ce serait un succès.'],
    'Ah... desculpa. Da próxima eu acerto.': ['Oh... sorry. I’ll get it right next time.', 'Ah... perdón. La próxima me sale bien.', 'Ah... scusa. La prossima volta la faccio meglio.', 'Ah... pardon. La prochaine fois je le réussirai.'],
    'Essa casa era da minha vó. Quando ela foi morar com a minha tia, eu fiquei com ela... tem cheiro de café até nas paredes, haha.': ['This house was my grandma’s. When she moved in with my aunt, I kept it... it smells like coffee even in the walls, haha.', 'Esta casa era de mi abuela. Cuando se fue a vivir con mi tía, me quedé con ella... tiene olor a café hasta en las paredes, jaja.', 'Questa casa era di mia nonna. Quando è andata a vivere da mia zia, l’ho tenuta io... profuma di caffè perfino nei muri, haha.', 'Cette maison était à ma grand-mère. Quand elle est partie vivre chez ma tante, je l’ai gardée... ça sent le café jusque dans les murs, haha.'],
    'É muito aconchegante.': ['It’s really cozy.', 'Es muy acogedora.', 'È molto accogliente.', 'C’est très chaleureux.'],
    'Você mora sozinha aqui?': ['Do you live here alone?', '¿Vives sola aquí?', 'Vivi qui da sola?', 'Tu vis seule ici ?'],
    'Meio velha, né? Precisava de uma reforma.': ['Kind of old, huh? It needs a renovation.', 'Medio vieja, ¿no? Necesita una reforma.', 'Un po’ vecchia, eh? Avrebbe bisogno di una ristrutturazione.', 'Un peu vieille, non ? Il faudrait la rénover.'],
    'Que bom que você gostou. É o meu lugar preferido no mundo.': ['I’m glad you like it. It’s my favorite place in the world.', 'Qué bueno que te gustó. Es mi lugar preferido en el mundo.', 'Sono contenta che ti piaccia. È il mio posto preferito al mondo.', 'Je suis contente qu’elle te plaise. C’est mon endroit préféré au monde.'],
    'Eu e o Grão! Falando nisso... cadê aquele gato?': ['Me and Grão! Speaking of which... where’s that cat?', '¡Yo y Grão! Hablando de eso... ¿dónde está ese gato?', 'Io e Grão! A proposito... dov’è quel gatto?', 'Moi et Grão ! D’ailleurs... il est où, ce chat ?'],
    'Hunf... é a casa da minha vó, tá? Eu gosto dela assim.': ['Hmph... it’s my grandma’s house, okay? I like it this way.', 'Hmpf... es la casa de mi abuela, ¿sí? Me gusta así.', 'Hmpf... è la casa di mia nonna, ok? Mi piace così.', 'Pff... c’est la maison de ma grand-mère, d’accord ? Je l’aime comme ça.'],
    'Grão! Vem cá, vem conhecer uma pessoa muito legal...': ['Grão! Come here, come meet someone really nice...', '¡Grão! Ven, ven a conocer a alguien muy buena onda...', 'Grão! Vieni qui, vieni a conoscere una persona simpaticissima...', 'Grão ! Viens ici, viens rencontrer quelqu’un de super sympa...'],
    'Não acredito! Ele nunca sobe no colo de ninguém... às vezes nem no meu!': ['I can’t believe it! He never climbs into anyone’s lap... sometimes not even mine!', '¡No lo puedo creer! Nunca se sube al regazo de nadie... ¡a veces ni al mío!', 'Non ci credo! Non sale mai in braccio a nessuno... a volte nemmeno a me!', 'Je n’y crois pas ! Il ne monte jamais sur les genoux de personne... parfois même pas les miens !'],
    'Dizem que bicho sente quando a pessoa é boa, sabia?': ['They say animals can sense when someone is a good person, you know?', 'Dicen que los animales sienten cuando alguien es bueno, ¿sabías?', 'Si dice che gli animali sentono quando una persona è buona, sai?', 'On dit que les animaux sentent quand quelqu’un est gentil, tu savais ?'],
    'Ele é um amor.': ['He’s a sweetheart.', 'Es un amor.', 'È un amore.', 'C’est un amour.'],
    'Acho que ganhei um amigo.': ['I think I made a friend.', 'Creo que gané un amigo.', 'Credo di essermi fatto un amico.', 'Je crois que je me suis fait un ami.'],
    'Tira esse bicho de mim, vai soltar pelo na minha roupa.': ['Get this animal off me, it’s going to shed on my clothes.', 'Sácame este bicho de encima, me va a llenar la ropa de pelos.', 'Toglimi questa bestia di dosso, mi riempie i vestiti di peli.', 'Enlève-moi cette bestiole, il va mettre des poils sur mes vêtements.'],
    'Ele gostou de você de verdade. E olha que ele é bem exigente, viu?': ['He really likes you. And trust me, he’s very picky.', 'Le gustaste de verdad. Y mira que es muy exigente, ¿eh?', 'Gli piaci davvero. E guarda che è molto esigente, eh?', 'Il t’aime vraiment bien. Et crois-moi, il est très difficile.'],
    'Ah... tá. Vem, Grão. Desce.': ['Oh... okay. Come on, Grão. Get down.', 'Ah... vale. Ven, Grão. Bájate.', 'Ah... ok. Vieni, Grão. Scendi.', 'Ah... d’accord. Viens, Grão. Descends.'],
    'Ai!': ['Ouch!', '¡Ay!', 'Ahi!', 'Aïe !'],
    'Grão! Que feio! Desculpa, ele nunca fez isso com ninguém...': ['Grão! Bad cat! Sorry, he’s never done that to anyone...', '¡Grão! ¡Qué feo! Perdón, nunca le hizo eso a nadie...', 'Grão! Che brutto! Scusa, non l’ha mai fatto con nessuno...', 'Grão ! Pas bien ! Pardon, il n’a jamais fait ça à personne...'],
    'Dizem que bicho sente as coisas, né...': ['They say animals sense things, right...', 'Dicen que los animales sienten las cosas, ¿no...?', 'Si dice che gli animali sentono le cose, no...', 'On dit que les animaux sentent les choses, hein...'],
    'Tá tudo bem, foi só um arranhão.': ['It’s fine, it’s just a scratch.', 'Está todo bien, fue solo un rasguño.', 'Va tutto bene, è solo un graffio.', 'Ça va, c’est juste une griffure.'],
    'Que gato mais mal-educado.': ['What a rude cat.', 'Qué gato más maleducado.', 'Che gatto maleducato.', 'Quel chat mal élevé.'],
    'Ainda bem... ele deve estar estranhando gente nova. Me dá a mão, deixa eu ver.': ['Thank goodness... he must be wary of new people. Give me your hand, let me see.', 'Menos mal... debe de estar extrañando a la gente nueva. Dame la mano, déjame ver.', 'Meno male... deve diffidare della gente nuova. Dammi la mano, fammi vedere.', 'Heureusement... il doit se méfier des nouvelles personnes. Donne-moi ta main, laisse-moi voir.'],
    'Ele é o meu bebê... não fala assim dele.': ['He’s my baby... don’t talk about him like that.', 'Es mi bebé... no hables así de él.', 'È il mio bambino... non parlare così di lui.', 'C’est mon bébé... ne parle pas de lui comme ça.'],
    'Posso te contar um segredo? Eu quero transformar o café numa confeitaria. Com os bolos da minha vó na vitrine.': ['Can I tell you a secret? I want to turn the café into a pastry shop. With my grandma’s cakes in the display case.', '¿Te cuento un secreto? Quiero convertir el café en una repostería. Con las tortas de mi abuela en la vidriera.', 'Posso dirti un segreto? Voglio trasformare il bar in una pasticceria. Con le torte di mia nonna in vetrina.', 'Je peux te dire un secret ? Je veux transformer le café en pâtisserie. Avec les gâteaux de ma grand-mère en vitrine.'],
    'Você vai conseguir, eu tenho certeza.': ['You’ll make it, I’m sure.', 'Lo vas a lograr, estoy seguro.', 'Ce la farai, ne sono sicuro.', 'Tu vas y arriver, j’en suis sûr.'],
    'Se precisar de ajuda, pode contar comigo.': ['If you need help, you can count on me.', 'Si necesitas ayuda, puedes contar conmigo.', 'Se ti serve aiuto, puoi contare su di me.', 'Si tu as besoin d’aide, tu peux compter sur moi.'],
    'Confeitaria? Ninguém aqui vai pagar por bolo.': ['A pastry shop? Nobody here is going to pay for cake.', '¿Repostería? Aquí nadie va a pagar por una torta.', 'Una pasticceria? Qui nessuno pagherà per una torta.', 'Une pâtisserie ? Personne ici ne paiera pour du gâteau.'],
    'Obrigada... ouvir isso de você me dá coragem.': ['Thank you... hearing that from you gives me courage.', 'Gracias... escuchar eso de ti me da valor.', 'Grazie... sentirlo da te mi dà coraggio.', 'Merci... l’entendre de ta part me donne du courage.'],
    'Sério? Então quando eu abrir, o primeiro bolo é seu.': ['Really? Then when I open it, the first cake is yours.', '¿En serio? Entonces cuando abra, la primera torta es tuya.', 'Davvero? Allora quando apro, la prima torta è tua.', 'C’est vrai ? Alors quand j’ouvrirai, le premier gâteau sera pour toi.'],
    'Hunf... você vai ver só. Vai ter fila na porta.': ['Hmph... you’ll see. There’ll be a line out the door.', 'Hmpf... ya vas a ver. Va a haber fila en la puerta.', 'Hmpf... vedrai. Ci sarà la fila fuori dalla porta.', 'Pff... tu vas voir. Il y aura la queue devant la porte.'],
    'Bom... já estou indo.': ['Well... I’d better get going.', 'Bueno... ya me voy.', 'Beh... io vado.', 'Bon... je vais y aller.'],
    'Ah, já? Passou rápido demais...': ['Oh, already? That went by way too fast...', 'Ah, ¿ya? Se pasó demasiado rápido...', 'Ah, di già? È passato troppo in fretta...', 'Ah, déjà ? C’est passé beaucoup trop vite...'],
    'Obrigada por ter vindo. Volta mais vezes, tá? O Grão vai cobrar.': ['Thanks for coming. Come back more often, okay? Grão will hold you to it.', 'Gracias por venir. Vuelve más seguido, ¿sí? Grão te lo va a reclamar.', 'Grazie di essere venuto. Torna più spesso, ok? Grão lo pretenderà.', 'Merci d’être venu. Reviens plus souvent, d’accord ? Grão va te le réclamer.'],
    'E aí o Grão pulou na bancada e caiu dentro do saco de farinha... saiu branquinho, parecia um fantasma!': ['And then Grão jumped on the counter and fell right into the flour bag... he came out all white, like a little ghost!', 'Y entonces Grão saltó a la mesada y se cayó en la bolsa de harina... ¡salió blanquito, parecía un fantasma!', 'E poi Grão è saltato sul bancone ed è caduto nel sacco della farina... è uscito tutto bianco, sembrava un fantasmino!', 'Et là, Grão a sauté sur le comptoir et il est tombé dans le sac de farine... il est ressorti tout blanc, on aurait dit un petit fantôme !'],
    'Haha, faz tempo que eu não ria assim!': ['Haha, I haven’t laughed like this in ages!', '¡Jaja, hace tiempo que no me reía así!', 'Haha, era da tanto che non ridevo così!', 'Haha, ça faisait longtemps que je n’avais pas ri comme ça !'],
    'Boa noite, {0}! Até amanhã no café.': ['Good night, {0}! See you tomorrow at the café.', '¡Buenas noches, {0}! Nos vemos mañana en el café.', 'Buonanotte, {0}! Ci vediamo domani al bar.', 'Bonne nuit, {0} ! À demain au café.'],
    'Ficar mais um pouco': ['Stay a little longer', 'Quedarse un poco más', 'Restare ancora un po’', 'Rester encore un peu'],
    'O que você faz?': ['What do you do?', '¿Qué haces?', 'Cosa fai?', 'Qu’est-ce que tu fais ?'],
    'Missão: ir à casa da Lúcia às {0}.': ['Mission: go to Lucy’s house at {0}.', 'Misión: ir a la casa de Lucía a las {0}.', 'Missione: andare a casa di Lucia alle {0}.', 'Mission : aller chez Lucie à {0}.'],
    'Toca aqui': ['High five', 'Choca esos cinco', 'Batti il cinque', 'Tope là'],
  };
  for (const k of Object.keys(TR)) if (!I18N[k]) I18N[k] = TR[k];
  const fem = () => PERSONAGEM.genero === 'F';
  const pk = (l) => l[Math.floor(Math.random() * l.length)];

  // ------------------------------------------------------------------ sons (WebAudio do jogo)
  const audio = () => (typeof Som !== 'undefined' && Som.audio && !Som.mudo ? Som.audio : null);
  let RUIDO = null;
  function ruido(c) { if (RUIDO && RUIDO.sampleRate === c.sampleRate) return RUIDO; RUIDO = c.createBuffer(1, c.sampleRate * 2, c.sampleRate); const d = RUIDO.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return RUIDO; }
  const Sons = {
    bater() {                                                         // três batidas na porta de madeira
      const A = audio(); if (!A) return;
      try { const c = A.ctx, t = c.currentTime; for (const k of [0, 0.22, 0.44]) { const o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter(); o.type = 'sine'; o.frequency.setValueAtTime(170, t + k); o.frequency.exponentialRampToValueAtTime(70, t + k + 0.12); f.type = 'lowpass'; f.frequency.value = 600; g.gain.setValueAtTime(0.5, t + k); g.gain.exponentialRampToValueAtTime(0.0001, t + k + 0.16); o.connect(f); f.connect(g); g.connect(A.mestre); o.start(t + k); o.stop(t + k + 0.2); } } catch (e) { /* sem som */ }
    },
    ronronar(seg) {                                                   // ruído grave pulsando ~24 vezes por segundo
      const A = audio(); if (!A) return null;
      try {
        const c = A.ctx, t = c.currentTime, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(), lfo = c.createOscillator(), lg = c.createGain(), env = c.createGain();
        s.buffer = ruido(c); s.loop = true; f.type = 'lowpass'; f.frequency.value = 160; f.Q.value = 2;
        lfo.frequency.value = 24; lg.gain.value = 0.5; lfo.connect(lg); lg.connect(g.gain); g.gain.value = 0.5;
        env.gain.setValueAtTime(0.0001, t); env.gain.exponentialRampToValueAtTime(0.5, t + 0.6);
        if (seg) { env.gain.setValueAtTime(0.5, t + seg - 0.6); env.gain.exponentialRampToValueAtTime(0.0001, t + seg); }
        s.connect(f); f.connect(g); g.connect(env); env.connect(A.mestre); s.start(t); lfo.start(t);
        if (seg) { s.stop(t + seg + 0.1); lfo.stop(t + seg + 0.1); }
        return { parar() { try { const tt = c.currentTime; env.gain.cancelScheduledValues(tt); env.gain.setValueAtTime(Math.max(0.0001, env.gain.value), tt); env.gain.exponentialRampToValueAtTime(0.0001, tt + 0.5); s.stop(tt + 0.6); lfo.stop(tt + 0.6); } catch (e) { /* já parou */ } } };
      } catch (e) { return null; }
    },
    chiar() {                                                         // o "chhhh" do gato bravo
      const A = audio(); if (!A) return;
      try { const c = A.ctx, t = c.currentTime, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s.buffer = ruido(c); f.type = 'bandpass'; f.frequency.value = 3800; f.Q.value = 0.8; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.32, t + 0.05); g.gain.setValueAtTime(0.3, t + 0.55); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9); s.connect(f); f.connect(g); g.connect(A.mestre); s.start(t, Math.random()); s.stop(t + 1); } catch (e) { /* sem som */ }
    },
    miau(bravo) {                                                     // miado (dois osciladores com a frequência subindo e descendo)
      const A = audio(); if (!A) return;
      try { const c = A.ctx, t = c.currentTime, d = bravo ? 0.5 : 0.65; for (const [tp, v] of [['sawtooth', 0.05], ['triangle', 0.1]]) { const o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter(); o.type = tp; const b = bravo ? 420 : 620; o.frequency.setValueAtTime(b, t); o.frequency.linearRampToValueAtTime(b * 1.45, t + d * 0.35); o.frequency.linearRampToValueAtTime(b * 0.8, t + d); f.type = 'bandpass'; f.frequency.value = 1400; f.Q.value = 1.4; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.06); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(f); f.connect(g); g.connect(A.mestre); o.start(t); o.stop(t + d + 0.05); } } catch (e) { /* sem som */ }
    },
    arranhao() {
      const A = audio(); if (!A) return;
      try { const c = A.ctx, t = c.currentTime; for (const k of [0, 0.05, 0.1]) { const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s.buffer = ruido(c); f.type = 'highpass'; f.frequency.value = 2500; g.gain.setValueAtTime(0.25, t + k); g.gain.exponentialRampToValueAtTime(0.0001, t + k + 0.07); s.connect(f); f.connect(g); g.connect(A.mestre); s.start(t + k, Math.random()); s.stop(t + k + 0.08); } } catch (e) { /* sem som */ }
    },
    xicara() {                                                        // a xícara encostando no pires
      const A = audio(); if (!A) return;
      try { const c = A.ctx, t = c.currentTime; for (const f0 of [2600, 3900]) { const o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.value = f0; g.gain.setValueAtTime(0.05, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25); o.connect(g); g.connect(A.mestre); o.start(t); o.stop(t + 0.3); } } catch (e) { /* sem som */ }
    },
  };
  // a NOITE DO LAGO: grilos e a água batendo de leve nos pilares do píer (fica tocando até parar)
  function noiteDoLago() {
    const A = audio(); if (!A) return { parar() {} };
    const c = A.ctx, saida = c.createGain(); saida.gain.setValueAtTime(0.0001, c.currentTime); saida.gain.exponentialRampToValueAtTime(0.5, c.currentTime + 1.5); saida.connect(A.mestre);
    const agua = c.createBufferSource(), fa = c.createBiquadFilter(), ga = c.createGain(), lfo = c.createOscillator(), lg = c.createGain();
    agua.buffer = ruido(c); agua.loop = true; fa.type = 'lowpass'; fa.frequency.value = 420; ga.gain.value = 0.05; lfo.frequency.value = 0.35; lg.gain.value = 0.035; lfo.connect(lg); lg.connect(ga.gain);
    agua.connect(fa); fa.connect(ga); ga.connect(saida); agua.start(); lfo.start();
    const tm = setInterval(() => {                                      // um grilo de cada vez, cricrilando
      try { const t = c.currentTime + Math.random() * 0.3, f0 = 4200 + Math.random() * 900, n = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < n; i++) { const o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.value = f0; const tt = t + i * 0.065; g.gain.setValueAtTime(0.0001, tt); g.gain.exponentialRampToValueAtTime(0.012 + Math.random() * 0.01, tt + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, tt + 0.05); o.connect(g); g.connect(saida); o.start(tt); o.stop(tt + 0.06); } } catch (e) { /* sem som */ }
    }, 380);
    return { parar() { clearInterval(tm); try { const t = c.currentTime; saida.gain.cancelScheduledValues(t); saida.gain.setValueAtTime(Math.max(0.0001, saida.gain.value), t); saida.gain.exponentialRampToValueAtTime(0.0001, t + 1); agua.stop(t + 1.1); lfo.stop(t + 1.1); } catch (e) { /* já foi */ } } };
  }
  // a MÚSICA dos cortes do jantar: uma valsinha de caixinha de música (Dó · Lá menor · Fá · Sol), 84 bpm, com um pad suave
  function musicaCortes() {
    const A = audio(); if (!A) return { parar() {} };
    const c = A.ctx, saida = c.createGain(); saida.gain.setValueAtTime(0.0001, c.currentTime); saida.gain.exponentialRampToValueAtTime(0.2, c.currentTime + 1.2); saida.connect(A.mestre);
    const hz = (n) => 440 * Math.pow(2, (n - 69) / 12), PASSO = 60 / 84 / 2;
    const ACORDES = [[48, 60, 64, 67], [45, 57, 60, 64], [41, 57, 60, 65], [43, 55, 59, 62]];
    const MEL = [[76, 0, 79, 0, 77, 76], [72, 0, 0, 74, 76, 0], [77, 0, 76, 74, 72, 0], [74, 0, 71, 0, 67, 0]];
    let p = 0, prox = c.currentTime + 0.1;
    const nota = (f, t, dur, vol, tipo) => { const o = c.createOscillator(), g = c.createGain(); o.type = tipo; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(saida); o.start(t); o.stop(t + dur + 0.05); };
    const tm = setInterval(() => {
      const ate = c.currentTime + 0.2;
      while (prox < ate) {
        const cp = Math.floor(p / 6) % 4, ps = p % 6, A0 = ACORDES[cp];
        if (ps === 0) { nota(hz(A0[0]), prox, PASSO * 5.5, 0.16, 'triangle'); for (const n of A0.slice(1)) nota(hz(n), prox, PASSO * 5.8, 0.025, 'sine'); }
        if (ps === 2 || ps === 4) for (const n of A0.slice(1)) nota(hz(n + 12), prox, PASSO * 1.4, 0.02, 'triangle');
        const m = MEL[cp][ps]; if (m) { nota(hz(m), prox, PASSO * 2.2, 0.07, 'sine'); nota(hz(m + 12), prox, PASSO * 0.9, 0.018, 'triangle'); }
        prox += PASSO; p++;
      }
    }, 30);
    return { parar() { clearInterval(tm); try { const t = c.currentTime; saida.gain.cancelScheduledValues(t); saida.gain.setValueAtTime(Math.max(0.0001, saida.gain.value), t); saida.gain.exponentialRampToValueAtTime(0.0001, t + 1.2); setTimeout(() => { try { saida.disconnect(); } catch (e) { /* já foi */ } }, 1500); } catch (e) { /* já foi */ } } };
  }
  // quando quem joga é mulher, algumas falas mudam de gênero em outros idiomas (dormido/dormida, désolé/désolée...)
  const FEM_NAM = {
    'Desculpa!! Minha mãe passou mal e eu fiquei no telefone com ela até agora.': [null, null, 'Scusa!! Mia madre è stata male e sono stata al telefono con lei fino ad ora.', null],
    'Meu celular descarregou e eu apaguei no sofá... acordei agora!': [null, '¡Se me descargó el celular y me quedé dormida en el sofá... me desperté recién!', 'Mi si è scaricato il telefono e sono crollata sul divano... mi sono appena svegliata!', 'Mon téléphone s’est déchargé et je me suis endormie sur le canapé... je viens de me réveiller !'],
    'Putz... desculpa, eu esqueci completamente.': [null, null, 'Accidenti... scusa, me ne sono completamente dimenticata.', 'Mince... désolée, j’ai complètement oublié.'],
    'Tá sim, já passou o susto. Desculpa por não avisar.': [null, null, null, 'Oui, la frayeur est passée. Désolée de ne pas avoir prévenu.'],
    'Achei que você tinha esquecido de mim!': [null, null, 'Pensavo ti fossi dimenticata di me!', null],
    'Esqueceu?!': [null, null, 'Te ne sei dimenticata?!', null],
    'Lembra que eu falei que ia te ajudar se você travasse na atividade? Eu fiquei a aula inteira de olho, esperando você travar, haha.': [null, null, 'Ti ricordi che ti avevo detto che ti avrei aiutata se ti fossi bloccata? Ti ho tenuta d’occhio tutta la lezione, aspettando che ti bloccassi, haha.', 'Tu te souviens que j’avais dit que je t’aiderais si tu bloquais sur l’exercice ? Je t’ai surveillée tout le cours en attendant que tu bloques, haha.'],
    'Eu lembro! Eu tava morrendo de vergonha.': [null, null, null, 'Je m’en souviens ! J’étais morte de honte.'],
    'Vergonha? Você foi o assunto da escola a semana inteira, haha.': [null, null, 'Vergogna? Sei stata l’argomento della scuola per tutta la settimana, haha.', null],
    'Você vai conseguir, eu tenho certeza.': [null, 'Lo vas a lograr, estoy segura.', 'Ce la farai, ne sono sicura.', 'Tu vas y arriver, j’en suis sûre.'],
    'Obrigada por ter vindo. Volta mais vezes, tá? O Grão vai cobrar.': [null, null, 'Grazie di essere venuta. Torna più spesso, ok? Grão lo pretenderà.', 'Merci d’être venue. Reviens plus souvent, d’accord ? Grão va te le réclamer.'],
    'Você ficou me olhando a aula inteira?': [null, null, null, 'Tu m’as regardée pendant tout le cours ?'],
    'Acho que ganhei um amigo.': [null, null, 'Credo di essermi fatta un amico.', null],
    'Ficar em silêncio olhando o lago': [null, null, null, 'Rester silencieuse à regarder le lac'],
  };
  if (typeof FEM_TRAD !== 'undefined') for (const k of Object.keys(FEM_NAM)) if (!FEM_TRAD[k]) FEM_TRAD[k] = FEM_NAM[k];
  const G = (k) => (typeof Tg === 'function' ? Tg(k) : T(k));

  // ------------------------------------------------------------------ o CELULAR com respostas (as mensagens da Lúcia)
  //   const C = abrirChat(contato); await C.ela(txt); await C.eu(txt); const i = await C.escolher([...]); C.visto(); await C.fechar();
  function abrirChat(contato) {
    const raiz = document.getElementById('raizJogo') || document.body;
    const el = document.createElement('div'); el.id = 'nmChat';
    el.style.cssText = 'position:fixed;inset:0;z-index:30;display:grid;place-items:center;background:rgba(0,0,0,.35);padding:calc(6px + env(safe-area-inset-top,0px)) 8px calc(6px + env(safe-area-inset-bottom,0px));box-sizing:border-box;';
    const cel = document.createElement('div');
    cel.style.cssText = 'width:min(560px,94vw);height:min(440px,96vh);background:#1c1c1f;border:4px solid #3a3a3e;border-radius:18px;padding:8px;box-sizing:border-box;display:flex;flex-direction:column;gap:6px;font-family:var(--font-body);box-shadow:0 6px 0 rgba(0,0,0,.4);';
    const topo = document.createElement('div'); topo.textContent = contato;
    topo.style.cssText = 'font:700 13px/1.2 var(--font-display);color:#fff0c8;text-align:center;padding:2px 0 5px;border-bottom:2px solid #3a3a3e;flex:none;';
    const lista = document.createElement('div'); lista.style.cssText = 'flex:1;min-height:96px;display:flex;flex-direction:column;gap:5px;overflow-y:auto;overscroll-behavior:contain;padding-right:2px;';
    const botoes = document.createElement('div'); botoes.style.cssText = 'flex:none;display:grid;grid-template-columns:1fr;gap:4px;';   // 3 ou mais respostas numa tela larga: duas colunas
    cel.append(topo, lista, botoes); el.appendChild(cel); raiz.appendChild(el);
    const vivo = () => !!el.parentNode;
    const balao = (eu, txt, extra) => {
      const b = document.createElement('div'); b.textContent = txt;
      b.style.cssText = 'max-width:84%;padding:5px 8px;font:600 12px/1.3 var(--font-body);border-radius:10px;' + (eu ? 'align-self:flex-end;background:#3fa34d;color:#fff;' : 'align-self:flex-start;background:#f2f2ee;color:#1c1c1f;') + (extra || '');
      if (!lista.children.length) b.style.marginTop = 'auto';
      lista.appendChild(b); lista.scrollTop = lista.scrollHeight; try { if (typeof somClique === 'function') somClique(); } catch (e) { /* sem som */ }
      return b;
    };
    const pausa = (ms) => new Promise((r) => setTimeout(r, ms));
    return {
      async ela(txt) {
        if (!vivo()) return; const d = balao(false, T('digitando...'), 'opacity:.7;font-style:italic;');
        await pausa(650 + Math.min(1400, txt.length * 18)); if (!vivo()) return; d.remove(); balao(false, txt); await pausa(450);
      },
      async eu(txt) { if (!vivo()) return; balao(true, txt); await pausa(700); },
      escolher(ops) {
        return new Promise((ok) => {
          botoes.innerHTML = ''; botoes.style.gridTemplateColumns = ops.length >= 3 && cel.clientWidth > 420 ? '1fr 1fr' : '1fr';
          ops.forEach((o, i) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'pxBtn'; b.textContent = o; b.style.cssText = 'width:100%;height:auto;min-height:26px;padding:3px 7px;font-size:10.5px;line-height:1.18;text-transform:none;letter-spacing:0.01em;'; b.onclick = () => { botoes.innerHTML = ''; ok(i); }; botoes.appendChild(b); });
          lista.scrollTop = lista.scrollHeight;
        });
      },
      visto() { const v = document.createElement('div'); v.textContent = T('Visualizada'); v.style.cssText = 'align-self:flex-end;font:600 10px/1 var(--font-body);color:#8c9199;'; lista.appendChild(v); lista.scrollTop = lista.scrollHeight; },
      fechar() { return new Promise((ok) => { if (!vivo()) { ok(); return; } botoes.innerHTML = ''; const b = document.createElement('button'); b.type = 'button'; b.className = 'pxBtn pxPrim'; b.textContent = T('Fechar'); b.style.cssText = 'align-self:center;height:32px;min-height:0;padding:0 18px;font-size:12px;'; b.onclick = () => { el.remove(); ok(); }; botoes.appendChild(b); }); },
      remover() { el.remove(); },
    };
  }
  // som de mensagem chegando (o mesmo "plim plim" da cidade)
  function plim() {
    const A = audio(); if (!A) return;
    try { const t0 = A.ctx.currentTime + 0.01; for (const [k, f] of [[0, 1760], [0.12, 2349]]) { const o = A.ctx.createOscillator(), g = A.ctx.createGain(); o.frequency.value = f; g.gain.setValueAtTime(0.06, t0 + k); g.gain.exponentialRampToValueAtTime(0.0001, t0 + k + 0.2); o.connect(g); g.connect(A.mestre); o.start(t0 + k); o.stop(t0 + k + 0.22); } } catch (e) { /* sem som */ }
  }

  // ------------------------------------------------------------------ o GRÃO: um gato marrom-café de barriga e patinhas claras, olhos verdes
  //   Feito só com caixas (como tudo no jogo). Olha para +x, como os bonecos. Partes animadas: corpo, cabeça, orelhas, 4 patas, cauda (6 gomos).
  const COR_GATO = { pelo: '#4a2f1f', pelo2: '#5c3a26', claro: '#c99a6a', rosa: '#e89aa8', olho: '#8fdc5a', pupila: '#101010', bigode: '#f4efe2' };
  function criarGrao(guardar) {
    const mats = {}, mat = (c) => mats[c] || (mats[c] = guardar(new THREE.MeshLambertMaterial({ color: c })));
    const box = (pai, w, h, d, c, x, y, z) => { const m = new THREE.Mesh(guardar(new THREE.BoxGeometry(w, h, d)), mat(c)); m.position.set(x, y, z); pai.add(m); return m; };
    const raiz = new THREE.Group(), corpo = new THREE.Group(); corpo.position.y = 0.185; raiz.add(corpo);
    const C = COR_GATO;
    box(corpo, 0.34, 0.145, 0.15, C.pelo, 0, 0, 0);                                     // tronco
    box(corpo, 0.12, 0.155, 0.156, C.pelo2, 0.13, 0.008, 0);                            // peito
    box(corpo, 0.24, 0.03, 0.12, C.claro, 0.02, -0.07, 0);                             // barriga clara
    box(corpo, 0.05, 0.07, 0.158, C.claro, 0.19, -0.02, 0);                            // babador claro
    for (const x of [-0.08, 0, 0.08]) box(corpo, 0.03, 0.006, 0.152, C.pelo2, x, 0.074, 0);   // listras de tigrado nas costas
    const cab = new THREE.Group(); cab.position.set(0.215, 0.075, 0); corpo.add(cab);
    box(cab, 0.13, 0.12, 0.14, C.pelo, 0.02, 0.02, 0);
    box(cab, 0.05, 0.05, 0.08, C.claro, 0.095, -0.012, 0);                             // focinho
    box(cab, 0.014, 0.016, 0.024, C.rosa, 0.122, 0.01, 0);                             // nariz
    const boca = box(cab, 0.008, 0.022, 0.034, '#5a1a1a', 0.121, -0.03, 0); boca.visible = false;   // aberta quando chia
    const olhos = [];
    for (const s of [-1, 1]) {
      const o = new THREE.Group(); o.position.set(0.087, 0.045, s * 0.036); cab.add(o);
      box(o, 0.012, 0.032, 0.03, C.olho, 0, 0, 0); box(o, 0.014, 0.026, 0.009, C.pupila, 0.001, 0, 0); olhos.push(o);
      const b1 = box(cab, 0.004, 0.004, 0.085, C.bigode, 0.112, -0.012, s * 0.07); b1.rotation.x = s * 0.18;
      const b2 = box(cab, 0.004, 0.004, 0.08, C.bigode, 0.112, -0.024, s * 0.07); b2.rotation.x = -s * 0.12;
    }
    const orelhas = [];
    for (const s of [-1, 1]) {
      const o = new THREE.Group(); o.position.set(0.0, 0.08, s * 0.045); cab.add(o);
      const e = new THREE.Mesh(guardar(new THREE.ConeGeometry(0.034, 0.065, 4)), mat(C.pelo)); e.position.y = 0.03; e.rotation.y = Math.PI / 4; o.add(e);
      const i = new THREE.Mesh(guardar(new THREE.ConeGeometry(0.02, 0.045, 4)), mat(C.rosa)); i.position.set(0.011, 0.025, 0); i.rotation.y = Math.PI / 4; o.add(i);
      orelhas.push(o);
    }
    const pernas = [];
    for (const [x, z] of [[0.115, 0.045], [0.115, -0.045], [-0.12, 0.045], [-0.12, -0.045]]) {
      const p = new THREE.Group(); p.position.set(x, -0.04, z); corpo.add(p);
      box(p, 0.045, 0.13, 0.045, C.pelo, 0, -0.065, 0); box(p, 0.052, 0.026, 0.056, C.claro, 0.008, -0.132, 0);
      pernas.push(p);
    }
    const cauda = []; let pai = corpo;
    for (let i = 0; i < 6; i++) { const s = new THREE.Group(); s.position.set(i === 0 ? -0.17 : -0.052, i === 0 ? 0.035 : 0, 0); pai.add(s); box(s, 0.056, 0.034, 0.034, i === 5 ? C.claro : i % 2 ? C.pelo2 : C.pelo, -0.026, 0, 0); cauda.push(s); pai = s; }
    const sombra = new THREE.Mesh(guardar(new THREE.CircleGeometry(0.2, 12)), guardar(new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3, depthWrite: false })));
    sombra.rotation.x = -Math.PI / 2; sombra.scale.set(1.25, 0.7, 1);
    return { raiz, corpo, cab, olhos, orelhas, pernas, cauda, boca, sombra, x: 0, y: 0, z: 0, yaw: 0, estado: 'dorme', t: 0, fase: 0, rota: null, vel: 0.7, pulo: null, piscar: 2 };
  }
  // a pose do gato (todo quadro). G.estado: dorme | deita | colo | senta | anda | corre | pula | arrepia | arranha | esfrega | estica
  function poseGrao(G, dt) {
    G.t += dt; const t = G.t, e = G.estado, c = G.corpo, P = G.pernas, cab = G.cab;
    c.rotation.set(0, 0, 0); c.position.set(0, 0.185, 0); c.scale.set(1, 1, 1); cab.rotation.set(0, 0, 0); cab.position.set(0.215, 0.075, 0);
    for (const p of P) { p.rotation.set(0, 0, 0); p.scale.set(1, 1, 1); p.position.y = -0.04; }
    for (const o of G.orelhas) o.rotation.set(0, 0, 0);
    G.boca.visible = false;
    let abre = 1;                                                         // olhos: 1 aberto, 0.15 fechado
    const caudaCurva = (base, onda, vel, amp) => { G.cauda.forEach((s, i) => { s.rotation.set(0, i === 0 ? 0 : Math.sin(t * vel + i * 0.7) * amp, i === 0 ? base : onda + Math.sin(t * vel * 0.8 + i) * amp * 0.4); s.scale.set(1, 1, 1); }); };
    if (e === 'dorme' || e === 'colo' || e === 'deita') {               // enrolado: barriga no chão, patas para dentro, cauda abraçando
      c.position.y = 0.082; c.scale.y = 1 + Math.sin(t * (e === 'colo' ? 2.4 : 1.6)) * 0.035;
      if (e === 'colo') c.position.y += Math.sin(t * 150) * 0.0012;        // o tremidinho do ronrono
      for (const [i, p] of P.entries()) { p.rotation.z = i < 2 ? 1.2 : -1.2; p.scale.y = 0.38; p.position.y = -0.045; }   // as patas dobradas embaixo do corpo
      cab.position.set(0.2, e === 'deita' ? 0.05 : 0.0, e === 'deita' ? 0 : 0.02); cab.rotation.z = e === 'deita' ? 0.05 : -0.18; cab.rotation.x = e === 'deita' ? 0 : 0.22;
      const lado = G.caudaLado || 1; G.cauda.forEach((s, i) => { s.rotation.set(0, (i === 0 ? 0.9 : 0.42) * lado, i === 0 ? -0.35 : 0); });
      if (e !== 'deita') abre = 0.15;
    } else if (e === 'senta') {                                          // sentado: frente levantada, cauda enrolada no chão
      c.rotation.z = 0.55; c.position.set(-0.03, 0.17, 0);
      P[0].rotation.z = P[1].rotation.z = -0.55; P[2].rotation.z = P[3].rotation.z = 0.95; P[2].position.y = P[3].position.y = -0.05;
      cab.rotation.z = -0.5 + Math.sin(t * 0.7) * 0.06; cab.rotation.y = Math.sin(t * 0.45) * 0.25;
      G.cauda.forEach((s, i) => { s.rotation.set(0, i === 0 ? 0.6 : 0.35 + Math.sin(t * 1.5 + i) * 0.08, i === 0 ? -1.0 : 0); });
    } else if (e === 'anda' || e === 'corre' || e === 'esfrega') {
      const vel = e === 'corre' ? 15 : 7.5, amp = e === 'corre' ? 0.85 : 0.5; G.fase += dt * vel; const s = Math.sin(G.fase);
      P[0].rotation.z = s * amp; P[3].rotation.z = s * amp; P[1].rotation.z = -s * amp; P[2].rotation.z = -s * amp;
      c.position.y = 0.185 + Math.abs(Math.cos(G.fase)) * (e === 'corre' ? 0.025 : 0.01) - (e === 'corre' ? 0.02 : 0);
      if (e === 'esfrega') { c.rotation.x = Math.sin(t * 3) * 0.18; cab.rotation.x = Math.sin(t * 3) * 0.35; }
      caudaCurva(e === 'corre' ? 0.2 : 1.25, -0.25, 3, 0.18);
    } else if (e === 'pula') {                                           // no ar: patas da frente esticadas, as de trás empurrando
      const k = G.pulo ? G.pulo.k : 0.5;
      P[0].rotation.z = P[1].rotation.z = 0.9 - k * 0.4; P[2].rotation.z = P[3].rotation.z = -1.1 + k * 0.3;
      c.rotation.z = 0.35 - k * 0.7; caudaCurva(0.5, 0, 2, 0.05);
    } else if (e === 'arrepia' || e === 'arranha') {                    // bravo: costas arqueadas, pelo da cauda arrepiado, orelhas para trás
      c.position.y = 0.23; c.scale.y = 1.12;
      for (const [i, p] of P.entries()) { p.rotation.z = i < 2 ? -0.18 : 0.18; p.scale.y = 1.25; }
      cab.rotation.z = -0.15; cab.position.set(0.2, 0.05, 0);
      for (const [i, o] of G.orelhas.entries()) o.rotation.x = (i ? 1 : -1) * 0.9;
      G.cauda.forEach((s, i) => { s.rotation.set(0, Math.sin(t * 9 + i) * 0.05, i === 0 ? 1.45 : 0.04); s.scale.set(1, 1.7, 1.7); });
      G.boca.visible = Math.sin(t * 3) > -0.3;
      if (e === 'arranha') { const k = G.patada || 0; P[0].rotation.z = -0.18 + Math.sin(Math.min(1, k) * Math.PI) * 1.6; P[0].rotation.x = Math.sin(Math.min(1, k) * Math.PI) * 0.4; }
    } else if (e === 'estica') {                                         // espreguiçando ao acordar
      const k = Math.min(1, G.tEst || 0);
      c.rotation.z = -0.35 * Math.sin(k * Math.PI); P[0].rotation.z = P[1].rotation.z = 0.9 * Math.sin(k * Math.PI); c.position.y = 0.17;
      caudaCurva(1.3, 0, 2, 0.1);
    }
    G.piscar -= dt; if (G.piscar < 0) { if (G.piscar < -0.12) G.piscar = 2 + Math.random() * 3; abre = Math.min(abre, 0.15); }
    for (const o of G.olhos) o.scale.y = abre;
    G.raiz.position.set(G.x, G.y, G.z); G.raiz.rotation.y = G.yaw;
    G.sombra.position.set(G.x, (G.sombraY != null ? G.sombraY : 0) + 0.012, G.z); G.sombra.rotation.z = 0; G.sombra.visible = !G.oculto; G.raiz.visible = !G.oculto;
  }
  // movimento do gato: rota (andando/correndo) e pulo (parábola) — chama quando chega
  function moverGrao(G, dt) {
    if (G.pulo) {
      const P = G.pulo; P.t += dt; const k = Math.min(1, P.t / P.dur); P.k = k;
      G.x = P.x0 + (P.x1 - P.x0) * k; G.z = P.z0 + (P.z1 - P.z0) * k; G.y = P.y0 + (P.y1 - P.y0) * k + Math.sin(k * Math.PI) * P.h;
      G.sombraY = k < 0.5 ? P.y0 : P.y1;
      if (k >= 1) { G.pulo = null; G.y = P.y1; G.sombraY = P.y1; G.estado = P.depois || 'senta'; if (P.ok) P.ok(); }
      return;
    }
    if (G.rota && G.rota.length) {
      const q = G.rota[0], dx = q.x - G.x, dz = q.z - G.z, d = Math.hypot(dx, dz), v = G.vel * dt;
      const alvo = Math.atan2(-dz, dx); let da = alvo - G.yaw; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI; G.yaw += da * Math.min(1, dt * 9);
      if (d <= v) { G.x = q.x; G.z = q.z; G.rota.shift(); if (!G.rota.length) { G.estado = G.depois || 'senta'; const ok = G.rotaOk; G.rotaOk = null; if (ok) ok(); } }
      else { G.x += dx / d * v; G.z += dz / d * v; }
    }
  }

  // ------------------------------------------------------------------ as roupas dela em cada encontro (fase2.js ROUPAS.F: 7 blusa de manga longa e calça · 10 jardineira · 4 moletom e legging)
  const ROUPA_LAGO = [7, ['#e9a3c4', '#2a3f66', '#f2f2ee', '#f2f2ee']];
  const ROUPA_JANTAR = [10, ['#f2f2ee', '#4a6fa5', '#f2c230', '#f2f2ee']];
  const ROUPA_CASA = [4, ['#d9b48a', '#4a3226', '#f2f2ee', '#f2f2ee']];
  const yawPara = (dx, dz) => Math.atan2(-dz, dx);

  function criar(api) {
    const S = api.S, fala = api.fala, esperar = api.esperar, preto = api.preto, andar = api.andar;
    const M = { props: [], luzes: [], ocultos: [], G: null, L: null, R: null, roda: null, reflexo: null, ronrono: null, sons: [] };
    const dados = () => S().dados;
    const hud = (esconde) => { const U = api.UI(); if (U) { U.ctl.hidden = esconde; } };
    function comecar() {
      const s = S(), J = s.jog; s.modo = 'cena'; s.encontroRodando = true; hud(true); api.aviso('');
      J.andando = false; J.correndo = false; J.rota = null; if (J.sentado) api.levantar();
      s.missao = ''; api.recolherMissao(); api.definirMarca(null);
    }
    function terminar() { const s = S(); if (!s) return; s.encontroRodando = false; api.camCena(null); }
    const cam = (c) => api.camCena(c);
    function prop(o, pai) { (pai || S().grupo).add(o); M.props.push(o); return o; }
    function luz(cor, forca, alcance, x, y, z, pai) { const l = new THREE.PointLight(cor, forca, alcance); l.position.set(x, y, z); (pai || S().grupo).add(l); M.luzes.push(l); return l; }
    function limparProps() {
      for (const o of M.props) if (o.parent) o.parent.remove(o);
      for (const l of M.luzes) if (l.parent) l.parent.remove(l);
      M.props = []; M.luzes = []; M.reflexo = null; M.luzPorta = null;
    }
    function apagarPorta() { const l = M.luzPorta; if (!l) return; if (l.parent) l.parent.remove(l); M.luzes = M.luzes.filter((x) => x !== l); M.luzPorta = null; }
    const geo = () => new api.Geo();
    const malha = (G) => G.malha(api.MAT);
    // some com quem estiver perto da cena (a cidade redesenha pelo S.meus: o tick tira de novo a cada quadro) e devolve depois
    function esconderPerto(x, z, r, menos) {
      for (const A of S().npcs) if (!A.oculto && !(menos || []).includes(A) && Math.hypot(A.x - x, A.z - z) < r && !M.ocultos.includes(A)) M.ocultos.push(A);
    }
    function devolverOcultos() { const s = S(); for (const A of M.ocultos) { if (!A.oculto && A.m) { s.meus.add(A.m); if (A.blob) A.blob.visible = true; } } M.ocultos = []; }
    const sumir = (A) => { A.nmSome = true; S().meus.delete(A.m); A.blob.visible = false; };
    const aparecer = (A) => { A.nmSome = false; S().meus.add(A.m); A.blob.visible = true; };
    // no chão: a altura do terreno (a cidade tem calçadas e rampas)
    const chao = (A) => { A.y = api.altura(A.x, A.z); };
    function sentarEm(A, x, z, yaw, h, y) { A.sentado = true; A.x = x; A.z = z; A.y = y || 0; A.assento = h; A.yaw = A.yawAlvo = yaw; A.andando = false; A.correndo = false; A.rota = null; }
    function levantarAtor(A, x, z) { A.sentado = false; A.assento = 0.52; if (x != null) { A.x = x; A.z = z; } chao(A); }
    // os dois andando lado a lado (ela à DIREITA dele), com 0,7 m entre os dois: os braços balançando não se encostam
    function ladoAlado(J, L, de, ate, vel) {
      const dx = ate[0] - de[0], dz = ate[1] - de[1], n = Math.hypot(dx, dz) || 1, fx = dx / n, fz = dz / n, rx = -fz, rz = fx, y = yawPara(fx, fz), E = 0.7;
      J.x = de[0]; J.z = de[1]; L.x = de[0] + rx * E; L.z = de[1] + rz * E; chao(J); chao(L); J.yaw = J.yawAlvo = L.yaw = L.yawAlvo = y;
      J.gesto = L.gesto = null;
      return Promise.all([andar(J, [ate], vel), andar(L, [[ate[0] + rx * E, ate[1] + rz * E]], vel)]);
    }
    // a xícara, o brigadeiro, a bandeja: na FRENTE da mão, encostando na pontinha (presos no antebraço: a mão termina em y = −0,65 do ombro)
    function naPonta(A, lado, obj) { const b = lado === 'E' ? A.m.bracoE : A.m.bracoD, ant = b.cotovelo || b; obj.position.set(0, -0.65 - (b.cotovelo ? b.cotovelo.position.y : 0), 0); ant.add(obj); M.props.push(obj); return obj; }
    function soltarDaMao(obj) { if (obj && obj.parent) obj.parent.remove(obj); }
    function xicaraMesh(cor) {
      const G = geo(); G.box(0.075, 0.085, 0.075, cor, 0, 0, 0); G.box(0.064, 0.008, 0.064, '#3a2213', 0, 0.079, 0); G.box(0.012, 0.045, 0.03, cor, 0, 0.02, 0.048);   // a caneca, o café e a alça
      const m = malha(G), g = new THREE.Group(); m.position.set(0.045, -0.015, 0); g.add(m); return g;    // a caneca fica à frente da ponta dos dedos (x+ = para a frente da mão)
    }

    // ---------------------------------------------------------------- GESTOS das cenas (a cidade chama antes dos dela: true = tratado)
    function gesto(A, g, m, t) {
      if (!g || typeof g !== 'string') return false;
      if (g === 'pier') { gestoPier(A, m, t); return true; }
      if (g === 'brinde') {                                             // sentado no píer, a caneca erguida na frente do peito
        m.bracoD.rotation.z = 1.45; m.bracoD.rotation.x = 0.22; usarCotovelo(m.bracoD, 0, 0.62);
        if (A.xicara) { A.xicara.rotation.z = -(1.45 + 0.62); A.xicara.rotation.x = -0.22; }
        if (A.pier) gestoPier(A, m, t);
        return true;
      }
      if (g === 'xicara') {                                             // a caneca na mão, na altura do peito; de vez em quando um gole
        const gole = Math.max(0, Math.sin(t * 0.9 + (A.fase || 0))) > 0.93 ? 1 : 0; A.kGole = (A.kGole || 0) + (gole - (A.kGole || 0)) * 0.08;
        const oz = 0.85 + A.kGole * 0.42, cz = 1.15 + A.kGole * 0.35; m.bracoD.rotation.z = oz; m.bracoD.rotation.x = 0.32; usarCotovelo(m.bracoD, 0, cz);
        if (A.xicara) { A.xicara.rotation.z = -(oz + cz) + 0.0 - A.kGole * 0.4; A.xicara.rotation.x = -0.32; }
        if (m.cabecaLigada) usarCabeca(m, A.kGole * 0.1);
        if (A.pier) gestoPier(A, m, t);
        return true;
      }
      if (g === 'bandeja') {                                            // as duas mãos embaixo da bandeja, na frente da barriga
        for (const [b, s] of [[m.bracoE, -1], [m.bracoD, 1]]) { b.rotation.z = 0.62; b.rotation.x = s * 0.28; usarCotovelo(b, 0, 0.95); }
        if (A.bandeja) A.bandeja.rotation.z = -(0.62 + 0.95);
        return true;
      }
      if (g === 'bate') { m.bracoD.rotation.z = 1.3; m.bracoD.rotation.x = 0.1; usarCotovelo(m.bracoD, 0, 1.25 + 0.3 * Math.max(0, Math.sin(t * 13))); return true; }
      if (g === 'carinho') {                                            // fazendo carinho no gato deitado no colo
        const k = Math.sin(t * 2.6); m.bracoD.rotation.z = -0.3 + k * 0.07; m.bracoD.rotation.x = 1.05; usarCotovelo(m.bracoD, 0, 1.35 - k * 0.1);   // a mão direita alisa as costas dele
        m.bracoE.rotation.z = -0.6; m.bracoE.rotation.x = -1.1; usarCotovelo(m.bracoE, 0, 1.6); if (m.cabecaLigada) usarCabeca(m, -0.22);          // a esquerda descansa em cima dele
        return true;
      }
      if (g === 'estende') { m.bracoD.rotation.z = 0.62; m.bracoD.rotation.x = 0.1; usarCotovelo(m.bracoD, 0, 0.12); m.corpo.rotation.z = -0.12; if (m.cabecaLigada) usarCabeca(m, -0.3); return true; }
      if (g === 'susto') { m.bracoD.rotation.z = 1.05; m.bracoD.rotation.x = 0.35; usarCotovelo(m.bracoD, 0, 2.0); m.corpo.rotation.z = 0.12; if (m.cabecaLigada) usarCabeca(m, 0.08); return true; }
      if (g === 'timida') {                                             // as mãos juntas no colo, a cabeça baixa
        for (const [b, s] of [[m.bracoE, -1], [m.bracoD, 1]]) { b.rotation.z = 0.5; b.rotation.x = s * 0.42; usarCotovelo(b, 0, 0.55); }
        if (m.cabecaLigada) { usarCabeca(m, -0.3); m.cabeca.rotation.x = 0.12; } A.nmTilt = true;
        return true;
      }
      if (g === 'oferece') {                                            // estendendo a caixinha de brigadeiro com as duas mãos
        for (const [b, s] of [[m.bracoE, -1], [m.bracoD, 1]]) { b.rotation.z = 1.0; b.rotation.x = s * 0.36; usarCotovelo(b, 0, 0.45); }
        if (A.caixa) A.caixa.rotation.z = -(1.0 + 0.45);
        if (A.pier) gestoPier(A, m, t);
        return true;
      }
      if (g === 'come') {                                               // leva o brigadeiro à boca
        const k = Math.max(0, Math.sin(t * 2.2)); m.bracoD.rotation.z = 1.0 + k * 0.32; m.bracoD.rotation.x = 0.3; usarCotovelo(m.bracoD, 0, 1.3 + k * 0.4);
        if (A.pier) gestoPier(A, m, t);
        return true;
      }
      if (g === 'balcao') { for (const [b, s] of [[m.bracoE, -1], [m.bracoD, 1]]) { b.rotation.z = 0.9 + Math.sin(t * 6 + s) * 0.08; b.rotation.x = s * 0.2; usarCotovelo(b, 0, 0.5); } return true; }
      if (g === 'riPier') { if (A.pier) gestoPier(A, m, t); m.corpo.rotation.z = 0.06 + Math.sin(t * 19) * 0.03; if (m.cabecaLigada) usarCabeca(m, 0.15 + Math.sin(t * 19) * 0.03); return true; }
      return false;
    }
    // sentado na ponta do píer: as pernas para fora, balançando devagar (uma de cada vez)
    function gestoPier(A, m, t) {
      const s = Math.sin(t * 1.3 + (A.fase || 0)) * 0.18;
      m.pernaE.rotation.z = m.pernaD.rotation.z = 1.5; usarJoelhos(m, -0.95 + s, -0.95 - s);
    }

    // ================================================================ BOLOS: a mensagem no celular (cidade.js checarFaltaEncontro decide quando)
    async function mensagemBolo(n, F) {
      const s = S(), d = s.dados, eraLivre = s.modo === 'livre';
      if (eraLivre) { s.modo = 'cena'; hud(true); s.jog.andando = false; s.jog.correndo = false; }
      plim(); await esperar(700);
      const C = abrirChat(T('Lúcia Alves')); let depois = null;
      try {
        if (n <= 1) {                                                   // o 1º bolo depois de já terem saído: preocupada
          await C.ela(F && F.lugar === 'casaLucia' ? T('Oi... o bolo tá pronto e o café já esfriou.') : T('Oi... eu tô aqui pronta te esperando faz um tempão.'));
          await C.ela(T('Aconteceu alguma coisa? Tá tudo bem com você?'));
          const ops = ['Desculpa!! Minha mãe passou mal e eu fiquei no telefone com ela até agora.', 'Meu celular descarregou e eu apaguei no sofá... acordei agora!', 'Putz... desculpa, eu esqueci completamente.', 'Ah, nem deu vontade de ir.'];
          const r = await C.escolher(ops.map(G));
          await C.eu(G(ops[r]));
          if (r === 0) { await C.ela(T('Nossa! E ela tá bem?')); await C.eu(G('Tá sim, já passou o susto. Desculpa por não avisar.')); await C.ela(T('Imagina! Família em primeiro lugar. A gente marca outro dia, tá? Melhoras pra ela.')); d.luciaMentiu = true; }
          else if (r === 1) { await C.ela(T('Ufa, achei que tinha acontecido alguma coisa séria!')); await C.ela(T('Tudo bem, acontece. Vai descansar. A gente marca outro dia, tá?')); d.luciaMentiu = true; }
          else {
            await C.ela(r === 3 ? T('Nem deu vontade?!') : G('Esqueceu?!'));
            await C.ela(T('Eu me arrumei toda, fiquei aqui esperando feito boba...'));
            await C.ela(T('Tô com muita raiva de você agora. Nem fala comigo.'));
            depois = () => { api.Amizade.somar('lucia', -25); d.luciaBrava = true; if (r === 3) api.grosseria('lucia'); };
          }
        } else {                                                        // o 2º bolo: acabou
          await C.ela(T('Sério isso? DE NOVO?'));
          if (d.luciaMentiu) await C.ela(T('Sabe aquela desculpa da outra vez? Agora eu tenho certeza que era mentira.'));
          await C.ela(T('Você tá de zoação com a minha cara, só pode.'));
          await C.ela(T('Não me chama mais pra sair. Acabou.'));
          const ops = [T('Lúcia, espera, eu posso explicar!'), T('Desculpa... de verdade.'), T('Tanto faz.')];
          const r = await C.escolher(ops);
          await C.eu(ops[r]); await esperar(900); C.visto();
          depois = () => { api.Amizade.somar('lucia', -50); d.luciaFechou = true; d.luciaBrava = true; if (r === 2) api.grosseria('lucia'); };
        }
        await C.fechar();
      } catch (e) { console.error(e); C.remover(); }
      if (depois) depois();
      api.gravar(d.ponto || 'chegada');
      if (eraLivre && S() && S().modo === 'cena') api.liberar();
    }

    // ================================================================ O CONVITE para a casa dela (de manhã, no dia seguinte ao 1º encontro)
    async function convite() {
      const s = S(), d = s.dados, eraLivre = s.modo === 'livre';
      d.conviteCasa.feito = true;
      if (eraLivre) { s.modo = 'cena'; hud(true); s.jog.andando = false; s.jog.correndo = false; }
      plim(); await esperar(700);
      const tarde = api.empregoEscolhido() === 'mercado';               // o turno do mercado vai até as 22h
      const hora = tarde ? 22.25 : 19;
      const C = abrirChat(T('Lúcia Alves')); let grosso = false;
      try {
        await C.ela(T('Bom dia!'));
        await C.ela(T('Ontem foi muito divertido! Obrigada pela noite.'));
        await C.ela(tarde ? T('Quer vir aqui em casa hoje, depois do seu turno? Eu faço um bolo e passo um café pra gente. Umas 22h15?') : T('Quer vir aqui em casa hoje à noite? Eu faço um bolo e passo um café pra gente. Às 19h?'));
        const ops = [T('Claro! Vou sim.'), T('Só se tiver bolo de chocolate, hein!'), T('Pode ser, não tenho nada melhor pra fazer mesmo.')];
        const r = await C.escolher(ops); await C.eu(ops[r]);
        if (r === 2) { await C.ela(T('Nossa... quanta empolgação. Tá, combinado então.')); grosso = true; }
        else await C.ela(r === 1 ? T('Haha, vai ter! Combinado então. O Grão vai adorar te conhecer.') : T('Combinado! O Grão vai adorar te conhecer.'));
        await C.fechar();
      } catch (e) { console.error(e); C.remover(); }
      if (grosso) api.grosseria('lucia');
      d.encontroLucia = { lugar: 'casaLucia', dia: d.dia || 1, hora, liberado: false };
      api.gravar(d.ponto || 'chegada');
      if (eraLivre && S() && S().modo === 'cena') api.liberar();
      try { api.mostrarAgendaEncontro(); } catch (e) { /* ok */ }
    }

    // ================================================================ NA PORTA DELA: você bate, ela sai (vale para o lago, o jantar e a casa)
    async function naPorta(E, roupa, mudo) {
      const s = S(), J = s.jog, C = api.casaAlves();
      const sg = Math.sign(C.sz - C.z) || 1, frente = C.z + sg * 0.95;
      const L = api.criarLuciaEncontro(roupa); M.L = L;
      L.x = C.x; L.z = C.z + sg * 0.22; chao(L); L.yaw = L.yawAlvo = yawPara(0, sg); sumir(L);
      if (!M.luzPorta) M.luzPorta = luz(0xffd9a0, 1.4, 9, C.x, 2.6, C.z + sg * 0.6);   // a luz da varanda (é de noite)
      cam({ px: C.x, py: 1.75, pz: frente + sg * 4.4, tx: C.x, ty: 0.95, tz: frente });   // de frente para a porta: os dois de perfil, um olhando para o outro
      if (Math.hypot(J.x - (C.x + 0.46), J.z - frente) > 0.2) await andar(J, [[C.x + 0.46, frente]], 1.8);
      J.yawAlvo = yawPara(0, -sg); await esperar(350);
      J.gesto = 'bate'; Sons.bater(); await esperar(800); J.gesto = null; await esperar(900);
      aparecer(L); await andar(L, [[C.x - 0.46, frente]], 1.3);
      L.yawAlvo = yawPara(1, sg * 0.75); J.yawAlvo = yawPara(-1, sg * 0.75);   // um de frente para o outro, abertos um pouco para a câmera (três quartos)
      await esperar(300);
      if (mudo) { L.gesto = 'acena'; await esperar(1300); L.gesto = null; return { L, C, sg, frente }; }
      return { L, C, sg, frente };
    }

    // ================================================================ 3º ENCONTRO: o píer do lago, de noite
    function montarPier() {
      const P = api.PIER, xP = P.x0, zM = (P.z0 + P.z1) / 2, yD = 0.42;
      // lanternas (vidro aceso com uma velinha) nas duas quinas da ponta e uma no meio do píer
      for (const [x, z] of [[xP + 0.18, P.z0 + 0.14], [xP + 0.18, P.z1 - 0.14], [xP + 6.5, P.z1 - 0.14]]) {
        const Gl = geo(); Gl.box(0.16, 0.03, 0.16, '#2a2a2e', 0, 0, 0); Gl.box(0.13, 0.2, 0.13, '#ffe7a8', 0, 0.03, 0); Gl.box(0.16, 0.03, 0.16, '#2a2a2e', 0, 0.23, 0); Gl.box(0.03, 0.06, 0.03, '#2a2a2e', 0, 0.26, 0);
        for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) Gl.box(0.015, 0.2, 0.015, '#2a2a2e', a * 0.07, 0.03, b * 0.07);
        const m = new THREE.Mesh(Gl.malha(api.MAT).geometry, new THREE.MeshBasicMaterial({ vertexColors: true })); m.position.set(x, yD, z); prop(m);
        luz(0xffc070, 1.25, 5.5, x, yD + 0.2, z);
      }
      // a garrafa térmica, duas canequinhas e a caixinha de brigadeiro entre os dois
      const Gt = geo(); Gt.box(0.1, 0.26, 0.1, '#c8352b', 0, 0, 0); Gt.box(0.11, 0.04, 0.11, '#e8e8e0', 0, 0.26, 0); Gt.box(0.06, 0.035, 0.06, '#1c1c1f', 0, 0.3, 0);
      Gt.box(0.06, 0.07, 0.06, '#f2f2ee', 0.12, 0, 0.1); Gt.box(0.05, 0.006, 0.05, '#3a2213', 0.12, 0.066, 0.1); Gt.box(0.06, 0.07, 0.06, '#f2c230', 0.12, 0, -0.1); Gt.box(0.05, 0.006, 0.05, '#3a2213', 0.12, 0.066, -0.1);
      const tm = malha(Gt); tm.position.set(xP + 0.55, yD, zM - 0.02); prop(tm);
      // a LUA lá no oeste, por cima do lago, e o reflexo dela na água; estrelas
      const cv = document.createElement('canvas'); cv.width = cv.height = 32; const g = cv.getContext('2d');
      g.fillStyle = 'rgba(255,248,214,0.18)'; g.beginPath(); g.arc(16, 16, 15, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#fff8d8'; g.beginPath(); g.arc(16, 16, 10, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#e8dcae'; for (const [x, y, r] of [[12, 13, 2.2], [19, 18, 2.8], [14, 20, 1.4], [20, 11, 1.2]]) { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
      const tx = new THREE.CanvasTexture(cv); tx.magFilter = tx.minFilter = THREE.NearestFilter; tx.generateMipmaps = false;
      const lua = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, transparent: true, fog: false, depthWrite: false })); lua.scale.set(14, 14, 1); lua.position.set(xP - 92, 26, zM + 4); prop(lua);
      const rv = document.createElement('canvas'); rv.width = 16; rv.height = 64; const r2 = rv.getContext('2d');
      for (let y = 0; y < 64; y += 2) { const w = 3 + Math.random() * 10, a = 0.25 + Math.random() * 0.5; r2.fillStyle = 'rgba(255,240,190,' + a + ')'; r2.fillRect(8 - w / 2, y, w, 1); }
      const txr = new THREE.CanvasTexture(rv); txr.magFilter = txr.minFilter = THREE.NearestFilter; txr.wrapT = THREE.RepeatWrapping; txr.generateMipmaps = false;
      const refl = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 34), new THREE.MeshBasicMaterial({ map: txr, transparent: true, opacity: 0.6, depthWrite: false, fog: false }));
      refl.rotation.x = -Math.PI / 2; refl.rotation.z = Math.PI / 2 + 0.06; refl.position.set(xP - 19, 0.1, zM + 1.0); refl.renderOrder = 30; prop(refl); M.reflexo = refl;   // por cima das camadas de água do lago
      const pts = []; for (let i = 0; i < 180; i++) { const a = Math.random() * Math.PI * 1.2 + Math.PI * 0.4, el = 0.12 + Math.random() * 0.75; pts.push(xP + Math.cos(a) * 140 * Math.cos(el), 12 + Math.sin(el) * 90, zM - Math.sin(a) * 140 * Math.cos(el)); }
      const gp = new THREE.BufferGeometry(); gp.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
      prop(new THREE.Points(gp, new THREE.PointsMaterial({ color: 0xffffff, size: 2, sizeAttenuation: false, fog: false })));
      return { xP, zM, yD };
    }
    async function encontroLago(E) {
      if (M.rodando) return; M.rodando = true;
      const s = S(), d = s.dados, J = s.jog;
      try {
        comecar(); api.encontroFeito(); api.gravar('chegada');
        const atrasado = d.hora > E.hora + 0.25;
        const { L } = await naPorta(E, ROUPA_LAGO);
        await fala('lucia', atrasado ? G('Achei que você tinha esquecido de mim!') : T('Oi! Pontual, hein?'));
        await fala('jog', T('Pronta pro lugar especial?'));
        await fala('lucia', T('Prontíssima! Pra onde a gente vai?'));
        await fala('jog', T('Surpresa. Vem comigo.')); Dialogo.esconder();
        await preto(true, 800); apagarPorta();
        // corte: os dois pela trilha do lago, lado a lado, vindo para a câmera (que está na entrada do píer)
        d.hora = Math.max(d.hora, 19.6);
        esconderPerto(-40, 49, 12, [J, L]);
        cam({ px: -35.4, py: 1.5, pz: 56.6, tx: -40.8, ty: 0.6, tz: 47.8 });                        // da entrada do píer, olhando a trilha
        const vai = ladoAlado(J, L, [-42.8, 46.4], [-38.3, 50.2], 1.25);
        Musica.parar(); M.noite = noiteDoLago();
        await preto(false, 800); await Promise.race([vai, esperar(5200)]);
        await preto(true, 700);
        // a ponta do píer: sentados com os pés para fora, olhando para o lago e a lua
        J.gesto = L.gesto = null; J.rota = L.rota = null;
        devolverOcultos();
        d.hora = Math.max(d.hora, 20.1);                                  // a caminhada leva um tempinho: o Cadu já foi embora do píer (sai às 20h)
        const P = montarPier(), xc = (api.PIER.x0 + api.PIER.x1) / 2;
        M.zona = { x: xc, z: P.zM, r: 12, menos: [J, L] }; esconderPerto(xc, P.zM, 12, [J, L]);   // o píer inteiro só para os dois (quem chegar depois também some)
        const xs = P.xP + 0.25;
        sentarEm(L, xs, P.zM - 0.42, Math.PI, 0.47); sentarEm(J, xs, P.zM + 0.42, Math.PI, 0.47);   // 0,84 m entre os dois: os braços (o brinde, o brigadeiro) não se encostam
        J.pier = L.pier = true; J.fase = 0.4; L.fase = 2.1; J.gesto = L.gesto = 'pier';
        cam({ px: P.xP + 3.4, py: 1.55, pz: P.zM + 0.25, tx: P.xP - 9, ty: 0.9, tz: P.zM });       // de costas para eles: a lua na frente
        await preto(false, 900); await esperar(2600);
        cam({ px: P.xP - 3.2, py: 1.35, pz: P.zM - 1.85, tx: P.xP + 0.15, ty: 0.42, tz: P.zM + 0.05 });   // de frente para eles (do lado da água)
        await esperar(300);
        await fala('lucia', T('Que lindo... eu moro aqui a vida toda e nunca vim no lago de noite.'));
        const q0 = T('Que lindo... eu moro aqui a vida toda e nunca vim no lago de noite.');
        const r0 = await Escolha.mostrar(q0, [T('Eu sabia que você ia gostar.'), T('Eu venho aqui pra pensar.'), T('É só um lago, nada demais.')]);
        if (r0 === 2) await api.falaGrossa('lucia', 'lucia', T('É só um lago, nada demais.'), T('Ah... desculpa, achei que era especial.'));
        else { await fala('jog', T(r0 ? 'Eu venho aqui pra pensar.' : 'Eu sabia que você ia gostar.')); await fala('lucia', T(r0 ? 'Então obrigada por dividir o seu cantinho comigo.' : 'A-ah... você pensou em mim pra isso? Obrigada.')); if (!r0) api.Amizade.somar('lucia', 3); }
        // o brigadeiro do curso de confeitaria
        const Gb = geo(); Gb.box(0.16, 0.035, 0.12, '#f4c8d8', 0, -0.01, 0); for (let i = 0; i < 6; i++) Gb.box(0.034, 0.03, 0.034, '#3a2012', -0.05 + (i % 3) * 0.05, 0.025, i < 3 ? -0.03 : 0.03);
        const cx = malha(Gb), caixa = new THREE.Group(); cx.position.set(0.075, 0, 0); caixa.add(cx); L.caixa = naPonta(L, 'D', caixa);
        L.gesto = 'oferece';
        await fala('lucia', T('Eu trouxe uma coisa... brigadeiro! A primeira fornada do meu curso de confeitaria.'));
        J.gesto = 'come';
        const qb = T('Eu trouxe uma coisa... brigadeiro! A primeira fornada do meu curso de confeitaria.');
        const rb = await Escolha.mostrar(qb, [T('Tá perfeito!'), T('Você começou o curso mesmo?'), T('Tá meio duro, né?')]);
        J.gesto = 'pier';
        if (rb === 2) await api.falaGrossa('lucia', 'lucia', T('Tá meio duro, né?'), T('Ah... é que esfriou no caminho. Da próxima eu acerto.'));
        else { await fala('jog', T(rb ? 'Você começou o curso mesmo?' : 'Tá perfeito!')); await fala('lucia', T(rb ? 'Comecei! Toda terça à noite. A professora disse que eu tenho mão boa pra doce.' : 'Sério? Ai, que alívio! Eu tava morrendo de medo de você não gostar.')); if (!rb) api.Amizade.somar('lucia', 3); }
        soltarDaMao(L.caixa); L.caixa = null; L.gesto = 'pier';
        // a conversa sobre ELES (um assunto de cada vez; "Ficar só olhando o lago" encerra)
        const conhece = api.conheceLucia(), h1 = (api.historia().ler('fase1')) || {};
        const TEMAS = [['familia', T('Me conta da sua família.')], ['sonho', T('O que você mais quer da vida?')], ['medo', T('Do que você tem medo?')], ['cafe', T('Como você veio parar no café?')],
          conhece ? ['escola', T('Lembra daquele dia na escola?')] : ['viu', T('O que você pensou de mim quando me viu no café?')]];
        const feitos = [];
        const grosso = (linha, reacao) => api.falaGrossa('lucia', 'lucia', linha, reacao);
        const escolhe = async (q, ops) => { await fala('lucia', q); return Escolha.mostrar(q, ops); };
        while (feitos.length < TEMAS.length) {
          const resta = TEMAS.filter((t) => !feitos.includes(t[0]));
          const r = await Escolha.mostrar(T('Sobre o que vocês conversam?'), resta.map((t) => t[1]).concat([T('Ficar só olhando o lago')]));
          const tema = resta[r]; if (!tema) break;
          feitos.push(tema[0]); await fala('jog', tema[1]);
          if (tema[0] === 'familia') {
            await fala('lucia', T('Meus pais moram no interior, numa chácara. Essa casa onde eu moro era da minha vó Cida.'));
            const q = T('Foi ela que me ensinou a passar café no coador de pano. Toda tarde, às três horas, a casa inteira cheirava a café.');
            const x = await escolhe(q, [T('Ela devia ser incrível.'), T('Você sente falta dela?'), T('Que história triste, muda de assunto.')]);
            if (x === 2) await grosso(T('Que história triste, muda de assunto.'), T('Ah... tá. Desculpa.'));
            else { await fala('jog', T(x ? 'Você sente falta dela?' : 'Ela devia ser incrível.')); await fala('lucia', T(x ? 'Todo dia. Mas aí eu olho pro café cheio de gente e penso que ela ia ficar orgulhosa.' : 'Era. Às vezes eu ainda passo café às três só pra sentir que ela tá por perto.')); api.Amizade.somar('lucia', 2); }
          } else if (tema[0] === 'sonho') {
            await fala('lucia', T('Ter a minha própria cafeteria. Com bolo saindo do forno, o Grão dormindo na vitrine... e gente feliz.'));
            const sonho = fem() ? T('Ser jogadora de futebol profissional.') : T('Ser jogador de futebol profissional.');
            const x = await escolhe(T('E você? O que você quer da vida?'), [sonho, T('Ainda tô descobrindo.'), T('Ninguém tem nada a ver com isso.')]);
            if (x === 2) await grosso(T('Ninguém tem nada a ver com isso.'), T('Nossa... desculpa ter perguntado.'));
            else { await fala('jog', x ? T('Ainda tô descobrindo.') : sonho); await fala('lucia', T(x ? 'Tudo bem não saber ainda. O importante é não parar de procurar.' : 'Eu sabia! Então eu vou estar na arquibancada no seu primeiro jogo no estádio. Prometo.')); api.Amizade.somar('lucia', 2); }
          } else if (tema[0] === 'medo') {
            await fala('lucia', T('De ficar parada. De acordar daqui a vinte anos no mesmo lugar, fazendo a mesma coisa, sem ter tentado.'));
            const medo = fem() ? T('Eu tenho medo de não ser boa o bastante.') : T('Eu tenho medo de não ser bom o bastante.');
            const x = await escolhe(T('E... do escuro, um pouquinho. Mas isso é segredo.'), [T('Então da próxima eu trago uma lanterna.'), medo, T('Medo do escuro? Que coisa de criança.')]);
            if (x === 2) await grosso(T('Medo do escuro? Que coisa de criança.'), T('Hunf. Todo mundo tem um medo bobo, tá?'));
            else if (x === 0) { await fala('jog', T('Então da próxima eu trago uma lanterna.')); L.gesto = 'riPier'; await fala('lucia', T('Haha, combinado! Uma lanterna e mais brigadeiro.')); L.gesto = 'pier'; api.Amizade.somar('lucia', 4); }
            else { await fala('jog', medo); await fala('lucia', T('Você é. Eu vejo isso em você, sabia?')); api.Amizade.somar('lucia', 2); }
          } else if (tema[0] === 'cafe') {
            const q = T('Eu comecei limpando mesa lá com dezesseis anos. Aí o dono antigo se aposentou, me deixou cuidando de tudo... e eu fiquei.');
            const x = await escolhe(q, [T('Você é muito corajosa.'), T('Você nunca pensou em largar?'), T('Limpando mesa? Não subiu muito, né.')]);
            if (x === 2) await grosso(T('Limpando mesa? Não subiu muito, né.'), T('... Uau. Isso doeu.'));
            else { await fala('jog', T(x ? 'Você nunca pensou em largar?' : 'Você é muito corajosa.')); await fala('lucia', T(x ? 'Todo dia às seis da manhã, haha. Mas aí o cheiro do café me convence de novo.' : 'Para... assim eu fico sem graça. Mas obrigada.')); api.Amizade.somar('lucia', 2); }
          } else if (tema[0] === 'escola') {                              // só para quem conversou com ela na Fase 1
            const q = h1.mariposa ? (fem() ? T('Lembra que você chegou atrasada naquela aula da Dona Graça e mesmo assim acertou tudo? A sala inteira ficou de boca aberta.') : T('Lembra que você chegou atrasado naquela aula da Dona Graça e mesmo assim acertou tudo? A sala inteira ficou de boca aberta.'))
              : G('Lembra que eu falei que ia te ajudar se você travasse na atividade? Eu fiquei a aula inteira de olho, esperando você travar, haha.');
            const ops = h1.mariposa ? [G('Eu lembro! Eu tava morrendo de vergonha.'), T('Não lembro de nada disso.')] : [G('Você ficou me olhando a aula inteira?'), T('Não lembro de nada disso.')];
            const x = await escolhe(q, ops);
            if (x === 1) await grosso(T('Não lembro de nada disso.'), T('Ah... tá. Tudo bem.'));
            else { await fala('jog', ops[0]); L.gesto = 'riPier'; await fala('lucia', h1.mariposa ? G('Vergonha? Você foi o assunto da escola a semana inteira, haha.') : T('Haha, fiquei! Eu queria muito ajudar alguém, sabe? Mas você nem precisou.')); L.gesto = 'pier'; api.Amizade.somar('lucia', 3); }
          } else {                                                        // quem não a conhecia da escola: a primeira vez no café
            const x = await Escolha.mostrar(T('O que você pensou de mim quando me viu no café?'), [T('Que você parecia ser gente boa.'), T('Que o café devia ser bom, pela fila.'), T('Nada. Nem reparei em você.')]);
            if (x === 2) await grosso(T('Nada. Nem reparei em você.'), T('Ah... entendi.'));
            else if (x === 0) { await fala('jog', T('Que você parecia ser gente boa.')); L.gesto = 'riPier'; await fala('lucia', T('Ah, que fofo! Eu acho o mesmo de você.')); L.gesto = 'pier'; api.Amizade.somar('lucia', 4); }
            else { await fala('jog', T('Que o café devia ser bom, pela fila.')); L.gesto = 'riPier'; await fala('lucia', fem() ? T('Haha! Pelo menos é sincera.') : T('Haha! Pelo menos é sincero.')); L.gesto = 'pier'; }
          }
        }
        Dialogo.esconder();
        // o fim: a câmera volta para trás deles, com a lua; um brinde com o café da garrafa térmica, ficar em silêncio ou ir embora
        cam({ px: P.xP + 2.6, py: 1.35, pz: P.zM + 0.55, tx: P.xP - 9, ty: 1.0, tz: P.zM - 0.4 });
        await esperar(2200);
        cam({ px: P.xP - 2.5, py: 1.25, pz: P.zM + 1.7, tx: P.xP + 0.2, ty: 0.38, tz: P.zM - 0.05 });
        const qf = T('Dá vontade de ficar aqui a noite toda, né?'); await fala('lucia', qf);
        const rf = await Escolha.mostrar(qf, [T('Brindar com o café da garrafa'), G('Ficar em silêncio olhando o lago'), T('Tá ficando tarde, bora logo.')]);
        Dialogo.esconder();
        if (rf === 2) await api.falaGrossa('lucia', 'lucia', T('Tá ficando tarde, bora logo.'), T('Ah... tá. Vamos.'));
        else if (rf === 0) {                                             // as canecas saem da garrafa térmica para a mão de cada um
          J.xicara = naPonta(J, 'D', xicaraMesh('#f2f2ee')); L.xicara = naPonta(L, 'D', xicaraMesh('#f2c230')); Sons.xicara();
          J.gesto = L.gesto = 'xicara'; await esperar(700);
          J.gesto = L.gesto = 'brinde'; await esperar(350); Sons.xicara();
          await fala('lucia', T('Um brinde às noites no lago!'));
          await fala('jog', T('E aos brigadeiros da melhor confeiteira da cidade!'));
          L.gesto = 'riPier'; api.Amizade.somar('lucia', 3); await esperar(900);
          soltarDaMao(J.xicara); soltarDaMao(L.xicara); J.xicara = L.xicara = null; J.gesto = L.gesto = 'pier';
        } else { await esperar(2600); await fala('lucia', T('Obrigada por me trazer aqui. Sério.')); api.Amizade.somar('lucia', 2); }
        Dialogo.esconder();
        await preto(true, 1000);
        if (M.noite) { M.noite.parar(); M.noite = null; }
        J.gesto = null; J.pier = false; levantarAtor(J, P.xP + 1.2, P.zM);
        M.zona = null; limparProps(); devolverOcultos();
        api.soltarLuciaEncontro(L); M.L = null;
        d.hora = Math.max(d.hora, 21.6);
        M.rodando = false; terminar();
        await api.despedidaLucia({ demissao: false, tipo: 'lago', roupa: ROUPA_LAGO });
      } catch (e) {
        console.error(e); M.rodando = false;
        if (M.noite) { M.noite.parar(); M.noite = null; }
        M.zona = null; limparProps(); devolverOcultos(); if (M.L) { api.soltarLuciaEncontro(M.L); M.L = null; }
        J.gesto = null; J.pier = false; if (J.sentado) J.sentado = false; terminar(); await preto(false, 300); api.liberar();
      }
    }

    // ================================================================ 4º ENCONTRO EM DIANTE: o JANTAR, só em cortes (sem nenhuma fala)
    async function jantar(E) {
      if (M.rodando) return; M.rodando = true;
      const s = S(), d = s.dados, J = s.jog;
      let L = null, E2 = null, pratos = null;
      try {
        comecar(); api.encontroFeito(); api.gravar('chegada');
        Musica.parar(); M.musica = musicaCortes();
        ({ L } = await naPorta(E, ROUPA_JANTAR, true));
        await esperar(500);
        await preto(true, 700); apagarPorta();
        // 1) o caminho pela rua de terra, lado a lado, ainda com o céu alaranjado
        d.hora = Math.max(d.hora, 19.3);
        esconderPerto(2, 38.6, 10, [J, L]);
        cam({ px: -3.6, py: 1.4, pz: 40.1, tx: 2.0, ty: 0.55, tz: 38.6 });
        const vai = ladoAlado(J, L, [5.2, 38.95], [-0.8, 38.95], 1.2);
        await preto(false, 700); await Promise.race([vai, esperar(4200)]);
        await preto(true, 700); devolverOcultos(); J.gesto = L.gesto = null; J.rota = L.rota = null;
        // 2) o jantar no restaurante: a mesa com a velinha, comendo e rindo
        api.soltarLuciaEncontro(L); L = null; M.L = null;
        const P = api.PORTAS.find((p) => p.nome === 'restaurante');
        s.manterPreto = true; await api.entrarEm(P); s.manterPreto = false;
        const Mx = api.MESA_ENC.restaurante;
        for (const A of s.npcs.slice()) if (A.cli && A.cli.a && Math.abs(A.cli.a.x - Mx.x) < 1 && Math.abs(A.cli.a.z - Mx.z) < 1) { A.cli.a.ocupado = null; api.descartarPessoa(A); }
        E2 = api.reservarMesaEncontro('restaurante');
        if (E2) {
          L = api.criarLuciaEncontro(ROUPA_JANTAR); M.L = L; api.sentarAtor(L, E2.aL); api.sentarAtor(J, E2.aJ);
          pratos = api.pratosNaMesa(E2, false); J.gesto = L.gesto = 'garfo'; L.t = 1.3;
          cam({ px: Mx.x + 0.2, py: 1.7, pz: Mx.z + 2.1, tx: Mx.x, ty: 0.95, tz: Mx.z });
          await preto(false, 700); await esperar(2300);
          L.gesto = 'ri'; await esperar(900); J.gesto = 'ri'; await esperar(1300);
          await preto(true, 700);
          J.gesto = L.gesto = null; if (pratos.parent) pratos.parent.remove(pratos); pratos = null;
          if (E2.vela && E2.vela.parent) E2.vela.parent.remove(E2.vela);
          for (const a of E2.lug) a.ocupado = null; J.sentado = false;
          api.soltarLuciaEncontro(L); L = null; M.L = null;
        }
        d.hora = Math.max(d.hora, 20.6);
        await api.sairDoLugar(true);
        // 3) pega-pega em volta do canteiro da praça
        const Pc = api.PRACA_C;
        L = api.criarLuciaEncontro(ROUPA_JANTAR); M.L = L;
        esconderPerto(Pc.x, Pc.z, 9, [J, L]);
        L.tipo = 'roda'; M.roda = { cx: Pc.x, cz: Pc.z, r: 3.6, a: 0.6, w: -0.95, J, L };      // tipo próprio: a cidade não para a corrida dela
        cam({ px: Pc.x + 5.4, py: 2.7, pz: Pc.z + 5.0, tx: Pc.x, ty: 0.3, tz: Pc.z });
        tickRoda(0);
        await preto(false, 700); await esperar(4200);
        await preto(true, 700); M.roda = null; L.tipo = 'cena'; J.andando = L.andando = J.correndo = L.correndo = false;
        // 4) embaixo do poste da praça: o toca aqui de quem ganhou o pega-pega e os dois rindo
        const dx = Pc.x - 7.9, dz = Pc.z + 4.8;                          // o poste (cx − 9, cz + 6) fica atrás, à esquerda dos dois
        J.x = dx + 0.45; J.z = dz; L.x = dx - 0.45; L.z = dz; chao(J); chao(L); J.yaw = J.yawAlvo = Math.PI; L.yaw = L.yawAlvo = 0;
        cam({ px: dx + 0.6, py: 1.55, pz: dz - 2.8, tx: dx, ty: 0.85, tz: dz });     // do norte: o poste aceso fica atrás dos dois
        await preto(false, 700); await esperar(500);
        J.gesto = L.gesto = 'tocaAqui'; J.t = L.t = 0; await esperar(1300);
        J.gesto = L.gesto = 'ri'; await esperar(1700);
        await preto(true, 800);
        J.gesto = L.gesto = null; devolverOcultos();
        api.soltarLuciaEncontro(L); L = null; M.L = null;
        d.hora = Math.max(d.hora, 21.6);
        M.rodando = false; terminar();
        await api.despedidaLucia({ demissao: false, tipo: 'jantar', roupa: ROUPA_JANTAR });
        if (M.musica) { M.musica.parar(); M.musica = null; }
      } catch (e) {
        console.error(e); M.rodando = false; M.roda = null; s.manterPreto = false; apagarPorta();
        if (M.musica) { M.musica.parar(); M.musica = null; }
        if (pratos && pratos.parent) pratos.parent.remove(pratos);
        devolverOcultos(); if (M.L) { api.soltarLuciaEncontro(M.L); M.L = null; }
        J.gesto = null; J.sentado = false; terminar(); await preto(false, 300); api.liberar();
      }
    }
    function tickRoda(dt) {                                              // os dois correndo em círculo (ela na frente, ele atrás)
      const R = M.roda; if (!R) return;
      R.a += R.w * dt;
      for (const [A, off] of [[R.L, 0.95], [R.J, 0]]) {
        const a = R.a + off * Math.sign(R.w);
        A.x = R.cx + Math.cos(a) * R.r; A.z = R.cz + Math.sin(a) * R.r; chao(A);
        const tx = -Math.sin(a) * R.w, tz = Math.cos(a) * R.w; A.yaw = A.yawAlvo = yawPara(tx, tz);
        A.andando = true; A.correndo = true; A.vel = Math.abs(R.w) * R.r; A.rota = null;
      }
    }

    // ================================================================ A CASA DELA (no dia seguinte ao 1º encontro): café, bolo e o Grão
    function rotaGrao(pts, vel, depois) { const G = M.G; return new Promise((ok) => { G.rota = pts.map((p) => ({ x: p[0], z: p[1] })); G.vel = vel || 0.6; G.depois = depois || 'senta'; G.rotaOk = ok; if (G.estado !== 'corre') G.estado = vel > 1.5 ? 'corre' : 'anda'; }); }
    function puloGrao(x, y, z, depois, yaw) { const G = M.G; return new Promise((ok) => { G.rota = null; G.estado = 'pula'; if (yaw != null) G.yaw = yaw; G.pulo = { x0: G.x, y0: G.y, z0: G.z, x1: x, y1: y, z1: z, t: 0, dur: 0.48, h: 0.28 + Math.abs(y - G.y) * 0.4, depois, ok }; }); }
    function arranhaoNaMao(J) {                                         // três riscos vermelhos na mão (sprite que some)
      const cv = document.createElement('canvas'); cv.width = cv.height = 16; const g = cv.getContext('2d'); g.fillStyle = '#e0302a';
      for (let i = 0; i < 3; i++) for (let k = 0; k < 9; k++) g.fillRect(3 + i * 4 + Math.floor(k / 3), 3 + k, 1, 1);
      const tx = new THREE.CanvasTexture(cv); tx.magFilter = tx.minFilter = THREE.NearestFilter; tx.generateMipmaps = false;
      const mat = new THREE.SpriteMaterial({ map: tx, transparent: true, depthTest: false }), sp = new THREE.Sprite(mat); sp.scale.set(0.16, 0.16, 1); sp.renderOrder = 9;
      const b = J.m.bracoD.cotovelo || J.m.bracoD, p = new THREE.Vector3(0, -0.6 - (J.m.bracoD.cotovelo ? J.m.bracoD.cotovelo.position.y : 0), 0); b.localToWorld(p); S().grupo.worldToLocal(p);
      sp.position.copy(p); sp.position.y += 0.05; prop(sp);
      const t0 = performance.now(), passo = () => { const k = (performance.now() - t0) / 1700; mat.opacity = Math.max(0, 1 - k * k); if (k < 1 && S()) requestAnimationFrame(passo); else { if (sp.parent) sp.parent.remove(sp); mat.dispose(); tx.dispose(); } };
      requestAnimationFrame(passo);
    }
    // monta o que se mexe dentro da casa: a Lúcia, o Grão dormindo na caminha e a bandeja no balcão (o resto é do interiores.js)
    function entrouCasa(R) {
      const C = R.casaLucia; if (!C) return;
      M.R = Object.assign({ grupo: R.grupo }, C);
      M.G = criarGrao(api.guardar); M.G.x = C.caminha.x; M.G.z = C.caminha.z; M.G.y = 0.07; M.G.sombraY = 0.06; M.G.yaw = C.caminha.yaw; M.G.estado = 'dorme';
      R.grupo.add(M.G.raiz, M.G.sombra); poseGrao(M.G, 0.016);
      // a bandeja (duas canecas e duas fatias de bolo de cenoura com cobertura de chocolate)
      const Gb = geo(); Gb.box(0.46, 0.025, 0.3, '#8a5a2b', 0, 0, 0); Gb.box(0.48, 0.03, 0.02, '#6a4422', 0, 0.01, 0.15); Gb.box(0.48, 0.03, 0.02, '#6a4422', 0, 0.01, -0.15);
      for (const s of [-1, 1]) { Gb.box(0.13, 0.01, 0.13, '#f4f4ec', s * 0.11, 0.025, 0.06); Gb.box(0.08, 0.05, 0.06, '#e8892a', s * 0.11, 0.035, 0.06); Gb.box(0.082, 0.014, 0.062, '#3a2012', s * 0.11, 0.085, 0.06); }
      const bandeja = new THREE.Group(), bm = malha(Gb); bandeja.add(bm);
      const canecas = [xicaraMesh('#f2f2ee'), xicaraMesh('#e8742a')]; canecas.forEach((c, i) => { c.position.set(i ? 0.13 : -0.13, 0.025, -0.07); c.children[0].position.set(0, 0, 0); bandeja.add(c); });
      bandeja.position.set(C.balcao.x + 0.25, 0.96, C.balcao.z - 0.55); R.grupo.add(bandeja); M.props.push(bandeja);
      M.bandeja = bandeja; M.canecasBandeja = canecas;
      if (M.visita) {
        const L = api.criarLuciaEncontro(ROUPA_CASA); M.L = L;
        L.x = 0.65; L.z = R.entrada.z - 0.25; L.yaw = L.yawAlvo = Math.PI * 0.75; L.y = 0;
      }
    }
    function saiuCasa() {
      if (M.ronrono) { M.ronrono.parar(); M.ronrono = null; }
      const s = S(); if (s && s.falantesExtra) delete s.falantesExtra.lucia;
      M.G = null; M.R = null; M.L = null; M.bandeja = null; M.props = M.props.filter((o) => o.parent && o.parent !== (s && s.grupo));
    }
    function alvosCasa() { /* a visita é toda roteirizada: lá dentro só sobra o "Sair" da cidade */ }

    async function cenaGrao(J, L, C) {
      const G = M.G, tranquilo = (typeof Espectros !== 'undefined' ? Espectros.valor('tranquilo') : 0) >= 0;
      cam({ px: 0.15, py: 1.45, pz: 2.3, tx: 1.7, ty: 0.0, tz: -0.1 });
      G.estado = 'estica'; G.tEst = 0; await esperar(1200); Sons.miau(false);
      G.estado = 'anda'; await rotaGrao([[C.caminha.x - 0.5, C.caminha.z + 0.3], [0.42, 1.05], [0.5, -0.3], [0.7, -0.32]], 0.6);
      G.yaw = 0;
      if (tranquilo) {
        G.estado = 'esfrega'; await esperar(1800);
        G.estado = 'senta'; await esperar(450);
        G.caudaLado = -1; await puloGrao(J.x, C.colo.y, J.z + C.colo.dz, 'colo', Math.PI);
        J.gesto = 'carinho'; M.ronrono = Sons.ronronar();
        cam({ px: 0.35, py: 1.38, pz: 1.8, tx: 1.3, ty: 0.5, tz: -0.8 });
        api.coracoes(J.x - 0.05, 1.05, J.z + 0.3);
        await esperar(1400);
        await fala('lucia', T('Não acredito! Ele nunca sobe no colo de ninguém... às vezes nem no meu!'));
        api.Amizade.somar('lucia', 5);
        const q = T('Dizem que bicho sente quando a pessoa é boa, sabia?'); await fala('lucia', q);
        const r = await Escolha.mostrar(q, [T('Ele é um amor.'), G_('Acho que ganhei um amigo.'), T('Tira esse bicho de mim, vai soltar pelo na minha roupa.')]);
        if (r === 2) {
          await api.falaGrossa('lucia', 'lucia', T('Tira esse bicho de mim, vai soltar pelo na minha roupa.'), T('Ah... tá. Vem, Grão. Desce.'));
          if (M.ronrono) { M.ronrono.parar(); M.ronrono = null; } J.gesto = null;
          await puloGrao(0.72, 0, -0.32, 'anda', Math.PI * 0.6); G.caudaLado = 1; Sons.miau(true);
          rotaGrao([[0.45, 1.05], [C.caminha.x - 0.5, C.caminha.z + 0.3], [C.caminha.x, C.caminha.z]], 0.7, 'dorme').then(() => { if (M.G) { M.G.yaw = C.caminha.yaw; M.G.y = 0.07; } });
        } else {
          await fala('jog', r ? G_('Acho que ganhei um amigo.') : T('Ele é um amor.'));
          await fala('lucia', T('Ele gostou de você de verdade. E olha que ele é bem exigente, viu?'));
          if (M.ronrono) { M.ronrono.parar(); M.ronrono = null; } J.gesto = null;
          await puloGrao(0.72, 0, -0.32, 'anda', Math.PI * 0.6); G.caudaLado = 1;
          rotaGrao([[0.45, 1.05], [C.caminha.x - 0.5, C.caminha.z + 0.3], [C.caminha.x, C.caminha.z]], 0.55, 'dorme').then(() => { if (M.G) { M.G.yaw = C.caminha.yaw; M.G.y = 0.07; } });
        }
      } else {
        G.estado = 'senta'; await esperar(700);
        J.gesto = 'estende'; await esperar(800);
        G.estado = 'arrepia'; Sons.chiar(); await esperar(1000);
        G.estado = 'arranha'; G.patada = 0; Sons.arranhao(); await esperar(300);
        arranhaoNaMao(J); J.gesto = 'susto'; Sons.miau(true);
        G.estado = 'corre'; rotaGrao([[-0.2, -0.55], [C.esconde.x + 0.6, C.esconde.z], [C.esconde.x, C.esconde.z]], 2.6, 'arrepia').then(() => { if (M.G) { M.G.yaw = 0; setTimeout(() => { if (M.G && M.G.estado === 'arrepia') M.G.estado = 'senta'; }, 1800); } });
        await fala('jog', T('Ai!'));
        cam({ px: 1.5, py: 1.55, pz: 3.0, tx: 1.5, ty: 0.42, tz: -0.85 });
        L.gesto = null;
        await fala('lucia', T('Grão! Que feio! Desculpa, ele nunca fez isso com ninguém...'));
        const q = T('Dizem que bicho sente as coisas, né...'); await fala('lucia', q);
        const r = await Escolha.mostrar(q, [T('Tá tudo bem, foi só um arranhão.'), T('Que gato mais mal-educado.')]);
        if (r === 1) await api.falaGrossa('lucia', 'lucia', T('Que gato mais mal-educado.'), T('Ele é o meu bebê... não fala assim dele.'));
        else { await fala('jog', T('Tá tudo bem, foi só um arranhão.')); await fala('lucia', T('Ainda bem... ele deve estar estranhando gente nova. Me dá a mão, deixa eu ver.')); }
        J.gesto = null;
      }
      Dialogo.esconder();
    }
    const G_ = (k) => G(k);

    async function visitaCasa(E) {
      if (M.rodando) return; M.rodando = true;
      const s = S(), d = s.dados, J = s.jog;
      try {
        comecar(); api.encontroFeito(); api.gravar('chegada');
        const { L: Lf } = await naPorta(E, ROUPA_CASA);
        await fala('lucia', T('Oi! Entra, entra! Não repara a bagunça.')); Dialogo.esconder();
        await preto(true, 600);
        api.soltarLuciaEncontro(Lf); M.L = null;
        M.visita = true; s.manterPreto = true;
        await api.entrarEm(api.portaCasaLucia());
        s.manterPreto = false;
        const C = M.R, L = M.L; if (!C || !L || !M.G) throw new Error('a casa da Lúcia não montou');
        Musica.parar();
        J.x = 0; J.z = s.dentro.entrada.z; J.yaw = J.yawAlvo = Math.PI / 2;
        const camGeral = { px: 0.9, py: 3.0, pz: 4.7, tx: 0.8, ty: -0.1, tz: -0.6 };
        L.yawAlvo = L.yaw = yawPara(J.x - L.x, J.z - L.z) + 0.6;
        cam({ px: 0.7, py: 1.6, pz: s.dentro.entrada.z - 2.6, tx: 0.3, ty: 1.0, tz: s.dentro.entrada.z - 0.1 });
        await preto(false, 700); await esperar(400);
        await fala('lucia', T('Senta aí no sofá que eu já trago o café e o bolo!')); Dialogo.esconder();
        cam(camGeral);
        // ele vai para o sofá; ela vai para o balcão da cozinha
        const pJ = andar(J, [[0.35, 0.05], [C.sofaJ.x, C.sofaJ.z + 0.5]], 1.4);
        const pL = andar(L, [[-0.55, 0.65], [C.balcao.x, C.balcao.z]], 1.35);
        await pJ; sentarEm(J, C.sofaJ.x, C.sofaJ.z, -Math.PI / 2, C.h);
        await pL; L.yawAlvo = Math.PI / 2; L.gesto = 'balcao';
        cam({ px: -0.45, py: 1.65, pz: 0.95, tx: -1.5, ty: 0.55, tz: -2.6 });
        await esperar(1500); Sons.xicara(); await esperar(600);
        // a bandeja vai na mão dela (encostando na pontinha das duas mãos)
        M.bandeja.parent.remove(M.bandeja); M.bandeja.position.set(0.16, -0.02, 0.0); M.bandeja.rotation.set(0, 0, 0);
        const holder = new THREE.Group(); holder.add(M.bandeja); L.bandeja = naPonta(L, 'D', holder); M.bandeja.position.set(0.12, 0.0, 0.17);
        L.gesto = 'bandeja';
        cam(camGeral);
        await andar(L, [[-0.3, 0.95], [2.65, 0.98], [2.75, -0.28]], 1.05);
        L.yawAlvo = yawPara(C.mesa.x - 2.75, C.mesa.z + 0.28); await esperar(450);
        // põe a bandeja na mesinha de centro
        soltarDaMao(holder); M.bandeja.position.set(C.mesa.x + 0.05, C.mesa.y, C.mesa.z); M.bandeja.rotation.set(0, 0, 0); C.grupo.add(M.bandeja); Sons.xicara();
        L.gesto = null; L.bandeja = null;
        await andar(L, [[C.sofaL.x + 0.1, C.sofaL.z + 0.52]], 1.0); sentarEm(L, C.sofaL.x, C.sofaL.z, -Math.PI / 2, C.h);
        // as canecas: cada um pega a sua
        for (const c of M.canecasBandeja) c.visible = false;
        J.xicara = naPonta(J, 'D', xicaraMesh('#f2f2ee')); L.xicara = naPonta(L, 'D', xicaraMesh('#e8742a')); Sons.xicara();
        J.gesto = L.gesto = 'xicara'; L.fase = 1.7; J.fase = 0.2;
        const camSofa = { px: 1.5, py: 1.55, pz: 3.0, tx: 1.5, ty: 0.42, tz: -0.85 };
        cam(camSofa); await esperar(500);
        // o bolo
        await fala('lucia', T('Prontinho! Café passado na hora e bolo de cenoura com chocolate. Receita da minha vó.'));
        const q1 = T('Que tal? Fala a verdade.'); await fala('lucia', q1);
        const r1 = await Escolha.mostrar(q1, [T('Tá incrível!'), T('Você devia vender isso no café!'), T('Tá meio seco, né?')]);
        if (r1 === 2) await api.falaGrossa('lucia', 'lucia', T('Tá meio seco, né?'), T('Ah... desculpa. Da próxima eu acerto.'));
        else { await fala('jog', T(r1 ? 'Você devia vender isso no café!' : 'Tá incrível!')); await fala('lucia', T(r1 ? 'Sabe que eu tô pensando nisso? Bolo de pote no balcão... ia ser um sucesso.' : 'Ai, que bom! Fiquei a manhã inteira na cozinha por causa dele.')); api.Amizade.somar('lucia', r1 ? 2 : 3); }
        // a casa da avó
        const q2 = T('Essa casa era da minha vó. Quando ela foi morar com a minha tia, eu fiquei com ela... tem cheiro de café até nas paredes, haha.'); await fala('lucia', q2);
        const r2 = await Escolha.mostrar(q2, [T('É muito aconchegante.'), T('Você mora sozinha aqui?'), T('Meio velha, né? Precisava de uma reforma.')]);
        if (r2 === 2) await api.falaGrossa('lucia', 'lucia', T('Meio velha, né? Precisava de uma reforma.'), T('Hunf... é a casa da minha vó, tá? Eu gosto dela assim.'));
        else { await fala('jog', T(r2 ? 'Você mora sozinha aqui?' : 'É muito aconchegante.')); await fala('lucia', T(r2 ? 'Eu e o Grão! Falando nisso... cadê aquele gato?' : 'Que bom que você gostou. É o meu lugar preferido no mundo.')); }
        // as canecas voltam para a bandeja
        soltarDaMao(J.xicara); soltarDaMao(L.xicara); J.xicara = L.xicara = null; for (const c of M.canecasBandeja) c.visible = true; Sons.xicara();
        J.gesto = L.gesto = null; await esperar(300);
        await fala('lucia', T('Grão! Vem cá, vem conhecer uma pessoa muito legal...')); Dialogo.esconder();
        await cenaGrao(J, L, C);
        cam(camSofa);
        // o sonho dela: a confeitaria com os bolos da avó
        const q3 = T('Posso te contar um segredo? Eu quero transformar o café numa confeitaria. Com os bolos da minha vó na vitrine.'); await fala('lucia', q3);
        const r3 = await Escolha.mostrar(q3, [G('Você vai conseguir, eu tenho certeza.'), T('Se precisar de ajuda, pode contar comigo.'), T('Confeitaria? Ninguém aqui vai pagar por bolo.')]);
        if (r3 === 2) await api.falaGrossa('lucia', 'lucia', T('Confeitaria? Ninguém aqui vai pagar por bolo.'), T('Hunf... você vai ver só. Vai ter fila na porta.'));
        else { await fala('jog', r3 ? T('Se precisar de ajuda, pode contar comigo.') : G('Você vai conseguir, eu tenho certeza.')); await fala('lucia', T(r3 ? 'Sério? Então quando eu abrir, o primeiro bolo é seu.' : 'Obrigada... ouvir isso de você me dá coragem.')); api.Amizade.somar('lucia', 5); }
        d.sabeConfeitaria = true;
        Dialogo.esconder();
        // ficar mais um pouco (uma vez: as histórias do Grão, os dois rindo) ou ir embora
        let ficou = false;
        for (;;) {
          const ops = [T('Bom... já estou indo.')]; if (!ficou) ops.push(T('Ficar mais um pouco'));
          const r = await Escolha.mostrar(T('O que você faz?'), ops);
          if (r !== 1) break;
          ficou = true; await preto(true, 400);
          d.hora = Math.min(23.4, d.hora + 0.75);
          cam({ px: 1.3, py: 1.3, pz: 2.0, tx: 1.35, ty: 0.42, tz: -0.85 });
          await preto(false, 400); await esperar(500);
          L.gesto = 'ri';
          await fala('lucia', T('E aí o Grão pulou na bancada e caiu dentro do saco de farinha... saiu branquinho, parecia um fantasma!'));
          J.gesto = 'ri'; await esperar(1200);
          await fala('lucia', T('Haha, faz tempo que eu não ria assim!')); api.Amizade.somar('lucia', 2); Dialogo.esconder(); await esperar(600);
          await preto(true, 400); J.gesto = L.gesto = null; cam(camSofa); await preto(false, 400);
        }
        await fala('jog', T('Bom... já estou indo.'));
        await fala('lucia', T('Ah, já? Passou rápido demais...'));
        await fala('lucia', G('Obrigada por ter vindo. Volta mais vezes, tá? O Grão vai cobrar.'));
        Dialogo.esconder();
        d.visitouCasa = true; d.conviteCasa = null; d.encontroLucia = null; d.encontros = Math.max(d.encontros | 0, 1) + 1;
        await preto(true, 900);
        J.sentado = false; d.hora = Math.max(d.hora, 21.9);
        api.soltarLuciaEncontro(L); M.L = null; M.visita = false;
        await api.sairDoLugar(true);
        await despedidaNaPorta();
      } catch (e) {
        console.error(e); s.manterPreto = false; M.visita = false; M.rodando = false; apagarPorta();
        if (M.ronrono) { M.ronrono.parar(); M.ronrono = null; }
        J.gesto = null; J.sentado = false; terminar();
        if (s.dentro && s.dentro.nome === 'casaLucia') await api.sairDoLugar(); else await preto(false, 300);
        api.liberar();
      }
    }
    // na porta da casa dela, de noite: a despedida (abraço ou toca aqui), ela acena e entra
    async function despedidaNaPorta() {
      const s = S(), d = s.dados, J = s.jog, C = api.casaAlves();
      const sg = Math.sign(C.sz - C.z) || 1, fx = C.x, fz = C.z + sg * 1.15;
      const L = api.criarLuciaEncontro(ROUPA_CASA); M.L = L;
      const luzV = M.luzPorta || luz(0xffd9a0, 1.4, 9, fx, 2.6, C.z + sg * 0.6); M.luzPorta = null;   // a luz da varanda
      L.x = fx - 0.5; L.z = fz; chao(L); J.x = fx + 0.5; J.z = fz + sg * 0.05; chao(J); J.rota = null;
      L.yaw = L.yawAlvo = yawPara(1, sg * 0.75); J.yaw = J.yawAlvo = yawPara(-1, sg * 0.75);   // um de frente para o outro, abertos para a câmera
      cam({ px: fx, py: 1.75, pz: fz + sg * 4.4, tx: fx, ty: 0.95, tz: fz });   // de frente para a porta
      await preto(false, 900); await esperar(300);
      const r = await Escolha.mostrar(T('Como você se despede?'), [T('Abraçar'), T('Toca aqui')]);
      L.yaw = L.yawAlvo = 0; J.yaw = J.yawAlvo = Math.PI;                  // para o abraço e o toca aqui: de frente um para o outro
      if (r === 0) {                                                      // abraço: as cabeças passam uma ao lado da outra (sem atravessar)
        L.x = fx - api.ABRACO_D / 2; J.x = fx + api.ABRACO_D / 2; L.z = fz + 0.13; J.z = fz + sg * 0.05 - 0.13; L.gesto = J.gesto = 'abraco'; await esperar(2300);
      } else { L.x = fx - 0.45; J.x = fx + 0.45; L.gesto = J.gesto = 'tocaAqui'; L.t = J.t = 0; await esperar(1300); L.gesto = J.gesto = 'ri'; await esperar(900); }
      L.gesto = J.gesto = null; L.x = fx - 0.5; J.x = fx + 0.5; L.z = fz; J.z = fz + sg * 0.05;
      L.yawAlvo = yawPara(1, sg * 0.75); J.yawAlvo = yawPara(-1, sg * 0.75);
      await fala('lucia', Tf('Boa noite, {0}! Até amanhã no café.', api.nomeJog()));
      await fala('jog', T('Boa noite, Lúcia!'));
      Dialogo.esconder();
      L.gesto = 'acena'; await esperar(1100); L.gesto = null;
      await andar(L, [[C.x, C.z + sg * 0.3]], 1.3);
      api.soltarLuciaEncontro(L); M.L = null;
      if (luzV.parent) luzV.parent.remove(luzV); M.luzes = M.luzes.filter((l) => l !== luzV);
      J.yawAlvo = yawPara(0, sg); await esperar(400);
      M.rodando = false; terminar(); api.gravar(d.ponto || 'chegada');
      api.liberar();
    }

    // ================================================================ todo quadro
    function tick(dt) {
      const s = S(); if (!s) return;
      if (M.zona) esconderPerto(M.zona.x, M.zona.z, M.zona.r, M.zona.menos);
      for (const A of M.ocultos) { s.meus.delete(A.m); if (A.blob) A.blob.visible = false; }
      if (M.L && M.L.nmSome) { s.meus.delete(M.L.m); M.L.blob.visible = false; }
      for (const A of [M.L, s.jog]) if (A && A.nmTilt && A.gesto !== 'timida') { A.m.corpo.rotation.x = 0; if (A.m.cabeca) A.m.cabeca.rotation.x = 0; A.nmTilt = false; }   // a pose da cidade não zera a inclinação de lado
      if (s.jog && s.jog.nmSome) { s.meus.delete(s.jog.m); s.jog.blob.visible = false; if (s.jog.anel) s.jog.anel.visible = false; }
      if (M.roda) tickRoda(dt);
      if (M.reflexo) { const mp = M.reflexo.material.map; mp.offset.y = (mp.offset.y + dt * 0.18) % 1; M.reflexo.material.opacity = 0.5 + Math.sin(s.t * 2.3) * 0.12; }
      const G = M.G; if (G) { if (G.estado === 'estica') G.tEst = (G.tEst || 0) + dt; if (G.estado === 'arranha') G.patada = (G.patada || 0) + dt * 3; moverGrao(G, dt); poseGrao(G, dt); }
      // o convite para a casa dela: chega de manhã no dia seguinte ao 1º encontro (com o jogador livre e fora do expediente)
      const d = s.dados, cv = d.conviteCasa;
      if (cv && !cv.feito && !M.rodando && s.modo === 'livre' && !s.turno && !s.turnoMercado && !s.turnoPizza && !s.faltouMsg && !s.encontroRodando && !document.getElementById('nmChat')) {
        if ((d.dia || 1) > cv.dia) cv.dia = d.dia || 1;                  // não viu no dia certo (dormiu, trabalhou...): chega hoje
        if ((d.dia || 1) === cv.dia && d.hora >= 7 && d.hora < 17.5) convite().catch((e) => console.error(e));
      }
    }
    function limpar() {
      if (M.noite) { M.noite.parar(); M.noite = null; }
      if (M.musica) { M.musica.parar(); M.musica = null; }
      if (M.ronrono) { M.ronrono.parar(); M.ronrono = null; }
      const c = document.getElementById('nmChat'); if (c) c.remove();
      M.G = null; M.L = null; M.R = null; M.props = []; M.luzes = []; M.ocultos = []; M.roda = null; M.zona = null; M.rodando = false;
    }
    return { encontroLago, jantar, visitaCasa, entrouCasa, saiuCasa, alvosCasa, mensagemBolo, convite, tick, gesto, limpar, _M: M, _criarGrao: criarGrao };
  }

  window.FutebolJS.registrarFase({ id: 'namoro', nome: 'Namoro', nucleoMinimo: '7.5.9', iniciar: async () => {}, criar });
})();
