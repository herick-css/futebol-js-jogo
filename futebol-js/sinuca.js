/* =====================================================================
   FUTEBOL JS · sinuca.js · O MINIGAME DE SINUCA (arquivo SEPARADO, como pesca.js)
   ---------------------------------------------------------------------
   7.1.5 — primeira versão (usado pelo bar.js: a mesa de sinuca do Bar do Jairo).
   - Registrado com FutebolJS.registrarFase({ id: 'sinuca' }) só para o jogo saber baixar o arquivo; NÃO roda como fase.
     O bar.js baixa e chama jogar({ oponente, aposta, nomeJog, audio }) → Promise<{ venceu, desistiu }>.
   - A MESA é desenhada pixel a pixel (300 x 164): madeira com os losangos, o pano verde com textura, as 6 caçapas e as 16 bolas
     (lisas 1–7, a 8 preta, listradas 9–15 e a branca), com brilho e sombra.
   - FÍSICA: atrito, choque elástico entre as bolas, tabelas (com a "boca" das caçapas do meio) e caçapas. Passos fixos de 1/240 s.
   - REGRAS (bola 8 simplificada): quem encaçapa primeiro fica com o grupo (lisas ou listradas); encaçapou uma sua, joga de novo;
     FALTA (a branca caiu, não tocou em nada, tocou primeiro numa bola do outro ou na 8 antes da hora) = bola na mão para o outro;
     a 8 por último ganha; a 8 antes da hora (ou com falta) perde.
   - CONTROLES: mira arrastando/movendo o dedo ou o mouse na mesa (◀ ▶ e as setas para o ajuste fino); SEGURE o botão TACAR (ou o
     espaço) e solte na força certa (a barra vai e volta). Com a bola na mão: toque onde quer pôr a branca e confirme.
   - A IA: procura as jogadas (a bola, a caçapa, o ângulo de corte, o caminho livre), SIMULA as melhores e escolhe; erra a mira de
     acordo com a habilidade (graus). O Valdemar ainda pensa na posição da branca para a próxima (o mais difícil).
   ===================================================================== */
