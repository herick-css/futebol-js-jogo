/* =====================================================================================================================
   torneios.js — OS MINI TORNEIOS DA HISTÓRIA: o TORNEIO DO SINTÉTICO (no sintético Doutor Bryan) e o TORNEIO DE FUTSAL (na quadra).
   - Registrado com FutebolJS.registrarFase({ id: 'torneios' }) só para o jogo saber baixar o arquivo; NÃO roda como fase.
     A cidade (cidade.js) baixa em segundo plano e chama criar(api) (api = apiTorneios() da cidade).
   - A ORDEM DA HISTÓRIA:
       1) duas semanas depois do 1º racha no sintético, o João manda mensagem: vai ter um torneio e ele quer o jogador no time dele
          (a frase depende de como o jogador foi nos rachas). A inscrição é automática.
       2) acabou o torneio do sintético: o Biel chama para o torneio de futsal (mesmas regras). Pessoalmente, se o jogador estava no
          último jogo do time; senão por mensagem.
       3) acabou o torneio de futsal: o Rafa (que joga no time do Biel) chama para o campeonato de várzea do Peladão FC (varzea.js),
          também com a inscrição automática.
       Quem não jogou nenhum jogo recebe os convites por mensagem ("o João me passou seu número").
   - O TORNEIO: 10 times, todos contra todos (9 rodadas), os 4 melhores vão para a semifinal (1º x 4º, 2º x 3º), os vencedores fazem a
     final e os perdedores, a disputa do 3º lugar. 3 jogos por semana (sexta no horário do futebol, que nunca cai no trabalho; sábado e
     domingo à tarde). O nosso time é 3 estrelas; os outros vão de 1 a 5 (relativas a cada torneio).
     Prêmio do campeão: 300 fakes para o jogador no sintético; 350 por jogador no futsal (só para quem jogou pelo menos um jogo).
   - DIA DE JOGO: a torcida chega de 2 h a 1 h antes e fica em volta da grade; meia hora antes os dois times aquecem lá dentro. De 1 h
     antes até meia hora depois, o portão leva para o jogo: o jogador entra, os times se perfilam, o juiz tira cara ou coroa com os
     capitães, a pré-partida (o confronto e a tabela) e a partida de 5 minutos (1 h no relógio da cidade). Depois, quem chamou comenta o
     jogo, a tabela e o próximo jogo.
   - QUEM NÃO VAI: o time joga sem ele (simulado) e quem chamou manda mensagem (uma de 10 broncas), com o placar e o próximo jogo. Quem
     não foi a nenhum jogo da primeira fase é cortado das eliminatórias (se o time passar); se o time não passar, ele avisa também.
   - Todo jogo do torneio é missão no dia (textoMissoes da cidade chama missao()).
   - Salvo em historia.cidade.torneios = { sin, fut } (o estado de cada torneio).
   ===================================================================================================================== */
