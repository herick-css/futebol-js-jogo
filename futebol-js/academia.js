/* =====================================================================
   FUTEBOL JS · academia.js · A ACADEMIA DA CIDADEZINHA E OS TREINOS (arquivo SEPARADO, como pizzaria.js)
   ---------------------------------------------------------------------
   6.2.0 — primeira versão.
   6.6.5 — AGENDA dos frequentadores (agendaFreq): de manhã (3 em 4 vêm; chegam 7h10–8h30, vão embora 10h10–10h50) e de tarde (chegam
           13h10–15h20, vão embora 20h30–21h). Ninguém está lá quando abre: chegam pela porta e pela catraca de ENTRADA (o tripé gira) e vão
           ao aparelho (chegarFreq); a cidade mostra a mesma pessoa vindo de fora (agenda/criarFreq). O ESPELHO também é deles: de vez em
           quando o que anda pela sala faz duas poses ou tira uma selfie no espelho (tickEspelhoNPC).
   6.3.0 — HORÁRIO (7h–11h e 13h–22h; Diego e Fernanda saem para almoçar e voltam, todos saem entre 20h30 e 21h30), cada um com a sua casa;
           a FERNANDA circula pela academia (orienta gente, treina, bebe água, olha a prancheta); fala DIFERENTE para cada treino/motivo de erro;
           treino que deu errado não repete no mesmo dia; ESPELHO com 5 poses de fisiculturismo (botão para sair).
   - Registrado com FutebolJS.registrarFase({ id: 'academia' }) só para o jogo saber baixar o arquivo; NÃO roda como fase.
     A cidade (cidade.js) baixa em segundo plano junto do pizzaria.js e chama criar(api) (api = apiAcademia() da cidade).
     O interior (recepção, catracas, aparelhos) vem do interiores.js (R.academia). Suba junto do cidade.js / interiores.js / jogo.js.
   - ACESSO: 400 fakes valem 7 dias (do dia em que pagou até 6 dias depois). Quem cobra é o DIEGO, no balcão da recepção.
     A linha de CATRACAS separa a recepção da área de treino: a da ESQUERDA é a ENTRADA (só de fora para dentro e só com o plano
     em dia) e a da DIREITA é a SAÍDA (só de dentro para fora; sempre deixa sair, mesmo com o plano vencido).
   - FERNANDA, a personal (cabelo vermelho marsala cacheado, pele branca, rosto delicado, top e legging pretos): 300 fakes por
     7 dias. Com ela, cada treino bem feito vale o DOBRO (0,2 em vez de 0,1). Ela acompanha o treino do lado do aparelho.
   - TREINOS (no máximo 3 por dia, contando os que deram errado; cada um leva 30 min do relógio e deixa o personagem suado):
       ESTEIRA → VELOCIDADE · ABDOMINAL → RESISTÊNCIA · SUPINO → FORÇA. Treino certo: +0,1 no atributo (até 10).
       Esteira: a lona puxa para trás cada vez mais rápido; cada toque é uma passada para a frente. Chegou no fim da lona: cai.
       Abdominal: o marcador vai e volta; toque com ele na faixa verde para subir. 10 subidas; 3 erros (ou o tempo acabar) = desiste.
       Supino: a barra pesa para baixo; toques rápidos empurram. 5 repetições; a barra parada no peito por 1,8 s (ou o tempo acabar) =
         a barra cai em cima dele e duas pessoas vêm tirar.
     Quanto maior o atributo, mais difícil o aparelho (até +25% no 10).
   - Salva em historia.cidade: academia = { conheceuDiego, conheceuFernanda, acessoAte, personalAte, treinoDia, treinos, total }.
   ===================================================================== */
