/* =====================================================================
   FUTEBOL JS · barbearia.js · A BARBEARIA DO TONINHO (arquivo SEPARADO, como academia.js e cinema.js)
   ---------------------------------------------------------------------
   - Registrado com FutebolJS.registrarFase({ id: 'barbearia' }) só para o jogo saber baixar o arquivo; NÃO roda como fase.
     A cidade (cidade.js) baixa em segundo plano e chama criar(api) (api = apiBarbearia() da cidade). O prédio fica entre a quadra
     de futsal e a pizzaria (porta em x −19, na calçada sul) e o interior vem do interiores.js (R.barbearia).
   - Lá dentro só tem o TONINHO, o barbeiro. Falando com ele, dá para comprar os CORTES DA LOJA (os cortes do cosmeticos.js, que
     não aparecem no criador de personagem) e trocar entre os que já são seus, ou voltar ao corte de antes (de graça).
   - O CORTE: o jogador senta na cadeira, o Toninho corta (máquina, tesoura, cabelo caindo), a tela escurece um instante e o boneco
     volta com o corte novo (refazerJogador da cidade). O corte fica no personagem pelo NOME (PERSONAGEM.aparencia.estiloNome).
   - PREÇOS em CORTES_LOJA (o quadro na parede sai daqui). Um corte que não está no cosmeticos.js simplesmente não aparece.
   - Abre das 8h às 20h.
   - Salva em historia.cidade: barbearia = { conheceu, cortes: [nomes comprados], original (o corte do criador) }.
   ===================================================================== */
