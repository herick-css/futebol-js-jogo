/* =====================================================================
   FUTEBOL JS · fase1.js · Fase 1 — a escola, o corredor, a quadra e a primeira partida (arquivo SEPARADO do jogo.js)
   ---------------------------------------------------------------------
   Como funciona
     - O jogo.js não traz este arquivo junto. Quando o jogador começa a história (depois do criador de personagem), o jogo baixa o
       fase1.js do mesmo lugar de onde veio (GitHub → jsDelivr, ou a pasta local) enquanto roda a animação "12 anos atrás".
     - O carregador do Canva não muda: ele continua baixando só o jogo.js.
     - Suba o fase1.js junto do jogo.js (mesma pasta futebol-js/) e atualize o versao.txt. Os dois andam JUNTOS: este arquivo usa as
       variáveis internas do jogo.js (criar, vestir, GANCHO_RENDER, Musica, Dialogo, Historia, HIST...), por isso nucleoMinimo
       exige a versão do jogo.js em que ele foi feito.
   Como é chamado
     FutebolJS.executarFase('fase1', { nome, voz }) → carrega este arquivo (se preciso) e roda Fase1.iniciar({ nome, voz }).
     No fim da Fase 1 o próprio Fase1.iniciar passa para a Fase 2 (fase2.js).
   Fase1.iniciar({ nome, voz, direto }) → Promise (resolve no fim da Fase 1).  direto: 'quadra' | 'corredor' = atalhos de teste.
   Fase1.emergencia() desfaz a sala e volta o mundo ao normal se algo quebrar no meio.
   O que a Fase 1 salva: FutebolJS.historia.ler('fase1') (perfil, acertos, joao, lucia, mariposa, traco, partida, atributos).
   ===================================================================== */
'use strict';

