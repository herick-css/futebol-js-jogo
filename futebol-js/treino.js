/* =====================================================================
   FUTEBOL JS · treino.js · A TURMA DO SEU NONATO E O TREINO DE CHUTE, PASSE E CRUZAMENTO (arquivo SEPARADO, como pesca.js)
   ---------------------------------------------------------------------
   6.6.16 — primeira versão.
   - Registrado com FutebolJS.registrarFase({ id: 'treino' }) só para o jogo saber baixar o arquivo; NÃO roda como fase.
     A cidade (cidade.js) baixa junto do pesca.js e chama criar(api) (api = apiTreino() da cidade). Sem este arquivo, a turma
     continua com o treino antigo de pênalti (tickTreino da cidade).
   - A TURMA (o goleiro PAREDÃO e os batedores JUNINHO e TONHÃO, os três "do treino" que já existiam no Society do Seu Nonato) vai ao
     campo dia sim, dia não e fica 12 h, fora do turno do jogador (a agenda é da cidade: janelaTurma/turmaAgora).
   - SEM O JOGADOR, eles treinam sozinhos em rodízio (TREINOS_NPC): COBRANÇAS (chute de peito do pé, de chapa e cavadinha, corrida de
     aproximação, o goleiro na base, pulando em PONTE para os lados, ENCAIXANDO a bola no peito, levantando e repondo com a mão) ·
     CRUZAMENTO E CABECEIO (um cruza da ponta, o outro sobe para cabecear ou emenda de voleio) · EMBAIXADINHAS (os dois trocam bola
     de pé em pé enquanto o goleiro alonga). As poses vêm de poseTreino (pendurada no boneco como A.poseFn; a cidade chama no fim do
     poseAtor).
   - FALANDO COM ELES: o treino. Três TIPOS (chute, passe, cruzamento), cada um com 30 SITUAÇÕES em ordem (a próxima só abre depois da
     anterior) e cada situação com 3 DESAFIOS, do mais fácil ao mais difícil. O jogador tem 3 BOLAS por desafio: acertar NÃO gasta bola,
     errar gasta. Sem bola: anúncio de 15 s (+1 bola) ou de 30 s (+3 bolas), ou desiste. Fechou os 3 desafios: +0,1 na habilidade da
     situação (chute; nas de falta e barreira, EFEITO, que é o que a cobrança de falta usa na partida; passe; cruzamento), até 10.
     No máximo 2 situações por dia (começou, contou: acertando ou errando). Depois das 30, dá para repetir (sem ganhar habilidade).
   - O CONTROLE: arrastar (ou setas/WASD) move a MIRA; segurar o botão (ou Espaço) enche a FORÇA, que vai e volta; soltar chuta.
     Enquanto segura, a mira BALANÇA (mais com mais força e menos com a habilidade maior): soltar na hora certa é parte do jogo.
     Chute e cruzamento têm EFEITO (curva para um lado ou para o outro: a bola chega na mira fazendo a curva); o passe tem RASTEIRO ou
     PELO ALTO. O começo da trajetória aparece pontilhado.
   - A FÍSICA (LOGICA, sem Three.js: dá para simular no Node): bola de 15 cm, gravidade, quique, rolar com atrito, curva constante para o
     lado; goleiro com tempo de reação, velocidade de mergulho e alcance (menor nos cantos, maior em bola fraca); barreira de bonecos;
     placas tampando o gol com uma janela (parada ou andando); alvos (aros) parados ou andando; companheiro parado ou correndo; cones;
     marcador que vai na bola; zona no chão; cabeceio; goleiro que sai do gol no cruzamento. Cada desafio foi testado por um robô
     (avaliar: procura a melhor mira/força/efeito e chuta com o erro de uma pessoa) para ser difícil mas possível.
   - Salva em historia.cidade: treinoNonato = { conhece, prog: { chute, passe, cruz }, hoje: { dia, n }, ganhos: { atributo: total } }.
   ===================================================================== */
