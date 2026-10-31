/* =====================================================================
   FUTEBOL JS · academia.js · A ACADEMIA DA CIDADEZINHA E OS TREINOS (arquivo SEPARADO, como pizzaria.js)
   ---------------------------------------------------------------------
   6.2.0 — primeira versão.
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
    'Calma, acontece com todo mundo. Amanhã a gente acerta!': ['Easy, it happens to everyone. We’ll get it tomorrow!', 'Tranquilo, le pasa a todo el mundo. ¡Mañana lo logramos!', 'Calma, succede a tutti. Domani ce la facciamo!', 'Du calme, ça arrive à tout le monde. Demain on y arrive !'],
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
  };
  for (const k of Object.keys(TRAD)) if (!I18N[k]) I18N[k] = TRAD[k];

  // ------------------------------------------------------------------ regras
  const PRECO_ACESSO = 400, PRECO_PERSONAL = 300, DIAS_PLANO = 7, TREINOS_DIA = 3, GANHO = 0.1, HORAS_TREINO = 0.5;
  const ATRIB = { esteira: 'velocidade', abdominal: 'resistencia', supino: 'forca' };
  const NOME_ATRIB = { velocidade: 'Velocidade', resistencia: 'Resistência', forca: 'Força' };
  const TITULO = { esteira: 'ESTEIRA · VELOCIDADE', abdominal: 'ABDOMINAL · RESISTÊNCIA', supino: 'SUPINO · FORÇA' };
  const DICA_FER = { esteira: 'Na esteira, o segredo é o ritmo: não deixe a lona te levar para trás.', abdominal: 'No abdominal, sobe só quando o marcador estiver no verde. Sem pressa!', supino: 'No supino, não deixa a barra parar no peito. Empurra sem dó!' };
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
    const dentroAcad = () => { const s = S(); return !!(s && s.dentro && s.dentro.nome === 'academia' && M.A); };
    const nivel = (n) => { const at = api.atributosJogador(); return +at[n] || 5; };
    const dificuldade = (tipo) => 1 + clampN(nivel(ATRIB[tipo]) - 5, 0, 5) * 0.05;

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
    // A FERNANDA: cabelo vermelho marsala cacheado, pele branca, rosto delicado, top e legging pretos (+ prancheta na mão)
    const AP_FERNANDA = () => ({ pele: PELES_FITZ[1].cor, cabelo: '#6e1a2e', estilo: acha(ESTILOS_CABELO, 'Cacheado volumoso'), rosto: acha(ROSTOS, 'Delicada'), labio: 1, barba: 0, corBarba: '#6e1a2e' });
    function criarFernanda() {
      const { m, opt } = modelo(AP_FERNANDA(), true, 19, ['#151517', '#151517', '#2a2a2e', '#151517']);   // "Top e calça": top preto + legging preta
      const G = new api.Geo(); G.box(0.03, 0.26, 0.2, '#8a5a2a', 0, -0.36, 0); G.box(0.035, 0.2, 0.16, '#f4f4ec', 0.01, -0.35, 0); G.box(0.04, 0.03, 0.06, '#c9ced4', 0.01, -0.235, 0);
      m.bracoE.cotovelo.add(G.malha(api.MAT));                                                          // a prancheta (mão esquerda)
      const A = api.atorDe(m, opt, 'acadNPC'); A.poseA = 'fernanda'; A.vel = 1.4; return A;
    }
    const ROUPAS_TREINO = { M: [15, 9, 8, 16], F: [18, 15, 4, 19] };
    const CORES_TREINO = ['#c8352b', '#1c1c1f', '#3a64b8', '#f2c230', '#1f7a4d', '#f2f2ee', '#7a4fb0', '#e8742a', '#3fb7b0', '#d95fa0'];
    function criarFrequentador(fem, semente) {
      const ap = gerarAparencia(semente, fem ? 'F' : 'M'), r = ROUPAS_TREINO[fem ? 'F' : 'M'];
      const { m, opt } = modelo(ap, fem, r[semente % r.length], [CORES_TREINO[semente % 10], pk(['#1c1c1f', '#2a3f66', '#3a3a3e']), CORES_TREINO[(semente >> 3) % 10], '#f2f2ee']);
      return api.atorDe(m, opt, 'acadNPC');
    }
    function halter(A) {                                                // um halter em cada mão (rosca)
      for (const b of [A.m.bracoE, A.m.bracoD]) { const G = new api.Geo(); G.box(0.05, 0.05, 0.3, '#c9ced4', 0, -0.3, 0); for (const s of [-1, 1]) G.box(0.13, 0.13, 0.07, '#1c1c1f', 0, -0.3, s * 0.15); const h = G.malha(api.MAT); b.cotovelo.add(h); M.halteres.push(h); }
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
      // frequentadores: duas esteiras, um supino, um abdominal, rosca com halteres e um andando
      const base = (dia() * 131) % 997;
      A.esteiras.filter((e) => !e.jog).forEach((e, i) => { const P = colocar(criarFrequentador(i === 0, base + 11 + i * 7), e.x, e.z + 0.1, Math.PI / 2); P.tipo = 'esteira'; P.y = e.y; P.naEsteira = e; M.npcs.push(P); });
      { const sp = A.supinos.find((q) => !q.jog), P = colocar(criarFrequentador(false, base + 41), sp.x, sp.z, -Math.PI / 2); P.poseA = 'supino'; P.supino = sp; P.fase0 = Math.random() * 6; M.npcs.push(P); }
      { const c = A.colchonetes.find((q) => !q.jog && q.x < -7), P = colocar(criarFrequentador(true, base + 53), c.x, c.z, -Math.PI / 2); P.poseA = 'abdominal'; P.colch = c; P.fase0 = Math.random() * 6; M.npcs.push(P); }
      { const P = colocar(criarFrequentador(false, base + 67), A.rosca.x, A.rosca.z, A.rosca.yaw); P.tipo = 'rosca'; halter(P); M.npcs.push(P); }
      { const P = colocar(criarFrequentador(Math.random() < 0.5, base + 79), (A.vaga.x0 + A.vaga.x1) / 2, (A.vaga.z0 + A.vaga.z1) / 2); P.tipo = 'vaga'; P.area = A.vaga; M.npcs.push(P); }
    }
    function saiu() {
      const s = S();
      if (s && s.falantesExtra) { delete s.falantesExtra.diego; delete s.falantesExtra.fernanda; }
      if (M.mg) fecharOverlay();
      M.mg = null; M.R = null; M.A = null; M.diego = null; M.fer = null; M.npcs = []; M.halteres = [];
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
      const feitos = treinosHoje(), cheio = feitos >= TREINOS_DIA;
      const ap = [
        ['esteira', A.esteiras.find((q) => q.jog), (q) => ({ x: q.x + 0.85, z: q.z + 0.4 }), 'Esteira (velocidade)'],
        ['abdominal', A.colchonetes.find((q) => q.jog), (q) => ({ x: q.x + 0.85, z: q.z + 0.2 }), 'Abdominal (resistência)'],
        ['supino', A.supinos.find((q) => q.jog), (q) => ({ x: q.x - 1.15, z: q.z + 0.2 }), 'Supino (força)'],
      ];
      for (const [tipo, q, ponto, nome] of ap) {
        if (!q) continue; const p = ponto(q);
        v.push({ x: p.x, z: p.z, r: 1.25, y: 1.9, txt: cheio ? Tf('Treinos de hoje: {0}/{1}', feitos, TREINOS_DIA) : T(nome) + ' · ' + Tf('Treinos de hoje: {0}/{1}', feitos, TREINOS_DIA), fn: () => treinar(tipo) });
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
      F.yawAlvo = Math.atan2(-(J.z - F.z), J.x - F.x); F.conversando = true;
      try { await conversaFernanda(); } finally { if (M.fer) { M.fer.conversando = false; M.fer.yawAlvo = M.A ? M.A.fernanda.yaw : 0; } Dialogo.esconder(); }
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
      if (F && !F.andandoCena && F.poseA === 'fernanda' && !F.andando) {             // a Fernanda segura a prancheta na frente do corpo
        const m = F.m; m.bracoE.rotation.z = 0.55; m.bracoE.rotation.x = -0.1; usarCotovelo(m.bracoE, -0.5, 1.1);
        if (F.torce > 0) { F.torce -= dt; m.bracoD.rotation.z = 2.6 + Math.sin(s.t * 12) * 0.25; m.bracoD.rotation.x = -0.2; usarCotovelo(m.bracoD, 0, 0.4); }
      }
      if (M.diego && !M.diego.conversando && !M.diego.fala) { const m = M.diego.m, k = Math.max(0, Math.sin(s.t * 0.9)); m.bracoE.rotation.z = m.bracoD.rotation.z = 0.7 + k * 0.1; usarCotovelo(m.bracoE, 0, 0.6 + Math.sin(s.t * 11) * 0.12 * k); usarCotovelo(m.bracoD, 0, 0.6 + Math.sin(s.t * 13 + 1) * 0.12 * k); }   // digitando no computador
    }

    // ---------------------------------------------------------------- O TREINO (minigames)
    let elOv = null;
    function fecharOverlay() { if (elOv) { elOv.remove(); elOv = null; } window.removeEventListener('keydown', teclaMini, true); }
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
        if (G.p <= -1) return acabar(false);
        if (G.t >= G.dur) return acabar(true);
      } else if (G.tipo === 'abdominal') {
        G.fm = (G.fm + dt * G.vel) % 2; G.marca = G.fm < 1 ? G.fm : 2 - G.fm;
        if (G.sobe > 0) G.sobe = Math.max(0, G.sobe - dt);
        if (G.erros >= ABD.erros) return acabar(false);
        if (G.reps >= ABD.reps && G.sobe <= 0) return acabar(true);
        if (G.t >= G.dur && G.sobe <= 0) return acabar(false);
      } else {
        if (G.desce > 0) { G.desce = Math.max(0, G.desce - dt); G.b = G.desce / SUP.desce; }
        else {
          G.b = Math.max(0, G.b - G.peso * dt);
          G.noPeito = G.b < 0.04 ? G.noPeito + dt : 0;
          if (G.noPeito >= SUP.peito) return acabar(false);
        }
        if (G.t >= G.dur) return acabar(false);
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
      if (treinosHoje() >= TREINOS_DIA) { await api.fala('jog', Tf('Você já fez os {0} treinos de hoje. Descanse e volte amanhã!', TREINOS_DIA)); Dialogo.esconder(); return; }
      const q = tipo === 'esteira' ? A.esteiras.find((e) => e.jog) : tipo === 'abdominal' ? A.colchonetes.find((c) => c.jog) : A.supinos.find((b) => b.jog);
      const J = s.jog, personal = temPersonal(), F = M.fer;
      const G = M.mg = { tipo, q, fase: 'intro', t: 0, ta: 0, df: dificuldade(tipo), dur: tipo === 'esteira' ? EST.dur : tipo === 'abdominal' ? ABD.dur : SUP.dur,
        p: 0.2, v: 0, reps: 0, erros: 0, marca: 0, fm: 0, vel: ABD.vel0, faixa: ABD.faixa0, sobe: 0, b: 1, peso: SUP.peso, noPeito: 0, desce: 0 };
      G.vel *= G.df; G.peso *= G.df;
      // vai para o aparelho (corte)
      await api.preto(true, 350);
      s.camCena = camDe(tipo, q); J.sentado = false; J.rota = null;
      if (tipo === 'esteira') { J.x = q.x; J.z = q.z + 0.1; J.yaw = J.yawAlvo = Math.PI / 2; }
      if (personal && F) { const p = pontoFer(tipo, q); F.x = p.x; F.z = p.z; virarPara(F, q.x, q.z); F.poseA = 'fernanda'; }
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
      if (temPersonal() && F) { F.torce = 0; await api.fala('fernanda', T('Calma, acontece com todo mundo. Amanhã a gente acerta!')); }
      Dialogo.esconder(); void s; void G;
    }
    // duas pessoas (a Fernanda, se estiver por perto, e quem estiver mais perto) vêm correndo, levantam a barra e voltam
    async function socorroSupino(q) {
      const G = M.mg, cands = [M.fer, ...M.npcs.filter((P) => P.tipo === 'vaga' || P.tipo === 'rosca')].filter(Boolean).slice(0, 2);
      const lados = [{ x: q.x - 0.62, z: q.z - 0.35 }, { x: q.x + 0.62, z: q.z - 0.35 }];
      const ajud = cands.map((P, i) => ({ P, volta: { x: P.x, z: P.z, yaw: P.yaw, tipo: P.tipo, poseA: P.poseA }, lado: lados[i] }));
      for (const h of ajud) { h.P.tipo = 'cena'; h.P.poseA = null; h.P.andandoCena = true; for (const m of M.halteres) m.visible = false; }
      await Promise.race([Promise.all(ajud.map((h) => api.andar(h.P, [[h.lado.x, h.lado.z]], 3.2))), api.esperar(4500)]);
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
      await Promise.race([Promise.all(ajud.map((h) => api.andar(h.P, [[h.volta.x, h.volta.z]], 1.6))), api.esperar(5000)]);
      for (const h of ajud) { const P = h.P; P.x = h.volta.x; P.z = h.volta.z; P.yaw = P.yawAlvo = h.volta.yaw; P.tipo = h.volta.tipo; P.poseA = h.volta.poseA; P.andandoCena = false; P.andando = false; }
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
      if (F && M.A) { F.x = M.A.fernanda.x; F.z = M.A.fernanda.z; F.yaw = F.yawAlvo = M.A.fernanda.yaw; F.torce = 0; }
      await api.preto(false, 350); void depois;
    }

    // ---- a cada quadro (depois do tickJogador e do tickPessoas)
    function tick(dt) {
      const s = S(); if (!s || !dentroAcad()) return;
      tickCatracas(dt); posesNPC(dt);
      const G = M.mg;
      if (G) {
        if (G.fase === 'jogo') tickJogo(dt);
        poseJogador(dt); tickSocorro(dt);
      }
    }
    function limpar() { fecharOverlay(); }

    return {
      entrou, saiu, alvos, tick, limpar,
      temAcesso, temPersonal, treinosHoje, emTreino: () => !!M.mg,
      _M: M,
      _f: { treinar, toque, falarComDiego, falarComFernanda, catracaTravada, poseSupino, poseAbd, deitar, bracos, maos, acabar, pagar, dadosA, dificuldade },
      _regras: { PRECO_ACESSO, PRECO_PERSONAL, DIAS_PLANO, TREINOS_DIA, GANHO, HORAS_TREINO, EST, ABD, SUP, BR },
    };
  }

  window.FutebolJS.registrarFase({ id: 'academia', nome: 'Academia', nucleoMinimo: '6.2.0', iniciar: async () => {}, criar });
})();
