/* ==============================================================================================================================
   campeoes.js — A COPA DOS CAMPEÕES (a copa europeia dos clubes da partida livre): o que ela tem de próprio na tela e no som.
   - A competição em si (o sorteio, a fase de liga, o mata-mata em ida e volta e a final) fica no livre.js, junto do campeonato e da
     Copa do Brasil. Aqui ficam: o escudo da copa (logo), a música de abertura (o "hino": coral, cordas, metais, tímpanos e sinos,
     tudo sintetizado na hora, com melodia própria), a vinheta de abertura (a tela azul-noite com as estrelas, a taça e os dois
     escudos) e o pano redondo do círculo central (para a foto dos times perfilados).
   - O livre.js baixa este arquivo com Fases.carregar('campeoes') e usa window.Campeoes.
   - O nome da copa está em NOME (um texto só, traduzido no fim do arquivo).
   ============================================================================================================================== */
(() => {
  'use strict';
  const NOME = 'Copa dos Campeões';
  const Tx = (s) => (typeof T === 'function' ? T(s) : s);
  const esperar = (ms) => new Promise((ok) => setTimeout(ok, ms));
  const PRATA = ['#ffffff', '#e4e9f2', '#b9c3d3', '#8a96aa'], AZUL = ['#020718', '#06143a', '#0c2266', '#1b3a9a'];

  // ============================================================================================ O ESCUDO DA COPA
  //   A taça de alças grandes no meio de um anel de dez estrelas, em prata, desenhada em baixa resolução (fica em pixel art)
  function estrela5(g, x, y, r, rot) {
    g.beginPath();
    for (let i = 0; i < 10; i++) { const a = rot + i * Math.PI / 5 - Math.PI / 2, rr = i % 2 ? r * 0.45 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    g.closePath(); g.fill();
  }
  function prata(g, x0, y0, x1, y1) { const gr = g.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, PRATA[0]); gr.addColorStop(0.35, PRATA[1]); gr.addColorStop(0.7, PRATA[2]); gr.addColorStop(1, PRATA[3]); return gr; }
  // desenha o escudo em g (centro cx, cy; tamanho s); giro: o anel de estrelas girando (vinheta)
  function desenharLogo(g, cx, cy, s, giro, brilho) {
    const u = s / 100;
    g.save(); g.translate(cx - 50 * u, cy - 50 * u);
    g.fillStyle = prata(g, 0, 0, 100 * u, 100 * u);
    for (let i = 0; i < 10; i++) { const a = (giro || 0) + i * Math.PI / 5; estrela5(g, 50 * u + Math.cos(a) * 44 * u, 50 * u + Math.sin(a) * 44 * u, 5.2 * u, a); }
    // as alças (as "orelhas")
    g.strokeStyle = prata(g, 0, 20 * u, 0, 70 * u); g.lineWidth = 4.2 * u;
    for (const s2 of [-1, 1]) { g.beginPath(); g.ellipse(50 * u + s2 * 21 * u, 40 * u, 8.5 * u, 13.5 * u, s2 * 0.18, 0, Math.PI * 2); g.stroke(); }
    // o bojo, a borda, o pé e a base
    g.fillStyle = prata(g, 32 * u, 0, 68 * u, 0);
    g.beginPath(); g.moveTo(31 * u, 24 * u); g.lineTo(69 * u, 24 * u); g.quadraticCurveTo(69 * u, 53 * u, 50 * u, 59 * u); g.quadraticCurveTo(31 * u, 53 * u, 31 * u, 24 * u); g.fill();
    g.fillRect(29 * u, 21 * u, 42 * u, 4.5 * u);
    g.fillRect(46.5 * u, 58 * u, 7 * u, 10 * u);
    g.beginPath(); g.ellipse(50 * u, 63 * u, 6 * u, 2.6 * u, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.moveTo(38 * u, 68 * u); g.lineTo(62 * u, 68 * u); g.lineTo(66 * u, 77 * u); g.lineTo(34 * u, 77 * u); g.closePath(); g.fill();
    g.fillStyle = 'rgba(12,34,102,.55)'; g.fillRect(36 * u, 72 * u, 28 * u, 2 * u);
    // o reflexo no bojo
    g.fillStyle = 'rgba(255,255,255,' + (0.55 + 0.4 * (brilho || 0)) + ')';
    g.beginPath(); g.moveTo(37 * u, 27 * u); g.lineTo(42 * u, 27 * u); g.quadraticCurveTo(41 * u, 45 * u, 47 * u, 53 * u); g.quadraticCurveTo(37 * u, 47 * u, 37 * u, 27 * u); g.fill();
    g.restore();
  }
  const LOGOS = {};
  function logo(px) {
    px = px || 64; if (LOGOS[px]) return LOGOS[px];
    const c = document.createElement('canvas'); c.width = c.height = px; const g = c.getContext('2d');
    desenharLogo(g, px / 2, px / 2, px * 0.98, 0, 0);
    return (LOGOS[px] = c);
  }
  const URLS = {};
  const logoURL = (px) => URLS[px] || (URLS[px] = logo(px).toDataURL());

  // o pano redondo do círculo central: azul-noite, o anel de estrelas e a taça, com o nome em volta
  function pano() {
    const N = 256, c = document.createElement('canvas'); c.width = c.height = N; const g = c.getContext('2d');
    const gr = g.createRadialGradient(N / 2, N / 2, 10, N / 2, N / 2, N / 2); gr.addColorStop(0, AZUL[3]); gr.addColorStop(0.7, AZUL[2]); gr.addColorStop(1, AZUL[1]);
    g.fillStyle = gr; g.beginPath(); g.arc(N / 2, N / 2, N / 2 - 1, 0, Math.PI * 2); g.fill();
    g.strokeStyle = PRATA[1]; g.lineWidth = 4; g.beginPath(); g.arc(N / 2, N / 2, N / 2 - 6, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 1.5; g.beginPath(); g.arc(N / 2, N / 2, N / 2 - 30, 0, Math.PI * 2); g.stroke();
    desenharLogo(g, N / 2, N / 2, 150, 0, 0.3);
    const txt = Tx(NOME).toUpperCase() + ' · ' + Tx(NOME).toUpperCase() + ' · ';
    g.fillStyle = PRATA[0]; g.font = "bold 15px 'Silkscreen', 'Courier New', monospace"; g.textAlign = 'center'; g.textBaseline = 'middle';
    const R = N / 2 - 18, n = txt.length;
    for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + (i / n) * Math.PI * 2; g.save(); g.translate(N / 2 + Math.cos(a) * R, N / 2 + Math.sin(a) * R); g.rotate(a + Math.PI / 2); g.fillText(txt[i], 0, 0); g.restore(); }
    return c;
  }

  // ============================================================================================ A MÚSICA (o "hino" da copa)
  //   Melodia e harmonia próprias, em ré maior, no clima solene das aberturas de copa europeia: coral (vozes com os formantes do
  //   "a" e do "o"), cordas, metais, tímpanos, pratos e sinos, com uma reverberação de catedral. Duas partes:
  //     'intro' (≈ 8,6 s): o rufar, os sinos subindo, o coral e a fanfarra dos metais (a vinheta).
  //     'hino'  (≈ 19 s): o coral cantando o tema inteiro (a entrada dos times e a foto), terminando no acorde final com prato.
  //   Sai pelo volume de MÚSICA do jogo (Som.audio.musica) e respeita o mudo.
  const BPM = 84, BT = 60 / BPM;
  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const VOG = { a: [[800, 1, 7], [1150, 0.55, 9], [2800, 0.14, 13]], o: [[460, 1, 7], [820, 0.5, 8], [2830, 0.08, 13]] };
  let MUS = null;
  function audio() { return typeof Som !== 'undefined' && Som.audio && !Som.mudo ? Som.audio : null; }
  function impulso(c, seg) {
    const n = Math.floor(c.sampleRate * seg), b = c.createBuffer(2, n, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3.4); }
    return b;
  }
  let RUIDO = null;
  function ruido(c) { if (!RUIDO || RUIDO.sampleRate !== c.sampleRate) { RUIDO = c.createBuffer(1, c.sampleRate * 2, c.sampleRate); const d = RUIDO.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; } return RUIDO; }
  function env(c, g, t, ataque, vol, fim, solta) {
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + ataque);
    g.gain.setValueAtTime(vol, Math.max(t + ataque, fim - 0.04)); g.gain.exponentialRampToValueAtTime(0.0001, fim + solta);
  }
  function coro(c, dst, t, m, dur, vol, vog) {
    const f = hz(m), src = c.createGain(), e = c.createGain(), fim = t + dur; src.gain.value = 0.62;
    const os = [-11, 0, 8].map((d) => { const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = d; o.connect(src); return o; });
    const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = 4.4 + Math.random() * 0.9; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(f * 0.008, t + 0.5); lfo.connect(lg); for (const o of os) lg.connect(o.frequency);
    for (const [fr, gn, q] of VOG[vog || 'a']) { const bp = c.createBiquadFilter(), gg = c.createGain(); bp.type = 'bandpass'; bp.frequency.value = fr; bp.Q.value = q; gg.gain.value = gn; src.connect(bp); bp.connect(gg); gg.connect(e); }
    env(c, e, t, 0.16, vol, fim, 0.5); e.connect(dst);
    for (const o of os.concat(lfo)) { o.start(t); o.stop(fim + 0.6); }
  }
  function cordas(c, dst, t, m, dur, vol) {
    const f = hz(m), e = c.createGain(), lp = c.createBiquadFilter(), fim = t + dur; lp.type = 'lowpass'; lp.frequency.value = 1500; lp.Q.value = 0.6;
    const os = [-7, 6].map((d) => { const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = d; o.connect(lp); return o; });
    lp.connect(e); env(c, e, t, 0.32, vol, fim, 0.7); e.connect(dst);
    for (const o of os) { o.start(t); o.stop(fim + 0.8); }
  }
  function metal(c, dst, t, m, dur, vol) {
    const f = hz(m), e = c.createGain(), lp = c.createBiquadFilter(), fim = t + dur; lp.type = 'lowpass'; lp.Q.value = 1.2;
    lp.frequency.setValueAtTime(420, t); lp.frequency.exponentialRampToValueAtTime(2600, t + 0.09); lp.frequency.exponentialRampToValueAtTime(1500, t + 0.4);
    const o1 = c.createOscillator(), o2 = c.createOscillator(); o1.type = 'sawtooth'; o2.type = 'square'; o1.frequency.value = f; o2.frequency.value = f; o2.detune.value = 4;
    const g2 = c.createGain(); g2.gain.value = 0.35; o1.connect(lp); o2.connect(g2); g2.connect(lp);
    lp.connect(e); env(c, e, t, 0.05, vol, fim, 0.25); e.connect(dst);
    for (const o of [o1, o2]) { o.start(t); o.stop(fim + 0.35); }
  }
  function tambor(c, dst, t, m, vol, dec) {
    const f = hz(m); dec = dec || 1.5;
    for (const [k, v] of [[1, 1], [1.5, 0.35], [2.0, 0.15]]) {
      const o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(f * k * 1.04, t); o.frequency.exponentialRampToValueAtTime(f * k, t + 0.08);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol * v, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + dec / k);
      o.connect(g); g.connect(dst); o.start(t); o.stop(t + dec + 0.05);
    }
    const s = c.createBufferSource(), lp = c.createBiquadFilter(), g = c.createGain(); s.buffer = ruido(c); lp.type = 'lowpass'; lp.frequency.value = 500;
    g.gain.setValueAtTime(vol * 0.5, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12); s.connect(lp); lp.connect(g); g.connect(dst); s.start(t, Math.random(), 0.15);
  }
  function rufo(c, dst, t, m, dur, v0, v1) { const n = Math.floor(dur / 0.06); for (let i = 0; i < n; i++) tambor(c, dst, t + i * 0.06 + Math.random() * 0.008, m, v0 + (v1 - v0) * (i / n), 0.25); }
  function prato(c, dst, t, vol, dur, sobe) {
    const s = c.createBufferSource(), hp = c.createBiquadFilter(), bp = c.createBiquadFilter(), g = c.createGain(); s.buffer = ruido(c);
    hp.type = 'highpass'; hp.frequency.value = 4200; bp.type = 'peaking'; bp.frequency.value = 8500; bp.gain.value = 6;
    if (sobe) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + dur); g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.05); }
    else { g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); }
    s.connect(hp); hp.connect(bp); bp.connect(g); g.connect(dst); s.loop = true; s.start(t); s.stop(t + dur + 0.1);
  }
  function sino(c, dst, t, m, vol) {
    const f = hz(m);
    for (const [k, v, d] of [[1, 1, 1.8], [2.76, 0.32, 0.9], [5.4, 0.12, 0.5]]) {
      const o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.value = f * k;
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol * v, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(g); g.connect(dst); o.start(t); o.stop(t + d + 0.05);
    }
  }
  // as notas (em tempos de batida): [início, nota MIDI, duração]
  const D = { D2: 38, A2: 45, B2: 47, G2: 43, E2: 40, Fs2: 42, D3: 50, A3: 57, G3: 55, B3: 59, E3: 52, Fs3: 54, Cs4: 61, D4: 62, E4: 64, Fs4: 66, G4: 67, A4: 69, B4: 71, Cs5: 73,
    D5: 74, E5: 76, Fs5: 78, G5: 79, A5: 81, B5: 83, Cs6: 85, D6: 86, Fs6: 90, A6: 93 };
  function tocarIntro(c, dst, t0) {
    const b = (x) => t0 + x * BT;
    for (const m of [D.D2, D.A2, D.D3]) cordas(c, dst, b(0), m, 4 * BT, 0.07);
    rufo(c, dst, b(0), D.A2, 3.7 * BT, 0.02, 0.2); tambor(c, dst, b(4), D.D3 - 12, 0.5, 2.2); prato(c, dst, b(3), 0.06, BT, true); prato(c, dst, b(4), 0.1, 3.4);
    [D.A5, D.D6, D.Fs6, D.A6, D.Fs6, D.D6].forEach((m, i) => sino(c, dst, b(0.5 + i * 0.5), m, 0.07));
    for (const [m, v] of [[D.D4, 'o'], [D.Fs4, 'o'], [D.A4, 'o'], [D.D5, 'o'], [D.D3, 'o']]) coro(c, dst, b(4), m, 4 * BT, 0.11, v);
    for (const m of [D.D3, D.A3, D.Fs4]) cordas(c, dst, b(4), m, 4 * BT, 0.05);
    [[4, D.A4, 0.5], [4.5, D.D5, 0.5], [5, D.Fs5, 1], [6, D.E5, 0.5], [6.5, D.D5, 0.5], [7, D.A5, 1]].forEach(([x, m, d]) => { metal(c, dst, b(x), m, d * BT, 0.09); metal(c, dst, b(x), m - 12, d * BT, 0.06); });
    for (const [m, v] of [[D.G3, 'a'], [D.D4, 'a'], [D.G4, 'a'], [D.B4, 'a']]) coro(c, dst, b(8), m, 2 * BT, 0.1, v);
    for (const [m, v] of [[D.A3, 'a'], [D.E4, 'a'], [D.A4, 'a'], [D.Cs5, 'a']]) coro(c, dst, b(10), m, 1 * BT, 0.1, v);
    for (const [m, v] of [[D.D3, 'o'], [D.Fs4, 'o'], [D.A4, 'o'], [D.D5, 'o']]) coro(c, dst, b(11), m, 1.6 * BT, 0.11, v);
    metal(c, dst, b(8), D.B4, 2 * BT, 0.07); metal(c, dst, b(10), D.Cs5, BT, 0.07); metal(c, dst, b(11), D.D5, 1.6 * BT, 0.09);
    tambor(c, dst, b(11), D.D3 - 12, 0.45, 2.4); prato(c, dst, b(11), 0.08, 3); sino(c, dst, b(11), D.D6, 0.06);
    return 12.6 * BT;
  }
  function tocarHino(c, dst, t0) {
    const b = (x) => t0 + x * BT;
    // [compasso, soprano [[início no compasso, nota, duração]], contralto, tenor, baixo]
    const S = [[0, D.Fs5, 2], [2, D.A5, 1], [3, D.G5, 1], [4, D.G5, 1.5], [5.5, D.Fs5, 0.5], [6, D.E5, 1], [7, D.D5, 1], [8, D.D5, 1], [9, D.E5, 1], [10, D.Fs5, 1], [11, D.B5, 1],
      [12, D.A5, 4], [16, D.B5, 2], [18, D.A5, 1], [19, D.G5, 1], [20, D.D6, 6]];
    const A = [[0, D.D5, 4], [4, D.D5, 2], [6, D.Cs5, 2], [8, D.B4, 4], [12, D.D5, 2], [14, D.Cs5, 2], [16, D.D5, 2], [18, D.E5, 2], [20, D.Fs5, 6]];
    const Tn = [[0, D.A4, 4], [4, D.B4, 2], [6, D.A4, 2], [8, D.Fs4, 2], [10, D.G4, 2], [12, D.E4, 4], [16, D.B4, 2], [18, D.Cs5, 2], [20, D.A4, 6]];
    const B = [[0, D.D3, 4], [4, D.B2, 2], [6, D.A2, 2], [8, D.B2, 2], [10, D.G2, 2], [12, D.A2, 4], [16, D.G2, 2], [18, D.A2, 2], [20, D.D3, 6]];
    for (const [x, m, d] of S) coro(c, dst, b(x), m, d * BT, 0.16, x >= 20 ? 'o' : 'a');
    for (const [x, m, d] of A) coro(c, dst, b(x), m, d * BT, 0.11, 'a');
    for (const [x, m, d] of Tn) coro(c, dst, b(x), m, d * BT, 0.11, 'a');
    for (const [x, m, d] of B) { coro(c, dst, b(x), m, d * BT, 0.12, 'o'); cordas(c, dst, b(x), m - 12, d * BT, 0.06); cordas(c, dst, b(x), m + 7, d * BT, 0.035); }
    for (const [x, m, d] of S) if (x >= 16) { metal(c, dst, b(x), m - 12, d * BT, 0.07); metal(c, dst, b(x), m - 24, d * BT, 0.05); }
    for (const x of [0, 4, 8, 12]) sino(c, dst, b(x), D.A5 + (x === 8 ? 2 : 0), 0.03);
    tambor(c, dst, b(16), D.G2, 0.32); tambor(c, dst, b(18), D.A2, 0.34); rufo(c, dst, b(19), D.A2, BT * 0.95, 0.05, 0.22);
    prato(c, dst, b(18.5), 0.07, 1.5 * BT, true); tambor(c, dst, b(20), D.D3 - 12, 0.55, 3); prato(c, dst, b(20), 0.11, 4.5);
    [D.D6, D.A5, D.Fs6, D.D6, D.A6].forEach((m, i) => sino(c, dst, b(20.5 + i * 0.5), m, 0.05));
    return 26.5 * BT;
  }
  // tocar(parte): começa a tocar; devolve a duração em segundos (0 sem som). parar(seg): some aos poucos.
  function tocar(parte) {
    const A = audio(); if (!A) return 0;
    parar(0.25);
    const c = A.ctx; try { if (c.state === 'suspended') c.resume(); } catch (e) { /* nada */ }
    const bus = c.createGain(), seco = c.createGain(), rev = c.createConvolver(), molhado = c.createGain(), saida = A.musica || A.mestre;
    rev.buffer = impulso(c, 3.2); seco.gain.value = 0.72; molhado.gain.value = 0.6;
    bus.gain.value = 1; bus.connect(seco); bus.connect(rev); rev.connect(molhado); seco.connect(saida); molhado.connect(saida);
    const t0 = c.currentTime + 0.06, dur = parte === 'hino' ? tocarHino(c, bus, t0) : tocarIntro(c, bus, t0);
    const eu = { bus, nos: [seco, rev, molhado], fim: t0 + dur + 3.5 };
    MUS = eu;
    setTimeout(() => { if (MUS === eu) MUS = null; desligar(eu); }, (dur + 4) * 1000);
    return dur;
  }
  function desligar(m) { try { m.bus.disconnect(); for (const n of m.nos) n.disconnect(); } catch (e) { /* nada */ } }
  function parar(seg) {
    const m = MUS; if (!m) return; MUS = null;
    const A = audio(), c = A ? A.ctx : null;
    if (!c) { desligar(m); return; }
    const t = c.currentTime, s = Math.max(0.05, seg == null ? 1.2 : seg);
    try { m.bus.gain.cancelScheduledValues(t); m.bus.gain.setValueAtTime(m.bus.gain.value, t); m.bus.gain.exponentialRampToValueAtTime(0.0001, t + s); } catch (e) { /* nada */ }
    setTimeout(() => desligar(m), (s + 0.2) * 1000);
  }

  // ============================================================================================ A VINHETA DE ABERTURA
  //   op = { a: { nome, sigla, url }, b: { ... } (mandante e visitante), fase (texto), estadio (texto), dur (segundos),
  //          parar: () => true quando o jogador tocou em PULAR }. A tela é desenhada em 270 linhas (pixel art) e cobre o jogo.
  function carregarImg(url) { return new Promise((ok) => { if (!url) return ok(null); const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = url; }); }
  async function intro(op) {
    const H = 270, el = document.createElement('canvas'), g = el.getContext('2d');
    const medir = () => { const W = Math.max(320, Math.round(H * (innerWidth / Math.max(1, innerHeight)))); if (el.width !== W) { el.width = W; el.height = H; } };
    medir();
    el.id = 'cpVinheta'; el.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:43;image-rendering:pixelated;background:#020718';
    document.body.appendChild(el);
    const [ia, ib] = await Promise.all([carregarImg(op.a && op.a.url), carregarImg(op.b && op.b.url)]);
    const dur = op.dur || 8.4, rnd = (n) => ((Math.sin(n * 91.17) * 43758.5453) % 1 + 1) % 1;
    const ESTR = Array.from({ length: 150 }, (_, i) => ({ x: rnd(i + 1), y: rnd(i + 300), r: rnd(i + 600) < 0.12 ? 2 : 1, f: 0.5 + rnd(i + 900) * 3, ph: rnd(i + 1200) * 6.3 }));
    const fonte = (px) => "bold " + px + "px 'Silkscreen', 'Courier New', monospace";
    const titulo = Tx(NOME).toUpperCase();
    const suave = (x) => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
    const t0 = performance.now();
    await new Promise((ok) => {
      const quadro = () => {
        const t = (performance.now() - t0) / 1000;
        if (t >= dur || (op.parar && op.parar())) { ok(); return; }
        medir();
        const W = el.width, cx = W / 2;
        const gr = g.createRadialGradient(cx, H * 0.42, 10, cx, H * 0.42, W * 0.75); gr.addColorStop(0, AZUL[3]); gr.addColorStop(0.45, AZUL[2]); gr.addColorStop(1, AZUL[0]);
        g.fillStyle = gr; g.fillRect(0, 0, W, H);
        // os fachos de luz girando atrás da taça
        g.save(); g.translate(cx, H * 0.4); g.rotate(t * 0.12); g.fillStyle = 'rgba(160,190,255,' + (0.05 + 0.04 * Math.sin(t * 1.3)) + ')';
        for (let i = 0; i < 12; i++) { g.rotate(Math.PI / 6); g.beginPath(); g.moveTo(0, 0); g.lineTo(W, -26); g.lineTo(W, 26); g.closePath(); g.fill(); }
        g.restore();
        // as estrelas piscando
        for (const s of ESTR) { const a = 0.35 + 0.65 * Math.max(0, Math.sin(t * s.f + s.ph)); g.fillStyle = 'rgba(255,255,255,' + a.toFixed(2) + ')'; g.fillRect(Math.round(s.x * W), Math.round(s.y * H), s.r, s.r); }
        // a taça: cresce, brilha e depois sobe para dar lugar aos escudos
        const k1 = suave(t / 1.6), k2 = suave((t - 3.6) / 1.0);
        const tam = (40 + 90 * k1) * (1 - 0.32 * k2), ly = H * (0.42 - 0.16 * k2);
        g.save(); g.shadowColor = 'rgba(170,200,255,.9)'; g.shadowBlur = 14 + 8 * Math.sin(t * 3);
        g.globalAlpha = k1; desenharLogo(g, cx, ly, tam, t * 0.5, Math.max(0, Math.sin(t * 2.2))); g.restore();
        // o nome da copa (letra por letra) com o brilho passando
        const nL = Math.floor(Math.max(0, t - 1.2) * 14), txt = titulo.slice(0, nL);
        if (txt) {
          const ty = ly + tam * 0.5 + 18; g.font = fonte(17); g.textAlign = 'center'; g.textBaseline = 'middle';
          g.fillStyle = '#000'; g.fillText(txt, cx + 1, ty + 2);
          const gt = g.createLinearGradient(0, ty - 9, 0, ty + 9); gt.addColorStop(0, PRATA[0]); gt.addColorStop(0.6, PRATA[1]); gt.addColorStop(1, PRATA[3]); g.fillStyle = gt; g.fillText(txt, cx, ty);
          const larg = g.measureText(titulo).width, bx = cx - larg / 2 + ((t * 0.9) % 1.6) / 1.6 * (larg + 60) - 30;
          g.save(); g.beginPath(); g.rect(bx, ty - 10, 12, 20); g.clip(); g.fillStyle = 'rgba(255,255,255,.85)'; g.fillText(txt, cx, ty); g.restore();
        }
        // os dois escudos entrando pelos lados, o "x" e a fase
        const k3 = suave((t - 4.2) / 0.9);
        if (k3 > 0) {
          const ys = H * 0.72, e = 64, dx = W * 0.26;
          const lado = (img, nome, s) => {
            const x = cx + s * (dx + (1 - k3) * W * 0.5);
            g.save(); g.shadowColor = 'rgba(0,0,0,.7)'; g.shadowBlur = 6; g.imageSmoothingEnabled = false;
            if (img) g.drawImage(img, Math.round(x - e / 2), Math.round(ys - e / 2 - 8), e, e); g.restore();
            g.font = fonte(9); g.textAlign = 'center'; g.fillStyle = '#000'; g.fillText(nome, x + 1, ys + e / 2 + 2); g.fillStyle = PRATA[0]; g.fillText(nome, x, ys + e / 2 + 1);
          };
          lado(ia, ((op.a && op.a.nome) || '').toUpperCase(), -1); lado(ib, ((op.b && op.b.nome) || '').toUpperCase(), 1);
          g.globalAlpha = k3; g.font = fonte(22); g.textAlign = 'center'; g.fillStyle = '#000'; g.fillText('x', cx + 1, ys - 6); g.fillStyle = PRATA[1]; g.fillText('x', cx, ys - 8);
          g.font = fonte(9); const linha = [op.fase, op.estadio].filter(Boolean).join(' · ').toUpperCase();
          g.fillStyle = 'rgba(2,7,24,.65)'; const lw = g.measureText(linha).width + 18; g.fillRect(cx - lw / 2, H - 26, lw, 15);
          g.fillStyle = PRATA[1]; g.fillText(linha, cx, H - 18); g.globalAlpha = 1;
        }
        // o começo e o fim no preto
        const esc = Math.max(1 - suave(t / 0.6), suave((t - dur + 0.45) / 0.45));
        if (esc > 0) { g.fillStyle = 'rgba(0,0,0,' + esc.toFixed(3) + ')'; g.fillRect(0, 0, W, H); }
        requestAnimationFrame(quadro);
      };
      requestAnimationFrame(quadro);
    });
    return { fechar: () => { if (el.parentNode) el.parentNode.removeChild(el); } };
  }

  // ============================================================================================ OS TEXTOS (en, es, it, fr)
  const TRAD = {
    'Copa dos Campeões': ['Champions Cup', 'Copa de Campeones', 'Coppa dei Campioni', 'Coupe des Champions'],
  };
  if (typeof I18N !== 'undefined') for (const k of Object.keys(TRAD)) if (!I18N[k]) I18N[k] = TRAD[k];

  const API = { NOME, logo, logoURL, desenharLogo, pano, tocar, parar, intro, esperar, _t: { tocarIntro, tocarHino } };
  window.Campeoes = API;
  if (window.FutebolJS && window.FutebolJS.registrarFase) window.FutebolJS.registrarFase(Object.assign({ id: 'campeoes', nome: 'Copa dos Campeões', nucleoMinimo: '7.5', iniciar: async () => {} }, API));
})();
