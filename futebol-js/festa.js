/* =====================================================================================================================
   festa.js — AS CENAS DE CAMPEÃO E A NOITE DE PREMIAÇÃO (usadas pela varzea.js e pela serieb.js).
   - Registrado com FutebolJS.registrarFase({ id: 'festa' }) só para o jogo saber baixar o arquivo; NÃO roda como fase.
   - campeao(o): no campo da final (o.cfg vai para montarPartida), o time comemora em vários ângulos (pulando em roda, o jogador de
     joelhos, os outros de aviãozinho em volta), corte para eles se arrumando atrás do troféu, o jogador levantando o troféu (confete,
     a torcida pulando), a volta olímpica com o troféu e, por último, todo mundo sentado no gramado.
   - gala(o): a noite de premiação. Palco, telão, holofotes. A apresentadora chama cada prêmio, o ganhador (de terno, ou de vestido
     se for uma jogadora) atravessa o palco, recebe o troféu na mão e levanta. Prêmios: bola de ouro (artilheiro), chuteira de ouro
     (líder de assistências) e o jogadorzinho de ouro (melhor jogador). nivel 'serieb' = troféus maiores, de base de mármore.
   - Troféus de time: 'varzea' (taça simples de madeira e dourado), 'estadual' (prata), 'regional' (dourado com estrela) e 'serieb'
     (a taça grande de prata e ouro, base de mármore e fitas nas cores do campeão).
   - Quem chama monta a tela antes (sairParaPartida) e desmonta depois (voltarDaPartida); a cena termina com a tela preta.
   - Os objetos na mão ficam onde a mão está: a posição sai do giro do ombro (x abre/fecha, z leva para a frente) e do comprimento do
     braço até o meio da mão (0,57), e a base do troféu fica entre as mãos.
   ===================================================================================================================== */
