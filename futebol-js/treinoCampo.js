/* =====================================================================
   FUTEBOL JS · treinoCampo.js · O TREINO DO SEU NONATO NA PARTIDA DE VERDADE (arquivo SEPARADO, como treino.js e pesca.js)
   ---------------------------------------------------------------------
   6.6.19 — primeira versão.
   - Registrado com FutebolJS.registrarFase({ id: 'treinoCampo' }) só para o jogo saber baixar o arquivo; NÃO roda como fase.
     O treino.js baixa este arquivo quando o jogador escolhe uma situação e chama sessao(ctx): ctx traz a lógica (LOGICA: os desafios),
     os sons, os textos, o HUD e o progresso salvo; a sessão devolve 'ok' (fechou os 3), 'falhou' ou 'saiu'.
   - O TREINO É JOGADO NO MOTOR DA PARTIDA (Historia.desafio do jogo.js): a cidade sai de cena como no racha do sintético
     (api.sairParaPartida / api.voltarDaPartida), o campo é o da VÁRZEA da cidade ((7.6.3) campo 'varzeaCidade'; antes o society) e
     os bonecos são os da partida: você e o Juninho de colete, o Paredão no gol e o Tonhão (mais três da turma para a barreira) de azul.
   - CADA TENTATIVA É UMA COBRANÇA SUA, COM O SISTEMA DE CHUTE DA PARTIDA ((7.6.3) no CHUTE é a cobrança de falta: direção arrastando,
     efeito na barra e força segurando o CHUTAR, com o pontilhado até a barreira; no passe e no cruzamento: a seta, a barra de força e o toque),
     com a corrida até a bola. CHUTAR mirando no gol = chute; mirando fora dele = bola alta (cruzamento, lançamento). PASSAR = rasteiro.
     O goleiro defende e sai do gol, a barreira pula, o marcador corta e o Juninho recebe e cabeceia com a IA da partida.
   - O que é do treino fica por cima, em 3D: os aros no gol, as placas com a janela, os cones, o círculo no chão e o aro do cruzamento.
     O resultado é conferido na bola de verdade (gol, toque de quem, onde quicou, onde parou, por onde passou).
   - Coordenadas da LOGICA (u = lado, v = distância até a linha do gol) no campo da partida: x = HALF_L − v, z = u. As medidas do gol
     do treino (aros e janela) crescem na proporção do gol do society.
   ===================================================================== */
