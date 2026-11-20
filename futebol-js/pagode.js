// futebol-js/pagode.js
// A RODA DE PAGODE DA PRAÇA: toda noite de sábado, das 18h à meia-noite.
//   - A banda (cavaquinho, banjo, tantã e pandeiro) não mora na cidade: chega a pé por uma das pontas, com os instrumentos nas costas,
//     senta em volta da mesinha de plástico no gramado da praça e toca. À meia-noite fecha a música, o povo aplaude e ela vai embora
//     pelo mesmo caminho (anda até a ponta da cidade e só lá some).
//   - O povo chega aos poucos (sai de casa ou vem de fora), dança em volta da roda e vai embora cada um na sua hora.
//   - A Rosa (do mercado) estreia o vestido novo que ela comentou; dá para conversar com ela (vale como uma das 2 conversas do dia) e
//     ela cumpre a promessa de fazer o jogador dançar. O jogador também pode dançar sozinho perto da roda.
//   - A música é sintetizada na hora (Web Audio): volume, abafado (passa-baixa) e lado (estéreo) pela distância e pela câmera. Perto da
//     roda o jazz da rua para; longe, ele volta. Lá dentro de um lugar não se ouve nada.
//   - Ninguém aparece nem some na frente do jogador: quem chega ou sai com ele longe (ou o relógio pulou) já aparece no lugar / some
//     direto; a mesa e as cadeiras só aparecem ou somem quando estão fora da câmera (ou ele está longe).
//   O cidade.js chama: criar(api) uma vez por cidade aberta; tick(dt) todo quadro; tickAtor(A, dt) para quem tem A.tipo === 'pagode';
//   alvos(v) na rua; limpar() quando a cidade fecha.
(function () {
  'use strict';

  const TRAD = {
    'Falar com a Rosa': ['Talk to Rosa', 'Hablar con Rosa', 'Parla con Rosa', 'Parler à Rosa'],
    'Dançar': ['Dance', 'Bailar', 'Balla', 'Danser'],
    'Você veio! Eu falei que o pagode da praça era a coisa mais animada da cidade!': ['You came! I told you the pagode in the square was the liveliest thing in town!', '¡Viniste! ¡Te dije que el pagode de la plaza era lo más animado de la ciudad!', 'Sei venuto! Te l’avevo detto che il pagode in piazza era la cosa più vivace della città!', 'Tu es venu ! Je t’avais dit que le pagode de la place était le truc le plus animé de la ville !'],
    'Vim! Me ensina o passo?': ['I did! Will you teach me the steps?', '¡Vine! ¿Me enseñas el paso?', 'Sì! Mi insegni il passo?', 'Oui ! Tu m’apprends le pas ?'],
    'É só deixar o corpo ir no pandeiro. Vem, presta atenção!': ['Just let your body follow the pandeiro. Come on, pay attention!', 'Solo deja que el cuerpo siga el pandeiro. ¡Ven, presta atención!', 'Lascia solo che il corpo segua il pandeiro. Dai, fai attenzione!', 'Laisse juste ton corps suivre le pandeiro. Viens, fais attention !'],
    'Viu? Você leva jeito!': ['See? You’re a natural!', '¿Viste? ¡Tienes talento!', 'Visto? Sei portato!', 'Tu vois ? Tu es doué pour ça !'],
    'Tô só olhando mesmo.': ['I’m just watching.', 'Solo estoy mirando.', 'Sto solo guardando.', 'Je regarde, c’est tout.'],
    'Olhar não vale! Eu disse que ia te obrigar a dançar, lembra? Vem!': ['Watching doesn’t count! I said I’d make you dance, remember? Come on!', '¡Mirar no vale! Te dije que te iba a obligar a bailar, ¿te acuerdas? ¡Ven!', 'Guardare non vale! Ti avevo detto che ti avrei fatto ballare, ricordi? Dai!', 'Regarder, ça ne compte pas ! J’avais dit que je te ferais danser, tu te souviens ? Viens !'],
    'Pronto, nem doeu!': ['There, that didn’t hurt!', '¡Listo, ni dolió!', 'Ecco, non ha fatto male!', 'Voilà, ça n’a pas fait mal !'],
    'Isso aqui é barulho demais.': ['This is way too loud.', 'Esto es demasiado ruido.', 'Qui c’è troppo rumore.', 'C’est beaucoup trop bruyant, ici.'],
    'Barulho? Isso é alegria! Pode voltar pro seu sofá, então.': ['Loud? This is joy! Go back to your couch, then.', '¿Ruido? ¡Esto es alegría! Puedes volver a tu sofá, entonces.', 'Rumore? Questa è allegria! Torna pure sul tuo divano, allora.', 'Bruyant ? C’est de la joie ! Retourne sur ton canapé, alors.'],
    'Essa banda vem de fora, sabia? Todo sábado eles chegam a pé, com os instrumentos nas costas.': ['This band comes from out of town, did you know? Every Saturday they walk in with their instruments on their backs.', 'Esta banda viene de afuera, ¿sabías? Todos los sábados llegan a pie, con los instrumentos a la espalda.', 'Questa band viene da fuori, lo sapevi? Ogni sabato arrivano a piedi, con gli strumenti sulle spalle.', 'Ce groupe vient d’ailleurs, tu savais ? Chaque samedi, ils arrivent à pied, les instruments sur le dos.'],
    'Ai, meus pés! Mas daqui a pouco eu volto pra roda.': ['Oh, my feet! But I’ll be back on the dance floor in a minute.', '¡Ay, mis pies! Pero en un rato vuelvo a la ronda.', 'Ahi, i miei piedi! Ma tra poco torno a ballare.', 'Aïe, mes pieds ! Mais je retourne danser dans un instant.'],
    'Agora deixa eu dançar um pouquinho! Amanhã a gente conversa mais.': ['Now let me dance a little! We’ll talk more tomorrow.', '¡Ahora déjame bailar un poquito! Mañana hablamos más.', 'Adesso lasciami ballare un po’! Domani parliamo ancora.', 'Maintenant, laisse-moi danser un peu ! On parlera plus demain.'],
    'Gostou do vestido novo? Comprei só pra hoje!': ['Do you like my new dress? I bought it just for tonight!', '¿Te gustó el vestido nuevo? ¡Lo compré solo para hoy!', 'Ti piace il vestito nuovo? L’ho comprato apposta per stasera!', 'Tu aimes ma nouvelle robe ? Je l’ai achetée juste pour ce soir !'],
  };
  if (typeof I18N !== 'undefined') for (const k of Object.keys(TRAD)) if (!I18N[k]) I18N[k] = TRAD[k];
  const Tx = (k) => (typeof T === 'function' ? T(k) : k);

  // ------------------------------------------------------------------ a agenda (horas do relógio da cidade)
  const SABADO = 5;                                                     // diaSemana(): 0 = segunda
  const H_BANDA_VEM = 16.4, H_TOCA = 18, H_FIM = 24, H_ULTIMO = 25.2, H_LIMPA = 26.5;
  const H_ROSA_VEM = 19, H_ROSA_VAI = 22.5;
  const LONGE = 60;                                                     // além disso (do jogador) quem chega/sai já aparece/some direto
  const BPM = 98, BAT = 60 / BPM, COMP = BAT * 4, SEMI = BAT / 4;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pk = (l) => l[Math.floor(Math.random() * l.length)];
  const yawPara = (dx, dz) => Math.atan2(-dz, dx);

  // ================================================================== A MÚSICA (um pagodinho em dó maior, 98 bpm)
  //   16 compassos: C6 A7 | Dm7 G7 | C6 C7 | F6 Fm6 | Em7 A7 | Dm7 G7 | C6 A7 | D7 G7 C6. Duas voltas de entrada (só a percussão e a
  //   puxada do cavaquinho) e depois as voltas se revezam: instrumental (o banjo faz a melodia), o cantor, o coro (o povo canta junto em
  //   terças, com as palmas do partido-alto) e o coro de novo.
  const AC = [
    { r: 48, n: [60, 64, 67, 69] }, { r: 45, n: [57, 61, 64, 67] }, { r: 50, n: [57, 60, 62, 65] }, { r: 43, n: [55, 59, 62, 65] },
    { r: 48, n: [60, 64, 67, 69] }, { r: 48, n: [58, 60, 64, 67] }, { r: 41, n: [57, 60, 62, 65] }, { r: 41, n: [56, 60, 62, 65] },
    { r: 40, n: [59, 62, 64, 67] }, { r: 45, n: [57, 61, 64, 67] }, { r: 50, n: [57, 60, 62, 65] }, { r: 43, n: [55, 59, 62, 65] },
    { r: 48, n: [60, 64, 67, 69] }, { r: 45, n: [57, 61, 64, 67] }, { r: 50, n: [57, 60, 62, 66], r2: 43, n2: [55, 59, 62, 65] }, { r: 48, n: [60, 64, 67, 69] },
  ];
  const MEL = [   // [passo (semicolcheia), nota MIDI, duração em semicolcheias]
    [[2, 67, 2], [4, 69, 1], [5, 67, 3], [8, 64, 3], [11, 62, 2], [13, 60, 3]],
    [[0, 61, 3], [3, 64, 1], [4, 67, 2], [6, 69, 6], [14, 69, 2]],
    [[0, 69, 1], [1, 67, 2], [3, 65, 2], [5, 64, 3], [8, 62, 4], [12, 65, 2], [14, 69, 2]],
    [[0, 71, 3], [3, 69, 1], [4, 67, 4], [10, 65, 2], [12, 62, 4]],
    [[0, 64, 6], [8, 67, 2], [10, 69, 1], [11, 72, 5]],
    [[0, 70, 3], [3, 69, 1], [4, 67, 2], [6, 64, 4], [12, 67, 2], [14, 69, 2]],
    [[0, 69, 6], [8, 72, 2], [10, 74, 1], [11, 72, 5]],
    [[0, 68, 6], [8, 65, 2], [10, 68, 1], [11, 72, 5]],
    [[0, 71, 3], [3, 67, 1], [4, 64, 4], [8, 67, 3], [11, 71, 5]],
    [[0, 73, 3], [3, 69, 1], [4, 67, 2], [6, 64, 4], [12, 61, 4]],
    [[0, 62, 3], [3, 65, 1], [4, 69, 2], [6, 72, 6], [14, 69, 2]],
    [[0, 71, 6], [8, 67, 2], [10, 65, 1], [11, 62, 5]],
    [[0, 64, 3], [3, 67, 1], [4, 69, 2], [6, 72, 6], [14, 69, 2]],
    [[0, 67, 3], [3, 64, 1], [4, 61, 4], [8, 64, 8]],
    [[0, 66, 3], [3, 69, 1], [4, 69, 4], [8, 65, 3], [11, 62, 5]],
    [[0, 60, 8]],
  ];
  const VOLTAS = ['inst', 'voz', 'coro', 'coro'];
  const VOGAIS = { a: [[760, 1, 10], [1180, 0.5, 12], [2700, 0.16, 18]], o: [[470, 1, 9], [820, 0.45, 10], [2650, 0.1, 18]], e: [[420, 1, 8], [1900, 0.32, 15], [2550, 0.18, 18]] };
  const ESCALA = { cavaco: 1.25, banjo: 1.2, pandeiro: 1.3, tanta: 1.1 };   // os instrumentos um pouco maiores que o de verdade (o boneco é cabeçudo)
  const SILABAS = ['a', 'a', 'e', 'a', 'o', 'a', 'e', 'o'];
  const PALMAS = [0, 3, 6, 10, 12];
  const CAVACO = [[0, 1], [3, 0], [5, 1], [8, 1], [10, 0], [13, 1], [15, 0]];
  const BANJO = [[2, 1], [6, 1], [7, 0], [11, 1], [14, 1]];
  const TANTA = [[0, 'm'], [2, 'g'], [4, 'a'], [7, 'g'], [8, 'm'], [10, 's'], [12, 'a'], [14, 'g']];

  function criarMusica() {
    const st = { bus: null, passa: null, pan: null, ruido: null, timer: 0, prox: 0, comp: 0, t0a: 0, ini: 0, tocando: false, fimComp: -1, fimEm: 0, vol: 0, volUlt: -1, corteUlt: -1, panUlt: 9, tVol: 0, ctxT: null };
    const audio = () => (typeof Som !== 'undefined' && Som.audio && !Som.mudo ? Som.audio : null);
    const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
    function nota(c, dst, m, t, dur, vol, tipo, corte, ataque) {
      const o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter();
      o.type = tipo; o.frequency.value = hz(m); f.type = 'lowpass'; f.frequency.value = corte || 3000;
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + (ataque || 0.006)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(f); f.connect(g); g.connect(dst); o.start(t); o.stop(t + dur + 0.05);
    }
    function chiado(c, dst, t, dur, vol, freq, tipo, q) {
      if (!st.ruido || st.ruido.sampleRate !== c.sampleRate) { st.ruido = c.createBuffer(1, c.sampleRate, c.sampleRate); const d = st.ruido.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
      const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s.buffer = st.ruido; f.type = tipo || 'highpass'; f.frequency.value = freq; if (q) f.Q.value = q;
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(f); f.connect(g); g.connect(dst); s.start(t, Math.random() * 0.5, dur + 0.02);
    }
    function bumbo(c, dst, t, f0, f1, dur, vol) { const o = c.createOscillator(), g = c.createGain(); o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur * 0.6); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(dst); o.start(t); o.stop(t + dur + 0.02); }
    // a voz: duas serras (uma levemente desafinada) passando por três formantes da vogal; vibrato que entra depois do ataque e a
    //   "subidinha" de quem canta (começa um pouco abaixo e chega na nota)
    function voz(c, dst, m, t, dur, vol, vogal) {
      const f = hz(m), F = VOGAIS[vogal] || VOGAIS.a, fim = t + dur;
      const o1 = c.createOscillator(), o2 = c.createOscillator(), src = c.createGain(), env = c.createGain(), lfo = c.createOscillator(), lg = c.createGain();
      o1.type = o2.type = 'sawtooth'; o2.detune.value = 8;
      for (const o of [o1, o2]) { o.frequency.setValueAtTime(f * 0.975, t); o.frequency.exponentialRampToValueAtTime(f, t + 0.07); }
      lfo.frequency.value = 5.3; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(f * 0.016, t + Math.min(dur * 0.8, 0.4)); lfo.connect(lg); lg.connect(o1.frequency); lg.connect(o2.frequency);
      o1.connect(src); o2.connect(src); src.gain.value = 0.5;
      for (const [fr, gn, q] of F) { const bp = c.createBiquadFilter(), g = c.createGain(); bp.type = 'bandpass'; bp.frequency.value = fr; bp.Q.value = q; g.gain.value = gn; src.connect(bp); bp.connect(g); g.connect(env); }
      env.gain.setValueAtTime(0.0001, t); env.gain.linearRampToValueAtTime(vol, t + 0.05); env.gain.setValueAtTime(vol, Math.max(t + 0.05, fim - 0.08)); env.gain.exponentialRampToValueAtTime(0.0001, fim + 0.06);
      env.connect(dst);
      for (const o of [o1, o2, lfo]) { o.start(t); o.stop(fim + 0.1); }
    }
    const terca = (m, A) => { const pcs = A.n.map((n) => n % 12); for (let d = 3; d <= 5; d++) if (pcs.includes(((m - d) % 12 + 12) % 12)) return m - d; return m - 4; };
    function acordeDe(n, s) { const A = AC[((n % 16) + 16) % 16]; return A.r2 != null && s >= 8 ? { r: A.r2, n: A.n2 } : A; }
    function compasso(c, dst, t0, n) {
      const intro = n < 2, k = n - 2, volta = intro ? 'intro' : VOLTAS[Math.floor(k / 16) % VOLTAS.length], b = intro ? 15 : k % 16, ult = b === 15;
      // o tantã (abafado no 1, aberto no 2, os fantasmas e o tapa)
      for (const [s, tp] of TANTA) {
        const t = t0 + s * SEMI;
        if (tp === 'a') { bumbo(c, dst, t, 108, 70, 0.5, 0.44); chiado(c, dst, t, 0.05, 0.05, 260, 'lowpass'); }
        else if (tp === 'm') bumbo(c, dst, t, 122, 92, 0.13, 0.26);
        else if (tp === 'g') bumbo(c, dst, t, 140, 112, 0.06, 0.08);
        else { chiado(c, dst, t, 0.06, 0.12, 900, 'bandpass', 2); bumbo(c, dst, t, 210, 150, 0.05, 0.07); }
      }
      // o pandeiro: polegar, ponta, base e a ponta acentuada (as platinelas em toda semicolcheia) e o grave aberto no 2 e no 4
      for (let i = 0; i < 16; i++) { const t = t0 + i * SEMI, q = i % 4; chiado(c, dst, t, 0.05, q === 3 ? 0.075 : 0.03, 7200); if (q === 0) bumbo(c, dst, t, 190, 150, 0.06, 0.06); if (q === 3) chiado(c, dst, t, 0.04, 0.05, 1700, 'bandpass', 2); }
      for (const s of [4, 12]) bumbo(c, dst, t0 + s * SEMI, 150, 108, 0.2, 0.12);
      if (ult) for (const s of [12, 13, 14, 15]) chiado(c, dst, t0 + s * SEMI, 0.07, 0.07, 1300, 'bandpass', 1.5);   // a virada no fim da volta
      if (intro && n === 0) return;                                       // a 1ª volta da entrada: só a percussão
      // o cavaquinho (partido-alto, acorde lá em cima) e as abafadas entre uma palhetada e outra
      for (const [s, desce] of CAVACO) { const A = acordeDe(n - 2, s), notas = desce ? A.n : A.n.slice().reverse(); notas.forEach((m, i) => nota(c, dst, m + 12, t0 + s * SEMI + i * 0.008, SEMI * 1.6, 0.024, 'square', 2600, 0.002)); }
      for (const s of [1, 7, 9, 11]) chiado(c, dst, t0 + s * SEMI, 0.025, 0.018, 2600, 'bandpass', 3);
      if (intro) return;
      const A = AC[b], prox = AC[(b + 1) % 16];
      // o violão de 7 (a tônica, a quinta e a baixaria chegando no próximo acorde)
      for (const [s, m, d] of [[0, A.r, 5], [6, A.r + 7, 2], [8, (A.r2 != null ? A.r2 : A.r), 4], [12, (A.r2 != null ? A.r2 : A.r) + 7, 2]]) nota(c, dst, m, t0 + s * SEMI, d * SEMI * 1.05, 0.24, 'triangle', 760);
      if (b % 4 === 3) { const alvo = prox.r, ini = (A.r2 != null ? A.r2 : A.r); for (let i = 0; i < 2; i++) nota(c, dst, Math.round(lerp(ini, alvo, (i + 1) / 3)), t0 + (14 + i) * SEMI, SEMI * 0.95, 0.2, 'triangle', 760); }
      else nota(c, dst, prox.r + (prox.r > A.r ? -1 : 1), t0 + 14 * SEMI, SEMI * 2, 0.2, 'triangle', 760);
      // o banjo: na volta instrumental faz a melodia; nas outras, as levadas no contratempo
      if (volta === 'inst') for (const [s, m, d] of MEL[b]) { nota(c, dst, m + 12, t0 + s * SEMI, Math.min(d, 3) * SEMI * 1.1, 0.05, 'sawtooth', 3400, 0.003); if (d >= 3) for (let r = 1; r < d; r++) nota(c, dst, m + 12, t0 + (s + r) * SEMI, SEMI * 0.9, 0.026, 'sawtooth', 3000, 0.003); }
      else for (const [s, desce] of BANJO) { const Ab = acordeDe(b, s), ns = desce ? Ab.n : Ab.n.slice().reverse(); ns.forEach((m, i) => nota(c, dst, m, t0 + s * SEMI + i * 0.007, SEMI * 1.3, 0.02, 'sawtooth', 3200, 0.002)); }
      // o cantor e o coro (o coro canta a melodia com a terça de baixo, mais as palmas)
      if (volta === 'voz' || volta === 'coro') MEL[b].forEach(([s, m, d], i) => {
        const t = t0 + s * SEMI, dur = d * SEMI * 0.96, vg = SILABAS[(b * 3 + i) % SILABAS.length];
        voz(c, dst, m - 12, t, dur, volta === 'coro' ? 0.24 : 0.32, vg);
        if (volta === 'coro') { voz(c, dst, terca(m, acordeDe(b, s)) - 12, t + 0.012, dur, 0.17, vg); voz(c, dst, m, t + 0.02, dur, 0.08, vg); }
      });
      if (volta === 'coro') for (const s of PALMAS) { chiado(c, dst, t0 + s * SEMI, 0.1, 0.12, 1250, 'bandpass', 1.2); chiado(c, dst, t0 + s * SEMI + 0.011, 0.12, 0.08, 1850, 'bandpass', 1.1); }
    }
    function finalTutti(c, dst, t0) {                                    // o "tchan" do fim: o acorde, o tantã aberto e o pandeiro rufando
      const A = AC[15];
      A.n.forEach((m, i) => { nota(c, dst, m + 12, t0 + i * 0.012, 1.6, 0.03, 'square', 2400, 0.003); nota(c, dst, m, t0 + i * 0.01, 1.8, 0.022, 'sawtooth', 2800, 0.003); });
      nota(c, dst, A.r, t0, 1.5, 0.26, 'triangle', 700); bumbo(c, dst, t0, 108, 64, 0.9, 0.5);
      for (let i = 0; i < 10; i++) chiado(c, dst, t0 - 10 * 0.045 + i * 0.045, 0.05, 0.03 + i * 0.006, 7200);
      voz(c, dst, 60, t0, 1.4, 0.24, 'o'); voz(c, dst, 64, t0 + 0.01, 1.4, 0.14, 'o');
    }
    function aplauso(c, dst, t0) {
      for (let i = 0; i < 70; i++) { const t = t0 + Math.random() * 3.2 * Math.pow(Math.random(), 0.6); chiado(c, dst, t, 0.05, rnd(0.03, 0.08) * (1 - (t - t0) / 4), rnd(1100, 2400), 'bandpass', 1.3); }
    }
    const batidas = () => (st.tocando ? (performance.now() - st.ini) / 1000 / BAT : 0);
    function laco() {
      const A = audio(); if (!A || !st.bus) return; const c = A.ctx;
      if (st.prox < c.currentTime) { st.comp = Math.floor((c.currentTime - st.t0a) / COMP) + 1; st.prox = st.t0a + st.comp * COMP; }
      while (st.prox < c.currentTime + 1.0) {
        if (st.fimComp >= 0 && st.comp >= st.fimComp) { if (st.comp === st.fimComp) { finalTutti(c, st.bus, st.prox); aplauso(c, st.bus, st.prox + 1.3); } st.comp = st.fimComp + 1; st.prox = Infinity; break; }
        compasso(c, st.bus, st.prox, st.comp); st.comp++; st.prox += COMP;
      }
    }
    function ligar() {
      const A = audio(); if (!A || st.bus) return;
      const c = A.ctx; if (c.state === 'suspended') try { c.resume(); } catch (e) { /* nada */ }
      st.bus = c.createGain(); st.bus.gain.value = 0; st.passa = c.createBiquadFilter(); st.passa.type = 'lowpass'; st.passa.frequency.value = 12000; st.passa.Q.value = 0.5;
      st.bus.connect(st.passa); let ult = st.passa;
      if (c.createStereoPanner) { st.pan = c.createStereoPanner(); ult.connect(st.pan); ult = st.pan; }
      ult.connect(A.musica || A.mestre);
      st.t0a = c.currentTime - batidas() * BAT; st.comp = Math.floor(batidas() / 4) + 1; st.prox = st.t0a + st.comp * COMP;
      if (st.fimComp >= 0 && st.comp > st.fimComp) st.prox = Infinity;
      st.volUlt = st.corteUlt = -1; st.panUlt = 9;
      laco(); st.timer = setInterval(laco, 200);
    }
    function desligar(rapido) {
      clearInterval(st.timer); st.timer = 0; if (!st.bus) return; const b = st.bus, cadeia = [st.bus, st.passa, st.pan]; st.bus = st.passa = st.pan = null;
      try { const c = b.context; b.gain.cancelScheduledValues(c.currentTime); b.gain.setValueAtTime(b.gain.value, c.currentTime); b.gain.linearRampToValueAtTime(0, c.currentTime + (rapido ? 0.25 : 1.2)); } catch (e) { /* nada */ }
      setTimeout(() => { for (const n of cadeia) if (n) try { n.disconnect(); } catch (e) { /* nada */ } }, rapido ? 500 : 1700);
    }
    return {
      comecar() { st.tocando = true; st.ini = performance.now(); st.fimComp = -1; st.fimEm = 0; },
      // fecha a música no fim do compasso que está tocando (o acorde final e o aplauso); devolve em quantos segundos tudo acaba
      encerrar() {
        if (!st.tocando || st.fimComp >= 0) return Math.max(0, (st.fimEm - performance.now()) / 1000);
        const b = batidas(); st.fimComp = Math.floor(b / 4) + 1; st.fimEm = st.ini + (st.fimComp * 4 * BAT + 4.6) * 1000;
        return (st.fimEm - performance.now()) / 1000;
      },
      parar(rapido) { st.tocando = false; st.fimComp = -1; desligar(rapido); },
      // todo quadro: o volume (0..1), o corte do passa-baixa e o lado (-1..1). Volume zero por um tempo desliga o agendador.
      mixar(v, corte, pan, dt) {
        if (!st.tocando) v = 0;
        if (st.fimComp >= 0 && performance.now() > st.fimEm) { st.tocando = false; v = 0; }
        if (v > 0.002 && !st.bus) ligar();
        if (!st.bus) return;
        st.vol = v; st.tVol = v > 0.002 ? 0 : st.tVol + dt;
        if (st.tVol > 2.5) { desligar(false); return; }
        const c = st.bus.context, now = c.currentTime;
        if (Math.abs(v - st.volUlt) > 0.01) { st.bus.gain.setTargetAtTime(v * 0.78, now, 0.25); st.volUlt = v; }
        if (Math.abs(corte - st.corteUlt) > 60) { st.passa.frequency.setTargetAtTime(corte, now, 0.3); st.corteUlt = corte; }
        if (st.pan && Math.abs(pan - st.panUlt) > 0.03) { st.pan.pan.setTargetAtTime(pan, now, 0.2); st.panUlt = pan; }
      },
      batidas, get tocando() { return st.tocando; }, get audivel() { return !!st.bus; },
      // a volta que está tocando agora ('intro' | 'inst' | 'voz' | 'coro') e o compasso dentro dela
      volta() { const n = Math.floor(batidas() / 4); if (n < 2) return { volta: 'intro', b: n }; const k = n - 2; return { volta: VOLTAS[Math.floor(k / 16) % VOLTAS.length], b: k % 16 }; },
      fechando: () => st.fimComp >= 0,
      _render(c, dst, compassos) { const t0 = c.currentTime + 0.05; for (let n = 0; n < compassos; n++) compasso(c, dst, t0 + n * COMP, n); finalTutti(c, dst, t0 + compassos * COMP); },   // (para testes: OfflineAudioContext)
    };
  }

  // ================================================================== geometria (prismas com o Geo da cidade: só quads e triângulos)
  function prisma(G, r, h, n, cor, tampa, fundo, c, eixo) {
    const P = (u, v, w) => (eixo === 'x' ? [c[0] + w, c[1] + u, c[2] + v] : eixo === 'y' ? [c[0] + u, c[1] + w, c[2] + v] : [c[0] + u, c[1] + v, c[2] + w]);
    const D = (u, v, w) => (eixo === 'x' ? [w, u, v] : eixo === 'y' ? [u, w, v] : [u, v, w]);
    for (let i = 0; i < n; i++) {
      const a0 = i / n * Math.PI * 2, a1 = (i + 1) / n * Math.PI * 2, u0 = Math.cos(a0) * r, v0 = Math.sin(a0) * r, u1 = Math.cos(a1) * r, v1 = Math.sin(a1) * r;
      G.quad(P(u0, v0, 0), P(u1, v1, 0), P(u1, v1, h), P(u0, v0, h), cor, D((u0 + u1) / 2, (v0 + v1) / 2, 0));
      if (tampa) G.tri(P(0, 0, h), P(u0, v0, h), P(u1, v1, h), tampa, D(0, 0, 1));
      if (fundo) G.tri(P(0, 0, 0), P(u1, v1, 0), P(u0, v0, 0), fundo, D(0, 0, -1));
    }
  }
  // gira o objeto para que o eixo X dele aponte para ex e o Z (a "cara") fique o mais perto possível de ez
  function orientar(obj, ex, ez) {
    const x = new THREE.Vector3(ex[0], ex[1], ex[2]).normalize(), z0 = new THREE.Vector3(ez[0], ez[1], ez[2]);
    const z = z0.sub(x.clone().multiplyScalar(z0.dot(x))).normalize(), y = new THREE.Vector3().crossVectors(z, x).normalize();
    obj.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
  }

  // ================================================================== OS BRAÇOS POR ALVO (cinemática inversa simples, do jeito do boneco)
  //   O ombro fica em (0; 1,27; ±0,39) no corpo; a ordem 'ZXY' abre o braço (X) e depois leva para a frente (Z); o cotovelo dobra em Z.
  //   ik(lado, alvo) acha { rz, rx, cz } que leva a mão (o centro dela) até o alvo, preferindo o cotovelo por fora e abaixo do ombro.
  function maoEm(s, rz, rx, cz) {
    const fx = 0.27 * Math.sin(cz), fy = -0.3 - 0.27 * Math.cos(cz);
    const y1 = fy * Math.cos(rx), z1 = fy * Math.sin(rx);
    return [fx * Math.cos(rz) - y1 * Math.sin(rz), 1.27 + fx * Math.sin(rz) + y1 * Math.cos(rz), s * 0.39 + z1];
  }
  function custoIK(s, a, rz, rx, cz) {
    const h = maoEm(s, rz, rx, cz), d = (h[0] - a[0]) ** 2 + (h[1] - a[1]) ** 2 + (h[2] - a[2]) ** 2;
    const ey = -0.3 * Math.cos(rx), ez = s * 0.39 - 0.3 * Math.sin(rx), eyW = 1.27 + ey * Math.cos(rz);
    const dentro = Math.max(0, 0.33 - s * ez), alto = Math.max(0, eyW - 1.24);
    return d + 0.02 * dentro * dentro + 0.05 * alto * alto + 0.0004 * cz * cz;
  }
  const cacheIK = new Map();
  function ik(s, a) {
    const chave = s + ':' + a.map((v) => v.toFixed(3)).join(','); if (cacheIK.has(chave)) return cacheIK.get(chave);
    let best = null, bc = 1e9;
    for (let rz = -0.6; rz <= 2.9; rz += 0.14) for (let rx = -1.4; rx <= 1.4; rx += 0.14) for (let cz = 0; cz <= 2.5; cz += 0.14) { const c = custoIK(s, a, rz, rx, cz); if (c < bc) { bc = c; best = [rz, rx, cz]; } }
    let passo = 0.07;
    for (let it = 0; it < 60 && passo > 0.002; it++) {
      let melhorou = false;
      for (let i = 0; i < 3; i++) for (const dd of [-passo, passo]) { const q = best.slice(); q[i] += dd; if (i === 2) q[2] = clamp(q[2], 0, 2.6); const c = custoIK(s, a, q[0], q[1], q[2]); if (c < bc) { bc = c; best = q; melhorou = true; } }
      if (!melhorou) passo *= 0.5;
    }
    const r = { rz: best[0], rx: best[1], cz: best[2] }; cacheIK.set(chave, r); return r;
  }
  function aplicarBraco(b, A, B, k) {
    b.rotation.z = lerp(A.rz, B.rz, k); b.rotation.x = lerp(A.rx, B.rx, k); b.rotation.y = 0;
    usarCotovelo(b, 0, Math.max(0.0001, lerp(A.cz, B.cz, k)));
  }

  // ================================================================== o módulo (um por cidade aberta)
  function criar(api) {
    const S = () => api.S();
    const P = { ev: null, mus: criarMusica(), absAnt: null, primeiro: true, estavaDentro: false, jazzPausado: false, geo: {}, poses: null, servindo: false, tSnd: 0 };
    const tAbs = () => { const d = S().dados; return ((d.dia || 1) - 1) * 24 + d.hora; };
    const chovendo = () => { const C = S().clima; return !!C && (C.estado === 'chuva' || C.chuva > 0.35); };
    const gc = () => S().grupoCidade || S().grupo;
    const vivo = () => !!P.ev && !P.ev.morto;                            // o P.ev "morto" segura a noite (não monta de novo depois que acabou ou foi cancelada)
    const distJog = (x, z) => { const J = S().jog; return Math.hypot(J.x - x, J.z - z); };

    // ---------------------------------------------------------------- onde fica a roda (gramado sudoeste da praça, de frente para a avenida)
    function lugarDaRoda() {
      const C = api.PRACA_C; return { x: C.x - 14, z: C.z + 7.5 };
    }
    const lugarRosa = (B) => { const x = B.x + 2.6, z = B.z - 1.1; return { x, z, yaw: yawPara(B.x - x, B.z - z) }; };
    const CADEIRAS = [   // [dx, dz] da mesa; instrumento; quem toca
      { dx: 0, dz: -0.95, inst: 'cavaco', fem: false, seed: 6101 },
      { dx: 0.95, dz: 0, inst: 'banjo', fem: false, seed: 6177 },
      { dx: 0, dz: 0.95, inst: 'tanta', fem: false, seed: 6243 },
      { dx: -0.95, dz: 0, inst: 'pandeiro', fem: true, seed: 6319 },
    ];
    const ROUPA_BANDA = ['#f2f2ee', '#26262c', '#c8352b', '#1c1c1f'];

    // ---------------------------------------------------------------- a mesa, as cadeiras de plástico, o isopor, a caixinha de som, o microfone e o varal de lâmpadas
    function montarProps(B) {
      const G = new api.Geo(), Lz = new api.Geo(), y0 = api.altura(B.x, B.z);
      const branco = '#ecebe4', pe = '#d9d8d0';
      G.box(0.7, 0.04, 0.7, branco, 0, 0.7, 0); for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) G.box(0.05, 0.7, 0.05, pe, sx * 0.3, 0, sz * 0.3);
      for (const [sx, sz, cor] of [[-0.12, -0.1, '#c8352b'], [0.1, 0.12, '#2f6f9a'], [0.16, -0.14, '#e8b030']]) { G.box(0.07, 0.13, 0.07, cor, sx, 0.74, sz); G.box(0.072, 0.012, 0.072, '#c9ced4', sx, 0.87, sz); }   // as latinhas
      G.box(0.09, 0.11, 0.09, '#f4f1e6', -0.18, 0.74, 0.15);                                                                        // o copo
      for (const c of CADEIRAS) {                                                                                                  // a cadeira olhando para a mesa
        const yaw = yawPara(-c.dx, -c.dz), ca = Math.cos(yaw), sa = Math.sin(yaw), cx = c.dx, cz = c.dz;
        const L = (x, z) => [cx + x * ca + z * sa, cz - x * sa + z * ca];
        const box = (w, h, d, cor, x, y, z) => { const [px, pz] = L(x, z), rot = Math.abs(sa) > 0.7; G.box(rot ? d : w, h, rot ? w : d, cor, px, y, pz); };
        box(0.44, 0.05, 0.44, branco, 0, 0.42, 0); for (const [lx, lz] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) box(0.04, 0.42, 0.04, pe, lx, 0, lz);
        box(0.05, 0.42, 0.44, branco, -0.22, 0.47, 0); for (const lz of [-0.2, 0.2]) box(0.05, 0.22, 0.04, branco, -0.2, 0.47, lz);
      }
      G.box(0.52, 0.34, 0.36, '#f2f2ee', 0.82, 0, 0.82); G.box(0.54, 0.05, 0.38, '#2f6f9a', 0.82, 0.34, 0.82);                    // o isopor
      G.box(0.36, 0.5, 0.3, '#1c1c1f', -0.82, 0, -0.82); G.box(0.24, 0.24, 0.01, '#3a3a40', -0.82, 0.18, -0.66); G.box(0.12, 0.12, 0.012, '#55555c', -0.82, 0.24, -0.655);   // a caixinha de som
      const mx = 0.46, mz = -0.52;                                                                                                // o pedestal do microfone (na frente do cantor)
      G.box(0.3, 0.02, 0.04, '#2a2a2e', mx, 0, mz); G.box(0.04, 0.02, 0.3, '#2a2a2e', mx, 0, mz); G.box(0.025, 1.0, 0.025, '#3a3a40', mx, 0, mz);
      G.box(0.32, 0.02, 0.02, '#3a3a40', mx - 0.14, 1.0, mz - 0.05); G.box(0.06, 0.06, 0.06, '#1c1c1f', mx - 0.3, 0.97, mz - 0.12);
      // o varal: dois postes de bambu e o fio até o poste da praça, com lâmpadas coloridas
      const postes = [[-1.7, -1.9, 2.6], [1.9, -1.7, 2.6], [B.lampX - B.x, B.lampZ - B.z, 2.8]];
      for (let i = 0; i < 2; i++) G.box(0.06, postes[i][2] + 0.1, 0.06, '#b89a5a', postes[i][0], 0, postes[i][1]);
      const cores = ['#ffd966', '#ff6a5a', '#7ce07c', '#6ab8ff', '#ffd966', '#ff9a3c'];
      for (let i = 0; i < 2; i++) {
        const [ax, az, ah] = postes[i], [bx, bz, bh] = postes[i + 1], L = Math.hypot(bx - ax, bz - az), n = Math.max(3, Math.round(L / 0.45));
        for (let j = 0; j <= n; j++) {
          const u = j / n, x = lerp(ax, bx, u), z = lerp(az, bz, u), y = lerp(ah, bh, u) - Math.sin(u * Math.PI) * 0.38;
          if (j < n) { const u2 = (j + 1) / n, x2 = lerp(ax, bx, u2), z2 = lerp(az, bz, u2), y2 = lerp(ah, bh, u2) - Math.sin(u2 * Math.PI) * 0.38; G.quad([x, y, z], [x2, y2, z2], [x2, y2 - 0.012, z2], [x, y - 0.012, z], '#2a2a2e', [0, 0, 1]); G.quad([x, y, z], [x, y - 0.012, z], [x2, y2 - 0.012, z2], [x2, y2, z2], '#2a2a2e', [0, 0, -1]); }
          if (j > 0 && j < n) Lz.box(0.07, 0.09, 0.07, cores[(j + i * 3) % cores.length], x, y - 0.1, z);
        }
      }
      const g = new THREE.Group(); g.position.set(B.x, y0, B.z);
      const mesa = G.malha(api.MAT); g.add(mesa);
      const matL = api.guardar(new THREE.MeshBasicMaterial({ vertexColors: true }));
      const luz = Lz.malha(matL); g.add(luz);
      for (const o of [mesa, luz]) api.guardar(o.geometry);
      g.visible = false; gc().add(g);
      return { g, col: { x0: B.x - 1.3, x1: B.x + 1.3, z0: B.z - 1.3, z1: B.z + 1.3 }, colRef: null };
    }
    function mostrarProps(ev, sim) {
      const R = ev.props; if (!R || R.g.visible === sim) return;
      R.g.visible = sim;
      if (sim) { R.colRef = ev.colFora; if (R.colRef && !R.colRef.includes(R.col)) R.colRef.push(R.col); }
      else if (R.colRef) { const i = R.colRef.indexOf(R.col); if (i >= 0) R.colRef.splice(i, 1); }
    }
    const _v = new THREE.Vector3();
    function naCamera(x, y, z, raio) {                                    // está na tela (e perto o bastante para alguém reparar)?
      if (typeof camera === 'undefined') return true;
      if (distJog(x, z) > 48) return false;
      _v.set(x + (api.OX || 0), y, z).project(camera); const m = 1 + raio * 0.15;
      return _v.z < 1 && Math.abs(_v.x) < m && Math.abs(_v.y) < m;
    }

    // ---------------------------------------------------------------- os instrumentos (uma malha cada, presa no corpo do músico)
    function geoInst(tipo) {
      if (P.geo[tipo]) return P.geo[tipo];
      const G = new api.Geo();
      if (tipo === 'cavaco' || tipo === 'banjo') {
        const banjo = tipo === 'banjo', braco = banjo ? 0.42 : 0.34;
        if (banjo) { prisma(G, 0.14, 0.06, 12, '#b8bcc2', '#f4f1e6', '#7a5a3a', [0, 0, -0.03], 'z'); prisma(G, 0.145, 0.012, 12, '#d8dce2', null, null, [0, 0, 0.03], 'z'); }
        else { G.box(0.3, 0.24, 0.07, '#c58a4a', 0, -0.12, 0); G.box(0.22, 0.28, 0.07, '#c58a4a', -0.02, -0.14, 0); G.box(0.075, 0.075, 0.012, '#2a1a0e', 0.05, -0.037, 0.03); G.box(0.04, 0.03, 0.012, '#3a2414', -0.09, -0.015, 0.03); }
        G.box(braco, 0.045, 0.03, '#5a3a1e', 0.15 + braco / 2, -0.022, 0.005); G.box(0.09, 0.065, 0.03, '#3a2414', 0.19 + braco, -0.032, 0.005);
        G.box(braco + 0.1, 0.022, 0.006, '#e8e2d0', 0.07 + braco / 2, -0.011, banjo ? 0.04 : 0.038);
      } else if (tipo === 'pandeiro') {
        prisma(G, 0.13, 0.05, 14, '#9a6a3a', '#efe6cf', '#6a4a2a', [0, 0, -0.025], 'z');
        for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2 + 0.3; G.box(0.045, 0.045, 0.03, '#d8dce2', Math.cos(a) * 0.12, Math.sin(a) * 0.12 - 0.022, 0); }
      } else if (tipo === 'tanta') {
        prisma(G, 0.145, 0.56, 12, '#1c1c1f', '#ece6d4', '#2a2a2e', [-0.28, 0, 0], 'x');
        for (const x of [-0.27, 0.24]) prisma(G, 0.152, 0.03, 12, '#c9ced4', null, null, [x, 0, 0], 'x');
      }
      const mesh = G.malha(api.MAT); api.guardar(mesh.geometry); P.geo[tipo] = mesh.geometry; return mesh.geometry;
    }
    // onde cada instrumento fica no corpo (sentado tocando / andando) e os alvos das mãos (A = em cima/batendo, B = o outro extremo)
    function posesInst() {
      if (P.poses) return P.poses;
      const V = (a) => new THREE.Vector3(a[0], a[1], a[2]);
      let k = 1;
      const em = (c, ex, ez, p) => {                                       // um ponto do instrumento (p no espaço dele) no espaço do corpo
        const o = new THREE.Object3D(); o.position.set(c[0], c[1], c[2]); orientar(o, ex, ez); o.scale.setScalar(k); o.updateMatrix();
        return V(p).applyMatrix4(o.matrix).toArray();
      };
      const Q = {};
      { const c = [0.24, 0.98, 0.1], ex = [0.3, 0.4, -0.88], ez = [1, 0, 0.32];                                // o cavaquinho (e o banjo, igual)
        for (const tipo of ['cavaco', 'banjo']) {
          k = ESCALA[tipo];
          const pescoco = tipo === 'banjo' ? 0.4 : 0.34;
          Q[tipo] = { c, ex, ez,
            E: [ik(-1, em(c, ex, ez, [pescoco, -0.03, -0.06])), ik(-1, em(c, ex, ez, [pescoco - 0.09, -0.03, -0.06]))],
            D: [ik(1, em(c, ex, ez, [0.03, 0.07, 0.1])), ik(1, em(c, ex, ez, [0.03, -0.07, 0.1]))] };
        } }
      k = ESCALA.pandeiro;
      { const c = [0.36, 1.1, -0.14], ez = [0.55, 0.12, 0.8], ex = [0, 1, 0];                                 // o pandeiro (na mão esquerda, a pele virada para a direita)
        const nz = V(ez).normalize(), aro = V([0, 1.27, -0.39]).sub(V(c)); aro.sub(nz.clone().multiplyScalar(aro.dot(nz))).normalize();
        const mE = V(c).add(aro.multiplyScalar(0.12 * k)).add(nz.clone().multiplyScalar(-0.03)).toArray();
        Q.pandeiro = { c, ex, ez, E: [ik(-1, mE), ik(-1, mE)],
          D: [ik(1, V(c).add(nz.clone().multiplyScalar(0.05 + 0.025 * k)).toArray()), ik(1, V(c).add(nz.clone().multiplyScalar(0.2)).add(V([0.02, 0.05, 0.04])).toArray())] }; }
      k = ESCALA.tanta;
      { const c = [0.26, 0.97, 0.02], ex = [0.42, 0.1, 0.9], ez = [0, 1, 0];                                  // o tantã atravessado no colo, a pele para a direita
        const ax = V(ex).normalize(), cab = V(c).add(ax.clone().multiplyScalar(0.28 * k));
        Q.tanta = { c, ex, ez,
          E: [ik(-1, V(c).add(ax.clone().multiplyScalar(-0.06)).add(V([0, 0.06 + 0.145 * k, 0])).toArray()), ik(-1, V(c).add(ax.clone().multiplyScalar(-0.04)).add(V([0, 0.13 + 0.145 * k, 0])).toArray())],
          D: [ik(1, cab.clone().add(ax.clone().multiplyScalar(0.07)).add(V([0, 0.03, 0])).toArray()), ik(1, cab.clone().add(ax.clone().multiplyScalar(0.12)).add(V([-0.02, 0.2, 0])).toArray())] }; }
      P.poses = Q; return Q;
    }
    function porInstrumento(A, tipo) {
      const mesh = new THREE.Mesh(geoInst(tipo), api.MAT); mesh.scale.setScalar(ESCALA[tipo]); A.m.corpo.add(mesh); A.pg.inst = { tipo, mesh }; instNasCostas(A);
    }
    function instTocando(A) {
      const I = A.pg.inst, Q = posesInst()[I.tipo]; I.mesh.position.set(Q.c[0], Q.c[1], Q.c[2]); orientar(I.mesh, Q.ex, Q.ez); I.zBase = I.mesh.rotation.z; I.mesh.scale.setScalar(ESCALA[I.tipo]);
    }
    function instNasCostas(A) {                                           // andando: nas costas (o pandeiro pendurado do lado)
      const I = A.pg.inst; if (!I) return;
      if (I.tipo === 'pandeiro') { I.mesh.position.set(0.02, 0.86, -0.27); orientar(I.mesh, [1, 0, 0], [0, 0, -1]); }
      else if (I.tipo === 'tanta') { I.mesh.position.set(-0.24, 1.0, 0.05); orientar(I.mesh, [0.15, 0.95, 0.25], [-1, 0, 0]); }
      else { I.mesh.position.set(-0.2, 0.62, 0.04); orientar(I.mesh, [0.05, 1, 0.3], [-1, 0, 0]); }
    }

    // ---------------------------------------------------------------- AS POSES (A.poseFn, por cima do poseAtor)
    const batida = () => P.mus.batidas();
    const soando = () => P.mus.tocando && !(P.ev && P.ev.fim && P.ev.fim.fase !== 'tocando');
    function levanta(padrao, s16, n) {                                    // a mão sobe entre uma batida e a próxima e desce NA batida
      const p = ((s16 % n) + n) % n; let h0 = -1, h1 = -1;
      for (const s of padrao) { if (s <= p) h0 = s; if (s > p && h1 < 0) h1 = s; }
      if (h0 < 0) h0 = padrao[padrao.length - 1] - n; if (h1 < 0) h1 = padrao[0] + n;
      const gap = h1 - h0, u = (p - h0) / gap; return Math.pow(Math.sin(u * Math.PI), 0.7) * Math.min(1, gap / 3);
    }
    const TRASTE = [0.2, 0.6, 0.35, 0.8, 0.2, 0.45, 0.1, 0.25, 0.7, 0.6, 0.35, 0.8, 0.2, 0.6, 0.5, 0.2];
    function poseMusico(A, m, r, dt) {
      const R = A.pg, I = R.inst; if (!I || !R.sentado) return;
      const Q = posesInst()[I.tipo], b = batida(), toca = soando(), s16 = b * 4, V = toca ? P.mus.volta() : { volta: 'intro', b: 0 };
      let kE = 0, kD = 0;
      if (I.tipo === 'cavaco' || I.tipo === 'banjo') {
        const ativo = toca && (I.tipo === 'cavaco' || V.volta !== 'intro' || Math.floor(b / 4) >= 1);
        kD = ativo ? 0.5 + 0.5 * Math.cos(s16 * Math.PI) : 0.5 + Math.sin((A.t || 0) * 0.7) * 0.08;
        R.traste = lerp(R.traste || 0.3, toca ? TRASTE[V.b % 16] : 0.3, Math.min(1, dt * 12)); kE = R.traste;
      } else if (I.tipo === 'pandeiro') {
        const fr = s16 - Math.floor(s16), acento = (Math.floor(s16) + 1) % 4 === 3;
        kD = toca ? (0.5 - 0.5 * Math.cos(fr * Math.PI * 2)) * (acento ? 1 : 0.45) : 0.15;
        I.mesh.rotation.z = (I.zBase || 0) + (toca ? Math.sin(s16 * Math.PI) * 0.12 : 0);
      } else if (I.tipo === 'tanta') {
        kD = toca ? levanta([0, 4, 7, 8, 10, 12, 14], s16, 16) : 0.1;
        kE = toca ? levanta([2, 6, 10, 14], s16, 16) * 0.5 : 0;
      }
      aplicarBraco(m.bracoE, Q.E[0], Q.E[1], kE); aplicarBraco(m.bracoD, Q.D[0], Q.D[1], kD);
      const bob = toca ? Math.abs(Math.sin(b * Math.PI)) : 0;
      m.corpo.rotation.x = toca ? Math.sin(b * Math.PI) * 0.035 : 0;
      const cantando = I.tipo === 'cavaco' && toca && V.volta === 'voz';
      usarCabeca(m, cantando ? 0.04 + bob * 0.04 : -0.12 + bob * 0.06); m.cabeca.rotation.y = cantando ? 0.25 : 0;
    }
    function poseDanca(A, m, r, lod) {                                // lod: longe da câmera, sem dobrar cotovelo/joelho (cada membro dobrado é 2 malhas)
      const cot = lod ? () => {} : usarCotovelo, joe = lod ? () => {} : usarJoelhos;
      const R = A.pg, b = batida() + (R.off || 0), s1 = Math.sin(b * Math.PI), s2 = Math.sin(b * Math.PI * 2), ab = Math.abs(s1);
      let est = R.estilo | 0;
      const V = P.mus.volta();
      if (R.palmeiro && V.volta === 'coro') est = 4;
      if (P.ev && P.ev.fim && P.ev.fim.fase === 'aplauso') est = 5;
      r.position.y = A.y + ab * 0.045;
      if (est === 0) {                                                // o balanço: braços dobrados indo e vindo, o corpo de lado a lado
        m.corpo.rotation.x = s1 * 0.06; m.bracoE.rotation.z = 0.5 + s1 * 0.4; m.bracoD.rotation.z = 0.5 - s1 * 0.4; cot(m.bracoE, 0, 1.3); cot(m.bracoD, 0, 1.3);
        m.pernaE.rotation.z = s1 * 0.15; m.pernaD.rotation.z = -s1 * 0.15; joe(m, -0.15 - ab * 0.15, -0.15 - (1 - ab) * 0.15);
      } else if (est === 1) {                                         // miudinho: os pés trocando rápido, o quadril e os braços soltos
        const s4 = Math.sin(b * Math.PI * 2); m.pernaE.rotation.z = Math.max(0, s4) * 0.3; m.pernaD.rotation.z = Math.max(0, -s4) * 0.3; joe(m, -0.15 - Math.max(0, s4) * 0.35, -0.15 - Math.max(0, -s4) * 0.35);
        m.bracoE.rotation.z = 0.35 + s1 * 0.2; m.bracoD.rotation.z = 0.35 - s1 * 0.2; m.bracoE.rotation.x = 0.3; m.bracoD.rotation.x = -0.3; cot(m.bracoE, 0, 0.9); cot(m.bracoD, 0, 0.9);
        m.corpo.rotation.y = s1 * 0.18;
      } else if (est === 2) {                                         // o passinho: as pernas alternando e os braços "socando"
        m.pernaE.rotation.z = s1 * 0.42; m.pernaD.rotation.z = -s1 * 0.42; joe(m, -0.2, -0.2);
        const p = Math.max(0, s2); m.bracoE.rotation.z = 0.35 + p * 0.5; m.bracoD.rotation.z = 0.35 + (1 - p) * 0.5; cot(m.bracoE, 0, 1.6); cot(m.bracoD, 0, 1.6);
        m.corpo.rotation.y = s1 * 0.25;
      } else if (est === 3) {                                         // rebolando: as mãos na cintura, o quadril vai e volta
        m.bracoE.rotation.z = 0.15; m.bracoE.rotation.x = 0.55; m.bracoD.rotation.z = 0.15; m.bracoD.rotation.x = -0.55; cot(m.bracoE, 0, 1.7); cot(m.bracoD, 0, 1.7);
        m.corpo.rotation.y = s1 * 0.4; m.corpo.rotation.x = s1 * 0.06; joe(m, -0.25, -0.25);
      } else {                                                        // batendo palma (o partido-alto no coro / o aplauso do fim)
        const k = est === 5 ? 0.5 + 0.5 * Math.cos(b * Math.PI * 4) : levanta(PALMAS, b * 4, 16);
        m.bracoE.rotation.z = est === 5 ? 1.55 : 1.15; m.bracoD.rotation.z = m.bracoE.rotation.z; m.bracoE.rotation.x = -0.32 + k * 0.6; m.bracoD.rotation.x = 0.32 - k * 0.6;
        cot(m.bracoE, -0.3, 0.75); cot(m.bracoD, 0.3, 0.75); joe(m, -0.1 - ab * 0.12, -0.1 - ab * 0.12); m.corpo.rotation.x = s1 * 0.04;
      }
    }
    function poseGente(A, m, r, dt) {
      const R = A.pg; if (!R) return;
      if (R.dancando && (soando() || (P.ev && P.ev.fim && P.ev.fim.fase === 'aplauso'))) { poseDanca(A, m, r, distJog(A.x, A.z) > 9); return; }
      m.corpo.rotation.y = 0; m.corpo.rotation.x = 0;
    }
    function soltarPose(A) { A.poseFn = null; if (A.m && A.m.corpo) { A.m.corpo.rotation.y = 0; A.m.corpo.rotation.x = 0; } }

    // ---------------------------------------------------------------- o evento (uma noite de sábado)
    function diaDoEvento() {
      const s = S(), d = s.dados, dia = d.dia || 1, h = d.hora, ds = api.diaSemana();
      if (ds === SABADO && h >= H_BANDA_VEM - 0.4) return dia;
      if (ds === SABADO + 1 && h < H_LIMPA - 24) return dia - 1;
      return 0;
    }
    function novoEvento(D) {
      const s = S(), B = lugarDaRoda(), base = (D - 1) * 24, C = api.PRACA_C;
      const ev = { D, base, B, banda: [], gente: [], rosa: null, slots: [], props: null, colFora: s.col, fim: null, tocou: false, cancelado: false, E: null, falouRosa: false };
      ev.B.lampX = C.x - 9; ev.B.lampZ = C.z + 6;
      ev.props = montarProps(ev.B);
      ev.slots = calcularSlots(ev);
      planejarGente(ev);
      return ev;
    }
    function calcularSlots(ev) {
      const s = S(), B = ev.B, R = api.PRACA, out = [], rosa = lugarRosa(B);
      const livreSlot = (x, z) => {
        if (x < R.x0 + 1.7 || x > R.x1 - 1.7 || z < R.z0 + 1.7 || z > R.z1 - 1.9) return false;
        for (const c of s.col) if (c !== ev.props.col && x > c.x0 - 0.65 && x < c.x1 + 0.65 && z > c.z0 - 0.65 && z < c.z1 + 0.65) return false;
        for (const c of s.circ || []) if (Math.hypot(x - c.x, z - c.z) < c.r + 0.6) return false;
        if (Math.abs(x - B.x) < 1.9 && Math.abs(z - B.z) < 1.9) return false;
        if (z - B.z > 1.4 && Math.abs(x - B.x) < 2.4) return false;                  // o lado da avenida fica aberto: quem chega pela calçada vê a banda
        return Math.hypot(rosa.x - x, rosa.z - z) > 1.1 && out.every((o) => Math.hypot(o.x - x, o.z - z) > 0.95);
      };
      for (const rr of [2.5, 3.4, 4.3, 5.2]) {
        const n = Math.round(rr * 2.2);
        for (let i = 0; i < n; i++) {
          const a = i / n * Math.PI * 2 + rr * 0.7, x = B.x + Math.cos(a) * rr, z = B.z + Math.sin(a) * rr;
          if (livreSlot(x, z)) out.push({ x, z, yaw: yawPara(B.x - x, B.z - z) + rnd(-0.35, 0.35), dono: null, frente: Math.cos(a) * 0.75 - Math.sin(a) * 0.45 });
        }
      }
      out.sort((a, b) => (Math.hypot(a.x - B.x, a.z - B.z) - a.frente * 0.8) - (Math.hypot(b.x - B.x, b.z - B.z) - b.frente * 0.8));
      return out;
    }
    function planejarGente(ev) {
      const n = Math.min(ev.slots.length - 1, 8 + Math.floor(Math.random() * 3)), base = ev.base;
      const casas = (S().casas || []).filter((c) => !c.especial && !c.marca && Math.hypot(c.x - ev.B.x, c.z - ev.B.z) > 18 && Math.hypot(c.x - ev.B.x, c.z - ev.B.z) < 75);
      for (let i = 0; i < n; i++) {
        const tarde = i < 3, cedo = i >= n - 2;
        ev.gente.push({ A: null, tChega: base + (cedo ? rnd(17.8, 18.15) : rnd(17.9, 20.4)), tSai: tarde ? base + H_FIM + rnd(0.05, 0.35) : base + rnd(20.5, 23.85), fem: Math.random() < 0.5, casa: casas.length && Math.random() < 0.75 ? pk(casas) : null,
          estilo: Math.floor(Math.random() * 4), off: rnd(-0.12, 0.12), palmeiro: Math.random() < 0.45, slot: null, estado: 'plano' });
      }
      ev.gente.sort((a, b) => a.tChega - b.tChega);
    }
    function acabarEvento(rapido) {
      const ev = P.ev; if (!ev) return;
      for (const M of ev.banda) if (M.A) descartar(M.A);
      for (const g of ev.gente) if (g.A) descartar(g.A);
      if (ev.rosa && ev.rosa.A) { descartar(ev.rosa.A); tirarFalaRosa(ev); }
      mostrarProps(ev, false); if (ev.props) { if (ev.props.g.parent) ev.props.g.parent.remove(ev.props.g); ev.props.g.traverse((o) => { if (o.geometry) o.geometry.dispose(); }); }
      P.mus.parar(rapido); P.ev = null;
    }
    function descartar(A) { const s = S(); if (s && (s.npcs.includes(A) || (s.fora && s.fora.npcs && s.fora.npcs.includes(A)))) api.descartarPessoa(A); }

    // ---------------------------------------------------------------- a banda
    function criarMusico(ev, i) {
      const c = CADEIRAS[i], ap = api.gerarAparencia(c.seed, c.fem ? 'F' : 'M');
      const A = api.criarNPCFixo(ap, c.fem, 0, ROUPA_BANDA); A.tipo = 'pagode'; A.vel = 1.45;
      const yaw = yawPara(-c.dx, -c.dz), cad = { x: ev.B.x + c.dx, z: ev.B.z + c.dz, yaw };
      const L = Math.hypot(c.dx, c.dz) || 1, fora = { x: ev.B.x + c.dx / L * 1.75, z: ev.B.z + c.dz / L * 1.75 };
      A.pg = { papel: 'musico', i, cad, fora, sentado: false, rota: null, vel: 1.45 + i * 0.03, entra: null };
      porInstrumento(A, c.inst);
      return A;
    }
    function sentarMusico(A) {
      const R = A.pg; A.x = R.cad.x; A.z = R.cad.z; A.y = api.altura(A.x, A.z); A.yaw = A.yawAlvo = R.cad.yaw;
      A.sentado = true; A.assento = 0.46; A.chao = false; A.andando = false; A.correndo = false; R.sentado = true; R.rota = null; R.entra = null;
      instTocando(A); A.poseFn = poseMusico;
    }
    function levantarMusico(A) {
      const R = A.pg; A.sentado = false; R.sentado = false; soltarPose(A); usarCabeca(A.m, 0); A.m.cabeca.rotation.y = 0; instNasCostas(A);
      usarCotovelo(A.m.bracoE, 0, 0); usarCotovelo(A.m.bracoD, 0, 0); A.m.bracoE.rotation.set(0, 0, 0); A.m.bracoD.rotation.set(0, 0, 0);
    }
    function tickBanda(ev, abs, snap) {
      const s = S(), tocar = abs >= ev.base + H_TOCA, fimHora = abs >= ev.base + H_FIM || ev.cancelado;
      if (!ev.banda.length && !fimHora && abs >= ev.base + H_BANDA_VEM) {   // ainda não veio: chega a pé pela ponta da cidade (ou já está lá)
        const direto = snap || abs >= ev.base + H_TOCA - 0.1 || distJog(ev.B.x, ev.B.z) > LONGE * 2.2 && abs >= ev.base + H_TOCA - 0.6;
        if (direto) {
          for (let i = 0; i < 4; i++) { const A = criarMusico(ev, i); ev.banda.push({ A }); sentarMusico(A); }
          mostrarProps(ev, true);
        } else {
          let E = null; try { E = api.pontaPara(ev.B.x, ev.B.z); } catch (e) { E = null; }
          if (!E) { for (let i = 0; i < 4; i++) { const A = criarMusico(ev, i); ev.banda.push({ A }); sentarMusico(A); } mostrarProps(ev, true); }
          else {
            ev.E = { x: E.x, z: E.z }; const enc = { x: ev.B.x + 2.3, z: ev.B.z + 0.4 };
            const rota = api.rotaGente(E.x, E.z, enc.x, enc.z).map((p) => ({ x: p.x, z: p.z }));
            for (let i = 0; i < 4; i++) ev.banda.push({ A: null, sai: i * 1.7, rota });
            ev.tVem = 0;
          }
        }
      }
      if (snap && ev.banda.length && !ev.fim) {                          // o relógio pulou / voltou de um lugar: a banda já está sentada
        ev.banda.forEach((M, i) => { if (!M.A) { M.A = criarMusico(ev, i); M.feito = true; } if (!M.A.pg.sentado) sentarMusico(M.A); });
        ev.tVem = null; mostrarProps(ev, true);
      } else if (snap && ev.fim && ev.fim.fase === 'indo') ev.banda.forEach((M) => { if (M.A) { descartar(M.A); M.A = null; } });
      // os que ainda vão sair da ponta (um atrás do outro)
      if (ev.E && ev.tVem != null && !ev.fim) {
        ev.tVem += s.dtPagode || 0.016;
        ev.banda.forEach((M, i) => {
          if (M.A || M.feito || ev.tVem < M.sai) return;
          const A = criarMusico(ev, i); M.A = A; M.feito = true; A.x = ev.E.x + (i % 2 ? 0.4 : -0.4); A.z = ev.E.z; A.y = api.altura(A.x, A.z);
          A.pg.rota = M.rota.map((p) => ({ x: p.x, z: p.z })).concat([{ x: A.pg.fora.x, z: A.pg.fora.z }]);
          A.pg.chegou = () => { A.pg.entra = { x0: A.x, z0: A.z, t: 0, d: 0.7 }; };
          if (A.pg.rota.length) A.yaw = A.yawAlvo = yawPara(A.pg.rota[0].x - A.x, A.pg.rota[0].z - A.z);
        });
        if (ev.banda.every((M) => M.feito)) ev.tVem = null;
      }
      const presentes = ev.banda.filter((M) => M.A);
      if (presentes.some((M) => M.A.pg.sentado) && !ev.props.g.visible) {   // a mesa aparece com a banda (de preferência fora da tela)
        ev.tMesa = (ev.tMesa || 0) + (s.dtPagode || 0.016);
        if (!naCamera(ev.B.x, 1, ev.B.z, 2) || ev.tMesa > 2.5) mostrarProps(ev, true);
      } else if (!presentes.length && !ev.props.g.visible && abs < ev.base + H_TOCA - 0.8 && !naCamera(ev.B.x, 1, ev.B.z, 2)) mostrarProps(ev, true);
      // começa a tocar às 18h (com todo mundo sentado; se alguém se atrasou, no máximo 18h30)
      const sentados = ev.banda.length === 4 && ev.banda.every((M) => M.A && M.A.pg.sentado);
      if (tocar && !fimHora && !P.mus.tocando && !ev.fim && (sentados || abs >= ev.base + H_TOCA + 0.5)) { P.mus.comecar(); ev.tocou = true; }
      // meia-noite (ou a chuva): o acorde final, o aplauso, levantam e vão embora pela ponta
      if (fimHora && !ev.fim) {
        const resta = P.mus.tocando ? (ev.cancelado ? 0 : P.mus.encerrar()) : 0;
        if (ev.cancelado) P.mus.parar(true);
        ev.fim = { fase: resta > 0 ? 'tocando' : 'aplauso', t: 0, resta: Math.max(0, resta - 3.4), apl: ev.cancelado ? 0.6 : 3.2 };
      }
      if (ev.fim) {
        const F = ev.fim; F.t += s.dtPagode || 0.016;
        if (F.fase === 'tocando' && F.t >= F.resta) { F.fase = 'aplauso'; F.t = 0; }
        else if (F.fase === 'aplauso' && F.t >= F.apl) { F.fase = 'indo'; F.t = 0; mandarBandaEmbora(ev, snap); }
      }
    }
    function mandarBandaEmbora(ev, snap) {
      const longe = snap || distJog(ev.B.x, ev.B.z) > LONGE;
      let E = null; if (!longe) try { E = api.pontaPara(ev.B.x, ev.B.z); } catch (e) { E = null; }
      ev.banda.forEach((M, i) => {
        const A = M.A; if (!A) return;
        if (longe || !E) { descartar(A); M.A = null; return; }
        const R = A.pg, sentado = R.sentado; R.entra = null;
        if (sentado) { levantarMusico(A); A.x = R.cad.x; A.z = R.cad.z; R.sai = { x0: A.x, z0: A.z, t: 0, d: 0.6 }; R.espera = i * 1.1; }
        R.rota = api.rotaGente(sentado ? R.fora.x : A.x, sentado ? R.fora.z : A.z, E.x, E.z).map((p) => ({ x: p.x, z: p.z }));
        R.chegou = () => { descartar(A); M.A = null; };
        R.indo = true;
      });
    }

    // ---------------------------------------------------------------- o povo
    function criarDancante(ev, g, noLugar) {
      const s = S(), A = api.criarPessoa(s.f2, Math.random, g.fem, false); s.npcs.push(A); A.tipo = 'pagode'; A.vel = rnd(1.25, 1.55);
      const slot = ev.slots.find((q) => !q.dono); if (!slot) { api.descartarPessoa(A); g.estado = 'sem lugar'; return; }
      slot.dono = g; g.slot = slot; g.A = A;
      A.pg = { papel: 'gente', g, dancando: false, rota: null, vel: A.vel, estilo: g.estilo, off: g.off, palmeiro: g.palmeiro };
      if (noLugar) { chegouNoSlot(A); return; }
      let ini = null, rota = null;
      if (g.casa) { const C = g.casa, dx = C.sx - C.x, dz = C.sz - C.z, d = Math.hypot(dx, dz) || 1; ini = { x: C.x + dx / d * 0.35, z: C.z + dz / d * 0.35 }; rota = [{ x: C.sx, z: C.sz }].concat(api.rotaGente(C.sx, C.sz, slot.x, slot.z)); try { api.portaCasa(C, 1.6); } catch (e) { /* sem porta */ } }
      else { let E = g.E || null; if (!E) try { E = api.pontaPara(slot.x, slot.z); } catch (e) { E = null; } if (!E) { chegouNoSlot(A); return; } ini = { x: E.x, z: E.z }; rota = api.rotaGente(E.x, E.z, slot.x, slot.z); }
      A.x = ini.x; A.z = ini.z; A.y = api.altura(A.x, A.z);
      A.pg.rota = rota.map((p) => ({ x: p.x, z: p.z })).concat([{ x: slot.x, z: slot.z }]); A.pg.chegou = () => chegouNoSlot(A);
      if (g.tV > 0) adiantar(A, (tAbs() - (g.tChega - g.tV)) / g.tV);
      if (A.pg.rota.length) A.yaw = A.yawAlvo = yawPara(A.pg.rota[0].x - A.x, A.pg.rota[0].z - A.z);
      g.estado = 'vindo';
    }
    // saiu atrasado (o relógio pulou, ou ele estava lá dentro de um lugar): já começa no ponto do caminho onde estaria agora, se esse
    //   ponto estiver longe do jogador (perto, sai da porta mesmo e chega um pouco depois)
    function adiantar(A, frac) {
      const R = A.pg; if (!R.rota || !(frac > 0.05)) return;
      const pts = [{ x: A.x, z: A.z }].concat(R.rota); let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].z - pts[i - 1].z);
      let alvo = Math.min(0.95, frac) * L;
      for (let i = 1; i < pts.length; i++) {
        const sg = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].z - pts[i - 1].z);
        if (alvo <= sg) { const u = sg > 0 ? alvo / sg : 0, x = lerp(pts[i - 1].x, pts[i].x, u), z = lerp(pts[i - 1].z, pts[i].z, u); if (distJog(x, z) < 30) return; A.x = x; A.z = z; A.y = api.altura(x, z); R.rota = R.rota.slice(i - 1); return; }
        alvo -= sg;
      }
    }
    function horasDeViagem(x0, z0, x1, z1, vel) {                       // o caminho de verdade (com as faixas: uma folga de 10%) em horas do relógio
      let pts = null; try { pts = api.rotaGente(x0, z0, x1, z1); } catch (e) { pts = null; } if (!pts || !pts.length) return 0;
      let L = Math.hypot(pts[0].x - x0, pts[0].z - z0); for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].z - pts[i - 1].z);
      return L / vel * (api.H_POR_S || 0.02) * 1.1;
    }
    function chegouNoSlot(A) {
      const R = A.pg, q = R.g.slot; A.x = q.x; A.z = q.z; A.y = api.altura(A.x, A.z); A.yaw = A.yawAlvo = q.yaw; A.andando = false; A.correndo = false;
      R.rota = null; R.dancando = true; R.g.estado = 'la'; A.poseFn = poseGente;
    }
    function mandarEmbora(ev, g, correndo) {
      const A = g.A; if (!A) return;
      if (g.slot) { g.slot.dono = null; g.slot = null; }
      g.estado = 'indo'; A.pg.dancando = false; soltarPose(A); A.fala = false;
      if (distJog(A.x, A.z) > LONGE) { descartar(A); g.A = null; g.estado = 'foi'; return; }
      if (correndo) { A.correndo = true; A.pg.vel = 2.9; }
      if (g.casa) {
        const C = g.casa, dx = C.sx - C.x, dz = C.sz - C.z, d = Math.hypot(dx, dz) || 1;
        A.pg.rota = api.rotaGente(A.x, A.z, C.sx, C.sz).map((p) => ({ x: p.x, z: p.z })).concat([{ x: C.x + dx / d * 0.6, z: C.z + dz / d * 0.6 }]); A.pg.porta = C;
        A.pg.chegou = () => { descartar(A); g.A = null; g.estado = 'foi'; };
      } else {
        A.pg.rota = null; api.irEmbora(A, null, correndo ? 2.9 : A.vel, () => { g.A = null; g.estado = 'foi'; });
      }
    }
    function tickGente(ev, abs, snap) {
      const s = S(), chuva = ev.cancelado;
      for (const g of ev.gente) {
        if (g.estado === 'plano' && !chuva && abs < g.tSai && abs < ev.base + H_FIM) {
          if (g.tV == null && abs >= g.tChega - 3) {                     // sai de casa (ou da ponta da cidade) a tempo de chegar na hora marcada
            if (!g.casa) { try { g.E = api.pontaPara(ev.B.x, ev.B.z); } catch (e) { g.E = null; } }
            const o = g.casa ? { x: g.casa.sx, z: g.casa.sz } : g.E; g.tV = o ? horasDeViagem(o.x, o.z, ev.B.x, ev.B.z, 1.3) : 0;
          }
          if (g.tV != null && abs >= g.tChega - g.tV) { const B = ev.B; criarDancante(ev, g, abs >= g.tChega && (snap || distJog(B.x, B.z) > LONGE)); }   // já no lugar só quem a esta hora já teria chegado
        }
        if (g.A && (g.estado === 'la' || g.estado === 'vindo') && (abs >= g.tSai || chuva || abs >= ev.base + H_ULTIMO)) {
          if (g.estado === 'vindo') { descartar(g.A); g.A = null; g.estado = 'foi'; if (g.slot) { g.slot.dono = null; g.slot = null; } continue; }
          mandarEmbora(ev, g, chuva && !snap);
        }
        if (g.A && g.estado === 'la' && !g.A.pg.dancando) g.A.pg.dancando = true;
        if (g.A && g.estado === 'la') {                                  // parado esperando a música: conversa com quem está do lado
          const A = g.A; if (!soando() && !(ev.fim && ev.fim.fase === 'aplauso')) { A.pg.tFala = (A.pg.tFala || rnd(1, 5)) - (s.dtPagode || 0.016); if (A.pg.tFala <= 0) { A.fala = !A.fala; A.pg.tFala = A.fala ? rnd(1.2, 3) : rnd(2, 6); } }
          else if (A.fala) A.fala = false;
        }
      }
      if (snap) for (const g of ev.gente) if (g.A && g.estado === 'vindo' && abs >= g.tChega && distJog(g.A.x, g.A.z) > 25) chegouNoSlot(g.A);   // o relógio pulou: quem já devia ter chegado, chegou
    }

    // ---------------------------------------------------------------- a Rosa (de vestido novo)
    function criarRosa(ev, noLugar) {
      const s = S(), pele = (typeof PELES_FITZ !== 'undefined' && PELES_FITZ[2]) ? PELES_FITZ[2].cor : '#c98e65';
      const ap = Object.assign(api.gerarAparencia(7310, 'F'), { pele });
      const A = api.criarNPCFixo(ap, true, 2, ['#d8344a', '#d8344a', '#f2c230', '#f2f2ee']); A.tipo = 'pagode'; A.vel = 1.4;
      const slot = lugarRosa(ev.B);
      A.pg = { papel: 'rosa', dancando: false, rota: null, vel: 1.4, estilo: 3, off: 0.05, palmeiro: true, slotR: slot };
      const casa = (s.casas || []).find((c) => c.especial === 'rosa');
      ev.rosa = { A, casa, estado: 'vindo' };
      if (noLugar || !casa) { chegouRosa(ev); return; }
      const dx = casa.sx - casa.x, dz = casa.sz - casa.z, d = Math.hypot(dx, dz) || 1; A.x = casa.x + dx / d * 0.35; A.z = casa.z + dz / d * 0.35; A.y = api.altura(A.x, A.z);
      A.pg.rota = [{ x: casa.sx, z: casa.sz }].concat(api.rotaGente(casa.sx, casa.sz, slot.x, slot.z)).map((p) => ({ x: p.x, z: p.z })).concat([{ x: slot.x, z: slot.z }]);
      A.pg.chegou = () => chegouRosa(ev); try { api.portaCasa(casa, 1.6); } catch (e) { /* sem porta */ }
      if (ev.rosaTV > 0) adiantar(A, (tAbs() - (ev.base + H_ROSA_VEM - ev.rosaTV)) / ev.rosaTV);
      if (A.pg.rota.length) A.yaw = A.yawAlvo = yawPara(A.pg.rota[0].x - A.x, A.pg.rota[0].z - A.z);
    }
    function chegouRosa(ev) {
      const A = ev.rosa.A, q = A.pg.slotR; A.x = q.x; A.z = q.z; A.y = api.altura(A.x, A.z); A.yaw = A.yawAlvo = q.yaw; A.andando = false;
      A.pg.rota = null; A.pg.dancando = true; A.poseFn = poseGente; ev.rosa.estado = 'la';
    }
    function falaRosa(ev) { const s = S(); if (!ev.rosa || !ev.rosa.A) return; s.falantesExtra = s.falantesExtra || {}; const X = s.falantesExtra.rosa; if (!X || X.A !== ev.rosa.A) s.falantesExtra.rosa = { A: ev.rosa.A, nome: 'Rosa', voz: 0 }; }
    function tirarFalaRosa(ev) { const s = S(); if (s && s.falantesExtra && ev.rosa && s.falantesExtra.rosa && s.falantesExtra.rosa.A === ev.rosa.A) delete s.falantesExtra.rosa; }
    function tickRosa(ev, abs, snap) {
      const R = ev.rosa;
      if (!R && ev.rosaTV == null && abs >= ev.base + H_ROSA_VEM - 3) { const c = (S().casas || []).find((q) => q.especial === 'rosa'); ev.rosaTV = c ? horasDeViagem(c.sx, c.sz, ev.B.x, ev.B.z, 1.4) : 0; }
      if (!R && !ev.cancelado && ev.rosaTV != null && abs >= ev.base + H_ROSA_VEM - ev.rosaTV && abs < ev.base + H_ROSA_VAI) criarRosa(ev, abs >= ev.base + H_ROSA_VEM && (snap || distJog(ev.B.x, ev.B.z) > LONGE));
      if (!ev.rosa || !ev.rosa.A) return;
      const A = ev.rosa.A;
      if (ev.rosa.estado !== 'indo') falaRosa(ev);
      if (ev.rosa.estado !== 'indo' && !A.pg.conversa && (abs >= ev.base + H_ROSA_VAI || ev.cancelado || abs >= ev.base + H_FIM)) {
        ev.rosa.estado = 'indo'; tirarFalaRosa(ev); A.pg.dancando = false; soltarPose(A);
        if (snap || distJog(A.x, A.z) > LONGE) { descartar(A); ev.rosa.A = null; return; }
        if (ev.cancelado) A.correndo = true;
        api.irEmbora(A, ev.rosa.casa ? 'rosa' : null, ev.cancelado ? 2.9 : 1.4, () => { if (ev.rosa) ev.rosa.A = null; });
      }
    }
    async function conversarRosa() {
      const ev = P.ev, R = ev && ev.rosa, A = R && R.A; if (!A) return;
      A.pg.conversa = true; A.pg.dancando = false; soltarPose(A);
      const J = S().jog; A.yawAlvo = yawPara(J.x - A.x, J.z - A.z); J.yawAlvo = yawPara(A.x - J.x, A.z - J.z);
      try {
        const ab = api.falaAmizade ? api.falaAmizade('rosa') : null;
        if (ab && ab.est === 'corte') { if (ab.l) await api.fala('rosa', ab.l); return; }
        if (api.papoEsgotado && api.papoEsgotado('rosa')) { await api.fala('rosa', Tx('Agora deixa eu dançar um pouquinho! Amanhã a gente conversa mais.')); return; }   // as 2 conversas do dia já foram
        if (ab && ab.l) await api.fala('rosa', ab.l);
        if (!ev.falouRosa) {
          ev.falouRosa = true;
          const p = Tx('Você veio! Eu falei que o pagode da praça era a coisa mais animada da cidade!');
          await api.fala('rosa', p);
          const r = await Escolha.mostrar(p, [Tx('Vim! Me ensina o passo?'), Tx('Tô só olhando mesmo.'), Tx('Isso aqui é barulho demais.')]);
          if (r === 2) { await api.fala('jog', Tx('Isso aqui é barulho demais.')); if (api.grosseria) api.grosseria('rosa'); await api.fala('rosa', Tx('Barulho? Isso é alegria! Pode voltar pro seu sofá, então.')); return; }
          if (r === 1) { await api.fala('jog', Tx('Tô só olhando mesmo.')); await api.fala('rosa', Tx('Olhar não vale! Eu disse que ia te obrigar a dançar, lembra? Vem!')); }
          else { await api.fala('jog', Tx('Vim! Me ensina o passo?')); await api.fala('rosa', Tx('É só deixar o corpo ir no pandeiro. Vem, presta atenção!')); }
          Dialogo.esconder();
          await dancarJunto(A, 6.5);
          await api.fala('rosa', Tx(r === 1 ? 'Pronto, nem doeu!' : 'Viu? Você leva jeito!'));
          if (api.papoAmizade) api.papoAmizade('rosa', 2);
          return;
        }
        await api.fala('rosa', Tx(pk(['Essa banda vem de fora, sabia? Todo sábado eles chegam a pé, com os instrumentos nas costas.', 'Ai, meus pés! Mas daqui a pouco eu volto pra roda.', 'Gostou do vestido novo? Comprei só pra hoje!'])));
        if (api.papoAmizade) api.papoAmizade('rosa', 2);
      } finally {
        if (A.pg) { A.pg.conversa = false; if (R.estado === 'la') { A.pg.dancando = true; A.poseFn = poseGente; A.yawAlvo = A.pg.slotR.yaw; } }
      }
    }

    // ---------------------------------------------------------------- o jogador dança (sozinho ou com a Rosa)
    function poseJog(J, m, r) { poseDanca(J, m, r); }
    async function dancarJunto(B, seg) {
      const s = S(), J = s.jog;
      if (B) { B.pg.dancando = true; B.poseFn = poseGente; B.yawAlvo = yawPara(J.x - B.x, J.z - B.z); }
      J.pg = { estilo: Math.floor(Math.random() * 4), off: 0, palmeiro: false }; J.poseFn = poseJog;
      try {
        const passos = Math.max(1, Math.round(seg / 2.2));
        for (let k = 0; k < passos; k++) { await api.esperar(2200); J.pg.estilo = (J.pg.estilo + 1 + Math.floor(Math.random() * 3)) % 4; if (B && B.pg) B.yawAlvo = yawPara(J.x - B.x, J.z - B.z); }
      } finally { J.poseFn = null; J.pg = null; if (J.m && J.m.corpo) { J.m.corpo.rotation.y = 0; J.m.corpo.rotation.x = 0; } }
    }
    async function dancarJog() {
      if (P.servindo) return; P.servindo = true;
      try { const J = S().jog; if (J.sentado) api.levantar(); J.yawAlvo = yawPara(P.ev.B.x - J.x, P.ev.B.z - J.z); await dancarJunto(null, 9); }
      catch (e) { console.error('[Pagode] dançar:', e); }
      finally { P.servindo = false; }
    }

    // ---------------------------------------------------------------- o som (volume, abafado, lado) e o jazz da rua
    function tickSom(dt) {
      const s = S(), ev = vivo() ? P.ev : null; let v = 0, corte = 12000, pan = 0;
      const naRua = !s.dentro && s.grupoCidade && s.grupoCidade.visible && s.ativo !== false;
      if (ev && naRua) {
        const J = s.jog, d = Math.hypot(J.x - ev.B.x, J.z - ev.B.z), k = clamp(1 - (d - 6) / 56, 0, 1);
        v = k * k * (3 - 2 * k); corte = 650 + 11500 * k * k;
        if (typeof camera !== 'undefined') {
          const e = camera.matrixWorld.elements, rx = e[0], rz = e[2], dx = ev.B.x + (api.OX || 0) - camera.position.x, dz = ev.B.z - camera.position.z, dl = Math.hypot(dx, dz) || 1, rl = Math.hypot(rx, rz) || 1;
          pan = clamp((rx * dx + rz * dz) / (rl * dl), -1, 1) * 0.55 * (1 - k * 0.7);
        }
      }
      P.mus.mixar(v, corte, pan, dt);
      const M = typeof Musica !== 'undefined' ? Musica : null; if (!M) return;
      const forte = P.mus.tocando && v > 0.18;
      if (forte && M.tocando && M.estilo === 'jazz') { M.parar(); P.jazzPausado = true; }
      else if (P.jazzPausado && !forte) {
        if (s.dentro || !naRua) P.jazzPausado = false;
        else if ((v < 0.08 || !P.mus.tocando) && !M.tocando && s.modo === 'livre') { M.tocar('jazz'); P.jazzPausado = false; }
      }
    }

    // ---------------------------------------------------------------- tick (todo quadro)
    function tick(dt) {
      const s = S(); if (!s || !s.dados || !s.jog) return;
      s.dtPagode = dt;
      const abs = tAbs(), pulo = P.absAnt != null && Math.abs(abs - P.absAnt) > 0.3; P.absAnt = abs;
      const D = diaDoEvento();
      if (P.ev && P.ev.D !== D) acabarEvento(true);
      if (!P.ev && D && !s.dentro && abs < (D - 1) * 24 + H_FIM - 0.3) {
        if (chovendo() && abs >= (D - 1) * 24 + H_BANDA_VEM) P.ev = { D, morto: true, base: (D - 1) * 24, banda: [], gente: [] };   // chovendo na hora: nesta noite não tem
        else P.ev = novoEvento(D);
      }
      if (P.ev && P.ev.morto) return;
      const ev = P.ev;
      tickSom(dt);
      const dentro = !!s.dentro, voltou = P.estavaDentro && !dentro; P.estavaDentro = dentro;
      if (!ev || dentro) return;
      const snap = P.primeiro || pulo || voltou; P.primeiro = false;
      if (!ev.cancelado && chovendo() && abs >= ev.base + H_BANDA_VEM) ev.cancelado = true;
      if (abs >= ev.base + H_LIMPA) { acabarEvento(true); return; }
      tickBanda(ev, abs, snap); tickGente(ev, abs, snap); tickRosa(ev, abs, snap);
      // a mesa some quando não tem mais ninguém (fora da tela, ou de qualquer jeito bem depois)
      if (ev.fim && ev.fim.fase === 'indo' && ev.props.g.visible && !ev.banda.some((M) => M.A && M.A.pg.sentado)) {
        if (snap || !naCamera(ev.B.x, 1, ev.B.z, 2) || abs >= ev.base + H_LIMPA - 0.4) mostrarProps(ev, false);
      }
      const ninguem = ev.fim && ev.fim.fase === 'indo' && !ev.banda.some((M) => M.A) && !ev.gente.some((g) => g.A) && !(ev.rosa && ev.rosa.A) && !ev.props.g.visible;
      if (ninguem || (ev.cancelado && !ev.banda.length && !ev.gente.some((g) => g.A) && !(ev.rosa && ev.rosa.A))) { const D0 = ev.D; acabarEvento(false); P.ev = { D: D0, morto: true, base: (D0 - 1) * 24, banda: [], gente: [] }; }
    }

    // quem tem A.tipo === 'pagode' (chamado pelo tickPessoas)
    function tickAtor(A, dt) {
      const R = A.pg; if (!R) { A.andando = false; return; }
      if (R.espera > 0) { R.espera -= dt; A.andando = false; return; }
      if (R.entra) {                                                    // os últimos passos até a cadeira (dentro da mesa: sem colisão)
        const E = R.entra; E.t += dt; const u = clamp(E.t / E.d, 0, 1);
        A.x = lerp(E.x0, R.cad.x, u); A.z = lerp(E.z0, R.cad.z, u); A.andando = u < 1; A.yawAlvo = u < 0.8 ? yawPara(R.cad.x - E.x0, R.cad.z - E.z0) : R.cad.yaw;
        if (u >= 1) sentarMusico(A); return;
      }
      if (R.sai) {                                                      // da cadeira para fora da mesa
        const E = R.sai; E.t += dt; const u = clamp(E.t / E.d, 0, 1);
        A.x = lerp(E.x0, R.fora.x, u); A.z = lerp(E.z0, R.fora.z, u); A.andando = true; A.yawAlvo = yawPara(R.fora.x - E.x0, R.fora.z - E.z0);
        if (u >= 1) R.sai = null; return;
      }
      if (R.rota) {
        if (R.porta && Math.hypot(A.x - R.porta.x, A.z - R.porta.z) < 2.2) { try { api.portaCasa(R.porta, 1.4); } catch (e) { /* sem porta */ } }
        if (api.seguir(A, R.rota, R.vel, dt)) { R.rota = null; A.andando = false; A.correndo = false; const f = R.chegou; R.chegou = null; if (f) f(); }
        return;
      }
      A.andando = false; A.correndo = false;
      if (R.sentado) { A.x = R.cad.x; A.z = R.cad.z; A.yawAlvo = R.cad.yaw; }
    }

    function alvos(v) {
      if (!vivo()) return; const ev = P.ev, s = S(), J = s.jog;
      const R = ev.rosa; if (R && R.A && R.estado === 'la' && !R.A.pg.conversa) v.push({ x: R.A.x, z: R.A.z, r: 2.2, txt: Tx('Falar com a Rosa'), fn: conversarRosa, y: 2.5, pri: true });
      const dB = Math.hypot(J.x - ev.B.x, J.z - ev.B.z), pertoRosa = R && R.A && Math.hypot(J.x - R.A.x, J.z - R.A.z) < 2.4;
      if (soando() && !P.servindo && !J.sentado && !pertoRosa && dB < 6.5 && dB > 1.6) {                // a seta fica no chão, um passo à frente (na direção da roda)
        const k = 0.9 / dB; v.push({ x: J.x + (ev.B.x - J.x) * k, z: J.z + (ev.B.z - J.z) * k, r: 1.3, txt: Tx('Dançar'), fn: dancarJog, y: 0.9 });
      }
    }
    function limpar() {
      try { if (vivo()) acabarEvento(true); } catch (e) { /* nada */ }
      P.mus.parar(true);
      if (P.jazzPausado) P.jazzPausado = false;
    }
    return {
      tick: (dt) => { if (P.ev && P.ev.morto) { const D = diaDoEvento(); if (D !== P.ev.D) P.ev = null; else { P.absAnt = tAbs(); P.estavaDentro = !!S().dentro; tickSom(dt); return; } } tick(dt); },
      tickAtor, alvos, limpar,
      ativo: () => vivo(), tocando: () => P.mus.tocando,
      _P: P, _f: { lugarDaRoda, posesInst, ik, maoEm, novoEvento, acabarEvento },
    };
  }

  const dados = { criarMusica, TRAD };
  window.FutebolJS.registrarFase({ id: 'pagode', nome: 'Pagode na praça', nucleoMinimo: '7.5', iniciar: async () => {}, criar, dados });
})();
