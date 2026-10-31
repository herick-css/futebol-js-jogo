/* =====================================================================
   FUTEBOL JS · interiores.js · OS INTERIORES da cidadezinha (arquivo SEPARADO, como cidade.js)
   ---------------------------------------------------------------------
   - Registrado com FutebolJS.registrarFase({ id: 'interiores' }) só para o jogo saber baixar o arquivo; ele NÃO roda como fase.
     A cidade baixa este arquivo em segundo plano quando abre (Fases.carregar('interiores')) e chama construir(nome, api) quando o
     jogador entra num lugar. Suba junto do jogo.js / cidade.js (mesma pasta futebol-js/).
   - Cada interior é uma SALA grande, no mesmo lugar do mundo da cidade (a cidade fica escondida enquanto você está dentro).
     As paredes só têm o lado de DENTRO (vistas de fora elas somem), então a câmera pode ficar "atrás" da parede e ver a sala.
   - Por enquanto: só o visual, onde dá para sentar e pessoas de enfeite (paradas, andando, sentadas, na esteira...).
     NADA de compra, trabalho ou atendimento ainda (a não ser a ficha médica do hospital, que já existia).
   - (6.1.0) Pizzaria Forno a Lenha redecorada para o trabalho de entregador e os clientes (R.pizzaria: forno, bancada, caixa, retirada,
     mesas...; ver pizzaria.js).
   - Golaço Esportes (nome 'esportiva'): sala retangular com piso de pista de corrida. Vazia por enquanto.
   - Supermercado arrumado para o trabalho de caixa (R.mercado, R.estoque, R.mercadoEstoque: ver mercado.js).
   - Cafeteria (20 x 14) com a BANCADA DE PREPARO (extra acao:'bancada') para o expediente (ver cidade.js).
   - (6.2.0) Academia refeita: recepção, duas catracas (entrada e saída), esteiras, supinos e colchonetes (R.academia; ver academia.js).
   - construir(nome, api) devolve { grupo, lim, col, pisos, assentos, pessoas, entrada, saida, extras, fundo, cam }
       assentos: [{ x, z, fx, fz, h, tipo }] (fx/fz = para onde olha quem senta)
       pessoas:  [{ tipo: 'parado' | 'vaga' | 'senta' | 'esteira' | 'rosca', x, z, yaw, area, assento, fem }]
       extras:   [{ x, z, r, txt, acao }]  (ex.: a recepção do hospital → 'ficha')
   ===================================================================== */
