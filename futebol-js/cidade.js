/* =====================================================================
   FUTEBOL JS · cidade.js · A CIDADEZINHA (arquivo SEPARADO do jogo.js, como fase1.js e fase2.js)
   ---------------------------------------------------------------------
   NOVIDADES DA 5.5.0
     - ESBARRÃO: ninguém empurra ninguém. Andar contra um NPC não o tira do lugar: ele cambaleia (a mesma animação do técnico na
       partida: A.esbarrao, no poseAtor). NPC com ROTINA (moradores, seu Valdemar, Lúcia, Cadu, Rosa) passa por dentro do jogador e
       quem cambaleia é o jogador. Dois NPCs no mesmo caminho: um cambaleia e espera um instante (travaE), o outro segue (fantasma).
       Saiu o "pulo para o lado" de quem ficava preso (era o teleporte).
     - PEDESTRES como os carros: a mais de 100 m do jogador ficam parados e invisíveis; quem passa de 100 m (ou chega numa ponta do
       mapa a mais de 80 m) é RECICLADO: some e uma pessoa NOVA aparece num ponto da rede entre 45 e 90 m, fora da visão da câmera
       (gerenciarPedestres). Os do começo do dia também são sorteados (não são mais sempre os mesmos).
     - CARRO TRAVADO por mais de 10 s (pelo jogador ou por um NPC): buzina várias vezes e quem estava na frente leva um susto
       (cambaleia) e volta correndo para a calçada de onde veio (sustoJogador / A.recua).
     - FAIXA DE PEDESTRE: o NPC estende a mão antes de atravessar (pedeFaixa) e continua com ela estendida (atravessa); os carros
       que ainda conseguem frear param antes da faixa até ele chegar do outro lado (linhaFaixa no tickCarros).
     - "Pular cena" só aparece em cena com fala (Cena, no jogo.js). Depois de pular, o jogador fica parado mais 0,5 s (travaPulo):
       antes dava para andar 25x mais rápido no fim do pulo.
     - Cafeteria (sem o jogador no turno): o cliente vai ao caixa, pede para a Lúcia, recebe o café na mão, senta, toma e vai embora.

   NOVIDADES DA 5.4.3
     - prepararDia só zera o trabalhouHoje num DIA NOVO (d.trabalhouDia): antes, voltar do prédio para a cidade liberava trabalhar de novo.

   NOVIDADES DA 5.4.2
     - No mercado, os clientes "de passeio" agora são do mercado.js (a cidade não monta mais o fluxo de lá quando o mercado.js carregou).

   NOVIDADES DA 5.4.0
     - O painel do turno (cafeteria e mercado) aparece uma vez e vira o ícone "!" vermelho no canto superior esquerdo (painelRecolhivel /
       recolherPainel / fimPainel; o botão .cdTurIco fica no #cdEsq). Tocar no ícone abre o painel de novo por uns segundos.
     - Saiu a missão "encontre um lugar para comer" (aparecia todo dia).
     - Casas do CADU (pertinho do mercado, a [824,150] da planta) e da ROSA ([544,656]): casa(..., dono) marca sem mudar o sorteio das
       outras casas. GENTE COM HORÁRIO NA RUA: criarRuaAgendada/tickRua (tipo 'rua') + rotaCasaPorta (a rota da Lúcia virou um caso dela).
       O mercado.js cria os dois em montarRua() (montarRuaMercado: só com o jogador na rua). O mercado agora abre às 8h.

     - TRABALHO NO MERCADO em arquivo separado (mercado.js, feito por um amigo; ver o cabeçalho dele). Aqui só ficaram os GANCHOS, marcados
       "(5.3.1)": carregar o mercado.js junto do interiores.js · apiMercado()/atorDe() · fala() aceita S.falantesExtra (o Cadu) · entrarEm/
       sairDoLugar chamam S.mercado.entrou/saiu · alvos() (porta fechada fora das 14h–22h, Sair no turno, alvos do mercado) · o gancho chama
       S.mercado.tick depois do tickJogador · tickPessoas despacha 'clienteMerc' · tickFluxo para no S.turnoMercado · pedestres não entram no
       mercado fechado · limpar() chama S.mercado.limpar(). A api também leva fimDeSemana e fut, para o mercado seguir as regras da 5.3.0
       (sem trabalho no sábado/domingo, sem banho o Cadu manda tomar banho, trabalhouAlgumDia para a ligação do João).

   NOVIDADES DA 5.3.0
     - Lugar do EMPREGO exclusivo: lá dentro só há clientes durante o turno do jogador (montarFluxo/tickFluxo/decidirDestino não mandam
       ninguém de fora). Era isso que gerava os clientes "sem pedido" (e às vezes invisíveis) na cafeteria.
     - Cafeteria fecha às 16h; a Lúcia fecha o caixa e sai às 17h (das 16h às 17h ela avisa que precisa fechar o caixa). A rota dela agora
       termina no ponto da calçada mais perto da porta (antes passava da cafeteria e voltava); chegando antes das 7h50 ela entra mesmo assim.
     - Sábado e domingo ninguém trabalha. Sem banho depois do futebol, a Lúcia não deixa começar o turno.
     - FUTEBOL: turnos (cafeteria 8–16, mercado 14–22, pizzaria 15–23). Quem sai à tarde é chamado 2h depois do turno; quem entra à tarde,
       4h antes. Primeira chamada: ligação do João depois do 1º dia de trabalho (celular pixelado no canto inferior direito, 10 s, o resto
       do HUD some). Atendeu: cena do celular na orelha. Não atendeu: mensagem com a localização. Marca no mapa + missão.
     - Racha no Society Doutor Bryan toda segunda e quarta (⚽ no relógio). 5 ou 3 minutos; sai 1h depois (hora do mundo). Cada partida
       fica salva em cidade.partidas (dia, hora, horário, clima, placar, nota...). A cada 10 chutes no alvo: +0,25 em chute, efeito e força.
       Depois do jogo o Caio comenta (bom: "gostei do seu jogo"; ruim: "vem aprender") e o personagem diz que precisa de um banho.

   NOVIDADES DA 5.2.1
     - A cafeteria começa vazia (montarFluxo não põe ninguém sentado ao entrar); os clientes chegam pela porta (ou do lado dela, se
       o jogador estiver parado na frente, para não nascer "dentro" dele).
     - Clientes TOMAM o café de verdade (darCopo + pose "bebe" no poseAtor): a xícara fica de pé na mão, ~19 cm na frente da boca, e
       eles dão golinhos (vaivém leve do braço e da cabeça). Antes usavam a pose de comer lanche, com as mãos entrando no rosto.
     - Gorjeta de 1 a 3 fakes (antes 1 a 5).

   NOVIDADES DA 5.2.0
     - EXPEDIENTE NOVO na cafeteria (iniciarTurno/tickTurno/encerrarTurno): os clientes entram, sentam e mostram num balão o café que
       querem ("!" = ainda não anotado). Anote na mesa, prepare na BANCADA DE PREPARO (abrirBancada: a grade do joguinho fica guardada o
       turno todo) e o café pronto vai para a MÃO do personagem (copoNaMao). Entregou: gorjeta de 1 a 5 fakes na hora, o cliente toma,
       paga no caixa (som de registradora) e vai embora. Carga controlada (MAX_ESPERANDO, custoTier) para dar tempo de atender todos.
       Fim às 16h: 20 do dia + 5 por pedido. "Acelerar final do turno" (e sair no meio do turno) paga só os 20 do dia.
     - Cafeteria abre às 8h e fecha às 20h. A Lúcia mora na casa dos Alves: sai de casa a tempo de chegar às 7h50 (rotaLucia pela rede
       de calçadas, posição tirada direto da hora) e volta às 20h. Às 20h ela fecha a cafeteria (quem estiver dentro sai).
     - Sala da cafeteria maior (20 x 14) com a bancada decorada (espresso, moedor, xaropes, xícaras, sacas de café, quadro de giz).
     - Música tema da cafeteria (MusicaCafe: bossa animada) e efeitos (SomCafe: gerar, juntar por nível, anotar, pronto, entregar,
       registradora, sininho da porta, fim do turno). Corrigido: os sons antigos da cidade (dinheiro, portão, chuva...) usavam o
       Som.audio como se fosse o AudioContext e não tocavam.
     - Acorda às 5h (H_ACORDAR). A missão "procure um lugar para comer" e a dica de controles só aparecem no 1º dia. Ícone da COXINHA
       no canto superior direito enquanto ele não comeu no dia (toque: "Seu personagem ainda não comeu hoje.").

   NOVIDADES DA 5.1.1
     - Merge Game da cafeteria: xícaras novas em pixel art 24x24 (cada família com sua louça: cafezinho branco, caneca terracota,
       xícara azul do cremoso, xícara larga verde-água do cappuccino; espuma, coração no leite, pingos de chocolate, torre de chantilly,
       vapor e brilho no último nível) e o número do nível no canto. Tocar num café mostra o NOME dele e no que ele vira juntando.
     - A janela do expediente e o cardápio do Valdemar agora ficam dentro do #raizJogo (antes iam para o <body> e parte ficava fora
       da área visível do Canva); o expediente se arruma na horizontal (informações à esquerda, grade quadrada do tamanho da altura).
     - O relógio continua andando no expediente (S.trabalhando) e o turno só acaba às 16h. Salário: PAGA_BASE (20) pelo dia +
       PAGA_PEDIDO (5) por pedido atendido. "Sair mais cedo" pede confirmação e perde os 20 do dia.
     - A Lúcia Alves adulta (criarLucia) tem a aparência da Lúcia da Fase 1: pele, cabelo castanho em rabo de cavalo, rosto e lábio
       iguais, agora de avental da cafeteria.

   NOVIDADES DA 5.1.0
     - Emprego da cafeteria: a Lúcia Alves (colega da fase1.js) é a moça do caixa (ver falarComLucia). Ela reconhece o jogador de
       3 jeitos diferentes conforme o que rolou na fase 1 (o easter egg da mariposa, uma conversa marcante na sala, ou nunca ter
       conversado). Expediente das 8h às 16h (H_TRAB_INI/H_TRAB_FIM): ao chegar um cliente, joguinho de combinar cafés na bancada
       (turnoTrabalho/TIERS, 8 níveis até Cappuccino com chantilly e borda de chocolate), sempre com a mesma xícara genérica na mão.
       Cada dia de trabalho rende fakes ao sair do expediente, a partir do 2º dia na cidade (na 5.1.1: 20 + 5 por pedido).
     - Correções: menu do balcão do Valdemar centralizado na tela (opcoes.centro do Escolha.mostrar) em vez de preso embaixo e
       grudando no personagem ao girar a câmera; caixa de colisão faltando no balcão do Valdemar; casas de NPCs com nome só revelam
       o nome depois de o jogador flagrar alguém entrando (antes ficavam reveladas de cara); nomes dos marcos do mapa (tickDescobertas)
       aparecem corretamente ao serem descobertos; avisoDormir()/madrugada() agora zeram andando/correndo do jogador, então a
       animação de corrida não fica mais presa numa cutscene seguinte; a gota do vômito (gotaVomito) agora nasce na boca, seguindo a
       curvatura do tronco, e não mais flutuando na altura da barriga.

   NOVIDADES DA 5.0.1
     - Janelas acendem à noite (~55% delas, luz amarelada; vidros numa peça própria com material de brilho). Carros com faróis e lanternas
       que acendem à noite (e na chuva) e um facho no chão à frente.
     - Otimização: NPC a mais de ~32 m vira um boneco de 1 peça (sem calcular pose); brilhos dos postes não são desenhados de dia;
       alambrados e redes dos campos só aparecem com o jogador a até ~42 m.

   NOVIDADES DA 5.0.0
     - Luz do dia mais baixa (antes estourava: água branca, mato marrom à tarde, interiores "de vidro").
     - Dia da semana no relógio (dia 1 = segunda). Dentro dos lugares tem FLUXO de clientes: quem está sai e, com lugar vazio, entra outro.
       Seg–qua vazio, qui médio, sex–dom cheio (2 a 4 lugares vazios). Nunca lota. Hospital e academia continuam como eram.
     - Morador que acha o lugar dele ocupado (pelo jogador) vai para o banco vazio mais perto. Clientes do lanche: sentam, esperam, comem e vão embora.
     - 2h da manhã acordado: cutscene, ele corre para o prédio e acorda no dia seguinte (sono nível 3, ver Sono no jogo.js).
     - Lanche: 2 de "não saudável" cada; comer satisfeito soma mais 4, ele diz que exagerou e 20 s depois vomita. 10 dias comprando no
       Valdemar = cliente fiel (−20% em tudo). Cardápio numa linha só, deslizando na horizontal. Aviso de hábitos não saudáveis em −50.

   NOVIDADES DA 4.9.6
     - NPCs: acabou a sobreposição (quem ficava preso um dentro do outro agora se afasta) e o "entra e sai de casa" sem fim. Os moradores (sentados, os que
       conversam e os três do treino) moram em casas, vários por casa: saem de manhã (6h–7h30), vão para o seu lugar e voltam às 18h, 19h ou 20h.
     - Chuva: cada morador escolhe entre uma árvore (3 pontos fixos por árvore; se estiver ocupado, vai para o próximo; em pé, sentado no chão ou deitado)
       e a casa. Quem vai para casa só volta no dia seguinte; quem se abrigou volta ao lugar quando a chuva para. O treino pausa quando falta alguém.
     - Pedestres: de cada 10 que decidem, 5 entram num lugar (cinema, cafeteria, mercado, bar, pizzaria, restaurante, academia ou sentam no lanche; hospital não).
     - Lanche do Valdemar: porta de DENTRO (na lateral do vão do balcão) além da de serviço; ele puxa a persiana (animação) e sai por uma porta e depois pela outra.
     - Árvores perto da cidade ficam translúcidas na frente da câmera; calçada com lajotas cinza pixeladas (antes estourava de branco).
     - Tempo: dia de 15 min, 2% de chance de chuva por minuto, relógio mostra de 10 em 10 minutos.

   NOVIDADES DA 4.9.5
     - Hora e clima: o dia dura 10 min (6h acorda · 22h hora de dormir; aviso às 21h). Dia claro, tarde amarelada, noite escura com os
       postes acesos. Chuva pode começar do nada (5% a cada 1 min; dura de 2 a 10 min, sorteado uma vez). Quando chove, uns NPCs se
       abrigam sob as árvores e outros correm para casa; pedestres correm com a mão na cabeça, jornal ou guarda-chuva.
     - Lanche do Valdemar: só o balcão de atendimento (sem o quadrado vermelho), cardápio com ícone pixel-art por produto. Ele abre às 8h,
       fecha às 20h e vai para casa pela porta de serviço. Sentado comendo não precisa sentar de novo: Interagir mostra "Valdemar" ou "Sair".
     - Cenário: poste da avenida movido (fora do cinema), calçadas quadriculadas, rio pixelado (mais escuro no meio, ondas suaves, o
       personagem não entra na água), píer de tábuas com os postes laterais saindo mais que a tábua.
     - Entrada do prédio: "Entrar no prédio" leva de volta ao apartamento a qualquer hora (fase2 com { volta: true }); lá a cama dorme.
   ---------------------------------------------------------------------
   Como funciona
     - É uma "fase" registrada com FutebolJS.registrarFase({ id: 'cidade' }). O fase2.js chama Fases.executar('cidade') quando o
       personagem sai do prédio (no lugar do antigo "Continua..."). Também abre por um save (tela CARREGAR) com { fase: 'cidade' }.
     - Suba o cidade.js no GitHub junto do jogo.js / fase2.js (mesma pasta futebol-js/) e atualize o versao.txt.
     - Usa as variáveis internas do jogo.js (makeAthlete, scene, camera, GANCHO_RENDER, Fases, Cena, Musica, Som, T/Tf, I18N, HistoriaSave...)
       e, do fase2.js, só o modeloJogador() (o personagem com a roupa escolhida no guarda-roupa).

   O QUE TEM POR ENQUANTO (só o visual de fora; nada para entrar ou interagir ainda)
     - A planta combinada (prancha "Planta da cidadezinha"): 240 × 152 m, 1 unidade = 1 metro (o personagem tem ~1,65 m).
       Avenida asfaltada (a única), ruas de terra, praça com mastro, igrejinha, prédio do jogador, supermercado, cafeteria, cinema,
       bar, pizzaria, restaurante, lanche do seu Valdemar, academia, quadra de futsal coberta, society, várzea, lago com píer,
       ponto de ônibus, casas (as do João e dos Alves também, sem nada de especial ainda), árvores e morros em volta.
     - Carros andando pela avenida nas duas mãos: entram por um lado, saem pelo outro (somem na névoa) e PARAM quando o
       jogador (ou outro carro) está na frente; buzinam se ele ficar parado na frente deles.
     - Dinheiro: o ícone aparece ao sair de casa, com 150 fakes (salvo em historia.cidade.fakes).
     - Câmera em terceira pessoa: arraste a tela (ou Q/E) para girar, roda do mouse para aproximar; ela chega mais perto quando
       um prédio fica entre ela e o jogador.
     - (4.9.x) Correr: direcional na borda (ou Shift) corre a 5,76 m/s (velocidade 7 na cidade: VEL_CIDADE) e o fôlego nunca acaba aqui.
     - (4.9.x) Missão aparece 5 s e recolhe num quadradinho "!"; do lado, o MAPA: toque num ponto para marcar (com a cor escolhida), o anel
       daquela cor aparece embaixo do jogador e uma setinha no centro de baixo da tela aponta para lá (some ao chegar).
     - (4.9.x) Botão pequeno de pausa (Continuar / Voltar ao menu). Esc/P pausa, M abre o mapa.
     - (4.9.x) Prédio entre a câmera e o jogador fica translúcido como UMA peça só (grava a profundidade antes de pintar).
     - (4.9.x) Pessoas: 8 andando por uma rede de caminhos (desviam, esperam o carro na faixa, levam esbarrão), 4 sentadas em bancos
       da praça e 2 duplas em pé conversando. Os carros param para elas também.
     - (4.9.x) O portão do prédio fecha depois que o jogador sai; quadra de futsal com grade e uma entrada só.
     - (4.9.3) Cinema trocou de lugar com o supermercado (fica perto do prédio do jogador); HOSPITAL ao lado do prédio (a ficha médica
       mostra a saúde: só lá). Dois societys do tamanho certo (um com 2 batedores e um goleiro treinando pênalti). Quadra de futsal com
       4 colunas por fora e uma BOLA com física: levou até o gol = comemoração de 5 s, sem corte. Graminhas e taboas com física (vergam
       quando alguém passa), cerquinhas velhas de madeira no lago. INTERAGIR: sentar em bancos, cadeiras e banquetas; no balcão do lanche
       o seu Valdemar atende (cardápio, dinheiro, comer). Fome: 2 por dia livre; cada lanche enche um tanto e é NÃO saudável
       (Espectros 'saudavel' e a condição 'refeicaoPesada' = −15% de corrida e recuperação no próximo jogo).
     - (4.9.4) INTERIORES (arquivo interiores.js, baixado em segundo plano): supermercado, cafeteria, pizzaria, restaurante, academia, bar,
       cinema, hospital e o salão do lanche. "Entrar" na porta de cada um; a cidade fica escondida e parada, a sala aparece no mesmo lugar,
       com pessoas de enfeite (paradas, andando, sentadas, na esteira, fazendo rosca) e lugares para sentar. A ficha médica agora é com a
       enfermeira da recepção do hospital. Sem compra/trabalho ainda. Mesas do bar foram para entre as portas.

   CUIDADO COM "PISCAR" (z-fighting): nenhuma superfície fica no mesmo plano que outra virada para o mesmo lado.
     - O chão da cidade é UMA textura só (grama, terra, asfalto, faixas, praça, várzea pintados juntos); fora da cidade, faixas
       de chão que se encostam pela borda (sem sobrepor).
     - Tudo que fica "por cima" é volume de verdade com altura (calçada 12 cm, society 8 cm, quadra 10 cm, água 5 cm, píer 30 cm).
     - Peças grudadas na parede (janela, porta, barrado, faixas, placas) saem dela por distâncias diferentes (3, 4, 5, 7 cm...)
       e são sempre um pouco maiores ou menores que a parede, para nenhuma face coincidir.

   O QUE FICA SALVO (FutebolJS.historia.ler('cidade'))
     { ponto: 'chegada', fakes: 150, visitas }  e um save no espaço da tela CARREGAR: { fase: 'cidade', ponto, autosave: true, ... }
   ===================================================================== */
(function () {
  'use strict';

  const esperar = (ms) => (typeof Cena !== 'undefined' ? Cena.esperar(ms) : new Promise((r) => setTimeout(r, ms)));
  const pulando = () => typeof Cena !== 'undefined' && Cena.pulando;
  const OX = 6000;                                   // a cidade fica longe de tudo (campo, Fase 1, Fase 2, criador)
  const CEU = 0x9fd0ef;
  let UI = null, S = null, API = null;

  // ------------------------------------------------------------------ textos novos (pt → en, es, it, fr)
  const TRAD_CD = {
    'Use o direcional para andar e arraste a tela para girar a câmera.': ['Use the joystick to walk and drag the screen to turn the camera.', 'Usa el joystick para caminar y arrastra la pantalla para girar la cámara.', 'Usa il joystick per camminare e trascina lo schermo per ruotare la telecamera.', "Utilise le joystick pour marcher et fais glisser l'écran pour tourner la caméra."],
    'Agora você tem dinheiro: {0} fakes.': ['Now you have money: {0} fakes.', 'Ahora tienes dinero: {0} fakes.', 'Ora hai dei soldi: {0} fakes.', "Maintenant tu as de l'argent : {0} fakes."],
    'fakes': ['fakes', 'fakes', 'fakes', 'fakes'],
    'Dinheiro': ['Money', 'Dinero', 'Soldi', 'Argent'],
    'Modo história · Cidadezinha': ['Story mode · Small town', 'Modo historia · Pueblito', 'Modalità storia · Paesino', 'Mode histoire · Petite ville'],
    'Empurre o direcional até a borda para correr. Arraste a tela para girar a câmera.': ['Push the joystick to the edge to run. Drag the screen to turn the camera.', 'Empuja el joystick hasta el borde para correr. Arrastra la pantalla para girar la cámara.', 'Spingi il joystick fino al bordo per correre. Trascina lo schermo per ruotare la telecamera.', "Pousse le joystick jusqu'au bord pour courir. Fais glisser l'écran pour tourner la caméra."],
    'Mapa': ['Map', 'Mapa', 'Mappa', 'Carte'],
    'Entrar': ['Enter', 'Entrar', 'Entra', 'Entrer'], 'Sair': ['Leave', 'Salir', 'Esci', 'Sortir'],
    'Supermercado': ['Supermarket', 'Supermercado', 'Supermercato', 'Supermarché'], 'Cafeteria': ['Café', 'Cafetería', 'Caffetteria', 'Café'],
    'Pizzaria': ['Pizzeria', 'Pizzería', 'Pizzeria', 'Pizzeria'], 'Restaurante': ['Restaurant', 'Restaurante', 'Ristorante', 'Restaurant'],
    'Academia': ['Gym', 'Gimnasio', 'Palestra', 'Salle de sport'], 'Bar': ['Bar', 'Bar', 'Bar', 'Bar'], 'Cinema': ['Movie theater', 'Cine', 'Cinema', 'Cinéma'],
    'Hospital': ['Hospital', 'Hospital', 'Ospedale', 'Hôpital'], 'Lanche do seu Valdemar': ["Mr. Valdemar's snack bar", 'Lonchería de don Valdemar', 'Chiosco del signor Valdemar', 'Snack de monsieur Valdemar'],
    'Falar com a enfermeira': ['Talk to the nurse', 'Hablar con la enfermera', "Parla con l'infermiera", "Parler à l'infirmière"],
    'Interagir': ['Interact', 'Interactuar', 'Interagisci', 'Interagir'],
    'Levantar': ['Stand up', 'Levantarse', 'Alzati', 'Se lever'],
    'Sentar': ['Sit down', 'Sentarse', 'Siediti', "S'asseoir"],
    'Sentar no balcão': ['Sit at the counter', 'Sentarse en la barra', 'Siediti al bancone', "S'asseoir au comptoir"],
    'Entrar no hospital': ['Enter the hospital', 'Entrar al hospital', "Entra nell'ospedale", "Entrer à l'hôpital"],
    'Seu Valdemar': ['Mr. Valdemar', 'Don Valdemar', 'Signor Valdemar', 'Monsieur Valdemar'],
    'Opa, freguês novo! Eu sou o Valdemar, prazer. Aqui é o melhor lanche da cidade!': ['Hey, a new customer! I am Valdemar, nice to meet you. This is the best snack bar in town!', '¡Epa, cliente nuevo! Soy Valdemar, mucho gusto. ¡Aquí está la mejor lonchería del pueblo!', 'Ehi, un cliente nuovo! Sono Valdemar, piacere. Qui c\'è il miglior chiosco del paese!', 'Tiens, un nouveau client ! Je suis Valdemar, enchanté. Ici, c\'est le meilleur snack de la ville !'],
    'E aí, o que vai ser hoje?': ['So, what will it be today?', 'Bueno, ¿qué va a ser hoy?', 'Allora, cosa prendi oggi?', "Alors, qu'est-ce que ce sera aujourd'hui ?"],
    'Valeu, seu Valdemar, mas eu tô cheio. Hoje não cabe mais nada.': ['Thanks, Mr. Valdemar, but I am full. Nothing else fits today.', 'Gracias, don Valdemar, pero estoy lleno. Hoy no me cabe nada más.', 'Grazie, signor Valdemar, ma sono pieno. Oggi non ci sta più niente.', "Merci, monsieur Valdemar, mais je n'ai plus faim. Plus rien ne rentre aujourd'hui."],
    'Cardápio do seu Valdemar (você tem {0} fakes)': ["Mr. Valdemar's menu (you have {0} fakes)", 'Menú de don Valdemar (tienes {0} fakes)', 'Menù del signor Valdemar (hai {0} fakes)', 'Menu de monsieur Valdemar (tu as {0} fakes)'],
    'Nada, obrigado': ['Nothing, thanks', 'Nada, gracias', 'Niente, grazie', 'Rien, merci'],
    'Tranquilo, fica à vontade!': ['No problem, make yourself at home!', '¡Tranquilo, siéntete como en casa!', 'Tranquillo, fai come se fossi a casa tua!', 'Pas de souci, fais comme chez toi !'],
    'Ih... tá faltando dinheiro aí, hein?': ['Uh-oh... looks like you are short on money, huh?', 'Uy... te está faltando plata, ¿eh?', 'Ehm... mancano un po\' di soldi, eh?', "Oh là... il te manque des sous, hein ?"],
    'Saindo um {0}!': ['One {0}, coming right up!', '¡Sale un {0}!', 'Ecco un {0} in arrivo!', 'Un {0}, ça arrive !'],
    'Ufa... agora sim, matei a fome!': ['Phew... now that hit the spot!', '¡Uf... ahora sí, maté el hambre!', 'Uff... adesso sì, ho fatto il pieno!', "Ouf... là, j'ai bien mangé !"],
    'Hmm... ainda dava para comer mais um pouco.': ['Hmm... I could still eat a bit more.', 'Mmm... todavía podría comer un poco más.', 'Mmm... potrei mangiare ancora un po\'.', "Hmm... je pourrais encore manger un peu."],
    'Ficha médica': ['Medical record', 'Ficha médica', 'Cartella clinica', 'Dossier médical'],
    'A enfermeira confere como você está.': ['The nurse checks how you are doing.', 'La enfermera revisa cómo estás.', "L'infermiera controlla come stai.", "L'infirmière vérifie comment tu vas."],
    'Refeição pesada: no próximo jogo você corre menos e recupera o fôlego mais devagar.': ['Heavy meal: in the next match you run less and get your breath back more slowly.', 'Comida pesada: en el próximo partido corres menos y recuperas el aliento más despacio.', 'Pasto pesante: nella prossima partita corri meno e recuperi il fiato più lentamente.', 'Repas lourd : au prochain match, tu cours moins et tu récupères ton souffle plus lentement.'],
    'Lanches não saudáveis neste mês: {0}.': ['Unhealthy snacks this month: {0}.', 'Comidas poco saludables este mes: {0}.', 'Spuntini poco sani questo mese: {0}.', 'Snacks pas sains ce mois-ci : {0}.'],
    'Nenhuma observação por enquanto.': ['No notes for now.', 'Ninguna observación por ahora.', 'Nessuna osservazione per ora.', "Aucune remarque pour l'instant."],
    'Missão': ['Mission', 'Misión', 'Missione', 'Mission'],
    'Pausar': ['Pause', 'Pausar', 'Pausa', 'Pause'],
    'Pausado': ['Paused', 'En pausa', 'In pausa', 'En pause'],
    'Continuar': ['Continue', 'Continuar', 'Continua', 'Continuer'],
    'Fechar': ['Close', 'Cerrar', 'Chiudi', 'Fermer'],
    'Remover marca': ['Remove marker', 'Quitar marca', 'Rimuovi segnale', 'Retirer le repère'],
    'Toque no mapa para marcar um destino. A cor escolhida aparece embaixo de você e a setinha mostra o caminho.': ['Tap the map to mark a destination. The chosen color shows under you and the little arrow points the way.', 'Toca el mapa para marcar un destino. El color elegido aparece debajo de ti y la flechita muestra el camino.', 'Tocca la mappa per segnare una destinazione. Il colore scelto appare sotto di te e la freccetta indica la strada.', 'Touche la carte pour marquer une destination. La couleur choisie apparaît sous toi et la petite flèche montre le chemin.'],
  };
  Object.assign(TRAD_CD, {
    'Amanheceu: dia {0}.': ['Dawn: day {0}.', 'Amaneció: día {0}.', 'Alba: giorno {0}.', 'Le jour se lève : jour {0}.'],
    'É melhor eu voltar para casa, tenho que dormir às 22h para ter minhas 8 horas de sono, ou isso pode afetar meu desempenho.': ["I'd better head home. I have to sleep by 10 PM to get my 8 hours of sleep, or it could hurt my performance.", 'Mejor vuelvo a casa. Tengo que dormir a las 22h para tener mis 8 horas de sueño, o puede afectar mi rendimiento.', 'Meglio tornare a casa. Devo dormire alle 22 per fare le mie 8 ore di sonno, altrimenti può influire sulle mie prestazioni.', "Je ferais mieux de rentrer. Je dois dormir à 22 h pour avoir mes 8 heures de sommeil, sinon ça peut affecter mes performances."],
    'Entrar no prédio': ['Enter the building', 'Entrar al edificio', 'Entra nel palazzo', "Entrer dans l'immeuble"],
    'Cardápio do seu Valdemar': ["Mr. Valdemar's menu", 'Menú de don Valdemar', 'Menù del signor Valdemar', 'Menu de monsieur Valdemar'],
    'No balcão': ['At the counter', 'En la barra', 'Al bancone', 'Au comptoir'],
    'Valdemar': ['Valdemar', 'Valdemar', 'Valdemar', 'Valdemar'],
    'Lanche fechado. Abre às 8h.': ['Snack bar closed. Opens at 8 AM.', 'Lonchería cerrada. Abre a las 8h.', 'Chiosco chiuso. Apre alle 8.', 'Snack fermé. Ouvre à 8 h.'],
    'Opa, já são 20h! Vou fechar a loja. Volta amanhã, a gente abre às 8h!': ["Whoa, it's already 8 PM! I'm closing up. Come back tomorrow, we open at 8 AM!", '¡Epa, ya son las 20h! Voy a cerrar. ¡Vuelve mañana, abrimos a las 8h!', 'Ehi, sono già le 20! Chiudo il chiosco. Torna domani, apriamo alle 8!', 'Oh, il est déjà 20 h ! Je ferme. Reviens demain, on ouvre à 8 h !'],
    'X-podrão': ['Street burger', 'X-podrão', 'X-podrão', 'X-podrão'],
    'Cachorro meio-frio': ['Half-size hot dog', 'Perrito pequeño', 'Hot dog piccolo', 'Petit hot-dog'],
    'Cachorro-quente especial': ['Special hot dog', 'Perrito especial', 'Hot dog speciale', 'Hot-dog spécial'],
    'X-quase-tudo': ['Almost-everything burger', 'X-casi-todo', 'X-quasi-tutto', 'X-presque-tout'],
    'X-sem-salada com refri': ['No-salad burger with soda', 'X-sin-ensalada con refresco', 'X-senza-insalata con bibita', 'X-sans-salade avec soda'],
    // (5.0.0)
    'Seg': ['Mon', 'Lun', 'Lun', 'Lun'], 'Ter': ['Tue', 'Mar', 'Mar', 'Mar'], 'Qua': ['Wed', 'Mié', 'Mer', 'Mer'], 'Qui': ['Thu', 'Jue', 'Gio', 'Jeu'],
    'Sex': ['Fri', 'Vie', 'Ven', 'Ven'], 'Sáb': ['Sat', 'Sáb', 'Sab', 'Sam'], 'Dom': ['Sun', 'Dom', 'Dom', 'Dim'],
    'Meu Deus, é 2h00?! O que eu tô fazendo acordado ainda??': ["Oh my God, it's 2 AM?! What am I still doing awake??", 'Dios mío, ¿son las 2?! ¿¿Qué hago todavía despierto??', 'Mio Dio, sono le 2?! Cosa ci faccio ancora sveglio??', "Mon Dieu, il est 2 h ?! Qu'est-ce que je fais encore debout ??"],
    'Eu já tô satisfeito... mas bem que cabia mais um.': ["I'm already full... but I could fit one more.", 'Ya estoy lleno... pero me cabe uno más.', 'Sono già sazio... ma ce ne starebbe un altro.', "Je suis déjà rassasié... mais j'en mangerais bien un autre."],
    'Acho que eu exagerei...': ['I think I overdid it...', 'Creo que me pasé...', 'Credo di aver esagerato...', "Je crois que j'ai exagéré..."],
    'Rapaz, já são 10 dias vindo aqui! Agora você é cliente fiel: de hoje em diante, 20% de desconto em tudo!': ["Kid, that's 10 days coming here! You're a loyal customer now: from today on, 20% off everything!", '¡Muchacho, ya son 10 días viniendo aquí! Ahora eres cliente fiel: desde hoy, 20% de descuento en todo.', 'Ragazzo, sono già 10 giorni che vieni qui! Ora sei un cliente fedele: da oggi, 20% di sconto su tutto!', "Mon garçon, ça fait 10 jours que tu viens ici ! Tu es un client fidèle : à partir d'aujourd'hui, 20 % de réduction sur tout !"],
    'Cliente fiel: −20%': ['Loyal customer: −20%', 'Cliente fiel: −20%', 'Cliente fedele: −20%', 'Client fidèle : −20 %'],
    // (5.1.0)
    'Nem lembro de ter chegado em casa... apaguei de cansaço.': ["I don't even remember getting home... I passed out from exhaustion.", 'Ni me acuerdo de haber llegado a casa... me apagué de cansancio.', 'Non mi ricordo nemmeno di essere arrivato a casa... sono crollato dalla stanchezza.', "Je ne me souviens même pas d'être rentré... je me suis endormi d'épuisement."],
    'Você descobriu: {0}': ['You discovered: {0}', 'Descubriste: {0}', 'Hai scoperto: {0}', 'Tu as découvert : {0}'],
    'Lago do Sapo Cururu': ['Cururu Toad Lake', 'Lago del Sapo Cururu', 'Lago del Rospo Cururu', 'Lac du Crapaud Cururu'],
    'Campo de Várzea Henrique Antônio': ['Henrique Antônio Field', 'Campo Henrique Antônio', 'Campo Henrique Antônio', 'Terrain Henrique Antônio'],
    'Society do Seu Nonato': ["Seu Nonato's Society", 'Society de don Nonato', 'Society di Seu Nonato', 'Society de Seu Nonato'],
    'Society Doutor Bryan': ['Doctor Bryan Society', 'Society del Doctor Bryan', 'Society del Dottor Bryan', 'Society du Docteur Bryan'],
    'Casa do João': ["João's house", 'Casa de João', 'Casa di João', 'Maison de João'],
    'Casa dos Alves': ['The Alves house', 'Casa de los Alves', 'Casa degli Alves', 'Maison des Alves'],
    // (5.1.0) emprego da cafeteria: a Lúcia Alves no caixa e o Merge Game do expediente
    'Lúcia Alves': ['Lúcia Alves', 'Lúcia Alves', 'Lúcia Alves', 'Lúcia Alves'],
    'Eita! Foi mal!': ['Whoa! My bad!', '¡Uy! ¡Perdón!', 'Ops! Scusa!', 'Oups ! Désolé !'],   // (5.5.0) susto do carro
    // (5.3.0) futebol no sintético, celular, banho, Lúcia fecha o caixa
    '3 minutos': ['3 minutes', '3 minutos', '3 minuti', '3 minutes'],
    '5 minutos': ['5 minutes', '5 minutos', '5 minuti', '5 minutes'],
    'Agora não': ['Not now', 'Ahora no', 'Non ora', 'Pas maintenant'],
    'Bora jogar uma bola? A galera joga no campo sintético Doutor Bryan. Te espero lá {0}!': ["Wanna play some ball? The guys play at Doctor Bryan's turf field. See you there {0}!", '¿Jugamos un partido? Los chicos juegan en la cancha sintética Doctor Bryan. ¡Te espero allí {0}!', 'Facciamo una partita? I ragazzi giocano al campo sintetico Dottor Bryan. Ti aspetto lì {0}!', 'On joue un match ? La bande joue au terrain synthétique Docteur Bryan. Je t\'attends là-bas {0} !'],
    'Bora! Tô dentro.': ["Let's go! I'm in.", '¡Vamos! Me apunto.', 'Andiamo! Ci sto.', 'Allez ! Je suis partant.'],
    'E aí! Eu sou o Caio, eu organizo o racha aqui.': ["Hey! I'm Caio, I organize the pickup games here.", '¡Hola! Soy Caio, organizo los partidos aquí.', 'Ciao! Sono Caio, organizzo le partitelle qui.', 'Salut ! Moi c\'est Caio, j\'organise les matchs ici.'],
    'Fala, {0}! É o João!': ["Hey, {0}! It's João!", '¡Hola, {0}! ¡Soy João!', 'Ehi, {0}! Sono João!', 'Salut, {0} ! C\'est João !'],
    'Fechou! Te mandei a localização. Até lá!': ['Deal! I sent you the location. See you there!', '¡Listo! Te mandé la ubicación. ¡Nos vemos!', 'Affare fatto! Ti ho mandato la posizione. A dopo!', 'Marché conclu ! Je t\'ai envoyé la localisation. À tout à l\'heure !'],
    'Galera do Bryan': ["Bryan's Crew", 'Los de Bryan', 'Banda di Bryan', 'La bande de Bryan'],
    'Hoje não foi o seu dia, hein? Mas a gente joga aqui toda segunda e quarta. Aparece pra aprender: futebol se aprende jogando!': ["Not your day today, huh? But we play here every Monday and Wednesday. Come by and learn: you learn football by playing!", 'Hoy no fue tu día, ¿eh? Pero jugamos aquí todos los lunes y miércoles. Ven a aprender: ¡al fútbol se aprende jugando!', 'Oggi non era la tua giornata, eh? Ma giochiamo qui ogni lunedì e mercoledì. Vieni a imparare: a calcio si impara giocando!', 'Ce n\'était pas ton jour, hein ? Mais on joue ici tous les lundis et mercredis. Viens apprendre : le foot, ça s\'apprend en jouant !'],
    'Jogar bola no sintético': ['Play ball on the turf', 'Jugar en la cancha sintética', 'Giocare sul sintetico', 'Jouer sur le synthétique'],
    'João chamando... toque para atender': ['João calling... tap to answer', 'João llamando... toca para contestar', 'João sta chiamando... tocca per rispondere', 'João appelle... touche pour répondre'],
    'João': ['João', 'João', 'João', 'João'],
    'Mandou muito bem hoje! A gente joga aqui toda segunda e quarta. Aparece, que eu gostei do seu jogo!': ['You played great today! We play here every Monday and Wednesday. Come back, I liked your game!', '¡Jugaste muy bien hoy! Jugamos aquí todos los lunes y miércoles. ¡Vuelve, me gustó tu juego!', 'Hai giocato benissimo oggi! Giochiamo qui ogni lunedì e mercoledì. Torna, mi è piaciuto il tuo gioco!', 'Tu as super bien joué aujourd\'hui ! On joue ici tous les lundis et mercredis. Reviens, j\'ai aimé ton jeu !'],
    'Missão: futebol no sintético Doutor Bryan às {0}.': ["Mission: football at Doctor Bryan's turf at {0}.", 'Misión: fútbol en la sintética Doctor Bryan a las {0}.', 'Missione: calcio al sintetico Dottor Bryan alle {0}.', 'Mission : foot au synthétique Docteur Bryan à {0}.'],
    'Missão: futebol no sintético Doutor Bryan, {0}.': ["Mission: football at Doctor Bryan's turf, {0}.", 'Misión: fútbol en la sintética Doctor Bryan, {0}.', 'Missione: calcio al sintetico Dottor Bryan, {0}.', 'Mission : foot au synthétique Docteur Bryan, {0}.'],
    'O jogo é às {0}': ['The game is at {0}', 'El partido es a las {0}', 'La partita è alle {0}', 'Le match est à {0}'],
    'Opa, João! Acabei de sair do trabalho. E aí?': ["Hey, João! I just got off work. What's up?", '¡Hola, João! Acabo de salir del trabajo. ¿Qué tal?', 'Ehi, João! Sono appena uscito dal lavoro. Che si dice?', 'Salut, João ! Je viens de sortir du travail. Quoi de neuf ?'],
    'Quanto tempo de jogo?': ['How long should the game be?', '¿Cuánto tiempo de juego?', 'Quanto dura la partita?', 'Combien de temps de jeu ?'],
    'Racha do sintético': ['Turf pickup game', 'Partido en la sintética', 'Partitella sul sintetico', 'Match sur le synthétique'],
    'Racha no sintético: 4 contra 4!': ['Pickup game on the turf: 4 vs 4!', 'Partido en la sintética: ¡4 contra 4!', 'Partitella sul sintetico: 4 contro 4!', 'Match sur le synthétique : 4 contre 4 !'],
    'Sinto que meu chute está melhorando...': ['I feel like my shooting is getting better...', 'Siento que mi tiro está mejorando...', 'Sento che il mio tiro sta migliorando...', 'J\'ai l\'impression que ma frappe s\'améliore...'],
    'Te mandei a localização.': ['I sent you the location.', 'Te mandé la ubicación.', 'Ti ho mandato la posizione.', 'Je t\'ai envoyé la localisation.'],
    'Tentei te ligar e você não atendeu. Bora jogar bola! Lá no campo sintético Doutor Bryan. Te espero lá {0}.': ["I tried to call you and you didn't pick up. Let's play ball! At Doctor Bryan's turf field. See you there {0}.", 'Te llamé y no contestaste. ¡Vamos a jugar! En la cancha sintética Doctor Bryan. Te espero allí {0}.', 'Ti ho chiamato e non hai risposto. Andiamo a giocare! Al campo sintetico Dottor Bryan. Ti aspetto lì {0}.', 'J\'ai essayé de t\'appeler et tu n\'as pas répondu. On va jouer ! Au terrain synthétique Docteur Bryan. Je t\'attends là-bas {0}.'],
    'Time do João': ["João's Team", 'Equipo de João', 'Squadra di João', 'Équipe de João'],
    'Ufa... depois dessa eu preciso tomar um banho.': ['Phew... after that I need a shower.', 'Uf... después de esto necesito una ducha.', 'Uff... dopo questa mi serve una doccia.', 'Ouf... après ça, il me faut une douche.'],
    'Você': ['You', 'Tú', 'Tu', 'Toi'],
    'amanhã': ['tomorrow', 'mañana', 'domani', 'demain'],
    'hoje': ['today', 'hoy', 'oggi', "aujourd'hui"],
    'às {0}': ['at {0}', 'a las {0}', 'alle {0}', 'à {0}'],
    'Já são 17h, vou fechar a cafeteria! Até amanhã!': ["It's already 5 PM, I'm closing the café! See you tomorrow!", '¡Ya son las 17h, voy a cerrar la cafetería! ¡Hasta mañana!', 'Sono già le 17, chiudo la caffetteria! A domani!', 'Il est déjà 17 h, je ferme le café ! À demain !'],
    'Agora eu preciso fechar o caixa... Só saio daqui mais tarde. Até amanhã!': ["Now I need to close out the register... I'll only leave later. See you tomorrow!", 'Ahora tengo que cerrar la caja... Salgo más tarde. ¡Hasta mañana!', 'Ora devo chiudere la cassa... Esco più tardi. A domani!', 'Là je dois faire la caisse... Je ne pars que plus tard. À demain !'],
    'Hoje é fim de semana, você não trabalha! Aproveita e descansa. Até segunda!': ["It's the weekend, you don't work today! Enjoy it and rest. See you Monday!", '¡Hoy es fin de semana, no trabajas! Aprovecha y descansa. ¡Hasta el lunes!', 'Oggi è fine settimana, non lavori! Approfittane e riposati. A lunedì!', 'C\'est le week-end, tu ne travailles pas ! Profites-en pour te reposer. À lundi !'],
    'Nossa... você tá com cheiro de quem acabou de jogar bola! Passa em casa, toma um banho e depois volta, tá?': ["Wow... you smell like you just played football! Go home, take a shower and then come back, okay?", 'Uy... ¡hueles a que acabas de jugar al fútbol! Pasa por casa, dúchate y luego vuelve, ¿vale?', 'Accidenti... hai l\'odore di chi ha appena giocato a calcio! Passa da casa, fatti una doccia e poi torna, ok?', 'Oh là... tu sens comme quelqu\'un qui vient de jouer au foot ! Passe chez toi, prends une douche et reviens, d\'accord ?'],
    // (5.2.0) expediente com clientes, bancada, gorjeta e caixa; Lúcia com casa e horário; coxinha da fome
    "Clientes com \"!\" querem fazer um pedido. Anote na mesa e prepare na bancada (à esquerda).": ["Customers with \"!\" want to order. Take the order at the table and make it at the prep counter (on the left).", "Los clientes con \"!\" quieren pedir. Anota en la mesa y prepara en la barra (a la izquierda).", "I clienti con \"!\" vogliono ordinare. Prendi l'ordine al tavolo e preparalo al bancone (a sinistra).", "Les clients avec \"!\" veulent commander. Note la commande à table et prépare-la au comptoir (à gauche)."],
    "Anotar pedido": ["Take order", "Anotar pedido", "Prendi l'ordine", "Prendre la commande"],
    "Entregar: {0}": ["Deliver: {0}", "Entregar: {0}", "Consegna: {0}", "Servir : {0}"],
    "Pedido: {0}": ["Order: {0}", "Pedido: {0}", "Ordine: {0}", "Commande : {0}"],
    "Esse café na sua mão não é o que este cliente pediu.": ["The coffee in your hand is not what this customer ordered.", "El café en tu mano no es lo que pidió este cliente.", "Il caffè che hai in mano non è quello che ha ordinato questo cliente.", "Le café dans ta main n'est pas ce que ce client a commandé."],
    "Prepare esse pedido na bancada.": ["Make this order at the prep counter.", "Prepara este pedido en la barra.", "Prepara questo ordine al bancone.", "Prépare cette commande au comptoir."],
    "Pedido anotado: {0}. Prepare na bancada.": ["Order taken: {0}. Make it at the prep counter.", "Pedido anotado: {0}. Prepáralo en la barra.", "Ordine preso: {0}. Preparalo al bancone.", "Commande notée : {0}. Prépare-la au comptoir."],
    "Gorjeta: +{0} fakes!": ["Tip: +{0} fakes!", "¡Propina: +{0} fakes!", "Mancia: +{0} fakes!", "Pourboire : +{0} fakes !"],
    "Você já está com um café na mão. Entregue primeiro!": ["You are already holding a coffee. Deliver it first!", "Ya tienes un café en la mano. ¡Entrégalo primero!", "Hai già un caffè in mano. Consegnalo prima!", "Tu as déjà un café en main. Sers-le d'abord !"],
    "Bancada de preparo": ["Prep counter", "Barra de preparación", "Bancone di preparazione", "Comptoir de préparation"],
    "Fechar": ["Close", "Cerrar", "Chiudi", "Fermer"],
    "Pedidos anotados": ["Orders taken", "Pedidos anotados", "Ordini presi", "Commandes notées"],
    "Nenhum pedido anotado. Anote nas mesas!": ["No orders taken. Take them at the tables!", "Ningún pedido anotado. ¡Anota en las mesas!", "Nessun ordine preso. Prendili ai tavoli!", "Aucune commande notée. Va aux tables !"],
    "Pronto! Leve o {0} para o cliente.": ["Done! Take the {0} to the customer.", "¡Listo! Lleva el {0} al cliente.", "Pronto! Porta il {0} al cliente.", "Prêt ! Apporte le {0} au client."],
    "Acelerar final do turno": ["Speed up end of shift", "Acelerar el final del turno", "Accelera la fine del turno", "Accélérer la fin du service"],
    "Atendidos: {0}": ["Served: {0}", "Atendidos: {0}", "Serviti: {0}", "Servis : {0}"],
    "Gorjetas: {0}": ["Tips: {0}", "Propinas: {0}", "Mance: {0}", "Pourboires : {0}"],
    "Na mão:": ["In hand:", "En la mano:", "In mano:", "En main :"],
    "Acelerar até as 16h? Você só ganha os 20 fakes do dia, sem nenhum adicional pelos clientes atendidos (as gorjetas que já recebeu ficam com você).": ["Speed up to 4 PM? You only get the 20 fakes for the day, with no extra for the customers served (the tips you already got are yours).", "¿Acelerar hasta las 16h? Solo ganas los 20 fakes del día, sin ningún adicional por los clientes atendidos (las propinas que ya recibiste son tuyas).", "Accelerare fino alle 16? Guadagni solo i 20 fakes del giorno, senza nessun extra per i clienti serviti (le mance già ricevute restano tue).", "Accélérer jusqu'à 16 h ? Tu ne gagnes que les 20 fakes du jour, sans bonus pour les clients servis (les pourboires déjà reçus restent à toi)."],
    "Acelerar": ["Speed up", "Acelerar", "Accelera", "Accélérer"],
    "Continuar trabalhando": ["Keep working", "Seguir trabajando", "Continua a lavorare", "Continuer à travailler"],
    "Turno encerrado! Hoje fica só o do dia: {0} fakes. Até amanhã!": ["Shift over! Today it's just the day's pay: {0} fakes. See you tomorrow!", "¡Turno terminado! Hoy solo lo del día: {0} fakes. ¡Hasta mañana!", "Turno finito! Oggi solo la paga del giorno: {0} fakes. A domani!", "Service terminé ! Aujourd'hui, juste la paie du jour : {0} fakes. À demain !"],
    "Acabou o seu turno de hoje! Você atendeu {0} clientes: toma, {1} fakes ({2} do dia + {3} dos pedidos). Até a próxima!": ["Your shift is over! You served {0} customers: here, {1} fakes ({2} for the day + {3} for the orders). See you next time!", "¡Se acabó tu turno! Atendiste {0} clientes: toma, {1} fakes ({2} del día + {3} de los pedidos). ¡Hasta la próxima!", "Il tuo turno è finito! Hai servito {0} clienti: tieni, {1} fakes ({2} del giorno + {3} degli ordini). Alla prossima!", "Ton service est fini ! Tu as servi {0} clients : tiens, {1} fakes ({2} du jour + {3} des commandes). À la prochaine !"],
    "O expediente é das 8h às 16h. Os clientes sentam e mostram o que querem: vá até a mesa, anote o pedido e prepare na bancada, juntando dois cafés iguais para subir de nível. Depois é só levar até o cliente!": ["The shift is from 8 AM to 4 PM. Customers sit and show what they want: go to the table, take the order and make it at the prep counter, merging two equal coffees to level up. Then just take it to the customer!", "El turno es de 8h a 16h. Los clientes se sientan y muestran lo que quieren: ve a la mesa, anota el pedido y prepáralo en la barra, juntando dos cafés iguales para subir de nivel. ¡Luego llévalo al cliente!", "Il turno è dalle 8 alle 16. I clienti si siedono e mostrano cosa vogliono: vai al tavolo, prendi l'ordine e preparalo al bancone, unendo due caffè uguali per salire di livello. Poi portalo al cliente!", "Le service est de 8 h à 16 h. Les clients s'assoient et montrent ce qu'ils veulent : va à la table, note la commande et prépare-la au comptoir en fusionnant deux cafés pareils pour monter de niveau. Ensuite, apporte-le au client !"],
    "Bom trabalho! Anote os pedidos nas mesas e prepare na bancada.": ["Good job! Take the orders at the tables and make them at the prep counter.", "¡Buen trabajo! Anota los pedidos en las mesas y prepáralos en la barra.", "Buon lavoro! Prendi gli ordini ai tavoli e preparali al bancone.", "Bon travail ! Note les commandes aux tables et prépare-les au comptoir."],
    "Boa! Vou abrir as portas. Os clientes já vão chegar.": ["Great! I'll open the doors. Customers will arrive soon.", "¡Bien! Voy a abrir las puertas. Los clientes ya van a llegar.", "Bene! Apro le porte. I clienti arriveranno presto.", "Super ! J'ouvre les portes. Les clients vont arriver."],
    "A bancada é usada no seu turno.": ["The prep counter is used during your shift.", "La barra se usa en tu turno.", "Il bancone si usa durante il tuo turno.", "Le comptoir sert pendant ton service."],
    "Cafeteria fechada. Abre às 8h.": ["Café closed. Opens at 8 AM.", "Cafetería cerrada. Abre a las 8h.", "Caffetteria chiusa. Apre alle 8.", "Café fermé. Ouvre à 8 h."],
    "Sair agora encerra o seu turno: você só ganha os 20 fakes do dia, sem nenhum adicional pelos clientes atendidos.": ["Leaving now ends your shift: you only get the 20 fakes for the day, with no extra for the customers served.", "Salir ahora termina tu turno: solo ganas los 20 fakes del día, sin ningún adicional por los clientes atendidos.", "Uscire ora chiude il tuo turno: guadagni solo i 20 fakes del giorno, senza extra per i clienti serviti.", "Sortir maintenant termine ton service : tu ne gagnes que les 20 fakes du jour, sans bonus pour les clients servis."],
    "Sair mesmo assim": ["Leave anyway", "Salir igual", "Esci comunque", "Sortir quand même"],
    "Já são 20h, vamos fechar! Até amanhã!": ["It's already 8 PM, we're closing! See you tomorrow!", "¡Ya son las 20h, vamos a cerrar! ¡Hasta mañana!", "Sono già le 20, chiudiamo! A domani!", "Il est déjà 20 h, on ferme ! À demain !"],
    "Seu personagem ainda não comeu hoje.": ["Your character hasn't eaten today yet.", "Tu personaje todavía no comió hoy.", "Il tuo personaggio non ha ancora mangiato oggi.", "Ton personnage n'a pas encore mangé aujourd'hui."],
    "Fome": ["Hunger", "Hambre", "Fame", "Faim"],
    // (5.1.1) expediente com relógio, nome do café tocado e salário 20 + 5 por pedido
    'Sair mais cedo': ['Leave early', 'Salir antes', 'Esci prima', 'Partir plus tôt'],
    'Sair? Perde os 20 do dia': ['Leave? You lose the 20 for the day', '¿Salir? Pierdes los 20 del día', 'Uscire? Perdi i 20 del giorno', 'Partir ? Tu perds les 20 du jour'],
    'Pedido': ['Order', 'Pedido', 'Ordine', 'Commande'],
    'fim às {0}': ['ends at {0}', 'termina a las {0}', 'fine alle {0}', 'fin à {0}'],
    'Atendidos: {0} · Ganho: {1} fakes': ['Served: {0} · Earned: {1} fakes', 'Atendidos: {0} · Ganado: {1} fakes', 'Serviti: {0} · Guadagno: {1} fakes', 'Servis : {0} · Gain : {1} fakes'],
    'Toque num café para ver o nome dele.': ['Tap a coffee to see its name.', 'Toca un café para ver su nombre.', 'Tocca un caffè per vedere il nome.', 'Touche un café pour voir son nom.'],
    'Junte com outro igual: vira {0}': ['Merge with another one: becomes {0}', 'Júntalo con otro igual: se vuelve {0}', 'Uniscilo a un altro uguale: diventa {0}', 'Fusionne avec un autre pareil : devient {0}'],
    'O melhor café da casa!': ['The best coffee in the house!', '¡El mejor café de la casa!', 'Il miglior caffè della casa!', 'Le meilleur café de la maison !'],
    'Virou: {0}': ['Became: {0}', 'Se volvió: {0}', 'È diventato: {0}', 'Devenu : {0}'],
    'Fim do expediente!': ['End of the shift!', '¡Fin del turno!', 'Fine del turno!', 'Fin du service !'],
    'Acabou o seu turno de hoje! Você atendeu {0} pedidos: toma, {1} fakes. Até a próxima!': ['Your shift is over for today! You served {0} orders: here, {1} fakes. See you next time!', '¡Se acabó tu turno de hoy! Atendiste {0} pedidos: toma, {1} fakes. ¡Hasta la próxima!', 'Il tuo turno di oggi è finito! Hai servito {0} ordini: tieni, {1} fakes. Alla prossima!', 'Ton service est fini pour aujourd\'hui ! Tu as servi {0} commandes : tiens, {1} fakes. À la prochaine !'],
    'Já vai? Tudo bem... pelos {0} pedidos, toma {1} fakes. Até amanhã!': ['Leaving already? Okay... for the {0} orders, here are {1} fakes. See you tomorrow!', '¿Ya te vas? Está bien... por los {0} pedidos, toma {1} fakes. ¡Hasta mañana!', 'Te ne vai già? Va bene... per i {0} ordini, tieni {1} fakes. A domani!', 'Tu pars déjà ? D\'accord... pour les {0} commandes, voilà {1} fakes. À demain !'],
    'Você ganha {0} fakes pelo dia e mais {1} por pedido atendido.': ['You earn {0} fakes for the day plus {1} for each order served.', 'Ganas {0} fakes por el día y {1} más por cada pedido atendido.', 'Guadagni {0} fakes al giorno più {1} per ogni ordine servito.', 'Tu gagnes {0} fakes par jour, plus {1} par commande servie.'],
    'Falar com a Lúcia': ['Talk to Lúcia', 'Hablar con Lúcia', 'Parla con Lúcia', 'Parler à Lúcia'],
    'Oi! Seja bem-vindo à cafeteria. Posso te ajudar com alguma coisa?': ['Hi! Welcome to the café. Can I help you with something?', '¡Hola! Bienvenido a la cafetería. ¿Te puedo ayudar en algo?', 'Ciao! Benvenuto nella caffetteria. Posso aiutarti con qualcosa?', 'Salut ! Bienvenue au café. Je peux t\'aider avec quelque chose ?'],
    'Espera... {0}?! Não acredito que é você!': ['Wait... {0}?! I can\'t believe it\'s you!', '¿Espera... {0}?! ¡No puedo creer que seas tú!', 'Aspetta... {0}?! Non ci credo che sei tu!', 'Attends... {0} ?! Je n\'arrive pas à croire que c\'est toi !'],
    'A quanto tempo você mora aqui?': ['How long have you lived here?', '¿Hace cuánto que vives aquí?', 'Da quanto tempo vivi qui?', 'Depuis quand habites-tu ici ?'],
    'Acabei de me mudar para a cidade.': ['I just moved to town.', 'Me acabo de mudar a la ciudad.', 'Mi sono appena trasferito in città.', 'Je viens juste de m\'installer en ville.'],
    'Que ótimo, vamos trabalhar juntos então! Quer dizer... vai ser bom ter companhia aqui, isso sim.': ['That\'s great, we\'ll work together then! I mean... it\'ll be nice having company around here, that\'s all.', '¡Qué bueno, entonces vamos a trabajar juntos! Es decir... va a estar bueno tener compañía aquí, eso sí.', 'Che bello, allora lavoreremo insieme! Cioè... sarà bello avere compagnia qui, ecco.', 'Super, on va travailler ensemble alors ! Je veux dire... ça va être sympa d\'avoir de la compagnie ici, c\'est tout.'],
    'Eu também fico feliz de ver você': ['I\'m happy to see you too', 'Yo también estoy feliz de verte', 'Anche io sono felice di vederti', 'Moi aussi je suis content(e) de te voir'],
    'Como funciona o trabalho?': ['How does the job work?', '¿Cómo funciona el trabajo?', 'Come funziona il lavoro?', 'Comment fonctionne le travail ?'],
    'A-ah... é... deixa eu te explicar como funciona por aqui.': ['A-ah... right... let me explain how things work around here.', 'A-ah... sí... déjame explicarte cómo funciona esto.', 'A-ah... sì... lascia che ti spieghi come funziona qui.', 'A-ah... oui... laisse-moi t\'expliquer comment ça marche ici.'],
    'Deixa eu te explicar como funciona por aqui.': ['Let me explain how things work around here.', 'Déjame explicarte cómo funciona esto.', 'Lascia che ti spieghi come funziona qui.', 'Laisse-moi t\'expliquer comment ça marche ici.'],
    'Ei, você não estudou lá na escola comigo? A gente se conhece. Você lembra de mim?': ['Hey, didn\'t you go to school with me? We know each other. Do you remember me?', 'Ey, ¿no estudiaste en la escuela conmigo? Nos conocemos. ¿Te acuerdas de mí?', 'Ehi, non hai studiato a scuola con me? Ci conosciamo. Ti ricordi di me?', 'Hé, tu n\'as pas étudié à l\'école avec moi ? On se connaît. Tu te souviens de moi ?'],
    'Sim, me lembro': ['Yes, I remember', 'Sí, me acuerdo', 'Sì, mi ricordo', 'Oui, je me souviens'],
    'Não, não lembro': ["No, I don't remember", 'No, no me acuerdo', 'No, non mi ricordo', 'Non, je ne me souviens pas'],
    'Que bom te ver de novo! Deixa eu te explicar como funciona o trabalho aqui.': ['Good to see you again! Let me explain how the job works here.', '¡Qué bueno verte de nuevo! Déjame explicarte cómo funciona el trabajo aquí.', 'Che bello rivederti! Lascia che ti spieghi come funziona il lavoro qui.', 'Content(e) de te revoir ! Laisse-moi t\'expliquer comment marche le travail ici.'],
    'Ah... tudo bem, faz tempo mesmo. Deixa eu te explicar como funciona o trabalho aqui.': ['Ah... that\'s okay, it has been a while. Let me explain how the job works here.', 'Ah... está bien, ha pasado tiempo. Déjame explicarte cómo funciona el trabajo aquí.', 'Ah... va bene, è passato tempo. Lascia che ti spieghi come funziona il lavoro qui.', 'Ah... c\'est pas grave, ça fait longtemps. Laisse-moi t\'expliquer comment marche le travail ici.'],
    'Você me parece familiar, mas não sei de onde... Enfim, deixa eu te explicar como funciona o trabalho aqui.': ['You look familiar, but I don\'t know from where... Anyway, let me explain how the job works here.', 'Me pareces familiar, pero no sé de dónde... En fin, déjame explicarte cómo funciona el trabajo aquí.', 'Mi sembri familiare, ma non so da dove... Comunque, lascia che ti spieghi come funziona il lavoro qui.', 'Tu me sembles familier(ère), mais je ne sais pas d\'où... Bref, laisse-moi t\'expliquer comment marche le travail ici.'],
    'O expediente é das 8h às 16h. Quando um cliente chegar, vá até a bancada e prepare o pedido num joguinho de combinar cafés: junte dois iguais para subir de nível, até chegar no que foi pedido.': ["The shift runs from 8 AM to 4 PM. When a customer arrives, go to the counter and make the order in a little coffee-matching game: combine two of the same kind to level up, until you reach what was ordered.", 'El turno es de 8h a 16h. Cuando llegue un cliente, ve al mostrador y prepara el pedido en un jueguito de combinar cafés: junta dos iguales para subir de nivel, hasta llegar a lo que se pidió.', "Il turno è dalle 8 alle 16. Quando arriva un cliente, vai al bancone e prepara l'ordine in un mini gioco di unione dei caffè: unisci due uguali per salire di livello, finché non arrivi a quello richiesto.", "Le service va de 8h à 16h. Quand un client arrive, va au comptoir et prépare la commande dans un petit jeu de fusion de cafés : combine deux identiques pour monter de niveau, jusqu'à obtenir ce qui a été commandé."],
    'Você só começa a trabalhar a partir de amanhã. Pode voltar aqui!': ["You only start working tomorrow. You can come back here!", 'Recién empiezas a trabajar a partir de mañana. ¡Puedes volver aquí!', "Inizierai a lavorare solo da domani. Puoi tornare qui!", "Tu ne commences à travailler qu'à partir de demain. Tu peux revenir ici !"],
    'Já fechamos o seu turno de hoje. Até amanhã!': ["We already closed your shift for today. See you tomorrow!", 'Ya cerramos tu turno de hoy. ¡Hasta mañana!', "Abbiamo già chiuso il tuo turno di oggi. A domani!", "On a déjà fermé ton service d'aujourd'hui. À demain !"],
    'O expediente é das 8h às 16h. Volta nesse horário!': ["The shift runs from 8 AM to 4 PM. Come back during that time!", 'El turno es de 8h a 16h. ¡Vuelve en ese horario!', "Il turno è dalle 8 alle 16. Torna in quell'orario!", "Le service va de 8h à 16h. Reviens à cette heure-là !"],
    'Quer começar o seu turno agora?': ['Do you want to start your shift now?', '¿Quieres empezar tu turno ahora?', 'Vuoi iniziare il tuo turno adesso?', 'Tu veux commencer ton service maintenant ?'],
    'Sim, vamos trabalhar': ["Yes, let's work", 'Sí, vamos a trabajar', 'Sì, andiamo a lavorare', 'Oui, allons travailler'],
    'Ainda não': ['Not yet', 'Todavía no', 'Non ancora', 'Pas encore'],
    'Acabou o seu turno de hoje! Toma, {0} fakes. Até a próxima!': ["Your shift for today is over! Here, {0} fakes. See you next time!", '¡Terminó tu turno de hoy! Toma, {0} fakes. ¡Hasta la próxima!', "Il tuo turno di oggi è finito! Ecco, {0} fakes. Alla prossima!", "Ton service d'aujourd'hui est terminé ! Tiens, {0} fakes. À la prochaine !"],
    'Expediente da cafeteria': ['Café shift', 'Turno de la cafetería', 'Turno in caffetteria', 'Service au café'],
    'Clientes atendidos: {0}': ['Customers served: {0}', 'Clientes atendidos: {0}', 'Clienti serviti: {0}', 'Clients servis : {0}'],
    'Pedido: {0}': ['Order: {0}', 'Pedido: {0}', 'Ordine: {0}', 'Commande : {0}'],
    'Gerar cafezinho': ['Make coffee', 'Generar cafecito', 'Prepara un caffè', 'Préparer un café'],
    'Servir': ['Serve', 'Servir', 'Servi', 'Servir'],
    'Sair do expediente': ['Leave the shift', 'Salir del turno', 'Esci dal turno', 'Quitter le service'],
    'Cafezinho preto': ['Black coffee', 'Cafecito negro', 'Caffè nero', 'Café noir'],
    'Café com leite': ['Coffee with milk', 'Café con leche', 'Caffè con latte', 'Café au lait'],
    'Café cremoso': ['Creamy coffee', 'Café cremoso', 'Caffè cremoso', 'Café crémeux'],
    'Cremoso com borda de chocolate': ['Creamy with chocolate rim', 'Cremoso con borde de chocolate', 'Cremoso con bordo di cioccolato', 'Crémeux avec bord de chocolat'],
    'Borda de chocolate e chantilly': ['Chocolate rim and whipped cream', 'Borde de chocolate y chantillí', 'Bordo di cioccolato e panna', 'Bord de chocolat et chantilly'],
    'Cappuccino': ['Cappuccino', 'Capuchino', 'Cappuccino', 'Cappuccino'],
    'Cappuccino com borda de chocolate': ['Cappuccino with chocolate rim', 'Capuchino con borde de chocolate', 'Cappuccino con bordo di cioccolato', 'Cappuccino avec bord de chocolat'],
    'Cappuccino com chantilly e borda de chocolate': ['Cappuccino with whipped cream and chocolate rim', 'Capuchino con chantillí y borde de chocolate', 'Cappuccino con panna e bordo di cioccolato', 'Cappuccino avec chantilly et bord de chocolat'],
  });
  for (const k of Object.keys(TRAD_CD)) if (!I18N[k]) I18N[k] = TRAD_CD[k];
  const nomeJog = () => PERSONAGEM.apelido || PERSONAGEM.nome || T('Você');

  // ------------------------------------------------------------------ números "aleatórios" fixos (a cidade é sempre igual)
  function semente(s) { return () => { s |= 0; s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  // ------------------------------------------------------------------ a PLANTA (em pixels da prancha: 5 px = 1 m; x de 0 a 1200, y de 0 a 760)
  const PX = (px) => px / 5 - 120, PZ = (py) => py / 5 - 76;
  const R = (l, t, w, h) => ({ x0: PX(l), x1: PX(l + w), z0: PZ(t), z1: PZ(t + h) });
  const LIM = { x0: -120, x1: 120, z0: -76, z1: 76 };
  const RUAS_TERRA = [R(295, 0, 26, 760), R(872, 0, 26, 760), R(0, 190, 600, 22), R(0, 560, 900, 22), R(388, 582, 14, 34), R(1030, 338, 30, 24)];
  const AV = { z0: -3.2, z1: 7.2, zc: 2 };                         // asfalto (sem as calçadas)
  const PISTAS = [{ z: 4.6, dir: 1 }, { z: -0.6, dir: -1 }];        // mão direita: quem vai para leste (+x) anda no lado sul (+z)
  const CALCADAS = [];                                             // calçadas elevadas (12 cm), com os vãos onde as ruas de terra cruzam
  {
    const vaos = [[-61, -55.8], [54.4, 59.6]];
    const faixa = (z0, z1) => { let x = -120; for (const [a, b] of vaos) { CALCADAS.push({ x0: x, x1: a, z0, z1, y: 0.12 }); x = b; } CALCADAS.push({ x0: x, x1: 120, z0, z1, y: 0.12 }); };
    faixa(-5.1, AV.z0); faixa(AV.z1, 10.5);
  }
  const PRACA = R(540, 228, 220, 127), PRACA_C = { x: PX(649), z: PZ(292) };
  const VARZEA = R(905, 150, 285, 190), VARZEA_L = R(925, 168, 245, 150);
  const SOCIETY = R(925, 535, 260, 175), SOCIETY_L = R(945, 553, 220, 140);
  const FUTSAL = R(335, 438, 140, 92), FUTSAL_L = R(346, 449, 118, 70);
  const LAGO = { cx: PX(260), cz: PZ(670), rx: 30, rz: 14 };
  const LANCHE = R(788, 432, 74, 48);                                 // (4.9.5) o balcão do seu Valdemar (frente para o norte, a porta de serviço fica 4,6 m do lado)
  const PIER = { x0: -54, x1: -37, z0: 54.4, z1: 56.2 };
  const SPAWN = { x: -78.8, z: -4.65 };                             // na porta do prédio (calçada norte)

  // ------------------------------------------------------------------ geometria: caixas e quadriláteros coloridos numa malha só
  const hexN = (h) => (typeof h === 'number' ? h : parseInt(String(h).slice(1), 16));
  const escurece = (h, k) => { const n = hexN(h); return (Math.round(((n >> 16) & 255) * k) << 16) | (Math.round(((n >> 8) & 255) * k) << 8) | Math.round((n & 255) * k); };
  class Geo {
    constructor() { this.p = []; this.n = []; this.c = []; }
    _cor(c) { const n = hexN(c); return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; }
    // quatro cantos em volta da face; "fora" diz para que lado ela olha (a ordem é corrigida sozinha)
    quad(a, b, c, d, cor, fora) {
      let ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2]; const vx = d[0] - a[0], vy = d[1] - a[1], vz = d[2] - a[2];
      let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      if (fora && nx * fora[0] + ny * fora[1] + nz * fora[2] < 0) { const t = b; b = d; d = t; nx = -nx; ny = -ny; nz = -nz; }
      const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
      const k = this._cor(cor);
      for (const v of [a, b, c, a, c, d]) { this.p.push(v[0], v[1], v[2]); this.n.push(nx, ny, nz); this.c.push(k[0], k[1], k[2]); }
      return this;
    }
    tri(a, b, c, cor, fora) {
      let ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2]; const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
      let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      if (fora && nx * fora[0] + ny * fora[1] + nz * fora[2] < 0) { const t = b; b = c; c = t; nx = -nx; ny = -ny; nz = -nz; }
      const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
      const k = this._cor(cor);
      for (const v of [a, b, c]) { this.p.push(v[0], v[1], v[2]); this.n.push(nx, ny, nz); this.c.push(k[0], k[1], k[2]); }
      return this;
    }
    // caixa com a BASE em y (vai de y até y + h); topo pode ter outra cor
    box(w, h, d, cor, x, y, z, topo) {
      const x0 = x - w / 2, x1 = x + w / 2, y0 = y, y1 = y + h, z0 = z - d / 2, z1 = z + d / 2;
      this.quad([x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], cor, [1, 0, 0]);
      this.quad([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], cor, [-1, 0, 0]);
      this.quad([x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0], topo == null ? cor : topo, [0, 1, 0]);
      if (y0 > 0.05) this.quad([x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], escurece(cor, 0.7), [0, -1, 0]);
      this.quad([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], cor, [0, 0, 1]);
      this.quad([x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], cor, [0, 0, -1]);
      return this;
    }
    get vazio() { return !this.p.length; }
    malha(mat) {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3));
      g.setAttribute('normal', new THREE.Float32BufferAttribute(this.n, 3));
      g.setAttribute('color', new THREE.Float32BufferAttribute(this.c, 3));
      return new THREE.Mesh(g, mat);
    }
  }

  // ------------------------------------------------------------------ texturas (canvas, pixeladas de perto e suaves de longe)
  function texCanvas(w, h, desenhar, mip) {
    const c = document.createElement('canvas'); c.width = w; c.height = h; desenhar(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c); t.magFilter = THREE.NearestFilter;
    if (mip) { t.minFilter = THREE.LinearMipmapLinearFilter; t.generateMipmaps = true; } else { t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; }
    return t;
  }
  // granulado: cada pixel fica um pouco mais claro/escuro (o "pixel art" do chão)
  function granular(g, w, h, forca, rnd) {
    const im = g.getImageData(0, 0, w, h), d = im.data;
    for (let i = 0; i < d.length; i += 4) {
      const k = 1 + (rnd() - 0.5) * forca;
      d[i] = Math.min(255, d[i] * k); d[i + 1] = Math.min(255, d[i + 1] * k); d[i + 2] = Math.min(255, d[i + 2] * k);
    }
    g.putImageData(im, 0, 0);
  }
  const VERDE = '#78a54c', TERRA = '#c39a63', ASFALTO = '#5f6267', CALCADA = '#8a8d92', PISO_PRACA = '#ddd2b6';

  const TONS_GRAMA = ['#6f9c45', '#78a54c', '#82ae53', '#6a943f', '#8db75a', '#739f48', '#7fa94f', '#668f3c'];
  const TONS_TERRA = ['#c39a63', '#b98f58', '#cda56c', '#ad8450', '#d4b07a', '#bd9460', '#c8a068'];
  // grama: cada quadradinho de 0,6 m ganha um tom (alguns viram blocos 2×1, 1×2, 2×2); "emenda" = textura que se repete (sem blocos na borda)
  function quadradinhosGrama(g, rnd, x0, z0, W, H, gx, gz, sx, sz, emenda) {
    const c = 0.6, nx = Math.round(W / c), nz = Math.round(H / c), cw = W / nx, ch = H / nz;
    for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
      if (rnd() < 0.42) continue;
      const bw = !emenda || i < nx - 1 ? (rnd() < 0.22 ? 2 : 1) : 1, bh = !emenda || j < nz - 1 ? (rnd() < 0.22 ? 2 : 1) : 1;
      g.fillStyle = TONS_GRAMA[Math.floor(rnd() * TONS_GRAMA.length)];
      const x = x0 + i * cw, z = z0 + j * ch;
      g.fillRect(Math.floor(gx(x)), Math.floor(gz(z)), Math.ceil(cw * bw * sx), Math.ceil(ch * bh * sz));
    }
    for (let k = 0; k < W * H / 30; k++) {                         // touceiras: 2–4 quadradinhos escuros juntos
      const x = x0 + rnd() * W, z = z0 + rnd() * H; g.fillStyle = rnd() < 0.5 ? '#5a8436' : '#4f7a30';
      for (let q = 0; q < 2 + rnd() * 3; q++) g.fillRect(Math.floor(gx(x + (rnd() - 0.5) * 1.2)), Math.floor(gz(z + (rnd() - 0.5) * 1.2)), Math.ceil(0.3 * sx), Math.ceil(0.3 * sz));
    }
  }
  // rua de terra "de verdade": quadradinhos de terra, bordas tortas e tufos de grama no meio (mais perto das bordas)
  function ruaDeTerra(g, r, gx, gz, sx, sz) {
    const rnd = semente(Math.round(r.x0 * 13 + r.z0 * 7) + 999), c = 0.6;
    const vert = (r.z1 - r.z0) > (r.x1 - r.x0), comp = vert ? r.z1 - r.z0 : r.x1 - r.x0, larg = vert ? r.x1 - r.x0 : r.z1 - r.z0;
    const lim = Math.min(1.0, larg * 0.15), n = Math.ceil(comp / c) + 1;
    let a = 0, b = 0;
    for (let i = 0; i < n; i++) {
      a = clamp(a + (rnd() - 0.5) * 0.7, -lim, lim); b = clamp(b + (rnd() - 0.5) * 0.7, -lim, lim);
      const lo = (vert ? r.x0 : r.z0) + a, hi = (vert ? r.x1 : r.z1) + b, ao = (vert ? r.z0 : r.x0) + i * c;
      for (let t = lo; t < hi; t += c) {
        const borda = Math.min(t - lo, hi - t) < 0.7, verde = rnd() < (borda ? 0.22 : 0.035);
        g.fillStyle = verde ? TONS_GRAMA[Math.floor(rnd() * TONS_GRAMA.length)] : TONS_TERRA[Math.floor(rnd() * TONS_TERRA.length)];
        const w = Math.min(c, hi - t);
        if (vert) g.fillRect(Math.floor(gx(t)), Math.floor(gz(ao)), Math.ceil(w * sx), Math.ceil(c * sz));
        else g.fillRect(Math.floor(gx(ao)), Math.floor(gz(t)), Math.ceil(c * sx), Math.ceil(w * sz));
      }
    }
    for (let k = 0; k < comp / 6; k++) {                               // marcas de pneu e poças secas (quadradinhos escuros em fila)
      const p = rnd() * comp, q = 0.25 + rnd() * (larg - 0.5), tom = rnd() < 0.6 ? '#9c7445' : '#d9b67f';
      g.fillStyle = tom; for (let m = 0; m < 3; m++) { const ao = (vert ? r.z0 : r.x0) + p + m * c, la = (vert ? r.x0 : r.z0) + q; if (vert) g.fillRect(Math.floor(gx(la)), Math.floor(gz(ao)), Math.ceil(0.3 * sx), Math.ceil(c * sz)); else g.fillRect(Math.floor(gx(ao)), Math.floor(gz(la)), Math.ceil(c * sx), Math.ceil(0.3 * sz)); }
    }
  }
  // O CHÃO DA CIDADE: uma textura só (2048 × 1024) com tudo pintado — nada de plano em cima de plano.
  function texChao() {
    const TW = 2048, TH = 1024, sx = TW / 240, sz = TH / 152;
    const gx = (x) => (x + 120) * sx, gz = (z) => (z + 76) * sz;
    return texCanvas(TW, TH, (g) => {
      const rnd = semente(77);
      const ret = (r, cor) => { g.fillStyle = cor; g.fillRect(gx(r.x0), gz(r.z0), (r.x1 - r.x0) * sx, (r.z1 - r.z0) * sz); };
      const elip = (cx, cz, rx, rz, cor) => { g.fillStyle = cor; g.beginPath(); g.ellipse(gx(cx), gz(cz), rx * sx, rz * sz, 0, 0, Math.PI * 2); g.fill(); };
      // GRAMA em quadradinhos de tons diferentes (0,6 m), alguns juntos em blocos maiores, e touceiras escuras
      g.fillStyle = VERDE; g.fillRect(0, 0, TW, TH);
      quadradinhosGrama(g, rnd, -120, -76, 240, 152, gx, gz, sx, sz);
      // ruas de TERRA: quadradinhos de terra de vários tons, borda torta (anda aos poucos para dentro e para fora) e tufos verdes no meio
      for (const r of RUAS_TERRA) ruaDeTerra(g, r, gx, gz, sx, sz);
      // areia em volta do lago (a água é um volume à parte, 5 cm acima)
      elip(LAGO.cx, LAGO.cz, LAGO.rx + 2.2, LAGO.rz + 2.2, '#d7c28a'); elip(LAGO.cx, LAGO.cz, LAGO.rx + 0.3, LAGO.rz + 0.3, '#6c7b56');
      // várzea: terra batida, carecas e linhas de cal gastas
      ret(VARZEA, '#b98a52');
      for (let i = 0; i < 70; i++) { g.globalAlpha = 0.4; elip(VARZEA.x0 + 3 + rnd() * 51, VARZEA.z0 + 3 + rnd() * 32, 0.8 + rnd() * 3, 0.6 + rnd() * 2, rnd() < 0.5 ? '#a57643' : '#cfa46c'); }
      for (let i = 0; i < 30; i++) { g.globalAlpha = 0.5; elip(VARZEA.x0 + rnd() * 57, rnd() < 0.5 ? VARZEA.z0 + rnd() * 3 : VARZEA.z1 - rnd() * 3, 1 + rnd() * 2, 0.5 + rnd(), '#8fae55'); }
      g.globalAlpha = 0.85; g.strokeStyle = '#efe6cc'; g.lineWidth = 0.14 * sx;
      { const L = VARZEA_L, cz = (L.z0 + L.z1) / 2, cx = (L.x0 + L.x1) / 2;
        g.strokeRect(gx(L.x0), gz(L.z0), (L.x1 - L.x0) * sx, (L.z1 - L.z0) * sz);
        g.beginPath(); g.moveTo(gx(cx), gz(L.z0)); g.lineTo(gx(cx), gz(L.z1)); g.stroke();
        g.beginPath(); g.ellipse(gx(cx), gz(cz), 5 * sx, 5 * sz, 0, 0, Math.PI * 2); g.stroke();
        g.strokeRect(gx(L.x0), gz(cz - 8), 10 * sx, 16 * sz); g.strokeRect(gx(L.x1 - 10), gz(cz - 8), 10 * sx, 16 * sz);
        g.strokeRect(gx(L.x0), gz(cz - 3.5), 3.5 * sx, 7 * sz); g.strokeRect(gx(L.x1 - 3.5), gz(cz - 3.5), 3.5 * sx, 7 * sz); }
      g.globalAlpha = 1;
      // praça: grama mais clara, borda calçada, caminhos em cruz e o círculo do meio
      ret(PRACA, '#8cc266');
      ret({ x0: PRACA.x0, x1: PRACA.x1, z0: PRACA.z0, z1: PRACA.z0 + 1.4 }, PISO_PRACA); ret({ x0: PRACA.x0, x1: PRACA.x1, z0: PRACA.z1 - 1.4, z1: PRACA.z1 }, PISO_PRACA);
      ret({ x0: PRACA.x0, x1: PRACA.x0 + 1.4, z0: PRACA.z0, z1: PRACA.z1 }, PISO_PRACA); ret({ x0: PRACA.x1 - 1.4, x1: PRACA.x1, z0: PRACA.z0, z1: PRACA.z1 }, PISO_PRACA);
      ret({ x0: PRACA.x0, x1: PRACA.x1, z0: PRACA_C.z - 1.4, z1: PRACA_C.z + 1.4 }, PISO_PRACA); ret({ x0: PRACA_C.x - 1.4, x1: PRACA_C.x + 1.4, z0: PRACA.z0, z1: PRACA.z1 }, PISO_PRACA);
      elip(PRACA_C.x, PRACA_C.z, 5.5, 5.5, PISO_PRACA);
      // adro da igreja (piso na frente dela, ligando à praça)
      ret({ x0: 1, x1: 17, z0: -35.6, z1: PRACA.z0 }, PISO_PRACA);
      // calçadas (por baixo do volume de 12 cm: a cor só aparece se algo olhar por baixo)
      for (const c of CALCADAS) ret(c, CALCADA);
      // a AVENIDA (asfalto, bordas brancas, faixa amarela tracejada e faixa de pedestre na frente da praça)
      ret({ x0: -120, x1: 120, z0: AV.z0, z1: AV.z1 }, ASFALTO);
      for (let i = 0; i < 260; i++) { g.globalAlpha = 0.18; elip(-120 + rnd() * 240, AV.z0 + 0.5 + rnd() * 9.4, 0.5 + rnd() * 2, 0.3 + rnd() * 0.8, rnd() < 0.5 ? '#4c4f54' : '#777a7f'); }
      g.globalAlpha = 1;
      ret({ x0: -120, x1: 120, z0: AV.z0 + 0.25, z1: AV.z0 + 0.4 }, '#e9e6dc'); ret({ x0: -120, x1: 120, z0: AV.z1 - 0.4, z1: AV.z1 - 0.25 }, '#e9e6dc');
      for (let x = -120; x < 120; x += 8) ret({ x0: x, x1: x + 4, z0: AV.zc - 0.09, z1: AV.zc + 0.09 }, '#f2c230');
      ret({ x0: 6, x1: 13, z0: AV.zc - 0.12, z1: AV.zc + 0.12 }, ASFALTO);
      for (let z = AV.z0 + 0.6; z < AV.z1 - 0.5; z += 1.0) ret({ x0: 7.5, x1: 11.5, z0: z, z1: z + 0.5 }, '#efece2');
      granular(g, TW, TH, 0.12, rnd);
    }, true);
  }
  // fora da cidade: grama e estrada que se repetem (mesmo estilo)
  const texGrama = () => { const t = texCanvas(64, 64, (g, w, h) => {          // 64 px = 10,7 m (o mesmo tamanho de quadradinho da cidade)
    const rnd = semente(5), k = w / 10.7; g.fillStyle = VERDE; g.fillRect(0, 0, w, h);
    quadradinhosGrama(g, rnd, 0, 0, 10.7, 10.7, (x) => x * k, (z) => z * k, k, k, true); granular(g, w, h, 0.1, rnd); }, true); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
  const texEstrada = () => { const t = texCanvas(64, 64, (g, w, h) => {      // 64 px = 8 m (ao longo) × 10,4 m (de lado)
    const rnd = semente(9), py = h / 10.4; g.fillStyle = ASFALTO; g.fillRect(0, 0, w, h);
    g.fillStyle = '#e9e6dc'; g.fillRect(0, Math.round(0.25 * py), w, 1); g.fillRect(0, Math.round((10.4 - 0.4) * py), w, 1);
    g.fillStyle = '#f2c230'; g.fillRect(0, Math.round(5.2 * py) - 1, w / 2, 1);
    granular(g, w, h, 0.12, rnd);
  }, true); t.wrapS = THREE.RepeatWrapping; return t; };
  // alambrado (losangos de arame) e rede do gol: transparentes no vão (alphaTest: sem ordem de transparência, sem piscar)
  const texTela = (cor, passo) => { const t = texCanvas(16, 16, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = cor; for (let i = 0; i < 16; i++) { g.fillRect(i, i, 1, 1); g.fillRect(15 - i, i, 1, 1); } if (passo) { g.fillRect(0, 0, 16, 1); } }, false); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
  // (4.9.5) calçada: lajotas quadradas (0,75 m), cada uma com um tom, rejunte escuro e pontinhos de sujeira
  const texCalcada = () => { const t = texCanvas(64, 64, (g, w, h) => {
    const rnd = semente(88), tons = ['#7c7f85', '#72757b', '#85888e', '#696c72', '#797c83', '#80838a'];     // (4.9.6) tons de cinza escuros o bastante para a luz do dia não estourar
    g.fillStyle = '#4d5056'; g.fillRect(0, 0, w, h);
    for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) {
      g.fillStyle = tons[Math.floor(rnd() * tons.length)]; g.fillRect(i * 16 + 1, j * 16 + 1, 15, 15);
      g.fillStyle = 'rgba(255,255,255,0.20)'; g.fillRect(i * 16 + 1, j * 16 + 1, 15, 1); g.fillRect(i * 16 + 1, j * 16 + 1, 1, 15);
      g.fillStyle = 'rgba(0,0,0,0.10)'; g.fillRect(i * 16 + 1, j * 16 + 15, 15, 1); g.fillRect(i * 16 + 15, j * 16 + 1, 1, 15);
      if (rnd() < 0.55) { g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(i * 16 + 3 + Math.floor(rnd() * 9), j * 16 + 3 + Math.floor(rnd() * 9), 2, 2); }
    }
    granular(g, w, h, 0.06, rnd);
  }, true); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
  // (4.9.5) píer: tábuas juntas (4 por metro e vinte), frestinha, veios e pregos nas pontas
  const texTabuas = () => { const t = texCanvas(64, 32, (g, w, h) => {
    const rnd = semente(55), tons = ['#a8763f', '#9a6a3a', '#b0804a', '#8f6234', '#a06e3c'];
    for (let i = 0; i < 4; i++) {
      g.fillStyle = tons[Math.floor(rnd() * tons.length)]; g.fillRect(i * 16, 0, 16, h);
      g.fillStyle = 'rgba(0,0,0,0.30)'; g.fillRect(i * 16, 0, 1, h); g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(i * 16 + 1, 0, 1, h);
      for (let k = 0; k < 6; k++) { g.fillStyle = rnd() < 0.5 ? 'rgba(0,0,0,0.14)' : 'rgba(255,255,255,0.11)'; g.fillRect(i * 16 + 2 + Math.floor(rnd() * 12), Math.floor(rnd() * h), 1, 3 + Math.floor(rnd() * 6)); }
      g.fillStyle = '#4a3320'; for (const px of [3, 11]) for (const py of [2, h - 4]) g.fillRect(i * 16 + px, py, 2, 2);
    }
  }, true); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
  // (4.9.5) a água do lago: pixels quadrados, mais azul-escuro quanto mais para o meio (mais fundo), 6 degraus de profundidade e espuma na beira
  const AGUA_TONS = ['#17467f', '#1f5a9a', '#2a70b4', '#3a88c8', '#52a0d6', '#74b9e2'];
  const texAgua = () => texCanvas(128, 60, (g, w, h) => {
    const rnd = semente(66);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const nx = ((x + 0.5) / w) * 2 - 1, ny = ((y + 0.5) / h) * 2 - 1, r = Math.hypot(nx, ny);
      let i = Math.min(5, Math.floor(r * 6.2)); if (rnd() < 0.16) i = Math.max(0, Math.min(5, i + (rnd() < 0.5 ? -1 : 1)));
      g.fillStyle = AGUA_TONS[i]; g.fillRect(x, y, 1, 1);
      if (r > 0.9 && r < 1 && rnd() < 0.3) { g.fillStyle = '#d6eef7'; g.fillRect(x, y, 1, 1); }
    }
  }, false);
  // ondinhas: tracinhos claros (transparentes no resto), duas camadas que andam devagar em sentidos diferentes
  const texOndas = (seed, cor) => { const t = texCanvas(64, 32, (g, w, h) => {
    const rnd = semente(seed); g.clearRect(0, 0, w, h); g.fillStyle = cor;
    for (let k = 0; k < 34; k++) { const x = Math.floor(rnd() * w), y = Math.floor(rnd() * h), n = 2 + Math.floor(rnd() * 4); g.fillRect(x, y, n, 1); if (rnd() < 0.5) g.fillRect(x + 1, y + 1, Math.max(1, n - 2), 1); }
  }, false); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
  const texPersiana = () => { const t = texCanvas(8, 16, (g, w, h) => {
    for (let j = 0; j < h; j++) { g.fillStyle = j % 2 ? '#8c9199' : '#7b8189'; g.fillRect(0, j, w, 1); }
    g.fillStyle = '#5c6168'; for (let j = 0; j < h; j += 2) g.fillRect(0, j, w, 1);
  }, false); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
  // brilho redondo (poça de luz no chão e halo da lâmpada): centro claro e quente, borda transparente
  const texBrilho = () => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,238,175,0.95)'); gr.addColorStop(0.35, 'rgba(255,214,130,0.45)'); gr.addColorStop(1, 'rgba(255,200,110,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c); return t; };
  // placas das lojas: texto pixelado
  function texLetreiro(txt, fundo, frente, wM, hM) {
    const W = Math.max(32, Math.round(wM * 20)), H = Math.max(12, Math.round(hM * 20));
    return texCanvas(W, H, (g) => {
      g.fillStyle = fundo; g.fillRect(0, 0, W, H);
      g.fillStyle = frente; g.fillRect(0, 0, W, 1); g.fillRect(0, H - 1, W, 1); g.fillRect(0, 0, 1, H); g.fillRect(W - 1, 0, 1, H);
      let tam = Math.floor(H * 0.62); g.textAlign = 'center'; g.textBaseline = 'middle';
      const fonte = (t) => 'bold ' + t + "px Silkscreen, 'Courier New', monospace";
      g.font = fonte(tam); while (tam > 6 && g.measureText(txt).width > W - 6) { tam--; g.font = fonte(tam); }
      g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillText(txt, W / 2 + 1, H / 2 + 2); g.fillStyle = frente; g.fillText(txt, W / 2, H / 2 + 1);
    }, true);
  }
  // pisos das quadras (a quadra inteira numa textura: as linhas não ficam "por cima")
  const texSociety = () => texCanvas(256, 512, (g, w, h) => {           // (4.9.3) 25 × 35 m, campo de 18 × 30 (comprido em z)
    const rnd = semente(31), sx = w / 25, sz = h / 35;
    for (let i = 0; i < 9; i++) { g.fillStyle = i % 2 ? '#4f9a3f' : '#5aa848'; g.fillRect(0, i * 4 * sz, w, 4 * sz + 1); }
    g.strokeStyle = '#f4f4ec'; g.lineWidth = 2; const X = (m) => (m + 3.5) * sx, Z = (m) => (m + 2.5) * sz;
    g.strokeRect(X(0), Z(0), 18 * sx, 30 * sz); g.beginPath(); g.moveTo(X(0), Z(15)); g.lineTo(X(18), Z(15)); g.stroke();
    g.beginPath(); g.ellipse(X(9), Z(15), 3 * sx, 3 * sz, 0, 0, Math.PI * 2); g.stroke();
    g.strokeRect(X(4), Z(0), 10 * sx, 5 * sz); g.strokeRect(X(4), Z(25), 10 * sx, 5 * sz);
    g.fillStyle = '#f4f4ec'; g.fillRect(X(9) - 1, Z(8) - 1, 3, 3); g.fillRect(X(9) - 1, Z(22) - 1, 3, 3);
    granular(g, w, h, 0.08, rnd);
  }, true);
  const texFutsal = () => texCanvas(256, 256, (g, w, h) => {
    const rnd = semente(41), sx = w / 28, sz = h / 18.4;
    g.fillStyle = '#9aa3a8'; g.fillRect(0, 0, w, h);
    const X = (m) => (m + 2.2) * sx, Z = (m) => (m + 2.2) * sz;
    g.fillStyle = '#d07a33'; g.fillRect(X(0), Z(0), 23.6 * sx, 14 * sz);
    g.fillStyle = '#3d6f9e'; g.beginPath(); g.ellipse(X(0), Z(7), 5 * sx, 5.5 * sz, 0, -Math.PI / 2, Math.PI / 2); g.fill(); g.beginPath(); g.ellipse(X(23.6), Z(7), 5 * sx, 5.5 * sz, 0, Math.PI / 2, Math.PI * 1.5); g.fill();
    g.strokeStyle = '#f4f4ec'; g.lineWidth = 2;
    g.strokeRect(X(0), Z(0), 23.6 * sx, 14 * sz); g.beginPath(); g.moveTo(X(11.8), Z(0)); g.lineTo(X(11.8), Z(14)); g.stroke();
    g.beginPath(); g.ellipse(X(11.8), Z(7), 2.6 * sx, 2.6 * sz, 0, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.ellipse(X(0), Z(7), 5 * sx, 5.5 * sz, 0, -Math.PI / 2, Math.PI / 2); g.stroke(); g.beginPath(); g.ellipse(X(23.6), Z(7), 5 * sx, 5.5 * sz, 0, Math.PI / 2, Math.PI * 1.5); g.stroke();
    granular(g, w, h, 0.08, rnd);
  }, true);
  const texBandeira = () => texCanvas(40, 28, (g, w, h) => {
    g.fillStyle = '#1f9a4a'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#f2d230'; g.beginPath(); g.moveTo(w / 2, 3); g.lineTo(w - 4, h / 2); g.lineTo(w / 2, h - 3); g.lineTo(4, h / 2); g.closePath(); g.fill();
    g.fillStyle = '#23408f'; g.beginPath(); g.arc(w / 2, h / 2, 6.5, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#f4f4ec'; g.fillRect(w / 2 - 6, h / 2 - 1, 12, 1);
  }, false);

  // ------------------------------------------------------------------ peças de prédio (no "referencial" do prédio: frente = +z)
  // face: 'f' frente (+z), 'b' fundos (-z), 'r' direita (+x), 'l' esquerda (-x). u = posição ao longo da face; fora = quanto o CENTRO sai da parede.
  function naFace(G, w, d, face, u, y, fora, sw, sh, sd, cor) {
    if (face === 'f') G.box(sw, sh, sd, cor, u, y, d / 2 + fora);
    else if (face === 'b') G.box(sw, sh, sd, cor, u, y, -d / 2 - fora);
    else if (face === 'r') G.box(sd, sh, sw, cor, w / 2 + fora, y, u);
    else G.box(sd, sh, sw, cor, -w / 2 - fora, y, u);
  }
  // janela: moldura (frente a +5 cm), vidro (+7 cm) e peitoril (+15 cm) — nenhuma face no plano da parede
  function janela(G, w, d, face, u, y, jw, jh, moldura, vidro) {
    naFace(G, w, d, face, u, y - 0.1, 0, jw + 0.2, jh + 0.2, 0.1, moldura || '#f4f2ea');
    const h = Math.sin(u * 12.9898 + y * 78.233 + w * 3.71 + d * 1.37 + face.charCodeAt(0) * 0.7) * 43758.5453, acesa = G.vid && h - Math.floor(h) < 0.55;   // (5.0.1) ~55% das janelas acendem à noite
    naFace(acesa ? G.vid : G, w, d, face, u, y, 0, jw, jh, 0.14, vidro || '#4f6f86');
    if (jw > 0.7) naFace(G, w, d, face, u, y + jh * 0.48, 0, 0.07, jh * 0.04 + 0.03, 0.16, moldura || '#f4f2ea');
    naFace(G, w, d, face, u, y - 0.16, 0.04, jw + 0.34, 0.08, 0.22, moldura || '#f4f2ea');
  }
  function porta(G, w, d, face, u, pw, ph, cor, moldura) {
    naFace(G, w, d, face, u, 0, 0, pw + 0.18, ph + 0.09, 0.1, moldura || '#f4f2ea');
    naFace(G, w, d, face, u, 0, 0, pw, ph, 0.14, cor);
    naFace(G, w, d, face, u + pw * 0.32, ph * 0.47, 0.08, 0.08, 0.08, 0.06, '#d8c070');   // maçaneta
  }
  // telhado de duas águas. eixo 'x' = cumeeira paralela à frente (caem frente e fundos); 'z' = cumeeira de frente para trás
  function telhado(G, w, d, h, rh, e, cor, eixo, corOitao) {
    const inf = escurece(cor, 0.55);
    if (eixo === 'x') {
      const yE = h - e * rh / (d / 2), xa = -w / 2 - e, xb = w / 2 + e, top = h + rh;
      for (const s of [1, -1]) {
        const a = [xa, yE, s * (d / 2 + e)], b = [xb, yE, s * (d / 2 + e)], c = [xb, top, 0], dd = [xa, top, 0];
        G.quad(a, b, c, dd, cor, [0, 1, s]); G.quad(a, b, c, dd, inf, [0, -1, -s]);
        G.box(xb - xa + 0.04, 0.16, 0.08, escurece(cor, 0.8), 0, yE - 0.12, s * (d / 2 + e + 0.02));           // testeira
      }
      for (const s of [1, -1]) G.tri([s * w / 2, h, d / 2], [s * w / 2, h, -d / 2], [s * w / 2, top, 0], corOitao, [s, 0, 0]);
      G.box(xb - xa + 0.1, 0.14, 0.34, escurece(cor, 0.85), 0, top - 0.1, 0);                              // cumeeira
    } else {
      const yE = h - e * rh / (w / 2), za = -d / 2 - e, zb = d / 2 + e, top = h + rh;
      for (const s of [1, -1]) {
        const a = [s * (w / 2 + e), yE, za], b = [s * (w / 2 + e), yE, zb], c = [0, top, zb], dd = [0, top, za];
        G.quad(a, b, c, dd, cor, [s, 1, 0]); G.quad(a, b, c, dd, inf, [-s, -1, 0]);
        G.box(0.08, 0.16, zb - za + 0.04, escurece(cor, 0.8), s * (w / 2 + e + 0.02), yE - 0.12, 0);
      }
      for (const s of [1, -1]) G.tri([w / 2, h, s * d / 2], [-w / 2, h, s * d / 2], [0, top, s * d / 2], corOitao, [0, 0, s]);
      G.box(0.34, 0.14, zb - za + 0.1, escurece(cor, 0.85), 0, top - 0.1, 0);
    }
  }
  // toldo listrado na frente (de y = ya, saindo p metros e caindo 0,55)
  function toldo(G, w, d, u, larg, ya, p, cores) {
    const n = Math.max(2, Math.round(larg / 0.9)), lw = larg / n, z0 = d / 2 + 0.02, z1 = d / 2 + p, y1 = ya - 0.55;
    for (let i = 0; i < n; i++) {
      const xa = u - larg / 2 + i * lw, xb = xa + lw, cor = cores[i % cores.length];
      G.quad([xa, y1, z1], [xb, y1, z1], [xb, ya, z0], [xa, ya, z0], cor, [0, 1, 1]);
      G.quad([xa, y1, z1], [xb, y1, z1], [xb, ya, z0], [xa, ya, z0], escurece(cor, 0.6), [0, -1, -1]);
      G.box(lw - 0.005, 0.3, 0.05, cor, (xa + xb) / 2, y1 - 0.29, z1 + 0.025);                               // babado
    }
  }
  function caixaDagua(G, x, y, z, cor) { G.box(1.8, 1.25, 1.8, cor || '#3a6fb0', x, y, z); G.box(1.95, 0.14, 1.95, escurece(cor || '#3a6fb0', 0.85), x, y + 1.24, z); }

  // ------------------------------------------------------------------ o mundo: materiais, listas de colisão e de câmera
  let MAT = null, MAT_DUPLO = null;
  const descartaveis = [];                      // texturas e materiais criados aqui (soltos na saída)
  function guardar(o) { descartaveis.push(o); return o; }
  function addMalha(G, x, z, rotY) { if (G.vazio) return null; const m = G.malha(MAT); m.position.set(x, 0, z); m.rotation.y = rotY || 0; S.grupo.add(m); return m; }
  const bloquear = (x0, x1, z0, z1, h) => { S.col.push({ x0, x1, z0, z1 }); if (!h) return null; const b = { x0, x1, z0, z1, y0: 0, y1: h }; S.camBox.push(b); return b; };
  // o que pode ficar entre a câmera e o jogador: some (fica translúcido) como UMA peça só (ver atualizarOclusao)
  const oclusor = (b, mesh, mats) => { if (b && mesh) S.oclusores.push({ b, mesh, mats: mats || [], a: 1, fade: false, matF: null, pre: null }); };

  // Prédio genérico. o = { r, frente: 1 (olha para +z) | -1, h, cor, ... }; desenha no referencial do prédio e gira.
  function edificio(o) {
    const r = o.r, w = r.x1 - r.x0, d = r.z1 - r.z0, cx = (r.x0 + r.x1) / 2, cz = (r.z0 + r.z1) / 2, G = new Geo();
    const h = o.h, cor = o.cor;
    if (o.nicho) {                                                    // (4.9.3) vão de verdade na frente (o balcão do lanche): o corpo é montado em pedaços em volta dele
      const N = o.nicho, zf = d / 2 - N.prof / 2, xl = N.u - N.larg / 2, xr = N.u + N.larg / 2;
      G.box(w, h, d - N.prof, cor, 0, 0, -N.prof / 2, '#9a968c');
      if (xl > -w / 2 + 0.01) G.box(xl + w / 2, h, N.prof, cor, (-w / 2 + xl) / 2, 0, zf, '#9a968c');
      if (xr < w / 2 - 0.01) G.box(w / 2 - xr, h, N.prof, cor, (xr + w / 2) / 2, 0, zf, '#9a968c');
      G.box(N.larg, h - N.alt, N.prof, cor, N.u, N.alt, zf, '#9a968c');
    } else G.box(w, h, d, cor, 0, 0, 0, '#9a968c');
    { const bc = o.barrado || escurece(cor, 0.72);                      // (4.9.5) com vão (o balcão) o barrado também é em pedaços: antes uma caixa inteira cobria o vão e escondia as pernas do seu Valdemar
      if (o.nicho) { const N = o.nicho, zf = d / 2 - N.prof / 2, xl = N.u - N.larg / 2, xr = N.u + N.larg / 2;
        G.box(w + 0.08, 0.9, d - N.prof + 0.08, bc, 0, 0, -N.prof / 2);
        if (xl > -w / 2 + 0.01) G.box(xl + w / 2 + 0.08, 0.9, N.prof + 0.04, bc, (xl - w / 2) / 2, 0, zf + 0.02);
        if (xr < w / 2 - 0.01) G.box(w / 2 - xr + 0.08, 0.9, N.prof + 0.04, bc, (xr + w / 2) / 2, 0, zf + 0.02);
      } else G.box(w + 0.08, 0.9, d + 0.08, bc, 0, 0, 0); }
    if (o.andares > 1) for (let a = 1; a < o.andares; a++) G.box(w + 0.06, 0.2, d + 0.06, o.faixa || escurece(cor, 0.85), 0, a * (h / o.andares) - 0.1, 0);
    G.vid = new Geo();                                                // (5.0.1) os vidros que acendem à noite ficam numa peça à parte (material com brilho)
    if (o.montar) o.montar(G, w, d, h);
    if (o.fundos !== false) {                                         // janelas nos fundos e nos lados (prédios comerciais: ninguém fica "cego" de costas)
      for (const f of ['b', 'l', 'r']) { const L = f === 'b' ? w : d, n = Math.floor((L - 2) / 4); if (n < 1) continue;
        for (let a = 0; a < (o.andares || 1); a++) for (let i = 0; i < n; i++) janela(G, w, d, f, -L / 2 + (L / n) * (i + 0.5), a * (h / (o.andares || 1)) + 1.2, 1.0, 0.9); }
    }
    if (!o.telhado && o.equipamentos !== false && w > 8) {            // em cima da laje: caixa d'água e ar-condicionado
      caixaDagua(G, -w * 0.28, h + 0.45, -d * 0.2); G.box(1.0, 0.7, 0.8, '#d8d8d0', w * 0.25, h + 0.45, -d * 0.25); G.box(0.9, 0.6, 0.7, '#cfcfc6', w * 0.1, h + 0.45, d * 0.05);
    }
    let topo = h;
    if (o.telhado) { telhado(G, w, d, h, o.telhado.rh, o.telhado.e || 0.45, o.telhado.cor || '#b5552e', o.telhado.eixo || 'x', cor); topo = h + o.telhado.rh; }
    else { G.box(w + 0.14, 0.55, d + 0.14, o.platibanda || escurece(cor, 0.92), 0, h - 0.06, 0, '#8d8a82'); topo = h + 0.5; }
    const mesh = addMalha(G, cx, cz, o.frente < 0 ? Math.PI : 0), placas = [];
    if (mesh && G.vid.p.length) {                                     // vidros acesos: todos os prédios numa malha só (1 desenho para a cidade inteira)
      const V = S.vidros || (S.vidros = new Geo()), sg = o.frente < 0 ? -1 : 1, P = G.vid.p, N = G.vid.n;
      for (let i = 0; i < P.length; i += 3) { V.p.push(cx + sg * P[i], P[i + 1], cz + sg * P[i + 2]); V.n.push(sg * N[i], N[i + 1], sg * N[i + 2]); }
      for (const c of G.vid.c) V.c.push(c);
    }
    if (o.letreiro && mesh) {
      const L = o.letreiro, tex = guardar(texLetreiro(L.txt, L.fundo, L.cor, L.w, L.h));
      const mf = guardar(new THREE.MeshLambertMaterial({ map: tex, emissive: 0x000000, emissiveMap: tex })), mb = guardar(new THREE.MeshLambertMaterial({ color: hexN(L.fundo) }));
      (S.letreiros || (S.letreiros = [])).push(mf);
      const placa = new THREE.Mesh(guardar(new THREE.BoxGeometry(L.w, L.h, 0.16)), [mb, mb, mb, mb, mf, mb]);
      placa.position.set(L.u || 0, L.y, d / 2 + (L.fora || 0.16)); mesh.add(placa); placas.push(mb, mf);
    }
    oclusor(bloquear(r.x0, r.x1, r.z0, r.z1, topo), mesh, placas);
    S.planta.push({ r, cor: o.mapa || cor });
    for (const [u, fora, sw, sd] of (o.obst || [])) {             // obstáculos na frente (vasos, bancos): u ao longo da frente, "fora" = distância da parede
      const s = o.frente < 0 ? -1 : 1, x = cx + s * u, z = cz + s * (d / 2 + fora);
      S.col.push({ x0: x - sw / 2, x1: x + sw / 2, z0: z - sd / 2, z1: z + sd / 2 });
    }
    return mesh;
  }

  function casa(r, frente, cor, rnd, especial, marca, dono) {     // (5.4.0) dono: 'cadu' | 'rosa' (não muda o sorteio das casas)
    const w = r.x1 - r.x0, d = r.z1 - r.z0, laje = !especial && rnd() < 0.3, lado = rnd() < 0.5 ? -1 : 1;
    const sg = frente < 0 ? -1 : 1, uP = lado * w * 0.27, cxc = (r.x0 + r.x1) / 2, czc = (r.z0 + r.z1) / 2;   // (4.9.5) onde fica a porta no mundo e onde a pessoa para na frente dela
    const pt = { x: cxc + sg * uP, z: czc + sg * d / 2, sx: cxc + sg * uP, sz: czc + sg * (d / 2 + 0.9), marca: marca || null, especial: typeof especial === 'string' ? especial : (dono || null) };   // (5.2.0) especial: 'joao' | 'alves' (a Lúcia mora na dos Alves)
    (S.casas || (S.casas = [])).push(pt); if (marca === 'valdemar') S.casaValdemar = pt;
    edificio({ r, frente, h: 2.9, cor, andares: 1, fundos: false, equipamentos: false,
      letreiro: marca === 'valdemar' ? { txt: 'VALDEMAR', fundo: '#5b3a22', cor: '#f6e2b8', w: 1.9, h: 0.42, y: 2.5, u: uP, fora: 0.12 } : null,
      telhado: laje ? null : { rh: 1.35, e: 0.4, cor: rnd() < 0.7 ? '#b5552e' : '#9c4a2a', eixo: 'x' },
      platibanda: escurece(cor, 0.95),
      montar: (G) => {
        porta(G, w, d, 'f', lado * w * 0.27, 0.9, 2.1, ['#7a4a2a', '#5b3a22', '#3a5f8a', '#8a2f2a'][Math.floor(rnd() * 4)]);
        janela(G, w, d, 'f', -lado * w * 0.22, 1.0, 1.2, 1.05);
        janela(G, w, d, 'r', 0, 1.0, 1.0, 1.0); janela(G, w, d, 'l', 0, 1.0, 1.0, 1.0);
        if (laje) caixaDagua(G, -lado * w * 0.2, 3.35, -d * 0.15);
        if (especial) { G.box(1.6, 0.12, 1.0, '#a59d8a', lado * w * 0.27, 0, d / 2 + 0.5); }      // degrau na porta (casas do João e dos Alves)
      } });
  }

  // ------------------------------------------------------------------ montagem da cidade
  function montarCidade() {
    const g = S.grupo, rnd = semente(2026);
    // --- chão da cidade (uma textura) e chão de fora (faixas que só se encostam pela borda)
    const texC = guardar(texChao()); S.chaoImg = texC.image;
    const chao = new THREE.Mesh(guardar(new THREE.PlaneGeometry(240, 152)), guardar(new THREE.MeshLambertMaterial({ map: texC })));
    chao.rotation.x = -Math.PI / 2; g.add(chao);
    const tg = guardar(texGrama()), te = guardar(texEstrada());
    const faixaChao = (x0, x1, z0, z1, estrada) => {
      const geo = guardar(new THREE.PlaneGeometry(x1 - x0, z1 - z0)), uv = geo.attributes.uv;
      for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * (x1 - x0) / (estrada ? 8 : 10.7), estrada ? uv.getY(i) : uv.getY(i) * (z1 - z0) / 10.7);
      const m = new THREE.Mesh(geo, guardar(new THREE.MeshLambertMaterial({ map: estrada ? te : tg })));
      m.rotation.x = -Math.PI / 2; m.position.set((x0 + x1) / 2, 0, (z0 + z1) / 2); g.add(m);
    };
    faixaChao(-420, 420, -420, LIM.z0); faixaChao(-420, 420, LIM.z1, 420);
    for (const [a, b] of [[-420, LIM.x0], [LIM.x1, 420]]) { faixaChao(a, b, LIM.z0, AV.z0); faixaChao(a, b, AV.z0, AV.z1, true); faixaChao(a, b, AV.z1, LIM.z1); }
    // --- morros em volta (meio enterrados: cruzam o chão, nunca ficam no mesmo plano)
    const geoMorro = guardar(new THREE.SphereGeometry(1, 12, 7)), matMorro = [guardar(new THREE.MeshLambertMaterial({ color: 0x6f9a4a, flatShading: true })), guardar(new THREE.MeshLambertMaterial({ color: 0x5f8a40, flatShading: true })), guardar(new THREE.MeshLambertMaterial({ color: 0x7ea558, flatShading: true }))];
    const morro = (x, z, rx, ry, rz) => { const m = new THREE.Mesh(geoMorro, matMorro[Math.floor(rnd() * 3)]); m.scale.set(rx, ry, rz); m.position.set(x, -ry * 0.35, z); m.rotation.y = rnd() * 3; g.add(m); };
    for (let i = 0; i < 16; i++) morro(-260 + i * 34 + rnd() * 14, -125 - rnd() * 60, 30 + rnd() * 26, 14 + rnd() * 16, 22 + rnd() * 16);   // ao norte (a "serra" das fotos)
    for (let i = 0; i < 9; i++) morro(-240 + i * 60 + rnd() * 20, 125 + rnd() * 50, 26 + rnd() * 20, 7 + rnd() * 8, 18 + rnd() * 12);
    for (const s of [-1, 1]) for (let i = 0; i < 4; i++) { const z = (i < 2 ? -1 : 1) * (40 + rnd() * 60); morro(s * (175 + rnd() * 50), z, 24 + rnd() * 14, 8 + rnd() * 10, 22 + rnd() * 12); }

    // --- calçadas elevadas (12 cm) com meio-fio mais escuro
    { const tc = guardar(texCalcada()), mTop = guardar(new THREE.MeshLambertMaterial({ map: tc })), mLado = guardar(new THREE.MeshLambertMaterial({ color: 0x6f7278 }));   // (4.9.5) lajotas quadradas no topo (4.9.6: cinza)
      for (const c of CALCADAS) {
        const w = c.x1 - c.x0, d = c.z1 - c.z0, geo = guardar(new THREE.BoxGeometry(w, 0.12, d)), uv = geo.attributes.uv;
        for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / 3 + c.x0 / 3, uv.getY(i) * d / 3);
        const m = new THREE.Mesh(geo, [mLado, mLado, mTop, mLado, mLado, mLado]); m.position.set((c.x0 + c.x1) / 2, 0.06, (c.z0 + c.z1) / 2); g.add(m);
      } }

    // --- prédio do jogador (4 andares, caixa d'água, sacadas, portão de ferro azul aberto)
    edificio({ r: R(150, 268, 112, 87), frente: 1, h: 12, andares: 4, fundos: false, equipamentos: false, cor: '#e6c88e', barrado: '#b48a5a', faixa: '#cfae74',
      montar: (G, w, d) => {
        for (let a = 0; a < 4; a++) for (let i = 0; i < 5; i++) { const u = -w / 2 + 2.3 + i * ((w - 4.6) / 4); if (a === 0 && i === 2) continue; janela(G, w, d, 'f', u, a * 3 + 1.0, 1.3, 1.25); if (a > 0 && i % 2 === 1) { G.box(2.6, 0.14, 1.1, '#cfc7b4', u, a * 3 + 0.05, d / 2 + 0.55); G.box(2.6, 0.9, 0.06, '#5c6670', u, a * 3 + 0.19, d / 2 + 1.07); } }
        for (const f of ['r', 'l', 'b']) for (let a = 0; a < 4; a++) for (let i = 0; i < 4; i++) janela(G, w, d, f, (f === 'b' ? -w / 2 + 3 + i * ((w - 6) / 3) : -d / 2 + 2.5 + i * ((d - 5) / 3)), a * 3 + 1.0, 1.2, 1.2);
        // portão: vão escuro, batente e as duas folhas de grade azuis abertas para dentro da calçada
        naFace(G, w, d, 'f', 0, 0, 0, 2.0, 2.55, 0.1, '#e8e2d2'); naFace(G, w, d, 'f', 0, 0, 0, 1.7, 2.4, 0.14, '#1c1d22');
        G.box(2.4, 0.22, 0.9, '#b8b1a0', 0, 0, d / 2 + 0.45);                                                  // degrau (22 cm: mais alto que a calçada, nunca no mesmo plano)
        caixaDagua(G, -w * 0.25, 12.45, 0); caixaDagua(G, w * 0.2, 12.45, -d * 0.2, '#2f5e9a');
        G.box(3.0, 2.2, 3.0, '#d9c08a', w * 0.3, 12.45, d * 0.2);                                             // casa de máquinas
      } });
    { // o PORTÃO de grade azul: duas folhas com dobradiça, abertas na chegada e fechadas depois que o jogador sai (S.portao.k: 1 aberto, 0 fechado)
      const folha = (s) => { const G = new Geo(), c = -s * 0.425; G.box(0.85, 2.3, 0.06, '#2f5fa8', c, 0.22, 0);
        for (let i = 0; i < 4; i++) G.box(0.05, 2.2, 0.09, '#24497f', c - 0.32 + i * 0.21, 0.27, 0); G.box(0.8, 0.07, 0.09, '#24497f', c, 1.3, 0);
        const m = G.malha(MAT), piv = new THREE.Group(); piv.position.set(SPAWN.x + s * 0.85, 0, -4.89); piv.add(m); g.add(piv); return piv; };
      S.portao = { piv: [folha(-1), folha(1)], k: 1, alvo: 1, col: [{ x0: SPAWN.x - 0.95, x1: SPAWN.x - 0.82, z0: -5.0, z1: -4.0 }, { x0: SPAWN.x + 0.82, x1: SPAWN.x + 0.95, z0: -5.0, z1: -4.0 }] };
    }
    S.pisos.push({ x0: SPAWN.x - 1.2, x1: SPAWN.x + 1.2, z0: -5.0, z1: -4.1, y: 0.22 });                                                         // degrau

    // --- comércio da avenida (lado norte: frente para o sul; lado sul: frente para o norte)
    edificio({ r: R(335, 268, 92, 87), frente: 1, h: 8.5, andares: 1, cor: '#a8443d', barrado: '#6e2a26', platibanda: '#8a3530',
      letreiro: { txt: 'CINEMA', fundo: '#1c1c22', cor: '#f2c230', w: 9, h: 1.6, y: 5.6, fora: 0.5 },
      montar: (G, w, d) => {
        naFace(G, w, d, 'f', 0, 0, 0, 4.2, 2.8, 0.14, '#2c2c34');
        G.box(w - 2, 0.35, 2.2, '#2a2a30', 0, 3.6, d / 2 + 1.1);                                               // marquise
        for (let i = 0; i < 16; i++) G.box(0.14, 0.14, 0.14, '#ffe27a', -w / 2 + 1.4 + i * ((w - 2.8) / 15), 3.45, d / 2 + 2.22);
        for (const s of [-1, 1]) { naFace(G, w, d, 'f', s * 5.2, 0.9, 0.02, 2.1, 2.9, 0.12, '#f2f2ea'); naFace(G, w, d, 'f', s * 5.2, 1.0, 0.03, 1.8, 2.6, 0.14, s < 0 ? '#3a64b8' : '#7a4fb0'); }
        naFace(G, w, d, 'f', -6.8, 0, 0, 1.3, 1.1, 0.5, '#f4efe2');                                             // bilheteria
      } });
    edificio({ r: R(462, 305, 64, 50), frente: 1, h: 6.2, andares: 2, cor: '#f2d27a', faixa: '#e3b95a',
      letreiro: { txt: 'CAFETERIA', fundo: '#5b3a22', cor: '#f6e2b8', w: 7.5, h: 1.0, y: 6.75 },
      montar: (G, w, d) => { porta(G, w, d, 'f', -3.5, 1.4, 2.3, '#6a4428'); naFace(G, w, d, 'f', 2, 0.6, 0, 6, 1.9, 0.14, '#5d7f96');
        toldo(G, w, d, 0, w - 0.6, 2.85, 1.4, ['#6a4428', '#f2e6c8']); for (let i = 0; i < 3; i++) janela(G, w, d, 'f', -4 + i * 4, 4.1, 1.3, 1.3);
        G.box(w - 1, 0.12, 1.0, '#cdbf9f', 0, 3.15, d / 2 + 0.5); G.box(w - 1, 0.85, 0.06, '#3f3a34', 0, 3.27, d / 2 + 0.98); } });
    edificio({ r: R(767, 275, 100, 80), frente: 1, h: 5.2, andares: 1, cor: '#f4efe2', barrado: '#c8352b', platibanda: '#c8352b',
      letreiro: { txt: 'SUPERMERCADO', fundo: '#c8352b', cor: '#fff6e0', w: 11, h: 1.3, y: 4.15 },
      montar: (G, w, d) => { naFace(G, w, d, 'f', -3, 0, 0, 7.5, 2.8, 0.14, '#5d7f96'); naFace(G, w, d, 'f', 5.2, 0, 0, 4.6, 2.8, 0.14, '#5d7f96'); naFace(G, w, d, 'f', 1.6, 0, 0, 2.4, 2.6, 0.18, '#2e3a44');
        for (let i = -2; i <= 2; i++) naFace(G, w, d, 'f', -3 + i * 1.5, 0, 0, 0.08, 2.8, 0.18, '#d8d8d0'); toldo(G, w, d, 0, w - 1, 3.2, 1.3, ['#c8352b', '#f4efe2']); } });
    // (4.9.3) HOSPITAL (perto do prédio do jogador): a saúde do personagem só aparece aqui dentro (ficha médica)
    S.hospital = edificio({ r: { x0: -115, x1: -93, z0: -21, z1: -5 }, frente: 1, h: 7.0, andares: 2, cor: '#f4f6f8', barrado: '#2f6f9a', faixa: '#3a8ac8', mapa: '#e8eef4',
      letreiro: { txt: 'HOSPITAL', fundo: '#f4f6f8', cor: '#c8352b', w: 8, h: 1.2, y: 7.55 },
      montar: (G, w, d) => {
        naFace(G, w, d, 'f', 0, 0, 0, 3.2, 2.6, 0.14, '#7aa2bd'); naFace(G, w, d, 'f', 0, 0, 0.02, 0.08, 2.6, 0.18, '#d8d8d0');
        G.box(5.0, 0.25, 1.6, '#d8dde2', 0, 2.9, d / 2 + 0.8); for (const s of [-2.3, 2.3]) G.box(0.18, 2.78, 0.18, '#d8dde2', s, 0.12, d / 2 + 1.45);   // marquise da entrada
        for (const s of [-1, 1]) for (let i = 0; i < 2; i++) janela(G, w, d, 'f', s * (4.5 + i * 3.6), 1.0, 1.6, 1.2, '#f4f6f8', '#7aa2bd');
        for (let i = 0; i < 5; i++) if (i !== 2) janela(G, w, d, 'f', -8.4 + i * 4.2, 4.5, 1.6, 1.2, '#f4f6f8', '#7aa2bd');
        G.box(1.6, 0.5, 0.2, '#c8352b', 0, 5.75, d / 2 + 0.1); G.box(0.5, 1.6, 0.2, '#c8352b', 0, 5.2, d / 2 + 0.12);   // cruz vermelha
      }, obst: [[-2.3, 1.45, 0.3, 0.3], [2.3, 1.45, 0.3, 0.3]] });
    edificio({ r: R(55, 432, 88, 58), frente: -1, h: 3.6, andares: 1, cor: '#d9c27a', barrado: '#8a6b3a', platibanda: '#c9ae62',
      letreiro: { txt: 'BAR', fundo: '#1f7a4d', cor: '#f2e6c8', w: 4, h: 1.0, y: 3.65 },
      montar: (G, w, d) => { for (const u of [-5, 0, 5]) { naFace(G, w, d, 'f', u, 0, 0, 3.6, 2.7, 0.14, '#24262b'); naFace(G, w, d, 'f', u, 2.35, 0.01, 3.7, 0.4, 0.16, '#8c9199'); } } });
    edificio({ r: R(560, 432, 92, 60), frente: -1, h: 3.9, andares: 1, cor: '#f4efe2', barrado: '#1f7a4d', platibanda: '#c8352b',
      letreiro: { txt: 'PIZZARIA', fundo: '#c8352b', cor: '#f4f4ec', w: 8, h: 1.1, y: 3.95 },
      montar: (G, w, d) => { porta(G, w, d, 'f', 0, 1.6, 2.4, '#7a4a2a'); for (const s of [-1, 1]) naFace(G, w, d, 'f', s * 5, 0.8, 0, 4.5, 1.8, 0.14, '#5d7f96');
        toldo(G, w, d, 0, w - 0.6, 3.2, 1.3, ['#1f7a4d', '#f4f4ec', '#c8352b']); } });
    edificio({ r: R(668, 432, 100, 66), frente: -1, h: 6.4, andares: 2, cor: '#b9dca0', faixa: '#8fbf74', barrado: '#5f8a4a',
      letreiro: { txt: 'RESTAURANTE', fundo: '#f4f4ec', cor: '#1f7a4d', w: 10, h: 1.1, y: 6.95 },
      montar: (G, w, d) => { porta(G, w, d, 'f', 0, 1.8, 2.4, '#5b3a22'); for (const s of [-1, 1]) naFace(G, w, d, 'f', s * 5.5, 0.7, 0, 5, 1.9, 0.14, '#5d7f96');
        toldo(G, w, d, 0, w - 0.6, 2.95, 1.2, ['#1f7a4d', '#e8f2dc']); for (let i = 0; i < 4; i++) janela(G, w, d, 'f', -7.5 + i * 5, 4.3, 1.4, 1.3);
        for (const s of [-1, 1]) { G.box(0.7, 0.6, 0.7, '#9a6a44', s * 2.2, 0, d / 2 + 0.75); G.box(0.8, 0.7, 0.8, '#3f8a3a', s * 2.2, 0.6, d / 2 + 0.75); } },
      obst: [[-2.2, 0.75, 0.8, 0.8], [2.2, 0.75, 0.8, 0.8]] });                                                 // os vasos de planta têm corpo
    const mLanche = edificio({ r: LANCHE, frente: -1, h: 3.4, andares: 1, cor: '#f2b33a', barrado: '#a8442a', platibanda: '#e09a2a',
      letreiro: { txt: 'LANCHE DO SEU VALDEMAR', fundo: '#a8202a', cor: '#ffe9a8', w: 12.5, h: 1.0, y: 3.45 },
      nicho: { u: -2, larg: 7, prof: 2.0, alt: 2.6 },                  // (4.9.3) o balcão é um vão de verdade: o seu Valdemar fica lá dentro
      montar: (G, w, d) => {
        // (4.9.5) balcão de verdade (corpo de madeira + tampo claro), piso de ladrilho no vão e uma bancada atrás com a chapa e a estufa;
        // a porta de serviço (4,6 m do lado) é só o batente e o vão escuro: a folha é uma peça à parte que gira (ver abaixo)
        G.box(7.2, 0.95, 0.5, '#8a5a2b', -2, 0, d / 2 + 0.2, '#8a5a2b'); G.box(7.4, 0.12, 0.7, '#d6c6a6', -2, 0.95, d / 2 + 0.3);
        G.box(6.9, 0.04, 2.0, '#bdb4a0', -2, 0, d / 2 - 1.0);
        naFace(G, w, d, 'f', 4.6, 0, 0, 1.2, 2.3, 0.1, '#f4f2ea'); naFace(G, w, d, 'f', 4.6, 0.12, 0, 1.0, 2.1, 0.12, '#17110c');
        G.box(0.06, 2.2, 1.1, '#f4f2ea', 1.5 - 0.03, 0, d / 2 - 1.0); G.box(0.07, 2.05, 0.92, '#17110c', 1.5 - 0.035, 0, d / 2 - 1.0);   // (4.9.6) a porta de DENTRO (é por ela que o seu Valdemar entra e sai do balcão)
        const zb = d / 2 - 2.0;                                              // parede do fundo do vão
        G.box(6.6, 0.92, 0.7, '#6a4428', -2, 0, zb + 0.4);
        G.box(6.6, 0.1, 0.45, '#6a4428', -2, 1.55, zb + 0.23); G.box(6.6, 0.1, 0.45, '#6a4428', -2, 2.05, zb + 0.23);   // prateleiras
        for (let i = 0; i < 12; i++) G.box(0.12, 0.28, 0.12, ['#c8352b', '#2f8a4a', '#f2c230', '#3a64b8'][i % 4], -5 + i * 0.55, 1.65 + (i % 2) * 0.5, zb + 0.22);
        G.box(1.6, 0.12, 0.7, '#3a3a3e', -4.4, 0.92, zb + 0.6); G.box(1.4, 0.04, 0.6, '#8c9199', -4.4, 1.04, zb + 0.6);   // a chapa
        G.box(0.5, 0.6, 0.35, '#e8e8e0', 0.6, 0.92, zb + 0.35);             // estufa
        for (let i = 0; i < 4; i++) { G.box(0.12, 0.7, 0.12, '#6c6c70', -4.6 + i * 1.7, 0, d / 2 + 1.1); G.box(0.45, 0.1, 0.45, '#c8352b', -4.6 + i * 1.7, 0.7, d / 2 + 1.1); } } });
    { const L = LANCHE, cx = (L.x0 + L.x1) / 2, cz = (L.z0 + L.z1) / 2, d = L.z1 - L.z0;     // as banquetas do balcão (frente virada para o norte: x e z invertem)
      // (4.9.5) porta de serviço com folha que gira + persiana de enrolar do balcão (fecha às 20h; o seu Valdemar sai pela porta)
      { const Gd = new Geo(); Gd.box(1.0, 2.1, 0.07, '#5b3a22', 0.5, 0.12, 0); Gd.box(0.62, 0.9, 0.09, '#6a4a2a', 0.5, 1.15, 0); Gd.box(0.07, 0.07, 0.13, '#d8c070', 0.86, 1.1, 0);
        const piv = new THREE.Group(); piv.position.set(4.1, 0, d / 2 + 0.1); piv.add(Gd.malha(MAT)); mLanche.add(piv);
        const texP = guardar(texPersiana()), geoP = guardar(new THREE.BoxGeometry(6.9, 1, 0.08)); geoP.translate(0, -0.5, 0);
        const per = new THREE.Mesh(geoP, guardar(new THREE.MeshLambertMaterial({ map: texP }))); per.position.set(-2, 2.6, d / 2 + 0.02); per.scale.y = 0.001; per.visible = false; mLanche.add(per);
        const Gi = new Geo(); Gi.box(0.06, 2.0, 0.9, '#6a4a2a', 0, 0.03, -0.45); Gi.box(0.08, 0.9, 0.6, '#7a5a34', 0, 1.1, -0.45); Gi.box(0.1, 0.07, 0.07, '#d8c070', 0, 1.05, -0.8);
        const piv2 = new THREE.Group(); piv2.position.set(1.5 - 0.08, 0, d / 2 - 1.0 + 0.45); piv2.add(Gi.malha(MAT)); mLanche.add(piv2);
        S.loja = { porta: piv, k: 0, alvo: 0, porta2: piv2, k2: 0, alvo2: 0, per, tex: texP, pk: 0, palvo: 0, portaX: cx - 4.6, portaZ: L.z0 }; }
      for (let i = 0; i < 4; i++) { const a = assento(cx - (-4.6 + i * 1.7), cz - (d / 2 + 1.1), 0, 1, 0.8, 'banqueta'); a.lanche = true; S.col.push({ x0: a.x - 0.2, x1: a.x + 0.2, z0: a.z - 0.2, z1: a.z + 0.2 }); }
      // (5.1.0) o próprio balcão (o corpo de madeira + o tampo, montados lá em cima) não tinha colisão: só as banquetas.
      // O tampo é um pouco mais largo que o corpo e sai mais para fora (ver "montar" do mLanche), por isso a caixa é generosa.
      S.col.push({ x0: cx - 1.7, x1: cx + 5.7, z0: cz - d / 2 - 0.7, z1: cz - d / 2 + 0.1 });
      S.balcao = { x: cx + 2.5, z: cz - (d / 2 - 0.9) }; }
    edificio({ r: R(908, 432, 98, 72), frente: -1, h: 6.8, andares: 2, cor: '#5f6b7a', faixa: '#f2c230', barrado: '#3a414b',
      letreiro: { txt: 'ACADEMIA', fundo: '#1c1c1f', cor: '#f2c230', w: 9, h: 1.2, y: 3.45 },
      montar: (G, w, d) => { porta(G, w, d, 'f', -5, 1.8, 2.4, '#2e3a44'); naFace(G, w, d, 'f', 2, 0.5, 0, 9, 2.2, 0.14, '#7aa2bd'); naFace(G, w, d, 'f', 0, 4.0, 0, w - 2, 2.1, 0.14, '#7aa2bd');
        for (let i = -4; i <= 4; i++) naFace(G, w, d, 'f', i * 2.0, 4.0, 0.01, 0.1, 2.1, 0.17, '#2e3a44'); } });
    // mesas de plástico do bar (na calçada) e banquinhos do lanche já estão no prédio; mesas aqui:
    { const G = new Geo(); for (const x of [-102.7, -97.7]) { const z = 9.5; G.box(0.85, 0.06, 0.85, '#d23a2a', x, 0.82, z); G.box(0.08, 0.7, 0.08, '#d23a2a', x, 0.12, z);
        for (const [dx, dz] of [[-0.75, 0], [0.75, 0], [0, -0.75], [0, 0.75]]) {          // cadeiras de plástico (dá para sentar)
          const ux = Math.sign(dx), uz = Math.sign(dz), cxa = x + dx, cza = z + dz;
          G.box(0.45, 0.06, 0.45, '#e8b02a', cxa, 0.5, cza); for (const [lx, lz] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) G.box(0.05, 0.5, 0.05, '#d9a020', cxa + lx, 0, cza + lz);
          G.box(ux ? 0.06 : 0.42, 0.5, ux ? 0.42 : 0.06, '#e8b02a', cxa + ux * 0.21, 0.56, cza + uz * 0.21);
          assento(cxa, cza, -ux, -uz, 0.56, 'cadeira');
        }
        S.col.push({ x0: x - 0.9, x1: x + 0.9, z0: z - 0.9, z1: z + 0.9 }); } addMalha(G, 0, 0); }

    // --- igrejinha (nave branca, torre na frente virada para a praça, cruz)
    { const r = R(610, 140, 70, 62), w = r.x1 - r.x0, d = r.z1 - r.z0;
      edificio({ r, frente: 1, h: 6.5, andares: 1, fundos: false, cor: '#f6f3ea', barrado: '#e2b84a', telhado: { rh: 3.0, e: 0.5, cor: '#a8462a', eixo: 'z' },
        montar: (G) => { for (const f of ['r', 'l']) for (let i = 0; i < 3; i++) janela(G, w, d, f, -d / 2 + 2.5 + i * ((d - 5) / 2), 2.2, 1.0, 2.4, '#e2b84a', '#5a8fc8'); } });
      const tx = (r.x0 + r.x1) / 2, G = new Geo(), tz0 = r.z1 - 0.6, tw = 4.2;
      G.box(tw, 15, tw, '#f6f3ea', tx, 0, tz0 + tw / 2); G.box(tw + 0.08, 0.9, tw + 0.08, '#e2b84a', tx, 0, tz0 + tw / 2);
      for (const y of [6.5, 13]) G.box(tw + 0.1, 0.25, tw + 0.1, '#e2b84a', tx, y, tz0 + tw / 2);
      G.box(1.7, 2.9, 0.14, '#6a3b22', tx, 0, tz0 + tw + 0.0); G.box(1.95, 3.05, 0.1, '#e2b84a', tx, 0, tz0 + tw - 0.0);
      for (const [fx, fz] of [[0, 1], [1, 0], [-1, 0]]) G.box(fz ? 1.1 : 0.14, 1.9, fz ? 0.14 : 1.1, '#3a2a22', tx + fx * tw / 2, 10.3, tz0 + tw / 2 + fz * tw / 2);   // sineiras
      const ty = 15, top = 18.5, a = tw / 2 + 0.2, cz = tz0 + tw / 2;
      const cant = [[tx - a, cz - a], [tx + a, cz - a], [tx + a, cz + a], [tx - a, cz + a]];
      for (let i = 0; i < 4; i++) { const p = cant[i], q = cant[(i + 1) % 4], mx = (p[0] + q[0]) / 2 - tx, mz = (p[1] + q[1]) / 2 - cz; G.tri([p[0], ty, p[1]], [q[0], ty, q[1]], [tx, top, cz], '#a8462a', [mx, 0.6, mz]); }
      G.box(0.16, 1.8, 0.16, '#d8c070', tx, top - 0.1, cz); G.box(0.9, 0.16, 0.16, '#d8c070', tx, top + 1.05, cz);
      oclusor(bloquear(tx - tw / 2, tx + tw / 2, tz0, tz0 + tw, 19), addMalha(G, 0, 0)); S.planta.push({ r: { x0: tx - tw / 2, x1: tx + tw / 2, z0: tz0, z1: tz0 + tw }, cor: '#f6f3ea' }); }

    // --- casas (as do João e dos Alves com a borda dourada da planta: aqui, só um degrau e cores próprias por enquanto)
    { const cores = ['#f4efe2', '#f2d27a', '#a9d3e8', '#f2b8b0', '#b9dca0', '#e8c9a0', '#f6f1e8', '#d8e4ef', '#e9d1f0', '#f0e0a8'];
      const lista = [
        [30, 150, 1], [134, 150, 1], [186, 150, 1], [238, 150, 1], [30, 108, 1], [82, 108, 1], [134, 108, 1], [186, 108, 1], [238, 108, 1], [30, 232, -1], [82, 232, -1],
        [335, 150, 1], [387, 150, 1], [439, 150, 1], [491, 150, 1], [335, 108, 1], [387, 108, 1], [439, 108, 1], [491, 108, 1], [335, 232, -1], [387, 232, -1], [439, 232, -1],
        [720, 150, 1], [772, 150, 1], [824, 150, 1], [720, 108, 1], [772, 108, 1],
        [440, 600, -1], [492, 600, -1], [544, 600, -1], [648, 600, -1], [700, 600, -1], [752, 600, -1], [804, 600, -1],
        [440, 656, 1], [492, 656, 1], [544, 656, 1], [648, 656, 1], [700, 656, 1], [752, 656, 1],
        [170, 510, 1], [222, 510, 1], [30, 510, 1]];
      const DONOS = { '824,150': 'cadu', '544,656': 'rosa' };          // (5.4.0) o Cadu mora pertinho do mercado; a Rosa, do outro lado da avenida
      for (const [l, t, f] of lista) casa(R(l, t, 34, 26), f, cores[Math.floor(rnd() * cores.length)], rnd, false, l === 804 && t === 600 ? 'valdemar' : null, DONOS[l + ',' + t]);   // (4.9.5) a casa do seu Valdemar é a [804, 600]
      casa(R(82, 148, 36, 28), 1, '#f6e7c8', rnd, 'joao');              // casa do João
      casa(R(596, 598, 36, 28), -1, '#cfe3f2', rnd, 'alves');          // casa dos Alves
    }

    // --- praça: canteiro do meio com o mastro e a bandeira, bancos e postes
    { const G = new Geo(), cx = PRACA_C.x, cz = PRACA_C.z;
      const geoC = guardar(new THREE.CylinderGeometry(2.4, 2.4, 0.5, 16)), geoG = guardar(new THREE.CylinderGeometry(2.15, 2.15, 0.56, 16));
      const can = new THREE.Mesh(geoC, guardar(new THREE.MeshLambertMaterial({ color: 0xcfc4a6 }))); can.position.set(cx, 0.25, cz); g.add(can);
      const gra = new THREE.Mesh(geoG, guardar(new THREE.MeshLambertMaterial({ color: 0x5f9a44 }))); gra.position.set(cx, 0.28, cz); g.add(gra);
      G.box(0.16, 10, 0.16, '#d8d8d0', cx, 0.5, cz); G.box(0.3, 0.3, 0.3, '#d8c070', cx, 10.5, cz);
      const band = new THREE.Mesh(guardar(new THREE.PlaneGeometry(2.4, 1.68)), guardar(new THREE.MeshLambertMaterial({ map: guardar(texBandeira()), side: THREE.DoubleSide })));
      band.position.set(cx + 1.3, 9.4, cz); g.add(band); S.bandeira = band;
      S.circ.push({ x: cx, z: cz, r: 2.45 });                         // o canteiro é REDONDO (antes a colisão era um quadrado de 5 m)
      const banco = (x, z, rot) => { const lx = rot ? 0.5 : 1.8, lz = rot ? 1.8 : 0.5; G.box(lx, 0.1, lz, '#8a5a2b', x, 0.42, z); for (const s of [-0.7, 0.7]) G.box(rot ? 0.4 : 0.12, 0.42, rot ? 0.12 : 0.4, '#9a968c', x + (rot ? 0 : s), 0, z + (rot ? s : 0)); S.col.push({ x0: x - lx / 2, x1: x + lx / 2, z0: z - lz / 2, z1: z + lz / 2 });
        // dois lugares, virados para o caminho mais perto (o do meio da praça)
        const fx = rot ? Math.sign(cx - x) || 1 : 0, fz = rot ? 0 : Math.sign(cz - z) || 1, lugares = [];
        for (const t of [-0.45, 0.45]) { const sx = x + (rot ? 0 : t), sz = z + (rot ? t : 0); lugares.push(assento(sx, sz, fx, fz, 0.52, 'banco')); }
        S.bancos.push({ x, z, lugares }); };
      for (const [dx, dz, ro] of [[-6.5, -3, 0], [6.5, -3, 0], [-6.5, 3, 0], [6.5, 3, 0], [-3, -7.5, 1], [3, 7.5, 1], [-14, -3, 0], [14, 3, 0]]) banco(cx + dx, cz + dz, ro);
      const LGp = new Geo(); S.lampMat = guardar(new THREE.MeshBasicMaterial({ vertexColors: true })); S.lampadas = [];
      for (const [dx, dz] of [[-9, -6], [9, -6], [-9, 6], [9, 6], [-20, 2.6], [20, 2.6]]) { G.box(0.14, 4, 0.14, '#3f4348', cx + dx, 0, cz + dz); LGp.box(0.5, 0.45, 0.5, '#f4efc8', cx + dx, 4, cz + dz); S.lampadas.push({ x: cx + dx, y: 4.2, z: cz + dz, px: cx + dx, pz: cz + dz, r: 5.2 }); S.col.push({ x0: cx + dx - 0.2, x1: cx + dx + 0.2, z0: cz + dz - 0.2, z1: cz + dz + 0.2 }); }
      g.add(LGp.malha(S.lampMat)); addMalha(G, 0, 0); }

    // --- postes da avenida (dos dois lados) e ponto de ônibus
    { const G = new Geo(), LG = new Geo();
      for (let x0 = -112; x0 <= 112; x0 += 24) for (const [z, s] of [[-3.55, 1], [7.55, -1]]) { if ((x0 > -63 && x0 < -54) || (x0 > 52 && x0 < 62)) continue;
        const x = x0 === -40 && z < 0 ? -31 : x0;                                    // (4.9.5) o poste que atravessava o cinema foi para depois dele
        G.box(0.18, 7, 0.18, '#7d8288', x, 0.12, z); G.box(0.12, 0.12, 1.6, '#7d8288', x, 6.95, z + s * 0.75); LG.box(0.35, 0.18, 0.6, '#f4efc8', x, 6.8, z + s * 1.5);
        S.lampadas.push({ x, y: 6.75, z: z + s * 1.5, px: x, pz: z + s * 1.2, r: 6.6 });
        S.col.push({ x0: x - 0.2, x1: x + 0.2, z0: z - 0.2, z1: z + 0.2 }); }
      g.add(LG.malha(S.lampMat));
      const bx = -114.6, bz = 9.0;                                       // ponto de ônibus (calçada sul, lado da saída da cidade)
      G.box(3.6, 0.1, 1.9, '#2f6f9a', bx, 2.5, bz); for (const s of [-1.6, 1.6]) G.box(0.1, 2.38, 0.1, '#5c6670', bx + s, 0.12, bz + 0.75);
      G.box(3.4, 1.6, 0.06, '#9ec7dd', bx, 0.75, bz + 0.85); G.box(2.6, 0.08, 0.45, '#8a5a2b', bx, 0.55, bz + 0.5); for (const t of [-0.6, 0.6]) assento(bx + t, bz + 0.45, 0, -1, 0.63, 'banco'); G.box(0.1, 2.6, 0.1, '#5c6670', bx + 2.4, 0.12, bz - 0.2); G.box(0.7, 0.5, 0.06, '#2f6f9a', bx + 2.4, 2.55, bz - 0.2);
      S.col.push({ x0: bx - 1.8, x1: bx + 1.8, z0: bz + 0.5, z1: bz + 0.95 }, { x0: bx + 2.25, x1: bx + 2.55, z0: bz - 0.35, z1: bz - 0.05 });
      addMalha(G, 0, 0); }

    // --- quadra de futsal coberta (piso com as linhas na textura, colunas, telhado de duas águas, gols)
    { const r = FUTSAL, w = r.x1 - r.x0, d = r.z1 - r.z0, cx = (r.x0 + r.x1) / 2, cz = (r.z0 + r.z1) / 2;
      const mt = guardar(new THREE.MeshLambertMaterial({ map: guardar(texFutsal()) })), mc = guardar(new THREE.MeshLambertMaterial({ color: 0x7d868b }));
      const piso = new THREE.Mesh(guardar(new THREE.BoxGeometry(w, 0.1, d)), [mc, mc, mt, mc, mc, mc]); piso.position.set(cx, 0.05, cz); g.add(piso);
      S.pisos.push({ x0: r.x0, x1: r.x1, z0: r.z0, z1: r.z1, y: 0.1 });
      const G = new Geo(), hc = 6.2, rh = 1.8;
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const x = cx + sx * (w / 2 + 0.45), z = cz + sz * (d / 2 + 0.45); G.box(0.4, hc + 0.1, 0.4, '#8c949c', x, 0, z); S.col.push({ x0: x - 0.25, x1: x + 0.25, z0: z - 0.25, z1: z + 0.25 }); }   // (4.9.3) só 4, nos cantos, por fora
      { const e = 0.6, xa = r.x0 - e, xb = r.x1 + e, yE = hc + 0.1 - e * rh / (d / 2), top = hc + 0.1 + rh;
        for (const s of [1, -1]) { const a = [xa, yE, cz + s * (d / 2 + e)], b = [xb, yE, cz + s * (d / 2 + e)], c = [xb, top, cz], dd = [xa, top, cz]; G.quad(a, b, c, dd, '#a7b0b8', [0, 1, s]); G.quad(a, b, c, dd, '#5f666d', [0, -1, -s]); }
        for (const sx of [-1, 1]) G.box(0.2, 0.3, d + 1.1, '#7d868b', cx + sx * (w / 2 + 0.45), hc + 0.1, cz);
        for (const sz of [-1, 1]) G.box(w + 1.1, 0.3, 0.2, '#7d868b', cx, hc + 0.1, cz + sz * (d / 2 + 0.45));
        S.tetoFutsal = { x0: xa, x1: xb, z0: r.z0 - e, z1: r.z1 + e, y0: hc - 0.3, y1: top }; S.camBox.push(S.tetoFutsal); }
      for (const s of [-1, 1]) { const gx = cx + s * 11.8; for (const t of [-1.5, 1.5]) G.box(0.1, 2.0, 0.1, '#f4f4ec', gx + s * 0.05, 0.1, cz + t); G.box(0.1, 0.1, 3.1, '#f4f4ec', gx + s * 0.05, 2.1, cz); }
      oclusor(S.tetoFutsal, addMalha(G, 0, 0));
      cerca(r, 3.0, [{ lado: 'n', a: -41, b: -37 }], 0.1);                    // grade em volta, uma entrada só (do lado da avenida)
      S.redes.push({ x: cx - 11.8, z: cz, larg: 3, alt: 2.0, prof: 1.0, dir: -1, y: 0.1 }, { x: cx + 11.8, z: cz, larg: 3, alt: 2.0, prof: 1.0, dir: 1, y: 0.1 });
      S.quadra = { x0: r.x0 + 0.15, x1: r.x1 - 0.15, z0: r.z0 + 0.15, z1: r.z1 - 0.15, cx, cz, gl: 11.8, gm: 1.45, gp: 1.0 }; }

    // --- (4.9.3) DOIS societys do tamanho de verdade (cada um 25 × 35 m, campo de 30 × 18 no comprimento z), um caminho entre eles
    S.societys = [];
    for (const [x0, x1, portao] of [[SOCIETY.x0, SOCIETY.x0 + 25, [SOCIETY.x0 + 2, SOCIETY.x0 + 5.5]], [SOCIETY.x1 - 25, SOCIETY.x1, [SOCIETY.x1 - 5.5, SOCIETY.x1 - 2]]]) {
      const r = { x0, x1, z0: SOCIETY.z0, z1: SOCIETY.z1 }, w = x1 - x0, d = r.z1 - r.z0, cx = (x0 + x1) / 2, cz = (r.z0 + r.z1) / 2;
      const mt = guardar(new THREE.MeshLambertMaterial({ map: guardar(texSociety()) })), mc = guardar(new THREE.MeshLambertMaterial({ color: 0x3f7a33 }));
      const piso = new THREE.Mesh(guardar(new THREE.BoxGeometry(w, 0.08, d)), [mc, mc, mt, mc, mc, mc]); piso.position.set(cx, 0.04, cz); g.add(piso);
      S.pisos.push({ x0, x1, z0: r.z0, z1: r.z1, y: 0.08 });
      cerca(r, 4.0, [{ lado: 'n', a: portao[0], b: portao[1] }], 0.08);
      const G = new Geo(); for (const sz of [-1, 1]) { const gz = cz + sz * 15; for (const t of [-2.5, 2.5]) G.box(0.12, 2.2, 0.12, '#f4f4ec', cx + t, 0.08, gz); G.box(5.12, 0.12, 0.12, '#f4f4ec', cx, 2.28, gz); }
      addMalha(G, 0, 0);
      S.redes.push({ x: cx, z: cz - 15, larg: 5, alt: 2.2, prof: 1.2, dir: -1, y: 0.08, ez: true }, { x: cx, z: cz + 15, larg: 5, alt: 2.2, prof: 1.2, dir: 1, y: 0.08, ez: true });
      S.societys.push({ r, cx, cz, gate: { out: { x: (portao[0] + portao[1]) / 2, z: r.z0 - 1.4 }, in: { x: (portao[0] + portao[1]) / 2, z: r.z0 + 1.4 } } });   // (4.9.6) o portão: quem sai do campo passa por ele
      S.planta.push({ r, cor: '#4f9a3f', chao: true });
    }

    // --- várzea (o chão já está pintado): alambrado baixo, gols de ferro e o portão do lado da avenida
    { const r = VARZEA, cz = (VARZEA_L.z0 + VARZEA_L.z1) / 2;
      cerca(r, 2.6, [{ lado: 's', a: 86, b: 92 }], 0);
      const G = new Geo(); for (const gx of [VARZEA_L.x0, VARZEA_L.x1]) { for (const t of [-3, 3]) G.box(0.14, 2.2, 0.14, '#c9c9c0', gx, 0, cz + t); G.box(0.14, 0.14, 6.14, '#c9c9c0', gx, 2.2, cz); }
      addMalha(G, 0, 0);
      S.redes.push({ x: VARZEA_L.x0, z: cz, larg: 6, alt: 2.2, prof: 1.3, dir: -1, y: 0 }, { x: VARZEA_L.x1, z: cz, larg: 6, alt: 2.2, prof: 1.3, dir: 1, y: 0 }); }
    redesDosGols();

    // --- lago (água 5 cm acima do chão pintado), píer de madeira e taboas
    { const ta = guardar(texAgua()); S.aguaImg = ta.image;
      const geoA = guardar(new THREE.CircleGeometry(1, 48));
      const agua = new THREE.Mesh(geoA, guardar(new THREE.MeshLambertMaterial({ map: ta, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 })));
      agua.rotation.x = -Math.PI / 2; agua.scale.set(LAGO.rx, LAGO.rz, 1); agua.position.set(LAGO.cx, 0.05, LAGO.cz); g.add(agua); S.agua = agua;
      S.ondas = [];                                                            // duas camadas de ondinhas por cima, andando devagar em sentidos diferentes (pixels quadrados: 64 px = 15 m)
      for (const [seed, cor, rep, vx, vz, o] of [[71, 'rgba(206,238,250,0.55)', [4, 3.75], 0.011, 0.004, 2], [72, 'rgba(150,205,236,0.5)', [3, 2.8], -0.007, 0.009, 3]]) {
        const tx = guardar(texOndas(seed, cor)); tx.repeat.set(rep[0], rep[1]);
        const m = new THREE.Mesh(geoA, guardar(new THREE.MeshLambertMaterial({ map: tx, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 - o, polygonOffsetUnits: -1 - o })));
        m.rotation.x = -Math.PI / 2; m.scale.set(LAGO.rx, LAGO.rz, 1); m.position.set(LAGO.cx, 0.05 + o * 0.002, LAGO.cz); m.renderOrder = o; g.add(m); S.ondas.push({ tx, vx, vz });
      }
      const G = new Geo(), p = PIER, pw = p.x1 - p.x0, pd = p.z1 - p.z0;
      // (4.9.5) o tabuado é uma peça com a textura de tábuas juntas; os pilares sobem MAIS ALTO e mais largos que a tábua e saem para fora da borda (pedaço de madeira passando)
      const mTop = guardar(new THREE.MeshLambertMaterial({ map: guardar(texTabuas()) })), mSide = guardar(new THREE.MeshLambertMaterial({ color: 0x7a4f2a }));
      const geoD = guardar(new THREE.BoxGeometry(pw, 0.12, pd)), uvD = geoD.attributes.uv;
      for (let i = 0; i < uvD.count; i++) uvD.setXY(i, uvD.getX(i) * pw / 1.2, uvD.getY(i));
      const deck = new THREE.Mesh(geoD, [mSide, mSide, mTop, mSide, mSide, mSide]); deck.position.set((p.x0 + p.x1) / 2, 0.36, (p.z0 + p.z1) / 2); g.add(deck);
      for (let x = p.x0 + 0.3; x < p.x1; x += 2.4) for (const s of [-1, 1]) { const z = s < 0 ? p.z0 + 0.03 : p.z1 - 0.03; G.box(0.26, 1.2, 0.26, '#5a3a1e', x, -0.55, z, '#7a5230'); }
      S.pisos.push({ x0: p.x0, x1: p.x1, z0: p.z0, z1: p.z1, y: 0.42 });
      addMalha(G, 0, 0);
      cerquinhasDoLago(rnd); }

    // --- árvores (as da planta + as de fora da cidade)
    { const G = new Geo();
      const arvore = (x, z, k, colide) => {
        const Gt = colide ? new Geo() : G;                                   // (4.9.6) as árvores onde o jogador chega são peças separadas: a copa fica translúcida na frente da câmera
        const tr = 0.32 * k, ht = 2.0 * k; Gt.box(tr, ht, tr, '#6c4a2a', x, 0, z);
        const verdes = ['#3f7a33', '#4f8a3a', '#5a9a44', '#356b2c'];
        const n = 2 + Math.floor(rnd() * 2);
        for (let i = 0; i < n; i++) { const s = (2.6 - i * 0.55 + rnd() * 0.4) * k; Gt.box(s, (1.1 + rnd() * 0.4) * k, s * (0.85 + rnd() * 0.3), verdes[Math.floor(rnd() * 4)], x + (rnd() - 0.5) * 0.5 * k, ht * 0.85 + i * 0.95 * k + rnd() * 0.05, z + (rnd() - 0.5) * 0.5 * k); }
        if (colide) {
          S.col.push({ x0: x - 0.4, x1: x + 0.4, z0: z - 0.4, z1: z + 0.4 }); (S.abrigos || (S.abrigos = [])).push({ x, z, k, slots: [] });
          const mesh = addMalha(Gt, 0, 0), topo = ht * 0.85 + (n - 1) * 0.95 * k + 1.7 * k;
          oclusor({ x0: x - 1.6 * k, x1: x + 1.6 * k, z0: z - 1.6 * k, z1: z + 1.6 * k, y0: 1.5 * k, y1: topo }, mesh);
        }
      };
      const mapa = [[20, 30], [120, 60], [280, 70], [560, 70], [905, 80], [1150, 90], [526, 236], [526, 330], [746, 236], [746, 330], [566, 250], [720, 306], [275, 300], [858, 230], [430, 540], [90, 590], [420, 620], [100, 720], [430, 720], [830, 700], [600, 720], [1100, 725], [10, 700]];
      for (const [px, py] of mapa) arvore(PX(px + 9), PZ(py + 9), 1 + rnd() * 0.4, true);
      for (let i = 0; i < 170; i++) {                                 // fora da cidade (sem colisão: o jogador não chega lá)
        const x = -230 + rnd() * 460, z = -190 + rnd() * 380;
        if (x > LIM.x0 - 3 && x < LIM.x1 + 3 && z > LIM.z0 - 3 && z < LIM.z1 + 3) continue;
        if (Math.abs(z - AV.zc) < 9) continue;
        arvore(x, z, 1 + rnd() * 0.9, false);
      }
      addMalha(G, 0, 0); }
  }
  // alambrado em volta de um retângulo; vaos (portões): [{ lado: 'n'|'s'|'e'|'w', a, b }] em metros (x para n/s, z para e/w)
  function cerca(r, alt, vaos, y0) {
    const G = new Geo(), lados = [['n', r.x0, r.z0, r.x1, r.z0], ['s', r.x0, r.z1, r.x1, r.z1], ['w', r.x0, r.z0, r.x0, r.z1], ['e', r.x1, r.z0, r.x1, r.z1]];
    for (const [lado, ax, az, bx, bz] of lados) {
      const hor = az === bz, ini = hor ? ax : az, fim = hor ? bx : bz, cortes = [];
      for (const v of vaos) if (v.lado === lado) cortes.push([v.a, v.b]);
      const trechos = []; let p = ini; for (const [a, b] of cortes.sort((m, n) => m[0] - n[0])) { trechos.push([p, a]); p = b; } trechos.push([p, fim]);
      for (const [a, b] of trechos) {
        if (b - a < 0.3) continue;
        const L = b - a, n = Math.max(1, Math.round(L / 3));
        for (let i = 0; i <= n; i++) { const t = a + L * i / n, x = hor ? t : ax, z = hor ? az : t; G.box(0.1, alt, 0.1, '#8c949c', x, y0, z); }
        const mx = hor ? (a + b) / 2 : ax, mz = hor ? az : (a + b) / 2;
        G.box(hor ? L : 0.06, 0.06, hor ? 0.06 : L, '#8c949c', mx, y0 + alt - 0.03, mz);
        S.telas.push({ x: mx, z: mz, L, alt, hor, y: y0 });
        if (hor) S.col.push({ x0: a, x1: b, z0: az - 0.12, z1: az + 0.12 }); else S.col.push({ x0: ax - 0.12, x1: ax + 0.12, z0: a, z1: b });
      }
    }
    addMalha(G, 0, 0);
  }
  // telas do alambrado e redes dos gols: planos com textura vazada (alphaTest), UV em metros
  function redesDosGols() {
    const tex = guardar(texTela('#c9ced4')), texR = guardar(texTela('#f4f4ec', true));
    const mT = guardar(new THREE.MeshLambertMaterial({ map: tex, alphaTest: 0.5, side: THREE.DoubleSide }));
    const mR = guardar(new THREE.MeshLambertMaterial({ map: texR, alphaTest: 0.5, side: THREE.DoubleSide }));
    const plano = (w, h, passo, mat) => { const geo = guardar(new THREE.PlaneGeometry(w, h)), uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / passo, uv.getY(i) * h / passo); return new THREE.Mesh(geo, mat); };
    S.telasM = [];                                                     // (5.0.1) desenhadas só com o jogador por perto (atualizarTelas)
    const add = (m, r) => { S.grupo.add(m); S.telasM.push({ m, r }); };
    for (const t of S.telas) { const m = plano(t.L, t.alt - 0.1, 0.7, mT); m.position.set(t.x, t.y + (t.alt - 0.1) / 2 + 0.02, t.z); if (!t.hor) m.rotation.y = Math.PI / 2; add(m, t.L / 2); }
    for (const r of S.redes) {      // fundo, dois lados e teto (a rede fica ATRÁS da linha do gol: nada encosta nas traves)
      const bx = r.x + r.dir * r.prof, y = r.y;
      if (r.ez) {                    // (4.9.3) gol com a linha ao longo de x (societys)
        const f = plano(r.larg, r.alt, 0.25, mR); f.position.set(r.x, y + r.alt / 2, r.z + r.dir * r.prof); add(f, r.larg);
        for (const s of [-1, 1]) { const l = plano(r.prof - 0.08, r.alt, 0.25, mR); l.rotation.y = Math.PI / 2; l.position.set(r.x + s * (r.larg / 2 + 0.03), y + r.alt / 2, r.z + r.dir * (r.prof / 2 + 0.04)); add(l, r.larg); }
        const t = plano(r.larg, r.prof - 0.08, 0.25, mR); t.rotation.x = -Math.PI / 2; t.position.set(r.x, y + r.alt + 0.03, r.z + r.dir * (r.prof / 2 + 0.04)); add(t, r.larg);
        continue;
      }
      const fundo = plano(r.larg, r.alt, 0.25, mR); fundo.position.set(bx, y + r.alt / 2, r.z); fundo.rotation.y = Math.PI / 2; add(fundo, r.larg);
      for (const s of [-1, 1]) { const l = plano(r.prof - 0.08, r.alt, 0.25, mR); l.position.set(r.x + r.dir * (r.prof / 2 + 0.04), y + r.alt / 2, r.z + s * (r.larg / 2 + 0.03)); add(l, r.larg); }
      const teto = plano(r.prof - 0.08, r.larg, 0.25, mR); teto.rotation.x = -Math.PI / 2; teto.position.set(r.x + r.dir * (r.prof / 2 + 0.04), y + r.alt + 0.03, r.z); add(teto, r.larg);
    }
  }
  const DIST_TELAS = 42;
  function atualizarTelas(dt) {
    S.telasT = (S.telasT || 0) - dt; if (S.telasT > 0 || !S.telasM) return; S.telasT = 0.25;
    const J = S.jog; for (const o of S.telasM) { const v = Math.hypot(o.m.position.x - J.x, o.m.position.z - J.z) - o.r < DIST_TELAS; if (o.m.visible !== v) o.m.visible = v; }
  }

  // ------------------------------------------------------------------ (4.9.3) lugares para sentar (bancos, cadeiras, banquetas)
  // fx, fz = para onde a pessoa sentada olha; o ponto de levantar é escolhido na hora (atrás, frente ou dos lados, o que estiver livre)
  function assento(x, z, fx, fz, h, tipo) {
    const a = { x, z, h, tipo, yaw: Math.atan2(-fz, fx), fx, fz, ocupado: null };
    S.assentos.push(a); return a;
  }
  function pontoDeLevantar(a) {
    const op = [[a.fx, a.fz], [-a.fz, a.fx], [a.fz, -a.fx], [-a.fx, -a.fz]];
    for (const [ux, uz] of op) for (const dd of [0.8, 1.1, 1.5]) { const x = a.x + ux * dd, z = a.z + uz * dd; if (livre(x, z)) return { x, z }; }
    return { x: a.x + a.fx * 0.8, z: a.z + a.fz * 0.8 };
  }

  // ------------------------------------------------------------------ (4.9.3) cerquinhas velhas de madeira em volta do lago (poucas, com falhas)
  function cerquinhasDoLago(rnd) {
    const G = new Geo(), tons = ['#8a5a2b', '#7a4f26', '#9c6a38', '#6e4824', '#a8763f', '#5f4022'];
    const pk = () => tons[Math.floor(rnd() * tons.length)];
    // trechos (ângulo inicial e final na elipse, em graus): longe do píer (leste, ~0°) e do caminho do lago (nordeste)
    for (const [a0, a1] of [[150, 185], [205, 230], [250, 275], [100, 122]]) {
      const pts = [];
      for (let a = a0; a <= a1 + 0.01; a += 6) { const t = a * Math.PI / 180; pts.push([LAGO.cx + Math.cos(t) * (LAGO.rx + 1.3), LAGO.cz + Math.sin(t) * (LAGO.rz + 1.3)]); }
      for (let i = 0; i < pts.length; i++) {
        const [x, z] = pts[i], torto = (rnd() - 0.5) * 0.25;
        if (rnd() < 0.12) continue;                                       // mourão que caiu
        G.box(0.14, 0.95 + rnd() * 0.2, 0.14, pk(), x + torto * 0.2, 0, z);
        if (i === pts.length - 1) break;
        const [x2, z2] = pts[i + 1], L = Math.hypot(x2 - x, z2 - z), ux = (x2 - x) / L, uz = (z2 - z) / L;
        for (const y of [0.45, 0.8]) {                                   // duas ripas, em pedaços de tons diferentes (os "quadradinhos")
          if (rnd() < 0.15) continue;                                    // ripa faltando
          const n = Math.max(2, Math.round(L / 0.5));
          for (let j = 0; j < n; j++) {
            const t0 = (j + 0.5) / n, px = x + (x2 - x) * t0, pz = z + (z2 - z) * t0, len = L / n - 0.01, yy = y + (rnd() - 0.5) * 0.03;
            if (Math.abs(ux) > Math.abs(uz)) G.box(len * Math.abs(ux) + 0.02, 0.1, 0.06 + Math.abs(uz) * len, pk(), px, yy, pz);
            else G.box(0.06 + Math.abs(ux) * len, 0.1, len * Math.abs(uz) + 0.02, pk(), px, yy, pz);
          }
        }
        S.col.push({ x0: Math.min(x, x2) - 0.08, x1: Math.max(x, x2) + 0.08, z0: Math.min(z, z2) - 0.08, z1: Math.max(z, z2) + 0.08 });
      }
    }
    addMalha(G, 0, 0);
  }

  // ------------------------------------------------------------------ (4.9.3) PLANTAS COM FÍSICA: graminhas altas pelo gramado e taboas na beira do lago
  // Cada planta é uma instância (InstancedMesh): quando alguém passa perto, ela verga para longe e volta balançando (mola).
  function geoPlanta(alt, n, cor0, cor1) {
    const G = new Geo();
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, r = 0.06, x = Math.cos(a) * r, z = Math.sin(a) * r, h = alt * (0.75 + 0.25 * ((i * 7) % 3) / 2);
      G.box(0.035, h * 0.55, 0.035, cor0, x, 0, z); G.box(0.03, h * 0.45, 0.03, cor1, x * 1.4, h * 0.55, z * 1.4); }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(G.p, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(G.n, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(G.c, 3));
    return guardar(g);
  }
  function lugarDeGrama(x, z) {
    if (x < LIM.x0 + 2 || x > LIM.x1 - 2 || z < LIM.z0 + 2 || z > LIM.z1 - 2) return false;
    if (z > -6 && z < 11) return false;                                   // avenida e calçadas
    for (const r of RUAS_TERRA) if (x > r.x0 - 1 && x < r.x1 + 1 && z > r.z0 - 1 && z < r.z1 + 1) return false;
    for (const r of [PRACA, VARZEA, SOCIETY, FUTSAL]) if (x > r.x0 - 1 && x < r.x1 + 1 && z > r.z0 - 1 && z < r.z1 + 1) return false;
    for (const b of S.col) if (x > b.x0 - 0.8 && x < b.x1 + 0.8 && z > b.z0 - 0.8 && z < b.z1 + 0.8) return false;
    const ex = (x - LAGO.cx) / (LAGO.rx + 3), ez = (z - LAGO.cz) / (LAGO.rz + 3); if (ex * ex + ez * ez < 1) return false;
    return true;
  }
  function criarPlantas() {
    const rnd = semente(3131), lista = [];
    // graminhas: touceiras de 3 a 6 tufos
    let tent = 0; while (lista.length < 620 && tent++ < 6000) {
      const x = LIM.x0 + rnd() * 240, z = LIM.z0 + rnd() * 152; if (!lugarDeGrama(x, z)) continue;
      const n = 3 + Math.floor(rnd() * 4); for (let i = 0; i < n; i++) { const px = x + (rnd() - 0.5) * 1.4, pz = z + (rnd() - 0.5) * 1.4; if (lugarDeGrama(px, pz)) lista.push({ x: px, z: pz, k: 0.7 + rnd() * 0.6, tipo: 0, yaw: rnd() * 6.28, t: 0.85 + rnd() * 0.3 }); }
    }
    // taboas: poucas moitas na beira do lago (antes era uma cerca de taboas em volta inteira)
    for (let i = 0; i < 26; i++) {
      const a = rnd() * Math.PI * 2, x = LAGO.cx + Math.cos(a) * (LAGO.rx + 0.2), z = LAGO.cz + Math.sin(a) * (LAGO.rz + 0.2);
      if (x > PIER.x0 - 3 && z > PIER.z0 - 4 && z < PIER.z1 + 4) continue;
      if (Math.abs(x + 41) < 3 && z < LAGO.cz) continue;                  // o caminho que chega no lago
      for (let j = 0; j < 3 + Math.floor(rnd() * 2); j++) lista.push({ x: x + (rnd() - 0.5) * 0.9, z: z + (rnd() - 0.5) * 0.9, k: 0.85 + rnd() * 0.5, tipo: 1, yaw: rnd() * 6.28, t: 0.85 + rnd() * 0.3 });
    }
    const mat = guardar(new THREE.MeshLambertMaterial({ vertexColors: true }));
    const meshes = [new THREE.InstancedMesh(geoPlanta(0.42, 5, '#4f8a3a', '#8dbb57'), mat, lista.filter((p) => p.tipo === 0).length),
      new THREE.InstancedMesh(geoPlanta(1.35, 4, '#4a7a30', '#7a9a44'), mat, lista.filter((p) => p.tipo === 1).length)];
    const cont = [0, 0], cor = new THREE.Color();
    S.plantas = { lista, meshes, grade: new Map(), m4: new THREE.Matrix4(), q: new THREE.Quaternion(), v: new THREE.Vector3(), e: new THREE.Vector3(), ativos: new Set() };
    for (const p of lista) {
      p.i = cont[p.tipo]++; p.bx = 0; p.bz = 0; p.vx = 0; p.vz = 0;
      const k = (Math.floor(p.x / 4)) + ',' + (Math.floor(p.z / 4)); if (!S.plantas.grade.has(k)) S.plantas.grade.set(k, []); S.plantas.grade.get(k).push(p);
      matrizPlanta(p); cor.setRGB(p.t, p.t * (0.95 + Math.random() * 0.1), p.t); meshes[p.tipo].setColorAt(p.i, cor);
    }
    for (const m of meshes) { m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; S.grupo.add(m); }
  }
  function matrizPlanta(p) {
    const P = S.plantas, ang = Math.hypot(p.bx, p.bz);
    if (ang > 1e-4) { P.e.set(p.bz / ang, 0, -p.bx / ang); P.q.setFromAxisAngle(P.e, ang); } else P.q.identity();
    const q2 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), p.yaw); P.q.multiply(q2);
    P.m4.compose(P.v.set(p.x, 0, p.z), P.q, P.e.set(p.k, p.k, p.k));
    P.meshes[p.tipo].setMatrixAt(p.i, P.m4);
  }
  function tickPlantas(dt) {
    const P = S.plantas; if (!P) return;
    const atores = [S.jog, ...S.npcs.filter((A) => !A.sentado)];
    for (const A of atores) {
      const gx = Math.floor(A.x / 4), gz = Math.floor(A.z / 4);
      for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) { const L = P.grade.get((gx + i) + ',' + (gz + j)); if (!L) continue;
        for (const p of L) { const dx = p.x - A.x, dz = p.z - A.z, d = Math.hypot(dx, dz), R = p.tipo ? 0.75 : 0.6;
          if (d < R) { const f = (1 - d / R) * (p.tipo ? 0.8 : 1.1) / Math.max(0.05, d); p.alvoX = (p.alvoX || 0) + dx * f; p.alvoZ = (p.alvoZ || 0) + dz * f; P.ativos.add(p); } } }
    }
    const sujos = new Set();
    for (const p of P.ativos) {                                            // mola: verga para o alvo e volta balançando
      const tx = clamp(p.alvoX || 0, -1.1, 1.1), tz = clamp(p.alvoZ || 0, -1.1, 1.1); p.alvoX = p.alvoZ = 0;
      p.vx += ((tx - p.bx) * 60 - p.vx * 7) * dt; p.vz += ((tz - p.bz) * 60 - p.vz * 7) * dt;
      p.bx += p.vx * dt; p.bz += p.vz * dt;
      matrizPlanta(p); sujos.add(p.tipo);
      if (Math.abs(p.bx) + Math.abs(p.bz) + Math.abs(p.vx) + Math.abs(p.vz) < 0.002 && !tx && !tz) { p.bx = p.bz = p.vx = p.vz = 0; matrizPlanta(p); P.ativos.delete(p); }
    }
    for (const t of sujos) P.meshes[t].instanceMatrix.needsUpdate = true;
  }

  // ------------------------------------------------------------------ (4.9.3) a BOLA da quadra de futsal (física simples) e o gol com comemoração
  const texBolinha = () => texCanvas(32, 16, (g, w, h) => { g.fillStyle = '#f4f4f0'; g.fillRect(0, 0, w, h); g.fillStyle = '#1c1c1f'; for (const [x, y] of [[4, 4], [14, 3], [24, 5], [9, 11], [20, 11], [29, 11]]) g.fillRect(x, y, 4, 4); }, false);
  function criarBolaQuadra() {
    const Q = S.quadra, R0 = 0.15;
    const mesh = new THREE.Mesh(guardar(new THREE.SphereGeometry(R0, 12, 8)), guardar(new THREE.MeshLambertMaterial({ map: guardar(texBolinha()) })));
    const sombra = sombraAtor(0.17); S.grupo.add(mesh);
    S.bola = { mesh, sombra, R: R0, x: Q.cx, z: Q.cz, vx: 0, vz: 0, jx: null, jz: null, noGol: 0, eixo: new THREE.Vector3(), q: new THREE.Quaternion() };
    // as redes dos gols da quadra viram parede para o jogador (não dá para entrar no gol andando)
    for (const s of [-1, 1]) { const gx = Q.cx + s * Q.gl; S.col.push({ x0: Math.min(gx, gx + s * Q.gp), x1: Math.max(gx, gx + s * Q.gp), z0: Q.cz - Q.gm - 0.1, z1: Q.cz + Q.gm + 0.1 }); }
    posBola();
  }
  function posBola() { const B = S.bola; B.mesh.position.set(B.x, 0.1 + B.R, B.z); B.sombra.position.set(B.x, 0.12, B.z); }
  function tickBola(dt) {
    const B = S.bola, Q = S.quadra, J = S.jog; if (!B) return;
    if (B.jx == null) { B.jx = J.x; B.jz = J.z; }
    const cl = (v) => clamp(v, -7, 7), pvx = cl((J.x - B.jx) / Math.max(dt, 1e-3)), pvz = cl((J.z - B.jz) / Math.max(dt, 1e-3)); B.jx = J.x; B.jz = J.z;
    // empurrão do jogador (só se ele estiver indo na direção da bola) — correndo ela vai mais longe
    const dx = B.x - J.x, dz = B.z - J.z, d = Math.hypot(dx, dz), lim = B.R + 0.27;
    if (!B.noGol && d < lim && d > 1e-4 && !J.sentado) {
      const nx = dx / d, nz = dz / d, vn = pvx * nx + pvz * nz;
      if (vn > 0.15) { const v = Math.min(8, vn * 1.45 + 0.6), at = B.vx * nx + B.vz * nz; if (v > at) { B.vx += (v - at) * nx; B.vz += (v - at) * nz; } }
      B.x = J.x + nx * lim; B.z = J.z + nz * lim;
    }
    const sp = Math.hypot(B.vx, B.vz);
    if (sp > 0.01) {
      const k = Math.max(0, 1 - (0.55 + 0.9 / Math.max(sp, 0.6)) * dt); B.vx *= k; B.vz *= k;
      const ox = B.x; B.x += B.vx * dt; B.z += B.vz * dt;
      const ldx = Q.cx - Q.gl, rdx = Q.cx + Q.gl, naBoca = Math.abs(B.z - Q.cz) < Q.gm - B.R;
      if (B.noGol) {                                                       // dentro do gol: a rede segura
        const s = B.noGol, fundo = Q.cx + s * (Q.gl + Q.gp - B.R - 0.05);
        if (s * (B.x - fundo) > 0) { B.x = fundo; B.vx = -B.vx * 0.15; }
        if (Math.abs(B.z - Q.cz) > Q.gm - B.R) { B.z = Q.cz + Math.sign(B.z - Q.cz) * (Q.gm - B.R); B.vz = -B.vz * 0.3; }
      } else if ((B.x < ldx && ox >= ldx) || (B.x > rdx && ox <= rdx)) {   // cruzou a linha do gol
        if (naBoca) { B.noGol = B.x < Q.cx ? -1 : 1; gol(); }
        else if (Math.abs(B.z - Q.cz) < Q.gm + 0.2) { B.x = ox; B.vx = -B.vx * 0.5; }   // bateu na trave / na rede por fora
      }
      if (!B.noGol) {                                                      // paredes (a grade em volta)
        if (B.x < Q.x0 + B.R) { B.x = Q.x0 + B.R; B.vx = Math.abs(B.vx) * 0.55; } else if (B.x > Q.x1 - B.R) { B.x = Q.x1 - B.R; B.vx = -Math.abs(B.vx) * 0.55; }
        if (B.z < Q.z0 + B.R) { B.z = Q.z0 + B.R; B.vz = Math.abs(B.vz) * 0.55; } else if (B.z > Q.z1 - B.R) { B.z = Q.z1 - B.R; B.vz = -Math.abs(B.vz) * 0.55; }
        // por trás do gol a rede também é parede
        for (const s of [-1, 1]) { const gx = Q.cx + s * Q.gl; if (s * (B.x - gx) > 0 && s * (B.x - gx) < Q.gp + B.R && Math.abs(B.z - Q.cz) < Q.gm + B.R) { if (Math.abs(ox - gx) * s > Q.gp) { B.x = gx + s * (Q.gp + B.R); B.vx = s * Math.abs(B.vx) * 0.4; } else { B.z = Q.cz + Math.sign(B.z - Q.cz) * (Q.gm + B.R); B.vz = -B.vz * 0.4; } } }
      }
      const ds = Math.hypot(B.vx, B.vz) * dt; if (ds > 1e-5) { B.eixo.set(B.vz, 0, -B.vx).normalize(); B.q.setFromAxisAngle(B.eixo, ds / B.R); B.mesh.quaternion.premultiply(B.q); }
    } else { B.vx = B.vz = 0; }
    posBola();
  }
  function gol() {
    somGol();
    if (S.modo !== 'livre' || S.jog.sentado) return;
    const nomes = Object.keys(CELEBRACOES), c = CELEBRACOES[nomes[Math.floor(Math.random() * nomes.length)]];
    S.modo = 'cena'; UI.ctl.hidden = true; S.jog.celeb = { c, t: 0, giro: (Math.random() < 0.5 ? -1 : 1) * (c.giro || 0) };
  }
  function tickComemoracao(dt) {
    const J = S.jog, C = J.celeb; if (!C) return;
    C.t += dt; J.anim = (J.anim || 0) + dt * 9;
    const tc = C.t % C.c.dur, v = celebVel(C.c, tc) * 0.55;                // repete a comemoração até dar os 5 s (sem corte nenhum)
    J.yawAlvo += C.giro * dt; J.yaw = J.yawAlvo;
    const nx = J.x + Math.cos(J.yaw) * v * dt, nz = J.z - Math.sin(J.yaw) * v * dt;
    if (v > 0.05) { if (livre(nx, nz)) { J.x = nx; J.z = nz; } else J.yawAlvo += 1.2; }
    if (C.t >= 5) {
      J.celeb = null; liberar();
      const B = S.bola, Q = S.quadra; B.noGol = 0; B.vx = B.vz = 0; B.x = Q.cx; B.z = Q.cz; posBola();   // a bola volta para o meio
    }
  }
  function somGol() {
    const A = typeof Som !== 'undefined' && Som.audio && !Som.mudo ? Som.audio.ctx : null; if (!A) return;
    try { const t0 = A.currentTime; [523, 659, 784, 1046].forEach((f, i) => { const o = A.createOscillator(), g = A.createGain(); o.type = 'square'; o.frequency.value = f; g.gain.setValueAtTime(0.06, t0 + i * 0.11); g.gain.exponentialRampToValueAtTime(0.001, t0 + i * 0.11 + 0.25); o.connect(g); g.connect(A.destination); o.start(t0 + i * 0.11); o.stop(t0 + i * 0.11 + 0.27); }); } catch (e) { /* sem som */ }
  }

  // ------------------------------------------------------------------ (4.9.3) TREINO no primeiro society: dois batem pênalti, um goleiro defende (ou não)
  function criarTreino(f2) {
    const rnd = semente(808), F = S.societys[0], gz = F.cz + 15, spot = { x: F.cx, z: F.cz + 8 };
    const bat = [criarPessoa(f2, rnd, false), criarPessoa(f2, rnd, rnd() < 0.4)], gol_ = criarPessoa(f2, rnd, false);
    const esp = [{ x: F.cx - 1.6, z: F.cz + 3 }, { x: F.cx + 1.6, z: F.cz + 3 }];
    bat.forEach((A, i) => { A.tipo = 'treino'; A.x = esp[i].x; A.z = esp[i].z; A.yaw = A.yawAlvo = -Math.PI / 2; A.y = 0.08; S.npcs.push(A); });
    gol_.tipo = 'treino'; gol_.goleiro = true; gol_.x = F.cx; gol_.z = gz - 0.5; gol_.yaw = gol_.yawAlvo = Math.PI / 2; gol_.y = 0.08; S.npcs.push(gol_);
    const mesh = new THREE.Mesh(guardar(new THREE.SphereGeometry(0.15, 12, 8)), guardar(new THREE.MeshLambertMaterial({ map: guardar(texBolinha()) })));
    S.grupo.add(mesh);
    S.treino = { F, gz, spot, bat, gol: gol_, esp, vez: 0, fase: 'anda', t: 0, bola: { mesh, sombra: sombraAtor(0.17), x: spot.x, y: 0.23, z: spot.z, vx: 0, vy: 0, vz: 0 } };
  }
  function tickTreino(dt) {
    const T_ = S.treino; if (!T_) return;
    if (T_.pausa) { T_.parado = true; T_.bola.mesh.visible = false; T_.bola.sombra.visible = false; return; }          // (4.9.6) quem treina foi para casa (ou está na chuva): o treino para
    if (T_.parado) { T_.parado = false; const b = T_.bola; b.x = T_.spot.x; b.z = T_.spot.z; b.y = 0.23; b.vx = b.vy = b.vz = 0; b.saiu = false; b.rolando = false; b.defendida = false; T_.fase = 'anda'; T_.t = 0; T_.vez = 0; T_.gol.x = T_.F.cx; b.mesh.visible = true; b.sombra.visible = true; for (const P of T_.bat) { P.chuteT = -1; } }
    const B = T_.bola, A = T_.bat[T_.vez], K = T_.gol, g = 9.8, chao = 0.08 + 0.15;
    const ir = (P, x, z, v) => { const dx = x - P.x, dz = z - P.z, d = Math.hypot(dx, dz); if (d < 0.05) { P.andando = false; return true; } const st = Math.min(d, v * dt); P.x += dx / d * st; P.z += dz / d * st; P.yawAlvo = Math.atan2(-dz, dx); P.andando = true; P.vel = v; return false; };
    T_.t += dt;
    if (T_.fase === 'anda') { if (ir(A, T_.spot.x - 0.25, T_.spot.z - 2.4, 1.6)) { A.yawAlvo = -Math.PI / 2; T_.fase = 'mira'; T_.t = 0; } }
    else if (T_.fase === 'mira') { A.andando = false; if (T_.t > 1.2) { T_.fase = 'corre'; T_.t = 0; } }
    else if (T_.fase === 'corre') { if (ir(A, T_.spot.x - 0.15, T_.spot.z - 0.45, 3.4)) { T_.fase = 'chuta'; T_.t = 0; A.chuteT = 0; } }
    else if (T_.fase === 'chuta') {
      A.andando = false; A.chuteT = T_.t;
      if (T_.t > 0.18 && !B.saiu) {                                        // a bola sai
        B.saiu = true; const tx = T_.F.cx + (Math.random() - 0.5) * 5.2, ty = 0.3 + Math.random() * 1.7, dist = T_.gz - B.z, vz = 13 + Math.random() * 5, tt = dist / vz;
        B.vz = vz; B.vx = (tx - B.x) / tt; B.vy = (ty - B.y + 0.5 * g * tt * tt) / tt; K.alvoX = tx; K.reage = 0.22;
      }
      if (T_.t > 0.6) { A.chuteT = -1; T_.fase = 'volta'; T_.t = 0; }
    } else if (T_.fase === 'volta') { const e = T_.esp[T_.vez]; if (ir(A, e.x, e.z, 1.5) && T_.t > 2.5) { A.yawAlvo = -Math.PI / 2; T_.fase = 'devolve'; T_.t = 0; } }
    else if (T_.fase === 'devolve') {                                       // o goleiro rola a bola de volta para a marca
      if (!B.rolando) { const dx = T_.spot.x - B.x, dz = T_.spot.z - B.z, d = Math.hypot(dx, dz) || 1, v = Math.sqrt(2 * 2.2 * d); B.vx = dx / d * v; B.vz = dz / d * v; B.vy = 0; B.y = chao; B.rolando = true; }
      if (Math.hypot(B.vx, B.vz) < 0.05) { B.x = T_.spot.x; B.z = T_.spot.z; B.vx = B.vz = 0; B.rolando = false; B.saiu = false; B.defendida = false; T_.vez = 1 - T_.vez; T_.fase = 'anda'; T_.t = 0; }
    }
    // goleiro: anda de lado até onde acha que a bola vai, com um tempinho de reação
    if (K.reage > 0) K.reage -= dt; const kx = K.reage > 0 || K.alvoX == null ? T_.F.cx : clamp(K.alvoX, T_.F.cx - 2.2, T_.F.cx + 2.2);
    { const dx = kx - K.x; K.x += clamp(dx, -3.5 * dt, 3.5 * dt); K.z = T_.gz - 0.5; K.andando = Math.abs(dx) > 0.05; K.vel = 2; K.yawAlvo = Math.PI / 2; K.mira = B.saiu && !B.rolando; }
    // bola
    if (B.rolando) { const sp = Math.hypot(B.vx, B.vz), k = Math.max(0, sp - 2.2 * dt) / (sp || 1); B.vx *= k; B.vz *= k; B.x += B.vx * dt; B.z += B.vz * dt; }
    else if (B.saiu) {
      B.vy -= g * dt; B.x += B.vx * dt; B.y += B.vy * dt; B.z += B.vz * dt;
      if (B.y < chao) { B.y = chao; B.vy = Math.abs(B.vy) * 0.45; B.vx *= 0.8; B.vz *= 0.8; if (B.vy < 0.4) B.vy = 0; }
      if (!B.defendida && Math.abs(B.z - K.z) < 0.35 && Math.abs(B.x - K.x) < 0.75 && B.y < 2.1) { B.defendida = true; B.vz = -Math.abs(B.vz) * 0.35; B.vx = (Math.random() - 0.5) * 3; B.vy = 2; }
      if (B.z > T_.gz && Math.abs(B.x - T_.F.cx) < 2.5 && B.y < 2.2) { if (B.z > T_.gz + 1.05) { B.z = T_.gz + 1.05; B.vz = -B.vz * 0.15; B.vx *= 0.3; } }
      else if (B.z > T_.F.r.z1 - 0.3) { B.z = T_.F.r.z1 - 0.3; B.vz = -B.vz * 0.3; }
      B.x = clamp(B.x, T_.F.r.x0 + 0.3, T_.F.r.x1 - 0.3);
      if (B.z < T_.F.r.z0 + 0.3) { B.z = T_.F.r.z0 + 0.3; B.vz = Math.abs(B.vz) * 0.3; }
      if (B.y <= chao + 0.001) { const sp = Math.hypot(B.vx, B.vz), k = Math.max(0, sp - 3 * dt) / (sp || 1); B.vx *= k; B.vz *= k; }
    }
    B.mesh.position.set(B.x, B.y, B.z); B.sombra.position.set(B.x, 0.1, B.z);
  }

  // ================================================================== (5.3.0) EMPREGOS, FUTEBOL NO SINTÉTICO, CELULAR E BANHO
  //   Turnos de cada emprego (só a cafeteria tem o expediente jogável por enquanto). Ninguém trabalha sábado e domingo.
  //   O convite do futebol: quem trabalha de manhã/tarde é chamado 2h DEPOIS do turno; quem trabalha de tarde/noite, 4h ANTES.
  //   O primeiro convite é uma LIGAÇÃO do João depois do primeiro dia de trabalho (celular pixelado no canto inferior direito, 10 s
  //   para atender; sem atender vem a mensagem). Depois disso o racha do sintético Doutor Bryan é toda segunda e quarta (DIAS_FUTEBOL).
  //   Toda partida no sintético: escolhe 5 ou 3 minutos, o horário e o clima do mundo vão para a partida e ficam salvos nos dados dela
  //   (d.partidas), e o relógio do mundo anda 1h. A cada 10 chutes no alvo: +0,25 em chute, efeito e força (escala de 1 a 10).
  //   Depois de toda partida ele diz que precisa de um banho (d.precisaBanho): dormir sem banho tira 5 de saúde (fase2.js) e a
  //   Lúcia não deixa começar o turno sem banho.
  const TURNOS = { cafeteria: [8, 16], mercado: [14, 22], pizzaria: [15, 23] };
  const LUGAR_EMPREGO = { cafeteria: 'cafeteria', mercado: 'supermercado', pizzaria: 'pizzaria' };
  const DIAS_FUTEBOL = [0, 2];                                           // diaSemana(): 0 = segunda, 2 = quarta
  const lugarDoEmprego = () => LUGAR_EMPREGO[empregoEscolhido()] || null;
  const fimDeSemana = () => diaSemana() >= 5;
  function horaDoFutebol() { const t = TURNOS[empregoEscolhido()] || TURNOS.cafeteria; return t[0] < 12 ? t[1] + 2 : t[0] - 4; }
  function fut() { const d = S.dados; return d.futebol || (d.futebol = { convidado: false, ligou: false, jogos: 0, conheceCaio: false, agenda: null }); }
  function sintetico() { const F = S.societys && S.societys[1]; return F ? { x: F.gate.out.x, z: F.gate.out.z, dentro: F.gate.in, F } : null; }
  const diaDeFutebol = () => fut().convidado && DIAS_FUTEBOL.includes(diaSemana());
  // segunda e quarta (depois do convite): a agenda do dia já nasce marcada
  function agendarHoje() {
    const d = S.dados, f = fut();
    if (diaDeFutebol() && !(f.agenda && f.agenda.dia === d.dia)) f.agenda = { dia: d.dia, hora: horaDoFutebol(), feito: false };
    mostrarAgenda();
  }
  function mostrarAgenda() {
    const d = S.dados, f = fut(), A = f.agenda;
    if (!A || A.feito || A.dia !== d.dia || d.hora > A.hora + 1.5) return;
    S.missao = Tf('Missão: futebol no sintético Doutor Bryan às {0}.', fmtHora(A.hora)); mostrarMissao();
    const P = sintetico(); if (P && !S.dentro) definirMarca(P.x, P.z);
  }
  // ---- o celular (canto inferior direito). Tocando, o resto do HUD some; 10 s para atender.
  function iconeCelular(t) {
    const W = 18, Hh = 30, cv = document.createElement('canvas'); cv.width = W; cv.height = Hh; const g = cv.getContext('2d');
    g.fillStyle = '#2a1206'; g.fillRect(1, 0, W - 2, Hh); g.fillRect(0, 1, W, Hh - 2);
    g.fillStyle = '#3a3f4a'; g.fillRect(2, 1, W - 4, Hh - 2);
    g.fillStyle = t % 2 ? '#8fe04a' : '#6cc8f0'; g.fillRect(3, 4, W - 6, 19);                        // tela acesa (pisca)
    g.fillStyle = '#1c3a1c'; g.fillRect(6, 7, 6, 6); g.fillStyle = '#f2c98a'; g.fillRect(7, 8, 4, 4);  // a foto do João
    g.fillStyle = '#2a1206'; g.fillRect(5, 15, 8, 1); g.fillRect(6, 17, 6, 1);                         // "João" / "chamando..."
    g.fillStyle = '#5fd35a'; g.fillRect(4, 20, 4, 2); g.fillStyle = '#e0405a'; g.fillRect(10, 20, 4, 2);
    g.fillStyle = '#8c9199'; g.fillRect(7, 25, 4, 2); g.fillStyle = '#1c1c1f'; g.fillRect(7, 2, 4, 1);
    cv.style.cssText = 'width:100%;height:100%;image-rendering:pixelated;display:block;pointer-events:none;';
    return cv;
  }
  function montarCelularUI() {
    if (UI.cel) return;
    const b = document.createElement('button'); b.type = 'button'; b.id = 'cdCelular'; b.hidden = true;
    b.style.cssText = 'position:fixed;z-index:13;right:max(22px,env(safe-area-inset-right,0px));bottom:calc(18px + env(safe-area-inset-bottom,0px));width:72px;height:120px;padding:0;background:none;border:0;cursor:pointer;filter:drop-shadow(0 4px 0 rgba(0,0,0,.45));';
    const tag = document.createElement('div'); tag.style.cssText = 'position:fixed;z-index:13;right:max(14px,env(safe-area-inset-right,0px));bottom:calc(142px + env(safe-area-inset-bottom,0px));padding:4px 8px;background:rgba(42,18,6,.92);border:3px solid #8fe04a;color:#fff0c8;font:700 11px/1.2 var(--font-display);white-space:nowrap;pointer-events:none;';
    tag.hidden = true;
    const css = document.createElement('style'); css.textContent = '@keyframes cdTrim{0%,100%{transform:rotate(0)}20%{transform:rotate(-8deg)}40%{transform:rotate(8deg)}60%{transform:rotate(-6deg)}80%{transform:rotate(6deg)}} #cdCelular.toca{animation:cdTrim .5s linear infinite} #cdCelular[hidden]{display:none}';
    document.head.appendChild(css);
    ($('raizJogo') || document.body).append(b, tag);
    UI.cel = b; UI.celTag = tag;
    b.addEventListener('click', () => { if (S && S.ligando) atenderLigacao(); });
  }
  function somToque(A, t) {                                             // "trim-trim" (duas notinhas rápidas, duas vezes)
    for (const [k, f] of [[0, 1318], [0.09, 1568], [0.18, 1318], [0.27, 1568], [0.55, 1318], [0.64, 1568], [0.73, 1318], [0.82, 1568]]) {
      const o = A.ctx.createOscillator(), g = A.ctx.createGain(); o.type = 'square'; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t + k); g.gain.linearRampToValueAtTime(0.045, t + k + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + k + 0.085);
      o.connect(g); g.connect(A.mestre); o.start(t + k); o.stop(t + k + 0.1);
    }
  }
  function esconderHud(sim) {
    for (const el of [UI.hud, UI.esq, UI.ctl, UI.seta, UI.turno]) if (el) { if (sim) { el.dataset.antes = el.hidden ? '1' : '0'; el.hidden = true; } else if (el.dataset.antes != null) { el.hidden = el.dataset.antes === '1'; delete el.dataset.antes; } }
  }
  function tocarCelular() {
    montarCelularUI();
    S.modo = 'cena'; aviso(''); esconderHud(true);
    S.ligando = { t: 10, toque: 0, pisca: 0 };
    UI.cel.hidden = false; UI.cel.classList.add('toca'); UI.cel.replaceChildren(iconeCelular(0));
    UI.celTag.textContent = T('João chamando... toque para atender'); UI.celTag.hidden = false;
  }
  function tickCelular(dt) {
    const L = S.ligando; if (!L) return;
    const agora = performance.now(); if (L.t0 == null) L.t0 = agora; L.t = 10 - (agora - L.t0) / 1000;   // 10 s de verdade (não depende do FPS)
    L.toque -= dt; L.pisca += dt;
    if (L.toque <= 0) { L.toque = 1.6; const A = audioCafe(); if (A) try { somToque(A, A.ctx.currentTime + 0.01); } catch (e) { /* sem som */ } }
    if (L.pisca > 0.35) { L.pisca = 0; L.n = (L.n | 0) + 1; UI.cel.replaceChildren(iconeCelular(L.n)); }
    if (L.t <= 0) perdeuLigacao();
  }
  function pararCelular() { S.ligando = null; if (UI.cel) { UI.cel.hidden = true; UI.cel.classList.remove('toca'); UI.celTag.hidden = true; } }
  function textoHorarioJogo(A) { return (A.dia === S.dados.dia ? T('hoje') : T('amanhã')) + ' ' + Tf('às {0}', fmtHora(A.hora)); }
  function marcarConvite() {
    const f = fut(), d = S.dados, h = horaDoFutebol();
    f.ligou = true; f.convidado = true;
    f.agenda = { dia: h > d.hora ? d.dia : d.dia + 1, hora: h, feito: false, primeiro: true };
  }
  function depoisDoConvite() {
    const f = fut(), P = sintetico();
    S.missao = Tf('Missão: futebol no sintético Doutor Bryan, {0}.', textoHorarioJogo(f.agenda)); mostrarMissao();
    if (P && !S.dentro) definirMarca(P.x, P.z);
    gravar('chegada');
  }
  async function perdeuLigacao() {
    pararCelular(); marcarConvite();
    const f = fut();
    await mensagemCelular(T('João'), Tf('Tentei te ligar e você não atendeu. Bora jogar bola! Lá no campo sintético Doutor Bryan. Te espero lá {0}.', textoHorarioJogo(f.agenda)), T('Te mandei a localização.'));
    esconderHud(false); depoisDoConvite(); if (S && S.ativo && S.modo === 'cena') liberar();
  }
  function mensagemCelular(de, txt, txt2) {                             // a mensagem chega como um balão de chat, no alto da tela
    return new Promise((ok) => {
      const el = document.createElement('div');
      el.style.cssText = 'position:fixed;z-index:14;left:50%;top:calc(14px + env(safe-area-inset-top,0px));transform:translateX(-50%);width:min(460px,calc(100% - 32px));box-sizing:border-box;background:#f4f6f8;border:4px solid #2a1206;color:#1c2a36;padding:8px 10px;font:600 13px/1.35 var(--font-body);display:flex;flex-direction:column;gap:5px;cursor:pointer;';
      el.innerHTML = '<div style="font:700 11px/1 var(--font-display);color:#1f7a4d;letter-spacing:.06em">✉ ' + de + '</div>';
      for (const t of [txt, txt2]) { if (!t) continue; const p = document.createElement('div'); p.style.cssText = 'background:#dcf3d4;border:2px solid #9ccf8e;padding:5px 8px;align-self:flex-start;max-width:92%;'; p.textContent = t; el.appendChild(p); }
      const fim = () => { clearTimeout(tm); el.remove(); ok(); };
      el.addEventListener('click', fim); const tm = setTimeout(fim, 7000);
      ($('raizJogo') || document.body).appendChild(el);
      const A = audioCafe(); if (A) try { const t0 = A.ctx.currentTime + 0.01; for (const [k, f] of [[0, 1760], [0.12, 2349]]) { const o = A.ctx.createOscillator(), g = A.ctx.createGain(); o.frequency.value = f; g.gain.setValueAtTime(0.06, t0 + k); g.gain.exponentialRampToValueAtTime(0.0001, t0 + k + 0.2); o.connect(g); g.connect(A.mestre); o.start(t0 + k); o.stop(t0 + k + 0.22); } } catch (e) { /* sem som */ }
    });
  }
  // atender: ele tira o celular do bolso de trás, põe do lado do rosto e conversa com o João
  async function atenderLigacao() {
    pararCelular(); marcarConvite();
    const J = S.jog, f = fut();
    const camAntes = S.cam.dist; S.cam.dist = 4.6;                     // a câmera chega perto para ver o celular
    J.andando = false; J.correndo = false; J.fone = { t: 0 }; foneNaMao(true);
    await esperar(900);
    await fala('joao', Tf('Fala, {0}! É o João!', nomeJog()));
    await fala('jog', T('Opa, João! Acabei de sair do trabalho. E aí?'));
    await fala('joao', Tf('Bora jogar uma bola? A galera joga no campo sintético Doutor Bryan. Te espero lá {0}!', textoHorarioJogo(f.agenda)));
    await fala('jog', T('Bora! Tô dentro.'));
    await fala('joao', T('Fechou! Te mandei a localização. Até lá!'));
    Dialogo.esconder();
    J.fone = { t: 0, guarda: true }; await esperar(700); foneNaMao(false); J.fone = null; S.cam.dist = camAntes;
    esconderHud(false); depoisDoConvite(); if (S && S.ativo && S.modo === 'cena') liberar();
  }
  function foneNaMao(sim) {
    const J = S.jog;
    if (J.foneMesh) { if (J.foneMesh.parent) J.foneMesh.parent.remove(J.foneMesh); J.foneMesh = null; }
    if (!sim) return;
    const G = new Geo(); G.box(0.045, 0.16, 0.085, '#3a3f4a', 0, 0, 0); G.box(0.05, 0.13, 0.065, '#6cc8f0', 0.003, 0.005, 0);
    const m = G.malha(MAT); m.position.set(0.02, -0.3, 0); J.m.bracoD.cotovelo.add(m); J.foneMesh = m;
  }
  function poseFone(J, dt) {                                             // 1) mão para trás (pega do bolso) 2) leva até a orelha
    const F = J.fone; if (!F) return;
    F.t += dt; const m = J.m;
    const k = F.guarda ? Math.max(0, 1 - F.t / 0.6) : Math.min(1, Math.max(0, (F.t - 0.45) / 0.45));
    if (!F.guarda && F.t < 0.45) { m.bracoD.rotation.z = -0.85 * Math.min(1, F.t / 0.25); usarCotovelo(m.bracoD, 0, 0.6); if (J.foneMesh) J.foneMesh.visible = F.t > 0.3; return; }
    m.bracoD.rotation.z = lerp(0.1, 1.6, k); usarCotovelo(m.bracoD, 0, lerp(0.2, 1.9, k));
    if (J.foneMesh) { J.foneMesh.visible = true; J.foneMesh.rotation.z = -(m.bracoD.rotation.z + lerp(0.2, 1.9, k)) + 1.4; }
  }
  // ---- o racha no sintético
  function apFixa(seed, g) { return gerarAparencia(seed, g); }
  const UNI_COLETE = { camisa: '#f2c230', listra: '#1c1c1f', gola: '#1c1c1f', calcao: '#1c1c1f', meia: '#1c1c1f', sola: '#111111', goleiro: '#2a72d6' };
  const UNI_AZUL = { camisa: '#3a64b8', listra: '#f2f2ee', gola: '#1f3a73', calcao: '#f2f2ee', meia: '#3a64b8', sola: '#f2f2ee', goleiro: '#1f9e5c' };
  const AP_CAIO = { pele: '#a8693f', cabelo: '#1c140f', estilo: 2, rosto: 0, labio: 3, barba: 1, corBarba: '#1c140f' };
  function atributosJogador() {
    const d = S.dados;
    if (!d.atributos) d.atributos = Object.assign({}, (PERSONAGEM.atributos && Object.keys(PERSONAGEM.atributos).length ? PERSONAGEM.atributos : Atributos.iniciante()));
    for (const n of Atributos.NOMES) if (typeof d.atributos[n] !== 'number' || d.atributos[n] < 5) d.atributos[n] = Math.max(5, d.atributos[n] || 5);   // (5.3.0) começa com tudo 5
    return d.atributos;
  }
  function cfgSintetico(duracao, horario, clima) {
    const g = (nome, seed, gen) => Object.assign({ nome }, apFixa(seed, gen));
    const tec = { nome: 'Caio', aparencia: { pele: AP_CAIO.pele, cabelo: AP_CAIO.cabelo, estilo: AP_CAIO.estilo, roupa: '#222222' } };
    const t0 = { id: 's_joao', nome: T('Time do João'), sigla: 'JOÃ', forca: 50, popularidade: 0.1, formacao: '4-4-2', tatica: 'tikitaka', uniforme: UNI_COLETE, uniforme2: UNI_AZUL,
      emblema: { forma: 'escudo', cor1: '#f2c230', cor2: '#1c1c1f', letras: 'JP' }, tecnico: tec,
      elenco: [Object.assign({}, HIST.joao, { nome: 'João' }), Object.assign({ nome: 'Caio' }, AP_CAIO), g('Carol', 5151, 'F')] };
    const t1 = { id: 's_bryan', nome: T('Galera do Bryan'), sigla: 'BRY', forca: 50, popularidade: 0.1, formacao: '4-4-2', tatica: 'tikitaka', uniforme: UNI_AZUL, uniforme2: UNI_COLETE,
      emblema: { forma: 'circulo', cor1: '#3a64b8', cor2: '#f2f2ee', letras: 'DB' }, tecnico: tec,
      elenco: [g('Rafa', 6161, 'M'), g('Júlia', 7171, 'F'), g('Marcos', 8181, 'M'), g('Dani', 9191, 'F')] };
    const eu = { nome: PERSONAGEM.apelido || PERSONAGEM.nome || T('Você'), posicao: PERSONAGEM.posicaoHist || 'FWD', numero: PERSONAGEM.numero, aparencia: personagemAparencia() };
    return { campo: 'society', times: [t0, t1], mandante: 0, competicao: { tipo: 'amistoso', nome: T('Racha do sintético'), rodada: 0, fase: '', mataMata: false, jogo: 'unico', placarIda: null },
      dificuldade: 'normal', clima, gramado: 'baixo', horario, duracao, usuario: eu, atributos: atributosJogador(), taticas: [null, null], formacoes: [null, null] };
  }
  function sairParaPartida() {                                           // entrega a tela ao jogo de verdade (a cidade fica guardada, escondida)
    Musica.parar(); MusicaCafe.parar();
    GANCHO_RENDER = null; camera.clearViewOffset();
    S.visCidade = scene.children.filter((c) => !c.isLight && c.visible);   // o que é da cidade e está à mostra (volta igual depois)
    for (const c of S.visCidade) c.visible = false;
    restaurarMundo(); esconderHud(true); UI.arrasto.hidden = true; aviso('');
  }
  function voltarDaPartida() {
    const volta = S.visCidade || [];
    prepararMundo();                                                     // céu, névoa e câmera da cidade (e esconde o campo da partida)
    for (const c of volta) c.visible = true; S.visCidade = null;
    GANCHO_RENDER = gancho; S.cam.snap = true;
    const ps = document.getElementById('pauseScreen'), es = document.getElementById('endScreen'); if (ps) ps.hidden = true; if (es) es.hidden = true;
    document.body.classList.add('criadorAberto');                       // esconde o placar, o radar e os botões da partida (como a fase 1)
    esconderHud(false); UI.arrasto.hidden = false;
  }
  async function jogarSintetico() {
    const d = S.dados, f = fut(), A = f.agenda, P = sintetico(); if (!A || !P) return;
    const r0 = await Escolha.mostrar(T('Quanto tempo de jogo?'), [T('5 minutos'), T('3 minutos'), T('Agora não')], { centro: true });
    Dialogo.esconder(); if (r0 === 2 || r0 < 0) return;
    const duracao = r0 === 1 ? 180 : 300, h = d.hora;
    const horario = h >= 6 && h < 15.5 ? 'dia' : h >= 15.5 && h < 18.4 ? 'tarde' : 'noite';
    const clima = S.clima.estado === 'chuva' || S.clima.chuva > 0.35 ? 'chuva' : 'seco';
    const cfg = cfgSintetico(duracao, horario, clima);
    await preto(true, 800);
    sairParaPartida();
    let r = null;
    try { r = await Historia.partida({ cfg, aviso: T('Racha no sintético: 4 contra 4!'), aoPronto: () => preto(false, 800) }); } catch (e) { console.error(e); try { Historia.abortar(); } catch (e2) { /* nada */ } }
    await preto(true, 900);
    voltarDaPartida();
    try { Historia.confirmarResultado(); } catch (e) { /* nada */ }
    // o que fica salvo da partida: o mundo na hora (dia, semana, horário, clima) e o resultado
    const st = (r && r.estatisticas) || {};
    d.partidas = (d.partidas || []).slice(-29);
    d.partidas.push({ local: 'sintetico', dia: d.dia, semana: DIAS_SEM[diaSemana()], hora: Math.round(h * 100) / 100, horario, clima, nublado: S.clima.nuv > 0.35, duracao,
      placar: r ? r.placar : null, gols: r ? r.gols : 0, nota: r ? r.nota : 0, bom: !!(r && r.bom), venceu: !!(r && r.venceu), chutes: st.chutes | 0, noAlvo: st.noAlvo | 0, passesOk: st.passesOk | 0 });
    // evolução: a cada 10 chutes no alvo, +0,25 em chute, efeito e força (até 10)
    const at = atributosJogador(); d.chutesCertos = (d.chutesCertos | 0) + (st.noAlvo | 0); let subiu = 0;
    while (d.chutesCertos >= 10) { d.chutesCertos -= 10; subiu++; for (const n of ['chute', 'efeito', 'forca']) at[n] = Math.min(10, Math.round((at[n] + 0.25) * 100) / 100); }
    PERSONAGEM.atributos = Object.assign({}, at);
    A.feito = true; f.jogos = (f.jogos | 0) + 1; d.precisaBanho = true;
    tickHorario(1 / H_POR_S);                                          // sai da partida 1h depois
    S.missao = ''; recolherMissao(); definirMarca(null);
    // a cena depois do jogo: o Caio vem falar com a gente na saída do campo
    const J = S.jog, E = P.dentro; J.sentado = false; J.x = E.x; J.z = E.z; J.y = altura(J.x, J.z); J.yaw = J.yawAlvo = Math.PI / 2; J.rota = null;
    const C = criarNPCFixo(AP_CAIO, false, 7, ['#f2c230', '#1c1c1f', '#1c1c1f', '#f2f2ee']); C.x = E.x + 1.3; C.z = E.z - 0.4; C.yaw = C.yawAlvo = Math.PI; S.caio = C;
    J.yawAlvo = Math.atan2(-(C.z - J.z), C.x - J.x); S.cam.snap = true;
    Musica.tocar('jazz');
    await preto(false, 900);
    try {
      if (!f.conheceCaio) { await fala('caio', T('E aí! Eu sou o Caio, eu organizo o racha aqui.')); f.conheceCaio = true; }
      if (r && r.bom) await fala('caio', T('Mandou muito bem hoje! A gente joga aqui toda segunda e quarta. Aparece, que eu gostei do seu jogo!'));
      else await fala('caio', T('Hoje não foi o seu dia, hein? Mas a gente joga aqui toda segunda e quarta. Aparece pra aprender: futebol se aprende jogando!'));
      if (subiu) await fala('jog', T('Sinto que meu chute está melhorando...'));
      await fala('jog', T('Ufa... depois dessa eu preciso tomar um banho.'));
      Dialogo.esconder();
    } catch (e) { console.error(e); }
    descartarPessoa(C); S.caio = null;
    gravar('chegada');
  }
  function criarNPCFixo(ap, fem, roupa, cores) {
    let m = null, opt = null;
    try { if (S.f2 && S.f2.modeloPessoa) { const r = S.f2.modeloPessoa({ ap, fem, roupa, cores }); m = r.m; opt = r.opt; } } catch (e) { console.warn('[Cidade] NPC:', e); }
    if (!m) { opt = Object.assign({ camisa: cores[0], listra: cores[2], gola: cores[2], calcao: cores[1], meia: '#f2f2ee', sola: '#e6e6e0', corTexto: '#F2F2EE', numero: '', nome: ' ', fundoNome: 'rgba(0,0,0,0)', manga: 0, meiao: 1, cabecao: 1, escala: 1 }, ap); m = makeAthlete(opt); m.etiqueta.visible = false; m.sombra.visible = false; }
    S.grupo.add(m.raiz); S.meus.add(m);
    const A = { m, opt, blob: sombraAtor(0.3), x: 0, z: 0, y: 0, yaw: 0, yawAlvo: 0, fase: 0, vel: 1.2, t: 0, andando: false, fala: false, sentado: false, assento: 0.52, espera: 0, bloq: 0, tipo: 'parado' };
    S.npcs.push(A); return A;
  }
  // os alvos do futebol (na porta do sintético Doutor Bryan)
  function alvosFutebol(v) {
    const f = fut(), A = f.agenda, P = sintetico(), d = S.dados; if (!A || A.feito || A.dia !== d.dia || !P) return;
    if (d.hora < A.hora - 0.75) v.push({ x: P.x, z: P.z, r: 2.2, txt: Tf('O jogo é às {0}', fmtHora(A.hora)), fn: async () => {}, y: 2.6 });
    else if (d.hora <= A.hora + 1.5) v.push({ x: P.x, z: P.z, r: 2.4, txt: T('Jogar bola no sintético'), fn: jogarSintetico, y: 2.6, pri: true });
  }
  // depois do 1º turno de trabalho, o João liga (alguns segundos depois, com o jogador livre)
  function tickConvite(dt) {
    const f = fut(); if (f.ligou || !S.dados.trabalhouAlgumDia) return;
    if (S.modo !== 'livre' || S.ligando || S.turno || S.turnoMercado) return;
    S.ligarT = (S.ligarT == null ? 6 : S.ligarT) - dt;
    if (S.ligarT <= 0) { S.ligarT = null; tocarCelular(); }
  }
  // ------------------------------------------------------------------ (5.2.0) a cafeteria abre às 8h e fecha às 20h; a LÚCIA mora na casa dos Alves:
  //   sai de casa a tempo de chegar às 7h50, entra na cafeteria e às 20h volta para casa pelo mesmo caminho (pela rede de calçadas).
  //   A posição dela na rua sai direto da hora (sem estado): funciona também ao carregar e ao sair de dentro de um lugar.
  const H_CAFE_ABRE = 8, H_CAFE_FECHA = 16, H_LUCIA_SAI = 17, H_LUCIA_CHEGA = 7 + 50 / 60, VEL_LUCIA = 2.0;   // (5.3.0) fecha às 16h; a Lúcia fecha o caixa e sai às 17h
  const cafeAberto = () => S.dados.hora >= H_CAFE_ABRE && S.dados.hora < H_CAFE_FECHA;
  const luciaNoCafe = () => S.dados.hora >= H_LUCIA_CHEGA && S.dados.hora < H_LUCIA_SAI;
  function rotaLucia() { return S.rotaLucia || (S.rotaLucia = rotaCasaPorta('alves', 'cafeteria', VEL_LUCIA)); }
  // (5.4.0) caminho de uma casa (casa.especial) até a porta de um lugar, pela rede de calçadas. dur = horas de jogo andando a vel m/s.
  function rotaCasaPorta(especial, lugar, vel) {
    const C = (S.casas || []).find((c) => c.especial === especial), P = PORTAS.find((p) => p.nome === lugar);
    if (!C || !P || !S.rede) return null;
    let pts = [{ x: C.x, z: C.z }, { x: C.sx, z: C.sz }].concat(caminhoRede(C.sx, C.sz, P.x, P.z - 0.6));
    { // (5.3.0) antes ela passava da cafeteria e voltava: corta a rota no ponto da calçada mais perto da porta (projeção no trecho)
      const fim = { x: P.x, z: P.z - 0.6 }; let melhor = null;
      for (let i = 2; i < pts.length - 1; i++) {
        const a = pts[i - 1], b = pts[i], vx = b.x - a.x, vz = b.z - a.z, L2 = vx * vx + vz * vz || 1;
        const u = clamp(((fim.x - a.x) * vx + (fim.z - a.z) * vz) / L2, 0, 1), q = { x: a.x + vx * u, z: a.z + vz * u }, dd = Math.hypot(q.x - fim.x, q.z - fim.z);
        if (!melhor || dd < melhor.dd - 1e-6) melhor = { i, q, dd };
      }
      if (melhor) pts = pts.slice(0, melhor.i).concat([melhor.q, fim]); }
    const acc = [0];
    for (let i = 1; i < pts.length; i++) acc.push(acc[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].z - pts[i - 1].z));
    const L = acc[acc.length - 1];
    return { pts, acc, L, dur: L / vel * H_POR_S };
  }
  // (5.4.0) GENTE COM HORÁRIO NA RUA (o Cadu e a Rosa do mercado; ver mercado.js): como a Lúcia, a posição sai direto da hora.
  //   viagens() devolve [{ ida: true, chega: h }] (de casa até a porta, chegando às h) e [{ ida: false, sai: h }] (da porta para casa).
  function criarRuaAgendada(A, especial, lugar, viagens, vel) {
    A.tipo = 'rua'; A.rua = { especial, lugar, viagens, vel: vel || 2, R: null };
    (S.dentro && S.fora ? S.fora.npcs : S.npcs).push(A); sumirV(A); return A;
  }
  function tickRua(A) {
    const U = A.rua, R = U.R || (U.R = rotaCasaPorta(U.especial, U.lugar, U.vel)), h = S.dados.hora;
    if (!R) { if (!A.oculto) sumirV(A); return; }
    let k = -1, ida = true;
    for (const v of U.viagens() || []) {
      if (v.ida && h >= v.chega - R.dur && h < v.chega) { k = (h - (v.chega - R.dur)) / R.dur; break; }
      if (!v.ida && h >= v.sai && h < v.sai + R.dur) { k = 1 - (h - v.sai) / R.dur; ida = false; break; }
    }
    if (k < 0) { if (!A.oculto) { sumirV(A); A.andando = false; } return; }
    const p = pontoNaRota(R, k); if (A.oculto) surgirV(A, p.x, p.z, p.yaw);
    A.x = p.x; A.z = p.z; A.yawAlvo = ida ? p.yaw : p.yaw + Math.PI; A.andando = true; A.correndo = false; A.vel = U.vel;
  }
  function pontoNaRota(R, k) {
    const alvo = clamp(k, 0, 1) * R.L; let i = 1; while (i < R.acc.length - 1 && R.acc[i] < alvo) i++;
    const a = R.pts[i - 1], b = R.pts[i], seg = (R.acc[i] - R.acc[i - 1]) || 1, u = clamp((alvo - R.acc[i - 1]) / seg, 0, 1);
    return { x: a.x + (b.x - a.x) * u, z: a.z + (b.z - a.z) * u, yaw: Math.atan2(-(b.z - a.z), b.x - a.x) };
  }
  function criarLuciaRua(f2) {
    const A = criarLucia(f2); A.tipo = 'luciaRua'; S.npcs.push(A); S.luciaRua = A; sumirV(A);
  }
  function tickLuciaRua(A) {
    const R = rotaLucia(), h = S.dados.hora; if (!R) { if (!A.oculto) sumirV(A); return; }
    let k = -1, ida = true; const t0 = H_LUCIA_CHEGA - R.dur;
    if (h >= t0 && h < H_LUCIA_CHEGA) k = (h - t0) / R.dur;
    else if (h >= H_LUCIA_SAI && h < H_LUCIA_SAI + R.dur) { k = 1 - (h - H_LUCIA_SAI) / R.dur; ida = false; }
    if (k < 0) { if (!A.oculto) { sumirV(A); A.andando = false; } return; }
    const p = pontoNaRota(R, k); if (A.oculto) surgirV(A, p.x, p.z, p.yaw);
    A.x = p.x; A.z = p.z; A.yawAlvo = ida ? p.yaw : p.yaw + Math.PI; A.andando = true; A.correndo = false; A.vel = VEL_LUCIA;
  }
  // sair da cafeteria no meio do turno = encerrar o turno (como o "Acelerar final do turno": só os 20 do dia)
  async function sairNoTurno() {
    const r = await Escolha.mostrar(T('Sair agora encerra o seu turno: você só ganha os 20 fakes do dia, sem nenhum adicional pelos clientes atendidos.'), [T('Sair mesmo assim'), T('Continuar trabalhando')], { centro: true });
    Dialogo.esconder(); if (r !== 0 || !S.turno) return;
    await encerrarTurno(true); await sairDoLugar();
  }
  // 20h com o jogador dentro da cafeteria: a Lúcia avisa e ele sai
  async function fecharCafe() {
    S.modo = 'cena'; UI.ctl.hidden = true; aviso('');
    try { await fala('lucia', T('Já são 17h, vou fechar a cafeteria! Até amanhã!')); Dialogo.esconder(); if (S.jog.sentado) levantar(); await sairDoLugar(); } catch (e) { console.error(e); }
    if (S && S.ativo && S.modo === 'cena') liberar();
  }
  // ------------------------------------------------------------------ (5.1.1) a LÚCIA ALVES adulta: a mesma da Fase 1 (fase1.js, S.luciaA), crescida
  //   pele 2 da escala, cabelo castanho (CORES_CABELO[4]), rabo de cavalo, rosto "Padrão", lábio 2 — só sem a cabeça grande de criança.
  //   Roupa de trabalho: camiseta branca, calça jeans e avental marrom da cafeteria.
  function criarLucia(f2) {
    const acha = (lista, n) => Math.max(0, lista.findIndex((x) => x.nome === n));      // mesma busca da Fase 1 (ci/ri no fase1.js)
    const ap = { pele: PELES_FITZ[1].cor, cabelo: CORES_CABELO[4].cor, estilo: acha(ESTILOS_CABELO, 'Rabo de cavalo'), rosto: acha(ROSTOS, 'Padrão'), labio: 2, barba: 0 };
    let m = null, opt = null;
    try { if (f2 && f2.modeloPessoa) { const r = f2.modeloPessoa({ ap, fem: true, roupa: 1, cores: ['#f2f2ee', '#2a3f66', '#6a4428', '#6a4428'] }); m = r.m; opt = r.opt; } } catch (e) { console.warn('[Cidade] Lúcia:', e); }
    if (!m) { opt = Object.assign({ camisa: '#f2f2ee', listra: '#6a4428', gola: '#6a4428', calcao: '#2a3f66', meia: '#2a3f66', sola: '#e6e6e0', corTexto: '#F2F2EE', numero: '', nome: ' ', fundoNome: 'rgba(0,0,0,0)', manga: 0, meiao: 1, cabecao: 1, escala: 1 }, ap); m = makeAthlete(opt); m.etiqueta.visible = false; m.sombra.visible = false; }
    const av = new Geo(); av.box(0.05, 0.62, 0.46, '#7a4a24', 0.17, 0.55, 0); av.box(0.04, 0.04, 0.5, '#4a2a12', 0.18, 0.86, 0); av.box(0.02, 0.06, 0.1, '#f2c230', 0.2, 1.12, 0.1);   // avental da cafeteria + crachá
    m.corpo.add(av.malha(MAT));
    S.grupo.add(m.raiz); S.meus.add(m);
    return { m, opt, blob: sombraAtor(0.3), x: 0, z: 0, y: 0, yaw: 0, yawAlvo: 0, fase: 0, vel: 1, t: 0, andando: false, fala: false, sentado: false, assento: 0.52, espera: 0, bloq: 0, tipo: 'parado' };
  }
  // ------------------------------------------------------------------ (4.9.3) o SEU VALDEMAR, atrás do balcão do lanche
  function criarValdemar(f2) {
    const rnd = semente(1960);
    const ap = { pele: '#c98e65', cabelo: '#b9b6ae', estilo: 2, rosto: 0, labio: 3, corBarba: '#9a968c', barba: Math.max(0, ESTILOS_BARBA.findIndex((b) => /bigode/i.test(b.nome))) };
    let m = null, opt = null;
    try { if (f2 && f2.modeloPessoa) { const r = f2.modeloPessoa({ ap, fem: false, roupa: 0, cores: ['#f2f2ee', '#2a3f66', '#f2f2ee', '#f2f2ee'] }); m = r.m; opt = r.opt; } } catch (e) { console.warn('[Cidade] Valdemar:', e); }
    if (!m) { opt = Object.assign({ camisa: '#f2f2ee', listra: '#f2f2ee', gola: '#f2f2ee', calcao: '#2a3f66', meia: '#2a3f66', sola: '#e6e6e0', corTexto: '#F2F2EE', numero: '', nome: ' ', fundoNome: 'rgba(0,0,0,0)', manga: 0, meiao: 1, cabecao: 1, escala: 1 }, ap); m = makeAthlete(opt); m.etiqueta.visible = false; m.sombra.visible = false; }
    const av = new Geo(); av.box(0.05, 0.62, 0.46, '#e8e2d2', 0.17, 0.55, 0); av.box(0.04, 0.05, 0.6, '#c8352b', 0.18, 1.0, 0);   // avental com a faixa vermelha
    m.corpo.add(av.malha(MAT));
    S.grupo.add(m.raiz); S.meus.add(m); void rnd;
    const V = { m, opt, blob: sombraAtor(0.3), x: S.balcao.x, z: S.balcao.z, y: 0, yaw: Math.PI / 2, yawAlvo: Math.PI / 2, fase: 0, vel: 1, t: 0, andando: false, fala: false, sentado: false, tipo: 'valdemar' };
    S.valdemar = V; S.npcs.push(V);
    V.estado = 'balcao'; V.plano = null; V.passo = 0; V.timer = 0; snapValdemar();
  }

  // ------------------------------------------------------------------ (4.9.5) a ROTINA do seu Valdemar: abre às 8h, fecha às 20h (persiana desce) e vai para casa pela porta de serviço
  const H_ABRE = 8, H_FECHA = 20, H_ACORDA_V = 6.3, VEL_V = 2.2;
  const H_TRAB_INI = 8, H_TRAB_FIM = 16, PAGA_BASE = 20, PAGA_PEDIDO = 5;   // (5.1.1) expediente da cafeteria: 20 fakes pelo dia + 5 por pedido atendido (ver falarComLucia/turnoTrabalho)
  const lojaAberta = () => S.dados.hora >= H_ABRE && S.dados.hora < H_FECHA;
  const sumirV = (V) => { V.puxa = false; V.oculto = true; V.x = 0; V.z = -500; V.andando = false; V.fala = false; S.meus.delete(V.m); V.blob.visible = false; };
  const surgirV = (V, x, z, yaw) => { V.oculto = false; V.x = x; V.z = z; V.yaw = V.yawAlvo = yaw; S.meus.add(V.m); V.blob.visible = true; };
  // pontos da rua: da porta de serviço até a porta da casa dele (calçada → rua de terra leste → rua de terra sul → porta)
  function rotaCasaV() {
    const L = S.loja, C = S.casaValdemar;
    return [[L.portaX, L.portaZ - 1.7], [57, 8.1], [57, 38.2], [C.sx, 38.2], [C.sx, C.sz]];
  }
  // (4.9.6) a porta de dentro fica na parede lateral do vão do balcão; atrás dela ele anda "dentro" da loja (some) até a porta de serviço
  function portaDentroV() { const cx = (LANCHE.x0 + LANCHE.x1) / 2, cz = (LANCHE.z0 + LANCHE.z1) / 2, d = LANCHE.z1 - LANCHE.z0; return { x: cx - 1.9, px: cx - 0.8, z: cz - (d / 2 - 1.0) }; }
  const persianaPronta = (a) => () => Math.abs(S.loja.pk - a) < 0.01;
  function planoFechar() {
    const L = S.loja, B = S.balcao, D = portaDentroV();
    return [{ t: 'ir', pts: [[B.x, B.z - 0.35]], vel: 1.2 }, { t: 'virar', yaw: Math.PI / 2 }, { t: 'espera', s: 0.5 }, { t: 'puxa', a: true }, { t: 'persiana', a: 1 }, { t: 'ate', f: persianaPronta(1) }, { t: 'puxa', a: false }, { t: 'espera', s: 0.5 },
      { t: 'ir', pts: [[D.px, D.z]], vel: 1.5 }, { t: 'porta2', a: 1 }, { t: 'espera', s: 0.6 }, { t: 'ir', pts: [[D.x, D.z]], vel: 1.2 }, { t: 'sumir' }, { t: 'porta2', a: 0 },
      { t: 'espera', s: 2.4 }, { t: 'porta', a: 1 }, { t: 'espera', s: 0.7 },
      { t: 'surgir', x: L.portaX, z: L.portaZ + 0.1, yaw: Math.PI / 2 }, { t: 'ir', pts: [[L.portaX, L.portaZ - 1.6]], vel: 1.5 }, { t: 'porta', a: 0 },
      { t: 'ir', pts: rotaCasaV().slice(1), vel: VEL_V }, { t: 'sumir' }, { t: 'estado', e: 'casa' }];
  }
  // da hora de abrir até ele estar no balcão com a persiana levantada (usado ao chegar e ao carregar já de manhã cedo)
  function planoAbrirLoja() {
    const B = S.balcao, D = portaDentroV();
    return [{ t: 'ate', f: () => lojaAberta() }, { t: 'espera', s: 1.2 }, { t: 'porta2', a: 1 }, { t: 'surgir', x: D.x, z: D.z, yaw: 0 }, { t: 'ir', pts: [[D.px, D.z]], vel: 1.3 }, { t: 'porta2', a: 0 },
      { t: 'ir', pts: [[B.x, B.z - 0.35]], vel: 1.5 }, { t: 'virar', yaw: Math.PI / 2 }, { t: 'espera', s: 0.4 }, { t: 'puxa', a: true }, { t: 'persiana', a: 0 }, { t: 'ate', f: persianaPronta(0) }, { t: 'puxa', a: false }, { t: 'espera', s: 0.4 },
      { t: 'ir', pts: [[B.x, B.z]], vel: 1.0 }, { t: 'virar', yaw: Math.PI / 2 }, { t: 'estado', e: 'balcao' }];
  }
  function planoAbrir() {
    const L = S.loja, C = S.casaValdemar, volta = rotaCasaV().reverse();
    return [{ t: 'surgir', x: C.sx, z: C.sz, yaw: Math.PI / 2 }, { t: 'ir', pts: volta.slice(1), vel: VEL_V }, { t: 'ir', pts: [[L.portaX, L.portaZ - 0.9]], vel: 1.5 }, { t: 'porta', a: 1 }, { t: 'ir', pts: [[L.portaX, L.portaZ + 0.2]], vel: 1.2 },
      { t: 'sumir' }, { t: 'porta', a: 0 }].concat(planoAbrirLoja());
  }
  // posição "de partida" a partir da hora (usado ao carregar e ao voltar de dentro de um lugar, quando passou tempo)
  function snapValdemar() {
    const V = S.valdemar, L = S.loja, B = S.balcao, h = S.dados.hora; if (!V || !L) return;
    V.plano = null; V.avisando = false;
    V.puxa = false; L.k2 = L.alvo2 = 0;
    if (h >= H_ABRE && h < H_FECHA) { L.pk = L.palvo = 0; L.k = L.alvo = 0; surgirV(V, B.x, B.z, Math.PI / 2); V.estado = 'balcao'; }
    else { L.pk = L.palvo = 1; L.k = L.alvo = 0; sumirV(V); V.estado = h >= H_ACORDA_V && h < H_FECHA ? 'espera' : 'casa'; if (V.estado === 'espera') V.plano = planoAbrirLoja(); }
    tickLoja(0, true);
  }
  function tickLoja(dt, seco) {
    const L = S.loja; if (!L) return;
    L.k = seco ? L.alvo : L.k + (L.alvo - L.k) * Math.min(1, dt * 7); L.porta.rotation.y = -1.45 * L.k;
    L.k2 = seco ? L.alvo2 : L.k2 + (L.alvo2 - L.k2) * Math.min(1, dt * 7); L.porta2.rotation.y = 1.45 * L.k2;
    L.pk = seco ? L.palvo : L.pk + clamp(L.palvo - L.pk, -dt * 0.4, dt * 0.4);
    const h = Math.max(0.0001, 1.53 * L.pk); L.per.visible = L.pk > 0.005; L.per.scale.y = h; L.tex.repeat.set(7, Math.max(0.01, h * 5)); L.tex.offset.y = -L.tex.repeat.y;
  }
  function tickValdemar(V, dt) {
    const L = S.loja; if (!L) return;
    if (!V.plano) {
      if (V.estado === 'balcao' && !lojaAberta()) {
        const J = S.jog;
        if (J.sentado && S.sentadoEm && S.sentadoEm.lanche) { if (S.modo === 'livre' && !V.avisando) { V.avisando = true; avisoFechar().then(() => { V.avisando = false; }); } return; }
        if (!V.avisando) { V.plano = planoFechar(); V.passo = 0; V.timer = 0; V.estado = 'fechando'; }
      } else if (V.estado === 'casa' && S.dados.hora >= H_ACORDA_V && S.dados.hora < H_FECHA) { V.plano = planoAbrir(); V.passo = 0; V.timer = 0; V.estado = 'vindo'; }
      else return;
    }
    const P = V.plano[V.passo]; if (!P) { V.plano = null; return; }
    let fim = true;
    if (P.t === 'ir') {
      if (!V.rotaV) V.rotaV = P.pts.map((p) => ({ x: p[0], z: p[1] }));
      const q = V.rotaV[0], dx = q.x - V.x, dz = q.z - V.z, d = Math.hypot(dx, dz), v = P.vel * dt;
      V.vel = P.vel; V.correndo = false;
      if (d <= Math.max(v, 0.05)) { V.x = q.x; V.z = q.z; V.rotaV.shift(); if (V.rotaV.length) fim = false; else { V.rotaV = null; V.andando = false; } }
      else if (Math.hypot(S.jog.x - (V.x + dx / d * 0.6), S.jog.z - (V.z + dz / d * 0.6)) < 0.55 && !S.jog.sentado) { V.andando = false; fim = false; }   // o jogador no caminho: espera
      else { V.x += dx / d * v; V.z += dz / d * v; V.yawAlvo = Math.atan2(-dz, dx); V.andando = true; fim = false; }
    } else if (P.t === 'espera') { V.timer += dt; V.andando = false; if (V.timer < P.s) fim = false; else V.timer = 0; }
    else if (P.t === 'ate') { V.andando = false; if (!P.f()) fim = false; }
    else if (P.t === 'sumir') sumirV(V);
    else if (P.t === 'surgir') surgirV(V, P.x, P.z, P.yaw);
    else if (P.t === 'porta') L.alvo = P.a;
    else if (P.t === 'porta2') L.alvo2 = P.a;
    else if (P.t === 'puxa') V.puxa = P.a;
    else if (P.t === 'persiana') L.palvo = P.a;
    else if (P.t === 'virar') V.yawAlvo = P.yaw;
    else if (P.t === 'estado') V.estado = P.e;
    if (fim) { V.passo++; if (V.passo >= V.plano.length) V.plano = null; }
  }
  // 20h com o jogador sentado no balcão: ele avisa, levanta o jogador e fecha
  async function avisoFechar() {
    S.modo = 'cena'; UI.ctl.hidden = true; aviso('');
    try { await fala('val', T('Opa, já são 20h! Vou fechar a loja. Volta amanhã, a gente abre às 8h!')); Dialogo.esconder(); levantar(); } catch (e) { console.error(e); }
    if (S && S.ativo && S.modo === 'cena') liberar();
  }

  // ------------------------------------------------------------------ carros
  const CORES_CARRO = ['#c8352b', '#f4f4ec', '#1c1c1f', '#3a64b8', '#8c9199', '#f2c230', '#1f7a4d', '#7a4a2a', '#d8d8d0', '#a3162a', '#2a3f66'];
  function modeloCarro(cor, tipo) {
    const G = new Geo(), vid = '#2b3a48', esc = escurece(cor, 0.75);
    G.box(4.2, 0.72, 1.8, cor, 0, 0.32, 0);                                    // carroceria (de frente para +x)
    if (tipo === 'picape') {
      G.box(1.7, 0.66, 1.62, vid, 0.55, 1.04, 0); G.box(1.76, 0.1, 1.66, cor, 0.55, 1.66, 0);
      // caçamba: as laterais saem 1 cm da carroceria e o fundo fica 3 cm acima do teto dela (antes os dois planos coincidiam e piscavam)
      G.box(1.98, 0.4, 0.1, cor, -1.07, 1.02, 0.86); G.box(1.98, 0.4, 0.1, cor, -1.07, 1.02, -0.86); G.box(0.1, 0.4, 1.82, cor, -2.11, 1.02, 0);
      G.box(1.9, 0.05, 1.6, '#2a2a2a', -1.1, 1.07, 0);
    } else {
      G.box(2.2, 0.62, 1.6, vid, -0.2, 1.04, 0); G.box(2.06, 0.1, 1.64, cor, -0.2, 1.62, 0);
      G.box(0.16, 0.6, 1.64, cor, 0.78, 1.04, 0);                              // coluna entre para-brisa e janelas
    }
    for (const [x, z] of [[1.3, 0.8], [1.3, -0.8], [-1.3, 0.8], [-1.3, -0.8]]) { G.box(0.7, 0.66, 0.3, '#1c1c1f', x, 0, z); G.box(0.3, 0.3, 0.32, '#9a9a9a', x, 0.18, z); }
    G.box(0.12, 0.26, 1.86, '#3a3a3e', 2.12, 0.3, 0); G.box(0.12, 0.26, 1.86, '#3a3a3e', -2.12, 0.3, 0);   // para-choques
    G.box(0.04, 0.16, 0.6, esc, 2.12, 0.62, 0);
    const m = G.malha(MAT), L = new Geo();                          // (5.0.1) faróis e lanternas numa peça que "acende" à noite (material sem sombreamento)
    for (const z of [0.6, -0.6]) { L.box(0.08, 0.18, 0.36, '#fff6c8', 2.14, 0.74, z); L.box(0.08, 0.18, 0.36, '#e0302a', -2.14, 0.74, z); }
    m.add(L.malha(S.matFarol || (S.matFarol = guardar(new THREE.MeshBasicMaterial({ vertexColors: true })))));
    if (!S.matFarolChao) { S.geoFarol = guardar(new THREE.PlaneGeometry(1, 1)); S.geoFarol.rotateX(-Math.PI / 2); S.matFarolChao = guardar(new THREE.MeshBasicMaterial({ map: guardar(texBrilho()), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, color: 0xfff0c0, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 })); }
    const chao = new THREE.Mesh(S.geoFarol, S.matFarolChao); chao.scale.set(9, 1, 3.6); chao.position.set(6.2, 0.06, 0); chao.renderOrder = 2; chao.visible = false; m.add(chao); m.userData.chao = chao;
    return m;
  }
  function criarCarros() {
    const rnd = semente(404);
    S.carros = [];
    for (let i = 0; i < 12; i++) {
      const m = modeloCarro(CORES_CARRO[Math.floor(rnd() * CORES_CARRO.length)], rnd() < 0.25 ? 'picape' : 'carro');
      m.visible = false; S.grupo.add(m);
      S.carros.push({ m, chao: m.userData.chao, ativo: false, x: 0, z: 0, dir: 1, v: 0, vmax: 10, parado: 0, buzinou: false, porJog: false });
    }
    S.pistaT = [1.5, 3.5];
    // já começa com alguns carros espalhados pela avenida (a cidade não começa vazia)
    let k = 0; for (const p of PISTAS) for (const x of [-170, -60, 90]) ativarCarro(S.carros[k++], p, x * p.dir);
  }
  function ativarCarro(c, p, x) { c.ativo = true; c.dir = p.dir; c.z = p.z; c.x = x; c.vmax = 9 + Math.random() * 4; c.v = c.vmax; c.parado = 0; c.buzinou = false; c.m.visible = true; c.m.rotation.y = p.dir > 0 ? 0 : Math.PI; }
  // (5.5.0) a faixa de pedestre: x de 7,7 a 11,9. linhaFaixa = quanto o carro ainda anda até parar antes dela (a frente tem 2,1 m)
  const linhaFaixa = (c) => (c.dir > 0 ? (7.2 - c.x) - 2.1 : (c.x - 12.4) - 2.1);
  const carroNaoPara = () => S.carros.some((c) => { if (!c.ativo) return false; const dl = linhaFaixa(c); return (dl > -6.8 && dl < 0) || (c.v > 1.5 && dl >= 0 && dl < (c.v * c.v) / (2 * 5.5) + 0.6); });
  // (5.5.0) 10 s travado: buzina várias vezes; quem está na frente leva um susto e volta para a calçada
  function assustar(c, P) {
    for (let k = 1; k < 4; k++) setTimeout(() => { if (S && S.ativo && !S.dentro) buzina(c); }, k * 380);
    if (P === S.jog) { if (S.modo === 'livre') sustoJogador(c); return; }
    P.esbarrao = 0.9; P.atravessa = P.pedeFaixa = false; if (P.dest && P.dest.tipo !== 'lugar') P.dest = null;
    P.recua = calcadaPerto(P);
  }
  // de volta para a calçada de onde veio (se ela estiver perto); senão, a calçada mais próxima, em linha reta
  const calcadaPerto = (P) => (P.seguro && Math.hypot(P.seguro.x - P.x, P.seguro.z - P.z) < 8 ? P.seguro : { x: P.x, z: P.z < AV.zc ? AV.z0 - 1.0 : AV.z1 + 1.0 });
  async function sustoJogador(c) {
    const J = S.jog; S.modo = 'cena'; UI.ctl.hidden = true; J.andando = false; J.correndo = false;
    try {
      J.yawAlvo = Math.atan2(-(c.z - J.z), c.x - J.x); J.esbarrao = 0.9; aviso(T('Eita! Foi mal!'));
      await esperar(1300);
      const p = calcadaPerto(J);
      J.correndo = true; await andar(J, [[p.x, p.z]], 4.6); J.correndo = false;
      aviso('');
    } catch (e) { console.error(e); }
    if (S && S.ativo && S.modo === 'cena') liberar();
  }
  function tickCarros(dt) {
    const J = S.jog, FIM = 270;
    const obst = [J].concat(S.npcs.filter((A) => !A.oculto && !A.longeDemais && !A.sentado && (A.tipo === 'anda' || A.tipo === 'morador' || A.tipo === 'rua' || A.tipo === 'luciaRua' || A.recua) && A.z > AV.z0 - 1 && A.z < AV.z1 + 1));
    const faixa = S.npcs.some((A) => !A.oculto && (A.pedeFaixa || A.atravessa));
    for (let i = 0; i < PISTAS.length; i++) {                        // novos carros entram pelas pontas (longe, na névoa)
      S.pistaT[i] -= dt; if (S.pistaT[i] > 0) continue;
      const p = PISTAS[i], x0 = -p.dir * FIM, livre = !S.carros.some((c) => c.ativo && c.z === p.z && Math.abs(c.x - x0) < 16);
      const c = S.carros.find((q) => !q.ativo);
      if (c && livre) ativarCarro(c, p, x0);
      S.pistaT[i] = 4 + Math.random() * 7;
    }
    for (const c of S.carros) {
      if (!c.ativo) continue;
      // espaço livre à frente: o jogador (se estiver na frente, na faixa do carro) e o carro da frente
      let folga = 1e9, bloq = null;
      for (const P of obst) {                                        // o jogador e as pessoas andando (atravessando na faixa, por exemplo)
        if (!P || Math.abs(P.z - c.z) >= 1.75) continue; const fr = (P.x - c.x) * c.dir;
        if (fr > -1.2) { const f = fr - 2.1 - 0.3 - 1.6; if (f < folga) { folga = f; bloq = P; } }
      }
      for (const o of S.carros) { if (o === c || !o.ativo || o.z !== c.z) continue; const fr = (o.x - c.x) * c.dir; if (fr > 0) { const f = fr - 4.2 - 2.2; if (f < folga) { folga = f; bloq = null; } } }
      if (faixa) {                                                   // (5.5.0) para antes da faixa (se ainda dá para frear; depois de decidir, para mesmo)
        const dl = linhaFaixa(c);
        if (!c.paraFaixa && dl > -0.5 && dl >= (c.v * c.v) / (2 * 5.5) - 0.4) c.paraFaixa = true;
        if (c.paraFaixa && dl > -0.5) { if (dl < folga) { folga = Math.max(0, dl); bloq = null; } } else c.paraFaixa = false;
      } else c.paraFaixa = false;
      const porJog = bloq === J;
      const alvo = folga <= 0 ? 0 : Math.min(c.vmax, Math.sqrt(2 * 5.5 * folga));
      if (alvo < c.v) c.v = Math.max(alvo, c.v - 12 * dt); else c.v = Math.min(alvo, c.v + 2.6 * dt);
      const passo = Math.min(c.v * dt, Math.max(0, folga));
      c.x += c.dir * passo;
      if (c.v < 0.3 && bloq) { c.parado += dt; if (c.parado > 1.6 && !c.buzinou) { c.buzinou = true; buzina(c); } if (c.parado > 10 && !c.assustou) { c.assustou = true; assustar(c, bloq); } }   // (5.5.0) 10 s travado: susto
      else if (c.v > 3) { c.parado = 0; c.buzinou = false; c.assustou = false; }
      void porJog;
      c.m.position.set(c.x, 0, c.z);
      if (c.dir * c.x > FIM) { c.ativo = false; c.m.visible = false; }
    }
  }
  // buzina "bi-bi" (sintetizada, mais baixa quando longe)
  function buzina(c) {
    const A = typeof Som !== 'undefined' && Som.audio && !Som.mudo ? Som.audio.ctx : null; if (!A) return;
    try {
      const d = Math.hypot(c.x - S.jog.x, c.z - S.jog.z), vol = 0.07 / Math.max(1, d / 6), t0 = A.currentTime;
      for (const [ini, dur] of [[0, 0.13], [0.2, 0.22]]) for (const f of [415, 523]) {
        const o = A.createOscillator(), g = A.createGain(); o.type = 'square'; o.frequency.value = f;
        g.gain.setValueAtTime(0, t0 + ini); g.gain.linearRampToValueAtTime(vol, t0 + ini + 0.01); g.gain.setValueAtTime(vol, t0 + ini + dur - 0.02); g.gain.linearRampToValueAtTime(0, t0 + ini + dur);
        o.connect(g); g.connect(A.destination); o.start(t0 + ini); o.stop(t0 + ini + dur + 0.02);
      }
    } catch (e) { /* sem som */ }
  }


  // ------------------------------------------------------------------ velocidades (a cidade usa a escala de atributos do jogo: hoje 0–10, 7 = normal)
  const VEL_CIDADE = 7;                                              // velocidade do personagem NA CIDADE (depois isto vira 0–100)
  const ANDAR = 3.1, CORRER = 5.76;                                  // m/s com velocidade 7 (os mesmos da partida: USER_WALK / USER_RUN de base)
  const fVel = () => Math.pow(clamp(VEL_CIDADE / 7, 0.15, 1.6), 0.35);
  const LIMIAR_CORRER = 0.97;                                        // como na partida: direcional quase na borda = corre (o fôlego na cidade nunca acaba)

  // ------------------------------------------------------------------ atores: o jogador e as pessoas da cidade (mesmas poses)
  function poseAtor(A, dt) {
    const m = A.m, r = m.raiz, e = Math.min(1, dt * 10), es = A.opt.escala || 1;
    usarJoelhos(m, 0, 0); usarCotovelo(m.bracoE, 0, 0); usarCotovelo(m.bracoD, 0, 0); r.rotation.z = 0; r.rotation.x = 0; m.corpo.rotation.z = 0;
    if (m.cabecaLigada) usarCabeca(m, 0);
    if (A.celeb) {                                                   // (4.9.3) comemoração de gol (as mesmas poses da partida)
      const C = A.celeb, tc = C.t % C.c.dur, P = celebPose(C.c, tc), corre = tc < C.c.swing ? Math.sin(A.anim || 0) * 0.9 : 0;
      r.position.y = A.y + P.y; r.rotation.x = P.roll; m.corpo.rotation.z = P.lean;
      m.bracoE.rotation.z = P.aLz; m.bracoD.rotation.z = P.aRz; m.bracoE.rotation.x = P.aLx; m.bracoD.rotation.x = P.aRx;
      m.pernaE.rotation.z = P.lLz + corre; m.pernaD.rotation.z = P.lRz - corre; usarJoelhos(m, P.jL || 0, P.jR || 0);
      r.position.x = A.x; r.position.z = A.z; r.rotation.y = A.yaw; A.blob.position.set(A.x, A.y + 0.02, A.z);
      return;
    }
    if (A.vomita > 0) {                                              // (5.0.0) passando mal: curvado, mãos nos joelhos, o corpo dá uns trancos
      const h = A.vomita > 0.7 && A.vomita < 2.6 ? Math.sin(A.vomita * 13) * 0.07 : 0, k = Math.min(1, A.vomita / 0.5);
      m.corpo.rotation.z = (-0.6 + h) * k; usarJoelhos(m, -0.35 * k, -0.35 * k); m.pernaE.rotation.z = m.pernaD.rotation.z = 0.22 * k;
      m.bracoE.rotation.z = m.bracoD.rotation.z = 0.8 * k; m.bracoE.rotation.x = -0.12; m.bracoD.rotation.x = 0.12;
      r.position.y = A.y - 0.05 * k; r.position.x = A.x; r.position.z = A.z; r.rotation.y = A.yaw; A.blob.position.set(A.x, A.y + 0.02, A.z); return;
    }
    if (A.deitado) {                                                 // (4.9.6) deitado de barriga para cima (a cabeça fica para o lado de -x do personagem)
      const yw = A.yaw; r.rotation.z = Math.PI / 2; r.rotation.y = yw; r.position.y = A.y + 0.24 * es;
      r.position.x = A.x + 0.8 * es * Math.cos(yw); r.position.z = A.z - 0.8 * es * Math.sin(yw);
      m.pernaE.rotation.z = m.pernaD.rotation.z = 0; m.bracoE.rotation.z = m.bracoD.rotation.z = 0.1; m.bracoE.rotation.x = m.bracoD.rotation.x = 0;
      A.blob.position.set(A.x, A.y + 0.02, A.z); return;
    }
    if (A.sentado) {                                                 // sentado no banco (as mãos gesticulam quando fala)
      r.position.y = A.y + A.assento - 0.67 * es; if (A.chao) { m.pernaE.rotation.z = m.pernaD.rotation.z = 1.4; usarJoelhos(m, -0.3, -0.3); } else { m.pernaE.rotation.z = m.pernaD.rotation.z = 1.5; usarJoelhos(m, -1.5, -1.5); }
      const f = Math.sin(A.t * 5.5) * 0.3;
      m.bracoE.rotation.z = lerp(m.bracoE.rotation.z, A.fala ? 0.55 + f * 0.4 : 0.4, e); m.bracoD.rotation.z = lerp(m.bracoD.rotation.z, A.fala ? 1.0 + f : 0.4, e);
      if (A.fala) usarCotovelo(m.bracoD, 0, 0.8 + f);
      if (A.comendo > 0) {                                           // (4.9.3) comendo: as duas mãos levam o lanche à boca e a cabeça balança mastigando
        m.bracoE.rotation.z = 1.25; m.bracoD.rotation.z = 1.25; m.bracoE.rotation.x = -0.32; m.bracoD.rotation.x = 0.32;
        const mord = Math.max(0, Math.sin(A.t * 7)); usarCotovelo(m.bracoE, 0, 1.55 + mord * 0.25); usarCotovelo(m.bracoD, 0, 1.55 + mord * 0.25);
        usarCabeca(m, -0.05 + Math.sin(A.t * 9) * 0.12);
      }
      if (A.bebe > 0) {                                              // (5.2.1) tomando o café: a mão para a uns 15 cm na frente da boca e só "bebe" (gole = leve vaivém)
        const gole = Math.max(0, Math.sin(A.t * 2.4)), oz = 1.22 + gole * 0.08, cz = 1.2 + gole * 0.12;
        m.bracoD.rotation.z = oz; usarCotovelo(m.bracoD, 0, cz);
        usarCabeca(m, 0.07 * gole);                                    // inclina a cabeça um pouquinho para trás no gole
        if (A.copoCli) A.copoCli.rotation.z = -(oz + cz);
      }
    } else if (A.tipo === 'rosca' && !A.andando) {                   // (4.9.4) academia: rosca com halteres
      const c = Math.max(0, Math.sin(A.t * 2.4)); m.bracoE.rotation.x = 0.12; m.bracoD.rotation.x = -0.12;
      usarCotovelo(m.bracoE, 0, 0.2 + c * 1.9); usarCotovelo(m.bracoD, 0, 0.2 + c * 1.9); r.position.y = A.y;
    } else if (A.chuteT >= 0) {                                      // (4.9.3) chute do treino: perna de trás e depois para a frente
      const t = A.chuteT, pr = t < 0.16 ? -t / 0.16 * 0.9 : -0.9 + Math.min(1, (t - 0.16) / 0.14) * 2.2;
      m.pernaD.rotation.z = pr; m.pernaE.rotation.z = -0.15; m.bracoE.rotation.x = 0.7; m.bracoD.rotation.x = -0.5; m.bracoE.rotation.z = 0.3;
      r.position.y = A.y;
    } else if (A.andando && !A.goleiro) {
      const k = A.correndo ? 1.1 : 0.75; A.fase += dt * A.vel * (A.correndo ? 2.9 : 4.6); const s = Math.sin(A.fase);
      m.pernaE.rotation.z = s * k; m.pernaD.rotation.z = -s * k; m.bracoE.rotation.z = -s * k * 0.8; m.bracoD.rotation.z = s * k * 0.8;
      if (A.correndo) { usarCotovelo(m.bracoE, 0, 1.3); usarCotovelo(m.bracoD, 0, 1.3); }
      r.position.y = A.y + Math.abs(Math.cos(A.fase)) * (A.correndo ? 0.07 : 0.025);
    } else {
      m.pernaE.rotation.z = lerp(m.pernaE.rotation.z, 0, e); m.pernaD.rotation.z = lerp(m.pernaD.rotation.z, 0, e);
      const f = Math.sin(A.t * 5), g = Math.sin(A.t * 5 + 2);
      if (A.goleiro) { usarJoelhos(m, -0.45, -0.45); m.bracoE.rotation.x = 0.75; m.bracoD.rotation.x = -0.75; m.bracoE.rotation.z = 0.35; m.bracoD.rotation.z = 0.35; r.position.y = A.y - 0.06; m.bracoE.rotation.y = 0; r.position.x = A.x; r.position.z = A.z; r.rotation.y = A.yaw; A.blob.position.set(A.x, A.y + 0.02, A.z); return; }
      m.bracoE.rotation.z = lerp(m.bracoE.rotation.z, A.fala ? f * 0.35 + 0.4 : 0, e); m.bracoD.rotation.z = lerp(m.bracoD.rotation.z, A.fala ? g * 0.35 + 0.45 : 0, e);
      if (A.fala) usarCotovelo(m.bracoD, 0, 0.6 + g * 0.3);
      r.position.y = A.y;
    }
    if (A.puxa) { const b = Math.sin(A.t * 3.2) * 0.22; m.bracoE.rotation.z = m.bracoD.rotation.z = 2.35 + b; usarCotovelo(m.bracoE, 0, 0.35 - b); usarCotovelo(m.bracoD, 0, 0.35 - b); }   // (4.9.6) puxando a persiana
    if (A.chuva && !A.sentado) { m.bracoD.rotation.z = 2.55; usarCotovelo(m.bracoD, 0, 1.1); if (A.chuva !== 'guarda') { m.bracoE.rotation.z = Math.min(m.bracoE.rotation.z, 0.6); } }   // (4.9.5) na chuva: o braço sobe até a cabeça (mão, jornal ou guarda-chuva)
    m.bracoE.rotation.x = 0; m.bracoD.rotation.x = A.sentado && A.bebe > 0 ? 0.45 : 0;   // (5.2.1) bebendo: a mão fecha para a frente da boca
    if ((A.pedeFaixa || A.atravessa) && !A.sentado && !A.recua) { m.bracoD.rotation.z = 0.25; m.bracoD.rotation.x = -1.45; usarCotovelo(m.bracoD, 0, 0.15); }   // (5.5.0) mão estendida para os carros
    if (A.esbarrao > 0) { A.esbarrao = Math.max(0, A.esbarrao - dt); m.corpo.rotation.z = -Math.sin(A.esbarrao * 20) * A.esbarrao * 0.5; }   // (5.5.0) esbarrão: cambaleia (como o técnico)
    if (A.copoCli && A.sentado && A.bebe > 0) A.copoCli.rotation.x = -0.45;
    r.position.x = A.x; r.position.z = A.z; r.rotation.y = A.yaw;
    A.blob.position.set(A.x, A.y + 0.02, A.z);
  }
  function sombraAtor(raio) {
    const b = new THREE.Mesh(S.geoSombra || (S.geoSombra = guardar(new THREE.CircleGeometry(1, 12))), S.matSombra || (S.matSombra = guardar(new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.32, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }))));
    b.scale.set(raio, raio, 1); b.rotation.x = -Math.PI / 2; S.grupo.add(b); return b;
  }
  function criarJogador(f2, H) {
    let m = null, opt = null;
    try { if (f2 && typeof f2.modeloJogador === 'function') { const r = f2.modeloJogador(H && H.fase2); m = r.m; opt = r.opt; } } catch (e) { console.warn('[Cidade] roupa da Fase 2:', e); }
    if (!m) {
      const ap = PERSONAGEM.aparencia || {};
      opt = { camisa: '#3a64b8', listra: '#f2f2ee', gola: '#f2f2ee', calcao: '#8c9199', meia: ap.pele || '#946042', sola: '#e6e6e0', corTexto: '#F2F2EE', numero: '', nome: ' ', fundoNome: 'rgba(0,0,0,0)',
        barba: 0, manga: 0, meiao: 1, labio: ap.labio == null ? 3 : ap.labio, cabecao: 1.08, escala: 0.9, pele: ap.pele || '#946042', cabelo: ap.cabelo || '#1C140F', estilo: ap.estilo | 0, rosto: ap.rosto | 0, corBarba: ap.cabelo || '#1C140F' };
      m = makeAthlete(opt); m.etiqueta.visible = false; m.sombra.visible = false;
    }
    S.grupo.add(m.raiz); S.meus.add(m);
    // anel embaixo do jogador, na cor da marca do mapa (só aparece com uma marca)
    const anel = new THREE.Mesh(guardar(new THREE.RingGeometry(0.42, 0.56, 28)), guardar(new THREE.MeshBasicMaterial({ color: 0xf0a020, transparent: true, opacity: 0.9, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 })));
    anel.rotation.x = -Math.PI / 2; anel.visible = false; S.grupo.add(anel);
    return { m, opt, blob: sombraAtor(0.3), anel, x: SPAWN.x, z: SPAWN.z, y: 0.12, yaw: -Math.PI / 2, yawAlvo: -Math.PI / 2, fase: 0, vel: 2.6, t: 0, andando: false, correndo: false, rota: null, rotaRes: null };
  }

  // ------------------------------------------------------------------ PESSOAS (NPCs): andam por uma rede de caminhos, desviam, esperam a faixa, sentam e conversam
  const PAL_BLUSA = ['#f2f2ee', '#c8352b', '#3a64b8', '#f2c230', '#1f7a4d', '#7a4fb0', '#d95fa0', '#e8742a', '#8c9199', '#3fb7b0', '#a3162a', '#556b2f', '#9bd1f0'];
  const PAL_CALCA = ['#2a3f66', '#1c1c1f', '#4a6fa5', '#7a4a2a', '#8c9199', '#d8c39a', '#556b2f'];
  function criarPessoa(f2, rnd, fem) {
    const pk = (l) => l[Math.floor(rnd() * l.length)], ap = gerarAparencia(1 + Math.floor(rnd() * 1e9), fem ? 'F' : 'M');
    let m = null, opt = null;
    try { if (f2 && typeof f2.modeloPessoa === 'function') { const r = f2.modeloPessoa({ ap, fem, roupa: Math.floor(rnd() * 40), cores: [pk(PAL_BLUSA), pk(PAL_CALCA), pk(PAL_BLUSA), '#f2f2ee'] }); m = r.m; opt = r.opt; } } catch (e) { console.warn('[Cidade] roupa das pessoas:', e); }
    if (!m) {
      opt = Object.assign({ camisa: pk(PAL_BLUSA), listra: '#f2f2ee', gola: '#f2f2ee', calcao: pk(PAL_CALCA), meia: '#f2f2ee', sola: '#e6e6e0', corTexto: '#F2F2EE', numero: '', nome: ' ', fundoNome: 'rgba(0,0,0,0)', manga: 0, meiao: 1 }, ap, { cabecao: 1, escala: 1, barba: fem ? 0 : ap.barba });
      m = makeAthlete(opt); m.etiqueta.visible = false; m.sombra.visible = false;
    }
    S.grupo.add(m.raiz); S.meus.add(m);
    return { m, opt, blob: sombraAtor(0.32), x: 0, z: 0, y: 0, yaw: 0, yawAlvo: 0, fase: rnd() * 6, vel: 1.15 + rnd() * 0.4, t: rnd() * 10, andando: false, fala: false, sentado: false, assento: 0.52, espera: 0, bloq: 0, tipo: 'anda' };
  }
  // a rede: linhas pelos caminhos (calçadas, faixa de pedestre, ruas de terra, praça). Pontos repetidos viram o mesmo nó (cruzamentos).
  function montarRede() {
    const nos = [], idx = new Map();
    const no = (x, z) => { const k = Math.round(x * 4) + ',' + Math.round(z * 4); if (idx.has(k)) return idx.get(k); nos.push({ x, z, viz: [] }); idx.set(k, nos.length - 1); return nos.length - 1; };
    const liga = (a, b) => { if (a === b) return; if (!nos[a].viz.includes(b)) nos[a].viz.push(b); if (!nos[b].viz.includes(a)) nos[b].viz.push(a); };
    const linha = (pts) => { let ant = no(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) { const [x0, z0] = pts[i - 1], [x1, z1] = pts[i], n = Math.max(1, Math.round(Math.hypot(x1 - x0, z1 - z0) / 10)); for (let k = 1; k <= n; k++) { const c = no(x0 + (x1 - x0) * k / n, z0 + (z1 - z0) * k / n); liga(ant, c); ant = c; } } };
    const cx = PRACA_C.x, cz = PRACA_C.z, ZN = -4.2, ZS = 8.1, XW = -58.4, XE = 57, XF = cx;
    linha([[-116, ZN], [XW, ZN], [XF, ZN], [XE, ZN], [116, ZN]]);                    // calçada norte
    linha([[-116, ZS], [XW, ZS], [XF, ZS], [XE, ZS], [116, ZS]]);                    // calçada sul
    linha([[XF, ZN], [XF, ZS]]);                                                     // faixa de pedestre
    linha([[XW, ZN], [XW, -35.8], [XW, -72]]); linha([[XW, ZS], [XW, 38.2], [XW, 72]]);   // rua de terra oeste
    linha([[XE, ZN], [XE, -72]]); linha([[XE, ZS], [XE, 38.2], [XE, 72]]);                // rua de terra leste
    linha([[-116, -35.8], [XW, -35.8], [0, -35.8], [0, -31], [cx, -29.5]]);           // rua de terra norte até o adro da igreja
    linha([[-116, 38.2], [XW, 38.2], [-41, 38.2], [XE, 38.2]]); linha([[-41, 38.2], [-41, 46]]);   // rua de terra sul e o caminho do lago
    linha([[cx, ZN], [cx, cz + 4]]); linha([[cx, cz - 4], [cx, -29.5]]);              // praça: caminho do meio (dá a volta no canteiro)
    linha([[cx, cz + 4], [cx + 4, cz], [cx, cz - 4], [cx - 4, cz], [cx, cz + 4]]);
    linha([[-10.5, cz], [cx - 4, cz]]); linha([[cx + 4, cz], [30, cz]]);
    for (const n of nos) n.faixa = Math.abs(n.x - XF) < 0.1 && (Math.abs(n.z - ZN) < 0.1 || Math.abs(n.z - ZS) < 0.1);
    S.rede = nos;
  }
  // (5.5.0) quem tem ROTINA (horário e destino certos) não para por causa do jogador: passa e o jogador é que cambaleia
  const temRotina = (A) => !!A && (A.tipo === 'morador' || A.tipo === 'valdemar' || A.tipo === 'luciaRua' || A.tipo === 'rua');
  function pessoaNoCaminho(x, z, A) {
    for (const B of S.npcs) { if (B === A || B.oculto) continue; const dn = Math.hypot(x - B.x, z - B.z); if (dn < 0.58 && dn < Math.hypot(A.x - B.x, A.z - B.z) - 1e-4) return B; }
    return null;
  }
  // dois no mesmo caminho: um passa (fantasma por um instante) e o outro cambaleia e espera. Quem tem rotina sempre passa.
  function cruzar(A, B) {
    if (temRotina(B) && !temRotina(A)) { if (!(A.esbarrao > 0.05)) A.esbarrao = 0.6; A.travaE = 0.9; return false; }
    if (!(B.esbarrao > 0.05)) B.esbarrao = 0.6; if (!B.sentado) B.travaE = 0.9; A.fantasma = 0.7; return true;
  }
  function livreNPC(x, z, A, semJog, ignorarGente) {
    if (S.dentro) { const L = S.dentro.lim; if (x < L.x0 || x > L.x1 || z < L.z0 || z > L.z1) return false; }
    else if (x < LIM.x0 + 1 || x > LIM.x1 - 1 || z < LIM.z0 + 1 || z > LIM.z1 - 1) return false;
    if (!S.dentro && z > AV.z0 - 0.05 && z < AV.z1 + 0.05 && !(x > 7.7 && x < 11.9)) return false;      // no asfalto, só pela faixa de pedestre
    const rr = 0.28;
    for (const b of S.col) if (x > b.x0 - rr && x < b.x1 + rr && z > b.z0 - rr && z < b.z1 + rr) return false;
    for (const c of S.circ) if (Math.hypot(x - c.x, z - c.z) < c.r + rr) return false;
    if (!S.dentro) { const ex = (x - LAGO.cx) / (LAGO.rx + 0.5), ez = (z - LAGO.cz) / (LAGO.rz + 0.5); if (ex * ex + ez * ez < 1) return false; }
    if (!S.dentro && S.portao.k > 0.3) for (const b of S.portao.col) if (x > b.x0 - rr && x < b.x1 + rr && z > b.z0 - rr && z < b.z1 + rr) return false;
    if (!S.dentro) for (const c of S.carros) if (c.ativo && Math.abs(x - c.x) < 2.15 + rr && Math.abs(z - c.z) < 0.95 + rr) return false;
    if (ignorarGente) return true;
    if (!semJog && !temRotina(A) && Math.hypot(x - S.jog.x, z - S.jog.z) < 0.62) return false;
    if (A && A.fantasma > 0) return true;
    for (const B of S.npcs) {
      if (B === A || B.oculto) continue;
      const dn = Math.hypot(x - B.x, z - B.z);
      if (dn < 0.58) { if (A && dn >= Math.hypot(A.x - B.x, A.z - B.z) - 1e-4 && Math.hypot(A.x - B.x, A.z - B.z) < 0.58) continue; return false; }   // (4.9.6) já sobrepostos: afastar é sempre permitido
    }
    return true;
  }
  const carroVindo = () => S.carros.some((c) => { if (!c.ativo || c.v < 1) return false; const fr = (PRACA_C.x - c.x) * c.dir; return fr > -3 && fr < 28; });
  function passoNPC(A, dt) {
    if (A.dest) { tickDestino(A, dt); return; }
    A.cool = (A.cool == null ? 5 + Math.random() * 25 : A.cool) - dt;
    if (A.espera > 0) { A.espera -= dt; A.andando = false; return; }
    if (A.travaE > 0) { A.travaE -= dt; A.andando = false; return; }      // (5.5.0) esbarrou: espera o outro passar
    const N = S.rede[A.alvo], dx = N.x - A.x, dz = N.z - A.z, d = Math.hypot(dx, dz);
    if (d < 0.6) {                                                   // chegou no nó: escolhe o próximo (não volta, a não ser que seja ponta)
      if (A.cool <= 0 && !S.dentro) { decidirDestino(A); if (A.dest) return; }               // (4.9.6) de cada 10 pedestres que decidem, 5 entram num lugar
      const op = N.viz.filter((i) => i !== A.ant), prox = op.length ? op[Math.floor(Math.random() * op.length)] : A.ant;
      if (A.tipo === 'anda' && borda(N) && Math.hypot(A.x - S.jog.x, A.z - S.jog.z) > 80) { reciclarPedestre(A); return; }   // (5.5.0) saiu pela ponta do mapa
      if (N.faixa && S.rede[prox].faixa) {                           // (5.5.0) vai atravessar: estende a mão; os carros que dá param
        A.pedeFaixa = true;
        if (carroNaoPara()) { A.espera = 0.3; A.andando = false; return; }
        A.atravessa = true; A.pedeFaixa = false;
      } else if (N.faixa) { A.atravessa = false; A.pedeFaixa = false; }   // chegou do outro lado
      A.ant = A.alvo; A.alvo = prox; if (Math.random() < 0.05) A.espera = 2 + Math.random() * 4;
      return;
    }
    const v = A.vel * dt; let moveu = false;
    { const nx = A.x + dx / d * v, nz = A.z + dz / d * v;            // (5.5.0) gente no caminho: um passa, o outro cambaleia
      if (!livreNPC(nx, nz, A) && livreNPC(nx, nz, A, true, true)) { const B = pessoaNoCaminho(nx, nz, A); if (B) { if (cruzar(A, B)) { A.x = nx; A.z = nz; A.yawAlvo = Math.atan2(-dz, dx); A.andando = true; A.bloq = 0; } else A.andando = false; return; }
        if (Math.hypot(nx - S.jog.x, nz - S.jog.z) < 0.62 && !(A.esbarrao > 0.05)) { A.esbarrao = 0.5; A.travaE = 0.7; A.andando = false; return; } } }   // o jogador na frente: cambaleia e espera
    for (const ang of [0, 0.45, -0.45, 0.9, -0.9, 1.4, -1.4]) {     // desvia de quem estiver na frente (gente, poste, mesa...)
      const ca = Math.cos(ang), sa = Math.sin(ang), ux = (dx * ca - dz * sa) / d, uz = (dx * sa + dz * ca) / d;
      if (livreNPC(A.x + ux * v, A.z + uz * v, A)) { A.x += ux * v; A.z += uz * v; A.yawAlvo = Math.atan2(-uz, ux); moveu = true; break; }
    }
    A.andando = moveu;
    if (!moveu) { A.bloq += dt; if (A.bloq > 1.6) { const t = A.alvo; A.alvo = A.ant != null ? A.ant : t; A.ant = t; A.bloq = 0; A.espera = 0.4 + Math.random(); } }
    else A.bloq = Math.max(0, A.bloq - dt * 0.5);
  }
  function criarPessoas(f2) {
    const rnd = semente(1717); S.npcs = []; S.conversas = [];
    montarRede();
    // 8 andando, cada um começando num nó diferente (longe da porta do prédio)
    const usados = new Set();
    for (let i = 0; i < 8; i++) {
      let k; do { k = Math.floor(Math.random() * S.rede.length); } while (usados.has(k) || S.rede[k].faixa || Math.hypot(S.rede[k].x - SPAWN.x, S.rede[k].z - SPAWN.z) < 8);
      usados.add(k);
      const A = criarPessoa(f2, Math.random, Math.random() < 0.5), N = S.rede[k];   // (5.5.0) gente diferente todo dia
      A.x = N.x; A.z = N.z; A.ant = null; A.alvo = N.viz[Math.floor(rnd() * N.viz.length)];
      S.npcs.push(A);
    }
    const cx = PRACA_C.x, cz = PRACA_C.z;
    // 4 sentados em dois bancos da praça, conversando
    for (const B of [S.bancos[2], S.bancos[1]]) {
      const par = [];
      B.lugares.forEach((L, i) => {
        const A = criarPessoa(f2, rnd, rnd() < 0.5), s = i ? -1 : 1; A.tipo = 'senta'; A.sentado = true; A.x = L.x; A.z = L.z; A.assento = L.h; L.ocupado = A; A.lugar = L;
        A.yaw = A.yawAlvo = Math.atan2(-L.fz, L.fx + s * 0.35 * (L.fz ? 1 : 0)) ;   // de frente para o caminho, virados um para o outro
        S.npcs.push(A); par.push(A);
      });
      S.conversas.push({ a: par[0], b: par[1], t: 0, quem: 0, prox: 2 });
    }
    // 2 em pé conversando (na praça e no adro da igreja)
    for (const [x, z] of [[cx - 13, cz - 6.5], [cx + 4.6, -31.2]]) {
      const a = criarPessoa(f2, rnd, rnd() < 0.5), b = criarPessoa(f2, rnd, rnd() < 0.5);
      a.tipo = b.tipo = 'conversa'; a.x = x; a.z = z; b.x = x + 1.15; b.z = z; a.yaw = a.yawAlvo = 0; b.yaw = b.yawAlvo = Math.PI;
      S.npcs.push(a, b); S.conversas.push({ a, b, t: 0, quem: 0, prox: 2.5 });
    }
    for (const A of S.npcs) poseAtor(A, 0.016);
    S.pedestres = [S.jog, ...S.npcs.filter((A) => A.tipo === 'anda')];
  }
  function tickPessoas(dt) {
    for (const C of S.conversas) {                                    // revezam quem fala
      C.t += dt; if (C.t > C.prox) { C.t = 0; C.quem = Math.random() < 0.2 ? -1 : 1 - Math.max(0, C.quem); C.prox = 1.5 + Math.random() * 3; }
      C.a.fala = C.quem === 0; C.b.fala = C.quem === 1;
      if (C.a.tipo === 'morador' || C.b.tipo === 'morador' || C.a.oculto || C.b.oculto) { C.a.fala = C.b.fala = false; continue; }   // (4.9.6) quem saiu para casa/árvore não conversa
      if (!C.a.sentado) { C.a.yawAlvo = Math.atan2(-(C.b.z - C.a.z), C.b.x - C.a.x); C.b.yawAlvo = Math.atan2(-(C.a.z - C.b.z), C.a.x - C.b.x); }
    }
    if (!S.dentro) { tickMoradores(dt); separarPessoas(); gerenciarPedestres(dt); } else tickFluxo(dt);
    const J0 = S.jog;
    for (const A of S.npcs.slice()) {                                    // (cópia: um cliente pode sair da lista no meio do laço)
      if (A.fantasma > 0) A.fantasma -= dt;
      if (!S.dentro && A.tipo === 'anda' && !A.dest && !A.oculto && Math.hypot(A.x - J0.x, A.z - J0.z) > 100) {   // (5.5.0) longe: parado e invisível
        A.longeDemais = true; A.m.longe = true; if (A.boneco) A.boneco.visible = false; A.blob.visible = false; A.andando = false; continue;
      } else if (A.longeDemais) { A.longeDemais = false; A.blob.visible = true; }
      if (!S.dentro && !A.oculto && (A.tipo === 'anda' || A.tipo === 'morador') && (A.z < AV.z0 - 0.4 || A.z > AV.z1 + 0.4)) A.seguro = { x: A.x, z: A.z };   // a última calçada
      if (A.recua) {                                                    // (5.5.0) levou um susto do carro: volta correndo para a calçada
        const q = A.recua, dx = q.x - A.x, dz = q.z - A.z, d = Math.hypot(dx, dz), v = 3.3 * dt;
        if (d <= v) { A.x = q.x; A.z = q.z; A.recua = null; A.andando = false; A.correndo = false; A.atravessa = A.pedeFaixa = false; if (A.tipo === 'anda') { A.ant = null; A.alvo = noMaisPerto(A.x, A.z); A.travaE = 1.5; } }
        else { A.x += dx / d * v; A.z += dz / d * v; A.yawAlvo = Math.atan2(-dz, dx); A.andando = true; A.correndo = true; A.vel = 3.3; }
        A.t += dt; const dyR = ((A.yawAlvo - A.yaw + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI; A.yaw += dyR * Math.min(1, dt * 8);
        poseAtor(A, dt); continue;
      }
      if (temRotina(A) && !A.oculto && A.andando && S.modo === 'livre' && Math.hypot(A.x - J0.x, A.z - J0.z) < 0.5 && !(J0.esbarrao > 0)) J0.esbarrao = 0.6;   // (5.5.0) passou por dentro do jogador
      if (A.tipo === 'luciaRua') tickLuciaRua(A);
      else if (A.tipo === 'rua') tickRua(A);                          // (5.4.0) Cadu e Rosa indo e voltando do mercado
      if (A.oculto && A.tipo !== 'valdemar' && !A.dest) { if (A.boneco) A.boneco.visible = false; continue; }
      A.t += dt;
      if (A.tipo === 'anda') passoNPC(A, dt);
      else if (A.tipo === 'vaga') vagar(A, dt);
      else if (A.tipo === 'cliente') tickCliente(A, dt);
      else if (A.tipo === 'clienteMerc') { if (S.mercado) S.mercado.tickCliente(A, dt); }   // (5.3.1) clientes do mercado.js
      else if (A.tipo === 'esteira') { A.andando = true; A.correndo = true; A.vel = 3; }
      else if (A.tipo === 'valdemar') tickValdemar(A, dt);
      if (A === S.valdemar && S.loja) tickLoja(dt);
      const dy = ((A.yawAlvo - A.yaw + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI; A.yaw += dy * Math.min(1, dt * 8);
      if (!A.sentado) { const ty = altura(A.x, A.z); A.y += (ty - A.y) * Math.min(1, dt * 18); }
      // (5.0.1) LONGE (mais de ~32 m): no lugar do boneco completo (~16 peças) aparece um boneco de 1 peça e a pose nem é calculada
      const J = S.jog, dl = Math.hypot(A.x - J.x, A.z - J.z), longe = !S.dentro && !A.oculto && dl > (A.m.longe ? 30 : 34);
      if (longe !== !!A.m.longe) A.m.longe = longe;
      if (longe) {
        const b = A.boneco || (A.boneco = bonecoSimples(A)), es = A.opt.escala || 1; b.visible = true;
        if (A.deitado) { b.rotation.set(0, A.yaw, Math.PI / 2); b.position.set(A.x + 0.8 * es * Math.cos(A.yaw), A.y + 0.22 * es, A.z - 0.8 * es * Math.sin(A.yaw)); }
        else { b.rotation.set(0, A.yaw, 0); b.position.set(A.x, A.y + (A.sentado ? A.assento - 0.62 * es : 0), A.z); }
        A.blob.position.set(A.x, A.y + 0.02, A.z);
      } else { if (A.boneco) A.boneco.visible = false; poseAtor(A, dt); }
      if (A.prop) atualizarProp(A);
    }
  }
  // (5.5.0) PEDESTRES como os carros: quem está longe demais (ou saiu pela ponta do mapa) vira outra pessoa, num lugar fora da vista
  const borda = (N) => Math.abs(N.x) >= 115 || Math.abs(N.z) >= 71;
  function pontoForaDaVista(min, max) {
    const J = S.jog, cx = camera.position.x - OX, cz = camera.position.z, fx = J.x - cx, fz = J.z - cz, fl = Math.hypot(fx, fz) || 1;
    const cands = [];
    for (let i = 0; i < S.rede.length; i++) {
      const N = S.rede[i]; if (N.faixa) continue; const dx = N.x - J.x, dz = N.z - J.z, d = Math.hypot(dx, dz); if (d < min || d > max) continue;
      if ((dx * fx + dz * fz) / (d * fl) > 0.2) continue;              // na frente da câmera: não
      if (!livreNPC(N.x, N.z, null, true)) continue; cands.push(i);
    }
    return cands.length ? cands[Math.floor(Math.random() * cands.length)] : -1;
  }
  function reciclarPedestre(A) {
    const k = pontoForaDaVista(45, 90); if (k < 0) { A.espera = 2; return; }
    const N = S.rede[k], B = criarPessoa(S.f2, Math.random, Math.random() < 0.5);
    B.x = N.x; B.z = N.z; B.ant = null; B.alvo = N.viz[Math.floor(Math.random() * N.viz.length)];
    descartarPessoa(A); S.npcs.push(B);
    const i = S.pedestres.indexOf(A); if (i >= 0) S.pedestres[i] = B; else S.pedestres.push(B);
  }
  function gerenciarPedestres(dt) {
    S.tPed = (S.tPed == null ? 3 : S.tPed) - dt; if (S.tPed > 0) return; S.tPed = 2.5;
    const J = S.jog, longe = S.npcs.filter((A) => A.tipo === 'anda' && !A.dest && !A.oculto && Math.hypot(A.x - J.x, A.z - J.z) > 100);
    if (longe.length) reciclarPedestre(longe[Math.floor(Math.random() * longe.length)]);   // um de cada vez, sem pressa
  }
  function bonecoSimples(A) {                                         // pernas, tronco com braços, cabeça e cabelo: UMA malha (cores do próprio NPC)
    const o = A.opt, es = o.escala || 1, G = new Geo(), k = (v) => v * es;
    G.box(k(0.26), k(0.82), k(0.44), o.calcao || '#2a3f66', 0, 0, 0);
    G.box(k(0.3), k(0.62), k(0.5), o.camisa || '#8c9199', 0, k(0.82), 0);
    for (const z of [-0.31, 0.31]) G.box(k(0.16), k(0.56), k(0.12), o.pele || '#946042', 0, k(0.86), k(z));
    G.box(k(0.36), k(0.36), k(0.36), o.pele || '#946042', 0, k(1.44), 0);
    G.box(k(0.38), k(0.12), k(0.38), o.cabelo || '#1c140f', 0, k(1.76), 0);
    const m = G.malha(MAT); S.grupo.add(m); return m;
  }

  // (4.9.4) dentro dos interiores: anda até um ponto qualquer da área, para um pouco e escolhe outro
  function vagar(A, dt) {
    if (A.espera > 0) { A.espera -= dt; A.andando = false; return; }
    if (!A.alvoV) { const a = A.area; A.alvoV = { x: a.x0 + Math.random() * (a.x1 - a.x0), z: a.z0 + Math.random() * (a.z1 - a.z0) }; }
    const dx = A.alvoV.x - A.x, dz = A.alvoV.z - A.z, d = Math.hypot(dx, dz);
    if (d < 0.4) { A.alvoV = null; A.espera = 1.5 + Math.random() * 4; A.andando = false; return; }
    const v = A.vel * dt; let moveu = false;
    for (const ang of [0, 0.5, -0.5, 1.0, -1.0, 1.5, -1.5]) { const ca = Math.cos(ang), sa = Math.sin(ang), ux = (dx * ca - dz * sa) / d, uz = (dx * sa + dz * ca) / d;
      if (livreNPC(A.x + ux * v, A.z + uz * v, A)) { A.x += ux * v; A.z += uz * v; A.yawAlvo = Math.atan2(-uz, ux); moveu = true; break; } }
    A.andando = moveu; if (!moveu) { A.bloq = (A.bloq || 0) + dt; if (A.bloq > 1.2) { A.alvoV = null; A.bloq = 0; } }
  }

  // ------------------------------------------------------------------ física do jogador
  function altura(x, z) {
    for (const p of S.pisos) if (x > p.x0 && x < p.x1 && z > p.z0 && z < p.z1) return p.y;
    if (!S.dentro) for (const c of CALCADAS) if (x > c.x0 && x < c.x1 && z > c.z0 && z < c.z1) return c.y;
    return 0;
  }
  const RJ = 0.3;
  function livre(x, z) {
    if (S.dentro) { const L = S.dentro.lim; if (x < L.x0 || x > L.x1 || z < L.z0 || z > L.z1) return false; }
    else if (x < LIM.x0 + 1.5 || x > LIM.x1 - 1.5 || z < LIM.z0 + 1.5 || z > LIM.z1 - 1.5) return false;
    for (const b of S.col) if (x > b.x0 - RJ && x < b.x1 + RJ && z > b.z0 - RJ && z < b.z1 + RJ) return false;
    for (const c of S.circ) if (Math.hypot(x - c.x, z - c.z) < c.r + RJ) return false;
    if (S.dentro) { for (const A of S.npcs) if (!A.oculto) { const dn = Math.hypot(x - A.x, z - A.z); if (dn < 0.58 && dn < Math.hypot(S.jog.x - A.x, S.jog.z - A.z) - 1e-4) return false; } return true; }
    if (S.portao.k > 0.3) for (const b of S.portao.col) if (x > b.x0 - RJ && x < b.x1 + RJ && z > b.z0 - RJ && z < b.z1 + RJ) return false;
    const naPier = x > PIER.x0 && x < PIER.x1 + 0.5 && z > PIER.z0 + 0.15 && z < PIER.z1 - 0.15;
    if (!naPier) { const ex = (x - LAGO.cx) / (LAGO.rx + 0.45), ez = (z - LAGO.cz) / (LAGO.rz + 0.45); if (ex * ex + ez * ez < 1) return false; }   // (4.9.5) fora da água: os pés não entram mais
    for (const c of S.carros) if (c.ativo && Math.abs(x - c.x) < 2.15 + RJ && Math.abs(z - c.z) < 0.95 + RJ) return false;
    for (const A of S.npcs) if (!A.oculto && !A.longeDemais) { const dn = Math.hypot(x - A.x, z - A.z); if (dn < 0.58 && dn < Math.hypot(S.jog.x - A.x, S.jog.z - A.z) - 1e-4) return false; }   // (5.5.0) dá para se afastar de quem está encostado
    return true;
  }
  // esbarrar em alguém empurra a pessoa um pouquinho (se ela tiver para onde ir)
  function empurrar(px, pz) {
    for (const A of S.npcs) {
      if (A.sentado) continue; const dx = A.x - px, dz = A.z - pz, d = Math.hypot(dx, dz);
      if (d < 0.6 && d > 1e-3) { const k = (0.61 - d) / d, nx = A.x + dx * k, nz = A.z + dz * k; if (livreNPC(nx, nz, A, true)) { A.x = nx; A.z = nz; } }
    }
  }
  function entrada() {
    const j = UI.joy, t = UI.teclas; let ix = j.x, iy = j.y;
    if (t.ArrowLeft || t.KeyA) ix -= 1; if (t.ArrowRight || t.KeyD) ix += 1; if (t.ArrowUp || t.KeyW) iy -= 1; if (t.ArrowDown || t.KeyS) iy += 1;
    const m = Math.hypot(ix, iy); if (m > 1) { ix /= m; iy /= m; }
    return { ix, iy, m: Math.min(1, m) };
  }
  function mover(dt) {
    const J = S.jog, e = entrada(), T_ = UI.teclas;
    if (T_.KeyQ) S.cam.yaw += dt * 1.8; if (T_.KeyE) S.cam.yaw -= dt * 1.8;
    const corre = e.m > 0.12 && (T_.ShiftLeft || T_.ShiftRight || (UI.joy.id != null && e.m >= LIMIAR_CORRER));
    UI.pad.classList.toggle('corre', !!corre);
    if (J.sentado) { if (e.m > 0.5 && !(J.comendo > 0)) levantar(); return; }      // (4.9.3) sentado: empurrar o direcional levanta
    if (e.m < 0.12) { J.andando = false; J.correndo = false; return; }
    const sy = Math.sin(S.cam.yaw), cy = Math.cos(S.cam.yaw);
    const fx = -sy, fz = -cy, rx = cy, rz = -sy;                     // frente (da câmera para o jogador) e direita
    const dx = rx * e.ix - fx * e.iy, dz = rz * e.ix - fz * e.iy, dl = Math.hypot(dx, dz) || 1;
    const vel = (corre ? CORRER : ANDAR * Math.max(0.35, e.m)) * fVel(), sp = vel * dt;
    const nx = J.x + dx / dl * sp, nz = J.z + dz / dl * sp;
    let moveu = false;
    if (livre(nx, J.z)) { J.x = nx; moveu = true; }
    if (livre(J.x, nz)) { J.z = nz; moveu = true; }
    { const B = S.npcs.find((A) => !A.oculto && !A.sentado && !A.deitado && Math.hypot(nx - A.x, nz - A.z) < 0.6 && Math.hypot(nx - A.x, nz - A.z) < Math.hypot(J.x - A.x, J.z - A.z) + 0.02);
      if (B && !(B.esbarrao > 0.05)) { B.esbarrao = 0.6; if (!temRotina(B)) B.travaE = Math.max(B.travaE || 0, 0.6); } }   // (5.5.0) não empurra: a pessoa cambaleia
    if (!S.dentro && (J.z < AV.z0 - 0.4 || J.z > AV.z1 + 0.4)) J.seguro = { x: J.x, z: J.z };   // (5.5.0) a última calçada (para o susto do carro)
    J.andando = moveu; J.correndo = moveu && corre; J.vel = vel; J.yawAlvo = Math.atan2(-dz, dx);
  }
  function tickJogador(dt) {
    const J = S.jog; J.t += dt;
    if (J.rota && J.rota.length) {
      const p = J.rota[0], dx = p.x - J.x, dz = p.z - J.z, d = Math.hypot(dx, dz), st = J.vel * dt;
      if (d <= st) { J.x = p.x; J.z = p.z; J.rota.shift(); if (!J.rota.length) { J.rota = null; J.andando = false; const r = J.rotaRes; J.rotaRes = null; if (r) r(); } }
      else { J.x += dx / d * st; J.z += dz / d * st; J.yawAlvo = Math.atan2(-dz, dx); J.andando = true; }
    }
    const dy = ((J.yawAlvo - J.yaw + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI; J.yaw += dy * Math.min(1, dt * 10);
    if (J.sentado) J.y = 0; else { const ty = altura(J.x, J.z); J.y += (ty - J.y) * Math.min(1, dt * 18); }
    if (J.comendo > 0) J.comendo -= dt;
    poseAtor(J, dt); poseCopo(J); poseFone(J, dt);
    J.anel.position.set(J.x, J.y + 0.03, J.z);
  }
  const andar = (A, pts, vel) => new Promise((ok) => { A.vel = vel || 2.2; A.rota = pts.map((p) => ({ x: p[0], z: p[1] })); A.rotaRes = ok; });
  function tickPortao(dt) {
    const P = S.portao; P.k += (P.alvo - P.k) * Math.min(1, dt * 3.5);
    P.piv[0].rotation.y = -P.k * Math.PI / 2; P.piv[1].rotation.y = P.k * Math.PI / 2;
  }
  function somPortao() {
    const A = typeof Som !== 'undefined' && Som.audio && !Som.mudo ? Som.audio.ctx : null; if (!A) return;
    try { const t0 = A.currentTime + 0.35; for (const [f, v] of [[180, 0.08], [95, 0.06]]) { const o = A.createOscillator(), g = A.createGain(); o.type = 'square'; o.frequency.setValueAtTime(f, t0); o.frequency.exponentialRampToValueAtTime(f * 0.6, t0 + 0.18); g.gain.setValueAtTime(v, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.25); o.connect(g); g.connect(A.destination); o.start(t0); o.stop(t0 + 0.27); } } catch (e) { /* sem som */ }
  }

  // ------------------------------------------------------------------ câmera em terceira pessoa + o que fica no meio vira translúcido (UMA peça só)
  function cruza(ax, ay, az, bx, by, bz, b) {
    const d = [bx - ax, by - ay, bz - az], o = [ax, ay, az], mn = [b.x0, b.y0, b.z0], mx = [b.x1, b.y1, b.z1]; let t0 = 0, t1 = 1;
    for (let k = 0; k < 3; k++) {
      if (Math.abs(d[k]) < 1e-9) { if (o[k] < mn[k] || o[k] > mx[k]) return false; continue; }
      let ta = (mn[k] - o[k]) / d[k], tb = (mx[k] - o[k]) / d[k]; if (ta > tb) { const t = ta; ta = tb; tb = t; }
      if (ta > t0) t0 = ta; if (tb < t1) t1 = tb; if (t0 > t1) return false;
    }
    return true;
  }
  // Como "uma peça só": antes de desenhar o prédio translúcido, ele grava só a profundidade (sem cor). Assim só a face da FRENTE
  // aparece, por cima do jogador, e não se vê janela atrás de janela, parede atrás de parede.
  function atualizarOclusao(dt, cx, cy, cz, tx, ty, tz) {
    for (const o of S.oclusores) {
      const hit = cruza(cx, cy, cz, tx, ty, tz, o.b) || cruza(cx, cy, cz, tx, ty - 1.0, tz, o.b);
      o.a += ((hit ? 0.3 : 1) - o.a) * Math.min(1, dt * 7);
      if (o.a > 0.985) {
        if (o.fade) { o.mesh.material = MAT; o.mesh.renderOrder = 0; o.pre.visible = false; for (const m of o.mats) { m.transparent = false; m.opacity = 1; m.depthWrite = true; m.needsUpdate = true; } o.fade = false; }
        continue;
      }
      if (!o.fade) {
        if (!o.matF) o.matF = guardar(new THREE.MeshLambertMaterial({ vertexColors: true, transparent: true, depthWrite: false }));
        if (!o.pre) { o.pre = new THREE.Mesh(o.mesh.geometry, MAT_PRE); o.pre.renderOrder = 10; o.mesh.add(o.pre); }
        o.mesh.material = o.matF; o.mesh.renderOrder = 11; o.pre.visible = true;
        for (const m of o.mats) { m.transparent = true; m.depthWrite = false; m.needsUpdate = true; }
        o.fade = true;
      }
      o.matF.opacity = o.a; for (const m of o.mats) m.opacity = o.a;
    }
  }
  function atualizarCamera(dt) {
    const J = S.jog, C = S.cam, P = C.pitch || 0.48;
    if (S.camParada) return;                                          // (5.0.0) cutscene das 2h: ele sai correndo da câmera
    const tx = J.x, ty = J.y + 1.35, tz = J.z;
    C.dAt = C.snap ? C.dist : C.dAt + (C.dist - C.dAt) * (1 - Math.exp(-dt * 4)); C.snap = false;
    const ux = Math.sin(C.yaw) * Math.cos(P), uy = Math.sin(P), uz = Math.cos(C.yaw) * Math.cos(P);
    const px = tx + ux * C.dAt, py = ty + uy * C.dAt, pz = tz + uz * C.dAt;
    camera.position.set(OX + px, py, pz); camera.lookAt(OX + tx, ty, tz);
    atualizarOclusao(dt, px, py, pz, tx, ty - 0.2, tz);
  }

  // ------------------------------------------------------------------ marca do mapa (no chão, com uma coluna de luz) e a setinha que guia
  const CORES_MARCA = ['#f0a020', '#e8452f', '#3fb7f0', '#6bd34a', '#c86bf0', '#ffffff'];
  function montarMarca() {
    const g = new THREE.Group(), mb = (o) => guardar(new THREE.MeshBasicMaterial(Object.assign({ color: 0xf0a020 }, o)));
    const anel = new THREE.Mesh(guardar(new THREE.RingGeometry(0.75, 1.05, 32)), mb({ transparent: true, opacity: 0.95, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 }));
    anel.rotation.x = -Math.PI / 2; anel.position.y = 0.04; g.add(anel);
    const luz = new THREE.Mesh(guardar(new THREE.CylinderGeometry(0.16, 0.16, 16, 8, 1, true)), mb({ transparent: true, opacity: 0.35, depthWrite: false, side: THREE.DoubleSide }));
    luz.position.y = 8; g.add(luz);
    const gema = new THREE.Mesh(guardar(new THREE.OctahedronGeometry(0.35)), mb({})); gema.position.y = 2.6; g.add(gema);
    g.visible = false; S.grupo.add(g);
    S.marca3d = { g, gema, mats: [anel.material, luz.material, gema.material] };
  }
  function definirMarca(x, z) {
    S.marca = x == null ? null : { x, z };
    const cor = new THREE.Color(S.dados.corMarca || CORES_MARCA[0]);
    for (const m of S.marca3d.mats) m.color.copy(cor); S.jog.anel.material.color.copy(cor);
    S.marca3d.g.visible = !!S.marca; S.jog.anel.visible = !!S.marca; UI.seta.hidden = !S.marca;
    UI.setaPonta.style.borderBottomColor = S.dados.corMarca || CORES_MARCA[0];
    if (S.marca) S.marca3d.g.position.set(x, altura(x, z), z);
  }
  function atualizarMarca() {
    if (!S.marca) return;
    const J = S.jog, dx = S.marca.x - J.x, dz = S.marca.z - J.z, d = Math.hypot(dx, dz);
    if (d < 2.2) { definirMarca(null); somChegou(); return; }
    const sy = Math.sin(S.cam.yaw), cy = Math.cos(S.cam.yaw), fr = dx * -sy + dz * -cy, di = dx * cy + dz * -sy;   // frente e direita da câmera
    UI.setaGira.style.transform = 'rotate(' + Math.atan2(di, fr) + 'rad)';
    const txt = Math.round(d) + ' m'; if (UI.setaDist.textContent !== txt) UI.setaDist.textContent = txt;
    S.marca3d.gema.position.y = 2.6 + Math.sin(S.t * 3) * 0.25; S.marca3d.gema.rotation.y = S.t * 2;
  }
  function somChegou() {
    const A = typeof Som !== 'undefined' && Som.audio && !Som.mudo ? Som.audio.ctx : null; if (!A) return;
    try { const t0 = A.currentTime; [660, 880].forEach((f, i) => { const o = A.createOscillator(), g = A.createGain(); o.type = 'triangle'; o.frequency.value = f; g.gain.setValueAtTime(0.08, t0 + i * 0.12); g.gain.exponentialRampToValueAtTime(0.001, t0 + i * 0.12 + 0.2); o.connect(g); g.connect(A.destination); o.start(t0 + i * 0.12); o.stop(t0 + i * 0.12 + 0.22); }); } catch (e) { /* sem som */ }
  }
  // ------------------------------------------------------------------ (5.1.0) PONTOS NOMEADOS: lugares sem placa (lago, societys, várzea) ganham
  // um nome quando o jogador chega perto deles pela primeira vez (fica guardado; o mapa passa a escrever o nome ali). As casas de NPCs
  // nomeados (ver montarMoradores) são diferentes: elas só mostram o nome quando algo específico revelar (ver revelarCasaNPC), exceto a
  // do seu Valdemar, que já tem placa "VALDEMAR" plantada no mundo (então não faz sentido escondê-la no mapa).
  let MARCOS_CACHE = null;
  function marcos() {
    if (MARCOS_CACHE || !S.societys || !S.societys.length) return MARCOS_CACHE || [];
    MARCOS_CACHE = [
      { id: 'lago', nome: T('Lago do Sapo Cururu'), x: LAGO.cx, z: LAGO.cz, raio: 20 },
      { id: 'varzea', nome: T('Campo de Várzea Henrique Antônio'), x: (VARZEA.x0 + VARZEA.x1) / 2, z: (VARZEA.z0 + VARZEA.z1) / 2, raio: 22 },
      { id: 'society1', nome: T('Society do Seu Nonato'), x: S.societys[0].cx, z: S.societys[0].cz, raio: 16 },
      { id: 'society2', nome: T('Society Doutor Bryan'), x: S.societys[1].cx, z: S.societys[1].cz, raio: 16 },
    ];
    return MARCOS_CACHE;
  }
  function tickDescobertas() {
    const d = S.dados, J = S.jog, M = marcos(); if (!M.length) return;
    for (const m of M) {
      if (d.descobertos[m.id]) continue;
      if (Math.hypot(J.x - m.x, J.z - m.z) > m.raio) continue;
      d.descobertos[m.id] = true;
      aviso(Tf('Você descobriu: {0}', m.nome)); setTimeout(() => { if (S && UI && !UI.aviso.hidden) aviso(''); }, 3200);
      gravar(d.ponto);
    }
  }
  const NOME_CASA = { joao: T('Casa do João'), alves: T('Casa dos Alves') };     // (a do seu Valdemar já tem a placa própria, ver NOME_CASA_SEMPRE)
  // chame isto de onde quer que a história venha a precisar: ao ver o NPC entrando em casa, ou quando ele "chamar" o jogador pelo mapa.
  // (nenhuma cena do jogo chama isto ainda: nem o João nem a Lúcia Alves andam pela cidade como personagens à parte por enquanto.)
  function revelarCasaNPC(marca) {
    const d = S.dados; if (d.casasConhecidas[marca]) return;
    d.casasConhecidas[marca] = true; gravar(d.ponto);
  }
  // o mapa (2D): o próprio chão pintado + os prédios + você + a marca
  function desenharMapa() {
    const c = UI.mapaCv, g = c.getContext('2d'), W = c.width, H = c.height, kx = W / 240, kz = H / 152;
    const X = (x) => (x + 120) * kx, Z = (z) => (z + 76) * kz;
    g.imageSmoothingEnabled = false; g.drawImage(S.chaoImg, 0, 0, W, H);
    g.save(); g.beginPath(); g.ellipse(X(LAGO.cx), Z(LAGO.cz), LAGO.rx * kx, LAGO.rz * kz, 0, 0, Math.PI * 2); g.clip();
    if (S.aguaImg) g.drawImage(S.aguaImg, X(LAGO.cx - LAGO.rx), Z(LAGO.cz - LAGO.rz), LAGO.rx * 2 * kx, LAGO.rz * 2 * kz); else { g.fillStyle = '#4f9fd0'; g.fill(); }
    g.restore();
    for (const p of S.planta) { g.fillStyle = p.cor; g.fillRect(X(p.r.x0), Z(p.r.z0), (p.r.x1 - p.r.x0) * kx, (p.r.z1 - p.r.z0) * kz); if (!p.chao) { g.strokeStyle = 'rgba(42,18,6,0.85)'; g.lineWidth = 1; g.strokeRect(X(p.r.x0) + 0.5, Z(p.r.z0) + 0.5, (p.r.x1 - p.r.x0) * kx - 1, (p.r.z1 - p.r.z0) * kz - 1); } }
    // (5.1.0) nomes descobertos (lago, societys, várzea) e casas de NPCs já reveladas
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = "bold 9px Silkscreen, 'Courier New', monospace";
    const rotulo = (x, z, txt) => { const mx = X(x), mz = Z(z); g.fillStyle = 'rgba(20,10,4,0.75)'; g.fillText(txt, mx + 1, mz + 1); g.fillStyle = '#fff0c8'; g.fillText(txt, mx, mz); };
    for (const m of marcos()) if (S.dados.descobertos[m.id]) rotulo(m.x, m.z, m.nome);
    for (const cs of S.casas || []) {
      if (!cs.marca) continue;
      const nome = cs.marca === 'valdemar' ? T('Seu Valdemar') : (S.dados.casasConhecidas[cs.marca] ? NOME_CASA[cs.marca] : null);
      if (nome) rotulo(cs.x, cs.z, nome);
    }
    if (S.marca) { const mx = X(S.marca.x), mz = Z(S.marca.z); g.fillStyle = S.dados.corMarca || CORES_MARCA[0]; g.strokeStyle = '#2a1206'; g.lineWidth = 2; g.beginPath(); g.arc(mx, mz, 7, 0, Math.PI * 2); g.fill(); g.stroke(); g.beginPath(); g.moveTo(mx - 4, mz + 9); g.lineTo(mx + 4, mz + 9); g.lineTo(mx, mz + 16); g.closePath(); g.fill(); }
    const J = S.jog, px = X(J.x), pz = Z(J.z), fx = Math.cos(J.yaw), fz = -Math.sin(J.yaw);     // você: setinha na direção em que olha
    g.fillStyle = '#ffffff'; g.strokeStyle = '#2a1206'; g.lineWidth = 2; g.beginPath();
    g.moveTo(px + fx * 10, pz + fz * 10); g.lineTo(px - fx * 6 - fz * 6, pz - fz * 6 + fx * 6); g.lineTo(px - fx * 3, pz - fz * 3); g.lineTo(px - fx * 6 + fz * 6, pz - fz * 6 - fx * 6); g.closePath(); g.fill(); g.stroke();
  }
  function abrirMapa() {
    if (!S || S.modo !== 'livre') return; som();
    S.pausado = true; UI.mapa.hidden = false; atualizarCoresMapa(); desenharMapa();
  }
  function fecharMapa() { if (!S) return; som(); UI.mapa.hidden = true; S.pausado = !UI.pausa.hidden; }
  function atualizarCoresMapa() { for (const b of UI.cores.children) b.classList.toggle('on', b.dataset.cor === (S.dados.corMarca || CORES_MARCA[0])); UI.remover.disabled = !S.marca; }
  const som = () => { if (typeof Som !== 'undefined' && Som.clique) Som.clique(); };

  // ------------------------------------------------------------------ (4.9.3) INTERAGIR: sentar em bancos/cadeiras/banquetas, o balcão do seu Valdemar e o hospital
  // (4.9.4) as portas dos lugares (do lado de fora, na calçada) e o nome de cada um
  const PORTAS = [
    { nome: 'cinema', x: -43.8, z: -4.4, sai: -Math.PI / 2 }, { nome: 'cafeteria', x: -24.7, z: -4.4, sai: -Math.PI / 2 }, { nome: 'supermercado', x: 45.0, z: -4.4, sai: -Math.PI / 2 },
    { nome: 'hospital', x: -104, z: -4.4, sai: -Math.PI / 2 }, { nome: 'bar', x: -100.2, z: 8.6, sai: Math.PI / 2 }, { nome: 'pizzaria', x: 1.2, z: 8.6, sai: Math.PI / 2 },
    { nome: 'restaurante', x: 23.6, z: 8.6, sai: Math.PI / 2 }, { nome: 'academia', x: 76.4, z: 8.6, sai: Math.PI / 2 },
  ];
  const NOME_LUGAR = { cinema: 'Cinema', cafeteria: 'Cafeteria', supermercado: 'Supermercado', hospital: 'Hospital', bar: 'Bar', pizzaria: 'Pizzaria', restaurante: 'Restaurante', lanche: 'Lanche do seu Valdemar', academia: 'Academia' };
  // ENTRAR: a cidade fica escondida (parada) e a sala é montada no mesmo lugar; as listas de colisão/assentos/pessoas trocam pelas da sala
  async function entrarEm(P) {
    const I = S.interiores, J = S.jog; if (!I) return;
    await preto(true, 380);
    const R = I.construir(P.nome, { Geo, MAT, guardar, texCanvas, granular, semente, texLetreiro });
    if (!R) { await preto(false, 300); return; }
    S.fora = { seta: S.setaAlvo, col: S.col, circ: S.circ, pisos: S.pisos, assentos: S.assentos, npcs: S.npcs, conversas: S.conversas, camBox: S.camBox, oclusores: S.oclusores, grupo: S.grupo, x: J.x, z: J.z, cam: { yaw: S.cam.yaw, dist: S.cam.dist, pitch: S.cam.pitch }, porta: P };
    S.grupoCidade.visible = false; R.grupo.position.x = OX; scene.add(R.grupo); S.grupo = R.grupo;
    S.col = R.col; S.circ = []; S.pisos = R.pisos; S.assentos = []; S.npcs = []; S.conversas = []; S.camBox = []; S.oclusores = []; S.lucia = null;
    S.dentro = Object.assign({ nome: P.nome }, R);
    for (const o of R.ocl || []) oclusor(o.b, o.mesh);
    R.grupo.add(J.m.raiz, J.blob, J.anel);                            // o jogador vai junto para a sala
    const idx = R.assentos.map((a) => assento(a.x, a.z, a.fx, a.fz, a.h, a.tipo));
    const rnd = semente(P.nome.length * 31 + 7);
    const mercadoJs = P.nome === 'supermercado' && !!S.mercado;          // (5.4.2) no mercado quem cuida dos clientes é o mercado.js
    const comFluxo = !SEM_FLUXO[P.nome] && !mercadoJs, areaCli = [];                   // (5.0.0) os clientes (sentados; no mercado, os que passeiam) vêm do fluxo
    for (const p of R.pessoas) {
      if (mercadoJs && p.tipo === 'vaga') continue;
      if (comFluxo && (p.tipo === 'senta' || (P.nome === 'supermercado' && p.tipo === 'vaga'))) { if (p.area) areaCli.push(p.area); continue; }
      if (p.marca === 'lucia' && !luciaNoCafe()) continue;              // (5.2.0) a Lúcia só está lá das 7h50 às 20h
      const A = p.marca === 'lucia' ? criarLucia(S.f2) : criarPessoa(S.f2, rnd, !!p.fem); A.tipo = p.tipo; A.area = p.area;
      if (p.tipo === 'senta') { const a = idx[p.assento]; if (!a) continue; A.sentado = true; A.x = a.x; A.z = a.z; A.assento = a.h; A.yaw = A.yawAlvo = a.yaw; a.ocupado = A; }
      else if (p.tipo === 'vaga') { const a = p.area; A.x = (a.x0 + a.x1) / 2 + (rnd() - 0.5) * 2; A.z = (a.z0 + a.z1) / 2 + (rnd() - 0.5) * 2; }
      else { A.x = p.x; A.z = p.z; A.yaw = A.yawAlvo = p.yaw || 0; }
      if (p.marca === 'lucia') S.lucia = A;    // (5.1.0) a moça do caixa da cafeteria é a Lúcia Alves (ver falarComLucia)
      S.npcs.push(A);
    }
    S.fluxo = comFluxo ? montarFluxo(P.nome, idx, areaCli[0] || null, R.entrada) : null;
    if (P.nome === 'supermercado' && S.mercado) S.mercado.entrou(R);     // (5.3.1) Cadu, caixa, estoque (mercado.js)
    S.npcs.filter((A) => A.sentado).reduce((ant, A) => { if (ant && Math.hypot(ant.x - A.x, ant.z - A.z) < 1.8) { S.conversas.push({ a: ant, b: A, t: 0, quem: 0, prox: 2 }); return null; } return A; }, null);
    J.sentado = false; J.x = R.entrada.x; J.z = R.entrada.z; J.yaw = J.yawAlvo = R.entrada.yaw; J.y = 0; J.rota = null;
    S.cam.yaw = 0; S.cam.dist = R.cam.dist; S.cam.pitch = R.cam.pitch; S.cam.snap = true;
    scene.background = new THREE.Color(R.fundo); if (scene.fog) { scene.fog.near = 200; scene.fog.far = 400; }
    UI.btnMapa.hidden = true; UI.seta.hidden = true; if (S.setaAlvo) S.setaAlvo.visible = false; S.setaAlvo = null; if (S.bola) S.bola.jx = null;
    await preto(false, 380);
  }
  // (5.0.0) FLUXO DE CLIENTES: a cidade lá fora fica parada, mas aqui dentro gente sai e, quando tem lugar vazio, entra outra.
  // Segunda a quarta: vazio (pouca gente) · quinta: médio · sexta a domingo: cheio (só 2 a 4 lugares vazios). NUNCA lota (sempre 2+ vazios).
  const FLUXO_SEM = ['vazio', 'vazio', 'vazio', 'medio', 'cheio', 'cheio', 'cheio'];
  const SEM_FLUXO = { hospital: 1, academia: 1 };
  function alvoClientes(n) {
    if (n <= 2) return 0;
    const f = FLUXO_SEM[diaSemana()], v = f === 'vazio' ? Math.round(n * 0.15) + 1 : f === 'medio' ? Math.round(n * 0.45) : n - (2 + Math.floor(Math.random() * 3));
    return clamp(v, 1, n - 2);
  }
  function montarFluxo(nome, lugares, area, ent) {
    const f = FLUXO_SEM[diaSemana()], F = { nome, lugares, area, ent, alvo: alvoClientes(lugares.length), alvoVaga: area ? (f === 'vazio' ? 2 : f === 'medio' ? 4 : 7) : 0, prox: 3 + Math.random() * 4 };
    const livres = lugares.slice().sort(() => Math.random() - 0.5);
    if (nome === 'cafeteria' || nome === lugarDoEmprego()) return F;   // (5.2.1) a cafeteria começa VAZIA; (5.3.0) o lugar do emprego também
    for (let i = 0; i < F.alvo && i < livres.length; i++) { const a = livres[i]; if (a.ocupado) continue; const A = novoCliente(a, true); A.cli.t = 6 + Math.random() * 70; }   // já tem gente quando ele entra, cada um num ponto da visita
    for (let i = 0; i < F.alvoVaga; i++) { const A = novoCliente(null, true); A.cli.t = 6 + Math.random() * 60; }
    return F;
  }
  function novoCliente(a, jaDentro) {
    const e = S.fluxo ? (S.fluxo.entAgora || S.fluxo.ent) : S.dentro.entrada, A = criarPessoa(S.f2, Math.random, Math.random() < 0.5);
    A.tipo = 'cliente'; A.cli = { a, fase: 'ir', t: 40 + Math.random() * 70, rota: null }; A.vel = 1.1 + Math.random() * 0.3;
    if (a) {
      a.ocupado = A;
      if (jaDentro) { A.sentado = true; A.x = a.x; A.z = a.z; A.assento = a.h; A.yaw = A.yawAlvo = a.yaw; A.cli.fase = 'fica'; }
      else { A.x = e.x; A.z = e.z; A.yaw = A.yawAlvo = e.yaw; const q = pontoLev(a, A); A.cli.rota = [{ x: q.x, z: q.z }];
        if (S.dentro && S.dentro.nome === 'cafeteria' && !S.turno && S.lucia) { A.cli.fase = 'pedir'; A.cli.depois = [{ x: q.x, z: q.z }]; A.cli.rota = [{ x: CAIXA_CLI.x, z: CAIXA_CLI.z + 0.4 }, { x: CAIXA_CLI.x, z: CAIXA_CLI.z }]; A.cli.tp = 0; } }   // (5.5.0) pede no caixa antes
    } else {
      const ar = (S.fluxo && S.fluxo.area) || { x0: e.x - 2, x1: e.x + 2, z0: e.z - 3, z1: e.z }; A.area = ar; A.cli.fase = 'fica';
      if (jaDentro) { A.x = ar.x0 + Math.random() * (ar.x1 - ar.x0); A.z = ar.z0 + Math.random() * (ar.z1 - ar.z0); } else { A.x = e.x; A.z = e.z; }
    }
    S.npcs.push(A); poseAtor(A, 0.016); return A;
  }
  function descartarPessoa(A) {
    const i = S.npcs.indexOf(A); if (i >= 0) S.npcs.splice(i, 1);
    S.conversas = S.conversas.filter((C) => C.a !== A && C.b !== A);
    ATLETAS.delete(A.m); S.meus.delete(A.m); removerProp(A);
    for (const o of [A.m.raiz, A.blob, A.boneco]) if (o && o.parent) o.parent.remove(o);
    A.m.raiz.traverse((o) => { if (o.geometry && o.geometry !== SHADOW_GEO) o.geometry.dispose(); const ms = Array.isArray(o.material) ? o.material : [o.material]; for (const m of ms) if (m && m !== MAT && m !== MAT_CORES && m !== SHADOW_MAT && m !== MAT_PRE && m !== S.matSombra) { if (m.map) m.map.dispose(); m.dispose(); } });
  }
  function tickFluxo(dt) {
    const F = S.fluxo; if (!F || S.turno || S.turnoMercado || F.nome === lugarDoEmprego()) return;     // (5.2.0) no turno quem manda os clientes é o tickTurno; (5.3.0) no lugar do emprego só há clientes no turno
    F.prox -= dt;
    if (F.prox <= 0) {
      F.prox = 5 + Math.random() * 9; const e = F.ent;
      const pe = [[0, 0], [1.1, 0], [-1.1, 0], [0, -1.1]].map(([dx, dz]) => ({ x: e.x + dx, z: e.z + dz })).find((q) => livreNPC(q.x, q.z, null, false));   // a porta (ou do lado, se o jogador estiver na frente)
      if (pe) { F.entAgora = pe;
        const ativos = S.npcs.filter((A) => A.cli && A.cli.fase !== 'sai'), sent = ativos.filter((A) => A.cli.a).length, pass = ativos.filter((A) => !A.cli.a).length;
        const livres = F.lugares.filter((a) => !a.ocupado);
        if (sent < F.alvo && livres.length >= 3) novoCliente(livres[Math.floor(Math.random() * livres.length)], false);   // sempre sobram 2+ lugares
        else if (F.area && pass < F.alvoVaga) novoCliente(null, false);
      }
    }
  }
  function tickCliente(A, dt) {
    const C = A.cli, e = S.fluxo ? S.fluxo.ent : S.dentro.entrada;
    if (C.fase === 'pedir') {                                         // (5.5.0) cafeteria sem turno: pede para a Lúcia, paga e recebe o café
      if (seguir(A, C.rota, A.vel, dt)) {
        A.andando = false; A.yawAlvo = Math.PI / 2; C.tp += dt; A.fala = C.tp < 1.4;
        if (S.lucia) S.lucia.fala = C.tp > 1.4 && C.tp < 2.6;
        if (C.tp > 2.2 && !C.pagou) { C.pagou = true; SomCafe.caixa(); }
        if (C.tp > 3.4) { A.fala = false; if (S.lucia) S.lucia.fala = false; darCopo(A, Math.floor(Math.random() * 4)); C.fase = 'ir'; C.rota = C.depois; }
      }
    } else if (C.fase === 'ir') {
      if (seguir(A, C.rota, A.vel, dt)) { const a = C.a; A.sentado = true; A.x = a.x; A.z = a.z; A.assento = a.h; A.yaw = A.yawAlvo = a.yaw; A.andando = false; C.fase = 'fica'; if (A.copoCli && C.pagou) A.bebe = C.t; }
    } else if (C.fase === 'fica') {
      C.t -= dt;
      if (!C.a) vagar(A, dt); else A.andando = false;
      if (C.t <= 0) {
        if (C.a) { const p = pontoLev(C.a, A); A.sentado = false; A.assento = 0.52; A.x = p.x; A.z = p.z; C.a.ocupado = null; C.a = null; A.fala = false; S.conversas = S.conversas.filter((K) => K.a !== A && K.b !== A); }
        const sd = (S.dentro && S.dentro.saida) || e;
        if (C.pedido && !C.semPagar && !C.pagou) { C.fase = 'caixa'; C.rota = [{ x: CAIXA_CLI.x, z: CAIXA_CLI.z + 0.4 }, { x: CAIXA_CLI.x, z: CAIXA_CLI.z }]; C.tc = 0; }   // (5.2.0) vai pagar no caixa
        else { C.fase = 'sai'; C.rota = [{ x: sd.x, z: sd.z }]; }
      }
      if (A.bebe > 0) { A.bebe -= dt; if (A.bebe <= 0) tirarCopo(A); }
    } else if (C.fase === 'caixa') {                                 // (5.2.0) no caixa: vira para a Lúcia, a registradora toca e ele vai embora
      if (seguir(A, C.rota, A.vel, dt)) { A.andando = false; A.yawAlvo = Math.PI / 2; C.tc += dt; if (C.tc > 0.6 && !C.pagou) { C.pagou = true; SomCafe.caixa(); } if (C.tc > 1.6) { const sd = (S.dentro && S.dentro.saida) || e; C.fase = 'sai'; C.rota = [{ x: sd.x, z: sd.z }]; } }
    } else if (C.fase === 'sai') {                                   // sai pela porta (some perto dela; não espera o jogador sair da frente)
      C.tSai = (C.tSai || 0) + dt; const q = C.rota[C.rota.length - 1] || e;
      if (seguir(A, C.rota, A.vel, dt) || Math.hypot(A.x - q.x, A.z - q.z) < 1.1 || C.tSai > 14) descartarPessoa(A);
    }
  }
  async function sairDoLugar() {
    const F = S.fora, J = S.jog; if (!F) return;
    await preto(true, 380);
    if (S.mercado && S.dentro && S.dentro.nome === 'supermercado') S.mercado.saiu();   // (5.3.1)
    if (J.sentado) levantar();
    for (const A of S.npcs) { ATLETAS.delete(A.m); S.meus.delete(A.m); }
    S.grupoCidade.add(J.m.raiz, J.blob, J.anel);
    const g = S.grupo; scene.remove(g);
    g.traverse((o) => { if (o.geometry && o.geometry !== SHADOW_GEO) o.geometry.dispose(); const ms = Array.isArray(o.material) ? o.material : [o.material]; for (const m of ms) if (m && m !== MAT && m !== MAT_CORES && m !== SHADOW_MAT && m !== MAT_PRE && m !== S.matSombra) { if (m.map) m.map.dispose(); m.dispose(); } });
    Object.assign(S, { col: F.col, circ: F.circ, pisos: F.pisos, assentos: F.assentos, npcs: F.npcs, conversas: F.conversas, camBox: F.camBox, oclusores: F.oclusores, grupo: F.grupo });
    S.dentro = null; S.fora = null; S.fluxo = null; S.lucia = null; S.grupoCidade.visible = true; S.setaAlvo = F.seta; if (S.bola) S.bola.jx = null;   // (5.1.0) S.lucia só existe dentro da cafeteria; já foi descartada junto do grupo acima
    const P = F.porta; J.x = P.x + Math.cos(P.sai) * 0.4; J.z = P.z - Math.sin(P.sai) * 0.4; J.yaw = J.yawAlvo = P.sai; J.y = altura(J.x, J.z);
    Object.assign(S.cam, F.cam); S.cam.snap = true;
    scene.background = new THREE.Color(CEU); if (scene.fog) { scene.fog.near = 70; scene.fog.far = 215; }
    { const V = S.valdemar; if (V && ((lojaAberta() && V.estado !== 'balcao') || (!lojaAberta() && V.estado === 'balcao'))) snapValdemar(); }   // (4.9.5) passou a hora lá dentro: o seu Valdemar já está onde deveria
    UI.btnMapa.hidden = false; UI.seta.hidden = !S.marca;
    montarRuaMercado();                                                // (5.4.0) se o mercado.js chegou com o jogador lá dentro
    await preto(false, 380);
  }
  function alvos() {
    const J = S.jog, v = [];
    if (J.sentado) {
      if (S.sentadoEm && S.sentadoEm.lanche) return [{ x: J.x, z: J.z, r: 9, txt: T('No balcão'), fn: menuBalcao }];       // (4.9.5) sentado no balcão: "Valdemar" ou "Sair"
      return [{ x: J.x, z: J.z, r: 9, txt: T('Levantar'), fn: async () => { levantar(); } }];
    }
    if (!S.turno && !S.turnoMercado) for (const a of S.assentos) if (!a.ocupado) {      // (5.2.0) no turno ele trabalha: nada de sentar
      if (a.lanche && !lojaAberta()) { v.push({ x: a.x, z: a.z, r: 1.15, txt: T('Lanche fechado. Abre às 8h.'), fn: async () => {}, y: a.h + 1.3 }); continue; }
      v.push({ x: a.x, z: a.z, r: 1.15, txt: a.lanche ? T('Sentar no balcão') : T('Sentar'), fn: () => sentar(a), y: a.h + 1.3 });
    }
    if (!S.dentro && !S.intro) v.push({ x: SPAWN.x, z: -3.55, r: 1.35, txt: T('Entrar no prédio'), fn: entrarNoPredio, y: 2.7 });       // (4.9.5) dá para voltar ao prédio (e ao apartamento) a qualquer hora
    if (S.dentro) {
      const D = S.dentro; v.push({ x: D.saida.x, z: D.saida.z, r: 1.4, txt: T('Sair'), fn: S.turno ? sairNoTurno : S.turnoMercado ? () => S.mercado.sairNoTurno() : sairDoLugar, y: 2.6 });
      if (D.nome === 'supermercado' && S.mercado) S.mercado.alvos(v);    // (5.3.1)
      for (const e of D.extras) {
        if (e.acao === 'caixa' && !S.lucia) continue;
        if (e.acao === 'bancada') { v.push({ x: e.x, z: e.z, r: e.r, txt: T(e.txt), fn: S.turno ? abrirBancada : async () => { aviso(T('A bancada é usada no seu turno.')); setTimeout(() => aviso(''), 2200); }, y: 2.4 }); continue; }
        v.push({ x: e.x, z: e.z, r: e.r, txt: T(e.txt), fn: e.acao === 'ficha' ? abrirFicha : e.acao === 'caixa' ? falarComLucia : async () => {}, y: 2.4 });   // (5.1.0) acao:'caixa' = caixa da cafeteria (Lúcia Alves)
      }
      alvosTurno(v);
    } else if (S.interiores) { alvosFutebol(v); for (const P of PORTAS) {
      if (P.nome === 'supermercado' && S.mercado && !S.mercado.aberto()) { v.push({ x: P.x, z: P.z, r: 1.5, txt: T('Mercado fechado. Abre às 8h.'), fn: async () => {}, y: 3 }); continue; }   // (5.4.0) o mercado abre das 8h às 22h (o turno do jogador é 14h–22h)
      if (P.nome === 'cafeteria' && !cafeAberto()) { v.push({ x: P.x, z: P.z, r: 1.5, txt: T('Cafeteria fechada. Abre às 8h.'), fn: async () => {}, y: 3 }); continue; }   // (5.2.0) a cafeteria abre às 8h
      v.push({ x: P.x, z: P.z, r: 1.5, txt: T('Entrar') + ': ' + T(NOME_LUGAR[P.nome]), fn: () => entrarEm(P), y: 3 });
    } }
    return v;
  }
  function alvoAtual() {
    if (!S || S.modo !== 'livre') return null;
    const J = S.jog; let best = null, bs = 1e9;
    for (const a of alvos()) { const d = Math.hypot(a.x - J.x, a.z - J.z); if (d > a.r) continue; const sc = d - (a.pri ? 1 : 0); if (sc < bs) { bs = sc; best = a; } }   // (5.2.0) pri: alvos do turno ganham dos outros
    return best;
  }
  function atualizarAlvo() {
    const a = S.modo === 'livre' ? alvoAtual() : null, txt = a ? a.txt : '';
    if (UI.dica.textContent !== txt) UI.dica.textContent = txt;
    UI.btn.disabled = !a; const bt = T('Interagir'); if (UI.btn.textContent !== bt) UI.btn.textContent = bt;
    if (!S.setaAlvo) { const m = new THREE.Mesh(guardar(new THREE.OctahedronGeometry(0.16)), guardar(new THREE.MeshBasicMaterial({ color: 0xf0a020 }))); m.scale.y = 1.6; S.grupo.add(m); S.setaAlvo = m; }
    S.setaAlvo.visible = !!a && !S.jog.sentado;
    if (a) { S.setaAlvo.position.set(a.x, (a.y || 1.6) + Math.sin(S.t * 4) * 0.07, a.z); S.setaAlvo.rotation.y = S.t * 2; }
  }
  async function interagir() {
    if (!S || S.modo !== 'livre') return;
    const a = alvoAtual(); if (!a) return;
    som(); S.modo = 'cena'; UI.ctl.hidden = true; aviso('');
    S.jog.andando = false; S.jog.correndo = false;     // (5.1.0) sem isto, interagir andando/correndo deixava a animação "correndo" travada até a cena acabar
    try { await a.fn(a); } catch (e) { console.error(e); }
    if (S && S.ativo && S.modo === 'cena' && UI.ficha.hidden) liberar();
  }
  async function sentar(a) {
    const J = S.jog, p = pontoDeLevantar(a);
    if (Math.hypot(J.x - p.x, J.z - p.z) > 0.25) await andar(J, [[p.x, p.z]], 2.4);
    J.sentado = true; J.assento = a.h; J.x = a.x; J.z = a.z; J.yaw = J.yawAlvo = a.yaw; J.y = 0; a.ocupado = J; S.sentadoEm = a;
  }
  async function entrarNoPredio() {
    const J = S.jog;
    S.portao.alvo = 1; somPortao(); await esperar(900);
    await andar(J, [[SPAWN.x, -3.7], [SPAWN.x, -5.5]], 2.0);
    gravar('predio'); UI.ctl.hidden = true; S.paraFase2 = true;
    await preto(true, 900);
    if (S.fimRes) S.fimRes();
  }
  async function menuBalcao() {
    const i = await Escolha.mostrar(T('No balcão'), [T('Valdemar'), T('Sair')], { centro: true });   // (5.1.0) no balcão do lanche fica no meio da tela, não embaixo
    if (i === 0) { if (S.valdemar && !S.valdemar.oculto) await atendimento(); }
    else levantar();
  }
  function levantar() {
    const J = S.jog, a = S.sentadoEm; if (!J.sentado) return;
    const p = a ? pontoDeLevantar(a) : { x: J.x, z: J.z };
    J.sentado = false; J.x = p.x; J.z = p.z; if (a) a.ocupado = null; S.sentadoEm = null;
  }
  async function fala(quem, texto) {
    // (5.1.0) quem==='lucia': a Lúcia Alves, no caixa da cafeteria (ver falarComLucia); mesma voz dela na Fase 1 (SPOT/NOMES.lucia lá no fase1.js)
    const X = S.falantesExtra && S.falantesExtra[quem];                // (5.3.1) falantes de outros arquivos (ex.: o Cadu do mercado.js)
    const A = X ? X.A : quem === 'jog' ? S.jog : quem === 'val' ? S.valdemar : quem === 'lucia' ? S.lucia : quem === 'caio' ? S.caio : null;
    if (A) A.fala = true;
    const nome = X ? X.nome : quem === 'jog' ? nomeJog() : quem === 'val' ? T('Seu Valdemar') : quem === 'lucia' ? T('Lúcia Alves') : quem === 'joao' ? T('João') : quem === 'caio' ? 'Caio' : '';
    const voz = X ? X.voz : quem === 'val' ? 1 : quem === 'lucia' ? 0 : quem === 'joao' ? 3 : quem === 'caio' ? 4 : (typeof PERSONAGEM.voz === 'number' ? PERSONAGEM.voz : 2);
    await Dialogo.mostrar([texto], { nome, voz, manter: true });
    if (A) A.fala = false;
  }

  // ------------------------------------------------------------------ (4.9.3) o cardápio do seu Valdemar, a FOME do dia e o dinheiro
  // enche = quanto tira da fome (a fome do dia vale 2). Tudo daqui é comida NÃO saudável.
  const CARDAPIO = [
    { id: 'podrao', nome: 'X-podrão', preco: 20, enche: 1 },
    { id: 'meiofrio', nome: 'Cachorro meio-frio', preco: 10, enche: 0.5 },
    { id: 'especial', nome: 'Cachorro-quente especial', preco: 15, enche: 1 },
    { id: 'quasetudo', nome: 'X-quase-tudo', preco: 30, enche: 2 },
    { id: 'semsalada', nome: 'X-sem-salada com refri', preco: 22, enche: 1.5 },
  ];
  const FOME_DO_DIA = 2;
  // um "dia livre" = um dia em que dá para andar pela cidade; a fome vem UMA vez por dia (o avanço dos dias ainda não existe: hoje é sempre o dia 1)
  function prepararDia(d) {
    d.dia = d.dia || 1; d.mes = d.mes || 1;
    if (d.fomeDia !== d.dia) { d.fome = FOME_DO_DIA; d.fomeDia = d.dia; }
    if (!d.ruinsNoMes || d.ruinsNoMes.mes !== d.mes) d.ruinsNoMes = { mes: d.mes, n: 0 };
    if (d.trabalhouDia !== d.dia) d.trabalhouHoje = false;   // (5.1.0) libera o expediente de novo a cada dia; (5.4.3) só num dia NOVO (antes voltar do prédio liberava trabalhar de novo)
  }
  const precoDe = (c) => (S.dados.clienteFiel ? Math.round(c.preco * 0.8) : c.preco);      // (5.0.0) cliente fiel: −20% em tudo
  async function atendimento() {
    const d = S.dados, V = S.valdemar, J = S.jog;
    V.yawAlvo = Math.atan2(-(J.z - V.z), J.x - V.x);
    if (!d.conheceValdemar) { await fala('val', T('Opa, freguês novo! Eu sou o Valdemar, prazer. Aqui é o melhor lanche da cidade!')); d.conheceValdemar = true; }
    await fala('val', T('E aí, o que vai ser hoje?'));
    const cheio = (d.fome || 0) <= 0;                                // (5.0.0) satisfeito ainda pode pedir (e aí exagera)
    if (cheio) await fala('jog', T('Eu já tô satisfeito... mas bem que cabia mais um.'));
    Dialogo.esconder();
    const i = await cardapio(d.fakes);
    const c = CARDAPIO[i];
    if (!c) { await fala('val', T('Tranquilo, fica à vontade!')); Dialogo.esconder(); return; }
    const preco = precoDe(c);
    if (d.fakes < preco) { await fala('val', T('Ih... tá faltando dinheiro aí, hein?')); Dialogo.esconder(); return; }
    d.fakes -= preco; somDinheiro(); mostrarDinheiro(false); gastoNaTela(preco);
    await fala('val', Tf('Saindo um {0}!', T(c.nome))); Dialogo.esconder();
    await esperar(1400);
    J.comendo = 3.6; await esperar(3700);
    d.fome = Math.max(0, (d.fome || 0) - c.enche);
    d.ruinsNoMes.n++; d.comidas = (d.comidas || 0) + 1; d.comeuDia = d.dia;   // (5.2.0) some o ícone da coxinha
    Espectros.mover('saudavel', -2, 'comeu ' + c.nome); Espectros.condicao('refeicaoPesada', true);   // (5.0.0) cada lanche: 2 de "não saudável"
    if (cheio) Espectros.mover('saudavel', -4, 'comeu sem fome');                                    // comeu satisfeito: mais 4
    d.diasValdemar = d.diasValdemar || []; if (!d.diasValdemar.includes(d.dia)) d.diasValdemar.push(d.dia);
    if (S.missao) { S.missao = ''; recolherMissao(); }
    gravar('chegada');
    if (cheio) { await fala('jog', T('Acho que eu exagerei...')); S.vomitoT = 20; }               // 20 s depois ele passa mal
    else await fala('jog', d.fome <= 0 ? T('Ufa... agora sim, matei a fome!') : T('Hmm... ainda dava para comer mais um pouco.'));
    if (d.diasValdemar.length >= 10 && !d.clienteFiel) { d.clienteFiel = true; gravar('chegada'); await fala('val', T('Rapaz, já são 10 dias vindo aqui! Agora você é cliente fiel: de hoje em diante, 20% de desconto em tudo!')); }
    if (Sono.deveAvisarSaude()) await fala('jog', T('Eu estou com hábitos não saudáveis, isso com certeza vai me prejudicar nos jogos....'));
    Dialogo.esconder();
  }
  // (5.0.0) passou mal: inclina, põe as mãos nos joelhos e vomita (partículas verdes e uma poça que some depois)
  async function vomitar() {
    const J = S.jog; S.modo = 'cena'; UI.ctl.hidden = true; aviso('');
    if (J.sentado) levantar();
    J.andando = false; J.correndo = false; J.rota = null; J.vomita = 0.001;
    await esperar(3400);
    J.vomita = 0; if (S && S.ativo && S.modo === 'cena') liberar();
  }
  function tickVomito(dt) {
    if (S.vomitoT > 0 && S.modo === 'livre' && !S.pausado) { S.vomitoT -= dt; if (S.vomitoT <= 0) vomitar(); }
    const J = S.jog;
    if (J.vomita > 0) {
      J.vomita += dt;
      if (J.vomita > 0.7 && J.vomita < 2.6) { S.vomAcc = (S.vomAcc || 0) + dt; while (S.vomAcc > 0.03) { S.vomAcc -= 0.03; gotaVomito(J); } }
    }
    const L = S.vomPart || []; for (let i = L.length - 1; i >= 0; i--) {
      const g = L[i]; g.t += dt;
      if (!g.chao) { g.vy -= 9.8 * dt; g.m.position.x += g.vx * dt; g.m.position.y += g.vy * dt; g.m.position.z += g.vz * dt; if (g.m.position.y <= 0.14) { g.chao = true; g.m.position.y = 0.14; } }
      if (g.t > 4) { g.m.parent && g.m.parent.remove(g.m); L.splice(i, 1); }
    }
    if (S.poca) { S.poca.t += dt; S.poca.m.material.opacity = Math.max(0, 0.85 - Math.max(0, S.poca.t - 25) / 10); if (S.poca.t > 35) { S.poca.m.parent && S.poca.m.parent.remove(S.poca.m); S.poca = null; } }
  }
  function gotaVomito(J) {
    const P = S.vomGeo || (S.vomGeo = { g: guardar(new THREE.BoxGeometry(0.06, 0.06, 0.06)), m: [0x9ab83a, 0xc8c25a, 0x7a9a2a].map((c) => guardar(new THREE.MeshBasicMaterial({ color: c }))) });
    const fx = Math.cos(J.yaw), fz = -Math.sin(J.yaw), es = J.opt.escala || 1;
    // (5.1.0) de onde sai o vômito: a pose "vomita" (poseAtor) dobra o CORPO (tronco + cabeça) -0,6 rad para a frente, em torno do
    // quadril. A cabeça fica fixa em (x 0,02, y 1,36) dentro do tronco; giramos esse mesmo ponto pelo mesmo ângulo para achar onde a
    // boca realmente fica no mundo, em vez de um valor fixo "no olho" (que estava saindo perto da barriga, não da boca).
    const DOBRA = 0.6, cb = Math.cos(DOBRA), sb = Math.sin(DOBRA);
    const bocaX = 0.02 * cb + 1.36 * sb + 0.22;    // 0,22: do centro da cabeça até a boca, já na frente do rosto
    const bocaY = -0.02 * sb + 1.36 * cb - 0.08;   // um pouco abaixo do centro da cabeça
    const m = new THREE.Mesh(P.g, P.m[Math.floor(Math.random() * 3)]); m.position.set(J.x + fx * bocaX * es, J.y - 0.05 + bocaY * es, J.z + fz * bocaX * es); S.grupo.add(m);
    (S.vomPart || (S.vomPart = [])).push({ m, t: 0, chao: false, vx: fx * (0.6 + Math.random() * 0.5) + (Math.random() - 0.5) * 0.3, vy: -0.4 - Math.random() * 0.6, vz: fz * (0.6 + Math.random() * 0.5) + (Math.random() - 0.5) * 0.3 });
    if (!S.poca) {
      const m2 = new THREE.Mesh(guardar(new THREE.CircleGeometry(0.42, 10)), guardar(new THREE.MeshBasicMaterial({ color: 0x8aa83a, transparent: true, opacity: 0.85, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 })));
      m2.rotation.x = -Math.PI / 2; m2.position.set(J.x + fx * 0.75 * es, altura(J.x + fx * 0.75, J.z + fz * 0.75) + 0.02, J.z + fz * 0.75 * es); m2.scale.set(0.2, 0.2, 1); S.grupo.add(m2); S.poca = { m: m2, t: 0 };
    } else if (S.poca.t < 3) { const k = Math.min(1, S.poca.m.scale.x + 0.02); S.poca.m.scale.set(k, k * 0.8, 1); }
  }

  // ------------------------------------------------------------------ (5.1.0) CAFETERIA: o emprego da Lúcia Alves (Merge Game)
  //   Lê o que a Fase 1 deixou salvo (historia.fase1.lucia / .mariposa) para saber como ela reconhece o jogador, e o que a Fase 2
  //   deixou salvo (historia.fase2.emprego) para só liberar o turno quem escolheu trabalhar na cafeteria. O "dia" e a "hora" do
  //   expediente (8h–16h) são só para liberar a conversa: o turno em si é o próprio Merge Game, e ao sair dele a hora pula pra
  //   16h e paga 50 fakes (um valor fixo por dia, não por pedido — ver turnoTrabalho).
  // (5.3.1) o que o mercado.js (trabalho no mercado) usa daqui. Tudo por função: assim ele sempre vê o S atual.
  function montarRuaMercado() {                                       // (5.4.0) Cadu e Rosa andando entre a casa e o mercado (precisa estar na rua: o grupo é o da cidade)
    if (!S || !S.mercado || !S.mercado.montarRua || S.ruaMercadoOk || S.dentro) return;
    S.ruaMercadoOk = true; try { S.mercado.montarRua(); } catch (e) { console.warn('[Cidade] rua do mercado:', e); }
  }
  function atorDe(m, opt, tipo) { S.grupo.add(m.raiz); S.meus.add(m); return { m, opt, blob: sombraAtor(0.3), x: 0, z: 0, y: 0, yaw: 0, yawAlvo: 0, fase: 0, vel: 1, t: 0, andando: false, fala: false, sentado: false, assento: 0.52, espera: 0, bloq: 0, tipo: tipo || 'parado' }; }
  function apiMercado() {
    return {
      S: () => S, UI: () => UI, historia: () => API.historia, fala, aviso, esperar, preto, liberar, gravar, som,
      somDinheiro, ganhoNaTela, mostrarDinheiro, somCaixa: () => SomCafe.caixa(), criarPessoa, atorDe, poseAtor, seguir, livreNPC, descartarPessoa,
      guardar, Geo, MAT, texCanvas, fmtHora, H_POR_S, sairDoLugar, diaSemana, nomeJog, empregoEscolhido, levantar,
      fimDeSemana, fut,                                                  // (5.3.1) regras da 5.3.0: sem trabalho no fim de semana; futebol
      painelRecolhivel, fimPainel, criarRuaAgendada, sumirV, surgirV,    // (5.4.0) painel que vira ícone; Cadu e Rosa na rua
    };
  }
  function fase1Lucia() {
    const h1 = (API.historia.ler('fase1')) || {};
    return { mariposa: !!h1.mariposa, falou: !!h1.lucia };
  }
  function empregoEscolhido() {
    const h2 = API.historia.ler('fase2');
    return (h2 && h2.emprego) || null;
  }
  const TIERS = [                                 // ordem fixa da mistura: cada um nasce de dois do tier anterior
    { nome: 'Cafezinho preto', cor: '#3a2213', creme: false, cacau: false, chantilly: false, chocBorda: false },
    { nome: 'Café com leite', cor: '#8a5a2a', creme: false, cacau: false, chantilly: false, chocBorda: false },
    { nome: 'Café cremoso', cor: '#c89a5a', creme: true, cacau: false, chantilly: false, chocBorda: false },
    { nome: 'Cremoso com borda de chocolate', cor: '#c89a5a', creme: true, cacau: false, chantilly: false, chocBorda: true },
    { nome: 'Borda de chocolate e chantilly', cor: '#c89a5a', creme: true, cacau: false, chantilly: true, chocBorda: true },
    { nome: 'Cappuccino', cor: '#e8d0a8', creme: true, cacau: true, chantilly: false, chocBorda: false },
    { nome: 'Cappuccino com borda de chocolate', cor: '#e8d0a8', creme: true, cacau: true, chantilly: false, chocBorda: true },
    { nome: 'Cappuccino com chantilly e borda de chocolate', cor: '#e8d0a8', creme: true, cacau: true, chantilly: true, chocBorda: true },
  ];
  // (5.1.1) xícaras em pixel art 24x24, uma silhueta para cada fase do café: a xícara cresce com o nível (cafezinho pequeno →
  // caneca de café com leite → xícara de cremoso → xícara larga de cappuccino), com sombra na louça, espuma, arte no leite,
  // borda e pingos de chocolate, torre de chantilly (com calda no último) e vapor nos que estão quentes e sem cobertura.
  function iconeCafezinho(tier, px) {
    const t = TIERS[tier] || TIERS[0];
    const N = 24, g = Array.from({ length: N }, () => Array(N).fill(null)), fumo = [];
    const p = (x, y, c) => { if (x >= 0 && x < N && y >= 0 && y < N) g[y][x] = c; };
    const linha = (x0, x1, y, c) => { for (let x = x0; x <= x1; x++) p(x, y, c); };
    const LOUCA = tier === 0 ? ['#ffffff', '#efe8da', '#d6ccb8', '#ad9f86']            // xícara de cafezinho: branca
      : tier === 1 ? ['#f08a6a', '#d4583a', '#b0442c', '#7e2e1e']                         // caneca de café com leite: terracota
      : tier <= 4 ? ['#bfe6ff', '#7cb8e8', '#5a92c8', '#3a6698']                          // xícara do cremoso: azul
      : ['#b8f0d8', '#5cc7a0', '#3e9e7c', '#2a7058'];                                     // xícara larga do cappuccino: verde-água
    const [CL, CE, CM, CD] = LOUCA, BORDA = '#fffaf0';
    const CHOC = '#5a3418', CHOCL = '#80502a', CREME = '#fff7ea', CREMED = '#e9d6b6', CACAU = '#6a3a1a';
    // formato: [meia largura, linha da borda de trás, base]
    const forma = tier === 0 ? [5, 12, 18] : tier === 1 ? [6, 8, 18] : tier >= 5 ? [8, 11, 18] : [7, 10, 18];
    const cx = 11, hw = forma[0], x0 = cx - hw, x1 = cx + hw + 1, top = forma[1], base = forma[2];
    // pires
    linha(x0 - 3, x1 + 3, base + 1, CE); linha(x0 - 2, x1 + 2, base + 2, CM); p(x0 - 3, base + 1, CM); p(x1 + 3, base + 1, CD);
    // alça (do lado direito)
    const ay = top + 5;
    p(x1 + 1, ay, CM); p(x1 + 2, ay, CM); p(x1 + 3, ay + 1, CD); p(x1 + 3, ay + 2, CD); if (base - top > 7) p(x1 + 3, ay + 3, CD); p(x1 + 2, ay + (base - top > 7 ? 4 : 3), CD); p(x1 + 1, ay + (base - top > 7 ? 4 : 3), CD);
    // corpo da xícara (sombreado: brilho à esquerda, sombra à direita, base mais escura)
    for (let y = top + 4; y <= base; y++) {
      const tp = y === base ? 1 : 0;
      for (let x = x0 + tp; x <= x1 - tp; x++) p(x, y, x <= x0 + 1 ? CL : x >= x1 - 1 ? CD : x >= x1 - 3 ? CM : CE);
      if (y === base) linha(x0 + 1, x1 - 1, y, CM);
    }
    // boca: borda de trás, líquido (2 linhas) e borda da frente
    linha(x0 + 1, x1 - 1, top, BORDA); for (const yy of [top + 1, top + 2, top + 3]) { p(x0, yy, BORDA); p(x1, yy, BORDA); }
    const liq1 = t.cor, liq2 = tier === 0 ? '#5a3418' : tier === 1 ? '#a8743e' : t.cor, liq3 = tier === 0 ? '#b8783a' : tier === 1 ? '#c49260' : t.cor;
    linha(x0 + 1, x1 - 1, top + 1, '#1c0c04'); linha(x0 + 1, x1 - 1, top + 2, liq1); linha(x0 + 1, x1 - 1, top + 3, liq2); linha(x0 + 2, x1 - 2, top + 3, liq3);
    p(x0 + 1, top + 1, liq1); p(x1 - 1, top + 1, liq1);
    linha(x0, x1, top + 4, BORDA);
    if (tier === 0) { p(cx - 1, top + 2, '#d89a52'); p(cx + 2, top + 3, '#d89a52'); p(cx + 1, top + 2, '#c88442'); }          // crema do cafezinho
    if (t.creme) { linha(x0 + 1, x1 - 1, top + 1, CREMED); linha(x0 + 1, x1 - 1, top + 2, CREME); linha(x0 + 1, x1 - 1, top + 3, CREME); p(x1 - 1, top + 3, CREMED); }   // espuma
    if (t.creme && !t.cacau && !t.chantilly) { linha(x0 + 3, x1 - 3, top, CREME); linha(x0 + 5, x1 - 5, top - 1, CREME); p(x1 - 4, top, CREMED); }   // montinho de espuma
    if (t.cacau) {                                                                          // cappuccino: arte de coração no leite + cacau
      for (const yy of [top + 1, top + 2, top + 3]) { linha(x0 + 1, x1 - 1, yy, '#c99766'); linha(x0 + 2, x1 - 2, yy, CREME); }
      if (!t.chantilly) { const HC = '#a86e3c'; p(cx - 1, top + 1, HC); p(cx, top + 1, HC); p(cx + 2, top + 1, HC); p(cx + 3, top + 1, HC); linha(cx - 1, cx + 3, top + 2, HC); linha(cx, cx + 2, top + 3, HC); }   // coração no leite
      if (!t.chantilly) { p(x0 + 2, top + 3, CACAU); p(x1 - 3, top + 2, CACAU); p(x0 + 3, top + 1, CACAU); }
    }
    if (t.chocBorda) {                                                                      // chocolate escorrendo pela borda
      for (let x = x0; x <= x1; x++) p(x, top + 4, x % 2 ? CHOC : CHOCL);
      const pingos = [[x0 + 1, 2], [x0 + 4, 3], [cx + 2, 1], [x1 - 2, 2]];
      for (const [x, n] of pingos) for (let k = 1; k <= n; k++) p(x, top + 4 + k, k === n ? CHOCL : CHOC);
    }
    if (t.chantilly) {                                                                      // torre de chantilly em espiral
      const cam = [[x0 + 1, x1 - 1], [x0 + 2, x1 - 2], [x0 + 3, x1 - 3], [x0 + 4, x1 - 4], [cx - 1, cx + 2], [cx, cx + 1]];
      cam.forEach(([a, b], i) => { const y = top - i; for (let x = a; x <= b; x++) p(x, y, x >= b - 1 ? CREMED : x === a ? CL : CREME); });
      p(cx, top - 6, CREME);
      if (t.cacau) { p(cx - 2, top - 1, CACAU); p(cx + 3, top - 2, CACAU); p(cx, top - 3, CACAU); }
      if (tier === TIERS.length - 1) {                                                        // calda de chocolate em zigue-zague por cima
        p(x0 + 2, top, CHOC); p(x0 + 3, top - 1, CHOC); p(x0 + 4, top - 2, CHOC); p(cx - 1, top - 3, CHOC); p(cx, top - 4, CHOC); p(cx + 1, top - 3, CHOC); p(x1 - 4, top - 2, CHOC); p(x1 - 3, top - 1, CHOC); p(x1 - 2, top, CHOC);
      }
    }
    if (!t.chantilly && !(t.creme && !t.cacau)) {                                           // vapor (quente, sem cobertura)
      const vy = top - 2;
      for (const [x, y] of [[cx - 2, vy], [cx - 1, vy - 1], [cx - 1, vy - 2], [cx - 2, vy - 3], [cx + 2, vy - 1], [cx + 3, vy - 2], [cx + 3, vy - 3], [cx + 2, vy - 4]]) fumo.push([x, y]);
    }
    // contorno escuro automático (tudo menos o vapor)
    const k = '#2a1206', out = g.map((r) => r.slice());
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (!g[y][x]) { for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const yy = y + dy, xx = x + dx; if (yy >= 0 && yy < N && xx >= 0 && xx < N && g[yy][xx]) { out[y][x] = k; break; } } }
    for (const [x, y] of fumo) if (y >= 0 && !out[y][x]) out[y][x] = 'rgba(235,240,246,0.75)';
    if (tier === TIERS.length - 1) for (const [x, y, c] of [[3, 3, '#ffe066'], [2, 3, '#fff3b0'], [4, 3, '#fff3b0'], [3, 2, '#fff3b0'], [3, 4, '#fff3b0'], [20, 6, '#ffe066']]) out[y][x] = c;   // brilho: é o melhor da casa
    const cv = document.createElement('canvas'); cv.width = cv.height = N; const c2 = cv.getContext('2d');
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (out[y][x]) { c2.fillStyle = out[y][x]; c2.fillRect(x, y, 1, 1); }
    cv.style.cssText = 'width:' + (px || '84%') + ';height:auto;aspect-ratio:1;image-rendering:pixelated;display:block;margin:0 auto;pointer-events:none;';
    return cv;
  }
  function ganhoNaTela(v) {                        // "+v" verde subindo (o oposto do gastoNaTela, que é vermelho e desce)
    const el = document.createElement('div'); el.textContent = '+' + v; el.style.cssText = 'position:fixed;z-index:12;right:max(60px,env(safe-area-inset-right,0px));top:calc(46px + env(safe-area-inset-top,0px));font:700 16px/1 var(--font-display);color:#8fe04a;text-shadow:0 2px 0 #2a1206;pointer-events:none;transition:transform 1.2s ease,opacity 1.2s ease;';
    UI.hud.parentNode.appendChild(el); requestAnimationFrame(() => { el.style.transform = 'translateY(-22px)'; el.style.opacity = '0'; }); setTimeout(() => el.remove(), 1300);
  }
  // ================================================================== (5.2.0) O EXPEDIENTE NA CAFETERIA (Merge Game de verdade)
  //   Os clientes entram, sentam e mostram num balãozinho o café que querem (com "!" enquanto ninguém anotou). O jogador vai até a mesa
  //   e ANOTA o pedido; na BANCADA DE PREPARO (parede oeste) abre o joguinho de juntar cafés. A grade fica guardada o turno inteiro.
  //   Quando sai do joguinho o café de um pedido anotado, ele vai para a MÃO do jogador (o jogo fecha sozinho) e é só levar até o
  //   cliente: ele dá uma GORJETA de 1 a 5 fakes, toma o café, levanta, paga no caixa (plim da registradora) e vai embora.
  //   Controle de carga: no máximo 3 clientes esperando e só chega cliente novo se der tempo de fazer o pedido dele até as 16h
  //   (custo estimado em segundos reais = deslocamento + 2^nível de toques), então dá para atender todo mundo no turno.
  //   O relógio não para (S.trabalhando) e o turno acaba às 16h: 20 fakes do dia + 5 por pedido (PAGA_BASE/PAGA_PEDIDO).
  //   "Acelerar final do turno" pula para as 16h e paga SÓ os 20 do dia (as gorjetas já recebidas ficam com você).
  const MAX_ESPERANDO = 3, PESO_TIER = [26, 22, 18, 13, 9, 6, 4, 2];
  const custoTier = (t) => 16 + Math.pow(2, t) * 1.05;                 // segundos reais para fazer e entregar um pedido desse nível
  const segAteFim = () => Math.max(0, (H_TRAB_FIM - S.dados.hora) / H_POR_S);
  const CAIXA_CLI = { x: 0.9, z: -4.25 };                               // onde o cliente para para pagar (na frente do caixa da Lúcia)
  function iniciarTurno() {
    const d = S.dados;
    S.turno = { grade: Array(16).fill(-1), anotados: [], naMao: -1, atendidos: 0, gorjetas: 0, prox: 3, fim: false };
    S.trabalhando = true;
    if (S.fluxo) for (const A of S.npcs) if (A.cli && !A.cli.pedido && A.cli.fase === 'fica') A.cli.t = Math.min(A.cli.t, 3 + Math.random() * 12);   // os clientes "de enfeite" vão saindo
    MusicaCafe.tocar(); SomCafe.sino();
    montarPainelTurno(); atualizarPainelTurno();
    aviso(T('Clientes com "!" querem fazer um pedido. Anote na mesa e prepare na bancada (à esquerda).')); setTimeout(() => { if (S && UI && S.turno) aviso(''); }, 5200);
    void d;
  }
  function clientesDoTurno() { return S.npcs.filter((A) => A.cli && A.cli.pedido && A.cli.pedido.estado !== 'feito' && A.cli.fase !== 'sai' && A.cli.fase !== 'caixa'); }
  function tickTurno(dt) {
    const U = S.turno; if (!U || U.fim) return;
    if (S.dados.hora >= H_TRAB_FIM) { encerrarTurno(false); return; }
    U.prox -= dt;
    const pend = clientesDoTurno();
    if (U.prox <= 0 && pend.length < MAX_ESPERANDO && S.fluxo) {
      U.prox = 7 + Math.random() * 9;
      const resto = segAteFim() * 0.85 - pend.reduce((a, A) => a + custoTier(A.cli.pedido.tier), 0);
      const ok = PESO_TIER.map((w, t) => (custoTier(t) <= resto ? w : 0)), soma = ok.reduce((a, b) => a + b, 0);
      const livres = S.fluxo.lugares.filter((a) => !a.ocupado);
      if (soma > 0 && livres.length) {
        let r = Math.random() * soma, tier = 0; for (let t = 0; t < ok.length; t++) { r -= ok[t]; if (r <= 0) { tier = t; break; } }
        const e = S.fluxo.ent, pe = [[0, 0], [1.1, 0], [-1.1, 0], [0, -1.1]].map(([dx, dz]) => ({ x: e.x + dx, z: e.z + dz, yaw: e.yaw })).find((q) => Math.hypot(q.x - S.jog.x, q.z - S.jog.z) > 0.9) || e;
        S.fluxo.entAgora = pe;                                               // (5.2.1) não nasce "dentro" do jogador parado na porta
        const A = novoCliente(livres[Math.floor(Math.random() * livres.length)], false);
        A.cli.t = 1e9; A.cli.pedido = { tier, estado: 'chegando' }; A.oculto = false; S.meus.add(A.m); A.m.raiz.visible = true; SomCafe.sino();
      }
    }
    for (const A of S.npcs) if (A.cli && A.cli.pedido) atualizarBalao(A);
    atualizarPainelTurno();
  }
  // ---- balão em cima do cliente (sprite de pixel art: o café pedido; "!" laranja = ainda não anotado; borda amarela = anotado; coração = servido)
  function desenharBalao(cv, tier, estado) {
    const g = cv.getContext('2d'); g.clearRect(0, 0, 40, 46); g.imageSmoothingEnabled = false;
    const borda = estado === 'anotado' ? '#f2c230' : '#2a1206';
    g.fillStyle = borda; g.fillRect(3, 1, 34, 34); g.fillRect(16, 35, 8, 3); g.fillRect(18, 38, 4, 3);
    g.fillStyle = '#fffaf0'; g.fillRect(5, 3, 30, 30); g.fillRect(18, 33, 4, 4);
    if (estado === 'feliz') {
      g.fillStyle = '#e0405a'; for (const [x, y, w] of [[11, 10, 6], [23, 10, 6], [9, 12, 22], [9, 14, 22], [11, 16, 18], [13, 18, 14], [15, 20, 10], [17, 22, 6], [19, 24, 2]]) g.fillRect(x, y, w, 2);
      g.fillStyle = '#ff9aaa'; g.fillRect(12, 12, 3, 2);
    } else g.drawImage(iconeCafezinho(tier, '1px'), 7, 5, 26, 26);
    if (estado === 'espera') { g.fillStyle = '#2a1206'; g.fillRect(28, 0, 12, 14); g.fillStyle = '#f0a020'; g.fillRect(29, 1, 10, 12); g.fillStyle = '#2a1206'; g.fillRect(33, 3, 2, 5); g.fillRect(33, 9, 2, 2); }
  }
  function atualizarBalao(A) {
    const P = A.cli.pedido; if (!P) return;
    if (P.estado === 'chegando' && A.cli.fase === 'fica') P.estado = 'espera';
    const visivel = P.estado !== 'chegando' && P.estado !== 'feito' && A.cli.fase !== 'sai' && A.cli.fase !== 'caixa';
    if (!visivel) { if (A.balao) A.balao.visible = false; return; }
    if (!A.balao) {
      const cv = document.createElement('canvas'); cv.width = 40; cv.height = 46;
      const tx = new THREE.CanvasTexture(cv); tx.magFilter = THREE.NearestFilter; tx.minFilter = THREE.NearestFilter;
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, depthTest: false, transparent: true })); sp.scale.set(0.8, 0.92, 1); sp.renderOrder = 20;
      A.m.raiz.add(sp); A.balao = sp; A.balaoCv = cv; A.balaoEst = '';
    }
    A.balao.visible = true; A.balao.position.set(0, 2.25 + Math.sin(A.t * 3) * 0.04, 0);
    if (A.balaoEst !== P.estado) { A.balaoEst = P.estado; desenharBalao(A.balaoCv, P.tier, P.estado); A.balao.material.map.needsUpdate = true; }
  }
  // ---- o café na mão do jogador (xícara com pires; a cor da louça segue a família do café, como nos ícones)
  function copoNaMao(tier) {
    const J = S.jog;
    if (J.copo) { if (J.copo.parent) J.copo.parent.remove(J.copo); J.copo = null; }
    if (tier < 0) return;
    const louca = tier === 0 ? '#efe8da' : tier === 1 ? '#d4583a' : tier <= 4 ? '#7cb8e8' : '#5cc7a0', t = TIERS[tier];
    const G = new Geo();
    G.box(0.2, 0.025, 0.2, '#efe8da', 0, 0, 0);                                            // pires
    G.box(0.12, 0.1, 0.12, louca, 0, 0.025, 0);                                             // xícara
    G.box(0.1, 0.012, 0.1, t.creme ? '#fff4e2' : t.cor, 0, 0.125, 0);                       // o café (ou a espuma)
    G.box(0.03, 0.05, 0.02, louca, 0.075, 0.05, 0);                                         // alça
    if (t.chantilly) { G.box(0.08, 0.05, 0.08, '#fff7ea', 0, 0.137, 0); G.box(0.04, 0.04, 0.04, '#fff7ea', 0, 0.187, 0); }
    if (t.chocBorda) G.box(0.124, 0.015, 0.124, '#5a3418', 0, 0.112, 0);
    const m = G.malha(MAT); m.rotation.z = -1.55; m.position.set(0.12, -0.27, 0);
    J.m.bracoD.cotovelo.add(m); J.copo = m;
  }
  // (5.2.1) a xícara na mão de um cliente: um pivô na mão que fica sempre de pé (poseAtor desfaz o giro do braço)
  function darCopo(A, tier) {
    tirarCopo(A);
    const louca = tier === 0 ? '#efe8da' : tier === 1 ? '#d4583a' : tier <= 4 ? '#7cb8e8' : '#5cc7a0', t = TIERS[tier] || TIERS[0], G = new Geo();
    G.box(0.1, 0.09, 0.1, louca, 0, 0, 0); G.box(0.085, 0.012, 0.085, t.creme ? '#fff4e2' : t.cor, 0, 0.09, 0); G.box(0.025, 0.045, 0.02, louca, 0, 0.03, 0.06);
    if (t.chantilly) G.box(0.06, 0.04, 0.06, '#fff7ea', 0, 0.1, 0);
    const piv = new THREE.Group(); piv.position.set(0, -0.3, 0); piv.add(G.malha(MAT)); A.m.bracoD.cotovelo.add(piv); A.copoCli = piv;
  }
  function tirarCopo(A) { if (A.copoCli) { if (A.copoCli.parent) A.copoCli.parent.remove(A.copoCli); A.copoCli = null; } }
  function poseCopo(J) {                                                                    // braço direito dobrado para a frente segurando a xícara de pé
    if (!J.copo) return;
    const m = J.m; m.bracoD.rotation.z = 0.35; m.bracoD.rotation.x = 0; usarCotovelo(m.bracoD, 0, 1.2);
    J.copo.rotation.z = -1.55;
  }
  // ---- os alvos do turno (dentro da cafeteria)
  function alvosTurno(v) {
    const U = S.turno; if (!U || U.fim) return;
    for (const A of S.npcs) {
      const P = A.cli && A.cli.pedido; if (!P || A.cli.fase !== 'fica') continue;
      const nome = T(TIERS[P.tier].nome);
      if (P.estado === 'espera') v.push({ x: A.x, z: A.z, r: 1.7, txt: T('Anotar pedido'), fn: () => anotarPedido(A), y: 2.9, pri: true });
      else if (P.estado === 'anotado' && U.naMao === P.tier) v.push({ x: A.x, z: A.z, r: 1.7, txt: Tf('Entregar: {0}', nome), fn: () => entregarPedido(A), y: 2.9, pri: true });
      else if (P.estado === 'anotado') v.push({ x: A.x, z: A.z, r: 1.5, txt: Tf('Pedido: {0}', nome), fn: async () => { aviso(U.naMao >= 0 ? T('Esse café na sua mão não é o que este cliente pediu.') : T('Prepare esse pedido na bancada.')); setTimeout(() => aviso(''), 2600); }, y: 2.9 });
    }
  }
  async function anotarPedido(A) {
    const U = S.turno, P = A.cli.pedido; if (!U || P.estado !== 'espera') return;
    S.jog.yawAlvo = Math.atan2(-(A.z - S.jog.z), A.x - S.jog.x); A.fala = true;
    SomCafe.anotar(); P.estado = 'anotado'; U.anotados.push(A); atualizarBalao(A);
    aviso(Tf('Pedido anotado: {0}. Prepare na bancada.', T(TIERS[P.tier].nome))); await esperar(900); A.fala = false;
    setTimeout(() => { if (S && UI) aviso(''); }, 1800);
  }
  async function entregarPedido(A) {
    const U = S.turno, P = A.cli.pedido, d = S.dados; if (!U || U.naMao !== P.tier) return;
    S.jog.yawAlvo = Math.atan2(-(A.z - S.jog.z), A.x - S.jog.x);
    U.naMao = -1; copoNaMao(-1); SomCafe.entregar();
    P.estado = 'feliz'; atualizarBalao(A); U.anotados = U.anotados.filter((q) => q !== A);
    const gorjeta = 1 + Math.floor(Math.random() * 3);                 // (5.2.1) gorjeta aleatória de 1 a 3 fakes, na hora
    U.atendidos++; U.gorjetas += gorjeta; d.fakes += gorjeta;
    await esperar(350); somDinheiro(); ganhoNaTela(gorjeta); mostrarDinheiro(true);
    aviso(Tf('Gorjeta: +{0} fakes!', gorjeta)); setTimeout(() => { if (S && UI) aviso(''); }, 1800);
    darCopo(A, P.tier); A.bebe = 4.6; A.cli.t = 5.4;                 // (5.2.1) toma o café (poseAtor: bebendo) e depois vai pagar no caixa (tickCliente)
    setTimeout(() => { if (A.cli && A.cli.pedido) A.cli.pedido.estado = 'feito'; if (A.balao) A.balao.visible = false; }, 1600);
    atualizarPainelTurno();
  }
  // ---- a bancada de preparo: o joguinho de juntar (a grade é do turno inteiro)
  function abrirBancada() {
    const U = S.turno;
    if (!U || U.fim) return Promise.resolve();
    if (U.naMao >= 0) { aviso(T('Você já está com um café na mão. Entregue primeiro!')); setTimeout(() => aviso(''), 2400); return Promise.resolve(); }
    return new Promise((res) => {
      const COLS = 4, LINS = 4, NC = COLS * LINS, d = S.dados, grade = U.grade, esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
      let sel = -1, acabou = false, avisoT = null;
      const el = document.createElement('div'); el.id = 'cdTrabalho';
      el.style.cssText = 'position:fixed;inset:0;z-index:22;display:grid;place-items:center;background:rgba(6,4,2,.6);padding:max(6px,env(safe-area-inset-top,0px)) max(8px,env(safe-area-inset-right,0px)) max(6px,env(safe-area-inset-bottom,0px)) max(8px,env(safe-area-inset-left,0px));box-sizing:border-box;';
      const lado = 'min(calc(var(--avh, 1vh) * 100 - 36px), 52vw, 440px)';
      const card = document.createElement('div');
      card.style.cssText = 'display:grid;grid-template-columns:minmax(150px,230px) auto;gap:10px;align-items:stretch;max-width:100%;max-height:100%;overflow:auto;background:#2a1206;border:4px solid #8a5a2a;color:#fff0c8;padding:8px 10px;box-sizing:border-box;font-family:var(--font-body);';
      const col = document.createElement('div'); col.style.cssText = 'display:flex;flex-direction:column;gap:6px;min-width:0;';
      const h = document.createElement('div'); h.style.cssText = 'font:700 12px/1.2 var(--font-display);letter-spacing:.06em;text-transform:uppercase;color:#f0a020;';
      h.textContent = T('Bancada de preparo');
      const btnFechar = document.createElement('button'); btnFechar.type = 'button'; btnFechar.className = 'pxBtn'; btnFechar.textContent = T('Fechar'); btnFechar.style.cssText = '--p:var(--p2,2px);min-height:26px;font-size:9px;padding:0 8px;align-self:flex-start;';
      const topo = document.createElement('div'); topo.style.cssText = 'display:flex;justify-content:space-between;align-items:flex-start;gap:6px;'; topo.append(h, btnFechar);
      const relogio = document.createElement('div'); relogio.style.cssText = 'font:700 12px/1.2 var(--font-display);font-variant-numeric:tabular-nums;';
      const barra = document.createElement('div'); barra.style.cssText = 'height:6px;background:#1f0f06;border:2px solid #4a2c14;'; const barraF = document.createElement('div'); barraF.style.cssText = 'height:100%;width:0;background:#f0a020;'; barra.appendChild(barraF);
      const pedT = document.createElement('div'); pedT.style.cssText = 'font:700 10px/1.2 var(--font-display);color:#e8d8b8;'; pedT.textContent = T('Pedidos anotados');
      const pedidos = document.createElement('div'); pedidos.style.cssText = 'display:flex;gap:5px;min-height:46px;';
      const selBox = document.createElement('div'); selBox.style.cssText = 'display:flex;align-items:center;gap:6px;background:#3a1c0a;border:3px solid #4a2c14;padding:3px 6px;min-height:42px;';
      const selIc = document.createElement('div'), selTxt = document.createElement('div'); selIc.style.cssText = 'flex:0 0 40px;width:40px;'; selTxt.style.cssText = 'font:400 12px/1.25 var(--font-body);min-width:0;'; selBox.append(selIc, selTxt);
      const btnGerar = document.createElement('button'); btnGerar.type = 'button'; btnGerar.className = 'pxBtn pxPrim'; btnGerar.textContent = T('Gerar cafezinho'); btnGerar.style.cssText = '--p:var(--p2,2px);min-height:38px;font-size:11px;';
      col.append(topo, relogio, barra, pedT, pedidos, selBox, btnGerar);
      const grid = document.createElement('div'); grid.style.cssText = 'display:grid;grid-template-columns:repeat(' + COLS + ',1fr);grid-template-rows:repeat(' + LINS + ',1fr);gap:4px;width:' + lado + ';height:' + lado + ';';
      const cels = []; for (let i = 0; i < NC; i++) { const c = document.createElement('button'); c.type = 'button'; c.style.cssText = 'position:relative;min-width:0;min-height:0;background:#1f0f06;border:2px solid #4a2c14;padding:0;display:grid;place-items:center;cursor:pointer;'; grid.appendChild(c); cels.push(c); }
      card.append(col, grid); el.appendChild(card); ($('raizJogo') || document.body).appendChild(el);
      const icone = (alvo, tier) => { alvo.innerHTML = ''; if (tier >= 0) alvo.appendChild(iconeCafezinho(tier, '100%')); };
      const nomeT = (v) => T(TIERS[v].nome);
      const precisa = () => new Set(U.anotados.filter((A) => A.cli && A.cli.pedido && A.cli.pedido.estado === 'anotado').map((A) => A.cli.pedido.tier));
      function mostrarSel(texto) {
        if (avisoT) { clearTimeout(avisoT); avisoT = null; }
        if (texto) { selTxt.innerHTML = texto; return; }
        if (sel >= 0) {
          const v = grade[sel]; icone(selIc, v);
          selTxt.innerHTML = '<b style="font:700 11px/1.2 var(--font-display);color:#f0a020">' + esc(nomeT(v)) + '</b><br>' + (v < TIERS.length - 1 ? esc(Tf('Junte com outro igual: vira {0}', nomeT(v + 1))) : esc(T('O melhor café da casa!')));
        } else { icone(selIc, -1); selTxt.textContent = T('Toque num café para ver o nome dele.'); }
      }
      function atualizarTopo() {
        const k = clamp((d.hora - H_TRAB_INI) / (H_TRAB_FIM - H_TRAB_INI), 0, 1);
        relogio.textContent = fmtHora(d.hora) + ' · ' + Tf('fim às {0}', fmtHora(H_TRAB_FIM)); barraF.style.width = (k * 100).toFixed(1) + '%';
        const pr = precisa(), chave = [...U.anotados].map((A) => A.cli && A.cli.pedido ? A.cli.pedido.tier : -1).join(',');
        if (pedidos.dataset.k !== chave) {
          pedidos.dataset.k = chave; pedidos.innerHTML = '';
          if (!pr.size) { const s = document.createElement('div'); s.style.cssText = 'font:400 11px/1.3 var(--font-body);color:#c8b898;'; s.textContent = T('Nenhum pedido anotado. Anote nas mesas!'); pedidos.appendChild(s); }
          for (const A of U.anotados) { const P = A.cli && A.cli.pedido; if (!P || P.estado !== 'anotado') continue; const b = document.createElement('div'); b.style.cssText = 'flex:0 0 44px;width:44px;background:#3a1c0a;border:2px solid #f2c230;'; b.title = nomeT(P.tier); b.appendChild(iconeCafezinho(P.tier, '100%')); pedidos.appendChild(b); }
        }
      }
      function redesenhar() {
        const pr = precisa();
        for (let i = 0; i < NC; i++) {
          const c = cels[i], v = grade[i]; c.innerHTML = ''; c.style.borderColor = i === sel ? '#f0a020' : v >= 0 && pr.has(v) ? '#8fe04a' : '#4a2c14';
          if (v >= 0) { c.appendChild(iconeCafezinho(v, '86%')); c.title = nomeT(v); const nv = document.createElement('span'); nv.textContent = String(v + 1); nv.style.cssText = 'position:absolute;right:2px;bottom:1px;font:700 9px/1 var(--font-display);color:#f0a020;text-shadow:1px 1px 0 #000;pointer-events:none;'; c.appendChild(nv); }
          else c.title = '';
        }
        btnGerar.disabled = acabou || !grade.includes(-1);
        atualizarTopo();
      }
      function fechar() { if (acabou) return; acabou = true; clearInterval(tk); el.remove(); res(); }
      // o café que acabou de sair é de um pedido anotado? vai para a mão e o joguinho fecha
      function pegarSePronto(i) {
        const v = grade[i]; if (v < 0 || !precisa().has(v)) return false;
        grade[i] = -1; sel = -1; U.naMao = v; copoNaMao(v); SomCafe.pronto();
        acabou = true; clearInterval(tk); redesenhar();
        mostrarSel('<b style="font:700 12px/1.25 var(--font-display);color:#8fe04a">' + esc(Tf('Pronto! Leve o {0} para o cliente.', nomeT(v))) + '</b>'); icone(selIc, v);
        setTimeout(() => { el.remove(); res(); }, 1100);
        return true;
      }
      mostrarSel(); redesenhar();
      { const pr = precisa(); const i = grade.findIndex((v) => v >= 0 && pr.has(v)); if (i >= 0) setTimeout(() => pegarSePronto(i), 250); }   // já tinha um pronto guardado na grade
      const tk = setInterval(() => { if (!S || !S.ativo || !S.turno || S.turno.fim) { fechar(); return; } atualizarTopo(); }, 200);
      btnFechar.onclick = () => { som(); fechar(); };
      btnGerar.onclick = () => {
        if (acabou) return;
        const vazias = grade.reduce((a, v, i) => (v === -1 ? (a.push(i), a) : a), []); if (!vazias.length) { SomCafe.erro(); return; }
        const i = vazias[Math.floor(Math.random() * vazias.length)]; grade[i] = 0; SomCafe.gerar();
        if (!pegarSePronto(i)) redesenhar();
      };
      cels.forEach((c, i) => {
        c.onclick = () => {
          if (acabou || grade[i] === -1) return;
          if (sel === -1 || sel === i) { sel = sel === i ? -1 : i; SomCafe.toque(); mostrarSel(); redesenhar(); return; }
          if (grade[sel] === grade[i] && grade[i] < TIERS.length - 1) {
            grade[i] = grade[i] + 1; grade[sel] = -1; sel = -1; SomCafe.juntar(grade[i]);
            if (pegarSePronto(i)) return;
            mostrarSel('<b style="font:700 11px/1.2 var(--font-display);color:#8fe04a">' + esc(Tf('Virou: {0}', nomeT(grade[i]))) + '</b>'); icone(selIc, grade[i]);
            avisoT = setTimeout(() => { avisoT = null; mostrarSel(); }, 1600);
          } else { if (grade[sel] !== grade[i]) SomCafe.erro(); sel = i; mostrarSel(); }
          redesenhar();
        };
      });
    });
  }
  // ---- o painel do turno (no alto, no meio): relógio, atendidos, gorjetas, o que está na mão e "Acelerar final do turno"
  function montarPainelTurno() {
    if (UI.turno) { painelRecolhivel(UI.turno); return; }
    const p = document.createElement('div'); p.id = 'cdTurno';
    p.style.cssText = 'position:fixed;z-index:9;left:50%;transform:translateX(-50%);top:calc(48px + env(safe-area-inset-top,0px));display:flex;align-items:center;gap:8px;background:rgba(42,18,6,.9);border:3px solid #8a5a2a;color:#fff0c8;padding:3px 6px 3px 8px;font:700 11px/1.2 var(--font-display);white-space:nowrap;max-width:calc(100% - 24px);';
    p.innerHTML = '<span class="tTxt"></span><span class="tMao" style="display:inline-block;width:26px;height:26px"></span><button type="button" class="pxBtn tAcel" style="--p:var(--p2,2px);min-height:26px;font-size:9px;padding:0 6px"></button>';
    ($('raizJogo') || document.body).appendChild(p);
    UI.turno = p; UI.turnoTxt = p.querySelector('.tTxt'); UI.turnoMao = p.querySelector('.tMao'); UI.turnoAcel = p.querySelector('.tAcel');
    UI.turnoAcel.textContent = T('Acelerar final do turno');
    UI.turnoAcel.onclick = () => { if (S && S.modo === 'livre' && S.turno && !S.turno.fim) { som(); S.modo = 'cena'; UI.ctl.hidden = true; acelerarTurno().finally(() => { if (S && S.ativo && S.modo === 'cena') liberar(); }); } };
    painelRecolhivel(p);                                               // (5.4.0) aparece uma vez e vira o ícone "!"
  }
  function atualizarPainelTurno() {
    const U = S.turno; if (!U || !UI.turno) return;
    const txt = fmtHora(S.dados.hora) + ' → ' + fmtHora(H_TRAB_FIM) + ' · ' + Tf('Atendidos: {0}', U.atendidos) + ' · ' + Tf('Gorjetas: {0}', U.gorjetas) + ' · ' + T('Na mão:');
    if (UI.turnoTxt.textContent !== txt) UI.turnoTxt.textContent = txt;
    if (UI.turnoMao.dataset.t !== String(U.naMao)) { UI.turnoMao.dataset.t = String(U.naMao); UI.turnoMao.innerHTML = U.naMao >= 0 ? '' : '<span style="color:#a88a5a">—</span>'; if (U.naMao >= 0) UI.turnoMao.appendChild(iconeCafezinho(U.naMao, '26px')); }
  }
  async function acelerarTurno() {
    const r = await Escolha.mostrar(T('Acelerar até as 16h? Você só ganha os 20 fakes do dia, sem nenhum adicional pelos clientes atendidos (as gorjetas que já recebeu ficam com você).'), [T('Acelerar'), T('Continuar trabalhando')], { centro: true });
    Dialogo.esconder();
    if (r !== 0 || !S.turno || S.turno.fim) return;
    await preto(true, 450); S.dados.hora = H_TRAB_FIM; await encerrarTurno(true); await preto(false, 450);
  }
  // ---- fim do turno (16h ou acelerado): os clientes que esperavam vão embora, paga e a Lúcia se despede
  async function encerrarTurno(acelerado) {
    const U = S.turno, d = S.dados; if (!U || U.fim) return; U.fim = true;
    S.trabalhando = false; MusicaCafe.parar(); copoNaMao(-1);
    for (const A of S.npcs) if (A.cli && A.cli.pedido) { if (A.balao) A.balao.visible = false; if (A.cli.pedido.estado !== 'feliz' && A.cli.pedido.estado !== 'feito') { A.cli.pedido.estado = 'feito'; A.cli.semPagar = true; A.cli.t = Math.min(A.cli.t, 1 + Math.random() * 4); } }
    if (UI.turno) fimPainel(UI.turno);                                  // (5.4.0)
    const el = document.getElementById('cdTrabalho'); if (el) el.remove();
    const paga = PAGA_BASE + (acelerado ? 0 : PAGA_PEDIDO * U.atendidos);
    d.trabalhouHoje = true; d.trabalhouDia = d.dia; d.trabalhouAlgumDia = true; d.fakes += paga; somDinheiro(); ganhoNaTela(paga); mostrarDinheiro(true); SomCafe.fim();
    gravar('chegada');
    const espera = S.modo !== 'livre'; if (!espera) { S.modo = 'cena'; UI.ctl.hidden = true; }
    try {
      if (acelerado) await fala('lucia', Tf('Turno encerrado! Hoje fica só o do dia: {0} fakes. Até amanhã!', paga));
      else await fala('lucia', Tf('Acabou o seu turno de hoje! Você atendeu {0} clientes: toma, {1} fakes ({2} do dia + {3} dos pedidos). Até a próxima!', U.atendidos, paga, PAGA_BASE, PAGA_PEDIDO * U.atendidos));
      Dialogo.esconder();
    } catch (e) { console.error(e); }
    S.turno = null; try { Musica.tocar('jazz'); } catch (e) { /* sem música */ }
    if (!espera && S && S.ativo && S.modo === 'cena') liberar();
  }
  // ================================================================== (5.2.0) SONS DA CAFETERIA (tudo sintetizado no WebAudio, como a música do jogo.js)
  //   Som.audio é { ctx, mestre }: o volume geral (e o "mudo") do jogo vale para tudo daqui.
  const audioCafe = () => (typeof Som !== 'undefined' && Som.audio && !Som.mudo ? Som.audio : null);
  const SomCafe = (() => {
    const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
    let ruido = null;
    function tom(A, m, t, dur, vol, tipo, o) {
      o = o || {}; const c = A.ctx, osc = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter();
      osc.type = tipo || 'sine'; osc.frequency.setValueAtTime(typeof m === 'number' && m < 200 ? hz(m) : m, t);
      if (o.ate) osc.frequency.exponentialRampToValueAtTime(o.ate, t + dur * 0.9);
      f.type = 'lowpass'; f.frequency.value = o.corte || 5000;
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + (o.ataque || 0.006)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(f); f.connect(g); g.connect(A.mestre); osc.start(t); osc.stop(t + dur + 0.05);
    }
    function chiado(A, t, dur, vol, freq, tipo, q) {
      const c = A.ctx; if (!ruido || ruido.sampleRate !== c.sampleRate) { ruido = c.createBuffer(1, c.sampleRate, c.sampleRate); const d = ruido.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
      const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s.buffer = ruido;
      f.type = tipo || 'bandpass'; f.frequency.value = freq || 3000; if (q) f.Q.value = q;
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(f); f.connect(g); g.connect(A.mestre); s.start(t, Math.random() * 0.5, dur + 0.02);
    }
    const com = (fn) => () => { const A = audioCafe(); if (!A) return; try { fn(A, A.ctx.currentTime + 0.01); } catch (e) { /* sem som */ } };
    const PENTA = [72, 74, 76, 79, 81, 84, 86, 88];                    // dó maior pentatônica: cada nível do café sobe uma nota
    return {
      gerar: com((A, t) => { chiado(A, t, 0.12, 0.12, 900, 'bandpass', 2); tom(A, 520, t + 0.02, 0.12, 0.09, 'sine', { ate: 260 }); tom(A, 60, t + 0.09, 0.08, 0.05, 'triangle'); }),   // "blup" do café caindo na xícara
      toque: com((A, t) => { tom(A, 84, t, 0.05, 0.05, 'square', { corte: 2400 }); }),
      juntar: (tier) => com((A, t) => {                                // dois cafés viram um: tilintar subindo + um brilhinho no fim (mais alto quanto maior o nível)
        const n = PENTA[Math.min(PENTA.length - 1, tier)];
        tom(A, n - 5, t, 0.09, 0.07, 'triangle'); tom(A, n, t + 0.07, 0.16, 0.08, 'triangle'); tom(A, n + 12, t + 0.07, 0.22, 0.03, 'sine');
        if (tier >= 5) for (let k = 0; k < 3; k++) tom(A, n + 7 + k * 5, t + 0.18 + k * 0.05, 0.12, 0.03, 'sine');
        if (tier === TIERS.length - 1) { tom(A, 84, t + 0.3, 0.18, 0.05, 'square', { corte: 3000 }); tom(A, 88, t + 0.42, 0.18, 0.05, 'square', { corte: 3000 }); tom(A, 91, t + 0.54, 0.4, 0.06, 'square', { corte: 3000 }); }
      })(),
      erro: com((A, t) => { tom(A, 51, t, 0.16, 0.06, 'square', { corte: 900, ate: 110 }); }),
      anotar: com((A, t) => { for (let k = 0; k < 5; k++) chiado(A, t + k * 0.055, 0.04, 0.09, 4200 + Math.random() * 1500, 'bandpass', 4); tom(A, 88, t + 0.3, 0.07, 0.04, 'sine'); }),   // lápis no bloquinho
      pronto: com((A, t) => { tom(A, 2093, t, 0.25, 0.06, 'sine'); tom(A, 2637, t + 0.06, 0.3, 0.05, 'sine'); tom(A, 79, t + 0.12, 0.2, 0.05, 'triangle'); tom(A, 84, t + 0.22, 0.3, 0.06, 'triangle'); }),   // xícara no pires: "tlin" + nota feliz
      entregar: com((A, t) => { for (const [i, m] of [[0, 76], [1, 79], [2, 84]]) tom(A, m, t + i * 0.08, 0.18, 0.07, 'triangle'); }),
      caixa: com((A, t) => {                                           // registradora: teclinhas, a gaveta abrindo e o "plim"
        for (let k = 0; k < 3; k++) chiado(A, t + k * 0.07, 0.03, 0.12, 2500, 'highpass');
        chiado(A, t + 0.25, 0.18, 0.12, 700, 'bandpass', 1.5);
        tom(A, 2349, t + 0.36, 0.6, 0.06, 'sine'); tom(A, 3136, t + 0.36, 0.45, 0.04, 'sine'); tom(A, 1568, t + 0.36, 0.5, 0.03, 'triangle');
      }),
      sino: com((A, t) => { tom(A, 1760, t, 0.6, 0.05, 'sine'); tom(A, 1319, t + 0.18, 0.8, 0.05, 'sine'); }),   // sininho da porta
      fim: com((A, t) => { for (const [i, m] of [[0, 72], [1, 76], [2, 79], [3, 84], [5, 79], [6, 84]]) tom(A, m, t + i * 0.11, 0.22, 0.06, 'square', { corte: 2600 }); }),
    };
  })();
  // ---- MÚSICA TEMA DA CAFETERIA: bossa animadinha (120 bpm): baixo de bossa, piano elétrico sincopado, vibrafone com o tema,
  //      chocalho em semicolcheias e o "clique" de aro na clave. Toca durante o turno.
  const MusicaCafe = (() => {
    let bus = null, timer = 0, prox = 0, comp = 0, ruido = null;
    const BPM = 120, B = 60 / BPM, S16 = B / 4;
    const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
    const ACORDES = [                                                    // raiz do baixo, notas do piano
      { r: 36, n: [52, 55, 59, 62] },   // Cmaj9
      { r: 33, n: [52, 55, 57, 61] },   // A7(13)
      { r: 38, n: [53, 57, 60, 64] },   // Dm9
      { r: 31, n: [53, 57, 59, 64] },   // G13
      { r: 40, n: [55, 59, 62, 66] },   // Em7
      { r: 33, n: [55, 57, 61, 64] },   // A7
      { r: 38, n: [53, 57, 60, 65] },   // Dm7
      { r: 31, n: [53, 55, 59, 65] },   // G7
    ];
    // o tema (vibrafone): [semicolcheia, nota, duração em semicolcheias], um compasso por acorde
    const TEMA = [
      [[0, 76, 2], [3, 79, 2], [6, 83, 2], [8, 81, 2], [10, 79, 4]],
      [[0, 79, 2], [2, 76, 2], [6, 73, 2], [8, 76, 6]],
      [[0, 77, 2], [3, 81, 2], [6, 84, 2], [8, 83, 2], [10, 81, 4]],
      [[0, 79, 2], [2, 77, 2], [4, 74, 3], [8, 71, 2], [11, 74, 4]],
      [[0, 76, 2], [3, 79, 2], [6, 83, 2], [10, 86, 4]],
      [[0, 85, 3], [4, 81, 2], [8, 79, 2], [10, 76, 4]],
      [[0, 77, 2], [2, 81, 2], [6, 86, 2], [8, 83, 2], [10, 79, 2], [12, 77, 2]],
      [[0, 76, 6], [8, 72, 4], [12, 79, 2]],
    ];
    const CLAVE = [0, 3, 6, 10, 12];                                    // clave de bossa (rim click)
    function nota(c, m, t, dur, vol, tipo, corte, ataque) {
      const o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter();
      o.type = tipo; o.frequency.value = hz(m); f.type = 'lowpass'; f.frequency.value = corte || 3000;
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + (ataque || 0.008)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(f); f.connect(g); g.connect(bus); o.start(t); o.stop(t + dur + 0.05);
    }
    function chiado(c, t, dur, vol, freq) {
      if (!ruido || ruido.sampleRate !== c.sampleRate) { ruido = c.createBuffer(1, c.sampleRate, c.sampleRate); const d = ruido.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
      const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s.buffer = ruido; f.type = 'highpass'; f.frequency.value = freq;
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(f); f.connect(g); g.connect(bus); s.start(t, Math.random() * 0.5, dur + 0.02);
    }
    function compasso(c, t0, n) {
      const A = ACORDES[n % 8], prox = ACORDES[(n + 1) % 8], parte = Math.floor(n / 8) % 2;
      // baixo de bossa: raiz no 1, quinta no "e" do 2, raiz no 3, quinta no "e" do 4 (e uma aproximação cromática no fim)
      for (const [s, m, d] of [[0, A.r, 5], [6, A.r + 7, 2], [8, A.r, 5], [14, prox.r + (prox.r > A.r ? -1 : 1), 2]]) nota(c, m, t0 + s * S16, d * S16 * 1.1, 0.28, 'triangle', 600);
      // piano elétrico: acordes sincopados (seno + triângulo uma oitava acima, bem baixinho)
      for (const s of [0, 3, 6, 10, 13]) for (const m of A.n) { nota(c, m, t0 + s * S16, S16 * 2.4, 0.032, 'sine', 2600); nota(c, m + 12, t0 + s * S16, S16 * 1.6, 0.009, 'triangle', 2200); }
      // vibrafone com o tema (na 2ª passada, uma oitava abaixo com uns enfeites)
      for (const [s, m, d] of TEMA[n % 8]) {
        const mm = parte ? m - 12 : m;
        nota(c, mm, t0 + s * S16, d * S16 * 1.6, 0.06, 'sine', 4000, 0.004); nota(c, mm + 12, t0 + s * S16, d * S16 * 0.6, 0.012, 'sine', 5000, 0.002);
        if (parte && s % 4 === 2) nota(c, mm + 7, t0 + (s + 1) * S16, S16 * 1.2, 0.02, 'sine', 4000);
      }
      // percussão: chocalho (semicolcheias, acentuado), aro na clave, bumbo leve no 1 e no 3
      for (let i = 0; i < 16; i++) chiado(c, t0 + i * S16, 0.05, i % 4 === 2 ? 0.05 : 0.025, 7000);
      for (const s of CLAVE) { const t = t0 + s * S16 + (n % 2 ? 0 : 0); chiado(c, t, 0.035, 0.07, 2200); }
      for (const s of [0, 8]) { const o = c.createOscillator(), g = c.createGain(); o.frequency.setValueAtTime(110, t0 + s * S16); o.frequency.exponentialRampToValueAtTime(45, t0 + s * S16 + 0.12); g.gain.setValueAtTime(0.22, t0 + s * S16); g.gain.exponentialRampToValueAtTime(0.0001, t0 + s * S16 + 0.18); o.connect(g); g.connect(bus); o.start(t0 + s * S16); o.stop(t0 + s * S16 + 0.2); }
      return B * 4;
    }
    function laco() { const A = audioCafe(); if (!A || !bus) return; const c = A.ctx; if (prox < c.currentTime) prox = c.currentTime + 0.05; while (prox < c.currentTime + 1.0) prox += compasso(c, prox, comp++); }
    return {
      tocar() {
        const A = typeof Som !== 'undefined' ? Som.audio : null; if (!A || bus) return;
        try { if (typeof Musica !== 'undefined' && Musica.tocando) Musica.parar(); } catch (e) { /* nada */ }
        const c = A.ctx; if (c.state === 'suspended') c.resume();
        bus = c.createGain(); bus.gain.value = 0; bus.connect(A.mestre); bus.gain.linearRampToValueAtTime(0.75, c.currentTime + 1.2);
        comp = 0; prox = c.currentTime + 0.15; laco(); timer = setInterval(laco, 200);
      },
      parar() {
        if (!bus) return; clearInterval(timer); const b = bus; bus = null;
        try { const c = b.context; b.gain.cancelScheduledValues(c.currentTime); b.gain.setValueAtTime(b.gain.value, c.currentTime); b.gain.linearRampToValueAtTime(0, c.currentTime + 1.2); } catch (e) { /* nada */ }
        setTimeout(() => { try { b.disconnect(); } catch (e) { /* nada */ } }, 2000);
      },
      get tocando() { return !!bus; },
    };
  })();
  // (5.1.0) a conversa no caixa: três jeitos de ela reconhecer o jogador (ou não), e depois a oferta do turno
  async function falarComLucia() {
    const d = S.dados, L = S.lucia, J = S.jog;
    if (L) L.yawAlvo = Math.atan2(-(J.z - L.z), J.x - L.x);
    if (empregoEscolhido() !== 'cafeteria') { await fala('lucia', T('Oi! Seja bem-vindo à cafeteria. Posso te ajudar com alguma coisa?')); Dialogo.esconder(); return; }
    if (!d.luciaApresentou) {
      const { mariposa, falou } = fase1Lucia();
      if (mariposa) {
        await fala('lucia', Tf('Espera... {0}?! Não acredito que é você!', nomeJog()));
        await fala('lucia', T('A quanto tempo você mora aqui?'));
        await fala('jog', T('Acabei de me mudar para a cidade.'));
        await fala('lucia', T('Que ótimo, vamos trabalhar juntos então! Quer dizer... vai ser bom ter companhia aqui, isso sim.'));
        const r = await Escolha.mostrar(T('Que ótimo, vamos trabalhar juntos então! Quer dizer... vai ser bom ter companhia aqui, isso sim.'), [T('Eu também fico feliz de ver você'), T('Como funciona o trabalho?')], { centro: true });   // (5.1.0) caixa da cafeteria: igual ao balcão do Valdemar, menu no meio da tela
        if (r === 0) { await fala('lucia', T('A-ah... é... deixa eu te explicar como funciona por aqui.')); }
        else await fala('lucia', T('Deixa eu te explicar como funciona por aqui.'));
      } else if (falou) {
        const r0 = await Escolha.mostrar(T('Ei, você não estudou lá na escola comigo? A gente se conhece. Você lembra de mim?'), [T('Sim, me lembro'), T('Não, não lembro')], { centro: true });
        await fala('lucia', r0 === 0 ? T('Que bom te ver de novo! Deixa eu te explicar como funciona o trabalho aqui.') : T('Ah... tudo bem, faz tempo mesmo. Deixa eu te explicar como funciona o trabalho aqui.'));
      } else {
        await fala('lucia', T('Você me parece familiar, mas não sei de onde... Enfim, deixa eu te explicar como funciona o trabalho aqui.'));
      }
      await fala('lucia', T('O expediente é das 8h às 16h. Os clientes sentam e mostram o que querem: vá até a mesa, anote o pedido e prepare na bancada, juntando dois cafés iguais para subir de nível. Depois é só levar até o cliente!'));
      await fala('lucia', Tf('Você ganha {0} fakes pelo dia e mais {1} por pedido atendido.', PAGA_BASE, PAGA_PEDIDO));   // (5.1.1)
      d.luciaApresentou = true; gravar('chegada');
    }
    Dialogo.esconder();
    if (S.turno) { await fala('lucia', T('Bom trabalho! Anote os pedidos nas mesas e prepare na bancada.')); Dialogo.esconder(); return; }
    if (d.hora >= H_CAFE_FECHA && d.hora < H_LUCIA_SAI) { await fala('lucia', T('Agora eu preciso fechar o caixa... Só saio daqui mais tarde. Até amanhã!')); Dialogo.esconder(); return; }   // (5.3.0)
    if (fimDeSemana() && empregoEscolhido() === 'cafeteria' && d.luciaApresentou) { await fala('lucia', T('Hoje é fim de semana, você não trabalha! Aproveita e descansa. Até segunda!')); Dialogo.esconder(); return; }   // (5.3.0) sábado e domingo: sem turno
    if ((d.dia || 1) < 2) { await fala('lucia', T('Você só começa a trabalhar a partir de amanhã. Pode voltar aqui!')); Dialogo.esconder(); return; }
    if (d.trabalhouHoje) { await fala('lucia', T('Já fechamos o seu turno de hoje. Até amanhã!')); Dialogo.esconder(); return; }
    if (d.hora < H_TRAB_INI || d.hora >= H_TRAB_FIM) { await fala('lucia', T('O expediente é das 8h às 16h. Volta nesse horário!')); Dialogo.esconder(); return; }
    if (d.precisaBanho) { await fala('lucia', T('Nossa... você tá com cheiro de quem acabou de jogar bola! Passa em casa, toma um banho e depois volta, tá?')); Dialogo.esconder(); return; }   // (5.3.0) sem banho, não trabalha
    const r = await Escolha.mostrar(T('Quer começar o seu turno agora?'), [T('Sim, vamos trabalhar'), T('Ainda não')], { centro: true });
    Dialogo.esconder();
    if (r !== 0) return;
    await fala('lucia', T('Boa! Vou abrir as portas. Os clientes já vão chegar.')); Dialogo.esconder();
    iniciarTurno();
  }
  // (4.9.5) ícones pixel art (16x16, contorno automático) de cada produto + a janelinha do cardápio
  function iconePx(id) {
    const N = 16, g = Array.from({ length: N }, () => Array(N).fill(null));
    const px = (x, y, c) => { if (x >= 0 && x < N && y >= 0 && y < N) g[y][x] = c; };
    const rc = (x, y, w, h, c) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) px(x + i, y + j, c); };
    const PAO = '#e0a040', PAO2 = '#c88a2c', PAO3 = '#a8701c', GER = '#fff0c8';
    const topo = (x, y, w) => { rc(x + 2, y, w - 4, 1, PAO); rc(x + 1, y + 1, w - 2, 1, PAO); rc(x, y + 2, w, 1, PAO2); px(x + 3, y + 1, GER); px(x + (w >> 1), y, GER); px(x + w - 4, y + 1, GER); };
    const camada = (x, y, w, c, onda) => { rc(x, y, w, 1, c); if (onda) for (let i = 0; i < w; i += 2) px(x + i, y + 1, c); };
    const base = (x, y, w) => { rc(x, y, w, 1, PAO2); rc(x + 1, y + 1, w - 2, 1, PAO3); };
    const hamb = (x, w, camadas, yFim) => {                       // monta de baixo para cima, terminando em yFim
      let y = yFim - 2; base(x, y, w);
      for (let k = camadas.length - 1; k >= 0; k--) { const [c, h, onda] = camadas[k]; y -= h + (onda ? 1 : 0); for (let j = 0; j < h; j++) camada(x, y + j, w, c, false); if (onda) camada(x, y + h, w, c, true); }
      topo(x, y - 3, w);
    };
    const MEAT = '#6b3a1e', QJ = '#f2c230', ALF = '#5fae5a', TOM = '#d8402f', OVO = '#fff7e0';
    if (id === 'podrao') { hamb(1, 14, [[ALF, 1, true], [QJ, 1], [MEAT, 2], [OVO, 1], [MEAT, 1]], 14); px(5, 9, QJ); px(6, 9, QJ); }
    else if (id === 'quasetudo') { hamb(1, 14, [[ALF, 1, true], [TOM, 1], [QJ, 1], [MEAT, 1], ['#e89a9a', 1], [OVO, 1], [MEAT, 1], [QJ, 1]], 15); }
    else if (id === 'semsalada') {
      hamb(0, 10, [[QJ, 1], [MEAT, 2]], 14);
      rc(11, 6, 4, 8, '#f4f4f0'); rc(11, 9, 4, 2, TOM); rc(10, 5, 6, 1, '#c8352b'); rc(13, 2, 1, 3, TOM); rc(12, 2, 1, 1, TOM);
    } else {
      const pequeno = id === 'meiofrio';
      const x0 = pequeno ? 4 : 1, w = pequeno ? 8 : 14, yB = pequeno ? 10 : 9, yS = pequeno ? 8 : 6;
      rc(x0, yB, w, 3, PAO); rc(x0 + 1, yB + 3, w - 2, 1, PAO3); rc(x0, yB + 2, w, 1, PAO2);                  // pão
      rc(x0 - 1, yS + 1, w + 2, 3, '#c0623a'); rc(x0, yS + 1, w, 1, '#d98a5a');                               // salsicha
      for (let i = 0; i < w; i += 2) { px(x0 + i, yS + 1, QJ); px(x0 + i + 1, yS + 2, TOM); }                // mostarda e ketchup
      if (!pequeno) { for (const [a, b] of [[3, 4], [6, 3], [9, 4], [12, 3], [5, 5], [10, 5]]) px(a, b + 0, '#f0d070'); px(7, 5, ALF); px(11, 5, ALF); px(2, 5, ALF); }   // batata palha e cheiro-verde
    }
    const k = '#2a1206', out = g.map((r) => r.slice());
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (!g[y][x]) { for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const yy = y + dy, xx = x + dx; if (yy >= 0 && yy < N && xx >= 0 && xx < N && g[yy][xx]) { out[y][x] = k; break; } } }
    const cv = document.createElement('canvas'); cv.width = cv.height = N; const cx = cv.getContext('2d');
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (out[y][x]) { cx.fillStyle = out[y][x]; cx.fillRect(x, y, 1, 1); }
    cv.style.cssText = 'width:64px;height:64px;image-rendering:pixelated;display:block;margin:0 auto;';
    return cv;
  }
  function cardapio(fakes) {
    return new Promise((res) => {
      const el = document.createElement('div'); el.id = 'cdCardapio';
      el.style.cssText = 'position:fixed;inset:0;z-index:22;display:grid;place-items:center;background:rgba(6,4,2,.6);padding:10px;box-sizing:border-box;';
      const card = document.createElement('div');
      card.style.cssText = 'width:min(560px,100%);max-height:96%;overflow:auto;background:#2a1206;border:4px solid #f0a020;color:#fff0c8;padding:10px 12px;box-sizing:border-box;display:flex;flex-direction:column;gap:8px;font-family:var(--font-body);';
      const h = document.createElement('div'); h.style.cssText = 'font:700 15px/1.2 var(--font-display);letter-spacing:.1em;text-transform:uppercase;color:#f0a020;display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;';
      const h1 = document.createElement('span'); h1.textContent = T('Cardápio do seu Valdemar'); const h2 = document.createElement('span'); h2.style.color = '#fff0c8'; h2.textContent = fakes + ' ' + T('fakes'); h.append(h1, h2);
      const grade = document.createElement('div'); grade.className = 'cdGrade';   // (5.0.0) uma linha só, desliza na horizontal (não quebra o layout)
      grade.style.cssText = 'display:flex;flex-wrap:nowrap;gap:8px;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;touch-action:pan-x;padding-bottom:6px;';
      if (S.dados.clienteFiel) { const f = document.createElement('div'); f.style.cssText = 'font:700 11px/1.2 var(--font-display);color:#8fe04a;letter-spacing:.06em;'; f.textContent = T('Cliente fiel: −20%'); h.appendChild(f); }
      const fim = (i) => { el.remove(); res(i); };
      CARDAPIO.forEach((c, i) => {
        const b = document.createElement('button'); b.type = 'button';
        const pr = precoDe(c);
        b.style.cssText = 'flex:0 0 124px;scroll-snap-align:start;display:flex;flex-direction:column;gap:4px;align-items:center;padding:8px 4px;background:#3a1c0a;border:3px solid #8a5a2a;color:#fff0c8;cursor:pointer;font:700 12px/1.2 var(--font-display);text-align:center;' + (fakes < pr ? 'opacity:.55;' : '');
        b.appendChild(iconePx(c.id));
        const n = document.createElement('span'); n.textContent = T(c.nome); const p = document.createElement('span'); p.style.color = '#f2c230'; p.textContent = pr + ' ' + T('fakes'); if (pr !== c.preco) { const v = document.createElement('s'); v.style.cssText = 'color:#a88a5a;margin-right:4px;'; v.textContent = c.preco; p.prepend(v); }
        b.append(n, p); b.onclick = () => fim(i); grade.appendChild(b);
      });
      const nada = document.createElement('button'); nada.type = 'button'; nada.className = 'pxBtn'; nada.textContent = T('Nada, obrigado'); nada.style.cssText = 'align-self:center;--p:var(--p2,2px);height:38px;padding:0 14px;font-size:12px;'; nada.onclick = () => fim(-1);
      card.append(h, grade, nada); el.appendChild(card); ($('raizJogo') || document.body).appendChild(el);   // (5.1.1) dentro do #raizJogo (parte visível do iframe do Canva)
      const sombra = () => { const fimX = grade.scrollLeft + grade.clientWidth >= grade.scrollWidth - 4, iniX = grade.scrollLeft <= 4;   // (5.0.0) as bordas somem para mostrar que tem mais produtos para os lados
        const m = 'linear-gradient(90deg,' + (iniX ? '#000 0' : 'transparent 0,#000 14%') + ',' + (fimX ? '#000 100%' : '#000 86%,transparent 100%') + ')'; grade.style.webkitMaskImage = grade.style.maskImage = m; };
      grade.addEventListener('scroll', sombra, { passive: true }); requestAnimationFrame(sombra);
    });
  }
  function somDinheiro() {                                             // "plim-plim" de moeda saindo
    const A = typeof Som !== 'undefined' && Som.audio && !Som.mudo ? Som.audio.ctx : null; if (!A) return;
    try { const t0 = A.currentTime; [[1318, 0], [1760, 0.07], [1318, 0.16]].forEach(([f, dt]) => { const o = A.createOscillator(), g = A.createGain(); o.type = 'square'; o.frequency.value = f; g.gain.setValueAtTime(0.045, t0 + dt); g.gain.exponentialRampToValueAtTime(0.001, t0 + dt + 0.12); o.connect(g); g.connect(A.destination); o.start(t0 + dt); o.stop(t0 + dt + 0.13); }); } catch (e) { /* sem som */ }
  }
  function gastoNaTela(v) {
    const el = document.createElement('div'); el.textContent = '−' + v; el.style.cssText = 'position:fixed;z-index:12;right:max(60px,env(safe-area-inset-right,0px));top:calc(46px + env(safe-area-inset-top,0px));font:700 16px/1 var(--font-display);color:#ff6a5a;text-shadow:0 2px 0 #2a1206;pointer-events:none;transition:transform 1.2s ease,opacity 1.2s ease;';
    UI.hud.parentNode.appendChild(el); requestAnimationFrame(() => { el.style.transform = 'translateY(22px)'; el.style.opacity = '0'; }); setTimeout(() => el.remove(), 1300);
  }

  // ------------------------------------------------------------------ (4.9.3) HOSPITAL: a ficha médica (a saúde só aparece aqui)
  function abrirFicha() {
    S.pausado = true; const F = UI.ficha, d = S.dados;
    F.querySelector('.cdTit').textContent = T('Ficha médica');
    F.querySelector('.cdSub').textContent = T('A enfermeira confere como você está.');
    F.querySelector('.cdBarras').innerHTML = ['saudavel', 'ativo'].map((e) => { const D = ESPECTROS[e], v = Espectros.valor(e); return '<div class="cdEixo"><span>' + T(D.polos[1]) + '</span><span></span><span>' + T(D.polos[0]) + '</span><div class="cdTrilho"><i style="left:' + (50 + v / 2) + '%"></i></div></div>'; }).join('');
    F.querySelector('.cdFrase').textContent = Espectros.frase(['saudavel', 'ativo']);
    const cond = [];
    if (Espectros.condicao('refeicaoPesada')) cond.push(T('Refeição pesada: no próximo jogo você corre menos e recupera o fôlego mais devagar.'));
    if ((d.ruinsNoMes && d.ruinsNoMes.n) > 0) cond.push(Tf('Lanches não saudáveis neste mês: {0}.', d.ruinsNoMes.n));
    if (!cond.length) cond.push(T('Nenhuma observação por enquanto.'));
    F.querySelector('.cdCond').innerHTML = cond.map((c) => '<li></li>').join(''); F.querySelectorAll('.cdCond li').forEach((li, i) => { li.textContent = cond[i]; });
    F.querySelector('.cdFecharF').textContent = T('Fechar');
    F.hidden = false;
  }

  // ------------------------------------------------------------------ interface (joystick, arrastar a câmera, missão recolhível, mapa, pausa, dinheiro, setinha)
  function montarUI() {
    if (UI) return UI;
    const css = document.createElement('style'); css.id = 'cdCss';
    css.textContent = `
#cdPreto { position: fixed; inset: 0; z-index: 20; background: #000; opacity: 1; transition: opacity 0.9s ease; display: grid; place-items: center; color: #fff; text-align: center; }
#cdPreto[hidden] { display: none; }
#cdPreto.claro { opacity: 0; pointer-events: none; }
#cdArrasto { position: fixed; inset: 0; z-index: 8; touch-action: none; cursor: grab; }
#cdArrasto[hidden], #cdCtl[hidden], #cdHud[hidden], #cdEsq[hidden], #cdAviso[hidden], #cdSeta[hidden], #cdMapa[hidden], #cdPausa[hidden], #cdEsq .cdMissao[hidden], #cdEsq .cdMisIco[hidden] { display: none; }
#cdCtl { position: fixed; inset: 0; z-index: 9; pointer-events: none; }
#cdCtl .cdPad { position: absolute; left: max(18px, env(safe-area-inset-left, 0px)); bottom: calc(18px + env(safe-area-inset-bottom, 0px)); width: 112px; height: 112px; border-radius: 50%; pointer-events: auto; touch-action: none;
  background: rgba(21, 13, 6, 0.38); border: 4px solid rgba(255, 240, 200, 0.55); box-sizing: border-box; transition: border-color 0.15s; }
#cdCtl .cdPad.corre { border-color: #f0a020; }
#cdCtl .cdDica { position: absolute; right: max(18px, env(safe-area-inset-right, 0px)); bottom: calc(80px + env(safe-area-inset-bottom, 0px)); max-width: 46vw; text-align: right; font: 700 13px/1.2 var(--font-display); letter-spacing: 0.04em;
  color: #fff0c8; text-shadow: 0 2px 0 #2a1206, 0 0 6px #000; min-height: 16px; }
#cdCtl .cdBtn { position: absolute; right: max(18px, env(safe-area-inset-right, 0px)); bottom: calc(18px + env(safe-area-inset-bottom, 0px)); width: 128px; pointer-events: auto; --p: var(--p3, 3px); height: 52px; font-size: 14px; }
#cdCtl .cdBtn:disabled { opacity: 0.45; }
#cdFicha { position: fixed; inset: 0; z-index: 14; display: grid; place-items: center; background: rgba(6, 4, 2, 0.6); padding: 10px; box-sizing: border-box; }
#cdFicha[hidden] { display: none; }
#cdFicha .cdCard { width: min(460px, 100%); max-height: 96%; overflow: auto; background: #f4f6f8; border: 4px solid #2f6f9a; color: #1c2a36; padding: 12px 14px; box-sizing: border-box; display: flex; flex-direction: column; gap: 8px; --mx-ink: #2a1206; --mx-creme: #fff0c8; }
#cdFicha h3 { margin: 0; font: 700 15px/1.2 var(--font-display); letter-spacing: 0.1em; text-transform: uppercase; color: #c8352b; }
#cdFicha .cdSub, #cdFicha .cdFrase { margin: 0; font: 400 13px/1.35 var(--font-body); }
#cdFicha .cdFrase { font-weight: 700; }
#cdFicha .cdEixo { display: grid; grid-template-columns: 1fr auto 1fr; gap: 6px; align-items: center; font: 700 11px/1.2 var(--font-display); }
#cdFicha .cdEixo span:last-child { text-align: right; }
#cdFicha .cdTrilho { grid-column: 1 / -1; position: relative; height: 12px; background: linear-gradient(90deg, #e8a0a0, #e8e8e0 50%, #a8d8a0); border: 2px solid #1c2a36; }
#cdFicha .cdTrilho i { position: absolute; top: -5px; width: 6px; height: 18px; margin-left: -3px; background: #1c2a36; }
#cdFicha .cdCond { margin: 0; padding-left: 18px; font: 400 12px/1.35 var(--font-body); }
#cdFicha .pxBtn { --p: var(--p2, 2px); height: 38px; padding: 0 14px; font-size: 12px; }
#cdCtl .cdKnob { position: absolute; left: 50%; top: 50%; width: 46px; height: 46px; margin: -23px 0 0 -23px; border-radius: 50%; background: #f0a020; border: 4px solid #2a1206; box-sizing: border-box; }
#cdHud { position: fixed; z-index: 9; right: max(10px, env(safe-area-inset-right, 0px)); top: calc(8px + env(safe-area-inset-top, 0px)); display: flex; gap: 6px; align-items: center; }
#cdHud .cdGrana { display: flex; align-items: center; gap: 8px; height: 34px; box-sizing: border-box; padding: 0 10px 0 6px; background: rgba(42, 18, 6, 0.86); border: 3px solid #f0a020; color: #fff0c8;
  font: 700 15px/1 var(--font-display); letter-spacing: 0.04em; text-shadow: 0 2px 0 #2a1206; font-variant-numeric: tabular-nums; }
#cdHud .cdRel { gap: 6px; padding: 0 8px 0 5px; border-color: #7fb4e0; }
#cdHud .cdClimaIco { display: block; width: 24px; height: 24px; }
#cdHud .cdGrana small { font-size: 11px; color: #f0c060; }
#cdHud .cdNota { position: relative; width: 30px; height: 18px; background: #5fae5a; border: 2px solid #1f4a1c; box-sizing: border-box; }
#cdHud .cdNota::before { content: ''; position: absolute; left: 50%; top: 50%; width: 8px; height: 8px; margin: -4px 0 0 -4px; border-radius: 50%; background: #2f7a2a; border: 1px solid #c9f0a8; box-sizing: border-box; }
#cdHud .cdNota::after { content: ''; position: absolute; inset: 2px; border: 1px dashed rgba(201, 240, 168, 0.7); }
#cdHud .cdGrana.pop { animation: cdPop 0.9s ease; }
@keyframes cdPop { 0% { transform: scale(0.2); opacity: 0; } 55% { transform: scale(1.25); opacity: 1; } 100% { transform: scale(1); } }
.cdQuad { width: 34px; height: 34px; padding: 0; display: grid; place-items: center; background: rgba(42, 18, 6, 0.86); border: 3px solid #f0a020; color: #fff0c8; box-sizing: border-box; cursor: pointer; pointer-events: auto;
  font: 700 14px/1 var(--font-display); text-shadow: 0 2px 0 #2a1206; }
.cdQuad:active { transform: translateY(2px); }
.cdQuad .cdPausaI { display: flex; gap: 4px; } .cdQuad .cdPausaI i { display: block; width: 4px; height: 12px; background: #fff0c8; }
.cdQuad .cdMapaI { position: relative; width: 18px; height: 14px; background: linear-gradient(90deg, #8fd06a 0 33%, #e8d79a 33% 66%, #8fd06a 66%); border: 2px solid #fff0c8; box-sizing: border-box; }
.cdQuad .cdMapaI::after { content: ''; position: absolute; left: 5px; top: 1px; width: 4px; height: 4px; background: #e8452f; border-radius: 50%; }
#cdEsq { position: fixed; z-index: 9; left: max(10px, env(safe-area-inset-left, 0px)); top: calc(8px + env(safe-area-inset-top, 0px)); display: flex; gap: 6px; align-items: flex-start; max-width: min(60vw, 480px); }
#cdEsq .cdMissao { box-sizing: border-box; --p: var(--p2, 2px); padding: 3px 8px; border: solid transparent; border-width: calc(var(--p) * 4); border-image: var(--sp-madeira) 4 fill / calc(var(--p) * 4) stretch; image-rendering: pixelated;
  font: 700 12px/1.25 var(--font-display); letter-spacing: 0.04em; color: #fff0c8; text-shadow: 0 2px 0 #2a1206; cursor: pointer; pointer-events: auto; max-width: min(46vw, 420px); }
#cdEsq .cdMisIco { color: #f2c230; font-size: 18px; }
#cdEsq .cdTurIco { color: #fff0c8; background: #a8202a; border-color: #ffcf5a; font-size: 18px; }   /* (5.4.0) o painel do turno recolhido */
#cdEsq .cdTurIco[hidden] { display: none; }
#cdAviso { position: fixed; z-index: 10; left: 50%; bottom: calc(24% + env(safe-area-inset-bottom, 0px)); transform: translateX(-50%); padding: 6px 14px; font: 700 14px/1.2 var(--font-display); letter-spacing: 0.06em; color: #fff0c8;
  background: rgba(42, 18, 6, 0.86); border: 3px solid #f0a020; pointer-events: none; text-align: center; max-width: 80vw; }
#cdSeta { position: fixed; z-index: 9; left: 50%; bottom: calc(14px + env(safe-area-inset-bottom, 0px)); transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: 2px; pointer-events: none; }
#cdSeta .cdGira { width: 44px; height: 44px; display: grid; place-items: center; transition: transform 0.08s linear; }
#cdSeta .cdPonta { width: 0; height: 0; border-left: 14px solid transparent; border-right: 14px solid transparent; border-bottom: 30px solid #f0a020; filter: drop-shadow(0 2px 0 #2a1206) drop-shadow(0 0 2px #2a1206); }
#cdSeta .cdDist { font: 700 11px/1 var(--font-display); color: #fff0c8; text-shadow: 0 2px 0 #2a1206, 0 0 4px #000; }
#cdMapa, #cdPausa { position: fixed; inset: 0; z-index: 14; display: grid; place-items: center; background: rgba(6, 4, 2, 0.6); padding: 10px; box-sizing: border-box; }
#cdMapa .cdCard, #cdPausa .cdCard { background: #2a1206; border: 4px solid #f0a020; color: #fff0c8; padding: 10px 12px; box-sizing: border-box; display: flex; flex-direction: column; gap: 8px; max-height: 96%; overflow: auto; --mx-ink: #2a1206; --mx-creme: #fff0c8; }
#cdMapa .cdCard { width: min(760px, 100%); }
#cdMapa h3, #cdPausa h3 { margin: 0; font: 700 15px/1.2 var(--font-display); letter-spacing: 0.1em; text-transform: uppercase; color: #f0a020; }
#cdMapa canvas { width: auto; height: auto; max-width: 100%; max-height: calc(100vh - 215px); align-self: center; image-rendering: pixelated; border: 2px solid #f2e6c8; cursor: crosshair; touch-action: pan-x pan-y; display: block; }
#cdMapa p { margin: 0; font: 400 12px/1.3 var(--font-body); color: #e8d8b0; }
#cdMapa .cdLinha { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; justify-content: space-between; }
#cdMapa .cdCores { display: flex; gap: 6px; }
#cdMapa .cdCor { width: 28px; height: 28px; border: 3px solid #2a1206; outline: 2px solid transparent; cursor: pointer; padding: 0; }
#cdMapa .cdCor.on { outline-color: #fff0c8; }
#cdMapa .cdBtns, #cdPausa .cdBtns { display: flex; gap: 8px; flex-wrap: wrap; }
#cdMapa .pxBtn, #cdPausa .pxBtn { --p: var(--p2, 2px); height: 38px; padding: 0 12px; font-size: 12px; }
#cdMapa .pxBtn:disabled { opacity: 0.45; }
#cdPausa .cdCard { width: min(320px, 100%); align-items: stretch; }
body.cdAtivo #dialogo, body.cdAtivo #escolha { z-index: 21; }`;
    document.head.appendChild(css);
    const raiz = $('raizJogo') || document.body, div = (id, html) => { const d = document.createElement('div'); d.id = id; d.hidden = true; if (html) d.innerHTML = html; return d; };
    const preto = div('cdPreto'), arrasto = div('cdArrasto'), aviso = div('cdAviso');
    const ctl = div('cdCtl', '<div class="cdPad"><div class="cdKnob"></div></div><div class="cdDica"></div><button type="button" class="pxBtn pxPrim cdBtn"></button>');
    const ficha = div('cdFicha', '<div class="cdCard"><h3 class="cdTit"></h3><p class="cdSub"></p><div class="cdBarras"></div><p class="cdFrase"></p><ul class="cdCond"></ul><div class="cdBtns"><button type="button" class="pxBtn pxPrim cdFecharF"></button></div></div>');
    const hud = div('cdHud', '<div class="cdGrana cdRel" role="status"><span class="cdClimaIco"></span><b class="cdHora">08:00</b></div><div class="cdGrana" role="status"><span class="cdNota"></span><b class="cdValor">0</b><small class="cdMoeda"></small></div><button type="button" class="cdQuad cdFome" hidden></button><button type="button" class="cdQuad cdPausar"><span class="cdPausaI"><i></i><i></i></span></button>');
    const esq = div('cdEsq', '<div class="cdMissao" role="button" tabindex="0"></div><button type="button" class="cdQuad cdMisIco" hidden>!</button><button type="button" class="cdQuad cdTurIco" hidden>!</button><button type="button" class="cdQuad cdMapaBtn"><span class="cdMapaI"></span></button>');
    const seta = div('cdSeta', '<div class="cdGira"><div class="cdPonta"></div></div><div class="cdDist"></div>');
    const mapa = div('cdMapa', '<div class="cdCard"><h3 class="cdTit"></h3><canvas width="720" height="456"></canvas><p class="cdDica"></p><div class="cdLinha"><div class="cdCores"></div><div class="cdBtns"><button type="button" class="pxBtn cdRemover"></button><button type="button" class="pxBtn pxPrim cdFechar"></button></div></div></div>');
    const pausa = div('cdPausa', '<div class="cdCard"><h3 class="cdTit"></h3><div class="cdBtns" style="flex-direction:column"><button type="button" class="pxBtn pxPrim cdCont"></button><button type="button" class="pxBtn cdMenu"></button></div></div>');
    raiz.append(preto, arrasto, ctl, hud, esq, aviso, seta, mapa, pausa, ficha);
    const q = (el, s) => el.querySelector(s);
    UI = { css, preto, arrasto, ctl, hud, esq, aviso, seta, mapa, pausa, ficha, dica: q(ctl, '.cdDica'), btn: q(ctl, '.cdBtn'), pad: q(ctl, '.cdPad'), knob: q(ctl, '.cdKnob'), grana: q(hud, '.cdGrana:not(.cdRel)'), hora: q(hud, '.cdHora'), climaIco: q(hud, '.cdClimaIco'), valor: q(hud, '.cdValor'), moeda: q(hud, '.cdMoeda'),
      btnPausa: q(hud, '.cdPausar'), fome: q(hud, '.cdFome'), missao: q(esq, '.cdMissao'), misIco: q(esq, '.cdMisIco'), turIco: q(esq, '.cdTurIco'), btnMapa: q(esq, '.cdMapaBtn'), setaGira: q(seta, '.cdGira'), setaPonta: q(seta, '.cdPonta'), setaDist: q(seta, '.cdDist'),
      mapaCv: q(mapa, 'canvas'), cores: q(mapa, '.cdCores'), remover: q(mapa, '.cdRemover'), fechar: q(mapa, '.cdFechar'), cont: q(pausa, '.cdCont'), menu: q(pausa, '.cdMenu') };
    for (const c of CORES_MARCA) { const b = document.createElement('button'); b.type = 'button'; b.className = 'cdCor'; b.dataset.cor = c; b.style.background = c; UI.cores.appendChild(b); }
    // joystick
    const joy = { id: null, x: 0, y: 0 };
    const moveJoy = (e) => {
      const r = UI.pad.getBoundingClientRect(), Rr = r.width / 2;
      let dx = e.clientX - (r.left + Rr), dy = e.clientY - (r.top + Rr); const d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / (Rr * 0.85));
      dx = dx / d * k; dy = dy / d * k; joy.x = dx; joy.y = dy;
      UI.knob.style.transform = 'translate(' + (dx * Rr * 0.55) + 'px,' + (dy * Rr * 0.55) + 'px)';
    };
    UI.pad.addEventListener('pointerdown', (e) => { joy.id = e.pointerId; UI.pad.setPointerCapture(e.pointerId); moveJoy(e); });
    UI.pad.addEventListener('pointermove', (e) => { if (e.pointerId === joy.id) moveJoy(e); });
    const solta = (e) => { if (e.pointerId !== joy.id) return; joy.id = null; joy.x = joy.y = 0; UI.knob.style.transform = ''; };
    UI.pad.addEventListener('pointerup', solta); UI.pad.addEventListener('pointercancel', solta);
    // arrastar em qualquer outro lugar da tela gira a câmera
    const arr = { id: null, x: 0 };
    arrasto.addEventListener('pointerdown', (e) => { if (arr.id != null) return; arr.id = e.pointerId; arr.x = e.clientX; arrasto.setPointerCapture(e.pointerId); });
    arrasto.addEventListener('pointermove', (e) => { if (e.pointerId !== arr.id || !S) return; S.cam.yaw -= (e.clientX - arr.x) * 0.0075; arr.x = e.clientX; });
    const soltaArr = (e) => { if (e.pointerId === arr.id) arr.id = null; };
    arrasto.addEventListener('pointerup', soltaArr); arrasto.addEventListener('pointercancel', soltaArr);
    arrasto.addEventListener('wheel', (e) => { if (!S) return; e.preventDefault(); S.cam.dist = Math.max(5, Math.min(16, S.cam.dist + Math.sign(e.deltaY) * 0.8)); }, { passive: false });
    // (5.1.0) ao girar a tela (ou qualquer resize) com o dedo em cima do direcional ou do arrasto da câmera, o toque pode não soltar
    // de verdade (o layout muda debaixo do dedo); sem isto o personagem ficava "andando sozinho" na direção em que o joystick travou.
    const soltarTudo = () => { joy.id = null; joy.x = joy.y = 0; UI.knob.style.transform = ''; arr.id = null; };
    window.addEventListener('resize', soltarTudo); window.addEventListener('orientationchange', soltarTudo);
    UI.joy = joy; UI.teclas = {};
    window.addEventListener('keydown', (e) => {
      if (!S || !S.ativo) return; UI.teclas[e.code] = true;
      if (/^(Arrow|Key[WASDQE])/.test(e.code) && S.modo === 'livre') e.preventDefault();
      if (e.repeat || S.modo !== 'livre') return;
      if (e.code === 'Escape' || e.code === 'KeyP') { if (!UI.mapa.hidden) fecharMapa(); else alternarPausa(); }
      if (e.code === 'KeyM') { if (UI.mapa.hidden) abrirMapa(); else fecharMapa(); }
      if ((e.code === 'Enter' || e.code === 'Space' || e.code === 'KeyF') && UI.mapa.hidden && UI.pausa.hidden) { e.preventDefault(); interagir(); }
    });
    window.addEventListener('keyup', (e) => { UI.teclas[e.code] = false; });
    // missão: aparece inteira por 5 s e recolhe num quadradinho; tocar no quadradinho mostra de novo
    UI.missao.addEventListener('click', () => recolherMissao());
    UI.misIco.addEventListener('click', () => { som(); mostrarMissao(); });
    UI.btnMapa.addEventListener('click', abrirMapa);
    UI.fechar.addEventListener('click', fecharMapa);
    UI.remover.addEventListener('click', () => { som(); definirMarca(null); atualizarCoresMapa(); desenharMapa(); });
    UI.cores.addEventListener('click', (e) => { const b = e.target.closest('.cdCor'); if (!b || !S) return; som(); S.dados.corMarca = b.dataset.cor; if (S.marca) definirMarca(S.marca.x, S.marca.z); atualizarCoresMapa(); desenharMapa(); });
    UI.mapaCv.addEventListener('click', (e) => {                       // (4.9.3) clique/toque solto marca; arrastar o dedo rola o mapa (antes todo toque marcava)
      if (!S) return; const r = UI.mapaCv.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * 240 - 120, z = (e.clientY - r.top) / r.height * 152 - 76;
      som(); definirMarca(clamp(x, LIM.x0 + 2, LIM.x1 - 2), clamp(z, LIM.z0 + 2, LIM.z1 - 2)); atualizarCoresMapa(); desenharMapa();
    });
    UI.btnPausa.addEventListener('click', () => { if (S && S.modo === 'livre') alternarPausa(); });
    UI.fome.appendChild(iconeCoxinha()); UI.fome.setAttribute('aria-label', T('Fome'));
    UI.fome.addEventListener('click', () => { if (!S) return; som(); UI.aviso.textContent = T('Seu personagem ainda não comeu hoje.'); UI.aviso.hidden = false; clearTimeout(UI.fomeT); UI.fomeT = setTimeout(() => { if (S && UI) UI.aviso.hidden = true; }, 2800); });   // (aqui 'aviso' é o elemento: escrevo direto nele)
    UI.btn.addEventListener('click', () => { if (S && S.ativo && S.modo === 'livre') interagir(); });
    UI.ficha.querySelector('.cdFecharF').addEventListener('click', () => { som(); UI.ficha.hidden = true; if (S) { S.pausado = false; liberar(); } });
    UI.cont.addEventListener('click', () => alternarPausa());
    UI.menu.addEventListener('click', () => { if (!S || !S.ativo) return; som(); UI.pausa.hidden = true; S.modo = 'saindo'; sair(); });
    return UI;
  }
  function alternarPausa() { if (!S) return; som(); const p = UI.pausa.hidden; UI.pausa.hidden = !p; S.pausado = p || !UI.mapa.hidden; }
  let tMissao = null;
  function mostrarMissao() {
    if (!S || !S.missao) return;
    UI.missao.textContent = S.missao; UI.missao.hidden = false; UI.misIco.hidden = true; UI.esq.hidden = false;
    clearTimeout(tMissao); tMissao = setTimeout(recolherMissao, 5000);
  }
  // (5.4.0) o painel do turno (cafeteria e mercado) aparece uma vez no começo e depois vira o ícone "!" vermelho no canto superior
  //   esquerdo; tocar no ícone abre o painel de novo (e ele recolhe sozinho depois de uns segundos).
  let tPainel = 0;
  function painelRecolhivel(p) {
    if (!p || !UI) return;
    p.hidden = false; UI.turIco.hidden = true; UI.esq.hidden = false;
    UI.turIco.onclick = () => { som(); if (p.hidden) painelRecolhivel(p); else recolherPainel(p); };
    clearTimeout(tPainel); tPainel = setTimeout(() => recolherPainel(p), 6000);
  }
  function recolherPainel(p) { clearTimeout(tPainel); if (!UI || !p || !p.isConnected) return; p.hidden = true; UI.turIco.hidden = false; }
  function fimPainel(p) { clearTimeout(tPainel); if (p) p.hidden = true; if (UI) { UI.turIco.hidden = true; UI.turIco.onclick = null; } }
  function recolherMissao() { clearTimeout(tMissao); if (!UI) return; UI.missao.hidden = true; UI.misIco.hidden = !(S && S.missao); }
  const preto = async (ligado, ms) => {
    UI.preto.hidden = false; UI.preto.style.transitionDuration = pulando() ? '0s' : ((ms == null ? 900 : ms) / 1000) + 's'; await esperar(30);
    UI.preto.classList.toggle('claro', !ligado); await esperar(ms == null ? 900 : ms); if (!ligado) UI.preto.hidden = true;
  };
  const aviso = (txt) => { if (!txt) { UI.aviso.hidden = true; return; } UI.aviso.textContent = txt; UI.aviso.hidden = false; };
  function textos() {
    UI.moeda.textContent = T('fakes'); UI.grana.setAttribute('aria-label', T('Dinheiro'));
    UI.btnPausa.setAttribute('aria-label', T('Pausar')); UI.btnMapa.setAttribute('aria-label', T('Mapa')); UI.misIco.setAttribute('aria-label', T('Missão'));
    UI.mapa.querySelector('.cdTit').textContent = T('Mapa'); UI.mapa.querySelector('.cdDica').textContent = T('Toque no mapa para marcar um destino. A cor escolhida aparece embaixo de você e a setinha mostra o caminho.');
    UI.remover.textContent = T('Remover marca'); UI.fechar.textContent = T('Fechar');
    UI.pausa.querySelector('.cdTit').textContent = T('Pausado'); UI.cont.textContent = T('Continuar'); UI.menu.textContent = T('Voltar ao menu');
  }
  function mostrarDinheiro(pop) {
    UI.valor.textContent = String(S.dados.fakes);
    UI.hud.hidden = false; if (pop) { UI.grana.classList.remove('pop'); void UI.grana.offsetWidth; UI.grana.classList.add('pop'); }
  }
  function liberar() { S.modo = 'livre'; UI.ctl.hidden = false; UI.arrasto.hidden = false; UI.esq.hidden = false; }
  async function sair() { UI.ctl.hidden = true; UI.arrasto.hidden = true; UI.mapa.hidden = true; UI.seta.hidden = true; aviso(''); gravar(S.dados.ponto || 'chegada'); await preto(true, 700); if (S && S.fimRes) S.fimRes(); }

  // ------------------------------------------------------------------ save
  function gravarSlot(d) {
    const F = window.FutebolJS; if (!F || !F.salvarJogo || !F.listarSaves) return;
    const lista = F.listarSaves(); let slot = (F.slotHistoria && F.slotHistoria()) || (lista.findIndex((s) => s && s.autosave) + 1);
    if (!slot) slot = lista.findIndex((s) => !s) + 1;
    if (!slot) { let velho = Infinity; slot = 1; lista.forEach((s, i) => { const t = s && s.data ? Date.parse(s.data) || 0 : 0; if (t < velho) { velho = t; slot = i + 1; } }); }
    const per = JSON.parse(JSON.stringify(PERSONAGEM)); delete per.historia;
    F.salvarJogo(slot, { nome: nomeJog(), resumo: T('Modo história · Cidadezinha'), fase: 'cidade', ponto: d.ponto, autosave: true, historia: API.historia.tudo(), personagem: per, versao: API.versao });
  }
  function gravar(ponto) {
    if (!S) return; const d = S.dados; d.ponto = ponto;
    try { API.historia.gravar('cidade', JSON.parse(JSON.stringify(d))); } catch (e) { console.warn('[Cidade] save da história:', e); }
    try { gravarSlot(d); } catch (e) { console.warn('[Cidade] save do CARREGAR:', e); }
  }

  // ------------------------------------------------------------------ mundo (esconde o resto e devolve tudo na saída)
  function prepararMundo() {
    const M = S.mundo = { luz: { hc: luzCeu.color.getHex(), hg: luzCeu.groundColor.getHex(), hi: luzCeu.intensity, sc: sun.color.getHex(), si: sun.intensity, sp: sun.position.toArray(), part: typeof particulas.tipo === 'function' ? particulas.tipo() : 'seco' }, bg: scene.background, fog: scene.fog ? { c: scene.fog.color.getHex(), n: scene.fog.near, f: scene.fog.far } : null, vis: [], fov: camera.fov };
    scene.background = new THREE.Color(CEU);
    if (scene.fog) { scene.fog.color.setHex(CEU); scene.fog.near = 70; scene.fog.far = 215; }
    for (const c of scene.children) { if (c.isLight) continue; M.vis.push([c, c.visible]); c.visible = false; }
    if (camera.fov !== 55) { camera.fov = 55; camera.updateProjectionMatrix(); }
  }
  function restaurarMundo() {
    const M = S.mundo; if (!M) return;
    if (M.luz) { luzCeu.color.setHex(M.luz.hc); luzCeu.groundColor.setHex(M.luz.hg); luzCeu.intensity = M.luz.hi; sun.color.setHex(M.luz.sc); sun.intensity = M.luz.si; sun.position.fromArray(M.luz.sp); try { if (typeof particulas.intens === 'function') particulas.intens(1); particulas.definir(M.luz.part); } catch (e) { /* ok */ } }
    scene.background = M.bg; if (scene.fog && M.fog) { scene.fog.color.setHex(M.fog.c); scene.fog.near = M.fog.n; scene.fog.far = M.fog.f; }
    for (const [c, v] of M.vis) c.visible = v;
    if (camera.fov !== M.fov) { camera.fov = M.fov; camera.updateProjectionMatrix(); }
  }
  const esconderBola = () => { try { ball.mesh.visible = ball.shadow.visible = false; userRing.visible = false; targetRing.visible = false; dribbleRing.visible = false; aimArrow.visible = false; } catch (e) { /* sem bola */ } };

  // ------------------------------------------------------------------ (4.9.5) RELÓGIO (dia de 15 min), céu, clima, chuva, luz da noite e a reação das pessoas
  const SEG_DIA = 900, H_POR_S = 24 / SEG_DIA, H_DORMIR = 22, H_ACORDAR = 5;   // (5.2.0) acorda às 5h
  const K = (h, ceu, hc, hg, hi, sc, si, sp, ng, lamp) => ({ h, ceu: new THREE.Color(ceu), hc: new THREE.Color(hc), hg: new THREE.Color(hg), hi, sc: new THREE.Color(sc), si, sp, ng, lamp });
  const NOITE_ = [0x0a1424, 0x6f82b4, 0x1a2a18, 0.5, 0x8aa0d8, 0.26, [-25, 45, 15], [45, 150], 1];
  // (5.0.0) luz do dia mais baixa: antes céu 0,97 + sol 0,95 estourava (água branca, mato marrom à tarde, interiores "de vidro")
  const CHAVES = [K(0, ...NOITE_), K(5.4, ...NOITE_),
    K(6.2, 0xe8a07a, 0xffd8b8, 0x4a4a30, 0.5, 0xffb070, 0.42, [-70, 10, 20], [55, 170], 0.8),
    K(7.4, 0xbcd8ec, 0xfff4e6, 0x4a6a35, 0.66, 0xfff2dc, 0.56, [-45, 35, 25], [70, 205], 0),
    K(9, 0x9fd0ef, 0xffffff, 0x4a6a35, 0.72, 0xfff6e8, 0.62, [-25, 55, 25], [70, 215], 0),
    K(14.5, 0x9fd0ef, 0xffffff, 0x4a6a35, 0.72, 0xfff6e8, 0.6, [30, 55, 25], [70, 215], 0),
    K(16.3, 0xe9dca8, 0xfff2d8, 0x4f6a35, 0.68, 0xffe6b8, 0.56, [55, 30, 28], [65, 195], 0),
    K(17.8, 0xf2b070, 0xffe2c0, 0x4a4a30, 0.6, 0xffc88a, 0.5, [65, 16, 30], [60, 180], 0.1),
    K(18.7, 0xc0705a, 0xe8b098, 0x3a3a30, 0.5, 0xff9a60, 0.38, [70, 8, 25], [55, 165], 0.7),
    K(19.5, 0x2c2c4c, 0x8090b8, 0x1a2a18, 0.5, 0x8aa0d8, 0.28, [-25, 45, 15], [48, 150], 1),
    K(20.4, ...NOITE_), K(24, ...NOITE_)];
  const LUZ = { ceu: new THREE.Color(), hc: new THREE.Color(), hg: new THREE.Color(), sc: new THREE.Color(), hi: 0, si: 0, sp: [0, 0, 0], ng: [0, 0], lamp: 0 };
  const _cinza = new THREE.Color(), _tmp = new THREE.Color(), _cOff = new THREE.Color(0x9a9a92), _cOn = new THREE.Color(0xffffff);
  function luzDoDia(h) {
    let a = CHAVES[0], b = CHAVES[1];
    for (let i = 0; i < CHAVES.length - 1; i++) if (h >= CHAVES[i].h && h <= CHAVES[i + 1].h) { a = CHAVES[i]; b = CHAVES[i + 1]; break; }
    const t = b.h === a.h ? 0 : (h - a.h) / (b.h - a.h), L = LUZ;
    L.ceu.copy(a.ceu).lerp(b.ceu, t); L.hc.copy(a.hc).lerp(b.hc, t); L.hg.copy(a.hg).lerp(b.hg, t); L.sc.copy(a.sc).lerp(b.sc, t);
    L.hi = lerp(a.hi, b.hi, t); L.si = lerp(a.si, b.si, t); L.lamp = lerp(a.lamp, b.lamp, t);
    for (let i = 0; i < 3; i++) L.sp[i] = lerp(a.sp[i], b.sp[i], t); for (let i = 0; i < 2; i++) L.ng[i] = lerp(a.ng[i], b.ng[i], t);
    return L;
  }
  const novoClima = () => ({ estado: 'limpo', nuv: 0, chuva: 0, acum: 0, t: 0, dur: 0, flash: 0, trov: 12, molhado: false });
  const fmtHora = (h) => { const m = Math.floor((h * 60 + 0.001) / 10) * 10, hh = Math.floor(m / 60) % 24, mm = m % 60; return (hh < 10 ? '0' : '') + hh + ':' + (mm < 10 ? '0' : '') + mm; };

  // o céu e as luzes: a cada quadro, a partir da hora e do clima (dentro de um lugar fechado a luz é fixa)
  function atualizarCeu() {
    const d = S.dados, C = S.clima;
    if (S.dentro) { luzCeu.color.setHex(0xffffff); luzCeu.groundColor.setHex(0x4a6a35); luzCeu.intensity = 0.72; sun.color.setHex(0xfff6ea); sun.intensity = 0.42; sun.position.set(20, 60, 25); if (typeof particulas.intens === 'function') particulas.intens(0); return; }
    const R = luzDoDia(d.hora), nuv = C.nuv;
    _tmp.copy(R.ceu); if (nuv > 0.001) { const g = (R.ceu.r + R.ceu.g + R.ceu.b) / 3 * 0.72; _cinza.setRGB(g * 0.97, g, g * 1.04); _tmp.lerp(_cinza, 0.8 * nuv); }
    if (!scene.background || !scene.background.isColor) scene.background = new THREE.Color();
    scene.background.copy(_tmp); if (scene.fog) { scene.fog.color.copy(_tmp); scene.fog.near = R.ng[0] * (1 - 0.25 * nuv); scene.fog.far = R.ng[1] * (1 - 0.25 * nuv); }
    luzCeu.color.copy(R.hc); luzCeu.groundColor.copy(R.hg); luzCeu.intensity = R.hi * (1 - 0.38 * nuv) + C.flash * 1.4;
    sun.color.copy(R.sc); sun.intensity = R.si * (1 - 0.7 * nuv) + C.flash * 0.6; sun.position.set(R.sp[0], R.sp[1], R.sp[2]);
    const on = Math.max(R.lamp, nuv * 0.4);                            // os postes acendem de noite (e um pouco quando o dia escurece com a chuva)
    if (S.lampMat) S.lampMat.color.copy(_cOff).lerp(_cOn, on);
    if (S.luzes) { S.luzes.matP.opacity = on * 0.62; S.luzes.matH.opacity = on * 0.9; S.luzes.pools.visible = S.luzes.matP.opacity > 0.01;
      const hv = S.luzes.matH.opacity > 0.01; if (hv !== S.luzes.hv) { S.luzes.hv = hv; for (const h of S.luzes.halos) h.visible = hv; } }   // (5.0.1) de dia os brilhos nem são desenhados
    // (5.0.1) janelas acesas e faróis: só pela hora (a luz da rua também acende um pouco na chuva, as casas não)
    const noite = R.lamp;
    if (S.matJanela) S.matJanela.emissive.setRGB(noite * 0.95, noite * 0.74, noite * 0.38);
    if (S.matFarol) { const f = 0.78 + 0.22 * Math.max(noite, nuv * 0.6); S.matFarol.color.setRGB(f, f, f); }
    if (S.matFarolChao) { const fo = Math.max(noite, nuv * 0.5) * 0.5; S.matFarolChao.opacity = fo; const fv = fo > 0.01; if (fv !== S.farolLigado) { S.farolLigado = fv; for (const c of S.carros || []) if (c.chao) c.chao.visible = fv; } }
    if (S.letreiros) for (const m of S.letreiros) m.emissive.setRGB(on * 0.85, on * 0.85, on * 0.85);
    if (typeof particulas.intens === 'function') particulas.intens(C.chuva);
  }
  function montarLuzes() {
    const L = S.lampadas || []; if (!L.length) return;
    const tex = guardar(texBrilho()), g = S.grupo;
    const geoP = guardar(new THREE.PlaneGeometry(1, 1)); geoP.rotateX(-Math.PI / 2);
    const matP = guardar(new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }));
    const pools = new THREE.InstancedMesh(geoP, matP, L.length), m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
    L.forEach((l, i) => { m4.compose(new THREE.Vector3(l.px, 0.16, l.pz), q, new THREE.Vector3(l.r * 2, 1, l.r * 2)); pools.setMatrixAt(i, m4); });
    pools.frustumCulled = false; pools.renderOrder = 2; g.add(pools);
    const matH = guardar(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    const halos = []; for (const l of L) { const s = new THREE.Sprite(matH); s.position.set(l.x, l.y, l.z); s.scale.set(2.8, 2.8, 1); s.renderOrder = 3; s.visible = false; g.add(s); halos.push(s); }
    S.luzes = { matP, matH, pools, halos, hv: false };
  }

  // ---- som da chuva (ruído filtrado) e do trovão
  const SomChuva = {
    no: null, g: null,
    audio() { return typeof Som !== 'undefined' && Som.audio && !Som.mudo ? Som.audio.ctx : null; },
    ruido(A, seg) { const n = Math.floor(A.sampleRate * seg), b = A.createBuffer(1, n, A.sampleRate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; return b; },
    nivel(v) {
      const A = this.audio(); if (!A) return;
      try {
        if (!this.no && v > 0.01) { const s = A.createBufferSource(); s.buffer = this.ruido(A, 2); s.loop = true; const f = A.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1500; f.Q.value = 0.35; const g = A.createGain(); g.gain.value = 0; s.connect(f); f.connect(g); g.connect(A.destination); s.start(); this.no = s; this.g = g; }
        if (this.g) this.g.gain.setTargetAtTime(v * 0.1, A.currentTime, 0.4);
        if (this.no && v <= 0.01) { const s = this.no; this.no = null; this.g = null; setTimeout(() => { try { s.stop(); } catch (e) { /* já parou */ } }, 900); }
      } catch (e) { /* sem som */ }
    },
    trovao() {
      const A = this.audio(); if (!A) return;
      try { const s = A.createBufferSource(); s.buffer = this.ruido(A, 2.4); const f = A.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 220; const g = A.createGain(), t0 = A.currentTime; g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.5, t0 + 0.15); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 2.3); s.connect(f); f.connect(g); g.connect(A.destination); s.start(); } catch (e) { /* sem som */ }
    },
  };

  // ---- o clima: a cada 1 min de tempo real, 2% de chance de começar a chover; a duração (2 a 10 min) é sorteada uma vez
  function tickClima(dt) {
    const C = S.clima;
    C.acum += dt;
    if (C.acum >= 60) {
      C.acum -= 60;
      if (C.estado !== 'chuva' && Math.random() < 0.02) { C.estado = 'chuva'; C.t = 0; C.dur = (2 + Math.random() * 8) * 60; }
      else if (C.estado === 'limpo' && Math.random() < 0.15) { C.estado = 'nublado'; C.t = 0; C.dur = 60 + Math.random() * 120; }
    }
    if (C.estado !== 'limpo') { C.t += dt; if (C.t >= C.dur) C.estado = 'limpo'; }
    const nuvAlvo = C.estado === 'chuva' ? 0.95 : C.estado === 'nublado' ? 0.55 : 0, chuvaAlvo = C.estado === 'chuva' ? 1 : 0;
    C.nuv += clamp(nuvAlvo - C.nuv, -dt / 20, dt / 8); C.chuva += clamp(chuvaAlvo - C.chuva, -dt / 8, dt / 4);
    if (C.chuva > 0.01 && typeof particulas.intens === 'function') particulas.definir('chuva');
    if (!C.molhado && C.chuva > 0.08) { C.molhado = true; chuvaComecou(); }
    if (C.molhado && C.chuva <= 0.02 && C.estado !== 'chuva') { C.molhado = false; chuvaTerminou(); particulas.definir('seco'); }
    SomChuva.nivel(S.dentro ? C.chuva * 0.35 : C.chuva);
    C.flash = Math.max(0, C.flash - dt * 2.2);
    if (C.estado === 'chuva' && C.chuva > 0.9) { C.trov -= dt; if (C.trov <= 0) { C.trov = 20 + Math.random() * 40; C.flash = 1; setTimeout(() => { if (S && S.ativo) SomChuva.trovao(); }, 500 + Math.random() * 1800); } }
  }

  // ---- as horas (1 dia = 15 min; o relógio mostra de 10 em 10 minutos), o aviso das 21h e a virada do dia às 6h
  function tickHorario(dt) {
    const d = S.dados, ant = d.hora;
    d.hora += dt * H_POR_S; if (d.hora >= 24) d.hora -= 24;
    if (ant < H_ACORDAR && d.hora >= H_ACORDAR) novoDia();
    if (ant < 2 && d.hora >= 2 && !S.madrugada) { S.madrugada = true; madrugada(); return; }     // (5.0.0) passou das 2h acordado
    if (!d.avisouDormir && d.hora >= 21 && d.hora < 24 && S.modo === 'livre' && !S.dentro) { d.avisouDormir = true; avisoDormir(); }
  }
  function novoDia() { const d = S.dados; d.dia = (d.dia || 1) + 1; prepararDia(d); setTimeout(() => { if (S && S.ativo) agendarHoje(); }, 3800); aviso(Tf('Amanheceu: dia {0}.', d.dia)); setTimeout(() => { if (S && UI && !UI.aviso.hidden) aviso(''); }, 3500); }
  // (5.0.0) 2h: ele se assusta, sai correndo para o prédio (a câmera fica parada) e o jogo corta para ele acordando no dia seguinte
  async function madrugada() {
    S.modo = 'cena'; UI.ctl.hidden = true; aviso(''); const J = S.jog;
    J.andando = false; J.correndo = false;             // (5.1.0) a cutscene das 2h cortava mesmo se ele estivesse correndo na hora
    if (J.sentado) levantar();
    try { await fala('jog', T('Meu Deus, é 2h00?! O que eu tô fazendo acordado ainda??')); Dialogo.esconder(); } catch (e) { console.error(e); }
    if (!S.dentro) {
      S.camParada = true;
      const pts = caminhoRede(J.x, J.z, SPAWN.x, -4.2).map((q) => [q.x, q.z]); pts.push([SPAWN.x, -5.5]);
      await Promise.race([andar(J, pts, 5.2), esperar(2600)]);
    }
    await preto(true, 900);
    const d = S.dados; d.dia = (d.dia || 1) + 1; d.hora = H_ACORDAR; d.avisouDormir = false; prepararDia(d);
    try { Sono.registrar(3, 'acordado até as 2h'); } catch (e) { console.warn('[Cidade] sono:', e); }
    gravar('predio'); S.paraFase2 = 'acordar';
    if (S.fimRes) S.fimRes();
  }
  async function avisoDormir() {
    S.modo = 'cena'; UI.ctl.hidden = true; aviso(''); S.jog.andando = false; S.jog.correndo = false;
    try { await fala('jog', T('É melhor eu voltar para casa, tenho que dormir às 22h para ter minhas 8 horas de sono, ou isso pode afetar meu desempenho.')); Dialogo.esconder(); } catch (e) { console.error(e); }
    if (S && S.ativo && S.modo === 'cena') liberar();
  }
  let relUlt = '', relIco = '';
  const DIAS_SEM = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];             // (5.0.0) o dia 1 é uma segunda-feira
  const diaSemana = () => ((((S.dados.dia || 1) - 1) % 7) + 7) % 7;
  function atualizarRelogioUI() {
    const d = S.dados, C = S.clima, t = T(DIAS_SEM[diaSemana()]) + (diaDeFutebol() ? ' ⚽' : '') + ' ' + fmtHora(d.hora); if (t !== relUlt) { relUlt = t; UI.hora.textContent = t; }   // (5.3.0) ⚽ = dia de futebol
    const noite = d.hora < 6.2 || d.hora >= 19.5, ic = C.chuva > 0.3 ? 'chuva' : C.nuv > 0.35 ? 'nuvem' : noite ? 'lua' : 'sol';
    if (ic !== relIco) { relIco = ic; const cv = iconeClima(ic); UI.climaIco.replaceChildren(cv); }
    const semComer = d.comeuDia !== (d.dia || 1); if (UI.fome.hidden === semComer) UI.fome.hidden = !semComer;   // (5.2.0) a coxinha fica até ele comer no dia
  }
  // (5.2.0) coxinha de frango em pixel art 16x16 (o ícone de "ainda não comeu hoje")
  function iconeCoxinha() {
    const N = 16, g = Array.from({ length: N }, () => Array(N).fill(null)), p = (x, y, c) => { if (x >= 0 && x < N && y >= 0 && y < N) g[y][x] = c; };
    const L = ['......##........', '.....#AA#.......', '.....#AA#.......', '....#BAAB#......', '...#BBAABB#.....', '...#BBBAABB#....', '..#BBBBBAABB#...', '..#BBBBBBBBB#...', '.#CBBBBBBBBBC#..', '.#CBBBBDBBBBC#..', '.#CCBBBBBBDCC#..', '.#CCCBBBBBCCC#..', '..#CCCCCCCCC#...', '...##CCCCC##....', '.....#####......', '................'];
    const COR = { '#': '#3a1806', A: '#f2c98a', B: '#d98a2e', C: '#a85a1a', D: '#f6d36a' };
    L.forEach((r, y) => [...r].forEach((ch, x) => { if (COR[ch]) p(x, y, COR[ch]); }));
    for (const [x, y] of [[6, 6], [9, 8], [5, 9], [10, 10], [7, 11]]) p(x, y, '#f2b860');           // farelinho da casquinha
    const cv = document.createElement('canvas'); cv.width = cv.height = N; const c = cv.getContext('2d');
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (g[y][x]) { c.fillStyle = g[y][x]; c.fillRect(x, y, 1, 1); }
    cv.style.cssText = 'width:24px;height:24px;image-rendering:pixelated;display:block;pointer-events:none;';
    return cv;
  }
  function iconeClima(tipo) {
    const N = 12, g = Array.from({ length: N }, () => Array(N).fill(null));
    const disco = (cx, cy, r, c) => { for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (Math.hypot(x + 0.5 - cx, y + 0.5 - cy) <= r) g[y][x] = c; };
    const px = (x, y, c) => { if (x >= 0 && x < N && y >= 0 && y < N) g[y][x] = c; };
    const nuvem = (dy, c) => { disco(4, 7 + dy, 2.5, c); disco(7, 6 + dy, 3, c); disco(9.5, 8 + dy, 2, c); for (let y = 8 + dy; y <= 9 + dy; y++) for (let x = 3; x <= 10; x++) px(x, y, c); };
    if (tipo === 'sol') { disco(6, 6, 3, '#f2c230'); for (let a = 0; a < 8; a++) px(6 + Math.round(Math.cos(a * Math.PI / 4) * 4.7) - (Math.cos(a * Math.PI / 4) > 0.1 ? 1 : 0), 6 + Math.round(Math.sin(a * Math.PI / 4) * 4.7) - (Math.sin(a * Math.PI / 4) > 0.1 ? 1 : 0), '#f2c230'); }
    else if (tipo === 'lua') { disco(6, 6, 4.2, '#e8e4c8'); disco(8.2, 4.6, 3.4, null); }
    else if (tipo === 'nuvem') nuvem(0, '#dfe3e8');
    else { nuvem(-2, '#9aa4b0'); for (const [x, y] of [[3, 9], [6, 10], [9, 9], [4, 11]]) px(x, y, '#5a9ae8'); }
    const out = g.map((r) => r.slice());
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (!g[y][x]) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const yy = y + dy, xx = x + dx; if (yy >= 0 && yy < N && xx >= 0 && xx < N && g[yy][xx]) { out[y][x] = '#2a1206'; break; } }
    const cv = document.createElement('canvas'); cv.width = cv.height = N; const cx = cv.getContext('2d');
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (out[y][x]) { cx.fillStyle = out[y][x]; cx.fillRect(x, y, 1, 1); }
    cv.style.cssText = 'width:24px;height:24px;image-rendering:pixelated;display:block;';
    return cv;
  }

  // ---- as pessoas na chuva: quem anda corre (mão na cabeça, jornal ou guarda-chuva); quem está parado se abriga numa árvore ou foge para casa
  const PROPS = ['guarda', 'jornal', 'mao'];
  const npcsFora = () => (S.dentro && S.fora ? S.fora.npcs : S.npcs);
  function geoProp(k) {
    const P = S.propsGeo || (S.propsGeo = {});
    if (!P.cone) {
      P.cone = guardar(new THREE.ConeGeometry(0.62, 0.28, 10)); P.haste = guardar(new THREE.CylinderGeometry(0.02, 0.02, 0.62, 6)); P.jornal = guardar(new THREE.BoxGeometry(0.62, 0.025, 0.44));
      P.mHaste = guardar(new THREE.MeshLambertMaterial({ color: 0x2a2a2e }));
      P.mJornal = guardar(new THREE.MeshLambertMaterial({ map: guardar(texCanvas(32, 24, (g, w, h) => { g.fillStyle = '#c9c2a6'; g.fillRect(0, 0, w, h); g.fillStyle = '#2b2b2b'; g.fillRect(2, 2, w - 4, 5); g.fillStyle = '#9a968a'; for (let y = 9; y < h - 2; y += 3) g.fillRect(2, y, w - 4, 1); g.fillStyle = '#6a6a6a'; g.fillRect(3, 9, 10, 7); }, true)), side: THREE.DoubleSide }));
      P.cores = [0xc8352b, 0x3a64b8, 0xf2c230, 0x1f7a4d, 0x7a4fb0, 0x2a2a2e].map((c) => guardar(new THREE.MeshLambertMaterial({ color: c, side: THREE.DoubleSide })));
    }
    return P;
  }
  function criarProp(A) {
    if (A.prop || A.chuva === 'mao') return;
    const P = geoProp(), gr = new THREE.Group();
    if (A.chuva === 'guarda') { const c = new THREE.Mesh(P.cone, P.cores[Math.floor(Math.random() * P.cores.length)]); c.position.y = 0.12; gr.add(c); const h = new THREE.Mesh(P.haste, P.mHaste); h.position.y = -0.2; gr.add(h); }
    else { const j = new THREE.Mesh(P.jornal, P.mJornal); j.rotation.x = -0.35; gr.add(j); }
    S.grupo.add(gr); A.prop = gr;
  }
  function removerProp(A) { if (A.prop) { if (A.prop.parent) A.prop.parent.remove(A.prop); A.prop = null; } }
  function atualizarProp(A) {
    if (!A.prop) return; const es = A.opt.escala || 1;
    A.prop.visible = !A.oculto; A.prop.position.set(A.x, A.y + (A.chuva === 'guarda' ? 2.22 : 1.95) * es, A.z); A.prop.rotation.y = A.yaw;
  }
  function caminhoRede(x0, z0, x1, z1) {
    const N = S.rede, perto = (x, z) => { let b = 0, bd = 1e9; N.forEach((n, i) => { const d = Math.hypot(n.x - x, n.z - z); if (d < bd) { bd = d; b = i; } }); return b; };
    const a = perto(x0, z0), b = perto(x1, z1), prev = new Map([[a, -1]]), fila = [a];
    for (let qi = 0; qi < fila.length; qi++) { const u = fila[qi]; if (u === b) break; for (const v of N[u].viz) if (!prev.has(v)) { prev.set(v, u); fila.push(v); } }
    const cam = []; for (let u = b; u !== -1 && prev.has(u); u = prev.get(u)) cam.push({ x: N[u].x, z: N[u].z });
    cam.reverse(); cam.push({ x: x1, z: z1 }); return cam;
  }
  function distRede(x, z) { let bd = 1e9; for (const n of S.rede) bd = Math.min(bd, Math.hypot(n.x - x, n.z - z)); return bd; }
  function seguir(A, rota, vel, dt) {
    if (!rota.length) return true;
    if (A.travaE > 0) { A.travaE -= dt; A.andando = false; return false; }   // (5.5.0) esbarrou: espera um instante
    const q = rota[0], dx = q.x - A.x, dz = q.z - A.z, d = Math.hypot(dx, dz), v = vel * dt;
    A.vel = vel; A.correndo = vel > 2.5 || !!A.chuva;
    if (d <= Math.max(v, rota.length > 1 ? 0.6 : 0.08)) { if (rota.length === 1 && livreNPC(q.x, q.z, A, true)) { A.x = q.x; A.z = q.z; } rota.shift(); A.bloq = 0; if (!rota.length) { A.andando = false; return true; } return false; }
    let moveu = false;
    { const nx = A.x + dx / d * v, nz = A.z + dz / d * v;            // (5.5.0) gente no caminho: um passa, o outro cambaleia
      if (!livreNPC(nx, nz, A) && livreNPC(nx, nz, A, true, true)) { const B = pessoaNoCaminho(nx, nz, A); if (B) { if (cruzar(A, B)) { A.x = nx; A.z = nz; A.yawAlvo = Math.atan2(-dz, dx); A.andando = true; A.bloq = 0; } else A.andando = false; return false; } } }
    for (const ang of [0, 0.45, -0.45, 0.9, -0.9, 1.4, -1.4]) {
      const ca = Math.cos(ang), sa = Math.sin(ang), ux = (dx * ca - dz * sa) / d, uz = (dx * sa + dz * ca) / d;
      if (livreNPC(A.x + ux * v, A.z + uz * v, A)) { A.x += ux * v; A.z += uz * v; A.yawAlvo = Math.atan2(-uz, ux); moveu = true; break; }
    }
    A.andando = moveu;
    if (!moveu) {
      A.bloq = (A.bloq || 0) + dt;                                     // (5.5.0) sem o "pulo para o lado" (parecia teleporte)
      if (A.bloq > 2.5 && livreNPC(A.x + dx / d * v, A.z + dz / d * v, A, true, true)) { A.fantasma = 0.8; A.bloq = 0.5; }   // preso atrás de alguém: passa por ele
      if (A.bloq > 5) { A.bloq = 0; rota.shift(); if (!rota.length) { A.andando = false; return true; } }       // (4.9.6) não consegue passar: desiste desse ponto (nada de empurrar para dentro de outra pessoa)
    } else A.bloq = Math.max(0, (A.bloq || 0) - dt * 0.5);
    return false;
  }

  // ------------------------------------------------------------------ (4.9.6) A ROTINA DAS PESSOAS
  // MORADORES (quem não anda pela rua: os sentados, os que conversam e os três do treino): saem de casa de manhã, vão para o seu lugar e voltam às 18h, 19h ou 20h.
  // Vários moram na mesma casa. Na chuva: quem está na rua escolhe entre se abrigar sob uma árvore (até 3 por árvore, cada um num ponto fixo e em pé, sentado ou deitado)
  // ou ir para casa; quem vai para casa só volta no dia seguinte, quem se abrigou volta ao seu lugar quando a chuva para.
  // PEDESTRES: a cada 10 que decidem, 5 entram num lugar (cinema, cafeteria, mercado, bar, pizzaria, restaurante, academia ou o lanche; o hospital não).
  const VEL_MOR = 2.0, VEL_CORRE = 2.9;
  const horaEntre = (h, a, b) => (a <= b ? h >= a && h < b : h >= a || h < b);
  const yawPara = (dx, dz) => Math.atan2(-dz, dx);
  function pontoLev(a, A) {                                          // onde a pessoa fica de pé ao levantar de um assento (o primeiro ponto livre em volta)
    for (const [ux, uz] of [[a.fx, a.fz], [-a.fz, a.fx], [a.fz, -a.fx], [-a.fx, -a.fz]]) for (const dd of [0.8, 1.1, 1.5]) { const x = a.x + ux * dd, z = a.z + uz * dd; if (livreNPC(x, z, A, true)) return { x, z }; }
    return { x: a.x + a.fx * 0.8, z: a.z + a.fz * 0.8 };
  }
  const noMaisPerto = (x, z) => { let b = 0, bd = 1e9; S.rede.forEach((n, i) => { const d = Math.hypot(n.x - x, n.z - z); if (d < bd) { bd = d; b = i; } }); return b; };
  function correrNaChuva(A) { A.chuva = PROPS[Math.floor(Math.random() * 3)]; A.velBase = A.velBase || A.vel; A.vel = A.velBase * 1.9; A.correndo = true; criarProp(A); }
  function chuvaComecou() {
    for (const A of npcsFora()) if (A.tipo === 'anda' && !A.oculto && !A.chuva && !(A.dest && A.sentado)) correrNaChuva(A);
    if (S.moradores) for (const r of S.moradores) r.reagiu = false;   // cada morador decide (árvore ou casa) quando a cidade estiver à vista (tickMoradores)
  }
  function chuvaTerminou() {
    for (const A of npcsFora()) if (A.tipo === 'anda' && A.chuva) { A.chuva = null; removerProp(A); if (A.velBase) A.vel = A.velBase; A.correndo = false; }
    if (S.moradores) for (const r of S.moradores) r.reagiu = false;
  }

  // ---- moradores
  const lugarDe = (r) => r.lugarAtual || r.posto.lugar;
  const soltarLugar = (r) => { const L = lugarDe(r); if (L && L.ocupado === r.A) L.ocupado = null; r.lugarAtual = null; };
  function assentoLivrePerto(ref) {                                   // (5.0.0) o lugar dele está ocupado (pelo jogador): o vazio mais perto
    let best = null, bd = 40; for (const a of S.assentos) { if (a.ocupado || a.lanche || a === ref) continue; const d = Math.hypot(a.x - ref.x, a.z - ref.z); if (d < bd) { bd = d; best = a; } } return best;
  }
  const liberarSlot = (r) => { if (r.slot) { if (r.slot.ocupado === r) r.slot.ocupado = null; r.slot = null; } };
  function surgirMor(r, x, z, yaw) { const A = r.A; A.oculto = false; A.x = x; A.z = z; A.yaw = A.yawAlvo = yaw; A.y = altura(x, z); S.meus.add(A.m); A.blob.visible = true; A.andando = false; }
  function esconderMor(r) {
    const A = r.A; liberarSlot(r); soltarLugar(r);
    A.oculto = true; A.sentado = false; A.deitado = false; A.chao = false; A.fala = false; A.andando = false; A.chuva = null; A.correndo = false; removerProp(A);
    A.x = 0; A.z = -500; S.meus.delete(A.m); A.blob.visible = false; A.tipo = 'morador'; r.estado = 'casa'; r.rota = null;
  }
  function levantarMor(r) {                                          // sai do banco (ou do chão) e fica de pé
    const A = r.A, L = lugarDe(r);
    if (A.sentado && !A.chao && L && L.ocupado === A) { const p = pontoLev(L, A); A.x = p.x; A.z = p.z; }
    if (L && L.ocupado === A) L.ocupado = null; r.lugarAtual = null;
    A.sentado = false; A.chao = false; A.deitado = false; A.assento = 0.52; A.fala = false; A.comendo = 0;
  }
  function pontoPosto(r) { const p = r.posto, L = p.lugar; return L ? pontoLev(L, null) : { x: p.x, z: p.z }; }
  function colocarNoPosto(r) {
    const A = r.A, p = r.posto; let L = lugarDe(r);
    if (L && L.ocupado && L.ocupado !== A) {                          // (5.0.0) alguém (o jogador) está no lugar dele: vai para o banco vazio mais perto
      const N = assentoLivrePerto(L);
      if (N) { N.ocupado = A; r.lugarAtual = N; A.tipo = 'morador'; r.rota = [pontoLev(N, A)]; r.estado = 'ida'; if (A.oculto) surgirMor(r, r.rota[0].x, r.rota[0].z, p.yaw); return; }
      L = null;
    }
    const x = L ? L.x : p.x, z = L ? L.z : p.z;
    surgirMor(r, x, z, L ? L.yaw : p.yaw); A.vel = 1.2; A.correndo = false; A.chuva = null; removerProp(A); A.deitado = false; A.chao = false; A.andando = false;
    if (L) { L.ocupado = A; A.sentado = true; A.assento = L.h; A.tipo = p.tipo; }
    else if (p.lugar) { const q = pontoLev(p.lugar, A); A.x = q.x; A.z = q.z; A.sentado = false; A.assento = 0.52; A.tipo = 'conversa'; }
    else { A.sentado = false; A.assento = 0.52; A.tipo = p.tipo; }
    r.estado = 'posto';
  }
  function rotaGente(x0, z0, x1, z1) {                               // como caminhoRede, mas quem está dentro do campo (cercado) sai e entra pelo portão
    for (const F of S.societys || []) {
      const r = F.r, dentro = (x, z) => x > r.x0 - 0.5 && x < r.x1 + 0.5 && z > r.z0 - 0.5 && z < r.z1 + 0.5, g = F.gate, d0 = dentro(x0, z0), d1 = dentro(x1, z1);
      if (d0 && d1) return [{ x: x1, z: z1 }];
      if (d0) return [{ x: g.in.x, z: g.in.z }, { x: g.out.x, z: g.out.z }].concat(caminhoRede(g.out.x, g.out.z, x1, z1));
      if (d1) return caminhoRede(x0, z0, g.out.x, g.out.z).concat([{ x: g.out.x, z: g.out.z }, { x: g.in.x, z: g.in.z }, { x: x1, z: z1 }]);
    }
    return caminhoRede(x0, z0, x1, z1);
  }
  const yawFora = (c) => yawPara(c.sx - c.x, c.sz - c.z);
  function irAoPosto(r) {
    const A = r.A, c = r.casa, f = pontoPosto(r);
    surgirMor(r, c.sx, c.sz, yawFora(c)); A.tipo = 'morador'; A.vel = VEL_MOR; r.rota = rotaGente(c.sx, c.sz, f.x, f.z); r.estado = 'ida';
  }
  function irParaCasa(r) { const A = r.A, c = r.casa; levantarMor(r); liberarSlot(r); A.tipo = 'morador'; r.rota = rotaGente(A.x, A.z, c.sx, c.sz); r.estado = 'volta'; }
  function irParaArvore(r, s) { const A = r.A; levantarMor(r); A.tipo = 'morador'; s.ocupado = r; r.slot = s; r.rota = rotaGente(A.x, A.z, s.x, s.z); r.estado = 'paraArvore'; }
  function acharSlot(A) {                                            // o ponto livre mais perto (se alguém ocupa um, escolhe o próximo)
    let best = null, bd = 90;
    for (const t of S.abrigos || []) for (const sl of t.slots || []) { if (sl.ocupado) continue; const d = Math.hypot(sl.x - A.x, sl.z - A.z); if (d < bd) { bd = d; best = sl; } }
    return best;
  }
  function poseNaArvore(r) {
    const A = r.A, sl = r.slot, k = ['pe', 'chao', 'deitado'][Math.floor(Math.random() * 3)], fora = yawPara(sl.x - sl.t.x, sl.z - sl.t.z);
    A.andando = false; A.correndo = false; A.chuva = null; removerProp(A); A.vel = 1.2;
    if (k === 'deitado') { A.deitado = true; A.yaw = A.yawAlvo = fora; }                    // a cabeça fica do lado do tronco
    else if (k === 'chao') { A.sentado = true; A.chao = true; A.assento = 0.17; A.yaw = A.yawAlvo = fora + (Math.random() - 0.5) * 1.2; }
    else A.yawAlvo = fora + (Math.random() - 0.5) * 2.4;
    r.pose = k; r.estado = 'arvore'; r.espera = 3 + Math.random() * 7;
  }
  function montarMoradores() {
    const rnd = semente(4242), tR = semente(909);
    for (const t of S.abrigos || []) {                                // 3 pontos fixos em volta de cada árvore (só os livres)
      t.slots = []; const base = tR() * Math.PI * 2;
      for (let k = 0; k < 3; k++) { const a = base + k * Math.PI * 2 / 3, sx = t.x + Math.cos(a) * 1.5, sz = t.z + Math.sin(a) * 1.5; if (livreNPC(sx, sz, null, true) && distRede(sx, sz) < 14) t.slots.push({ x: sx, z: sz, t, ocupado: null }); }
    }
    const gente = S.npcs.filter((A) => A !== S.valdemar && (A.tipo === 'senta' || A.tipo === 'conversa' || A.tipo === 'treino'));
    // (5.1.0) casas com "marca" (seu Valdemar, João, os Alves) são exclusivas de quem a planta já reservou para: moradores sem
    // nome não vivem nelas. Antes só a do seu Valdemar era excluída; as outras ainda podiam "sortear" um morador qualquer.
    const casas = (S.casas || []).filter((c) => !c.marca && distRede(c.sx, c.sz) < 11);
    for (let i = casas.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [casas[i], casas[j]] = [casas[j], casas[i]]; }
    S.moradores = [];
    gente.forEach((A, i) => {
      const r = { A, casa: casas[Math.floor(i / 3) % casas.length], posto: { x: A.x, z: A.z, yaw: A.yaw, sentado: A.sentado, assento: A.assento, tipo: A.tipo, lugar: A.lugar || null },
        saida: 6.0 + rnd() * 1.5, volta: [18, 19, 20][Math.floor(rnd() * 3)], estado: 'posto', rota: null, slot: null, folga: -1, reagiu: false, espera: 0 };
      S.moradores.push(r);
      if (!horaEntre(S.dados.hora, r.saida, r.volta)) esconderMor(r);
    });
  }
  function tickMoradores(dt) {
    const M = S.moradores; if (!M || S.dentro) return;
    const h = S.dados.hora, dia = S.dados.dia || 1, molhado = !!S.clima.molhado;
    for (const r of M) {
      const A = r.A;
      if (molhado && !r.reagiu && r.estado !== 'arvore' && r.estado !== 'paraArvore') {
        r.reagiu = true;
        if (r.estado === 'casa' || r.estado === 'volta') r.folga = dia;
        else { const sl = Math.random() < 0.45 ? acharSlot(A) : null; if (sl) irParaArvore(r, sl); else { r.folga = dia; irParaCasa(r); } }
      }
      const e = r.estado;
      if (e === 'casa') {
        if (r.folga === dia || molhado || !horaEntre(h, r.saida, r.volta)) continue;
        if (r.espera > 0) { r.espera -= dt; continue; }
        if (!livreNPC(r.casa.sx, r.casa.sz, null, false)) { r.espera = 0.7; continue; }
        irAoPosto(r);
      } else if (e === 'posto') {
        if (!horaEntre(h, r.saida, r.volta)) irParaCasa(r);
      } else if (e === 'arvore') {
        A.andando = false;
        if (!molhado) {
          r.espera -= dt;
          if (r.espera <= 0) { levantarMor(r); liberarSlot(r); if (horaEntre(h, r.saida, r.volta)) { const f = pontoPosto(r); r.rota = rotaGente(A.x, A.z, f.x, f.z); r.estado = 'voltaPosto'; A.tipo = 'morador'; } else irParaCasa(r); }
        }
      } else {                                                       // ida, voltaPosto, volta, paraArvore: andando
        if ((e === 'ida' || e === 'voltaPosto') && !horaEntre(h, r.saida, r.volta)) { irParaCasa(r); continue; }
        A.chuva = molhado ? 'mao' : null;
        if (seguir(A, r.rota, molhado ? VEL_CORRE : VEL_MOR, dt)) {
          if (e === 'volta') { A.yawAlvo = yawPara(r.casa.x - A.x, r.casa.z - A.z); esconderMor(r); }
          else if (e === 'paraArvore') poseNaArvore(r);
          else colocarNoPosto(r);
        }
      }
    }
    if (S.treino) S.treino.pausa = M.some((r) => r.posto.tipo === 'treino' && r.estado !== 'posto');
  }

  // ---- pedestres que entram nos lugares
  const DESTINOS = ['cinema', 'cafeteria', 'supermercado', 'bar', 'pizzaria', 'restaurante', 'academia', 'lanche'];
  function decidirDestino(A) {
    if (!S.sacola || !S.sacola.length) S.sacola = [1, 1, 1, 1, 1, 0, 0, 0, 0, 0].sort(() => Math.random() - 0.5);     // de cada 10 decisões, 5 entram
    A.cool = 20 + Math.random() * 30;
    if (!S.sacola.pop()) return;
    let nome = DESTINOS[Math.floor(Math.random() * DESTINOS.length)];
    if (nome === lugarDoEmprego()) return;                               // (5.3.0) ninguém de fora entra onde o jogador trabalha
    if (nome === 'lanche') {
      const V = S.valdemar, vagas = S.assentos.filter((a) => a.lanche && !a.ocupado);
      if (V && !V.oculto && V.estado === 'balcao' && vagas.length) {
        const a = vagas[Math.floor(Math.random() * vagas.length)]; a.ocupado = A;
        A.dest = { tipo: 'lanche', a, fase: 'ir', rota: caminhoRede(A.x, A.z, a.x, a.z - 0.95), t: 0 }; return;
      }
      nome = DESTINOS[Math.floor(Math.random() * (DESTINOS.length - 1))]; if (nome === lugarDoEmprego()) return;
    }
    const P = PORTAS.find((q) => q.nome === nome); if (!P) return;
    if (nome === 'supermercado' && S.mercado && !S.mercado.aberto()) return;   // (5.3.1)
    A.dest = { tipo: 'lugar', P, fase: 'ir', rota: caminhoRede(A.x, A.z, P.x, P.z), t: 0 };
  }
  function fimDest(A) { A.dest = null; A.ant = null; A.alvo = noMaisPerto(A.x, A.z); A.espera = 0; A.bloq = 0; if (S.clima.molhado && !A.chuva) correrNaChuva(A); }
  function tickDestino(A, dt) {
    const D = A.dest;
    if (D.fase === 'ir') {
      if (!seguir(A, D.rota, A.vel, dt)) return;
      if (D.tipo === 'lugar') {                                      // entra: some da rua e volta pela mesma porta depois de um tempo
        D.fase = 'dentro'; D.t = 20 + Math.random() * 50; A.andando = false; A.chuva = null; A.correndo = false; removerProp(A); if (A.velBase) A.vel = A.velBase;
        A.oculto = true; S.meus.delete(A.m); A.blob.visible = false; A.x = 0; A.z = -500;
      } else {                                                       // lanche: senta na banqueta e come
        const a = D.a; D.fase = 'pede'; D.t = 4 + Math.random() * 5;
        A.chuva = null; A.correndo = false; removerProp(A); if (A.velBase) A.vel = A.velBase;
        A.sentado = true; A.assento = a.h; A.x = a.x; A.z = a.z; A.yaw = A.yawAlvo = a.yaw; A.andando = false; A.comendo = 0;
      }
    } else if (D.fase === 'dentro') {
      D.t -= dt; if (D.t > 0) return;
      const P = D.P, x = P.x + Math.cos(P.sai) * 0.45, z = P.z - Math.sin(P.sai) * 0.45;
      if (!livreNPC(x, z, A, false)) return;
      A.oculto = false; A.x = x; A.z = z; A.yaw = A.yawAlvo = P.sai; S.meus.add(A.m); A.blob.visible = true; fimDest(A);
    } else if (D.fase === 'pede') {                                   // (5.0.0) senta, espera o lanche um pouco e começa a comer
      A.andando = false; D.t -= dt; A.fala = D.t > 2.5 && D.t < 4; if (D.t > 0) return;
      A.fala = false; D.fase = 'come'; D.t = 12 + Math.random() * 12; A.comendo = 1;
    } else if (D.fase === 'come') {
      A.andando = false; D.t -= dt; if (D.t > 0) return;
      const a = D.a, p = pontoLev(a, A); A.sentado = false; A.comendo = 0; A.assento = 0.52; A.x = p.x; A.z = p.z; a.ocupado = null; fimDest(A);
    }
  }
  // separa quem ficou sobreposto (só os que andam; quem está parado no seu lugar não é empurrado)
  function separarPessoas() {
    const L = S.npcs, mov = (A) => (A.tipo === 'anda' || A.tipo === 'morador') && !A.oculto && !A.sentado && !A.deitado;
    for (let i = 0; i < L.length; i++) { const a = L[i]; if (a.oculto || a === S.valdemar || a.deitado) continue;
      for (let j = i + 1; j < L.length; j++) { const b = L[j]; if (b.oculto || b === S.valdemar || b.deitado) continue;
        const ma = mov(a), mb = mov(b); if (!ma && !mb) continue;
        if (a.fantasma > 0 || b.fantasma > 0) continue;                  // (5.5.0) passando um pelo outro de propósito
        let dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz); if (d >= 0.42) continue;
        if (d < 1e-3) { const g = Math.random() * 6.28; dx = Math.cos(g); dz = Math.sin(g); d = 1; }
        const f = (0.46 - d) / d, kA = ma && mb ? 0.5 : ma ? 1 : 0, kB = ma && mb ? 0.5 : mb ? 1 : 0;
        if (kA) { const nx = a.x - dx * f * kA, nz = a.z - dz * f * kA; if (livreNPC(nx, nz, a, true)) { a.x = nx; a.z = nz; } }
        if (kB) { const nx = b.x + dx * f * kB, nz = b.z + dz * f * kB; if (livreNPC(nx, nz, b, true)) { b.x = nx; b.z = nz; } }
      } }
  }

  // ------------------------------------------------------------------ o quadro
  let MAT_PRE = null;
  function gancho(rdt) {
    if (!S || !S.ativo) return;
    const dt = Math.min(0.05, rdt || 0.016);
    esconderBola();
    if (!S.pausado) {
      const n = typeof Cena !== 'undefined' ? Cena.passos() : 1;
      if (n > 1) S.travaPulo = 0.5; else if (S.travaPulo > 0) S.travaPulo = Math.max(0, S.travaPulo - dt);   // (5.5.0) parado durante o pulo e 0,5 s depois
      for (let i = 0; i < n; i++) {
        S.t += dt;
        if (S.modo === 'livre') { if (S.travaPulo > 0) { S.jog.andando = false; S.jog.correndo = false; } else mover(dt); tickHorario(dt); tickDescobertas(); }
        else if (S.trabalhando) tickHorario(dt);       // (5.1.1) o relógio continua andando durante o expediente
        if (S.turno) tickTurno(dt);
        tickCelular(dt); tickConvite(dt);                // (5.3.0)
        if (S.dentro && S.dentro.nome === 'cafeteria' && !S.turno && !luciaNoCafe() && S.modo === 'livre' && !S.fechandoCafe) { S.fechandoCafe = true; fecharCafe().finally(() => { if (S) S.fechandoCafe = false; }); }
        tickClima(dt);
        tickComemoracao(dt); tickJogador(dt); tickPessoas(dt); tickVomito(dt);
        if (S.mercado) S.mercado.tick(dt);                              // (5.3.1) depois do tickJogador: a pose de carregar caixa vale
        if (!S.dentro) { tickCarros(dt); tickPortao(dt); tickBola(dt); tickTreino(dt); tickPlantas(dt); }
      }
      if (n > 1) S.cam.snap = true;
      if (S.bandeira && !S.dentro) { S.bandeira.rotation.y = Math.sin(S.t * 1.3) * 0.25; S.bandeira.position.x = PRACA_C.x + 1.3 * Math.cos(S.bandeira.rotation.y); S.bandeira.position.z = PRACA_C.z - 1.3 * Math.sin(S.bandeira.rotation.y); }
      if (S.ondas && !S.dentro) for (const o of S.ondas) { o.tx.offset.x = (o.tx.offset.x + o.vx * dt) % 1; o.tx.offset.y = (o.tx.offset.y + o.vz * dt) % 1; }
      if (!S.dentro) { atualizarMarca(); atualizarTelas(dt); }
      atualizarAlvo();
    }
    atualizarCeu(); atualizarRelogioUI();
    if (typeof Cena !== 'undefined') Cena.marcar(S.modo === 'cena' && S.intro);   // só a chegada é cutscene (conversa no balcão e comemoração não)
    for (const a of ATLETAS) a.raiz.visible = S.meus.has(a) && !a.longe;
    atualizarCamera(dt);
    particulas.atualizar(0);                                            // (4.9.5) a chuva acompanha a câmera da cidade (o quadro do jogo já usou a câmera antiga)
  }
  function limpar() {
    if (!S) return;
    S.ativo = false; GANCHO_RENDER = null; clearTimeout(tMissao); SomChuva.nivel(0);
    if (S.mercado) try { S.mercado.limpar(); } catch (e) { console.warn('[Cidade] mercado:', e); }
    for (const m of S.meus) ATLETAS.delete(m);
    if (S.dentro && S.grupo && S.grupo !== S.grupoCidade) { scene.remove(S.grupo); S.grupo.traverse((o) => { if (o.geometry && o.geometry !== SHADOW_GEO) o.geometry.dispose(); }); S.grupo = S.grupoCidade; }
    if (S.grupo) {
      scene.remove(S.grupo);
      S.grupo.traverse((o) => { if (o.geometry && o.geometry !== SHADOW_GEO) o.geometry.dispose(); const ms = Array.isArray(o.material) ? o.material : [o.material]; for (const m of ms) if (m && m !== MAT_CORES && m !== SHADOW_MAT && m !== MAT && m !== MAT_DUPLO && m !== MAT_PRE) { if (m.map) m.map.dispose(); m.dispose(); } });
    }
    for (const o of descartaveis.splice(0)) { try { o.dispose(); } catch (e) { /* já foi */ } }
    restaurarMundo();
    document.body.classList.remove('cdAtivo');
    for (const k of ['ctl', 'arrasto', 'hud', 'esq', 'aviso', 'seta', 'mapa', 'pausa', 'ficha']) UI[k].hidden = true;
    UI.preto.hidden = true; UI.preto.classList.add('claro');
    if (typeof Dialogo !== 'undefined') Dialogo.esconder(); Musica.parar();
    S = null;
  }

  // ------------------------------------------------------------------ roteiro: sai do prédio, o portão fecha, e fica livre na cidade
  async function iniciar(ctx) {
    API = ctx.api; montarUI();
    UI.preto.hidden = false; UI.preto.style.transitionDuration = '0s'; UI.preto.classList.remove('claro');     // já no preto (sem piscar o mundo de antes)
    document.body.classList.add('cdAtivo');
    const f1p = document.getElementById('f1Preto'), f1Vis = !!(f1p && !f1p.hidden); if (f1p) f1p.hidden = true;   // o preto da Fase 1 (quando ela chamou a Fase 2) volta no fim
    if (!MAT) { MAT = new THREE.MeshLambertMaterial({ vertexColors: true }); MAT_DUPLO = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }); MAT_PRE = new THREE.MeshBasicMaterial({ colorWrite: false, transparent: true, depthWrite: true }); }
    const H = ctx.historia || {};
    const dados = Object.assign({ ponto: 'chegada', fakes: 150, visitas: 0, corMarca: CORES_MARCA[0], hora: 8.5, avisouDormir: false, descobertos: {}, casasConhecidas: {}, luciaApresentou: false, trabalhouHoje: false }, H.cidade || {});
    S = { ativo: true, modo: 'cena', pausado: false, t: 0, dados, assentos: [], bancos: [], col: [], circ: [], camBox: [], oclusores: [], planta: [], pisos: [], telas: [], redes: [], carros: [], npcs: [], conversas: [], pedestres: [], meus: new Set(),
      clima: novoClima(), portao: { k: 1, alvo: 1, col: [], piv: [] }, cam: { yaw: 0.55, dist: 9.5, dAt: 9.5, snap: true }, marca: null, missao: '' };
    let paraFase2 = false;
    try {
      let f2 = null; try { f2 = await Fases.carregar('fase2'); } catch (e) { console.warn('[Cidade] fase2.js não veio (roupa padrão):', e); }
      prepararMundo(); textos();
      S.grupo = S.grupoCidade = new THREE.Group(); S.grupo.position.x = OX; scene.add(S.grupo); S.f2 = f2;
      Fases.carregar('interiores').then((m) => { if (S) S.interiores = m; }, (e) => console.warn('[Cidade] interiores.js não veio:', e));
      Fases.carregar('mercado').then((m) => { if (S && m && m.criar) { S.mercado = m.criar(apiMercado()); montarRuaMercado(); } }, (e) => console.warn('[Cidade] mercado.js não veio:', e));   // (5.3.1) trabalho no mercado
      prepararDia(dados);
      montarCidade(); if (S.vidros) { const v = S.vidros.malha(S.matJanela = guardar(new THREE.MeshLambertMaterial({ vertexColors: true, emissive: 0x000000 }))); S.grupo.add(v); S.vidros = null; } montarLuzes(); criarCarros(); montarMarca(); criarBolaQuadra();
      S.planta.push({ r: FUTSAL, cor: '#d07a33', chao: true }, { r: SOCIETY, cor: '#4f9a3f', chao: true });
      S.jog = criarJogador(f2, H);
      criarPessoas(f2); criarTreino(f2); criarValdemar(f2); criarLuciaRua(f2); montarMoradores(); criarPlantas();
      const J = S.jog; J.x = SPAWN.x; J.z = -4.9; J.y = 0.22; J.yaw = J.yawAlvo = -Math.PI / 2;
      tickJogador(0.016); tickPortao(1); atualizarCamera(0.016);
      GANCHO_RENDER = gancho;
      const fim = new Promise((r) => { S.fimRes = r; });
      const primeira = !dados.visitas; dados.visitas = (dados.visitas | 0) + 1;
      gravar('chegada');
      Musica.tocar('jazz');
      S.intro = true;
      await preto(false, 1100);
      await andar(J, [[SPAWN.x, -3.7]], 1.9);
      S.intro = false;
      S.portao.alvo = 0; somPortao();                                  // o portão fecha depois que ele sai
      mostrarDinheiro(primeira);
      // (5.4.0) a missão "encontre um lugar para comer" saiu (a coxinha no canto já avisa quando ele não comeu)
      liberar(); if (S.missao) mostrarMissao();
      agendarHoje();                                                   // (5.3.0) segunda/quarta: futebol no sintético
      if (primeira) { aviso(Tf('Agora você tem dinheiro: {0} fakes.', dados.fakes)); await esperar(3200); }
      if ((dados.dia || 1) === 1) { aviso(T('Empurre o direcional até a borda para correr. Arraste a tela para girar a câmera.')); setTimeout(() => { if (S && UI) aviso(''); }, 5500); }   // (5.2.0) só no 1º dia
      await fim; paraFase2 = S.paraFase2 || false;
    } finally {
      limpar();
      if (f1p && f1Vis) { f1p.hidden = false; f1p.classList.remove('claro'); }
    }
    // (4.9.5) entrou no prédio: o apartamento (Fase 2) abre no saguão, com o personagem livre (e a cidade volta quando ele sair pela porta da rua)
    if (paraFase2) { const rc = await Fases.executar('fase2', paraFase2 === 'acordar' ? { volta: true, acordar: true } : { volta: true }); if (!rc.ok) console.warn('[Cidade] fase2 não rodou:', rc); }
  }

  window.FutebolJS.registrarFase({ id: 'cidade', nome: 'Cidadezinha', nucleoMinimo: '5.0.0', iniciar,
    _estado: () => S, _planta: { R, PX, PZ, LAGO, PIER, SPAWN },
    _fns: { jogarSintetico, tocarCelular, atenderLigacao, perdeuLigacao, agendarHoje, cfgSintetico, horaDoFutebol, lugarDoEmprego, fut, MusicaCafe, SomCafe, interagir, falarComLucia, iniciarTurno, encerrarTurno, abrirBancada, anotarPedido, entregarPedido, clientesDoTurno, rotaLucia, menuBalcao, alvoAtual, alvos, tickDescobertas, gravar, novoDia, madrugada, avisoDormir, entrarEm, sairDoLugar, vomitar, gotaVomito, fase1Lucia, empregoEscolhido, liberar, TIERS } });   // (_estado/_planta/_fns: para testes)
})();
