/* =====================================================================
   FUTEBOL JS · treinoCampo.js · O CAMPO DE TREINO DO SEU NONATO (arquivo SEPARADO, como treino.js e pesca.js)
   ---------------------------------------------------------------------
   6.6.19 — primeira versão.
   - O TREINO de chute, passe e cruzamento (as 30 situações × 3 desafios do treino.js) agora acontece NUM MUNDO À PARTE, como a partida:
     a cidade some e PARA (o relógio não anda: api.suspenderTreino / api.retomarTreino da cidade), e o treino tem o campo dele.
   - Registrado com FutebolJS.registrarFase({ id: 'treinoCampo' }) só para o jogo saber baixar o arquivo; NÃO roda como fase.
     O treino.js baixa este arquivo quando o jogador escolhe uma situação e chama sessao(ctx): ctx traz a lógica (LOGICA: desafios e
     física), as poses, os sons, os textos, o HUD e o progresso salvo; a sessão devolve 'ok' (fechou os 3), 'falhou' ou 'saiu'.
   - O CAMPO (montarCampo): gramado com faixas de corte, as linhas (área, pequena área, marca do pênalti), o gol com rede, o alambrado
     com a placa "CT DO SEU NONATO", os 4 refletores (acesos de noite), o banco com a sacola de bolas, os cones e as garrafinhas,
     e árvores e morros em volta. Coordenadas do treino (u, v) = (x, −z) aqui: o gol fica no z = 0 e o campo cresce para −z.
   - OS BONECOS são os da cidade (o jogador com a roupa dele e o Paredão, o Juninho e o Tonhão): vêm para cá enquanto dura o treino
     (o modelo troca de grupo e volta igual no fim) e são animados pelo poseAtor da cidade + as poses do treino.js (A.poseFn).
   - A ABERTURA: a câmera desce do alto, atrás do gol, até o lugar da bola, com o nome do CT; depois o cartão do desafio.
   ===================================================================== */
