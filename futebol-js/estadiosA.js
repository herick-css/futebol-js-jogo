/* =====================================================================================================================
   estadiosA.js — OS 8 ESTÁDIOS DA SÉRIE A (o jogo baixa na abertura, como o cosmeticos.js).
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
    for (let i = 0; i < NS; i++) {
      if (!inc(i)) continue;
      const a = C.N[i], b = C.N[i + 1], lado = ladoDo(C, i);
      for (let r = 0; r < n; r++) {
        const o = oF(r), y = yTopo(r), p0 = ponto(a, rb, o), p1 = ponto(b, rb, o);
        // a cadeira (faixa fina na frente do degrau)
        const ca = A.assento ? A.assento(r, i, { lado, a, b, s: (a.s + b.s) / 2, x: (p0[0] + p1[0]) / 2, z: (p0[1] + p1[1]) / 2 }) : null;
        if (ca != null) {
          const f0 = o + 0.12, f1 = o + 0.58, s0 = ponto(a, rb, f0), s1 = ponto(b, rb, f0), t0 = ponto(a, rb, f1), t1 = ponto(b, rb, f1), h = 0.16;
          const Q = [[s0[0], y, s0[1]], [s1[0], y, s1[1]], [s0[0], y + h, s0[1]], [s1[0], y + h, s1[1]], [t0[0], y, t0[1]], [t1[0], y, t1[1]], [t0[0], y + h + 0.22, t0[1]], [t1[0], y + h + 0.22, t1[1]]];
          hexa(L, Q, { todo: tom(ca, 0.8), y1: ca, z0: tom(ca, 0.9) }, ['y0', 'x0', 'x1']);
        }
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
      // o forro de baixo (inclinado)
      face(E.Lr, [p0[0], yF - hF + 0.3, p0[1]], [p1[0], yF - hF + 0.3, p1[1]], [q1[0], yT, q1[1]], [q0[0], yT, q0[1]], [(p0[0] + q0[0]) / 2, yF + 10, (p0[1] + q0[1]) / 2], op.forro || 0x5a5e66);
      // a fáscia (a faixa da frente do anel): textura do escudo ou cor lisa
      const yA = yF - hF + 0.3, yB = yF + 0.3 + (op.parapeito || 0.9);
      const lado = [(p0[0] + p1[0]) / 2 - a.nx * 5, yA, (p0[1] + p1[1]) / 2 - a.nz * 5];
      if (op.tex && E.Lf) {
        const u0 = -a.s / op.periodo, u1 = -b.s / op.periodo;
        face(E.Lf, [p0[0], yA, p0[1]], [p1[0], yA, p1[1]], [p1[0], yB, p1[1]], [p0[0], yB, p0[1]], [lado[0] + a.nx * 10, yA, lado[2] + a.nz * 10], null, [[u0, 0], [u1, 0], [u1, 1], [u0, 1]]);
      } else face(E.L, [p0[0], yA, p0[1]], [p1[0], yA, p1[1]], [p1[0], yB, p1[1]], [p0[0], yB, p0[1]], [lado[0] + a.nx * 10, yA, lado[2] + a.nz * 10], op.corFascia || 0x30343c);
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
    for (let i = 0; i < 6; i++) caixa(L, x + Math.sin(i * 0.7) * 0.15, (i + 0.5) * h / 6, z, 0.45, h / 6 + 0.05, 0.45, i % 2 ? 0x7a5a36 : 0x6b4e2e);
    for (let k = 0; k < 5; k++) { const a = k * Math.PI * 2 / 5; caixa(L, x + Math.cos(a) * 1.4, h + 0.1 - 0.35, z + Math.sin(a) * 1.4, 3.2, 0.25, 0.9, k % 2 ? 0x2f7a35 : 0x3a8a3c, -a); }
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
      hexa(E.L, [[p0[0], 0, p0[1]], [p1[0], 0, p1[1]], [p0[0], h, p0[1]], [p1[0], h, p1[1]], [q0[0], 0, q0[1]], [q1[0], 0, q1[1]], [q0[0], h, q0[1]], [q1[0], h, q1[1]]], 0x2a2d33, ['y0', 'x0', 'x1', 'z0']);
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
    caixa(E.L, 0, (yO + 1.5) / 2, zO + 2.2, lw, yO + 1.5, 4.4, { todo: 0x2f4a62, y1: 0x30333a }, 0, ['y0']);
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
    // os cantos abertos: refletores em torre e uns prédios da cidade lá atrás
    const B = E.L;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const x = sx * (HL + 16), z = sz * (HW + 16), H = 34;
      caixa(B, x, H / 2, z, 0.8, H, 0.8, 0x595e66);
      caixa(B, x, H + 1, z, 4.5, 2.2, 0.8, 0x3a3f46, Math.atan2(-z, -x) + Math.PI / 2);
      caixa(E.Lp, x - sx * 0.3, H + 1, z - sz * 0.3, 4, 1.8, 0.5, 0xffffff, Math.atan2(-z, -x) + Math.PI / 2);
      for (let k = 0; k < 3; k++) { const bx = sx * (HL + 40 + k * 14), bz = sz * (HW + 34 + (k % 2) * 12), h = 14 + ((k * 7 + (sx > 0 ? 3 : 0)) % 4) * 6; caixa(B, bx, h / 2, bz, 10, h, 10, [0x8a8f96, 0x9da1a6, 0x7f858d][k]); for (let y = 2.5; y < h; y += 3) caixa(E.Lp, bx, y, bz, 10.1, 0.8, 10.1, 0x8899aa); }   // as janelas (acendem de noite)
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
      radial(E, C, i, 5, yT + 2.4, oT1, yT + 1.4, 0.3, 0.4, 0x2a2d32);      // a tesoura (banzo de cima)
      radial(E, C, i, 5, yT + 0.6, oT1, yT, 0.3, 0.35, 0x2a2d32);
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
    teto(E, C, oT0, oT1, yT0, yT1, 0.35, (i) => (i % 2 ? 0xf3f3ef : 0xe8e8e2), null, (i) => (i % 2 ? 0xa8aaa6 : 0x9fa19d));
    laje(E, C, oT0 - 0.5, oT0 + 0.7, yT0 + 0.2, yT0 + 0.2, 1.0, 0xffffff);
    const NN = C.N.length - 1, yAt = (o) => yT0 + (yT1 - yT0) * (o - oT0) / (oT1 - oT0) - 0.45;
    for (let i = 0; i < NN; i += 3) {
      const j = (i + 3) % NN;
      viga(E.L, ponto3(C.N[i], C.rb, oT0, yAt(oT0)), ponto3(C.N[j], C.rb, oT1, yAt(oT1)), 0.5, 0xf6f6f2);
      viga(E.L, ponto3(C.N[j], C.rb, oT0, yAt(oT0)), ponto3(C.N[i], C.rb, oT1, yAt(oT1)), 0.5, 0xf6f6f2);
    }
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
    // a mata em volta: palmeiras e árvores
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
    const zR = HW + 11 + oPe + 14;
    const ag = new THREE.Mesh(new THREE.PlaneGeometry(420, 140), new THREE.MeshLambertMaterial({ color: 0x3f6f8f }));
    ag.rotation.x = -Math.PI / 2; ag.position.set(0, -0.005, zR + 76); (E.extras = E.extras || []).push(ag);
    caixa(E.L, 0, 0.05, zR + 3, 420, 0.12, 6, 0xc9c2b0);
    for (let x = -160; x <= 160; x += 14) arvore(E.L, x, zR, 3.4, 1.1, 0x3d7a36);
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
    // as pontas da ferradura: a parede que fecha o anel de cima e a cobertura de lado
    const pontas = []; for (let i = 0; i < NN; i++) if (ferr(i) && !ferr((i + 1) % NN)) pontas.push(i + 1); else if (ferr(i) && !ferr((i - 1 + NN) % NN)) pontas.push(i);
    const yT0 = R2.yTopo + 9, yT1 = R2.yTopo + 6.4, oT0 = 6, oT1 = R2.oFim + 2.5;
    for (const j of pontas) {
      radial(E, C, j, A2.o0, R2.yTopo + 1.5, R2.oFim + 0.3, R2.yTopo + 1.5, 0.7, R2.yTopo + 1.5 - (A2.y0 - A2.dy - 2.4), 0x6a6e74);
      radial(E, C, j, R1.oFim, R1.yTopo + 0.3, R1.oFim + 2.3, R1.yTopo + 0.3, 0.7, R1.yTopo + 0.3, 0x6a6e74);
      radial(E, C, j, oT0, yT0 + 0.6, oT1, yT1 + 0.6, 0.6, 1.4, 0xd9dcdf);   // a viga da ponta da cobertura
    }
    // a cobertura de membrana e o anel de compressão com os cabos
    teto(E, C, oT0, oT1, yT0, yT1, 0.3, (i) => (i % 2 ? 0xf1f2f0 : 0xe6e8e5), ferr, (i) => (i % 2 ? 0xa3a6a4 : 0x999c9a));
    laje(E, C, oT0 - 0.5, oT0 + 0.6, yT0 + 0.3, yT0 + 0.3, 1.1, 0xc9cdd1, ferr);
    for (let i = 0; i < NN; i += 2) { if (!ferr(i)) continue; radial(E, C, i, oT0, yT0 + 1.6, oT1, yT1 + 4.2, 0.12, 0.12, 0x3a3d42); radial(E, C, i, oT1 - 0.4, yT1 + 4.4, oT1, yT1 - 0.2, 0.5, 0.5, 0x8d9197); }
    luzesNoAnel(E, C, oT0 + 0.4, yT0 - 1.1, 4, ferr);
    // o vão: a praça, a mureta do mirante e o telão grande em cima das pernas
    const xV = HL + 16;
    caixa(E.L, xV + 8, 0.6, 0, 16, 1.2, 2 * HW + 30, 0xb7b2a6, 0, ['y0']);
    caixa(E.L, xV + 0.2, 1.6, 0, 0.5, 0.9, 2 * HW + 30, 0x7c8086, 0, ['y0']);
    telao(E, xV + 6, 13, 0, 22, 9, Math.PI / 2, { pernas: true });
    telao(E, -(HL + 21), yT0 - 5.3, 0, 13, 6.5, -Math.PI / 2, { cabos: 3.6 });
    // o lago, os morros e a cidade lá atrás
    const lago = new THREE.Mesh(new THREE.PlaneGeometry(46, 260), new THREE.MeshLambertMaterial({ color: 0x3c7393 }));
    lago.rotation.x = -Math.PI / 2; lago.position.set(xV + 40, -0.005, 0); (E.extras = E.extras || []).push(lago);
    for (let k = 0; k < 9; k++) {
      const z = -110 + k * 27.5, h = 12 + hash(k, 9, 9) * 12, x = xV + 72 + hash(k, 4, 4) * 8;
      caixa(E.L, x, h / 2, z, 26, h, 30, k % 2 ? 0x4f7a3c : 0x5a8744);
      for (let t = 0; t < 3; t++) arvore(E.L, x - 8 + t * 8, z + (t - 1) * 7, h - 0.5, 1.3, 0x3d6f33);
    }
    for (let k = 0; k < 16; k++) {
      const z = -110 + k * 14.5 + hash(k, 1, 7) * 4, h = 28 + hash(k, 2, 7) * 34, x = xV + 96 + hash(k, 3, 7) * 14, w = 8 + hash(k, 6, 7) * 5;
      caixa(E.L, x, h / 2, z, w, h, w, [0xc9c3b6, 0xb3b8be, 0xd7d2c6, 0x9fa6ae][k % 4]);
      for (let y = 3; y < h - 1; y += 3) caixa(E.Lp, x - 0.06, y, z, w + 0.12, 0.7, w * 0.8, hash(k, y, 3) < 0.5 ? 0x8899aa : 0x6f7f90);   // as janelas (acendem de noite)
    }
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
    pele(E, C, oB + 0.3, 0, yB - 1, (i) => (i % 2 ? 0x8f8e88 : 0x878680));
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

  // ============================================================================================ MONTAGEM
  function construir(P) {
    const E = contexto(P);
    E.L = new Lote(); E.Lf = new Lote(); E.Lt = new Lote(); E.Lp = new Lote(); E.Lb = new Lote(); E.Lr = new Lote();
    const k = MODELOS[P.campo.modelo] ? P.campo.modelo : modeloDoTime(E.M);
    E.modelo = k;
    MODELOS[k](E);
    const add = (m) => { ESTADIO.add(m); freeze(m); };
    // o chão em volta do campo (fosso / pista / grama sintética)
    const chao = new THREE.Mesh(new THREE.PlaneGeometry(330, 250), new THREE.MeshLambertMaterial({ color: E.chaoCor || 0x2c5a30 }));
    chao.rotation.x = -Math.PI / 2; chao.position.y = -0.012; add(chao);
    if (E.L.pos.length) add(E.L.malha(MAT_CORES));
    if (E.Lf.pos.length) add(E.Lf.malha(new THREE.MeshLambertMaterial({ map: texFaixa(E), vertexColors: true })));
    if (E.Lt.pos.length) add(E.Lt.malha(new THREE.MeshBasicMaterial({ map: texTelao(E, E.txtTelao), vertexColors: true })));
    if (E.Lr.pos.length) add(E.Lr.malha(new THREE.MeshBasicMaterial({ vertexColors: true, color: ({ dia: 0xffffff, tarde: 0xf0d8c4, noite: 0xaeb6c2 })[P.horario] || 0xffffff })));   // forros: sem luz
    if (E.Lb.pos.length) add(E.Lb.malha(new THREE.MeshLambertMaterial({ map: texBandeira(E), vertexColors: true, side: THREE.DoubleSide })));
    if (E.extras) for (const m of E.extras) add(m);
    lampadasMat = new THREE.MeshBasicMaterial({ vertexColors: true });
    if (E.Lp.pos.length) add(E.Lp.malha(lampadasMat));
    add(crowd.malha());
    return { modelo: k, nome: NOMES[k], torcedores: E.nTorcida };
  }
  // sem modelo na partida: o mesmo time cai sempre no mesmo estádio
  function modeloDoTime(M) {
    const ks = Object.keys(MODELOS), h = typeof sementeDe === 'function' ? sementeDe(String((M && (M.id || M.nome)) || 'x')) : 0;
    return ks[h % ks.length];
  }

  // a casa de cada clube da Série A (serieb.js, TIMES_A): o modelo mais parecido com o estádio de verdade de cada um
  const CASA_DO_CLUBE = { urubu: 'anel', laranjeiras: 'anel', raposa: 'anel', periquito: 'caldeirao', imortal: 'caldeirao', peixe: 'caldeirao',
    timao: 'fachada', glorioso: 'fachada', leaocaipira: 'fachada', touro: 'fachada', verdaooeste: 'fachada', galo: 'listras', furacao: 'listras',
    leaoazul: 'floresta', saci: 'petalas', esquadrao: 'ferradura', colina: 'ferradura', morumbi: 'concha', leaodabarra: 'concha', coxa: 'concha' };
  const modeloDoClube = (k) => CASA_DO_CLUBE[k] || '';
  window.EstadiosA = { construir, modelos: () => Object.keys(MODELOS), nome: (k) => NOMES[k] || '', modeloDoTime, modeloDoClube };
  if (window.FutebolJS && window.FutebolJS.registrarFase) window.FutebolJS.registrarFase({ id: 'estadiosA', nome: 'Estádios da Série A', nucleoMinimo: '7.2', iniciar: async () => {}, EstadiosA: window.EstadiosA });
})();
