/* =====================================================================
   FUTEBOL JS · cinema.js · O CINEMA QUE PAGA (arquivo SEPARADO, como pizzaria.js e academia.js)
   ---------------------------------------------------------------------
   - (6.6.5) O HERICK MORA COM A FERNANDA: sai de casa a tempo de chegar quando o cinema abre (6h) e, quando fecha (22h), volta andando
     para casa (rotaHerick/herickNoCaminho/tickHerickCaminho; a posição sai da hora). Antes da primeira conversa ele vai para o ponto da
     calçada na frente do cinema; depois, entra pela porta. Andando, ele está em S.atoresExtra (carros, pessoas e jogador o respeitam).
   - Registrado com FutebolJS.registrarFase({ id: 'cinema' }) só para o jogo saber baixar o arquivo; NÃO roda como fase.
     A cidade (cidade.js) baixa em segundo plano e chama criar(api) (api = apiCinema() da cidade). O interior vem do interiores.js
     (R.cinema: bilheteria, lugar do Herick, cordas, segurança, fileiras, tela e feixe do projetor).
   - O HERICK (o desenvolvedor do jogo, com o modelo do professor do Super Lan Master, de colete vermelho e o resto preto):
       · antes da primeira conversa ele fica na frente do cinema com uma exclamação; conversando, explica o cinema (o jogo não obriga
         ninguém a ver anúncio e não tem como gastar dinheiro de verdade; o cinema PAGA para você ver um "filme", que é um anúncio, e
         lá dentro o tempo do jogo não passa) e entra para esperar no saguão, do lado da bilheteria;
       · lá dentro: 15 frases engraçadinhas (HERICK_PAPOS) e a venda dos bilhetes.
   - A JOANA, da bilheteria: 3 frases e a venda dos bilhetes. O SEU WILSON, o segurança, fica entre a ENTRADA e a SAÍDA da sala.
   - AS CORDAS (só o jogador esbarra nelas): a da ENTRADA só abre quando ele vai para a sessão com o bilhete; a da SAÍDA só deixa
     passar de dentro da sala para o saguão. Chegando perto de uma corda fechada pelo saguão, o segurança avisa.
   - A SESSÃO: o personagem passa pela entrada, anda até uma poltrona vazia e senta; o anúncio começa (Anuncios.filme do jogo.js)
     e, no fim, os fakes entram na conta. Dá para emendar outro (15 s ou 30 s) sem voltar à bilheteria. "Não, obrigado": levanta.
   - BILHETES: 15 s = +30 fakes · 30 s = +100 fakes. O cinema abre das 6h às 22h (a cidade cuida da porta e do relógio parado).
   - Salva em historia.cidade: cinema = { conheceu, vistos, ganhos, papoH, papoJ }.
   ===================================================================== */
