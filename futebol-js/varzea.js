/* =====================================================================================================================
   varzea.js — O CAMPEONATO DE VÁRZEA do Campo Henrique Antônio (módulo da cidade, como a barbearia.js).
   - Registrado com FutebolJS.registrarFase({ id: 'varzea' }) só para o jogo saber baixar o arquivo; NÃO roda como fase.
     A cidade (cidade.js) baixa em segundo plano e chama criar(api) (api = apiVarzea() da cidade).
   - O OLHEIRO: depois de 10 jogos bons (sintético + futsal, nota 8+), o Rafa (que joga no time do João no sintético) aparece
     com a exclamação em frente ao portão da várzea e chama o jogador para o time do Peladão FC. Prêmio do campeão: 5.000 fakes,
     divididos no time; a parte do jogador fica em PREMIO_JOG (625).
   - O CAMPEONATO: 10 times (TIMES_VZ), todos contra todos em turno único (9 rodadas), os 4 melhores vão para a semifinal
     (1º x 4º e 2º x 3º, jogo único, empate vai para os pênaltis) e os dois vencedores fazem a final. Sábado às 14h e domingo
     às 10h (fora do horário de qualquer emprego: cafeteria 8–16h, mercado 14–22h nos dias úteis, pizzaria 17–24h).
   - Os times: cada jogador tem as 15 habilidades do motor (hab), geradas pela semente; a ESTRELA do time sai da média dos 7
     titulares (média dos atributos que importam na posição de cada um). Um time pode ter um setor muito acima do resto
     (TIMES_VZ[].setores), e isso aparece na pré-partida ("joga bem: ...").
   - DIA DE JOGO: a torcida chega entre 2 h e 1 h antes (bancos, arquibancada, em pé na cerca); de 1 h antes até meia hora
     depois do horário, o portão da várzea leva para o vestiário: cena andando até a casinha da escada, descendo, o vestiário
     subterrâneo (o jogador de uniforme conversando com o técnico, o Seu Damião), a PRÉ-PARTIDA (páginas que deslizam: o
     confronto com os emblemas e a encarada, os times, as escalações com a média de cada jogador e o que o técnico quer) e a
     partida de 5 minutos na "Várzea cidadezinha" (2 h no relógio da cidade). Quem não vai, o time joga sem ele (simulado).
   - ESTATÍSTICAS: gols, assistências, passes, notas de todo mundo (o jogo de verdade pela súmula do motor; os outros jogos
     simulados) para os prêmios do fim: melhor jogador, artilheiro e líder de assistências. A carreira do jogador fica em
     d.carreira.varzea (o app Carreira do computador do quarto mostra sintético, futsal e várzea).
   ===================================================================================================================== */
