/* =====================================================================
   FUTEBOL JS · esportiva.js · A GOLAÇO ESPORTES (arquivo SEPARADO, como bar.js)
   ---------------------------------------------------------------------
   7.1.9 — primeira versão: o LAYOUT da loja e a seção de COMEMORAÇÕES.
   7.1.10 — a seção de CHUTEIRAS: 20 chuteiras premium, a parede premium, o catálogo do Biro e o provador.
   7.1.11 — a seção de BOLAS: 15 bolas premium com o Juca.
   7.1.12 — a seção de ROUPAS: 25 roupas da loja, o catálogo da Kelly, o provador e os manequins vestidos.
   - Registrado com FutebolJS.registrarFase({ id: 'esportiva' }) só para o jogo saber baixar o arquivo; NÃO roda como fase.
     A cidade baixa em segundo plano e chama criar(api) (api = apiEsportiva() da cidade). A sala vem do interiores.js (R.esportiva):
     quadrada, com uma seção em cada canto (chuteiras, roupas, bolas, acessórios), o campinho das comemorações no meio e o caixa ao norte.
   - A EQUIPE (uniforme azul e amarelo): a MARTA no caixa e um vendedor em cada seção: BIRO (chuteiras), KELLY (roupas), JUCA (bolas),
     TATI (acessórios) e o DEDÉ (comemorações), que de vez em quando faz uma dancinha no campinho para chamar cliente.
   - PSEUDO-CLIENTES: algumas pessoas passeiam pela loja, param nas prateleiras, olham e vão embora (a loja é do jogador: eles não compram).
   - COMEMORAÇÕES: 20 animações novas (os quadros-chave ficam no jogo.js, em CELEBRACOES, com loja: true), 300 fakes cada.
     Com o Dedé abre o CATÁLOGO (painel à direita): VER faz o jogador testar a comemoração ali no campinho, LEVAR põe na sacola.
     Quem cobra é a Marta, no CAIXA (paga tudo o que está na sacola). As compradas ficam para sempre; no catálogo escolhe-se qual vai
     em cada um dos 2 botões de comemoração da partida (BOTÃO 1 / BOTÃO 2).
   - (7.1.10) CHUTEIRAS: 20 modelos premium (os desenhos ficam no jogo.js, em CHUTEIRAS, com loja: true, nivel e preco: de 250 a 6.000
     fakes, mais caras quanto mais premium). Na PAREDE PREMIUM da seção, uma coluna por nível (Pro, Elite, Galáctica, Lendária,
     Ícone) com o par de cada modelo, e a mais cara girando na redoma. Com o BIRO abre o catálogo: PROVAR calça a chuteira no
     jogador ali no espelho (ele gira para mostrar), LEVAR põe na sacola (a mesma das comemorações) e a Marta cobra no caixa.
     A comprada já vai para o pé (aparencia.chuteira + chuteiraNome); CALÇAR troca entre as suas e a de sempre (a do criador).
   - BOLAS: com o Juca abre o catálogo das 15 bolas premium (cosmeticos.js, 350 a 1500 fakes, o preço sobe com o acabamento).
     OLHAR põe a bola no mostruário em cima da pirâmide, de pertinho; LEVAR põe na sacola (a mesma das outras seções, paga com a Marta).
     As compradas ficam para sempre e USAR escolhe qual vai para as partidas (a cidade troca a bola ao entrar em campo: cidade.js).
   - (7.1.12) ROUPAS: 25 roupas novas para cada gênero (os dados e as estampas ficam no fase2.js, em ROUPAS, com loja: 1 e preco).
     A KELLY abre o catálogo: PROVAR veste a roupa no jogador ali na seção (gira para mostrar), LEVAR põe na sacola e a Marta cobra.
     A comprada já é vestida (historia.fase2.roupa) e passa a aparecer no guarda-roupa de casa (historia.fase2.roupasLoja = [nomes]);
     VESTIR troca entre as compradas. Os dois manequins da seção vestem roupas da loja (mudam a cada dia). Sacola: 'rp:' + nome.
   - ACESSÓRIOS: com a Tati abre o catálogo em 4 abas: BRINCOS, COLARES e LUVAS (15 peças; o tom do metal, entre 8, vale para o tipo
     inteiro) e TATUAGENS (20 desenhos; escolhe-se o lugar: braço ou perna, direito ou esquerdo). Os desenhos e as peças ficam no
     jogo.js (ACESSORIOS, TATUAGENS, METAIS). PROVAR refaz o jogador ali na frente do painel da parede; LEVAR põe na sacola (a tatuagem
     vai para o lugar escolhido na hora de levar); USAR / TIRAR e PÔR AQUI / TIRAR DAQUI trocam o que já é seu. O que está em uso vai
     para aparencia.enfeites (aparece na cidade e nas partidas).
   - Salva em historia.cidade (dados): celeb = { tem: [chaves compradas], slots: [botão 1, botão 2] } · esportiva = { conheceu... } ·
     chuteiras = { tem: [nomes comprados], usando: nome ou null (a de sempre), original: a chuteira do criador } ·
     bolas = { tem: [nomes comprados], usando: nome ou null (a bola padrão) } ·
     acessorios = { tem: [peças], tats: [tatuagens], uso: { b, c, l }, metal: { b, c, l }, t: { bd, be, pd, pe } }.
   ===================================================================== */
