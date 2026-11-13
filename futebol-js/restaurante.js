/* =====================================================================
   FUTEBOL JS · restaurante.js · O RESTAURANTE SELF-SERVICE (arquivo SEPARADO, como pizzaria.js)
   ---------------------------------------------------------------------
   7.1.3 — primeira versão.
   7.1.6 — as cadeiras entram na navegação (o jogador e os clientes contornam as mesas pelos corredores) · o jogador anda 1,5x mais
     rápido na cena · a Dona Cida vem de trás da parede pelo vão escuro da porta · o boné do Renan refeito · a pose do Renan não
     apaga mais o cambaleio do esbarrão. (O "sempre come em pé" era do interiores.js: a lista de mesas estava vazia.)
   - Registrado com FutebolJS.registrarFase({ id: 'restaurante' }) só para o jogo saber baixar o arquivo; NÃO roda como fase.
     A cidade baixa em segundo plano e chama criar(api) (api = apiRestaurante() da cidade). A sala vem do interiores.js (R.restaurante).
   - HORÁRIO: abre das 11h às 23h. A DONA CIDA (a cozinheira) chega às 9h (2 horas antes), o RENAN (o caixa) às 10h30 e aí abre.
     Na rua dá para ver os dois chegando pela calçada e entrando (e saindo depois de fechar: o Renan às 23h20, a Dona Cida às 23h40).
   - A COZINHA não dá para entrar: de vez em quando a Dona Cida sai pela porta vai e vem com uma cuba cheia, troca a cuba mais vazia do
     bufê (as cubas esvaziam quando alguém se serve: cheia → metade → quase vazia) e volta com a vazia para a cozinha.
   - O BUFÊ tem 20 cubas (2 fileiras) debaixo da coifa de vidro; na ponta oeste, o carrinho dos pratos; nos cantos do norte, a vitrine de
     sobremesas e o balcão da sopa. O jogador ESCOLHE O PRATO (20 pratos, a maioria saudável, com saladas e sobremesas) e a cena roda:
     pega o prato, passa pelas cubas (o prato vai sendo montado na mão), senta numa mesa livre, come (o prato vai esvaziando), levanta,
     vai até o caixa e paga para o Renan. Os efeitos: a fome do dia, Saudável (+ nos pratos saudáveis, − nas sobremesas e nos pesados),
     a refeição pesada (feijoada, lasanha e parmegiana) e o "comeu saudável hoje" (o hábito da Série B).
   - CLIENTES (do registro das lojas da cidade): entram, pegam o prato, se servem no bufê, sentam, comem, fazem fila no caixa e vão embora.
   - PIXEL ART: cada prato é desenhado pixel a pixel (40 x 40) a partir das porções (ingredientes com textura própria: arroz soltinho,
     feijão com caldo, grelhados com as marcas da grelha, salada com as folhas...), em 4 estados (cheio → comendo → quase → vazio), e o
     mesmo desenho monta o prato aos poucos no bufê. As cubas (36 x 22) têm 3 níveis.
   - Salva em historia.cidade: restaurante = { conheceu, papoR, papoC, pratos: { id: vezes } }.
   ===================================================================== */