(() => {
  'use strict';
  const PREMIO_TOTAL = 5000, PREMIO_JOG = Math.round(PREMIO_TOTAL / 8);     // a parte do jogador no prêmio do campeão
  const BONS_PARA_OLHEIRO = 10;                                              // jogos bons (sintético + futsal) para o Rafa aparecer
  const H_SAB = 14, H_DOM = 10, DURACAO = 300;                               // horários dos jogos e a partida de 5 minutos
  const NOSSO = 'peladao';

  // ============================================================================================ OS 10 TIMES
  //   setores: a média que cada setor tem (1 a 10) — gk goleiro, def defesa, mid meio, fwd ataque. forte/fraco: o comentário
  //   da pré-partida. formacao: as chaves do motor (com 6 na linha: '4-4-2' = 2-3-1, '4-3-3' = 2-2-2, '5-3-2' = 3-2-1,
  //   '3-5-2' = 2-3-1, '4-2-3-1' = 2-1-2-1). As mulheres do elenco têm um F no fim do nome (ex.: 'Gali:F').
  const TIMES_VZ = [
    { k: 'trovao', nome: 'Trovão da Serra', sigla: 'TDS', tecnico: 'Professor Anísio', setores: { gk: 7.4, def: 7.2, mid: 7.6, fwd: 8.6 }, formacao: '4-4-2', tatica: 'falso9',
      nota: 'O ataque mais perigoso do campeonato: chute de fora, cabeceio e velocidade. O resto do time também é muito bom.', forte: 'fwd',
      uni: ['#5b3fa0', '#f2c230', '#f2c230', '#2a1b55', '#5b3fa0', '#f2c230', '#1f9e5c'], uni2: ['#f2f0e6', '#5b3fa0', '#5b3fa0', '#f2f0e6', '#f2f0e6', '#5b3fa0', '#1f9e5c'],
      elenco: ['Raio', 'Tavinho', 'Serrano', 'Juca Bala', 'Nenê Trovão', 'Gaúcho', 'Pipoca', 'Zé Relâmpago', 'Dodô', 'Cacau', 'Tuim', 'Mané Chuva'] },
    { k: 'chumbo', nome: 'Pé de Chumbo', sigla: 'PDC', tecnico: 'Dona Zuleide', setores: { gk: 8.4, def: 8.7, mid: 7.3, fwd: 6.6 }, formacao: '5-3-2', tatica: 'retranca',
      nota: 'A defesa é uma muralha: zagueiros fortes no desarme e o melhor goleiro da várzea. Na frente, é um time comum.', forte: 'def',
      uni: ['#1c1c1f', '#a6d13a', '#a6d13a', '#1c1c1f', '#1c1c1f', '#a6d13a', '#e8742a'], uni2: ['#a6d13a', '#1c1c1f', '#1c1c1f', '#a6d13a', '#a6d13a', '#1c1c1f', '#e8742a'],
      elenco: ['Muralha', 'Tijolo', 'Bigorna', 'Cimento', 'Zé Ferro', 'Concreto', 'Chumbinho', 'Martelo', 'Tranca', 'Rocha', 'Bloco', 'Prego'] },
    { k: 'canela', nome: 'Canela de Ferro', sigla: 'CDF', tecnico: 'Seu Bráulio', setores: { gk: 6.8, def: 8.0, mid: 6.4, fwd: 5.5 }, formacao: '5-3-2', tatica: 'retranca',
      nota: 'Marcação pesada e zagueiros que ganham quase toda dividida. Faz poucos gols: o ataque é o ponto fraco.', forte: 'def', fraco: 'fwd',
      uni: ['#8e1f24', '#b9bec6', '#b9bec6', '#f2f0e6', '#8e1f24', '#b9bec6', '#1c1c1f'], uni2: ['#b9bec6', '#8e1f24', '#8e1f24', '#8e1f24', '#b9bec6', '#8e1f24', '#1c1c1f'],
      elenco: ['Canelão', 'Botina', 'Ferrugem', 'Zé Caneleira', 'Parafuso', 'Tatu', 'Brutus', 'Lata', 'Chapa', 'Malhado', 'Pino', 'Joca'] },
    { k: 'coruja', nome: 'Coruja da Madrugada', sigla: 'CM', tecnico: 'Tio Neco', setores: { gk: 6.4, def: 6.3, mid: 7.9, fwd: 6.6 }, formacao: '3-5-2', tatica: 'tikitaka',
      nota: 'O meio-campo mais técnico do campeonato: toca a bola, cansa o adversário e espera o espaço aparecer.', forte: 'mid',
      uni: ['#1c2340', '#c9d2e6', '#ffe066', '#1c2340', '#1c2340', '#ffe066', '#c8352b'], uni2: ['#c9d2e6', '#1c2340', '#1c2340', '#c9d2e6', '#c9d2e6', '#1c2340', '#c8352b'],
      elenco: ['Pestana', 'Sereno', 'Lampião', 'Boêmio', 'Zé Lua', 'Vigia', 'Bacurau', 'Noitinha:F', 'Seresta', 'Tico', 'Sonâmbulo', 'Neblina'] },
    { k: 'jacares', nome: 'Jacarés do Lago', sigla: 'JDL', tecnico: 'Mestre Jacinto', setores: { gk: 6.0, def: 5.6, mid: 6.6, fwd: 8.1 }, formacao: '4-3-3', tatica: 'contra',
      nota: 'Três atacantes rápidos e que finalizam muito bem. Em compensação, a defesa deixa espaço e erra bastante.', forte: 'fwd', fraco: 'def',
      uni: ['#1f7a4d', '#f2c230', '#f2c230', '#f2c230', '#1f7a4d', '#f2c230', '#2f7fb8'], uni2: ['#f2c230', '#1f7a4d', '#1f7a4d', '#1f7a4d', '#f2c230', '#1f7a4d', '#2f7fb8'],
      elenco: ['Bocão', 'Dentinho', 'Lagoa', 'Escama', 'Mergulho', 'Zé Lama', 'Rabo Duro', 'Bagre', 'Piranha:F', 'Tainha', 'Correnteza', 'Taboa'] },
    { k: 'galo', nome: 'Galo Doido', sigla: 'GD', tecnico: 'Seu Galdino', setores: { gk: 5.4, def: 5.3, mid: 5.8, fwd: 6.7 }, formacao: '4-3-3', tatica: 'contra', rapido: true,
      nota: 'Time mediano, mas com pontas muito rápidos que gostam de puxar o contra-ataque. Atrás, sofre com bola alta.', forte: 'fwd',
      uni: ['#f4f1e6', '#c8352b', '#c8352b', '#c8352b', '#f4f1e6', '#c8352b', '#1c1c1f'], uni2: ['#c8352b', '#f4f1e6', '#f4f1e6', '#f4f1e6', '#c8352b', '#f4f1e6', '#1c1c1f'],
      elenco: ['Crista', 'Esporão', 'Pintinho', 'Carijó', 'Zé Galo', 'Cocoricó', 'Garnisé', 'Penacho', 'Milho', 'Bico', 'Gali:F', 'Poleiro'] },
    { k: 'formiga', nome: 'Vila Formiga', sigla: 'VF', tecnico: 'Dona Cida', setores: { gk: 6.6, def: 6.2, mid: 6.1, fwd: 5.0 }, formacao: '4-2-3-1', tatica: 'tikitaka',
      nota: 'Todo mundo corre e marca junto, com um bom goleiro. Só falta alguém para fazer os gols: o centroavante é fraco.', forte: 'gk', fraco: 'fwd',
      uni: ['#7a1f2b', '#e8c27a', '#e8c27a', '#e8c27a', '#7a1f2b', '#e8c27a', '#1f7a4d'], uni2: ['#e8c27a', '#7a1f2b', '#7a1f2b', '#7a1f2b', '#e8c27a', '#7a1f2b', '#1f7a4d'],
      elenco: ['Formigão', 'Saúva', 'Tanajura', 'Formiguinha', 'Doceiro', 'Carreiro', 'Trilha', 'Miúdo', 'Operário', 'Zé Açúcar', 'Picadinha', 'Rainha:F'] },
    { k: 'peladao', nome: 'Peladão FC', sigla: 'PFC', tecnico: 'Seu Damião', setores: { gk: 6.2, def: 5.8, mid: 6.0, fwd: 5.8 }, formacao: '4-4-2', tatica: 'tikitaka',
      nota: 'Um time equilibrado, sem estrela: ninguém é muito melhor que ninguém. Depende de jogar junto.', forte: null,
      uni: ['#e8742a', '#1f2a44', '#1f2a44', '#1f2a44', '#e8742a', '#1f2a44', '#2a72d6'], uni2: ['#1f2a44', '#e8742a', '#e8742a', '#1f2a44', '#1f2a44', '#e8742a', '#2a72d6'],
      elenco: ['Biro', 'Magrão', 'Zezão', 'Kiko', 'Rafa', 'Paçoca', 'Neném', 'Marcão', 'Lelê:F', 'Teco', 'Fumaça'] },
    { k: 'sacode', nome: 'Sacode a Rede', sigla: 'SAR', tecnico: 'Tio Bigode', setores: { gk: 4.0, def: 3.9, mid: 4.8, fwd: 5.7 }, formacao: '4-3-3', tatica: 'aerea',
      nota: 'Gosta de cruzar e chutar de qualquer lugar. A defesa é a pior do campeonato e o goleiro é fraco.', forte: 'fwd', fraco: 'def',
      uni: ['#3fa7d6', '#f4f6f8', '#f4f6f8', '#f4f6f8', '#3fa7d6', '#f4f6f8', '#f2c230'], uni2: ['#f4f6f8', '#3fa7d6', '#3fa7d6', '#3fa7d6', '#f4f6f8', '#3fa7d6', '#f2c230'],
      elenco: ['Chutão', 'Trivela', 'Caneta', 'Zé Rede', 'Furacão', 'Bicicleta', 'Lambreta', 'Firula:F', 'Pedalada', 'Tabelinha', 'Cavadinha', 'Gingado'] },
    { k: 'murcha', nome: 'Bola Murcha', sigla: 'BM', tecnico: 'Seu Lorival', setores: { gk: 6.2, def: 4.6, mid: 4.2, fwd: 4.0 }, formacao: '5-3-2', tatica: 'retranca',
      nota: 'Fica todo mundo atrás e torce para o goleiro salvar. Quase não chega ao ataque.', forte: 'gk', fraco: 'fwd',
      uni: ['#8c9199', '#e8742a', '#e8742a', '#2a2e36', '#8c9199', '#e8742a', '#1f7a4d'], uni2: ['#e8742a', '#2a2e36', '#2a2e36', '#2a2e36', '#e8742a', '#2a2e36', '#1f7a4d'],
      elenco: ['Furado', 'Murchinho', 'Remendo', 'Zé Vazio', 'Bexiga', 'Fole', 'Pneu', 'Calibra', 'Chiado', 'Soprinho', 'Esvazia', 'Bombinha'] },
  ];
  const IDX = {}; TIMES_VZ.forEach((t, i) => { IDX[t.k] = i; });
  const NOSSO_I = IDX[NOSSO];
  // as linhas de cada formação com 6 jogadores de linha (as mesmas do motor, montarFormacao)
  const LINHAS6 = { '4-4-2': [2, 3, 1], '4-3-3': [2, 2, 2], '5-3-2': [3, 2, 1], '3-5-2': [2, 3, 1], '4-2-3-1': [2, 1, 2, 1] };
  const papeisDa = (formacao) => { const L = LINHAS6[formacao] || LINHAS6['4-4-2'], r = ['GK']; L.forEach((m, li) => { for (let i = 0; i < m; i++) r.push(li === 0 ? 'DEF' : li === L.length - 1 ? 'FWD' : 'MID'); }); return r; };
  const nomeFormacao = (formacao) => (LINHAS6[formacao] || [2, 3, 1]).join('-');
  // o que conta para a MÉDIA de cada posição (a média "geral" que aparece em cima do jogador: 55 = 5,5)
  const CONTA = {
    GK: { goleiro: 4, dominio: 1, passe: 1, forca: 1, defesa: 1, resistencia: 1 },
    DEF: { defesa: 2, desarme: 2, cabeceio: 1, forca: 1, velocidade: 1, resistencia: 1, passe: 1, dominio: 1 },
    MID: { passe: 2, drible: 1, dominio: 1, resistencia: 1, cruzamento: 1, defesa: 1, chute: 1, velocidade: 1 },
    FWD: { finalizacao: 2, chute: 1, velocidade: 1, drible: 1, dominio: 1, cabeceio: 1, efeito: 1, forca: 1 },
  };
  const HABS = ['defesa', 'desarme', 'forca', 'resistencia', 'recuperacao', 'velocidade', 'chute', 'efeito', 'passe', 'cruzamento', 'drible', 'dominio', 'cabeceio', 'finalizacao', 'goleiro'];
  const VIES = {
    GK: { goleiro: 2, defesa: 0, drible: -2, finalizacao: -3, chute: -1, cabeceio: -1 },
    DEF: { defesa: 1, desarme: 1, cabeceio: 1, finalizacao: -1, drible: -1, goleiro: -5 },
    MID: { passe: 1, drible: 1, resistencia: 1, goleiro: -5 },
    FWD: { finalizacao: 1, chute: 1, velocidade: 1, defesa: -1, desarme: -1, goleiro: -5 },
  };
  function mediaPos(hab, pos) {
    const W = CONTA[pos] || CONTA.MID; let s = 0, n = 0;
    for (const k in W) { s += (hab[k] != null ? hab[k] : 5) * W[k]; n += W[k]; }
    return s / n;
  }
  const r1 = (v) => Math.round(v * 10) / 10;
  const clampN = (v, a, b) => Math.max(a, Math.min(b, v));
  // gerador com semente (o mesmo do motor, se existir)
  const rndDe = (sem) => (typeof sorteador === 'function' ? sorteador(sem) : (() => { let a = sem >>> 0 || 1; return () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; }; })());
  const semDe = (txt) => (typeof sementeDe === 'function' ? sementeDe(txt) : [...String(txt)].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261));
  // as habilidades de UM jogador: a média da posição fica no alvo; o "jeito" de cada um (perfil) muda o resto
  function gerarHab(alvo, pos, sem, extra) {
    const r = rndDe(sem), V = VIES[pos] || {}, h = {};
    for (const n of HABS) h[n] = alvo + (V[n] || 0) * 0.8 + (r() - 0.5) * 2.2;
    if (extra) for (const n in extra) h[n] += extra[n];
    for (let it = 0; it < 3; it++) {                                     // acerta a média da posição no alvo (com o limite de 1 a 10)
      const m = mediaPos(h, pos), dlt = alvo - m;
      for (const n of HABS) h[n] = clampN(h[n] + dlt, 1, 10);
    }
    for (const n of HABS) h[n] = r1(h[n]);
    return h;
  }
  // o elenco de um time: 7 titulares (na ordem dos lugares da formação) e 5 reservas (um de cada setor e mais um)
  //   O nosso time não tem o jogador aqui: ele entra no lugar da posição dele (montarNosso).
  const ELENCOS = {};
  function elencoVz(t) {
    if (ELENCOS[t.k]) return ELENCOS[t.k];
    const pap = papeisDa(t.formacao), res = ['GK', 'DEF', 'MID', 'FWD', pap[2] === 'DEF' ? 'MID' : 'DEF'];
    const lista = t.k === NOSSO ? montarPapeisNosso(pap).concat(res) : pap.concat(res);
    const r = rndDe(semDe('vz-time|' + t.k)), out = [];
    lista.forEach((pos, i) => {
      const [nome0, g] = String(t.elenco[i] || ('Jogador ' + (i + 1))).split(':'), fem = g === 'F';
      const set = pos === 'GK' ? t.setores.gk : pos === 'DEF' ? t.setores.def : pos === 'MID' ? t.setores.mid : t.setores.fwd;
      const titular = i < (t.k === NOSSO ? 6 : 7);
      const alvo = clampN(set + (r() - 0.5) * 1.0 - (titular ? 0 : 0.7), 1.5, 9.8);
      const extra = t.rapido && pos === 'FWD' ? { velocidade: 2 } : null;
      const sem = semDe('vz|' + t.k + '|' + nome0);
      const ap = typeof gerarAparencia === 'function' ? gerarAparencia(sem, fem ? 'F' : 'M') : {};
      const j = Object.assign({ nome: nome0, genero: fem ? 'F' : 'M', semente: sem, pos, titular, hab: gerarHab(alvo, pos, sem, extra) }, ap);
      j.media = r1(mediaPos(j.hab, pos));
      out.push(j);
    });
    if (t.k === NOSSO) {                                                   // o Rafa é o olheiro: o rosto dele é o do sintético
      const rafa = out.find((j) => j.nome === 'Rafa');
      if (rafa && typeof gerarAparencia === 'function') Object.assign(rafa, gerarAparencia(6161, 'M'), { nome: 'Rafa', genero: 'M' });
    }
    return (ELENCOS[t.k] = out);
  }
  // os papéis do nosso time sem o lugar do jogador (o motor põe o jogador no 1º lugar da posição dele e os outros, na ordem)
  function posicaoJog() { const p = (typeof PERSONAGEM !== 'undefined' && PERSONAGEM.posicaoHist) || 'FWD'; return ['GK', 'DEF', 'MID', 'FWD'].includes(p) ? p : 'FWD'; }
  function montarPapeisNosso(pap) {
    const pos = posicaoJog(); let i = pap.indexOf(pos); if (i < 0) i = pap.indexOf('FWD');
    return pap.filter((x, k) => k !== i);
  }
  // a média do jogador (pelos atributos da história) na posição dele
  let atribJog = () => ({});
  const mediaJog = () => r1(mediaPos(atribJog(), posicaoJog()));
  // os 7 titulares do time em ordem de formação, cada um com { nome, pos, media, voce }
  function titulares(t) {
    const pap = papeisDa(t.formacao), E = elencoVz(t);
    if (t.k !== NOSSO) return pap.map((pos, i) => ({ nome: E[i].nome, pos, media: E[i].media, ap: E[i] }));
    const pos = posicaoJog(); let iu = pap.indexOf(pos); if (iu < 0) iu = pap.indexOf('FWD');
    let k = 0; return pap.map((p, i) => (i === iu ? { nome: nomeJogV(), pos: p, media: mediaJog(), voce: true } : { nome: E[k].nome, pos: p, media: E[k++].media, ap: E[k - 1] }));
  }
  function forcaTime(t) {
    const tt = titulares(t), m = tt.reduce((s, j) => s + j.media, 0) / tt.length;
    const set = (p) => { const l = tt.filter((j) => j.pos === p); return l.length ? l.reduce((s, j) => s + j.media, 0) / l.length : m; };
    return { media: r1(m), gk: r1(set('GK')), def: r1(set('DEF')), mid: r1(set('MID')), fwd: r1(set('FWD')) };
  }
  const estrelasDe = (m) => (m >= 7.2 ? 5 : m >= 6.4 ? 4 : m >= 5.4 ? 3 : m >= 4.4 ? 2 : 1);
  const estrelas = (t) => estrelasDe(forcaTime(t).media);
  let nomeJogV = () => 'Você';

  // ============================================================================================ OS EMBLEMAS (pixel art 32x32)
  const EMB_PX = {
    peladao: { pal: ['#1a1208', '#f2f0e6', '#ee9b66', '#5e6678', '#1f2a44', '#e8742a', '#171f32', '#e0a868', '#b8763a', '#8a4f22', '#d09050', '#6a3a18', '#f5f4ec', '#96958f', '#d0cec6', '#ac561f', '#f2c230'],
      px: '................................|................................|...aaaaaaaaaaaaaaaaaaaaaaaaaa...|...abbbbbbbbbbbbbbbbbbbbbbbba...|...abcccccccccccddddddddddeba...|...abcffffffffaaaaeeeeeeeegba...|...abcffffffahiijjaaeeeeeegba...|...abcfffffahiiajjjjaeeeeegba...|...abcfffffakiajjjjjaeeeeegba...|...abcffffaiiaaajjjajaeeeegba...|...abcffffaiajjjaaajjaeeeegba...|...abcffffaajjjjjajjjaeeeegba...|...abcffffajajjjjajjlaeeeegba...|...abcfffffaaajjaaalaeeeeegba...|...abcfffffajjaalllaaeeeeegba...|...abcffffffaajlllaaeeeeeegba...|...abcffffffffaaaaeeeeeeeegba...|...abcffffffffffeeeeeeeeeegba...|...abcffffffffffeeeeeeeeeegba...|..aaaaaaaaaaaaaaaaaaaaaaaaaaaa..|..ammmmmmmeemmeeemmeemmmmmmmma..|aaabbbbbbbebebebbbebbbbbbbbbbaaa|anabbbbbbbeebbeebbebbbbbbbbbbana|anabbbbbbbebbbebbbebbbbbbbbbbana|.aaoooooooeoooeooooeeooooooooaa.|anaaaaaaaaaaaaaaaaaaaaaaaaaaaana|ana...aaabbfffffeeeeebbaaa...ana|aaa.....aabbbppqqggbbbaa.....aaa|.........aaabbbqqbbbaaa.........|...........aaaaaaaaaa...........|...............aa...............|................................' },
    trovao: { pal: ['#1a1208', '#f2c230', '#8975bb', '#5b3fa0', '#432f76', '#fff6b0', '#ffd83a', '#f29a1e', '#f2f0e6', '#8773b7', '#583c9b', '#d8d4f0', '#412c73', '#8471b3', '#543a96', '#33226a', '#241650', '#3e2b6f', '#8270b1', '#513892', '#3c296c', '#806ead', '#4e358d', '#3a2768', '#7d6ba9', '#4a3288', '#372565', '#473083', '#f5d164', '#2a1b55', '#96781e', '#d0a729'],
      px: '................................|...aaaaaaa...aaaaaa...aaaaaaa...|...abbbbba...abbbba...abbbbba...|...abccdba...abcdba...abccdba...|...abcddbaaaaabdabaaaaabddeba...|...abcddbbbbbbbafbbbbbbbddeba...|...abcddddcccdafgghaccddddeba...|...abcdddddddafgghadddddddeba...|...abcddddddaggghaadddddddeba...|...abcdddddagggggghaddddddeba...|...abcddddddaaagghadddddddeba...|...abcdddddddagghaddddddddeba...|...abcddddddagghaiddddddddeba...|...abjkkkkkagghailikkkkkkkmba...|...abnooooaghaapppqqoooooorba...|...abstttagaattpppqqttttttuba...|...abvwwilawwwppppqqqwwwiwxba...|...abyzzppqzzpppppqqqqziliAba...|...abbBpppqqppppppqqqqpppqbba...|...aabppppqqppppppqqqqpppqbaa...|....abbpppqpppppppqqqppppbba....|....aabbppppppppppqqppppbbaa....|..aaaaaaaaaaaaaaaaaaaaaaaaaaaa..|..aCCCCCCCDDDCDDCCCDDCCCCCCCCa..|aaabbbbbbbbDbbDbDbDbbbbbbbbbbaaa|aEabbbbbbbbDbbDbDbbDbbbbbbbbbaEa|aEabbbbbbbbDbbDbDbbbDbbbbbbbbaEa|.aaFFFFFFFFDFFDDFFDDFFFFFFFFFaa.|aEaaaaaaaaaaaaaaaaaaaaaaaaaaaaEa|aEa...........aaaa...........aEa|aaa............aa............aaa|................................' },
    canela: { pal: ['#1a1208', '#b9bec6', '#ae5e61', '#945659', '#6a1418', '#8e1f24', '#d5dae0', '#9aa1ab', '#4e0f12', '#ffffff', '#69171b', '#2b2b30', '#5a606a', '#caced4', '#73767b', '#9fa3aa'],
      px: '................................|................................|...aaaaaaaaaaaaaaaaaaaaaaaaaa...|...abbbbbbbbbbbbbbbbbbbbbbbba...|...abcccddddaaaaaaaaccccddeba...|...abcfeeeeaggggghhhaffeeeiba...|...abceeeeagjggggghhhaeeeekba...|...abdeeeaaaaaaaaaaaaaaeefkba...|...abdeefallllllllllllaeffkba...|...abdeffaaaaaaaaaaaaaafffkba...|...abdffffagggggghhhaeffffiba...|...abcfffeagjgggghhhaffffeiba...|...abcffeeagggmgghmhafffeeiba...|...abcfeeeagggggghhhaffeeeiba...|...abceeeaaaaaaaaaaaaaaeeekba...|...abdeeeallllllllllllaeefkba...|...abdeefaaaaaaaaaaaaaaeffkba...|...abdeffffagggghhaeeeefffkba...|...abdffffeeaaaaaaeeeeffffiba...|...abbfffeeeeffffeeeeffffebba...|..aaaaaaaaaaaaaaaaaaaaaaaaaaaa..|..annnnnnnneeneenneeennnnnnnna..|aaabbbbbbbebbbebebebbbbbbbbbbaaa|aoabbbbbbbebbbebebeebbbbbbbbbaoa|aoabbbbbbbebbbebebebbbbbbbbbbaoa|.aappppppppeepeeppeppppppppppaa.|aoaaaaaaaaaaaaaaaaaaaaaaaaaaaaoa|aoa.....aabbbkkffiibbbaa.....aoa|aaa......aaabbbbbbbbaaa......aaa|...........aaaaaaaaaa...........|...............aa...............|................................' },
    galo: { pal: ['#1a1208', '#c8352b', '#b8261f', '#e04a3a', '#f4f1e6', '#f7f5ed', '#ffffff', '#f2c230', '#d99a1a', '#b5b2aa', '#d8d4c8', '#eeeada', '#e8e2cc', '#aca797', '#d66860', '#7c211b', '#ac2e25'],
      px: '................................|..............aaaa..............|..........aaaaabbaaaaa..........|........aaabbbbbbbbbbaaa........|.......aabbbcddcdeffbbbaa.......|......aabbcccccccdeeeebbaa......|.....aabbccccccccdaeeeebbaa.....|....aabbgggggggggggaeeeebbaa....|...aabbgggggaaaaggggaeeeebbaa...|...abbaggggaggggagggaeeeeebba...|..aabeaggggagaagaggggaaeeeebaa..|..abbagggggagaagagggghhaeeebba..|..abfaggggggaaaagggghhhiaeejba..|..abfagkggggggggggggaiiaeeejba..|.aabeeagkggggggggggadaaeeeeebaa.|.abbeeagkgggggggggadcdaeeeeebba.|.abbeeeagkgggggggaadcdaeeeeebba.|.aabeeeeaakgggggaeeadaeeeeeebaa.|..abfeeeeeaaaaaaeeeeaeeeeeejba..|..ablmmmmmmmmmmmmmmmmmmmmmmnba..|..aaaaaaaaaaaaaaaaaaaaaaaaaaaa..|..aooooooooooeeoeeoooooooooooa..|aaabbbbbbbbbebbbebebbbbbbbbbbaaa|apabbbbbbbbbebebebebbbbbbbbbbapa|apabbbbbbbbbebebebebbbbbbbbbbapa|.aaqqqqqqqqqqeeqeeqqqqqqqqqqqaa.|apaaaaaaaaaaaaaaaaaaaaaaaaaaaapa|apa....aabbbnnmmmmnnbbbaa....apa|aaa.....aaabbbbbbbbbbaaa.....aaa|..........aaaaabbaaaaa..........|..............aaaa..............|................................' },
    jacares: { pal: ['#1a1208', '#0f4a2c', '#f6d36a', '#f7d85a', '#f2c230', '#b39024', '#2f9a5a', '#ffe066', '#1f7a4d', '#14502f', '#ffffff', '#a8323a', '#69a3cc', '#2f7fb8', '#235e88', '#8fd0f0', '#4b7761', '#092e1b', '#0d4026'],
      px: '................................|................................|...aaaaaaaaaaaaaaaaaaaaaaaaaa...|...abbbbbbbbbbbbbbbbbbbbbbbba...|...abcccdcccdcccdcccdcccdceba...|...abcedeaaaaeedeeedeeedeefba...|...abcdeaggggadeeedeeedeeedba...|...abdeaghahggaeedeeedeeedfba...|...abceagggggggaaaaaaaaadefba...|...abcaggiggigggggggggggaafba...|...abcagigggggiggggggggggafba...|...abcagggggggggggggggggjafba...|...abcaakakakakakakakakaaafba...|...abcalllllllllllllllllaefba...|...abcaakakakakakakakakaaefba...|...abcaggggggggggggggggaeefba...|...abceaiggiggiggigggaaeeefba...|...abmnnaaaaaaaaaaaaannnnnoba...|...abmnnnnnnnnnnnnnnnnnnnnoba...|...abbpnnppnnppnnppnnppnnpbba...|...aabnnnnnnnnnnnnnnnnnnnnbaa...|....abmnnnnnnnnnnnnnnnnnnoba....|....abbpnnppnnppnnppnnppnbba....|..aaaaaaaaaaaaaaaaaaaaaaaaaaaa..|..aqqqqqqqqqeqeeqqeqqqqqqqqqqa..|aaabbbbbbbbbebebebebbbbbbbbbbaaa|arabbbbbbbbbebebebebbbbbbbbbbara|arabbbbbbbebebebebebbbbbbbbbbara|.aassssssssesseesseeessssssssaa.|araaaaaaaaaaaaaaaaaaaaaaaaaaaara|ara............aa............ara|aaa..........................aaa' },
    sacode: { pal: ['#1a1208', '#f4f6f8', '#75c0e1', '#8acfed', '#3fa7d6', '#5cbce6', '#ffffff', '#c9d2da', '#2f7c9e', '#e8eef2', '#1c4a66', '#ffe066', '#f7f8fa', '#97999a', '#d2d4d5'],
      px: '................................|................................|.....aaaaaaaaaaaaaaaaaaaaaa.....|....aabbbbbbbbbbbbbbbbbbbbaa....|...aabbcdddddcccccdddddccbbaa...|..aabbeefffffeeeeefffffeeebbaa..|..abbeggggggggggggggggggggebba..|..abceghhhhhhhhhhhhhhhhhhgeiba..|..abceghjkjjkjjkjjkjjkjjhgeiba..|..abceghkjkkjkkjkaaaajkkhgeiba..|..abceghjkjjkjjkaggagajjhgeiba..|..abceghjkljkjjagagggaajhgeiba..|..abceghkjkljkkagggaggakhgeiba..|..abceghjkjjljjaaggggaajhgeiba..|..abceghjljjkjjaggagggajhgeiba..|..abceghkjkljkkjaggagakkhgeiba..|..abceghjkjjljjkjaaaakjjhgeiba..|..abceghjkjjkjjkjjkjjkjjhgeiba..|..abceghkjkkjkkjkkjkkjkkhgeiba..|..abceghjkjjkjjkjjkjjkjjhgeiba..|..abceeefffffeeeeefffffeeeeiba..|..aaaaaaaaaaaaaaaaaaaaaaaaaaaa..|..ammmmmmmmkkmmkmmkkmmmmmmmmma..|aaabbbbbbbkbbbkbkbkbkbbbbbbbbaaa|anabbbbbbbbkbbkkkbkkbbbbbbbbbana|anabbbbbbbbbkbkbkbkbkbbbbbbbbana|.aaoooooookkookokokokooooooooaa.|anaaaaaaaaaaaaaaaaaaaaaaaaaaaana|ana.aabbbbbbbbbbbbbbbbbbbbaa.ana|aaa..aaaaaaaaaaaaaaaaaaaaaa..aaa|................................|................................' },
    formiga: { pal: ['#1a1208', '#e8c27a', '#9f5e66', '#7a1f2b', '#ffffff', '#3a2a22', '#5a1720', '#88565d', '#5a141e', '#430f16', '#eed19b', '#90784c', '#c8a769'],
      px: '................................|............aaaaaaaa............|...........aabbbbbbaa...........|.........aaabbccccbbaaa.........|........aabbbddddddbbbaa........|.......aabbddddddddddbbaa.......|......aabbddddddddddddbbaa......|....aaabbddddddddddddddbbaaa....|...aabbbdddddadddaddddddbbbaa...|..aabbddddddddadadddddddddbbaa..|..abbddddddeeedaaadddddddddbba..|..abcdddddeaeeeaffaddddddddgba..|..abcdddddeeeaeafeaaaadddddgba..|..abcdddddeaeeeaaaffffaaaddgba..|..abcddddddeeeddafffaffffadgba..|..abcdddddddddddaaaaaffffadgba..|..abhiiiiiiiiiiaiaiaaaffaiijba..|..abhiiiiiiiiiaiiaiiaiaaiiijba..|..abhiiiiiiiiaiiiaiiiaiiiiijba..|..abhiiiiiiiiiiiiiiiiiiiiiijba..|..abhiiiiiiiiiiiiiiiiiiiiiijba..|..aaaaaaaaaaaaaaaaaaaaaaaaaaaa..|..akkkkkkkkkikikiiikkkkkkkkkka..|aaabbbbbbbbbibibibbbbbbbbbbbbaaa|alabbbbbbbbbibibiibbbbbbbbbbbala|alabbbbbbbbbibibibbbbbbbbbbbbala|.aammmmmmmmmmimmimmmmmmmmmmmmaa.|alaaaaaaaaaaaaaaaaaaaaaaaaaaaala|ala......aaabbjjjjbbaaa......ala|aaa........aabbbbbbaa........aaa|............aaaaaaaa............|................................' },
    coruja: { pal: ['#1a1208', '#c9d2e6', '#5c6175', '#1c2340', '#8a6a4a', '#fff6b0', '#ffe066', '#151a2f', '#f29a1e', '#c9a67a', '#141a30', '#d6ddec', '#7d828f', '#adb5c6'],
      px: '................................|..............aaaa..............|..........aaaaabbaaaaa..........|........aaabbbbbbbbbbaaa........|.......aabbbccddddccbbbaa.......|......aabbddddddddddddbbaa......|.....aabbdaaddddddddaadbbaa.....|....aabbdaeeaddddddaeeafbbaa....|...aabbddaeeeaaaaaaeeeaggbbaa...|...abbdfdaeaaaeeeeaaaeagddbba...|..aabddddaagggaeeagggaagdddbaa..|..abbddddaggaggaaggaggaggddbba..|..abcddddagaaagaagaaagaddfdhba..|..abcdfddaggaggaiggaggaddddhba..|.aabdddddaagggaiiiaggaadddddbaa.|.abbdddddfaeaaeaiaeaaeadddddbba.|.abbddddddaejeeeaeejeaddddddbba.|.aabddddddaeejeeeejeeaddddddbaa.|..abcddddddaeejeejeeaddddddhba..|..abcdddddddaaeeeeaadddddddhba..|..abbkkkkkkkkkkkkkkkkkkkkkkbba..|..aaaaaaaaaaaaaaaaaaaaaaaaaaaa..|..alllllllllkklklllkllllllllla..|aaabbbbbbbbkbbbkkbkkbbbbbbbbbaaa|amabbbbbbbbkbbbkbkbkbbbbbbbbbama|amabbbbbbbbkbbbkbbbkbbbbbbbbbama|.aannnnnnnnnkknknnnknnnnnnnnnaa.|amaaaaaaaaaaaaaaaaaaaaaaaaaaaama|ama.....aaabbbbbbbbbbaaa.....ama|aaa.......aaaaabbaaaaa.......aaa|..............aaaa..............|................................' },
    murcha: { pal: ['#1a1208', '#e8742a', '#acb0b6', '#9fa3a9', '#7a7f88', '#8c9199', '#5a5e65', '#dfe6f2', '#f2f0e6', '#e8b48a', '#d09060', '#3a3a40', '#c9c4b4', '#ee975f', '#2a1206', '#90481a', '#c86424', '#686b71'],
      px: '................................|................................|...aaaaaaaaaaaaaaaaaaaaaaaaaa...|...abbbbbbbbbbbbbbbbbbbbbbbba...|...abcccccccccccddddddddddeba...|...abcffffffffffeeeeeeeeeegba...|...abchfffffffffeeeeeeeeeehba...|...abcffffffaaaaaaaaeeeeehgba...|...abhfffaaaiiiiiaaaaaeeeegba...|...abcffaiiiiaaaiajkjkaaeegba...|...abcfaiiiialllaiajkjkaaegba...|...abcfaiiiiiaaaiiiaaaaaaegba...|...abcaaaiiiiiiiiiiiaaiiiagba...|...abcaimaaiiiiiiiialllaiagba...|...abcaiiiiaaiiiiiiiaaaiiagba...|...abcfaiiiimaaaaaaaamiiaegba...|...abcffaaiiiiiiiiiiiiaaeegba...|...abcffffaaaaaaaaaaaaeeeegba...|...abcffffffffffeeeeeeeeeegba...|...abbffffffffffeeeeeeeeeebba...|..aaaaaaaaaaaaaaaaaaaaaaaaaaaa..|..annnnnnnnoonnonnnonnnnnnnnna..|aaabbbbbbbbobobooboobbbbbbbbbaaa|apabbbbbbbboobbobobobbbbbbbbbapa|apabbbbbbbbobobobbbobbbbbbbbbapa|.aaqqqqqqqqooqqoqqqoqqqqqqqqqaa.|apaaaaaaaaaaaaaaaaaaaaaaaaaaaapa|apa.....aabbbrrfeggbbbaa.....apa|aaa......aaabbbbbbbbaaa......aaa|...........aaaaaaaaaa...........|...............aa...............|................................' },
    chumbo: { pal: ['#1a1208', '#a6d13a', '#5c5c5e', '#636366', '#26262b', '#1c1c1f', '#151517', '#b4bac2', '#eef1f4', '#1c1c20', '#d8f06a', '#ffffff', '#8d949c', '#5f656d', '#4a4f57', '#bcdc6b', '#678224', '#8fb432'],
      px: '................................|...aaaaaaa...aaaaaa...aaaaaaa...|...abbbbba...abbbba...abbbbba...|...abcdeba...abcfba...abddeba...|...abdeebaaaaabffbaaaaabeegba...|...abdefbbbbbbbfebbbbbbbefgba...|...abdaaaaadcffeeefccdeeffgba...|...abcahihhaffeeefffeeefffjba...|...abcahhhhafeeefffeeeffkejba...|...abcahhhhhaaefffeeeffkeejba...|...abdahhhhhllaafeeefffeekgba...|...abahhhhhlmlmlaaefffeeefgba...|...abahhhhhhlmlmlhaafeeeffkba...|...abahhhhhhhhhhhhhhaaefffjba...|...abahhhhhhhmmmmmmmmmnafejba...|...abaoooooooooooooooooobejba...|...abdabbfaaaefbaaeebaabkbgba...|...abdefffeeefffeeefffbklkbba...|...abbfffeeefffeeefffeebkbbba...|...aabffeeefffeeefffeeefbfbaa...|....abbeeefffeeefffeeefffbba....|..aaaaaaaaaaaaaaaaaaaaaaaaaaaa..|..apppppppffppffpppffppppppppa..|aaabbbbbbbfbfbfbfbfbbbbbbbbbbaaa|aqabbbbbbbffbbfbfbfbbbbbbbbbbaqa|aqabbbbbbbfbbbfbfbfbbbbbbbbbbaqa|.aarrrrrrrfrrrffrrrffrrrrrrrraa.|aqaaaaaaaaaaaaaaaaaaaaaaaaaaaaqa|aqa.........aaabbaaa.........aqa|aaa...........aaaa...........aaa|...............aa...............|................................' },
  };
  const ARTES = {};
  function arte(k) {                                                       // o canvas 32x32 do emblema (desenhado uma vez só)
    if (ARTES[k]) return ARTES[k];
    const E = EMB_PX[k], cv = document.createElement('canvas'); cv.width = cv.height = 32;
    if (E) { const g = cv.getContext('2d'), L = E.px.split('|'), ABC = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      L.forEach((ln, y) => { for (let x = 0; x < ln.length; x++) { const c = ln[x]; if (c !== '.') { g.fillStyle = E.pal[ABC.indexOf(c)]; g.fillRect(x, y, 1, 1); } } }); }
    return (ARTES[k] = cv);
  }
  const urlArte = (k) => { const c = arte(k); return c.__url || (c.__url = c.toDataURL()); };

  // ============================================================================================ O TIME NO FORMATO DO MOTOR
  const uniDe = (u) => ({ camisa: u[0], listra: u[1], gola: u[2], calcao: u[3], meia: u[4], sola: u[5], goleiro: u[6] });
  function apTecnico(t) {
    const ap = typeof gerarAparencia === 'function' ? gerarAparencia(semDe('vz-tec|' + t.k), /^Dona /.test(t.tecnico) ? 'F' : 'M') : {};
    if (t.k !== NOSSO) return ap;
    const ach = (l, n, d) => { const i = typeof l !== 'undefined' && l ? l.findIndex((x) => x.nome === n) : -1; return i >= 0 ? i : d; };
    // o Seu Damião: cabelo grisalho com entradas e bigode grosso (o técnico de 15 anos do Peladão)
    return Object.assign(ap, { cabelo: '#b9b4ac', corBarba: '#b9b4ac', estilo: ach(typeof ESTILOS_CABELO !== 'undefined' ? ESTILOS_CABELO : null, 'Entradas', ap.estilo),
      barba: ach(typeof ESTILOS_BARBA !== 'undefined' ? ESTILOS_BARBA : null, 'Bigode grosso', ap.barba), rosto: ach(typeof ROSTOS !== 'undefined' ? ROSTOS : null, 'Sério', ap.rosto) });
  }
  function timeMotor(t, voce) {
    const fz = forcaTime(t), ap = apTecnico(t);
    return {
      id: 'vz_' + t.k, nome: t.nome, sigla: t.sigla, forca: Math.round(fz.media * 10), popularidade: 0.45, formacao: t.formacao, tatica: t.tatica,
      uniforme: uniDe(t.uni), uniforme2: uniDe(t.uni2), tecnicoFixo: true,
      emblema: { forma: 'escudo', cor1: t.uni[0], cor2: t.uni[1], letras: t.sigla.slice(0, 2), arte: arte(t.k) },
      tecnico: { nome: t.tecnico, aparencia: { pele: ap.pele, cabelo: ap.cabelo, estilo: ap.estilo, roupa: t.uni[3] } },
      elenco: elencoVz(t).map((j) => Object.assign({}, j)),
    };
  }

  // ============================================================================================ A TABELA, AS RODADAS E A SIMULAÇÃO
  // todos contra todos (método do círculo): 9 rodadas de 5 jogos; quem joga em casa alterna
  function tabelaDeJogos() {
    const n = TIMES_VZ.length, arr = TIMES_VZ.map((t, i) => i), jogos = [];
    for (let r = 0; r < n - 1; r++) {
      for (let i = 0; i < n / 2; i++) {
        const a = arr[i], b = arr[n - 1 - i], casaA = (r + i) % 2 === 0;
        jogos.push({ r, c: casaA ? a : b, f: casaA ? b : a, gc: 0, gf: 0, feito: false });
      }
      arr.splice(1, 0, arr.pop());
    }
    return jogos;
  }
  // os dias dos jogos: a rodada k cai no sábado (k par, 14h) ou no domingo (k ímpar, 10h) da semana floor(k / 2)
  const diaDa = (C, k) => C.d0 + Math.floor(k / 2) * 7 + (k % 2);
  const horaDa = (k) => (k % 2 ? H_DOM : H_SAB);
  const hAbs = (dia, h) => (dia - 1) * 24 + h;
  // a tabela de classificação: pontos, vitórias, saldo, gols feitos
  function classificacao(C) {
    const L = TIMES_VZ.map((t, i) => ({ i, k: t.k, j: 0, p: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0 }));
    for (const g of C.jogos) {
      if (!g.feito || g.r > 8) continue;
      const A = L[g.c], B = L[g.f];
      A.j++; B.j++; A.gp += g.gc; A.gc += g.gf; B.gp += g.gf; B.gc += g.gc;
      if (g.gc > g.gf) { A.v++; A.p += 3; B.d++; } else if (g.gc < g.gf) { B.v++; B.p += 3; A.d++; } else { A.e++; B.e++; A.p++; B.p++; }
    }
    return L.sort((a, b) => b.p - a.p || b.v - a.v || (b.gp - b.gc) - (a.gp - a.gc) || b.gp - a.gp || a.i - b.i);
  }
  const posicaoNa = (C, i) => classificacao(C).findIndex((x) => x.i === i) + 1;
  // força de ataque e de defesa de um time para a simulação (média dos titulares de cada setor)
  function poder(t, semJogador) {
    const f = forcaTime(t), at = f.fwd * 0.6 + f.mid * 0.4, df = f.def * 0.55 + f.gk * 0.45;
    const desf = semJogador ? 0.92 : 1;                                     // o nosso time sem o jogador: um reserva no lugar dele
    return { at: at * desf, df: df * desf };
  }
  function poisson(l, r) { const L = Math.exp(-l); let k = 0, p = 1; do { k++; p *= r(); } while (p > L && k < 12); return k - 1; }
  function simularPlacar(C, g) {
    const r = Math.random, A = TIMES_VZ[g.c], B = TIMES_VZ[g.f];
    const semA = g.c === NOSSO_I && !g.comVoce, semB = g.f === NOSSO_I && !g.comVoce;
    const pa = poder(A, semA), pb = poder(B, semB);
    const lam = (at, df, casa) => clampN(1.45 * Math.pow(at / df, 1.7) + (casa ? 0.18 : 0), 0.15, 5.5);
    g.gc = poisson(lam(pa.at, pb.df, true), r); g.gf = poisson(lam(pb.at, pa.df, false), r);
    if (g.r > 8 && g.gc === g.gf) {                                         // mata-mata: pênaltis (o goleiro melhor tem um pouco mais de chance)
      const ga = forcaTime(A).gk, gb = forcaTime(B).gk, ganhaA = r() < 0.5 + (ga - gb) * 0.04;
      const base = 3 + Math.floor(r() * 3); g.pen = ganhaA ? [base, base - 1 - Math.floor(r() * 2)] : [base - 1 - Math.floor(r() * 2), base];
    }
    g.feito = true;
    estatisticasSimuladas(C, g);
  }
  // quem fez os gols e deu os passes nos jogos simulados (e as notas de todo mundo)
  const PESO_GOL = { GK: 0.02, DEF: 0.7, MID: 2.2, FWD: 5 }, PESO_ASS = { GK: 0.1, DEF: 1, MID: 4, FWD: 2 };
  function sorteiaPeso(lista, peso) { const tot = lista.reduce((s, x) => s + peso(x), 0); let v = Math.random() * tot; for (const x of lista) { v -= peso(x); if (v <= 0) return x; } return lista[lista.length - 1]; }
  function escalados(ti, comVoce) {                                         // quem jogou: os 7 titulares (o nosso sem o jogador: entra o 1º reserva)
    const t = TIMES_VZ[ti], E = elencoVz(t);
    if (t.k !== NOSSO) return E.slice(0, 7).map((j) => ({ nome: j.nome, pos: j.pos, hab: j.hab, media: j.media }));
    const l = E.slice(0, 6).map((j) => ({ nome: j.nome, pos: j.pos, hab: j.hab, media: j.media }));
    if (comVoce) l.push({ nome: '__voce', pos: posicaoJog(), hab: atribJog(), media: mediaJog() });
    else { const R = E.slice(6).find((j) => j.pos === posicaoJog()) || E[6]; l.push({ nome: R.nome, pos: R.pos, hab: R.hab, media: R.media }); }
    return l;
  }
  function est(C, ti, nome) { const k = TIMES_VZ[ti].k + '|' + nome; return (C.est[k] = C.est[k] || { t: ti, n: nome, j: 0, g: 0, a: 0, nota: 0, p: 0 }); }
  function estatisticasSimuladas(C, g) {
    for (const [ti, gols, sofr] of [[g.c, g.gc, g.gf], [g.f, g.gf, g.gc]]) {
      const L = escalados(ti, false), M = {};
      for (const x of L) M[x.nome] = { g: 0, a: 0 };
      for (let i = 0; i < gols; i++) {
        const autor = sorteiaPeso(L, (x) => PESO_GOL[x.pos] * Math.pow((x.hab.finalizacao || 5) / 7, 2));
        M[autor.nome].g++;
        if (Math.random() < 0.72) { const out = L.filter((x) => x !== autor); const as = sorteiaPeso(out, (x) => PESO_ASS[x.pos] * Math.pow((x.hab.passe || 5) / 7, 2)); M[as.nome].a++; }
      }
      const res = gols > sofr ? 1 : gols < sofr ? -1 : 0;
      for (const x of L) {
        const s = est(C, ti, x.nome), m = M[x.nome];
        s.j++; s.g += m.g; s.a += m.a; s.p += passesDe(x);
        s.nota = r1(s.nota + notaNPC(x, m.g, m.a, res, sofr));
      }
    }
  }
  function passesDe(x) { const b = { GK: 5, DEF: 13, MID: 20, FWD: 9 }[x.pos] || 10; return Math.max(1, Math.round(b * ((x.hab.passe || 5) / 6.5) * (0.7 + Math.random() * 0.6))); }
  function notaNPC(x, g, a, res, sofr) {
    let n = 6 + res * 0.45 + g * 0.9 + a * 0.5 + ((x.media || 6) - 6) * 0.25 + (Math.random() + Math.random() + Math.random() - 1.5) * 0.7;
    if (x.pos === 'GK' || x.pos === 'DEF') n += sofr === 0 ? 0.7 : -0.18 * (sofr - 1);
    return r1(clampN(n, 3, 10));
  }
  // a semifinal (1º x 4º e 2º x 3º, o melhor colocado em casa) e a final (a melhor campanha em casa)
  function montarMataMata(C) {
    const cl = classificacao(C).map((x) => x.i);
    C.jogos.push({ r: 9, c: cl[0], f: cl[3], gc: 0, gf: 0, feito: false, semi: 1 }, { r: 9, c: cl[1], f: cl[2], gc: 0, gf: 0, feito: false, semi: 2 });
    C.semis = cl.slice(0, 4);
  }
  const vencedor = (g) => (g.pen ? (g.pen[0] > g.pen[1] ? g.c : g.f) : g.gc > g.gf ? g.c : g.gc < g.gf ? g.f : g.c);
  function montarFinal(C) {
    const S2 = C.jogos.filter((g) => g.r === 9), a = vencedor(S2[0]), b = vencedor(S2[1]);
    const pa = C.semis.indexOf(a), pb = C.semis.indexOf(b);
    C.jogos.push({ r: 10, c: pa <= pb ? a : b, f: pa <= pb ? b : a, gc: 0, gf: 0, feito: false });
  }
  // os prêmios do fim: melhor jogador (maior média de nota, pelo menos metade dos jogos do time), artilheiro e assistências
  function premios(C) {
    const L = Object.values(C.est), jogosTime = (ti) => C.jogos.filter((g) => g.feito && (g.c === ti || g.f === ti)).length;
    const elegivel = L.filter((s) => s.j >= Math.max(3, Math.ceil(jogosTime(s.t) / 2)));
    const melhor = elegivel.slice().sort((a, b) => b.nota / b.j - a.nota / a.j || b.j - a.j)[0];
    const art = L.slice().sort((a, b) => b.g - a.g || a.j - b.j || b.nota / b.j - a.nota / a.j)[0];
    const ass = L.slice().sort((a, b) => b.a - a.a || a.j - b.j || b.nota / b.j - a.nota / a.j)[0];
    const pk = (s) => (s ? { t: s.t, n: s.n, v: 0 } : null);
    const out = { melhor: pk(melhor), art: pk(art), ass: pk(ass) };
    if (out.melhor) out.melhor.v = r1(melhor.nota / melhor.j); if (out.art) out.art.v = art.g; if (out.ass) out.ass.v = ass.a;
    return out;
  }

  // ============================================================================================ O MÓDULO NA CIDADE
  function criar(api) {
    const S = () => api.S();
    const M = { torc: [], torcK: -1, rafa: null, cena: false, sala: null, filaMsg: [], tMsg: 0 };
    atribJog = () => { try { return api.atributosJogador(); } catch (e) { return {}; } };
    nomeJogV = () => { try { return api.nomeJog(); } catch (e) { return 'Você'; } };
    const VZ = api.VZ, V = api.VARZEA;
    const PORTAO = { x: 89, z: V.z1 + 1.15 };                                 // do lado de fora do portão (o vão da cerca é de x 86 a 92)
    const PORTA = { x: VZ.casa.x1 + 0.9, z: (VZ.casa.z0 + VZ.casa.z1) / 2 };  // na frente da porta da casinha da escada
    const dados = () => S().dados;
    const camp = () => { const d = dados(); return (d.varzea = d.varzea || { etapa: 'nada' }); };
    const agora = () => hAbs(dados().dia || 1, dados().hora || 0);
    const pk = (l) => l[Math.floor(Math.random() * l.length)];
    const nomeT = (i) => TIMES_VZ[i].nome;
    const ehNosso = (g) => g.c === NOSSO_I || g.f === NOSSO_I;
    const adversario = (g) => (g.c === NOSSO_I ? g.f : g.c);
    const fmt = (h) => api.fmtHora(h);
    const DIAS = ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo'];
    const semanaDe = (dia) => ((dia - 1) % 7 + 7) % 7;
    const faseNome = (k) => (k === 10 ? T('Final') : k === 9 ? T('Semifinal') : Tf('Rodada {0} de 9', k + 1));

    // ---------------------------------------------------------------- jogos bons (sintético + futsal) e o convite
    function jogosBons() { try { const C = api.carreira(); return (C.sintetico.bons | 0) + (C.futsal.bons | 0); } catch (e) { return 0; } }
    function ondeViu() { try { const C = api.carreira(); return (C.sintetico.j | 0) >= (C.futsal.j | 0) ? 'sintetico' : 'futsal'; } catch (e) { return 'sintetico'; } }
    const rafaPodeAparecer = () => { const C = camp(), h = dados().hora; return ((C.etapa === 'nada' || C.etapa === 'recusou') && jogosBons() >= BONS_PARA_OLHEIRO || peneiraPendente()) && h >= 8 && h < 19.5 && !S().dentro; };
    const peneiraPendente = () => { const C = camp(); return C.etapa === 'fim' && !!C.jogos && C.peneira !== 'convidado'; };
    function criarRafa() {
      const E = elencoVz(TIMES_VZ[NOSSO_I]), j = E.find((x) => x.nome === 'Rafa') || E[0];
      const A = api.criarNPCFixo(j, false, 7, ['#e8742a', '#1f2a44', '#1f2a44', '#e8742a']);
      A.tipo = 'cena'; A.x = PORTAO.x + 0.4; A.z = PORTAO.z + 0.25; A.y = api.altura(A.x, A.z); A.yaw = A.yawAlvo = -Math.PI / 2;
      const ex = api.spriteExclamacao(); ex.position.set(0, 2.5, 0); A.m.raiz.add(ex); A.excl = ex;
      const s = S(); s.falantesExtra = s.falantesExtra || {}; s.falantesExtra.rafa = { A, nome: 'Rafa', voz: 3 };
      M.rafa = A;
    }
    function tirarRafa() { if (!M.rafa) return; try { api.descartarPessoa(M.rafa); } catch (e) { /* nada */ } M.rafa = null; }
    async function conversarRafa() {
      const A = M.rafa, J = S().jog, C = camp(), d = dados(); if (!A) return;
      A.yawAlvo = Math.atan2(-(J.z - A.z), J.x - A.x); J.yawAlvo = Math.atan2(-(A.z - J.z), A.x - J.x);
      const nome = api.nomeJog();
      if (C.etapa === 'recusou') await api.fala('rafa', Tf('E aí, {0}! Pensou melhor no campeonato?', nome));
      else {
        await api.fala('rafa', ondeViu() === 'sintetico' ? Tf('Ei, {0}! Lembra de mim? Sou o Rafa, já joguei umas vezes no seu time lá no racha do sintético.', nome) : Tf('Ei, {0}! Sou o Rafa. Já te vi jogando na quadra coberta e até bati uma bola com vocês umas vezes.', nome));
        await api.fala('rafa', T('Tô vendo você jogar faz um tempo... e você tá voando!'));
        await api.fala('rafa', T('Eu tô montando o time do Peladão pro campeonato de várzea aqui do campo. São dez times, todo mundo contra todo mundo; os quatro melhores vão pra semifinal e depois tem a final.'));
        await api.fala('rafa', Tf('O campeão leva {0} fakes. A gente divide no time, entre os jogadores e o técnico: a sua parte fica em {1} fakes.', PREMIO_TOTAL.toLocaleString('pt-BR'), PREMIO_JOG));
        await api.fala('rafa', Tf('Os jogos são no sábado às {0} e no domingo às {1}: ninguém do time trabalha nesses horários.', fmt(H_SAB), fmt(H_DOM)));
      }
      const q = T('E aí, fecha com a gente?');
      await api.fala('rafa', q);
      const r = await Escolha.mostrar(q, [T('Fechado! Tô dentro!'), T('Agora não, valeu.'), Tg('Time de várzea? Eu sou bom demais pra isso.')]);
      if (r === 2) {
        await api.falaGrossa('rafa', 'rafa', Tg('Time de várzea? Eu sou bom demais pra isso.'), T('Nossa... beleza então. Se baixar a bola, a vaga ainda tá aqui.'));
        C.etapa = 'recusou'; Dialogo.esconder(); api.gravar('chegada'); return;
      }
      if (r !== 0) { await api.fala('jog', T('Agora não, valeu.')); await api.fala('rafa', T('Tranquilo! Se mudar de ideia, é só me procurar aqui na frente do campo.')); C.etapa = 'recusou'; Dialogo.esconder(); api.gravar('chegada'); return; }
      await api.fala('jog', T('Fechado! Tô dentro!'));
      iniciarCampeonato();
      const k0 = diaDa(C, 0);
      await api.fala('rafa', Tf('Aí sim! O primeiro jogo é no sábado, dia {0}, às {1}, contra o {2}.', k0, fmt(H_SAB), nomeT(adversario(proxNosso(C)))));
      await api.fala('rafa', T('Chega uma hora antes. O vestiário fica embaixo do campo: é só descer a escada da casinha, perto do banco. O Seu Damião, nosso técnico, vai estar te esperando.'));
      Dialogo.esconder();
      if (A.excl) { A.m.raiz.remove(A.excl); A.excl = null; }
      api.aviso(Tf('Você entrou para o {0}!', TIMES_VZ[NOSSO_I].nome));
      // o Rafa vai embora (ele aparece de novo no vestiário)
      A.yawAlvo = 0; const ida = api.andar(A, [[PORTAO.x + 6, PORTAO.z + 2.6], [PORTAO.x + 40, PORTAO.z + 2.6]], 1.6);
      ida.then(() => { if (M.rafa === A) tirarRafa(); });
      api.gravar('chegada');
    }
    // ---------------------------------------------------------------- A PENEIRA: o Rafa conta, depois do campeonato
    //   Reage ao campeonato do jogador: só ganhamos por causa dele · campeões juntos · bom campeonato sem o título · campeonato fraco.
    //   E as falas extras: melhor jogador, artilheiro, líder de assistências. No fim, C.peneira = 'convidado' (o serieb.js segue daí).
    function leituraCampeonato(C) {
      const est = C.est || {}, me = est[NOSSO + '|__voce'] || { j: 0, g: 0, a: 0, nota: 0 };
      const doTime = Object.values(est).filter((x) => x.t === NOSSO_I), golsTime = doTime.reduce((s, x) => s + x.g, 0);
      const outros = doTime.filter((x) => x.n !== '__voce' && x.j > 0), mediaOutros = outros.length ? outros.reduce((s, x) => s + x.nota / x.j, 0) / outros.length : 6;
      const jogosTime = (C.jogos || []).filter((g) => g.feito && (g.c === NOSSO_I || g.f === NOSSO_I)).length;
      const media = me.j ? me.nota / me.j : 0, parte = golsTime ? me.g / golsTime : 0, P = C.premios || {};
      const melhor = !!(P.melhor && P.melhor.n === '__voce'), art = !!(P.art && P.art.n === '__voce'), ass = !!(P.ass && P.ass.n === '__voce');
      const campeao = C.campeao === NOSSO_I, final = (C.jogos || []).some((g) => g.r === 10 && (g.c === NOSSO_I || g.f === NOSSO_I));
      const decisivo = melhor || parte >= 0.35 || (media >= 7.6 && media - mediaOutros >= 0.6) || (art && ass);
      const fraco = me.j < Math.max(2, Math.ceil(jogosTime / 2)) || (media < 6.5 && !melhor && !art && !ass);
      const caso = campeao ? (decisivo && !fraco ? 'soVoce' : fraco ? 'fracoCampeao' : 'juntos') : fraco ? 'fraco' : 'bem';
      return { caso, me, media, melhor, art, ass, final, P, faltas: C.faltas | 0 };
    }
    async function conversaPeneira(C) {
      const L = leituraCampeonato(C), nome = api.nomeJog(), rafa = (t) => api.fala('rafa', t);
      if (L.caso === 'soVoce') {
        await rafa(Tf('{0}, vamos ser sinceros: esse título tem o seu nome.', nome));
        await rafa(T('Sem você, o Peladão não passava nem da primeira fase. A gente só ganhou por sua causa.'));
      } else if (L.caso === 'juntos') {
        await rafa(Tg('Campeões! E você foi parte importante disso: jogou pro time o campeonato inteiro.'));
      } else if (L.caso === 'fracoCampeao') {
        await rafa(T('A gente foi campeão... mas vou ser sincero: não foi o seu melhor campeonato.'));
        await rafa(Tg('Mesmo assim, eu já te vi jogar no sintético e na quadra. Eu sei do que você é capaz.'));
      } else if (L.caso === 'bem') {
        await rafa(L.final ? T('A gente bateu na trave na final... mas você jogou demais. Todo mundo reparou.') : T('A gente não levou o título, mas você fez um baita campeonato. Todo mundo reparou.'));
      } else {
        await rafa(T('Olha... eu sei que o campeonato não foi o seu melhor.'));
        await rafa(L.faltas ? Tg('Teve jogo que você nem apareceu, teve jogo que não saiu nada. Acontece.') : T('Teve jogo que não saiu nada. Acontece.'));
        await rafa(Tg('Mas eu já te vi jogar no sintético e na quadra. Eu sei do que você é capaz.'));
      }
      if (L.melhor) await rafa(Tgf('E ainda foi eleito o melhor jogador do campeonato, com nota média {0}!', L.P.melhor.v.toFixed(1)));
      if (L.art && L.ass) await rafa(Tgf('Artilheiro E líder de assistências: {0} gols e {1} passes pra gol. Não é pra qualquer um!', L.P.art.v, L.P.ass.v));
      else if (L.art) await rafa(Tgf('Artilheiro do campeonato, com {0} gols!', L.P.art.v));
      else if (L.ass) await rafa(Tgf('E o líder de assistências, com {0} passes pra gol. Joga pro time!', L.P.ass.v));
      await rafa(T('Escuta: logo, logo vai ter uma peneira com olheiros de times da Série B do Brasileirão, numa outra cidade.'));
      await rafa(T('Pode demorar um pouquinho pra sair, mas quando sair a vaga é sua: eu consigo a inscrição e um ônibus pra gente ir até lá.'));
      await api.fala('jog', T('Rafa, nem sei como te agradecer. Pode deixar: eu vou dar o meu melhor!'));
      await rafa(pk([Tg('Eu sei que vai. Agora vai descansar, craque.'), T('É isso! Eu te aviso quando for. Vai com tudo!')]));
      Dialogo.esconder();
      C.peneira = 'convidado'; api.gravar('chegada');
    }
    async function conversarRafaFim() {
      const A = M.rafa, J = S().jog, C = camp(); if (!A) return;
      A.yawAlvo = Math.atan2(-(J.z - A.z), J.x - A.x); J.yawAlvo = Math.atan2(-(A.z - J.z), A.x - J.x);
      await api.fala('rafa', Tf('E aí, {0}! Tava te esperando.', api.nomeJog()));
      await conversaPeneira(C);
      if (A.excl) { A.m.raiz.remove(A.excl); A.excl = null; }
      A.yawAlvo = 0; const ida = api.andar(A, [[PORTAO.x + 6, PORTAO.z + 2.6], [PORTAO.x + 40, PORTAO.z + 2.6]], 1.6);
      ida.then(() => { if (M.rafa === A) tirarRafa(); });
    }
    function iniciarCampeonato() {
      const C = camp(), d = dados();
      let d0 = (d.dia || 1) + 1; while (semanaDe(d0) !== 5) d0++;            // o primeiro sábado depois do convite
      Object.assign(C, { etapa: 'ativo', aceitoDia: d.dia, d0, jogos: tabelaDeJogos(), feitas: 0, est: {}, faltas: 0, avisos: {}, pedidos: {}, notas: [] });
    }
    const proxNosso = (C) => (C.jogos || []).find((g) => !g.feito && ehNosso(g));
    // o jogo do nosso time hoje (só da rodada que ainda não foi fechada), ou null
    function jogoDeHoje() {
      const C = camp(); if (C.etapa !== 'ativo') return null;
      const g = proxNosso(C); if (!g || g.r < C.feitas) return null;
      return diaDa(C, g.r) === dados().dia ? g : null;
    }
    // ---------------------------------------------------------------- as rodadas: fecha o que já passou (simula quem não jogou)
    function fecharRodadas() {
      const C = camp(); if (C.etapa !== 'ativo' || M.cena) return;
      while (C.feitas <= 10) {
        const k = C.feitas; if (agora() < hAbs(diaDa(C, k), horaDa(k)) + 2) break;
        fecharRodada(C, k, true);
      }
    }
    function fecharRodada(C, k, avisar) {
      for (const g of C.jogos.filter((x) => x.r === k && !x.feito)) {
        const nosso = ehNosso(g);
        simularPlacar(C, g);
        if (nosso && avisar) { C.faltas = (C.faltas | 0) + 1; M.filaMsg.push(['faltou', g]); }
      }
      C.feitas = k + 1;
      if (k === 8) montarMataMata(C);
      else if (k === 9) montarFinal(C);
      else if (k === 10) encerrar(C, avisar);
      if (k === 8 && avisar && !C.semis.includes(NOSSO_I)) M.filaMsg.push(['fora']);
    }
    function encerrar(C, avisar) {
      const F = C.jogos.find((g) => g.r === 10), camp0 = vencedor(F);
      C.campeao = camp0; C.premios = premios(C); C.etapa = 'fim';
      const nosso = camp0 === NOSSO_I;
      if (nosso && !C.pago) { C.pago = true; const d = dados(); d.fakes = (d.fakes | 0) + PREMIO_JOG; }
      try { const K = api.carreira().varzea; K.campeonatos = (K.campeonatos | 0) + 1; if (nosso) K.titulos = (K.titulos | 0) + 1; for (const [q, x] of Object.entries(C.premios)) if (x && x.n === '__voce') (K.premios = K.premios || []).push(q); } catch (e) { /* nada */ }
      if (avisar) M.filaMsg.push(['fim']);
    }
    // as mensagens no celular (uma de cada vez, com o jogador livre)
    async function tickMensagens(dt) {
      const s = S(); if (!M.filaMsg.length || s.modo !== 'livre' || M.lendo) return;
      if ((M.tMsg -= dt) > 0) return;
      M.lendo = true; const [tipo, g] = M.filaMsg.shift(), C = camp();
      try {
        if (tipo === 'faltou') {
          const nosC = g.c === NOSSO_I, a = nosC ? g.gc : g.gf, b = nosC ? g.gf : g.gc;
          await api.mensagemCelular('Seu Damião', Tf('Você não apareceu no jogo contra o {0}...', nomeT(adversario(g))), Tf('Jogamos sem você: {0} {1} x {2} {3}.', TIMES_VZ[NOSSO_I].nome, a, b, nomeT(adversario(g))) + (g.pen ? ' ' + Tf('Pênaltis {0}x{1}.', nosC ? g.pen[0] : g.pen[1], nosC ? g.pen[1] : g.pen[0]) : ''));
        } else if (tipo === 'fora') await api.mensagemCelular('Rafa', T('Não deu... a gente ficou fora da semifinal.'), T('Valeu por jogar com a gente! Ano que vem tem mais.'));
        else if (tipo === 'fim') await mensagemFim(C);
        else if (tipo === 'hoje') await api.mensagemCelular('Rafa', Tf('Hoje tem jogo! {0} contra o {1}, às {2}.', faseNome(g.r), nomeT(adversario(g)), fmt(horaDa(g.r))), T('Chega uma hora antes, no vestiário embaixo do campo.'));
      } catch (e) { console.warn('[Várzea] mensagem:', e); }
      M.lendo = false; M.tMsg = 2.5; api.gravar(dados().ponto || 'chegada');
    }
    async function mensagemFim(C) {
      const P = C.premios || {}, nomeP = (x) => (x ? (x.n === '__voce' ? api.nomeJog() : x.n) + ' (' + TIMES_VZ[x.t].nome + ')' : '—');
      await api.mensagemCelular('Rafa', C.campeao === NOSSO_I ? Tf('SOMOS CAMPEÕES! A sua parte do prêmio ({0} fakes) já tá na sua conta!', PREMIO_JOG) : Tf('O campeão da várzea foi o {0}.', nomeT(C.campeao)),
        Tf('Melhor jogador: {0} · Artilheiro: {1} · Assistências: {2}', nomeP(P.melhor), nomeP(P.art), nomeP(P.ass)));
    }

    // ---------------------------------------------------------------- A TORCIDA: chega de 2 h a 1 h antes e espera em volta
    function vagas() {
      const out = [], F1 = VZ.filas[0], F2 = VZ.filas[1], [w, e] = VZ.arq, atras = F2.z + 0.8, frente = V.z1 + 0.2;
      const lesteSai = { x: V.x1 + 4, z: V.z1 + 3.6 }, oesteSai = { x: V.x0 - 0.9, z: V.z1 + 3.6 };
      const yN = Math.PI / 2, yS = -Math.PI / 2;
      // fila de cima: entra por trás
      for (const x of [w[0] + 2.5, w[0] + 7, w[0] + 11.5, w[1] - 3]) out.push({ sai: oesteSai, rota: [[x, atras]], x, z: F2.z, h: F2.h, yaw: yN });
      for (const x of [e[0] + 3.5, e[0] + 8.5, e[1] - 5]) out.push({ sai: lesteSai, rota: [[x, atras]], x, z: F2.z, h: F2.h, yaw: yN });
      // fila de baixo: entra pela ponta do lance e anda na frente dela (entre a tábua e a cerca)
      for (const x of [w[0] + 4.5, w[0] + 12.5]) out.push({ sai: oesteSai, rota: [[w[0] - 0.7, atras], [w[0] - 0.7, frente], [x, frente]], x, z: F1.z, h: F1.h, yaw: yN });
      for (const x of [e[0] + 5.5, e[0] + 11, e[1] - 2.5]) out.push({ sai: lesteSai, rota: [[e[1] + 0.7, atras], [e[1] + 0.7, frente], [x, frente]], x, z: F1.z, h: F1.h, yaw: yN });
      // os bancos do lado leste (dois por banco), de frente para o campo
      for (const B of VZ.leste.slice(0, 3)) for (const t of [-0.75, 0.75]) out.push({ sai: lesteSai, rota: [[V.x1 + 4, B.z + 2.1], [V.x1 + 1.05, B.z + 2.1], [V.x1 + 1.05, B.z + t]], x: B.x, z: B.z + t, h: 0.45, yaw: Math.PI });
      // em pé: atrás da cerca norte (do lado do banco) e da cerca oeste
      for (const x of [V.x0 + 13, V.x0 + 19, V.x1 - 19, V.x1 - 13]) out.push({ sai: lesteSai, rota: [[V.x1 + 4, V.z0 - 1.1], [x, V.z0 - 1.1]], x, z: V.z0 - 1.1, h: 0, yaw: yS });
      for (const z of [V.z1 - 12, V.z1 - 24]) out.push({ sai: oesteSai, rota: [[V.x0 - 0.9, z]], x: V.x0 - 0.9, z, h: 0, yaw: 0 });
      return out;
    }
    // o dia de jogo de hoje (qualquer jogo do campeonato: a torcida vem mesmo se o nosso time não jogar)
    function rodadaHoje() {
      const C = camp(); if (C.etapa !== 'ativo') return -1;
      for (let k = C.feitas; k <= 10; k++) if (diaDa(C, k) === dados().dia) return k;
      return -1;
    }
    function tickTorcida(dt) {
      const s = S(), k = rodadaHoje(), t = agora();
      if (s.dentro || M.cena) { if (M.torc.length && s.dentro) limparTorcida(); return; }
      if (k < 0) { if (M.torc.length) dispersar(); return; }
      const C = camp(), H = hAbs(diaDa(C, k), horaDa(k));
      if (M.torcK !== k) {                                                     // a lista do dia (quem vem e a que horas)
        limparTorcida(); M.torcK = k;
        M.plano = vagas().map((v, i) => ({ v, cheg: H - 2 + ((i * 7919) % 97) / 97, fem: Math.random() < 0.42, A: null, fase: 'fora' }));
      }
      if (t >= H + 2.5) { dispersar(); return; }
      let novos = 0;
      for (const p of M.plano) {
        if (p.fase !== 'fora' || t < p.cheg || novos >= 2) continue;
        novos++;
        const A = api.criarPessoa(s.f2, Math.random, p.fem); A.tipo = 'cena'; s.npcs.push(A); p.A = A; M.torc.push(p);
        const passou = (t - p.cheg) / api.H_POR_S;                               // segundos de jogo desde que ele devia ter saído de casa
        const dist = p.v.rota.reduce((acc, q, i) => acc + Math.hypot(q[0] - (i ? p.v.rota[i - 1][0] : p.v.sai.x), q[1] - (i ? p.v.rota[i - 1][1] : p.v.sai.z)), 0);
        if (passou > dist / 1.2 + 2) sentar(p);
        else {
          A.x = p.v.sai.x; A.z = p.v.sai.z; A.y = api.altura(A.x, A.z); p.fase = 'indo';
          api.andar(A, p.v.rota.map((q) => q.slice()), 1.2).then(() => { if (p.A === A && p.fase === 'indo') sentar(p); });
        }
      }
    }
    function sentar(p) {
      const A = p.A, v = p.v; A.rota = null; A.andando = false; A.x = v.x; A.z = v.z; A.yaw = A.yawAlvo = v.yaw; p.fase = 'la';
      if (v.h > 0) { A.sentado = true; A.assento = v.h; A.y = 0; } else { A.sentado = false; A.y = api.altura(A.x, A.z); }
    }
    function dispersar() {
      for (const p of M.torc) {
        if (p.fase === 'saindo' || !p.A) continue;
        const A = p.A, v = p.v; p.fase = 'saindo'; A.sentado = false;
        if (v.h > 0) { A.x = v.rota[v.rota.length - 1][0]; A.z = v.rota[v.rota.length - 1][1]; }
        const volta = v.rota.slice(0, -1).reverse().concat([[v.sai.x, v.sai.z], [v.sai.x + (v.sai.x > 90 ? 10 : -10), v.sai.z + 0.8]]);
        api.andar(A, volta, 1.3).then(() => { try { api.descartarPessoa(A); } catch (e) { /* nada */ } p.A = null; M.torc = M.torc.filter((q) => q !== p); });
      }
      if (M.plano) for (const p of M.plano) if (p.fase === 'fora') p.fase = 'nao';
    }
    function limparTorcida() {
      for (const p of M.torc) if (p.A) try { api.descartarPessoa(p.A); } catch (e) { /* nada */ }
      M.torc = []; M.torcK = -1; M.plano = null;
    }

    // ---------------------------------------------------------------- tick e alvos
    let tLento = 0;
    function tick(dt) {
      const s = S(); if (!s || !s.dados) return;
      if ((tLento -= dt) <= 0) {
        tLento = 0.5;
        if (!M.cena) fecharRodadas();
        if (rafaPodeAparecer() && !M.rafa && !M.cena) criarRafa();
        else if (M.rafa && !rafaPodeAparecer() && s.modo === 'livre' && !M.rafa.rota) tirarRafa();
        missaoDoDia();
      }
      tickTorcida(dt);
      tickMensagens(dt);
    }
    function missaoDoDia() {
      const s = S(), C = camp(), g = jogoDeHoje(), d = dados(); if (!g || s.modo !== 'livre' || M.cena) return;
      const H = horaDa(g.r), chave = 'd' + d.dia;
      if (d.hora >= 7 && d.hora < H + 0.5 && !C.avisos[chave]) {
        C.avisos[chave] = true; M.filaMsg.push(['hoje', g]);
        if (!s.missao) { s.missao = Tf('Missão: jogo do Peladão FC contra o {0} às {1}, na várzea. O vestiário abre às {2}.', nomeT(adversario(g)), fmt(H), fmt(H - 1)); api.mostrarMissao(); }
        if (!s.dentro) api.definirMarca(PORTAO.x, PORTAO.z);
      }
    }
    function alvos(v) {
      const s = S(); if (s.dentro) return;
      if (M.rafa && M.rafa.excl) v.push({ x: M.rafa.x, z: M.rafa.z, r: 2.2, txt: T('Falar com o Rafa'), fn: peneiraPendente() ? conversarRafaFim : conversarRafa, y: 2.6, pri: true });
      const g = jogoDeHoje(); if (!g) return;
      const H = horaDa(g.r), h = dados().hora;
      if (h >= H - 3 && h < H - 1) v.push({ x: PORTAO.x, z: PORTAO.z, r: 2.2, txt: Tf('Jogo às {0} (o vestiário abre às {1})', fmt(H), fmt(H - 1)), fn: async () => {}, y: 2.4 });
      else if (h >= H - 1 && h <= H + 0.5) v.push({ x: PORTAO.x, z: PORTAO.z, r: 2.4, txt: Tf('Ir para o vestiário ({0} x {1})', TIMES_VZ[g.c].sigla, TIMES_VZ[g.f].sigla), fn: () => diaDeJogo(g), y: 2.4, pri: true });
    }

    // ---------------------------------------------------------------- O VESTIÁRIO SUBTERRÂNEO (só existe durante a cena)
    //   Embaixo da faixa do banco de reservas: a escada sai da casinha (porta para o leste) e desce 3,1 m para o oeste.
    const SALA = { x0: VZ.casa.x0 - 10.2, x1: VZ.casa.x0 - 1.8, z0: VZ.casa.z0 - 1.7, z1: VZ.casa.z1 + 1.7, y: -3.1, alt: 2.7 };
    const ESC = { x0: SALA.x1, x1: VZ.casa.x1 - 0.15, z0: VZ.casa.z0 + 0.15, z1: VZ.casa.z1 - 0.15 };
    function alturaVestiario(x, z) {
      if (x >= ESC.x0 && x <= ESC.x1 + 0.3 && z >= ESC.z0 - 0.05 && z <= ESC.z1 + 0.05) return SALA.y * clampN((ESC.x1 - x) / (ESC.x1 - ESC.x0), 0, 1);
      if (x >= SALA.x0 && x <= SALA.x1 && z >= SALA.z0 && z <= SALA.z1) return SALA.y;
      return null;
    }
    function montarSala() {
      if (M.sala) return M.sala;
      const G = new api.Geo(), X0 = SALA.x0, X1 = SALA.x1, Z0 = SALA.z0, Z1 = SALA.z1, Y = SALA.y, H = SALA.alt, Yt = Y + H;
      const LAR = '#c8642a', AZ = '#1f2a44', CREME = '#d9d2bf', TETO = '#5f5d57';
      // piso de lajotas (0,6 m), com o rejunte
      for (let x = X0; x < X1 - 0.01; x += 0.6) for (let z = Z0; z < Z1 - 0.01; z += 0.6) {
        const w = Math.min(0.6, X1 - x), d = Math.min(0.6, Z1 - z), par = (Math.round((x - X0) / 0.6) + Math.round((z - Z0) / 0.6)) % 2;
        G.box(w - 0.03, 0.02, d - 0.03, par ? '#7d858b' : '#868e94', x + w / 2, Y, z + d / 2);
      }
      G.box(X1 - X0, 0.01, Z1 - Z0, '#4a4f53', (X0 + X1) / 2, Y - 0.005, (Z0 + Z1) / 2);
      // paredes por dentro: barra laranja até 1,1 m, filete azul e o resto creme. A parede leste tem o vão da escada.
      const faixas = [[0, 1.1, LAR], [1.1, 1.22, AZ], [1.22, H, CREME]];
      const parede = (ax, az, bx, bz, fora) => { for (const [h0, h1, cor] of faixas) G.quad([ax, Y + h0, az], [bx, Y + h0, bz], [bx, Y + h1, bz], [ax, Y + h1, az], cor, fora); };
      parede(X0, Z0, X1, Z0, [0, 0, 1]); parede(X0, Z1, X1, Z1, [0, 0, -1]); parede(X0, Z0, X0, Z1, [1, 0, 0]);
      parede(X1, Z0, X1, ESC.z0, [-1, 0, 0]); parede(X1, ESC.z1, X1, Z1, [-1, 0, 0]);
      G.quad([X1, Y + 2.25, ESC.z0], [X1, Y + 2.25, ESC.z1], [X1, Yt, ESC.z1], [X1, Yt, ESC.z0], CREME, [-1, 0, 0]);
      G.quad([X0, Yt, Z0], [X1, Yt, Z0], [X1, Yt, Z1], [X0, Yt, Z1], TETO, [0, -1, 0]);
      for (const x of [X0 + 2.2, X1 - 2.6]) { G.box(1.3, 0.06, 0.22, '#e8ecf2', x, Yt - 0.08, (Z0 + Z1) / 2); G.box(1.36, 0.03, 0.28, '#9aa0a8', x, Yt - 0.03, (Z0 + Z1) / 2); }   // as lâmpadas
      // a escada (degraus de 0,3 m) e o corredor dela (paredes e teto escuros)
      const nD = Math.round((ESC.x1 - ESC.x0) / 0.3), rise = -Y / nD;
      for (let i = 0; i < nD; i++) { const x = ESC.x0 + i * 0.3 + 0.15, top = Y + (i + 1) * rise; G.box(0.3, top - Y, ESC.z1 - ESC.z0, i % 2 ? '#8f8d86' : '#9a988f', x, Y, (ESC.z0 + ESC.z1) / 2); }
      for (const [z, f] of [[ESC.z0, 1], [ESC.z1, -1]]) G.quad([ESC.x0, Y, z], [ESC.x1, Y, z], [ESC.x1, 0.02, z], [ESC.x0, 0.02, z], '#55534d', [0, 0, f]);
      for (let i = 0; i < nD; i++) { const x0 = ESC.x0 + i * 0.3, yT = Y + (i + 1) * rise + 2.25; G.quad([x0, yT, ESC.z0], [x0 + 0.3, yT, ESC.z0], [x0 + 0.3, yT, ESC.z1], [x0, yT, ESC.z1], '#45433e', [0, -1, 0]); }
      // os armários (lado norte), com as frestas e o número
      const nA = 9, wA = 0.62;
      for (let i = 0; i < nA; i++) {
        const x = X0 + 0.5 + wA / 2 + i * wA;
        G.box(wA - 0.03, 1.9, 0.45, i % 2 ? '#56708a' : '#4f6982', x, Y, Z0 + 0.23);
        G.box(0.03, 1.8, 0.01, '#2e3e4e', x - wA / 2 + 0.02, Y + 0.05, Z0 + 0.455);
        for (let k = 0; k < 4; k++) G.box(0.32, 0.025, 0.01, '#2e3e4e', x, Y + 1.55 + k * 0.06, Z0 + 0.455);
        G.box(0.04, 0.12, 0.03, '#c9ced4', x + wA / 2 - 0.1, Y + 0.95, Z0 + 0.46);
      }
      // os bancos de madeira (na frente dos armários e encostado na parede sul)
      const banco = (x0, x1, z) => { G.box(x1 - x0, 0.06, 0.42, '#a87844', (x0 + x1) / 2, Y + 0.39, z); for (let x = x0 + 0.25; x < x1; x += 1.4) G.box(0.08, 0.39, 0.34, '#6b4a2b', x, Y, z); };
      banco(X0 + 0.6, X0 + 0.5 + nA * wA - 0.1, Z0 + 1.05); banco(X0 + 0.5, X1 - 1.6, Z1 - 0.3);
      // as camisas do time penduradas acima do banco sul (cabide na parede), com o número nas costas
      for (let i = 0; i < 7; i++) {
        const x = X0 + 0.9 + i * 0.82, z = Z1 - 0.06;
        G.box(0.05, 0.05, 0.08, '#c9ced4', x, Y + 2.12, z - 0.02);
        G.box(0.46, 0.52, 0.05, '#e8742a', x, Y + 1.58, z - 0.07); G.box(0.7, 0.16, 0.05, '#e8742a', x, Y + 1.94, z - 0.07);
        G.box(0.46, 0.05, 0.051, AZ, x, Y + 1.65, z - 0.07); G.box(0.16, 0.05, 0.052, AZ, x, Y + 2.05, z - 0.07);
      }
      // o bebedouro, a sacola de bolas e os cones (no canto da escada)
      G.box(0.4, 0.9, 0.36, '#c9ced4', X1 - 0.35, Y, Z1 - 0.3); G.box(0.3, 0.42, 0.3, '#8fc6e8', X1 - 0.35, Y + 0.9, Z1 - 0.3); G.box(0.32, 0.04, 0.32, '#2a72d6', X1 - 0.35, Y + 1.32, Z1 - 0.3);
      for (let i = 0; i < 4; i++) G.box(0.26, 0.24, 0.26, i % 2 ? '#f2f2ee' : '#e6e6e0', X0 + 0.45 + (i % 2) * 0.24, Y + Math.floor(i / 2) * 0.22, Z1 - 0.95 + (i > 1 ? 0.12 : 0));
      for (let i = 0; i < 3; i++) G.box(0.3 - i * 0.05, 0.12, 0.3 - i * 0.05, '#e8742a', X0 + 0.45, Y + 0.02 + i * 0.1, Z1 - 1.55);
      G.box(0.04, 0.3, 0.3, '#f2f2ee', X1 - 0.02, Y + 1.6, Z0 + 0.6); G.box(0.045, 0.1, 0.04, '#c8352b', X1 - 0.025, Y + 1.7, Z0 + 0.6); G.box(0.045, 0.04, 0.1, '#c8352b', X1 - 0.025, Y + 1.73, Z0 + 0.6);   // a caixa de primeiros socorros
      const malha = G.malha(api.MAT), grupo = new THREE.Group(); grupo.add(malha);
      // o quadro tático (parede oeste) e o pôster do emblema
      const texQ = api.texCanvas(160, 100, (q) => {
        q.fillStyle = '#e9eef0'; q.fillRect(0, 0, 160, 100); q.fillStyle = '#5a6066'; q.fillRect(0, 0, 160, 3); q.fillRect(0, 97, 160, 3); q.fillRect(0, 0, 3, 100); q.fillRect(157, 0, 3, 100);
        q.strokeStyle = '#2f8f4e'; q.lineWidth = 2; q.strokeRect(12, 12, 136, 76); q.beginPath(); q.moveTo(80, 12); q.lineTo(80, 88); q.stroke(); q.beginPath(); q.arc(80, 50, 11, 0, Math.PI * 2); q.stroke();
        q.strokeRect(12, 34, 14, 32); q.strokeRect(134, 34, 14, 32);
        const pap = papeisDa(TIMES_VZ[NOSSO_I].formacao), L = LINHAS6[TIMES_VZ[NOSSO_I].formacao] || [2, 3, 1];
        q.fillStyle = '#c8642a'; q.fillRect(16, 47, 6, 6);
        L.forEach((m, li) => { for (let i = 0; i < m; i++) { const x = 36 + li * 34, y = 50 + (m === 1 ? 0 : (i / (m - 1) - 0.5) * 50); q.fillRect(x - 3, y - 3, 6, 6); } });
        q.strokeStyle = '#1f2a44'; q.lineWidth = 2;
        for (const [x, y] of [[112, 30], [118, 52], [110, 72], [132, 50]]) { q.beginPath(); q.moveTo(x - 3, y - 3); q.lineTo(x + 3, y + 3); q.moveTo(x + 3, y - 3); q.lineTo(x - 3, y + 3); q.stroke(); }
        q.strokeStyle = '#c8352b'; q.beginPath(); q.moveTo(70, 50); q.quadraticCurveTo(92, 30, 104, 40); q.stroke(); q.beginPath(); q.moveTo(104, 40); q.lineTo(98, 36); q.moveTo(104, 40); q.lineTo(99, 45); q.stroke();
        void pap;
      });
      const quadro = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.06), new THREE.MeshLambertMaterial({ map: texQ }));
      quadro.position.set(X0 + 0.02, Y + 1.55, (Z0 + Z1) / 2 + 0.3); quadro.rotation.y = Math.PI / 2; grupo.add(quadro);
      const texE = new THREE.CanvasTexture(arte(NOSSO)); texE.magFilter = texE.minFilter = THREE.NearestFilter; texE.generateMipmaps = false;
      const poster = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.62), new THREE.MeshLambertMaterial({ map: texE, transparent: true, alphaTest: 0.5 }));
      poster.position.set(X0 + 0.02, Y + 1.6, (Z0 + Z1) / 2 - 1.05); poster.rotation.y = Math.PI / 2; grupo.add(poster);
      S().grupo.add(grupo);
      M.sala = { grupo, descartar: () => { grupo.parent && grupo.parent.remove(grupo); malha.geometry.dispose(); for (const o of [quadro, poster]) { o.geometry.dispose(); o.material.map.dispose(); o.material.dispose(); } } };
      return M.sala;
    }
    function tirarSala() { if (M.sala) { M.sala.descartar(); M.sala = null; } }

    // ---------------------------------------------------------------- o que o técnico quer de você (bônus na nota final)
    const PEDIDOS = {
      gol: { txt: 'Fazer pelo menos 1 gol', b: 0.5, ok: (s, r) => (r.gols | 0) >= 1 },
      gols2: { txt: 'Fazer 2 gols', b: 0.8, ok: (s, r) => (r.gols | 0) >= 2 },
      alvo3: { txt: 'Acertar 3 chutes no gol', b: 0.3, ok: (s) => (s.noAlvo | 0) >= 3 },
      assist: { txt: 'Dar 1 assistência', b: 0.5, ok: (s) => (s.assist | 0) >= 1 },
      passes12: { txt: 'Acertar 12 passes', b: 0.4, ok: (s) => (s.passesOk | 0) >= 12 },
      precisao: { txt: 'Errar no máximo 3 passes (acertando pelo menos 6)', b: 0.3, ok: (s) => (s.passesOk | 0) >= 6 && (s.passes - s.passesOk) <= 3 },
      dribles: { txt: 'Ganhar 3 dribles', b: 0.3, ok: (s) => (s.driblesOk | 0) >= 3 },
      desarmes: { txt: 'Fazer 3 desarmes', b: 0.4, ok: (s) => (s.desarmes | 0) >= 3 },
      perdas: { txt: 'Perder no máximo 4 bolas', b: 0.3, ok: (s) => (s.perdas | 0) <= 4 },
      zero: { txt: 'Não deixar o time tomar gol', b: 0.6, ok: (s, r) => r.placar[1] === 0 },
      um: { txt: 'Não deixar o time tomar mais de 1 gol', b: 0.4, ok: (s, r) => r.placar[1] <= 1 },
      vencer: { txt: 'Sair com a vitória', b: 0.3, ok: (s, r) => !!r.venceu },
      limpo: { txt: 'Jogar limpo: nenhum cartão', b: 0.2, ok: (s) => !s.cartoes },
    };
    function montarPedido(g) {
      const A = TIMES_VZ[adversario(g)], pos = posicaoJog(), fz = forcaTime(A), fraco = estrelas(A) <= 2;
      let l;
      if (pos === 'FWD') l = [fraco || A.fraco === 'def' ? 'gols2' : 'gol', A.forte === 'def' || A.forte === 'gk' ? 'alvo3' : 'assist'];
      else if (pos === 'MID') l = [A.forte === 'mid' ? 'precisao' : 'passes12', fraco ? 'assist' : 'dribles'];
      else if (pos === 'DEF') l = [A.forte === 'fwd' || fz.fwd >= 7 ? 'um' : 'zero', 'desarmes'];
      else l = [A.forte === 'fwd' ? 'um' : 'zero', 'limpo'];
      if (g.r > 8) l.push('vencer'); else if (A.tatica === 'retranca' || A.tatica === 'contra') l.push('perdas');
      return l;
    }
    function avaliarPedido(l, r) { const s = r.estatisticas || {}; return l.map((k) => ({ k, ok: !!PEDIDOS[k].ok(s, r), b: PEDIDOS[k].b })); }

    // ---------------------------------------------------------------- O DIA DE JOGO: até o vestiário, a conversa, a pré-partida e a partida
    async function diaDeJogo(g) {
      const s = S(), J = s.jog, d = dados(), C = camp(), H = horaDa(g.r);
      const ped = C.pedidos[g.r] || (C.pedidos[g.r] = montarPedido(g));
      M.cena = true; C.jogandoK = g.r; const atores = [];
      const trava = setInterval(() => { if (s.modo === 'livre') s.modo = 'cena'; try { const U = api.UI(); if (U && U.ctl && !U.ctl.hidden) U.ctl.hidden = true; } catch (e) { /* nada */ } }, 120);   // nada de controle nem ligação no meio da cena
      api.recolherMissao(); api.definirMarca(null); if (/Peladão/.test(s.missao || '')) s.missao = '';
      try {
        // 1) entrando pelo portão e indo para o campo (a torcida em volta)
        await api.preto(true, 500);
        J.sentado = false; J.rota = null; J.x = PORTAO.x; J.z = PORTAO.z; J.y = api.altura(J.x, J.z); J.yaw = J.yawAlvo = Math.PI / 2;
        api.camCena({ px: PORTAO.x + 4.5, py: 3.4, pz: PORTAO.z + 6, tx: PORTAO.x - 0.5, ty: 0.6, tz: PORTAO.z - 7 });
        await api.preto(false, 500);
        await api.andar(J, [[PORTAO.x, PORTAO.z - 2.2], [PORTAO.x + 1.6, PORTAO.z - 9]], 2.3);
        await api.preto(true, 450);
        // 2) a casinha da escada: entra e desce
        J.x = PORTA.x + 3.2; J.z = PORTA.z + 3.6; J.y = 0; J.yaw = J.yawAlvo = Math.atan2(-(PORTA.z - J.z), PORTA.x - J.x);
        api.camCena({ px: PORTA.x + 5.6, py: 2.1, pz: PORTA.z + 5.3, tx: PORTA.x - 1.2, ty: 0.7, tz: PORTA.z - 0.3 });
        s.alturaExtra = alturaVestiario;
        await api.preto(false, 450);
        await api.andar(J, [[PORTA.x, PORTA.z], [ESC.x1 - 0.4, PORTA.z], [ESC.x1 - 2.4, PORTA.z]], 1.7);
        await api.preto(true, 500);
        // 3) lá embaixo: chega pela escada, troca de roupa e conversa com o Seu Damião
        montarSala();
        const zc = (SALA.z0 + SALA.z1) / 2;
        J.x = ESC.x0 + 2.2; J.z = PORTA.z; J.y = api.altura(J.x, J.z);
        api.camCena({ px: SALA.x0 + 1.0, py: SALA.y + 1.75, pz: SALA.z1 - 0.55, tx: SALA.x1 - 0.6, ty: SALA.y + 0.75, tz: zc - 0.2 });
        const tec = TIMES_VZ[NOSSO_I], apD = apTecnico(tec);
        const D = api.criarNPCFixo(apD, false, 0, ['#1f2a44', '#3a3a40', '#e8742a', '#1c1c1f']); atores.push(D);
        D.tipo = 'cena'; D.x = SALA.x0 + 1.3; D.z = zc + 0.25; D.y = SALA.y; D.yaw = D.yawAlvo = 0;
        s.falantesExtra = s.falantesExtra || {}; s.falantesExtra.damiao = { A: D, nome: 'Seu Damião', voz: 1 };
        const E = elencoVz(tec), cores = ['#e8742a', '#1f2a44', '#1f2a44', '#e8742a'];
        const rafaJ = E.find((x) => x.nome === 'Rafa') || E[0];
        const R = api.criarNPCFixo(rafaJ, false, 7, cores); atores.push(R);
        R.tipo = 'cena'; R.x = SALA.x0 + 3.4; R.z = SALA.z0 + 1.05; R.y = SALA.y; R.sentado = true; R.assento = 0.45; R.yaw = R.yawAlvo = -Math.PI / 2;
        s.falantesExtra.rafa = { A: R, nome: 'Rafa', voz: 3 };
        // dois companheiros sentados no banco sul e um no banco dos armários
        [[SALA.x0 + 1.2, SALA.z1 - 0.3, Math.PI / 2, 1], [SALA.x0 + 6.1, SALA.z1 - 0.3, Math.PI / 2, 2], [SALA.x0 + 5.2, SALA.z0 + 1.05, -Math.PI / 2, 3]].forEach(([x, z, yaw, i]) => {
          const j = E[i], A = api.criarNPCFixo(j, j.genero === 'F', 7, cores); atores.push(A);
          A.tipo = 'cena'; A.x = x; A.z = z; A.y = SALA.y; A.sentado = true; A.assento = 0.45; A.yaw = A.yawAlvo = yaw;
        });
        await api.preto(false, 500);
        await api.andar(J, [[ESC.x0 + 0.4, PORTA.z], [SALA.x0 + 3.6, zc + 0.1]], 1.6);
        await api.esperar(250);
        await api.preto(true, 450);
        // de uniforme: o boneco do jogador some e entra o de uniforme (com o nome nas costas)
        s.meus.delete(J.m); J.m.raiz.visible = false; if (J.anel) J.anel.visible = false;   // (a cidade mostra todo quadro só quem está em S.meus)
        const fem = typeof PERSONAGEM !== 'undefined' && PERSONAGEM.genero === 'F';
        const U = api.criarNPCFixo(api.aparenciaNaPartida(), fem, 7, cores); atores.push(U);
        U.tipo = 'cena'; U.x = SALA.x0 + 3.0; U.z = zc + 0.15; U.y = SALA.y; U.yaw = U.yawAlvo = Math.PI;
        s.falantesExtra.jog = { A: U, nome: api.nomeJog(), voz: typeof PERSONAGEM.voz === 'number' ? PERSONAGEM.voz : 2 };
        D.yaw = D.yawAlvo = 0;
        api.camCena({ px: SALA.x0 + 4.6, py: SALA.y + 1.62, pz: zc + 1.85, tx: SALA.x0 + 1.9, ty: SALA.y + 0.55, tz: zc - 0.25 });
        await api.esperar(350);
        await api.preto(false, 450);
        await conversaVestiario(g, ped, C);
        Dialogo.esconder();
        // 4) a pré-partida
        const vamos = await telaPrePartida(g, ped);
        void vamos;
        await api.preto(true, 300);
        for (const A of atores) try { api.descartarPessoa(A); } catch (e) { /* nada */ }
        atores.length = 0; delete s.falantesExtra.damiao; delete s.falantesExtra.rafa; delete s.falantesExtra.jog;
        tirarSala(); s.alturaExtra = null;
        s.meus.add(J.m); J.m.raiz.visible = true;
        // 5) a partida (5 minutos; 2 h no relógio da cidade, a partir do horário marcado)
        if (d.hora < H) api.tickHorario((H - d.hora) / api.H_POR_S);
        const r = await jogarPartida(g);
        api.tickHorario(2 / api.H_POR_S);
        // 6) o resultado, a rodada e a conversa na saída do vestiário
        const resumo = registrarJogo(C, g, r, ped);
        await depoisDoJogo(C, g, resumo);
      } catch (e) {
        console.error('[Várzea] dia de jogo:', e);
      } finally {
        for (const A of atores) try { api.descartarPessoa(A); } catch (e) { /* nada */ }
        if (s.falantesExtra) { delete s.falantesExtra.damiao; delete s.falantesExtra.rafa; delete s.falantesExtra.jog; }
        tirarSala(); s.alturaExtra = null; s.meus.add(J.m); J.m.raiz.visible = true;
        clearInterval(trava); s.camCena = null; M.cena = false; C.jogandoK = null;
        try { Dialogo.esconder(); } catch (e) { /* nada */ }
        await api.preto(false, 500);
        api.gravar('chegada');
      }
    }
    async function conversaVestiario(g, ped, C) {
      const A = TIMES_VZ[adversario(g)], nome = api.nomeJog(), primeiro = !C.conheceDamiao;
      if (primeiro) {
        C.conheceDamiao = true;
        await api.fala('damiao', Tgf('Então você é o tal de {0} que o Rafa tanto falou! Eu sou o Damião, técnico do Peladão faz quinze anos.', nome));
        await api.fala('damiao', T('Aqui embaixo é a nossa casa. Lá em cima pode ser guerra; aqui dentro todo mundo é família.'));
      } else await api.fala('damiao', pk([T('Chegou na hora! Bota a chuteira que hoje tem trabalho.'), T('Bom te ver! O time tá concentrado, hein.'), T('Senta aí um minuto que eu vou passar o jogo.')]));
      const casa = g.c === NOSSO_I;
      await api.fala('damiao', Tf('Hoje é {0}: {1} contra o {2}, {3}.', faseNome(g.r), TIMES_VZ[NOSSO_I].nome, A.nome, casa ? T('com a gente jogando em casa') : T('com eles jogando em casa')));
      await api.fala('damiao', Tf('O técnico deles é {0}. {1}', A.tecnico, T(A.nota)));
      const lista = ped.map((k) => T(PEDIDOS[k].txt).toLowerCase());
      const q = Tf('De você eu quero: {0}. Se fizer isso, a sua nota sobe.', lista.join('; '));
      await api.fala('damiao', q);
      const r = await Escolha.mostrar(q, [T('Pode deixar, professor!'), Tg('Tô um pouco nervoso...'), T('Eu sei jogar, não preciso de lição.')]);
      if (r === 2) await api.falaGrossa('damiao', 'damiao', T('Eu sei jogar, não preciso de lição.'), T('Lição todo mundo precisa. Lá em cima a gente vê quem sabe.'));
      else if (r === 1) { await api.fala('jog', Tg('Tô um pouco nervoso...')); await api.fala('damiao', T('Nervoso é bom: mostra que você se importa. Respira e joga o simples.')); await api.fala('rafa', T('Relaxa, a gente tá junto!')); }
      else { await api.fala('jog', T('Pode deixar, professor!')); await api.fala('damiao', T('É assim que se fala!')); }
      await api.fala('rafa', g.r > 8 ? T('Hoje é tudo ou nada! Bora, Peladão!') : pk([T('Bora, Peladão!'), T('Hoje a gente sai daqui com os três pontos!'), T('Vamo que vamo!')]));
    }

    // ---------------------------------------------------------------- a partida de verdade (motor) e o que fica guardado dela
    function cfgPartida(g) {
      const s = S(), adv = adversario(g), casa = g.c === NOSSO_I;
      const eu = { nome: (typeof PERSONAGEM !== 'undefined' && (PERSONAGEM.apelido || PERSONAGEM.nome)) || T('Você'), posicao: posicaoJog(), numero: PERSONAGEM.numero, aparencia: api.aparenciaNaPartida() };
      const clima = s.clima && (s.clima.estado === 'chuva' || s.clima.chuva > 0.35) ? 'chuva' : 'seco', h = dados().hora;
      const horario = h >= 6 && h < 15.5 ? 'dia' : h >= 15.5 && h < 18.4 ? 'tarde' : 'noite';
      const mm = g.r > 8;
      return { campo: 'varzeaCidade', times: [timeMotor(TIMES_VZ[NOSSO_I]), timeMotor(TIMES_VZ[adv])], mandante: casa ? 0 : 1,
        competicao: { tipo: mm ? 'copa' : 'amistoso', nome: T('Campeonato de Várzea'), rodada: mm ? 0 : g.r + 1, fase: mm ? (g.r === 10 ? 'Final' : 'Semifinal') : '', mataMata: mm, jogo: 'unico', placarIda: null },
        dificuldade: 'normal', clima, gramado: 'baixo', horario, duracao: DURACAO, usuario: eu, atributos: api.atributosJogador(), taticas: [null, null], formacoes: [null, null] };
    }
    async function jogarPartida(g) {
      const cfg = cfgPartida(g);
      api.sairParaPartida();
      let r = null;
      try { r = await Historia.partida({ cfg, aviso: Tf('{0}: {1} x {2}', faseNome(g.r), TIMES_VZ[g.c].nome, TIMES_VZ[g.f].nome), aoPronto: () => api.preto(false, 800) }); }
      catch (e) { console.error(e); try { Historia.abortar(); } catch (e2) { /* nada */ } }
      await api.preto(true, 900);
      api.voltarDaPartida();
      try { Historia.confirmarResultado(); } catch (e) { /* nada */ }
      return r;
    }
    function registrarJogo(C, g, r, ped) {
      const d = dados(), casa = g.c === NOSSO_I;
      if (!r || !r.placar) { g.comVoce = false; simularPlacar(C, g); fecharRodada(C, g.r, false); return { semJogo: true }; }
      g.comVoce = true;
      const [nos, eles] = r.placar; g.gc = casa ? nos : eles; g.gf = casa ? eles : nos;
      if (r.penaltis) g.pen = casa ? r.penaltis.slice() : [r.penaltis[1], r.penaltis[0]];
      g.feito = true;
      // a súmula: gols e assistências de todo mundo (o nome do jogador vem como __voce)
      const conta = [{}, {}];
      for (const x of r.golsLog || []) {
        if (x.autor) { const c = (conta[x.time][x.autor] = conta[x.time][x.autor] || { g: 0, a: 0 }); c.g++; }
        if (x.assist) { const c = (conta[x.time][x.assist] = conta[x.time][x.assist] || { g: 0, a: 0 }); c.a++; }
      }
      const avaliado = avaliarPedido(ped, r), bonus = r1(avaliado.filter((x) => x.ok).reduce((a, x) => a + x.b, 0));
      const notaFinal = r1(Math.min(10, (r.nota || 0) + bonus));
      const quem = [NOSSO_I, adversario(g)], resN = nos > eles ? 1 : nos < eles ? -1 : 0;
      const jogaram = r.jogaram && r.jogaram.length ? r.jogaram : null;
      for (let lado = 0; lado < 2; lado++) {
        const ti = quem[lado], t = TIMES_VZ[ti], E = elencoVz(t), sofr = lado ? nos : eles, res = lado ? -resN : resN;
        const nomes = jogaram ? jogaram.filter((p) => p.time === lado).map((p) => p.nome) : escalados(ti, lado === 0).map((x) => x.nome);
        for (const n of nomes) {
          const s = est(C, ti, n), c = conta[lado][n] || { g: 0, a: 0 };
          s.j++; s.g += c.g; s.a += c.a;
          if (n === '__voce') { s.nota = r1(s.nota + notaFinal); s.p += (r.estatisticas && r.estatisticas.passesOk) | 0; continue; }
          const x = E.find((j) => j.nome === n) || { pos: 'MID', hab: {}, media: 6 };
          s.p += passesDe(x); s.nota = r1(s.nota + notaNPC(x, c.g, c.a, res, sofr));
        }
      }
      // a carreira do jogador
      const rr = Object.assign({}, r, { nota: notaFinal, bom: !r.expulso && notaFinal >= 8 });
      try { api.carreira(); api.registrarCarreira('varzea', rr); } catch (e) { console.warn('[Várzea] carreira:', e); }
      C.notas = (C.notas || []).concat([{ r: g.r, nota: notaFinal, base: r.nota, bonus }]).slice(-12);
      d.precisaBanho = true;
      // a rodada fecha agora (os outros jogos dela são simulados)
      fecharRodada(C, g.r, false);
      return { r, nos, eles, avaliado, bonus, notaFinal };
    }
    // na saída do vestiário: o Seu Damião comenta o jogo, a nota (com o bônus) e a tabela
    async function depoisDoJogo(C, g, R) {
      const s = S(), J = s.jog, atores = [];
      J.sentado = false; J.rota = null; J.x = PORTA.x + 0.5; J.z = PORTA.z + 0.6; J.y = api.altura(J.x, J.z);
      const tec = TIMES_VZ[NOSSO_I], D = api.criarNPCFixo(apTecnico(tec), false, 0, ['#1f2a44', '#3a3a40', '#e8742a', '#1c1c1f']); atores.push(D);
      D.tipo = 'cena'; D.x = PORTA.x + 2.3; D.z = PORTA.z + 0.6; D.y = api.altura(D.x, D.z);
      const Rf = api.criarNPCFixo(elencoVz(tec).find((x) => x.nome === 'Rafa'), false, 7, ['#e8742a', '#1f2a44', '#1f2a44', '#e8742a']); atores.push(Rf);
      Rf.tipo = 'cena'; Rf.x = PORTA.x + 1.4; Rf.z = PORTA.z - 0.45; Rf.y = api.altura(Rf.x, Rf.z);
      D.yaw = D.yawAlvo = Math.atan2(-(J.z - D.z), J.x - D.x); Rf.yaw = Rf.yawAlvo = Math.atan2(-((J.z + D.z) / 2 + 0.8 - Rf.z), (J.x + D.x) / 2 - Rf.x);
      J.yaw = J.yawAlvo = Math.atan2(-(D.z - J.z), D.x - J.x);
      s.falantesExtra = s.falantesExtra || {}; s.falantesExtra.damiao = { A: D, nome: 'Seu Damião', voz: 1 }; s.falantesExtra.rafa = { A: Rf, nome: 'Rafa', voz: 3 };
      api.camCena({ px: PORTA.x + 1.4, py: 1.75, pz: PORTA.z + 5.4, tx: PORTA.x + 1.4, ty: 0.42, tz: PORTA.z + 0.1 });
      try { if (typeof Musica !== 'undefined') Musica.tocar('jazz'); } catch (e) { /* nada */ }
      await api.preto(false, 700);
      try {
        if (R.semJogo) { await api.fala('damiao', T('O jogo acabou sem você... a gente segurou como deu.')); return; }
        const { nos, eles, avaliado, bonus, notaFinal } = R, adv = nomeT(adversario(g));
        const ganhou = g.pen ? vencedor(g) === NOSSO_I : nos > eles, empate = !g.pen && nos === eles;
        if (g.pen) await api.fala('damiao', ganhou ? Tf('Nos pênaltis! {0} a {1} no tempo normal e a gente passou. Que sufoco!', nos, eles) : Tf('{0} a {1} e a gente caiu nos pênaltis... dói, mas fizemos o que deu.', nos, eles));
        else if (ganhou) await api.fala('damiao', pk([Tf('{0} a {1} no {2}! É disso que eu tô falando!', nos, eles, adv), Tf('Vitória! {0} a {1}. O Peladão tá vivo!', nos, eles)]));
        else if (empate) await api.fala('damiao', Tf('{0} a {1}. Empate é melhor que derrota, mas dava pra mais.', nos, eles));
        else await api.fala('damiao', Tf('{0} a {1} pra eles... cabeça erguida, que ainda tem jogo.', nos, eles));
        const feitos = avaliado.filter((x) => x.ok).length;
        if (feitos) await api.fala('damiao', Tf('Você fez {0} de {1} coisas que eu pedi: +{2} na nota. Nota final: {3}.', feitos, avaliado.length, bonus.toFixed(1), notaFinal.toFixed(1)));
        else await api.fala('damiao', Tf('Do que eu pedi, hoje não saiu nada. Nota final: {0}. No próximo jogo, presta atenção nisso.', notaFinal.toFixed(1)));
        if (g.r <= 8) {
          const pos = posicaoNa(C, NOSSO_I), p = classificacao(C).find((x) => x.i === NOSSO_I).p;
          if (g.r === 8) await api.fala('damiao', C.semis && C.semis.includes(NOSSO_I) ? Tf('Terminamos em {0}º lugar: estamos na SEMIFINAL!', pos) : Tf('Terminamos em {0}º lugar... ficamos fora da semifinal.', pos));
          else await api.fala('damiao', Tf('Estamos em {0}º lugar ({1} pts). Próximo jogo: {2}.', pos, p, proxNosso(C) ? nomeT(adversario(proxNosso(C))) + ', ' + T(DIAS[semanaDe(diaDa(C, proxNosso(C).r))]) + ' ' + fmt(horaDa(proxNosso(C).r)) : '—'));
        } else if (g.r === 9) await api.fala('damiao', ganhou ? T('ESTAMOS NA FINAL! Amanhã é o jogo da nossa vida!') : T('Caímos na semifinal... mas que campanha, hein? Obrigado por jogar com a gente.'));
        else {
          if (ganhou) { await api.fala('damiao', Tf('CAMPEÕES! O Peladão é campeão da várzea! A sua parte do prêmio: {0} fakes!', PREMIO_JOG)); try { api.somDinheiro(); api.ganhoNaTela(PREMIO_JOG); api.mostrarDinheiro(); } catch (e) { /* nada */ } }
          else await api.fala('damiao', T('Vice-campeão... chegamos na final, e isso ninguém tira da gente.'));
        }
        if (g.r <= 8 || ganhou) await api.fala('rafa', ganhou ? pk([T('É nóis!'), T('Que jogo! Bora comemorar!')]) : empate ? T('Faltou pouco. No próximo a gente pega!') : T('Bola pra frente, Peladão!'));
        Dialogo.esconder();
        if (g.r === 10) { await painelFinal(C); if (C.etapa === 'fim' && C.peneira !== 'convidado') await conversaPeneira(C); }
      } finally {
        Dialogo.esconder();
        for (const A of atores) try { api.descartarPessoa(A); } catch (e) { /* nada */ }
        delete s.falantesExtra.damiao; delete s.falantesExtra.rafa;
      }
    }

    // ---------------------------------------------------------------- A PRÉ-PARTIDA: páginas que deslizam para o lado
    //   1 Confronto (os emblemas no fundo, casa e fora, e a ENCARADA)  2 Os times  3 As escalações (média em cima de cada um)  4 O técnico
    function cssPre() {
      if (document.getElementById('vzCss')) return;
      const st = document.createElement('style'); st.id = 'vzCss';
      st.textContent = `
.vzPre{position:fixed;inset:0;z-index:40;display:flex;flex-direction:column;background:#14100c;color:#f4efe2;font:600 12px/1.3 var(--font-body,monospace);user-select:none;touch-action:pan-y}
.vzTopo{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:calc(6px + env(safe-area-inset-top,0px)) max(14px,env(safe-area-inset-right,0px)) 6px max(14px,env(safe-area-inset-left,0px));background:#2a1206;border-bottom:3px solid #f2c230}
.vzTopo b{font:700 13px/1 var(--font-display,monospace);letter-spacing:.06em;color:#f2c230}.vzTopo span{opacity:.85;font-size:11px;text-align:right}
.vzJanela{flex:1;overflow:hidden;position:relative}.vzTrilho{display:flex;height:100%;transition:transform .32s ease}
.vzPag{flex:0 0 100%;height:100%;box-sizing:border-box;padding:10px max(14px,env(safe-area-inset-right,0px)) 8px max(14px,env(safe-area-inset-left,0px));overflow:auto;position:relative}
.vzConfronto{display:flex;align-items:center;justify-content:space-between;overflow:hidden;padding:0}
.vzFundo{position:absolute;inset:0;background:linear-gradient(105deg,var(--c1) 0 49.5%,#14100c 49.5% 50.5%,var(--c2) 50.5% 100%)}
.vzFundo:after{content:"";position:absolute;inset:0;background:radial-gradient(ellipse at 50% 60%,rgba(0,0,0,.15),rgba(0,0,0,.62))}
.vzEmbG{position:absolute;top:50%;width:min(52vh,46vw);height:min(52vh,46vw);transform:translateY(-50%);image-rendering:pixelated;opacity:.28}
.vzEmbG.a{left:-4%}.vzEmbG.b{right:-4%}
.vzLado{position:relative;z-index:2;width:25%;display:flex;flex-direction:column;align-items:center;gap:3px;text-align:center;text-shadow:0 2px 0 #000}
.vzLado img{width:min(26vh,17vw);height:min(26vh,17vw);image-rendering:pixelated;filter:drop-shadow(0 3px 0 rgba(0,0,0,.6))}
.vzLado b{font:700 13px/1.1 var(--font-display,monospace)}.vzEtq{font:700 10px/1 var(--font-display,monospace);padding:3px 6px;background:#f2c230;color:#2a1206;border:2px solid #2a1206}
.vzEtq.fora{background:#c9d2e6}.vzEst{color:#f2c230;letter-spacing:1px;font-size:13px}
.vzPalco{position:relative;z-index:1;flex:1;height:100%;display:flex;align-items:flex-end;justify-content:center}
.vzPalco canvas{width:100%;height:100%;display:block;image-rendering:pixelated}
.vzX{position:absolute;z-index:3;left:50%;top:10px;transform:translateX(-50%);font:700 15px/1 var(--font-display,monospace);background:#2a1206;border:3px solid #f2c230;padding:5px 9px;color:#f2c230}
.vzGrade{display:grid;grid-template-columns:1fr 1fr;gap:10px;height:100%}
.vzCard{background:#241b12;border:3px solid #4a3622;padding:8px 10px;display:flex;flex-direction:column;gap:5px;min-width:0}
.vzCard h3{margin:0;display:flex;align-items:center;gap:6px;font:700 13px/1.1 var(--font-display,monospace)}.vzCard h3 img{width:28px;height:28px;image-rendering:pixelated}
.vzCard p{margin:0;font-size:11px;opacity:.9}.vzCard small{opacity:.75;font-size:10px}
.vzBarra{display:grid;grid-template-columns:62px 1fr 24px;align-items:center;gap:6px;font-size:10px}
.vzBarra i{display:block;height:8px;background:#3a2c1e;border:1px solid #000;position:relative}.vzBarra i b{position:absolute;left:0;top:0;bottom:0;background:#8fd16a}
.vzBarra i b.alto{background:#f2c230}.vzBarra i b.baixo{background:#d8664a}
.vzCampo{position:relative;flex:1;min-height:120px;background:repeating-linear-gradient(90deg,#3d7a35 0 12.5%,#46863c 12.5% 25%);border:2px solid #e8e2cc}
.vzCampo:before{content:"";position:absolute;left:50%;top:0;bottom:0;border-left:2px solid rgba(232,226,204,.8)}
.vzJ{position:absolute;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:1px;font-size:9px;text-shadow:0 1px 0 #000;white-space:nowrap}
.vzJ em{font-style:normal;font:700 10px/1 var(--font-display,monospace);background:#14100c;border:2px solid #f2c230;padding:1px 3px;color:#f2c230}
.vzJ i{width:10px;height:10px;border:2px solid #14100c;background:var(--c)}.vzJ.voce em{background:#f2c230;color:#2a1206}
.vzTec{display:flex;gap:12px;height:100%;align-items:stretch}.vzTec .vzCard{flex:1}
.vzPed{display:flex;justify-content:space-between;gap:8px;padding:5px 7px;background:#2f2418;border:2px solid #4a3622}.vzPed b{color:#8fd16a;white-space:nowrap}
.vzRodape{display:flex;align-items:center;gap:8px;padding:6px max(14px,env(safe-area-inset-right,0px)) calc(6px + env(safe-area-inset-bottom,0px)) max(14px,env(safe-area-inset-left,0px));background:#2a1206;border-top:3px solid #4a3622}
.vzSeta{font:700 16px/1 var(--font-display,monospace);width:38px;height:32px;background:#4a3622;color:#f4efe2;border:2px solid #000}
.vzPontos{display:flex;gap:6px;align-items:center}.vzPontos span{width:28px;height:6px;background:#4a3622}.vzPontos span.on{background:#f2c230}
.vzAba{flex:1;font-size:11px;opacity:.85;text-align:center}
.vzJogar{font:700 13px/1 var(--font-display,monospace);padding:9px 14px;background:#f2c230;color:#2a1206;border:3px solid #000;box-shadow:0 3px 0 #000}
.vzFim{position:fixed;inset:0;z-index:41;background:rgba(10,8,6,.92);display:flex;align-items:center;justify-content:center;color:#f4efe2;font:600 12px/1.35 var(--font-body,monospace)}
.vzFim .caixa{background:#241b12;border:4px solid #f2c230;padding:12px 16px;width:min(560px,calc(100% - 32px));max-height:calc(100% - 24px);overflow:auto;display:flex;flex-direction:column;gap:8px;align-items:center;text-align:center}
.vzFim h2{margin:0;font:700 16px/1.1 var(--font-display,monospace);color:#f2c230}.vzFim img{width:76px;height:76px;image-rendering:pixelated}
.vzFim ul{list-style:none;margin:0;padding:0;width:100%;display:flex;flex-direction:column;gap:4px}.vzFim li{display:flex;justify-content:space-between;gap:8px;background:#2f2418;border:2px solid #4a3622;padding:5px 8px}
@media (max-height:300px){.vzPag{padding-top:6px}.vzCard{padding:6px 8px;gap:3px}}
@media (orientation:portrait){.vzGrade{grid-template-columns:1fr}.vzTec{flex-direction:column}.vzLado{width:30%}}
`;
      document.head.appendChild(st);
    }
    const escH = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const estrelasTxt = (n) => '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n);
    const media10 = (v) => Math.round(v * 10);
    const SETORES = [['gk', 'Goleiro'], ['def', 'Defesa'], ['mid', 'Meio'], ['fwd', 'Ataque']];
    function cardTime(ti, C) {
      const t = TIMES_VZ[ti], f = forcaTime(t), e = estrelasDe(f.media), cl = classificacao(C).find((x) => x.i === ti), pos = posicaoNa(C, ti);
      const forte = SETORES.reduce((a, b) => (f[b[0]] > f[a[0]] ? b : a)), fraco = SETORES.reduce((a, b) => (f[b[0]] < f[a[0]] ? b : a));
      const destaque = f[forte[0]] - f.media >= 0.6 ? Tf('Joga bem: {0} (média {1}).', T(forte[1]).toLowerCase(), media10(f[forte[0]])) : T('Joga bem: nenhum setor se destaca, o time é parelho.');
      const fraqueza = f.media - f[fraco[0]] >= 0.6 ? ' ' + Tf('Ponto fraco: {0} (média {1}).', T(fraco[1]).toLowerCase(), media10(f[fraco[0]])) : '';
      const barras = SETORES.map(([k, n]) => { const v = f[k], cls = v - f.media >= 0.6 ? 'alto' : f.media - v >= 0.6 ? 'baixo' : ''; return '<div class="vzBarra"><span>' + escH(T(n)) + '</span><i><b class="' + cls + '" style="width:' + Math.round(v * 10) + '%"></b></i><span>' + media10(v) + '</span></div>'; }).join('');
      return '<div class="vzCard"><h3><img src="' + urlArte(t.k) + '" alt="">' + escH(t.nome) + '</h3>'
        + '<p><span class="vzEst">' + estrelasTxt(e) + '</span> · ' + escH(Tf('média {0}', media10(f.media))) + (cl && cl.j ? ' · ' + escH(Tf('{0}º lugar, {1} pts', pos, cl.p)) : '') + '</p>'
        + '<p>' + escH(Tf('Técnico: {0}', t.tecnico)) + ' · ' + escH(Tf('Esquema: {0}', nomeFormacao(t.formacao))) + '</p>' + barras
        + '<p>' + escH(destaque + fraqueza) + '</p><small>' + escH(T(t.nota)) + '</small></div>';
    }
    function campoTime(ti, espelho) {
      const t = TIMES_VZ[ti], L = LINHAS6[t.formacao] || [2, 3, 1], tt = titulares(t), cor = t.uni[0];
      const linhas = [[tt[0]]]; let k = 1; for (const m of L) { linhas.push(tt.slice(k, k + m)); k += m; }
      const nL = linhas.length, out = [];
      linhas.forEach((l, li) => l.forEach((j, i) => {
        const fx = 8 + li * (84 / (nL - 1)), fy = l.length === 1 ? 50 : 16 + i * (68 / (l.length - 1));
        out.push('<div class="vzJ' + (j.voce ? ' voce' : '') + '" style="left:' + (espelho ? 100 - fx : fx) + '%;top:' + fy + '%;--c:' + cor + '"><em>' + media10(j.media) + '</em><i></i><span>' + escH(j.voce ? api.nomeJog() : j.nome) + '</span></div>');
      }));
      return '<div class="vzCard"><h3><img src="' + urlArte(t.k) + '" alt="">' + escH(t.nome) + ' · ' + nomeFormacao(t.formacao) + '</h3><div class="vzCampo">' + out.join('') + '</div></div>';
    }
    function telaPrePartida(g, ped) {
      cssPre();
      const C = camp(), casa = TIMES_VZ[g.c], fora = TIMES_VZ[g.f], d = dados();
      const nossoCasa = g.c === NOSSO_I, adv = adversario(g), tecN = TIMES_VZ[NOSSO_I].tecnico;
      const el = document.createElement('div'); el.className = 'vzPre';
      const pedHtml = ped.map((k) => '<div class="vzPed"><span>' + escH(T(PEDIDOS[k].txt)) + '</span><b>+' + PEDIDOS[k].b.toFixed(1) + '</b></div>').join('');
      const ABAS = [T('Confronto'), T('Os times'), T('Escalações'), T('O que o técnico quer')];
      el.innerHTML = '<div class="vzTopo"><b>' + escH(T('CAMPEONATO DE VÁRZEA')) + '</b><span>' + escH(faseNome(g.r) + ' · ' + T(DIAS[semanaDe(d.dia)]) + ', ' + fmt(horaDa(g.r))) + '</span></div>'
        + '<div class="vzJanela"><div class="vzTrilho">'
        + '<div class="vzPag vzConfronto" style="--c1:' + casa.uni[0] + ';--c2:' + fora.uni[0] + '"><div class="vzFundo"></div><img class="vzEmbG a" src="' + urlArte(casa.k) + '" alt=""><img class="vzEmbG b" src="' + urlArte(fora.k) + '" alt="">'
        + '<div class="vzLado"><img src="' + urlArte(casa.k) + '" alt=""><b>' + escH(casa.nome) + '</b><span class="vzEst">' + estrelasTxt(estrelas(casa)) + '</span><span class="vzEtq">' + escH(T('CASA')) + '</span></div>'
        + '<div class="vzPalco"><canvas></canvas><div class="vzX">' + escH(casa.sigla + '  ×  ' + fora.sigla) + '</div></div>'
        + '<div class="vzLado"><img src="' + urlArte(fora.k) + '" alt=""><b>' + escH(fora.nome) + '</b><span class="vzEst">' + estrelasTxt(estrelas(fora)) + '</span><span class="vzEtq fora">' + escH(T('FORA')) + '</span></div></div>'
        + '<div class="vzPag"><div class="vzGrade">' + cardTime(g.c, C) + cardTime(g.f, C) + '</div></div>'
        + '<div class="vzPag"><div class="vzGrade">' + campoTime(g.c, false) + campoTime(g.f, true) + '</div></div>'
        + '<div class="vzPag"><div class="vzTec"><div class="vzCard"><h3><img src="' + urlArte(NOSSO) + '" alt="">' + escH(tecN) + '</h3><p>' + escH(Tf('"Contra o {0}, eu quero isto de você:"', TIMES_VZ[adv].nome)) + '</p>' + pedHtml
        + '<small>' + escH(T('Cada pedido cumprido soma na sua nota final da partida.')) + '</small></div>'
        + '<div class="vzCard"><h3>' + escH(T('A partida')) + '</h3><p>' + escH(Tf('{0} minutos de jogo (2 horas no relógio da cidade).', DURACAO / 60)) + '</p><p>' + escH(Tf('Sua posição: {0} · sua média: {1}', T({ GK: 'Goleiro', DEF: 'Defesa', MID: 'Meio', FWD: 'Ataque' }[posicaoJog()]), media10(mediaJog()))) + '</p>'
        + (g.r > 8 ? '<p>' + escH(T('Mata-mata: se empatar, a vaga sai nos pênaltis.')) + '</p>' : '<p>' + escH(T('Vitória vale 3 pontos e empate, 1.')) + '</p>') + '</div></div></div>'
        + '</div></div>'
        + '<div class="vzRodape"><button type="button" class="vzSeta" data-a="ant">‹</button><div class="vzPontos">' + ABAS.map((a, i) => '<span data-i="' + i + '"></span>').join('') + '</div><button type="button" class="vzSeta" data-a="prox">›</button><div class="vzAba"></div><button type="button" class="vzJogar" data-a="jogar">' + escH(T('COMEÇAR PARTIDA')) + ' ▶</button></div>';
      (document.getElementById('raizJogo') || document.body).appendChild(el);
      const trilho = el.querySelector('.vzTrilho'), aba = el.querySelector('.vzAba'), pontos = [...el.querySelectorAll('.vzPontos span')];
      let pag = 0;
      const ir = (i) => { pag = clampN(i, 0, ABAS.length - 1); trilho.style.transform = 'translateX(' + (-100 * pag) + '%)'; aba.textContent = ABAS[pag]; pontos.forEach((p, k) => p.classList.toggle('on', k === pag)); };
      ir(0);
      const palco = encarada(el.querySelector('.vzPalco canvas'), nossoCasa, adv);
      const jan = el.querySelector('.vzJanela'); let x0 = null;
      jan.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
      jan.addEventListener('pointerup', (e) => { if (x0 == null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 40) ir(pag + (dx < 0 ? 1 : -1)); });
      return new Promise((ok) => {
        el.addEventListener('click', (e) => {
          const b = e.target.closest('[data-a],[data-i]'); if (!b) return;
          try { if (typeof somClique === 'function') somClique(); } catch (er) { /* nada */ }
          if (b.dataset.i != null) return ir(+b.dataset.i);
          if (b.dataset.a === 'ant') return ir(pag - 1);
          if (b.dataset.a === 'prox') return ir(pag + 1);
          if (b.dataset.a === 'jogar') { palco.parar(); el.remove(); ok(true); }
        });
      });
    }

    // ---------------------------------------------------------------- A ENCARADA: os dois jogadores frente a frente (10 poses)
    //   O boneco olha para +x com yaw 0. Braço: rotation.z = para a frente, rotation.x = para o lado (esquerdo +, direito −);
    //   cotovelo (usarCotovelo): ax dobra para dentro (esquerdo −, direito +), az levanta o antebraço à frente; usarCabeca: + olha para cima.
    const POSES = [
      (m) => { m.bracoE.rotation.set(-0.32, 0, 0.62); m.bracoD.rotation.set(0.32, 0, 0.62); usarCotovelo(m.bracoE, -1.05, 1.5); usarCotovelo(m.bracoD, 1.05, 1.5); usarCabeca(m, 0.12); },           // braços cruzados
      (m) => { m.bracoE.rotation.set(0.5, 0, 0.1); m.bracoD.rotation.set(-0.5, 0, 0.1); usarCotovelo(m.bracoE, -1.4, 0); usarCotovelo(m.bracoD, 1.4, 0); usarCabeca(m, 0.18); },   // mãos na cintura
      (m) => { m.bracoD.rotation.set(0.12, 0, 1.45); m.bracoE.rotation.set(0.08, 0, -0.08); usarCabeca(m, 0.08); m.corpo.rotation.z = -0.06; },                                            // apontando para ele
      (m) => { m.corpo.rotation.z = -0.1; m.bracoE.rotation.set(0.18, 0, -0.3); m.bracoD.rotation.set(-0.18, 0, -0.3); usarCabeca(m, 0.25); },                                         // testa a testa (inclinado para a frente)
      (m) => { m.corpo.rotation.z = 0.1; m.bracoE.rotation.set(0.22, 0, -0.2); m.bracoD.rotation.set(-0.22, 0, -0.2); usarCabeca(m, 0.36); },                                              // queixo erguido, peito estufado
      (m) => { m.bracoD.rotation.set(0.25, 0, 0.75); usarCotovelo(m.bracoD, 0.4, 1.9); m.bracoE.rotation.set(0.1, 0, 0); usarCabeca(m, 0.1); },                                              // punho fechado na frente do peito
      (m) => { m.bracoE.rotation.set(0.95, 0, 0.15); m.bracoD.rotation.set(-0.95, 0, 0.15); usarCotovelo(m.bracoE, 0, 1.35); usarCotovelo(m.bracoD, 0, 1.35); usarCabeca(m, 0.15); m.corpo.rotation.z = 0.05; },   // "vem!" (braços abertos)
      (m) => { m.bracoE.rotation.set(-0.42, 0, 0.5); usarCotovelo(m.bracoE, 0, 2.05); m.bracoD.rotation.set(-0.08, 0, -0.05); usarCabeca(m, 0.22); },                                       // a mão no escudo
      (m) => { m.bracoE.rotation.set(-0.25, 0, 0.6); m.bracoD.rotation.set(0.25, 0, 0.6); usarCotovelo(m.bracoE, -0.5, 1.1); usarCotovelo(m.bracoD, 0.5, 1.1); usarCabeca(m, 0.05); },   // estalando os dedos
      (m) => { m.bracoE.rotation.set(0.32, 0, 0.12); usarCotovelo(m.bracoE, -1.5, 0.35); m.bracoD.rotation.set(-0.1, 0, 0.05); usarCabeca(m, 0.16); if (m.bolaV) m.bolaV.visible = true; },   // a bola debaixo do braço
    ];
    function encarada(canvas, nossoCasa, adv) {
      let R = null, raf = 0, vivo = true;
      const parar = () => { vivo = false; cancelAnimationFrame(raf); try { if (R) { R.dispose(); R.forceContextLoss(); } } catch (e) { /* nada */ } };
      try {
        const w = Math.max(160, canvas.clientWidth || 300), h = Math.max(120, canvas.clientHeight || 220);
        R = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false }); R.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); R.setSize(w, h, false);
        const cena = new THREE.Scene(); cena.add(new THREE.HemisphereLight(0xfff4e0, 0x3a2c1e, 1.05)); const sol = new THREE.DirectionalLight(0xffffff, 1.0); sol.position.set(1.5, 4, 5); cena.add(sol);
        const cam = new THREE.PerspectiveCamera(26, w / h, 0.1, 40); cam.position.set(0, 1.0, 6.4); cam.lookAt(0, 0.96, 0);
        const ladoNosso = nossoCasa ? -1 : 1;                                // a casa fica do lado esquerdo da tela
        const tN = TIMES_VZ[NOSSO_I], tA = TIMES_VZ[adv], uN = uniDe(tN.uni), uA = uniDe(tA.uni);
        const E = elencoVz(tA), rival = (E.find((j) => j.pos === (posicaoJog() === 'DEF' ? 'FWD' : posicaoJog() === 'FWD' ? 'DEF' : 'MID')) || E[1]);
        const ap = api.aparenciaNaPartida();
        const fazer = (U, t, a, num, nomeC) => {
          const m = makeAthlete({ camisa: U.camisa, listra: U.listra, gola: U.gola, numero: num, calcao: U.calcao, meia: U.meia, sola: U.sola, emblema: { forma: 'escudo', cor1: t.uni[0], cor2: t.uni[1], letras: t.sigla.slice(0, 2) },
            pele: a.pele, cabelo: a.cabelo, estilo: a.estilo, barba: a.barba, rosto: a.rosto, labio: a.labio, corBarba: a.corBarba, nomeCamisa: nomeC, manga: a.manga, meiao: a.meiao, chuteira: a.chuteira, nome: ' ', fundoNome: 'rgba(0,0,0,0)' });
          if (m.etiqueta) m.etiqueta.visible = false; if (m.sombra) m.sombra.visible = false;
          if (typeof ATLETAS !== 'undefined') ATLETAS.delete(m);           // fora da lista do jogo: a cidade esconde todo atleta que não é dela
          cena.add(m.raiz); return m;
        };
        const mN = fazer(uN, tN, ap, (typeof PERSONAGEM !== 'undefined' && PERSONAGEM.numero) || 10, ap.nomeCamisa), mA = fazer(uA, tA, rival, 5, '');
        // a bola (para a pose da bola debaixo do braço): presa no corpo, encostada no quadril e no braço
        const bola = () => { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.11, 1), new THREE.MeshLambertMaterial({ color: 0xf2f2ee })); b.visible = false; return b; };
        for (const m of [mN, mA]) { m.bolaV = bola(); m.bolaV.position.set(0.02, 0.98, -0.33); m.raiz.add(m.bolaV); }
        const pN = Math.floor(Math.random() * POSES.length); let pA = Math.floor(Math.random() * POSES.length); if (pA === pN) pA = (pA + 3) % POSES.length;
        POSES[pN](mN); POSES[pA](mA);
        mN.raiz.position.set(ladoNosso * 0.74, 0, 0); mA.raiz.position.set(-ladoNosso * 0.74, 0, 0);
        mN.raiz.rotation.y = ladoNosso < 0 ? -0.55 : Math.PI + 0.55; mA.raiz.rotation.y = ladoNosso < 0 ? Math.PI + 0.55 : -0.55;   // de frente um para o outro, um pouco virados para a câmera (dá para ver a cara)
        const t0 = performance.now(), y0N = mN.corpo.position.y, y0A = mA.corpo.position.y;
        const quadro = () => {
          if (!vivo) return;
          const t = (performance.now() - t0) / 1000;
          mN.corpo.position.y = y0N + Math.max(0, Math.sin(t * 2.1)) * 0.012; mA.corpo.position.y = y0A + Math.max(0, Math.sin(t * 2.1 + 1.3)) * 0.012;   // respirando
          R.render(cena, cam); raf = requestAnimationFrame(quadro);
        };
        quadro();
      } catch (e) { console.warn('[Várzea] encarada:', e); }
      return { parar };
    }

    // ---------------------------------------------------------------- o fim do campeonato: campeão e os prêmios individuais
    function painelFinal(C) {
      cssPre();
      const P = C.premios || {}, nomeP = (x) => (x ? (x.n === '__voce' ? api.nomeJog() + ' ★' : x.n) : '—'), timeP = (x) => (x ? TIMES_VZ[x.t].nome : '');
      const el = document.createElement('div'); el.className = 'vzFim';
      const linha = (rot, x, val) => '<li><span>' + escH(rot) + '</span><span><b>' + escH(nomeP(x)) + '</b> · ' + escH(timeP(x)) + (x ? ' · ' + escH(val) : '') + '</span></li>';
      el.innerHTML = '<div class="caixa"><h2>' + escH(T('CAMPEÃO DA VÁRZEA')) + '</h2><img src="' + urlArte(TIMES_VZ[C.campeao].k) + '" alt=""><b>' + escH(nomeT(C.campeao)) + '</b>'
        + (C.campeao === NOSSO_I ? '<p>' + escH(Tf('Sua parte do prêmio: {0} fakes.', PREMIO_JOG)) + '</p>' : '')
        + '<ul>' + linha(T('Melhor jogador'), P.melhor, P.melhor ? Tf('nota média {0}', P.melhor.v.toFixed(1)) : '')
        + linha(T('Artilheiro'), P.art, P.art ? Tf('{0} gols', P.art.v) : '') + linha(T('Líder de assistências'), P.ass, P.ass ? Tf('{0} assistências', P.ass.v) : '') + '</ul>'
        + '<button type="button" class="vzJogar">' + escH(T('Fechar')) + '</button></div>';
      (document.getElementById('raizJogo') || document.body).appendChild(el);
      return new Promise((ok) => { el.querySelector('button').onclick = () => { el.remove(); ok(); }; });
    }
    // o resumo para o app Carreira do computador (fase2.js lê o save da cidade)
    function resumoCarreira() {
      const C = camp(); if (!C.jogos) return null;
      return { etapa: C.etapa, tabela: classificacao(C).map((x) => Object.assign({ nome: TIMES_VZ[x.i].nome, sigla: TIMES_VZ[x.i].sigla }, x)) };
    }

    return { tick, alvos, _M: M, _fns: { conversarRafa, diaDeJogo, iniciarCampeonato, fecharRodadas, fecharRodada, telaPrePartida, painelFinal, montarSala, tirarSala, alturaVestiario, encarada, registrarJogo, depoisDoJogo, camp, vagas, cfgPartida, jogoDeHoje, conversaVestiario },
      dados: { POSES, TIMES_VZ, elencoVz, forcaTime, estrelas, titulares, classificacao, premios, arte, urlArte, resumoCarreira, PREMIO_JOG } };
  }

  // ============================================================================================ TRADUÇÕES (en, es, it, fr)
  const TRAD = {
    "Final": ["Final", "Final", "Finale", "Finale"],
    "Semifinal": ["Semifinal", "Semifinal", "Semifinale", "Demi-finale"],
    "Rodada {0} de 9": ["Round {0} of 9", "Jornada {0} de 9", "Giornata {0} di 9", "Journée {0} sur 9"],
    "E aí, {0}! Pensou melhor no campeonato?": ["Hey, {0}! Did you think it over about the tournament?", "¡Ey, {0}! ¿Lo pensaste mejor lo del campeonato?", "Ehi, {0}! Ci hai ripensato al campionato?", "Salut, {0} ! Tu as réfléchi pour le championnat ?"],
    "Ei, {0}! Lembra de mim? Sou o Rafa, já joguei umas vezes no seu time lá no racha do sintético.": ["Hey, {0}! Remember me? I'm Rafa, I've played on your team a few times at the turf pickup game.", "¡Ey, {0}! ¿Te acuerdas de mí? Soy Rafa, ya jugué algunas veces en tu equipo en la pachanga del sintético.", "Ehi, {0}! Ti ricordi di me? Sono Rafa, ho giocato qualche volta nella tua squadra alla partitella sul sintetico.", "Hé, {0} ! Tu te souviens de moi ? C'est Rafa, j'ai déjà joué quelques fois dans ton équipe au foot sur le synthétique."],
    "Ei, {0}! Sou o Rafa. Já te vi jogando na quadra coberta e até bati uma bola com vocês umas vezes.": ["Hey, {0}! I'm Rafa. I've seen you play at the covered court and even kicked a ball with you guys a few times.", "¡Ey, {0}! Soy Rafa. Ya te vi jugar en la cancha techada y hasta jugué con ustedes algunas veces.", "Ehi, {0}! Sono Rafa. Ti ho visto giocare al campetto coperto e ho anche giocato con voi qualche volta.", "Hé, {0} ! C'est Rafa. Je t'ai déjà vu jouer au terrain couvert et j'ai même tapé le ballon avec vous quelques fois."],
    "Tô vendo você jogar faz um tempo... e você tá voando!": ["I've been watching you play for a while... and you're on fire!", "Hace tiempo que te veo jugar... ¡y estás volando!", "È da un po' che ti guardo giocare... e stai volando!", "Ça fait un moment que je te regarde jouer... et tu es en feu !"],
    "Eu tô montando o time do Peladão pro campeonato de várzea aqui do campo. São dez times, todo mundo contra todo mundo; os quatro melhores vão pra semifinal e depois tem a final.": ["I'm putting together the Peladão team for the amateur tournament here at the pitch. Ten teams, everyone plays everyone; the top four go to the semifinals and then there's the final.", "Estoy armando el equipo del Peladão para el campeonato de barrio de esta cancha. Son diez equipos, todos contra todos; los cuatro mejores van a semifinales y después viene la final.", "Sto mettendo su la squadra del Peladão per il torneo dilettanti di questo campo. Sono dieci squadre, tutti contro tutti; le prime quattro vanno in semifinale e poi c'è la finale.", "Je monte l'équipe du Peladão pour le championnat amateur de ce terrain. Dix équipes, tout le monde contre tout le monde ; les quatre meilleures vont en demi-finale, puis il y a la finale."],
    "O campeão leva {0} fakes. A gente divide no time, entre os jogadores e o técnico: a sua parte fica em {1} fakes.": ["The champion takes {0} fakes. We split it in the team, between the players and the coach: your share comes to {1} fakes.", "El campeón se lleva {0} fakes. Lo repartimos en el equipo, entre los jugadores y el entrenador: tu parte queda en {1} fakes.", "Il campione prende {0} fakes. Li dividiamo in squadra, tra i giocatori e l'allenatore: la tua parte è di {1} fakes.", "Le champion remporte {0} fakes. On partage dans l'équipe, entre les joueurs et l'entraîneur : ta part fait {1} fakes."],
    "Os jogos são no sábado às {0} e no domingo às {1}: ninguém do time trabalha nesses horários.": ["Games are on Saturday at {0} and Sunday at {1}: nobody on the team works at those times.", "Los partidos son el sábado a las {0} y el domingo a las {1}: nadie del equipo trabaja a esa hora.", "Le partite sono il sabato alle {0} e la domenica alle {1}: nessuno della squadra lavora a quell'ora.", "Les matchs sont le samedi à {0} et le dimanche à {1} : personne dans l'équipe ne travaille à ces heures-là."],
    "E aí, fecha com a gente?": ["So, are you in?", "¿Y qué, te sumas?", "Allora, ci stai?", "Alors, tu es partant ?"],
    "Fechado! Tô dentro!": ["Deal! I'm in!", "¡Trato hecho! ¡Me apunto!", "Affare fatto! Ci sto!", "Marché conclu ! J'en suis !"],
    "Agora não, valeu.": ["Not now, thanks.", "Ahora no, gracias.", "Adesso no, grazie.", "Pas maintenant, merci."],
    "Time de várzea? Eu sou bom demais pra isso.": ["An amateur team? I'm way too good for that.", "¿Equipo de barrio? Soy demasiado bueno para eso.", "Una squadra di dilettanti? Sono troppo bravo per queste cose.", "Une équipe amateur ? Je suis bien trop bon pour ça."],
    "Time de várzea? Eu sou boa demais pra isso.": ["An amateur team? I'm way too good for that.", "¿Equipo de barrio? Soy demasiado buena para eso.", "Una squadra di dilettanti? Sono troppo brava per queste cose.", "Une équipe amateur ? Je suis bien trop bonne pour ça."],
    "Nossa... beleza então. Se baixar a bola, a vaga ainda tá aqui.": ["Wow... okay then. If you come down from that high horse, the spot is still here.", "Vaya... bueno, entonces. Si bajas los humos, el lugar sigue aquí.", "Caspita... va bene allora. Se abbassi la cresta, il posto è ancora qui.", "Eh ben... d'accord. Si tu redescends sur terre, la place est toujours là."],
    "Tranquilo! Se mudar de ideia, é só me procurar aqui na frente do campo.": ["No problem! If you change your mind, just find me here in front of the pitch.", "¡Tranquilo! Si cambias de idea, búscame aquí frente a la cancha.", "Tranquillo! Se cambi idea, cercami qui davanti al campo.", "Pas de souci ! Si tu changes d'avis, viens me voir ici devant le terrain."],
    "Aí sim! O primeiro jogo é no sábado, dia {0}, às {1}, contra o {2}.": ["That's it! The first game is on Saturday, day {0}, at {1}, against {2}.", "¡Eso! El primer partido es el sábado, día {0}, a las {1}, contra {2}.", "Così si fa! La prima partita è sabato, giorno {0}, alle {1}, contro {2}.", "Voilà ! Le premier match, c'est samedi, jour {0}, à {1}, contre {2}."],
    "Chega uma hora antes. O vestiário fica embaixo do campo: é só descer a escada da casinha, perto do banco. O Seu Damião, nosso técnico, vai estar te esperando.": ["Get here an hour early. The locker room is under the pitch: just go down the stairs in the little hut, next to the bench. Mr. Damião, our coach, will be waiting for you.", "Llega una hora antes. El vestuario está debajo de la cancha: solo baja la escalera de la casita, cerca del banco. Don Damião, nuestro entrenador, te estará esperando.", "Arriva un'ora prima. Lo spogliatoio è sotto il campo: basta scendere la scala della casetta, vicino alla panchina. Il signor Damião, il nostro allenatore, ti aspetterà.", "Viens une heure avant. Le vestiaire est sous le terrain : il suffit de descendre l'escalier de la cabane, près du banc. M. Damião, notre entraîneur, t'attendra."],
    "Você entrou para o {0}!": ["You joined {0}!", "¡Entraste en {0}!", "Sei entrato nel {0}!", "Tu as rejoint le {0} !"],
    "Você não apareceu no jogo contra o {0}...": ["You didn't show up for the game against {0}...", "No apareciste en el partido contra {0}...", "Non ti sei presentato alla partita contro {0}...", "Tu n'es pas venu au match contre {0}..."],
    "Jogamos sem você: {0} {1} x {2} {3}.": ["We played without you: {0} {1} x {2} {3}.", "Jugamos sin ti: {0} {1} x {2} {3}.", "Abbiamo giocato senza di te: {0} {1} x {2} {3}.", "On a joué sans toi : {0} {1} x {2} {3}."],
    "Pênaltis {0}x{1}.": ["Penalties {0}x{1}.", "Penales {0}x{1}.", "Rigori {0}x{1}.", "Tirs au but {0}x{1}."],
    "Não deu... a gente ficou fora da semifinal.": ["It didn't work out... we missed the semifinals.", "No se dio... quedamos fuera de las semifinales.", "Non ce l'abbiamo fatta... siamo fuori dalla semifinale.", "Ça n'a pas suffi... on est hors de la demi-finale."],
    "Valeu por jogar com a gente! Ano que vem tem mais.": ["Thanks for playing with us! There's more next year.", "¡Gracias por jugar con nosotros! El año que viene hay más.", "Grazie per aver giocato con noi! L'anno prossimo si riparte.", "Merci d'avoir joué avec nous ! L'an prochain, on remet ça."],
    "Hoje tem jogo! {0} contra o {1}, às {2}.": ["Game day today! {0} against {1}, at {2}.", "¡Hoy hay partido! {0} contra {1}, a las {2}.", "Oggi si gioca! {0} contro {1}, alle {2}.", "Aujourd'hui, il y a match ! {0} contre {1}, à {2}."],
    "Chega uma hora antes, no vestiário embaixo do campo.": ["Get here an hour early, at the locker room under the pitch.", "Llega una hora antes, al vestuario debajo de la cancha.", "Arriva un'ora prima, allo spogliatoio sotto il campo.", "Viens une heure avant, au vestiaire sous le terrain."],
    "SOMOS CAMPEÕES! A sua parte do prêmio ({0} fakes) já tá na sua conta!": ["WE ARE THE CHAMPIONS! Your share of the prize ({0} fakes) is already in your account!", "¡SOMOS CAMPEONES! ¡Tu parte del premio ({0} fakes) ya está en tu cuenta!", "SIAMO CAMPIONI! La tua parte del premio ({0} fakes) è già sul tuo conto!", "ON EST CHAMPIONS ! Ta part du prix ({0} fakes) est déjà sur ton compte !"],
    "O campeão da várzea foi o {0}.": ["The amateur champion was {0}.", "El campeón del barrio fue {0}.", "Il campione dei dilettanti è stato il {0}.", "Le champion amateur, c'est {0}."],
    "Melhor jogador: {0} · Artilheiro: {1} · Assistências: {2}": ["Best player: {0} · Top scorer: {1} · Assists: {2}", "Mejor jugador: {0} · Goleador: {1} · Asistencias: {2}", "Miglior giocatore: {0} · Capocannoniere: {1} · Assist: {2}", "Meilleur joueur : {0} · Meilleur buteur : {1} · Passes décisives : {2}"],
    "Missão: jogo do Peladão FC contra o {0} às {1}, na várzea. O vestiário abre às {2}.": ["Mission: Peladão FC game against {0} at {1}, at the dirt pitch. The locker room opens at {2}.", "Misión: partido del Peladão FC contra {0} a las {1}, en la cancha de barrio. El vestuario abre a las {2}.", "Missione: partita del Peladão FC contro {0} alle {1}, al campetto. Lo spogliatoio apre alle {2}.", "Mission : match du Peladão FC contre {0} à {1}, au terrain du quartier. Le vestiaire ouvre à {2}."],
    "Falar com o Rafa": ["Talk to Rafa", "Hablar con Rafa", "Parla con Rafa", "Parler à Rafa"],
    "Jogo às {0} (o vestiário abre às {1})": ["Game at {0} (the locker room opens at {1})", "Partido a las {0} (el vestuario abre a las {1})", "Partita alle {0} (lo spogliatoio apre alle {1})", "Match à {0} (le vestiaire ouvre à {1})"],
    "Ir para o vestiário ({0} x {1})": ["Go to the locker room ({0} x {1})", "Ir al vestuario ({0} x {1})", "Vai allo spogliatoio ({0} x {1})", "Aller au vestiaire ({0} x {1})"],
    "Então você é o tal de {0} que o Rafa tanto falou! Eu sou o Damião, técnico do Peladão faz quinze anos.": ["So you're the famous {0} Rafa keeps talking about! I'm Damião, Peladão's coach for fifteen years.", "¡Así que tú eres el famoso {0} del que tanto habló Rafa! Soy Damião, entrenador del Peladão desde hace quince años.", "Allora sei tu il famoso {0} di cui parlava tanto Rafa! Io sono Damião, allenatore del Peladão da quindici anni.", "Alors c'est toi, le fameux {0} dont Rafa parle tant ! Moi, c'est Damião, l'entraîneur du Peladão depuis quinze ans."],
    "Então você é a tal de {0} que o Rafa tanto falou! Eu sou o Damião, técnico do Peladão faz quinze anos.": ["So you're the famous {0} Rafa keeps talking about! I'm Damião, Peladão's coach for fifteen years.", "¡Así que tú eres la famosa {0} de la que tanto habló Rafa! Soy Damião, entrenador del Peladão desde hace quince años.", "Allora sei tu la famosa {0} di cui parlava tanto Rafa! Io sono Damião, allenatore del Peladão da quindici anni.", "Alors c'est toi, la fameuse {0} dont Rafa parle tant ! Moi, c'est Damião, l'entraîneur du Peladão depuis quinze ans."],
    "Aqui embaixo é a nossa casa. Lá em cima pode ser guerra; aqui dentro todo mundo é família.": ["Down here is our home. Up there it can be war; in here everyone is family.", "Aquí abajo es nuestra casa. Allá arriba puede ser la guerra; aquí dentro todos somos familia.", "Qui sotto è casa nostra. Lassù può essere guerra; qui dentro siamo tutti una famiglia.", "Ici en bas, c'est notre maison. Là-haut, ça peut être la guerre ; ici, tout le monde est de la famille."],
    "Chegou na hora! Bota a chuteira que hoje tem trabalho.": ["Right on time! Lace up your boots, there's work to do today.", "¡Llegaste a tiempo! Ponte los botines que hoy hay trabajo.", "Sei arrivato in tempo! Metti gli scarpini che oggi c'è da lavorare.", "Pile à l'heure ! Mets tes crampons, aujourd'hui il y a du boulot."],
    "Bom te ver! O time tá concentrado, hein.": ["Good to see you! The team is focused, huh.", "¡Qué bueno verte! El equipo está concentrado, eh.", "Che bello vederti! La squadra è concentrata, eh.", "Content de te voir ! L'équipe est concentrée, hein."],
    "Senta aí um minuto que eu vou passar o jogo.": ["Sit down for a minute, I'm going to go over the game.", "Siéntate un minuto que voy a repasar el partido.", "Siediti un attimo che ti spiego la partita.", "Assieds-toi une minute, je vais expliquer le match."],
    "Hoje é {0}: {1} contra o {2}, {3}.": ["Today it's {0}: {1} against {2}, {3}.", "Hoy es {0}: {1} contra {2}, {3}.", "Oggi è {0}: {1} contro {2}, {3}.", "Aujourd'hui, c'est {0} : {1} contre {2}, {3}."],
    "com a gente jogando em casa": ["with us playing at home", "con nosotros jugando en casa", "con noi che giochiamo in casa", "et on joue à domicile"],
    "com eles jogando em casa": ["with them playing at home", "con ellos jugando en casa", "con loro che giocano in casa", "et ce sont eux qui reçoivent"],
    "O técnico deles é {0}. {1}": ["Their coach is {0}. {1}", "Su entrenador es {0}. {1}", "Il loro allenatore è {0}. {1}", "Leur entraîneur, c'est {0}. {1}"],
    "De você eu quero: {0}. Se fizer isso, a sua nota sobe.": ["From you I want: {0}. If you do that, your rating goes up.", "De ti quiero: {0}. Si lo haces, tu nota sube.", "Da te voglio: {0}. Se lo fai, il tuo voto sale.", "De toi, je veux : {0}. Si tu le fais, ta note monte."],
    "Pode deixar, professor!": ["You got it, coach!", "¡Déjelo en mis manos, profe!", "Ci penso io, mister!", "Comptez sur moi, coach !"],
    "Tô um pouco nervoso...": ["I'm a bit nervous...", "Estoy un poco nervioso...", "Sono un po' nervoso...", "Je suis un peu nerveux..."],
    "Tô um pouco nervosa...": ["I'm a bit nervous...", "Estoy un poco nerviosa...", "Sono un po' nervosa...", "Je suis un peu nerveuse..."],
    "Eu sei jogar, não preciso de lição.": ["I know how to play, I don't need a lecture.", "Sé jugar, no necesito lecciones.", "So giocare, non mi servono lezioni.", "Je sais jouer, je n'ai pas besoin de leçon."],
    "Lição todo mundo precisa. Lá em cima a gente vê quem sabe.": ["Everyone needs a lesson. Up there we'll see who knows.", "Lecciones todos necesitamos. Allá arriba vemos quién sabe.", "Di lezioni ne hanno bisogno tutti. Lassù vediamo chi sa giocare.", "Tout le monde a besoin de leçons. Là-haut, on verra qui sait jouer."],
    "Nervoso é bom: mostra que você se importa. Respira e joga o simples.": ["Nerves are good: they show you care. Breathe and keep it simple.", "Los nervios son buenos: muestran que te importa. Respira y juega simple.", "Un po' di tensione fa bene: vuol dire che ci tieni. Respira e gioca semplice.", "Le stress, c'est bon : ça montre que ça compte pour toi. Respire et joue simple."],
    "Relaxa, a gente tá junto!": ["Relax, we're in this together!", "¡Tranqui, estamos juntos!", "Rilassati, siamo insieme!", "Détends-toi, on est ensemble !"],
    "É assim que se fala!": ["That's the spirit!", "¡Así se habla!", "Così si parla!", "C'est comme ça qu'on parle !"],
    "Hoje é tudo ou nada! Bora, Peladão!": ["Today it's all or nothing! Let's go, Peladão!", "¡Hoy es todo o nada! ¡Vamos, Peladão!", "Oggi è tutto o niente! Forza, Peladão!", "Aujourd'hui, c'est tout ou rien ! Allez, Peladão !"],
    "Bora, Peladão!": ["Let's go, Peladão!", "¡Vamos, Peladão!", "Forza, Peladão!", "Allez, Peladão !"],
    "Hoje a gente sai daqui com os três pontos!": ["Today we leave here with the three points!", "¡Hoy salimos de aquí con los tres puntos!", "Oggi usciamo di qui con i tre punti!", "Aujourd'hui, on repart d'ici avec les trois points !"],
    "Vamo que vamo!": ["Here we go!", "¡Vamos que vamos!", "Andiamo!", "C'est parti !"],
    "Você": ["You", "Tú", "Tu", "Toi"],
    "Campeonato de Várzea": ["Amateur Tournament", "Campeonato de Barrio", "Torneo dei Dilettanti", "Championnat Amateur"],
    "{0}: {1} x {2}": ["{0}: {1} x {2}", "{0}: {1} x {2}", "{0}: {1} x {2}", "{0} : {1} x {2}"],
    "O jogo acabou sem você... a gente segurou como deu.": ["The game ended without you... we held on as best we could.", "El partido terminó sin ti... aguantamos como pudimos.", "La partita è finita senza di te... abbiamo tenuto come potevamo.", "Le match s'est fini sans toi... on a tenu comme on a pu."],
    "Nos pênaltis! {0} a {1} no tempo normal e a gente passou. Que sufoco!": ["On penalties! {0} to {1} in regular time and we went through. What a nail-biter!", "¡En los penales! {0} a {1} en el tiempo normal y pasamos. ¡Qué sufrimiento!", "Ai rigori! {0} a {1} nei tempi regolamentari e siamo passati. Che sofferenza!", "Aux tirs au but ! {0} à {1} dans le temps réglementaire et on passe. Quel suspense !"],
    "{0} a {1} e a gente caiu nos pênaltis... dói, mas fizemos o que deu.": ["{0} to {1} and we went out on penalties... it hurts, but we gave it all.", "{0} a {1} y caímos en los penales... duele, pero hicimos lo que pudimos.", "{0} a {1} e siamo usciti ai rigori... fa male, ma abbiamo dato tutto.", "{0} à {1} et on est tombés aux tirs au but... ça fait mal, mais on a tout donné."],
    "{0} a {1} no {2}! É disso que eu tô falando!": ["{0} to {1} over {2}! That's what I'm talking about!", "¡{0} a {1} a {2}! ¡De eso hablo!", "{0} a {1} contro il {2}! È di questo che parlo!", "{0} à {1} contre {2} ! C'est de ça que je parle !"],
    "Vitória! {0} a {1}. O Peladão tá vivo!": ["Victory! {0} to {1}. Peladão is alive!", "¡Victoria! {0} a {1}. ¡El Peladão está vivo!", "Vittoria! {0} a {1}. Il Peladão è vivo!", "Victoire ! {0} à {1}. Le Peladão est vivant !"],
    "{0} a {1}. Empate é melhor que derrota, mas dava pra mais.": ["{0} to {1}. A draw beats a loss, but we could have done more.", "{0} a {1}. El empate es mejor que la derrota, pero daba para más.", "{0} a {1}. Il pareggio è meglio della sconfitta, ma si poteva fare di più.", "{0} à {1}. Un nul vaut mieux qu'une défaite, mais on pouvait faire mieux."],
    "{0} a {1} pra eles... cabeça erguida, que ainda tem jogo.": ["{0} to {1} for them... heads up, there are more games.", "{0} a {1} para ellos... cabeza en alto, que todavía hay partidos.", "{0} a {1} per loro... a testa alta, ci sono ancora partite.", "{0} à {1} pour eux... la tête haute, il reste des matchs."],
    "Você fez {0} de {1} coisas que eu pedi: +{2} na nota. Nota final: {3}.": ["You did {0} of the {1} things I asked: +{2} to your rating. Final rating: {3}.", "Hiciste {0} de las {1} cosas que te pedí: +{2} en la nota. Nota final: {3}.", "Hai fatto {0} delle {1} cose che ti ho chiesto: +{2} al voto. Voto finale: {3}.", "Tu as fait {0} des {1} choses que j'ai demandées : +{2} sur la note. Note finale : {3}."],
    "Do que eu pedi, hoje não saiu nada. Nota final: {0}. No próximo jogo, presta atenção nisso.": ["None of what I asked happened today. Final rating: {0}. Next game, pay attention to that.", "De lo que te pedí, hoy no salió nada. Nota final: {0}. En el próximo partido, presta atención a eso.", "Di quello che ti ho chiesto, oggi non è uscito niente. Voto finale: {0}. Alla prossima partita, fai attenzione.", "De ce que j'ai demandé, rien n'est sorti aujourd'hui. Note finale : {0}. Au prochain match, fais attention à ça."],
    "Terminamos em {0}º lugar: estamos na SEMIFINAL!": ["We finished in {0}th place: we're in the SEMIFINALS!", "Terminamos en el {0}º lugar: ¡estamos en SEMIFINALES!", "Abbiamo chiuso al {0}º posto: siamo in SEMIFINALE!", "On finit à la {0}e place : on est en DEMI-FINALE !"],
    "Terminamos em {0}º lugar... ficamos fora da semifinal.": ["We finished in {0}th place... we missed the semifinals.", "Terminamos en el {0}º lugar... quedamos fuera de las semifinales.", "Abbiamo chiuso al {0}º posto... siamo fuori dalla semifinale.", "On finit à la {0}e place... on rate la demi-finale."],
    "Estamos em {0}º lugar ({1} pts). Próximo jogo: {2}.": ["We're in {0}th place ({1} pts). Next game: {2}.", "Estamos en el {0}º lugar ({1} pts). Próximo partido: {2}.", "Siamo al {0}º posto ({1} pt). Prossima partita: {2}.", "On est à la {0}e place ({1} pts). Prochain match : {2}."],
    "ESTAMOS NA FINAL! Amanhã é o jogo da nossa vida!": ["WE'RE IN THE FINAL! Tomorrow is the game of our lives!", "¡ESTAMOS EN LA FINAL! ¡Mañana es el partido de nuestra vida!", "SIAMO IN FINALE! Domani è la partita della nostra vita!", "ON EST EN FINALE ! Demain, c'est le match de notre vie !"],
    "Caímos na semifinal... mas que campanha, hein? Obrigado por jogar com a gente.": ["We went out in the semifinal... but what a run, huh? Thanks for playing with us.", "Caímos en la semifinal... pero qué campaña, ¿eh? Gracias por jugar con nosotros.", "Siamo usciti in semifinale... ma che cammino, eh? Grazie per aver giocato con noi.", "On est tombés en demi-finale... mais quel parcours, hein ? Merci d'avoir joué avec nous."],
    "CAMPEÕES! O Peladão é campeão da várzea! A sua parte do prêmio: {0} fakes!": ["CHAMPIONS! Peladão are the amateur champions! Your share of the prize: {0} fakes!", "¡CAMPEONES! ¡El Peladão es campeón del barrio! Tu parte del premio: ¡{0} fakes!", "CAMPIONI! Il Peladão è campione dei dilettanti! La tua parte del premio: {0} fakes!", "CHAMPIONS ! Le Peladão est champion amateur ! Ta part du prix : {0} fakes !"],
    "Vice-campeão... chegamos na final, e isso ninguém tira da gente.": ["Runners-up... we made the final, and nobody can take that from us.", "Subcampeones... llegamos a la final, y eso nadie nos lo quita.", "Secondi... siamo arrivati in finale, e questo nessuno ce lo toglie.", "Vice-champions... on est arrivés en finale, et ça, personne ne nous l'enlève."],
    "É nóis!": ["That's us!", "¡Somos nosotros!", "Siamo noi!", "C'est nous !"],
    "Que jogo! Bora comemorar!": ["What a game! Let's celebrate!", "¡Qué partido! ¡Vamos a festejar!", "Che partita! Andiamo a festeggiare!", "Quel match ! On va fêter ça !"],
    "Faltou pouco. No próximo a gente pega!": ["So close. We'll get them next time!", "Faltó poco. ¡En el próximo lo logramos!", "Ci è mancato poco. Alla prossima ce la facciamo!", "Il manquait peu. La prochaine fois, on les aura !"],
    "Bola pra frente, Peladão!": ["Chin up, Peladão!", "¡Pelota para adelante, Peladão!", "Testa alla prossima, Peladão!", "On avance, Peladão !"],
    "Joga bem: {0} (média {1}).": ["Strong in: {0} (average {1}).", "Juega bien: {0} (promedio {1}).", "Gioca bene: {0} (media {1}).", "Point fort : {0} (moyenne {1})."],
    "Joga bem: nenhum setor se destaca, o time é parelho.": ["Strong in: no area stands out, the team is even.", "Juega bien: ningún sector se destaca, el equipo es parejo.", "Gioca bene: nessun reparto spicca, la squadra è equilibrata.", "Point fort : aucun secteur ne ressort, l'équipe est homogène."],
    "Ponto fraco: {0} (média {1}).": ["Weak spot: {0} (average {1}).", "Punto débil: {0} (promedio {1}).", "Punto debole: {0} (media {1}).", "Point faible : {0} (moyenne {1})."],
    "média {0}": ["average {0}", "promedio {0}", "media {0}", "moyenne {0}"],
    "{0}º lugar, {1} pts": ["{0}th place, {1} pts", "{0}º lugar, {1} pts", "{0}º posto, {1} pt", "{0}e place, {1} pts"],
    "Técnico: {0}": ["Coach: {0}", "Entrenador: {0}", "Allenatore: {0}", "Entraîneur : {0}"],
    "Esquema: {0}": ["Formation: {0}", "Esquema: {0}", "Modulo: {0}", "Schéma : {0}"],
    "Confronto": ["Matchup", "Enfrentamiento", "Sfida", "Affiche"],
    "Os times": ["The teams", "Los equipos", "Le squadre", "Les équipes"],
    "Escalações": ["Lineups", "Alineaciones", "Formazioni", "Compositions"],
    "O que o técnico quer": ["What the coach wants", "Lo que quiere el entrenador", "Cosa vuole l'allenatore", "Ce que veut l'entraîneur"],
    "CAMPEONATO DE VÁRZEA": ["AMATEUR TOURNAMENT", "CAMPEONATO DE BARRIO", "TORNEO DEI DILETTANTI", "CHAMPIONNAT AMATEUR"],
    "CASA": ["HOME", "LOCAL", "CASA", "DOMICILE"],
    "FORA": ["AWAY", "VISITANTE", "TRASFERTA", "EXTÉRIEUR"],
    "\"Contra o {0}, eu quero isto de você:\"": ["\"Against {0}, this is what I want from you:\"", "\"Contra {0}, esto es lo que quiero de ti:\"", "\"Contro il {0}, voglio questo da te:\"", "« Contre {0}, voilà ce que j'attends de toi : »"],
    "Cada pedido cumprido soma na sua nota final da partida.": ["Each request you fulfill adds to your final match rating.", "Cada pedido cumplido suma en tu nota final del partido.", "Ogni richiesta soddisfatta si somma al tuo voto finale.", "Chaque demande réussie s'ajoute à ta note finale du match."],
    "A partida": ["The match", "El partido", "La partita", "Le match"],
    "{0} minutos de jogo (2 horas no relógio da cidade).": ["{0} minutes of play (2 hours on the town clock).", "{0} minutos de juego (2 horas en el reloj del pueblo).", "{0} minuti di gioco (2 ore sull'orologio del paese).", "{0} minutes de jeu (2 heures à l'horloge de la ville)."],
    "Sua posição: {0} · sua média: {1}": ["Your position: {0} · your average: {1}", "Tu posición: {0} · tu promedio: {1}", "Il tuo ruolo: {0} · la tua media: {1}", "Ton poste : {0} · ta moyenne : {1}"],
    "Mata-mata: se empatar, a vaga sai nos pênaltis.": ["Knockout: if it's a draw, it goes to penalties.", "Eliminatoria: si empatan, se define por penales.", "Eliminazione diretta: in caso di pareggio, si va ai rigori.", "Élimination directe : en cas d'égalité, tirs au but."],
    "Vitória vale 3 pontos e empate, 1.": ["A win is worth 3 points and a draw, 1.", "La victoria vale 3 puntos y el empate, 1.", "La vittoria vale 3 punti e il pareggio 1.", "Une victoire vaut 3 points et un nul, 1."],
    "COMEÇAR PARTIDA": ["START MATCH", "EMPEZAR PARTIDO", "INIZIA PARTITA", "COMMENCER LE MATCH"],
    "CAMPEÃO DA VÁRZEA": ["AMATEUR CHAMPION", "CAMPEÓN DEL BARRIO", "CAMPIONE DEI DILETTANTI", "CHAMPION AMATEUR"],
    "Sua parte do prêmio: {0} fakes.": ["Your share of the prize: {0} fakes.", "Tu parte del premio: {0} fakes.", "La tua parte del premio: {0} fakes.", "Ta part du prix : {0} fakes."],
    "Melhor jogador": ["Best player", "Mejor jugador", "Miglior giocatore", "Meilleur joueur"],
    "nota média {0}": ["average rating {0}", "nota media {0}", "voto medio {0}", "note moyenne {0}"],
    "Artilheiro": ["Top scorer", "Goleador", "Capocannoniere", "Meilleur buteur"],
    "{0} gols": ["{0} goals", "{0} goles", "{0} gol", "{0} buts"],
    "Líder de assistências": ["Assists leader", "Líder de asistencias", "Re degli assist", "Meilleur passeur"],
    "{0} assistências": ["{0} assists", "{0} asistencias", "{0} assist", "{0} passes décisives"],
    "Fechar": ["Close", "Cerrar", "Chiudi", "Fermer"],
    "Fazer pelo menos 1 gol": ["Score at least 1 goal", "Hacer al menos 1 gol", "Segnare almeno 1 gol", "Marquer au moins 1 but"],
    "Fazer 2 gols": ["Score 2 goals", "Hacer 2 goles", "Segnare 2 gol", "Marquer 2 buts"],
    "Acertar 3 chutes no gol": ["Get 3 shots on target", "Acertar 3 tiros al arco", "Fare 3 tiri nello specchio", "Cadrer 3 tirs"],
    "Dar 1 assistência": ["Make 1 assist", "Dar 1 asistencia", "Fare 1 assist", "Faire 1 passe décisive"],
    "Acertar 12 passes": ["Complete 12 passes", "Acertar 12 pases", "Completare 12 passaggi", "Réussir 12 passes"],
    "Errar no máximo 3 passes (acertando pelo menos 6)": ["Miss at most 3 passes (completing at least 6)", "Errar como máximo 3 pases (acertando al menos 6)", "Sbagliare al massimo 3 passaggi (completandone almeno 6)", "Rater au plus 3 passes (en réussissant au moins 6)"],
    "Ganhar 3 dribles": ["Win 3 dribbles", "Ganar 3 regates", "Vincere 3 dribbling", "Réussir 3 dribbles"],
    "Fazer 3 desarmes": ["Make 3 tackles", "Hacer 3 quites", "Fare 3 contrasti vinti", "Réussir 3 tacles"],
    "Perder no máximo 4 bolas": ["Lose the ball at most 4 times", "Perder como máximo 4 balones", "Perdere al massimo 4 palloni", "Perdre au plus 4 ballons"],
    "Não deixar o time tomar gol": ["Keep a clean sheet", "Que el equipo no reciba goles", "Non far subire gol alla squadra", "Ne pas encaisser de but"],
    "Não deixar o time tomar mais de 1 gol": ["Don't let the team concede more than 1 goal", "Que el equipo no reciba más de 1 gol", "Non far subire più di 1 gol alla squadra", "Ne pas encaisser plus d'1 but"],
    "Sair com a vitória": ["Leave with the win", "Salir con la victoria", "Portare a casa la vittoria", "Repartir avec la victoire"],
    "Jogar limpo: nenhum cartão": ["Play clean: no cards", "Jugar limpio: ninguna tarjeta", "Giocare pulito: nessun cartellino", "Jouer propre : aucun carton"],
    "O ataque mais perigoso do campeonato: chute de fora, cabeceio e velocidade. O resto do time também é muito bom.": ["The most dangerous attack in the tournament: long shots, headers and speed. The rest of the team is very good too.", "El ataque más peligroso del campeonato: remate de afuera, cabezazo y velocidad. El resto del equipo también es muy bueno.", "L'attacco più pericoloso del torneo: tiri da fuori, colpi di testa e velocità. Anche il resto della squadra è molto forte.", "L'attaque la plus dangereuse du championnat : frappes de loin, jeu de tête et vitesse. Le reste de l'équipe est très bon aussi."],
    "A defesa é uma muralha: zagueiros fortes no desarme e o melhor goleiro da várzea. Na frente, é um time comum.": ["The defense is a wall: center-backs strong in the tackle and the best keeper around. Up front, they're an ordinary team.", "La defensa es una muralla: centrales fuertes en el quite y el mejor arquero del barrio. Adelante, es un equipo común.", "La difesa è un muro: centrali forti nei contrasti e il miglior portiere dei dilettanti. Davanti è una squadra normale.", "La défense est un mur : des centraux solides au tacle et le meilleur gardien du coin. Devant, c'est une équipe ordinaire."],
    "Marcação pesada e zagueiros que ganham quase toda dividida. Faz poucos gols: o ataque é o ponto fraco.": ["Heavy marking and defenders who win almost every challenge. They score few goals: the attack is the weak spot.", "Marca fuerte y defensores que ganan casi todas las divididas. Hace pocos goles: el ataque es el punto débil.", "Marcatura pesante e difensori che vincono quasi ogni contrasto. Segnano poco: l'attacco è il punto debole.", "Marquage serré et défenseurs qui gagnent presque tous les duels. Peu de buts : l'attaque est le point faible."],
    "O meio-campo mais técnico do campeonato: toca a bola, cansa o adversário e espera o espaço aparecer.": ["The most technical midfield in the tournament: they pass the ball around, tire the opponent and wait for space to open up.", "El mediocampo más técnico del campeonato: toca la pelota, cansa al rival y espera que aparezca el espacio.", "Il centrocampo più tecnico del torneo: fa girare palla, stanca l'avversario e aspetta che si apra lo spazio.", "Le milieu le plus technique du championnat : il fait tourner le ballon, fatigue l'adversaire et attend que l'espace s'ouvre."],
    "Três atacantes rápidos e que finalizam muito bem. Em compensação, a defesa deixa espaço e erra bastante.": ["Three fast strikers who finish very well. On the other hand, the defense leaves gaps and makes lots of mistakes.", "Tres delanteros rápidos que definen muy bien. En cambio, la defensa deja espacios y se equivoca bastante.", "Tre attaccanti veloci che finalizzano benissimo. In compenso la difesa lascia spazi e sbaglia parecchio.", "Trois attaquants rapides qui finissent très bien. En revanche, la défense laisse des espaces et se trompe souvent."],
    "Time mediano, mas com pontas muito rápidos que gostam de puxar o contra-ataque. Atrás, sofre com bola alta.": ["An average team, but with very fast wingers who love to lead the counterattack. At the back, they struggle with high balls.", "Equipo del montón, pero con extremos muy rápidos a los que les gusta salir de contra. Atrás, sufre con la pelota alta.", "Squadra media, ma con ali velocissime che amano il contropiede. Dietro soffre le palle alte.", "Une équipe moyenne, mais avec des ailiers très rapides qui adorent lancer la contre-attaque. Derrière, elle souffre sur les ballons aériens."],
    "Todo mundo corre e marca junto, com um bom goleiro. Só falta alguém para fazer os gols: o centroavante é fraco.": ["Everyone runs and defends together, with a good keeper. They just lack someone to score: the striker is weak.", "Todos corren y marcan juntos, con un buen arquero. Solo falta alguien que haga los goles: el centrodelantero es flojo.", "Tutti corrono e difendono insieme, con un buon portiere. Manca solo chi faccia gol: il centravanti è debole.", "Tout le monde court et défend ensemble, avec un bon gardien. Il manque juste quelqu'un pour marquer : l'avant-centre est faible."],
    "Um time equilibrado, sem estrela: ninguém é muito melhor que ninguém. Depende de jogar junto.": ["A balanced team with no star: nobody is much better than anybody else. It depends on playing together.", "Un equipo equilibrado, sin estrellas: nadie es mucho mejor que nadie. Depende de jugar juntos.", "Una squadra equilibrata, senza stelle: nessuno è molto meglio degli altri. Dipende dal giocare insieme.", "Une équipe équilibrée, sans star : personne n'est bien meilleur que les autres. Tout dépend du jeu collectif."],
    "Gosta de cruzar e chutar de qualquer lugar. A defesa é a pior do campeonato e o goleiro é fraco.": ["They love to cross and shoot from anywhere. The defense is the worst in the tournament and the keeper is weak.", "Le gusta centrar y patear desde cualquier lugar. La defensa es la peor del campeonato y el arquero es flojo.", "Ama crossare e tirare da ogni posizione. La difesa è la peggiore del torneo e il portiere è debole.", "Elle aime centrer et frapper de n'importe où. La défense est la pire du championnat et le gardien est faible."],
    "Fica todo mundo atrás e torce para o goleiro salvar. Quase não chega ao ataque.": ["Everyone stays back and hopes the keeper saves them. They hardly ever reach the attack.", "Se quedan todos atrás y rezan para que el arquero los salve. Casi no llegan al ataque.", "Stanno tutti dietro e sperano che il portiere li salvi. Non arrivano quasi mai in attacco.", "Tout le monde reste derrière et prie pour que le gardien sauve. Ils n'attaquent presque jamais."],
    "Goleiro": ["Goalkeeper", "Arquero", "Portiere", "Gardien"],
    "Defesa": ["Defense", "Defensa", "Difesa", "Défense"],
    "Meio": ["Midfield", "Medio", "Centrocampo", "Milieu"],
    "Ataque": ["Attack", "Ataque", "Attacco", "Attaque"],
    "segunda": ["Monday", "lunes", "lunedì", "lundi"],
    "terça": ["Tuesday", "martes", "martedì", "mardi"],
    "quarta": ["Wednesday", "miércoles", "mercoledì", "mercredi"],
    "quinta": ["Thursday", "jueves", "giovedì", "jeudi"],
    "sexta": ["Friday", "viernes", "venerdì", "vendredi"],
    "sábado": ["Saturday", "sábado", "sabato", "samedi"],
    "domingo": ["Sunday", "domingo", "domenica", "dimanche"],
  };
  Object.assign(TRAD, {   // a conversa da peneira (depois do campeonato)
    "{0}, vamos ser sinceros: esse título tem o seu nome.": ["{0}, let's be honest: this title has your name on it.", "{0}, seamos sinceros: este título lleva tu nombre.", "{0}, siamo sinceri: questo titolo porta il tuo nome.", "{0}, soyons honnêtes : ce titre porte ton nom."],
    "Sem você, o Peladão não passava nem da primeira fase. A gente só ganhou por sua causa.": ["Without you, Peladão wouldn't even have made it past the first stage. We only won because of you.", "Sin ti, el Peladão no pasaba ni de la primera fase. Solo ganamos gracias a ti.", "Senza di te, il Peladão non avrebbe superato nemmeno la prima fase. Abbiamo vinto solo grazie a te.", "Sans toi, le Peladão ne passait même pas la première phase. On n'a gagné que grâce à toi."],
    "Campeões! E você foi parte importante disso: jogou pro time o campeonato inteiro.": ["Champions! And you were a big part of it: you played for the team the whole championship.", "¡Campeones! Y fuiste parte importante: jugaste para el equipo todo el campeonato.", "Campioni! E tu ne sei stato una parte importante: hai giocato per la squadra tutto il campionato.", "Champions ! Et tu y es pour beaucoup : tu as joué pour l'équipe tout le championnat."],
    "A gente foi campeão... mas vou ser sincero: não foi o seu melhor campeonato.": ["We won it... but I'll be honest: it wasn't your best championship.", "Fuimos campeones... pero voy a ser sincero: no fue tu mejor campeonato.", "Siamo stati campioni... ma sarò sincero: non è stato il tuo miglior campionato.", "On a été champions... mais je vais être honnête : ce n'était pas ton meilleur championnat."],
    "Mesmo assim, eu já te vi jogar no sintético e na quadra. Eu sei do que você é capaz.": ["Even so, I've seen you play on the turf and on the court. I know what you're capable of.", "Aun así, ya te vi jugar en la cancha sintética y en la pista. Sé de lo que eres capaz.", "Comunque, ti ho visto giocare sul sintetico e in palestra. So di cosa sei capace.", "Malgré tout, je t'ai vu jouer sur le synthétique et en salle. Je sais de quoi tu es capable."],
    "A gente bateu na trave na final... mas você jogou demais. Todo mundo reparou.": ["We came so close in the final... but you played brilliantly. Everybody noticed.", "Nos quedamos a nada en la final... pero jugaste muchísimo. Todo el mundo se dio cuenta.", "Ci siamo andati vicinissimi in finale... ma tu hai giocato benissimo. Se ne sono accorti tutti.", "On est passés tout près en finale... mais tu as joué comme un chef. Tout le monde l'a remarqué."],
    "A gente não levou o título, mas você fez um baita campeonato. Todo mundo reparou.": ["We didn't win the title, but you had a great championship. Everybody noticed.", "No nos llevamos el título, pero hiciste un campeonato tremendo. Todo el mundo se dio cuenta.", "Non abbiamo vinto il titolo, ma tu hai fatto un gran campionato. Se ne sono accorti tutti.", "On n'a pas gagné le titre, mais tu as fait un super championnat. Tout le monde l'a remarqué."],
    "Olha... eu sei que o campeonato não foi o seu melhor.": ["Look... I know this championship wasn't your best.", "Mira... sé que el campeonato no fue tu mejor momento.", "Senti... lo so che il campionato non è stato il tuo migliore.", "Écoute... je sais que ce championnat n'était pas ton meilleur."],
    "Teve jogo que você nem apareceu, teve jogo que não saiu nada. Acontece.": ["There were games you didn't even show up for, games where nothing came off. It happens.", "Hubo partidos a los que ni apareciste, partidos en los que no salió nada. Pasa.", "Ci sono state partite in cui non ti sei nemmeno presentato, partite in cui non è venuto fuori niente. Succede.", "Il y a eu des matchs où tu n'es même pas venu, des matchs où rien n'a marché. Ça arrive."],
    "Teve jogo que não saiu nada. Acontece.": ["There were games where nothing came off. It happens.", "Hubo partidos en los que no salió nada. Pasa.", "Ci sono state partite in cui non è venuto fuori niente. Succede.", "Il y a eu des matchs où rien n'a marché. Ça arrive."],
    "Mas eu já te vi jogar no sintético e na quadra. Eu sei do que você é capaz.": ["But I've seen you play on the turf and on the court. I know what you're capable of.", "Pero ya te vi jugar en la cancha sintética y en la pista. Sé de lo que eres capaz.", "Ma ti ho visto giocare sul sintetico e in palestra. So di cosa sei capace.", "Mais je t'ai vu jouer sur le synthétique et en salle. Je sais de quoi tu es capable."],
    "E ainda foi eleito o melhor jogador do campeonato, com nota média {0}!": ["And you were even voted the best player of the championship, with an average rating of {0}!", "¡Y encima te eligieron el mejor jugador del campeonato, con nota media de {0}!", "E sei stato pure eletto il miglior giocatore del campionato, con una media di {0}!", "Et en plus tu as été élu meilleur joueur du championnat, avec une note moyenne de {0} !"],
    "E ainda foi eleita a melhor jogadora do campeonato, com nota média {0}!": ["And you were even voted the best player of the championship, with an average rating of {0}!", "¡Y encima te eligieron la mejor jugadora del campeonato, con nota media de {0}!", "E sei stata pure eletta la miglior giocatrice del campionato, con una media di {0}!", "Et en plus tu as été élue meilleure joueuse du championnat, avec une note moyenne de {0} !"],
    "Artilheiro E líder de assistências: {0} gols e {1} passes pra gol. Não é pra qualquer um!": ["Top scorer AND assists leader: {0} goals and {1} assists. That's not for just anyone!", "Máximo goleador Y líder de asistencias: {0} goles y {1} pases de gol. ¡No es para cualquiera!", "Capocannoniere E re degli assist: {0} gol e {1} assist. Non è roba da tutti!", "Meilleur buteur ET meilleur passeur : {0} buts et {1} passes décisives. Pas donné à tout le monde !"],
    "Artilheira E líder de assistências: {0} gols e {1} passes pra gol. Não é pra qualquer uma!": ["Top scorer AND assists leader: {0} goals and {1} assists. That's not for just anyone!", "Máxima goleadora Y líder de asistencias: {0} goles y {1} pases de gol. ¡No es para cualquiera!", "Capocannoniera E regina degli assist: {0} gol e {1} assist. Non è roba da tutte!", "Meilleure buteuse ET meilleure passeuse : {0} buts et {1} passes décisives. Pas donné à tout le monde !"],
    "Artilheiro do campeonato, com {0} gols!": ["Top scorer of the championship, with {0} goals!", "¡Máximo goleador del campeonato, con {0} goles!", "Capocannoniere del campionato, con {0} gol!", "Meilleur buteur du championnat, avec {0} buts !"],
    "Artilheira do campeonato, com {0} gols!": ["Top scorer of the championship, with {0} goals!", "¡Máxima goleadora del campeonato, con {0} goles!", "Capocannoniera del campionato, con {0} gol!", "Meilleure buteuse du championnat, avec {0} buts !"],
    "E o líder de assistências, com {0} passes pra gol. Joga pro time!": ["And the assists leader, with {0} assists. You play for the team!", "Y el líder de asistencias, con {0} pases de gol. ¡Juegas para el equipo!", "E il re degli assist, con {0} assist. Giochi per la squadra!", "Et le meilleur passeur, avec {0} passes décisives. Tu joues pour l'équipe !"],
    "E a líder de assistências, com {0} passes pra gol. Joga pro time!": ["And the assists leader, with {0} assists. You play for the team!", "Y la líder de asistencias, con {0} pases de gol. ¡Juegas para el equipo!", "E la regina degli assist, con {0} assist. Giochi per la squadra!", "Et la meilleure passeuse, avec {0} passes décisives. Tu joues pour l'équipe !"],
    "Escuta: logo, logo vai ter uma peneira com olheiros de times da Série B do Brasileirão, numa outra cidade.": ["Listen: pretty soon there's going to be a tryout with scouts from Brazilian Série B clubs, in another city.", "Escucha: muy pronto va a haber una prueba con ojeadores de equipos de la Série B del Brasileirão, en otra ciudad.", "Senti: tra poco ci sarà un provino con osservatori di squadre della Série B brasiliana, in un'altra città.", "Écoute : bientôt, il y aura une détection avec des recruteurs de clubs de Série B du Brasileirão, dans une autre ville."],
    "Pode demorar um pouquinho pra sair, mas quando sair a vaga é sua: eu consigo a inscrição e um ônibus pra gente ir até lá.": ["It might take a little while to happen, but when it does the spot is yours: I'll get you signed up and a bus to take us there.", "Puede tardar un poquito, pero cuando salga el lugar es tuyo: yo consigo la inscripción y un autobús para ir hasta allá.", "Potrebbe volerci un po', ma quando arriva il posto è tuo: ti faccio iscrivere e trovo un pullman per andarci.", "Ça peut prendre un peu de temps, mais quand ça arrive, la place est à toi : je m'occupe de l'inscription et d'un bus pour y aller."],
    "Rafa, nem sei como te agradecer. Pode deixar: eu vou dar o meu melhor!": ["Rafa, I don't even know how to thank you. Count on me: I'll give it my best!", "Rafa, no sé ni cómo agradecerte. Cuenta conmigo: ¡voy a dar lo mejor de mí!", "Rafa, non so nemmeno come ringraziarti. Contaci: darò il massimo!", "Rafa, je ne sais même pas comment te remercier. Compte sur moi : je vais donner le meilleur de moi-même !"],
    "Eu sei que vai. Agora vai descansar, craque.": ["I know you will. Now go get some rest, superstar.", "Sé que sí. Ahora ve a descansar, crack.", "Lo so. Adesso vai a riposarti, campione.", "Je sais. Maintenant, va te reposer, champion."],
    "É isso! Eu te aviso quando for. Vai com tudo!": ["That's it! I'll let you know when it's on. Go all in!", "¡Eso es! Te aviso cuando sea. ¡Dale con todo!", "Così si fa! Ti avviso quando sarà. Dai tutto!", "C'est ça ! Je te préviens quand ce sera. Fonce !"],
    "E aí, {0}! Tava te esperando.": ["Hey, {0}! I was waiting for you.", "¡Hola, {0}! Te estaba esperando.", "Ehi, {0}! Ti stavo aspettando.", "Salut, {0} ! Je t'attendais."],
  });
  if (typeof I18N !== 'undefined') for (const k of Object.keys(TRAD)) if (!I18N[k]) I18N[k] = TRAD[k];
  // o que muda quando a personagem é feminina (português igual, outro idioma muda)
  const FEM = {
    "Você não apareceu no jogo contra o {0}...": [null, null, "Non ti sei presentata alla partita contro {0}...", "Tu n'es pas venue au match contre {0}..."],
    "Chegou na hora! Bota a chuteira que hoje tem trabalho.": [null, null, "Sei arrivata in tempo! Metti gli scarpini che oggi c'è da lavorare.", null],
    "Você entrou para o {0}!": [null, null, "Sei entrata nel {0}!", null],
  };
  Object.assign(FEM, {
    "Teve jogo que você nem apareceu, teve jogo que não saiu nada. Acontece.": [null, null, "Ci sono state partite in cui non ti sei nemmeno presentata, partite in cui non è venuto fuori niente. Succede.", "Il y a eu des matchs où tu n'es même pas venue, des matchs où rien n'a marché. Ça arrive."],
    "Campeões! E você foi parte importante disso: jogou pro time o campeonato inteiro.": [null, null, "Campioni! E tu ne sei stata una parte importante: hai giocato per la squadra tutto il campionato.", null],
    "Mesmo assim, eu já te vi jogar no sintético e na quadra. Eu sei do que você é capaz.": [null, null, null, "Malgré tout, je t'ai vue jouer sur le synthétique et en salle. Je sais de quoi tu es capable."],
    "Mas eu já te vi jogar no sintético e na quadra. Eu sei do que você é capaz.": [null, null, null, "Mais je t'ai vue jouer sur le synthétique et en salle. Je sais de quoi tu es capable."],
    "Eu sei que vai. Agora vai descansar, craque.": [null, null, null, "Je sais. Maintenant, va te reposer, championne."],
  });
  if (typeof FEM_TRAD !== 'undefined') for (const k of Object.keys(FEM)) if (!FEM_TRAD[k]) FEM_TRAD[k] = FEM[k];
  if (typeof FEM_PT !== 'undefined') Object.assign(FEM_PT, { 'Tô um pouco nervoso...': 'Tô um pouco nervosa...', 'Time de várzea? Eu sou bom demais pra isso.': 'Time de várzea? Eu sou boa demais pra isso.',
    "E ainda foi eleito o melhor jogador do campeonato, com nota média {0}!": "E ainda foi eleita a melhor jogadora do campeonato, com nota média {0}!", "Artilheiro E líder de assistências: {0} gols e {1} passes pra gol. Não é pra qualquer um!": "Artilheira E líder de assistências: {0} gols e {1} passes pra gol. Não é pra qualquer uma!", "Artilheiro do campeonato, com {0} gols!": "Artilheira do campeonato, com {0} gols!", "E o líder de assistências, com {0} passes pra gol. Joga pro time!": "E a líder de assistências, com {0} passes pra gol. Joga pro time!",
    'Então você é o tal de {0} que o Rafa tanto falou! Eu sou o Damião, técnico do Peladão faz quinze anos.': 'Então você é a tal de {0} que o Rafa tanto falou! Eu sou o Damião, técnico do Peladão faz quinze anos.' });

  window.FutebolJS.registrarFase({ id: 'varzea', nome: 'Campeonato de Várzea', nucleoMinimo: '7.0', iniciar: async () => {}, criar,
    dados: { TIMES_VZ, NOSSO_I, classificacao, premios, urlArte, estrelas } });   // o app Carreira do computador (fase2.js) usa a tabela e os emblemas
})();
