/* =====================================================================
   FUTEBOL JS · barbearia.js · A BARBEARIA DO TONINHO (arquivo SEPARADO, como academia.js e cinema.js)
   ---------------------------------------------------------------------
   - Registrado com FutebolJS.registrarFase({ id: 'barbearia' }) só para o jogo saber baixar o arquivo; NÃO roda como fase.
     A cidade (cidade.js) baixa em segundo plano e chama criar(api) (api = apiBarbearia() da cidade). O prédio fica entre a quadra
     de futsal e a pizzaria (porta em x −19, na calçada sul) e o interior vem do interiores.js (R.barbearia).
   - Lá dentro só tem o TONINHO, o barbeiro. Falando com ele, o jogador SENTA na cadeira de corte (que gira para a sala) e escolhe
     vendo o corte nele mesmo (como no guarda-roupa). Três seções:
       Padrão ......... os cortes do criador de personagem, PRECO_PADRAO (50 fakes) cada;
       Meus cortes .... os que já são dele (o do criador e os que comprou): trocar é de graça;
       Especiais ...... os cortes do cosmeticos.js (CORTES_ESPECIAIS, com o preço de cada um).
     E o mesmo para BARBA E BIGODE (só personagem masculino): Padrão (os do criador, 50), Minhas barbas e Especiais (BARBAS_ESPECIAIS,
     ainda vazia). Dá para escolher corte e barba na mesma sentada (paga a soma).
     Desistiu: o corte de antes volta e o jogador diz uma das falas de DESISTIR.
   - A CENA DO CORTE tem 3 partes: o Toninho corta do lado · a câmera pisca · corta atrás · pisca (aqui o corte novo já entra) ·
     o Toninho fica na frente da câmera cortando e sai da frente: aparece o corte novo, sem outro corte de câmera.
   - A tesoura (mão direita) e o pente (mão esquerda) ficam NA FRENTE da mão, encostando na pontinha (presos no antebraço).
   - MÚSICA TEMA (punk rock leve, sintetizado): toca enquanto o jogador está lá dentro.
   - O visual fica no personagem: aparencia.estilo / aparencia.barba (e estiloNome / barbaNome quando é especial, para achar pelo nome).
   - Abre das 8h às 20h.
   - Salva em historia.cidade: barbearia = { conheceu, cortes: [cortes que já são dele], barbas: [barbas que já são dele], original (o corte do criador) }.
   ===================================================================== */