(function () {
  'use strict';

  // ------------------------------------------------------------------ textos (pt → en, es, it, fr)
  const TRAD = {
    'Herick': ['Herick', 'Herick', 'Herick', 'Herick'], 'Joana': ['Joana', 'Joana', 'Joana', 'Joana'], 'Seu Wilson': ['Mr. Wilson', 'Don Wilson', 'Signor Wilson', 'M. Wilson'],
    'Falar com o Herick': ['Talk to Herick', 'Hablar con Herick', 'Parla con Herick', 'Parler à Herick'],
    'Falar com a Joana': ['Talk to Joana', 'Hablar con Joana', 'Parla con Joana', 'Parler à Joana'],
    'Bilhete de 15 s (+{0} fakes)': ['15 s ticket (+{0} fakes)', 'Boleto de 15 s (+{0} fakes)', 'Biglietto da 15 s (+{0} fakes)', 'Billet de 15 s (+{0} fakes)'],
    'Bilhete de 30 s (+{0} fakes)': ['30 s ticket (+{0} fakes)', 'Boleto de 30 s (+{0} fakes)', 'Biglietto da 30 s (+{0} fakes)', 'Billet de 30 s (+{0} fakes)'],
    'Só passando': ['Just passing by', 'Solo de paso', 'Passavo solo di qui', 'Je passais juste'],
    'Quer ver mais um?': ['Want to watch another one?', '¿Quieres ver otro?', 'Vuoi vederne un altro?', 'Tu veux en voir un autre ?'],
    'Mais um de 15 s (+{0} fakes)': ['Another 15 s (+{0} fakes)', 'Otro de 15 s (+{0} fakes)', 'Un altro da 15 s (+{0} fakes)', 'Encore un de 15 s (+{0} fakes)'],
    'Mais um de 30 s (+{0} fakes)': ['Another 30 s (+{0} fakes)', 'Otro de 30 s (+{0} fakes)', 'Un altro da 30 s (+{0} fakes)', 'Encore un de 30 s (+{0} fakes)'],
    'Não, obrigado': ['No, thanks', 'No, gracias', 'No, grazie', 'Non, merci'],
    '+{0} fakes pelo filme!': ['+{0} fakes for the movie!', '¡+{0} fakes por la película!', '+{0} fakes per il film!', '+{0} fakes pour le film !'],
    'Nenhum anúncio disponível agora. Tenta de novo daqui a pouco.': ['No ad available right now. Try again in a bit.', 'No hay anuncios disponibles ahora. Inténtalo en un rato.', 'Nessun annuncio disponibile ora. Riprova tra poco.', 'Aucune pub disponible pour l’instant. Réessaie dans un moment.'],
    'A saída é pelo corredor da direita.': ['The exit is through the right-hand passage.', 'La salida es por el pasillo de la derecha.', 'L’uscita è dal corridoio a destra.', 'La sortie est par le couloir de droite.'],
    'Todas as poltronas estão ocupadas agora.': ['All the seats are taken right now.', 'Todas las butacas están ocupadas ahora.', 'Tutte le poltrone sono occupate ora.', 'Tous les fauteuils sont pris pour l’instant.'],
    // a primeira conversa, na frente do cinema
    'Opa! Tudo certo? Eu sou o Herick.': ['Hey! All good? I’m Herick.', '¡Hola! ¿Todo bien? Soy Herick.', 'Ehi! Tutto bene? Sono Herick.', 'Salut ! Ça va ? Moi, c’est Herick.'],
    'Eu sou o desenvolvedor deste jogo. É, este mesmo que você está jogando agora.': ['I’m the developer of this game. Yep, the very one you’re playing right now.', 'Soy el desarrollador de este juego. Sí, este mismo que estás jugando ahora.', 'Sono lo sviluppatore di questo gioco. Sì, proprio quello che stai giocando adesso.', 'Je suis le développeur de ce jeu. Oui, celui-là même auquel tu joues en ce moment.'],
    'Eu fiz o jogo de um jeito que nenhum anúncio é obrigatório e ninguém consegue gastar dinheiro de verdade aqui dentro.': ['I made the game so that no ad is ever mandatory and nobody can spend real money in here.', 'Hice el juego de forma que ningún anuncio sea obligatorio y nadie pueda gastar dinero real aquí dentro.', 'Ho fatto il gioco in modo che nessuna pubblicità sia obbligatoria e nessuno possa spendere soldi veri qui dentro.', 'J’ai fait le jeu pour qu’aucune pub ne soit obligatoire et que personne ne puisse dépenser de vrai argent ici.'],
    'Só que... eu ainda preciso de um jeito de ganhar dinheiro na vida real, né? O café não se paga sozinho.': ['But... I still need a way to make money in real life, right? Coffee doesn’t pay for itself.', 'Pero... todavía necesito una forma de ganar dinero en la vida real, ¿no? El café no se paga solo.', 'Però... mi serve comunque un modo per guadagnare nella vita reale, no? Il caffè non si paga da solo.', 'Mais... il me faut quand même un moyen de gagner de l’argent dans la vraie vie, non ? Le café ne se paie pas tout seul.'],
    'Então este cinema funciona diferente: em vez de você pagar o ingresso, o cinema te PAGA para assistir a um filme.': ['So this cinema works differently: instead of you paying for the ticket, the cinema PAYS you to watch a movie.', 'Así que este cine funciona diferente: en vez de que tú pagues la entrada, el cine te PAGA por ver una película.', 'Quindi questo cinema funziona al contrario: invece di pagare il biglietto, è il cinema a PAGARE te per guardare un film.', 'Alors ce cinéma fonctionne autrement : au lieu de payer ta place, c’est le cinéma qui te PAIE pour regarder un film.'],
    'O "filme", no caso, é um anúncio. Você escolhe se quer ver, quantos quer ver, e ganha fakes por cada um.': ['The "movie", in this case, is an ad. You choose if you want to watch, how many, and you earn fakes for each one.', 'La "película", en este caso, es un anuncio. Tú eliges si quieres verla, cuántas, y ganas fakes por cada una.', 'Il "film", in questo caso, è una pubblicità. Scegli tu se guardarla, quante, e guadagni fakes per ognuna.', 'Le "film", ici, c’est une pub. Tu choisis si tu veux la voir, combien, et tu gagnes des fakes pour chacune.'],
    'E relaxa: lá dentro o tempo do jogo não passa. A sua rotina não fica atrapalhada.': ['And relax: inside, the game clock doesn’t move. Your routine won’t be disturbed.', 'Y tranquilo: adentro el tiempo del juego no pasa. Tu rutina no se ve afectada.', 'E tranquillo: lì dentro il tempo del gioco non scorre. La tua routine non viene disturbata.', 'Et pas d’inquiétude : à l’intérieur, le temps du jeu ne passe pas. Ta routine n’est pas dérangée.'],
    'Assim eu consigo manter o jogo, sem você gastar nenhum real e sem ninguém te obrigar a ver anúncio.': ['That way I can keep the game going, without you spending a cent and without anyone forcing you to watch ads.', 'Así puedo mantener el juego, sin que gastes ni un centavo y sin que nadie te obligue a ver anuncios.', 'Così posso mantenere il gioco, senza che tu spenda un centesimo e senza che nessuno ti obblighi a vedere pubblicità.', 'Comme ça je peux faire vivre le jeu, sans que tu dépenses un centime et sans que personne ne t’oblige à regarder des pubs.'],
    'Achei justo!': ['Sounds fair!', '¡Me parece justo!', 'Mi sembra giusto!', 'Ça me paraît juste !'],
    'Então eu ganho para ver anúncio?': ['So I get paid to watch ads?', '¿Entonces me pagan por ver anuncios?', 'Quindi vengo pagato per guardare pubblicità?', 'Donc on me paie pour regarder des pubs ?'],
    'Valeu! É assim que eu durmo tranquilo.': ['Thanks! That’s how I sleep well at night.', '¡Gracias! Así duermo tranquilo.', 'Grazie! È così che dormo tranquillo.', 'Merci ! C’est comme ça que je dors tranquille.'],
    'Exatamente! O único lugar da cidade em que ver propaganda dá dinheiro.': ['Exactly! The only place in town where watching ads makes you money.', '¡Exacto! El único lugar de la ciudad donde ver publicidad da dinero.', 'Esatto! L’unico posto in città dove guardare la pubblicità fa guadagnare.', 'Exactement ! Le seul endroit de la ville où regarder de la pub rapporte.'],
    'Eu vou ficar lá dentro, do lado da bilheteria. Quando quiser um bilhete, fala comigo ou com a Joana.': ['I’ll be inside, next to the ticket booth. Whenever you want a ticket, talk to me or to Joana.', 'Voy a estar adentro, al lado de la taquilla. Cuando quieras un boleto, habla conmigo o con Joana.', 'Starò dentro, accanto alla biglietteria. Quando vuoi un biglietto, parla con me o con Joana.', 'Je serai à l’intérieur, à côté de la billetterie. Quand tu veux un billet, parle-moi ou à Joana.'],
    // as 15 frases lá dentro
    'Pronto pra me dar o dinheirinho do café?': ['Ready to give me my coffee money?', '¿Listo para darme la platita del café?', 'Pronto a darmi i soldini del caffè?', 'Prêt à me donner l’argent du café ?'],
    'Cada anúncio que você vê é um pãozinho na minha mesa. Obrigado, de coração.': ['Every ad you watch is a bread roll on my table. Thank you, from the bottom of my heart.', 'Cada anuncio que ves es un panecito en mi mesa. Gracias, de corazón.', 'Ogni pubblicità che guardi è un panino sulla mia tavola. Grazie di cuore.', 'Chaque pub que tu regardes, c’est un petit pain sur ma table. Merci du fond du cœur.'],
    'Ah, voltou! Sabia que você não resistia a um bom comercial.': ['Oh, you’re back! I knew you couldn’t resist a good commercial.', '¡Ah, volviste! Sabía que no resistirías a un buen comercial.', 'Ah, sei tornato! Sapevo che non resistevi a una bella pubblicità.', 'Ah, te revoilà ! Je savais que tu ne résisterais pas à une bonne pub.'],
    'Hoje o filme é um clássico: "Compre Agora". Dizem que o final é imprevisível.': ['Today’s movie is a classic: "Buy Now". They say the ending is unpredictable.', 'Hoy la película es un clásico: "Compra Ya". Dicen que el final es impredecible.', 'Oggi il film è un classico: "Compra Subito". Dicono che il finale sia imprevedibile.', 'Aujourd’hui, le film est un classique : "Achetez Maintenant". On dit que la fin est imprévisible.'],
    'Relaxa, aqui dentro o relógio não anda. Já a minha conta de luz anda bastante.': ['Relax, the clock doesn’t move in here. My electricity bill, on the other hand, moves a lot.', 'Tranquilo, aquí dentro el reloj no avanza. Mi factura de luz, en cambio, avanza bastante.', 'Tranquillo, qui dentro l’orologio non va avanti. La mia bolletta della luce invece sì, e parecchio.', 'Pas de stress, ici l’horloge n’avance pas. Ma facture d’électricité, elle, avance beaucoup.'],
    'Você assiste, eu programo mais coisa. Parceria justa, né?': ['You watch, I code more stuff. Fair partnership, right?', 'Tú miras, yo programo más cosas. Sociedad justa, ¿no?', 'Tu guardi, io programmo altre cose. Una collaborazione giusta, no?', 'Tu regardes, je code plus de trucs. Partenariat équitable, non ?'],
    'Pode sentar onde quiser. Menos no meu lugar. Brincadeira... ou não.': ['Sit wherever you want. Except my seat. Just kidding... or not.', 'Siéntate donde quieras. Menos en mi lugar. Es broma... o no.', 'Siediti dove vuoi. Tranne al mio posto. Scherzo... o forse no.', 'Assieds-toi où tu veux. Sauf à ma place. Je rigole... ou pas.'],
    'Já pensou em virar crítico de anúncio? Experiência você tem de sobra.': ['Ever thought of becoming an ad critic? You’ve got plenty of experience.', '¿Pensaste en volverte crítico de anuncios? Experiencia te sobra.', 'Hai mai pensato di diventare critico di pubblicità? L’esperienza non ti manca.', 'Tu as déjà pensé à devenir critique de pubs ? De l’expérience, tu en as à revendre.'],
    'Este jogo foi feito com muito amor e pouquíssimas horas de sono.': ['This game was made with lots of love and very few hours of sleep.', 'Este juego se hizo con mucho amor y poquísimas horas de sueño.', 'Questo gioco è stato fatto con tanto amore e pochissime ore di sonno.', 'Ce jeu a été fait avec beaucoup d’amour et très peu d’heures de sommeil.'],
    'Se o anúncio for chato, reclama com ele, não comigo.': ['If the ad is boring, complain to it, not to me.', 'Si el anuncio es aburrido, quéjate con él, no conmigo.', 'Se la pubblicità è noiosa, lamentati con lei, non con me.', 'Si la pub est ennuyeuse, plains-toi à elle, pas à moi.'],
    'A pipoca é por conta da casa. Mentira, é por conta da sua imaginação.': ['The popcorn is on the house. Just kidding, it’s on your imagination.', 'Las palomitas corren por cuenta de la casa. Mentira, corren por cuenta de tu imaginación.', 'I popcorn li offre la casa. Scherzo, li offre la tua immaginazione.', 'Le pop-corn est offert par la maison. Je rigole, il est offert par ton imagination.'],
    'Cada 30 segundos seus valem ouro. Ou melhor: valem 100 fakes.': ['Every 30 seconds of yours is worth gold. Or rather: worth 100 fakes.', 'Cada 30 segundos tuyos valen oro. O mejor: valen 100 fakes.', 'Ogni tuo mezzo minuto vale oro. Anzi: vale 100 fakes.', 'Chacune de tes 30 secondes vaut de l’or. Ou plutôt : 100 fakes.'],
    'Fiz um cinema sem fila nenhuma. O segurança é só para dar um charme.': ['I made a cinema with no line at all. The security guard is just for style.', 'Hice un cine sin ninguna fila. El guardia es solo para darle encanto.', 'Ho fatto un cinema senza nessuna coda. La guardia è solo per fare scena.', 'J’ai fait un cinéma sans aucune file d’attente. Le vigile, c’est juste pour le style.'],
    'Quanto mais você assiste, mais rápido sai a próxima atualização. Pressão nenhuma, hein?': ['The more you watch, the sooner the next update comes out. No pressure, huh?', 'Cuanto más miras, más rápido sale la próxima actualización. Sin presión, ¿eh?', 'Più guardi, prima esce il prossimo aggiornamento. Nessuna pressione, eh?', 'Plus tu regardes, plus vite sort la prochaine mise à jour. Aucune pression, hein ?'],
    'Bem-vindo de volta ao único cinema que paga você para ver filme ruim.': ['Welcome back to the only cinema that pays you to watch bad movies.', 'Bienvenido de nuevo al único cine que te paga por ver películas malas.', 'Bentornato nell’unico cinema che ti paga per vedere film brutti.', 'Re-bienvenue dans le seul cinéma qui te paie pour regarder de mauvais films.'],
    'Quinze segundinhos. Já ajuda!': ['Fifteen little seconds. It helps!', 'Quince segunditos. ¡Ya ayuda!', 'Quindici secondini. Già aiuta!', 'Quinze petites secondes. Ça aide déjà !'],
    'Trinta segundos! Assim que eu gosto.': ['Thirty seconds! That’s what I like.', '¡Treinta segundos! Así me gusta.', 'Trenta secondi! Così mi piace.', 'Trente secondes ! C’est comme ça que j’aime.'],
    'Tranquilo. O cinema não vai fugir.': ['No worries. The cinema isn’t going anywhere.', 'Tranquilo. El cine no se va a escapar.', 'Tranquillo. Il cinema non scappa.', 'Pas de souci. Le cinéma ne va pas s’enfuir.'],
    // Joana
    'Olá! Bem-vindo ao cinema.': ['Hi! Welcome to the cinema.', '¡Hola! Bienvenido al cine.', 'Ciao! Benvenuto al cinema.', 'Bonjour ! Bienvenue au cinéma.'],
    'Qual sessão vai ser hoje?': ['Which screening will it be today?', '¿Qué sesión va a ser hoy?', 'Quale proiezione oggi?', 'Quelle séance aujourd’hui ?'],
    'As poltronas estão bem confortáveis hoje, viu?': ['The seats are really comfy today, you know?', 'Las butacas están muy cómodas hoy, ¿eh?', 'Le poltrone sono comodissime oggi, sai?', 'Les fauteuils sont très confortables aujourd’hui, tu sais ?'],
    'Aqui está o seu bilhete. Bom filme!': ['Here’s your ticket. Enjoy the movie!', 'Aquí está tu boleto. ¡Buena película!', 'Ecco il tuo biglietto. Buon film!', 'Voici ton billet. Bon film !'],
    'Tudo bem! Volte quando quiser.': ['All right! Come back anytime.', '¡Está bien! Vuelve cuando quieras.', 'Va bene! Torna quando vuoi.', 'D’accord ! Reviens quand tu veux.'],
    // segurança
    'Opa, opa! Só entra com bilhete. A bilheteria fica ali do lado.': ['Whoa, whoa! Ticket holders only. The ticket booth is right over there.', '¡Epa, epa! Solo se entra con boleto. La taquilla está ahí al lado.', 'Ehi, ehi! Si entra solo col biglietto. La biglietteria è lì accanto.', 'Oh là, oh là ! On n’entre qu’avec un billet. La billetterie est juste à côté.'],
    'Aqui é só a saída, viu? Para entrar é pelo outro lado, com bilhete.': ['This is the exit only, okay? To get in, use the other side, with a ticket.', 'Aquí es solo la salida, ¿eh? Para entrar es por el otro lado, con boleto.', 'Questa è solo l’uscita, eh? Per entrare si passa dall’altra parte, col biglietto.', 'Ici, c’est seulement la sortie, d’accord ? Pour entrer, c’est de l’autre côté, avec un billet.'],
    'Bilhete conferido. Bom filme!': ['Ticket checked. Enjoy the movie!', 'Boleto revisado. ¡Buena película!', 'Biglietto controllato. Buon film!', 'Billet vérifié. Bon film !'],
  };
  for (const k of Object.keys(TRAD)) if (!I18N[k]) I18N[k] = TRAD[k];

  const PAGA = { 15: 30, 30: 100 };
  const HERICK_PAPOS = [
    'Pronto pra me dar o dinheirinho do café?',
    'Cada anúncio que você vê é um pãozinho na minha mesa. Obrigado, de coração.',
    'Ah, voltou! Sabia que você não resistia a um bom comercial.',
    'Hoje o filme é um clássico: "Compre Agora". Dizem que o final é imprevisível.',
    'Relaxa, aqui dentro o relógio não anda. Já a minha conta de luz anda bastante.',
    'Você assiste, eu programo mais coisa. Parceria justa, né?',
    'Pode sentar onde quiser. Menos no meu lugar. Brincadeira... ou não.',
    'Já pensou em virar crítico de anúncio? Experiência você tem de sobra.',
    'Este jogo foi feito com muito amor e pouquíssimas horas de sono.',
    'Se o anúncio for chato, reclama com ele, não comigo.',
    'A pipoca é por conta da casa. Mentira, é por conta da sua imaginação.',
    'Cada 30 segundos seus valem ouro. Ou melhor: valem 100 fakes.',
    'Fiz um cinema sem fila nenhuma. O segurança é só para dar um charme.',
    'Quanto mais você assiste, mais rápido sai a próxima atualização. Pressão nenhuma, hein?',
    'Bem-vindo de volta ao único cinema que paga você para ver filme ruim.',
  ];
  const JOANA_PAPOS = ['Olá! Bem-vindo ao cinema.', 'Qual sessão vai ser hoje?', 'As poltronas estão bem confortáveis hoje, viu?'];
  const clampN = (v, a, b) => Math.max(a, Math.min(b, v));
  const dAng = (a, b) => ((b - a + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;

  // ================================================================== O MODELO DO HERICK
  //   O mesmo boneco do professor do Super Lan Master (simulador-redes-senac: criarProfessor): cabeça 0,52 com o rosto em pixel art
  //   (sobrancelhas grossas, bigode "guidão", barba contornando o queixo), cabelo cacheado em blocos, tronco 0,62 × 0,66, braços e pernas
  //   em pivôs. A roupa aqui: COLETE VERMELHO por cima de camisa preta de manga comprida, calça e sapato pretos.
  //   O simulador olha para +z; o grupo "ajuste" gira 90° para ele olhar para +x, como os bonecos deste jogo (raiz.rotation.y = yaw).
  const PELE = '#E8B994', CABELO = '#1A120D', BARBA = '#20160F', COLETE = '#C8352B', COLETE_ESC = '#8E1F1A', CAMISA = '#17171A', CALCA = '#1E1E22', SAPATO = '#0B0B0D';
  function tex(w, h, desenhar) {
    const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; desenhar(g);
    const t = new THREE.CanvasTexture(c); t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; return t;
  }
  const px = (g, cor, x, y, l, a) => { g.fillStyle = cor; g.fillRect(x, y, l || 1, a || 1); };
  function texRosto() {
    return tex(16, 16, (g) => {
      px(g, PELE, 0, 0, 16, 16);
      px(g, CABELO, 0, 0, 16, 1); [0, 1, 2, 3, 4, 7, 8, 9, 12, 13, 14, 15].forEach((x) => px(g, CABELO, x, 1)); [0, 1, 3, 14, 15].forEach((x) => px(g, CABELO, x, 2));
      px(g, CABELO, 3, 5, 4, 1); px(g, CABELO, 9, 5, 4, 1); px(g, CABELO, 4, 4, 3, 1); px(g, CABELO, 9, 4, 3, 1);
      px(g, '#2E1A0F', 4, 7, 2, 2); px(g, '#2E1A0F', 10, 7, 2, 2); px(g, '#F1E6DA', 5, 7, 1, 1); px(g, '#F1E6DA', 11, 7, 1, 1);
      px(g, 'rgba(120,60,30,0.28)', 7, 8, 2, 3);
      px(g, BARBA, 0, 6, 1, 7); px(g, BARBA, 15, 6, 1, 7); px(g, BARBA, 1, 11, 2, 2); px(g, BARBA, 13, 11, 2, 2); px(g, BARBA, 1, 13, 14, 3); px(g, BARBA, 3, 12, 3, 1); px(g, BARBA, 10, 12, 3, 1);
      px(g, BARBA, 4, 11, 8, 1); px(g, BARBA, 3, 10, 1, 1); px(g, BARBA, 12, 10, 1, 1);
      px(g, '#A8604E', 6, 12, 4, 1);
    });
  }
  function texLado(frenteEsq) {
    return tex(16, 16, (g) => {
      const p = (cor, x, y, l, a) => px(g, cor, frenteEsq ? x : 16 - x - (l || 1), y, l, a);
      p(PELE, 0, 0, 16, 16); p(CABELO, 0, 0, 16, 4); p(CABELO, 9, 4, 7, 7); p(CABELO, 12, 11, 4, 2);
      p(BARBA, 5, 4, 3, 8); p(BARBA, 0, 11, 9, 5); p(BARBA, 0, 10, 3, 1); p('#C9946E', 8, 7, 2, 3);
    });
  }
  const texNuca = () => tex(16, 16, (g) => { px(g, PELE, 0, 0, 16, 16); px(g, CABELO, 0, 0, 16, 12); px(g, CABELO, 2, 12, 12, 1); });
  function texPeito() {
    return tex(32, 32, (g) => {
      px(g, COLETE, 0, 0, 32, 32);
      px(g, CAMISA, 11, 0, 10, 32);                                      // a camisa preta aparecendo no colete aberto
      px(g, '#3A3A40', 12, 0, 8, 1); px(g, '#3A3A40', 13, 1, 6, 1);      // gola da camisa
      px(g, COLETE_ESC, 10, 0, 1, 32); px(g, COLETE_ESC, 21, 0, 1, 32);  // as bordas do colete
      for (const y of [9, 15, 21]) { px(g, '#E8C46A', 9, y, 1, 1); }      // botões dourados
      px(g, COLETE_ESC, 0, 28, 32, 1);                                    // barra
      px(g, COLETE_ESC, 3, 17, 5, 1); px(g, COLETE_ESC, 24, 17, 5, 1);    // bolsos
      px(g, '#F4F4EC', 24, 6, 4, 3); px(g, COLETE, 24, 8, 4, 1);         // crachá
    });
  }
  const texCostas = () => tex(32, 32, (g) => { px(g, COLETE, 0, 0, 32, 32); px(g, CAMISA, 10, 0, 12, 2); px(g, COLETE_ESC, 0, 28, 32, 1); px(g, COLETE_ESC, 15, 6, 2, 22); px(g, COLETE_ESC, 6, 12, 20, 1); });
  function modeloHerick() {
    const mats = [], geos = [];
    const lam = (o) => { const m = new THREE.MeshLambertMaterial(o); mats.push(m); return m; };
    const mPele = lam({ color: PELE }), mCabelo = lam({ color: CABELO }), mBarba = lam({ color: BARBA }), mColete = lam({ color: COLETE }), mCamisa = lam({ color: CAMISA }), mCalca = lam({ color: CALCA }), mSapato = lam({ color: SAPATO });
    const caixa = (l, a, p, mat, x, y, z, pai) => { const g = new THREE.BoxGeometry(l, a, p); geos.push(g); const m = new THREE.Mesh(g, mat); m.position.set(x, y, z); pai.add(m); return m; };
    const grupo = (x, y, z, pai) => { const g = new THREE.Group(); g.position.set(x, y, z); if (pai) pai.add(g); return g; };
    const raiz = new THREE.Group(), ajuste = grupo(0, 0, 0, raiz); ajuste.rotation.y = Math.PI / 2;
    const corpo = grupo(0, 0, 0, ajuste);
    const perna = (x) => { const piv = grupo(x, 0.72, 0, corpo); caixa(0.23, 0.6, 0.25, mCalca, 0, -0.3, 0, piv); caixa(0.25, 0.1, 0.34, mSapato, 0, -0.66, 0.04, piv); return piv; };
    const pernaE = perna(-0.14), pernaD = perna(0.14);
    const mFrente = lam({ map: texPeito() }), mCostas = lam({ map: texCostas() });
    const tg = new THREE.BoxGeometry(0.62, 0.66, 0.34); geos.push(tg);
    const tronco = new THREE.Mesh(tg, [mColete, mColete, mColete, mColete, mFrente, mCostas]); tronco.position.set(0, 1.03, 0); corpo.add(tronco);
    const braco = (x) => { const piv = grupo(x, 1.28, 0, corpo); caixa(0.2, 0.28, 0.22, mCamisa, 0, -0.11, 0, piv); caixa(0.17, 0.3, 0.18, mCamisa, 0, -0.38, 0, piv); caixa(0.16, 0.15, 0.16, mPele, 0, -0.6, 0, piv); return piv; };
    const bracoE = braco(-0.41), bracoD = braco(0.41);
    caixa(0.18, 0.06, 0.16, mPele, 0, 1.37, 0, corpo);
    const cabeca = grupo(0, 1.36, 0, corpo);
    const hg = new THREE.BoxGeometry(0.52, 0.52, 0.48); geos.push(hg);
    const cab = new THREE.Mesh(hg, [lam({ map: texLado(true) }), lam({ map: texLado(false) }), mCabelo, mPele, lam({ map: texRosto() }), lam({ map: texNuca() })]); cab.position.set(0, 0.26, 0); cabeca.add(cab);
    caixa(0.34, 0.06, 0.06, mBarba, 0, 0.02, 0.25, cabeca);
    caixa(0.58, 0.14, 0.54, mCabelo, 0, 0.57, -0.01, cabeca); caixa(0.58, 0.32, 0.08, mCabelo, 0, 0.38, -0.25, cabeca);
    caixa(0.05, 0.16, 0.36, mCabelo, -0.285, 0.44, -0.05, cabeca); caixa(0.05, 0.16, 0.36, mCabelo, 0.285, 0.44, -0.05, cabeca);
    [[-0.19, 0.67, 0.13], [0.02, 0.69, 0.17], [0.2, 0.66, 0.1], [-0.09, 0.68, -0.08], [0.13, 0.67, -0.14], [-0.21, 0.65, -0.18], [0.0, 0.66, -0.24], [-0.12, 0.58, 0.25], [0.12, 0.59, 0.25]]
      .forEach((c, i) => { const t = i % 3 === 0 ? 0.15 : 0.12; caixa(t, t, t, mCabelo, c[0], c[1], c[2], cabeca); });
    const descartar = () => { if (raiz.parent) raiz.parent.remove(raiz); for (const g of geos) g.dispose(); for (const m of mats) { if (m.map) m.map.dispose(); m.dispose(); } };
    return { raiz, ajuste, corpo, cabeca, bracoE, bracoD, pernaE, pernaD, descartar };
  }

  // ================================================================== o módulo (um por cidade aberta)
  function criar(api) {
    const S = () => api.S();
    const M = { H: null, Hfora: null, joana: null, guarda: null, C: null, idx: null, passe: false, sessao: false, avisoT: 0, filme: false, colFora: null };
    const dadosC = () => { const d = S().dados; if (!d.cinema) d.cinema = {}; return d.cinema; };
    const hora = () => S().dados.hora;
    const aberto = () => hora() >= 6 && hora() < 22;
    const porta = () => (api.PORTAS || []).find((p) => p.nome === 'cinema');
    const nomeJog = () => api.nomeJog();

    // ---------------------------------------------------------------- o Herick (um ator próprio, fora do poseAtor da cidade)
    function novoHerick(pai, x, z, yaw, y) {
      const m = modeloHerick(); pai.add(m.raiz);
      const H = { m, x, z, y: y || 0, yaw, yawAlvo: yaw, yawBase: yaw, fala: false, rota: null, vel: 1.6, t: Math.random() * 6, fase: 0, andando: false, olha: true, blob: null };
      H.blob = api.sombraAtor(0.32); H.blob.position.set(x, H.y + 0.02, z);
      posHerick(H); return H;
    }
    function posHerick(H) { const r = H.m.raiz; r.position.set(H.x, H.y, H.z); r.rotation.y = H.yaw; if (H.blob) H.blob.position.set(H.x, H.y + 0.02, H.z); }
    function removerHerick(H) { if (!H) return; H.m.descartar(); if (H.blob && H.blob.parent) H.blob.parent.remove(H.blob); if (H.excl && H.excl.parent) H.excl.parent.remove(H.excl); }
    function tickHerick(H, dt) {
      const s = S(), J = s.jog, m = H.m; H.t += dt;
      if (H.rota && H.rota.length) {                                     // andando (a primeira conversa: ele entra no cinema)
        const q = H.rota[0], dx = q.x - H.x, dz = q.z - H.z, d = Math.hypot(dx, dz), st = H.vel * dt;
        if (d <= st) { H.x = q.x; H.z = q.z; H.rota.shift(); if (!H.rota.length) { H.rota = null; if (H.fimRota) { const f = H.fimRota; H.fimRota = null; f(); } } }
        else { H.x += dx / d * st; H.z += dz / d * st; H.yawAlvo = Math.atan2(-dz, dx); }
        H.andando = !!H.rota;
      } else H.andando = !!H.andarSempre;                                 // (6.6.5) indo/voltando de casa (a posição vem da hora)
      if (!H.andando && !H.fala && H.olha && J) {                         // olha para quem chega perto (o corpo vira devagar)
        const dj = Math.hypot(J.x - H.x, J.z - H.z); H.yawAlvo = dj < 3.2 ? Math.atan2(-(J.z - H.z), J.x - H.x) : H.yawBase;
      }
      H.yaw += dAng(H.yaw, H.yawAlvo) * Math.min(1, dt * 7);
      if (s.altura && !s.dentro) H.y = api.altura(H.x, H.z);
      // pose (o modelo olha para +z: braço para a frente = rotation.x negativo)
      const resp = Math.sin(H.t * 2.2) * 0.012;
      m.corpo.position.y = resp; m.cabeca.rotation.set(0, 0, 0);
      if (H.andando) {
        H.fase += dt * 7.5; const w = Math.sin(H.fase);
        m.pernaE.rotation.x = w * 0.6; m.pernaD.rotation.x = -w * 0.6; m.bracoE.rotation.x = -w * 0.5; m.bracoD.rotation.x = w * 0.5; m.bracoE.rotation.z = m.bracoD.rotation.z = 0;
        m.corpo.position.y = Math.abs(Math.cos(H.fase)) * 0.04;
      } else {
        m.pernaE.rotation.x = m.pernaD.rotation.x = 0;
        if (H.fala) {                                                   // falando: gesticula com a direita e mexe a cabeça
          m.bracoD.rotation.x = -0.75 - Math.sin(H.t * 6) * 0.3; m.bracoD.rotation.z = -0.15; m.bracoE.rotation.x = -0.15 - Math.sin(H.t * 4 + 1) * 0.08; m.bracoE.rotation.z = 0.08;
          m.cabeca.rotation.x = Math.sin(H.t * 5.5) * 0.06; m.cabeca.rotation.z = Math.sin(H.t * 2.6) * 0.06;
        } else {
          m.bracoE.rotation.x = Math.sin(H.t * 1.3) * 0.03; m.bracoD.rotation.x = -Math.sin(H.t * 1.3) * 0.03; m.bracoE.rotation.z = 0.06; m.bracoD.rotation.z = -0.06;
        }
      }
      if (H.excl) { H.excl.visible = !H.fala && !H.rota && s.modo === 'livre'; H.excl.position.set(H.x, H.y + 2.65 + Math.sin(H.t * 4) * 0.06, H.z); }
      posHerick(H);
    }

    // ---------------------------------------------------------------- NA RUA: o Herick na frente do cinema até a primeira conversa
    // câmera da conversa: de lado para a linha entre os dois (do lado da rua), um pouco alta, com os dois na metade de cima da tela (a caixa da fala fica embaixo)
    function camConversa(H, J) {
      let ux = J.x - H.x, uz = J.z - H.z; const d = Math.hypot(ux, uz) || 1; ux /= d; uz /= d;
      let nx = -uz, nz = ux; if (nz < 0) { nx = -nx; nz = -nz; }
      if (S().dentro && Math.abs(uz) > 0.7) {                                          // um na frente do outro (o jogador no saguão, de frente para o balcão): por cima do ombro do jogador
        let lx = -uz, lz = ux; const ld = 2.9;
        if (lx * (0 - J.x) < 0) { lx = -lx; lz = -lz; }   // a câmera vai para o lado do meio do saguão (não para dentro da parede)
        return { px: J.x + ux * ld + lx * 1.25, py: H.y + 3.0, pz: J.z + uz * ld + lz * 1.25, tx: H.x * 0.7 + J.x * 0.3, ty: H.y + 1.1, tz: H.z * 0.7 + J.z * 0.3 };
      }
      const mx = (H.x + J.x) / 2, mz = (H.z + J.z) / 2, dist = 3.6 + d * 0.8;
      return { px: mx + nx * dist, py: H.y + 2.1, pz: mz + nz * dist, tx: mx, ty: H.y + 0.75, tz: mz };
    }
    // ---------------------------------------------------------------- (6.6.5) O HERICK MORA COM A FERNANDA
    //   Sai de casa (a da Fernanda) a tempo de chegar no cinema quando abre (6h) e, quando fecha (22h), volta andando para casa. Antes da
    //   primeira conversa ele vai para o ponto da calçada na frente do cinema (onde espera o jogador); depois, entra pela porta (lá dentro
    //   ele fica do lado da bilheteria). A posição sai da hora (como a da Fernanda): não importa quando o jogador aparece na rua.
    const VEL_HERICK = 2.4, H_ABRE_C = 6, H_FECHA_C = 22;   // passo rápido (como o Diego): a cidade é grande para o relógio do jogo
    function rotaHerick() {
      const conheceu = !!dadosC().conheceu, k = conheceu ? 'porta' : 'rua';
      if (M.rotaH && M.rotaH.k === k && M.rotaH.R) return M.rotaH.R;
      const p = pontoRua(); let R = null;
      if (api.rotaCasaPorta) R = conheceu ? api.rotaCasaPorta('fernanda', 'cinema', VEL_HERICK) : p ? api.rotaCasaPorta('fernanda', { x: p.x, z: p.z }, VEL_HERICK) : null;
      M.rotaH = { k, R }; return R;
    }
    function herickNoCaminho() {                                         // { k (0 = casa, 1 = cinema), ida, R } ou null
      const R = rotaHerick(); if (!R) return null; const h = hora();
      if (h >= H_ABRE_C - R.dur && h < H_ABRE_C) return { k: (h - (H_ABRE_C - R.dur)) / R.dur, ida: true, R };
      if (h >= H_FECHA_C && h < H_FECHA_C + R.dur) return { k: 1 - (h - H_FECHA_C) / R.dur, ida: false, R };
      return null;
    }
    function tirarHcam() { const s = S(); if (M.Hcam) { removerHerick(M.Hcam); if (s && s.atoresExtra) s.atoresExtra = s.atoresExtra.filter((q) => q !== M.Hcam); M.Hcam = null; } }
    function tickHerickCaminho(dt) {
      const s = S(), c = s.dentro || !api.pontoNaRota ? null : herickNoCaminho();
      if (!c) { tirarHcam(); return; }
      const p = api.pontoNaRota(c.R, c.k);
      if (!M.Hcam) { M.Hcam = novoHerick(s.grupoCidade || s.grupo, p.x, p.z, c.ida ? p.yaw : p.yaw + Math.PI, api.altura(p.x, p.z)); M.Hcam.olha = false; (s.atoresExtra || (s.atoresExtra = [])).push(M.Hcam); }
      const H = M.Hcam; H.x = p.x; H.z = p.z; H.yawAlvo = c.ida ? p.yaw : p.yaw + Math.PI; H.andarSempre = true;
      tickHerick(H, dt);
    }
    function pontoRua() { const P = porta(); return P ? { x: P.x + 2.5, z: P.z - 0.38, yaw: P.sai } : null; }
    function querHerickRua() { const s = S(); return !s.dentro && !dadosC().conheceu && aberto() && !M.entrando; }
    function criarHerickRua() {
      const s = S(), p = pontoRua(); if (!p) return;
      const H = novoHerick(s.grupoCidade || s.grupo, p.x, p.z, p.yaw, api.altura(p.x, p.z));
      H.excl = api.spriteExclamacao(); (s.grupoCidade || s.grupo).add(H.excl);
      M.Hfora = H; s.falantesExtra = s.falantesExtra || {}; s.falantesExtra.herick = { A: H, nome: T('Herick'), voz: 2 };
      M.colFora = { x0: p.x - 0.3, x1: p.x + 0.3, z0: p.z - 0.22, z1: p.z + 0.22 }; (s.col || []).push(M.colFora);   // sólido: quem passa contorna
    }
    function tirarColFora() { const s = S(); if (!M.colFora) return; const L = s.dentro && s.fora ? s.fora.col : s.col; const i = L ? L.indexOf(M.colFora) : -1; if (i >= 0) L.splice(i, 1); M.colFora = null; }
    function removerHerickRua() { tirarColFora(); removerHerick(M.Hfora); M.Hfora = null; const s = S(); if (s && s.falantesExtra && !M.H) delete s.falantesExtra.herick; }
    function alvosRua(v) {
      const H = M.Hfora; if (!H || H.rota) return;
      v.push({ x: H.x, z: H.z, r: 2.1, txt: T('Falar com o Herick'), fn: conversaRua, y: 2.9, pri: true });
    }
    async function conversaRua() {
      const s = S(), H = M.Hfora, J = s.jog; if (!H) return;
      s.modo = 'cena'; api.UI().ctl.hidden = true; api.aviso(''); J.andando = false; J.correndo = false;
      H.olha = false; H.yawAlvo = Math.atan2(-(J.z - H.z), J.x - H.x); J.yawAlvo = Math.atan2(-(H.z - J.z), H.x - J.x);
      api.camCena(camConversa(H, J));
      try {
        for (const t of ['Opa! Tudo certo? Eu sou o Herick.', 'Eu sou o desenvolvedor deste jogo. É, este mesmo que você está jogando agora.',
          'Eu fiz o jogo de um jeito que nenhum anúncio é obrigatório e ninguém consegue gastar dinheiro de verdade aqui dentro.',
          'Só que... eu ainda preciso de um jeito de ganhar dinheiro na vida real, né? O café não se paga sozinho.',
          'Então este cinema funciona diferente: em vez de você pagar o ingresso, o cinema te PAGA para assistir a um filme.',
          'O "filme", no caso, é um anúncio. Você escolhe se quer ver, quantos quer ver, e ganha fakes por cada um.',
          'E relaxa: lá dentro o tempo do jogo não passa. A sua rotina não fica atrapalhada.',
          'Assim eu consigo manter o jogo, sem você gastar nenhum real e sem ninguém te obrigar a ver anúncio.']) await api.fala('herick', T(t));
        const r = await Escolha.mostrar(T('Assim eu consigo manter o jogo, sem você gastar nenhum real e sem ninguém te obrigar a ver anúncio.'), [T('Achei justo!'), T('Então eu ganho para ver anúncio?')]);
        await api.fala('jog', r === 1 ? T('Então eu ganho para ver anúncio?') : T('Achei justo!'));
        await api.fala('herick', r === 1 ? T('Exatamente! O único lugar da cidade em que ver propaganda dá dinheiro.') : T('Valeu! É assim que eu durmo tranquilo.'));
        await api.fala('herick', T('Eu vou ficar lá dentro, do lado da bilheteria. Quando quiser um bilhete, fala comigo ou com a Joana.'));
        Dialogo.esconder(); api.camCena(null);
        dadosC().conheceu = true; api.gravar(s.dados.ponto || 'chegada');
        // ele entra no cinema pela porta e some
        const P = porta(); tirarColFora(); if (H.excl) H.excl.visible = false; M.entrando = true;
        await new Promise((ok) => { H.rota = [{ x: P.x, z: H.z }, { x: P.x, z: P.z - 0.6 }]; H.fimRota = ok; setTimeout(ok, 6000); });
        removerHerickRua(); M.entrando = false;
      } catch (e) { console.error(e); api.camCena(null); }
      const ss = S(); if (ss && ss.ativo && ss.modo === 'cena') api.liberar();
    }

    // ---------------------------------------------------------------- LÁ DENTRO
    const acha = (lista, n) => Math.max(0, lista.findIndex((x) => x.nome === n));
    function entrou(R, idx) {
      const s = S(), C = R.cinema; if (!C) return;
      M.C = C; M.idx = idx; M.passe = false; M.sessao = false; M.avisoT = 1.5; M.filme = false;
      s.falantesExtra = s.falantesExtra || {};
      if (dadosC().conheceu) {
        M.H = novoHerick(s.grupo, C.herick.x, C.herick.z, C.herick.yaw, 0);
        s.falantesExtra.herick = { A: M.H, nome: T('Herick'), voz: 2 };
      }
      const apJ = { pele: PELES_FITZ[2].cor, cabelo: CORES_CABELO[1].cor, estilo: acha(ESTILOS_CABELO, 'Rabo alto'), rosto: acha(ROSTOS, 'Sorridente'), labio: 2, barba: 0 };
      const Jo = api.criarNPCFixo(apJ, true, 1, ['#7a1c24', '#1c1c1f', '#e8c46a', '#e8c46a']); Jo.tipo = 'parado'; Jo.x = C.bilheteria.x; Jo.z = C.bilheteria.z; Jo.yaw = Jo.yawAlvo = C.bilheteria.yaw; M.joana = Jo;
      s.falantesExtra.joana = { A: Jo, nome: T('Joana'), voz: 0 };
      const apG = { pele: PELES_FITZ[4].cor, cabelo: CORES_CABELO[0].cor, estilo: acha(ESTILOS_CABELO, 'Raspado'), rosto: acha(ROSTOS, 'Sério'), labio: 4, barba: acha(ESTILOS_BARBA, 'Cavanhaque'), corBarba: CORES_CABELO[0].cor };
      const G = api.criarNPCFixo(apG, false, 6, ['#1c1c1f', '#1c1c1f', '#f2f2ee', '#1c1c1f']); G.tipo = 'parado'; G.x = C.seguranca.x; G.z = C.seguranca.z; G.yaw = G.yawAlvo = C.seguranca.yaw; M.guarda = G;
      s.falantesExtra.seguranca = { A: G, nome: T('Seu Wilson'), voz: 4 };
      for (const K of C.cordas) { K.aberta = false; K.ladoAnt = null; K.calado = false; K.perto = false; }
    }
    function saiu() {
      const s = S();
      if (M.H) removerHerick(M.H);
      M.H = null; M.joana = null; M.guarda = null; M.C = null; M.idx = null; M.passe = false; M.sessao = false; M.filme = false;
      if (s && s.falantesExtra) { delete s.falantesExtra.joana; delete s.falantesExtra.seguranca; if (!M.Hfora) delete s.falantesExtra.herick; }
    }
    const dentroCine = () => { const s = S(); return !!(s && s.dentro && s.dentro.nome === 'cinema' && M.C); };

    // as cordas: a da ENTRADA só abre com o bilhete (na ida para a sessão); a da SAÍDA só deixa passar quem está dentro da sala
    function tickCordas(dt) {
      const s = S(), J = s.jog, C = M.C;
      for (const K of C.cordas) {
        const lado = J.z > K.z ? 'saguao' : 'sala';
        if (Math.abs(J.z - K.z) > 0.5 || K.ladoAnt == null) {
          if (K.ladoAnt === 'sala' && lado === 'saguao') K.calado = true;   // acabou de sair da sala por aqui: o segurança não implica
          K.ladoAnt = lado;
        }
        const abre = K.tipo === 'entrada' ? M.passe : K.ladoAnt === 'sala';
        K.aberta = abre;
        if (abre) { K.col.x0 = K.col.x1 = 9999; } else { Object.assign(K.col, K.colFechada); }
        K.malha.visible = !abre;
        // "na frente da corda, pelo saguão": um aviso por aproximação (sai de perto e volta = outro aviso)
        const perto = J.z >= K.z && J.z <= K.z + 0.95 && J.x >= K.x0 - 0.1 && J.x <= K.x1 + 0.1;
        if (!perto && (J.z > K.z + 1.5 || J.x < K.x0 - 0.8 || J.x > K.x1 + 0.8)) K.calado = false;
        K.perto = perto;
      }
      M.avisoT = Math.max(0, M.avisoT - dt);
      if (s.modo !== 'livre' || M.avisoT > 0 || M.sessao) return;
      for (const K of C.cordas) {
        if (K.aberta || !K.perto || K.calado) continue;
        K.calado = true; avisoSeguranca(K.tipo); break;
      }
    }
    async function avisoSeguranca(tipo) {
      const s = S(), G = M.guarda, J = s.jog;
      s.modo = 'cena'; api.UI().ctl.hidden = true; J.andando = false; J.correndo = false;
      try {
        if (G) G.yawAlvo = Math.atan2(-(J.z - G.z), J.x - G.x);
        await api.fala('seguranca', tipo === 'entrada' ? T('Opa, opa! Só entra com bilhete. A bilheteria fica ali do lado.') : T('Aqui é só a saída, viu? Para entrar é pelo outro lado, com bilhete.'));
        Dialogo.esconder();
        J.z = Math.max(J.z, (M.C ? M.C.cordas[0].z : J.z) + 0.75);           // um passinho para trás
      } catch (e) { console.error(e); }
      if (G && M.C) G.yawAlvo = M.C.seguranca.yaw;
      M.avisoT = 1.2;
      const ss = S(); if (ss && ss.ativo && ss.modo === 'cena') api.liberar();
    }

    function alvos(v) {
      if (!dentroCine() || M.sessao) return;
      const C = M.C;
      if (M.H) v.push({ x: M.H.x, z: M.H.z + 0.55, r: 1.6, txt: T('Falar com o Herick'), fn: falarHerick, y: 2.9, pri: true });
      v.push({ x: C.bilheteria.falar.x, z: C.bilheteria.falar.z, r: 1.5, txt: T('Falar com a Joana'), fn: falarJoana, y: 2.6, pri: true });
    }
    const opcoesBilhete = () => [Tf('Bilhete de 15 s (+{0} fakes)', PAGA[15]), Tf('Bilhete de 30 s (+{0} fakes)', PAGA[30]), T('Só passando')];
    async function falarHerick() {
      const s = S(), H = M.H, J = s.jog, c = dadosC(); if (!H) return;
      s.modo = 'cena'; api.UI().ctl.hidden = true; J.andando = false;
      H.olha = false; H.yawAlvo = Math.atan2(-(J.z - H.z), J.x - H.x); J.yawAlvo = Math.atan2(-(H.z - J.z), H.x - J.x);
      api.camCena(camConversa(H, J));
      let seg = 0;
      try {
        const p = T(HERICK_PAPOS[(c.papoH | 0) % HERICK_PAPOS.length]); c.papoH = (c.papoH | 0) + 1;
        await api.fala('herick', p);
        const r = await Escolha.mostrar(p, opcoesBilhete());
        if (r === 0 || r === 1) { seg = r ? 30 : 15; await api.fala('herick', r ? T('Trinta segundos! Assim que eu gosto.') : T('Quinze segundinhos. Já ajuda!')); }
        else await api.fala('herick', T('Tranquilo. O cinema não vai fugir.'));
        Dialogo.esconder();
      } catch (e) { console.error(e); }
      if (M.H) M.H.olha = true;
      api.camCena(null);
      if (seg) await sessao(seg); else { const ss = S(); if (ss && ss.ativo && ss.modo === 'cena') api.liberar(); }
    }
    async function falarJoana() {
      const s = S(), Jo = M.joana, J = s.jog, c = dadosC();
      s.modo = 'cena'; api.UI().ctl.hidden = true; J.andando = false;
      if (Jo) { Jo.yawAlvo = Math.atan2(-(J.z - Jo.z), J.x - Jo.x); api.camCena(camConversa(Jo, J)); J.yawAlvo = Math.atan2(-(Jo.z - J.z), Jo.x - J.x); }
      let seg = 0;
      try {
        const p = T(JOANA_PAPOS[(c.papoJ | 0) % JOANA_PAPOS.length]); c.papoJ = (c.papoJ | 0) + 1;
        await api.fala('joana', p);
        const r = await Escolha.mostrar(p, opcoesBilhete());
        if (r === 0 || r === 1) { seg = r ? 30 : 15; await api.fala('joana', T('Aqui está o seu bilhete. Bom filme!')); }
        else await api.fala('joana', T('Tudo bem! Volte quando quiser.'));
        Dialogo.esconder();
      } catch (e) { console.error(e); }
      if (Jo && M.C) Jo.yawAlvo = M.C.bilheteria.yaw;
      api.camCena(null);
      if (seg) await sessao(seg); else { const ss = S(); if (ss && ss.ativo && ss.modo === 'cena') api.liberar(); }
    }

    // ---------------------------------------------------------------- A SESSÃO
    // a poltrona: a vazia mais perto do meio da sala (fileiras do meio primeiro, perto do corredor central)
    function escolherPoltrona() {
      const C = M.C, idx = M.idx || []; let melhor = null, nota = 1e9;
      C.fileiras.forEach((F, f) => F.assentos.forEach((ia) => {
        const a = idx[ia]; if (!a || a.ocupado) return;
        const n = Math.abs(f - 3) * 1.6 + Math.abs(a.x) * 0.35 + Math.random() * 0.4; if (n < nota) { nota = n; melhor = { a, F }; }
      }));
      return melhor;
    }
    function camFilme(a, F) { api.camCena({ px: a.x * 0.8, py: F.y + 3.1, pz: a.z + 3.3, tx: a.x * 0.3, ty: 2.2, tz: -14.6 }); }   // atrás e acima da poltrona: a tela inteira e o personagem sentado embaixo
    async function sessao(seg) {
      const s = S(), J = s.jog, C = M.C; if (!C) return;
      s.modo = 'cena'; api.UI().ctl.hidden = true; api.aviso(''); J.andando = false; J.correndo = false;
      const esc = escolherPoltrona();
      if (!esc) { await api.fala('joana', T('Todas as poltronas estão ocupadas agora.')); Dialogo.esconder(); api.liberar(); return; }
      M.sessao = true;
      try {
        const { a, F } = esc; a.ocupado = J;                              // reservada (ninguém senta nela no caminho)
        // passa pela entrada (o segurança confere e a corda abre)
        // do balcão (ou do Herick) até a corda: primeiro de lado pela frente do balcão, depois reto até a entrada (sem atravessar o balcão nem o Herick)
        const xc = C.antesEntrada.x + 0.85, ida = [];
        if (J.z > C.antesEntrada.z + 1.4) { ida.push([xc, J.z]); ida.push([xc, C.antesEntrada.z + 1.0]); }
        ida.push([C.antesEntrada.x, C.antesEntrada.z]);
        await api.andar(J, ida, 2.2);
        const G = M.guarda; if (G) G.yawAlvo = Math.atan2(-(J.z - G.z), J.x - G.x);
        M.passe = true;
        await api.fala('seguranca', T('Bilhete conferido. Bom filme!')); Dialogo.esconder();
        if (G) G.yawAlvo = C.seguranca.yaw;
        await api.andar(J, [[C.entradaSala.x, C.entradaSala.z], [0, C.fundoSala.z], [0, F.passeio], [a.x, F.passeio]], 2.0);
        M.passe = false;
        // senta
        J.sentado = true; J.assento = a.h; J.x = a.x; J.z = a.z; J.yaw = J.yawAlvo = a.yaw; J.y = F.y; s.sentadoEm = a;
        camFilme(a, F);
        await api.esperar(700);
        let vez = seg;
        for (;;) {
          M.filme = true; if (C.feixe) C.feixe.visible = true;
          let ok = false;
          try { ok = await Anuncios.filme(vez); } catch (e) { console.warn('[Cinema] anúncio:', e); }
          M.filme = false; if (C.feixe) C.feixe.visible = false; if (C.tela) C.tela.material.color.setHex(0x2a2e36);
          if (ok) {
            const v = PAGA[vez], d = s.dados, c = dadosC();
            d.fakes = (d.fakes || 0) + v; c.vistos = (c.vistos | 0) + 1; c.ganhos = (c.ganhos | 0) + v;
            api.somDinheiro(); api.ganhoNaTela(v); api.mostrarDinheiro(true); api.aviso(Tf('+{0} fakes pelo filme!', v));
            api.gravar(d.ponto || 'chegada');
          } else api.aviso(T('Nenhum anúncio disponível agora. Tenta de novo daqui a pouco.'));
          const r = await Escolha.mostrar(T('Quer ver mais um?'), [Tf('Mais um de 15 s (+{0} fakes)', PAGA[15]), Tf('Mais um de 30 s (+{0} fakes)', PAGA[30]), T('Não, obrigado')], { centro: true });
          Dialogo.esconder(); api.aviso('');
          if (r === 0) { vez = 15; continue; }
          if (r === 1) { vez = 30; continue; }
          break;
        }
        api.camCena(null);
        api.levantar(); J.y = F.y;
        api.aviso(T('A saída é pelo corredor da direita.')); setTimeout(() => { const ss = S(); if (ss && ss.modo === 'livre') api.aviso(''); }, 3200);
      } catch (e) { console.error(e); api.camCena(null); }
      M.sessao = false; M.passe = false;
      const ss = S(); if (ss && ss.ativo && ss.modo === 'cena') api.liberar();
    }

    // ---------------------------------------------------------------- a cada quadro
    function tick(dt) {
      const s = S(); if (!s) return;
      if (!s.dentro) {
        tickHerickCaminho(dt);                                            // (6.6.5) indo para o cinema / voltando para casa
        if (querHerickRua() && !M.Hfora) criarHerickRua();
        else if (!querHerickRua() && M.Hfora && !M.entrando && M.Hcam && !dadosC().conheceu && s.modo === 'livre') removerHerickRua();   // (6.6.5) fechou (22h): quem segue é o Herick que volta para casa (do mesmo lugar)
        else if (!querHerickRua() && M.Hfora && !M.entrando && s.modo === 'livre') {      // fechou (22h): ele entra no cinema em vez de sumir na frente de todo mundo
          const H = M.Hfora, P = porta(); M.entrando = true; tirarColFora(); if (H.excl) H.excl.visible = false;
          const fim = () => { if (M.Hfora === H) removerHerickRua(); M.entrando = false; };
          H.olha = false; H.rota = [{ x: P.x, z: H.z }, { x: P.x, z: P.z - 0.6 }]; H.fimRota = fim; setTimeout(fim, 6000);
        }
        if (M.Hfora) tickHerick(M.Hfora, dt);
        return;
      }
      if (!dentroCine()) return;
      if (M.H) tickHerick(M.H, dt);
      tickCordas(dt);
      if (M.filme && M.C.tela) {                                          // a tela "passando o filme" (cores trocando) atrás do anúncio
        const k = (s.t || 0) * 1.7, c = M.C.tela.material.color; c.setRGB(0.55 + Math.sin(k) * 0.3, 0.55 + Math.sin(k * 1.3 + 2) * 0.3, 0.6 + Math.sin(k * 0.7 + 4) * 0.3);
      }
    }
    function limpar() { removerHerickRua(); tirarHcam(); if (M.H) removerHerick(M.H); M.H = null; }

    return {
      entrou, saiu, alvos, alvosRua, tick, limpar, aberto, _M: M,
      _f: { herickNoCaminho, rotaHerick, conversaRua, falarHerick, falarJoana, sessao, escolherPoltrona, avisoSeguranca, criarHerickRua, removerHerickRua, dadosC },
      _regras: { PAGA, HERICK_PAPOS, JOANA_PAPOS },
    };
  }

  window.FutebolJS.registrarFase({ id: 'cinema', nome: 'Cinema', nucleoMinimo: '6.2.0', iniciar: async () => {}, criar, modeloHerick });
})();
