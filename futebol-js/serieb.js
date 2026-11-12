/* =====================================================================================================================
   serieb.js — A PENEIRA E A CARREIRA PROFISSIONAL NA SÉRIE B (módulo da cidade, como a varzea.js).
   - Registrado com FutebolJS.registrarFase({ id: 'serieb' }) só para o jogo saber baixar o arquivo; NÃO roda como fase.
     A cidade (cidade.js) baixa em segundo plano e chama criar(api) (api = apiSerieB() da cidade). O quarto (fase2.js) também
     baixa este arquivo para a cena da CARTA (carta.mostrar) e para a aba "Série B" do app Carreira (dados).
   - O COMEÇO: depois do campeonato de várzea, o Rafa conta da peneira (varzea.js). A cena do PRESENTE (presente) volta para o
     aquecimento do começo do jogo: dois anos depois, 18 anos, de uniforme todo branco no campo de várzea padrão (com a Lúcia
     torcendo, se estiverem namorando). A PENEIRA é um 7 x 7 sem nome nem emblema: "Time 1" (branco, o jogador) x "Time 2" (cinza).
   - A NOTA DA PENEIRA (desempenhoPeneira): nota do motor + gols + assistências + resultado. Ela decide a FAIXA das 3 propostas
     (bom / médio / ruim). Tranquilo (espectro 'tranquilo' >= 25) facilita os bons; Problemático (<= -25) dificulta os bons, chama
     os médios e paga EXTRA_PROBLEMATICO a mais por jogo. SALARIOS: por jogo + por gol + por assistência (+ bônus de vitória e luvas).
   - OS 20 TIMES (TIMES_B): paródias dos times da Série B de 2026, com nome, cores e emblema (pixel art 32x32) próprios. A força
     sai dos 3 últimos anos (2023, 2024 e 2025: posição na tabela, gols feitos e sofridos, com o peso da divisão): ataque, defesa,
     estrelas, formação e estilo. POPULARIDADE de 15 a 100 (5 faixas: quanto mais, mais torcida no estádio da Série B, que cabe
     menos gente que o oficial); ela só muda pela API popularidade (o sistema que vai mexer nela ainda vai ser feito).
   - O EMPREGO: jogos na terça, quinta e sábado em horários variados. O ônibus do clube (com as cores e o emblema) passa no ponto
     da avenida 1h30 antes do jogo; quem não está lá perde o jogo. Nos outros dias, as MISSÕES do clube, uma depois da outra:
     treinar (academia ou CT do Seu Nonato), comer comida saudável (o wrap integral do seu Valdemar) e dormir cedo (até as 22h).
   - A CONFIANÇA DO TÉCNICO (0 a 100, começa em 20): +1 por hábito cumprido e −1 por hábito não cumprido; jogo bom (nota 7+; 6,5+ para quem entrou com menos de 45 minutos) +3,
     jogo ruim ou faltar −3. Abaixo de 50: começa no banco (assiste e entra no 2º tempo; mais confiança = entra mais cedo). Ao chegar
     em 50: a primeira chance de titular (nota 8+ mantém, senão volta para o banco). De 80 para cima: sempre titular.
   - A TEMPORADA: Série B de 38 rodadas (todos contra todos, ida e volta), Copa Estadual (4 times) e Copa Regional (8 times),
     mata-mata em jogo único. Sobem 4; ninguém cai. Tudo fica em historia.cidade.pro.
   ===================================================================================================================== */