(function () {
  'use strict';

  const PRECO_PADRAO = 50;
  // os especiais à venda (nome igual ao do cosmeticos.js) e o preço em fakes
  const CORTES_ESPECIAIS = [
    { nome: 'Maicaninho 2', preco: 200 },
    { nome: 'Cabelinho 3', preco: 300 },
  ];
  // as barbas e bigodes especiais (cosmeticos.js, grupo 'barba' ou 'bigode'): ainda não tem nenhuma pronta. Um cosmético fora das tabelas sai por PRECO_ESPECIAL
  const BARBAS_ESPECIAIS = [];
  const PRECO_ESPECIAL = 200;
  const NO_QUADRO = ['Degradê com risco', 'Topete'];               // o quadro na parede mostra só ALGUNS: estes do padrão e os 2 primeiros especiais
  const H_ABRE = 8, H_FECHA = 20;

  // ------------------------------------------------------------------ textos (pt → en, es, it, fr)
  const TRAD = {
    'Toninho': ['Toninho', 'Toninho', 'Toninho', 'Toninho'],
    'Falar com o Toninho': ['Talk to Toninho', 'Hablar con Toninho', 'Parla con Toninho', 'Parler à Toninho'],
    'Fala, chefe! Bem-vindo à Barbearia do Toninho.': ['Hey, boss! Welcome to Toninho’s Barbershop.', '¡Hola, jefe! Bienvenido a la Barbería de Toninho.', 'Ciao, capo! Benvenuto dal Barbiere Toninho.', 'Salut, chef ! Bienvenue au salon de Toninho.'],
    'Aqui a navalha é afiada e o papo é de graça.': ['Here the razor is sharp and the chat is free.', 'Aquí la navaja está afilada y la charla es gratis.', 'Qui il rasoio è affilato e le chiacchiere sono gratis.', 'Ici, le rasoir est affûté et la causette est gratuite.'],
    'Senta aí que a gente escolhe com calma.': ['Have a seat, we’ll pick it out together, no rush.', 'Siéntate, que elegimos con calma.', 'Siediti, scegliamo con calma.', 'Assieds-toi, on choisit tranquillement.'],
    'Opa! Senta aí que hoje tem corte bom.': ['Hey! Take a seat, we’ve got good cuts today.', '¡Hola! Siéntate, que hoy hay buenos cortes.', 'Ehi! Siediti, oggi ci sono bei tagli.', 'Salut ! Assieds-toi, aujourd’hui il y a de belles coupes.'],
    'Voltou! Vai dar um tapa no visual?': ['You’re back! Going to freshen up the look?', '¡Volviste! ¿Vas a darle un toque al look?', 'Sei tornato! Diamo una sistemata al look?', 'Te revoilà ! On rafraîchit la coupe ?'],
    'Chega mais, a cadeira tá livre!': ['Come on in, the chair’s free!', '¡Acércate, la silla está libre!', 'Vieni, la sedia è libera!', 'Approche, le fauteuil est libre !'],
    'Barbearia do Toninho': ['Toninho’s Barbershop', 'Barbería de Toninho', 'Barbiere Toninho', 'Salon de Toninho'],
    'Padrão': ['Standard', 'Estándar', 'Standard', 'Classique'],
    'Meus cortes': ['My cuts', 'Mis cortes', 'I miei tagli', 'Mes coupes'],
    'Especiais': ['Special', 'Especiales', 'Speciali', 'Spéciales'],
    'atual': ['current', 'actual', 'attuale', 'actuelle'],
    'seu': ['yours', 'tuyo', 'tuo', 'à toi'],
    '{0} fakes': ['{0} fakes', '{0} fakes', '{0} fakes', '{0} fakes'],
    'Você tem {0} fakes': ['You have {0} fakes', 'Tienes {0} fakes', 'Hai {0} fakes', 'Tu as {0} fakes'],
    'Cortar · {0} fakes': ['Cut · {0} fakes', 'Cortar · {0} fakes', 'Taglia · {0} fakes', 'Couper · {0} fakes'],
    'Cortar · grátis': ['Cut · free', 'Cortar · gratis', 'Taglia · gratis', 'Couper · gratuit'],
    'Desistir': ['Never mind', 'Desistir', 'Lascia stare', 'Laisser tomber'],
    'Esse é o seu corte agora.': ['That’s your cut right now.', 'Ese es tu corte ahora.', 'È il tuo taglio adesso.', 'C’est ta coupe actuelle.'],
    'Faltam {0} fakes para esse corte.': ['You need {0} more fakes for this cut.', 'Te faltan {0} fakes para este corte.', 'Ti mancano {0} fakes per questo taglio.', 'Il te manque {0} fakes pour cette coupe.'],
    'Toque num corte para ver como fica.': ['Tap a cut to see how it looks.', 'Toca un corte para ver cómo queda.', 'Tocca un taglio per vedere come sta.', 'Touche une coupe pour voir le résultat.'],
    'Os especiais ainda estão chegando. Volta daqui a pouco!': ['The special cuts are still on their way. Come back soon!', 'Los especiales todavía están llegando. ¡Vuelve en un rato!', 'Gli speciali stanno ancora arrivando. Torna tra poco!', 'Les spéciales arrivent bientôt. Reviens tout à l’heure !'],
    'Pensando bem, acho melhor eu pesquisar uns cortes antes.': ['On second thought, I’d better look up some cuts first.', 'Pensándolo bien, mejor investigo unos cortes antes.', 'Ripensandoci, è meglio che prima cerchi qualche taglio.', 'Tout bien réfléchi, je ferais mieux de chercher quelques coupes avant.'],
    'Hmm... vou dar uma olhada em umas fotos e depois eu volto.': ['Hmm... I’ll check out some photos and come back later.', 'Mmm... voy a mirar unas fotos y después vuelvo.', 'Mmm... guardo qualche foto e poi torno.', 'Hmm... je vais regarder quelques photos et je reviens.'],
    'Sabe de uma coisa? Vou pensar mais um pouco antes de mexer no cabelo.': ['You know what? I’ll think a bit more before touching my hair.', '¿Sabes qué? Lo voy a pensar un poco más antes de tocarme el pelo.', 'Sai una cosa? Ci penso ancora un po’ prima di toccare i capelli.', 'Tu sais quoi ? Je vais réfléchir encore un peu avant de toucher à mes cheveux.'],
    'Acho que hoje não. Deixa eu ver umas referências primeiro.': ['Maybe not today. Let me find some references first.', 'Creo que hoy no. Déjame ver unas referencias primero.', 'Forse oggi no. Prima voglio vedere qualche riferimento.', 'Pas aujourd’hui, je crois. Je vais d’abord chercher des idées.'],
    'Melhor não arriscar. Vou pesquisar uns estilos e volto outro dia.': ['Better not risk it. I’ll research some styles and come back another day.', 'Mejor no arriesgar. Voy a buscar unos estilos y vuelvo otro día.', 'Meglio non rischiare. Cerco qualche stile e torno un altro giorno.', 'Mieux vaut ne pas prendre de risque. Je vais chercher des styles et je reviendrai.'],
    'Tranquilo, chefe. A cadeira tá aqui quando quiser.': ['No worries, boss. The chair’s here whenever you want.', 'Tranquilo, jefe. La silla está aquí cuando quieras.', 'Tranquillo, capo. La sedia è qui quando vuoi.', 'Pas de souci, chef. Le fauteuil est là quand tu veux.'],
    'De boa! Pesquisa aí e volta que eu deixo na régua.': ['All good! Do your research and come back, I’ll make it sharp.', '¡Tranqui! Investiga y vuelve, que te lo dejo perfecto.', 'Tranquillo! Fai le tue ricerche e torna, te lo sistemo alla perfezione.', 'Tranquille ! Cherche un peu et reviens, je te ferai ça nickel.'],
    'Fechou! Bora pro trampo.': ['Deal! Let’s get to work.', '¡Hecho! Vamos al trabajo.', 'Fatto! Al lavoro.', 'Ça marche ! Au boulot.'],
    'Pronto! Ficou na régua.': ['Done! Sharp as a ruler.', '¡Listo! Quedó perfecto.', 'Fatto! Preciso al millimetro.', 'Voilà ! Nickel.'],
    'Olha esse espelho, chefe. Tá outro homem!': ['Look in that mirror, boss. You’re a new man!', 'Mira ese espejo, jefe. ¡Eres otro!', 'Guarda lo specchio, capo. Sei un altro!', 'Regarde-toi dans le miroir, chef. Tu es un autre homme !'],
    'Olha esse espelho. Tá outra pessoa!': ['Look in that mirror. You’re a new person!', 'Mira ese espejo. ¡Eres otra persona!', 'Guarda lo specchio. Sei un’altra persona!', 'Regarde-toi dans le miroir. Tu es quelqu’un d’autre !'],
    'Ficou brabo!': ['Looks awesome!', '¡Quedó brutal!', 'È venuto fortissimo!', 'C’est trop stylé !'],
    'Caramba, ficou muito bom!': ['Wow, that looks really good!', '¡Caramba, quedó muy bien!', 'Caspita, è venuto benissimo!', 'Waouh, c’est vraiment réussi !'],
    'Corte novo: {0}': ['New cut: {0}', 'Corte nuevo: {0}', 'Taglio nuovo: {0}', 'Nouvelle coupe : {0}'],
    'CORTES': ['CUTS', 'CORTES', 'TAGLI', 'COUPES'],
    'Cabelo': ['Hair', 'Pelo', 'Capelli', 'Cheveux'],
    'Barba e bigode': ['Beard & mustache', 'Barba y bigote', 'Barba e baffi', 'Barbe et moustache'],
    'Minhas barbas': ['My beards', 'Mis barbas', 'Le mie barbe', 'Mes barbes'],
    'Barba': ['Beard', 'Barba', 'Barba', 'Barbe'],
    'Só bigodinho': ['Mustache only', 'Solo bigotito', 'Solo baffetti', 'Juste une moustache'],
    'Toque numa barba para ver como fica.': ['Tap a beard to see how it looks.', 'Toca una barba para ver cómo queda.', 'Tocca una barba per vedere come sta.', 'Touche une barbe pour voir le résultat.'],
    'Essa é a sua barba agora.': ['That’s your beard right now.', 'Esa es tu barba ahora.', 'È la tua barba adesso.', 'C’est ta barbe actuelle.'],
    'Faltam {0} fakes para esse visual.': ['You need {0} more fakes for this look.', 'Te faltan {0} fakes para este look.', 'Ti mancano {0} fakes per questo look.', 'Il te manque {0} fakes pour ce look.'],
    'Barba nova: {0}': ['New beard: {0}', 'Barba nueva: {0}', 'Barba nuova: {0}', 'Nouvelle barbe : {0}'],
    'E MAIS...': ['AND MORE...', 'Y MÁS...', 'E ALTRI...', 'ET PLUS...'],
  };
  Object.assign(TRAD, {
    'Bora!': ['Let’s go!', '¡Vamos!', 'Andiamo!', 'C’est parti !'],
    'Espero que você corte melhor do que fala.': ['I hope you cut better than you talk.', 'Espero que cortes mejor de lo que hablas.', 'Spero che tu tagli meglio di come parli.', 'J’espère que tu coupes mieux que tu ne parles.'],
    'Ih, chegou azedo, hein, chefe? Senta aí que eu te dou um trato mesmo assim.': ['Whoa, someone’s grumpy today, boss. Have a seat, I’ll fix you up anyway.', 'Uy, llegaste amargado, ¿eh, jefe? Siéntate que igual te dejo bien.', 'Eh, arrivi acido, eh, capo? Siediti che ti sistemo lo stesso.', 'Oh là, t’es de mauvais poil, chef ? Assieds-toi, je m’occupe de toi quand même.'],
    'Agora não': ['Not now', 'Ahora no', 'Non adesso', 'Pas maintenant'],
  });
  if (typeof I18N !== 'undefined') for (const k of Object.keys(TRAD)) if (!I18N[k]) I18N[k] = TRAD[k];
  const DESISTIR = ['Pensando bem, acho melhor eu pesquisar uns cortes antes.', 'Hmm... vou dar uma olhada em umas fotos e depois eu volto.', 'Sabe de uma coisa? Vou pensar mais um pouco antes de mexer no cabelo.', 'Acho que hoje não. Deixa eu ver umas referências primeiro.', 'Melhor não arriscar. Vou pesquisar uns estilos e volto outro dia.'];

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

  // ------------------------------------------------------------------ MÚSICA TEMA: punk rock leve (pop punk de skate), em Ré maior, 160 bpm.
  //   Bateria reta (bumbo no 1 e no 3, caixa no 2 e no 4, chimbal em colcheia), baixo em colcheia, power chords com distorção leve
  //   (abafadas, com a primeira de cada compasso aberta) e, a partir da 2ª volta, um solinho chiclete. 8 compassos: D A Bm G · Bm G D A.
  const Musica = (() => {
    let R = null;
    const PASSO = 60 / 160 / 2;
    const RAIZ = [38, 33, 35, 31, 35, 31, 38, 33];                 // Ré, Lá, Si, Sol · Si, Sol, Ré, Lá (o acorde de Si é menor: a quinta é a mesma)
    const SOLO = [[78, 0, 78, 76, 74, -1, 76, 78], [76, 0, 73, 0, 69, -1, -1, -1], [74, 0, 74, 76, 78, 0, 81, 0], [79, 0, 78, 76, 74, -1, -1, -1],
      [78, 0, 81, 0, 83, 0, 81, 78], [79, 0, 78, 79, 81, -1, -1, -1], [78, 0, 76, 74, 76, 0, 78, 0], [76, 0, -1, -1, 73, 0, 76, 0]];
    const hz = (n) => 440 * Math.pow(2, (n - 69) / 12);
    const curvaDist = (k) => { const n = 256, c = new Float32Array(n); for (let i = 0; i < n; i++) { const x = i / (n - 1) * 2 - 1; c[i] = (1 + k) * x / (1 + k * Math.abs(x)); } return c; };
    function osc(r, tipo, f, t, dur, vol, dest, ate) { const o = r.c.createOscillator(), g = r.c.createGain(); o.type = tipo; o.frequency.setValueAtTime(f, t); if (ate) o.frequency.exponentialRampToValueAtTime(ate, t + dur); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + 0.03); }
    function ruido(r, t, dur, vol, tipoF, freq, dest) { const s = r.c.createBufferSource(), f = r.c.createBiquadFilter(), g = r.c.createGain(); s.buffer = r.rb; f.type = tipoF; f.frequency.value = freq; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(f); f.connect(g); g.connect(dest); s.start(t, Math.random() * 0.8); s.stop(t + dur + 0.03); }
    function passo(r, p, t) {
      const ps = p % 8, cp = Math.floor(p / 8) % 8, raiz = RAIZ[cp], volta = Math.floor(p / 64);
      if (ps === 0 || ps === 4 || (ps === 5 && cp % 2)) { osc(r, 'sine', 140, t, 0.15, 0.8, r.bat, 45); }
      if (ps === 2 || ps === 6) { ruido(r, t, 0.15, 0.45, 'bandpass', 1800, r.bat); osc(r, 'triangle', 200, t, 0.07, 0.25, r.bat, 160); }
      ruido(r, t, ps === 7 && cp === 7 ? 0.25 : 0.04, ps % 2 ? 0.1 : 0.16, 'highpass', 7500, r.bat);
      if (p % 64 === 0 && p > 0) ruido(r, t, 1.4, 0.22, 'highpass', 5000, r.bat);
      const aberta = ps === 0; for (const [d, q] of [[0, 1], [7, 0.75], [12, 0.5]]) osc(r, 'sawtooth', hz(raiz + 12 + d), t, aberta ? PASSO * 1.8 : PASSO * 0.45, (aberta ? 0.11 : 0.08) * q, r.gt);
      osc(r, 'triangle', hz(raiz), t, PASSO * 0.85, 0.32, r.bx); osc(r, 'sawtooth', hz(raiz), t, PASSO * 0.6, 0.06, r.bx);
      if (volta >= 1) {
        const n = SOLO[cp][ps];
        if (n > 0) { let d = 1; while (ps + d < 8 && SOLO[cp][ps + d] === 0) d++; const o = r.c.createOscillator(), g = r.c.createGain(), dur = PASSO * d * 0.92; o.type = 'square'; o.frequency.setValueAtTime(hz(n), t);
          g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.045, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(r.ld); o.start(t); o.stop(t + dur + 0.03); }
      }
    }
    function agenda() { const r = R; if (!r) return; const ate = r.c.currentTime + 0.15; while (r.prox < ate) { passo(r, r.p, r.prox); r.prox += PASSO; r.p++; } }
    function montar(A) {
      const c = A.ctx, r = { c, p: 0 };
      r.rb = c.createBuffer(1, c.sampleRate, c.sampleRate); const d = r.rb.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      r.saida = c.createGain(); r.saida.gain.setValueAtTime(0.0001, c.currentTime); r.saida.gain.exponentialRampToValueAtTime(0.16, c.currentTime + 1.2); r.saida.connect(A.mestre);
      r.bat = c.createGain(); r.bat.gain.value = 0.8; r.bat.connect(r.saida);
      r.gt = c.createGain(); const ws = c.createWaveShaper(); ws.curve = curvaDist(9); const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2300; r.gt.connect(ws); ws.connect(lp); lp.connect(r.saida);
      r.bx = c.createGain(); const lb = c.createBiquadFilter(); lb.type = 'lowpass'; lb.frequency.value = 700; r.bx.connect(lb); lb.connect(r.saida);
      r.ld = c.createGain(); const ll = c.createBiquadFilter(); ll.type = 'lowpass'; ll.frequency.value = 3000; r.ld.connect(ll); ll.connect(r.saida);
      r.prox = c.currentTime + 0.1; return r;
    }
    return {
      tocar() { const A = audio(); if (!A || R) return; try { R = montar(A); R.tm = setInterval(agenda, 25); agenda(); } catch (e) { R = null; } },
      parar() {
        const r = R; if (!r) return; R = null; clearInterval(r.tm);
        try { const t = r.c.currentTime; r.saida.gain.cancelScheduledValues(t); r.saida.gain.setValueAtTime(Math.max(0.0001, r.saida.gain.value), t); r.saida.gain.exponentialRampToValueAtTime(0.0001, t + 0.6); } catch (e) { /* sem som */ }
        setTimeout(() => { try { r.saida.disconnect(); } catch (e) { /* já foi */ } }, 900);
      },
      tocando: () => !!R,
    };
  })();

  // ------------------------------------------------------------------ o painel da escolha (como o guarda-roupa da Fase 2: à direita, a tela livre para ver o corte)
  const CSS = `
#bbPainel { position: fixed; z-index: 12; top: 0; right: 0; bottom: 0; width: min(46vw, 400px); box-sizing: border-box; padding: calc(52px + env(safe-area-inset-top, 0px)) max(8px, env(safe-area-inset-right, 0px)) calc(8px + env(safe-area-inset-bottom, 0px)) 8px;
  display: flex; flex-direction: column; gap: 6px; --mx-ink: #2a1206; --mx-creme: #fff0c8; color: #fff0c8; background: linear-gradient(90deg, rgba(10,6,3,0), rgba(10,6,3,0.84) 14%); }
#bbPainel .bTit { margin: 0 0 0 14px; font: 700 15px/1.2 var(--font-display); letter-spacing: 0.1em; text-transform: uppercase; text-shadow: 0 2px 0 #2a1206; }
#bbPainel .bGrana { margin: 0 0 0 14px; font: 700 12px/1.2 var(--font-display); letter-spacing: 0.06em; color: #f2c230; }
#bbPainel .bAbas { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; margin-left: 14px; }
#bbPainel .bModo { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin-left: 14px; }
#bbPainel .bModo .pxBtn { min-height: 30px; }
#bbPainel .bSub { margin: 8px 0 4px; font: 700 11px/1.2 var(--font-display); letter-spacing: 0.08em; text-transform: uppercase; color: #f0a020; }
#bbPainel .bCorpo { flex: 1 1 auto; min-height: 0; overflow-y: auto; margin-left: 14px; padding-right: 4px; }
#bbPainel .bGrade { display: grid; grid-template-columns: repeat(2, 1fr); gap: 5px; }
#bbPainel .pxBtn { --p: var(--p2, 2px); height: auto; min-height: 38px; font-size: 11px; line-height: 1.15; padding: 3px 4px; white-space: normal; flex-direction: column; justify-content: center; }
#bbPainel .pxBtn small { display: block; font-size: 9px; opacity: 0.85; margin-top: 2px; }
#bbPainel .pxBtn.on { border-image-source: var(--sp-laranja); color: #fff; }
#bbPainel .pxBtn[disabled] { opacity: 0.5; }
#bbPainel .bVazio { margin: 12px 4px; font: 400 12px/1.4 system-ui, sans-serif; opacity: 0.85; }
#bbPainel .bMsg { margin: 0 0 0 14px; min-height: 15px; font: 400 12px/1.3 system-ui, sans-serif; color: #ffd27a; }
#bbPainel .bFim { margin-left: 14px; display: grid; grid-template-columns: 1fr 1fr; gap: 5px; }`;
  function estilo() { if (document.getElementById('bbCss')) return; const st = document.createElement('style'); st.id = 'bbCss'; st.textContent = CSS; document.head.appendChild(st); }
  const escH = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function criar(api) {
    const S = api.S, T_ = (t) => T(t), Tf_ = (t, ...a) => Tf(t, ...a);
    const M = { R: null, B: null, T: null, cortando: 0, fios: [], tTes: 0, quadro: null, tesoura: null, pente: null, cadeiraM: null, anim: null };
    const dadosB = () => { const d = S().dados; d.barbearia = d.barbearia || { conheceu: false, cortes: [] }; d.barbearia.cortes = d.barbearia.cortes || []; d.barbearia.barbas = d.barbearia.barbas || []; return d.barbearia; };
    const hora = () => S().dados.hora;
    const aberto = () => hora() >= H_ABRE && hora() < H_FECHA;
    const aparencia = () => (PERSONAGEM.aparencia || (PERSONAGEM.aparencia = {}));
    const fem = () => PERSONAGEM.genero === 'F';
    const pk = (l) => l[Math.floor(Math.random() * l.length)];
    // os cortes à venda: { i (índice na lista do jogo), nome, preco, especial }
    // CABELO e BARBA com a mesma lógica: a lista do jogo, os preços especiais e a lista do que já é dele (pelo nome)
    //   padroes: os do criador (PRECO_PADRAO) · especiais: os cosméticos (preço da tabela; fora dela, PRECO_ESPECIAL) · meus: os que já são dele
    const tipoDe = (lista, tabela, donos) => {
      const padroes = () => lista().map((c, i) => ({ i, nome: c.nome, preco: PRECO_PADRAO })).filter((c) => !lista()[c.i].cosmetico);
      const especiais = () => lista().map((c, i) => ({ i, nome: c.nome })).filter((c) => lista()[c.i].cosmetico)
        .map((c) => { const t = tabela.find((x) => x.nome === c.nome); return Object.assign(c, { preco: t ? t.preco : PRECO_ESPECIAL, ord: t ? tabela.indexOf(t) : 99 }); }).sort((a, b) => a.ord - b.ord);
      return { padroes, especiais, donos, meus: () => padroes().concat(especiais()).filter((c) => donos().includes(c.nome)), nome: (i) => (lista()[i] ? lista()[i].nome : '') };
    };
    const TIPOS = {
      cabelo: tipoDe(() => ESTILOS_CABELO, CORTES_ESPECIAIS, () => dadosB().cortes),
      barba: tipoDe(() => ESTILOS_BARBA, BARBAS_ESPECIAIS, () => dadosB().barbas),
    };
    const ehEspecial = (k, i) => { const l = k === 'barba' ? ESTILOS_BARBA : ESTILOS_CABELO; return !!(l[i] && l[i].cosmetico); };
    const especiais = () => TIPOS.cabelo.especiais();

    // ---------------------------------------------------------------- LÁ DENTRO: o Toninho, a cadeira que gira, o quadro e a música
    const acha = (lista, n) => Math.max(0, lista.findIndex((x) => x.nome === n));
    function entrou(R) {
      const s = S(), B = R.barbearia; if (!B) return;
      M.R = R; M.B = B; M.cortando = 0;
      const ap = { pele: PELES_FITZ[3].cor, cabelo: CORES_CABELO[0].cor, estilo: acha(ESTILOS_CABELO, 'Degradê com risco'), rosto: acha(ROSTOS, 'Sorridente'), labio: 3, barba: acha(ESTILOS_BARBA, 'Cavanhaque com bigode'), corBarba: CORES_CABELO[0].cor };
      const A = api.criarNPCFixo(ap, false, 0, ['#f2f2ee', '#1c1c1f', '#2a3f66', '#1c1c1f']);
      A.tipo = 'parado'; A.x = B.toninho.x; A.z = B.toninho.z; A.yaw = A.yawAlvo = B.toninho.yaw; M.T = A;
      s.falantesExtra = s.falantesExtra || {}; s.falantesExtra.toninho = { A, nome: T_('Toninho'), voz: 3 };
      // a tesoura e o pente: na FRENTE da mão, encostando na pontinha. Presos no antebraço (cotovelo), que é o que fica visível
      //   quando o braço dobra: a mão termina em y = −0,65 do ombro (−0,65 − cotovelo.y no antebraço).
      const naPonta = (braco, malha) => { const ant = braco.cotovelo || braco; malha.position.set(0, -0.65 - (braco.cotovelo ? braco.cotovelo.position.y : 0), 0); malha.visible = false; ant.add(malha); return malha; };
      const Gt = new api.Geo();
      Gt.box(0.075, 0.035, 0.035, '#1c1c1f', 0, -0.0175, 0);                          // as argolas encostadas na ponta da mão
      Gt.box(0.022, 0.17, 0.018, '#d8dde3', -0.014, -0.12, 0); Gt.box(0.022, 0.17, 0.018, '#aeb4bc', 0.014, -0.12, 0.004);   // as duas lâminas, para a frente
      M.tesoura = naPonta(A.m.bracoD, Gt.malha(api.MAT));
      const Gp = new api.Geo(); Gp.box(0.03, 0.15, 0.012, '#1c1c1f', 0, -0.075, 0); for (let k = 0; k < 5; k++) Gp.box(0.024, 0.008, 0.012, '#1c1c1f', 0.026, -0.02 - k * 0.026, 0);   // o pente
      M.pente = naPonta(A.m.bracoE, Gp.malha(api.MAT));
      // a cadeira de corte (gira junto com quem está sentado) e o assento dela (reservado: só no corte)
      const C = B.cadeira, Gc = new api.Geo();
      Gc.box(0.62, 0.06, 0.62, '#9aa0a8', 0, 0, 0); Gc.box(0.16, 0.36, 0.16, '#c9ced4', 0, 0.06, 0);
      Gc.box(0.6, 0.14, 0.58, '#8a1f24', 0, 0.42, 0); Gc.box(0.62, 0.05, 0.6, '#c9ced4', 0, 0.38, 0);
      Gc.box(0.58, 0.78, 0.12, '#8a1f24', 0, 0.56, 0.3); Gc.box(0.32, 0.2, 0.1, '#8a1f24', 0, 1.4, 0.31); Gc.box(0.05, 0.22, 0.05, '#c9ced4', 0, 1.3, 0.31);
      for (const sx of [-1, 1]) { Gc.box(0.08, 0.07, 0.48, '#1c1c1f', sx * 0.33, 0.78, 0.02); Gc.box(0.05, 0.22, 0.05, '#c9ced4', sx * 0.33, 0.56, 0.2); }
      Gc.box(0.5, 0.05, 0.16, '#c9ced4', 0, 0.16, -0.42); Gc.box(0.05, 0.3, 0.05, '#c9ced4', 0, 0.18, -0.3);
      M.cadeiraM = Gc.malha(api.MAT); M.cadeiraM.position.set(C.x, 0, C.z); R.grupo.add(M.cadeiraM);
      M.cadeira = api.assento(C.x, C.z, C.fx, C.fz, C.h, 'cadeira'); M.cadeira.ocupado = { reservado: true };
      girarCadeira(Math.PI / 2);
      montarQuadro(R);
      Musica.tocar();
    }
    // a cadeira olhando para yaw (o mesmo jeito de contar do jogador: π/2 = norte, para o espelho; −π/2 = sul, para a sala)
    function girarCadeira(yaw) { if (M.cadeiraM) M.cadeiraM.rotation.y = yaw - Math.PI / 2; if (M.cadeira) { M.cadeira.yaw = yaw; M.cadeira.fx = Math.cos(yaw); M.cadeira.fz = -Math.sin(yaw); } }
    // o quadro da parede: só ALGUNS cortes (NO_QUADRO + os 2 primeiros especiais) e um "e mais..."
    function montarQuadro(R) {
      const lista = NO_QUADRO.filter((n) => ESTILOS_CABELO.some((c) => !c.cosmetico && c.nome === n)).map((n) => ({ nome: n, preco: PRECO_PADRAO })).concat(especiais().slice(0, 2));
      const W = 1.7, H = 0.62 + 0.3 * lista.length, q = M.B.quadro;
      const tex = api.guardar(api.texCanvas(170, Math.round(H * 100), (g, w, h) => {
        g.fillStyle = '#1f2a22'; g.fillRect(0, 0, w, h); g.strokeStyle = '#c9a24a'; g.lineWidth = 6; g.strokeRect(3, 3, w - 6, h - 6);
        g.fillStyle = '#f2c230'; g.font = 'bold 15px monospace'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(T_('CORTES'), w / 2, 22);
        g.font = 'bold 12px monospace'; g.fillStyle = '#f4efe2';
        lista.forEach((c, i) => { const y = 50 + i * 30; g.textAlign = 'left'; g.fillText(c.nome, 12, y); g.textAlign = 'right'; g.fillText(String(c.preco), w - 12, y); });
        g.textAlign = 'center'; g.fillStyle = '#c9a24a'; g.fillText(T_('E MAIS...'), w / 2, 50 + lista.length * 30);
      }, false));
      const m = new THREE.Mesh(api.guardar(new THREE.PlaneGeometry(W, H)), api.guardar(new THREE.MeshLambertMaterial({ map: tex })));
      m.position.set(q.x, 1.25 + H / 2, q.z + 0.02); R.grupo.add(m); M.quadro = m;
    }
    function saiu() {
      const s = S();
      Musica.parar(); fecharPainel();
      M.cortando = 0; M.anim = null; for (const f of M.fios) if (f.m.parent) f.m.parent.remove(f.m); M.fios = [];
      M.R = null; M.B = null; M.T = null; M.quadro = null; M.tesoura = null; M.pente = null; M.cadeira = null; M.cadeiraM = null;
      if (s && s.falantesExtra) delete s.falantesExtra.toninho;
    }
    const dentro = () => { const s = S(); return !!(s && s.dentro && s.dentro.nome === 'barbearia' && M.B); };

    function alvos(v) {
      if (!dentro() || !M.T || M.cortando || M.ocupado) return;
      v.push({ x: M.T.x, z: M.T.z, r: 1.7, txt: T_('Falar com o Toninho'), fn: falarComToninho, y: 2.3, pri: true });
    }

    // ---------------------------------------------------------------- senta e ESCOLHE (preview no próprio jogador): cabelo e barba
    async function falarComToninho() {
      const s = S(), J = s.jog, A = M.T, b = dadosB(), ap = aparencia();
      A.yawAlvo = Math.atan2(-(J.z - A.z), J.x - A.x); M.ocupado = true;
      try {
        if (!b.conheceu) {
          await api.fala('toninho', T_('Fala, chefe! Bem-vindo à Barbearia do Toninho.'));
          await api.fala('toninho', T_('Aqui a navalha é afiada e o papo é de graça.'));
          b.conheceu = true;
        } else await api.fala('toninho', T_(pk(['Opa! Senta aí que hoje tem corte bom.', 'Voltou! Vai dar um tapa no visual?', 'Chega mais, a cadeira tá livre!'])));
        const q = T_('Senta aí que a gente escolhe com calma.');
        await api.fala('toninho', q);
        const rg = await Escolha.mostrar(q, [T_('Bora!'), T_('Espero que você corte melhor do que fala.'), T_('Agora não')]);   // a grosseria (−5 e arrogância)
        if (rg === 2) { await api.fala('toninho', T_(pk(['Tranquilo, chefe. A cadeira tá aqui quando quiser.', 'De boa! Pesquisa aí e volta que eu deixo na régua.']))); Dialogo.esconder(); return; }
        if (rg === 1) { await api.falaGrossa('toninho', 'toninho', T_('Espero que você corte melhor do que fala.'), (typeof Tg === 'function' ? Tg : T_)('Ih, chegou azedo, hein, chefe? Senta aí que eu te dou um trato mesmo assim.')); }
        Dialogo.esconder();
        // o corte e a barba de agora (os do criador) já são dele
        const antes = { cabelo: ap.estilo | 0, barba: ap.barba | 0 };
        for (const k of ['cabelo', 'barba']) { const n = TIPOS[k].nome(antes[k]), l = TIPOS[k].donos(); if (n && !l.includes(n)) l.push(n); }
        if (b.original == null && !ehEspecial('cabelo', antes.cabelo)) b.original = antes.cabelo;
        await sentarParaEscolher();
        const sel = await painel(antes);
        if (!sel) {                                                       // desistiu: volta o visual de antes
          if ((ap.estilo | 0) !== antes.cabelo || (ap.barba | 0) !== antes.barba) vestirLook(antes);
          fecharPainel();
          await api.fala('jog', T_(pk(DESISTIR)));
          await api.fala('toninho', T_(pk(['Tranquilo, chefe. A cadeira tá aqui quando quiser.', 'De boa! Pesquisa aí e volta que eu deixo na régua.'])));
          Dialogo.esconder(); await levantar();
          return;
        }
        // paga o que ainda não era dele; o visual de antes volta para a cena (o novo só entra na 3ª parte)
        let total = 0;
        for (const k of ['cabelo', 'barba']) { const c = sel[k]; if (c && c.i !== antes[k] && !TIPOS[k].donos().includes(c.nome)) { total += c.preco; TIPOS[k].donos().push(c.nome); } }
        if (total > 0) { const d = s.dados; d.fakes -= total; if (d.devInfinito && d.fakes < 0) d.fakes = 0; api.somDinheiro(); api.mostrarDinheiro(false); api.gastoNaTela(total); }
        fecharPainel();
        await api.fala('toninho', T_('Fechou! Bora pro trampo.')); Dialogo.esconder();
        const depois = { cabelo: sel.cabelo ? sel.cabelo.i : antes.cabelo, barba: sel.barba ? sel.barba.i : antes.barba };
        const avisos = [];
        if (depois.cabelo !== antes.cabelo) avisos.push(Tf_('Corte novo: {0}', T_(TIPOS.cabelo.nome(depois.cabelo))));
        if (depois.barba !== antes.barba) avisos.push(Tf_('Barba nova: {0}', T_(TIPOS.barba.nome(depois.barba))));
        await cenaDoCorte(antes, depois, avisos.join(' · '));
      } catch (e) { console.error(e); fecharPainel(); }
      finally { Dialogo.esconder(); M.ocupado = false; if (M.T && M.B && !M.cortando) { M.T.tipo = 'parado'; M.T.yawAlvo = M.B.toninho.yaw; } api.gravar(s.dados.ponto || 'chegada'); }
    }
    // põe o visual { cabelo, barba } (índices) no jogador e refaz o boneco; especial guarda também o nome (para achar de novo)
    function vestirLook(v) {
      const ap = aparencia();
      if (v.cabelo != null) { ap.estilo = v.cabelo; if (ehEspecial('cabelo', v.cabelo)) ap.estiloNome = TIPOS.cabelo.nome(v.cabelo); else delete ap.estiloNome; }
      if (v.barba != null) { ap.barba = v.barba; if (ehEspecial('barba', v.barba)) ap.barbaNome = TIPOS.barba.nome(v.barba); else delete ap.barbaNome; }
      try { api.refazerJogador(); } catch (e) { console.error(e); }
    }
    const camEscolha = () => { const C = M.B.cadeira; api.camCena({ px: C.x + 0.4, py: 1.78, pz: C.z + 2.85, tx: C.x + 0.7, ty: 1.42, tz: C.z }); };   // de frente; o jogador fica à esquerda (o painel ocupa a direita)
    async function sentarParaEscolher() {
      const s = S(), J = s.jog, A = M.T, C = M.cadeira, B = M.B;
      await api.preto(true, 300);
      girarCadeira(-Math.PI / 2);                                         // de frente para a sala
      C.ocupado = J; J.sentado = true; J.assento = C.h; J.x = C.x; J.z = C.z; J.yaw = J.yawAlvo = C.yaw; J.y = 0; J.andando = J.correndo = false; s.sentadoEm = C;
      A.x = B.cadeira.x + 1.05; A.z = B.cadeira.z + 0.35; A.yaw = A.yawAlvo = Math.atan2(-(J.z - A.z), J.x - A.x);
      camEscolha();
      await api.preto(false, 300);
    }
    async function levantar() {
      const s = S(), J = s.jog, A = M.T, C = M.cadeira, B = M.B;
      await api.preto(true, 280);
      api.levantar(); C.ocupado = { reservado: true }; girarCadeira(Math.PI / 2);
      J.x = B.cadeira.x + 0.9; J.z = B.cadeira.z + 1.15; J.y = 0; J.yaw = J.yawAlvo = -Math.PI / 2;
      A.tipo = 'parado'; A.rota = null; A.x = B.toninho.x; A.z = B.toninho.z; A.yaw = A.yawAlvo = B.toninho.yaw;
      api.camCena(null); s.cam.snap = true;
      await api.preto(false, 280);
    }
    // o PAINEL: Cabelo | Barba (barba só para personagem masculino) e três abas em cada; tocar num item já mostra no jogador.
    //   Dá para escolher corte E barba na mesma sentada (paga a soma). Resolve com { cabelo, barba } (o que mudou) ou null (desistiu).
    function fecharPainel() { const el = document.getElementById('bbPainel'); if (el) el.remove(); }
    function painel(antes) {
      estilo();
      return new Promise((fim) => {
        const s = S(), el = document.createElement('div'); el.id = 'bbPainel';
        (document.getElementById('raizJogo') || document.body).appendChild(el);
        const comBarba = !fem();
        let modo = 'cabelo', aba = 'padrao', msg = T_('Toque num corte para ver como fica.');
        const sel = { cabelo: null, barba: null };
        const lista = () => { const Tp = TIPOS[modo]; return aba === 'padrao' ? Tp.padroes() : aba === 'meus' ? Tp.meus() : Tp.especiais(); };
        const custo = (k) => { const c = sel[k]; return c && c.i !== antes[k] && !TIPOS[k].donos().includes(c.nome) ? c.preco : 0; };
        const muda = () => ['cabelo', 'barba'].some((k) => sel[k] && sel[k].i !== antes[k]);
        const botao = (c) => {
          const Tp = TIPOS[modo], rot = c.i === antes[modo] ? T_('atual') : Tp.donos().includes(c.nome) ? T_('seu') : Tf_('{0} fakes', c.preco), on = sel[modo] ? sel[modo].i === c.i : c.i === antes[modo];
          return '<button type="button" class="pxBtn' + (on ? ' on' : '') + '" data-i="' + c.i + '">' + escH(T_(c.nome)) + '<small>' + escH(rot) + '</small></button>';
        };
        const render = (manter) => {
          const ant = el.querySelector('.bCorpo'), sc = manter && ant ? ant.scrollTop : 0, L = lista();
          let corpo;
          if (!L.length) corpo = '<p class="bVazio">' + escH(aba === 'especiais' ? T_('Os especiais ainda estão chegando. Volta daqui a pouco!') : '') + '</p>';
          else if (modo === 'barba' && aba !== 'especiais') {                // barba e bigodinho separados (como no criador)
            corpo = [['barba', 'Barba'], ['bigode', 'Só bigodinho']].map(([g, n]) => { const sub = L.filter((c) => (ESTILOS_BARBA[c.i].grupo || 'barba') === g); return sub.length ? '<p class="bSub">' + escH(T_(n)) + '</p><div class="bGrade">' + sub.map(botao).join('') + '</div>' : ''; }).join('');
          } else corpo = '<div class="bGrade">' + L.map(botao).join('') + '</div>';
          const p = custo('cabelo') + custo('barba');
          el.innerHTML = '<p class="bTit">' + escH(T_('Barbearia do Toninho')) + '</p><p class="bGrana">' + escH(Tf_('Você tem {0} fakes', s.dados.fakes)) + '</p>'
            + (comBarba ? '<div class="bModo">' + [['cabelo', 'Cabelo'], ['barba', 'Barba e bigode']].map(([k, n]) => '<button type="button" class="pxBtn' + (modo === k ? ' on' : '') + '" data-modo="' + k + '">' + escH(T_(n)) + '</button>').join('') + '</div>' : '')
            + '<div class="bAbas">' + [['padrao', 'Padrão'], ['meus', modo === 'barba' ? 'Minhas barbas' : 'Meus cortes'], ['especiais', 'Especiais']].map(([k, n]) => '<button type="button" class="pxBtn' + (aba === k ? ' on' : '') + '" data-aba="' + k + '">' + escH(T_(n)) + '</button>').join('') + '</div>'
            + '<div class="bCorpo">' + corpo + '</div>'
            + '<p class="bMsg">' + escH(msg) + '</p>'
            + '<div class="bFim"><button type="button" class="pxBtn" data-fim="nao">' + escH(T_('Desistir')) + '</button><button type="button" class="pxBtn pxPrim" data-fim="sim"' + (muda() ? '' : ' disabled') + '>' + escH(p ? Tf_('Cortar · {0} fakes', p) : T_('Cortar · grátis')) + '</button></div>';
          const dep = el.querySelector('.bCorpo'); if (dep) dep.scrollTop = sc;
        };
        render(false);
        el.onclick = (e) => {
          const bt = e.target.closest('button'); if (!bt || bt.disabled) return;
          if (typeof Som !== 'undefined' && Som.clique) Som.clique();
          if (bt.dataset.modo) { modo = bt.dataset.modo; aba = 'padrao'; msg = modo === 'barba' ? T_('Toque numa barba para ver como fica.') : T_('Toque num corte para ver como fica.'); render(false); return; }
          if (bt.dataset.aba) { aba = bt.dataset.aba; render(false); return; }
          if (bt.dataset.fim === 'nao') { el.onclick = null; fim(null); return; }
          if (bt.dataset.fim === 'sim') {
            const p = custo('cabelo') + custo('barba'), d = s.dados;
            if (p > 0 && !d.devInfinito && d.fakes < p) { msg = Tf_('Faltam {0} fakes para esse visual.', p - d.fakes); render(true); return; }
            el.onclick = null; fim({ cabelo: sel.cabelo, barba: sel.barba }); return;
          }
          if (bt.dataset.i != null) {
            const i = Number(bt.dataset.i), c = lista().find((x) => x.i === i) || null; if (!c) return;
            sel[modo] = c; vestirLook({ [modo]: c.i });
            msg = c.i === antes[modo] ? T_(modo === 'barba' ? 'Essa é a sua barba agora.' : 'Esse é o seu corte agora.') : '';
            render(true);
          }
        };
      });
    }

    // ---------------------------------------------------------------- A CENA DO CORTE (3 partes)
    //   1) do lado · pisca · 2) atrás · pisca (o visual novo entra aqui) · 3) o Toninho na frente da câmera, corta e sai da frente
    async function cenaDoCorte(antes, depois, aviso) {
      const s = S(), J = s.jog, A = M.T, B = M.B, C = B.cadeira, ap = aparencia();
      const pisca = async (ms, entre) => { await api.preto(true, ms); entre(); await api.preto(false, ms); };
      const soBarba = depois.cabelo === antes.cabelo;
      M.cab = { x: C.x, y: soBarba ? 1.18 : 1.3, z: C.z }; M.corFio = (soBarba ? (ap.corBarba || ap.cabelo) : ap.cabelo) || '#1C140F';
      // de volta o visual de antes e a cadeira para o espelho; 1ª parte: do lado
      await pisca(260, () => {
        vestirLook(antes); girarCadeira(Math.PI / 2); J.yaw = J.yawAlvo = Math.PI / 2;
        A.tipo = 'cena'; A.x = C.x + 0.94; A.z = C.z - 0.05; A.yaw = A.yawAlvo = Math.PI;      // do lado leste, virado para ele
        api.camCena({ px: C.x - 1.65, py: 1.68, pz: C.z - 1.25, tx: C.x + 0.3, ty: 1.32, tz: C.z + 0.05 });   // de frente e de lado: o rosto dele e o Toninho atrás, à direita
        M.cortando = 1; M.tCorte = 0; mostrarFerramentas(true);
      });
      maquina(2.2); await api.esperar(2400);
      // 2ª parte: atrás (por cima do encosto)
      await pisca(130, () => {
        A.x = C.x + 0.05; A.z = C.z + 0.9; A.yaw = A.yawAlvo = Math.PI / 2;                    // atrás, virado para a nuca
        api.camCena({ px: C.x + 1.9, py: 1.85, pz: C.z + 1.55, tx: C.x - 0.05, ty: 1.3, tz: C.z + 0.35 });
        M.cortando = 2;
      });
      tesoura(); await api.esperar(600); tesoura(); await api.esperar(550); tesoura(); await api.esperar(650); tesoura(); await api.esperar(500);
      // 3ª parte: o visual novo já está nele; a cadeira vira para a sala e o Toninho fica NA FRENTE da câmera
      await pisca(130, () => {
        vestirLook(depois); girarCadeira(-Math.PI / 2); J.yaw = J.yawAlvo = -Math.PI / 2;
        A.x = C.x + 0.02; A.z = C.z + 0.95; A.yaw = A.yawAlvo = Math.PI / 2;                   // de costas para a câmera, tapando o rosto
        api.camCena({ px: C.x + 0.12, py: 1.62, pz: C.z + 2.85, tx: C.x + 0.05, ty: 1.4, tz: C.z });
        M.cortando = 3; for (const f of M.fios) if (f.m.parent) f.m.parent.remove(f.m); M.fios = [];
      });
      for (let k = 0; k < 5; k++) { tesoura(); await api.esperar(380); }
      // ele sai da frente (andando) e para do lado, olhando o resultado
      M.cortando = 0; mostrarFerramentas(false);
      await Promise.race([api.andar(A, [[C.x + 0.75, C.z + 1.05], [C.x + 1.05, C.z + 0.55]], 1.6), api.esperar(1600)]);
      A.rota = null; A.andando = false; A.yawAlvo = Math.atan2(-(J.z - A.z), J.x - A.x);
      if (typeof Som !== 'undefined' && Som.clique) Som.clique();
      if (aviso) api.aviso(aviso);
      await api.esperar(900);
      await api.fala('toninho', T_('Pronto! Ficou na régua.'));
      await api.fala('toninho', T_(fem() ? 'Olha esse espelho. Tá outra pessoa!' : 'Olha esse espelho, chefe. Tá outro homem!'));
      await api.fala('jog', T_(pk(['Ficou brabo!', 'Caramba, ficou muito bom!'])));
      Dialogo.esconder(); api.aviso('');
      for (const f of M.fios) if (f.m.parent) f.m.parent.remove(f.m); M.fios = [];
      await levantar();
    }
    function mostrarFerramentas(v) { if (M.tesoura) M.tesoura.visible = v; if (M.pente) M.pente.visible = v; }

    // ---------------------------------------------------------------- a cada quadro: os braços do Toninho cortando e o cabelo caindo
    //   O boneco olha para +x: levantar o braço para a FRENTE é girar em z (positivo); o cotovelo dobra o antebraço para cima (az).
    function tick(dt) {
      if (!dentro()) return;
      const A = M.T; if (!A || !A.m) return;
      if (M.cortando) {
        M.tCorte = (M.tCorte || 0) + dt; const t = M.tCorte, m = A.m, alto = M.cortando === 2 ? 0.12 : 0.1;
        m.bracoD.rotation.z = 1.05 + alto + Math.sin(t * 2.2) * 0.08; m.bracoD.rotation.x = -0.18;                         // a tesoura na altura da cabeça
        m.bracoE.rotation.z = 0.95 + alto + Math.sin(t * 1.7 + 1) * 0.06; m.bracoE.rotation.x = 0.22;                      // o pente segurando a mecha
        if (typeof usarCotovelo === 'function') { usarCotovelo(m.bracoD, 0.12, 0.75 + Math.abs(Math.sin(t * 11)) * 0.12); usarCotovelo(m.bracoE, -0.12, 0.7); }
        if (M.tesoura) M.tesoura.rotation.x = Math.sin(t * 22) * 0.12;   // abre e fecha
        M.tTes -= dt;
        if (M.tTes <= 0 && M.fios.length < 70) {                          // um fio de cabelo caindo da cabeça
          M.tTes = 0.06;
          const g = new THREE.Mesh(M.geoFio || (M.geoFio = api.guardar(new THREE.BoxGeometry(0.035, 0.012, 0.012))), M.matFio || (M.matFio = api.guardar(new THREE.MeshLambertMaterial({ color: M.corFio }))));
          M.matFio.color.set(M.corFio);
          g.position.set(M.cab.x + (Math.random() - 0.5) * 0.36, M.cab.y + 0.1 + Math.random() * 0.12, M.cab.z + (Math.random() - 0.5) * 0.36); g.rotation.set(Math.random() * 3, Math.random() * 3, 0);
          S().grupo.add(g); M.fios.push({ m: g, vy: -0.2 - Math.random() * 0.4, vx: (Math.random() - 0.5) * 0.3, vz: (Math.random() - 0.5) * 0.3 });
        }
      }
      for (const f of M.fios) {
        if (f.m.position.y <= 0.012) continue;
        f.vy -= 2.5 * dt; f.m.position.x += f.vx * dt; f.m.position.z += f.vz * dt; f.m.position.y = Math.max(0.006, f.m.position.y + f.vy * dt); f.m.rotation.z += dt * 4;
        const dx = f.m.position.x - M.cab.x, dz = f.m.position.z - M.cab.z;                       // não atravessa o corpo: escorrega por fora dos ombros
        if (f.m.position.y < 1.15 && f.m.position.y > 0.3 && Math.hypot(dx, dz) < 0.34) { const k = 0.34 / (Math.hypot(dx, dz) || 1); f.m.position.x = M.cab.x + dx * k; f.m.position.z = M.cab.z + dz * k; }
      }
    }

    return { entrou, saiu, alvos, tick, aberto, CORTES_ESPECIAIS, BARBAS_ESPECIAIS, PRECO_PADRAO, _M: M, _fns: { falarComToninho, cenaDoCorte, painel, vestirLook, sentarParaEscolher, levantar, Musica, TIPOS } };
  }

  window.FutebolJS.registrarFase({ id: 'barbearia', nome: 'Barbearia', nucleoMinimo: '6.6.12', iniciar: async () => {}, criar });
})();