(() => {
  'use strict';
  const r1 = (v) => Math.round(v * 10) / 10;
  const clampN = (v, a, b) => Math.max(a, Math.min(b, v));
  const rndDe = (sem) => (typeof sorteador === 'function' ? sorteador(sem) : (() => { let a = sem >>> 0 || 1; return () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; }; })());
  const semDe = (txt) => (typeof sementeDe === 'function' ? sementeDe(txt) : [...String(txt)].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261));
  const DIAS_SEM = 7, PRIMEIRO_CONVITE = 14;                               // o João manda a mensagem 2 semanas depois do 1º racha
  const VACILO = [                                                         // as broncas de quem chamou, quando o jogador falta
    'Pô, {0}, que vacilo! Você não apareceu no jogo...',
    'Ô {0}, cadê você? A gente te esperou até o último minuto!',
    'Vacilou, hein, {0}? O time inteiro perguntando de você.',
    'Sério, {0}? Sumiu bem no dia do jogo...',
    '{0}, isso não se faz! A gente contava com você hoje.',
    'Fala, {0}... ficou faltando você em campo. Vacilo!',
    'Poxa, {0}, nem um aviso? A gente jogou com um a menos.',
    '{0}, você deu um bolo no time inteiro! Que vacilo...',
    'Esperamos, esperamos... e nada de você, {0}. Vacilou feio.',
    'Ô {0}, compromisso é compromisso! Seu nome tá na lista do time.',
  ];

  // ============================================================================================ AS HABILIDADES (as mesmas contas da várzea)
  const HABS = ['defesa', 'desarme', 'forca', 'resistencia', 'recuperacao', 'velocidade', 'chute', 'efeito', 'passe', 'cruzamento', 'drible', 'dominio', 'cabeceio', 'finalizacao', 'goleiro'];
  const CONTA = {
    GK: { goleiro: 4, dominio: 1, passe: 1, forca: 1, defesa: 1, resistencia: 1 },
    DEF: { defesa: 2, desarme: 2, cabeceio: 1, forca: 1, velocidade: 1, resistencia: 1, passe: 1, dominio: 1 },
    MID: { passe: 2, drible: 1, dominio: 1, resistencia: 1, cruzamento: 1, defesa: 1, chute: 1, velocidade: 1 },
    FWD: { finalizacao: 2, chute: 1, velocidade: 1, drible: 1, dominio: 1, cabeceio: 1, efeito: 1, forca: 1 },
  };
  const VIES = {
    GK: { goleiro: 2, defesa: 0, drible: -2, finalizacao: -3, chute: -1, cabeceio: -1 },
    DEF: { defesa: 1, desarme: 1, cabeceio: 1, finalizacao: -1, drible: -1, goleiro: -5 },
    MID: { passe: 1, drible: 1, resistencia: 1, goleiro: -5 },
    FWD: { finalizacao: 1, chute: 1, velocidade: 1, defesa: -1, desarme: -1, goleiro: -5 },
  };
  function mediaPos(hab, pos) { const W = CONTA[pos] || CONTA.MID; let s = 0, n = 0; for (const k in W) { s += (hab[k] != null ? hab[k] : 5) * W[k]; n += W[k]; } return s / n; }
  function gerarHab(alvo, pos, sem, extra) {
    const r = rndDe(sem), V = VIES[pos] || {}, h = {};
    for (const n of HABS) h[n] = alvo + (V[n] || 0) * 0.8 + (r() - 0.5) * 2.2;
    if (extra) for (const n in extra) h[n] += extra[n];
    for (let it = 0; it < 3; it++) { const m = mediaPos(h, pos), dlt = alvo - m; for (const n of HABS) h[n] = clampN(h[n] + dlt, 1, 10); }
    for (const n of HABS) h[n] = r1(h[n]);
    return h;
  }
  // os lugares de cada formação com 5 na linha (o society e o futsal da história são 6 x 6), na ordem do motor
  const papeisDa = (formacao) => (typeof montarFormacao === 'function' ? montarFormacao(formacao, 5).map((s) => s.role) : ['GK', 'DEF', 'DEF', 'MID', 'MID', 'FWD']);
  const nomeFormacao = (formacao) => { const p = papeisDa(formacao).slice(1); return ['DEF', 'MID', 'FWD'].map((x) => p.filter((y) => y === x).length).filter(Boolean).join('-'); };

  // ============================================================================================ OS TIMES
  //   est: as estrelas (relativas a cada torneio; o nosso é 3). setores: a média de cada setor na régua da história (3 = 30, 6 = 60).
  //   elenco: os 6 titulares na ordem dos lugares da formação (o nosso time tem 5: o jogador entra no lugar da posição dele) e os reservas.
  //   ap: rosto fixo de quem já existe na cidade ('joao', 'caio', 'julia', 'biel' ou a semente do apFixa). 'Nome:F' = mulher.
  const U = (camisa, listra, gola, calcao, meia, sola, goleiro) => [camisa, listra, gola, calcao, meia, sola, goleiro];
  const DEF = {
    sin: {
      id: 'sin', campo: 'society', nome: 'Torneio do Sintético', titulo: 'TORNEIO DO SINTÉTICO', nosso: 'joao', premio: 300, porJogador: false, hFds: 16, quem: 'joao', nomeQuem: 'João',
      times: [
        { k: 'joao', nome: 'Time do João', sigla: 'JOÃ', tecnico: 'Caio', est: 3, setores: { gk: 4.4, def: 4.5, mid: 4.6, fwd: 4.5 }, formacao: '4-4-2', tatica: 'tikitaka',
          nota: 'A turma do racha: todo mundo se conhece e joga junto. Ninguém é craque, mas ninguém some no jogo.',
          uni: U('#f2c230', '#1c1c1f', '#1c1c1f', '#1c1c1f', '#1c1c1f', '#111111', '#2a72d6'), uni2: U('#3a64b8', '#f2f2ee', '#1f3a73', '#f2f2ee', '#3a64b8', '#f2f2ee', '#1f9e5c'),
          elenco: [{ n: 'Tiago', ap: 4141 }, { n: 'João', ap: 'joao' }, { n: 'Rafa', ap: 6161 }, { n: 'Carol:F', ap: 5151 }, { n: 'Bruno', ap: 4747 }, 'Pedrinho', 'Nina:F', 'Leandro', 'Gabi:F'] },
        { k: 'caio', nome: 'Time do Caio', sigla: 'CAI', tecnico: 'Seu Odair', est: 4, setores: { gk: 4.6, def: 4.8, mid: 5.0, fwd: 5.2 }, formacao: '4-3-3', tatica: 'tikitaka',
          nota: 'O time do outro lado do racha. A Júlia é a melhor jogadora do torneio e o Caio organiza tudo em campo.', forte: 'fwd',
          uni: U('#3a64b8', '#f2f2ee', '#1f3a73', '#f2f2ee', '#3a64b8', '#f2f2ee', '#1f9e5c'), uni2: U('#f2f2ee', '#3a64b8', '#3a64b8', '#3a64b8', '#f2f2ee', '#3a64b8', '#1f9e5c'),
          elenco: [{ n: 'Marcos', ap: 8181 }, { n: 'Caio', ap: 'caio' }, { n: 'Júlia:F', ap: 'julia' }, { n: 'Dani:F', ap: 9191 }, { n: 'Vitinho', ap: 3131 }, { n: 'Lia:F', ap: 9797 }, 'Dudu', 'Bela:F', 'Fabinho', 'Cris'] },
        { k: 'resenha', nome: 'Resenha FC', sigla: 'RES', tecnico: 'Tio Juvenal', est: 5, setores: { gk: 5.4, def: 5.6, mid: 5.9, fwd: 6.0 }, formacao: '4-3-3', tatica: 'falso9',
          nota: 'O favorito: ganhou os três últimos torneios do bairro. Toca rápido e finaliza de qualquer lugar.', forte: 'fwd',
          uni: U('#c8352b', '#f2c230', '#f2c230', '#1c1c1f', '#c8352b', '#111111', '#2a72d6'), uni2: U('#1c1c1f', '#c8352b', '#c8352b', '#1c1c1f', '#1c1c1f', '#c8352b', '#2a72d6'),
          elenco: ['Zeca', 'Lucão', 'Mineiro', 'Tetê:F', 'Baiano', 'Pirulito', 'Jajá', 'Nico', 'Tuca', 'Bia Lopes:F'] },
        { k: 'rolo', nome: 'Rolo Compressor', sigla: 'ROL', tecnico: 'Dona Matilde', est: 5, setores: { gk: 5.6, def: 6.0, mid: 5.2, fwd: 5.4 }, formacao: '5-3-2', tatica: 'retranca',
          nota: 'Marca em cima o jogo inteiro e quase não toma gol. Quem faz gol neles merece aplauso.', forte: 'def',
          uni: U('#3a3a40', '#e8742a', '#e8742a', '#3a3a40', '#3a3a40', '#e8742a', '#1f9e5c'), uni2: U('#e8742a', '#3a3a40', '#3a3a40', '#e8742a', '#e8742a', '#3a3a40', '#1f9e5c'),
          elenco: ['Trator', 'Pilão', 'Bigode', 'Rodo', 'Socó', 'Ranger', 'Pá', 'Marreta', 'Cinzel', 'Rosa:F'] },
        { k: 'posto', nome: 'Galera do Posto', sigla: 'GDP', tecnico: 'Seu Arlindo', est: 4, setores: { gk: 5.0, def: 5.2, mid: 4.8, fwd: 4.9 }, formacao: '4-4-2', tatica: 'contra',
          nota: 'Os frentistas do posto da avenida. Fecham bem atrás e saem rápido no contra-ataque.', forte: 'def',
          uni: U('#1f7a4d', '#f2c230', '#f2c230', '#1f7a4d', '#1f7a4d', '#f2c230', '#c8352b'), uni2: U('#f2c230', '#1f7a4d', '#1f7a4d', '#f2c230', '#f2c230', '#1f7a4d', '#c8352b'),
          elenco: ['Gasolina', 'Calibre', 'Bomba', 'Flanela', 'Óleo', 'Pneuzinho', 'Vela', 'Turbo', 'Escapamento', 'Filtro'] },
        { k: 'tabelinha', nome: 'Tabelinha EC', sigla: 'TAB', tecnico: 'Professor Ivo', est: 3, setores: { gk: 4.3, def: 4.3, mid: 4.9, fwd: 4.4 }, formacao: '3-5-2', tatica: 'tikitaka',
          nota: 'Gosta de tocar a bola de pé em pé. O meio-campo é bom; atrás, sofre com quem é rápido.', forte: 'mid', fraco: 'def',
          uni: U('#7a4fb0', '#f2f2ee', '#f2f2ee', '#f2f2ee', '#7a4fb0', '#f2f2ee', '#f2c230'), uni2: U('#f2f2ee', '#7a4fb0', '#7a4fb0', '#7a4fb0', '#f2f2ee', '#7a4fb0', '#f2c230'),
          elenco: ['Toquinho', 'Lençol', 'Tabela', 'Letinha:F', 'Passinho', 'Pivô', 'Chapéu', 'Rolinho', 'Grampo', 'Nanda:F'] },
        { k: 'quinta', nome: 'Pelada de Quinta', sigla: 'PDQ', tecnico: 'Seu Gervásio', est: 2, setores: { gk: 3.8, def: 3.9, mid: 4.0, fwd: 4.3 }, formacao: '4-4-2', tatica: 'aerea',
          nota: 'A pelada dos amigos que jogam toda quinta. Muita vontade, pouco fôlego no fim do jogo.', fraco: 'gk',
          uni: U('#f2f2ee', '#1c1c1f', '#1c1c1f', '#1c1c1f', '#f2f2ee', '#1c1c1f', '#e8742a'), uni2: U('#1c1c1f', '#f2f2ee', '#f2f2ee', '#f2f2ee', '#1c1c1f', '#f2f2ee', '#e8742a'),
          elenco: ['Careca', 'Tonhão', 'Fofão', 'Zé Quinta', 'Barriga', 'Fôlego', 'Mochila', 'Cuca', 'Sardinha', 'Lila:F'] },
        { k: 'furada', nome: 'Chuteira Furada', sigla: 'CHF', tecnico: 'Tia Neide', est: 2, setores: { gk: 4.0, def: 3.7, mid: 3.9, fwd: 4.1 }, formacao: '4-3-3', tatica: 'contra',
          nota: 'Time novo, cheio de garotos. Corre muito, mas erra bastante passe e deixa espaço atrás.', fraco: 'def',
          uni: U('#3fa7d6', '#1c1c1f', '#1c1c1f', '#1c1c1f', '#3fa7d6', '#1c1c1f', '#f2c230'), uni2: U('#1c1c1f', '#3fa7d6', '#3fa7d6', '#3fa7d6', '#1c1c1f', '#3fa7d6', '#f2c230'),
          elenco: ['Remendo', 'Cadarço', 'Trava', 'Sola', 'Linguinha', 'Biqueira', 'Meião', 'Palmilha', 'Fivela', 'Dora:F'] },
        { k: 'unidos', nome: 'Unidos do Bairro', sigla: 'UDB', tecnico: 'Seu Lauro', est: 1, setores: { gk: 3.6, def: 3.2, mid: 3.4, fwd: 3.3 }, formacao: '5-3-2', tatica: 'retranca',
          nota: 'Montado de última hora com quem apareceu. Fica todo mundo atrás e torce para o tempo passar.', fraco: 'fwd',
          uni: U('#8c9199', '#c8352b', '#c8352b', '#2a2e36', '#8c9199', '#c8352b', '#1f7a4d'), uni2: U('#c8352b', '#8c9199', '#8c9199', '#8c9199', '#c8352b', '#8c9199', '#1f7a4d'),
          elenco: ['Vizinho', 'Portão', 'Muro', 'Calçada', 'Esquina', 'Telhado', 'Varal', 'Quintal', 'Janela', 'Lurdinha:F'] },
        { k: 'cansados', nome: 'Os Cansados', sigla: 'CAN', tecnico: 'Seu Bené', est: 1, setores: { gk: 3.4, def: 3.3, mid: 3.2, fwd: 3.5 }, formacao: '4-4-2', tatica: 'retranca',
          nota: 'A turma mais velha do bairro. Experiência não falta; perna, sim.', fraco: 'mid',
          uni: U('#e8c27a', '#7a1f2b', '#7a1f2b', '#7a1f2b', '#e8c27a', '#7a1f2b', '#2a72d6'), uni2: U('#7a1f2b', '#e8c27a', '#e8c27a', '#e8c27a', '#7a1f2b', '#e8c27a', '#2a72d6'),
          elenco: ['Vovô', 'Joelho', 'Bengala', 'Coluna', 'Soneca', 'Pantufa', 'Chinelo', 'Rede', 'Cochilo', 'Dona Zica:F'] },
      ],
    },
    fut: {
      id: 'fut', campo: 'futsal', nome: 'Torneio de Futsal', titulo: 'TORNEIO DE FUTSAL', nosso: 'biel', premio: 350, porJogador: true, hFds: 15, quem: 'biel', nomeQuem: 'Biel',
      times: [
        { k: 'biel', nome: 'Time do Biel', sigla: 'BIE', tecnico: 'Biel', est: 3, setores: { gk: 4.5, def: 4.4, mid: 4.7, fwd: 4.5 }, formacao: '4-4-2', tatica: 'tikitaka',
          nota: 'A galera da quadra de terça e quinta. O Duda pega muito no gol e o Biel arma o jogo.',
          uni: U('#1f7a4d', '#f2f2ee', '#f2f2ee', '#1c1c1f', '#1f7a4d', '#111111', '#f2c230'), uni2: U('#f2f2ee', '#c8352b', '#c8352b', '#c8352b', '#f2f2ee', '#111111', '#2a72d6'),
          elenco: [{ n: 'Duda', ap: 2525 }, { n: 'Biel', ap: 'biel' }, { n: 'Léo', ap: 2121 }, { n: 'Bruna:F', ap: 2323 }, { n: 'Rafa', ap: 6161 }, { n: 'Kauã', ap: 2929 }, 'Paulinho', 'Ju:F', 'Breno'] },
        { k: 'quadra', nome: 'Galera da Quadra', sigla: 'QDR', tecnico: 'Dona Celeste', est: 3, setores: { gk: 4.4, def: 4.6, mid: 4.5, fwd: 4.3 }, formacao: '4-4-2', tatica: 'tikitaka',
          nota: 'Os rivais de sempre da quadra. Conhecem cada canto dela e marcam bem.', forte: 'def',
          uni: U('#f2f2ee', '#c8352b', '#c8352b', '#c8352b', '#f2f2ee', '#111111', '#2a72d6'), uni2: U('#c8352b', '#f2f2ee', '#f2f2ee', '#f2f2ee', '#c8352b', '#111111', '#2a72d6'),
          elenco: [{ n: 'Neto', ap: 3434 }, { n: 'Paty:F', ap: 3636 }, { n: 'Juninho', ap: 3838 }, { n: 'Rafinha', ap: 4040 }, { n: 'Gui', ap: 4242 }, { n: 'Mel:F', ap: 4646 }, 'Tico', 'Lalá:F', 'Beto', 'Caju'] },
        { k: 'salao', nome: 'Salão 10', sigla: 'S10', tecnico: 'Professor Wagner', est: 5, setores: { gk: 5.8, def: 5.5, mid: 5.9, fwd: 5.7 }, formacao: '4-3-3', tatica: 'tikitaka',
          nota: 'O time da escolinha de futsal: técnica de sobra e um goleiro que parece um paredão.', forte: 'gk',
          uni: U('#2a3f66', '#f2c230', '#f2c230', '#2a3f66', '#2a3f66', '#f2c230', '#e8742a'), uni2: U('#f2c230', '#2a3f66', '#2a3f66', '#f2c230', '#f2c230', '#2a3f66', '#e8742a'),
          elenco: ['Paredão', 'Falcãozinho', 'Ala', 'Fixo', 'Pivete', 'Riscado', 'Sola', 'Giro', 'Bico', 'Tati:F'] },
        { k: 'ginga', nome: 'Ginga Futsal', sigla: 'GIN', tecnico: 'Mestre Josué', est: 5, setores: { gk: 5.3, def: 5.4, mid: 6.0, fwd: 5.8 }, formacao: '3-5-2', tatica: 'falso9',
          nota: 'Drible, pedalada e caneta: joga bonito e não tem medo de arriscar.', forte: 'mid',
          uni: U('#e8742a', '#1c1c1f', '#1c1c1f', '#1c1c1f', '#e8742a', '#1c1c1f', '#3fa7d6'), uni2: U('#1c1c1f', '#e8742a', '#e8742a', '#e8742a', '#1c1c1f', '#e8742a', '#3fa7d6'),
          elenco: ['Gingado', 'Pedalada', 'Caneta', 'Elástico', 'Firula', 'Lambreta', 'Rolinho', 'Chaleira', 'Malabar', 'Gigi:F'] },
        { k: 'pivo', nome: 'Pivô de Ouro', sigla: 'PVO', tecnico: 'Seu Aurélio', est: 4, setores: { gk: 4.8, def: 4.9, mid: 5.0, fwd: 5.4 }, formacao: '4-3-3', tatica: 'contra',
          nota: 'Joga para o pivô: bola nele, giro e chute. O ataque é o ponto forte.', forte: 'fwd',
          uni: U('#f2c230', '#7a4a2a', '#7a4a2a', '#7a4a2a', '#f2c230', '#7a4a2a', '#1f7a4d'), uni2: U('#7a4a2a', '#f2c230', '#f2c230', '#f2c230', '#7a4a2a', '#f2c230', '#1f7a4d'),
          elenco: ['Dourado', 'Pivozão', 'Ourinho', 'Medalha', 'Brilho', 'Quilate', 'Pepita', 'Garimpo', 'Lingote', 'Jade:F'] },
        { k: 'ligeiros', nome: 'Os Ligeiros', sigla: 'LIG', tecnico: 'Dona Fátima', est: 4, setores: { gk: 4.9, def: 5.1, mid: 5.2, fwd: 5.1 }, formacao: '4-4-2', tatica: 'contra', rapido: true,
          nota: 'Ninguém corre mais que eles. Se der espaço, é contra-ataque e gol.', forte: 'mid',
          uni: U('#3fa7d6', '#f2f2ee', '#f2f2ee', '#f2f2ee', '#3fa7d6', '#f2f2ee', '#c8352b'), uni2: U('#f2f2ee', '#3fa7d6', '#3fa7d6', '#3fa7d6', '#f2f2ee', '#3fa7d6', '#c8352b'),
          elenco: ['Foguete', 'Vento', 'Raio', 'Flecha', 'Corisco', 'Tufão', 'Pressa', 'Faísca', 'Bala', 'Lebre:F'] },
        { k: 'trave', nome: 'Trave Quadrada', sigla: 'TRQ', tecnico: 'Seu Nestor', est: 2, setores: { gk: 4.2, def: 4.0, mid: 3.8, fwd: 3.9 }, formacao: '5-3-2', tatica: 'retranca',
          nota: 'Joga fechado e aposta no goleiro. Quando sai para o ataque, quase não acerta o gol.', fraco: 'fwd',
          uni: U('#8e1f24', '#f2f2ee', '#f2f2ee', '#f2f2ee', '#8e1f24', '#f2f2ee', '#f2c230'), uni2: U('#f2f2ee', '#8e1f24', '#8e1f24', '#8e1f24', '#f2f2ee', '#8e1f24', '#f2c230'),
          elenco: ['Travessão', 'Esquadro', 'Baliza', 'Ângulo', 'Poste', 'Canto', 'Linha', 'Marca', 'Risco', 'Cida:F'] },
        { k: 'bolanope', nome: 'Bola no Pé', sigla: 'BNP', tecnico: 'Tio Rubens', est: 2, setores: { gk: 3.9, def: 3.8, mid: 4.1, fwd: 4.0 }, formacao: '4-4-2', tatica: 'tikitaka',
          nota: 'Time esforçado, sem ninguém que se destaque. Erra pouco, mas cria pouco também.',
          uni: U('#a6d13a', '#1c1c1f', '#1c1c1f', '#1c1c1f', '#a6d13a', '#1c1c1f', '#e8742a'), uni2: U('#1c1c1f', '#a6d13a', '#a6d13a', '#a6d13a', '#1c1c1f', '#a6d13a', '#e8742a'),
          elenco: ['Pezinho', 'Bolinha', 'Chute', 'Domínio', 'Passe', 'Toque', 'Peito', 'Coxa', 'Calcanhar', 'Luna:F'] },
        { k: 'rede', nome: 'Rede Furada', sigla: 'RDF', tecnico: 'Seu Vicente', est: 1, setores: { gk: 3.1, def: 3.4, mid: 3.6, fwd: 3.5 }, formacao: '4-3-3', tatica: 'aerea',
          nota: 'O goleiro é o ponto fraco: chute de longe neles costuma entrar.', fraco: 'gk',
          uni: U('#d95fa0', '#f2f2ee', '#f2f2ee', '#2a2e36', '#d95fa0', '#f2f2ee', '#1f7a4d'), uni2: U('#2a2e36', '#d95fa0', '#d95fa0', '#d95fa0', '#2a2e36', '#d95fa0', '#1f7a4d'),
          elenco: ['Peneira', 'Furinho', 'Buraco', 'Rasgo', 'Malha', 'Linha', 'Nó', 'Fio', 'Agulha', 'Tecelã:F'] },
        { k: 'chapeu', nome: 'Chapéu Seco', sigla: 'CHS', tecnico: 'Dona Aparecida', est: 1, setores: { gk: 3.3, def: 3.5, mid: 3.4, fwd: 3.2 }, formacao: '5-3-2', tatica: 'retranca',
          nota: 'Primeiro torneio deles. Muita disposição e pouca experiência de quadra.', fraco: 'fwd',
          uni: U('#c9d2e6', '#1c2340', '#1c2340', '#1c2340', '#c9d2e6', '#1c2340', '#c8352b'), uni2: U('#1c2340', '#c9d2e6', '#c9d2e6', '#c9d2e6', '#1c2340', '#c9d2e6', '#c8352b'),
          elenco: ['Aba', 'Boné', 'Palha', 'Cartola', 'Sombrero', 'Viseira', 'Touca', 'Gorro', 'Fita', 'Laurinha:F'] },
      ],
    },
  };
  for (const id in DEF) DEF[id].idx = Object.fromEntries(DEF[id].times.map((t, i) => [t.k, i]));
  const uniDe = (u) => ({ camisa: u[0], listra: u[1], gola: u[2], calcao: u[3], meia: u[4], sola: u[5], goleiro: u[6] });
  const coresDe = (u, gk) => [gk ? u[6] : u[0], u[3], u[1], u[4]];       // as cores da roupa de jogo dos bonecos da cidade (criarNPCFixo, roupa 7)

  // ============================================================================================ O MÓDULO NA CIDADE
  function criar(api) {
    const S = () => api.S();
    const M = { fila: [], tMsg: 4, lendo: false, cena: false, torc: { sin: [], fut: [] }, torcK: { sin: null, fut: null }, plano: { sin: null, fut: null }, aq: { sin: null, fut: null } };
    const dados = () => S().dados;
    const fem = () => typeof PERSONAGEM !== 'undefined' && PERSONAGEM.genero === 'F';
    const pk = (l) => l[Math.floor(Math.random() * l.length)];
    const fmt = (h) => api.fmtHora(h);
    const DIAS = ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo'];
    const semanaDe = (dia) => ((dia - 1) % 7 + 7) % 7;
    const hAbs = (dia, h) => (dia - 1) * 24 + h;
    const agora = () => hAbs(dados().dia || 1, dados().hora || 0);
    const todos = () => { const d = dados(); return (d.torneios = d.torneios || {}); };
    const camp = (id) => { const T0 = todos(); return (T0[id] = T0[id] || { etapa: 'nada' }); };
    const posicaoJog = () => { const p = (typeof PERSONAGEM !== 'undefined' && PERSONAGEM.posicaoHist) || 'FWD'; return ['GK', 'DEF', 'MID', 'FWD'].includes(p) ? p : 'FWD'; };
    const atribJog = () => { try { return api.atributosJogador(); } catch (e) { return {}; } };
    const mediaJog = () => r1(mediaPos(atribJog(), posicaoJog()));
    const nomeT = (D, i) => T(D.times[i].nome);
    const nossoI = (D) => D.idx[D.nosso];

    // ---------------------------------------------------------------- os elencos (com o rosto de quem já existe na cidade)
    const ELENCOS = {};
    function rostoDe(ap, nome, fem0) {
      try {
        if (ap === 'joao' && typeof HIST !== 'undefined') return Object.assign({}, HIST.joao, { barba: 0 });
        if (ap === 'caio') return Object.assign({}, api.AP_CAIO);
        if (ap === 'julia') return api.apJulia();
        if (ap === 'biel') return api.apBiel();
        if (typeof ap === 'number') return api.apFixa(ap, fem0 ? 'F' : 'M');
      } catch (e) { /* cai no gerador */ }
      return typeof gerarAparencia === 'function' ? gerarAparencia(semDe('tn|' + nome), fem0 ? 'F' : 'M') : {};
    }
    function elenco(D, t) {
      const ch = D.id + '|' + t.k; if (ELENCOS[ch]) return ELENCOS[ch];
      const pap = papeisDa(t.formacao), nosso = t.k === D.nosso, res = ['GK', 'DEF', 'MID', 'FWD'];
      let lista = pap;
      if (nosso) { const pos = posicaoJog(); let i = pap.indexOf(pos); if (i < 0) i = pap.indexOf('FWD'); lista = pap.filter((x, k) => k !== i); }
      lista = lista.concat(res);
      const r = rndDe(semDe('tn-time|' + D.id + '|' + t.k)), out = [], nTit = nosso ? 5 : 6;
      lista.forEach((pos, i) => {
        const e = t.elenco[i] || ('Jogador ' + (i + 1)), txt = typeof e === 'string' ? e : e.n, [nome, g] = txt.split(':'), f = g === 'F';
        const set = pos === 'GK' ? t.setores.gk : pos === 'DEF' ? t.setores.def : pos === 'MID' ? t.setores.mid : t.setores.fwd;
        const titular = i < nTit, alvo = clampN(set + (r() - 0.5) * 0.8 - (titular ? 0 : 0.6), 1.5, 9.8);
        const sem = semDe('tn|' + D.id + '|' + t.k + '|' + nome);
        const j = Object.assign({ nome, genero: f ? 'F' : 'M', semente: sem, pos, titular, hab: gerarHab(alvo, pos, sem, t.rapido && pos !== 'GK' ? { velocidade: 1.5 } : null) }, rostoDe(typeof e === 'string' ? null : e.ap, nome, f));
        j.media = r1(mediaPos(j.hab, pos));
        out.push(j);
      });
      return (ELENCOS[ch] = out);
    }
    function titulares(D, t) {
      const pap = papeisDa(t.formacao), E = elenco(D, t);
      if (t.k !== D.nosso) return pap.map((pos, i) => ({ nome: E[i].nome, pos, media: E[i].media, ap: E[i] }));
      const pos = posicaoJog(); let iu = pap.indexOf(pos); if (iu < 0) iu = pap.indexOf('FWD');
      let k = 0; return pap.map((p, i) => (i === iu ? { nome: api.nomeJog(), pos: p, media: mediaJog(), voce: true } : { nome: E[k].nome, pos: p, media: E[k++].media, ap: E[k - 1] }));
    }
    function forcaTime(D, t) {
      const tt = titulares(D, t), m = tt.reduce((s, j) => s + j.media, 0) / tt.length;
      const set = (p) => { const l = tt.filter((j) => j.pos === p); return l.length ? l.reduce((s, j) => s + j.media, 0) / l.length : m; };
      return { media: r1(m), gk: r1(set('GK')), def: r1(set('DEF')), mid: r1(set('MID')), fwd: r1(set('FWD')) };
    }
    function timeMotor(D, t) {
      const fz = forcaTime(D, t), ap = typeof gerarAparencia === 'function' ? gerarAparencia(semDe('tn-tec|' + t.tecnico), /^(Dona|Tia) /.test(t.tecnico) ? 'F' : 'M') : {};
      const tecAp = t.tecnico === 'Biel' ? api.apBiel() : t.tecnico === 'Caio' ? api.AP_CAIO : ap;
      return {
        id: 'tn_' + D.id + '_' + t.k, nome: T(t.nome), sigla: t.sigla, forca: Math.round(fz.media * 10), popularidade: 0.2, formacao: t.formacao, tatica: t.tatica,
        uniforme: uniDe(t.uni), uniforme2: uniDe(t.uni2), tecnicoFixo: true,
        emblema: { forma: t.k === D.nosso ? 'escudo' : 'circulo', cor1: t.uni[0], cor2: t.uni[1], letras: t.sigla.slice(0, 2) },
        tecnico: { nome: t.tecnico, aparencia: { pele: tecAp.pele, cabelo: tecAp.cabelo, estilo: tecAp.estilo, roupa: t.uni[3] } },
        elenco: elenco(D, t).map((j) => Object.assign({}, j)),
      };
    }

    // ---------------------------------------------------------------- a tabela, as rodadas e a simulação
    function tabelaDeJogos(D) {
      const n = D.times.length, arr = D.times.map((t, i) => i), jogos = [];
      for (let r = 0; r < n - 1; r++) {
        for (let i = 0; i < n / 2; i++) { const a = arr[i], b = arr[n - 1 - i], casaA = (r + i) % 2 === 0; jogos.push({ r, c: casaA ? a : b, f: casaA ? b : a, gc: 0, gf: 0, feito: false }); }
        arr.splice(1, 0, arr.pop());
      }
      return jogos;
    }
    // sexta, sábado e domingo de cada semana; sexta no horário do futebol de quem trabalha (fora do turno), sábado e domingo à tarde
    const diaDa = (C, k) => C.d0 + Math.floor(k / 3) * 7 + (k % 3);
    const horaDa = (C, k, D) => (k % 3 === 0 ? api.horaDoFutebol() : D.hFds);
    function classificacao(D, C) {
      const L = D.times.map((t, i) => ({ i, k: t.k, j: 0, p: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0 }));
      for (const g of C.jogos) {
        if (!g.feito || g.r > 8) continue;
        const A = L[g.c], B = L[g.f]; A.j++; B.j++; A.gp += g.gc; A.gc += g.gf; B.gp += g.gf; B.gc += g.gc;
        if (g.gc > g.gf) { A.v++; A.p += 3; B.d++; } else if (g.gc < g.gf) { B.v++; B.p += 3; A.d++; } else { A.e++; B.e++; A.p++; B.p++; }
      }
      return L.sort((a, b) => b.p - a.p || b.v - a.v || (b.gp - b.gc) - (a.gp - a.gc) || b.gp - a.gp || a.i - b.i);
    }
    const posicaoNa = (D, C, i) => classificacao(D, C).findIndex((x) => x.i === i) + 1;
    function poder(D, t, semJogador) {
      const s = t.setores, at = s.fwd * 0.6 + s.mid * 0.4, df = s.def * 0.55 + s.gk * 0.45, k = semJogador ? 0.94 : 1;
      return { at: at * k, df: df * k };
    }
    function poisson(l, r) { const L = Math.exp(-l); let k = 0, p = 1; do { k++; p *= r(); } while (p > L && k < 12); return k - 1; }
    function simularPlacar(D, C, g) {
      const r = Math.random, A = D.times[g.c], B = D.times[g.f], ni = nossoI(D);
      const pa = poder(D, A, g.c === ni), pb = poder(D, B, g.f === ni);
      const lam = (at, df, casa) => clampN(1.35 * Math.pow(at / df, 1.8) + (casa ? 0.12 : 0), 0.15, 5.5);
      g.gc = poisson(lam(pa.at, pb.df, true), r); g.gf = poisson(lam(pb.at, pa.df, false), r);
      if (g.r > 8 && g.gc === g.gf) {                                       // mata-mata: pênaltis
        const ganhaA = r() < 0.5 + (A.setores.gk - B.setores.gk) * 0.05, base = 3 + Math.floor(r() * 3);
        g.pen = ganhaA ? [base, base - 1 - Math.floor(r() * 2)] : [base - 1 - Math.floor(r() * 2), base];
      }
      g.feito = true;
    }
    const vencedor = (g) => (g.pen ? (g.pen[0] > g.pen[1] ? g.c : g.f) : g.gc > g.gf ? g.c : g.gc < g.gf ? g.f : g.c);
    const perdedor = (g) => (vencedor(g) === g.c ? g.f : g.c);
    function montarMataMata(D, C) {
      const cl = classificacao(D, C).map((x) => x.i);
      C.jogos.push({ r: 9, c: cl[0], f: cl[3], gc: 0, gf: 0, feito: false, semi: 1 }, { r: 9, c: cl[1], f: cl[2], gc: 0, gf: 0, feito: false, semi: 2 });
      C.semis = cl.slice(0, 4);
    }
    function montarFinal(D, C) {
      const S2 = C.jogos.filter((g) => g.r === 9), a = vencedor(S2[0]), b = vencedor(S2[1]), pa = C.semis.indexOf(a), pb = C.semis.indexOf(b);
      const la = perdedor(S2[0]), lb = perdedor(S2[1]), qa = C.semis.indexOf(la), qb = C.semis.indexOf(lb);
      C.jogos.push({ r: 10, c: pa <= pb ? a : b, f: pa <= pb ? b : a, gc: 0, gf: 0, feito: false, final: true },
        { r: 10, c: qa <= qb ? la : lb, f: qa <= qb ? lb : la, gc: 0, gf: 0, feito: false, terceiro: true });
    }
    const ehNosso = (D, g) => g.c === nossoI(D) || g.f === nossoI(D);
    const adversario = (D, g) => (g.c === nossoI(D) ? g.f : g.c);
    const faseNome = (g) => (g.r === 10 ? (g.terceiro ? T('Disputa do 3º lugar') : T('Final')) : g.r === 9 ? T('Semifinal') : Tf('Rodada {0} de 9', g.r + 1));
    const proxNosso = (D, C) => (C.jogos || []).find((g) => !g.feito && ehNosso(D, g) && g.r >= (C.feitas | 0));
    // o placar do ponto de vista do nosso time
    function placarNosso(D, g) { const casa = g.c === nossoI(D); return { nos: casa ? g.gc : g.gf, eles: casa ? g.gf : g.gc, pen: g.pen ? (casa ? g.pen.slice() : [g.pen[1], g.pen[0]]) : null }; }

    // ---------------------------------------------------------------- o começo de cada torneio (a inscrição é automática)
    function iniciar(id, como) {
      const D = DEF[id], C = camp(id), d = dados();
      let d0 = (d.dia || 1) + 2; while (semanaDe(d0) !== 4) d0++;              // a primeira sexta com pelo menos 2 dias de antecedência
      Object.assign(C, { etapa: 'ativo', inicio: d.dia, como: como || 'msg', d0, jogos: tabelaDeJogos(D), feitas: 0, jogou: 0, faltas: 0, avisos: {}, me: { j: 0, g: 0, a: 0, nota: 0 }, cortado: false });
      void D;
    }
    function jogoDeHoje(id) {
      const D = DEF[id], C = camp(id); if (C.etapa !== 'ativo') return null;
      const g = proxNosso(D, C); if (!g) return null;
      if (g.r > 8 && C.cortado) return null;
      return diaDa(C, g.r) === (dados().dia || 1) ? g : null;
    }
    // (7.6.0) a hora do nosso jogo num dia (a cidade usa para acordar a tempo depois de uma noite de trabalho)
    function horaNoDia(dia) {
      let h = null;
      for (const id of Object.keys(DEF)) {
        const D = DEF[id], C = camp(id); if (C.etapa !== 'ativo') continue;
        const g = (C.jogos || []).find((x) => !x.feito && ehNosso(D, x) && x.r >= (C.feitas | 0) && diaDa(C, x.r) === dia && !(x.r > 8 && C.cortado));
        if (g) { const hh = horaDa(C, g.r, D); if (h == null || hh < h) h = hh; }
      }
      return h;
    }
    function fecharRodadas(id) {
      const D = DEF[id], C = camp(id); if (C.etapa !== 'ativo' || M.cena) return;
      while (C.feitas <= 10) {
        const k = C.feitas; if (agora() < hAbs(diaDa(C, k), horaDa(C, k, D)) + 2) break;
        fecharRodada(id, k, true);
      }
    }
    function fecharRodada(id, k, avisar) {
      const D = DEF[id], C = camp(id), ni = nossoI(D);
      for (const g of C.jogos.filter((x) => x.r === k && !x.feito)) {
        simularPlacar(D, C, g);
        if (ehNosso(D, g) && avisar && !(g.r > 8 && C.cortado)) { C.faltas = (C.faltas | 0) + 1; M.fila.push({ id, tipo: 'faltou', g }); }
      }
      C.feitas = k + 1;
      if (k === 8) {
        montarMataMata(D, C);
        const passou = C.semis.includes(ni);
        if (passou && !(C.jogou | 0)) { C.cortado = true; M.fila.push({ id, tipo: 'cortado' }); }
        else if (!passou && avisar) M.fila.push({ id, tipo: 'fora' });
      } else if (k === 9) montarFinal(D, C);
      else if (k === 10) encerrar(id, avisar);
    }
    function encerrar(id, avisar) {
      const D = DEF[id], C = camp(id), F = C.jogos.find((g) => g.r === 10 && g.final), T3 = C.jogos.find((g) => g.r === 10 && g.terceiro);
      C.campeao = vencedor(F); C.vice = perdedor(F); C.terceiro = vencedor(T3); C.quarto = perdedor(T3); C.etapa = 'fim'; C.fimDia = dados().dia;
      const ni = nossoI(D);
      if (C.campeao === ni && (C.jogou | 0) > 0 && !C.pago) { C.pago = true; const d = dados(); d.fakes = (d.fakes | 0) + D.premio; C.premioPago = D.premio; }
      try { const K = api.carreira()[D.id === 'sin' ? 'sintetico' : 'futsal']; K.torneios = (K.torneios | 0) + 1; if (C.campeao === ni && C.jogou) K.titulos = (K.titulos | 0) + 1; } catch (e) { /* nada */ }
      // o convite para o próximo: pessoalmente na cena do último jogo (quem estava lá) ou por mensagem
      C.proxPendente = true;
      if (avisar) M.fila.push({ id, tipo: 'fim' });
    }
    const colocacao = (C, i) => (C.campeao === i ? 1 : C.vice === i ? 2 : C.terceiro === i ? 3 : C.quarto === i ? 4 : 0);

    // ---------------------------------------------------------------- as mensagens no celular (uma de cada vez, com o jogador livre)
    function textoProximo(D, C) {
      const g = proxNosso(D, C); if (!g || (g.r > 8 && C.cortado)) return '';
      return Tf('O próximo é {0}, dia {1}, às {2}, contra {3}.', T(DIAS[semanaDe(diaDa(C, g.r))]), diaDa(C, g.r), fmt(horaDa(C, g.r, D)), nomeT(D, adversario(D, g)));
    }
    function textoPlacar(D, g) {
      const p = placarNosso(D, g), adv = nomeT(D, adversario(D, g));
      return Tf('Deu {0} x {1} contra {2}.', p.nos, p.eles, adv) + (p.pen ? ' ' + Tf('Nos pênaltis: {0} x {1}.', p.pen[0], p.pen[1]) : '');
    }
    async function tickMensagens(dt) {
      const s = S(); if (!M.fila.length || s.modo !== 'livre' || M.lendo || M.cena || s.ligando) return;
      if ((M.tMsg -= dt) > 0) return;
      M.lendo = true; const it = M.fila.shift(), D = it.id ? DEF[it.id] : null, C = it.id ? camp(it.id) : null, nome = api.nomeJog();
      try {
        if (it.tipo === 'faltou') {
          const prox = textoProximo(D, C);
          await api.mensagemCelular(D.nomeQuem, Tgf(VACILO[(C.faltas - 1 + (D.id === 'fut' ? 3 : 0)) % VACILO.length], nome),
            textoPlacar(D, it.g) + ' ' + (prox ? prox + ' ' + Tg('Você já tá inscrito no time: aparece!') : T('Fica pra próxima, então.')));
        } else if (it.tipo === 'cortado') await api.mensagemCelular(D.nomeQuem, T('O time passou pras semifinais!'), T('Mas como você não veio em nenhum jogo, a gente teve que te cortar das eliminatórias.'));
        else if (it.tipo === 'fora') await api.mensagemCelular(D.nomeQuem, T('Não deu: o time ficou fora das semifinais.'), (C.jogou | 0) ? T('Valeu por jogar com a gente!') : T('E você nem apareceu nos jogos...'));
        else if (it.tipo === 'fim') await mensagemFim(it.id);
        else if (it.tipo === 'convite') await conviteMensagem(it.id);
        else if (it.tipo === 'joao') await mensagemJoao();
        else if (it.tipo === 'hoje') await api.mensagemCelular(D.nomeQuem, Tf('Hoje tem jogo! {0} contra {1}, às {2}.', faseNome(it.g), nomeT(D, adversario(D, it.g)), fmt(horaDa(C, it.g.r, D))), D.id === 'sin' ? T('Chega um pouco antes, no portão do sintético.') : T('Chega um pouco antes, no portão da quadra.'));
      } catch (e) { console.warn('[Torneios] mensagem:', e); }
      M.lendo = false; M.tMsg = 2.5; api.gravar(dados().ponto || 'chegada');
    }
    async function mensagemFim(id) {
      const D = DEF[id], C = camp(id), ni = nossoI(D), pos = colocacao(C, ni), nomeC = nomeT(D, C.campeao);
      const txt = pos === 1 ? T('SOMOS CAMPEÕES DO TORNEIO!') : pos === 2 ? Tf('Acabou o torneio: a gente foi vice. Quem levou foi {0}.', nomeC) : pos === 3 ? Tf('Acabou o torneio: ficamos em 3º lugar. Quem levou foi {0}.', nomeC)
        : pos === 4 ? Tf('Acabou o torneio: ficamos em 4º lugar. Quem levou foi {0}.', nomeC) : Tf('Acabou o torneio. Quem levou foi {0}.', nomeC);
      await api.mensagemCelular(D.nomeQuem, txt, C.premioPago ? Tf('O prêmio de {0} fakes já tá na sua conta!', C.premioPago) : (C.jogou | 0) ? T('Valeu por jogar com a gente!') : '');
      if (C.premioPago) try { api.somDinheiro(); api.mostrarDinheiro(); } catch (e) { /* nada */ }
    }

    // ---------------------------------------------------------------- os convites
    //   1) o João (duas semanas depois do 1º racha), por mensagem, com a frase do desempenho nos rachas
    function desempenhoRachas() {
      let C = null; try { C = api.carreira().sintetico; } catch (e) { C = null; }
      if (!C || !C.j) return 'ok';
      const media = C.nota / C.j, ga = ((C.g | 0) + (C.a | 0)) / C.j;
      if (media >= 8 || ga >= 1.2) return 'craque';
      if (media >= 6.8 || ga >= 0.5) return 'bem';
      return 'mal';
    }
    async function mensagemJoao() {
      const C = camp('sin'), nome = api.nomeJog(), D = DEF.sin, d0 = diaDa(C, 0), ev = desempenhoRachas();
      const abre = ev === 'craque' ? Tf('{0}, vai ter um torneio no sintético e eu quero você no meu time! Você foi muito craque nos rachas, não tem como ficar de fora.', nome)
        : ev === 'bem' ? Tf('{0}, vai ter um torneio no sintético e eu quero você no meu time! Você mandou bem nos rachas.', nome)
        : Tf('{0}, vai ter um torneio no sintético e eu quero você no meu time! Mesmo os rachas não tendo sido os melhores, eu confio em você.', nome);
      await api.mensagemCelular(T('João'), abre, Tf('Já te coloquei na lista! Dez times, três jogos por semana. O primeiro é sexta, dia {0}, às {1}, contra {2}.', d0, fmt(horaDa(C, 0, D)), nomeT(D, adversario(D, proxNosso(D, C)))));
      try { api.aviso(Tgf('Você entrou no {0}!', T(D.nome))); setTimeout(() => { try { api.aviso(''); } catch (e) { /* nada */ } }, 3500); } catch (e) { /* nada */ }
    }
    //   2) e 3) quem chama para o próximo torneio, por mensagem (quem não estava no último jogo)
    async function conviteMensagem(id) {
      const C = camp(id), nome = api.nomeJog(), conhece = (C.jogou | 0) > 0;
      if (id === 'sin') {                                                 // o Biel chama para o futsal
        iniciar('fut', 'msg'); const D = DEF.fut, F = camp('fut');
        await api.mensagemCelular('Biel', conhece ? Tf('Fala, {0}! Aqui é o Biel. Vai ter um torneio de futsal lá na quadra e você tá no meu time!', nome) : Tf('Oi, {0}! Aqui é o Biel, da quadra de futsal. O João me passou seu número: vai ter um torneio de futsal e você tá no meu time!', nome),
          Tf('Mesmas regras do torneio do sintético. O campeão leva {0} fakes por jogador. O primeiro jogo é sexta, dia {1}, às {2}, contra {3}.', D.premio, diaDa(F, 0), fmt(horaDa(F, 0, D)), nomeT(D, adversario(D, proxNosso(D, F)))));
        try { const f = api.fsal(); f.conheceu = true; } catch (e) { /* nada */ }
      } else {                                                            // o Rafa chama para a várzea
        inscreverVarzea();
        await api.mensagemCelular('Rafa', conhece ? Tf('{0}, é o Rafa! Vai ter o campeonato de várzea no campo e eu te coloquei no time do Peladão FC!', nome) : Tf('Oi, {0}! Aqui é o Rafa. O João me passou seu número: vai ter o campeonato de várzea e eu te coloquei no time do Peladão FC!', nome),
          textoVarzea());
      }
      C.proxFeito = true;
    }
    function inscreverVarzea() {
      const s = S(); try { if (s.varzea && s.varzea._fns && s.varzea._fns.camp().etapa !== 'ativo') { s.varzea._fns.iniciarCampeonato(); const V = s.varzea._fns.camp(); V.convite = 'futsal'; } } catch (e) { console.warn('[Torneios] várzea:', e); }
    }
    function textoVarzea() {
      const s = S(); let V = null; try { V = s.varzea._fns.camp(); } catch (e) { V = null; }
      const d0 = V && V.d0 ? V.d0 : (dados().dia || 1) + 1;
      return Tf('O primeiro jogo é no sábado, dia {0}, às {1}. Chega uma hora antes: o vestiário fica embaixo do campo, o Seu Damião vai estar te esperando.', d0, fmt(14));
    }

    // ---------------------------------------------------------------- o campo de cada torneio: um sistema de coordenadas "de pé"
    //   u: ao longo do campo (de gol a gol; o nosso time aquece no lado u < 0), v: atravessado (a câmera da entrada fica no lado v < 0).
    function geo(id) {
      const s = S();
      if (id === 'sin') {
        const F = s.societys && s.societys[1]; if (!F) return null;
        const r = F.r, cx = F.cx, cz = F.cz;
        return { id, r, cx, cz, U: 13.5, V: 9, w: (u, v) => [cx + v, cz + u], l: (x, z) => [z - cz, x - cx], yawV: Math.PI, out: { x: F.gate.out.x, z: F.gate.out.z }, dentro: { x: F.gate.in.x, z: F.gate.in.z } };
      }
      const r = api.FUTSAL, cx = (r.x0 + r.x1) / 2, cz = (r.z0 + r.z1) / 2;
      return { id, r, cx, cz, U: 11, V: 6.5, w: (u, v) => [cx + u, cz + v], l: (x, z) => [x - cx, z - cz], yawV: Math.PI / 2, out: { x: -39, z: r.z0 - 1.0 }, dentro: { x: -39, z: r.z0 + 1.2 } };
    }
    const yawPara = (ax, az, bx, bz) => Math.atan2(-(bz - az), bx - ax);
    // os lugares da torcida em volta da grade (e por onde cada um chega)
    function vagas(id) {
      const out = [], N = Math.PI / 2, Sx = -Math.PI / 2, L = 0, O = Math.PI;
      if (id === 'sin') {
        const sai = { x: 113.25, z: 27.4 }, saiL = { x: 124.4, z: 47.5 };
        for (const x of [93.5, 96, 98.5, 101, 103.5, 106, 108.5]) out.push({ sai, rota: [[x, 30.25]], x, z: 30.25, yaw: Sx });
        for (const z of [36, 41, 46, 51, 56, 61]) out.push({ sai, rota: [[91, 29.7], [91, z]], x: 91, z, yaw: L });
        for (const z of [44, 50, 56, 62]) out.push({ sai: saiL, rota: [[118.35, z]], x: 118.35, z, yaw: O });
        for (const x of [95, 99, 106, 110]) out.push({ sai, rota: [[91, 29.7], [91, 66.85], [x, 66.85]], x, z: 66.85, yaw: N });
      } else {
        const oe = { x: -54.6, z: 10.9 }, le = { x: -23.6, z: 10.95 };
        for (const x of [-51, -48, -45]) out.push({ sai: oe, rota: [[x, 11.05]], x, z: 11.05, yaw: Sx });
        for (const x of [-33, -30, -27]) out.push({ sai: le, rota: [[x, 11.05]], x, z: 11.05, yaw: Sx });
        for (const z of [15, 19, 23, 27]) out.push({ sai: oe, rota: [[-54.1, 11.4], [-54.1, z]], x: -54.1, z, yaw: L });
        for (const x of [-50, -46, -42, -38, -34, -29]) out.push({ sai: oe, rota: [[-54.1, 11.4], [-54.1, 30.75], [x, 30.75]], x, z: 30.75, yaw: N });
        for (const z of [21, 25, 28]) out.push({ sai: le, rota: [[-24.3, 12], [-24.3, z]], x: -24.3, z, yaw: O });
      }
      return out;
    }

    // ---------------------------------------------------------------- A TORCIDA (chega de 2 h a 1 h antes e espera em volta da grade)
    function tickTorcida(id) {
      const s = S(), C = camp(id), D = DEF[id];
      const g = C.etapa === 'ativo' ? (C.jogos || []).find((x) => !x.feito && x.r >= (C.feitas | 0) && diaDa(C, x.r) === (dados().dia || 1)) : null;   // jogo de qualquer time hoje: a torcida vem
      if (s.dentro || M.cena) { if (M.torc[id].length && s.dentro) limparTorcida(id); return; }
      if (!g) { if (M.torc[id].length) dispersar(id); return; }
      const H = hAbs(diaDa(C, g.r), horaDa(C, g.r, D)), t = agora();
      if (M.torcK[id] !== diaDa(C, g.r)) {
        limparTorcida(id); M.torcK[id] = diaDa(C, g.r);
        M.plano[id] = vagas(id).map((v, i) => ({ v, cheg: H - 2 + ((i * 7919) % 97) / 97, fem: Math.random() < 0.45, A: null, fase: 'fora' }));
      }
      if (t >= H + 2.5) { dispersar(id); return; }
      let novos = 0;
      for (const p of M.plano[id] || []) {
        if (p.fase !== 'fora' || t < p.cheg || novos >= 2) continue;
        novos++;
        const A = api.criarPessoa(s.f2, Math.random, p.fem); A.tipo = 'cena'; s.npcs.push(A); p.A = A; M.torc[id].push(p);
        const passou = (t - p.cheg) / api.H_POR_S;
        const dist = p.v.rota.reduce((acc, q, i) => acc + Math.hypot(q[0] - (i ? p.v.rota[i - 1][0] : p.v.sai.x), q[1] - (i ? p.v.rota[i - 1][1] : p.v.sai.z)), 0);
        if (passou > dist / 1.2 + 2) noLugar(p);
        else { A.x = p.v.sai.x; A.z = p.v.sai.z; A.y = api.altura(A.x, A.z); p.fase = 'indo'; api.andar(A, p.v.rota.map((q) => q.slice()), 1.2).then(() => { if (p.A === A && p.fase === 'indo') noLugar(p); }); }
      }
    }
    function noLugar(p) { const A = p.A, v = p.v; A.rota = null; A.andando = false; A.x = v.x; A.z = v.z; A.y = api.altura(A.x, A.z); A.yaw = A.yawAlvo = v.yaw; p.fase = 'la'; }
    function dispersar(id) {
      for (const p of M.torc[id]) {
        if (p.fase === 'saindo' || !p.A) continue;
        const A = p.A, v = p.v; p.fase = 'saindo';
        const volta = v.rota.slice(0, -1).reverse().concat([[v.sai.x, v.sai.z]]);
        api.andar(A, volta, 1.3).then(() => { try { if (api.irEmbora) api.irEmbora(A, null, 1.3); else api.descartarPessoa(A); } catch (e) { try { api.descartarPessoa(A); } catch (e2) { /* nada */ } } p.A = null; M.torc[id] = M.torc[id].filter((q) => q !== p); });
      }
      if (M.plano[id]) for (const p of M.plano[id]) if (p.fase === 'fora') p.fase = 'nao';
    }
    function limparTorcida(id) {
      for (const p of M.torc[id]) if (p.A) try { api.descartarPessoa(p.A); } catch (e) { /* nada */ }
      M.torc[id] = []; M.torcK[id] = null; M.plano[id] = null;
    }

    // ---------------------------------------------------------------- O AQUECIMENTO: meia hora antes, os dois times correndo em volta de um ponto do seu lado
    const PONTOS_AQ = [[-0.86, -0.45], [-0.62, 0.42], [-0.4, -0.1], [-0.25, 0.55], [-0.7, 0.05], [-0.33, -0.6]];
    function jogadoresDoJogo(D, g) {                                         // [nosso (sem o jogador), adversário]: { nome, ap, gk, fem }
      const ni = nossoI(D), adv = adversario(D, g), L = [];
      for (const [ti, nosso] of [[ni, true], [adv, false]]) {
        const t = D.times[ti], tt = titulares(D, t).filter((x) => !x.voce);
        L.push(tt.map((x) => ({ nome: x.nome, ap: x.ap, gk: x.pos === 'GK', fem: x.ap && x.ap.genero === 'F', uni: t.uni, nosso })));
      }
      return L;
    }
    function criarJogadorCena(x, j) { const A = api.criarNPCFixo(j.ap, j.fem, 7, coresDe(j.uni, j.gk)); A.tipo = 'cena'; A.x = x[0]; A.z = x[1]; A.y = api.altura(A.x, A.z); return A; }
    function tickAquecimento(id, dt) {
      const s = S(), D = DEF[id], g = jogoDeHoje(id), G = geo(id);
      const H = g ? horaDa(camp(id), g.r, D) : 0, h = dados().hora;
      const quer = !!g && !s.dentro && !M.cena && h >= H - 0.6 && h < H + 0.5 && G;
      if (!quer) { if (M.aq[id] && !M.cena) tirarAquecimento(id); return; }
      if (!M.aq[id]) {
        const L = jogadoresDoJogo(D, g), atores = [];
        L.forEach((lista, lado) => lista.forEach((j, i) => {
          const [pu, pv] = PONTOS_AQ[i % PONTOS_AQ.length], u = (lado ? -pu : pu) * G.U, v = (lado ? -pv : pv) * G.V;
          const A = criarJogadorCena(G.w(u, v), j); A.aq = { u, v, ang: Math.random() * 6.28, raio: 0.8 + (i % 3) * 0.35, vel: 0.9 + Math.random() * 0.5, parado: i === 0 ? 1 : 0 };
          atores.push(A);
        }));
        M.aq[id] = { g, atores };
      }
      for (const A of M.aq[id].atores) {                                    // trotando em volta do ponto (o goleiro fica no lugar, se alongando)
        const q = A.aq; if (A.rota) continue;
        if (q.parado) { const [x, z] = G.w(q.u, q.v); A.x = x; A.z = z; A.andando = false; continue; }
        q.ang += dt * q.vel / q.raio;
        const [x, z] = G.w(q.u + Math.cos(q.ang) * q.raio, q.v + Math.sin(q.ang) * q.raio), [x2, z2] = G.w(q.u + Math.cos(q.ang + 0.1) * q.raio, q.v + Math.sin(q.ang + 0.1) * q.raio);
        A.x = x; A.z = z; A.yaw = A.yawAlvo = yawPara(x, z, x2, z2); A.andando = true; A.correndo = false; A.vel = q.vel;
      }
    }
    function tirarAquecimento(id) {
      const Q = M.aq[id]; if (!Q) return; M.aq[id] = null;
      for (const A of Q.atores) try { api.descartarPessoa(A); } catch (e) { /* nada */ }
    }

    // ---------------------------------------------------------------- as missões do dia (todo jogo do torneio é missão)
    function missao() {
      const out = [];
      for (const id of ['sin', 'fut']) {
        const g = jogoDeHoje(id); if (!g) continue;
        const D = DEF[id], C = camp(id), H = horaDa(C, g.r, D); if (dados().hora > H + 0.5) continue;
        out.push(Tf('Missão: {0} ({1}): {2} x {3} às {4}, {5}.', T(D.nome), faseNome(g), nomeT(D, g.c), nomeT(D, g.f), fmt(H), id === 'sin' ? T('no sintético Doutor Bryan') : T('na quadra de futsal')));
      }
      return out.join('\n');
    }
    function avisoDoDia(id) {
      const s = S(), C = camp(id), g = jogoDeHoje(id), d = dados(); if (!g || s.modo !== 'livre' || M.cena) return;
      const D = DEF[id], H = horaDa(C, g.r, D), ch = 'd' + d.dia;
      if (d.hora >= 7 && d.hora < H + 0.5 && !C.avisos[ch]) {
        C.avisos[ch] = true; M.fila.push({ id, tipo: 'hoje', g });
        try { api.mostrarMissao(); } catch (e) { /* nada */ }
        const G = geo(id); if (G && !s.dentro && !s.marca) api.definirMarca(G.out.x, G.out.z);
      }
    }

    // ---------------------------------------------------------------- tick e alvos
    let tLento = 0;
    function tick(dt) {
      const s = S(); if (!s || !s.dados) return;
      if ((tLento -= dt) <= 0) {
        tLento = 0.5;
        if (!M.cena) { fecharRodadas('sin'); fecharRodadas('fut'); }
        checarConvites();
        avisoDoDia('sin'); avisoDoDia('fut');
      }
      for (const id of ['sin', 'fut']) { try { tickTorcida(id); tickAquecimento(id, dt); } catch (e) { if (!M.erro) { M.erro = true; console.warn('[Torneios]', e); } } }
      tickMensagens(dt);
    }
    // quando cada convite acontece
    function checarConvites() {
      const s = S(), d = dados(), f = api.fut(), C1 = camp('sin'), C2 = camp('fut');
      if (s.modo !== 'livre' || M.cena) return;
      let V = null; try { V = s.varzea && s.varzea._fns ? s.varzea._fns.camp() : null; } catch (e) { V = null; }
      const varzeaComecou = !!(V && V.etapa !== 'nada' && V.etapa !== 'recusou') || !!(d.pro && d.pro.clube);
      // 1) o João: duas semanas depois do 1º racha (saves antigos: a conta começa agora)
      if (C1.etapa === 'nada' && (f.jogos | 0) > 0 && !varzeaComecou) {
        if (!f.primeiroDia) f.primeiroDia = d.dia;
        if ((d.dia || 1) >= f.primeiroDia + PRIMEIRO_CONVITE && d.hora >= 8 && d.hora < 21) { iniciar('sin', 'msg'); M.fila.push({ tipo: 'joao' }); api.gravar(d.ponto || 'chegada'); }
      }
      // 2) e 3) o próximo torneio: quem não estava no último jogo recebe por mensagem
      for (const [id, C] of [['sin', C1], ['fut', C2]]) {
        if (C.etapa === 'fim' && C.proxPendente && !C.proxFeito && !M.fila.some((x) => x.tipo === 'convite' && x.id === id)) {
          if (id === 'fut' && varzeaComecou) { C.proxFeito = true; continue; }
          if (id === 'sin' && C2.etapa !== 'nada') { C.proxFeito = true; continue; }
          M.fila.push({ id, tipo: 'convite' });
        }
      }
    }
    function alvos(v) {
      const s = S(); if (s.dentro || M.cena) return;
      for (const id of ['sin', 'fut']) {
        const g = jogoDeHoje(id); if (!g) continue;
        const D = DEF[id], C = camp(id), H = horaDa(C, g.r, D), h = dados().hora, G = geo(id); if (!G) continue;
        if (h >= H - 3 && h < H - 1) v.push({ x: G.out.x, z: G.out.z, r: 2.2, txt: Tf('{0}: jogo às {1}', T(D.nome), fmt(H)), fn: async () => {}, y: 2.6 });
        else if (h >= H - 1 && h <= H + 0.5) v.push({ x: G.out.x, z: G.out.z, r: 2.4, txt: Tf('Jogar o torneio ({0} x {1})', D.times[g.c].sigla, D.times[g.f].sigla), fn: () => diaDeJogo(id, g), y: 2.6, pri: true });
      }
    }
    // a cidade pergunta antes de começar outro jogo (racha, futsal) no mesmo horário
    const ocupado = () => M.cena;
    // a roda de bola da cidade no campo (cidade.js, rodaAberta): no dia de jogo, de 2 h e meia antes até 2 h e meia depois, o campo é do torneio
    function campoOcupado(nomeRoda) {
      const id = nomeRoda === 'sintetico' ? 'sin' : nomeRoda === 'quadra' ? 'fut' : null; if (!id) return false;
      if (M.cena) return true;
      const C = camp(id); if (C.etapa !== 'ativo') return false;
      const D = DEF[id], dia = dados().dia || 1, g = (C.jogos || []).find((x) => !x.feito && x.r >= (C.feitas | 0) && diaDa(C, x.r) === dia);
      return !!g && Math.abs(dados().hora - horaDa(C, g.r, D)) < 2.5;
    }

    // ---------------------------------------------------------------- O DIA DE JOGO: a entrada, a moeda, a pré-partida, a partida e a conversa depois
    async function diaDeJogo(id, g) {
      const s = S(), J = s.jog, d = dados(), D = DEF[id], C = camp(id), G = geo(id), H = horaDa(C, g.r, D); if (!G) return;
      M.cena = true; C.jogandoK = g.r; const atores = [];
      const trava = setInterval(() => { if (s.modo === 'livre') s.modo = 'cena'; try { const UI = api.UI(); if (UI && UI.ctl && !UI.ctl.hidden) UI.ctl.hidden = true; if (UI && UI.hud && !UI.hud.hidden) UI.hud.hidden = true; } catch (e) { /* nada */ } }, 120);   // sem controle, relógio nem ligação no meio da cena
      try { api.recolherMissao(); api.definirMarca(null); } catch (e) { /* nada */ }
      let r = null;
      try {
        await api.preto(true, 500);
        tirarAquecimento(id);
        const ni = nossoI(D), adv = adversario(D, g), tA = D.times[adv], tN = D.times[ni];
        // 1) a ENTRADA: um de cada vez, os dois times entram pelo portão e se perfilam no meio do campo, de frente para a câmera; o juiz
        //    no meio das duas filas (o jogador, de uniforme, é o primeiro do nosso time, do lado do juiz). Os goleiros ficam na ponta.
        const L = jogadoresDoJogo(D, g).map((l) => l.filter((j) => !j.gk).concat(l.filter((j) => j.gk))), fem0 = fem(), ESP = 1.1;
        const lugarDe = (lado, i) => G.w(lado ? 1.0 + i * ESP : -1.0 - i * ESP, 0);
        const ref = api.criarNPCFixo(api.apFixa(5353, 'M'), false, 7, ['#1c1c1f', '#1c1c1f', '#f2c230', '#1c1c1f']); ref.tipo = 'cena'; atores.push(ref);
        { const [x, z] = G.w(0, 0); ref.x = x; ref.z = z; ref.y = api.altura(x, z); ref.yaw = ref.yawAlvo = G.yawV; }
        s.falantesExtra = s.falantesExtra || {}; s.falantesExtra.arbitro = { A: ref, nome: T('Juiz'), voz: 1 };
        s.meus.delete(J.m); J.m.raiz.visible = false; if (J.anel) J.anel.visible = false;
        // de longe: dá para ver os dois times entrando (na quadra: num canto, por dentro da grade, longe do portão)
        const [cx0, cz0] = id === 'sin' ? G.w(-1.5, -12) : G.w(7, -8.2), [tx0, tz0] = id === 'sin' ? G.w(-1.5, 0) : G.w(-0.5, -1);
        api.camCena({ px: cx0, py: id === 'sin' ? 4.4 : 5.4, pz: cz0, tx: tx0, ty: 0.6, tz: tz0 });
        await api.preto(false, 500);
        const fila = [{ lado: 0, i: 0, j: { ap: api.aparenciaNaPartida(), fem: fem0, gk: posicaoJog() === 'GK', uni: tN.uni }, voce: true }];
        const n = Math.max(L[0].length + 1, L[1].length);
        for (let k = 0; k < n; k++) { if (k < L[1].length) fila.push({ lado: 1, i: k, j: L[1][k] }); if (k < L[0].length) fila.push({ lado: 0, i: k + 1, j: L[0][k] }); }
        let U0 = null; const outros = [], chegadas = [];
        for (const q of fila) {                                            // sai do portão a cada 0,45 s (ninguém nasce dentro do outro)
          const A = criarJogadorCena([G.dentro.x, G.dentro.z], q.j); atores.push(A); if (q.voce) U0 = A; else if (q.lado) outros.push(A);
          if (q.voce) s.falantesExtra.jog = { A, nome: api.nomeJog(), voz: typeof PERSONAGEM.voz === 'number' ? PERSONAGEM.voz : 2 };
          const alvo = lugarDe(q.lado, q.i), [au] = G.l(alvo[0], alvo[1]), [gu, gv] = G.l(G.dentro.x, G.dentro.z);
          const ponta = 1.0 + (n + 1) * ESP + 2.5;                           // um pouco depois da ponta da fila
          const rota = (gv > -0.5 ? [G.w(gu < 0 ? -ponta : ponta, -3)] : []).concat([G.w(au, -1.4), alvo]);   // pela frente da fila (o portão atrás dela: dá a volta pela ponta)
          A.correndo = true;                                               // entram trotando
          chegadas.push(api.andar(A, rota, 3.2).then(() => { A.yaw = A.yawAlvo = G.yawV; A.andando = false; A.correndo = false; }));
          await api.esperar(340);
        }
        await Promise.all(chegadas);
        const [cx2, cz2] = G.w(0, -7.6), [tx2, tz2] = G.w(0, 0);             // perfilados: a câmera chega perto
        api.camCena({ px: cx2, py: 3.2, pz: cz2, tx: tx2, ty: 0.9, tz: tz2 });
        await api.esperar(700);
        // 2) a MOEDA: o juiz vem para a frente e chama os capitães (o jogador e o primeiro da linha do outro time)
        const cap = outros[0];
        await api.fala('arbitro', T('Capitães, aqui na frente! Vamos tirar no cara ou coroa.'));
        Dialogo.esconder();
        const pr = G.w(0, -1.35), pu = G.w(-0.8, -1.85), pc = G.w(0.8, -1.85);
        await Promise.all([api.andar(ref, [pr], 1.3), api.andar(U0, [pu], 1.3), api.andar(cap, [pc], 1.3)]);
        ref.yaw = ref.yawAlvo = G.yawV; U0.yaw = U0.yawAlvo = yawPara(U0.x, U0.z, pr[0], pr[1]); cap.yaw = cap.yawAlvo = yawPara(cap.x, cap.z, pr[0], pr[1]);
        const [cx1, cz1] = G.w(0, -6.4), [tx1, tz1] = G.w(0, -1.4);
        api.camCena({ px: cx1, py: 1.8, pz: cz1, tx: tx1, ty: 1.25, tz: tz1 });
        const qq = T('Cara ou coroa?');
        await api.fala('arbitro', qq);
        const esc = await Escolha.mostrar(qq, [T('Cara!'), T('Coroa!')]);
        await api.fala('jog', esc === 0 ? T('Cara!') : T('Coroa!')); Dialogo.esconder();
        const deu = Math.random() < 0.5 ? 0 : 1;
        await jogarMoeda(ref, G, G.w(0, -1.72));
        const ganhou = deu === esc;
        await api.fala('arbitro', (deu === 0 ? T('Deu cara!') : T('Deu coroa!')) + ' ' + (ganhou ? T('A saída é nossa!') : Tf('A escolha do lado fica com {0}.', T(tA.nome))));
        if (ganhou) await api.fala('jog', pk([T('Boa! Vamos pra cima!'), T('Começou bem!')]));
        Dialogo.esconder();
        await api.esperar(300);
        await api.preto(true, 400);
        for (const A of atores) try { api.descartarPessoa(A); } catch (e) { /* nada */ }
        atores.length = 0; delete s.falantesExtra.arbitro; delete s.falantesExtra.jog;
        s.meus.add(J.m); J.m.raiz.visible = true;
        // 3) a pré-partida e a partida (5 minutos; 1 h no relógio da cidade, a partir do horário marcado)
        await telaPrePartida(id, g);
        if (d.hora < H) api.tickHorario((H - d.hora) / api.H_POR_S);
        r = await jogarPartida(id, g);
        api.tickHorario(1 / api.H_POR_S);
        const res = registrarJogo(id, g, r);
        await depoisDoJogo(id, g, res);
      } catch (e) {
        console.error('[Torneios] dia de jogo:', e);
      } finally {
        for (const A of atores) try { api.descartarPessoa(A); } catch (e) { /* nada */ }
        if (s.falantesExtra) { delete s.falantesExtra.arbitro; delete s.falantesExtra.jog; delete s.falantesExtra[D.quem]; delete s.falantesExtra.rafa; }
        s.meus.add(J.m); J.m.raiz.visible = true;
        clearInterval(trava); s.camCena = null; M.cena = false; C.jogandoK = null; try { const UI = api.UI(); if (UI && UI.hud) UI.hud.hidden = false; } catch (e) { /* nada */ }
        try { Dialogo.esconder(); } catch (e) { /* nada */ }
        await api.preto(false, 500);
        if (s.ativo && s.modo === 'cena') api.liberar();
        api.gravar('chegada');
      }
    }
    // a moeda: sobe da mão do juiz girando, cai de volta na mão e ele vira na outra mão
    async function jogarMoeda(ref, G, onde) {
      const g = new THREE.CylinderGeometry(0.1, 0.1, 0.016, 16), m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ color: 0xe0b84a, emissive: 0x3a2a08 }));
      const s = S(), [x0, z0] = onde, y0 = 1.18;
      m.position.set(x0, y0, z0); s.grupo.add(m);
      try { ref.m.bracoD.rotation.z = 1.2; } catch (e) { /* nada */ }
      const T0 = performance.now(), dur = 1100;
      await new Promise((ok) => {
        const passo = () => {
          const k = Math.min(1, (performance.now() - T0) / dur);
          m.position.y = y0 + Math.sin(k * Math.PI) * 1.1; m.rotation.x = k * Math.PI * 9; m.rotation.z = k * 0.6;
          if (k < 1) requestAnimationFrame(passo); else ok();
        };
        requestAnimationFrame(passo);
      });
      m.rotation.set(0, 0, 0);
      await api.esperar(450);
      s.grupo.remove(m); g.dispose(); m.material.dispose();
      try { ref.m.bracoD.rotation.z = 0; } catch (e) { /* nada */ }
    }
    function cfgPartida(id, g) {
      const D = DEF[id], s = S(), ni = nossoI(D), adv = adversario(D, g), casa = g.c === ni;
      const eu = { nome: (typeof PERSONAGEM !== 'undefined' && (PERSONAGEM.apelido || PERSONAGEM.nome)) || T('Você'), posicao: posicaoJog(), numero: PERSONAGEM.numero, aparencia: api.aparenciaNaPartida() };
      const h = dados().hora, horario = h >= 6 && h < 15.5 ? 'dia' : h >= 15.5 && h < 18.4 ? 'tarde' : 'noite';
      const clima = s.clima && (s.clima.estado === 'chuva' || s.clima.chuva > 0.35) ? 'chuva' : 'seco', mm = g.r > 8;
      return { campo: D.campo, times: [timeMotor(D, D.times[ni]), timeMotor(D, D.times[adv])], mandante: casa ? 0 : 1,
        competicao: { tipo: mm ? 'copa' : 'amistoso', nome: T(D.nome), rodada: mm ? 0 : g.r + 1, fase: mm ? (g.r === 10 ? (g.terceiro ? '3º lugar' : 'Final') : 'Semifinal') : '', mataMata: mm, jogo: 'unico', placarIda: null },
        dificuldade: 'normal', clima, gramado: 'baixo', horario, duracao: 300, usuario: eu, atributos: api.atributosJogador(), taticas: [null, null], formacoes: [null, null] };
    }
    async function jogarPartida(id, g) {
      const D = DEF[id], cfg = cfgPartida(id, g);
      api.sairParaPartida();
      let r = null;
      try { r = await Historia.partida({ cfg, aviso: Tf('{0}: {1} x {2}', faseNome(g), nomeT(D, g.c), nomeT(D, g.f)), aoPronto: () => api.preto(false, 800) }); }
      catch (e) { console.error(e); try { Historia.abortar(); } catch (e2) { /* nada */ } }
      await api.preto(true, 900);
      api.voltarDaPartida();
      try { Historia.confirmarResultado(); } catch (e) { /* nada */ }
      return r;
    }
    function registrarJogo(id, g, r) {
      const D = DEF[id], C = camp(id), d = dados(), ni = nossoI(D), casa = g.c === ni;
      if (!r || !r.placar) { simularPlacar(D, C, g); fecharRodada(id, g.r, false); return { semJogo: true }; }
      const [nos, eles] = r.placar; g.gc = casa ? nos : eles; g.gf = casa ? eles : nos;
      if (r.penaltis) g.pen = casa ? r.penaltis.slice() : [r.penaltis[1], r.penaltis[0]];
      g.feito = true; g.comVoce = true;
      C.jogou = (C.jogou | 0) + 1;
      const st = r.estatisticas || {}; C.me.j++; C.me.g += r.gols | 0; C.me.a += st.assist | 0; C.me.nota = r1(C.me.nota + (+r.nota || 0));
      d.partidas = (d.partidas || []).slice(-29);
      d.partidas.push({ local: id === 'sin' ? 'sintetico' : 'futsal', torneio: id, dia: d.dia, hora: Math.round(d.hora * 100) / 100, placar: r.placar, gols: r.gols | 0, nota: r.nota || 0, bom: !!r.bom, venceu: !!r.venceu, chutes: st.chutes | 0, noAlvo: st.noAlvo | 0, passesOk: st.passesOk | 0 });
      try { api.carreira(); api.registrarCarreira(id === 'sin' ? 'sintetico' : 'futsal', r); } catch (e) { console.warn('[Torneios] carreira:', e); }
      d.precisaBanho = true;
      fecharRodada(id, g.r, false);
      return { r, nos, eles, av: api.avaliarJogo(r) };
    }
    // na saída: quem chamou (o João no sintético, o Biel no futsal) comenta o jogo, a tabela e o próximo jogo; no último jogo do time
    //   vem o fim do torneio e o convite para o próximo (o Biel no fim do sintético; o Rafa, que joga no time do Biel, no fim do futsal)
    async function depoisDoJogo(id, g, R) {
      const s = S(), J = s.jog, D = DEF[id], C = camp(id), G = geo(id), atores = [];
      J.sentado = false; J.rota = null; J.x = G.out.x; J.z = G.out.z - (id === 'sin' ? 0.6 : 0.7); J.y = api.altura(J.x, J.z);
      const quemAp = id === 'sin' ? (typeof HIST !== 'undefined' ? Object.assign({}, HIST.joao, { barba: 0 }) : api.apFixa(1, 'M')) : api.apBiel();
      const Q = api.criarNPCFixo(quemAp, false, 7, coresDe(D.times[nossoI(D)].uni, false)); Q.tipo = 'cena'; atores.push(Q);
      Q.x = J.x + 1.35; Q.z = J.z - 0.2; Q.y = api.altura(Q.x, Q.z); Q.yaw = Q.yawAlvo = yawPara(Q.x, Q.z, J.x, J.z);
      J.yaw = J.yawAlvo = yawPara(J.x, J.z, Q.x, Q.z);
      s.falantesExtra = s.falantesExtra || {}; s.falantesExtra[D.quem] = { A: Q, nome: D.nomeQuem, voz: id === 'sin' ? 3 : 2 };
      let conv = null;                                                      // quem faz o convite para o próximo, na mesma cena
      if (C.etapa === 'fim' && !C.proxFeito) {
        if (id === 'sin' && camp('fut').etapa === 'nada') { conv = api.criarNPCFixo(api.apBiel(), false, 0, ['#1f7a4d', '#1c1c1f', '#f2f2ee', '#f2f2ee']); conv.chave = 'biel'; conv.nome = 'Biel'; }
        else if (id === 'fut') { conv = api.criarNPCFixo(api.apFixa(6161, 'M'), false, 7, coresDe(D.times[nossoI(D)].uni, false)); conv.chave = 'rafa'; conv.nome = 'Rafa'; }
        if (conv) { conv.tipo = 'cena'; atores.push(conv); conv.x = J.x - 1.3; conv.z = J.z - 0.3; conv.y = api.altura(conv.x, conv.z); conv.yaw = conv.yawAlvo = yawPara(conv.x, conv.z, J.x, J.z); s.falantesExtra[conv.chave] = { A: conv, nome: conv.nome, voz: conv.chave === 'biel' ? 2 : 3 }; }
      }
      const [px, pz] = [J.x + 0.2, J.z - 4.6];
      api.camCena({ px, py: 1.9, pz, tx: J.x + 0.1, ty: 0.95, tz: J.z + 0.3 });
      try { if (typeof Musica !== 'undefined') Musica.tocar('jazz'); } catch (e) { /* nada */ }
      await api.preto(false, 700);
      const fq = (t) => api.fala(D.quem, t), nome = api.nomeJog();
      try {
        if (R.semJogo) { await fq(T('O jogo acabou sem você... a gente segurou como deu.')); return; }
        const { nos, eles, av } = R, adv = nomeT(D, adversario(D, g)), ganhou = g.pen ? vencedor(g) === nossoI(D) : nos > eles, empate = !g.pen && nos === eles;
        if (g.pen) await fq(ganhou ? Tf('Nos pênaltis! {0} a {1} no tempo normal e a gente passou!', nos, eles) : Tf('{0} a {1} e a gente perdeu nos pênaltis... que pena.', nos, eles));
        else if (ganhou) await fq(pk([Tf('{0} a {1} contra {2}! Que vitória!', nos, eles, adv), Tf('Ganhamos! {0} a {1}!', nos, eles)]));
        else if (empate) await fq(Tf('{0} a {1}. Empate: dava pra mais, mas tá valendo.', nos, eles));
        else await fq(Tf('{0} a {1} pra eles... bola pra frente.', nos, eles));
        await fq(av === 'craque' ? Tgf('E você, {0}? Jogou demais! Foi o melhor em campo.', nome) : av === 'bem' ? T('Você mandou muito bem hoje!') : av === 'ok' ? T('Você jogou direitinho. Dá pra crescer mais.') : T('Hoje não foi o seu dia, mas o time precisa de você no próximo.'));
        if (g.r <= 8) {
          const pos = posicaoNa(D, C, nossoI(D)), cl = classificacao(D, C).find((x) => x.i === nossoI(D));
          if (g.r === 8) await fq((C.semis || []).includes(nossoI(D)) ? Tf('Terminamos a primeira fase em {0}º: estamos na SEMIFINAL!', pos) : Tf('Terminamos em {0}º... ficamos fora da semifinal.', pos));
          else { const prox = textoProximo(D, C); await fq(Tf('Estamos em {0}º lugar, com {1} pontos.', pos, cl.p) + (prox ? ' ' + prox : '')); }
        } else if (g.r === 9) await fq(ganhou ? T('ESTAMOS NA FINAL!') + ' ' + textoProximo(D, C) : T('Perdemos a semifinal... mas ainda dá pra ficar com o 3º lugar.') + ' ' + textoProximo(D, C));
        else if (g.terceiro) await fq(ganhou ? T('Terceiro lugar! Saímos com medalha!') : T('Quarto lugar. Não foi dessa vez, mas que campanha!'));
        else if (ganhou) {
          await fq(T('CAMPEÕES! O torneio é nosso!'));
          if (C.premioPago) { await fq(D.porJogador ? Tf('O prêmio é de {0} fakes pra cada um. A sua parte já tá na conta!', C.premioPago) : Tf('O prêmio de {0} fakes é seu!', C.premioPago)); try { api.somDinheiro(); api.ganhoNaTela(C.premioPago); api.mostrarDinheiro(); } catch (e) { /* nada */ } }
        } else await fq(T('Vice-campeão... chegamos na final, e isso ninguém tira da gente.'));
        Dialogo.esconder();
        if (C.etapa === 'fim') await painelFinal(id);
        if (conv) await conviteNaCena(id, conv, J);
      } finally {
        Dialogo.esconder();
        for (const A of atores) try { api.descartarPessoa(A); } catch (e) { /* nada */ }
        delete s.falantesExtra[D.quem]; delete s.falantesExtra.biel; delete s.falantesExtra.rafa;
      }
    }
    async function conviteNaCena(id, A, J) {
      const C = camp(id), nome = api.nomeJog(); A.yawAlvo = yawPara(A.x, A.z, J.x, J.z); J.yawAlvo = yawPara(J.x, J.z, A.x, A.z);
      if (id === 'sin') {
        iniciar('fut', 'cena'); const D = DEF.fut, F = camp('fut');
        await api.fala('biel', Tf('Ei, {0}! Assisti o torneio inteiro. Que jogo!', nome));
        await api.fala('biel', T('Escuta: vai ter um torneio de futsal lá na quadra, com as mesmas regras. Dez times, todo mundo contra todo mundo, semifinal e final.'));
        await api.fala('biel', Tf('O campeão leva {0} fakes por jogador. E você já tá no meu time, nem precisa responder!', D.premio));
        await api.fala('biel', Tf('O primeiro jogo é sexta, dia {0}, às {1}, contra {2}.', diaDa(F, 0), fmt(horaDa(F, 0, D)), nomeT(D, adversario(D, proxNosso(D, F)))));
        await api.fala('jog', T('Fechado, Biel! Pode contar comigo.'));
        try { api.fsal().conheceu = true; } catch (e) { /* nada */ }
      } else {
        inscreverVarzea();
        await api.fala('rafa', Tf('{0}, valeu pelo torneio! Você joga muito.', nome));
        await api.fala('rafa', T('Eu também jogo no Peladão FC, o time da várzea. Vai começar o campeonato de várzea e eu já te coloquei no time!'));
        await api.fala('rafa', T('São dez times, todo mundo contra todo mundo; os quatro melhores vão pra semifinal e depois tem a final.'));
        await api.fala('rafa', textoVarzea());
        await api.fala('jog', T('Fechado, Rafa! Tô dentro.'));
      }
      Dialogo.esconder();
      C.proxFeito = true; api.gravar('chegada');
      try { if (api.mariposa) api.mariposa(); } catch (e) { /* nada */ }
    }

    // ---------------------------------------------------------------- A PRÉ-PARTIDA e o painel do fim
    function css() {
      if (document.getElementById('tnCss')) return;
      const st = document.createElement('style'); st.id = 'tnCss';
      st.textContent = `
.tnPre{position:fixed;inset:0;z-index:40;display:flex;flex-direction:column;background:#14100c;color:#f4efe2;font:600 12px/1.3 var(--font-body,monospace);user-select:none}
.tnTopo{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:calc(6px + env(safe-area-inset-top,0px)) max(14px,env(safe-area-inset-right,0px)) 6px max(14px,env(safe-area-inset-left,0px));background:#2a1206;border-bottom:3px solid #f2c230}
.tnTopo b{font:700 13px/1 var(--font-display,monospace);letter-spacing:.06em;color:#f2c230}.tnTopo span{opacity:.85;font-size:11px;text-align:right}
.tnCorpo{flex:1;overflow:auto;display:grid;grid-template-columns:1.25fr 1fr;gap:10px;padding:10px max(14px,env(safe-area-inset-right,0px)) 8px max(14px,env(safe-area-inset-left,0px))}
.tnConf{display:flex;align-items:center;justify-content:space-around;gap:6px;background:linear-gradient(105deg,var(--c1) 0 49.5%,#14100c 49.5% 50.5%,var(--c2) 50.5% 100%);border:3px solid #4a3622;padding:10px 6px;position:relative}
.tnConf:after{content:"";position:absolute;inset:0;background:rgba(0,0,0,.35);pointer-events:none}
.tnLado{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;gap:4px;text-align:center;text-shadow:0 2px 0 #000;width:38%;min-width:0}
.tnEmb{width:54px;height:54px;border:4px solid #14100c;display:flex;align-items:center;justify-content:center;font:700 16px/1 var(--font-display,monospace);color:#14100c;box-shadow:0 3px 0 rgba(0,0,0,.6)}
.tnEmb.circ{border-radius:50%}.tnLado b{font:700 12px/1.1 var(--font-display,monospace)}.tnEst{color:#f2c230;letter-spacing:1px;font-size:13px}
.tnX{position:relative;z-index:1;white-space:nowrap;flex-shrink:0;font:700 15px/1 var(--font-display,monospace);background:#2a1206;border:3px solid #f2c230;padding:5px 8px;color:#f2c230}
.tnCard{background:#241b12;border:3px solid #4a3622;padding:8px 10px;display:flex;flex-direction:column;gap:5px;min-width:0}
.tnCard h3{margin:0;font:700 12px/1.1 var(--font-display,monospace);color:#f2c230}.tnCard p{margin:0;font-size:11px;opacity:.92}
.tnTab{width:100%;border-collapse:collapse;font-size:11px}.tnTab td{padding:2px 4px;border-bottom:1px solid #3a2c1e;text-align:right}.tnTab td:nth-child(2){text-align:left}
.tnTab tr.nos td{color:#f2c230;font-weight:700}.tnTab tr.cl td:first-child{color:#8fd16a}
.tnRodape{display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:6px max(14px,env(safe-area-inset-right,0px)) calc(6px + env(safe-area-inset-bottom,0px)) max(14px,env(safe-area-inset-left,0px));background:#2a1206;border-top:3px solid #4a3622}
.tnRodape span{flex:1;font-size:11px;opacity:.85}
.tnJogar{font:700 13px/1 var(--font-display,monospace);padding:9px 14px;background:#f2c230;color:#2a1206;border:3px solid #000;box-shadow:0 3px 0 #000}
.tnFim{position:fixed;inset:0;z-index:41;background:rgba(10,8,6,.92);display:flex;align-items:center;justify-content:center;color:#f4efe2;font:600 12px/1.35 var(--font-body,monospace)}
.tnFim .caixa{background:#241b12;border:4px solid #f2c230;padding:12px 16px;width:min(520px,calc(100% - 32px));max-height:calc(100% - 24px);overflow:auto;display:flex;flex-direction:column;gap:8px;align-items:center;text-align:center}
.tnFim h2{margin:0;font:700 16px/1.1 var(--font-display,monospace);color:#f2c230}
.tnFim ul{list-style:none;margin:0;padding:0;width:100%;display:flex;flex-direction:column;gap:4px}.tnFim li{display:flex;justify-content:space-between;gap:8px;background:#2f2418;border:2px solid #4a3622;padding:5px 8px}
.tnFim li.nos{border-color:#f2c230}
@media (orientation:portrait){.tnCorpo{grid-template-columns:1fr}}
`;
      document.head.appendChild(st);
    }
    const escH = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const estrelasTxt = (n) => '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n);
    const emb = (t, nosso) => '<div class="tnEmb' + (nosso ? '' : ' circ') + '" style="background:' + t.uni[0] + ';color:' + t.uni[1] + '">' + escH(t.sigla.slice(0, 2)) + '</div>';
    function tabelaHtml(D, C) {
      const ni = nossoI(D);
      return '<table class="tnTab"><tr><td>#</td><td>' + escH(T('Time')) + '</td><td>' + escH(T('J')) + '</td><td>' + escH(T('Pts')) + '</td><td>' + escH(T('SG')) + '</td></tr>'
        + classificacao(D, C).map((x, k) => '<tr class="' + (x.i === ni ? 'nos ' : '') + (k < 4 ? 'cl' : '') + '"><td>' + (k + 1) + '</td><td>' + escH(T(D.times[x.i].nome)) + '</td><td>' + x.j + '</td><td>' + x.p + '</td><td>' + (x.gp - x.gc) + '</td></tr>').join('') + '</table>';
    }
    function telaPrePartida(id, g) {
      css();
      const D = DEF[id], C = camp(id), casa = D.times[g.c], fora = D.times[g.f], ni = nossoI(D), A = D.times[adversario(D, g)], d = dados();
      const el = document.createElement('div'); el.className = 'tnPre';
      el.innerHTML = '<div class="tnTopo"><b>' + escH(T(D.titulo)) + '</b><span>' + escH(faseNome(g) + ' · ' + T(DIAS[semanaDe(d.dia)]) + ', ' + fmt(horaDa(C, g.r, D))) + '</span></div>'
        + '<div class="tnCorpo"><div style="display:flex;flex-direction:column;gap:10px">'
        + '<div class="tnConf" style="--c1:' + casa.uni[0] + ';--c2:' + fora.uni[0] + '">'
        + '<div class="tnLado">' + emb(casa, g.c === ni) + '<b>' + escH(T(casa.nome)) + '</b><span class="tnEst">' + estrelasTxt(casa.est) + '</span></div><div class="tnX">' + escH(casa.sigla + ' × ' + fora.sigla) + '</div>'
        + '<div class="tnLado">' + emb(fora, g.f === ni) + '<b>' + escH(T(fora.nome)) + '</b><span class="tnEst">' + estrelasTxt(fora.est) + '</span></div></div>'
        + '<div class="tnCard"><h3>' + escH(Tf('O adversário: {0}', T(A.nome))) + '</h3><p>' + escH(Tf('Técnico: {0}', A.tecnico)) + ' · ' + escH(Tf('Esquema: {0}', nomeFormacao(A.formacao))) + '</p><p>' + escH(T(A.nota)) + '</p></div>'
        + '<div class="tnCard"><h3>' + escH(T('A partida')) + '</h3><p>' + escH(T('5 minutos de jogo (1 hora no relógio da cidade).')) + '</p><p>' + escH(g.r > 8 ? T('Mata-mata: se empatar, a vaga sai nos pênaltis.') : T('Vitória vale 3 pontos e empate, 1.')) + '</p>'
        + '<p>' + escH(D.porJogador ? Tf('Prêmio do campeão: {0} fakes por jogador.', D.premio) : Tf('Prêmio do campeão: {0} fakes.', D.premio)) + '</p></div>'
        + '</div><div class="tnCard"><h3>' + escH(T('Classificação')) + '</h3>' + tabelaHtml(D, C) + '<p>' + escH(T('Os 4 primeiros vão para a semifinal.')) + '</p></div></div>'
        + '<div class="tnRodape"><span>' + escH(T(D.nome)) + '</span><button type="button" class="tnJogar">' + escH(T('COMEÇAR PARTIDA')) + '</button></div>';
      (document.getElementById('raizJogo') || document.body).appendChild(el);
      return new Promise((ok) => { el.querySelector('.tnJogar').onclick = () => { try { if (typeof somClique === 'function') somClique(); } catch (e) { /* nada */ } el.remove(); ok(); }; });
    }
    function painelFinal(id) {
      css();
      const D = DEF[id], C = camp(id), ni = nossoI(D), el = document.createElement('div'); el.className = 'tnFim';
      const li = (rot, i) => '<li class="' + (i === ni ? 'nos' : '') + '"><span>' + escH(rot) + '</span><b>' + escH(T(D.times[i].nome)) + '</b></li>';
      el.innerHTML = '<div class="caixa"><h2>' + escH(Tf('CAMPEÃO: {0}', T(D.times[C.campeao].nome).toUpperCase())) + '</h2>'
        + '<ul>' + li(T('Campeão'), C.campeao) + li(T('Vice-campeão'), C.vice) + li(T('3º lugar'), C.terceiro) + li(T('4º lugar'), C.quarto) + '</ul>'
        + (C.premioPago ? '<p>' + escH(Tf('Seu prêmio: {0} fakes.', C.premioPago)) + '</p>' : '')
        + '<button type="button" class="tnJogar">' + escH(T('Fechar')) + '</button></div>';
      (document.getElementById('raizJogo') || document.body).appendChild(el);
      return new Promise((ok) => { el.querySelector('button').onclick = () => { el.remove(); ok(); }; });
    }

    return { tick, alvos, missao, ocupado, campoOcupado, horaNoDia, _M: M,
      _fns: { camp, iniciar, jogoDeHoje, fecharRodadas, fecharRodada, encerrar, classificacao, diaDeJogo, telaPrePartida, painelFinal, depoisDoJogo, registrarJogo, cfgPartida, timeMotor, titulares, elenco, geo, vagas, tickTorcida, checarConvites, desempenhoRachas, mensagemJoao, conviteMensagem, conviteNaCena, jogarMoeda, diaDa, horaDa, simularPlacar, DEF } };
  }

  // ============================================================================================ TRADUÇÕES (en, es, it, fr)
  const TRAD = {
    'Disputa do 3º lugar': ['3rd-place match', 'Partido por el 3.er puesto', 'Finale per il 3º posto', 'Match pour la 3e place'],
    'O próximo é {0}, dia {1}, às {2}, contra {3}.': ['The next one is on {0}, day {1}, at {2}, against {3}.', 'El próximo es el {0}, día {1}, a las {2}, contra {3}.', 'La prossima è {0}, giorno {1}, alle {2}, contro {3}.', 'Le prochain, c’est {0}, jour {1}, à {2}, contre {3}.'],
    'Deu {0} x {1} contra {2}.': ['It ended {0}-{1} against {2}.', 'Quedó {0} a {1} contra {2}.', 'È finita {0} a {1} contro {2}.', 'Ça a fini {0} à {1} contre {2}.'],
    'Nos pênaltis: {0} x {1}.': ['On penalties: {0}-{1}.', 'En los penales: {0} a {1}.', 'Ai rigori: {0} a {1}.', 'Aux tirs au but : {0} à {1}.'],
    'Você já tá inscrito no time: aparece!': ['You’re already signed up for the team: show up!', 'Ya estás inscrito en el equipo: ¡ven!', 'Sei già iscritto in squadra: vieni!', 'Tu es déjà inscrit dans l’équipe : viens !'],
    'Você já tá inscrita no time: aparece!': ['You’re already signed up for the team: show up!', 'Ya estás inscrita en el equipo: ¡ven!', 'Sei già iscritta in squadra: vieni!', 'Tu es déjà inscrite dans l’équipe : viens !'],
    'Fica pra próxima, então.': ['Next time, then.', 'Será la próxima, entonces.', 'Sarà per la prossima, allora.', 'Ce sera pour la prochaine, alors.'],
    'O time passou pras semifinais!': ['The team made it to the semifinals!', '¡El equipo pasó a las semifinales!', 'La squadra è passata in semifinale!', 'L’équipe est en demi-finale !'],
    'Mas como você não veio em nenhum jogo, a gente teve que te cortar das eliminatórias.': ['But since you didn’t play a single game, we had to drop you for the knockouts.', 'Pero como no jugaste ningún partido, tuvimos que sacarte de las eliminatorias.', 'Ma visto che non hai giocato nessuna partita, abbiamo dovuto toglierti dalla fase a eliminazione.', 'Mais comme tu n’as joué aucun match, on a dû te retirer pour la phase finale.'],
    'Não deu: o time ficou fora das semifinais.': ['No luck: the team missed the semifinals.', 'No se pudo: el equipo quedó fuera de las semifinales.', 'Niente da fare: la squadra è rimasta fuori dalle semifinali.', 'Raté : l’équipe n’est pas en demi-finale.'],
    'Valeu por jogar com a gente!': ['Thanks for playing with us!', '¡Gracias por jugar con nosotros!', 'Grazie per aver giocato con noi!', 'Merci d’avoir joué avec nous !'],
    'E você nem apareceu nos jogos...': ['And you never showed up for the games...', 'Y ni apareciste en los partidos...', 'E alle partite non ti abbiamo mai visto in faccia...', 'Et on ne t’a vu à aucun match...'],
    'Hoje tem jogo! {0} contra {1}, às {2}.': ['Game day today! {0} against {1}, at {2}.', '¡Hoy hay partido! {0} contra {1}, a las {2}.', 'Oggi si gioca! {0} contro {1}, alle {2}.', 'Aujourd’hui, il y a match ! {0} contre {1}, à {2}.'],
    'Chega um pouco antes, no portão do sintético.': ['Get there a bit early, at the turf field gate.', 'Llega un poco antes, a la puerta de la cancha sintética.', 'Arriva un po’ prima, al cancello del campo sintetico.', 'Arrive un peu avant, au portail du terrain synthétique.'],
    'Chega um pouco antes, no portão da quadra.': ['Get there a bit early, at the court gate.', 'Llega un poco antes, a la puerta de la cancha.', 'Arriva un po’ prima, al cancello del campetto.', 'Arrive un peu avant, au portail du terrain.'],
    'SOMOS CAMPEÕES DO TORNEIO!': ['WE WON THE TOURNAMENT!', '¡SOMOS CAMPEONES DEL TORNEO!', 'SIAMO CAMPIONI DEL TORNEO!', 'ON A GAGNÉ LE TOURNOI !'],
    'Acabou o torneio: a gente foi vice. Quem levou foi {0}.': ['The tournament is over: we were runners-up. {0} took the title.', 'Se acabó el torneo: fuimos subcampeones. Ganó {0}.', 'Il torneo è finito: siamo arrivati secondi. Ha vinto {0}.', 'Le tournoi est fini : on est vice-champions. C’est {0} qui l’a emporté.'],
    'Acabou o torneio: ficamos em 3º lugar. Quem levou foi {0}.': ['The tournament is over: we finished 3rd. {0} took the title.', 'Se acabó el torneo: quedamos en 3.er lugar. Ganó {0}.', 'Il torneo è finito: siamo arrivati terzi. Ha vinto {0}.', 'Le tournoi est fini : on a fini 3e. C’est {0} qui l’a emporté.'],
    'Acabou o torneio: ficamos em 4º lugar. Quem levou foi {0}.': ['The tournament is over: we finished 4th. {0} took the title.', 'Se acabó el torneo: quedamos en 4.º lugar. Ganó {0}.', 'Il torneo è finito: siamo arrivati quarti. Ha vinto {0}.', 'Le tournoi est fini : on a fini 4e. C’est {0} qui l’a emporté.'],
    'Acabou o torneio. Quem levou foi {0}.': ['The tournament is over. {0} took the title.', 'Se acabó el torneo. Ganó {0}.', 'Il torneo è finito. Ha vinto {0}.', 'Le tournoi est fini. C’est {0} qui l’a emporté.'],
    'O prêmio de {0} fakes já tá na sua conta!': ['The {0} fakes prize is already in your account!', '¡El premio de {0} fakes ya está en tu cuenta!', 'Il premio di {0} fakes è già sul tuo conto!', 'Le prix de {0} fakes est déjà sur ton compte !'],
    '{0}, vai ter um torneio no sintético e eu quero você no meu time! Você foi muito craque nos rachas, não tem como ficar de fora.': ['{0}, there’s going to be a tournament at the turf field and I want you on my team! You were a real star in the pickup games, no way you’re missing this.', '{0}, va a haber un torneo en la cancha sintética y te quiero en mi equipo. ¡Fuiste un crack en los picaditos, no te puedes quedar afuera!', '{0}, ci sarà un torneo al campo sintetico e ti voglio nella mia squadra! Nelle partitelle sei stato un fenomeno, non puoi mancare.', '{0}, il va y avoir un tournoi sur le synthétique et je te veux dans mon équipe ! Tu as été un vrai crack aux matchs entre potes, impossible que tu le rates.'],
    '{0}, vai ter um torneio no sintético e eu quero você no meu time! Você mandou bem nos rachas.': ['{0}, there’s going to be a tournament at the turf field and I want you on my team! You did well in the pickup games.', '{0}, va a haber un torneo en la cancha sintética y te quiero en mi equipo. ¡Jugaste bien en los picaditos!', '{0}, ci sarà un torneo al campo sintetico e ti voglio nella mia squadra! Nelle partitelle hai giocato bene.', '{0}, il va y avoir un tournoi sur le synthétique et je te veux dans mon équipe ! Tu as bien joué aux matchs entre potes.'],
    '{0}, vai ter um torneio no sintético e eu quero você no meu time! Mesmo os rachas não tendo sido os melhores, eu confio em você.': ['{0}, there’s going to be a tournament at the turf field and I want you on my team! Even if the pickup games weren’t your best, I trust you.', '{0}, va a haber un torneo en la cancha sintética y te quiero en mi equipo. Aunque los picaditos no fueron los mejores, confío en ti.', '{0}, ci sarà un torneo al campo sintetico e ti voglio nella mia squadra! Anche se le partitelle non sono andate benissimo, io mi fido di te.', '{0}, il va y avoir un tournoi sur le synthétique et je te veux dans mon équipe ! Même si les matchs entre potes n’ont pas été terribles, j’ai confiance en toi.'],
    'Já te coloquei na lista! Dez times, três jogos por semana. O primeiro é sexta, dia {0}, às {1}, contra {2}.': ['I already put you on the list! Ten teams, three games a week. The first one is Friday, day {0}, at {1}, against {2}.', '¡Ya te anoté en la lista! Diez equipos, tres partidos por semana. El primero es el viernes, día {0}, a las {1}, contra {2}.', 'Ti ho già messo in lista! Dieci squadre, tre partite a settimana. La prima è venerdì, giorno {0}, alle {1}, contro {2}.', 'Je t’ai déjà mis sur la liste ! Dix équipes, trois matchs par semaine. Le premier, c’est vendredi, jour {0}, à {1}, contre {2}.'],
    'Você entrou no {0}!': ['You joined the {0}!', '¡Entraste en el {0}!', 'Sei entrato nel {0}!', 'Tu participes au {0} !'],
    'Fala, {0}! Aqui é o Biel. Vai ter um torneio de futsal lá na quadra e você tá no meu time!': ['Hey, {0}! It’s Biel. There’s going to be a futsal tournament at the court and you’re on my team!', '¡Hola, {0}! Soy Biel. Va a haber un torneo de futsal en la cancha ¡y estás en mi equipo!', 'Ehi, {0}! Sono Biel. Ci sarà un torneo di calcetto al campetto e sei nella mia squadra!', 'Salut, {0} ! C’est Biel. Il va y avoir un tournoi de futsal au terrain et tu es dans mon équipe !'],
    'Oi, {0}! Aqui é o Biel, da quadra de futsal. O João me passou seu número: vai ter um torneio de futsal e você tá no meu time!': ['Hi, {0}! It’s Biel, from the futsal court. João gave me your number: there’s going to be a futsal tournament and you’re on my team!', '¡Hola, {0}! Soy Biel, de la cancha de futsal. João me pasó tu número: va a haber un torneo de futsal ¡y estás en mi equipo!', 'Ciao, {0}! Sono Biel, del campetto di calcetto. João mi ha dato il tuo numero: ci sarà un torneo di calcetto e sei nella mia squadra!', 'Salut, {0} ! C’est Biel, du terrain de futsal. João m’a passé ton numéro : il va y avoir un tournoi de futsal et tu es dans mon équipe !'],
    'Mesmas regras do torneio do sintético. O campeão leva {0} fakes por jogador. O primeiro jogo é sexta, dia {1}, às {2}, contra {3}.': ['Same rules as the turf tournament. The champion gets {0} fakes per player. The first game is Friday, day {1}, at {2}, against {3}.', 'Las mismas reglas que el torneo de la sintética. El campeón se lleva {0} fakes por jugador. El primer partido es el viernes, día {1}, a las {2}, contra {3}.', 'Stesse regole del torneo al sintetico. Il campione vince {0} fakes a giocatore. La prima partita è venerdì, giorno {1}, alle {2}, contro {3}.', 'Mêmes règles que le tournoi du synthétique. Le champion gagne {0} fakes par joueur. Le premier match, c’est vendredi, jour {1}, à {2}, contre {3}.'],
    '{0}, é o Rafa! Vai ter o campeonato de várzea no campo e eu te coloquei no time do Peladão FC!': ['{0}, it’s Rafa! The amateur league is starting at the field and I put you on the Peladão FC team!', '{0}, ¡soy Rafa! Va a haber el campeonato de barrio en la cancha y te puse en el equipo del Peladão FC.', '{0}, sono Rafa! Al campo comincia il campionato amatoriale e ti ho messo nella squadra del Peladão FC!', '{0}, c’est Rafa ! Le championnat amateur commence au terrain et je t’ai mis dans l’équipe du Peladão FC !'],
    'Oi, {0}! Aqui é o Rafa. O João me passou seu número: vai ter o campeonato de várzea e eu te coloquei no time do Peladão FC!': ['Hi, {0}! It’s Rafa. João gave me your number: the amateur league is starting and I put you on the Peladão FC team!', '¡Hola, {0}! Soy Rafa. João me pasó tu número: va a haber el campeonato de barrio y te puse en el equipo del Peladão FC.', 'Ciao, {0}! Sono Rafa. João mi ha dato il tuo numero: comincia il campionato amatoriale e ti ho messo nella squadra del Peladão FC!', 'Salut, {0} ! C’est Rafa. João m’a passé ton numéro : le championnat amateur commence et je t’ai mis dans l’équipe du Peladão FC !'],
    'O primeiro jogo é no sábado, dia {0}, às {1}. Chega uma hora antes: o vestiário fica embaixo do campo, o Seu Damião vai estar te esperando.': ['The first game is on Saturday, day {0}, at {1}. Get there an hour early: the locker room is under the field, and Mr. Damião will be waiting for you.', 'El primer partido es el sábado, día {0}, a las {1}. Llega una hora antes: el vestuario está debajo de la cancha, don Damião te va a estar esperando.', 'La prima partita è sabato, giorno {0}, alle {1}. Arriva un’ora prima: lo spogliatoio è sotto il campo, il signor Damião ti aspetterà.', 'Le premier match, c’est samedi, jour {0}, à {1}. Arrive une heure avant : le vestiaire est sous le terrain, M. Damião t’attendra.'],
    'Missão: {0} ({1}): {2} x {3} às {4}, {5}.': ['Mission: {0} ({1}): {2} vs {3} at {4}, {5}.', 'Misión: {0} ({1}): {2} vs {3} a las {4}, {5}.', 'Missione: {0} ({1}): {2} - {3} alle {4}, {5}.', 'Mission : {0} ({1}) : {2} contre {3} à {4}, {5}.'],
    'no sintético Doutor Bryan': ['at the Doutor Bryan turf field', 'en la cancha sintética Doutor Bryan', 'al campo sintetico Doutor Bryan', 'au terrain synthétique Doutor Bryan'],
    'na quadra de futsal': ['at the futsal court', 'en la cancha de futsal', 'al campetto di calcetto', 'au terrain de futsal'],
    '{0}: jogo às {1}': ['{0}: game at {1}', '{0}: partido a las {1}', '{0}: partita alle {1}', '{0} : match à {1}'],
    'Jogar o torneio ({0} x {1})': ['Play the tournament ({0} vs {1})', 'Jugar el torneo ({0} vs {1})', 'Gioca il torneo ({0} - {1})', 'Jouer le tournoi ({0} contre {1})'],
    'Juiz': ['Referee', 'Árbitro', 'Arbitro', 'Arbitre'],
    'Capitães, aqui na frente! Vamos tirar no cara ou coroa.': ['Captains, up front! We’ll toss a coin.', '¡Capitanes, aquí adelante! Vamos a tirar la moneda.', 'Capitani, qui davanti! Facciamo testa o croce.', 'Capitaines, devant moi ! On tire à pile ou face.'],
    'Cara ou coroa?': ['Heads or tails?', '¿Cara o cruz?', 'Testa o croce?', 'Pile ou face ?'],
    'Cara!': ['Heads!', '¡Cara!', 'Testa!', 'Face !'],
    'Coroa!': ['Tails!', '¡Cruz!', 'Croce!', 'Pile !'],
    'Deu cara!': ['It’s heads!', '¡Salió cara!', 'È uscita testa!', 'C’est face !'],
    'Deu coroa!': ['It’s tails!', '¡Salió cruz!', 'È uscita croce!', 'C’est pile !'],
    'A saída é nossa!': ['We kick off!', '¡El saque es nuestro!', 'Il calcio d’inizio è nostro!', 'On donne le coup d’envoi !'],
    'A escolha do lado fica com {0}.': ['{0} gets to choose the side.', '{0} elige el lado.', 'La scelta del campo va a {0}.', '{0} choisit le côté.'],
    'Boa! Vamos pra cima!': ['Nice! Let’s go get them!', '¡Bien! ¡Vamos con todo!', 'Grande! Andiamo all’attacco!', 'Super ! On y va !'],
    'Começou bem!': ['Off to a good start!', '¡Empezamos bien!', 'Si comincia bene!', 'Ça commence bien !'],
    'Nos pênaltis! {0} a {1} no tempo normal e a gente passou!': ['On penalties! {0}-{1} in regular time and we went through!', '¡En los penales! {0} a {1} en el tiempo normal ¡y pasamos!', 'Ai rigori! {0} a {1} nei tempi regolamentari e siamo passati!', 'Aux tirs au but ! {0} à {1} dans le temps réglementaire et on est passés !'],
    '{0} a {1} e a gente perdeu nos pênaltis... que pena.': ['{0}-{1} and we lost on penalties... what a shame.', '{0} a {1} y perdimos en los penales... qué pena.', '{0} a {1} e abbiamo perso ai rigori... peccato.', '{0} à {1} et on a perdu aux tirs au but... dommage.'],
    '{0} a {1} contra {2}! Que vitória!': ['{0}-{1} against {2}! What a win!', '¡{0} a {1} contra {2}! ¡Qué victoria!', '{0} a {1} contro {2}! Che vittoria!', '{0} à {1} contre {2} ! Quelle victoire !'],
    'Ganhamos! {0} a {1}!': ['We won! {0}-{1}!', '¡Ganamos! ¡{0} a {1}!', 'Abbiamo vinto! {0} a {1}!', 'On a gagné ! {0} à {1} !'],
    '{0} a {1}. Empate: dava pra mais, mas tá valendo.': ['{0}-{1}. A draw: we could have done more, but it counts.', '{0} a {1}. Empate: daba para más, pero vale.', '{0} a {1}. Pareggio: si poteva fare di più, ma va bene.', '{0} à {1}. Match nul : on pouvait faire mieux, mais ça compte.'],
    '{0} a {1} pra eles... bola pra frente.': ['{0}-{1} to them... let’s move on.', '{0} a {1} para ellos... a seguir adelante.', '{0} a {1} per loro... andiamo avanti.', '{0} à {1} pour eux... on passe à la suite.'],
    'E você, {0}? Jogou demais! Foi o melhor em campo.': ['And you, {0}? You were amazing! Best player on the field.', '¿Y tú, {0}? ¡Jugaste muchísimo! Fuiste el mejor de la cancha.', 'E tu, {0}? Hai giocato alla grande! Il migliore in campo.', 'Et toi, {0} ? Tu as été énorme ! Le meilleur sur le terrain.'],
    'E você, {0}? Jogou demais! Foi a melhor em campo.': ['And you, {0}? You were amazing! Best player on the field.', '¿Y tú, {0}? ¡Jugaste muchísimo! Fuiste la mejor de la cancha.', 'E tu, {0}? Hai giocato alla grande! La migliore in campo.', 'Et toi, {0} ? Tu as été énorme ! La meilleure sur le terrain.'],
    'Você mandou muito bem hoje!': ['You did really well today!', '¡Hoy jugaste muy bien!', 'Oggi hai giocato benissimo!', 'Tu as super bien joué aujourd’hui !'],
    'Você jogou direitinho. Dá pra crescer mais.': ['You played decently. There’s room to grow.', 'Jugaste bien. Todavía puedes crecer más.', 'Hai giocato discretamente. Puoi crescere ancora.', 'Tu as bien joué. Tu peux encore progresser.'],
    'Hoje não foi o seu dia, mas o time precisa de você no próximo.': ['Today wasn’t your day, but the team needs you in the next one.', 'Hoy no fue tu día, pero el equipo te necesita en el próximo.', 'Oggi non era la tua giornata, ma la squadra ha bisogno di te nella prossima.', 'Ce n’était pas ton jour, mais l’équipe a besoin de toi au prochain.'],
    'Terminamos a primeira fase em {0}º: estamos na SEMIFINAL!': ['We finished the first stage in {0}th place: we’re in the SEMIFINAL!', 'Terminamos la primera fase en el {0}.º puesto: ¡estamos en la SEMIFINAL!', 'Abbiamo chiuso la prima fase al {0}º posto: siamo in SEMIFINALE!', 'On a fini la première phase à la {0}e place : on est en DEMI-FINALE !'],
    'Terminamos em {0}º... ficamos fora da semifinal.': ['We finished {0}th... we missed the semifinal.', 'Terminamos en el {0}.º puesto... quedamos fuera de la semifinal.', 'Abbiamo chiuso al {0}º posto... siamo fuori dalla semifinale.', 'On a fini {0}e... pas de demi-finale pour nous.'],
    'Estamos em {0}º lugar, com {1} pontos.': ['We’re in {0}th place, with {1} points.', 'Estamos en el {0}.º lugar, con {1} puntos.', 'Siamo al {0}º posto, con {1} punti.', 'On est à la {0}e place, avec {1} points.'],
    'ESTAMOS NA FINAL!': ['WE’RE IN THE FINAL!', '¡ESTAMOS EN LA FINAL!', 'SIAMO IN FINALE!', 'ON EST EN FINALE !'],
    'Perdemos a semifinal... mas ainda dá pra ficar com o 3º lugar.': ['We lost the semifinal... but we can still take 3rd place.', 'Perdimos la semifinal... pero todavía podemos quedarnos con el 3.er lugar.', 'Abbiamo perso la semifinale... ma possiamo ancora prenderci il 3º posto.', 'On a perdu la demi-finale... mais on peut encore prendre la 3e place.'],
    'Terceiro lugar! Saímos com medalha!': ['Third place! We’re leaving with a medal!', '¡Tercer lugar! ¡Nos vamos con medalla!', 'Terzo posto! Usciamo con una medaglia!', 'Troisième place ! On repart avec une médaille !'],
    'Quarto lugar. Não foi dessa vez, mas que campanha!': ['Fourth place. Not this time, but what a run!', 'Cuarto lugar. No fue esta vez, ¡pero qué campaña!', 'Quarto posto. Non è stata la volta buona, ma che cammino!', 'Quatrième place. Ce n’était pas pour cette fois, mais quel parcours !'],
    'CAMPEÕES! O torneio é nosso!': ['CHAMPIONS! The tournament is ours!', '¡CAMPEONES! ¡El torneo es nuestro!', 'CAMPIONI! Il torneo è nostro!', 'CHAMPIONS ! Le tournoi est à nous !'],
    'O prêmio é de {0} fakes pra cada um. A sua parte já tá na conta!': ['The prize is {0} fakes each. Your share is already in your account!', 'El premio es de {0} fakes para cada uno. ¡Tu parte ya está en la cuenta!', 'Il premio è di {0} fakes a testa. La tua parte è già sul conto!', 'Le prix, c’est {0} fakes chacun. Ta part est déjà sur ton compte !'],
    'O prêmio de {0} fakes é seu!': ['The {0} fakes prize is yours!', '¡El premio de {0} fakes es tuyo!', 'Il premio di {0} fakes è tuo!', 'Le prix de {0} fakes est à toi !'],
    'Ei, {0}! Assisti o torneio inteiro. Que jogo!': ['Hey, {0}! I watched the whole tournament. What a game!', '¡Ey, {0}! Vi todo el torneo. ¡Qué partido!', 'Ehi, {0}! Ho visto tutto il torneo. Che partita!', 'Hé, {0} ! J’ai regardé tout le tournoi. Quel match !'],
    'Escuta: vai ter um torneio de futsal lá na quadra, com as mesmas regras. Dez times, todo mundo contra todo mundo, semifinal e final.': ['Listen: there’s going to be a futsal tournament at the court, with the same rules. Ten teams, everyone plays everyone, semifinal and final.', 'Escucha: va a haber un torneo de futsal en la cancha, con las mismas reglas. Diez equipos, todos contra todos, semifinal y final.', 'Senti: ci sarà un torneo di calcetto al campetto, con le stesse regole. Dieci squadre, tutti contro tutti, semifinale e finale.', 'Écoute : il va y avoir un tournoi de futsal au terrain, avec les mêmes règles. Dix équipes, tout le monde contre tout le monde, demi-finale et finale.'],
    'O campeão leva {0} fakes por jogador. E você já tá no meu time, nem precisa responder!': ['The champion gets {0} fakes per player. And you’re already on my team, no need to answer!', 'El campeón se lleva {0} fakes por jugador. Y ya estás en mi equipo, ¡ni hace falta que respondas!', 'Il campione vince {0} fakes a giocatore. E tu sei già nella mia squadra, non serve nemmeno rispondere!', 'Le champion gagne {0} fakes par joueur. Et tu es déjà dans mon équipe, pas besoin de répondre !'],
    'O primeiro jogo é sexta, dia {0}, às {1}, contra {2}.': ['The first game is Friday, day {0}, at {1}, against {2}.', 'El primer partido es el viernes, día {0}, a las {1}, contra {2}.', 'La prima partita è venerdì, giorno {0}, alle {1}, contro {2}.', 'Le premier match, c’est vendredi, jour {0}, à {1}, contre {2}.'],
    'Fechado, Biel! Pode contar comigo.': ['Deal, Biel! You can count on me.', '¡Trato hecho, Biel! Puedes contar conmigo.', 'Affare fatto, Biel! Puoi contare su di me.', 'Marché conclu, Biel ! Tu peux compter sur moi.'],
    '{0}, valeu pelo torneio! Você joga muito.': ['{0}, thanks for the tournament! You’re really good.', '{0}, ¡gracias por el torneo! Juegas muchísimo.', '{0}, grazie per il torneo! Giochi benissimo.', '{0}, merci pour le tournoi ! Tu joues super bien.'],
    'Eu também jogo no Peladão FC, o time da várzea. Vai começar o campeonato de várzea e eu já te coloquei no time!': ['I also play for Peladão FC, the amateur league team. The amateur league is about to start and I already put you on the team!', 'También juego en el Peladão FC, el equipo de barrio. Va a empezar el campeonato de barrio ¡y ya te puse en el equipo!', 'Gioco anche nel Peladão FC, la squadra amatoriale. Sta per cominciare il campionato amatoriale e ti ho già messo in squadra!', 'Je joue aussi au Peladão FC, l’équipe amateur. Le championnat amateur va commencer et je t’ai déjà mis dans l’équipe !'],
    'São dez times, todo mundo contra todo mundo; os quatro melhores vão pra semifinal e depois tem a final.': ['Ten teams, everyone plays everyone; the top four go to the semifinal and then there’s the final.', 'Son diez equipos, todos contra todos; los cuatro mejores van a la semifinal y después viene la final.', 'Sono dieci squadre, tutti contro tutti; le quattro migliori vanno in semifinale e poi c’è la finale.', 'Dix équipes, tout le monde contre tout le monde ; les quatre meilleures vont en demi-finale, puis il y a la finale.'],
    'Fechado, Rafa! Tô dentro.': ['Deal, Rafa! I’m in.', '¡Trato hecho, Rafa! Me apunto.', 'Affare fatto, Rafa! Ci sto.', 'Marché conclu, Rafa ! Je suis partant.'],
    'J': ['P', 'PJ', 'G', 'J'],
    'Pts': ['Pts', 'Pts', 'Pt', 'Pts'],
    'O adversário: {0}': ['The opponent: {0}', 'El rival: {0}', 'L’avversario: {0}', 'L’adversaire : {0}'],
    '5 minutos de jogo (1 hora no relógio da cidade).': ['5 minutes of play (1 hour on the town clock).', '5 minutos de juego (1 hora en el reloj de la ciudad).', '5 minuti di gioco (1 ora sull’orologio della città).', '5 minutes de jeu (1 heure à l’horloge de la ville).'],
    'Prêmio do campeão: {0} fakes por jogador.': ['Champion’s prize: {0} fakes per player.', 'Premio del campeón: {0} fakes por jugador.', 'Premio del campione: {0} fakes a giocatore.', 'Prix du champion : {0} fakes par joueur.'],
    'Prêmio do campeão: {0} fakes.': ['Champion’s prize: {0} fakes.', 'Premio del campeón: {0} fakes.', 'Premio del campione: {0} fakes.', 'Prix du champion : {0} fakes.'],
    'Os 4 primeiros vão para a semifinal.': ['The top 4 go to the semifinal.', 'Los 4 primeros van a la semifinal.', 'Le prime 4 vanno in semifinale.', 'Les 4 premiers vont en demi-finale.'],
    'CAMPEÃO: {0}': ['CHAMPION: {0}', 'CAMPEÓN: {0}', 'CAMPIONE: {0}', 'CHAMPION : {0}'],
    'Campeão': ['Champion', 'Campeón', 'Campione', 'Champion'],
    'Vice-campeão': ['Runner-up', 'Subcampeón', 'Secondo posto', 'Vice-champion'],
    '3º lugar': ['3rd place', '3.er lugar', '3º posto', '3e place'],
    '4º lugar': ['4th place', '4.º lugar', '4º posto', '4e place'],
    'Seu prêmio: {0} fakes.': ['Your prize: {0} fakes.', 'Tu premio: {0} fakes.', 'Il tuo premio: {0} fakes.', 'Ton prix : {0} fakes.'],
    'Pô, {0}, que vacilo! Você não apareceu no jogo...': ['Man, {0}, not cool! You didn’t show up for the game...', 'Uf, {0}, ¡qué metida de pata! No apareciste en el partido...', 'Dai, {0}, che figuraccia! Non ti sei presentato alla partita...', 'Franchement, {0}, pas cool ! Tu n’es pas venu au match...'],
    'Ô {0}, cadê você? A gente te esperou até o último minuto!': ['Hey {0}, where were you? We waited for you until the last minute!', 'Oye {0}, ¿dónde estabas? ¡Te esperamos hasta el último minuto!', 'Ehi {0}, dov’eri? Ti abbiamo aspettato fino all’ultimo minuto!', 'Hé {0}, t’étais où ? On t’a attendu jusqu’à la dernière minute !'],
    'Vacilou, hein, {0}? O time inteiro perguntando de você.': ['You blew it, huh, {0}? The whole team was asking about you.', 'Fallaste, ¿eh, {0}? Todo el equipo preguntando por ti.', 'Hai fatto cilecca, eh, {0}? Tutta la squadra chiedeva di te.', 'Tu nous as fait faux bond, hein, {0} ? Toute l’équipe demandait après toi.'],
    'Sério, {0}? Sumiu bem no dia do jogo...': ['Seriously, {0}? You vanished right on game day...', '¿En serio, {0}? Desapareciste justo el día del partido...', 'Sul serio, {0}? Sparire proprio il giorno della partita...', 'Sérieux, {0} ? Disparaître pile le jour du match...'],
    '{0}, isso não se faz! A gente contava com você hoje.': ['{0}, that’s not okay! We were counting on you today.', '{0}, ¡eso no se hace! Contábamos contigo hoy.', '{0}, non si fa così! Oggi contavamo su di te.', '{0}, ça ne se fait pas ! On comptait sur toi aujourd’hui.'],
    'Fala, {0}... ficou faltando você em campo. Vacilo!': ['Hey, {0}... we were missing you out there. Not cool!', 'Oye, {0}... faltaste tú en la cancha. ¡Qué fallo!', 'Ehi, {0}... in campo mancavi tu. Che figuraccia!', 'Salut, {0}... tu nous as manqué sur le terrain. Pas cool !'],
    'Poxa, {0}, nem um aviso? A gente jogou com um a menos.': ['Come on, {0}, not even a heads-up? We played one short.', 'Vaya, {0}, ¿ni un aviso? Jugamos con uno menos.', 'Dai, {0}, neanche un avviso? Abbiamo giocato con uno in meno.', 'Allez, {0}, même pas un message ? On a joué à un de moins.'],
    '{0}, você deu um bolo no time inteiro! Que vacilo...': ['{0}, you stood up the whole team! Not cool...', '{0}, ¡dejaste plantado a todo el equipo! Qué fallo...', '{0}, hai dato buca a tutta la squadra! Che figuraccia...', '{0}, tu as posé un lapin à toute l’équipe ! Pas cool...'],
    'Esperamos, esperamos... e nada de você, {0}. Vacilou feio.': ['We waited and waited... and no sign of you, {0}. You really blew it.', 'Esperamos, esperamos... y nada de ti, {0}. Fallaste feo.', 'Abbiamo aspettato, aspettato... e di te nessuna traccia, {0}. Brutta figura.', 'On a attendu, attendu... et toujours pas de toi, {0}. Vraiment pas cool.'],
    'Ô {0}, compromisso é compromisso! Seu nome tá na lista do time.': ['Hey {0}, a commitment is a commitment! Your name is on the team list.', 'Oye {0}, ¡un compromiso es un compromiso! Tu nombre está en la lista del equipo.', 'Ehi {0}, un impegno è un impegno! Il tuo nome è nella lista della squadra.', 'Hé {0}, un engagement, c’est un engagement ! Ton nom est sur la liste de l’équipe.'],
    'Torneio do Sintético': ['Turf Tournament', 'Torneo de la Sintética', 'Torneo del Sintetico', 'Tournoi du Synthétique'],
    'Torneio de Futsal': ['Futsal Tournament', 'Torneo de Futsal', 'Torneo di Calcetto', 'Tournoi de Futsal'],
    'TORNEIO DO SINTÉTICO': ['TURF TOURNAMENT', 'TORNEO DE LA SINTÉTICA', 'TORNEO DEL SINTETICO', 'TOURNOI DU SYNTHÉTIQUE'],
    'TORNEIO DE FUTSAL': ['FUTSAL TOURNAMENT', 'TORNEO DE FUTSAL', 'TORNEO DI CALCETTO', 'TOURNOI DE FUTSAL'],
    'Time do João': ['João’s Team', 'Equipo de João', 'Squadra di João', 'Équipe de João'],
    'Time do Caio': ['Caio’s Team', 'Equipo de Caio', 'Squadra di Caio', 'Équipe de Caio'],
    'Time do Biel': ['Biel’s Team', 'Equipo de Biel', 'Squadra di Biel', 'Équipe de Biel'],
    'A turma do racha: todo mundo se conhece e joga junto. Ninguém é craque, mas ninguém some no jogo.': ['The pickup-game crew: everyone knows each other and plays together. No stars, but nobody disappears in a game.', 'El grupo del picadito: todos se conocen y juegan juntos. Nadie es un crack, pero nadie desaparece en el partido.', 'Il gruppo della partitella: si conoscono tutti e giocano insieme. Nessun fenomeno, ma nessuno sparisce in partita.', 'La bande des matchs entre potes : tout le monde se connaît et joue ensemble. Pas de crack, mais personne ne disparaît pendant le match.'],
    'O time do outro lado do racha. A Júlia é a melhor jogadora do torneio e o Caio organiza tudo em campo.': ['The team from the other side of the pickup game. Júlia is the best player in the tournament and Caio runs everything on the field.', 'El equipo del otro lado del picadito. Júlia es la mejor jugadora del torneo y Caio organiza todo en la cancha.', 'La squadra dall’altra parte della partitella. Júlia è la migliore giocatrice del torneo e Caio organizza tutto in campo.', 'L’équipe de l’autre côté du match entre potes. Júlia est la meilleure joueuse du tournoi et Caio organise tout sur le terrain.'],
    'O favorito: ganhou os três últimos torneios do bairro. Toca rápido e finaliza de qualquer lugar.': ['The favorite: won the last three neighborhood tournaments. Quick passing, and they shoot from anywhere.', 'El favorito: ganó los tres últimos torneos del barrio. Toca rápido y remata desde cualquier lugar.', 'La favorita: ha vinto gli ultimi tre tornei del quartiere. Passaggi rapidi e tiri da ogni posizione.', 'Le favori : il a gagné les trois derniers tournois du quartier. Ça passe vite et ça frappe de partout.'],
    'Marca em cima o jogo inteiro e quase não toma gol. Quem faz gol neles merece aplauso.': ['They press the whole game and hardly concede. Anyone who scores on them deserves applause.', 'Presiona todo el partido y casi no le hacen goles. Quien les marca merece un aplauso.', 'Pressa per tutta la partita e non prende quasi mai gol. Chi segna contro di loro merita un applauso.', 'Ils pressent tout le match et n’encaissent presque rien. Celui qui leur marque un but mérite des applaudissements.'],
    'Os frentistas do posto da avenida. Fecham bem atrás e saem rápido no contra-ataque.': ['The attendants from the gas station on the avenue. Solid at the back and quick on the counterattack.', 'Los playeros de la gasolinera de la avenida. Cierran bien atrás y salen rápido al contraataque.', 'I benzinai della stazione di servizio sul viale. Chiudono bene dietro e ripartono veloci in contropiede.', 'Les pompistes de la station de l’avenue. Bien fermés derrière et rapides en contre-attaque.'],
    'Gosta de tocar a bola de pé em pé. O meio-campo é bom; atrás, sofre com quem é rápido.': ['They like to pass it around. Good midfield; at the back, they struggle against fast players.', 'Le gusta tocar la pelota de pie en pie. El mediocampo es bueno; atrás sufre con los rápidos.', 'Ama far girare la palla. Il centrocampo è buono; dietro soffre chi è veloce.', 'Ils aiment faire tourner le ballon. Le milieu est bon ; derrière, ils souffrent contre les joueurs rapides.'],
    'A pelada dos amigos que jogam toda quinta. Muita vontade, pouco fôlego no fim do jogo.': ['The friends who play every Thursday. Plenty of will, little breath at the end of the game.', 'El picadito de los amigos que juegan todos los jueves. Muchas ganas, poco aire al final del partido.', 'La partitella degli amici che giocano ogni giovedì. Tanta voglia, poco fiato a fine partita.', 'Le match des copains qui jouent tous les jeudis. Beaucoup d’envie, peu de souffle en fin de match.'],
    'Time novo, cheio de garotos. Corre muito, mas erra bastante passe e deixa espaço atrás.': ['A new team full of kids. They run a lot, but misplace plenty of passes and leave space at the back.', 'Equipo nuevo, lleno de chicos. Corre mucho, pero erra bastantes pases y deja espacio atrás.', 'Squadra nuova, piena di ragazzini. Corrono tanto, ma sbagliano parecchi passaggi e lasciano spazio dietro.', 'Équipe toute neuve, pleine de gamins. Ils courent beaucoup, mais ratent pas mal de passes et laissent de l’espace derrière.'],
    'Montado de última hora com quem apareceu. Fica todo mundo atrás e torce para o tempo passar.': ['Put together at the last minute with whoever showed up. Everyone stays back and hopes the clock runs out.', 'Armado a último momento con quien apareció. Todos se quedan atrás y rezan para que pase el tiempo.', 'Messa insieme all’ultimo minuto con chi si è presentato. Stanno tutti dietro e sperano che il tempo passi.', 'Montée à la dernière minute avec ceux qui sont venus. Tout le monde reste derrière en espérant que le temps passe.'],
    'A turma mais velha do bairro. Experiência não falta; perna, sim.': ['The oldest crew in the neighborhood. Plenty of experience; not so much legs.', 'El grupo más veterano del barrio. Experiencia no les falta; piernas, sí.', 'Il gruppo più anziano del quartiere. L’esperienza non manca; le gambe sì.', 'La bande la plus âgée du quartier. L’expérience ne manque pas ; les jambes, si.'],
    'A galera da quadra de terça e quinta. O Duda pega muito no gol e o Biel arma o jogo.': ['The Tuesday and Thursday court crew. Duda is great in goal and Biel runs the play.', 'La banda de la cancha de los martes y jueves. Duda ataja muchísimo y Biel arma el juego.', 'Il gruppo del campetto del martedì e giovedì. Duda para tutto in porta e Biel imposta il gioco.', 'La bande du terrain du mardi et du jeudi. Duda arrête tout dans les buts et Biel organise le jeu.'],
    'Os rivais de sempre da quadra. Conhecem cada canto dela e marcam bem.': ['The court’s usual rivals. They know every corner of it and defend well.', 'Los rivales de siempre de la cancha. Conocen cada rincón y marcan bien.', 'I rivali di sempre del campetto. Ne conoscono ogni angolo e marcano bene.', 'Les rivaux de toujours du terrain. Ils en connaissent chaque recoin et défendent bien.'],
    'O time da escolinha de futsal: técnica de sobra e um goleiro que parece um paredão.': ['The futsal school team: technique to spare and a goalkeeper like a brick wall.', 'El equipo de la escuelita de futsal: técnica de sobra y un arquero que parece una pared.', 'La squadra della scuola di calcetto: tecnica da vendere e un portiere che sembra un muro.', 'L’équipe de l’école de futsal : de la technique à revendre et un gardien qui fait figure de mur.'],
    'Drible, pedalada e caneta: joga bonito e não tem medo de arriscar.': ['Dribbles, step-overs and nutmegs: they play pretty and aren’t afraid to take risks.', 'Gambeta, bicicleta y caño: juega lindo y no tiene miedo de arriesgar.', 'Dribbling, doppi passi e tunnel: giocano bene e non hanno paura di rischiare.', 'Dribbles, passements de jambes et petits ponts : ils jouent beau et n’ont pas peur de tenter.'],
    'Joga para o pivô: bola nele, giro e chute. O ataque é o ponto forte.': ['They play through the pivot: ball to him, turn and shoot. Attack is their strength.', 'Juega para el pívot: pelota a él, giro y remate. El ataque es su punto fuerte.', 'Giocano per il pivot: palla a lui, giro e tiro. L’attacco è il punto forte.', 'Ils jouent pour le pivot : ballon sur lui, pivot et frappe. L’attaque est leur point fort.'],
    'Ninguém corre mais que eles. Se der espaço, é contra-ataque e gol.': ['Nobody runs faster than them. Give them space and it’s a counterattack and a goal.', 'Nadie corre más que ellos. Si les das espacio, es contraataque y gol.', 'Nessuno corre più di loro. Se lasci spazio, è contropiede e gol.', 'Personne ne court plus vite qu’eux. Si tu leur laisses de l’espace, c’est contre-attaque et but.'],
    'Joga fechado e aposta no goleiro. Quando sai para o ataque, quase não acerta o gol.': ['They sit deep and rely on the goalkeeper. When they go forward, they rarely hit the target.', 'Juega cerrado y confía en el arquero. Cuando sale al ataque, casi no acierta al arco.', 'Giocano chiusi e puntano sul portiere. Quando attaccano, quasi non centrano la porta.', 'Ils jouent bas et misent sur le gardien. Quand ils attaquent, ils cadrent rarement.'],
    'Time esforçado, sem ninguém que se destaque. Erra pouco, mas cria pouco também.': ['A hard-working team with no standout player. Few mistakes, but few chances too.', 'Equipo esforzado, sin nadie que se destaque. Erra poco, pero también crea poco.', 'Squadra volenterosa, senza nessuno che spicchi. Sbaglia poco, ma crea anche poco.', 'Équipe appliquée, sans personne qui sorte du lot. Peu d’erreurs, mais peu d’occasions aussi.'],
    'O goleiro é o ponto fraco: chute de longe neles costuma entrar.': ['The goalkeeper is their weak spot: long shots against them tend to go in.', 'El arquero es el punto débil: los remates de lejos suelen entrar.', 'Il portiere è il punto debole: i tiri da lontano di solito entrano.', 'Le gardien est leur point faible : les frappes de loin rentrent souvent.'],
    'Primeiro torneio deles. Muita disposição e pouca experiência de quadra.': ['Their first tournament. Lots of energy and little court experience.', 'Su primer torneo. Muchas ganas y poca experiencia en la cancha.', 'Il loro primo torneo. Tanta voglia e poca esperienza di campetto.', 'Leur premier tournoi. Beaucoup d’énergie et peu d’expérience du terrain.'],
  };
  if (typeof I18N !== 'undefined') for (const k of Object.keys(TRAD)) if (!I18N[k]) I18N[k] = TRAD[k];
  // iguais em português nos dois gêneros, mas que mudam no feminino em outro idioma (presentata, venue, entrata...)
  if (typeof FEM_TRAD !== 'undefined') Object.assign(FEM_TRAD, {
    'Pô, {0}, que vacilo! Você não apareceu no jogo...': [null, null, 'Dai, {0}, che figuraccia! Non ti sei presentata alla partita...', 'Franchement, {0}, pas cool ! Tu n’es pas venue au match...'],
    'Ô {0}, cadê você? A gente te esperou até o último minuto!': [null, null, null, 'Hé {0}, t’étais où ? On t’a attendue jusqu’à la dernière minute !'],
    'Você entrou no {0}!': [null, null, 'Sei entrata nel {0}!', null],
  });
  if (typeof FEM_PT !== 'undefined') Object.assign(FEM_PT, { 'Você já tá inscrito no time: aparece!': 'Você já tá inscrita no time: aparece!', 'E você, {0}? Jogou demais! Foi o melhor em campo.': 'E você, {0}? Jogou demais! Foi a melhor em campo.' });

  window.FutebolJS.registrarFase({ id: 'torneios', nome: 'Torneios do sintético e do futsal', nucleoMinimo: '7.5.11', iniciar: async () => {}, criar, dados: { DEF } });
})();