(function () {
  'use strict';
  const clampN = (x, a, b) => Math.max(a, Math.min(b, x));
  const EXTRAS = ['Beto', 'Neno', 'Duda'];                                  // os outros da turma (só entram na barreira e na marcação)

  // =====================================================================================================================
  // A PARTIDA DO TREINO: o campo do sintético, você e o Juninho contra o Paredão, o Tonhão e os três da barreira
  // =====================================================================================================================
  function montarCfg(ctx) {
    const { api, tr } = ctx, hc = api.horarioClimaPartida ? api.horarioClimaPartida() : { horario: 'dia', clima: 'seco' };
    const apDe = (A, seed, gen) => (A && A.ap ? Object.assign({}, A.ap) : api.gerarAparencia(seed, gen));
    const j = (nome, ap) => Object.assign({ nome }, ap);
    const tec = { nome: 'Seu Nonato', aparencia: { pele: '#C68E62', cabelo: '#D8D8D8', estilo: 1, roupa: '#1f7a4d' } };
    const sobra = (i) => j('__treino' + i, api.gerarAparencia(7300 + i, 'M'));           // só para fechar o time (saem de campo)
    const t0 = { id: 'tr_nonato_a', nome: tr('Treino'), sigla: 'TRE', forca: 50, popularidade: 0.1, formacao: '4-4-2', tatica: 'tikitaka', uniforme: api.UNI_COLETE, uniforme2: api.UNI_AZUL,
      emblema: { forma: 'escudo', cor1: '#1f7a4d', cor2: '#f2c230', letras: 'SN' }, tecnico: tec,
      elenco: [sobra(0), sobra(1), sobra(2), sobra(3), sobra(4), j('Juninho', apDe(ctx.bat[0], 8081, 'M'))] };   // (7.6.3) a várzea é 7 x 7: mais dois para fechar o time
    const t1 = { id: 'tr_nonato_b', nome: tr('Treino'), sigla: 'TRE', forca: 50, popularidade: 0.1, formacao: '4-4-2', tatica: 'tikitaka', uniforme: api.UNI_AZUL, uniforme2: api.UNI_COLETE,
      emblema: { forma: 'circulo', cor1: '#1f7a4d', cor2: '#f2f2ee', letras: 'SN' }, tecnico: tec,
      elenco: [j('Paredão', apDe(ctx.gol, 8083, 'M')), j('Tonhão', apDe(ctx.bat[1], 8082, 'M'))].concat(EXTRAS.map((n, i) => j(n, api.gerarAparencia(8090 + i * 7, 'M'))), [sobra(5), sobra(6)]) };
    const eu = { nome: PERSONAGEM.apelido || PERSONAGEM.nome || tr('Você'), posicao: 'FWD', numero: PERSONAGEM.numero, aparencia: api.aparenciaNaPartida() };
    // (7.6.3) o treino é na VÁRZEA da cidade (antes no society do seu Nonato): o campo da partida é o da várzea
    const campo = typeof CAMPOS !== 'undefined' && CAMPOS.varzeaCidade ? 'varzeaCidade' : (typeof CAMPOS !== 'undefined' && CAMPOS.societyTreino) ? 'societyTreino' : 'society';
    return { campo, times: [t0, t1], mandante: 0, competicao: { tipo: 'amistoso', nome: tr('Treino'), rodada: 0, fase: '', mataMata: false, jogo: 'unico', placarIda: null },   // (7.4.19) o treino fica no society antigo (48 x 30, 5 x 5)
      dificuldade: 'normal', clima: hc.clima, gramado: 'baixo', horario: hc.horario, duracao: 600, usuario: eu, atributos: ctx.atributos(), taticas: [null, null], formacoes: [null, null] };
  }

  async function sessao(ctx) {
    const { api } = ctx;
    if (typeof Historia === 'undefined' || !Historia.desafio || !api.sairParaPartida) throw new Error('o jogo não tem o modo desafio');
    const cfg = montarCfg(ctx), ficam = new Set(['Juninho', 'Paredão', 'Tonhão'].concat(EXTRAS));
    const G_ = {};                                                          // vira G.desafio (os ganchos são preenchidos em rodar)
    await api.preto(true, 350);
    api.sairParaPartida();
    let fim = 'saiu';
    try { fim = await Historia.desafio({ cfg, ficar: (p) => ficam.has(p.ficha), ganchos: G_, rodar: (eng) => rodar(ctx, eng, G_) }) || 'saiu'; }
    catch (e) { console.warn('[Treino] desafio:', e); }
    api.voltarDaPartida();
    try { if (typeof Musica !== 'undefined') Musica.tocar('jazz'); } catch (e) { /* sem música */ }
    return fim;
  }

  // =====================================================================================================================
  // A SESSÃO: os 3 desafios da situação, tentativa por tentativa
  // =====================================================================================================================
  async function rodar(ctx, eng, GD) {
    const { api, L, SOM, tr, trf, virg, esc, montarHud, vib, Sit, rep, dados, gravar, atributos } = ctx;
    const achar = (n) => players.find((p) => p.ficha === n) || null;
    const PJ = { ju: achar('Juninho'), to: achar('Tonhão'), gk: achar('Paredão'), ex: EXTRAS.map(achar).filter(Boolean) };
    if (!PJ.ju || !PJ.to || !PJ.gk) throw new Error('a turma não entrou em campo');
    const RB = CONFIG.BALL_R, su = GOAL_HALF / L.GOL_W, sy = CONFIG.GOAL_H / L.GOL_H, sr = Math.sqrt(su * sy);
    const X = (v) => HALF_L - v, Z = (u) => u;
    const ang = (ax, az, bx, bz) => Math.atan2(bz - az, bx - ax);
    const U = montarHud();
    for (const k of ['arr', 'ef', 'alto', 'barraBox', 'chuta', 'dica']) U[k].hidden = true;
    U.sair.textContent = tr('Sair');
    // o HUD do treino divide o alto da tela com o da partida: o Sair no lugar da pausa (sem relógio, a pausa da partida não serve, e o menu
    // dela sairia do treino), a câmera ao lado, o som no canto do radar, o quadro do desafio entre eles e as etapas do chute logo abaixo
    const css = document.createElement('style');
    css.textContent = 'body.noDesafio #pauseBtn{display:none}' +
      'body.noDesafio #trHud .trSair{left:calc(12px + env(safe-area-inset-left,0px));right:auto;top:calc(8px + env(safe-area-inset-top,0px));width:84px;min-width:0;height:36px;padding:0 6px;font-size:11px}' +
      'body.noDesafio #camBtn{left:calc(104px + env(safe-area-inset-left,0px))}body.noDesafio #somBtn{right:calc(12px + env(safe-area-inset-right,0px))!important}' +
      'body.noDesafio #trHud .trTopo{left:calc(214px + env(safe-area-inset-left,0px));right:calc(64px + env(safe-area-inset-right,0px));width:auto;transform:none;padding:3px 8px 4px}' +
      'body.noDesafio #stageBar{top:calc(86px + env(safe-area-inset-top,0px))}body.noDesafio #toast{top:calc(90px + env(safe-area-inset-top,0px))}' +
      'body.noDesafio #trHud .trMsg{top:40%}' +
      'body.noDesafio #cdHud,body.noDesafio #cdEsq,body.noDesafio #cdSeta,body.noDesafio #cdCtl,body.noDesafio #cdArrasto,body.noDesafio #cdCelular,body.noDesafio #cdCelular+div{display:none!important}';   // nada da cidade por cima do treino
    document.head.appendChild(css);
    const M = { k: 0, D: null, bolas: 3, feitos: [false, false, false], e: 'intro', tD: 0, tv: 0, props: [], res: null, acabou: false, fim: null };
    const dbg = window.__treinoCampo = { M, PJ, bolas: (n) => { M.bolas = n; atualizarHud(); }, log: [], ir: (k) => { for (let i = 0; i < 3; i++) M.feitos[i] = i < k; congelar(false); comecarDesafio(k); } };   // (para os testes)
    const MATS = {};
    const mat = (cor, op) => { const k = cor + '|' + (op || 1); return MATS[k] || (MATS[k] = op && op < 1 ? new THREE.MeshBasicMaterial({ color: cor, transparent: true, opacity: op, depthWrite: false }) : new THREE.MeshLambertMaterial({ color: cor })); };
    const add = (o) => { scene.add(o); M.props.push(o); return o; };
    function limparProps() { for (const o of M.props) { scene.remove(o); o.traverse((q) => { if (q.geometry) q.geometry.dispose(); }); } M.props = []; M.aros = M.placas = M.cones = M.zona = M.aro = null; }

    // ---- quem faz o quê em cada desafio ------------------------------------------------------------------------------
    // o lugar de quem só assiste: na lateral do lado de lá (longe do lance e da câmera), cada um a 1,4 m do outro
    function lugarDeVer(i) {
      const D = M.D, ref = D.recebe || D.cabeca || D.zona || D.bola, s = -(Math.sign(ref.u) || 1);
      return { x: clampN(X(D.tipo === 'passe' ? 2 : 14) - i * 1.4, -HALF_L + 3, HALF_L - 3), z: s * (HALF_W - 0.7) };
    }
    function papeis() {
      const D = M.D, b = { x: X(D.bola.v), z: Z(D.bola.u) }, pos = [], usados = new Set();
      const nb = D.barreira ? (Array.isArray(D.barreira) ? D.barreira.length : D.barreira.n) : 0;
      M.barreira = new Array(nb);                                          // (quem fica na barreira é escolhido lá embaixo)
      let nv = 0; const assiste = (p) => { const q = lugarDeVer(nv++); pos.push({ p, x: q.x, z: q.z, ang: ang(q.x, q.z, b.x, b.z), parado: true }); usados.add(p); };
      // o Paredão: defende de verdade ('gol'/'sai'), parado na linha ('linha') ou assistindo ao lado da trave
      const g = D.goleiro, gk = PJ.gk;
      // no gol: parado na bissetriz do ângulo (como na cobrança) até você bater; aí ele é o goleiro da partida (mergulha, sai, rebate)
      if (g && (g.modo === 'gol' || g.modo === 'sai')) {
        const a1 = ang(b.x, b.z, HALF_L, -GOAL_HALF), a2 = ang(b.x, b.z, HALF_L, GOAL_HALF), ab = (a1 + a2) / 2, gx = HALF_L - 0.45;
        const gz = clampN(b.z + Math.tan(ab) * (gx - b.x) + (M.barreira && M.barreira.length ? -(Math.sign(b.z) || 1) * 0.35 : 0), -GOAL_HALF + 0.6, GOAL_HALF - 0.6);
        pos.push({ p: gk, x: gx, z: gz, ang: ang(gx, gz, b.x, b.z), parado: true });
      }
      else if (g && g.modo === 'linha') pos.push({ p: gk, x: HALF_L - 0.35, z: 0, ang: Math.PI, scripted: true });
      else { const s = -(Math.sign(b.z) || 1); pos.push({ p: gk, x: HALF_L + 0.9, z: s * (GOAL_HALF + 1.6), ang: ang(HALF_L + 0.9, s * (GOAL_HALF + 1.6), b.x, b.z), scripted: true }); }
      usados.add(gk);
      // o Juninho: recebe, cabeceia (parado ou correndo) ou assiste
      const alvo = D.recebe || D.cabeca;
      if (alvo) { const p0 = alvo.corre ? L.posCorre(alvo.corre, M.tD) : alvo; pos.push({ p: PJ.ju, x: X(p0.v), z: Z(p0.u), parado: true }); usados.add(PJ.ju); }
      // marcadores (npc 1 = Tonhão; 2 e 3 = os outros)
      const pool = [PJ.to].concat(PJ.ex);
      for (const mk of D.marcadores || []) { const p = pool[(mk.npc || 1) - 1]; if (!p || usados.has(p)) continue; pos.push({ p, x: X(mk.v), z: Z(mk.u), parado: true }); usados.add(p); }
      // a barreira: quem sobrou (o motor põe no lugar: G.desafio.barreira)
      M.barreira = [];
      for (const p of pool) { if (M.barreira.length >= nb) break; if (!usados.has(p)) { M.barreira.push(p); usados.add(p); pos.push({ p, x: b.x + 9, z: b.z, parado: true }); } }
      // o resto: o Juninho e o Tonhão assistem; os outros três saem de campo
      if (!usados.has(PJ.ju)) assiste(PJ.ju);
      if (!usados.has(PJ.to)) assiste(PJ.to);
      for (const p of PJ.ex) if (!usados.has(p)) pos.push({ p, x: -HALF_L - 30, z: -HALF_W - 30, fora: true });
      return { b, pos };
    }
    // a barreira do desafio (montarBarreira do motor chama isto): no chute, a 9,15 m como na partida; no cruzamento, onde a LOGICA mandou
    GD.barreira = (S, g) => {
      const D = M.D, quem = M.barreira || []; if (!D || !quem.length) return [];
      if (Array.isArray(D.barreira)) return D.barreira.slice(0, quem.length).map((q, i) => ({ p: quem[i], x: X(q.v), z: Z(q.u) }));
      const n = quem.length, cx = S.ballSpot.x + g.ux * 9.15, cz = S.ballSpot.z + g.uz * 9.15;
      return quem.map((p, i) => { const off = (i - (n - 1) / 2) * 0.62 + g.lado * 0.5 * (Math.sign(g.pz * g.lado) || 1); return { p, x: cx + g.px * off, z: cz + g.pz * off }; });
    };

    // ---- o que é do treino, em 3D -------------------------------------------------------------------------------------
    function montarProps() {
      limparProps();
      const D = M.D;
      if (D.alvos) M.aros = D.alvos.map((a) => {
        const gr = new THREE.Group(), r = a.r * sr, to = new THREE.Mesh(new THREE.TorusGeometry(r, 0.07, 6, 30), mat('#f07a20')); to.rotation.y = Math.PI / 2; gr.add(to);
        const fundo = new THREE.Mesh(new THREE.CircleGeometry(r - 0.06, 30), mat('#ffd23a', 0.3)); fundo.rotation.y = Math.PI / 2; fundo.material.side = THREE.DoubleSide; gr.add(fundo);   // o miolo do alvo, para ver de longe
        const cd = new THREE.Mesh(new THREE.BoxGeometry(0.02, 1, 0.02), mat('#e8e0c8')); gr.add(cd); gr.userData = { r, cd }; return add(gr);
      });
      if (D.janela) { M.placas = [0, 1, 2, 3].map(() => add(new THREE.Mesh(new THREE.BoxGeometry(0.05, 1, 1), mat('#9b6a3a')))); }
      if (D.cones) M.cones = [0, 1].map(() => add(new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.42, 10), mat('#f06a1a'))));
      if (D.zona) {
        const r = D.zona.r, gr = new THREE.Group();
        const an = new THREE.Mesh(new THREE.RingGeometry(r - 0.08, r, 44), mat('#fff0c8', 0.9)); an.rotation.x = -Math.PI / 2; an.renderOrder = 3; gr.add(an);
        const f = new THREE.Mesh(new THREE.CircleGeometry(r - 0.08, 44), mat('#f0a020', 0.2)); f.rotation.x = -Math.PI / 2; f.position.y = -0.003; f.renderOrder = 3; gr.add(f);
        gr.position.set(X(D.zona.v), 0.03, Z(D.zona.u)); M.zona = add(gr);
      }
      if (D.aro) {
        const gr = new THREE.Group(), to = new THREE.Mesh(new THREE.TorusGeometry(D.aro.r, 0.07, 6, 30), mat('#f07a20')); gr.add(to);
        const fundo = new THREE.Mesh(new THREE.CircleGeometry(D.aro.r - 0.06, 30), mat('#ffd23a', 0.25)); fundo.material.side = THREE.DoubleSide; gr.add(fundo);
        const ps = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1, 0.06), mat('#9aa0a6')); gr.add(ps); gr.userData = { ps }; M.aro = add(gr);
      }
      animarProps();
    }
    const posAlvo = (a) => { const P = L.posAlvo(a, M.tD); return { z: Z(P.u * su), y: P.y * sy, r: a.r * sr }; };
    const posJanela = () => { const J = M.D.janela, P = L.posJanela(J, M.tD); return { z: Z(P.u * su), y: P.y * sy, w: J.w * su, h: J.h * sy }; };
    const posCones = () => { const C = L.posCones(M.D.cones, M.tD); return { a: { x: X(C.a.v), z: Z(C.a.u) }, b: { x: X(C.b.v), z: Z(C.b.u) } }; };
    const posAro = () => { const A = L.posAro(M.D.aro, M.tD); return { x: X(A.v), y: A.y, z: Z(A.u) }; };
    function animarProps() {
      const D = M.D, GH = CONFIG.GOAL_H;
      if (M.aros) D.alvos.forEach((a, i) => { const P = posAlvo(a), gr = M.aros[i], cd = gr.userData.cd, top = GH + 0.04 - P.y - P.r; gr.position.set(HALF_L - 0.04, P.y, P.z); cd.scale.y = Math.max(0.05, top); cd.position.y = P.r + top / 2; });
      if (M.placas) {
        const P = posJanela(), z0 = P.z - P.w / 2, z1 = P.z + P.w / 2, y0 = P.y - P.h / 2, y1 = P.y + P.h / 2, GW = GOAL_HALF;
        [[-GW, z0, 0, GH], [z1, GW, 0, GH], [z0, z1, 0, y0], [z0, z1, y1, GH]].forEach(([a, c, d, e], i) => {
          const pl = M.placas[i], lw = c - a, lh = e - d; pl.visible = lw > 0.01 && lh > 0.01; if (!pl.visible) return;
          pl.scale.set(1, lh, lw); pl.position.set(HALF_L - 0.1, (d + e) / 2, (a + c) / 2);
        });
      }
      if (M.cones) { const C = posCones(); [C.a, C.b].forEach((c, i) => M.cones[i].position.set(c.x, 0.21, c.z)); }
      if (M.aro) {
        const P = posAro(), bx = X(D.bola.v), bz = Z(D.bola.u); M.aro.position.set(P.x, P.y, P.z); M.aro.rotation.y = Math.atan2(bx - P.x, bz - P.z);
        const ps = M.aro.userData.ps, h = P.y - D.aro.r; ps.scale.y = h; ps.position.y = -D.aro.r - h / 2;
      }
    }

    // ---- HUD --------------------------------------------------------------------------------------------------------
    function atualizarHud() {
      const D = M.D;
      U.tit.textContent = trf('Situação {0}/30: {1}', Sit.n + 1, tr(Sit.nome));
      U.pips.innerHTML = [0, 1, 2].map((i) => '<i class="' + (M.feitos[i] ? 'ok' : i === M.k ? 'at' : '') + '"></i>').join('');
      U.bolas.innerHTML = Array.from({ length: Math.max(3, M.bolas) }, (_, i) => '<b class="' + (i < M.bolas ? '' : 'vazia') + '"></b>').join('');
      U.desc.textContent = trf(D.desc, ...D.descA);
    }
    function dicaDoToque(D) {
      if (D.tipo === 'chute') return tr('Cobrança de falta como na partida: arraste para a direção, a barra é o efeito e segure CHUTAR para a força.');
      if (D.toque === 'pass') return tr('Use PASSAR: a força decide até onde a bola vai.');
      return tr('Use CHUTAR / CRUZAR mirando fora do gol: a bola vai pelo alto.');
    }
    // com o cartão aberto o jogo para (tempo zero: a mira, a câmera e quem corre esperam) e os controles da partida somem
    function congelar(on) {
      if (on) { M.congelado = true; G.targetScale = G.timeScale = 0; document.body.classList.add('desafioCartao'); }
      else if (M.congelado) { M.congelado = false; G.targetScale = G.timeScale = 1; document.body.classList.remove('desafioCartao'); }
    }
    function cartao(html, aoClicar) {
      congelar(true); U.card.hidden = false; U.card.innerHTML = html;
      U.card.onclick = (e) => { const b = e.target.closest && e.target.closest('button'); if (!b) return; if (typeof Som !== 'undefined' && Som.clique) Som.clique(); aoClicar(b); };
    }
    function fecharCartao() { U.card.hidden = true; U.card.onclick = null; congelar(false); }
    const botao = (txt, prim, extra) => '<button type="button" class="pxBtn' + (prim ? ' pxPrim' : '') + '"' + (extra || '') + '>' + esc(txt) + '</button>';

    // ---- uma tentativa -----------------------------------------------------------------------------------------------
    function armar() {
      const D = M.D, { b, pos } = papeis();
      M.res = null; M.e = 'cobra'; M.tv = 0; M.ult = null; M.toqueJu = null; M.quicou = false; M.gate = false; M.janelaOk = false; M.parada = 0; M.parouT = 0;
      M.ant = { x: b.x, y: RB, z: b.z, vx: 0, vy: 0 };
      U.msg.className = 'trMsg';
      let mira = null;
      if (D.tipo !== 'chute') mira = { x: X(D.mira.v), z: Z(D.mira.u) };
      else mira = { x: HALF_L, z: Z((D.mira.u || 0) * su) };
      GD.toque = D.toque;
      GD.faltaMira = D.tipo === 'chute';                                    // (7.6.3) CHUTE = a cobrança de falta da partida (direção, efeito e força segurando)
      PJ.gk.hab.goleiro = Math.round((5 + 3 * D.x) * 10) / 10;             // o Paredão fica mais esperto com a dificuldade: habilidade (até 8)
      GD.defesa = 0.45 + 0.55 * D.x;                                       // e a chance de defender o que chega nas mãos (metade no começo, inteira no fim)
      const ok = eng.armar({ bola: b, face: ang(b.x, b.z, mira.x, mira.z), mira, pos });
      if (!ok) console.warn('[Treino] a cobrança não armou');
      animarProps();
    }
    // o motor avisa: você bateu na bola (antes de escolher quem recebe)
    GD.chutou = () => {
      if (M.e !== 'cobra') return;
      M.e = 'voo'; M.tv = 0; M.t0 = performance.now();
      const D = M.D;
      if (D.recebe || D.cabeca) { PJ.ju.parado = !!D.cones; PJ.ju.desTreino = null; }   // nos cones ele espera a bola passar entre eles
      if (D.goleiro && (D.goleiro.modo === 'gol' || D.goleiro.modo === 'sai')) PJ.gk.parado = false;
      // o marcador reage um pouco depois do toque (menos nas situações difíceis) e a barreira só pula (kickBall): os dois saem do lugar no vigiar
      for (const p of M.barreira || []) p.ignBolaT = 0.7;                // a barreira é só o corpo (pula e bloqueia): não sai cabeceando a bola alta
    };
    function ehMarcador(p) { const pool = [PJ.to].concat(PJ.ex); return (M.D.marcadores || []).some((mk) => pool[(mk.npc || 1) - 1] === p); }
    // gol e bola fora (handleBallOut do motor)
    GD.evento = (tipo) => {
      if (M.e !== 'voo' && M.e !== 'pos') return;
      const D = M.D;
      if (tipo === 'gol') {
        const c = cruzamentoDaLinha(HALF_L);
        if (M.e === 'pos') { if (M.res && M.res.ok && D.crit === 'cabeca' && M.ult === PJ.ju) mostrar(true, 'GOL!', true); return; }   // e ainda fez o gol
        if (D.crit === 'gol') return julgar(true, 'GOL!');
        if (D.crit === 'alvo') { const hit = D.alvos.some((a) => { const P = posAlvo(a); return Math.hypot(c.z - P.z, c.y - P.y) <= P.r - RB * 0.4; }); return julgar(hit, hit ? 'ACERTOU!' : 'Errou o alvo!'); }
        if (D.crit === 'janela') {
          if (M.janelaOk || dentroDaJanela(c)) return julgar(true, 'GOL!');
          G.treinoGol = 0; batePlaca(); return julgar(false, 'Nas placas!');
        }
        return julgar(false, 'Para fora!');
      }
      if (M.e === 'voo') { const alto = ball.y > CONFIG.GOAL_H && Math.abs(ball.x) > HALF_L; julgar(false, D.tipo === 'chute' && alto ? 'Por cima!' : 'Para fora!'); }
    };
    // onde a bola cruzou o plano x = xp (entre o quadro anterior e este)
    function cruzamentoDaLinha(xp) {
      const a = M.ant, dx = ball.x - a.x, k = Math.abs(dx) > 1e-4 ? clampN((xp - a.x) / dx, 0, 1) : 1;
      return { x: xp, y: a.y + (ball.y - a.y) * k, z: a.z + (ball.z - a.z) * k };
    }
    function dentroDaJanela(c) { const P = posJanela(); return Math.abs(c.z - P.z) <= P.w / 2 - RB * 0.6 && Math.abs(c.y - P.y) <= P.h / 2 - RB * 0.6; }
    function batePlaca() { ball.x = HALF_L - 0.24; ball.vx = -Math.abs(ball.vx) * 0.28; ball.vz *= 0.5; ball.vy = Math.max(0.6, ball.vy * 0.3); ball.isShot = false; Som.defesa && Som.defesa(); }

    // ---- o quadro a quadro (stepGame chama G.desafio.passo) ------------------------------------------------------------
    GD.passo = (dt) => {
      try {
        if (M.e === 'cobra' || M.e === 'voo' || M.e === 'pos') M.tD += dt;
        if (!M.D) return;
        animarProps();
        if (M.e === 'cobra') correJuninho(dt);
        if (M.e === 'voo') vigiar(dt);
        if (M.e === 'pos' && performance.now() - M.tRes > 2300) { M.e = 'espera'; proximo(); }
        M.ant.x = ball.x; M.ant.y = ball.y; M.ant.z = ball.z; M.ant.vx = ball.vx; M.ant.vy = ball.vy;
      } catch (e) { if (!M.erroLog) { M.erroLog = true; console.warn('[Treino] passo:', e); } }
    };
    // antes do chute: o Juninho corre no caminho dele (anda pelo motor: desTreino)
    function correJuninho() {
      const D = M.D, C = (D.recebe && D.recebe.corre) || (D.cabeca && D.cabeca.corre), p = PJ.ju; if (!C) return;
      const q = L.posCorre(C, M.tD), q1 = L.posCorre(C, M.tD + 0.1), tx = X(q.v), tz = Z(q.u), fx = (X(q1.v) - tx) / 0.1, fz = (Z(q1.u) - tz) / 0.1;
      let vx = fx + (tx - p.x) * 4, vz = fz + (tz - p.z) * 4; const v = Math.hypot(vx, vz); if (v > 7.5) { vx *= 7.5 / v; vz *= 7.5 / v; }
      p.desTreino = v > 0.15 ? { vx, vz, olha: true } : null;
      if (!p.desTreino) p.angle = ang(p.x, p.z, X(D.bola.v), Z(D.bola.u));
    }
    // depois do chute: quem tocou, por onde passou, onde quicou, onde parou
    function vigiar(dt) {
      const D = M.D, a = M.ant;
      M.tv += dt;
      if (M.tv > 0.8 && M.barreira && M.barreira.length) for (const p of M.barreira) p.parado = false;
      if (M.tv > 0.35 - 0.25 * D.x) for (const p of [PJ.to].concat(PJ.ex)) if (!p.out && p.parado && ehMarcador(p)) { p.parado = false; p.desTreino = null; }
      // primeiro o que a bola atravessou neste quadro (o Juninho pode estar colado nos cones), depois quem tocou nela
      // as placas na boca do gol (um pouco antes da linha): fora da janela, a bola bate e volta
      if (D.janela && !M.janelaOk) {
        const xp = HALF_L - 0.12;
        if (a.x < xp && ball.x >= xp) {
          const c = cruzamentoDaLinha(xp);
          if (Math.abs(c.z) < GOAL_HALF + 0.12 && c.y < CONFIG.GOAL_H + 0.12) { if (dentroDaJanela(c)) M.janelaOk = true; else { batePlaca(); return julgar(false, 'Nas placas!'); } }
        }
      }
      // os cones: a bola tem que passar entre eles
      if (D.cones && !M.gate) {
        const C = posCones(), r = cruzaSegmento(a, ball, C.a, C.b);
        if (r) {
          const gap = Math.hypot(C.b.x - C.a.x, C.b.z - C.a.z), m = 0.14 + RB;
          if (r.t * gap >= m && (1 - r.t) * gap >= m && ball.y < 1.2) { M.gate = true; PJ.ju.parado = false; }   // passou: agora o Juninho vai na bola
          else if (r.t > -1.5 && r.t < 2.5) return julgar(false, r.t > 0 && r.t < 1 ? 'Nos cones!' : 'Fora do corredor!');
        }
      }
      // o aro do cruzamento: passou pelo plano dele?
      if (D.aro) {
        const P = posAro(), bx = X(D.bola.v), bz = Z(D.bola.u), nx = bx - P.x, nz = bz - P.z, nl = Math.hypot(nx, nz) || 1;
        const s0 = ((a.x - P.x) * nx + (a.z - P.z) * nz) / nl, s1 = ((ball.x - P.x) * nx + (ball.z - P.z) * nz) / nl;
        if (s0 > 0 && s1 <= 0) {
          const k = s0 / (s0 - s1), cx = a.x + (ball.x - a.x) * k, cy = a.y + (ball.y - a.y) * k, cz = a.z + (ball.z - a.z) * k;
          const dd = Math.hypot(cx - P.x, cy - P.y, cz - P.z);
          return julgar(dd <= D.aro.r - RB * 0.5, dd <= D.aro.r - RB * 0.5 ? 'PASSOU NO ARO!' : 'Fora do aro!');
        }
      }
      // toques: o primeiro de cada um depois do seu
      const lt = G.lastTouch;
      if (lt && lt !== user && lt !== M.ult) { M.ult = lt; if (tocou(lt, Math.max(a.y, ball.y))) return; }
      if (M.e !== 'voo') return;
      if (D.crit === 'recebe' && G.possession === PJ.ju) {
        if (D.cones && !M.gate) return julgar(false, 'Fora do corredor!');
        return julgar(true, 'DOMINOU!');
      }
      if (D.crit === 'recebe' && M.toqueJu != null && M.tv - M.toqueJu > 1.4) return julgar(false, 'Forte demais!');
      // na trave: o chute que ia para o gol voltou da linha sem ninguém tocar
      if (D.tipo === 'chute' && a.vx > 2 && ball.vx < -0.3 && ball.x > HALF_L - 1.2 && Math.abs(ball.z) < GOAL_HALF + 0.6) return julgar(false, 'Na trave!');
      // o primeiro quique (cruzamento no círculo; no aro, quicou antes = errou)
      const quique = !M.quicou && a.vy < -0.8 && ball.vy >= 0 && ball.y < 0.45;
      if (quique) {
        M.quicou = true;
        if (D.crit === 'zona') { const dz = Math.hypot(ball.x - X(D.zona.v), ball.z - Z(D.zona.u)); return julgar(dz <= D.zona.r, dz <= D.zona.r ? 'NO CÍRCULO!' : 'Fora do círculo!'); }
        if (D.crit === 'aro') return julgar(false, 'Fora do aro!');
      }
      // parou (ou quase): a bola no círculo, ou faltou força
      const vh = Math.hypot(ball.vx, ball.vz);
      if (ball.y < 0.35 && vh < 0.35) M.parada += dt; else M.parada = 0;
      if (D.crit === 'para' && (M.parada > 0.25 || G.possession)) { const dz = Math.hypot(ball.x - X(D.zona.v), ball.z - Z(D.zona.u)); return julgar(dz <= D.zona.r, dz <= D.zona.r ? 'NA MEDIDA!' : 'Fora do círculo!'); }
      if (M.parada > 0.8 || (G.possession === user && M.tv > 0.6)) return julgar(false, 'Fraco demais!');
      if (M.tv > 7) return julgar(false, D.tipo === 'chute' ? 'Para fora!' : 'Fraco demais!');
    }
    // o caminho da bola (de a até b) cruzou o segmento entre os cones A e B (no chão)? t = onde, ao longo de A até B (fora de 0..1 = fora do vão)
    function cruzaSegmento(a, b, A, B) {
      const ex = B.x - A.x, ez = B.z - A.z, dx = b.x - a.x, dz = b.z - a.z, den = dx * ez - dz * ex; if (Math.abs(den) < 1e-6) return null;
      const s = ((A.x - a.x) * ez - (A.z - a.z) * ex) / den, t = ((A.x - a.x) * dz - (A.z - a.z) * dx) / den;
      return s >= 0 && s <= 1 ? { t } : null;
    }
    // alguém tocou na bola. Devolve true se isso decidiu a tentativa.
    function tocou(p, y) {
      const D = M.D;
      if (M.e === 'pos') return false;
      if (p.team === 1) {
        if (p === PJ.gk) return julgar(false, D.tipo === 'chute' ? 'Defendeu!' : 'O goleiro pegou!'), true;
        if ((M.barreira || []).includes(p)) return julgar(false, 'Na barreira!'), true;
        return julgar(false, D.tipo === 'chute' ? 'Bloqueado!' : D.tipo === 'cruz' ? 'O zagueiro cortou!' : 'Interceptado!'), true;
      }
      if (p === PJ.ju) {
        if (D.crit === 'cabeca') return julgar(y >= 0.95, y >= 0.95 ? 'BOLA NELE!' : 'Baixa demais!'), true;
        if (D.crit === 'recebe') {
          if (D.cones && !M.gate) return julgar(false, 'Fora do corredor!'), true;
          if (D.fam === 'longo') return julgar(true, 'DOMINOU!'), true;
          if (M.toqueJu == null) M.toqueJu = M.tv;
        }
      }
      return false;
    }
    function julgar(ok, mot) {
      if (M.e !== 'voo') return;
      M.res = { ok, mot }; M.e = 'pos'; M.tRes = performance.now();
      dbg.log.push(mot);
      if (ok) { if (mot === 'GOL!' && SOM.rede) SOM.rede(); SOM.acerto(); vib([30, 40, 30]); } else setTimeout(() => { if (!M.acabou) SOM.erro(); }, 250);
      mostrar(ok, mot);
    }
    function mostrar(ok, mot, ouro) { U.msg.textContent = tr(mot); U.msg.className = 'trMsg on ' + (ouro ? 'ouro' : ok ? 'ok' : 'no'); if (ouro) M.tRes = performance.now() - 600; }

    // ---- o que vem depois: outra bola, outro desafio, o fim -------------------------------------------------------------
    function comecarDesafio(k) {
      M.k = k; M.D = Sit.desafios[k]; M.bolas = 3; M.tD = 0;
      montarProps(); armar(); atualizarHud();
      cartao('<h3>' + esc(trf('Desafio {0}/3', k + 1)) + '</h3><p>' + esc(trf(M.D.desc, ...M.D.descA)) + '</p><p>' + esc(dicaDoToque(M.D)) + '</p><div class="trBt">' + botao(tr('Bora!'), true) + '</div>',
        () => { fecharCartao(); });
    }
    function proximo() {
      U.msg.className = 'trMsg';
      if (M.res && M.res.ok) {
        M.feitos[M.k] = true; SOM.apito(); atualizarHud();
        if (M.k < 2) {
          U.msg.textContent = trf('Desafio {0} feito!', M.k + 1); U.msg.className = 'trMsg on ouro'; M.e = 'intervalo';
          setTimeout(() => { if (M.acabou) return; U.msg.className = 'trMsg'; comecarDesafio(M.k + 1); }, 1200);
          return;
        }
        concluir(); return;
      }
      M.bolas--; atualizarHud();
      if (M.bolas <= 0) { semBola(); return; }
      armar();
    }
    // sem bola: o anúncio de 15 s (+1) ou de 30 s (+3), ou desiste
    function semBola() {
      M.e = 'semBola';
      cartao('<h3>' + esc(tr('Acabaram as bolas!')) + '</h3><p>' + esc(tr('Faltou pouco. Quer mais bola?')) + '</p>' +
        '<div class="trBt" style="flex-direction:column;align-items:center">' + botao(tr('Anúncio de 15 s: +1 bola'), true, ' data-a="15"') + botao(tr('Anúncio de 30 s: +3 bolas'), true, ' data-a="30"') + botao(tr('Desistir'), false, ' data-a="sai"') + '</div><p class="trAv"></p>',
      async (bt) => {
        if (M.ocupado) return;
        const a = bt.dataset.a;
        if (a === 'sai') { fecharCartao(); terminar('falhou'); return; }
        M.ocupado = true; const seg = +a, mais = seg === 15 ? 1 : 3;
        let visto = false;
        try { visto = typeof Anuncios !== 'undefined' && await Anuncios.filme(seg, { nome: 'treino-' + seg, tit: tr(mais === 1 ? 'Bola extra' : 'Bolas extras'), txt: tr(mais === 1 ? 'Assista até o fim para ganhar a bola.' : 'Assista até o fim para ganhar as 3 bolas.'), fim: tr('Pronto! Bola na marca.') }); } catch (er) { visto = false; }
        M.ocupado = false;
        if (M.acabou) return;
        if (!visto) { const av = U.card.querySelector('.trAv'); if (av) av.textContent = tr('Nenhum anúncio disponível agora. Tenta de novo daqui a pouco.'); return; }
        fecharCartao(); M.bolas += mais; atualizarHud(); armar();
      });
    }
    // fechou os 3: +0,1 na habilidade (só da primeira vez de cada situação)
    function concluir() {
      const p = dados(); let txt2 = '';
      if (!rep && p.prog[Sit.tipo] === Sit.n) {
        let kT = 1; try { kT = Espectros.efeito('treino', true); } catch (e) { /* ok */ }   // (7.1.14) Disciplinado rende mais, Relaxado menos
        const at = atributos(), nome = Sit.atrib, g = Math.round(0.1 * kT * 100) / 100, novo = Math.min(10, Math.round(((at[nome] || 5) + g) * 100) / 100);
        at[nome] = novo; p.ganhos[nome] = Math.round(((p.ganhos[nome] || 0) + g) * 100) / 100; p.prog[Sit.tipo] = Sit.n + 1;
        try { const dd = api.S().dados; dd.ultTecnico = dd.ativoDia = dd.dia; if (dd.discTreinoDia !== dd.dia) { dd.discTreinoDia = dd.dia; Espectros.mover('disciplinado', 1.5, 'treinou com o seu Nonato'); } } catch (e) { /* ok */ }
        txt2 = trf('+0,1 em {0} (agora {1})', tr(L.NOME_ATRIB[nome]), virg(novo)); gravar();
        try { if (api.ganhoNaTela) api.ganhoNaTela(txt2); } catch (e) { /* sem efeito */ }
      }
      SOM.festa(); vib([40, 50, 40, 50, 120]);
      M.e = 'fimSit';
      cartao('<h3>' + esc(tr('SITUAÇÃO CONCLUÍDA!')) + '</h3><p>' + esc(trf('Situação {0}/30: {1}', Sit.n + 1, tr(Sit.nome))) + '</p><p class="trPr">' + esc(txt2 || tr('Repetição: sem ganhar habilidade.')) + '</p><div class="trBt">' + botao(tr('Continuar'), true) + '</div>',
        () => { fecharCartao(); terminar('ok'); });
    }
    function terminar(como) { if (M.acabou) return; M.acabou = true; if (M.fim) M.fim(como); }
    function sairTreino() {
      if (M.e === 'semBola' || M.e === 'fimSit' || M.saindo || M.acabou) return;
      M.saindo = true; const cartaoAberto = !U.card.hidden, html = U.card.innerHTML, fn = U.card.onclick;
      cartao('<p>' + esc(tr('Sair do treino? Conta como um dos 2 de hoje.')) + '</p><div class="trBt">' + botao(tr('Sair'), false, ' data-r="1"') + botao(tr('Continuar'), true, ' data-r="0"') + '</div>', (b) => {
        M.saindo = false;
        if (b.dataset.r === '1') { fecharCartao(); terminar('saiu'); return; }
        if (cartaoAberto) { U.card.innerHTML = html; U.card.onclick = fn; } else fecharCartao();
      });
    }
    U.sair.onclick = sairTreino;
    // teclado: Espaço/Enter no cartão aperta o botão principal; Esc pergunta se quer sair (não abre a pausa da partida)
    const tecla = (e) => {
      if (M.acabou || (document.getElementById('anuncioTela') && !document.getElementById('anuncioTela').hidden)) return;
      if (e.code === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); sairTreino(); return; }
      if (!U.card.hidden && (e.code === 'Space' || e.code === 'Enter')) { e.preventDefault(); e.stopImmediatePropagation(); if (e.repeat) return; const b = U.card.querySelector('.pxPrim') || U.card.querySelector('button'); if (b) b.click(); }
    };
    window.addEventListener('keydown', tecla, true);

    // ---- COMEÇA: o campo do sintético já está montado; a tela clareia com o nome do CT e o cartão do primeiro desafio
    comecarDesafio(0);
    U.msg.textContent = tr('CT DO SEU NONATO'); U.msg.className = 'trMsg on ouro';
    U.card.hidden = true;
    await api.preto(false, 450);
    setTimeout(() => { if (!M.acabou) { U.msg.className = 'trMsg'; if (M.e === 'cobra' && document.body.classList.contains('desafioCartao')) U.card.hidden = false; } }, 1700);
    const fim = await new Promise((ok) => { M.fim = ok; });
    // ---- ACABOU: tudo sai de cena (o Historia.desafio devolve a tela para a cidade)
    await api.preto(true, 350);
    window.removeEventListener('keydown', tecla, true);
    congelar(false); limparProps(); for (const k in MATS) MATS[k].dispose();
    U.el.remove(); css.remove(); GD.passo = GD.evento = GD.chutou = GD.barreira = null;
    if (window.__treinoCampo === dbg) window.__treinoCampo = null;
    return fim;
  }

  window.FutebolJS.registrarFase({ id: 'treinoCampo', nome: 'Campo de treino', nucleoMinimo: '7.1.7', iniciar: async () => {}, sessao });
})();