// 14c. FASE 1 · ESCOLA (4.3.2) — "Escola Santa Maria". Sala de aula 3D com a professora, 9 cadeiras (7 ocupadas), conversas,
// atividade de álgebra (3 questões) e cutscenes. Usa o mesmo palco do jogo (main scene/câmera, via GANCHO_RENDER): a sala é
// montada longe do campo e os atletas da partida ficam escondidos. Personagens "bebê" (corpo pequeno, cabeção) com
// o rosto/cabelo/pele que o jogador criou (sem barba).
// Tudo que aparece em texto passa por T()/Tf() (tabela I18N, que fica no jogo.js).
const Fase1 = (() => {
  const SX = 6, SZ = 5, ALT = 2.8, OX = 600;                         // sala (meia largura/profundidade/altura) e onde ela fica no mundo
  const PORTA = { x: 4.7, z: SZ };
  const CX = 3.8, CL = 13;                                             // corredor (4.3.7: bem mais largo): meia largura e meio comprimento
  const LINHAS = [-1.6, 0.6, 2.8], COLS = [-3.2, 0, 3.2];            // 9 mesas (3 colunas × 3 fileiras)
  const ESC = 0.68, CAB = 1.55, ASSENTO_Y = -0.15;                     // personagem bebê: corpo 68%, cabeça 155%
  const PROF = { x: -2.4, z: -3.9 }, MESA_PROF = { x: -4.5, z: -4.2 };
  const SPOT = { joao: [1.9, LINHAS[1] + 0.62], lucia: [-1.9, LINHAS[1] + 0.62], prof: [PROF.x + 1.25, PROF.z] };   // pontos fixos (afastados) de conversa
  const NOMES = { prof: 'Dona Graça', joao: 'João Pinha', lucia: 'Lúcia Alves', valentao: '??', oculos: 'Menino de óculos', rob: 'Professor Roberto' };       // (a tabela I18N traz os nomes de cada idioma)
  const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
  const rad = Math.PI / 180;
  let UI = null, S = null;

  // ------------------------------------------------------------------ interface
  function montarUI() {
    if (UI) return;
    const css = document.createElement('style');
    css.textContent = `
#f1Preto { position: fixed; inset: 0; z-index: 20; background: #000; opacity: 1; transition: opacity 0.9s ease; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; color: #fff; text-align: center; padding: 0 20px; box-sizing: border-box; }
#f1Preto[hidden] { display: none; }
#f1Preto.claro { opacity: 0; pointer-events: none; }
#f1Preto .f1Leg { margin: 0; font: 700 clamp(15px, 4.6vh, 26px)/1.35 var(--font-display); letter-spacing: 0.12em; text-transform: uppercase; opacity: 0; transition: opacity 0.8s ease; }
#f1Preto .f1Leg.on { opacity: 1; }
#f1Preto .pxBtn { width: min(320px, 90%); --p: var(--p3, 3px); height: 46px; white-space: nowrap; font-size: 14px; }
#f1Missao { position: fixed; z-index: 9; left: max(10px, env(safe-area-inset-left, 0px)); top: calc(8px + env(safe-area-inset-top, 0px)); max-width: min(46vw, 420px); box-sizing: border-box; --p: var(--p2, 2px); padding: 3px 8px;
  border: solid transparent; border-width: calc(var(--p) * 4); border-image: var(--sp-madeira) 4 fill / calc(var(--p) * 4) stretch; image-rendering: pixelated;
  font: 700 12px/1.25 var(--font-display); letter-spacing: 0.04em; color: #fff0c8; text-shadow: 0 2px 0 #2a1206; }
#f1Missao[hidden], #f1Ctl[hidden], #f1Prova[hidden] { display: none; }
#f1Ctl { position: fixed; inset: 0; z-index: 9; pointer-events: none; --mx-ink: #2a1206; --mx-creme: #fff0c8; }
#f1Ctl .f1Pad { position: absolute; left: max(18px, env(safe-area-inset-left, 0px)); bottom: calc(18px + env(safe-area-inset-bottom, 0px)); width: 112px; height: 112px; border-radius: 50%; pointer-events: auto; touch-action: none;
  background: rgba(21, 13, 6, 0.38); border: 4px solid rgba(255, 240, 200, 0.55); box-sizing: border-box; }
#f1Ctl .f1Knob { position: absolute; left: 50%; top: 50%; width: 46px; height: 46px; margin: -23px 0 0 -23px; border-radius: 50%; background: #f0a020; border: 4px solid #2a1206; box-sizing: border-box; }
#f1Ctl .f1Dica { position: absolute; right: max(18px, env(safe-area-inset-right, 0px)); bottom: calc(86px + env(safe-area-inset-bottom, 0px)); max-width: 46vw; text-align: right; font: 700 13px/1.2 var(--font-display); letter-spacing: 0.04em;
  color: #fff0c8; text-shadow: 0 2px 0 #2a1206, 0 0 6px #000; min-height: 16px; }
#f1Ctl .f1Btn { position: absolute; right: max(18px, env(safe-area-inset-right, 0px)); bottom: calc(18px + env(safe-area-inset-bottom, 0px)); width: 128px; pointer-events: auto; --p: var(--p3, 3px); height: 52px; font-size: 14px; }
#f1Ctl .f1Btn:disabled { opacity: 0.45; }
#f1Prova { position: fixed; inset: 0; z-index: 13; display: grid; place-items: center; background: rgba(10, 6, 3, 0.55); padding: 8px 12px; box-sizing: border-box; --mx-ink: #2a1206; --mx-creme: #fff0c8; }
#f1Prova .papel { --p: var(--p3, 3px); box-sizing: border-box; width: min(560px, 100%); max-height: 100%; overflow-y: auto; padding: 4px 8px 8px; color: #2a1206;
  border: solid transparent; border-width: calc(var(--p) * 4); border-image: var(--sp-slot) 4 fill / calc(var(--p) * 4) stretch; image-rendering: pixelated; }
#f1Prova .pTit { margin: 4px 0 2px; font: 700 15px/1.2 var(--font-display); letter-spacing: 0.08em; text-transform: uppercase; }
#f1Prova .pNome { margin: 0 0 6px; font: 600 12px/1.2 var(--font-body); color: #5a3a1c; display: flex; justify-content: space-between; gap: 8px; }
#f1Prova .pQ { margin: 8px 0; font: 700 clamp(16px, 4.6vh, 22px)/1.25 var(--font-body); }
#f1Prova .pOps { display: grid; gap: 6px; grid-template-columns: repeat(3, 1fr); }
#f1Prova .pxBtn { --p: var(--p2, 2px); height: 44px; font-size: 18px; padding: 0 4px; }
#f1Prova .pxBtn.on { border-image-source: var(--sp-laranja); color: #fff; }
#f1Prova .pAcoes { display: flex; justify-content: flex-end; margin-top: 10px; }
#f1Prova .pAcoes .pxBtn { width: auto; min-width: 150px; font-size: 13px; }
#f1Moth { position: fixed; z-index: 12; left: 50%; top: calc(10px + env(safe-area-inset-top, 0px)); transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: 6px; opacity: 0; transition: opacity 0.9s ease; pointer-events: none; }
#f1Moth.on { opacity: 1; }
#f1Moth canvas { width: 102px; height: 72px; image-rendering: pixelated; }
#f1Moth p { margin: 0; max-width: 84vw; text-align: center; font: 700 12px/1.25 var(--font-display); letter-spacing: 0.04em; color: #fff0c8; text-shadow: 0 2px 0 #2a1206, 0 0 6px #000; }`;
    document.head.appendChild(css);
    const raiz = $('raizJogo') || document.body;
    const preto = document.createElement('div'); preto.id = 'f1Preto'; preto.hidden = true; preto.innerHTML = '<p class="f1Leg"></p>';
    const missao = document.createElement('div'); missao.id = 'f1Missao'; missao.hidden = true;
    const ctl = document.createElement('div'); ctl.id = 'f1Ctl'; ctl.hidden = true;
    ctl.innerHTML = '<div class="f1Pad" aria-label="Mover"><div class="f1Knob"></div></div><div class="f1Dica"></div><button type="button" class="pxBtn pxPrim f1Btn"></button>';
    const prova = document.createElement('div'); prova.id = 'f1Prova'; prova.hidden = true;
    const moth = document.createElement('div'); moth.id = 'f1Moth'; moth.innerHTML = '<p></p>'; moth.insertBefore(texMariposa(), moth.firstChild);
    raiz.append(preto, missao, ctl, prova, moth);
    moth.querySelector('p').textContent = T('Quando a mariposa aparece, é porque alguém vai se lembrar de algo...');
    UI = { moth, preto, leg: preto.querySelector('.f1Leg'), missao, ctl, pad: ctl.querySelector('.f1Pad'), knob: ctl.querySelector('.f1Knob'), dica: ctl.querySelector('.f1Dica'), btn: ctl.querySelector('.f1Btn'), prova };
    // joystick (toque/mouse) e teclado
    const joy = { id: null, x: 0, y: 0 };
    const mover = (e) => {
      const r = UI.pad.getBoundingClientRect(), R = r.width / 2;
      let dx = e.clientX - (r.left + R), dy = e.clientY - (r.top + R); const d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / (R * 0.85));
      dx = dx / d * k; dy = dy / d * k; joy.x = dx; joy.y = dy;
      UI.knob.style.transform = 'translate(' + (dx * R * 0.55) + 'px,' + (dy * R * 0.55) + 'px)';
    };
    UI.pad.addEventListener('pointerdown', (e) => { joy.id = e.pointerId; UI.pad.setPointerCapture(e.pointerId); mover(e); });
    UI.pad.addEventListener('pointermove', (e) => { if (e.pointerId === joy.id) mover(e); });
    const solta = (e) => { if (e.pointerId !== joy.id) return; joy.id = null; joy.x = joy.y = 0; UI.knob.style.transform = ''; };
    UI.pad.addEventListener('pointerup', solta); UI.pad.addEventListener('pointercancel', solta);
    UI.joy = joy; UI.teclas = {};
    window.addEventListener('keydown', (e) => {
      if (!S || !S.ativo) return;
      UI.teclas[e.code] = true;
      if ((e.code === 'KeyE' || e.code === 'Enter' || e.code === 'Space') && S.modo === 'livre' && !e.repeat) { e.preventDefault(); interagir(); }
      if (/^(Arrow|Key[WASD])/.test(e.code) && S.modo === 'livre') e.preventDefault();
    });
    window.addEventListener('keyup', (e) => { UI.teclas[e.code] = false; });
    UI.btn.addEventListener('click', () => { if (S && S.ativo && S.modo === 'livre') interagir(); });
  }
  const preto = async (ligado, ms) => { UI.preto.hidden = false; UI.preto.style.transitionDuration = ((ms || 900) / 1000) + 's'; await esperar(30); UI.preto.classList.toggle('claro', !ligado); await esperar(ms == null ? 900 : ms); if (!ligado) UI.preto.hidden = true; };
  const legenda = async (txt, ms) => { UI.leg.textContent = txt; UI.leg.classList.add('on'); await esperar(ms || 2600); UI.leg.classList.remove('on'); await esperar(850); };
  const nm = (k) => T(NOMES[k]);

  // ------------------------------------------------------------------ sala 3D
  function texParede() { return drawTexture(40, 48, (g, w, h) => { g.fillStyle = '#efe0b4'; g.fillRect(0, 0, w, h); g.fillStyle = '#e4d2a0'; for (let i = 0; i < 40; i++) g.fillRect((i * 37) % w, (i * 53) % 30, 2, 1);
    g.fillStyle = '#b98a4d'; g.fillRect(0, 31, w, 17); g.fillStyle = '#a57640'; for (let x = 0; x < w; x += 5) g.fillRect(x, 31, 1, 17); g.fillStyle = '#6b4a28'; g.fillRect(0, 30, w, 2); }); }
  function texPiso() { return drawTexture(32, 32, (g, w, h) => { g.fillStyle = '#d8b583'; g.fillRect(0, 0, w, h); g.fillStyle = '#c59f6c'; for (let y = 0; y < h; y += 8) { g.fillRect(0, y, w, 1); g.fillRect((y * 5) % w, y, 1, 8); } g.fillStyle = '#e2c395'; for (let i = 0; i < 20; i++) g.fillRect((i * 13) % w, (i * 7) % h, 3, 1); }); }
  function texQuadro() { return drawTexture(96, 44, (g, w, h) => { g.fillStyle = '#2f5a3c'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,0.07)'; for (let i = 0; i < 60; i++) g.fillRect((i * 31) % w, (i * 17) % h, 6, 1);
    g.fillStyle = '#f2f2e6'; g.font = 'bold 11px monospace'; g.textAlign = 'left'; g.fillText(T('ÁLGEBRA'), 6, 13); g.font = 'bold 12px monospace'; g.fillText('x + 3 = 7', 6, 28); g.fillText('x = 4', 56, 40);
    g.fillStyle = '#cfcfc0'; g.fillRect(2, h - 3, 18, 2); }); }
  function texPisoCor() { return drawTexture(32, 32, (g, w, h) => { g.fillStyle = '#d3d6d4'; g.fillRect(0, 0, w, h); g.fillStyle = '#bcc1c0'; g.fillRect(0, 0, w, 1); g.fillRect(0, 0, 1, h); g.fillStyle = '#dde0de'; for (let i = 0; i < 18; i++) g.fillRect((i * 13) % w, (i * 7) % h, 2, 1); }); }
  function texParedeCor() { return drawTexture(64, 64, (g, w, h) => { g.fillStyle = '#efe3b5'; g.fillRect(0, 0, w, h); g.fillStyle = '#e2d3a0'; for (let i = 0; i < 40; i++) g.fillRect((i * 29) % w, (i * 11) % 60, 2, 1);
    g.fillStyle = '#5a3d22'; g.fillRect(6, 3, 52, 15); g.fillStyle = '#bfe4f5'; g.fillRect(8, 5, 23, 11); g.fillRect(33, 5, 23, 11); g.fillStyle = '#e8f6fc'; g.fillRect(10, 6, 6, 2); g.fillRect(35, 6, 6, 2);   // (4.3.7) janelas altas, acima dos armários
    g.fillStyle = '#9a9a8c'; g.fillRect(0, 54, w, 10); }); }
  function texMariposa() {
    const half = ['......a..', '.......a.', 'kk.....eo', 'kkkk..bbo', 'kbbkkkbwo', 'kbbbbkwkw', 'kkbbbkwwo', 'ykkbbkowo', 'yyykkkoyo', '.yyykkooy', '.yyyk.ooo', '..yy...oy'];
    const cor = { a: '#1b1410', e: '#c43a20', o: '#2a1c12', k: '#4a3320', b: '#8a6a3c', w: '#f0e2b8', y: '#e8a820' };
    const cv = document.createElement('canvas'); cv.width = 17; cv.height = 12; const g = cv.getContext('2d');
    half.forEach((row, y) => { for (let x = 0; x < 9; x++) { const c = cor[row[x]]; if (!c) continue; g.fillStyle = c; g.fillRect(x, y, 1, 1); g.fillRect(16 - x, y, 1, 1); } });
    return cv;
  }
  function montarSala() {
    const g = new THREE.Group(); g.position.set(OX, 0, 0);
    const basic = (m) => new THREE.MeshBasicMaterial(m);
    const pw = texParede(); pw.wrapS = pw.wrapT = THREE.RepeatWrapping;
    const mp = basic({ map: pw });
    const parede = (cx, cy, w, h, ry, px, pz, mat) => {            // plano virado para dentro da sala (de costas ele some: a câmera pode ficar atrás da parede)
      const geo = new THREE.PlaneGeometry(w, h), uv = geo.attributes.uv;
      for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / 2.25, uv.getY(i) * h / ALT + (cy - h / 2) / ALT);
      const m = new THREE.Mesh(geo, mat || mp); m.rotation.y = ry; m.position.set(px, cy, pz); g.add(m); return m;
    };
    parede(0, ALT / 2, SX * 2, ALT, 0, 0, -SZ);                                     // frente (quadro negro)
    parede(-SX, ALT / 2, SZ * 2, ALT, Math.PI / 2, -SX, 0);                         // esquerda
    parede(SX, ALT / 2, SZ * 2, ALT, -Math.PI / 2, SX, 0);                          // direita
    const gx0 = PORTA.x - 0.5, gx1 = PORTA.x + 0.5;                                 // fundo, com o vão da porta
    parede((-SX + gx0) / 2, ALT / 2, gx0 + SX, ALT, Math.PI, (-SX + gx0) / 2, SZ);
    parede((gx1 + SX) / 2, ALT / 2, SX - gx1, ALT, Math.PI, (gx1 + SX) / 2, SZ);
    parede(PORTA.x, 2.1 + (ALT - 2.1) / 2, 1, ALT - 2.1, Math.PI, PORTA.x, SZ);
    const pp = texPiso(); pp.wrapS = pp.wrapT = THREE.RepeatWrapping; pp.repeat.set(SX * 2 / 1.5, SZ * 2 / 1.5);
    const piso = new THREE.Mesh(new THREE.PlaneGeometry(SX * 2, SZ * 2), basic({ map: pp })); piso.rotation.x = -Math.PI / 2; g.add(piso);
    const chao = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), basic({ color: 0x000000 })); chao.rotation.x = -Math.PI / 2; chao.position.y = -0.04; g.add(chao);  // (4.3.5) lá fora é preto sólido
    const quadro = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 1.75), basic({ map: texQuadro() })); quadro.position.set(0, 1.5, -SZ + 0.02); g.add(quadro);
    // moldura, relógio, janelas, bandeira, mural (cada peça colada na parede, sem atravessar)
    const L = new Lote(), F = (w, h, d, c, x, y, z) => L.caixa(w, h, d, c, x, y, z);
    // (4.4.2) a moldura do quadro é uma malha separada: some quando a câmera passa para trás do quadro (antes a borda ficava visível no ar)
    const LM = new Lote(); LM.caixa(4.12, 0.06, 0.05, 0x7a5430, 0, 2.4, -SZ + 0.03); LM.caixa(4.12, 0.06, 0.05, 0x7a5430, 0, 0.6, -SZ + 0.03); LM.caixa(0.06, 1.86, 0.05, 0x7a5430, -2.03, 1.5, -SZ + 0.03); LM.caixa(0.06, 1.86, 0.05, 0x7a5430, 2.03, 1.5, -SZ + 0.03);
    const moldura = LM.malha(MAT_CORES); g.add(moldura);
    F(0.04, 0.5, 0.5, 0xf2f2ee, SX - 0.03, 2.3, -4.3); F(0.05, 0.2, 0.04, 0x2a1206, SX - 0.04, 2.38, -4.3); F(0.05, 0.04, 0.16, 0x2a1206, SX - 0.04, 2.3, -4.38);              // relógio (parede direita)
    F(0.03, 0.9, 1.4, 0xd7c9a0, -SX + 0.03, 1.5, -1.0);                                                                // mural (parede esquerda)
    for (const wz of [-1.4, 1.4, 4.0]) {                                                                              // janelas na parede direita
      F(0.03, 1.0, 1.3, 0xbfe4f5, SX - 0.025, 1.65, wz); F(0.05, 0.07, 1.42, 0x7a5430, SX - 0.03, 2.18, wz); F(0.05, 0.07, 1.42, 0x7a5430, SX - 0.03, 1.12, wz);
      F(0.05, 1.1, 0.06, 0x7a5430, SX - 0.03, 1.65, wz - 0.68); F(0.05, 1.1, 0.06, 0x7a5430, SX - 0.03, 1.65, wz + 0.68); F(0.05, 1.0, 0.05, 0x7a5430, SX - 0.03, 1.65, wz);
    }
    // mesas e cadeiras
    for (const dz of LINHAS) for (const cx of COLS) {
      F(1.0, 0.05, 0.56, 0xd9a45c, cx, 0.6, dz); F(0.9, 0.04, 0.46, 0xb9854a, cx, 0.5, dz);
      for (const sx of [-0.44, 0.44]) for (const sz of [-0.24, 0.24]) F(0.04, 0.58, 0.04, 0x8c9199, cx + sx, 0.29, dz + sz);
      const cz = dz + 0.62;
      F(0.42, 0.04, 0.42, 0xa4492a, cx, 0.3, cz); F(0.42, 0.34, 0.04, 0xa4492a, cx, 0.5, cz + 0.2);
      for (const sx of [-0.18, 0.18]) for (const sz of [-0.18, 0.18]) F(0.03, 0.3, 0.03, 0x8c9199, cx + sx, 0.15, cz + sz);
    }
    F(2.0, 0.78, 0.8, 0xa8723c, MESA_PROF.x, 0.39, MESA_PROF.z); F(2.1, 0.05, 0.9, 0xc58a4a, MESA_PROF.x, 0.8, MESA_PROF.z);               // mesa da professora
    F(0.32, 0.2, 0.24, 0xc8202a, MESA_PROF.x - 0.6, 0.93, MESA_PROF.z); F(0.32, 0.12, 0.24, 0x2a4f9a, MESA_PROF.x - 0.6, 1.09, MESA_PROF.z); F(0.3, 0.14, 0.22, 0x3f9d2a, MESA_PROF.x - 0.1, 0.9, MESA_PROF.z - 0.1);
    F(0.5, 1.6, 1.2, 0xe8e8e0, SX - 0.3, 0.8, -2.9); F(0.03, 1.5, 0.5, 0xc9c9c0, SX - 0.56, 0.8, -3.15); F(0.03, 1.5, 0.5, 0xc9c9c0, SX - 0.56, 0.8, -2.65);   // armário
    const mob = L.malha(MAT_CORES); g.add(mob);
    const papel = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.012, 0.24), new THREE.MeshLambertMaterial({ color: 0xffffff })); papel.position.set(0, 0.63, LINHAS[1] + 0.02); g.add(papel);
    // bandeira do Brasil (a mesma bandeira pixelada da tela de idiomas)
    { const img = new Image(), tx = new THREE.Texture(img); tx.magFilter = tx.minFilter = THREE.NearestFilter; img.onload = () => { tx.needsUpdate = true; }; img.src = bandeiraUrl('br');
      const f = new THREE.Mesh(new THREE.PlaneGeometry(0.96, 0.63), basic({ map: tx })); f.rotation.y = Math.PI / 2; f.position.set(-SX + 0.05, 1.9, 2.6); g.add(f); }
    // porta (gira em volta da dobradiça, para dentro da sala)
    const pivo = new THREE.Group(); pivo.position.set(PORTA.x + 0.5, 0, SZ);
    const folha = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.1, 0.07), new THREE.MeshLambertMaterial({ color: 0xb98042 })); folha.position.set(-0.5, 1.05, 0); pivo.add(folha);
    const macan = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.12), new THREE.MeshLambertMaterial({ color: 0xd8d8d0 })); macan.position.set(-0.88, 1.0, 0); pivo.add(macan);
    const lm = new Lote(); lm.caixa(1.16, 0.08, 0.16, 0x7a5430, PORTA.x, 2.14, SZ); lm.caixa(0.08, 2.1, 0.16, 0x7a5430, PORTA.x - 0.54, 1.05, SZ); lm.caixa(0.08, 2.1, 0.16, 0x7a5430, PORTA.x + 0.54, 1.05, SZ);
    g.add(lm.malha(MAT_CORES)); g.add(pivo);
    const seta = fazSeta(); g.add(seta);
    scene.add(g);
    return { g, pivo, seta, papel, moldura };
  }
  function fazSeta() {
    const La = new Lote(); La.caixa(0.18, 0.18, 0.18, 0xffd92b, 0, 0.3, 0); La.caixa(0.34, 0.12, 0.34, 0xffd92b, 0, 0.12, 0); La.caixa(0.1, 0.12, 0.1, 0xffd92b, 0, 0.0, 0);
    return La.malha(new THREE.MeshBasicMaterial({ vertexColors: true }));
  }

  // ------------------------------------------------------------------ corredor 3D (depois da sala)
  const ZK = -7.4;                                   // z do armário (de altura dupla) onde o menino de óculos é trancado (parede esquerda)
  const FX = -CX + 0.5;                              // face dos armários da esquerda (voltada para o corredor)
  const PROF_V = 0.4;                                // (4.3.7) profundidade do vão das portas (buraco na parede)
  function montarCorredor() {
    const g = new THREE.Group(); g.position.set(OX, 0, 0);
    const basic = (m) => new THREE.MeshBasicMaterial(m);
    const H = 3.0, HP = 2.25;                        // altura da parede e do vão da porta
    const pp = texPisoCor(); pp.wrapS = pp.wrapT = THREE.RepeatWrapping; pp.repeat.set(CX * 2 / 1.2, CL * 2 / 1.2);
    const piso = new THREE.Mesh(new THREE.PlaneGeometry(CX * 2, CL * 2), basic({ map: pp })); piso.rotation.x = -Math.PI / 2; g.add(piso);
    const chao = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), basic({ color: 0x000000 })); chao.rotation.x = -Math.PI / 2; chao.position.y = -0.04; g.add(chao);
    const pw = texParedeCor(); pw.wrapS = pw.wrapT = THREE.RepeatWrapping;
    const mp = basic({ map: pw }), mDupla = basic({ color: 0xe2d3a0, side: THREE.DoubleSide }), mPreto = basic({ color: 0x000000, side: THREE.DoubleSide });
    const portas = [[-1, 11.0], [1, 6.0], [-1, 2.0], [1, -9.4]];                                   // [lado, z] das portas de sala
    // paredes laterais em pedaços (a textura segue a posição no mundo), com um vão em cada porta
    const paredeSeg = (sd, z0, z1, y0, y1) => {
      const w = z1 - z0, geo = new THREE.PlaneGeometry(w, y1 - y0), uv = geo.attributes.uv, s = sd < 0 ? -1 : 1, zc = (z0 + z1) / 2;
      for (let i = 0; i < uv.count; i++) uv.setXY(i, (zc + s * (uv.getX(i) - 0.5) * w + CL) / 3.2, (y0 + uv.getY(i) * (y1 - y0)) / H);
      const m = new THREE.Mesh(geo, mp); m.rotation.y = sd < 0 ? Math.PI / 2 : -Math.PI / 2; m.position.set(sd * CX, (y0 + y1) / 2, zc); g.add(m);
    };
    for (const sd of [-1, 1]) {
      const zs = portas.filter((p) => p[0] === sd).map((p) => p[1]).sort((a, b) => a - b); let z = -CL;
      for (const dz of zs) {
        paredeSeg(sd, z, dz - 0.55, 0, H); paredeSeg(sd, dz - 0.55, dz + 0.55, HP, H); z = dz + 0.55;
        // o buraco na parede: batentes, verga, chão e o fundo escuro (a sala atrás)
        for (const sz of [-1, 1]) { const j = new THREE.Mesh(new THREE.PlaneGeometry(PROF_V, HP), mDupla); j.position.set(sd * (CX + PROF_V / 2), HP / 2, dz + sz * 0.55); g.add(j); }
        const vg = new THREE.Mesh(new THREE.PlaneGeometry(PROF_V, 1.1), mDupla); vg.rotation.x = Math.PI / 2; vg.position.set(sd * (CX + PROF_V / 2), HP, dz); g.add(vg);
        const sl = new THREE.Mesh(new THREE.PlaneGeometry(PROF_V, 1.1), basic({ color: 0x77736a, side: THREE.DoubleSide })); sl.rotation.x = Math.PI / 2; sl.position.set(sd * (CX + PROF_V / 2), 0.01, dz); g.add(sl);
        const fu = new THREE.Mesh(new THREE.PlaneGeometry(1.1, HP), mPreto); fu.rotation.y = Math.PI / 2; fu.position.set(sd * (CX + PROF_V), HP / 2, dz); g.add(fu);
      }
      paredeSeg(sd, z, CL, 0, H);
    }
    // fundo do corredor (porta da rua, dupla, também dentro de um buraco na parede)
    const PF = 0.5, GX = 0.95, HF = 2.3, corFundo = basic({ color: 0xefe3b5 }), corFundoD = basic({ color: 0xe2d3a0, side: THREE.DoubleSide });
    const plano = (w, h, x, y, z, ry, mat) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.rotation.y = ry; m.position.set(x, y, z); g.add(m); return m; };
    plano(CX - GX, H, -(CX + GX) / 2, H / 2, -CL, 0, corFundo); plano(CX - GX, H, (CX + GX) / 2, H / 2, -CL, 0, corFundo); plano(GX * 2, H - HF, 0, (H + HF) / 2, -CL, 0, corFundo);
    for (const sx of [-1, 1]) plano(PF, HF, sx * GX, HF / 2, -CL - PF / 2, Math.PI / 2, corFundoD);
    const vf = plano(GX * 2, PF, 0, HF, -CL - PF / 2, 0, corFundoD); vf.rotation.x = Math.PI / 2;
    // lá fora: calçada clara e céu (só aparece pela porta aberta)
    const cal = plano(6, 5, 0, 0.01, -CL - 2.9, 0, basic({ color: 0xc9c2a6 })); cal.rotation.x = -Math.PI / 2;
    plano(12, 4.5, 0, 2.25, -CL - 5.4, 0, basic({ color: 0xbfe4f5 }));
    const L = new Lote(), F = (w, h, d, c, x, y, z) => L.caixa(w, h, d, c, x, y, z);
    // armários: o comum é de 1 (dois pequenos empilhados, de 1 m cada); alguns são de ALTURA DUPLA (uma porta só, de 2 m — o da esquerda em ZK é o do menino de óculos); pedaços da parede ficam livres p/ quadro de avisos e bebedouro
    const livresD = [[3.3, 5.1], [-5.7, -4.5]];
    const bloq = (sd) => { const b = portas.filter((p) => p[0] === sd).map((p) => [p[1] - 0.8, p[1] + 0.8]); if (sd === -1) b.push([ZK - 0.25, ZK + 0.25]); else for (const l of livresD) b.push(l); return b; };
    const escuro = 0x2a0a0c;
    const armario = (sd, zc, alto, k) => {
      const cor = (k % 2) ? 0xb3262e : 0x9c1f27, xc = sd * (CX - 0.25), xf = sd * (CX - 0.5) - sd * 0.005, w = 0.5;
      F(0.5, 2.0, w - 0.03, cor, xc, 1.0, zc);
      if (alto) {                                                                                  // altura dupla: porta única de 2 m
        for (const y of [1.84, 1.74, 1.64]) F(0.03, 0.04, 0.3, escuro, xf, y, zc);
        F(0.04, 0.16, 0.04, 0xd0d0cc, xf - sd * 0.005, 1.1, zc + 0.12);
      } else {                                                                                     // comum: dois armários pequenos, um em cima do outro
        for (const y0 of [0, 1.0]) {
          for (const y of [y0 + 0.88, y0 + 0.8]) F(0.03, 0.04, 0.3, escuro, xf, y, zc);
          F(0.04, 0.12, 0.04, 0xd0d0cc, xf - sd * 0.005, y0 + 0.5, zc + 0.12);
        }
        F(0.03, 0.02, w - 0.03, escuro, xf, 1.0, zc);
      }
    };
    for (const sd of [-1, 1]) {
      const bs = bloq(sd); let z = -CL + 0.1, k = 0;
      while (z < CL - 0.35) {
        const bate = bs.find((b) => z < b[1] - 1e-6 && z + 0.5 > b[0] + 1e-6); if (bate) { z = bate[1]; continue; }
        armario(sd, z + 0.25, ((k * 5 + (sd < 0 ? 1 : 3)) % 7) < 3, k); z += 0.5; k++;
      }
    }
    // o armário de altura dupla que abre e fecha: por dentro é PRETO (carcaça aberta na frente)
    { const kw = 0.5, xi = -CX + 0.25, vermelho = 0x9c1f27, preto = 0x040405;
      F(0.02, 2.0, kw - 0.04, preto, -CX + 0.01, 1.0, ZK); F(0.5, 0.03, kw - 0.04, preto, xi, 1.985, ZK); F(0.5, 0.03, kw - 0.04, preto, xi, 0.015, ZK);
      F(0.5, 2.0, 0.03, preto, xi, 1.0, ZK - kw / 2 + 0.03); F(0.5, 2.0, 0.03, preto, xi, 1.0, ZK + kw / 2 - 0.03);
      F(0.03, 2.0, 0.04, vermelho, FX - 0.015, 1.0, ZK - kw / 2 + 0.02); F(0.03, 2.0, 0.04, vermelho, FX - 0.015, 1.0, ZK + kw / 2 - 0.02);
      F(0.03, 0.04, kw, vermelho, FX - 0.015, 1.99, ZK); F(0.03, 0.04, kw, vermelho, FX - 0.015, 0.02, ZK);
      F(0.5, 0.04, kw, vermelho, xi, 2.0, ZK); }   // (4.4.2) tampa vermelha por cima (antes só havia a placa preta: parecia sem teto)
    // portas das salas e batentes na frente do buraco (a folha fica lá no fundo do vão)
    const marrom = 0x7a4a2a, batente = 0x4a2c16, xFolha = (sd) => sd * (CX + PROF_V - 0.06);
    for (const [sd, z] of portas) {
      F(0.07, HP + 0.05, 0.1, batente, sd * (CX - 0.03), (HP + 0.05) / 2, z - 0.6); F(0.07, HP + 0.05, 0.1, batente, sd * (CX - 0.03), (HP + 0.05) / 2, z + 0.6); F(0.07, 0.1, 1.3, batente, sd * (CX - 0.03), HP + 0.05, z);
      if ((sd === -1 && z === 11.0) || (sd === 1 && z === -9.4)) continue;                         // essas duas abrem de verdade (pivôs abaixo)
      F(0.05, 2.1, 1.0, marrom, xFolha(sd), 1.05, z); F(0.06, 0.5, 0.3, 0x9ec7e0, xFolha(sd) - sd * 0.01, 1.55, z); F(0.05, 0.06, 0.1, 0xd8d8d0, xFolha(sd) - sd * 0.04, 1.0, z - 0.4);
    }
    // porta da rua: batentes + folhas (pivôs abaixo)
    F(0.1, HF + 0.05, 0.07, batente, -GX - 0.05, (HF + 0.05) / 2, -CL + 0.03); F(0.1, HF + 0.05, 0.07, batente, GX + 0.05, (HF + 0.05) / 2, -CL + 0.03); F(GX * 2 + 0.2, 0.1, 0.07, batente, 0, HF + 0.05, -CL + 0.03);
    // quadro de avisos e bebedouro (nos pedaços livres da parede direita)
    F(0.04, 0.7, 1.0, 0xb98042, CX - 0.03, 1.5, 4.2); F(0.05, 0.5, 0.8, 0xe8d8a8, CX - 0.05, 1.5, 4.2); F(0.05, 0.12, 0.2, 0xd23a2a, CX - 0.07, 1.62, 3.95); F(0.05, 0.12, 0.2, 0x2a6fd2, CX - 0.07, 1.4, 4.4);
    F(0.4, 0.9, 0.5, 0xb8bcc0, CX - 0.25, 0.45, -5.1); F(0.3, 0.05, 0.4, 0x8a8e92, CX - 0.25, 0.92, -5.1); F(0.08, 0.14, 0.08, 0x5a5e62, CX - 0.12, 1.02, -5.1);
    g.add(L.malha(MAT_CORES));
    const folhaMesh = (w, h, cor) => new THREE.Mesh(new THREE.BoxGeometry(0.05, h, w), new THREE.MeshLambertMaterial({ color: cor }));
    // porta da sala de onde saímos (abre para o corredor)
    const pivoD = new THREE.Group(); pivoD.position.set(xFolha(-1), 0, 11.5);
    const fo = folhaMesh(1.0, 2.1, 0xb98042); fo.position.set(0, 1.05, -0.5); pivoD.add(fo); g.add(pivoD);
    // porta por onde o valentão entra e sai (direita)
    const pivoV = new THREE.Group(); pivoV.position.set(xFolha(1), 0, -9.4 + 0.5);
    const fv = folhaMesh(1.0, 2.1, 0xb98042); fv.position.set(0, 1.05, -0.5); pivoV.add(fv); g.add(pivoV);
    // porta dupla da rua (abre para dentro do corredor)
    const pivoFE = new THREE.Group(), pivoFD = new THREE.Group();
    pivoFE.position.set(-GX, 0, -CL - 0.2); pivoFD.position.set(GX, 0, -CL - 0.2);
    for (const [pv, sx] of [[pivoFE, 1], [pivoFD, -1]]) {
      const lf = new THREE.Mesh(new THREE.BoxGeometry(GX - 0.02, 2.2, 0.06), new THREE.MeshLambertMaterial({ color: 0x5a3a20 })); lf.position.set(sx * GX / 2, 1.1, 0); pv.add(lf);
      const vd = new THREE.Mesh(new THREE.BoxGeometry(GX - 0.3, 1.2, 0.08), new THREE.MeshLambertMaterial({ color: 0x9ec7e0 })); vd.position.set(sx * GX / 2, 1.3, 0); pv.add(vd); g.add(pv);
    }
    // a porta do armário trancado (dobradiça na borda de trás; folha única larga)
    const pivoK = new THREE.Group(); pivoK.position.set(FX - 0.01, 1.0, ZK - 0.22);
    const fk = new THREE.Mesh(new THREE.BoxGeometry(0.03, 1.96, 0.44), new THREE.MeshLambertMaterial({ color: 0x9c1f27 })); fk.position.set(0, 0, 0.22); pivoK.add(fk);
    for (const y of [0.84, 0.74, 0.64]) { const vt = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.04, 0.3), new THREE.MeshLambertMaterial({ color: escuro })); vt.position.set(-0.005, y, 0.22); pivoK.add(vt); }
    const mk = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.14, 0.04), new THREE.MeshLambertMaterial({ color: 0xd0d0cc })); mk.position.set(-0.03, 0.1, 0.34); pivoK.add(mk); g.add(pivoK);
    pivoK.rotation.y = 100 * rad;                                                                      // começa aberto (o menino está arrumando as coisas)
    const seta = fazSeta(); g.add(seta);
    scene.add(g);
    return { g, pivo: pivoD, pivoK, pivoV, pivoFE, pivoFD, seta };
  }

  // ------------------------------------------------------------------ personagens
  const ci = (n) => Math.max(0, ESTILOS_CABELO.findIndex((c) => c.nome === n)), ri = (n) => Math.max(0, ROSTOS.findIndex((r) => r.nome === n));
  function criar(sala, d) {
    const o = Object.assign({ camisa: '#F2F2EE', listra: '#F2F2EE', gola: '#3a64b8', calcao: 0x2a4f9a, meia: '#F2F2EE', sola: '#d9d9d9', corTexto: '#F2F2EE', numero: '', nome: ' ', fundoNome: 'rgba(0,0,0,0)',
      barba: 0, manga: 0, meiao: 1, labio: 3, cabecao: CAB, escala: ESC }, d);
    const m = makeAthlete(o);
    m.etiqueta.visible = false;
    sala.g.add(m.raiz);
    const A = { m, opt: o, kc: o.cabecao, x: 0, z: 0, yaw: Math.PI / 2, yawAlvo: Math.PI / 2, estado: 'parado', rota: null, vel: 1.9, fase: 0, oculto: false, fala: false, escreve: false };
    S.elenco.push(A);
    return A;
  }
  function oculos(A) {                                  // (4.3.7) óculos de armação preta: dois aros em volta dos olhos + ponte + hastes nas laterais da cabeça
    const kc = A.kc, Lg = new Lote(), c = 0x111118;
    const xf = 0.258 * kc, yo = 1.36 + 0.245 * kc, zo = 0.0975 * kc;   // olhos do rosto 16x16: altura ≈ 0,245·kc, a ±0,0975·kc do centro
    const gw = 0.17 * kc, gh = 0.15 * kc, e = 0.03 * kc, d = 0.04 * kc;
    for (const sz of [-1, 1]) {
      const zc = sz * zo;
      Lg.caixa(d, e, gw, c, xf, yo + gh / 2 - e / 2, zc); Lg.caixa(d, e, gw, c, xf, yo - gh / 2 + e / 2, zc);        // aro: em cima e embaixo
      Lg.caixa(d, gh, e, c, xf, yo, zc - gw / 2 + e / 2); Lg.caixa(d, gh, e, c, xf, yo, zc + gw / 2 - e / 2);         // aro: laterais
      Lg.caixa(0.03 * kc, e, 0.09 * kc, c, 0.25 * kc, yo + 0.04 * kc, sz * 0.215 * kc);                              // ligação com a haste
      Lg.caixa(0.24 * kc, e, e, c, 0.13 * kc, yo + 0.04 * kc, sz * 0.256 * kc);                                       // haste (por fora da cabeça)
    }
    Lg.caixa(d, e, 0.06 * kc, c, xf, yo + 0.03 * kc, 0);                                                              // ponte
    A.m.corpo.add(Lg.malha(MAT_CORES));
  }
  const poseSentado = (A, t, dt) => {
    const m = A.m, e = Math.min(1, dt * 12);
    m.raiz.position.y = ASSENTO_Y; m.pernaE.rotation.z = m.pernaD.rotation.z = 1.5; usarJoelhos(m, -1.5, -1.5);
    m.bracoE.rotation.z = lerp(m.bracoE.rotation.z, 1.25, e); m.bracoD.rotation.z = lerp(m.bracoD.rotation.z, 1.25 + (A.escreve ? Math.sin(t * 7 + A.x) * 0.07 : 0), e);
    m.bracoE.rotation.x = m.bracoD.rotation.x = 0; m.corpo.rotation.z = 0;
    if (A.escreve) m.cabeca.rotation.z = 0;
  };
  const poseChao = (A, t, dt) => {                                       // (4.4.2) sentado no chão, pernas esticadas, mãos apoiadas atrás
    const m = A.m, e = Math.min(1, dt * 12);
    m.raiz.position.y = -0.44 * (A.opt.escala || 1) / 0.68; m.pernaE.rotation.z = m.pernaD.rotation.z = 1.5; usarJoelhos(m, 0, 0);
    m.bracoE.rotation.z = lerp(m.bracoE.rotation.z, 0.55, e); m.bracoD.rotation.z = lerp(m.bracoD.rotation.z, 0.55, e);
    m.bracoE.rotation.x = -0.35; m.bracoD.rotation.x = 0.35; m.corpo.rotation.z = 0;
  };
  const poseAquece = (A, t, dt) => {                                     // (4.4.2) aquecendo: pulinhos e braços girando (o mesmo do reserva no banco)
    const m = A.m, f = t * 2.2 + A.fase, pul = Math.max(0, Math.sin(f * 3));
    usarJoelhos(m, 0, 0); m.raiz.position.y = pul * 0.12;
    m.bracoE.rotation.z = Math.sin(f * 2) * 1.6 + 1.2; m.bracoD.rotation.z = Math.sin(f * 2 + Math.PI) * 1.6 + 1.2;
    m.bracoE.rotation.x = 0.25; m.bracoD.rotation.x = -0.25;
    usarCotovelo(m.bracoE, 0, 0); usarCotovelo(m.bracoD, 0, 0);
    m.pernaE.rotation.z = pul * 0.35; m.pernaD.rotation.z = pul * 0.35;
  };
  const poseEmPe = (A, t, dt, andando) => {
    const m = A.m;
    usarJoelhos(m, 0, 0); m.raiz.position.y = 0;
    if (andando) {
      A.fase += dt * A.vel * 4.6; const s = Math.sin(A.fase);
      m.pernaE.rotation.z = s * 0.75; m.pernaD.rotation.z = -s * 0.75; m.bracoE.rotation.z = -s * 0.6; m.bracoD.rotation.z = s * 0.6;
      m.raiz.position.y = Math.abs(Math.cos(A.fase)) * 0.025;
    } else {
      const e = Math.min(1, dt * 10);
      m.pernaE.rotation.z = lerp(m.pernaE.rotation.z, 0, e); m.pernaD.rotation.z = lerp(m.pernaD.rotation.z, 0, e);
      m.bracoE.rotation.z = lerp(m.bracoE.rotation.z, A.fala ? Math.sin(t * 5 + (A.conv || 0)) * 0.35 + 0.4 : 0, e); m.bracoD.rotation.z = lerp(m.bracoD.rotation.z, A.fala ? Math.sin(t * 5 + 2) * 0.35 + 0.4 : 0, e);
    }
    m.bracoE.rotation.x = m.bracoD.rotation.x = 0; m.corpo.rotation.z = 0;
    // (4.4.0) segurando a bola com as DUAS mãos: os braços vão para a posição de segurar (th = quanto sobe: 1,15 na frente, 2,85 acima da cabeça;
    // ph = quanto as mãos se fecham uma contra a outra). Vale parado ou andando; a bola acompanha as mãos (ver atualizar).
    if (A.segura) { m.bracoE.rotation.z = m.bracoD.rotation.z = A.segura.th; m.bracoE.rotation.x = -A.segura.ph; m.bracoD.rotation.x = A.segura.ph; }
  };
  function andar(A, pts, vel) {
    A.rota = pts.map((p) => ({ x: p[0], z: p[1] })); A.vel = vel || 1.9;
    return new Promise((r) => { A.rotaRes = r; });
  }
  // (4.4.0) Como andar(), mas dá para desistir no meio: 'parar' é checada a cada instante e, se for verdadeira, o ator para e a função devolve false.
  async function andarAte(A, pt, vel, parar) {
    A.rota = [{ x: pt[0], z: pt[1] }]; A.vel = vel || 1.9;
    let fim = false; A.rotaRes = () => { fim = true; };
    while (!fim) { if (parar && parar()) { A.rota = null; A.rotaRes = null; return false; } await esperar(70); }
    return true;
  }
  const olhar = (A, x, z) => { A.yawAlvo = Math.atan2(-(z - A.z), x - A.x); };
  const paraFrente = (A) => { A.yawAlvo = Math.PI / 2; };                 // olhando para o quadro (de frente)
  function sentar(A, cx, dz, sim) { A.sentado = !!sim; if (sim) { A.cx = cx; A.cz = dz + 0.62; A.x = cx; A.z = dz + 0.62; A.yaw = A.yawAlvo = Math.PI / 2; A.rota = null; } }

  // ------------------------------------------------------------------ câmera
  const seg = (A, ox, oy, oz, ty) => [A.x + ox, oy, A.z + oz, A.x, ty, A.z];
  function dupla(A, B, dist, alt) {                                     // câmera de lado, mostrando os dois
    const mx = (A.x + B.x) / 2, mz = (A.z + B.z) / 2, dx = B.x - A.x, dz = B.z - A.z, l = Math.hypot(dx, dz) || 1;
    let px = -dz / l, pz = dx / l;
    if (Math.abs(pz) < 0.4) { if (px < 0) { px = -px; pz = -pz; } } else if (pz > 0) { px = -px; pz = -pz; }     // lado do quadro (z menor) ou, se estão alinhados em z, o lado +x
    const cor = S && S.lugar === 'corredor';
    const d = Math.max(cor ? 2.3 : dist, l * 1.9);                      // (4.3.7) corredor: câmera bem mais perto
    let cx = mx + px * d, cz = mz + pz * d;
    if (cor) { cx = Math.max(-CX + 0.8, Math.min(CX - 0.8, cx)); cz = Math.max(-CL + 0.7, Math.min(CL - 0.7, cz)); }
    return [cx, cor ? 1.55 : alt, cz, mx, 0.85, mz];
  }
  const CAMS = {
    porta: [4.0, 1.6, 1.5, 4.7, 1.1, 5.0],                              // olhando a porta de dentro da sala
    jog: () => seg(S.jog, -1.7, 1.35, -1.9, 0.8), aluno: () => seg(S.jog, -1.7, 1.35, -1.9, 0.8),
    prof: [0.0, 1.5, -1.9, -2.4, 1.15, -3.9],
    dupla: () => dupla(S.parA, S.parB, 2.7, 1.7), entrega: () => dupla(S.jog, S.prof, 2.8, 1.7),
    geral: [5.6, 3.7, 4.8, -1.0, 0.9, -1.5],
    aula: () => (S && S.lugar === 'patio') ? (() => { const J = S.jog, fx = J.x * 0.6; return [fx, 5.2, J.z + 5.6, fx, 0.3, J.z - 1.6]; })()
      : (S && S.lugar === 'corredor') ? (() => { const J = S.jog, fx = J.x * 0.4; return [fx, 5.0, J.z + 4.4, fx, 0.3, J.z - 1.2]; })() : [5.6, 3.4, 4.7, -0.8, 0.9, -1.4],   // (4.4.0) no pátio também acompanha o jogador   // (4.3.7) no corredor a câmera 'aula' acompanha o jogador (antes ficava na sala, a 16 m do João)
    mesa: () => seg(S.jog, 0.5, 1.35, 1.7, 0.85),
    saida: [4.0, 1.6, 1.5, 4.7, 1.1, 5.4],
    cor_ini: [1.0, 2.3, 12.6, -2.8, 1.0, 10.5], cor_buli: [0.4, 1.7, -4.1, -2.4, 1.0, -7.4], cor_fim: [0.0, 1.7, -8.4, 0, 1.0, -12.4],
    pat_porta: [-2.6, 1.7, -4.8, 0, 1.3, 7.2], pat_bola: () => [S.joaoA.x + 1.3, 1.25, S.joaoA.z + 2.3, S.joaoA.x, 1.0, S.joaoA.z],
    qd_ini: [-9, 2.8, -35, 0, 1.0, -22], qd_geral: [-5.5, 3.0, -31.5, 1.5, 0.9, -22.5],
  };
  const camPara = (nome, corte) => { S.camNome = nome; if (corte) S.camSnap = true; };

  // ------------------------------------------------------------------ colisão e caminhos
  const RETS = []; for (const dz of LINHAS) for (const cx of COLS) RETS.push([cx - 0.52, cx + 0.52, dz - 0.28, dz + 0.8]);
  RETS.push([MESA_PROF.x - 1.05, MESA_PROF.x + 1.05, MESA_PROF.z - 0.45, MESA_PROF.z + 0.45], [SX - 0.55, SX, -3.5, -2.3]);
  function livre(x, z, R) {
    R = R || 0.22;
    if (S && S.lugar === 'patio') {                                    // pátio, portão da quadra e a quadra
      if (z > PAT_Z0 - 0.9) return false;
      if (z > Z_PORTAO - 0.2) {                                         // pátio (menos o tronco da árvore do professor)
        for (const [tx, tz] of ARVORES_PATIO) if (Math.hypot(x - tx, z - tz) < 0.62) return false;          // (4.4.2) troncos
        for (const A of S.gente || []) if (!A.oculto && Math.hypot(x - A.x, z - A.z) < 0.42 + (R ? R - 0.22 : 0)) return false;   // (4.4.2) pessoas também são sólidas
        if (S.joaoA && !S.joaoA.oculto && S.joaoA.bloq && Math.hypot(x - S.joaoA.x, z - S.joaoA.z) < 0.42) return false;
        return Math.abs(x) < 20;
      }
      if (z > Z_PORTAO - 1.4) return Math.abs(x) < PORTAO - 0.2;        // o portão
      return Math.abs(x) < QX + 1.2 && z > QZ - QH - 1.2;
    }
    if (S && S.lugar === 'corredor') {
      if (Math.abs(x) > CX - 0.5 - 0.12 || z < -CL + 0.6 || z > CL - 0.6) return false;
      for (const c of S.cirs) if (Math.hypot(x - c.x, z - c.z) < c.r + R) return false;
      return true;
    }
    if (x < -SX + 0.3 || x > SX - 0.3 || z < -SZ + 0.3 || z > SZ - 0.3) return false;
    for (const [x0, x1, z0, z1] of RETS) if (x > x0 - R && x < x1 + R && z > z0 - R && z < z1 + R) return false;
    if (Math.hypot(x - PROF.x, z - PROF.z) < 0.5 + R) return false;
    return true;
  }
  function caminho(x0, z0, x1, z1) {                                    // acha um caminho que desvia de mesas e cadeiras (BFS numa grade de 20 cm)
    const g = 0.2, W = Math.round(SX * 2 / g) + 1, H = Math.round(SZ * 2 / g) + 1;
    const ix = (x) => Math.max(0, Math.min(W - 1, Math.round((x + SX) / g))), iz = (z) => Math.max(0, Math.min(H - 1, Math.round((z + SZ) / g)));
    const wx = (i) => i * g - SX, wz = (j) => j * g - SZ, ok = (i, j) => livre(wx(i), wz(j), 0.2);
    const achar = (i, j) => {
      if (ok(i, j)) return [i, j];
      for (let r = 1; r < 15; r++) for (let a = -r; a <= r; a++) for (let b = -r; b <= r; b++) { if (Math.max(Math.abs(a), Math.abs(b)) !== r) continue; const ii = i + a, jj = j + b; if (ii >= 0 && jj >= 0 && ii < W && jj < H && ok(ii, jj)) return [ii, jj]; }
      return [i, j];
    };
    const s = achar(ix(x0), iz(z0)), e = achar(ix(x1), iz(z1));
    const prev = new Int32Array(W * H).fill(-2), fila = [s[0] + s[1] * W]; prev[fila[0]] = -1;
    const alvo = e[0] + e[1] * W;
    for (let q = 0; q < fila.length && prev[alvo] === -2; q++) {
      const c = fila[q], ci_ = c % W, cj = (c / W) | 0;
      for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
        const ni = ci_ + a, nj = cj + b;
        if (ni < 0 || nj < 0 || ni >= W || nj >= H || prev[ni + nj * W] !== -2 || !ok(ni, nj)) continue;
        if (a && b && (!ok(ci_ + a, cj) || !ok(ci_, cj + b))) continue;
        prev[ni + nj * W] = c; fila.push(ni + nj * W);
      }
    }
    if (prev[alvo] === -2) return [[x1, z1]];
    let pts = []; for (let c = alvo; c !== -1; c = prev[c]) pts.push([wx(c % W), wz((c / W) | 0)]);
    pts.reverse();
    const vis = (a, b) => { const d = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.ceil(d / 0.08); for (let k = 1; k < n; k++) { const t = k / n; if (!livre(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, 0.2)) return false; } return true; };
    const out = []; let i0 = 0;
    while (i0 < pts.length - 1) { let j = pts.length - 1; while (j > i0 + 1 && !vis(pts[i0], pts[j])) j--; out.push(pts[j]); i0 = j; }
    return out;
  }
  function irPara(A, x1, z1, vel) {                                     // anda até lá desviando dos móveis (se estiver sentado, puxa a cadeira para trás primeiro)
    if (S && S.lugar !== 'sala') return andar(A, [[x1, z1]], vel);       // (4.3.7) fora da sala não há mesas: vai direto (o BFS é só da sala e puxava o jogador para longe do João)
    const pts = []; let x0 = A.x, z0 = A.z;
    if (A.sentado) { A.sentado = false; z0 = A.z + 0.5; pts.push([x0, z0]); }
    for (const p of caminho(x0, z0, x1, z1)) pts.push(p);
    return andar(A, pts, vel);
  }
  const alvos = () => {
    if (!S || S.modo !== 'livre') return [];
    const l = [];
    if (S.lugar === 'patio') {                                          // (4.4.0) o Professor Roberto vigiando a turma
      const R = S.falantes && S.falantes.rob && S.falantes.rob.A;
      if (R && !S.convite) l.push({ id: 'rob', x: R.x, z: R.z, r: 2.1, txt: Tf('Falar com {0}', nm('rob')) });
      return l;
    }
    if (S.lugar === 'corredor') {
      l.push({ id: 'lucia2', x: S.luciaA.x, z: S.luciaA.z, r: 1.7, txt: Tf('Falar com {0}', nm('lucia')) });
      if (S.trancado) l.push({ id: 'armario', x: FX + 0.6, z: ZK, r: 1.7, txt: T('Abrir o armário') });
      if (!S.joaoSaiu) l.push({ id: 'joao2', x: S.joaoA.x, z: S.joaoA.z, r: 1.8, txt: Tf('Falar com {0}', nm('joao')) });
      else l.push({ id: 'rua', x: 0, z: -CL + 1.0, r: 1.8, txt: T('Sair da escola') });
      return l;
    }
    if (S.fase === 'antes') {
      l.push({ id: 'prof', x: PROF.x, z: PROF.z + 0.3, r: 2.1, txt: Tf('Falar com {0}', nm('prof')) });
      l.push({ id: 'joao', x: SPOT.joao[0], z: SPOT.joao[1], r: 0.95, txt: Tf('Falar com {0}', nm('joao')) });
      l.push({ id: 'lucia', x: SPOT.lucia[0], z: SPOT.lucia[1], r: 0.95, txt: Tf('Falar com {0}', nm('lucia')) });
      l.push({ id: 'cadeira', x: COLS[1], z: LINHAS[1] + 1.2, r: 1.55, txt: T('Sentar na sua cadeira') });
      if (!S.portaTrancada) l.push({ id: 'porta', x: PORTA.x, z: PORTA.z - 0.5, r: 1.2, txt: T('Sair da sala') });
    } else {
      if (!S.profFalou2) l.push({ id: 'prof', x: PROF.x, z: PROF.z + 0.3, r: 2.1, txt: Tf('Falar com {0}', nm('prof')) });
      l.push({ id: 'porta', x: PORTA.x, z: PORTA.z - 0.5, r: 1.2, txt: T('Sair da sala') });
    }
    return l;
  };
  function alvoAtual() {
    const J = S.jog; let best = null, bs = 1e9;
    for (const a of alvos()) {
      const dx = a.x - J.x, dz = a.z - J.z, d = Math.hypot(dx, dz);
      if (d > a.r) continue;
      const sc = d - 0.45 * ((dx * S.face.x + dz * S.face.z) / (d || 1));
      if (sc < bs) { bs = sc; best = a; }
    }
    return best;
  }

  // ------------------------------------------------------------------ falas
  const nomeJog = () => S.nome;
  const liberar = () => {
    S.modo = 'livre'; UI.ctl.hidden = false; S.bloq = performance.now() + 400;
    const J = S.jog;                                  // se terminou a cena dentro de um móvel, sai dele (nunca fica preso)
    if (!livre(J.x, J.z)) {
      outer: for (let r = 0.1; r < 3; r += 0.1) for (let a = 0; a < 6.3; a += 0.4) { const x = J.x + Math.cos(a) * r, z = J.z + Math.sin(a) * r; if (livre(x, z)) { J.x = x; J.z = z; break outer; } }
    }
  };
  async function fala(quem, texto, shot, op) {
    if (shot) camPara(shot);
    const X = S.falantes && S.falantes[quem];
    const ator = X ? X.A : quem === 'jog' ? S.jog : quem === 'prof' ? S.prof : quem === 'joao' ? S.joaoA : quem === 'lucia' ? S.luciaA : quem === 'valentao' ? S.valentaoA : quem === 'oculos' ? S.oculosA : null;
    if (ator) ator.fala = true;
    const voz = X ? X.voz : quem === 'jog' ? S.voz : ({ prof: 1, joao: 3, lucia: 0, valentao: 4, oculos: 2 })[quem];
    await Dialogo.mostrar([texto], { nome: X ? T(X.nome) : quem === 'jog' ? nomeJog() : nm(quem), voz, manter: true });
    if (ator) ator.fala = false;
  }
  async function escolher(titulo, ops) { Dialogo.esconder(); return Escolha.mostrar(titulo, ops); }
  async function aproximar(spot, alvoA) {                              // vai até o ponto fixo de conversa (afastado) e olha para o outro
    const J = S.jog;
    if (Math.hypot(J.x - spot[0], J.z - spot[1]) > 0.2) { camPara('aula'); await irPara(J, spot[0], spot[1], 2.3); }
    olhar(J, alvoA.x, alvoA.z); olhar(alvoA, J.x, J.z); S.parA = J; S.parB = alvoA; await esperar(250);
  }

  // ------------------------------------------------------------------ roteiro
  const perfeito = () => S.acertos === S.quiz.length;
  async function interagir() {
    const a = alvoAtual();
    if (!a || S.modo !== 'livre' || performance.now() < (S.bloq || 0)) return;
    S.modo = 'cena'; UI.ctl.hidden = true;
    try {
      if (a.id === 'cadeira') { await sentarEFazer(); return; }
      if (a.id === 'joao') await conversaJoao(); else if (a.id === 'lucia') await conversaLucia();
      else if (a.id === 'prof') await conversaProf(); else if (a.id === 'porta') { if (S.fase === 'antes') await ondaNaPorta(); else { await saida(); return; } }
      else if (a.id === 'rob') await conversaRob();
      else if (a.id === 'lucia2') await luciaFora(); else if (a.id === 'armario') await abrirArmario();
      else if (a.id === 'joao2') await joaoFora(); else if (a.id === 'rua') { await saidaRua(); return; }
    } catch (e) { console.error(e); }
    Dialogo.esconder(); liberar();
  }
  async function conversaJoao() {
    const Ja = S.joaoA;
    await aproximar(SPOT.joao, Ja);
    if (S.joao) { await fala('joao', T('Não esquece: lá fora, depois da aula!'), 'dupla'); paraFrente(Ja); camPara('aula'); return; }
    await fala('joao', Tf('Ei, {0}! Depois da aula, me encontra lá fora, tá?', nomeJog()), 'dupla');
    const r = await escolher(T('Ei, {0}! Depois da aula, me encontra lá fora, tá?').replace('{0}', nomeJog()), [T('Por quê?'), T('Beleza, combinado!')]);
    S.joao = r === 0 ? 'surpresa' : 'combinado';
    await fala('joao', r === 0 ? T('É surpresa! Só aparece lá, tá bom?') : T('Fechou! Não esquece, hein.'), 'dupla');
    paraFrente(Ja); camPara('aula');
  }
  async function conversaLucia() {
    const La = S.luciaA;
    await aproximar(SPOT.lucia, La);
    if (S.lucia) { await fala('lucia', Tf('Boa atividade, {0}!', nomeJog()), 'dupla'); paraFrente(La); camPara('aula'); return; }
    await fala('jog', Tg('Será que eu perdi muita coisa?'), 'dupla');
    await fala('lucia', T('Nem tanto! Mas se você tiver dificuldade, eu posso te ajudar!'), 'dupla');
    const r = await escolher(T('Nem tanto! Mas se você tiver dificuldade, eu posso te ajudar!'), [T('Acho que vou me sair bem'), T('Vou precisar mesmo')]);
    S.lucia = r === 0 ? 'confiante' : 'precisa';
    await fala('lucia', r === 0 ? T('Que ótimo! Boa sorte!') : T('Pode contar comigo! É só olhar pra mim se travar.'), 'dupla');
    paraFrente(La); camPara('aula');                                    // ela volta a olhar para a frente
  }
  async function conversaProf() {
    await aproximar(SPOT.prof, S.prof);
    if (S.fase === 'antes') await fala('prof', Tf('A atividade já está na sua mesa, {0}. Sente-se e faça.', nomeJog()), 'entrega');
    else {
      S.profFalou2 = true; const humor = perfeito() ? 'Estou muito feliz com você, {0}. Continue assim!' : (S.perfil === 0 ? 'Estou triste, {0}... Esperava mais sinceridade de você.' : 'Estou preocupada com você, {0}. Se precisar de ajuda com álgebra, é só falar.');
      await fala('prof', Tf(humor, nomeJog()), 'entrega');
    }
    S.prof.yawAlvo = -Math.PI / 2; camPara('aula');
  }
  async function ondaNaPorta() {
    olhar(S.prof, S.jog.x, S.jog.z);
    await fala('prof', Tf('Você está tirando uma onda com a minha cara, {0}?!', nomeJog()), 'prof');
    await fala('jog', T('Não, professora... desculpa.'), 'jog');
    await fala('prof', T('Hum. Então sente-se.'), 'prof');
    S.portaTrancada = true; S.prof.yawAlvo = -Math.PI / 2;
    camPara('aula');
  }
  async function brigar() {
    olhar(S.prof, S.jog.x, S.jog.z);
    await fala('prof', Tf('{0}! Você vai ficar passeando pela sala? Sente-se e faça a atividade!', nomeJog()), 'prof');
    S.prof.yawAlvo = -Math.PI / 2;
  }
  async function sentarEFazer() {
    const J = S.jog, cx = COLS[1], dz = LINHAS[1];
    S.sala.seta.visible = false;
    camPara('aula');
    await irPara(J, cx, dz + 1.12, 2.1);
    await andar(J, [[cx, dz + 0.62]], 1.6);
    sentar(J, cx, dz, true); camPara('mesa');
    await esperar(900);
    await prova();
    // entrega: levanta, vai até a professora (desviando das mesas), ela reage
    camPara('aula');
    await irPara(J, SPOT.prof[0], SPOT.prof[1], 2.1);
    olhar(J, PROF.x, PROF.z); olhar(S.prof, J.x, J.z); camPara('entrega'); await esperar(400);
    const txt = S.perfil === 0 ? (perfeito() ? 'Você não estava mentindo mesmo! Parabéns, {0}!' : 'Hum... você disse que era bom, {0}. Está chegando atrasado e mentindo também?')
      : S.perfil === 1 ? (perfeito() ? 'Modesto como sempre, não é?' : 'Bem que você me avisou...')
        : (perfeito() ? 'Você acertou tudo?! Então sabia álgebra, sim... Estou surpresa, {0}.' : 'É, você errou, como era de se esperar por ter chegado atrasado. Depois te passo umas tarefas extras para casa.');
    S.parA = J; S.parB = S.prof;
    await fala('prof', Tgf(txt, nomeJog()), 'entrega'); Dialogo.esconder();
    S.prof.yawAlvo = -Math.PI / 2;
    camPara('aula');
    await irPara(J, cx, dz + 1.12, 2.1);
    await andar(J, [[cx, dz + 0.62]], 1.6);
    sentar(J, cx, dz, true);
    await esperar(600);
    salvarHistoria();
    // algumas horas depois...
    await preto(true, 900); Dialogo.esconder();
    await legenda(T('Algumas horas depois...'), 2200);
    S.fase = 'depois'; S.profFalou2 = false;
    sino(); camPara('aula', true);
    Object.assign(S.seta, { x: PORTA.x, y: 2.4, z: PORTA.z - 0.3 }); S.sala.seta.visible = true;
    await preto(false, 900);
    await fala('prof', T('O sino tocou! Muito bem, turma, estão liberados. Até amanhã!'), 'prof'); Dialogo.esconder();
    camPara('aula');
    UI.missao.textContent = T('Missão: saia da sala.');
    // levantam e saem em fila, desviando das mesas e cadeiras; o jogador já pode andar
    S.saindo = true;
    for (const [i, A] of S.alunos.entries()) {
      esperar(500 + i * 1100).then(async () => {
        A.escreve = false;
        await irPara(A, PORTA.x, PORTA.z - 0.7, 1.7);
        await andar(A, [[PORTA.x, PORTA.z + 1.8]], 1.7);
        A.oculto = true;
      });
    }
    await irPara(J, cx + 1.6, dz + 1.2, 2.0);
    Dialogo.esconder(); liberar();
  }

  async function prova() {
    const resp = [];
    UI.prova.hidden = false; UI.missao.hidden = true;
    for (let i = 0; i < S.quiz.length; i++) {
      const q = S.quiz[i];
      const escolhida = await new Promise((res) => {
        let sel = -1;
        UI.prova.innerHTML = '<div class="papel"><p class="pTit">' + esc1(T('Atividade de álgebra')) + '</p><p class="pNome"><span>' + esc1(Tf('Nome: {0}', nomeJog())) + '</span><span>' + esc1(Tf('Questão {0} de {1}', i + 1, S.quiz.length)) + '</span></p>' +
          '<p class="pQ">' + esc1(T(q.q)) + '</p><div class="pOps">' + q.o.map((o, k) => '<button type="button" class="pxBtn" data-k="' + k + '">' + esc1(o) + '</button>').join('') + '</div>' +
          '<div class="pAcoes"><button type="button" class="pxBtn pxPrim" disabled>' + esc1(T(i === S.quiz.length - 1 ? 'Entregar ✔' : 'Próxima ▶')) + '</button></div></div>';
        UI.prova.onclick = (e) => {
          const b = e.target.closest('button');
          if (!b) return;
          if (typeof Som !== 'undefined' && Som.clique) Som.clique();
          if (b.dataset.k != null) { sel = Number(b.dataset.k); UI.prova.querySelectorAll('.pOps .pxBtn').forEach((x) => x.classList.toggle('on', x === b)); UI.prova.querySelector('.pAcoes .pxBtn').disabled = false; }
          else if (!b.disabled && sel >= 0) res(sel);
        };
      });
      resp.push(escolhida);
    }
    UI.prova.hidden = true; UI.prova.onclick = null; UI.prova.innerHTML = ''; UI.missao.hidden = false;
    S.acertos = resp.reduce((a, r, i) => a + (r === S.quiz[i].c ? 1 : 0), 0);
    return resp;
  }
  const esc1 = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function salvarHistoria() {
    HistoriaSave.gravar('fase1', { perfil: ['bom', 'ruim', 'nao'][S.perfil], acertos: S.acertos, joao: S.joao || null, lucia: S.lucia || null, mariposa: !!S.mariposa, traco: S.traco || null, partida: S.partida1 || null, atributos: PERSONAGEM.atributos || null });            // (4.5.0) mescla com o que as outras fases já guardaram
  }
  function sino() {
    const A = typeof Som !== 'undefined' && Som.audio;
    if (!A || Som.mudo) return;
    const { ctx, mestre } = A;
    for (let k = 0; k < 4; k++) for (const f of [880, 1320]) {
      const o = ctx.createOscillator(), g = ctx.createGain(), t0 = ctx.currentTime + 0.05 + k * 0.32;
      o.type = 'triangle'; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.22, t0 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.9);
      o.connect(g); g.connect(mestre); o.start(t0); o.stop(t0 + 1);
    }
  }
  async function saida() {
    const J = S.jog;
    S.modo = 'cena'; UI.ctl.hidden = true; UI.missao.hidden = true; Dialogo.esconder();
    S.sala.seta.visible = false;
    camPara('saida');
    await irPara(J, PORTA.x, PORTA.z - 1.0, 2.1);                       // vai até a porta (desviando dos móveis)
    Musica.porta(true); S.portaAlvo = -100 * rad; await esperar(800);   // abre
    await andar(J, [[PORTA.x, PORTA.z + 2.4]], 1.9);
    await preto(true, 1100);
    J.oculto = true;
  }

  // ------------------------------------------------------------------ corredor (cenas)
  const pele = (i) => PELES_FITZ[i].cor, corCab = (i) => CORES_CABELO[i].cor;
  const looksAlunos = () => [
    { pele: pele(5), cabelo: corCab(0), estilo: ci('Dreads curtos'), rosto: ri('Sério') },
    { pele: pele(3), cabelo: corCab(2), estilo: ci('Coque longo'), rosto: ri('Sorridente'), labio: 1 },
    { pele: pele(1), cabelo: corCab(4), estilo: ci('Rabo de cavalo'), rosto: ri('Padrão'), labio: 2 },
    { pele: pele(2), cabelo: corCab(0), estilo: ci('Franja'), rosto: ri('Sorridente') },
    { pele: pele(5), cabelo: corCab(0), estilo: ci('Black power'), rosto: ri('Padrão') },
    { pele: pele(1), cabelo: corCab(3), estilo: ci('Longo liso'), rosto: ri('Sorridente'), labio: 0 },
    { pele: pele(2), cabelo: corCab(1), estilo: ci('Moicano'), rosto: ri('Sonolento') },
  ];
  function descartar(g) {
    scene.remove(g);
    g.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material && o.material !== MAT_CORES) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); } });
  }
  async function corredor() {
    const J = S.jog;
    UI.missao.hidden = true; UI.ctl.hidden = true; Dialogo.esconder();
    for (const A of S.elenco) if (A !== J) { ATLETAS.delete(A.m); if (A.m.raiz.parent) A.m.raiz.parent.remove(A.m.raiz); }
    S.elenco = [J];
    descartar(S.sala.g);
    const cor = montarCorredor(); S.sala = cor; cor.g.add(J.m.raiz);
    S.lugar = 'corredor'; S.fase = 'corredor'; S.cirs = []; S.portaAng = 0; S.portaAlvo = 0; S.kAng = 100 * rad; S.kAlvo = 100 * rad; S.vAng = 0; S.vAlvo = 0; S.fAng = 0; S.fAlvo = 0;
    S.trancado = false; S.joaoSaiu = false; S.cenaFeita = false; S.luciaFalou = false;
    const lk = looksAlunos();
    const npc = (look, x, z, yaw, extra) => { const A = criar(cor, look); A.x = x; A.z = z; A.yaw = A.yawAlvo = yaw; A.bloq = true; return Object.assign(A, extra || {}); };
    npc(lk[0], -2.65, 8.2, 0, { conv: 0 }); npc(lk[2], -1.45, 8.2, Math.PI, { conv: 2.2 });          // (4.3.7) duplas conversando, afastadas 1,2 m (antes se misturavam)
    npc(lk[4], 2.65, 0.5, Math.PI, { conv: 1 }); npc(lk[5], 1.45, 0.5, 0, { conv: 3.4 });
    npc(lk[1], -2.65, -2.3, 0, { conv: 0.6 }); npc(lk[6], -1.45, -2.3, Math.PI, { conv: 2.9 });
    S.luciaA = npc({ pele: pele(1), cabelo: corCab(4), estilo: ci('Rabo de cavalo'), rosto: ri('Padrão'), labio: 2 }, 1.9, 4.6, -Math.PI / 2);
    S.joaoA = npc({ pele: pele(2), cabelo: corCab(0), estilo: ci('Franja'), rosto: ri('Sorridente') }, 0, -11.6, -Math.PI / 2);
    S.oculosA = npc({ pele: pele(3), cabelo: corCab(1), estilo: ci('Franja'), rosto: ri('Padrão'), camisa: '#e8d070', listra: '#e8d070' }, FX + 0.55, ZK, Math.PI, { conv: 1.7 }); oculos(S.oculosA);
    S.valentaoA = npc({ pele: pele(2), cabelo: corCab(0), estilo: ci('Moicano'), rosto: ri('Sério'), camisa: '#2a2a30', listra: '#2a2a30', gola: '#c8202a', cabecao: 1.15, escala: 0.92 }, CX + 0.25, -9.4, Math.PI, { oculto: true, bloq: false });
    // saindo da sala (porta da esquerda)
    J.oculto = true; J.sentado = false; J.x = -CX - 0.75; J.z = 11.0; J.yaw = J.yawAlvo = 0; J.rota = null;   // (4.4.2) começa ATRÁS da porta (dentro da sala), escondido: só aparece depois que ela abre
    S.seta = { x: 0, y: 2.5, z: -11.6 };
    camPara('cor_ini', true);
    await preto(false, 1000);
    Musica.porta(true); S.portaAlvo = -100 * rad; await esperar(700);
    J.oculto = false;
    await andar(J, [[-CX + 0.3, 11.0], [-1.8, 10.3]], 1.6);
    S.portaAlvo = 0; Musica.porta(false);
    UI.missao.textContent = T('Missão: encontre o João no fim do corredor.'); UI.missao.hidden = false;
    liberar();
  }
  async function cenaBuli() {                                          // um valentão tranca o menino de óculos no armário
    const J = S.jog, B = S.valentaoA, K = S.oculosA;
    S.seta.y = -9;
    camPara('cor_buli');
    B.oculto = false; Musica.porta(true); S.vAlvo = 100 * rad; await esperar(600);
    const pEnt = andar(B, [[CX - 1.2, -8.6], [FX + 1.4, -7.5]], 1.9); await esperar(1000); S.vAlvo = 0; await pEnt;
    olhar(K, B.x, B.z); olhar(B, K.x, K.z); K.bloq = false; await esperar(300);
    await fala('oculos', T('E-ei! O que você vai fazer...?'), 'cor_buli'); Dialogo.esconder();
    olhar(B, -CX, ZK);
    const p1 = andar(K, [[FX + 0.1, ZK], [FX - 0.25, ZK]], 1.3), p2 = andar(B, [[FX + 0.7, ZK]], 1.3);          // ele é empurrado para dentro do armário
    await esperar(900); K.oculto = true; await p1; await p2;
    S.kAlvo = 0; Musica.porta(false); await esperar(900);
    await fala('valentao', T('Há há há há!'), 'cor_buli'); Dialogo.esconder();
    olhar(B, J.x, J.z); await esperar(500);
    await andar(B, [[0.4, -8.6], [CX - 1.0, -9.4]], 1.9);
    S.vAlvo = 100 * rad; Musica.porta(true); await esperar(500);
    await andar(B, [[CX + 0.25, -9.4]], 1.7);
    B.oculto = true; S.vAlvo = 0; Musica.porta(false);
    S.trancado = true; K.bloq = false;
    S.seta = { x: 0, y: 2.5, z: -11.6 };
  }
  async function abrirArmario() {
    const J = S.jog, K = S.oculosA;
    await andar(J, [[FX + 1.55, ZK]], 2.1); olhar(J, -CX, ZK); await esperar(200);
    S.kAlvo = 100 * rad; Musica.porta(true); await esperar(800);
    K.oculto = false; K.x = FX - 0.25; K.z = ZK; K.yaw = K.yawAlvo = 0;
    await andar(K, [[FX + 0.8, ZK]], 1.2);
    olhar(K, J.x, J.z); S.parA = J; S.parB = K;
    await fala('oculos', T('Muito obrigado por me tirar daí!'), 'dupla');
    await fala('jog', T('Por nada.'), 'dupla'); Dialogo.esconder();
    S.trancado = false; S.salvouOculos = true; salvarHistoria();
    S.kAlvo = 0;
    camPara('aula');
    await andar(K, [[FX + 1.8, ZK + 1.2], [0.2, -1.0]], 1.8);
    K.oculto = true;
  }
  async function luciaFora() {
    const J = S.jog, La = S.luciaA;
    await aproximar([La.x - 1.25, La.z], La);
    if (S.luciaFalou) { await fala('lucia', T('Vai lá, o João está esperando!'), 'dupla'); paraFrente(La); La.yawAlvo = -Math.PI / 2; return; }
    S.luciaFalou = true;
    if (perfeito()) {
      const fraseImp = Tgf('{0}! Eu fiquei impressionada! Chegar atrasado e ainda acertar tudo... achei muito descolado!', nomeJog());
      await fala('lucia', fraseImp, 'dupla');
      const r = await escolher(fraseImp, [T('Eu acertei no chute'), Tg('Fico feliz que você tenha gostado'), T('Ainda bem que estudei')]);
      if (r === 1) {
        await mariposa();
        await fala('lucia', T('A-ah... é... o João está esperando a gente no final do corredor.'), 'dupla');
        S.mariposa = true; salvarHistoria();
      } else await fala('lucia', r === 0 ? T('Hm, sei... no chute, é? Tá bom, então!') : T('Que bom! Continue assim!'), 'dupla');
    } else await fala('lucia', Tf('Ei, {0}! O João está esperando a gente no final do corredor.', nomeJog()), 'dupla');
    La.yawAlvo = -Math.PI / 2;
  }
  async function mariposa() {                                          // a mariposa pixelada: "alguém vai se lembrar de algo"
    Dialogo.esconder();
    // (4.4.2) o texto explicativo só aparece na PRIMEIRA vez que a mariposa surge; nas outras vezes só a mariposa
    const primeira = !PERSONAGEM.mothTexto; PERSONAGEM.mothTexto = true;
    const pTxt = UI.moth.querySelector('p');
    pTxt.textContent = primeira ? T('Quando a mariposa aparece, é porque alguém vai se lembrar de algo...') : '';
    pTxt.style.display = primeira ? '' : 'none';
    UI.moth.classList.add('on'); await esperar(primeira ? 5200 : 2600); UI.moth.classList.remove('on'); await esperar(900);
  }
  async function joaoFora() {
    const J = S.jog, Jo = S.joaoA;
    await aproximar([0, -10.2], Jo);
    const txt = S.joao ? 'Ei, {0}! Agora eu vou te contar o que era! Vem, me segue até a quadra!' : 'Ei, {0}! Eu estava te esperando pra te mostrar uma coisa! Vem, me segue até a quadra!';
    await fala('joao', Tf(txt, nomeJog()), 'dupla'); Dialogo.esconder();
    Jo.bloq = false; camPara('cor_fim');
    Musica.porta(true); S.fAlvo = 95 * rad; await esperar(500); await andar(Jo, [[0, -CL - 1.3]], 1.9); Jo.oculto = true; S.fAlvo = 0; Musica.porta(false); await esperar(700);
    S.joaoSaiu = true; S.seta = { x: 0, y: 2.7, z: -CL + 0.6 };
    UI.missao.textContent = T('Missão: siga o João para fora da escola.');
  }
  async function saidaRua() {
    const J = S.jog;
    S.modo = 'cena'; UI.ctl.hidden = true; UI.missao.hidden = true; Dialogo.esconder(); S.seta.y = -9;
    camPara('cor_fim');
    S.fAlvo = 95 * rad; Musica.porta(true);
    await andar(J, [[0, -CL + 0.8]], 2.0); await esperar(300);
    await andar(J, [[0, -CL - 1.2]], 1.9);
    await preto(true, 1100);
    S.fim();
  }

  // ------------------------------------------------------------------ pátio e quadra (4.3.6)
  // (4.4.0) A quadra do pátio é a MESMA do jogo (construirQuadraFutsal): as medidas vêm do campo 'futsal'.
  const QX = CAMPOS.futsal.comprimento / 2, QH = CAMPOS.futsal.largura / 2, QB = CAMPOS.futsal.folga, QZ = -30, PORTAO = 1.2;   // meio comprimento, meia largura, folga até a grade, centro (z) e meia largura do portão
  const Z_PORTAO = QZ + QH + QB;                                        // z da grade do lado da escola (onde fica o portão)
  const PAT_Z0 = 8.2;                                                   // parede da escola (fachada)
  const ARV_PROF = { x: -8.5, z: -9.0 };                                // a árvore onde o Professor Roberto vigia a turma
  const ARVORES_PATIO = [[-15, 2], [15, -5], [-17, -10], [17, 4], [ARV_PROF.x, ARV_PROF.z]];   // (4.4.2) todas as árvores têm tronco sólido
  function texConcreto() { return drawTexture(32, 32, (g, w, h) => { g.fillStyle = '#b9b6ae'; g.fillRect(0, 0, w, h); g.fillStyle = '#a8a59d'; g.fillRect(0, 0, w, 1); g.fillRect(0, 0, 1, h); g.fillStyle = '#c4c1b9'; g.fillRect(5, 7, 3, 2); g.fillRect(21, 19, 4, 2); }); }
  function texPlaca() { return drawTexture(256, 32, (g, w, h) => { g.fillStyle = '#1f4f8f'; g.fillRect(0, 0, w, h); g.fillStyle = '#f2c230'; g.fillRect(0, 0, w, 3); g.fillRect(0, h - 3, w, 3); g.fillStyle = '#fff0c8'; g.font = 'bold 16px monospace'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('ESCOLA SANTA MARIA', w / 2, h / 2 + 1); }); }
  function texBola() {
    return drawTexture(64, 32, (g, w, h) => {
      g.fillStyle = '#f4f4f0'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#1d3f8f';
      for (let i = 0; i < 6; i++) { const x = 5 + i * 11; g.fillRect(x, 6, 6, 6); g.fillRect(x + 5, 20, 6, 6); }
      g.fillStyle = '#e0762a'; g.fillRect(0, 14, w, 2);
    });
  }
  function fazBola() { return new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 8), new THREE.MeshLambertMaterial({ map: texBola() })); }
  function montarPatio() {
    const g = new THREE.Group(); g.position.set(OX, 0, 0);
    const basic = (m) => new THREE.MeshBasicMaterial(m);
    const chao = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), basic({ color: 0xa6a39b })); chao.rotation.x = -Math.PI / 2; chao.position.y = -0.04; g.add(chao);   // (4.4.2) fora do pátio o chão tem a cor do concreto (antes era preto)
    const tc = texConcreto(); tc.wrapS = tc.wrapT = THREE.RepeatWrapping; tc.repeat.set(48 / 1.6, 26 / 1.6);
    const pat = new THREE.Mesh(new THREE.PlaneGeometry(48, 26), basic({ map: tc })); pat.rotation.x = -Math.PI / 2; pat.position.set(0, 0, -4.8); g.add(pat);
    const L = new Lote(), F = (w, h, d, c, x, y, z) => L.caixa(w, h, d, c, x, y, z);
    const ocl = [];                                                    // (4.4.2) peças que ficam translúcidas quando tapam a câmera: { box, mats }
    const LF = new Lote(), FF = (w, h, d, c, x, y, z) => LF.caixa(w, h, d, c, x, y, z);
    // fachada da escola
    FF(48, 5.2, 0.4, 0xefe3b5, 0, 2.6, PAT_Z0); FF(48, 0.5, 1.2, 0xb3262e, 0, 5.3, PAT_Z0 - 0.3); FF(48, 0.5, 0.2, 0x8a7a50, 0, 0.25, PAT_Z0 - 0.25);
    for (const x of [-18, -12, -6, 6, 12, 18]) { FF(2.4, 1.5, 0.08, 0x3a5a7a, x, 2.9, PAT_Z0 - 0.22); FF(2.6, 0.12, 0.14, 0x8a7a50, x, 2.1, PAT_Z0 - 0.25); }
    FF(2.0, 2.3, 0.1, 0x2b1d10, 0, 1.15, PAT_Z0 - 0.22); FF(2.3, 0.2, 0.16, 0x4a2c16, 0, 2.4, PAT_Z0 - 0.24); FF(0.2, 2.4, 0.16, 0x4a2c16, -1.1, 1.2, PAT_Z0 - 0.24); FF(0.2, 2.4, 0.16, 0x4a2c16, 1.1, 1.2, PAT_Z0 - 0.24);
    FF(4.6, 0.12, 2.0, 0xc9c2a8, 0, 2.55, PAT_Z0 - 1.1);                                              // marquise sobre a porta
    // árvores, banco e mastro
    for (const [x, z] of ARVORES_PATIO) {
      const LT = new Lote(); LT.caixa(0.5, 3.0, 0.5, 0x5a3a22, x, 1.5, z); LT.caixa(3.2, 2.6, 3.2, 0x2f6b2a, x, 4.1, z); LT.caixa(2.2, 1.6, 2.2, 0x3d7a31, x, 5.8, z);
      const mt = MAT_CORES.clone(); g.add(LT.malha(mt)); ocl.push({ box: new THREE.Box3(new THREE.Vector3(x - 1.7, 0, z - 1.7), new THREE.Vector3(x + 1.7, 6.7, z + 1.7)), mats: [mt] });
    }
    for (const x of [-9, 9]) { F(2.2, 0.1, 0.55, 0x8a5a2b, x, 0.5, 5.6); F(2.2, 0.5, 0.1, 0x8a5a2b, x, 0.85, 5.9); F(0.12, 0.5, 0.5, 0x3a3a40, x - 0.9, 0.25, 5.6); F(0.12, 0.5, 0.5, 0x3a3a40, x + 0.9, 0.25, 5.6); }
    F(0.12, 6.0, 0.12, 0xd0d0cc, 8, 3, 3.0); F(1.4, 0.9, 0.04, 0x1f9e3b, 8.75, 5.4, 3.0); F(0.5, 0.5, 0.05, 0xf2c230, 8.75, 5.4, 3.0);
    // a quadra de futsal ao fundo: A MESMA do jogo (mesmo piso, mureta, tela, traves e redes), só com a abertura do portão
    const quadra = construirQuadraFutsal({ portao: PORTAO }); quadra.position.set(0, 0.012, QZ); g.add(quadra);
    g.add(L.malha(MAT_CORES));
    const mf = MAT_CORES.clone(); g.add(LF.malha(mf));
    const placa = new THREE.Mesh(new THREE.PlaneGeometry(8, 1), basic({ map: texPlaca() })); placa.position.set(0, 3.9, PAT_Z0 - 0.23); g.add(placa);
    ocl.push({ box: new THREE.Box3(new THREE.Vector3(-24, 0, PAT_Z0 - 1.4), new THREE.Vector3(24, 5.8, PAT_Z0 + 0.3)), mats: [mf, placa.material] });
    const seta = fazSeta(); seta.visible = false; g.add(seta);
    const bola = fazBola(); bola.visible = false; g.add(bola);
    scene.add(g);
    return { g, pivo: new THREE.Group(), pivoK: null, seta, bola, ocl };
  }

  // ------------------------------------------------------------------ cenas da quadra (4.3.6)
  function vestir(A, uni) {                                              // troca a roupa do boneco (refaz o modelo com o uniforme)
    const velho = A.m, pai = velho.raiz.parent;
    const m = makeAthlete(Object.assign({}, A.opt, { camisa: uni.camisa, listra: uni.listra, gola: uni.gola, calcao: uni.calcao, meia: uni.meia, sola: uni.sola }));
    m.etiqueta.visible = false;
    if (pai) { pai.add(m.raiz); pai.remove(velho.raiz); }
    ATLETAS.delete(velho); A.m = m; A.mats = null; A.alfa = 1;
  }
  function tirarElenco(manter) {
    for (const A of S.elenco) if (!manter.includes(A)) { ATLETAS.delete(A.m); if (A.m.raiz.parent) A.m.raiz.parent.remove(A.m.raiz); }
    S.elenco = S.elenco.filter((A) => manter.includes(A));
  }
  async function esperarPerto(Jo, dist, parar) {                         // espera você chegar perto do João. Com 'parar', desiste (e devolve false) quando ela ficar verdadeira
    while (Math.hypot(S.jog.x - Jo.x, S.jog.z - Jo.z) > dist) { if (parar && parar()) return false; await esperar(120); }
    return true;
  }
  function sairParaPartida() {                                           // entrega a tela ao jogo de verdade (a cena fica guardada, escondida)
    Musica.parar();
    GANCHO_RENDER = null; camera.clearViewOffset();
    S.sala.g.visible = false;
    restaurarMundo();
    document.body.classList.remove('criadorAberto');
    UI.missao.hidden = true; UI.ctl.hidden = true; Dialogo.esconder();
  }
  function voltarDaPartida() {                                           // a cena volta (o jogo fica escondido atrás)
    escurecerMundo();
    S.sala.g.visible = true;
    document.body.classList.add('criadorAberto');
    GANCHO_RENDER = gancho; S.camSnap = true;
    $('pauseScreen').hidden = true; $('endScreen').hidden = true;
  }
  function sairDaPartidaSeguro() {                                      // algo deu errado no meio: volta para a cena e segue para o fim
    Historia.abortar();
    try { if (GANCHO_RENDER !== gancho) voltarDaPartida(); } catch (e) { console.error(e); }
    UI.preto.hidden = false; UI.preto.classList.remove('claro');
  }
  // ---- gente no pátio (4.4.0): alunos conversando e, debaixo da árvore, o Professor Roberto com a turma que vai jogar depois
  const GRUPOS_PATIO = [                                                 // [figurante, x, z] — quem está no mesmo grupo olha para o meio dele
    [[0, -6.4, 2.4], [1, -5.0, 2.9]],
    [[2, 6.0, -1.0], [3, 7.4, -0.4], [4, 6.7, -2.3]],
    [[5, -4.6, -12.2], [6, -3.2, -11.7], [7, -3.9, -13.3]],
  ];
  function criarGentePatio() {
    const pat = S.sala, uns = HIST.figurantes;
    const cor = (o) => Object.assign({}, o);
    let n = 0; S.gente = [];
    for (const grupo of GRUPOS_PATIO) {
      const cx = grupo.reduce((a, g) => a + g[1], 0) / grupo.length, cz = grupo.reduce((a, g) => a + g[2], 0) / grupo.length;
      for (const [i, x, z] of grupo) {
        const A = criar(pat, cor(uns[i])); A.x = x; A.z = z; olhar(A, cx, cz); A.yaw = A.yawAlvo; A.bloq = true; A.conv = n++; S.gente.push(A);
      }
    }
    // a turma debaixo da árvore: em volta do tronco, conversando (as mesmas crianças da partida; trocam a roupa na hora de jogar)
    // (4.4.2) a turma do Roberto: dois sentados no chão (de costas para o tronco), dois conversando e dois aquecendo (pulinhos e braços girando)
    const volta = [['tadeu', -1.1, 0.9, 'chao'], ['duda', 0.7, 1.2, 'chao'], ['cadu', -2.2, -0.2, 'conv'], ['bia', -1.5, -1.2, 'conv'], ['nando', 1.3, -1.6, 'aquece'], ['leo', 2.5, -2.3, 'aquece']];
    for (const [id, dx, dz, modo] of volta) {
      const A = criar(pat, cor(HIST[id])); A.x = ARV_PROF.x + dx; A.z = ARV_PROF.z + dz; A.bloq = true; A.conv = n++; S.gente.push(A);
      A.modoTurma = modo; A.fase = n * 1.7;
      if (modo === 'chao') { A.chao = true; olhar(A, ARV_PROF.x + dx * 2.5, ARV_PROF.z + dz * 2.5); A.conv = null; }
      else if (modo === 'aquece') { A.aquece = true; olhar(A, ARV_PROF.x + 3, ARV_PROF.z - 5); A.conv = null; }
      A.yaw = A.yawAlvo;
      S.falantes[id] = { A, nome: HIST[id].nome, voz: ({ cadu: 4, bia: 0, tadeu: 4, duda: 0, nando: 2, leo: 2 })[id] };
    }
    { const c = S.falantes.cadu.A, b = S.falantes.bia.A; olhar(c, b.x, b.z); c.yaw = c.yawAlvo; olhar(b, c.x, c.z); b.yaw = b.yawAlvo; }
    const rob = criar(pat, cor(HIST.professor)); rob.x = ARV_PROF.x + 2.6; rob.z = ARV_PROF.z + 0.2; olhar(rob, ARV_PROF.x, ARV_PROF.z); rob.yaw = rob.yawAlvo; rob.bloq = true;
    rob.yawVigia = rob.yaw; S.gente.push(rob);
    S.falantes.rob = { A: rob, nome: 'Professor Roberto', voz: 1 };
  }
  async function conversaRob() {                                         // o professor vigiando a turma (opcional, enquanto o João não sai)
    const J = S.jog, R = S.falantes.rob.A;
    const dx = J.x - R.x, dz = J.z - R.z, d = Math.hypot(dx, dz) || 1;
    if (d > 1.7) { camPara('aula'); await andar(J, [[R.x + dx / d * 1.5, R.z + dz / d * 1.5]], 2.3); }
    olhar(J, R.x, R.z); olhar(R, J.x, J.z); S.parA = J; S.parB = R; await esperar(250);
    if (!S.falouRob) {
      S.falouRob = true;
      await fala('rob', Tf('Olá, {0}! Estou de olho na minha turma até os pais virem buscar.', nomeJog()), 'dupla');
      await fala('rob', T('Eles adoram uma bola, mas comigo ninguém sai do meu campo de visão!'), 'dupla');
    } else await fala('rob', T('Os pais já já chegam. Por enquanto, eu fico de olho na turma.'), 'dupla');
    R.yawAlvo = R.yawVigia; camPara('aula');
  }
  async function cenaFurou() {                                           // você entrou na quadra antes do João
    const J = S.jog, Jo = S.joaoA;
    S.modo = 'cena'; UI.ctl.hidden = true; UI.missao.hidden = true; J.livreAndando = false; J.rota = null; Dialogo.esconder();
    olhar(J, Jo.x, Jo.z);
    await andar(Jo, [[Math.max(-0.8, Math.min(0.8, J.x + 0.7)), J.z + 1.2]], 3.4);          // o João corre até você
    olhar(Jo, J.x, J.z); olhar(J, Jo.x, Jo.z); S.parA = J; S.parB = Jo;
    await fala('joao', Tg('Eita, eu nem vi você passando para a quadra...'), 'dupla');
    await fala('jog', T('Você está lento demais, João!'), 'dupla');
  }
  async function parteQuadra() {
    const J = S.jog;
    UI.missao.hidden = true; UI.ctl.hidden = true; Dialogo.esconder();
    tirarElenco([J]);
    descartar(S.sala.g);
    const pat = montarPatio(); S.sala = pat; pat.g.add(J.m.raiz);
    scene.background = new THREE.Color(0x8cc4ee);                        // (4.4.0) lá fora o céu é azul (dentro da escola o fundo é preto)
    S.lugar = 'patio'; S.fase = 'patio'; S.cirs = []; S.portaAng = 0; S.portaAlvo = 0; S.modo = 'cena'; S.convite = false;
    S.bolaDono = null; S.bolaAlt = 0.75; S.falantes = {};
    const Jo = criar(pat, Object.assign({}, HIST.joao)); Jo.x = 1.2; Jo.z = -3.4; Jo.yaw = Jo.yawAlvo = -Math.PI / 2; Jo.bloq = true; S.joaoA = Jo;
    Jo.segura = { th: 1.15, ph: 0.16, alvoTh: 1.15 };                     // (4.4.0) segura a bola com as duas mãos, na frente do corpo
    criarGentePatio();
    J.x = 0; J.z = PAT_Z0 - 0.6; J.yaw = J.yawAlvo = Math.PI / 2; J.rota = null; J.oculto = false; J.sentado = false;
    camPara('pat_porta', true);
    await preto(false, 1100);
    await esperar(400);
    await andar(J, [[0, 4.4]], 1.7);
    S.parA = J; S.parB = Jo;
    await andar(J, [[0, 0.2]], 1.9); olhar(J, Jo.x, Jo.z); olhar(Jo, J.x, J.z);
    await fala('joao', Tf('{0}! Era isso que eu queria te mostrar!', nomeJog()), 'dupla');
    S.bolaDono = Jo; pat.bola.visible = true; Musica.porta(false);
    Jo.segura.alvoTh = 2.85;                                              // (4.4.0) levanta a bola acima da cabeça (ela fica nas mãos)...
    await fala('joao', T('Olha só: uma bola de futsal! Novinha em folha!'), 'pat_bola');
    Jo.segura.alvoTh = 1.15;                                              // ...e depois abaixa
    await fala('joao', T('Vem, vamos para a quadra!'), 'dupla');
    await fala('jog', T('João... eu nunca joguei futebol.'), 'dupla');
    await fala('joao', T('Sério? Mas é fácil! Não tem problema nenhum, eu te ensino!'), 'dupla');
    Dialogo.esconder();
    // o João vai na frente; a gente vai atrás. Dá para conversar com o Professor Roberto no caminho — e, se você cortar caminho e entrar
    // na quadra antes do João, ele fica sem graça (cena do "nem vi você passando").
    Jo.bloq = false;
    UI.missao.textContent = T('Missão: siga o João até a quadra.'); UI.missao.hidden = false;
    liberar();
    const furou = () => S.jog.z < Z_PORTAO - 0.2 && Jo.z > Z_PORTAO + 1.0 && S.modo === 'livre';
    let cortou = false;
    for (const [px, pz] of [[0, -6], [0, -12], [0, -19.5], [0, -26]]) {
      if (!(await esperarPerto(Jo, 3.2, furou))) { cortou = true; break; }
      if (!(await andarAte(Jo, [px, pz], 2.1, furou))) { cortou = true; break; }
    }
    if (cortou) { await cenaFurou(); }
    else {
      while (S.modo !== 'livre') await esperar(150);                       // se estiver conversando com o professor, espera acabar
      await esperarPerto(Jo, 3.0);
      S.modo = 'cena'; UI.ctl.hidden = true; UI.missao.hidden = true;
      olhar(Jo, S.jog.x, S.jog.z); S.parA = S.jog; S.parB = Jo;
    }
    S.modo = 'cena'; UI.ctl.hidden = true; UI.missao.hidden = true; S.convite = true;
    await fala('joao', T('É aqui! Primeiro o básico, depois a gente joga de verdade.'), 'dupla');
    Dialogo.esconder();
    await preto(true, 1000);
    // ---- o treino (tutorial) no motor do jogo. A tela só clareia quando a quadra de futsal já foi montada (aoPronto)
    sairParaPartida();
    await Historia.treino({ aoPronto: () => preto(false, 900) });
    await preto(true, 900);
    voltarDaPartida();
    await parteConvite();
  }
  async function parteConvite() {
    const J = S.jog, Jo = S.joaoA, pat = S.sala;
    S.modo = 'cena'; S.lugar = 'patio'; S.bolaDono = Jo;
    vestir(J, HIST.uni0); vestir(Jo, HIST.uni0);
    J.x = -3.0; J.z = -27.5; Jo.x = -1.2; Jo.z = -27.0; J.yaw = J.yawAlvo = Jo.yaw = Jo.yawAlvo = -Math.PI / 2; J.rota = Jo.rota = null; Jo.bloq = true;
    S.bolaAlt = 0.75;
    // (4.4.0) as crianças (e o professor) já estavam no pátio, debaixo da árvore: agora vestem os uniformes e vêm para a quadra pelo portão
    const unis = { cadu: HIST.uni0, bia: HIST.uni0, tadeu: HIST.uni1, duda: HIST.uni1, nando: HIST.uni1, leo: HIST.uni1 };
    const ids = ['cadu', 'bia', 'tadeu', 'duda', 'nando', 'leo'];
    for (const id of ids) vestir(S.falantes[id].A, unis[id]);
    const kids = ids.map((id) => S.falantes[id].A), rob = S.falantes.rob.A;
    for (const A of kids.concat([rob])) { A.conv = null; A.rota = null; A.chao = A.aquece = false; }
    camPara('qd_ini', true);
    await preto(false, 1000);
    await esperar(500);
    // chegam pelo portão
    const destinos = [[-4.5, -22.0], [-2.6, -23.6], [0.2, -22.4], [2.4, -23.6], [4.4, -22.2], [6.2, -24.0]];
    const entrada = Z_PORTAO + 3.0, dentro = Z_PORTAO - 2.6;
    await Promise.all(kids.map((k, i) => andar(k, [[(i - 2.5) * 0.25, entrada], [(i - 2.5) * 0.25, dentro], destinos[i]], 3.0)).concat([andar(rob, [[0, entrada], [0, dentro], [0.4, -21.0]], 2.4)]));
    for (const k of kids) olhar(k, Jo.x, Jo.z); olhar(rob, Jo.x, Jo.z); olhar(Jo, kids[0].x, kids[0].z); olhar(J, kids[0].x, kids[0].z);
    camPara('qd_geral');
    await fala('cadu', T('E aí, João! Vocês querem jogar um quatro contra quatro com a gente?'), 'qd_geral');
    await fala('bia', T('A gente tá em seis. Com vocês dois, fecha certinho!'), 'qd_geral');
    olhar(Jo, J.x, J.z);
    await fala('joao', Tf('Claro que a gente quer! Eu e {0} ficamos juntos. Cadu e Bia, vocês vêm com a gente?', nomeJog()), 'qd_geral');
    await fala('cadu', T('Fechou! Bora!'), 'qd_geral');
    olhar(J, Jo.x, Jo.z); S.parA = J; S.parB = Jo;
    await fala('jog', T('João... eu nunca joguei uma partida de verdade.'), 'dupla');
    await fala('joao', T('Eu sei. Mas eu confio em você!'), 'dupla');
    await fala('rob', T('Eu apito o jogo! Quero jogo limpo, pessoal!'), 'qd_geral');
    // (4.4.2) antes de jogar: em que posição você quer atuar? (a mariposa aparece quando você escolhe)
    olhar(Jo, J.x, J.z); olhar(J, Jo.x, Jo.z); S.parA = J; S.parB = Jo;
    await fala('joao', T('Antes de começar: em qual posição você quer jogar?'), 'dupla');
    const posR = await escolher(T('Em qual posição você quer jogar?'), [Tg('Zagueiro: defender o nosso gol'), T('Meia: armar o jogo'), T('Atacante: fazer gols')]);
    PERSONAGEM.posicaoHist = ['DEF', 'MID', 'FWD'][posR] || 'FWD';
    Dialogo.esconder();
    await mariposa();
    await fala('joao', [T('Boa! Você fica lá atrás, protegendo o nosso gol.'), T('Boa! Você fica no meio, distribuindo o jogo.'), T('Boa! Você fica lá na frente, atrás do gol deles.')][posR] || '', 'dupla');
    Dialogo.esconder();
    await preto(true, 900);
    sairParaPartida();
    // (4.4.3) Resultado ruim (derrota/empate sem jogar bem, ou expulsão): antes do João, oferece refazer a partida assistindo a um anúncio.
    //   A partida descartada NÃO deixa nada registrado (Historia.descartarResultado) e só a que valer é confirmada (confirmarResultado).
    let r, tentativas = 0;
    for (;;) {
      r = await Historia.partida({ aoPronto: () => preto(false, 900) });
      await preto(true, 1000);
      voltarDaPartida();
      if (!resultadoRuim(r)) break;
      const escolha = await Anuncios.oferta({ segundos: 6 });
      if (escolha !== 'ver') break;                                   // pulou (ou a contagem acabou): a história segue com este resultado
      const ganhou = await Anuncios.assistir();
      if (!ganhou) break;                                             // fechou o anúncio antes do fim: sem nova tentativa
      Historia.descartarResultado();                                  // joga fora tudo da partida anterior
      tentativas++;
      sairParaPartida();
    }
    Historia.confirmarResultado();
    S.partida1 = { placar: r.placar, venceu: r.venceu, empate: r.empate, expulso: !!r.expulso, gols: r.gols, tentativas };
    await cenaFinal(r);
  }
  const resultadoRuim = (r) => !!r.expulso || (!r.venceu && !r.bom);       // derrota ou empate sem jogar bem, ou vermelho
  async function cenaFinal(r) {
    const J = S.jog, Jo = S.joaoA;
    tirarElenco([J, Jo]);
    vestir(J, HIST.uni0);
    J.x = -2.4; J.z = -27.4; Jo.x = -0.6; Jo.z = -27.0; J.rota = Jo.rota = null; olhar(J, Jo.x, Jo.z); olhar(Jo, J.x, J.z); J.yaw = J.yawAlvo; Jo.yaw = Jo.yawAlvo;
    S.falantes = {}; S.parA = J; S.parB = Jo; S.bolaDono = Jo; S.modo = 'cena';
    const traco = r.bom ? 'talento' : 'forca';
    S.traco = traco;
    PERSONAGEM.atributos = Atributos.iniciante();
    salvarHistoria();
    camPara('dupla', true);
    await preto(false, 1000);
    await esperar(400);
    if (r.expulso) {                                                  // (4.4.3) levou o vermelho: o João fica desapontado
      await fala('joao', Tg('Você foi expulso?! Logo na primeira partida...'), 'dupla');
      await fala('joao', T('Se não sabe jogar, podia ao menos não bater nos outros!'), 'dupla');
      await fala('jog', T('Desculpa, João... eu não queria machucar ninguém.'), 'dupla');
      await fala('joao', T('Tá... mas da próxima vez joga limpo, tá? Eu te ajudo a treinar.'), 'dupla');
    } else if (r.bom && r.venceu) {
      await fala('joao', Tf('{0}! Você disse que nunca tinha jogado?! Que jogo foi esse? Eu fiquei impressionado!', nomeJog()), 'dupla');
      await fala('joao', T('Ganhamos, e muito por sua causa!'), 'dupla');
      await fala('jog', T('Sério? Eu nem sei como aconteceu... mas foi muito legal jogar com você, João!'), 'dupla');   // (4.4.3) resposta ao João (não é mais fala do futuro)
    } else if (r.bom) {
      await fala('joao', r.empate ? T('Empatamos... mas olha só como você jogou! Fiquei impressionado!') : T('Poxa, a gente perdeu... fiquei triste. Mas olha só como você jogou! Fiquei impressionado!'), 'dupla');
      await fala('jog', Tg('Obrigado, João... Perdemos, mesmo assim.'), 'dupla');
    } else if (r.venceu) {
      await fala('joao', T('Hahaha! A gente ganhou, mas você até tentou estragar o jogo, hein? Ganhamos mesmo assim!'), 'dupla');
      await fala('jog', Tg('Desculpa, João... eu errei bastante.'), 'dupla');
      await fala('joao', Tg('Relaxa! Vai ser só treinar mais um pouco.'), 'dupla');
    } else {
      await fala('joao', r.empate ? T('Empatamos... eu esperava um pouco mais de você.') : T('A gente perdeu... e eu esperava mais de você. Fiquei meio decepcionado.'), 'dupla');
      await fala('jog', T('Eu falei que nunca tinha jogado...'), 'dupla');
      await fala('joao', T('Tudo bem. Eu te ajudo a treinar!'), 'dupla');
    }
    Dialogo.esconder();
    await esperar(300);
    // o traço da história
    await tracoBanner(traco);
    // (4.4.3) a mariposa (alguém vai se lembrar de algo), um fade para o preto e a voz do personagem lembrando do primeiro contato
    await mariposa();
    await preto(true, 1400);
    const dlg = $('dialogo'); if (dlg) dlg.style.zIndex = '21';          // a caixa de fala fica POR CIMA da tela preta
    await fala('jog', T('E esse foi meu primeiro contato com o futebol...'));
    await fala('jog', traco === 'talento' ? Tg('Dizem que eu sempre fui bom... que sempre joguei muito bem. Mas aquele foi o meu primeiro jogo.') : Tg('Eu não nasci sabendo. Tudo o que eu fui depois veio de treino e de muita força de vontade.'));
    Dialogo.esconder(); if (dlg) dlg.style.zIndex = '';
    await esperar(500);
  }
  async function tracoBanner(traco) {
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;z-index:12;left:50%;top:22%;transform:translateX(-50%);padding:10px 18px;text-align:center;background:rgba(42,18,6,.9);border:3px solid #f0a020;color:#fff0c8;font:700 15px/1.3 var(--font-display);letter-spacing:.08em;text-transform:uppercase;text-shadow:0 2px 0 #2a1206;opacity:0;transition:opacity .6s';
    el.innerHTML = esc1(T('Traço da história')) + '<br><span style="color:#f0a020;font-size:19px">' + esc1(traco === 'talento' ? T('Talento natural') : T('Força de vontade')) + '</span>';
    ($('raizJogo') || document.body).appendChild(el);
    await esperar(50); el.style.opacity = '1'; await esperar(3200); el.style.opacity = '0'; await esperar(700); el.remove();
  }

  // ------------------------------------------------------------------ quadro a quadro
  function atualizar(dt) {
    const t = performance.now() / 1000;
    // porta da sala (ou da sala de onde saímos) e porta do armário
    S.portaAng += (S.portaAlvo - S.portaAng) * Math.min(1, dt * 4); S.sala.pivo.rotation.y = S.portaAng;
    if (S.sala.pivoK) { S.kAng += (S.kAlvo - S.kAng) * Math.min(1, dt * 5); S.sala.pivoK.rotation.y = S.kAng; }
    if (S.sala.pivoV) { S.vAng += (S.vAlvo - S.vAng) * Math.min(1, dt * 5); S.sala.pivoV.rotation.y = S.vAng; }                       // (4.3.7) porta do valentão
    if (S.sala.pivoFE) { S.fAng += (S.fAlvo - S.fAng) * Math.min(1, dt * 3.5); S.sala.pivoFE.rotation.y = -S.fAng; S.sala.pivoFD.rotation.y = S.fAng; }   // porta da rua
    // jogador livre
    const J = S.jog;
    if (S.lugar === 'corredor') S.cirs = S.elenco.filter((A) => A !== J && A.bloq && !A.oculto && !(A.rota && A.rota.length)).map((A) => ({ x: A.x, z: A.z, r: 0.25 }));
    if (S.modo === 'livre' && !J.rota) {
      let ix = UI.joy.x, iz = UI.joy.y; const T_ = UI.teclas;
      if (T_.ArrowLeft || T_.KeyA) ix -= 1; if (T_.ArrowRight || T_.KeyD) ix += 1; if (T_.ArrowUp || T_.KeyW) iz -= 1; if (T_.ArrowDown || T_.KeyS) iz += 1;
      const mag = Math.min(1, Math.hypot(ix, iz));
      if (mag > 0.12) {
        const dx = ix / Math.hypot(ix, iz), dz = iz / Math.hypot(ix, iz), v = 2.3 * mag * dt;
        if (livre(J.x + dx * v, J.z)) J.x += dx * v; if (livre(J.x, J.z + dz * v)) J.z += dz * v;
        J.yawAlvo = Math.atan2(-dz, dx); J.vel = 2.3 * mag; J.livreAndando = true; S.face.x = dx; S.face.z = dz;
      } else J.livreAndando = false;
      if (S.fase === 'antes' && !S.brigou) { S.tLivre += dt; if (S.tLivre > 60) { S.brigou = true; S.modo = 'cena'; UI.ctl.hidden = true; brigar().then(() => { Dialogo.esconder(); liberar(); }); } }
      if (S.lugar === 'corredor' && !S.cenaFeita && J.z < -3.6) { S.cenaFeita = true; S.modo = 'cena'; UI.ctl.hidden = true; J.livreAndando = false; cenaBuli().then(() => { Dialogo.esconder(); liberar(); }); }
    } else J.livreAndando = false;
    // atores
    for (const A of S.elenco) {
      let mov = false;
      if (A.segura) A.segura.th += (A.segura.alvoTh - A.segura.th) * Math.min(1, dt * 3.4);      // sobe/desce a bola devagar
      if (A.rota && A.rota.length) {
        const p = A.rota[0], dx = p.x - A.x, dz = p.z - A.z, d = Math.hypot(dx, dz), st = A.vel * dt;
        if (d <= st) { A.x = p.x; A.z = p.z; A.rota.shift(); if (!A.rota.length) { A.rota = null; const r = A.rotaRes; A.rotaRes = null; if (r) r(); } }
        else { A.x += dx / d * st; A.z += dz / d * st; A.yawAlvo = Math.atan2(-dz, dx); mov = true; }
      } else if (A.conv != null && !A.oculto && A.bloq) A.fala = Math.sin(t * 0.9 + A.conv * 3) > 0.15;       // papo animado
      if (A === J && J.livreAndando) mov = true;
      let dy = ((A.yawAlvo - A.yaw + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI; A.yaw += dy * Math.min(1, dt * 10);
      if (A.chao && !mov) poseChao(A, t, dt); else if (A.aquece && !mov) poseAquece(A, t, dt); else if (A.sentado && !mov) poseSentado(A, t, dt); else poseEmPe(A, t, dt, mov);
      const r = A.m.raiz; r.position.x = A.x; r.position.z = A.z; r.rotation.y = A.yaw;
      if (!A.sentado) r.position.y = r.position.y || 0;
    }
    // bola de futsal nas mãos do João (pátio / quadra). (4.4.0) A posição sai da conta dos braços (onde as mãos ficam de verdade) e a bola
    // não gira mais: antes ela ficava no ar, rodando, a uma altura fixa.
    if (S.sala.bola) {
      const D = S.bolaDono, B = S.sala.bola; B.visible = !!D && !D.oculto;
      if (D && D.segura) {
        const sg = D.segura, ec = D.opt.escala || 1, dh = 0.62, cph = Math.cos(sg.ph);
        const lx = dh * cph * Math.sin(sg.th), ly = 1.27 - dh * cph * Math.cos(sg.th) + 0.05;       // meio entre as duas mãos (no referencial do boneco)
        // (4.4.0) levantada: a bola vai para CIMA da cabeça (estilizado: a mão não chega, mas a bola não atravessa o cabeção). w: 0 = nas mãos, 1 = no topo
        const kc = D.opt.cabecao || 1, w0 = Math.max(0, Math.min(1, (sg.th - 1.5) / (2.85 - 1.5))), w = w0 * w0 * (3 - 2 * w0);
        const topoY = ((1.36 + 0.52 * kc + 0.15 * kc) * ec + 0.17 + 0.03) / ec;                // altura (no referencial do boneco) da bola apoiada no alto do cabelo
        const lx2 = lx * (1 - w) + 0.02 * w, ly2 = ly * (1 - w) + Math.max(ly, topoY) * w;
        B.position.set(D.x + Math.cos(D.yaw) * lx2 * ec, ly2 * ec, D.z - Math.sin(D.yaw) * lx2 * ec);
        B.rotation.set(0, 0, 0);
      } else if (D) { B.position.set(D.x + Math.cos(D.yaw) * 0.34, S.bolaAlt || 0.75, D.z - Math.sin(D.yaw) * 0.34); B.rotation.set(0, 0, 0); }
    }
    // seta
    S.sala.seta.position.set(S.seta.x, S.seta.y + Math.sin(t * 4) * 0.08, S.seta.z);
  }
  // (4.4.2) Câmera tapada: o que estiver entre a câmera e o jogador (ou a dupla que conversa) fica translúcido — árvores, a escola, pessoas.
  const _ray = new THREE.Ray(), _o = new THREE.Vector3(), _d = new THREE.Vector3(), _hit = new THREE.Vector3(), _box = new THREE.Box3(), _p1 = new THREE.Vector3(), _p2 = new THREE.Vector3();
  const ALFA_TAPA = 0.2;
  function setAlfa(mats, a) {
    for (const mt of mats) { const t = a < 0.985; if (mt.transparent !== t) { mt.transparent = t; mt.needsUpdate = true; } mt.opacity = a; if (mt.depthWrite !== !t) mt.depthWrite = !t; }
  }
  function oclusao(dt) {
    const C = S.cam, alvos = [S.jog];
    if (S.modo !== 'livre') { for (const A of [S.parA, S.parB]) if (A && !alvos.includes(A)) alvos.push(A); }
    _o.set(C.px, C.py, C.pz);
    const tapa = (box, ign) => {
      for (const A of alvos) {
        _p1.set(A.x, 0.9, A.z); _d.copy(_p1).sub(_o); const dist = _d.length(); _d.normalize(); _ray.set(_o, _d);
        const h = _ray.intersectBox(box, _hit);
        if (h && _o.distanceTo(_hit) < dist - 0.25) return true;
      }
      return false;
    };
    const k = Math.min(1, dt * 7);
    for (const oc of S.sala.ocl || []) {
      const alvo = tapa(oc.box) ? ALFA_TAPA : 1;
      oc.a = (oc.a == null ? 1 : oc.a); oc.a += (alvo - oc.a) * k; setAlfa(oc.mats, oc.a);
    }
    for (const A of S.elenco) {                                      // pessoas
      if (alvos.includes(A) || A.oculto) { if (A.alfa != null && A.alfa < 1) { A.alfa = 1; setAlfa(A.mats || [], 1); } continue; }
      const esc = (A.opt.escala || 1) * 1.2 * (A.opt.cabecao > 1 ? 1.15 : 1);
      _box.min.set(A.x - 0.38, 0, A.z - 0.38); _box.max.set(A.x + 0.38, 2.0 * esc, A.z + 0.38);
      const alvo = tapa(_box) ? ALFA_TAPA : 1;
      if (!A.mats) { A.mats = []; A.m.raiz.traverse((o) => { if (o.isMesh && o.geometry !== SHADOW_GEO && o.material && !A.mats.includes(o.material)) A.mats.push(o.material); }); }
      A.alfa = (A.alfa == null ? 1 : A.alfa); A.alfa += (alvo - A.alfa) * k; setAlfa(A.mats, A.alfa);
    }
  }
  function gancho(rdt) {
    if (!S || !S.ativo) return;
    const dt = Math.min(0.05, rdt || 0.016);
    atualizar(dt);
    const cast = new Set(S.elenco.map((a) => a.m));
    for (const a of ATLETAS) a.raiz.visible = cast.has(a) ? !S.elenco.find((x) => x.m === a).oculto : false;
    ball.mesh.visible = ball.shadow.visible = false; userRing.visible = false; targetRing.visible = false; dribbleRing.visible = false; aimArrow.visible = false;
    // câmera
    let al;
    if (S.modo === 'livre') {
      const J = S.jog;
      if (S.lugar === 'patio') { const fx = J.x * 0.6; al = { px: fx, py: 5.2, pz: J.z + 5.6, tx: fx, ty: 0.3, tz: J.z - 1.6 }; }
      else if (S.lugar === 'corredor') { const fx = J.x * 0.4; al = { px: fx, py: 5.0, pz: J.z + 4.4, tx: fx, ty: 0.3, tz: J.z - 1.2 }; }
      else { const fx = J.x * 0.75; al = { px: fx, py: 5.4, pz: J.z + 4.8, tx: fx, ty: 0.3, tz: J.z - 1.0 }; }
    } else { const c = CAMS[S.camNome] || CAMS.aula, v = typeof c === 'function' ? c() : c; al = { px: v[0], py: v[1], pz: v[2], tx: v[3], ty: v[4], tz: v[5] }; }
    const C = S.cam, k = S.camSnap ? 1 : 1 - Math.exp(-dt * 3.2); S.camSnap = false;
    for (const c of ['px', 'py', 'pz', 'tx', 'ty', 'tz']) C[c] += (al[c] - C[c]) * k;
    camera.position.set(OX + C.px, C.py, C.pz); camera.lookAt(OX + C.tx, C.ty, C.tz);
    if (S.sala.moldura) S.sala.moldura.visible = C.pz > -SZ + 0.05;
    oclusao(dt);
    // interface
    if (S.modo === 'livre') {
      const a = alvoAtual(), txt = a ? a.txt : '';
      if (UI.dica.textContent !== txt) UI.dica.textContent = txt;
      UI.btn.disabled = !a; if (UI.btn.textContent !== T('Interagir')) UI.btn.textContent = T('Interagir');
    }
  }
  // lá fora é preto sólido (como nos jogos antigos): esconde o campo e o resto do mundo enquanto a fase roda
  function escurecerMundo() {
    S.mundo = { bg: scene.background, fogN: scene.fog ? scene.fog.near : 0, fogF: scene.fog ? scene.fog.far : 0, vis: [] };
    scene.background = new THREE.Color(0x000000);
    if (scene.fog) { scene.fog.near = 1e5; scene.fog.far = 2e5; }
    for (const c of scene.children) if (!c.isLight && c !== S.sala.g) { S.mundo.vis.push([c, c.visible]); c.visible = false; }
  }
  function restaurarMundo() {
    const M = S.mundo; if (!M) return;
    scene.background = M.bg;
    if (scene.fog) { scene.fog.near = M.fogN; scene.fog.far = M.fogF; }
    for (const [c, v] of M.vis) c.visible = v;
  }

  // ------------------------------------------------------------------ iniciar
  async function iniciar(op) {
    montarUI();
    op = op || {};
    if (!op.direto) HistoriaSave.limpar();                 // (4.5.0) história nova: não herda nada de uma anterior (atalhos de teste mantêm)
    Musica.tocar('jazz');
    const ap = PERSONAGEM.aparencia || {};
    S = { ativo: true, modo: 'cena', fase: 'antes', lugar: 'sala', cirs: [], elenco: [], nome: op.nome || 'Você', voz: op.voz == null ? 2 : op.voz, cam: { px: 4.0, py: 1.6, pz: 1.5, tx: 4.7, ty: 1.1, tz: 5.0 }, camNome: 'porta', camSnap: true,
      portaAng: 0, portaAlvo: 0, tLivre: 0, brigou: false, portaTrancada: false, joao: null, lucia: null, perfil: 0, acertos: 0, profFalou2: false, face: { x: 0, z: -1 },
      seta: { x: COLS[1], y: 1.55, z: LINHAS[1] + 0.62 },
      quiz: [{ q: 'Se x + 5 = 12, quanto vale x?', o: ['5', '7', '17'], c: 1 }, { q: 'Se 2x = 10, quanto vale x?', o: ['20', '3', '5'], c: 2 }, { q: 'Se x − 4 = 6, quanto vale x?', o: ['10', '2', '24'], c: 0 }] };
    await preto(true, 0);
    { const a = $('anoTela'); if (a) a.remove(); }
    UI.missao.hidden = true; UI.ctl.hidden = true;
    S.sala = montarSala();
    escurecerMundo();
    document.body.classList.add('criadorAberto');
    // elenco
    S.jog = criar(S.sala, { pele: ap.pele || pele(2), cabelo: ap.cabelo || corCab(1), estilo: ap.estilo | 0, rosto: ap.rosto | 0, labio: ap.labio == null ? 3 : ap.labio, corBarba: ap.cabelo || corCab(1), barba: 0 });
    if (op.direto === 'quadra') { GANCHO_RENDER = gancho; S.alunos = []; S.nome = op.nome || S.nome; }       // (atalho de teste: pula a escola)
    else if (op.direto === 'corredor') { GANCHO_RENDER = gancho; S.alunos = []; S.nome = op.nome || S.nome; await corredor(); await new Promise((res) => { S.fim = res; }); }   // (atalho de teste: começa no corredor)
    else {
      S.prof = criar(S.sala, { pele: pele(3), cabelo: corCab(6), estilo: ci('Coque longo'), rosto: ri('Padrão'), camisa: '#7a3e8f', listra: '#7a3e8f', gola: '#ffffff', calcao: 0x3a2a4a, meia: '#3a2a4a', cabecao: 1.3, escala: 0.98 });
      S.prof.x = PROF.x; S.prof.z = PROF.z; S.prof.yaw = S.prof.yawAlvo = -Math.PI / 2;
      const seats = [[0, 0, null], [0, 2, null], [1, 0, 'lucia'], [1, 2, 'joao'], [2, 0, null], [2, 1, null], [2, 2, null]];            // [fileira, coluna, quem] — (0,0) vazia, (1,1) é a sua
      const looks = looksAlunos();
      S.alunos = [];
      seats.forEach(([fi, co, quem], i) => {
        const A = criar(S.sala, looks[i]); A.cx = COLS[co]; A.cz = LINHAS[fi] + 0.62; sentar(A, COLS[co], LINHAS[fi], true); A.escreve = quem === null || quem === 'lucia';
        if (quem === 'joao') S.joaoA = A; if (quem === 'lucia') S.luciaA = A; S.alunos.push(A);
      });
      S.jog.x = PORTA.x; S.jog.z = PORTA.z + 1.7; S.jog.yaw = S.jog.yawAlvo = Math.PI / 2;
      GANCHO_RENDER = gancho;
      await esperar(300);
      await legenda(T('Escola Santa Maria - interior do Brasil'), 3000);
      await preto(false, 1000);
      await esperar(500);
      // abre a porta e o personagem entra
      Musica.porta(true); S.portaAlvo = -100 * rad; await esperar(700);
      await andar(S.jog, [[PORTA.x, PORTA.z - 1.5]], 1.5);
      S.portaAlvo = 0; Musica.porta(false);
      await fala('jog', Tf('... oi, {0}... perdão pelo atraso', nm('prof')), 'jog');
      olhar(S.prof, S.jog.x, S.jog.z);
      await fala('prof', Tf('É a segunda vez essa semana, {0}! Semana passada eu já falei com o seu pai que você não está chegando no horário!', nomeJog()), 'prof');
      await fala('jog', Tg('Eu sei... desculpa...'), 'jog');
      await fala('prof', T('O assunto foi sobre álgebra. Você conhece?'), 'prof', { manter: false });
      const r = await escolher(T('O assunto foi sobre álgebra. Você conhece?'), [Tg('Sim, sou muito bom em álgebra'), Tg('Sim, mas eu sou bem ruim...'), T('Não, professora...')]);
      S.perfil = r;
      await fala('prof', Tg(['Que bom que já sabe!', 'É bom começar a ficar bom.', 'Deveria ter vindo mais cedo.'][r]), 'prof');
      S.prof.yawAlvo = -Math.PI / 2;     // vira para a turma
      await fala('prof', T('Álgebra é usar letras, como o x, no lugar de um número que ainda não conhecemos. Por exemplo: x + 3 = 7. Quanto vale o x? Isso mesmo, 4!'), 'geral', { manter: true });
      await fala('prof', T('Então, turma, isso é álgebra! Vocês têm uma atividadezinha para responder. Podem ficar à vontade!'), 'geral');
      // controle livre
      camPara('aula');
      Dialogo.esconder();
      UI.missao.textContent = T('Missão: sente na sua cadeira e responda a atividade.'); UI.missao.hidden = false;
      liberar();
      await new Promise((res) => { S.checa = setInterval(() => { if (S.jog.oculto) { clearInterval(S.checa); res(); } }, 200); });
      // o corredor
      await corredor();
      await new Promise((res) => { S.fim = res; });
    }
    // 4.3.6: o pátio, a quadra, o treino e a primeira partida
    try { await parteQuadra(); } catch (e) { console.error(e); sairDaPartidaSeguro(); }
    // (4.5.0) fim da Fase 1: passa o bastão para a Fase 2 (fase2.js, arquivo separado, baixado agora). Se não der, fica o aviso de antes.
    UI.missao.hidden = true; UI.ctl.hidden = true;
    UI.leg.classList.remove('on');
    UI.preto.hidden = false; UI.preto.classList.remove('claro');
    UI.leg.innerHTML = esc1(T('Carregando a próxima fase...'));
    UI.leg.classList.add('on');
    const rf = await Fases.executar('fase2');
    if (!rf.ok) {
      console.warn('[Fase 2] não rodou:', rf);
      UI.leg.innerHTML = esc1(T('Em desenvolvimento...')) + '<br><br><button type="button" class="pxBtn pxPrim" id="f1Voltar">' + esc1(T('Voltar ao menu')) + '</button>';
      await new Promise((fim) => { UI.leg.querySelector('#f1Voltar').addEventListener('click', () => { if (typeof Som !== 'undefined' && Som.clique) Som.clique(); fim(); }); });
    }
    UI.leg.innerHTML = ''; UI.leg.classList.remove('on');
    S.ativo = false; GANCHO_RENDER = null; camera.clearViewOffset();
    document.body.classList.remove('criadorAberto');
    for (const A of S.elenco) { ATLETAS.delete(A.m); if (A.m.raiz.parent) A.m.raiz.parent.remove(A.m.raiz); }
    descartar(S.sala.g);
    restaurarMundo();
    UI.preto.hidden = true; UI.preto.classList.add('claro');
    Musica.parar();
    S = null;
  }
  // (4.5.0) Se a fase quebrar no meio (erro inesperado), o jogo chama isto para desfazer a sala e voltar o mundo ao normal.
  function emergencia() {
    if (!S) return;
    try {
      S.ativo = false; GANCHO_RENDER = null; camera.clearViewOffset();
      document.body.classList.remove('criadorAberto');
      for (const A of (S.elenco || [])) { ATLETAS.delete(A.m); if (A.m.raiz.parent) A.m.raiz.parent.remove(A.m.raiz); }
      if (S.sala && S.sala.g) descartar(S.sala.g);
      restaurarMundo();
      if (UI) { UI.preto.hidden = true; UI.preto.classList.add('claro'); UI.leg.innerHTML = ''; UI.leg.classList.remove('on'); UI.missao.hidden = true; UI.ctl.hidden = true; }
      if (typeof Dialogo !== 'undefined') Dialogo.esconder();
      Musica.parar();
    } catch (e) { console.error(e); }
    S = null;
  }
  return { iniciar, emergencia, get ativo() { return !!(S && S.ativo); }, _estado: () => S, _cams: CAMS, _caminho: caminho, _corredor: corredor };
})();

window.FutebolJS.registrarFase({ id: 'fase1', nome: 'Fase 1', nucleoMinimo: '4.5.0', iniciar: (ctx) => Fase1.iniciar(ctx.args || {}) });