(() => {
  'use strict';
  const DUR_JOGO = 360;                       // uma partida de 90' dura 6 minutos de verdade
  const DUR_PENEIRA = 300;
  const CONF0 = 20, POP0 = 15;
  const EXTRA_PROBLEMATICO = 20;
  const SALARIOS = {                          // por jogo, por gol, por assistência, bônus por vitória e as luvas (na assinatura)
    bom: { base: 250, gol: 10, ass: 5, vit: [25, 35], luvas: [450, 650] },
    medio: { base: 150, gol: 8, ass: 3, vit: [12, 20], luvas: [200, 320] },
    ruim: { base: 100, gol: 5, ass: 2, vit: [5, 10], luvas: [60, 140] },
  };
  const ANTES_ONIBUS = 1.5, VOLTA_DEPOIS = 2.2;   // o ônibus passa 1h30 antes do jogo; volta 2h12 depois do início
  const HORAS_JOGO = [16, 19, 21, 15.5, 20, 17, 21.5, 19.5];
  const r1 = (v) => Math.round(v * 10) / 10;
  const PREMIO_IND_B = 200;                                                  // cada prêmio individual da Série B que o jogador ganha
  const clampN = (v, a, b) => Math.max(a, Math.min(b, v));
  const rndDe = (sem) => (typeof sorteador === 'function' ? sorteador(sem) : (() => { let a = sem >>> 0 || 1; return () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; }; })());
  const semDe = (txt) => (typeof sementeDe === 'function' ? sementeDe(txt) : [...String(txt)].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261));
  const escH = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const hAbs = (dia, h) => (dia - 1) * 24 + h;
  const semanaDe = (dia) => ((dia - 1) % 7 + 7) % 7;          // 0 = segunda ... 6 = domingo
  const fem = () => typeof PERSONAGEM !== 'undefined' && PERSONAGEM.genero === 'F';

  // ============================================================================================ OS 20 TIMES (paródias)
  //   hist: [divisão, posição, gols feitos, gols sofridos, jogos] de 2023, 2024 e 2025 (Série C: só a 1ª fase; 'D' = subiu da D).
  //   uni: camisa, listra, gola, calção, meia, sola, goleiro. uf/regiao: para as copas (estadual e regional).
  const TIMES_B = [
    { k: 'fortalecer', nome: 'Fortalecer EC', sigla: 'FEC', uf: 'CE', reg: 'NE', tecnico: 'Professor Aderbal', formacao: '4-3-3', tatica: 'tikitaka', estilo: 'Toque de bola, pressão alta e muita gente no ataque.',
      uni: ['#1d4fa0', '#c8202e', '#f4f4f0', '#1d4fa0', '#c8202e', '#f4f4f0', '#f2c230'], uni2: ['#f4f4f0', '#1d4fa0', '#c8202e', '#f4f4f0', '#f4f4f0', '#1d4fa0', '#1c1c1f'],
      hist: [['A', 10, 45, 44, 38], ['A', 4, 53, 39, 38], ['A', 18, 44, 58, 38]] },
    { k: 'aurora', nome: 'Grêmio Nova Aurora', sigla: 'GNA', uf: 'SP', reg: 'SE', tecnico: 'Seu Nicanor', formacao: '4-4-2', tatica: 'contra', estilo: 'Defesa muito bem armada e contra-ataque rápido.',
      uni: ['#f2c230', '#f2c230', '#1c1c1f', '#1c1c1f', '#f2c230', '#1c1c1f', '#2a72d6'], uni2: ['#1c1c1f', '#f2c230', '#f2c230', '#1c1c1f', '#1c1c1f', '#f2c230', '#2a72d6'],
      hist: [['B', 5, 48, 30, 38], ['B', 5, 43, 31, 38], ['B', 7, 43, 32, 38]] },
    { k: 'carvoeiro', nome: 'Carvoeiro EC', sigla: 'CEC', uf: 'SC', reg: 'S', tecnico: 'Professor Ildefonso', formacao: '4-2-3-1', tatica: 'tikitaka', estilo: 'Compacto, troca passes e não se desespera.',
      uni: ['#f2c230', '#1c1c1f', '#1c1c1f', '#1c1c1f', '#f4f4f0', '#1c1c1f', '#1f7a4d'], uni2: ['#f4f4f0', '#f2c230', '#1c1c1f', '#f4f4f0', '#f4f4f0', '#1c1c1f', '#1f7a4d'],
      hist: [['B', 3, 45, 33, 38], ['A', 18, 42, 61, 38], ['B', 5, 47, 33, 38]] },
    { k: 'vovo', nome: 'Vovô Sporting Clube', sigla: 'VSC', uf: 'CE', reg: 'NE', tecnico: 'Mestre Raimundo', formacao: '4-3-3', tatica: 'falso9', estilo: 'Paciente com a bola; o centroavante volta para armar.',
      uni: ['#1c1c1f', '#f4f4f0', '#f4f4f0', '#1c1c1f', '#1c1c1f', '#f4f4f0', '#c8352b'], uni2: ['#f4f4f0', '#1c1c1f', '#1c1c1f', '#f4f4f0', '#f4f4f0', '#1c1c1f', '#c8352b'],
      hist: [['B', 11, 40, 45, 38], ['B', 4, 59, 41, 38], ['A', 17, 34, 40, 38]] },
    { k: 'esmeraldino', nome: 'Esmeraldino EC', sigla: 'EEC', uf: 'GO', reg: 'CO', tecnico: 'Dona Valquíria', formacao: '4-4-2', tatica: 'tikitaka', estilo: 'Equilibrado: defesa firme e laterais que apoiam.',
      uni: ['#1f7a3a', '#1f7a3a', '#f4f4f0', '#f4f4f0', '#1f7a3a', '#f4f4f0', '#1c1c1f'], uni2: ['#f4f4f0', '#1f7a3a', '#1f7a3a', '#1f7a3a', '#f4f4f0', '#1f7a3a', '#1c1c1f'],
      hist: [['A', 18, 36, 53, 38], ['B', 6, 56, 32, 38], ['B', 6, 42, 37, 38]] },
    { k: 'juventa', nome: 'Juventa da Serra FC', sigla: 'JSF', uf: 'RS', reg: 'S', tecnico: 'Seu Gumercindo', formacao: '4-3-3', tatica: 'aerea', estilo: 'Forte na bola parada e no cruzamento; a defesa sofre.',
      uni: ['#1f7a3a', '#f4f4f0', '#f4f4f0', '#f4f4f0', '#f4f4f0', '#1f7a3a', '#1c1c1f'], uni2: ['#f4f4f0', '#1f7a3a', '#1f7a3a', '#f4f4f0', '#1f7a3a', '#1f7a3a', '#1c1c1f'],
      hist: [['B', 2, 42, 31, 38], ['A', 15, 48, 59, 38], ['A', 19, 35, 69, 38]] },
    { k: 'dourado', nome: 'Dourado do Pantanal EC', sigla: 'DPE', uf: 'MT', reg: 'CO', tecnico: 'Professor Lindomar', formacao: '5-3-2', tatica: 'retranca', estilo: 'Fecha a casinha atrás e aposta nos lançamentos.',
      uni: ['#127a3a', '#f2c230', '#f2c230', '#f4f4f0', '#127a3a', '#f2c230', '#1c1c1f'], uni2: ['#f2c230', '#127a3a', '#127a3a', '#127a3a', '#f2c230', '#127a3a', '#1c1c1f'],
      hist: [['A', 12, 40, 39, 38], ['A', 20, 29, 49, 38], ['B', 10, 43, 44, 38]] },
    { k: 'rubronegro', nome: 'Rubro-Negro da Ilha FC', sigla: 'RNI', uf: 'PE', reg: 'NE', tecnico: 'Seu Expedito', formacao: '4-3-3', tatica: 'contra', estilo: 'Ataque forte e rápido; a defesa às vezes fica exposta.',
      uni: ['#c8202e', '#1c1c1f', '#1c1c1f', '#1c1c1f', '#1c1c1f', '#c8202e', '#f2c230'], uni2: ['#f4f4f0', '#c8202e', '#1c1c1f', '#f4f4f0', '#f4f4f0', '#c8202e', '#f2c230'],
      hist: [['B', 7, 59, 40, 38], ['B', 3, 57, 37, 38], ['A', 20, 28, 75, 38]] },
    { k: 'dragao', nome: 'Dragão do Cerrado AC', sigla: 'DCA', uf: 'GO', reg: 'CO', tecnico: 'Mister Telmo', formacao: '4-4-2', tatica: 'contra', estilo: 'Marca forte no meio e sai rápido nas costas da defesa.',
      uni: ['#c8202e', '#c8202e', '#1c1c1f', '#1c1c1f', '#c8202e', '#1c1c1f', '#f2c230'], uni2: ['#1c1c1f', '#c8202e', '#c8202e', '#1c1c1f', '#1c1c1f', '#c8202e', '#f2c230'],
      hist: [['B', 4, 56, 45, 38], ['A', 19, 29, 58, 38], ['B', 11, 39, 38, 38]] },
    { k: 'avante', nome: 'Avante Ilha FC', sigla: 'AIF', uf: 'SC', reg: 'S', tecnico: 'Seu Leopoldo', formacao: '4-2-3-1', tatica: 'tikitaka', estilo: 'Gosta de ficar com a bola e joga pelos lados.',
      uni: ['#1d5fb0', '#f4f4f0', '#f4f4f0', '#f4f4f0', '#1d5fb0', '#f4f4f0', '#f2c230'], uni2: ['#f4f4f0', '#1d5fb0', '#1d5fb0', '#1d5fb0', '#f4f4f0', '#1d5fb0', '#f2c230'],
      hist: [['B', 13, 31, 48, 38], ['B', 10, 34, 32, 38], ['B', 9, 50, 40, 38]] },
    { k: 'regatas', nome: 'Regatas da Pajuçara', sigla: 'RDP', uf: 'AL', reg: 'NE', tecnico: 'Dona Socorro', formacao: '4-4-2', tatica: 'aerea', estilo: 'Cruzamento na área o tempo todo e zagueiros que sobem na bola parada.',
      uni: ['#c8202e', '#f4f4f0', '#f4f4f0', '#f4f4f0', '#c8202e', '#f4f4f0', '#1c1c1f'], uni2: ['#f4f4f0', '#c8202e', '#c8202e', '#c8202e', '#f4f4f0', '#c8202e', '#1c1c1f'],
      hist: [['B', 9, 45, 39, 38], ['B', 16, 38, 45, 38], ['B', 8, 45, 40, 38]] },
    { k: 'coelhao', nome: 'Coelhão das Gerais', sigla: 'CDG', uf: 'MG', reg: 'SE', tecnico: 'Professor Juvenal', formacao: '4-3-3', tatica: 'falso9', estilo: 'Ataque criativo, mas leva gol com facilidade.',
      uni: ['#1f8a3a', '#1c1c1f', '#f4f4f0', '#1c1c1f', '#1f8a3a', '#1c1c1f', '#f2c230'], uni2: ['#f4f4f0', '#1f8a3a', '#1f8a3a', '#f4f4f0', '#f4f4f0', '#1f8a3a', '#f2c230'],
      hist: [['A', 20, 42, 81, 38], ['B', 8, 50, 35, 38], ['B', 14, 41, 44, 38]] },
    { k: 'fantasma', nome: 'Fantasma dos Trilhos FC', sigla: 'FDT', uf: 'PR', reg: 'S', tecnico: 'Seu Wolney', formacao: '5-3-2', tatica: 'retranca', estilo: 'Fechadinho atrás: sofre poucos gols e faz poucos também.',
      uni: ['#1c1c1f', '#f4f4f0', '#f4f4f0', '#1c1c1f', '#1c1c1f', '#f4f4f0', '#c8352b'], uni2: ['#f4f4f0', '#1c1c1f', '#1c1c1f', '#f4f4f0', '#f4f4f0', '#1c1c1f', '#c8352b'],
      hist: [['C', 1, 19, 10, 19], ['B', 7, 34, 32, 38], ['B', 12, 40, 44, 38]] },
    { k: 'vilarubra', nome: 'Vila Rubra FC', sigla: 'VRF', uf: 'GO', reg: 'CO', tecnico: 'Mister Anselmo', formacao: '4-4-2', tatica: 'contra', estilo: 'Raçudo: marca em cima e vive de contra-ataque.',
      uni: ['#c8202e', '#c8202e', '#f4f4f0', '#f4f4f0', '#c8202e', '#f4f4f0', '#1c1c1f'], uni2: ['#f4f4f0', '#c8202e', '#c8202e', '#c8202e', '#f4f4f0', '#c8202e', '#1c1c1f'],
      hist: [['B', 8, 49, 30, 38], ['B', 9, 42, 54, 38], ['B', 13, 40, 44, 38]] },
    { k: 'timbu', nome: 'Timbu Alvirrubro SC', sigla: 'TAS', uf: 'PE', reg: 'NE', tecnico: 'Seu Severino', formacao: '4-2-3-1', tatica: 'retranca', estilo: 'Defesa organizadíssima: sofreu pouquíssimos gols na última campanha.',
      uni: ['#c8202e', '#f4f4f0', '#c8202e', '#f4f4f0', '#f4f4f0', '#c8202e', '#1c1c1f'], uni2: ['#f4f4f0', '#c8202e', '#c8202e', '#f4f4f0', '#c8202e', '#c8202e', '#1c1c1f'],
      hist: [['C', 10, 25, 24, 19], ['C', 9, 34, 25, 19], ['C', 3, 25, 7, 19]] },
    { k: 'delrei', nome: 'Atlético Del Rei', sigla: 'ADR', uf: 'MG', reg: 'SE', tecnico: 'Professor Otaviano', formacao: '4-3-3', tatica: 'aerea', estilo: 'Chega bastante na frente, mas a defesa é o ponto fraco.',
      uni: ['#1c1c1f', '#f4f4f0', '#f4f4f0', '#1c1c1f', '#1c1c1f', '#f4f4f0', '#f2c230'], uni2: ['#f4f4f0', '#1c1c1f', '#1c1c1f', '#f4f4f0', '#f4f4f0', '#1c1c1f', '#f2c230'],
      hist: [['D', 4, 0, 0, 0], ['C', 2, 39, 21, 19], ['B', 15, 43, 53, 38]] },
    { k: 'bernao', nome: 'São Bernão FC', sigla: 'SBN', uf: 'SP', reg: 'SE', tecnico: 'Dona Cleonice', formacao: '4-4-2', tatica: 'retranca', estilo: 'Compacto, sofre pouco e decide na bola parada.',
      uni: ['#f2c230', '#1c1c1f', '#f2c230', '#1c1c1f', '#1c1c1f', '#f2c230', '#2a72d6'], uni2: ['#1c1c1f', '#f2c230', '#1c1c1f', '#f2c230', '#1c1c1f', '#f2c230', '#2a72d6'],
      hist: [['C', 8, 20, 17, 19], ['C', 4, 29, 16, 19], ['C', 5, 19, 15, 19]] },
    { k: 'pinguela', nome: 'Pinguela Preta AA', sigla: 'PPA', uf: 'SP', reg: 'SE', tecnico: 'Seu Aristeu', formacao: '4-4-2', tatica: 'contra', estilo: 'Marca muito e ataca pouco: depende de um gol no contra-ataque.',
      uni: ['#f4f4f0', '#1c1c1f', '#1c1c1f', '#1c1c1f', '#f4f4f0', '#1c1c1f', '#c8352b'], uni2: ['#1c1c1f', '#f4f4f0', '#f4f4f0', '#1c1c1f', '#1c1c1f', '#f4f4f0', '#c8352b'],
      hist: [['B', 15, 24, 35, 38], ['B', 17, 37, 55, 38], ['C', 2, 20, 16, 19]] },
    { k: 'fogareu', nome: 'Fogaréu de Ribeirão FC', sigla: 'FRF', uf: 'SP', reg: 'SE', tecnico: 'Professor Nestor', formacao: '5-3-2', tatica: 'retranca', estilo: 'Joga recuado e tenta escapar com os pontas.',
      uni: ['#c8202e', '#f4f4f0', '#1c1c1f', '#f4f4f0', '#c8202e', '#1c1c1f', '#f2c230'], uni2: ['#f4f4f0', '#c8202e', '#c8202e', '#1c1c1f', '#f4f4f0', '#c8202e', '#f2c230'],
      hist: [['B', 12, 25, 42, 38], ['B', 14, 36, 51, 38], ['B', 16, 32, 52, 38]] },
    { k: 'tubarao', nome: 'Tubarão do Norte FC', sigla: 'TNF', uf: 'PR', reg: 'S', tecnico: 'Seu Edgar', formacao: '4-3-3', tatica: 'aerea', estilo: 'Aposta em cruzamentos para o centroavante grandão.',
      uni: ['#3a9ad8', '#f4f4f0', '#f4f4f0', '#f4f4f0', '#3a9ad8', '#f4f4f0', '#1c1c1f'], uni2: ['#f4f4f0', '#3a9ad8', '#3a9ad8', '#3a9ad8', '#f4f4f0', '#3a9ad8', '#1c1c1f'],
      hist: [['B', 19, 31, 58, 38], ['C', 7, 24, 21, 19], ['C', 4, 27, 19, 19]] },
  ];
  const IDX = {}; TIMES_B.forEach((t, i) => { IDX[t.k] = i; });
  const NOME_REG = { NE: 'Nordeste', SE: 'Sudeste', S: 'Sul', CO: 'Centro-Oeste' };
  const NOME_TATICA = { tikitaka: 'Toque de bola', falso9: 'Falso 9', retranca: 'Retranca', contra: 'Contra-ataque', aerea: 'Bola aérea' };

  // ---- A FORÇA PELOS 3 ANOS: posição na escada das divisões (A 1–20, B 21–40, C 41–60, D 61+), gols por jogo com o peso da
  //   divisão (gol na Série A vale mais; sofrer na Série C pesa mais). Pesos dos anos: 2023 = 0,2 · 2024 = 0,3 · 2025 = 0,5.
  //   ov (0 a 1) = 0,5 × posição + 0,25 × ataque + 0,25 × defesa, normalizados entre os 20.
  (function calcularForca() {
    const W = [0.2, 0.3, 0.5], AJ = { A: [1.2, 0.85], B: [1, 1], C: [0.82, 1.2] }, OFF = { A: 0, B: 20, C: 40, D: 60 };
    const raw = TIMES_B.map((t) => {
      let r = 0, a = 0, d = 0, wa = 0;
      t.hist.forEach(([div, p, gf, ga, n], i) => {
        r += W[i] * (1 - (OFF[div] + p - 1) / 79);
        if (n) { const [fa, fd] = AJ[div]; a += W[i] * gf / n * fa; d += W[i] * ga / n * fd; wa += W[i]; }
      });
      return { r, a: a / wa, d: d / wa };
    });
    const norm = (k, inv) => { const v = raw.map((x) => x[k]), lo = Math.min(...v), hi = Math.max(...v); return v.map((x) => (inv ? hi - x : x - lo) / (hi - lo)); };
    const R = norm('r'), A = norm('a'), D = norm('d', true);
    TIMES_B.forEach((t, i) => {
      t.ov = 0.5 * R[i] + 0.25 * A[i] + 0.25 * D[i]; t.atk = A[i]; t.def = D[i]; t.rank = R[i];
      t.gpj = r1(raw[i].a * 100) / 100; t.gsj = r1(raw[i].d * 100) / 100;
      const base = 6.05 + t.ov * 1.75;
      t.setores = { gk: r1(base + (D[i] - 0.5) * 0.9), def: r1(base + (D[i] - 0.5) * 1.1), mid: r1(base + (R[i] - 0.5) * 0.6), fwd: r1(base + (A[i] - 0.5) * 1.1) };
      t.estrelas = t.ov >= 0.75 ? 5 : t.ov >= 0.55 ? 4 : t.ov >= 0.42 ? 3 : t.ov >= 0.2 ? 2 : 1;
    });
    const ord = TIMES_B.map((t, i) => i).sort((a, b) => TIMES_B[b].ov - TIMES_B[a].ov);
    ord.forEach((ti, pos) => { TIMES_B[ti].forcaPos = pos + 1; TIMES_B[ti].faixa = pos < 7 ? 'bom' : pos < 14 ? 'medio' : 'ruim'; });
  })();
  const timesDaFaixa = (f) => TIMES_B.filter((t) => t.faixa === f);

  // ============================================================================================ OS EMBLEMAS (pixel art 32x32)
  const EMB_B = {
    fortalecer: { pal: ['#1a1208', '#f4f4f0', '#d75e69', '#e2d4b4', '#f7f7f4', '#5c80bb', '#1d4fa0', '#c8202e', '#153a76', '#b0a080', '#f2c230', '#5a3a22', '#567bb8', '#123163', '#19448a', '#b5b5b2'],
      px: '................................|................................|...aaaaaaaaaaaaaaaaaaaaaaaaaa...|...abbbbbbbbbbbbbbbbbbbbbbbba...|...abcccccadaeadaeadafffffgba...|...abchhhhadaaadaaadagggggiba...|...abchhhhadddddddddagggggiba...|...abchhhhadjdddddjdagggggiba...|...abchhhhadddaaadddagggggiba...|...abchhhhadddakadddagggggiba...|...abchhhhadjdaaadjdagggggiba...|...abchhhhadddddddddagggggiba...|...abchhhhaddaaaaaddagggggiba...|...abchhhhadallllladagggggiba...|...abchhhhhbbbbbbbbbbgggggiba...|..aaaaaaaaaaaaaaaaaaaaaaaaaaaa..|..ammmmmmmbbbmbbbmmbbmmmmmmmma..|aaagggggggbgggbgggbggggggggggaaa|anagggggggbbggbbggbggggggggggana|anagggggggbgggbgggbggggggggggana|.aaooooooobooobbboobbooooooooaa.|anaaaaaaaaaaaaaaaaaaaaaaaaaaaana|ana.abbhhhhbbbbbbbbbbggggbba.ana|aaa.aabbhhhbbbbbbbbbbgggbbaa.aaa|.....aabhhhbbbbbbbbbbgggbaa.....|......abbbhbbbbkkbbbbgbbba......|......aaabbbbbbkkbbbbbbaaa......|........aabbbppbbppbbbaa........|.........aaabbbbbbbbaaa.........|...........aaaaaaaaaa...........|...............aa...............|................................' },
    aurora: { pal: ['#1a1208', '#1c1c1f', '#f6d36a', '#f2c230', '#b39024', '#ffd860', '#f29a1e', '#ff9a2a', '#fff6e0', '#5c5c5e', '#151517', '#f5d164', '#96781e', '#d0a729'],
      px: '................................|...aaaaaaa...aaaaaa...aaaaaaa...|...abbbbba...abbbba...abbbbba...|...abccdba...abcdba...abccdba...|...abcddbaaaaabddbaaaaabddeba...|...abcddbbbbbbbddbbbbbbbddeba...|...abcddddcccddddddcccddddeba...|...abcdddddfddddddddfdddddeba...|...abcdfdddaaddddddaadddfdeba...|...abcdfddaggahhhhaggaddfdeba...|...abcdfddagagaaaagagaddfdeba...|...abcdfddaggggggggggaddfdeba...|...abcdfddagagiggigagaddfdeba...|...abcdfddaggaaggaaggaddfdeba...|...abjbbbbaggggggggggabbbbkba...|...abjbbbbbagiiaaiigabbbbbkba...|...abjbbbbbagiiiiiigabbbbbkba...|...abjbbbbbbaagiigaabbbbbbkba...|...abbbbbbbbbbaaaabbbbbbbbbba...|...aabbbbbbbbbbbbbbbbbbbbbbaa...|....abbbbbbbbbbbbbbbbbbbbbba....|..aaaaaaaaaaaaaaaaaaaaaaaaaaaa..|..allllllllbblbllbllblllllllla..|aaadddddddbdddbbdbdbdbdddddddaaa|amadddddddbdbdbbbbdbbbdddddddama|amadddddddbdbdbdbbdbdbdddddddama|.aannnnnnnnbbnbnnbnbnbnnnnnnnaa.|amaaaaaaaaaaaaaaaaaaaaaaaaaaaama|ama.........aaabbaaa.........ama|aaa...........aaaa...........aaa|...............aa...............|................................' },
    carvoeiro: { pal: ['#1a1208', '#1c1c1f', '#f6d36a', '#f7f7f4', '#9aa1ab', '#f2c230', '#f4f4f0', '#b39024', '#8a5a2b', '#2a2a30', '#55555c', '#5c6670', '#3a4048', '#555557', '#111113', '#18181b', '#b5b5b2'],
      px: '................................|................................|...aaaaaaaaaaaaaaaaaaaaaaaaaa...|...abbbbbbbbbbbbbbbbbbbbbbbba...|...abcdddaeeeeaaaaeeeeadddfba...|...abcggaeaffaeeeeaffaeagghba...|...abcggaaffffaiiaffffaagghba...|...abcggggffffaiiaffffgggghba...|...abcggggffffaiiaffffgggghba...|...abcggggaaaaaaaaaaaagggghba...|...abcgggajkjjkjjkjjkjaggghba...|...abcgggaaaaaaaaaaaaaaggghba...|...abcgggallllllllllllaggghba...|...abcgggalmllllllllmlaggghba...|...abcggggaaaaaaaaaaaagggghba...|...abcggggfaeaggggaeafgggghba...|...abcggggffafggggfaffgggghba...|...abcggggffffggggffffgggghba...|...abcggggffffggggffffgggghba...|...abbggggffffggggffffggggbba...|..aaaaaaaaaaaaaaaaaaaaaaaaaaaa..|..annnnnnnnffnfffnnffnnnnnnnna..|aaabbbbbbbfbbbfbbbfbbbbbbbbbbaaa|aoabbbbbbbfbbbffbbfbbbbbbbbbbaoa|aoabbbbbbbfbbbfbbbfbbbbbbbbbbaoa|.aappppppppffpfffppffppppppppaa.|aoaaaaaaaaaaaaaaaaaaaaaaaaaaaaoa|aoa.....aabbbhqggqhbbbaa.....aoa|aaa......aaabbbbbbbbaaa......aaa|...........aaaaaaaaaa...........|...............aa...............|................................' },
    vovo: { pal: ['#1a1208', '#1c1c1f', '#5c5c5e', '#f4f4f0', '#3a3a40', '#e8b48a', '#cfe8f4', '#c8906a', '#151517', '#f7f7f4', '#979795', '#d2d2ce', '#b5b5b2'],
      px: '................................|..............aaaa..............|..........aaaaabbaaaaa..........|........aaabbbbbbbbbbaaa........|.......aabbbaaaaaaacbbbaa.......|......aabbdaeeeeeeeaabbbaa......|.....aabbdaeeeeeeeeeeabbbaa.....|....aabbddaaaaaaaaaaaabdbbaa....|...aabbdddaffffffffffabddbbaa...|...abbbddafaaaffaaaffabdddbba...|..aabbbddafagaaaagaffabddddbaa..|..abbbbddafaaaffaaaffabddddbba..|..abcbbdddaffffhffffabbddddiba..|..abcbbdddadddddddddabbddddiba..|.aabbbbddddaddaadddabbbddddbbaa.|.abbbbbddddbafffffabbbbddddbbba.|.abbbbbddddbbaaaaadbbbbddddbbba.|.aabbbbddddbbbbddddbbbbddddbbaa.|..abcbbddddbbbbddddbbbbddddiba..|..aaaaaaaaaaaaaaaaaaaaaaaaaaaa..|..ajjjjjjjbjbjjbbjjbbjjjjjjjja..|aaadddddddbdbdbdddbddddddddddaaa|akadddddddbdbddbddbddddddddddaka|akadddddddbdbdddbdbddddddddddaka|.aallllllllbllbblllbbllllllllaa.|akaaaaaaaaaaaaaaaaaaaaaaaaaaaaka|aka...aabbdbbbbddddbbbbbaa...aka|aaa....aabbbiibdddmibbbaa....aaa|........aaabbbbbbbbbbaaa........|..........aaaaabbaaaaa..........|..............aaaa..............|................................' },
    esmeraldino: { pal: ['#1a1208', '#f4f4f0', '#5e9f71', '#1f7a3a', '#9df0b8', '#ffffff', '#175a2b', '#3cc46a', '#2a9a50', '#f7f7f4', '#979795', '#d2d2ce', '#155a2a', '#10431f'],
      px: '................................|................................|...aaaaaaaaaaaaaaaaaaaaaaaaaa...|...abbbbbbbbbbbbbbbbbbbbbbbba...|...abcccccccaaaaaaaaccccccdba...|...abcdddddaeefeefeeadddddgba...|...abcddddaeefeeeefeeaddddgba...|...abcdddaaaaaaaaaaaaaadddgba...|...abcdddahhihhhhhhihhadddgba...|...abcddddahhihhhhihhaddddgba...|...abcdddddahhihhihhadddddgba...|...abcddddddahhiihhaddddddgba...|...abcdddddddahhhhadddddddgba...|...abcddddddddahhaddddddddgba...|...abcdddddddddaadddddddddgba...|...abcddddddddddddddddddddgba...|...abcddddddddddddddddddddgba...|..aaaaaaaaaaaaaaaaaaaaaaaaaaaa..|..ajjjjjjjdddjdddjjddjjjjjjjja..|aaabbbbbbbdbbbdbbbdbbbbbbbbbbaaa|akabbbbbbbddbbddbbdbbbbbbbbbbaka|akabbbbbbbdbbbdbbbdbbbbbbbbbbaka|.aallllllldddldddllddllllllllaa.|akaaaaaaaaaaaaaaaaaaaaaaaaaaaaka|aka..aabmmmmmmmmmmmmmmmmbaa..aka|aaa...abbbmmmmmmmmmmmmbbba...aaa|......aaabbmmmmbbmmmmbbaaa......|........aabbbnnbbnnbbbaa........|.........aaabbbbbbbbaaa.........|...........aaaaaaaaaa...........|...............aa...............|................................' },
    juventa: { pal: ['#1a1208', '#1f7a3a', '#f7f7f4', '#f4f4f0', '#8a5a2b', '#e4ece4', '#4caf50', '#7a3a9a', '#b07ad0', '#ecf1ec', '#a9afa9', '#b5b5b2', '#579b6b', '#134c24', '#1b6932'],
      px: '................................|............aaaaaaaa............|...........aabbbbbbaa...........|.........aaabbcaaabbaaa.........|........aabbbddaeafbbbaa........|.......aabbdaaaaeaaagbbaa.......|......aabbdahhahhahhadbbaa......|....aaabbdahihahihahiafbbaaa....|...aabbbddahhhahhhahhaffbbbaa...|..aabbfddddaahhahhahaffdddbbaa..|..abbfddddfahihahihaffddddfbba..|..abjddddffahhhahhhafddddffkba..|..abcdddffffaahhahafddddfffkba..|..abcddffffddahihafddddfffflba..|..abcdffffdddahhhaddddffffdlba..|..abcffffddddfaaaddddffffddlba..|..abjfffddddffffddddffffdddlba..|..abjffddddffffddddffffddddkba..|..aaaaaaaaaaaaaaaaaaaaaaaaaaaa..|..ammmmmmmmmdmmddmdddmmmmmmmma..|aaabbbbbbbbbdbdbbbdbbbbbbbbbbaaa|anabbbbbbbbbdbbdbbddbbbbbbbbbana|anabbbbbbbdbdbbbdbdbbbbbbbbbbana|.aaoooooooodooddoodooooooooooaa.|anaaaaaaaaaaaaaaaaaaaaaaaaaaaana|ana...aabbdffffddddfffbbaa...ana|aaa....aabbfffddddfffbbaa....aaa|........aabbbddddffbbbaa........|.........aaabbllkkbbaaa.........|...........aabbbbbbaa...........|............aaaaaaaa............|................................' },
    dourado: { pal: ['#1a1208', '#f2c230', '#549f71', '#127a3a', '#0d5a2b', '#d99a1a', '#ffffff', '#69a3cc', '#2f7fb8', '#235e88', '#8fd0f0', '#f5d164', '#96781e', '#d0a729'],
      px: '................................|................................|...aaaaaaaaaaaaaaaaaaaaaaaaaa...|...abbbbbbbbbbbbbbbbbbbbbbbba...|...abcccccccccccccccccccccdba...|...abcddddddddddddddddddddeba...|...abcddddddddddddddddddddeba...|...abcdddddddaaaadddddddddeba...|...abcdddddaabbbbaadddddddeba...|...abcdddaabbbfbbbbaaddaadeba...|...abcddabbbbbbbbbbbbaabbaeba...|...abcdabagbbbfbbbfbbbbbadeba...|...abcdabaabbbbbbbbbbbbbbaeba...|...abcddabbbbbfbbbfbbaabbaeba...|...abcdddaabbbbbbbbaaddaadeba...|...abhiiiiiaaaaaaaaiiiiiiijba...|...abkiikkiikkiikkiikkiikkjba...|...abhiiiiiiiiiiiiiiiiiiiijba...|...abhkkiikkiikkiikkiikkiikba...|..aaaaaaaaaaaaaaaaaaaaaaaaaaaa..|..alllllllddllddlldddlllllllla..|aaabbbbbbbdbdbdbdbdbbbbbbbbbbaaa|amabbbbbbbdbdbddbbddbbbbbbbbbama|amabbbbbbbdbdbdbbbdbbbbbbbbbbama|.aannnnnnnddnndnnndddnnnnnnnnaa.|amaaaaaaaaaaaaaaaaaaaaaaaaaaaama|ama...aaabbiiiiiiiiiibbaaa...ama|aaa.....aabbbjjiijjbbbaa.....aaa|.........aaabbbbbbbbaaa.........|...........aaaaaaaaaa...........|...............aa...............|................................' },
    rubronegro: { pal: ['#1a1208', '#f2c230', '#d75e69', '#c8202e', '#941822', '#5c5c5e', '#1c1c1f', '#e8402e', '#151517', '#ffffff', '#f5d164', '#96781e', '#d0a729'],
      px: '................................|...aaaaaaa...aaaaaa...aaaaaaa...|...abbbbba...abbbba...abbbbba...|...abccdba...abcdba...abccdba...|...abcddbaaaaabddbaaaaabddeba...|...abcddbbbbbbbaabbbbbbbddeba...|...abfggggahahhhhhhahaggggiba...|...abfgggahhhhaaaahhhhagggiba...|...abfgggahhabbbbbbahhagggiba...|...abfgggahababbbbabahagggiba...|...abcdddahabbbbbbbbahadddeba...|...abcdddahabbbaabbbahadddeba...|...abcdddahhabbbbbbahhadddeba...|...abcddddahhabjjbahhaddddeba...|...abfgggggahhaaaahhagggggiba...|...abfggggagahhhhhhagaggggiba...|...abfgggggggaaaaaagggggggiba...|...abfggggggggggggggggggggiba...|...abbddddddddddddddddddddbba...|..aaaaaaaaaaaaaaaaaaaaaaaaaaaa..|..akkkkkkkggkkgkkgkgggkkkkkkka..|aaabbbbbbbgbgbggbgbbgbbbbbbbbaaa|alabbbbbbbggbbggggbbgbbbbbbbbala|alabbbbbbbgbgbgbggbbgbbbbbbbbala|.aammmmmmmgmgmgmmgmgggmmmmmmmaa.|alaaaaaaaaaaaaaaaaaaaaaaaaaaaala|ala......aaabbddddbbaaa......ala|aaa........aabbbbbbaa........aaa|............aaabbaaa............|..............aaaa..............|...............aa...............|................................' },
    dragao: { pal: ['#1a1208', '#c8202e', '#5c5c5e', '#66666a', '#2a2a30', '#1c1c1f', '#1f1f24', '#e8402e', '#f2c230', '#d65862', '#f4f4f0', '#7c141d', '#ac1c28', '#151517'],
      px: '................................|................................|...aaaaaaaaaaaaaaaaaaaaaaaaaa...|...abbbbbbbbbbbbbbbbbbbbbbbba...|...abcccccccccccddddddddddeba...|...abaffffffffffaaeeeeeeeagba...|...abahafffffffahhaeeeeeahaba...|...abahhaffffffahihaeeeahhaba...|...abahhhafffaahhhhaaeahhhaba...|...abcahhhaaahhhhhhhhahhhagba...|...abcfahhhhhhhhhhhhhhhhaegba...|...abcffaahhhhhhhhhhhhaaeegba...|...abcffffaahhhaahhhaaeeeegba...|...abcffffffahafeahaeeeeeegba...|...abcffffffaaffeeaaeeeeeegba...|...abcffffffffffeeeeeeeeeegba...|...abcffffffffffeeeeeeeeeegba...|...abcffffffffffeeeeeeeeeegba...|..aaaaaaaaaaaaaaaaaaaaaaaaaaaa..|..ajjjjjjjkkjjjkkjjkjjjjjjjjja..|aaabbbbbbbkbkbkbbbkbkbbbbbbbbaaa|alabbbbbbbkbkbkbbbkkkbbbbbbbbala|alabbbbbbbkbkbkbbbkbkbbbbbbbbala|.aammmmmmmkkmmmkkmkmkmmmmmmmmaa.|alaaaaaaaaaaaaaaaaaaaaaaaaaaaala|ala...abbbffffffeeeeeebbba...ala|aaa...aaabbfffffeeeeebbaaa...aaa|........aabbbnnfeggbbbaa........|.........aaabbbbbbbbaaa.........|...........aaaaaaaaaa...........|...............aa...............|................................' },
    avante: { pal: ['#1a1208', '#1d5fb0', '#f7f7f4', '#f4f4f0', '#8c9199', '#c8352b', '#b5b5b2', '#dbe9f6', '#5c8cc6', '#154682', '#8fd0f0', '#979795', '#d2d2ce'],
      px: '................................|................................|...aaaaaaaaaaaaaaaaaaaaaaaaaa...|...abbbbbbbbbbbbbbbbbbbbbbbba...|...abcccccccccccccccccccccdba...|...abcdddaeddddfffddddaeddgba...|...abcdddaeddffdddffddaeddgba...|...abcdddaedfdddddddfdaeddgba...|...abcdddaedddddddddddaeddgba...|...abcdddaefdddddddddfaeddgba...|...abhdddafddddhddddhdaedhgba...|...abcdddaedddhddddhddaehdgba...|...abffffaefffffffffffaffffba...|...abaaaaaaaaaaaaaaaaaaaaaaba...|...abibbbaebbbbbbbbbbbaebbjba...|...abibbbbbbbbbbbbbbbbbbbbjba...|...abkbbkkbbkkbbkkbbkkbbkkjba...|...abibbbbbbbbbbbbbbbbbbbbjba...|...abikkbbkkbbkkbbkkbbkkbbkba...|..aaaaaaaaaaaaaaaaaaaaaaaaaaaa..|..accccccccbccbbbcbbbcccccccca..|aaadddddddbdbddbddbddddddddddaaa|aladddddddbbbddbddbbdddddddddala|aladddddddbdbddbddbddddddddddala|.aammmmmmmbmbmbbbmbmmmmmmmmmmaa.|alaaaaaaaaaaaaaaaaaaaaaaaaaaaala|ala...aaabbbbbbbbbbbbbbaaa...ala|aaa.....aabbbjjbbjjbbbaa.....aaa|.........aaabbbbbbbbaaa.........|...........aaaaaaaaaa...........|...............aa...............|................................' },
    regatas: { pal: ['#1a1208', '#c8202e', '#d75e69', '#e04a3a', '#f4f4f0', '#f7f7f4', '#b8261f', '#ffffff', '#f2c230', '#d99a1a', '#b5b5b2', '#8a5a2b', '#979795', '#d2d2ce', '#941822'],
      px: '................................|..............aaaa..............|..........aaaaabbaaaaa..........|........aaabbbbbbbbbbaaa........|.......aabbbcdbdedffbbbaa.......|......aabbbbdgdgdgdeeebbaa......|.....aabbbbahhhhhhhaeeebbaa.....|....aabbbbahhhhhhhhhaeeebbaa....|...aabbbbbahhaahhhhhaiieebbaa...|...abbbbbbahhhhhhhhhaiijeebba...|..aabbbbbbahhhhhhhhaadaeeeebaa..|..abbbbbbbbahhhhhhhadgaeeeebba..|..abcbbbbbbbaahhhhaeaaeeeeekba..|..abcbbbbbbbbbaaaaeeeeeeeeekba..|.aabbbbbbbbbllbbeeeeeeeeeeeebaa.|.abbbbbbbbllbbbbeeeeeeeeeeeebba.|.abbbbbbllbbbbbbeeeeeeeeeeeebba.|.aabbbllbbbbbbbbeeeeeeeeeeeebaa.|..abcbbbbbbbbbbbeeeeeeeeeeekba..|..aaaaaaaaaaaaaaaaaaaaaaaaaaaa..|..afffffffbbffbbffbbfffffffffa..|aaaeeeeeeebebebebebebeeeeeeeeaaa|amaeeeeeeebbeebebebbeeeeeeeeeama|amaeeeeeeebebebebebeeeeeeeeeeama|.aannnnnnnbnbnbbnnbnnnnnnnnnnaa.|amaaaaaaaaaaaaaaaaaaaaaaaaaaaama|ama...aabbbbbbbbeeeeeebbaa...ama|aaa....aabbboobbeekkbbbaa....aaa|........aaabbbbbbbbbbaaa........|..........aaaaabbaaaaa..........|..............aaaa..............|................................' },
    coelhao: { pal: ['#1a1208', '#1c1c1f', '#57986a', '#5eab71', '#1f8a3a', '#167030', '#f4f4f0', '#17662b', '#f0a0b0', '#105324', '#e07a90', '#ffffff', '#555557', '#111113', '#18181b'],
      px: '................................|................................|...aaaaaaaaaaaaaaaaaaaaaaaaaa...|...abbbbbbbbbbbbbbbbbbbbbbbba...|...abcdddddcaaccdaaddccccceba...|...abdeeeefagafeagaefffffehba...|...abdeeeffagiaeagiaffffeehba...|...abdeefffagiaeagiafffeeehba...|...abdeffffaggaaggafffeeeehba...|...abdffffaggggggggafeeeeejba...|...abcffffagaaggaagaeeeeefjba...|...abcfffeaggggggggaeeeeffjba...|...abcffeeagggkggggaeeefffjba...|...abcfeeeeagallagaeeeffffjba...|...abceeeeefaaaaaaeeefffffhba...|...abdeeeefffffeeeeefffffehba...|...abdeeefffffeeeeefffffeehba...|...abdeefffffeeeeefffffeeehba...|..aaaaaaaaaaaaaaaaaaaaaaaaaaaa..|..ammmmmmmmggmggmmmggmmmmmmmma..|aaabbbbbbbgbbbgbgbgbbbbbbbbbbaaa|anabbbbbbbgbbbgbgbgbgbbbbbbbbana|anabbbbbbbgbbbgbgbgbgbbbbbbbbana|.aaooooooooggoggoooggooooooooaa.|anaaaaaaaaaaaaaaaaaaaaaaaaaaaana|ana...abbbfffffeeeeeffbbba...ana|aaa...aaabbfffeeeeeffbbaaa...aaa|........aabbbhheehjbbbaa........|.........aaabbbbbbbbaaa.........|...........aaaaaaaaaa...........|...............aa...............|................................' },
    fantasma: { pal: ['#1a1208', '#f4f4f0', '#5c5c5e', '#8c9199', '#1c1c1f', '#151517', '#9aa1ab', '#8a5a2b', '#66666a', '#2a2a30', '#1f1f24', '#f7f7f4', '#979795', '#d2d2ce'],
      px: '................................|................................|.....aaaaaaaaaaaaaaaaaaaaaa.....|....aabbbbbbbbbbbbbbbbbbbbaa....|...aabbccccccddddddccccccbbaa...|..aabbeeeeeedbbbbbbdeeeeeebbaa..|..abbeeeeeedbbbbbbbbdeeeeeebba..|..abceeeeeedbddbbddbdeeeeeefba..|..abceeeeeedbddbbddbdeeeeeefba..|..abceeeeeedbbbbbbbbdeeeeeefba..|..abceeeeeedbbbddbbbdeeeeeefba..|..abceeeeeedbbbbbbbbdeeeeeefba..|..abceeeeeedbdbbdbbdbdeeeeefba..|..abceeeeeeddeddeddeddeeeeefba..|..abceeeeeeeeeeeeeeeeeeeeeefba..|..abggggggggggggggggggggggggba..|..abceheeheeheeheeheeheeheehba..|..abijjjjjjjjjjjjjjjjjjjjjjkba..|..abijjjjjjjjjjjjjjjjjjjjjjkba..|..aaaaaaaaaaaaaaaaaaaaaaaaaaaa..|..allllllleeeleelleeelllllllla..|aaabbbbbbbebbbebebbebbbbbbbbbaaa|amabbbbbbbeebbebebbebbbbbbbbbama|amabbbbbbbebbbebebbebbbbbbbbbama|.aannnnnnnennneennnennnnnnnnnaa.|amaaaaaaaaaaaaaaaaaaaaaaaaaaaama|amaabbjjjjjjjjjjjjjjjjjjjjbbaama|aaaaabbkkkkkkkkkkkkkkkkkkbbaaaaa|....aabbbbbbbbbbbbbbbbbbbbaa....|.....aaaaaaaaaaaaaaaaaaaaaa.....|................................|................................' },
    vilarubra: { pal: ['#1a1208', '#f4f4f0', '#d8d0c8', '#7a1018', '#c8202e', '#f7f7f4', '#979795', '#d2d2ce'],
      px: '................................|................................|...............aa...............|..............aaaa..............|.............aabbaa.............|............aabbbbaa............|...........aabbbcbbaa...........|..........aabbbcdebbaa..........|.........aabbebcdeebbaa.........|........aabbeebcdeebbbaa........|.......aabbeebcdeebcdbbaa.......|......aabbdeebcdeebcdebbaa......|.....aabbcdeebcdeebcdeebbaa.....|....aabbcdeebcdeebcdeeeebbaa....|...aabbbcdeebcdeebcdeeeeebbaa...|..aabbebcdeebcdeebcdeeeeeebbaa..|..aabbeeeeeeeeeeeeeeeeeeeebbaa..|..aaaaaaaaaaaaaaaaaaaaaaaaaaaa..|..afffffffefefeeffeeeffffffffa..|aaabbbbbbbebebebebebbbbbbbbbbaaa|agabbbbbbbebebeebbeebbbbbbbbbaga|agabbbbbbbebebebebebbbbbbbbbbaga|.aahhhhhhhhehhehehehhhhhhhhhhaa.|agaaaaaaaaaaaaaaaaaaaaaaaaaaaaga|aga.......aabbeeeebbaa.......aga|aaa........aabbeebbaa........aaa|............aabbbbaa............|.............aabbaa.............|..............aaaa..............|...............aa...............|................................|................................' },
    timbu: { pal: ['#1a1208', '#c8202e', '#d75e69', '#f7f7f4', '#f4f4f0', '#3a64b8', '#9ec7e8', '#b9b4ac', '#b5b5b2', '#e07a90', '#979795', '#d2d2ce', '#941822'],
      px: '................................|................................|...aaaaaaaaaaaaaaaaaaaaaaaaaa...|...abbbbbbbbbbbbbbbbbbbbbbbba...|...abccddddcccaaaddcaacaadeba...|...abcbeeeebbafgfaeahhahhaiba...|...abcbeeeebbbafaeeahahahaiba...|...abcbeeeebaaafaaaahhhhhaiba...|...abcbeeeebafffffabahjhaeiba...|...abcbeeeebaaafaaabbaaaeeiba...|...abcbeeeebbbafaeebbbbeeeiba...|...abcbeeaabbbafaeebaabeeeiba...|...abcbeeafabbafaeeafabeeeiba...|...abcbeeeafaaafaaafabbeeeiba...|...abcbeeeeafffffffabbbeeeiba...|...abcbeeeebaaaaaaabbbbeeeiba...|...abcbeeeebbbbeeeebbbbeeeiba...|...abcbeeeebbbbeeeebbbbeeeiba...|..aaaaaaaaaaaaaaaaaaaaaaaaaaaa..|..adddddddbbbddbdddbbdddddddda..|aaaeeeeeeeebeebebebeeeeeeeeeeaaa|akaeeeeeeeebeebbbeebeeeeeeeeeaka|akaeeeeeeeebeebebeeebeeeeeeeeaka|.aallllllllbllblblbblllllllllaa.|akaaaaaaaaaaaaaaaaaaaaaaaaaaaaka|aka...abbbebbbbeeeebbbbbba...aka|aaa...aaabbbbbbeeeebbbbaaa...aaa|........aabbbmmeeiibbbaa........|.........aaabbbbbbbbaaa.........|...........aaaaaaaaaa...........|...............aa...............|................................' },
    delrei: { pal: ['#1a1208', '#1c1c1f', '#f7f7f4', '#f4f4f0', '#5c5c5e', '#151517', '#f2c230', '#c8202e', '#3a64b8', '#d99a1a', '#555557', '#111113', '#18181b'],
      px: '................................|...aaaaaaa...aaaaaa...aaaaaaa...|...abbbbba...abbbba...abbbbba...|...abccdba...abcbba...abeebba...|...abcddbaaaaabdbbaaaaabbbfba...|...abcddbbbbbbbdbbbbbbbbbbfba...|...abcddadcccaddbbaeeebabbfba...|...abcddagadagadbagabagabbfba...|...abcddaggagggaagggaggabbfba...|...abcddaggggggggggggggabbfba...|...abcddaghgggiggiggghgabbfba...|...abcddaggggggggggggggabbfba...|...abcddaaaaaaaaaaaaaaaabbfba...|...abcddajjjjjjjjjjjjjjabbfba...|...abcddaaaaaaaaaaaaaaaabbfba...|...abcddddddddddbbbbbbbbbbfba...|...abcddddddddddbbbbbbbbbbfba...|...abcddddddddddbbbbbbbbbbfba...|..aaaaaaaaaaaaaaaaaaaaaaaaaaaa..|..akkkkkkkkdkkddkkddkkkkkkkkka..|aaabbbbbbbdbdbdbdbdbdbbbbbbbbaaa|alabbbbbbbdddbdbdbddbbbbbbbbbala|alabbbbbbbdbdbdbdbdbdbbbbbbbbala|.aammmmmmmdmdmddmmdmdmmmmmmmmaa.|alaaaaaaaaaaaaaaaaaaaaaaaaaaaala|ala.....aabbbdddbbbbbbaa.....ala|aaa......aaabbddbbbbaaa......aaa|...........aabbbbbbaa...........|............aaabbaaa............|..............aaaa..............|...............aa...............|................................' },
    bernao: { pal: ['#1a1208', '#1c1c1f', '#f6d36a', '#f2c230', '#8a4a1a', '#b39024', '#f4f4f0', '#d8d0c8', '#e07a90', '#a86a2a', '#5c5c5e', '#151517', '#f5d164', '#96781e', '#d0a729'],
      px: '................................|................................|...aaaaaaaaaaaaaaaaaaaaaaaaaa...|...abbbbbbbbbbbbbbbbbbbbbbbba...|...abccccccaaaccccaaacccccdba...|...abcddddaeeeaaaaeeeaddddfba...|...abcddddaeeggggggeeaddddfba...|...abcddddaegaggggageaddddfba...|...abcdddddagggaagggadddddfba...|...abcdddddagggaagggadddddfba...|...abcdddddagghgghggadddddfba...|...abcddddddaggiiggaddddddfba...|...abcdddddddaaaaaadddddddfba...|...abcddddddddajjaddddddddfba...|...abcddddddddajjaddddddddfba...|...abcdddddddddaadddddddddfba...|...abkbbbbbbbbbbbbbbbbbbbblba...|..aaaaaaaaaaaaaaaaaaaaaaaaaaaa..|..ammmmmmmmbbmbbmmbmmbmmmmmmma..|aaadddddddbdddbdbdbbdbdddddddaaa|anaddddddddbddbbddbbbbdddddddana|anadddddddddbdbdbdbdbbdddddddana|.aaooooooobboobboobooboooooooaa.|anaaaaaaaaaaaaaaaaaaaaaaaaaaaana|ana..aabbbbbbbbbbbbbbbbbbaa..ana|aaa...abbbbbbbbbbbbbbbbbba...aaa|......aaabbbbbbbbbbbbbbaaa......|........aabbbllbbllbbbaa........|.........aaabbbbbbbbaaa.........|...........aaaaaaaaaa...........|...............aa...............|................................' },
    pinguela: { pal: ['#1a1208', '#1c1c1f', '#5c5c5e', '#f7f7f4', '#f4f4f0', '#6a4428', '#e8b48a', '#8a5a2b', '#151517', '#979795', '#d2d2ce', '#b5b5b2'],
      px: '................................|..............aaaa..............|..........aaaaabbaaaaa..........|........aaabbbbbbbbbbaaa........|.......aabbbccaaaadcbbbaa.......|......aabbebbaffffabbbbbaa......|.....aabbeebafaggafabbbbbaa.....|....aabbeeebafgaagfabbbebbaa....|...aabbeeeebbaggggabbbbeebbaa...|...abbbeeeebbbaggaebbbbeeebba...|..aabbbeeeebbaffffabbbbeeeebaa..|..abbbbeeeebafaffafabbbeeeebba..|..abcbbeehhhhhhhhhhhhhheeeeiba..|..abchhhhaaaaaaaaaaaaaahhhhiba..|.aabhaaaaeebfbbefeebfbbaaaahbaa.|.abbabbefeebfbbefeebfbbefeeabba.|.abbfbbefeebfbbefeebfbbefeebbba.|.aabfbbefeebbbbeeeebbbbefeebbaa.|..aaaaaaaaaaaaaaaaaaaaaaaaaaaa..|..adddddddbbddbbdddbddddddddda..|aaaeeeeeeebebebebebebeeeeeeeeaaa|ajaeeeeeeebbeebbeebbbeeeeeeeeaja|ajaeeeeeeebeeebeeebebeeeeeeeeaja|.aakkkkkkkbkkkbkkkbkbkkkkkkkkaa.|ajaaaaaaaaaaaaaaaaaaaaaaaaaaaaja|aja..aabbeebbbbeeeebbbbbbaa..aja|aaa...aabbebbbbeeeebbbbbaa...aaa|.......aabbbiibeeelibbbaa.......|........aaabbbbbbbbbbaaa........|..........aaaaabbaaaaa..........|..............aaaa..............|................................' },
    fogareu: { pal: ['#1a1208', '#1c1c1f', '#d75e69', '#8c9199', '#24242a', '#c8202e', '#f2c230', '#941822', '#ffe066', '#f7f7f4', '#f4f4f0', '#5a5a60', '#b5b5b2', '#ffffff', '#5c5c5e', '#151517', '#979795', '#d2d2ce'],
      px: '................................|................................|...aaaaaaaaaaaaaaaaaaaaaaaaaa...|...abbbbbbbbbbbbbbbbbbbbbbbba...|...abccccdeedccccdeedcccccfba...|...abcfffdeeeddddeeedfffgfhba...|...abcfffdeeeeeeeeeedffgighba...|...abcfffdedgdeedgdedfgiiigba...|...abcfffdeeddeeddeedffgighba...|...abcfffdeeeeeeeeeedffgfghba...|...abjkkkkdeeellleedkkkkkkmba...|...abjkkkkkdeenneedkkkkkkkmba...|...abjkkkkkkddddddkkkkkkkkmba...|...abobbbbbbbbbbbbbbbbbbbbpba...|...abobbbbbbbbbbbbbbbbbbbbpba...|...abobbbbbbbbbbbbbbbbbbbbpba...|...abobbbbbbbbbbbbbbbbbbbbpba...|...abobbbbbbbbbbbbbbbbbbbbpba...|..aaaaaaaaaaaaaaaaaaaaaaaaaaaa..|..ajjjjjjjfffjffjjfffjjjjjjjja..|aaakkkkkkkfkkkfkfkfkkkkkkkkkkaaa|aqakkkkkkkffkkffkkffkkkkkkkkkaqa|aqakkkkkkkfkkkfkfkfkkkkkkkkkkaqa|.aarrrrrrrfrrrfrfrfrrrrrrrrrraa.|aqaaaaaaaaaaaaaaaaaaaaaaaaaaaaqa|aqa...abbbbbbbbbbbbbbbbbba...aqa|aaa...aaabbbbbbbbbbbbbbaaa...aaa|........aabbbppbbppbbbaa........|.........aaabbbbbbbbaaa.........|...........aaaaaaaaaa...........|...............aa...............|................................' },
    tubarao: { pal: ['#1a1208', '#f4f4f0', '#71b6e3', '#3a9ad8', '#8c9aa8', '#2b72a0', '#ffffff', '#e8eef2', '#1d5fb0', '#5c8cc6', '#154682', '#f7f7f4', '#979795', '#d2d2ce'],
      px: '................................|................................|...aaaaaaaaaaaaaaaaaaaaaaaaaa...|...abbbbbbbbbbbbbbbbbbbbbbbba...|...abcccccccccacccccccccccdba...|...abcdddddddaeaddddddddddfba...|...abcddddddaeeaddddddddddfba...|...abcdddddaeeeaaaadddddddfba...|...abcddaaaeeeeeeeeaaaddddfba...|...abcdaeeeeeeeeeeeeeeaaddfba...|...abcaeaeeeeeeeeeeeeeeeaafba...|...abcaeeeeeeeeeeeeeeeeeeafba...|...abcdagagaghhhhhhhhhhaadfba...|...abcddaaaaaaaaaaaaaaadddfba...|...abcddddddddddddddddddddfba...|...abggiiggiiggiiggiiggiiggba...|...abjiiiiiiiiiiiiiiiiiiiikba...|...abjiggiiggiiggiiggiiggikba...|...abjiiiiiiiiiiiiiiiiiiiikba...|..aaaaaaaaaaaaaaaaaaaaaaaaaaaa..|..allllllliiililliliiillllllla..|aaabbbbbbbbibbiibibibbbbbbbbbaaa|amabbbbbbbbibbiiiibiibbbbbbbbama|amabbbbbbbbibbibiibibbbbbbbbbama|.aannnnnnnninninnininnnnnnnnnaa.|amaaaaaaaaaaaaaaaaaaaaaaaaaaaama|ama...aaabbiiiiiiiiiibbaaa...ama|aaa.....aabbbkkiikkbbbaa.....aaa|.........aaabbbbbbbbaaa.........|...........aaaaaaaaaa...........|...............aa...............|................................' },
  };
  const ARTES = {};
  function arte(k) {                                                       // o canvas 32x32 do emblema (desenhado uma vez só)
    if (ARTES[k]) return ARTES[k];
    const E = EMB_B[k], cv = document.createElement('canvas'); cv.width = cv.height = 32;
    const g = cv.getContext('2d');
    if (E) { const L = E.px.split('|'), ABC = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      L.forEach((ln, y) => { for (let x = 0; x < ln.length; x++) { const c = ln[x]; if (c !== '.') { g.fillStyle = E.pal[ABC.indexOf(c)]; g.fillRect(x, y, 1, 1); } } }); }
    else { const F = TIME_DE[k]; if (F && typeof desenharEmblema === 'function') desenharEmblema(g, 2, 2, 28, 28, F.emblemaSimples); }   // times das copas: o escudo simples do motor
    return (ARTES[k] = cv);
  }
  const urlArte = (k) => { const c = arte(k); return c.__url || (c.__url = c.toDataURL()); };

  // ============================================================================================ OS TIMES MENORES DAS COPAS
  //   Para completar a Copa Estadual (4 times) e a Copa Regional (8 times): clubes do interior inventados, mais fracos.
  const PEQUENOS = [
    ['Atlético Riacho Fundo', 'ARF', '#2f6f3a', '#f2c230'], ['União do Vale', 'UDV', '#1f4a8a', '#f4f4f0'], ['EC Barro Branco', 'EBB', '#8a5a2b', '#f4f4f0'],
    ['Sertanejo FC', 'SFC', '#c86a1a', '#1c1c1f'], ['Real Pedra Lisa', 'RPL', '#5a2a7a', '#f2c230'], ['Grêmio Sol Nascente', 'GSN', '#e8742a', '#1f2a44'],
    ['Operário Pé-Vermelho', 'OPV', '#a8201a', '#f4f4f0'], ['Juventude da Várzea Grande', 'JVG', '#127a3a', '#f2c230'], ['Esporte Clube Lagoa Seca', 'ELS', '#3a9ad8', '#1c1c1f'],
    ['Ferrinho FC', 'FFC', '#55595f', '#f2c230'], ['Associação Morro Alto', 'AMA', '#1c1c1f', '#e8742a'], ['Ypiranguinha EC', 'YEC', '#f4f4f0', '#a8201a'],
    ['Cruzeirinho do Sul', 'CDS', '#1d4fa0', '#f4f4f0'], ['Tupi das Águas', 'TDA', '#2a8a8a', '#f4f4f0'], ['Comercial da Serra', 'CMS', '#7a1f2b', '#e8c27a'],
    ['Palmeirinha do Brejo', 'PDB', '#1f8a3a', '#f4f4f0'], ['Vasquinho da Praia', 'VDP', '#f4f4f0', '#1c1c1f'], ['Botinha FC', 'BFC', '#1c1c1f', '#f4f4f0'],
  ].map(([nome, sigla, c1, c2], i) => {
    const forca = 5.55 + ((i * 7) % 9) * 0.09;                               // de 5,6 a 6,3
    return { k: 'pq' + i, nome, sigla, pequeno: true, formacao: ['4-4-2', '5-3-2', '4-3-3'][i % 3], tatica: ['contra', 'retranca', 'aerea'][i % 3], estilo: 'Time do interior: muita vontade e pouca técnica.',
      tecnico: ['Seu Juca', 'Professor Didi', 'Seu Tonico', 'Dona Lurdes', 'Mister Peixoto', 'Seu Zequinha'][i % 6], estrelas: 1,
      uni: [c1, c2, c2, c1, c1, c2, '#f2c230'], uni2: [c2, c1, c1, c2, c2, c1, '#1c1c1f'], setores: { gk: forca, def: forca, mid: forca, fwd: forca - 0.1 },
      emblemaSimples: { forma: ['escudo', 'circulo', 'losango'][i % 3], cor1: c1, cor2: c2, letras: sigla.slice(0, 2) } };
  });
  const TIME_DE = {}; for (const t of TIMES_B.concat(PEQUENOS)) TIME_DE[t.k] = t;

  // ============================================================================================ HABILIDADES E ELENCOS
  const HABS = ['defesa', 'desarme', 'forca', 'resistencia', 'recuperacao', 'velocidade', 'chute', 'efeito', 'passe', 'cruzamento', 'drible', 'dominio', 'cabeceio', 'finalizacao', 'goleiro'];
  const VIES = {
    GK: { goleiro: 2, defesa: 0, drible: -2, finalizacao: -3, chute: -1, cabeceio: -1 },
    DEF: { defesa: 1, desarme: 1, cabeceio: 1, finalizacao: -1, drible: -1, goleiro: -5 },
    MID: { passe: 1, drible: 1, resistencia: 1, goleiro: -5 },
    FWD: { finalizacao: 1, chute: 1, velocidade: 1, defesa: -1, desarme: -1, goleiro: -5 },
  };
  const CONTA = {
    GK: { goleiro: 4, dominio: 1, passe: 1, forca: 1, defesa: 1, resistencia: 1 },
    DEF: { defesa: 2, desarme: 2, cabeceio: 1, forca: 1, velocidade: 1, resistencia: 1, passe: 1, dominio: 1 },
    MID: { passe: 2, drible: 1, dominio: 1, resistencia: 1, cruzamento: 1, defesa: 1, chute: 1, velocidade: 1 },
    FWD: { finalizacao: 2, chute: 1, velocidade: 1, drible: 1, dominio: 1, cabeceio: 1, efeito: 1, forca: 1 },
  };
  function mediaPos(hab, pos) { const W = CONTA[pos] || CONTA.MID; let s = 0, n = 0; for (const k in W) { s += (hab[k] != null ? hab[k] : 5) * W[k]; n += W[k]; } return s / n; }
  function gerarHab(alvo, pos, sem) {
    const r = rndDe(sem), V = VIES[pos] || {}, h = {};
    for (const n of HABS) h[n] = alvo + (V[n] || 0) * 0.8 + (r() - 0.5) * 2.0;
    for (let it = 0; it < 3; it++) { const dlt = alvo - mediaPos(h, pos); for (const n of HABS) h[n] = clampN(h[n] + dlt, 1, 10); }
    for (const n of HABS) h[n] = r1(h[n]);
    return h;
  }
  // os papéis das 11 posições de cada formação (as mesmas linhas do motor: FORMACOES[f].linhas[10])
  const LINHAS11 = { '4-4-2': [4, 4, 2], '4-3-3': [4, 3, 3], '5-3-2': [5, 3, 2], '3-5-2': [3, 5, 2], '4-2-3-1': [4, 2, 3, 1] };
  const papeis11 = (f) => { const L = LINHAS11[f] || LINHAS11['4-4-2'], r = ['GK']; L.forEach((m, li) => { for (let i = 0; i < m; i++) r.push(li === 0 ? 'DEF' : li === L.length - 1 ? 'FWD' : 'MID'); }); return r; };
  const LINHAS6 = { '4-4-2': [2, 3, 1], '4-3-3': [2, 2, 2], '5-3-2': [3, 2, 1], '3-5-2': [2, 3, 1], '4-2-3-1': [2, 1, 2, 1] };
  const papeis7 = (f) => { const L = LINHAS6[f] || LINHAS6['4-4-2'], r = ['GK']; L.forEach((m, li) => { for (let i = 0; i < m; i++) r.push(li === 0 ? 'DEF' : li === L.length - 1 ? 'FWD' : 'MID'); }); return r; };
  // nomes dos jogadores: nome + sobrenome ou apelido (sorteados pela semente do time; ninguém se repete)
  const PRIMEIROS = ['Thiago', 'Rodrigo', 'Matheus', 'Lucas', 'Caio', 'Diego', 'Renan', 'Igor', 'Vitor', 'Wesley', 'Gustavo', 'Bruno', 'Ítalo', 'Jefferson', 'Fabrício', 'Alan', 'Danilo', 'Everton',
    'Henrique', 'Jonas', 'Kauã', 'Leandro', 'Marlon', 'Nícolas', 'Otávio', 'Pedro', 'Rafael', 'Samuel', 'Tiago', 'Ulisses', 'Valdir', 'Wellington', 'Yuri', 'Anderson', 'Breno', 'Cristiano', 'Douglas',
    'Emerson', 'Felipe', 'Gabriel', 'Hugo', 'Jean', 'Luan', 'Maicon', 'Natan', 'Patrick', 'Ruan', 'Sandro', 'Talles', 'Vinícius', 'Wagner', 'Adriano', 'Murilo', 'Rogério', 'Elias', 'Tássio'];
  const SOBRENOMES = ['Rocha', 'Barros', 'Teixeira', 'Moura', 'Siqueira', 'Lemos', 'Freitas', 'Prado', 'Viana', 'Sampaio', 'Coutinho', 'Araújo', 'Queiroz', 'Bezerra', 'Tavares', 'Aguiar', 'Pacheco',
    'Brandão', 'Cardoso', 'Dantas', 'Esteves', 'Farias', 'Galvão', 'Holanda', 'Leal', 'Macedo', 'Nogueira', 'Paiva', 'Rangel', 'Salgado', 'Toledo', 'Vasconcelos', 'Xavier', 'Medeiros', 'Peixoto', 'Bastos'];
  const APELIDOS = ['Biel', 'Juninho Pé', 'Tchê', 'Pimpa', 'Dodô Bala', 'Neguinho', 'Careca', 'Tatá', 'Mineiro', 'Baiano', 'Cabeção', 'Fumaça', 'Gringo', 'Paulistinha', 'Nenê', 'Chicão', 'Tuta',
    'Dedé', 'Zé Mário', 'Lelo', 'Bolinha', 'Cocada', 'Pirulito', 'Formiga', 'Pitbull', 'Galego', 'Sapinho', 'Capixaba', 'Russo', 'Bibi', 'Tico', 'Guga'];
  const USADOS = new Set();
  function nomeNovo(r) {
    for (let t = 0; t < 40; t++) {
      const n = r() < 0.28 ? APELIDOS[Math.floor(r() * APELIDOS.length)] + (r() < 0.4 ? ' ' + SOBRENOMES[Math.floor(r() * SOBRENOMES.length)].slice(0, 1) + '.' : '')
        : PRIMEIROS[Math.floor(r() * PRIMEIROS.length)] + ' ' + SOBRENOMES[Math.floor(r() * SOBRENOMES.length)];
      if (!USADOS.has(n)) { USADOS.add(n); return n; }
    }
    const n = 'Jogador ' + (USADOS.size + 1); USADOS.add(n); return n;
  }
  // o elenco de um time: 11 titulares (na ordem dos lugares da formação) e 7 reservas
  const ELENCOS = {};
  function elencoB(t) {
    if (ELENCOS[t.k]) return ELENCOS[t.k];
    const pap = papeis11(t.formacao), lista = pap.concat(['GK', 'DEF', 'DEF', 'MID', 'MID', 'FWD', 'FWD']);
    const r = rndDe(semDe('sb-time|' + t.k)), out = [];
    lista.forEach((pos, i) => {
      const set = pos === 'GK' ? t.setores.gk : pos === 'DEF' ? t.setores.def : pos === 'MID' ? t.setores.mid : t.setores.fwd;
      const titular = i < 11, alvo = clampN(set + (r() - 0.5) * 0.9 - (titular ? 0 : 0.55), 3, 9.6);
      const nome = nomeNovo(r), sem = semDe('sb|' + t.k + '|' + nome);
      const ap = typeof gerarAparencia === 'function' ? gerarAparencia(sem, 'M') : {};
      const j = Object.assign({ nome, genero: 'M', semente: sem, pos, titular, hab: gerarHab(alvo, pos, sem) }, ap);
      j.media = r1(mediaPos(j.hab, pos)); out.push(j);
    });
    return (ELENCOS[t.k] = out);
  }
  function forcaTime(t) {
    if (t.pequeno) return { media: t.setores.mid, gk: t.setores.gk, def: t.setores.def, mid: t.setores.mid, fwd: t.setores.fwd };
    const E = elencoB(t).slice(0, 11), m = E.reduce((s, j) => s + j.media, 0) / E.length;
    const set = (p) => { const l = E.filter((j) => j.pos === p); return l.length ? l.reduce((s, j) => s + j.media, 0) / l.length : m; };
    return { media: r1(m), gk: r1(set('GK')), def: r1(set('DEF')), mid: r1(set('MID')), fwd: r1(set('FWD')) };
  }
  const estrelasTxt = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);
  const uniDe = (u) => ({ camisa: u[0], listra: u[1], gola: u[2], calcao: u[3], meia: u[4], sola: u[5], goleiro: u[6] });
  function apTecnico(t) { return typeof gerarAparencia === 'function' ? gerarAparencia(semDe('sb-tec|' + t.k), /^Dona /.test(t.tecnico) ? 'F' : 'M') : {}; }
  // o time no formato do motor. voce: o time do jogador (o elenco sai sem o titular da posição dele: o motor põe o jogador no lugar)
  function timeMotor(t, o) {
    o = o || {};
    const fz = forcaTime(t), ap = apTecnico(t);
    let elenco;
    if (t.pequeno) {
      const r = rndDe(semDe('sb-pq|' + t.k));
      elenco = (ELENCOS[t.k] = ELENCOS[t.k] || papeis11(t.formacao).concat(['GK', 'DEF', 'MID', 'FWD', 'MID']).map((pos, i) => {
        const nome = nomeNovo(r), sem = semDe('sbpq|' + t.k + '|' + nome), alvo = clampN(fz.media + (r() - 0.5) * 0.8 - (i < 11 ? 0 : 0.5), 3, 9);
        return Object.assign({ nome, genero: 'M', semente: sem, pos, titular: i < 11, hab: gerarHab(alvo, pos, sem) }, typeof gerarAparencia === 'function' ? gerarAparencia(sem, 'M') : {});
      }));
    } else elenco = elencoB(t);
    elenco = elenco.map((j) => Object.assign({}, j));
    if (o.voce) {                                     // tira o titular da posição do jogador (ele vai para o banco)
      const i = elenco.findIndex((j, k) => k < 11 && j.pos === o.voce);
      if (i >= 0) { const sai = elenco.splice(i, 1)[0]; elenco.splice(10, 0, sai); }
    }
    return {
      id: 'sb_' + t.k, nome: t.nome, sigla: t.sigla, forca: Math.round(fz.media * 10), popularidade: 0.4, formacao: t.formacao, tatica: t.tatica,
      uniforme: uniDe(t.uni), uniforme2: uniDe(t.uni2), tecnicoFixo: true,
      emblema: t.pequeno ? Object.assign({}, t.emblemaSimples) : { forma: 'escudo', cor1: t.uni[0], cor2: t.uni[1], letras: t.sigla.slice(0, 2), arte: arte(t.k) },
      tecnico: { nome: t.tecnico, aparencia: { pele: ap.pele, cabelo: ap.cabelo, estilo: ap.estilo, roupa: t.uni[3] } },
      elenco,
    };
  }

  // ============================================================================================ A PENEIRA: "Time 1" x "Time 2"
  //   14 garotos (o jogador no Time 1). Sem nome de time, sem emblema: camisa branca (Time 1) e cinza (Time 2).
  const BRANCO = { camisa: '#f4f4f0', listra: '#f4f4f0', gola: '#e4e4e4', calcao: '#f4f4f0', meia: '#f4f4f0', sola: '#e4e4e4', goleiro: '#2a72d6' };
  const CINZA = { camisa: '#8c9199', listra: '#8c9199', gola: '#6c7179', calcao: '#8c9199', meia: '#8c9199', sola: '#6c7179', goleiro: '#e8742a' };
  function timePeneira(lado, voce) {
    const r = rndDe(semDe('peneira|' + lado)), pap = papeis7(lado ? '4-3-3' : '4-4-2');
    let lista = pap.concat(['MID', 'FWD', 'DEF']);
    if (voce) { const i = lista.indexOf(voce); if (i > 0 && i < 7) lista.splice(i, 1); }
    const elenco = lista.map((pos, i) => {
      const nome = nomeNovo(r), sem = semDe('pen|' + lado + '|' + nome), alvo = 5.2 + r() * 1.4;
      return Object.assign({ nome, genero: 'M', semente: sem, pos, titular: i < 7, hab: gerarHab(alvo, pos, sem) }, typeof gerarAparencia === 'function' ? gerarAparencia(sem, 'M') : {});
    });
    return { id: 'peneira' + (lado + 1), nome: lado ? T('Time 2') : T('Time 1'), sigla: lado ? 'T2' : 'T1', forca: 58, popularidade: 0.1, formacao: lado ? '4-3-3' : '4-4-2', tatica: 'tikitaka',
      uniforme: lado ? CINZA : BRANCO, uniforme2: lado ? CINZA : BRANCO, emblema: { vazio: true }, tecnicoFixo: true,
      tecnico: { nome: lado ? 'Avaliador' : 'Avaliador', aparencia: { pele: '#c99a77', cabelo: '#3b2416', estilo: 5, roupa: '#2a3f66' } }, elenco };
  }
  // A NOTA DA PENEIRA: a nota do motor é a base; gol, assistência e o resultado pesam por cima. Expulsão derruba.
  function desempenhoPeneira(r) {
    if (!r) return 5;
    let s = (+r.nota || 6) + (r.gols | 0) * 0.35 + ((r.estatisticas && r.estatisticas.assist) | 0) * 0.25 + (r.venceu ? 0.3 : r.empate ? 0 : -0.25);
    if (r.expulso) s -= 2;
    return r1(clampN(s, 3, 10));
  }
  // a faixa das propostas: Tranquilo facilita os bons; Problemático dificulta os bons (mas chama os médios)
  function faixaPeneira(score, pers) {
    const L = pers === 'tranquilo' ? { bom: 7.6, medio: 6.1 } : pers === 'problematico' ? { bom: 8.7, medio: 5.6 } : { bom: 8.1, medio: 6.5 };
    return score >= L.bom ? 'bom' : score >= L.medio ? 'medio' : 'ruim';
  }
  function personalidade() {
    try { const v = Espectros.valor('tranquilo'); return v >= 25 ? 'tranquilo' : v <= -25 ? 'problematico' : 'neutro'; } catch (e) { return 'neutro'; }
  }
  // as 3 PROPOSTAS: 3 times diferentes da mesma faixa, com estilos diferentes (o sorteio prefere táticas que não se repetem)
  function gerarOfertas(faixa, pers, sem) {
    const r = rndDe(sem >>> 0 || 7), cand = timesDaFaixa(faixa).slice(), out = [], taticas = new Set();
    while (out.length < 3 && cand.length) {
      cand.sort(() => r() - 0.5);
      let i = cand.findIndex((t) => !taticas.has(t.tatica)); if (i < 0) i = 0;
      const t = cand.splice(i, 1)[0]; taticas.add(t.tatica);
      const S0 = SALARIOS[faixa], vit = Math.round(S0.vit[0] + r() * (S0.vit[1] - S0.vit[0])), luvas = Math.round((S0.luvas[0] + r() * (S0.luvas[1] - S0.luvas[0])) / 10) * 10;
      out.push({ k: t.k, faixa, base: S0.base, gol: S0.gol, ass: S0.ass, vit, luvas, extra: pers === 'problematico' ? EXTRA_PROBLEMATICO : 0 });
    }
    return out;
  }

  // ============================================================================================ A TEMPORADA
  //   Série B: 20 times, ida e volta (38 rodadas de 10 jogos, método do círculo; o returno inverte o mando).
  //   Cada jogo fica salvo compacto: [casa, fora, gols casa, gols fora] (−1 = ainda não jogado).
  function tabelaLiga(sem) {
    const n = TIMES_B.length, r = rndDe(sem), arr = TIMES_B.map((t, i) => i).sort(() => r() - 0.5), ida = [];
    for (let k = 0; k < n - 1; k++) {
      const rod = [];
      for (let i = 0; i < n / 2; i++) { const a = arr[i], b = arr[n - 1 - i], casaA = (k + i) % 2 === 0; rod.push([casaA ? a : b, casaA ? b : a, -1, -1]); }
      ida.push(rod); arr.splice(1, 0, arr.pop());
    }
    return ida.concat(ida.map((rod) => rod.map(([c, f]) => [f, c, -1, -1])));
  }
  function classificacao(T) {
    const L = TIMES_B.map((t, i) => ({ i, k: t.k, j: 0, p: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0 }));
    for (const rod of T.liga) for (const [c, f, a, b] of rod) {
      if (a < 0) continue;
      const A = L[c], B = L[f]; A.j++; B.j++; A.gp += a; A.gc += b; B.gp += b; B.gc += a;
      if (a > b) { A.v++; A.p += 3; B.d++; } else if (a < b) { B.v++; B.p += 3; A.d++; } else { A.e++; B.e++; A.p++; B.p++; }
    }
    return L.sort((x, y) => y.p - x.p || y.v - x.v || (y.gp - y.gc) - (x.gp - x.gc) || y.gp - x.gp || x.i - y.i);
  }
  // força de ataque e de defesa para a simulação (o nosso time sem o jogador: um pouco mais fraco)
  function poder(k, fator) {
    const f = forcaTime(TIME_DE[k]), at = f.fwd * 0.6 + f.mid * 0.4, df = f.def * 0.55 + f.gk * 0.45, x = fator || 1;
    return { at: at * x, df: df * x };
  }
  function poisson(l, r) { const L = Math.exp(-l); let k = 0, p = 1; do { k++; p *= r(); } while (p > L && k < 12); return k - 1; }
  const lambda = (at, df, casa) => clampN(1.05 * Math.pow(at / df, 2.2) + (casa ? 0.2 : 0), 0.15, 4.5);
  function simularPlacar(kc, kf, fc, ff, r) {
    r = r || Math.random; const A = poder(kc, fc), B = poder(kf, ff);
    return [poisson(lambda(A.at, B.df, true), r), poisson(lambda(B.at, A.df, false), r)];
  }
  function penaltis(kc, kf) {
    const ga = forcaTime(TIME_DE[kc]).gk, gb = forcaTime(TIME_DE[kf]).gk, ganhaA = Math.random() < 0.5 + (ga - gb) * 0.04, base = 3 + Math.floor(Math.random() * 3);
    return ganhaA ? [base, base - 1 - Math.floor(Math.random() * 2)] : [base - 1 - Math.floor(Math.random() * 2), base];
  }
  // AS COPAS (mata-mata, jogo único, empate = pênaltis; o melhor colocado manda o jogo)
  //   Estadual: os times da Série B do mesmo estado + pequenos do interior até 4 (semifinal e final).
  //   Regional: os da mesma região + pequenos até 8 (quartas, semifinal e final).
  function montarCopa(tipo, nosso, sem) {
    const t0 = TIME_DE[nosso], r = rndDe(sem), N = tipo === 'est' ? 4 : 8;
    let ks = TIMES_B.filter((t) => (tipo === 'est' ? t.uf === t0.uf : t.reg === t0.reg)).map((t) => t.k);
    ks.sort((a, b) => TIME_DE[b].ov - TIME_DE[a].ov);
    if (ks.length > N) { ks = ks.filter((k) => k !== nosso).slice(0, N - 1); ks.push(nosso); ks.sort((a, b) => TIME_DE[b].ov - TIME_DE[a].ov); }
    const peq = PEQUENOS.map((p) => p.k).sort(() => r() - 0.5);
    while (ks.length < N) ks.push(peq.shift());
    const pares = N === 4 ? [[0, 3], [1, 2]] : [[0, 7], [3, 4], [1, 6], [2, 5]];
    return { tipo, times: ks, fases: [pares.map(([a, b]) => ({ c: ks[a], f: ks[b], gc: -1, gf: -1, pen: null }))], campeao: null };
  }
  const NOME_FASE = { 2: ['Semifinal', 'Final'], 3: ['Quartas de final', 'Semifinal', 'Final'] };
  const nFases = (C) => (C.tipo === 'est' ? 2 : 3);
  const vencedorJogo = (g) => (g.pen ? (g.pen[0] > g.pen[1] ? g.c : g.f) : g.gc > g.gf ? g.c : g.gc < g.gf ? g.f : g.c);
  function proximaFase(C) {
    const F = C.fases[C.fases.length - 1]; if (F.some((g) => g.gc < 0)) return;
    const w = F.map(vencedorJogo);
    if (w.length === 1) { C.campeao = w[0]; return; }
    const ordem = (a, b) => (C.times.indexOf(a) <= C.times.indexOf(b) ? [a, b] : [b, a]);
    const prox = []; for (let i = 0; i < w.length; i += 2) { const [c, f] = ordem(w[i], w[i + 1]); prox.push({ c, f, gc: -1, gf: -1, pen: null }); }
    C.fases.push(prox);
  }
  // O CALENDÁRIO: terça, quinta e sábado a partir da primeira terça depois de dia0. Os jogos das copas caem em vagas fixas
  //   (Estadual: 1ª e 4ª; Regional: 7ª, 13ª e 19ª) e a Série B ocupa o resto (38 vagas). 43 vagas no total.
  const VAGAS_COPA = { 0: ['est', 0], 3: ['est', 1], 6: ['reg', 0], 12: ['reg', 1], 18: ['reg', 2] };
  function montarCalendario(dia0) {
    let d = dia0; while (semanaDe(d) !== 1) d++;
    const dias = []; while (dias.length < 43) { if ([1, 3, 5].includes(semanaDe(d))) dias.push(d); d++; }
    let rod = 0;
    return dias.map((dia, i) => {
      const h = HORAS_JOGO[(i * 3 + Math.floor(i / 5)) % HORAS_JOGO.length];
      const cp = VAGAS_COPA[i];
      return cp ? { dia, h, comp: cp[0], fase: cp[1], feito: false } : { dia, h, comp: 'liga', r: rod++, feito: false };
    });
  }
  function novaTemporada(nosso, dia0, n) {
    const sem = semDe('temporada|' + nosso + '|' + n + '|' + dia0);
    return { n, nosso, vagas: montarCalendario(dia0), liga: tabelaLiga(sem), copas: { est: montarCopa('est', nosso, sem + 1), reg: montarCopa('reg', nosso, sem + 2) }, fechadas: 0, est: {} };
  }
  // o jogo do nosso time numa vaga (ou null: folga, eliminado da copa)
  function jogoNosso(T, v) {
    if (v.comp === 'liga') { const g = T.liga[v.r].find((x) => x[0] === IDX[T.nosso] || x[1] === IDX[T.nosso]); return g ? { liga: true, g, c: TIMES_B[g[0]].k, f: TIMES_B[g[1]].k } : null; }
    const C = T.copas[v.comp], F = C.fases[v.fase]; if (!F) return null;
    const g = F.find((x) => x.c === T.nosso || x.f === T.nosso); return g ? { copa: v.comp, g, c: g.c, f: g.f } : null;
  }
  // os artilheiros e garçons simulados (só a Série B; o jogador entra como __voce)
  const PESO_GOL = { GK: 0.02, DEF: 0.7, MID: 2.2, FWD: 5 }, PESO_ASS = { GK: 0.1, DEF: 1, MID: 4, FWD: 2 };
  function sorteiaPeso(lista, peso) { const tot = lista.reduce((s, x) => s + peso(x), 0); let v = Math.random() * tot; for (const x of lista) { v -= peso(x); if (v <= 0) return x; } return lista[lista.length - 1]; }
  // os 11 titulares de um time num jogo da Série B: gols, assistências, jogos e a soma das notas ([g, a, j, notas])
  function notaB(x, g, a, res, sofr) {
    let n = 6 + res * 0.45 + g * 0.9 + a * 0.5 + ((x.media || 6) - 6) * 0.25 + (Math.random() + Math.random() + Math.random() - 1.5) * 0.7;
    if (x.pos === 'GK' || x.pos === 'DEF') n += sofr === 0 ? 0.7 : -0.18 * (sofr - 1);
    return r1(clampN(n, 3, 10));
  }
  function marcarJogo(T, k, gols, sofr) {
    const t = TIME_DE[k]; if (!t || t.pequeno) return;
    const L = elencoB(t).slice(0, 11), G = new Map(), A = new Map();
    for (let i = 0; i < gols; i++) {
      const a = sorteiaPeso(L, (x) => PESO_GOL[x.pos] * Math.pow((x.hab.finalizacao || 5) / 7, 2)); G.set(a, (G.get(a) | 0) + 1);
      if (Math.random() < 0.7) { const o = L.filter((x) => x !== a), b = sorteiaPeso(o, (x) => PESO_ASS[x.pos] * Math.pow((x.hab.passe || 5) / 7, 2)); A.set(b, (A.get(b) | 0) + 1); }
    }
    const res = Math.sign(gols - sofr);
    for (const x of L) {
      const e = (T.est[k + '|' + x.nome] = T.est[k + '|' + x.nome] || [0, 0, 0, 0]), g = G.get(x) | 0, a = A.get(x) | 0;
      e[0] += g; e[1] += a; e[2] = (e[2] | 0) + 1; e[3] = r1((e[3] || 0) + notaB(x, g, a, res, sofr));
    }
  }
  // os prêmios individuais da temporada: artilheiro, líder de assistências e o melhor jogador (nota média, com pelo menos metade dos jogos)
  function premiosSerieB(T) {
    const L = Object.entries(T.est || {}).map(([key, e]) => { const i = key.indexOf('|'); return { k: key.slice(0, i), n: key.slice(i + 1), g: e[0] | 0, a: e[1] | 0, j: e[2] | 0, nota: e[3] || 0 }; });
    const melhor = L.filter((x) => x.j >= 19).sort((a, b) => b.nota / b.j - a.nota / a.j || b.j - a.j)[0];
    const art = L.slice().sort((a, b) => b.g - a.g || b.a - a.a || a.j - b.j)[0], ass = L.slice().sort((a, b) => b.a - a.a || b.g - a.g || a.j - b.j)[0];
    const pk = (x, v) => (x && v > 0 ? { k: x.k, n: x.n, v } : null);
    return { art: pk(art, art ? art.g : 0), ass: pk(ass, ass ? ass.a : 0), melhor: melhor ? { k: melhor.k, n: melhor.n, v: r1(melhor.nota / melhor.j) } : null };
  }
  function artilheiros(T, n) {
    return Object.entries(T.est).map(([key, [g, a]]) => { const [k, nome] = key.split('|'); return { k, nome, g, a }; }).filter((x) => x.g > 0 || x.a > 0).sort((x, y) => y.g - x.g || y.a - x.a).slice(0, n || 5);
  }

  // a partida acabou no meio de um replay (o apito final chegou junto do gol): nada da tela do replay sobra por cima da cena seguinte
  function limparHudPartida() {
    try { if (typeof G !== 'undefined' && G.replay) G.replay = null; if (typeof setLetterbox === 'function') setLetterbox(false); const sk = document.getElementById('skipBtn'), cl = document.getElementById('cineLabel'); if (sk) sk.hidden = true; if (cl) cl.textContent = ''; } catch (e) { /* nada */ }
  }

  // ============================================================================================ POPULARIDADE (15 a 100, 5 faixas)
  //   A torcida no estádio da Série B sai daqui (ocupação de 0 a 1). O sistema que faz ela subir ainda vai ser feito: por enquanto
  //   só existe a API (popularidade.somar), que guarda o motivo de cada mudança.
  const FAIXAS_POP = [
    { min: 15, nome: 'Torcida pequena', ocup: 0.16 }, { min: 30, nome: 'Torcida fiel', ocup: 0.3 }, { min: 45, nome: 'Torcida crescendo', ocup: 0.46 },
    { min: 60, nome: 'Torcida grande', ocup: 0.64 }, { min: 80, nome: 'Casa cheia', ocup: 0.84 },
  ];
  const faixaPop = (v) => { let i = 0; FAIXAS_POP.forEach((f, k) => { if (v >= f.min) i = k; }); return i; };

  // ============================================================================================ O MÓDULO NA CIDADE
  function criar(api) {
    const S = () => api.S();
    const M = { cena: false, onibus: null, tLento: 0, filaMsg: [], tMsg: 0, lendo: false };
    const dados = () => S().dados;
    const pro = () => { const d = dados(); return (d.pro = d.pro || { etapa: 'nada' }); };
    const agora = () => hAbs(dados().dia || 1, dados().hora || 0);
    const pk = (l) => l[Math.floor(Math.random() * l.length)];
    const nomeJ = () => { try { return api.nomeJog(); } catch (e) { return 'Você'; } };
    const vozJ = () => (typeof PERSONAGEM !== 'undefined' && typeof PERSONAGEM.voz === 'number' ? PERSONAGEM.voz : 2);
    const posJ = () => { const p = (typeof PERSONAGEM !== 'undefined' && PERSONAGEM.posicaoHist) || 'FWD'; return ['GK', 'DEF', 'MID', 'FWD'].includes(p) ? p : 'FWD'; };
    const namorando = () => !!dados().namorando;
    const gravar = () => { try { api.gravar(dados().ponto || 'chegada'); } catch (e) { /* sem save */ } };
    const fmt = (h) => api.fmtHora(h);
    const DIAS = ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo'];

    const popularidade = {
      valor(k) { const P = pro(); P.pop = P.pop || {}; return P.pop[k] != null ? P.pop[k] : POP0; },
      somar(k, n, motivo) {
        const P = pro(); P.pop = P.pop || {}; const v0 = this.valor(k), v = clampN(Math.round(v0 + n), 0, 100);
        P.pop[k] = v; (P.popLog = P.popLog || []).push([dados().dia | 0, k, v - v0, String(motivo || '')]); if (P.popLog.length > 60) P.popLog.shift();
        return v;
      },
      faixa(k) { return faixaPop(this.valor(k)); },
      nomeFaixa(k) { return T(FAIXAS_POP[this.faixa(k)].nome); },
      ocupacao(k) { return FAIXAS_POP[this.faixa(k)].ocup; },
      FAIXAS: FAIXAS_POP,
    };

    // trava: enquanto uma cena longa roda, nada (ligação, mensagem, outra cena) devolve o controle no meio dela
    function travar() { const s = S(); s.modo = 'cena'; if (api.UI && api.UI()) { try { api.UI().ctl.hidden = true; } catch (e) { /* nada */ } } return setInterval(() => { const q = S(); if (q && q.ativo && q.modo !== 'cena' && q.modo !== 'saindo') q.modo = 'cena'; }, 120); }

    // ---------------------------------------------------------------- o ANO andando para a frente (o contrário do começo do jogo)
    function anosAvancando(a0, a1, txt) {
      return new Promise((fim) => {
        const el = document.createElement('div'); el.id = 'sbAno';
        el.style.cssText = 'position:fixed;inset:0;z-index:31;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;background:#000;color:#fff;opacity:0;transition:opacity .8s ease';
        el.innerHTML = '<div style="font:700 clamp(56px,24vh,130px)/1 var(--font-display,monospace);letter-spacing:.06em;font-variant-numeric:tabular-nums">' + (a0 == null ? '' : a0) + '</div><p style="margin:0;font:700 14px/1.2 var(--font-display,monospace);letter-spacing:.14em;text-transform:uppercase;opacity:0;transition:opacity .6s">' + escH(txt || '') + '</p>';
        (document.getElementById('raizJogo') || document.body).appendChild(el);
        const num = el.firstChild, leg = el.lastChild;
        requestAnimationFrame(() => { el.style.opacity = '1'; });
        if (a0 == null) { num.style.display = 'none'; setTimeout(() => { leg.style.opacity = '1'; setTimeout(() => fim(el), 1900); }, 700); return; }
        setTimeout(() => {
          const ini = performance.now(), dur = 2200;
          const passo = (n) => { const k = Math.min(1, (n - ini) / dur), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; num.textContent = String(Math.round(a0 + (a1 - a0) * e)); if (k < 1) requestAnimationFrame(passo); else { leg.style.opacity = '1'; setTimeout(() => { fim(el); }, 1700); } };
          requestAnimationFrame(passo);
        }, 1100);
      });
    }

    // ================================================================ O PRESENTE: o aquecimento do começo do jogo, dois anos depois
    //   Mesmo campo (várzea padrão), mesmo uniforme todo branco, mesma câmera girando. Dois olheiros na beira do campo, de
    //   prancheta na mão. Namorando: a Lúcia do lado de fora do alambrado, pulando e torcendo.
    const BASE = { x: -3, z: 0 };
    async function modeloAdulto(ap, femi, roupa, cores) {
      try { const F2 = await Fases.carregar('fase2'); if (F2 && F2.modeloPessoa) return F2.modeloPessoa({ ap, fem: femi, roupa, cores }); } catch (e) { console.warn('[Série B] modelo:', e); }
      return null;
    }
    async function montarAquecimento() {
      const P0 = typeof PARTIDA_PADRAO !== 'undefined' ? PARTIDA_PADRAO : {};
      montarPartida(Object.assign({}, P0, { campo: 'varzea', horario: 'dia', clima: 'seco', times: [timePeneira(0, posJ()), timePeneira(1)], mandante: 0, usuario: { nome: nomeJ(), posicao: posJ() } }));
      kickoff(0); G.state = 'menu'; snapCamera();
      for (const o of ESTADIO.children) if (o.geometry && o.geometry.getAttribute && o.geometry.getAttribute('aFase')) o.visible = false;   // a torcida (a malha de sprites): ninguém na arquibancadinha, só quem importa na cena
      const ap = api.aparenciaNaPartida(), atores = [];
      const b = makeAthlete({ camisa: '#FFFFFF', listra: '#FFFFFF', gola: '#E4E4E4', numero: (typeof PERSONAGEM !== 'undefined' && PERSONAGEM.numero) || 9, calcao: 0xFFFFFF, meia: '#FFFFFF', sola: '#E4E4E4', corTexto: '#111111',
        pele: ap.pele, cabelo: ap.cabelo, estilo: ap.estilo, barba: ap.barba, rosto: ap.rosto, labio: ap.labio, corBarba: ap.corBarba, manga: ap.manga, meiao: ap.meiao, chuteira: ap.chuteira,
        nomeCamisa: (typeof PERSONAGEM !== 'undefined' && PERSONAGEM.nomeCamisa) || '', nome: nomeJ(), fundoNome: 'rgba(0,0,0,0.5)' });
      b.etiqueta.visible = false; b.raiz.position.set(BASE.x, 0, BASE.z); scene.add(b.raiz); atores.push(b);
      // os olheiros: boné, camisa polo e a prancheta presa na mão direita (no antebraço, que dobra no cotovelo)
      const olheiros = [];
      for (const [i, ap2] of [[0, { pele: '#c99a77', cabelo: '#3b2416', estilo: 5, rosto: 2, labio: 3, barba: 3 }], [1, { pele: '#7c4a2a', cabelo: '#15100d', estilo: 4, rosto: 0, labio: 3, barba: 0 }]]) {
        const r = await modeloAdulto(ap2, false, 0, i ? ['#1f2a44', '#3a3a40', '#f4f4f0', '#1c1c1f'] : ['#f4f4f0', '#2a3f66', '#1f2a44', '#1c1c1f']);
        if (!r) continue;
        const m = r.m; ATLETAS.delete(m); scene.add(m.raiz);
        const L = new Lote(); L.caixa(0.03, 0.3, 0.23, 0x8a5a2b, 0, 0, 0); L.caixa(0.035, 0.24, 0.19, 0xf4f4f0, 0.004, -0.01, 0); L.caixa(0.04, 0.03, 0.08, 0x9aa1ab, 0.006, 0.14, 0);
        const pr = L.malha(MAT_CORES); pr.position.set(0.1, -0.29, 0.02); pr.rotation.z = -0.25; m.bracoD.cotovelo.add(pr);
        const x = 1.5 + i * 1.3, z = -(HALF_W + 1.4);
        m.raiz.position.set(x, 0, z); m.raiz.rotation.y = -Math.PI / 2 + (i ? 0.25 : -0.2);
        olheiros.push(m); atores.push(m);
      }
      let lucia = null;
      if (namorando()) {
        const r = await modeloAdulto(api.apLucia(), true, 21, ['#3a6a9a', '#e8c27a', '#f2f2ee', '#f2f2ee']);
        if (r) { lucia = r.m; ATLETAS.delete(lucia); scene.add(lucia.raiz); lucia.raiz.position.set(-2.2, 0.45, BOARD_Z + 1.75); lucia.raiz.rotation.y = Math.PI / 2; lucia.y0 = 0.45; atores.push(lucia); }
      }
      return { b, olheiros, lucia, atores };
    }
    function desmontarAquecimento(C) {
      GANCHO_RENDER = null; camera.clearViewOffset();
      for (const m of C.atores) { ATLETAS.delete(m); scene.remove(m.raiz); m.raiz.traverse((o) => { if (o.geometry && o.geometry !== SHADOW_GEO) o.geometry.dispose(); if (o.material && o.material !== SHADOW_MAT && o.material !== MAT_CORES) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); } }); }
    }
    // o quadro do aquecimento: câmera girando em volta do jogador (como no começo do jogo) ou parada num enquadramento (cam)
    function ganchoAquecimento(C) {
      let yaw = 0.5, az = 0.4;
      return (rdt) => {
        const t = performance.now() / 1000, dt = Math.min(0.05, rdt || 0.016);
        for (const A of ATLETAS) A.raiz.visible = false;
        for (const m of C.atores) m.raiz.visible = true;
        ball.mesh.visible = ball.shadow.visible = false; userRing.visible = targetRing.visible = dribbleRing.visible = aimArrow.visible = false;
        const b = C.b;
        if (C.aquece) {
          const f = t * 2.2, pul = Math.max(0, Math.sin(f * 3));
          b.raiz.position.y = pul * 0.12;
          b.bracoE.rotation.z = Math.sin(f * 2) * 1.6 + 1.2; b.bracoD.rotation.z = Math.sin(f * 2 + Math.PI) * 1.6 + 1.2;
          b.bracoE.rotation.x = 0.25; b.bracoD.rotation.x = -0.25; usarCotovelo(b.bracoE, 0, 0); usarCotovelo(b.bracoD, 0, 0);
          b.pernaE.rotation.z = b.pernaD.rotation.z = pul * 0.35;
        } else {
          b.raiz.position.y = 0; b.pernaE.rotation.z = b.pernaD.rotation.z = 0;
          b.bracoE.rotation.x = b.bracoD.rotation.x = 0; usarCotovelo(b.bracoE, 0, 0); usarCotovelo(b.bracoD, 0, 0);
          b.bracoE.rotation.z = C.fala ? Math.sin(t * 5) * 0.3 + 0.35 : 0.08; b.bracoD.rotation.z = C.fala ? Math.sin(t * 5 + 2) * 0.3 + 0.35 : 0.08;
        }
        yaw += dt * (C.cam ? 0 : 0.6); b.raiz.rotation.y = C.virar != null ? C.virar : yaw;
        for (const [i, m] of C.olheiros.entries()) {                      // olheiros: prancheta na frente do peito, o outro braço solto
          m.bracoD.rotation.z = 0.95; m.bracoD.rotation.x = -0.1; usarCotovelo(m.bracoD, 0, 1.25);
          m.bracoE.rotation.z = 0.12 + Math.sin(t * 1.3 + i) * 0.05; m.bracoE.rotation.x = 0.05; usarCotovelo(m.bracoE, 0, 0.2);
        }
        if (C.lucia) {                                                     // a Lúcia pulando, braços para cima, alternando
          const L = C.lucia, f = t * 3.2, pul = Math.max(0, Math.sin(f * 2));
          L.raiz.position.y = (L.y0 || 0) + pul * 0.16;
          L.bracoE.rotation.z = 2.75 + Math.sin(f) * 0.25; L.bracoD.rotation.z = 2.75 - Math.sin(f) * 0.25;
          L.bracoE.rotation.x = 0.35; L.bracoD.rotation.x = -0.35; usarCotovelo(L.bracoE, 0, 0.25); usarCotovelo(L.bracoD, 0, 0.25);
          L.pernaE.rotation.z = L.pernaD.rotation.z = pul * 0.25;
        }
        if (C.cam) { camera.position.set(C.cam[0], C.cam[1], C.cam[2]); camera.lookAt(C.cam[3], C.cam[4], C.cam[5]); return; }
        az += dt * 0.09;
        const d = 5.6;
        camera.position.set(BASE.x + Math.cos(az) * d, 1.55, BASE.z + Math.sin(az) * d);
        camera.lookAt(BASE.x, 0.72, BASE.z);
      };
    }
    async function presente() {
      if (M.cena) return; M.cena = true;
      const P = pro(), d = dados(), trava = travar();
      P.etapa = 'peneira'; P.presente = true; P.presenteDia = d.dia | 0; gravar();
      let C = null, r = null;
      try {
        await api.preto(true, 900); api.aviso('');
        try { if (typeof Musica !== 'undefined') Musica.parar(); } catch (e) { /* nada */ }
        await Dialogo.mostrar([T('Vocês ainda lembram que isso estava no passado, né?'), T('Pois é. Agora, no presente...')], { nome: nomeJ(), voz: vozJ() });
        Dialogo.esconder();
        const ano = new Date().getFullYear(), elAno = await anosAvancando(ano - 2, ano, T('Dois anos depois'));
        api.sairParaPartida();
        C = await montarAquecimento(); C.aquece = true;
        GANCHO_RENDER = ganchoAquecimento(C);
        elAno.style.opacity = '0'; setTimeout(() => elAno.remove(), 900);
        await api.preto(false, 900); await api.esperar(1800);
        await Dialogo.mostrar([T('É aqui que estamos, no presente.')], { nome: nomeJ(), voz: vozJ() });
        C.aquece = false; C.fala = true;
        await Dialogo.mostrar([Tg('Estou tendo a chance da minha vida, maior de idade agora: jogar futebol profissional.'), T('Por isso, eu preciso me destacar nessa peneira. Preciso chamar a atenção dos olheiros.')], { nome: nomeJ(), voz: vozJ(),
          aoLinha: (i) => { if (i === 1 && C.olheiros.length) { C.virar = -Math.PI / 2 + 0.5; C.cam = [0.1, 1.2, -(HALF_W - 2.8), 2.2, 0.6, -(HALF_W + 1.4)]; } } });
        if (C.lucia) {
          C.virar = -Math.PI / 2; C.cam = [-1.3, 3.35, BOARD_Z - 0.25, -2.2, 1.2, BOARD_Z + 1.75];   // por cima do alambrado (2,6 m): nada de tela na frente dela
          await Dialogo.mostrar([T('Ah, e claro que a Lúcia está aqui.')], { nome: nomeJ(), voz: vozJ() });
          await Dialogo.mostrar([Tg('Vai lá, amor! Mostra pra eles quem você é!')], { nome: T('Lúcia Alves'), voz: 0 });
        }
        C.fala = false; C.cam = null; C.virar = null; C.aquece = true;
        await Dialogo.mostrar([T('Bora!')], { nome: nomeJ(), voz: vozJ() });
        Dialogo.esconder();
        await api.preto(true, 800);
        desmontarAquecimento(C); C = null;
        r = await jogarPeneira();
        await api.preto(true, 600);
        // a nota da peneira e as 3 propostas (a carta chega alguns dias depois)
        const score = desempenhoPeneira(r), pers = personalidade(), faixa = faixaPeneira(score, pers);
        P.peneira = { score, nota: r ? +r.nota : 0, gols: r ? r.gols | 0 : 0, ass: r && r.estatisticas ? r.estatisticas.assist | 0 : 0, placar: r ? r.placar : null, venceu: !!(r && r.venceu), pers, faixa, dia: d.dia | 0 };
        P.ofertas = gerarOfertas(faixa, pers, semDe('ofertas|' + score + '|' + (d.dia | 0) + '|' + nomeJ()));
        P.etapa = 'carta';
        api.voltarDaPartida();
        await Dialogo.mostrar([score >= 8 ? Tg('Acho que eu fui muito bem... agora é esperar a resposta dos olheiros.') : score >= 6.5 ? T('Fiz um jogo bom. Agora é torcer para algum olheiro ter gostado.') : T('Não foi o meu melhor dia... mas eu dei tudo o que eu tinha.')], { nome: nomeJ(), voz: vozJ() });
        Dialogo.esconder();
        const el = await anosAvancando(null, null, T('Alguns dias depois...')).catch(() => null);
        d.dia = (d.dia | 0) + 3; d.hora = 10; d.avisouDormir = false;
        clearInterval(trava);
        if (el) setTimeout(() => el.remove(), 2600);
        api.irParaFase2({ cartaPeneira: true, ap: api.apLucia(), namorando: namorando(), trabalhaComLucia: api.empregoEscolhido() === 'cafeteria' && !!dados().confeitaria });
      } catch (e) {
        console.error('[Série B] presente:', e);
        clearInterval(trava);
        if (C) try { desmontarAquecimento(C); } catch (e2) { /* nada */ }
        try { Historia.abortar(); } catch (e2) { /* nada */ }
        try { api.voltarDaPartida(); } catch (e2) { /* nada */ }
        await api.preto(false, 500); M.cena = false; S().modo = 'livre';
      }
    }
    async function jogarPeneira() {
      const eu = { nome: nomeJ(), posicao: posJ(), numero: (typeof PERSONAGEM !== 'undefined' && PERSONAGEM.numero) || 9, aparencia: api.aparenciaNaPartida() };
      const cfg = { campo: 'varzea', times: [timePeneira(0, posJ()), timePeneira(1)], mandante: 0,
        competicao: { tipo: 'amistoso', nome: T('Peneira'), rodada: 0, fase: '', mataMata: false, jogo: 'unico', placarIda: null },
        dificuldade: 'normal', clima: 'seco', gramado: 'baixo', horario: 'dia', duracao: DUR_PENEIRA, usuario: eu, atributos: api.atributosJogador(), taticas: [null, null], formacoes: [null, null] };
      let r = null;
      try { r = await Historia.partida({ cfg, aviso: T('Peneira: Time 1 x Time 2. Mostre o seu futebol para os olheiros!'), aoPronto: () => api.preto(false, 800) }); }
      catch (e) { console.error(e); try { Historia.abortar(); } catch (e2) { /* nada */ } }
      try { Historia.confirmarResultado(); } catch (e) { /* nada */ }
      limparHudPartida();
      return r;
    }

    // ================================================================ A CARREIRA: o calendário, a confiança, os hábitos
    const temp = () => pro().temporada || null;
    const clube = () => TIME_DE[pro().clube];
    const contratado = () => pro().etapa === 'contratado' && !!temp();
    const nomeT = (k) => (TIME_DE[k] ? TIME_DE[k].nome : k);
    function nomeComp(T0, v) {
      if (v.comp === 'liga') return Tf('Série B · Rodada {0} de 38', v.r + 1);
      const C = T0.copas[v.comp], fase = T(NOME_FASE[nFases(C)][v.fase]);
      return (v.comp === 'est' ? Tf('Copa Estadual ({0})', clube().uf) : Tf('Copa Regional {0}', T(NOME_REG[clube().reg]))) + ' · ' + fase;
    }
    function proximaVaga() {
      const T0 = temp(); if (!T0) return null;
      for (let i = T0.fechadas; i < T0.vagas.length; i++) { const v = T0.vagas[i]; if (!v.feito && jogoNosso(T0, v)) return { i, v }; }
      return null;
    }
    function mudarConf(n, motivo) {
      const P = pro(), c0 = P.conf == null ? CONF0 : P.conf, c = clampN(c0 + n, 0, 100);
      P.conf = c; (P.confLog = P.confLog || []).push([dados().dia | 0, n, motivo]); if (P.confLog.length > 40) P.confLog.shift();
      if (c0 < 50 && c >= 50) P.chance = true;                       // chegou em 50: a primeira chance de titular
      return [c0, c];
    }
    // titular ou banco no próximo jogo (e quando entra, se for do banco)
    function escalacao() {
      const P = pro(), c = P.conf == null ? CONF0 : P.conf;
      if (c >= 80) return { titular: true, motivo: 'sempre' };
      if (c >= 50 && (P.manter || P.chance)) return { titular: true, motivo: P.manter ? 'manteve' : 'chance' };
      const r = Math.random();
      return { titular: false, entra: Math.round(c < 35 ? 72 + r * 10 : c < 50 ? 62 + r * 10 : 55 + r * 9) };
    }
    // ---- os HÁBITOS (segunda, quarta, sexta e domingo): treinar, comer saudável, dormir cedo
    const diaDeHabito = (dia) => { const P = pro(); return contratado() && dia > (P.contratoDia | 0) && [0, 2, 4, 6].includes(semanaDe(dia)); };
    function treinouHoje() {
      const d = dados();
      return !!((d.academia && d.academia.treinoDia === d.dia && (d.academia.treinos | 0) > 0) || (d.treinoNonato && d.treinoNonato.hoje && d.treinoNonato.hoje.dia === d.dia && (d.treinoNonato.hoje.n | 0) > 0));
    }
    const comeuSaudavelHoje = () => dados().comeuSaudavelDia === dados().dia;
    function registrarHabitos() {
      const d = dados(), P = pro(); if (!diaDeHabito(d.dia)) return;
      const H = (P.hab = P.hab || {}), h = (H[d.dia] = H[d.dia] || { t: 0, c: 0 });
      if (!h.t && treinouHoje()) h.t = 1;
      if (!h.c && comeuSaudavelHoje()) h.c = 1;
    }
    // avalia os dias de hábito que já passaram (o sono só se sabe ao acordar: d.sono.dia = o dia em que acordou)
    function avaliarHabitos() {
      const d = dados(), P = pro(); if (!contratado()) return;
      if (P.habAval == null) P.habAval = P.contratoDia | 0;
      while (P.habAval < (d.dia | 0) - 0) {
        const H = P.habAval + 1; if (H >= d.dia) break;
        if (!diaDeHabito(H)) { P.habAval = H; continue; }
        const sono = d.sono && d.sono.dia === H + 1 ? !!d.sono.ok : null;
        if (sono === null && agora() < hAbs(H + 1, 12)) break;          // ainda não acordou desse dia (ou não dormiu em casa): espera até o meio-dia
        const h = (P.hab && P.hab[H]) || { t: 0, c: 0 }, s = sono ? 1 : 0;
        const n = (h.t ? 1 : -1) + (h.c ? 1 : -1) + (s ? 1 : -1);
        const [c0, c1] = mudarConf(n, 'habitos');
        M.filaMsg.push(['habitos', { h, s, n, c0, c1 }]);
        P.habAval = H;
        if (P.hab) for (const k of Object.keys(P.hab)) if (+k < H - 6) delete P.hab[k];
      }
    }
    // ---- a MISSÃO do dia: no dia de jogo, o ônibus; nos outros, os hábitos, um depois do outro
    let ultMissao = '';
    function missaoDoDia() {
      const s = S(), d = dados(); if (!contratado() || s.modo !== 'livre' || M.cena) return;
      const nossa = (txt) => !s.missao || s.missao === ultMissao;
      let txt = '';
      const pv = proximaVaga();
      const fora = pv && pv.v.dia === d.dia ? foraDoJogo() : '';
      if (fora && d.hora < pv.v.h + 2) {
        const jn = jogoNosso(temp(), pv.v), adv = jn.c === pro().clube ? jn.f : jn.c;
        txt = Tf('Missão do clube: hoje tem jogo contra o {0}, mas você está {1}. Descanse e se recupere.', nomeT(adv), fora);
      } else if (pv && pv.v.dia === d.dia && d.hora < pv.v.h - ANTES_ONIBUS + 0.5) {
        const jn = jogoNosso(temp(), pv.v), adv = jn.c === pro().clube ? jn.f : jn.c;
        txt = Tf('Missão do clube: jogo contra o {0} às {1}. O ônibus do clube passa no ponto da avenida às {2}.', nomeT(adv), fmt(pv.v.h), fmt(pv.v.h - ANTES_ONIBUS));
        if (!s.dentro) api.definirMarca(api.PONTO.x, api.PONTO.z);
      } else if (diaDeHabito(d.dia)) {
        const h = (pro().hab && pro().hab[d.dia]) || { t: 0, c: 0 };
        txt = !h.t ? T('Missão do clube (1/3): treinar hoje (academia ou CT do Seu Nonato).') : !h.c ? T('Missão do clube (2/3): comer comida saudável (o wrap integral do seu Valdemar).') : T('Missão do clube (3/3): dormir cedo, até as 22h.');
      }
      if (txt && txt !== ultMissao && nossa()) { s.missao = txt; ultMissao = txt; api.mostrarMissao(); }
      else if (!txt && ultMissao && s.missao === ultMissao) { s.missao = ''; ultMissao = ''; try { api.recolherMissao(); } catch (e) { /* nada */ } }
    }
    // ---- SUSPENSO OU MACHUCADO (o histórico de cartões e lesões do motor: 'sb_' + clube, o jogador é CHAVE_VOCE): não joga, o
    //   ônibus não passa e o jogo que ele perde conta como cumprido (sem perder confiança nem receber)
    function fichaVoce() { try { const H = lerHistorico(), t = H.times['sb_' + pro().clube]; return t ? t[CHAVE_VOCE] || null : null; } catch (e) { return null; } }
    function foraDoJogo() {
      const f = fichaVoce(); if (!f) return '';
      if (f.suspenso > 0) return Tgf('suspenso por {0} jogo(s)', f.suspenso);
      if (f.lesao && f.lesao.jogos > 0) return Tgf('machucado por {0} jogo(s)', f.lesao.jogos);
      return '';
    }
    function cumprirFora() {
      try { const H = lerHistorico(), f = fichaDe(H, 'sb_' + pro().clube, CHAVE_VOCE); if (f.suspenso > 0) f.suspenso--; else if (f.lesao && f.lesao.jogos > 0) { f.lesao.jogos--; if (f.lesao.jogos <= 0) f.lesao = null; } salvo.gravar('futebolJs.historico.v1', H); } catch (e) { /* sem histórico */ }
    }
    // ---- fecha as vagas que já passaram (quem não foi: o time joga sem o jogador)
    function fecharVagas() {
      const T0 = temp(); if (!T0 || M.cena) return;
      while (T0.fechadas < T0.vagas.length) {
        const v = T0.vagas[T0.fechadas]; if (agora() < hAbs(v.dia, v.h) + 3) break;
        fecharVaga(T0, T0.fechadas, null);
      }
    }
    // fecha a vaga i: simula o que falta (o nosso jogo com o resultado R, se o jogador jogou) e anda a copa
    function fecharVaga(T0, i, R) {
      const v = T0.vagas[i], P = pro(), nosso = T0.nosso, jn = jogoNosso(T0, v);
      if (v.feito) return;
      const sem = jn && !R ? 0.93 : 1;                                  // sem o jogador: o reserva entra no lugar
      if (v.comp === 'liga') {
        for (const g of T0.liga[v.r]) {
          if (g[2] >= 0) continue;
          const kc = TIMES_B[g[0]].k, kf = TIMES_B[g[1]].k, eNosso = kc === nosso || kf === nosso;
          if (eNosso && R) { g[2] = R.gc; g[3] = R.gf; }
          else { const p = simularPlacar(kc, kf, kc === nosso ? sem : 1, kf === nosso ? sem : 1); g[2] = p[0]; g[3] = p[1]; }
          marcarJogo(T0, kc, eNosso && R && kc === nosso ? R.golsNPC : g[2], g[3]); marcarJogo(T0, kf, eNosso && R && kf === nosso ? R.golsNPC : g[3], g[2]);
        }
      } else {
        const C = T0.copas[v.comp], F = C.fases[v.fase];
        if (F) for (const g of F) {
          if (g.gc >= 0) continue;
          const eNosso = g.c === nosso || g.f === nosso;
          if (eNosso && R) { g.gc = R.gc; g.gf = R.gf; g.pen = R.pen || null; }
          else { const p = simularPlacar(g.c, g.f, g.c === nosso ? sem : 1, g.f === nosso ? sem : 1); g.gc = p[0]; g.gf = p[1]; if (g.gc === g.gf) g.pen = penaltis(g.c, g.f); }
        }
        proximaFase(C);
        if (C.campeao) M.filaMsg.push(['copa', { comp: v.comp, campeao: C.campeao }]);
      }
      v.feito = true; T0.fechadas = Math.max(T0.fechadas, i + 1);
      if (jn && !R) {
        const g = jn.g, nos = jn.liga ? (g[0] === IDX[nosso] ? g[2] : g[3]) : (g.c === nosso ? g.gc : g.gf), eles = jn.liga ? (g[0] === IDX[nosso] ? g[3] : g[2]) : (g.c === nosso ? g.gf : g.gc);
        const fora = foraDoJogo(), adv = jn.c === nosso ? jn.f : jn.c;
        if (fora) { cumprirFora(); M.filaMsg.push(['fora', { adv, nos, eles, fora }]); }   // suspenso/machucado: cumpriu o jogo
        else {                                                           // faltou: o técnico não gostou
          const [c0, c1] = mudarConf(-3, 'faltou'); P.manter = false;
          M.filaMsg.push(['faltou', { adv, nos, eles, c0, c1 }]);
        }
        (P.hist = P.hist || []).push({ i, comp: v.comp, adv, casa: jn.c === nosso, nos, eles, faltou: !fora, fora: !!fora });
      }
      if (T0.fechadas >= T0.vagas.length && P.etapa === 'contratado') { P.etapa = 'fimTemporada'; M.filaMsg.push(['fim', null]); }
    }
    // ---- as mensagens no celular (uma de cada vez, com o jogador livre)
    async function tickMensagens(dt) {
      const s = S(); if (!M.filaMsg.length || s.modo !== 'livre' || M.lendo || M.cena) return;
      if ((M.tMsg -= dt) > 0) return;
      M.lendo = true; const [tipo, x] = M.filaMsg.shift(), tec = clube() ? clube().tecnico : T('Técnico');
      try {
        if (tipo === 'habitos') {
          const ok = (b) => (b ? '✔' : '✘');
          await api.mensagemCelular(tec, Tf('Treino {0} · Comida saudável {1} · Dormiu cedo {2}', ok(x.h.t), ok(x.h.c), ok(x.s)),
            Tf('Confiança do técnico: {0} → {1} ({2}{3})', x.c0, x.c1, x.n >= 0 ? '+' : '', x.n));
        } else if (tipo === 'faltou') await api.mensagemCelular(tec, Tgf('Você não apareceu no ônibus do jogo contra o {0}.', nomeT(x.adv)), Tf('Jogamos sem você: {0} x {1}. Confiança do técnico: {2} → {3}.', x.nos, x.eles, x.c0, x.c1));
        else if (tipo === 'fora') await api.mensagemCelular(tec, Tf('Você estava {0} e não jogou contra o {1}.', x.fora, nomeT(x.adv)), Tf('Resultado: {0} x {1}. Cuida de você, que a vaga te espera.', x.nos, x.eles));
        else if (tipo === 'copa') await api.mensagemCelular(clube().nome, x.campeao === pro().clube ? Tf('SOMOS CAMPEÕES DA {0}!', (x.comp === 'est' ? T('Copa Estadual') : T('Copa Regional')).toUpperCase()) : Tf('O campeão da {0} foi o {1}.', x.comp === 'est' ? T('Copa Estadual') : T('Copa Regional'), nomeT(x.campeao)), '');
        else if (tipo === 'fim') {
          const T0 = temp(), cl = classificacao(T0), pos = cl.findIndex((y) => y.k === T0.nosso) + 1;
          await api.mensagemCelular(clube().nome, pos <= 4 ? Tf('ACESSO! Terminamos a Série B em {0}º lugar e subimos para a Série A!', pos) : Tf('Fim da Série B: terminamos em {0}º lugar.', pos), T('A próxima temporada ainda vai chegar. Descansa, que você merece!'));
        } else if (tipo === 'hoje') await api.mensagemCelular(clube().nome, Tf('Hoje tem jogo! {0} contra o {1}, às {2}.', x.comp, nomeT(x.adv), fmt(x.h)), Tf('O ônibus do clube passa no ponto da avenida às {0}. Não se atrase!', fmt(x.h - ANTES_ONIBUS)));
      } catch (e) { console.warn('[Série B] mensagem:', e); }
      M.lendo = false; M.tMsg = 2.5; gravar();
    }
    function avisarJogoDeHoje() {
      const d = dados(), P = pro(), pv = proximaVaga(); if (!pv || pv.v.dia !== d.dia || d.hora < 6.5) return;
      if (P.avisouDia === d.dia || foraDoJogo()) return; P.avisouDia = d.dia;
      const jn = jogoNosso(temp(), pv.v);
      M.filaMsg.push(['hoje', { comp: nomeComp(temp(), pv.v), adv: jn.c === P.clube ? jn.f : jn.c, h: pv.v.h }]);
    }

    // ================================================================ O ÔNIBUS DO CLUBE
    //   Vem do oeste pela pista sul (a mão de quem vai para o leste, a do ponto), para com a porta da frente na frente do ponto e
    //   espera; os carros de trás freiam (S.atoresExtra) e ele freia para o carro da frente. Sai para o leste.
    const PISTA_Z = 4.6, PORTA_X = 3.7, X_ENTRA = -180, X_SAI = 290;
    const xParada = () => api.PONTO.x - PORTA_X;
    function texLateral(t) {
      const cv = document.createElement('canvas'); cv.width = 256; cv.height = 64; const g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      g.fillStyle = t.uni[0]; g.fillRect(0, 0, 256, 64);
      g.fillStyle = t.uni[1]; g.beginPath(); g.moveTo(0, 46); g.lineTo(256, 26); g.lineTo(256, 40); g.lineTo(0, 60); g.closePath(); g.fill();
      g.fillStyle = t.uni[2] === t.uni[0] ? t.uni[3] : t.uni[2]; g.fillRect(0, 60, 256, 4);
      g.drawImage(arte(t.k), 8, 6, 44, 44);
      g.font = 'bold 15px monospace'; g.textBaseline = 'middle'; g.fillStyle = corDist2(t.uni[0], '#ffffff') < 160 ? '#1c1c1f' : '#ffffff';
      g.fillText(t.nome.toUpperCase(), 60, 20, 190);
      g.font = 'bold 9px monospace'; g.fillText(T('DELEGAÇÃO OFICIAL'), 60, 36, 190);
      const tex = new THREE.CanvasTexture(cv); tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearFilter; tex.generateMipmaps = false;
      return tex;
    }
    function corDist2(a, b) { const h = (c) => [1, 3, 5].map((i) => parseInt(String(c).slice(i, i + 2), 16)); const A = h(a), B = h(b); return Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]); }
    function modeloOnibus(t) {
      const G = new api.Geo(), c0 = t.uni[0], c1 = t.uni[1], vid = '#22303c', L = 11, W = 2.5;
      G.box(L - 0.3, 0.4, W - 0.1, '#2a2a30', 0, 0.3, 0);                          // chassi
      G.box(L, 1.15, W, c0, 0, 0.55, 0);                                           // lataria de baixo (0,55 a 1,7)
      G.box(L - 0.4, 0.92, W + 0.02, vid, -0.2, 1.7, 0);                           // faixa das janelas
      for (let x = -L / 2 + 0.4; x < L / 2 - 1.2; x += 1.55) G.box(0.12, 0.92, W + 0.04, c0, x, 1.7, 0);   // colunas
      G.box(L, 0.32, W, c0, 0, 2.62, 0);                                           // teto
      G.box(2.6, 0.26, 1.5, '#d8d8d0', -1.4, 2.94, 0);                             // ar-condicionado
      G.box(L + 0.02, 0.18, W + 0.03, c1, 0, 1.36, 0);                             // a faixa da segunda cor
      G.box(0.06, 1.25, W - 0.24, vid, L / 2 + 0.01, 1.45, 0);                     // para-brisa
      G.box(0.06, 0.3, 1.9, '#1c1c1f', L / 2 + 0.02, 2.63, 0);                     // letreiro
      G.box(0.06, 0.12, 1.5, '#f2a020', L / 2 + 0.05, 2.72, 0);
      for (const z of [-0.85, 0.85]) { G.box(0.06, 0.18, 0.42, '#fff6c8', L / 2 + 0.03, 0.78, z); G.box(0.06, 0.2, 0.3, '#c8302a', -L / 2 - 0.03, 0.85, z); }
      G.box(0.16, 0.26, W + 0.06, '#3a3a3e', L / 2 + 0.06, 0.42, 0); G.box(0.16, 0.26, W + 0.06, '#3a3a3e', -L / 2 - 0.06, 0.42, 0);   // para-choques
      G.box(1.05, 2.05, 0.04, vid, PORTA_X, 0.5, W / 2 + 0.02);                    // a porta da frente (lado do meio-fio)
      G.box(0.06, 2.05, 0.05, '#9aa1ab', PORTA_X, 0.5, W / 2 + 0.03);
      for (const [x, z] of [[3.5, 1.1], [3.5, -1.1], [-3.4, 1.1], [-3.4, -1.1]]) { G.box(0.95, 0.95, 0.32, '#1c1c1f', x, 0, z); G.box(0.42, 0.42, 0.34, '#9a9a9a', x, 0.27, z); }
      const raiz = new THREE.Group(), corpo = G.malha(api.MAT); raiz.add(corpo);
      const tex = texLateral(t), mat = new THREE.MeshLambertMaterial({ map: tex });
      for (const s of [1, -1]) {
        const pl = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 1.1), mat);
        pl.position.set(s > 0 ? -1.6 : -1.6, 1.12, s * (W / 2 + 0.03)); pl.rotation.y = s > 0 ? 0 : Math.PI;
        if (s < 0) pl.scale.x = 1;
        raiz.add(pl);
      }
      const sombra = new THREE.Mesh(new THREE.PlaneGeometry(L + 0.6, W + 0.4), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.28, depthWrite: false }));
      sombra.rotation.x = -Math.PI / 2; sombra.position.y = 0.03; raiz.add(sombra);
      raiz.userData.descartar = () => { raiz.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material && o.material !== api.MAT) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); } }); };
      return raiz;
    }
    function criarOnibus(estado, x) {
      const s = S(), t = clube(); if (!t || !s.grupo) return null;
      const m = modeloOnibus(t); s.grupo.add(m);
      const O = { m, x: x != null ? x : X_ENTRA, v: estado === 'parado' ? 0 : 11, estado, t: 0, obst: [{ x: 0, z: PISTA_Z }, { x: 0, z: PISTA_Z }, { x: 0, z: PISTA_Z }] };
      s.atoresExtra = s.atoresExtra || []; for (const o of O.obst) s.atoresExtra.push(o);
      posOnibus(O); M.onibus = O; return O;
    }
    function tirarOnibus() {
      const O = M.onibus; if (!O) return; const s = S();
      if (O.m.parent) O.m.parent.remove(O.m); O.m.userData.descartar();
      if (s.atoresExtra) s.atoresExtra = s.atoresExtra.filter((a) => !O.obst.includes(a));
      M.onibus = null;
    }
    function posOnibus(O) {
      O.m.position.set(O.x, api.altura ? 0 : 0, PISTA_Z);
      O.obst[0].x = O.x - 5.2; O.obst[1].x = O.x; O.obst[2].x = O.x + 5.2;
    }
    function tickOnibus(dt) {
      const O = M.onibus; if (!O) return; const s = S();
      O.t += dt;
      let folga = 1e9;                                                      // o carro da frente na mesma pista
      for (const c of s.carros || []) if (c.ativo && Math.abs(c.z - PISTA_Z) < 0.5 && c.x > O.x) folga = Math.min(folga, c.x - O.x - 5.5 - 2.3);
      if (O.estado === 'chegando') {
        const resta = xParada() - O.x;
        let alvo = Math.min(11, Math.sqrt(Math.max(0, resta) * 2 * 1.6) + 0.4);
        if (folga < 8) alvo = Math.min(alvo, Math.max(0, folga - 2));
        O.v += clampN(alvo - O.v, -4 * dt, 2.5 * dt); O.x += O.v * dt;
        if (resta <= 0.05 || (resta < 0.6 && O.v < 0.5)) { O.x = xParada(); O.v = 0; O.estado = 'parado'; O.t = 0; }
      } else if (O.estado === 'saindo') {
        let alvo = 12; if (folga < 10) alvo = Math.max(0, folga - 3);
        O.v += clampN(alvo - O.v, -5 * dt, 2.2 * dt); O.x += O.v * dt;
        if (O.x > X_SAI) { tirarOnibus(); return; }
      }
      posOnibus(O);
      // no ponto: espera até 20 min depois do horário (mais um pouco se o jogador estiver chegando); sem ele, vai embora
      if (O.estado === 'parado' && !O.levando && !M.cena) {
        const pv = proximaVaga(), d = dados(), J = s.jog;
        const hb = pv && pv.v.dia === d.dia ? pv.v.h - ANTES_ONIBUS : -99, perto = J && Math.hypot(J.x - api.PONTO.x, J.z - api.PONTO.z) < 14;
        if (!pv || d.hora > hb + (perto ? 0.55 : 0.33)) { O.estado = 'saindo'; O.v = 0; }
      }
    }
    function controlarOnibus() {
      const d = dados(), pv = proximaVaga(); if (M.cena || !contratado()) return;
      if (!pv || pv.v.dia !== d.dia || foraDoJogo()) return;
      const hb = pv.v.h - ANTES_ONIBUS;
      if (!M.onibus && d.hora >= hb - 0.4 && d.hora < hb + 0.2) criarOnibus('chegando');
    }
    // ---- os alvos: esperar o ônibus no ponto e entrar nele
    function alvos(v) {
      const s = S(); if (s.dentro || M.cena || !contratado()) return;
      const d = dados(), pv = proximaVaga(), O = M.onibus;
      if (O && O.estado === 'parado' && pv && pv.v.dia === d.dia) {
        v.push({ x: api.PONTO.x, z: api.PONTO.z - 1.4, r: 3.2, txt: Tf('Entrar no ônibus do {0}', clube().nome), fn: () => embarcar(pv), y: 2.6, pri: true });
        return;
      }
      if (pv && pv.v.dia === d.dia) {
        const hb = pv.v.h - ANTES_ONIBUS;
        if (d.hora >= hb - 2.5 && d.hora < hb - 0.45) v.push({ x: api.PONTO.x, z: api.PONTO.z, r: 2.4, txt: Tf('Esperar o ônibus do clube (passa às {0})', fmt(hb)), fn: () => esperarOnibus(hb), y: 2.6, pri: true });
      }
    }
    async function esperarOnibus(hb) {
      const s = S(), d = dados(), h = hb - 0.42 - d.hora; if (h <= 0) return;
      await api.preto(true, 500);
      try { api.tickHorario(h / api.H_POR_S); } catch (e) { d.hora = hb - 0.42; }
      await api.preto(false, 500);
      void s;
    }

    // ================================================================ O DIA DE JOGO: ônibus → pré-jogo → (banco) → partida → pós-jogo → volta
    async function embarcar(pv) {
      const s = S(), J = s.jog, O = M.onibus; if (!O || M.cena) return;
      M.cena = true; O.levando = true;
      const trava = travar(); api.definirMarca(null);
      if (/^Missão do clube|^Club mission|^Misión del club|^Missione del club|^Mission du club/.test(s.missao || '')) { s.missao = ''; ultMissao = ''; }
      let res = null;
      try {
        if (J.sentado && api.levantar) { try { api.levantar(); } catch (e) { /* nada */ } }
        api.camCena({ px: api.PONTO.x + 6.5, py: 2.6, pz: api.PONTO.z + 4.2, tx: api.PONTO.x - 1.5, ty: 1.1, tz: PISTA_Z });
        const rota = [];                                                   // atrás do abrigo: dá a volta por fora (sem atravessar o vidro nem o poste)
        if (J.z > 9.2) rota.push([J.x < api.PONTO.x ? api.PONTO.x - 2.3 : api.PONTO.x + 2.9, J.z], [J.x < api.PONTO.x ? api.PONTO.x - 2.3 : api.PONTO.x + 2.9, 7.6]);
        rota.push([api.PONTO.x + 0.2, 7.2], [api.PONTO.x, 6.55]);
        await api.andar(J, rota, 1.7);
        J.yawAlvo = -Math.PI / 2; await api.esperar(350);
        s.meus.delete(J.m); J.m.raiz.visible = false;
        await api.esperar(700);
        O.estado = 'saindo'; O.v = 0;
        await api.esperar(2600);
        await api.preto(true, 800);
        tirarOnibus();
        res = await partidaDoDia(pv);
      } catch (e) {
        console.error('[Série B] dia de jogo:', e);
        try { Historia.abortar(); } catch (e2) { /* nada */ }
      } finally {
        tirarOnibus();
        try { api.voltarDaPartida(); } catch (e) { /* nada */ }
        const d = dados(); d.hora = Math.max(d.hora, pv.v.h + VOLTA_DEPOIS);
        // a volta: o ônibus deixa o jogador no ponto, à noite, e vai embora
        J.sentado = false; J.rota = null; J.x = api.PONTO.x + 0.3; J.z = 6.75; J.y = 0; J.yaw = J.yawAlvo = Math.PI / 2;
        s.meus.add(J.m); J.m.raiz.visible = true;
        const O2 = criarOnibus('parado', xParada()); if (O2) O2.levando = true;
        api.camCena({ px: api.PONTO.x + 6.5, py: 2.6, pz: api.PONTO.z + 4.2, tx: api.PONTO.x - 1.5, ty: 1.1, tz: PISTA_Z });
        clearInterval(trava);
        await api.preto(false, 700);
        await api.andar(J, [[api.PONTO.x + 0.6, 7.6]], 1.5);
        if (O2) { O2.estado = 'saindo'; O2.v = 0; }
        await api.esperar(1400);
        s.camCena = null; M.cena = false;
        gravar();
        if (res && res.pagamento) { try { api.somDinheiro(); api.ganhoNaTela(res.pagamento); api.mostrarDinheiro(); } catch (e) { /* nada */ } }
      }
    }
    function cfgJogo(v, jn, o) {
      const P = pro(), nosso = P.clube, adv = jn.c === nosso ? jn.f : jn.c, casa = jn.c === nosso;
      const eu = { nome: nomeJ(), posicao: posJ(), numero: (typeof PERSONAGEM !== 'undefined' && PERSONAGEM.numero) || 9, aparencia: api.aparenciaNaPartida() };
      const tA = timeMotor(TIME_DE[nosso], { voce: posJ() }), tB = timeMotor(TIME_DE[adv]);
      const mand = casa ? nosso : adv; (casa ? tA : tB).torcidaB = popularidade.ocupacao(mand);
      tA.popularidade = popularidade.valor(nosso) / 100; tB.popularidade = popularidade.valor(adv) / 100;
      const h = v.h, horario = h < 15.5 ? 'dia' : h < 18.4 ? 'tarde' : 'noite';
      const copa = v.comp !== 'liga';
      return { campo: 'serieB', times: [tA, tB], mandante: casa ? 0 : 1,
        competicao: { tipo: copa ? 'copa' : 'liga', nome: copa ? nomeComp(temp(), v).split(' · ')[0] : T('Série B'), rodada: copa ? 0 : v.r + 1, fase: copa ? T(NOME_FASE[nFases(temp().copas[v.comp])][v.fase]) : '', mataMata: copa, jogo: 'unico', placarIda: null },
        dificuldade: 'normal', clima: Math.random() < 0.15 ? 'chuva' : 'seco', gramado: 'baixo', horario, duracao: o.duracao, usuario: eu, atributos: api.atributosJogador(), taticas: [null, null], formacoes: [null, null] };
    }
    // ---- A FESTA: o título no gramado (copas e Série B) e a noite dos prêmios da Série B
    const vozJog = () => (typeof PERSONAGEM !== 'undefined' && typeof PERSONAGEM.voz === 'number' ? PERSONAGEM.voz : 2);
    function jogadoresDaFesta() {                                       // os 11 do nosso time, com o jogador no lugar do titular da posição dele
      const t = TIME_DE[pro().clube], E = elencoB(t).slice(0, 11), pos = posJ(), meu = (typeof PERSONAGEM !== 'undefined' && PERSONAGEM.numero) || 9;
      let iu = E.findIndex((j) => j.pos === pos); if (iu < 0) iu = E.length - 1;
      const livres = [2, 3, 4, 5, 6, 7, 8, 10, 11, 9, 14, 15].filter((n) => n !== meu);
      return E.map((j, i) => (i === iu ? Object.assign({}, api.aparenciaNaPartida(), { numero: meu, nomeCamisa: (typeof PERSONAGEM !== 'undefined' && PERSONAGEM.nomeCamisa) || '', voce: true, gk: j.pos === 'GK' })
        : Object.assign({}, j, { numero: j.pos === 'GK' ? 1 : livres.shift(), gk: j.pos === 'GK' })));
    }
    async function festaTitulo(trofeu, cfg) {                           // a tela já está preta e a cidade escondida
      try {
        const F = await Fases.carregar('festa'), t = TIME_DE[pro().clube], tm = timeMotor(t);
        await F.campeao({ cfg, lado: -1, uni: Object.assign({}, tm.uniforme, { emblema: tm.emblema }), jogadores: jogadoresDaFesta(), trofeu, cores: [t.uni[0], t.uni[1]], io: { preto: api.preto, esperar: api.esperar } });
      } catch (e) { console.error('[Série B] festa do título:', e); }
    }
    function premiosDaFesta(T0) {
      const P = premiosSerieB(T0), out = [];
      for (const tipo of ['art', 'ass', 'melhor']) {
        const x = P[tipo]; if (!x || !TIME_DE[x.k]) continue;
        const voce = x.n === '__voce', t = TIME_DE[x.k];
        const ap = voce ? Object.assign({ genero: PERSONAGEM.genero === 'F' ? 'F' : 'M' }, PERSONAGEM.aparencia || {}) : Object.assign({}, (t.pequeno ? [] : elencoB(t)).find((j) => j.nome === x.n) || (typeof gerarAparencia === 'function' ? gerarAparencia(semDe('sb|' + x.k + '|' + x.n), 'M') : {}));
        out.push({ tipo, nome: voce ? nomeJ() : x.n, time: t.nome, ap, voce, v: x.v, voz: voce ? vozJog() : 3 });
      }
      return out;
    }
    async function cenaFimTemporada() {                                 // fim da Série B: a festa do título (se não teve no último jogo) e a noite dos prêmios
      const s = S(), P = pro(), T0 = temp(), d = dados(); if (M.cena || !T0) return;
      M.cena = true; const trava = travar(); P.galaVista = true;
      try {
        await api.preto(true, 700);
        api.sairParaPartida();
        if (classificacao(T0)[0].k === T0.nosso && !P.comemorou) {
          P.comemorou = true;
          const v = T0.vagas.filter((x) => x.comp === 'liga').pop(), jn = v && jogoNosso(T0, v);
          if (jn) await festaTitulo('serieb', cfgJogo(v, jn, {}));
        }
        const lista = premiosDaFesta(T0), meus = lista.filter((x) => x.voce).length;
        if (meus && !P.pagoPremios) { P.pagoPremios = true; d.fakes = (d.fakes | 0) + meus * PREMIO_IND_B; }
        if (lista.length) {
          const F = await Fases.carregar('festa');
          await F.gala({ nivel: 'serieb', titulo: T('PRÊMIOS DA SÉRIE B'), premios: lista,
            io: { preto: api.preto, esperar: api.esperar, ganho: () => { try { api.somDinheiro(); api.ganhoNaTela(PREMIO_IND_B); } catch (e) { /* nada */ } } } });
        }
      } catch (e) { console.error('[Série B] fim da temporada:', e); }
      finally {
        try { api.voltarDaPartida(); if (P.pagoPremios) api.mostrarDinheiro(); } catch (e) { /* nada */ }
        clearInterval(trava); M.cena = false; try { Dialogo.esconder(); } catch (e) { /* nada */ }
        gravar();
        await api.preto(false, 700); if (s.ativo && s.modo === 'cena') api.liberar();
      }
    }
    async function partidaDoDia(pv) {
      const v = pv.v, T0 = temp(), jn = jogoNosso(T0, v), P = pro(), d = dados(), nosso = P.clube, adv = jn.c === nosso ? jn.f : jn.c;
      d.hora = Math.max(d.hora, v.h - 0.3);
      api.sairParaPartida();
      const esc = escalacao();
      await telaPreJogo(v, jn, esc);
      let sim = { placar: [0, 0], gols: [], min: 0 };
      if (!esc.titular) sim = await assistirDoBanco(v, jn, esc.entra);
      const duracao = esc.titular ? DUR_JOGO : Math.max(80, Math.round(DUR_JOGO * (90 - esc.entra) / 90));
      const cfg = cfgJogo(v, jn, { duracao });
      if (!esc.titular) cfg.competicao.nome = cfg.competicao.nome + ' · ' + Tf('você entra aos {0}\'', esc.entra);
      let r = null;
      try {
        r = await Historia.partida({ cfg, aviso: esc.titular ? Tf('{0} x {1}: você começa jogando!', TIME_DE[jn.c].sigla, TIME_DE[jn.f].sigla) : Tf('Substituição: você entra aos {0}\'!', esc.entra),
          aoPronto: () => { if (!esc.titular) { G.score[0] = sim.placar[0]; G.score[1] = sim.placar[1]; } return api.preto(false, 800); } });
      } catch (e) { console.error(e); try { Historia.abortar(); } catch (e2) { /* nada */ } }
      await api.preto(true, 800);
      try { Historia.confirmarResultado(); } catch (e) { /* nada */ }
      limparHudPartida();
      const res = registrarJogo(pv, jn, esc, sim, r);
      if (r) {                                                           // título decidido neste jogo: a festa no gramado antes da tela do pós-jogo
        const T1 = temp(), C = v.comp !== 'liga' ? T1.copas[v.comp] : null;
        if (C && C.campeao === nosso && v.fase === nFases(C) - 1) await festaTitulo(v.comp === 'est' ? 'estadual' : 'regional', cfgJogo(v, jn, {}));
        else if (!C && T1.fechadas >= T1.vagas.length && classificacao(T1)[0].k === nosso && !P.comemorou) { P.comemorou = true; await festaTitulo('serieb', cfgJogo(v, jn, {})); }
        limparHudPartida();
      }
      await telaPosJogo(res);
      return res;
    }
    // o que fica do jogo: placar, nota, confiança, pagamento, a rodada fechada
    function registrarJogo(pv, jn, esc, sim, r) {
      const v = pv.v, T0 = temp(), P = pro(), d = dados(), nosso = P.clube, adv = jn.c === nosso ? jn.f : jn.c, casa = jn.c === nosso;
      const pl = r && r.placar ? r.placar : sim.placar, nos = pl[0], eles = pl[1];
      const st = (r && r.estatisticas) || {}, gols = r ? r.gols | 0 : 0, ass = st.assist | 0, nota = r ? +r.nota || 6 : 5;
      let pen = r && r.penaltis ? r.penaltis.slice() : null;
      if (!pen && v.comp !== 'liga' && nos === eles) { const p = penaltis(nosso, adv); pen = p; }   // mata-mata empatado que acabou sem os pênaltis no motor: decide aqui
      const R = { gc: casa ? nos : eles, gf: casa ? eles : nos, pen: pen ? (casa ? pen : [pen[1], pen[0]]) : null, golsNPC: Math.max(0, nos - gols) };
      for (let k0 = T0.fechadas; k0 < pv.i; k0++) fecharVaga(T0, k0, null);   // vagas de antes sem jogo nosso (copa em que já caímos)
      fecharVaga(T0, pv.i, R);
      const k = nosso + '|__voce', ek = (T0.est[k] = T0.est[k] || [0, 0, 0, 0]);
      if (v.comp === 'liga') { ek[0] += gols; ek[1] += ass; if (r) { ek[2] = (ek[2] | 0) + 1; ek[3] = r1((ek[3] || 0) + nota); } }
      const venceu = pen ? pen[0] > pen[1] : nos > eles, empate = !pen && nos === eles;
      const minJogados = esc.titular ? 90 : 90 - esc.entra, bom = nota >= (minJogados >= 45 ? 7 : 6.5) && !(r && r.expulso);   // quem entrou no fim tem pouco tempo: 6,5 já é um jogo bom
      const [c0, c1] = mudarConf(bom ? 3 : -3, bom ? 'jogo bom' : 'jogo ruim');
      if (esc.titular) { P.chance = false; P.manter = c1 < 80 ? nota >= 8 : true; }
      else if (c1 >= 50 && nota >= 8) P.chance = true;
      const C = P.contrato || {}, pag = { base: (C.base | 0) + (C.extra | 0), gol: gols * (C.gol | 0), ass: ass * (C.ass | 0), vit: venceu ? (C.vit | 0) : 0 };
      pag.total = pag.base + pag.gol + pag.ass + pag.vit; d.fakes = (d.fakes | 0) + pag.total; P.ganhos = (P.ganhos | 0) + pag.total;
      const E = (P.est = P.est || { j: 0, tit: 0, g: 0, a: 0, nota: 0, bons: 0, min: 0, v: 0 });
      const min = esc.titular ? 90 : 90 - esc.entra;
      E.j++; if (esc.titular) E.tit++; E.g += gols; E.a += ass; E.nota = r1(E.nota + nota); if (bom) E.bons++; E.min += min; if (venceu) E.v++;
      (P.hist = P.hist || []).push({ i: pv.i, comp: v.comp, adv, casa, nos, eles, pen, nota, g: gols, a: ass, tit: esc.titular, min });
      if (P.hist.length > 60) P.hist.shift();
      try { const K = api.carreira(); K.pro = K.pro || { j: 0, g: 0, a: 0, bons: 0 }; K.pro.j++; K.pro.g += gols; K.pro.a += ass; if (nota >= 8) K.pro.bons++; } catch (e) { /* nada */ }
      gravar();
      return { v, jn, adv, casa, nos, eles, pen, nota, gols, ass, venceu, empate, bom, c0, c1, esc, pag, pagamento: pag.total, min, expulso: !!(r && r.expulso), semJogo: !r };
    }

    // ================================================================ AS TELAS (pré-jogo, banco, pós-jogo)
    function cssSb() {
      if (document.getElementById('sbCss')) return;
      const st = document.createElement('style'); st.id = 'sbCss';
      st.textContent = `
.sbTela{position:fixed;inset:0;z-index:40;display:flex;align-items:center;justify-content:center;background:radial-gradient(ellipse at 50% 40%,#1d2a1c,#0c120b);color:#f4efe2;font:600 12px/1.3 var(--font-body,monospace);padding:calc(8px + env(safe-area-inset-top,0px)) max(14px,env(safe-area-inset-right,0px)) calc(8px + env(safe-area-inset-bottom,0px)) max(14px,env(safe-area-inset-left,0px));box-sizing:border-box}
.sbCaixa{width:min(720px,100%);max-height:100%;overflow:auto;background:#1a1410;border:3px solid #f2c230;box-shadow:0 6px 0 rgba(0,0,0,.5);padding:10px 14px;box-sizing:border-box;display:flex;flex-direction:column;gap:8px}
.sbComp{font:700 12px/1 var(--font-display,monospace);letter-spacing:.08em;color:#f2c230;text-transform:uppercase;text-align:center}
.sbVs{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:10px}
.sbLado{display:flex;flex-direction:column;align-items:center;gap:3px;text-align:center;min-width:0}
.sbLado img{width:64px;height:64px;image-rendering:pixelated}.sbLado b{font:700 13px/1.1 var(--font-display,monospace)}
.sbLado small{opacity:.8;font-size:10px}.sbEst{color:#f2c230;letter-spacing:1px}
.sbPlacar{font:700 34px/1 var(--font-display,monospace);letter-spacing:.06em;color:#fff}.sbX{font:700 16px/1 var(--font-display,monospace);color:#f2c230}
.sbInfo{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.sbCard{background:#241b12;border:2px solid #4a3622;padding:7px 9px;display:flex;flex-direction:column;gap:4px;min-width:0}
.sbCard h4{margin:0;font:700 11px/1.1 var(--font-display,monospace);color:#f2c230;letter-spacing:.05em;text-transform:uppercase}
.sbCard p{margin:0;font-size:11px}.sbTag{display:inline-block;font:700 11px/1 var(--font-display,monospace);padding:4px 7px;border:2px solid #000;background:#8fd16a;color:#10200a}
.sbTag.banco{background:#c9d2e6;color:#1a1f2c}
.sbBarra{position:relative;height:12px;background:#3a2c1e;border:2px solid #000}.sbBarra b{position:absolute;left:0;top:0;bottom:0;background:#f2c230}
.sbBarra i{position:absolute;top:-3px;bottom:-3px;width:2px;background:#fff;opacity:.7}
.sbLeg{display:flex;justify-content:space-between;font-size:9px;opacity:.75}
.sbBtn{align-self:center;min-width:180px;height:40px;font:700 13px/1 var(--font-display,monospace);letter-spacing:.06em;background:#f2c230;color:#2a1206;border:3px solid #2a1206;box-shadow:0 3px 0 #000;cursor:pointer;text-transform:uppercase}
.sbLista{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:1px;font-size:10.5px}
.sbLista.duas{display:grid;grid-template-columns:1fr 1fr;column-gap:10px}.sbLista li{display:flex;justify-content:space-between;gap:6px}
.sbLista li.nos{color:#f2c230;font-weight:700}
.sbTicker{position:fixed;z-index:39;left:50%;top:calc(10px + env(safe-area-inset-top,0px));transform:translateX(-50%);width:min(520px,calc(100% - 28px));background:rgba(20,16,12,.9);border:3px solid #f2c230;color:#f4efe2;padding:7px 10px;box-sizing:border-box;font:600 12px/1.3 var(--font-body,monospace)}
.sbTicker .t1{display:flex;justify-content:space-between;align-items:center;font:700 13px/1 var(--font-display,monospace)}
.sbTicker .t1 img{width:22px;height:22px;image-rendering:pixelated;vertical-align:middle}
.sbTicker .t2{margin-top:5px;min-height:15px;font-size:11px;color:#f2c230}
@media (max-height:420px){.sbLado img{width:40px;height:40px}.sbLado small{display:none}.sbPlacar{font-size:26px}.sbCaixa{gap:5px;padding:7px 12px}.sbCard{padding:5px 8px;gap:2px}.sbBtn{height:34px}.sbComp{font-size:11px}}
`;
      document.head.appendChild(st);
    }
    function barraConf(c) {
      return '<div class="sbBarra"><b style="width:' + c + '%"></b><i style="left:50%"></i><i style="left:80%"></i></div><div class="sbLeg"><span>0</span><span>' + escH(T('50: chance de titular')) + '</span><span>' + escH(T('80: sempre titular')) + '</span></div>';
    }
    const ladoHtml = (k, etq, casa) => '<div class="sbLado"><img src="' + urlArte(k) + '" alt=""><b>' + escH(nomeT(k)) + '</b><span class="sbEst">' + estrelasTxt(TIME_DE[k].estrelas || 1) + '</span><small>' + escH(etq) + '</small></div>';
    function telaPreJogo(v, jn, esc) {
      cssSb();
      return new Promise((ok) => {
        const P = pro(), c = P.conf == null ? CONF0 : P.conf, T0 = temp(), tec = clube().tecnico;
        const fala = esc.titular ? (esc.motivo === 'sempre' ? T('Você é peça fundamental. Vai pra cima deles!') : esc.motivo === 'manteve' ? Tg('Você foi muito bem no último jogo: continua no time titular.') : T('Eu estou de olho no seu esforço: hoje você começa jogando. Não me decepcione!'))
          : c < 35 ? T('Fica no banco e presta atenção no jogo. Se precisar, eu te chamo no fim.') : T('Começa no banco. No segundo tempo eu vou precisar de você.');
        const el = document.createElement('div'); el.className = 'sbTela';
        el.innerHTML = '<div class="sbCaixa"><div class="sbComp">' + escH(nomeComp(T0, v)) + ' · ' + escH(T(DIAS[semanaDe(v.dia)])) + ' ' + escH(fmt(v.h)) + '</div>'
          + '<div class="sbVs">' + ladoHtml(jn.c, T('CASA')) + '<span class="sbX">X</span>' + ladoHtml(jn.f, T('FORA')) + '</div>'
          + '<div class="sbInfo"><div class="sbCard"><h4>' + escH(T('Você')) + '</h4><p><span class="sbTag' + (esc.titular ? '' : ' banco') + '">' + escH(esc.titular ? T('TITULAR') : T('NO BANCO')) + '</span></p>'
          + '<p>' + escH(esc.titular ? T('Você joga os 90 minutos.') : Tf('O técnico deve te colocar por volta dos {0} minutos.', esc.entra)) + '</p></div>'
          + '<div class="sbCard"><h4>' + escH(Tf('Confiança do técnico: {0}/100', c)) + '</h4>' + barraConf(c) + '</div></div>'
          + '<div class="sbCard"><h4>' + escH(tec) + '</h4><p>“' + escH(fala) + '”</p></div>'
          + '<button type="button" class="sbBtn">' + escH(esc.titular ? T('Jogar ▶') : T('Ir para o banco ▶')) + '</button></div>';
        (document.getElementById('raizJogo') || document.body).appendChild(el);
        api.preto(false, 300);
        el.querySelector('button').onclick = async () => { el.querySelector('button').disabled = true; await api.preto(true, 400); el.remove(); ok(); };
      });
    }
    // ---- O BANCO: o estádio de verdade, a câmera nos reservas (o jogador sentado entre eles) e o placar correndo em cima
    async function assistirDoBanco(v, jn, entra) {
      cssSb();
      const P = pro(), nosso = P.clube, adv = jn.c === nosso ? jn.f : jn.c, casa = jn.c === nosso;
      const cfg = cfgJogo(v, jn, { duracao: DUR_JOGO });
      montarPartida(cfg); kickoff(0); G.state = 'menu'; snapCamera();
      // o jogador no lugar do meio do banco do nosso time (o reserva que estava ali sai)
      let eu = null;
      try {
        const i = reservasBanco.findIndex((x) => x.team === 0 && x.assento === 2);
        if (i >= 0) { descartarBoneco(reservasBanco[i].mesh.raiz); reservasBanco.splice(i, 1); }
        const a = assentoBanco(0, 2), ap = api.aparenciaNaPartida();
        eu = { team: 0, j: ap, assento: 2, saiu: true, mesh: bonecoDoBanco(PARTIDA, 0, Object.assign({ nome: nomeJ(), nomeCamisa: (typeof PERSONAGEM !== 'undefined' && PERSONAGEM.nomeCamisa) || '' }, ap), posJ(), (typeof PERSONAGEM !== 'undefined' && PERSONAGEM.numero) || 9, true), x: a.x, z: a.z, ang: Math.PI / 2, sentado: 1, pose: 'joelhos', anim: 0, fase: 0 };
        reservasBanco.push(eu);
        if (eu.mesh.etiqueta) eu.mesh.etiqueta.visible = true;            // o nome em cima: dá para achar o jogador no meio dos reservas
      } catch (e) { console.warn('[Série B] banco:', e); }
      const a = assentoBanco(0, 2), noBanco = new Set(reservasBanco.map((x) => x.mesh));
      GANCHO_RENDER = () => {
        for (const A of ATLETAS) A.raiz.visible = noBanco.has(A);
        ball.mesh.visible = ball.shadow.visible = false; userRing.visible = targetRing.visible = dribbleRing.visible = aimArrow.visible = false;
        const t = performance.now() / 1000;
        camera.position.set(a.x + 2.2 + Math.sin(t * 0.15) * 0.3, 1.6, a.z + 5.2); camera.lookAt(a.x - 0.2, 1.0, a.z);
      };
      // o placar correndo: um minuto simulado a cada 80 ms, gols pela força dos dois times (o nosso sem o jogador)
      const el = document.createElement('div'); el.className = 'sbTicker';
      const sig = (k) => TIME_DE[k].sigla, img = (k) => '<img src="' + urlArte(k) + '" alt="">';
      el.innerHTML = '<div class="t1"><span>' + img(jn.c) + ' ' + escH(sig(jn.c)) + '</span><span class="pl">0 x 0</span><span>' + escH(sig(jn.f)) + ' ' + img(jn.f) + '</span><span class="mn">0\'</span></div><div class="t2">' + escH(T('Você está no banco. Acompanhe o jogo...')) + '</div>';
      (document.getElementById('raizJogo') || document.body).appendChild(el);
      await api.preto(false, 500);
      const pc = poder(jn.c, jn.c === nosso ? 0.95 : 1), pf = poder(jn.f, jn.f === nosso ? 0.95 : 1);
      const lc = lambda(pc.at, pf.df, true) / 90, lf = lambda(pf.at, pc.df, false) / 90;
      const pl = [0, 0], t2 = el.querySelector('.t2'), plE = el.querySelector('.pl'), mnE = el.querySelector('.mn');
      const autor = (k) => { const t = TIME_DE[k]; if (t.pequeno) return ''; const L = elencoB(t).slice(0, 11); return sorteiaPeso(L, (x) => PESO_GOL[x.pos] * Math.pow((x.hab.finalizacao || 5) / 7, 2)).nome; };
      for (let m = 1; m <= entra; m++) {
        await api.esperar(80);
        mnE.textContent = m + '\'';
        for (const [lado, l] of [[0, lc], [1, lf]]) if (Math.random() < l) {
          pl[lado]++; const k = lado ? jn.f : jn.c, n = autor(k);
          plE.textContent = pl[0] + ' x ' + pl[1];
          t2.textContent = Tf('{0}\' — Gol do {1}!', m, nomeT(k)) + (n ? ' (' + n + ')' : '');
          try { if (typeof Som !== 'undefined' && Som.apito) Som.apito(); } catch (e) { /* nada */ }
          await api.esperar(900);
        }
        if (m === 45) { t2.textContent = T('Fim do primeiro tempo.'); await api.esperar(700); }
      }
      t2.textContent = Tf('{0}\' — O técnico te chamou: você vai entrar!', entra);
      await api.esperar(1600);
      await api.preto(true, 600);
      el.remove(); GANCHO_RENDER = null;
      if (eu) { try { const i = reservasBanco.indexOf(eu); if (i >= 0) { descartarBoneco(eu.mesh.raiz); reservasBanco.splice(i, 1); } } catch (e) { /* nada */ } }
      // o placar no ponto de vista do nosso time (time 0 no motor)
      return { placar: casa ? [pl[0], pl[1]] : [pl[1], pl[0]], min: entra };
    }
    function telaPosJogo(R) {
      cssSb();
      return new Promise((ok) => {
        const T0 = temp(), P = pro(), v = R.v, nosso = P.clube;
        const gc = R.casa ? R.nos : R.eles, gf = R.casa ? R.eles : R.nos;
        let outros = '';
        if (v.comp === 'liga') {
          outros = T0.liga[v.r].filter((g) => !(TIMES_B[g[0]].k === nosso || TIMES_B[g[1]].k === nosso)).map((g) => '<li><span>' + escH(TIMES_B[g[0]].sigla + ' ' + g[2] + ' x ' + g[3] + ' ' + TIMES_B[g[1]].sigla) + '</span></li>').join('');
          const cl = classificacao(T0), pos = cl.findIndex((x) => x.k === nosso) + 1, me = cl[pos - 1];
          outros = '<div class="sbCard"><h4>' + escH(Tf('A rodada · {0}º lugar ({1} pts)', pos, me.p)) + '</h4><ul class="sbLista duas">' + outros + '</ul></div>';
        } else {
          const C = T0.copas[v.comp];
          outros = '<div class="sbCard"><h4>' + escH(nomeComp(T0, v)) + '</h4><p>' + escH(C.campeao ? (C.campeao === nosso ? T('CAMPEÕES!') : Tf('Campeão: {0}', nomeT(C.campeao))) : C.fases[v.fase + 1] && C.fases[v.fase + 1].some((g) => g.c === nosso || g.f === nosso) ? T('Classificados para a próxima fase!') : T('Eliminados da copa.')) + '</p></div>';
        }
        const res = R.venceu ? T('VITÓRIA') : R.empate ? T('EMPATE') : T('DERROTA');
        const tec = clube().tecnico;
        const fala = R.semJogo ? T('O jogo não aconteceu como devia...') : R.bom ? (R.nota >= 8 ? T('Que jogo! É disso que eu preciso.') : T('Bom jogo. Continua assim.')) : R.expulso ? Tg('Expulso?! Assim você complica o time inteiro.') : Tg('Hoje não foi o seu dia. Treina, cuida do corpo e volta melhor.');
        const el = document.createElement('div'); el.className = 'sbTela';
        el.innerHTML = '<div class="sbCaixa"><div class="sbComp">' + escH(nomeComp(T0, v)) + ' · ' + escH(res) + (R.pen ? ' · ' + escH(Tf('Pênaltis: {0} x {1}', R.casa ? R.pen[0] : R.pen[1], R.casa ? R.pen[1] : R.pen[0])) : '') + '</div>'
          + '<div class="sbVs">' + ladoHtml(R.jn.c, R.jn.c === nosso ? T('NÓS') : '') + '<span class="sbPlacar">' + gc + ' x ' + gf + '</span>' + ladoHtml(R.jn.f, R.jn.f === nosso ? T('NÓS') : '') + '</div>'
          + '<div class="sbInfo"><div class="sbCard"><h4>' + escH(T('Sua partida')) + '</h4><p>' + escH(Tf('Nota {0} · {1} gol(s) · {2} assistência(s)', R.nota.toFixed(1), R.gols, R.ass)) + '</p><p>' + escH(R.esc.titular ? T('Titular, 90 minutos') : Tf('Entrou aos {0}\' ({1} minutos)', R.esc.entra, R.min)) + '</p>'
          + '<p>' + escH(Tf('{0}: confiança {1} → {2}', R.bom ? T('Jogo bom') : T('Jogo abaixo'), R.c0, R.c1)) + '</p>' + barraConf(R.c1) + '</div>'
          + '<div class="sbCard"><h4>' + escH(T('Pagamento')) + '</h4><ul class="sbLista"><li><span>' + escH(T('Por jogo')) + '</span><span>' + R.pag.base + '</span></li>'
          + '<li><span>' + escH(Tf('Gols ({0})', R.gols)) + '</span><span>' + R.pag.gol + '</span></li><li><span>' + escH(Tf('Assistências ({0})', R.ass)) + '</span><span>' + R.pag.ass + '</span></li>'
          + '<li><span>' + escH(T('Bônus de vitória')) + '</span><span>' + R.pag.vit + '</span></li><li class="nos"><span>' + escH(T('Total')) + '</span><span>' + R.pag.total + ' ' + escH(T('fakes')) + '</span></li></ul></div></div>'
          + '<div class="sbInfo">' + outros + '<div class="sbCard"><h4>' + escH(tec) + '</h4><p>“' + escH(fala) + '”</p></div></div>'
          + '<button type="button" class="sbBtn">' + escH(T('Voltar para casa ▶')) + '</button></div>';
        (document.getElementById('raizJogo') || document.body).appendChild(el);
        api.preto(false, 300);
        el.querySelector('button').onclick = async () => { el.querySelector('button').disabled = true; await api.preto(true, 400); el.remove(); ok(); };
      });
    }

    // ================================================================ tick, alvos e o que os outros arquivos usam
    function tick(dt) {
      const s = S(); if (!s || !s.dados) return;
      tickOnibus(dt);
      if ((M.tLento -= dt) <= 0) {
        M.tLento = 0.5;
        const P = pro(), vz = s.dados.varzea;
        if (!M.cena && s.modo === 'livre') {
          if ((P.etapa === 'nada' || !P.etapa) && vz && vz.peneira === 'convidado') presente();
          else if (P.etapa === 'peneira') presente();
          else if (P.etapa === 'carta') { M.cena = true; api.irParaFase2({ cartaPeneira: true, ap: api.apLucia(), namorando: namorando(), trabalhaComLucia: api.empregoEscolhido() === 'cafeteria' && !!s.dados.confeitaria }); }
        }
        if (contratado() || P.etapa === 'fimTemporada') {
          if (!M.cena) { fecharVagas(); registrarHabitos(); avaliarHabitos(); avisarJogoDeHoje(); controlarOnibus(); missaoDoDia(); }
          if (P.etapa === 'fimTemporada' && !P.galaVista && !M.cena && !M.lendo && !M.filaMsg.length && s.modo === 'livre' && !s.ligando && !s.dentro) cenaFimTemporada();
        }
      }
      tickMensagens(dt);
    }
    return { tick, alvos, popularidade, presente, _M: M,
      _fns: { escalacao, mudarConf, fecharVagas, fecharVaga, proximaVaga, jogoNosso: (v) => jogoNosso(temp(), v), criarOnibus, tirarOnibus, embarcar, partidaDoDia, assistirDoBanco, telaPreJogo, telaPosJogo, registrarJogo, avaliarHabitos, registrarHabitos, missaoDoDia, montarAquecimento, desmontarAquecimento, ganchoAquecimento, anosAvancando, cfgJogo, festaTitulo, cenaFimTemporada, premiosDaFesta, jogadoresDaFesta } };
  }

  // ============================================================================================ A CARTA (o quarto, fase2.js)
  //   carta.mostrar(ofertas, nome) → a folha com as 3 propostas; resolve o índice escolhido (a escolha pede confirmação).
  //   aceitarOferta(c, i) → grava no save da cidade (c): clube, contrato, a confiança inicial, a temporada e as luvas.
  const FRASE_FAIXA = { bom: 'um dos melhores times da Série B', medio: 'um time bom da Série B', ruim: 'um time da Série B' };
  function cssCarta() {
    if (document.getElementById('sbCartaCss')) return;
    const st = document.createElement('style'); st.id = 'sbCartaCss';
    st.textContent = `
.sbCarta{position:fixed;inset:0;z-index:40;display:flex;align-items:center;justify-content:center;background:rgba(10,8,6,.72);padding:calc(8px + env(safe-area-inset-top,0px)) max(12px,env(safe-area-inset-right,0px)) calc(8px + env(safe-area-inset-bottom,0px)) max(12px,env(safe-area-inset-left,0px));box-sizing:border-box}
.sbFolha{width:min(860px,100%);max-height:100%;overflow:auto;background:#f4ecd8;color:#2a1f14;border:3px solid #8a6a3a;box-shadow:0 8px 0 rgba(0,0,0,.4);padding:10px 14px;box-sizing:border-box;display:flex;flex-direction:column;gap:8px;font:600 12px/1.35 var(--font-body,serif)}
.sbFolha h2{margin:0;font:700 15px/1.15 var(--font-display,monospace);letter-spacing:.06em;text-align:center;color:#5a3a1a}
.sbFolha .sub{margin:0;text-align:center;font-size:11px;opacity:.8}
.sbOfs{display:flex;gap:10px;overflow-x:auto;padding-bottom:4px;scroll-snap-type:x mandatory}
.sbOf{flex:1 1 0;min-width:min(222px,76vw);scroll-snap-align:start;background:#fffaf0;border:2px solid #b8986a;padding:8px 10px;display:flex;flex-direction:column;gap:4px;min-width:0}
.sbOf .cab{display:flex;gap:8px;align-items:center}.sbOf img{width:46px;height:46px;image-rendering:pixelated}
.sbOf .cab b{font:700 13px/1.1 var(--font-display,monospace);display:block}.sbOf .est{color:#c8902a;letter-spacing:1px}
.sbOf h5{margin:4px 0 0;font:700 10px/1 var(--font-display,monospace);letter-spacing:.08em;color:#8a5a2a;text-transform:uppercase}
.sbOf p{margin:0;font-size:11px}.sbOf .din{font:700 14px/1.1 var(--font-display,monospace);color:#1f6a2a}
.sbOf button{margin-top:auto;height:36px;font:700 12px/1 var(--font-display,monospace);letter-spacing:.06em;background:#2a1f14;color:#f4ecd8;border:2px solid #000;cursor:pointer;text-transform:uppercase}
.sbConf{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}.sbConf button{min-width:150px;height:38px;font:700 12px/1 var(--font-display,monospace);border:2px solid #000;cursor:pointer;text-transform:uppercase}
.sbConf .sim{background:#1f6a2a;color:#fff}.sbConf .nao{background:#e8dcc0;color:#2a1f14}
`;
    document.head.appendChild(st);
  }
  const carta = {
    mostrar(ofertas, nome) {
      cssCarta();
      return new Promise((ok) => {
        const el = document.createElement('div'); el.className = 'sbCarta';
        const card = (o, i) => {
          const t = TIME_DE[o.k];
          return '<div class="sbOf"><div class="cab"><img src="' + urlArte(t.k) + '" alt=""><div><b>' + escH(t.nome) + '</b><span class="est">' + estrelasTxt(t.estrelas) + '</span></div></div>'
            + '<h5>' + escH(T('Contrato')) + '</h5><p class="din">' + escH(Tf('{0} fakes por jogo', o.base + (o.extra | 0))) + '</p>'
            + '<p>' + escH(Tf('+{0} por gol · +{1} por assistência', o.gol, o.ass)) + '</p><p>' + escH(Tf('Bônus por vitória: {0} fakes', o.vit)) + '</p><p>' + escH(Tf('Luvas (na assinatura): {0} fakes', o.luvas)) + '</p>'
            + (o.extra ? '<p>' + escH(Tf('Inclui +{0} por jogo pela sua personalidade.', o.extra)) + '</p>' : '')
            + '<h5>' + escH(T('Como o time joga')) + '</h5><p>' + escH(Tf('{0} · {1}', t.formacao, T(NOME_TATICA[t.tatica] || t.tatica))) + '</p><p>' + escH(T(t.estilo)) + '</p><p>' + escH(Tf('Técnico: {0}', t.tecnico)) + '</p>'
            + '<button type="button" data-i="' + i + '">' + escH(T('Escolher')) + '</button></div>';
        };
        const lista = () => { el.innerHTML = '<div class="sbFolha"><h2>' + escH(Tf('PROPOSTAS PARA {0}', String(nome || '').toUpperCase())) + '</h2><p class="sub">' + escH(T('Depois da peneira, três clubes da Série B querem você. Escolha um:')) + '</p><div class="sbOfs">' + ofertas.map(card).join('') + '</div></div>'; };
        const confirmar = (i) => {
          const t = TIME_DE[ofertas[i].k];
          el.innerHTML = '<div class="sbFolha" style="width:min(460px,100%)"><h2>' + escH(Tf('Aceitar a proposta do {0}?', t.nome)) + '</h2><div style="text-align:center"><img src="' + urlArte(t.k) + '" alt="" style="width:72px;height:72px;image-rendering:pixelated"></div>'
            + '<div class="sbConf"><button type="button" class="sim" data-c="1">' + escH(T('Aceitar')) + '</button><button type="button" class="nao" data-c="0">' + escH(T('Ver as outras')) + '</button></div></div>';
        };
        el.onclick = (e) => {
          const b = e.target.closest('button'); if (!b) return;
          if (b.dataset.i != null) { el.dataset.sel = b.dataset.i; confirmar(+b.dataset.i); return; }
          if (b.dataset.c === '1') { el.remove(); ok(+el.dataset.sel); return; }
          if (b.dataset.c === '0') lista();
        };
        lista(); (document.getElementById('raizJogo') || document.body).appendChild(el);
      });
    },
  };
  function aceitarOferta(c, i) {
    const P = (c.pro = c.pro || { etapa: 'carta' }), o = (P.ofertas || [])[i]; if (!o) return null;
    Object.assign(P, { clube: o.k, contrato: o, etapa: 'contratado', contratoDia: c.dia | 0, conf: CONF0, chance: false, manter: false, habAval: c.dia | 0, est: { j: 0, tit: 0, g: 0, a: 0, nota: 0, bons: 0, min: 0, v: 0 }, hist: [], ganhos: 0 });
    P.temporada = novaTemporada(o.k, (c.dia | 0) + 1, 1);
    c.fakes = (c.fakes | 0) + (o.luvas | 0);
    return o;
  }
  const fraseOferta = (o) => Tf('Uau, o {0}, {1}, me fez uma proposta! Eu preciso aceitar.', TIME_DE[o.k].nome, T(FRASE_FAIXA[o.faixa] || FRASE_FAIXA.medio));

  // ============================================================================================ O APP CARREIRA (aba Série B)
  function carreiraHtml(c, nomeJog, esc) {
    const P = c.pro || {}, T0 = P.temporada; if (!T0 || !P.clube) return '<p class="crVazio">' + esc(Tg('Você ainda não é jogador profissional.')) + '</p>';
    const t = TIME_DE[P.clube], E = P.est || {}, num = (v, tt) => '<div class="crNum"><b>' + esc(String(v)) + '</b><span>' + esc(T(tt)) + '</span></div>';
    let h = '<div class="crCard"><h4><img src="' + urlArte(t.k) + '" alt="">' + esc(t.nome) + '</h4><p>' + esc(Tf('Confiança do técnico: {0}/100', P.conf | 0)) + ' · ' + esc(Tf('Contrato: {0} fakes por jogo', (P.contrato.base | 0) + (P.contrato.extra | 0))) + '</p><p>' + esc(Tf('Ganhos no clube: {0} fakes', P.ganhos | 0)) + '</p></div>';
    const j = E.j | 0;
    h += '<div class="crNums">' + num(j, 'Jogos') + num((E.tit | 0) + ' / ' + j, 'Como titular') + num(E.g | 0, 'Gols') + num(E.a | 0, 'Assistências') + num(j ? (Math.round(E.nota / j * 10) / 10).toFixed(1) : '—', 'Nota média') + num(E.min | 0, 'Minutos') + '</div>';
    const cl = classificacao(T0);
    h += '<div class="crCard"><h4>' + esc(T('Série B')) + ' · ' + esc(Tf('{0} de 38 rodadas', T0.vagas.filter((v) => v.comp === 'liga' && v.feito).length)) + '</h4><table class="crTab"><tr><th>#</th><th>' + esc(T('Time')) + '</th><th>P</th><th>J</th><th>V</th><th>E</th><th>D</th><th>SG</th></tr>'
      + cl.map((x, i) => '<tr' + (x.k === P.clube ? ' class="nos"' : '') + '><td>' + (i + 1) + (i < 4 ? '↑' : '') + '</td><td><img src="' + urlArte(x.k) + '" alt="">' + esc(TIME_DE[x.k].nome) + '</td><td>' + x.p + '</td><td>' + x.j + '</td><td>' + x.v + '</td><td>' + x.e + '</td><td>' + x.d + '</td><td>' + (x.gp - x.gc) + '</td></tr>').join('')
      + '</table><p><small>' + esc(T('Os 4 primeiros sobem para a Série A. Ninguém cai.')) + '</small></p></div>';
    const art = artilheiros(T0, 6);
    h += '<div class="crCard"><h4>' + esc(T('Artilharia')) + '</h4>' + (art.length ? art.map((x, i) => '<p>' + (i + 1) + '. ' + esc((x.nome === '__voce' ? nomeJog() : x.nome) + ' (' + TIME_DE[x.k].sigla + ')') + ' · ' + esc(Tf('{0} gols', x.g)) + '</p>').join('') : '<p>—</p>') + '</div>';
    for (const tipo of ['est', 'reg']) {
      const C = T0.copas[tipo], nm = tipo === 'est' ? Tf('Copa Estadual ({0})', t.uf) : Tf('Copa Regional {0}', T(NOME_REG[t.reg]));
      const linhas = C.fases.map((F, fi) => '<p><b>' + esc(T(NOME_FASE[nFases(C)][fi])) + ':</b> ' + F.map((g) => esc(TIME_DE[g.c].sigla + ' ' + (g.gc < 0 ? '–' : g.gc) + ' x ' + (g.gf < 0 ? '–' : g.gf) + ' ' + TIME_DE[g.f].sigla) + (g.pen ? ' (' + g.pen[0] + '-' + g.pen[1] + ')' : '')).join(' · ') + '</p>').join('');
      h += '<div class="crCard"><h4>🏆 ' + esc(nm) + (C.campeao ? ' · ' + esc(Tf('Campeão: {0}', TIME_DE[C.campeao].nome)) : '') + '</h4>' + linhas + '</div>';
    }
    return h;
  }

  // ============================================================================================ TEXTOS (pt → en, es, it, fr)
  const TRAD = {
    "Time 1": ["Team 1", "Equipo 1", "Squadra 1", "Équipe 1"],
    "PRÊMIOS DA SÉRIE B": ["SÉRIE B AWARDS", "PREMIOS DE LA SÉRIE B", "PREMI DELLA SÉRIE B", "TROPHÉES DE LA SÉRIE B"],
    "Time 2": ["Team 2", "Equipo 2", "Squadra 2", "Équipe 2"],
    "Missão do clube: hoje tem jogo contra o {0}, mas você está {1}. Descanse e se recupere.": ["Club mission: there's a game against {0} today, but you're {1}. Rest and recover.", "Misión del club: hoy hay partido contra {0}, pero estás {1}. Descansa y recupérate.", "Missione del club: oggi c'è la partita contro {0}, ma sei {1}. Riposati e recupera.", "Mission du club : il y a match contre {0} aujourd'hui, mais tu es {1}. Repose-toi et récupère."],
    "suspenso por {0} jogo(s)": ["suspended for {0} game(s)", "suspendido por {0} partido(s)", "squalificato per {0} partita/e", "suspendu pour {0} match(s)"],
    "machucado por {0} jogo(s)": ["injured for {0} game(s)", "lesionado por {0} partido(s)", "infortunato per {0} partita/e", "blessé pour {0} match(s)"],
    "machucada por {0} jogo(s)": ["injured for {0} game(s)", "lesionada por {0} partido(s)", "infortunata per {0} partita/e", "blessée pour {0} match(s)"],
    "Você estava {0} e não jogou contra o {1}.": ["You were {0} and didn't play against {1}.", "Estabas {0} y no jugaste contra {1}.", "Eri {0} e non hai giocato contro {1}.", "Tu étais {0} et tu n'as pas joué contre {1}."],
    "Resultado: {0} x {1}. Cuida de você, que a vaga te espera.": ["Result: {0}-{1}. Look after yourself, your spot is waiting.", "Resultado: {0}-{1}. Cuídate, que el puesto te espera.", "Risultato: {0}-{1}. Riguardati, il posto ti aspetta.", "Résultat : {0}-{1}. Prends soin de toi, ta place t'attend."],
    "Vocês ainda lembram que isso estava no passado, né?": ["You still remember all that was in the past, right?", "¿Todavía recuerdan que todo eso era el pasado, verdad?", "Vi ricordate che tutto questo era nel passato, vero?", "Vous vous souvenez que tout ça, c'était le passé, hein ?"],
    "Pois é. Agora, no presente...": ["Yep. Now, in the present...", "Pues sí. Ahora, en el presente...", "Già. Adesso, nel presente...", "Eh oui. Maintenant, dans le présent..."],
    "Dois anos depois": ["Two years later", "Dos años después", "Due anni dopo", "Deux ans plus tard"],
    "É aqui que estamos, no presente.": ["This is where we are, in the present.", "Aquí es donde estamos, en el presente.", "È qui che siamo, nel presente.", "C'est ici que nous en sommes, dans le présent."],
    "Estou tendo a chance da minha vida, maior de idade agora: jogar futebol profissional.": ["I'm getting the chance of my life, now that I'm an adult: playing professional football.", "Tengo la oportunidad de mi vida, ahora que soy mayor de edad: jugar al fútbol profesional.", "Ho l'occasione della mia vita, ora che sono maggiorenne: giocare a calcio da professionista.", "J'ai la chance de ma vie, maintenant que je suis majeur : jouer au football professionnel."],
    "Por isso, eu preciso me destacar nessa peneira. Preciso chamar a atenção dos olheiros.": ["That's why I need to stand out at this tryout. I need to catch the scouts' eye.", "Por eso tengo que destacar en esta prueba. Tengo que llamar la atención de los ojeadores.", "Per questo devo farmi notare a questo provino. Devo attirare l'attenzione degli osservatori.", "C'est pour ça que je dois me démarquer à cette détection. Je dois attirer l'attention des recruteurs."],
    "Ah, e claro que a Lúcia está aqui.": ["Oh, and of course Lucy is here.", "Ah, y claro que Lucía está aquí.", "Ah, e ovviamente Lucia è qui.", "Ah, et bien sûr, Lucie est là."],
    "Vai lá, amor! Mostra pra eles quem você é!": ["Go on, love! Show them who you are!", "¡Vamos, amor! ¡Muéstrales quién eres!", "Forza, amore! Fagli vedere chi sei!", "Vas-y, mon amour ! Montre-leur qui tu es !"],
    "Bora!": ["Let's go!", "¡Vamos!", "Andiamo!", "C'est parti !"],
    "Acho que eu fui muito bem... agora é esperar a resposta dos olheiros.": ["I think I did really well... now I just have to wait for the scouts' answer.", "Creo que me fue muy bien... ahora toca esperar la respuesta de los ojeadores.", "Credo di essere andato molto bene... ora devo aspettare la risposta degli osservatori.", "Je crois que j'ai très bien joué... maintenant, il faut attendre la réponse des recruteurs."],
    "Fiz um jogo bom. Agora é torcer para algum olheiro ter gostado.": ["I played a good game. Now I just hope some scout liked it.", "Hice un buen partido. Ahora toca esperar que a algún ojeador le haya gustado.", "Ho fatto una bella partita. Ora speriamo che sia piaciuta a qualche osservatore.", "J'ai fait un bon match. Maintenant, j'espère qu'un recruteur a aimé."],
    "Não foi o meu melhor dia... mas eu dei tudo o que eu tinha.": ["It wasn't my best day... but I gave it everything I had.", "No fue mi mejor día... pero di todo lo que tenía.", "Non è stato il mio giorno migliore... ma ho dato tutto quello che avevo.", "Ce n'était pas mon meilleur jour... mais j'ai tout donné."],
    "Alguns dias depois...": ["A few days later...", "Unos días después...", "Qualche giorno dopo...", "Quelques jours plus tard..."],
    "Peneira": ["Tryout", "Prueba", "Provino", "Détection"],
    "Peneira: Time 1 x Time 2. Mostre o seu futebol para os olheiros!": ["Tryout: Team 1 vs Team 2. Show the scouts what you've got!", "Prueba: Equipo 1 vs Equipo 2. ¡Muéstrales tu fútbol a los ojeadores!", "Provino: Squadra 1 contro Squadra 2. Mostra il tuo calcio agli osservatori!", "Détection : Équipe 1 contre Équipe 2. Montre ton football aux recruteurs !"],
    "Série B · Rodada {0} de 38": ["Série B · Round {0} of 38", "Série B · Jornada {0} de 38", "Série B · Giornata {0} di 38", "Série B · Journée {0} sur 38"],
    "Copa Estadual ({0})": ["State Cup ({0})", "Copa Estatal ({0})", "Coppa Statale ({0})", "Coupe de l'État ({0})"],
    "Copa Regional {0}": ["{0} Regional Cup", "Copa Regional {0}", "Coppa Regionale {0}", "Coupe régionale {0}"],
    "Missão do clube: jogo contra o {0} às {1}. O ônibus do clube passa no ponto da avenida às {2}.": ["Club mission: game against {0} at {1}. The club bus stops at the avenue bus stop at {2}.", "Misión del club: partido contra {0} a las {1}. El autobús del club pasa por la parada de la avenida a las {2}.", "Missione del club: partita contro {0} alle {1}. Il pullman del club passa alla fermata del viale alle {2}.", "Mission du club : match contre {0} à {1}. Le bus du club passe à l'arrêt de l'avenue à {2}."],
    "Missão do clube (1/3): treinar hoje (academia ou CT do Seu Nonato).": ["Club mission (1/3): train today (the gym or Mr. Nonato's training ground).", "Misión del club (1/3): entrenar hoy (el gimnasio o el centro de Don Nonato).", "Missione del club (1/3): allenarsi oggi (la palestra o il centro del signor Nonato).", "Mission du club (1/3) : s'entraîner aujourd'hui (la salle de sport ou le centre de M. Nonato)."],
    "Missão do clube (2/3): comer comida saudável (o wrap integral do seu Valdemar).": ["Club mission (2/3): eat healthy food (Mr. Valdemar's wholewheat wrap).", "Misión del club (2/3): comer comida sana (el wrap integral de Don Valdemar).", "Missione del club (2/3): mangiare sano (il wrap integrale del signor Valdemar).", "Mission du club (2/3) : manger sain (le wrap complet de M. Valdemar)."],
    "Missão do clube (3/3): dormir cedo, até as 22h.": ["Club mission (3/3): go to bed early, by 10 PM.", "Misión del club (3/3): dormir temprano, antes de las 22:00.", "Missione del club (3/3): andare a letto presto, entro le 22.", "Mission du club (3/3) : se coucher tôt, avant 22 h."],
    "Técnico": ["Coach", "Entrenador", "Allenatore", "Entraîneur"],
    "Treino {0} · Comida saudável {1} · Dormiu cedo {2}": ["Training {0} · Healthy food {1} · Early to bed {2}", "Entreno {0} · Comida sana {1} · Durmió temprano {2}", "Allenamento {0} · Cibo sano {1} · A letto presto {2}", "Entraînement {0} · Repas sain {1} · Couché tôt {2}"],
    "Confiança do técnico: {0} → {1} ({2}{3})": ["Coach's trust: {0} → {1} ({2}{3})", "Confianza del entrenador: {0} → {1} ({2}{3})", "Fiducia dell'allenatore: {0} → {1} ({2}{3})", "Confiance de l'entraîneur : {0} → {1} ({2}{3})"],
    "Você não apareceu no ônibus do jogo contra o {0}.": ["You didn't show up for the bus to the game against {0}.", "No apareciste en el autobús del partido contra {0}.", "Non ti sei presentato al pullman per la partita contro {0}.", "Tu n'es pas venu prendre le bus du match contre {0}."],
    "Jogamos sem você: {0} x {1}. Confiança do técnico: {2} → {3}.": ["We played without you: {0}-{1}. Coach's trust: {2} → {3}.", "Jugamos sin ti: {0}-{1}. Confianza del entrenador: {2} → {3}.", "Abbiamo giocato senza di te: {0}-{1}. Fiducia dell'allenatore: {2} → {3}.", "On a joué sans toi : {0}-{1}. Confiance de l'entraîneur : {2} → {3}."],
    "SOMOS CAMPEÕES DA {0}!": ["WE'RE {0} CHAMPIONS!", "¡SOMOS CAMPEONES DE LA {0}!", "SIAMO CAMPIONI DELLA {0}!", "NOUS SOMMES CHAMPIONS DE LA {0} !"],
    "Copa Estadual": ["State Cup", "Copa Estatal", "Coppa Statale", "Coupe de l'État"],
    "Copa Regional": ["Regional Cup", "Copa Regional", "Coppa Regionale", "Coupe régionale"],
    "O campeão da {0} foi o {1}.": ["The {0} champion was {1}.", "El campeón de la {0} fue {1}.", "Il campione della {0} è stato {1}.", "Le champion de la {0} est {1}."],
    "ACESSO! Terminamos a Série B em {0}º lugar e subimos para a Série A!": ["PROMOTION! We finished Série B in {0}th place and went up to Série A!", "¡ASCENSO! Terminamos la Série B en el {0}º puesto y subimos a la Série A!", "PROMOZIONE! Abbiamo chiuso la Série B al {0}º posto e siamo saliti in Série A!", "MONTÉE ! On a fini la Série B à la {0}e place et on monte en Série A !"],
    "Fim da Série B: terminamos em {0}º lugar.": ["End of Série B: we finished {0}th.", "Fin de la Série B: terminamos en el {0}º puesto.", "Fine della Série B: abbiamo chiuso al {0}º posto.", "Fin de la Série B : on a fini {0}e."],
    "A próxima temporada ainda vai chegar. Descansa, que você merece!": ["The next season is still to come. Get some rest, you deserve it!", "La próxima temporada todavía va a llegar. ¡Descansa, que te lo mereces!", "La prossima stagione deve ancora arrivare. Riposati, te lo meriti!", "La prochaine saison arrive plus tard. Repose-toi, tu l'as mérité !"],
    "Hoje tem jogo! {0} contra o {1}, às {2}.": ["Game day! {0} against {1}, at {2}.", "¡Hoy hay partido! {0} contra {1}, a las {2}.", "Oggi si gioca! {0} contro {1}, alle {2}.", "Match aujourd'hui ! {0} contre {1}, à {2}."],
    "O ônibus do clube passa no ponto da avenida às {0}. Não se atrase!": ["The club bus stops at the avenue bus stop at {0}. Don't be late!", "El autobús del club pasa por la parada de la avenida a las {0}. ¡No llegues tarde!", "Il pullman del club passa alla fermata del viale alle {0}. Non fare tardi!", "Le bus du club passe à l'arrêt de l'avenue à {0}. Ne sois pas en retard !"],
    "DELEGAÇÃO OFICIAL": ["OFFICIAL TEAM BUS", "DELEGACIÓN OFICIAL", "DELEGAZIONE UFFICIALE", "DÉLÉGATION OFFICIELLE"],
    "Entrar no ônibus do {0}": ["Board the {0} bus", "Subir al autobús del {0}", "Salire sul pullman del {0}", "Monter dans le bus du {0}"],
    "Esperar o ônibus do clube (passa às {0})": ["Wait for the club bus (comes at {0})", "Esperar el autobús del club (pasa a las {0})", "Aspettare il pullman del club (passa alle {0})", "Attendre le bus du club (passe à {0})"],
    "Série B": ["Série B", "Série B", "Série B", "Série B"],
    "você entra aos {0}'": ["you come on at {0}'", "entras al {0}'", "entri al {0}'", "tu entres à la {0}e"],
    "{0} x {1}: você começa jogando!": ["{0} vs {1}: you're in the starting lineup!", "{0} vs {1}: ¡empiezas jugando!", "{0} contro {1}: parti titolare!", "{0} contre {1} : tu es titulaire !"],
    "Substituição: você entra aos {0}'!": ["Substitution: you come on at {0}'!", "Cambio: ¡entras al {0}'!", "Sostituzione: entri al {0}'!", "Remplacement : tu entres à la {0}e !"],
    "50: chance de titular": ["50: chance to start", "50: oportunidad de titular", "50: occasione da titolare", "50 : chance d'être titulaire"],
    "80: sempre titular": ["80: always starts", "80: siempre titular", "80: sempre titolare", "80 : toujours titulaire"],
    "Você é peça fundamental. Vai pra cima deles!": ["You're a key player. Go at them!", "Eres una pieza clave. ¡Ve a por ellos!", "Sei un pezzo fondamentale. Vai a prenderli!", "Tu es une pièce maîtresse. Fonce sur eux !"],
    "Você foi muito bem no último jogo: continua no time titular.": ["You played really well last game: you stay in the starting lineup.", "Te fue muy bien en el último partido: sigues de titular.", "Sei andato molto bene nell'ultima partita: resti titolare.", "Tu as très bien joué au dernier match : tu restes titulaire."],
    "Eu estou de olho no seu esforço: hoje você começa jogando. Não me decepcione!": ["I've been watching your effort: today you start. Don't let me down!", "Estoy viendo tu esfuerzo: hoy empiezas jugando. ¡No me decepciones!", "Ho notato il tuo impegno: oggi parti titolare. Non deludermi!", "J'ai vu tes efforts : aujourd'hui, tu es titulaire. Ne me déçois pas !"],
    "Fica no banco e presta atenção no jogo. Se precisar, eu te chamo no fim.": ["Stay on the bench and watch the game closely. If I need you, I'll call you at the end.", "Quédate en el banquillo y presta atención al partido. Si hace falta, te llamo al final.", "Resta in panchina e segui la partita. Se serve, ti chiamo alla fine.", "Reste sur le banc et regarde bien le match. Si j'ai besoin, je t'appelle à la fin."],
    "Começa no banco. No segundo tempo eu vou precisar de você.": ["You start on the bench. I'll need you in the second half.", "Empiezas en el banquillo. En el segundo tiempo te voy a necesitar.", "Parti dalla panchina. Nel secondo tempo avrò bisogno di te.", "Tu commences sur le banc. J'aurai besoin de toi en deuxième mi-temps."],
    "CASA": ["HOME", "LOCAL", "CASA", "DOMICILE"],
    "FORA": ["AWAY", "VISITANTE", "TRASFERTA", "EXTÉRIEUR"],
    "Você": ["You", "Tú", "Tu", "Toi"],
    "TITULAR": ["STARTER", "TITULAR", "TITOLARE", "TITULAIRE"],
    "NO BANCO": ["ON THE BENCH", "EN EL BANQUILLO", "IN PANCHINA", "SUR LE BANC"],
    "Você joga os 90 minutos.": ["You play the full 90 minutes.", "Juegas los 90 minutos.", "Giochi tutti i 90 minuti.", "Tu joues les 90 minutes."],
    "O técnico deve te colocar por volta dos {0} minutos.": ["The coach should bring you on around the {0}th minute.", "El entrenador debería meterte hacia el minuto {0}.", "L'allenatore dovrebbe farti entrare verso il {0}º minuto.", "L'entraîneur devrait te faire entrer vers la {0}e minute."],
    "Confiança do técnico: {0}/100": ["Coach's trust: {0}/100", "Confianza del entrenador: {0}/100", "Fiducia dell'allenatore: {0}/100", "Confiance de l'entraîneur : {0}/100"],
    "Jogar ▶": ["Play ▶", "Jugar ▶", "Gioca ▶", "Jouer ▶"],
    "Ir para o banco ▶": ["Go to the bench ▶", "Ir al banquillo ▶", "Vai in panchina ▶", "Aller sur le banc ▶"],
    "Você está no banco. Acompanhe o jogo...": ["You're on the bench. Follow the game...", "Estás en el banquillo. Sigue el partido...", "Sei in panchina. Segui la partita...", "Tu es sur le banc. Suis le match..."],
    "{0}' — Gol do {1}!": ["{0}' — Goal for {1}!", "{0}' — ¡Gol del {1}!", "{0}' — Gol del {1}!", "{0}e — But pour {1} !"],
    "Fim do primeiro tempo.": ["Half time.", "Fin del primer tiempo.", "Fine del primo tempo.", "Mi-temps."],
    "{0}' — O técnico te chamou: você vai entrar!": ["{0}' — The coach is calling you: you're going on!", "{0}' — El entrenador te llamó: ¡vas a entrar!", "{0}' — L'allenatore ti ha chiamato: stai per entrare!", "{0}e — L'entraîneur t'appelle : tu vas entrer !"],
    "A rodada · {0}º lugar ({1} pts)": ["The round · {0}th place ({1} pts)", "La jornada · {0}º puesto ({1} pts)", "La giornata · {0}º posto ({1} pt)", "La journée · {0}e place ({1} pts)"],
    "CAMPEÕES!": ["CHAMPIONS!", "¡CAMPEONES!", "CAMPIONI!", "CHAMPIONS !"],
    "Campeão: {0}": ["Champion: {0}", "Campeón: {0}", "Campione: {0}", "Champion : {0}"],
    "Classificados para a próxima fase!": ["Through to the next round!", "¡Clasificados para la siguiente fase!", "Qualificati per il turno successivo!", "Qualifiés pour le tour suivant !"],
    "Eliminados da copa.": ["Knocked out of the cup.", "Eliminados de la copa.", "Eliminati dalla coppa.", "Éliminés de la coupe."],
    "VITÓRIA": ["WIN", "VICTORIA", "VITTORIA", "VICTOIRE"],
    "EMPATE": ["DRAW", "EMPATE", "PAREGGIO", "MATCH NUL"],
    "DERROTA": ["LOSS", "DERROTA", "SCONFITTA", "DÉFAITE"],
    "O jogo não aconteceu como devia...": ["The game didn't go the way it should have...", "El partido no salió como debía...", "La partita non è andata come doveva...", "Le match ne s'est pas passé comme prévu..."],
    "Que jogo! É disso que eu preciso.": ["What a game! That's exactly what I need.", "¡Qué partido! Eso es lo que necesito.", "Che partita! È proprio di questo che ho bisogno.", "Quel match ! C'est exactement ce qu'il me faut."],
    "Bom jogo. Continua assim.": ["Good game. Keep it up.", "Buen partido. Sigue así.", "Bella partita. Continua così.", "Bon match. Continue comme ça."],
    "Expulso?! Assim você complica o time inteiro.": ["Sent off?! That makes things hard for the whole team.", "¿¡Expulsado!? Así complicas a todo el equipo.", "Espulso?! Così metti in difficoltà tutta la squadra.", "Expulsé ?! Comme ça, tu mets toute l'équipe en difficulté."],
    "Hoje não foi o seu dia. Treina, cuida do corpo e volta melhor.": ["Today wasn't your day. Train, look after your body and come back better.", "Hoy no fue tu día. Entrena, cuida tu cuerpo y vuelve mejor.", "Oggi non era la tua giornata. Allenati, cura il tuo corpo e torna più forte.", "Ce n'était pas ton jour. Entraîne-toi, prends soin de ton corps et reviens plus fort."],
    "Pênaltis: {0} x {1}": ["Penalties: {0}-{1}", "Penaltis: {0}-{1}", "Rigori: {0}-{1}", "Tirs au but : {0}-{1}"],
    "NÓS": ["US", "NOSOTROS", "NOI", "NOUS"],
    "Sua partida": ["Your game", "Tu partido", "La tua partita", "Ton match"],
    "Nota {0} · {1} gol(s) · {2} assistência(s)": ["Rating {0} · {1} goal(s) · {2} assist(s)", "Nota {0} · {1} gol(es) · {2} asistencia(s)", "Voto {0} · {1} gol · {2} assist", "Note {0} · {1} but(s) · {2} passe(s) décisive(s)"],
    "Titular, 90 minutos": ["Starter, 90 minutes", "Titular, 90 minutos", "Titolare, 90 minuti", "Titulaire, 90 minutes"],
    "Entrou aos {0}' ({1} minutos)": ["Came on at {0}' ({1} minutes)", "Entró al {0}' ({1} minutos)", "Entrato al {0}' ({1} minuti)", "Entré à la {0}e ({1} minutes)"],
    "{0}: confiança {1} → {2}": ["{0}: trust {1} → {2}", "{0}: confianza {1} → {2}", "{0}: fiducia {1} → {2}", "{0} : confiance {1} → {2}"],
    "Jogo bom": ["Good game", "Buen partido", "Bella partita", "Bon match"],
    "Jogo abaixo": ["Below par", "Partido flojo", "Partita sottotono", "Match moyen"],
    "Pagamento": ["Pay", "Pago", "Pagamento", "Paiement"],
    "Por jogo": ["Per game", "Por partido", "A partita", "Par match"],
    "Gols ({0})": ["Goals ({0})", "Goles ({0})", "Gol ({0})", "Buts ({0})"],
    "Assistências ({0})": ["Assists ({0})", "Asistencias ({0})", "Assist ({0})", "Passes décisives ({0})"],
    "Bônus de vitória": ["Win bonus", "Prima por victoria", "Premio vittoria", "Prime de victoire"],
    "Total": ["Total", "Total", "Totale", "Total"],
    "Voltar para casa ▶": ["Go back home ▶", "Volver a casa ▶", "Torna a casa ▶", "Rentrer à la maison ▶"],
    "Contrato": ["Contract", "Contrato", "Contratto", "Contrat"],
    "{0} fakes por jogo": ["{0} fakes per game", "{0} fakes por partido", "{0} fakes a partita", "{0} fakes par match"],
    "+{0} por gol · +{1} por assistência": ["+{0} per goal · +{1} per assist", "+{0} por gol · +{1} por asistencia", "+{0} a gol · +{1} ad assist", "+{0} par but · +{1} par passe décisive"],
    "Bônus por vitória: {0} fakes": ["Win bonus: {0} fakes", "Prima por victoria: {0} fakes", "Premio vittoria: {0} fakes", "Prime de victoire : {0} fakes"],
    "Luvas (na assinatura): {0} fakes": ["Signing bonus: {0} fakes", "Prima de fichaje: {0} fakes", "Bonus alla firma: {0} fakes", "Prime à la signature : {0} fakes"],
    "Inclui +{0} por jogo pela sua personalidade.": ["Includes +{0} per game because of your personality.", "Incluye +{0} por partido por tu personalidad.", "Include +{0} a partita per la tua personalità.", "Comprend +{0} par match grâce à ta personnalité."],
    "Como o time joga": ["How the team plays", "Cómo juega el equipo", "Come gioca la squadra", "Comment joue l'équipe"],
    "{0} · {1}": ["{0} · {1}", "{0} · {1}", "{0} · {1}", "{0} · {1}"],
    "Técnico: {0}": ["Coach: {0}", "Entrenador: {0}", "Allenatore: {0}", "Entraîneur : {0}"],
    "Escolher": ["Choose", "Elegir", "Scegli", "Choisir"],
    "PROPOSTAS PARA {0}": ["OFFERS FOR {0}", "PROPUESTAS PARA {0}", "OFFERTE PER {0}", "OFFRES POUR {0}"],
    "Depois da peneira, três clubes da Série B querem você. Escolha um:": ["After the tryout, three Série B clubs want you. Choose one:", "Después de la prueba, tres clubes de la Série B te quieren. Elige uno:", "Dopo il provino, tre club di Série B ti vogliono. Scegline uno:", "Après la détection, trois clubs de Série B te veulent. Choisis-en un :"],
    "Aceitar a proposta do {0}?": ["Accept the offer from {0}?", "¿Aceptar la propuesta del {0}?", "Accettare l'offerta del {0}?", "Accepter l'offre du {0} ?"],
    "Aceitar": ["Accept", "Aceptar", "Accetta", "Accepter"],
    "Ver as outras": ["See the others", "Ver las otras", "Vedi le altre", "Voir les autres"],
    "Uau, o {0}, {1}, me fez uma proposta! Eu preciso aceitar.": ["Wow, {0}, {1}, made me an offer! I have to accept.", "¡Guau, el {0}, {1}, me hizo una propuesta! Tengo que aceptar.", "Wow, il {0}, {1}, mi ha fatto un'offerta! Devo accettare.", "Waouh, le {0}, {1}, m'a fait une offre ! Je dois accepter."],
    "Você ainda não é jogador profissional.": ["You're not a professional player yet.", "Todavía no eres jugador profesional.", "Non sei ancora un giocatore professionista.", "Tu n'es pas encore joueur professionnel."],
    "Você ainda não é jogadora profissional.": ["You're not a professional player yet.", "Todavía no eres jugadora profesional.", "Non sei ancora una giocatrice professionista.", "Tu n'es pas encore joueuse professionnelle."],
    "Contrato: {0} fakes por jogo": ["Contract: {0} fakes per game", "Contrato: {0} fakes por partido", "Contratto: {0} fakes a partita", "Contrat : {0} fakes par match"],
    "Ganhos no clube: {0} fakes": ["Earned at the club: {0} fakes", "Ganancias en el club: {0} fakes", "Guadagni al club: {0} fakes", "Gains au club : {0} fakes"],
    "{0} de 38 rodadas": ["{0} of 38 rounds", "{0} de 38 jornadas", "{0} di 38 giornate", "{0} journées sur 38"],
    "Time": ["Team", "Equipo", "Squadra", "Équipe"],
    "Os 4 primeiros sobem para a Série A. Ninguém cai.": ["The top 4 go up to Série A. Nobody goes down.", "Los 4 primeros suben a la Série A. Nadie desciende.", "Le prime 4 salgono in Série A. Nessuno retrocede.", "Les 4 premiers montent en Série A. Personne ne descend."],
    "Artilharia": ["Top scorers", "Goleadores", "Classifica marcatori", "Meilleurs buteurs"],
    "{0} gols": ["{0} goals", "{0} goles", "{0} gol", "{0} buts"],
    "Toque de bola": ["Possession game", "Toque de balón", "Possesso palla", "Jeu de possession"],
    "Falso 9": ["False 9", "Falso 9", "Falso nove", "Faux 9"],
    "Retranca": ["Park the bus", "Cerrojo", "Catenaccio", "Bloc bas"],
    "Contra-ataque": ["Counterattack", "Contraataque", "Contropiede", "Contre-attaque"],
    "Bola aérea": ["Aerial game", "Juego aéreo", "Gioco aereo", "Jeu aérien"],
    "Nordeste": ["Northeast", "Nordeste", "Nordest", "Nord-Est"],
    "Sudeste": ["Southeast", "Sudeste", "Sudest", "Sud-Est"],
    "Sul": ["South", "Sur", "Sud", "Sud"],
    "Centro-Oeste": ["Center-West", "Centro-Oeste", "Centro-Ovest", "Centre-Ouest"],
    "Quartas de final": ["Quarterfinals", "Cuartos de final", "Quarti di finale", "Quarts de finale"],
    "Semifinal": ["Semifinal", "Semifinal", "Semifinale", "Demi-finale"],
    "Final": ["Final", "Final", "Finale", "Finale"],
    "Torcida pequena": ["Small crowd", "Afición pequeña", "Tifoseria piccola", "Petit public"],
    "Torcida fiel": ["Loyal crowd", "Afición fiel", "Tifoseria fedele", "Public fidèle"],
    "Torcida crescendo": ["Growing crowd", "Afición creciendo", "Tifoseria in crescita", "Public grandissant"],
    "Torcida grande": ["Big crowd", "Gran afición", "Grande tifoseria", "Grand public"],
    "Casa cheia": ["Full house", "Lleno total", "Tutto esaurito", "Stade plein"],
    "um dos melhores times da Série B": ["one of the best teams in Série B", "uno de los mejores equipos de la Série B", "una delle migliori squadre della Série B", "l'une des meilleures équipes de Série B"],
    "um time bom da Série B": ["a good Série B team", "un buen equipo de la Série B", "una buona squadra di Série B", "une bonne équipe de Série B"],
    "um time da Série B": ["a Série B team", "un equipo de la Série B", "una squadra di Série B", "une équipe de Série B"],
    "Toque de bola, pressão alta e muita gente no ataque.": ["Passing game, high press and lots of players going forward.", "Toque de balón, presión alta y mucha gente en ataque.", "Possesso palla, pressing alto e tanti uomini in attacco.", "Jeu de passes, pressing haut et beaucoup de monde en attaque."],
    "Defesa muito bem armada e contra-ataque rápido.": ["Very well-organized defense and quick counterattacks.", "Defensa muy bien armada y contraataque rápido.", "Difesa ben organizzata e contropiede rapido.", "Défense très bien organisée et contre-attaque rapide."],
    "Compacto, troca passes e não se desespera.": ["Compact, passes it around and never panics.", "Compacto, toca el balón y no se desespera.", "Compatto, fa girare palla e non si dispera.", "Compact, fait circuler le ballon et ne panique jamais."],
    "Paciente com a bola; o centroavante volta para armar.": ["Patient on the ball; the striker drops deep to build play.", "Paciente con el balón; el delantero centro baja a armar el juego.", "Paziente con la palla; il centravanti arretra per impostare.", "Patient avec le ballon ; l'avant-centre décroche pour construire."],
    "Equilibrado: defesa firme e laterais que apoiam.": ["Balanced: solid defense and full-backs who push forward.", "Equilibrado: defensa firme y laterales que suben.", "Equilibrato: difesa solida e terzini che spingono.", "Équilibré : défense solide et latéraux qui montent."],
    "Forte na bola parada e no cruzamento; a defesa sofre.": ["Strong at set pieces and crosses; the defense struggles.", "Fuerte a balón parado y en los centros; la defensa sufre.", "Forte sui calci piazzati e sui cross; la difesa soffre.", "Fort sur coups de pied arrêtés et centres ; la défense souffre."],
    "Fecha a casinha atrás e aposta nos lançamentos.": ["Locks it down at the back and relies on long balls.", "Cierra el arco atrás y apuesta por los pelotazos.", "Chiude tutto dietro e punta sui lanci lunghi.", "Ferme la boutique derrière et mise sur les longs ballons."],
    "Ataque forte e rápido; a defesa às vezes fica exposta.": ["Strong, fast attack; the defense is sometimes left exposed.", "Ataque fuerte y rápido; la defensa a veces queda expuesta.", "Attacco forte e veloce; la difesa a volte resta scoperta.", "Attaque forte et rapide ; la défense est parfois exposée."],
    "Marca forte no meio e sai rápido nas costas da defesa.": ["Tough in midfield and breaks quickly in behind the defense.", "Marca fuerte en el medio y sale rápido a la espalda de la defensa.", "Marca forte a centrocampo e attacca veloce alle spalle della difesa.", "Pressing fort au milieu et sorties rapides dans le dos de la défense."],
    "Gosta de ficar com a bola e joga pelos lados.": ["Likes to keep the ball and plays down the flanks.", "Le gusta tener el balón y juega por las bandas.", "Ama tenere palla e gioca sulle fasce.", "Aime garder le ballon et joue sur les côtés."],
    "Cruzamento na área o tempo todo e zagueiros que sobem na bola parada.": ["Crosses into the box all the time and center-backs who go up for set pieces.", "Centros al área todo el tiempo y centrales que suben a balón parado.", "Cross in area di continuo e difensori che salgono sui calci piazzati.", "Des centres dans la surface sans arrêt et des défenseurs qui montent sur coups de pied arrêtés."],
    "Ataque criativo, mas leva gol com facilidade.": ["Creative attack, but concedes easily.", "Ataque creativo, pero recibe goles con facilidad.", "Attacco creativo, ma subisce gol facilmente.", "Attaque créative, mais encaisse facilement."],
    "Fechadinho atrás: sofre poucos gols e faz poucos também.": ["Tight at the back: concedes few goals and scores few too.", "Cerradito atrás: recibe pocos goles y marca pocos también.", "Chiuso dietro: subisce pochi gol e ne segna pochi.", "Fermé derrière : encaisse peu de buts et en marque peu aussi."],
    "Raçudo: marca em cima e vive de contra-ataque.": ["Gritty: presses hard and lives on counterattacks.", "Aguerrido: presiona encima y vive del contraataque.", "Grintoso: pressa alto e vive di contropiede.", "Accrocheur : presse haut et vit de contre-attaques."],
    "Defesa organizadíssima: sofreu pouquíssimos gols na última campanha.": ["Super-organized defense: conceded very few goals last season.", "Defensa organizadísima: recibió poquísimos goles en la última campaña.", "Difesa organizzatissima: ha subito pochissimi gol nell'ultima stagione.", "Défense ultra organisée : très peu de buts encaissés la saison dernière."],
    "Chega bastante na frente, mas a defesa é o ponto fraco.": ["Gets forward a lot, but the defense is the weak spot.", "Llega mucho arriba, pero la defensa es el punto débil.", "Arriva spesso davanti, ma la difesa è il punto debole.", "Se projette beaucoup, mais la défense est le point faible."],
    "Compacto, sofre pouco e decide na bola parada.": ["Compact, concedes little and wins games from set pieces.", "Compacto, recibe poco y decide a balón parado.", "Compatto, subisce poco e decide sui calci piazzati.", "Compact, encaisse peu et fait la différence sur coups de pied arrêtés."],
    "Marca muito e ataca pouco: depende de um gol no contra-ataque.": ["Defends a lot and attacks little: depends on a counterattack goal.", "Marca mucho y ataca poco: depende de un gol de contraataque.", "Difende tanto e attacca poco: dipende da un gol in contropiede.", "Défend beaucoup et attaque peu : dépend d'un but en contre."],
    "Joga recuado e tenta escapar com os pontas.": ["Sits deep and tries to break out through the wingers.", "Juega replegado e intenta escapar con los extremos.", "Gioca arretrato e prova a ripartire con le ali.", "Joue bas et tente de s'échapper par les ailiers."],
    "Aposta em cruzamentos para o centroavante grandão.": ["Relies on crosses for the big center-forward.", "Apuesta por los centros para el delantero grandote.", "Punta sui cross per il centravanti grosso.", "Mise sur les centres pour le grand avant-centre."],
    "Time do interior: muita vontade e pouca técnica.": ["Small-town team: lots of heart, little skill.", "Equipo del interior: mucha garra y poca técnica.", "Squadra di provincia: tanta voglia e poca tecnica.", "Équipe de province : beaucoup de cœur, peu de technique."],
    "Lúcia Alves": ["Lucy Alves", "Lucía Alves", "Lucia Alves", "Lucie Alves"],
    "Expulsa?! Assim você complica o time inteiro.": ["Sent off?! That makes things hard for the whole team.", "¿¡Expulsada!? Así complicas a todo el equipo.", "Espulsa?! Così metti in difficoltà tutta la squadra.", "Expulsée ?! Comme ça, tu mets toute l'équipe en difficulté."],
  };
  if (typeof I18N !== 'undefined') for (const k of Object.keys(TRAD)) if (!I18N[k]) I18N[k] = TRAD[k];
  // o que muda quando a personagem é feminina (o português muda: FEM_PT; só outro idioma muda: FEM_TRAD)
  if (typeof FEM_PT !== 'undefined') Object.assign(FEM_PT, {"machucado por {0} jogo(s)": "machucada por {0} jogo(s)", "Expulso?! Assim você complica o time inteiro.": "Expulsa?! Assim você complica o time inteiro.", "Você ainda não é jogador profissional.": "Você ainda não é jogadora profissional."});
  const FEM = {
    "suspenso por {0} jogo(s)": [null, "suspendida por {0} partido(s)", "squalificata per {0} partita/e", "suspendue pour {0} match(s)"],
    "Você não apareceu no ônibus do jogo contra o {0}.": [null, null, "Non ti sei presentata al pullman per la partita contro {0}.", "Tu n'es pas venue prendre le bus du match contre {0}."],
    "Você foi muito bem no último jogo: continua no time titular.": [null, null, "Sei andata molto bene nell'ultima partita: resti titolare.", "Tu as très bien joué au dernier match : tu restes titulaire."],
    "Acho que eu fui muito bem... agora é esperar a resposta dos olheiros.": [null, null, "Credo di essere andata molto bene... ora devo aspettare la risposta degli osservatori.", null],
    "Estou tendo a chance da minha vida, maior de idade agora: jogar futebol profissional.": [null, null, null, "J'ai la chance de ma vie, maintenant que je suis majeure : jouer au football professionnel."],
    "Hoje não foi o seu dia. Treina, cuida do corpo e volta melhor.": [null, null, null, "Ce n'était pas ton jour. Entraîne-toi, prends soin de ton corps et reviens plus forte."],
  };
  if (typeof FEM_TRAD !== 'undefined') for (const k of Object.keys(FEM)) if (!FEM_TRAD[k]) FEM_TRAD[k] = FEM[k];


  window.FutebolJS.registrarFase({ id: 'serieb', nome: 'Série B', nucleoMinimo: '7.1', iniciar: async () => {}, criar, carta, aceitarOferta, fraseOferta,
    dados: { TIMES_B, TIME_DE, classificacao, urlArte, arte, estrelasTxt, carreiraHtml, FAIXAS_POP, desempenhoPeneira, faixaPeneira, gerarOfertas, novaTemporada, elencoB, forcaTime, timeMotor, SALARIOS } });
})();