(function () {
  'use strict';

  // os cortes à venda (nome igual ao do cosmeticos.js) e o preço em fakes
  const CORTES_LOJA = [
    { nome: 'Maicaninho 2', preco: 200 },
    { nome: 'Cabelinho 3', preco: 300 },
  ];
  const H_ABRE = 8, H_FECHA = 20;

  // ------------------------------------------------------------------ textos (pt → en, es, it, fr)
  const TRAD = {
    'Toninho': ['Toninho', 'Toninho', 'Toninho', 'Toninho'],
    'Falar com o Toninho': ['Talk to Toninho', 'Hablar con Toninho', 'Parla con Toninho', 'Parler à Toninho'],
    'Fala, chefe! Bem-vindo à Barbearia do Toninho.': ['Hey, boss! Welcome to Toninho’s Barbershop.', '¡Hola, jefe! Bienvenido a la Barbería de Toninho.', 'Ciao, capo! Benvenuto dal Barbiere Toninho.', 'Salut, chef ! Bienvenue au salon de Toninho.'],
    'Aqui a navalha é afiada e o papo é de graça.': ['Here the razor is sharp and the chat is free.', 'Aquí la navaja está afilada y la charla es gratis.', 'Qui il rasoio è affilato e le chiacchiere sono gratis.', 'Ici, le rasoir est affûté et la causette est gratuite.'],
    'Os cortes da casa estão no quadro ali. Quando quiser mudar o visual, é só sentar.': ['The house cuts are on the board over there. Whenever you want a new look, just take a seat.', 'Los cortes de la casa están en el cuadro de ahí. Cuando quieras cambiar de look, solo siéntate.', 'I tagli della casa sono sulla lavagna lì. Quando vuoi cambiare look, siediti pure.', 'Les coupes de la maison sont sur le tableau là-bas. Quand tu veux changer de tête, assieds-toi.'],
    'E aí, qual vai ser hoje?': ['So, what’s it going to be today?', 'Bueno, ¿qué va a ser hoy?', 'Allora, cosa facciamo oggi?', 'Alors, ce sera quoi aujourd’hui ?'],
    'Opa! Senta aí que hoje tem corte bom.': ['Hey! Take a seat, we’ve got good cuts today.', '¡Hola! Siéntate, que hoy hay buenos cortes.', 'Ehi! Siediti, oggi ci sono bei tagli.', 'Salut ! Assieds-toi, aujourd’hui il y a de belles coupes.'],
    'Voltou! Vai dar um tapa no visual?': ['You’re back! Going to freshen up the look?', '¡Volviste! ¿Vas a darle un toque al look?', 'Sei tornato! Diamo una sistemata al look?', 'Te revoilà ! On rafraîchit la coupe ?'],
    '{0} · {1} fakes': ['{0} · {1} fakes', '{0} · {1} fakes', '{0} · {1} fakes', '{0} · {1} fakes'],
    '{0} (já é seu)': ['{0} (already yours)', '{0} (ya es tuyo)', '{0} (già tuo)', '{0} (déjà à toi)'],
    '{0} (está com ele)': ['{0} (wearing it)', '{0} (lo llevas)', '{0} (ce l’hai)', '{0} (tu l’as)'],
    'Voltar ao meu corte de antes': ['Go back to my old cut', 'Volver a mi corte de antes', 'Tornare al mio taglio di prima', 'Revenir à mon ancienne coupe'],
    'Só olhando': ['Just looking', 'Solo mirando', 'Sto solo guardando', 'Je regarde seulement'],
    'Já tá com esse, chefe. Ficou bom demais pra mexer.': ['You’re already wearing that one, boss. It looks too good to touch.', 'Ya llevas ese, jefe. Quedó demasiado bien para tocarlo.', 'Ce l’hai già, capo. Sta troppo bene per toccarlo.', 'Tu l’as déjà, chef. C’est trop réussi pour y toucher.'],
    'Esse sai por {0} fakes. Volta quando juntar, que eu guardo a cadeira.': ['That one costs {0} fakes. Come back when you’ve saved up, I’ll keep the chair for you.', 'Ese sale {0} fakes. Vuelve cuando juntes, que te guardo la silla.', 'Quello costa {0} fakes. Torna quando li hai messi da parte, ti tengo la sedia.', 'Celle-là coûte {0} fakes. Reviens quand tu les auras, je te garde le fauteuil.'],
    'Tranquilo. A cadeira tá aqui quando quiser.': ['No worries. The chair’s here whenever you want.', 'Tranquilo. La silla está aquí cuando quieras.', 'Tranquillo. La sedia è qui quando vuoi.', 'Pas de souci. Le fauteuil est là quand tu veux.'],
    'As lâminas dos cortes novos ainda não chegaram. Volta daqui a pouco!': ['The blades for the new cuts haven’t arrived yet. Come back in a bit!', 'Las cuchillas de los cortes nuevos todavía no llegaron. ¡Vuelve en un rato!', 'Le lame per i tagli nuovi non sono ancora arrivate. Torna tra poco!', 'Les lames pour les nouvelles coupes ne sont pas encore arrivées. Reviens tout à l’heure !'],
    'Senta aí que eu vou caprichar.': ['Have a seat, I’ll do my best work.', 'Siéntate, que voy a esmerarme.', 'Siediti, che mi impegno.', 'Assieds-toi, je vais m’appliquer.'],
    'Bora voltar pro clássico. Senta aí.': ['Back to the classic, then. Have a seat.', 'Volvamos al clásico. Siéntate.', 'Torniamo al classico. Siediti.', 'On revient au classique. Assieds-toi.'],
    'Pronto! Ficou na régua.': ['Done! Sharp as a ruler.', '¡Listo! Quedó perfecto.', 'Fatto! Preciso al millimetro.', 'Voilà ! Nickel.'],
    'Olha esse espelho, chefe. Tá outro homem!': ['Look in that mirror, boss. You’re a new man!', 'Mira ese espejo, jefe. ¡Eres otro!', 'Guarda lo specchio, capo. Sei un altro!', 'Regarde-toi dans le miroir, chef. Tu es un autre homme !'],
    'Olha esse espelho. Tá outra pessoa!': ['Look in that mirror. You’re a new person!', 'Mira ese espejo. ¡Eres otra persona!', 'Guarda lo specchio. Sei un’altra persona!', 'Regarde-toi dans le miroir. Tu es quelqu’un d’autre !'],
    'Ficou brabo!': ['Looks awesome!', '¡Quedó brutal!', 'È venuto fortissimo!', 'C’est trop stylé !'],
    'Caramba, ficou muito bom!': ['Wow, that looks really good!', '¡Caramba, quedó muy bien!', 'Caspita, è venuto benissimo!', 'Waouh, c’est vraiment réussi !'],
    'De volta ao velho eu.': ['Back to the old me.', 'De vuelta a mi yo de siempre.', 'Di nuovo il vecchio me.', 'Retour à l’ancien moi.'],
    'Corte novo: {0}': ['New cut: {0}', 'Corte nuevo: {0}', 'Taglio nuovo: {0}', 'Nouvelle coupe : {0}'],
    'CORTES DA CASA': ['HOUSE CUTS', 'CORTES DE LA CASA', 'TAGLI DELLA CASA', 'COUPES MAISON'],
  };
  if (typeof I18N !== 'undefined') for (const k of Object.keys(TRAD)) if (!I18N[k]) I18N[k] = TRAD[k];

  // ------------------------------------------------------------------ sons (WebAudio do jogo): a máquina zumbindo e a tesoura
  const audio = () => (typeof Som !== 'undefined' && Som.audio && !Som.mudo ? Som.audio : null);
  function maquina(seg) {
    const A = audio(); if (!A) return;
    try {
      const c = A.ctx, t = c.currentTime, o = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain(), lfo = c.createOscillator(), lg = c.createGain();
      o.type = 'sawtooth'; o.frequency.value = 118; f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 1.2;
      lfo.frequency.value = 7; lg.gain.value = 0.02; lfo.connect(lg); lg.connect(g.gain);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.06, t + 0.08); g.gain.setValueAtTime(0.06, t + seg - 0.15); g.gain.exponentialRampToValueAtTime(0.0001, t + seg);
      o.connect(f); f.connect(g); g.connect(A.mestre); o.start(t); lfo.start(t); o.stop(t + seg + 0.05); lfo.stop(t + seg + 0.05);
    } catch (e) { /* sem som */ }
  }
  function tesoura() {
    const A = audio(); if (!A) return;
    try {
      const c = A.ctx, t = c.currentTime, n = Math.floor(c.sampleRate * 0.05), b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3);
      for (const dt of [0, 0.09]) { const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s.buffer = b; f.type = 'highpass'; f.frequency.value = 3200; g.gain.value = 0.18; s.connect(f); f.connect(g); g.connect(A.mestre); s.start(t + dt); }
    } catch (e) { /* sem som */ }
  }

  function criar(api) {
    const S = api.S, T_ = (t) => T(t), Tf_ = (t, ...a) => Tf(t, ...a);
    const M = { R: null, B: null, T: null, cortando: false, fios: [], tTes: 0, quadro: null, tesoura: null };
    const dadosB = () => { const d = S().dados; d.barbearia = d.barbearia || { conheceu: false, cortes: [] }; d.barbearia.cortes = d.barbearia.cortes || []; return d.barbearia; };
    const hora = () => S().dados.hora;
    const aberto = () => hora() >= H_ABRE && hora() < H_FECHA;
    const indiceCorte = (nome) => ESTILOS_CABELO.findIndex((c) => c.cosmetico && c.nome === nome);
    const aparencia = () => (PERSONAGEM.aparencia || (PERSONAGEM.aparencia = {}));
    const corteAtual = () => { const ap = aparencia(); return ap.estiloNome || null; };
    const fem = () => PERSONAGEM.genero === 'F';
    const pk = (l) => l[Math.floor(Math.random() * l.length)];

    // ---------------------------------------------------------------- LÁ DENTRO: o Toninho, a cadeira e o quadro de preços
    const acha = (lista, n) => Math.max(0, lista.findIndex((x) => x.nome === n));
    function entrou(R) {
      const s = S(), B = R.barbearia; if (!B) return;
      M.R = R; M.B = B; M.cortando = false;
      const ap = { pele: PELES_FITZ[3].cor, cabelo: CORES_CABELO[0].cor, estilo: acha(ESTILOS_CABELO, 'Degradê com risco'), rosto: acha(ROSTOS, 'Sorridente'), labio: 3, barba: acha(ESTILOS_BARBA, 'Cavanhaque com bigode'), corBarba: CORES_CABELO[0].cor };
      const A = api.criarNPCFixo(ap, false, 0, ['#f2f2ee', '#1c1c1f', '#2a3f66', '#1c1c1f']);
      A.tipo = 'parado'; A.x = B.toninho.x; A.z = B.toninho.z; A.yaw = A.yawAlvo = B.toninho.yaw; M.T = A;
      s.falantesExtra = s.falantesExtra || {}; s.falantesExtra.toninho = { A, nome: T_('Toninho'), voz: 3 };
      // a tesoura na mão direita (só aparece cortando)
      const G = new api.Geo(); G.box(0.03, 0.03, 0.17, '#c9ced4', 0.02, 0, 0.05); G.box(0.03, 0.03, 0.17, '#aeb4bc', -0.02, 0, 0.05); G.box(0.06, 0.05, 0.05, '#1c1c1f', 0, 0, -0.05);
      M.tesoura = G.malha(api.MAT); M.tesoura.position.set(0, -0.66, 0.05); M.tesoura.visible = false; A.m.bracoD.add(M.tesoura);
      // a cadeira de corte (assento de verdade, reservado: ninguém senta nela fora do corte)
      const C = B.cadeira; M.cadeira = api.assento(C.x, C.z, C.fx, C.fz, C.h, 'cadeira'); M.cadeira.ocupado = { reservado: true };
      montarQuadro(R);
    }
    // o quadro dos preços na parede norte (sai de CORTES_LOJA: só os cortes que existem no cosmeticos.js)
    function montarQuadro(R) {
      const lista = CORTES_LOJA.filter((c) => indiceCorte(c.nome) >= 0);
      const W = 1.7, H = 0.42 + 0.3 * Math.max(1, lista.length), q = M.B.quadro;
      const tex = api.guardar(api.texCanvas(170, Math.round(H * 100), (g, w, h) => {
        g.fillStyle = '#1f2a22'; g.fillRect(0, 0, w, h); g.strokeStyle = '#c9a24a'; g.lineWidth = 6; g.strokeRect(3, 3, w - 6, h - 6);
        g.fillStyle = '#f2c230'; g.font = 'bold 15px monospace'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(T_('CORTES DA CASA'), w / 2, 22);
        g.font = 'bold 13px monospace'; g.fillStyle = '#f4efe2';
        lista.forEach((c, i) => { const y = 50 + i * 30; g.textAlign = 'left'; g.fillText(c.nome, 14, y); g.textAlign = 'right'; g.fillText(String(c.preco), w - 14, y); });
        if (!lista.length) { g.textAlign = 'center'; g.fillText('...', w / 2, 52); }
      }, false));
      const m = new THREE.Mesh(api.guardar(new THREE.PlaneGeometry(W, H)), api.guardar(new THREE.MeshLambertMaterial({ map: tex })));
      m.position.set(q.x, 1.25 + H / 2, q.z + 0.02); R.grupo.add(m); M.quadro = m;
    }
    function saiu() {
      const s = S();
      M.cortando = false; for (const f of M.fios) if (f.m.parent) f.m.parent.remove(f.m); M.fios = [];
      M.R = null; M.B = null; M.T = null; M.quadro = null; M.tesoura = null; M.cadeira = null;
      if (s && s.falantesExtra) delete s.falantesExtra.toninho;
    }
    const dentro = () => { const s = S(); return !!(s && s.dentro && s.dentro.nome === 'barbearia' && M.B); };

    function alvos(v) {
      if (!dentro() || !M.T || M.cortando) return;
      v.push({ x: M.T.x, z: M.T.z, r: 1.7, txt: T_('Falar com o Toninho'), fn: falarComToninho, y: 2.3, pri: true });
    }

    // ---------------------------------------------------------------- a conversa e o menu
    async function falarComToninho() {
      const s = S(), J = s.jog, A = M.T, b = dadosB();
      A.yawAlvo = Math.atan2(-(J.z - A.z), J.x - A.x);
      try {
        if (!b.conheceu) {
          await api.fala('toninho', T_('Fala, chefe! Bem-vindo à Barbearia do Toninho.'));
          await api.fala('toninho', T_('Aqui a navalha é afiada e o papo é de graça.'));
          await api.fala('toninho', T_('Os cortes da casa estão no quadro ali. Quando quiser mudar o visual, é só sentar.'));
          b.conheceu = true; api.gravar(s.dados.ponto || 'chegada');
        } else await api.fala('toninho', T_(pk(['Opa! Senta aí que hoje tem corte bom.', 'Voltou! Vai dar um tapa no visual?'])));
        const lista = CORTES_LOJA.filter((c) => indiceCorte(c.nome) >= 0);
        if (!lista.length) {
          await api.fala('toninho', T_('As lâminas dos cortes novos ainda não chegaram. Volta daqui a pouco!'));
          try { Fases.carregar('cosmeticos'); } catch (e) { /* tenta de novo na próxima */ }
          return;
        }
        const atual = corteAtual(), ops = [], acoes = [];
        for (const c of lista) {
          const meu = b.cortes.includes(c.nome);
          ops.push(atual === c.nome ? Tf_('{0} (está com ele)', c.nome) : meu ? Tf_('{0} (já é seu)', c.nome) : Tf_('{0} · {1} fakes', c.nome, c.preco));
          acoes.push({ tipo: 'corte', c, meu });
        }
        if (atual) { ops.push(T_('Voltar ao meu corte de antes')); acoes.push({ tipo: 'voltar' }); }
        ops.push(T_('Só olhando')); acoes.push({ tipo: 'nada' });
        Dialogo.esconder();
        const i = await Escolha.mostrar(T_('E aí, qual vai ser hoje?'), ops, { centro: true });
        const a = acoes[i] || { tipo: 'nada' };
        if (a.tipo === 'nada') { await api.fala('toninho', T_('Tranquilo. A cadeira tá aqui quando quiser.')); return; }
        if (a.tipo === 'voltar') { await api.fala('toninho', T_('Bora voltar pro clássico. Senta aí.')); Dialogo.esconder(); await cortar(null); return; }
        if (atual === a.c.nome) { await api.fala('toninho', T_('Já tá com esse, chefe. Ficou bom demais pra mexer.')); return; }
        if (!a.meu) {
          const d = s.dados;
          if (!d.devInfinito && d.fakes < a.c.preco) { await api.fala('toninho', Tf_('Esse sai por {0} fakes. Volta quando juntar, que eu guardo a cadeira.', a.c.preco)); return; }
          d.fakes -= a.c.preco; if (d.devInfinito && d.fakes < 0) d.fakes = 0;
          api.somDinheiro(); api.mostrarDinheiro(false); api.gastoNaTela(a.c.preco);
          b.cortes.push(a.c.nome);
        }
        await api.fala('toninho', T_('Senta aí que eu vou caprichar.')); Dialogo.esconder();
        await cortar(a.c.nome);
      } finally { Dialogo.esconder(); A.yawAlvo = M.B ? M.B.toninho.yaw : A.yawAlvo; }
    }

    // ---------------------------------------------------------------- O CORTE: senta, o Toninho corta, o boneco volta com o corte novo
    //   nome = corte da loja (ou null: volta ao corte do criador, guardado em barbearia.original)
    async function cortar(nome) {
      const s = S(), J = s.jog, A = M.T, B = M.B, C = M.cadeira, b = dadosB(), ap = aparencia();
      if (!B || !C) return;
      await api.preto(true, 350);
      // senta na cadeira (olhando o espelho) e o Toninho vai para o lado dela
      C.ocupado = J; J.sentado = true; J.assento = C.h; J.x = C.x; J.z = C.z; J.yaw = J.yawAlvo = C.yaw; J.y = 0; J.andando = J.correndo = false; s.sentadoEm = C;
      A.x = B.corte.x; A.z = B.corte.z; A.yaw = A.yawAlvo = B.corte.yaw;
      const cab = { x: C.x, y: 1.25, z: C.z };
      api.camCena({ px: C.x + 1.75, py: 2.05, pz: C.z + 1.75, tx: C.x - 0.35, ty: 1.2, tz: C.z - 0.1 });   // de trás e de lado: a nuca dele e o Toninho trabalhando
      await api.preto(false, 350);
      M.cortando = true; M.tCorte = 0; M.cab = cab; M.corFio = ap.cabelo || '#1C140F'; if (M.tesoura) M.tesoura.visible = true;
      maquina(1.6);
      await api.esperar(1700); tesoura(); await api.esperar(450); tesoura(); await api.esperar(500); tesoura();
      await api.esperar(550);
      // o corte novo (a tela escurece um instante e o boneco é refeito)
      await api.preto(true, 300);
      if (nome) {
        if (!ap.estiloNome) b.original = ap.estilo | 0;                   // o corte do criador (para voltar depois)
        const i = indiceCorte(nome); if (i >= 0) { ap.estilo = i; ap.estiloNome = nome; }
      } else {
        ap.estilo = b.original != null ? b.original | 0 : 0; delete ap.estiloNome;
      }
      M.cortando = false; if (M.tesoura) M.tesoura.visible = false;
      try { api.refazerJogador(); } catch (e) { console.error(e); }
      for (const f of M.fios) if (f.m.parent) f.m.parent.remove(f.m); M.fios = [];
      // ele levanta e fica de frente para a sala (e para a câmera); o Toninho do lado, olhando o resultado
      api.levantar(); C.ocupado = { reservado: true };
      J.x = C.x; J.z = C.z + 0.95; J.y = 0; J.yaw = J.yawAlvo = -Math.PI / 2; J.andando = J.correndo = false;
      A.x = C.x + 1.0; A.z = C.z + 0.55; A.yaw = A.yawAlvo = Math.atan2(-(J.z - A.z), J.x - A.x);
      api.camCena({ px: C.x + 0.55, py: 1.7, pz: C.z + 3.3, tx: C.x + 0.15, ty: 1.35, tz: C.z + 0.95 });
      api.gravar(s.dados.ponto || 'chegada');
      await api.preto(false, 350);
      if (typeof Som !== 'undefined' && Som.clique) Som.clique();
      if (nome) api.aviso(Tf_('Corte novo: {0}', nome));
      await api.esperar(700);
      await api.fala('toninho', T_('Pronto! Ficou na régua.'));
      if (nome) { await api.fala('toninho', T_(fem() ? 'Olha esse espelho. Tá outra pessoa!' : 'Olha esse espelho, chefe. Tá outro homem!')); await api.fala('jog', T_(pk(['Ficou brabo!', 'Caramba, ficou muito bom!']))); }
      else await api.fala('jog', T_('De volta ao velho eu.'));
      Dialogo.esconder(); api.aviso('');
      // o Toninho volta para o lugar dele
      await api.preto(true, 250);
      A.x = B.toninho.x; A.z = B.toninho.z; A.yaw = A.yawAlvo = B.toninho.yaw;
      api.camCena(null); s.cam.snap = true;
      await api.preto(false, 250);
    }

    // ---------------------------------------------------------------- a cada quadro: os braços do Toninho cortando e o cabelo caindo
    function tick(dt) {
      if (!dentro()) return;
      const A = M.T; if (!A || !A.m) return;
      if (M.cortando) {
        M.tCorte += dt; const t = M.tCorte, m = A.m;
        m.bracoD.rotation.x = -1.25 + Math.sin(t * 9) * 0.18; m.bracoD.rotation.z = 0.25 + Math.sin(t * 13) * 0.1;
        m.bracoE.rotation.x = -1.0 + Math.sin(t * 4) * 0.08; m.bracoE.rotation.z = -0.2;
        if (typeof usarCotovelo === 'function') { usarCotovelo(m.bracoD, -0.7, 0.4); usarCotovelo(m.bracoE, -0.6, 0.4); }
        M.tTes -= dt;
        if (M.tTes <= 0 && M.fios.length < 60) {                          // um fio de cabelo caindo da cabeça
          M.tTes = 0.05;
          const g = new THREE.Mesh(M.geoFio || (M.geoFio = api.guardar(new THREE.BoxGeometry(0.035, 0.012, 0.012))), M.matFio || (M.matFio = api.guardar(new THREE.MeshLambertMaterial({ color: M.corFio }))));
          M.matFio.color.set(M.corFio);
          g.position.set(M.cab.x + (Math.random() - 0.5) * 0.35, M.cab.y + 0.15 + Math.random() * 0.1, M.cab.z + (Math.random() - 0.5) * 0.35); g.rotation.set(Math.random() * 3, Math.random() * 3, 0);
          S().grupo.add(g); M.fios.push({ m: g, vy: -0.2 - Math.random() * 0.4, vx: (Math.random() - 0.5) * 0.3, vz: (Math.random() - 0.5) * 0.3 });
        }
      }
      for (const f of M.fios) {
        if (f.m.position.y <= 0.012) continue;
        f.vy -= 2.5 * dt; f.m.position.x += f.vx * dt; f.m.position.z += f.vz * dt; f.m.position.y = Math.max(0.006, f.m.position.y + f.vy * dt); f.m.rotation.z += dt * 4;
        const dx = f.m.position.x - M.cab.x, dz = f.m.position.z - M.cab.z;                       // não atravessa o corpo: escorrega por fora dos ombros
        if (f.m.position.y < 1.1 && f.m.position.y > 0.3 && Math.hypot(dx, dz) < 0.32) { const k = 0.32 / (Math.hypot(dx, dz) || 1); f.m.position.x = M.cab.x + dx * k; f.m.position.z = M.cab.z + dz * k; }
      }
    }

    return { entrou, saiu, alvos, tick, aberto, CORTES_LOJA, _M: M, _fns: { falarComToninho, cortar } };
  }

  window.FutebolJS.registrarFase({ id: 'barbearia', nome: 'Barbearia', nucleoMinimo: '6.6.12', iniciar: async () => {}, criar });
})();