(function () {
  'use strict';

  // ------------------------------------------------------------------ textos (pt → en, es, it, fr)
  const TRAD = {
    'Paredão': ['Paredão', 'Paredão', 'Paredão', 'Paredão'], 'Juninho': ['Juninho', 'Juninho', 'Juninho', 'Juninho'], 'Tonhão': ['Tonhão', 'Tonhão', 'Tonhão', 'Tonhão'],
    'Treinar com a turma do Nonato': ['Train with Nonato’s crew', 'Entrenar con el grupo de Nonato', 'Allenarsi con il gruppo di Nonato', 'S’entraîner avec la bande de Nonato'],
    // apresentação
    'Opa! Chegou gente nova no treino!': ['Hey! New face at practice!', '¡Epa! ¡Llegó alguien nuevo al entrenamiento!', 'Ehi! Gente nuova all’allenamento!', 'Oh ! Du nouveau à l’entraînement !'],
    'Eu sou o Paredão, o goleiro. Esses dois são o Juninho e o Tonhão.': ['I’m Paredão, the keeper. These two are Juninho and Tonhão.', 'Soy Paredão, el arquero. Estos dos son Juninho y Tonhão.', 'Io sono Paredão, il portiere. Questi due sono Juninho e Tonhão.', 'Moi c’est Paredão, le gardien. Eux, c’est Juninho et Tonhão.'],
    'A gente treina aqui no campo do seu Nonato: chute, passe e cruzamento.': ['We train here on Mr. Nonato’s pitch: shooting, passing and crossing.', 'Entrenamos aquí en la cancha de don Nonato: tiro, pase y centro.', 'Ci alleniamo qui sul campo del signor Nonato: tiro, passaggio e cross.', 'On s’entraîne ici, sur le terrain de M. Nonato : tir, passe et centre.'],
    'São 30 situações de cada, e cada uma tem 3 desafios. Vai ficando difícil, hein!': ['There are 30 situations of each, and each one has 3 challenges. It gets tough, huh!', 'Son 30 situaciones de cada uno, y cada una tiene 3 desafíos. ¡Se pone difícil, eh!', 'Sono 30 situazioni per tipo, e ognuna ha 3 sfide. Diventa difficile, eh!', 'Il y a 30 situations de chaque, et chacune a 3 défis. Ça devient dur, hein !'],
    'Você tem 3 bolas por desafio. Acertou, a bola volta. Errou, perdeu uma.': ['You get 3 balls per challenge. Hit it and the ball comes back. Miss and you lose one.', 'Tienes 3 balones por desafío. Si aciertas, el balón vuelve. Si fallas, pierdes uno.', 'Hai 3 palloni per sfida. Se centri, il pallone torna. Se sbagli, ne perdi uno.', 'Tu as 3 ballons par défi. Réussi, le ballon revient. Raté, tu en perds un.'],
    'Fechou os 3 desafios, a gente vê a diferença no seu pé.': ['Clear all 3 challenges and we’ll see the difference in your feet.', 'Si completas los 3 desafíos, se nota en tu pie.', 'Chiudi le 3 sfide e si vedrà la differenza nel tuo piede.', 'Réussis les 3 défis et ça se verra dans ton pied.'],
    'Só que são 2 treinos por dia, no máximo. O seu Nonato não gosta que gaste a grama.': ['But it’s 2 sessions a day, tops. Mr. Nonato doesn’t like the grass getting worn out.', 'Pero son 2 entrenamientos por día, como máximo. A don Nonato no le gusta que se gaste el césped.', 'Ma sono al massimo 2 allenamenti al giorno. Al signor Nonato non piace che si consumi l’erba.', 'Mais c’est 2 entraînements par jour, maximum. M. Nonato n’aime pas qu’on abîme la pelouse.'],
    'A gente vem dia sim, dia não. A próxima vez é {0}, das {1} às {2}.': ['We come every other day. Next time is {0}, from {1} to {2}.', 'Venimos un día sí y un día no. La próxima vez es {0}, de {1} a {2}.', 'Veniamo un giorno sì e uno no. La prossima volta è {0}, dalle {1} alle {2}.', 'On vient un jour sur deux. La prochaine fois, c’est {0}, de {1} à {2}.'],
    'Hoje a gente fica até as {0}.': ['Today we’re here until {0}.', 'Hoy nos quedamos hasta las {0}.', 'Oggi restiamo fino alle {0}.', 'Aujourd’hui on reste jusqu’à {0}.'],
    'hoje': ['today', 'hoy', 'oggi', 'aujourd’hui'], 'amanhã': ['tomorrow', 'mañana', 'domani', 'demain'], 'depois de amanhã': ['the day after tomorrow', 'pasado mañana', 'dopodomani', 'après-demain'], 'daqui a {0} dias': ['in {0} days', 'en {0} días', 'tra {0} giorni', 'dans {0} jours'],
    // menu
    'Vai treinar o quê?': ['What are you training?', '¿Qué vas a entrenar?', 'Cosa alleni?', 'Tu travailles quoi ?'],
    'Chute ({0}/30)': ['Shooting ({0}/30)', 'Tiro ({0}/30)', 'Tiro ({0}/30)', 'Tir ({0}/30)'],
    'Passe ({0}/30)': ['Passing ({0}/30)', 'Pase ({0}/30)', 'Passaggio ({0}/30)', 'Passe ({0}/30)'],
    'Cruzamento ({0}/30)': ['Crossing ({0}/30)', 'Centro ({0}/30)', 'Cross ({0}/30)', 'Centre ({0}/30)'],
    'Agora não': ['Not now', 'Ahora no', 'Non ora', 'Pas maintenant'],
    'Hoje já deu! Foram 2 treinos. Volta no próximo dia de treino.': ['That’s it for today! That was 2 sessions. Come back on the next training day.', '¡Por hoy ya está! Fueron 2 entrenamientos. Vuelve el próximo día de entrenamiento.', 'Per oggi basta! Sono stati 2 allenamenti. Torna il prossimo giorno di allenamento.', 'C’est fini pour aujourd’hui ! Ça fait 2 entraînements. Reviens au prochain jour d’entraînement.'],
    'Hoje ainda dá para mais {0}.': ['You can still do {0} more today.', 'Hoy todavía puedes hacer {0} más.', 'Oggi puoi farne ancora {0}.', 'Tu peux encore en faire {0} aujourd’hui.'],
    'Situação {0}/30: {1}': ['Situation {0}/30: {1}', 'Situación {0}/30: {1}', 'Situazione {0}/30: {1}', 'Situation {0}/30 : {1}'],
    'Desafio {0}: {1}': ['Challenge {0}: {1}', 'Desafío {0}: {1}', 'Sfida {0}: {1}', 'Défi {0} : {1}'],
    'Prêmio: +0,1 em {0}': ['Reward: +0.1 {0}', 'Premio: +0,1 en {0}', 'Premio: +0,1 in {0}', 'Récompense : +0,1 en {0}'],
    'Repetição: sem ganhar habilidade.': ['Replay: no skill gain.', 'Repetición: sin ganar habilidad.', 'Ripetizione: nessun guadagno di abilità.', 'Rejouer : pas de gain de compétence.'],
    'Bora!': ['Let’s go!', '¡Vamos!', 'Andiamo!', 'C’est parti !'], 'Voltar': ['Back', 'Volver', 'Indietro', 'Retour'],
    'Você já fez as 30 de {0}! Quer repetir uma? Não vale habilidade.': ['You’ve done all 30 {0}! Want to replay one? No skill for it.', '¡Ya hiciste las 30 de {0}! ¿Quieres repetir una? No da habilidad.', 'Hai già fatto tutte le 30 di {0}! Vuoi ripeterne una? Non dà abilità.', 'Tu as fait les 30 de {0} ! Tu en rejoues une ? Ça ne donne pas de compétence.'],
    'Repetir uma': ['Replay one', 'Repetir una', 'Ripeterne una', 'En rejouer une'],
    'chute': ['shooting', 'tiro', 'tiro', 'tir'], 'passe': ['passing', 'pase', 'passaggio', 'passe'], 'cruzamento': ['crossing', 'centro', 'cross', 'centre'],
    'Chute': ['Shooting', 'Tiro', 'Tiro', 'Tir'], 'Passe': ['Passing', 'Pase', 'Passaggio', 'Passe'], 'Cruzamento': ['Crossing', 'Centro', 'Cross', 'Centre'],
    'Falta (efeito)': ['Free kick (curl)', 'Tiro libre (efecto)', 'Punizione (effetto)', 'Coup franc (effet)'],
    // nomes das situações
    'Fazer gol': ['Score a goal', 'Hacer un gol', 'Segnare', 'Marquer'],
    'Gol de falta': ['Free-kick goal', 'Gol de tiro libre', 'Gol su punizione', 'But sur coup franc'],
    'Gol com barreira': ['Goal over the wall', 'Gol con barrera', 'Gol con barriera', 'But avec mur'],
    'Acertar o alvo parado': ['Hit the still target', 'Acertar el blanco quieto', 'Colpire il bersaglio fermo', 'Toucher la cible fixe'],
    'Acertar o alvo mexendo': ['Hit the moving target', 'Acertar el blanco en movimiento', 'Colpire il bersaglio in movimento', 'Toucher la cible mobile'],
    'Gol com espaço bloqueado': ['Goal through the gap', 'Gol con espacio bloqueado', 'Gol con spazio bloccato', 'But avec espace bloqué'],
    'Espaço bloqueado mexendo': ['Moving blocked gap', 'Espacio bloqueado en movimiento', 'Spazio bloccato in movimento', 'Espace bloqué mobile'],
    'Passe para o companheiro': ['Pass to a teammate', 'Pase al compañero', 'Passaggio al compagno', 'Passe au coéquipier'],
    'Companheiro correndo': ['Teammate on the run', 'Compañero corriendo', 'Compagno in corsa', 'Coéquipier en course'],
    'Passe entre os cones': ['Pass between the cones', 'Pase entre los conos', 'Passaggio tra i coni', 'Passe entre les plots'],
    'Passe com marcador': ['Pass past a marker', 'Pase con marcador', 'Passaggio con marcatore', 'Passe avec un défenseur'],
    'Bola parando no alvo': ['Stop the ball on the target', 'Balón que para en el blanco', 'Palla che si ferma sul bersaglio', 'Balle qui s’arrête sur la cible'],
    'Passe longo pelo alto': ['Long lofted pass', 'Pase largo por arriba', 'Lancio lungo', 'Longue passe aérienne'],
    'Cones mexendo': ['Moving cones', 'Conos en movimiento', 'Coni in movimento', 'Plots mobiles'],
    'Cruzar na área': ['Cross into the box', 'Centrar al área', 'Cross in area', 'Centrer dans la surface'],
    'Cruzar para o cabeceio': ['Cross for a header', 'Centro para el cabezazo', 'Cross per il colpo di testa', 'Centre pour la tête'],
    'Cruzar com zagueiro': ['Cross past a defender', 'Centro con defensa', 'Cross con difensore', 'Centre avec défenseur'],
    'Companheiro chegando': ['Teammate arriving', 'Compañero llegando', 'Compagno che arriva', 'Coéquipier qui arrive'],
    'Cruzar fugindo do goleiro': ['Cross away from the keeper', 'Centro lejos del arquero', 'Cross lontano dal portiere', 'Centre loin du gardien'],
    'Cruzar por cima da barreira': ['Cross over the wall', 'Centro por encima de la barrera', 'Cross sopra la barriera', 'Centre par-dessus le mur'],
    'Cruzar no aro mexendo': ['Cross through the moving hoop', 'Centro por el aro en movimiento', 'Cross nel cerchio in movimento', 'Centre dans le cerceau mobile'],
    // descrições dos desafios
    'Faça o gol de {0} m. O Paredão está no gol.': ['Score from {0} m. Paredão is in goal.', 'Haz el gol desde {0} m. Paredão está en el arco.', 'Segna da {0} m. Paredão è in porta.', 'Marque à {0} m. Paredão est dans les buts.'],
    'Falta de {0} m. O Paredão está esperto.': ['Free kick from {0} m. Paredão is sharp.', 'Tiro libre desde {0} m. Paredão está atento.', 'Punizione da {0} m. Paredão è attento.', 'Coup franc à {0} m. Paredão est vigilant.'],
    'Falta de {0} m com barreira de {1}.': ['Free kick from {0} m with a {1}-man wall.', 'Tiro libre desde {0} m con barrera de {1}.', 'Punizione da {0} m con barriera di {1}.', 'Coup franc à {0} m avec un mur de {1}.'],
    'Acerte o aro (de {0} m).': ['Hit the hoop (from {0} m).', 'Acierta el aro (desde {0} m).', 'Colpisci il cerchio (da {0} m).', 'Touche le cerceau (à {0} m).'],
    'Acerte o aro que anda (de {0} m).': ['Hit the moving hoop (from {0} m).', 'Acierta el aro que se mueve (desde {0} m).', 'Colpisci il cerchio che si muove (da {0} m).', 'Touche le cerceau mobile (à {0} m).'],
    'Faça o gol pela janela das placas (de {0} m).': ['Score through the window in the boards (from {0} m).', 'Haz el gol por la ventana de las placas (desde {0} m).', 'Segna dalla finestra tra le tavole (da {0} m).', 'Marque par la fenêtre des panneaux (à {0} m).'],
    'A janela anda: faça o gol por ela (de {0} m).': ['The window moves: score through it (from {0} m).', 'La ventana se mueve: haz el gol por ella (desde {0} m).', 'La finestra si muove: segna lì (da {0} m).', 'La fenêtre bouge : marque par elle (à {0} m).'],
    'Passe para o Juninho, a {0} m.': ['Pass to Juninho, {0} m away.', 'Pasa a Juninho, a {0} m.', 'Passa a Juninho, a {0} m.', 'Passe à Juninho, à {0} m.'],
    'O Juninho corre: passe na frente dele.': ['Juninho is running: pass ahead of him.', 'Juninho corre: pasa delante de él.', 'Juninho corre: passa davanti a lui.', 'Juninho court : passe devant lui.'],
    'Passe entre os cones para o Juninho (vão de {0} m).': ['Pass between the cones to Juninho ({0} m gap).', 'Pasa entre los conos a Juninho (hueco de {0} m).', 'Passa tra i coni a Juninho (varco di {0} m).', 'Passe entre les plots à Juninho (écart de {0} m).'],
    'O Tonhão marca: passe para o Juninho sem ele cortar.': ['Tonhão is marking: pass to Juninho without him cutting it out.', 'Tonhão marca: pasa a Juninho sin que la corte.', 'Tonhão marca: passa a Juninho senza che la intercetti.', 'Tonhão marque : passe à Juninho sans qu’il coupe.'],
    'Faça a bola parar dentro do círculo (a {0} m).': ['Make the ball stop inside the circle ({0} m away).', 'Haz que el balón pare dentro del círculo (a {0} m).', 'Fai fermare la palla dentro il cerchio (a {0} m).', 'Fais s’arrêter la balle dans le cercle (à {0} m).'],
    'Lançamento de {0} m para o Juninho, por cima da marcação.': ['A {0} m ball to Juninho, over the markers.', 'Pase de {0} m a Juninho, por encima de la marca.', 'Lancio di {0} m a Juninho, sopra la marcatura.', 'Ballon de {0} m vers Juninho, par-dessus le marquage.'],
    'Os cones andam: passe entre eles.': ['The cones move: pass between them.', 'Los conos se mueven: pasa entre ellos.', 'I coni si muovono: passa tra loro.', 'Les plots bougent : passe entre eux.'],
    'Cruze e faça a bola cair no círculo.': ['Cross and drop the ball into the circle.', 'Centra y haz que el balón caiga en el círculo.', 'Crossa e fai cadere la palla nel cerchio.', 'Centre et fais tomber la balle dans le cercle.'],
    'Cruze na cabeça do Juninho.': ['Cross onto Juninho’s head.', 'Centra a la cabeza de Juninho.', 'Crossa sulla testa di Juninho.', 'Centre sur la tête de Juninho.'],
    'Cruze para o Juninho sem o Tonhão cortar.': ['Cross to Juninho without Tonhão clearing it.', 'Centra a Juninho sin que Tonhão la corte.', 'Crossa a Juninho senza che Tonhão la respinga.', 'Centre pour Juninho sans que Tonhão dégage.'],
    'O Juninho vem correndo: cruze no tempo dele.': ['Juninho is running in: time the cross for him.', 'Juninho viene corriendo: centra a tiempo.', 'Juninho arriva di corsa: crossa al momento giusto.', 'Juninho arrive en courant : centre au bon moment.'],
    'O Paredão sai do gol: cruze longe dele.': ['Paredão comes off his line: cross away from him.', 'Paredão sale del arco: centra lejos de él.', 'Paredão esce dai pali: crossa lontano da lui.', 'Paredão sort de sa cage : centre loin de lui.'],
    'Cruze por cima da barreira de {0}.': ['Cross over the {0}-man wall.', 'Centra por encima de la barrera de {0}.', 'Crossa sopra la barriera di {0}.', 'Centre par-dessus le mur de {0}.'],
    'Faça a bola passar dentro do aro que anda.': ['Get the ball through the moving hoop.', 'Haz pasar el balón por el aro que se mueve.', 'Fai passare la palla nel cerchio che si muove.', 'Fais passer la balle dans le cerceau mobile.'],
    // HUD
    'CHUTAR': ['SHOOT', 'TIRAR', 'TIRA', 'TIRER'], 'PASSAR': ['PASS', 'PASAR', 'PASSA', 'PASSER'], 'CRUZAR': ['CROSS', 'CENTRAR', 'CROSSA', 'CENTRER'],
    'Efeito': ['Curl', 'Efecto', 'Effetto', 'Effet'], 'Sem efeito': ['No curl', 'Sin efecto', 'Senza effetto', 'Sans effet'],
    'Tenso': ['Driven', 'Tenso', 'Teso', 'Tendu'],
    'Rasteiro': ['Along the ground', 'Rastrero', 'Rasoterra', 'À ras de terre'], 'Pelo alto': ['In the air', 'Por arriba', 'Alto', 'En l’air'],
    'Arraste para mirar · segure para a força · solte para chutar': ['Drag to aim · hold for power · release to kick', 'Arrastra para apuntar · mantén para la fuerza · suelta para patear', 'Trascina per mirare · tieni premuto per la forza · rilascia per calciare', 'Glisse pour viser · maintiens pour la puissance · relâche pour frapper'],
    'Setas mira · Espaço força · Q/E efeito · Esc sai': ['Arrows aim · Space power · Q/E curl · Esc quits', 'Flechas apuntan · Espacio fuerza · Q/E efecto · Esc sale', 'Frecce mira · Spazio forza · Q/E effetto · Esc esce', 'Flèches visent · Espace puissance · Q/E effet · Échap quitte'],
    'Desafio {0}/3': ['Challenge {0}/3', 'Desafío {0}/3', 'Sfida {0}/3', 'Défi {0}/3'],
    // resultados
    'GOL!': ['GOAL!', '¡GOL!', 'GOL!', 'BUT !'], 'ACERTOU!': ['HIT!', '¡ACERTASTE!', 'CENTRATO!', 'TOUCHÉ !'], 'DOMINOU!': ['CONTROLLED!', '¡LA DOMINÓ!', 'CONTROLLATA!', 'CONTRÔLÉ !'],
    'NA MEDIDA!': ['PERFECT WEIGHT!', '¡A LA MEDIDA!', 'SU MISURA!', 'PILE !'], 'GOL DE CABEÇA!': ['HEADED GOAL!', '¡GOL DE CABEZA!', 'GOL DI TESTA!', 'BUT DE LA TÊTE !'],
    'NO CÍRCULO!': ['IN THE CIRCLE!', '¡EN EL CÍRCULO!', 'NEL CERCHIO!', 'DANS LE CERCLE !'], 'PASSOU NO ARO!': ['THROUGH THE HOOP!', '¡PASÓ POR EL ARO!', 'NEL CERCHIO!', 'DANS LE CERCEAU !'],
    'Defendeu!': ['Saved!', '¡Atajó!', 'Parata!', 'Arrêt !'], 'Na trave!': ['Off the post!', '¡En el palo!', 'Palo!', 'Sur le poteau !'], 'Para fora!': ['Wide!', '¡Afuera!', 'Fuori!', 'À côté !'],
    'Por cima!': ['Over!', '¡Por arriba!', 'Alta!', 'Au-dessus !'], 'Na barreira!': ['Into the wall!', '¡En la barrera!', 'Sulla barriera!', 'Dans le mur !'], 'Nas placas!': ['Off the boards!', '¡En las placas!', 'Sulle tavole!', 'Dans les panneaux !'],
    'Errou o alvo!': ['Missed the target!', '¡Fallaste el blanco!', 'Bersaglio mancato!', 'Cible ratée !'], 'Fraco demais!': ['Too weak!', '¡Muy flojo!', 'Troppo debole!', 'Trop faible !'], 'Forte demais!': ['Too hard!', '¡Muy fuerte!', 'Troppo forte!', 'Trop fort !'],
    'Longe dele!': ['Too far from him!', '¡Lejos de él!', 'Lontano da lui!', 'Trop loin de lui !'], 'Interceptado!': ['Intercepted!', '¡Interceptado!', 'Intercettato!', 'Intercepté !'], 'Nos cones!': ['Hit the cones!', '¡En los conos!', 'Sui coni!', 'Dans les plots !'],
    'Fora do corredor!': ['Outside the lane!', '¡Fuera del pasillo!', 'Fuori dal corridoio!', 'Hors du couloir !'], 'Fora do círculo!': ['Outside the circle!', '¡Fuera del círculo!', 'Fuori dal cerchio!', 'Hors du cercle !'],
    'Alta demais!': ['Too high!', '¡Muy alta!', 'Troppo alta!', 'Trop haute !'], 'Baixa demais!': ['Too low!', '¡Muy baja!', 'Troppo bassa!', 'Trop basse !'], 'O goleiro pegou!': ['The keeper claimed it!', '¡El arquero la agarró!', 'Il portiere l’ha presa!', 'Le gardien l’a captée !'],
    'O zagueiro cortou!': ['The defender cleared it!', '¡El defensa la despejó!', 'Il difensore l’ha respinta!', 'Le défenseur a dégagé !'], 'Fora do aro!': ['Missed the hoop!', '¡Fuera del aro!', 'Fuori dal cerchio!', 'Hors du cerceau !'],
    // fim de desafio / situação
    'Desafio {0} feito!': ['Challenge {0} done!', '¡Desafío {0} hecho!', 'Sfida {0} fatta!', 'Défi {0} réussi !'],
    'SITUAÇÃO CONCLUÍDA!': ['SITUATION CLEARED!', '¡SITUACIÓN COMPLETADA!', 'SITUAZIONE COMPLETATA!', 'SITUATION RÉUSSIE !'],
    '+0,1 em {0} (agora {1})': ['+0.1 {0} (now {1})', '+0,1 en {0} (ahora {1})', '+0,1 in {0} (ora {1})', '+0,1 en {0} (maintenant {1})'],
    'Acabaram as bolas!': ['Out of balls!', '¡Se acabaron los balones!', 'Palloni finiti!', 'Plus de ballons !'],
    'Faltou pouco. Quer mais bola?': ['So close. Want more balls?', 'Faltó poco. ¿Quieres más balones?', 'Mancava poco. Vuoi altri palloni?', 'Presque. Tu veux d’autres ballons ?'],
    'Anúncio de 15 s: +1 bola': ['15 s ad: +1 ball', 'Anuncio de 15 s: +1 balón', 'Pubblicità di 15 s: +1 pallone', 'Pub de 15 s : +1 ballon'],
    'Anúncio de 30 s: +3 bolas': ['30 s ad: +3 balls', 'Anuncio de 30 s: +3 balones', 'Pubblicità di 30 s: +3 palloni', 'Pub de 30 s : +3 ballons'],
    'Desistir': ['Give up', 'Rendirse', 'Rinunciare', 'Abandonner'],
    'Bola extra': ['Extra ball', 'Balón extra', 'Pallone extra', 'Ballon en plus'], 'Bolas extras': ['Extra balls', 'Balones extra', 'Palloni extra', 'Ballons en plus'],
    'Assista até o fim para ganhar a bola.': ['Watch to the end to get the ball.', 'Mira hasta el final para ganar el balón.', 'Guarda fino alla fine per avere il pallone.', 'Regarde jusqu’au bout pour avoir le ballon.'],
    'Assista até o fim para ganhar as 3 bolas.': ['Watch to the end to get the 3 balls.', 'Mira hasta el final para ganar los 3 balones.', 'Guarda fino alla fine per avere i 3 palloni.', 'Regarde jusqu’au bout pour avoir les 3 ballons.'],
    'Pronto! Bola na marca.': ['Done! Ball on the spot.', '¡Listo! Balón en el punto.', 'Fatto! Pallone sul dischetto.', 'C’est bon ! Ballon sur le point.'],
    'Nenhum anúncio disponível agora. Tenta de novo daqui a pouco.': ['No ad available right now. Try again in a bit.', 'No hay anuncios disponibles ahora. Inténtalo en un rato.', 'Nessun annuncio disponibile ora. Riprova tra poco.', 'Aucune pub disponible pour l’instant. Réessaie dans un moment.'],
    'Não foi dessa vez. Volta outro dia que a gente tenta de novo!': ['Not this time. Come back another day and we’ll try again!', 'No fue esta vez. ¡Vuelve otro día y lo intentamos de nuevo!', 'Non stavolta. Torna un altro giorno e riproviamo!', 'Pas cette fois. Reviens un autre jour et on réessaie !'],
    'Isso aí! Mandou bem demais!': ['That’s it! Great job!', '¡Eso! ¡Lo hiciste muy bien!', 'Così! Bravissimo!', 'C’est ça ! Super boulot !'],
    'Sair do treino? Conta como um dos 2 de hoje.': ['Leave practice? It counts as one of today’s 2.', '¿Salir del entrenamiento? Cuenta como uno de los 2 de hoy.', 'Uscire dall’allenamento? Conta come uno dei 2 di oggi.', 'Quitter l’entraînement ? Ça compte comme un des 2 d’aujourd’hui.'],
    'Sair': ['Leave', 'Salir', 'Esci', 'Quitter'], 'Continuar': ['Keep going', 'Seguir', 'Continua', 'Continuer'],
    'Hoje não tem treino: a turma vem dia sim, dia não.': ['No practice today: the crew comes every other day.', 'Hoy no hay entrenamiento: el grupo viene un día sí y un día no.', 'Oggi niente allenamento: il gruppo viene un giorno sì e uno no.', 'Pas d’entraînement aujourd’hui : la bande vient un jour sur deux.'],
  };
  const IDX_L = { en: 0, es: 1, it: 2, fr: 3 };
  function tr(t) {
    const L = typeof Idioma !== 'undefined' ? Idioma.atual : 'pt';
    if (L !== 'pt' && IDX_L[L] != null) { const v = TRAD[t]; if (v && v[IDX_L[L]]) return v[IDX_L[L]]; }
    return typeof T === 'function' ? T(t) : t;
  }
  const trf = (t, ...a) => tr(t).replace(/\{(\d+)\}/g, (m, n) => (a[n] != null ? a[n] : m));
  const virg = (n, c) => { const s = (+n).toFixed(c == null ? 1 : c); return typeof Idioma !== 'undefined' && Idioma.atual === 'en' ? s : s.replace('.', ','); };

  // =====================================================================================================================
  // LÓGICA (sem Three.js): as situações, a física da bola e quem defende. Coordenadas LOCAIS do campo de treino:
  //   u = lado (metros, 0 = meio do gol), v = distância até a linha do gol (cresce para o meio do campo), y = altura acima da grama.
  //   O gol: de u = −2,44 a +2,44 (por dentro dos paus) e até y = 2,22 (por baixo do travessão). O campo vai de v = 0 a v = 30 e de
  //   u = −9 a +9. Na cidade: x = gx + u, z = gz − v (gx/gz: o meio da linha do gol do fundo do Society do Seu Nonato).
  // =====================================================================================================================
  const LOGICA = (() => {
    const G = 9.8, RB = 0.15, ATRITO = 2.2, DT = 1 / 120, GOL_W = 2.44, GOL_H = 2.22, CAMPO = { u: 9, v: 30 };
    const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
    const lerp = (a, b, k) => a + (b - a) * k;
    function semente(n) { let s = (n | 0) || 1; return () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
    // "vai e volta" (0 → 1 → 0) com fase: o movimento dos alvos, das janelas, dos cones e de quem corre
    const vaivem = (t, per, fase) => { const k = (((t / per + (fase || 0)) % 1) + 1) % 1; return k < 0.5 ? k * 2 : 2 - k * 2; };
    const suaveV = (k) => k * k * (3 - 2 * k);

    // ---------------------------------------------------------------- as famílias de cada tipo, na ordem das 30 situações
    const FAM = {
      chute: { gol: 'Fazer gol', falta: 'Gol de falta', barreira: 'Gol com barreira', alvo: 'Acertar o alvo parado', alvoMov: 'Acertar o alvo mexendo', bloq: 'Gol com espaço bloqueado', bloqMov: 'Espaço bloqueado mexendo' },
      passe: { parado: 'Passe para o companheiro', correndo: 'Companheiro correndo', cones: 'Passe entre os cones', marcador: 'Passe com marcador', alvoChao: 'Bola parando no alvo', longo: 'Passe longo pelo alto', conesMov: 'Cones mexendo' },
      cruz: { zona: 'Cruzar na área', cabeca: 'Cruzar para o cabeceio', zagueiro: 'Cruzar com zagueiro', correndo: 'Companheiro chegando', goleiro: 'Cruzar fugindo do goleiro', barreira: 'Cruzar por cima da barreira', aro: 'Cruzar no aro mexendo' },
    };
    const ORDEM = {
      chute: ['gol', 'alvo', 'falta', 'bloq', 'gol', 'barreira', 'alvoMov', 'falta', 'bloq', 'barreira', 'gol', 'alvoMov', 'bloqMov', 'barreira', 'alvo', 'falta', 'bloqMov', 'gol', 'barreira', 'alvoMov', 'bloqMov', 'falta', 'alvo', 'barreira', 'gol', 'bloqMov', 'alvoMov', 'falta', 'barreira', 'bloqMov'],
      passe: ['parado', 'alvoChao', 'cones', 'parado', 'correndo', 'marcador', 'alvoChao', 'cones', 'longo', 'correndo', 'conesMov', 'marcador', 'parado', 'longo', 'alvoChao', 'correndo', 'conesMov', 'cones', 'marcador', 'longo', 'correndo', 'alvoChao', 'conesMov', 'marcador', 'longo', 'parado', 'correndo', 'conesMov', 'marcador', 'longo'],
      cruz: ['zona', 'cabeca', 'zona', 'cabeca', 'zagueiro', 'barreira', 'correndo', 'zona', 'goleiro', 'aro', 'cabeca', 'zagueiro', 'correndo', 'barreira', 'goleiro', 'aro', 'zona', 'cabeca', 'correndo', 'zagueiro', 'barreira', 'goleiro', 'aro', 'correndo', 'zagueiro', 'barreira', 'goleiro', 'aro', 'correndo', 'goleiro'],
    };
    // a habilidade que cada família treina
    const ATRIB = (tipo, fam) => (tipo === 'passe' ? 'passe' : tipo === 'cruz' ? 'cruzamento' : fam === 'falta' || fam === 'barreira' ? 'efeito' : 'chute');
    const NOME_ATRIB = { chute: 'Chute', efeito: 'Falta (efeito)', passe: 'Passe', cruzamento: 'Cruzamento' };

    // ---------------------------------------------------------------- um DESAFIO: tudo o que está no campo (em u, v, y)
    // x = dificuldade (0 a 1): situação n (0..29) e desafio k (0..2): x = n/29 × 0,75 + k × 0,125
    function desafio(tipo, n, k) {
      const fam = ORDEM[tipo][n], x = clamp(n / 29 * 0.75 + k * 0.125, 0, 1), r = semente(9973 * (tipo === 'chute' ? 1 : tipo === 'passe' ? 2 : 3) + n * 31 + k * 7 + 5);
      const lado = r() < 0.5 ? -1 : 1, D = { tipo, fam, n, k, x, desc: '', descA: [] };
      const bola = (u, v) => { D.bola = { u: clamp(u, -8.4, 8.4), v: clamp(v, 0.5, 29) }; };
      const goleiroNoGol = (tau, vD, reach) => {
        const b = D.bola, kv = 0.7, gu = clamp(b.u * kv / b.v + Math.sign(b.u || 1) * 0.28 * clamp(Math.abs(b.u) / 6, 0, 1), -1.2, 1.2);
        D.goleiro = { modo: 'gol', u: gu, v: kv, tau, vD, reach };
      };
      const d1 = (m) => Math.round(m);
      if (tipo === 'chute') {
        D.mira = { plano: 'gol', u: 0, y: 1.0 };
        if (fam === 'gol') {
          bola(lado * r() * (1.2 + 4.8 * x), 9 + 8 * x); goleiroNoGol(0.4 - 0.16 * x, 2.6 + 1.1 * x, 0.9); D.crit = 'gol';
          D.desc = 'Faça o gol de {0} m. O Paredão está no gol.'; D.descA = [d1(Math.hypot(D.bola.u, D.bola.v))];
        } else if (fam === 'falta') {
          bola(lado * r() * 4, 14 + 5 * x); goleiroNoGol(0.4 - 0.08 * x, 2.7 + 0.5 * x, 0.9); D.crit = 'gol';
          D.desc = 'Falta de {0} m. O Paredão está esperto.'; D.descA = [d1(Math.hypot(D.bola.u, D.bola.v))];
        } else if (fam === 'barreira') {
          bola(lado * (1 + r() * 3), 12 + 5 * x);
          const nb = 2 + Math.min(2, Math.floor(x * 2.99)), h = 1.8 + 0.08 * x, b = D.bola, poste = Math.sign(b.u || 1) * 2.44;
          // a barreira a 5 m da bola, de frente para ela, cobrindo do poste do lado da bola até perto do meio
          const ax = poste * 0.55 - b.u, av = -b.v, al = Math.hypot(ax, av), fu = ax / al, fv = av / al, cu = b.u + fu * 5, cv = b.v + fv * 5;
          const nu = -fv, nv = fu, sgn = Math.sign(nu * Math.sign(poste)) || 1;   // n: perpendicular; os bonecos crescem do lado do poste para o meio
          D.barreira = []; for (let i = 0; i < nb; i++) { const o = (i - (nb - 1) / 2) * 0.56 + sgn * 0.12; D.barreira.push({ u: cu + nu * o, v: cv + nv * o, h, r: 0.24 }); }
          D.goleiro = { modo: 'gol', u: -Math.sign(poste) * 0.55, v: 0.7, tau: 0.5 - 0.1 * x, vD: 2.4 + 0.4 * x, reach: 0.88 };
          D.crit = 'gol'; D.desc = 'Falta de {0} m com barreira de {1}.'; D.descA = [d1(Math.hypot(b.u, b.v)), nb];
        } else if (fam === 'alvo') {
          bola(lado * r() * 3, 11 + 8 * x);
          const cantos = [[-1.75, 0.55], [1.75, 1.65], [-1.7, 1.65], [1.75, 0.55]], c = cantos[(n + k) % 4];
          D.alvos = [{ u: c[0], y: c[1], r: 0.55 - 0.27 * x }]; D.crit = 'alvo'; D.mira.u = c[0] * 0.6; D.mira.y = c[1];
          D.desc = 'Acerte o aro (de {0} m).'; D.descA = [d1(Math.hypot(D.bola.u, D.bola.v))];
        } else if (fam === 'alvoMov') {
          bola(lado * r() * 2.5, 11 + 6 * x);
          D.alvos = [{ u: 0, y: [0.6, 1.55, 1.05][k], r: 0.62 - 0.22 * x, mov: { u0: -1.85, u1: 1.85, per: 2 * 3.7 / (0.7 + 1.8 * x), fase: r() } }];
          D.crit = 'alvo'; D.mira.y = D.alvos[0].y; D.desc = 'Acerte o aro que anda (de {0} m).'; D.descA = [d1(Math.hypot(D.bola.u, D.bola.v))];
        } else if (fam === 'bloq') {
          bola(lado * r() * 3, 11 + 8 * x);
          const w = 1.3 - 0.65 * x, cu = (r() < 0.5 ? -1 : 1) * (1.0 + 0.7 * r()), cy = [0.62, 1.5, 1.0][k] + (k === 1 ? 0 : 0);
          D.janela = { u: clamp(cu, -GOL_W + w / 2, GOL_W - w / 2), y: clamp(cy, w / 2, GOL_H - w / 2), w, h: w };
          D.crit = 'janela'; D.mira.u = D.janela.u; D.mira.y = D.janela.y; D.desc = 'Faça o gol pela janela das placas (de {0} m).'; D.descA = [d1(Math.hypot(D.bola.u, D.bola.v))];
        } else {                                                          // bloqMov
          bola(lado * r() * 2.5, 10 + 7 * x);
          const w = 1.35 - 0.55 * x;
          D.janela = { u: 0, y: [0.75, 1.4, 1.05][k], w, h: w, mov: { u0: -GOL_W + w / 2 + 0.05, u1: GOL_W - w / 2 - 0.05, per: 2 * (2 * GOL_W - w) / (0.6 + 1.6 * x), fase: r() } };
          D.crit = 'janela'; D.mira.y = D.janela.y; D.desc = 'A janela anda: faça o gol por ela (de {0} m).'; D.descA = [d1(Math.hypot(D.bola.u, D.bola.v))];
        }
      } else if (tipo === 'passe') {
        // o passe vai "para cima" do campo ou de lado: a bola num lugar e o companheiro a uma distância Dp, num ângulo
        const Dp = fam === 'longo' ? 18 + 8 * x : fam === 'alvoChao' ? 7 + 8 * x : fam === 'parado' ? 9 + 19 * x : 10 + 10 * x;
        const ang = (r() - 0.5) * 1.6, bu = clamp(-lado * (2 + r() * 4), -8, 8), bv = clamp(4 + r() * 3 + (fam === 'longo' ? 0 : 0), 2, 8);
        bola(bu, bv);
        let tu = bu + Math.sin(ang) * Dp, tv = bv + Math.cos(ang) * Dp;
        if (Math.abs(tu) > 8) { tu = Math.sign(tu) * 8; } if (tv > 28.5) tv = 28.5;
        const dist = Math.hypot(tu - bu, tv - bv);
        D.mira = { plano: fam === 'longo' ? 'alto' : 'chao', u: tu, v: tv, y: fam === 'longo' ? 1.2 : 0 };
        D.alto = fam === 'longo';
        D.trava = fam === 'longo' ? 'alto' : fam === 'correndo' ? null : 'rasteiro';   // o jeito de passar que a situação pede
        if (fam === 'alvoChao') {
          D.zona = { u: tu, v: tv, r: 2.4 - 0.6 * x, para: true }; D.crit = 'para'; D.desc = 'Faça a bola parar dentro do círculo (a {0} m).'; D.descA = [d1(dist)];
        } else {
          D.recebe = { u: tu, v: tv, ctrl: 10.5 - 4.5 * x, alcance: 0.9 - 0.35 * x, pousa: 1.3 - 0.4 * x };
          D.crit = 'recebe'; D.desc = 'Passe para o Juninho, a {0} m.'; D.descA = [d1(dist)];
          const fu = (tu - bu) / dist, fv = (tv - bv) / dist, nu = -fv, nv = fu;
          if (fam === 'correndo') {
            const vel = 2 + 3 * x, L = 6, su = tu - nu * L / 2, sv = tv - nv * L / 2;
            D.recebe.u = su; D.recebe.v = sv; D.recebe.corre = { u0: su, v0: sv, u1: su + nu * L, v1: sv + nv * L, per: 2 * L / vel + 1.2, fase: r() };
            D.mira.u = tu; D.mira.v = tv; D.desc = 'O Juninho corre: passe na frente dele.'; D.descA = [];
          } else if (fam === 'cones' || fam === 'conesMov') {
            const g = fam === 'cones' ? 1.1 - 0.5 * x : 1.3 - 0.55 * x, pc = 0.65 + 0.1 * r(), cu = bu + fu * dist * pc, cv = bv + fv * dist * pc, off = fam === 'cones' ? (r() - 0.5) * 1.2 : 0;
            D.cones = { u: cu + nu * off, v: cv + nv * off, nu, nv, gap: g, mov: fam === 'conesMov' ? { amp: 1.6, per: 2 * 3.2 / (0.6 + 1.6 * x), fase: r() } : null };
            D.desc = fam === 'cones' ? 'Passe entre os cones para o Juninho (vão de {0} m).' : 'Os cones andam: passe entre eles.'; D.descA = [virg(g)];
          } else if (fam === 'marcador') {
            const pc = 0.4 + 0.1 * r(), off = (r() < 0.5 ? -1 : 1) * (1.0 + 0.4 * r());
            D.recebe.ctrl = 11.5 - 1.5 * x;                                    // aqui a bola tem que ir firme (senão o Tonhão chega)
            D.marcadores = [{ u: bu + fu * dist * pc + nu * off, v: bv + fv * dist * pc + nv * off, reach: 0.65, h: 2.3, tau: 0.4 - 0.1 * x, vel: 1.2 + 1.2 * x, npc: 1 }];
            D.desc = 'O Tonhão marca: passe para o Juninho sem ele cortar.'; D.descA = [];
          } else if (fam === 'longo') {
            const nm = 1 + (x > 0.45 ? 1 : 0); D.marcadores = [];
            for (let i = 0; i < nm; i++) { const pc = nm === 1 ? 0.5 : 0.38 + i * 0.26; D.marcadores.push({ u: bu + fu * dist * pc + nu * (i ? -0.4 : 0.35), v: bv + fv * dist * pc + nv * (i ? -0.4 : 0.35), reach: 0.8, h: 2.4, tau: 0.3, vel: 1.4 + 1.2 * x, npc: i === 0 ? 1 : 0 }); }
            D.recebe.pousa = 1.6 - 0.8 * x; D.desc = 'Lançamento de {0} m para o Juninho, por cima da marcação.'; D.descA = [d1(dist)];
          }
        }
      } else {                                                            // cruz: da ponta para a área
        const wu = lado * (6.6 + r() * 1.6), wv = 4 + r() * 7 + 4 * x * r();
        bola(wu, wv);
        D.mira = { plano: 'alto', u: 0, v: 6, y: 1.75 };
        const longe = -lado;                                              // "segundo pau": o lado de lá
        if (fam === 'zona') {
          D.zona = { u: lado * (0.4 - r() * 1.6), v: 5.5 + r() * 3.5, r: 1.3 - 0.75 * x }; D.crit = 'zona'; D.mira = { plano: 'chao', u: D.zona.u, v: D.zona.v, y: 0 };
          D.desc = 'Cruze e faça a bola cair no círculo.';
        } else if (fam === 'cabeca' || fam === 'zagueiro' || fam === 'goleiro' || fam === 'barreira') {
          const tu = fam === 'cabeca' ? lado * (0.3 - r() * 2.2) : longe * (0.8 + r() * 1.4), tv = fam === 'goleiro' ? 3.6 + r() * 1.6 : 4.5 + r() * 3.5;
          D.cabeca = { u: tu, v: tv, alcance: fam === 'cabeca' ? 0.5 - 0.25 * x : 0.6 - 0.25 * x }; D.crit = 'cabeca'; D.mira.u = tu; D.mira.v = tv;
          D.desc = 'Cruze na cabeça do Juninho.';
          if (fam === 'zagueiro') { D.marcadores = [{ u: lado * 1.5, v: tv + 0.9, reach: 0.75, h: 2.35, tau: 0.3, vel: 1.2 + 1.2 * x, npc: 1 }]; D.desc = 'Cruze para o Juninho sem o Tonhão cortar.'; }
          if (fam === 'goleiro') { D.goleiro = { modo: 'sai', u: lado * 0.6, v: 0.8, tau: 0.3 - 0.08 * x, vD: 3.5 + 1.3 * x, reach: 1.0, area: { v: 6, u: 4.5 } }; D.cabeca.vmax = 17; D.desc = 'O Paredão sai do gol: cruze longe dele.'; }
          if (fam === 'barreira') {
            const nb = 2 + Math.min(2, Math.floor(x * 2.99)), h = 1.9 + 0.2 * x, b = D.bola, ax = tu - b.u, av = tv - b.v, al = Math.hypot(ax, av), fu = ax / al, fv = av / al;
            const cu = b.u + fu * 4.5, cv = b.v + fv * 4.5, nu = -fv, nv = fu;
            D.barreira = []; for (let i = 0; i < nb; i++) { const o = (i - (nb - 1) / 2) * 0.56; D.barreira.push({ u: cu + nu * o, v: cv + nv * o, h, r: 0.24 }); }
            D.desc = 'Cruze por cima da barreira de {0}.'; D.descA = [nb];
          }
        } else if (fam === 'correndo') {
          const su = longe * 4.2, sv = 12, eu = longe * 0.2 + lado * 0.6, ev = 5.2, vel = 3.5 + 3 * x, L = Math.hypot(eu - su, ev - sv);
          D.cabeca = { u: su, v: sv, alcance: 0.6 - 0.25 * x, corre: { u0: su, v0: sv, u1: eu, v1: ev, per: 2 * L / vel + 1.6, fase: r() } };
          D.crit = 'cabeca'; D.mira.u = (su + eu) / 2; D.mira.v = (sv + ev) / 2; D.desc = 'O Juninho vem correndo: cruze no tempo dele.';
        } else {                                                          // aro
          D.aro = { u: 0, v: 5.5 + r() * 2.5, y: 2.0, r: 0.6 - 0.25 * x, mov: { u0: -2.6, u1: 2.6, per: 2 * 5.2 / (0.7 + 2 * x), fase: r() } };
          D.crit = 'aro'; D.mira = { plano: 'alto', u: 0, v: D.aro.v, y: 2.0 }; D.desc = 'Faça a bola passar dentro do aro que anda.';
        }
      }
      return D;
    }
    function situacao(tipo, n) {
      const fam = ORDEM[tipo][n];
      return { tipo, n, fam, nome: FAM[tipo][fam], atrib: ATRIB(tipo, fam), desafios: [0, 1, 2].map((k) => desafio(tipo, n, k)) };
    }

    // ---------------------------------------------------------------- posições que mudam com o tempo (t = segundos desde o começo do desafio)
    function posCorre(c, t) { const k = suaveV(vaivem(t, c.per, c.fase)); return { u: lerp(c.u0, c.u1, k), v: lerp(c.v0, c.v1, k) }; }
    function posAlvo(a, t) { return a.mov ? { u: lerp(a.mov.u0, a.mov.u1, vaivem(t, a.mov.per, a.mov.fase)), y: a.y } : { u: a.u, y: a.y }; }
    function posJanela(J, t) { return J.mov ? { u: lerp(J.mov.u0, J.mov.u1, vaivem(t, J.mov.per, J.mov.fase)), y: J.y } : { u: J.u, y: J.y }; }
    function posCones(C, t) {
      const o = C.mov ? (vaivem(t, C.mov.per, C.mov.fase) * 2 - 1) * C.mov.amp : 0, u = C.u + C.nu * o, v = C.v + C.nv * o, h = C.gap / 2 + 0.12;
      return { u, v, a: { u: u - C.nu * h, v: v - C.nv * h }, b: { u: u + C.nu * h, v: v + C.nv * h } };
    }
    function posAro(A, t) { return A.mov ? { u: lerp(A.mov.u0, A.mov.u1, vaivem(t, A.mov.per, A.mov.fase)), v: A.v, y: A.y } : { u: A.u, v: A.v, y: A.y }; }

    // ---------------------------------------------------------------- a força de cada jeito de bater (p = 0..1 da barra)
    //   at = { chute, passe, efeito, cruzamento } (de 5 a 10): mais habilidade = um pouco mais de força e mais efeito
    function velDe(D, p, at, alto) {
      const f = (n) => 1 + 0.012 * ((at && at[n] != null ? at[n] : 5) - 5);
      if (D.tipo === 'chute') return (9 + 21 * p) * f('chute');
      if (D.tipo === 'passe') return alto ? (7 + 17 * p) * f('passe') : (2.5 + 14 * p) * f('passe');
      return (8 + 18 * p) * f('cruzamento');
    }
    const curvaDe = (D, at) => (D.tipo === 'cruz' ? 5 : 6) * (0.85 + 0.03 * ((at && at.efeito != null ? at.efeito : 5) - 5));
    // o quanto a mira balança enquanto segura (radianos de amplitude): força alta balança mais, habilidade alta balança menos
    function balanco(D, p, at) {
      const n = D.tipo === 'chute' ? 'chute' : D.tipo === 'passe' ? 'passe' : 'cruzamento', a = at && at[n] != null ? at[n] : 5;
      return (D.tipo === 'chute' ? 0.004 + 0.018 * Math.pow(p, 1.5) : 0.007 + 0.024 * Math.pow(p, 1.5)) * clamp(1.3 - 0.06 * (a - 5), 0.95, 1.3);
    }
    const barraPer = (D) => (D.tipo === 'chute' ? 2.3 : 2.6);
    // a velocidade "certa" de cada jogada: no chute, 20 m/s; no cruzamento e no passe pelo alto, a que faz a bola sair num ângulo
    //   bonito (29° / 35°) e cair na mira. K_MIRA = quanto a mira "corrige" a força errada (0 = nada, 1 = sempre na mira).
    //   O cruzamento pode ser TENSO (24°) ou ALTO (46°, para passar por cima de quem está no caminho).
    const THETA0 = { chute: null, cruz: 0.42, cruzAlto: 0.8, alto: 0.62 }, K_MIRA = 0.45;
    function forcaNominal(D, Dh, H, alto) {
      if (D.tipo === 'chute') return 20;
      const th = THETA0[D.tipo === 'cruz' ? (alto ? 'cruzAlto' : 'cruz') : 'alto'], c = Math.cos(th), den = 2 * c * c * (Dh * Math.tan(th) - H);
      return den > 0.05 ? Math.sqrt(G * Dh * Dh / den) : 18;
    }
    // a força certa na barra (0..1), para a marquinha (o jogo mostra; quem acerta perto dela manda a bola onde mirou)
    function forcaCerta(D, mira, at, alto) {
      if (D.tipo === 'passe' && !alto) return null;
      const b = D.bola, Dh = Math.hypot(mira.u - b.u, (D.mira.plano === 'gol' ? 0 : mira.v) - b.v), H = (D.mira.plano === 'chao' ? RB : mira.y) - RB, sN = forcaNominal(D, Dh, H, alto);
      let lo = 0, hi = 1; for (let i = 0; i < 24; i++) { const m = (lo + hi) / 2; if (velDe(D, m, at, true) < sN) lo = m; else hi = m; } return (lo + hi) / 2;
    }              // a barra de força: tempo de ir e voltar (s)
    const forcaEm = (D, t) => vaivem(t, barraPer(D), 0);

    // ---------------------------------------------------------------- o chute: da bola até a mira
    //   inp = { u, v, y (o ponto mirado), p (força), spin (−1, 0, 1), alto (passe pelo alto), erroA (rad), erroV (fração) }
    //   devolve a bola { u, y, v, vu, vy, vv, au, av (curva: aceleração de lado), voa, rola }
    function lancar(D, inp, at) {
      const b = D.bola, alto = D.tipo === 'passe' ? (D.trava ? D.trava === 'alto' : !!inp.alto) : true, s = velDe(D, inp.p, at, alto) * (1 + (inp.erroV || 0));
      const tu = inp.u, tv = D.mira.plano === 'gol' ? 0 : inp.v, ty = D.mira.plano === 'chao' ? RB : D.mira.plano === 'gol' ? inp.y : inp.y;
      let du = tu - b.u, dv = tv - b.v; const Dh = Math.hypot(du, dv) || 0.01, ca = Math.cos(inp.erroA || 0), sa = Math.sin(inp.erroA || 0);
      du /= Dh; dv /= Dh; const eu = du * ca - dv * sa, ev = du * sa + dv * ca;   // a direção com o erro
      const B = { u: b.u, y: RB, v: b.v, vu: 0, vy: 0, vv: 0, au: 0, av: 0, voa: false, rola: false, s };
      if (!alto) { B.vu = eu * s; B.vv = ev * s; B.rola = true; return B; }
      // A FORÇA CERTA: a mira diz a direção e a altura (ou o ponto de queda) para a velocidade "certa" (sNom); bater mais forte
      //   leva a bola mais alto/mais longe, mais fraco, mais baixo/mais curto — só em parte (K_MIRA), para não ser cruel.
      const H = ty - RB, sNom = forcaNominal(D, Dh, H, inp.alto), sMira = sNom + K_MIRA * (s - sNom), s2 = sMira * sMira, disc = s2 * s2 - G * (G * Dh * Dh + 2 * H * s2);
      let th;
      if (disc < 0) th = Math.PI / 4.2;                                   // nem com a força certa chegaria (mira longe demais): sai a 43° e cai antes
      else { const lo = Math.atan((s2 - Math.sqrt(disc)) / (G * Dh)), hi = Math.atan((s2 + Math.sqrt(disc)) / (G * Dh)), th0 = THETA0[D.tipo === 'chute' ? 'chute' : D.tipo === 'cruz' ? (inp.alto ? 'cruzAlto' : 'cruz') : 'alto'];
        th = th0 == null || Math.abs(lo - th0) <= Math.abs(hi - th0) ? lo : hi; }
      const vh = s * Math.cos(th), Tt = Dh / vh;
      B.vu = eu * vh; B.vv = ev * vh; B.vy = s * Math.sin(th); B.voa = true;
      const sp = inp.spin || 0;
      if (sp && D.tipo !== 'passe') {                                     // efeito: a bola faz a curva e ainda chega na mira (sai "para fora" da curva)
        const a = sp * curvaDe(D, at), nu = -ev, nv = eu;                  // n = a esquerda de quem chuta (olhando para a bola andar)
        B.au = nu * a; B.av = nv * a; B.vu -= 0.5 * B.au * Tt; B.vv -= 0.5 * B.av * Tt;
      }
      return B;
    }
    // um passo da bola (sem ninguém no caminho)
    function passoBola(B, dt) {
      if (B.voa) {
        B.vy -= G * dt; B.vu += B.au * dt; B.vv += B.av * dt;
        B.u += B.vu * dt; B.y += B.vy * dt; B.v += B.vv * dt;
        if (B.y <= RB) {
          B.y = RB; B.quicou = (B.quicou || 0) + 1; if (B.quicou === 1) B.pouso = { u: B.u, v: B.v };
          if (B.vy < -1.4) { B.vy = -B.vy * 0.48; B.vu *= 0.8; B.vv *= 0.8; B.au = B.av = 0; }
          else { B.vy = 0; B.voa = false; B.rola = true; B.au = B.av = 0; }
        }
      } else if (B.rola) {
        const sp = Math.hypot(B.vu, B.vv), k = sp > 1e-6 ? Math.max(0, sp - ATRITO * dt) / sp : 0;
        B.vu *= k; B.vv *= k; B.u += B.vu * dt; B.v += B.vv * dt;
        if (sp * k < 0.04) { B.vu = B.vv = 0; B.rola = false; B.parou = true; }
      }
    }
    // a trajetória sem ninguém (para o pontilhado do começo)
    function previa(D, inp, at, seg) {
      const B = lancar(D, inp, at), L = []; let t = 0;
      while (t < seg && (B.voa || B.rola)) { for (let i = 0; i < 6; i++) passoBola(B, DT); t += DT * 6; L.push({ u: B.u, y: B.y, v: B.v }); }
      return L;
    }

    // ---------------------------------------------------------------- a JOGADA: a bola anda e todo mundo reage (o mesmo no jogo e no robô)
    //   tk = o tempo do desafio na hora do chute (os alvos e quem corre estão numa fase). Devolve o estado; passo() até ele.fim.
    function jogada(D, inp, at, tk) {
      const B = lancar(D, inp, at), J = { D, B, t: 0, tk: tk || 0, fim: false, ok: false, motivo: '', ev: [], at };
      if (D.goleiro) J.gk = { u: D.goleiro.u, v: D.goleiro.v, mov: 0, mergulho: null, pegou: false };
      if (D.marcadores) J.mk = D.marcadores.map((m) => ({ u: m.u, v: m.v, pula: 0 }));
      if (D.recebe) { const p0 = D.recebe.corre ? posCorre(D.recebe.corre, J.tk) : D.recebe; J.rc = { u: p0.u, v: p0.v, passo: 0 }; }
      J.altoP = D.tipo === 'passe' && (D.trava ? D.trava === 'alto' : !!inp.alto);
      if (D.cabeca) { const p0 = D.cabeca.corre ? posCorre(D.cabeca.corre, J.tk) : D.cabeca; J.cb = { u: p0.u, v: p0.v, pula: 0 }; }
      return J;
    }
    const fimJ = (J, ok, motivo) => { if (J.fim) return; J.fim = true; J.ok = ok; J.motivo = motivo; J.ev.push({ t: J.t, e: ok ? 'ok' : 'erro', motivo }); };
    function passo(J, dt) {
      if (J.fim) return;
      const D = J.D, B = J.B, t0 = J.t, tt = J.tk + J.t, u0 = B.u, v0 = B.v, y0 = B.y;
      passoBola(B, dt); J.t += dt; const tn = J.tk + J.t;
      // ---- o goleiro no gol: espera o tempo de reação, lê a bola (sem a curva) e vai até onde ela vai passar
      if (J.gk && D.goleiro.modo === 'gol') {
        const g = J.gk, K = D.goleiro;
        if (J.t > K.tau && !g.pegou && B.vv < -0.5) {
          const tp = (B.v - K.v) / -B.vv, up = clamp(B.u + B.vu * Math.max(0, tp), -GOL_W - 0.6, GOL_W + 0.6), d = up - g.u, st = Math.min(Math.abs(d), K.vD * dt);
          g.u += Math.sign(d) * st; g.alvo = up;
        }
        if (!g.pegou && v0 > K.v && B.v <= K.v) {                         // a bola passou pela linha do goleiro
          const lat = Math.abs(B.u - g.u), sp = Math.hypot(B.vu, B.vy, B.vv);
          let R = K.reach; if (B.y < 0.35) R -= 0.12; if (B.y > 1.85) R -= 0.15; if (sp < 10) R += 0.35;
          J.ev.push({ t: J.t, e: 'goleiro', lat, y: B.y, u: B.u, gu: g.u });
          if (B.y < 2.35 && lat <= R) { g.pegou = true; fimJ(J, false, 'Defendeu!'); g.encaixe = lat < 0.45 && B.y > 0.5 && B.y < 1.7; return; }
        }
      }
      // ---- o goleiro que SAI do gol no cruzamento: vai até onde a bola cai (só dentro da área dele)
      if (J.gk && D.goleiro.modo === 'sai') {
        const g = J.gk, K = D.goleiro;
        if (J.t > K.tau && !g.pegou) {
          let pu = B.u, pv = B.v;                                         // onde a bola vai estar a ~2 m de altura na descida
          if (B.voa) {                                                    // y(t) = 2 m na descida: ½G t² − vy t + (2 − y) = 0, a raiz maior (sem chegar a 2 m: onde passa a 1 m)
            for (const hq of [2.0, 1.0]) { const dd = B.vy * B.vy - 2 * G * (hq - B.y); if (dd < 0) continue; const tq = (B.vy + Math.sqrt(dd)) / G; if (tq > 0) { pu = B.u + B.vu * tq; pv = B.v + B.vv * tq; break; } }
          }
          pu = clamp(pu, -K.area.u, K.area.u); pv = clamp(pv, 0.4, K.area.v);
          const du = pu - g.u, dv = pv - g.v, d = Math.hypot(du, dv), st = Math.min(d, K.vD * dt); if (d > 1e-4) { g.u += du / d * st; g.v += dv / d * st; }
        }
        if (!g.pegou && Math.hypot(B.u - g.u, B.v - g.v) <= K.reach && B.y <= 2.75) { g.pegou = true; g.encaixe = true; fimJ(J, false, 'O goleiro pegou!'); return; }
      }
      // ---- barreira (bonecos): cilindros
      if (D.barreira) for (const m of D.barreira) {
        if (Math.hypot(B.u - m.u, B.v - m.v) < m.r + RB && B.y < m.h + RB * 0.6) { B.vu *= -0.35; B.vv *= -0.35; B.vy = Math.abs(B.vy) * 0.3; B.au = B.av = 0; fimJ(J, false, 'Na barreira!'); return; }
      }
      // ---- marcadores: vão até a frente da bola e cortam se ela passar no alcance (e abaixo da altura que eles alcançam)
      if (J.mk) J.mk.forEach((g, i) => {
        if (J.fim) return; const M = D.marcadores[i];
        if (J.t > M.tau) {
          const sp = Math.hypot(B.vu, B.vv) || 1, fu = B.vu / sp, fv = B.vv / sp, ru = g.u - B.u, rv = g.v - B.v, ao = ru * fu + rv * fv;
          if (ao > 0) { const pu = B.u + fu * ao, pv = B.v + fv * ao, du = pu - g.u, dv = pv - g.v, d = Math.hypot(du, dv), st = Math.min(d, M.vel * dt); if (d > 1e-4) { g.u += du / d * st; g.v += dv / d * st; } }
        }
        const dd = Math.hypot(B.u - g.u, B.v - g.v); if (dd < 1.6 && B.y > 0.8) g.pula = Math.min(1, g.pula + dt * 4);
        if (dd <= M.reach && B.y <= M.h) { fimJ(J, false, D.tipo === 'cruz' ? 'O zagueiro cortou!' : 'Interceptado!'); J.corte = i; }
      });
      if (J.fim) return;
      // ---- a linha do gol (chute): placas, aros, trave, gol, fora
      if (D.mira.plano === 'gol' && v0 > 0 && B.v <= 0) {
        const k = v0 / (v0 - B.v), cu = lerp(u0, B.u, k), cy = lerp(y0, B.y, k), au = Math.abs(cu), dentro = au <= GOL_W - 0.1 && cy <= GOL_H - 0.1;
        const trave = !dentro && au <= GOL_W + 0.18 && cy <= GOL_H + 0.18;
        J.cruzou = { u: cu, y: cy };
        if (D.crit === 'janela') {
          const P = posJanela(D.janela, tn), m = RB * 0.55, naJanela = Math.abs(cu - P.u) <= D.janela.w / 2 - m && Math.abs(cy - P.y) <= D.janela.h / 2 - m;
          if (naJanela && dentro) { fimJ(J, true, 'GOL!'); return; }
          if (dentro || (au <= GOL_W + 0.18 && cy <= GOL_H + 0.18)) { B.vv = Math.abs(B.vv) * 0.25; B.vu *= 0.3; B.vy = Math.max(0.5, B.vy * 0.2); fimJ(J, false, trave ? 'Na trave!' : 'Nas placas!'); return; }
          fimJ(J, false, cy > GOL_H ? 'Por cima!' : 'Para fora!'); return;
        }
        if (D.crit === 'alvo') {
          for (const a of D.alvos) { const P = posAlvo(a, tn); if (Math.hypot(cu - P.u, cy - P.y) <= a.r - RB * 0.3) { fimJ(J, true, 'ACERTOU!'); J.alvoHit = a; return; } }
          if (trave) { B.vv = Math.abs(B.vv) * 0.4; fimJ(J, false, 'Na trave!'); return; }
          fimJ(J, false, 'Errou o alvo!'); return;
        }
        if (dentro) { fimJ(J, true, 'GOL!'); return; }
        if (trave) { B.vv = Math.abs(B.vv) * 0.45; B.vu *= 0.6; fimJ(J, false, 'Na trave!'); return; }
        fimJ(J, false, cy > GOL_H ? 'Por cima!' : 'Para fora!'); return;
      }
      // ---- cones (passe): a bola tem que cruzar a linha dos cones entre eles
      if (D.cones && !J.passouCones) {
        const C = posCones(D.cones, tn), nu = D.cones.nu, nv = D.cones.nv, fu = nv, fv = -nu;   // f: a direção "para a frente" do corredor (perpendicular à linha dos cones)
        const s0 = (u0 - C.u) * fu + (v0 - C.v) * fv, s1 = (B.u - C.u) * fu + (B.v - C.v) * fv;
        for (const c of [C.a, C.b]) if (Math.hypot(B.u - c.u, B.v - c.v) < 0.12 + RB && B.y < 0.5) { B.vu *= -0.3; B.vv *= -0.3; fimJ(J, false, 'Nos cones!'); return; }
        if (Math.sign(s0) !== Math.sign(s1) && s0 !== 0) {
          const k = s0 / (s0 - s1), cu = lerp(u0, B.u, k), cv = lerp(v0, B.v, k), o = (cu - C.u) * nu + (cv - C.v) * nv;
          if (Math.abs(o) <= D.cones.gap / 2 - 0.02 || B.y > 1.2) J.passouCones = true; else { fimJ(J, false, 'Fora do corredor!'); return; }
        }
      }
      // ---- quem recebe o passe: dá um passo até a bola; domina se ela chega no alcance e não está forte demais
      if (J.rc) {
        const R = D.recebe, r = J.rc, alvo = R.corre ? posCorre(R.corre, tn) : R;
        if (!R.corre) { const d = Math.hypot(B.u - R.u, B.v - R.v); if (d < 5) { const ru = B.u - R.u, rv = B.v - R.v; r.passo = Math.min(0.6, r.passo + dt * 2.5); const dl = Math.hypot(ru, rv) || 1; r.u = R.u + ru / dl * Math.min(r.passo, dl); r.v = R.v + rv / dl * Math.min(r.passo, dl); } }
        else { r.u = alvo.u; r.v = alvo.v; }
        const d = Math.hypot(B.u - r.u, B.v - r.v), sp = Math.hypot(B.vu, B.vv, B.vy);
        if (J.altoP) {
          if (d <= 0.45 && B.y >= 0.8 && B.y <= 1.5 && B.voa && B.vy < 0) { fimJ(J, true, 'DOMINOU!'); return; }   // matou no peito
          if (B.pouso && !J.pousoVisto) { J.pousoVisto = true; const dp = Math.hypot(B.pouso.u - r.u, B.pouso.v - r.v); if (dp <= R.pousa) { fimJ(J, true, 'DOMINOU!'); return; } }
        } else if (d <= R.alcance && B.y < 1.0) {
          if (Math.hypot(B.vu, B.vv) > R.ctrl) { fimJ(J, false, 'Forte demais!'); B.passou = true; return; }
          fimJ(J, true, 'DOMINOU!'); return;
        }
      }
      // ---- cabeceio: a bola passa perto da cabeça dele, na altura em que ele alcança (pulando)
      if (J.cb) {
        const C = D.cabeca, c = J.cb, p = C.corre ? posCorre(C.corre, tn) : C; c.u = p.u; c.v = p.v;
        const d = Math.hypot(B.u - c.u, B.v - c.v); if (d < 2.5 && B.voa) c.pula = Math.min(1, c.pula + dt * 3);
        if (d <= C.alcance && B.voa) {
          const yMax = 2.25 - 0.2 * D.x;
          if (B.y >= 1.55 && B.y <= yMax) { if (Math.hypot(B.vu, B.vv) > (D.cabeca.vmax || 16 - 4 * D.x)) { fimJ(J, false, 'Forte demais!'); return; } fimJ(J, true, 'GOL DE CABEÇA!'); return; }   // bola forte demais não dá para cabecear direito
          if (B.y > yMax) J.alto = true; else if (B.y < 1.55) J.baixo = true;
        }
      }
      // ---- o aro (cruzamento): o plano do aro fica de frente para a bola
      if (D.aro && !J.fim) {
        const P = posAro(D.aro, tn), fu0 = P.u - D.bola.u, fv0 = P.v - D.bola.v, fl = Math.hypot(fu0, fv0), fu = fu0 / fl, fv = fv0 / fl;
        const s0 = (u0 - P.u) * fu + (v0 - P.v) * fv, s1 = (B.u - P.u) * fu + (B.v - P.v) * fv;
        if (s0 < 0 && s1 >= 0) {
          const k = s0 / (s0 - s1), cu = lerp(u0, B.u, k), cy = lerp(y0, B.y, k), cv = lerp(v0, B.v, k), lat = (cu - P.u) * -fv + (cv - P.v) * fu;
          if (Math.hypot(lat, cy - P.y) <= D.aro.r - RB * 0.5) { fimJ(J, true, 'PASSOU NO ARO!'); return; }
          fimJ(J, false, 'Fora do aro!'); return;
        }
      }
      // ---- zona no chão (cruzamento: o primeiro quique) e bola que tem que PARAR no círculo (passe)
      if (D.zona && D.crit === 'zona' && B.pouso && !J.zonaVista) { J.zonaVista = true; const dz = Math.hypot(B.pouso.u - D.zona.u, B.pouso.v - D.zona.v); fimJ(J, dz <= D.zona.r, dz <= D.zona.r ? 'NO CÍRCULO!' : 'Fora do círculo!'); return; }
      if (D.zona && D.crit === 'para' && B.parou) {
        const dz = Math.hypot(B.u - D.zona.u, B.v - D.zona.v), antes = (B.u - D.bola.u) * (D.zona.u - D.bola.u) + (B.v - D.bola.v) * (D.zona.v - D.bola.v) < Math.hypot(D.zona.u - D.bola.u, D.zona.v - D.bola.v) ** 2;
        fimJ(J, dz <= D.zona.r, dz <= D.zona.r ? 'NA MEDIDA!' : antes ? 'Fraco demais!' : 'Forte demais!'); return;
      }
      // ---- acabou sem acontecer nada: parou, saiu do campo, passou do companheiro ou demorou
      const fora = Math.abs(B.u) > CAMPO.u + 1.5 || B.v < -1.5 || B.v > CAMPO.v + 1.5;
      if (B.parou || fora || J.t > 5) {
        if (D.crit === 'recebe') { const r = J.rc, falta = (r.u - B.u) * (r.u - D.bola.u) + (r.v - B.v) * (r.v - D.bola.v) > 0; fimJ(J, false, B.parou && falta && Math.hypot(B.u - r.u, B.v - r.v) < 6 ? 'Fraco demais!' : 'Longe dele!'); return; }
        if (D.crit === 'cabeca') { fimJ(J, false, J.alto ? 'Alta demais!' : J.baixo ? 'Baixa demais!' : 'Longe dele!'); return; }
        if (D.crit === 'zona') { fimJ(J, false, 'Fraco demais!'); return; }
        if (D.crit === 'aro') { fimJ(J, false, 'Fora do aro!'); return; }
        fimJ(J, false, B.parou ? 'Fraco demais!' : 'Para fora!'); return;
      }
      void t0; void tt;
    }
    function simular(D, inp, at, tk) { const J = jogada(D, inp, at, tk); while (!J.fim) passo(J, DT); return J; }

    // ---------------------------------------------------------------- O ROBÔ (para medir a dificuldade): procura a melhor mira/força/efeito/hora
    //   e depois chuta N vezes com o erro de uma pessoa: a mira com o balanço (fase sorteada), a força com ±σp, a hora com ±σt.
    function gauss(r) { let u = 0, v = 0; while (u === 0) u = r(); while (v === 0) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
    function candidatos(D) {
      const L = [], M = D.mira, ps = D.crit === 'para' ? Array.from({ length: 40 }, (_, i) => 0.05 + i * 0.02) : [0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 0.95], spins = D.tipo === 'passe' ? [0] : [-1, 0, 1];
      const altos = D.tipo === 'chute' ? [true] : D.trava ? [D.trava === 'alto'] : [false, true];
      const tks = (D.alvos && D.alvos[0].mov) || (D.janela && D.janela.mov) || (D.cones && D.cones.mov) || (D.aro && D.aro.mov) || (D.recebe && D.recebe.corre) || (D.cabeca && D.cabeca.corre) ? 10 : 1;
      const per = D.alvos && D.alvos[0].mov ? D.alvos[0].mov.per : D.janela && D.janela.mov ? D.janela.mov.per : D.cones && D.cones.mov ? D.cones.mov.per : D.aro && D.aro.mov ? D.aro.mov.per : D.recebe && D.recebe.corre ? D.recebe.corre.per : D.cabeca && D.cabeca.corre ? D.cabeca.corre.per : 1;
      const pts = [];
      if (M.plano === 'gol') { for (let u = -2.3; u <= 2.31; u += 0.25) for (let y = 0.25; y <= 2.1; y += 0.2) pts.push({ u, y, v: 0 }); }
      else { const cu = M.u, cv = M.v, R = D.tipo === 'cruz' ? 3.2 : 2.6; for (let a = -R; a <= R + 1e-6; a += R / 6) for (let b = -R; b <= R + 1e-6; b += R / 6) pts.push({ u: cu + a, v: cv + b, y: M.y || 0 }); }
      for (const P of pts) for (const p of ps) for (const spin of spins) for (const alto of altos) for (let i = 0; i < tks; i++) L.push({ u: P.u, v: P.v, y: P.y, p, spin, alto, tk: per * i / tks });
      return L;
    }
    function avaliar(D, op) {
      op = op || {}; const at = op.at || { chute: 5, passe: 5, efeito: 5, cruzamento: 5 }, N = op.N || 40, r = semente(op.seed || 77);
      const sp = op.sp != null ? op.sp : 0.05, st = op.st != null ? op.st : 0.12, sa = op.sa != null ? op.sa : 0.06;
      const C = candidatos(D); let bons = C.filter((c) => simular(D, c, at, c.tk).ok);
      if (!bons.length) return { ok: 0, melhor: null, bons: 0, total: C.length };
      // os mais "folgados" primeiro: chuta cada um com erro e fica com o melhor
      const amostra = []; const passoA = Math.max(1, Math.floor(bons.length / 60)); for (let i = 0; i < bons.length; i += passoA) amostra.push(bons[i]);
      let melhor = null, mp = -1;
      for (const c of amostra) {
        let ok = 0;
        for (let i = 0; i < N; i++) {
          const per = barraPer(D), tR = (c.p / 2) * per + gauss(r) * sp * per / 2, p = vaivem(tR, per, 0), amp = balanco(D, p, at), fa = r() * 6.283, fb = r() * 6.283, dist = Math.hypot((c.u - D.bola.u), ((D.mira.plano === 'gol' ? 0 : c.v) - D.bola.v));
          const inp = { u: c.u + Math.sin(fa) * amp * dist + gauss(r) * sa, v: c.v + (D.mira.plano === 'gol' ? 0 : Math.sin(fb) * amp * dist + gauss(r) * sa), y: c.y + (D.mira.plano === 'gol' ? Math.sin(fb) * amp * dist + gauss(r) * sa : 0), p, spin: c.spin, alto: c.alto, erroA: gauss(r) * 0.003, erroV: gauss(r) * 0.012 };
          if (simular(D, inp, at, c.tk + gauss(r) * st).ok) ok++;
        }
        if (ok / N > mp) { mp = ok / N; melhor = c; }
      }
      return { ok: mp, melhor, bons: bons.length, total: C.length };
    }
    return { G, RB, DT, GOL_W, GOL_H, CAMPO, FAM, ORDEM, ATRIB, NOME_ATRIB, desafio, situacao, forcaCerta, forcaNominal, posCorre, posAlvo, posJanela, posCones, posAro, velDe, balanco, forcaEm, barraPer, lancar, passoBola, previa, jogada, passo, simular, avaliar, semente, vaivem, clamp, lerp };
  })();

  // =====================================================================================================================
  // SONS (sintetizados, no mesmo mestre do jogo)
  // =====================================================================================================================
  let ruidoB = null;
  function audio() { if (typeof Som === 'undefined' || !Som.audio || Som.mudo) return null; return Som.audio; }
  function tom(A, f, t, dur, vol, tipo, ate) {
    const o = A.ctx.createOscillator(), g = A.ctx.createGain(); o.type = tipo || 'sine'; o.frequency.setValueAtTime(f, t); if (ate) o.frequency.exponentialRampToValueAtTime(ate, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(A.mestre); o.start(t); o.stop(t + dur + 0.02);
  }
  function chiado(A, t, dur, vol, freq, q) {
    const c = A.ctx; if (!ruidoB || ruidoB.sampleRate !== c.sampleRate) { ruidoB = c.createBuffer(1, c.sampleRate, c.sampleRate); const d = ruidoB.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s.buffer = ruidoB; f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q || 1.2;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(f); f.connect(g); g.connect(A.mestre); s.start(t, Math.random() * 0.5, dur + 0.02);
  }
  const com = (fn) => (...a) => { const A = audio(); if (!A) return; try { fn(A, A.ctx.currentTime + 0.01, ...a); } catch (e) { /* sem som */ } };
  const SOM = {
    chute: com((A, t, forte) => { tom(A, 120, t, 0.12, 0.35 * (forte || 1), 'sine', 55); chiado(A, t, 0.06, 0.12 * (forte || 1), 900); }),
    toque: com((A, t) => { tom(A, 180, t, 0.07, 0.16, 'sine', 90); chiado(A, t, 0.03, 0.05, 1400); }),
    rede: com((A, t) => { chiado(A, t, 0.45, 0.16, 2400, 0.7); chiado(A, t + 0.05, 0.35, 0.08, 700, 0.8); }),
    trave: com((A, t) => { tom(A, 1240, t, 0.5, 0.08, 'triangle', 1180); tom(A, 1873, t, 0.35, 0.05, 'triangle'); tom(A, 640, t, 0.25, 0.06, 'square', 620); }),
    defesa: com((A, t) => { tom(A, 140, t, 0.1, 0.3, 'sine', 70); chiado(A, t, 0.08, 0.1, 600); }),
    quica: com((A, t) => { tom(A, 160, t, 0.06, 0.14, 'sine', 90); }),
    acerto: com((A, t) => { [880, 1175, 1568].forEach((f, i) => tom(A, f, t + i * 0.07, 0.18, 0.06, 'square')); }),
    erro: com((A, t) => { tom(A, 330, t, 0.18, 0.06, 'square', 220); tom(A, 247, t + 0.16, 0.26, 0.06, 'square', 160); }),
    apito: com((A, t) => { for (let i = 0; i < 2; i++) { const o = A.ctx.createOscillator(), g = A.ctx.createGain(), l = A.ctx.createOscillator(), lg = A.ctx.createGain(); o.type = 'sine'; o.frequency.value = 2900; l.frequency.value = 38; lg.gain.value = 140; l.connect(lg); lg.connect(o.frequency); g.gain.setValueAtTime(0.0001, t + i * 0.32); g.gain.exponentialRampToValueAtTime(0.06, t + i * 0.32 + 0.02); g.gain.setValueAtTime(0.06, t + i * 0.32 + (i ? 0.5 : 0.18)); g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.32 + (i ? 0.55 : 0.22)); o.connect(g); g.connect(A.mestre); o.start(t + i * 0.32); l.start(t + i * 0.32); o.stop(t + i * 0.32 + 0.6); l.stop(t + i * 0.32 + 0.6); } }),
    festa: com((A, t) => { [523, 659, 784, 1046, 1318].forEach((f, i) => tom(A, f, t + i * 0.09, 0.3, 0.06, 'square')); chiado(A, t, 0.9, 0.05, 3000, 0.5); }),
    carga: com((A, t, p) => { tom(A, 300 + 500 * p, t, 0.05, 0.015, 'square'); }),
  };
  const vib = (p) => { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) { /* sem vibração */ } };

  // =====================================================================================================================
  // AS POSES (A.poseFn = poseTreino; A.pf = { tipo, t, ... }). Convenções do boneco (o mesmo do jogo):
  //   perna/braço rotation.z + = para a frente · bracoE.rotation.x + / bracoD.rotation.x − = para fora · corpo.rotation.z + = para trás
  //   corpo.rotation.x + = tomba para a DIREITA dele (o giro é em volta dos pés) · joelho negativo dobra.
  // =====================================================================================================================
  const lerpN = (a, b, k) => a + (b - a) * k, clampN = (x, a, b) => Math.max(a, Math.min(b, x));
  const suave = (k) => { k = clampN(k, 0, 1); return k * k * (3 - 2 * k); };
  const ESTILO = { peito: 1.0, chapa: 0.72, cavadinha: 0.5, cruz: 0.92, passe: 0.62, toque: 0.35 };
  function limparPose(A) {
    const m = A.m; if (!m) return;
    m.pernaD.rotation.y = 0; m.pernaE.rotation.y = 0; m.pernaD.rotation.x = 0; m.pernaE.rotation.x = 0; m.corpo.rotation.x = 0;
    A.pf = null; A.poseFn = null;
  }
  function pose(A, tipo, extra) { A.pf = Object.assign({ tipo, t: 0 }, extra || {}); A.poseFn = poseTreino; }
  function poseTreino(A, m, r, dt) {
    const F = A.pf; if (!F) { limparPose(A); return; }
    F.t += dt; const t = F.t;
    m.pernaD.rotation.y = 0; m.pernaE.rotation.y = 0; m.pernaD.rotation.x = 0; m.pernaE.rotation.x = 0; m.corpo.rotation.x = 0;
    if (F.tipo === 'chute') {                                            // corrida já feita: plantou o pé esquerdo, a direita vai atrás e vem
      const fs = ESTILO[F.estilo] || 1, cav = F.estilo === 'cavadinha', ch = F.estilo === 'chapa' || F.estilo === 'passe' || F.estilo === 'toque';
      let pz, jz = 0, cz = 0, hop = 0;
      if (t < 0.1) { const k = suave(t / 0.1); pz = -0.95 * fs * k; jz = -1.25 * k; cz = 0.08 * k; }
      else if (t < 0.18) { const k = (t - 0.1) / 0.08; pz = lerpN(-0.95 * fs, 1.25 * fs, k); jz = lerpN(-1.25, -0.1, k); cz = lerpN(0.08, cav ? 0.18 : -0.14, k); }
      else { const k = suave((t - 0.18) / 0.45); pz = lerpN(1.25 * fs + (F.estilo === 'peito' ? 0.45 : 0), 0, k); jz = lerpN(-0.1, 0, k); cz = lerpN(cav ? 0.18 : -0.14, 0, k); hop = F.estilo === 'peito' ? Math.sin(Math.PI * clampN((t - 0.16) / 0.35, 0, 1)) * 0.07 : 0; }
      m.pernaD.rotation.z = pz; m.pernaE.rotation.z = -0.12 + (t > 0.18 ? 0.1 : 0); usarJoelhos(m, -0.15, jz);
      if (ch) m.pernaD.rotation.y = -0.75;                               // de chapa: o pé abre e bate com a parte de dentro
      m.corpo.rotation.z = cz;
      const ab = t < 0.6 ? Math.min(1, t / 0.08) : Math.max(0, 1 - (t - 0.6) / 0.2);
      m.bracoE.rotation.z = 0.55 * ab; m.bracoE.rotation.x = 0.95 * ab; m.bracoD.rotation.z = -0.45 * ab; m.bracoD.rotation.x = -0.5 * ab;   // braço esquerdo aberto (equilíbrio)
      r.position.y = A.y + hop;
      if (t > 0.85) limparPose(A);
    } else if (F.tipo === 'gk') {                                        // GOLEIRO NA BASE: agachado, braços abertos à frente; passinho de lado
      const b = Math.sin(t * 7) * 0.012, lat = F.lat || 0, fase = (F.fase = (F.fase || 0) + dt * Math.abs(lat) * 7);
      usarJoelhos(m, -0.75, -0.75); m.pernaE.rotation.z = m.pernaD.rotation.z = 0.3; m.corpo.rotation.z = -0.22;
      m.bracoE.rotation.z = m.bracoD.rotation.z = 0.75; m.bracoE.rotation.x = 0.6; m.bracoD.rotation.x = -0.6; usarCotovelo(m.bracoE, 0, 0.55); usarCotovelo(m.bracoD, 0, 0.55);
      if (Math.abs(lat) > 0.05) { const s = Math.sin(fase); m.pernaE.rotation.x = 0.28 * Math.max(0, s); m.pernaD.rotation.x = -0.28 * Math.max(0, -s); }
      r.position.y = A.y - 0.13 + b;
    } else if (F.tipo === 'mergulho') {                                  // PONTE: carrega, voa de lado com os braços esticados, cai e fica deitado
      const lado = F.lado || 1, ar = F.alto || 0.4, T1 = 0.1, T2 = 0.48;
      let roll, y;
      if (t < T1) { roll = 0.12 * lado * (t / T1); y = A.y - 0.18 * (t / T1); usarJoelhos(m, -0.9, -0.9); }
      else if (t < T2) { const k = (t - T1) / (T2 - T1); roll = lado * lerpN(0.12, 1.45, suave(k)); y = A.y + Math.sin(Math.PI * k) * (0.2 + 0.55 * ar) + 0.3 * Math.abs(Math.sin(roll)) * k; }
      else { roll = lado * 1.47; y = A.y + 0.3 * Math.abs(Math.sin(roll)); }
      if (F.levanta) { const k = suave(F.levanta / 0.55); roll = lerpN(lado * 1.47, 0, k); y = lerpN(A.y + 0.3, A.y, k); F.levanta += dt; if (F.levanta > 0.55) { pose(A, 'gk'); return; } }
      m.corpo.rotation.x = roll; m.corpo.rotation.z = -0.05;
      const br = t < T1 ? 0.8 : 2.95;                                     // os braços vão "por cima da cabeça" (na direção do mergulho)
      m.bracoE.rotation.z = m.bracoD.rotation.z = F.encaixou ? 1.6 : br; m.bracoE.rotation.x = 0.15; m.bracoD.rotation.x = -0.15;
      m.pernaE.rotation.z = 0.15; m.pernaD.rotation.z = -0.1; if (t >= T1) usarJoelhos(m, -0.25, -0.45);
      r.position.y = y;
    } else if (F.tipo === 'encaixe') {                                   // ENCAIXE: a bola no peito, braços fechados nela
      usarJoelhos(m, -0.35, -0.35); m.pernaE.rotation.z = m.pernaD.rotation.z = 0.15; m.corpo.rotation.z = -0.12;
      m.bracoE.rotation.z = m.bracoD.rotation.z = 1.2; m.bracoE.rotation.x = -0.28; m.bracoD.rotation.x = 0.28; usarCotovelo(m.bracoE, 0, 0.95); usarCotovelo(m.bracoD, 0, 0.95);
      r.position.y = A.y - 0.06;
    } else if (F.tipo === 'pega') {                                      // abaixa para pegar a bola no chão
      const k = Math.sin(Math.PI * clampN(t / 0.7, 0, 1));
      usarJoelhos(m, -0.7 * k, -0.7 * k); m.pernaE.rotation.z = m.pernaD.rotation.z = 0.35 * k; m.corpo.rotation.z = -0.75 * k;
      m.bracoE.rotation.z = m.bracoD.rotation.z = 0.7 * k; r.position.y = A.y - 0.18 * k;
    } else if (F.tipo === 'repoe') {                                     // REPÕE: a bola rolada com a mão (de baixo para cima)
      const k = clampN(t / 0.55, 0, 1);
      usarJoelhos(m, -0.65, -0.25); m.pernaE.rotation.z = 0.45; m.pernaD.rotation.z = -0.2; m.corpo.rotation.z = -0.45;
      m.bracoD.rotation.z = lerpN(-0.9, 1.0, suave(k)); m.bracoE.rotation.z = 0.5; m.bracoE.rotation.x = 0.5; r.position.y = A.y - 0.15;
      if (t > 0.9) pose(A, 'gk');
    } else if (F.tipo === 'cabeceio') {                                  // CABECEIO: impulso, arqueia e "estala" o pescoço para a frente
      const k = clampN(t / 0.7, 0, 1), sobe = Math.sin(Math.PI * k);
      m.corpo.rotation.z = t < 0.28 ? 0.25 * (t / 0.28) : lerpN(0.25, -0.38, clampN((t - 0.28) / 0.12, 0, 1));
      m.bracoE.rotation.z = m.bracoD.rotation.z = 1.1; m.bracoE.rotation.x = 0.8; m.bracoD.rotation.x = -0.8;
      usarJoelhos(m, t < 0.12 ? -0.8 : -0.4 * sobe, t < 0.12 ? -0.8 : -0.6 * sobe); m.pernaE.rotation.z = m.pernaD.rotation.z = t < 0.12 ? 0.3 : 0.1;
      r.position.y = A.y + (t < 0.12 ? -0.12 : sobe * (0.38 + 0.12 * (F.alto || 0)));
      if (t > 0.95) limparPose(A);
    } else if (F.tipo === 'dominio') {                                   // DOMÍNIO: a parte de dentro do pé amortece a bola
      const k = Math.sin(Math.PI * clampN(t / 0.5, 0, 1));
      m.pernaD.rotation.z = 0.45 * k; m.pernaD.rotation.y = -0.8 * k; usarJoelhos(m, -0.2, -0.25 * k);
      m.bracoE.rotation.x = 0.45 * k; m.bracoD.rotation.x = -0.45 * k; m.corpo.rotation.z = -0.06 * k;
      if (t > 0.6) limparPose(A);
    } else if (F.tipo === 'peito') {                                     // MATA NO PEITO: tronco para trás, braços abertos
      const k = Math.sin(Math.PI * clampN(t / 0.6, 0, 1));
      m.corpo.rotation.z = 0.32 * k; m.bracoE.rotation.z = m.bracoD.rotation.z = 0.5 * k; m.bracoE.rotation.x = 1.0 * k; m.bracoD.rotation.x = -1.0 * k; usarJoelhos(m, -0.25 * k, -0.25 * k);
      if (t > 0.7) limparPose(A);
    } else if (F.tipo === 'pula') {                                      // pula para cortar (marcador / zagueiro)
      const k = clampN(t / 0.6, 0, 1), sobe = Math.sin(Math.PI * k);
      m.bracoE.rotation.z = m.bracoD.rotation.z = 0.9 + 1.4 * sobe; m.bracoE.rotation.x = 0.35; m.bracoD.rotation.x = -0.35;
      usarJoelhos(m, -0.6 * (1 - sobe), -0.6 * (1 - sobe)); r.position.y = A.y + sobe * 0.42;
      if (t > 0.7) limparPose(A);
    } else if (F.tipo === 'comemora') {                                  // braços para cima, pulinhos
      const s = Math.abs(Math.sin(t * 7));
      m.bracoE.rotation.z = m.bracoD.rotation.z = 2.75; m.bracoE.rotation.x = 0.35 + 0.15 * s; m.bracoD.rotation.x = -0.35 - 0.15 * s;
      r.position.y = A.y + s * 0.12; usarJoelhos(m, -0.3 * (1 - s), -0.3 * (1 - s));
      if (t > (F.dur || 1.6)) limparPose(A);
    } else if (F.tipo === 'lamenta') {                                   // mãos na cabeça
      m.bracoE.rotation.z = m.bracoD.rotation.z = 2.5; m.bracoE.rotation.x = -0.45; m.bracoD.rotation.x = 0.45; usarCotovelo(m.bracoE, 0, 1.7); usarCotovelo(m.bracoD, 0, 1.7);
      m.corpo.rotation.z = 0.08 + Math.sin(t * 2) * 0.03;
      if (t > (F.dur || 1.4)) limparPose(A);
    } else if (F.tipo === 'aplaude') {                                   // bate palmas na frente do peito
      const s = Math.sin(t * 16);
      m.bracoE.rotation.z = m.bracoD.rotation.z = 1.3; m.bracoE.rotation.x = -0.15 + s * 0.22; m.bracoD.rotation.x = 0.15 - s * 0.22; usarCotovelo(m.bracoE, 0, 0.9); usarCotovelo(m.bracoD, 0, 0.9);
      if (t > (F.dur || 1.3)) limparPose(A);
    } else if (F.tipo === 'embaixada') {                                 // embaixadinha: o pé (ou a coxa) sobe quando a bola chega
      const k = Math.max(0, Math.sin(Math.PI * clampN(t / 0.32, 0, 1))), coxa = !!F.coxa;
      if (coxa) { m.pernaD.rotation.z = 1.25 * k; usarJoelhos(m, 0, -1.4 * k); } else { m.pernaD.rotation.z = 0.75 * k; usarJoelhos(m, 0, -0.55 * k); m.pernaD.rotation.y = -0.4 * k; }
      m.bracoE.rotation.x = 0.55; m.bracoD.rotation.x = -0.55; m.bracoE.rotation.z = m.bracoD.rotation.z = 0.25;
      if (t > 0.4) F.t = 0.4;                                             // fica pronto até o próximo toque (quem manda é o treino)
    } else if (F.tipo === 'alonga') {                                    // o goleiro alongando: braços para cima e o corpo para os lados
      m.bracoE.rotation.z = m.bracoD.rotation.z = 2.85; m.bracoE.rotation.x = 0.1; m.bracoD.rotation.x = -0.1; m.corpo.rotation.x = Math.sin(t * 1.1) * 0.28;
    } else if (F.tipo === 'espera') {                                    // parado esperando a bola: leve balanço, mãos na cintura de vez em quando
      const s = Math.sin(t * 2.2) * 0.04; m.corpo.rotation.z = s * 0.3;
      if (F.cintura) { m.bracoE.rotation.x = 1.0; m.bracoD.rotation.x = -1.0; m.bracoE.rotation.z = m.bracoD.rotation.z = 0.05; usarCotovelo(m.bracoE, -2.0, 0); usarCotovelo(m.bracoD, 2.0, 0); }
    }
  }

  // =====================================================================================================================
  // criar(api): a turma no campo, as luzes, a conversa e o treino
  // =====================================================================================================================
  function criar(api) {
    const S = () => api.S(), L = LOGICA, Y0 = 0.08;                     // Y0: o piso do society (a grama sintética está 8 cm acima do chão)
    const P = { mg: null, dr: null, luz: null, t: 0, objs: [], falou: false };
    const TT = () => S().treino;                                         // { F, gz, spot, bat: [Juninho, Tonhão], gol: Paredão, esp, bola }
    const W = (u, v) => ({ x: TT().F.cx + u, z: TT().gz - v });          // do treino (u, v) para a cidade (x, z)
    const LC = (x, z) => ({ u: x - TT().F.cx, v: TT().gz - z });
    const yawDir = (du, dv) => Math.atan2(dv, du);                       // yaw da cidade para andar no sentido (du, dv) do treino (x = u, z = −v)
    const gravar = () => { try { api.gravar(S().dados.ponto || 'chegada'); } catch (e) { /* sem save */ } };
    function dados() {
      const d = S().dados, p = d.treinoNonato || (d.treinoNonato = {});
      if (!p.prog) p.prog = { chute: 0, passe: 0, cruz: 0 }; if (!p.hoje) p.hoje = { dia: -1, n: 0 }; if (!p.ganhos) p.ganhos = {};
      if (p.hoje.dia !== d.dia) p.hoje = { dia: d.dia, n: 0 };
      return p;
    }
    const atributos = () => { try { return api.atributosJogador(); } catch (e) { return { chute: 5, passe: 5, efeito: 5, cruzamento: 5 }; } };
    const nomeGoleiro = () => tr('Paredão');
    function falantes() {
      const s = S(), T_ = TT(); if (!T_) return; s.falantesExtra = s.falantesExtra || {};
      s.falantesExtra.paredao = { A: T_.gol, nome: tr('Paredão'), voz: 4 }; s.falantesExtra.juninho = { A: T_.bat[0], nome: tr('Juninho'), voz: 3 }; s.falantesExtra.tonhao = { A: T_.bat[1], nome: tr('Tonhão'), voz: 1 };
    }

    // ------------------------------------------------------------------ objetos 3D
    const grupo = () => S().grupo;
    const guardar = (o) => (api.guardar ? api.guardar(o) : o);
    const MATS = {};
    const mat = (cor, op) => { const k = cor + '|' + (op || 1); return MATS[k] || (MATS[k] = new THREE.MeshLambertMaterial(op && op < 1 ? { color: cor, transparent: true, opacity: op, depthWrite: false } : { color: cor })); };
    const matB = (cor, op) => { const k = 'b' + cor + '|' + (op || 1); return MATS[k] || (MATS[k] = new THREE.MeshBasicMaterial({ color: cor, transparent: (op || 1) < 1, opacity: op || 1, depthWrite: (op || 1) >= 1 })); };
    function novaBola() {
      const m = new THREE.Mesh(new THREE.SphereGeometry(L.RB, 14, 10), new THREE.MeshLambertMaterial({ map: api.texBolinha() }));
      const sb = api.sombraAtor ? api.sombraAtor(0.17) : null; grupo().add(m); return { m, sb };
    }
    function porBola(B, u, y, v, giro) {
      const p = W(u, v); B.m.position.set(p.x, Y0 + y, p.z); if (giro) { B.m.rotation.x += giro; B.m.rotation.z += giro * 0.4; }
      if (B.sb) { B.sb.position.set(p.x, Y0 + 0.02, p.z); B.sb.visible = B.m.visible; const k = clampN(1 - (y - L.RB) / 3, 0.35, 1); B.sb.scale.set(k, k, k); }
    }
    function tirar(o) { if (!o) return; if (o.parent) o.parent.remove(o); o.traverse && o.traverse((q) => { if (q.geometry) q.geometry.dispose(); }); }

    // ---- os REFLETORES do society (acendem de noite: a turma pode treinar de madrugada)
    function montarLuzes() {
      if (P.luz || !TT()) return;
      const F = TT().F, r = F.r, g = new THREE.Group(), cabecas = [];
      const matPoste = mat('#6d737b'), matCab = new THREE.MeshBasicMaterial({ color: 0x5a5a52 });
      for (const [x, z] of [[r.x0 + 0.45, r.z0 + 6], [r.x1 - 0.45, r.z0 + 6], [r.x0 + 0.45, r.z1 - 6], [r.x1 - 0.45, r.z1 - 6]]) {   // por dentro do alambrado, na sobra do lado do campo
        const poste = new THREE.Mesh(new THREE.BoxGeometry(0.22, 9, 0.22), matPoste); poste.position.set(x, 4.5, z); g.add(poste);
        const ld = Math.sign(F.cx - x), braco = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.12, 0.14), matPoste); braco.position.set(x + ld * 0.45, 8.9, z); g.add(braco);
        const cab = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.42, 0.55), matCab); cab.position.set(x + ld * 0.95, 8.85, z); cab.rotation.z = -ld * 0.5; g.add(cab); cabecas.push(cab);
      }
      // a luz no gramado: um brilho grande (somado) por cima do campo
      const cv = document.createElement('canvas'); cv.width = cv.height = 64; const c = cv.getContext('2d'), gr = c.createRadialGradient(32, 32, 2, 32, 32, 32);
      gr.addColorStop(0, 'rgba(255,250,225,0.9)'); gr.addColorStop(0.6, 'rgba(255,245,210,0.45)'); gr.addColorStop(1, 'rgba(255,240,200,0)'); c.fillStyle = gr; c.fillRect(0, 0, 64, 64);
      const tx = new THREE.CanvasTexture(cv), mp = new THREE.MeshBasicMaterial({ map: tx, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 });
      const pl = new THREE.Mesh(new THREE.PlaneGeometry(r.x1 - r.x0 + 6, r.z1 - r.z0 + 4), mp); pl.rotation.x = -Math.PI / 2; pl.position.set(F.cx, Y0 + 0.02, (r.z0 + r.z1) / 2); pl.renderOrder = 2; g.add(pl);
      const halo = new THREE.SpriteMaterial({ map: tx, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }), halos = [];
      for (const cb of cabecas) { const s = new THREE.Sprite(halo); s.position.copy(cb.position); s.scale.set(3.4, 3.4, 1); g.add(s); halos.push(s); }
      grupo().add(g); P.luz = { g, mp, halo, matCab, aceso: -1 };
    }
    function tickLuzes() {
      if (!P.luz) return;
      const n = api.noite ? api.noite() : 0, on = (TT() && !TT().pausa) || P.mg ? n : 0;   // só com a turma lá (ou treinando) e de noite
      if (Math.abs(on - P.luz.aceso) < 0.01) return; P.luz.aceso = on;
      P.luz.mp.opacity = 0.55 * on; P.luz.halo.opacity = 0.95 * on; P.luz.matCab.color.setRGB(0.35 + 0.65 * on, 0.35 + 0.63 * on, 0.32 + 0.5 * on);
    }

    // =====================================================================================================================
    // A TURMA SOZINHA (sem o jogador): rodízio de treinos com a mesma física da bola
    // =====================================================================================================================
    const TREINOS_NPC = ['cobranca', 'cruz', 'cobranca', 'embaixada'];
    function iniciarDrill(k) {
      const T_ = TT(), tipo = TREINOS_NPC[k % TREINOS_NPC.length];
      P.dr = { k, tipo, t: 0, fim: 70 + Math.random() * 50, fase: 'prepara', ft: 0, vez: 0, J: null, B: T_.bola };
      for (const A of [T_.gol].concat(T_.bat)) { A.chuteT = -1; limparPose(A); }
      pose(T_.gol, tipo === 'embaixada' ? 'alonga' : 'gk');
    }
    function andarAte(A, u, v, vel, dt) {                                // anda reto (no campo, sem colisão); devolve true quando chegou
      const p = W(u, v), dx = p.x - A.x, dz = p.z - A.z, d = Math.hypot(dx, dz);
      if (d < 0.06) { A.andando = false; return true; }
      const st = Math.min(d, vel * dt); A.x += dx / d * st; A.z += dz / d * st; A.yawAlvo = Math.atan2(-dz, dx); A.andando = true; A.vel = vel; A.correndo = vel > 3; return false;
    }
    const olhar = (A, u, v) => { const p = W(u, v); A.yawAlvo = Math.atan2(-(p.z - A.z), p.x - A.x); };
    const posLC = (A) => LC(A.x, A.z);
    function bolaNPC(B, u, y, v) { B.u = u; B.y = y; B.v = v; B.mesh.visible = true; B.sombra.visible = true; const p = W(u, v); B.mesh.position.set(p.x, Y0 + y, p.z); B.sombra.position.set(p.x, Y0 + 0.02, p.z); }
    // a jogada da turma: monta um desafio "de mentira" e usa a mesma física (o goleiro de verdade defende ou não)
    function jogadaNPC(cfg, inp) { const D = Object.assign({ tipo: 'chute', x: 0.5, mira: { plano: 'gol' }, crit: 'gol' }, cfg); return L.jogada(D, inp, { chute: 6.5, passe: 6.5, efeito: 6.5, cruzamento: 6.5 }, 0); }
    function tickDrill(dt) {
      const T_ = TT(), D = P.dr; if (!D) return;
      const K = T_.gol, [A0, A1] = T_.bat, B = D.B, gk = (u, v) => W(u, v);
      D.t += dt; D.ft += dt;
      if (D.tipo === 'cobranca') {
        const bat = T_.bat[D.vez % 2], outro = T_.bat[(D.vez + 1) % 2], spot = D.spot || (D.spot = { u: (Math.random() - 0.5) * 3, v: 8.5 + Math.random() * 4 });
        if (D.fase === 'prepara') {                                       // a bola na marca, o batedor dá uns passos para trás
          bolaNPC(B, spot.u, L.RB, spot.v);
          if (!D.corr) { const a0 = Math.random() < 0.5 ? -1 : 1; D.corr = { u: spot.u + a0 * 0.9, v: spot.v + 2.2, a: a0 }; } const a = D.corr.a;
          andarAte(outro, spot.u - a * 3.2, spot.v + 3.5, 1.6, dt); olhar(outro, 0, 0);
          if (andarAte(bat, D.corr.u, D.corr.v, 1.8, dt)) { olhar(bat, spot.u, spot.v); D.fase = 'olha'; D.ft = 0; }
          const g = gk(clampN(spot.u * 0.06, -0.4, 0.4), 0.6); K.x += (g.x - K.x) * Math.min(1, dt * 3); K.z = g.z; K.yawAlvo = Math.PI / 2; if (!K.pf || K.pf.tipo !== 'gk') pose(K, 'gk');
        } else if (D.fase === 'olha') {
          bat.andando = false; if (D.ft > 1.1) { D.fase = 'corre'; D.ft = 0; D.estilo = ['peito', 'peito', 'chapa', 'chapa', 'cavadinha'][Math.floor(Math.random() * 5)]; }
        } else if (D.fase === 'corre') {
          const alvo = { u: spot.u - 0.22 * Math.sign(D.corr.u - spot.u || 1), v: spot.v + 0.45 };
          if (andarAte(bat, alvo.u, alvo.v, 3.6, dt)) { bat.andando = false; olhar(bat, spot.u * 0.5, 0); bat.yaw = bat.yawAlvo; pose(bat, 'chute', { estilo: D.estilo }); D.fase = 'chuta'; D.ft = 0; }
        } else if (D.fase === 'chuta') {
          if (D.ft > 0.12 && !D.J) {                                      // a bola sai
            const cav = D.estilo === 'cavadinha', alvoU = (Math.random() < 0.5 ? -1 : 1) * (cav ? 0.3 : 1.0 + Math.random() * 1.2), alvoY = cav ? 1.2 : 0.3 + Math.random() * 1.6;
            const errou = Math.random() < 0.12, inp = { u: alvoU + (errou ? Math.sign(alvoU) * 1.6 : 0), y: errou && Math.random() < 0.5 ? 2.6 : alvoY, p: D.estilo === 'peito' ? 0.6 + Math.random() * 0.25 : cav ? 0.3 : 0.45, spin: 0 };
            D.J = jogadaNPC({ bola: { u: spot.u, v: spot.v }, goleiro: { modo: 'gol', u: K ? LC(K.x, K.z).u : 0, v: 0.6, tau: cav ? 0.18 : 0.26, vD: 3.4, reach: 0.95 } }, inp);
            SOM.chute(D.estilo === 'peito' ? 1 : 0.6);
          }
          if (D.J) {
            for (let i = 0; i < 4 && !D.J.fim; i++) L.passo(D.J, dt / 4);
            const Bj = D.J.B; bolaNPC(B, Bj.u, Bj.y, Bj.v); B.mesh.rotation.x += dt * 14;
            goleiroSegue(K, D.J, dt);
            if (D.J.fim) { D.res = D.J.motivo; D.fase = 'voa'; D.ft = 0; D.Jfim = D.J; }
          }
        } else if (D.fase === 'voa') {                                    // depois do lance: a bola termina de andar (rede / quica / rola)
          const J = D.Jfim, Bj = J.B;
          if (D.res === 'GOL!') { if (Bj.v > -0.9) { L.passoBola(Bj, dt); Bj.vu *= 0.96; Bj.vv *= 0.9; } else { Bj.vv = 0; Bj.vu *= 0.8; if (Bj.voa) L.passoBola(Bj, dt); } if (D.ft < 0.05) { SOM.rede(); } }
          else if (J.gk && J.gk.pegou && J.gk.encaixe) { const k = W(J.gk.u, J.gk.v); Bj.u = J.gk.u; Bj.v = J.gk.v + 0.32; Bj.y = 1.0; void k; }
          else { L.passoBola(Bj, dt); if (Bj.v < -0.9 && Bj.vv < 0) Bj.vv = Math.abs(Bj.vv) * 0.3; if (Math.abs(Bj.u) > 11) Bj.vu = -Bj.vu * 0.3; }
          bolaNPC(B, Bj.u, Bj.y, Bj.v);
          if (D.ft < dt * 1.5) { if (D.res === 'GOL!') pose(bat, 'comemora', { dur: 1.2 }); else if (D.res === 'Defendeu!') { pose(outro, 'aplaude'); SOM.defesa(); } else pose(bat, 'lamenta'); }
          if (K.pf && K.pf.tipo === 'mergulho' && D.ft > 1.0 && !K.pf.levanta) K.pf.levanta = 0.001;
          if (D.ft > 2.0) { D.fase = 'busca'; D.ft = 0; }
        } else if (D.fase === 'busca') {                                  // o goleiro vai buscar a bola, pega e rola de volta para a marca
          if (K.pf && K.pf.tipo === 'mergulho') { if (!K.pf.levanta) K.pf.levanta = 0.001; if (D.ft > 0.7) pose(K, 'gk'); return; }   // primeiro levanta do chão (a pose pode não rodar de longe: o tempo é do treino)
          if (K.pf && K.pf.tipo === 'encaixe') { pose(K, 'repoe'); D.fase = 'volta'; D.ft = 0; limparPose(K); return; }   // encaixou: já está com a bola
          const Bj = D.Jfim.B, bu = clampN(Bj.u, -10, 10), bv = clampN(Bj.v, -1.6, 28);
          if (!K.pf || K.pf.tipo === 'gk') { K.goleiro = false; }
          if (andarAte(K, bu, bv + 0.4, 2.2, dt)) { pose(K, 'pega'); D.fase = 'pega'; D.ft = 0; }
        } else if (D.fase === 'pega') {
          if (D.ft > 0.35) { const k = W(posLC(K).u, posLC(K).v); bolaNPC(B, posLC(K).u, 0.75, posLC(K).v - 0.3); void k; }
          if (D.ft > 0.7) { D.fase = 'volta'; D.ft = 0; limparPose(K); }
        } else if (D.fase === 'volta') {
          const ok = andarAte(K, clampN(spot.u * 0.06, -0.4, 0.4), 1.2, 1.8, dt), pk = posLC(K); bolaNPC(B, pk.u, 0.75, pk.v + 0.3);
          if (ok) { olhar(K, spot.u, spot.v); K.yaw = K.yawAlvo; pose(K, 'repoe'); D.fase = 'rola'; D.ft = 0; }
        } else if (D.fase === 'rola') {
          const pk = posLC(K);
          if (D.ft < 0.4) bolaNPC(B, pk.u + 0.0, 0.4, pk.v + 0.45);
          else {
            if (!D.rolo) { const du = spot.u - pk.u, dv = spot.v - (pk.v + 0.5), d = Math.hypot(du, dv), v0 = Math.sqrt(2 * 2.2 * d); D.rolo = { u: pk.u, y: L.RB, v: pk.v + 0.5, vu: du / d * v0, vv: dv / d * v0, vy: 0, au: 0, av: 0, voa: false, rola: true }; }
            L.passoBola(D.rolo, dt); bolaNPC(B, D.rolo.u, L.RB, D.rolo.v); B.mesh.rotation.x -= dt * 8;
            if (D.rolo.parou || D.ft > 6) { D.rolo = null; D.J = null; D.Jfim = null; D.corr = null; D.vez++; D.spot = { u: (Math.random() - 0.5) * 3, v: 8.5 + Math.random() * 4 }; D.fase = 'prepara'; D.ft = 0; pose(K, 'gk'); K.goleiro = true; if (D.t > D.fim) iniciarDrill(D.k + 1); }
          }
        }
      } else if (D.tipo === 'cruz') {                                     // o Tonhão cruza da ponta, o Juninho cabeceia (ou emenda) para o gol
        const lado = D.lado || (D.lado = Math.random() < 0.5 ? -1 : 1), wing = { u: lado * 7.2, v: 9.5 }, area = D.area || (D.area = { u: -lado * (0.6 + Math.random() * 1.2), v: 5 + Math.random() * 1.8 });
        if (D.fase === 'prepara') {
          bolaNPC(B, wing.u, L.RB, wing.v);
          const a = andarAte(A1, wing.u + lado * 0.6, wing.v + 1.6, 2.0, dt), b = andarAte(A0, area.u - lado * 1.2, area.v + 5.5, 2.0, dt);
          const g = gk(lado * 0.5, 0.7); K.x += (g.x - K.x) * Math.min(1, dt * 3); K.z = g.z; K.yawAlvo = Math.PI / 2; if (!K.pf) pose(K, 'gk');
          if (a && b) { olhar(A1, area.u, area.v); olhar(A0, wing.u, wing.v); D.fase = 'olha'; D.ft = 0; }
        } else if (D.fase === 'olha') {
          if (D.ft > 0.9) { D.fase = 'corre'; D.ft = 0; }
        } else if (D.fase === 'corre') {                                  // os dois correm: um para a bola, o outro para a área
          const a = andarAte(A1, wing.u + lado * 0.25, wing.v + 0.45, 3.4, dt);
          andarAte(A0, area.u - lado * 0.4, area.v + 1.6, 2.6, dt);
          if (a) { olhar(A1, area.u, area.v); A1.yaw = A1.yawAlvo; pose(A1, 'chute', { estilo: 'cruz' }); D.fase = 'cruza'; D.ft = 0; }
        } else if (D.fase === 'cruza') {
          if (D.ft > 0.12 && !D.J) {
            const Dc = { tipo: 'cruz', x: 0.4, bola: { u: wing.u, v: wing.v }, mira: { plano: 'alto', u: area.u, v: area.v, y: 1.75 }, crit: 'cabeca', cabeca: { u: area.u, v: area.v, alcance: 0.7, vmax: 20 } };
            const pc = L.forcaCerta(Dc, Dc.mira, null, false); D.J = L.jogada(Dc, { u: area.u + (Math.random() - 0.5) * 0.3, v: area.v + (Math.random() - 0.5) * 0.3, y: 1.75, p: pc, spin: 0, alto: false }, null, 0); D.cabC = Dc; SOM.chute(0.8);
          }
          if (D.ft > 0.1) andarAte(A0, area.u, area.v, 3.0, dt);
          if (D.J) {
            for (let i = 0; i < 4 && !D.J.fim; i++) L.passo(D.J, dt / 4);
            const Bj = D.J.B; bolaNPC(B, Bj.u, Bj.y, Bj.v); B.mesh.rotation.x += dt * 10;
            const dA = Math.hypot(Bj.u - posLC(A0).u, Bj.v - posLC(A0).v); if (dA < 2.2 && (!A0.pf || A0.pf.tipo !== 'cabeceio') && Bj.voa) { A0.andando = false; olhar(A0, 0, 0); A0.yaw = A0.yawAlvo; pose(A0, 'cabeceio'); }
            if (D.J.fim) {
              if (D.J.ok) {                                               // cabeceou: a bola vai para o gol, o goleiro tenta
                const pa = posLC(A0), alvoU = (Math.random() < 0.5 ? -1 : 1) * (0.8 + Math.random() * 1.4);
                D.J = jogadaNPC({ bola: { u: pa.u, v: pa.v }, goleiro: { modo: 'gol', u: LC(K.x, K.z).u, v: 0.6, tau: 0.22, vD: 3.2, reach: 0.9 } }, { u: alvoU, y: 0.4 + Math.random() * 1.2, p: 0.25, spin: 0 });
                D.J.B.y = 1.9; D.J.B.vy = -1; SOM.toque(); D.fase = 'cabeca'; D.ft = 0;
              } else { D.res = D.J.motivo; D.Jfim = D.J; D.fase = 'voa'; D.ft = 0; }
            }
          }
        } else if (D.fase === 'cabeca') {
          for (let i = 0; i < 4 && !D.J.fim; i++) L.passo(D.J, dt / 4);
          const Bj = D.J.B; bolaNPC(B, Bj.u, Bj.y, Bj.v); goleiroSegue(K, D.J, dt);
          if (D.J.fim) { D.res = D.J.motivo; D.Jfim = D.J; D.fase = 'voa'; D.ft = 0; }
        } else if (D.fase === 'voa') {
          const J = D.Jfim, Bj = J.B;
          if (D.res === 'GOL!') { if (Bj.v > -0.9) L.passoBola(Bj, dt); else { Bj.vv = 0; Bj.vu *= 0.8; if (Bj.voa) L.passoBola(Bj, dt); } if (D.ft < dt * 1.5) { SOM.rede(); pose(A0, 'comemora'); pose(A1, 'aplaude'); } }
          else if (J.gk && J.gk.pegou && J.gk.encaixe) { Bj.u = J.gk.u; Bj.v = J.gk.v + 0.32; Bj.y = 1.0; }
          else { L.passoBola(Bj, dt); if (D.ft < dt * 1.5) pose(A0, 'lamenta'); }
          bolaNPC(B, Bj.u, Bj.y, Bj.v);
          if (K.pf && K.pf.tipo === 'mergulho' && D.ft > 1.0 && !K.pf.levanta) K.pf.levanta = 0.001;
          if (D.ft > 2.0) { D.fase = 'busca'; D.ft = 0; D.spot = { u: wing.u, v: wing.v }; }
        } else if (D.fase === 'busca' || D.fase === 'pega' || D.fase === 'volta' || D.fase === 'rola') {
          // a mesma reposição das cobranças (o goleiro rola a bola até a ponta)
          const sp = { u: wing.u, v: wing.v };
          if (D.fase === 'busca' && K.pf && K.pf.tipo === 'mergulho') { if (!K.pf.levanta) K.pf.levanta = 0.001; if (D.ft > 0.7) pose(K, 'gk'); return; }
          if (D.fase === 'busca' && K.pf && K.pf.tipo === 'encaixe') { limparPose(K); D.fase = 'volta'; D.ft = 0; return; }
          if (D.fase === 'busca') { const Bj = D.Jfim.B; if (andarAte(K, clampN(Bj.u, -10, 10), clampN(Bj.v, -1.6, 28) + 0.4, 2.2, dt)) { pose(K, 'pega'); D.fase = 'pega'; D.ft = 0; } }
          else if (D.fase === 'pega') { if (D.ft > 0.35) bolaNPC(B, posLC(K).u, 0.75, posLC(K).v - 0.3); if (D.ft > 0.7) { D.fase = 'volta'; D.ft = 0; limparPose(K); } }
          else if (D.fase === 'volta') { const ok = andarAte(K, lado * 0.5, 1.2, 1.8, dt), pk = posLC(K); bolaNPC(B, pk.u, 0.75, pk.v + 0.3); if (ok) { olhar(K, sp.u, sp.v); K.yaw = K.yawAlvo; pose(K, 'repoe'); D.fase = 'rola'; D.ft = 0; } }
          else {
            const pk = posLC(K);
            if (D.ft < 0.4) bolaNPC(B, pk.u, 0.4, pk.v + 0.45);
            else {
              if (!D.rolo) { const du = sp.u - pk.u, dv = sp.v - (pk.v + 0.5), d = Math.hypot(du, dv), v0 = Math.sqrt(2 * 2.2 * d); D.rolo = { u: pk.u, y: L.RB, v: pk.v + 0.5, vu: du / d * v0, vv: dv / d * v0, vy: 0, au: 0, av: 0, voa: false, rola: true }; }
              L.passoBola(D.rolo, dt); bolaNPC(B, D.rolo.u, L.RB, D.rolo.v);
              if (D.rolo.parou || D.ft > 7) { D.rolo = null; D.J = null; D.Jfim = null; D.area = null; D.fase = 'prepara'; D.ft = 0; pose(K, 'gk'); if (D.t > D.fim) iniciarDrill(D.k + 1); }
            }
          }
        }
      } else {                                                            // EMBAIXADINHAS: os dois trocam bola pelo alto, de pé em pé; o goleiro alonga
        const pa = { u: -1.6, v: 9 }, pb = { u: 1.6, v: 9.6 };
        if (D.fase === 'prepara') {
          const a = andarAte(A0, pa.u, pa.v, 1.8, dt), b = andarAte(A1, pb.u, pb.v, 1.8, dt); bolaNPC(B, pa.u + 0.4, L.RB, pa.v);
          if (andarAte(K, 0, 1.6, 1.4, dt)) olhar(K, 0, 9);
          if (a && b) { olhar(A0, pb.u, pb.v); olhar(A1, pa.u, pa.v); D.fase = 'troca'; D.ft = 0; D.de = 0; pose(A0, 'embaixada'); pose(A1, 'embaixada'); D.voo = 0; }
        } else {
          const de = D.de % 2 === 0 ? A0 : A1, pra = D.de % 2 === 0 ? A1 : A0, p0 = posLC(de), p1 = posLC(pra), fa = { u: p0.u + (p1.u - p0.u) * 0.12, v: p0.v + (p1.v - p0.v) * 0.12 }, fb = { u: p1.u + (p0.u - p1.u) * 0.12, v: p1.v + (p0.v - p1.v) * 0.12 };
          const dur = 1.05, k = clampN(D.ft / dur, 0, 1), y = 0.5 + Math.sin(Math.PI * k) * 2.2;
          bolaNPC(B, lerpN(fa.u, fb.u, k), y, lerpN(fa.v, fb.v, k)); B.mesh.rotation.x += dt * 6;
          if (D.ft >= dur) {
            D.de++; D.ft = 0; SOM.toque();
            const P2 = D.de % 2 === 0 ? A0 : A1; P2.pf = null; pose(P2, 'embaixada', { coxa: Math.random() < 0.35 });
            if (D.de % 6 === 5) pose(K, 'aplaude', { dur: 0.8 });
            if (D.t > D.fim && D.de % 2 === 0) iniciarDrill(D.k + 1);
          }
          if (!K.pf) pose(K, 'alonga');
        }
      }
    }
    // o Paredão acompanhando a jogada (a posição vem da lógica; aqui a pose: base, ponte, encaixe)
    function goleiroSegue(K, J, dt) {
      const g = J.gk; if (!g) return;
      const p = W(g.u, g.v), antes = K.x; K.z = p.z; K.yawAlvo = Math.PI / 2; K.yaw = K.yawAlvo;
      if (!K.pf || K.pf.tipo === 'gk') K.x = p.x;
      if (K.pf && K.pf.tipo === 'gk') K.pf.lat = (K.x - antes) / Math.max(dt, 1e-3);
      const ev = J.ev.find((e) => e.e === 'goleiro');
      if (ev && (!K.pf || K.pf.tipo === 'gk')) {
        const dl = ev.u - g.u;                                            // de onde a bola passou em relação ao corpo dele
        if (g.pegou && g.encaixe) pose(K, 'encaixe');
        else if (Math.abs(dl) > 0.35) { const lado = Math.sign(dl); pose(K, 'mergulho', { lado, alto: clampN(ev.y / 2.2, 0, 1), encaixou: g.pegou && Math.abs(dl) < 0.8 }); K.x = W(g.u - Math.sign(dl) * 0.55, 0).x; }
      }
      if (K.pf && K.pf.tipo === 'gk' && J.t > 0.05 && g.alvo != null && !ev) {   // a bola vem: se for para longe, já sai mergulhando
        const B = J.B, tp = B.vv < 0 ? (B.v - g.v) / -B.vv : 9; if (tp < 0.28 && Math.abs(g.alvo - g.u) > 0.45) { const dl = g.alvo - g.u, lado = Math.sign(dl); pose(K, 'mergulho', { lado, alto: clampN(B.y / 2.2, 0, 1) }); K.pf.t = 0.08; }
      }
    }

    // =====================================================================================================================
    // A CONVERSA (o alvo na rua) e o MENU
    // =====================================================================================================================
    function alvos(v) {
      const T_ = TT(), s = S(); if (!T_ || T_.pausa || P.mg || s.dentro) return;
      if (api.chovendoAgora && api.chovendoAgora()) return;
      const A = T_.bat[0]; if (!A || A.oculto) return;
      v.push({ x: A.x, z: A.z, r: 2.3, txt: tr('Treinar com a turma do Nonato'), fn: conversar, y: 2.5 });
    }
    function quandoTxt(dia) {
      const d = S().dados.dia || 1, k = dia - d;
      return k <= 0 ? tr('hoje') : k === 1 ? tr('amanhã') : k === 2 ? tr('depois de amanhã') : trf('daqui a {0} dias', k);
    }
    const fmtH = (h) => api.fmtHora(((h % 24) + 24) % 24);
    function todosOlham() { const T_ = TT(), J = S().jog; for (const A of [T_.gol].concat(T_.bat)) { A.andando = false; A.yawAlvo = Math.atan2(-(J.z - A.z), J.x - A.x); } }
    async function conversar() {
      const p = dados(), T_ = TT(); falantes(); P.parado = true; todosOlham();
      try {
        if (!p.conhece) {
          await api.fala('paredao', tr('Opa! Chegou gente nova no treino!'));
          await api.fala('paredao', tr('Eu sou o Paredão, o goleiro. Esses dois são o Juninho e o Tonhão.'));
          await api.fala('juninho', tr('A gente treina aqui no campo do seu Nonato: chute, passe e cruzamento.'));
          await api.fala('tonhao', tr('São 30 situações de cada, e cada uma tem 3 desafios. Vai ficando difícil, hein!'));
          await api.fala('paredao', tr('Você tem 3 bolas por desafio. Acertou, a bola volta. Errou, perdeu uma.'));
          await api.fala('juninho', tr('Fechou os 3 desafios, a gente vê a diferença no seu pé.'));
          await api.fala('paredao', tr('Só que são 2 treinos por dia, no máximo. O seu Nonato não gosta que gaste a grama.'));
          const pr = api.proximaTurma && api.proximaTurma(), ag = api.turmaAgora && api.turmaAgora();
          if (ag) await api.fala('tonhao', trf('Hoje a gente fica até as {0}.', fmtH(ag.fim)));
          if (pr) await api.fala('tonhao', trf('A gente vem dia sim, dia não. A próxima vez é {0}, das {1} às {2}.', quandoTxt(pr.dia), fmtH(pr.ini), fmtH(pr.fim)));
          p.conhece = true; gravar();
        }
        if (p.hoje.n >= 2) {
          await api.fala('paredao', tr('Hoje já deu! Foram 2 treinos. Volta no próximo dia de treino.'));
          const pr = api.proximaTurma && api.proximaTurma(); if (pr) await api.fala('tonhao', trf('A gente vem dia sim, dia não. A próxima vez é {0}, das {1} às {2}.', quandoTxt(pr.dia), fmtH(pr.ini), fmtH(pr.fim)));
          Dialogo.esconder(); return;
        }
        const ops = [trf('Chute ({0}/30)', p.prog.chute), trf('Passe ({0}/30)', p.prog.passe), trf('Cruzamento ({0}/30)', p.prog.cruz), tr('Agora não')];
        const r = await Escolha.mostrar(tr('Vai treinar o quê?') + ' ' + trf('Hoje ainda dá para mais {0}.', 2 - p.hoje.n), ops);
        Dialogo.esconder(); if (r < 0 || r > 2) return;
        const tipo = ['chute', 'passe', 'cruz'][r];
        let n = p.prog[tipo], rep = false;
        if (n >= 30) {
          const rr = await Escolha.mostrar(trf('Você já fez as 30 de {0}! Quer repetir uma? Não vale habilidade.', tr(['chute', 'passe', 'cruzamento'][r])), [tr('Repetir uma'), tr('Agora não')]);
          Dialogo.esconder(); if (rr !== 0) return; n = Math.floor(Math.random() * 30); rep = true;
        }
        const Sit = L.situacao(tipo, n);
        if (!(await cartao(Sit, rep))) return;
        p.hoje.n++; gravar();                                           // começou, contou (acertando ou errando)
        await treinar(Sit, rep);
      } finally { P.parado = false; }
    }

    // =====================================================================================================================
    // O HUD DO TREINO
    // =====================================================================================================================
    function css() {
      if (document.getElementById('trCss')) return;
      const st = document.createElement('style'); st.id = 'trCss';
      st.textContent = `
#trHud{position:fixed;inset:0;z-index:12;pointer-events:none;font-family:var(--font-display);color:#fff0c8;user-select:none;-webkit-user-select:none}
#trHud .trArr{position:absolute;inset:0;pointer-events:auto;touch-action:none;cursor:crosshair}
#trHud .trTopo{position:absolute;left:50%;top:calc(8px + env(safe-area-inset-top,0px));transform:translateX(-50%);width:min(560px,calc(100% - 132px));text-align:center;background:rgba(42,18,6,.86);border:3px solid #2a1206;box-shadow:0 0 0 2px #f0a020 inset;padding:5px 10px 6px;box-sizing:border-box}
#trHud .trTit{font:700 clamp(11px,2.6vh,15px)/1.2 var(--font-display);letter-spacing:.04em}
#trHud .trLin{display:flex;justify-content:center;gap:14px;align-items:center;margin-top:3px;font:700 clamp(10px,2.3vh,13px)/1 var(--font-display)}
#trHud .trPips i{display:inline-block;width:12px;height:12px;margin:0 2px;background:#5a3a1a;border:2px solid #2a1206;vertical-align:middle}
#trHud .trPips i.ok{background:#5fd35a}#trHud .trPips i.at{background:#f0a020}
#trHud .trBolas b{display:inline-block;width:13px;height:13px;margin:0 2px;border-radius:50%;background:#f4f4f0;border:2px solid #2a1206;vertical-align:middle;box-shadow:inset -3px -3px 0 rgba(0,0,0,.18)}
#trHud .trBolas b.vazia{background:#5a3a1a;box-shadow:none;opacity:.6}
#trHud .trDesc{margin-top:4px;font:600 clamp(11px,2.5vh,14px)/1.25 var(--font-body);color:#ffe6a8}
#trHud .trSair{position:absolute;right:max(12px,env(safe-area-inset-right,0px));top:calc(8px + env(safe-area-inset-top,0px));width:44px;height:44px;pointer-events:auto;font:700 20px/1 var(--font-display)}
#trHud .trDica{position:absolute;left:50%;bottom:calc(10px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);width:min(520px,calc(100% - 300px));text-align:center;font:600 clamp(10px,2.2vh,13px)/1.25 var(--font-body);color:#fff0c8;text-shadow:0 2px 0 #2a1206}
#trHud .trChuta{position:absolute;right:max(18px,env(safe-area-inset-right,0px));bottom:calc(18px + env(safe-area-inset-bottom,0px));width:116px;height:64px;pointer-events:auto;touch-action:none;font:700 15px/1 var(--font-display);letter-spacing:.05em}
#trHud .trBarra{position:absolute;right:calc(max(18px,env(safe-area-inset-right,0px)) + 126px);bottom:calc(18px + env(safe-area-inset-bottom,0px));width:20px;height:150px;background:#2a1206;border:3px solid #2a1206;box-shadow:0 0 0 2px #fff0c8}
#trHud .trBarra i{position:absolute;left:0;right:0;bottom:0;height:0;background:linear-gradient(#e0405a,#f0a020 45%,#5fd35a)}
#trHud .trBarra u{position:absolute;left:-7px;right:-7px;height:3px;background:#fff;box-shadow:0 0 0 1px #2a1206;display:none}
#trHud .trEsq{position:absolute;left:max(14px,env(safe-area-inset-left,0px));bottom:calc(18px + env(safe-area-inset-bottom,0px));display:flex;flex-direction:column;gap:8px;pointer-events:auto}
#trHud .trEsq .pxBtn{width:auto;min-width:118px;height:42px;padding:0 10px;font-size:12px;white-space:nowrap}
#trHud .trMsg{position:absolute;left:50%;top:36%;transform:translate(-50%,-50%) scale(.6);opacity:0;font:700 clamp(26px,7vh,52px)/1.05 var(--font-display);letter-spacing:.06em;white-space:nowrap;text-shadow:0 4px 0 #2a1206,0 0 3px #2a1206;transition:transform .35s cubic-bezier(.2,1.6,.4,1),opacity .2s}
#trHud .trMsg.on{opacity:1;transform:translate(-50%,-50%) scale(1)}#trHud .trMsg.ok{color:#8fe04a}#trHud .trMsg.no{color:#ff8a6a}#trHud .trMsg.ouro{color:#ffd23a}
#trHud .trCard{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(500px,calc(100% - 28px));max-height:calc(100% - 28px);overflow-y:auto;box-sizing:border-box;pointer-events:auto;background:#fff0c8;color:#2a1206;border:4px solid #2a1206;box-shadow:0 6px 0 rgba(0,0,0,.35);padding:10px 14px 12px;text-align:center}
#trHud .trCard h3{margin:2px 0 6px;font:700 clamp(14px,3.4vh,19px)/1.2 var(--font-display);letter-spacing:.04em}
#trHud .trCard p{margin:5px 0;font:600 clamp(12px,2.9vh,15px)/1.3 var(--font-body)}
#trHud .trCard .trPr{color:#1f7a4d;font-weight:700}
#trHud .trCard .trBt{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:8px}
#trHud .trCard .pxBtn{width:auto;min-width:130px;height:44px;padding:0 12px;font-size:13px}
#trHud [hidden]{display:none!important}
@media (max-height:420px){#trHud .trBarra{height:110px}#trHud .trChuta{height:54px;width:104px}#trHud .trCard{padding:6px 10px}}`;
      document.head.appendChild(st);
    }
    function montarHud() {
      css();
      const el = document.createElement('div'); el.id = 'trHud';
      el.innerHTML = '<div class="trArr"></div><div class="trTopo"><div class="trTit"></div><div class="trLin"><span class="trPips"></span><span class="trBolas"></span></div><div class="trDesc"></div></div>' +
        '<button type="button" class="pxBtn trSair">✕</button><div class="trMsg"></div><div class="trDica"></div>' +
        '<div class="trEsq"><button type="button" class="pxBtn trEf"></button><button type="button" class="pxBtn trAlto"></button></div>' +
        '<div class="trBarra"><i></i><u></u></div><button type="button" class="pxBtn pxPrim trChuta"></button><div class="trCard" hidden></div>';
      ($('raizJogo') || document.body).appendChild(el);
      const q = (s) => el.querySelector(s);
      return { el, arr: q('.trArr'), tit: q('.trTit'), pips: q('.trPips'), bolas: q('.trBolas'), desc: q('.trDesc'), sair: q('.trSair'), msg: q('.trMsg'), dica: q('.trDica'), ef: q('.trEf'), alto: q('.trAlto'), barra: q('.trBarra i'), marca: q('.trBarra u'), barraBox: q('.trBarra'), chuta: q('.trChuta'), card: q('.trCard') };
    }
    function $(id) { return document.getElementById(id); }
    const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    // o cartão antes de começar: a situação, os 3 desafios e o prêmio
    async function cartao(Sit, rep) {
      const U = P.uiCard || (P.uiCard = montarHud());
      for (const k of ['arr', 'sair', 'ef', 'alto', 'chuta', 'barraBox', 'dica']) U[k].hidden = true; U.el.querySelector('.trTopo').hidden = true;
      U.card.hidden = false;
      const desafios = Sit.desafios.map((D, k) => '<p>' + esc(trf('Desafio {0}: {1}', k + 1, trf(D.desc, ...D.descA))) + '</p>').join('');
      U.card.innerHTML = '<h3>' + esc(trf('Situação {0}/30: {1}', Sit.n + 1, tr(Sit.nome))) + '</h3>' + desafios +
        '<p class="trPr">' + esc(rep ? tr('Repetição: sem ganhar habilidade.') : trf('Prêmio: +0,1 em {0}', tr(L.NOME_ATRIB[Sit.atrib]))) + '</p>' +
        '<div class="trBt"><button type="button" class="pxBtn pxPrim" data-r="1">' + esc(tr('Bora!')) + '</button><button type="button" class="pxBtn" data-r="0">' + esc(tr('Voltar')) + '</button></div>';
      const r = await new Promise((ok) => { U.card.onclick = (e) => { const b = e.target.closest && e.target.closest('button'); if (!b) return; if (typeof Som !== 'undefined' && Som.clique) Som.clique(); ok(b.dataset.r === '1'); }; });
      U.el.remove(); P.uiCard = null; return r;
    }

    // =====================================================================================================================
    // O TREINO (o minigame)
    // =====================================================================================================================
    const ATRASO = 0.3;                                                   // da hora em que solta até o pé na bola (os passinhos de corrida)
    async function treinar(Sit, rep) {
      const s = S(), J = s.jog, T_ = TT(), ui = api.UI();
      await api.preto(true, 350);
      T_.ocupado = true; P.dr = null;
      for (const A of [T_.gol].concat(T_.bat)) { limparPose(A); A.andando = false; A.chuteT = -1; }
      T_.bola.mesh.visible = false; T_.bola.sombra.visible = false;
      api.esconderHud(true); if (ui.arrasto) ui.arrasto.hidden = true; api.aviso('');
      const U = montarHud(), B = novaBola();
      const m = P.mg = { Sit, rep, k: 0, D: null, U, B, bolas: 3, e: 'intro', t: 0, tD: 0, mira: null, p: 0, spin: 0, alto: false, seg: false, J: null, props: [], tecla: {}, feitos: [false, false, false], cam: null, prev: [] };
      for (let i = 0; i < 12; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 4), matB('#fff0c8', 0.75)); d.visible = false; d.renderOrder = 6; grupo().add(d); m.prev.push(d); }
      m.ret = criarMira(); ligarEntrada(m);
      montarDesafio(m, 0);
      tickMg(0.016); s.cam.snap = true;
      await api.preto(false, 350);
      const fim = await new Promise((ok) => { m.fim = ok; });
      await api.preto(true, 350);
      desligarEntrada(m); limparDesafio(m); tirar(B.m); if (B.sb && B.sb.parent) B.sb.parent.remove(B.sb); tirar(m.ret.g); for (const d of m.prev) tirar(d);
      U.el.remove(); P.mg = null; s.camCena = null; s.cam.snap = true;
      for (const A of [T_.gol].concat(T_.bat)) { limparPose(A); A.andando = false; }
      J.andando = false; J.correndo = false; limparPose(J);
      // de volta aos lugares; a turma volta a treinar sozinha
      T_.bat.forEach((A, i) => { A.x = T_.esp[i].x; A.z = T_.esp[i].z; A.yaw = A.yawAlvo = -Math.PI / 2; });
      T_.gol.x = T_.F.cx; T_.gol.z = T_.gz - 0.5; T_.gol.yaw = T_.gol.yawAlvo = Math.PI / 2;
      const pj = W(-2.5, 11); J.x = pj.x; J.z = pj.z; J.yaw = J.yawAlvo = Math.PI / 2;
      T_.ocupado = false; iniciarDrill(0);
      api.esconderHud(false); if (ui.arrasto) ui.arrasto.hidden = false;
      if (api.tickHorario && api.H_POR_S) api.tickHorario(0.5 / api.H_POR_S);   // o treino leva meia hora do relógio
      await api.preto(false, 350);
      falantes();
      if (fim === 'ok') { await api.fala('paredao', tr('Isso aí! Mandou bem demais!')); }
      else if (fim === 'falhou') { await api.fala('paredao', tr('Não foi dessa vez. Volta outro dia que a gente tenta de novo!')); }
      Dialogo.esconder();
    }
    // ---- montar cada desafio no campo
    function montarDesafio(m, k) {
      limparDesafio(m);
      const D = m.D = m.Sit.desafios[k], T_ = TT(); m.k = k; m.bolas = 3; m.tD = 0; m.e = 'intro'; m.t = 0; m.J = null; m.res = null;
      m.mira = { u: D.mira.u, v: D.mira.v != null ? D.mira.v : 0, y: D.mira.y != null ? D.mira.y : 0 }; if (D.mira.plano === 'chao') m.mira.y = 0;
      m.spin = 0; m.alto = D.tipo === 'passe' ? D.trava === 'alto' : false;
      const props = m.props = [];
      const add = (o) => { grupo().add(o); props.push(o); return o; };
      // bonecos de treino (barreira e marcadores extras): amarelo com a "cabeça" preta
      const boneco = (h) => { const g = new THREE.Group(), c = new THREE.Mesh(new THREE.BoxGeometry(0.46, h - 0.32, 0.12), mat('#f2c230')); c.position.y = (h - 0.32) / 2; g.add(c);
        const ca = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.28, 0.14), mat('#1c1c1f')); ca.position.y = h - 0.16; g.add(ca); const pe = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.06, 0.36), mat('#3a3a3a')); pe.position.y = 0.03; g.add(pe); return g; };
      if (D.barreira) for (const b of D.barreira) { const g = add(boneco(b.h)), p = W(b.u, b.v); g.position.set(p.x, Y0, p.z); g.rotation.y = Math.atan2(-(W(D.bola.u, D.bola.v).z - p.z), W(D.bola.u, D.bola.v).x - p.x) + Math.PI / 2; }
      m.mkObj = [];
      if (D.marcadores) D.marcadores.forEach((M, i) => { if (M.npc) m.mkObj.push({ npc: T_.bat[1] }); else { const g = add(boneco(1.9)); m.mkObj.push({ g }); } void i; });
      // placas (a janela no gol): 4 tábuas em volta da janela
      if (D.janela) { m.placas = [0, 1, 2, 3].map(() => add(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 0.06), mat('#9b6a3a')))); m.placaBorda = add(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 0.04), mat('#6a4428'))); m.placaBorda.visible = false; }
      // aros (alvos no gol): o aro laranja e as cordas até o travessão
      if (D.alvos) m.aros = D.alvos.map((a) => { const g = new THREE.Group(), to = new THREE.Mesh(new THREE.TorusGeometry(a.r, 0.045, 6, 28), mat('#f07a20')); g.add(to);
        const cd = new THREE.Mesh(new THREE.BoxGeometry(0.02, 1, 0.02), mat('#e8e0c8')); cd.position.y = 0.5; g.add(cd); g.userData.corda = cd; g.userData.r = a.r; return add(g); });
      // o aro do cruzamento (no alto, de frente para a bola, num poste)
      if (D.aro) { const g = new THREE.Group(), to = new THREE.Mesh(new THREE.TorusGeometry(D.aro.r, 0.05, 6, 28), mat('#f07a20')); g.add(to); const ps = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1, 0.06), mat('#9aa0a6')); g.add(ps); g.userData.poste = ps; m.aroObj = add(g); }
      // cones
      if (D.cones) m.conesObj = [0, 1].map(() => { const c = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.36, 10), mat('#f06a1a')); return add(c); });
      // círculo no chão (zona)
      if (D.zona) { const z = new THREE.Mesh(new THREE.RingGeometry(D.zona.r - 0.07, D.zona.r, 40), matB('#fff0c8', 0.85)); z.rotation.x = -Math.PI / 2; const p = W(D.zona.u, D.zona.v); z.position.set(p.x, Y0 + 0.025, p.z); z.renderOrder = 3; add(z);
        const f = new THREE.Mesh(new THREE.CircleGeometry(D.zona.r - 0.07, 40), matB('#f0a020', 0.18)); f.rotation.x = -Math.PI / 2; f.position.set(p.x, Y0 + 0.022, p.z); f.renderOrder = 3; add(f); }
      // quem faz o quê: Paredão no gol (ou ao lado), Juninho recebe/cabeceia (ou assiste), Tonhão marca (ou assiste)
      papeis(m);
      atualizarHud(m); m.U.msg.className = 'trMsg';
      porBola(m.B, D.bola.u, L.RB, D.bola.v); m.B.m.visible = true;
      posicionarJogador(m, true);
      cartaoDesafio(m);
    }
    function limparDesafio(m) { for (const o of m.props || []) tirar(o); m.props = []; m.placas = null; m.aros = null; m.aroObj = null; m.conesObj = null; m.mkObj = []; m.placaBorda = null; }
    function papeis(m) {
      const D = m.D, T_ = TT(), [Ju, To] = T_.bat, K = T_.gol, b = D.bola;
      // quem só assiste fica num lugar livre: dentro do campo, a 4–6 m da bola, longe da câmera, do caminho da bola e de quem joga
      const usados = [], lado = (A) => { const p0 = lugarDeVer(m, usados); usados.push(p0); const p = W(p0.u, p0.v); A.x = p.x; A.z = p.z; olharP(A, b.u, b.v); };
      // Paredão
      if (D.goleiro) { const p = W(D.goleiro.u, D.goleiro.v); K.x = p.x; K.z = p.z; K.yaw = K.yawAlvo = Math.PI / 2; pose(K, 'gk'); }
      else { const p = W(3.6, -0.4); K.x = p.x; K.z = p.z; olharP(K, b.u, b.v); K.yaw = K.yawAlvo; pose(K, 'espera', { cintura: true }); }
      // Juninho
      if (D.recebe) { const p0 = D.recebe.corre ? L.posCorre(D.recebe.corre, 0) : D.recebe, p = W(p0.u, p0.v); Ju.x = p.x; Ju.z = p.z; olharP(Ju, b.u, b.v); Ju.yaw = Ju.yawAlvo; pose(Ju, 'espera'); }
      else if (D.cabeca) { const p0 = D.cabeca.corre ? L.posCorre(D.cabeca.corre, 0) : D.cabeca, p = W(p0.u, p0.v); Ju.x = p.x; Ju.z = p.z; olharP(Ju, b.u, b.v); Ju.yaw = Ju.yawAlvo; pose(Ju, 'espera'); }
      else { lado(Ju); Ju.yaw = Ju.yawAlvo; pose(Ju, 'espera', { cintura: Math.random() < 0.5 }); }
      // Tonhão
      const mkN = D.marcadores ? D.marcadores.findIndex((q) => q.npc) : -1;
      if (mkN >= 0) { const M = D.marcadores[mkN], p = W(M.u, M.v); To.x = p.x; To.z = p.z; olharP(To, b.u, b.v); To.yaw = To.yawAlvo; pose(To, 'espera'); }
      else { lado(To); To.yaw = To.yawAlvo; pose(To, 'espera', { cintura: true }); }
      for (const A of [K, Ju, To]) A.andando = false;
    }
    function lugarDeVer(m, usados) {
      const D = m.D, b = D.bola, dl = dirLance(m), ru = dl.v, rv = -dl.u, cam = { u: b.u - dl.u * 5 - ru, v: b.v - dl.v * 5 - rv };
      const alvo = D.mira.plano === 'gol' ? { u: 0, v: 0 } : { u: D.mira.u, v: D.mira.v };
      const evita = [cam, b, alvo].concat(usados); if (D.goleiro) evita.push({ u: D.goleiro.u, v: D.goleiro.v }); if (D.recebe) evita.push(D.recebe); if (D.cabeca) evita.push(D.cabeca); if (D.zona) evita.push(D.zona);
      const distSeg = (p, a, c) => { const du = c.u - a.u, dv = c.v - a.v, L2 = du * du + dv * dv || 1, k = clampN(((p.u - a.u) * du + (p.v - a.v) * dv) / L2, 0, 1); return Math.hypot(p.u - a.u - du * k, p.v - a.v - dv * k); };
      let best = { u: b.u, v: b.v + 3 }, bs = -1;
      for (let i = 0; i < 16; i++) for (const r of [4.5, 6]) {
        const a = i / 16 * Math.PI * 2, p = { u: b.u + Math.cos(a) * r, v: b.v + Math.sin(a) * r }; if (Math.abs(p.u) > 8.6 || p.v < 1 || p.v > 29) continue;
        const sc = Math.min(distSeg(p, b, alvo) * 1.2, distSeg(p, cam, alvo), ...evita.map((q) => Math.hypot(p.u - q.u, p.v - q.v)));
        if (sc > bs) { bs = sc; best = p; }
      }
      return best;
    }
    const olharP = (A, u, v) => { const p = W(u, v); A.yawAlvo = Math.atan2(-(p.z - A.z), p.x - A.x); };
    // a direção do lance (da bola para o lugar padrão da mira): a câmera e o jogador se alinham com ela
    function dirLance(m) { const D = m.D, b = D.bola, alvo = D.mira.plano === 'gol' ? { u: 0, v: 0 } : { u: D.mira.u, v: D.mira.v }; let du = alvo.u - b.u, dv = alvo.v - b.v; const d = Math.hypot(du, dv) || 1; return { u: du / d, v: dv / d }; }
    function posicionarJogador(m, inicio) {
      const J = S().jog, D = m.D, b = D.bola, mi = m.mira, alvo = D.mira.plano === 'gol' ? { u: mi.u, v: 0 } : { u: mi.u, v: mi.v };
      let du = alvo.u - b.u, dv = alvo.v - b.v; const d = Math.hypot(du, dv) || 1; du /= d; dv /= d;
      const ru = dv, rv = -du;                                            // "direita" no plano do treino, olhando para a mira (u, v); pé direito: o jogador fica à esquerda da bola
      m.corrida = { de: { u: b.u - du * 1.35 + ru * 0.55, v: b.v - dv * 1.35 + rv * 0.55 }, ate: { u: b.u - du * 0.32 + ru * 0.24, v: b.v - dv * 0.32 + rv * 0.24 }, du, dv };
      if (inicio || m.e === 'mira' || m.e === 'intro') { const p = W(m.corrida.de.u, m.corrida.de.v); J.x = p.x; J.z = p.z; J.y = 0.08; J.andando = false; J.correndo = false; const pb = W(b.u, b.v); J.yaw = J.yawAlvo = Math.atan2(-(pb.z - J.z), pb.x - J.x); }
    }
    function cartaoDesafio(m) {
      const U = m.U, D = m.D; U.card.hidden = false; U.card.onclick = null;
      U.card.innerHTML = '<h3>' + esc(trf('Desafio {0}/3', m.k + 1)) + '</h3><p>' + esc(trf(D.desc, ...D.descA)) + '</p><div class="trBt"><button type="button" class="pxBtn pxPrim">' + esc(tr('Bora!')) + '</button></div>';
      U.card.onclick = (e) => { if (e.target.closest && e.target.closest('button')) { if (typeof Som !== 'undefined' && Som.clique) Som.clique(); U.card.hidden = true; m.e = 'mira'; m.t = 0; } };
    }
    function atualizarHud(m) {
      const U = m.U, D = m.D, Sit = m.Sit;
      U.tit.textContent = trf('Situação {0}/30: {1}', Sit.n + 1, tr(Sit.nome));
      U.pips.innerHTML = [0, 1, 2].map((i) => '<i class="' + (m.feitos[i] ? 'ok' : i === m.k ? 'at' : '') + '"></i>').join('');
      U.bolas.innerHTML = Array.from({ length: Math.max(3, m.bolas) }, (_, i) => '<b class="' + (i < m.bolas ? '' : 'vazia') + '"></b>').join('');
      U.desc.textContent = trf(D.desc, ...D.descA);
      U.chuta.textContent = tr(D.tipo === 'chute' ? 'CHUTAR' : D.tipo === 'passe' ? 'PASSAR' : 'CRUZAR');
      U.ef.hidden = D.tipo === 'passe'; U.alto.hidden = !(D.tipo === 'cruz' || (D.tipo === 'passe' && !D.trava));
      U.ef.textContent = m.spin ? tr('Efeito') + (m.spin > 0 ? ' ←' : ' →') : tr('Sem efeito');
      U.alto.textContent = (D.tipo === 'passe' ? (m.alto ? tr('Pelo alto') : tr('Rasteiro')) : (m.alto ? tr('Pelo alto') : tr('Rasteiro'))) + (D.tipo === 'cruz' ? (m.alto ? ' ⤴' : ' ➝') : '');
      if (D.tipo === 'cruz') U.alto.textContent = m.alto ? '⤴ ' + tr('Pelo alto') : '➝ ' + tr('Tenso');
      U.dica.textContent = (matchMedia('(pointer: coarse)').matches ? '' : tr('Setas mira · Espaço força · Q/E efeito · Esc sai') + ' · ') + tr('Arraste para mirar · segure para a força · solte para chutar');
    }
    // ---- a MIRA 3D: um aro com uma cruz (no gol: de pé; no chão: deitado; no alto: deitado na altura, com uma haste até o chão)
    function criarMira() {
      const g = new THREE.Group(), mm = matB('#ffd23a', 0.95), anel = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.26, 28), mm); anel.renderOrder = 8; g.add(anel);
      for (const [w, h] of [[0.6, 0.04], [0.04, 0.6]]) { const c = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mm); c.renderOrder = 8; g.add(c); }
      const haste = new THREE.Mesh(new THREE.BoxGeometry(0.025, 1, 0.025), matB('#ffd23a', 0.55)); grupo().add(haste);
      const sombra = new THREE.Mesh(new THREE.RingGeometry(0.16, 0.22, 24), matB('#2a1206', 0.45)); sombra.rotation.x = -Math.PI / 2; sombra.renderOrder = 4; grupo().add(sombra);
      for (const o of g.children) { o.material.depthTest = false; }
      grupo().add(g); return { g, haste, sombra };
    }
    function porMira(m, u, y, v) {
      const D = m.D, R = m.ret, p = W(u, D.mira.plano === 'gol' ? 0.02 : v);
      R.g.visible = true; R.g.position.set(p.x, Y0 + (D.mira.plano === 'chao' ? 0.03 : y), p.z);
      { const b = D.bola, dd = Math.hypot(u - b.u, (D.mira.plano === 'gol' ? 0 : v) - b.v), k = clampN(dd / 8, 1, 2.6); R.g.scale.set(k, k, k); R.sombra.scale.set(k, k, k); }   // de longe a mira cresce (senão some na tela)
      if (D.mira.plano === 'gol') { R.g.rotation.set(0, 0, 0); R.haste.visible = false; R.sombra.visible = false; }
      else { R.g.rotation.set(-Math.PI / 2, 0, 0); const alto = D.mira.plano === 'alto'; R.haste.visible = alto; R.sombra.visible = alto; if (alto) { R.haste.scale.y = y; R.haste.position.set(p.x, Y0 + y / 2, p.z); R.sombra.position.set(p.x, Y0 + 0.025, p.z); } }
    }
    // ---- entrada: arrastar (mira), segurar o botão (força), botões e teclado
    function ligarEntrada(m) {
      const U = m.U;
      let drag = null;
      U.arr.onpointerdown = (e) => { if (m.e !== 'mira' && m.e !== 'carrega') return; drag = { id: e.pointerId, x: e.clientX, y: e.clientY }; try { U.arr.setPointerCapture(e.pointerId); } catch (er) { /* ok */ } };
      U.arr.onpointermove = (e) => { if (!drag || e.pointerId !== drag.id) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.x = e.clientX; drag.y = e.clientY; moverMira(m, dx, dy); };
      U.arr.onpointerup = U.arr.onpointercancel = (e) => { if (drag && e.pointerId === drag.id) drag = null; };
      const solta = () => { if (m.e === 'carrega') soltar(m); };
      U.chuta.onpointerdown = (e) => { e.preventDefault(); try { U.chuta.setPointerCapture(e.pointerId); } catch (er) { /* ok */ } if (m.e === 'mira') { m.e = 'carrega'; m.t = 0; m.fase = Math.random() * 6.28; } };
      U.chuta.onpointerup = U.chuta.onpointercancel = (e) => { e.preventDefault(); solta(); };
      U.ef.onclick = () => { if (m.e !== 'mira') return; m.spin = m.spin === 0 ? 1 : m.spin === 1 ? -1 : 0; if (typeof Som !== 'undefined' && Som.clique) Som.clique(); atualizarHud(m); };
      U.alto.onclick = () => { if (m.e !== 'mira') return; m.alto = !m.alto; if (typeof Som !== 'undefined' && Som.clique) Som.clique(); atualizarHud(m); };
      U.sair.onclick = () => sairTreino(m);
      m.teclaFn = (e) => {
        if (!P.mg || document.getElementById('anuncioTela') && !document.getElementById('anuncioTela').hidden) return;
        const desce = e.type === 'keydown', c = e.code;
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyA', 'KeyD', 'KeyW', 'KeyS'].includes(c)) { e.preventDefault(); e.stopPropagation(); m.tecla[c] = desce; return; }
        if (c === 'Space' || c === 'Enter') { e.preventDefault(); e.stopPropagation(); if (e.repeat) return; if (!U.card.hidden && desce) { const b = U.card.querySelector('button'); if (b) b.click(); return; } if (desce && m.e === 'mira') { m.e = 'carrega'; m.t = 0; m.fase = Math.random() * 6.28; } else if (!desce) solta(); return; }
        if (desce && (c === 'KeyQ' || c === 'KeyE') && m.e === 'mira' && m.D.tipo !== 'passe') { e.preventDefault(); m.spin = c === 'KeyQ' ? (m.spin === 1 ? 0 : 1) : (m.spin === -1 ? 0 : -1); atualizarHud(m); }
        if (desce && c === 'Tab' && m.e === 'mira' && !U.alto.hidden) { e.preventDefault(); U.alto.click(); }
        if (desce && c === 'Escape') { e.preventDefault(); sairTreino(m); }
      };
      window.addEventListener('keydown', m.teclaFn, true); window.addEventListener('keyup', m.teclaFn, true);
    }
    function desligarEntrada(m) { if (m.teclaFn) { window.removeEventListener('keydown', m.teclaFn, true); window.removeEventListener('keyup', m.teclaFn, true); } }
    // arrastar: o ponto da mira anda na tela como o dedo (na distância em que ela está)
    function moverMira(m, dx, dy) {
      const D = m.D, cam = typeof camera !== 'undefined' ? camera : null, mi = m.mira; if (!cam) return;
      const p = W(mi.u, D.mira.plano === 'gol' ? 0 : mi.v), py = Y0 + (D.mira.plano === 'chao' ? 0 : mi.y), ox = api.OX || 0;
      const dist = Math.hypot(cam.position.x - (p.x + ox), cam.position.y - py, cam.position.z - p.z), k = 2 * Math.tan((cam.fov * Math.PI / 180) / 2) * dist / Math.max(200, innerHeight);
      const fx = Math.cos(cam.rotation.y), fz = 0; void fx; void fz;
      const dir = new THREE.Vector3(); cam.getWorldDirection(dir); const rx = -dir.z, rz = dir.x, rl = Math.hypot(rx, rz) || 1;   // a "direita" da câmera no chão
      if (D.mira.plano === 'gol') { mi.u += (rx / rl) * dx * k; mi.y -= dy * k; }
      else { const fl = Math.hypot(dir.x, dir.z) || 1, kv = k / Math.max(0.3, Math.abs(dir.y) + 0.25); const wx = (rx / rl) * dx * k + (dir.x / fl) * -dy * kv, wz = (rz / rl) * dx * k + (dir.z / fl) * -dy * kv; mi.u += wx; mi.v -= wz; }
      limitarMira(m);
    }
    function limitarMira(m) {
      const D = m.D, mi = m.mira;
      if (D.mira.plano === 'gol') { mi.u = clampN(mi.u, -4.2, 4.2); mi.y = clampN(mi.y, 0.15, 3.4); }
      else { mi.u = clampN(mi.u, -9, 9); mi.v = clampN(mi.v, 0.3, 29.5); if (D.mira.plano === 'alto') mi.y = D.mira.y; }
    }
    function teclasMira(m, dt) {
      const T_ = m.tecla, D = m.D, cam = typeof camera !== 'undefined' ? camera : null; if (!cam) return;
      const h = (T_.ArrowRight || T_.KeyD ? 1 : 0) - (T_.ArrowLeft || T_.KeyA ? 1 : 0), vt = (T_.ArrowUp || T_.KeyW ? 1 : 0) - (T_.ArrowDown || T_.KeyS ? 1 : 0);
      if (!h && !vt) return;
      const px = 260 * dt; moverMira(m, h * px, -vt * px * (D.mira.plano === 'gol' ? 1 : 1));
    }
    function soltar(m) {
      const D = m.D, p = m.p, at = atributos(), off = balancoMira(m), b = D.bola;
      m.inp = { u: m.mira.u + off.u, v: m.mira.v + off.v, y: m.mira.y + off.y, p, spin: D.tipo === 'passe' ? 0 : m.spin, alto: m.alto, erroA: gaussR() * 0.003, erroV: gaussR() * 0.012 };
      if (D.mira.plano === 'gol') m.inp.v = 0; if (D.mira.plano === 'chao') m.inp.y = 0;
      void at; void b;
      m.e = 'corrida'; m.t = 0; S().jog.correndo = true;
      for (const d of m.prev) d.visible = false;
    }
    function gaussR() { let u = 0, v = 0; while (u === 0) u = Math.random(); while (v === 0) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
    // o balanço da mira enquanto segura (em metros, no plano da mira)
    function balancoMira(m) {
      if (m.e !== 'carrega' && m.e !== 'corrida') return { u: 0, v: 0, y: 0 };
      const D = m.D, b = D.bola, at = atributos(), amp = L.balanco(D, m.p, at), dist = Math.hypot(m.mira.u - b.u, (D.mira.plano === 'gol' ? 0 : m.mira.v) - b.v), a = m.tw || 0;
      const s1 = Math.sin(1.7 * a + (m.fase || 0)) * amp * dist, s2 = Math.sin(2.3 * a + 1 + (m.fase || 0) * 0.7) * amp * dist;
      if (D.mira.plano === 'gol') return { u: s1, v: 0, y: s2 };
      const dl = dirLance(m); return { u: s1 * dl.v + s2 * dl.u * 0.5, v: -s1 * dl.u + s2 * dl.v * 0.5, y: 0 };
    }
    // a força "certa" na barra (a marquinha): passe rasteiro = chegar redondo no companheiro / parar no círculo
    function forcaMarca(m) {
      const D = m.D, at = atributos(), mi = m.mira, b = D.bola;
      if (D.tipo === 'passe' && !(D.trava ? D.trava === 'alto' : m.alto)) {
        const d = Math.hypot(mi.u - b.u, mi.v - b.v), vArr = D.crit === 'para' ? 0 : (D.recebe ? D.recebe.ctrl * 0.55 : 3), v0 = Math.sqrt(2 * 2.2 * d + vArr * vArr);
        let lo = 0, hi = 1; for (let i = 0; i < 22; i++) { const q = (lo + hi) / 2; if (L.velDe(D, q, at, false) < v0) lo = q; else hi = q; } return (lo + hi) / 2;
      }
      return L.forcaCerta(D, mi, at, D.tipo === 'passe' ? (D.trava ? D.trava === 'alto' : m.alto) : m.alto);
    }

    // =====================================================================================================================
    // O QUADRO A QUADRO DO TREINO
    // =====================================================================================================================
    function tickMg(dt) {
      const m = P.mg; if (!m) return;
      const D = m.D, U = m.U, T_ = TT(), J = S().jog, b = D.bola;
      m.t += dt; if (m.e !== 'intro' && m.e !== 'semBola' && m.e !== 'fimSit') m.tD += dt;
      if (m.e === 'mira' || m.e === 'carrega') { teclasMira(m, dt); posicionarJogador(m); }
      if (m.e === 'carrega') { m.tw = (m.tw || 0) + dt; m.p = L.forcaEm(D, m.t); if (Math.floor(m.t * 12) !== m.tick12) { m.tick12 = Math.floor(m.t * 12); SOM.carga(m.p); } }
      else if (m.e === 'mira') { m.p = 0; m.tw = 0; }
      // a barra e a marquinha da força certa
      U.barra.style.height = (m.p * 100).toFixed(1) + '%';
      const fm = (m.e === 'mira' || m.e === 'carrega') ? forcaMarca(m) : null; U.marca.style.display = fm != null ? 'block' : 'none'; if (fm != null) U.marca.style.bottom = 'calc(' + (fm * 100).toFixed(1) + '% - 1px)';
      const mostraCtl = m.e === 'mira' || m.e === 'carrega'; U.chuta.disabled = !mostraCtl; U.ef.disabled = U.alto.disabled = m.e !== 'mira';
      // o que anda sozinho: aros, janela, cones, aro do cruzamento, quem corre
      animarProps(m);
      // a mira (com o balanço) e o começo da trajetória
      const off = balancoMira(m);
      if (mostraCtl) {
        porMira(m, m.mira.u + off.u, m.mira.y + off.y, m.mira.v + off.v);
        const inp = { u: m.mira.u + off.u, v: m.mira.v + off.v, y: m.mira.y + off.y, p: m.e === 'carrega' ? m.p : (fm != null ? fm : 0.5), spin: D.tipo === 'passe' ? 0 : m.spin, alto: m.alto };
        if (D.mira.plano === 'gol') inp.v = 0;
        const pts = L.previa(D, inp, atributos(), 0.45 * (D.tipo === 'passe' ? 1.6 : 1));
        m.prev.forEach((d, i) => { const q = pts[Math.min(pts.length - 1, Math.floor((i + 1) / m.prev.length * pts.length * 0.7))]; if (!q || !pts.length) { d.visible = false; return; } const w = W(q.u, q.v); d.position.set(w.x, Y0 + q.y, w.z); d.visible = true; });
      } else { m.ret.g.visible = m.ret.haste.visible = m.ret.sombra.visible = false; for (const d of m.prev) d.visible = false; }
      // ---- a corrida e o chute
      if (m.e === 'corrida') {
        const c = m.corrida, k = clampN(m.t / ATRASO, 0, 1), a = W(c.de.u, c.de.v), z = W(c.ate.u, c.ate.v);
        J.x = lerpN(a.x, z.x, k); J.z = lerpN(a.z, z.z, k); const pb = W(b.u, b.v); J.yaw = J.yawAlvo = Math.atan2(-(pb.z - J.z), pb.x - J.x); J.andando = true; J.correndo = true; J.vel = 4;
        if (k >= 1) { J.andando = false; J.correndo = false; const al = W(m.inp.u, D.mira.plano === 'gol' ? 0 : m.inp.v); J.yaw = J.yawAlvo = Math.atan2(-(al.z - J.z), al.x - J.x); pose(J, 'chute', { estilo: D.tipo === 'passe' ? (m.alto ? 'peito' : 'passe') : D.tipo === 'cruz' ? 'cruz' : m.inp.p > 0.62 ? 'peito' : 'chapa' }); m.e = 'batida'; m.t = 0; }
      } else if (m.e === 'batida') {
        if (m.t >= 0.12) { m.J = L.jogada(D, m.inp, atributos(), m.tD); m.acc = 0; m.e = 'voo'; m.t = 0; SOM.chute(0.5 + 0.6 * m.inp.p); vib(25); m.quiques = 0; }
      } else if (m.e === 'voo' || m.e === 'pos') {
        const Jg = m.J, Bj = Jg.B; m.acc += dt;
        while (m.acc >= L.DT) {
          m.acc -= L.DT;
          if (!Jg.fim) { L.passo(Jg, L.DT); if (Jg.fim) resultado(m); }
          else depois(m, L.DT);
        }
        const giro = Math.hypot(Bj.vu, Bj.vv) * dt * 2.2; porBola(m.B, Bj.u, Bj.y, Bj.v, giro);
        if ((Bj.quicou || 0) > m.quiques) { m.quiques = Bj.quicou; SOM.quica(); }
        atoresNaJogada(m, dt);
        if (m.e === 'pos' && m.t > 2.1) proximo(m);
      }
      cameraMg(m, dt);
      void T_;
    }
    // o que acontece com a bola DEPOIS de decidido (rede, defesa, rebote...): só física, sem decidir mais nada
    function depois(m, dt) {
      const Jg = m.J, Bj = Jg.B, D = m.D;
      if (m.res && m.res.gol) {                                          // dentro do gol: a rede segura
        L.passoBola(Bj, dt); if (Bj.v < -0.95) { Bj.v = -0.95; Bj.vv = Math.abs(Bj.vv) * 0.05; Bj.vu *= 0.6; } if (Bj.y > 2.1) { Bj.y = 2.1; Bj.vy = -Math.abs(Bj.vy) * 0.2; }
        return;
      }
      if (Jg.gk && Jg.gk.pegou && Jg.gk.encaixe) { Bj.u = Jg.gk.u; Bj.v = Jg.gk.v + 0.3; Bj.y = D.goleiro.modo === 'sai' ? 1.15 : 1.0; Bj.voa = Bj.rola = false; return; }
      if (m.res && m.res.dominou) { Bj.voa = false; Bj.rola = false; const r = Jg.rc || Jg.cb; if (r) { Bj.u = lerpN(Bj.u, r.u + 0.3, dt * 6); Bj.v = lerpN(Bj.v, r.v - 0.2, dt * 6); Bj.y = lerpN(Bj.y, L.RB, dt * 8); } return; }
      if (m.res && m.res.cabecada) { L.passoBola(Bj, dt); if (Bj.v < -0.95) { Bj.v = -0.95; Bj.vv = 0; Bj.vu *= 0.6; } return; }
      L.passoBola(Bj, dt);
      if (Bj.v < -1.0 && Math.abs(Bj.u) > 2.6) { Bj.v = -1.0; Bj.vv = Math.abs(Bj.vv) * 0.25; }
      if (Math.abs(Bj.u) > 11.5) { Bj.u = Math.sign(Bj.u) * 11.5; Bj.vu = -Bj.vu * 0.25; }
      if (Bj.v > 30.5) { Bj.v = 30.5; Bj.vv = -Bj.vv * 0.25; }
    }
    // decidiu: mostra, toca o som, mexe em quem participou
    function resultado(m) {
      const Jg = m.J, D = m.D, T_ = TT(), ok = Jg.ok, mot = Jg.motivo, U = m.U, Bj = Jg.B;
      m.res = { ok, mot, gol: mot === 'GOL!' || mot === 'GOL DE CABEÇA!', dominou: mot === 'DOMINOU!', cabecada: mot === 'GOL DE CABEÇA!' };
      if (mot === 'GOL!') SOM.rede(); else if (mot === 'Na trave!') SOM.trave(); else if (mot === 'Defendeu!' || mot === 'O goleiro pegou!' || mot === 'Interceptado!' || mot === 'O zagueiro cortou!' || mot === 'Na barreira!' || mot === 'Nas placas!') SOM.defesa();
      if (ok) { SOM.acerto(); vib([30, 40, 30]); } else { setTimeout(() => SOM.erro(), 250); }
      U.msg.textContent = tr(mot); U.msg.className = 'trMsg on ' + (ok ? 'ok' : 'no');
      m.e = 'pos'; m.t = 0;
      const [Ju, To] = T_.bat, K = T_.gol, Jg_ = S().jog;
      if (m.res.dominou) { if (Jg.altoP) pose(Ju, 'peito'); else pose(Ju, 'dominio'); }
      if (m.res.cabecada) {                                              // cabeceou: a bola vai para o gol (o Paredão saiu ou não alcança)
        pose(Ju, 'cabeceio'); const alvoU = (Math.random() < 0.5 ? -1 : 1) * (0.9 + Math.random() * 1.1), du = alvoU - Bj.u, dv = -Bj.v, d = Math.hypot(du, dv) || 1;
        Bj.vu = du / d * 11; Bj.vv = dv / d * 11; Bj.vy = -1.2; Bj.au = Bj.av = 0; Bj.voa = true; SOM.toque(); setTimeout(() => { if (P.mg === m) SOM.rede(); }, Math.min(1600, d / 11 * 1000));
      }
      if (Jg.corte != null) { const o = m.mkObj[Jg.corte]; if (o && o.npc) pose(o.npc, Bj.y > 1.1 ? 'pula' : 'dominio'); }
      if (ok) { setTimeout(() => { if (P.mg === m) { pose(To, 'aplaude'); if (!D.goleiro) pose(K, 'aplaude'); } }, 300); pose(Jg_, 'comemora', { dur: 1.1 }); }
      else if (!Jg.gk || !Jg.gk.pegou) setTimeout(() => { if (P.mg === m) pose(Jg_, 'lamenta', { dur: 1.2 }); }, 350);
      if (Jg.gk && Jg.gk.pegou && Jg.gk.encaixe && D.goleiro.modo === 'sai') pose(K, Bj.y > 1.6 ? 'pula' : 'encaixe');
    }
    // NPCs na jogada (as posições vêm da lógica)
    function atoresNaJogada(m, dt) {
      const Jg = m.J, D = m.D, T_ = TT(), [Ju, To] = T_.bat, K = T_.gol;
      if (Jg.gk) {
        if (D.goleiro.modo === 'gol') goleiroSegue(K, Jg, dt);
        else { const p = W(Jg.gk.u, Jg.gk.v), dx = p.x - K.x, dz = p.z - K.z, d = Math.hypot(dx, dz); if (d > 0.01 && !(K.pf && (K.pf.tipo === 'encaixe' || K.pf.tipo === 'pula'))) { K.x = p.x; K.z = p.z; K.yawAlvo = Math.atan2(-dz, dx); K.yaw = K.yawAlvo; limparPose(K); K.andando = true; K.correndo = true; K.vel = 4; } else K.andando = false; }
      }
      if (Jg.rc && D.recebe) { const p = W(Jg.rc.u, Jg.rc.v); if (Math.hypot(p.x - Ju.x, p.z - Ju.z) > 0.01) { const dx = p.x - Ju.x, dz = p.z - Ju.z; Ju.x = p.x; Ju.z = p.z; if (D.recebe.corre) { Ju.yawAlvo = Math.atan2(-dz, dx); Ju.andando = true; Ju.correndo = true; Ju.vel = 4; } } else Ju.andando = false; if (Jg.fim) Ju.andando = false; }
      if (Jg.cb && D.cabeca) {
        const p = W(Jg.cb.u, Jg.cb.v), dx = p.x - Ju.x, dz = p.z - Ju.z; if (Math.hypot(dx, dz) > 0.01 && !Jg.fim) { Ju.x = p.x; Ju.z = p.z; if (D.cabeca.corre) { Ju.yawAlvo = Math.atan2(-dz, dx); Ju.andando = true; Ju.correndo = true; Ju.vel = 4.5; } }
        if (Jg.cb.pula > 0.4 && (!Ju.pf || Ju.pf.tipo === 'espera') && !Jg.fim) { Ju.andando = false; const pb = W(m.J.B.u, m.J.B.v); Ju.yawAlvo = Math.atan2(-(pb.z - Ju.z), pb.x - Ju.x); pose(Ju, 'cabeceio', { alto: 0.5 }); }
      }
      if (Jg.mk) Jg.mk.forEach((g, i) => {
        const o = m.mkObj[i], p = W(g.u, g.v); if (!o) return;
        if (o.npc) { const A = o.npc, dx = p.x - A.x, dz = p.z - A.z, d = Math.hypot(dx, dz); A.x = p.x; A.z = p.z; if (d > 0.004 && !Jg.fim) { A.andando = true; A.correndo = true; A.vel = 3.5; A.yawAlvo = Math.atan2(-dz, dx); } else A.andando = false; if (g.pula > 0.5 && (!A.pf || A.pf.tipo === 'espera')) pose(A, 'pula'); }
        else if (o.g) { o.g.position.set(p.x, Y0 + (g.pula > 0.3 ? Math.sin(Math.min(1, g.pula) * Math.PI) * 0.35 : 0), p.z); }
      });
      void To;
    }
    // o que anda sozinho no campo (com o tempo do desafio)
    function animarProps(m) {
      const D = m.D, t = m.tD, T_ = TT(), Ju = T_.bat[0];
      if (m.aros) D.alvos.forEach((a, i) => { const P_ = L.posAlvo(a, t), g = m.aros[i], w = W(P_.u, 0.05); g.position.set(w.x, Y0 + P_.y, w.z); const cd = g.userData.corda, top = L.GOL_H + 0.06 - P_.y - a.r; cd.scale.y = Math.max(0.05, top); cd.position.y = a.r + top / 2; if (m.J && m.J.alvoHit === a && m.res) { g.rotation.x += 0.15; } });
      if (m.placas) {
        const P_ = L.posJanela(D.janela, t), w = D.janela.w, h = D.janela.h, GW = L.GOL_W, GH = L.GOL_H, u0 = P_.u - w / 2, u1 = P_.u + w / 2, y0 = P_.y - h / 2, y1 = P_.y + h / 2;
        const rects = [[-GW, u0, 0, GH], [u1, GW, 0, GH], [u0, u1, 0, y0], [u0, u1, y1, GH]];
        rects.forEach(([a, bq, c, d], i) => { const pl = m.placas[i], lw = Math.max(0.001, bq - a), lh = Math.max(0.001, d - c), wp = W((a + bq) / 2, -0.06); pl.visible = lw > 0.01 && lh > 0.01; pl.scale.set(lw, lh, 1); pl.position.set(wp.x, Y0 + (c + d) / 2, wp.z); });
      }
      if (m.conesObj) { const C = L.posCones(D.cones, t); [C.a, C.b].forEach((c, i) => { const w = W(c.u, c.v); m.conesObj[i].position.set(w.x, Y0 + 0.18, w.z); }); }
      if (m.aroObj) { const P_ = L.posAro(D.aro, t), w = W(P_.u, P_.v), b = W(D.bola.u, D.bola.v); m.aroObj.position.set(w.x, Y0 + P_.y, w.z); m.aroObj.rotation.y = Math.atan2(b.x - w.x, b.z - w.z); const ps = m.aroObj.userData.poste, hgt = P_.y - D.aro.r; ps.scale.y = hgt; ps.position.y = -D.aro.r - hgt / 2; }
      // quem corre antes do chute (Juninho no passe/cruzamento "correndo")
      if (!m.J || m.e === 'mira' || m.e === 'carrega' || m.e === 'corrida' || m.e === 'batida' || m.e === 'intro') {
        const C = (D.recebe && D.recebe.corre) || (D.cabeca && D.cabeca.corre);
        if (C && m.e !== 'intro') { const p0 = L.posCorre(C, t), p1 = L.posCorre(C, t + 0.05), w = W(p0.u, p0.v), w1 = W(p1.u, p1.v); const mv = Math.hypot(w1.x - w.x, w1.z - w.z) > 0.01; Ju.x = w.x; Ju.z = w.z; Ju.andando = mv; Ju.correndo = mv; Ju.vel = 4; if (mv) { Ju.yawAlvo = Math.atan2(-(w1.z - w.z), w1.x - w.x); if (Ju.pf && Ju.pf.tipo === 'espera') limparPose(Ju); } else if (!Ju.pf) { pose(Ju, 'espera'); olharP(Ju, D.bola.u, D.bola.v); } }
      }
    }
    // ---- a câmera: atrás da bola, por cima do ombro; no voo acompanha a bola
    function cameraMg(m, dt) {
      const s = S(), D = m.D, b = D.bola, dl = dirLance(m), ru = dl.v, rv = -dl.u;
      const back = D.tipo === 'chute' ? 4.6 : 5.4, alt = D.tipo === 'chute' ? 2.55 : 3.3;   // do outro lado da bola (o jogador fica do lado do pé de apoio): ele não tampa a mira
      let cu = b.u - dl.u * back - ru * 1.0, cv = b.v - dl.v * back - rv * 1.0;
      const cu2 = clampN(cu, -8.3, 8.3), cv2 = clampN(cv, 0.8, 29.2), sobra = Math.hypot(cu - cu2, cv - cv2); cu = cu2; cv = cv2;   // nunca atrás do alambrado: encosta na linha e sobe
      const pc = W(cu, cv), altF = alt + Math.min(2.2, sobra * 0.7);
      let foco;
      if (D.mira.plano === 'gol') foco = { u: lerpN(b.u, 0, 0.72), v: lerpN(b.v, 0, 0.72), y: 1.05 };
      else { const alvo = D.mira; foco = { u: lerpN(b.u, alvo.u, 0.6), v: lerpN(b.v, alvo.v, 0.6), y: 0.9 }; }
      if (m.J && (m.e === 'voo' || m.e === 'pos')) { const Bj = m.J.B, k = 0.35; foco = { u: lerpN(foco.u, Bj.u, k), v: lerpN(foco.v, Bj.v, k), y: lerpN(foco.y, Bj.y, k) }; }
      const pf = W(foco.u, foco.v), alvoC = { px: pc.x, py: Y0 + altF, pz: pc.z, tx: pf.x, ty: Y0 + foco.y, tz: pf.z };
      if (!m.cam || m.camSnap) { m.cam = Object.assign({}, alvoC); m.camSnap = false; }
      else { const k = 1 - Math.exp(-dt * 5); for (const q in alvoC) m.cam[q] += (alvoC[q] - m.cam[q]) * k; }
      s.camCena = m.cam;
    }
    // ---- o que vem depois do resultado: outra bola, outro desafio, o fim
    function proximo(m) {
      const U = m.U; U.msg.className = 'trMsg';
      const T_ = TT(); for (const A of [T_.gol].concat(T_.bat)) { if (A.pf && A.pf.tipo === 'mergulho') limparPose(A); }
      if (m.res.ok) {
        m.feitos[m.k] = true; SOM.apito();
        if (m.k < 2) { U.msg.textContent = trf('Desafio {0} feito!', m.k + 1); U.msg.className = 'trMsg on ouro'; m.e = 'intervalo'; m.t = 0; setTimeout(() => { if (P.mg === m) { U.msg.className = 'trMsg'; montarDesafio(m, m.k + 1); m.camSnap = true; } }, 1200); return; }
        concluir(m); return;
      }
      m.bolas--; atualizarHud(m);
      if (m.bolas <= 0) { semBola(m); return; }
      reporBola(m);
    }
    function reporBola(m) {
      const D = m.D; m.J = null; m.res = null; m.e = 'mira'; m.t = 0;
      porBola(m.B, D.bola.u, L.RB, D.bola.v); papeis(m); posicionarJogador(m, true); limparPose(S().jog);
    }
    // sem bola: o anúncio de 15 s (+1) ou de 30 s (+3), ou desiste
    function semBola(m) {
      const U = m.U; m.e = 'semBola';
      U.card.hidden = false;
      U.card.innerHTML = '<h3>' + esc(tr('Acabaram as bolas!')) + '</h3><p>' + esc(tr('Faltou pouco. Quer mais bola?')) + '</p>' +
        '<div class="trBt" style="flex-direction:column;align-items:center"><button type="button" class="pxBtn pxPrim" data-a="15">' + esc(tr('Anúncio de 15 s: +1 bola')) + '</button>' +
        '<button type="button" class="pxBtn pxPrim" data-a="30">' + esc(tr('Anúncio de 30 s: +3 bolas')) + '</button><button type="button" class="pxBtn" data-a="sai">' + esc(tr('Desistir')) + '</button></div><p class="trAv"></p>';
      let ocupado = false;
      U.card.onclick = async (e) => {
        const bt = e.target.closest && e.target.closest('button'); if (!bt || ocupado) return; if (typeof Som !== 'undefined' && Som.clique) Som.clique();
        const a = bt.dataset.a;
        if (a === 'sai') { U.card.hidden = true; terminar(m, 'falhou'); return; }
        ocupado = true; const seg = +a, mais = seg === 15 ? 1 : 3;
        let visto = false;
        try { visto = typeof Anuncios !== 'undefined' && await Anuncios.filme(seg, { nome: 'treino-' + seg, tit: tr(mais === 1 ? 'Bola extra' : 'Bolas extras'), txt: tr(mais === 1 ? 'Assista até o fim para ganhar a bola.' : 'Assista até o fim para ganhar as 3 bolas.'), fim: tr('Pronto! Bola na marca.') }); } catch (er) { visto = false; }
        ocupado = false;
        if (P.mg !== m) return;
        if (!visto) { const av = U.card.querySelector('.trAv'); if (av) av.textContent = tr('Nenhum anúncio disponível agora. Tenta de novo daqui a pouco.'); return; }
        U.card.hidden = true; m.bolas += mais; atualizarHud(m); reporBola(m);
      };
    }
    // fechou os 3: +0,1 na habilidade (só da primeira vez de cada situação) e a turma comemora
    function concluir(m) {
      const p = dados(), Sit = m.Sit, U = m.U, T_ = TT(); let txt2 = '';
      if (!m.rep && p.prog[Sit.tipo] === Sit.n) {
        const at = atributos(), nome = Sit.atrib, novo = Math.min(10, Math.round(((at[nome] || 5) + 0.1) * 10) / 10);
        at[nome] = novo; p.ganhos[nome] = Math.round(((p.ganhos[nome] || 0) + 0.1) * 10) / 10; p.prog[Sit.tipo] = Sit.n + 1;
        txt2 = trf('+0,1 em {0} (agora {1})', tr(L.NOME_ATRIB[nome]), virg(novo)); gravar();
        try { if (api.ganhoNaTela) api.ganhoNaTela(txt2); } catch (e) { /* sem efeito */ }
      }
      SOM.festa(); vib([40, 50, 40, 50, 120]);
      for (const A of T_.bat) pose(A, 'comemora', { dur: 2.2 }); pose(T_.gol, 'aplaude', { dur: 2.2 }); pose(S().jog, 'comemora', { dur: 2.2 });
      m.e = 'fimSit'; U.card.hidden = false;
      U.card.innerHTML = '<h3>' + esc(tr('SITUAÇÃO CONCLUÍDA!')) + '</h3><p>' + esc(trf('Situação {0}/30: {1}', Sit.n + 1, tr(Sit.nome))) + '</p>' + (txt2 ? '<p class="trPr">' + esc(txt2) + '</p>' : '<p class="trPr">' + esc(tr('Repetição: sem ganhar habilidade.')) + '</p>') +
        '<div class="trBt"><button type="button" class="pxBtn pxPrim">' + esc(tr('Continuar')) + '</button></div>';
      U.card.onclick = (e) => { if (e.target.closest && e.target.closest('button')) { if (typeof Som !== 'undefined' && Som.clique) Som.clique(); U.card.hidden = true; terminar(m, 'ok'); } };
    }
    function terminar(m, como) { if (m.acabou) return; m.acabou = true; if (m.fim) m.fim(como); }
    async function sairTreino(m) {
      if (m.e === 'semBola' || m.e === 'fimSit' || m.saindo) return; m.saindo = true;
      const U = m.U, antes = m.e; m.e = 'pausa';
      U.card.hidden = false;
      U.card.innerHTML = '<p>' + esc(tr('Sair do treino? Conta como um dos 2 de hoje.')) + '</p><div class="trBt"><button type="button" class="pxBtn" data-r="1">' + esc(tr('Sair')) + '</button><button type="button" class="pxBtn pxPrim" data-r="0">' + esc(tr('Continuar')) + '</button></div>';
      U.card.onclick = (e) => { const b = e.target.closest && e.target.closest('button'); if (!b) return; if (typeof Som !== 'undefined' && Som.clique) Som.clique(); U.card.hidden = true; m.saindo = false; if (b.dataset.r === '1') terminar(m, 'saiu'); else m.e = antes === 'carrega' ? 'mira' : antes; };
    }

    // =====================================================================================================================
    // tick / limpar
    // =====================================================================================================================
    function tick(dt) {
      const s = S(), T_ = TT(); if (!s || !T_ || s.dentro) return;
      if (!P.luz) montarLuzes();
      tickLuzes();
      if (P.mg) { tickMg(dt); return; }
      if (T_.pausa) {                                                     // a turma não está (foi para casa / na chuva): a bola some, o treino recomeça depois
        if (P.dr) { P.dr = null; T_.bola.mesh.visible = false; T_.bola.sombra.visible = false; for (const A of [T_.gol].concat(T_.bat)) limparPose(A); }
        return;
      }
      if (P.parado) return;                                               // conversando com o jogador
      if (!P.dr) iniciarDrill(0);
      tickDrill(dt);
    }
    function limpar() {
      const m = P.mg; if (m) { desligarEntrada(m); terminar(m, 'saiu'); if (m.U) m.U.el.remove(); }
      if (P.uiCard) { P.uiCard.el.remove(); P.uiCard = null; }
      const h = document.getElementById('trHud'); if (h) h.remove();
      P.mg = null; P.dr = null;
      for (const k in MATS) { MATS[k].dispose(); delete MATS[k]; }
    }
    return { alvos, tick, limpar, _P: P, _L: L, _f: { treinar, conversar, cartao, dados, iniciarDrill, pose, limparPose, montarDesafio, tickMg, soltar } };
  }

  window.FutebolJS.registrarFase({ id: 'treino', nome: 'Treino do Nonato', nucleoMinimo: '6.6.16', iniciar: async () => {}, criar, _logica: LOGICA });

})();