(function () {
  'use strict';
  const lerpN = (a, b, k) => a + (b - a) * k, clampN = (x, a, b) => Math.max(a, Math.min(b, x));
  const difAng = (a, b) => { let d = (a - b) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; return d; };

  // =====================================================================================================================
  // O CAMPO (no grupo próprio do treino). u = lado, v = distância até a linha do gol: x = u, z = −v.
  // =====================================================================================================================
  function texCv(w, h, fn) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; fn(cv.getContext('2d'), w, h); const t = new THREE.CanvasTexture(cv); t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; return t; }
  function montarCampo(api, L, noite) {
    const g = new THREE.Group(), descarte = [], G = new api.Geo();
    const guarda = (o) => { descarte.push(o); return o; };
    const GW = L.GOL_W, GH = L.GOL_H, LAT = 9.6, FUNDO = 31.5;                 // o campo: u de −9,6 a 9,6 · v de 0 a 31,5
    // o chão em volta e o gramado com as faixas de corte (de 2,4 m)
    G.box(90, 0.04, 90, '#5d8a3a', 0, -0.06, -16);
    G.box(2 * LAT + 3, 0.02, FUNDO + 6, '#3f8f37', 0, -0.025, -FUNDO / 2);
    for (let i = 0; i < 14; i++) { const v0 = -1.5 + i * 2.4; if (v0 > FUNDO + 1) break; G.box(2 * LAT + 2, 0.02, 2.4, i % 2 ? '#47a540' : '#3f9a39', 0, -0.02, -(v0 + 1.2)); }
    // as linhas (brancas, 8 cm)
    const linha = (u0, v0, u1, v1) => { const w = Math.max(0.08, Math.abs(u1 - u0)), d = Math.max(0.08, Math.abs(v1 - v0)); G.box(w, 0.012, d, '#f4f4ee', (u0 + u1) / 2, 0.0, -(v0 + v1) / 2); };
    linha(-LAT, 0, LAT, 0); linha(-LAT, FUNDO, LAT, FUNDO); linha(-LAT, 0, -LAT, FUNDO); linha(LAT, 0, LAT, FUNDO);
    linha(-5.6, 0, -5.6, 7.2); linha(5.6, 0, 5.6, 7.2); linha(-5.6, 7.2, 5.6, 7.2);             // a área
    linha(-3.4, 0, -3.4, 2.6); linha(3.4, 0, 3.4, 2.6); linha(-3.4, 2.6, 3.4, 2.6);             // a pequena área
    G.box(0.22, 0.013, 0.22, '#f4f4ee', 0, 0.0, -6.0);                                           // a marca do pênalti
    for (let k = 0; k <= 16; k++) { const a = Math.PI * (0.2 + 0.6 * k / 16), r = 3.0; G.box(0.32, 0.012, 0.09, '#f4f4ee', Math.cos(a) * r, 0.0, -(6.0 + Math.sin(a) * r)); }   // a meia-lua
    // o GOL: postes e travessão brancos (por fora da medida de dentro), a base no chão e os ferros de trás
    const R = 0.06;
    for (const s of [-1, 1]) { G.box(0.12, GH + 0.12, 0.12, '#f4f4f0', s * (GW + R), 0, 0); G.box(0.06, 0.06, 1.15, '#d8d8d2', s * (GW + R), 0, 0.58); G.box(0.06, GH, 0.06, '#d8d8d2', s * (GW + R), 0, 1.12); }
    G.box(2 * GW + 0.24, 0.12, 0.12, '#f4f4f0', 0, GH, 0); G.box(2 * GW + 0.24, 0.06, 0.06, '#d8d8d2', 0, 0, 1.12); G.box(2 * GW + 0.24, 0.06, 0.06, '#d8d8d2', 0, GH - 0.03, 1.12);
    // o ALAMBRADO: postes e a tela (textura com furos), mais alto atrás do gol
    const AX = 12.4, AZ0 = 5.2, AZ1 = -(FUNDO + 2.6), AH = 3.6;
    for (let z = AZ0; z >= AZ1 - 0.01; z -= 4) for (const s of [-1, 1]) G.box(0.1, AH, 0.1, '#7d838a', s * AX, 0, z);
    for (let x = -AX; x <= AX + 0.01; x += 4) for (const z of [AZ0, AZ1]) G.box(0.1, AH + (z === AZ0 ? 1.2 : 0), 0.1, '#7d838a', x, 0, z);
    for (const s of [-1, 1]) G.box(0.07, 0.07, AZ0 - AZ1, '#7d838a', s * AX, AH, (AZ0 + AZ1) / 2);
    G.box(2 * AX, 0.07, 0.07, '#7d838a', 0, AH + 1.2, AZ0); G.box(2 * AX, 0.07, 0.07, '#7d838a', 0, AH, AZ1);
    // os REFLETORES (4 torres por fora das linhas)
    const cabecas = [];
    for (const [x, z] of [[-AX + 0.6, 2.5], [AX - 0.6, 2.5], [-AX + 0.6, -FUNDO + 2], [AX - 0.6, -FUNDO + 2]]) {
      G.box(0.26, 10.2, 0.26, '#6d737b', x, 0, z); const ld = -Math.sign(x);
      G.box(1.6, 0.14, 0.18, '#6d737b', x + ld * 0.6, 10.1, z); G.box(1.7, 0.7, 0.3, '#3a3d42', x + ld * 0.9, 9.9, z);
      cabecas.push({ x: x + ld * 0.9, y: 10.25, z: z + (z > 0 ? -0.17 : 0.17), ld });
    }
    // o BANCO (do lado esquerdo, no meio) com a sacola de bolas, a pilha de cones e as garrafinhas
    { const bu = -LAT - 1.4, bv = 12; G.box(0.5, 0.06, 3.2, '#8a5a2b', bu, 0.45, -bv); G.box(0.08, 0.5, 3.2, '#8a5a2b', bu - 0.24, 0.5, -bv);
      for (const dz of [-1.4, 0, 1.4]) G.box(0.44, 0.45, 0.06, '#4a4d52', bu, 0, -bv + dz);
      G.box(1.0, 1.0, 0.06, '#9aa0a6', bu - 0.4, 0, -bv - 1.9); G.box(1.0, 0.06, 1.8, '#3a64b8', bu - 0.1, 2.1, -bv);    // a cobertura azul
      for (const dz of [-1.6, 1.6]) G.box(0.06, 2.1, 0.06, '#9aa0a6', bu + 0.35, 0, -bv + dz);
      for (let k = 0; k < 5; k++) G.box(0.07, 0.22, 0.07, ['#3a8ad6', '#f2c230', '#3a8ad6', '#c8352b', '#f2f2ee'][k], bu + 0.1, 0.51, -bv - 1.2 + k * 0.18);   // garrafinhas
      for (let k = 0; k < 6; k++) G.box(0.24 - k * 0.025, 0.07, 0.24 - k * 0.025, '#f06a1a', bu + 0.9, k * 0.06, -bv + 2.2);   // a pilha de cones
    }
    // ÁRVORES e morros em volta (fora do alambrado)
    const rnd = (() => { let a = 77; return () => { a = (a * 16807) % 2147483647; return a / 2147483647; }; })();
    for (let i = 0; i < 26; i++) {
      const lado = i % 3, x = lado === 0 ? -AX - 3 - rnd() * 8 : lado === 1 ? AX + 3 + rnd() * 8 : -AX + rnd() * 2 * AX, z = lado === 2 ? AZ1 - 3 - rnd() * 6 : AZ0 - rnd() * (AZ0 - AZ1);
      const h = 2.2 + rnd() * 2.4, c = ['#2f6b2c', '#3b7d34', '#2a5e28'][i % 3];
      G.box(0.3, h * 0.45, 0.3, '#6a4428', x, 0, z); G.box(1.6 + rnd(), h * 0.55, 1.6 + rnd(), c, x, h * 0.4, z); G.box(1.0, h * 0.3, 1.0, c, x, h * 0.85, z);
    }
    for (const [x, z, w, h, c] of [[-40, -60, 50, 9, '#6f9a4a'], [25, -70, 60, 12, '#78a352'], [55, -20, 30, 7, '#6f9a4a'], [-55, 0, 30, 6, '#78a352']]) G.box(w, h, 22, c, x, -2, z);
    const malha = G.malha(api.MAT); guarda(malha.geometry); g.add(malha);
    // a REDE do gol (textura de malha com furos) · o fundo, o teto e os lados
    const texRede = guarda(texCv(32, 32, (c, w, h) => { c.clearRect(0, 0, w, h); c.fillStyle = '#f4f4ee'; for (let i = 0; i < w; i += 8) { c.fillRect(i, 0, 1, h); c.fillRect(0, i, w, 1); } }));
    texRede.wrapS = texRede.wrapT = THREE.RepeatWrapping;
    const rede = (w, h, x, y, z, ry, rx) => { const t = texRede.clone(); t.needsUpdate = true; t.repeat.set(w * 4, h * 4); guarda(t); const m = new THREE.Mesh(guarda(new THREE.PlaneGeometry(w, h)), guarda(new THREE.MeshBasicMaterial({ map: t, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide }))); m.position.set(x, y, z); m.rotation.set(rx || 0, ry || 0, 0); g.add(m); };
    rede(2 * GW + 0.12, GH, 0, GH / 2, 1.12, 0); rede(2 * GW + 0.12, 1.12, 0, GH, 0.56, 0, -Math.PI / 2);
    for (const s of [-1, 1]) rede(1.12, GH, s * (GW + R), GH / 2, 0.56, Math.PI / 2);
    // a TELA do alambrado (losangos)
    const texTela = guarda(texCv(32, 32, (c, w, h) => { c.clearRect(0, 0, w, h); c.strokeStyle = 'rgba(120,128,136,0.95)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(0, 16); c.lineTo(16, 0); c.lineTo(32, 16); c.lineTo(16, 32); c.closePath(); c.stroke(); }));
    texTela.wrapS = texTela.wrapT = THREE.RepeatWrapping;
    const tela = (w, h, x, y, z, ry) => { const t = texTela.clone(); t.needsUpdate = true; t.repeat.set(w / 0.5, h / 0.5); guarda(t); const m = new THREE.Mesh(guarda(new THREE.PlaneGeometry(w, h)), guarda(new THREE.MeshBasicMaterial({ map: t, transparent: true, alphaTest: 0.3, side: THREE.DoubleSide, fog: true }))); m.position.set(x, y, z); m.rotation.y = ry || 0; g.add(m); };
    for (const s of [-1, 1]) tela(AZ0 - AZ1, AH, s * AX, AH / 2, (AZ0 + AZ1) / 2, Math.PI / 2);
    tela(2 * AX, AH + 1.2, 0, (AH + 1.2) / 2, AZ0, 0); tela(2 * AX, AH, 0, AH / 2, AZ1, 0);
    // a PLACA do CT (no alambrado atrás do gol, virada para o campo)
    const texPlaca = guarda(texCv(256, 48, (c, w, h) => {
      c.fillStyle = '#1f7a4d'; c.fillRect(0, 0, w, h); c.fillStyle = '#f2c230'; c.fillRect(0, 0, w, 4); c.fillRect(0, h - 4, w, 4);
      c.fillStyle = '#fff0c8'; c.font = 'bold 22px monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(api.trPlaca || 'CT DO SEU NONATO', w / 2, h / 2 + 1);
    }));
    { const m = new THREE.Mesh(guarda(new THREE.PlaneGeometry(5.2, 0.98)), guarda(new THREE.MeshLambertMaterial({ map: texPlaca }))); m.position.set(0, 3.2, AZ0 - 0.08); m.rotation.y = Math.PI; g.add(m); }
    // a LUZ dos refletores: as cabeças brilham e o campo clareia (de noite)
    const matLuz = guarda(new THREE.MeshBasicMaterial({ color: 0xfff6d8 }));
    for (const c of cabecas) { const m = new THREE.Mesh(guarda(new THREE.BoxGeometry(1.5, 0.5, 0.06)), matLuz); m.position.set(c.x, c.y - 0.05, c.z); g.add(m); }
    const amb = new THREE.AmbientLight(0xfff2d8, 0.62 * noite); g.add(amb);
    const dir = new THREE.DirectionalLight(0xfff4e0, 0.55 * noite); dir.position.set(-6, 14, -4); dir.target.position.set(0, 0, -12); g.add(dir); g.add(dir.target);
    matLuz.color.setRGB(0.45 + 0.55 * noite, 0.45 + 0.52 * noite, 0.42 + 0.4 * noite);
    scene.add(g);
    return { g, limpar: () => { scene.remove(g); for (const o of descarte) { try { o.dispose(); } catch (e) { /* já foi */ } } } };
  }

  // =====================================================================================================================
  // A SESSÃO: o campo, os bonecos, o minigame (o mesmo de antes, agora aqui) e a volta para a cidade
  // =====================================================================================================================
  async function sessao(ctx) {
    const { api, L, SOM, pose, limparPose, tr, trf, virg, esc, montarHud, vib, Sit, rep, dados, gravar, atributos } = ctx;
    const Y0 = 0, ATRASO = 0.3;
    const W = (u, v) => ({ x: u, z: -v });
    const J = ctx.jog, turma = { gol: ctx.gol, bat: ctx.bat };
    const TT = () => turma;
    const palco = { jog: J, camCena: null };                              // o "S()" do minigame: o jogador e a câmera pedida
    const S = () => palco;
    const P = { mg: null };
    const MATS = {};
    const mat = (cor, op) => { const k = cor + '|' + (op || 1); return MATS[k] || (MATS[k] = new THREE.MeshLambertMaterial(op && op < 1 ? { color: cor, transparent: true, opacity: op, depthWrite: false } : { color: cor })); };
    const matB = (cor, op) => { const k = 'b' + cor + '|' + (op || 1); return MATS[k] || (MATS[k] = new THREE.MeshBasicMaterial({ color: cor, transparent: (op || 1) < 1, opacity: op || 1, depthWrite: (op || 1) >= 1 })); };
    const noite = clampN(api.noite ? api.noite() : 0, 0, 1);
    const campo = montarCampo(Object.assign({ trPlaca: tr('CT DO SEU NONATO') }, api), L, noite);
    const grupo = () => campo.g;
    function novaBola() {
      const m = new THREE.Mesh(new THREE.SphereGeometry(L.RB, 14, 10), new THREE.MeshLambertMaterial({ map: api.texBolinha() }));
      const sb = api.sombraAtor ? api.sombraAtor(0.17) : null; if (sb) grupo().add(sb); grupo().add(m); return { m, sb };
    }
    function porBola(B, u, y, v, giro) {
      const p = W(u, v); B.m.position.set(p.x, Y0 + y, p.z); if (giro) { B.m.rotation.x += giro; B.m.rotation.z += giro * 0.4; }
      if (B.sb) { B.sb.position.set(p.x, Y0 + 0.02, p.z); B.sb.visible = B.m.visible; const k = clampN(1 - (y - L.RB) / 3, 0.35, 1); B.sb.scale.set(k, k, k); }
    }
    function tirar(o) { if (!o) return; if (o.parent) o.parent.remove(o); o.traverse && o.traverse((q) => { if (q.geometry) q.geometry.dispose(); }); }

    // ---- os bonecos vêm para o campo (o modelo troca de grupo; no fim volta tudo como estava)
    const atores = [J, turma.gol].concat(turma.bat);
    const guardados = atores.map((A) => ({ A, x: A.x, z: A.z, y: A.y, yaw: A.yaw, gol: A.goleiro, oculto: A.oculto, pr: A.m.raiz.parent, pb: A.blob && A.blob.parent, vr: A.m.raiz.visible, vb: A.blob && A.blob.visible, an: A.anel && A.anel.visible, longe: A.m.longe }));
    function trazerAtores() { for (const A of atores) {                 // (depois de a cidade parar: senão o quadro dela ainda esconde/mexe neles)
      if (A.congelado && api.poseAtor) api.poseAtor(A, 0.016);          // descongela (volta a ser o boneco completo)
      grupo().add(A.m.raiz); if (A.blob) { grupo().add(A.blob); A.blob.visible = true; } A.m.raiz.visible = true; A.m.longe = false; if (A.boneco) A.boneco.visible = false;
      if (A.anel) A.anel.visible = false; A.goleiro = false; A.y = 0; A.andando = false; A.correndo = false; A.chuva = null; limparPose(A);
    } }

    // ---- o QUADRO (no lugar do da cidade, que está parada): o minigame, as poses e a câmera
    let ultimoErro = 0;
    const dbg = window.__treinoCampo = { P, palco, turma, J, camFixa: null };   // (para os testes: ver de perto)
    function quadro(rdt) {
      const dt = Math.min(0.05, rdt || 0.016);
      try {
        if (P.mg) tickMg(dt);
        for (const A of atores) {
          A.t = (A.t || 0) + dt; A.yaw += difAng(A.yawAlvo == null ? A.yaw : A.yawAlvo, A.yaw) * Math.min(1, dt * 8);
          api.poseAtor(A, dt);
        }
        const c = dbg.camFixa || palco.camCena; if (c) { camera.position.set(c.px, c.py, c.pz); camera.lookAt(c.tx, c.ty, c.tz); }
      } catch (e) { if (performance.now() - ultimoErro > 3000) { ultimoErro = performance.now(); console.warn('[Treino] quadro:', e); } }
    }

    // o Paredão acompanhando a jogada (a posição vem da lógica; aqui a pose: base, ponte, encaixe)
    function goleiroSegue(K, J, dt) {
      const g = J.gk; if (!g) return;
      const p = W(g.u, g.v), antes = K.x; K.z = p.z; K.yawAlvo = Math.PI / 2; K.yaw = K.yawAlvo;
      if (!K.pf || K.pf.tipo === 'gk') K.x = p.x;
      if (K.pf && K.pf.tipo === 'gk') K.pf.lat = (K.x - antes) / Math.max(dt, 1e-3);
      const ev = J.ev.find((e) => e.e === 'goleiro');
      if (ev && (!K.pf || K.pf.tipo === 'gk')) {
        const dl = ev.u - g.u;                                            // de onde a bola passou em relação ao corpo dele
        if (g.pegou && g.encaixe) pose(K, 'encaixe');
        else if (Math.abs(dl) > 0.35) { const lado = Math.sign(dl); pose(K, 'mergulho', { lado, alto: clampN(ev.y / 2.2, 0, 1), encaixou: g.pegou && Math.abs(dl) < 0.8 }); K.x = W(g.u - Math.sign(dl) * 0.55, 0).x; }
      }
      if (K.pf && K.pf.tipo === 'gk' && J.t > 0.05 && g.alvo != null && !ev) {   // a bola vem: se for para longe, já sai mergulhando
        const B = J.B, tp = B.vv < 0 ? (B.v - g.v) / -B.vv : 9; if (tp < 0.28 && Math.abs(g.alvo - g.u) > 0.45) { const dl = g.alvo - g.u, lado = Math.sign(dl); pose(K, 'mergulho', { lado, alto: clampN(B.y / 2.2, 0, 1) }); K.pf.t = 0.08; }
      }
    }

    // ---- montar cada desafio no campo
    function montarDesafio(m, k) {
      limparDesafio(m);
      const D = m.D = m.Sit.desafios[k], T_ = TT(); m.k = k; m.bolas = 3; m.tD = 0; m.e = 'intro'; m.t = 0; m.J = null; m.res = null;
      m.mira = { u: D.mira.u, v: D.mira.v != null ? D.mira.v : 0, y: D.mira.y != null ? D.mira.y : 0 }; if (D.mira.plano === 'chao') m.mira.y = 0;
      m.spin = 0; m.alto = D.tipo === 'passe' ? D.trava === 'alto' : false;
      const props = m.props = [];
      const add = (o) => { grupo().add(o); props.push(o); return o; };
      // bonecos de treino (barreira e marcadores extras): amarelo com a "cabeça" preta
      const boneco = (h) => { const g = new THREE.Group(), c = new THREE.Mesh(new THREE.BoxGeometry(0.46, h - 0.32, 0.12), mat('#f2c230')); c.position.y = (h - 0.32) / 2; g.add(c);
        const ca = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.28, 0.14), mat('#1c1c1f')); ca.position.y = h - 0.16; g.add(ca); const pe = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.06, 0.36), mat('#3a3a3a')); pe.position.y = 0.03; g.add(pe); return g; };
      if (D.barreira) for (const b of D.barreira) { const g = add(boneco(b.h)), p = W(b.u, b.v); g.position.set(p.x, Y0, p.z); g.rotation.y = Math.atan2(-(W(D.bola.u, D.bola.v).z - p.z), W(D.bola.u, D.bola.v).x - p.x) + Math.PI / 2; }
      m.mkObj = [];
      if (D.marcadores) D.marcadores.forEach((M, i) => { if (M.npc) m.mkObj.push({ npc: T_.bat[1] }); else { const g = add(boneco(1.9)); m.mkObj.push({ g }); } void i; });
      // placas (a janela no gol): 4 tábuas em volta da janela
      if (D.janela) { m.placas = [0, 1, 2, 3].map(() => add(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 0.06), mat('#9b6a3a')))); m.placaBorda = add(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 0.04), mat('#6a4428'))); m.placaBorda.visible = false; }
      // aros (alvos no gol): o aro laranja e as cordas até o travessão
      if (D.alvos) m.aros = D.alvos.map((a) => { const g = new THREE.Group(), to = new THREE.Mesh(new THREE.TorusGeometry(a.r, 0.045, 6, 28), mat('#f07a20')); g.add(to);
        const cd = new THREE.Mesh(new THREE.BoxGeometry(0.02, 1, 0.02), mat('#e8e0c8')); cd.position.y = 0.5; g.add(cd); g.userData.corda = cd; g.userData.r = a.r; return add(g); });
      // o aro do cruzamento (no alto, de frente para a bola, num poste)
      if (D.aro) { const g = new THREE.Group(), to = new THREE.Mesh(new THREE.TorusGeometry(D.aro.r, 0.05, 6, 28), mat('#f07a20')); g.add(to); const ps = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1, 0.06), mat('#9aa0a6')); g.add(ps); g.userData.poste = ps; m.aroObj = add(g); }
      // cones
      if (D.cones) m.conesObj = [0, 1].map(() => { const c = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.36, 10), mat('#f06a1a')); return add(c); });
      // círculo no chão (zona)
      if (D.zona) { const z = new THREE.Mesh(new THREE.RingGeometry(D.zona.r - 0.07, D.zona.r, 40), matB('#fff0c8', 0.85)); z.rotation.x = -Math.PI / 2; const p = W(D.zona.u, D.zona.v); z.position.set(p.x, Y0 + 0.025, p.z); z.renderOrder = 3; add(z);
        const f = new THREE.Mesh(new THREE.CircleGeometry(D.zona.r - 0.07, 40), matB('#f0a020', 0.18)); f.rotation.x = -Math.PI / 2; f.position.set(p.x, Y0 + 0.022, p.z); f.renderOrder = 3; add(f); }
      // quem faz o quê: Paredão no gol (ou ao lado), Juninho recebe/cabeceia (ou assiste), Tonhão marca (ou assiste)
      papeis(m);
      atualizarHud(m); m.U.msg.className = 'trMsg';
      porBola(m.B, D.bola.u, L.RB, D.bola.v); m.B.m.visible = true;
      posicionarJogador(m, true);
      cartaoDesafio(m);
    }
    function limparDesafio(m) { for (const o of m.props || []) tirar(o); m.props = []; m.placas = null; m.aros = null; m.aroObj = null; m.conesObj = null; m.mkObj = []; m.placaBorda = null; }
    function papeis(m) {
      const D = m.D, T_ = TT(), [Ju, To] = T_.bat, K = T_.gol, b = D.bola;
      // quem só assiste fica num lugar livre: dentro do campo, a 4–6 m da bola, longe da câmera, do caminho da bola e de quem joga
      const usados = [], lado = (A) => { const p0 = lugarDeVer(m, usados); usados.push(p0); const p = W(p0.u, p0.v); A.x = p.x; A.z = p.z; olharP(A, b.u, b.v); };
      // Paredão
      if (D.goleiro) { const p = W(D.goleiro.u, D.goleiro.v); K.x = p.x; K.z = p.z; K.yaw = K.yawAlvo = Math.PI / 2; pose(K, 'gk'); }
      else { const p = W(3.6, -0.4); K.x = p.x; K.z = p.z; olharP(K, b.u, b.v); K.yaw = K.yawAlvo; pose(K, 'espera', { cintura: true }); }
      // Juninho
      if (D.recebe) { const p0 = D.recebe.corre ? L.posCorre(D.recebe.corre, 0) : D.recebe, p = W(p0.u, p0.v); Ju.x = p.x; Ju.z = p.z; olharP(Ju, b.u, b.v); Ju.yaw = Ju.yawAlvo; pose(Ju, 'espera'); }
      else if (D.cabeca) { const p0 = D.cabeca.corre ? L.posCorre(D.cabeca.corre, 0) : D.cabeca, p = W(p0.u, p0.v); Ju.x = p.x; Ju.z = p.z; olharP(Ju, b.u, b.v); Ju.yaw = Ju.yawAlvo; pose(Ju, 'espera'); }
      else { lado(Ju); Ju.yaw = Ju.yawAlvo; pose(Ju, 'espera', { cintura: Math.random() < 0.5 }); }
      // Tonhão
      const mkN = D.marcadores ? D.marcadores.findIndex((q) => q.npc) : -1;
      if (mkN >= 0) { const M = D.marcadores[mkN], p = W(M.u, M.v); To.x = p.x; To.z = p.z; olharP(To, b.u, b.v); To.yaw = To.yawAlvo; pose(To, 'espera'); }
      else { lado(To); To.yaw = To.yawAlvo; pose(To, 'espera', { cintura: true }); }
      for (const A of [K, Ju, To]) A.andando = false;
    }
    function lugarDeVer(m, usados) {
      const D = m.D, b = D.bola, dl = dirLance(m), ru = dl.v, rv = -dl.u, cam = { u: b.u - dl.u * 5 - ru, v: b.v - dl.v * 5 - rv };
      const alvo = D.mira.plano === 'gol' ? { u: 0, v: 0 } : { u: D.mira.u, v: D.mira.v };
      const evita = [cam, b, alvo].concat(usados); if (D.goleiro) evita.push({ u: D.goleiro.u, v: D.goleiro.v }); if (D.recebe) evita.push(D.recebe); if (D.cabeca) evita.push(D.cabeca); if (D.zona) evita.push(D.zona);
      const distSeg = (p, a, c) => { const du = c.u - a.u, dv = c.v - a.v, L2 = du * du + dv * dv || 1, k = clampN(((p.u - a.u) * du + (p.v - a.v) * dv) / L2, 0, 1); return Math.hypot(p.u - a.u - du * k, p.v - a.v - dv * k); };
      let best = { u: b.u, v: b.v + 3 }, bs = -1;
      for (let i = 0; i < 16; i++) for (const r of [4.5, 6]) {
        const a = i / 16 * Math.PI * 2, p = { u: b.u + Math.cos(a) * r, v: b.v + Math.sin(a) * r }; if (Math.abs(p.u) > 8.6 || p.v < 1 || p.v > 29) continue;
        const sc = Math.min(distSeg(p, b, alvo) * 1.2, distSeg(p, cam, alvo), ...evita.map((q) => Math.hypot(p.u - q.u, p.v - q.v)));
        if (sc > bs) { bs = sc; best = p; }
      }
      return best;
    }
    const olharP = (A, u, v) => { const p = W(u, v); A.yawAlvo = Math.atan2(-(p.z - A.z), p.x - A.x); };
    // a direção do lance (da bola para o lugar padrão da mira): a câmera e o jogador se alinham com ela
    function dirLance(m) { const D = m.D, b = D.bola, alvo = D.mira.plano === 'gol' ? { u: 0, v: 0 } : { u: D.mira.u, v: D.mira.v }; let du = alvo.u - b.u, dv = alvo.v - b.v; const d = Math.hypot(du, dv) || 1; return { u: du / d, v: dv / d }; }
    function posicionarJogador(m, inicio) {
      const J = S().jog, D = m.D, b = D.bola, mi = m.mira, alvo = D.mira.plano === 'gol' ? { u: mi.u, v: 0 } : { u: mi.u, v: mi.v };
      let du = alvo.u - b.u, dv = alvo.v - b.v; const d = Math.hypot(du, dv) || 1; du /= d; dv /= d;
      const ru = dv, rv = -du;                                            // "direita" no plano do treino, olhando para a mira (u, v); pé direito: o jogador fica à esquerda da bola
      m.corrida = { de: { u: b.u - du * 1.35 + ru * 0.55, v: b.v - dv * 1.35 + rv * 0.55 }, ate: { u: b.u - du * 0.32 + ru * 0.24, v: b.v - dv * 0.32 + rv * 0.24 }, du, dv };
      if (inicio || m.e === 'mira' || m.e === 'intro') { const p = W(m.corrida.de.u, m.corrida.de.v); J.x = p.x; J.z = p.z; J.y = Y0; J.andando = false; J.correndo = false; const pb = W(b.u, b.v); J.yaw = J.yawAlvo = Math.atan2(-(pb.z - J.z), pb.x - J.x); }
    }
    function cartaoDesafio(m) {
      const U = m.U, D = m.D; U.card.hidden = false; U.card.onclick = null;
      U.card.innerHTML = '<h3>' + esc(trf('Desafio {0}/3', m.k + 1)) + '</h3><p>' + esc(trf(D.desc, ...D.descA)) + '</p><div class="trBt"><button type="button" class="pxBtn pxPrim">' + esc(tr('Bora!')) + '</button></div>';
      U.card.onclick = (e) => { if (e.target.closest && e.target.closest('button')) { if (typeof Som !== 'undefined' && Som.clique) Som.clique(); U.card.hidden = true; m.e = 'mira'; m.t = 0; } };
    }
    function atualizarHud(m) {
      const U = m.U, D = m.D, Sit = m.Sit;
      U.tit.textContent = trf('Situação {0}/30: {1}', Sit.n + 1, tr(Sit.nome));
      U.pips.innerHTML = [0, 1, 2].map((i) => '<i class="' + (m.feitos[i] ? 'ok' : i === m.k ? 'at' : '') + '"></i>').join('');
      U.bolas.innerHTML = Array.from({ length: Math.max(3, m.bolas) }, (_, i) => '<b class="' + (i < m.bolas ? '' : 'vazia') + '"></b>').join('');
      U.desc.textContent = trf(D.desc, ...D.descA);
      U.chuta.textContent = tr(D.tipo === 'chute' ? 'CHUTAR' : D.tipo === 'passe' ? 'PASSAR' : 'CRUZAR');
      U.ef.hidden = D.tipo === 'passe'; U.alto.hidden = !(D.tipo === 'cruz' || (D.tipo === 'passe' && !D.trava));
      U.ef.textContent = m.spin ? tr('Efeito') + (m.spin > 0 ? ' ←' : ' →') : tr('Sem efeito');
      U.alto.textContent = (D.tipo === 'passe' ? (m.alto ? tr('Pelo alto') : tr('Rasteiro')) : (m.alto ? tr('Pelo alto') : tr('Rasteiro'))) + (D.tipo === 'cruz' ? (m.alto ? ' ⤴' : ' ➝') : '');
      if (D.tipo === 'cruz') U.alto.textContent = m.alto ? '⤴ ' + tr('Pelo alto') : '➝ ' + tr('Tenso');
      U.dica.textContent = (matchMedia('(pointer: coarse)').matches ? '' : tr('Setas mira · Espaço força · Q/E efeito · Esc sai') + ' · ') + tr('Arraste para mirar · segure para a força · solte para chutar');
    }
    // ---- a MIRA 3D: um aro com uma cruz (no gol: de pé; no chão: deitado; no alto: deitado na altura, com uma haste até o chão)
    function criarMira() {
      const g = new THREE.Group(), mm = matB('#ffd23a', 0.95), anel = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.26, 28), mm); anel.renderOrder = 8; g.add(anel);
      for (const [w, h] of [[0.6, 0.04], [0.04, 0.6]]) { const c = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mm); c.renderOrder = 8; g.add(c); }
      const haste = new THREE.Mesh(new THREE.BoxGeometry(0.025, 1, 0.025), matB('#ffd23a', 0.55)); grupo().add(haste);
      const sombra = new THREE.Mesh(new THREE.RingGeometry(0.16, 0.22, 24), matB('#2a1206', 0.45)); sombra.rotation.x = -Math.PI / 2; sombra.renderOrder = 4; grupo().add(sombra);
      for (const o of g.children) { o.material.depthTest = false; }
      grupo().add(g); return { g, haste, sombra };
    }
    function porMira(m, u, y, v) {
      const D = m.D, R = m.ret, p = W(u, D.mira.plano === 'gol' ? 0.02 : v);
      R.g.visible = true; R.g.position.set(p.x, Y0 + (D.mira.plano === 'chao' ? 0.03 : y), p.z);
      { const b = D.bola, dd = Math.hypot(u - b.u, (D.mira.plano === 'gol' ? 0 : v) - b.v), k = clampN(dd / 8, 1, 2.6); R.g.scale.set(k, k, k); R.sombra.scale.set(k, k, k); }   // de longe a mira cresce (senão some na tela)
      if (D.mira.plano === 'gol') { R.g.rotation.set(0, 0, 0); R.haste.visible = false; R.sombra.visible = false; }
      else { R.g.rotation.set(-Math.PI / 2, 0, 0); const alto = D.mira.plano === 'alto'; R.haste.visible = alto; R.sombra.visible = alto; if (alto) { R.haste.scale.y = y; R.haste.position.set(p.x, Y0 + y / 2, p.z); R.sombra.position.set(p.x, Y0 + 0.025, p.z); } }
    }
    // ---- entrada: arrastar (mira), segurar o botão (força), botões e teclado
    function ligarEntrada(m) {
      const U = m.U;
      let drag = null;
      U.arr.onpointerdown = (e) => { if (m.e !== 'mira' && m.e !== 'carrega') return; drag = { id: e.pointerId, x: e.clientX, y: e.clientY }; try { U.arr.setPointerCapture(e.pointerId); } catch (er) { /* ok */ } };
      U.arr.onpointermove = (e) => { if (!drag || e.pointerId !== drag.id) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.x = e.clientX; drag.y = e.clientY; moverMira(m, dx, dy); };
      U.arr.onpointerup = U.arr.onpointercancel = (e) => { if (drag && e.pointerId === drag.id) drag = null; };
      const solta = () => { if (m.e === 'carrega') soltar(m); };
      U.chuta.onpointerdown = (e) => { e.preventDefault(); try { U.chuta.setPointerCapture(e.pointerId); } catch (er) { /* ok */ } if (m.e === 'mira') { m.e = 'carrega'; m.t = 0; m.fase = Math.random() * 6.28; } };
      U.chuta.onpointerup = U.chuta.onpointercancel = (e) => { e.preventDefault(); solta(); };
      U.ef.onclick = () => { if (m.e !== 'mira') return; m.spin = m.spin === 0 ? 1 : m.spin === 1 ? -1 : 0; if (typeof Som !== 'undefined' && Som.clique) Som.clique(); atualizarHud(m); };
      U.alto.onclick = () => { if (m.e !== 'mira') return; m.alto = !m.alto; if (typeof Som !== 'undefined' && Som.clique) Som.clique(); atualizarHud(m); };
      U.sair.onclick = () => sairTreino(m);
      m.teclaFn = (e) => {
        if (!P.mg || document.getElementById('anuncioTela') && !document.getElementById('anuncioTela').hidden) return;
        const desce = e.type === 'keydown', c = e.code;
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyA', 'KeyD', 'KeyW', 'KeyS'].includes(c)) { e.preventDefault(); e.stopImmediatePropagation(); m.tecla[c] = desce; return; }
        if (c === 'Space' || c === 'Enter') { e.preventDefault(); e.stopImmediatePropagation(); if (e.repeat) return; if (!U.card.hidden && desce) { const b = U.card.querySelector('button'); if (b) b.click(); return; } if (desce && m.e === 'mira') { m.e = 'carrega'; m.t = 0; m.fase = Math.random() * 6.28; } else if (!desce) solta(); return; }
        if (desce && (c === 'KeyQ' || c === 'KeyE') && m.e === 'mira' && m.D.tipo !== 'passe') { e.preventDefault(); m.spin = c === 'KeyQ' ? (m.spin === 1 ? 0 : 1) : (m.spin === -1 ? 0 : -1); atualizarHud(m); }
        if (desce && c === 'Tab' && m.e === 'mira' && !U.alto.hidden) { e.preventDefault(); U.alto.click(); }
        if (c === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); if (desce) sairTreino(m); }   // (6.6.19) o Esc é do treino (não abre a pausa do jogo)
      };
      window.addEventListener('keydown', m.teclaFn, true); window.addEventListener('keyup', m.teclaFn, true);
    }
    function desligarEntrada(m) { if (m.teclaFn) { window.removeEventListener('keydown', m.teclaFn, true); window.removeEventListener('keyup', m.teclaFn, true); } }
    // arrastar: o ponto da mira anda na tela como o dedo (na distância em que ela está)
    function moverMira(m, dx, dy) {
      const D = m.D, cam = typeof camera !== 'undefined' ? camera : null, mi = m.mira; if (!cam) return;
      const p = W(mi.u, D.mira.plano === 'gol' ? 0 : mi.v), py = Y0 + (D.mira.plano === 'chao' ? 0 : mi.y), ox = 0;
      const dist = Math.hypot(cam.position.x - (p.x + ox), cam.position.y - py, cam.position.z - p.z), k = 2 * Math.tan((cam.fov * Math.PI / 180) / 2) * dist / Math.max(200, innerHeight);
      const fx = Math.cos(cam.rotation.y), fz = 0; void fx; void fz;
      const dir = new THREE.Vector3(); cam.getWorldDirection(dir); const rx = -dir.z, rz = dir.x, rl = Math.hypot(rx, rz) || 1;   // a "direita" da câmera no chão
      if (D.mira.plano === 'gol') { mi.u += (rx / rl) * dx * k; mi.y -= dy * k; }
      else { const fl = Math.hypot(dir.x, dir.z) || 1, kv = k / Math.max(0.3, Math.abs(dir.y) + 0.25); const wx = (rx / rl) * dx * k + (dir.x / fl) * -dy * kv, wz = (rz / rl) * dx * k + (dir.z / fl) * -dy * kv; mi.u += wx; mi.v -= wz; }
      limitarMira(m);
    }
    function limitarMira(m) {
      const D = m.D, mi = m.mira;
      if (D.mira.plano === 'gol') { mi.u = clampN(mi.u, -4.2, 4.2); mi.y = clampN(mi.y, 0.15, 3.4); }
      else { mi.u = clampN(mi.u, -9, 9); mi.v = clampN(mi.v, 0.3, 29.5); if (D.mira.plano === 'alto') mi.y = D.mira.y; }
    }
    function teclasMira(m, dt) {
      const T_ = m.tecla, D = m.D, cam = typeof camera !== 'undefined' ? camera : null; if (!cam) return;
      const h = (T_.ArrowRight || T_.KeyD ? 1 : 0) - (T_.ArrowLeft || T_.KeyA ? 1 : 0), vt = (T_.ArrowUp || T_.KeyW ? 1 : 0) - (T_.ArrowDown || T_.KeyS ? 1 : 0);
      if (!h && !vt) return;
      const px = 260 * dt; moverMira(m, h * px, -vt * px * (D.mira.plano === 'gol' ? 1 : 1));
    }
    function soltar(m) {
      const D = m.D, p = m.p, at = atributos(), off = balancoMira(m), b = D.bola;
      m.inp = { u: m.mira.u + off.u, v: m.mira.v + off.v, y: m.mira.y + off.y, p, spin: D.tipo === 'passe' ? 0 : m.spin, alto: m.alto, erroA: gaussR() * 0.003, erroV: gaussR() * 0.012 };
      if (D.mira.plano === 'gol') m.inp.v = 0; if (D.mira.plano === 'chao') m.inp.y = 0;
      void at; void b;
      m.e = 'corrida'; m.t = 0; S().jog.correndo = true;
      for (const d of m.prev) d.visible = false;
    }
    function gaussR() { let u = 0, v = 0; while (u === 0) u = Math.random(); while (v === 0) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
    // o balanço da mira enquanto segura (em metros, no plano da mira)
    function balancoMira(m) {
      if (m.e !== 'carrega' && m.e !== 'corrida') return { u: 0, v: 0, y: 0 };
      const D = m.D, b = D.bola, at = atributos(), amp = L.balanco(D, m.p, at), dist = Math.hypot(m.mira.u - b.u, (D.mira.plano === 'gol' ? 0 : m.mira.v) - b.v), a = m.tw || 0;
      const s1 = Math.sin(1.7 * a + (m.fase || 0)) * amp * dist, s2 = Math.sin(2.3 * a + 1 + (m.fase || 0) * 0.7) * amp * dist;
      if (D.mira.plano === 'gol') return { u: s1, v: 0, y: s2 };
      const dl = dirLance(m); return { u: s1 * dl.v + s2 * dl.u * 0.5, v: -s1 * dl.u + s2 * dl.v * 0.5, y: 0 };
    }
    // a força "certa" na barra (a marquinha): passe rasteiro = chegar redondo no companheiro / parar no círculo
    function forcaMarca(m) {
      const D = m.D, at = atributos(), mi = m.mira, b = D.bola;
      if (D.tipo === 'passe' && !(D.trava ? D.trava === 'alto' : m.alto)) {
        const d = Math.hypot(mi.u - b.u, mi.v - b.v), vArr = D.crit === 'para' ? 0 : (D.recebe ? D.recebe.ctrl * 0.55 : 3), v0 = Math.sqrt(2 * 2.2 * d + vArr * vArr);
        let lo = 0, hi = 1; for (let i = 0; i < 22; i++) { const q = (lo + hi) / 2; if (L.velDe(D, q, at, false) < v0) lo = q; else hi = q; } return (lo + hi) / 2;
      }
      return L.forcaCerta(D, mi, at, D.tipo === 'passe' ? (D.trava ? D.trava === 'alto' : m.alto) : m.alto);
    }

    // =====================================================================================================================
    // O QUADRO A QUADRO DO TREINO
    // =====================================================================================================================
    function tickMg(dt) {
      const m = P.mg; if (!m) return;
      const D = m.D, U = m.U, T_ = TT(), J = S().jog, b = D.bola;
      m.t += dt; if (m.e !== 'intro' && m.e !== 'semBola' && m.e !== 'fimSit') m.tD += dt;
      if (m.e === 'mira' || m.e === 'carrega') { teclasMira(m, dt); posicionarJogador(m); }
      if (m.e === 'carrega') { m.tw = (m.tw || 0) + dt; m.p = L.forcaEm(D, m.t); if (Math.floor(m.t * 12) !== m.tick12) { m.tick12 = Math.floor(m.t * 12); SOM.carga(m.p); } }
      else if (m.e === 'mira') { m.p = 0; m.tw = 0; }
      // a barra e a marquinha da força certa
      U.barra.style.height = (m.p * 100).toFixed(1) + '%';
      const fm = (m.e === 'mira' || m.e === 'carrega') ? forcaMarca(m) : null; U.marca.style.display = fm != null ? 'block' : 'none'; if (fm != null) U.marca.style.bottom = 'calc(' + (fm * 100).toFixed(1) + '% - 1px)';
      const mostraCtl = m.e === 'mira' || m.e === 'carrega'; U.chuta.disabled = !mostraCtl; U.ef.disabled = U.alto.disabled = m.e !== 'mira';
      // o que anda sozinho: aros, janela, cones, aro do cruzamento, quem corre
      animarProps(m);
      // a mira (com o balanço) e o começo da trajetória
      const off = balancoMira(m);
      if (mostraCtl) {
        porMira(m, m.mira.u + off.u, m.mira.y + off.y, m.mira.v + off.v);
        const inp = { u: m.mira.u + off.u, v: m.mira.v + off.v, y: m.mira.y + off.y, p: m.e === 'carrega' ? m.p : (fm != null ? fm : 0.5), spin: D.tipo === 'passe' ? 0 : m.spin, alto: m.alto };
        if (D.mira.plano === 'gol') inp.v = 0;
        const pts = L.previa(D, inp, atributos(), 0.45 * (D.tipo === 'passe' ? 1.6 : 1));
        m.prev.forEach((d, i) => { const q = pts[Math.min(pts.length - 1, Math.floor((i + 1) / m.prev.length * pts.length * 0.7))]; if (!q || !pts.length) { d.visible = false; return; } const w = W(q.u, q.v); d.position.set(w.x, Y0 + q.y, w.z); d.visible = true; });
      } else { m.ret.g.visible = m.ret.haste.visible = m.ret.sombra.visible = false; for (const d of m.prev) d.visible = false; }
      // ---- a corrida e o chute
      if (m.e === 'corrida') {
        const c = m.corrida, k = clampN(m.t / ATRASO, 0, 1), a = W(c.de.u, c.de.v), z = W(c.ate.u, c.ate.v);
        J.x = lerpN(a.x, z.x, k); J.z = lerpN(a.z, z.z, k); const pb = W(b.u, b.v); J.yaw = J.yawAlvo = Math.atan2(-(pb.z - J.z), pb.x - J.x); J.andando = true; J.correndo = true; J.vel = 4;
        if (k >= 1) { J.andando = false; J.correndo = false; const al = W(m.inp.u, D.mira.plano === 'gol' ? 0 : m.inp.v); J.yaw = J.yawAlvo = Math.atan2(-(al.z - J.z), al.x - J.x); pose(J, 'chute', { estilo: D.tipo === 'passe' ? (m.alto ? 'peito' : 'passe') : D.tipo === 'cruz' ? 'cruz' : m.inp.p > 0.62 ? 'peito' : 'chapa' }); m.e = 'batida'; m.t = 0; }
      } else if (m.e === 'batida') {
        if (m.t >= 0.12) { m.J = L.jogada(D, m.inp, atributos(), m.tD); m.acc = 0; m.e = 'voo'; m.t = 0; SOM.chute(0.5 + 0.6 * m.inp.p); vib(25); m.quiques = 0; }
      } else if (m.e === 'voo' || m.e === 'pos') {
        const Jg = m.J, Bj = Jg.B; m.acc += dt;
        while (m.acc >= L.DT) {
          m.acc -= L.DT;
          if (!Jg.fim) { L.passo(Jg, L.DT); if (Jg.fim) resultado(m); }
          else depois(m, L.DT);
        }
        const giro = Math.hypot(Bj.vu, Bj.vv) * dt * 2.2; porBola(m.B, Bj.u, Bj.y, Bj.v, giro);
        if ((Bj.quicou || 0) > m.quiques) { m.quiques = Bj.quicou; SOM.quica(); }
        atoresNaJogada(m, dt);
        if (m.e === 'pos' && m.t > 2.1) proximo(m);
      }
      cameraMg(m, dt);
      void T_;
    }
    // o que acontece com a bola DEPOIS de decidido (rede, defesa, rebote...): só física, sem decidir mais nada
    function depois(m, dt) {
      const Jg = m.J, Bj = Jg.B, D = m.D;
      if (m.res && m.res.gol) {                                          // dentro do gol: a rede segura
        L.passoBola(Bj, dt); if (Bj.v < -0.95) { Bj.v = -0.95; Bj.vv = Math.abs(Bj.vv) * 0.05; Bj.vu *= 0.6; } if (Bj.y > 2.1) { Bj.y = 2.1; Bj.vy = -Math.abs(Bj.vy) * 0.2; }
        return;
      }
      if (Jg.gk && Jg.gk.pegou && Jg.gk.encaixe) { Bj.u = Jg.gk.u; Bj.v = Jg.gk.v + 0.3; Bj.y = D.goleiro.modo === 'sai' ? 1.15 : 1.0; Bj.voa = Bj.rola = false; return; }
      if (m.res && m.res.dominou) { Bj.voa = false; Bj.rola = false; const r = Jg.rc || Jg.cb; if (r) { Bj.u = lerpN(Bj.u, r.u + 0.3, dt * 6); Bj.v = lerpN(Bj.v, r.v - 0.2, dt * 6); Bj.y = lerpN(Bj.y, L.RB, dt * 8); } return; }
      if (m.res && m.res.cabecada) { L.passoBola(Bj, dt); if (Bj.v < -0.95) { Bj.v = -0.95; Bj.vv = 0; Bj.vu *= 0.6; } return; }
      L.passoBola(Bj, dt);
      if (Bj.v < -1.0 && Math.abs(Bj.u) > 2.6) { Bj.v = -1.0; Bj.vv = Math.abs(Bj.vv) * 0.25; }
      if (Math.abs(Bj.u) > 11.5) { Bj.u = Math.sign(Bj.u) * 11.5; Bj.vu = -Bj.vu * 0.25; }
      if (Bj.v > 30.5) { Bj.v = 30.5; Bj.vv = -Bj.vv * 0.25; }
    }
    // decidiu: mostra, toca o som, mexe em quem participou
    function resultado(m) {
      const Jg = m.J, D = m.D, T_ = TT(), ok = Jg.ok, mot = Jg.motivo, U = m.U, Bj = Jg.B;
      m.res = { ok, mot, gol: mot === 'GOL!' || mot === 'GOL DE CABEÇA!', dominou: mot === 'DOMINOU!', cabecada: mot === 'GOL DE CABEÇA!' };
      if (mot === 'GOL!') SOM.rede(); else if (mot === 'Na trave!') SOM.trave(); else if (mot === 'Defendeu!' || mot === 'O goleiro pegou!' || mot === 'Interceptado!' || mot === 'O zagueiro cortou!' || mot === 'Na barreira!' || mot === 'Nas placas!') SOM.defesa();
      if (ok) { SOM.acerto(); vib([30, 40, 30]); } else { setTimeout(() => SOM.erro(), 250); }
      U.msg.textContent = tr(mot); U.msg.className = 'trMsg on ' + (ok ? 'ok' : 'no');
      m.e = 'pos'; m.t = 0;
      const [Ju, To] = T_.bat, K = T_.gol, Jg_ = S().jog;
      if (m.res.dominou) { if (Jg.altoP) pose(Ju, 'peito'); else pose(Ju, 'dominio'); }
      if (m.res.cabecada) {                                              // cabeceou: a bola vai para o gol (o Paredão saiu ou não alcança)
        pose(Ju, 'cabeceio'); const alvoU = (Math.random() < 0.5 ? -1 : 1) * (0.9 + Math.random() * 1.1), du = alvoU - Bj.u, dv = -Bj.v, d = Math.hypot(du, dv) || 1;
        Bj.vu = du / d * 11; Bj.vv = dv / d * 11; Bj.vy = -1.2; Bj.au = Bj.av = 0; Bj.voa = true; SOM.toque(); setTimeout(() => { if (P.mg === m) SOM.rede(); }, Math.min(1600, d / 11 * 1000));
      }
      if (Jg.corte != null) { const o = m.mkObj[Jg.corte]; if (o && o.npc) pose(o.npc, Bj.y > 1.1 ? 'pula' : 'dominio'); }
      if (ok) { setTimeout(() => { if (P.mg === m) { pose(To, 'aplaude'); if (!D.goleiro) pose(K, 'aplaude'); } }, 300); pose(Jg_, 'comemora', { dur: 1.1 }); }
      else if (!Jg.gk || !Jg.gk.pegou) setTimeout(() => { if (P.mg === m) pose(Jg_, 'lamenta', { dur: 1.2 }); }, 350);
      if (Jg.gk && Jg.gk.pegou && Jg.gk.encaixe && D.goleiro.modo === 'sai') pose(K, Bj.y > 1.6 ? 'pula' : 'encaixe');
    }
    // NPCs na jogada (as posições vêm da lógica)
    function atoresNaJogada(m, dt) {
      const Jg = m.J, D = m.D, T_ = TT(), [Ju, To] = T_.bat, K = T_.gol;
      if (Jg.gk) {
        if (D.goleiro.modo === 'gol') goleiroSegue(K, Jg, dt);
        else { const p = W(Jg.gk.u, Jg.gk.v), dx = p.x - K.x, dz = p.z - K.z, d = Math.hypot(dx, dz); if (d > 0.01 && !(K.pf && (K.pf.tipo === 'encaixe' || K.pf.tipo === 'pula'))) { K.x = p.x; K.z = p.z; K.yawAlvo = Math.atan2(-dz, dx); K.yaw = K.yawAlvo; limparPose(K); K.andando = true; K.correndo = true; K.vel = 4; } else K.andando = false; }
      }
      if (Jg.rc && D.recebe) { const p = W(Jg.rc.u, Jg.rc.v); if (Math.hypot(p.x - Ju.x, p.z - Ju.z) > 0.01) { const dx = p.x - Ju.x, dz = p.z - Ju.z; Ju.x = p.x; Ju.z = p.z; if (D.recebe.corre) { Ju.yawAlvo = Math.atan2(-dz, dx); Ju.andando = true; Ju.correndo = true; Ju.vel = 4; } } else Ju.andando = false; if (Jg.fim) Ju.andando = false; }
      if (Jg.cb && D.cabeca) {
        const p = W(Jg.cb.u, Jg.cb.v), dx = p.x - Ju.x, dz = p.z - Ju.z; if (Math.hypot(dx, dz) > 0.01 && !Jg.fim) { Ju.x = p.x; Ju.z = p.z; if (D.cabeca.corre) { Ju.yawAlvo = Math.atan2(-dz, dx); Ju.andando = true; Ju.correndo = true; Ju.vel = 4.5; } }
        if (Jg.cb.pula > 0.4 && (!Ju.pf || Ju.pf.tipo === 'espera') && !Jg.fim) { Ju.andando = false; const pb = W(m.J.B.u, m.J.B.v); Ju.yawAlvo = Math.atan2(-(pb.z - Ju.z), pb.x - Ju.x); pose(Ju, 'cabeceio', { alto: 0.5 }); }
      }
      if (Jg.mk) Jg.mk.forEach((g, i) => {
        const o = m.mkObj[i], p = W(g.u, g.v); if (!o) return;
        if (o.npc) { const A = o.npc, dx = p.x - A.x, dz = p.z - A.z, d = Math.hypot(dx, dz); A.x = p.x; A.z = p.z; if (d > 0.004 && !Jg.fim) { A.andando = true; A.correndo = true; A.vel = 3.5; A.yawAlvo = Math.atan2(-dz, dx); } else A.andando = false; if (g.pula > 0.5 && (!A.pf || A.pf.tipo === 'espera')) pose(A, 'pula'); }
        else if (o.g) { o.g.position.set(p.x, Y0 + (g.pula > 0.3 ? Math.sin(Math.min(1, g.pula) * Math.PI) * 0.35 : 0), p.z); }
      });
      void To;
    }
    // o que anda sozinho no campo (com o tempo do desafio)
    function animarProps(m) {
      const D = m.D, t = m.tD, T_ = TT(), Ju = T_.bat[0];
      if (m.aros) D.alvos.forEach((a, i) => { const P_ = L.posAlvo(a, t), g = m.aros[i], w = W(P_.u, 0.05); g.position.set(w.x, Y0 + P_.y, w.z); const cd = g.userData.corda, top = L.GOL_H + 0.06 - P_.y - a.r; cd.scale.y = Math.max(0.05, top); cd.position.y = a.r + top / 2; if (m.J && m.J.alvoHit === a && m.res) { g.rotation.x += 0.15; } });
      if (m.placas) {
        const P_ = L.posJanela(D.janela, t), w = D.janela.w, h = D.janela.h, GW = L.GOL_W, GH = L.GOL_H, u0 = P_.u - w / 2, u1 = P_.u + w / 2, y0 = P_.y - h / 2, y1 = P_.y + h / 2;
        const rects = [[-GW, u0, 0, GH], [u1, GW, 0, GH], [u0, u1, 0, y0], [u0, u1, y1, GH]];
        rects.forEach(([a, bq, c, d], i) => { const pl = m.placas[i], lw = Math.max(0.001, bq - a), lh = Math.max(0.001, d - c), wp = W((a + bq) / 2, -0.06); pl.visible = lw > 0.01 && lh > 0.01; pl.scale.set(lw, lh, 1); pl.position.set(wp.x, Y0 + (c + d) / 2, wp.z); });
      }
      if (m.conesObj) { const C = L.posCones(D.cones, t); [C.a, C.b].forEach((c, i) => { const w = W(c.u, c.v); m.conesObj[i].position.set(w.x, Y0 + 0.18, w.z); }); }
      if (m.aroObj) { const P_ = L.posAro(D.aro, t), w = W(P_.u, P_.v), b = W(D.bola.u, D.bola.v); m.aroObj.position.set(w.x, Y0 + P_.y, w.z); m.aroObj.rotation.y = Math.atan2(b.x - w.x, b.z - w.z); const ps = m.aroObj.userData.poste, hgt = P_.y - D.aro.r; ps.scale.y = hgt; ps.position.y = -D.aro.r - hgt / 2; }
      // quem corre antes do chute (Juninho no passe/cruzamento "correndo")
      if (!m.J || m.e === 'mira' || m.e === 'carrega' || m.e === 'corrida' || m.e === 'batida' || m.e === 'intro') {
        const C = (D.recebe && D.recebe.corre) || (D.cabeca && D.cabeca.corre);
        if (C && m.e !== 'intro') { const p0 = L.posCorre(C, t), p1 = L.posCorre(C, t + 0.05), w = W(p0.u, p0.v), w1 = W(p1.u, p1.v); const mv = Math.hypot(w1.x - w.x, w1.z - w.z) > 0.01; Ju.x = w.x; Ju.z = w.z; Ju.andando = mv; Ju.correndo = mv; Ju.vel = 4; if (mv) { Ju.yawAlvo = Math.atan2(-(w1.z - w.z), w1.x - w.x); if (Ju.pf && Ju.pf.tipo === 'espera') limparPose(Ju); } else if (!Ju.pf) { pose(Ju, 'espera'); olharP(Ju, D.bola.u, D.bola.v); } }
      }
    }
    // ---- a câmera: atrás da bola, por cima do ombro; no voo acompanha a bola
    function cameraMg(m, dt) {
      const s = S(), D = m.D, b = D.bola, dl = dirLance(m), ru = dl.v, rv = -dl.u;
      const back = D.tipo === 'chute' ? 4.6 : 5.4, alt = D.tipo === 'chute' ? 2.55 : 3.3;   // do outro lado da bola (o jogador fica do lado do pé de apoio): ele não tampa a mira
      let cu = b.u - dl.u * back - ru * 1.0, cv = b.v - dl.v * back - rv * 1.0;
      const cu2 = clampN(cu, -8.3, 8.3), cv2 = clampN(cv, 0.8, 29.2), sobra = Math.hypot(cu - cu2, cv - cv2); cu = cu2; cv = cv2;   // nunca atrás do alambrado: encosta na linha e sobe
      const pc = W(cu, cv), altF = alt + Math.min(2.2, sobra * 0.7);
      let foco;
      if (D.mira.plano === 'gol') foco = { u: lerpN(b.u, 0, 0.72), v: lerpN(b.v, 0, 0.72), y: 1.05 };
      else { const alvo = D.mira; foco = { u: lerpN(b.u, alvo.u, 0.6), v: lerpN(b.v, alvo.v, 0.6), y: 0.9 }; }
      if (m.J && (m.e === 'voo' || m.e === 'pos')) { const Bj = m.J.B, k = 0.35; foco = { u: lerpN(foco.u, Bj.u, k), v: lerpN(foco.v, Bj.v, k), y: lerpN(foco.y, Bj.y, k) }; }
      const pf = W(foco.u, foco.v), alvoC = { px: pc.x, py: Y0 + altF, pz: pc.z, tx: pf.x, ty: Y0 + foco.y, tz: pf.z };
      if (!m.cam || m.camSnap) { m.cam = Object.assign({}, alvoC); m.camSnap = false; }
      else { if (m.abertura && m.e !== 'intro') m.abertura = false; const k = 1 - Math.exp(-dt * (m.abertura ? 1.5 : 5)); for (const q in alvoC) m.cam[q] += (alvoC[q] - m.cam[q]) * k; }   // a abertura desce devagar
      s.camCena = m.cam;
    }
    // ---- o que vem depois do resultado: outra bola, outro desafio, o fim
    function proximo(m) {
      const U = m.U; U.msg.className = 'trMsg';
      const T_ = TT(); for (const A of [T_.gol].concat(T_.bat)) { if (A.pf && A.pf.tipo === 'mergulho') limparPose(A); }
      if (m.res.ok) {
        m.feitos[m.k] = true; SOM.apito();
        if (m.k < 2) { U.msg.textContent = trf('Desafio {0} feito!', m.k + 1); U.msg.className = 'trMsg on ouro'; m.e = 'intervalo'; m.t = 0; setTimeout(() => { if (P.mg === m) { U.msg.className = 'trMsg'; montarDesafio(m, m.k + 1); m.camSnap = true; } }, 1200); return; }
        concluir(m); return;
      }
      m.bolas--; atualizarHud(m);
      if (m.bolas <= 0) { semBola(m); return; }
      reporBola(m);
    }
    function reporBola(m) {
      const D = m.D; m.J = null; m.res = null; m.e = 'mira'; m.t = 0;
      porBola(m.B, D.bola.u, L.RB, D.bola.v); papeis(m); posicionarJogador(m, true); limparPose(S().jog);
    }
    // sem bola: o anúncio de 15 s (+1) ou de 30 s (+3), ou desiste
    function semBola(m) {
      const U = m.U; m.e = 'semBola';
      U.card.hidden = false;
      U.card.innerHTML = '<h3>' + esc(tr('Acabaram as bolas!')) + '</h3><p>' + esc(tr('Faltou pouco. Quer mais bola?')) + '</p>' +
        '<div class="trBt" style="flex-direction:column;align-items:center"><button type="button" class="pxBtn pxPrim" data-a="15">' + esc(tr('Anúncio de 15 s: +1 bola')) + '</button>' +
        '<button type="button" class="pxBtn pxPrim" data-a="30">' + esc(tr('Anúncio de 30 s: +3 bolas')) + '</button><button type="button" class="pxBtn" data-a="sai">' + esc(tr('Desistir')) + '</button></div><p class="trAv"></p>';
      let ocupado = false;
      U.card.onclick = async (e) => {
        const bt = e.target.closest && e.target.closest('button'); if (!bt || ocupado) return; if (typeof Som !== 'undefined' && Som.clique) Som.clique();
        const a = bt.dataset.a;
        if (a === 'sai') { U.card.hidden = true; terminar(m, 'falhou'); return; }
        ocupado = true; const seg = +a, mais = seg === 15 ? 1 : 3;
        let visto = false;
        try { visto = typeof Anuncios !== 'undefined' && await Anuncios.filme(seg, { nome: 'treino-' + seg, tit: tr(mais === 1 ? 'Bola extra' : 'Bolas extras'), txt: tr(mais === 1 ? 'Assista até o fim para ganhar a bola.' : 'Assista até o fim para ganhar as 3 bolas.'), fim: tr('Pronto! Bola na marca.') }); } catch (er) { visto = false; }
        ocupado = false;
        if (P.mg !== m) return;
        if (!visto) { const av = U.card.querySelector('.trAv'); if (av) av.textContent = tr('Nenhum anúncio disponível agora. Tenta de novo daqui a pouco.'); return; }
        U.card.hidden = true; m.bolas += mais; atualizarHud(m); reporBola(m);
      };
    }
    // fechou os 3: +0,1 na habilidade (só da primeira vez de cada situação) e a turma comemora
    function concluir(m) {
      const p = dados(), Sit = m.Sit, U = m.U, T_ = TT(); let txt2 = '';
      if (!m.rep && p.prog[Sit.tipo] === Sit.n) {
        const at = atributos(), nome = Sit.atrib, novo = Math.min(10, Math.round(((at[nome] || 5) + 0.1) * 10) / 10);
        at[nome] = novo; p.ganhos[nome] = Math.round(((p.ganhos[nome] || 0) + 0.1) * 10) / 10; p.prog[Sit.tipo] = Sit.n + 1;
        txt2 = trf('+0,1 em {0} (agora {1})', tr(L.NOME_ATRIB[nome]), virg(novo)); gravar();
        try { if (api.ganhoNaTela) api.ganhoNaTela(txt2); } catch (e) { /* sem efeito */ }
      }
      SOM.festa(); vib([40, 50, 40, 50, 120]);
      for (const A of T_.bat) pose(A, 'comemora', { dur: 2.2 }); pose(T_.gol, 'aplaude', { dur: 2.2 }); pose(S().jog, 'comemora', { dur: 2.2 });
      m.e = 'fimSit'; U.card.hidden = false;
      U.card.innerHTML = '<h3>' + esc(tr('SITUAÇÃO CONCLUÍDA!')) + '</h3><p>' + esc(trf('Situação {0}/30: {1}', Sit.n + 1, tr(Sit.nome))) + '</p>' + (txt2 ? '<p class="trPr">' + esc(txt2) + '</p>' : '<p class="trPr">' + esc(tr('Repetição: sem ganhar habilidade.')) + '</p>') +
        '<div class="trBt"><button type="button" class="pxBtn pxPrim">' + esc(tr('Continuar')) + '</button></div>';
      U.card.onclick = (e) => { if (e.target.closest && e.target.closest('button')) { if (typeof Som !== 'undefined' && Som.clique) Som.clique(); U.card.hidden = true; terminar(m, 'ok'); } };
    }
    function terminar(m, como) { if (m.acabou) return; m.acabou = true; if (m.fim) m.fim(como); }
    async function sairTreino(m) {
      if (m.e === 'semBola' || m.e === 'fimSit' || m.saindo) return; m.saindo = true;
      const U = m.U, antes = m.e; m.e = 'pausa';
      U.card.hidden = false;
      U.card.innerHTML = '<p>' + esc(tr('Sair do treino? Conta como um dos 2 de hoje.')) + '</p><div class="trBt"><button type="button" class="pxBtn" data-r="1">' + esc(tr('Sair')) + '</button><button type="button" class="pxBtn pxPrim" data-r="0">' + esc(tr('Continuar')) + '</button></div>';
      U.card.onclick = (e) => { const b = e.target.closest && e.target.closest('button'); if (!b) return; if (typeof Som !== 'undefined' && Som.clique) Som.clique(); U.card.hidden = true; m.saindo = false; if (b.dataset.r === '1') terminar(m, 'saiu'); else m.e = antes === 'carrega' ? 'mira' : antes; };
    }


    // ---- COMEÇA: a cidade para e some, o campo aparece; a câmera desce do alto, atrás do gol, e o nome do CT aparece
    await api.preto(true, 350);
    api.suspenderTreino(quadro); campo.g.visible = true; trazerAtores();                // (a cidade esconde o que está na cena: o campo volta a aparecer)
    const U = montarHud(), B = novaBola();
    const m = P.mg = { Sit, rep, k: 0, D: null, U, B, bolas: 3, e: 'intro', t: 0, tD: 0, mira: null, p: 0, spin: 0, alto: false, seg: false, J: null, props: [], tecla: {}, feitos: [false, false, false], cam: null, prev: [] };
    for (let i = 0; i < 12; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 4), matB('#fff0c8', 0.75)); d.visible = false; d.renderOrder = 6; grupo().add(d); m.prev.push(d); }
    m.ret = criarMira(); ligarEntrada(m);
    montarDesafio(m, 0);
    m.cam = { px: 0, py: 12, pz: 10, tx: 0, ty: 0.5, tz: -12 }; m.abertura = true; U.card.hidden = true;
    U.msg.textContent = tr('CT DO SEU NONATO'); U.msg.className = 'trMsg on ouro';
    quadro(0.016);
    await api.preto(false, 450);
    setTimeout(() => { if (P.mg === m && !m.acabou) { U.msg.className = 'trMsg'; if (m.e === 'intro') U.card.hidden = false; } }, 2100);
    const fim = await new Promise((ok) => { m.fim = ok; });
    // ---- ACABOU: tudo volta para a cidade como estava
    await api.preto(true, 350);
    desligarEntrada(m); limparDesafio(m); tirar(B.m); if (B.sb && B.sb.parent) B.sb.parent.remove(B.sb);
    for (const o of [m.ret.g, m.ret.haste, m.ret.sombra].concat(m.prev)) tirar(o);
    U.el.remove(); P.mg = null;
    for (const g of guardados) {
      const A = g.A; limparPose(A); A.andando = false; A.correndo = false;
      A.x = g.x; A.z = g.z; A.y = g.y; A.yaw = A.yawAlvo = g.yaw; A.goleiro = g.gol;
      if (g.pr) g.pr.add(A.m.raiz); else if (A.m.raiz.parent) A.m.raiz.parent.remove(A.m.raiz);
      if (A.blob) { if (g.pb) g.pb.add(A.blob); A.blob.visible = g.vb; }
      A.m.raiz.visible = g.vr; A.m.longe = g.longe; if (A.anel) A.anel.visible = g.an;
    }
    campo.limpar(); for (const k in MATS) MATS[k].dispose();
    api.retomarTreino(); if (window.__treinoCampo === dbg) window.__treinoCampo = null;
    return fim;
  }

  window.FutebolJS.registrarFase({ id: 'treinoCampo', nome: 'Campo de treino', nucleoMinimo: '6.6.19', iniciar: async () => {}, sessao });
})();