(function () {
  'use strict';

  const TRAD = {
    'Sinuca': ['Pool', 'Billar', 'Biliardo', 'Billard'],
    'Sua vez': ['Your turn', 'Tu turno', 'Tocca a te', 'À toi'],
    'Vez de {0}': ['{0}’s turn', 'Turno de {0}', 'Tocca a {0}', 'À {0} de jouer'],
    'Mesa aberta': ['Open table', 'Mesa abierta', 'Tavolo aperto', 'Table ouverte'],
    'Lisas': ['Solids', 'Lisas', 'Piene', 'Pleines'], 'Listradas': ['Stripes', 'Rayadas', 'Spezzate', 'Rayées'],
    'TACAR': ['SHOOT', 'TIRAR', 'TIRA', 'TIRER'],
    'Desistir': ['Give up', 'Rendirse', 'Arrenditi', 'Abandonner'],
    'Começar': ['Start', 'Empezar', 'Inizia', 'Commencer'],
    'Continuar': ['Continue', 'Continuar', 'Continua', 'Continuer'],
    'Confirmar a branca': ['Place the cue ball', 'Confirmar la blanca', 'Conferma la bianca', 'Valider la blanche'],
    'Bola na mão: toque na mesa para pôr a branca.': ['Ball in hand: tap the table to place the cue ball.', 'Bola en mano: toca la mesa para poner la blanca.', 'Palla in mano: tocca il tavolo per mettere la bianca.', 'Bille en main : touche la table pour placer la blanche.'],
    'Falta! Bola na mão para você.': ['Foul! Ball in hand for you.', '¡Falta! Bola en mano para ti.', 'Fallo! Palla in mano per te.', 'Faute ! Bille en main pour toi.'],
    'Falta! Bola na mão para {0}.': ['Foul! Ball in hand for {0}.', '¡Falta! Bola en mano para {0}.', 'Fallo! Palla in mano per {0}.', 'Faute ! Bille en main pour {0}.'],
    'Você ficou com as lisas.': ['You got the solids.', 'Te tocaron las lisas.', 'Hai le piene.', 'Tu as les pleines.'],
    'Você ficou com as listradas.': ['You got the stripes.', 'Te tocaron las rayadas.', 'Hai le spezzate.', 'Tu as les rayées.'],
    'A branca caiu!': ['The cue ball went in!', '¡Se cayó la blanca!', 'È caduta la bianca!', 'La blanche est tombée !'],
    'Não tocou em nenhuma bola.': ['Didn’t hit any ball.', 'No tocó ninguna bola.', 'Non ha toccato nessuna palla.', 'Aucune bille touchée.'],
    'Tocou primeiro na bola errada.': ['Hit the wrong ball first.', 'Tocó primero la bola equivocada.', 'Ha toccato prima la palla sbagliata.', 'A touché la mauvaise bille en premier.'],
    'A 8 caiu antes da hora!': ['The 8 went in too early!', '¡La 8 cayó antes de tiempo!', 'L’8 è caduta troppo presto!', 'La 8 est tombée trop tôt !'],
    'A 8 voltou para a mesa.': ['The 8 is back on the table.', 'La 8 volvió a la mesa.', 'L’8 torna sul tavolo.', 'La 8 revient sur la table.'],
    'Encaçapou! Joga de novo.': ['Potted! Shoot again.', '¡Embocada! Tira de nuevo.', 'Imbucata! Tira ancora.', 'Empochée ! Rejoue.'],
    'Agora é a 8!': ['Now it’s the 8!', '¡Ahora va la 8!', 'Adesso tocca all’8!', 'Maintenant, la 8 !'],
    'Você venceu!': ['You won!', '¡Ganaste!', 'Hai vinto!', 'Tu as gagné !'],
    'Você perdeu...': ['You lost...', 'Perdiste...', 'Hai perso...', 'Tu as perdu...'],
    '{0} venceu.': ['{0} won.', '{0} ganó.', '{0} ha vinto.', '{0} a gagné.'],
    'Valendo {0} fakes': ['Playing for {0} fakes', 'Por {0} fakes', 'In palio {0} fakes', 'Pour {0} fakes'],
    'Só por diversão': ['Just for fun', 'Solo por diversión', 'Solo per divertimento', 'Juste pour le plaisir'],
    'Você sai jogando.': ['You break.', 'Tú abres.', 'Spacchi tu.', 'Tu casses.'],
    'Mire arrastando na mesa. Segure TACAR e solte na força certa.': ['Aim by dragging on the table. Hold SHOOT and release at the right power.', 'Apunta arrastrando en la mesa. Mantén TIRAR y suelta con la fuerza justa.', 'Mira trascinando sul tavolo. Tieni premuto TIRA e rilascia alla forza giusta.', 'Vise en glissant sur la table. Maintiens TIRER et relâche à la bonne puissance.'],
    'Habilidade': ['Skill', 'Habilidad', 'Abilità', 'Niveau'],
    'Desistir da partida? Conta como derrota.': ['Give up the match? It counts as a loss.', '¿Rendirse? Cuenta como derrota.', 'Arrendersi? Conta come sconfitta.', 'Abandonner ? Ça compte comme une défaite.'],
    'Sim': ['Yes', 'Sí', 'Sì', 'Oui'], 'Não': ['No', 'No', 'No', 'Non'],
    'pensando...': ['thinking...', 'pensando...', 'sta pensando...', 'réfléchit...'],
  };
  const tr = (k) => (typeof T === 'function' ? T(k) : k);
  const trf = (k, ...a) => { let s = tr(k); a.forEach((v, i) => { s = s.split('{' + i + '}').join(v); }); return s; };

  // ------------------------------------------------------------------ a mesa (unidades = pixels do desenho)
  const CW = 300, CH = 164, X0 = 14, Y0 = 14, X1 = 286, Y1 = 150, XM = (X0 + X1) / 2, YM = (Y0 + Y1) / 2, R = 4.5;
  const CACAPAS = [
    { x: X0 - 1, y: Y0 - 1, r: 10.5 }, { x: XM, y: Y0 - 4, r: 9.3, meio: true }, { x: X1 + 1, y: Y0 - 1, r: 10.5 },
    { x: X0 - 1, y: Y1 + 1, r: 10.5 }, { x: XM, y: Y1 + 4, r: 9.3, meio: true }, { x: X1 + 1, y: Y1 + 1, r: 10.5 },
  ];
  const MIRA_C = CACAPAS.map((p) => ({ x: p.meio ? p.x : p.x < XM ? p.x + 3.5 : p.x - 3.5, y: p.meio ? (p.y < YM ? Y0 + 1 : Y1 - 1) : p.y < YM ? p.y + 3.5 : p.y - 3.5 }));   // para onde mirar (a boca)
  const CABECA = { x: X0 + (X1 - X0) * 0.25, y: YM }, PE = { x: X0 + (X1 - X0) * 0.74, y: YM };
  const VMAX = 560, DEC = 62, KF = 0.32, E_BOLA = 0.95, E_TABELA = 0.74;
  const CORES = ['#f8f6ee', '#f2c230', '#2f6ad8', '#d8302a', '#7a3fb0', '#e8742a', '#1f9a4d', '#8a2a20', '#1c1c1f'];
  const corDe = (id) => CORES[id <= 8 ? id : id - 8];
  const grupoDe = (id) => (id >= 1 && id <= 7 ? 'lisas' : id >= 9 ? 'listradas' : id === 8 ? 'oito' : 'branca');

  // ------------------------------------------------------------------ FÍSICA (pura: serve para o jogo e para a IA simular)
  function novasBolas() {
    const B = [{ id: 0, x: CABECA.x, y: CABECA.y, vx: 0, vy: 0, fora: false }];
    const ordem = [1, 9, 2, 10, 8, 3, 11, 4, 12, 5, 13, 6, 14, 7, 15];   // o triângulo: 8 no meio, uma lisa e uma listrada nos cantos de trás
    const meio = [1, 9, 2, 10, 3, 11, 4, 12, 5, 13, 6, 14, 7, 15].sort(() => Math.random() - 0.5);
    let k = 0; const dx = R * 2 * 0.868, pos = [];
    for (let lin = 0; lin < 5; lin++) for (let c = 0; c <= lin; c++) pos.push({ x: PE.x + lin * dx, y: PE.y + (c - lin / 2) * R * 2.02 });
    // posição 4 = o meio da 3.ª fileira (a 8); 10 e 14 = os cantos de trás (uma de cada grupo)
    const lisa = meio.find((i) => i < 8), lis = meio.find((i) => i > 8), resto = meio.filter((i) => i !== lisa && i !== lis);
    for (let p = 0; p < 15; p++) { const id = p === 4 ? 8 : p === 10 ? lisa : p === 14 ? lis : resto[k++]; B.push({ id, x: pos[p].x + (Math.random() - 0.5) * 0.2, y: pos[p].y + (Math.random() - 0.5) * 0.2, vx: 0, vy: 0, fora: false }); }
    void ordem; return B;
  }
  const clonar = (B) => B.map((b) => ({ id: b.id, x: b.x, y: b.y, vx: b.vx, vy: b.vy, fora: b.fora }));
  const parado = (B) => B.every((b) => b.fora || (b.vx === 0 && b.vy === 0));
  function passo(B, h, ev) {
    const n = B.length;
    for (let i = 0; i < n; i++) { const b = B[i]; if (!b.fora && (b.vx || b.vy)) { b.x += b.vx * h; b.y += b.vy * h; } }
    // bolas com bolas
    for (let i = 0; i < n; i++) {
      const a = B[i]; if (a.fora) continue;
      for (let j = i + 1; j < n; j++) {
        const c = B[j]; if (c.fora) continue;
        const dx = c.x - a.x, dy = c.y - a.y, d2 = dx * dx + dy * dy; if (d2 >= 4 * R * R || d2 < 1e-9) continue;
        // volta as duas para o instante exato do toque (senão a normal sai torta nos cortes), troca as velocidades e avança de novo
        const rvx = c.vx - a.vx, rvy = c.vy - a.vy, v2 = rvx * rvx + rvy * rvy, pv = dx * rvx + dy * rvy;
        let tau = 0; if (v2 > 1e-9) { const D = pv * pv - v2 * (d2 - 4 * R * R); if (D >= 0) tau = Math.max(-h * 1.5, (-pv - Math.sqrt(D)) / v2); }
        if (tau < 0) { a.x += a.vx * tau; a.y += a.vy * tau; c.x += c.vx * tau; c.y += c.vy * tau; }
        let ex = c.x - a.x, ey = c.y - a.y, d = Math.hypot(ex, ey) || 1e-6; const nx = ex / d, ny = ey / d;
        const vn = (a.vx - c.vx) * nx + (a.vy - c.vy) * ny;
        if (vn > 0) { const j2 = vn * (1 + E_BOLA) / 2; a.vx -= j2 * nx; a.vy -= j2 * ny; c.vx += j2 * nx; c.vy += j2 * ny; }
        if (tau < 0) { a.x -= a.vx * tau; a.y -= a.vy * tau; c.x -= c.vx * tau; c.y -= c.vy * tau; }
        ex = c.x - a.x; ey = c.y - a.y; d = Math.hypot(ex, ey) || 1e-6;
        if (d < 2 * R) { const sobra = 2 * R - d; a.x -= ex / d * sobra / 2; a.y -= ey / d * sobra / 2; c.x += ex / d * sobra / 2; c.y += ey / d * sobra / 2; }
        if (vn <= 0) continue;
        if (ev) { if (ev.primeira == null && (a.id === 0 || c.id === 0)) ev.primeira = a.id === 0 ? c.id : a.id; ev.choques.push(vn); }
      }
    }
    // caçapas e tabelas
    for (let i = 0; i < n; i++) {
      const b = B[i]; if (b.fora) continue;
      let caiu = false;
      for (const p of CACAPAS) if ((b.x - p.x) * (b.x - p.x) + (b.y - p.y) * (b.y - p.y) < p.r * p.r) { caiu = true; break; }
      if (!caiu && (b.x < X0 - 7 || b.x > X1 + 7 || b.y < Y0 - 7 || b.y > Y1 + 7)) caiu = true;   // escapou pela boca: caiu
      if (caiu) { b.fora = true; b.vx = b.vy = 0; if (ev) ev.caiu.push(b.id); continue; }
      const boca = Math.abs(b.x - XM) < 7;
      if (b.x < X0 + R) { b.x = X0 + R; if (b.vx < 0) { b.vx = -b.vx * E_TABELA; b.vy *= 0.94; if (ev) ev.tabela.push(Math.abs(b.vx)); } }
      if (b.x > X1 - R) { b.x = X1 - R; if (b.vx > 0) { b.vx = -b.vx * E_TABELA; b.vy *= 0.94; if (ev) ev.tabela.push(Math.abs(b.vx)); } }
      if (!boca && b.y < Y0 + R) { b.y = Y0 + R; if (b.vy < 0) { b.vy = -b.vy * E_TABELA; b.vx *= 0.94; if (ev) ev.tabela.push(Math.abs(b.vy)); } }
      if (!boca && b.y > Y1 - R) { b.y = Y1 - R; if (b.vy > 0) { b.vy = -b.vy * E_TABELA; b.vx *= 0.94; if (ev) ev.tabela.push(Math.abs(b.vy)); } }
      // atrito do pano
      const sp = Math.hypot(b.vx, b.vy); if (!sp) continue;
      const ns = sp - (DEC + sp * KF) * h; if (ns < 2.5) { b.vx = b.vy = 0; } else { b.vx *= ns / sp; b.vy *= ns / sp; }
    }
  }
  const novoEv = () => ({ primeira: null, caiu: [], choques: [], tabela: [] });
  function simular(B0, ang, forca, h) {                                  // roda a tacada até tudo parar (para a IA)
    const B = clonar(B0), ev = novoEv(), c = B[0]; c.vx = Math.cos(ang) * forca * VMAX; c.vy = Math.sin(ang) * forca * VMAX;
    for (let k = 0; k < 4000 && !parado(B); k++) passo(B, h || 1 / 150, ev);
    return { B, ev };
  }

  // ------------------------------------------------------------------ REGRAS
  //   est: { B, grupo: [g0, g1] (null = mesa aberta), vez: 0 (jogador) | 1 (oponente), saida: true na 1.ª tacada }
  const restam = (B, g) => B.filter((b) => !b.fora && grupoDe(b.id) === g).length;
  function alvosDe(est, q) {
    const g = est.grupo[q];
    if (!g) return est.B.filter((b) => !b.fora && b.id !== 0 && b.id !== 8);
    if (!restam(est.B, g)) return est.B.filter((b) => !b.fora && b.id === 8);
    return est.B.filter((b) => !b.fora && grupoDe(b.id) === g);
  }
  // avalia a tacada que acabou: devolve { falta, motivo, continua, fim: null | 'vence' | 'perde', grupoNovo, oitoVolta }
  function avaliar(est, ev, antesB) {
    const q = est.vez, g = est.grupo[q], caiuBranca = ev.caiu.includes(0), caiuOito = ev.caiu.includes(8);
    const tinhaGrupo = !!g, limpo = tinhaGrupo && restam(antesB, g) === 0;   // antes da tacada: só faltava a 8
    let falta = false, motivo = '';
    if (caiuBranca) { falta = true; motivo = 'A branca caiu!'; }
    else if (ev.primeira == null) { falta = true; motivo = 'Não tocou em nenhuma bola.'; }
    else if (!est.saida) {
      const gp = grupoDe(ev.primeira);
      if (limpo) { if (ev.primeira !== 8) { falta = true; motivo = 'Tocou primeiro na bola errada.'; } }
      else if (gp === 'oito') { falta = true; motivo = 'Tocou primeiro na bola errada.'; }
      else if (tinhaGrupo && gp !== g) { falta = true; motivo = 'Tocou primeiro na bola errada.'; }
    }
    const r = { falta, motivo, continua: false, fim: null, grupoNovo: null, oitoVolta: false };
    if (caiuOito) {
      if (est.saida && !caiuBranca) { r.oitoVolta = true; }             // a 8 na saída: volta para o pé da mesa
      else { r.fim = limpo && !falta ? 'vence' : 'perde'; return r; }
    }
    const minhas = ev.caiu.filter((id) => id !== 0 && id !== 8);
    if (!tinhaGrupo && !falta && minhas.length) { r.grupoNovo = grupoDe(minhas[0]); }
    const gAgora = g || r.grupoNovo;
    if (!falta && minhas.some((id) => grupoDe(id) === gAgora)) r.continua = true;
    return r;
  }

  // ------------------------------------------------------------------ A IA
  function caminhoLivre(B, ax, ay, bx, by, ign, folga) {
    const dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy; if (L2 < 1e-6) return true;
    for (const b of B) {
      if (b.fora || ign.includes(b.id)) continue;
      const t = Math.max(0, Math.min(1, ((b.x - ax) * dx + (b.y - ay) * dy) / L2)), px = ax + dx * t - b.x, py = ay + dy * t - b.y;
      if (px * px + py * py < (2 * R - (folga || 0.2)) * (2 * R - (folga || 0.2))) return false;
    }
    return true;
  }
  // as jogadas possíveis (geometria): bola alvo → caçapa, com o ângulo de corte, a distância e um valor
  function jogadas(est, q) {
    const B = est.B, c = B[0], L = [];
    for (const b of alvosDe(est, q)) for (let k = 0; k < 6; k++) {
      const P = MIRA_C[k], dx = P.x - b.x, dy = P.y - b.y, d2 = Math.hypot(dx, dy); if (d2 < 1) continue;
      const ux = dx / d2, uy = dy / d2, gx = b.x - ux * 2 * R, gy = b.y - uy * 2 * R;
      const cx = gx - c.x, cy = gy - c.y, d1 = Math.hypot(cx, cy); if (d1 < 1) continue;
      const cos = (cx * ux + cy * uy) / d1; if (cos < 0.2) continue;                      // corte fino demais
      if (CACAPAS[k].meio && Math.abs(uy) < 0.55) continue;                                 // na caçapa do meio só entra de frente
      if (!caminhoLivre(B, c.x, c.y, gx, gy, [0, b.id])) continue;
      if (!caminhoLivre(B, b.x, b.y, P.x, P.y, [0, b.id])) continue;
      const valor = cos * cos / (1 + d1 / 260 + d2 / 200);
      const forca = Math.max(0.28, Math.min(0.95, 0.2 + (d1 + d2 * 1.6 / Math.max(0.35, cos)) / 520));
      L.push({ b: b.id, k, ang: Math.atan2(cy, cx), forca, valor, d1, d2, cos });
    }
    return L.sort((a, b) => b.valor - a.valor);
  }
  const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  function decidirIA(est, O) {
    const q = 1, B = est.B;
    if (est.saida) return { ang: Math.atan2(PE.y - B[0].y + gauss() * 1.5, PE.x - R * 2 - B[0].x), forca: 0.95 + Math.random() * 0.05 };
    let L = jogadas(est, q);
    if (O.burro && Math.random() < O.burro) L = L.sort(() => Math.random() - 0.5);       // o Zé às vezes nem pensa direito
    let melhor = null;
    const nSim = O.sim || 0;
    if (nSim) {
      for (const J of L.slice(0, nSim)) for (const fm of O.posicao ? [0.8, 1, 1.25] : [1]) {
        const f = Math.max(0.25, Math.min(1, J.forca * fm)), S = simular(B, J.ang, f), r = avaliar(est, S.ev, B);
        let v = r.fim === 'vence' ? 10 : r.fim === 'perde' ? -10 : r.falta ? -3 : r.continua ? 2 + J.valor : J.valor * 0.3;
        if (O.posicao && r.continua) { const prox = jogadas({ B: S.B, grupo: r.grupoNovo && !est.grupo[q] ? [r.grupoNovo === 'lisas' ? 'listradas' : 'lisas', r.grupoNovo] : est.grupo, vez: 1, saida: false }, 1); v += prox.length ? prox[0].valor * 1.5 : -0.4; }
        if (!melhor || v > melhor.v) melhor = { ang: J.ang, forca: f, v };
      }
    } else if (L.length) melhor = { ang: L[0].ang, forca: L[0].forca, v: 0 };
    if (!melhor || melhor.v < -2) {                                     // sem jogada boa: bate de leve na bola dele mais perto (defesa)
      const A = alvosDe(est, q).filter((b) => caminhoLivre(B, B[0].x, B[0].y, b.x, b.y, [0, b.id], 1.2)).sort((a, b) => Math.hypot(a.x - B[0].x, a.y - B[0].y) - Math.hypot(b.x - B[0].x, b.y - B[0].y))[0]
        || alvosDe(est, q)[0];
      melhor = A ? { ang: Math.atan2(A.y - B[0].y, A.x - B[0].x), forca: 0.45 } : { ang: Math.random() * 6.28, forca: 0.5 };
    }
    return { ang: melhor.ang + gauss() * O.erro * Math.PI / 180, forca: Math.max(0.2, Math.min(1, melhor.forca * (1 + gauss() * (O.erroF || 0.06)))) };
  }
  function posicaoLivre(B, x, y) {
    if (x < X0 + R || x > X1 - R || y < Y0 + R || y > Y1 - R) return false;
    return B.every((b) => b.fora || b.id === 0 || Math.hypot(b.x - x, b.y - y) > 2 * R + 0.5);
  }
  function maoIA(est, O) {                                               // bola na mão: testa lugares e fica com o que dá a melhor jogada
    const B = est.B, c = B[0]; let melhor = null;
    const tent = O.sim ? 40 : 8;
    for (let k = 0; k < tent; k++) {
      const x = X0 + R + Math.random() * (X1 - X0 - 2 * R), y = Y0 + R + Math.random() * (Y1 - Y0 - 2 * R); if (!posicaoLivre(B, x, y)) continue;
      c.x = x; c.y = y; c.fora = false; const L = jogadas(est, 1), v = L.length ? L[0].valor : -1;
      if (!melhor || v > melhor.v) melhor = { x, y, v };
    }
    if (!melhor) { melhor = { x: CABECA.x, y: CABECA.y }; }
    c.x = melhor.x; c.y = melhor.y; c.fora = false; c.vx = c.vy = 0;
  }

  // ------------------------------------------------------------------ PIXEL ART
  function spriteBola(id) {
    const cv = document.createElement('canvas'); cv.width = cv.height = 11; const g = cv.getContext('2d');
    const cor = corDe(id), listra = id > 8, esc = escurece(cor, 0.7), clara = escurece(cor, 1.3);
    for (let y = 0; y < 11; y++) for (let x = 0; x < 11; x++) {
      const dx = x - 5, dy = y - 5, d = Math.hypot(dx, dy); if (d > 4.85) continue;
      let c = listra ? (Math.abs(dy) <= 1.6 ? cor : '#f4f2ea') : cor;
      const borda = d > 3.9 && dx + dy > 1.5;
      if (borda) c = listra && Math.abs(dy) > 1.6 ? '#b8b4a8' : listra ? esc : esc;
      if (id === 0) c = borda ? '#c8c4b8' : '#f8f6ee';
      if (id === 8 && d < 1.7 && !borda) c = '#f4f2ea';
      if (id >= 1 && id <= 7 && d < 1.3) c = '#f4f2ea';
      g.fillStyle = c; g.fillRect(x, y, 1, 1);
    }
    g.fillStyle = 'rgba(255,255,255,0.9)'; g.fillRect(3, 3, 2, 1); g.fillRect(3, 4, 1, 1);   // o brilho
    if (id === 8) { g.fillStyle = '#1c1c1f'; g.fillRect(5, 5, 1, 1); }
    void clara; return cv;
  }
  function escurece(c, f) { const n = parseInt(c.slice(1), 16), q = (k) => Math.max(0, Math.min(255, Math.round(k * f))); return '#' + ((1 << 24) | (q((n >> 16) & 255) << 16) | (q((n >> 8) & 255) << 8) | q(n & 255)).toString(16).slice(1); }
  function hash(x, y, s) { let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 1442695041)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; }
  function fundoMesa() {
    const cv = document.createElement('canvas'); cv.width = CW; cv.height = CH; const g = cv.getContext('2d');
    const px = (x, y, c) => { g.fillStyle = c; g.fillRect(x, y, 1, 1); };
    // a madeira (veios) e a moldura
    for (let y = 0; y < CH; y++) for (let x = 0; x < CW; x++) {
      const veio = Math.sin(x * 0.09 + Math.sin(y * 0.35) * 1.6 + y * 0.02) + hash(x >> 1, y, 3) * 0.6;
      px(x, y, veio > 1.0 ? '#7a4a28' : veio > 0.2 ? '#64391e' : '#56301a');
    }
    g.fillStyle = '#2a1608'; g.fillRect(0, 0, CW, 1); g.fillRect(0, CH - 1, CW, 1); g.fillRect(0, 0, 1, CH); g.fillRect(CW - 1, 0, 1, CH);
    g.fillStyle = '#9a6a3a'; g.fillRect(1, 1, CW - 2, 1); g.fillRect(1, 1, 1, CH - 2);
    // a tabela de borracha verde-escura
    g.fillStyle = '#145234'; g.fillRect(X0 - 4, Y0 - 4, X1 - X0 + 8, Y1 - Y0 + 8);
    // o pano (com a textura)
    for (let y = Y0; y < Y1; y++) for (let x = X0; x < X1; x++) { const n = hash(x, y, 7); px(x, y, n > 0.93 ? '#26895a' : n < 0.07 ? '#1a6c43' : '#1f7a4d'); }
    // a luz da luminária (mais claro no meio)
    for (let y = Y0; y < Y1; y++) for (let x = X0; x < X1; x++) { const u = (x - XM) / (X1 - X0), v = (y - YM) / (Y1 - Y0); if (u * u * 1.6 + v * v * 2.6 < 0.09 && hash(x, y, 9) > 0.45) px(x, y, '#2a8f5c'); }
    // a sombra da tabela no pano (em cima e à esquerda)
    g.fillStyle = 'rgba(0,0,0,0.22)'; g.fillRect(X0, Y0, X1 - X0, 2); g.fillRect(X0, Y0, 2, Y1 - Y0);
    // a linha de saída e as marcas (cabeça e pé)
    g.fillStyle = 'rgba(255,255,255,0.13)'; for (let y = Y0 + 2; y < Y1 - 1; y += 3) g.fillRect(Math.round(CABECA.x), y, 1, 2);
    g.fillStyle = 'rgba(255,255,255,0.45)'; g.fillRect(Math.round(CABECA.x), Math.round(CABECA.y), 1, 1); g.fillRect(Math.round(PE.x), Math.round(PE.y), 1, 1);
    // os losangos de madrepérola na madeira
    for (let i = 1; i < 8; i++) { if (i === 4) continue; const x = Math.round(X0 + (X1 - X0) * i / 8); for (const y of [5, CH - 6]) { px(x, y, '#f2e6c8'); px(x - 1, y, '#c8b890'); px(x + 1, y, '#c8b890'); px(x, y - 1, '#c8b890'); px(x, y + 1, '#c8b890'); } }
    for (let i = 1; i < 4; i++) { const y = Math.round(Y0 + (Y1 - Y0) * i / 4); for (const x of [5, CW - 6]) { px(x, y, '#f2e6c8'); px(x - 1, y, '#c8b890'); px(x + 1, y, '#c8b890'); px(x, y - 1, '#c8b890'); px(x, y + 1, '#c8b890'); } }
    // as caçapas (a boca preta com a borda de metal)
    for (const p of CACAPAS) {
      const cx = p.meio ? p.x : p.x + (p.x < XM ? 2 : -2), cy = p.meio ? p.y + (p.y < YM ? 3 : -3) : p.y + (p.y < YM ? 2 : -2), r = p.meio ? 6.4 : 7.4;
      for (let y = Math.floor(cy - r - 2); y <= cy + r + 2; y++) for (let x = Math.floor(cx - r - 2); x <= cx + r + 2; x++) {
        const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
        if (d < r) px(x, y, d < r - 2 ? '#050505' : '#141414'); else if (d < r + 1.6) px(x, y, (x + y) % 3 ? '#8c9199' : '#c9ced4');
      }
    }
    return cv;
  }

  // ------------------------------------------------------------------ SOM (curtinho: choques, tabela, caçapa, a tacada)
  function sons(audio) {
    let ruido = null;
    const ok = () => audio && audio.ctx && audio.mestre;
    function chiado(t, dur, vol, freq, tipo, q) {
      const c = audio.ctx; if (!ruido || ruido.sampleRate !== c.sampleRate) { ruido = c.createBuffer(1, c.sampleRate * 0.5, c.sampleRate); const d = ruido.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
      const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s.buffer = ruido; f.type = tipo || 'bandpass'; f.frequency.value = freq; f.Q.value = q || 2;
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(f); f.connect(g); g.connect(audio.mestre); s.start(t, Math.random() * 0.3, dur + 0.02);
    }
    function tom(t, f0, f1, dur, vol, tipo) { const c = audio.ctx, o = c.createOscillator(), g = c.createGain(); o.type = tipo || 'sine'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(audio.mestre); o.start(t); o.stop(t + dur + 0.02); }
    return {
      choque(v) { if (!ok()) return; const t = audio.ctx.currentTime, k = Math.min(1, v / 300); chiado(t, 0.05, 0.05 + k * 0.25, 3200 + k * 1500, 'bandpass', 3); tom(t, 2600, 1900, 0.04, 0.03 * k, 'triangle'); },
      tabela(v) { if (!ok()) return; const t = audio.ctx.currentTime, k = Math.min(1, v / 300); chiado(t, 0.08, 0.04 + k * 0.12, 500, 'lowpass', 1); },
      cacapa() { if (!ok()) return; const t = audio.ctx.currentTime; tom(t, 180, 70, 0.18, 0.22, 'sine'); for (let i = 0; i < 4; i++) chiado(t + 0.08 + i * 0.06, 0.05, 0.06, 1400 - i * 200, 'bandpass', 4); },
      tacada(f) { if (!ok()) return; const t = audio.ctx.currentTime; chiado(t, 0.05, 0.12 + f * 0.25, 2400, 'bandpass', 2); tom(t, 900, 500, 0.05, 0.05, 'triangle'); },
      fim(v) { if (!ok()) return; const t = audio.ctx.currentTime, N = v ? [72, 76, 79, 84] : [67, 63, 60]; N.forEach((m, i) => tom(t + i * 0.14, 440 * Math.pow(2, (m - 69) / 12), 440 * Math.pow(2, (m - 69) / 12) * 0.99, 0.26, 0.08, 'square')); },
    };
  }

  // ================================================================== O JOGO (a tela por cima de tudo)
  //   op = { oponente: { nome, erro (graus), erroF, sim, posicao, burro, estrelas, quips: { acerta: [], erra: [], ganha: [], perde: [] } },
  //          aposta (0 = diversão), nomeJog, audio }
  function jogar(op) {
    return new Promise((resolve) => {
      const O = op.oponente || { nome: '?', erro: 3, sim: 2 }, SOM = sons(op.audio), nomeJ = op.nomeJog || tr('Você');
      const est = { B: novasBolas(), grupo: [null, null], vez: 0, saida: true };
      const spr = {}; for (let i = 0; i <= 15; i++) spr[i] = spriteBola(i);
      const fundo = fundoMesa();
      // ---- a tela
      const el = document.createElement('div'); el.id = 'sinucaJogo';
      el.style.cssText = 'position:fixed;inset:0;z-index:30;background:radial-gradient(circle at 50% 40%,#2a1c14,#0a0604 75%);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:8px;box-sizing:border-box;font-family:var(--font-body);color:#f4ead8;touch-action:none;user-select:none;-webkit-user-select:none;';
      const topo = document.createElement('div'); topo.style.cssText = 'width:min(100%,920px);display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:8px;';
      const lado = (dir) => { const d = document.createElement('div'); d.style.cssText = 'display:flex;flex-direction:column;gap:3px;align-items:' + (dir ? 'flex-end' : 'flex-start') + ';min-width:0;'; const n = document.createElement('div'); n.style.cssText = 'font:700 13px/1.1 var(--font-display);letter-spacing:.04em;padding:3px 6px;border:2px solid #5b3a22;background:#2a1a10;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;'; const b = document.createElement('div'); b.style.cssText = 'display:flex;gap:2px;min-height:18px;flex-wrap:wrap;'; d.append(n, b); return { d, n, b }; };
      const LJ = lado(false), LO = lado(true);
      const meio = document.createElement('div'); meio.style.cssText = 'text-align:center;font:700 11px/1.2 var(--font-display);color:#f2c230;letter-spacing:.06em;';
      meio.textContent = op.aposta ? trf('Valendo {0} fakes', op.aposta) : tr('Só por diversão');
      topo.append(LJ.d, meio, LO.d);
      const cv = document.createElement('canvas'); cv.width = CW; cv.height = CH; const g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
      cv.style.cssText = 'image-rendering:pixelated;image-rendering:crisp-edges;border:3px solid #1a0e06;box-shadow:0 6px 0 #000a;max-width:100%;cursor:crosshair;touch-action:none;';
      const msg = document.createElement('div'); msg.style.cssText = 'min-height:18px;font:700 13px/1.2 var(--font-display);text-align:center;letter-spacing:.03em;color:#fff6d8;text-shadow:0 2px 0 #000;max-width:min(100%,920px);';
      const barra = document.createElement('div'); barra.style.cssText = 'width:min(320px,80%);height:12px;border:2px solid #1a0e06;background:#2a1a10;position:relative;';
      const forcaEl = document.createElement('div'); forcaEl.style.cssText = 'position:absolute;left:0;top:0;bottom:0;width:0;background:linear-gradient(90deg,#6cae3e,#f2c230 60%,#d8302a);'; barra.appendChild(forcaEl);
      const ctl = document.createElement('div'); ctl.style.cssText = 'display:flex;gap:8px;align-items:center;justify-content:center;flex-wrap:wrap;';
      const botao = (txt, w) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'pxBtn'; b.textContent = txt; b.style.cssText = '--p:var(--p2,2px);height:44px;width:auto;flex:0 0 auto;min-width:' + (w || 52) + 'px;padding:0 12px;font-size:14px;touch-action:none;'; return b; };
      const bE = botao('◀'), bTacar = botao(tr('TACAR'), 130), bD = botao('▶'), bOk = botao(tr('Confirmar a branca'), 150), bSair = botao(tr('Desistir'), 90);
      bSair.style.fontSize = '11px'; bSair.style.marginLeft = '14px'; bOk.hidden = true;
      ctl.append(bE, bTacar, bOk, bD);
      ctl.append(bSair);
      el.append(topo, cv, msg, barra, ctl);
      (document.getElementById('raizJogo') || document.body).appendChild(el);
      function ajustar() {                                              // a mesa ocupa o máximo da tela (pixels inteiros quando dá)
        const wMax = Math.min(window.innerWidth - 20, 1100), hMax = window.innerHeight - 150;
        let k = Math.min(wMax / CW, hMax / CH); if (k >= 2) k = Math.floor(k); k = Math.max(1, k);
        cv.style.width = Math.round(CW * k) + 'px'; cv.style.height = Math.round(CH * k) + 'px';
      }
      ajustar(); window.addEventListener('resize', ajustar);
      // ---- o placar (as bolas de cada um)
      function iconeBola(id, apagada) { const c = document.createElement('canvas'); c.width = c.height = 11; c.getContext('2d').drawImage(spr[id], 0, 0); c.style.cssText = 'width:16px;height:16px;image-rendering:pixelated;opacity:' + (apagada ? 0.22 : 1); return c; }
      function placar() {
        for (const [L, q, nome] of [[LJ, 0, nomeJ], [LO, 1, O.nome]]) {
          const gq = est.grupo[q], vez = est.vez === q && !fim;
          L.n.textContent = (vez ? '▶ ' : '') + nome + (gq ? ' · ' + tr(gq === 'lisas' ? 'Lisas' : 'Listradas') : '');
          L.n.style.borderColor = vez ? '#f2c230' : '#5b3a22'; L.n.style.color = vez ? '#fff6d8' : '#c8b898';
          L.b.innerHTML = '';
          if (gq) { const ids = gq === 'lisas' ? [1, 2, 3, 4, 5, 6, 7] : [9, 10, 11, 12, 13, 14, 15]; for (const id of ids) L.b.appendChild(iconeBola(id, est.B.find((b) => b.id === id).fora)); L.b.appendChild(iconeBola(8, !restam(est.B, gq) ? false : true)); }
          else if (q === 1 && O.estrelas) { const s = document.createElement('span'); s.style.cssText = 'font:700 11px/1 var(--font-display);color:#f2c230;'; s.textContent = tr('Habilidade') + ' ' + '★'.repeat(O.estrelas) + '☆'.repeat(5 - O.estrelas); L.b.appendChild(s); }
        }
      }
      // ---- o estado da tela
      let fase = 'intro', ang = 0, forca = 0, carregando = false, tCarga = 0, fim = null, ev = null, antesB = null, rafId = 0, tUlt = 0, mao = false, iaT = 0, iaPlano = null, quipT = 0, tPuxa = 0;
      let angIA = 0;
      const fala = (t, dur) => { msg.textContent = t; msg.dataset.t = String(performance.now() + (dur || 2600)); };
      const quip = (tipo) => { const L = O.quips && O.quips[tipo]; if (L && L.length && Math.random() < 0.7) { quipT = performance.now() + 2600; fala(O.nome + ': ' + tr(L[Math.floor(Math.random() * L.length)]), 2600); return true; } return false; };
      function mirarPara(x, y) { const c = est.B[0]; ang = Math.atan2(y - c.y, x - c.x); }
      function ptMesa(e) { const r = cv.getBoundingClientRect(), t = e.touches ? e.touches[0] : e; return { x: (t.clientX - r.left) / r.width * CW, y: (t.clientY - r.top) / r.height * CH }; }
      function minhaVez() { return est.vez === 0 && !fim; }
      // ---- entrada
      const onMove = (e) => {
        if (!minhaVez()) return; const p = ptMesa(e);
        if (fase === 'mao') { e.preventDefault && e.preventDefault(); colocarBranca(p); return; }
        if (fase === 'mirar' && !carregando) mirarPara(p.x, p.y);
      };
      const onDown = (e) => { if (!minhaVez()) return; arrastando = true; onMove(e); };
      let arrastando = false;
      cv.addEventListener('pointerdown', (e) => { cv.setPointerCapture && cv.setPointerCapture(e.pointerId); onDown(e); });
      cv.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse' || arrastando) onMove(e); });
      cv.addEventListener('pointerup', () => { arrastando = false; });
      function colocarBranca(p) { const x = Math.max(X0 + R, Math.min(X1 - R, p.x)), y = Math.max(Y0 + R, Math.min(Y1 - R, p.y)); if (posicaoLivre(est.B, x, y)) { const c = est.B[0]; c.x = x; c.y = y; c.fora = false; } }
      const girar = (d) => { if (fase === 'mirar' && minhaVez() && !carregando) ang += d; };
      let girando = 0, tGiro = 0;
      for (const [b, s] of [[bE, -1], [bD, 1]]) {
        b.addEventListener('pointerdown', (e) => { e.preventDefault(); girando = s; tGiro = 0; girar(s * 0.004); });
        for (const ev2 of ['pointerup', 'pointerleave', 'pointercancel']) b.addEventListener(ev2, () => { girando = 0; });
      }
      function comecarCarga() { if (fase !== 'mirar' || !minhaVez() || carregando) return; carregando = true; tCarga = 0; }
      function soltarCarga() { if (!carregando) return; carregando = false; if (forca < 0.03) { forca = 0; return; } tacar(ang, forca); }
      bTacar.addEventListener('pointerdown', (e) => { e.preventDefault(); comecarCarga(); });
      bTacar.addEventListener('pointerup', (e) => { e.preventDefault(); soltarCarga(); });
      bTacar.addEventListener('pointerleave', () => soltarCarga());
      bOk.addEventListener('click', () => { if (fase === 'mao' && minhaVez()) { fase = 'mirar'; bOk.hidden = true; bTacar.hidden = false; bE.hidden = bD.hidden = false; fala(tr('Sua vez')); } });
      bSair.addEventListener('click', async () => {
        if (fim) return;
        const ok = typeof Escolha !== 'undefined' ? (await Escolha.mostrar(tr('Desistir da partida? Conta como derrota.'), [tr('Não'), tr('Sim')])) === 1 : true;
        if (ok && !fim) terminar(false, true);
      });
      const teclas = (e) => {
        if (fase === 'intro' || fase === 'resultado') return;
        if (e.code === 'Space') { e.preventDefault(); if (e.type === 'keydown') { if (!e.repeat) { if (fase === 'mao') bOk.click(); else comecarCarga(); } } else soltarCarga(); }
        else if (e.type === 'keydown' && (e.code === 'ArrowLeft' || e.code === 'ArrowRight')) { e.preventDefault(); girar((e.code === 'ArrowLeft' ? -1 : 1) * (e.shiftKey ? 0.03 : 0.0045)); }
        else if (e.type === 'keydown' && e.code === 'Escape') { e.preventDefault(); e.stopPropagation(); }
      };
      window.addEventListener('keydown', teclas, true); window.addEventListener('keyup', teclas, true);
      // ---- a tacada
      function tacar(a, f) {
        antesB = clonar(est.B); ev = novoEv(); const c = est.B[0];
        c.vx = Math.cos(a) * f * VMAX; c.vy = Math.sin(a) * f * VMAX; SOM.tacada(f);
        fase = 'rolando'; forca = 0; forcaEl.style.width = '0'; bTacar.hidden = false; nSom = 0;
      }
      let nSom = 0;
      function depoisDaTacada() {
        const quem = est.vez, r = avaliar(est, ev, antesB), nomeQ = quem === 0 ? nomeJ : O.nome;
        est.saida = false;
        if (r.fim) { terminar(r.fim === 'vence' ? quem === 0 : quem !== 0, false, r); return; }
        if (r.oitoVolta) { const o = est.B.find((b) => b.id === 8); o.fora = false; o.x = PE.x; o.y = PE.y; while (!posicaoLivre(est.B, o.x, o.y) && o.x < X1 - R) o.x += 1; fala(tr('A 8 voltou para a mesa.')); }
        if (r.grupoNovo) { est.grupo[quem] = r.grupoNovo; est.grupo[1 - quem] = r.grupoNovo === 'lisas' ? 'listradas' : 'lisas'; if (est.grupo[0]) fala(tr(est.grupo[0] === 'lisas' ? 'Você ficou com as lisas.' : 'Você ficou com as listradas.')); }
        if (r.falta) {
          est.vez = 1 - quem; const c = est.B[0]; c.vx = c.vy = 0;
          if (c.fora) { c.fora = false; c.x = CABECA.x; c.y = CABECA.y; while (!posicaoLivre(est.B, c.x, c.y)) c.x -= 2; }
          fala(tr(r.motivo) + ' ' + (est.vez === 0 ? tr('Falta! Bola na mão para você.') : trf('Falta! Bola na mão para {0}.', O.nome)), 3200);
          if (quem === 1) quip('erra');
          mao = true;
        } else if (r.continua) {
          if (!r.grupoNovo) fala(quem === 0 ? tr('Encaçapou! Joga de novo.') : trf('Vez de {0}', nomeQ));
          if (quem === 1) quip('acerta');
          if (est.grupo[quem] && !restam(est.B, est.grupo[quem])) fala(tr('Agora é a 8!'));
        } else { est.vez = 1 - quem; if (quem === 1) { if (!quip('erra')) fala(tr('Sua vez')); } else fala(trf('Vez de {0}', O.nome)); }
        proximaVez();
      }
      function proximaVez() {
        placar();
        if (est.vez === 0) {
          if (mao) { fase = 'mao'; bOk.hidden = false; bTacar.hidden = true; bE.hidden = bD.hidden = true; if (performance.now() > +(msg.dataset.t || 0)) fala(tr('Bola na mão: toque na mesa para pôr a branca.')); mao = false; }
          else { fase = 'mirar'; bOk.hidden = true; bTacar.hidden = false; bE.hidden = bD.hidden = false; if (performance.now() > +(msg.dataset.t || 0)) fala(tr('Sua vez')); }
          const L = jogadas(est, 0); if (L.length && !est.saida) ang = L[0].ang;   // a mira começa numa jogada boa (como quem olha a mesa)
        } else {
          fase = 'ia'; iaT = 0; bOk.hidden = true; bTacar.hidden = false; bE.hidden = bD.hidden = false;
          if (mao) { maoIA(est, O); mao = false; }
          iaPlano = decidirIA(est, O); angIA = ang;
          if (performance.now() > +(msg.dataset.t || 0)) fala(trf('Vez de {0}', O.nome) + ' · ' + tr('pensando...'));
        }
      }
      function terminar(venceu, desistiu, r) {
        if (fim) return; fim = { venceu, desistiu }; fase = 'resultado'; SOM.fim(venceu); placar();
        if (!desistiu) quip(venceu ? 'perde' : 'ganha');
        setTimeout(() => cartaz(venceu ? tr('Você venceu!') : tr('Você perdeu...'), venceu ? (r && r.fim === 'perde' ? tr('A 8 caiu antes da hora!') : '') : (r && r.fim === 'perde' && est.vez === 0 ? tr('A 8 caiu antes da hora!') : trf('{0} venceu.', O.nome)), tr('Continuar'), () => sair()), desistiu ? 0 : 1400);
      }
      function sair() {
        cancelAnimationFrame(rafId); window.removeEventListener('keydown', teclas, true); window.removeEventListener('keyup', teclas, true); window.removeEventListener('resize', ajustar);
        el.remove(); resolve({ venceu: !!(fim && fim.venceu), desistiu: !!(fim && fim.desistiu) });
      }
      // o cartaz no meio (o começo e o fim)
      function cartaz(tit, sub, txtBotao, fn) {
        const k = document.createElement('div'); k.style.cssText = 'position:absolute;inset:0;display:grid;place-items:center;background:rgba(0,0,0,.55);z-index:2;';
        const c = document.createElement('div'); c.style.cssText = 'background:#2a1a10;border:4px solid #c8952a;padding:14px 18px;display:flex;flex-direction:column;gap:9px;align-items:center;max-width:min(420px,90%);text-align:center;box-shadow:0 6px 0 #000a;';
        const h = document.createElement('div'); h.style.cssText = 'font:700 20px/1.15 var(--font-display);color:#f2c230;letter-spacing:.05em;'; h.textContent = tit;
        const s = document.createElement('div'); s.style.cssText = 'font:600 13px/1.4 var(--font-body);color:#f4ead8;white-space:pre-line;'; s.textContent = sub || '';
        const b = botao(txtBotao, 140); b.addEventListener('click', () => { k.remove(); fn(); });
        c.append(h, s, b); k.appendChild(c); el.appendChild(k);
      }
      // ---- o desenho
      function desenhar() {
        g.drawImage(fundo, 0, 0);
        // as sombras e as bolas
        for (const b of est.B) if (!b.fora) { g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(Math.round(b.x) - 3, Math.round(b.y) - 2, 8, 8); }
        for (const b of est.B) if (!b.fora) g.drawImage(spr[b.id], Math.round(b.x) - 5, Math.round(b.y) - 5);
        // a mira (só na vez do jogador) e o taco
        const c = est.B[0], mirando = (fase === 'mirar' && est.vez === 0) || (fase === 'ia' && iaT > 0.25);
        if (mirando && !c.fora) {
          const a = fase === 'ia' ? angIA : ang, ux = Math.cos(a), uy = Math.sin(a);
          if (fase === 'mirar') {                                     // a linha pontilhada até a 1.ª bola (a "bola fantasma") e para onde ela vai
            const h = primeiroToque(c.x, c.y, ux, uy);
            const L = h ? h.t : 340;
            for (let s = 7; s < L; s += 4) { const x = Math.round(c.x + ux * s), y = Math.round(c.y + uy * s); if (x > X0 && x < X1 && y > Y0 && y < Y1) { g.fillStyle = 'rgba(255,255,255,0.55)'; g.fillRect(x, y, 1, 1); } }
            if (h) {
              const gx = c.x + ux * h.t, gy = c.y + uy * h.t;
              g.strokeStyle = 'rgba(255,255,255,0.6)'; g.lineWidth = 1; g.beginPath(); g.arc(Math.round(gx) + 0.5, Math.round(gy) + 0.5, R, 0, Math.PI * 2); g.stroke();
              if (h.b) { const nx = h.b.x - gx, ny = h.b.y - gy, d = Math.hypot(nx, ny) || 1; for (let s = 6; s < 26; s += 3) { g.fillStyle = 'rgba(242,194,48,0.85)'; g.fillRect(Math.round(h.b.x + nx / d * s), Math.round(h.b.y + ny / d * s), 1, 1); } }
            }
          }
          // o taco (puxado para trás pela força)
          const puxa = 8 + (fase === 'ia' ? tPuxa : forca) * 22, comp = 120;
          for (let s = 0; s < comp; s += 0.7) {
            const x = Math.round(c.x - ux * (puxa + s)), y = Math.round(c.y - uy * (puxa + s));
            const cor = s < 2 ? '#3a64b8' : s < 5 ? '#f4f2ea' : s < 78 ? (s % 9 < 1 ? '#c8a070' : '#e8c890') : s < 82 ? '#c8952a' : '#5b3a22';
            g.fillStyle = cor; g.fillRect(x, y, s < 78 ? 1 : 2, s < 78 ? 1 : 2);
          }
        }
        if (fase === 'mao' && est.vez === 0) { g.strokeStyle = 'rgba(242,194,48,0.9)'; g.beginPath(); g.arc(Math.round(c.x) + 0.5, Math.round(c.y) + 0.5, R + 2.5, 0, Math.PI * 2); g.stroke(); }
      }
      // o 1.º toque da branca andando em linha reta (para a mira): t = distância percorrida; b = a bola (ou null = tabela)
      function primeiroToque(x, y, ux, uy) {
        let melhor = null;
        for (const b of est.B) {
          if (b.fora || b.id === 0) continue;
          const ox = b.x - x, oy = b.y - y, p = ox * ux + oy * uy; if (p <= 0) continue;
          const perp2 = ox * ox + oy * oy - p * p, r2 = 4 * R * R; if (perp2 > r2) continue;
          const t = p - Math.sqrt(r2 - perp2); if (!melhor || t < melhor.t) melhor = { t, b };
        }
        if (melhor) return melhor;
        const tx = ux > 0 ? (X1 - R - x) / ux : ux < 0 ? (X0 + R - x) / ux : 1e9, ty = uy > 0 ? (Y1 - R - y) / uy : uy < 0 ? (Y0 + R - y) / uy : 1e9;
        return { t: Math.min(tx, ty), b: null };
      }
      // ---- o laço
      function quadro(ts) {
        rafId = requestAnimationFrame(quadro);
        const dt = Math.min(0.05, tUlt ? (ts - tUlt) / 1000 : 0.016); tUlt = ts;
        if (op.manter) try { op.manter(); } catch (e) { /* nada */ }
        if (girando) { tGiro += dt; if (tGiro > 0.25) girar(girando * dt * (tGiro > 1 ? 0.35 : 0.08)); }
        if (carregando) { tCarga += dt; forca = 0.5 - 0.5 * Math.cos(tCarga * Math.PI / 0.85); forcaEl.style.width = (forca * 100).toFixed(1) + '%'; }
        if (fase === 'rolando') {
          for (let k = 0; k < 4; k++) passo(est.B, dt / 4, ev);
          if (nSom < ev.choques.length + ev.tabela.length + ev.caiu.length) {
            const nc = ev.choques.length, nt = ev.tabela.length;
            if (ev.som1 !== nc && nc) { SOM.choque(ev.choques[nc - 1]); ev.som1 = nc; }
            if (ev.som2 !== nt && nt) { SOM.tabela(ev.tabela[nt - 1]); ev.som2 = nt; }
            if (ev.som3 !== ev.caiu.length && ev.caiu.length) { SOM.cacapa(); ev.som3 = ev.caiu.length; placar(); }
            nSom = ev.choques.length + ev.tabela.length + ev.caiu.length;
          }
          if (parado(est.B)) depoisDaTacada();
        } else if (fase === 'ia') {
          iaT += dt;
          const alvo = iaPlano.ang, d = ((alvo - angIA + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
          if (iaT > 0.25) angIA += d * Math.min(1, dt * 3.2);
          const tPensa = 1.1 + (O.sim ? 0.4 : 0);
          if (iaT > tPensa) tPuxa = Math.min(iaPlano.forca, (iaT - tPensa) / 0.55 * iaPlano.forca);
          if (iaT > tPensa + 0.75) { tPuxa = 0; ang = angIA = iaPlano.ang; tacar(iaPlano.ang, iaPlano.forca); }
        }
        if (msg.dataset.t && performance.now() > +msg.dataset.t + 400 && fase !== 'resultado') { msg.dataset.t = ''; if (fase === 'mirar' && est.vez === 0) msg.textContent = tr('Sua vez'); }
        desenhar();
      }
      placar(); desenhar();
      cartaz(O.nome, (O.estrelas ? tr('Habilidade') + ' ' + '★'.repeat(O.estrelas) + '☆'.repeat(5 - O.estrelas) + '\n' : '') + (op.aposta ? trf('Valendo {0} fakes', op.aposta) : tr('Só por diversão')) + '\n' + tr('Você sai jogando.') + '\n\n' + tr('Mire arrastando na mesa. Segure TACAR e solte na força certa.'), tr('Começar'), () => { fase = 'mirar'; ang = 0; fala(tr('Sua vez')); placar(); });
      rafId = requestAnimationFrame(quadro);
      if (typeof window !== 'undefined') window.__sinucaJogo = { est, terminar, tacar: (a, f) => tacar(a, f), get fase() { return fase; }, O };
    });
  }

  if (typeof I18N !== 'undefined') for (const k of Object.keys(TRAD)) if (!I18N[k]) I18N[k] = TRAD[k];
  const dados = { jogar, simular, avaliar, jogadas, decidirIA, novasBolas, maoIA, constantes: { X0, X1, Y0, Y1, R, CACAPAS } };
  if (typeof window !== 'undefined') window.__sinuca = dados;
  window.FutebolJS.registrarFase({ id: 'sinuca', nome: 'Sinuca', nucleoMinimo: '7.1', iniciar: async () => {}, criar: () => dados, dados });
})();