(function () {
  'use strict';

  const LUGARES = ['supermercado', 'cafeteria', 'pizzaria', 'restaurante', 'academia', 'bar', 'cinema', 'hospital', 'lanche', 'esportiva'];

  function construir(nome, api) {
    const { Geo, MAT, guardar, texCanvas, granular, semente, texLetreiro } = api;
    const rnd = semente(nome.length * 977 + nome.charCodeAt(0));
    const pk = (l) => l[Math.floor(rnd() * l.length)];
    const grupo = new THREE.Group(), G = new Geo();
    const R = { grupo, col: [], pisos: [], assentos: [], pessoas: [], extras: [], ocl: [], fundo: 0x15110d, cam: { dist: 7.5, pitch: 0.82 } };
    const bloq = (x, z, w, d) => R.col.push({ x0: x - w / 2, x1: x + w / 2, z0: z - d / 2, z1: z + d / 2 });
    const sentar = (x, z, fx, fz, h, tipo) => R.assentos.push({ x, z, fx, fz, h, tipo: tipo || 'cadeira' }) - 1;

    // ---- a sala: piso com textura de lajotas, paredes viradas para dentro, rodapé, porta de saída na parede sul
    function sala(W, D, H, parede, piso, piso2, lajota) {
      const x0 = -W / 2, x1 = W / 2, z0 = -D / 2, z1 = D / 2;
      R.lim = { x0: x0 + 0.35, x1: x1 - 0.35, z0: z0 + 0.35, z1: z1 - 0.35 };
      const tex = guardar(texCanvas(32, 32, (g, w, h) => { g.fillStyle = piso; g.fillRect(0, 0, w, h); g.fillStyle = piso2; g.fillRect(0, 0, w / 2, h / 2); g.fillRect(w / 2, h / 2, w / 2, h / 2); g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(0, 0, w, 1); g.fillRect(0, 0, 1, h); g.fillRect(0, h / 2, w, 1); g.fillRect(w / 2, 0, 1, h); granular(g, w, h, 0.08, rnd); }, true));
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      const geo = guardar(new THREE.PlaneGeometry(W, D)), uv = geo.attributes.uv; const L = lajota || 1.2;
      for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * W / (L * 2), uv.getY(i) * D / (L * 2));
      const chao = new THREE.Mesh(geo, guardar(new THREE.MeshLambertMaterial({ map: tex }))); chao.rotation.x = -Math.PI / 2; grupo.add(chao);
      G.quad([x0, 0, z0], [x1, 0, z0], [x1, H, z0], [x0, H, z0], parede, [0, 0, 1]);
      G.quad([x1, 0, z1], [x0, 0, z1], [x0, H, z1], [x1, H, z1], parede, [0, 0, -1]);
      G.quad([x0, 0, z1], [x0, 0, z0], [x0, H, z0], [x0, H, z1], parede, [1, 0, 0]);
      G.quad([x1, 0, z0], [x1, 0, z1], [x1, H, z1], [x1, H, z0], parede, [-1, 0, 0]);
      const rod = '#4a3a2e';                                                      // rodapé (só nas paredes que a câmera vê por dentro)
      G.box(W - 0.1, 0.14, 0.05, rod, 0, 0, z0 + 0.03); G.box(0.05, 0.14, D - 0.1, rod, x0 + 0.03, 0, 0); G.box(0.05, 0.14, D - 0.1, rod, x1 - 0.03, 0, 0);
      // porta de saída (só o lado de dentro: de fora ela some junto com a parede)
      const pz = z1 - 0.03;
      G.quad([0.75, 0, pz], [-0.75, 0, pz], [-0.75, 2.35, pz], [0.75, 2.35, pz], '#e8e2d2', [0, 0, -1]);
      G.quad([0.62, 0, pz - 0.01], [-0.62, 0, pz - 0.01], [-0.62, 2.25, pz - 0.01], [0.62, 2.25, pz - 0.01], '#6a4428', [0, 0, -1]);
      G.box(1.6, 0.02, 0.9, '#7a2a2a', 0, 0, z1 - 0.6);                          // capacho
      R.entrada = { x: 0, z: z1 - 1.4, yaw: Math.PI / 2 };
      R.saida = { x: 0, z: z1 - 0.9 };
    }
    // mesa com cadeiras em volta (dá para sentar)
    function mesa(x, z, cor, n, tampo) {
      G.box(0.9, 0.05, 0.9, tampo || cor, x, 0.74, z); G.box(0.1, 0.74, 0.1, '#3a3a3e', x, 0, z); G.box(0.5, 0.04, 0.5, '#3a3a3e', x, 0, z);
      bloq(x, z, 1.0, 1.0);
      const lados = [[1, 0], [-1, 0], [0, 1], [0, -1]].slice(0, n || 4);
      return lados.map(([ux, uz]) => { cadeira(x + ux * 0.8, z + uz * 0.8, -ux, -uz, cor); return sentar(x + ux * 0.8, z + uz * 0.8, -ux, -uz, 0.5); });
    }
    function cadeira(x, z, fx, fz, cor) {
      G.box(0.44, 0.05, 0.44, cor, x, 0.45, z); for (const [a, b] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) G.box(0.04, 0.45, 0.04, '#3a3a3e', x + a, 0, z + b);
      G.box(fx ? 0.05 : 0.42, 0.5, fx ? 0.42 : 0.05, cor, x - fx * 0.21, 0.5, z - fz * 0.21);
    }
    function balcao(x, z, w, d, cor, tampo) { G.box(w, 1.0, d, cor, x, 0, z, tampo); G.box(w + 0.1, 0.06, d + 0.1, tampo || '#d8c9a8', x, 1.0, z); bloq(x, z, w, d); }
    function placa(txt, fundo, frente, w, h, x, y, z) {                         // letreiro na parede norte (olhando para +z)
      const tex = guardar(texLetreiro(txt, fundo, frente, w, h)), m = new THREE.Mesh(guardar(new THREE.PlaneGeometry(w, h)), guardar(new THREE.MeshLambertMaterial({ map: tex })));
      m.position.set(x, y, z); grupo.add(m);
    }
    const PROD = ['#c8352b', '#f2c230', '#3a64b8', '#1f7a4d', '#e8742a', '#f2f2ee', '#7a4fb0', '#d95fa0', '#8c5a2b', '#3fb7b0'];

    if (nome === 'supermercado') {
      // MERCADINHO BOM PREÇO reorganizado para o trabalho de caixa (ver mercado.js):
      //   frente (sul): o CAIXA ativo (esteira ao longo de z; o jogador fica do lado leste, a fila do lado oeste) e um 2º caixa fechado;
      //   gôndolas de HIGIÊNICO (oeste) e COMIDA (duas, no meio); BEBIDAS nos freezers da parede norte; ILHA DE FRUTAS na frente, a oeste;
      //   ESTOQUE no canto nordeste: quatro pilhas de caixas com placas (higiênico, comida, bebida, fruta).
      //   Os produtos de cada seção ficam em 5 "fatias" (R.estoque[seção]) para o mercado.js mostrar a seção esvaziando.
      sala(26, 20, 4.2, '#f4efe2', '#e8e4dc', '#d8d4cc', 0.8);
      placa('MERCADINHO BOM PREÇO', '#c8352b', '#fff6e0', 9, 1.0, 0, 3.4, -9.96);
      const fatias = (n) => Array.from({ length: n }, () => new Geo()), F = { higiene: fatias(5), comida: fatias(5), bebida: fatias(5), fruta: fatias(5) };
      let kf = 0; const poe = (sec, w, h, d, cor, x, y, z) => { F[sec][(kf++) % 5].box(w, h, d, cor, x, y, z); };
      const CORES = { higiene: ['#9ec7e8', '#f2f2ee', '#7ab8d8', '#d95fa0', '#c8e8f4'], comida: ['#e8742a', '#f2c230', '#c8352b', '#8c5a2b', '#f4e0b0'], bebida: ['#c8352b', '#3fb7b0', '#1f7a4d', '#f2f2ee', '#e8742a'], fruta: ['#f2c230', '#c8352b', '#6cae3e', '#e8742a', '#7a4fb0'] };
      const placaSecao = (txt, fundo, x, y, z, ry, w) => { const tex = guardar(texLetreiro(txt, fundo, '#fff6e0', w || 2.2, 0.45)), m = new THREE.Mesh(guardar(new THREE.PlaneGeometry(w || 2.2, 0.45)), guardar(new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide }))); m.position.set(x, y, z); m.rotation.y = ry || 0; grupo.add(m); };
      // gôndolas: higiênico (x = −7,5) e comida (x = −3,5 e 0,5), de z = −7 a 1
      for (const [gx, sec] of [[-7.5, 'higiene'], [-3.5, 'comida'], [0.5, 'comida']]) {
        const L = 8, gz = -3; G.box(1.0, 0.12, L, '#9aa0a6', gx, 0, gz); G.box(0.08, 1.9, L, '#c9ced4', gx, 0.12, gz);
        for (const y of [0.35, 0.8, 1.25, 1.7]) { G.box(1.0, 0.04, L, '#c9ced4', gx, y, gz); for (const sd of [-1, 1]) for (let i = 0; i < 25; i++) { const h = 0.2 + rnd() * 0.15; poe(sec, 0.32, h, 0.24, pk(CORES[sec]), gx + sd * 0.27, y + 0.04, gz - L / 2 + 0.2 + i * 0.31); } }
        bloq(gx, gz, 1.1, L);
        G.box(0.06, 0.5, 1.2, '#c9ced4', gx, 2.05, gz - L / 2 + 0.2); placaSecao(sec === 'higiene' ? 'HIGIÊNICO' : 'COMIDA', sec === 'higiene' ? '#3a64b8' : '#e8742a', gx, 2.35, gz - L / 2 + 0.2, Math.PI / 2, 1.2);
      }
      // freezers de bebidas (parede norte)
      G.box(16, 0.9, 1.1, '#f4f4f0', 0, 0, -9.3); G.box(15.8, 0.05, 1.0, '#9ec7dd', 0, 0.9, -9.3); bloq(0, -9.3, 16, 1.1);
      G.box(16, 1.5, 0.5, '#e8eef2', 0, 0.95, -9.65); for (let i = 0; i < 8; i++) G.box(0.04, 1.4, 0.06, '#8c9199', -8 + i * 2.28, 1.0, -9.38);
      for (let i = 0; i < 44; i++) poe('bebida', 0.2, 0.34, 0.2, pk(CORES.bebida), -7.6 + (i % 22) * 0.72, i < 22 ? 0.92 : 1.42, -9.6 + (i < 22 ? 0.2 : 0));
      placaSecao('BEBIDAS', '#3fb7b0', 0, 2.7, -9.85, 0, 2.2);
      // ilha de frutas (frente, oeste)
      G.box(2.4, 0.75, 3.4, '#8a5a2b', -9.5, 0, 4.0); G.box(2.5, 0.06, 3.5, '#a8763f', -9.5, 0.75, 4.0); bloq(-9.5, 4.0, 2.4, 3.4);
      for (let j = 0; j < 48; j++) poe('fruta', 0.2, 0.18, 0.2, pk(CORES.fruta), -10.45 + (j % 6) * 0.38, 0.81, 2.6 + Math.floor(j / 6) * 0.38);
      G.box(0.06, 1.6, 0.06, '#8c9199', -9.5, 0.8, 4.0); placaSecao('FRUTAS', '#6cae3e', -9.5, 2.6, 4.0, Math.PI / 2, 1.4);
      // o ESTOQUE (canto nordeste): pilhas de caixas de papelão com placa
      const EST = [['higiene', 'HIGIÊNICO', '#3a64b8', -7.6], ['comida', 'COMIDA', '#e8742a', -5.6], ['bebida', 'BEBIDA', '#3fb7b0', -3.6], ['fruta', 'FRUTA', '#6cae3e', -1.6]];
      G.box(0.08, 3.0, 8.2, '#d8cfb8', 12.9, 0, -4.6);                                                   // parede do estoque (um pouco mais escura)
      R.mercadoEstoque = [];
      for (const [sec, txt, cor, z] of EST) {
        for (let a = 0; a < 3; a++) G.box(0.9, 0.55, 1.2, a % 2 ? '#b88a5a' : '#c89a64', 12.0, a * 0.56, z, '#d8b080');
        G.box(0.92, 0.08, 1.22, cor, 12.0, 0.42, z); bloq(12.0, z, 1.0, 1.3);
        placaSecao(txt, cor, 12.85, 2.2, z, -Math.PI / 2, 1.5);
        R.mercadoEstoque.push({ sec, x: 10.9, z });
      }
      // o CAIXA ativo (esteira de norte para sul: o cliente põe os produtos no norte, o scanner fica no sul) e um 2º caixa fechado
      const caixaGeo = (cx, cz, ativo) => {
        G.box(0.9, 0.9, 3.0, '#3a3a3e', cx, 0, cz); G.box(0.7, 0.03, 2.2, '#1c1c1f', cx, 0.9, cz - 0.3);
        G.box(0.5, 0.05, 0.4, ativo ? '#c0392b' : '#555a60', cx, 0.92, cz + 0.55); G.box(0.42, 0.02, 0.32, '#4a9ac8', cx, 0.97, cz + 0.55);   // scanner (vidro)
        G.box(0.36, 0.3, 0.3, '#2b3a48', cx + 0.35, 0.9, cz + 1.1); G.box(0.04, 0.22, 0.26, '#8fe04a', cx + 0.17, 1.0, cz + 1.1);            // registradora (visor para o cliente)
        G.box(0.06, 1.4, 0.06, '#8c9199', cx + 0.4, 0.9, cz - 1.4); G.box(0.36, 0.3, 0.06, ativo ? '#8fe04a' : '#c0392b', cx + 0.4, 2.3, cz - 1.4);   // luz do caixa (verde = aberto)
        bloq(cx, cz, 0.95, 3.0);
      };
      caixaGeo(4.6, 5.2, true); caixaGeo(8.2, 5.2, false);
      R.mercado = {
        caixa: { x: 4.6, z: 5.2, jog: { x: 5.55, z: 5.7, yaw: Math.PI }, esteira: { x: 4.6, y: 0.93, z0: 3.9, z1: 5.2 }, saco: { x: 4.6, y: 0.93, z: 6.3 } },
        fila: [{ x: 3.6, z: 4.6 }, { x: 3.6, z: 3.5 }, { x: 3.6, z: 2.4 }, { x: 3.6, z: 1.3 }, { x: 3.6, z: 0.2 }],
        depois: { x: 3.6, z: 7.4 },
        secoes: {
          higiene: { x: -6.7, z: -3.0, compra: { x0: -6.7, x1: -6.7, z0: -6.5, z1: 0.5 } },
          comida: { x: -2.7, z: -3.0, compra: { x0: -2.7, x1: -0.3, z0: -6.5, z1: 0.5 } },
          bebida: { x: 0.0, z: -8.35, compra: { x0: -6.5, x1: 6.5, z0: -8.35, z1: -8.35 } },
          fruta: { x: -7.9, z: 4.0, compra: { x0: -7.9, x1: -7.9, z0: 2.8, z1: 5.2 } },
        },
        cadu: { x: 9.15, z: 5.7, yaw: Math.PI }, caixaNPC: { x: 5.55, z: 5.7, yaw: Math.PI },
      };
      R.estoque = {}; for (const sec of Object.keys(F)) R.estoque[sec] = F[sec].map((g) => { const m = g.malha(MAT); grupo.add(m); return m; });
      for (let i = 0; i < 6; i++) { const x = -9 + i * 0.75; G.box(0.6, 0.55, 0.9, '#8c9199', x, 0.3, 7.6); }   // carrinhos
      bloq(-7.1, 7.6, 4.6, 0.95);
      for (let i = 0; i < 4; i++) R.pessoas.push({ tipo: 'vaga', area: { x0: -7, x1: 9, z0: -7.5, z1: 1.5 }, fem: rnd() < 0.5 });
    } else if (nome === 'cafeteria') {
      // sala maior (20 x 14) para o expediente: 8 mesas de 2 com corredor no meio, o caixa da Lúcia no fundo e a
      // BANCADA DE PREPARO na parede oeste (máquina de espresso, moedor, jarras de leite, xaropes, xícaras, sacas de café e o quadro de giz).
      sala(20, 14, 3.6, '#f2e6c8', '#8a5a2b', '#7a4f26', 0.6);
      placa('CAFETERIA', '#5b3a22', '#f6e2b8', 5, 0.8, 0, 2.9, -6.96);
      balcao(0.4, -5.4, 9, 1.0, '#6a4428', '#e8d8b8');
      G.box(0.8, 0.6, 0.5, '#3a3a3e', -2.4, 1.06, -5.5); G.box(0.2, 0.3, 0.2, '#c9ced4', -2.4, 1.66, -5.4);              // máquina de café do caixa
      G.box(2.4, 0.5, 0.7, '#e8f4f8', 2.6, 1.06, -5.4); for (let i = 0; i < 6; i++) G.box(0.3, 0.18, 0.3, pk(['#7a4a2a', '#f4a6c0', '#f2e6c8', '#c8352b']), 1.8 + i * 0.32, 1.1, -5.4);   // vitrine de bolos
      G.box(0.36, 0.3, 0.3, '#2b3a48', 0.4, 1.06, -5.5); G.box(0.3, 0.04, 0.2, '#8fe04a', 0.4, 1.3, -5.38);                // caixa registradora
      R.pessoas.push({ tipo: 'parado', x: 0.4, z: -6.35, yaw: -Math.PI / 2, fem: true, marca: 'lucia' });    // moça do caixa = Lúcia Alves (ver falarComLucia em cidade.js)
      R.extras.push({ x: 0.4, z: -4.3, r: 1.6, txt: 'Falar com a Lúcia', acao: 'caixa' });
      // --- a bancada de preparo (oeste)
      { const bx = -9.35, bz = -1.2, L = 4.4;
        G.box(1.1, 0.95, L, '#5b3a22', bx, 0, bz); G.box(1.2, 0.07, L + 0.1, '#d8c9a8', bx, 0.95, bz); bloq(bx, bz, 1.1, L);
        for (let k = 0; k < 4; k++) G.box(0.02, 0.6, 0.9, '#4a2c14', bx + 0.56, 0.15, bz - 1.65 + k * 1.1);              // portinhas do armário
        // máquina de espresso (cromada, com dois grupos e os portafiltros)
        G.box(0.75, 0.62, 1.2, '#c9ced4', bx - 0.12, 1.02, bz - 1.2); G.box(0.7, 0.08, 1.16, '#8c9199', bx - 0.12, 1.64, bz - 1.2);
        G.box(0.04, 0.3, 0.9, '#2a2d33', bx + 0.27, 1.22, bz - 1.2);
        for (const dz of [-0.28, 0.28]) { G.box(0.14, 0.1, 0.14, '#3a3a3e', bx + 0.32, 1.22, bz - 1.2 + dz); G.box(0.26, 0.04, 0.05, '#1c1c1f', bx + 0.45, 1.2, bz - 1.2 + dz); G.box(0.1, 0.08, 0.1, '#f2f2ee', bx + 0.35, 1.02, bz - 1.2 + dz); }
        for (let k = 0; k < 5; k++) G.box(0.12, 0.08, 0.12, pk(['#f2f2ee', '#7cb8e8', '#d4583a', '#5cc7a0']), bx - 0.3 + (k % 2) * 0.16, 1.72 + Math.floor(k / 2) * 0.08, bz - 1.5 + k * 0.14);   // xícaras em cima da máquina
        // moedor (corpo preto e funil de vidro com grãos)
        G.box(0.3, 0.45, 0.3, '#1c1c1f', bx - 0.15, 1.02, bz - 0.15); G.box(0.24, 0.26, 0.24, '#6b4a2c', bx - 0.15, 1.47, bz - 0.15); G.box(0.28, 0.04, 0.28, '#1c1c1f', bx - 0.15, 1.73, bz - 0.15);
        // jarras de leite inox, xaropes coloridos e pilhas de xícaras
        for (const dz of [0.35, 0.55]) G.box(0.14, 0.2, 0.14, '#d8dde2', bx + 0.25, 1.02, bz + dz);
        for (let k = 0; k < 5; k++) { const c = ['#c8352b', '#f2c230', '#7a4a24', '#6cae3e', '#d95fa0'][k]; G.box(0.09, 0.32, 0.09, c, bx - 0.35, 1.02, bz + 0.4 + k * 0.14); G.box(0.05, 0.06, 0.05, '#1c1c1f', bx - 0.35, 1.34, bz + 0.4 + k * 0.14); }
        for (let k = 0; k < 3; k++) for (let a = 0; a < 3 + k % 2; a++) G.box(0.14, 0.07, 0.14, '#f2f2ee', bx + 0.1, 1.02 + a * 0.075, bz + 1.35 + k * 0.22);
        G.box(0.4, 0.03, 0.3, '#3a2a1a', bx + 0.2, 1.0, bz + 1.0);                                                       // tapetinho de borracha
        // prateleira com sacas de café na parede e o quadro de giz com o cardápio
        G.box(0.3, 0.05, 3.2, '#5b3a22', -9.84, 2.15, bz); for (let k = 0; k < 6; k++) G.box(0.22, 0.34, 0.3, pk(['#8a5a2a', '#c89a5a', '#6a4428', '#e8d8b8']), -9.82, 2.2, bz - 1.25 + k * 0.5);
        const giz = guardar(texCanvas(64, 40, (g, w, h) => {
          g.fillStyle = '#1f2a22'; g.fillRect(0, 0, w, h); g.fillStyle = '#6a4428'; g.fillRect(0, 0, w, 2); g.fillRect(0, h - 2, w, 2); g.fillRect(0, 0, 2, h); g.fillRect(w - 2, 0, 2, h);
          g.fillStyle = '#f2efe6'; g.font = 'bold 7px monospace'; g.fillText('CAFES', 19, 10);
          g.font = '5px monospace'; ['cafezinho', 'c/ leite', 'cremoso', 'cappuccino'].forEach((t, i) => { g.fillText(t, 5, 18 + i * 6); g.fillRect(50, 15 + i * 6, 8, 1); });
          g.fillStyle = '#f2c230'; g.fillRect(52, 5, 6, 4); g.fillStyle = '#f2efe6'; g.fillRect(58, 6, 1, 2);
        }));
        const qd = new THREE.Mesh(guardar(new THREE.PlaneGeometry(1.7, 1.06)), guardar(new THREE.MeshLambertMaterial({ map: giz }))); qd.rotation.y = Math.PI / 2; qd.position.set(-9.97, 2.9, bz); grupo.add(qd);
        // luminária pendente em cima da bancada
        G.box(0.03, 0.7, 0.03, '#1c1c1f', -9.2, 2.9, bz); G.box(0.4, 0.18, 0.4, '#f0a020', -9.2, 2.72, bz);
        R.extras.push({ x: bx + 1.15, z: bz, r: 1.7, txt: 'Bancada de preparo', acao: 'bancada' });
      }
      const ms = [[-6, -1.5], [-2.6, -1.5], [2.6, -1.5], [6, -1.5], [-6, 2.6], [-2.6, 2.6], [2.6, 2.6], [6, 2.6]];
      const lugares = []; for (const [x, z] of ms) lugares.push(...mesa(x, z, '#8a5a2b', 2, '#e8d8b8'));
      for (const i of [0, 3, 6, 9]) R.pessoas.push({ tipo: 'senta', assento: lugares[i], fem: rnd() < 0.5 });
      for (const [x, z] of [[-9.2, -6.2], [9.2, -6.2], [9.2, 6.2], [-9.2, 6.2]]) { G.box(0.5, 0.5, 0.5, '#9a6a44', x, 0, z); G.box(0.7, 0.8, 0.7, '#3f8a3a', x, 0.5, z); bloq(x, z, 0.6, 0.6); }
    } else if (nome === 'pizzaria') {
      // (6.1.0) PIZZARIA FORNO A LENHA, montada para o trabalho (pizzaria.js): piso xadrez, meia-parede de azulejo, o FORNO A LENHA no canto
      //   noroeste (boca acesa: R.pizzaria.fogo pisca), a BANCADA da Carla do lado, o BALCÃO com o caixa do Mário no nordeste e, na ponta dele,
      //   a RETIRADA das entregas (pilha de caixas e a placa da bicicleta). 8 mesas de 2 com toalha xadrez, luminárias, bandeirinhas da Itália,
      //   quadros, plantas, prateleira de vinhos e azeites e sacos de farinha. O quadro do cardápio (com a pixel art dos 8 sabores) e as pizzas
      //   nas mesas são do pizzaria.js. Sem o pizzaria.js, a sala continua com o povo de enfeite (pessoas abaixo).
      sala(20, 14, 3.8, '#f2dcb8', '#f2efe6', '#2a2a2e', 0.6);
      R.cam = { dist: 9.5, pitch: 0.85 };
      const W2 = 10, D2 = 7, TIJ = ['#b8552e', '#a8442a', '#c8653a'];
      // meia-parede de azulejo verde e a faixa vermelha (norte, leste e oeste)
      G.box(2 * W2 - 0.1, 1.1, 0.04, '#2f7a4f', 0, 0, -D2 + 0.06); G.box(2 * W2 - 0.1, 0.08, 0.06, '#c8352b', 0, 1.1, -D2 + 0.07);
      for (const sx of [-1, 1]) { G.box(0.04, 1.1, 2 * D2 - 0.1, '#2f7a4f', sx * (W2 - 0.06), 0, 0); G.box(0.06, 0.08, 2 * D2 - 0.1, '#c8352b', sx * (W2 - 0.07), 1.1, 0); }
      for (let i = 0; i < 33; i++) G.box(0.02, 1.1, 0.05, '#256a42', -W2 + 0.3 + i * 0.6, 0, -D2 + 0.07);   // rejunte
      placa('PIZZARIA FORNO A LENHA', '#c8352b', '#fff6e0', 7.4, 0.75, 3.0, 3.2, -D2 + 0.04);
      // --- o FORNO A LENHA (domo de tijolinho em degraus, boca virada para o salão) com a chaminé e a lenha
      const fx = -6.6, fz = -5.4;
      G.box(3.0, 1.0, 2.4, '#8a6a4a', fx, 0, fz, '#a8886a');
      for (let i = 0; i < 6; i++) G.box(2.9 - i * 0.42, 0.3, 2.3 - i * 0.34, TIJ[i % 3], fx, 1.0 + i * 0.3, fz);
      G.box(0.5, 1.2, 0.5, '#8c8c90', fx, 2.8, fz - 0.4); G.box(0.6, 0.08, 0.6, '#5a5a5e', fx, 2.75, fz - 0.4);
      G.box(1.25, 0.85, 0.1, '#5a2a14', fx, 1.0, fz + 1.17);                                    // arco da boca
      G.box(0.95, 0.62, 0.04, '#1c0c06', fx, 1.08, fz + 1.2);
      { const fogo = new THREE.Mesh(guardar(new THREE.PlaneGeometry(0.82, 0.42)), guardar(new THREE.MeshBasicMaterial({ color: 0xff8a2a, transparent: true, opacity: 0.9 })));
        fogo.position.set(fx, 1.25, fz + 1.23); grupo.add(fogo);
        const brilho = new THREE.Mesh(guardar(new THREE.PlaneGeometry(1.6, 1.0)), guardar(new THREE.MeshBasicMaterial({ color: 0xffb050, transparent: true, opacity: 0.18, depthWrite: false })));
        brilho.rotation.x = -Math.PI / 2; brilho.position.set(fx, 0.02, fz + 1.75); grupo.add(brilho);
        R.pizzaria = { fogo, brilho }; }
      for (let i = 0; i < 4; i++) for (let k = 0; k < 3 - (i % 2); k++) G.box(0.62, 0.14, 0.14, i % 2 ? '#7a4a24' : '#8a5a2a', -9.1, i * 0.15, -3.6 + k * 0.17);   // lenha empilhada
      bloq(fx, fz, 3.0, 2.4); bloq(-9.1, -3.45, 0.7, 0.6);
      // pá de pizza encostada e sacos de farinha
      G.box(0.05, 1.7, 0.05, '#8a5a2a', -8.6, 0, -6.6); G.box(0.36, 0.03, 0.42, '#c8a070', -8.6, 1.66, -6.6);
      for (const [x, z] of [[-4.6, -6.55], [-4.1, -6.55]]) { G.box(0.42, 0.55, 0.32, '#efe8d8', x, 0, z); G.box(0.3, 0.12, 0.02, '#c8352b', x, 0.3, z + 0.17); }
      // --- a BANCADA da Carla (tampo de mármore): bolinhas de massa, molho, queijo, tábua e o cortador
      const bx = -2.7, bz = -6.05;
      G.box(2.8, 0.92, 0.9, '#6a4428', bx, 0, bz); G.box(2.9, 0.06, 1.0, '#e8e4dc', bx, 0.92, bz); bloq(bx, bz, 2.8, 0.9);
      for (let k = 0; k < 5; k++) G.box(0.16, 0.1, 0.16, '#f2e6c8', bx - 1.15 + k * 0.2, 0.98, bz - 0.25);
      G.box(0.32, 0.12, 0.32, '#c8352b', bx - 0.3, 0.98, bz + 0.05); G.box(0.26, 0.02, 0.26, '#a8201a', bx - 0.3, 1.1, bz + 0.05);   // molho
      G.box(0.3, 0.1, 0.3, '#f2d26a', bx + 0.15, 0.98, bz + 0.05);                                                                  // queijo ralado
      G.box(0.62, 0.03, 0.62, '#c8a070', bx + 0.85, 0.98, bz + 0.05); G.box(0.5, 0.012, 0.5, '#f2e6c8', bx + 0.85, 1.01, bz + 0.05);   // massa aberta na tábua
      G.box(0.04, 0.6, 1.6, '#4a2c14', bx, 1.5, -D2 + 0.1);                                        // prateleira de temperos
      for (let k = 0; k < 6; k++) G.box(0.12, 0.2, 0.12, ['#6cae3e', '#c8352b', '#f2c230', '#8a5a2a', '#f2f2ee', '#3a6a2a'][k], bx - 0.6 + k * 0.24, 1.82, -D2 + 0.2);
      G.box(1.6, 0.04, 0.24, '#4a2c14', bx, 1.8, -D2 + 0.18);
      // --- o BALCÃO: caixa do Mário (registradora) e, na ponta oeste, a RETIRADA das entregas
      const cx = 4.4, cz = -4.9;
      G.box(5.6, 1.0, 1.0, '#1f7a4d', cx, 0, cz, '#f4f4ec'); G.box(5.7, 0.06, 1.1, '#e8e2d2', cx, 1.0, cz); bloq(cx, cz, 5.6, 1.0);
      for (let i = 0; i < 7; i++) G.box(0.8, 0.6, 0.02, i % 2 ? '#f4f4ec' : '#c8352b', cx - 2.4 + i * 0.8, 0.2, cz + 0.51);   // frente listrada
      G.box(0.42, 0.32, 0.34, '#2b3a48', 6.2, 1.06, cz - 0.05); G.box(0.32, 0.05, 0.22, '#8fe04a', 6.2, 1.38, cz + 0.08); G.box(0.3, 0.06, 0.24, '#c9ced4', 6.2, 1.06, cz + 0.3);   // registradora
      G.box(0.24, 0.3, 0.24, '#e8e2d2', 5.3, 1.06, cz - 0.1); G.box(0.2, 0.06, 0.2, '#c8352b', 5.3, 1.36, cz - 0.1);   // pote de balinhas
      // retirada: placa "ENTREGAS" com a bicicleta desenhada e a pilha de caixas vazias no chão
      { const tex = guardar(texCanvas(48, 24, (g) => {
          g.fillStyle = '#f2c230'; g.fillRect(0, 0, 48, 24); g.fillStyle = '#2a1206'; g.fillRect(0, 0, 48, 1); g.fillRect(0, 23, 48, 1); g.fillRect(0, 0, 1, 24); g.fillRect(47, 0, 1, 24);
          g.font = 'bold 7px monospace'; g.textAlign = 'center'; g.fillText('ENTREGAS', 24, 8);
          g.fillStyle = '#c8352b'; for (const x0 of [13, 31]) { g.fillRect(x0 - 3, 14, 7, 1); g.fillRect(x0 - 3, 20, 7, 1); g.fillRect(x0 - 4, 15, 1, 5); g.fillRect(x0 + 4, 15, 1, 5); }
          g.fillRect(14, 14, 18, 1); g.fillRect(22, 11, 1, 4); g.fillRect(28, 11, 4, 1); g.fillRect(16, 12, 5, 1);
        }, true));
        const pl = new THREE.Mesh(guardar(new THREE.PlaneGeometry(1.4, 0.7)), guardar(new THREE.MeshLambertMaterial({ map: tex }))); pl.position.set(1.0, 2.2, -D2 + 0.05); grupo.add(pl); }
      for (let i = 0; i < 6; i++) G.box(0.5, 0.07, 0.5, i % 2 ? '#e8e2d2' : '#c8352b', 0.9, i * 0.075, -6.4);   // caixas de pizza dobradas
      R.pizzaria.carla = { x: bx, z: bz + 0.95, yaw: Math.PI / 2 };                  // de frente para a bancada
      R.pizzaria.forno = { x: fx + 0.2, z: fz + 1.95, yaw: Math.PI / 2 };            // de frente para a boca do forno
      R.pizzaria.mario = { x: 5.5, z: cz - 0.85, yaw: -Math.PI / 2 };               // atrás do caixa, olhando o salão
      R.pizzaria.pagar = { x: 5.6, z: cz + 1.0, yaw: Math.PI / 2 };                 // o cliente paga aqui (olhando o Mário)
      R.pizzaria.retirada = { x: 2.3, z: cz + 1.05 };                               // o jogador pega o pedido da entrega aqui
      R.pizzaria.balcaoEntrega = { x: 2.3, y: 1.04, z: cz };                         // onde aparece a caixa pronta (pizzaria.js)
      R.pizzaria.cardapio = { x: -3.3, y: 2.78, z: -D2 + 0.05 };                      // quadro do cardápio (pizzaria.js desenha)
      R.pizzaria.corredor = -2.6;                                                    // corredor entre o balcão e as mesas
      // --- as MESAS (2 lugares) com toalha xadrez vermelha e branca e luminária em cima
      const toalha = (x, z) => { for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) G.box(0.235, 0.01, 0.235, (i + j) % 2 ? '#f4f4ec' : '#c8352b', x - 0.3525 + i * 0.235, 0.79, z - 0.3525 + j * 0.235); G.box(0.98, 0.18, 0.02, '#c8352b', x, 0.62, z + 0.48); G.box(0.98, 0.18, 0.02, '#c8352b', x, 0.62, z - 0.48); };
      R.pizzaria.mesas = [];
      for (const [x, z] of [[-6.4, -0.6], [-2.6, -0.6], [1.2, -0.6], [5.0, -0.6], [-6.4, 3.4], [-2.6, 3.4], [1.2, 3.4], [5.0, 3.4]]) {
        const sl = mesa(x, z, '#7a4a2a', 2, '#f4f4ec'); toalha(x, z);
        G.box(0.02, 0.85, 0.02, '#1c1c1f', x, 2.95, z); G.box(0.34, 0.16, 0.34, '#c8352b', x, 2.8, z); G.box(0.24, 0.03, 0.24, '#fff2b0', x, 2.78, z);   // luminária (alta, para não tapar a câmera)
        G.box(0.06, 0.16, 0.06, '#f2f2ee', x + 0.3, 0.8, z - 0.32); G.box(0.06, 0.16, 0.06, '#8a5a2a', x + 0.38, 0.8, z - 0.32);   // sal e orégano
        R.pizzaria.mesas.push({ x, z, assentos: sl });
      }
      // --- bandeirinhas da Itália nas paredes leste e oeste e no fundo
      const band = (x0, z0, x1, z1, n) => { for (let i = 0; i < n; i++) { const t = (i + 0.5) / n, x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t, c = ['#1f8a4a', '#f4f4ec', '#c8352b'][i % 3];
        const dx = (x1 - x0) / n * 0.42, dz = (z1 - z0) / n * 0.42, y = 3.2 - Math.sin(t * Math.PI) * 0.25; G.tri([x - dx, y, z - dz], [x + dx, y, z + dz], [x, y - 0.32, z], c); } };
      band(-9.9, -6.5, -9.9, 6.0, 16); band(9.9, -6.5, 9.9, 6.0, 16); band(-9.5, -6.9, -4.6, -6.9, 7);
      // quadros (Itália, uma pizza, uma bicicleta) e plantas nos cantos
      for (const [z, c1, c2] of [[-3.0, '#1f8a4a', '#c8352b'], [1.4, '#f2c230', '#c8352b'], [4.8, '#3a64b8', '#f4f4ec']]) { G.box(0.05, 0.8, 1.0, '#5b3a22', 9.95, 1.7, z); G.box(0.05, 0.62, 0.82, c1, 9.92, 1.79, z); G.box(0.05, 0.3, 0.4, c2, 9.9, 1.95, z + 0.1); }
      for (const [x, z] of [[-9.3, 6.3], [9.3, 6.3], [9.3, -6.3]]) { G.box(0.5, 0.5, 0.5, '#9a6a44', x, 0, z); G.box(0.7, 0.9, 0.7, '#3f8a3a', x, 0.5, z); G.box(0.4, 0.4, 0.4, '#4fa04a', x, 1.4, z); bloq(x, z, 0.6, 0.6); }
      // prateleira de vinhos e azeites (parede leste)
      G.box(0.3, 0.05, 2.6, '#5b3a22', 9.82, 2.2, -0.2); G.box(0.3, 0.05, 2.6, '#5b3a22', 9.82, 1.7, -0.2);
      for (let k = 0; k < 9; k++) { const z = -1.3 + k * 0.28; G.box(0.1, 0.34, 0.1, k % 3 === 2 ? '#c8a020' : '#3a1a2a', 9.82, 2.25, z); G.box(0.04, 0.08, 0.04, '#1c1c1f', 9.82, 2.59, z); G.box(0.1, 0.3, 0.1, k % 2 ? '#2f6a2a' : '#6a1a1a', 9.82, 1.75, z + 0.1); }
      // pessoas de ENFEITE (só sem o pizzaria.js: com ele, quem cuida da pizzaria é ele)
      R.pessoas.push({ tipo: 'parado', x: fx + 0.2, z: fz + 1.95, yaw: Math.PI / 2, fem: true });                     // pizzaiola
      R.pessoas.push({ tipo: 'parado', x: 5.5, z: cz - 0.85, yaw: -Math.PI / 2, fem: false });
      const lugares = []; for (const M of R.pizzaria.mesas) lugares.push(...M.assentos);
      for (const i of [0, 1, 6, 11]) R.pessoas.push({ tipo: 'senta', assento: lugares[i], fem: rnd() < 0.5 });
    } else if (nome === 'restaurante') {
      sala(20, 16, 3.8, '#e8f2dc', '#d8d4cc', '#c8c4bc', 0.8);
      placa('RESTAURANTE', '#f4f4ec', '#1f7a4d', 6, 0.8, 0, 3.0, -7.96);
      // bufê (comida por quilo): balcão com as cubas coloridas, a balança e o caixa
      balcao(-2, -6.2, 11, 1.1, '#5f8a4a', '#d8d8d0');
      for (let i = 0; i < 12; i++) G.box(0.75, 0.08, 0.55, pk(['#f2c230', '#6cae3e', '#7a4a2a', '#f2f2ee', '#c8352b', '#e8742a']), -7 + i * 0.9, 1.08, -6.2);
      balcao(6.5, -6.2, 2.2, 1.0, '#3a414b'); G.box(0.6, 0.15, 0.5, '#c9ced4', 6.5, 1.06, -6.2);
      R.pessoas.push({ tipo: 'parado', x: 6.5, z: -7.1, yaw: -Math.PI / 2, fem: true });
      for (const x of [-5, -1.5]) R.pessoas.push({ tipo: 'parado', x, z: -5.2, yaw: Math.PI / 2, fem: rnd() < 0.5 });
      const lugares = []; for (const [x, z] of [[-6.5, -1.5], [-2.5, -1.5], [1.5, -1.5], [5.5, -1.5], [-6.5, 2.5], [-2.5, 2.5], [1.5, 2.5], [5.5, 2.5]]) lugares.push(...mesa(x, z, '#8a5a2b', 4, '#f4f4ec'));
      for (const i of [0, 5, 10, 17, 22]) R.pessoas.push({ tipo: 'senta', assento: lugares[i], fem: rnd() < 0.5 });
      for (const [x, z] of [[-9.2, -7.2], [9.2, -7.2], [-9.2, 7], [9.2, 7]]) { G.box(0.6, 0.6, 0.6, '#9a6a44', x, 0, z); G.box(0.8, 1.0, 0.8, '#3f8a3a', x, 0.6, z); bloq(x, z, 0.7, 0.7); }
    } else if (nome === 'academia') {
      // (6.2.0) ACADEMIA, refeita para os treinos (ver academia.js). Sala 22 x 16:
      //   SUL (z > 3,4): a RECEPÇÃO, com piso de madeira, o balcão do Diego (oeste), banco, bebedouro e o cartaz do plano.
      //   z = 3,4: a linha de CATRACAS (grade baixa de parede a parede). Duas passagens: ENTRADA (x = −1,55, só de fora para dentro
      //     e só com o plano pago) e SAÍDA (x = +1,55, só de dentro para fora). O academia.js liga/desliga as "portas" (R.academia.catracas[].col).
      //   NORTE: espelho, 3 ESTEIRAS (oeste), 2 SUPINOS (meio), COLCHONETES para o abdominal (sudoeste), halteres (leste) e a Fernanda no meio.
      //   O aparelho do jogador é sempre o mesmo de cada tipo (jog: true): a esteira de x = −5,6, o supino de x = 2,6 e o colchonete de x = −5,1.
      sala(22, 16, 4.0, '#5f6b7a', '#2e3238', '#383c42', 0.5);
      R.cam = { dist: 8, pitch: 0.86 }; R.fundo = 0x12161c;
      const ZC = 3.4, A = R.academia = { ZC, catracas: [], esteiras: [], supinos: [], colchonetes: [] };
      const novaMalha = (geo) => geo.malha(MAT);
      const plano = (tex, w, h, x, y, z, rx, ry) => { const m = new THREE.Mesh(guardar(new THREE.PlaneGeometry(w, h)), guardar(new THREE.MeshLambertMaterial({ map: tex }))); m.position.set(x, y, z); m.rotation.set(rx || 0, ry || 0, 0, 'YXZ'); grupo.add(m); return m; };
      // piso de madeira da recepção (por cima do piso de borracha)
      { const tex = guardar(texCanvas(64, 32, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = ['#8a5a32', '#7e5230', '#946238', '#82562f'][i % 4]; g.fillRect(0, i * 4, w, 4); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, i * 4 + 3, w, 1); g.fillRect(((i * 23) % 48) + 8, i * 4, 1, 4); } granular(g, w, h, 0.08, rnd); }, false));
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(6, 2.4); plano(tex, 22, 8 - ZC, 0, 0.006, (ZC + 8) / 2, -Math.PI / 2); }
      placa('ACADEMIA', '#1c1c1f', '#f2c230', 6, 0.9, 0, 3.1, -7.96);
      G.box(13, 2.2, 0.05, '#9ec7dd', -1.5, 0.45, -7.95); G.box(13.2, 0.08, 0.07, '#c9ced4', -1.5, 2.65, -7.94); G.box(13.2, 0.08, 0.07, '#c9ced4', -1.5, 0.4, -7.94);   // espelho com moldura
      G.box(22, 0.3, 0.04, '#f2c230', 0, 2.75, -7.97);                                                    // faixa amarela
      // ---- RECEPÇÃO
      balcao(-4.6, 5.6, 0.9, 3.0, '#1c1c1f', '#3a3a3e'); G.box(0.92, 0.12, 3.02, '#f2c230', -4.6, 0.7, 5.6);   // faixa amarela na frente
      G.box(0.08, 0.34, 0.5, '#1c1c1f', -4.8, 1.06, 5.0); G.box(0.02, 0.28, 0.44, '#3fb7b0', -4.74, 1.09, 5.0);   // monitor (a tela olha para o leste)
      G.box(0.3, 0.04, 0.4, '#3a3a3e', -4.55, 1.06, 6.4);                                                 // a maquininha do cartão
      A.recepcao = { x: -5.55, z: 5.6, yaw: 0, falar: { x: -3.55, z: 5.6 } };
      G.box(0.45, 2.1, 3.2, '#3a3a3e', -10.7, 0, 5.6); bloq(-10.7, 5.6, 0.5, 3.2);                         // prateleira de suplementos atrás do Diego
      for (let f = 0; f < 3; f++) for (let i = 0; i < 7; i++) G.box(0.22, 0.28, 0.22, pk(['#c8352b', '#f2f2ee', '#1c1c1f', '#f2c230', '#3a64b8', '#6cae3e']), -10.55, 0.55 + f * 0.6, 4.4 + i * 0.4);
      { const t = guardar(texCanvas(80, 56, (g, w, h) => {                                                 // cartaz do plano semanal (parede oeste, para o leste)
          g.fillStyle = '#1c1c1f'; g.fillRect(0, 0, w, h); g.fillStyle = '#f2c230'; g.fillRect(0, 0, w, 14); g.fillRect(0, h - 2, w, 2);
          g.font = "bold 9px Silkscreen, 'Courier New', monospace"; g.textAlign = 'center'; g.fillStyle = '#1c1c1f'; g.fillText('PLANO', w / 2, 11);
          g.fillStyle = '#f2f2ee'; g.fillText('SEMANAL', w / 2, 27); g.fillStyle = '#f2c230'; g.font = "bold 12px Silkscreen, 'Courier New', monospace"; g.fillText('400', w / 2, 43);
          g.fillStyle = '#f2f2ee'; g.font = "bold 7px Silkscreen, 'Courier New', monospace"; g.fillText('FAKES', w / 2, 52); }, true));
        plano(t, 1.3, 0.9, -10.96, 2.1, 7.4, 0, Math.PI / 2); }
      // banco, bebedouro e planta do lado leste da recepção
      G.box(2.4, 0.45, 0.55, '#3a3a3e', 7.4, 0, 7.45); G.box(2.4, 0.5, 0.08, '#3a3a3e', 7.4, 0.45, 7.7); bloq(7.4, 7.45, 2.4, 0.6);
      G.box(0.5, 1.05, 0.5, '#d8dde2', 10.4, 0, 4.6); G.box(0.36, 0.42, 0.36, '#7ab8d8', 10.4, 1.05, 4.6); bloq(10.4, 4.6, 0.55, 0.55);
      G.box(0.6, 0.55, 0.6, '#9a6a44', 10.3, 0, 7.3); G.box(0.8, 1.0, 0.8, '#3f8a3a', 10.3, 0.55, 7.3); bloq(10.3, 7.3, 0.7, 0.7);
      // ---- A LINHA DAS CATRACAS (grade de 1 m) e a ilha do meio com as duas catracas
      for (const [x0, x1] of [[-11, -2.1], [2.1, 11]]) {
        const cx = (x0 + x1) / 2, L = x1 - x0;
        G.box(L, 0.07, 0.08, '#c9ced4', cx, 0.98, ZC); G.box(L, 0.05, 0.05, '#8c9199', cx, 0.12, ZC); G.box(L - 0.1, 0.78, 0.03, '#6f8796', cx, 0.17, ZC);   // corrimão, base e o painel
        for (let x = x0 + 0.05; x <= x1; x += 1.5) G.box(0.07, 1.02, 0.07, '#c9ced4', x, 0, ZC);
        bloq(cx, ZC, L, 0.14);
      }
      for (const s of [-1, 1]) { G.box(0.14, 1.05, 0.9, '#c9ced4', s * 2.17, 0, ZC); bloq(s * 2.17, ZC, 0.14, 0.9); }   // a ponta da grade: as passagens viram um corredor
      G.box(2.0, 1.0, 0.9, '#2a2a2e', 0, 0, ZC, '#3a3a3e'); G.box(2.02, 0.1, 0.92, '#f2c230', 0, 0.78, ZC); bloq(0, ZC, 2.0, 0.9);                       // a ilha (as duas catracas, uma de cada lado)
      G.box(0.5, 0.06, 0.3, '#1c1c1f', -0.6, 1.0, ZC + 0.15); G.box(0.5, 0.06, 0.3, '#1c1c1f', 0.6, 1.0, ZC - 0.15);   // leitores
      for (const [tipo, s] of [['entrada', -1], ['saida', 1]]) {
        const x = s * 1.55;
        // placa em cima: ENTRADA (verde) / SAÍDA (vermelha), voltadas para quem vem
        const ttx = guardar(texLetreiro(tipo === 'entrada' ? 'ENTRADA' : 'SAÍDA', tipo === 'entrada' ? '#1f7a4d' : '#a8202a', '#f2f2ee', 1.1, 0.3));
        for (const ry of [0, Math.PI]) plano(ttx, 1.0, 0.28, x, 2.25, ZC + (ry ? -0.03 : 0.03), 0, ry);
        G.box(0.05, 1.2, 0.05, '#8c9199', s * 2.17, 1.05, ZC); G.box(0.05, 1.2, 0.05, '#8c9199', s * 1.0, 1.0, ZC); G.box(1.22, 0.05, 0.05, '#8c9199', x, 2.2, ZC);
        // o tripé: três braços num eixo inclinado (o de cima atravessa a passagem na altura da cintura). Gira 120° quando alguém passa.
        const hub = new THREE.Group(); hub.position.set(s * 1.0, 0.92, ZC);
        const u = new THREE.Vector3(s, 0, 0), a = new THREE.Vector3(0, Math.SQRT1_2, Math.SQRT1_2), w = new THREE.Vector3().crossVectors(u, a);
        hub.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(u, a, w));
        const gira = new THREE.Group(); hub.add(gira);
        const bg = new Geo(); bg.box(0.14, 0.09, 0.14, '#8c9199', 0, -0.045, 0); bg.box(0.12, 0.05, 0.12, '#c9ced4', 0, 0.04, 0);
        for (let k = 0; k < 3; k++) { const ang = k * Math.PI * 2 / 3, c = Math.cos(ang), sn = Math.sin(ang); for (let i = 1; i <= 8; i++) bg.box(0.075, 0.075, 0.075, '#e8ecef', c * (0.03 + i * 0.064), 0, -sn * (0.03 + i * 0.064)); }
        gira.add(novaMalha(bg)); grupo.add(hub);
        const col = { x0: x - 0.56, x1: x + 0.56, z0: ZC - 0.06, z1: ZC + 0.06 }; R.col.push(col);
        A.catracas.push({ tipo, x, z: ZC, col, colFechada: Object.assign({}, col), hub, gira });
      }
      // ---- ESTEIRAS (oeste, olhando para o espelho). A lona é uma malha à parte (textura que corre).
      const lona = (g, w, h) => { g.fillStyle = '#1a1b1e'; g.fillRect(0, 0, w, h); g.fillStyle = '#2c2e33'; for (let y = 0; y < h; y += 8) g.fillRect(0, y, w, 2); g.fillStyle = '#3a3d44'; g.fillRect(0, 0, 1, h); g.fillRect(w - 1, 0, 1, h); };
      for (const x of [-9.2, -7.4, -5.6]) {
        const z = -5.0, jog = x === -5.6;
        G.box(0.92, 0.18, 2.1, '#1c1c1f', x, 0, z); G.box(0.1, 0.07, 2.0, '#3a3a3e', x - 0.43, 0.18, z); G.box(0.1, 0.07, 2.0, '#3a3a3e', x + 0.43, 0.18, z);
        G.box(0.92, 0.2, 0.3, '#2a2a2e', x, 0.0, z - 1.05);                                                 // o motor (frente)
        for (const s of [-1, 1]) { G.box(0.07, 1.15, 0.07, '#8c9199', x + s * 0.42, 0.18, z - 1.02); G.box(0.05, 0.05, 0.62, '#8c9199', x + s * 0.42, 1.05, z - 0.72); }
        G.box(0.9, 0.3, 0.2, '#2a2a2e', x, 1.2, z - 1.05); G.box(0.42, 0.12, 0.02, jog ? '#3fb7b0' : '#2f6f9a', x, 1.3, z - 0.94);
        const tex = guardar(texCanvas(16, 64, lona, false)); tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(1, 2);
        const belt = plano(tex, 0.74, 1.95, x, 0.255, z, -Math.PI / 2);
        bloq(x, z, 0.98, 2.15);
        A.esteiras.push({ x, z, jog, belt, tex, z0: z - 0.75, z1: z + 0.75, y: 0.255 });
      }
      // ---- SUPINOS (meio): banco vermelho no comprimento de z, cabeça para o norte; a barra é uma peça à parte (sobe e desce)
      for (const x of [2.6, 5.6]) {
        const z = -4.0, jog = x === 2.6, zb = z - 0.55;
        G.box(0.38, 0.12, 1.3, '#c8352b', x, 0.33, z); G.box(0.1, 0.33, 0.1, '#3a3a3e', x, 0, z - 0.5); G.box(0.1, 0.33, 0.1, '#3a3a3e', x, 0, z + 0.5); G.box(0.5, 0.04, 0.3, '#3a3a3e', x, 0, z + 0.5);
        for (const s of [-1, 1]) { G.box(0.08, 1.3, 0.08, '#8c9199', x + s * 0.58, 0, zb - 0.12); G.box(0.12, 0.05, 0.16, '#8c9199', x + s * 0.58, 1.12, zb - 0.06); G.box(0.3, 0.05, 0.08, '#8c9199', x + s * 0.58, 0, zb - 0.12); }
        bloq(x, z - 0.15, 1.3, 1.6);
        const barra = new THREE.Group(), bgeo = new Geo();
        bgeo.box(2.0, 0.04, 0.04, '#c9ced4', 0, -0.02, 0);
        for (const s of [-1, 1]) { bgeo.box(0.06, 0.42, 0.42, '#1c1c1f', s * 0.78, -0.21, 0); bgeo.box(0.05, 0.3, 0.3, '#3a3a3e', s * 0.85, -0.15, 0); bgeo.box(0.04, 0.08, 0.08, '#8c9199', s * 0.71, -0.04, 0); }
        barra.add(novaMalha(bgeo)); barra.position.set(x, 1.19, zb - 0.06); grupo.add(barra);
        A.supinos.push({ x, z, jog, barra, rack: { x, y: 1.19, z: zb - 0.06 }, banco: 0.45 });
      }
      // ---- COLCHONETES (abdominal): no comprimento de z, cabeça para o norte
      for (const x of [-9.0, -7.7, -6.4, -5.1]) { G.box(0.9, 0.05, 1.8, '#2a5a3a', x, 0, 0.6); G.box(0.92, 0.01, 0.06, '#1c3a26', x, 0.05, -0.25); A.colchonetes.push({ x, z: 0.6, jog: x === -5.1, y: 0.05 }); }
      // ---- halteres (parede leste), anilhas e um leg press de enfeite
      G.box(0.7, 0.8, 4.0, '#3a3a3e', 10.3, 0, -4.5); bloq(10.3, -4.5, 0.75, 4.0);
      for (let i = 0; i < 9; i++) { const z = -6.2 + i * 0.42, c = i % 3 === 0 ? '#c8352b' : '#1c1c1f'; for (const dx of [-0.16, 0.16]) G.box(0.16, 0.16, 0.12, c, 10.3 + dx, 0.8, z); G.box(0.36, 0.04, 0.04, '#c9ced4', 10.3, 0.86, z); }
      for (const [x, z] of [[9.6, -7.3], [8.6, -7.3]]) { G.box(0.1, 1.2, 0.1, '#8c9199', x, 0, z); for (let k = 0; k < 4; k++) G.box(0.5, 0.5 - k * 0.07, 0.05, '#1c1c1f', x, 0.15 + k * 0.25, z + 0.06); bloq(x, z, 0.5, 0.3); }
      G.box(1.0, 0.5, 1.8, '#3a3a3e', 8.6, 0, 1.2); G.box(0.8, 0.6, 0.12, '#c8352b', 8.6, 0.5, 0.45); G.box(0.9, 0.08, 0.7, '#8c9199', 8.6, 0.9, 1.9); bloq(8.6, 1.2, 1.05, 1.85);
      G.box(0.5, 1.05, 0.5, '#d8dde2', -10.4, 0, 2.5); G.box(0.36, 0.42, 0.36, '#7ab8d8', -10.4, 1.05, 2.5); bloq(-10.4, 2.5, 0.55, 0.55);   // bebedouro de dentro
      A.fernanda = { x: -1.2, z: 1.2, yaw: -Math.PI / 2 };
      A.rosca = { x: 9.35, z: -4.4, yaw: Math.PI };
      A.vaga = { x0: 2.8, x1: 7.2, z0: -1.6, z1: 2.4 };
      // pessoas de enfeite (só se o academia.js não vier; com ele, quem coloca as pessoas é o academia.js)
      R.pessoas.push({ tipo: 'parado', x: A.recepcao.x, z: A.recepcao.z, yaw: 0, fem: false });
      for (const e of A.esteiras) if (!e.jog) R.pessoas.push({ tipo: 'esteira', x: e.x, z: e.z, yaw: Math.PI / 2, fem: rnd() < 0.5 });
      R.pessoas.push({ tipo: 'rosca', x: A.rosca.x, z: A.rosca.z, yaw: A.rosca.yaw, fem: false });
      R.pessoas.push({ tipo: 'vaga', area: A.vaga, fem: false });
    } else if (nome === 'bar') {
      sala(16, 12, 3.4, '#d9c27a', '#6e5a3a', '#5e4a2e', 0.5);
      placa('BAR', '#1f7a4d', '#f2e6c8', 2.4, 0.7, -4, 2.8, -5.96);
      balcao(-3, -4.3, 7, 1.0, '#5b3a22', '#8a5a2b');
      for (const y of [1.3, 1.9]) { G.box(6, 0.08, 0.35, '#5b3a22', -3, y, -5.75); for (let i = 0; i < 14; i++) G.box(0.12, 0.35, 0.12, pk(['#2f8a4a', '#8a5a2b', '#c9ced4', '#c8352b', '#f2c230']), -5.8 + i * 0.42, y + 0.08, -5.75); }
      R.pessoas.push({ tipo: 'parado', x: -3, z: -5.2, yaw: -Math.PI / 2, fem: false });                     // dono do bar
      const banq = []; for (let i = 0; i < 5; i++) { const x = -5.6 + i * 1.3; G.box(0.1, 0.75, 0.1, '#6c6c70', x, 0, -3.3); G.box(0.42, 0.08, 0.42, '#c8352b', x, 0.75, -3.3); banq.push(sentar(x, -3.3, 0, -1, 0.83, 'banqueta')); bloq(x, -3.3, 0.3, 0.3); }
      for (const i of [1, 3]) R.pessoas.push({ tipo: 'senta', assento: banq[i], fem: false });
      // sinuca e a TV
      G.box(2.6, 0.8, 1.5, '#5b3a22', 4.2, 0, -1.5); G.box(2.4, 0.05, 1.3, '#1f7a4d', 4.2, 0.8, -1.5); bloq(4.2, -1.5, 2.6, 1.5);
      R.pessoas.push({ tipo: 'parado', x: 4.2, z: -0.3, yaw: Math.PI / 2, fem: false }, { tipo: 'parado', x: 5.9, z: -1.5, yaw: Math.PI, fem: rnd() < 0.4 });
      G.box(2.0, 1.2, 0.08, '#1c1c1f', 5.5, 1.6, -5.95); G.box(1.8, 1.0, 0.04, '#3a64b8', 5.5, 1.7, -5.9);
      const lugares = []; for (const [x, z] of [[-4.5, 2], [-1, 2.5], [2.5, 2.8]]) lugares.push(...mesa(x, z, '#d23a2a', 4, '#d23a2a'));
      R.pessoas.push({ tipo: 'senta', assento: lugares[4], fem: rnd() < 0.5 }, { tipo: 'senta', assento: lugares[5], fem: rnd() < 0.5 });
    } else if (nome === 'cinema') {
      sala(24, 30, 6.5, '#5a2a2a', '#7a2a2a', '#6a2424', 0.7);
      R.cam = { dist: 9, pitch: 0.85 };
      // saguão (sul): bilheteria, pipoca, cartazes; parede com duas passagens para a sala (norte)
      balcao(-6, 11, 4, 1.0, '#a8443d', '#f2e6c8'); R.pessoas.push({ tipo: 'parado', x: -6, z: 10.1, yaw: Math.PI / 2, fem: true });
      balcao(6, 11, 4, 1.0, '#f2c230', '#f4f4ec'); G.box(0.9, 1.0, 0.7, '#e8f4f8', 6.8, 1.06, 11.1); for (let i = 0; i < 8; i++) G.box(0.15, 0.12, 0.15, '#f8f0c8', 6.5 + (i % 4) * 0.2, 1.1 + Math.floor(i / 4) * 0.15, 11.1);   // pipoca
      R.pessoas.push({ tipo: 'parado', x: 6, z: 10.1, yaw: Math.PI / 2, fem: false });
      for (const [x, cor] of [[-11.9, '#3a64b8'], [11.9, '#7a4fb0']]) G.box(0.06, 2.4, 1.6, cor, x, 1.1, 8);
      const zp = 4.0;                                                                                       // a parede entre o saguão e a sala
      { const P = new Geo(); for (const [x0, x1] of [[-12, -5], [-2.5, 2.5], [5, 12]]) { P.box(x1 - x0, 6.5, 0.3, '#4a2222', (x0 + x1) / 2, 0, zp); bloq((x0 + x1) / 2, zp, x1 - x0, 0.3); }
        const pm = P.malha(MAT); grupo.add(pm); R.ocl.push({ b: { x0: -12, x1: 12, z0: zp - 0.15, z1: zp + 0.15, y0: 0, y1: 6.5 }, mesh: pm }); }   // fica translúcida quando tapa a câmera
      // a sala: tela, escadinha de fileiras com poltronas vermelhas
      G.box(18, 6.0, 0.1, '#1c1c1f', 0, 0.3, -14.9); const tela = new THREE.Mesh(guardar(new THREE.PlaneGeometry(16, 5.2)), guardar(new THREE.MeshBasicMaterial({ color: 0xdfe8f0 }))); tela.position.set(0, 3.4, -14.8); grupo.add(tela); R.tela = tela;
      const lug = [];
      for (let f = 0; f < 6; f++) { const z = -8 + f * 1.8, y = f * 0.25; if (y > 0) { G.box(22, y, 1.8, '#4a1c1c', 0, 0, z); R.pisos.push({ x0: -11, x1: 11, z0: z - 0.9, z1: z + 0.9, y }); }
        for (let i = 0; i < 12; i++) { const x = -8.25 + i * 1.5; if (Math.abs(x) < 0.8) continue; G.box(0.62, 0.42, 0.6, '#a8202a', x, y, z + 0.2); G.box(0.62, 0.62, 0.12, '#a8202a', x, y + 0.42, z + 0.5); lug.push(sentar(x, z + 0.15, 0, -1, y + 0.45, 'poltrona')); bloq(x, z + 0.2, 0.62, 0.6); } }
      for (const i of [3, 9, 16, 21, 30, 44]) R.pessoas.push({ tipo: 'senta', assento: lug[i], fem: rnd() < 0.5 });
    } else if (nome === 'hospital') {
      sala(22, 16, 3.6, '#f4f6f8', '#e8eef4', '#d8e2ea', 0.6);
      placa('RECEPÇÃO', '#2f6f9a', '#f4f6f8', 4, 0.6, -4, 2.9, -7.96);
      balcao(-4, -5.4, 5, 1.0, '#2f6f9a', '#f4f6f8'); G.box(0.6, 0.4, 0.4, '#1c1c1f', -3.5, 1.06, -5.6);
      R.pessoas.push({ tipo: 'parado', x: -4, z: -6.3, yaw: -Math.PI / 2, fem: true });                      // enfermeira da recepção
      R.extras.push({ x: -4, z: -4.3, r: 1.6, txt: 'Falar com a enfermeira', acao: 'ficha' });
      const esp = []; for (let r = 0; r < 2; r++) for (let i = 0; i < 6; i++) { const x = 1.5 + i * 0.8, z = 0.5 + r * 2.2; G.box(0.6, 0.05, 0.55, '#3a8ac8', x, 0.45, z); G.box(0.6, 0.5, 0.06, '#3a8ac8', x, 0.5, z + 0.25); G.box(0.05, 0.45, 0.45, '#8c9199', x, 0, z); esp.push(sentar(x, z - 0.05, 0, -1, 0.5, 'cadeira')); bloq(x, z, 0.6, 0.6); }
      for (const i of [1, 4, 8]) R.pessoas.push({ tipo: 'senta', assento: esp[i], fem: rnd() < 0.5 });
      for (const x of [3, 7]) { G.box(1.2, 2.2, 0.08, '#c9d8e4', x, 0, -7.94); G.box(0.08, 0.08, 0.06, '#8c9199', x + 0.45, 1.05, -7.88); }   // portas dos consultórios
      G.box(2.0, 0.6, 0.8, '#f4f4f0', -8.5, 0.3, 2.5); for (const s of [-0.85, 0.85]) G.box(0.06, 0.3, 0.06, '#8c9199', -8.5 + s, 0, 2.5); bloq(-8.5, 2.5, 2.0, 0.8);   // maca
      R.pessoas.push({ tipo: 'vaga', area: { x0: -9, x1: 9, z0: -3, z1: 5 }, fem: false });                   // médico andando
    } else if (nome === 'lanche') {
      sala(12, 9, 3.2, '#f2b33a', '#c8c4bc', '#b8b4ac', 0.5);
      placa('LANCHE DO SEU VALDEMAR', '#a8202a', '#ffe9a8', 6, 0.6, 0, 2.6, -4.46);
      G.box(3, 1.2, 0.08, '#1c1c1f', -3, 1.2, -4.45); for (let i = 0; i < 5; i++) G.box(2.4, 0.06, 0.02, '#f4f4ec', -3, 1.4 + i * 0.18, -4.4);   // cardápio na parede
      const lugares = []; for (const [x, z] of [[-3, -0.5], [1, -0.5], [-3, 2.3], [1, 2.3]]) lugares.push(...mesa(x, z, '#c8352b', 2, '#f2e6c8'));
      R.pessoas.push({ tipo: 'senta', assento: lugares[1], fem: false }, { tipo: 'senta', assento: lugares[4], fem: true });
      G.box(1.2, 2.2, 0.08, '#5b3a22', 4, 0, -4.45);                                                           // porta da cozinha
    } else if (nome === 'esportiva') {
      // GOLAÇO ESPORTES: o piso é uma PISTA DE CORRIDA (raias vermelhas com linhas brancas, linha de largada com os números
      //   na frente da porta, gramado no meio com o pódio). A SALA agora é um RETÂNGULO de verdade (quatro paredes retas; antes
      //   tinha as pontas redondas, de estádio) e as raias também são retangulares.
      //   Vazia por enquanto: só o balcão do caixa, o pódio, uma trave e as faixas. Depois: comemorações, roupas, chuteiras...
      const L = 28, D = 16, Rr = D / 2, H = 4.4, PPM = 12, AZUL = '#1c3aa0', AMAR = '#f2c230';
      R.fundo = 0x0b1430; R.cam = { dist: 9, pitch: 0.85 };
      R.lim = { x0: -L / 2 + 0.35, x1: L / 2 - 0.35, z0: -Rr + 0.35, z1: Rr - 0.35 };
      const PX_ = (x) => (x + L / 2) * PPM, PY_ = (z) => (z + Rr) * PPM;
      const estadio = (g, e) => { g.beginPath(); g.rect(PX_(-L / 2 + e), PY_(-Rr + e), (L - 2 * e) * PPM, (D - 2 * e) * PPM); };   // contorno retangular (e = distância da parede)
      const tex = guardar(texCanvas(L * PPM, D * PPM, (g, w, h) => {
        g.fillStyle = '#0b1430'; g.fillRect(0, 0, w, h);
        g.fillStyle = '#b5482e'; estadio(g, 0); g.fill();                                   // a pista
        g.strokeStyle = '#f4f0e6'; g.lineWidth = 1.5; for (let k = 0; k < 5; k++) { estadio(g, 0.3 + k * 0.95); g.stroke(); }
        g.save(); estadio(g, 4.4); g.clip();                                                // o gramado com faixas de corte
        for (let i = 0; i * 1.2 < L; i++) { g.fillStyle = i % 2 ? '#3f8f3a' : '#4a9a42'; g.fillRect(i * 1.2 * PPM, 0, 1.2 * PPM + 1, h); }
        g.restore();
        g.strokeStyle = '#f4f0e6'; g.lineWidth = 2; estadio(g, 4.4); g.stroke();
        g.beginPath(); g.arc(PX_(0), PY_(0), 1.8 * PPM, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.moveTo(PX_(0), PY_(-Rr + 4.4)); g.lineTo(PX_(0), PY_(Rr - 4.4)); g.stroke();
        g.fillStyle = '#f4f0e6'; g.fillRect(PX_(3.2), PY_(Rr - 4.3), 0.25 * PPM, 4.0 * PPM);          // linha de largada (raias de baixo, na frente da porta)
        g.font = 'bold 9px monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
        for (let k = 0; k < 4; k++) g.fillText(String(k + 1), PX_(4.3), PY_(Rr - 0.78 - k * 0.95));
        granular(g, w, h, 0.07, rnd);
      }, false));
      const chao = new THREE.Mesh(guardar(new THREE.PlaneGeometry(L, D)), guardar(new THREE.MeshLambertMaterial({ map: tex }))); chao.rotation.x = -Math.PI / 2; grupo.add(chao);
      // paredes (só o lado de dentro): norte, leste, sul (com a porta) e oeste, retas; faixa amarela e rodapé
      const parede = (x0, z0, x1, z1, cor, ya, yb, dentro) => { const nx = dentro[0], nz = dentro[1]; G.quad([x0, ya, z0], [x1, ya, z1], [x1, yb, z1], [x0, yb, z0], cor, [nx, 0, nz]); };
      const segs = [[-L / 2, -Rr, L / 2, -Rr, [0, 1]], [L / 2, -Rr, L / 2, Rr, [-1, 0]], [L / 2, Rr, -L / 2, Rr, [0, -1]], [-L / 2, Rr, -L / 2, -Rr, [1, 0]]];
      for (const [x0, z0, x1, z1, n] of segs) {
        parede(x0, z0, x1, z1, AZUL, 0, H, n);
        const k = 0.03; parede(x0 + n[0] * k, z0 + n[1] * k, x1 + n[0] * k, z1 + n[1] * k, AMAR, 1.15, 1.55, n);
        const k2 = 0.05; parede(x0 + n[0] * k2, z0 + n[1] * k2, x1 + n[0] * k2, z1 + n[1] * k2, '#0e1a40', 0, 0.16, n);
      }
      // a porta (parede sul, no meio) e o capacho
      const pz = Rr - 0.03;
      G.quad([0.75, 0, pz], [-0.75, 0, pz], [-0.75, 2.35, pz], [0.75, 2.35, pz], '#e8e2d2', [0, 0, -1]);
      G.quad([0.62, 0, pz - 0.01], [-0.62, 0, pz - 0.01], [-0.62, 2.25, pz - 0.01], [0.62, 2.25, pz - 0.01], '#5d9fc4', [0, 0, -1]);
      G.box(1.6, 0.02, 0.9, '#1b7a3e', 0, 0, Rr - 0.6);
      R.entrada = { x: 0, z: Rr - 1.4, yaw: Math.PI / 2 }; R.saida = { x: 0, z: Rr - 0.9 };
      // o que tem por enquanto: letreiro, o balcão do caixa (vazio), o pódio no gramado, uma trave na ponta oeste e flâmulas
      placa('GOLAÇO ESPORTES', AZUL, AMAR, 7, 1.0, 0, 3.4, -Rr + 0.04);
      balcao(0, -Rr + 1.3, 5, 0.9, AZUL, AMAR); G.box(0.36, 0.3, 0.3, '#2b3a48', 1.6, 1.06, -Rr + 1.3);
      for (const [x, h, c] of [[-1.1, 0.55, '#c9ced4'], [0, 0.85, AMAR], [1.1, 0.4, '#c8823a']]) { G.box(1.05, h, 1.0, c, x, 0, 0, '#f4f4f0'); }
      bloq(0, 0, 3.3, 1.0);
      { const gx = -L / 2 + 3.4; for (const s of [-1, 1]) G.box(0.12, 2.0, 0.12, '#f8f8f4', gx, 0, s * 1.6); G.box(0.12, 0.12, 3.32, '#f8f8f4', gx, 2.0, 0); G.box(0.06, 0.06, 3.2, '#d8d8d0', gx - 0.9, 0, 0); bloq(gx - 0.45, 0, 1.0, 3.4); }
      const fl = ['#f2c230', '#1b7a3e', '#c8352b', '#f4f4f0'];
      for (let i = 0; i < 9; i++) { const x = -L / 2 + 2.5 + i * ((L - 5) / 8); G.box(0.7, 0.9, 0.04, fl[i % 4], x, 2.4, -Rr + 0.08); }   // só na parede norte (a sul fica sem desenhar, do lado da câmera)
    } else return null;

    const malha = G.malha(MAT); grupo.add(malha);
    return R;
  }

  window.FutebolJS.registrarFase({ id: 'interiores', nome: 'Interiores', nucleoMinimo: '4.9.4', iniciar: async () => {}, construir, LUGARES });
})();
