/* =====================================================================
   FUTEBOL JS · cidade.js · A CIDADEZINHA (arquivo SEPARADO do jogo.js, como fase1.js e fase2.js)
   ---------------------------------------------------------------------
   Como funciona
     - É uma "fase" registrada com FutebolJS.registrarFase({ id: 'cidade' }). O fase2.js chama Fases.executar('cidade') quando o
       personagem sai do prédio (no lugar do antigo "Continua..."). Também abre por um save (tela CARREGAR) com { fase: 'cidade' }.
     - Suba o cidade.js no GitHub junto do jogo.js / fase2.js (mesma pasta futebol-js/) e atualize o versao.txt.
     - Usa as variáveis internas do jogo.js (makeAthlete, scene, camera, GANCHO_RENDER, Fases, Cena, Musica, Som, T/Tf, I18N, HistoriaSave...)
       e, do fase2.js, só o modeloJogador() (o personagem com a roupa escolhida no guarda-roupa).

   O QUE TEM POR ENQUANTO (só o visual de fora; nada para entrar ou interagir ainda)
     - A planta combinada (prancha "Planta da cidadezinha"): 240 × 152 m, 1 unidade = 1 metro (o personagem tem ~1,65 m).
       Avenida asfaltada (a única), ruas de terra, praça com mastro, igrejinha, prédio do jogador, supermercado, cafeteria, cinema,
       bar, pizzaria, restaurante, lanche do seu Valdemar, academia, quadra de futsal coberta, society, várzea, lago com píer,
       ponto de ônibus, casas (as do João e dos Alves também, sem nada de especial ainda), árvores e morros em volta.
     - Carros andando pela avenida nas duas mãos: entram por um lado, saem pelo outro (somem na névoa) e PARAM quando o
       jogador (ou outro carro) está na frente; buzinam se ele ficar parado na frente deles.
     - Dinheiro: o ícone aparece ao sair de casa, com 150 fakes (salvo em historia.cidade.fakes).
     - Câmera em terceira pessoa: arraste a tela (ou Q/E) para girar, roda do mouse para aproximar; ela chega mais perto quando
       um prédio fica entre ela e o jogador.
     - SEM NPCs ainda (de propósito).

   CUIDADO COM "PISCAR" (z-fighting): nenhuma superfície fica no mesmo plano que outra virada para o mesmo lado.
     - O chão da cidade é UMA textura só (grama, terra, asfalto, faixas, praça, várzea pintados juntos); fora da cidade, faixas
       de chão que se encostam pela borda (sem sobrepor).
     - Tudo que fica "por cima" é volume de verdade com altura (calçada 12 cm, society 8 cm, quadra 10 cm, água 5 cm, píer 30 cm).
     - Peças grudadas na parede (janela, porta, barrado, faixas, placas) saem dela por distâncias diferentes (3, 4, 5, 7 cm...)
       e são sempre um pouco maiores ou menores que a parede, para nenhuma face coincidir.

   O QUE FICA SALVO (FutebolJS.historia.ler('cidade'))
     { ponto: 'chegada', fakes: 150, visitas }  e um save no espaço da tela CARREGAR: { fase: 'cidade', ponto, autosave: true, ... }
   ===================================================================== */