(function () {
  'use strict';
  const PRECO = 300;
  // as bolas da seção do Juca (os desenhos ficam no cosmeticos.js, com o mesmo nome): o preço sobe com o acabamento
  const BOLAS = [
    { nome: 'Clássica Ouro', preco: 350, txt: 'Os gomos de sempre, com a costura dourada.' }, { nome: 'Hélice Tricolor', preco: 380, txt: 'Faixas em espiral, vermelha e azul.' },
    { nome: 'Oceano Profundo', preco: 420, txt: 'Ondas do turquesa ao azul-marinho.' }, { nome: 'Raio Neon', preco: 460, txt: 'Preta com raios verde-limão.' },
    { nome: 'Chamas', preco: 500, txt: 'O fogo subindo pela bola.' }, { nome: 'Carnaval', preco: 540, txt: 'Confete e serpentina dourada.' },
    { nome: 'Mármore Real', preco: 580, txt: 'Mármore branco com fio de ouro.' }, { nome: 'Galáxia', preco: 650, txt: 'Um pedaço do espaço no seu pé.' },
    { nome: 'Onça Pintada', preco: 700, txt: 'Dourada, com as rosetas da onça.' }, { nome: 'Diamante Azul', preco: 780, txt: 'Lapidada como pedra preciosa.' },
    { nome: 'Jabulana', preco: 850, txt: 'Inspirada na bola da Copa de 2010.' }, { nome: 'Brasuca', preco: 950, txt: 'Inspirada na bola da Copa de 2014.' },
    { nome: 'Triunda', preco: 1100, txt: 'Inspirada na bola da Copa de 2026.' }, { nome: 'Rubi Imperial', preco: 1250, txt: 'Vermelho rubi com ouro velho.' },
    { nome: 'Lenda Negra', preco: 1500, txt: 'Preta fosca e ouro. A mais cara da loja.' },
  ];
  const TRAD = {
    'Marta': ['Marta', 'Marta', 'Marta', 'Marta'], 'Biro': ['Biro', 'Biro', 'Biro', 'Biro'], 'Kelly': ['Kelly', 'Kelly', 'Kelly', 'Kelly'], 'Juca': ['Juca', 'Juca', 'Juca', 'Juca'], 'Tati': ['Tati', 'Tati', 'Tati', 'Tati'], 'Dedé': ['Dedé', 'Dedé', 'Dedé', 'Dedé'],
    'Falar com {0}': ['Talk to {0}', 'Hablar con {0}', 'Parla con {0}', 'Parler à {0}'],
    'Caixa da loja': ['Store checkout', 'Caja de la tienda', 'Cassa del negozio', 'Caisse du magasin'],
    'Ver as comemorações': ['See the celebrations', 'Ver las celebraciones', 'Vedi le esultanze', 'Voir les célébrations'],
    // o catálogo
    'COMEMORAÇÕES': ['CELEBRATIONS', 'CELEBRACIONES', 'ESULTANZE', 'CÉLÉBRATIONS'],
    '{0} fakes': ['{0} fakes', '{0} fakes', '{0} fakes', '{0} fakes'],
    'Você tem {0} fakes': ['You have {0} fakes', 'Tienes {0} fakes', 'Hai {0} fakes', 'Tu as {0} fakes'],
    'Sacola: {0} ({1} fakes)': ['Bag: {0} ({1} fakes)', 'Bolsa: {0} ({1} fakes)', 'Borsa: {0} ({1} fakes)', 'Sac : {0} ({1} fakes)'],
    'Sacola vazia': ['Empty bag', 'Bolsa vacía', 'Borsa vuota', 'Sac vide'],
    'Botão 1: {0}': ['Button 1: {0}', 'Botón 1: {0}', 'Pulsante 1: {0}', 'Bouton 1 : {0}'], 'Botão 2: {0}': ['Button 2: {0}', 'Botón 2: {0}', 'Pulsante 2: {0}', 'Bouton 2 : {0}'],
    'VER': ['WATCH', 'VER', 'GUARDA', 'VOIR'], 'LEVAR': ['TAKE', 'LLEVAR', 'PRENDI', 'PRENDRE'], 'TIRAR': ['REMOVE', 'QUITAR', 'TOGLI', 'RETIRER'],
    'BOTÃO 1': ['BUTTON 1', 'BOTÓN 1', 'PULSANTE 1', 'BOUTON 1'], 'BOTÃO 2': ['BUTTON 2', 'BOTÓN 2', 'PULSANTE 2', 'BOUTON 2'],
    'É sua': ['Yours', 'Es tuya', 'È tua', 'À toi'], 'Na sacola': ['In the bag', 'En la bolsa', 'Nella borsa', 'Dans le sac'], 'De graça': ['Free', 'Gratis', 'Gratis', 'Gratuit'],
    'FECHAR': ['CLOSE', 'CERRAR', 'CHIUDI', 'FERMER'],
    'O que está na sacola você paga no caixa, com a Marta.': ['What’s in the bag you pay for at the checkout, with Marta.', 'Lo que está en la bolsa lo pagas en la caja, con Marta.', 'Quello che c’è nella borsa lo paghi alla cassa, da Marta.', 'Ce qui est dans le sac se paie à la caisse, avec Marta.'],
    // o Dedé
    'E aí, craque! Aqui é o cantinho das comemorações. Gol sem festa não vale!': ['Hey, star! This is the celebrations corner. A goal without a party doesn’t count!', '¡Ey, crack! Este es el rincón de las celebraciones. ¡Gol sin fiesta no vale!', 'Ehi, campione! Questo è l’angolo delle esultanze. Un gol senza festa non vale!', 'Salut, champion ! Ici, c’est le coin des célébrations. Un but sans fête, ça ne compte pas !'],
    'Tenho 20 comemorações, {0} fakes cada. Pode testar todas aqui no campinho antes de levar.': ['I’ve got 20 celebrations, {0} fakes each. You can try them all here on the little pitch before taking any.', 'Tengo 20 celebraciones, {0} fakes cada una. Puedes probarlas todas aquí en la canchita antes de llevarlas.', 'Ho 20 esultanze, {0} fakes l’una. Puoi provarle tutte qui sul campetto prima di prenderle.', 'J’ai 20 célébrations, {0} fakes chacune. Tu peux toutes les essayer ici sur le petit terrain avant de les prendre.'],
    'O que você escolher vai para a sacola. Depois é só pagar com a Marta, no caixa.': ['Whatever you pick goes in the bag. Then just pay Marta at the checkout.', 'Lo que elijas va a la bolsa. Después solo pagas con Marta, en la caja.', 'Quello che scegli va nella borsa. Poi paghi da Marta, alla cassa.', 'Ce que tu choisis va dans le sac. Ensuite, tu paies à Marta, à la caisse.'],
    'Bora ver o que combina com você!': ['Let’s see what suits you!', '¡Vamos a ver qué va contigo!', 'Vediamo cosa fa per te!', 'Voyons ce qui te va !'],
    'Essa ficou a sua cara!': ['That one is so you!', '¡Esa te queda perfecta!', 'Questa è proprio da te!', 'Celle-là, c’est tout toi !'],
    'Boa escolha! Passa no caixa que a Marta fecha a conta.': ['Good choice! Stop by the checkout and Marta will ring you up.', '¡Buena elección! Pasa por la caja y Marta te cobra.', 'Bella scelta! Passa alla cassa, ci pensa Marta.', 'Bon choix ! Passe à la caisse, Marta s’occupe du reste.'],
    'Volta quando quiser treinar a comemoração!': ['Come back whenever you want to practice your celebration!', '¡Vuelve cuando quieras practicar la celebración!', 'Torna quando vuoi provare l’esultanza!', 'Reviens quand tu veux répéter ta célébration !'],
    // os outros vendedores
    'Chuteira boa é meio gol! Olha à vontade.': ['Good boots are half a goal! Look around.', '¡Un buen botín es medio gol! Mira con calma.', 'Una buona scarpa è mezzo gol! Guarda pure.', 'De bons crampons, c’est la moitié du but ! Regarde tranquillement.'],
    'Estou arrumando o estoque. Daqui a uns dias já dá para comprar.': ['I’m sorting the stock. In a few days you’ll be able to buy.', 'Estoy acomodando el stock. En unos días ya se puede comprar.', 'Sto sistemando il magazzino. Tra qualche giorno si potrà comprare.', 'Je range le stock. Dans quelques jours, tu pourras acheter.'],
    'Camisa, short, agasalho... aqui a gente veste o time inteiro.': ['Shirts, shorts, tracksuits... we dress the whole team here.', 'Camisetas, shorts, buzos... aquí vestimos al equipo entero.', 'Maglie, pantaloncini, tute... qui vestiamo tutta la squadra.', 'Maillots, shorts, survêtements... ici, on habille toute l’équipe.'],
    'As peças novas chegam essa semana. Volta depois!': ['The new pieces arrive this week. Come back later!', 'Las prendas nuevas llegan esta semana. ¡Vuelve después!', 'I capi nuovi arrivano questa settimana. Torna più tardi!', 'Les nouveautés arrivent cette semaine. Reviens plus tard !'],
    'Bola de campo, de society, de futsal... tem de tudo.': ['Field balls, small-sided, futsal... we’ve got everything.', 'Pelota de campo, de fútbol 7, de futsal... hay de todo.', 'Palloni da campo, da calcetto, da futsal... c’è di tutto.', 'Ballons de terrain, de foot à 7, de futsal... il y a de tout.'],
    'Só não estou vendendo ainda: falta etiquetar. Logo, logo!': ['I’m just not selling yet: still need to tag them. Very soon!', 'Solo que todavía no vendo: falta etiquetar. ¡Prontito!', 'Solo che non vendo ancora: mancano le etichette. Presto!', 'Je ne vends pas encore : il faut étiqueter. Très bientôt !'],
    'Caneleira, luva, boné, garrafinha... o detalhe que faz a diferença.': ['Shin guards, gloves, caps, bottles... the detail that makes the difference.', 'Canilleras, guantes, gorras, botellas... el detalle que marca la diferencia.', 'Parastinchi, guanti, cappellini, borracce... il dettaglio che fa la differenza.', 'Protège-tibias, gants, casquettes, gourdes... le détail qui fait la différence.'],
    'A máquina do cartão dessa seção quebrou. Semana que vem eu vendo!': ['This section’s card machine broke. Next week I’ll be selling!', 'Se rompió la máquina de tarjetas de esta sección. ¡La semana que viene vendo!', 'Si è rotto il POS di questo reparto. La settimana prossima vendo!', 'Le terminal de carte de ce rayon est en panne. La semaine prochaine, je vends !'],
    // a Marta (caixa)
    'Bem-vindo à Golaço Esportes! Escolhe com os vendedores e paga aqui comigo.': ['Welcome to Golaço Sports! Choose with the salespeople and pay here with me.', '¡Bienvenido a Golaço Deportes! Elige con los vendedores y paga aquí conmigo.', 'Benvenuto alla Golaço Sport! Scegli con i commessi e paga qui da me.', 'Bienvenue chez Golaço Sports ! Choisis avec les vendeurs et paie ici avec moi.'],
    'Bem-vinda à Golaço Esportes! Escolhe com os vendedores e paga aqui comigo.': ['Welcome to Golaço Sports! Choose with the salespeople and pay here with me.', '¡Bienvenida a Golaço Deportes! Elige con los vendedores y paga aquí conmigo.', 'Benvenuta alla Golaço Sport! Scegli con i commessi e paga qui da me.', 'Bienvenue chez Golaço Sports ! Choisis avec les vendeurs et paie ici avec moi.'],
    'A sua sacola está vazia. O Dedé, ali no campinho, mostra as comemorações.': ['Your bag is empty. Dedé, over at the little pitch, shows the celebrations.', 'Tu bolsa está vacía. Dedé, ahí en la canchita, muestra las celebraciones.', 'La tua borsa è vuota. Dedé, lì al campetto, mostra le esultanze.', 'Ton sac est vide. Dedé, là-bas sur le petit terrain, montre les célébrations.'],
    'Na sacola: {0}. Dá {1} fakes.': ['In the bag: {0}. That’s {1} fakes.', 'En la bolsa: {0}. Son {1} fakes.', 'Nella borsa: {0}. Fanno {1} fakes.', 'Dans le sac : {0}. Ça fait {1} fakes.'],
    'Pagar {0} fakes': ['Pay {0} fakes', 'Pagar {0} fakes', 'Paga {0} fakes', 'Payer {0} fakes'], 'Agora não': ['Not now', 'Ahora no', 'Non ora', 'Pas maintenant'],
    'Faltam {0} fakes. Tira alguma coisa da sacola com o Dedé ou volta depois.': ['You’re {0} fakes short. Take something out of the bag with Dedé or come back later.', 'Faltan {0} fakes. Quita algo de la bolsa con Dedé o vuelve después.', 'Mancano {0} fakes. Togli qualcosa dalla borsa con Dedé o torna più tardi.', 'Il manque {0} fakes. Retire quelque chose du sac avec Dedé ou reviens plus tard.'],
    'Prontinho! Já é tudo seu.': ['All done! It’s all yours.', '¡Listo! Ya es todo tuyo.', 'Fatto! È tutto tuo.', 'Voilà ! Tout est à toi.'],
    'A comemoração "{0}" já ficou no seu botão {1}. Para trocar, é com o Dedé.': ['The "{0}" celebration is already on your button {1}. To change it, talk to Dedé.', 'La celebración "{0}" ya quedó en tu botón {1}. Para cambiarla, habla con Dedé.', 'L’esultanza "{0}" è già sul tuo pulsante {1}. Per cambiarla, vai da Dedé.', 'La célébration « {0} » est déjà sur ton bouton {1}. Pour changer, va voir Dedé.'],
    'Agora é fazer gol para estrear!': ['Now go score a goal to show it off!', '¡Ahora a hacer un gol para estrenarla!', 'Adesso serve un gol per inaugurarla!', 'Maintenant, il faut marquer pour l’inaugurer !'],
    // (7.1.10) as chuteiras (o Biro e o caixa)
    'Ver as chuteiras': ['See the boots', 'Ver los botines', 'Vedi gli scarpini', 'Voir les crampons'],
    'CHUTEIRAS': ['BOOTS', 'BOTINES', 'SCARPINI', 'CRAMPONS'],
    'Chuteira boa é meio gol! Aqui é a linha premium: 20 modelos, do Pro ao Ícone.': ['A good boot is half a goal! This is the premium line: 20 models, from Pro to Icon.', '¡Un buen botín es medio gol! Esta es la línea premium: 20 modelos, del Pro al Ícono.', 'Uno scarpino buono è mezzo gol! Questa è la linea premium: 20 modelli, dal Pro all’Icona.', 'Un bon crampon, c’est la moitié d’un but ! Voici la gamme premium : 20 modèles, du Pro à l’Icône.'],
    'Quanto mais para a direita da parede, mais exclusiva (e mais cara). A mais barata sai por {0} fakes.': ['The further right on the wall, the more exclusive (and pricier). The cheapest one is {0} fakes.', 'Cuanto más a la derecha de la pared, más exclusivo (y más caro). El más barato sale {0} fakes.', 'Più sono a destra sulla parete, più sono esclusivi (e cari). Il più economico costa {0} fakes.', 'Plus c’est à droite du mur, plus c’est exclusif (et cher). Le moins cher coûte {0} fakes.'],
    'Pode provar à vontade aqui no espelho. O que gostar vai para a sacola e você paga com a Marta.': ['Try on as many as you like here at the mirror. What you like goes in the bag and you pay Marta.', 'Pruébate los que quieras aquí en el espejo. Lo que te guste va a la bolsa y le pagas a Marta.', 'Provane quanti vuoi qui allo specchio. Quello che ti piace va nella borsa e paghi da Marta.', 'Essaie autant que tu veux ici devant le miroir. Ce qui te plaît va dans le sac et tu paies Marta.'],
    'Chegou chuteira nova na parede! Bora provar?': ['New boots on the wall! Want to try some on?', '¡Llegaron botines nuevos a la pared! ¿Te los pruebas?', 'Sono arrivati scarpini nuovi sulla parete! Li provi?', 'Des nouveaux crampons sur le mur ! On essaie ?'],
    'Qual vai ser hoje, craque?': ['Which one will it be today, star?', '¿Cuál va a ser hoy, crack?', 'Quale sarà oggi, campione?', 'Lequel aujourd’hui, champion ?'],
    'Boa! Passa no caixa que a Marta embrulha.': ['Nice! Stop by the checkout and Marta will wrap it up.', '¡Bien! Pasa por la caja que Marta te lo envuelve.', 'Ottimo! Passa alla cassa che Marta te lo incarta.', 'Super ! Passe à la caisse, Marta va l’emballer.'],
    'Volta quando quiser, a parede está sempre cheia.': ['Come back anytime, the wall is always full.', 'Vuelve cuando quieras, la pared siempre está llena.', 'Torna quando vuoi, la parete è sempre piena.', 'Reviens quand tu veux, le mur est toujours plein.'],
    'PROVAR': ['TRY ON', 'PROBAR', 'PROVA', 'ESSAYER'], 'CALÇAR': ['WEAR', 'PONER', 'METTI', 'CHAUSSER'], 'NO PÉ': ['WEARING', 'PUESTO', 'AI PIEDI', 'AUX PIEDS'],
    'Calçando: {0}': ['Wearing: {0}', 'Usando: {0}', 'Ai piedi: {0}', 'Aux pieds : {0}'],
    'A de sempre': ['Your usual', 'Los de siempre', 'Quelli di sempre', 'Les habituels'],
    'Provando': ['Trying on', 'Probando', 'In prova', 'En essai'],
    'Clique em PROVAR para ver a chuteira no seu pé. Ela gira sozinha.': ['Tap TRY ON to see the boot on your foot. It spins on its own.', 'Toca PROBAR para ver el botín en tu pie. Gira solo.', 'Tocca PROVA per vedere lo scarpino al piede. Gira da solo.', 'Touche ESSAYER pour voir le crampon à ton pied. Il tourne tout seul.'],
    'A sua sacola está vazia. O Biro mostra as chuteiras e o Dedé, as comemorações.': ['Your bag is empty. Biro shows the boots and Dedé, the celebrations.', 'Tu bolsa está vacía. Biro muestra los botines y Dedé, las celebraciones.', 'La tua borsa è vuota. Biro mostra gli scarpini e Dedé le esultanze.', 'Ton sac est vide. Biro montre les crampons et Dedé, les célébrations.'],
    'Faltam {0} fakes. Tira alguma coisa da sacola com o Biro ou o Dedé, ou volta depois.': ['You’re {0} fakes short. Take something out of the bag with Biro or Dedé, or come back later.', 'Faltan {0} fakes. Quita algo de la bolsa con Biro o Dedé, o vuelve después.', 'Mancano {0} fakes. Togli qualcosa dalla borsa con Biro o Dedé, o torna più tardi.', 'Il te manque {0} fakes. Retire quelque chose du sac avec Biro ou Dedé, ou reviens plus tard.'],
    'A chuteira "{0}" já ficou no seu pé para a próxima partida. Para trocar, é com o Biro.': ['The "{0}" boots are already on your feet for the next match. To switch, talk to Biro.', 'Los botines "{0}" ya quedaron puestos para el próximo partido. Para cambiarlos, habla con Biro.', 'Gli scarpini "{0}" sono già ai tuoi piedi per la prossima partita. Per cambiarli, vai da Biro.', 'Les crampons "{0}" sont déjà à tes pieds pour le prochain match. Pour changer, vois Biro.'],
    // as bolas (o Juca)
    'Ver as bolas': ['See the balls', 'Ver las pelotas', 'Vedi i palloni', 'Voir les ballons'], 'BOLAS': ['BALLS', 'PELOTAS', 'PALLONI', 'BALLONS'],
    'Bola nas partidas: {0}': ['Match ball: {0}', 'Pelota en los partidos: {0}', 'Pallone in partita: {0}', 'Ballon en match : {0}'],
    'Bola padrão': ['Standard ball', 'Pelota estándar', 'Pallone standard', 'Ballon standard'], 'A bola de estrelas de sempre.': ['The usual star ball.', 'La pelota de estrellas de siempre.', 'Il solito pallone a stelle.', 'Le ballon étoilé habituel.'],
    'OLHAR': ['LOOK', 'MIRAR', 'GUARDA', 'REGARDER'], 'USAR': ['USE', 'USAR', 'USA', 'UTILISER'], 'Em uso': ['In use', 'En uso', 'In uso', 'Utilisé'],
    'Clássica Ouro': ['Gold Classic', 'Clásica Oro', 'Classica Oro', 'Classique Or'], 'Hélice Tricolor': ['Tricolor Helix', 'Hélice Tricolor', 'Elica Tricolore', 'Hélice Tricolore'],
    'Oceano Profundo': ['Deep Ocean', 'Océano Profundo', 'Oceano Profondo', 'Océan Profond'], 'Raio Neon': ['Neon Bolt', 'Rayo Neón', 'Fulmine Neon', 'Éclair Néon'],
    'Chamas': ['Flames', 'Llamas', 'Fiamme', 'Flammes'], 'Carnaval': ['Carnival', 'Carnaval', 'Carnevale', 'Carnaval'],
    'Mármore Real': ['Royal Marble', 'Mármol Real', 'Marmo Reale', 'Marbre Royal'], 'Galáxia': ['Galaxy', 'Galaxia', 'Galassia', 'Galaxie'],
    'Onça Pintada': ['Jaguar', 'Jaguar', 'Giaguaro', 'Jaguar'], 'Diamante Azul': ['Blue Diamond', 'Diamante Azul', 'Diamante Blu', 'Diamant Bleu'],
    'Jabulana': ['Jabulana', 'Jabulana', 'Jabulana', 'Jabulana'], 'Brasuca': ['Brasuca', 'Brasuca', 'Brasuca', 'Brasuca'], 'Triunda': ['Triunda', 'Triunda', 'Triunda', 'Triunda'],
    'Rubi Imperial': ['Imperial Ruby', 'Rubí Imperial', 'Rubino Imperiale', 'Rubis Impérial'], 'Lenda Negra': ['Black Legend', 'Leyenda Negra', 'Leggenda Nera', 'Légende Noire'],
    'Os gomos de sempre, com a costura dourada.': ['The classic panels, with gold stitching.', 'Los gajos de siempre, con costura dorada.', 'I soliti spicchi, con cuciture dorate.', 'Les panneaux classiques, avec couture dorée.'],
    'Faixas em espiral, vermelha e azul.': ['Spiral stripes, red and blue.', 'Franjas en espiral, roja y azul.', 'Strisce a spirale, rossa e blu.', 'Bandes en spirale, rouge et bleue.'],
    'Ondas do turquesa ao azul-marinho.': ['Waves from turquoise to navy blue.', 'Olas del turquesa al azul marino.', 'Onde dal turchese al blu notte.', 'Des vagues du turquoise au bleu marine.'],
    'Preta com raios verde-limão.': ['Black with lime-green bolts.', 'Negra con rayos verde lima.', 'Nero con fulmini verde lime.', 'Noir avec des éclairs vert citron.'],
    'O fogo subindo pela bola.': ['Fire climbing up the ball.', 'El fuego subiendo por la pelota.', 'Il fuoco che sale sul pallone.', 'Le feu qui monte sur le ballon.'],
    'Confete e serpentina dourada.': ['Confetti and a golden streamer.', 'Confeti y serpentina dorada.', 'Coriandoli e stella filante dorata.', 'Confettis et serpentin doré.'],
    'Mármore branco com fio de ouro.': ['White marble with a gold thread.', 'Mármol blanco con hilo de oro.', 'Marmo bianco con filo d’oro.', 'Marbre blanc avec un fil d’or.'],
    'Um pedaço do espaço no seu pé.': ['A piece of outer space at your feet.', 'Un pedazo del espacio en tu pie.', 'Un pezzo di spazio ai tuoi piedi.', 'Un morceau d’espace à tes pieds.'],
    'Dourada, com as rosetas da onça.': ['Golden, with jaguar rosettes.', 'Dorada, con las rosetas del jaguar.', 'Dorato, con le rosette del giaguaro.', 'Dorée, avec les rosettes du jaguar.'],
    'Lapidada como pedra preciosa.': ['Cut like a gemstone.', 'Tallada como una piedra preciosa.', 'Tagliato come una pietra preziosa.', 'Taillé comme une pierre précieuse.'],
    'Inspirada na bola da Copa de 2010.': ['Inspired by the 2010 World Cup ball.', 'Inspirada en la pelota del Mundial 2010.', 'Ispirato al pallone dei Mondiali 2010.', 'Inspirée du ballon de la Coupe du monde 2010.'],
    'Inspirada na bola da Copa de 2014.': ['Inspired by the 2014 World Cup ball.', 'Inspirada en la pelota del Mundial 2014.', 'Ispirato al pallone dei Mondiali 2014.', 'Inspirée du ballon de la Coupe du monde 2014.'],
    'Inspirada na bola da Copa de 2026.': ['Inspired by the 2026 World Cup ball.', 'Inspirada en la pelota del Mundial 2026.', 'Ispirato al pallone dei Mondiali 2026.', 'Inspirée du ballon de la Coupe du monde 2026.'],
    'Vermelho rubi com ouro velho.': ['Ruby red with antique gold.', 'Rojo rubí con oro viejo.', 'Rosso rubino con oro antico.', 'Rouge rubis et or vieilli.'],
    'Preta fosca e ouro. A mais cara da loja.': ['Matte black and gold. The priciest in the store.', 'Negra mate y oro. La más cara de la tienda.', 'Nero opaco e oro. Il più caro del negozio.', 'Noir mat et or. Le plus cher du magasin.'],
    'Fala, craque! Aqui ficam as bolas premium da Golaço.': ['Hey, star! This is where Golaço keeps its premium balls.', '¡Hola, crack! Aquí están las pelotas premium de Golaço.', 'Ciao, campione! Qui ci sono i palloni premium della Golaço.', 'Salut, champion ! Ici, ce sont les ballons premium de Golaço.'],
    'Tem de todo jeito, até umas inspiradas nas bolas da Copa.': ['We’ve got every kind, even some inspired by World Cup balls.', 'Hay de todo tipo, hasta algunas inspiradas en las pelotas del Mundial.', 'Ce ne sono di ogni tipo, anche ispirati ai palloni dei Mondiali.', 'Il y en a de toutes sortes, même inspirés des ballons de Coupe du monde.'],
    'Dá para ver cada uma de pertinho. O que você escolher, a Marta cobra no caixa.': ['You can see each one up close. Whatever you pick, Marta rings up at the checkout.', 'Puedes ver cada una de cerca. Lo que elijas, Marta te lo cobra en la caja.', 'Puoi vederli tutti da vicino. Quello che scegli te lo fa pagare Marta alla cassa.', 'Tu peux voir chacun de près. Ce que tu choisis, Marta l’encaisse à la caisse.'],
    'Bora ver as bolas? Chegou coisa boa.': ['Shall we look at the balls? Good stuff just arrived.', '¿Vemos las pelotas? Llegó algo bueno.', 'Diamo un’occhiata ai palloni? È arrivata roba buona.', 'On regarde les ballons ? Il y a du nouveau.'],
    'Volta quando quiser trocar de bola!': ['Come back whenever you want to switch balls!', '¡Vuelve cuando quieras cambiar de pelota!', 'Torna quando vuoi cambiare pallone!', 'Reviens quand tu veux changer de ballon !'],
    'A sua sacola está vazia. O Biro mostra as chuteiras, o Juca, as bolas e o Dedé, as comemorações.': ['Your bag is empty. Biro shows the boots, Juca the balls and Dedé the celebrations.', 'Tu bolsa está vacía. Biro muestra los botines, Juca las pelotas y Dedé las celebraciones.', 'La tua borsa è vuota. Biro mostra gli scarpini, Juca i palloni e Dedé le esultanze.', 'Ton sac est vide. Biro montre les crampons, Juca les ballons et Dedé les célébrations.'],
    'Faltam {0} fakes. Tira alguma coisa da sacola com os vendedores ou volta depois.': ['You’re {0} fakes short. Take something out of the bag with the salespeople or come back later.', 'Faltan {0} fakes. Quita algo de la bolsa con los vendedores o vuelve después.', 'Mancano {0} fakes. Togli qualcosa dalla borsa con i commessi o torna più tardi.', 'Il te manque {0} fakes. Retire quelque chose du sac avec les vendeurs ou reviens plus tard.'],
    'A bola "{0}" já é a sua bola nas partidas. Para trocar, é com o Juca.': ['The "{0}" ball is now your match ball. To change it, talk to Juca.', 'La pelota "{0}" ya es tu pelota en los partidos. Para cambiarla, habla con Juca.', 'Il pallone "{0}" è già il tuo pallone in partita. Per cambiarlo, parla con Juca.', 'Le ballon « {0} » est déjà ton ballon en match. Pour le changer, parle à Juca.'],
    // (7.1.12) as roupas (a Kelly)
    'Ver as roupas': ['See the clothes', 'Ver la ropa', 'Vedi i vestiti', 'Voir les vêtements'],
    'ROUPAS': ['CLOTHES', 'ROPA', 'VESTITI', 'VÊTEMENTS'],
    'Oi! Aqui é a moda da Golaço: 25 peças que você não acha em outro lugar.': ['Hi! This is Golaço fashion: 25 pieces you won’t find anywhere else.', '¡Hola! Esta es la moda de Golaço: 25 prendas que no encuentras en otro lugar.', 'Ciao! Questa è la moda Golaço: 25 capi che non trovi da nessun’altra parte.', 'Salut ! Voici la mode Golaço : 25 pièces introuvables ailleurs.'],
    'Estampa, listra, xadrez, tie-dye... cada uma com o seu estilo. Prova aqui mesmo, sem compromisso.': ['Prints, stripes, plaid, tie-dye... each with its own style. Try them on right here, no strings attached.', 'Estampados, rayas, cuadros, tie-dye... cada una con su estilo. Pruébatelas aquí mismo, sin compromiso.', 'Stampe, righe, quadri, tie-dye... ognuno col suo stile. Provali qui, senza impegno.', 'Imprimés, rayures, carreaux, tie-dye... chacun son style. Essaie ici même, sans engagement.'],
    'O que você comprar já sai vestido e vai para o guarda-roupa de casa. Paga com a Marta.': ['Whatever you buy you wear out of the store, and it goes to your wardrobe at home. Pay Marta.', 'Lo que compres sale puesto y va al armario de casa. Le pagas a Marta.', 'Quello che compri lo indossi subito e va nell’armadio di casa. Paghi da Marta.', 'Ce que tu achètes, tu le portes en sortant et ça va dans l’armoire à la maison. Tu paies Marta.'],
    'Chegou peça nova! Quer provar?': ['New pieces just arrived! Want to try them on?', '¡Llegaron prendas nuevas! ¿Te las pruebas?', 'Sono arrivati capi nuovi! Vuoi provarli?', 'Nouvelles pièces arrivées ! Tu veux essayer ?'],
    'Vamos montar esse visual?': ['Shall we put that look together?', '¿Armamos ese look?', 'Mettiamo insieme questo look?', 'On compose ce look ?'],
    'Ficou ótimo! Passa no caixa com a Marta.': ['Looks great! Head to the checkout with Marta.', '¡Te quedó genial! Pasa por la caja con Marta.', 'Ti sta benissimo! Passa alla cassa da Marta.', 'Ça te va super bien ! Passe à la caisse avec Marta.'],
    'Volta sempre, toda semana tem novidade.': ['Come back anytime, there’s something new every week.', 'Vuelve siempre, cada semana hay novedades.', 'Torna quando vuoi, ogni settimana ci sono novità.', 'Reviens quand tu veux, il y a du nouveau chaque semaine.'],
    'VESTIR': ['WEAR', 'PONER', 'INDOSSA', 'PORTER'], 'VESTINDO': ['WEARING', 'PUESTO', 'INDOSSATO', 'PORTÉ'],
    'Vestindo: {0}': ['Wearing: {0}', 'Usando: {0}', 'Indossi: {0}', 'Tu portes : {0}'],
    'Clique em PROVAR para ver a roupa em você. Você gira sozinho.': ['Tap TRY ON to see the outfit on you. You spin on your own.', 'Toca PROBAR para ver la ropa puesta. Giras solo.', 'Tocca PROVA per vedere il vestito addosso. Giri da solo.', 'Touche ESSAYER pour voir la tenue sur toi. Tu tournes tout seul.'],
    'Clique em PROVAR para ver a roupa em você. Você gira sozinha.': ['Tap TRY ON to see the outfit on you. You spin on your own.', 'Toca PROBAR para ver la ropa puesta. Giras sola.', 'Tocca PROVA per vedere il vestito addosso. Giri da sola.', 'Touche ESSAYER pour voir la tenue sur toi. Tu tournes toute seule.'],
    'A roupa "{0}" você já está vestindo. Para trocar, é com a Kelly ou no guarda-roupa de casa.': ['You’re already wearing the "{0}" outfit. To change, see Kelly or your wardrobe at home.', 'Ya llevas puesta la ropa "{0}". Para cambiarla, habla con Kelly o usa el armario de casa.', 'Stai già indossando "{0}". Per cambiare, vai da Kelly o usa l’armadio di casa.', 'Tu portes déjà la tenue « {0} ». Pour changer, vois Kelly ou ton armoire à la maison.'],
    // os acessórios e as tatuagens (a Tati)
    'Ver os acessórios': ['See the accessories', 'Ver los accesorios', 'Vedi gli accessori', 'Voir les accessoires'], 'ACESSÓRIOS': ['ACCESSORIES', 'ACCESORIOS', 'ACCESSORI', 'ACCESSOIRES'],
    'BRINCOS': ['EARRINGS', 'PENDIENTES', 'ORECCHINI', 'BOUCLES'], 'COLARES': ['NECKLACES', 'COLLARES', 'COLLANE', 'COLLIERS'], 'LUVAS': ['GLOVES', 'GUANTES', 'GUANTI', 'GANTS'],
    'TATUAGENS': ['TATTOOS', 'TATUAJES', 'TATUAGGI', 'TATOUAGES'],
    'BRAÇO D': ['R ARM', 'BRAZO D', 'BRACCIO D', 'BRAS D'], 'BRAÇO E': ['L ARM', 'BRAZO I', 'BRACCIO S', 'BRAS G'], 'PERNA D': ['R LEG', 'PIERNA D', 'GAMBA D', 'JAMBE D'], 'PERNA E': ['L LEG', 'PIERNA I', 'GAMBA S', 'JAMBE G'],
    'Braço direito': ['Right arm', 'Brazo derecho', 'Braccio destro', 'Bras droit'], 'Braço esquerdo': ['Left arm', 'Brazo izquierdo', 'Braccio sinistro', 'Bras gauche'],
    'Perna direita': ['Right leg', 'Pierna derecha', 'Gamba destra', 'Jambe droite'], 'Perna esquerda': ['Left leg', 'Pierna izquierda', 'Gamba sinistra', 'Jambe gauche'],
    'Tom do metal: {0}': ['Metal tone: {0}', 'Tono del metal: {0}', 'Tonalità del metallo: {0}', 'Teinte du métal : {0}'], 'Neste lugar: {0}': ['In this spot: {0}', 'En este lugar: {0}', 'In questo punto: {0}', 'À cet endroit : {0}'],
    'nada': ['nothing', 'nada', 'niente', 'rien'],
    'Com essa roupa a perna fica coberta: a tatuagem não aparece.': ['With these clothes your leg is covered: the tattoo won’t show.', 'Con esta ropa la pierna queda cubierta: el tatuaje no se ve.', 'Con questi vestiti la gamba è coperta: il tatuaggio non si vede.', 'Avec ces vêtements, la jambe est couverte : le tatouage ne se voit pas.'],
    'Com essa roupa o braço fica coberto: a tatuagem não aparece.': ['With these clothes your arm is covered: the tattoo won’t show.', 'Con esta ropa el brazo queda cubierto: el tatuaje no se ve.', 'Con questi vestiti il braccio è coperto: il tatuaggio non si vede.', 'Avec ces vêtements, le bras est couvert : le tatouage ne se voit pas.'], 'PÔR AQUI': ['PUT HERE', 'PONER AQUÍ', 'METTI QUI', 'METTRE ICI'], 'TIRAR DAQUI': ['REMOVE', 'QUITAR', 'TOGLI', 'ENLEVER'],
    'É seu': ['Yours', 'Es tuyo', 'È tuo', 'À toi'],
    'PROVAR mostra no espelho, sem compromisso.': ['TRY ON shows it in the mirror, no strings attached.', 'PROBAR lo muestra en el espejo, sin compromiso.', 'PROVA lo mostra allo specchio, senza impegno.', 'ESSAYER le montre dans le miroir, sans engagement.'],
    'Ouro': ['Gold', 'Oro', 'Oro', 'Or'], 'Ouro rosé': ['Rose gold', 'Oro rosa', 'Oro rosa', 'Or rose'], 'Ouro branco': ['White gold', 'Oro blanco', 'Oro bianco', 'Or blanc'],
    'Prata': ['Silver', 'Plata', 'Argento', 'Argent'], 'Platina': ['Platinum', 'Platino', 'Platino', 'Platine'], 'Cobre': ['Copper', 'Cobre', 'Rame', 'Cuivre'],
    'Bronze': ['Bronze', 'Bronce', 'Bronzo', 'Bronze'], 'Grafite': ['Graphite', 'Grafito', 'Grafite', 'Graphite'],
    'Ponto de luz': ['Stud', 'Punto de luz', 'Punto luce', 'Puce'], 'Argola pequena': ['Small hoop', 'Aro pequeño', 'Cerchietto piccolo', 'Petit anneau'], 'Gota': ['Drop', 'Gota', 'Goccia', 'Goutte'],
    'Cruz': ['Cross', 'Cruz', 'Croce', 'Croix'], 'Argola grande': ['Large hoop', 'Aro grande', 'Cerchio grande', 'Grand anneau'],
    'Corrente fina': ['Thin chain', 'Cadena fina', 'Catenina sottile', 'Chaîne fine'], 'Pingente de bola': ['Ball pendant', 'Colgante de pelota', 'Ciondolo a pallone', 'Pendentif ballon'],
    'Pingente de cruz': ['Cross pendant', 'Colgante de cruz', 'Ciondolo a croce', 'Pendentif croix'], 'Medalhão': ['Medallion', 'Medallón', 'Medaglione', 'Médaillon'],
    'Corrente grossa': ['Thick chain', 'Cadena gruesa', 'Catena grossa', 'Grosse chaîne'],
    'Luva térmica': ['Thermal gloves', 'Guantes térmicos', 'Guanti termici', 'Gants thermiques'], 'Luva sem dedos': ['Fingerless gloves', 'Guantes sin dedos', 'Guanti senza dita', 'Mitaines'],
    'Luva de goleiro': ['Goalkeeper gloves', 'Guantes de portero', 'Guanti da portiere', 'Gants de gardien'], 'Luva de couro': ['Leather gloves', 'Guantes de cuero', 'Guanti di pelle', 'Gants en cuir'],
    'Luva cravejada': ['Studded gloves', 'Guantes con tachas', 'Guanti borchiati', 'Gants cloutés'],
    'Infinito': ['Infinity', 'Infinito', 'Infinito', 'Infini'], 'Raio': ['Lightning bolt', 'Rayo', 'Fulmine', 'Éclair'], 'Trevo de quatro folhas': ['Four-leaf clover', 'Trébol de cuatro hojas', 'Quadrifoglio', 'Trèfle à quatre feuilles'],
    'Coração com faixa': ['Heart with banner', 'Corazón con cinta', 'Cuore con nastro', 'Cœur à banderole'], 'Âncora': ['Anchor', 'Ancla', 'Ancora', 'Ancre'],
    'Estrela náutica': ['Nautical star', 'Estrella náutica', 'Stella nautica', 'Étoile nautique'], 'Andorinha': ['Swallow', 'Golondrina', 'Rondine', 'Hirondelle'], 'Coroa': ['Crown', 'Corona', 'Corona', 'Couronne'],
    'Rosa': ['Rose', 'Rosa', 'Rosa', 'Rose'], 'Borboleta': ['Butterfly', 'Mariposa', 'Farfalla', 'Papillon'], 'Bússola': ['Compass', 'Brújula', 'Bussola', 'Boussole'],
    'Caveira': ['Skull', 'Calavera', 'Teschio', 'Crâne'], 'Taça': ['Trophy', 'Copa', 'Coppa', 'Trophée'], 'Bola em chamas': ['Flaming ball', 'Pelota en llamas', 'Pallone in fiamme', 'Ballon en flammes'],
    'Ondas': ['Waves', 'Olas', 'Onde', 'Vagues'], 'Arame farpado': ['Barbed wire', 'Alambre de púas', 'Filo spinato', 'Fil barbelé'], 'Tribal': ['Tribal', 'Tribal', 'Tribale', 'Tribal'],
    'Mandala': ['Mandala', 'Mandala', 'Mandala', 'Mandala'], 'Punhal com serpente': ['Dagger and serpent', 'Puñal con serpiente', 'Pugnale con serpente', 'Poignard au serpent'],
    'Caveira com serpentes': ['Skull with serpents', 'Calavera con serpientes', 'Teschio con serpenti', 'Crâne aux serpents'],
    'Oi! Aqui é a seção de acessórios: brincos, colares, luvas e tatuagens.': ['Hi! This is the accessories section: earrings, necklaces, gloves and tattoos.', '¡Hola! Esta es la sección de accesorios: pendientes, collares, guantes y tatuajes.', 'Ciao! Questo è il reparto accessori: orecchini, collane, guanti e tatuaggi.', 'Salut ! Ici, c’est le rayon accessoires : boucles d’oreilles, colliers, gants et tatouages.'],
    'Tudo que é de metal sai em oito tons, do ouro ao grafite. É só escolher.': ['Everything made of metal comes in eight tones, from gold to graphite. Just pick one.', 'Todo lo de metal viene en ocho tonos, del oro al grafito. Solo tienes que elegir.', 'Tutto ciò che è di metallo è disponibile in otto tonalità, dall’oro alla grafite. Basta scegliere.', 'Tout ce qui est en métal existe en huit teintes, de l’or au graphite. Il suffit de choisir.'],
    'As tatuagens eu mesma faço, no estúdio aqui do fundo. Você escolhe o desenho e o lugar: braço ou perna, direito ou esquerdo.': ['I do the tattoos myself, in the studio at the back. You pick the design and the spot: arm or leg, right or left.', 'Los tatuajes los hago yo misma, en el estudio del fondo. Tú eliges el diseño y el lugar: brazo o pierna, derecho o izquierdo.', 'I tatuaggi li faccio io, nello studio sul retro. Scegli il disegno e il punto: braccio o gamba, destra o sinistra.', 'Les tatouages, je les fais moi-même, dans le studio au fond. Tu choisis le dessin et l’endroit : bras ou jambe, droite ou gauche.'],
    'Pode provar tudo no espelho. O que gostar vai para a sacola e a Marta cobra.': ['You can try everything on at the mirror. What you like goes in the bag and Marta rings it up.', 'Puedes probarte todo en el espejo. Lo que te guste va a la bolsa y Marta te lo cobra.', 'Puoi provare tutto allo specchio. Quello che ti piace va nella borsa e Marta te lo fa pagare.', 'Tu peux tout essayer devant le miroir. Ce qui te plaît va dans le sac et Marta l’encaisse.'],
    'Bora se enfeitar?': ['Ready to dress up?', '¿Nos arreglamos?', 'Ci facciamo belli?', 'On s’embellit ?'],
    'Chegou peça nova! Quer ver?': ['New pieces just arrived! Want to see?', '¡Llegaron piezas nuevas! ¿Quieres ver?', 'Sono arrivati pezzi nuovi! Vuoi vedere?', 'Il y a de nouvelles pièces ! Tu veux voir ?'],
    'Ficou muito bom! Passa no caixa com a Marta.': ['Looks great! Stop by the checkout with Marta.', '¡Te quedó muy bien! Pasa por la caja con Marta.', 'Ti sta benissimo! Passa alla cassa da Marta.', 'Ça te va super bien ! Passe à la caisse voir Marta.'],
    'Volta sempre! Sempre chega coisa nova.': ['Come back anytime! New stuff arrives all the time.', '¡Vuelve cuando quieras! Siempre llega algo nuevo.', 'Torna quando vuoi! Arriva sempre roba nuova.', 'Reviens quand tu veux ! Il y a toujours du nouveau.'],
    'Os acessórios novos são seus. Para usar ou trocar, é com a Tati.': ['The new accessories are yours. To wear or switch them, talk to Tati.', 'Los accesorios nuevos son tuyos. Para usarlos o cambiarlos, habla con Tati.', 'I nuovi accessori sono tuoi. Per usarli o cambiarli, parla con Tati.', 'Les nouveaux accessoires sont à toi. Pour les porter ou les changer, parle à Tati.'],
    'A tatuagem "{0}" já está feita: {1}.': ['The "{0}" tattoo is done: {1}.', 'El tatuaje "{0}" ya está hecho: {1}.', 'Il tatuaggio "{0}" è fatto: {1}.', 'Le tatouage « {0} » est fait : {1}.'],
    'A sua sacola está vazia. O Biro mostra as chuteiras, a Kelly as roupas, o Juca as bolas, a Tati os acessórios e o Dedé as comemorações.': ['Your bag is empty. Biro shows the boots, Kelly the clothes, Juca the balls, Tati the accessories and Dedé the celebrations.', 'Tu bolsa está vacía. Biro muestra los botines, Kelly la ropa, Juca las pelotas, Tati los accesorios y Dedé las celebraciones.', 'La tua borsa è vuota. Biro mostra gli scarpini, Kelly i vestiti, Juca i palloni, Tati gli accessori e Dedé le esultanze.', 'Ton sac est vide. Biro montre les crampons, Kelly les vêtements, Juca les ballons, Tati les accessoires et Dedé les célébrations.'],
    'Sem pressa. A sacola fica aqui guardada enquanto você estiver na loja.': ['No rush. The bag stays here while you’re in the store.', 'Sin apuro. La bolsa queda guardada aquí mientras estés en la tienda.', 'Con calma. La borsa resta qui finché sei in negozio.', 'Pas de souci. Le sac reste ici tant que tu es dans le magasin.'],
  };
  const fem = () => typeof PERSONAGEM !== 'undefined' && PERSONAGEM.genero === 'F';
  const Tx = (k) => (typeof T === 'function' ? T(k) : k);
  const Tfx = (k, ...a) => { let s = Tx(k); a.forEach((v, i) => { s = s.split('{' + i + '}').join(v); }); return s; };
  const clampN = (v, a, b) => Math.max(a, Math.min(b, v));
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pk = (l) => l[Math.floor(Math.random() * l.length)];
  const AZUL = '#1c3aa0', AMAR = '#f2c230';
  // a equipe: [chave, nome, seção, sexo, semente da aparência]
  const EQUIPE = [
    { k: 'marta', nome: 'Marta', sec: 'caixa', sexo: 'F', seed: 6101 }, { k: 'biro', nome: 'Biro', sec: 'chuteiras', sexo: 'M', seed: 6102 }, { k: 'kelly', nome: 'Kelly', sec: 'roupas', sexo: 'F', seed: 6103 },
    { k: 'juca', nome: 'Juca', sec: 'bolas', sexo: 'M', seed: 6104 }, { k: 'tati', nome: 'Tati', sec: 'acessorios', sexo: 'F', seed: 6105 }, { k: 'dede', nome: 'Dedé', sec: 'comemoracoes', sexo: 'M', seed: 6106 },
  ];
  const PAPO = {
  };
  const DANCAS_DEDE = ['robo', 'passinho', 'dancinha', 'coracao', 'musculoso', 'reverencia', 'piao'];

  function criar(api) {
    const S = () => api.S();
    const M = { R: null, D: null, nav: null, eq: {}, gente: [], sacola: [], previa: null, painel: null, prox: 4, dede: null };
    const dadosC = () => { const d = S().dados; if (!d.celeb || !Array.isArray(d.celeb.tem)) d.celeb = { tem: [], slots: ['aviao', 'joelhada'] }; if (!Array.isArray(d.celeb.slots)) d.celeb.slots = ['aviao', 'joelhada']; return d.celeb; };
    const dadosE = () => { const d = S().dados; if (!d.esportiva) d.esportiva = {}; return d.esportiva; };
    const CELS = () => (typeof CELEBRACOES !== 'undefined' ? CELEBRACOES : {});
    const daLoja = () => Object.keys(CELS()).filter((k) => CELS()[k].loja);
    const tem = (k) => !CELS()[k].loja || dadosC().tem.includes(k);
    // (7.1.10) as chuteiras premium (jogo.js: CHUTEIRAS com loja: true) e a sacola compartilhada (comemoração = a chave; chuteira = 'ch:' + nome)
    const CHS = () => (typeof CHUTEIRAS !== 'undefined' ? CHUTEIRAS : []);
    const lojaCh = () => CHS().map((c, i) => i).filter((i) => CHS()[i].loja);
    const idxCh = (nome) => CHS().findIndex((c) => c.loja && c.nome === nome);
    const dadosCh = () => { const d = S().dados; if (!d.chuteiras || !Array.isArray(d.chuteiras.tem)) d.chuteiras = { tem: [], usando: null }; return d.chuteiras; };
    const apar = () => (typeof PERSONAGEM !== 'undefined' ? (PERSONAGEM.aparencia || (PERSONAGEM.aparencia = {})) : {});
    function chOriginal() {                                              // a chuteira do criador (a "de sempre"), guardada na 1ª vez
      //   (personagem antigo, sem chuteira escolhida: original = −1 → volta sem chuteira; no catálogo aparece a primeira da lista)
      const D = dadosCh(); if (D.original == null) { const i = apar().chuteira, c = CHS()[i]; D.original = i == null ? -1 : c && !c.loja ? i : 0; } return Math.max(0, D.original);
    }
    function calcar(nome) {                                              // põe a chuteira no personagem (nome null = a de sempre)
      const ap = apar(), D = dadosCh(); chOriginal();
      if (nome) { const i = idxCh(nome); if (i < 0) return; ap.chuteira = i; ap.chuteiraNome = nome; D.usando = nome; }
      else { if (D.original >= 0) ap.chuteira = D.original; else delete ap.chuteira; delete ap.chuteiraNome; D.usando = null; }
    }
    const usandoIdx = () => { const i = apar().chuteira; return CHS()[i] ? i : chOriginal(); };
    // (7.1.12) as roupas da loja (fase2.js: ROUPAS com loja: 1) e o que fica no save da Fase 2 (roupa vestida e as compradas)
    const RPS = () => { const f2 = S().f2; return f2 && f2._roupas ? f2._roupas : null; };
    const listaRp = () => { const R = RPS(); return R ? R.ROUPAS[fem() ? 'F' : 'M'] : []; };
    const lojaRp = () => listaRp().map((r, i) => i).filter((i) => listaRp()[i].loja).sort((a, b) => listaRp()[a].preco - listaRp()[b].preco || a - b);
    const idxRp = (nome) => listaRp().findIndex((r) => r.loja && r.n === nome);
    const hF2 = () => { try { return api.historia().ler('fase2') || {}; } catch (e) { return {}; } };
    const gravarF2 = (mud) => { try { const h = hF2(); api.historia().gravar('fase2', Object.assign({}, h, mud)); } catch (e) { console.warn('[Esportiva] save da Fase 2:', e); } };
    const minhasRp = () => (hF2().roupasLoja || []).slice();
    const vestindoRp = () => { const r = hF2().roupa; return r && r.id >= 0 ? r.id : -1; };
    function vestirRp(nome) {                                            // veste a roupa da loja (cores originais dela) e grava
      const i = idxRp(nome); if (i < 0) return; const R = listaRp()[i], c = RPS().c4(R.c);
      gravarF2({ roupa: { id: i, cores: c.slice() } });
    }
    const ehRp = (k) => String(k).startsWith('rp:');
    const ehCh = (k) => String(k).startsWith('ch:');
    // as bolas do Juca na mesma sacola: 'bola:' + nome
    const ehBola = (k) => String(k).startsWith('bola:');
    const bolaDe = (nome) => BOLAS.find((b) => b.nome === nome);
    const dadosB = () => { const d = S().dados; if (!d.bolas || !Array.isArray(d.bolas.tem)) d.bolas = { tem: [], usando: null }; return d.bolas; };
    // e os acessórios e tatuagens da Tati: 'ac:' + chave, 'tat:' + chave
    const precoDe = (k) => (ehCh(k) ? ((CHS()[idxCh(k.slice(3))] || {}).preco || 0) : ehBola(k) ? ((bolaDe(k.slice(5)) || {}).preco || 0) : ehRp(k) ? ((listaRp()[idxRp(k.slice(3))] || {}).preco || 0)
      : String(k).startsWith('ac:') ? ((ACESSORIO_POR_K[k.slice(3)] || {}).preco || 0) : String(k).startsWith('tat:') ? ((TATUAGEM_POR_K[k.slice(4)] || {}).preco || 0) : PRECO);
    const nomeItem = (k) => (ehCh(k) || ehRp(k) ? Tx(k.slice(3)) : ehBola(k) ? Tx(k.slice(5)) : String(k).startsWith('ac:') ? Tx((ACESSORIO_POR_K[k.slice(3)] || {}).nome || '')
      : String(k).startsWith('tat:') ? Tx((TATUAGEM_POR_K[k.slice(4)] || {}).nome || '') : Tx(CELS()[k].nome));
    const totalSacola = () => M.sacola.reduce((a, k) => a + precoDe(k), 0);
    // a chuteira comprada volta para o pé se o personagem foi recarregado sem ela (o save da cidade é quem manda)
    function sincronizarChuteira() { try { const D = dadosCh(); chOriginal(); if (D.usando && apar().chuteiraNome !== D.usando && idxCh(D.usando) >= 0) calcar(D.usando); } catch (e) { /* sem dados ainda */ } }

    function modelo(ap, fem2, roupa, cores) {
      const s = S(); let m = null, opt = null;
      try { if (s.f2 && s.f2.modeloPessoa) { const r = s.f2.modeloPessoa({ ap, fem: fem2, roupa, cores }); m = r.m; opt = r.opt; } } catch (e) { console.warn('[Esportiva] modelo:', e); }
      if (!m) { opt = Object.assign({ camisa: cores[0], listra: cores[0], gola: cores[2], calcao: cores[1], meia: cores[1], sola: '#e6e6e0', corTexto: '#F2F2EE', numero: '', nome: ' ', fundoNome: 'rgba(0,0,0,0)', manga: 0, meiao: 1, cabecao: 1, escala: 1 }, ap); m = makeAthlete(opt); }
      return { m, opt };
    }
    function criarEquipe(E) {
      const s = S(), ap = api.gerarAparencia(E.seed, E.sexo), { m, opt } = modelo(ap, E.sexo === 'F', 0, [AZUL, '#1c1c1f', AMAR, '#f4f4ec']);
      const G = new api.Geo(); G.box(0.02, 0.1, 0.16, AMAR, 0.185, 1.12, 0.12); G.box(0.36, 0.05, 0.5, AMAR, 0, 0.62, 0);   // o crachá e a faixa amarela da cintura
      m.corpo.add(G.malha(api.MAT));
      const A = api.atorDe(m, opt, 'equipeEsp'); A.eq = E; s.npcs.push(A); M.eq[E.k] = A;
      const P = E.sec === 'caixa' ? M.D.caixa : M.D.secoes[E.sec]; A.x = P.x; A.z = P.z; A.yaw = A.yawAlvo = P.yaw; A.casa = P;
      s.falantesExtra = s.falantesExtra || {}; s.falantesExtra['esp_' + E.k] = { A, nome: Tx(E.nome), voz: E.sexo === 'F' ? 0 : 2 };
      return A;
    }

    // ---------------------------------------------------------------- NAVEGAÇÃO: grade de 0,35 m e A* (como no bar.js)
    const CEL = 0.35, RR = 0.3;
    function livreEst(x, z) {
      const L = M.R.lim; if (x < L.x0 || x > L.x1 || z < L.z0 || z > L.z1) return false;
      for (const b of M.R.col) if (x > b.x0 - RR && x < b.x1 + RR && z > b.z0 - RR && z < b.z1 + RR) return false;
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
      for (let r = 1; r < 14; r++) { let melhor = null, bd = 1e9;
        for (let dj = -r; dj <= r; dj++) for (let di = -r; di <= r; di++) { if (Math.max(Math.abs(di), Math.abs(dj)) !== r) continue; const a = i + di, b = j + dj; if (a < 0 || b < 0 || a >= N.nx || b >= N.nz || !N.livre[b * N.nx + a]) continue; const d = di * di + dj * dj; if (d < bd) { bd = d; melhor = [a, b]; } }
        if (melhor) return melhor; }
      return [i, j];
    }
    function pontoLivre(x, z) { if (livreEst(x, z)) return { x, z }; const [i, j] = celLivreMaisPerto(...cel(x, z)); return cen(i, j); }
    function vista(a, b) { const d = Math.hypot(b.x - a.x, b.z - a.z), n = Math.ceil(d / 0.12); for (let k = 1; k <= n; k++) { const u = k / n; if (!livreEst(a.x + (b.x - a.x) * u, a.z + (b.z - a.z) * u)) return false; } return true; }
    function caminho(x0, z0, x1, z1, exato) {
      if (!M.nav) montarNav();
      const N = M.nav, fim = exato ? { x: x1, z: z1 } : pontoLivre(x1, z1), fimL = pontoLivre(x1, z1), [si, sj] = celLivreMaisPerto(...cel(x0, z0)), [ti, tj] = cel(fimL.x, fimL.z);
      if (vista({ x: x0, z: z0 }, fimL)) return exato && (fim.x !== fimL.x || fim.z !== fimL.z) ? [fimL, fim] : [fim];
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
      cs.reverse(); cs.push(fimL);
      const out = []; let a = { x: x0, z: z0 }, k = 0;
      while (k < cs.length) { let far = k; for (let q = cs.length - 1; q > k; q--) if (vista(a, cs[q])) { far = q; break; } out.push(cs[far]); a = cs[far]; k = far + 1; }
      if (exato) out.push(fim);
      return out;
    }
    function genteNaFrente(A, nx, nz) {
      const s = S();
      for (const B of s.npcs.concat([s.jog])) { if (B === A || B.oculto || B.sentado) continue; const dn = Math.hypot(nx - B.x, nz - B.z); if (dn < 0.5 && dn < Math.hypot(A.x - B.x, A.z - B.z) - 1e-4) return true; }
      return false;
    }
    function andarP(A, dt) {
      const R = A.rotaP; if (!R || !R.length) { A.andando = false; return true; }
      const q = R[0], dx = q.x - A.x, dz = q.z - A.z, d = Math.hypot(dx, dz), v = (A.vel || 1.2) * dt;
      if (d <= Math.max(v, 0.04)) { A.x = q.x; A.z = q.z; R.shift(); A.esperaP = 0; if (!R.length) { A.andando = false; return true; } return false; }
      const tenta = (ux, uz, fantasma) => { const nx = A.x + ux * v, nz = A.z + uz * v; if (!fantasma && !livreEst(nx, nz) && livreEst(A.x, A.z)) return false; if (!fantasma && genteNaFrente(A, nx, nz)) return false; A.x = nx; A.z = nz; A.yawAlvo = Math.atan2(-uz, ux); return true; };
      const ux = dx / d, uz = dz / d, esp = A.esperaP || 0;
      let ok = tenta(ux, uz, false);
      if (!ok && esp > 0.3) for (const ang of [0.6, -0.6, 1.1, -1.1]) { const c = Math.cos(ang), s2 = Math.sin(ang); if (tenta(ux * c - uz * s2, ux * s2 + uz * c, false)) { ok = true; break; } }
      if (!ok && esp > 1.2) ok = tenta(ux, uz, true);
      A.andando = ok; A.correndo = false; A.esperaP = ok ? Math.max(0, esp - dt * 2) : esp + dt;
      return false;
    }
    const irPara = (A, x, z, exato) => { A.rotaP = caminho(A.x, A.z, x, z, exato); };
    async function andarJog(x, z, vel) { const J = S().jog, r = caminho(J.x, J.z, x, z); await api.andar(J, r.map((p) => [p.x, p.z]), vel || 1.7); }


    // ---------------------------------------------------------------- AS POSES DAS COMEMORAÇÕES (a mesma função da partida: jogo.js)
    function posar(A, c, t) {
      const m = A.m, r = m.raiz, P = celebPose(c, t), corre = t < c.swing ? Math.sin(t * 11) * 0.9 : 0;
      aplicarPoseCeleb(m, c, P, corre, { x: r.position.x, y: r.position.y, z: r.position.z }, -A.yaw); aplicarPoseCelebExtras(m, P);
    }
    function soltar(A) {                                                 // volta o boneco ao normal (o poseAtor cuida do resto)
      const m = A.m, r = m.raiz; r.rotation.order = 'XYZ'; r.rotation.x = 0; r.rotation.z = 0; m.corpo.rotation.y = 0; m.corpo.rotation.z = 0;
      m.pernaE.rotation.x = 0; m.pernaD.rotation.x = 0; usarCotovelo(m.bracoE, 0, 0); usarCotovelo(m.bracoD, 0, 0); usarJoelhos(m, 0, 0); if (m.cabecaLigada) usarCabeca(m, 0);
    }
    // o jogador testando no campinho (VER no catálogo)
    function ver(k) {
      const s = S(), J = s.jog, c = CELS()[k], Pc = M.D.palco; if (!c || M.previa) return;
      let dist = 0; for (let t = 0; t < c.dur; t += 0.05) dist += celebVel(c, t) * 0.05;
      J.x = Pc.x0; J.z = Pc.z; J.yaw = J.yawAlvo = 0; J.andando = false; J.correndo = false;
      M.previa = { k, c, t: 0, fator: dist > 0.1 ? Math.min(1, (Pc.x1 - Pc.x0) / dist) : 1 };
      if (M.dede) { soltar(M.eq.dede); M.dede = null; }
      try { api.som && api.som('pop'); } catch (e) { /* sem som */ }
    }
    function tickPrevia(dt) {
      const s = S(), J = s.jog, Pv = M.previa; if (!Pv) return;
      const c = Pv.c, C = M.D.campo; if (!Pv.pausa) Pv.t += dt;   // (pausa: só para os testes)
      const v = celebVel(c, Math.min(Pv.t, c.dur)) * Pv.fator; J.yaw -= c.giro * dt * 0.6; J.yawAlvo = J.yaw;
      J.x = clampN(J.x + Math.cos(J.yaw) * v * dt, C.x0 + 1.2, C.x1 - 0.4); J.z = clampN(J.z - Math.sin(J.yaw) * v * dt, C.z0 + 0.5, C.z1 - 0.5);
      posar(J, c, Math.min(Pv.t, c.dur));
      if (Pv.t >= c.dur + 0.15) { soltar(J); M.previa = null; if (M.painel) M.painel.render(); }
    }
    // o Dedé chamando cliente: de vez em quando faz uma comemoração parado, na beira do campinho
    function tickDede(dt) {
      const A = M.eq.dede; if (!A) return;
      if (M.dede) { M.dede.t += dt; posar(A, M.dede.c, Math.min(M.dede.t, M.dede.c.dur)); if (M.dede.t >= M.dede.c.dur) { soltar(A); M.dede = null; M.proxDede = rnd(9, 18); } return; }
      if (A.falando || M.previa || M.painel || S().modo !== 'livre') return;
      M.proxDede = (M.proxDede == null ? rnd(3, 7) : M.proxDede) - dt;
      if (M.proxDede <= 0) { const k = pk(DANCAS_DEDE.filter((q) => CELS()[q])); if (k) M.dede = { k, c: CELS()[k], t: 0 }; else M.proxDede = 20; }
    }

    // ---------------------------------------------------------------- OS PSEUDO-CLIENTES (passeiam, olham as prateleiras e vão embora)
    const pontoLivreOlhar = (A) => { const usados = new Set(M.gente.filter((q) => q !== A && q.es).map((q) => q.es.i)), J = S().jog; const L = M.D.olhar.map((p, i) => i).filter((i) => !usados.has(i) && Math.hypot(M.D.olhar[i][0] - J.x, M.D.olhar[i][1] - J.z) > 1.0 && !noCorredorAc(M.D.olhar[i])); return L.length ? pk(L) : -1; };
    function novoCliente(jaDentro) {
      const s = S(), A = api.criarPessoa(s.f2, Math.random, Math.random() < 0.45); A.tipo = 'clienteEsp'; A.vel = 1.0 + Math.random() * 0.25;
      const i = pontoLivreOlhar(A); if (i < 0) { api.descartarPessoa(A); return null; }
      A.es = { i, fase: jaDentro ? 'olha' : 'indo', t: 0, dur: rnd(4, 9), resta: 2 + Math.floor(Math.random() * 4) };
      const p = M.D.olhar[i];
      if (jaDentro) { A.x = p[0]; A.z = p[1]; A.yaw = A.yawAlvo = p[2]; A.es.t = rnd(0, 4); }
      else { const e = M.R.entrada; A.x = e.x + rnd(-0.3, 0.3); A.z = e.z + 0.4; A.yaw = A.yawAlvo = Math.PI / 2; irPara(A, p[0], p[1]); }
      s.npcs.push(A); api.poseAtor(A, 0.016); M.gente.push(A); return A;
    }
    function poseOlha(A, m) {                                           // a mão no queixo, pensando (ou as duas na cintura)
      if (A.es && A.es.jeito) { m.bracoE.rotation.x = 1.1; m.bracoD.rotation.x = -1.1; usarCotovelo(m.bracoE, -1.9, 0); usarCotovelo(m.bracoD, 1.9, 0); }
      else { m.bracoD.rotation.z = 0.95; usarCotovelo(m.bracoD, 0, 1.95); m.bracoE.rotation.z = 0.75; usarCotovelo(m.bracoE, -1.3, 0.2); usarCabeca(m, -0.1 + Math.sin((A.t || 0) * 0.8) * 0.08); }
    }
    function tickCliente(A, dt) {
      const E = A.es; if (!E || !M.D) return; E.t += dt;
      if (E.fase === 'sai') { if (andarP(A, dt) || E.t > 30) { M.gente = M.gente.filter((q) => q !== A); api.descartarPessoa(A); } return; }
      if (E.fase === 'indo') { if (andarP(A, dt) || E.t > 25) { const p = M.D.olhar[E.i]; E.fase = 'olha'; E.t = 0; E.dur = rnd(4, 9); A.yawAlvo = p[2]; A.andando = false; E.jeito = Math.random() < 0.35; A.poseFn = Math.random() < 0.6 ? poseOlha : null; } return; }
      if (E.t > E.dur) {
        A.poseFn = null; E.resta--;
        const i = E.resta > 0 ? pontoLivreOlhar(A) : -1;
        if (i < 0) { E.fase = 'sai'; E.t = 0; E.i = -1; const sd = M.R.saida; A.rotaP = caminho(A.x, A.z, sd.x, sd.z - 0.6); A.rotaP.push({ x: sd.x, z: sd.z + 0.2 }); }
        else { E.i = i; E.fase = 'indo'; E.t = 0; irPara(A, M.D.olhar[i][0], M.D.olhar[i][1]); }
      }
    }
    const alvoClientes = () => (api.diaSemana() >= 5 ? 5 : 3);
    function tickFluxo(dt) {
      M.prox -= dt; if (M.prox > 0) return; M.prox = rnd(6, 14);
      if (M.gente.filter((A) => A.es && A.es.fase !== 'sai').length < alvoClientes()) novoCliente(false);
    }

    // ---------------------------------------------------------------- O CATÁLOGO DAS COMEMORAÇÕES (painel à direita: o campinho fica à vista)
    function abrirPainel() {
      return new Promise((fim) => {
        const d = S().dados, C = dadosC();
        const el = document.createElement('div'); el.id = 'espCatalogo';
        el.style.cssText = 'position:fixed;z-index:22;right:8px;top:8px;bottom:8px;width:min(350px,48vw);background:#101a3c;border:4px solid ' + AMAR + ';color:#f4f0e6;display:flex;flex-direction:column;font-family:var(--font-body);box-shadow:-6px 6px 0 #0008;';
        const cab = document.createElement('div'); cab.style.cssText = 'padding:8px 10px;background:' + AZUL + ';border-bottom:3px solid ' + AMAR + ';display:flex;flex-direction:column;gap:3px;';
        const tit = document.createElement('div'); tit.style.cssText = 'font:700 14px/1.1 var(--font-display);letter-spacing:.08em;color:' + AMAR + ';'; tit.textContent = Tx('COMEMORAÇÕES');
        const inf = document.createElement('div'); inf.style.cssText = 'font:600 11.5px/1.35 var(--font-body);white-space:pre-line;';
        cab.append(tit, inf);
        const lista = document.createElement('div'); lista.style.cssText = 'flex:1;overflow:auto;padding:6px;display:flex;flex-direction:column;gap:5px;';
        const pe = document.createElement('div'); pe.style.cssText = 'padding:6px 8px;border-top:3px solid ' + AMAR + ';display:flex;flex-direction:column;gap:5px;align-items:stretch;';
        const nota = document.createElement('div'); nota.style.cssText = 'font:600 10.5px/1.3 var(--font-body);color:#c8d0ea;'; nota.textContent = Tx('O que está na sacola você paga no caixa, com a Marta.');
        const fechar = document.createElement('button'); fechar.type = 'button'; fechar.className = 'pxBtn'; fechar.textContent = Tx('FECHAR'); fechar.style.cssText = '--p:var(--p2,2px);height:38px;font-size:12px;';
        pe.append(nota, fechar);
        const bt = (txt, cor, fn, on) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = txt; b.style.cssText = 'flex:1;min-width:0;height:28px;border:2px solid ' + (on ? '#fff' : '#0b1430') + ';background:' + cor + ';color:' + (cor === AMAR ? '#101a3c' : '#fff') + ';font:700 10px/1 var(--font-display);letter-spacing:.03em;cursor:pointer;padding:0 4px;'; b.onclick = fn; return b; };
        function render() {
          const nomeDe = (k) => Tx(CELS()[k].nome);
          inf.textContent = Tfx('Você tem {0} fakes', d.fakes) + '\n' + (M.sacola.length ? Tfx('Sacola: {0} ({1} fakes)', M.sacola.length, totalSacola()) : Tx('Sacola vazia')) + '\n' + Tfx('Botão 1: {0}', nomeDe(C.slots[0])) + ' · ' + Tfx('Botão 2: {0}', nomeDe(C.slots[1]));
          const rolagem = lista.scrollTop; lista.innerHTML = '';
          for (const k of ['aviao', 'joelhada'].concat(daLoja())) {
            const c = CELS()[k], meu = tem(k), naSac = M.sacola.includes(k), vendo = M.previa && M.previa.k === k;
            const lin = document.createElement('div'); lin.dataset.k = k; lin.style.cssText = 'background:' + (vendo ? '#2a3a7a' : '#1a2650') + ';border:2px solid ' + (meu ? '#3fb76a' : naSac ? AMAR : '#2a3a7a') + ';padding:5px 6px;display:flex;flex-direction:column;gap:4px;';
            const top = document.createElement('div'); top.style.cssText = 'display:flex;justify-content:space-between;align-items:center;gap:6px;';
            const n = document.createElement('span'); n.style.cssText = 'font:700 12.5px/1.1 var(--font-display);'; n.textContent = nomeDe(k);
            const tag = document.createElement('span'); tag.style.cssText = 'font:700 10px/1 var(--font-display);padding:3px 5px;white-space:nowrap;background:' + (meu ? '#1f7a4d' : naSac ? '#8a6a10' : '#0b1430') + ';color:' + (meu || naSac ? '#fff' : AMAR) + ';';
            tag.textContent = !c.loja ? Tx('De graça') : meu ? Tx('É sua') : naSac ? Tx('Na sacola') : Tfx('{0} fakes', PRECO);
            top.append(n, tag);
            const bs = document.createElement('div'); bs.style.cssText = 'display:flex;gap:4px;';
            bs.appendChild(bt(Tx('VER'), '#3a64b8', () => { ver(k); render(); }));
            if (meu) { bs.appendChild(bt(Tx('BOTÃO 1'), C.slots[0] === k ? '#1f7a4d' : '#2a3a7a', () => equipar(0, k), C.slots[0] === k)); bs.appendChild(bt(Tx('BOTÃO 2'), C.slots[1] === k ? '#1f7a4d' : '#2a3a7a', () => equipar(1, k), C.slots[1] === k)); }
            else if (naSac) bs.appendChild(bt(Tx('TIRAR'), '#a3162a', () => { M.sacola = M.sacola.filter((q) => q !== k); render(); }));
            else bs.appendChild(bt(Tx('LEVAR'), AMAR, () => { M.sacola.push(k); try { api.som && api.som('pop'); } catch (e) { /* nada */ } render(); }));
            lin.append(top, bs); lista.appendChild(lin);
          }
          lista.scrollTop = rolagem;
        }
        function equipar(i, k) { if (C.slots[1 - i] === k) C.slots[1 - i] = C.slots[i]; C.slots[i] = k; api.gravar(d.ponto || 'chegada'); render(); }
        fechar.onclick = () => { if (M.previa) { soltar(S().jog); M.previa = null; } el.remove(); M.painel = null; fim(); };
        el.append(cab, lista, pe); (document.getElementById('raizJogo') || document.body).appendChild(el);
        M.painel = { el, render }; render();
      });
    }
    async function catalogo() {
      const s = S(), J = s.jog, d = s.dados, E = dadosE(), A = M.eq.dede; if (!A || M.painel) return;
      s.modo = 'cena'; api.UI().ctl.hidden = true; api.aviso(''); A.falando = true; if (M.dede) { soltar(A); M.dede = null; }
      const y0 = A.yawAlvo; A.yawAlvo = Math.atan2(-(J.z - A.z), J.x - A.x);
      try {
        if (!E.dede) {
          await api.fala('esp_dede', Tx('E aí, craque! Aqui é o cantinho das comemorações. Gol sem festa não vale!'));
          await api.fala('esp_dede', Tfx('Tenho 20 comemorações, {0} fakes cada. Pode testar todas aqui no campinho antes de levar.', PRECO));
          await api.fala('esp_dede', Tx('O que você escolher vai para a sacola. Depois é só pagar com a Marta, no caixa.'));
          E.dede = true; api.gravar(d.ponto || 'chegada');
        } else await api.fala('esp_dede', Tx('Bora ver o que combina com você!'));
        Dialogo.esconder();
        await andarJog(M.D.palco.x0, M.D.palco.z, 2.4); J.yawAlvo = 0; A.yawAlvo = Math.atan2(-(M.D.palco.z - A.z), 0 - A.x);
        const n0 = M.sacola.length;
        await abrirPainel();
        A.yawAlvo = Math.atan2(-(J.z - A.z), J.x - A.x);
        await api.fala('esp_dede', M.sacola.length > n0 ? Tx('Boa escolha! Passa no caixa que a Marta fecha a conta.') : M.sacola.length ? Tx('O que você escolher vai para a sacola. Depois é só pagar com a Marta, no caixa.') : Tx('Volta quando quiser treinar a comemoração!'));
      } catch (e) { console.error('[Esportiva] catálogo:', e); }
      finally {
        A.falando = false; A.yawAlvo = y0; if (M.painel) { M.painel.el.remove(); M.painel = null; } if (M.previa) { soltar(J); M.previa = null; }
        try { Dialogo.esconder(); } catch (e) { /* nada */ }
        const ss = S(); if (ss && ss.ativo && ss.modo === 'cena') api.liberar();
      }
    }
    // ---------------------------------------------------------------- (7.1.10) AS CHUTEIRAS: a vitrine, o provador e o catálogo do Biro
    // uma malha só com vários pares (o desenho de cada chuteira numa textura, como no jogador): itens = [{ c, x, y, z, yaw, e }]
    const FACES = [[[1, 0, 0], [[1, -1, 1], [1, -1, -1], [1, 1, -1], [1, 1, 1]]], [[-1, 0, 0], [[-1, -1, -1], [-1, -1, 1], [-1, 1, 1], [-1, 1, -1]]],
      [[0, 1, 0], [[-1, 1, 1], [1, 1, 1], [1, 1, -1], [-1, 1, -1]]], [[0, -1, 0], [[-1, -1, -1], [1, -1, -1], [1, -1, 1], [-1, -1, 1]]],
      [[0, 0, 1], [[-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]]], [[0, 0, -1], [[1, -1, -1], [-1, -1, -1], [-1, 1, -1], [1, 1, -1]]]];
    function malhaChuteiras(itens) {
      const W = 128, H = 64, tile = new Map();
      [...new Set(itens.map((q) => q.c))].forEach((c, k) => tile.set(c, [(k % 7) * 16, Math.floor(k / 7) * 16]));
      const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
      g.fillStyle = '#ffffff'; g.fillRect(112, 48, 16, 16);
      for (const [c, [tx, ty]] of tile) pintarChuteira(g, tx, ty, c);
      const tex = api.guardar(new THREE.CanvasTexture(cv)); tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.NearestFilter; tex.generateMipmaps = false;
      const P = [], N = [], U = [], C = [], uvT = (tx, ty) => [(tx + 0.05) / W, 1 - (ty + 15.95) / H, (tx + 15.95) / W, 1 - (ty + 0.05) / H], uvB = uvT(112, 48);
      const rgb = (h) => { const n = parseInt(String(h).slice(1), 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; };
      function caixa(B, w, h, d, lx, ly, lz, uv, cor) {
        const co = Math.cos(B.yaw), si = Math.sin(B.yaw), e = B.e, col = rgb(cor), uvs = [[uv[0], uv[1]], [uv[2], uv[1]], [uv[2], uv[3]], [uv[0], uv[3]]];
        const tr = (x, y, z) => { const X = (lx + x) * e, Z = (lz + z) * e; return [B.x + X * co + Z * si, B.y + (ly + y) * e, B.z - X * si + Z * co]; };
        for (const [n, cs] of FACES) {
          const q = cs.map(([a, b, c]) => tr(a * w / 2, b * h / 2, c * d / 2)), nn = [n[0] * co + n[2] * si, n[1], -n[0] * si + n[2] * co];
          for (const k of [0, 1, 2, 0, 2, 3]) { P.push(...q[k]); N.push(...nn); U.push(...uvs[k]); C.push(...col); }
        }
      }
      for (const B of itens) {                                          // a bota: sola (+ filete), o cabedal com o desenho e a boca (ou o cano de tricô)
        const c = B.c, [tx, ty] = tile.get(c);
        caixa(B, 0.33, 0.03, 0.25, 0, 0.015, 0, uvB, c.sola || '#e6e6e0');
        if (c.solaDet) caixa(B, 0.336, 0.012, 0.256, 0, 0.032, 0, uvB, c.solaDet);
        caixa(B, 0.32, 0.12, 0.24, 0, 0.09, 0, uvT(tx, ty), '#ffffff');
        if (c.cano) { caixa(B, 0.236, 0.06, 0.236, -0.04, 0.18, 0, uvB, c.cano); caixa(B, 0.17, 0.01, 0.17, -0.04, 0.211, 0, uvB, '#141414'); }
        else caixa(B, 0.16, 0.008, 0.15, -0.04, 0.152, 0, uvB, '#141414');
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); geo.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); geo.setAttribute('color', new THREE.Float32BufferAttribute(C, 3));
      return new THREE.Mesh(api.guardar(geo), api.guardar(new THREE.MeshLambertMaterial({ map: tex, vertexColors: true })));
    }
    // a parede premium (um par em cada nicho, a mais barata de cada nível embaixo) e o destaque girando na redoma
    function montarVitrine(R) {
      const D = M.D, lista = lojaCh(); if (!D.vitrine || !lista.length || typeof pintarChuteira !== 'function') return;
      const itens = [], usados = new Set();
      for (const i of lista) {
        const c = CHS()[i], v = D.vitrine.find((q, k) => !usados.has(k) && q.nivel === c.nivel); if (!v) continue; usados.add(D.vitrine.indexOf(v));
        itens.push({ c, x: v.x - 0.19, y: v.y, z: v.z + 0.05, yaw: -0.38, e: 0.92 }, { c, x: v.x + 0.18, y: v.y, z: v.z - 0.05, yaw: -0.16, e: 0.92 });
      }
      R.grupo.add(malhaChuteiras(itens));
      const T = D.destaque; if (!T) return;
      const top = CHS()[lista[lista.length - 1]], gir = new THREE.Group(); gir.position.set(T.x, T.y + 0.08, T.z);
      const m = malhaChuteiras([{ c: top, x: 0, y: 0, z: 0, yaw: 0, e: 1.15 }]); m.position.set(0, 0, 0); gir.add(m); R.grupo.add(gir); M.destaque = gir;
      const vidro = new THREE.Mesh(api.guardar(new THREE.BoxGeometry(0.66, 0.56, 0.5)), api.guardar(new THREE.MeshLambertMaterial({ color: 0xcfe8ff, transparent: true, opacity: 0.16, depthWrite: false })));
      vidro.position.set(T.x, T.y + 0.28, T.z); R.grupo.add(vidro);
    }
    // PROVAR: o boneco do jogador é refeito com a chuteira (e gira devagar no provador); desprovar volta ao normal
    function provar(i) {
      if (M.provando === i) return; M.provando = i;
      try { api.refazerJogador({ chuteira: i }); } catch (e) { console.warn('[Esportiva] provar:', e); }
      try { api.som && api.som('pop'); } catch (e) { /* sem som */ }
    }
    function desprovar() { if (M.provando == null) return; M.provando = null; try { api.refazerJogador(); } catch (e) { console.warn('[Esportiva] desprovar:', e); } }
    function camProvar() { const P = M.D.provar; api.camCena({ px: P.x + 1.25, py: 1.55, pz: P.z + 2.9, tx: P.x + 0.62, ty: 0.55, tz: P.z }); }   // de frente, um pouco de cima: o jogador inteiro à esquerda do painel, os pés em destaque
    function abrirPainelCh() {
      return new Promise((fim) => {
        const d = S().dados, D = dadosCh();
        const el = document.createElement('div'); el.id = 'espChuteiras';
        el.style.cssText = 'position:fixed;z-index:22;right:8px;top:8px;bottom:8px;width:min(350px,48vw);background:#101a3c;border:4px solid ' + AMAR + ';color:#f4f0e6;display:flex;flex-direction:column;font-family:var(--font-body);box-shadow:-6px 6px 0 #0008;';
        const cab = document.createElement('div'); cab.style.cssText = 'padding:8px 10px;background:' + AZUL + ';border-bottom:3px solid ' + AMAR + ';display:flex;flex-direction:column;gap:3px;';
        const tit = document.createElement('div'); tit.style.cssText = 'font:700 14px/1.1 var(--font-display);letter-spacing:.08em;color:' + AMAR + ';'; tit.textContent = Tx('CHUTEIRAS');
        const inf = document.createElement('div'); inf.style.cssText = 'font:600 11.5px/1.35 var(--font-body);white-space:pre-line;';
        cab.append(tit, inf);
        const lista = document.createElement('div'); lista.style.cssText = 'flex:1;overflow:auto;padding:6px;display:flex;flex-direction:column;gap:5px;';
        const pe = document.createElement('div'); pe.style.cssText = 'padding:6px 8px;border-top:3px solid ' + AMAR + ';display:flex;flex-direction:column;gap:5px;align-items:stretch;';
        const nota = document.createElement('div'); nota.style.cssText = 'font:600 10.5px/1.3 var(--font-body);color:#c8d0ea;'; nota.textContent = Tx('Clique em PROVAR para ver a chuteira no seu pé. Ela gira sozinha.') + ' ' + Tx('O que está na sacola você paga no caixa, com a Marta.');
        const fechar = document.createElement('button'); fechar.type = 'button'; fechar.className = 'pxBtn'; fechar.textContent = Tx('FECHAR'); fechar.style.cssText = '--p:var(--p2,2px);height:38px;font-size:12px;';
        pe.append(nota, fechar);
        const bt = (txt, cor, fn, on) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = txt; b.style.cssText = 'flex:1;min-width:0;height:28px;border:2px solid ' + (on ? '#fff' : '#0b1430') + ';background:' + cor + ';color:' + (cor === AMAR ? '#101a3c' : '#fff') + ';font:700 10px/1 var(--font-display);letter-spacing:.03em;cursor:pointer;padding:0 4px;'; b.onclick = fn; return b; };
        const amostra = (c) => { const cv = document.createElement('canvas'); cv.width = 16; cv.height = 16; cv.style.cssText = 'width:32px;height:32px;image-rendering:pixelated;border:2px solid #0b1430;flex:none;'; try { pintarChuteira(cv.getContext('2d'), 0, 0, c); } catch (e) { /* nada */ } return cv; };
        const NIV = typeof NIVEIS_CHUTEIRA !== 'undefined' ? NIVEIS_CHUTEIRA : [];
        function linha(i, rotulo) {
          const c = CHS()[i], loja = !!c.loja, meu = !loja || D.tem.includes(c.nome), k = 'ch:' + c.nome, naSac = M.sacola.includes(k), noPe = usandoIdx() === i, vendo = M.provando === i;
          const lin = document.createElement('div'); lin.dataset.k = loja ? c.nome : '_sempre';
          lin.style.cssText = 'background:' + (vendo ? '#2a3a7a' : '#1a2650') + ';border:2px solid ' + (noPe ? '#3fb76a' : naSac ? AMAR : meu ? '#2f7a55' : '#2a3a7a') + ';padding:5px 6px;display:flex;gap:7px;align-items:center;';
          const dir = document.createElement('div'); dir.style.cssText = 'flex:1;min-width:0;display:flex;flex-direction:column;gap:4px;';
          const top = document.createElement('div'); top.style.cssText = 'display:flex;justify-content:space-between;align-items:center;gap:6px;';
          const n = document.createElement('span'); n.style.cssText = 'font:700 12.5px/1.1 var(--font-display);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'; n.textContent = rotulo || Tx(c.nome);
          const tag = document.createElement('span'); tag.style.cssText = 'font:700 10px/1 var(--font-display);padding:3px 5px;white-space:nowrap;background:' + (noPe ? '#1f7a4d' : meu ? '#2f5a45' : naSac ? '#8a6a10' : '#0b1430') + ';color:' + (meu || naSac ? '#fff' : AMAR) + ';';
          tag.textContent = noPe ? Tx('NO PÉ') : !loja ? Tx('A de sempre') : meu ? Tx('É sua') : naSac ? Tx('Na sacola') : Tfx('{0} fakes', c.preco);
          top.append(n, tag);
          const bs = document.createElement('div'); bs.style.cssText = 'display:flex;gap:4px;';
          bs.appendChild(bt(vendo ? Tx('Provando') : Tx('PROVAR'), '#3a64b8', () => { provar(i); render(); }, vendo));
          if (meu) bs.appendChild(bt(noPe ? Tx('NO PÉ') : Tx('CALÇAR'), noPe ? '#1f7a4d' : '#2a3a7a', () => { if (!noPe) { calcar(loja ? c.nome : null); api.gravar(d.ponto || 'chegada'); try { api.som && api.som('pop'); } catch (e) { /* nada */ } render(); } }, noPe));
          else if (naSac) bs.appendChild(bt(Tx('TIRAR'), '#a3162a', () => { M.sacola = M.sacola.filter((q) => q !== k); render(); }));
          else bs.appendChild(bt(Tx('LEVAR'), AMAR, () => { M.sacola.push(k); try { api.som && api.som('pop'); } catch (e) { /* nada */ } render(); }));
          dir.append(top, bs); lin.append(amostra(c), dir); return lin;
        }
        function render() {
          const ui = usandoIdx();
          inf.textContent = Tfx('Você tem {0} fakes', d.fakes) + '\n' + (M.sacola.length ? Tfx('Sacola: {0} ({1} fakes)', M.sacola.length, totalSacola()) : Tx('Sacola vazia')) + '\n' + Tfx('Calçando: {0}', Tx(CHS()[ui] ? CHS()[ui].nome : ''));
          const rolagem = lista.scrollTop; lista.innerHTML = '';
          lista.appendChild(linha(chOriginal(), Tx(CHS()[chOriginal()].nome)));
          let nv = 0;
          for (const i of lojaCh()) {
            const c = CHS()[i];
            if (c.nivel !== nv) {                                       // o título de cada nível, na cor dele
              nv = c.nivel; const h = document.createElement('div'), N = NIV[nv] || { nome: '', cor: '#ffffff' };
              h.style.cssText = 'margin-top:4px;padding:3px 6px;font:700 11px/1 var(--font-display);letter-spacing:.1em;color:#101a3c;background:' + N.cor + ';'; h.textContent = Tx(N.nome).toUpperCase(); lista.appendChild(h);
            }
            lista.appendChild(linha(i));
          }
          lista.scrollTop = rolagem;
        }
        fechar.onclick = () => { el.remove(); M.painel = null; fim(); };
        el.append(cab, lista, pe); (document.getElementById('raizJogo') || document.body).appendChild(el);
        M.painel = { el, render }; render();
      });
    }
    async function catalogoCh() {
      const s = S(), J = s.jog, d = s.dados, E = dadosE(), A = M.eq.biro; if (!A || M.painel) return;
      s.modo = 'cena'; api.UI().ctl.hidden = true; api.aviso(''); A.falando = true;
      const y0 = A.yawAlvo; A.yawAlvo = Math.atan2(-(J.z - A.z), J.x - A.x);
      try {
        if (!E.biro) {
          await api.fala('esp_biro', Tx('Chuteira boa é meio gol! Aqui é a linha premium: 20 modelos, do Pro ao Ícone.'));
          await api.fala('esp_biro', Tfx('Quanto mais para a direita da parede, mais exclusiva (e mais cara). A mais barata sai por {0} fakes.', Math.min(...lojaCh().map((i) => CHS()[i].preco))));
          await api.fala('esp_biro', Tx('Pode provar à vontade aqui no espelho. O que gostar vai para a sacola e você paga com a Marta.'));
          E.biro = true; api.gravar(d.ponto || 'chegada');
        } else await api.fala('esp_biro', Tx(pk(['Chegou chuteira nova na parede! Bora provar?', 'Qual vai ser hoje, craque?'])));
        Dialogo.esconder();
        const P = M.D.provar; await andarJog(P.x, P.z, 2.2); J.yaw = J.yawAlvo = -Math.PI / 2 + 0.5;
        A.yawAlvo = Math.atan2(-(J.z - A.z), J.x - A.x);
        camProvar(); provar(usandoIdx());
        const n0 = M.sacola.filter(ehCh).length;
        await abrirPainelCh();
        desprovar(); api.camCena(null);
        A.yawAlvo = Math.atan2(-(J.z - A.z), J.x - A.x);
        await api.fala('esp_biro', M.sacola.filter(ehCh).length > n0 ? Tx('Boa! Passa no caixa que a Marta embrulha.') : Tx('Volta quando quiser, a parede está sempre cheia.'));
      } catch (e) { console.error('[Esportiva] chuteiras:', e); }
      finally {
        A.falando = false; A.yawAlvo = y0; if (M.painel) { M.painel.el.remove(); M.painel = null; } desprovar(); api.camCena(null);
        try { Dialogo.esconder(); } catch (e) { /* nada */ }
        const ss = S(); if (ss && ss.ativo && ss.modo === 'cena') api.liberar();
      }
    }
    // ---------------------------------------------------------------- AS BOLAS (o Juca): mostruário em cima da pirâmide e o catálogo à direita
    const desenhoBola = (nome) => (typeof FutebolCosmeticos !== 'undefined' && FutebolCosmeticos.dados ? (FutebolCosmeticos.dados.bolas || []).find((b) => b.nome === nome) : null);
    const VITRINE = { x: -6.3, y: 1.62, z: 5.0, jx: -4.75, jz: 4.55 };     // a bola girando em cima da pirâmide e onde o jogador fica para ver
    const geoVitrine = {};
    // a bola do mostruário: a mesma malha alta da bola da loja (IcosahedronGeometry, a ordem dos triângulos do cosmeticos.js), maior
    function mostrarBola(nome) {
      const D = desenhoBola(nome); tirarVitrine(); if (!M.R) return;
      let geo, cores;
      if (D) {
        const d = Math.round(Math.sqrt(D.tri.length / 20)) - 1;
        if (!geoVitrine[d]) { const g0 = new THREE.IcosahedronGeometry(CONFIG.BALL_R, d), g = g0.index ? g0.toNonIndexed() : g0; g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 3), 3)); geoVitrine[d] = g; }
        geo = geoVitrine[d].clone(); cores = geo.attributes.color;
        const pal = D.paleta.map((h) => { const v = parseInt(h.slice(1), 16); return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255]; });
        for (let t = 0; t < D.tri.length; t++) { const c = pal[parseInt(D.tri[t], 36)] || pal[0]; for (let k = 0; k < 3; k++) cores.array.set(c, (t * 3 + k) * 3); }
      } else geo = BALL_GEO.clone();                                     // a bola padrão (a de estrelas)
      const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true }));
      m.scale.setScalar(1.8); m.position.set(VITRINE.x, VITRINE.y, VITRINE.z); m.userData.y = VITRINE.y; m.rotation.x = 0.35;
      M.R.grupo.add(m); M.vitrine = m; M.vitrineNome = nome || null;
    }
    function tirarVitrine() { const m = M.vitrine; if (!m) return; if (m.parent) m.parent.remove(m); m.geometry.dispose(); m.material.dispose(); M.vitrine = null; M.vitrineNome = undefined; }
    function abrirPainelBolas() {
      return new Promise((fim) => {
        const d = S().dados, Bd = dadosB();
        const el = document.createElement('div'); el.id = 'espBolas';
        el.style.cssText = 'position:fixed;z-index:22;right:8px;top:8px;bottom:8px;width:min(350px,48vw);background:#0d2a2a;border:4px solid ' + AMAR + ';color:#f4f0e6;display:flex;flex-direction:column;font-family:var(--font-body);box-shadow:0 6px 0 rgba(0,0,0,.35);';
        const cab = document.createElement('div'); cab.style.cssText = 'padding:8px 10px;background:#1f8a7a;border-bottom:3px solid ' + AMAR + ';display:flex;flex-direction:column;gap:3px;';
        const tit = document.createElement('div'); tit.style.cssText = 'font:700 14px/1.1 var(--font-display);letter-spacing:.08em;color:' + AMAR + ';'; tit.textContent = Tx('BOLAS');
        const inf = document.createElement('div'); inf.style.cssText = 'font:600 11.5px/1.35 var(--font-body);white-space:pre-line;';
        cab.append(tit, inf);
        const lista = document.createElement('div'); lista.style.cssText = 'flex:1;overflow:auto;padding:6px;display:flex;flex-direction:column;gap:5px;';
        const pe = document.createElement('div'); pe.style.cssText = 'padding:5px 8px;border-top:3px solid ' + AMAR + ';display:flex;gap:8px;align-items:center;';
        const nota = document.createElement('div'); nota.style.cssText = 'flex:1;font:600 10.5px/1.25 var(--font-body);color:#c8e6e0;'; nota.textContent = Tx('O que está na sacola você paga no caixa, com a Marta.');
        const fechar = document.createElement('button'); fechar.type = 'button'; fechar.className = 'pxBtn'; fechar.textContent = Tx('FECHAR'); fechar.style.cssText = '--p:var(--p2,2px);height:34px;font-size:12px;padding:0 14px;flex:none;width:auto;min-width:0;';
        pe.append(nota, fechar);
        const bt = (txt, cor, fn, on) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = txt; b.style.cssText = 'flex:1;min-width:0;height:28px;border:2px solid ' + (on ? '#fff' : '#0b1430') + ';background:' + cor + ';color:' + (cor === AMAR ? '#1a1406' : '#fff') + ';font:700 11px/1 var(--font-display);cursor:pointer;'; b.onclick = (e) => { e.stopPropagation(); fn(); }; return b; };
        function render() {
          const usando = Bd.usando && desenhoBola(Bd.usando) ? Bd.usando : null;
          inf.textContent = Tfx('Você tem {0} fakes', d.fakes) + '\n' + (M.sacola.length ? Tfx('Sacola: {0} ({1} fakes)', M.sacola.length, totalSacola()) : Tx('Sacola vazia')) + '\n' + Tfx('Bola nas partidas: {0}', usando ? Tx(usando) : Tx('Bola padrão'));
          const rolagem = lista.scrollTop; lista.innerHTML = '';
          const itens = [{ nome: null, preco: 0, txt: 'A bola de estrelas de sempre.' }].concat(BOLAS.filter((b) => desenhoBola(b.nome)));
          for (const b of itens) {
            const meu = !b.nome || Bd.tem.includes(b.nome), naSac = b.nome && M.sacola.includes('bola:' + b.nome), emUso = (b.nome || null) === usando, vendo = M.vitrineNome === (b.nome || null);
            const lin = document.createElement('div'); lin.className = 'espBola'; lin.style.cssText = 'background:' + (vendo ? '#1f5a52' : '#143c3a') + ';border:2px solid ' + (emUso ? '#7df0a0' : meu ? '#3fb76a' : naSac ? AMAR : '#1f5a52') + ';padding:5px 6px;display:flex;flex-direction:column;gap:4px;cursor:pointer;';
            lin.onclick = () => { mostrarBola(b.nome); render(); };
            const top = document.createElement('div'); top.style.cssText = 'display:flex;justify-content:space-between;align-items:center;gap:6px;';
            const n = document.createElement('span'); n.style.cssText = 'font:700 12.5px/1.1 var(--font-display);'; n.textContent = b.nome ? Tx(b.nome) : Tx('Bola padrão');
            const tag = document.createElement('span'); tag.style.cssText = 'font:700 10px/1 var(--font-display);padding:3px 5px;white-space:nowrap;background:' + (emUso ? '#1f7a4d' : meu ? '#155a3a' : naSac ? '#8a6a10' : '#0b1430') + ';color:' + (meu || naSac ? '#fff' : AMAR) + ';';
            tag.textContent = emUso ? Tx('Em uso') : !b.nome ? Tx('De graça') : meu ? Tx('É sua') : naSac ? Tx('Na sacola') : Tfx('{0} fakes', b.preco);
            top.append(n, tag);
            const sub = document.createElement('div'); sub.style.cssText = 'font:500 10.5px/1.25 var(--font-body);color:#c8e6e0;'; sub.textContent = Tx(b.txt);
            const bs = document.createElement('div'); bs.style.cssText = 'display:flex;gap:4px;';
            bs.appendChild(bt(Tx('OLHAR'), '#3a8ab8', () => { mostrarBola(b.nome); render(); }, vendo));
            if (meu) bs.appendChild(bt(emUso ? Tx('Em uso') : Tx('USAR'), emUso ? '#1f7a4d' : '#2a5a7a', () => { Bd.usando = b.nome || null; mostrarBola(b.nome); api.gravar(d.ponto || 'chegada'); try { api.som && api.som('pop'); } catch (e) { /* nada */ } render(); }, emUso));
            else if (naSac) bs.appendChild(bt(Tx('TIRAR'), '#a3162a', () => { M.sacola = M.sacola.filter((q) => q !== 'bola:' + b.nome); render(); }));
            else bs.appendChild(bt(Tx('LEVAR'), AMAR, () => { M.sacola.push('bola:' + b.nome); mostrarBola(b.nome); try { api.som && api.som('pop'); } catch (e) { /* nada */ } render(); }));
            lin.append(top, sub, bs); lista.appendChild(lin);
          }
          lista.scrollTop = rolagem;
        }
        fechar.onclick = () => { el.remove(); M.painel = null; fim(); };
        el.append(cab, lista, pe); (document.getElementById('raizJogo') || document.body).appendChild(el);
        M.painel = { el, render }; render();
      });
    }
    async function catalogoBolas() {
      const s = S(), J = s.jog, d = s.dados, E = dadosE(), A = M.eq.juca; if (!A || M.painel) return;
      s.modo = 'cena'; api.UI().ctl.hidden = true; api.aviso(''); A.falando = true;
      const y0 = A.yawAlvo; A.yawAlvo = Math.atan2(-(J.z - A.z), J.x - A.x);
      try {
        if (!E.juca) {
          await api.fala('esp_juca', Tx('Fala, craque! Aqui ficam as bolas premium da Golaço.'));
          await api.fala('esp_juca', Tx('Tem de todo jeito, até umas inspiradas nas bolas da Copa.'));
          await api.fala('esp_juca', Tx('Dá para ver cada uma de pertinho. O que você escolher, a Marta cobra no caixa.'));
          E.juca = true; api.gravar(d.ponto || 'chegada');
        } else await api.fala('esp_juca', Tx('Bora ver as bolas? Chegou coisa boa.'));
        Dialogo.esconder();
        await andarJog(VITRINE.jx, VITRINE.jz, 2.2); J.yawAlvo = Math.atan2(-(VITRINE.z - J.z), VITRINE.x - J.x);
        const Bd = dadosB(); mostrarBola(Bd.usando && desenhoBola(Bd.usando) ? Bd.usando : BOLAS[0].nome);
        api.camCena({ px: VITRINE.x + 1.5, py: VITRINE.y + 0.45, pz: VITRINE.z + 1.2, tx: VITRINE.x + 0.28, ty: VITRINE.y - 0.1, tz: VITRINE.z - 0.4 });   // de perto; a bola fica à esquerda (o painel ocupa a direita)
        const n0 = M.sacola.filter(ehBola).length;
        await abrirPainelBolas();
        tirarVitrine(); api.camCena(null); s.cam.snap = true;
        A.yawAlvo = Math.atan2(-(J.z - A.z), J.x - A.x);
        await api.fala('esp_juca', M.sacola.filter(ehBola).length > n0 ? Tx('Boa escolha! Passa no caixa que a Marta fecha a conta.') : Tx('Volta quando quiser trocar de bola!'));
      } catch (e) { console.error('[Esportiva] bolas:', e); }
      finally {
        A.falando = false; A.yawAlvo = y0; if (M.painel) { M.painel.el.remove(); M.painel = null; } tirarVitrine();
        try { api.camCena(null); s.cam.snap = true; Dialogo.esconder(); } catch (e) { /* nada */ }
        const ss = S(); if (ss && ss.ativo && ss.modo === 'cena') api.liberar();
      }
    }
    // ---------------------------------------------------------------- (7.1.12) AS ROUPAS: os manequins, o provador e o catálogo da Kelly
    function montarManequins(R) {
      const RR = RPS(), D = M.D; if (!RR || !D.manequins) return;
      const L = lojaRp(); if (!L.length) return; const dia = (S().dados.dia | 0);
      D.manequins.forEach((P, k) => {
        try {
          const Rp = listaRp()[L[(dia * 2 + k * 7) % L.length]];
          const base = { pele: '#e8e2d6', cabelo: '#e8e2d6', estilo: 0, rosto: 0, labio: 3, corBarba: '#e8e2d6', barba: 0, cabecao: 1, escala: 1 };
          const m = RR.vestirModelo(base, Rp, RR.c4(Rp.c)).m;
          m.troncoInteiro.visible = false; m.troncoSemCabeca.visible = true; if (m.cabeca) m.cabeca.visible = false;   // sem cabeça: é manequim
          m.raiz.position.set(P.x, P.y, P.z); m.raiz.rotation.y = P.yaw; m.raiz.visible = true; m.bracoE.rotation.x = 0.12; m.bracoD.rotation.x = -0.12;
          R.grupo.add(m.raiz); M.manequins.push(m); S().meus.add(m);   // (só aparece quem está em S.meus)
        } catch (e) { console.warn('[Esportiva] manequim:', e); }
      });
    }
    function provarRp(i) {
      if (M.provandoRp === i) return; M.provandoRp = i; const R = listaRp()[i];
      try { api.refazerJogador({ roupa: { id: i, cores: RPS().c4(R.c) } }); } catch (e) { console.warn('[Esportiva] provar roupa:', e); }
      try { api.som && api.som('pop'); } catch (e) { /* sem som */ }
    }
    function desprovarRp() { if (M.provandoRp == null) return; M.provandoRp = null; try { api.refazerJogador(); } catch (e) { console.warn('[Esportiva] desprovar roupa:', e); } }
    function camProvarRp() { const P = M.D.provarRoupa; api.camCena({ px: P.x + 0.3, py: 2.1, pz: P.z + 4.3, tx: P.x + 0.95, ty: 0.95, tz: P.z }); }   // de frente, de longe: o corpo inteiro à esquerda do painel
    function abrirPainelRp() {
      return new Promise((fim) => {
        const d = S().dados, RR = RPS();
        const el = document.createElement('div'); el.id = 'espRoupas';
        el.style.cssText = 'position:fixed;z-index:22;right:8px;top:8px;bottom:8px;width:min(350px,48vw);background:#101a3c;border:4px solid ' + AMAR + ';color:#f4f0e6;display:flex;flex-direction:column;font-family:var(--font-body);box-shadow:-6px 6px 0 #0008;';
        const cab = document.createElement('div'); cab.style.cssText = 'padding:8px 10px;background:' + AZUL + ';border-bottom:3px solid ' + AMAR + ';display:flex;flex-direction:column;gap:3px;';
        const tit = document.createElement('div'); tit.style.cssText = 'font:700 14px/1.1 var(--font-display);letter-spacing:.08em;color:' + AMAR + ';'; tit.textContent = Tx('ROUPAS');
        const inf = document.createElement('div'); inf.style.cssText = 'font:600 11.5px/1.35 var(--font-body);white-space:pre-line;';
        cab.append(tit, inf);
        const lista = document.createElement('div'); lista.style.cssText = 'flex:1;overflow:auto;padding:6px;display:flex;flex-direction:column;gap:5px;';
        const pe = document.createElement('div'); pe.style.cssText = 'padding:6px 8px;border-top:3px solid ' + AMAR + ';display:flex;flex-direction:column;gap:5px;align-items:stretch;';
        const nota = document.createElement('div'); nota.style.cssText = 'font:600 10.5px/1.3 var(--font-body);color:#c8d0ea;'; nota.textContent = (fem() ? Tx('Clique em PROVAR para ver a roupa em você. Você gira sozinha.') : Tx('Clique em PROVAR para ver a roupa em você. Você gira sozinho.')) + ' ' + Tx('O que está na sacola você paga no caixa, com a Marta.');
        const fechar = document.createElement('button'); fechar.type = 'button'; fechar.className = 'pxBtn'; fechar.textContent = Tx('FECHAR'); fechar.style.cssText = '--p:var(--p2,2px);height:38px;font-size:12px;';
        pe.append(nota, fechar);
        const bt = (txt, cor, fn, on) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = txt; b.style.cssText = 'flex:1;min-width:0;height:28px;border:2px solid ' + (on ? '#fff' : '#0b1430') + ';background:' + cor + ';color:' + (cor === AMAR ? '#101a3c' : '#fff') + ';font:700 10px/1 var(--font-display);letter-spacing:.03em;cursor:pointer;padding:0 4px;'; b.onclick = fn; return b; };
        const amostra = (R) => { const cv = document.createElement('canvas'); cv.width = 32; cv.height = 32; cv.style.cssText = 'width:40px;height:40px;image-rendering:pixelated;border:2px solid #0b1430;flex:none;'; try { RR.amostraRoupa(cv, R); } catch (e) { /* nada */ } return cv; };
        function render() {
          const minhas = minhasRp(), vi = vestindoRp(), L = listaRp();
          inf.textContent = Tfx('Você tem {0} fakes', d.fakes) + '\n' + (M.sacola.length ? Tfx('Sacola: {0} ({1} fakes)', M.sacola.length, totalSacola()) : Tx('Sacola vazia')) + '\n' + Tfx('Vestindo: {0}', Tx((L[vi >= 0 && L[vi] ? vi : 0] || { n: '' }).n));
          const rolagem = lista.scrollTop; lista.innerHTML = '';
          for (const i of lojaRp()) {
            const R = L[i], meu = minhas.includes(R.n), k = 'rp:' + R.n, naSac = M.sacola.includes(k), noCorpo = vi === i, vendo = M.provandoRp === i;
            const lin = document.createElement('div'); lin.dataset.k = R.n;
            lin.style.cssText = 'background:' + (vendo ? '#2a3a7a' : '#1a2650') + ';border:2px solid ' + (noCorpo ? '#3fb76a' : naSac ? AMAR : meu ? '#2f7a55' : '#2a3a7a') + ';padding:5px 6px;display:flex;gap:7px;align-items:center;';
            const dir = document.createElement('div'); dir.style.cssText = 'flex:1;min-width:0;display:flex;flex-direction:column;gap:4px;';
            const top = document.createElement('div'); top.style.cssText = 'display:flex;justify-content:space-between;align-items:center;gap:6px;';
            const n = document.createElement('span'); n.style.cssText = 'font:700 12px/1.1 var(--font-display);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'; n.textContent = Tx(R.n);
            const tag = document.createElement('span'); tag.style.cssText = 'font:700 10px/1 var(--font-display);padding:3px 5px;white-space:nowrap;background:' + (noCorpo ? '#1f7a4d' : meu ? '#2f5a45' : naSac ? '#8a6a10' : '#0b1430') + ';color:' + (meu || naSac ? '#fff' : AMAR) + ';';
            tag.textContent = noCorpo ? Tx('VESTINDO') : meu ? Tx('É sua') : naSac ? Tx('Na sacola') : Tfx('{0} fakes', R.preco);
            top.append(n, tag);
            const bs = document.createElement('div'); bs.style.cssText = 'display:flex;gap:4px;';
            bs.appendChild(bt(vendo ? Tx('Provando') : Tx('PROVAR'), '#3a64b8', () => { provarRp(i); render(); }, vendo));
            if (meu) bs.appendChild(bt(noCorpo ? Tx('VESTINDO') : Tx('VESTIR'), noCorpo ? '#1f7a4d' : '#2a3a7a', () => { if (!noCorpo) { vestirRp(R.n); api.gravar(d.ponto || 'chegada'); try { api.som && api.som('pop'); } catch (e) { /* nada */ } render(); } }, noCorpo));
            else if (naSac) bs.appendChild(bt(Tx('TIRAR'), '#a3162a', () => { M.sacola = M.sacola.filter((q) => q !== k); render(); }));
            else bs.appendChild(bt(Tx('LEVAR'), AMAR, () => { M.sacola.push(k); try { api.som && api.som('pop'); } catch (e) { /* nada */ } render(); }));
            dir.append(top, bs); lin.append(amostra(R), dir); lista.appendChild(lin);
          }
          lista.scrollTop = rolagem;
        }
        fechar.onclick = () => { el.remove(); M.painel = null; fim(); };
        el.append(cab, lista, pe); (document.getElementById('raizJogo') || document.body).appendChild(el);
        M.painel = { el, render }; render();
      });
    }
    async function catalogoRp() {
      const s = S(), J = s.jog, d = s.dados, E = dadosE(), A = M.eq.kelly; if (!A || M.painel || !RPS()) return;
      s.modo = 'cena'; api.UI().ctl.hidden = true; api.aviso(''); A.falando = true;
      const y0 = A.yawAlvo; A.yawAlvo = Math.atan2(-(J.z - A.z), J.x - A.x);
      try {
        if (!E.kelly) {
          await api.fala('esp_kelly', Tx('Oi! Aqui é a moda da Golaço: 25 peças que você não acha em outro lugar.'));
          await api.fala('esp_kelly', Tx('Estampa, listra, xadrez, tie-dye... cada uma com o seu estilo. Prova aqui mesmo, sem compromisso.'));
          await api.fala('esp_kelly', Tx('O que você comprar já sai vestido e vai para o guarda-roupa de casa. Paga com a Marta.'));
          E.kelly = true; api.gravar(d.ponto || 'chegada');
        } else await api.fala('esp_kelly', Tx(pk(['Chegou peça nova! Quer provar?', 'Vamos montar esse visual?'])));
        Dialogo.esconder();
        const P = M.D.provarRoupa; await andarJog(P.x, P.z, 2.2); J.yaw = J.yawAlvo = -Math.PI / 2 + 0.4;
        A.yawAlvo = Math.atan2(-(J.z - A.z), J.x - A.x);
        camProvarRp();
        const n0 = M.sacola.filter(ehRp).length;
        await abrirPainelRp();
        desprovarRp(); api.camCena(null);
        A.yawAlvo = Math.atan2(-(J.z - A.z), J.x - A.x);
        await api.fala('esp_kelly', M.sacola.filter(ehRp).length > n0 ? Tx('Ficou ótimo! Passa no caixa com a Marta.') : Tx('Volta sempre, toda semana tem novidade.'));
      } catch (e) { console.error('[Esportiva] roupas:', e); }
      finally {
        A.falando = false; A.yawAlvo = y0; if (M.painel) { M.painel.el.remove(); M.painel = null; } desprovarRp(); api.camCena(null);
        try { Dialogo.esconder(); } catch (e) { /* nada */ }
        const ss = S(); if (ss && ss.ativo && ss.modo === 'cena') api.liberar();
      }
    }
    // ---------------------------------------------------------------- OS ACESSÓRIOS (a Tati): brincos, colares, luvas e as tatuagens
    //   (os desenhos e as peças ficam no jogo.js: ACESSORIOS, TATUAGENS, METAIS). PROVAR refaz o jogador com aparencia.enfeites de prova,
    //   ali na frente do painel da parede (ele gira devagar); o tom do metal vale para o tipo inteiro (o que está em uso muda junto).
    const temAc = () => typeof ACESSORIOS !== 'undefined' && typeof TATUAGENS !== 'undefined';
    const SIGLA = { brinco: 'b', colar: 'c', luva: 'l' }, ABAS_AC = [['brinco', 'BRINCOS'], ['colar', 'COLARES'], ['luva', 'LUVAS'], ['tat', 'TATUAGENS']];
    const ROT_LUGAR = { bd: 'BRAÇO D', be: 'BRAÇO E', pd: 'PERNA D', pe: 'PERNA E' };
    const PROV_AC = { x: 9.1, z: 6.4 };                                  // na frente do painel da parede leste (luvas, bonés, garrafas)
    const dadosA = () => {
      const d = S().dados; if (!d.acessorios || !Array.isArray(d.acessorios.tem)) d.acessorios = { tem: [], tats: [], uso: {}, metal: {}, t: {} };
      const A = d.acessorios; if (!A.uso) A.uso = {}; if (!A.metal) A.metal = {}; if (!A.t) A.t = {}; if (!Array.isArray(A.tats)) A.tats = []; return A;
    };
    const metalDe = (tipo) => { const m = dadosA().metal[SIGLA[tipo]]; return m && METAL_POR_K[m] ? m : 'ouro'; };
    // o que está em uso (dados da cidade) no formato da aparência
    function enfeitesDe(DA) {
      const E = {}, t = {};
      for (const tipo of Object.keys(SIGLA)) { const k = DA.uso[SIGLA[tipo]]; if (k && ACESSORIO_POR_K[k]) E[SIGLA[tipo]] = [k, metalDe(tipo)]; }
      for (const L of LUGARES_TATUAGEM) if (DA.t[L.k] && TATUAGEM_POR_K[DA.t[L.k]]) t[L.k] = DA.t[L.k];
      if (Object.keys(t).length) E.t = t;
      return Object.keys(E).length ? E : null;
    }
    function sincronizarEnfeites() { if (!temAc()) return; try { const e = enfeitesDe(dadosA()), ap = apar(); if (e) ap.enfeites = e; else delete ap.enfeites; } catch (e) { /* sem dados ainda */ } }
    const ehAc = (k) => String(k).startsWith('ac:'), ehTat = (k) => String(k).startsWith('tat:');
    const copiaEnf = (e) => JSON.parse(JSON.stringify(e || {}));
    // enquanto prova, ninguém para entre a câmera e o jogador (os pontos de olhar da seção ficam bem ali)
    function noCorredorAc(p) { return !!M.provAc && p[0] > PROV_AC.x - 3.2 && p[0] < PROV_AC.x + 0.6 && Math.abs(p[1] - PROV_AC.z) < 1.0; }
    function provarAc(enf) {
      const novo = !M.provAc; M.provAc = copiaEnf(enf);
      if (novo) for (const q of M.gente) { const E = q.es; if (E && E.fase !== 'sai' && E.i >= 0 && noCorredorAc(M.D.olhar[E.i])) { E.fase = 'olha'; E.t = (E.dur || 0) + 1; q.poseFn = null; } }
      try { api.refazerJogador({ enfeites: M.provAc }); } catch (e) { console.warn('[Esportiva] provar acessório:', e); }
      try { api.som && api.som('pop'); } catch (e) { /* sem som */ }
    }
    function desprovarAc() { if (!M.provAc) return; M.provAc = null; try { api.refazerJogador(); } catch (e) { console.warn('[Esportiva] desprovar acessório:', e); } }
    // a câmera do provador: de frente para o jogador (a oeste dele), ele à esquerda do painel. Brinco e colar: de perto; o resto: o corpo todo
    function camAc(aba) {
      const P = PROV_AC, perto = aba === 'brinco' || aba === 'colar', D = perto ? 1.9 : 2.6;
      api.camCena({ px: P.x - D, py: perto ? 1.55 : 1.3, pz: P.z + 0.08, tx: P.x, ty: perto ? 1.28 : 0.88, tz: P.z + (perto ? 0.55 : 0.74) });
    }
    // a roupa de agora cobre o lugar da tatuagem? (manga comprida no braço, calça na perna: aí ela não aparece)
    function cobertoAc(lug) {
      try { const J = S().jog, m = J.m, n = parseInt(String(J.opt.pele).slice(1), 16), lado = lug[1] === 'd' ? 'D' : 'E';
        const malha = lug[0] === 'p' ? m['perna' + lado].inteira : m['braco' + lado].inteira, a = malha.geometry.attributes.color.array, j = (lug[0] === 'p' ? 0 : 24) * 3;
        return Math.abs(a[j] - ((n >> 16) & 255) / 255) > 0.02 || Math.abs(a[j + 1] - ((n >> 8) & 255) / 255) > 0.02 || Math.abs(a[j + 2] - (n & 255) / 255) > 0.02;
      } catch (e) { return false; }
    }
    // o ícone de cada peça (16x16, na cor do metal) e da tatuagem (o próprio desenho)
    function iconeAc(A, cor) {
      const cv = document.createElement('canvas'); cv.width = 16; cv.height = 16; cv.style.cssText = 'width:32px;height:32px;image-rendering:pixelated;border:2px solid #0b1430;background:#e9d6c2;flex:none;';
      const g = cv.getContext('2d'), p = (x, y, w, h, c) => { g.fillStyle = c || cor; g.fillRect(x, y, w, h); };
      if (A.tipo === 'brinco') {
        if (A.k === 'ponto_luz') { p(6, 6, 4, 4); p(7, 7, 1, 1, '#ffffff'); }
        else if (A.k === 'gota') { p(7, 2, 2, 2); p(7.5, 4, 1, 3); p(6, 7, 4, 5); p(7, 12, 2, 2); }
        else if (A.k === 'cruz_b') { p(7, 2, 2, 2); p(7, 5, 2, 9); p(5, 7, 6, 2); }
        else { const L = A.k === 'argola_p' ? 7 : 11, o = (16 - L) / 2; p(o, o, L, 2); p(o, o + L - 2, L, 2); p(o, o, 2, L); p(o + L - 2, o, 2, L); }
      } else if (A.tipo === 'colar') {
        const t = A.k === 'corrente_grossa' ? 2 : 1; for (let i = 0; i < 6; i++) { p(2 + i, 2 + i, t, t); p(13 - i, 2 + i, t, t); }
        if (A.k === 'pingente_bola') { p(6, 9, 4, 4, '#f2f2ee'); p(7, 10, 2, 2, '#151515'); }
        else if (A.k === 'pingente_cruz') { p(7, 8, 2, 7); p(5, 10, 6, 2); }
        else if (A.k === 'medalhao') { p(5, 8, 6, 6); p(7, 10, 2, 2, '#b3202a'); }
        else p(7, 8, 2, 2);
      } else {
        const base = A.base || '#c99a77'; p(4, 6, 8, 9, base); p(3, 4, 10, 3, A.k === 'luva_goleiro' ? '#1f9a4d' : A.k === 'luva_sem_dedos' ? '#1c1c1f' : base); p(7, 4, 3, 2);
        if (A.k === 'luva_sem_dedos') p(4, 6, 8, 5, '#1c1c1f'); if (A.k === 'luva_cravejada') { p(5, 8, 2, 2); p(9, 8, 2, 2); p(5, 11, 2, 2); p(9, 11, 2, 2); }
      }
      return cv;
    }
    function iconeTat(k) {
      const cv = document.createElement('canvas'); cv.width = 32; cv.height = 32; cv.style.cssText = 'width:32px;height:32px;image-rendering:pixelated;border:2px solid #0b1430;background:#e9d6c2;flex:none;';
      const g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
      const D = desenhoTatuagem(k);
      if (D) { const e = Math.min(1, 30 / D.width, 30 / D.height), w = Math.round(D.width * e), h = Math.round(D.height * e); g.drawImage(D, Math.round(16 - w / 2), Math.round(16 - h / 2), w, h); }
      else { const V = voltaTatuagem(k, false); if (V) g.drawImage(V, 8, 0, 32, 32, 0, 0, 32, 32); }
      return cv;
    }
    function abrirPainelAc() {
      return new Promise((fim) => {
        const d = S().dados, DA = dadosA();
        const el = document.createElement('div'); el.id = 'espAcessorios';
        el.style.cssText = 'position:fixed;z-index:22;right:8px;top:8px;bottom:8px;width:min(350px,48vw);background:#2a1f08;border:4px solid ' + AMAR + ';color:#f4f0e6;display:flex;flex-direction:column;font-family:var(--font-body);box-shadow:-6px 6px 0 #0008;';
        const cab = document.createElement('div'); cab.style.cssText = 'padding:7px 10px;background:#a07a12;border-bottom:3px solid ' + AMAR + ';display:flex;flex-direction:column;gap:4px;';
        const tit = document.createElement('div'); tit.style.cssText = 'font:700 14px/1.1 var(--font-display);letter-spacing:.08em;color:#fff6d8;'; tit.textContent = Tx('ACESSÓRIOS');
        const inf = document.createElement('div'); inf.style.cssText = 'font:600 11.5px/1.3 var(--font-body);white-space:pre-line;';
        const abas = document.createElement('div'); abas.style.cssText = 'display:flex;gap:3px;';
        const extra = document.createElement('div'); extra.style.cssText = 'display:flex;gap:3px;align-items:center;flex-wrap:wrap;';
        const extraTxt = document.createElement('div'); extraTxt.style.cssText = 'font:600 11px/1.25 var(--font-body);white-space:pre-line;';
        cab.append(tit, inf, abas, extra, extraTxt);
        const lista = document.createElement('div'); lista.style.cssText = 'flex:1;overflow:auto;padding:6px;display:flex;flex-direction:column;gap:5px;';
        const pe = document.createElement('div'); pe.style.cssText = 'padding:5px 8px;border-top:3px solid ' + AMAR + ';display:flex;gap:8px;align-items:center;';
        const nota = document.createElement('div'); nota.style.cssText = 'flex:1;font:600 10.5px/1.25 var(--font-body);color:#f0dfb0;'; nota.textContent = Tx('PROVAR mostra no espelho, sem compromisso.') + ' ' + Tx('O que está na sacola você paga no caixa, com a Marta.');
        const fechar = document.createElement('button'); fechar.type = 'button'; fechar.className = 'pxBtn'; fechar.textContent = Tx('FECHAR'); fechar.style.cssText = '--p:var(--p2,2px);height:34px;font-size:12px;padding:0 14px;flex:none;width:auto;min-width:0;';
        pe.append(nota, fechar);
        const bt = (txt, cor, fn, on) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = txt; b.style.cssText = 'flex:1;min-width:0;height:28px;border:2px solid ' + (on ? '#fff' : '#0b1430') + ';background:' + cor + ';color:' + (cor === AMAR ? '#1a1406' : '#fff') + ';font:700 11px/1 var(--font-display);cursor:pointer;'; b.onclick = (e) => { e.stopPropagation(); fn(); }; return b; };
        const gravar = () => { sincronizarEnfeites(); api.gravar(d.ponto || 'chegada'); };
        function linhaAc(A) {
          const tp = SIGLA[A.tipo], meu = DA.tem.includes(A.k), k = 'ac:' + A.k, naSac = M.sacola.includes(k), emUso = DA.uso[tp] === A.k;
          const vendo = M.provAc && M.provAc[tp] && M.provAc[tp][0] === A.k, metal = METAL_POR_K[metalDe(A.tipo)];
          const lin = document.createElement('div'); lin.dataset.k = A.k;
          lin.style.cssText = 'background:' + (vendo ? '#5a4410' : '#3a2c0c') + ';border:2px solid ' + (emUso ? '#3fb76a' : naSac ? AMAR : meu ? '#2f7a55' : '#5a4410') + ';padding:5px 6px;display:flex;gap:7px;align-items:center;';
          const dir = document.createElement('div'); dir.style.cssText = 'flex:1;min-width:0;display:flex;flex-direction:column;gap:4px;';
          const top = document.createElement('div'); top.style.cssText = 'display:flex;justify-content:space-between;align-items:center;gap:6px;';
          const n = document.createElement('span'); n.style.cssText = 'font:700 12.5px/1.1 var(--font-display);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'; n.textContent = Tx(A.nome);
          const tag = document.createElement('span'); tag.style.cssText = 'font:700 10px/1 var(--font-display);padding:3px 5px;white-space:nowrap;background:' + (emUso ? '#1f7a4d' : meu ? '#2f5a45' : naSac ? '#8a6a10' : '#1a1406') + ';color:' + (meu || naSac ? '#fff' : AMAR) + ';';
          tag.textContent = emUso ? Tx('Em uso') : meu ? Tx(A.tipo === 'luva' ? 'É sua' : 'É seu') : naSac ? Tx('Na sacola') : Tfx('{0} fakes', A.preco);
          top.append(n, tag);
          const bs = document.createElement('div'); bs.style.cssText = 'display:flex;gap:4px;';
          bs.appendChild(bt(vendo ? Tx('Provando') : Tx('PROVAR'), '#3a64b8', () => { const e = copiaEnf(M.provAc); e[tp] = [A.k, metal.k]; provarAc(e); render(); }, vendo));
          if (meu) bs.appendChild(bt(emUso ? Tx('TIRAR') : Tx('USAR'), emUso ? '#a3162a' : '#2a5a7a', () => {
            if (emUso) delete DA.uso[tp]; else DA.uso[tp] = A.k; gravar();
            const e = copiaEnf(M.provAc); if (emUso) delete e[tp]; else e[tp] = [A.k, metal.k]; provarAc(e); render(); }));
          else if (naSac) bs.appendChild(bt(Tx('TIRAR'), '#a3162a', () => { M.sacola = M.sacola.filter((q) => q !== k); render(); }));
          else bs.appendChild(bt(Tx('LEVAR'), AMAR, () => { M.sacola.push(k); try { api.som && api.som('pop'); } catch (e) { /* nada */ } render(); }));
          dir.append(top, bs); lin.append(iconeAc(A, metal.cor), dir); return lin;
        }
        function linhaTat(T) {
          const lug = M.lugarTat, meu = DA.tats.includes(T.k), k = 'tat:' + T.k, naSac = M.sacola.includes(k), aqui = DA.t[lug] === T.k;
          const vendo = M.provAc && M.provAc.t && M.provAc.t[lug] === T.k, onde = LUGARES_TATUAGEM.filter((L) => DA.t[L.k] === T.k).map((L) => Tx(ROT_LUGAR[L.k])).join(' + ');
          const lin = document.createElement('div'); lin.dataset.k = T.k;
          lin.style.cssText = 'background:' + (vendo ? '#5a4410' : '#3a2c0c') + ';border:2px solid ' + (aqui ? '#3fb76a' : naSac ? AMAR : meu ? '#2f7a55' : '#5a4410') + ';padding:5px 6px;display:flex;gap:7px;align-items:center;';
          const dir = document.createElement('div'); dir.style.cssText = 'flex:1;min-width:0;display:flex;flex-direction:column;gap:4px;';
          const top = document.createElement('div'); top.style.cssText = 'display:flex;justify-content:space-between;align-items:center;gap:6px;';
          const n = document.createElement('span'); n.style.cssText = 'font:700 12.5px/1.1 var(--font-display);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'; n.textContent = Tx(T.nome);
          const tag = document.createElement('span'); tag.style.cssText = 'font:700 10px/1 var(--font-display);padding:3px 5px;white-space:nowrap;background:' + (onde ? '#1f7a4d' : meu ? '#2f5a45' : naSac ? '#8a6a10' : '#1a1406') + ';color:' + (meu || naSac ? '#fff' : AMAR) + ';';
          tag.textContent = onde || (meu ? Tx('É sua') : naSac ? Tx('Na sacola') : Tfx('{0} fakes', T.preco));
          top.append(n, tag);
          const bs = document.createElement('div'); bs.style.cssText = 'display:flex;gap:4px;';
          bs.appendChild(bt(vendo ? Tx('Provando') : Tx('PROVAR'), '#3a64b8', () => { const e = copiaEnf(M.provAc); e.t = e.t || {}; e.t[lug] = T.k; provarAc(e); render(); }, vendo));
          if (meu) bs.appendChild(bt(aqui ? Tx('TIRAR DAQUI') : Tx('PÔR AQUI'), aqui ? '#a3162a' : '#2a5a7a', () => {
            if (aqui) delete DA.t[lug]; else DA.t[lug] = T.k; gravar();
            const e = copiaEnf(M.provAc); e.t = e.t || {}; if (aqui) delete e.t[lug]; else e.t[lug] = T.k; provarAc(e); render(); }));
          else if (naSac) bs.appendChild(bt(Tx('TIRAR'), '#a3162a', () => { M.sacola = M.sacola.filter((q) => q !== k); delete M.tatLugar[T.k]; render(); }));
          else bs.appendChild(bt(Tx('LEVAR'), AMAR, () => { M.sacola.push(k); M.tatLugar[T.k] = lug; try { api.som && api.som('pop'); } catch (e) { /* nada */ } render(); }));
          dir.append(top, bs); lin.append(iconeTat(T.k), dir); return lin;
        }
        function render() {
          const aba = M.abaAc;
          inf.textContent = Tfx('Você tem {0} fakes', d.fakes) + '\n' + (M.sacola.length ? Tfx('Sacola: {0} ({1} fakes)', M.sacola.length, totalSacola()) : Tx('Sacola vazia'));
          abas.innerHTML = ''; for (const [a, rot] of ABAS_AC) abas.appendChild(bt(Tx(rot), a === aba ? '#1a1406' : '#6a5010', () => { if (M.abaAc === a) return; M.abaAc = a; lista.scrollTop = 0; camAc(a); render(); }, a === aba));
          extra.innerHTML = '';
          if (aba === 'tat') {
            for (const L of LUGARES_TATUAGEM) extra.appendChild(bt(Tx(ROT_LUGAR[L.k]), L.k === M.lugarTat ? '#1a1406' : '#6a5010', () => { M.lugarTat = L.k; render(); }, L.k === M.lugarTat));
            const k = DA.t[M.lugarTat]; extraTxt.textContent = Tfx('Neste lugar: {0}', k && TATUAGEM_POR_K[k] ? Tx(TATUAGEM_POR_K[k].nome) : Tx('nada'))
              + (cobertoAc(M.lugarTat) ? '\n' + Tx(M.lugarTat[0] === 'p' ? 'Com essa roupa a perna fica coberta: a tatuagem não aparece.' : 'Com essa roupa o braço fica coberto: a tatuagem não aparece.') : '');
          } else {
            const mk = metalDe(aba);
            for (const m of METAIS) { const b = document.createElement('button'); b.type = 'button'; b.title = Tx(m.nome); b.dataset.metal = m.k;
              b.style.cssText = 'width:26px;height:22px;flex:none;cursor:pointer;background:' + m.cor + ';border:3px solid ' + (m.k === mk ? '#ffffff' : '#1a1406') + ';';
              b.onclick = (e) => { e.stopPropagation(); DA.metal[SIGLA[aba]] = m.k; gravar(); const tp = SIGLA[aba], en = copiaEnf(M.provAc); if (en[tp]) { en[tp][1] = m.k; provarAc(en); } render(); };
              extra.appendChild(b); }
            extraTxt.textContent = Tfx('Tom do metal: {0}', Tx(METAL_POR_K[mk].nome));
          }
          const rolagem = lista.scrollTop; lista.innerHTML = '';
          if (aba === 'tat') for (const T of TATUAGENS) lista.appendChild(linhaTat(T));
          else for (const A of ACESSORIOS) if (A.tipo === aba) lista.appendChild(linhaAc(A));
          lista.scrollTop = rolagem;
        }
        fechar.onclick = () => { el.remove(); M.painel = null; fim(); };
        el.append(cab, lista, pe); (document.getElementById('raizJogo') || document.body).appendChild(el);
        M.painel = { el, render }; render();
      });
    }
    async function catalogoAc() {
      const s = S(), J = s.jog, d = s.dados, E = dadosE(), A = M.eq.tati; if (!A || M.painel || !temAc()) return;
      s.modo = 'cena'; api.UI().ctl.hidden = true; api.aviso(''); A.falando = true;
      const y0 = A.yawAlvo; A.yawAlvo = Math.atan2(-(J.z - A.z), J.x - A.x);
      try {
        if (!E.tati) {
          await api.fala('esp_tati', Tx('Oi! Aqui é a seção de acessórios: brincos, colares, luvas e tatuagens.'));
          await api.fala('esp_tati', Tx('Tudo que é de metal sai em oito tons, do ouro ao grafite. É só escolher.'));
          await api.fala('esp_tati', Tx('As tatuagens eu mesma faço, no estúdio aqui do fundo. Você escolhe o desenho e o lugar: braço ou perna, direito ou esquerdo.'));
          await api.fala('esp_tati', Tx('Pode provar tudo no espelho. O que gostar vai para a sacola e a Marta cobra.'));
          E.tati = true; api.gravar(d.ponto || 'chegada');
        } else await api.fala('esp_tati', Tx(pk(['Bora se enfeitar?', 'Chegou peça nova! Quer ver?'])));
        Dialogo.esconder();
        await andarJog(PROV_AC.x, PROV_AC.z, 2.2); J.yaw = J.yawAlvo = Math.PI;
        A.yawAlvo = Math.atan2(-(J.z - A.z), J.x - A.x);
        if (!M.abaAc) M.abaAc = 'brinco'; if (!M.lugarTat) M.lugarTat = 'bd';
        sincronizarEnfeites(); camAc(M.abaAc); provarAc(enfeitesDe(dadosA()));
        const n0 = M.sacola.filter((k) => ehAc(k) || ehTat(k)).length;
        await abrirPainelAc();
        desprovarAc(); api.camCena(null); s.cam.snap = true;
        A.yawAlvo = Math.atan2(-(J.z - A.z), J.x - A.x);
        await api.fala('esp_tati', M.sacola.filter((k) => ehAc(k) || ehTat(k)).length > n0 ? Tx('Ficou muito bom! Passa no caixa com a Marta.') : Tx('Volta sempre! Sempre chega coisa nova.'));
      } catch (e) { console.error('[Esportiva] acessórios:', e); }
      finally {
        A.falando = false; A.yawAlvo = y0; if (M.painel) { M.painel.el.remove(); M.painel = null; } desprovarAc();
        try { api.camCena(null); s.cam.snap = true; Dialogo.esconder(); } catch (e) { /* nada */ }
        const ss = S(); if (ss && ss.ativo && ss.modo === 'cena') api.liberar();
      }
    }
    // os outros vendedores: a seção ainda não vende
    async function falarVendedor(k) {
      const A = M.eq[k], J = S().jog; if (!A) return; const y0 = A.yawAlvo; A.yawAlvo = Math.atan2(-(J.z - A.z), J.x - A.x); A.falando = true;
      try { for (const t of PAPO[k] || []) await api.fala('esp_' + k, Tx(t)); } finally { A.falando = false; A.yawAlvo = y0; Dialogo.esconder(); }
    }
    // a Marta, no caixa: cobra o que está na sacola
    async function caixa() {
      const s = S(), d = s.dados, E = dadosE(), C = dadosC(), A = M.eq.marta; if (!A) return;
      A.falando = true;
      try {
        if (!E.marta) { await api.fala('esp_marta', fem() ? Tx('Bem-vinda à Golaço Esportes! Escolhe com os vendedores e paga aqui comigo.') : Tx('Bem-vindo à Golaço Esportes! Escolhe com os vendedores e paga aqui comigo.')); E.marta = true; api.gravar(d.ponto || 'chegada'); }
        if (!M.sacola.length) { await api.fala('esp_marta', Tx('A sua sacola está vazia. O Biro mostra as chuteiras, a Kelly as roupas, o Juca as bolas, a Tati os acessórios e o Dedé as comemorações.')); return; }
        const total = totalSacola(), nomes = M.sacola.map(nomeItem).join(', ');
        await api.fala('esp_marta', Tfx('Na sacola: {0}. Dá {1} fakes.', nomes, total));
        if (!d.devInfinito && d.fakes < total) { await api.fala('esp_marta', Tfx('Faltam {0} fakes. Tira alguma coisa da sacola com os vendedores ou volta depois.', total - d.fakes)); return; }
        const r = await Escolha.mostrar(Tx('Caixa da loja'), [Tfx('Pagar {0} fakes', total), Tx('Agora não')]);
        if (r !== 0) { await api.fala('esp_marta', Tx('Sem pressa. A sacola fica aqui guardada enquanto você estiver na loja.')); return; }
        d.fakes -= total; if (d.devInfinito && d.fakes < 0) d.fakes = 0;
        const acs = M.sacola.filter(ehAc).map((k) => k.slice(3)), tats = M.sacola.filter(ehTat).map((k) => k.slice(4)), DA = temAc() ? dadosA() : null;
        if (DA) {                                                        // acessório novo entra em uso se o tipo estava vazio; tatuagem vai para o lugar escolhido
          for (const k of acs) { if (!DA.tem.includes(k)) DA.tem.push(k); const Ac = ACESSORIO_POR_K[k]; if (Ac && !DA.uso[SIGLA[Ac.tipo]]) DA.uso[SIGLA[Ac.tipo]] = k; }
          for (const k of tats) { if (!DA.tats.includes(k)) DA.tats.push(k); DA.t[M.tatLugar[k] || 'bd'] = k; }
          sincronizarEnfeites();
        }
        const cels = M.sacola.filter((k) => !ehCh(k) && !ehBola(k) && !ehRp(k) && !ehAc(k) && !ehTat(k)), chs = M.sacola.filter(ehCh).map((k) => k.slice(3)), rps = M.sacola.filter(ehRp).map((k) => k.slice(3)), DC = dadosCh();
        const bolas = M.sacola.filter(ehBola).map((k) => k.slice(5)), Bd = dadosB(); M.sacola = [];
        for (const n of bolas) if (!Bd.tem.includes(n)) Bd.tem.push(n);
        const bolaNova = !Bd.usando && bolas.length ? bolas[bolas.length - 1] : null; if (bolaNova) Bd.usando = bolaNova;   // a primeira bola comprada já vai para as partidas
        for (const k of cels) if (!C.tem.includes(k)) C.tem.push(k);
        for (const n of chs) if (!DC.tem.includes(n)) DC.tem.push(n);
        const ult = cels[cels.length - 1], ultCh = chs[chs.length - 1];
        let botao = 0; if (ult && !C.slots.includes(ult)) { botao = CELS()[C.slots[1]].loja && !CELS()[C.slots[0]].loja ? 1 : 2; C.slots[botao - 1] = ult; }   // a última comprada já entra num botão (troca primeiro uma das de graça)
        if (ultCh) calcar(ultCh);                                        // a última chuteira comprada já vai para o pé
        const ultRp = rps[rps.length - 1];
        if (rps.length) {                                                 // as roupas: vão para o guarda-roupa e a última já é vestida
          const minhas = minhasRp(); for (const n of rps) if (!minhas.includes(n)) minhas.push(n);
          gravarF2({ roupasLoja: minhas }); vestirRp(ultRp); try { api.refazerJogador(); } catch (e) { console.warn('[Esportiva] vestir:', e); }
        }
        E.compras = (E.compras | 0) + 1; E.gasto = (E.gasto | 0) + total;
        api.gravar(d.ponto || 'chegada'); api.somCaixa(); api.somDinheiro(); api.mostrarDinheiro(false); api.gastoNaTela(total);
        await api.fala('esp_marta', Tx('Prontinho! Já é tudo seu.'));
        if (botao) await api.fala('esp_marta', Tfx('A comemoração "{0}" já ficou no seu botão {1}. Para trocar, é com o Dedé.', Tx(CELS()[ult].nome), botao));
        if (ultCh) await api.fala('esp_marta', Tfx('A chuteira "{0}" já ficou no seu pé para a próxima partida. Para trocar, é com o Biro.', Tx(ultCh)));
        if (bolaNova) await api.fala('esp_marta', Tfx('A bola "{0}" já é a sua bola nas partidas. Para trocar, é com o Juca.', Tx(bolaNova)));
        if (ultRp) await api.fala('esp_marta', Tfx('A roupa "{0}" você já está vestindo. Para trocar, é com a Kelly ou no guarda-roupa de casa.', Tx(ultRp)));
        if ((acs.length || tats.length) && !rps.length) { try { api.refazerJogador(); } catch (e) { /* nada */ } }
        if (acs.length) await api.fala('esp_marta', Tx('Os acessórios novos são seus. Para usar ou trocar, é com a Tati.'));
        for (const k of tats) { const L = LUGARES_TATUAGEM.find((q) => q.k === (M.tatLugar[k] || 'bd')); await api.fala('esp_marta', Tfx('A tatuagem "{0}" já está feita: {1}.', Tx(TATUAGEM_POR_K[k].nome), Tx(L.nome).toLowerCase())); }
        M.tatLugar = {};
        await api.fala('esp_marta', Tx('Agora é fazer gol para estrear!'));
      } catch (e) { console.error('[Esportiva] caixa:', e); }
      finally { A.falando = false; try { Dialogo.esconder(); } catch (e) { /* nada */ } }
    }

    // ---------------------------------------------------------------- entrou / saiu / interação / a cada quadro
    function entrou(R, idx) {
      const s = S(); M.R = R; M.D = R.esportiva || null; if (!M.D) return; void idx;
      M.nav = null; montarNav(); M.eq = {}; M.gente = []; M.sacola = []; M.previa = null; M.painel = null; M.dede = null; M.proxDede = null; M.prox = rnd(3, 8); M.provando = null; M.destaque = null;
      sincronizarChuteira(); sincronizarEnfeites(); M.provAc = null; M.tatLugar = {};
      try { montarVitrine(R); } catch (e) { console.warn('[Esportiva] vitrine:', e); }
      M.provandoRp = null; M.manequins = []; try { montarManequins(R); } catch (e) { console.warn('[Esportiva] manequins:', e); }
      for (const E of EQUIPE) criarEquipe(E);
      for (let i = 0; i < alvoClientes() - 1; i++) novoCliente(true);
      void s;
    }
    function saiu() {
      const s = S(), J = s.jog;
      if (M.previa && J) soltar(J); if (M.painel) M.painel.el.remove(); if (M.provando != null && J) desprovar(); M.provando = null; M.destaque = null; tirarVitrine();
      if (M.provandoRp != null && J) desprovarRp(); M.provandoRp = null; if (M.provAc && J) desprovarAc(); M.provAc = null;
      for (const m of M.manequins || []) {                               // os manequins: sai da lista da cidade e libera a memória
        try { s.meus.delete(m); if (typeof ATLETAS !== 'undefined') ATLETAS.delete(m); if (m.raiz.parent) m.raiz.parent.remove(m.raiz);
          m.raiz.traverse((o) => { if (o.geometry && (typeof SHADOW_GEO === 'undefined' || o.geometry !== SHADOW_GEO)) o.geometry.dispose(); const ms = Array.isArray(o.material) ? o.material : [o.material]; for (const q of ms) if (q && typeof MAT_CORES !== 'undefined' && q !== MAT_CORES && (typeof SHADOW_MAT === 'undefined' || q !== SHADOW_MAT) && (typeof MAT === 'undefined' || q !== MAT)) { if (q.map) q.map.dispose(); q.dispose(); } }); } catch (e) { /* nada */ }
      }
      M.manequins = [];
      if (s.falantesExtra) for (const k of Object.keys(s.falantesExtra)) if (k.startsWith('esp_')) delete s.falantesExtra[k];
      M.R = null; M.D = null; M.nav = null; M.eq = {}; M.gente = []; M.sacola = []; M.previa = null; M.painel = null; M.dede = null;
    }
    function alvos(v) {
      const s = S(), D = M.D; if (!D || s.modo !== 'livre') return;
      for (const E of EQUIPE) {
        const A = M.eq[E.k]; if (!A) continue;
        if (E.sec === 'caixa') v.push({ x: D.pagar.x, z: D.pagar.z, r: 1.7, txt: Tx('Caixa da loja') + (M.sacola.length ? ' (' + M.sacola.length + ')' : ''), fn: caixa, y: 2.3, pri: true });
        else if (E.k === 'dede') v.push({ x: A.x, z: A.z, r: 1.8, txt: Tx('Ver as comemorações'), fn: catalogo, y: 2.4, pri: true });
        else if (E.k === 'biro') v.push({ x: A.x, z: A.z + 0.3, r: 1.8, txt: Tx('Ver as chuteiras'), fn: catalogoCh, y: 2.4, pri: true });
        else if (E.k === 'juca') v.push({ x: A.x, z: A.z + 0.5, r: 1.8, txt: Tx('Ver as bolas'), fn: catalogoBolas, y: 2.4, pri: true });
        else if (E.k === 'kelly') v.push({ x: A.x, z: A.z + 0.3, r: 1.8, txt: Tx('Ver as roupas'), fn: catalogoRp, y: 2.4, pri: true });
        else if (E.k === 'tati' && temAc()) v.push({ x: A.x, z: A.z + 0.5, r: 1.8, txt: Tx('Ver os acessórios'), fn: catalogoAc, y: 2.4, pri: true });
        else v.push({ x: A.x, z: A.z + 0.5, r: 1.6, txt: Tfx('Falar com {0}', Tx(E.nome)), fn: () => falarVendedor(E.k), y: 2.4 });
      }
    }
    function tick(dt) {
      const s = S(); if (!s || !M.D || !s.dentro || s.dentro.nome !== 'esportiva') return;
      tickPrevia(dt); tickDede(dt); tickFluxo(dt);
      if (M.vitrine) { M.vitrine.rotation.y += dt * 0.7; M.vitrine.position.y = M.vitrine.userData.y + Math.sin(performance.now() / 600) * 0.03; }
      if (M.destaque) M.destaque.rotation.y += dt * 0.7;                // a mais cara girando na redoma
      if (M.provando != null || M.provandoRp != null || M.provAc) { const J = s.jog; J.yaw += dt * 0.8; J.yawAlvo = J.yaw; }   // o provador: o jogador gira devagar para mostrar a chuteira (ou a roupa)
      for (const E of EQUIPE) { const A = M.eq[E.k]; if (A && !A.falando && E.k !== 'dede' && s.modo === 'livre') { const J = s.jog, perto = Math.hypot(J.x - A.x, J.z - A.z) < 3.2; A.yawAlvo = perto ? Math.atan2(-(J.z - A.z), J.x - A.x) : A.casa.yaw; } }   // quem está perto: o vendedor olha para o jogador
    }
    function limpar() { if (M.painel) { M.painel.el.remove(); M.painel = null; } tirarVitrine(); }
    const dbg = { M, ver, catalogo, caixa, abrirPainel, daLoja, dadosC, posar, soltar, falarVendedor, novoCliente, catalogoCh, abrirPainelCh, provar, desprovar, calcar, dadosCh, lojaCh, sincronizarChuteira, catalogoBolas, dadosB, BOLAS, mostrarBola, catalogoRp, abrirPainelRp, provarRp, desprovarRp, vestirRp, lojaRp, listaRp, minhasRp , catalogoAc, dadosA, provarAc, sincronizarEnfeites };
    if (typeof window !== 'undefined') window.__esportiva = dbg;
    return { entrou, saiu, chegou: () => false, tickCliente, tick, alvos, alvosSentado: () => null, liberarMesa() {}, limpar, _f: dbg };
  }

  if (typeof I18N !== 'undefined') for (const k of Object.keys(TRAD)) if (!I18N[k]) I18N[k] = TRAD[k];
  window.FutebolJS.registrarFase({ id: 'esportiva', nome: 'Golaço Esportes', nucleoMinimo: '7.1.13', iniciar: async () => {}, criar, dados: { PRECO, TRAD } });
})();