(function () {
  'use strict';

  // ------------------------------------------------------------------ textos (pt → en, es, it, fr)
  const TRAD = {
    'Diego': ['Diego', 'Diego', 'Diego', 'Diego'], 'Fernanda': ['Fernanda', 'Fernanda', 'Fernanda', 'Fernanda'],
    'Falar com o Diego': ['Talk to Diego', 'Hablar con Diego', 'Parla con Diego', 'Parler à Diego'],
    'Falar com a Fernanda': ['Talk to Fernanda', 'Hablar con Fernanda', 'Parla con Fernanda', 'Parler à Fernanda'],
    'Catraca travada: pague o plano na recepção': ['Turnstile locked: pay for the plan at the front desk', 'Torniquete bloqueado: paga el plan en la recepción', 'Tornello bloccato: paga l’abbonamento alla reception', 'Tourniquet bloqué : paie l’abonnement à l’accueil'],
    'Esteira (velocidade)': ['Treadmill (speed)', 'Cinta (velocidad)', 'Tapis (velocità)', 'Tapis (vitesse)'],
    'Abdominal (resistência)': ['Sit-ups (stamina)', 'Abdominales (resistencia)', 'Addominali (resistenza)', 'Abdos (endurance)'],
    'Supino (força)': ['Bench press (strength)', 'Press de banca (fuerza)', 'Panca piana (forza)', 'Développé couché (force)'],
    'Treinos de hoje: {0}/{1}': ['Today’s workouts: {0}/{1}', 'Entrenamientos de hoy: {0}/{1}', 'Allenamenti di oggi: {0}/{1}', 'Entraînements du jour : {0}/{1}'],
    'Velocidade': ['Speed', 'Velocidad', 'Velocità', 'Vitesse'], 'Resistência': ['Stamina', 'Resistencia', 'Resistenza', 'Endurance'], 'Força': ['Strength', 'Fuerza', 'Forza', 'Force'],
    // Diego
    'Opa, bem-vindo! Eu sou o Diego, aqui da recepção.': ['Hey, welcome! I’m Diego, from the front desk.', '¡Hola, bienvenido! Soy Diego, de la recepción.', 'Ehi, benvenuto! Sono Diego, della reception.', 'Salut, bienvenue ! Je suis Diego, de l’accueil.'],
    'Para treinar aqui é {0} fakes por semana. Pagou, a catraca libera por 7 dias.': ['To train here it’s {0} fakes a week. Once you pay, the turnstile lets you in for 7 days.', 'Entrenar aquí cuesta {0} fakes por semana. Pagas y el torniquete te deja pasar 7 días.', 'Allenarsi qui costa {0} fakes a settimana. Paghi e il tornello ti fa passare per 7 giorni.', 'Pour s’entraîner ici, c’est {0} fakes la semaine. Tu paies et le tourniquet s’ouvre pendant 7 jours.'],
    'Quer pagar a semana?': ['Want to pay for the week?', '¿Quieres pagar la semana?', 'Vuoi pagare la settimana?', 'Tu veux payer la semaine ?'],
    'Pagar {0} fakes': ['Pay {0} fakes', 'Pagar {0} fakes', 'Paga {0} fakes', 'Payer {0} fakes'], 'Agora não': ['Not now', 'Ahora no', 'Non ora', 'Pas maintenant'],
    'Ver minha ficha de treino': ['See my training sheet', 'Ver mi ficha de entrenamiento', 'Vedi la mia scheda', 'Voir ma fiche d’entraînement'],
    'Tchau': ['Bye', 'Chao', 'Ciao', 'Salut'],
    'Ih, tá faltando grana aí... São {0} fakes.': ['Oops, you’re short on cash... It’s {0} fakes.', 'Uy, te falta plata... Son {0} fakes.', 'Ops, ti mancano soldi... Sono {0} fakes.', 'Oups, il te manque des sous... C’est {0} fakes.'],
    'Fechado! Seu plano vale até o dia {0}.': ['Deal! Your plan is valid until day {0}.', '¡Listo! Tu plan vale hasta el día {0}.', 'Fatto! Il tuo abbonamento vale fino al giorno {0}.', 'C’est bon ! Ton abonnement est valable jusqu’au jour {0}.'],
    'A catraca da esquerda é a entrada. Para sair, use a da direita.': ['The turnstile on the left is the entrance. To leave, use the one on the right.', 'El torniquete de la izquierda es la entrada. Para salir, usa el de la derecha.', 'Il tornello a sinistra è l’entrata. Per uscire, usa quello a destra.', 'Le tourniquet de gauche, c’est l’entrée. Pour sortir, prends celui de droite.'],
    'Lá dentro tem esteira, abdominal e supino. Dá para fazer até 3 treinos por dia, beleza?': ['Inside there’s a treadmill, sit-ups and bench press. You can do up to 3 workouts a day, okay?', 'Adentro hay cinta, abdominales y press de banca. Puedes hacer hasta 3 entrenamientos por día, ¿vale?', 'Dentro ci sono tapis, addominali e panca. Puoi fare fino a 3 allenamenti al giorno, ok?', 'Dedans il y a le tapis, les abdos et le développé couché. Tu peux faire jusqu’à 3 entraînements par jour, ok ?'],
    'E se quiser evoluir mais rápido, fala com a Fernanda, a nossa personal.': ['And if you want to improve faster, talk to Fernanda, our personal trainer.', 'Y si quieres mejorar más rápido, habla con Fernanda, nuestra entrenadora personal.', 'E se vuoi migliorare più in fretta, parla con Fernanda, la nostra personal trainer.', 'Et si tu veux progresser plus vite, parle à Fernanda, notre coach personnelle.'],
    'Seu plano vale até o dia {0}. Bom treino!': ['Your plan is valid until day {0}. Have a good workout!', 'Tu plan vale hasta el día {0}. ¡Buen entrenamiento!', 'Il tuo abbonamento vale fino al giorno {0}. Buon allenamento!', 'Ton abonnement est valable jusqu’au jour {0}. Bon entraînement !'],
    'Seu plano venceu. Quer renovar por mais uma semana? São {0} fakes.': ['Your plan has expired. Want to renew it for another week? It’s {0} fakes.', 'Tu plan venció. ¿Quieres renovarlo por otra semana? Son {0} fakes.', 'Il tuo abbonamento è scaduto. Vuoi rinnovarlo per un’altra settimana? Sono {0} fakes.', 'Ton abonnement a expiré. Tu veux le renouveler pour une semaine ? C’est {0} fakes.'],
    'Precisa pagar o plano aqui no balcão primeiro!': ['You need to pay for the plan here at the desk first!', '¡Primero tienes que pagar el plan aquí en el mostrador!', 'Prima devi pagare l’abbonamento qui al bancone!', 'Il faut d’abord payer l’abonnement ici au comptoir !'],
    'Sua ficha: Velocidade {0} · Resistência {1} · Força {2}.': ['Your sheet: Speed {0} · Stamina {1} · Strength {2}.', 'Tu ficha: Velocidad {0} · Resistencia {1} · Fuerza {2}.', 'La tua scheda: Velocità {0} · Resistenza {1} · Forza {2}.', 'Ta fiche : Vitesse {0} · Endurance {1} · Force {2}.'],
    'Treinos de hoje: {0} de {1}. Treinos no total: {2}.': ['Workouts today: {0} of {1}. Total workouts: {2}.', 'Entrenamientos de hoy: {0} de {1}. Entrenamientos en total: {2}.', 'Allenamenti di oggi: {0} su {1}. Allenamenti in totale: {2}.', 'Entraînements du jour : {0} sur {1}. Entraînements au total : {2}.'],
    'Com a Fernanda até o dia {0}: cada treino vale o dobro.': ['With Fernanda until day {0}: each workout counts double.', 'Con Fernanda hasta el día {0}: cada entrenamiento vale el doble.', 'Con Fernanda fino al giorno {0}: ogni allenamento vale il doppio.', 'Avec Fernanda jusqu’au jour {0} : chaque entraînement compte double.'],
    // Fernanda
    'Oi! Eu sou a Fernanda, personal trainer aqui da academia.': ['Hi! I’m Fernanda, the personal trainer here at the gym.', '¡Hola! Soy Fernanda, entrenadora personal del gimnasio.', 'Ciao! Sono Fernanda, la personal trainer della palestra.', 'Salut ! Je suis Fernanda, la coach personnelle de la salle.'],
    'Treinando comigo, cada treino bem feito vale o dobro. São {0} fakes pela semana.': ['Training with me, every well-done workout counts double. It’s {0} fakes for the week.', 'Entrenando conmigo, cada entrenamiento bien hecho vale el doble. Son {0} fakes por la semana.', 'Allenandoti con me, ogni allenamento fatto bene vale il doppio. Sono {0} fakes per la settimana.', 'Avec moi, chaque entraînement bien fait compte double. C’est {0} fakes la semaine.'],
    'Quer treinar comigo esta semana?': ['Want to train with me this week?', '¿Quieres entrenar conmigo esta semana?', 'Vuoi allenarti con me questa settimana?', 'Tu veux t’entraîner avec moi cette semaine ?'],
    'Contratar ({0} fakes)': ['Hire her ({0} fakes)', 'Contratar ({0} fakes)', 'Ingaggiala ({0} fakes)', 'L’engager ({0} fakes)'],
    'Sem grana agora? Tranquilo, quando quiser é só me chamar.': ['No cash right now? No problem, just call me whenever you want.', '¿Sin plata ahora? Tranquilo, cuando quieras me llamas.', 'Niente soldi adesso? Tranquillo, quando vuoi chiamami.', 'Pas d’argent maintenant ? Pas de souci, appelle-moi quand tu veux.'],
    'Combinado! Até o dia {0} eu acompanho os seus treinos.': ['Deal! Until day {0} I’ll be with you in your workouts.', '¡Trato hecho! Hasta el día {0} te acompaño en los entrenamientos.', 'Affare fatto! Fino al giorno {0} ti seguo negli allenamenti.', 'Marché conclu ! Jusqu’au jour {0}, je suis tes entraînements.'],
    'É só ir para um aparelho que eu chego do seu lado.': ['Just go to a machine and I’ll come over.', 'Ve a un aparato y yo voy a tu lado.', 'Vai a un attrezzo e io arrivo al tuo fianco.', 'Va sur un appareil et j’arrive à côté de toi.'],
    'Tranquilo! Se mudar de ideia, eu tô por aqui.': ['No problem! If you change your mind, I’m around.', '¡Tranquilo! Si cambias de idea, estoy por aquí.', 'Tranquillo! Se cambi idea, sono qui.', 'Pas de souci ! Si tu changes d’avis, je suis là.'],
    'Na esteira, o segredo é o ritmo: não deixe a lona te levar para trás.': ['On the treadmill, rhythm is everything: don’t let the belt pull you back.', 'En la cinta, el secreto es el ritmo: no dejes que la cinta te lleve hacia atrás.', 'Sul tapis, il segreto è il ritmo: non farti trascinare indietro.', 'Sur le tapis, tout est dans le rythme : ne te laisse pas emporter vers l’arrière.'],
    'No abdominal, sobe só quando o marcador estiver no verde. Sem pressa!': ['For sit-ups, only go up when the marker is in the green. No rush!', 'En los abdominales, sube solo cuando el marcador esté en el verde. ¡Sin prisa!', 'Negli addominali, sali solo quando l’indicatore è nel verde. Senza fretta!', 'Pour les abdos, remonte seulement quand le curseur est dans le vert. Sans te presser !'],
    'No supino, não deixa a barra parar no peito. Empurra sem dó!': ['On the bench press, don’t let the bar rest on your chest. Push hard!', 'En el press, no dejes que la barra se quede en el pecho. ¡Empuja con todo!', 'Sulla panca, non lasciare la barra ferma sul petto. Spingi forte!', 'Au développé, ne laisse pas la barre sur la poitrine. Pousse fort !'],
    'Nosso combinado vale até o dia {0}. Bora treinar!': ['Our deal is valid until day {0}. Let’s train!', 'Nuestro trato vale hasta el día {0}. ¡A entrenar!', 'Il nostro accordo vale fino al giorno {0}. Allenamoci!', 'Notre accord est valable jusqu’au jour {0}. Allez, on s’entraîne !'],
    'Bora! Eu tô aqui do seu lado.': ['Let’s go! I’m right here with you.', '¡Vamos! Estoy aquí a tu lado.', 'Forza! Sono qui accanto a te.', 'Allez ! Je suis juste à côté.'],
    'Isso aí! Mandou bem demais!': ['That’s it! Awesome job!', '¡Eso es! ¡Lo hiciste genial!', 'Così! Bravissimo!', 'C’est ça ! Super boulot !'],
    // (6.3.0) o que a Fernanda diz quando o treino dá errado (cada motivo tem as suas falas)
    'A lona ganhou de você! O segredo é o ritmo: passadas curtas e constantes, sem desesperar.': ['The belt won! The secret is rhythm: short, steady strides, no panicking.', '¡La cinta ganó! El secreto es el ritmo: pasos cortos y constantes, sin desesperarte.', 'Il tappeto ha vinto! Il segreto è il ritmo: passi corti e costanti, senza farsi prendere dal panico.', 'Le tapis a gagné ! Le secret, c’est le rythme : des foulées courtes et régulières, sans paniquer.'],
    'Você deixou a lona te puxar no final. Respira, olha para a frente e segura o ritmo!': ['You let the belt pull you back at the end. Breathe, look ahead and hold the pace!', 'Dejaste que la cinta te llevara hacia atrás al final. ¡Respira, mira al frente y mantén el ritmo!', 'Alla fine hai lasciato che il tappeto ti trascinasse. Respira, guarda avanti e mantieni il ritmo!', 'Tu t’es laissé tirer par le tapis à la fin. Respire, regarde devant toi et tiens le rythme !'],
    'Você subiu fora do verde várias vezes. Espera o marcador chegar e só então sobe!': ['You went up outside the green several times. Wait for the marker to get there, then go up!', 'Subiste fuera del verde varias veces. ¡Espera a que el marcador llegue y solo entonces sube!', 'Sei salito fuori dal verde più volte. Aspetta che l’indicatore arrivi e solo allora sali!', 'Tu es monté hors du vert plusieurs fois. Attends que le repère arrive, et seulement là, monte !'],
    'Pressa não ajuda no abdominal. Olha o marcador e sobe só na faixa verde.': ['Rushing doesn’t help with sit-ups. Watch the marker and only go up in the green band.', 'La prisa no ayuda en los abdominales. Mira el marcador y sube solo en la franja verde.', 'La fretta non aiuta negli addominali. Guarda l’indicatore e sali solo nella fascia verde.', 'Se presser n’aide pas pour les abdos. Regarde le repère et monte seulement dans la zone verte.'],
    'O tempo acabou antes de você terminar. Faz menos pausa entre uma subida e outra!': ['Time ran out before you finished. Rest less between one rep and the next!', 'Se acabó el tiempo antes de terminar. ¡Descansa menos entre una subida y otra!', 'Il tempo è finito prima che tu finissi. Fai meno pause tra una salita e l’altra!', 'Le temps s’est écoulé avant la fin. Fais moins de pause entre deux montées !'],
    'Faltou fôlego no final. Respira na descida e sobe soltando o ar!': ['You ran out of breath at the end. Breathe in on the way down and out on the way up!', 'Te faltó aire al final. ¡Inspira al bajar y suelta el aire al subir!', 'Ti è mancato il fiato alla fine. Inspira in discesa ed espira in salita!', 'Il t’a manqué du souffle à la fin. Inspire en descendant et expire en montant !'],
    'Eu avisei: não deixa a barra parar no peito! Na próxima, empurra sem dó.': ['I warned you: don’t let the bar rest on your chest! Next time, push hard.', '¡Te lo advertí: no dejes la barra parada en el pecho! La próxima, empuja con todo.', 'Te l’avevo detto: non lasciare la barra ferma sul petto! La prossima volta spingi forte.', 'Je t’avais prévenu : ne laisse pas la barre sur ta poitrine ! La prochaine fois, pousse à fond.'],
    'A barra desceu e você travou. Respira fundo e empurra no tempo certo!': ['The bar came down and you froze. Take a deep breath and push at the right moment!', 'La barra bajó y te bloqueaste. ¡Respira hondo y empuja en el momento justo!', 'La barra è scesa e ti sei bloccato. Respira a fondo e spingi al momento giusto!', 'La barre est descendue et tu t’es bloqué. Respire à fond et pousse au bon moment !'],
    'Faltou força para fechar as repetições. Amanhã a gente treina com mais constância!': ['You didn’t have the strength to finish the reps. Tomorrow we’ll train more consistently!', 'Faltó fuerza para terminar las repeticiones. ¡Mañana entrenamos con más constancia!', 'Mancava la forza per finire le ripetizioni. Domani ci alleniamo con più costanza!', 'Il a manqué de la force pour finir les répétitions. Demain, on s’entraîne avec plus de régularité !'],
    'Sem pressa: o supino é um empurrão firme de cada vez. Amanhã você fecha as cinco!': ['No rush: the bench press is one firm push at a time. Tomorrow you’ll finish all five!', 'Sin prisa: el press de banca es un empujón firme cada vez. ¡Mañana terminas las cinco!', 'Senza fretta: la panca è una spinta decisa alla volta. Domani le chiudi tutte e cinque!', 'Pas de précipitation : le développé couché, c’est une poussée ferme à la fois. Demain tu finis les cinq !'],
    // (6.3.0) o espelho (poses de fisiculturismo)
    'Espelho': ['Mirror', 'Espejo', 'Specchio', 'Miroir'],
    'Posar no espelho': ['Pose in the mirror', 'Posar en el espejo', 'Posa allo specchio', 'Poser devant le miroir'],
    'Próxima pose ▶': ['Next pose ▶', 'Siguiente pose ▶', 'Posa successiva ▶', 'Pose suivante ▶'],
    'Sair do espelho': ['Leave the mirror', 'Salir del espejo', 'Lascia lo specchio', 'Quitter le miroir'],
    'Duplo bíceps': ['Double biceps', 'Doble bíceps', 'Doppio bicipite', 'Double biceps'],
    'Dorsal aberto': ['Lat spread', 'Dorsal abierto', 'Dorsali aperti', 'Dorsaux écartés'],
    'Peitoral lateral': ['Side chest', 'Pectoral lateral', 'Pettorale laterale', 'Pectoraux de profil'],
    'Abdômen e coxas': ['Abs and thighs', 'Abdomen y muslos', 'Addominali e cosce', 'Abdos et cuisses'],
    'Mais musculoso': ['Most muscular', 'Más musculoso', 'Più muscoloso', 'Le plus musclé'],
    // (6.3.0) não repete o treino que deu errado no mesmo dia
    'Errou hoje: indisponível': ['Failed today: unavailable', 'Fallaste hoy: no disponible', 'Sbagliato oggi: non disponibile', 'Raté aujourd’hui : indisponible'],
    'Já errei na esteira hoje. Melhor tentar outro aparelho ou voltar amanhã.': ['I already messed up the treadmill today. Better try another machine or come back tomorrow.', 'Ya fallé en la cinta hoy. Mejor probar otro aparato o volver mañana.', 'Ho già sbagliato sul tapis oggi. Meglio provare un altro attrezzo o tornare domani.', 'J’ai déjà raté le tapis aujourd’hui. Mieux vaut essayer un autre appareil ou revenir demain.'],
    'Já errei no abdominal hoje. Melhor tentar outro aparelho ou voltar amanhã.': ['I already messed up the sit-ups today. Better try another machine or come back tomorrow.', 'Ya fallé en los abdominales hoy. Mejor probar otro aparato o volver mañana.', 'Ho già sbagliato gli addominali oggi. Meglio provare un altro attrezzo o tornare domani.', 'J’ai déjà raté les abdos aujourd’hui. Mieux vaut essayer un autre appareil ou revenir demain.'],
    'Já errei no supino hoje. Melhor tentar outro aparelho ou voltar amanhã.': ['I already messed up the bench press today. Better try another machine or come back tomorrow.', 'Ya fallé en el press de banca hoy. Mejor probar otro aparato o volver mañana.', 'Ho già sbagliato la panca piana oggi. Meglio provare un altro attrezzo o tornare domani.', 'J’ai déjà raté le développé couché aujourd’hui. Mieux vaut essayer un autre appareil ou revenir demain.'],
    // aparelhos e regras
    'Você já fez os {0} treinos de hoje. Descanse e volte amanhã!': ['You’ve already done today’s {0} workouts. Rest and come back tomorrow!', 'Ya hiciste los {0} entrenamientos de hoy. ¡Descansa y vuelve mañana!', 'Hai già fatto i {0} allenamenti di oggi. Riposa e torna domani!', 'Tu as déjà fait les {0} entraînements du jour. Repose-toi et reviens demain !'],
    'Seu plano venceu. Renove com o Diego, na recepção.': ['Your plan has expired. Renew it with Diego at the front desk.', 'Tu plan venció. Renuévalo con Diego, en la recepción.', 'Il tuo abbonamento è scaduto. Rinnovalo con Diego alla reception.', 'Ton abonnement a expiré. Renouvelle-le avec Diego à l’accueil.'],
    'ESTEIRA · VELOCIDADE': ['TREADMILL · SPEED', 'CINTA · VELOCIDAD', 'TAPIS · VELOCITÀ', 'TAPIS · VITESSE'],
    'ABDOMINAL · RESISTÊNCIA': ['SIT-UPS · STAMINA', 'ABDOMINALES · RESISTENCIA', 'ADDOMINALI · RESISTENZA', 'ABDOS · ENDURANCE'],
    'SUPINO · FORÇA': ['BENCH PRESS · STRENGTH', 'PRESS DE BANCA · FUERZA', 'PANCA PIANA · FORZA', 'DÉVELOPPÉ COUCHÉ · FORCE'],
    'A lona puxa você para trás, cada vez mais rápido. Cada toque é uma passada para a frente. Aguente {0} segundos sem chegar no fim da esteira!': ['The belt pulls you back, faster and faster. Each tap is a stride forward. Last {0} seconds without reaching the end of the treadmill!', 'La cinta te jala hacia atrás, cada vez más rápido. Cada toque es una zancada hacia adelante. ¡Aguanta {0} segundos sin llegar al final de la cinta!', 'Il nastro ti tira indietro, sempre più veloce. Ogni tocco è un passo in avanti. Resisti {0} secondi senza arrivare in fondo al tapis!', 'Le tapis te tire en arrière, de plus en plus vite. Chaque appui est une foulée vers l’avant. Tiens {0} secondes sans atteindre le bout du tapis !'],
    'O marcador vai e volta. Toque quando ele estiver na faixa verde para subir. Faça {0} abdominais; {1} erros e você desiste.': ['The marker swings back and forth. Tap when it’s in the green band to come up. Do {0} sit-ups; {1} misses and you give up.', 'El marcador va y viene. Toca cuando esté en la franja verde para subir. Haz {0} abdominales; con {1} errores te rindes.', 'L’indicatore va avanti e indietro. Tocca quando è nella fascia verde per salire. Fai {0} addominali; con {1} errori ti arrendi.', 'Le curseur fait des allers-retours. Appuie quand il est dans la bande verte pour remonter. Fais {0} abdos ; {1} ratés et tu abandonnes.'],
    'A barra pesa para baixo. Toque rápido para empurrar até em cima. Faça {0} repetições e não deixe a barra parada no peito!': ['The bar pulls down. Tap fast to push it all the way up. Do {0} reps and don’t let the bar rest on your chest!', 'La barra pesa hacia abajo. Toca rápido para empujarla hasta arriba. ¡Haz {0} repeticiones y no dejes la barra quieta en el pecho!', 'La barra spinge giù. Tocca veloce per spingerla fino in cima. Fai {0} ripetizioni e non lasciare la barra ferma sul petto!', 'La barre tire vers le bas. Appuie vite pour la pousser jusqu’en haut. Fais {0} répétitions et ne laisse pas la barre posée sur la poitrine !'],
    'Começar': ['Start', 'Empezar', 'Inizia', 'Commencer'], 'Desistir': ['Give up', 'Rendirse', 'Rinuncia', 'Abandonner'],
    'TOQUE': ['TAP', 'TOCA', 'TOCCA', 'TAPE'], 'VAI!': ['GO!', '¡YA!', 'VIA!', 'GO !'],
    'Ritmo': ['Pace', 'Ritmo', 'Ritmo', 'Rythme'], '{0} km/h': ['{0} km/h', '{0} km/h', '{0} km/h', '{0} km/h'],
    'Abdominais: {0}/{1} · erros: {2}/{3}': ['Sit-ups: {0}/{1} · misses: {2}/{3}', 'Abdominales: {0}/{1} · errores: {2}/{3}', 'Addominali: {0}/{1} · errori: {2}/{3}', 'Abdos : {0}/{1} · ratés : {2}/{3}'],
    'Repetições: {0}/{1}': ['Reps: {0}/{1}', 'Repeticiones: {0}/{1}', 'Ripetizioni: {0}/{1}', 'Répétitions : {0}/{1}'],
    'Treino concluído!': ['Workout done!', '¡Entrenamiento completado!', 'Allenamento completato!', 'Entraînement terminé !'],
    'Não foi dessa vez...': ['Not this time...', 'Esta vez no...', 'Non stavolta...', 'Pas cette fois...'],
    '+{0} em {1} ({2} → {3})': ['+{0} {1} ({2} → {3})', '+{0} en {1} ({2} → {3})', '+{0} in {1} ({2} → {3})', '+{0} en {1} ({2} → {3})'],
    '{0} já está no máximo (10).': ['{0} is already at the maximum (10).', '{0} ya está al máximo (10).', '{0} è già al massimo (10).', '{0} est déjà au maximum (10).'],
    'Sem ganho neste treino.': ['No gain from this workout.', 'Sin progreso en este entrenamiento.', 'Nessun progresso in questo allenamento.', 'Aucun progrès sur cet entraînement.'],
    'Com a Fernanda: ganho em dobro!': ['With Fernanda: double gain!', 'Con Fernanda: ¡progreso doble!', 'Con Fernanda: progresso doppio!', 'Avec Fernanda : progrès doublé !'],
    'Continuar ▶': ['Continue ▶', 'Continuar ▶', 'Continua ▶', 'Continuer ▶'],
    'Eita! Tá tudo bem aí?': ['Whoa! Are you okay?', '¡Epa! ¿Estás bien?', 'Ehi! Tutto bene?', 'Oh là ! Ça va ?'],
    'Ai... ninguém viu isso, né?': ['Ouch... nobody saw that, right?', 'Ay... nadie vio eso, ¿no?', 'Ahi... nessuno ha visto, vero?', 'Aïe... personne n’a vu ça, hein ?'],
    'Desisto... não dá mais...': ['I give up... I can’t anymore...', 'Me rindo... ya no puedo...', 'Mi arrendo... non ce la faccio più...', 'J’abandonne... j’en peux plus...'],
    'Socorro! Tira isso de mim!': ['Help! Get this off me!', '¡Socorro! ¡Quítenme esto!', 'Aiuto! Toglietemi questa roba!', 'Au secours ! Enlevez-moi ça !'],
    'Calma, a gente tira! Um, dois... já!': ['Easy, we’ve got it! One, two... up!', '¡Tranquilo, la sacamos! Uno, dos... ¡ya!', 'Calma, la togliamo noi! Uno, due... via!', 'Du calme, on l’enlève ! Un, deux... hop !'],
    'Valeu... meu peito...': ['Thanks... my chest...', 'Gracias... mi pecho...', 'Grazie... il mio petto...', 'Merci... ma poitrine...'],
    'Ufa! Mandei bem!': ['Phew! Nailed it!', '¡Uf! ¡Lo hice bien!', 'Uff! Ce l’ho fatta!', 'Ouf ! J’ai assuré !'],
    'Alguém': ['Someone', 'Alguien', 'Qualcuno', 'Quelqu’un'],
    // (6.3.0) horário de funcionamento
    'Academia fechada. Abre às 7h.': ['Gym closed. Opens at 7 AM.', 'Gimnasio cerrado. Abre a las 7h.', 'Palestra chiusa. Apre alle 7.', 'Salle de sport fermée. Ouvre à 7 h.'],
    'Academia fechada. Abre às 13h.': ['Gym closed. Opens at 1 PM.', 'Gimnasio cerrado. Abre a las 13h.', 'Palestra chiusa. Apre alle 13.', 'Salle de sport fermée. Ouvre à 13 h.'],
    'Pessoal, vamos fechar para o almoço! A gente volta às 13h.': ['Folks, we’re closing for lunch! We’ll be back at 1 PM.', '¡Chicos, cerramos para el almuerzo! Volvemos a las 13h.', 'Ragazzi, chiudiamo per il pranzo! Riapriamo alle 13.', 'On ferme pour le déjeuner ! On rouvre à 13 h.'],
    'Já são 22h, vamos fechar! A gente se vê amanhã, a partir das 7h.': ['It’s 10 PM, we’re closing! See you tomorrow, from 7 AM.', 'Son las 22h, ¡cerramos! Nos vemos mañana, desde las 7h.', 'Sono le 22, chiudiamo! Ci vediamo domani, dalle 7.', 'Il est 22 h, on ferme ! À demain, dès 7 h.'],
    'Já está quase na hora de fechar: não dá tempo de fazer outro treino.': ['It’s almost closing time: there’s no time for another workout.', 'Ya casi es hora de cerrar: no hay tiempo para otro entrenamiento.', 'È quasi ora di chiudere: non c’è tempo per un altro allenamento.', 'C’est bientôt la fermeture : pas le temps pour un autre entraînement.'],
  };
  for (const k of Object.keys(TRAD)) if (!I18N[k]) I18N[k] = TRAD[k];

  // ------------------------------------------------------------------ regras
  const PRECO_ACESSO = 400, PRECO_PERSONAL = 300, DIAS_PLANO = 7, TREINOS_DIA = 3, GANHO = 0.1, HORAS_TREINO = 0.5;
  // (6.3.0) HORÁRIO: abre das 7h às 11h, fecha para o almoço, reabre das 13h às 22h. O Diego e a Fernanda chegam 6 min antes de cada abertura
  //   (vindos das casas deles) e saem na hora de fechar. Os frequentadores vão saindo aos poucos (começam entre 20h30 e 21h00; às 21h30 não sobra ninguém).
  const H_ABRE = 7, H_ALMOCO = 11, H_VOLTA = 13, H_FECHA = 22, H_CHEGA_ANTES = 0.1, H_SAI_DE = 20.5, H_SAI_ATE = 21.0, VEL_SAIDA = 1.8;   // começam a sair das 20h30 às 21h00 (a caminhada até a porta leva até ~25 min): às 21h30 não há mais ninguém
  const ATRIB = { esteira: 'velocidade', abdominal: 'resistencia', supino: 'forca' };
  const NOME_ATRIB = { velocidade: 'Velocidade', resistencia: 'Resistência', forca: 'Força' };
  const TITULO = { esteira: 'ESTEIRA · VELOCIDADE', abdominal: 'ABDOMINAL · RESISTÊNCIA', supino: 'SUPINO · FORÇA' };
  const DICA_FER = { esteira: 'Na esteira, o segredo é o ritmo: não deixe a lona te levar para trás.', abdominal: 'No abdominal, sobe só quando o marcador estiver no verde. Sem pressa!', supino: 'No supino, não deixa a barra parar no peito. Empurra sem dó!' };
  // (6.3.0) a fala da Fernanda quando o treino dá errado: depende do treino e do motivo (e muda de uma vez para a outra)
  const FALAS_ERRO = {
    esteira: { queda: ['A lona ganhou de você! O segredo é o ritmo: passadas curtas e constantes, sem desesperar.', 'Você deixou a lona te puxar no final. Respira, olha para a frente e segura o ritmo!'] },
    abdominal: { erros: ['Você subiu fora do verde várias vezes. Espera o marcador chegar e só então sobe!', 'Pressa não ajuda no abdominal. Olha o marcador e sobe só na faixa verde.'],
      tempo: ['O tempo acabou antes de você terminar. Faz menos pausa entre uma subida e outra!', 'Faltou fôlego no final. Respira na descida e sobe soltando o ar!'] },
    supino: { peito: ['Eu avisei: não deixa a barra parar no peito! Na próxima, empurra sem dó.', 'A barra desceu e você travou. Respira fundo e empurra no tempo certo!'],
      tempo: ['Faltou força para fechar as repetições. Amanhã a gente treina com mais constância!', 'Sem pressa: o supino é um empurrão firme de cada vez. Amanhã você fecha as cinco!'] },
  };
  const JA_ERREI = { esteira: 'Já errei na esteira hoje. Melhor tentar outro aparelho ou voltar amanhã.', abdominal: 'Já errei no abdominal hoje. Melhor tentar outro aparelho ou voltar amanhã.', supino: 'Já errei no supino hoje. Melhor tentar outro aparelho ou voltar amanhã.' };
  // esteira: duração, velocidade da lona (de/até, em "posição por segundo") e quanto cada toque empurra para a frente
  const EST = { dur: 12, v0: 0.28, v1: 0.6, toque: 0.13 };
  // abdominal: repetições, erros, tempo, velocidade do marcador (vai e volta por segundo) e a faixa verde (fração da barra)
  const ABD = { reps: 10, erros: 3, dur: 18, vel0: 0.85, cansa: 0.06, faixa0: 0.26, faixa1: 0.16, sobe: 0.45 };
  // supino: repetições, tempo, "peso" (descida por segundo), cada toque, tempo máximo com a barra no peito
  const SUP = { reps: 5, dur: 16, peso: 0.42, toque: 0.16, cansa: 0.08, peito: 1.8, desce: 0.6 };
  // ângulos dos braços (resolvidos à parte: mão no lugar certo para cada pose; braço esquerdo, o direito é espelhado)
  //   [abre (x), frente (z), cotovelo x, cotovelo z]
  const BR = {
    supBaixo: [1.242, 0.286, -0.573, 2.098],          // barra no peito: cotovelos abertos, antebraço em pé
    supCima: [0.115, 1.487, 0.001, 0.001],            // braços esticados para cima
    nuca: [3.107, 0.142, 2.108, 1.988],               // mãos atrás da cabeça (abdominal)
    estrela: [2.155, 0.33, 0, 0],                     // braços jogados no chão (desistiu)
  };

  // ------------------------------------------------------------------ sons (como os do pizzaria.js)
  let ruido = null;
  function audio() { if (typeof Som === 'undefined' || !Som.audio || Som.mudo) return null; return Som.audio; }
  function tom(A, f, t, dur, vol, tipo, ate) {
    const o = A.ctx.createOscillator(), g = A.ctx.createGain(); o.type = tipo || 'sine'; o.frequency.setValueAtTime(f, t); if (ate) o.frequency.exponentialRampToValueAtTime(ate, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(A.mestre); o.start(t); o.stop(t + dur + 0.02);
  }
  function chiado(A, t, dur, vol, freq) {
    const c = A.ctx; if (!ruido || ruido.sampleRate !== c.sampleRate) { ruido = c.createBuffer(1, c.sampleRate, c.sampleRate); const d = ruido.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s.buffer = ruido; f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = 1.2;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(f); f.connect(g); g.connect(A.mestre); s.start(t, Math.random() * 0.5, dur + 0.02);
  }
  const com = (fn) => () => { const A = audio(); if (!A) return; try { fn(A, A.ctx.currentTime + 0.01); } catch (e) { /* sem som */ } };
  const SOM = {
    catraca: com((A, t) => { chiado(A, t, 0.06, 0.12, 2200); tom(A, 320, t + 0.03, 0.08, 0.05, 'square'); chiado(A, t + 0.12, 0.05, 0.08, 1800); }),
    travada: com((A, t) => { tom(A, 180, t, 0.18, 0.08, 'square'); tom(A, 150, t + 0.2, 0.22, 0.08, 'square'); }),
    toque: com((A, t) => tom(A, 900, t, 0.04, 0.03, 'square')),
    certo: com((A, t) => { for (const [i, f] of [[0, 660], [1, 880], [2, 1320]]) tom(A, f, t + i * 0.08, 0.14, 0.05, 'triangle'); }),
    erro: com((A, t) => tom(A, 220, t, 0.25, 0.07, 'square', 110)),
    tombo: com((A, t) => { chiado(A, t, 0.35, 0.25, 500); tom(A, 90, t, 0.35, 0.14, 'sine', 40); }),
    barra: com((A, t) => { chiado(A, t, 0.3, 0.2, 1500); tom(A, 140, t, 0.3, 0.12, 'triangle', 60); tom(A, 2400, t, 0.4, 0.03, 'sine'); }),
    conta: com((A, t) => tom(A, 660, t, 0.12, 0.05, 'square')),
    vai: com((A, t) => tom(A, 1320, t, 0.25, 0.06, 'square')),
    vitoria: com((A, t) => { for (const [i, f] of [[0, 523], [1, 659], [2, 784], [3, 1047]]) tom(A, f, t + i * 0.1, 0.22, 0.05, 'triangle'); }),
  };
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pk = (l) => l[Math.floor(Math.random() * l.length)];
  const clampN = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerpN = (a, b, k) => a + (b - a) * k;
  const suave = (k) => { k = clampN(k, 0, 1); return k * k * (3 - 2 * k); };
  const fmt1 = (v) => (Math.round(v * 10) / 10).toFixed(1).replace('.', Idioma && Idioma.atual === 'en' ? '.' : ',');

  // ================================================================== o módulo (um por cidade aberta)
  function criar(api) {
    const S = () => api.S();
    const M = { R: null, A: null, diego: null, fer: null, npcs: [], mg: null, halteres: [], toqueTravada: 0, beltOff: 0 };
    const dadosA = () => { const d = S().dados; if (!d.academia) d.academia = {}; return d.academia; };
    const dia = () => S().dados.dia || 1;
    const temAcesso = () => (dadosA().acessoAte || 0) > dia();
    const temPersonal = () => (dadosA().personalAte || 0) > dia();
    const treinosHoje = () => { const a = dadosA(); return a.treinoDia === dia() ? (a.treinos | 0) : 0; };
    // (6.3.0) o treino que deu errado não pode ser repetido no mesmo dia (vale de novo amanhã)
    const falhouHoje = (tipo) => { const a = dadosA(); return a.falhouDia === dia() && !!(a.falhou && a.falhou[tipo]); };
    const marcarFalha = (tipo) => { const a = dadosA(); if (a.falhouDia !== dia()) { a.falhouDia = dia(); a.falhou = {}; } a.falhou[tipo] = 1; };
    const dentroAcad = () => { const s = S(); return !!(s && s.dentro && s.dentro.nome === 'academia' && M.A); };
    const nivel = (n) => { const at = api.atributosJogador(); return +at[n] || 5; };
    const dificuldade = (tipo) => 1 + clampN(nivel(ATRIB[tipo]) - 5, 0, 5) * 0.05;
    // (6.3.0) horário: 7h–11h e 13h–22h
    const hora = () => S().dados.hora;
    const aberto = () => { const h = hora(); return (h >= H_ABRE && h < H_ALMOCO) || (h >= H_VOLTA && h < H_FECHA); };
    const rotuloFechada = () => { const h = hora(); return T(h >= H_ALMOCO && h < H_VOLTA ? 'Academia fechada. Abre às 13h.' : 'Academia fechada. Abre às 7h.'); };
    const horasParaFechar = () => { const h = hora(); return h < H_ALMOCO ? H_ALMOCO - h : h >= H_VOLTA && h < H_FECHA ? H_FECHA - h : 0; };

    // ---------------------------------------------------------------- pessoas
    function modelo(ap, fem, roupa, cores) {
      const s = S(); let m = null, opt = null;
      try { if (s.f2 && s.f2.modeloPessoa) { const r = s.f2.modeloPessoa({ ap, fem, roupa, cores }); m = r.m; opt = r.opt; } } catch (e) { console.warn('[Academia] modelo:', e); }
      if (!m) { opt = Object.assign({ camisa: cores[0], listra: cores[0], gola: cores[2], calcao: cores[1], meia: cores[1], sola: '#e6e6e0', corTexto: '#F2F2EE', numero: '', nome: ' ', fundoNome: 'rgba(0,0,0,0)', manga: 0, meiao: 1, cabecao: 1, escala: 1 }, ap); m = makeAthlete(opt); m.etiqueta.visible = false; m.sombra.visible = false; }
      return { m, opt };
    }
    const acha = (lista, n) => Math.max(0, lista.findIndex((x) => x.nome === n));
    function criarDiego() {
      const ap = { pele: PELES_FITZ[3].cor, cabelo: CORES_CABELO[0].cor, estilo: acha(ESTILOS_CABELO, 'Degradê com risco'), rosto: acha(ROSTOS, 'Sorridente'), labio: 4, barba: acha(ESTILOS_BARBA, 'Cavanhaque'), corBarba: CORES_CABELO[0].cor };
      const { m, opt } = modelo(ap, false, 3, ['#1c1c1f', '#2a2a2e', '#f2c230', '#f2c230']);           // polo preta da academia
      const A = api.atorDe(m, opt, 'acadNPC'); A.poseA = 'balcao'; return A;
    }
    const PR_POS = { x: 0.40, y: 1.11, z: -0.05, rz: -0.6 };            // a prancheta no tronco da Fernanda (borda de baixo, na ponta dos dedos da mão esquerda)
    // A FERNANDA: cabelo vermelho marsala cacheado, pele branca, rosto delicado, top e legging pretos (+ prancheta na mão)
    const AP_FERNANDA = () => ({ pele: PELES_FITZ[1].cor, cabelo: '#6e1a2e', estilo: acha(ESTILOS_CABELO, 'Cacheado volumoso'), rosto: acha(ROSTOS, 'Delicada'), labio: 1, barba: 0, corBarba: '#6e1a2e' });
    function criarFernanda() {
      const { m, opt } = modelo(AP_FERNANDA(), true, 19, ['#151517', '#151517', '#2a2a2e', '#151517']);   // "Top e calça": top preto + legging preta
      // a prancheta fica presa ao tronco, na frente do peito e inclinada para ela (a face com o papel virada para os olhos); a mão
      //   esquerda (PR_MAO_E) só encosta de leve na borda de baixo. Assim ela aparece inteira (antes ficava dentro da mão) e não some
      //   quando o braço "desliga" o cotovelo.
      const G = new api.Geo(); G.box(0.024, 0.32, 0.24, '#8a5a2a', 0, 0.06, 0); G.box(0.006, 0.26, 0.2, '#f4f4ec', -0.014, 0.08, 0); G.box(0.014, 0.035, 0.08, '#c9ced4', -0.017, 0.34, 0);   // (a base em y > 0,05: o Geo desenha a face de baixo)
      for (const y of [0.29, 0.25, 0.21, 0.17, 0.13]) G.box(0.002, 0.008, 0.14, '#9aa4b0', -0.018, y, 0);     // as linhas escritas
      const pr = new THREE.Group(), tab = G.malha(api.MAT); tab.position.y = -0.06; pr.add(tab);              // a origem fica na borda de baixo
      pr.position.set(PR_POS.x, PR_POS.y, PR_POS.z); pr.rotation.z = PR_POS.rz; pr.visible = false; m.corpo.add(pr);   // escondida: só aparece quando ela está anotando
      const A = api.atorDe(m, opt, 'acadNPC'); A.poseA = 'fernanda'; A.vel = 1.4; A.prancheta = pr; return A;
    }
    const ROUPAS_TREINO = { M: [15, 9, 8, 16], F: [18, 15, 4, 19] };
    const CORES_TREINO = ['#c8352b', '#1c1c1f', '#3a64b8', '#f2c230', '#1f7a4d', '#f2f2ee', '#7a4fb0', '#e8742a', '#3fb7b0', '#d95fa0'];
    function criarFrequentador(fem, semente) {
      const ap = gerarAparencia(semente, fem ? 'F' : 'M'), r = ROUPAS_TREINO[fem ? 'F' : 'M'];
      const { m, opt } = modelo(ap, fem, r[semente % r.length], [CORES_TREINO[semente % 10], pk(['#1c1c1f', '#2a3f66', '#3a3a3e']), CORES_TREINO[(semente >> 3) % 10], '#f2f2ee']);
      return api.atorDe(m, opt, 'acadNPC');
    }
    function halter(A) {                                                // um halter em cada mão (rosca)
      A.halt = [];
      for (const b of [A.m.bracoE, A.m.bracoD]) { const G = new api.Geo(); G.box(0.05, 0.05, 0.3, '#c9ced4', 0, -0.3, 0); for (const s of [-1, 1]) G.box(0.13, 0.13, 0.07, '#1c1c1f', 0, -0.3, s * 0.15); const h = G.malha(api.MAT); b.cotovelo.add(h); M.halteres.push(h); A.halt.push(h); }
    }
    function colocar(A, x, z, yaw) { const s = S(); A.x = x; A.z = z; A.y = 0; A.yaw = A.yawAlvo = yaw || 0; s.npcs.push(A); return A; }

    function entrou(R) {
      const s = S(); M.R = R; M.A = R.academia || null; if (!M.A) return;
      const A = M.A; s.falantesExtra = s.falantesExtra || {}; M.npcs = []; M.halteres = [];
      for (const C of A.catracas) { C.aberta = null; C.ang = 0; C.alvo = 0; C.gira.rotation.y = 0; C.zAnt = null; }
      M.diego = colocar(criarDiego(), A.recepcao.x, A.recepcao.z, A.recepcao.yaw);
      s.falantesExtra.diego = { A: M.diego, nome: T('Diego'), voz: 4 };
      M.fer = colocar(criarFernanda(), A.fernanda.x, A.fernanda.z, A.fernanda.yaw);
      s.falantesExtra.fernanda = { A: M.fer, nome: T('Fernanda'), voz: 0 };
      // frequentadores: duas esteiras, um supino, um abdominal, rosca com halteres e um andando.
      //   (6.6.5) cada um tem a SUA AGENDA (agendaFreq): chega depois que a academia abre (entra pela porta e passa pela catraca) e vai
      //   embora antes de fechar. Quem está no horário dele já está no aparelho; quem ainda não chegou chega andando; quem já foi não aparece.
      M.base = (dia() * 131) % 997; M.turnoAg = null;
      const agora = hora();
      M.slots = FREQ.map((f, i) => ({ i, f, P: null, foi: null }));
      for (const sl of M.slots) { const j = janelaFreq(sl.i, M.base, agora); if (j && agora >= j[0] && agora < j[1]) noAparelho(sl, j); }
    }
    // os 6 frequentadores (a ordem é a do i da agenda): esteiras (as duas que não são do jogador), supino, abdominal, rosca e o que anda
    const FREQ = [{ tipo: 'esteira', k: 0, fem: true, s: 11 }, { tipo: 'esteira', k: 1, fem: false, s: 18 }, { tipo: 'supinoNPC', fem: false, s: 41 },
      { tipo: 'abdNPC', fem: true, s: 53 }, { tipo: 'rosca', fem: false, s: 67 }, { tipo: 'vaga', fem: null, s: 79 }];
    const femFreq = (i, base) => FREQ[i].fem == null ? (base + i) % 2 === 0 : FREQ[i].fem;
    // (6.6.5) a agenda do dia: de MANHÃ (3 em cada 4 vêm; chegam 7h10–8h30 e vão embora 10h10–10h50, antes do almoço) e de TARDE
    //   (chegam 13h10–15h20 e vão embora 20h30–21h, uma de cada vez: horaSaida)
    const H_CHEGA_M = [7.15, 8.5], H_SAI_M = [10.15, 10.8], H_CHEGA_T = [13.15, 15.3];
    function agendaFreq(i, base) {
      const r = (k) => Math.abs(Math.sin((base + i * 7.7 + k * 3.31) * 12.9898) * 43758.5453) % 1;
      return { manha: r(4) < 0.75, m: [H_CHEGA_M[0] + r(1) * (H_CHEGA_M[1] - H_CHEGA_M[0]), H_SAI_M[0] + r(2) * (H_SAI_M[1] - H_SAI_M[0])],
        t: [H_CHEGA_T[0] + r(3) * (H_CHEGA_T[1] - H_CHEGA_T[0]), horaSaida(i, base)] };
    }
    function janelaFreq(i, base, h) { const g = agendaFreq(i, base); return h < H_ALMOCO ? (g.manha ? g.m : null) : h >= H_VOLTA ? g.t : null; }
    // para a cidade: quem vem hoje e a que horas (a mesma pessoa que aparece lá dentro anda pela rua até a porta)
    function agenda() {
      const base = (dia() * 131) % 997, L = [];
      FREQ.forEach((f, i) => { const g = agendaFreq(i, base); if (g.manha) L.push({ k: 'm' + i, i, fem: femFreq(i, base), sem: base + f.s, chega: g.m[0], sai: g.m[1] }); L.push({ k: 't' + i, i, fem: femFreq(i, base), sem: base + f.s, chega: g.t[0], sai: g.t[1] }); });
      return L;
    }
    const criarFreq = (fem, sem) => criarFrequentador(fem, sem);
    // o aparelho de cada um (na sala de agora)
    function aparelho(sl) {
      const A = M.A, f = sl.f;
      if (f.tipo === 'esteira') { const e = A.esteiras.filter((q) => !q.jog)[f.k]; return e && { x: e.x, z: e.z + 0.1, yaw: Math.PI / 2, antes: [e.x, -3.2], prep: (P) => { P.tipo = 'esteira'; P.y = e.y; P.naEsteira = e; } }; }
      if (f.tipo === 'supinoNPC') { const sp = A.supinos.find((q) => !q.jog); return sp && { x: sp.x, z: sp.z, yaw: -Math.PI / 2, antes: [6.5, -3.7], prep: (P) => { P.tipo = 'parado'; P.poseA = 'supino'; P.supino = sp; P.fase0 = Math.random() * 6; } }; }
      if (f.tipo === 'abdNPC') { const c = A.colchonetes.find((q) => !q.jog && q.x < -7); return c && { x: c.x, z: c.z, yaw: -Math.PI / 2, antes: [-10.0, 0.6], prep: (P) => { P.tipo = 'parado'; P.poseA = 'abdominal'; P.colch = c; P.fase0 = Math.random() * 6; } }; }
      if (f.tipo === 'rosca') return { x: A.rosca.x, z: A.rosca.z, yaw: A.rosca.yaw, antes: null, prep: (P) => { P.tipo = 'rosca'; if (!P.halt) halter(P); else for (const h of P.halt) h.visible = true; } };
      const v = A.vaga; return { x: (v.x0 + v.x1) / 2, z: (v.z0 + v.z1) / 2, yaw: 0, antes: null, prep: (P) => { P.tipo = 'vaga'; P.area = v; } };
    }
    function noAparelho(sl, j) {
      const ap = aparelho(sl); if (!ap) return null;
      const P = colocar(criarFrequentador(femFreq(sl.i, M.base), M.base + sl.f.s), ap.x, ap.z, ap.yaw);
      P.saiH = j[1]; P.estacao = sl.f.tipo; P.slot = sl; sl.P = P; ap.prep(P); M.npcs.push(P); return P;
    }
    // (6.6.5) chegou: entra pela porta, passa pela catraca de ENTRADA (x = −1,55) e vai até o aparelho dele
    function chegarFreq(sl, j) {
      const ap = aparelho(sl), e = M.R && M.R.entrada; if (!ap || !e) return null;
      const P = colocar(criarFrequentador(femFreq(sl.i, M.base), M.base + sl.f.s), e.x, e.z, Math.PI / 2);
      P.saiH = j[1]; P.slot = sl; sl.P = P; P.tipo = 'chega'; P.chegando = ap; P.estacao = null;
      const fim = ap.antes || [ap.x, ap.z], volta = caminhoSala(fim[0], fim[1], 'H').map((q) => q.slice()).reverse();
      P.rota = [[-1.55, e.z - 0.6], [-1.55, 2.3]].concat(volta.length ? volta : [NOS.H.slice()]);
      if (ap.antes) P.rota.push(ap.antes.slice());
      P.rota.push([ap.x, ap.z]); M.npcs.push(P); return P;
    }
    function tickChegadas(dt) {
      if (!M.slots || !M.A || !aberto()) return;
      const h = hora(), turno = h < H_ALMOCO ? 'm' : 't';
      for (const sl of M.slots) {
        if (sl.P) {
          const P = sl.P;
          if (P.chegando && passoRota(P, dt, 1.25)) { const ap = P.chegando; P.chegando = null; P.x = ap.x; P.z = ap.z; P.yaw = P.yawAlvo = ap.yaw; P.estacao = sl.f.tipo; ap.prep(P); }
          continue;
        }
        if (sl.foi === turno) continue;
        const j = janelaFreq(sl.i, M.base, h);
        if (j && h >= j[0] && h < j[1] - 0.2 && !(M.mg && M.mg.fase === 'jogo')) chegarFreq(sl, j);
      }
    }
    // a hora em que o frequentador i começa a ir embora: seis horários espalhados entre 20h30 e 21h00 (um por "faixa"; o dia embaralha a ordem)
    function horaSaida(i, base) {
      const r = Math.abs(Math.sin((base + i * 7.7) * 12.9898) * 43758.5453) % 1, faixa = (i + base) % 6;
      return H_SAI_DE + (faixa + 0.1 + 0.8 * r) / 6 * (H_SAI_ATE - H_SAI_DE);
    }
    function saiu() {
      const s = S();
      if (s && s.falantesExtra) { delete s.falantesExtra.diego; delete s.falantesExtra.fernanda; }
      if (M.mg || M.esp) fecharOverlay();
      M.mg = null; M.esp = null; M.R = null; M.A = null; M.diego = null; M.fer = null; M.npcs = []; M.halteres = []; M.slots = null; M.espN = null; M.tEspN = null;
    }

    // ---------------------------------------------------------------- catracas
    function tickCatracas(dt) {
      const s = S(), J = s.jog, A = M.A;
      for (const C of A.catracas) {
        const lado = J.z > C.z ? 'fora' : 'dentro';
        if (Math.abs(J.z - C.z) > 0.4 || C.aberta == null) C.aberta = C.tipo === 'entrada' ? lado === 'fora' && temAcesso() : lado === 'dentro';
        const c = C.col, f = C.colFechada;
        if (C.aberta) { c.x0 = c.x1 = 9999; } else { c.x0 = f.x0; c.x1 = f.x1; c.z0 = f.z0; c.z1 = f.z1; }
        // passou pela catraca: o tripé gira 120°
        if (C.zAnt != null && Math.abs(J.x - C.x) < 0.65 && Math.sign(J.z - C.z) !== Math.sign(C.zAnt - C.z)) { C.alvo += (J.z < C.z ? 1 : -1) * Math.PI * 2 / 3; SOM.catraca(); }
        C.zAnt = J.z;
        for (const P of M.npcs) {                                           // (6.6.5) frequentador chegando/saindo também gira o tripé
          if (!(P.chegando || P.saindo)) continue;
          const k = 'zAnt' + C.tipo; if (P[k] != null && Math.abs(P.x - C.x) < 0.65 && Math.sign(P.z - C.z) !== Math.sign(P[k] - C.z)) C.alvo += (P.z < C.z ? 1 : -1) * Math.PI * 2 / 3;
          P[k] = P.z;
        }
        C.ang += (C.alvo - C.ang) * Math.min(1, dt * 9); C.gira.rotation.y = C.ang;
      }
    }

    // ---------------------------------------------------------------- alvos (o que dá para fazer perto de onde está)
    function alvos(v) {
      const s = S(), A = M.A; if (!A) return;
      const R = A.recepcao; v.push({ x: R.falar.x, z: R.falar.z, r: 1.5, txt: T('Falar com o Diego'), fn: falarComDiego, y: 2.4, pri: true });
      const E = A.catracas.find((q) => q.tipo === 'entrada');
      if (E && !temAcesso() && s.jog.z > E.z) v.push({ x: E.x, z: E.z + 0.55, r: 0.9, txt: T('Catraca travada: pague o plano na recepção'), fn: catracaTravada, y: 1.8, pri: true });
      if (M.fer && !M.mg) v.push({ x: M.fer.x, z: M.fer.z, r: 1.6, txt: T('Falar com a Fernanda'), fn: falarComFernanda, y: 2.4 });
      if (s.jog.z > A.ZC) return;                                        // os aparelhos ficam do lado de dentro
      if (!M.mg && !M.esp && s.jog.z < -5.4 && s.jog.x > -7.8 && s.jog.x < 4.8) v.push({ x: s.jog.x, z: -6.9, r: 1.6, txt: T('Posar no espelho'), fn: espelho, y: 2.2 });   // (6.3.0) o espelho (a parede norte inteira)
      const feitos = treinosHoje(), cheio = feitos >= TREINOS_DIA;
      const ap = [
        ['esteira', A.esteiras.find((q) => q.jog), (q) => ({ x: q.x + 0.85, z: q.z + 0.4 }), 'Esteira (velocidade)'],
        ['abdominal', A.colchonetes.find((q) => q.jog), (q) => ({ x: q.x + 0.85, z: q.z + 0.2 }), 'Abdominal (resistência)'],
        ['supino', A.supinos.find((q) => q.jog), (q) => ({ x: q.x - 1.15, z: q.z + 0.2 }), 'Supino (força)'],
      ];
      for (const [tipo, q, ponto, nome] of ap) {
        if (!q) continue; const p = ponto(q);
        v.push({ x: p.x, z: p.z, r: 1.25, y: 1.9, txt: falhouHoje(tipo) ? T(nome) + ' · ' + T('Errou hoje: indisponível') : cheio ? Tf('Treinos de hoje: {0}/{1}', feitos, TREINOS_DIA) : T(nome) + ' · ' + Tf('Treinos de hoje: {0}/{1}', feitos, TREINOS_DIA), fn: () => treinar(tipo) });
      }
    }
    async function catracaTravada() {
      SOM.travada();
      const D = M.diego, J = S().jog; if (D) { D.yawAlvo = Math.atan2(-(J.z - D.z), J.x - D.x); }
      await api.fala('diego', T('Precisa pagar o plano aqui no balcão primeiro!')); Dialogo.esconder();
      if (D) D.yawAlvo = M.A.recepcao.yaw;
    }

    // ---------------------------------------------------------------- dinheiro
    function pagar(v) { const d = S().dados; if (d.fakes < v) return false; d.fakes -= v; api.somDinheiro(); api.mostrarDinheiro(false); api.gastoNaTela(v); return true; }

    // ---------------------------------------------------------------- DIEGO (recepção)
    async function falarComDiego() {
      const s = S(), D = M.diego, J = s.jog;
      if (D) { D.yawAlvo = Math.atan2(-(J.z - D.z), J.x - D.x); D.conversando = true; }
      try { await conversaDiego(); } finally { if (M.diego) { M.diego.conversando = false; M.diego.yawAlvo = M.A ? M.A.recepcao.yaw : 0; } Dialogo.esconder(); }
    }
    async function conversaDiego() {
      const a = dadosA();
      if (!a.conheceuDiego) {
        await api.fala('diego', T('Opa, bem-vindo! Eu sou o Diego, aqui da recepção.'));
        await api.fala('diego', Tf('Para treinar aqui é {0} fakes por semana. Pagou, a catraca libera por 7 dias.', PRECO_ACESSO));
        a.conheceuDiego = true;
      }
      if (temAcesso()) {
        await api.fala('diego', Tf('Seu plano vale até o dia {0}. Bom treino!', a.acessoAte - 1));
        const r = await Escolha.mostrar(T('Ver minha ficha de treino'), [T('Ver minha ficha de treino'), T('Tchau')]);
        if (r === 0) await ficha();
        return;
      }
      const venceu = (a.acessoAte || 0) > 0;
      if (venceu) await api.fala('diego', Tf('Seu plano venceu. Quer renovar por mais uma semana? São {0} fakes.', PRECO_ACESSO));
      const r = await Escolha.mostrar(T('Quer pagar a semana?'), [Tf('Pagar {0} fakes', PRECO_ACESSO), T('Ver minha ficha de treino'), T('Agora não')]);
      if (r === 1) { await ficha(); return; }
      if (r !== 0) return;
      if (!pagar(PRECO_ACESSO)) { await api.fala('diego', Tf('Ih, tá faltando grana aí... São {0} fakes.', PRECO_ACESSO)); return; }
      a.acessoAte = dia() + DIAS_PLANO; a.pagouVezes = (a.pagouVezes | 0) + 1;
      api.gravar(S().dados.ponto || 'chegada');
      await api.fala('diego', Tf('Fechado! Seu plano vale até o dia {0}.', a.acessoAte - 1));
      if (!venceu) {
        await api.fala('diego', T('A catraca da esquerda é a entrada. Para sair, use a da direita.'));
        await api.fala('diego', T('Lá dentro tem esteira, abdominal e supino. Dá para fazer até 3 treinos por dia, beleza?'));
        if (!a.conheceuFernanda) await api.fala('diego', T('E se quiser evoluir mais rápido, fala com a Fernanda, a nossa personal.'));
      }
    }
    async function ficha() {
      const at = api.atributosJogador(), a = dadosA();
      await api.fala('diego', Tf('Sua ficha: Velocidade {0} · Resistência {1} · Força {2}.', fmt1(at.velocidade), fmt1(at.resistencia), fmt1(at.forca)));
      await api.fala('diego', Tf('Treinos de hoje: {0} de {1}. Treinos no total: {2}.', treinosHoje(), TREINOS_DIA, a.total | 0));
      if (temPersonal()) await api.fala('diego', Tf('Com a Fernanda até o dia {0}: cada treino vale o dobro.', a.personalAte - 1));
    }

    // ---------------------------------------------------------------- FERNANDA (personal)
    async function falarComFernanda() {
      const s = S(), F = M.fer, J = s.jog; if (!F) return;
      F.yawAlvo = Math.atan2(-(J.z - F.z), J.x - F.x); F.conversando = true; F.andando = false;
      if (F.ia && (F.ia.e === 'treina' || F.ia.e === 'bebe')) { zerarFer(F); F.ia.e = 'espera'; F.ia.t = 0; F.ia.dur = 1.2; }   // para o exercício e pega a prancheta
      try { await conversaFernanda(); } finally { if (M.fer) { M.fer.conversando = false; if (M.fer.ia) { M.fer.ia.e = 'espera'; M.fer.ia.t = 0; M.fer.ia.dur = 1.2; M.fer.rota = null; } } Dialogo.esconder(); }
    }
    async function conversaFernanda() {
      const a = dadosA();
      if (!a.conheceuFernanda) { await api.fala('fernanda', T('Oi! Eu sou a Fernanda, personal trainer aqui da academia.')); a.conheceuFernanda = true; }
      if (temPersonal()) {
        await api.fala('fernanda', Tf('Nosso combinado vale até o dia {0}. Bora treinar!', a.personalAte - 1));
        await api.fala('fernanda', T(DICA_FER[pk(Object.keys(DICA_FER))]));
        return;
      }
      await api.fala('fernanda', Tf('Treinando comigo, cada treino bem feito vale o dobro. São {0} fakes pela semana.', PRECO_PERSONAL));
      const r = await Escolha.mostrar(T('Quer treinar comigo esta semana?'), [Tf('Contratar ({0} fakes)', PRECO_PERSONAL), T('Agora não')]);
      if (r !== 0) { await api.fala('fernanda', T('Tranquilo! Se mudar de ideia, eu tô por aqui.')); return; }
      if (!pagar(PRECO_PERSONAL)) { await api.fala('fernanda', T('Sem grana agora? Tranquilo, quando quiser é só me chamar.')); return; }
      a.personalAte = dia() + DIAS_PLANO; a.personalVezes = (a.personalVezes | 0) + 1;
      api.gravar(S().dados.ponto || 'chegada');
      await api.fala('fernanda', Tf('Combinado! Até o dia {0} eu acompanho os seus treinos.', a.personalAte - 1));
      await api.fala('fernanda', T('É só ir para um aparelho que eu chego do seu lado.'));
    }

    // ---------------------------------------------------------------- POSES (deitado, sentado, no aparelho)
    // Corpo deitado/sentado a partir do QUADRIL: x, y, z = onde fica o quadril; yaw = para onde vão os PÉS (a cabeça vai para o
    // outro lado); th = inclinação do tronco (0 em pé/sentado, π/2 deitado de costas, −π/2 de bruços); coxa/canela = ângulo de cada
    // uma com o chão, para o lado dos pés (coxa 0 = reta para a frente; canela −π/2 = em pé no chão); abre = pernas afastadas.
    function deitar(A, o) {
      const m = A.m, r = m.raiz, es = (A.opt && A.opt.escala) || 1, th = o.th;
      r.rotation.set(0, o.yaw, th);
      const ox = -0.74 * es * Math.sin(th), oy = 0.74 * es * Math.cos(th), cy = Math.cos(o.yaw), sy = Math.sin(o.yaw);
      r.position.set(o.x - ox * cy, o.y - oy, o.z + ox * sy);
      m.corpo.rotation.z = 0; m.corpo.position.y = 0;
      const fi = o.pernas != null ? o.pernas : o.coxa + Math.PI / 2 - th, ka = o.joelho != null ? o.joelho : o.canela - o.coxa;
      const ab = o.abre || 0, dl = o.chuta || 0;
      m.pernaE.rotation.set(ab, 0, fi + dl); m.pernaD.rotation.set(-ab, 0, fi - dl);
      usarJoelhos(m, Math.min(-0.001, ka + (o.joelhoE || 0)), Math.min(-0.001, ka + (o.joelhoD || 0)));
      A.blob.position.set(o.x, 0.02, o.z);
    }
    function bracos(A, a, b, k) {                                     // pose dos braços entre a e b (k de 0 a 1), espelhando o direito
      const m = A.m, q = a.map((v, i) => lerpN(v, b ? b[i] : v, b ? k : 0));
      m.bracoE.rotation.set(q[0], 0, q[1]); m.bracoD.rotation.set(-q[0], 0, q[1]);
      usarCotovelo(m.bracoE, q[2], q[3] || 0.001); usarCotovelo(m.bracoD, -q[2], q[3] || 0.001);
    }
    function maos(A) {                                                // onde estão as duas mãos (no mundo da sala)
      const m = A.m; m.raiz.updateMatrixWorld(true);
      const p = (b) => { const v = (b.cotLigado ? b.cotovelo : b).localToWorld(new THREE.Vector3(0, b.cotLigado ? -0.27 : -0.57, 0)); M.R.grupo.worldToLocal(v); return v; };
      return [p(m.bracoE), p(m.bracoD)];
    }
    function zerarPose(A) {                                           // volta ao normal (o poseAtor da cidade cuida do resto)
      const m = A.m; m.pernaE.rotation.x = 0; m.pernaD.rotation.x = 0; m.bracoE.rotation.y = 0; m.bracoD.rotation.y = 0; m.corpo.position.y = 0;
      m.raiz.rotation.set(0, A.yaw, 0); usarJoelhos(m, 0, 0); usarCotovelo(m.bracoE, 0, 0); usarCotovelo(m.bracoD, 0, 0); usarCabeca(m, 0);
    }
    // supino: deitado no banco (cabeça para o norte), a barra nas mãos. b = 0 (no peito) a 1 (braços esticados)
    function poseSupino(A, sp, b, extra) {
      const es = (A.opt && A.opt.escala) || 1, o = Object.assign({ x: sp.x, y: sp.banco + 0.16 * es, z: sp.z + 0.32, yaw: -Math.PI / 2, th: Math.PI / 2, coxa: -0.45, canela: -Math.PI / 2, abre: 0.32 }, extra || {});
      deitar(A, o); bracos(A, BR.supBaixo, BR.supCima, suave(b)); usarCabeca(A.m, -0.001);
      return o;
    }
    function barraNasMaos(A, barra, dy) { const [e, d] = maos(A); barra.position.set((e.x + d.x) / 2, (e.y + d.y) / 2 + 0.03 + (dy || 0), (e.z + d.z) / 2); barra.rotation.set(0, 0, 0); }
    // abdominal: deitado no colchonete; k = 0 (deitado) a 1 (no alto da subida)
    function poseAbd(A, c, k, extra) {
      const es = (A.opt && A.opt.escala) || 1;
      deitar(A, Object.assign({ x: c.x, y: c.y + 0.15 * es, z: c.z + 0.3, yaw: -Math.PI / 2, th: Math.PI / 2 - 0.12 - 0.85 * k, coxa: 0.72, canela: -0.95, abre: 0.12 }, extra || {}));
      bracos(A, BR.nuca); usarCabeca(A.m, -0.18 - 0.2 * k);
    }

    // poses dos frequentadores e da equipe (por cima do poseAtor da cidade)
    // a mão esquerda encostando na borda de baixo da prancheta e a direita escrevendo nela (ângulos achados por busca, conferidos na tela)
    const PR_MAO_E = { rz: 0.3, rx: -0.2, cx: -0.5, cz: 1.4 };
    const PR_MAO_D = { rz: 1.5, rx: 0.75, cx: 0.001, cz: 0.15 };
    function segurarPrancheta(m) { m.bracoE.rotation.z = PR_MAO_E.rz; m.bracoE.rotation.x = PR_MAO_E.rx; usarCotovelo(m.bracoE, PR_MAO_E.cx, PR_MAO_E.cz); }
    function posesNPC(dt) {
      const s = S();
      for (const P of M.npcs) {
        if (P.poseA === 'supino' && P.supino) { const b = P.fixo != null ? P.fixo : 0.5 + 0.5 * Math.sin(s.t * 1.7 + P.fase0); poseSupino(P, P.supino, b); barraNasMaos(P, P.supino.barra); }
        else if (P.poseA === 'abdominal' && P.colch) { const k = P.fixo != null ? P.fixo : Math.pow(Math.max(0, Math.sin(s.t * 2.1 + P.fase0)), 2); poseAbd(P, P.colch, k); }
        else if (P.naEsteira) { P.x = P.naEsteira.x; P.y = P.naEsteira.y; P.m.raiz.position.y += P.naEsteira.y; }
      }
      // as lonas das esteiras correm (a do jogador só quando ele está nela)
      M.beltOff = (M.beltOff + dt * 1.1) % 1;
      for (const e of M.A.esteiras) if (!e.jog) e.tex.offset.y = M.beltOff;
      const F = M.fer;
      // a prancheta só aparece quando ela está ANOTANDO (olhando e escrevendo nela); no resto (andando, orientando, treinando, bebendo água,
      //   conversando, no treino com o jogador) ela fica guardada
      const anota = !!(F && F.ia && F.ia.e === 'prancheta' && !F.andandoCena && !F.conversando && !F.andando && !(M.mg && temPersonal()));
      if (F && F.prancheta) F.prancheta.visible = anota;
      if (F && !F.andandoCena && F.poseA === 'fernanda' && !F.andando) {
        const m = F.m;
        if (F.torce > 0) { F.torce -= dt; m.bracoD.rotation.z = 2.6 + Math.sin(s.t * 12) * 0.25; m.bracoD.rotation.x = -0.2; usarCotovelo(m.bracoD, 0, 0.4); }
      }
      if (F && !F.andandoCena && !F.conversando && !(M.mg && temPersonal())) poseFernandaAcao(F);   // (6.3.0) o que ela está fazendo agora
      if (M.diego && !M.diego.conversando && !M.diego.fala) { const m = M.diego.m, k = Math.max(0, Math.sin(s.t * 0.9)); m.bracoE.rotation.z = m.bracoD.rotation.z = 0.7 + k * 0.1; usarCotovelo(m.bracoE, 0, 0.6 + Math.sin(s.t * 11) * 0.12 * k); usarCotovelo(m.bracoD, 0, 0.6 + Math.sin(s.t * 13 + 1) * 0.12 * k); }   // digitando no computador
    }

    // ---------------------------------------------------------------- O TREINO (minigames)
    let elOv = null;
    function fecharOverlay() { if (elOv) { elOv.remove(); elOv = null; } window.removeEventListener('keydown', teclaMini, true); window.removeEventListener('keydown', teclaEspelho, true); }
    function teclaMini(e) {
      if (!M.mg || M.mg.fase !== 'jogo') return;
      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyJ' || e.code === 'NumpadEnter') { e.preventDefault(); e.stopPropagation(); if (!e.repeat) toque(); }
    }
    const CSS_CARD = 'width:min(440px,94%);background:#1c1c1f;border:4px solid #f2c230;color:#f2f2ee;padding:12px 14px;box-sizing:border-box;display:flex;flex-direction:column;gap:10px;font-family:var(--font-body);box-shadow:0 6px 0 rgba(0,0,0,.45);';
    const CSS_TIT = 'font:700 15px/1.2 var(--font-display);letter-spacing:.08em;color:#f2c230;text-transform:uppercase;';
    function overlayBase() {
      fecharOverlay();
      const el = document.createElement('div'); el.id = 'acMini';
      el.style.cssText = 'position:fixed;inset:0;z-index:22;pointer-events:none;font-family:var(--font-body);';
      (document.getElementById('raizJogo') || document.body).appendChild(el); elOv = el; return el;
    }
    function botao(txt, prim) { const b = document.createElement('button'); b.type = 'button'; b.className = 'pxBtn' + (prim ? ' pxPrim' : ''); b.textContent = txt; b.style.cssText = 'height:42px;padding:0 18px;font-size:13px;pointer-events:auto;'; return b; }
    function cartao(titulo, texto, botoes, extra) {
      return new Promise((res) => {
        const el = overlayBase(); el.style.pointerEvents = 'auto'; el.style.display = 'grid'; el.style.placeItems = 'center'; el.style.background = 'rgba(6,6,8,.35)';
        const c = document.createElement('div'); c.style.cssText = CSS_CARD;
        const h = document.createElement('div'); h.style.cssText = CSS_TIT; h.textContent = titulo;
        const p = document.createElement('div'); p.style.cssText = 'font-size:14px;line-height:1.4;white-space:pre-line;'; p.textContent = texto;
        c.append(h, p); if (extra) { const x = document.createElement('div'); x.style.cssText = 'font-size:13px;color:#f2c230;'; x.textContent = extra; c.appendChild(x); }
        const fila = document.createElement('div'); fila.style.cssText = 'display:flex;gap:10px;justify-content:center;flex-wrap:wrap;';
        botoes.forEach((t, i) => { const b = botao(t, i === 0); b.onclick = (e) => { e.stopPropagation(); res(i); }; fila.appendChild(b); });
        c.appendChild(fila); el.appendChild(c);
        M.cartaoAberto = (i) => res(i);                                // (para os testes)
      }).finally(() => { M.cartaoAberto = null; });
    }
    // o HUD do minigame: título e tempo em cima, o medidor embaixo e o botão grande de toque (qualquer toque na tela vale)
    function hudMini(tipo) {
      const el = overlayBase(); el.style.pointerEvents = 'auto'; el.style.touchAction = 'none';
      el.style.zIndex = '12'; el.style.top = 'calc(50px + env(safe-area-inset-top,0px))';   // abaixo da pausa e sem cobrir o dinheiro/pausa lá em cima
      el.innerHTML = '<div class="acTopo" style="position:absolute;left:50%;top:2px;transform:translateX(-50%);text-align:center;' + 'font:700 15px/1.2 var(--font-display);color:#f2c230;text-shadow:0 2px 0 #000;letter-spacing:.06em;white-space:nowrap;"></div>' +
        '<div class="acInfo" style="position:absolute;left:50%;top:26px;transform:translateX(-50%);font:700 13px/1.2 var(--font-body);color:#f2f2ee;text-shadow:0 2px 0 #000;white-space:nowrap;"></div>' +
        '<div class="acConta" style="position:absolute;left:50%;top:38%;transform:translate(-50%,-50%);font:700 64px/1 var(--font-display);color:#f2c230;text-shadow:0 4px 0 #000;"></div>' +
        '<div class="acMed" style="position:absolute;left:50%;bottom:calc(26px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);width:min(420px,58vw);height:26px;background:#1c1c1f;border:3px solid #f2f2ee;box-sizing:border-box;overflow:hidden;"></div>' +
        '<div class="acBtn" style="position:absolute;right:max(22px,env(safe-area-inset-right,0px));bottom:calc(18px + env(safe-area-inset-bottom,0px));width:112px;height:112px;border-radius:50%;background:#f2c230;border:5px solid #1c1c1f;box-shadow:0 6px 0 #8a6a10;display:grid;place-items:center;font:700 18px/1 var(--font-display);color:#1c1c1f;user-select:none;-webkit-user-select:none;"></div>';
      el.querySelector('.acTopo').textContent = T(TITULO[tipo]);
      el.querySelector('.acBtn').textContent = T('TOQUE');
      const med = el.querySelector('.acMed');
      if (tipo === 'esteira') med.innerHTML = '<div style="position:absolute;left:0;top:0;bottom:0;width:16%;background:#a8202a;"></div><div style="position:absolute;right:0;top:0;bottom:0;width:30%;background:#1f7a4d;opacity:.55"></div><div class="acPonto" style="position:absolute;top:2px;bottom:2px;width:12px;margin-left:-6px;background:#f2f2ee;"></div>';
      else if (tipo === 'abdominal') med.innerHTML = '<div class="acFaixa" style="position:absolute;top:0;bottom:0;background:#1f7a4d;"></div><div class="acPonto" style="position:absolute;top:2px;bottom:2px;width:8px;margin-left:-4px;background:#f2f2ee;"></div>';
      else med.innerHTML = '<div class="acBarra" style="position:absolute;left:0;top:0;bottom:0;background:#f2c230;"></div><div style="position:absolute;right:0;top:0;bottom:0;width:6px;background:#1f7a4d;"></div><div class="acPeito" style="position:absolute;left:0;bottom:0;height:4px;background:#a8202a;"></div>';
      el.addEventListener('pointerdown', (e) => { e.preventDefault(); if (M.mg && M.mg.fase === 'jogo') toque(); const b = el.querySelector('.acBtn'); if (b) { b.style.transform = 'translateY(4px)'; b.style.boxShadow = '0 2px 0 #8a6a10'; setTimeout(() => { b.style.transform = ''; b.style.boxShadow = '0 6px 0 #8a6a10'; }, 90); } });
      window.addEventListener('keydown', teclaMini, true);
      return el;
    }
    function atualizarHud() {
      const G = M.mg; if (!G || !elOv) return; const el = elOv, q = (s) => el.querySelector(s);
      const resta = Math.max(0, Math.ceil(G.dur - G.t));
      if (G.tipo === 'esteira') {
        const kmh = (6 + 10 * clampN(G.t / G.dur, 0, 1)) * G.df;
        q('.acInfo').textContent = Tf('{0} km/h', Math.round(kmh)) + ' · ' + resta + ' s';
        const pt = q('.acPonto'); if (pt) pt.style.left = (50 + G.p * 50) + '%';
      } else if (G.tipo === 'abdominal') {
        q('.acInfo').textContent = Tf('Abdominais: {0}/{1} · erros: {2}/{3}', G.reps, ABD.reps, G.erros, ABD.erros) + ' · ' + resta + ' s';
        const f = q('.acFaixa'); if (f) { f.style.left = ((0.5 - G.faixa / 2) * 100) + '%'; f.style.width = (G.faixa * 100) + '%'; }
        const pt = q('.acPonto'); if (pt) pt.style.left = (G.marca * 100) + '%';
      } else {
        q('.acInfo').textContent = Tf('Repetições: {0}/{1}', G.reps, SUP.reps) + ' · ' + resta + ' s';
        const b = q('.acBarra'); if (b) b.style.width = (G.b * 100) + '%';
        const pc = q('.acPeito'); if (pc) pc.style.width = (clampN(G.noPeito / SUP.peito, 0, 1) * 100) + '%';
      }
    }
    function toque() {
      const G = M.mg; if (!G || G.fase !== 'jogo') return;
      G.toques = (G.toques | 0) + 1;
      if (G.tipo === 'esteira') { G.p = Math.min(1, G.p + EST.toque); G.passo = 0.12; SOM.toque(); }
      else if (G.tipo === 'abdominal') {
        if (G.sobe > 0) return;                                          // ainda subindo/descendo: o toque não conta
        const dentro = Math.abs(G.marca - 0.5) <= G.faixa / 2;
        if (dentro) { G.reps++; G.sobe = ABD.sobe; G.meia = false; G.vel *= 1 + ABD.cansa; G.faixa = lerpN(ABD.faixa0, ABD.faixa1, G.reps / ABD.reps); SOM.certo(); }
        else { G.erros++; G.sobe = ABD.sobe; G.meia = true; SOM.erro(); }
      } else {
        if (G.desce > 0) return;                                         // a barra está voltando para o peito
        G.b = Math.min(1, G.b + SUP.toque); SOM.toque();
        if (G.b >= 1) { G.reps++; G.peso *= 1 + SUP.cansa; SOM.certo(); if (G.reps >= SUP.reps) acabar(true); else G.desce = SUP.desce; }   // braço esticado: conta a repetição
      }
    }
    // o quadro do minigame (chamado no tick)
    function tickJogo(dt) {
      const G = M.mg; G.t += dt;
      if (G.tipo === 'esteira') {
        const v = lerpN(EST.v0, EST.v1, clampN(G.t / G.dur, 0, 1)) * G.df;
        G.v = v; G.p -= v * dt; if (G.passo > 0) G.passo -= dt;
        if (G.p <= -1) { G.motivo = 'queda'; return acabar(false); }
        if (G.t >= G.dur) return acabar(true);
      } else if (G.tipo === 'abdominal') {
        G.fm = (G.fm + dt * G.vel) % 2; G.marca = G.fm < 1 ? G.fm : 2 - G.fm;
        if (G.sobe > 0) G.sobe = Math.max(0, G.sobe - dt);
        if (G.erros >= ABD.erros) { G.motivo = 'erros'; return acabar(false); }
        if (G.reps >= ABD.reps && G.sobe <= 0) return acabar(true);
        if (G.t >= G.dur && G.sobe <= 0) { G.motivo = 'tempo'; return acabar(false); }
      } else {
        if (G.desce > 0) { G.desce = Math.max(0, G.desce - dt); G.b = G.desce / SUP.desce; }
        else {
          G.b = Math.max(0, G.b - G.peso * dt);
          G.noPeito = G.b < 0.04 ? G.noPeito + dt : 0;
          if (G.noPeito >= SUP.peito) { G.motivo = 'peito'; return acabar(false); }
        }
        if (G.t >= G.dur) { G.motivo = 'tempo'; return acabar(false); }
      }
      atualizarHud();
    }
    function acabar(ok) {
      const G = M.mg; if (!G || G.fase !== 'jogo') return; G.fase = ok ? 'ok' : 'falha'; G.ta = 0; atualizarHud();
      const q = G.q, s = S();                                           // a câmera abre um pouco para mostrar o tombo (e quem vem ajudar)
      if (!ok && G.tipo === 'esteira') s.camCena = { px: q.x + 3.3, py: 2.3, pz: q.z + 3.4, tx: q.x - 0.2, ty: 0.35, tz: q.z + 1.4 };
      if (!ok && G.tipo === 'supino') s.camCena = { px: q.x - 3.4, py: 2.4, pz: q.z + 1.5, tx: q.x + 0.2, ty: 0.6, tz: q.z - 0.3 };
      if (G.fimJogo) G.fimJogo(ok);
    }

    // ---- a câmera de cada aparelho (fixa, de lado)
    function camDe(tipo, q) {
      if (tipo === 'esteira') return { px: q.x + 3.1, py: 1.75, pz: q.z + 1.6, tx: q.x, ty: 0.95, tz: q.z + 0.1 };
      if (tipo === 'abdominal') return { px: q.x + 2.6, py: 1.55, pz: q.z + 2.2, tx: q.x, ty: 0.35, tz: q.z + 0.1 };
      return { px: q.x - 2.9, py: 1.75, pz: q.z + 0.9, tx: q.x, ty: 0.65, tz: q.z - 0.25 };
    }
    // onde a Fernanda fica olhando o treino
    function pontoFer(tipo, q) {
      if (tipo === 'esteira') return { x: q.x + 0.9, z: q.z - 1.6 };              // na frente do painel (longe da câmera)
      if (tipo === 'abdominal') return { x: q.x + 1.1, z: q.z - 0.6 };
      return { x: q.x + 1.05, z: q.z - 0.7 };                                    // do outro lado do banco (a câmera fica no oeste)
    }
    const virarPara = (A, x, z) => { A.yaw = A.yawAlvo = Math.atan2(-(z - A.z), x - A.x); };

    // ---- a pose do jogador a cada quadro (por cima do poseAtor da cidade)
    function poseJogador(dt) {
      const G = M.mg, s = S(), J = s.jog, m = J.m; if (!G || !G.q || G.fase === 'fim') return;
      const q = G.q; G.ta += dt;
      if (G.tipo === 'esteira') {
        if (G.fase === 'falha') { quedaEsteira(J, q, G.ta); return; }
        if (G.fase === 'ok') {                                          // a lona desacelera e ele termina andando
          const k = clampN(G.ta / 1.6, 0, 1); G.vBelt = lerpN(G.vReal || 2.5, 0, k);
          J.andando = G.vBelt > 0.15; J.correndo = G.vBelt > 1.3; J.vel = Math.max(1, G.vBelt);
          J.x = q.x; J.z = q.z + 0.1; J.yaw = J.yawAlvo = Math.PI / 2; m.raiz.position.set(J.x, m.raiz.position.y + q.y, J.z);
          if (G.ta > 1.7) { m.bracoD.rotation.z = 2.7; m.bracoD.rotation.x = 0.1; usarCotovelo(m.bracoD, 0, 0.6); }   // braço para cima: conseguiu!
          q.tex.offset.y = (q.tex.offset.y + dt * G.vBelt * 0.5) % 1; return;
        }
        const vReal = G.fase === 'jogo' ? 2.4 + (G.v / (EST.v1 * G.df)) * 3.0 : G.fase === 'conta' ? 1.2 : 0;   // parado na explicação, andando na contagem
        G.vReal = vReal; J.andando = vReal > 0; J.correndo = G.fase === 'jogo'; J.vel = Math.max(1, vReal);
        J.x = q.x; J.z = q.z + 0.1 - (G.p || 0) * 0.62; J.yaw = J.yawAlvo = Math.PI / 2;
        m.raiz.position.set(J.x, m.raiz.position.y + q.y, J.z);
        if (G.p < -0.55 && G.fase === 'jogo') { m.corpo.rotation.z = -0.25 * (-(G.p) - 0.55) / 0.45; m.bracoE.rotation.z += Math.sin(s.t * 25) * 0.6; m.bracoD.rotation.z -= Math.sin(s.t * 25) * 0.6; }   // quase caindo: se esticando todo
        q.tex.offset.y = (q.tex.offset.y + dt * vReal * 0.5) % 1;
        J.blob.position.set(J.x, q.y + 0.02, J.z);
      } else if (G.tipo === 'abdominal') {
        if (G.fase === 'falha') { desistiuAbd(J, q, G.ta); return; }
        if (G.fase === 'ok') { const k = suave(G.ta / 0.8); poseAbd(J, q, 0, { th: lerpN(Math.PI / 2 - 0.12, 0.25, k), coxa: lerpN(0.72, 0.5, k) }); if (G.ta > 0.8) { const m2 = J.m; m2.bracoD.rotation.set(-0.2, 0, 2.2); usarCotovelo(m2.bracoD, 0, 1.4 + Math.sin(G.ta * 9) * 0.25); usarCabeca(m2, 0.12); } return; }   // senta e passa a mão na testa
        let k = 0;
        if (G.sobe > 0) { const u = 1 - G.sobe / ABD.sobe; k = u < 0.45 ? suave(u / 0.45) : 1 - suave((u - 0.45) / 0.55); if (G.meia) k *= 0.45; }
        poseAbd(J, q, k, G.meia && G.sobe > 0 ? { th: Math.PI / 2 - 0.12 - 0.85 * k + Math.sin(G.ta * 40) * 0.03 } : null);
      } else {
        if (G.fase === 'falha') { esmagadoSupino(J, q, G.ta); return; }
        if (G.fase === 'ok') {
          const k = suave(G.ta / 0.7);                                   // devolve a barra no suporte e senta
          if (G.ta < 0.7) { poseSupino(J, q, 1); const [e, d] = maos(J); q.barra.position.set(lerpN((e.x + d.x) / 2, q.rack.x, k), lerpN((e.y + d.y) / 2 + 0.03, q.rack.y, k), lerpN((e.z + d.z) / 2, q.rack.z, k)); }
          else { const k2 = suave((G.ta - 0.7) / 0.7); q.barra.position.set(q.rack.x, q.rack.y, q.rack.z); poseSupino(J, q, 1, { th: lerpN(Math.PI / 2, 0.05, k2), z: q.z + 0.32 - 0.25 * k2 });
            if (k2 >= 1) { const m2 = J.m; bracos(J, [1.35, 0.2, -1.3, 2.0]); m2.bracoE.rotation.z = m2.bracoD.rotation.z = 0.25 + Math.sin(G.ta * 6) * 0.05; usarCabeca(m2, 0.1); } }
          return;
        }
        poseSupino(J, q, G.b || 0); barraNasMaos(J, q.barra);
      }
    }
    // FALHA NA ESTEIRA: escorrega até o fim da lona se esticando, é jogado para trás, cai de cara no chão e levanta todo sem graça
    function quedaEsteira(J, q, u) {
      const m = J.m, es = (J.opt && J.opt.escala) || 1, zFim = q.z + 0.95;
      if (u < 0.35) {                                                     // a lona leva as pernas: tropeça, braços girando
        const k = u / 0.35; J.andando = true; J.correndo = true; J.vel = 6; J.x = q.x; J.z = lerpN(q.z + 0.72, zFim, k); J.yaw = J.yawAlvo = Math.PI / 2;
        m.raiz.position.set(J.x, m.raiz.position.y + q.y, J.z); m.corpo.rotation.z = -0.35 - 0.3 * k;
        m.bracoE.rotation.z = Math.sin(u * 32) * 2.2; m.bracoD.rotation.z = -Math.sin(u * 32) * 2.2; m.bracoE.rotation.x = 0.5; m.bracoD.rotation.x = -0.5;
        q.tex.offset.y = (q.tex.offset.y + 0.016 * 3) % 1; return;
      }
      if (!M.mg.tombou) { M.mg.tombou = true; SOM.tombo(); }
      if (u < 0.85) {                                                     // voa para trás e cai de bruços
        const k = (u - 0.35) / 0.5, zq = lerpN(zFim, zFim + 1.05, k), yq = lerpN(q.y + 0.74 * es, 0.17, k * k) + Math.sin(k * Math.PI) * 0.25;
        deitar(J, { x: q.x, y: yq, z: zq, yaw: Math.PI / 2, th: lerpN(-0.6, -Math.PI / 2 + 0.06, suave(k)), pernas: lerpN(0.9, 0.1, k), joelho: -0.6 * (1 - k) - 0.05, abre: 0.25 });
        bracos(J, [0.4, 2.6, 0, 0.3], [0.5, 3.0, 0, 0.1], k); q.tex.offset.y = (q.tex.offset.y + 0.016 * 2.5) % 1; return;
      }
      if (u < 2.3) {                                                      // estatelado no chão, as pernas ainda tremem
        const tw = Math.sin(u * 22) * Math.max(0, 1 - (u - 0.85) / 0.9) * 0.25;
        deitar(J, { x: q.x, y: 0.17, z: zFim + 1.05, yaw: Math.PI / 2, th: -Math.PI / 2 + 0.06, pernas: 0.1, joelho: -0.05 - Math.max(0, tw), chuta: tw, abre: 0.3 });
        bracos(J, [0.5, 3.0, 0, 0.1]); usarCabeca(m, u > 1.6 ? 0.25 : -0.001); q.tex.offset.y = (q.tex.offset.y + 0.016 * Math.max(0, 1 - (u - 0.85)) * 2) % 1; return;
      }
      const k = suave((u - 2.3) / 1.0);                                   // levanta (de joelho → de pé), meio tonto
      deitar(J, { x: q.x, y: lerpN(0.17, 0.74 * es, k), z: zFim + 1.05 - 0.25 * k, yaw: Math.PI / 2, th: lerpN(-Math.PI / 2 + 0.06, 0, k), pernas: lerpN(0.1, 0, k), joelho: -1.2 * Math.sin(k * Math.PI) - 0.001, abre: 0.15 * (1 - k) });
      bracos(J, [0.5, 3.0, 0, 0.1], [0.15, 0.3, 0, 1.6], k); if (k > 0.9) { m.bracoD.rotation.z = 2.4; usarCotovelo(m.bracoD, 0, 2.2); usarCabeca(m, -0.2); }   // a mão na cabeça
    }
    // FALHA NO ABDOMINAL: desiste e fica largado no colchonete, braços e pernas abertos, o peito subindo e descendo
    function desistiuAbd(J, q, u) {
      const k = suave(u / 0.6), es = (J.opt && J.opt.escala) || 1, resp = Math.sin(u * 5.5) * 0.025;
      deitar(J, { x: q.x, y: q.y + 0.15 * es, z: q.z + 0.3, yaw: -Math.PI / 2, th: Math.PI / 2 - 0.12 * (1 - k) + resp, coxa: lerpN(0.72, 0.02, k), canela: lerpN(-0.95, 0, k), abre: lerpN(0.12, 0.42, k) });
      bracos(J, BR.nuca, BR.estrela, k); usarCabeca(J.m, lerpN(-0.18, 0.18, k) + resp);
    }
    // FALHA NO SUPINO: a barra desce de vez e prende no peito; ele esperneia (as pessoas vêm tirar: ver socorroSupino)
    function esmagadoSupino(J, q, u) {
      const G = M.mg, chuta = G.socorro === 'livre' ? 0 : Math.sin(u * 14) * 0.35, k = suave(u / 0.25);
      poseSupino(J, q, 0, { chuta, coxa: -0.45 + Math.abs(chuta) * 0.6, abre: 0.32 + Math.abs(chuta) * 0.3 });
      if (G.socorro === 'levantando' || G.socorro === 'livre') return;    // quem segura a barra agora são os ajudantes
      const [e, d] = maos(J); q.barra.position.set((e.x + d.x) / 2, (e.y + d.y) / 2 - 0.05 * k, (e.z + d.z) / 2);
      usarCabeca(J.m, Math.sin(u * 9) * 0.15 - 0.001);
    }

    async function treinar(tipo) {
      const s = S(), A = M.A; if (!A) return;
      if (!temAcesso()) { await api.fala('jog', T('Seu plano venceu. Renove com o Diego, na recepção.')); Dialogo.esconder(); return; }
      if (falhouHoje(tipo)) { await api.fala('jog', T(JA_ERREI[tipo])); Dialogo.esconder(); return; }   // (6.3.0)
      if (treinosHoje() >= TREINOS_DIA) { await api.fala('jog', Tf('Você já fez os {0} treinos de hoje. Descanse e volte amanhã!', TREINOS_DIA)); Dialogo.esconder(); return; }
      if (horasParaFechar() < HORAS_TREINO) { await api.fala('jog', T('Já está quase na hora de fechar: não dá tempo de fazer outro treino.')); Dialogo.esconder(); return; }   // (6.3.0)
      const q = tipo === 'esteira' ? A.esteiras.find((e) => e.jog) : tipo === 'abdominal' ? A.colchonetes.find((c) => c.jog) : A.supinos.find((b) => b.jog);
      const J = s.jog, personal = temPersonal(), F = M.fer;
      const G = M.mg = { tipo, q, fase: 'intro', t: 0, ta: 0, df: dificuldade(tipo), dur: tipo === 'esteira' ? EST.dur : tipo === 'abdominal' ? ABD.dur : SUP.dur,
        p: 0.2, v: 0, reps: 0, erros: 0, marca: 0, fm: 0, vel: ABD.vel0, faixa: ABD.faixa0, sobe: 0, b: 1, peso: SUP.peso, noPeito: 0, desce: 0 };
      G.vel *= G.df; G.peso *= G.df;
      // vai para o aparelho (corte)
      await api.preto(true, 350);
      s.camCena = camDe(tipo, q); J.sentado = false; J.rota = null;
      if (tipo === 'esteira') { J.x = q.x; J.z = q.z + 0.1; J.yaw = J.yawAlvo = Math.PI / 2; }
      if (personal && F) { const p = pontoFer(tipo, q); F.x = p.x; F.z = p.z; virarPara(F, q.x, q.z); F.poseA = 'fernanda'; F.andando = false; F.rota = null; if (F.ia) { if (F.ia.e === 'treina' || F.ia.e === 'bebe') zerarFer(F); F.ia.e = 'espera'; } }
      poseJogador(0.016);
      await api.preto(false, 350);
      if (personal && F) { F.torce = 1.5; await api.fala('fernanda', T('Bora! Eu tô aqui do seu lado.')); Dialogo.esconder(); }
      const instr = tipo === 'esteira' ? Tf('A lona puxa você para trás, cada vez mais rápido. Cada toque é uma passada para a frente. Aguente {0} segundos sem chegar no fim da esteira!', EST.dur)
        : tipo === 'abdominal' ? Tf('O marcador vai e volta. Toque quando ele estiver na faixa verde para subir. Faça {0} abdominais; {1} erros e você desiste.', ABD.reps, ABD.erros)
        : Tf('A barra pesa para baixo. Toque rápido para empurrar até em cima. Faça {0} repetições e não deixe a barra parada no peito!', SUP.reps);
      const at0 = api.atributosJogador(), n = ATRIB[tipo];
      const r0 = await cartao(T(TITULO[tipo]), instr, [T('Começar'), T('Agora não')], T(NOME_ATRIB[n]) + ': ' + fmt1(at0[n]) + (personal ? ' · ' + T('Com a Fernanda: ganho em dobro!') : ''));
      if (r0 !== 0) { fecharOverlay(); await voltarDoAparelho(tipo, q, false); M.mg = null; return; }
      // contagem 3, 2, 1, VAI!
      hudMini(tipo); G.fase = 'conta'; atualizarHud();
      const conta = elOv.querySelector('.acConta');
      for (const c of ['3', '2', '1']) { conta.textContent = c; SOM.conta(); await api.esperar(650); if (!M.mg) return; }
      conta.textContent = T('VAI!'); SOM.vai(); setTimeout(() => { if (conta) conta.textContent = ''; }, 600);
      G.fase = 'jogo'; G.t = 0; if (tipo === 'supino') G.desce = SUP.desce;   // supino: a barra desce até o peito e aí ele empurra
      const ok = await new Promise((res) => { G.fimJogo = res; });
      fecharOverlay();
      // a animação do fim (sucesso ou o tombo) e as reações
      if (ok) { SOM.vitoria(); await api.esperar(tipo === 'esteira' ? 2300 : 1700); if (personal && F) { F.torce = 2; await api.fala('fernanda', T('Isso aí! Mandou bem demais!')); } else await api.fala('jog', T('Ufa! Mandei bem!')); Dialogo.esconder(); }
      else await animacaoFalha(tipo, q);
      // o resultado
      const a = dadosA(), at = api.atributosJogador(), antes = +at[n] || 5;
      if (a.treinoDia !== dia()) { a.treinoDia = dia(); a.treinos = 0; }
      a.treinos = (a.treinos | 0) + 1; a.total = (a.total | 0) + 1;
      if (!ok) marcarFalha(tipo);                                       // (6.3.0)
      const g = ok ? GANHO * (personal ? 2 : 1) : 0, depois = Math.min(10, Math.round((antes + g) * 100) / 100);
      at[n] = depois; PERSONAGEM.atributos = Object.assign({}, at);
      s.dados.precisaBanho = true;
      if (ok) try { Espectros.mover('ativo', 2, 'treinou na academia'); } catch (e) { /* ok */ }
      const linhas = [];
      if (ok && depois > antes) linhas.push(Tf('+{0} em {1} ({2} → {3})', fmt1(depois - antes), T(NOME_ATRIB[n]), fmt1(antes), fmt1(depois)));
      else if (ok) linhas.push(Tf('{0} já está no máximo (10).', T(NOME_ATRIB[n])));
      else linhas.push(T('Sem ganho neste treino.'));
      if (ok && personal) linhas.push(T('Com a Fernanda: ganho em dobro!'));
      linhas.push(Tf('Treinos de hoje: {0}/{1}', a.treinos, TREINOS_DIA));
      await cartao(ok ? T('Treino concluído!') : T('Não foi dessa vez...'), linhas.join('\n'), [T('Continuar ▶')]);
      fecharOverlay();
      await voltarDoAparelho(tipo, q, true);
      M.mg = null;
      api.tickHorario(HORAS_TREINO / api.H_POR_S);                       // o treino leva 30 min
      api.gravar(s.dados.ponto || 'chegada');
    }
    async function animacaoFalha(tipo, q) {
      const G = M.mg, s = S(), F = M.fer;
      if (tipo === 'esteira') {
        await api.esperar(900);
        const viz = M.npcs.find((P) => P.naEsteira) || null;
        if (viz) { viz.fala = true; setTimeout(() => { if (viz) viz.fala = false; }, 1500); }
        for (const P of M.npcs) if (P.tipo === 'vaga') virarPara(P, q.x, q.z + 2);
        api.aviso((viz ? T('Alguém') + ': ' : '') + T('Eita! Tá tudo bem aí?'));
        await api.esperar(2600); api.aviso('');
        await api.fala('jog', T('Ai... ninguém viu isso, né?'));
      } else if (tipo === 'abdominal') {
        SOM.erro(); await api.esperar(800);
        await api.fala('jog', T('Desisto... não dá mais...'));
        await api.esperar(1200);
      } else {
        SOM.barra(); await api.esperar(700);
        await api.fala('jog', T('Socorro! Tira isso de mim!')); Dialogo.esconder();
        await socorroSupino(q);
        await api.fala('jog', T('Valeu... meu peito...'));
      }
      if (temPersonal() && F) {                                          // (6.3.0) a fala depende do treino e do motivo (e não repete a última)
        F.torce = 0;
        const L = (FALAS_ERRO[tipo] || {})[G && G.motivo] || Object.values(FALAS_ERRO[tipo] || { x: [] })[0] || [], a = dadosA();
        const op = L.filter((x) => x !== a.ultErroFer), t = pk(op.length ? op : L);
        if (t) { a.ultErroFer = t; await api.fala('fernanda', T(t)); }
      }
      Dialogo.esconder(); void s; void G;
    }
    // duas pessoas (a Fernanda, se estiver por perto, e quem estiver mais perto) vêm correndo, levantam a barra e voltam
    async function socorroSupino(q) {
      const G = M.mg, cands = [M.fer, ...M.npcs.filter((P) => P.tipo === 'vaga' || P.tipo === 'rosca')].filter(Boolean).slice(0, 2);
      // os dois lados da barra; cada um chega pelo seu lado (a "entrada" fica um pouco mais longe do banco) contornando os aparelhos
      const lados = [{ x: q.x - 0.62, z: q.z - 0.35, ax: q.x - 1.25 }, { x: q.x + 0.62, z: q.z - 0.35, ax: q.x + 1.25 }];
      const comp = (P, L) => { const r = rotaLivre(P.x, P.z, L.ax, L.z); let c = 0, px = P.x, pz = P.z; for (const [x, z] of r) { c += Math.hypot(x - px, z - pz); px = x; pz = z; } return { r, c }; };
      let ordem = [0, 1];                                                   // quem vai para cada lado: o menor caminho somado (a Fernanda do outro lado do banco fica do lado dela)
      if (cands.length === 2) { const a = comp(cands[0], lados[0]).c + comp(cands[1], lados[1]).c, b = comp(cands[0], lados[1]).c + comp(cands[1], lados[0]).c; if (b < a) ordem = [1, 0]; }
      else if (cands.length === 1 && comp(cands[0], lados[1]).c < comp(cands[0], lados[0]).c) ordem = [1];
      const ajud = cands.map((P, i) => { const L = lados[ordem[i]]; return { P, volta: { x: P.x, z: P.z, yaw: P.yaw, tipo: P.tipo, poseA: P.poseA }, lado: L, ida: comp(P, L).r.concat([[L.x, L.z]]) }; });
      for (const h of ajud) { h.P.tipo = 'cena'; h.P.poseA = null; h.P.andandoCena = true; h.P.rota = null; for (const m of M.halteres) m.visible = false; }
      await Promise.race([Promise.all(ajud.map((h) => api.andar(h.P, h.ida, 3.2))), api.esperar(6000)]);
      for (const h of ajud) { h.P.x = h.lado.x; h.P.z = h.lado.z; virarPara(h.P, q.x, h.lado.z); h.P.andando = false; }
      if (ajud[0]) { ajud[0].P.fala = true; }
      api.aviso((ajud[0] ? (ajud[0].P === M.fer ? T('Fernanda') : T('Alguém')) + ': ' : '') + T('Calma, a gente tira! Um, dois... já!'));
      // curvados pegando a barra e levantando até o suporte
      G.socorro = 'levantando'; const y0 = q.barra.position.y, z0 = q.barra.position.z;
      await new Promise((ok) => { G.levanta = { t: 0, y0, z0, ok }; });
      if (ajud[0]) ajud[0].P.fala = false; api.aviso('');
      G.socorro = 'livre';
      await api.esperar(500);
      for (const h of ajud) { h.P.curva = 0; }
      // a volta: sai pelo mesmo lado e contorna até onde estava
      await Promise.race([Promise.all(ajud.map((h) => api.andar(h.P, [[h.lado.ax, h.lado.z]].concat(rotaLivre(h.lado.ax, h.lado.z, h.volta.x, h.volta.z)), 1.6))), api.esperar(8000)]);
      for (const h of ajud) { const P = h.P; P.x = h.volta.x; P.z = h.volta.z; P.yaw = P.yawAlvo = h.volta.yaw; P.tipo = h.volta.tipo; P.poseA = h.volta.poseA; P.andandoCena = false; P.andando = false; if (P === M.fer && P.ia) { P.ia.e = 'espera'; P.ia.t = 0; P.ia.dur = 1; P.rota = null; } }
      for (const m of M.halteres) m.visible = true;
    }
    function tickSocorro(dt) {
      const G = M.mg; if (!G || !G.levanta) return;
      const L = G.levanta, q = G.q; L.t += dt;
      const k = suave((L.t - 0.6) / 1.3);
      q.barra.position.y = lerpN(L.y0, q.rack.y, k); q.barra.position.z = lerpN(L.z0, q.rack.z, k); q.barra.position.x = q.x;
      // os ajudantes: curvados com os braços na barra
      for (const P of [M.fer, ...M.npcs]) {
        if (!P || P.tipo !== 'cena' || P.andando) continue;
        const m = P.m, c = L.t < 0.6 ? suave(L.t / 0.6) : 1 - k * 0.7;
        m.corpo.rotation.z = -0.45 * c; usarJoelhos(m, -0.5 * c - 0.001, -0.5 * c - 0.001);
        m.bracoE.rotation.z = m.bracoD.rotation.z = 0.9 + 0.9 * k; m.bracoE.rotation.x = 0.15; m.bracoD.rotation.x = -0.15; usarCotovelo(m.bracoE, 0, 0.3); usarCotovelo(m.bracoD, 0, 0.3);
      }
      if (L.t > 2.2) { G.levanta = null; L.ok(); }
    }
    async function voltarDoAparelho(tipo, q, depois) {
      const s = S(), J = s.jog, F = M.fer;
      await api.preto(true, 350);
      if (M.mg) M.mg.fase = 'fim';                                       // daqui em diante a pose volta a ser a da cidade
      s.camCena = null; zerarPose(J); J.andando = false; J.correndo = false;
      if (tipo === 'supino') q.barra.position.set(q.rack.x, q.rack.y, q.rack.z);
      const p = tipo === 'esteira' ? { x: q.x + 0.95, z: q.z + 1.4 } : tipo === 'abdominal' ? { x: q.x + 0.95, z: q.z + 0.5 } : { x: q.x - 1.0, z: q.z + 0.6 };
      J.x = p.x; J.z = p.z; J.y = 0; J.yaw = J.yawAlvo = Math.PI / 2; s.cam.snap = true;
      if (F && M.A) { F.x = M.A.fernanda.x; F.z = M.A.fernanda.z; F.yaw = F.yawAlvo = M.A.fernanda.yaw; F.torce = 0; F.ia = null; zerarFer(F); }   // (6.3.0) depois do treino ela volta à agenda
      await api.preto(false, 350); void depois;
    }

    // ---------------------------------------------------------------- ONDE DÁ PARA ANDAR LÁ DENTRO (6.3.0)
    //   Uma rede de pontos pelo chão livre da sala (conferida contra as colisões nos testes): quem anda sozinho (a Fernanda, e os
    //   frequentadores indo embora) vai de ponto em ponto, sem atravessar aparelho nenhum. Coordenadas da sala (22 x 16).
    const NOS = {
      H: [-1.2, 1.2], A1: [-3.2, -1.4], A2: [0.6, -2.0], A3: [4.2, -1.9], A35: [6.2, -1.9], A4: [7.6, -1.9], A5: [8.4, -4.3],
      B2: [-1.5, -3.2], B1: [-1.5, -5.6], N1: [1.2, -6.4], N2: [5.6, -6.4], S1: [5.6, -5.5],
      C: [-6.0, -2.6], E2: [-7.4, -3.2], E1: [-9.2, -3.2], W0: [-10.0, -2.6], W1: [-10.0, 0.6], WB: [-9.7, 2.5],     // WB: do lado do bebedouro
      X1: [1.55, 2.2], X2: [1.55, 4.7],                                  // a passagem da catraca de SAÍDA
    };
    const ARESTAS = [['H', 'A1'], ['H', 'A2'], ['H', 'X1'], ['A1', 'A2'], ['A1', 'B2'], ['A2', 'B2'], ['A2', 'A3'], ['A3', 'A35'], ['A35', 'A4'], ['A4', 'A5'], ['A3', 'X1'],
      ['B2', 'B1'], ['B1', 'N1'], ['N1', 'N2'], ['N2', 'S1'], ['A1', 'C'], ['C', 'E2'], ['E2', 'E1'], ['C', 'W0'], ['W0', 'W1'], ['W1', 'WB'], ['X1', 'X2']];
    const VIZ = {}; for (const [a, b] of ARESTAS) { (VIZ[a] || (VIZ[a] = [])).push(b); (VIZ[b] || (VIZ[b] = [])).push(a); }
    const dist2 = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
    function noMaisPerto(x, z) { let b = 'H', bd = 1e9; for (const k of Object.keys(NOS)) { const d = dist2(NOS[k], [x, z]); if (d < bd) { bd = d; b = k; } } return b; }
    // menor caminho (Dijkstra) de um ponto qualquer até o ponto nomeado `fim`; devolve a lista de [x, z] a percorrer
    function caminhoSala(x, z, fim) {
      const ini = noMaisPerto(x, z), D = { [ini]: 0 }, de = {}, fila = [ini], feito = new Set();
      while (fila.length) {
        fila.sort((a, b) => D[a] - D[b]); const u = fila.shift(); if (feito.has(u)) continue; feito.add(u); if (u === fim) break;
        for (const v of VIZ[u] || []) { const d = D[u] + dist2(NOS[u], NOS[v]); if (D[v] === undefined || d < D[v]) { D[v] = d; de[v] = u; fila.push(v); } }
      }
      const r = []; for (let k = fim; k; k = de[k]) { r.unshift(NOS[k]); if (k === ini) break; }
      return r;
    }
    // caminho LIVRE de (x, z) até (tx, tz): se a reta não passa por aparelho nenhum, vai direto; senão entra na rede pelo ponto mais
    //   perto que dá para alcançar em linha reta e sai dela pelo ponto mais perto do destino que também chega reto nele
    function segLivre(ax, az, bx, bz, folga) {
      const L = (M.R && M.R.col) || [], d = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.ceil(d / 0.1)), f = folga == null ? 0.22 : folga;
      for (let k = 0; k <= n; k++) {
        const u = k / n, x = ax + (bx - ax) * u, z = az + (bz - az) * u;
        if (u * d < 0.3 || (1 - u) * d < 0.05) continue;                // o começo pode estar encostado num aparelho
        for (const b of L) if (x > b.x0 - f && x < b.x1 + f && z > b.z0 - f && z < b.z1 + f) return false;
      }
      return true;
    }
    function caminhoNos(ini, fim) {
      const D = { [ini]: 0 }, de = {}, fila = [ini], feito = new Set();
      while (fila.length) {
        fila.sort((a, b) => D[a] - D[b]); const u = fila.shift(); if (feito.has(u)) continue; feito.add(u); if (u === fim) break;
        for (const v of VIZ[u] || []) { const d = D[u] + dist2(NOS[u], NOS[v]); if (D[v] === undefined || d < D[v]) { D[v] = d; de[v] = u; fila.push(v); } }
      }
      const r = []; for (let k = fim; k; k = de[k]) { r.unshift(NOS[k].slice()); if (k === ini) break; }
      return r;
    }
    function rotaLivre(x, z, tx, tz) {
      if (segLivre(x, z, tx, tz)) return [[tx, tz]];
      const nos = Object.keys(NOS), porDist = (px, pz) => nos.slice().sort((a, b) => dist2(NOS[a], [px, pz]) - dist2(NOS[b], [px, pz]));
      const ini = porDist(x, z).find((k) => segLivre(x, z, NOS[k][0], NOS[k][1])) || noMaisPerto(x, z);
      const fim = porDist(tx, tz).find((k) => segLivre(NOS[k][0], NOS[k][1], tx, tz)) || noMaisPerto(tx, tz);
      const r = caminhoNos(ini, fim); r.push([tx, tz]);
      // atalhos: pula pontos da rede quando dá para ir reto até um ponto mais à frente
      const out = []; let px = x, pz = z, k = 0;
      while (k < r.length) { let j = r.length - 1; while (j > k && !segLivre(px, pz, r[j][0], r[j][1])) j--; out.push(r[j]); px = r[j][0]; pz = r[j][1]; k = j + 1; }
      return out;
    }
    // anda até o próximo ponto da rota; devolve true quando a rota acabou
    function passoRota(P, dt, vel) {
      const r = P.rota; if (!r || !r.length) { P.andando = false; return true; }
      const [tx, tz] = r[0], dx = tx - P.x, dz = tz - P.z, d = Math.hypot(dx, dz), v = (vel || P.vel || 1.4) * dt;
      if (d <= Math.max(v, 0.08)) { P.x = tx; P.z = tz; r.shift(); if (!r.length) { P.andando = false; return true; } return false; }
      P.x += dx / d * v; P.z += dz / d * v; P.yawAlvo = Math.atan2(-dz, dx); P.andando = true; P.vel = vel || P.vel || 1.4; return false;
    }

    // ---------------------------------------------------------------- A HORA DE IR EMBORA (frequentadores, 20h30–21h30)
    function comecarSaida(P) {
      P.saindo = true; P.tipo = 'sai'; P.poseA = null; P.supino = null; P.colch = null; P.naEsteira = null; P.alvoV = null; P.espera = 0;
      zerarPose(P); P.y = 0; P.correndo = false;
      if (P.halt) for (const h of P.halt) h.visible = false;
      const e = P.estacao, ant = [];
      if (e === 'esteira') ant.push([P.x, -3.2]);                                        // desce da esteira pelo fundo
      else if (e === 'supinoNPC') ant.push([6.5, -3.7]);                                 // levanta do banco pelo lado
      else if (e === 'abdNPC') ant.push([-10.0, 0.6]);
      const base = ant.length ? ant[ant.length - 1] : [P.x, P.z];
      P.rota = ant.map((q) => q.slice()).concat(caminhoSala(base[0], base[1], 'X2').map((q) => q.slice()));
      const sd = M.R && M.R.saida; if (sd) P.rota.push([sd.x, sd.z]);
      if (P.fala) P.fala = false;
    }
    function tickSaidas(dt) {
      const h = hora();
      for (const P of M.npcs.slice()) {
        if (!P.saindo) { if (P.chegando) continue; if (P.saiH != null && h >= P.saiH && h < H_FECHA && P.tipo !== 'cena' && !P.andandoCena && !(M.mg && M.mg.fase === 'jogo')) comecarSaida(P); continue; }
        if (passoRota(P, dt, VEL_SAIDA)) {                                                    // chegou na porta: vai embora
          const i = M.npcs.indexOf(P); if (i >= 0) M.npcs.splice(i, 1);
          if (P.slot) { P.slot.P = null; P.slot.foi = hora() < H_ALMOCO + 0.5 ? 'm' : 't'; }   // (6.6.5) hoje, nesse turno, ele já foi
          if (M.A && M.R) api.descartarPessoa(P);
        }
      }
    }

    // ---------------------------------------------------------------- A FERNANDA CIRCULANDO PELA ACADEMIA (6.3.0)
    //   Em vez de ficar parada com a prancheta, ela segue uma "agenda" sem fim: faz a ronda pela sala, vai orientar um frequentador
    //   (fica do lado do aparelho dele, de frente para ele, explicando com as mãos), treina um pouco na frente do espelho
    //   (agachamento, polichinelo, alongamento), anota na prancheta e bebe água. Estados em F.ia: espera · anda · orienta · treina · prancheta · bebe.
    const VEL_FER = 1.3;
    const PONTO_ORIENTA = { supinoNPC: 'S1', abdNPC: 'W1', rosca: 'A5' };      // onde ela fica para orientar cada um (a esteira: E1 ou E2, de acordo com a esteira)
    const EXERCICIOS = ['agacha', 'polichinelo', 'alonga'];
    const escolha = (lista) => lista[Math.floor(Math.random() * lista.length)];
    const alturaQuadril = (phi, psi) => 0.28 * Math.cos(phi) + 0.435 * Math.cos(psi) + 0.025;
    function pontoDeOrientar(P) { return P.estacao === 'esteira' ? (P.naEsteira && P.naEsteira.x < -8 ? 'E1' : 'E2') : PONTO_ORIENTA[P.estacao] || null; }
    function proximaAcao(F) {
      const f = F.ia, ult = f.ult;
      const cands = M.npcs.filter((P) => !P.saindo && pontoDeOrientar(P) && P !== f.ultP);
      const opc = [];
      if (cands.length) opc.push(['orienta', 3.2]);
      if (!M.esp) opc.push(['treina', 2.4]);                              // (com o jogador posando no espelho ela não treina ali)
      opc.push(['prancheta', 1.2], ['bebe', 0.8], ['ronda', 1.2]);
      const lista = opc.filter(([n]) => n !== ult || n === 'orienta');
      let r = Math.random() * lista.reduce((a, [, w]) => a + w, 0), nome = lista[0][0];
      for (const [n, w] of lista) { r -= w; if (r <= 0) { nome = n; break; } }
      f.ult = nome; f.t = 0;
      if (nome === 'orienta') { const P = escolha(cands); f.ultP = P; irPara(F, pontoDeOrientar(P), { e: 'orienta', P, dur: 9 + Math.random() * 6 }); }
      else if (nome === 'treina') { const ex = escolha(EXERCICIOS.filter((x) => x !== f.ultEx)); f.ultEx = ex; irPara(F, 'B1', { e: 'treina', ex, dur: 12 + Math.random() * 7 }); }
      else if (nome === 'bebe') irPara(F, 'WB', { e: 'bebe', dur: 4 + Math.random() * 2 });
      else if (nome === 'prancheta') irPara(F, escolha(['H', 'A2', 'A1', 'A3']), { e: 'prancheta', dur: 5 + Math.random() * 4 });
      else irPara(F, escolha(['A1', 'A3', 'A2', 'C', 'A35', 'H']), { e: 'espera', dur: 1 + Math.random() * 1.5 });
    }
    function irPara(F, no, depois) {
      const f = F.ia; f.depois = depois; F.rota = rotaLivre(F.x, F.z, NOS[no][0], NOS[no][1]);
      if (F.rota.length && Math.hypot(F.rota[0][0] - F.x, F.rota[0][1] - F.z) < 0.1) F.rota.shift();
      if (!F.rota.length) chegouFer(F); else { f.e = 'anda'; f.t = 0; }
    }
    function chegouFer(F) {
      const f = F.ia, d = f.depois; F.andando = false; f.e = d.e; f.t = 0; f.dur = d.dur; f.P = d.P || null; f.ex = d.ex || null; F.rota = null;
      if (d.e === 'orienta' && d.P) virarPara(F, d.P.x, d.P.z);
      else if (d.e === 'treina') { F.yawAlvo = Math.PI / 2; }                                        // de frente para o espelho (norte)
      else if (d.e === 'bebe') { F.yawAlvo = Math.PI; }                                              // de frente para o bebedouro (oeste)
    }
    function zerarFer(F) {
      const m = F.m; zerarPose(F); m.corpo.position.x = 0; m.corpo.position.y = 0; m.corpo.rotation.set(0, 0, 0); m.pernaE.rotation.set(0, 0, 0); m.pernaD.rotation.set(0, 0, 0);
      if (F.prancheta) F.prancheta.visible = false;
    }
    function tickFernanda(dt) {
      const F = M.fer; if (!F) return;
      if (F.conversando || F.andandoCena || (M.mg && temPersonal())) { if (!F.andandoCena) F.andando = false; return; }   // conversando ou no treino: ela PARA (senão ficava andando no lugar)
      if (!F.ia) { F.ia = { e: 'espera', t: 0, dur: 1.2, ult: null }; }
      const f = F.ia; f.t += dt;
      if (f.e === 'anda') { if (passoRota(F, dt, VEL_FER)) chegouFer(F); return; }
      F.andando = false;
      if (f.e === 'orienta') { if (!f.P || f.P.saindo || f.P.tipo === 'cena') f.t = f.dur; else { F.yawAlvo = Math.atan2(-(f.P.z - F.z), f.P.x - F.x); f.P.fala = Math.sin(f.t * 1.7 + 1) > 0.45; } }
      if (f.t >= f.dur) {
        if (f.P) f.P.fala = false;
        if (f.e === 'treina' || f.e === 'bebe') zerarFer(F);
        proximaAcao(F);
      }
    }
    // a pose de cada estado (por cima do poseAtor, depois do tickPessoas)
    function poseFernandaAcao(F) {
      const s = S(), m = F.m, f = F.ia, t = s.t; if (!f || f.e === 'anda') return;
      const pr = () => segurarPrancheta(m);
      if (f.e === 'espera') return;
      if (f.e === 'orienta') {
        const fase = Math.floor(f.t / 2.4) % 3;
        if (fase === 0) { m.bracoD.rotation.z = 1.35 + Math.sin(t * 3) * 0.05; m.bracoD.rotation.x = 0.12; usarCotovelo(m.bracoD, 0, 0.12); }              // aponta para ele
        else if (fase === 1) { m.bracoD.rotation.z = 1.0 + Math.sin(t * 6) * 0.2; m.bracoD.rotation.x = 0.25; usarCotovelo(m.bracoD, 0, 1.1); }          // explica com a mão
        else { m.bracoD.rotation.z = 1.5; m.bracoD.rotation.x = 0.05; usarCotovelo(m.bracoD, 0, 0.5 + Math.sin(t * 8) * 0.18); }                         // marca o ritmo
        usarCabeca(m, Math.sin(t * 2.2) * 0.08 - 0.001);
      } else if (f.e === 'prancheta') {
        pr(); m.bracoD.rotation.z = PR_MAO_D.rz; m.bracoD.rotation.x = PR_MAO_D.rx; usarCotovelo(m.bracoD, PR_MAO_D.cx, PR_MAO_D.cz + Math.sin(t * 9) * 0.07); usarCabeca(m, -0.38);   // escrevendo na prancheta
      } else if (f.e === 'bebe') {
        m.bracoE.rotation.z = 0.2; m.bracoD.rotation.z = 0.2; usarCabeca(m, -0.28 - 0.04 * Math.sin(t * 2));
      } else if (f.e === 'treina') {
        const T0 = f.t;
        if (f.ex === 'agacha') {
          const k = 0.5 - 0.5 * Math.cos(T0 * Math.PI * 2 / 2.8), phi = 1.2 * k, psi = -0.35 * k;
          m.pernaE.rotation.z = m.pernaD.rotation.z = phi; usarJoelhos(m, psi - phi - 0.001, psi - phi - 0.001);
          m.corpo.position.y = -(0.74 - alturaQuadril(phi, psi)); m.corpo.position.x = -(0.28 * Math.sin(phi) + 0.435 * Math.sin(psi));
          bracos(F, [0.15, 0.1, 0, 0.001], [0.15, 1.5, 0, 0.001], k); usarCabeca(m, -0.001 - 0.05 * k);
        } else if (f.ex === 'polichinelo') {
          const c = Math.sin(T0 * Math.PI * 2 / 0.8), o = 0.5 + 0.5 * Math.max(-1, Math.min(1, c * 2.5));
          m.pernaE.rotation.x = 0.34 * o; m.pernaD.rotation.x = -0.34 * o; m.corpo.position.y = 0.1 * Math.abs(Math.sin(T0 * Math.PI * 2 / 0.8 + 0.4));
          bracos(F, [0.12, 0.05, 0, 0.001], [2.5, 0.1, 0, 0.001], o); usarCabeca(m, -0.001);
        } else {                                                                                       // alongamento: braços para cima e inclina para os lados
          const lado = Math.sin(T0 * Math.PI * 2 / 4.5), up = Math.min(1, T0 / 1.0);
          bracos(F, [0.12, 0.05, 0, 0.001], [0.1, 2.8, 0, 0.001], up); m.corpo.rotation.x = 0.16 * lado * up; usarCabeca(m, -0.001);
        }
      }
    }

    // ---------------------------------------------------------------- O ESPELHO (6.3.0): poses de fisiculturismo
    //   A câmera fica "no espelho" (colada na parede norte, olhando para a sala) e o personagem posa de frente para ela. Cinco poses,
    //   que trocam sozinhas a cada ~4 s (ou no botão "Próxima pose ▶"); "Sair do espelho" volta ao jogo.
    //   Cada braço: [abre (x), frente (z), cotovelo x, cotovelo z]; pernas: [coxaE z, coxaD z, abreE x, abreD x]; k = dobra dos joelhos; yaw = giro do corpo.
    const POSES_ESP = [
      { nome: 'Duplo bíceps', E: [1.5, 0.0, 1.7, 0.001], D: [-1.5, 0.0, -1.7, 0.001], L: [0, 0, 0.12, -0.12], k: 0, yaw: 0, desce: 0 },
      { nome: 'Dorsal aberto', E: [0.85, 0.0, -1.9, 0.001], D: [-0.85, 0.0, 1.9, 0.001], L: [0, 0, 0.1, -0.1], k: 0, yaw: 0, desce: 0 },
      { nome: 'Peitoral lateral', E: [0.2, 1.0, -1.6, 0.001], D: [-0.2, 1.0, 1.6, 0.001], L: [0.25, -0.1, 0, 0], k: 0.001, yaw: -1.3, desce: 0 },
      { nome: 'Abdômen e coxas', E: [3.107, 0.142, 2.108, 1.988], D: [-3.107, 0.142, -2.108, 1.988], L: [0.28, -0.05, 0.1, -0.1], k: 0.001, yaw: 0, desce: 0 },
      { nome: 'Mais musculoso', E: [0.3, 0.9, -1.5, 0.001], D: [-0.3, 0.9, 1.5, 0.001], L: [0.2, 0.2, 0.18, -0.18], k: 0.5, yaw: 0, desce: 0.1 },
    ];
    const lerpVet = (a, b, k) => a.map((v, i) => lerpN(v, b[i], k));
    function poseEsp(i) { return POSES_ESP[i % POSES_ESP.length]; }
    function vetorPose(P) { return { E: P.E, D: P.D, L: P.L, k: [P.k], yaw: [P.yaw], desce: [P.desce] }; }
    function aplicarPoseEsp(J, v, trem) {
      const m = J.m, tr = Math.sin(S().t * 38) * 0.018 * trem;
      m.bracoE.rotation.set(v.E[0] + tr, 0, v.E[1]); usarCotovelo(m.bracoE, v.E[2], v.E[3] || 0.001);
      m.bracoD.rotation.set(v.D[0] - tr, 0, v.D[1]); usarCotovelo(m.bracoD, v.D[2], v.D[3] || 0.001);
      m.pernaE.rotation.set(v.L[2], 0, v.L[0]); m.pernaD.rotation.set(v.L[3], 0, v.L[1]);
      const k = v.k[0]; usarJoelhos(m, k > 0 ? -k : 0, k > 0 ? -k : 0);
      m.corpo.position.y = -v.desce[0] + Math.abs(tr) * 0.3; usarCabeca(m, -0.001);
    }
    async function espelho() {
      const s = S(), J = s.jog, F = M.fer; if (!M.A || M.esp) return;
      // onde posar: perto de onde o jogador estava, mas longe da Fernanda (que treina ali no meio)
      const x0 = J.x, z0 = J.z, yaw0 = J.yaw;                            // de onde ele veio (volta para lá)
      let x = clampN(J.x, -3.6, 0.7);
      if (F && Math.abs(F.x - x) < 2.2) x = F.x < -1.4 ? 0.7 : -3.6;
      await api.preto(true, 350);
      J.sentado = false; J.rota = null; J.andando = false; J.correndo = false; J.x = x; J.z = -4.7; J.yaw = J.yawAlvo = Math.PI / 2; J.y = 0;
      s.camCena = { px: x, py: 1.5, pz: -7.55, tx: x, ty: 0.95, tz: -4.7 };
      const E = M.esp = { x, i: 0, t: 0, de: poseEsp(POSES_ESP.length - 1), ate: poseEsp(0), k: 1, fim: null, yawAtual: 0 };
      E.v = vetorPose(E.ate); M.espelhoUI = montarUIEspelho(E);
      poseEspelho(0.016); await api.preto(false, 350);
      await new Promise((ok) => { E.fim = ok; });
      fecharOverlay(); M.espelhoUI = null;
      await api.preto(true, 350);
      s.camCena = null; zerarPose(J); J.andando = false; J.yaw = J.yawAlvo = yaw0; J.x = x0; J.z = z0; s.cam.snap = true; M.esp = null;
      await api.preto(false, 350);
    }
    function proximaPoseEsp(E) { E.de = E.ate; E.i = (E.i + 1) % POSES_ESP.length; E.ate = poseEsp(E.i); E.k = 0; E.t = 0; atualizarTituloEspelho(E); }
    function atualizarTituloEspelho(E) { const el = elOv && elOv.querySelector('.acTopo'); if (el) el.textContent = T(E.ate.nome); }
    function montarUIEspelho(E) {
      const el = overlayBase(); el.style.pointerEvents = 'none'; el.style.zIndex = '12'; el.style.top = 'calc(50px + env(safe-area-inset-top,0px))';
      el.innerHTML = '<div class="acTopo" style="position:absolute;left:50%;top:2px;transform:translateX(-50%);text-align:center;font:700 16px/1.2 var(--font-display);color:#f2c230;text-shadow:0 2px 0 #000;letter-spacing:.06em;white-space:nowrap;text-transform:uppercase;"></div>';
      const fila = document.createElement('div');
      fila.style.cssText = 'position:absolute;left:50%;bottom:calc(22px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);display:flex;gap:12px;pointer-events:auto;';
      const b1 = botao(T('Próxima pose ▶'), true), b2 = botao(T('Sair do espelho'), false);
      b1.onclick = (e) => { e.stopPropagation(); proximaPoseEsp(E); }; b2.onclick = (e) => { e.stopPropagation(); if (E.fim) { const f = E.fim; E.fim = null; f(); } };
      fila.append(b1, b2); el.appendChild(fila); atualizarTituloEspelho(E);
      window.addEventListener('keydown', teclaEspelho, true);
      return el;
    }
    function teclaEspelho(e) {
      const E = M.esp; if (!E) { window.removeEventListener('keydown', teclaEspelho, true); return; }
      if (e.code === 'Escape' || e.code === 'KeyX') { e.preventDefault(); e.stopPropagation(); if (E.fim) { const f = E.fim; E.fim = null; f(); } }
      else if (e.code === 'Space' || e.code === 'Enter' || e.code === 'NumpadEnter') { e.preventDefault(); e.stopPropagation(); if (!e.repeat) proximaPoseEsp(E); }
    }
    function tickEspelho(dt) {
      const E = M.esp; if (!E) return;
      E.t += dt; E.k = Math.min(1, E.k + dt / 0.55);
      if (E.t > 4.2 && E.k >= 1) proximaPoseEsp(E);
      const k = suave(E.k), a = vetorPose(E.de), b = vetorPose(E.ate);
      E.v = { E: lerpVet(a.E, b.E, k), D: lerpVet(a.D, b.D, k), L: lerpVet(a.L, b.L, k), k: lerpVet(a.k, b.k, k), yaw: lerpVet(a.yaw, b.yaw, k), desce: lerpVet(a.desce, b.desce, k) };
    }
    // (6.6.5) O ESPELHO TAMBÉM É DOS FREQUENTADORES: de vez em quando o que anda pela sala vai até o espelho (longe da Fernanda e do
    //   jogador), faz duas poses (as mesmas do jogador) ou tira uma SELFIE no espelho (celular na mão, flash) e volta a andar pela sala.
    const SPOTS_ESP = [[-3.5, -5.45], [0.55, -5.55]];
    const NEUTRO_ESP = { E: [0, 0, 0, 0.001], D: [0, 0, 0, 0.001], L: [0, 0, 0, 0], k: [0], yaw: [0], desce: [0] };
    const SELFIE_ESP = { E: [1.5, 0.0, 1.7, 0.001], D: [0.38, 1.55, 0, 1.3], L: [0, 0, 0.1, -0.1], k: [0], yaw: [0], desce: [0] };   // celular na frente do rosto, o outro braço flexionado
    let geoCelA = null;
    function darCelA(P) {
      if (P.celA) return;
      if (!geoCelA) { const G = new api.Geo(); G.box(0.09, 0.16, 0.024, '#1c1c1f', 0, -0.08, 0); G.box(0.072, 0.13, 0.004, '#7fb2e8', 0, -0.08, 0.013); geoCelA = G.malha(api.MAT).geometry; }
      const c = new THREE.Mesh(geoCelA, api.MAT); c.position.set(0.04, -0.3, 0); c.rotation.z = Math.PI; P.m.bracoD.cotovelo.add(c); P.celA = c;
    }
    function tirarCelA(P) { if (P.celA) { if (P.celA.parent) P.celA.parent.remove(P.celA); P.celA = null; } }
    function flashA(P) {
      if (!P.celA) return; const p = new THREE.Vector3(); P.celA.getWorldPosition(p);
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ color: 0xffffff, transparent: true, opacity: 0.95, depthWrite: false })); sp.position.copy(p); sp.scale.set(0.22, 0.22, 1); S().grupo.add(sp);
      const t0 = performance.now(), passo = () => { const u = (performance.now() - t0) / 260; sp.material.opacity = 0.95 * (1 - u); if (u < 1) requestAnimationFrame(passo); else { if (sp.parent) sp.parent.remove(sp); sp.material.dispose(); } }; requestAnimationFrame(passo);
    }
    function tickEspelhoNPC(dt) {
      const E = M.espN;
      if (!E) {
        M.tEspN = (M.tEspN == null ? 12 + Math.random() * 15 : M.tEspN) - dt; if (M.tEspN > 0) return;
        M.tEspN = 28 + Math.random() * 40;
        if (M.esp || M.mg || !M.A) return;
        const P = M.npcs.find((q) => q.slot && q.slot.f.tipo === 'vaga' && q.tipo === 'vaga' && !q.saindo && !q.chegando && !q.conversando); if (!P) return;
        const F = M.fer, J = S().jog, sp = SPOTS_ESP.find(([x, z]) => (!F || Math.hypot(F.x - x, F.z - z) > 1.9) && Math.hypot(J.x - x, J.z - z) > 1.5); if (!sp) return;
        P.tipo = 'espelhoNPC'; P.alvoV = null; P.rota = rotaLivre(P.x, P.z, sp[0], sp[1]).map((q) => q.slice());
        M.espN = { P, fase: 'vai', t: 0, sp, selfie: Math.random() < 0.45, i: 0, k: 0, pose: POSES_ESP[Math.floor(Math.random() * POSES_ESP.length)] };
        return;
      }
      const P = E.P; E.t += dt;
      if (!M.npcs.includes(P) || P.saindo) { tirarCelA(P); M.espN = null; return; }
      if (E.fase === 'vai') { if (passoRota(P, dt, 1.2) || E.t > 14) { E.fase = 'posa'; E.t = 0; E.k = 0; P.andando = false; P.yaw = P.yawAlvo = Math.PI / 2; } return; }
      if (E.fase === 'posa') {
        P.andando = false; P.yawAlvo = Math.PI / 2; E.k = Math.min(1, E.k + dt / 0.5);
        let acabou = false;
        if (E.selfie) { darCelA(P); if (E.t > 1.7 && !E.flash) { E.flash = true; flashA(P); } if (E.t > 3.3) acabou = true; }
        else if (E.t > 2.8) { E.i++; if (E.i >= 2) acabou = true; else { E.de = E.pose; E.pose = POSES_ESP.filter((q) => q !== E.pose)[Math.floor(Math.random() * (POSES_ESP.length - 1))]; E.t = 0; E.k = 0; } }
        if (acabou) { tirarCelA(P); zerarPose(P); E.fase = 'volta'; E.t = 0; const v = M.A.vaga; P.rota = rotaLivre(P.x, P.z, (v.x0 + v.x1) / 2, (v.z0 + v.z1) / 2).map((q) => q.slice()); }
        return;
      }
      if (E.fase === 'volta' && (passoRota(P, dt, 1.2) || E.t > 14)) { P.tipo = 'vaga'; P.area = M.A.vaga; P.alvoV = null; M.espN = null; }
    }
    function poseEspelhoNPC() {
      const E = M.espN; if (!E || E.fase !== 'posa') return;
      const P = E.P, alvo = E.selfie ? SELFIE_ESP : vetorPose(E.pose), de = E.de ? vetorPose(E.de) : NEUTRO_ESP, k = suave(E.k);
      const v = { E: lerpVet(de.E, alvo.E, k), D: lerpVet(de.D, alvo.D, k), L: lerpVet(de.L, alvo.L, k), k: lerpVet(de.k, alvo.k, k), yaw: lerpVet(de.yaw, alvo.yaw, k), desce: lerpVet(de.desce, alvo.desce, k) };
      P.yaw = P.yawAlvo = Math.PI / 2 + v.yaw[0]; P.m.raiz.rotation.y = P.yaw; aplicarPoseEsp(P, v, E.k >= 1 ? 0.6 : 0.2);
    }
    function poseEspelho(dt) {
      const E = M.esp, J = S().jog; if (!E || !E.v) return;
      J.x = E.x; J.z = -4.7; J.yaw = J.yawAlvo = Math.PI / 2 + E.v.yaw[0];
      J.m.raiz.rotation.y = J.yaw; aplicarPoseEsp(J, E.v, E.k >= 1 ? 1 : 0.3); void dt;
    }

    // ---------------------------------------------------------------- FECHAR (11h e 22h) com o jogador lá dentro
    async function fecharAcademia() {
      const s = S(); s.modo = 'cena'; api.UI().ctl.hidden = true; api.aviso('');
      try {
        if (s.jog.sentado) api.levantar();
        if (M.diego) { await api.fala('diego', T(hora() < 12 ? 'Pessoal, vamos fechar para o almoço! A gente volta às 13h.' : 'Já são 22h, vamos fechar! A gente se vê amanhã, a partir das 7h.')); Dialogo.esconder(); }
        await api.sairDoLugar();
      } catch (e) { console.error(e); }
      const ss = S(); if (ss && ss.ativo && ss.modo === 'cena') api.liberar();
    }

    // ---------------------------------------------------------------- DIEGO E FERNANDA NA RUA: das casas deles até a academia e de volta
    //   Chegam 6 min antes de abrir (6h54 e 12h54), saem às 11h (almoço em casa) e às 22h. A posição vem direto da hora (como o Cadu e a Rosa).
    function viagens() { return [{ ida: true, chega: H_ABRE - H_CHEGA_ANTES }, { ida: false, sai: H_ALMOCO }, { ida: true, chega: H_VOLTA - H_CHEGA_ANTES }, { ida: false, sai: H_FECHA }]; }
    function montarRua() {
      // as casas ficam a 75–95 m da academia: o Diego vai a passo rápido e a Fernanda (personal) vai trotando, para a ida e a volta do almoço caberem nas 2 h
      api.criarRuaAgendada(criarDiego(), 'diego', 'academia', viagens, 2.4);
      api.criarRuaAgendada(criarFernanda(), 'fernanda', 'academia', viagens, 3.4, true);
    }

    // ---- a cada quadro (depois do tickJogador e do tickPessoas)
    function tick(dt) {
      const s = S(); if (!s || !dentroAcad()) return;
      tickCatracas(dt); tickChegadas(dt); tickSaidas(dt); tickFernanda(dt); tickEspelhoNPC(dt); posesNPC(dt); poseEspelhoNPC(); tickEspelho(dt); poseEspelho(dt);
      if (!M.mg && !M.esp && !M.fechando && !aberto() && s.modo === 'livre') { M.fechando = true; fecharAcademia().finally(() => { M.fechando = false; }); }   // (6.3.0)
      const G = M.mg;
      if (G) {
        if (G.fase === 'jogo') tickJogo(dt);
        poseJogador(dt); tickSocorro(dt);
      }
    }
    function limpar() { fecharOverlay(); }

    return {
      entrou, saiu, alvos, tick, limpar, aberto, rotuloFechada, montarRua, agenda, criarFreq,
      temAcesso, temPersonal, treinosHoje, emTreino: () => !!M.mg,
      _M: M,
      _f: { socorroSupino, rotaLivre, segLivre, segurarPrancheta, espelho, POSES_ESP, aplicarPoseEsp, proximaPoseEsp, falhouHoje, marcarFalha, FALAS_ERRO, NOS, ARESTAS, caminhoSala, horaSaida, comecarSaida, viagens, agendaFreq, janelaFreq, chegarFreq, FREQ, tickEspelhoNPC, proximaAcao, irPara, chegouFer, zerarFer, treinar, toque, falarComDiego, falarComFernanda, catracaTravada, poseSupino, poseAbd, deitar, bracos, maos, acabar, pagar, dadosA, dificuldade },
      _regras: { PRECO_ACESSO, PRECO_PERSONAL, DIAS_PLANO, TREINOS_DIA, GANHO, HORAS_TREINO, EST, ABD, SUP, BR },
    };
  }

  window.FutebolJS.registrarFase({ id: 'academia', nome: 'Academia', nucleoMinimo: '6.2.0', iniciar: async () => {}, criar });
})();