(function () {
  'use strict';

  const esperar = (ms) => (typeof Cena !== 'undefined' ? Cena.esperar(ms) : new Promise((r) => setTimeout(r, ms)));
  const pulando = () => typeof Cena !== 'undefined' && Cena.pulando;
  const OX = 6000;                                   // a cidade fica longe de tudo (campo, Fase 1, Fase 2, criador)
  const CEU = 0x9fd0ef;
  let UI = null, S = null, API = null;

  // ------------------------------------------------------------------ textos novos (pt → en, es, it, fr)
  const TRAD_CD = {
    'Use o direcional para andar e arraste a tela para girar a câmera.': ['Use the joystick to walk and drag the screen to turn the camera.', 'Usa el joystick para caminar y arrastra la pantalla para girar la cámara.', 'Usa il joystick per camminare e trascina lo schermo per ruotare la telecamera.', "Utilise le joystick pour marcher et fais glisser l'écran pour tourner la caméra."],
    'Agora você tem dinheiro: {0} fakes.': ['Now you have money: {0} fakes.', 'Ahora tienes dinero: {0} fakes.', 'Ora hai dei soldi: {0} fakes.', "Maintenant tu as de l'argent : {0} fakes."],
    'fakes': ['fakes', 'fakes', 'fakes', 'fakes'],
    'Dinheiro': ['Money', 'Dinero', 'Soldi', 'Argent'],
    'Modo história · Cidadezinha': ['Story mode · Small town', 'Modo historia · Pueblito', 'Modalità storia · Paesino', 'Mode histoire · Petite ville'],
  };
  for (const k of Object.keys(TRAD_CD)) if (!I18N[k]) I18N[k] = TRAD_CD[k];
  const nomeJog = () => PERSONAGEM.apelido || PERSONAGEM.nome || T('Você');

  // ------------------------------------------------------------------ números "aleatórios" fixos (a cidade é sempre igual)
  function semente(s) { return () => { s |= 0; s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  // ------------------------------------------------------------------ a PLANTA (em pixels da prancha: 5 px = 1 m; x de 0 a 1200, y de 0 a 760)
  const PX = (px) => px / 5 - 120, PZ = (py) => py / 5 - 76;
  const R = (l, t, w, h) => ({ x0: PX(l), x1: PX(l + w), z0: PZ(t), z1: PZ(t + h) });
  const LIM = { x0: -120, x1: 120, z0: -76, z1: 76 };
  const RUAS_TERRA = [R(295, 0, 26, 760), R(872, 0, 26, 760), R(0, 190, 600, 22), R(0, 560, 900, 22), R(388, 582, 14, 34), R(1030, 338, 30, 24)];
  const AV = { z0: -3.2, z1: 7.2, zc: 2 };                         // asfalto (sem as calçadas)
  const PISTAS = [{ z: 4.6, dir: 1 }, { z: -0.6, dir: -1 }];        // mão direita: quem vai para leste (+x) anda no lado sul (+z)
  const CALCADAS = [];                                             // calçadas elevadas (12 cm), com os vãos onde as ruas de terra cruzam
  {
    const vaos = [[-61, -55.8], [54.4, 59.6]];
    const faixa = (z0, z1) => { let x = -120; for (const [a, b] of vaos) { CALCADAS.push({ x0: x, x1: a, z0, z1, y: 0.12 }); x = b; } CALCADAS.push({ x0: x, x1: 120, z0, z1, y: 0.12 }); };
    faixa(-5.1, AV.z0); faixa(AV.z1, 10.5);
  }
  const PRACA = R(540, 228, 220, 127), PRACA_C = { x: PX(649), z: PZ(292) };
  const VARZEA = R(905, 150, 285, 190), VARZEA_L = R(925, 168, 245, 150);
  const SOCIETY = R(925, 535, 260, 175), SOCIETY_L = R(945, 553, 220, 140);
  const FUTSAL = R(335, 438, 140, 92), FUTSAL_L = R(346, 449, 118, 70);
  const LAGO = { cx: PX(260), cz: PZ(670), rx: 30, rz: 14 };
  const PIER = { x0: -54, x1: -37, z0: 54.4, z1: 56.2 };
  const SPAWN = { x: -78.8, z: -4.65 };                             // na porta do prédio (calçada norte)

  // ------------------------------------------------------------------ geometria: caixas e quadriláteros coloridos numa malha só
  const hexN = (h) => (typeof h === 'number' ? h : parseInt(String(h).slice(1), 16));
  const escurece = (h, k) => { const n = hexN(h); return (Math.round(((n >> 16) & 255) * k) << 16) | (Math.round(((n >> 8) & 255) * k) << 8) | Math.round((n & 255) * k); };
  class Geo {
    constructor() { this.p = []; this.n = []; this.c = []; }
    _cor(c) { const n = hexN(c); return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; }
    // quatro cantos em volta da face; "fora" diz para que lado ela olha (a ordem é corrigida sozinha)
    quad(a, b, c, d, cor, fora) {
      let ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2]; const vx = d[0] - a[0], vy = d[1] - a[1], vz = d[2] - a[2];
      let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      if (fora && nx * fora[0] + ny * fora[1] + nz * fora[2] < 0) { const t = b; b = d; d = t; nx = -nx; ny = -ny; nz = -nz; }
      const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
      const k = this._cor(cor);
      for (const v of [a, b, c, a, c, d]) { this.p.push(v[0], v[1], v[2]); this.n.push(nx, ny, nz); this.c.push(k[0], k[1], k[2]); }
      return this;
    }
    tri(a, b, c, cor, fora) {
      let ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2]; const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
      let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      if (fora && nx * fora[0] + ny * fora[1] + nz * fora[2] < 0) { const t = b; b = c; c = t; nx = -nx; ny = -ny; nz = -nz; }
      const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
      const k = this._cor(cor);
      for (const v of [a, b, c]) { this.p.push(v[0], v[1], v[2]); this.n.push(nx, ny, nz); this.c.push(k[0], k[1], k[2]); }
      return this;
    }
    // caixa com a BASE em y (vai de y até y + h); topo pode ter outra cor
    box(w, h, d, cor, x, y, z, topo) {
      const x0 = x - w / 2, x1 = x + w / 2, y0 = y, y1 = y + h, z0 = z - d / 2, z1 = z + d / 2;
      this.quad([x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], cor, [1, 0, 0]);
      this.quad([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], cor, [-1, 0, 0]);
      this.quad([x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0], topo == null ? cor : topo, [0, 1, 0]);
      if (y0 > 0.05) this.quad([x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], escurece(cor, 0.7), [0, -1, 0]);
      this.quad([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], cor, [0, 0, 1]);
      this.quad([x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], cor, [0, 0, -1]);
      return this;
    }
    get vazio() { return !this.p.length; }
    malha(mat) {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3));
      g.setAttribute('normal', new THREE.Float32BufferAttribute(this.n, 3));
      g.setAttribute('color', new THREE.Float32BufferAttribute(this.c, 3));
      return new THREE.Mesh(g, mat);
    }
  }

  // ------------------------------------------------------------------ texturas (canvas, pixeladas de perto e suaves de longe)
  function texCanvas(w, h, desenhar, mip) {
    const c = document.createElement('canvas'); c.width = w; c.height = h; desenhar(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c); t.magFilter = THREE.NearestFilter;
    if (mip) { t.minFilter = THREE.LinearMipmapLinearFilter; t.generateMipmaps = true; } else { t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; }
    return t;
  }
  // granulado: cada pixel fica um pouco mais claro/escuro (o "pixel art" do chão)
  function granular(g, w, h, forca, rnd) {
    const im = g.getImageData(0, 0, w, h), d = im.data;
    for (let i = 0; i < d.length; i += 4) {
      const k = 1 + (rnd() - 0.5) * forca;
      d[i] = Math.min(255, d[i] * k); d[i + 1] = Math.min(255, d[i + 1] * k); d[i + 2] = Math.min(255, d[i + 2] * k);
    }
    g.putImageData(im, 0, 0);
  }
  const VERDE = '#78a54c', TERRA = '#c39a63', ASFALTO = '#5f6267', CALCADA = '#c9c3b5', PISO_PRACA = '#ddd2b6';

  // O CHÃO DA CIDADE: uma textura só (2048 × 1024) com tudo pintado — nada de plano em cima de plano.
  function texChao() {
    const TW = 2048, TH = 1024, sx = TW / 240, sz = TH / 152;
    const gx = (x) => (x + 120) * sx, gz = (z) => (z + 76) * sz;
    return texCanvas(TW, TH, (g) => {
      const rnd = semente(77);
      const ret = (r, cor) => { g.fillStyle = cor; g.fillRect(gx(r.x0), gz(r.z0), (r.x1 - r.x0) * sx, (r.z1 - r.z0) * sz); };
      const elip = (cx, cz, rx, rz, cor) => { g.fillStyle = cor; g.beginPath(); g.ellipse(gx(cx), gz(cz), rx * sx, rz * sz, 0, 0, Math.PI * 2); g.fill(); };
      g.fillStyle = VERDE; g.fillRect(0, 0, TW, TH);
      for (let i = 0; i < 520; i++) {                                // manchas de grama (mais escura, mais seca)
        const x = -120 + rnd() * 240, z = -76 + rnd() * 152, r = 1 + rnd() * 5;
        g.globalAlpha = 0.25 + rnd() * 0.3; elip(x, z, r, r * (0.5 + rnd() * 0.6), rnd() < 0.6 ? '#5f8d3b' : '#9cb85e');
      }
      g.globalAlpha = 1;
      // ruas de terra (com as bordas gastas)
      for (const r of RUAS_TERRA) {
        ret(r, TERRA);
        g.globalAlpha = 0.5; ret({ x0: r.x0 - 0.5, x1: r.x0, z0: r.z0, z1: r.z1 }, '#a7a05a'); ret({ x0: r.x1, x1: r.x1 + 0.5, z0: r.z0, z1: r.z1 }, '#a7a05a'); g.globalAlpha = 1;
      }
      for (let i = 0; i < 160; i++) {                                // marcas de pneu/poças secas na terra
        const r = RUAS_TERRA[i % RUAS_TERRA.length], x = r.x0 + rnd() * (r.x1 - r.x0), z = r.z0 + rnd() * (r.z1 - r.z0);
        g.globalAlpha = 0.35; elip(x, z, 0.4 + rnd(), 0.3 + rnd() * 0.6, rnd() < 0.5 ? '#a9804d' : '#d6b27a');
      }
      g.globalAlpha = 1;
      // areia em volta do lago (a água é um volume à parte, 5 cm acima)
      elip(LAGO.cx, LAGO.cz, LAGO.rx + 2.2, LAGO.rz + 2.2, '#d7c28a'); elip(LAGO.cx, LAGO.cz, LAGO.rx + 0.3, LAGO.rz + 0.3, '#6c7b56');
      // várzea: terra batida, carecas e linhas de cal gastas
      ret(VARZEA, '#b98a52');
      for (let i = 0; i < 70; i++) { g.globalAlpha = 0.4; elip(VARZEA.x0 + 3 + rnd() * 51, VARZEA.z0 + 3 + rnd() * 32, 0.8 + rnd() * 3, 0.6 + rnd() * 2, rnd() < 0.5 ? '#a57643' : '#cfa46c'); }
      for (let i = 0; i < 30; i++) { g.globalAlpha = 0.5; elip(VARZEA.x0 + rnd() * 57, rnd() < 0.5 ? VARZEA.z0 + rnd() * 3 : VARZEA.z1 - rnd() * 3, 1 + rnd() * 2, 0.5 + rnd(), '#8fae55'); }
      g.globalAlpha = 0.85; g.strokeStyle = '#efe6cc'; g.lineWidth = 0.14 * sx;
      { const L = VARZEA_L, cz = (L.z0 + L.z1) / 2, cx = (L.x0 + L.x1) / 2;
        g.strokeRect(gx(L.x0), gz(L.z0), (L.x1 - L.x0) * sx, (L.z1 - L.z0) * sz);
        g.beginPath(); g.moveTo(gx(cx), gz(L.z0)); g.lineTo(gx(cx), gz(L.z1)); g.stroke();
        g.beginPath(); g.ellipse(gx(cx), gz(cz), 5 * sx, 5 * sz, 0, 0, Math.PI * 2); g.stroke();
        g.strokeRect(gx(L.x0), gz(cz - 8), 10 * sx, 16 * sz); g.strokeRect(gx(L.x1 - 10), gz(cz - 8), 10 * sx, 16 * sz);
        g.strokeRect(gx(L.x0), gz(cz - 3.5), 3.5 * sx, 7 * sz); g.strokeRect(gx(L.x1 - 3.5), gz(cz - 3.5), 3.5 * sx, 7 * sz); }
      g.globalAlpha = 1;
      // praça: grama mais clara, borda calçada, caminhos em cruz e o círculo do meio
      ret(PRACA, '#8cc266');
      ret({ x0: PRACA.x0, x1: PRACA.x1, z0: PRACA.z0, z1: PRACA.z0 + 1.4 }, PISO_PRACA); ret({ x0: PRACA.x0, x1: PRACA.x1, z0: PRACA.z1 - 1.4, z1: PRACA.z1 }, PISO_PRACA);
      ret({ x0: PRACA.x0, x1: PRACA.x0 + 1.4, z0: PRACA.z0, z1: PRACA.z1 }, PISO_PRACA); ret({ x0: PRACA.x1 - 1.4, x1: PRACA.x1, z0: PRACA.z0, z1: PRACA.z1 }, PISO_PRACA);
      ret({ x0: PRACA.x0, x1: PRACA.x1, z0: PRACA_C.z - 1.4, z1: PRACA_C.z + 1.4 }, PISO_PRACA); ret({ x0: PRACA_C.x - 1.4, x1: PRACA_C.x + 1.4, z0: PRACA.z0, z1: PRACA.z1 }, PISO_PRACA);
      elip(PRACA_C.x, PRACA_C.z, 5.5, 5.5, PISO_PRACA);
      // adro da igreja (piso na frente dela, ligando à praça)
      ret({ x0: 1, x1: 17, z0: -35.6, z1: PRACA.z0 }, PISO_PRACA);
      // calçadas (por baixo do volume de 12 cm: a cor só aparece se algo olhar por baixo)
      for (const c of CALCADAS) ret(c, CALCADA);
      // a AVENIDA (asfalto, bordas brancas, faixa amarela tracejada e faixa de pedestre na frente da praça)
      ret({ x0: -120, x1: 120, z0: AV.z0, z1: AV.z1 }, ASFALTO);
      for (let i = 0; i < 260; i++) { g.globalAlpha = 0.18; elip(-120 + rnd() * 240, AV.z0 + 0.5 + rnd() * 9.4, 0.5 + rnd() * 2, 0.3 + rnd() * 0.8, rnd() < 0.5 ? '#4c4f54' : '#777a7f'); }
      g.globalAlpha = 1;
      ret({ x0: -120, x1: 120, z0: AV.z0 + 0.25, z1: AV.z0 + 0.4 }, '#e9e6dc'); ret({ x0: -120, x1: 120, z0: AV.z1 - 0.4, z1: AV.z1 - 0.25 }, '#e9e6dc');
      for (let x = -120; x < 120; x += 8) ret({ x0: x, x1: x + 4, z0: AV.zc - 0.09, z1: AV.zc + 0.09 }, '#f2c230');
      ret({ x0: 6, x1: 13, z0: AV.zc - 0.12, z1: AV.zc + 0.12 }, ASFALTO);
      for (let z = AV.z0 + 0.6; z < AV.z1 - 0.5; z += 1.0) ret({ x0: 7.5, x1: 11.5, z0: z, z1: z + 0.5 }, '#efece2');
      granular(g, TW, TH, 0.12, rnd);
    }, true);
  }
  // fora da cidade: grama e estrada que se repetem (mesmo estilo)
  const texGrama = () => { const t = texCanvas(64, 64, (g, w, h) => { const rnd = semente(5); g.fillStyle = VERDE; g.fillRect(0, 0, w, h); for (let i = 0; i < 26; i++) { g.globalAlpha = 0.3; g.fillStyle = rnd() < 0.6 ? '#5f8d3b' : '#9cb85e'; g.beginPath(); g.ellipse(rnd() * w, rnd() * h, 2 + rnd() * 6, 1 + rnd() * 4, 0, 0, Math.PI * 2); g.fill(); } g.globalAlpha = 1; granular(g, w, h, 0.12, rnd); }, true); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
  const texEstrada = () => { const t = texCanvas(64, 64, (g, w, h) => {      // 64 px = 8 m (ao longo) × 10,4 m (de lado)
    const rnd = semente(9), py = h / 10.4; g.fillStyle = ASFALTO; g.fillRect(0, 0, w, h);
    g.fillStyle = '#e9e6dc'; g.fillRect(0, Math.round(0.25 * py), w, 1); g.fillRect(0, Math.round((10.4 - 0.4) * py), w, 1);
    g.fillStyle = '#f2c230'; g.fillRect(0, Math.round(5.2 * py) - 1, w / 2, 1);
    granular(g, w, h, 0.12, rnd);
  }, true); t.wrapS = THREE.RepeatWrapping; return t; };
  // alambrado (losangos de arame) e rede do gol: transparentes no vão (alphaTest: sem ordem de transparência, sem piscar)
  const texTela = (cor, passo) => { const t = texCanvas(16, 16, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = cor; for (let i = 0; i < 16; i++) { g.fillRect(i, i, 1, 1); g.fillRect(15 - i, i, 1, 1); } if (passo) { g.fillRect(0, 0, 16, 1); } }, false); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
  // placas das lojas: texto pixelado
  function texLetreiro(txt, fundo, frente, wM, hM) {
    const W = Math.max(32, Math.round(wM * 20)), H = Math.max(12, Math.round(hM * 20));
    return texCanvas(W, H, (g) => {
      g.fillStyle = fundo; g.fillRect(0, 0, W, H);
      g.fillStyle = frente; g.fillRect(0, 0, W, 1); g.fillRect(0, H - 1, W, 1); g.fillRect(0, 0, 1, H); g.fillRect(W - 1, 0, 1, H);
      let tam = Math.floor(H * 0.62); g.textAlign = 'center'; g.textBaseline = 'middle';
      const fonte = (t) => 'bold ' + t + "px Silkscreen, 'Courier New', monospace";
      g.font = fonte(tam); while (tam > 6 && g.measureText(txt).width > W - 6) { tam--; g.font = fonte(tam); }
      g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillText(txt, W / 2 + 1, H / 2 + 2); g.fillStyle = frente; g.fillText(txt, W / 2, H / 2 + 1);
    }, true);
  }
  // pisos das quadras (a quadra inteira numa textura: as linhas não ficam "por cima")
  const texSociety = () => texCanvas(512, 256, (g, w, h) => {
    const rnd = semente(31), sx = w / 52, sz = h / 35;
    for (let i = 0; i < 13; i++) { g.fillStyle = i % 2 ? '#4f9a3f' : '#5aa848'; g.fillRect(i * 4 * sx, 0, 4 * sx + 1, h); }
    g.strokeStyle = '#f4f4ec'; g.lineWidth = 2; const X = (m) => (m + 4) * sx, Z = (m) => (m + 3.6) * sz;
    g.strokeRect(X(0), Z(0), 44 * sx, 28 * sz); g.beginPath(); g.moveTo(X(22), Z(0)); g.lineTo(X(22), Z(28)); g.stroke();
    g.beginPath(); g.ellipse(X(22), Z(14), 4.5 * sx, 4.5 * sz, 0, 0, Math.PI * 2); g.stroke();
    g.strokeRect(X(0), Z(14 - 6), 6 * sx, 12 * sz); g.strokeRect(X(44 - 6), Z(14 - 6), 6 * sx, 12 * sz);
    granular(g, w, h, 0.08, rnd);
  }, true);
  const texFutsal = () => texCanvas(256, 256, (g, w, h) => {
    const rnd = semente(41), sx = w / 28, sz = h / 18.4;
    g.fillStyle = '#9aa3a8'; g.fillRect(0, 0, w, h);
    const X = (m) => (m + 2.2) * sx, Z = (m) => (m + 2.2) * sz;
    g.fillStyle = '#d07a33'; g.fillRect(X(0), Z(0), 23.6 * sx, 14 * sz);
    g.fillStyle = '#3d6f9e'; g.beginPath(); g.ellipse(X(0), Z(7), 5 * sx, 5.5 * sz, 0, -Math.PI / 2, Math.PI / 2); g.fill(); g.beginPath(); g.ellipse(X(23.6), Z(7), 5 * sx, 5.5 * sz, 0, Math.PI / 2, Math.PI * 1.5); g.fill();
    g.strokeStyle = '#f4f4ec'; g.lineWidth = 2;
    g.strokeRect(X(0), Z(0), 23.6 * sx, 14 * sz); g.beginPath(); g.moveTo(X(11.8), Z(0)); g.lineTo(X(11.8), Z(14)); g.stroke();
    g.beginPath(); g.ellipse(X(11.8), Z(7), 2.6 * sx, 2.6 * sz, 0, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.ellipse(X(0), Z(7), 5 * sx, 5.5 * sz, 0, -Math.PI / 2, Math.PI / 2); g.stroke(); g.beginPath(); g.ellipse(X(23.6), Z(7), 5 * sx, 5.5 * sz, 0, Math.PI / 2, Math.PI * 1.5); g.stroke();
    granular(g, w, h, 0.08, rnd);
  }, true);
  const texBandeira = () => texCanvas(40, 28, (g, w, h) => {
    g.fillStyle = '#1f9a4a'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#f2d230'; g.beginPath(); g.moveTo(w / 2, 3); g.lineTo(w - 4, h / 2); g.lineTo(w / 2, h - 3); g.lineTo(4, h / 2); g.closePath(); g.fill();
    g.fillStyle = '#23408f'; g.beginPath(); g.arc(w / 2, h / 2, 6.5, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#f4f4ec'; g.fillRect(w / 2 - 6, h / 2 - 1, 12, 1);
  }, false);

  // ------------------------------------------------------------------ peças de prédio (no "referencial" do prédio: frente = +z)
  // face: 'f' frente (+z), 'b' fundos (-z), 'r' direita (+x), 'l' esquerda (-x). u = posição ao longo da face; fora = quanto o CENTRO sai da parede.
  function naFace(G, w, d, face, u, y, fora, sw, sh, sd, cor) {
    if (face === 'f') G.box(sw, sh, sd, cor, u, y, d / 2 + fora);
    else if (face === 'b') G.box(sw, sh, sd, cor, u, y, -d / 2 - fora);
    else if (face === 'r') G.box(sd, sh, sw, cor, w / 2 + fora, y, u);
    else G.box(sd, sh, sw, cor, -w / 2 - fora, y, u);
  }
  // janela: moldura (frente a +5 cm), vidro (+7 cm) e peitoril (+15 cm) — nenhuma face no plano da parede
  function janela(G, w, d, face, u, y, jw, jh, moldura, vidro) {
    naFace(G, w, d, face, u, y - 0.1, 0, jw + 0.2, jh + 0.2, 0.1, moldura || '#f4f2ea');
    naFace(G, w, d, face, u, y, 0, jw, jh, 0.14, vidro || '#4f6f86');
    if (jw > 0.7) naFace(G, w, d, face, u, y + jh * 0.48, 0, 0.07, jh * 0.04 + 0.03, 0.16, moldura || '#f4f2ea');
    naFace(G, w, d, face, u, y - 0.16, 0.04, jw + 0.34, 0.08, 0.22, moldura || '#f4f2ea');
  }
  function porta(G, w, d, face, u, pw, ph, cor, moldura) {
    naFace(G, w, d, face, u, 0, 0, pw + 0.18, ph + 0.09, 0.1, moldura || '#f4f2ea');
    naFace(G, w, d, face, u, 0, 0, pw, ph, 0.14, cor);
    naFace(G, w, d, face, u + pw * 0.32, ph * 0.47, 0.08, 0.08, 0.08, 0.06, '#d8c070');   // maçaneta
  }
  // telhado de duas águas. eixo 'x' = cumeeira paralela à frente (caem frente e fundos); 'z' = cumeeira de frente para trás
  function telhado(G, w, d, h, rh, e, cor, eixo, corOitao) {
    const inf = escurece(cor, 0.55);
    if (eixo === 'x') {
      const yE = h - e * rh / (d / 2), xa = -w / 2 - e, xb = w / 2 + e, top = h + rh;
      for (const s of [1, -1]) {
        const a = [xa, yE, s * (d / 2 + e)], b = [xb, yE, s * (d / 2 + e)], c = [xb, top, 0], dd = [xa, top, 0];
        G.quad(a, b, c, dd, cor, [0, 1, s]); G.quad(a, b, c, dd, inf, [0, -1, -s]);
        G.box(xb - xa + 0.04, 0.16, 0.08, escurece(cor, 0.8), 0, yE - 0.12, s * (d / 2 + e + 0.02));           // testeira
      }
      for (const s of [1, -1]) G.tri([s * w / 2, h, d / 2], [s * w / 2, h, -d / 2], [s * w / 2, top, 0], corOitao, [s, 0, 0]);
      G.box(xb - xa + 0.1, 0.14, 0.34, escurece(cor, 0.85), 0, top - 0.1, 0);                              // cumeeira
    } else {
      const yE = h - e * rh / (w / 2), za = -d / 2 - e, zb = d / 2 + e, top = h + rh;
      for (const s of [1, -1]) {
        const a = [s * (w / 2 + e), yE, za], b = [s * (w / 2 + e), yE, zb], c = [0, top, zb], dd = [0, top, za];
        G.quad(a, b, c, dd, cor, [s, 1, 0]); G.quad(a, b, c, dd, inf, [-s, -1, 0]);
        G.box(0.08, 0.16, zb - za + 0.04, escurece(cor, 0.8), s * (w / 2 + e + 0.02), yE - 0.12, 0);
      }
      for (const s of [1, -1]) G.tri([w / 2, h, s * d / 2], [-w / 2, h, s * d / 2], [0, top, s * d / 2], corOitao, [0, 0, s]);
      G.box(0.34, 0.14, zb - za + 0.1, escurece(cor, 0.85), 0, top - 0.1, 0);
    }
  }
  // toldo listrado na frente (de y = ya, saindo p metros e caindo 0,55)
  function toldo(G, w, d, u, larg, ya, p, cores) {
    const n = Math.max(2, Math.round(larg / 0.9)), lw = larg / n, z0 = d / 2 + 0.02, z1 = d / 2 + p, y1 = ya - 0.55;
    for (let i = 0; i < n; i++) {
      const xa = u - larg / 2 + i * lw, xb = xa + lw, cor = cores[i % cores.length];
      G.quad([xa, y1, z1], [xb, y1, z1], [xb, ya, z0], [xa, ya, z0], cor, [0, 1, 1]);
      G.quad([xa, y1, z1], [xb, y1, z1], [xb, ya, z0], [xa, ya, z0], escurece(cor, 0.6), [0, -1, -1]);
      G.box(lw - 0.005, 0.3, 0.05, cor, (xa + xb) / 2, y1 - 0.29, z1 + 0.025);                               // babado
    }
  }
  function caixaDagua(G, x, y, z, cor) { G.box(1.8, 1.25, 1.8, cor || '#3a6fb0', x, y, z); G.box(1.95, 0.14, 1.95, escurece(cor || '#3a6fb0', 0.85), x, y + 1.24, z); }

  // ------------------------------------------------------------------ o mundo: materiais, listas de colisão e de câmera
  let MAT = null, MAT_DUPLO = null;
  const descartaveis = [];                      // texturas e materiais criados aqui (soltos na saída)
  function guardar(o) { descartaveis.push(o); return o; }
  function addMalha(G, x, z, rotY) { if (G.vazio) return null; const m = G.malha(MAT); m.position.set(x, 0, z); m.rotation.y = rotY || 0; S.grupo.add(m); return m; }
  const bloquear = (x0, x1, z0, z1, h) => { S.col.push({ x0, x1, z0, z1 }); if (h) S.camBox.push({ x0, x1, z0, z1, y0: 0, y1: h }); };

  // Prédio genérico. o = { r, frente: 1 (olha para +z) | -1, h, cor, ... }; desenha no referencial do prédio e gira.
  function edificio(o) {
    const r = o.r, w = r.x1 - r.x0, d = r.z1 - r.z0, cx = (r.x0 + r.x1) / 2, cz = (r.z0 + r.z1) / 2, G = new Geo();
    const h = o.h, cor = o.cor;
    G.box(w, h, d, cor, 0, 0, 0, '#9a968c');
    G.box(w + 0.08, 0.9, d + 0.08, o.barrado || escurece(cor, 0.72), 0, 0, 0);
    if (o.andares > 1) for (let a = 1; a < o.andares; a++) G.box(w + 0.06, 0.2, d + 0.06, o.faixa || escurece(cor, 0.85), 0, a * (h / o.andares) - 0.1, 0);
    if (o.montar) o.montar(G, w, d, h);
    if (o.fundos !== false) {                                         // janelas nos fundos e nos lados (prédios comerciais: ninguém fica "cego" de costas)
      for (const f of ['b', 'l', 'r']) { const L = f === 'b' ? w : d, n = Math.floor((L - 2) / 4); if (n < 1) continue;
        for (let a = 0; a < (o.andares || 1); a++) for (let i = 0; i < n; i++) janela(G, w, d, f, -L / 2 + (L / n) * (i + 0.5), a * (h / (o.andares || 1)) + 1.2, 1.0, 0.9); }
    }
    if (!o.telhado && o.equipamentos !== false && w > 8) {            // em cima da laje: caixa d'água e ar-condicionado
      caixaDagua(G, -w * 0.28, h + 0.45, -d * 0.2); G.box(1.0, 0.7, 0.8, '#d8d8d0', w * 0.25, h + 0.45, -d * 0.25); G.box(0.9, 0.6, 0.7, '#cfcfc6', w * 0.1, h + 0.45, d * 0.05);
    }
    let topo = h;
    if (o.telhado) { telhado(G, w, d, h, o.telhado.rh, o.telhado.e || 0.45, o.telhado.cor || '#b5552e', o.telhado.eixo || 'x', cor); topo = h + o.telhado.rh; }
    else { G.box(w + 0.14, 0.55, d + 0.14, o.platibanda || escurece(cor, 0.92), 0, h - 0.06, 0, '#8d8a82'); topo = h + 0.5; }
    const mesh = addMalha(G, cx, cz, o.frente < 0 ? Math.PI : 0);
    if (o.letreiro && mesh) {
      const L = o.letreiro, tex = guardar(texLetreiro(L.txt, L.fundo, L.cor, L.w, L.h));
      const mf = guardar(new THREE.MeshLambertMaterial({ map: tex })), mb = guardar(new THREE.MeshLambertMaterial({ color: hexN(L.fundo) }));
      const placa = new THREE.Mesh(guardar(new THREE.BoxGeometry(L.w, L.h, 0.16)), [mb, mb, mb, mb, mf, mb]);
      placa.position.set(L.u || 0, L.y, d / 2 + (L.fora || 0.16)); mesh.add(placa);
    }
    bloquear(r.x0, r.x1, r.z0, r.z1, topo);
    return mesh;
  }

  function casa(r, frente, cor, rnd, especial) {
    const w = r.x1 - r.x0, d = r.z1 - r.z0, laje = !especial && rnd() < 0.3, lado = rnd() < 0.5 ? -1 : 1;
    edificio({ r, frente, h: 2.9, cor, andares: 1, fundos: false, equipamentos: false,
      telhado: laje ? null : { rh: 1.35, e: 0.4, cor: rnd() < 0.7 ? '#b5552e' : '#9c4a2a', eixo: 'x' },
      platibanda: escurece(cor, 0.95),
      montar: (G) => {
        porta(G, w, d, 'f', lado * w * 0.27, 0.9, 2.1, ['#7a4a2a', '#5b3a22', '#3a5f8a', '#8a2f2a'][Math.floor(rnd() * 4)]);
        janela(G, w, d, 'f', -lado * w * 0.22, 1.0, 1.2, 1.05);
        janela(G, w, d, 'r', 0, 1.0, 1.0, 1.0); janela(G, w, d, 'l', 0, 1.0, 1.0, 1.0);
        if (laje) caixaDagua(G, -lado * w * 0.2, 3.35, -d * 0.15);
        if (especial) { G.box(1.6, 0.12, 1.0, '#a59d8a', lado * w * 0.27, 0, d / 2 + 0.5); }      // degrau na porta (casas do João e dos Alves)
      } });
  }

  // ------------------------------------------------------------------ montagem da cidade
  function montarCidade() {
    const g = S.grupo, rnd = semente(2026);
    // --- chão da cidade (uma textura) e chão de fora (faixas que só se encostam pela borda)
    const texC = guardar(texChao());
    const chao = new THREE.Mesh(guardar(new THREE.PlaneGeometry(240, 152)), guardar(new THREE.MeshLambertMaterial({ map: texC })));
    chao.rotation.x = -Math.PI / 2; g.add(chao);
    const tg = guardar(texGrama()), te = guardar(texEstrada());
    const faixaChao = (x0, x1, z0, z1, estrada) => {
      const geo = guardar(new THREE.PlaneGeometry(x1 - x0, z1 - z0)), uv = geo.attributes.uv;
      for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * (x1 - x0) / (estrada ? 8 : 10.7), estrada ? uv.getY(i) : uv.getY(i) * (z1 - z0) / 10.7);
      const m = new THREE.Mesh(geo, guardar(new THREE.MeshLambertMaterial({ map: estrada ? te : tg })));
      m.rotation.x = -Math.PI / 2; m.position.set((x0 + x1) / 2, 0, (z0 + z1) / 2); g.add(m);
    };
    faixaChao(-420, 420, -420, LIM.z0); faixaChao(-420, 420, LIM.z1, 420);
    for (const [a, b] of [[-420, LIM.x0], [LIM.x1, 420]]) { faixaChao(a, b, LIM.z0, AV.z0); faixaChao(a, b, AV.z0, AV.z1, true); faixaChao(a, b, AV.z1, LIM.z1); }
    // --- morros em volta (meio enterrados: cruzam o chão, nunca ficam no mesmo plano)
    const geoMorro = guardar(new THREE.SphereGeometry(1, 12, 7)), matMorro = [guardar(new THREE.MeshLambertMaterial({ color: 0x6f9a4a, flatShading: true })), guardar(new THREE.MeshLambertMaterial({ color: 0x5f8a40, flatShading: true })), guardar(new THREE.MeshLambertMaterial({ color: 0x7ea558, flatShading: true }))];
    const morro = (x, z, rx, ry, rz) => { const m = new THREE.Mesh(geoMorro, matMorro[Math.floor(rnd() * 3)]); m.scale.set(rx, ry, rz); m.position.set(x, -ry * 0.35, z); m.rotation.y = rnd() * 3; g.add(m); };
    for (let i = 0; i < 16; i++) morro(-260 + i * 34 + rnd() * 14, -125 - rnd() * 60, 30 + rnd() * 26, 14 + rnd() * 16, 22 + rnd() * 16);   // ao norte (a "serra" das fotos)
    for (let i = 0; i < 9; i++) morro(-240 + i * 60 + rnd() * 20, 125 + rnd() * 50, 26 + rnd() * 20, 7 + rnd() * 8, 18 + rnd() * 12);
    for (const s of [-1, 1]) for (let i = 0; i < 4; i++) { const z = (i < 2 ? -1 : 1) * (40 + rnd() * 60); morro(s * (175 + rnd() * 50), z, 24 + rnd() * 14, 8 + rnd() * 10, 22 + rnd() * 12); }

    // --- calçadas elevadas (12 cm) com meio-fio mais escuro
    { const G = new Geo(); for (const c of CALCADAS) { G.box(c.x1 - c.x0, 0.12, c.z1 - c.z0, '#8f8b80', (c.x0 + c.x1) / 2, 0, (c.z0 + c.z1) / 2, CALCADA); } addMalha(G, 0, 0); }

    // --- prédio do jogador (4 andares, caixa d'água, sacadas, portão de ferro azul aberto)
    edificio({ r: R(150, 268, 112, 87), frente: 1, h: 12, andares: 4, fundos: false, equipamentos: false, cor: '#e6c88e', barrado: '#b48a5a', faixa: '#cfae74',
      montar: (G, w, d) => {
        for (let a = 0; a < 4; a++) for (let i = 0; i < 5; i++) { const u = -w / 2 + 2.3 + i * ((w - 4.6) / 4); if (a === 0 && i === 2) continue; janela(G, w, d, 'f', u, a * 3 + 1.0, 1.3, 1.25); if (a > 0 && i % 2 === 1) { G.box(2.6, 0.14, 1.1, '#cfc7b4', u, a * 3 + 0.05, d / 2 + 0.55); G.box(2.6, 0.9, 0.06, '#5c6670', u, a * 3 + 0.19, d / 2 + 1.07); } }
        for (const f of ['r', 'l', 'b']) for (let a = 0; a < 4; a++) for (let i = 0; i < 4; i++) janela(G, w, d, f, (f === 'b' ? -w / 2 + 3 + i * ((w - 6) / 3) : -d / 2 + 2.5 + i * ((d - 5) / 3)), a * 3 + 1.0, 1.2, 1.2);
        // portão: vão escuro, batente e as duas folhas de grade azuis abertas para dentro da calçada
        naFace(G, w, d, 'f', 0, 0, 0, 2.0, 2.55, 0.1, '#e8e2d2'); naFace(G, w, d, 'f', 0, 0, 0, 1.7, 2.4, 0.14, '#1c1d22');
        G.box(0.06, 2.3, 0.85, '#2f5fa8', -0.9, 0.22, d / 2 + 0.47); G.box(0.06, 2.3, 0.85, '#2f5fa8', 0.9, 0.22, d / 2 + 0.47);
        G.box(2.4, 0.22, 0.9, '#b8b1a0', 0, 0, d / 2 + 0.45);                                                  // degrau (22 cm: mais alto que a calçada, nunca no mesmo plano)
        caixaDagua(G, -w * 0.25, 12.45, 0); caixaDagua(G, w * 0.2, 12.45, -d * 0.2, '#2f5e9a');
        G.box(3.0, 2.2, 3.0, '#d9c08a', w * 0.3, 12.45, d * 0.2);                                             // casa de máquinas
      } });
    S.col.push({ x0: SPAWN.x - 0.95, x1: SPAWN.x - 0.85, z0: -5.0, z1: -4.1 }, { x0: SPAWN.x + 0.85, x1: SPAWN.x + 0.95, z0: -5.0, z1: -4.1 });   // folhas abertas do portão
    S.pisos.push({ x0: SPAWN.x - 1.2, x1: SPAWN.x + 1.2, z0: -5.0, z1: -4.1, y: 0.22 });                                                         // degrau

    // --- comércio da avenida (lado norte: frente para o sul; lado sul: frente para o norte)
    edificio({ r: R(335, 275, 115, 80), frente: 1, h: 5.2, andares: 1, cor: '#f4efe2', barrado: '#c8352b', platibanda: '#c8352b',
      letreiro: { txt: 'SUPERMERCADO', fundo: '#c8352b', cor: '#fff6e0', w: 12, h: 1.3, y: 4.15 },
      montar: (G, w, d) => { naFace(G, w, d, 'f', -3, 0, 0, 7.5, 2.8, 0.14, '#5d7f96'); naFace(G, w, d, 'f', 5.5, 0, 0, 5.5, 2.8, 0.14, '#5d7f96'); naFace(G, w, d, 'f', 1.6, 0, 0, 2.4, 2.6, 0.18, '#2e3a44');
        for (let i = -2; i <= 2; i++) naFace(G, w, d, 'f', -3 + i * 1.5, 0, 0, 0.08, 2.8, 0.18, '#d8d8d0'); toldo(G, w, d, 0, w - 1, 3.2, 1.3, ['#c8352b', '#f4efe2']); } });
    edificio({ r: R(462, 305, 64, 50), frente: 1, h: 6.2, andares: 2, cor: '#f2d27a', faixa: '#e3b95a',
      letreiro: { txt: 'CAFETERIA', fundo: '#5b3a22', cor: '#f6e2b8', w: 7.5, h: 1.0, y: 6.75 },
      montar: (G, w, d) => { porta(G, w, d, 'f', -3.5, 1.4, 2.3, '#6a4428'); naFace(G, w, d, 'f', 2, 0.6, 0, 6, 1.9, 0.14, '#5d7f96');
        toldo(G, w, d, 0, w - 0.6, 2.85, 1.4, ['#6a4428', '#f2e6c8']); for (let i = 0; i < 3; i++) janela(G, w, d, 'f', -4 + i * 4, 4.1, 1.3, 1.3);
        G.box(w - 1, 0.12, 1.0, '#cdbf9f', 0, 3.15, d / 2 + 0.5); G.box(w - 1, 0.85, 0.06, '#3f3a34', 0, 3.27, d / 2 + 0.98); } });
    edificio({ r: R(775, 268, 92, 87), frente: 1, h: 8.5, andares: 1, cor: '#a8443d', barrado: '#6e2a26', platibanda: '#8a3530',
      letreiro: { txt: 'CINEMA', fundo: '#1c1c22', cor: '#f2c230', w: 9, h: 1.6, y: 5.6, fora: 0.5 },
      montar: (G, w, d) => {
        naFace(G, w, d, 'f', 0, 0, 0, 4.2, 2.8, 0.14, '#2c2c34');
        G.box(w - 2, 0.35, 2.2, '#2a2a30', 0, 3.6, d / 2 + 1.1);                                               // marquise
        for (let i = 0; i < 16; i++) G.box(0.14, 0.14, 0.14, '#ffe27a', -w / 2 + 1.4 + i * ((w - 2.8) / 15), 3.45, d / 2 + 2.22);
        for (const s of [-1, 1]) { naFace(G, w, d, 'f', s * 5.2, 0.9, 0.02, 2.1, 2.9, 0.12, '#f2f2ea'); naFace(G, w, d, 'f', s * 5.2, 1.0, 0.03, 1.8, 2.6, 0.14, s < 0 ? '#3a64b8' : '#7a4fb0'); }
        naFace(G, w, d, 'f', -6.8, 0, 0, 1.3, 1.1, 0.5, '#f4efe2');                                             // bilheteria
      } });
    edificio({ r: R(55, 432, 88, 58), frente: -1, h: 3.6, andares: 1, cor: '#d9c27a', barrado: '#8a6b3a', platibanda: '#c9ae62',
      letreiro: { txt: 'BAR', fundo: '#1f7a4d', cor: '#f2e6c8', w: 4, h: 1.0, y: 3.65 },
      montar: (G, w, d) => { for (const u of [-5, 0, 5]) { naFace(G, w, d, 'f', u, 0, 0, 3.6, 2.7, 0.14, '#24262b'); naFace(G, w, d, 'f', u, 2.35, 0.01, 3.7, 0.4, 0.16, '#8c9199'); } } });
    edificio({ r: R(560, 432, 92, 60), frente: -1, h: 3.9, andares: 1, cor: '#f4efe2', barrado: '#1f7a4d', platibanda: '#c8352b',
      letreiro: { txt: 'PIZZARIA', fundo: '#c8352b', cor: '#f4f4ec', w: 8, h: 1.1, y: 3.95 },
      montar: (G, w, d) => { porta(G, w, d, 'f', 0, 1.6, 2.4, '#7a4a2a'); for (const s of [-1, 1]) naFace(G, w, d, 'f', s * 5, 0.8, 0, 4.5, 1.8, 0.14, '#5d7f96');
        toldo(G, w, d, 0, w - 0.6, 3.2, 1.3, ['#1f7a4d', '#f4f4ec', '#c8352b']); } });
    edificio({ r: R(668, 432, 100, 66), frente: -1, h: 6.4, andares: 2, cor: '#b9dca0', faixa: '#8fbf74', barrado: '#5f8a4a',
      letreiro: { txt: 'RESTAURANTE', fundo: '#f4f4ec', cor: '#1f7a4d', w: 10, h: 1.1, y: 6.95 },
      montar: (G, w, d) => { porta(G, w, d, 'f', 0, 1.8, 2.4, '#5b3a22'); for (const s of [-1, 1]) naFace(G, w, d, 'f', s * 5.5, 0.7, 0, 5, 1.9, 0.14, '#5d7f96');
        toldo(G, w, d, 0, w - 0.6, 2.95, 1.2, ['#1f7a4d', '#e8f2dc']); for (let i = 0; i < 4; i++) janela(G, w, d, 'f', -7.5 + i * 5, 4.3, 1.4, 1.3);
        for (const s of [-1, 1]) { G.box(0.7, 0.6, 0.7, '#9a6a44', s * 2.2, 0, d / 2 + 0.75); G.box(0.8, 0.7, 0.8, '#3f8a3a', s * 2.2, 0.6, d / 2 + 0.75); } } });
    edificio({ r: R(788, 432, 74, 48), frente: -1, h: 3.4, andares: 1, cor: '#f2b33a', barrado: '#a8442a', platibanda: '#e09a2a',
      letreiro: { txt: 'LANCHE DO SEU VALDEMAR', fundo: '#a8202a', cor: '#ffe9a8', w: 12.5, h: 1.0, y: 3.45 },
      montar: (G, w, d) => { naFace(G, w, d, 'f', -2, 0.95, 0, 7, 1.7, 0.14, '#3b2a20'); G.box(7.4, 0.12, 0.7, '#d6c6a6', -2, 0.95, d / 2 + 0.3); naFace(G, w, d, 'f', 4.6, 0, 0, 1.0, 2.2, 0.14, '#5b3a22');
        for (let i = 0; i < 4; i++) { G.box(0.12, 0.7, 0.12, '#6c6c70', -4.6 + i * 1.7, 0, d / 2 + 1.1); G.box(0.45, 0.1, 0.45, '#c8352b', -4.6 + i * 1.7, 0.7, d / 2 + 1.1); } } });
    edificio({ r: R(908, 432, 98, 72), frente: -1, h: 6.8, andares: 2, cor: '#5f6b7a', faixa: '#f2c230', barrado: '#3a414b',
      letreiro: { txt: 'ACADEMIA', fundo: '#1c1c1f', cor: '#f2c230', w: 9, h: 1.2, y: 3.45 },
      montar: (G, w, d) => { porta(G, w, d, 'f', -5, 1.8, 2.4, '#2e3a44'); naFace(G, w, d, 'f', 2, 0.5, 0, 9, 2.2, 0.14, '#7aa2bd'); naFace(G, w, d, 'f', 0, 4.0, 0, w - 2, 2.1, 0.14, '#7aa2bd');
        for (let i = -4; i <= 4; i++) naFace(G, w, d, 'f', i * 2.0, 4.0, 0.01, 0.1, 2.1, 0.17, '#2e3a44'); } });
    // mesas de plástico do bar (na calçada) e banquinhos do lanche já estão no prédio; mesas aqui:
    { const G = new Geo(); for (const x of [-105.5, -100.5, -95.5]) { const z = 8.9; G.box(0.85, 0.06, 0.85, '#d23a2a', x, 0.82, z); G.box(0.08, 0.7, 0.08, '#d23a2a', x, 0.12, z);
        for (const [dx, dz] of [[-0.75, 0], [0.75, 0], [0, -0.75], [0, 0.75]]) { G.box(0.45, 0.06, 0.45, '#e8b02a', x + dx, 0.55, z + dz); G.box(0.42, 0.43, 0.06, '#e8b02a', x + dx * 1.3, 0.12, z + dz * 1.3); G.box(0.42, 0.45, 0.06, '#e8b02a', x + dx * 1.3, 0.61, z + dz * 1.3); }
        S.col.push({ x0: x - 0.9, x1: x + 0.9, z0: z - 0.9, z1: z + 0.9 }); } addMalha(G, 0, 0); }

    // --- igrejinha (nave branca, torre na frente virada para a praça, cruz)
    { const r = R(610, 140, 70, 62), w = r.x1 - r.x0, d = r.z1 - r.z0;
      edificio({ r, frente: 1, h: 6.5, andares: 1, fundos: false, cor: '#f6f3ea', barrado: '#e2b84a', telhado: { rh: 3.0, e: 0.5, cor: '#a8462a', eixo: 'z' },
        montar: (G) => { for (const f of ['r', 'l']) for (let i = 0; i < 3; i++) janela(G, w, d, f, -d / 2 + 2.5 + i * ((d - 5) / 2), 2.2, 1.0, 2.4, '#e2b84a', '#5a8fc8'); } });
      const tx = (r.x0 + r.x1) / 2, G = new Geo(), tz0 = r.z1 - 0.6, tw = 4.2;
      G.box(tw, 15, tw, '#f6f3ea', tx, 0, tz0 + tw / 2); G.box(tw + 0.08, 0.9, tw + 0.08, '#e2b84a', tx, 0, tz0 + tw / 2);
      for (const y of [6.5, 13]) G.box(tw + 0.1, 0.25, tw + 0.1, '#e2b84a', tx, y, tz0 + tw / 2);
      G.box(1.7, 2.9, 0.14, '#6a3b22', tx, 0, tz0 + tw + 0.0); G.box(1.95, 3.05, 0.1, '#e2b84a', tx, 0, tz0 + tw - 0.0);
      for (const [fx, fz] of [[0, 1], [1, 0], [-1, 0]]) G.box(fz ? 1.1 : 0.14, 1.9, fz ? 0.14 : 1.1, '#3a2a22', tx + fx * tw / 2, 10.3, tz0 + tw / 2 + fz * tw / 2);   // sineiras
      const ty = 15, top = 18.5, a = tw / 2 + 0.2, cz = tz0 + tw / 2;
      const cant = [[tx - a, cz - a], [tx + a, cz - a], [tx + a, cz + a], [tx - a, cz + a]];
      for (let i = 0; i < 4; i++) { const p = cant[i], q = cant[(i + 1) % 4], mx = (p[0] + q[0]) / 2 - tx, mz = (p[1] + q[1]) / 2 - cz; G.tri([p[0], ty, p[1]], [q[0], ty, q[1]], [tx, top, cz], '#a8462a', [mx, 0.6, mz]); }
      G.box(0.16, 1.8, 0.16, '#d8c070', tx, top - 0.1, cz); G.box(0.9, 0.16, 0.16, '#d8c070', tx, top + 1.05, cz);
      addMalha(G, 0, 0); bloquear(tx - tw / 2, tx + tw / 2, tz0, tz0 + tw, 19); }

    // --- casas (as do João e dos Alves com a borda dourada da planta: aqui, só um degrau e cores próprias por enquanto)
    { const cores = ['#f4efe2', '#f2d27a', '#a9d3e8', '#f2b8b0', '#b9dca0', '#e8c9a0', '#f6f1e8', '#d8e4ef', '#e9d1f0', '#f0e0a8'];
      const lista = [
        [30, 150, 1], [134, 150, 1], [186, 150, 1], [238, 150, 1], [30, 108, 1], [82, 108, 1], [134, 108, 1], [186, 108, 1], [238, 108, 1], [30, 232, -1], [82, 232, -1],
        [335, 150, 1], [387, 150, 1], [439, 150, 1], [491, 150, 1], [335, 108, 1], [387, 108, 1], [439, 108, 1], [491, 108, 1], [335, 232, -1], [387, 232, -1], [439, 232, -1],
        [720, 150, 1], [772, 150, 1], [824, 150, 1], [720, 108, 1], [772, 108, 1],
        [440, 600, -1], [492, 600, -1], [544, 600, -1], [648, 600, -1], [700, 600, -1], [752, 600, -1], [804, 600, -1],
        [440, 656, 1], [492, 656, 1], [544, 656, 1], [648, 656, 1], [700, 656, 1], [752, 656, 1],
        [170, 510, 1], [222, 510, 1], [30, 510, 1]];
      for (const [l, t, f] of lista) casa(R(l, t, 34, 26), f, cores[Math.floor(rnd() * cores.length)], rnd);
      casa(R(82, 148, 36, 28), 1, '#f6e7c8', rnd, 'joao');              // casa do João
      casa(R(596, 598, 36, 28), -1, '#cfe3f2', rnd, 'alves');          // casa dos Alves
    }

    // --- praça: canteiro do meio com o mastro e a bandeira, bancos e postes
    { const G = new Geo(), cx = PRACA_C.x, cz = PRACA_C.z;
      const geoC = guardar(new THREE.CylinderGeometry(2.4, 2.4, 0.5, 16)), geoG = guardar(new THREE.CylinderGeometry(2.15, 2.15, 0.56, 16));
      const can = new THREE.Mesh(geoC, guardar(new THREE.MeshLambertMaterial({ color: 0xcfc4a6 }))); can.position.set(cx, 0.25, cz); g.add(can);
      const gra = new THREE.Mesh(geoG, guardar(new THREE.MeshLambertMaterial({ color: 0x5f9a44 }))); gra.position.set(cx, 0.28, cz); g.add(gra);
      G.box(0.16, 10, 0.16, '#d8d8d0', cx, 0.5, cz); G.box(0.3, 0.3, 0.3, '#d8c070', cx, 10.5, cz);
      const band = new THREE.Mesh(guardar(new THREE.PlaneGeometry(2.4, 1.68)), guardar(new THREE.MeshLambertMaterial({ map: guardar(texBandeira()), side: THREE.DoubleSide })));
      band.position.set(cx + 1.3, 9.4, cz); g.add(band); S.bandeira = band;
      S.col.push({ x0: cx - 2.5, x1: cx + 2.5, z0: cz - 2.5, z1: cz + 2.5 });
      const banco = (x, z, rot) => { const lx = rot ? 0.5 : 1.8, lz = rot ? 1.8 : 0.5; G.box(lx, 0.1, lz, '#8a5a2b', x, 0.42, z); for (const s of [-0.7, 0.7]) G.box(rot ? 0.4 : 0.12, 0.42, rot ? 0.12 : 0.4, '#9a968c', x + (rot ? 0 : s), 0, z + (rot ? s : 0)); S.col.push({ x0: x - lx / 2, x1: x + lx / 2, z0: z - lz / 2, z1: z + lz / 2 }); };
      for (const [dx, dz, ro] of [[-6.5, -3, 0], [6.5, -3, 0], [-6.5, 3, 0], [6.5, 3, 0], [-3, -7.5, 1], [3, 7.5, 1], [-14, -3, 0], [14, 3, 0]]) banco(cx + dx, cz + dz, ro);
      for (const [dx, dz] of [[-9, -6], [9, -6], [-9, 6], [9, 6], [-20, 0], [20, 0]]) { G.box(0.14, 4, 0.14, '#3f4348', cx + dx, 0, cz + dz); G.box(0.5, 0.45, 0.5, '#f4efc8', cx + dx, 4, cz + dz); S.col.push({ x0: cx + dx - 0.2, x1: cx + dx + 0.2, z0: cz + dz - 0.2, z1: cz + dz + 0.2 }); }
      addMalha(G, 0, 0); }

    // --- postes da avenida (dos dois lados) e ponto de ônibus
    { const G = new Geo();
      for (let x = -112; x <= 112; x += 24) for (const [z, s] of [[-3.55, 1], [7.55, -1]]) { if ((x > -63 && x < -54) || (x > 52 && x < 62)) continue;
        G.box(0.18, 7, 0.18, '#7d8288', x, 0.12, z); G.box(0.12, 0.12, 1.6, '#7d8288', x, 6.95, z + s * 0.75); G.box(0.35, 0.18, 0.6, '#f4efc8', x, 6.8, z + s * 1.5);
        S.col.push({ x0: x - 0.2, x1: x + 0.2, z0: z - 0.2, z1: z + 0.2 }); }
      const bx = -114.6, bz = 9.0;                                       // ponto de ônibus (calçada sul, lado da saída da cidade)
      G.box(3.6, 0.1, 1.9, '#2f6f9a', bx, 2.5, bz); for (const s of [-1.6, 1.6]) G.box(0.1, 2.38, 0.1, '#5c6670', bx + s, 0.12, bz + 0.75);
      G.box(3.4, 1.6, 0.06, '#9ec7dd', bx, 0.75, bz + 0.85); G.box(2.6, 0.08, 0.45, '#8a5a2b', bx, 0.55, bz + 0.5); G.box(0.1, 2.6, 0.1, '#5c6670', bx + 2.4, 0.12, bz - 0.6); G.box(0.7, 0.5, 0.06, '#2f6f9a', bx + 2.4, 2.55, bz - 0.6);
      S.col.push({ x0: bx - 1.8, x1: bx + 1.8, z0: bz + 0.5, z1: bz + 0.95 }, { x0: bx + 2.25, x1: bx + 2.55, z0: bz - 0.75, z1: bz - 0.45 });
      addMalha(G, 0, 0); }

    // --- quadra de futsal coberta (piso com as linhas na textura, colunas, telhado de duas águas, gols)
    { const r = FUTSAL, w = r.x1 - r.x0, d = r.z1 - r.z0, cx = (r.x0 + r.x1) / 2, cz = (r.z0 + r.z1) / 2;
      const mt = guardar(new THREE.MeshLambertMaterial({ map: guardar(texFutsal()) })), mc = guardar(new THREE.MeshLambertMaterial({ color: 0x7d868b }));
      const piso = new THREE.Mesh(guardar(new THREE.BoxGeometry(w, 0.1, d)), [mc, mc, mt, mc, mc, mc]); piso.position.set(cx, 0.05, cz); g.add(piso);
      S.pisos.push({ x0: r.x0, x1: r.x1, z0: r.z0, z1: r.z1, y: 0.1 });
      const G = new Geo(), hc = 6.2, rh = 1.8;
      for (let i = 0; i <= 4; i++) for (const s of [-1, 1]) { const x = r.x0 + 0.3 + i * (w - 0.6) / 4, z = cz + s * (d / 2 - 0.3); G.box(0.4, hc, 0.4, '#8c949c', x, 0.1, z); S.col.push({ x0: x - 0.25, x1: x + 0.25, z0: z - 0.25, z1: z + 0.25 }); }
      { const e = 0.6, xa = r.x0 - e, xb = r.x1 + e, yE = hc + 0.1 - e * rh / (d / 2), top = hc + 0.1 + rh;
        for (const s of [1, -1]) { const a = [xa, yE, cz + s * (d / 2 + e)], b = [xb, yE, cz + s * (d / 2 + e)], c = [xb, top, cz], dd = [xa, top, cz]; G.quad(a, b, c, dd, '#a7b0b8', [0, 1, s]); G.quad(a, b, c, dd, '#5f666d', [0, -1, -s]); }
        for (let i = 0; i <= 4; i++) { const x = r.x0 + 0.3 + i * (w - 0.6) / 4; G.box(0.2, 0.3, d - 0.2, '#7d868b', x, hc + 0.1, cz); }
        S.camBox.push({ x0: xa, x1: xb, z0: r.z0 - e, z1: r.z1 + e, y0: hc - 0.3, y1: top }); }
      for (const s of [-1, 1]) { const gx = cx + s * 11.8; for (const t of [-1.5, 1.5]) G.box(0.1, 2.0, 0.1, '#f4f4ec', gx + s * 0.05, 0.1, cz + t); G.box(0.1, 0.1, 3.1, '#f4f4ec', gx + s * 0.05, 2.1, cz); }
      addMalha(G, 0, 0);
      S.redes.push({ x: cx - 11.8, z: cz, larg: 3, alt: 2.0, prof: 1.0, dir: -1, y: 0.1 }, { x: cx + 11.8, z: cz, larg: 3, alt: 2.0, prof: 1.0, dir: 1, y: 0.1 }); }

    // --- society (grama sintética 8 cm, alambrado alto, gols)
    { const r = SOCIETY, w = r.x1 - r.x0, d = r.z1 - r.z0, cx = (r.x0 + r.x1) / 2, cz = (r.z0 + r.z1) / 2;
      const mt = guardar(new THREE.MeshLambertMaterial({ map: guardar(texSociety()) })), mc = guardar(new THREE.MeshLambertMaterial({ color: 0x3f7a33 }));
      const piso = new THREE.Mesh(guardar(new THREE.BoxGeometry(w, 0.08, d)), [mc, mc, mt, mc, mc, mc]); piso.position.set(cx, 0.04, cz); g.add(piso);
      S.pisos.push({ x0: r.x0, x1: r.x1, z0: r.z0, z1: r.z1, y: 0.08 });
      cerca(r, 4.0, [{ lado: 'n', a: 88, b: 92 }], 0.08);
      const G = new Geo(); for (const s of [-1, 1]) { const gx = cx + s * 22; for (const t of [-2.5, 2.5]) G.box(0.12, 2.2, 0.12, '#f4f4ec', gx, 0.08, cz + t); G.box(0.12, 0.12, 5.12, '#f4f4ec', gx, 2.28, cz); }
      addMalha(G, 0, 0);
      S.redes.push({ x: cx - 22, z: cz, larg: 5, alt: 2.2, prof: 1.2, dir: -1, y: 0.08 }, { x: cx + 22, z: cz, larg: 5, alt: 2.2, prof: 1.2, dir: 1, y: 0.08 }); }

    // --- várzea (o chão já está pintado): alambrado baixo, gols de ferro e o portão do lado da avenida
    { const r = VARZEA, cz = (VARZEA_L.z0 + VARZEA_L.z1) / 2;
      cerca(r, 2.6, [{ lado: 's', a: 86, b: 92 }], 0);
      const G = new Geo(); for (const gx of [VARZEA_L.x0, VARZEA_L.x1]) { for (const t of [-3, 3]) G.box(0.14, 2.2, 0.14, '#c9c9c0', gx, 0, cz + t); G.box(0.14, 0.14, 6.14, '#c9c9c0', gx, 2.2, cz); }
      addMalha(G, 0, 0);
      S.redes.push({ x: VARZEA_L.x0, z: cz, larg: 6, alt: 2.2, prof: 1.3, dir: -1, y: 0 }, { x: VARZEA_L.x1, z: cz, larg: 6, alt: 2.2, prof: 1.3, dir: 1, y: 0 }); }
    redesDosGols();

    // --- lago (água 5 cm acima do chão pintado), píer de madeira e taboas
    { const agua = new THREE.Mesh(guardar(new THREE.CircleGeometry(1, 48)), guardar(new THREE.MeshLambertMaterial({ color: 0x4f9fd0, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 })));
      agua.rotation.x = -Math.PI / 2; agua.scale.set(LAGO.rx, LAGO.rz, 1); agua.position.set(LAGO.cx, 0.05, LAGO.cz); g.add(agua); S.agua = agua;
      const G = new Geo(), p = PIER;
      G.box(p.x1 - p.x0, 0.12, p.z1 - p.z0, '#9a6a3a', (p.x0 + p.x1) / 2, 0.3, (p.z0 + p.z1) / 2, '#a8763f');
      for (let x = p.x0 + 0.3; x < p.x1; x += 2.4) for (const z of [p.z0 + 0.15, p.z1 - 0.15]) G.box(0.18, 0.62, 0.18, '#6c4a2a', x, -0.2, z);
      S.pisos.push({ x0: p.x0, x1: p.x1, z0: p.z0, z1: p.z1, y: 0.42 });
      for (let i = 0; i < 70; i++) { const a = rnd() * Math.PI * 2, k = 0.97 + rnd() * 0.06, x = LAGO.cx + Math.cos(a) * LAGO.rx * k, z = LAGO.cz + Math.sin(a) * LAGO.rz * k;
        if (x > p.x0 - 2 && z > p.z0 - 3 && z < p.z1 + 3) continue; for (let j = 0; j < 3; j++) G.box(0.07, 0.8 + rnd() * 0.9, 0.07, rnd() < 0.5 ? '#5f8a3a' : '#7a9a44', x + (rnd() - 0.5) * 0.6, 0, z + (rnd() - 0.5) * 0.6); }
      addMalha(G, 0, 0); }

    // --- árvores (as da planta + as de fora da cidade)
    { const G = new Geo();
      const arvore = (x, z, k, colide) => {
        const tr = 0.32 * k, ht = 2.0 * k; G.box(tr, ht, tr, '#6c4a2a', x, 0, z);
        const verdes = ['#3f7a33', '#4f8a3a', '#5a9a44', '#356b2c'];
        const n = 2 + Math.floor(rnd() * 2);
        for (let i = 0; i < n; i++) { const s = (2.6 - i * 0.55 + rnd() * 0.4) * k; G.box(s, (1.1 + rnd() * 0.4) * k, s * (0.85 + rnd() * 0.3), verdes[Math.floor(rnd() * 4)], x + (rnd() - 0.5) * 0.5 * k, ht * 0.85 + i * 0.95 * k + rnd() * 0.05, z + (rnd() - 0.5) * 0.5 * k); }
        if (colide) S.col.push({ x0: x - 0.4, x1: x + 0.4, z0: z - 0.4, z1: z + 0.4 });
      };
      const mapa = [[20, 30], [120, 60], [280, 70], [560, 70], [905, 80], [1150, 90], [526, 236], [526, 330], [746, 236], [746, 330], [566, 250], [720, 306], [275, 300], [100, 300], [858, 230], [430, 540], [90, 590], [420, 620], [100, 720], [430, 720], [830, 700], [600, 720], [1100, 725], [10, 700]];
      for (const [px, py] of mapa) arvore(PX(px + 9), PZ(py + 9), 1 + rnd() * 0.4, true);
      for (let i = 0; i < 170; i++) {                                 // fora da cidade (sem colisão: o jogador não chega lá)
        const x = -230 + rnd() * 460, z = -190 + rnd() * 380;
        if (x > LIM.x0 - 3 && x < LIM.x1 + 3 && z > LIM.z0 - 3 && z < LIM.z1 + 3) continue;
        if (Math.abs(z - AV.zc) < 9) continue;
        arvore(x, z, 1 + rnd() * 0.9, false);
      }
      addMalha(G, 0, 0); }
  }
  // alambrado em volta de um retângulo; vaos (portões): [{ lado: 'n'|'s'|'e'|'w', a, b }] em metros (x para n/s, z para e/w)
  function cerca(r, alt, vaos, y0) {
    const G = new Geo(), lados = [['n', r.x0, r.z0, r.x1, r.z0], ['s', r.x0, r.z1, r.x1, r.z1], ['w', r.x0, r.z0, r.x0, r.z1], ['e', r.x1, r.z0, r.x1, r.z1]];
    for (const [lado, ax, az, bx, bz] of lados) {
      const hor = az === bz, ini = hor ? ax : az, fim = hor ? bx : bz, cortes = [];
      for (const v of vaos) if (v.lado === lado) cortes.push([v.a, v.b]);
      const trechos = []; let p = ini; for (const [a, b] of cortes.sort((m, n) => m[0] - n[0])) { trechos.push([p, a]); p = b; } trechos.push([p, fim]);
      for (const [a, b] of trechos) {
        if (b - a < 0.3) continue;
        const L = b - a, n = Math.max(1, Math.round(L / 3));
        for (let i = 0; i <= n; i++) { const t = a + L * i / n, x = hor ? t : ax, z = hor ? az : t; G.box(0.1, alt, 0.1, '#8c949c', x, y0, z); }
        const mx = hor ? (a + b) / 2 : ax, mz = hor ? az : (a + b) / 2;
        G.box(hor ? L : 0.06, 0.06, hor ? 0.06 : L, '#8c949c', mx, y0 + alt - 0.03, mz);
        S.telas.push({ x: mx, z: mz, L, alt, hor, y: y0 });
        if (hor) S.col.push({ x0: a, x1: b, z0: az - 0.12, z1: az + 0.12 }); else S.col.push({ x0: ax - 0.12, x1: ax + 0.12, z0: a, z1: b });
      }
    }
    addMalha(G, 0, 0);
  }
  // telas do alambrado e redes dos gols: planos com textura vazada (alphaTest), UV em metros
  function redesDosGols() {
    const tex = guardar(texTela('#c9ced4')), texR = guardar(texTela('#f4f4ec', true));
    const mT = guardar(new THREE.MeshLambertMaterial({ map: tex, alphaTest: 0.5, side: THREE.DoubleSide }));
    const mR = guardar(new THREE.MeshLambertMaterial({ map: texR, alphaTest: 0.5, side: THREE.DoubleSide }));
    const plano = (w, h, passo, mat) => { const geo = guardar(new THREE.PlaneGeometry(w, h)), uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / passo, uv.getY(i) * h / passo); return new THREE.Mesh(geo, mat); };
    for (const t of S.telas) { const m = plano(t.L, t.alt - 0.1, 0.7, mT); m.position.set(t.x, t.y + (t.alt - 0.1) / 2 + 0.02, t.z); if (!t.hor) m.rotation.y = Math.PI / 2; S.grupo.add(m); }
    for (const r of S.redes) {      // fundo, dois lados e teto (a rede fica ATRÁS da linha do gol: nada encosta nas traves)
      const bx = r.x + r.dir * r.prof, y = r.y;
      const fundo = plano(r.larg, r.alt, 0.25, mR); fundo.position.set(bx, y + r.alt / 2, r.z); fundo.rotation.y = Math.PI / 2; S.grupo.add(fundo);
      for (const s of [-1, 1]) { const l = plano(r.prof - 0.08, r.alt, 0.25, mR); l.position.set(r.x + r.dir * (r.prof / 2 + 0.04), y + r.alt / 2, r.z + s * (r.larg / 2 + 0.03)); S.grupo.add(l); }
      const teto = plano(r.prof - 0.08, r.larg, 0.25, mR); teto.rotation.x = -Math.PI / 2; teto.position.set(r.x + r.dir * (r.prof / 2 + 0.04), y + r.alt + 0.03, r.z); S.grupo.add(teto);
    }
  }

  // ------------------------------------------------------------------ carros
  const CORES_CARRO = ['#c8352b', '#f4f4ec', '#1c1c1f', '#3a64b8', '#8c9199', '#f2c230', '#1f7a4d', '#7a4a2a', '#d8d8d0', '#a3162a', '#2a3f66'];
  function modeloCarro(cor, tipo) {
    const G = new Geo(), vid = '#2b3a48', esc = escurece(cor, 0.75);
    G.box(4.2, 0.72, 1.8, cor, 0, 0.32, 0);                                    // carroceria (de frente para +x)
    if (tipo === 'picape') {
      G.box(1.7, 0.66, 1.62, vid, 0.55, 1.04, 0); G.box(1.76, 0.1, 1.66, cor, 0.55, 1.66, 0);
      G.box(1.9, 0.38, 0.08, cor, -1.1, 1.04, 0.86); G.box(1.9, 0.38, 0.08, cor, -1.1, 1.04, -0.86); G.box(0.08, 0.38, 1.64, cor, -2.12, 1.04, 0);
      G.box(1.9, 0.04, 1.64, '#2a2a2a', -1.1, 1.0, 0);
    } else {
      G.box(2.2, 0.62, 1.6, vid, -0.2, 1.04, 0); G.box(2.06, 0.1, 1.64, cor, -0.2, 1.62, 0);
      G.box(0.16, 0.6, 1.64, cor, 0.78, 1.04, 0);                              // coluna entre para-brisa e janelas
    }
    for (const [x, z] of [[1.3, 0.8], [1.3, -0.8], [-1.3, 0.8], [-1.3, -0.8]]) { G.box(0.7, 0.66, 0.3, '#1c1c1f', x, 0, z); G.box(0.3, 0.3, 0.32, '#9a9a9a', x, 0.18, z); }
    G.box(0.12, 0.26, 1.86, '#3a3a3e', 2.12, 0.3, 0); G.box(0.12, 0.26, 1.86, '#3a3a3e', -2.12, 0.3, 0);   // para-choques
    for (const z of [0.6, -0.6]) { G.box(0.08, 0.18, 0.36, '#fff3b0', 2.12, 0.74, z); G.box(0.08, 0.18, 0.36, '#d0302a', -2.12, 0.74, z); }
    G.box(0.04, 0.16, 0.6, esc, 2.12, 0.62, 0);
    return G.malha(MAT);
  }
  function criarCarros() {
    const rnd = semente(404);
    S.carros = [];
    for (let i = 0; i < 12; i++) {
      const m = modeloCarro(CORES_CARRO[Math.floor(rnd() * CORES_CARRO.length)], rnd() < 0.25 ? 'picape' : 'carro');
      m.visible = false; S.grupo.add(m);
      S.carros.push({ m, ativo: false, x: 0, z: 0, dir: 1, v: 0, vmax: 10, parado: 0, buzinou: false, porJog: false });
    }
    S.pistaT = [1.5, 3.5];
    // já começa com alguns carros espalhados pela avenida (a cidade não começa vazia)
    let k = 0; for (const p of PISTAS) for (const x of [-170, -60, 90]) ativarCarro(S.carros[k++], p, x * p.dir);
  }
  function ativarCarro(c, p, x) { c.ativo = true; c.dir = p.dir; c.z = p.z; c.x = x; c.vmax = 9 + Math.random() * 4; c.v = c.vmax; c.parado = 0; c.buzinou = false; c.m.visible = true; c.m.rotation.y = p.dir > 0 ? 0 : Math.PI; }
  function tickCarros(dt) {
    const J = S.jog, FIM = 270;
    for (let i = 0; i < PISTAS.length; i++) {                        // novos carros entram pelas pontas (longe, na névoa)
      S.pistaT[i] -= dt; if (S.pistaT[i] > 0) continue;
      const p = PISTAS[i], x0 = -p.dir * FIM, livre = !S.carros.some((c) => c.ativo && c.z === p.z && Math.abs(c.x - x0) < 16);
      const c = S.carros.find((q) => !q.ativo);
      if (c && livre) ativarCarro(c, p, x0);
      S.pistaT[i] = 4 + Math.random() * 7;
    }
    for (const c of S.carros) {
      if (!c.ativo) continue;
      // espaço livre à frente: o jogador (se estiver na frente, na faixa do carro) e o carro da frente
      let folga = 1e9, porJog = false;
      if (J && Math.abs(J.z - c.z) < 1.75) { const fr = (J.x - c.x) * c.dir; if (fr > -1.2) { const f = fr - 2.1 - 0.3 - 1.6; if (f < folga) { folga = f; porJog = true; } } }
      for (const o of S.carros) { if (o === c || !o.ativo || o.z !== c.z) continue; const fr = (o.x - c.x) * c.dir; if (fr > 0) { const f = fr - 4.2 - 2.2; if (f < folga) { folga = f; porJog = false; } } }
      const alvo = folga <= 0 ? 0 : Math.min(c.vmax, Math.sqrt(2 * 5.5 * folga));
      if (alvo < c.v) c.v = Math.max(alvo, c.v - 12 * dt); else c.v = Math.min(alvo, c.v + 2.6 * dt);
      const passo = Math.min(c.v * dt, Math.max(0, folga));
      c.x += c.dir * passo;
      if (c.v < 0.3 && porJog) { c.parado += dt; if (c.parado > 1.6 && !c.buzinou) { c.buzinou = true; buzina(c); } } else if (c.v > 3) { c.parado = 0; c.buzinou = false; }
      c.m.position.set(c.x, 0, c.z);
      if (c.dir * c.x > FIM) { c.ativo = false; c.m.visible = false; }
    }
  }
  // buzina "bi-bi" (sintetizada, mais baixa quando longe)
  function buzina(c) {
    const A = typeof Som !== 'undefined' && Som.audio && !Som.mudo ? Som.audio : null; if (!A) return;
    try {
      const d = Math.hypot(c.x - S.jog.x, c.z - S.jog.z), vol = 0.07 / Math.max(1, d / 6), t0 = A.currentTime;
      for (const [ini, dur] of [[0, 0.13], [0.2, 0.22]]) for (const f of [415, 523]) {
        const o = A.createOscillator(), g = A.createGain(); o.type = 'square'; o.frequency.value = f;
        g.gain.setValueAtTime(0, t0 + ini); g.gain.linearRampToValueAtTime(vol, t0 + ini + 0.01); g.gain.setValueAtTime(vol, t0 + ini + dur - 0.02); g.gain.linearRampToValueAtTime(0, t0 + ini + dur);
        o.connect(g); g.connect(A.destination); o.start(t0 + ini); o.stop(t0 + ini + dur + 0.02);
      }
    } catch (e) { /* sem som */ }
  }

  // ------------------------------------------------------------------ o jogador
  function criarJogador(f2, H) {
    let m = null, opt = null;
    try { if (f2 && typeof f2.modeloJogador === 'function') { const r = f2.modeloJogador(H && H.fase2); m = r.m; opt = r.opt; } } catch (e) { console.warn('[Cidade] roupa da Fase 2:', e); }
    if (!m) {
      const ap = PERSONAGEM.aparencia || {};
      opt = { camisa: '#3a64b8', listra: '#f2f2ee', gola: '#f2f2ee', calcao: '#8c9199', meia: ap.pele || '#946042', sola: '#e6e6e0', corTexto: '#F2F2EE', numero: '', nome: ' ', fundoNome: 'rgba(0,0,0,0)',
        barba: 0, manga: 0, meiao: 1, labio: ap.labio == null ? 3 : ap.labio, cabecao: 1.08, escala: 0.9, pele: ap.pele || '#946042', cabelo: ap.cabelo || '#1C140F', estilo: ap.estilo | 0, rosto: ap.rosto | 0, corBarba: ap.cabelo || '#1C140F' };
      m = makeAthlete(opt); m.etiqueta.visible = false; m.sombra.visible = false;
    }
    S.grupo.add(m.raiz);
    const blob = new THREE.Mesh(guardar(new THREE.CircleGeometry(0.3, 12)), guardar(new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.32, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 })));
    blob.rotation.x = -Math.PI / 2; S.grupo.add(blob);
    return { m, opt, blob, x: SPAWN.x, z: SPAWN.z, y: 0.12, yaw: -Math.PI / 2, yawAlvo: -Math.PI / 2, fase: 0, vel: 2.6, andando: false, rota: null, rotaRes: null };
  }
  function poseJog(A, dt) {
    const m = A.m, r = m.raiz, e = Math.min(1, dt * 10);
    usarJoelhos(m, 0, 0); usarCotovelo(m.bracoE, 0, 0); usarCotovelo(m.bracoD, 0, 0); r.rotation.z = 0; r.rotation.x = 0; m.corpo.rotation.z = 0;
    if (A.andando) {
      A.fase += dt * A.vel * 4.6; const s = Math.sin(A.fase);
      m.pernaE.rotation.z = s * 0.75; m.pernaD.rotation.z = -s * 0.75; m.bracoE.rotation.z = -s * 0.6; m.bracoD.rotation.z = s * 0.6;
      r.position.y = A.y + Math.abs(Math.cos(A.fase)) * 0.025;
    } else {
      m.pernaE.rotation.z = lerp(m.pernaE.rotation.z, 0, e); m.pernaD.rotation.z = lerp(m.pernaD.rotation.z, 0, e);
      m.bracoE.rotation.z = lerp(m.bracoE.rotation.z, 0, e); m.bracoD.rotation.z = lerp(m.bracoD.rotation.z, 0, e);
      r.position.y = A.y;
    }
    m.bracoE.rotation.x = m.bracoD.rotation.x = 0;
    r.position.x = A.x; r.position.z = A.z; r.rotation.y = A.yaw;
    A.blob.position.set(A.x, A.y + 0.02, A.z);
  }
  function altura(x, z) {
    for (const p of S.pisos) if (x > p.x0 && x < p.x1 && z > p.z0 && z < p.z1) return p.y;
    for (const c of CALCADAS) if (x > c.x0 && x < c.x1 && z > c.z0 && z < c.z1) return c.y;
    return 0;
  }
  const RJ = 0.3;
  function livre(x, z) {
    if (x < LIM.x0 + 1.5 || x > LIM.x1 - 1.5 || z < LIM.z0 + 1.5 || z > LIM.z1 - 1.5) return false;
    for (const b of S.col) if (x > b.x0 - RJ && x < b.x1 + RJ && z > b.z0 - RJ && z < b.z1 + RJ) return false;
    const naPier = x > PIER.x0 && x < PIER.x1 + 0.5 && z > PIER.z0 + 0.15 && z < PIER.z1 - 0.15;
    if (!naPier) { const ex = (x - LAGO.cx) / (LAGO.rx - 0.4), ez = (z - LAGO.cz) / (LAGO.rz - 0.4); if (ex * ex + ez * ez < 1) return false; }
    for (const c of S.carros) if (c.ativo && Math.abs(x - c.x) < 2.15 + RJ && Math.abs(z - c.z) < 0.95 + RJ) return false;
    return true;
  }
  function entrada() {
    const j = UI.joy, t = UI.teclas; let ix = j.x, iy = j.y;
    if (t.ArrowLeft || t.KeyA) ix -= 1; if (t.ArrowRight || t.KeyD) ix += 1; if (t.ArrowUp || t.KeyW) iy -= 1; if (t.ArrowDown || t.KeyS) iy += 1;
    const m = Math.hypot(ix, iy); if (m > 1) { ix /= m; iy /= m; }
    return { ix, iy, m: Math.min(1, m) };
  }
  function mover(dt) {
    const J = S.jog, e = entrada();
    if (UI.teclas.KeyQ) S.cam.yaw += dt * 1.8; if (UI.teclas.KeyE) S.cam.yaw -= dt * 1.8;
    if (e.m < 0.12) { J.andando = false; return; }
    const sy = Math.sin(S.cam.yaw), cy = Math.cos(S.cam.yaw);
    const fx = -sy, fz = -cy, rx = cy, rz = -sy;                     // frente (da câmera para o jogador) e direita
    const dx = rx * e.ix - fx * e.iy, dz = rz * e.ix - fz * e.iy, dl = Math.hypot(dx, dz) || 1, sp = 2.6 * e.m * dt;
    let moveu = false;
    if (livre(J.x + dx / dl * sp, J.z)) { J.x += dx / dl * sp; moveu = true; }
    if (livre(J.x, J.z + dz / dl * sp)) { J.z += dz / dl * sp; moveu = true; }
    J.andando = moveu; J.vel = 2.6 * Math.max(0.5, e.m); J.yawAlvo = Math.atan2(-dz, dx);
  }
  function tickJogador(dt) {
    const J = S.jog;
    if (J.rota && J.rota.length) {
      const p = J.rota[0], dx = p.x - J.x, dz = p.z - J.z, d = Math.hypot(dx, dz), st = J.vel * dt;
      if (d <= st) { J.x = p.x; J.z = p.z; J.rota.shift(); if (!J.rota.length) { J.rota = null; J.andando = false; const r = J.rotaRes; J.rotaRes = null; if (r) r(); } }
      else { J.x += dx / d * st; J.z += dz / d * st; J.yawAlvo = Math.atan2(-dz, dx); J.andando = true; }
    }
    const dy = ((J.yawAlvo - J.yaw + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI; J.yaw += dy * Math.min(1, dt * 10);
    const ty = altura(J.x, J.z); J.y += (ty - J.y) * Math.min(1, dt * 18);
    poseJog(J, dt);
  }
  const andar = (A, pts, vel) => new Promise((ok) => { A.vel = vel || 2.2; A.rota = pts.map((p) => ({ x: p[0], z: p[1] })); A.rotaRes = ok; });

  // ------------------------------------------------------------------ câmera (terceira pessoa; chega perto se um prédio ficar no meio)
  function raio(ax, ay, az, bx, by, bz) {
    let tMin = 1; const d = [bx - ax, by - ay, bz - az], o = [ax, ay, az];
    for (const b of S.camBox) {
      const mn = [b.x0, b.y0, b.z0], mx = [b.x1, b.y1, b.z1]; let t0 = 0, t1 = tMin, ok = true;
      for (let k = 0; k < 3 && ok; k++) {
        if (Math.abs(d[k]) < 1e-9) { if (o[k] < mn[k] || o[k] > mx[k]) ok = false; continue; }
        let ta = (mn[k] - o[k]) / d[k], tb = (mx[k] - o[k]) / d[k]; if (ta > tb) { const t = ta; ta = tb; tb = t; }
        if (ta > t0) t0 = ta; if (tb < t1) t1 = tb; if (t0 > t1) ok = false;
      }
      if (ok && t0 > 0 && t0 < tMin) tMin = t0;
    }
    return tMin;
  }
  function atualizarCamera(dt) {
    const J = S.jog, C = S.cam, P = C.pitch || 0.48;
    const tx = J.x, ty = J.y + 1.35, tz = J.z;
    const ux = Math.sin(C.yaw) * Math.cos(P), uy = Math.sin(P), uz = Math.cos(C.yaw) * Math.cos(P);
    const t = raio(tx, ty, tz, tx + ux * C.dist, ty + uy * C.dist, tz + uz * C.dist);
    const dAlvo = Math.max(1.6, C.dist * t - 0.45);
    C.dAt = C.snap ? dAlvo : (dAlvo < C.dAt ? dAlvo : C.dAt + (dAlvo - C.dAt) * (1 - Math.exp(-dt * 2.2)));
    C.snap = false;
    camera.position.set(OX + tx + ux * C.dAt, ty + uy * C.dAt, tz + uz * C.dAt);
    camera.lookAt(OX + tx, ty, tz);
  }

  // ------------------------------------------------------------------ interface (joystick, arrastar a câmera, dinheiro, menu)
  function montarUI() {
    if (UI) return UI;
    const css = document.createElement('style'); css.id = 'cdCss';
    css.textContent = `
#cdPreto { position: fixed; inset: 0; z-index: 20; background: #000; opacity: 1; transition: opacity 0.9s ease; display: grid; place-items: center; color: #fff; text-align: center; }
#cdPreto[hidden] { display: none; }
#cdPreto.claro { opacity: 0; pointer-events: none; }
#cdArrasto { position: fixed; inset: 0; z-index: 8; touch-action: none; cursor: grab; }
#cdArrasto[hidden], #cdCtl[hidden], #cdHud[hidden], #cdMissao[hidden], #cdAviso[hidden] { display: none; }
#cdCtl { position: fixed; inset: 0; z-index: 9; pointer-events: none; }
#cdCtl .cdPad { position: absolute; left: max(18px, env(safe-area-inset-left, 0px)); bottom: calc(18px + env(safe-area-inset-bottom, 0px)); width: 112px; height: 112px; border-radius: 50%; pointer-events: auto; touch-action: none;
  background: rgba(21, 13, 6, 0.38); border: 4px solid rgba(255, 240, 200, 0.55); box-sizing: border-box; }
#cdCtl .cdKnob { position: absolute; left: 50%; top: 50%; width: 46px; height: 46px; margin: -23px 0 0 -23px; border-radius: 50%; background: #f0a020; border: 4px solid #2a1206; box-sizing: border-box; }
#cdHud { position: fixed; z-index: 9; right: max(10px, env(safe-area-inset-right, 0px)); top: calc(8px + env(safe-area-inset-top, 0px)); display: flex; gap: 8px; align-items: center; }
#cdHud .cdGrana { display: flex; align-items: center; gap: 8px; padding: 4px 10px 4px 6px; background: rgba(42, 18, 6, 0.86); border: 3px solid #f0a020; color: #fff0c8;
  font: 700 15px/1 var(--font-display); letter-spacing: 0.04em; text-shadow: 0 2px 0 #2a1206; font-variant-numeric: tabular-nums; }
#cdHud .cdGrana small { font-size: 11px; color: #f0c060; }
#cdHud .cdNota { position: relative; width: 30px; height: 18px; background: #5fae5a; border: 2px solid #1f4a1c; box-sizing: border-box; image-rendering: pixelated; }
#cdHud .cdNota::before { content: ''; position: absolute; left: 50%; top: 50%; width: 8px; height: 8px; margin: -4px 0 0 -4px; border-radius: 50%; background: #2f7a2a; border: 1px solid #c9f0a8; box-sizing: border-box; }
#cdHud .cdNota::after { content: ''; position: absolute; inset: 2px; border: 1px dashed rgba(201, 240, 168, 0.7); }
#cdHud .cdGrana.pop { animation: cdPop 0.9s ease; }
@keyframes cdPop { 0% { transform: scale(0.2); opacity: 0; } 55% { transform: scale(1.25); opacity: 1; } 100% { transform: scale(1); } }
#cdHud .cdMenu { --p: var(--p2, 2px); height: 34px; padding: 0 10px; font-size: 11px; }
#cdMissao { position: fixed; z-index: 9; left: max(10px, env(safe-area-inset-left, 0px)); top: calc(8px + env(safe-area-inset-top, 0px)); max-width: min(46vw, 420px); box-sizing: border-box; --p: var(--p2, 2px); padding: 3px 8px;
  border: solid transparent; border-width: calc(var(--p) * 4); border-image: var(--sp-madeira) 4 fill / calc(var(--p) * 4) stretch; image-rendering: pixelated;
  font: 700 12px/1.25 var(--font-display); letter-spacing: 0.04em; color: #fff0c8; text-shadow: 0 2px 0 #2a1206; }
#cdAviso { position: fixed; z-index: 10; left: 50%; bottom: calc(24% + env(safe-area-inset-bottom, 0px)); transform: translateX(-50%); padding: 6px 14px; font: 700 14px/1.2 var(--font-display); letter-spacing: 0.06em; color: #fff0c8;
  background: rgba(42, 18, 6, 0.86); border: 3px solid #f0a020; pointer-events: none; text-align: center; max-width: 80vw; }
body.cdAtivo #dialogo, body.cdAtivo #escolha { z-index: 21; }`;
    document.head.appendChild(css);
    const raiz = $('raizJogo') || document.body;
    const preto = document.createElement('div'); preto.id = 'cdPreto'; preto.hidden = true;
    const arrasto = document.createElement('div'); arrasto.id = 'cdArrasto'; arrasto.hidden = true;
    const ctl = document.createElement('div'); ctl.id = 'cdCtl'; ctl.hidden = true; ctl.innerHTML = '<div class="cdPad"><div class="cdKnob"></div></div>';
    const hud = document.createElement('div'); hud.id = 'cdHud'; hud.hidden = true;
    hud.innerHTML = '<div class="cdGrana" role="status"><span class="cdNota"></span><b class="cdValor">0</b><small class="cdMoeda"></small></div><button type="button" class="pxBtn cdMenu"></button>';
    const missao = document.createElement('div'); missao.id = 'cdMissao'; missao.hidden = true;
    const aviso = document.createElement('div'); aviso.id = 'cdAviso'; aviso.hidden = true;
    raiz.append(preto, arrasto, ctl, hud, missao, aviso);
    UI = { css, preto, arrasto, ctl, hud, missao, aviso, pad: ctl.querySelector('.cdPad'), knob: ctl.querySelector('.cdKnob'), grana: hud.querySelector('.cdGrana'), valor: hud.querySelector('.cdValor'), moeda: hud.querySelector('.cdMoeda'), menu: hud.querySelector('.cdMenu') };
    const joy = { id: null, x: 0, y: 0 };
    const moveJoy = (e) => {
      const r = UI.pad.getBoundingClientRect(), Rr = r.width / 2;
      let dx = e.clientX - (r.left + Rr), dy = e.clientY - (r.top + Rr); const d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / (Rr * 0.85));
      dx = dx / d * k; dy = dy / d * k; joy.x = dx; joy.y = dy;
      UI.knob.style.transform = 'translate(' + (dx * Rr * 0.55) + 'px,' + (dy * Rr * 0.55) + 'px)';
    };
    UI.pad.addEventListener('pointerdown', (e) => { joy.id = e.pointerId; UI.pad.setPointerCapture(e.pointerId); moveJoy(e); });
    UI.pad.addEventListener('pointermove', (e) => { if (e.pointerId === joy.id) moveJoy(e); });
    const solta = (e) => { if (e.pointerId !== joy.id) return; joy.id = null; joy.x = joy.y = 0; UI.knob.style.transform = ''; };
    UI.pad.addEventListener('pointerup', solta); UI.pad.addEventListener('pointercancel', solta);
    // arrastar em qualquer outro lugar da tela gira a câmera
    const arr = { id: null, x: 0 };
    arrasto.addEventListener('pointerdown', (e) => { if (arr.id != null) return; arr.id = e.pointerId; arr.x = e.clientX; arrasto.setPointerCapture(e.pointerId); });
    arrasto.addEventListener('pointermove', (e) => { if (e.pointerId !== arr.id || !S) return; S.cam.yaw -= (e.clientX - arr.x) * 0.0075; arr.x = e.clientX; });
    const soltaArr = (e) => { if (e.pointerId === arr.id) arr.id = null; };
    arrasto.addEventListener('pointerup', soltaArr); arrasto.addEventListener('pointercancel', soltaArr);
    arrasto.addEventListener('wheel', (e) => { if (!S) return; e.preventDefault(); S.cam.dist = Math.max(5, Math.min(16, S.cam.dist + Math.sign(e.deltaY) * 0.8)); }, { passive: false });
    UI.joy = joy; UI.teclas = {};
    window.addEventListener('keydown', (e) => { if (!S || !S.ativo) return; UI.teclas[e.code] = true; if (/^(Arrow|Key[WASDQE])/.test(e.code) && S.modo === 'livre') e.preventDefault(); });
    window.addEventListener('keyup', (e) => { UI.teclas[e.code] = false; });
    UI.menu.addEventListener('click', () => { if (!S || !S.ativo || S.modo !== 'livre') return; if (typeof Som !== 'undefined' && Som.clique) Som.clique(); S.modo = 'saindo'; sair(); });
    return UI;
  }
  const preto = async (ligado, ms) => {
    UI.preto.hidden = false; UI.preto.style.transitionDuration = pulando() ? '0s' : ((ms == null ? 900 : ms) / 1000) + 's'; await esperar(30);
    UI.preto.classList.toggle('claro', !ligado); await esperar(ms == null ? 900 : ms); if (!ligado) UI.preto.hidden = true;
  };
  const aviso = (txt) => { if (!txt) { UI.aviso.hidden = true; return; } UI.aviso.textContent = txt; UI.aviso.hidden = false; };
  const missao = (txt) => { UI.missao.textContent = txt || ''; UI.missao.hidden = !txt; };
  function mostrarDinheiro(pop) {
    UI.valor.textContent = String(S.dados.fakes); UI.moeda.textContent = T('fakes'); UI.menu.textContent = T('Voltar ao menu'); UI.grana.setAttribute('aria-label', T('Dinheiro'));
    UI.hud.hidden = false; if (pop) { UI.grana.classList.remove('pop'); void UI.grana.offsetWidth; UI.grana.classList.add('pop'); }
  }
  function liberar() { S.modo = 'livre'; UI.ctl.hidden = false; UI.arrasto.hidden = false; }
  async function sair() { UI.ctl.hidden = true; UI.arrasto.hidden = true; aviso(''); gravar(S.dados.ponto || 'chegada'); await preto(true, 700); if (S && S.fimRes) S.fimRes(); }

  // ------------------------------------------------------------------ save
  function gravarSlot(d) {
    const F = window.FutebolJS; if (!F || !F.salvarJogo || !F.listarSaves) return;
    const lista = F.listarSaves(); let slot = (F.slotHistoria && F.slotHistoria()) || (lista.findIndex((s) => s && s.autosave) + 1);
    if (!slot) slot = lista.findIndex((s) => !s) + 1;
    if (!slot) { let velho = Infinity; slot = 1; lista.forEach((s, i) => { const t = s && s.data ? Date.parse(s.data) || 0 : 0; if (t < velho) { velho = t; slot = i + 1; } }); }
    const per = JSON.parse(JSON.stringify(PERSONAGEM)); delete per.historia;
    F.salvarJogo(slot, { nome: nomeJog(), resumo: T('Modo história · Cidadezinha'), fase: 'cidade', ponto: d.ponto, autosave: true, historia: API.historia.tudo(), personagem: per, versao: API.versao });
  }
  function gravar(ponto) {
    if (!S) return; const d = S.dados; d.ponto = ponto;
    try { API.historia.gravar('cidade', JSON.parse(JSON.stringify(d))); } catch (e) { console.warn('[Cidade] save da história:', e); }
    try { gravarSlot(d); } catch (e) { console.warn('[Cidade] save do CARREGAR:', e); }
  }

  // ------------------------------------------------------------------ mundo (esconde o resto e devolve tudo na saída)
  function prepararMundo() {
    const M = S.mundo = { bg: scene.background, fog: scene.fog ? { c: scene.fog.color.getHex(), n: scene.fog.near, f: scene.fog.far } : null, vis: [], fov: camera.fov };
    scene.background = new THREE.Color(CEU);
    if (scene.fog) { scene.fog.color.setHex(CEU); scene.fog.near = 70; scene.fog.far = 215; }
    for (const c of scene.children) { if (c.isLight) continue; M.vis.push([c, c.visible]); c.visible = false; }
    if (camera.fov !== 55) { camera.fov = 55; camera.updateProjectionMatrix(); }
  }
  function restaurarMundo() {
    const M = S.mundo; if (!M) return;
    scene.background = M.bg; if (scene.fog && M.fog) { scene.fog.color.setHex(M.fog.c); scene.fog.near = M.fog.n; scene.fog.far = M.fog.f; }
    for (const [c, v] of M.vis) c.visible = v;
    if (camera.fov !== M.fov) { camera.fov = M.fov; camera.updateProjectionMatrix(); }
  }
  const esconderBola = () => { try { ball.mesh.visible = ball.shadow.visible = false; userRing.visible = false; targetRing.visible = false; dribbleRing.visible = false; aimArrow.visible = false; } catch (e) { /* sem bola */ } };

  // ------------------------------------------------------------------ o quadro
  function gancho(rdt) {
    if (!S || !S.ativo) return;
    const dt = Math.min(0.05, rdt || 0.016);
    esconderBola();
    const n = typeof Cena !== 'undefined' ? Cena.passos() : 1;
    for (let i = 0; i < n; i++) {
      S.t += dt;
      if (S.modo === 'livre') mover(dt);
      tickJogador(dt); tickCarros(dt);
    }
    if (n > 1) S.cam.snap = true;
    if (typeof Cena !== 'undefined') Cena.marcar(S.modo === 'cena');
    for (const a of ATLETAS) a.raiz.visible = a === S.jog.m;
    if (S.bandeira) { S.bandeira.rotation.y = Math.sin(S.t * 1.3) * 0.25; S.bandeira.position.x = PRACA_C.x + 1.3 * Math.cos(S.bandeira.rotation.y); S.bandeira.position.z = PRACA_C.z - 1.3 * Math.sin(S.bandeira.rotation.y); }
    if (S.agua) { const k = 0.5 + 0.5 * Math.sin(S.t * 0.8); S.agua.material.color.setRGB(0.29 + 0.04 * k, 0.6 + 0.04 * k, 0.8 + 0.03 * k); }
    atualizarCamera(dt);
  }
  function limpar() {
    if (!S) return;
    S.ativo = false; GANCHO_RENDER = null;
    ATLETAS.delete(S.jog && S.jog.m);
    if (S.grupo) {
      scene.remove(S.grupo);
      S.grupo.traverse((o) => { if (o.geometry && o.geometry !== SHADOW_GEO) o.geometry.dispose(); const ms = Array.isArray(o.material) ? o.material : [o.material]; for (const m of ms) if (m && m !== MAT_CORES && m !== SHADOW_MAT && m !== MAT && m !== MAT_DUPLO) { if (m.map) m.map.dispose(); m.dispose(); } });
    }
    for (const o of descartaveis.splice(0)) { try { o.dispose(); } catch (e) { /* já foi */ } }
    restaurarMundo();
    document.body.classList.remove('cdAtivo');
    UI.ctl.hidden = true; UI.arrasto.hidden = true; UI.hud.hidden = true; UI.missao.hidden = true; UI.aviso.hidden = true;
    UI.preto.hidden = true; UI.preto.classList.add('claro');
    if (typeof Dialogo !== 'undefined') Dialogo.esconder(); Musica.parar();
    S = null;
  }

  // ------------------------------------------------------------------ roteiro: sai do prédio e fica livre na cidade
  async function iniciar(ctx) {
    API = ctx.api; montarUI();
    UI.preto.hidden = false; UI.preto.style.transitionDuration = '0s'; UI.preto.classList.remove('claro');     // já no preto (sem piscar o mundo de antes)
    document.body.classList.add('cdAtivo');
    const f1p = document.getElementById('f1Preto'), f1Vis = !!(f1p && !f1p.hidden); if (f1p) f1p.hidden = true;   // o preto da Fase 1 (quando ela chamou a Fase 2) volta no fim
    if (!MAT) { MAT = new THREE.MeshLambertMaterial({ vertexColors: true }); MAT_DUPLO = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }); }
    const H = ctx.historia || {};
    const dados = Object.assign({ ponto: 'chegada', fakes: 150, visitas: 0 }, H.cidade || {});
    S = { ativo: true, modo: 'cena', t: 0, dados, col: [], camBox: [], pisos: [], telas: [], redes: [], carros: [], cam: { yaw: 0.55, dist: 9.5, dAt: 9.5, snap: true } };
    try {
      let f2 = null; try { f2 = await Fases.carregar('fase2'); } catch (e) { console.warn('[Cidade] fase2.js não veio (roupa padrão):', e); }
      prepararMundo();
      S.grupo = new THREE.Group(); S.grupo.position.x = OX; scene.add(S.grupo);
      montarCidade(); criarCarros();
      S.jog = criarJogador(f2, H);
      const J = S.jog; J.x = SPAWN.x; J.z = -4.9; J.y = 0.12; J.yaw = J.yawAlvo = -Math.PI / 2;
      tickJogador(0.016); atualizarCamera(0.016);
      GANCHO_RENDER = gancho;
      const fim = new Promise((r) => { S.fimRes = r; });
      const primeira = !dados.visitas; dados.visitas = (dados.visitas | 0) + 1;
      gravar('chegada');
      Musica.tocar('jazz');
      await preto(false, 1100);
      await andar(J, [[SPAWN.x, -3.7]], 1.9);
      mostrarDinheiro(primeira);
      const f2d = H.fase2 || {};
      missao(f2d.vizinho && f2d.vizinho.sabeValdemar ? T('Missão: vá até a lanchonete do seu Valdemar.') : T('Missão: encontre um lugar para comer.'));
      liberar();
      if (primeira) { aviso(Tf('Agora você tem dinheiro: {0} fakes.', dados.fakes)); await esperar(3200); }
      aviso(T('Use o direcional para andar e arraste a tela para girar a câmera.')); setTimeout(() => { if (S && UI) aviso(''); }, 5000);
      await fim;
    } finally {
      limpar();
      if (f1p && f1Vis) { f1p.hidden = false; f1p.classList.remove('claro'); }
    }
  }

  window.FutebolJS.registrarFase({ id: 'cidade', nome: 'Cidadezinha', nucleoMinimo: '4.8.2', iniciar,
    _estado: () => S, _planta: { R, PX, PZ, LAGO, PIER, SPAWN } });   // (_estado/_planta: para testes)
})();
