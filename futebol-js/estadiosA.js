/* =====================================================================================================================
   estadiosA.js — OS 20 ESTÁDIOS DA SÉRIE A (o jogo baixa na abertura, como o cosmeticos.js).
   - O campo da partida é o CAMPOS.serieA do jogo.js (estadio: 'arenaA', 105 x 68) com campo.modelo = uma das chaves de MODELOS.
     Sem modelo (ou com um que não existe), o modelo sai do nome do mandante (o mesmo time cai sempre no mesmo estádio).
     Sem este arquivo, a partida usa o estádio oficial de sempre.
   - Cada modelo é inspirado num estádio de verdade, mas é outro (nome próprio e desenho próprio):
       anel ....... Estádio do Anel: o bowl oval de dois anéis com a cobertura em anel por cima (lembra o Maracanã)
       caldeirao .. Arena Caldeirão: retangular, colada no campo, camarotes entre os anéis e o teto escuro de treliça (Nubank Parque)
       fachada .... Arena da Fachada: quatro arquibancadas soltas, a oeste alta com o prédio de vidro, as cabeceiras sem cobertura (Neo Química)
       listras .... Arena das Listras: cadeiras listradas nas duas cores do time, cabeceira gigante e teto translúcido (Arena MRV)
       floresta ... Arena da Floresta: bowl redondo com a treliça branca de cesto por fora e as cadeiras em degradê (Arena da Amazônia)
       petalas .... Estádio das Pétalas: a cobertura em pétalas brancas soltas e o rio do lado de fora (Beira-Rio)
       ferradura .. Arena da Ferradura: o bowl aberto numa cabeceira, com o lago e a cidade aparecendo no vão (Fonte Nova)
       concha ..... Estádio da Concha: a concha de concreto gigante de dois anéis, sem teto, com as torres de luz (Morumbis)
     (7.4.0) e mais doze:
       lagoa ...... Estádio da Lagoa: o oval com os pórticos de concreto por fora e a lagoa do lado (Mineirão)
       humaita .... Arena do Humaitá: a avalanche atrás do gol e a fachada em faixas (Arena do Grêmio)
       vila ....... Estádio da Vila: pequeno, colado no gramado, a social de arcos e as casas atrás (Vila Belmiro)
       arcos ...... Estádio dos Arcos: os quatro arcos amarelos por cima da cobertura (Nilton Santos)
       caipira, taboao, oeste ... os estádios do interior (tribuna coberta, geral pintada, torres de luz de treliça)
       colinaE .... Estádio da Colina: a ferradura antiga, a fachada histórica e o morro no vão (São Januário)
       toca ....... Estádio da Toca: o caldeirão enterrado no barranco, no meio da mata (Barradão)
       alto ....... Estádio do Alto: a marquise pesada de concreto e as cabeceiras altas (Couto Pereira)
       baixada .... Arena do Furacão: a caixa fechada com o teto retrátil aberto (Arena da Baixada)
       mangueiral . Estádio do Mangueiral: o oval de concreto, as rampas em espiral e as mangueiras (Mangueirão)
   - (7.4.0) O ENTORNO: em volta de todos, a cidade (esplanada, avenida, calçadas, postes, carros, quarteirões, praças) até onde a
     névoa deixa ver. OS FOGOS e A CENA DE FORA (EstadiosA.fogos / EstadiosA.cena) para os jogos grandes (cfg.fogos).
   - O ESCUDO DO MANDANTE aparece em vários lugares: na faixa da frente dos anéis, nos telões, nas bandeiras e, em alguns modelos,
     montado nas próprias cadeiras (mosaico). As cores das cadeiras saem do uniforme do mandante.
   - DESEMPENHO: tudo em poucos lotes (cores, faixas com textura, telões, luzes) e a torcida numa malha só (a do jogo.js).
   ===================================================================================================================== */