(() => {
  'use strict';
  const COR = { ouro: 0xe8b830, ouro2: 0xc8941c, ouro3: 0xffe07a, prata: 0xd4d8e0, prata2: 0x9ea4ae, madeira: 0x5a3a22, preto: 0x1c1c22,
    marmore: 0x2a2a32, marmore2: 0x46464f, branco: 0xf4f4f0, vinho: 0x7a1f3d };
  const hexN = (c) => (typeof c === 'number' ? c : parseInt(String(c).slice(1), 16));
  const lerp2 = (a, b, k) => a + (b - a) * k;
  const suave = (k) => k * k * (3 - 2 * k);
  const BRACO = 0.57, OMBRO_Y = 1.27, OMBRO_Z = 0.39;   // do ombro até o meio da mão; altura e afastamento do ombro (makeAthlete)

  // ============================================================================================ OS TROFÉUS (origem = embaixo da base)
  let matOuro = null;
  function ouroMat() { return matOuro || (matOuro = new THREE.MeshLambertMaterial({ color: COR.ouro, flatShading: true, emissive: 0x3a2800 })); }
  function grupo(L, extra) { const g = new THREE.Group(); g.add(L.malha(MAT_CORES)); if (extra) for (const m of extra) g.add(m); return g; }
  // asas da taça: um "C" de cada lado (vertical + duas ligações), no eixo z
  function alcas(L, z0, z1, y0, y1, cor, esp) {
    for (const s of [-1, 1]) {
      L.caixa(esp, y1 - y0 + esp, esp, cor, 0, (y0 + y1) / 2, s * z1);
      for (const y of [y0, y1]) L.caixa(esp, esp, z1 - z0 + esp, cor, 0, y, s * (z0 + z1) / 2);
    }
  }
  function trofeu(tipo, cores) {
    const L = new Lote(); let base = 0.09, baseH = 0.05, extra = null;
    if (tipo === 'seriea') {                                                     // (7.3.0) a taça do Brasileirão A: maior, toda dourada, base preta de mármore
      L.caixa(0.32, 0.1, 0.32, COR.preto, 0, 0.05, 0); L.caixa(0.325, 0.016, 0.325, COR.ouro, 0, 0.1, 0);
      L.caixa(0.006, 0.05, 0.16, COR.ouro3, 0.161, 0.05, 0);
      L.caixa(0.22, 0.07, 0.22, COR.ouro2, 0, 0.143, 0); L.caixa(0.15, 0.05, 0.15, COR.ouro, 0, 0.203, 0);
      L.caixa(0.08, 0.18, 0.08, COR.ouro, 0, 0.318, 0); L.caixa(0.14, 0.04, 0.14, COR.ouro2, 0, 0.428, 0);
      L.caixa(0.2, 0.05, 0.2, COR.ouro, 0, 0.473, 0); L.caixa(0.34, 0.2, 0.34, COR.ouro, 0, 0.598, 0); L.caixa(0.36, 0.03, 0.36, COR.ouro3, 0, 0.713, 0);
      L.caixa(0.22, 0.03, 0.22, COR.ouro2, 0, 0.743, 0); L.caixa(0.09, 0.07, 0.09, COR.ouro3, 0, 0.793, 0);
      alcas(L, 0.17, 0.26, 0.52, 0.68, COR.ouro2, 0.04);
      const c1 = hexN((cores && cores[0]) || '#2a72d6'), c2 = hexN((cores && cores[1]) || '#f4f4f0');
      for (const s of [-1, 1]) { L.caixa(0.012, 0.24, 0.05, c1, 0.02, 0.42, s * 0.262); L.caixa(0.012, 0.22, 0.05, c2, -0.02, 0.43, s * 0.262); }
      base = 0.16; baseH = 0.1;
    } else if (tipo === 'cdb') {                                                 // (7.3.0) a Copa do Brasil: dourada, com as fitas verde e amarela
      L.caixa(0.24, 0.09, 0.24, COR.marmore, 0, 0.045, 0); L.caixa(0.006, 0.04, 0.13, COR.ouro3, 0.121, 0.045, 0);
      L.caixa(0.17, 0.05, 0.17, COR.ouro2, 0, 0.115, 0); L.caixa(0.065, 0.17, 0.065, COR.ouro, 0, 0.225, 0); L.caixa(0.12, 0.035, 0.12, COR.ouro2, 0, 0.327, 0);
      L.caixa(0.17, 0.05, 0.17, COR.ouro, 0, 0.37, 0); L.caixa(0.28, 0.17, 0.28, COR.ouro, 0, 0.48, 0); L.caixa(0.3, 0.025, 0.3, COR.ouro3, 0, 0.577, 0);
      alcas(L, 0.14, 0.22, 0.42, 0.56, COR.ouro2, 0.032);
      for (const s of [-1, 1]) { L.caixa(0.012, 0.2, 0.045, 0x1f8a3a, 0.02, 0.36, s * 0.225); L.caixa(0.012, 0.18, 0.045, 0xf2c230, -0.02, 0.37, s * 0.225); }
      base = 0.12; baseH = 0.09;
    } else if (tipo === 'europa') {                                              // a Copa dos Campeões: prateada, alta, com as alças enormes ("orelhas")
      L.caixa(0.26, 0.1, 0.26, COR.preto, 0, 0.05, 0); L.caixa(0.265, 0.014, 0.265, COR.prata2, 0, 0.1, 0);
      L.caixa(0.18, 0.06, 0.18, COR.prata2, 0, 0.137, 0); L.caixa(0.075, 0.2, 0.075, COR.prata, 0, 0.267, 0); L.caixa(0.13, 0.04, 0.13, COR.prata2, 0, 0.387, 0);
      L.caixa(0.19, 0.05, 0.19, COR.prata, 0, 0.432, 0); L.caixa(0.29, 0.1, 0.29, COR.prata, 0, 0.507, 0); L.caixa(0.33, 0.14, 0.33, COR.prata, 0, 0.627, 0);
      L.caixa(0.35, 0.03, 0.35, COR.prata2, 0, 0.712, 0);
      alcas(L, 0.16, 0.34, 0.4, 0.78, COR.prata2, 0.04);
      base = 0.13; baseH = 0.1;
    } else if (tipo === 'serieb') {
      L.caixa(0.28, 0.09, 0.28, COR.marmore, 0, 0.045, 0); L.caixa(0.285, 0.016, 0.285, COR.ouro, 0, 0.09, 0);
      L.caixa(0.006, 0.04, 0.14, COR.ouro3, 0.141, 0.045, 0);
      L.caixa(0.2, 0.06, 0.2, COR.prata2, 0, 0.128, 0); L.caixa(0.14, 0.05, 0.14, COR.ouro, 0, 0.183, 0);
      L.caixa(0.07, 0.15, 0.07, COR.prata, 0, 0.283, 0); L.caixa(0.12, 0.04, 0.12, COR.ouro, 0, 0.378, 0);
      L.caixa(0.18, 0.05, 0.18, COR.prata, 0, 0.423, 0); L.caixa(0.3, 0.17, 0.3, COR.prata, 0, 0.533, 0); L.caixa(0.32, 0.03, 0.32, COR.ouro, 0, 0.633, 0);
      L.caixa(0.2, 0.03, 0.2, COR.prata2, 0, 0.663, 0); L.caixa(0.08, 0.06, 0.08, COR.ouro, 0, 0.708, 0);
      alcas(L, 0.15, 0.23, 0.47, 0.6, COR.ouro, 0.035);
      const c1 = hexN((cores && cores[0]) || '#2a72d6'), c2 = hexN((cores && cores[1]) || '#f4f4f0');
      for (const s of [-1, 1]) { L.caixa(0.012, 0.2, 0.045, c1, 0.02, 0.38, s * 0.235); L.caixa(0.012, 0.18, 0.045, c2, -0.02, 0.39, s * 0.235); }
      base = 0.14; baseH = 0.09;
    } else if (tipo === 'estadual') {
      L.caixa(0.2, 0.07, 0.2, COR.preto, 0, 0.035, 0); L.caixa(0.005, 0.035, 0.1, COR.prata, 0.101, 0.035, 0);
      L.caixa(0.15, 0.05, 0.15, COR.prata2, 0, 0.095, 0); L.caixa(0.06, 0.13, 0.06, COR.prata, 0, 0.185, 0); L.caixa(0.1, 0.03, 0.1, COR.ouro, 0, 0.265, 0);
      L.caixa(0.16, 0.05, 0.16, COR.prata, 0, 0.305, 0); L.caixa(0.25, 0.14, 0.25, COR.prata, 0, 0.4, 0); L.caixa(0.27, 0.025, 0.27, COR.ouro, 0, 0.48, 0);
      alcas(L, 0.125, 0.19, 0.36, 0.46, COR.prata2, 0.03);
      base = 0.1; baseH = 0.07;
    } else if (tipo === 'regional') {
      L.caixa(0.22, 0.08, 0.22, COR.marmore, 0, 0.04, 0); L.caixa(0.005, 0.04, 0.12, COR.ouro3, 0.111, 0.04, 0);
      L.caixa(0.16, 0.05, 0.16, COR.ouro2, 0, 0.105, 0); L.caixa(0.06, 0.15, 0.06, COR.ouro, 0, 0.205, 0); L.caixa(0.11, 0.035, 0.11, COR.ouro2, 0, 0.297, 0);
      L.caixa(0.16, 0.05, 0.16, COR.ouro, 0, 0.34, 0); L.caixa(0.26, 0.15, 0.26, COR.ouro, 0, 0.44, 0); L.caixa(0.28, 0.025, 0.28, COR.ouro3, 0, 0.527, 0);
      alcas(L, 0.13, 0.2, 0.39, 0.5, COR.ouro2, 0.03);
      L.caixa(0.03, 0.08, 0.03, COR.ouro2, 0, 0.58, 0);                            // a estrela em cima (em pé, de frente)
      for (const [y, w] of [[0.66, 0.03], [0.64, 0.07], [0.62, 0.13], [0.6, 0.09], [0.58, 0.05]]) L.caixa(0.02, 0.02, w, COR.ouro3, 0, y, 0);
      base = 0.11; baseH = 0.08;
    } else {                                                                     // a taça da várzea
      L.caixa(0.18, 0.05, 0.18, COR.madeira, 0, 0.025, 0); L.caixa(0.005, 0.03, 0.08, COR.ouro3, 0.091, 0.025, 0);
      L.caixa(0.13, 0.05, 0.13, COR.ouro2, 0, 0.075, 0); L.caixa(0.05, 0.1, 0.05, COR.ouro, 0, 0.15, 0); L.caixa(0.09, 0.03, 0.09, COR.ouro2, 0, 0.215, 0);
      L.caixa(0.13, 0.04, 0.13, COR.ouro, 0, 0.25, 0); L.caixa(0.2, 0.12, 0.2, COR.ouro, 0, 0.33, 0); L.caixa(0.22, 0.025, 0.22, COR.ouro3, 0, 0.4, 0);
      alcas(L, 0.1, 0.15, 0.29, 0.38, COR.ouro2, 0.025);
    }
    const g = grupo(L, extra); g.userData.base = base; g.userData.baseH = baseH; return g;
  }
  // os prêmios individuais: bola de ouro (art), chuteira de ouro (ass) e jogadorzinho de ouro (melhor)
  function premio(tipo, nivel) {
    const L = new Lote(), grande = nivel === 'serieb' || nivel === 'seriea', k = grande ? 1.3 : 1, extra = [];
    const bw = (grande ? 0.16 : 0.12), bh = grande ? 0.08 : 0.05;
    L.caixa(bw, bh, bw, grande ? COR.marmore : COR.preto, 0, bh / 2, 0);
    if (grande) { L.caixa(bw + 0.006, 0.014, bw + 0.006, COR.ouro, 0, bh, 0); L.caixa(0.005, 0.03, bw * 0.6, COR.ouro3, bw / 2 + 0.003, bh / 2, 0); L.caixa(bw * 0.7, 0.04, bw * 0.7, COR.marmore2, 0, bh + 0.02, 0); }
    const y0 = bh + (grande ? 0.04 : 0);
    if (tipo === 'art') {
      L.caixa(0.04 * k, 0.03 * k, 0.04 * k, COR.ouro2, 0, y0 + 0.015 * k, 0);
      const r = 0.085 * k, bola = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), ouroMat()); bola.position.set(0, y0 + 0.03 * k + r * 0.95, 0); extra.push(bola);
    } else if (tipo === 'ass') {                                                 // a chuteira de lado, bico para a frente (+x)
      const y = y0 + 0.012 * k;
      L.caixa(0.24 * k, 0.025 * k, 0.085 * k, COR.ouro2, 0, y, 0);                       // sola
      for (const x of [-0.08, -0.03, 0.04, 0.09]) L.caixa(0.018 * k, 0.018 * k, 0.07 * k, COR.ouro2, x * k, y - 0.02 * k, 0);   // travas (em cima da base)
      L.caixa(0.15 * k, 0.07 * k, 0.085 * k, COR.ouro, -0.04 * k, y + 0.045 * k, 0);     // cabedal
      L.caixa(0.08 * k, 0.045 * k, 0.08 * k, COR.ouro, 0.07 * k, y + 0.032 * k, 0);      // bico
      L.caixa(0.07 * k, 0.07 * k, 0.08 * k, COR.ouro3, -0.085 * k, y + 0.11 * k, 0);     // cano
      for (const x of [-0.04, 0, 0.04]) L.caixa(0.012 * k, 0.006 * k, 0.088 * k, COR.ouro3, x * k, y + 0.083 * k, 0);  // cadarço
    } else {                                                                     // o jogadorzinho chutando a bola
      const y = y0;
      L.caixa(0.035 * k, 0.1 * k, 0.035 * k, COR.ouro, 0, y + 0.05 * k, -0.025 * k);              // perna de apoio
      L.caixa(0.035 * k, 0.035 * k, 0.1 * k, COR.ouro, 0.03 * k, y + 0.09 * k, 0.045 * k);         // perna do chute (para a frente)
      L.caixa(0.08 * k, 0.11 * k, 0.07 * k, COR.ouro, 0, y + 0.155 * k, 0);                        // tronco
      L.caixa(0.06 * k, 0.06 * k, 0.06 * k, COR.ouro3, 0, y + 0.24 * k, 0);                        // cabeça
      L.caixa(0.025 * k, 0.025 * k, 0.09 * k, COR.ouro2, 0, y + 0.18 * k, 0.07 * k);               // braços abertos
      L.caixa(0.025 * k, 0.025 * k, 0.09 * k, COR.ouro2, 0, y + 0.18 * k, -0.07 * k);
      const bola = new THREE.Mesh(new THREE.IcosahedronGeometry(0.03 * k, 0), ouroMat()); bola.position.set(0.05 * k, y + 0.03 * k, 0.1 * k); extra.push(bola);
    }
    const g = grupo(L, extra); g.userData.base = bw / 2; g.userData.baseH = bh; return g;
  }
  function descartar(o) {
    if (!o) return; if (o.parent) o.parent.remove(o);
    o.traverse((q) => { if (q.geometry && q.geometry !== SHADOW_GEO) q.geometry.dispose(); if (q.material && q.material !== MAT_CORES && q.material !== matOuro && q.material !== SHADOW_MAT) { if (q.material.map) q.material.map.dispose(); q.material.dispose(); } });
  }

  // ============================================================================================ OS BONECOS E AS POSES
  //   ator: { m (makeAthlete), x, z, y, yaw, pose, rota (lista de [x, z]), vel, fase, segura (objeto na mão) }
  function novoAtor(L, o) {
    const m = makeAthlete(o); m.etiqueta.visible = false; scene.add(m.raiz);
    const A = { m, x: 0, z: 0, y: 0, yaw: 0, pose: 'pe', rota: null, vel: 2.2, fase: Math.random() * 6, t0: Math.random() * 3 };
    L.push(A); return A;
  }
  function jogador(L, uni, j) {
    const gk = !!j.gk && !!uni.goleiro;                                          // o goleiro com a camisa e as luvas dele
    return novoAtor(L, { camisa: gk ? uni.goleiro : uni.camisa, listra: uni.listra, gola: uni.gola, numero: j.numero || '', calcao: hexN(uni.calcao), meia: gk ? uni.goleiro : uni.meia, sola: uni.sola, corTexto: j.corTexto || '#F2F2EE', luva: gk ? 0xf2f2ee : null,
      pele: j.pele, cabelo: j.cabelo, estilo: j.estilo | 0, barba: j.barba | 0, rosto: j.rosto | 0, labio: j.labio, corBarba: j.corBarba, manga: j.manga | 0, meiao: j.meiao == null ? 1 : j.meiao, chuteira: j.chuteira | 0,
      nomeCamisa: j.nomeCamisa || '', nome: ' ', fundoNome: 'rgba(0,0,0,0)', emblema: uni.emblema || null,
      modelo: typeof modeloDaCamisa === 'function' ? modeloDaCamisa(uni, gk) : null, peito: uni.peito });
  }
  // de terno (ou de vestido vinho, se for uma jogadora): camisa branca e gravata por cima do peito
  function deTerno(L, j, cor) {
    const fem = j.genero === 'F', c = cor || (fem ? '#7a1f3d' : '#1c1c26');
    const A = novoAtor(L, { camisa: c, listra: c, gola: fem ? c : '#f4f4f0', numero: '', calcao: hexN(c), meia: fem ? '#e8c0a0' : c, sola: '#111111', corTexto: '#F2F2EE',
      pele: j.pele, cabelo: j.cabelo, estilo: j.estilo | 0, barba: j.barba | 0, rosto: j.rosto | 0, labio: j.labio, corBarba: j.corBarba, manga: 1, meiao: fem ? 0 : 2, nomeCamisa: '', nome: ' ', fundoNome: 'rgba(0,0,0,0)', emblema: { vazio: true } });
    pintarCoxas(A.m, c);                                                         // calça (ou a saia do vestido) por cima da coxa
    const D = new Lote();
    if (fem) { D.caixa(0.012, 0.05, 0.3, COR.ouro3, 0.162, 1.24, 0); D.caixa(0.01, 0.06, 0.06, COR.ouro3, 0.164, 1.18, 0); }   // colar
    else {
      D.caixa(0.01, 0.2, 0.16, COR.branco, 0.163, 1.2, 0);                       // a camisa no V do paletó
      D.caixa(0.012, 0.2, 0.05, 0x8a1f2a, 0.167, 1.18, 0); D.caixa(0.012, 0.035, 0.07, 0x8a1f2a, 0.167, 1.29, 0);   // gravata e o nó
      D.caixa(0.012, 0.03, 0.06, COR.branco, 0.163, 1.1, -0.17);                 // lencinho no bolso
    }
    A.m.corpo.add(D.malha(MAT_CORES)); return A;
  }
  function pintarCoxas(m, cor) {
    const n = hexN(cor), r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
    for (const pe of [m.pernaE, m.pernaD]) for (const mesh of [pe.inteira, pe.coxa]) {
      const at = mesh && mesh.geometry && mesh.geometry.attributes.color; if (!at) continue;
      for (let i = 0; i < 24 && i < at.count; i++) at.setXYZ(i, r, g, b);
      at.needsUpdate = true;
    }
  }
  // a mão (o meio dela) no espaço do corpo, para um giro de ombro (x: abre/fecha, z: para a frente) — lado -1 esquerdo, +1 direito
  function maoNoCorpo(lado, gx, gz) {
    const c = Math.cos(gx);
    return { x: BRACO * c * Math.sin(gz), y: OMBRO_Y - BRACO * c * Math.cos(gz), z: lado * OMBRO_Z - BRACO * Math.sin(gx) };   // gx = o rotation.x daquele braço
  }
  // o troféu levantado com as duas mãos: as mãos pegam os lados da base, à frente e acima do rosto
  function pegaDuasMaos(A, T) {
    const bw = T.userData.base, inw = Math.asin(Math.min(0.95, (OMBRO_Z - (bw + 0.085)) / BRACO)), gz = bw > 0.12 ? 2.32 : 2.45;
    A.levanta = { inw, gz };
    const h = maoNoCorpo(1, inw, gz);                                            // o braço direito fecha com x positivo
    A.m.corpo.add(T); T.position.set(Math.max(h.x, bw + 0.25), h.y - T.userData.baseH / 2, 0); T.rotation.set(0, 0, 0);
    A.segura = T;
  }
  // o prêmio na mão direita: 'frente' (recebendo, na altura do peito) ou 'alto' (levantado)
  // (7.4.13) o prêmio fica APOIADO NA PONTINHA DA MÃO (a base em cima dos dedos), e não atravessando a mão: a caixa da mão tem
  //   0,17 m e o meio dela fica a 0,57 m do ombro. Levantado (braço quase de pé): a base em cima da ponta dos dedos. Na frente
  //   (braço esticado): na ponta da mão, em cima da palma.
  const MEIA_MAO = 0.085;
  function pegaUmaMao(A, P, modo) {
    const gx = modo === 'alto' ? 0 : 0.15, gz = modo === 'alto' ? 2.9 : 1.2;
    A.umaMao = { gx, gz };
    const h = maoNoCorpo(1, gx, gz), d = { x: h.x / BRACO, y: (h.y - OMBRO_Y) / BRACO, z: (h.z - OMBRO_Z) / BRACO };   // a direção do braço
    let x, y, z;
    if (modo === 'alto') { x = h.x + d.x * (MEIA_MAO + 0.004); y = h.y + d.y * (MEIA_MAO + 0.004); z = h.z + d.z * (MEIA_MAO + 0.004); }
    else {
      const up = d.y, nx = -d.x * up, ny = 1 - d.y * up, nz = -d.z * up, nl = Math.hypot(nx, ny, nz) || 1;   // "para cima" da mão (perpendicular ao braço)
      x = h.x + d.x * 0.055 + nx / nl * (MEIA_MAO + 0.004); y = h.y + d.y * 0.055 + ny / nl * (MEIA_MAO + 0.004); z = h.z + d.z * 0.055 + nz / nl * (MEIA_MAO + 0.004);
    }
    A.m.corpo.add(P); P.position.set(x, y, z); P.rotation.set(0, 0, 0);
    A.segura = P;
  }
  function soltar(A) { if (A.segura && A.segura.parent) A.segura.parent.remove(A.segura); A.segura = null; A.levanta = null; A.umaMao = null; }
  function poseAtor(A, t, dt) {
    const m = A.m, r = m.raiz, f = t * 2 + A.fase;
    // movimento pela rota (andando, correndo de aviãozinho)
    let anda = false;
    if (A.rota && A.rota.length) {
      const [tx, tz] = A.rota[0], dx = tx - A.x, dz = tz - A.z, d = Math.hypot(dx, dz), st = A.vel * dt;
      if (d <= st) { A.x = tx; A.z = tz; A.rota.shift(); if (!A.rota.length && A.circulo) A.rota = null; } else { A.x += dx / d * st; A.z += dz / d * st; anda = true; A.yaw = Math.atan2(dz, dx); }
    }
    if (A.circulo) {                                                            // correndo em volta de um ponto (aviãozinho)
      const C = A.circulo; C.a += dt * C.w; A.x = C.cx + Math.cos(C.a) * C.r; A.z = C.cz + Math.sin(C.a) * C.r; A.yaw = Math.atan2(Math.cos(C.a) * C.w, -Math.sin(C.a) * C.w); anda = true;
    }
    if (A.olha != null && !anda) A.yaw = A.olha;
    // tudo de volta ao normal
    usarJoelhos(m, 0, 0); usarCotovelo(m.bracoE, 0, 0); usarCotovelo(m.bracoD, 0, 0); usarCabeca(m, 0);
    m.corpo.rotation.set(0, 0, 0); r.rotation.x = 0; r.rotation.z = 0;
    m.pernaE.rotation.set(0, 0, 0); m.pernaD.rotation.set(0, 0, 0); m.bracoE.rotation.set(0, 0, 0); m.bracoD.rotation.set(0, 0, 0);
    let y = A.y;
    const passada = (amp, vel) => { const s = Math.sin(t * vel + A.fase); m.pernaE.rotation.z = s * amp; m.pernaD.rotation.z = -s * amp; return s; };
    const p = A.pose;
    if (p === 'pula') {
      const pul = Math.max(0, Math.sin(f * 3.2)); y += pul * 0.34;
      m.bracoE.rotation.z = 2.75 + Math.sin(f * 3.2) * 0.25; m.bracoD.rotation.z = 2.75 - Math.sin(f * 3.2) * 0.25; m.bracoE.rotation.x = 0.35; m.bracoD.rotation.x = -0.35;
      m.pernaE.rotation.z = m.pernaD.rotation.z = -pul * 0.25; usarJoelhos(m, -pul * 0.6, -pul * 0.6);
    } else if (p === 'grita') {                                                  // braços em V, peito para a frente
      m.bracoE.rotation.z = 2.35; m.bracoD.rotation.z = 2.35; m.bracoE.rotation.x = 0.7; m.bracoD.rotation.x = -0.7; m.corpo.rotation.z = -0.12 + Math.sin(f * 4) * 0.03;
      usarCabeca(m, 0.25); y += Math.abs(Math.sin(f * 4)) * 0.03;
    } else if (p === 'ajoelha') {                                                // de joelhos no gramado, punhos para cima
      usarJoelhos(m, -1.55, -1.55); y += -0.4;
      m.bracoE.rotation.z = 2.8 + Math.sin(f * 5) * 0.12; m.bracoD.rotation.z = 2.8 - Math.sin(f * 5) * 0.12; m.bracoE.rotation.x = 0.3; m.bracoD.rotation.x = -0.3;
      usarCabeca(m, 0.3); m.corpo.rotation.z = -0.15;
    } else if (p === 'aviao') {
      passada(0.95, 11); m.bracoE.rotation.x = 1.45; m.bracoD.rotation.x = -1.45; m.bracoE.rotation.z = m.bracoD.rotation.z = 0.15;
      r.rotation.x = Math.sin(t * 2 + A.fase) * 0.22; m.corpo.rotation.z = 0.12; y += Math.abs(Math.cos(t * 11 + A.fase)) * 0.06;
    } else if (p === 'palmas') {
      const k = Math.abs(Math.sin(f * 6)); m.bracoE.rotation.z = m.bracoD.rotation.z = 1.25; m.bracoE.rotation.x = -0.25 - k * 0.12; m.bracoD.rotation.x = 0.25 + k * 0.12;
      usarCotovelo(m.bracoE, -0.5, 0.4); usarCotovelo(m.bracoD, 0.5, 0.4);
    } else if (p === 'acena') {
      if (anda) passada(0.6, 7);
      m.bracoD.rotation.z = 2.6; m.bracoD.rotation.x = -0.35 + Math.sin(f * 4) * 0.3; m.bracoE.rotation.z = anda ? -Math.sin(t * 7 + A.fase) * 0.5 : 0.1;
    } else if (p === 'arruma') {                                                 // se arrumando: puxa a camisa e ajeita o cabelo
      const k = (Math.sin(f * 1.6) + 1) / 2;
      m.bracoD.rotation.z = lerp2(0.9, 2.2, k); usarCotovelo(m.bracoD, 0.4, lerp2(1.3, 1.6, k)); m.bracoE.rotation.z = 0.5; usarCotovelo(m.bracoE, -0.3, 1.2);
    } else if (p === 'levanta' || p === 'levantaAnda') {                         // o troféu com as duas mãos, à frente e acima do rosto
      const L = A.levanta || { inw: 0.38, gz: 2.45 };
      if (p === 'levantaAnda') passada(0.55, 7); else y += Math.abs(Math.sin(f * 3)) * 0.05;
      m.bracoE.rotation.z = m.bracoD.rotation.z = L.gz; m.bracoE.rotation.x = -L.inw; m.bracoD.rotation.x = L.inw; usarCabeca(m, 0.3);
    } else if (p === 'premio') {                                                 // o prêmio na mão direita
      const U = A.umaMao || { gx: 0.15, gz: 1.2 };
      m.bracoD.rotation.z = U.gz; m.bracoD.rotation.x = U.gx; m.bracoE.rotation.z = U.gz > 2 ? 0.25 : 0.12;
      if (U.gz > 2) { usarCabeca(m, 0.15); y += Math.abs(Math.sin(f * 3)) * 0.03; }
    } else if (p === 'sentado') {                                                // sentado no gramado, pernas esticadas, mãos apoiadas atrás
      m.pernaE.rotation.z = m.pernaD.rotation.z = 1.5; y += -0.62;
      m.bracoE.rotation.z = m.bracoD.rotation.z = -0.55; m.bracoE.rotation.x = 0.28; m.bracoD.rotation.x = -0.28;
      m.corpo.rotation.z = -0.22; usarCabeca(m, 0.12 + Math.sin(f) * 0.05);
    } else if (p === 'apresenta') {                                              // a apresentadora: microfone na mão esquerda, a outra gesticula
      m.bracoE.rotation.z = 1.4; m.bracoE.rotation.x = -0.25; usarCotovelo(m.bracoE, -0.6, 1.2);
      if (!A.segura) { m.bracoD.rotation.z = A.fala ? 0.6 + Math.sin(f * 5) * 0.35 : 0.15; m.bracoD.rotation.x = -0.15; }
      else { const U = A.umaMao; m.bracoD.rotation.z = U.gz; m.bracoD.rotation.x = U.gx; }
    } else {                                                                     // em pé
      if (anda) { const s = passada(0.7, 8); m.bracoE.rotation.z = -s * 0.5; m.bracoD.rotation.z = s * 0.5; }
      else { m.bracoE.rotation.z = A.fala ? Math.sin(f * 5) * 0.3 + 0.35 : 0.06; m.bracoD.rotation.z = A.fala ? Math.sin(f * 5 + 2) * 0.3 + 0.35 : 0.06; }
    }
    r.position.set(A.x, y, A.z); r.rotation.y = -A.yaw;
    m.sombra.visible = p !== 'sentado' && p !== 'ajoelha';
  }

  // ============================================================================================ CONFETE (uma malha só de pontos)
  function confete(n, cx, cz, cores) {
    const g = new THREE.BufferGeometry(), pos = new Float32Array(n * 3), cor = new Float32Array(n * 3), vel = [];
    const pal = (cores || ['#f2c230', '#ffffff', '#e8402e', '#2a72d6', '#3cc46a']).map((c) => new THREE.Color(c));
    for (let i = 0; i < n; i++) {
      pos[i * 3] = cx + (Math.random() - 0.5) * 6; pos[i * 3 + 1] = 3 + Math.random() * 4; pos[i * 3 + 2] = cz + (Math.random() - 0.5) * 4;
      const c = pal[i % pal.length]; cor[i * 3] = c.r; cor[i * 3 + 1] = c.g; cor[i * 3 + 2] = c.b; vel.push(0.5 + Math.random() * 0.8, Math.random() * 6);
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(cor, 3));
    const p = new THREE.Points(g, new THREE.PointsMaterial({ size: 0.09, vertexColors: true })); p.frustumCulled = false; scene.add(p);
    p.userData.tick = (dt, t) => { const a = g.attributes.position; for (let i = 0; i < n; i++) { let y = a.array[i * 3 + 1] - vel[i * 2] * dt; if (y < 0.03) y = 0.03; a.array[i * 3 + 1] = y; a.array[i * 3] += Math.sin(t * 2 + vel[i * 2 + 1]) * dt * 0.3; } a.needsUpdate = true; };
    return p;
  }

  // ============================================================================================ A CÂMERA (planos com movimento)
  function cameraPlano(c, k) {
    const e = suave(Math.min(1, Math.max(0, k))), P = c.p2 ? c.p.map((v, i) => lerp2(v, c.p2[i], e)) : c.p, A = c.t2 ? c.t.map((v, i) => lerp2(v, c.t2[i], e)) : c.t;
    camera.position.set(P[0], P[1], P[2]); camera.lookAt(A[0], A[1], A[2]);
  }
  // o HUD da partida (placar, radar, joystick, botões) some durante a festa e volta como estava
  function esconderHudPartida() {
    const tinha = document.body.classList.contains('criadorAberto'), hud = document.getElementById('hud'), vis = hud ? hud.style.visibility : '';
    document.body.classList.add('criadorAberto'); if (hud) hud.style.visibility = 'hidden';
    try { if (typeof setLetterbox === 'function') setLetterbox(false); const sk = document.getElementById('skipBtn'), cl = document.getElementById('cineLabel'); if (sk) sk.hidden = true; if (cl) cl.textContent = ''; } catch (e) { /* nada */ }
    return () => { if (!tinha) document.body.classList.remove('criadorAberto'); if (hud) hud.style.visibility = vis; };
  }
  function esconderJogo(meus) {
    for (const A of ATLETAS) A.raiz.visible = meus.has(A);
    ball.mesh.visible = ball.shadow.visible = false; userRing.visible = targetRing.visible = dribbleRing.visible = aimArrow.visible = false;
    if (typeof officials !== 'undefined') for (const o of officials) o.mesh.raiz.visible = false;
  }

  // ============================================================================================ CAMPEÃO
  //   o: { cfg (a partida da final, para montar o campo), lado (+1: a torcida/arquibancada está em z > 0; −1: em z < 0),
  //        uni (uniforme do motor), jogadores: [{ ...aparência, numero, nomeCamisa, voce }], trofeu, cores, io: { preto, esperar } }
  async function campeao(o) {
    const io = o.io, s = o.lado || 1, L = [], extras = [];
    montarPartida(o.cfg); kickoff(0); G.state = 'menu'; snapCamera();
    const voltaHud = esconderHudPartida();
    const lista = o.jogadores.slice(), iv = Math.max(0, lista.findIndex((j) => j.voce)), voce = jogador(L, o.uni, lista[iv]);
    const outros = lista.filter((j, i) => i !== iv).map((j) => jogador(L, o.uni, j));
    const T = trofeu(o.trofeu, o.cores);
    const meus = new Set(L.map((A) => A.m));
    let plano = null, t0 = performance.now(), conf = null;
    const quadro = (rdt) => {
      const t = performance.now() / 1000, dt = Math.min(0.05, rdt || 0.016);
      esconderJogo(meus);
      for (const A of L) poseAtor(A, t, dt);
      if (conf) conf.userData.tick(dt, t);
      if (plano) cameraPlano(plano, (performance.now() - t0) / 1000 / (plano.dur || 1));
    };
    const corta = (c) => { plano = c; t0 = performance.now(); };
    GANCHO_RENDER = quadro;
    const ZC = s * 2;                                                            // o centro da festa (do lado da torcida)
    const virar = (A, x, z) => { A.olha = Math.atan2(z - A.z, x - A.x); A.yaw = A.olha; };
    const torcida = () => { try { crowd.comemorar(0); } catch (e) { /* nada */ } };
    try {
      // 0) (7.4.0) jogo grande num estádio do Brasileirão A: o estádio por fora com a queima de fogos
      if (o.cfg && o.cfg.fogos && window.EstadiosA && typeof ESTADIO_A !== 'undefined' && ESTADIO_A) {
        await io.preto(false, 500);
        await window.EstadiosA.cena({ fogos: true, dur: 6.5, texto: window.T('É CAMPEÃO!') });   // (aqui dentro o T é o troféu: a tradução é a do jogo, window.T)
        await io.preto(true, 450);
      }
      // 1) comemorando em roda, pulando (câmera baixa girando)
      const N = outros.length + 1, roda = [voce].concat(outros);
      roda.forEach((A, i) => { const a = i / N * Math.PI * 2; A.x = Math.cos(a) * 1.5; A.z = ZC + Math.sin(a) * 1.5; A.pose = 'pula'; virar(A, 0, ZC); });
      corta({ p: [-3.8, 1.0, ZC - s * 5.4], p2: [3.0, 1.15, ZC - s * 5.6], t: [0, 1.2, ZC], dur: 3.4 }); torcida();
      try { Som.apito(0.5); } catch (e) { /* nada */ }
      await io.preto(false, 500); await io.esperar(3300);
      // 2) o jogador de joelhos, os outros gritando atrás dele
      voce.x = 0; voce.z = ZC - s * 0.6; voce.pose = 'ajoelha'; virar(voce, 0, ZC - s * 5);
      outros.forEach((A, i) => { const k = (i - (outros.length - 1) / 2); A.x = k * 0.95; A.z = ZC + s * (1.1 + (i % 2) * 0.55); A.pose = i % 2 ? 'grita' : 'pula'; virar(A, 0, ZC - s * 5); });
      corta({ p: [1.1, 1.0, ZC - s * 4.2], p2: [0.5, 0.95, ZC - s * 3.4], t: [0, 1.0, ZC + s * 0.4], dur: 3 }); torcida();
      await io.esperar(3000);
      // 3) aviãozinho em volta do jogador (câmera alta)
      voce.pose = 'grita'; voce.x = 0; voce.z = ZC; voce.y = 0;
      const nIn = Math.ceil(outros.length / 2);                                 // duas rodas, todos no mesmo sentido, 2,3 m entre elas: os braços abertos nunca se cruzam
      outros.forEach((A, i) => { const fora = i >= nIn, n = fora ? outros.length - nIn : nIn, k = fora ? i - nIn : i; A.pose = 'aviao'; A.circulo = { cx: 0, cz: ZC, r: fora ? 4.8 : 2.5, a: (k + (fora ? 0.5 : 0)) / n * Math.PI * 2, w: fora ? 0.5 : 0.9 }; });
      corta({ p: [-5.5, 5.2, ZC - s * 8], p2: [-2, 4.4, ZC - s * 8.6], t: [0, 0.6, ZC], dur: 3.2 }); torcida();
      await io.esperar(3200);
      await io.preto(true, 450);
      // 4) se arrumando atrás do troféu (o pedestal, o organizador de terno)
      for (const A of outros) A.circulo = null;
      const ped = new Lote(); ped.caixa(0.5, 0.95, 0.5, 0x2a3f66, 0, 0.475, 0); ped.caixa(0.56, 0.05, 0.56, 0xf4f4f0, 0, 0.97, 0); ped.caixa(0.52, 0.12, 0.003, 0xf2c230, 0, 0.75, 0.252);
      const pedestal = ped.malha(MAT_CORES); pedestal.position.set(0, 0, ZC - s * 0.9); pedestal.rotation.y = s > 0 ? 0 : Math.PI; scene.add(pedestal); extras.push(pedestal);
      scene.add(T); T.position.set(0, 1.0, ZC - s * 0.9); T.rotation.set(0, s > 0 ? -Math.PI / 2 : Math.PI / 2, 0);
      const org = deTerno(L, Object.assign({ genero: 'M' }, typeof gerarAparencia === 'function' ? gerarAparencia(sementeDe('organizador'), 'M') : {})); meus.add(org.m);
      org.x = 1.15; org.z = ZC - s * 0.9; virar(org, 0, ZC - s * 5); org.pose = 'palmas';
      const fila = [voce].concat(outros), meio = Math.floor(fila.length / 2), ordem = [];
      fila.forEach((A, i) => { ordem[i < meio ? i : i + 1] = A; });
      const posFila = (k) => { const n = fila.length, c = k - (n - 1) / 2; return [c * 0.82, ZC + s * (0.25 + Math.abs(c) * 0.06)]; };
      const lugar = fila.slice(1); lugar.splice(Math.floor(lugar.length / 2), 0, voce);
      lugar.forEach((A, k) => { const [x, z] = posFila(k); A.x = x + (Math.random() - 0.5) * 3; A.z = z + s * (1.5 + Math.random() * 2); A.y = 0; A.pose = 'pe'; A.olha = null; A.rota = [[x, z]]; A.vel = 1.9; A.alvoOlha = Math.atan2(-s, 0); });
      corta({ p: [0, 1.75, ZC - s * 6.2], t: [0, 1.05, ZC + s * 0.3], dur: 4 });
      await io.preto(false, 450);
      for (let k = 0; k < 24; k++) { await io.esperar(100); for (const A of lugar) if (!A.rota || !A.rota.length) { A.olha = A.alvoOlha; if (A !== voce && A.pose === 'pe') A.pose = Math.random() < 0.5 ? 'arruma' : 'palmas'; } }
      for (const A of lugar) { A.rota = null; A.olha = A.alvoOlha; }
      voce.pose = 'pe'; await io.esperar(1000);
      // 5) levantando o troféu: o jogador pega, levanta, o time pula, confete
      voce.rota = [[0, ZC - s * 0.45]]; voce.vel = 1.2; await io.esperar(700); voce.rota = null; voce.olha = Math.atan2(-s, 0);
      pegaDuasMaos(voce, T); voce.pose = 'levanta'; pedestal.visible = false;   // o troféu saiu do pedestal
      for (const A of outros) A.pose = 'pula'; org.pose = 'palmas';
      conf = confete(260, 0, ZC, o.cores); extras.push(conf); torcida();
      if (o.cfg && o.cfg.fogos && window.EstadiosA && typeof ESTADIO_A !== 'undefined' && ESTADIO_A) try { window.EstadiosA.fogos({ dur: 9, ritmo: 2.4 }); } catch (e) { /* sem fogos */ }   // (7.4.0) fogos em cima do estádio
      corta({ p: [0.6, 0.55, ZC - s * 4.6], p2: [0.2, 0.8, ZC - s * 3.4], t: [0, 1.6, ZC], dur: 4.2 });
      await io.esperar(4300);
      await io.preto(true, 450);
      // 6) a volta olímpica com o troféu, todo mundo acenando para a torcida
      scene.remove(pedestal); scene.remove(conf); org.m.raiz.visible = false; meus.delete(org.m);
      const zv = s * (HALF_W - 2.4), x0 = -9;
      voce.x = x0; voce.z = zv; voce.pose = 'levantaAnda'; voce.rota = [[x0 + 14, zv]]; voce.vel = 1.6; voce.olha = null;
      outros.forEach((A, i) => { const lin = Math.floor(i / 4), col = i % 4; A.x = x0 - 1.3 - lin * 1.1; A.z = zv - s * (col * 0.9 - 1.2); A.pose = 'acena'; A.rota = [[A.x + 14, A.z]]; A.vel = 1.6; A.olha = null; });
      corta({ p: [x0 + 1.8, 1.45, zv - s * 4.6], p2: [x0 + 9.2, 1.5, zv - s * 4.6], t: [x0 + 0.6, 1.25, zv], t2: [x0 + 8, 1.25, zv], dur: 5.5 }); torcida();
      await io.preto(false, 450); await io.esperar(5300);
      await io.preto(true, 450);
      // 7) sentados no gramado, o troféu na frente do jogador
      soltar(voce); scene.add(T); T.rotation.set(0, s > 0 ? -Math.PI / 2 : Math.PI / 2, 0);
      const sent = fila.slice(1); sent.splice(Math.floor(sent.length / 2), 0, voce);
      sent.forEach((A, k) => { const c = k - (sent.length - 1) / 2; A.rota = null; A.circulo = null; A.x = c * 0.82; A.z = ZC + s * (0.4 + Math.abs(c) * 0.12); A.pose = 'sentado'; A.olha = Math.atan2(-s, 0); A.yaw = A.olha; });
      T.position.set(0, 0, ZC - s * 0.95);
      corta({ p: [0.3, 1.0, ZC - s * 4.2], p2: [0, 1.15, ZC - s * 4.9], t: [0, 0.45, ZC], dur: 4.5 });
      await io.preto(false, 600); await io.esperar(4300);
      await io.preto(true, 700);
    } finally {
      GANCHO_RENDER = null; voltaHud();
      descartar(T); for (const e of extras) descartar(e);
      for (const A of L) { ATLETAS.delete(A.m); descartar(A.m.raiz); }
    }
  }

  // ============================================================================================ A NOITE DE PREMIAÇÃO
  // (7.4.13) AS 7 APRESENTADORAS (uma sorteada por noite): pele, cabelo e a cor do vestido de cada uma; o rosto e o penteado saem
  //   da semente (gerarAparencia). o.apresentadora (0 a 6) escolhe uma.
  const APRESENTADORAS = [
    { s: 'apresentadora-gala', vestido: '#1d4fa0' },
    { s: 'apresentadora-2-camila', vestido: '#b0182a', pele: '#f0c8a8', cabelo: '#2a1a10' },
    { s: 'apresentadora-3-joana', vestido: '#126b4a', pele: '#7a4a2c', cabelo: '#0e0a08' },
    { s: 'apresentadora-4-renata', vestido: '#b8862b', pele: '#d9a27c', cabelo: '#c8a050' },
    { s: 'apresentadora-5-patricia', vestido: '#16161c', pele: '#a86b45', cabelo: '#5a2a14' },
    { s: 'apresentadora-6-luana', vestido: '#5b2a86', pele: '#e8b896', cabelo: '#8a2a1a' },
    { s: 'apresentadora-7-beatriz', vestido: '#c2457a', pele: '#5c3a22', cabelo: '#141010' },
  ];
  function apresentadoraDe(i) {
    const A = APRESENTADORAS[((i | 0) % APRESENTADORAS.length + APRESENTADORAS.length) % APRESENTADORAS.length];
    const ap = Object.assign({ genero: 'F' }, typeof gerarAparencia === 'function' ? gerarAparencia(sementeDe(A.s), 'F') : {});
    if (A.pele) ap.pele = A.pele; if (A.cabelo) ap.cabelo = A.cabelo; ap.barba = 0; ap.genero = 'F';
    return { ap, vestido: A.vestido };
  }
  // (7.4.13) 50 FALAS DE QUEM RECEBE UM PRÊMIO: 25 humildes ('h') e 25 mais individualistas ('i'). O 3º texto é o da jogadora
  //   (só quando muda). O ganhador da IA diz uma sorteada; quando é você, aparecem 5 para escolher (3 humildes e 2 individualistas).
  const FALAS_PREMIO = [
    ['h', 'Esse prêmio é de todo o time. Sem os meus companheiros, nada disso acontecia.'],
    ['h', 'Agradeço a cada um que dividiu o campo comigo nesta temporada.'],
    ['h', 'Agradeço à comissão técnica, aos roupeiros, ao pessoal da cozinha... todo mundo joga junto.'],
    ['h', 'Divido este troféu com a minha família, que sempre acreditou em mim.'],
    ['h', 'Eu só terminei as jogadas. Quem fez o trabalho pesado foi o time.'],
    ['h', 'Não esperava por isso. Só quero continuar aprendendo e ajudando o grupo.'],
    ['h', 'Esse prêmio vai para a torcida, que empurrou a gente em todos os jogos.'],
    ['h', 'Tem muita gente aqui que merecia isso tanto quanto eu.'],
    ['h', 'Agradeço a Deus, à família e aos companheiros. É de todos nós.'],
    ['h', 'Lá no começo, eu jogava no campinho de terra do bairro. Hoje estou aqui. Valeu, futebol!'],
    ['h', 'Quem merece os aplausos são os meus companheiros. Eu só estava no lugar certo.'],
    ['h', 'Este troféu é pequeno perto do que o grupo construiu este ano.'],
    ['h', 'Ao nosso treinador: valeu pela confiança desde o primeiro dia.'],
    ['h', 'Vou guardar esse prêmio com carinho, mas o que importa mesmo é o time vencer.'],
    ['h', 'Prêmio individual é bom, mas eu trocaria por mais um título com o grupo.'],
    ['h', 'Aos mais novos da base: treinem, que um dia vocês estão aqui também.'],
    ['h', 'Dedico aos meus pais, que me levavam para todos os treinos.'],
    ['h', 'Ninguém ganha nada sozinho no futebol. Isso aqui é do vestiário inteiro.'],
    ['h', 'Teve jogo em que eu errei muito, e o time me segurou. Esse prêmio é deles.'],
    ['h', 'Só tenho a agradecer. Foi uma temporada de muito trabalho de todo mundo.'],
    ['h', 'Quero dividir isso com o roupeiro, o massagista e o pessoal que ninguém vê.'],
    ['h', 'Cada passe que eu recebi tinha o suor de um companheiro. Valeu, time!'],
    ['h', 'Isso aqui é para quem acordou cedo para treinar comigo debaixo de chuva.'],
    ['h', 'Fico feliz, mas amanhã a gente volta ao trabalho. O próximo jogo é o que importa.'],
    ['h', 'Um abraço especial para a torcida. Vocês fizeram a diferença.'],
    ['i', 'Eu sabia que esse prêmio ia ser meu. Trabalhei a temporada inteira para isso.'],
    ['i', 'Os números falam por si: fui o melhor do campeonato, e ponto.', 'Os números falam por si: fui a melhor do campeonato, e ponto.'],
    ['i', 'Já pode ir reservando o lugar na estante para o ano que vem.'],
    ['i', 'Muita gente duvidou de mim. Hoje eu estou aqui com o troféu na mão.'],
    ['i', 'Esse é só o primeiro. Vou ganhar muitos outros.'],
    ['i', 'Quem joga como eu joguei não podia sair daqui sem nada.'],
    ['i', 'Eu avisei no começo do ano: esse prêmio tinha dono.'],
    ['i', 'Pode colocar o meu nome na história desse campeonato.'],
    ['i', 'Mereço cada grama desse troféu. Ninguém fez o que eu fiz.'],
    ['i', 'Agora quero ver quem vai me criticar.'],
    ['i', 'Trabalhei mais do que todo mundo. O resultado está aqui.'],
    ['i', 'Não tem segredo: talento e treino. E eu tenho os dois.'],
    ['i', 'Os outros que corram atrás. Eu já estou na frente.'],
    ['i', 'Ano que vem eu volto para buscar mais um. Podem anotar.'],
    ['i', 'Os clubes grandes estão vendo. O meu futuro é lá em cima.'],
    ['i', 'Esse troféu combina comigo, não acham?'],
    ['i', 'O campeonato teve um nome, e todo mundo sabe qual é.'],
    ['i', 'Sem falsa modéstia: foi a melhor temporada da minha vida, e a melhor da liga.'],
    ['i', 'Ninguém me deu nada. Eu fui lá e conquistei.'],
    ['i', 'Quem apostou contra mim perdeu dinheiro.'],
    ['i', 'Vou mandar fazer uma réplica desse troféu para cada cômodo da minha casa.'],
    ['i', 'A torcida adversária também vai ter que me aplaudir.'],
    ['i', 'Se tivesse um prêmio acima desse, seria meu também.'],
    ['i', 'Pode chamar a imprensa: hoje eu dou entrevista para todo mundo.'],
    ['i', 'Eu nasci para levantar troféus. Esse é o primeiro de muitos.'],
  ];
  const falaPremio = (x, fem) => T(fem && x[2] ? x[2] : x[1]);
  const sorteia = (L) => L[Math.floor(Math.random() * L.length)];
  function cincoFalas(usadas) {
    const livres = (tipo) => FALAS_PREMIO.filter((x) => x[0] === tipo && !usadas.has(x[1]));
    const tira = (L, n) => { const out = []; L = L.slice(); while (out.length < n && L.length) out.push(L.splice(Math.floor(Math.random() * L.length), 1)[0]); return out; };
    const op = tira(livres('h'), 3).concat(tira(livres('i'), 2));
    for (let i = op.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [op[i], op[j]] = [op[j], op[i]]; }
    return op;
  }
  // (7.4.13) OS FOTÓGRAFOS: flashes piscando na frente do palco (o ganhador acende com a luz do flash) + o som da câmera
  function montarFlashes(g) {
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    const geo = new THREE.PlaneGeometry(0.16, 0.11), L = [];
    // as câmeras ficam na beira do palco, na frente e embaixo de quem está sendo fotografado (aparecem na parte de baixo da tela)
    for (let i = 0; i < 12; i++) {
      const m = new THREE.Mesh(geo, mat.clone());
      m.position.set(0.85 + (Math.random() - 0.5) * 3.2, 0.45 + Math.random() * 0.75, 2.0 + Math.random() * 0.9);
      g.add(m); L.push({ m, t: 0 });
    }
    const luz = new THREE.PointLight(0xffffff, 0, 8); luz.position.set(0.9, 2.1, 2.6); g.add(luz);
    // e um clarão bem de leve na tela inteira (o flash "estourando" na frente da câmera)
    const clarao = document.createElement('div');
    clarao.style.cssText = 'position:fixed;inset:0;z-index:29;background:#fff;opacity:0;pointer-events:none;transition:opacity .14s ease-out';
    (document.getElementById('raizJogo') || document.body).appendChild(clarao);
    const F = { L, luz, ate: 0, prox: 0, clarao };
    F.disparar = () => {
      const f = sorteia(L); f.t = 0.16; F.luz.intensity = 1.25; F.luz.position.set(f.m.position.x, 1.6, f.m.position.z);
      if (Math.random() < 0.45) { clarao.style.transition = 'none'; clarao.style.opacity = '0.16'; void clarao.offsetWidth; clarao.style.transition = 'opacity .16s ease-out'; clarao.style.opacity = '0'; }
      try { if (Som.flash) Som.flash(Math.random() * 0.4); } catch (e) { /* sem som */ }
    };
    F.remover = () => clarao.remove();
    F.sessao = (seg) => { F.ate = performance.now() + seg * 1000; F.prox = 0; };
    F.tick = (dt) => {
      const agora = performance.now();
      if (agora < F.ate && agora >= F.prox) { F.disparar(); if (Math.random() < 0.3) setTimeout(() => { if (performance.now() < F.ate) F.disparar(); }, 70); F.prox = agora + 110 + Math.random() * 380; }
      for (const f of L) { f.t = Math.max(0, f.t - dt); f.m.material.opacity = f.t > 0 ? Math.min(1, f.t / 0.08) : 0; f.m.quaternion.copy(camera.quaternion); }
      F.luz.intensity = Math.max(0, F.luz.intensity - dt * 10);
    };
    return F;
  }
  const aplausos = (k, dur) => { try { Som.palmas(k, dur); } catch (e) { /* sem som */ } };
  const NOME_PREMIO = { art: 'Artilheiro', ass: 'Líder de assistências', melhor: 'Melhor jogador' }, NOME_PREMIO_F = { art: 'Artilheira', ass: 'Líder de assistências', melhor: 'Melhor jogadora' };
  const valorPremio = (P) => (P.valor != null ? P.valor : P.v == null ? '' : P.tipo === 'art' ? Tf('{0} gols', P.v) : P.tipo === 'ass' ? Tf('{0} assistências', P.v) : Tf('nota média {0}', (+P.v).toFixed(1)));
  const NOME_OBJ = { art: 'a bola de ouro', ass: 'a chuteira de ouro', melhor: 'o jogadorzinho de ouro' };
  function texCanvas2(w, h, fn) { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.magFilter = THREE.NearestFilter; t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; t.userData = { c }; return t; }
  function montarPalco(nivel, titulo) {
    const g = new THREE.Group(), grande = nivel === 'serieb' || nivel === 'seriea', fundo1 = grande ? '#0a1838' : '#2a1206', fundo2 = grande ? '#1d3a7a' : '#6a3a12', destaque = grande ? '#f2c230' : '#f0a020';
    const L = new Lote();
    L.caixa(9, 0.3, 4.2, 0x14141a, 0, 0.15, 0);                                   // o palco
    L.caixa(9.02, 0.04, 0.04, hexN(destaque), 0, 0.3, 2.1);                      // a borda acesa
    L.caixa(1.3, 0.012, 4.2, 0x8a1f2a, 0, 0.306, 0);                             // o tapete vermelho
    L.caixa(0.7, 1.1, 0.45, 0x2a2a32, 2.55, 0.85, -0.6); L.caixa(0.74, 0.04, 0.5, hexN(destaque), 2.55, 1.42, -0.6);   // o púlpito
    for (const x of [-3.9, 3.9]) { L.caixa(0.45, 0.5, 0.45, 0x3a2a22, x, 0.55, -1.4); L.caixa(0.6, 0.55, 0.6, 0x2f7a3a, x, 1.05, -1.4); }   // vasos de plantas
    L.caixa(30, 0.02, 30, 0x08080c, 0, -0.01, 3);                                 // o chão do salão
    const base = L.malha(MAT_CORES); g.add(base);
    // o fundo: degradê, estrelas, o título do evento
    const texF = texCanvas2(512, 256, (c, w, h) => {
      const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, fundo1); gr.addColorStop(1, fundo2); c.fillStyle = gr; c.fillRect(0, 0, w, h);
      for (let i = 0; i < 90; i++) { c.fillStyle = Math.random() < 0.3 ? destaque : 'rgba(255,255,255,0.7)'; const s = Math.random() < 0.2 ? 3 : 2; c.fillRect(Math.random() * w, Math.random() * h * 0.8, s, s); }
      c.fillStyle = destaque; c.fillRect(0, h - 26, w, 4);
      c.font = 'bold 26px monospace'; c.textAlign = 'center'; c.fillStyle = '#ffffff'; c.fillText(titulo, w / 2, 70, w - 30);
    });
    const fundo = new THREE.Mesh(new THREE.PlaneGeometry(12, 6), new THREE.MeshBasicMaterial({ map: texF })); fundo.position.set(0, 3, -2.1); g.add(fundo);
    // o telão (troca a cada prêmio)
    const texT = texCanvas2(256, 144, () => {});
    const telao = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.46), new THREE.MeshBasicMaterial({ map: texT })); telao.position.set(-1.6, 3.15, -2.05); g.add(telao);
    const moldura = new Lote(); moldura.caixa(2.8, 1.66, 0.06, 0x111114, -1.6, 3.15, -2.09); g.add(moldura.malha(MAT_CORES));
    // holofotes: cones de luz (aditivos, bem fraquinhos) caindo no meio do palco
    const conesMat = new THREE.MeshBasicMaterial({ color: grande ? 0xfff2c0 : 0xffe0b0, transparent: true, opacity: 0.09, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    for (const x of [-2.4, 0, 2.4]) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.9, 5.2, 12, 1, true), conesMat); c.position.set(x, 2.9, 0.3); g.add(c); }
    // luz do evento (as luzes da partida podem ser de noite)
    const luz = new THREE.DirectionalLight(0xffffff, 0.9); luz.position.set(1, 5, 6); g.add(luz); g.add(luz.target);
    const amb = new THREE.AmbientLight(0xffffff, 0.35); g.add(amb);
    g.userData.telao = (txt1, txt2) => {
      const c = texT.userData.c, x = c.getContext('2d'); x.fillStyle = '#05070c'; x.fillRect(0, 0, 256, 144);
      x.fillStyle = destaque; x.fillRect(8, 8, 240, 3); x.fillRect(8, 133, 240, 3);
      x.textAlign = 'center'; x.fillStyle = destaque; x.font = 'bold 18px monospace'; x.fillText(txt1, 128, 58, 236);
      x.fillStyle = '#ffffff'; x.font = 'bold 15px monospace'; x.fillText(txt2, 128, 92, 236); texT.needsUpdate = true;
    };
    g.userData.telao(titulo, '');
    scene.add(g); return g;
  }
  //   o: { nivel: 'varzea' | 'serieb', titulo, premios: [{ tipo, nome, time, ap (aparência + genero), voce, valor }], io: { preto, esperar, ganho(premio) } }
  async function gala(o) {
    const io = o.io, L = [], meus = new Set(), voltaHud = esconderHudPartida();
    const antes = { bg: scene.background, fogN: scene.fog ? scene.fog.near : 0, fogF: scene.fog ? scene.fog.far : 0, est: ESTADIO.visible };
    scene.background = new THREE.Color(0x05050a); if (scene.fog) { scene.fog.near = 1e5; scene.fog.far = 2e5; } ESTADIO.visible = false;
    // (7.4.13) as luzes do jogo (o sol e o céu da partida) ficam bem fracas no salão: somadas às do palco, estouravam as cores claras
    //   (pele clara e vestido amarelo saíam quase brancos)
    const luzesJogo = []; scene.traverse((q) => { if (q.isLight && q.intensity > 0) luzesJogo.push([q, q.intensity]); });
    for (const [q, i] of luzesJogo) q.intensity = i * 0.3;
    const palco = montarPalco(o.nivel, o.titulo), Y = 0.3, flashes = montarFlashes(palco);
    const AP = apresentadoraDe(o.apresentadora != null ? o.apresentadora : Math.floor(Math.random() * APRESENTADORAS.length));   // (7.4.13) uma das 7
    const apr = deTerno(L, AP.ap, AP.vestido), usadas = new Set();
    meus.add(apr.m); apr.x = 2.0; apr.z = -0.1; apr.y = Y; apr.olha = Math.atan2(1, 0.4); apr.pose = 'apresenta';
    let plano = null, t0 = performance.now();
    const quadro = (rdt) => {
      const t = performance.now() / 1000, dt = Math.min(0.05, rdt || 0.016);
      esconderJogo(meus); for (const A of L) poseAtor(A, t, dt); flashes.tick(dt);
      if (plano) cameraPlano(plano, (performance.now() - t0) / 1000 / (plano.dur || 1));
    };
    const corta = (c) => { plano = c; t0 = performance.now(); };
    GANCHO_RENDER = quadro;
    const fala = async (A, nome, txt, voz) => { if (A) A.fala = true; await Dialogo.mostrar([txt], { nome, voz }); if (A) A.fala = false; };
    const faixa = document.createElement('div');
    faixa.style.cssText = 'position:fixed;z-index:30;right:calc(14px + env(safe-area-inset-right,0px));top:calc(46px + env(safe-area-inset-top,0px));max-width:min(46%, 420px);box-sizing:border-box;padding:6px 14px;background:rgba(10,10,16,.86);border:3px solid ' + (o.nivel === 'serieb' ? '#f2c230' : '#f0a020') + ';color:#fff;font:700 13px/1.25 var(--font-display,monospace);letter-spacing:.06em;text-align:right;opacity:0;transition:opacity .4s';   // (7.4.1) no canto direito, embaixo do PULAR: no meio cobria o telão do palco
    (document.getElementById('raizJogo') || document.body).appendChild(faixa);
    const mostraFaixa = (t) => { faixa.textContent = t; faixa.style.opacity = t ? '1' : '0'; };
    try {
      corta({ p: [0, 1.35, 6.4], p2: [0, 1.35, 5.7], t: [0, 1.35, -0.5], dur: 4 });   // reto, na altura do peito: o título lá em cima e a apresentadora acima da caixa de fala
      await io.preto(false, 700);
      await fala(apr, T('Apresentadora'), o.saudacao ? o.saudacao : o.nivel === 'seriea' ? T('Boa noite! Bem-vindos à festa de premiação do Brasileirão A!') : o.nivel === 'serieb' ? T('Boa noite! Bem-vindos à festa de premiação do Brasileirão B!') : T('Boa noite! Bem-vindos à festa de premiação do Campeonato de Várzea!'), 0);
      await fala(apr, T('Apresentadora'), T('Chegou a hora dos prêmios individuais. Vamos lá!'), 0);
      for (const P of o.premios) {
        if (!P) continue;
        const fem = !!(P.ap && P.ap.genero === 'F'), nomeP = T((fem ? NOME_PREMIO_F : NOME_PREMIO)[P.tipo]), val = valorPremio(P);
        palco.userData.telao(nomeP.toUpperCase(), P.nome);
        const obj = premio(P.tipo, o.nivel);
        pegaUmaMao(apr, obj, 'frente');
        const W = deTerno(L, P.ap || {}); meus.add(W.m); W.x = -4.2; W.z = 0.35; W.y = Y; W.pose = 'pe'; W.olha = null;
        mostraFaixa(nomeP + ' · ' + P.nome + (P.time ? ' (' + P.time + ')' : '') + (val ? ' · ' + val : ''));
        corta({ p: [3.1, 2.0, 3.3], t: [2.1, 1.0, -0.2], dur: 2 });
        await fala(apr, T('Apresentadora'), Tf('E {0} vai para... {1}!', T(NOME_OBJ[P.tipo]) + ' (' + nomeP.toLowerCase() + ')', P.nome + (P.time ? Tf(', do {0}', P.time) : '')), 0);
        Dialogo.esconder();
        // o ganhador atravessa o palco até a apresentadora
        W.rota = [[-1.0, 0.35], [0.85, 0.05]]; W.vel = 1.7;
        corta({ p: [-0.5, 2.2, 5.8], p2: [0.6, 2.1, 4.8], t: [-1.5, 0.85, 0], t2: [1.0, 0.85, 0], dur: 3 });
        for (let k = 0; k < 40 && W.rota && W.rota.length; k++) await io.esperar(100);
        W.rota = null; W.olha = 0; apr.olha = Math.PI;                       // um de frente para o outro
        corta({ p: [1.45, 1.9, 2.9], t: [1.42, 0.95, 0], dur: 1.6 });
        await io.esperar(900);
        soltar(apr); pegaUmaMao(W, obj, 'frente'); W.pose = 'premio';         // passou de mão em mão
        await io.esperar(900);
        W.olha = Math.atan2(1, -0.15); apr.olha = Math.atan2(1, 0.4); apr.pose = 'palmas';
        pegaUmaMao(W, obj, 'alto');
        corta({ p: [0.9, 1.55, 3.9], p2: [0.95, 1.65, 3.3], t: [0.85, 1.3, 0], dur: 2.6 });
        aplausos(0.85, 3.4); flashes.sessao(3.2);                             // (7.4.13) aplausos e os flashes dos fotógrafos
        await io.esperar(1400);
        // (7.4.13) a fala do ganhador: uma das 50 (humilde ou individualista); a sua, você escolhe entre 5
        let frase;
        if (P.voce) {
          if (io.ganho) io.ganho(P);
          const ops = cincoFalas(usadas);
          let i = 0;
          try { i = typeof Escolha !== 'undefined' ? await Escolha.mostrar(T('O que você vai dizer no microfone?'), ops.map((x) => falaPremio(x, fem))) : 0; } catch (e) { i = 0; }
          frase = ops[Math.max(0, Math.min(ops.length - 1, i | 0))] || ops[0];
        } else frase = sorteia(FALAS_PREMIO.filter((x) => !usadas.has(x[1])));
        usadas.add(frase[1]);
        await fala(W, P.nome, falaPremio(frase, fem), P.voz);
        Dialogo.esconder();
        aplausos(frase[0] === 'h' ? 0.75 : 0.5, 2.6); flashes.sessao(1.2);      // humilde: mais aplauso
        await io.esperar(900);
        await io.preto(true, 450);
        soltar(W); descartar(obj); L.splice(L.indexOf(W), 1); meus.delete(W.m); ATLETAS.delete(W.m); descartar(W.m.raiz);
        apr.pose = 'apresenta'; apr.olha = Math.atan2(1, 0.4);
        mostraFaixa('');
        await io.preto(false, 450);
      }
      palco.userData.telao(o.titulo, T('Parabéns aos premiados!'));
      corta({ p: [0, 1.35, 6.2], t: [0, 1.35, -0.5], dur: 3 });
      await fala(apr, T('Apresentadora'), T('Parabéns aos premiados! E até a próxima temporada!'), 0);
      Dialogo.esconder();
      await io.preto(true, 700);
    } finally {
      faixa.remove(); flashes.remover(); GANCHO_RENDER = null; voltaHud();
      for (const [q, i] of luzesJogo) q.intensity = i;
      for (const A of L) { soltar(A); ATLETAS.delete(A.m); descartar(A.m.raiz); }
      descartar(palco);
      scene.background = antes.bg; if (scene.fog) { scene.fog.near = antes.fogN; scene.fog.far = antes.fogF; } ESTADIO.visible = antes.est;
    }
  }

  // ============================================================================================ TEXTOS (pt → en, es, it, fr)
  const TRAD = {
    // (7.4.13) as 50 falas dos premiados e a escolha da sua
    "O que você vai dizer no microfone?": ["What will you say into the mic?", "¿Qué vas a decir al micrófono?", "Cosa dirai al microfono?", "Que vas-tu dire au micro ?"],
    "Esse prêmio é de todo o time. Sem os meus companheiros, nada disso acontecia.": ["This award belongs to the whole team. Without my teammates, none of this would have happened.", "Este premio es de todo el equipo. Sin mis compañeros, nada de esto habría pasado.", "Questo premio è di tutta la squadra. Senza i miei compagni, niente di tutto questo sarebbe successo.", "Ce trophée appartient à toute l'équipe. Sans mes coéquipiers, rien de tout ça ne serait arrivé."],
    "Agradeço a cada um que dividiu o campo comigo nesta temporada.": ["I thank everyone who shared the pitch with me this season.", "Le agradezco a cada uno que compartió la cancha conmigo esta temporada.", "Ringrazio ognuno di quelli che hanno condiviso il campo con me in questa stagione.", "Je remercie chacun de ceux qui ont partagé le terrain avec moi cette saison."],
    "Agradeço à comissão técnica, aos roupeiros, ao pessoal da cozinha... todo mundo joga junto.": ["Thanks to the coaching staff, the kit men, the kitchen crew... everyone plays together.", "Gracias al cuerpo técnico, a los utileros, a la gente de la cocina... todos juegan juntos.", "Grazie allo staff tecnico, ai magazzinieri, a chi lavora in cucina... si gioca tutti insieme.", "Merci au staff technique, aux intendants, à l'équipe de la cuisine... tout le monde joue ensemble."],
    "Divido este troféu com a minha família, que sempre acreditou em mim.": ["I share this trophy with my family, who always believed in me.", "Comparto este trofeo con mi familia, que siempre creyó en mí.", "Divido questo trofeo con la mia famiglia, che ha sempre creduto in me.", "Je partage ce trophée avec ma famille, qui a toujours cru en moi."],
    "Eu só terminei as jogadas. Quem fez o trabalho pesado foi o time.": ["I only finished the plays. The team did the heavy lifting.", "Yo solo terminé las jugadas. El trabajo duro lo hizo el equipo.", "Io ho solo concluso le azioni. Il lavoro pesante l'ha fatto la squadra.", "Moi, j'ai juste conclu les actions. Le gros du travail, c'est l'équipe qui l'a fait."],
    "Não esperava por isso. Só quero continuar aprendendo e ajudando o grupo.": ["I didn't expect this. I just want to keep learning and helping the group.", "No me lo esperaba. Solo quiero seguir aprendiendo y ayudando al grupo.", "Non me lo aspettavo. Voglio solo continuare a imparare e ad aiutare il gruppo.", "Je ne m'y attendais pas. Je veux juste continuer à apprendre et à aider le groupe."],
    "Esse prêmio vai para a torcida, que empurrou a gente em todos os jogos.": ["This award goes to the fans, who pushed us on in every game.", "Este premio es para la afición, que nos empujó en todos los partidos.", "Questo premio va ai tifosi, che ci hanno spinto in ogni partita.", "Ce trophée est pour les supporters, qui nous ont poussés à chaque match."],
    "Tem muita gente aqui que merecia isso tanto quanto eu.": ["There are a lot of people here who deserved this as much as I do.", "Hay mucha gente aquí que lo merecía tanto como yo.", "C'è tanta gente qui che lo meritava quanto me.", "Il y a beaucoup de monde ici qui le méritait autant que moi."],
    "Agradeço a Deus, à família e aos companheiros. É de todos nós.": ["Thanks to God, to my family and to my teammates. It belongs to all of us.", "Gracias a Dios, a la familia y a los compañeros. Es de todos nosotros.", "Grazie a Dio, alla famiglia e ai compagni. È di tutti noi.", "Merci à Dieu, à la famille et aux coéquipiers. Il est à nous tous."],
    "Lá no começo, eu jogava no campinho de terra do bairro. Hoje estou aqui. Valeu, futebol!": ["Back at the start, I played on the dirt pitch in my neighborhood. Today I'm here. Thank you, football!", "Al principio jugaba en la canchita de tierra del barrio. Hoy estoy aquí. ¡Gracias, fútbol!", "All'inizio giocavo nel campetto di terra del quartiere. Oggi sono qui. Grazie, calcio!", "Au début, je jouais sur le terrain en terre du quartier. Aujourd'hui je suis là. Merci, le foot !"],
    "Quem merece os aplausos são os meus companheiros. Eu só estava no lugar certo.": ["My teammates are the ones who deserve the applause. I was just in the right place.", "Los que merecen los aplausos son mis compañeros. Yo solo estaba en el lugar indicado.", "Gli applausi li meritano i miei compagni. Io ho soltanto sfruttato le occasioni.", "Ce sont mes coéquipiers qui méritent les applaudissements. J'étais juste au bon endroit."],
    "Este troféu é pequeno perto do que o grupo construiu este ano.": ["This trophy is small next to what the group built this year.", "Este trofeo es pequeño al lado de lo que el grupo construyó este año.", "Questo trofeo è piccolo rispetto a ciò che il gruppo ha costruito quest'anno.", "Ce trophée est petit à côté de ce que le groupe a construit cette année."],
    "Ao nosso treinador: valeu pela confiança desde o primeiro dia.": ["To our coach: thanks for trusting me from day one.", "A nuestro entrenador: gracias por la confianza desde el primer día.", "Al nostro allenatore: grazie per la fiducia fin dal primo giorno.", "À notre entraîneur : merci pour la confiance dès le premier jour."],
    "Vou guardar esse prêmio com carinho, mas o que importa mesmo é o time vencer.": ["I'll treasure this award, but what really matters is the team winning.", "Voy a guardar este premio con cariño, pero lo que de verdad importa es que gane el equipo.", "Custodirò questo premio con affetto, ma quello che conta davvero è che vinca la squadra.", "Je vais garder ce trophée précieusement, mais ce qui compte vraiment, c'est que l'équipe gagne."],
    "Prêmio individual é bom, mas eu trocaria por mais um título com o grupo.": ["Individual awards are nice, but I'd trade it for one more title with the group.", "Un premio individual está bien, pero lo cambiaría por un título más con el grupo.", "Un premio individuale fa piacere, ma lo scambierei con un altro titolo insieme al gruppo.", "Un trophée individuel, c'est bien, mais je l'échangerais contre un titre de plus avec le groupe."],
    "Aos mais novos da base: treinem, que um dia vocês estão aqui também.": ["To the youngsters in the academy: keep training, one day you'll be up here too.", "A los más jóvenes de las inferiores: entrenen, que un día ustedes también van a estar aquí.", "Ai più giovani del vivaio: allenatevi, che un giorno sarete qui anche voi.", "Aux plus jeunes du centre de formation : entraînez-vous, un jour vous serez ici vous aussi."],
    "Dedico aos meus pais, que me levavam para todos os treinos.": ["I dedicate it to my parents, who took me to every training session.", "Se lo dedico a mis padres, que me llevaban a todos los entrenamientos.", "Lo dedico ai miei genitori, che mi portavano a tutti gli allenamenti.", "Je le dédie à mes parents, qui m'emmenaient à tous les entraînements."],
    "Ninguém ganha nada sozinho no futebol. Isso aqui é do vestiário inteiro.": ["Nobody wins anything alone in football. This belongs to the whole dressing room.", "Nadie gana nada solo en el fútbol. Esto es de todo el vestuario.", "Nel calcio nessuno vince niente da solo. Questo è di tutto lo spogliatoio.", "Personne ne gagne rien seul au football. Ça, c'est à tout le vestiaire."],
    "Teve jogo em que eu errei muito, e o time me segurou. Esse prêmio é deles.": ["There were games where I made lots of mistakes, and the team carried me. This award is theirs.", "Hubo partidos en los que fallé mucho, y el equipo me sostuvo. Este premio es de ellos.", "Ci sono state partite in cui ho sbagliato tanto, e la squadra mi ha sostenuto. Questo premio è loro.", "Il y a eu des matchs où j'ai fait beaucoup d'erreurs, et l'équipe m'a porté. Ce trophée est à eux."],
    "Só tenho a agradecer. Foi uma temporada de muito trabalho de todo mundo.": ["I can only say thank you. It was a season of hard work from everyone.", "Solo tengo que agradecer. Fue una temporada de mucho trabajo de todos.", "Posso solo ringraziare. È stata una stagione di tanto lavoro da parte di tutti.", "Je ne peux que remercier. Ça a été une saison de gros travail pour tout le monde."],
    "Quero dividir isso com o roupeiro, o massagista e o pessoal que ninguém vê.": ["I want to share this with the kit man, the physio and the people nobody sees.", "Quiero compartir esto con el utilero, el masajista y la gente que nadie ve.", "Voglio condividerlo con il magazziniere, il massaggiatore e le persone che nessuno vede.", "Je veux partager ça avec l'intendant, le kiné et les gens que personne ne voit."],
    "Cada passe que eu recebi tinha o suor de um companheiro. Valeu, time!": ["Every pass I received carried a teammate's sweat. Thanks, team!", "Cada pase que recibí tenía el sudor de un compañero. ¡Gracias, equipo!", "Ogni passaggio che ho ricevuto aveva il sudore di un compagno. Grazie, squadra!", "Chaque passe que j'ai reçue portait la sueur d'un coéquipier. Merci, l'équipe !"],
    "Isso aqui é para quem acordou cedo para treinar comigo debaixo de chuva.": ["This is for everyone who woke up early to train with me in the rain.", "Esto es para los que madrugaron para entrenar conmigo bajo la lluvia.", "Questo è per chi si è svegliato presto per allenarsi con me sotto la pioggia.", "Ça, c'est pour ceux qui se sont levés tôt pour s'entraîner avec moi sous la pluie."],
    "Fico feliz, mas amanhã a gente volta ao trabalho. O próximo jogo é o que importa.": ["It feels great, but tomorrow we go back to work. The next game is what matters.", "Estoy feliz, pero mañana volvemos al trabajo. Lo que importa es el próximo partido.", "Sono felice, ma domani si torna al lavoro. Quello che conta è la prossima partita.", "Ça fait plaisir, mais demain on reprend le travail. C'est le prochain match qui compte."],
    "Um abraço especial para a torcida. Vocês fizeram a diferença.": ["A special hug to the fans. You made the difference.", "Un abrazo especial para la afición. Ustedes marcaron la diferencia.", "Un abbraccio speciale ai tifosi. Avete fatto la differenza.", "Un câlin spécial aux supporters. Vous avez fait la différence."],
    "Eu sabia que esse prêmio ia ser meu. Trabalhei a temporada inteira para isso.": ["I knew this award would be mine. I worked the whole season for it.", "Sabía que este premio iba a ser mío. Trabajé toda la temporada para esto.", "Sapevo che questo premio sarebbe stato mio. Ho lavorato tutta la stagione per questo.", "Je savais que ce trophée serait à moi. J'ai travaillé toute la saison pour ça."],
    "Os números falam por si: fui o melhor do campeonato, e ponto.": ["The numbers speak for themselves: I was the best in the league, period.", "Los números hablan por sí solos: fui el mejor del campeonato, y punto.", "I numeri parlano da soli: sono stato il migliore del campionato, punto.", "Les chiffres parlent d'eux-mêmes : j'ai été le meilleur du championnat, point."],
    "Os números falam por si: fui a melhor do campeonato, e ponto.": ["The numbers speak for themselves: I was the best in the league, period.", "Los números hablan por sí solos: fui la mejor del campeonato, y punto.", "I numeri parlano da soli: sono stata la migliore del campionato, punto.", "Les chiffres parlent d'eux-mêmes : j'ai été la meilleure du championnat, point."],
    "Já pode ir reservando o lugar na estante para o ano que vem.": ["You can already save a spot on the shelf for next year.", "Ya pueden ir reservando el lugar en la estantería para el año que viene.", "Potete già riservare il posto sulla mensola per l'anno prossimo.", "Vous pouvez déjà réserver la place sur l'étagère pour l'an prochain."],
    "Muita gente duvidou de mim. Hoje eu estou aqui com o troféu na mão.": ["A lot of people doubted me. Today I'm here with the trophy in my hand.", "Mucha gente dudó de mí. Hoy estoy aquí con el trofeo en la mano.", "Tanta gente ha dubitato di me. Oggi sono qui con il trofeo in mano.", "Beaucoup de gens ont douté de moi. Aujourd'hui, je suis là avec le trophée en main."],
    "Esse é só o primeiro. Vou ganhar muitos outros.": ["This is only the first. I'll win many more.", "Este es solo el primero. Voy a ganar muchos más.", "Questo è solo il primo. Ne vincerò tanti altri.", "Ce n'est que le premier. J'en gagnerai beaucoup d'autres."],
    "Quem joga como eu joguei não podia sair daqui sem nada.": ["Whoever plays the way I played couldn't leave here empty-handed.", "Quien juega como yo jugué no podía irse de aquí sin nada.", "Chi gioca come ho giocato io non poteva andarsene da qui senza niente.", "Quand on joue comme j'ai joué, on ne pouvait pas repartir d'ici sans rien."],
    "Eu avisei no começo do ano: esse prêmio tinha dono.": ["I warned you at the start of the year: this award already had an owner.", "Lo avisé a principio de año: este premio tenía dueño.", "L'avevo detto a inizio anno: questo premio aveva già un padrone.", "Je l'avais dit en début d'année : ce trophée avait déjà un propriétaire."],
    "Pode colocar o meu nome na história desse campeonato.": ["You can write my name into the history of this league.", "Pueden poner mi nombre en la historia de este campeonato.", "Potete scrivere il mio nome nella storia di questo campionato.", "Vous pouvez inscrire mon nom dans l'histoire de ce championnat."],
    "Mereço cada grama desse troféu. Ninguém fez o que eu fiz.": ["I deserve every gram of this trophy. Nobody did what I did.", "Merezco cada gramo de este trofeo. Nadie hizo lo que yo hice.", "Merito ogni grammo di questo trofeo. Nessuno ha fatto quello che ho fatto io.", "Je mérite chaque gramme de ce trophée. Personne n'a fait ce que j'ai fait."],
    "Agora quero ver quem vai me criticar.": ["Now let's see who's going to criticize me.", "Ahora quiero ver quién me va a criticar.", "Adesso voglio vedere chi mi criticherà.", "Maintenant, je veux voir qui va me critiquer."],
    "Trabalhei mais do que todo mundo. O resultado está aqui.": ["I worked harder than everyone. The result is right here.", "Trabajé más que todos. El resultado está aquí.", "Ho lavorato più di tutti. Il risultato è qui.", "J'ai travaillé plus que tout le monde. Le résultat est là."],
    "Não tem segredo: talento e treino. E eu tenho os dois.": ["There's no secret: talent and training. And I have both.", "No hay secreto: talento y entrenamiento. Y yo tengo los dos.", "Non c'è nessun segreto: talento e allenamento. E io li ho tutti e due.", "Il n'y a pas de secret : du talent et de l'entraînement. Et moi, j'ai les deux."],
    "Os outros que corram atrás. Eu já estou na frente.": ["Let the others chase me. I'm already ahead.", "Que los demás corran detrás. Yo ya voy adelante.", "Gli altri mi rincorrano pure. Io sono già davanti.", "Que les autres courent derrière. Moi, je suis déjà devant."],
    "Ano que vem eu volto para buscar mais um. Podem anotar.": ["Next year I'm coming back for another one. Write that down.", "El año que viene vuelvo a buscar otro. Pueden anotarlo.", "L'anno prossimo torno a prenderne un altro. Segnatevelo.", "L'an prochain, je reviens en chercher un autre. Notez-le."],
    "Os clubes grandes estão vendo. O meu futuro é lá em cima.": ["The big clubs are watching. My future is at the top.", "Los clubes grandes están mirando. Mi futuro está allá arriba.", "I grandi club stanno guardando. Il mio futuro è lassù.", "Les grands clubs regardent. Mon avenir, c'est tout en haut."],
    "Esse troféu combina comigo, não acham?": ["This trophy suits me, don't you think?", "Este trofeo me queda bien, ¿no creen?", "Questo trofeo mi sta bene, non trovate?", "Ce trophée me va bien, vous ne trouvez pas ?"],
    "O campeonato teve um nome, e todo mundo sabe qual é.": ["This league had one name, and everyone knows which one.", "El campeonato tuvo un nombre, y todo el mundo sabe cuál es.", "Il campionato ha avuto un nome, e tutti sanno qual è.", "Le championnat a eu un nom, et tout le monde sait lequel."],
    "Sem falsa modéstia: foi a melhor temporada da minha vida, e a melhor da liga.": ["No false modesty: it was the best season of my life, and the best in the league.", "Sin falsa modestia: fue la mejor temporada de mi vida, y la mejor de la liga.", "Senza falsa modestia: è stata la migliore stagione della mia vita, e la migliore del campionato.", "Sans fausse modestie : c'était la meilleure saison de ma vie, et la meilleure de la ligue."],
    "Ninguém me deu nada. Eu fui lá e conquistei.": ["Nobody gave me anything. I went out there and earned it.", "Nadie me regaló nada. Fui y lo conquisté.", "Nessuno mi ha regalato niente: ho lottato e ho vinto.", "Personne ne m'a rien donné. J'ai tout conquis moi-même."],
    "Quem apostou contra mim perdeu dinheiro.": ["Whoever bet against me lost money.", "Quien apostó contra mí perdió dinero.", "Chi ha scommesso contro di me ha perso soldi.", "Ceux qui ont parié contre moi ont perdu de l'argent."],
    "Vou mandar fazer uma réplica desse troféu para cada cômodo da minha casa.": ["I'm getting a replica of this trophy made for every room in my house.", "Voy a mandar hacer una réplica de este trofeo para cada habitación de mi casa.", "Farò fare una replica di questo trofeo per ogni stanza di casa mia.", "Je vais faire faire une réplique de ce trophée pour chaque pièce de ma maison."],
    "A torcida adversária também vai ter que me aplaudir.": ["The rival fans will have to applaud me too.", "La afición rival también va a tener que aplaudirme.", "Anche i tifosi avversari dovranno applaudirmi.", "Les supporters adverses vont devoir m'applaudir aussi."],
    "Se tivesse um prêmio acima desse, seria meu também.": ["If there were an award above this one, it would be mine too.", "Si hubiera un premio por encima de este, también sería mío.", "Se ci fosse un premio sopra questo, sarebbe mio anche quello.", "S'il y avait un trophée au-dessus de celui-ci, il serait à moi aussi."],
    "Pode chamar a imprensa: hoje eu dou entrevista para todo mundo.": ["Call the press: today I'm giving interviews to everyone.", "Pueden llamar a la prensa: hoy doy entrevistas a todo el mundo.", "Chiamate pure la stampa: oggi rilascio interviste a tutti.", "Appelez la presse : aujourd'hui, je donne des interviews à tout le monde."],
    "Eu nasci para levantar troféus. Esse é o primeiro de muitos.": ["I was born to lift trophies. This is the first of many.", "Nací para levantar trofeos. Este es el primero de muchos.", "Il mio destino è alzare trofei. Questo è il primo di tanti.", "Mon destin, c'est de soulever des trophées. C'est le premier d'une longue série."],
    "Apresentadora": ["Host", "Presentadora", "Presentatrice", "Présentatrice"],
    "Boa noite! Bem-vindos à festa de premiação do Brasileirão A!": ["Good evening! Welcome to the Brasileirão A awards night!", "¡Buenas noches! ¡Bienvenidos a la gala de premios del Brasileirão A!", "Buonasera! Benvenuti alla serata di premiazione del Brasileirão A!", "Bonsoir ! Bienvenue à la soirée des trophées du Brasileirão A !"],
    "Boa noite! Bem-vindos à festa de premiação do Brasileirão B!": ["Good evening! Welcome to the Brasileirão B awards night!", "¡Buenas noches! ¡Bienvenidos a la gala de premios del Brasileirão B!", "Buonasera! Benvenuti alla serata di premiazione del Brasileirão B!", "Bonsoir ! Bienvenue à la soirée des trophées du Brasileirão B !"],
    "Boa noite! Bem-vindos à festa de premiação do Campeonato de Várzea!": ["Good evening! Welcome to the Amateur Tournament awards night!", "¡Buenas noches! ¡Bienvenidos a la gala de premios del Campeonato de Barrio!", "Buonasera! Benvenuti alla serata di premiazione del Torneo dei Dilettanti!", "Bonsoir ! Bienvenue à la soirée des trophées du Championnat Amateur !"],
    "Chegou a hora dos prêmios individuais. Vamos lá!": ["It's time for the individual awards. Here we go!", "Llegó la hora de los premios individuales. ¡Vamos allá!", "È arrivato il momento dei premi individuali. Si comincia!", "C'est l'heure des trophées individuels. C'est parti !"],
    "E {0} vai para... {1}!": ["And {0} goes to... {1}!", "Y {0} es para... ¡{1}!", "E {0} va a... {1}!", "Et {0} revient à... {1} !"],
    ", do {0}": [", from {0}", ", del {0}", ", del {0}", ", de {0}"],
    "Nem acredito! Valeu demais, esse prêmio é de todo o time!": ["I can't believe it! Thank you so much, this award belongs to the whole team!", "¡No me lo creo! ¡Muchísimas gracias, este premio es de todo el equipo!", "Non ci credo! Grazie mille, questo premio è di tutta la squadra!", "Je n'y crois pas ! Merci mille fois, ce trophée est à toute l'équipe !"],
    "Obrigado! Esse prêmio eu divido com o meu time.": ["Thank you! I share this award with my team.", "¡Gracias! Este premio lo comparto con mi equipo.", "Grazie! Questo premio lo divido con la mia squadra.", "Merci ! Je partage ce trophée avec mon équipe."],
    "Obrigada! Esse prêmio eu divido com o meu time.": ["Thank you! I share this award with my team.", "¡Gracias! Este premio lo comparto con mi equipo.", "Grazie! Questo premio lo divido con la mia squadra.", "Merci ! Je partage ce trophée avec mon équipe."],
    "Parabéns aos premiados!": ["Congratulations to the winners!", "¡Felicidades a los premiados!", "Complimenti ai premiati!", "Bravo aux lauréats !"],
    "Parabéns aos premiados! E até a próxima temporada!": ["Congratulations to the winners! See you next season!", "¡Felicidades a los premiados! ¡Hasta la próxima temporada!", "Complimenti ai premiati! Alla prossima stagione!", "Bravo aux lauréats ! À la saison prochaine !"],
    "Artilheiro": ["Top scorer", "Goleador", "Capocannoniere", "Meilleur buteur"],
    "Artilheira": ["Top scorer", "Goleadora", "Capocannoniere", "Meilleure buteuse"],
    "Líder de assistências": ["Assists leader", "Líder de asistencias", "Re degli assist", "Meilleur passeur"],
    "Melhor jogador": ["Best player", "Mejor jugador", "Miglior giocatore", "Meilleur joueur"],
    "Melhor jogadora": ["Best player", "Mejor jugadora", "Miglior giocatrice", "Meilleure joueuse"],
    "a bola de ouro": ["the golden ball", "el balón de oro", "il pallone d'oro", "le ballon d'or"],
    "a chuteira de ouro": ["the golden boot", "la bota de oro", "la scarpa d'oro", "le soulier d'or"],
    "o jogadorzinho de ouro": ["the golden player statuette", "la estatuilla del jugador de oro", "la statuetta del giocatore d'oro", "la statuette du joueur d'or"],
    "{0} gols": ["{0} goals", "{0} goles", "{0} gol", "{0} buts"],
    "{0} assistências": ["{0} assists", "{0} asistencias", "{0} assist", "{0} passes décisives"],
    "nota média {0}": ["average rating {0}", "nota media {0}", "voto medio {0}", "note moyenne {0}"],
    "É CAMPEÃO!": ["CHAMPIONS!", "¡CAMPEÓN!", "CAMPIONI!", "CHAMPION !"],
  };
  if (typeof I18N !== 'undefined') for (const k of Object.keys(TRAD)) if (!I18N[k]) I18N[k] = TRAD[k];


  window.FutebolJS.registrarFase({ id: 'festa', nome: 'Festas e prêmios', nucleoMinimo: '7.1.1', iniciar: async () => {}, campeao, gala, trofeu, premio,
    _fns: { poseAtor, pegaDuasMaos, pegaUmaMao, deTerno, jogador, montarPalco, maoNoCorpo, confete } });
})();