(function () {
  'use strict';

  // ------------------------------------------------------------------ textos (pt → en, es, it, fr)
  const TRAD = {
    'Renan': ['Renan', 'Renan', 'Renan', 'Renan'], 'Dona Cida': ['Mrs. Cida', 'Doña Cida', 'Signora Cida', 'Mme Cida'],
    'Self-service: montar um prato': ['Self-service: build a plate', 'Autoservicio: armar un plato', 'Self-service: componi un piatto', 'Self-service : composer une assiette'],
    'Ver as sobremesas': ['See the desserts', 'Ver los postres', 'Guarda i dolci', 'Voir les desserts'],
    'Pegar uma sopa': ['Get a soup', 'Servirse una sopa', 'Prendi una zuppa', 'Prendre une soupe'],
    'Falar com o Renan': ['Talk to Renan', 'Hablar con Renan', 'Parla con Renan', 'Parler à Renan'],
    'Falar com a Dona Cida': ['Talk to Mrs. Cida', 'Hablar con Doña Cida', 'Parla con la signora Cida', 'Parler à Mme Cida'],
    'O bufê abre às 11h.': ['The buffet opens at 11 AM.', 'El bufé abre a las 11h.', 'Il buffet apre alle 11.', 'Le buffet ouvre à 11 h.'],
    'O bufê já fechou.': ['The buffet is already closed.', 'El bufé ya cerró.', 'Il buffet è già chiuso.', 'Le buffet est déjà fermé.'],
    'Self-service ({0} fakes)': ['Self-service ({0} fakes)', 'Autoservicio ({0} fakes)', 'Self-service ({0} fakes)', 'Self-service ({0} fakes)'],
    'Saladas': ['Salads', 'Ensaladas', 'Insalate', 'Salades'], 'Pratos': ['Dishes', 'Platos', 'Piatti', 'Plats'], 'Sobremesas': ['Desserts', 'Postres', 'Dolci', 'Desserts'],
    'Saudável': ['Healthy', 'Saludable', 'Sano', 'Sain'], 'Pesado': ['Heavy', 'Pesado', 'Pesante', 'Lourd'], 'Doce': ['Sweet', 'Dulce', 'Dolce', 'Sucré'],
    'Nada, obrigado': ['Nothing, thanks', 'Nada, gracias', 'Niente, grazie', 'Rien, merci'],
    'Ih... com esse dinheiro não dá esse prato, hein?': ['Oops... you don’t have enough for this dish, huh?', 'Uy... con ese dinero no te alcanza para ese plato, ¿eh?', 'Ehi... con questi soldi questo piatto non ci sta, eh?', 'Oh là... avec cet argent, ce plat ne passe pas, hein ?'],
    'Não tem mesa livre agora... vou comer em pé mesmo.': ['There’s no free table right now... I’ll eat standing up.', 'No hay mesa libre ahora... voy a comer de pie.', 'Non c’è un tavolo libero adesso... mangio in piedi.', 'Pas de table libre pour l’instant... je vais manger debout.'],
    '{0}: {1} fakes.': ['{0}: {1} fakes.', '{0}: {1} fakes.', '{0}: {1} fakes.', '{0} : {1} fakes.'],
    'Obrigado! Volte sempre!': ['Thank you! Come back anytime!', '¡Gracias! ¡Vuelve siempre!', 'Grazie! Torna presto!', 'Merci ! Reviens quand tu veux !'],
    'Bem-vindo ao restaurante! É só pegar um prato no carrinho, se servir no bufê e pagar aqui comigo no final.': ['Welcome to the restaurant! Just grab a plate from the cart, serve yourself at the buffet and pay here with me at the end.', '¡Bienvenido al restaurante! Solo toma un plato del carrito, sírvete en el bufé y paga aquí conmigo al final.', 'Benvenuto al ristorante! Prendi un piatto dal carrello, servi al buffet e alla fine paga qui da me.', 'Bienvenue au restaurant ! Prends une assiette sur le chariot, sers-toi au buffet et paie ici avec moi à la fin.'],
    'Bem-vinda ao restaurante! É só pegar um prato no carrinho, se servir no bufê e pagar aqui comigo no final.': ['Welcome to the restaurant! Just grab a plate from the cart, serve yourself at the buffet and pay here with me at the end.', '¡Bienvenida al restaurante! Solo toma un plato del carrito, sírvete en el bufé y paga aquí conmigo al final.', 'Benvenuta al ristorante! Prendi un piatto dal carrello, servi al buffet e alla fine paga qui da me.', 'Bienvenue au restaurant ! Prends une assiette sur le chariot, sers-toi au buffet et paie ici avec moi à la fin.'],
    'A comida é toda da Dona Cida. Ela chega às nove pra deixar tudo pronto antes de abrir.': ['All the food is Mrs. Cida’s. She gets here at nine to have everything ready before we open.', 'Toda la comida es de Doña Cida. Llega a las nueve para dejar todo listo antes de abrir.', 'Il cibo è tutto della signora Cida. Arriva alle nove per preparare tutto prima di aprire.', 'Toute la cuisine, c’est Mme Cida. Elle arrive à neuf heures pour tout préparer avant l’ouverture.'],
    'Isso sim é comida de atleta!': ['Now that’s an athlete’s meal!', '¡Esto sí es comida de atleta!', 'Questo sì che è cibo da atleta!', 'Ça, c’est un repas d’athlète !'],
    'Que delícia... mas o preparador físico não pode saber.': ['So good... but the fitness coach can’t find out.', 'Qué delicia... pero el preparador físico no se puede enterar.', 'Che delizia... ma il preparatore atletico non deve saperlo.', 'Quel délice... mais le préparateur physique ne doit pas savoir.'],
    'Ufa... matei a fome. Mas tô pesadão.': ['Phew... that killed my hunger. But I feel so heavy.', 'Uf... maté el hambre. Pero estoy pesadísimo.', 'Uff... fame passata. Ma mi sento pesantissimo.', 'Ouf... j’ai plus faim. Mais je me sens lourd.'],
    'Ufa... matei a fome. Mas tô pesadona.': ['Phew... that killed my hunger. But I feel so heavy.', 'Uf... maté el hambre. Pero estoy pesadísima.', 'Uff... fame passata. Ma mi sento pesantissima.', 'Ouf... j’ai plus faim. Mais je me sens lourde.'],
    'Acho que eu exagerei...': ['I think I overdid it...', 'Creo que me pasé...', 'Credo di aver esagerato...', 'Je crois que j’ai exagéré...'],
    'Já estava satisfeito, mas salada nunca é demais.': ['I was already full, but you can never have too much salad.', 'Ya estaba lleno, pero la ensalada nunca sobra.', 'Ero già sazio, ma l’insalata non è mai troppa.', 'J’étais déjà rassasié, mais la salade, ce n’est jamais de trop.'],
    'Já estava satisfeita, mas salada nunca é demais.': ['I was already full, but you can never have too much salad.', 'Ya estaba llena, pero la ensalada nunca sobra.', 'Ero già sazia, ma l’insalata non è mai troppa.', 'J’étais déjà rassasiée, mais la salade, ce n’est jamais de trop.'],
    'Hmm... ainda cabia mais um pouquinho.': ['Hmm... I could still fit a little more.', 'Mmm... todavía cabía un poquito más.', 'Mmm... ci stava ancora un pochino.', 'Hmm... il y avait encore un peu de place.'],
    'Comendo...': ['Eating...', 'Comiendo...', 'Sto mangiando...', 'En train de manger...'],
    // Renan
    'Movimento bom hoje, graças a Deus!': ['Good business today, thank God!', '¡Buen movimiento hoy, gracias a Dios!', 'Bel movimento oggi, grazie a Dio!', 'Bonne affluence aujourd’hui, Dieu merci !'],
    'Que bom!': ['Great!', '¡Qué bien!', 'Che bello!', 'Tant mieux !'], 'A comida da Dona Cida atrai todo mundo.': ['Mrs. Cida’s food brings everyone in.', 'La comida de Doña Cida atrae a todo el mundo.', 'Il cibo della signora Cida attira tutti.', 'La cuisine de Mme Cida attire tout le monde.'],
    'Movimento bom e fila no caixa, né?': ['Good business and a line at the register, huh?', 'Buen movimiento y fila en la caja, ¿no?', 'Bel movimento e fila alla cassa, eh?', 'Bonne affluence et la queue à la caisse, hein ?'],
    'Eu sou rápido! Ninguém espera mais de um minuto aqui.': ['I’m fast! Nobody waits more than a minute here.', '¡Soy rápido! Aquí nadie espera más de un minuto.', 'Sono veloce! Qui nessuno aspetta più di un minuto.', 'Je suis rapide ! Personne n’attend plus d’une minute ici.'],
    'Caixa parado o dia todo, que emprego fácil.': ['Standing at the register all day, what an easy job.', 'Parado en la caja todo el día, qué trabajo fácil.', 'Fermo alla cassa tutto il giorno, che lavoro facile.', 'Planté à la caisse toute la journée, quel boulot facile.'],
    'Fácil? Quero ver você fechar o caixa às onze da noite batendo certinho.': ['Easy? I’d like to see you close the register at eleven at night with everything adding up.', '¿Fácil? Quiero verte cerrar la caja a las once de la noche cuadrando todo.', 'Facile? Vorrei vedere te chiudere la cassa alle undici di sera con i conti giusti.', 'Facile ? J’aimerais te voir fermer la caisse à onze heures du soir avec des comptes justes.'],
    'Já experimentou a salada de quinoa? Sai muito com o pessoal que joga bola.': ['Have you tried the quinoa salad? It’s popular with the football crowd.', '¿Ya probaste la ensalada de quinoa? Sale mucho con la gente que juega al fútbol.', 'Hai già provato l’insalata di quinoa? Va molto tra quelli che giocano a calcio.', 'Tu as goûté la salade de quinoa ? Elle part beaucoup chez ceux qui jouent au foot.'],
    'Ainda não, vou provar!': ['Not yet, I’ll try it!', '¡Todavía no, la voy a probar!', 'Non ancora, la proverò!', 'Pas encore, je vais goûter !'], 'Proteína e fibra. O seu treinador ia gostar.': ['Protein and fiber. Your coach would approve.', 'Proteína y fibra. A tu entrenador le gustaría.', 'Proteine e fibre. Al tuo allenatore piacerebbe.', 'Protéines et fibres. Ton entraîneur approuverait.'],
    'Eu prefiro o petit gâteau.': ['I prefer the chocolate lava cake.', 'Yo prefiero el petit gâteau.', 'Io preferisco il tortino al cioccolato.', 'Moi, je préfère le moelleux au chocolat.'],
    'Hehe, eu também. Mas não conta pra ninguém.': ['Hehe, me too. But don’t tell anyone.', 'Jeje, yo también. Pero no le digas a nadie.', 'Ehehe, anch’io. Ma non dirlo a nessuno.', 'Héhé, moi aussi. Mais ne le dis à personne.'],
    'Quinoa? Isso é comida de passarinho.': ['Quinoa? That’s bird food.', '¿Quinoa? Eso es comida de pajarito.', 'Quinoa? Quello è cibo per uccellini.', 'Du quinoa ? C’est de la nourriture pour oiseaux.'],
    'Passarinho que joga noventa minutos, né? Cada um com o seu gosto.': ['A bird that plays ninety minutes, right? To each their own.', 'Un pajarito que juega noventa minutos, ¿no? Cada uno con su gusto.', 'Un uccellino che gioca novanta minuti, no? Ognuno ha i suoi gusti.', 'Un oiseau qui joue quatre-vingt-dix minutes, hein ? Chacun ses goûts.'],
    // Dona Cida
    'Olha a comida quentinha saindo!': ['Here comes the hot food!', '¡Mira la comida calentita saliendo!', 'Ecco il cibo caldo che esce!', 'Et voilà les plats bien chauds !'],
    'Tem salada fresquinha, viu? Faz bem pra quem joga bola!': ['There’s fresh salad, you know? It’s good for football players!', 'Hay ensalada fresquita, ¿eh? ¡Le hace bien al que juega al fútbol!', 'C’è insalata freschissima, eh? Fa bene a chi gioca a calcio!', 'Il y a de la salade toute fraîche, hein ? C’est bon pour ceux qui jouent au foot !'],
    'Hoje a lasanha tá daquele jeito, hein!': ['Today’s lasagna is amazing, I tell you!', '¡Hoy la lasaña está buenísima, eh!', 'Oggi la lasagna è da urlo, eh!', 'Aujourd’hui, la lasagne est une merveille, hein !'],
    'Valeu, Dona Cida!': ['Thanks, Mrs. Cida!', '¡Gracias, Doña Cida!', 'Grazie, signora Cida!', 'Merci, Mme Cida !'],
    'Anda logo, a cuba do arroz tá vazia.': ['Hurry up, the rice tray is empty.', 'Apúrate, la bandeja del arroz está vacía.', 'Sbrigati, la vaschetta del riso è vuota.', 'Dépêche-toi, le bac de riz est vide.'],
    'Ô, meu filho... calma que eu só tenho duas mãos.': ['Oh, dear... calm down, I only have two hands.', 'Ay, hijo mío... calma, que solo tengo dos manos.', 'Oh, figliolo... calma, ho solo due mani.', 'Oh, mon petit... du calme, je n’ai que deux mains.'],
    'Ô, minha filha... calma que eu só tenho duas mãos.': ['Oh, dear... calm down, I only have two hands.', 'Ay, hija mía... calma, que solo tengo dos manos.', 'Oh, figliola... calma, ho solo due mani.', 'Oh, ma petite... du calme, je n’ai que deux mains.'],
    // os 20 pratos
    'Salada verde': ['Green salad', 'Ensalada verde', 'Insalata verde', 'Salade verte'],
    'Salada Caesar com frango': ['Chicken Caesar salad', 'Ensalada César con pollo', 'Insalata Caesar con pollo', 'Salade César au poulet'],
    'Salada de quinoa': ['Quinoa salad', 'Ensalada de quinoa', 'Insalata di quinoa', 'Salade de quinoa'],
    'Frango grelhado com arroz integral': ['Grilled chicken with brown rice', 'Pollo a la plancha con arroz integral', 'Pollo alla griglia con riso integrale', 'Poulet grillé et riz complet'],
    'Peixe grelhado com purê de abóbora': ['Grilled fish with pumpkin purée', 'Pescado a la plancha con puré de calabaza', 'Pesce alla griglia con purè di zucca', 'Poisson grillé et purée de potiron'],
    'Salmão com legumes': ['Salmon with vegetables', 'Salmón con verduras', 'Salmone con verdure', 'Saumon aux légumes'],
    'Prato feito': ['Brazilian set plate', 'Plato del día', 'Piatto unico brasiliano', 'Assiette du jour'],
    'Omelete com salada': ['Omelet with salad', 'Tortilla con ensalada', 'Frittata con insalata', 'Omelette et salade'],
    'Escondidinho de batata-doce': ['Sweet potato and chicken bake', 'Pastel de batata dulce y pollo', 'Sformato di patata dolce e pollo', 'Gratin de patate douce au poulet'],
    'Sopa de legumes': ['Vegetable soup', 'Sopa de verduras', 'Minestra di verdure', 'Soupe de légumes'],
    'Moqueca de peixe': ['Fish moqueca', 'Moqueca de pescado', 'Moqueca di pesce', 'Moqueca de poisson'],
    'Arroz integral com feijão e legumes': ['Brown rice with beans and vegetables', 'Arroz integral con frijoles y verduras', 'Riso integrale con fagioli e verdure', 'Riz complet, haricots et légumes'],
    'Salada de frutas': ['Fruit salad', 'Ensalada de frutas', 'Macedonia', 'Salade de fruits'],
    'Feijoada completa': ['Full feijoada', 'Feijoada completa', 'Feijoada completa', 'Feijoada complète'],
    'Lasanha à bolonhesa': ['Lasagna bolognese', 'Lasaña a la boloñesa', 'Lasagna alla bolognese', 'Lasagne à la bolognaise'],
    'Parmegiana com fritas': ['Parmigiana steak with fries', 'Milanesa a la napolitana con papas fritas', 'Cotoletta alla parmigiana con patatine', 'Escalope parmigiana et frites'],
    'Pudim de leite': ['Flan', 'Flan de leche', 'Budino al caramello', 'Flan au caramel'],
    'Mousse de maracujá': ['Passion fruit mousse', 'Mousse de maracuyá', 'Mousse al frutto della passione', 'Mousse aux fruits de la passion'],
    'Petit gâteau com sorvete': ['Lava cake with ice cream', 'Petit gâteau con helado', 'Tortino al cioccolato con gelato', 'Moelleux au chocolat et glace'],
    'Torta holandesa': ['Dutch pie', 'Tarta holandesa', 'Torta olandese', 'Tarte hollandaise'],
  };

  // ------------------------------------------------------------------ regras (fáceis de ajustar)
  const H_ABRE = 11, H_FECHA = 23, H_COZINHA = 9, H_CAIXA = 10.5, H_SAI_CAIXA = 23.33, H_SAI_COZINHA = 23.66, H_ULTIMO = 22.6;
  const COMER_SEG = 11;                                                // segundos que o jogador leva para comer
  const PORTA_REST = { x: 23.6, z: 8.6 };                              // a porta do restaurante na rua (PORTAS da cidade) · a fachada fica em z 10,4
  const CUBAS = ['alface', 'tomate', 'cenoura', 'quinoa', 'brocolis', 'abobora', 'arroz', 'integral', 'feijao', 'fritas',      // fileira da frente
    'frango', 'peixe', 'salmao', 'bife', 'omelete', 'moqueca', 'escondidinho', 'lasanha', 'feijoada', 'parmegiana'];            // fileira de trás
  // tipo: salada · prato · pesado · sobremesa · sopa | saude: o quanto mexe no Saudável | enche: quanto tira da fome do dia (vale 2)
  // paradas: as cubas (ou 'sopa' / 'doces') onde ele para | porcoes: [ingrediente, cx, cy, rx, ry, parada, forma] (40 x 40)
  const PRATOS = [
    { id: 'salada', nome: 'Salada verde', preco: 70, tipo: 'salada', saude: 3, enche: 1, vaso: 'prato', paradas: ['alface', 'tomate', 'cenoura'],
      porcoes: [['alface', 20, 20, 13, 12, 0], ['pepino', 26, 14, 4, 4, 0], ['pepino', 13, 26, 4, 4, 0], ['tomate', 13, 15, 5, 5, 1], ['tomate', 22, 27, 4, 4, 1], ['cenoura', 27, 24, 5, 4, 2]] },
    { id: 'caesar', nome: 'Salada Caesar com frango', preco: 85, tipo: 'salada', saude: 2, enche: 1.5, vaso: 'prato', paradas: ['alface', 'frango'],
      porcoes: [['alface', 20, 20, 13, 12, 0], ['croutons', 13, 25, 5, 4, 0], ['parmesao', 15, 13, 5, 3, 0], ['frango', 24, 18, 8, 6, 1], ['molho', 22, 21, 9, 6, 1]] },
    { id: 'quinoa', nome: 'Salada de quinoa', preco: 85, tipo: 'salada', saude: 3, enche: 1.5, vaso: 'prato', paradas: ['quinoa', 'tomate'],
      porcoes: [['quinoa', 20, 20, 12, 11, 0], ['pepino', 13, 26, 4, 4, 0], ['salsinha', 18, 17, 7, 6, 0], ['tomate', 27, 14, 4, 4, 1], ['tomate', 27, 25, 4, 4, 1]] },
    { id: 'frangoInt', nome: 'Frango grelhado com arroz integral', preco: 100, tipo: 'prato', saude: 3, enche: 2, vaso: 'prato', paradas: ['integral', 'brocolis', 'frango'],
      porcoes: [['integral', 13, 14, 7, 6, 0], ['brocolis', 13, 26, 6, 5, 1], ['frango', 25, 20, 8, 7, 2]] },
    { id: 'peixe', nome: 'Peixe grelhado com purê de abóbora', preco: 115, tipo: 'prato', saude: 3, enche: 2, vaso: 'prato', paradas: ['abobora', 'peixe'],
      porcoes: [['abobora', 14, 20, 7, 8, 0], ['salsinha', 13, 18, 3, 3, 0], ['peixe', 26, 18, 7, 6, 1], ['limao', 27, 27, 3, 3, 1]] },
    { id: 'salmao', nome: 'Salmão com legumes', preco: 140, tipo: 'prato', saude: 3, enche: 2, vaso: 'prato', paradas: ['brocolis', 'cenoura', 'salmao'],
      porcoes: [['brocolis', 13, 14, 6, 5, 0], ['cenoura', 13, 26, 5, 4, 1], ['salmao', 25, 20, 8, 7, 2], ['limao', 29, 29, 3, 3, 2]] },
    { id: 'pf', nome: 'Prato feito', preco: 95, tipo: 'prato', saude: 2, enche: 2, vaso: 'prato', paradas: ['arroz', 'feijao', 'bife', 'alface'],
      porcoes: [['arroz', 13, 14, 7, 6, 0], ['feijao', 13, 26, 6, 5, 1], ['bife', 26, 16, 7, 6, 2], ['alface', 26, 27, 6, 4, 3], ['tomate', 22, 29, 3, 3, 3]] },
    { id: 'omelete', nome: 'Omelete com salada', preco: 75, tipo: 'prato', saude: 2, enche: 1, vaso: 'prato', paradas: ['omelete', 'alface'],
      porcoes: [['omelete', 17, 18, 10, 7, 0], ['alface', 25, 28, 7, 4, 1], ['tomate', 29, 22, 3, 3, 1]] },
    { id: 'escondidinho', nome: 'Escondidinho de batata-doce', preco: 105, tipo: 'prato', saude: 2, enche: 2, vaso: 'prato', paradas: ['escondidinho', 'alface'],
      porcoes: [['travessa', 17, 18, 10, 9, 0, 'rect'], ['escondidinho', 17, 18, 8, 7, 0, 'rect'], ['alface', 28, 28, 5, 4, 1]] },
    { id: 'sopa', nome: 'Sopa de legumes', preco: 70, tipo: 'sopa', saude: 2, enche: 1, vaso: 'tigela', paradas: ['sopa'],
      porcoes: [['sopa', 20, 20, 13, 13, 0], ['salsinha', 18, 18, 6, 5, 0]] },
    { id: 'moqueca', nome: 'Moqueca de peixe', preco: 120, tipo: 'prato', saude: 2, enche: 2, vaso: 'prato', paradas: ['arroz', 'moqueca'],
      porcoes: [['arroz', 13, 14, 7, 6, 0], ['moqueca', 23, 22, 10, 9, 1]] },
    { id: 'vegetariano', nome: 'Arroz integral com feijão e legumes', preco: 80, tipo: 'prato', saude: 3, enche: 1.5, vaso: 'prato', paradas: ['integral', 'feijao', 'brocolis', 'cenoura'],
      porcoes: [['integral', 13, 14, 7, 6, 0], ['feijao', 13, 26, 6, 5, 1], ['brocolis', 26, 15, 6, 5, 2], ['cenoura', 26, 26, 6, 4, 3]] },
    { id: 'frutas', nome: 'Salada de frutas', preco: 60, tipo: 'sobremesa', saude: 2, enche: 0.5, vaso: 'tigela', paradas: ['doces'], saudavel: true,
      porcoes: [['frutas', 20, 20, 13, 13, 0], ['hortela', 23, 15, 2, 2, 0]] },
    { id: 'feijoada', nome: 'Feijoada completa', preco: 120, tipo: 'pesado', saude: -3, enche: 2, vaso: 'prato', paradas: ['arroz', 'feijoada'],
      porcoes: [['arroz', 12, 13, 6, 5, 0], ['feijoada', 22, 21, 10, 9, 1], ['couve', 11, 26, 5, 4, 1], ['farofa', 27, 10, 5, 3, 1], ['laranja', 30, 28, 3, 3, 1]] },
    { id: 'lasanha', nome: 'Lasanha à bolonhesa', preco: 110, tipo: 'pesado', saude: -3, enche: 2, vaso: 'prato', paradas: ['lasanha'],
      porcoes: [['molhoV', 20, 21, 12, 10, 0], ['lasanha', 19, 19, 9, 7, 0, 'rect']] },
    { id: 'parmegiana', nome: 'Parmegiana com fritas', preco: 115, tipo: 'pesado', saude: -3, enche: 2, vaso: 'prato', paradas: ['parmegiana', 'fritas', 'arroz'],
      porcoes: [['arroz', 12, 13, 6, 5, 2], ['fritas', 13, 25, 7, 6, 1], ['parmegiana', 25, 20, 8, 8, 0], ['manjericao', 25, 17, 2, 2, 0]] },
    { id: 'pudim', nome: 'Pudim de leite', preco: 60, tipo: 'sobremesa', saude: -2, enche: 0.5, vaso: 'pratinho', paradas: ['doces'],
      porcoes: [['calda', 20, 21, 11, 10, 0], ['pudim', 20, 20, 9, 9, 0]] },
    { id: 'mousse', nome: 'Mousse de maracujá', preco: 55, tipo: 'sobremesa', saude: -2, enche: 0.5, vaso: 'taca', paradas: ['doces'],
      porcoes: [['mousse', 20, 20, 10, 10, 0]] },
    { id: 'petit', nome: 'Petit gâteau com sorvete', preco: 90, tipo: 'sobremesa', saude: -3, enche: 0.5, vaso: 'pratinho', paradas: ['doces'],
      porcoes: [['petit', 17, 22, 8, 8, 0], ['sorvete', 25, 15, 6, 5, 0], ['hortela', 27, 12, 2, 2, 0], ['chocoFio', 20, 20, 11, 10, 0]] },
    { id: 'torta', nome: 'Torta holandesa', preco: 75, tipo: 'sobremesa', saude: -2, enche: 0.5, vaso: 'pratinho', paradas: ['doces'],
      porcoes: [['torta', 20, 21, 11, 10, 0, 'cunha']] },
  ];
  const PRATO = {}; PRATOS.forEach((p) => { PRATO[p.id] = p; });
  const ehSaudavel = (p) => p.saude > 0;
  const DOCES_VITRINE = ['pudim', 'mousse', 'petit', 'torta', 'frutas'];

  // ================================================================== PIXEL ART: os ingredientes (cada pixel pela textura do ingrediente)
  //   pintor(u, v, n, x, y): u, v = posição dentro da porção (−1 a 1) · n = ruído do pixel (0–1) · x, y = o pixel. null = sem nada (furo).
  function hash(x, y, s) { let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 1442695041)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; }
  const anel = (x, y, cel, sx, sy) => {                                 // pecinhas redondas numa grade (fatias, florzinhas...): a distância ao centro da peça e se ela existe
    const lin = Math.floor(y / cel), off = lin % 2 ? cel / 2 : 0, col = Math.floor((x + off) / cel);
    const cx = col * cel - off + cel / 2, cy = lin * cel + cel / 2; return { d: Math.hypot(x + 0.5 - cx, y + 0.5 - cy), dx: x + 0.5 - cx, dy: y + 0.5 - cy, h: hash(col, lin, sx), h2: hash(col, lin, sy) };
  };
  const ING = {
    arroz: { fundo: '#efe9d8', p: (u, v, n) => (n < 0.12 ? '#d9d2bd' : n > 0.8 ? '#ffffff' : n > 0.55 ? '#f8f5ea' : '#efe9d8') },
    integral: { fundo: '#b8935f', p: (u, v, n) => (n < 0.15 ? '#8e6a3e' : n > 0.78 ? '#dcc49a' : n > 0.5 ? '#c4a06c' : '#b48e5c') },
    feijao: { fundo: '#341a0f', p: (u, v, n, x, y) => {                   // o caldo escuro e os grãos (ovais de 3 x 2, com o brilho no canto)
      const lin = Math.floor(y / 2), off = Math.floor(hash(lin, 3, 15) * 4), col = Math.floor((x + off) / 4), lx = (x + off) % 4, q = hash(col, lin, 11);
      if (q > 0.22 && lx < 3) return lx === 0 && y % 2 === 0 ? '#c07a52' : y % 2 ? '#4e2414' : '#7a3e24';
      return n > 0.92 ? '#5a3020' : '#341a0f'; } },
    quinoa: { fundo: '#e2cfa3', p: (u, v, n) => (n < 0.22 ? '#c8a878' : n > 0.95 ? '#c8352b' : n > 0.9 ? '#6cae3e' : n > 0.86 ? '#e8742a' : n > 0.6 ? '#f3e7c6' : '#e2cfa3') },
    alface: { fundo: '#5a9a3a', p: (u, v, n, x, y) => { const t = Math.sin(x * 0.95 + y * 0.55 + n * 1.6) + Math.sin(y * 0.7 - x * 0.3) * 0.6; return t > 1.05 ? '#b8e088' : t > 0.55 ? '#8cc456' : t < -0.9 ? '#3a7228' : '#6cae3e'; } },
    tomate: { fundo: '#c8403a', p: (u, v, n, x, y) => { const c = anel(x, y, 7, 3, 4); if (c.d > 3.2) return null; if (c.d > 2.5) return '#a82a20'; if (c.d > 1.8) return c.dx < 0 && c.dy < 0 ? '#f0705a' : '#e04a3c'; return hash(x, y, 9) > 0.55 ? '#f2d06a' : '#d8403a'; } },
    pepino: { fundo: '#8cc456', p: (u, v, n, x, y) => { const c = anel(x, y, 6, 5, 6); if (c.d > 2.8) return null; if (c.d > 2.2) return '#2f6a2a'; if (c.d > 1.6) return '#a8d878'; return hash(x, y, 4) > 0.6 ? '#f4fbe0' : '#d8f0b0'; } },
    cenoura: { fundo: '#d8682a', p: (u, v, n, x, y) => { if (n < 0.06) return null; const k = ((x * 2 + y) % 6 + 6) % 6; return k < 2 ? '#f29a4a' : k < 4 ? '#e8742a' : '#c85a1a'; } },
    brocolis: { fundo: '#2f6a2a', p: (u, v, n, x, y) => { const c = anel(x, y, 5, 7, 8); if (c.d > 2.6) return n > 0.5 ? '#a8c878' : null; return c.dy < -0.6 ? (n > 0.6 ? '#7ab85a' : '#5a9a42') : n > 0.75 ? '#4a8a3a' : '#2f6a2a'; } },
    abobora: { fundo: '#f2a03a', p: (u, v, n) => (n > 0.94 ? '#ffd890' : u + v < -0.7 ? '#f8c070' : u + v > 0.75 ? '#d8822a' : n < 0.1 ? '#e8902e' : '#f2a03a') },
    fritas: { fundo: '#c88a30', p: (u, v, n, x, y) => { const col = Math.floor((x + Math.floor(y / 7) * 3) / 2), seg = Math.floor((y + col * 3) / 7); if (hash(col, seg, 21) < 0.25) return null; if ((y + col * 3) % 7 === 0) return '#c88a30'; return x % 2 ? '#e8b440' : hash(col, seg, 22) > 0.7 ? '#fff0a0' : '#f8d878'; } },
    frango: { pecas: 8, fundo: '#c8904a', p: (u, v, n, x, y) => { if (((x - y) % 5 + 5) % 5 === 0) return '#7a4a22'; return n > 0.86 ? '#f0c888' : u + v < -0.6 ? '#e8b878' : '#d8a058'; } },
    peixe: { pecas: 8, fundo: '#e8dcc0', p: (u, v, n, x, y) => { if (v < -0.45) return n > 0.5 ? '#d8b07a' : '#c89a5a'; if ((x + y) % 6 === 0) return '#d8c4a0'; return n > 0.82 ? '#fff6e6' : '#efe2c8'; } },
    salmao: { pecas: 8, fundo: '#e8784a', p: (u, v, n, x, y) => { if (v < -0.55 && n > 0.4) return '#c8603a'; if (((x + y * 2) % 6 + 6) % 6 === 0) return '#f8d0b8'; return n < 0.05 ? '#3f8a3a' : u + v < -0.5 ? '#f8a07a' : '#f2875a'; } },
    bife: { pecas: 8, fundo: '#6a3a1e', p: (u, v, n, x, y) => { if (((x + y) % 5 + 5) % 5 === 0) return '#3a1c0c'; return n > 0.86 ? '#a05a34' : u + v < -0.6 ? '#8a4a28' : '#7a4022'; } },
    omelete: { fundo: '#e8c050', p: (u, v, n) => (n > 0.9 ? '#d8a040' : n < 0.1 ? '#3f7a2a' : n < 0.16 ? '#5a9a3a' : u + v < -0.6 ? '#f8e088' : '#f2d060') },
    moqueca: { fundo: '#c84a24', p: (u, v, n, x, y) => { const c = anel(x, y, 5, 13, 14); if (c.h > 0.55 && Math.abs(c.dx) < 1.7 && Math.abs(c.dy) < 1.7) return c.dx < 0 && c.dy < 0 ? '#fff4e0' : '#f2e2c8'; return n < 0.05 ? '#3f8a3a' : n > 0.86 ? '#f28a3a' : '#d8562a'; } },
    escondidinho: { fundo: '#d8a04a', p: (u, v, n) => (n > 0.82 ? '#b87a2a' : n < 0.2 ? '#f8e08a' : u + v < -0.7 ? '#f4cc78' : '#e8b45a') },
    travessa: { fundo: '#e8e2d6', p: (u, v) => (Math.abs(u) > 0.84 || Math.abs(v) > 0.84 ? (u + v < 0 ? '#ffffff' : '#c8c0b0') : '#e8e2d6') },
    lasanha: { fundo: '#e8b04a', p: (u, v, n) => { if (Math.abs(u) > 0.86 || Math.abs(v) > 0.86) return n > 0.5 ? '#b8302a' : '#d8452e'; return n > 0.84 ? '#c8803a' : n < 0.1 ? '#b8302a' : u + v < -0.6 ? '#f8d888' : '#f2c25a'; } },
    molhoV: { fundo: '#b8302a', p: (u, v, n) => (n > 0.86 ? '#d8452e' : n < 0.08 ? '#8a2018' : '#b8302a') },
    feijoada: { fundo: '#22140f', p: (u, v, n, x, y) => { const s = anel(x, y, 7, 31, 32); if (s.h > 0.62 && s.d < 2.6) return s.d > 1.9 ? '#7a2a1a' : hash(x, y, 33) > 0.7 ? '#e8a090' : '#a8442a'; const c = anel(x, y, 3, 34, 35); if (c.h > 0.3 && c.d < 1.4) return c.dx < 0 && c.dy < 0 ? '#5a3a2a' : '#3a221a'; return n > 0.95 ? '#c88a6a' : '#22140f'; } },
    couve: { fundo: '#2f6a2a', p: (u, v, n, x, y) => ((x * 3 + y) % 4 < 2 ? '#2f6a2a' : n > 0.7 ? '#6aa84a' : '#4a8a3a') },
    farofa: { fundo: '#e0bc80', p: (u, v, n) => (n > 0.9 ? '#8a5a2a' : n > 0.6 ? '#f4dcaa' : n < 0.25 ? '#d8b070' : '#e8c890') },
    laranja: { fundo: '#f2a83a', p: (u, v, n) => { const d = Math.hypot(u, v); if (d > 0.82) return '#e8742a'; if (d > 0.7) return '#fff0c8'; const a = Math.atan2(v, u); return Math.abs(Math.sin(a * 4)) < 0.16 ? '#f8d090' : n > 0.8 ? '#f8c050' : '#f2a83a'; } },
    limao: { fundo: '#f2e04a', p: (u, v, n) => { const d = Math.hypot(u, v); if (d > 0.8) return '#a8b828'; if (d > 0.66) return '#fffbe0'; const a = Math.atan2(v, u); return Math.abs(Math.sin(a * 3)) < 0.18 ? '#fff6c0' : n > 0.75 ? '#fff6a0' : '#f2e04a'; } },
    parmegiana: { pecas: 9, fundo: '#c8302a', p: (u, v, n, x, y) => { if (Math.hypot(u, v) > 0.86) return n > 0.4 ? '#c8883a' : '#a86a2a'; const q = hash(Math.floor(x / 3), Math.floor(y / 3), 41); if (q > 0.45) return n > 0.8 ? '#fff0b8' : '#f6dc8a'; return n > 0.85 ? '#e8503a' : '#c8302a'; } },
    manjericao: { fundo: '#3f8a3a', p: (u, v) => (u + v < -0.3 ? '#6aba5a' : '#3f8a3a') },
    hortela: { fundo: '#3f9a4a', p: (u, v) => (u + v < -0.3 ? '#7acc6a' : '#3f9a4a') },
    salsinha: { fundo: null, p: (u, v, n) => (n > 0.86 ? '#3f8a3a' : n > 0.8 ? '#5aaa4a' : null) },
    croutons: { fundo: '#c8904a', p: (u, v, n, x, y) => { const c = anel(x, y, 4, 51, 52); if (c.h < 0.35 || Math.abs(c.dx) > 1.6 || Math.abs(c.dy) > 1.6) return null; return c.dx < -0.4 && c.dy < -0.4 ? '#f0c878' : c.dx > 0.6 || c.dy > 0.6 ? '#a87a38' : '#d8a050'; } },
    parmesao: { fundo: '#f2e8c0', p: (u, v, n) => (n > 0.55 ? (n > 0.85 ? '#fffbe8' : '#f6eec8') : null) },
    molho: { fundo: null, p: (u, v, n, x, y) => (Math.abs(Math.sin(x * 0.55 + y * 0.18) * 2.4 - (y % 7) + 3) < 0.7 ? '#f6efd8' : null) },
    sopa: { fundo: '#e89a3a', p: (u, v, n, x, y) => { const c = anel(x, y, 4, 61, 62); if (c.h > 0.6 && Math.abs(c.dx) < 1.3 && Math.abs(c.dy) < 1.3) return c.h > 0.86 ? '#6cae3e' : c.h > 0.73 ? '#f2e6b0' : '#e8742a'; return n > 0.92 ? '#f8c070' : u + v < -0.8 ? '#f2b050' : '#e89a3a'; } },
    frutas: { fundo: '#f2e6b0', p: (u, v, n, x, y) => { const lin = Math.floor(y / 3), col = Math.floor((x + (lin % 2)) / 3), q = hash(col, lin, 71), lx = (x + (lin % 2)) % 3, ly = y % 3;
      const c = q > 0.84 ? ['#c8352b', '#e8574a'] : q > 0.68 ? ['#f2d84a', '#fff09a'] : q > 0.52 ? ['#e8742a', '#f8a060'] : q > 0.38 ? ['#6cae3e', '#a8d878'] : q > 0.24 ? ['#7a4fb0', '#a87ad0'] : ['#f8f0c0', '#ffffff'];
      return lx === 0 && ly === 0 ? c[1] : lx === 2 || ly === 2 ? (n > 0.5 ? c[0] : '#e8d8a0') : c[0]; } },
    pudim: { fundo: '#e8a04a', p: (u, v, n) => { const d = Math.hypot(u, v); if (d < 0.28) return '#8a4a14'; if (d < 0.38) return '#c87a2a'; return u + v < -0.6 ? '#f8d090' : d > 0.86 ? '#c8782a' : n > 0.9 ? '#f0b860' : '#e8a04a'; } },
    calda: { fundo: '#9a5218', p: (u, v, n) => (n > 0.86 ? '#c87a2a' : u + v < -0.7 ? '#b86a20' : '#9a5218') },
    mousse: { fundo: '#f2d84a', p: (u, v, n) => { const d = Math.hypot(u, v); if (d > 0.84) return d > 0.93 ? '#a8c8d8' : '#e2f2fa'; if (n > 0.93) return '#2a1a10'; if (n > 0.86) return '#f2a83a'; return u + v < -0.6 ? '#fff09a' : '#f2d84a'; } },
    petit: { fundo: '#3a1a0e', p: (u, v, n) => { const d = Math.hypot(u, v); if (d < 0.32) return n > 0.5 ? '#2a0e06' : '#4a2210'; return u + v < -0.6 ? '#6a3a1e' : n > 0.88 ? '#f4f0e8' : '#3a1a0e'; } },
    sorvete: { fundo: '#f8ecd0', p: (u, v, n) => (u + v < -0.7 ? '#ffffff' : u + v > 0.6 ? '#e8d8b4' : n > 0.92 ? '#2a1a10' : '#fff4dc') },
    chocoFio: { fundo: null, p: (u, v, n, x, y) => { const a = y - 20 - Math.sin(x * 0.5) * 2.2 - (x - 20) * 0.35; return Math.abs(a) < 0.6 && Math.hypot(u, v) > 0.45 ? (n > 0.7 ? '#5a2a14' : '#3a1a0e') : null; } },
    torta: { fundo: '#f8f0dc', p: (u, v, n, x) => {                     // a fatia deitada: a cobertura de chocolate, o creme, a base de biscoito e os biscoitos da borda
      if (v > 0.74) return x % 3 === 0 ? '#8a5a2a' : n > 0.5 ? '#c89a5a' : '#b8884a';
      if (u < -0.5) return n > 0.85 ? '#5a2a14' : '#3a1a0e'; if (u > 0.68) return n > 0.6 ? '#e0b878' : '#d0a060';
      return u < -0.3 ? '#fffaf0' : n > 0.92 ? '#e8dcc0' : '#f8f0dc'; } },
  };
  const escurece = (c, f) => { const n = parseInt(c.slice(1), 16), q = (k) => Math.max(0, Math.min(255, Math.round(k * f))); return '#' + ((1 << 24) | (q((n >> 16) & 255) << 16) | (q((n >> 8) & 255) << 8) | q(n & 255)).toString(16).slice(1); };

  // ---- a louça (40 x 40): prato fundo com aba, tigela, pratinho de sobremesa e taça
  const NC = 40, CC = 19.5;
  const VASOS = {
    prato: { r: 19.2, aba: 4.6, cor: '#f6f6f2', aba1: '#ffffff', aba2: '#d8d8d0', fundo: '#efefe8', fio: '#7ab0c8' },
    tigela: { r: 18.6, aba: 3.6, cor: '#f2ead8', aba1: '#fffaf0', aba2: '#c8b898', fundo: '#e2d6bc', fio: '#c8352b' },
    pratinho: { r: 16.4, aba: 3.2, cor: '#f6f6f2', aba1: '#ffffff', aba2: '#d8d8d0', fundo: '#efefe8', fio: '#d95fa0' },
    taca: { r: 13.6, aba: 2.0, cor: '#dff0f8', aba1: '#ffffff', aba2: '#a8c8d8', fundo: '#cfe6f2', fio: null },
  };
  function desenharVaso(px, V) {
    for (let y = 0; y < NC; y++) for (let x = 0; x < NC; x++) {
      const dx = x + 0.5 - CC, dy = y + 0.5 - CC, d = Math.hypot(dx, dy);
      if (d > V.r && d < V.r + 1.8 && dx + dy > V.r * 0.55) { px(x, y, 'rgba(0,0,0,0.2)'); continue; }   // a sombrinha na mesa (embaixo, à direita)
      if (d > V.r) continue;
      if (d > V.r - V.aba) {                                            // a aba: clara em cima à esquerda, escura embaixo à direita, o filete colorido
        const luz = -(dx + dy) / (d || 1);
        px(x, y, V.fio && Math.abs(d - (V.r - V.aba * 0.45)) < 0.5 ? V.fio : luz > 0.55 ? V.aba1 : luz < -0.55 ? V.aba2 : V.cor); continue;
      }
      px(x, y, d > V.r - V.aba - 1.2 ? escurece(V.fundo, 0.9) : V.fundo);
    }
  }
  function dentro(P, x, y) {
    const [, cx, cy, rx, ry, , forma] = P, u = (x + 0.5 - cx) / rx, v = (y + 0.5 - cy) / ry;
    if (forma === 'rect') return Math.abs(u) <= 1 && Math.abs(v) <= 1 ? [u, v] : null;
    if (forma === 'cunha') { const w = (v + 1) / 2; if (v < -1 || v > 1 || Math.abs(u) > w) return null; return [u / (w || 1), v]; }   // a fatia deitada (a ponta para cima, a borda larga embaixo)
    const w = 1 + (hash(Math.round(x), Math.round(y), 91) - 0.5) * 0.16;   // a borda um pouco irregular (comida de verdade)
    return u * u + v * v <= w ? [u, v] : null;
  }
  const CACHE = new Map();
  // o prato: id, estado (0 cheio, 1 comendo, 2 quase, 3 vazio), n = máscara das paradas já feitas (bit i = parada i; para montar no bufê; null = todas)
  function canvasPrato(id, estado, n) {
    const chave = id + ':' + estado + ':' + (n == null ? 'x' : n); if (CACHE.has(chave)) return CACHE.get(chave);
    const P = PRATO[id], V = VASOS[P.vaso], cv = document.createElement('canvas'); cv.width = cv.height = NC; const g = cv.getContext('2d');
    const buf = new Array(NC * NC).fill(null);                         // a cor de cada pixel (para o contorno, sem ler o canvas de volta)
    const px = (x, y, c) => { g.fillStyle = c; g.fillRect(x, y, 1, 1); if (c[0] === '#') buf[y * NC + x] = c; };
    desenharVaso(px, V);
    const esc = [1, 0.7, 0.42, 0][estado || 0], seed = id.length * 7;
    for (const Q0 of P.porcoes) {
      if (n != null && !(n & (1 << Q0[5]))) continue;
      const I = ING[Q0[0]], Q = Q0.slice(); Q[3] = Q0[3] * Math.max(esc, 0.001); Q[4] = Q0[4] * Math.max(esc, 0.001);
      if (esc === 0) {                                                  // vazio: só os restinhos (migalhas, molho)
        for (let y = 0; y < NC; y++) for (let x = 0; x < NC; x++) { const q = dentro(Q0, x, y); if (q && hash(x, y, seed + 5) > 0.93) { const c = I.p(q[0], q[1], hash(x, y, seed), x, y) || I.fundo; if (c) px(x, y, c); } }
        continue;
      }
      const marca = new Uint8Array(NC * NC);
      for (let y = 0; y < NC; y++) for (let x = 0; x < NC; x++) {
        const q = dentro(Q, x, y); if (!q) continue;
        if (estado && hash(x, y, seed + 3) > 0.94 && Math.hypot(q[0], q[1]) > 0.7) continue;   // as garfadas na borda
        const c = I.p(q[0], q[1], hash(x, y, seed), x, y); if (!c) continue;
        px(x, y, c); marca[y * NC + x] = 1;
      }
      // o contorno: escuro embaixo/direita, claro em cima/esquerda (o volume da comida)
      for (let y = 0; y < NC; y++) for (let x = 0; x < NC; x++) {
        if (!marca[y * NC + x] || Q0[0] === 'salsinha' || Q0[0] === 'molho' || Q0[0] === 'chocoFio' || Q0[0] === 'parmesao') continue;
        const vazioB = !marca[(y + 1) * NC + x] || y + 1 >= NC, vazioD = !marca[y * NC + x + 1], vazioC = !marca[(y - 1) * NC + x], vazioE = !marca[y * NC + x - 1];
        const hex = buf[y * NC + x]; if (!hex) continue;
        if (vazioB || vazioD) px(x, y, escurece(hex, 0.72)); else if (vazioC || vazioE) px(x, y, escurece(hex, 1.14));
      }
    }
    if (estado === 3) {                                                 // os talheres cruzados no prato vazio (colher na tigela/pratinho)
      if (P.vaso === 'prato') { for (let k = 0; k < 13; k++) { px(13 + k, 26 - Math.round(k * 0.55), k < 5 ? '#4a4f57' : '#9aa1ab'); px(14 + k, 14 + Math.round(k * 0.55), k > 7 ? '#4a4f57' : '#8c9199'); } px(26, 19, '#9aa1ab'); px(27, 18, '#9aa1ab'); px(26, 21, '#8c9199'); }
      else for (let k = 0; k < 11; k++) px(16 + k, 26 - k, k < 4 ? '#4a4f57' : k > 8 ? '#b8bec6' : '#9aa1ab');
    }
    CACHE.set(chave, cv); return cv;
  }
  // a cuba do bufê (36 x 22): nível 2 cheia (com o "montinho"), 1 pela metade, 0 quase vazia (o inox aparecendo)
  const CW = 36, CH = 22;
  function canvasCuba(id, nivel) {
    const chave = 'cuba:' + id + ':' + nivel; if (CACHE.has(chave)) return CACHE.get(chave);
    const I = ING[id], cv = document.createElement('canvas'); cv.width = CW; cv.height = CH; const g = cv.getContext('2d');
    const px = (x, y, c) => { g.fillStyle = c; g.fillRect(x, y, 1, 1); };
    for (let y = 0; y < CH; y++) for (let x = 0; x < CW; x++) {
      const borda = x === 0 || y === 0 || x === CW - 1 || y === CH - 1, u = (x + 0.5 - CW / 2) / (CW / 2), v = (y + 0.5 - CH / 2) / (CH / 2);
      if (borda) { px(x, y, x + y < CH ? '#d8dde2' : '#8c9199'); continue; }
      const nivelPx = nivel === 2 ? 2 : nivel === 1 ? (v < 0.25 + (hash(x, y, 7) - 0.5) * 0.5 ? 1 : 0) : (v < -0.45 + (hash(x, y, 8) - 0.5) * 0.4 && u < 0.6 ? 1 : 0);
      if (!nivelPx) { const r = x - y * 1.6; px(x, y, r > 10 && r < 13 ? '#d8dde2' : y > CH - 4 ? '#9aa1ab' : '#b8bec6'); continue; }   // o fundo de inox (com o reflexo)
      let c;
      if (I.pecas) {                                                    // grelhados em pedaços (filés lado a lado), com o caldinho entre eles
        const cw = I.pecas + 3, ch = I.pecas - 1, lin = Math.floor(y / ch), off = lin % 2 ? cw / 2 : 0, col = Math.floor((x + off) / cw);
        const pu = (x + off + 0.5 - (col * cw + cw / 2)) / (cw * 0.47), pv = (y + 0.5 - (lin * ch + ch / 2)) / (ch * 0.47);
        c = pu * pu + pv * pv < 1 ? (pu * pu + pv * pv > 0.72 && pu + pv > 0 ? escurece(I.p(pu, pv, hash(x, y, 13), x, y) || I.fundo, 0.75) : I.p(pu, pv, hash(x, y, 13), x, y) || I.fundo)
          : (hash(x, y, 14) > 0.6 ? escurece(I.fundo, 0.75) : escurece(I.fundo, 0.6));
      } else c = I.p(u, v, hash(x, y, 13), x, y) || I.fundo;
      px(x, y, nivel === 2 && Math.hypot(u, v * 1.4) < 0.55 && hash(x, y, 2) > 0.7 ? escurece(c, 1.15) : c);   // o montinho brilha no meio
    }
    for (let x = 1; x < CW - 1; x++) px(x, 1, 'rgba(0,0,0,0.18)');
    CACHE.set(chave, cv); return cv;
  }
  function iconePrato(id, tam) {
    const c = document.createElement('canvas'); c.width = c.height = NC; c.getContext('2d').drawImage(canvasPrato(id, 0), 0, 0);
    c.style.cssText = 'width:' + tam + 'px;height:' + tam + 'px;image-rendering:pixelated;'; return c;
  }

  // ------------------------------------------------------------------ util
  const clampN = (v, a, b) => Math.max(a, Math.min(b, v));
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pk = (l) => l[Math.floor(Math.random() * l.length)];
  const fem = () => typeof PERSONAGEM !== 'undefined' && PERSONAGEM.genero === 'F';

  // ================================================================== o módulo (um por cidade aberta)
  function criar(api) {
    const S = () => api.S();
    const M = { R: null, D: null, renan: null, cida: null, nav: null, grupos: [], cubas: [], tex: new Map(), pratosMesa: new Map(), prox: 3, cozinha: null, servindo: false, rua: {}, atoresRua: [] };
    const dadosR = () => { const d = S().dados; if (!d.restaurante) d.restaurante = { pratos: {} }; return d.restaurante; };
    const hora = () => S().dados.hora;
    const aberto = () => { const h = hora(); return h >= H_ABRE && h < H_FECHA; };
    const caixaLa = () => { const h = hora(); return h >= H_CAIXA && h < H_SAI_CAIXA; };
    const cozinhaLa = () => { const h = hora(); return h >= H_COZINHA && h < H_SAI_COZINHA; };
    const texDe = (cv, chave) => { if (M.tex.has(chave)) return M.tex.get(chave); const t = new THREE.CanvasTexture(cv); t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; M.tex.set(chave, t); return t; };
    const texPrato = (id, est, n) => texDe(canvasPrato(id, est, n), 'p:' + id + ':' + est + ':' + n);
    const texCuba = (id, nv) => texDe(canvasCuba(id, nv), 'c:' + id + ':' + nv);

    // ---------------------------------------------------------------- RENAN e DONA CIDA (modelos)
    function modelo(ap, fem2, roupa, cores) {
      const s = S(); let m = null, opt = null;
      try { if (s.f2 && s.f2.modeloPessoa) { const r = s.f2.modeloPessoa({ ap, fem: fem2, roupa, cores }); m = r.m; opt = r.opt; } } catch (e) { console.warn('[Restaurante] modelo:', e); }
      if (!m) { opt = Object.assign({ camisa: cores[0], listra: cores[0], gola: cores[2], calcao: cores[1], meia: cores[1], sola: '#e6e6e0', corTexto: '#F2F2EE', numero: '', nome: ' ', fundoNome: 'rgba(0,0,0,0)', manga: 0, meiao: 1, cabecao: 1, escala: 1 }, ap); m = makeAthlete(opt); }
      return { m, opt };
    }
    const acha = (lista, n, d) => { const i = (lista || []).findIndex((x) => x.nome === n); return i >= 0 ? i : d; };
    function apRenan() { return Object.assign(gerarAparencia(5150, 'M'), { pele: '#C99A77', cabelo: '#15100D', corBarba: '#15100D', estilo: acha(typeof ESTILOS_CABELO !== 'undefined' && ESTILOS_CABELO, 'Raspado', 1), barba: 0 }); }
    function apCida() { return Object.assign(gerarAparencia(7721, 'F'), { pele: '#E3B592', cabelo: '#9a958e', corBarba: '#9a958e', estilo: acha(typeof ESTILOS_CABELO !== 'undefined' && ESTILOS_CABELO, 'Coque alto', 2) }); }
    const ROUPA_RENAN = [3, ['#1f7a4d', '#2a2a2e', '#f4f4ec', '#1c1c1f']], ROUPA_CIDA = [8, ['#f4f4ec', '#4a4a4e', '#f4f4ec', '#1c1c1f']];
    function enfeitarRenan(m, opt) {                                    // o crachá e o boné verde do restaurante
      const kc = (opt && opt.cabecao) || 1, G = new api.Geo();
      G.box(0.03, 0.09, 0.12, '#f4f4ec', 0.19, 1.06, -0.13); G.box(0.032, 0.03, 0.12, '#1f7a4d', 0.19, 1.13, -0.13);
      const yc = 1.36 + 0.5 * kc; G.box(0.56 * kc, 0.13, 0.6 * kc, '#1f7a4d', -0.01 * kc, yc - 0.01, 0); G.box(0.18 * kc, 0.03, 0.44 * kc, '#17603c', 0.35 * kc, yc - 0.01, 0); G.box(0.012, 0.06, 0.14 * kc, '#f4f4ec', 0.272 * kc, yc + 0.035, 0);   // (7.1.6) o boné cobre a cabeça inteira (a aba curta e o emblema liso na frente): antes ele ficava menor que a cabeça, com um bloco branco espetado
      m.corpo.add(G.malha(api.MAT));
    }
    function enfeitarCida(m, opt) {                                     // o dólmã de cozinheira (botões), o avental verde e a touca
      const kc = (opt && opt.cabecao) || 1, G = new api.Geo();
      G.box(0.05, 0.6, 0.46, '#2f7a4d', 0.17, 0.48, 0); G.box(0.04, 0.05, 0.56, '#f4f4ec', 0.18, 0.92, 0);
      for (let k = 0; k < 3; k++) { G.box(0.02, 0.035, 0.035, '#3a3a3e', 0.2, 1.0 + k * 0.08, -0.08); G.box(0.02, 0.035, 0.035, '#3a3a3e', 0.2, 1.0 + k * 0.08, 0.08); }
      const yc = 1.36 + 0.49 * kc; G.box(0.54 * kc, 0.16, 0.54 * kc, '#f4f4f0', 0, yc + 0.0, 0); G.box(0.5 * kc, 0.08, 0.5 * kc, '#e8e8e2', 0, yc + 0.16, 0);
      m.corpo.add(G.malha(api.MAT));
    }
    function criarRenan() { const { m, opt } = modelo(apRenan(), false, ROUPA_RENAN[0], ROUPA_RENAN[1]); enfeitarRenan(m, opt); const A = api.atorDe(m, opt, 'equipeRs'); A.vel = 1.3; return A; }
    function criarCida() { const { m, opt } = modelo(apCida(), true, ROUPA_CIDA[0], ROUPA_CIDA[1]); enfeitarCida(m, opt); const A = api.atorDe(m, opt, 'equipeRs'); A.vel = 1.25; return A; }

    // ---------------------------------------------------------------- os PROPS: o prato na mão, a cuba na mão, o garfo
    function malhaPrato(id, est, n, tam) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(tam, tam), new THREE.MeshLambertMaterial({ map: texPrato(id, est || 0, n), transparent: true, alphaTest: 0.08 }));
      m.rotation.x = -Math.PI / 2; return m;
    }
    function darPrato(A, id, n) {
      tirarPrato(A);
      const g = new THREE.Group(), pl = malhaPrato(id, 0, n, 0.34); pl.position.y = 0.012; g.add(pl);
      const G = new api.Geo(); G.box(0.24, 0.012, 0.24, '#d8d8d0', 0, 0, 0); g.add(G.malha(api.MAT));
      g.position.set(0.42, 1.09, 0); A.m.corpo.add(g); A.prato = { g, pl, id, n };
    }
    function trocarPrato(A, n) { const P = A.prato; if (!P) return; P.n = n; P.pl.material.map = texPrato(P.id, 0, n); P.pl.material.needsUpdate = true; }
    function tirarPrato(A) { if (A.prato) { if (A.prato.g.parent) A.prato.g.parent.remove(A.prato.g); A.prato.pl.material.dispose(); A.prato.pl.geometry.dispose(); } A.prato = null; }
    function darGarfo(A) {
      if (A.garfo) return; const G = new api.Geo();
      G.box(0.02, 0.15, 0.02, '#c9ced4', 0.03, -0.36, 0); G.box(0.04, 0.05, 0.012, '#d8dde2', 0.03, -0.45, 0);
      A.garfo = G.malha(api.MAT); A.m.bracoD.cotovelo.add(A.garfo);
    }
    function tirarGarfo(A) { if (A.garfo && A.garfo.parent) A.garfo.parent.remove(A.garfo); A.garfo = null; }
    function darCuba(A, id, nv) {
      tirarCuba(A);
      const g = new THREE.Group(), G = new api.Geo(); G.box(0.5, 0.08, 0.32, '#9aa1ab', 0, 0, 0); g.add(G.malha(api.MAT));
      const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.48, 0.3), new THREE.MeshLambertMaterial({ map: texCuba(id, nv) })); pl.rotation.x = -Math.PI / 2; pl.position.y = 0.082; g.add(pl);
      g.position.set(0.4, 1.1, 0); A.m.corpo.add(g); A.cubaMao = { g, pl };
    }
    function tirarCuba(A) { if (A.cubaMao) { if (A.cubaMao.g.parent) A.cubaMao.g.parent.remove(A.cubaMao.g); A.cubaMao.pl.material.dispose(); } A.cubaMao = null; }

    // ---------------------------------------------------------------- AS POSES (A.poseFn, por cima do poseAtor)
    function poseRestaurante(A, m, r) {
      const t = A.t || S().t || 0;
      if (A.poseRs === 'serve') {                                      // a mão direita por cima do bufê (a concha), a esquerda segurando o prato
        const w = Math.sin(t * 6);
        m.bracoD.rotation.z = 1.25 + w * 0.12; m.bracoD.rotation.x = -0.05; usarCotovelo(m.bracoD, 0, 0.35 + w * 0.2);
        m.bracoE.rotation.z = 0.6; m.bracoE.rotation.x = -0.4; usarCotovelo(m.bracoE, 0, 0.85); if (!(A.esbarrao > 0)) m.corpo.rotation.z = -0.08;
      } else if (A.poseRs === 'come') {                                // sentado: o garfo vai do prato à boca; a mão esquerda apoiada na mesa
        const p = ((t * 0.42) % 1), k = 0.5 - 0.5 * Math.cos(p * Math.PI * 2);
        m.bracoD.rotation.z = 0.72 + k * 0.5; m.bracoD.rotation.x = 0.12; usarCotovelo(m.bracoD, 0, 0.85 + k * 0.95);
        m.bracoE.rotation.z = 0.75; m.bracoE.rotation.x = -0.2; usarCotovelo(m.bracoE, 0, 0.8);
        if (m.cabecaLigada !== undefined) usarCabeca(m, k > 0.75 ? -0.05 + Math.sin(t * 9) * 0.08 : 0.08);
      } else if (A.prato || A.cubaMao || A.poseRs === 'leva') {        // levando o prato (ou a cuba) com as duas mãos
        m.bracoE.rotation.z = m.bracoD.rotation.z = 0.6; m.bracoE.rotation.x = -0.4; m.bracoD.rotation.x = 0.4;
        usarCotovelo(m.bracoE, 0, 0.85); usarCotovelo(m.bracoD, 0, 0.85);
        if (A.poseRs === 'poe' && !(A.esbarrao > 0)) m.corpo.rotation.z = -0.3;
      } else if (A.poseRs === 'cobra') {                               // o Renan registrando e passando o cartão
        const w = Math.sin(t * 9), w2 = Math.sin(t * 9 + 1.7);
        m.bracoD.rotation.z = 0.95 + w * 0.3; m.bracoE.rotation.z = 0.85 + w2 * 0.25; usarCotovelo(m.bracoD, 0, 1.0 + w * 0.2); usarCotovelo(m.bracoE, 0, 1.1);
      } else if (A.poseRs === 'balcao') {                              // mãos apoiadas no balcão
        m.bracoD.rotation.z = m.bracoE.rotation.z = 0.5; usarCotovelo(m.bracoD, 0, 0.6); usarCotovelo(m.bracoE, 0, 0.6); if (!(A.esbarrao > 0)) m.corpo.rotation.z = -0.06;   // (7.1.6) esbarraram nele: o cambaleio aparece (a pose não apaga)
      }
    }
    function pose(A, p) { A.poseRs = p; A.poseFn = p || A.prato || A.cubaMao ? poseRestaurante : null; }

    // ---------------------------------------------------------------- NAVEGAÇÃO NO SALÃO: grade de 0,35 m e A* (como no pizzaria.js)
    const CEL = 0.35, RR = 0.33;
    function livreEst(x, z) {
      const L = M.R.lim; if (x < L.x0 || x > L.x1 || z < L.z0 || z > L.z1) return false;
      for (const b of M.R.col) if (x > b.x0 - RR && x < b.x1 + RR && z > b.z0 - RR && z < b.z1 + RR) return false;
      for (const c of M.cadeiras || []) if (Math.abs(x - c.x) < 0.22 + RR * 0.8 && Math.abs(z - c.z) < 0.22 + RR * 0.8) return false;   // (7.1.6) as cadeiras também: o caminho contorna as mesas pelos corredores
      return true;
    }
    function montarNav() {
      const L = M.R.lim, nx = Math.floor((L.x1 - L.x0) / CEL) + 1, nz = Math.floor((L.z1 - L.z0) / CEL) + 1, livre = new Uint8Array(nx * nz);
      for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) livre[j * nx + i] = livreEst(L.x0 + i * CEL, L.z0 + j * CEL) ? 1 : 0;
      M.nav = { nx, nz, livre, x0: L.x0, z0: L.z0 };
    }
    const cel = (x, z) => { const N = M.nav; return [clampN(Math.round((x - N.x0) / CEL), 0, N.nx - 1), clampN(Math.round((z - N.z0) / CEL), 0, N.nz - 1)]; };
    const cen = (i, j) => ({ x: M.nav.x0 + i * CEL, z: M.nav.z0 + j * CEL });
    function celLivreMaisPerto(i, j) {
      const N = M.nav; if (N.livre[j * N.nx + i]) return [i, j];
      for (let r = 1; r < 12; r++) { let melhor = null, bd = 1e9;
        for (let dj = -r; dj <= r; dj++) for (let di = -r; di <= r; di++) { if (Math.max(Math.abs(di), Math.abs(dj)) !== r) continue; const a = i + di, b = j + dj; if (a < 0 || b < 0 || a >= N.nx || b >= N.nz || !N.livre[b * N.nx + a]) continue; const d = di * di + dj * dj; if (d < bd) { bd = d; melhor = [a, b]; } }
        if (melhor) return melhor; }
      return [i, j];
    }
    function pontoLivre(x, z) { if (livreEst(x, z)) return { x, z }; const [i, j] = celLivreMaisPerto(...cel(x, z)); return cen(i, j); }
    function vista(a, b) { const d = Math.hypot(b.x - a.x, b.z - a.z), n = Math.ceil(d / 0.12); for (let k = 1; k <= n; k++) { const u = k / n; if (!livreEst(a.x + (b.x - a.x) * u, a.z + (b.z - a.z) * u)) return false; } return true; }
    function caminho(x0, z0, x1, z1) {
      if (!M.nav) montarNav();
      const N = M.nav, fim = pontoLivre(x1, z1), [si, sj] = celLivreMaisPerto(...cel(x0, z0)), [ti, tj] = cel(fim.x, fim.z);
      if (vista({ x: x0, z: z0 }, fim)) return [fim];
      const idx = (i, j) => j * N.nx + i, n = N.nx * N.nz, g = new Float32Array(n).fill(1e9), de = new Int32Array(n).fill(-1), fechado = new Uint8Array(n);
      const h = (i, j) => Math.hypot(i - ti, j - tj), ab = [[h(si, sj), si, sj]]; g[idx(si, sj)] = 0;
      let achou = false;
      while (ab.length) {
        let mi = 0; for (let k = 1; k < ab.length; k++) if (ab[k][0] < ab[mi][0]) mi = k;
        const [, i, j] = ab[mi]; ab[mi] = ab[ab.length - 1]; ab.pop();
        const k0 = idx(i, j); if (fechado[k0]) continue; fechado[k0] = 1;
        if (i === ti && j === tj) { achou = true; break; }
        for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
          if (!di && !dj) continue; const a = i + di, b = j + dj; if (a < 0 || b < 0 || a >= N.nx || b >= N.nz) continue;
          const k1 = idx(a, b); if (!N.livre[k1] || fechado[k1]) continue;
          if (di && dj && (!N.livre[idx(i + di, j)] || !N.livre[idx(i, j + dj)])) continue;
          const ng = g[k0] + (di && dj ? 1.414 : 1); if (ng < g[k1]) { g[k1] = ng; de[k1] = k0; ab.push([ng + h(a, b), a, b]); }
        }
      }
      if (!achou) return [fim];
      const cs = []; for (let k = idx(ti, tj); k >= 0; k = de[k]) cs.push(cen(k % N.nx, Math.floor(k / N.nx)));
      cs.reverse(); cs.push(fim);
      const out = []; let a = { x: x0, z: z0 }, k = 0;
      while (k < cs.length) { let far = k; for (let q = cs.length - 1; q > k; q--) if (vista(a, cs[q])) { far = q; break; } out.push(cs[far]); a = cs[far]; k = far + 1; }
      return out;
    }
    function genteNaFrente(A, nx, nz) {
      const s = S();
      for (const B of s.npcs.concat([s.jog])) { if (B === A || B.oculto || B.sentado || B === M.cida) continue; const dn = Math.hypot(nx - B.x, nz - B.z); if (dn < 0.55 && dn < Math.hypot(A.x - B.x, A.z - B.z) - 1e-4) return true; }
      return false;
    }
    function andarP(A, dt) {
      const R = A.rotaP; if (!R || !R.length) { A.andando = false; return true; }
      const q = R[0], dx = q.x - A.x, dz = q.z - A.z, d = Math.hypot(dx, dz), v = (A.vel || 1.2) * dt;
      if (d <= Math.max(v, 0.04)) { A.x = q.x; A.z = q.z; R.shift(); A.esperaP = 0; if (!R.length) { A.andando = false; return true; } return false; }
      const tenta = (ux, uz, fantasma) => { const nx = A.x + ux * v, nz = A.z + uz * v; fantasma = fantasma || A.livreP; if (!fantasma && !livreEst(nx, nz) && livreEst(A.x, A.z)) return false; if (!fantasma && genteNaFrente(A, nx, nz)) return false; A.x = nx; A.z = nz; A.yawAlvo = Math.atan2(-uz, ux); return true; };
      const ux = dx / d, uz = dz / d, esp = A.esperaP || 0;
      let ok = tenta(ux, uz, false);
      if (!ok && esp > 0.3) for (const ang of [0.6, -0.6, 1.1, -1.1]) { const c = Math.cos(ang), s2 = Math.sin(ang); if (tenta(ux * c - uz * s2, ux * s2 + uz * c, false)) { ok = true; break; } }
      if (!ok && esp > 1.4) ok = tenta(ux, uz, true);
      A.andando = ok; A.correndo = false; A.esperaP = ok ? Math.max(0, esp - dt * 2) : esp + dt;
      return false;
    }
    const irPara = (A, x, z) => { A.rotaP = caminho(A.x, A.z, x, z); };
    // o jogador (na cena) andando pelo caminho do A*
    async function andarJog(x, z, vel) { const J = S().jog, r = caminho(J.x, J.z, x, z); await api.andar(J, r.map((p) => [p.x, p.z]), vel || 1.7); }

    // ---------------------------------------------------------------- entrou / saiu (a sala vem do interiores.js, com R.restaurante)
    function entrou(R, idx) {
      const s = S(); M.R = R; M.D = R.restaurante || null; if (!M.D) return;
      s.falantesExtra = s.falantesExtra || {};
      M.mesas = M.D.mesas.map((T0, i) => ({ i, x: T0.x, z: T0.z, assentos: T0.assentos.map((k) => idx[k]).filter(Boolean), grupo: null }));
      M.cadeiras = M.mesas.flatMap((T0) => T0.assentos.map((a) => ({ x: a.x, z: a.z }))); M.nav = null; montarNav();
      M.grupos = []; M.prox = rnd(2, 5); M.pratosMesa = new Map(); M.servindo = false; M.ordemFila = 0;
      montarCubas(); montarVitrine(); montarCardapio();
      M.folha = M.D.folha || null; M.folhaAng = 0;
      if (cozinhaLa()) { M.cida = criarCida(); M.cida.oculto = true; esconder(M.cida, true); M.cozinha = { fase: 'dentro', t: rnd(4, 9) }; s.falantesExtra.cida = { A: M.cida, nome: T('Dona Cida'), voz: 1 }; }
      if (caixaLa()) { const C = M.D.caixa; M.renan = criarRenan(); s.npcs.push(M.renan); M.renan.x = C.x; M.renan.z = C.z; M.renan.yaw = M.renan.yawAlvo = C.yaw; pose(M.renan, 'balcao'); s.falantesExtra.renan = { A: M.renan, nome: T('Renan'), voz: 2 }; }
      if (aberto() && M.renan && api.lojaGente) {                      // quem já está lá dentro é quem ENTROU (o registro da cidade)
        const porG = new Map(); for (const e of api.lojaGente('restaurante')) { if (!porG.has(e.g)) porG.set(e.g, []); porG.get(e.g).push(e); }
        const livres = M.mesas.filter(mesaLivre).sort(() => Math.random() - 0.5);
        for (const ents of porG.values()) {
          const T0 = livres.length > 2 ? livres.shift() : null;
          if (!T0) { for (const e of ents) api.lojaSaiu('restaurante', e); continue; }
          const d = ents[0].desde || 0; novoGrupo(T0, d < 0.12 ? 'bufe' : 'come', ents, d);
        }
      }
    }
    function esconder(A, sim) {
      const s = S(); A.oculto = sim; A.m.raiz.visible = !sim; if (A.blob) A.blob.visible = !sim;
      if (sim) { s.meus.delete(A.m); const i = s.npcs.indexOf(A); if (i >= 0) s.npcs.splice(i, 1); }
      else { s.meus.add(A.m); if (!s.npcs.includes(A)) s.npcs.push(A); }
    }
    const RESTA_FASE = { entra: 1.0, bufe: 0.9, mesa: 0.8, come: 0.6, acabou: 0.15, fila: 0.12, paga: 0.08, sai: 0.02 };
    function saiu() {
      const s = S();
      if (api.lojaRestam) { const L = []; for (const g of M.grupos) for (const A of g.membros) if (A.reg && A.rs) L.push({ e: A.reg, resta: Math.max(0.02, (RESTA_FASE[A.rs.fase] || 0.5) - (A.rs.fase === 'come' ? (A.rs.est || 0) * 0.12 : 0)) }); api.lojaRestam('restaurante', L); }
      if (s.falantesExtra) { delete s.falantesExtra.renan; delete s.falantesExtra.cida; }
      if (s.jog) { tirarPrato(s.jog); tirarGarfo(s.jog); if (s.jog.poseFn === poseRestaurante) s.jog.poseFn = null; s.jog.poseRs = null; }
      M.R = null; M.D = null; M.renan = null; M.cida = null; M.nav = null; M.grupos = []; M.mesas = null; M.cubas = []; M.pratosMesa = new Map(); M.cozinha = null; M.folha = null; M.servindo = false;
    }

    // ---- as cubas (a comida por cima de cada uma), a vitrine de sobremesas e o quadro do cardápio
    function montarCubas() {
      M.cubas = M.D.cubas.map((c, k) => {
        const id = CUBAS[k], nv = Math.random() < 0.7 ? 2 : 1, m = new THREE.Mesh(new THREE.PlaneGeometry(0.82, 0.5), new THREE.MeshLambertMaterial({ map: texCuba(id, nv) }));
        m.rotation.x = -Math.PI / 2; m.position.set(c.x, c.y, c.z); M.R.grupo.add(m);
        return { k, id, x: c.x, z: c.z, nivel: nv, m, porcoes: rnd(0, 1) };
      });
    }
    function nivelCuba(C, nv) { C.nivel = nv; C.m.material.map = texCuba(C.id, nv); C.m.material.needsUpdate = true; }
    function servirDaCuba(id) {                                        // alguém se serviu: a cuba vai esvaziando (cheia → metade → quase vazia)
      const C = M.cubas.find((c) => c.id === id); if (!C) return;
      C.porcoes += rnd(0.25, 0.45); if (C.porcoes >= 1 && C.nivel > 0) { C.porcoes = 0; nivelCuba(C, C.nivel - 1); }
      if (C.nivel === 0 && M.cozinha && M.cozinha.fase === 'dentro') M.cozinha.t = Math.min(M.cozinha.t, rnd(2, 5));   // acabou: a Dona Cida já vem trocar
    }
    function montarVitrine() {
      (M.D.vitrine || []).forEach((p, i) => { const id = DOCES_VITRINE[i % DOCES_VITRINE.length], m = malhaPrato(id, 0, null, 0.46); m.position.set(p.x, p.y, p.z); M.R.grupo.add(m); });
    }
    function montarCardapio() {
      const P = M.D.cardapio; if (!P) return;
      const W = 300, H = 82, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
      g.fillStyle = '#1f3a28'; g.fillRect(0, 0, W, H); g.fillStyle = '#2a4a34'; for (let x = 0; x < W; x += 3) for (let y = (x / 3) % 2; y < H; y += 6) g.fillRect(x, y, 1, 1);
      PRATOS.forEach((p, i) => {
        const cx = 2 + (i % 10) * 29.6, cy = 2 + Math.floor(i / 10) * 40;
        g.drawImage(canvasPrato(p.id, 0), cx + 2, cy, 26, 26);
        g.fillStyle = p.tipo === 'sobremesa' && !p.saudavel ? '#f2a8c0' : p.saude > 0 ? '#9fe3a8' : '#f2c27a';
        g.font = 'bold 9px monospace'; g.textAlign = 'center'; g.fillText(String(p.preco), cx + 15, cy + 36);
      });
      const tx = new THREE.CanvasTexture(cv); tx.magFilter = THREE.NearestFilter; tx.minFilter = THREE.LinearFilter; M.tex.set('cardapio' + Math.random(), tx);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(P.w, P.h), new THREE.MeshLambertMaterial({ map: tx })); m.position.set(P.x, P.y, P.z); M.R.grupo.add(m);
    }
    // o prato em cima da mesa (na frente da cadeira), com o estado
    function pratoNaMesa(chave, a, id, est) {
      let m = M.pratosMesa.get(chave);
      if (est == null) { if (m) { if (m.parent) m.parent.remove(m); m.material.dispose(); m.geometry.dispose(); M.pratosMesa.delete(chave); } return; }
      if (!m) { m = malhaPrato(id, est, null, 0.42); const fx = Math.cos(a.yaw), fz = -Math.sin(a.yaw); m.position.set(a.x + fx * 0.47, 0.797, a.z + fz * 0.47); M.R.grupo.add(m); M.pratosMesa.set(chave, m); }
      m.material.map = texPrato(id, est, null); m.material.needsUpdate = true;
    }

    // ---------------------------------------------------------------- CLIENTES (grupos de 1 ou 2 por mesa; cada um se serve e paga o seu)
    const FLUXO = ['vazio', 'vazio', 'medio', 'medio', 'cheio', 'cheio', 'cheio'];
    function alvoGrupos() { const f = FLUXO[api.diaSemana()]; return f === 'vazio' ? 3 : f === 'medio' ? 4 : 6; }
    const mesaLivre = (T0) => !T0.grupo && T0.assentos.every((a) => !a.ocupado);
    function escolherPratoNPC() { const L = PRATOS.filter((p) => p.tipo !== 'sobremesa'); const s = L.filter((p) => p.saude > 0); return (Math.random() < 0.72 ? pk(s) : pk(L)).id; }
    // as paradas do prato, na ordem da fila do bufê (de oeste para leste); i = o número da parada no prato (para montar o desenho)
    function paradasDe(p) { return p.paradas.map((id, i) => (id === 'sopa' ? { x: M.D.sopa.x, z: M.D.sopa.z, id, i } : id === 'doces' ? { x: M.D.doces.x, z: M.D.doces.z, id, i } : { x: (M.cubas.find((c) => c.id === id) || M.cubas[0]).x, z: M.D.linha, id, i })).sort((a, b) => a.x - b.x); }
    const mascara = (par, k) => par.slice(0, k).reduce((m, q) => m | (1 << q.i), 0);
    function novoGrupo(T0, fase, ents, desde) {
      const s = S(), n = ents ? Math.min(2, ents.length) : Math.random() < 0.5 ? 2 : 1, g = { mesa: T0, membros: [], fase };
      T0.grupo = g;
      for (let i = 0; i < n; i++) {
        const a = T0.assentos[i * 2 % T0.assentos.length] && !T0.assentos[i * 2 % T0.assentos.length].ocupado ? T0.assentos[i * 2 % T0.assentos.length] : T0.assentos.find((q) => !q.ocupado);
        if (!a) break;
        const e = ents && ents[i], A = e && api.semente ? api.criarPessoa(s.f2, api.semente(e.seed), e.fem) : api.criarPessoa(s.f2, Math.random, Math.random() < 0.5);
        A.tipo = 'clienteRs'; A.vel = 1.05 + Math.random() * 0.3; a.ocupado = A; if (e) A.reg = e;
        const p = PRATO[escolherPratoNPC()];
        A.rs = { g, a, prato: p.id, paradas: paradasDe(p), k: 0, fase, t: 0, est: 0 };
        if (fase === 'entra') {
          const ent = M.R.entrada; A.x = ent.x - 0.5 + i * 0.6; A.z = ent.z + 0.3 + i * 0.4; A.yaw = A.yawAlvo = Math.PI / 2; A.rs.atraso = i * 1.1;
          irPara(A, M.D.pratos.x, M.D.pratos.z);
        } else if (fase === 'bufe') {                                   // já estava se servindo
          A.rs.k = Math.floor(Math.random() * A.rs.paradas.length); const q = A.rs.paradas[A.rs.k], pt = pontoLivre(q.x + (i ? 0.5 : 0), q.z);
          A.x = pt.x; A.z = pt.z; A.rs.fase = 'bufe'; darPrato(A, p.id, mascara(A.rs.paradas, A.rs.k)); pose(A, null); A.rotaP = null;
        } else {                                                        // já comendo, sentado
          sentarNPC(A, a); A.rs.fase = 'come'; A.rs.est = clampN(Math.floor(((desde || 0.3) - 0.12) / 0.2), 0, 2); A.rs.t = rnd(4, 9); comecarComer(A);
        }
        s.npcs.push(A); api.poseAtor(A, 0.016); g.membros.push(A);
      }
      if (!g.membros.length) { T0.grupo = null; return null; }
      M.grupos.push(g); return g;
    }
    function sentarNPC(A, a) { A.sentado = true; A.x = a.x; A.z = a.z; A.assento = a.h; A.yaw = A.yawAlvo = a.yaw; A.andando = false; A.rotaP = null; }
    function pontoDaCadeira(a) { const fx = Math.cos(a.yaw), fz = -Math.sin(a.yaw); return pontoLivre(a.x - fx * 0.6, a.z - fz * 0.6); }
    function comecarComer(A) { tirarPrato(A); darGarfo(A); pose(A, 'come'); pratoNaMesa(A, A.rs.a, A.rs.prato, A.rs.est); }
    function portaLivre() { const s = S(), e = M.R.entrada; for (const A of s.npcs) if (!A.sentado && A !== s.jog && Math.hypot(A.x - e.x, A.z - e.z) < 1.6) return false; return !M.grupos.some((g) => g.membros.some((A) => A.rs && A.rs.fase === 'entra' && A.rs.t < 2)); }
    function chegou(ents) {
      if (!M.mesas || !M.renan || !aberto() || hora() >= H_ULTIMO || !portaLivre()) return false;
      if (M.grupos.length >= alvoGrupos() + 1) return false;
      const livres = M.mesas.filter(mesaLivre); if (livres.length < 3) return false;   // nunca lota (sobram mesas, uma é a do jogador)
      return !!novoGrupo(pk(livres), 'entra', ents);
    }
    function tickFluxo(dt) {
      if (!M.mesas || !M.renan || api.lojaGente) return;                // com o registro, quem chega vem de fora (chegou)
      M.prox -= dt; if (M.prox > 0) return; M.prox = rnd(8, 15);
      if (!aberto() || hora() >= H_ULTIMO || M.grupos.length >= alvoGrupos()) return;
      const livres = M.mesas.filter(mesaLivre); if (livres.length < 3 || !portaLivre()) return;
      novoGrupo(pk(livres), 'entra');
    }
    // a FILA DO CAIXA: até 4 lugares para oeste do tapetinho (o 1.º paga). O jogador pagando passa na frente.
    function vagaFila(k) { const P = M.D.pagar; return pontoLivre(P.x - k * 0.8, P.z); }
    function tickFila() {
      const fila = []; for (const g of M.grupos) for (const A of g.membros) if (A.rs && (A.rs.fase === 'fila' || A.rs.fase === 'paga')) fila.push(A);
      fila.sort((a, b) => a.rs.ordem - b.rs.ordem);
      const desloca = M.jogPagando ? 1 : 0;
      fila.forEach((A, k0) => { const k = k0 + desloca; if (A.rs.vaga !== k) { A.rs.vaga = k; const q = vagaFila(k); A.rotaP = caminho(A.x, A.z, q.x, q.z); } if (k === 0 && A.rs.fase === 'fila') { A.rs.fase = 'paga'; A.rs.tc = 0; } });
    }
    function rotaSaida(A) { const sd = M.R.saida; const r = caminho(A.x, A.z, sd.x + 0.5, sd.z - 1.4); r.push({ x: sd.x + 0.4, z: sd.z }); return r; }
    function sairCliente(A) {
      const s = S(), g = A.rs && A.rs.g; tirarPrato(A); tirarGarfo(A); pratoNaMesa(A, null, null, null);
      if (A.rs && A.rs.a && A.rs.a.ocupado === A) A.rs.a.ocupado = null;
      if (A.reg && api.lojaSaiu) api.lojaSaiu('restaurante', A.reg); api.descartarPessoa(A);
      if (g) { g.membros = g.membros.filter((B) => B !== A && s.npcs.includes(B)); if (!g.membros.length) { M.grupos = M.grupos.filter((q) => q !== g); if (g.mesa.grupo === g) g.mesa.grupo = null; } }
    }
    // (chamado pela cidade em tickPessoas para cada cliente)
    function tickCliente(A, dt) {
      const C = A.rs; if (!C || !M.D) return; C.t += dt;
      if (C.fase === 'sai') { if (andarP(A, dt) || Math.hypot(A.x - M.R.saida.x, A.z - M.R.saida.z) < 0.7 || C.t > 30) sairCliente(A); return; }
      if (C.fase === 'entra') {
        if (C.atraso > 0) { C.atraso -= dt; A.andando = false; return; }
        if (andarP(A, dt) || C.t > 25) { C.fase = 'prato'; C.t = 0; A.andando = false; A.yawAlvo = Math.PI / 2; }
      } else if (C.fase === 'prato') {                                  // pega o prato no carrinho
        if (C.t > 0.8 && !A.prato) { darPrato(A, C.prato, 0); pose(A, null); }
        if (C.t > 1.2) { C.fase = 'bufe'; C.k = 0; C.t = 0; const q = C.paradas[0]; A.rotaP = caminho(A.x, A.z, q.x, q.z); C.chegou = false; }
      } else if (C.fase === 'bufe') {                                   // de cuba em cuba
        const q = C.paradas[C.k];
        if (!C.chegou) { if (!A.rotaP) A.rotaP = caminho(A.x, A.z, q.x, q.z); if (andarP(A, dt) || C.t > 14) { C.chegou = true; C.t = 0; A.andando = false; A.yawAlvo = Math.PI / 2; pose(A, 'serve'); } return; }
        if (C.t > 1.3) {
          pose(A, null); servirDaCuba(q.id); C.k++; trocarPrato(A, mascara(C.paradas, C.k)); C.chegou = false; C.t = 0; A.rotaP = null;
          if (C.k >= C.paradas.length) { C.fase = 'mesa'; trocarPrato(A, null); const p = pontoDaCadeira(C.a); A.rotaP = caminho(A.x, A.z, p.x, p.z); }
        }
      } else if (C.fase === 'mesa') {
        if (andarP(A, dt) || C.t > 25) { sentarNPC(A, C.a); C.fase = 'come'; C.t = 0; C.est = 0; C.tEst = rnd(7, 11); comecarComer(A); }
      } else if (C.fase === 'come') {
        C.tEst = (C.tEst == null ? rnd(6, 10) : C.tEst) - dt; A.fala = false;
        if (C.tEst <= 0) { C.est++; C.tEst = rnd(7, 11); pratoNaMesa(A, C.a, C.prato, Math.min(3, C.est)); if (C.est >= 3) { C.fase = 'acabou'; C.t = 0; tirarGarfo(A); pose(A, null); } }
        if (!aberto() && C.tEst > 3) C.tEst = 3;
      } else if (C.fase === 'acabou') {                                // terminou: espera o outro da mesa e vai para a fila
        const g = C.g, todos = g.membros.every((B) => B.rs && B.rs.fase !== 'come' && B.rs.fase !== 'mesa' && B.rs.fase !== 'bufe' && B.rs.fase !== 'prato' && B.rs.fase !== 'entra');
        if (g.membros.length > 1) { const k = Math.floor(g.t2 = (g.t2 || 0) + dt) % 4; A.fala = (k < 2) === (g.membros[0] === A); }
        if ((todos || C.t > 25) && C.t > 2) {
          const naFila = M.grupos.reduce((s2, q) => s2 + q.membros.filter((B) => B.rs && (B.rs.fase === 'fila' || B.rs.fase === 'paga')).length, 0);
          if (naFila < 4) {
            A.fala = false; const p = pontoDaCadeira(C.a); A.sentado = false; A.assento = 0.52; A.x = p.x; A.z = p.z; if (C.a.ocupado === A) C.a.ocupado = null;
            setTimeout(() => pratoNaMesa(A, null, null, null), 6000);
            C.fase = 'fila'; C.t = 0; C.ordem = ++M.ordemFila; C.vaga = -1; tickFila();
          }
        }
      } else if (C.fase === 'fila' || C.fase === 'paga') {
        if (A.rotaP && A.rotaP.length) andarP(A, dt); else { A.andando = false; A.yawAlvo = 0; }   // olhando o caixa (a leste)
        if (C.fase === 'paga' && !(A.rotaP && A.rotaP.length) && !M.jogPagando) {
          const P = M.D.pagar; if (Math.hypot(A.x - P.x, A.z - P.z) > 1.2) { if (C.t > 30) { C.fase = 'sai'; A.rotaP = rotaSaida(A); tickFila(); } return; }
          C.tc = (C.tc || 0) + dt; if (M.renan) { pose(M.renan, C.tc < 2 ? 'cobra' : 'balcao'); M.renan.fala = C.tc > 1.6 && C.tc < 2.4; } A.fala = C.tc < 0.9;
          if (C.tc > 1.1 && !C.pagou) { C.pagou = true; api.somCaixa(); }
          if (C.tc > 2.5) { A.fala = false; if (M.renan) { M.renan.fala = false; pose(M.renan, 'balcao'); } C.fase = 'sai'; C.t = 0; A.rotaP = rotaSaida(A); tickFila(); }
        }
      }
    }

    // ---------------------------------------------------------------- A DONA CIDA: sai da cozinha com a cuba cheia, troca a mais vazia e volta
    const Z_COZINHA = -8.75;                                            // (7.1.6) atrás da parede norte (z −8): ela passa pelo vão e a parede a esconde
    function tickCozinha(dt) {
      const K = M.cozinha, A = M.cida; if (!K || !A || !M.D) return;
      const D = M.D, porta = D.porta, atras = D.atras;
      if (!cozinhaLa() && K.fase === 'dentro') return;
      if (K.fase === 'dentro') {
        K.t -= dt; if (K.t > 0) return;
        const alvo = M.cubas.slice().sort((a, b) => a.nivel - b.nivel || Math.random() - 0.5)[0];
        if (!alvo || (alvo.nivel === 2 && Math.random() < 0.6)) { K.t = rnd(12, 22); return; }   // tudo cheio: de vez em quando ela sai só para conferir
        K.cuba = alvo; K.fase = 'sai'; A.x = porta.x; A.z = Z_COZINHA; A.yaw = A.yawAlvo = -Math.PI / 2; A.livreP = true;   // (7.1.6) vem de trás da parede, pelo vão escuro
        darCuba(A, alvo.id, 2); pose(A, 'leva'); esconder(A, false);
        A.rota = null; A.rotaP = [{ x: porta.x, z: atras }, { x: alvo.x, z: atras }]; K.t = 0;
      } else if (K.fase === 'sai') {
        K.t += dt; if (andarP(A, dt) || K.t > 20) { K.fase = 'poe'; K.t = 0; A.andando = false; A.yawAlvo = -Math.PI / 2; pose(A, 'poe'); }
      } else if (K.fase === 'poe') {
        K.t += dt;
        if (K.t > 0.9 && !K.trocou) { K.trocou = true; nivelCuba(K.cuba, 2); K.cuba.porcoes = 0; darCuba(A, K.cuba.id, 0); }
        if (K.t > 1.6) {
          pose(A, 'leva'); K.fase = 'volta'; K.t = 0; K.trocou = false; A.rotaP = [{ x: porta.x, z: atras }, { x: porta.x, z: Z_COZINHA }];
          const s = S(), J = s.jog; if (J && Math.hypot(J.x - A.x, J.z - A.z) < 4.5 && s.modo === 'livre' && Math.random() < 0.6) { A.fala = true; setTimeout(() => { if (M.cida) M.cida.fala = false; }, 1600); }
        }
      } else if (K.fase === 'volta') {
        K.t += dt; if (andarP(A, dt) || K.t > 20) { tirarCuba(A); pose(A, null); A.fala = false; esconder(A, true); K.fase = 'dentro'; K.t = rnd(18, 34); }
      }
    }
    // a porta vai e vem: abre quando a Dona Cida passa por ela
    function tickPorta(dt) {
      if (!M.folha || !M.D) return;
      const A = M.cida, perto = A && !A.oculto && Math.hypot(A.x - M.D.porta.x, A.z - M.D.porta.z) < 1.5;
      const alvo = perto ? -1.35 : 0; M.folhaAng += (alvo - M.folhaAng) * Math.min(1, dt * (perto ? 7 : 3.2));
      M.folha.rotation.y = M.folhaAng + (perto ? 0 : Math.sin((S().t || 0) * 9) * Math.abs(M.folhaAng) * 0.15);   // balança um pouquinho ao fechar
    }

    // ---------------------------------------------------------------- interação lá dentro
    function alvos(v) {
      const s = S(), D = M.D; if (!D || s.modo !== 'livre' || M.servindo) return;
      const pronto = aberto() && M.renan && M.cida;
      v.push({ x: D.pratos.x, z: D.pratos.z, r: 1.5, txt: pronto ? T('Self-service: montar um prato') : hora() < H_ABRE ? T('O bufê abre às 11h.') : T('O bufê já fechou.'), fn: pronto ? () => escolher(null) : async () => {}, y: 2.2, pri: !!pronto });
      if (pronto) v.push({ x: D.doces.x, z: D.doces.z, r: 1.5, txt: T('Ver as sobremesas'), fn: () => escolher('sobremesa'), y: 2.2 });
      if (pronto) v.push({ x: D.sopa.x, z: D.sopa.z, r: 1.5, txt: T('Pegar uma sopa'), fn: () => escolher('sopa'), y: 2.2 });
      if (M.renan && !M.jogPagando) v.push({ x: D.pagar.x, z: D.pagar.z, r: 1.6, txt: T('Falar com o Renan'), fn: falarComRenan, y: 2.5 });
      if (M.cida && !M.cida.oculto && M.cozinha && M.cozinha.fase === 'poe') v.push({ x: M.cida.x, z: M.cida.z + 1.3, r: 2.0, txt: T('Falar com a Dona Cida'), fn: falarComCida, y: 2.3 });
    }
    function alvosSentado() {                                          // comendo (a cena): nada além de esperar
      const s = S(), J = s.jog; if (!M.servindo) return null;
      return [{ x: J.x, z: J.z, r: 9, txt: T('Comendo...'), fn: async () => {} }];
    }
    // o cardápio (os 20 pratos com a pixel art, o preço e a etiqueta), como o da pizzaria
    function cardapioUI(fakes, filtro) {
      return new Promise((res) => {
        const el = document.createElement('div'); el.id = 'rsCardapio';
        el.style.cssText = 'position:fixed;inset:0;z-index:22;display:grid;place-items:center;background:rgba(4,8,4,.62);padding:10px;box-sizing:border-box;';
        const card = document.createElement('div');
        card.style.cssText = 'width:min(680px,100%);max-height:94%;overflow:auto;background:#16301f;border:4px solid #6cae3e;color:#eef6e2;padding:10px 12px;box-sizing:border-box;display:flex;flex-direction:column;gap:8px;font-family:var(--font-body);';
        const h = document.createElement('div'); h.style.cssText = 'font:700 14px/1.2 var(--font-display);letter-spacing:.08em;text-transform:uppercase;color:#f2c230;';
        h.textContent = Tf('Self-service ({0} fakes)', fakes);
        card.appendChild(h);
        const fim = (id) => { el.remove(); res(id); };
        const grupos = filtro === 'sobremesa' ? [['Sobremesas', (p) => p.tipo === 'sobremesa']] : filtro === 'sopa' ? [['Pratos', (p) => p.tipo === 'sopa']]
          : [['Saladas', (p) => p.tipo === 'salada'], ['Pratos', (p) => p.tipo === 'prato' || p.tipo === 'pesado' || p.tipo === 'sopa'], ['Sobremesas', (p) => p.tipo === 'sobremesa']];
        for (const [tit, f] of grupos) {
          const t = document.createElement('div'); t.style.cssText = 'font:700 11px/1 var(--font-display);letter-spacing:.1em;color:#9fe3a8;text-transform:uppercase;margin-top:2px;'; t.textContent = T(tit); card.appendChild(t);
          const grade = document.createElement('div'); grade.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(112px,1fr));gap:7px;';
          PRATOS.filter(f).forEach((p) => {
            const b = document.createElement('button'); b.type = 'button'; b.dataset.id = p.id; const pode = fakes >= p.preco;
            b.style.cssText = 'display:flex;flex-direction:column;gap:3px;align-items:center;padding:7px 4px;background:#21402b;border:3px solid ' + (p.saude > 0 ? '#4a8a3a' : p.tipo === 'sobremesa' ? '#c8708e' : '#c8883a') + ';color:#eef6e2;cursor:pointer;font:700 10.5px/1.2 var(--font-display);text-align:center;opacity:' + (pode ? 1 : 0.55) + ';';
            b.appendChild(iconePrato(p.id, 64));
            const n = document.createElement('span'); n.textContent = T(p.nome);
            const etq = document.createElement('span'); const sau = p.saude > 0, doce = p.tipo === 'sobremesa' && !sau;
            etq.style.cssText = 'font:600 9.5px/1 var(--font-body);padding:2px 5px;background:' + (sau ? '#2f6a2a' : doce ? '#8a3a5a' : '#8a5a1a') + ';';
            etq.textContent = sau ? T('Saudável') : doce ? T('Doce') : T('Pesado');
            const pr = document.createElement('span'); pr.style.color = '#f2c230'; pr.textContent = p.preco + ' ' + T('fakes');
            b.append(n, etq, pr); b.onclick = () => fim(p.id); grade.appendChild(b);
          });
          card.appendChild(grade);
        }
        const nada = document.createElement('button'); nada.type = 'button'; nada.className = 'pxBtn'; nada.textContent = T('Nada, obrigado'); nada.style.cssText = 'align-self:center;--p:var(--p2,2px);height:38px;padding:0 14px;font-size:12px;'; nada.onclick = () => fim(null);
        card.appendChild(nada); el.appendChild(card); (document.getElementById('raizJogo') || document.body).appendChild(el);
      });
    }
    async function escolher(filtro) {
      const s = S(), d = s.dados; if (M.servindo) return;
      const id = await cardapioUI(d.fakes, filtro); if (!id) return;
      const p = PRATO[id];
      if (d.fakes < p.preco) { if (M.renan) { await api.fala('renan', T('Ih... com esse dinheiro não dá esse prato, hein?')); Dialogo.esconder(); } return; }
      await servir(p);
    }
    // ================================================================ A CENA DO JOGADOR: pega o prato → serve-se → senta → come → paga
    async function servir(p) {
      const s = S(), J = s.jog, d = s.dados, D = M.D; if (!D) return;
      M.servindo = true; s.modo = 'cena'; api.UI().ctl.hidden = true; api.aviso(''); J.andando = false; J.correndo = false;
      const cheio = (d.fome || 0) <= 0;
      let a = null, chave = 'jog';
      try {
        if (J.sentado) api.levantar();
        // 1) o prato no carrinho (a sopa e as sobremesas também começam pegando a louça lá)
        await andarJog(D.pratos.x, D.pratos.z, 2.7); J.yawAlvo = Math.PI / 2; await api.esperar(450);
        darPrato(J, p.id, 0); pose(J, null); await api.esperar(350);
        // 2) as paradas: o prato vai sendo montado na mão
        const par = paradasDe(p);
        for (let k = 0; k < par.length; k++) {
          await andarJog(par[k].x, par[k].z, 2.25); J.yawAlvo = Math.PI / 2; pose(J, 'serve'); await api.esperar(1100);
          if (par[k].id !== 'sopa' && par[k].id !== 'doces') servirDaCuba(par[k].id);
          trocarPrato(J, mascara(par, k + 1)); pose(J, null); await api.esperar(150);
        }
        trocarPrato(J, null);
        // 3) a mesa: a cadeira livre mais perto numa mesa sem ninguém (se não tiver, divide uma mesa; se nem isso, come em pé)
        a = escolherAssento(J);
        if (a) {
          const pl = api.pontoDeLevantar ? api.pontoDeLevantar(a) : pontoDaCadeira(a);
          await andarJog(pl.x, pl.z, 2.25); await api.sentar(a);
          tirarPrato(J); pratoNaMesa(chave, a, p.id, 0);
        } else { await api.fala('jog', T('Não tem mesa livre agora... vou comer em pé mesmo.')); Dialogo.esconder(); }
        // 4) comendo (o prato esvazia em 4 estados)
        darGarfo(J); pose(J, a ? 'come' : 'leva');
        for (let e = 1; e <= 3; e++) { await api.esperar(COMER_SEG * 1000 / 3); if (a) pratoNaMesa(chave, a, p.id, e); else if (J.prato) { J.prato.pl.material.map = texPrato(p.id, e, null); J.prato.pl.material.needsUpdate = true; } }
        tirarGarfo(J); pose(J, null);
        await comeu(p, cheio);
        // 5) levanta e vai pagar no caixa (o prato vazio fica na mesa um pouco)
        if (a) { api.levantar(); const k2 = chave; setTimeout(() => pratoNaMesa(k2, null, null, null), 7000); } else tirarPrato(J);
        if (M.renan) {
          M.jogPagando = true; tickFila();
          await andarJog(D.pagar.x, D.pagar.z, 2.4);   // (7.1.6) 1,5x mais rápido e pelo caminho dos corredores (as cadeiras entram na navegação) J.yawAlvo = 0; await api.esperar(300);
          pose(M.renan, 'cobra'); await api.fala('renan', Tf('{0}: {1} fakes.', T(p.nome), p.preco));
          d.fakes = Math.max(0, d.fakes - p.preco); api.somCaixa(); api.somDinheiro(); api.mostrarDinheiro(false); api.gastoNaTela(p.preco);
          pose(M.renan, 'balcao'); await api.fala('renan', T('Obrigado! Volte sempre!')); Dialogo.esconder();
        } else { d.fakes = Math.max(0, d.fakes - p.preco); api.somDinheiro(); api.mostrarDinheiro(false); api.gastoNaTela(p.preco); }
        const dr = dadosR(); dr.pratos = dr.pratos || {}; dr.pratos[p.id] = (dr.pratos[p.id] | 0) + 1; api.gravar(d.ponto || 'chegada');
      } catch (e) { console.error('[Restaurante] servir:', e); }
      finally {
        M.servindo = false; M.jogPagando = false; if (M.D) tickFila();
        tirarPrato(J); tirarGarfo(J); if (J.poseFn === poseRestaurante) J.poseFn = null; J.poseRs = null;
        try { Dialogo.esconder(); } catch (e) { /* nada */ }
        const ss = S(); if (ss && ss.ativo && ss.modo === 'cena') api.liberar();
      }
    }
    function escolherAssento(J) {
      if (!M.mesas) return null;
      const dist = (a) => Math.hypot(a.x - J.x, a.z - J.z);
      const vazias = M.mesas.filter(mesaLivre).flatMap((T0) => T0.assentos);
      const qualquer = M.mesas.flatMap((T0) => T0.assentos.filter((q) => !q.ocupado));
      const L = (vazias.length ? vazias : qualquer).sort((a, b) => dist(a) - dist(b));
      return L[0] || null;
    }
    // os efeitos de comer (como o lanche do Valdemar e a pizza): a fome, o Saudável, a refeição pesada e o hábito da Série B
    async function comeu(p, cheio) {
      const s = S(), d = s.dados;
      d.fome = Math.max(0, (d.fome || 0) - p.enche); d.comidas = (d.comidas || 0) + 1; d.comeuDia = d.dia;
      d.ruinsNoMes = d.ruinsNoMes || { mes: d.mes || 1, n: 0 };
      const saud = p.saude > 0;
      try {
        if (saud) { d.comeuSaudavelDia = d.dia; Espectros.mover('saudavel', p.saude, 'comeu ' + p.nome); }
        else { d.ruinsNoMes.n++; Espectros.mover('saudavel', p.saude, 'comeu ' + p.nome); if (p.tipo === 'pesado') Espectros.condicao('refeicaoPesada', true); }
        if (cheio && !saud) Espectros.mover('saudavel', -4, 'comeu sem fome');
      } catch (e) { console.warn('[Restaurante] saúde:', e); }
      if (s.missao) { s.missao = ''; try { api.recolherMissao(); } catch (e) { /* nada */ } }
      api.gravar(d.ponto || 'chegada');
      if (cheio && !saud) { await api.fala('jog', T('Acho que eu exagerei...')); s.vomitoT = 20; }
      else if (cheio) await api.fala('jog', fem() ? T('Já estava satisfeita, mas salada nunca é demais.') : T('Já estava satisfeito, mas salada nunca é demais.'));
      else if (p.tipo === 'pesado') await api.fala('jog', fem() ? T('Ufa... matei a fome. Mas tô pesadona.') : T('Ufa... matei a fome. Mas tô pesadão.'));
      else if (p.tipo === 'sobremesa' && !saud) await api.fala('jog', T('Que delícia... mas o preparador físico não pode saber.'));
      else if (d.fome > 0) await api.fala('jog', T('Hmm... ainda cabia mais um pouquinho.'));
      else await api.fala('jog', T('Isso sim é comida de atleta!'));
      try { if (typeof Sono !== 'undefined' && Sono.deveAvisarSaude()) await api.fala('jog', T('Eu estou com hábitos não saudáveis, isso com certeza vai me prejudicar nos jogos....')); } catch (e) { /* nada */ }
      Dialogo.esconder();
    }

    // ---- conversas
    const PAPOS_RENAN = [
      { p: 'Movimento bom hoje, graças a Deus!', a: ['Que bom!', 'A comida da Dona Cida atrai todo mundo.'], b: ['Movimento bom e fila no caixa, né?', 'Eu sou rápido! Ninguém espera mais de um minuto aqui.'], c: ['Caixa parado o dia todo, que emprego fácil.', 'Fácil? Quero ver você fechar o caixa às onze da noite batendo certinho.'] },
      { p: 'Já experimentou a salada de quinoa? Sai muito com o pessoal que joga bola.', a: ['Ainda não, vou provar!', 'Proteína e fibra. O seu treinador ia gostar.'], b: ['Eu prefiro o petit gâteau.', 'Hehe, eu também. Mas não conta pra ninguém.'], c: ['Quinoa? Isso é comida de passarinho.', 'Passarinho que joga noventa minutos, né? Cada um com o seu gosto.'] },
    ];
    async function falarComRenan() {
      const s = S(), R = M.renan, J = s.jog, dr = dadosR(); if (!R) return;
      R.yawAlvo = Math.atan2(-(J.z - R.z), J.x - R.x);
      try {
        if (!dr.conheceu) {
          await api.fala('renan', fem() ? T('Bem-vinda ao restaurante! É só pegar um prato no carrinho, se servir no bufê e pagar aqui comigo no final.') : T('Bem-vindo ao restaurante! É só pegar um prato no carrinho, se servir no bufê e pagar aqui comigo no final.'));
          await api.fala('renan', T('A comida é toda da Dona Cida. Ela chega às nove pra deixar tudo pronto antes de abrir.'));
          dr.conheceu = true; api.gravar(s.dados.ponto || 'chegada'); return;
        }
        const Q = PAPOS_RENAN[(dr.papoR | 0) % PAPOS_RENAN.length]; dr.papoR = (dr.papoR | 0) + 1;
        await api.fala('renan', T(Q.p));
        const r = await Escolha.mostrar(T(Q.p), [T(Q.a[0]), T(Q.b[0]), T(Q.c[0])]);
        if (r === 2) { await api.falaGrossa('renan', 'renan', T(Q.c[0]), T(Q.c[1])); return; }   // a grosseria
        const Rr = r === 1 ? Q.b : Q.a; await api.fala('jog', T(Rr[0])); await api.fala('renan', T(Rr[1]));
      } finally { if (M.renan && M.D) M.renan.yawAlvo = M.D.caixa.yaw; Dialogo.esconder(); }
    }
    async function falarComCida() {
      const s = S(), C = M.cida; if (!C) return;
      const K = M.cozinha; if (K) K.t = -99;                            // ela espera a conversa acabar para voltar
      const ant = K ? K.fase : null; if (K) K.fase = 'conversa';
      try {
        const q = T(pk(['Olha a comida quentinha saindo!', 'Tem salada fresquinha, viu? Faz bem pra quem joga bola!', 'Hoje a lasanha tá daquele jeito, hein!']));
        await api.fala('cida', q);
        const r = await Escolha.mostrar(q, [T('Valeu, Dona Cida!'), T('Anda logo, a cuba do arroz tá vazia.')]);
        if (r === 1) await api.falaGrossa('cida', 'cida', T('Anda logo, a cuba do arroz tá vazia.'), fem() ? T('Ô, minha filha... calma que eu só tenho duas mãos.') : T('Ô, meu filho... calma que eu só tenho duas mãos.'));
      } finally { if (K && K.fase === 'conversa') { K.fase = ant === 'poe' ? 'poe' : ant; K.t = 1.0; } Dialogo.esconder(); }
    }

    // ================================================================ NA RUA: a Dona Cida (9h) e o Renan (10h30) chegando; saindo depois de fechar
    //   Só aparece se o jogador estiver na rua e perto (até 75 m da porta); longe, eles só "chegam" na conta.
    const RUA_AGENDA = [
      { k: 'cidaC', h: H_COZINHA, quem: 'cida', ida: true, dist: 26 }, { k: 'renanC', h: H_CAIXA - 0.3, quem: 'renan', ida: true, dist: 16 },   // ele chega antes das 10h30 (e o restaurante abre às 11h)
      { k: 'renanS', h: H_SAI_CAIXA, quem: 'renan', ida: false }, { k: 'cidaS', h: H_SAI_COZINHA, quem: 'cida', ida: false },
    ];
    function tickRua() {
      const s = S(), d = s.dados; if (s.dentro || !s.jog) return;
      const h = d.hora, dia = d.dia || 1;
      for (const E of RUA_AGENDA) {
        if (M.rua[E.k] === dia || h < E.h || h > E.h + 0.6) continue;
        M.rua[E.k] = dia;
        if (Math.hypot(s.jog.x - PORTA_REST.x, s.jog.z - PORTA_REST.z) > 75 || (s.modo !== 'livre' && s.modo !== 'cena')) continue;
        try { andarNaRua(E); } catch (e) { console.warn('[Restaurante] rua:', e); }
      }
    }
    function andarNaRua(E) {
      const ehCida = E.quem === 'cida', R = ehCida ? ROUPA_CIDA : ROUPA_RENAN;
      const A = api.criarNPCFixo(ehCida ? apCida() : apRenan(), ehCida, R[0], R[1]); A.tipo = 'cena';
      if (ehCida) enfeitarCida(A.m, A.opt); else enfeitarRenan(A.m, A.opt);
      const xLonge = PORTA_REST.x + (ehCida ? 1 : -1) * (E.dist || 30), zc = 7.5, zp = 10.0;
      const pts = E.ida ? [[PORTA_REST.x + (ehCida ? 0.8 : -0.8), zc], [PORTA_REST.x, zp]] : [[PORTA_REST.x, zc], [xLonge, zc]];
      if (E.ida) { A.x = xLonge; A.z = zc; } else { A.x = PORTA_REST.x; A.z = zp; }
      A.yaw = A.yawAlvo = Math.atan2(-(pts[0][1] - A.z), pts[0][0] - A.x);
      M.atoresRua.push(A);
      api.andar(A, pts, 1.25).then(() => { M.atoresRua = M.atoresRua.filter((q) => q !== A); try { api.descartarPessoa(A); } catch (e) { /* já saiu */ } });
    }

    // ---- a cada quadro (depois do tickJogador e do tickPessoas)
    function tick(dt) {
      const s = S(); if (!s) return;
      tickRua();
      if (!M.D || !s.dentro || s.dentro.nome !== 'restaurante') return;
      // a equipe chega/sai com a hora (se o jogador ficou lá dentro)
      if (!M.cida && cozinhaLa()) { M.cida = criarCida(); esconder(M.cida, true); M.cozinha = { fase: 'dentro', t: rnd(3, 6) }; s.falantesExtra.cida = { A: M.cida, nome: T('Dona Cida'), voz: 1 }; }
      if (!M.renan && caixaLa()) { const C = M.D.caixa; M.renan = criarRenan(); s.npcs.push(M.renan); const e = M.R.entrada; M.renan.x = e.x; M.renan.z = e.z; M.renan.tipo = 'equipeRs'; M.renan.rotaP = caminho(e.x, e.z, C.x - 1.4, C.z - 1.6).concat([{ x: C.x, z: C.z }]); M.renan.chegando = true; s.falantesExtra.renan = { A: M.renan, nome: T('Renan'), voz: 2 }; }
      if (M.renan && M.renan.chegando) { if (andarP(M.renan, dt)) { M.renan.chegando = false; M.renan.yawAlvo = M.D.caixa.yaw; pose(M.renan, 'balcao'); } }
      if (M.renan && !caixaLa() && !M.renan.saindo && !M.grupos.length && !M.jogPagando) { M.renan.saindo = true; pose(M.renan, null); M.renan.rotaP = caminho(M.renan.x, M.renan.z, M.R.saida.x, M.R.saida.z); }
      if (M.renan && M.renan.saindo && andarP(M.renan, dt)) { api.descartarPessoa(M.renan); M.renan = null; if (s.falantesExtra) delete s.falantesExtra.renan; }
      tickCozinha(dt); tickPorta(dt); tickFluxo(dt);
      for (const g of M.grupos) g.t2 = (g.t2 || 0);
      if (M.renan && !M.renan.chegando && !M.renan.saindo && !M.renan.andando) { const f = M.grupos.some((g) => g.membros.some((A) => A.rs && A.rs.fase === 'paga')); if (!f && !M.jogPagando && M.renan.poseRs !== 'balcao') pose(M.renan, 'balcao'); }
    }
    function liberarMesa(x, z) {
      if (!M.mesas) return;
      for (const T0 of M.mesas) if (Math.abs(T0.x - x) < 1 && Math.abs(T0.z - z) < 1 && T0.grupo) {
        for (const A of T0.grupo.membros.slice()) sairCliente(A);
        T0.grupo = null;
      }
    }
    function limpar() {
      for (const A of M.atoresRua) { try { api.descartarPessoa(A); } catch (e) { /* nada */ } }
      M.atoresRua = [];
      for (const [, t] of M.tex) t.dispose(); M.tex = new Map();
    }
    const dbg = { M, PRATOS, PRATO, ING, canvasPrato, canvasCuba, servir, escolher, tickRua, andarNaRua, aberto };
    if (typeof window !== 'undefined') window.__restaurante = dbg;
    return { entrou, saiu, chegou, tickCliente, tick, alvos, alvosSentado, liberarMesa, limpar, aberto, _f: dbg };
  }

  // as traduções entram no jogo (as chaves que já existem na cidade continuam valendo)
  if (typeof I18N !== 'undefined') for (const k of Object.keys(TRAD)) if (!I18N[k]) I18N[k] = TRAD[k];
  window.FutebolJS.registrarFase({ id: 'restaurante', nome: 'Restaurante', nucleoMinimo: '7.1', iniciar: async () => {}, criar, dados: { PRATOS, CUBAS, canvasPrato, canvasCuba, TRAD } });
})();