(() => {
  'use strict';
  const GRAU = 180 / Math.PI;

  // ============================================================================================ CORES
  const num = (h) => (typeof h === 'number' ? h : parseInt(String(h || '#888888').slice(1), 16));
  const rgb = (c) => [(c >> 16) & 255, (c >> 8) & 255, c & 255];
  const deRgb = (r, g, b) => (Math.round(Math.max(0, Math.min(255, r))) << 16) | (Math.round(Math.max(0, Math.min(255, g))) << 8) | Math.round(Math.max(0, Math.min(255, b)));
  const mistura = (a, b, t) => { const A = rgb(num(a)), B = rgb(num(b)); return deRgb(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t); };
  const tom = (c, k) => (k >= 1 ? mistura(c, 0xffffff, k - 1) : mistura(c, 0x000000, 1 - k));   // k < 1 escurece, k > 1 clareia
  const css = (c) => '#' + num(c).toString(16).padStart(6, '0');
  const luma = (c) => { const [r, g, b] = rgb(num(c)); return 0.299 * r + 0.587 * g + 0.114 * b; };
  const dist = (a, b) => { const A = rgb(num(a)), B = rgb(num(b)); return Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]); };

  // número "aleatório" fixo por posição (o mesmo estádio sai sempre igual)
  const hash = (a, b, c) => { let h = Math.imul((a | 0) ^ 0x9e3779b1, 0x85ebca6b) ^ Math.imul((b | 0) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul((c | 0) + 0x165667b1, 0x27d4eb2f); h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; return (h >>> 0) / 4294967296; };
  let semente = 1;
  const rnd = () => { semente = (Math.imul(semente, 1664525) + 1013904223) >>> 0; return semente / 4294967296; };

  // ============================================================================================ GEOMETRIA
  // Os lotes do jogo.js (Lote) com faces livres: quad(a, b, c, d) com os 4 cantos em volta da face (qualquer sentido) e um ponto
  // "de dentro" (o lado de onde a face NÃO aparece), para a frente da face sair sempre para fora.
  function face(L, a, b, c, d, dentro, cor, uv) {
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = d[0] - a[0], vy = d[1] - a[1], vz = d[2] - a[2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const cx = (a[0] + b[0] + c[0] + d[0]) / 4, cy = (a[1] + b[1] + c[1] + d[1]) / 4, cz = (a[2] + b[2] + c[2] + d[2]) / 4;
    if (dentro && nx * (cx - dentro[0]) + ny * (cy - dentro[1]) + nz * (cz - dentro[2]) < 0) { const t = b; b = d; d = t; nx = -nx; ny = -ny; nz = -nz; if (uv) uv = [uv[0], uv[3], uv[2], uv[1]]; }
    const l = Math.hypot(nx, ny, nz); if (l < 1e-9) return;
    nx /= l; ny /= l; nz /= l;
    const base = L.pos.length / 3, [r, g, bb] = cor == null ? [255, 255, 255] : rgb(cor);
    const P = [a, b, c, d], U = uv || [[0, 0], [1, 0], [1, 1], [0, 1]];
    for (let i = 0; i < 4; i++) { L.pos.push(P[i][0], P[i][1], P[i][2]); L.nor.push(nx, ny, nz); L.uv.push(U[i][0], U[i][1]); L.cor.push(r / 255, g / 255, bb / 255); }
    L.idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
  // Hexaedro de 8 cantos P[k], k = x + 2y + 4z (x: começo/fim, y: baixo/cima, z: dentro/fora). sem: faces que não precisa desenhar
  //   ('x0' 'x1' 'y0' 'y1' 'z0' 'z1'). cores: uma cor ou { y1: cor, z0: cor, ... } por face.
  const FACES_H = { x0: [0, 2, 6, 4], x1: [1, 3, 7, 5], y0: [0, 1, 5, 4], y1: [2, 3, 7, 6], z0: [0, 1, 3, 2], z1: [4, 5, 7, 6] };
  function hexa(L, P, cor, sem) {
    let cx = 0, cy = 0, cz = 0; for (const p of P) { cx += p[0]; cy += p[1]; cz += p[2]; }
    const c = [cx / 8, cy / 8, cz / 8];
    for (const f in FACES_H) {
      if (sem && sem.includes(f)) continue;
      const q = FACES_H[f], k = typeof cor === 'object' ? (cor[f] != null ? cor[f] : cor.todo) : cor;
      face(L, P[q[0]], P[q[1]], P[q[2]], P[q[3]], c, k);
    }
  }
  // caixa comum alinhada (centro, tamanho) e caixa girada no eixo Y (ang em radianos)
  function caixa(L, x, y, z, w, h, d, cor, ang, sem) {
    const ca = Math.cos(ang || 0), sa = Math.sin(ang || 0), P = [];
    for (let k = 0; k < 8; k++) {
      const lx = (k & 1 ? 0.5 : -0.5) * w, ly = (k & 2 ? 0.5 : -0.5) * h, lz = (k & 4 ? 0.5 : -0.5) * d;
      P.push([x + lx * ca - lz * sa, y + ly, z + lx * sa + lz * ca]);
    }
    hexa(L, P, cor, sem);
  }

  // ============================================================================================ O CAMINHO (retângulo arredondado)
  //   O contorno de um anel: lados retos e cantos em arco. Cada nó tem o centro do arco (cx, cz) e a normal (nx, nz) para fora;
  //   o ponto a uma distância o do contorno-base é centro + normal x (raio + o). Assim todas as fileiras usam os mesmos nós
  //   (os degraus encaixam sem buraco nos cantos). Sentido: lado z+ indo para x+, depois x+ indo para z-, e assim por diante.
  function caminho(ax, az, rb, op) {
    op = op || {};
    const nArc = op.nArc || 8, passo = op.passo || 4, N = [];
    rb = Math.max(0.01, Math.min(rb, ax - 0.01, az - 0.01));
    const cantos = [[1, 1, 90, 0], [1, -1, 0, -90], [-1, -1, -90, -180], [-1, 1, 180, 90]];
    const lados = ['x+', 'z-', 'x-', 'z+'];
    for (let c = 0; c < 4; c++) {
      const [sx, sz, a0, a1] = cantos[c], cx = sx * (ax - rb), cz = sz * (az - rb);
      for (let i = 0; i <= nArc; i++) { const a = (a0 + (a1 - a0) * i / nArc) / GRAU; N.push({ cx, cz, nx: Math.cos(a), nz: Math.sin(a), canto: c, lado: i === nArc ? lados[c] : 'c' }); }
      // o lado reto depois deste canto, dividido em pedaços (para as cores das cadeiras e a torcida)
      const prox = cantos[(c + 1) % 4], qx = prox[0] * (ax - rb), qz = prox[1] * (az - rb), L0 = Math.hypot(qx - cx, qz - cz);
      const n = Math.max(1, Math.round(L0 / ((op.passoLado && op.passoLado[lados[c]]) || passo)));
      const a = a1 / GRAU, nx = Math.cos(a), nz = Math.sin(a);
      for (let i = 1; i < n; i++) N.push({ cx: cx + (qx - cx) * i / n, cz: cz + (qz - cz) * i / n, nx, nz, canto: -1, lado: lados[c] });
    }
    N.push(Object.assign({}, N[0]));
    // comprimento acumulado (no contorno-base) para os desenhos que correm ao longo do anel
    let s = 0; N[0].s = 0;
    for (let i = 1; i < N.length; i++) { const p = ponto(N[i - 1], rb, 0), q = ponto(N[i], rb, 0); s += Math.hypot(q[0] - p[0], q[1] - p[1]); N[i].s = s; }
    return { N, rb, ax, az, total: s };
  }
  const ponto = (n, rb, o) => [n.cx + n.nx * (rb + o), n.cz + n.nz * (rb + o)];
  // o lado de cada pedaço (para os filtros: 'x+' cabeceira da direita, 'x-' da esquerda, 'z+' lateral de frente, 'z-' a dos bancos)
  function ladoDo(C, i) {
    const a = C.N[i], b = C.N[i + 1], mx = (a.nx + b.nx) / 2, mz = (a.nz + b.nz) / 2;
    if (Math.abs(mx) > 0.92) return mx > 0 ? 'x+' : 'x-';
    if (Math.abs(mz) > 0.92) return mz > 0 ? 'z+' : 'z-';
    return 'c' + (mx > 0 ? (mz > 0 ? '++' : '+-') : (mz > 0 ? '-+' : '--'));
  }

  // ============================================================================================ ARQUIBANCADA (um anel de degraus)
  //   A = { C (caminho), o0 (distância da frente da 1ª fileira ao contorno-base), n (fileiras), y0 (altura da 1ª fileira), dy, dz,
  //         chao (true: os degraus descem até o chão), concreto(r) cor do degrau, assento(r, i, info) cor da cadeira (null = sem cadeira),
  //         filtro(i, lado) se o pedaço i entra, torcida: { ocup, emPe(r, lado), time(r, i, x, z, lado) }, escadas: a cada quantos pedaços,
  //         espaco (entre torcedores), faixa: { h, cor } a mureta/fáscia da frente (textura na faixa do escudo se fx.tex) }
  function arquibancada(E, A) {
    const C = A.C, rb = C.rb, L = E.L, n = A.n, inc = (i) => !A.filtro || A.filtro(i, ladoDo(C, i));
    const yTopo = (r) => A.y0 + r * A.dy, oF = (r) => A.o0 + r * A.dz;
    const esp = A.espessura || 0.45, NS = C.N.length - 1;
    // os degraus vão em "trechos": um lado reto inteiro vira um degrau só (as cadeiras e a torcida continuam por pedaço)
    const reto = (j) => { const a = C.N[j], b = C.N[j + 1]; return a.nx === b.nx && a.nz === b.nz; };
    const trechoDe = new Array(NS).fill(-1), trechos = [];
    for (let i = 0; i < NS; i++) {
      if (!inc(i)) continue;
      if (i > 0 && trechoDe[i - 1] >= 0 && reto(i) && reto(i - 1) && C.N[i].nx === C.N[i - 1].nx && C.N[i].nz === C.N[i - 1].nz) { trechoDe[i] = trechoDe[i - 1]; trechos[trechoDe[i]].j1 = i; }
      else { trechoDe[i] = trechos.length; trechos.push({ j0: i, j1: i }); }
    }
    for (const t of trechos) {
      const a = C.N[t.j0], b = C.N[t.j1 + 1], lado = ladoDo(C, t.j0);
      const ini = !inc(t.j0 - 1 < 0 ? NS - 1 : t.j0 - 1), fim = !inc(t.j1 + 1 >= NS ? 0 : t.j1 + 1);
      for (let r = 0; r < n; r++) {
        const o = oF(r), o2 = o + A.dz, y = yTopo(r), yb = A.chao ? 0 : y - A.dy - esp;
        const p0 = ponto(a, rb, o), p1 = ponto(b, rb, o), q0 = ponto(a, rb, o2), q1 = ponto(b, rb, o2);
        const P = [[p0[0], yb, p0[1]], [p1[0], yb, p1[1]], [p0[0], y, p0[1]], [p1[0], y, p1[1]], [q0[0], yb, q0[1]], [q1[0], yb, q1[1]], [q0[0], y, q0[1]], [q1[0], y, q1[1]]];
        const sem = ['y0']; if (r < n - 1) sem.push('z1'); if (!ini) sem.push('x0'); if (!fim) sem.push('x1');
        if (!A.chao && r > 0) sem.push('z0');                                 // anel de cima: a frente de cada degrau aparece pelo de baixo
        const k = A.concreto(r, t.j0, lado);
        hexa(L, P, A.chao || r === 0 ? k : { todo: k, y1: k }, sem);
        if (!A.chao && r > 0) {                                               // o espelho do degrau (só a parte acima do degrau de baixo)
          const yp = yTopo(r - 1);
          face(L, [p0[0], yp, p0[1]], [p1[0], yp, p1[1]], [p1[0], y, p1[1]], [p0[0], y, p0[1]], [(p0[0] + q0[0]) / 2 + (q0[0] - p0[0]), y - 0.1, (p0[1] + q0[1]) / 2 + (q0[1] - p0[1])], tom(k, 0.86));
        }
      }
    }
    // as cadeiras (faixa fina na frente do degrau): nos lados retos, os pedaços seguidos da mesma cor viram uma faixa só; sem a face
    //   de trás (virada para fora do campo: não aparece). Corta mais da metade dos triângulos das cadeiras.
    const cadeira = (a, b, r, ca) => {
      const o = oF(r), y = yTopo(r), f0 = o + 0.12, f1 = o + 0.58, s0 = ponto(a, rb, f0), s1 = ponto(b, rb, f0), t0 = ponto(a, rb, f1), t1 = ponto(b, rb, f1), h = 0.16;
      const Q = [[s0[0], y, s0[1]], [s1[0], y, s1[1]], [s0[0], y + h, s0[1]], [s1[0], y + h, s1[1]], [t0[0], y, t0[1]], [t1[0], y, t1[1]], [t0[0], y + h + 0.22, t0[1]], [t1[0], y + h + 0.22, t1[1]]];
      hexa(L, Q, { todo: tom(ca, 0.8), y1: ca, z0: tom(ca, 0.9) }, ['y0', 'x0', 'x1', 'z1']);
    };
    if (A.assento) for (let r = 0; r < n; r++) {
      let run = null;
      const fecha = () => { if (run) cadeira(C.N[run.i0], C.N[run.i1 + 1], r, run.ca); run = null; };
      for (let i = 0; i < NS; i++) {
        if (!inc(i)) { fecha(); continue; }
        const a = C.N[i], b = C.N[i + 1], o = oF(r), p0 = ponto(a, rb, o), p1 = ponto(b, rb, o);
        const ca = A.assento(r, i, { lado: ladoDo(C, i), a, b, s: (a.s + b.s) / 2, x: (p0[0] + p1[0]) / 2, z: (p0[1] + p1[1]) / 2 });
        if (ca == null) { fecha(); continue; }
        if (run && reto(i) && run.reto && trechoDe[i] === run.t && ca === run.ca && i === run.i1 + 1) { run.i1 = i; continue; }
        fecha(); run = { i0: i, i1: i, ca, reto: reto(i), t: trechoDe[i] };
      }
      fecha();
    }
    for (let i = 0; i < NS; i++) {
      if (!inc(i)) continue;
      const a = C.N[i], b = C.N[i + 1], lado = ladoDo(C, i);
      for (let r = 0; r < n; r++) {
        const o = oF(r), y = yTopo(r), p0 = ponto(a, rb, o), p1 = ponto(b, rb, o);
        // a torcida
        if (A.torcida && E.torcida !== false) torcidaNoPedaco(E, A, p0, p1, a, b, o, y, r, i, lado);
      }
      // escadinhas (corredor de subida) no começo de alguns pedaços
      if (A.escadas && i % A.escadas === 0) for (let r = 0; r < n; r++) {
        const o = oF(r), y = yTopo(r), e0 = ponto(a, rb, o), e1 = ponto(a, rb, o + A.dz), tx = b.cx + b.nx * rb - (a.cx + a.nx * rb), tz = b.cz + b.nz * rb - (a.cz + a.nz * rb), tl = Math.hypot(tx, tz) || 1;
        const w = 0.55, ux = tx / tl * w, uz = tz / tl * w;
        const P = [[e0[0], y, e0[1]], [e0[0] + ux, y, e0[1] + uz], [e0[0], y + 0.03, e0[1]], [e0[0] + ux, y + 0.03, e0[1] + uz], [e1[0], y, e1[1]], [e1[0] + ux, y, e1[1] + uz], [e1[0], y + 0.03, e1[1]], [e1[0] + ux, y + 0.03, e1[1] + uz]];
        hexa(L, P, A.corEscada || 0xd8d2c0, ['y0', 'x0', 'x1', 'z0', 'z1']);
      }
    }
    return { yTopo: yTopo(n - 1), oFim: oF(n), yBase: A.y0 - A.dy };
  }
  // torcedores num pedaço de fileira (o jogo.js decide a cor pela camisa dos dois times: 0 e 1)
  function torcidaNoPedaco(E, A, p0, p1, a, b, o, y, r, i, lado) {
    const T = A.torcida, rb = A.C.rb, len = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]), esp = A.espaco || E.espaco || 0.82;
    const nPos = Math.max(0, Math.floor(len / esp));
    for (let k = 0; k < nPos; k++) {
      const t = (k + 0.5) / nPos;
      const ocup = typeof T.ocup === 'function' ? T.ocup(r, i, lado) : T.ocup;
      if (rnd() > ocup) continue;
      const nx = a.nx + (b.nx - a.nx) * t, nz = a.nz + (b.nz - a.nz) * t, nl = Math.hypot(nx, nz) || 1;
      const cx = a.cx + (b.cx - a.cx) * t, cz = a.cz + (b.cz - a.cz) * t, oo = o + 0.62;
      const x = cx + nx / nl * (rb + oo) + (rnd() - 0.5) * 0.18, z = cz + nz / nl * (rb + oo);
      const emPe = T.emPe ? T.emPe(r, lado) : rnd() < 0.3;
      const time = T.time ? T.time(r, i, x, z, lado) : E.casa;
      crowd.torcedor(x, y + (emPe ? 0.04 : 0.15), z, -nx / nl, -nz / nl, time, emPe, (Math.atan2(z, x) / (Math.PI * 2) + 1) % 1);
      E.nTorcida++;
    }
  }
  // a face de baixo de um anel suspenso (do 1º degrau até o fundo), a fáscia da frente (com a faixa do escudo) e a parede do fundo
  function anelSuspenso(E, A, R, op) {
    op = op || {};
    const C = A.C, rb = C.rb, inc = (i) => !A.filtro || A.filtro(i, ladoDo(C, i));
    const yF = A.y0 - A.dy - (A.espessura || 0.45), hF = op.fascia != null ? op.fascia : 1.4, oT = R.oFim, yT = R.yTopo - (A.espessura || 0.45) - 0.3;
    for (let i = 0; i < C.N.length - 1; i++) {
      if (!inc(i)) continue;
      const a = C.N[i], b = C.N[i + 1];
      const p0 = ponto(a, rb, A.o0), p1 = ponto(b, rb, A.o0), q0 = ponto(a, rb, oT), q1 = ponto(b, rb, oT);
      const f0 = ponto(a, rb, A.o0 - 0.04), f1 = ponto(b, rb, A.o0 - 0.04);   // a fáscia 4 cm para a frente (não divide o plano com o degrau)
      // o forro de baixo (inclinado)
      face(E.Lr, [p0[0], yF - hF + 0.3, p0[1]], [p1[0], yF - hF + 0.3, p1[1]], [q1[0], yT, q1[1]], [q0[0], yT, q0[1]], [(p0[0] + q0[0]) / 2, yF + 10, (p0[1] + q0[1]) / 2], op.forro || 0x5a5e66);
      // a fáscia (a faixa da frente do anel): textura do escudo ou cor lisa
      const yA = yF - hF + 0.3, yB = yF + 0.3 + (op.parapeito || 0.9);
      const lado = [(p0[0] + p1[0]) / 2 - a.nx * 5, yA, (p0[1] + p1[1]) / 2 - a.nz * 5];
      if (op.tex && E.Lf) {
        const u0 = -a.s / op.periodo, u1 = -b.s / op.periodo;
        face(E.Lf, [f0[0], yA, f0[1]], [f1[0], yA, f1[1]], [f1[0], yB, f1[1]], [f0[0], yB, f0[1]], [lado[0] + a.nx * 10, yA, lado[2] + a.nz * 10], null, [[u0, 0], [u1, 0], [u1, 1], [u0, 1]]);
      } else face(E.L, [f0[0], yA, f0[1]], [f1[0], yA, f1[1]], [f1[0], yB, f1[1]], [f0[0], yB, f0[1]], [lado[0] + a.nx * 10, yA, lado[2] + a.nz * 10], op.corFascia || 0x30343c);
      // a parede do fundo, até o alto (fecha o anel)
      if (op.fundo !== false) {
        const yTop = R.yTopo + (op.muro || 1.6);
        const r0 = ponto(a, rb, oT + 0.3), r1 = ponto(b, rb, oT + 0.3);
        hexa(E.L, [[q0[0], yT, q0[1]], [q1[0], yT, q1[1]], [q0[0], yTop, q0[1]], [q1[0], yTop, q1[1]], [r0[0], yT, r0[1]], [r1[0], yT, r1[1]], [r0[0], yTop, r0[1]], [r1[0], yTop, r1[1]]], op.corFundo || 0x4a4e56, ['y0', 'x0', 'x1']);
      }
    }
  }
  // um anel achatado qualquer (laje, cobertura, marquise): de oIn (altura yIn) até oOut (altura yOut), com espessura
  function laje(E, C, oIn, oOut, yIn, yOut, esp, cor, filtro, L) {
    const rb = C.rb; L = L || E.L;
    for (let i = 0; i < C.N.length - 1; i++) {
      if (filtro && !filtro(i, ladoDo(C, i))) continue;
      const a = C.N[i], b = C.N[i + 1], p0 = ponto(a, rb, oIn), p1 = ponto(b, rb, oIn), q0 = ponto(a, rb, oOut), q1 = ponto(b, rb, oOut);
      hexa(L, [[p0[0], yIn - esp, p0[1]], [p1[0], yIn - esp, p1[1]], [p0[0], yIn, p0[1]], [p1[0], yIn, p1[1]], [q0[0], yOut - esp, q0[1]], [q1[0], yOut - esp, q1[1]], [q0[0], yOut, q0[1]], [q1[0], yOut, q1[1]]], typeof cor === 'function' ? cor(i) : cor, ['x0', 'x1']);
    }
  }
  // cobertura: igual à laje, mas a face de baixo vai para o lote do forro (E.Lr, sem luz: não pega o verde do chão) com a cor baixo
  function teto(E, C, oIn, oOut, yIn, yOut, esp, cor, filtro, baixo) {
    const rb = C.rb;
    for (let i = 0; i < C.N.length - 1; i++) {
      if (filtro && !filtro(i, ladoDo(C, i))) continue;
      const a = C.N[i], b = C.N[i + 1], p0 = ponto(a, rb, oIn), p1 = ponto(b, rb, oIn), q0 = ponto(a, rb, oOut), q1 = ponto(b, rb, oOut);
      const P = [[p0[0], yIn - esp, p0[1]], [p1[0], yIn - esp, p1[1]], [p0[0], yIn, p0[1]], [p1[0], yIn, p1[1]], [q0[0], yOut - esp, q0[1]], [q1[0], yOut - esp, q1[1]], [q0[0], yOut, q0[1]], [q1[0], yOut, q1[1]]];
      hexa(E.L, P, typeof cor === 'function' ? cor(i) : cor, ['x0', 'x1', 'y0']);
      face(E.Lr, P[0], P[1], P[5], P[4], [P[0][0], yIn + 10, P[0][2]], typeof baixo === 'function' ? baixo(i) : baixo);
    }
  }
  // uma peça "radial" (costela, viga, coluna inclinada) no nó i: do (o0, y0) ao (o1, y1), largura w e altura h
  function radial(E, C, i, o0, y0, o1, y1, w, h, cor, L) {
    const n = C.N[i], rb = C.rb, p = ponto(n, rb, o0), q = ponto(n, rb, o1), tx = -n.nz * w / 2, tz = n.nx * w / 2;
    hexa(L || E.L, [[p[0] - tx, y0 - h, p[1] - tz], [p[0] + tx, y0 - h, p[1] + tz], [p[0] - tx, y0, p[1] - tz], [p[0] + tx, y0, p[1] + tz], [q[0] - tx, y1 - h, q[1] - tz], [q[0] + tx, y1 - h, q[1] + tz], [q[0] - tx, y1, q[1] - tz], [q[0] + tx, y1, q[1] + tz]], cor);
  }
  // uma viga reta entre dois pontos quaisquer (seção quadrada w), para as treliças e as diagonais
  function viga(L, p, q, w, cor) {
    const dx = q[0] - p[0], dy = q[1] - p[1], dz = q[2] - p[2], l = Math.hypot(dx, dy, dz) || 1;
    // dois vetores perpendiculares à viga
    let ax = -dz, ay = 0, az = dx; let al = Math.hypot(ax, ay, az); if (al < 1e-6) { ax = 1; az = 0; al = 1; }
    ax = ax / al * w / 2; az = az / al * w / 2;
    const bx = (dy * az - dz * ay) / l, by = (dz * ax - dx * az) / l, bz = (dx * ay - dy * ax) / l;
    const P = [];
    for (let k = 0; k < 8; k++) {
      const e = k & 1 ? q : p, sa = k & 2 ? 1 : -1, sb = k & 4 ? 1 : -1;
      P.push([e[0] + ax * sa + bx * sb, e[1] + ay * sa + by * sb, e[2] + az * sa + bz * sb]);
    }
    hexa(L, P, cor);
  }
  const ponto3 = (n, rb, o, y) => { const p = ponto(n, rb, o); return [p[0], y, p[1]]; };
  // um ponto entre dois nós (t de 0 a 1) à distância o
  function pontoT(a, b, t, rb, o) {
    const nx = a.nx + (b.nx - a.nx) * t, nz = a.nz + (b.nz - a.nz) * t, nl = Math.hypot(nx, nz) || 1;
    return [a.cx + (b.cx - a.cx) * t + nx / nl * (rb + o), a.cz + (b.cz - a.cz) * t + nz / nl * (rb + o)];
  }
  // uma placa (pétala, painel) entre os nós a e b, de t0 a t1 na largura, de (o0, y0) a (o1, y1), com espessura
  function placa(L, C, a, b, t0, t1, o0, y0, o1, y1, esp, cor, w1, Lb, baixo) {
    const rb = C.rb, m = (t0 + t1) / 2, k = w1 == null ? 1 : w1, u0 = m + (t0 - m) * k, u1 = m + (t1 - m) * k;
    const p0 = pontoT(a, b, t0, rb, o0), p1 = pontoT(a, b, t1, rb, o0), q0 = pontoT(a, b, u0, rb, o1), q1 = pontoT(a, b, u1, rb, o1);
    const P = [[p0[0], y0 - esp, p0[1]], [p1[0], y0 - esp, p1[1]], [p0[0], y0, p0[1]], [p1[0], y0, p1[1]], [q0[0], y1 - esp, q0[1]], [q1[0], y1 - esp, q1[1]], [q0[0], y1, q0[1]], [q1[0], y1, q1[1]]];
    hexa(L, P, cor, Lb ? ['y0'] : null);
    if (Lb) face(Lb, P[0], P[1], P[5], P[4], [(P[2][0] + P[7][0]) / 2, (P[2][1] + P[7][1]) / 2 + 5, (P[2][2] + P[7][2]) / 2], baixo);
  }
  // luzes ao longo de um anel (a borda de dentro da cobertura), a cada passo metros
  function luzesNoAnel(E, C, o, y, passo, filtro, tam) {
    const rb = C.rb; let ac = passo / 2; tam = tam || [1.6, 0.35, 0.6];
    for (let i = 0; i < C.N.length - 1; i++) {
      const a = C.N[i], b = C.N[i + 1], len = b.s - a.s;
      if (filtro && !filtro(i, ladoDo(C, i))) { ac = passo / 2; continue; }
      while (ac < len) {
        const t = ac / len, nx = a.nx + (b.nx - a.nx) * t, nz = a.nz + (b.nz - a.nz) * t, nl = Math.hypot(nx, nz) || 1;
        const x = a.cx + (b.cx - a.cx) * t + nx / nl * (rb + o), z = a.cz + (b.cz - a.cz) * t + nz / nl * (rb + o);
        caixa(E.Lp, x, y, z, tam[0], tam[1], tam[2], 0xffffff, Math.atan2(nx / nl, nz / nl) + Math.PI / 2);
        ac += passo;
      }
      ac -= len;
    }
  }

  // ============================================================================================ TEXTURAS DO MANDANTE
  //   faixa: o escudo + o nome, repetido ao longo das fáscias · telão: o escudo grande com o nome e "SÉRIE A" · bandeira: listras + escudo
  function canvas(w, h, f) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; f(g, w, h); return c; }
  // as faixas de janela dos prédios da cidade: 16 andares de 16 px (a faixa embaixo de cada andar, o resto transparente), cada um
  //   com uma cor (vidro, luz acesa, apagada); cada prédio começa num andar sorteado da textura
  function texJanelas() {
    const t = pixelTexture(canvas(4, 256, (g) => {
      g.clearRect(0, 0, 4, 256);
      for (let k = 0; k < 16; k++) { const r = rnd(); g.fillStyle = r < 0.45 ? '#c6d2de' : r < 0.83 ? '#eed9a0' : '#6d7884'; g.fillRect(0, 256 - k * 16 - 5, 4, 5); }
    }));
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  }
  function texFaixa(E) {
    const M = E.M, c1 = css(E.c1), c2 = css(E.c2), fundo = luma(E.c1) > 200 ? '#1c1c22' : c1;
    const cnv = canvas(256, 32, (g) => {
      g.fillStyle = fundo; g.fillRect(0, 0, 256, 32);
      g.fillStyle = c2; g.fillRect(0, 0, 256, 2); g.fillRect(0, 30, 256, 2);
      desenharEmblema(g, 6, 3, 26, 26, M.emblema);
      g.fillStyle = luma(fundo) > 150 ? '#14161c' : '#ffffff'; g.font = 'bold 15px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(String(M.nome || '').toUpperCase(), 144, 17, 200);
    });
    const t = pixelTexture(cnv); t.wrapS = THREE.RepeatWrapping; return t;
  }
  function texTelao(E, txt) {
    const M = E.M, c1 = css(E.c1), c2 = css(E.c2);
    return pixelTexture(canvas(256, 128, (g) => {
      g.fillStyle = '#05070c'; g.fillRect(0, 0, 256, 128);
      const gr = g.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, c1); gr.addColorStop(1, '#05070c'); g.fillStyle = gr; g.fillRect(4, 4, 248, 120);
      for (let y = 4; y < 124; y += 2) { g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(4, y, 248, 1); }   // as linhas do LED
      desenharEmblema(g, 14, 18, 88, 92, M.emblema);
      g.fillStyle = '#ffffff'; g.font = 'bold 22px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(String(M.sigla || M.nome || '').toUpperCase(), 180, 46, 140);
      g.fillStyle = c2; g.fillRect(118, 62, 124, 3);
      g.fillStyle = '#ffffff'; g.font = 'bold 14px Arial'; g.fillText(txt || 'SÉRIE A', 180, 84, 140);
    }));
  }
  function texBandeira(E) {
    const M = E.M, c1 = css(E.c1), c2 = css(E.c2);
    return pixelTexture(canvas(96, 64, (g) => {
      for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? c2 : c1; g.fillRect(0, i * 64 / 6, 96, 64 / 6 + 1); }
      g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(28, 12, 40, 40);
      desenharEmblema(g, 30, 12, 36, 40, M.emblema);
    }));
  }
  // o escudo em pixels (para montar nas cadeiras): devolve f(u, v) -> cor ou null (transparente), u e v de 0 a 1
  function mapaEscudo(E, n) {
    const cnv = canvas(n, n, (g) => desenharEmblema(g, 0, 0, n, n, E.M.emblema));
    const d = cnv.getContext('2d').getImageData(0, 0, n, n).data;
    return (u, v) => {
      if (u < 0 || v < 0 || u >= 1 || v >= 1) return null;
      const x = Math.floor(u * n), y = Math.floor(v * n), k = (y * n + x) * 4;
      return d[k + 3] < 128 ? null : deRgb(d[k], d[k + 1], d[k + 2]);
    };
  }
  // letras em pixels (a sigla nas cadeiras)
  function mapaTexto(txt, w, h) {
    const cnv = canvas(w, h, (g) => { g.fillStyle = '#fff'; g.font = 'bold ' + Math.round(h * 0.95) + 'px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, w / 2, h / 2 + 1, w - 2); });
    const d = cnv.getContext('2d').getImageData(0, 0, w, h).data;
    return (u, v) => { if (u < 0 || v < 0 || u >= 1 || v >= 1) return false; const x = Math.floor(u * w), y = Math.floor(v * h); return d[(y * w + x) * 4 + 3] > 110; };
  }
  // telão: uma caixa escura com a tela na frente (virada para dir), sustentada ou pendurada
  function telao(E, x, y, z, w, h, ang, op) {
    op = op || {};
    caixa(E.L, x, y, z, w + 0.6, h + 0.6, 0.9, op.moldura || 0x1a1c22, ang);
    const ca = Math.cos(ang), sa = Math.sin(ang), fx = -sa * 0.46, fz = ca * 0.46;   // a frente (o +z local girado)
    const ex = ca * w / 2, ez = sa * w / 2;
    face(E.Lt, [x - ex + fx, y - h / 2, z - ez + fz], [x + ex + fx, y - h / 2, z + ez + fz], [x + ex + fx, y + h / 2, z + ez + fz], [x - ex + fx, y + h / 2, z - ez + fz], [x, y, z], null, [[0, 0], [1, 0], [1, 1], [0, 1]]);
    if (op.pernas) for (const s of [-1, 1]) caixa(E.L, x + ca * s * w * 0.32, (y - h / 2) / 2, z + sa * s * w * 0.32, 0.5, y - h / 2, 0.5, 0x55595f);
    if (op.cabos) for (const s of [-1, 1]) caixa(E.L, x + ca * s * w * 0.4, y + h / 2 + op.cabos / 2, z + sa * s * w * 0.4, 0.08, op.cabos, 0.08, 0x2a2c30);
  }
  // bandeira pendurada (a frente virada para o campo): retângulo com a textura da bandeira
  function bandeirao(E, x, y, z, w, h, ang) {
    const ca = Math.cos(ang), sa = Math.sin(ang), ex = ca * w / 2, ez = sa * w / 2, fx = -sa * 0.05, fz = ca * 0.05;
    face(E.Lb, [x - ex + fx, y - h, z - ez + fz], [x + ex + fx, y - h, z + ez + fz], [x + ex + fx, y, z + ez + fz], [x - ex + fx, y, z - ez + fz], [x - sa * 0.05 - fx * 10, y, z - fz * 10], null, [[0, 0], [1, 0], [1, 1], [0, 1]]);
  }
  // árvore de bloco e palmeira (os arredores)
  function arvore(L, x, z, h, s, cor) {
    caixa(L, x, h / 2, z, 0.5 * s, h, 0.5 * s, 0x6b4a2a);
    caixa(L, x, h + 1.1 * s, z, 3 * s, 2.4 * s, 3 * s, cor || 0x3f7a35);
    caixa(L, x + 0.4 * s, h + 2.4 * s, z - 0.3 * s, 2 * s, 1.4 * s, 2 * s, tom(cor || 0x3f7a35, 1.12));
  }
  function palmeira(L, x, z, h) {
    for (let i = 0; i < 6; i++) { const w = i % 2 ? 0.42 : 0.47; caixa(L, x + Math.sin(i * 0.7) * 0.15, (i + 0.5) * h / 6, z, w, h / 6 + 0.05, w, i % 2 ? 0x7a5a36 : 0x6b4e2e); }   // gomos alternando a grossura (as faces não se encontram no mesmo plano)
    for (let k = 0; k < 5; k++) { const a = k * Math.PI * 2 / 5; caixa(L, x + Math.cos(a) * 1.4, h + 0.1 - 0.35 + k * 0.03, z + Math.sin(a) * 1.4, 3.2, 0.25, 0.9, k % 2 ? 0x2f7a35 : 0x3a8a3c, -a); }
  }

  // ============================================================================================ CONTEXTO DA PARTIDA
  function contexto(P) {
    const casa = P.mandante, M = P.timesObj[casa], V = P.timesObj[1 - casa];
    const U = M.uniforme || P.uniformes[casa] || {}, emb = M.emblema || {};
    const c1 = num(U.camisa || emb.cor1 || '#2a4a8a');
    let c2 = [U.listra, U.calcao, emb.cor2, U.gola, '#f2f2ee', '#1c1c1f'].map(num).find((c) => dist(c, c1) > 90);
    if (c2 == null) c2 = luma(c1) > 128 ? 0x1c1c1f : 0xf2f2ee;
    const popM = typeof M.popularidade === 'number' ? M.popularidade : 0.6, popV = typeof V.popularidade === 'number' ? V.popularidade : 0.5;
    const ocup = Math.max(0.15, Math.min(0.97, typeof M.torcidaA === 'number' ? M.torcidaA : 0.32 + 0.6 * popM + 0.08 * popV));
    semente = (typeof sementeDe === 'function' ? sementeDe(String(M.nome || 'casa') + '|' + (P.campo.modelo || '')) : 12345) || 1;
    return { P, casa, M, V, c1, c2, popM, popV, ocup, nTorcida: 0, HL: HALF_L, HW: HALF_W };
  }
  // quem torce para quem: a casa em quase tudo; a visitante num setor só (o "canto" dela) e um pouco espalhada
  function timePadrao(E, setorFora) {
    return (r, i, x, z, lado) => {
      if (setorFora && setorFora(r, i, x, z, lado)) return rnd() < 0.92 ? 1 - E.casa : E.casa;
      return rnd() < 0.96 ? E.casa : 1 - E.casa;
    };
  }

  // a pegada do estádio: a metade do retângulo que tudo o que já foi montado ocupa (+ folga). Os modelos com paisagem própria
  // (lago, rio, mata) chamam antes de montá-la; os outros, o construir chama no fim.
  function medir(E, folga) {
    let ax = E.HL + 20, az = E.HW + 20; const p = E.L.pos;
    for (let i = 0; i < p.length; i += 3) { const x = Math.abs(p[i]), z = Math.abs(p[i + 2]); if (x > ax) ax = x; if (z > az) az = z; }
    return [Math.ceil(ax + (folga == null ? 4 : folga)), Math.ceil(az + (folga == null ? 4 : folga))];
  }

  // ============================================================================================ OS MODELOS
  const MODELOS = {};
  const NOMES = {};

  // ------------------------------------------------------------------------------------------ 1. ANEL (Maracanã)
  //   O bowl oval de dois anéis colados (o de baixo baixinho, o de cima alto), a cobertura branca em anel por cima de tudo com
  //   as costelas por baixo e a fileira de luzes na borda, os dois telões pendurados nas cabeceiras e o fosso cinza-azulado.
  NOMES.anel = 'Estádio do Anel';
  MODELOS.anel = (E) => {
    const HL = E.HL, HW = E.HW;
    const C = caminho(HL + 12, HW + 11, 34, { nArc: 12, passo: 4 });
    // as cadeiras "confete": as cores do time em manchas, com um pouco de branco
    const cor3 = mistura(E.c1, 0xffffff, 0.55);
    const confete = (r, i, info) => {
      const v = hash(Math.floor(info.s / 9), Math.floor(r / 4), 7) * 0.6 + hash(i, r, 3) * 0.4;
      return v < 0.5 ? E.c1 : v < 0.72 ? E.c2 : v < 0.86 ? cor3 : tom(E.c1, 0.78);
    };
    const fora = (r, i, x, z) => x > HL + 8 && z < -10 && r > 4;           // a visitante: o canto da cabeceira da direita
    const tc = { ocup: E.ocup, emPe: (r, lado) => (lado === 'x-' ? rnd() < 0.75 : rnd() < 0.22), time: timePadrao(E, fora) };
    // anel de baixo (16 fileiras, pouco inclinado)
    const A1 = { C, o0: 0, n: 16, y0: 1.3, dy: 0.46, dz: 0.95, chao: true, concreto: (r) => (r % 2 ? 0xa7aaae : 0x9ea1a6), assento: confete, torcida: tc, escadas: 6, corEscada: 0xe2ddcc };
    const R1 = arquibancada(E, A1);
    // a mureta da frente com a faixa do escudo
    muretaFaixa(E, C, -0.15, 1.25, 26);
    // a "praça" entre os anéis (o corredor com as bocas de saída)
    const oP = R1.oFim, yP = R1.yTopo + 0.2;
    laje(E, C, oP, oP + 3, yP, yP, 0.3, 0x8b8e93);
    // anel de cima (24 fileiras, mais inclinado), suspenso, com a fáscia branca e o escudo
    const A2 = { C, o0: oP + 3, n: 24, y0: yP + 4.6, dy: 0.64, dz: 0.92, concreto: (r) => (r % 2 ? 0xb3b6ba : 0xaaadb2), assento: confete, torcida: tc, escadas: 6, corEscada: 0xe2ddcc };
    const R2 = arquibancada(E, A2);
    anelSuspenso(E, A2, R2, { tex: true, periodo: 30, fascia: 1.5, parapeito: 0.6, forro: 0x6c7076, corFundo: 0x55585e, muro: 6.6 });
    // o vão entre os anéis: a parede de trás da praça (inteira) com as bocas escuras de saída
    for (let i = 0; i < C.N.length - 1; i++) {
      const a = C.N[i], b = C.N[i + 1], p = ponto(a, C.rb, oP + 2.95), q = ponto(b, C.rb, oP + 2.95);
      face(E.L, [p[0], yP, p[1]], [q[0], yP, q[1]], [q[0], A2.y0 - A2.dy - 0.45 - 1.2, q[1]], [p[0], A2.y0 - A2.dy - 0.45 - 1.2, p[1]], [p[0] * 2, yP + 2, p[1] * 2], 0x6e7176);
      if (i % 3) continue;
      const m = ponto({ cx: (a.cx + b.cx) / 2, cz: (a.cz + b.cz) / 2, nx: (a.nx + b.nx) / 2, nz: (a.nz + b.nz) / 2 }, C.rb, oP + 2.9);
      caixa(E.L, m[0], yP + 1.2, m[1], 2.2, 2.2, 0.2, 0x1e2024, Math.atan2(a.nx, a.nz) + Math.PI / 2);
    }
    // os bandeirões da torcida organizada pendurados na fáscia, atrás do gol da esquerda
    for (const z of [-16, -5, 6, 17]) bandeirao(E, -(HL + 12 + oP + 3 + 0.4), A2.y0 - A2.dy - 0.6, z, 7, 4.6, -Math.PI / 2);
    // a cobertura em anel: membrana branca do fundo do anel de cima até em cima do anel de baixo, com as costelas por baixo
    const oT0 = 6, oT1 = R2.oFim + 3, yT0 = R2.yTopo + 9.5, yT1 = R2.yTopo + 6.5;
    teto(E, C, oT0, oT1, yT0, yT1, 0.4, (i) => (i % 2 ? 0xeef0f2 : 0xe2e5e8), null, (i) => (i % 2 ? 0x9a9fa6 : 0x8f949b));
    laje(E, C, oT0 - 0.4, oT0 + 0.8, yT0 + 0.15, yT0 + 0.15, 0.9, 0xc7cbd0);           // o anel de compressão da borda de dentro
    for (let i = 0; i < C.N.length - 1; i += 2) {
      radial(E, C, i, oT0, yT0 - 0.4, oT1, yT1 - 0.4, 0.35, 1.0, 0x8a8f96);              // costela por baixo
      if (i % 4 === 0) radial(E, C, i, R2.oFim + 0.3, R2.yTopo + 2.2, R2.oFim + 0.6, yT1 - 0.8, 0.6, R2.yTopo + 2.2 - (yT1 - 0.8) + 0.4, 0x9a9ea4);   // coluna do fundo
    }
    luzesNoAnel(E, C, oT0 + 0.6, yT0 - 1.15, 4.5);
    // os telões pendurados embaixo da cobertura, nas cabeceiras
    for (const s of [-1, 1]) telao(E, s * (HL + 23), yT0 - 5.2, 0, 15, 7.5, s > 0 ? Math.PI / 2 : -Math.PI / 2, { cabos: 3.5 });
    // o fosso cinza-azulado entre o campo e o anel de baixo
    E.chaoCor = 0x5d6a74;
    // por fora: o anel de colunas de concreto (aparece de cima)
    for (let i = 0; i < C.N.length - 1; i += 2) radial(E, C, i, R2.oFim + 3.2, 0.2, R2.oFim + 6, yT1 - 2, 0.9, 1.2, 0xb8bbc0);
  };
  // a "pele" de fora do estádio: uma parede em volta do anel inteiro, do chão até a altura h (cor por pedaço)
  function pele(E, C, o, y0, y1, cor, filtro) {
    for (let i = 0; i < C.N.length - 1; i++) {
      if (filtro && !filtro(i, ladoDo(C, i))) continue;
      const a = C.N[i], b = C.N[i + 1], p = ponto(a, C.rb, o), q = ponto(b, C.rb, o);
      face(E.L, [p[0], y0, p[1]], [q[0], y0, q[1]], [q[0], y1, q[1]], [p[0], y1, p[1]], [p[0] - a.nx * 5, y0 + 1, p[1] - a.nz * 5], typeof cor === 'function' ? cor(i) : cor);
    }
  }
  // mureta da frente de um anel no chão: concreto + a faixa do escudo
  function muretaFaixa(E, C, o, h, periodo, filtro) {
    for (let i = 0; i < C.N.length - 1; i++) {
      if (filtro && !filtro(i, ladoDo(C, i))) continue;
      const a = C.N[i], b = C.N[i + 1], p0 = ponto(a, C.rb, o), p1 = ponto(b, C.rb, o), q0 = ponto(a, C.rb, o + 0.3), q1 = ponto(b, C.rb, o + 0.3);
      const hm = h + 0.03;                                                  // 3 cm acima do 1º degrau (o topo não divide o plano com ele)
      hexa(E.L, [[p0[0], 0, p0[1]], [p1[0], 0, p1[1]], [p0[0], hm, p0[1]], [p1[0], hm, p1[1]], [q0[0], 0, q0[1]], [q1[0], 0, q1[1]], [q0[0], hm, q0[1]], [q1[0], hm, q1[1]]], 0x2a2d33, ['y0', 'x0', 'x1', 'z0']);
      const u0 = -a.s / periodo, u1 = -b.s / periodo;
      const f0 = ponto(a, C.rb, o - 0.02), f1 = ponto(b, C.rb, o - 0.02);
      face(E.Lf, [f0[0], 0.05, f0[1]], [f1[0], 0.05, f1[1]], [f1[0], h - 0.05, f1[1]], [f0[0], h - 0.05, f0[1]], [f0[0] + a.nx * 3, 0.5, f0[1] + a.nz * 3], null, [[u0, 0], [u1, 0], [u1, 1], [u0, 1]]);
    }
  }

  // ------------------------------------------------------------------------------------------ 2. CALDEIRÃO (Nubank Parque)
  //   Retangular e colado no campo, os cantos quase em quina, dois anéis bem em pé com a faixa de camarotes de vidro entre eles,
  //   o teto escuro chegando quase na linha do campo com a treliça branca por baixo, o escudo montado nas cadeiras da cabeceira
  //   da direita e os telões nas cabeceiras.
  NOMES.caldeirao = 'Arena Caldeirão';
  MODELOS.caldeirao = (E) => {
    const HL = E.HL, HW = E.HW;
    const C = caminho(HL + 8.6, HW + 9.2, 5, { nArc: 5, passo: 4, passoLado: { 'x+': 1.0 } });
    const esc = mapaEscudo(E, 28), escuro = tom(E.c1, 0.72), claro = tom(E.c1, 1.12);
    const liso = (r) => (r % 2 ? E.c1 : escuro);
    const fora = (r, i, x, z) => x < -(HL + 6) && z > 12;                  // a visitante: o canto de cima da cabeceira da esquerda
    const fundoMosaico = luma(E.c2) > 170 ? E.c2 : mistura(E.c2, 0xffffff, 0.55);
    const tc = { ocup: (r, i, lado) => (lado === 'x+' ? E.ocup * 0.45 : E.ocup), emPe: (r, lado) => (lado === 'x-' ? rnd() < 0.85 : rnd() < 0.2), time: timePadrao(E, fora) };
    const A1 = { C, o0: 0, n: 14, y0: 1.25, dy: 0.62, dz: 0.86, chao: true, concreto: (r) => (r % 2 ? 0x5b5f66 : 0x555960), assento: (r) => liso(r), torcida: tc, escadas: 7, corEscada: 0xd9d4c4 };
    const R1 = arquibancada(E, A1);
    muretaFaixa(E, C, -0.15, 1.3, 24);
    // a faixa dos camarotes (vidro escuro, montantes brancos) nas laterais; nas cabeceiras, a parede com as bocas
    const oC = R1.oFim, yC0 = R1.yTopo + 0.4, yC1 = yC0 + 3.6;
    laje(E, C, oC, oC + 2.2, yC0, yC0, 0.35, 0x7d8188);
    for (let i = 0; i < C.N.length - 1; i++) {
      const lado = ladoDo(C, i), a = C.N[i], b = C.N[i + 1], p = ponto(a, C.rb, oC + 2.2), q = ponto(b, C.rb, oC + 2.2);
      if (lado === 'z+' || lado === 'z-') {
        face(E.L, [p[0], yC0, p[1]], [q[0], yC0, q[1]], [q[0], yC1, q[1]], [p[0], yC1, p[1]], [p[0] * 1.2, yC0 + 2, p[1] * 1.2], 0x1d3550);
        caixa(E.L, p[0], (yC0 + yC1) / 2, p[1] - Math.sign(p[1]) * 0.05, 0.18, yC1 - yC0, 0.12, 0xe8eaec);
        caixa(E.L, (p[0] + q[0]) / 2, yC0 + 1.05, (p[1] + q[1]) / 2 - Math.sign(p[1]) * 0.05, Math.abs(q[0] - p[0]) + 0.1, 0.1, 0.12, 0xc9ccd0);
      } else face(E.L, [p[0], yC0, p[1]], [q[0], yC0, q[1]], [q[0], yC1, q[1]], [p[0], yC1, p[1]], [p[0] * 1.2, yC0 + 2, p[1] * 1.2], 0x3d4148);
    }
    // o anel de cima, bem em pé; na cabeceira da direita o escudo montado nas cadeiras
    const n2 = 18;
    const A2 = { C, o0: oC + 2.2, n: n2, y0: yC1 + 1.3, dy: 0.8, dz: 0.86, concreto: (r) => (r % 2 ? 0x62666d : 0x5b5f66), espessura: 0.5,
      assento: (r, i, info) => {
        if (info.lado === 'x+') {
          const lq = 18, u = (-info.z + lq / 2) / lq, v = 1 - (r + 0.5) / n2;   // um quadrado de 18 m no meio da cabeceira
          if (u < -0.06 || u > 1.06) return liso(r);
          const k = esc(u, v);
          return k != null ? k : fundoMosaico;
        }
        return r === 0 || r === n2 - 1 ? claro : liso(r);
      }, torcida: tc, escadas: 7, corEscada: 0xd9d4c4 };
    const R2 = arquibancada(E, A2);
    anelSuspenso(E, A2, R2, { tex: true, periodo: 26, fascia: 1.3, parapeito: 0.7, forro: 0x4d5158, corFundo: 0x3a3e45, muro: 7.2 });
    // o teto escuro, chegando quase na linha do campo, com a treliça branca embaixo (vigas radiais + dois anéis)
    const oT0 = 1.5, oT1 = R2.oFim + 1.2, yT = R2.yTopo + 7.4;
    teto(E, C, oT0, oT1, yT + 0.8, yT, 0.35, 0x26282d, null, 0x2c2f35);
    laje(E, C, oT0 - 0.3, oT0 + 0.5, yT + 0.6, yT + 0.6, 1.1, 0x32353b);               // a borda (com as luzes)
    for (let i = 0; i < C.N.length - 1; i += 1) {
      const lado = ladoDo(C, i); if (lado === 'x+' && i % 3) continue;
      radial(E, C, i, oT0 + 0.4, yT + 0.4, oT1, yT - 0.35, 0.22, 1.6, 0xeceef0);
    }
    for (const o of [oT0 + 6, oT0 + 13, oT0 + 20]) laje(E, C, o, o + 0.3, yT + 0.8 - 0.8 * (o - oT0) / (oT1 - oT0) - 0.35, yT + 0.8 - 0.8 * (o + 0.3 - oT0) / (oT1 - oT0) - 0.35, 0.5, 0xdfe2e5);
    luzesNoAnel(E, C, oT0 + 0.2, yT - 0.15, 3.2);
    // os telões das cabeceiras pendurados no teto
    for (const s of [-1, 1]) telao(E, s * (HL + 15), yT - 4.6, 0, 13, 6.5, s > 0 ? Math.PI / 2 : -Math.PI / 2, { cabos: 3 });
    // por fora: a fachada de lâminas brancas (aparece de cima)
    pele(E, C, oT1 + 0.2, 0, yT + 0.5, (i) => (i % 2 ? 0xe9ebed : 0xdcdfe2));
    for (let i = 0; i < C.N.length - 1; i++) radial(E, C, i, oT1 + 0.5, yT + 0.6, oT1 + 1.1, 0.6, 0.25, 0.6, 0xf6f7f8);
    E.chaoCor = 0x24502a;
  };

  // ------------------------------------------------------------------------------------------ 3. FACHADA (Neo Química Arena)
  //   Quatro arquibancadas soltas, com os cantos abertos. A oeste (a dos bancos) é a mais alta, com o prédio de vidro atrás e a
  //   cobertura grande de treliça; a leste tem o telão gigante na fachada de fora (aparece de cima); as cabeceiras são um anel só,
  //   bem em pé e sem cobertura — a da esquerda é a da organizada (em pé, com os bandeirões) e a da direita tem o telão em cima.
  NOMES.fachada = 'Arena da Fachada';
  MODELOS.fachada = (E) => {
    const HL = E.HL, HW = E.HW;
    const C = caminho(HL + 9.5, HW + 9.5, 1, { nArc: 2, passo: 4 });
    const so = (...l) => (i, lado) => l.includes(lado);
    const grafite = 0x2b2e34, branco = 0xe9eaec;
    const fora = (r, i, x, z, lado) => lado === 'x+' && z > 8;           // visitante: o canto da cabeceira da direita
    const tc = (emPe) => ({ ocup: E.ocup, emPe: () => rnd() < emPe, time: timePadrao(E, fora) });
    // as laterais: anel de baixo (cor do time) e anel de cima (grafite com pontos brancos)
    const lat = so('z+', 'z-');
    const A1 = { C, o0: 0, n: 15, y0: 1.3, dy: 0.58, dz: 0.88, chao: true, filtro: lat, concreto: (r) => (r % 2 ? 0x6a6d73 : 0x63666c), assento: (r) => (r % 2 ? E.c1 : tom(E.c1, 0.85)), torcida: tc(0.2), escadas: 6, corEscada: 0xd0ccbe };
    const R1 = arquibancada(E, A1);
    muretaFaixa(E, C, -0.15, 1.25, 24, lat);
    // oeste (z-) mais alta que a leste (z+)
    const anelCima = (lado, n, y0) => {
      const A2 = { C, o0: R1.oFim + 1.8, n, y0, dy: 0.74, dz: 0.88, filtro: so(lado), concreto: (r) => (r % 2 ? 0x6d7076 : 0x66696f), espessura: 0.5,
        assento: (r, i, info) => (hash(Math.floor(info.s / 2.5), r, 11) < 0.12 ? branco : grafite), torcida: tc(0.15), escadas: 6, corEscada: 0xd0ccbe };
      const R2 = arquibancada(E, A2);
      laje(E, C, R1.oFim, R1.oFim + 1.8, R1.yTopo + 0.3, R1.yTopo + 0.3, 0.3, 0x7b7e84, so(lado));
      anelSuspenso(E, A2, R2, { tex: true, periodo: 24, fascia: 1.6, parapeito: 0.7, forro: 0x50545b, corFundo: 0x3b3f46, muro: lado === 'z-' ? 11 : 7.5 });
      return R2;
    };
    const RO = anelCima('z-', 22, R1.yTopo + 8.4), RL = anelCima('z+', 15, R1.yTopo + 4.6);
    // na oeste, entre os anéis: os dois andares de camarotes de vidro
    for (let i = 0; i < C.N.length - 1; i++) {
      if (ladoDo(C, i) !== 'z-') continue;
      const a = C.N[i], b = C.N[i + 1], p = ponto(a, C.rb, R1.oFim + 1.8), q = ponto(b, C.rb, R1.oFim + 1.8), y0 = R1.yTopo + 0.3;
      face(E.L, [p[0], y0, p[1]], [q[0], y0, q[1]], [q[0], y0 + 6.2, q[1]], [p[0], y0 + 6.2, p[1]], [p[0], y0 + 2, p[1] - 5], 0x1f3a56);
      caixa(E.L, (p[0] + q[0]) / 2, y0 + 3.1, p[1] + 0.06, Math.abs(q[0] - p[0]) + 0.05, 0.25, 0.15, 0xd8dbdf);
      caixa(E.L, p[0], y0 + 3.1, p[1] + 0.06, 0.18, 6.2, 0.14, 0xd8dbdf);
    }
    // as coberturas das laterais (a oeste maior, com a treliça branca grande)
    const yO = RO.yTopo + 10.5, yL = RL.yTopo + 7;
    teto(E, C, 4, RO.oFim + 9, yO + 1.2, yO, 0.45, 0x30333a, so('z-'), 0x3a3e45);
    teto(E, C, 6, RL.oFim + 1, yL + 0.8, yL, 0.4, 0x30333a, so('z+'), 0x3a3e45);
    for (let i = 0; i < C.N.length - 1; i++) {
      const lado = ladoDo(C, i); if (lado !== 'z-' && lado !== 'z+') continue;
      if (lado === 'z-') { radial(E, C, i, 4.2, yO + 0.9, RO.oFim + 9, yO - 0.4, 0.3, 2.6, 0xeceef0); radial(E, C, i, RO.oFim + 0.5, yO - 2.2, RO.oFim + 0.9, RO.yTopo - 3, 0.7, 2, 0x9ca0a6); }
      else radial(E, C, i, 6.2, yL + 0.5, RL.oFim + 1, yL - 0.4, 0.25, 1.6, 0xe2e5e8);
    }
    luzesNoAnel(E, C, 4.4, yO + 0.4, 3.4, so('z-')); luzesNoAnel(E, C, 6.4, yL + 0.1, 3.4, so('z+'));
    // o prédio de vidro atrás da oeste (andares marcados) e o telão gigante na fachada de fora da leste
    const zO = -(HW + 9.5 + RO.oFim + 9), lw = 2 * HL + 6;
    caixa(E.L, 0, (yO + 1.5) / 2, zO + 2.185, lw, yO + 1.5, 4.43, { todo: 0x2f4a62, y1: 0x30333a }, 0, ['y0']);   // 3 cm atrás da borda da cobertura
    for (let y = 4; y < yO; y += 4) caixa(E.Lp, 0, y, zO - 0.05, lw + 0.1, 0.25, 0.2, 0x9fb2c2);
    for (let x = -lw / 2; x <= lw / 2; x += 6) caixa(E.L, x, (yO + 1.5) / 2, zO - 0.08, 0.25, yO + 1.5, 0.2, 0x8597a8);
    const zL = HW + 9.5 + RL.oFim + 0.6;
    caixa(E.L, 0, (yL + 0.5) / 2, zL + 0.8, lw, yL + 0.5, 1.6, 0x2a2c31, 0, ['y0']);
    face(E.Lt, [-lw * 0.42, 3, zL + 1.62], [lw * 0.42, 3, zL + 1.62], [lw * 0.42, yL - 1.5, zL + 1.62], [-lw * 0.42, yL - 1.5, zL + 1.62], [0, 10, 0], null, [[0, 0], [1, 0], [1, 1], [0, 1]]);
    // as cabeceiras: um anel só, bem em pé, sem cobertura
    const cab = so('x+', 'x-');
    const A3 = { C, o0: 0, n: 26, y0: 1.3, dy: 0.66, dz: 0.82, chao: true, filtro: cab, concreto: (r) => (r % 2 ? 0x6a6d73 : 0x62656b),
      assento: (r, i, info) => (info.lado === 'x-' ? (r % 4 < 2 ? E.c1 : E.c2) : (r % 2 ? E.c1 : tom(E.c1, 0.85))),
      torcida: { ocup: (r, i, lado) => (lado === 'x-' ? Math.min(0.98, E.ocup * 1.1) : E.ocup), emPe: (r, lado) => (lado === 'x-' ? rnd() < 0.9 : rnd() < 0.25), time: timePadrao(E, fora) }, escadas: 5, corEscada: 0xd0ccbe };
    const R3 = arquibancada(E, A3);
    muretaFaixa(E, C, -0.15, 1.25, 24, cab);
    for (let i = 0; i < C.N.length - 1; i++) {                          // o muro de trás das cabeceiras (com a faixa)
      const lado = ladoDo(C, i); if (lado !== 'x+' && lado !== 'x-') continue;
      const a = C.N[i], b = C.N[i + 1], p = ponto(a, C.rb, R3.oFim), q = ponto(b, C.rb, R3.oFim), r0 = ponto(a, C.rb, R3.oFim + 0.4), r1 = ponto(b, C.rb, R3.oFim + 0.4), yt = R3.yTopo + 1.4;
      hexa(E.L, [[p[0], 0, p[1]], [q[0], 0, q[1]], [p[0], yt, p[1]], [q[0], yt, q[1]], [r0[0], 0, r0[1]], [r1[0], 0, r1[1]], [r0[0], yt, r0[1]], [r1[0], yt, r1[1]]], 0x4a4e55, ['y0']);
    }
    const xC = HL + 9.5 + R3.oFim;
    telao(E, xC + 1.5, R3.yTopo + 7.5, 0, 16, 7, Math.PI / 2, { pernas: true });
    for (const z of [-20, -9, 2, 13]) bandeirao(E, -(HL + 9.5 - 0.35), 1.2 + 4.2, z + 3.5, 7, 4, -Math.PI / 2);
    // os cantos abertos: refletores em torre (pelos cantos aparece a cidade do entorno)
    const B = E.L;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const x = sx * (HL + 16), z = sz * (HW + 16), H = 34;
      caixa(B, x, H / 2, z, 0.8, H, 0.8, 0x595e66);
      caixa(B, x, H + 1, z, 4.5, 2.2, 0.8, 0x3a3f46, Math.atan2(-z, -x) + Math.PI / 2);
      caixa(E.Lp, x - sx * 0.3, H + 1, z - sz * 0.3, 4, 1.8, 0.5, 0xffffff, Math.atan2(-z, -x) + Math.PI / 2);
    }
    E.chaoCor = 0x26532c;
  };

  // ------------------------------------------------------------------------------------------ 4. LISTRAS (Arena MRV)
  //   Os quatro lados fechados com os cantos redondos e as cadeiras LISTRADAS nas duas cores do time (a "zebra"). A cabeceira da
  //   esquerda é um paredão de um anel só, altíssimo (a da massa); nas laterais e na outra cabeceira, dois anéis. A cobertura é
  //   translúcida (clara), com a viga grossa escura na borda, as tesouras aparentes e os dois telões nos cantos, de esguelha.
  NOMES.listras = 'Arena das Listras';
  MODELOS.listras = (E) => {
    const HL = E.HL, HW = E.HW;
    const C = caminho(HL + 9.5, HW + 9.5, 13, { nArc: 8, passo: 2.4 });
    const zebra = (r, i, info) => (Math.floor(info.s / 2.4) % 2 ? E.c1 : E.c2);
    const fora = (r, i, x, z) => x > HL + 4 && z > 14;
    const massa = (i, lado) => lado === 'x-';
    const resto = (i, lado) => lado !== 'x-';
    const tc = { ocup: (r, i, lado) => (lado === 'x-' ? Math.min(0.98, E.ocup * 1.12) : E.ocup), emPe: (r, lado) => (lado === 'x-' ? rnd() < 0.92 : rnd() < 0.22), time: timePadrao(E, fora) };
    const concreto = (r) => (r % 2 ? 0x707379 : 0x696c72);
    // a altura da cobertura (sai das contas dos anéis: 16 + 19 fileiras nas laterais; 36 na massa)
    const yT = Math.max(1.3 + 15 * 0.6 + 4.4 + 18 * 0.76, 1.3 + 35 * 0.7) + 6.5;
    // o paredão da massa (36 fileiras, um anel só)
    const RM = arquibancada(E, { C, o0: 0, n: 36, y0: 1.3, dy: 0.7, dz: 0.82, chao: true, filtro: massa, concreto, assento: zebra, torcida: tc, escadas: 5, corEscada: 0xdedad0 });
    // o resto: dois anéis
    const R1 = arquibancada(E, { C, o0: 0, n: 16, y0: 1.3, dy: 0.6, dz: 0.86, chao: true, filtro: resto, concreto, assento: zebra, torcida: tc, escadas: 5, corEscada: 0xdedad0 });
    muretaFaixa(E, C, -0.15, 1.25, 24);
    laje(E, C, R1.oFim, R1.oFim + 2, R1.yTopo + 0.3, R1.yTopo + 0.3, 0.3, 0x7e8187, resto);
    const A2 = { C, o0: R1.oFim + 2, n: 19, y0: R1.yTopo + 4.4, dy: 0.76, dz: 0.86, filtro: resto, concreto, espessura: 0.5, assento: zebra, torcida: tc, escadas: 5, corEscada: 0xdedad0 };
    const R2 = arquibancada(E, A2);
    anelSuspenso(E, A2, R2, { tex: true, periodo: 24, fascia: 1.4, parapeito: 0.7, forro: 0x54585f, corFundo: 0x3f434a, muro: 7.5 });
    // a cobertura translúcida: placas claras alternadas, a viga escura na borda e as tesouras por cima
    const oT1 = Math.max(R2.oFim, RM.oFim) + 1;
    // a parede de trás do vão entre os anéis
    for (let i = 0; i < C.N.length - 1; i++) {
      if (!resto(i, ladoDo(C, i))) continue;
      const a = C.N[i], b = C.N[i + 1], p = ponto(a, C.rb, R1.oFim + 1.95), q = ponto(b, C.rb, R1.oFim + 1.95);
      face(E.L, [p[0], R1.yTopo + 0.3, p[1]], [q[0], R1.yTopo + 0.3, q[1]], [q[0], A2.y0 - A2.dy - 1.8, q[1]], [p[0], A2.y0 - A2.dy - 1.8, p[1]], [p[0] * 2, R1.yTopo + 2, p[1] * 2], 0x2c2f35);
    }
    // o muro de trás da massa
    for (let i = 0; i < C.N.length - 1; i++) {
      if (!massa(i, ladoDo(C, i))) continue;
      const a = C.N[i], b = C.N[i + 1], p = ponto(a, C.rb, RM.oFim), q = ponto(b, C.rb, RM.oFim);
      face(E.L, [p[0], RM.yTopo, p[1]], [q[0], RM.yTopo, q[1]], [q[0], yT + 0.7, q[1]], [p[0], yT + 0.7, p[1]], [p[0] * 2, RM.yTopo, p[1] * 2], 0x3f434a);
    }
    teto(E, C, 5, oT1, yT + 0.6, yT, 0.25, (i) => (i % 2 ? 0xd9e1e4 : 0xcbd4d8), null, (i) => (i % 2 ? 0xaab5ba : 0x9eaab0));
    laje(E, C, 4.4, 5.8, yT + 0.8, yT + 0.8, 2.4, 0x23262b);
    for (let i = 0; i < C.N.length - 1; i += 2) {
      radial(E, C, i, 5, yT + 2.4, oT1 - 0.03, yT + 1.4, 0.3, 0.4, 0x2a2d32);      // a tesoura (banzo de cima)
      radial(E, C, i, 5, yT + 0.55, oT1 - 0.03, yT - 0.05, 0.3, 0.3, 0x2a2d32);          // o banzo de baixo, encostado por baixo das placas
      for (let k = 1; k < 5; k++) { const o = 5 + (oT1 - 5) * k / 5, yy = yT + 0.6 - 0.6 * k / 5; radial(E, C, i, o, yy + 1.7 - 1 * k / 5, o + 0.2, yy + 0.1, 0.18, 0.18, 0x2a2d32); }
    }
    luzesNoAnel(E, C, 4.5, yT - 0.65, 3);
    // os telões nos cantos, de esguelha
    for (const [sx, sz] of [[1, 1], [-1, -1]]) { const x = sx * (HL + 9.5 - 13 + Math.cos(Math.PI / 4) * 27), z = sz * (HW + 9.5 - 13 + Math.sin(Math.PI / 4) * 27); telao(E, x, yT - 4.6, z, 12, 6, Math.atan2(sz, sx) + Math.PI / 2 * (sx > 0 ? 1 : 1), { cabos: 3 }); }
    // por fora: listras pretas e brancas na pele do estádio
    pele(E, C, oT1 + 0.3, 0, yT + 0.4, (i) => (Math.floor(C.N[i].s / 6) % 2 ? 0x1f2125 : 0xe6e7e9));
    E.chaoCor = 0x25502b;
  };

  // ------------------------------------------------------------------------------------------ 5. FLORESTA (Arena da Amazônia)
  //   O bowl quase redondo de dois anéis, com as cadeiras em degradê (as cores do time indo de uma para a outra, como o pôr do sol),
  //   a cobertura branca com as diagonais cruzadas por baixo (a trama do cesto) e, por fora, a treliça branca de diagonais que desce
  //   da cobertura até o chão. Em volta, palmeiras e a mata.
  NOMES.floresta = 'Arena da Floresta';
  MODELOS.floresta = (E) => {
    const HL = E.HL, HW = E.HW;
    const C = caminho(HL + 11, HW + 11, 40, { nArc: 14, passo: 4 });
    const quente = mistura(E.c1, 0xf2a83a, 0.35);
    const degrade = (n0, n) => (r, i, info) => {
      const t = (n0 + r) / n + (hash(Math.floor(info.s / 3), r, 5) - 0.5) * 0.18;
      return t < 0.33 ? E.c1 : t < 0.5 ? mistura(E.c1, quente, 0.6) : t < 0.66 ? quente : t < 0.82 ? mistura(quente, E.c2, 0.5) : E.c2;
    };
    const fora = (r, i, x, z) => x < -(HL + 6) && z < -14;
    const tc = { ocup: E.ocup, emPe: (r, lado) => (lado === 'x+' ? rnd() < 0.8 : rnd() < 0.22), time: timePadrao(E, fora) };
    const concreto = (r) => (r % 2 ? 0xb9bcbf : 0xb1b4b8);
    const N1 = 17, N2 = 21, NT = N1 + N2;
    const R1 = arquibancada(E, { C, o0: 0, n: N1, y0: 1.3, dy: 0.55, dz: 0.9, chao: true, concreto, assento: degrade(0, NT), torcida: tc, escadas: 6, corEscada: 0xf0ede4 });
    muretaFaixa(E, C, -0.15, 1.25, 26);
    laje(E, C, R1.oFim, R1.oFim + 2.4, R1.yTopo + 0.3, R1.yTopo + 0.3, 0.3, 0xa9acb0);
    const A2 = { C, o0: R1.oFim + 2.4, n: N2, y0: R1.yTopo + 4.6, dy: 0.7, dz: 0.88, concreto, espessura: 0.5, assento: degrade(N1, NT), torcida: tc, escadas: 6, corEscada: 0xf0ede4 };
    const R2 = arquibancada(E, A2);
    anelSuspenso(E, A2, R2, { tex: true, periodo: 28, fascia: 1.5, parapeito: 0.7, forro: 0xc4c7ca, corFundo: 0x8e9196, muro: 6.8 });
    for (let i = 0; i < C.N.length - 1; i++) {                           // o fundo do vão entre os anéis
      const a = C.N[i], b = C.N[i + 1], p = ponto(a, C.rb, R1.oFim + 2.35), q = ponto(b, C.rb, R1.oFim + 2.35);
      face(E.L, [p[0], R1.yTopo + 0.3, p[1]], [q[0], R1.yTopo + 0.3, q[1]], [q[0], A2.y0 - A2.dy - 1.9, q[1]], [p[0], A2.y0 - A2.dy - 1.9, p[1]], [p[0] * 2, R1.yTopo + 2, p[1] * 2], 0x6c7075);
    }
    // a cobertura branca: membrana clara e, por baixo, as diagonais cruzadas da trama
    const oT0 = 7, oT1 = R2.oFim + 3, yT0 = R2.yTopo + 9, yT1 = R2.yTopo + 6.2;
    // (7.4.0) o forro numa cor só (as duas cores alternadas faziam "raios" de triângulos) e a trama por baixo sem luz
    teto(E, C, oT0, oT1, yT0, yT1, 0.35, (i) => (i % 2 ? 0xf3f3ef : 0xeeeee8), null, 0xb4b6b1);
    laje(E, C, oT0 - 0.5, oT0 + 0.7, yT0 + 0.2, yT0 + 0.2, 1.0, 0xe2e3df, null, E.Lr);   // a borda de dentro (sem luz: não fica verde)
    const NN = C.N.length - 1, yAt = (o) => yT0 + (yT1 - yT0) * (o - oT0) / (oT1 - oT0) - 0.42;
    for (let i = 0; i < NN; i += 3) {
      const j = (i + 3) % NN;
      viga(E.Lr, ponto3(C.N[i], C.rb, oT0, yAt(oT0)), ponto3(C.N[j], C.rb, oT1, yAt(oT1)), 0.45, 0xe9eae6);
      viga(E.Lr, ponto3(C.N[j], C.rb, oT0, yAt(oT0)), ponto3(C.N[i], C.rb, oT1, yAt(oT1)), 0.45, 0xe9eae6);
    }
    laje(E, C, oT1 - 0.8, oT1 + 0.3, yT1 + 0.1, yT1 + 0.1, 1.2, 0xe4e5e0);              // o anel de fora da cobertura (onde a treliça encosta)
    luzesNoAnel(E, C, oT0 + 0.5, yT0 - 0.9, 4);
    for (const s of [-1, 1]) telao(E, s * (HL + 20), yT0 - 5.3, 0, 14, 7, s > 0 ? Math.PI / 2 : -Math.PI / 2, { cabos: 3.6 });
    // por fora: a treliça do cesto (diagonais brancas cruzadas do chão até a borda da cobertura) e a pele escura atrás
    const oF = oT1 + 1.2;
    pele(E, C, oF - 0.6, 0, yT1, 0x4c5056);
    for (let i = 0; i < NN; i += 2) {
      const j = (i + 4) % NN;
      viga(E.L, ponto3(C.N[i], C.rb, oF + 2.5, 0), ponto3(C.N[j], C.rb, oF, yT1 - 0.2), 0.7, 0xf4f4f0);
      viga(E.L, ponto3(C.N[j], C.rb, oF + 2.5, 0), ponto3(C.N[i], C.rb, oF, yT1 - 0.2), 0.7, 0xeaeae4);
    }
    // a mata em volta: palmeiras e árvores (a esplanada e a cidade começam depois dela)
    E.pegada = medir(E, 30); E.bairro = 'mata'; E.semEstac = true;
    for (let k = 0; k < 46; k++) {
      const n = C.N[(k * 7) % NN], o = oF + 9 + (k % 4) * 5 + hash(k, 3, 1) * 4, p = ponto(n, C.rb, o);
      if (k % 3) arvore(E.L, p[0], p[1], 3 + hash(k, 1, 1) * 3, 1.2 + hash(k, 2, 2) * 0.8, [0x2f6a2c, 0x3a7a34, 0x2a5e2a][k % 3]); else palmeira(E.L, p[0], p[1], 7 + hash(k, 5, 5) * 4);
    }
    E.chaoCor = 0x2a5c2e;
  };

  // ------------------------------------------------------------------------------------------ 6. PÉTALAS (Beira-Rio)
  //   O bowl oval de dois anéis coberto por PÉTALAS brancas soltas (com frestas de céu entre elas) que dão a volta no estádio e,
  //   por fora, descem até o chão como folhas. As cadeiras na cor do time com a SIGLA escrita na lateral de baixo, e o rio
  //   passando do lado de fora.
  NOMES.petalas = 'Estádio das Pétalas';
  MODELOS.petalas = (E) => {
    const HL = E.HL, HW = E.HW;
    const C = caminho(HL + 11, HW + 11, 30, { nArc: 10, passo: 1.6, passoLado: { 'x+': 5, 'x-': 5, 'z-': 5 } });
    const N1 = 18, N2 = 18, sig = String(E.M.sigla || E.M.nome || 'FC').toUpperCase().slice(0, 4);
    const letras = mapaTexto(sig, 9 * sig.length, 10), comp = 9 * sig.length * 1.6, escuro = tom(E.c1, 0.8);
    const assento = (r, i, info) => {
      if (info.lado === 'z+' && r >= 3 && r < 15) { const u = (info.x + comp / 2) / comp, v = (14.5 - r) / 12; if (letras(u, v)) return E.c2; }
      return r % 3 === 0 ? escuro : E.c1;
    };
    const fora = (r, i, x, z) => x > HL + 6 && z < -12;
    const tc = { ocup: (r, i, lado) => (lado === 'z+' && r < 16 ? E.ocup * 0.7 : E.ocup), emPe: (r, lado) => (lado === 'x-' ? rnd() < 0.82 : rnd() < 0.2), time: timePadrao(E, fora) };
    const concreto = (r) => (r % 2 ? 0x8f9296 : 0x878a8f);
    const R1 = arquibancada(E, { C, o0: 0, n: N1, y0: 1.3, dy: 0.52, dz: 0.9, chao: true, concreto, assento, torcida: tc, escadas: 6, corEscada: 0xe6e2d8 });
    muretaFaixa(E, C, -0.15, 1.25, 26);
    laje(E, C, R1.oFim, R1.oFim + 2.2, R1.yTopo + 0.3, R1.yTopo + 0.3, 0.3, 0x8a8d92);
    const A2 = { C, o0: R1.oFim + 2.2, n: N2, y0: R1.yTopo + 4.4, dy: 0.72, dz: 0.9, concreto, espessura: 0.5, assento: (r) => (r % 3 === 0 ? escuro : E.c1), torcida: tc, escadas: 6, corEscada: 0xe6e2d8 };
    const R2 = arquibancada(E, A2);
    anelSuspenso(E, A2, R2, { tex: true, periodo: 28, fascia: 1.4, parapeito: 0.7, forro: 0x6e7277, corFundo: 0x5a5e64, muro: 3 });
    for (let i = 0; i < C.N.length - 1; i++) {
      const a = C.N[i], b = C.N[i + 1], p = ponto(a, C.rb, R1.oFim + 2.15), q = ponto(b, C.rb, R1.oFim + 2.15);
      face(E.L, [p[0], R1.yTopo + 0.3, p[1]], [q[0], R1.yTopo + 0.3, q[1]], [q[0], A2.y0 - A2.dy - 1.8, q[1]], [p[0], A2.y0 - A2.dy - 1.8, p[1]], [p[0] * 2, R1.yTopo + 2, p[1] * 2], 0x63676d);
    }
    // as pétalas: uma por pedaço do caminho-base (de 6 em 6 m), com fresta; cada uma sobe de fora para dentro e desce por fora até o chão
    const P = caminho(HL + 11, HW + 11, 30, { nArc: 6, passo: 6.5 });
    const oIn = 5, oTopo = R2.oFim + 4, oPe = R2.oFim + 16, yIn = R2.yTopo + 8.2, yTopo = R2.yTopo + 9.6;
    for (let i = 0; i < P.N.length - 1; i++) {
      const a = P.N[i], b = P.N[i + 1], cor = i % 2 ? 0xf4f5f6 : 0xe9ebed;
      placa(E.L, P, a, b, 0.05, 0.95, oIn, yIn, oTopo, yTopo, 0.35, cor, null, E.Lr, i % 2 ? 0x9da1a6 : 0x93979c);   // a pétala por cima da arquibancada
      placa(E.L, P, a, b, 0.05, 0.95, oTopo, yTopo, oTopo + 5, yTopo - 3, 0.35, cor, 0.86);       // a curva de fora
      placa(E.L, P, a, b, 0.25, 0.75, oTopo + 5, yTopo - 3, oPe, 0.2, 0.45, cor, 0.6);            // a perna até o chão
      const m = pontoT(a, b, 0.5, P.rb, oIn + 0.8); caixa(E.Lp, m[0], yIn - 0.75, m[1], 1.4, 0.3, 0.5, 0xffffff, Math.atan2(a.nx, a.nz) + Math.PI / 2);
      radial(E, P, i, oIn + 2, yIn - 0.3, R2.oFim + 1, yIn + (yTopo - yIn) * 0.8 - 0.3, 0.3, 0.6, 0xa9adb2);   // a viga de baixo
    }
    for (const s of [-1, 1]) telao(E, s * (HL + 19), yIn - 5, 0, 13, 6.5, s > 0 ? Math.PI / 2 : -Math.PI / 2, { cabos: 4 });
    pele(E, C, R2.oFim + 0.6, 0, R2.yTopo + 3, (i) => (i % 2 ? 0x7c8086 : 0x74787e));      // a parede de fora, atrás das pernas das pétalas
    // o rio do lado de fora (lateral de frente) e o calçadão com as árvores
    E.pegada = medir(E);
    const zR = E.pegada[1] + 34;                                          // depois da esplanada e da avenida
    const ag = new THREE.Mesh(new THREE.PlaneGeometry(1800, 150), new THREE.MeshLambertMaterial({ color: 0x3f6f8f }));
    ag.rotation.x = -Math.PI / 2; ag.position.set(0, -0.005, zR + 81); (E.extras = E.extras || []).push(ag);
    caixa(E.L, 0, 0.1, zR + 3, 900, 0.2, 6, 0xa7a191, 0, ['y0']);         // o calçadão da beira-rio
    caixa(E.L, 0, 0.45, zR + 6.1, 900, 0.5, 0.25, 0x8d8a82, 0, ['y0']);   // a mureta
    for (let x = -440; x <= 440; x += 14) arvore(E.L, x, zR + 1, 3.4, 1.1, 0x3d7a36);
    E.livre = [[-999, zR - 1, 999, zR + 157]];
    E.chaoCor = 0x2c5a2f;
  };

  // ------------------------------------------------------------------------------------------ 7. FERRADURA (Fonte Nova)
  //   O bowl de dois anéis em ferradura, aberto na cabeceira da direita: pelo vão aparecem o lago, os morros e os prédios da cidade.
  //   A cobertura de membrana branca acompanha a ferradura, presa num anel de compressão com os cabos aparentes; no vão, a praça
  //   com o telão grande em cima das pernas. As cadeiras em ondas das duas cores do time.
  NOMES.ferradura = 'Arena da Ferradura';
  MODELOS.ferradura = (E) => {
    const HL = E.HL, HW = E.HW;
    const C = caminho(HL + 10.5, HW + 10.5, 28, { nArc: 10, passo: 4 });
    const NN = C.N.length - 1;
    const meio = (i) => (C.N[i].nx + C.N[i + 1].nx) / 2;
    const ferr = (i) => meio(i) < 0.62;                                   // tudo menos a cabeceira da direita (e o fim dos cantos dela)
    const onda = (base, outra) => (r, i, info) => (r + 3 * Math.sin(info.s / 14) > 9 + 2 * Math.sin(info.s / 31) ? outra : base);
    const fora = (r, i, x, z) => x > 20 && z < -10;                       // a visitante: perto da ponta de baixo da ferradura
    const tc = { ocup: E.ocup, emPe: (r, lado) => (lado === 'x-' ? rnd() < 0.85 : rnd() < 0.2), time: timePadrao(E, fora) };
    const concreto = (r) => (r % 2 ? 0x9a9da1 : 0x929599);
    const R1 = arquibancada(E, { C, o0: 0, n: 17, y0: 1.3, dy: 0.55, dz: 0.9, chao: true, filtro: ferr, concreto, assento: onda(E.c1, tom(E.c1, 0.78)), torcida: tc, escadas: 6, corEscada: 0xe8e4da });
    muretaFaixa(E, C, -0.15, 1.25, 26, ferr);
    laje(E, C, R1.oFim, R1.oFim + 2.2, R1.yTopo + 0.3, R1.yTopo + 0.3, 0.3, 0x8e9196, ferr);
    const A2 = { C, o0: R1.oFim + 2.2, n: 20, y0: R1.yTopo + 4.4, dy: 0.72, dz: 0.88, filtro: ferr, concreto, espessura: 0.5, assento: onda(E.c2, E.c1), torcida: tc, escadas: 6, corEscada: 0xe8e4da };
    const R2 = arquibancada(E, A2);
    anelSuspenso(E, A2, R2, { tex: true, periodo: 28, fascia: 1.4, parapeito: 0.7, forro: 0x707479, corFundo: 0x60646a, muro: 6.6 });
    for (let i = 0; i < NN; i++) {
      if (!ferr(i)) continue;
      const a = C.N[i], b = C.N[i + 1], p = ponto(a, C.rb, R1.oFim + 2.15), q = ponto(b, C.rb, R1.oFim + 2.15);
      face(E.L, [p[0], R1.yTopo + 0.3, p[1]], [q[0], R1.yTopo + 0.3, q[1]], [q[0], A2.y0 - A2.dy - 1.8, q[1]], [p[0], A2.y0 - A2.dy - 1.8, p[1]], [p[0] * 2, R1.yTopo + 2, p[1] * 2], 0x666a70);
    }
    // as pontas da ferradura: (7.4.0) uma parede de concreto que fecha o perfil inteiro (os dois anéis, o vão e a fachada), em vez
    //   do corte aberto das arquibancadas; e a viga da cobertura em cima dela
    const pontas = []; for (let i = 0; i < NN; i++) if (ferr(i) && !ferr((i + 1) % NN)) pontas.push([i + 1, i]); else if (ferr(i) && !ferr((i - 1 + NN) % NN)) pontas.push([i, i + 1]);
    const yT0 = R2.yTopo + 9, yT1 = R2.yTopo + 6.4, oT0 = 6, oT1 = R2.oFim + 2.5, oF = oT1 - 0.6;
    const perfil = (o) => {                                               // a altura do perfil das arquibancadas a uma distância o
      if (o < R1.oFim) return 1.3 + Math.floor(o / 0.9) * 0.55;
      if (o < A2.o0) return A2.y0 - 0.6;
      if (o < R2.oFim) return A2.y0 + Math.floor((o - A2.o0) / A2.dz) * A2.dy;
      return yT1;
    };
    for (const [j, jd] of pontas) {
      const n = C.N[j], nd = C.N[jd];
      for (let o = -0.3; o < oF - 0.01; o += 0.9) {
        const o2 = Math.min(oF, o + 0.9), h = perfil(Math.max(0, o + 0.45)) + 0.25, d = ponto(nd, C.rb, (o + o2) / 2), m = ponto(n, C.rb, (o + o2) / 2);
        const tl = Math.hypot(m[0] - d[0], m[1] - d[1]) || 1, ex = (m[0] - d[0]) / tl * 0.03, ez = (m[1] - d[1]) / tl * 0.03;   // 3 cm para fora do corte dos degraus
        const p0 = ponto(n, C.rb, o), q0 = ponto(n, C.rb, o2), p = [p0[0] + ex, p0[1] + ez], q = [q0[0] + ex, q0[1] + ez];
        face(E.L, [p[0], 0, p[1]], [q[0], 0, q[1]], [q[0], h, q[1]], [p[0], h, p[1]], [d[0], h / 2, d[1]], o2 > R2.oFim ? 0xd7dadc : 0x8c8f94);
      }
      radial(E, C, j, oT0, yT0 + 0.6, oT1, yT1 + 0.6, 0.6, 1.4, 0xd9dcdf);   // a viga da ponta da cobertura
      radial(E, C, j, -0.3, 1.6, R1.oFim, R1.yTopo + 0.5, 0.5, 0.5, 0x6a6e74);   // a mureta inclinada da ponta (acompanha os degraus)
    }
    // a fachada de fora: lâminas claras do chão até a cobertura (a cobertura apoia nela), com os portões escuros embaixo
    for (let i = 0; i < NN; i++) {
      if (!ferr(i)) continue;
      const a = C.N[i], b = C.N[i + 1], p = ponto(a, C.rb, oF), q = ponto(b, C.rb, oF);
      face(E.L, [p[0], 0, p[1]], [q[0], 0, q[1]], [q[0], yT1 + 0.3, q[1]], [p[0], yT1 + 0.3, p[1]], [p[0] - a.nx * 5, 3, p[1] - a.nz * 5], i % 2 ? 0xdfe2e4 : 0xd2d5d8);
      radial(E, C, i, oF - 0.1, yT1 + 0.4, oF + 0.7, 0.2, 0.35, yT1 + 0.2, 0xeef0f1);   // a lâmina vertical
      if (i % 5 === 2) { const m = pontoT(a, b, 0.5, C.rb, oF + 0.05); caixa(E.L, m[0], 1.6, m[1], 3, 3.2, 0.12, 0x2a2d33, Math.atan2(a.nx, a.nz) + Math.PI / 2); }
    }
    luzesNoAnel(E, C, oF + 0.25, yT1 - 1.2, 6, ferr, [1.2, 0.18, 0.2]);   // a faixa de luz da fachada (acende de noite)
    // a cobertura de membrana e o anel de compressão com os cabos
    teto(E, C, oT0, oT1, yT0, yT1, 0.3, (i) => (i % 2 ? 0xf1f2f0 : 0xeaece9), ferr, 0xa2a5a3);
    laje(E, C, oT0 - 0.5, oT0 + 0.6, yT0 + 0.3, yT0 + 0.3, 1.1, 0xd0d3d6, ferr, E.Lr);              // o anel de tração (dentro)
    laje(E, C, oT1 - 1.2, oT1 + 0.2, yT1 + 0.7, yT1 + 0.7, 1.0, 0xc9cdd1, ferr);                    // o anel de compressão (em cima da fachada)
    for (let i = 0; i < NN; i += 2) { if (!ferr(i)) continue; radial(E, C, i, oT0 + 0.4, yT0 + 0.32, oT1 - 1, yT1 + 0.32, 0.22, 0.3, 0xc4c8cc); }   // os cabos por cima da membrana
    luzesNoAnel(E, C, oT0 + 0.4, yT0 - 1.1, 4, ferr);
    // o vão: a praça, a mureta do mirante e o telão grande em cima das pernas
    const xV = HL + 16;
    caixa(E.L, xV + 8, 0.6, 0, 16, 1.2, 2 * HW + 30, { todo: 0x8f8a7f, y1: 0xa29d91 }, 0, ['y0']);
    caixa(E.L, xV + 0.2, 1.6, 0, 0.5, 0.9, 2 * HW + 30, 0x7c8086, 0, ['y0']);
    telao(E, xV + 6, 13, 0, 22, 9, Math.PI / 2, { pernas: true });
    telao(E, -(HL + 21), yT0 - 5.3, 0, 13, 6.5, -Math.PI / 2, { cabos: 3.6 });
    // o lago (o dique) e os morros com mata lá atrás; a cidade em volta vem do entorno
    E.pegada = medir(E);
    const xL0 = xV + 18, xL1 = xV + 66, xM = xV + 92;
    const lago = new THREE.Mesh(new THREE.PlaneGeometry(xL1 - xL0, 900), new THREE.MeshLambertMaterial({ color: 0x3c7393 }));
    lago.rotation.x = -Math.PI / 2; lago.position.set((xL0 + xL1) / 2, -0.005, 0); (E.extras = E.extras || []).push(lago);
    caixa(E.L, xL0 - 2, 0.15, 0, 4, 0.3, 900, 0xa9a394, 0, ['y0']);       // a orla do lado do estádio
    for (let z = -440; z <= 440; z += 12) if (Math.abs(z) > E.pegada[1] + 30) arvore(E.L, xL0 - 2, z, 3, 1, 0x3d7a36);
    for (let k = 0; k < 17; k++) {
      const z = -220 + k * 27.5, h = 12 + hash(k, 9, 9) * 12, x = xM - 6 + hash(k, 4, 4) * 8;
      caixa(E.L, x, h / 2, z, 30, h, 30, k % 2 ? 0x4f7a3c : 0x5a8744);
      for (let t = 0; t < 3; t++) arvore(E.L, x - 9 + t * 9, z + (t - 1) * 8, h - 0.5, 1.3, 0x3d6f33);
    }
    E.livre = [[xL0 - 4, -999, xM + 18, 999]];
    E.chaoCor = 0x2b5a2e;
  };

  // ------------------------------------------------------------------------------------------ 8. CONCHA (Morumbis)
  //   A concha de concreto quase redonda e gigante: o anel de baixo com cadeiras e o anel de cima enorme, de cimento pintado em
  //   setores (as cores do time e branco) e o escudo pintado na cabeceira da direita. Sem cobertura (só a marquise da tribuna),
  //   a borda grossa de concreto com os contrafortes, as torres de luz saindo da borda e o bandeirão pendurado.
  NOMES.concha = 'Estádio da Concha';
  MODELOS.concha = (E) => {
    const HL = E.HL, HW = E.HW;
    const C = caminho(HL + 13, HW + 13, 46, { nArc: 16, passo: 4, passoLado: { 'x+': 1.3 } });
    const NN = C.N.length - 1, N2 = 30, esc = mapaEscudo(E, 30), branco = 0xe4e2dc;
    const fora = (r, i, x, z) => z > 30 && x < -10;
    const tc = (ocupK) => ({ ocup: (r, i, lado) => E.ocup * ocupK * (lado === 'x+' ? 0.55 : 1), emPe: (r, lado) => (lado === 'x-' ? rnd() < 0.85 : rnd() < 0.3), time: timePadrao(E, fora) });
    const R1 = arquibancada(E, { C, o0: 0, n: 16, y0: 1.6, dy: 0.5, dz: 0.92, chao: true, concreto: (r) => (r % 2 ? 0x9b9a95 : 0x93928d), assento: (r) => (r % 2 ? E.c1 : tom(E.c1, 0.84)), torcida: tc(1), escadas: 7, corEscada: 0xe8e4d8 });
    muretaFaixa(E, C, -0.15, 1.5, 26);
    laje(E, C, R1.oFim, R1.oFim + 2.6, R1.yTopo + 0.3, R1.yTopo + 0.3, 0.3, 0x8d8c87);
    // o anel de cima: cimento pintado (a "cadeira" é a pintura do degrau) em setores grandes; na cabeceira da direita, o escudo
    const setor = (info) => { const k = Math.floor(info.s / 34) % 3; return k === 0 ? E.c1 : k === 1 ? branco : E.c2; };
    const A2 = { C, o0: R1.oFim + 2.6, n: N2, y0: R1.yTopo + 4.6, dy: 0.66, dz: 0.88, concreto: (r) => (r % 2 ? 0xa3a29c : 0x9c9b95), espessura: 0.55,
      assento: (r, i, info) => {
        if (info.lado === 'x+' && r >= 4 && r < 28) { const lq = 22, u = (-info.z + lq / 2) / lq, v = (27.5 - r) / 24; if (u >= -0.05 && u <= 1.05) { const k = esc(u, v); return k != null ? k : branco; } }
        return tom(setor(info), 0.92);
      }, torcida: tc(0.85), escadas: 7, corEscada: 0xe8e4d8 };
    const R2 = arquibancada(E, A2);
    anelSuspenso(E, A2, R2, { tex: true, periodo: 30, fascia: 1.8, parapeito: 0.8, forro: 0x7c7b76, corFundo: 0x8a8984, muro: 2.4 });
    for (let i = 0; i < NN; i++) {
      const a = C.N[i], b = C.N[i + 1], p = ponto(a, C.rb, R1.oFim + 2.55), q = ponto(b, C.rb, R1.oFim + 2.55);
      face(E.L, [p[0], R1.yTopo + 0.3, p[1]], [q[0], R1.yTopo + 0.3, q[1]], [q[0], A2.y0 - A2.dy - 2.3, q[1]], [p[0], A2.y0 - A2.dy - 2.3, p[1]], [p[0] * 2, R1.yTopo + 2, p[1] * 2], 0x6f6e69);
    }
    // a borda grossa (a "aba" de concreto) e, por fora, os contrafortes que descem até o chão
    const oB = R2.oFim, yB = R2.yTopo + 2.4;
    laje(E, C, oB - 0.2, oB + 3.2, yB + 0.4, yB, 1.2, 0xb5b3ac);
    for (let i = 0; i < NN; i += 2) radial(E, C, i, oB + 0.5, yB - 0.4, oB + 9, 0.6, 1.0, 1.4, i % 4 ? 0xa9a7a0 : 0xb2b0a9);
    pele(E, C, oB + 0.34, 0, yB - 1, (i) => (i % 2 ? 0x8f8e88 : 0x878680));
    // a marquise da tribuna (só na lateral dos bancos)
    teto(E, C, A2.o0 + 6, oB + 2, yB + 5.5, yB + 4.5, 0.4, 0xc4c2bb, (i, lado) => lado === 'z-', 0x8a8984);
    for (let i = 0; i < NN; i++) if (ladoDo(C, i) === 'z-' && i % 3 === 0) radial(E, C, i, oB + 1.6, yB + 4.6, oB + 2, yB, 0.5, 4.6, 0xa9a7a0);
    // as torres de luz saindo da borda (8, viradas para o campo) e as cabeças com as lâmpadas
    for (let k = 0; k < 8; k++) {
      const i = Math.round((k + 0.5) * NN / 8) % NN, n = C.N[i], p = ponto(n, C.rb, oB + 1.6), H = yB + 24;
      caixa(E.L, p[0], H / 2, p[1], 1.2, H, 1.2, 0x8d9096);
      const ang = Math.atan2(n.nx, n.nz) + Math.PI / 2;
      caixa(E.L, p[0] - n.nx * 1.2, H + 1.6, p[1] - n.nz * 1.2, 7, 4, 0.9, 0x4a4e55, ang);
      for (let a = 0; a < 3; a++) for (let b = 0; b < 2; b++) {
        const lx = (a - 1) * 2.1, ly = H + 0.7 + b * 1.8;
        caixa(E.Lp, p[0] - n.nx * 1.7 + Math.cos(ang) * lx, ly, p[1] - n.nz * 1.7 + Math.sin(ang) * lx, 1.7, 1.4, 0.4, 0xffffff, ang);
      }
    }
    // o bandeirão pendurado na borda, na lateral de frente, e o telão em cima da borda na cabeceira da esquerda
    bandeirao(E, 0, yB - 0.6, HW + 13 + A2.o0 - 0.2, 24, 9, 0);
    telao(E, -(HL + 13 + oB + 1), yB + 6, 0, 16, 7.5, -Math.PI / 2, { pernas: true });
    E.chaoCor = 0x5b5d5f;
  };

  // ============================================================================================ (7.4.0) PEÇAS DOS ESTÁDIOS NOVOS
  // uma "aleta" no plano radial do nó i: um quadrilátero (o, y) com espessura esp ao longo do anel (pilar, contraforte, parede)
  //   ib/it = a borda de dentro (baixo/cima), ob/ot = a borda de fora (baixo/cima)
  function aleta(E, C, i, ib, it, ob, ot, esp, cor, L) {
    const n = C.N[i], tx = -n.nz * esp / 2, tz = n.nx * esp / 2, P = [];
    for (const q of [ib, it, ob, ot]) { const p = ponto(n, C.rb, q[0]); P.push([p[0] - tx, q[1], p[1] - tz], [p[0] + tx, q[1], p[1] + tz]); }
    hexa(L || E.L, P, cor);
  }
  // o muro de trás de um anel (do chão até h), com espessura
  function muro(E, C, o, y0, y1, cor, filtro, esp) {
    esp = esp || 0.4;
    for (let i = 0; i < C.N.length - 1; i++) {
      if (filtro && !filtro(i, ladoDo(C, i))) continue;
      const a = C.N[i], b = C.N[i + 1], p = ponto(a, C.rb, o), q = ponto(b, C.rb, o), r0 = ponto(a, C.rb, o + esp), r1 = ponto(b, C.rb, o + esp), k = typeof cor === 'function' ? cor(i) : cor;
      hexa(E.L, [[p[0], y0, p[1]], [q[0], y0, q[1]], [p[0], y1, p[1]], [q[0], y1, q[1]], [r0[0], y0, r0[1]], [r1[0], y0, r1[1]], [r0[0], y1, r0[1]], [r1[0], y1, r1[1]]], k, ['y0']);
    }
  }
  // a parede do vão entre dois anéis (a mesma conta dos modelos antigos)
  function vao(E, C, o, y0, y1, cor, filtro) {
    for (let i = 0; i < C.N.length - 1; i++) {
      if (filtro && !filtro(i, ladoDo(C, i))) continue;
      const a = C.N[i], b = C.N[i + 1], p = ponto(a, C.rb, o + 0.03), q = ponto(b, C.rb, o + 0.03);   // 3 cm atrás (o espelho dos degraus fica na frente)
      face(E.L, [p[0], y0, p[1]], [q[0], y0, q[1]], [q[0], y1, q[1]], [p[0], y1, p[1]], [p[0] * 2, y0 + 2, p[1] * 2], cor);
    }
  }
  // torre de luz: de treliça (4 pernas afinando, travessas) ou de concreto; a cabeça com as lâmpadas virada para o centro do campo
  function torreLuz(E, x, z, H, op) {
    op = op || {};
    const d = Math.hypot(x, z) || 1, dx = -x / d, dz = -z / d, a = Math.atan2(-dx, dz), ca = Math.cos(a), sa = Math.sin(a), cor = op.cor || 0x7d838b;
    if (op.concreto) { caixa(E.L, x, H / 2, z, 1.4, H, 1.4, cor); caixa(E.L, x, H * 0.2, z, 2.2, H * 0.4, 2.2, cor); }
    else {
      const w = op.base || 2.6, t = 0.4;
      for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) viga(E.L, [x + sx * w / 2, 0, z + sz * w / 2], [x + sx * t, H, z + sz * t], 0.2, cor);
      for (let y = 3; y < H - 1; y += 3.2) {
        const k = w / 2 + (t - w / 2) * y / H;
        caixa(E.L, x, y, z + k, 2 * k, 0.14, 0.14, cor); caixa(E.L, x, y, z - k, 2 * k, 0.14, 0.14, cor);
        caixa(E.L, x + k, y, z, 0.14, 0.14, 2 * k, cor); caixa(E.L, x - k, y, z, 0.14, 0.14, 2 * k, cor);
      }
    }
    const hx = x + dx * 0.7, hz = z + dz * 0.7, cw = op.cabeca || 8;
    caixa(E.L, hx, H + 2, hz, cw + 0.6, 4.6, 0.7, 0x353a41, a);
    const nc = Math.round(cw / 2.1);
    for (let i = 0; i < nc; i++) for (let j = 0; j < 3; j++) {
      const lx = (i - (nc - 1) / 2) * 2.05, px = hx + ca * lx + dx * 0.4, pz = hz + sa * lx + dz * 0.4;
      caixa(E.Lp, px, H + 0.5 + j * 1.45, pz, 1.6, 1.1, 0.25, 0xffffff, a);
    }
  }
  // um prédio de verdade (tribuna, sede, fachada): caixa com as janelas (acendem de noite), alinhado aos eixos
  function predioA(E, x, z, w, h, d, cor, op) {
    op = op || {};
    caixa(E.L, x, h / 2, z, w, h, d, { todo: cor, y1: op.teto || tom(cor, 0.8) }, 0, ['y0']);
    const passo = op.andar || 3.4;
    for (let y = op.terreo || 2.2; y < h - 0.8; y += passo) caixa(E.Lp, x, y, z, w + 0.1, op.janela || 1.1, d + 0.1, op.corJanela || 0xc6d2de, 0, ['y0', 'y1']);
  }
  // as cores das cadeiras em blocos alternados ao longo do anel (os setores)
  const setores = (E, m, cores) => (r, i, info) => cores[Math.floor(info.s / m) % cores.length];

  // ------------------------------------------------------------------------------------------ 9. LAGOA (Mineirão)
  //   O oval gigante de dois anéis com a cobertura branca fininha em anel, apoiada nos PÓRTICOS de concreto que dão a volta por
  //   fora (o desenho mais famoso do estádio: os pilares largos embaixo e finos em cima). Em volta, a esplanada e a LAGOA do lado
  //   de frente, com o calçadão, os barquinhos e a igrejinha de abóbadas.
  NOMES.lagoa = 'Estádio da Lagoa';
  MODELOS.lagoa = (E) => {
    const HL = E.HL, HW = E.HW;
    const C = caminho(HL + 12, HW + 13, 44, { nArc: 14, passo: 4 });
    const NN = C.N.length - 1;
    const fora = (r, i, x, z) => x < -(HL + 6) && z > 10;
    const tc = { ocup: E.ocup, emPe: (r, lado) => (lado === 'x+' ? rnd() < 0.8 : rnd() < 0.22), time: timePadrao(E, fora) };
    const cad = (r, i, info) => (hash(Math.floor(info.s / 5), r >> 1, 13) < 0.07 ? 0xf2f2ee : r % 2 ? E.c1 : tom(E.c1, 0.86));
    const concreto = (r) => (r % 2 ? 0xa9a9a3 : 0xa2a29c);
    const R1 = arquibancada(E, { C, o0: 0, n: 18, y0: 1.3, dy: 0.5, dz: 0.92, chao: true, concreto, assento: cad, torcida: tc, escadas: 7, corEscada: 0xe6e2d6 });
    muretaFaixa(E, C, -0.15, 1.25, 28);
    laje(E, C, R1.oFim, R1.oFim + 2.6, R1.yTopo + 0.3, R1.yTopo + 0.3, 0.3, 0x96968f);
    const A2 = { C, o0: R1.oFim + 2.6, n: 24, y0: R1.yTopo + 4.8, dy: 0.66, dz: 0.88, concreto, espessura: 0.5, assento: cad, torcida: tc, escadas: 7, corEscada: 0xe6e2d6 };
    const R2 = arquibancada(E, A2);
    anelSuspenso(E, A2, R2, { tex: true, periodo: 30, fascia: 1.5, parapeito: 0.7, forro: 0x7a7a74, corFundo: 0x8a8a84, muro: 2.6 });
    vao(E, C, R1.oFim + 2.55, R1.yTopo + 0.3, A2.y0 - A2.dy - 1.9, 0x6f6f69);
    // a cobertura: um anel branco fino por cima do anel de cima, com a borda de dentro e as luzes
    const oT0 = A2.o0 + 5, oT1 = R2.oFim + 5.5, yT = R2.yTopo + 6.5;
    teto(E, C, oT0, oT1, yT + 0.5, yT, 0.4, (i) => (i % 2 ? 0xf2f3f1 : 0xebece9), null, 0xb8bab6);
    laje(E, C, oT0 - 0.3, oT0 + 0.7, yT + 0.6, yT + 0.6, 0.9, 0xe3e4e0, null, E.Lr);
    luzesNoAnel(E, C, oT0 + 0.4, yT - 0.15, 4);
    for (const s of [-1, 1]) telao(E, s * (HL + 25), yT - 5, 0, 15, 7.5, s > 0 ? Math.PI / 2 : -Math.PI / 2, { cabos: 4.2 });
    // por fora: a pele escura com as faixas das rampas (acendem de noite) e os PÓRTICOS de concreto
    const oP = R2.oFim + 1.2;
    pele(E, C, oP - 0.3, 0, yT - 0.2, 0x6d6d68);
    for (let y = 4.5; y < yT - 2; y += 6.2) laje(E, C, oP - 0.35, oP + 0.6, y, y, 0.35, 0x8a8a84);
    luzesNoAnel(E, C, oP + 0.1, 3.2, 7, null, [2.6, 0.5, 0.2]);
    for (let i = 0; i < NN; i += 2) aleta(E, C, i, [oP, 0], [oP, yT + 0.4], [oP + 6.5, 0], [oP + 1.3, yT + 0.4], 1.1, i % 4 ? 0xdbdad3 : 0xd2d1ca);
    E.chaoCor = 0x2c5a30; E.corPatio = 0x9a958a;
    // a lagoa do lado de frente (z+), depois da avenida: o calçadão, os barquinhos e a igrejinha
    E.pegada = medir(E);
    const zL = E.pegada[1] + 34;
    const ag = new THREE.Mesh(new THREE.PlaneGeometry(1800, 260), new THREE.MeshLambertMaterial({ color: 0x3b6e8c }));
    ag.rotation.x = -Math.PI / 2; ag.position.set(0, -0.005, zL + 131); (E.extras = E.extras || []).push(ag);
    caixa(E.L, 0, 0.1, zL + 3, 900, 0.2, 6, 0xa7a191, 0, ['y0']);
    caixa(E.L, 0, 0.45, zL + 6.1, 900, 0.5, 0.25, 0x8d8a82, 0, ['y0']);
    for (let x = -440; x <= 440; x += 12) if (hash(x, 3, 3) < 0.8) (hash(x, 1, 9) < 0.3 ? palmeira(E.L, x, zL + 1, 6 + hash(x, 2, 2) * 3) : arvore(E.L, x, zL + 1, 3.2, 1.1, 0x3d7a36));
    for (let k = 0; k < 5; k++) {                                         // os barquinhos à vela
      const x = -120 + k * 62 + hash(k, 7, 7) * 20, z = zL + 30 + hash(k, 8, 8) * 70;
      caixa(E.L, x, 0.35, z, 4.2, 0.7, 1.6, 0xf2f2ee); caixa(E.L, x, 3, z, 0.15, 4.6, 0.15, 0x8a8f96); caixa(E.L, x + 0.9, 2.6, z, 1.7, 3.2, 0.08, k % 2 ? 0xf6f2e6 : E.c1);
    }
    const xi = -70, zi = zL + 18;                                         // a igrejinha: quatro abóbadas brancas e o painel azul
    caixa(E.L, xi, 0.25, zi, 26, 0.5, 12, 0xbdb6a6, 0, ['y0']);
    for (let k = 0; k < 4; k++) {
      const w = k ? 5 : 9, cx = xi - 9 + k * 6 + (k ? 3 : 0), h = k ? 4.5 : 7;
      for (let j = 0; j <= 6; j++) { const a = j / 6 * Math.PI, y = Math.sin(a) * h, x = cx + Math.cos(a) * w / 2; caixa(E.L, x, 0.5 + y / 2, zi, 1.1, y + 0.4, 9, 0xf4f4f0, 0, ['y0']); }
    }
    caixa(E.L, xi + 8, 2.4, zi - 4.6, 7, 3.6, 0.3, 0x2f5fa8);
    E.livre = [[-999, zL - 1, 999, zL + 262]];
  };

  // ------------------------------------------------------------------------------------------ 10. HUMAITÁ (Arena do Grêmio)
  //   A arena moderna de cantos redondos: o anel de baixo inteiro e, atrás do gol da esquerda, a AVALANCHE (a geral sem cadeira,
  //   todo mundo em pé e apertado); a faixa de camarotes de vidro, o anel de cima, a cobertura clara com a treliça escura na borda
  //   e, por fora, a fachada em faixas horizontais prateadas e na cor do time.
  NOMES.humaita = 'Arena do Humaitá';
  MODELOS.humaita = (E) => {
    const HL = E.HL, HW = E.HW;
    const C = caminho(HL + 9, HW + 9, 16, { nArc: 6, passo: 4 });
    const NN = C.N.length - 1;
    const fora = (r, i, x, z) => x > HL + 5 && z < -10;
    const aval = (lado) => lado === 'x-';
    const tc = { ocup: (r, i, lado) => (aval(lado) && r < 20 ? 0.99 : E.ocup), emPe: (r, lado) => (aval(lado) ? true : rnd() < 0.2), time: timePadrao(E, fora) };
    const azulEsc = tom(E.c1, 0.78), concreto = (r) => (r % 2 ? 0x7d8086 : 0x767980);
    const cad = (r, i, info) => (aval(info.lado) ? null : r % 2 ? E.c1 : azulEsc);
    const R1 = arquibancada(E, { C, o0: 0, n: 20, y0: 1.3, dy: 0.56, dz: 0.86, chao: true, concreto: (r, j, lado) => (aval(lado) ? (r % 2 ? 0x9a9da2 : 0x8f9297) : concreto(r)), assento: cad, torcida: tc, escadas: 7, corEscada: 0xdedbd0, espaco: 0.62 });
    muretaFaixa(E, C, -0.15, 1.3, 26);
    for (const z of [-22, -11, 0, 11, 22]) bandeirao(E, -(HL + 9 - 0.3), 1.25 + 4.4, z + 3.6, 6.4, 4.2, -Math.PI / 2);   // os bandeirões da avalanche
    // os camarotes (vidro escuro e montantes)
    const oC = R1.oFim, yC0 = R1.yTopo + 0.4, yC1 = yC0 + 3.4;
    laje(E, C, oC, oC + 2.4, yC0, yC0, 0.35, 0x80848b);
    vao(E, C, oC + 2.4, yC0, yC1, 0x1d3550);
    for (let i = 0; i < NN; i += 2) radial(E, C, i, oC + 2.3, yC1, oC + 2.5, yC1, 0.18, yC1 - yC0, 0xe2e5e8);
    const A2 = { C, o0: oC + 2.4, n: 22, y0: yC1 + 1.4, dy: 0.74, dz: 0.86, concreto, espessura: 0.5, assento: (r) => (r % 2 ? E.c1 : azulEsc), torcida: tc, escadas: 7, corEscada: 0xdedbd0 };
    const R2 = arquibancada(E, A2);
    anelSuspenso(E, A2, R2, { tex: true, periodo: 26, fascia: 1.3, parapeito: 0.7, forro: 0x54585f, corFundo: 0x43474e, muro: 7 });
    // a cobertura clara, a borda (treliça escura) e as luzes
    const oT0 = 2.5, oT1 = R2.oFim + 1.5, yT = R2.yTopo + 7.2;
    teto(E, C, oT0, oT1, yT + 1.1, yT, 0.3, (i) => (i % 2 ? 0xe6eaec : 0xdde2e5), null, 0xaeb5ba);
    laje(E, C, oT0 - 0.4, oT0 + 1.6, yT + 1.4, yT + 1.4, 1.8, 0x2b2e34);
    for (let i = 0; i < NN; i += 2) { radial(E, C, i, oT0 + 1, yT + 2.6, oT1, yT + 1.6, 0.25, 0.3, 0x2b2e34); radial(E, C, i, oT0 + 1, yT + 1.2, oT1, yT + 0.1, 0.25, 0.3, 0x2b2e34, E.Lr); }
    luzesNoAnel(E, C, oT0 + 0.3, yT - 0.5, 3);
    for (const s of [-1, 1]) telao(E, s * (HL + 18), yT - 4.4, 0, 14, 7, s > 0 ? Math.PI / 2 : -Math.PI / 2, { cabos: 3.4 });
    // a fachada: faixas horizontais prateadas e na cor do time, com a fresta escura do saguão embaixo
    const oF = oT1 + 0.6, hF = yT + 1.2, prata = 0xc8ccd0;
    for (let i = 0; i < NN; i++) {
      const a = C.N[i], b = C.N[i + 1], p = ponto(a, C.rb, oF), q = ponto(b, C.rb, oF), den = [p[0] - a.nx * 5, 3, p[1] - a.nz * 5];
      face(E.L, [p[0], 0, p[1]], [q[0], 0, q[1]], [q[0], 4.2, q[1]], [p[0], 4.2, p[1]], den, 0x22262c);
      let y = 4.2, k = 0;
      while (y < hF) { const y2 = Math.min(hF, y + (k % 2 ? 2.2 : 3.4)); face(E.L, [p[0], y, p[1]], [q[0], y, q[1]], [q[0], y2, q[1]], [p[0], y2, p[1]], den, k % 2 ? E.c1 : (i % 2 ? prata : 0xd2d6d9)); y = y2; k++; }
    }
    luzesNoAnel(E, C, oF + 0.15, 2.4, 5, null, [2.2, 0.3, 0.2]);
    E.chaoCor = 0x284f2c;
  };

  // ------------------------------------------------------------------------------------------ 11. VILA (Vila Belmiro)
  //   O estádio pequeno e apertado no meio do bairro: as quatro arquibancadas coladas no gramado (os cantos abertos), a social com
  //   a marquise e o prédio branco de janelas em arco, o placar antigo em cima da cabeceira e as casas logo atrás dos muros.
  NOMES.vila = 'Estádio da Vila';
  MODELOS.vila = (E) => {
    const HL = E.HL, HW = E.HW;
    const C = caminho(HL + 6, HW + 6, 1, { nArc: 2, passo: 3 });
    const so = (...l) => (i, lado) => l.includes(lado);
    const fora = (r, i, x, z, lado) => lado === 'x+';
    const tc = (emPe) => ({ ocup: E.ocup, emPe: () => rnd() < emPe, time: timePadrao(E, fora) });
    const branco = 0xf1f1ec, pinta = (r) => (Math.floor(r / 2) % 2 ? E.c1 : branco);   // a geral pintada em faixas
    // a social (z-): 12 fileiras com cadeiras e a marquise
    const RS = arquibancada(E, { C, o0: 0, n: 12, y0: 1.2, dy: 0.5, dz: 0.85, chao: true, filtro: so('z-'), concreto: (r) => (r % 2 ? 0xcfcfc8 : 0xc6c6bf), assento: (r) => (r % 2 ? E.c1 : branco), torcida: tc(0.15), escadas: 8, corEscada: 0xe0dccf });
    // a lateral de frente (z+): 15 fileiras, geral pintada
    const RL = arquibancada(E, { C, o0: 0, n: 15, y0: 1.2, dy: 0.55, dz: 0.85, chao: true, filtro: so('z+'), concreto: pinta, assento: null, torcida: tc(0.7), escadas: 8, corEscada: 0xe0dccf });
    // as cabeceiras: a da esquerda maior; a da direita (visitante) baixinha, com o placar antigo em cima
    const RE = arquibancada(E, { C, o0: 0, n: 13, y0: 1.2, dy: 0.55, dz: 0.85, chao: true, filtro: so('x-'), concreto: pinta, assento: null, torcida: tc(0.85), escadas: 6, corEscada: 0xe0dccf });
    const RD = arquibancada(E, { C, o0: 0, n: 9, y0: 1.2, dy: 0.55, dz: 0.85, chao: true, filtro: so('x+'), concreto: (r) => (r % 2 ? 0xbdbdb6 : 0xb4b4ad), assento: null, torcida: tc(0.5), escadas: 6, corEscada: 0xe0dccf });
    muretaFaixa(E, C, -0.15, 1.15, 22);
    // os muros de trás (brancos com a barra na cor do time)
    for (const [R, l] of [[RS, 'z-'], [RL, 'z+'], [RE, 'x-'], [RD, 'x+']]) { muro(E, C, R.oFim, 0, R.yTopo + 1.3, branco, so(l), 0.35); muro(E, C, R.oFim + 0.36, 0.8, 2.2, E.c1, so(l), 0.05); }
    // a marquise da social (concreto, com as colunas na frente) e o prédio branco de janelas em arco atrás
    const yM = RS.yTopo + 4.2;
    teto(E, C, 2.5, RS.oFim + 0.4, yM + 0.5, yM, 0.35, 0xdedcd5, so('z-'), 0x9c9a94);
    for (let i = 0; i < C.N.length - 1; i++) if (ladoDo(C, i) === 'z-' && i % 3 === 0) radial(E, C, i, RS.oFim - 0.2, yM, RS.oFim + 0.2, yM, 0.35, yM, 0xe6e4de);
    luzesNoAnel(E, C, 2.8, yM - 0.3, 4, so('z-'));
    const zP = -(HW + 6 + RS.oFim + 5.5), wP = 2 * HL - 10, hP = yM + 2;
    caixa(E.L, 0, hP / 2, zP, wP, hP, 10, { todo: branco, y1: 0xb9b5aa }, 0, ['y0']);
    for (let x = -wP / 2 + 3; x < wP / 2 - 2; x += 4.2) {
      caixa(E.L, x, 1.5, zP - 5.03, 2.4, 3, 0.1, 0x2a2d33);                                       // as portas em arco do térreo
      caixa(E.L, x, 3.1, zP - 5.03, 1.6, 0.4, 0.1, 0x2a2d33);
      for (let y = 6; y < hP - 1.5; y += 3.6) caixa(E.Lp, x, y, zP - 5.03, 1.5, 1.8, 0.1, 0xeed9a0);   // as janelas
    }
    caixa(E.L, 0, hP - 0.6, zP - 5.08, wP, 0.6, 0.12, E.c1);                                      // a faixa do alto
    bandeirao(E, 0, hP - 1.4, zP - 5.15, 6, 5, Math.PI);
    // o placar antigo em cima da cabeceira da direita
    const xPl = HL + 6 + RD.oFim + 1;
    telao(E, xPl, RD.yTopo + 7, 0, 12, 5, Math.PI / 2, { pernas: true, moldura: 0x2a3138 });
    // as quatro torres de luz nos cantos abertos
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) torreLuz(E, sx * (HL + 12), sz * (HW + 12), 32, { concreto: true, cor: 0xb9bbbd, cabeca: 7 });
    E.chaoCor = 0x2a582e; E.corPatio = 0x8c877c;
    E.esplanada = 3; E.bairro = 'bairro'; E.semEstac = true; E.chaoAte = [HL + 9, HW + 9];
  };

  // ------------------------------------------------------------------------------------------ 12. ARCOS (Nilton Santos)
  //   O retângulo fechado de dois anéis com a cobertura reta em volta e os QUATRO ARCOS amarelos por cima, um em cada lado, com
  //   os tirantes segurando a cobertura. Cadeiras na cor do time com cinza e a fachada de concreto com os rasgos verticais.
  NOMES.arcos = 'Estádio dos Arcos';
  MODELOS.arcos = (E) => {
    const HL = E.HL, HW = E.HW;
    const C = caminho(HL + 9, HW + 9, 6, { nArc: 3, passo: 4 });
    const NN = C.N.length - 1;
    const fora = (r, i, x, z) => x < -(HL + 6) && z < -8;
    const tc = { ocup: E.ocup, emPe: (r, lado) => (lado === 'x+' ? rnd() < 0.8 : rnd() < 0.2), time: timePadrao(E, fora) };
    const cinza = 0x8f939a, cad = (r, i, info) => (Math.floor(info.s / 7) % 3 === 2 ? cinza : r % 2 ? E.c1 : tom(E.c1, 0.85));
    const concreto = (r) => (r % 2 ? 0x8a8c90 : 0x83858a);
    const R1 = arquibancada(E, { C, o0: 0, n: 17, y0: 1.3, dy: 0.55, dz: 0.88, chao: true, concreto, assento: cad, torcida: tc, escadas: 7, corEscada: 0xdcd8cc });
    muretaFaixa(E, C, -0.15, 1.25, 24);
    laje(E, C, R1.oFim, R1.oFim + 2.2, R1.yTopo + 0.3, R1.yTopo + 0.3, 0.3, 0x7d8085);
    const A2 = { C, o0: R1.oFim + 2.2, n: 20, y0: R1.yTopo + 4.4, dy: 0.7, dz: 0.88, concreto, espessura: 0.5, assento: cad, torcida: tc, escadas: 7, corEscada: 0xdcd8cc };
    const R2 = arquibancada(E, A2);
    anelSuspenso(E, A2, R2, { tex: true, periodo: 26, fascia: 1.4, parapeito: 0.7, forro: 0x5e6268, corFundo: 0x4f5359, muro: 6.5 });
    vao(E, C, R1.oFim + 2.15, R1.yTopo + 0.3, A2.y0 - A2.dy - 1.8, 0x5f6368);
    // a cobertura reta e clara
    const oT0 = 4, oT1 = R2.oFim + 2, yT = R2.yTopo + 7;
    teto(E, C, oT0, oT1, yT + 0.6, yT, 0.35, (i) => (i % 2 ? 0xe9ebec : 0xe1e4e6), null, 0xa9aeb3);
    laje(E, C, oT0 - 0.4, oT0 + 0.8, yT + 0.7, yT + 0.7, 1.2, 0xd5d8db, null, E.Lr);
    luzesNoAnel(E, C, oT0 + 0.4, yT - 0.7, 3.4);                                        // as luzes penduradas logo abaixo da borda (não entram nela)
    for (const s of [-1, 1]) telao(E, s * (HL + 16), yT - 4.5, 0, 14, 7, s > 0 ? Math.PI / 2 : -Math.PI / 2, { cabos: 3.6 });
    // a fachada: concreto com os rasgos verticais escuros
    const oF = oT1 + 0.3;
    pele(E, C, oF, 0, yT + 0.4, (i) => (i % 2 ? 0x9c9fa3 : 0x95989c));
    for (let i = 0; i < NN; i += 2) radial(E, C, i, oF + 0.05, yT - 2, oF + 0.1, yT - 2, 0.6, yT - 4, 0x30343a);
    // OS QUATRO ARCOS: cada um sobe dos dois cantos do lado, por fora da cobertura, e segura a borda com os tirantes
    const amarelo = 0xf2c230, ex = HL + 9 + oF + 3, ez = HW + 9 + oF + 3, yA = yT + 24;
    const arco = (pA, pB, fora2) => {                                     // pA/pB: as bases [x, z]; fora2: para onde o arco "olha"
      const N = 18, P = [];
      for (let k = 0; k <= N; k++) { const t = k / N, y = 4 * t * (1 - t) * yA; P.push([pA[0] + (pB[0] - pA[0]) * t, y, pA[1] + (pB[1] - pA[1]) * t]); }
      for (let k = 0; k < N; k++) viga(E.L, P[k], P[k + 1], 2.1, amarelo);
      for (let k = 3; k <= N - 3; k += 2) { const p = P[k]; if (p[1] > yT + 2) viga(E.L, [p[0], p[1] - 1, p[2]], [p[0] - fora2[0] * 3.5, yT + 0.7, p[2] - fora2[1] * 3.5], 0.18, 0xdfe2e5); }
    };
    arco([-ex, ez], [ex, ez], [0, 1]); arco([ex, -ez], [-ex, -ez], [0, -1]); arco([ex, ez], [ex, -ez], [1, 0]); arco([-ex, -ez], [-ex, ez], [-1, 0]);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) caixa(E.L, sx * ex, 2, sz * ez, 5, 4, 5, 0xb9bbbd);   // os pés dos arcos
    E.chaoCor = 0x2a5530;
  };

  // ------------------------------------------------------------------------------------------ 13-15. OS ESTÁDIOS DO INTERIOR
  //   Pequenos e do jeito do interior: a tribuna coberta (com as cabines de imprensa em cima), a lateral de frente, as cabeceiras de
  //   geral pintadas nas cores do time e as torres de luz de treliça (ou as luzes na cobertura). Três variações:
  //     caipira .. Estádio Caipira (Leão Caipira): telhado de zinco na tribuna, o resto descoberto, cantos abertos, torres de treliça
  //     taboao ... Estádio do Taboão (Touro): reformado, as duas laterais cobertas com o telhado na cor do time, cabeceiras baixas
  //     oeste .... Arena do Oeste (Verdão do Oeste): fechada nos quatro lados, cobertura em volta toda com a treliça branca
  function interior(E, v) {
    const HL = E.HL, HW = E.HW;
    const C = caminho(HL + v.recuo, HW + v.recuo, v.rb, { nArc: v.rb > 3 ? 5 : 2, passo: 3.5 });
    const NN = C.N.length - 1, so = (...l) => (i, lado) => l.includes(lado);
    const fora = (r, i, x, z, lado) => lado === 'x+' && z < 6;
    const tc = (emPe, oc) => ({ ocup: E.ocup * (oc || 1), emPe: () => rnd() < emPe, time: timePadrao(E, fora) });
    const branco = 0xf0f0ea, geral = (r) => (Math.floor(r / 3) % 2 ? E.c1 : E.c2);
    const fecha = (lado) => (v.cantos ? true : !lado.startsWith('c'));
    const trib = (i, lado) => lado === 'z-' || (v.cantos && (lado === 'c+-' || lado === 'c--'));
    // a tribuna (z-), a lateral de frente (z+) e as cabeceiras
    const RT = arquibancada(E, { C, o0: 0, n: v.nTrib, y0: 1.3, dy: 0.55, dz: 0.86, chao: true, filtro: trib, concreto: (r) => (r % 2 ? 0xb1b1aa : 0xa9a9a2), assento: (r) => (r % 2 ? E.c1 : branco), torcida: tc(0.15), escadas: 7, corEscada: 0xe2ded2 });
    const lat = (i, lado) => lado === 'z+' || (v.cantos && (lado === 'c++' || lado === 'c-+'));
    const RL = arquibancada(E, { C, o0: 0, n: v.nLat, y0: 1.3, dy: 0.55, dz: 0.86, chao: true, filtro: lat, concreto: v.cadLat ? (r) => (r % 2 ? 0xb1b1aa : 0xa9a9a2) : geral, assento: v.cadLat ? (r) => (r % 2 ? E.c1 : tom(E.c1, 0.85)) : null, torcida: tc(0.6), escadas: 7, corEscada: 0xe2ded2 });
    const RC = arquibancada(E, { C, o0: 0, n: v.nCab, y0: 1.3, dy: 0.55, dz: 0.86, chao: true, filtro: so('x-', 'x+'), concreto: geral, assento: null, torcida: tc(0.8, 0.9), escadas: 6, corEscada: 0xe2ded2 });
    muretaFaixa(E, C, -0.15, 1.2, 22, (i, lado) => fecha(lado));
    for (const [R, f] of [[RT, trib], [RL, lat], [RC, so('x-', 'x+')]]) muro(E, C, R.oFim, 0, R.yTopo + 1.2, (i) => (i % 2 ? branco : 0xe6e6df), f, 0.35);
    // as coberturas
    const cobre = (R, f, cor, baixo) => {
      const y = R.yTopo + 4.2;
      teto(E, C, v.balanco, R.oFim + 0.6, y + 0.8, y, 0.3, cor, f, baixo);
      for (let i = 0; i < NN; i++) if (f(i, ladoDo(C, i)) && i % 3 === 0) radial(E, C, i, R.oFim - 0.15, y, R.oFim + 0.25, y, 0.3, y, 0x7d838b);   // as colunas de trás
      if (v.trelica) for (let i = 0; i < NN; i += 2) if (f(i, ladoDo(C, i))) radial(E, C, i, v.balanco + 0.3, y + 2.2, R.oFim + 0.4, y + 1.2, 0.2, 0.25, 0xeceeef);
      if (v.luzNoTeto) luzesNoAnel(E, C, v.balanco + 0.4, y + 0.4, 3.2, f);
      return y;
    };
    const yTr = cobre(RT, trib, v.corTeto, 0x8a8f95);
    if (v.cobreLat) cobre(RL, lat, v.corTeto, 0x8a8f95);
    if (v.cobreCab) cobre(RC, so('x-', 'x+'), v.corTeto, 0x8a8f95);
    // as cabines de imprensa em cima da tribuna
    const zc = -(HW + v.recuo + RT.oFim - 1.5);
    caixa(E.L, 0, yTr + 2.4, zc, 26, 3.2, 3, { todo: 0xdedbd2, z1: 0x26364a }, 0, ['y0']);
    caixa(E.Lp, 0, yTr + 2.6, zc + 1.53, 24, 1.4, 0.08, 0xeed9a0);
    // as torres de luz (cantos) ou nada (a luz está na cobertura)
    if (!v.luzNoTeto) for (const sx of [-1, 1]) for (const sz of [-1, 1]) torreLuz(E, sx * (HL + v.recuo + 6), sz * (HW + v.recuo + 6), v.torre, { cor: v.corTorre || 0x8a9097, cabeca: 7 });
    // o placar e a sede do clube atrás da tribuna (com a faixa na cor do time)
    telao(E, HL + v.recuo + RC.oFim + 1, RC.yTopo + 6, 0, 10, 5, Math.PI / 2, { pernas: true });
    const zs = -(HW + v.recuo + RT.oFim + 9);
    predioA(E, -HL * 0.5, zs, 30, 9, 10, 0xe8e4da, { corJanela: 0xeed9a0 });
    caixa(E.L, -HL * 0.5, 8.4, zs - 5.06, 30, 1.2, 0.12, E.c1);
    bandeirao(E, -HL * 0.5, 7.6, zs - 5.15, 5, 4, Math.PI);
    E.chaoCor = 0x2c5a30; E.corPatio = 0x8e897e;
    E.esplanada = v.esplanada; E.bairro = 'bairro';
  }
  NOMES.caipira = 'Estádio Caipira';
  MODELOS.caipira = (E) => interior(E, { recuo: 7, rb: 1, nTrib: 16, nLat: 12, nCab: 9, balanco: 3, corTeto: (i) => (i % 2 ? 0xb9c0c6 : 0xb0b7bd), torre: 34, esplanada: 10 });
  NOMES.taboao = 'Estádio do Taboão';
  MODELOS.taboao = (E) => interior(E, { recuo: 7.5, rb: 2, nTrib: 18, nLat: 16, nCab: 8, cadLat: true, cobreLat: true, balanco: 2.5, corTeto: (i) => (i % 2 ? tom(E.c1, 0.9) : tom(E.c1, 0.8)), trelica: true, torre: 36, corTorre: 0xb5b9bd, esplanada: 12 });
  NOMES.oeste = 'Arena do Oeste';
  MODELOS.oeste = (E) => interior(E, { recuo: 8, rb: 10, cantos: true, nTrib: 20, nLat: 18, nCab: 14, cadLat: true, cobreLat: true, cobreCab: true, balanco: 2, corTeto: (i) => (i % 2 ? 0xe4e7e9 : 0xdadee1), trelica: true, luzNoTeto: true, esplanada: 14 });

  // ------------------------------------------------------------------------------------------ 16. COLINA (São Januário)
  //   O estádio antigo em ferradura, aberto na cabeceira da direita, de um anel só de concreto: a social coberta pela marquise, a
  //   geral pintada nas cores do time e, atrás da social, a FACHADA histórica (o prédio claro de arcos, janelas e a torre do meio
  //   com o escudo). No vão aparece o morro com as casinhas coloridas umas por cima das outras.
  NOMES.colinaE = 'Estádio da Colina';
  MODELOS.colinaE = (E) => {
    const HL = E.HL, HW = E.HW;
    const C = caminho(HL + 8, HW + 8, 22, { nArc: 8, passo: 4 });
    const NN = C.N.length - 1;
    const ferr = (i) => (C.N[i].nx + C.N[i + 1].nx) / 2 < 0.62;
    const soc = (i, lado) => ferr(i) && lado === 'z-';
    const fora = (r, i, x, z) => x > 20 && z > 8;
    const tc = { ocup: E.ocup, emPe: (r, lado) => (lado === 'x-' ? rnd() < 0.9 : lado === 'z-' ? rnd() < 0.12 : rnd() < 0.5), time: timePadrao(E, fora) };
    const branco = 0xf0efe8, geral = (r) => (Math.floor(r / 4) % 2 ? E.c1 : branco);
    const R = arquibancada(E, { C, o0: 0, n: 24, y0: 1.3, dy: 0.6, dz: 0.88, chao: true, filtro: (i) => ferr(i), concreto: (r, j, lado) => (lado === 'z-' ? (r % 2 ? 0xbdbbb2 : 0xb5b3aa) : geral(r)), assento: (r, i, info) => (info.lado === 'z-' ? (r % 2 ? E.c1 : tom(E.c1, 0.82)) : null), torcida: tc, escadas: 7, corEscada: 0xe3dfd2 });
    muretaFaixa(E, C, -0.15, 1.25, 24, (i) => ferr(i));
    muro(E, C, R.oFim, 0, R.yTopo + 1.4, (i) => (i % 2 ? 0xe9e6dc : 0xe1ded4), (i) => ferr(i), 0.4);
    // as pontas da ferradura fechadas (parede inclinada acompanhando os degraus)
    for (let i = 0; i < NN; i++) {
      const fim = ferr(i) && !ferr((i + 1) % NN), ini = ferr(i) && !ferr((i - 1 + NN) % NN);
      if (!fim && !ini) continue;
      const j = fim ? i + 1 : i;
      aleta(E, C, j, [-0.2, 0], [-0.2, 1.4], [R.oFim + 0.4, 0], [R.oFim + 0.4, R.yTopo + 1.4], 0.5, 0xd8d5ca);
    }
    // a marquise da social (concreto com as costelas por cima)
    const yM = R.yTopo + 5;
    teto(E, C, 4, R.oFim + 0.5, yM + 0.9, yM, 0.4, 0xd2cfc6, soc, 0x96938b);
    for (let i = 0; i < NN; i++) if (soc(i, ladoDo(C, i))) { if (i % 2 === 0) radial(E, C, i, 4.2, yM + 1.9, R.oFim + 0.5, yM + 1.2, 0.35, 1.2, 0xc4c1b8); if (i % 4 === 0) radial(E, C, i, R.oFim + 0.02, yM, R.oFim + 0.45, yM, 0.45, yM, 0xd6d3ca); }
    luzesNoAnel(E, C, 4.4, yM - 0.3, 3.5, soc);
    // A FACHADA HISTÓRICA atrás da social: dois andares de arcos e janelas, a cornija, a torre do meio com o escudo
    const zF = -(HW + 8 + R.oFim + 7), wF = 2 * HL + 12, hF = 13, creme = 0xeadfc4, friso = 0xf6f2e6;
    caixa(E.L, 0, hF / 2, zF, wF, hF, 12, { todo: creme, y1: 0xb98a5a }, 0, ['y0']);
    const zFr = zF - 6.03;
    for (let x = -wF / 2 + 3.5; x < wF / 2 - 3; x += 5) {
      for (let k = 0; k <= 4; k++) { const a = k / 4 * Math.PI, w = 0.9; caixa(E.L, x + Math.cos(a) * 1.3, 3.2 + Math.sin(a) * 1.0, zFr, w, 0.9, 0.12, 0x2b2620); }   // o arco do térreo
      caixa(E.L, x, 1.6, zFr, 2.6, 3.2, 0.1, 0x2b2620);
      caixa(E.Lp, x, 8.2, zFr, 1.5, 2.4, 0.1, 0xeed9a0); caixa(E.L, x, 9.6, zFr - 0.05, 2, 0.35, 0.18, friso);   // a janela de cima com o frontão
      caixa(E.L, x + 2.5, hF / 2, zFr - 0.05, 0.5, hF, 0.25, friso);                                         // as pilastras
    }
    caixa(E.L, 0, hF - 0.28, zFr - 0.1, wF + 0.4, 0.64, 0.4, friso); caixa(E.L, 0, 5.4, zFr - 0.08, wF + 0.2, 0.35, 0.3, friso);   // a cornija passa 4 cm do telhado; o friso, 10 cm das pontas
    const hT = hF + 9;                                                    // a torre do meio
    caixa(E.L, 0, hT / 2, zF - 1.5, 14, hT, 10, { todo: creme, y1: 0xb98a5a }, 0, ['y0']);
    caixa(E.L, 0, hT + 1.2, zF - 1.5, 9, 2.4, 6, friso);
    bandeirao(E, 0, hT - 1.5, zF - 6.58, 7, 7, Math.PI);
    caixa(E.L, 0, 2.2, zF - 6.6, 4.5, 4.4, 0.12, 0x2b2620);
    // o morro no vão (atrás da cabeceira aberta): os patamares de terra e as casinhas coloridas
    E.pegada = medir(E);
    const xM = E.pegada[0] + 30;
    for (let k = 0; k < 7; k++) {
      const x0 = xM + k * 9, h = 3 + k * 3.2;
      caixa(E.L, x0 + 4.5, h / 2, 0, 9.5, h, 220 - k * 0.2, k % 2 ? 0x6f7f4a : 0x667645, 0, ['y0']);   // cada patamar 10 cm mais curto nas pontas (as frentes não se sobrepõem)
      for (let z = -104; z <= 104; z += 6.5) {
        if (hash(k, z, 4) < 0.18) { arvore(E.L, x0 + 4.5, z, h + 0.2, 1, 0x3f7a35); continue; }
        const hc = 3 + (hash(k, z, 5) < 0.4 ? 3 : 0), c = CASAS[Math.floor(hash(k, z, 6) * CASAS.length)];
        caixa(E.L, x0 + 4 + hash(k, z, 7), h + hc / 2, z, 6, hc, 5.4, { todo: c, y1: 0x9a6b4a }, 0, ['y0']);
        caixa(E.Lp, x0 + 4 + hash(k, z, 7) - 3.02, h + 1.5, z, 0.08, 0.9, 1.2, 0xeed9a0);
      }
    }
    E.livre = [[xM - 6, -116, xM + 70, 116]];
    E.chaoCor = 0x2b5a2f; E.corPatio = 0x8f8a7f;
  };

  // ------------------------------------------------------------------------------------------ 17. TOCA (Barradão)
  //   O "caldeirão" cavado no morro: um anel só de concreto, alto e inteiro, pintado em faixas nas cores do time (cadeira só na
  //   tribuna, com a marquise), e por fora o barranco de terra e grama subindo até quase a borda — o estádio parece enterrado na
  //   mata. As torres de luz em cima do barranco.
  NOMES.toca = 'Estádio da Toca';
  MODELOS.toca = (E) => {
    const HL = E.HL, HW = E.HW;
    const C = caminho(HL + 8, HW + 8, 30, { nArc: 10, passo: 4 });
    const NN = C.N.length - 1;
    const trib = (i, lado) => lado === 'z-';
    const fora = (r, i, x, z) => x > HL && z > 10;
    const tc = { ocup: E.ocup, emPe: (r, lado) => (lado === 'z-' ? rnd() < 0.15 : rnd() < 0.75), time: timePadrao(E, fora) };
    const faixa = (r) => (Math.floor(r / 3) % 3 === 0 ? E.c2 : Math.floor(r / 3) % 3 === 1 ? E.c1 : tom(E.c1, 0.8));
    const R = arquibancada(E, { C, o0: 0, n: 30, y0: 1.3, dy: 0.58, dz: 0.86, chao: true, concreto: (r, j, lado) => (lado === 'z-' ? (r % 2 ? 0xb3b1aa : 0xaba9a2) : faixa(r)), assento: (r, i, info) => (info.lado === 'z-' ? (r % 2 ? E.c1 : E.c2) : null), torcida: tc, escadas: 6, corEscada: 0xe6e2d6 });
    muretaFaixa(E, C, -0.15, 1.25, 24);
    muro(E, C, R.oFim, 0, R.yTopo + 1.1, 0xa29f96, null, 0.4);
    // a marquise da tribuna
    const yM = R.yTopo + 4.6;
    teto(E, C, 6, R.oFim + 0.6, yM + 0.7, yM, 0.35, 0xc7c9cc, trib, 0x8f9398);
    for (let i = 0; i < NN; i++) if (trib(i, ladoDo(C, i)) && i % 3 === 0) radial(E, C, i, R.oFim + 0.02, yM, R.oFim + 0.38, yM, 0.4, yM - R.yTopo + 1, 0x8c9198);
    luzesNoAnel(E, C, 6.4, yM - 0.3, 3.5, trib);
    telao(E, 0, R.yTopo + 5.5, HW + 8 + R.oFim + 1, 14, 6, Math.PI, { pernas: true });
    // o barranco: patamares de grama descendo da borda até o chão (e a terra vermelha nos degraus)
    const oB = R.oFim + 0.4;
    for (let k = 0; k < 9; k++) {
      const o0 = oB + k * 3.2, y = (R.yTopo + 0.6) * (1 - k / 9);
      laje(E, C, o0, o0 + 3.2, y, y, y, (i) => ((i + k) % 5 ? 0x5a8a3e : 0x6c5a3a), null);
    }
    const morro = (d) => (R.yTopo + 0.6) * (1 - Math.min(9, Math.floor(d / 3.2)) / 9);   // a altura do barranco a d metros da borda
    for (let i = 0; i < NN; i += 3) { const d = 4 + hash(i, 1, 1) * 22, p = ponto(C.N[i], C.rb, oB + d); arvore(E.L, p[0], p[1], morro(d) + 2.5 + hash(i, 2, 2) * 2, 1 + hash(i, 3, 3) * 0.5, 0x3a7232); }
    for (let k = 0; k < 4; k++) { const n = C.N[Math.round((k + 0.5) * NN / 4) % NN], p = ponto(n, C.rb, oB + 6); torreLuz(E, p[0], p[1], morro(6) + 22, { cor: 0x8a9097 }); }
    E.chaoCor = 0x2b5a2f; E.corPatio = 0x5a8a3e; E.bairro = 'mata'; E.semEstac = true;
    E.pegada = medir(E, 6);
  };

  // ------------------------------------------------------------------------------------------ 18. ALTO (Couto Pereira)
  //   O clássico de concreto: a social de dois anéis com a MARQUISE pesada de concreto (as vigas aparentes por cima), a lateral de
  //   frente e a cabeceira da esquerda de um anel só, altas e descobertas, e a cabeceira da direita de dois anéis. As cadeiras em
  //   blocos na cor do time e branco; por fora, o muro branco com as faixas na cor do time e as torres de luz de concreto.
  NOMES.alto = 'Estádio do Alto';
  MODELOS.alto = (E) => {
    const HL = E.HL, HW = E.HW;
    const C = caminho(HL + 8, HW + 8, 10, { nArc: 4, passo: 4 });
    const NN = C.N.length - 1, so = (...l) => (i, lado) => l.includes(lado);
    const fora = (r, i, x, z) => x > HL + 4 && z > 8;
    const tc = { ocup: E.ocup, emPe: (r, lado) => (lado === 'x-' ? rnd() < 0.85 : rnd() < 0.25), time: timePadrao(E, fora) };
    const branco = 0xf1f1ec, blocos = setores(E, 10, [E.c1, E.c1, branco]);
    const concreto = (r) => (r % 2 ? 0xa6a6a0 : 0x9f9f99);
    const dois = (i, lado) => lado === 'z-' || lado === 'x+' || lado === 'c+-';
    const um = (i, lado) => !dois(i, lado);
    // um anel só (a lateral de frente, a cabeceira da esquerda e os cantos dela): alto e descoberto
    const RU = arquibancada(E, { C, o0: 0, n: 30, y0: 1.3, dy: 0.6, dz: 0.86, chao: true, filtro: um, concreto, assento: blocos, torcida: tc, escadas: 6, corEscada: 0xe4e0d4 });
    // dois anéis (a social e a cabeceira da direita)
    const R1 = arquibancada(E, { C, o0: 0, n: 16, y0: 1.3, dy: 0.55, dz: 0.86, chao: true, filtro: dois, concreto, assento: blocos, torcida: tc, escadas: 6, corEscada: 0xe4e0d4 });
    muretaFaixa(E, C, -0.15, 1.25, 24);
    laje(E, C, R1.oFim, R1.oFim + 2, R1.yTopo + 0.3, R1.yTopo + 0.3, 0.3, 0x8f8f89, dois);
    const A2 = { C, o0: R1.oFim + 2, n: 18, y0: R1.yTopo + 4.4, dy: 0.72, dz: 0.86, filtro: dois, concreto, espessura: 0.5, assento: blocos, torcida: tc, escadas: 6, corEscada: 0xe4e0d4 };
    const R2 = arquibancada(E, A2);
    anelSuspenso(E, A2, R2, { tex: true, periodo: 24, fascia: 1.4, parapeito: 0.7, forro: 0x7a7a74, corFundo: 0x8c8c86, muro: 2 });
    vao(E, C, R1.oFim + 1.95, R1.yTopo + 0.3, A2.y0 - A2.dy - 1.8, 0x6e6e68, dois);
    muro(E, C, RU.oFim, 0, RU.yTopo + 1.3, (i) => (i % 2 ? branco : 0xe8e8e2), um, 0.4);
    muro(E, C, R2.oFim + 0.3, 0, R2.yTopo + 2.2, (i) => (i % 2 ? branco : 0xe8e8e2), dois, 0.4);
    for (const [o, f] of [[RU.oFim + 0.41, um], [R2.oFim + 0.71, dois]]) { muro(E, C, o, 3, 4.4, E.c1, f, 0.06); muro(E, C, o, 5.2, 5.8, E.c1, f, 0.06); }   // as faixas na cor do time
    // A MARQUISE da social: a laje de concreto em balanço e as vigas grossas por cima
    const soc = so('z-'), yM = R2.yTopo + 5.5;
    teto(E, C, 6, R2.oFim + 0.6, yM + 0.6, yM, 0.5, 0xc9c8c2, soc, 0x8e8d88);
    for (let i = 0; i < NN; i++) if (soc(i, ladoDo(C, i)) && i % 2 === 0) { aleta(E, C, i, [6, yM + 0.5], [6, yM + 0.8], [R2.oFim + 0.6, yM + 0.6], [R2.oFim + 0.6, yM + 3.6], 0.6, 0xbdbcb6); radial(E, C, i, R2.oFim + 0.32, yM, R2.oFim + 0.68, yM, 0.6, yM - R2.yTopo, 0xbdbcb6); }
    luzesNoAnel(E, C, 6.4, yM - 0.4, 3.5, soc);
    telao(E, -(HL + 8 + RU.oFim + 1.5), RU.yTopo + 6, 0, 13, 6, -Math.PI / 2, { pernas: true });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) torreLuz(E, sx * (HL + 21), sz * (HW + 21), 40, { concreto: true, cor: 0xc4c4be, cabeca: 8 });
    E.chaoCor = 0x2b5a2f; E.corPatio = 0x8f8a7f;
  };

  // ------------------------------------------------------------------------------------------ 19. FURACÃO (Arena da Baixada)
  //   A caixa fechada e em pé: quatro lados retos colados no campo, dois anéis bem inclinados com os camarotes entre eles e a
  //   cobertura que fecha quase tudo — com o TETO RETRÁTIL aberto (os trilhos atravessando o campo e as placas recolhidas em
  //   cima das cabeceiras). Grama sintética e, por fora, o vidro escuro com as lâminas na cor do time.
  NOMES.baixada = 'Arena do Furacão';
  MODELOS.baixada = (E) => {
    const HL = E.HL, HW = E.HW;
    const C = caminho(HL + 7.5, HW + 7.5, 3, { nArc: 2, passo: 4 });
    const NN = C.N.length - 1;
    const fora = (r, i, x, z) => x < -(HL + 4) && z > 10;
    const tc = { ocup: E.ocup, emPe: (r, lado) => (lado === 'x+' ? rnd() < 0.85 : rnd() < 0.25), time: timePadrao(E, fora) };
    const esc = tom(E.c1, 0.75), concreto = (r) => (r % 2 ? 0x5e6168 : 0x575a61);
    const cad = (r) => (r % 3 === 0 ? 0x1f2125 : r % 2 ? E.c1 : esc);
    const R1 = arquibancada(E, { C, o0: 0, n: 16, y0: 1.3, dy: 0.62, dz: 0.84, chao: true, concreto, assento: cad, torcida: tc, escadas: 7, corEscada: 0xd6d2c6 });
    muretaFaixa(E, C, -0.15, 1.3, 24);
    const oC = R1.oFim, yC0 = R1.yTopo + 0.4, yC1 = yC0 + 3.4;
    laje(E, C, oC, oC + 2.2, yC0, yC0, 0.35, 0x6c7078);
    vao(E, C, oC + 2.2, yC0, yC1, 0x1b2a3c);
    for (let i = 0; i < NN; i += 2) radial(E, C, i, oC + 2.1, yC1, oC + 2.3, yC1, 0.16, yC1 - yC0, 0xdfe2e5);
    const A2 = { C, o0: oC + 2.2, n: 22, y0: yC1 + 1.3, dy: 0.84, dz: 0.84, concreto, espessura: 0.5, assento: cad, torcida: tc, escadas: 7, corEscada: 0xd6d2c6 };
    const R2 = arquibancada(E, A2);
    anelSuspenso(E, A2, R2, { tex: true, periodo: 24, fascia: 1.3, parapeito: 0.7, forro: 0x464a51, corFundo: 0x35383e, muro: 6.5 });
    // a cobertura (quase até a linha do campo) e o teto retrátil aberto
    const oT0 = -1.5, oT1 = R2.oFim + 1, yT = R2.yTopo + 6.5;
    teto(E, C, oT0, oT1, yT + 0.6, yT, 0.4, 0x3a3e45, null, 0x2f3238);
    laje(E, C, oT0 - 0.3, oT0 + 0.6, yT + 0.65, yT + 0.65, 1.0, 0x8f949b);
    luzesNoAnel(E, C, oT0 + 0.3, yT - 0.4, 3);
    const xR = HL + 7.5 + oT0, zR = HW + 7.5 + oT0;
    for (const s of [-1, 1]) {
      caixa(E.L, 0, yT + 3.2, s * (zR + 1.5), 2 * xR + 30, 3.2, 1.6, 0x9aa0a8);                       // o trilho (a viga que atravessa)
      for (let x = -xR; x <= xR; x += 7) viga(E.L, [x, yT + 1.7, s * (zR + 1.5)], [x + 3.5, yT + 4.7, s * (zR + 1.5)], 0.25, 0x9aa0a8);
      caixa(E.L, s * (xR + 1), yT + 2.6, 0, 18, 2.2, 2 * zR + 2, { todo: 0x4a5f73, y1: 0x8fa3b5 });   // as placas recolhidas em cima da cabeceira
      for (let z = -zR + 3; z < zR; z += 6) caixa(E.L, s * (xR + 1), yT + 3.75, z, 18.2, 0.2, 0.25, 0xd5d9dd);
    }
    for (const s of [-1, 1]) telao(E, s * (HL + 10), yT - 4, 0, 12, 6, s > 0 ? Math.PI / 2 : -Math.PI / 2, { cabos: 3 });
    // a fachada: vidro escuro e as lâminas na cor do time
    const oF = oT1 + 0.4;
    pele(E, C, oF, 0, yT + 1, 0x1f2a36);
    for (let i = 0; i < NN; i++) radial(E, C, i, oF + 0.1, yT + 1.2, oF + 1.1, yT + 1.2, 0.35, yT + 1.2, i % 2 ? E.c1 : esc);
    for (let y = 5; y < yT; y += 4.4) luzesNoAnel(E, C, oF + 0.05, y, 4.5, null, [3, 0.2, 0.1]);
    E.chaoCor = 0x255229; E.corPatio = 0x7f7a70;
  };

  // ------------------------------------------------------------------------------------------ 20. MANGUEIRAL (Mangueirão)
  //   O oval grande de concreto de dois anéis, descoberto, com a cobertura de lona branca só sobre as laterais (presa nos mastros),
  //   as RAMPAS EM ESPIRAL nos quatro cantos de fora e as mangueiras enormes fazendo túnel nas avenidas em volta.
  NOMES.mangueiral = 'Estádio do Mangueiral';
  MODELOS.mangueiral = (E) => {
    const HL = E.HL, HW = E.HW;
    const C = caminho(HL + 13, HW + 15, 44, { nArc: 14, passo: 4 });
    const NN = C.N.length - 1;
    const fora = (r, i, x, z) => x > HL + 8 && z < -6;
    const tc = { ocup: E.ocup, emPe: (r, lado) => (lado === 'x-' ? rnd() < 0.85 : rnd() < 0.25), time: timePadrao(E, fora) };
    const branco = 0xf0f0ea, cad = (r, i, info) => (Math.floor(info.s / 14) % 4 === 3 ? branco : r % 2 ? E.c1 : tom(E.c1, 0.86));
    const concreto = (r) => (r % 2 ? 0xa5a49d : 0x9e9d96);
    const R1 = arquibancada(E, { C, o0: 0, n: 17, y0: 1.4, dy: 0.5, dz: 0.92, chao: true, concreto, assento: cad, torcida: tc, escadas: 7, corEscada: 0xe6e2d6 });
    muretaFaixa(E, C, -0.15, 1.3, 28);
    laje(E, C, R1.oFim, R1.oFim + 2.6, R1.yTopo + 0.3, R1.yTopo + 0.3, 0.3, 0x93928b);
    const A2 = { C, o0: R1.oFim + 2.6, n: 26, y0: R1.yTopo + 4.6, dy: 0.64, dz: 0.9, concreto, espessura: 0.55, assento: (r, i, info) => tom(cad(r, i, info), 0.95), torcida: tc, escadas: 7, corEscada: 0xe6e2d6 };
    const R2 = arquibancada(E, A2);
    anelSuspenso(E, A2, R2, { tex: true, periodo: 30, fascia: 1.6, parapeito: 0.8, forro: 0x7d7c76, corFundo: 0x8d8c86, muro: 2.4 });
    vao(E, C, R1.oFim + 2.55, R1.yTopo + 0.3, A2.y0 - A2.dy - 2.2, 0x6f6e69);
    // a borda de concreto e a pele de fora com as faixas
    const oB = R2.oFim + 0.3, yB = R2.yTopo + 2.4;
    laje(E, C, oB - 0.2, oB + 1.8, yB + 0.3, yB, 0.9, 0xb3b2ab);
    pele(E, C, oB + 1.5, 0, yB - 0.6, (i) => (i % 2 ? 0x8d8c86 : 0x86857f));
    for (let y = 5; y < yB - 2; y += 6) laje(E, C, oB + 1.4, oB + 2.4, y, y, 0.4, 0xa9a8a1);
    // a lona branca sobre as laterais, presa em mastros inclinados
    const lat = (i, lado) => lado === 'z+' || lado === 'z-';
    const yL = yB + 9;
    teto(E, C, A2.o0 + 4, oB + 2, yL, yL - 3.5, 0.3, (i) => (i % 2 ? 0xf6f6f3 : 0xecece8), lat, 0xb7b9b6);
    for (let i = 0; i < NN; i++) if (lat(i, ladoDo(C, i)) && i % 3 === 0) { radial(E, C, i, oB + 1.43, yL + 5, oB + 2.2, yL + 5, 0.4, yL + 5, 0xd9dcdf); viga(E.L, ponto3(C.N[i], C.rb, oB + 1.8, yL + 5), ponto3(C.N[i], C.rb, A2.o0 + 4.2, yL + 0.2), 0.12, 0x50555c); }
    luzesNoAnel(E, C, A2.o0 + 4.4, yL - 0.4, 3.4, lat);
    // nas cabeceiras: as luzes em postes em cima da borda
    for (let i = 0; i < NN; i += 4) { if (lat(i, ladoDo(C, i))) continue; const n = C.N[i], p = ponto(n, C.rb, oB + 0.8), a = Math.atan2(n.nx, n.nz) + Math.PI / 2; caixa(E.L, p[0], yB + 4, p[1], 0.5, 8, 0.5, 0x8d9096); caixa(E.L, p[0], yB + 8.4, p[1], 4.4, 1.6, 0.6, 0x3a3f46, a); caixa(E.Lp, p[0] - n.nx * 0.35, yB + 8.4, p[1] - n.nz * 0.35, 4, 1.2, 0.3, 0xffffff, a); }
    for (const s of [-1, 1]) telao(E, s * (HL + 13 + oB - 2), yB + 5.5, 0, 15, 7, s > 0 ? Math.PI / 2 : -Math.PI / 2, { pernas: true });
    // AS RAMPAS EM ESPIRAL nos quatro cantos: o cilindro do miolo e a rampa dando voltas até a borda
    for (let k = 0; k < 4; k++) {
      const idx = []; C.N.forEach((m, j) => { if (m.canto === k && j < NN) idx.push(j); });
      const n = C.N[idx[idx.length >> 1]], c = ponto(n, C.rb, oB + 13), rr = 8, H = yB - 1;
      caixa(E.L, c[0], H / 2, c[1], 4.5, H, 4.5, 0xbab9b2);
      for (let t = 0; t < H; t += 0.5) {
        const a = t * 0.42, x = c[0] + Math.cos(a) * rr, z = c[1] + Math.sin(a) * rr;
        caixa(E.L, x, t + 0.25, z, 3.2, 0.5, 2.6, (t * 2) % 4 < 2 ? 0xc9c8c1 : 0xc1c0b9, a + Math.PI / 2);
        if ((t * 2) % 3 === 0) caixa(E.L, c[0] + Math.cos(a) * (rr + 1.4), t + 1.1, c[1] + Math.sin(a) * (rr + 1.4), 2.6, 1.2, 0.15, 0x9a9993, a + Math.PI / 2);   // o guarda-corpo
      }
      viga(E.L, [c[0] - n.nx * rr, H, c[1] - n.nz * rr], ponto3(n, C.rb, oB + 1.6, H), 2.4, 0xbab9b2);   // a passarela até a borda
    }
    E.chaoCor = 0x2b5a2f; E.corPatio = 0x8c877c; E.mangueiras = true;
  };

  // ============================================================================================ (7.4.0) O ENTORNO: A CIDADE EM VOLTA
  //   Depois do modelo, em volta do estádio: a ESPLANADA de concreto (com as árvores e o estacionamento atrás da tribuna), a
  //   AVENIDA que dá a volta (asfalto, faixa amarela, calçadas com meio-fio, postes acesos e carros estacionados) e a CIDADE em
  //   quarteirões até onde a névoa deixa ver: perto, casas e comércio (2 e 3 andares, toldos, caixas d'água); no meio, prédios;
  //   longe, as torres. Uns quarteirões viram praça (grama e árvores). As janelas são do lote das lâmpadas: acendem de noite.
  //   O modelo diz: E.pegada = [ax, az] (a metade do retângulo que o estádio ocupa), E.livre = [[x0, z0, x1, z1], ...] (o que já
  //   usou: lago, rio, morros — ali não entra nada) e E.bairro: 'cidade' (padrão), 'bairro' (casas baixas) ou 'mata' (árvores).
  const CASAS = [0xd4c6a8, 0xdccfb2, 0xc4b08a, 0xd2b087, 0xd9be72, 0xb4c7cf, 0xd2a08e, 0xb9cbab, 0xd8d5cc, 0xb09cc0, 0x9fbad0, 0xc98f62];
  const PREDIOS = [0xc2bdb1, 0xadb1b5, 0x9fa4ab, 0xcbc4b6, 0xb6aa95, 0x92a0ad, 0xc4bcab, 0x8893a0];
  const TORRES = [0x7f93a8, 0x8ea2b5, 0xa8b3bd, 0x6d8197, 0xc0c6cc, 0x94a0ad];
  const CARROS = [0xc8202e, 0xf4f4f0, 0x1c1c1f, 0x8c9199, 0x1f5bc4, 0xf2c230, 0x2f7a3a, 0xbfc3c8, 0x7a1f2b, 0x3a4a5a];
  const TOLDOS = [0xc8202e, 0x1f5bc4, 0x2f7a3a, 0xf29a1e, 0x7a1f2b, 0x14234a];
  function entorno(E) {
    if (E.semEntorno) return;
    const L = E.L, Lp = E.Lp, [ax, az] = E.pegada || [E.HL + 44, E.HW + 44], livre = E.livre || [], bairro = E.bairro || 'cidade';
    const salva = semente; semente = (semente ^ 0x5bd1e995) >>> 0 || 7;    // o entorno tem a sua própria sequência (não mexe no estádio)
    const bate = (x0, z0, x1, z1) => livre.some(([a, b, c, d]) => x0 < c && x1 > a && z0 < d && z1 > b);
    // piso em ladrilhos (pula o que bate nas áreas livres)
    const piso = (x0, z0, x1, z1, y, cor, passo) => {
      passo = passo || 24;
      for (let x = x0; x < x1 - 0.01; x += passo) for (let z = z0; z < z1 - 0.01; z += passo) {
        const xa = x, xb = Math.min(x1, x + passo), za = z, zb = Math.min(z1, z + passo);
        if (bate(xa, za, xb, zb)) continue;
        caixa(L, (xa + xb) / 2, y / 2, (za + zb) / 2, xb - xa, y, zb - za, typeof cor === 'function' ? cor(xa, za) : cor, 0, ['y0']);
      }
    };
    const anel = (o0, o1, y, cor, passo) => {                                      // um anel retangular em volta da pegada
      piso(-(ax + o1), az + o0, ax + o1, az + o1, y, cor, passo); piso(-(ax + o1), -(az + o1), ax + o1, -(az + o0), y, cor, passo);
      piso(ax + o0, -(az + o0), ax + o1, az + o0, y, cor, passo); piso(-(ax + o1), -(az + o0), -(ax + o0), az + o0, y, cor, passo);
    };
    const P = E.esplanada != null ? E.esplanada : 16, AV = 12, CAL = 4;           // esplanada (o modelo pode apertar: E.esplanada), avenida e calçada (metros)
    anel(-3, P - 0.6, 0.1, (x, z) => ((Math.floor(x / 12) + Math.floor(z / 12)) & 1 ? 0xa39e93 : 0x9c978c), 12);   // até o meio-fio (sem dividir a parede com ele)
    anel(P, P + AV, 0.06, 0x3b3e43, 24);
    anel(P + AV, P + AV + CAL, 0.2, 0xa8a294, 12);
    anel(P - 0.6, P, 0.22, 0x9b968c, 24);                                         // o meio-fio do lado da esplanada
    // a faixa amarela no meio da avenida (tracejada) e as faixas de pedestre nos quatro meios
    const m = P + AV / 2;
    for (let x = -(ax + m); x < ax + m; x += 7) for (const s of [-1, 1]) if (!bate(x, s * (az + m) - 1, x + 3.5, s * (az + m) + 1)) caixa(L, x + 1.75, 0.075, s * (az + m), 3.5, 0.02, 0.25, 0xe8c23a);
    for (let z = -(az + m); z < az + m; z += 7) for (const s of [-1, 1]) if (!bate(s * (ax + m) - 1, z, s * (ax + m) + 1, z + 3.5)) caixa(L, s * (ax + m), 0.075, z + 1.75, 0.25, 0.02, 3.5, 0xe8c23a);
    for (const s of [-1, 1]) for (let k = -4; k <= 4; k++) {
      if (!bate(k * 1.2 - 0.4, s * (az + P) - 1, k * 1.2 + 0.4, s * (az + P + AV) + 1)) caixa(L, k * 1.2, 0.08, s * (az + m), 0.6, 0.02, AV - 1, 0xf2f2ee);
      if (!bate(s * (ax + P) - 1, k * 1.2 - 0.4, s * (ax + P + AV) + 1, k * 1.2 + 0.4)) caixa(L, s * (ax + m), 0.08, k * 1.2, AV - 1, 0.02, 0.6, 0xf2f2ee);
    }
    // as árvores da esplanada e os postes da calçada
    const ao = (x, z, h, s, cor) => { if (!bate(x - 2, z - 2, x + 2, z + 2)) arvore(L, x, z, h, s, cor); };
    const poste = (x, z) => {
      if (bate(x - 1, z - 1, x + 1, z + 1)) return;
      caixa(L, x, 4.3, z, 0.25, 8.6, 0.25, 0x55595f);
      caixa(L, x, 8.6, z, 1.6, 0.25, 0.4, 0x3d4046); caixa(Lp, x, 8.4, z, 1.2, 0.18, 0.3, 0xfff3c4);
    };
    // as árvores da esplanada (E.mangueiras: as mangueiras grandes e escuras, mais juntas)
    const mg = !!E.mangueiras, passoA = mg ? 9 : 13, arv = () => (mg ? [4 + rnd() * 1.5, 1.6 + rnd() * 0.5, [0x2d5a26, 0x27502a, 0x335f2b][Math.floor(rnd() * 3)]] : [2.6 + rnd() * 1.6, 0.9 + rnd() * 0.4, [0x3f7a35, 0x4a8a3c, 0x356c2e][Math.floor(rnd() * 3)]]);
    if (P >= 8) {
      for (let x = -(ax + P - 3); x <= ax + P - 3; x += passoA) for (const s of [-1, 1]) ao(x, s * (az + P - 3), ...arv());
      for (let z = -(az + P - 3); z <= az + P - 3; z += passoA) for (const s of [-1, 1]) ao(s * (ax + P - 3), z, ...arv());
    }
    if (mg) for (let x = -(ax + P + AV + 2); x <= ax + P + AV + 2; x += passoA) for (const s of [-1, 1]) ao(x, s * (az + P + AV + 2), ...arv());   // o túnel de mangueiras da avenida
    const pc = P + AV + CAL / 2;
    for (let x = -(ax + pc); x <= ax + pc; x += 18) for (const s of [-1, 1]) poste(x, s * (az + pc));
    for (let z = -(az + pc) + 9; z <= az + pc; z += 18) for (const s of [-1, 1]) poste(s * (ax + pc), z);
    // os carros estacionados na beira da avenida (do lado da cidade)
    const carro = (x, z, ang) => {
      const c = CARROS[Math.floor(rnd() * CARROS.length)];
      caixa(L, x, 0.65, z, 4.2, 0.9, 1.85, c, ang); caixa(L, x - Math.cos(ang) * 0.2, 1.4, z - Math.sin(ang) * 0.2, 2.2, 0.65, 1.7, tom(c, 0.7), ang);
    };
    const pk = P + AV - 1.4;
    for (let x = -(ax + P); x < ax + P; x += 6) for (const s of [-1, 1]) if (rnd() < 0.42 && !bate(x - 3, s * (az + pk) - 2, x + 3, s * (az + pk) + 2)) carro(x, s * (az + pk), 0);
    for (let z = -(az + P); z < az + P; z += 6) for (const s of [-1, 1]) if (rnd() < 0.42 && !bate(s * (ax + pk) - 2, z - 3, s * (ax + pk) + 2, z + 3)) carro(s * (ax + pk), z, Math.PI / 2);
    // o estacionamento: atrás da tribuna (lado z-), na esplanada — vagas pintadas e carros
    if (!E.semEstac && P >= 14) for (let x = -(ax - 10); x <= ax - 10; x += 3.2) for (const f of [0, 1]) {
      const z = -(az + 4 + f * 7.5); if (bate(x - 2, z - 3, x + 2, z + 3)) continue;
      caixa(L, x - 1.6, 0.11, z, 0.12, 0.02, 5, 0xf2f2ee);
      if (rnd() < 0.7) carro(x, z, Math.PI / 2);
    }
    // A CIDADE: quarteirões de 34 m com ruas de 10 m, de fora da calçada até a névoa
    const R0 = P + AV + CAL, CEL = 44, X1 = Math.max(ax + R0 + 4 * CEL, 300), Z1 = Math.max(az + R0 + 4 * CEL, 270);
    // o asfalto das ruas (um anel grande; os quarteirões sobem por cima)
    piso(-X1, az + R0, X1, Z1, 0.04, 0x44474c, 44); piso(-X1, -Z1, X1, -(az + R0), 0.04, 0x44474c, 44);
    piso(ax + R0, -(az + R0), X1, az + R0, 0.04, 0x44474c, 44); piso(-X1, -(az + R0), -(ax + R0), az + R0, 0.04, 0x44474c, 44);
    const predio = (x, z, w, d, h, cor, op) => {
      op = op || {};
      caixa(L, x, h / 2 + 0.2, z, w, h, d, { todo: cor, y1: op.teto || tom(cor, 0.82) }, 0, ['y0']);
      const passo = op.andar || 3.1;
      // as janelas: uma placa por lado do prédio com a textura das faixas de janela (cada andar com a sua cor: vidro, luz acesa ou
      //   apagada), em vez de uma caixa por andar: de ~20 mil triângulos na cidade para ~2 mil
      let nA = 0; for (let y = 2.3; y < h - 0.6; y += passo) nA++;
      if (nA > 0) {
        const j = op.janela || 1.0, y0 = 2.5 - j / 2, y1 = y0 + nA * passo, v0 = Math.floor(rnd() * 16) / 16, v1 = v0 + nA / 16, hx = w / 2 + 0.04, hz = d / 2 + 0.04, c = [x, y0, z];
        const uv = [[0, v0], [1, v0], [1, v1], [0, v1]];
        face(E.Lj, [x - hx, y0, z + hz], [x + hx, y0, z + hz], [x + hx, y1, z + hz], [x - hx, y1, z + hz], c, null, uv);
        face(E.Lj, [x - hx, y0, z - hz], [x + hx, y0, z - hz], [x + hx, y1, z - hz], [x - hx, y1, z - hz], c, null, uv);
        face(E.Lj, [x + hx, y0, z - hz], [x + hx, y0, z + hz], [x + hx, y1, z + hz], [x + hx, y1, z - hz], c, null, uv);
        face(E.Lj, [x - hx, y0, z - hz], [x - hx, y0, z + hz], [x - hx, y1, z + hz], [x - hx, y1, z - hz], c, null, uv);
      }
      if (op.toldo) caixa(L, x, 2.9, z + d / 2 + 0.55, w * 0.85, 0.18, 1.1, op.toldo);
      if (op.caixa) caixa(L, x + w * 0.2, h + 1.0, z - d * 0.15, 2.2, 1.6, 2.2, 0x6b7a8a);
      if (op.antena) caixa(L, x, h + 3.2, z, 0.25, 6, 0.25, 0x8a8f96);
    };
    for (let gx = -X1; gx < X1; gx += CEL) for (let gz = -Z1; gz < Z1; gz += CEL) {
      const x0 = gx + 5, z0 = gz + 5, x1 = gx + CEL - 5, z1 = gz + CEL - 5, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
      if (x1 > -(ax + R0) && x0 < ax + R0 && z1 > -(az + R0) && z0 < az + R0) continue;     // dentro da avenida
      if (bate(x0, z0, x1, z1)) continue;
      const d = Math.max(Math.abs(cx) - ax, Math.abs(cz) - az);                  // distância até o estádio
      const sorte = rnd();
      caixa(L, cx, 0.12, cz, x1 - x0, 0.24, z1 - z0, 0xa29c8f, 0, ['y0']);       // a calçada do quarteirão
      const mato = bairro === 'mata' ? 0.62 : bairro === 'bairro' ? 0.14 : 0.1;
      if (sorte < mato) {                                                         // praça ou mata
        caixa(L, cx, 0.27, cz, x1 - x0 - 2, 0.08, z1 - z0 - 2, 0x4f8a3e, 0, ['y0']);
        const n = bairro === 'mata' ? 9 : 5;
        for (let k = 0; k < n; k++) arvore(L, x0 + 3 + rnd() * (x1 - x0 - 6), z0 + 3 + rnd() * (z1 - z0 - 6), 2.5 + rnd() * 3, 1 + rnd() * 0.7, [0x3f7a35, 0x2f6a2c, 0x4a8a3c][k % 3]);
        continue;
      }
      const casas = bairro === 'bairro' ? d < 150 : d < 75;
      if (casas || (bairro === 'mata')) {                                         // casas e comércio: 3 x 3 lotes de ~11 m
        const n = 3, w = (x1 - x0 - 1) / n, dd = (z1 - z0 - 1) / n;
        for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
          if (i === 1 && j === 1) { if (rnd() < 0.6) arvore(L, x0 + 0.5 + w * 1.5, z0 + 0.5 + dd * 1.5, 3, 1.1, 0x3f7a35); continue; }   // o quintal do meio
          const h = (rnd() < 0.55 ? 3.2 : rnd() < 0.7 ? 6.2 : 9.2) * (bairro === 'mata' ? 0.8 : 1), cor = CASAS[Math.floor(rnd() * CASAS.length)];
          predio(x0 + 0.5 + w * (i + 0.5), z0 + 0.5 + dd * (j + 0.5), w - 1.4, dd - 1.4, h, cor, { teto: rnd() < 0.5 ? 0xb5543a : tom(cor, 0.8), toldo: d < 40 && rnd() < 0.45 ? TOLDOS[Math.floor(rnd() * TOLDOS.length)] : null, caixa: rnd() < 0.5, janela: 0.9 });
        }
        continue;
      }
      if (d < 160 || sorte < 0.55 || bairro === 'bairro') {                       // prédios médios: 2 x 2 (cidade do interior: sem as torres)
        const n = 2, w = (x1 - x0 - 1) / n, dd = (z1 - z0 - 1) / n;
        for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
          if (rnd() < 0.15) continue;
          const h = bairro === 'bairro' ? 6.2 + Math.floor(rnd() * 4) * 3.1 : 12 + Math.floor(rnd() * 8) * 3.1;
          predio(x0 + 0.5 + w * (i + 0.5), z0 + 0.5 + dd * (j + 0.5), w - 2.4, dd - 2.4, h, PREDIOS[Math.floor(rnd() * PREDIOS.length)], { caixa: true });
        }
        continue;
      }
      // as torres (longe)
      const h = 34 + Math.floor(rnd() * 14) * 3.1, w = 15 + rnd() * 8;
      predio(cx, cz, w, w * (0.8 + rnd() * 0.4), h, TORRES[Math.floor(rnd() * TORRES.length)], { antena: rnd() < 0.5, janela: 1.3 });
      if (rnd() < 0.5) predio(cx + (x1 - x0) * 0.3, cz - (z1 - z0) * 0.3, 9, 9, 12 + rnd() * 10, PREDIOS[Math.floor(rnd() * PREDIOS.length)]);
    }
    semente = salva;
  }

  // ============================================================================================ MONTAGEM
  function construir(P) {
    const E = contexto(P);
    E.L = new Lote(); E.Lf = new Lote(); E.Lt = new Lote(); E.Lp = new Lote(); E.Lb = new Lote(); E.Lr = new Lote(); E.Lj = new Lote();
    const k = MODELOS[P.campo.modelo] ? P.campo.modelo : modeloDoTime(E.M);
    E.modelo = k;
    MODELOS[k](E);
    if (!E.pegada) E.pegada = medir(E);
    let yMax = 20; for (let i = 1; i < E.L.pos.length; i += 3) if (E.L.pos[i] > yMax && Math.abs(E.L.pos[i - 1]) < E.pegada[0] && Math.abs(E.L.pos[i + 1]) < E.pegada[1]) yMax = E.L.pos[i];
    // a frente da arquibancada no meio do lado dos bancos (z-): até onde o túnel da entrada pode ir sem entrar nela
    let frenteZ = null; for (let i = 0; i < E.L.pos.length; i += 3) { const x = E.L.pos[i], y = E.L.pos[i + 1], z = E.L.pos[i + 2]; if (Math.abs(x) < 2.4 && z < -E.HW && y > 0.2 && y < 3.2 && (frenteZ == null || -z < frenteZ)) frenteZ = -z; }
    ULT = { modelo: k, nome: NOMES[k], pegada: E.pegada.slice(), yMax, c1: E.c1, c2: E.c2, frenteZ };
    entorno(E);                                                          // (7.4.0) a cidade em volta
    const add = (m) => { ESTADIO.add(m); freeze(m); };
    // o chão em volta do campo (fosso / pista / grama sintética) e, por fora, o gramado até o horizonte
    const ch = E.chaoAte || [E.HL + 24, E.HW + 24], chao = new THREE.Mesh(new THREE.PlaneGeometry(2 * Math.min(E.pegada[0], ch[0]), 2 * Math.min(E.pegada[1], ch[1])), new THREE.MeshLambertMaterial({ color: E.chaoCor || 0x2c5a30 }));
    chao.rotation.x = -Math.PI / 2; chao.position.y = -0.012; add(chao);
    const patio = new THREE.Mesh(new THREE.PlaneGeometry(2 * E.pegada[0], 2 * E.pegada[1]), new THREE.MeshLambertMaterial({ color: E.corPatio || 0x8a857b }));   // em volta, por baixo das arquibancadas
    patio.rotation.x = -Math.PI / 2; patio.position.y = -0.05; add(patio);
    const longe = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000), new THREE.MeshLambertMaterial({ color: E.corLonge || 0x5a8a45 }));
    longe.rotation.x = -Math.PI / 2; longe.position.y = -0.1; add(longe);
    // os três chãos se sobrepõem (de longe e de raspão, a diferença de poucos cm não basta): cada um mais "para trás" na profundidade
    for (const [m, k] of [[chao, 1], [patio, 3], [longe, 6]]) { m.material.polygonOffset = true; m.material.polygonOffsetFactor = k; m.material.polygonOffsetUnits = k * 2; }
    if (E.L.pos.length) add(E.L.malha(MAT_CORES));
    if (E.Lf.pos.length) add(E.Lf.malha(new THREE.MeshLambertMaterial({ map: texFaixa(E), vertexColors: true })));
    if (E.Lt.pos.length) add(E.Lt.malha(new THREE.MeshBasicMaterial({ map: texTelao(E, E.txtTelao), vertexColors: true })));
    if (E.Lr.pos.length) add(E.Lr.malha(new THREE.MeshBasicMaterial({ vertexColors: true, color: ({ dia: 0xffffff, tarde: 0xf0d8c4, noite: 0xaeb6c2 })[P.horario] || 0xffffff })));   // forros: sem luz
    if (E.Lb.pos.length) add(E.Lb.malha(new THREE.MeshLambertMaterial({ map: texBandeira(E), vertexColors: true, side: THREE.DoubleSide })));
    if (E.extras) for (const m of E.extras) add(m);
    lampadasMat = new THREE.MeshBasicMaterial({ vertexColors: true });
    if (E.Lp.pos.length) add(E.Lp.malha(lampadasMat));
    if (E.Lj.pos.length) { const mj = new THREE.MeshBasicMaterial({ map: texJanelas(), alphaTest: 0.5 }); mj.color = lampadasMat.color; add(E.Lj.malha(mj)); }   // as janelas da cidade (acendem junto com as lâmpadas)
    add(crowd.malha());
    return { modelo: k, nome: NOMES[k], torcedores: E.nTorcida };
  }
  // ============================================================================================ (7.4.0) OS FOGOS E A CENA DO ESTÁDIO
  //   fogos(op): rojões subindo da borda da cobertura (e da esplanada) e estourando em cima do estádio nas cores do mandante, com
  //     branco e dourado (crisântemo, anel e "chorão" dourado). Funciona com qualquer câmera (dentro, no gol, na cena de fora).
  //     op: { dur (s), ritmo (rojões por s), longe (0..1: o som abafado de quem está fora) }. Devolve uma Promise (quando acabam).
  //   cena(op): o estádio visto de fora, a câmera girando devagar em volta (com a cidade), faixas de cinema e o nome do estádio;
  //     com op.fogos, a queima de fogos junto. Um toque na tela pula. op: { dur (s), fogos, texto, angulo }. Devolve uma Promise.
  //   Os dois só funcionam com um estádio da Série A montado (o último construir).
  let ULT = null, FX = null;
  const NFX = 4200;
  function fxMontar() {
    if (FX) return FX;
    const pos = new Float32Array(NFX * 3), cor = new Float32Array(NFX * 3), g = new THREE.BufferGeometry();
    for (let i = 0; i < NFX; i++) pos[i * 3 + 1] = -999;
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(cor, 3));
    const mat = new THREE.PointsMaterial({ size: 3.2, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
    const pts = new THREE.Points(g, mat); pts.frustumCulled = false; pts.renderOrder = 5;
    FX = { pts, g, pos, cor, vel: new Float32Array(NFX * 3), vida: new Float32Array(NFX), max: new Float32Array(NFX), base: new Float32Array(NFX * 3), arrasto: new Float32Array(NFX), pisca: new Uint8Array(NFX),
      livre: 0, rojoes: [], ativos: 0, fimEm: 0, rodando: false, esperas: [], op: {} };
    return FX;
  }
  const corFx = (c) => { let k = num(c); if (luma(k) < 70) k = tom(k, 1.7); const [r, g, b] = rgb(k); return [r / 255, g / 255, b / 255]; };
  function fxFaisca(F, x, y, z, vx, vy, vz, vida, c, arrasto, pisca) {
    for (let t = 0; t < 64; t++) {                                       // procura uma vaga (anel circular)
      const i = F.livre; F.livre = (F.livre + 1) % NFX;
      if (F.vida[i] > 0 && t < 63) continue;
      F.pos[i * 3] = x; F.pos[i * 3 + 1] = y; F.pos[i * 3 + 2] = z; F.vel[i * 3] = vx; F.vel[i * 3 + 1] = vy; F.vel[i * 3 + 2] = vz;
      F.vida[i] = F.max[i] = vida; F.base[i * 3] = c[0]; F.base[i * 3 + 1] = c[1]; F.base[i * 3 + 2] = c[2]; F.arrasto[i] = arrasto; F.pisca[i] = pisca ? 1 : 0;
      return;
    }
  }
  function fxEstouro(F, x, y, z) {
    const op = F.op, pal = [corFx(ULT.c1), corFx(ULT.c2), [1, 0.97, 0.88], [1, 0.8, 0.33]];
    const tipo = Math.random(), c1 = pal[Math.floor(Math.random() * 4)], c2 = Math.random() < 0.4 ? pal[Math.floor(Math.random() * 4)] : c1;
    const n = 110 + Math.floor(Math.random() * 80), v = 20 + Math.random() * 10;
    if (tipo < 0.18) {                                                    // o chorão dourado: cai devagar, piscando
      for (let k = 0; k < n; k++) { const u = Math.random() * 2 - 1, a = Math.random() * Math.PI * 2, r = Math.sqrt(1 - u * u), s = v * 0.8 * (0.7 + Math.random() * 0.3); fxFaisca(F, x, y, z, r * Math.cos(a) * s, u * s + 2, r * Math.sin(a) * s, 3 + Math.random(), pal[3], 1.6, true); }
    } else if (tipo < 0.36) {                                             // o anel (deitado, meio inclinado)
      const inc = (Math.random() - 0.5) * 1.2;
      for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2, s = v * (0.95 + Math.random() * 0.1); fxFaisca(F, x, y, z, Math.cos(a) * s, Math.sin(a) * s * inc, Math.sin(a) * s, 1.7 + Math.random() * 0.4, k % 2 ? c1 : c2, 1.1, false); }
    } else {                                                              // o crisântemo (a bola de faíscas)
      for (let k = 0; k < n; k++) { const u = Math.random() * 2 - 1, a = Math.random() * Math.PI * 2, r = Math.sqrt(1 - u * u), s = v * (0.75 + Math.random() * 0.25); fxFaisca(F, x, y, z, r * Math.cos(a) * s, u * s, r * Math.sin(a) * s, 1.6 + Math.random() * 0.8, Math.random() < 0.5 ? c1 : c2, 1.2, Math.random() < 0.3); }
    }
    for (let k = 0; k < 10; k++) fxFaisca(F, x, y, z, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3, 0.25, [1, 1, 0.95], 2, false);   // o clarão do miolo
    try { Som.fogo('estouro', op.longe); } catch (e) { /* sem som */ }
  }
  function fxLancar(F) {
    const [ax, az] = ULT.pegada, borda = Math.random() < 0.7, a = Math.random() * Math.PI * 2;
    const kx = borda ? ax - 14 : ax + 8, kz = borda ? az - 14 : az + 8;
    const x = Math.cos(a) * kx, z = Math.sin(a) * kz, y = borda ? ULT.yMax + 1 : 0.5;
    F.rojoes.push({ x, y, z, vx: -x * 0.04 + (Math.random() - 0.5) * 3, vz: -z * 0.04 + (Math.random() - 0.5) * 3, vy: 34 + Math.random() * 10, alvo: ULT.yMax + 26 + Math.random() * 34 });
    if (Math.random() < 0.6) try { Som.fogo('sobe', F.op.longe); } catch (e) { /* sem som */ }
  }
  function fxPasso(F, dt) {
    if (performance.now() < F.fimEm) { F.acc += dt * (F.op.ritmo || 1.6); while (F.acc >= 1) { F.acc -= 1; fxLancar(F); } }
    for (let j = F.rojoes.length - 1; j >= 0; j--) {
      const R = F.rojoes[j];
      R.x += R.vx * dt; R.z += R.vz * dt; R.y += R.vy * dt; R.vy -= 9 * dt;
      fxFaisca(F, R.x, R.y, R.z, (Math.random() - 0.5) * 1.5, -2, (Math.random() - 0.5) * 1.5, 0.45, [1, 0.62, 0.25], 2, false);   // o rastro
      if (R.y >= R.alvo || R.vy < 6) { fxEstouro(F, R.x, R.y, R.z); F.rojoes.splice(j, 1); }
    }
    let vivos = 0;
    for (let i = 0; i < NFX; i++) {
      if (F.vida[i] <= 0) continue;
      F.vida[i] -= dt;
      const i3 = i * 3;
      if (F.vida[i] <= 0) { F.pos[i3 + 1] = -999; F.cor[i3] = F.cor[i3 + 1] = F.cor[i3 + 2] = 0; continue; }
      vivos++;
      const k = Math.exp(-F.arrasto[i] * dt);
      F.vel[i3] *= k; F.vel[i3 + 1] = F.vel[i3 + 1] * k - 7.5 * dt; F.vel[i3 + 2] *= k;
      F.pos[i3] += F.vel[i3] * dt; F.pos[i3 + 1] += F.vel[i3 + 1] * dt; F.pos[i3 + 2] += F.vel[i3 + 2] * dt;
      let b = Math.pow(F.vida[i] / F.max[i], 1.2); if (F.pisca[i] && Math.random() < 0.35) b *= 0.25;
      F.cor[i3] = F.base[i3] * b; F.cor[i3 + 1] = F.base[i3 + 1] * b; F.cor[i3 + 2] = F.base[i3 + 2] * b;
    }
    F.g.attributes.position.needsUpdate = true; F.g.attributes.color.needsUpdate = true;
    return vivos + F.rojoes.length;
  }
  const parado = () => (typeof PausaGlobal !== 'undefined' && PausaGlobal.ativa) || G.state === 'paused';
  function fogos(op) {
    op = op || {};
    if (!ULT || typeof ESTADIO_A === 'undefined' || !ESTADIO_A) return Promise.resolve();
    const F = fxMontar();
    F.op = op; F.acc = 0.8; F.fimEm = Math.max(F.fimEm || 0, performance.now() + (op.dur || 8) * 1000);
    F.pts.material.size = op.tam || 3.2;
    if (F.pts.parent !== scene) scene.add(F.pts);
    const p = new Promise((res) => F.esperas.push(res));
    if (!F.rodando) {
      F.rodando = true; let t0 = performance.now();
      const passo = (agora) => {
        const dt = Math.min(0.05, (agora - t0) / 1000); t0 = agora;
        const vivos = parado() ? 1 : fxPasso(F, dt);
        if (vivos > 0 || performance.now() < F.fimEm) { requestAnimationFrame(passo); return; }
        F.rodando = false; scene.remove(F.pts);
        const es = F.esperas; F.esperas = []; for (const r of es) r();
      };
      requestAnimationFrame(passo);
    }
    return p;
  }
  function pararFogos() { if (FX) { FX.fimEm = 0; FX.rojoes.length = 0; } }
  async function cena(op) {
    op = op || {};
    if (!ULT || typeof ESTADIO_A === 'undefined' || !ESTADIO_A) return;
    const dur = (op.dur || 7) * 1000, [ax, az] = ULT.pegada, R = Math.max(ax, az) * 1.75 + 70;
    const est0 = G.state, cam0 = G.camOvo, near0 = camera.near, far0 = camera.far;
    const a0 = op.angulo != null ? op.angulo : -2.3 + Math.random() * 0.6, h = R * (op.fogos ? 0.3 : 0.38), ty = ULT.yMax * (op.fogos ? 1.1 : 0.45);
    G.state = 'menu';                                                   // o jogo parado (sem relógio nem bonecos andando) durante a cena
    try { setLetterbox(true); $('cineLabel').textContent = op.texto != null ? op.texto : ULT.nome; } catch (e) { /* sem faixas */ }
    camera.near = 1.5; camera.far = 1400; camera.updateProjectionMatrix();
    const nevoa = [scene.fog.near, scene.fog.far]; scene.fog.near = 380; scene.fog.far = 1000;
    let pulou = false;
    const tapa = document.createElement('div'); tapa.style.cssText = 'position:fixed;inset:0;z-index:7;';
    tapa.addEventListener('pointerdown', (e) => { e.preventDefault(); pulou = true; });
    (document.getElementById('raizJogo') || document.body).appendChild(tapa);
    const fx = op.fogos ? fogos({ dur: Math.max(2, dur / 1000 - 1.2), ritmo: op.ritmo || 3.4, longe: 1, tam: 6 }) : null;
    const t0 = performance.now();
    await new Promise((res) => {
      const passo = () => {
        const t = Math.min(1, (performance.now() - t0) / dur), e = t * t * (3 - 2 * t);
        const a = a0 + 0.75 * e, r = R * (1 - 0.12 * e), y = h * (1 - 0.25 * e);
        const pose = { px: Math.cos(a) * r, py: y, pz: Math.sin(a) * r, tx: 0, ty, tz: 0 };
        G.camOvo = pose; Object.assign(cam, pose);
        if (op.parar && op.parar()) pulou = true;                       // (7.4.1) quem chamou pode cortar a cena (o "Pular" da abertura)
        if (pulou || t >= 1) return res();
        requestAnimationFrame(passo);
      };
      requestAnimationFrame(passo);
    });
    tapa.remove();
    if (pulou) pararFogos();
    G.camOvo = cam0; camera.near = near0; camera.far = far0; camera.updateProjectionMatrix();
    scene.fog.near = nevoa[0]; scene.fog.far = nevoa[1];
    try { setLetterbox(false); $('cineLabel').textContent = ''; } catch (e) { /* nada */ }
    if (G.state === 'menu') G.state = est0;
    snapCamera();
    if (fx && !pulou && op.esperarFogos) await fx;
  }
  // sem modelo na partida: o mesmo time cai sempre no mesmo estádio
  function modeloDoTime(M) {
    const ks = Object.keys(MODELOS), h = typeof sementeDe === 'function' ? sementeDe(String((M && (M.id || M.nome)) || 'x')) : 0;
    return ks[h % ks.length];
  }

  // a casa de cada clube da Série A (serieb.js, TIMES_A): o modelo mais parecido com o estádio de verdade de cada um
  //   (7.4.0) cada clube na sua casa; quem não tem estádio próprio joga onde já joga (as Laranjeiras dividem o Anel com o Urubu).
  //   A Arena da Floresta não é de ninguém: é o campo neutro da final da Copa do Brasil (serieb.js).
  const CASA_DO_CLUBE = { urubu: 'anel', laranjeiras: 'anel', raposa: 'lagoa', periquito: 'caldeirao', imortal: 'humaita', peixe: 'vila',
    timao: 'fachada', glorioso: 'arcos', leaocaipira: 'caipira', touro: 'taboao', verdaooeste: 'oeste', galo: 'listras', furacao: 'baixada',
    leaoazul: 'mangueiral', saci: 'petalas', esquadrao: 'ferradura', colina: 'colinaE', morumbi: 'concha', leaodabarra: 'toca', coxa: 'alto' };
  // quem subiu da Série B (sem casa na lista) joga num dos estádios do interior, sempre o mesmo
  const DO_INTERIOR = ['caipira', 'taboao', 'oeste'];
  const modeloDoClube = (k) => CASA_DO_CLUBE[k] || (k ? DO_INTERIOR[(typeof sementeDe === 'function' ? sementeDe('casa|' + k) : String(k).length) % DO_INTERIOR.length] : '');
  window.EstadiosA = { construir, modelos: () => Object.keys(MODELOS), nome: (k) => NOMES[k] || '', modeloDoTime, modeloDoClube, fogos, pararFogos, cena, atual: () => ULT && Object.assign({}, ULT) };
  if (window.FutebolJS && window.FutebolJS.registrarFase) window.FutebolJS.registrarFase({ id: 'estadiosA', nome: 'Estádios da Série A', nucleoMinimo: '7.2', iniciar: async () => {}, EstadiosA: window.EstadiosA });
})();
