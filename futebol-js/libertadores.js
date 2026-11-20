/* ==============================================================================================================================
   libertadores.js — A LIBERTADORES (a copa sul-americana dos clubes da partida livre): o que ela tem de próprio na tela e no som.
   - A competição em si (as fases prévias, os 8 grupos, o mata-mata em ida e volta e a final) fica no livre.js, junto do campeonato,
     da Copa do Brasil e da Copa dos Campeões. Aqui ficam: o escudo da copa (logo), a música (o "hino": bombo, charango, quena, coral,
     metais e cordas, tudo sintetizado, com melodia própria em lá menor), a vinheta de abertura (a noite preta e dourada, os
     raios de sol girando, as bandeirinhas de papel picado, o papel picado caindo, a taça e os dois escudos) e o pano redondo do
     círculo central (para a foto dos times perfilados).
   - O livre.js baixa este arquivo com Fases.carregar('libertadores') e usa window.Libertadores (o mesmo jeito do campeoes.js:
     intro, tocar, parar, preparar, pano, logoURL).
   ============================================================================================================================== */
(() => {
  'use strict';
  const NOME = 'Libertadores';
  const Tx = (s) => (typeof T === 'function' ? T(s) : s);
  const esperar = (ms) => new Promise((ok) => setTimeout(ok, ms));
  const OURO = ['#fff4c2', '#f2c230', '#c8901a', '#7a5210'], NOITE = ['#050302', '#140904', '#2a1206', '#4a1a08'];
  const PICADO = ['#e0312b', '#f2c230', '#2bb673', '#2a72d6', '#9b4fd0', '#f07a1a', '#f4f4f0'];

  // ============================================================================================ O ESCUDO DA COPA
  //   O disco preto com o aro dourado, os raios de sol atrás, a taça dourada com as alças em asa (abertas para cima), a estrela em
  //   cima e os ramos de louro embaixo. Desenhado em baixa resolução (fica em pixel art).
  function ouro(g, x0, y0, x1, y1) { const gr = g.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, OURO[0]); gr.addColorStop(0.35, OURO[1]); gr.addColorStop(0.75, OURO[2]); gr.addColorStop(1, OURO[3]); return gr; }
  function estrela5(g, x, y, r, rot) {
    g.beginPath();
    for (let i = 0; i < 10; i++) { const a = rot + i * Math.PI / 5 - Math.PI / 2, rr = i % 2 ? r * 0.45 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    g.closePath(); g.fill();
  }
  // desenha o escudo em g (centro cx, cy; tamanho s); giro: os raios girando (vinheta); brilho: o reflexo na taça (0 a 1)
  function desenharLogo(g, cx, cy, s, giro, brilho, semRaios) {
    const u = s / 100;
    g.save(); g.translate(cx - 50 * u, cy - 50 * u);
    if (!semRaios) {                                                     // os raios de sol (16, alternando o comprido e o curto)
      g.fillStyle = ouro(g, 0, 0, 100 * u, 100 * u);
      for (let i = 0; i < 16; i++) {
        const a = (giro || 0) + i * Math.PI / 8, r0 = 38 * u, r1 = (i % 2 ? 46 : 50) * u, w = 0.11;
        g.beginPath(); g.moveTo(50 * u + Math.cos(a - w) * r0, 50 * u + Math.sin(a - w) * r0); g.lineTo(50 * u + Math.cos(a) * r1, 50 * u + Math.sin(a) * r1); g.lineTo(50 * u + Math.cos(a + w) * r0, 50 * u + Math.sin(a + w) * r0); g.closePath(); g.fill();
      }
    }
    g.fillStyle = ouro(g, 0, 12 * u, 0, 88 * u); g.beginPath(); g.arc(50 * u, 50 * u, 39 * u, 0, Math.PI * 2); g.fill();   // o aro
    g.fillStyle = NOITE[0]; g.beginPath(); g.arc(50 * u, 50 * u, 35 * u, 0, Math.PI * 2); g.fill();
    g.strokeStyle = OURO[2]; g.lineWidth = 1.2 * u; g.beginPath(); g.arc(50 * u, 50 * u, 32 * u, 0, Math.PI * 2); g.stroke();
    // os ramos de louro (as folhinhas dos dois lados, de baixo para cima)
    g.fillStyle = ouro(g, 20 * u, 40 * u, 80 * u, 80 * u);
    for (const sd of [-1, 1]) for (let k = 0; k < 6; k++) {
      const a = Math.PI / 2 + sd * (0.35 + k * 0.27), x = 50 * u + Math.cos(a) * 27 * u, y = 52 * u + Math.sin(a) * 27 * u;
      g.save(); g.translate(x, y); g.rotate(a + sd * 0.9); g.beginPath(); g.ellipse(0, 0, 4.2 * u, 1.7 * u, 0, 0, Math.PI * 2); g.fill(); g.restore();
    }
    // a taça: o bojo, as alças em asa, o pé e a base
    g.fillStyle = ouro(g, 36 * u, 0, 64 * u, 0);
    g.beginPath(); g.moveTo(37 * u, 30 * u); g.lineTo(63 * u, 30 * u); g.quadraticCurveTo(63 * u, 52 * u, 50 * u, 56 * u); g.quadraticCurveTo(37 * u, 52 * u, 37 * u, 30 * u); g.fill();
    g.fillRect(35.5 * u, 28 * u, 29 * u, 3.6 * u);
    for (const sd of [-1, 1]) {                                          // as asas: três penas abertas para cima e para fora
      g.beginPath(); g.moveTo(50 * u + sd * 12 * u, 34 * u); g.lineTo(50 * u + sd * 25 * u, 22 * u); g.lineTo(50 * u + sd * 22 * u, 29 * u); g.lineTo(50 * u + sd * 27 * u, 27 * u);
      g.lineTo(50 * u + sd * 21 * u, 35 * u); g.lineTo(50 * u + sd * 25 * u, 35 * u); g.lineTo(50 * u + sd * 13 * u, 43 * u); g.closePath(); g.fill();
    }
    g.fillRect(47.5 * u, 55 * u, 5 * u, 9 * u);
    g.beginPath(); g.ellipse(50 * u, 60 * u, 5 * u, 2 * u, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.moveTo(40 * u, 64 * u); g.lineTo(60 * u, 64 * u); g.lineTo(63 * u, 71 * u); g.lineTo(37 * u, 71 * u); g.closePath(); g.fill();
    g.fillStyle = 'rgba(42,18,6,.6)'; g.fillRect(40 * u, 67 * u, 20 * u, 1.6 * u);
    g.fillStyle = ouro(g, 0, 14 * u, 0, 26 * u); estrela5(g, 50 * u, 21 * u, 5.4 * u, 0);   // a estrela em cima
    // o reflexo no bojo
    g.fillStyle = 'rgba(255,250,220,' + (0.5 + 0.45 * (brilho || 0)) + ')';
    g.beginPath(); g.moveTo(41 * u, 32 * u); g.lineTo(45 * u, 32 * u); g.quadraticCurveTo(44 * u, 46 * u, 48 * u, 52 * u); g.quadraticCurveTo(41 * u, 47 * u, 41 * u, 32 * u); g.fill();
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

  // o pano redondo do círculo central: preto com o aro dourado, os raios, a taça e o nome em volta
  function pano() {
    const N = 256, c = document.createElement('canvas'); c.width = c.height = N; const g = c.getContext('2d');
    const gr = g.createRadialGradient(N / 2, N / 2, 10, N / 2, N / 2, N / 2); gr.addColorStop(0, NOITE[3]); gr.addColorStop(0.6, NOITE[2]); gr.addColorStop(1, NOITE[0]);
    g.fillStyle = gr; g.beginPath(); g.arc(N / 2, N / 2, N / 2 - 1, 0, Math.PI * 2); g.fill();
    g.strokeStyle = OURO[1]; g.lineWidth = 5; g.beginPath(); g.arc(N / 2, N / 2, N / 2 - 6, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 1.5; g.strokeStyle = OURO[2]; g.beginPath(); g.arc(N / 2, N / 2, N / 2 - 31, 0, Math.PI * 2); g.stroke();
    // a faixa de papel picado em volta (os quadradinhos coloridos entre os dois aros, embaixo do texto)
    for (let i = 0; i < 48; i++) { const a = i / 48 * Math.PI * 2, r = N / 2 - 12; g.fillStyle = PICADO[i % PICADO.length]; g.globalAlpha = 0.28; g.fillRect(N / 2 + Math.cos(a) * r - 2, N / 2 + Math.sin(a) * r - 2, 4, 4); }
    g.globalAlpha = 1;
    desenharLogo(g, N / 2, N / 2, 160, 0, 0.3);
    const txt = (Tx(NOME).toUpperCase() + ' · ').repeat(2);
    g.fillStyle = OURO[0]; g.font = "bold 16px 'Silkscreen', 'Courier New', monospace"; g.textAlign = 'center'; g.textBaseline = 'middle';
    const R = N / 2 - 18, n = txt.length;
    for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + (i / n) * Math.PI * 2; g.save(); g.translate(N / 2 + Math.cos(a) * R, N / 2 + Math.sin(a) * R); g.rotate(a + Math.PI / 2); g.fillText(txt[i], 0, 0); g.restore(); }
    return c;
  }

  // ============================================================================================ A MÚSICA (o "hino" da copa)
  //   Melodia e harmonia próprias, em lá menor, no clima das noites de copa sul-americana: o bombo no ritmo de huayno (longo, curto,
  //   curto), o charango tremido, a quena (flauta de bambu) dobrando o coral, metais, cordas e pratos. Duas partes:
  //     'intro' (≈ 8,4 s): o bombo e o charango crescendo, a fanfarra dos metais e o coral (a vinheta).
  //     'hino'  (≈ 21 s): o coral e a quena cantando o tema inteiro, terminando em lá MAIOR com prato e bombo.
  //   Sai pelo volume de MÚSICA do jogo (Som.audio.musica) e respeita o mudo. Gravada antes (preparar), como a da Copa dos Campeões.
  const BPM = 96, BT = 60 / BPM;
  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const VOG = { a: [[800, 1, 7], [1150, 0.55, 9], [2800, 0.14, 13]], o: [[460, 1, 7], [820, 0.5, 8], [2830, 0.08, 13]], e: [[480, 1, 7], [1900, 0.45, 10], [2600, 0.12, 13]] };
  let MUS = null;
  function audio() { return typeof Som !== 'undefined' && Som.audio && !Som.mudo ? Som.audio : null; }
  function impulso(c, seg) {
    const n = Math.floor(c.sampleRate * seg), b = c.createBuffer(2, n, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3.8); }
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
    const os = [-10, 0, 9].map((d) => { const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = d; o.connect(src); return o; });
    const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = 4.8 + Math.random() * 0.8; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(f * 0.009, t + 0.45); lfo.connect(lg); for (const o of os) lg.connect(o.frequency);
    for (const [fr, gn, q] of VOG[vog || 'a']) { const bp = c.createBiquadFilter(), gg = c.createGain(); bp.type = 'bandpass'; bp.frequency.value = fr; bp.Q.value = q; gg.gain.value = gn; src.connect(bp); bp.connect(gg); gg.connect(e); }
    env(c, e, t, 0.12, vol, fim, 0.45); e.connect(dst);
    for (const o of os.concat(lfo)) { o.start(t); o.stop(fim + 0.55); }
  }
  function cordas(c, dst, t, m, dur, vol) {
    const f = hz(m), e = c.createGain(), lp = c.createBiquadFilter(), fim = t + dur; lp.type = 'lowpass'; lp.frequency.value = 1400; lp.Q.value = 0.6;
    const os = [-6, 7].map((d) => { const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = d; o.connect(lp); return o; });
    lp.connect(e); env(c, e, t, 0.28, vol, fim, 0.6); e.connect(dst);
    for (const o of os) { o.start(t); o.stop(fim + 0.7); }
  }
  function metal(c, dst, t, m, dur, vol) {
    const f = hz(m), e = c.createGain(), lp = c.createBiquadFilter(), fim = t + dur; lp.type = 'lowpass'; lp.Q.value = 1.3;
    lp.frequency.setValueAtTime(450, t); lp.frequency.exponentialRampToValueAtTime(2900, t + 0.07); lp.frequency.exponentialRampToValueAtTime(1600, t + 0.35);
    const o1 = c.createOscillator(), o2 = c.createOscillator(); o1.type = 'sawtooth'; o2.type = 'square'; o1.frequency.value = f; o2.frequency.value = f; o2.detune.value = 5;
    const g2 = c.createGain(); g2.gain.value = 0.3; o1.connect(lp); o2.connect(g2); g2.connect(lp);
    lp.connect(e); env(c, e, t, 0.04, vol, fim, 0.2); e.connect(dst);
    for (const o of [o1, o2]) { o.start(t); o.stop(fim + 0.3); }
  }
  // a quena: o tom quase puro (seno + triângulo), o vibrato que chega depois e o sopro (ruído filtrado na nota)
  function quena(c, dst, t, m, dur, vol) {
    const f = hz(m), e = c.createGain(), fim = t + dur;
    const o1 = c.createOscillator(), o2 = c.createOscillator(), g2 = c.createGain(); o1.type = 'sine'; o2.type = 'triangle'; o1.frequency.value = f; o2.frequency.value = f * 2; g2.gain.value = 0.18;
    const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = 5.6; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(0, t + 0.18); lg.gain.linearRampToValueAtTime(f * 0.012, t + 0.5);
    lfo.connect(lg); lg.connect(o1.frequency); lg.connect(o2.frequency);
    o1.connect(e); o2.connect(g2); g2.connect(e);
    const s = c.createBufferSource(), bp = c.createBiquadFilter(), gs = c.createGain(); s.buffer = ruido(c); bp.type = 'bandpass'; bp.frequency.value = f * 1.5; bp.Q.value = 3; gs.gain.value = 0.25;
    s.connect(bp); bp.connect(gs); gs.connect(e);
    env(c, e, t, 0.07, vol, fim, 0.18); e.connect(dst);
    for (const o of [o1, o2, lfo]) { o.start(t); o.stop(fim + 0.25); }
    s.start(t, Math.random(), dur + 0.25);
  }
  // o charango: a corda beliscada (o brilho do filtro cai rápido) em duas oitavas
  function belisca(c, dst, t, m, vol, dec) {
    const f = hz(m), e = c.createGain(), lp = c.createBiquadFilter(); dec = dec || 0.32;
    lp.type = 'lowpass'; lp.Q.value = 2; lp.frequency.setValueAtTime(4200, t); lp.frequency.exponentialRampToValueAtTime(700, t + dec);
    const o1 = c.createOscillator(), o2 = c.createOscillator(), g2 = c.createGain(); o1.type = 'sawtooth'; o2.type = 'square'; o1.frequency.value = f; o2.frequency.value = f * 2; o2.detune.value = 6; g2.gain.value = 0.25;
    o1.connect(lp); o2.connect(g2); g2.connect(lp); lp.connect(e);
    e.gain.setValueAtTime(0.0001, t); e.gain.linearRampToValueAtTime(vol, t + 0.003); e.gain.exponentialRampToValueAtTime(0.0001, t + dec);
    e.connect(dst); for (const o of [o1, o2]) { o.start(t); o.stop(t + dec + 0.05); }
  }
  // o rasgueado tremido do charango num acorde (a cada 1/4 de batida, as cordas com um respiro entre elas)
  function charango(c, dst, t, notas, dur, vol, sobe) {
    const n = Math.floor(dur / (BT / 4));
    for (let i = 0; i < n; i++) {
      const tt = t + i * BT / 4, v = vol * (sobe ? 0.4 + 0.6 * (i / n) : 1) * (i % 4 === 0 ? 1 : 0.62), desce = i % 2 === 1;
      (desce ? notas.slice().reverse() : notas).forEach((m, k) => belisca(c, dst, tt + k * 0.012, m, v, 0.22));
    }
  }
  // o bombo legüero: o couro (seno que desce) e a batida na borda de madeira (ruído curto)
  function bombo(c, dst, t, vol, borda) {
    const o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(borda ? 140 : 92, t); o.frequency.exponentialRampToValueAtTime(borda ? 110 : 52, t + 0.18);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + (borda ? 0.12 : 0.55));
    o.connect(g); g.connect(dst); o.start(t); o.stop(t + 0.6);
    const s = c.createBufferSource(), f = c.createBiquadFilter(), gs = c.createGain(); s.buffer = ruido(c); f.type = borda ? 'highpass' : 'bandpass'; f.frequency.value = borda ? 2400 : 180; f.Q.value = 1;
    gs.gain.setValueAtTime(vol * (borda ? 0.5 : 0.35), t); gs.gain.exponentialRampToValueAtTime(0.0001, t + (borda ? 0.05 : 0.09)); s.connect(f); f.connect(gs); gs.connect(dst); s.start(t, Math.random(), 0.12);
  }
  // o ritmo de huayno numa batida: forte no tempo, a borda no contratempo e o "curto-curto"
  function huayno(c, dst, t, vol) { bombo(c, dst, t, vol); bombo(c, dst, t + BT * 0.5, vol * 0.55, true); bombo(c, dst, t + BT * 0.75, vol * 0.5); }
  function prato(c, dst, t, vol, dur, sobe) {
    const s = c.createBufferSource(), hp = c.createBiquadFilter(), bp = c.createBiquadFilter(), g = c.createGain(); s.buffer = ruido(c);
    hp.type = 'highpass'; hp.frequency.value = 4400; bp.type = 'peaking'; bp.frequency.value = 8200; bp.gain.value = 6;
    if (sobe) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + dur); g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.05); }
    else { g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); }
    s.connect(hp); hp.connect(bp); bp.connect(g); g.connect(dst); s.loop = true; s.start(t); s.stop(t + dur + 0.1);
  }
  function tambor(c, dst, t, m, vol, dec) {
    const f = hz(m); dec = dec || 1.6;
    for (const [k, v] of [[1, 1], [1.5, 0.3], [2.0, 0.12]]) {
      const o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(f * k * 1.05, t); o.frequency.exponentialRampToValueAtTime(f * k, t + 0.08);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol * v, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + dec / k);
      o.connect(g); g.connect(dst); o.start(t); o.stop(t + dec + 0.05);
    }
  }
  // as notas MIDI usadas
  const N = { E2: 40, F2: 41, G2: 43, A2: 45, B2: 47, C3: 48, D3: 50, E3: 52, F3: 53, G3: 55, Gs3: 56, A3: 57, B3: 59, C4: 60, Cs4: 61, D4: 62, E4: 64, F4: 65, G4: 67, Gs4: 68,
    A4: 69, B4: 71, C5: 72, Cs5: 73, D5: 74, E5: 76, F5: 77, G5: 79, Gs5: 80, A5: 81, B5: 83, C6: 84, Cs6: 85, E6: 88 };
  const AC = { Am: [N.A3, N.C4, N.E4, N.A4], Dm: [N.D4, N.F4, N.A4, N.D5], F: [N.F3, N.A3, N.C4, N.F4], G: [N.G3, N.B3, N.D4, N.G4], E: [N.E3, N.Gs3, N.B3, N.E4], A: [N.A3, N.Cs4, N.E4, N.A4] };
  function tocarIntro(c, dst, t0) {
    const b = (x) => t0 + x * BT;
    charango(c, dst, b(0), AC.Am, 4 * BT, 0.035, true);                       // o charango crescendo e o bombo entrando
    for (let x = 0; x < 4; x++) huayno(c, dst, b(x), 0.12 + x * 0.05);
    for (const m of [N.A2, N.E3]) cordas(c, dst, b(0), m, 4 * BT, 0.05);
    prato(c, dst, b(3), 0.06, BT, true);
    // a fanfarra: lá-dó-mi, ré-mi, sol (e a resposta) com o coral por baixo
    tambor(c, dst, b(4), N.A2 - 12, 0.5, 2.2); prato(c, dst, b(4), 0.1, 3);
    [[4, N.A4, 0.5], [4.5, N.C5, 0.5], [5, N.E5, 1], [6, N.D5, 0.5], [6.5, N.E5, 0.5], [7, N.G5, 1]].forEach(([x, m, d]) => { metal(c, dst, b(x), m, d * BT, 0.09); metal(c, dst, b(x), m - 12, d * BT, 0.06); });
    for (const [m, v] of [[N.A3, 'o'], [N.E4, 'o'], [N.A4, 'o'], [N.C5, 'o']]) coro(c, dst, b(4), m, 4 * BT, 0.1, v);
    for (let x = 4; x < 8; x++) huayno(c, dst, b(x), 0.22);
    charango(c, dst, b(4), AC.Am, 2 * BT, 0.03); charango(c, dst, b(6), AC.G, 2 * BT, 0.03);
    // a subida final: fá, sol e o lá MAIOR (a terça picarda), tudo junto
    for (const [m, v] of [[N.F3, 'a'], [N.C4, 'a'], [N.F4, 'a'], [N.A4, 'a']]) coro(c, dst, b(8), m, 1.5 * BT, 0.1, v);
    for (const [m, v] of [[N.G3, 'a'], [N.D4, 'a'], [N.G4, 'a'], [N.B4, 'a']]) coro(c, dst, b(9.5), m, 1.5 * BT, 0.1, v);
    for (const [m, v] of [[N.A3, 'o'], [N.E4, 'o'], [N.Cs5, 'o'], [N.A4, 'o']]) coro(c, dst, b(11), m, 1.8 * BT, 0.12, v);
    metal(c, dst, b(8), N.C5, 1.5 * BT, 0.08); metal(c, dst, b(9.5), N.D5, 1.5 * BT, 0.08); metal(c, dst, b(11), N.E5, 1.8 * BT, 0.1); metal(c, dst, b(11), N.Cs5, 1.8 * BT, 0.07);
    quena(c, dst, b(8), N.A5, 1.5 * BT, 0.05); quena(c, dst, b(9.5), N.B5, 1.5 * BT, 0.05); quena(c, dst, b(11), N.Cs6, 1.8 * BT, 0.06);
    charango(c, dst, b(8), AC.F, 1.5 * BT, 0.03); charango(c, dst, b(9.5), AC.G, 1.5 * BT, 0.03);
    for (let x = 8; x < 11; x++) huayno(c, dst, b(x), 0.24);
    bombo(c, dst, b(11), 0.5); tambor(c, dst, b(11), N.A2 - 12, 0.45, 2.4); prato(c, dst, b(11), 0.09, 2.8);
    return 13.4 * BT;
  }
  function tocarHino(c, dst, t0) {
    const b = (x) => t0 + x * BT;
    // o tema (8 compassos de 4 batidas): [início em batidas, nota, duração]
    const S = [[0, N.E5, 1], [1, N.A5, 1], [2, N.G5, 0.5], [2.5, N.F5, 0.5], [3, N.E5, 1],
      [4, N.D5, 1.5], [5.5, N.E5, 0.5], [6, N.F5, 1], [7, N.E5, 1],
      [8, N.C5, 1], [9, N.D5, 1], [10, N.E5, 1], [11, N.A4, 1],
      [12, N.B4, 2], [14, N.Gs4, 2],
      [16, N.E5, 1], [17, N.A5, 1], [18, N.B5, 1], [19, N.C6, 1],
      [20, N.B5, 1.5], [21.5, N.A5, 0.5], [22, N.G5, 1], [23, N.F5, 1],
      [24, N.E5, 1], [25, N.F5, 1], [26, N.D5, 1], [27, N.B4, 1],
      [28, N.Cs5, 1], [29, N.E5, 1], [30, N.A5, 4.5]];
    // os acordes de cada meio compasso: [início, acorde, baixo]
    const H = [[0, 'Am', N.A2], [4, 'Dm', N.D3], [8, 'F', N.F2], [10, 'Am', N.A2], [12, 'E', N.E2], [16, 'Am', N.A2], [20, 'G', N.G2], [22, 'F', N.F2], [24, 'Dm', N.D3], [26, 'E', N.E2], [28, 'A', N.A2]];
    const fimDe = (i) => (i + 1 < H.length ? H[i + 1][0] : 34.5);
    for (const [x, m, d] of S) { coro(c, dst, b(x), m, d * BT, 0.15, x >= 28 ? 'o' : 'a'); quena(c, dst, b(x), m + 12, d * BT, x >= 16 ? 0.045 : 0.03); }
    H.forEach(([x, ac, bx], i) => {
      const d = (fimDe(i) - x) * BT, A = AC[ac];
      coro(c, dst, b(x), A[1], d, 0.09, 'a'); coro(c, dst, b(x), A[2], d, 0.09, 'a'); coro(c, dst, b(x), bx + 12, d, 0.1, 'o');
      cordas(c, dst, b(x), bx, d, 0.06); cordas(c, dst, b(x), A[0], d, 0.035);
      charango(c, dst, b(x), A, d, x >= 16 ? 0.028 : 0.02);
    });
    for (let x = 0; x < 30; x++) huayno(c, dst, b(x), x < 16 ? 0.16 : 0.22);
    for (const [x, m, d] of S) if (x >= 16) { metal(c, dst, b(x), m - 12, d * BT, 0.06); metal(c, dst, b(x), m - 24, d * BT, 0.045); }
    prato(c, dst, b(15), 0.06, BT, true); prato(c, dst, b(16), 0.08, 2.5); prato(c, dst, b(29), 0.07, BT, true);
    bombo(c, dst, b(30), 0.55); tambor(c, dst, b(30), N.A2 - 12, 0.55, 3); prato(c, dst, b(30), 0.11, 4.2);
    [N.A5, N.Cs6, N.E6, N.Cs6, N.A5].forEach((m, i) => belisca(c, dst, b(30.5 + i * 0.25), m, 0.05, 0.5));
    return 35 * BT;
  }
  // A MÚSICA PRÉ-GRAVADA: cada parte é gravada UMA vez num OfflineAudioContext (preparar(), na tela do confronto) e toca como um
  //   buffer só (tocar ao vivo, com dezenas de osciladores de uma vez, engasga no celular). Se pedirem antes de ficar pronta,
  //   começa quando ficar, já no ponto certo; sem OfflineAudioContext, toca ao vivo.
  const PARTES = { intro: { f: tocarIntro, bt: 13.4 }, hino: { f: tocarHino, bt: 35 } };
  const BUF = {};
  let IMP = null;
  function cadeia(c, saida) {                                         // o barramento com a reverberação (um estádio grande à noite)
    const bus = c.createGain(), seco = c.createGain(), rev = c.createConvolver(), molhado = c.createGain();
    if (!IMP || IMP.sampleRate !== c.sampleRate) IMP = impulso(c, 2.6);
    rev.buffer = IMP; seco.gain.value = 0.78; molhado.gain.value = 0.5;
    bus.gain.value = 1; bus.connect(seco); bus.connect(rev); rev.connect(molhado); seco.connect(saida); molhado.connect(saida);
    return { bus, nos: [seco, rev, molhado] };
  }
  function gravar(parte) {
    if (BUF[parte]) return BUF[parte];
    const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext; if (!OAC) return null;
    try {
      const A = typeof Som !== 'undefined' && Som.audio ? Som.audio : null, sr = A ? A.ctx.sampleRate : 44100;
      const dur = PARTES[parte].bt * BT + 4, c = new OAC(2, Math.ceil(dur * sr), sr), k = cadeia(c, c.destination);
      PARTES[parte].f(c, k.bus, 0.02);
      const p = new Promise((ok) => {
        const fim = (b) => { BUF[parte] = b || null; ok(b || null); };
        c.oncomplete = (e) => fim(e.renderedBuffer);
        const r = c.startRendering(); if (r && r.then) r.then(fim, () => fim(null));
      });
      BUF[parte] = p; return p;
    } catch (e) { BUF[parte] = null; return null; }
  }
  function preparar() { const p = gravar('intro'); if (p && p.then) p.then(() => gravar('hino')); else gravar('hino'); }
  function tocar(parte) {
    const A = audio(); if (!A) return 0;
    parar(0.25);
    const c = A.ctx; try { if (c.state !== 'running') c.resume(); } catch (e) { /* nada */ }
    const saida = A.musica || A.mestre, dur = PARTES[parte].bt * BT;
    const pedido = c.currentTime, b = BUF[parte] || gravar(parte);
    if (b) {
      const g = c.createGain(); g.gain.value = 1; g.connect(saida);
      const eu = { bus: g, nos: [], src: null, fim: pedido + dur + 4 };
      MUS = eu;
      const soltar = (buf) => {
        if (!buf || MUS !== eu) return;
        const atraso = Math.max(0, c.currentTime - pedido);
        if (atraso >= buf.duration - 0.5) return;
        const s = c.createBufferSource(); s.buffer = buf; s.connect(g); s.start(c.currentTime + 0.03, atraso); eu.src = s;
        s.onended = () => { if (MUS === eu) MUS = null; desligar(eu); };
      };
      if (b.then) b.then(soltar); else soltar(b);
      return dur;
    }
    const k = cadeia(c, saida), t0 = c.currentTime + 0.06;
    PARTES[parte].f(c, k.bus, t0);
    const eu = { bus: k.bus, nos: k.nos, fim: t0 + dur + 3.5 };
    MUS = eu;
    setTimeout(() => { if (MUS === eu) MUS = null; desligar(eu); }, (dur + 4) * 1000);
    return dur;
  }
  function desligar(m) { try { if (m.src) m.src.stop(); } catch (e) { /* já parou */ } try { m.bus.disconnect(); for (const n of m.nos) n.disconnect(); } catch (e) { /* nada */ } }
  function parar(seg) {
    const m = MUS; if (!m) return; MUS = null;
    const A = typeof Som !== 'undefined' && Som.audio ? Som.audio : null, c = A ? A.ctx : null;
    if (!c) { desligar(m); return; }
    const t = c.currentTime, s = Math.max(0.05, seg == null ? 1.2 : seg);
    try { m.bus.gain.cancelScheduledValues(t); m.bus.gain.setValueAtTime(Math.max(0.0001, m.bus.gain.value), t); m.bus.gain.exponentialRampToValueAtTime(0.0001, t + s); } catch (e) { /* nada */ }
    setTimeout(() => desligar(m), (s + 0.2) * 1000);
  }

  // ============================================================================================ A VINHETA DE ABERTURA
  //   op = { a: { nome, url }, b: { ... } (mandante e visitante), fase (texto), estadio (texto), dur (segundos), parar: () => true
  //   quando o jogador tocou em PULAR }. A tela é desenhada em 270 linhas (pixel art), dentro do #raizJogo, e cobre o jogo:
  //   a noite preta com o brilho quente no meio, as duas fileiras de bandeirinhas de papel picado balançando no alto, o papel
  //   picado caindo, os raios dourados girando atrás da taça, o nome da copa letra por letra e os dois escudos entrando.
  function carregarImg(url) { return new Promise((ok) => { if (!url) return ok(null); const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = url; }); }
  // uma bandeirinha de papel picado (12 x 14) com os furinhos recortados (os desenhos variam)
  const FUROS = [['..........', '...#..#...', '..##..##..', '..........', '.#..##..#.', '.#..##..#.', '..........', '...####...', '..........'],
    ['..........', '.#.#..#.#.', '..........', '...####...', '..#....#..', '...####...', '..........', '.#.#..#.#.', '..........'],
    ['..........', '....##....', '...#..#...', '..#.##.#..', '...#..#...', '....##....', '..........', '.##....##.', '..........']];
  function bandeirinha(g, x, y, cor, tipo, giro) {
    g.save(); g.translate(Math.round(x), Math.round(y)); g.rotate(giro);
    g.fillStyle = cor; g.fillRect(-6, 0, 12, 12);
    for (let k = 0; k < 6; k++) g.fillRect(-6 + k * 2, 12, 1, 2);       // a franja de baixo
    g.fillStyle = NOITE[0];
    FUROS[tipo % FUROS.length].forEach((ln, yy) => { for (let xx = 0; xx < 10; xx++) if (ln[xx] === '#') g.fillRect(-5 + xx, 1 + yy, 1, 1); });
    g.restore();
  }
  async function intro(op) {
    const raiz = document.getElementById('raizJogo') || document.body, el = document.createElement('canvas'), g = el.getContext('2d');
    let H = 270, oy = 0;
    const medir = () => {
      const r = raiz.getBoundingClientRect(), w = Math.max(1, r.width || innerWidth), h = Math.max(1, r.height || innerHeight), pr = w / h;
      let W = Math.round(270 * pr), HH = 270;
      if (W < 320) { W = 320; HH = Math.round(320 / pr); }
      if (el.width !== W || el.height !== HH) { el.width = W; el.height = HH; }
      H = HH; oy = Math.round((HH - 270) / 2);
    };
    medir();
    el.id = 'cpVinheta'; el.style.cssText = 'position:fixed;left:0;top:0;width:100%;height:100%;z-index:43;image-rendering:pixelated;background:#050302';
    raiz.appendChild(el);
    const [ia, ib] = await Promise.all([carregarImg(op.a && op.a.url), carregarImg(op.b && op.b.url)]);
    const dur = op.dur || 8.4, rnd = (n) => ((Math.sin(n * 91.17) * 43758.5453) % 1 + 1) % 1;
    const CONF = Array.from({ length: 110 }, (_, i) => ({ x: rnd(i + 1), y0: rnd(i + 200), v: 18 + rnd(i + 400) * 30, w: 2 + Math.floor(rnd(i + 500) * 2), cor: i % 3 === 0 ? OURO[1] : PICADO[i % PICADO.length], f: 1 + rnd(i + 700) * 3, ph: rnd(i + 800) * 6.3 }));
    const fonte = (px) => "bold " + px + "px 'Silkscreen', 'Courier New', monospace";
    const titulo = Tx(NOME).toUpperCase();
    const suave = (x) => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
    const t0 = performance.now();
    await new Promise((ok) => {
      const quadro = () => {
        const t = (performance.now() - t0) / 1000;
        if (t >= dur || (op.parar && op.parar())) { ok(); return; }
        medir();
        const W = el.width, cx = W / 2, HT = H;
        g.setTransform(1, 0, 0, 1, 0, 0); g.imageSmoothingEnabled = false;
        const gr = g.createRadialGradient(cx, HT / 2 - 18, 8, cx, HT / 2 - 18, Math.max(W, HT) * 0.72); gr.addColorStop(0, NOITE[3]); gr.addColorStop(0.42, NOITE[2]); gr.addColorStop(1, NOITE[0]);
        g.fillStyle = gr; g.fillRect(0, 0, W, HT);
        // as fileiras de bandeirinhas (presas num fio que faz a curva), balançando com o vento
        for (let f = 0; f < 2; f++) {
          const y0 = 6 + f * 22, n = Math.ceil(W / 16) + 1, flecha = 10 + f * 4;
          g.strokeStyle = 'rgba(255,240,200,.35)'; g.lineWidth = 1; g.beginPath();
          for (let i = 0; i <= n; i++) { const x = i * 16 - (f ? 8 : 0), yy = y0 + flecha * Math.sin(Math.PI * Math.max(0, Math.min(1, x / W))); if (i) g.lineTo(x, yy); else g.moveTo(x, yy); }
          g.stroke();
          for (let i = 0; i < n; i++) {
            const x = i * 16 - (f ? 8 : 0) + 8, yy = y0 + flecha * Math.sin(Math.PI * Math.max(0, Math.min(1, x / W)));
            bandeirinha(g, x, yy, PICADO[(i + f * 3) % PICADO.length], i + f, Math.sin(t * 2.3 + i * 0.7 + f) * 0.18);
          }
        }
        // o papel picado caindo
        for (const p of CONF) {
          const y = ((p.y0 * HT + t * p.v) % (HT + 10)) - 5, x = p.x * W + Math.sin(t * p.f + p.ph) * 6;
          if (y < 40) continue;
          g.fillStyle = p.cor; g.fillRect(Math.round(x), Math.round(y), Math.abs(Math.sin(t * p.f * 2 + p.ph)) > 0.4 ? p.w : 1, p.w);
        }
        g.setTransform(1, 0, 0, 1, 0, oy);
        { const H = 270;
          // os fachos dourados girando atrás da taça
          g.save(); g.translate(cx, H * 0.43); g.rotate(-t * 0.15); g.fillStyle = 'rgba(242,194,48,' + (0.07 + 0.04 * Math.sin(t * 1.4)) + ')';
          for (let i = 0; i < 10; i++) { g.rotate(Math.PI / 5); g.beginPath(); g.moveTo(0, 0); g.lineTo(W, -30); g.lineTo(W, 30); g.closePath(); g.fill(); }
          g.restore();
          // a taça: sobe de baixo crescendo, brilha e depois sobe para dar lugar aos escudos
          const k1 = suave(t / 1.7), k2 = suave((t - 3.7) / 1.0);
          const tam = (36 + 96 * k1) * (1 - 0.34 * k2), ly = H * (0.62 - 0.18 * k1 - 0.15 * k2);
          g.save(); g.shadowColor = 'rgba(255,200,80,.9)'; g.shadowBlur = 12 + 8 * Math.sin(t * 3.2);
          g.globalAlpha = k1; desenharLogo(g, cx, ly, tam, t * 0.6, Math.max(0, Math.sin(t * 2.4))); g.restore();
          // o nome da copa (letra por letra, cada uma caindo no lugar) com o brilho passando
          const nL = Math.floor(Math.max(0, t - 1.3) * 12);
          if (nL > 0) {
            const ty = ly + tam * 0.5 + 18; g.font = fonte(19); g.textAlign = 'left'; g.textBaseline = 'middle';
            const larg = g.measureText(titulo).width; let xx = cx - larg / 2;
            for (let i = 0; i < Math.min(nL, titulo.length); i++) {
              const ch = titulo[i], wc = g.measureText(ch).width, ti = t - 1.3 - i / 12, cai = (1 - suave(ti / 0.25)) * 10;
              g.fillStyle = '#000'; g.fillText(ch, xx + 1, ty + 2 - cai);
              const gt = g.createLinearGradient(0, ty - 10, 0, ty + 10); gt.addColorStop(0, OURO[0]); gt.addColorStop(0.55, OURO[1]); gt.addColorStop(1, OURO[3]); g.fillStyle = gt; g.fillText(ch, xx, ty - cai);
              xx += wc;
            }
            const bx = cx - larg / 2 + ((t * 0.8) % 1.7) / 1.7 * (larg + 60) - 30;
            g.save(); g.beginPath(); g.rect(bx, ty - 11, 10, 22); g.clip(); g.fillStyle = 'rgba(255,250,220,.85)'; g.textAlign = 'center'; g.fillText(titulo.slice(0, nL), cx - (larg - g.measureText(titulo.slice(0, nL)).width) / 2, ty); g.restore();
          }
          // os dois escudos entrando pelos lados, o "x" e a fase
          const k3 = suave((t - 4.3) / 0.9);
          if (k3 > 0) {
            const ys = H * 0.73, e = 64, dx = W * 0.26;
            const lado = (img, nome, s) => {
              const x = cx + s * (dx + (1 - k3) * W * 0.5);
              g.save(); g.fillStyle = 'rgba(242,194,48,.18)'; g.beginPath(); g.arc(x, ys - 8, e * 0.62, 0, Math.PI * 2); g.fill(); g.restore();
              g.save(); g.shadowColor = 'rgba(0,0,0,.75)'; g.shadowBlur = 6; g.imageSmoothingEnabled = false;
              if (img) g.drawImage(img, Math.round(x - e / 2), Math.round(ys - e / 2 - 8), e, e); g.restore();
              const mw = W * 0.44;
              g.font = fonte(9); g.textAlign = 'center'; g.fillStyle = '#000'; g.fillText(nome, x + 1, ys + e / 2 + 2, mw); g.fillStyle = OURO[0]; g.fillText(nome, x, ys + e / 2 + 1, mw);
            };
            lado(ia, ((op.a && op.a.nome) || '').toUpperCase(), -1); lado(ib, ((op.b && op.b.nome) || '').toUpperCase(), 1);
            g.globalAlpha = k3; g.font = fonte(22); g.textAlign = 'center'; g.fillStyle = '#000'; g.fillText('x', cx + 1, ys - 6); g.fillStyle = OURO[1]; g.fillText('x', cx, ys - 8);
            g.font = fonte(9); const linha = [op.fase, op.estadio].filter(Boolean).join(' · ').toUpperCase();
            g.fillStyle = 'rgba(5,3,2,.7)'; const lw = Math.min(W - 8, g.measureText(linha).width + 18); g.fillRect(cx - lw / 2, H - 26, lw, 15);
            g.fillStyle = OURO[2]; g.fillRect(cx - lw / 2, H - 26, lw, 1); g.fillRect(cx - lw / 2, H - 12, lw, 1);
            g.fillStyle = OURO[0]; g.fillText(linha, cx, H - 18, W - 20); g.globalAlpha = 1;
          }
        }
        g.setTransform(1, 0, 0, 1, 0, 0);
        const esc = Math.max(1 - suave(t / 0.6), suave((t - dur + 0.45) / 0.45));
        if (esc > 0) { g.fillStyle = 'rgba(0,0,0,' + esc.toFixed(3) + ')'; g.fillRect(0, 0, W, HT); }
        requestAnimationFrame(quadro);
      };
      requestAnimationFrame(quadro);
    });
    return { fechar: () => { if (el.parentNode) el.parentNode.removeChild(el); } };
  }

  // ============================================================================================ OS TEXTOS (en, es, it, fr)
  const TRAD = {
    'Libertadores': ['Libertadores', 'Libertadores', 'Libertadores', 'Libertadores'],
  };
  if (typeof I18N !== 'undefined') for (const k of Object.keys(TRAD)) if (!I18N[k]) I18N[k] = TRAD[k];

  const API = { NOME, logo, logoURL, desenharLogo, pano, tocar, parar, preparar, intro, esperar, _t: { tocarIntro, tocarHino, gravadas: () => ({ intro: BUF.intro, hino: BUF.hino }) } };
  window.Libertadores = API;
  if (window.FutebolJS && window.FutebolJS.registrarFase) window.FutebolJS.registrarFase(Object.assign({ id: 'libertadores', nome: 'Libertadores', nucleoMinimo: '7.5', iniciar: async () => {} }, API));
})();
