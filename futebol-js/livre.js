/* ==============================================================================================================================
   livre.js — A PARTIDA LIVRE (7.4.1): o menu "Jogar → Partida livre" inteiro.
   - Registrado com FutebolJS.registrarFase({ id: 'livre' }) só para o jogo saber baixar o arquivo; o menu inicial (jogo.js) chama
     Fases.carregar('livre').then((m) => m.abrir()).
   - Os tipos:
       Campeonato ... o Brasileirão A ou o Brasileirão B (Brasil) ou (7.5.2) a Liga Espanhola ou a Liga Inglesa (20 times cada), rápido
                      (19 rodadas, só turno) ou padrão (38, turno e returno). A tabela, as
                      rodadas simuladas dos outros jogos, artilharia, cartões e suspensões (3 amarelos ou 1 vermelho = 1 jogo fora,
                      como na vida real), lesões, a festa do título e a noite dos prêmios individuais. Fica salvo no aparelho.
       Copa ......... a Copa do Brasil: 32 times (os 20 da A e os 12 mais fortes da B, o seu sempre entra), mata-mata em jogo único
                      (empate = pênaltis), a final num estádio grande neutro. Também fica salva.
       Amistoso ..... qualquer time da A, da B, da Espanha ou da Inglaterra contra qualquer outro, no estádio que você quiser.
       Várzea ....... os 10 times do Campeonato de Várzea, no campo de terra da cidadezinha.
       Sintético .... os clubes do Brasil, da Espanha e da Inglaterra no society (6 x 6).
       Futsal ....... os clubes do Brasil, da Espanha e da Inglaterra na quadra (6 x 6).
   - Antes de cada jogo: a tela do CONFRONTO (os dois jogadores se encarando, com os técnicos atrás), os times, as escalações e os
     desfalques; em CONFIGURAÇÕES escolhe horário, clima, duração, estádio (só no amistoso), dificuldade, posição, personagem e a
     abertura (a cena de entrada: o estádio por fora, o ônibus chegando e os jogadores descendo, o vestiário, a torcida e a entrada
     dos times em campo).
   - Estádios: em casa no estádio do clube (estadiosA.js; quem não tem estádio próprio joga num do interior); fora, no do outro; as
     finais num estádio GRANDE (o Anel, a Fachada ou a Concha) — se o dono dele estiver na final, vai para outro.
   - Os dados: futebolJs.livre.v1 = { camp, copa } (um campeonato e uma copa salvos) e futebolJs.livreCfg.v1 (as configurações).
   ============================================================================================================================== */
(() => {
  'use strict';
  const CHAVE = 'futebolJs.livre.v1', CHAVE_CFG = 'futebolJs.livreCfg.v1';
  const escH = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const clampN = (v, a, b) => Math.max(a, Math.min(b, v));
  const r1 = (v) => Math.round(v * 10) / 10;
  const embaralha = (l) => { for (let i = l.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [l[i], l[j]] = [l[j], l[i]]; } return l; };
  const ler = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  const gravar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { console.warn('[Livre] não gravou:', e); } };
  const esperar = (ms) => new Promise((ok) => setTimeout(ok, ms));
  const clique = () => { try { if (Som.clique) Som.clique(); } catch (e) { /* sem som */ } };
  const fem = () => typeof PERSONAGEM !== 'undefined' && PERSONAGEM.genero === 'F';

  let SBD = null, VZD = null, jogouNaSessao = false;
  const TD = (k) => (SBD && SBD.TIME_DE[k]) || null;
  const TV = (k) => (VZD ? VZD.TIMES_VZ.find((t) => t.k === k) : null);
  const ehVz = (k) => !TD(k) && !!TV(k);
  const nomeT = (k) => (TD(k) || TV(k) || { nome: k }).nome;
  const siglaT = (k) => (TD(k) || TV(k) || { sigla: '?' }).sigla;
  const urlT = (k) => { try { return ehVz(k) ? VZD.urlArte(k) : SBD.urlArte(k); } catch (e) { return ''; } };
  const estrelasT = (k) => { const t = TD(k); if (t) return t.estrelas || 3; const v = TV(k); return v ? VZD.estrelas(v) : 3; };
  const forcaT = (k) => { const t = TD(k); if (t) return SBD.forcaTime(t); const v = TV(k); return v ? VZD.forcaTime(v) : { media: 6, gk: 6, def: 6, mid: 6, fwd: 6 }; };
  const elencoT = (k) => { const t = TD(k); if (t) return t.pequeno ? [] : SBD.elencoB(t); const v = TV(k); return v ? VZD.elencoVz(v) : []; };
  const divT = (k) => (TD(k) ? TD(k).div0 || (SBD.TIMES_A.includes(TD(k)) ? 'A' : 'B') : 'VZ');
  // (7.5.2) as ligas: 'A' e 'B' (Brasil), 'ES' (Espanha) e 'EN' (Inglaterra)
  const LISTA_DIV = { A: 'TIMES_A', B: 'TIMES_B', ES: 'TIMES_ES', EN: 'TIMES_EN' };
  const timesDiv = (div) => (LISTA_DIV[div] ? SBD[LISTA_DIV[div]] || [] : VZD ? VZD.TIMES_VZ : []).map((t) => t.k);
  const NOME_DIV = { A: 'Brasileirão A', B: 'Brasileirão B', ES: 'Liga Espanhola', EN: 'Liga Inglesa' };
  const nomeDiv = (div) => NOME_DIV[div] || 'Brasileirão A';
  const europa = (div) => div === 'ES' || div === 'EN';

  // ============================================================================================ A TELA (pixel art, como o menu)
  let raiz = null, cssFeito = false;
  function css() {
    if (cssFeito) return; cssFeito = true;
    const st = document.createElement('style');
    st.textContent = `
#livre { position: fixed; inset: 0; z-index: 20; overflow-y: auto; touch-action: pan-y; -webkit-overflow-scrolling: touch; box-sizing: border-box;
  padding: calc(10px + env(safe-area-inset-top, 0px)) max(14px, env(safe-area-inset-right, 0px)) calc(14px + env(safe-area-inset-bottom, 0px)) max(14px, env(safe-area-inset-left, 0px));
  --mx-ink: #2a1206; --mx-creme: #fff0c8; --mx-laranja: #f0a020; color: var(--mx-creme); font-family: var(--font-body);
  background-color: #150d06; background-image: radial-gradient(ellipse 70% 55% at 50% 30%, rgba(240,160,32,.16), rgba(240,160,32,0) 70%),
    repeating-linear-gradient(90deg, rgba(63,157,42,.14) 0 80px, rgba(63,157,42,0) 80px 160px), repeating-conic-gradient(rgba(0,0,0,.24) 0 25%, rgba(0,0,0,0) 0 50%);
  background-size: auto, auto, 8px 8px; }
#livre[hidden] { display: none; }
#livre .lvCaixa { --p: var(--p3, 3px); box-sizing: border-box; width: min(980px, 100%); margin: 0 auto; padding: 4px 6px 8px;
  border: solid transparent; border-width: calc(var(--p) * 7); border-image: var(--sp-escuro) 7 fill / calc(var(--p) * 7) stretch; image-rendering: pixelated; }
#livre .lvTopo { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin: 0 0 10px; }
#livre .lvTit { margin-right: auto; font: 700 clamp(15px, 2.6vw, 20px)/1.1 var(--font-display); letter-spacing: .1em; color: var(--mx-laranja); text-shadow: 0 2px 0 var(--mx-ink); }
#livre .lvSub { font: 600 12px/1.3 var(--font-body); opacity: .85; margin: -4px 0 10px; }
#livre .pxBtn { --p: var(--p3, 3px); height: auto; min-height: 44px; padding: 4px 10px; font-size: 13px; }
#livre .pxBtn.pxPrim { font-size: 16px; min-height: 52px; }
#livre .lvTopo .pxBtn { width: auto; min-width: 96px; min-height: 38px; font-size: 12px; }
#livre .lvGrade { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 210px), 1fr)); gap: 10px; }
#livre .lvTipo { flex-direction: column; gap: 4px; min-height: 92px; text-transform: none; letter-spacing: .03em; }
#livre .lvTipo b { font: 700 16px/1 var(--font-display); letter-spacing: .1em; text-transform: uppercase; }
#livre .lvTipo small { font: 600 11px/1.25 var(--font-body); opacity: .85; text-shadow: none; }
#livre .lvTipo .lvSelo { position: absolute; top: -8px; right: 6px; z-index: 1; box-shadow: 0 2px 0 rgba(0,0,0,.45); background: #3f9d2a; color: #fff; font: 700 9px/1 var(--font-display); padding: 3px 4px; letter-spacing: .06em; }
#livre .lvTimes { display: grid; grid-template-columns: repeat(auto-fill, minmax(118px, 1fr)); gap: 8px; }
#livre .lvTime { flex-direction: column; gap: 3px; min-height: 104px; text-transform: none; letter-spacing: .02em; font-size: 11px; }
#livre .lvTime img { width: 44px; height: 44px; image-rendering: pixelated; }
#livre .lvTime b { font: 700 11px/1.15 var(--font-body); text-shadow: 0 1px 0 var(--mx-ink); }
#livre .lvTime .est, #livre .est { color: #ffd23a; font-size: 11px; letter-spacing: 0; text-shadow: 0 1px 0 #000; }
#livre .lvTime.off { opacity: .35; pointer-events: none; }
#livre .lvAbas { display: flex; gap: 6px; margin: 0 0 10px; flex-wrap: wrap; }
#livre .lvAbas .pxBtn { width: auto; min-width: 110px; min-height: 36px; font-size: 12px; }
#livre .pxBtn.on { border-image-source: var(--sp-grama); }
#livre .lvCard { --p: var(--p2, 2px); box-sizing: border-box; padding: 6px 8px; margin: 0 0 10px; border: solid transparent; border-width: calc(var(--p) * 7);
  border-image: var(--sp-escuro) 7 fill / calc(var(--p) * 7) stretch; image-rendering: pixelated; }
#livre .lvCard h3 { margin: 0 0 6px; font: 700 13px/1.2 var(--font-display); letter-spacing: .08em; color: var(--mx-laranja); display: flex; align-items: center; gap: 6px; }
#livre .lvCard h3 img { width: 22px; height: 22px; image-rendering: pixelated; }
#livre .lvCard p { margin: 3px 0; font: 600 12.5px/1.35 var(--font-body); }
#livre .lvBtns { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
#livre .lvBtns .pxBtn { flex: 1 1 150px; width: auto; }
#livre table.lvTab { width: 100%; border-collapse: collapse; font: 600 12px/1.25 var(--font-body); }
#livre .lvTab th { font: 700 10px/1 var(--font-display); color: var(--mx-laranja); text-align: center; padding: 4px 2px; }
#livre .lvTab td { text-align: center; padding: 3px 2px; border-top: 1px solid rgba(255,240,200,.12); }
#livre .lvTab td.n { text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 0; width: 46%; }
#livre .lvTab td.n img { width: 18px; height: 18px; vertical-align: middle; image-rendering: pixelated; margin-right: 4px; }
#livre .lvTab tr.nos td { background: rgba(240,160,32,.22); }
#livre .lvTab tr.z1 td:first-child { box-shadow: inset 4px 0 0 #3f9d2a; }
#livre .lvTab tr.z2 td:first-child { box-shadow: inset 4px 0 0 #2a7ad6; }
#livre .lvTab tr.z3 td:first-child { box-shadow: inset 4px 0 0 #c8202e; }
#livre .lvLeg { font: 600 11px/1.3 var(--font-body); opacity: .85; margin-top: 6px; }
#livre .lvLeg i { display: inline-block; width: 10px; height: 10px; vertical-align: -1px; margin: 0 4px 0 10px; }
#livre .lvJogo { display: flex; align-items: center; justify-content: space-between; gap: 6px; padding: 4px 2px; border-top: 1px solid rgba(255,240,200,.12); font: 600 12px/1.2 var(--font-body); }
#livre .lvJogo.nos { background: rgba(240,160,32,.2); }
#livre .lvJogo span { flex: 1 1 0; display: flex; align-items: center; gap: 4px; min-width: 0; }
#livre .lvJogo span:last-child { justify-content: flex-end; text-align: right; }
#livre .lvJogo img { width: 20px; height: 20px; image-rendering: pixelated; }
#livre .lvJogo b { flex: 0 0 auto; min-width: 54px; text-align: center; font-family: var(--font-display); }
#livre .lvVs { display: flex; align-items: center; justify-content: center; gap: clamp(10px, 4vw, 40px); margin: 6px 0; }
#livre .lvVs div { display: flex; flex-direction: column; align-items: center; gap: 4px; text-align: center; max-width: 40%; }
#livre .lvVs img { width: 64px; height: 64px; image-rendering: pixelated; }
#livre .lvVs .x { font: 700 26px/1 var(--font-display); color: var(--mx-laranja); }
#livre .lvTag { display: inline-block; padding: 2px 6px; font: 700 10px/1.2 var(--font-display); letter-spacing: .08em; background: #3f9d2a; color: #fff; }
#livre .lvTag.fora { background: #b5640c; } #livre .lvTag.neutro { background: #5d6472; } #livre .lvTag.mal { background: #c8202e; }
#livre .lvOpc { display: grid; gap: 10px; grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr)); }
#livre .lvOpc .lvCard { margin: 0; }
#livre .lvChips { display: flex; flex-wrap: wrap; gap: 6px; }
#livre .lvChips.lvMuitos { max-height: 132px; overflow-y: auto; padding-right: 4px; }
#livre .lvChips.lvMuitos .pxBtn { font-size: 11px; padding: 4px 7px; }
#livre .lvChips .pxBtn { width: auto; min-width: 0; min-height: 34px; font-size: 11.5px; padding: 2px 8px; letter-spacing: .04em; text-transform: none; flex: 0 0 auto; }
#livre .lvMsg { font: 600 13px/1.4 var(--font-body); margin: 4px 0 10px; }
#livre .lvLista { margin: 0; padding: 0; list-style: none; font: 600 12px/1.35 var(--font-body); }
#livre .lvLista li { display: flex; justify-content: space-between; gap: 8px; padding: 3px 0; border-top: 1px solid rgba(255,240,200,.12); }
#livre .lvLista li.nos { color: var(--mx-laranja); }
/* o confronto (a encarada) */
#livre .lvPalco { position: relative; height: clamp(190px, 44vh, 360px); margin: 0 0 8px; overflow: hidden; background: linear-gradient(90deg, var(--c1), #120c06 50%, var(--c2)); }
#livre .lvPalco canvas { position: absolute; inset: 0; width: 100%; height: 100%; }
#livre .lvPalco .lado { position: absolute; top: 8px; display: flex; flex-direction: column; align-items: center; gap: 3px; width: 30%; text-align: center; z-index: 1; text-shadow: 0 2px 0 #000; }
#livre .lvPalco .lado.a { left: 6px; } #livre .lvPalco .lado.b { right: 6px; }
#livre .lvPalco .lado img { width: clamp(40px, 9vh, 64px); height: auto; image-rendering: pixelated; }
#livre .lvPalco .lado b { font: 700 clamp(11px, 2.2vh, 15px)/1.15 var(--font-display); letter-spacing: .05em; }
#livre .lvPausa { border-color: var(--mx-laranja); margin-bottom: 10px; }
#livre .lvPausa h3 { justify-content: center; font-size: 15px; }
#livre .lvKits { display: flex; gap: 6px; margin-top: 4px; }
#livre .lvKit { position: relative; width: 40px; height: 40px; padding: 2px; display: grid; place-items: center; background: rgba(0,0,0,.45); border: 2px solid rgba(255,255,255,.35); cursor: pointer; }
#livre .lvKit.on { border-color: var(--mx-laranja); background: rgba(247,148,29,.25); box-shadow: 0 0 0 2px #000; }
#livre .lvKit small { position: absolute; right: 1px; bottom: 0; font: 700 9px/1 var(--font-display); color: #fff; text-shadow: 0 1px 0 #000; }
#livre .lvPalco .xx { position: absolute; left: 50%; bottom: 8px; transform: translateX(-50%); font: 700 clamp(16px, 4vh, 26px)/1 var(--font-display); color: #fff; text-shadow: 0 3px 0 #000; z-index: 1; white-space: nowrap; }
#livre .lvBarra { display: grid; grid-template-columns: 62px 1fr 32px; gap: 6px; align-items: center; font: 600 11px/1 var(--font-body); margin: 3px 0; }
#livre .lvBarra i { display: block; height: 8px; background: rgba(255,255,255,.12); }
#livre .lvBarra b { display: block; height: 100%; background: #3f9d2a; }
#livre .lvBarra b.alto { background: #f0a020; } #livre .lvBarra b.baixo { background: #c8202e; }
#livre .lvCampo { position: relative; height: 180px; background: repeating-linear-gradient(90deg, #2b7a33 0 10%, #2f8538 10% 20%); border: 2px solid rgba(255,255,255,.4); }
#livre .lvJ { position: absolute; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; font: 600 9px/1.05 var(--font-body); max-width: 66px; text-align: center; text-shadow: 0 1px 0 #000; }
#livre .lvJ i { width: 12px; height: 12px; border-radius: 50%; background: var(--c); border: 2px solid #fff; }
#livre .lvJ em { font-style: normal; color: #ffd23a; }
#livre .lvJ.voce i { border-color: #f0a020; box-shadow: 0 0 0 2px #f0a020; } #livre .lvJ.fora i { opacity: .3; }
#livre .lvTicker { text-align: center; }
#livre .lvTicker .pl { font: 700 40px/1 var(--font-display); margin: 8px 0; }
#livre .lvMed { display: block; font: 600 10px/1.2 var(--font-body); opacity: .8; text-shadow: none; letter-spacing: .02em; }
#lvPreto { position: fixed; inset: 0; z-index: 45; background: #000; opacity: 0; pointer-events: none; transition: opacity .4s linear; }
#lvPreto.on { opacity: 1; pointer-events: auto; }
#lvPular { position: fixed; z-index: 46; right: max(14px, env(safe-area-inset-right, 0px)); bottom: calc(14px + env(safe-area-inset-bottom, 0px)); width: auto !important; min-width: 110px; --p: var(--p2, 2px) !important; min-height: 40px !important; font-size: 12px !important; }
#lvLegenda { position: fixed; z-index: 44; left: 50%; bottom: calc(22px + env(safe-area-inset-bottom, 0px)); transform: translateX(-50%); max-width: calc(100% - 160px); text-align: center;
  font: 700 clamp(12px, 2.6vh, 17px)/1.25 var(--font-display); letter-spacing: .08em; color: #fff; text-shadow: 0 2px 0 #000, 0 0 6px #000; pointer-events: none; }
@media (max-height: 460px) { #livre .lvPalco { height: 56vh; } #livre .lvTime { min-height: 88px; } #livre .lvTipo { min-height: 72px; } }
@media (orientation: portrait) { #livre .lvCampo { height: 150px; } }`;
    document.head.appendChild(st);
  }
  function tela(html) {
    css();
    if (!raiz) { raiz = document.createElement('div'); raiz.id = 'livre'; (document.getElementById('raizJogo') || document.body).appendChild(raiz); }
    raiz.hidden = false; raiz.innerHTML = html; raiz.scrollTop = 0;
    return raiz;
  }
  function esconder() { if (raiz) { raiz.hidden = true; raiz.innerHTML = ''; } }
  // espera um toque num [data-a] (ou [data-k]) da tela: devolve { a, k, el }
  function escolha(el, filtro) {
    return new Promise((ok) => {
      const f = (e) => {
        const b = e.target.closest('[data-a],[data-k]'); if (!b || b.disabled || !el.contains(b)) return;
        if (filtro && !filtro(b)) return;
        clique(); el.removeEventListener('click', f); ok({ a: b.dataset.a || '', k: b.dataset.k || '', el: b });
      };
      el.addEventListener('click', f);
    });
  }
  const topo = (titulo, voltar) => '<div class="lvTopo"><div class="lvTit">' + escH(titulo) + '</div>' + (voltar !== false ? '<button type="button" class="pxBtn" data-a="voltar">' + escH(T('Voltar')) + '</button>' : '') + '</div>';
  async function confirmar(titulo, msg, sim, nao) {
    const el = tela('<div class="lvCaixa">' + topo(titulo, false) + '<p class="lvMsg">' + escH(msg) + '</p><div class="lvBtns"><button type="button" class="pxBtn pxPrim" data-a="sim">' + escH(sim) + '</button><button type="button" class="pxBtn" data-a="nao">' + escH(nao) + '</button></div></div>');
    return (await escolha(el)).a === 'sim';
  }
  // a tela preta (fade) e o botão "Pular"
  let pretoEl = null;
  function preto(on, ms) {
    if (!pretoEl) { css(); pretoEl = document.createElement('div'); pretoEl.id = 'lvPreto'; document.body.appendChild(pretoEl); }
    ms = ms == null ? 400 : ms; pretoEl.style.transitionDuration = ms + 'ms';
    void pretoEl.offsetWidth; pretoEl.classList.toggle('on', !!on);
    return esperar(ms + 30);
  }

  // ============================================================================================ AS CONFIGURAÇÕES DA PARTIDA
  const CFG0 = { horario: 'auto', clima: 'seco', dur: 300, dif: 'normal', pos: 'FWD', pers: '', abertura: 'completa', bola: '', celeb1: 'aviao', celeb2: 'joelhada', controle: 'um' };   // (7.4.13) controle: 'um' | 'time'
  const cfgSalva = () => Object.assign({}, CFG0, ler(CHAVE_CFG, {}));
  const OPC = {
    horario: [['auto', 'Automático'], ['dia', 'Dia'], ['tarde', 'Tarde'], ['noite', 'Noite']],
    clima: [['seco', 'Seco'], ['chuva', 'Chuva'], ['neve', 'Neve'], ['sorteio', 'Sorteado']],
    dur: [[180, '3 min'], [300, '5 min'], [480, '8 min'], [600, '10 min']],
    dif: [['muito_facil', 'Muito fácil'], ['facil', 'Fácil'], ['normal', 'Normal'], ['dificil', 'Difícil'], ['muito_dificil', 'Muito difícil']],
    pos: [['FWD', 'Atacante'], ['MID', 'Meia'], ['DEF', 'Zagueiro']],
    abertura: [['completa', 'Completa'], ['curta', 'Curta'], ['nenhuma', 'Sem abertura']],
    controle: [['um', 'Um jogador'], ['time', 'Time inteiro']],
  };
  const NOME_OPC = { controle: 'Controle', horario: 'Horário', clima: 'Clima', dur: 'Duração', estadio: 'Estádio', dif: 'Dificuldade', pos: 'Sua posição', pers: 'Personagem', abertura: 'Abertura', bola: 'Bola', celeb1: 'Comemoração 1', celeb2: 'Comemoração 2' };
  const DICA_OPC = { controle: 'Um jogador: só você (na posição escolhida). Time inteiro: você controla quem está com a bola ou mais perto dela (o goleiro joga sozinho).', celeb1: 'As duas comemorações do gol (os dois botões que aparecem depois de marcar).', bola: 'A bola da partida (as bolas premium da loja também).', horario: 'Automático: o horário do jogo (o campeonato varia entre dia, tarde e noite).', abertura: 'A cena antes do jogo: o estádio, o ônibus, o vestiário, a torcida e a entrada em campo.', estadio: 'Só no amistoso: nos campeonatos o jogo é no estádio do mandante.' };
  // (7.4.10) as bolas (a padrão e as 15 premium do cosmeticos.js) e as comemorações (todas as do jogo)
  function bolasLista() {
    const L = (window.FutebolCosmeticos && FutebolCosmeticos.dados && FutebolCosmeticos.dados.bolas) || [];
    return [['', 'Bola padrão']].concat(L.map((b) => [b.nome, b.nome]));
  }
  function celebsLista() {
    return typeof CELEBRACOES === 'undefined' ? [] : Object.keys(CELEBRACOES).map((k) => [k, CELEBRACOES[k].nome]);
  }
  function estadiosLista() {
    const EA = window.EstadiosA, L = EA ? EA.modelos().map((k) => [k, EA.nome(k)]) : [];
    return [['casa', 'Do time da casa']].concat(L);
  }
  function telaConfig(op) {
    const c = Object.assign({}, op.cfg);
    const linha = (k, lista) => '<div class="lvCard"><h3>' + escH(T(NOME_OPC[k])) + '</h3><div class="lvChips' + (lista.length > 12 ? ' lvMuitos' : '') + '">' + lista.map(([v, n]) => '<button type="button" class="pxBtn' + (String(c[k]) === String(v) ? ' on' : '') + '" data-k="' + k + '" data-v="' + escH(v) + '">' + escH(k === 'estadio' && v !== 'casa' ? n : T(n)) + '</button>').join('') + '</div>' + (DICA_OPC[k] ? '<p style="opacity:.75;font-size:11px">' + escH(T(DICA_OPC[k])) + '</p>' : '') + '</div>';
    const pers = [['', 'Nenhum (você)']].concat((typeof personagensSalvos === 'function' ? personagensSalvos() : []).map((x) => [x.slot, x.nome]));
    const el = tela('<div class="lvCaixa">' + topo(T('Configurações da partida')) + '<div class="lvOpc">' +
      linha('controle', OPC.controle) + linha('horario', OPC.horario) + linha('clima', OPC.clima) + linha('dur', OPC.dur) + (op.estadio ? linha('estadio', estadiosLista()) : '') +
      linha('dif', OPC.dif) + linha('pos', OPC.pos) + linha('pers', pers) + linha('abertura', OPC.abertura) +
      linha('bola', bolasLista()) + linha('celeb1', celebsLista()) + linha('celeb2', celebsLista()) + '</div>' +
      '<div class="lvBtns"><button type="button" class="pxBtn pxPrim" data-a="ok">' + escH(T('Pronto')) + '</button></div></div>');
    return new Promise((ok) => {
      el.onclick = (e) => {
        const b = e.target.closest('[data-a],[data-k]'); if (!b) return;
        clique();
        if (b.dataset.k) { const k = b.dataset.k, v = b.dataset.v; c[k] = k === 'dur' ? Number(v) : v; for (const x of el.querySelectorAll('[data-k="' + k + '"]')) x.classList.toggle('on', x === b); return; }
        el.onclick = null;
        if (b.dataset.a === 'ok') { const s = Object.assign({}, c); delete s.estadio; gravar(CHAVE_CFG, Object.assign(cfgSalva(), s)); ok(c); } else ok(null);
      };
    });
  }

  // ============================================================================================ ESCOLHER O TIME
  //   grupos: [{ id, nome, times: [k] }]; tira = [k] (os que não podem: o próprio time na escolha do adversário)
  function cartaoTime(k, off) {
    return '<button type="button" class="pxBtn lvTime' + (off ? ' off' : '') + '" data-k="' + escH(k) + '"><img src="' + urlT(k) + '" alt=""><b>' + escH(nomeT(k)) + '</b><span class="est">' + '★★★★★☆☆☆☆☆'.slice(5 - estrelasT(k), 10 - estrelasT(k)) + '</span><small class="lvMed">' + escH(Tf('média {0}', Math.round(forcaT(k).media * 10))) + '</small></button>';
  }
  async function escolherTime(titulo, grupos, tira, sub) {
    let g = 0;
    for (;;) {
      const G0 = grupos[g];
      const el = tela('<div class="lvCaixa">' + topo(titulo) + (sub ? '<p class="lvSub">' + escH(sub) + '</p>' : '') +
        (grupos.length > 1 ? '<div class="lvAbas">' + grupos.map((x, i) => '<button type="button" class="pxBtn' + (i === g ? ' on' : '') + '" data-a="aba' + i + '">' + escH(T(x.nome)) + '</button>').join('') + '</div>' : '') +
        '<div class="lvTimes">' + G0.times.map((k) => cartaoTime(k, tira && tira.includes(k))).join('') + '</div></div>');
      const r = await escolha(el);
      if (r.a === 'voltar') return null;
      if (r.a.startsWith('aba')) { g = Number(r.a.slice(3)); continue; }
      if (r.k) return r.k;
    }
  }
  const GRUPOS_BR = () => [{ nome: 'Brasileirão A', times: timesDiv('A') }, { nome: 'Brasileirão B', times: timesDiv('B') }];
  // (7.5.2) amistoso, sintético e futsal: o Brasil e as ligas da Europa
  const GRUPOS_TODOS = () => GRUPOS_BR().concat([{ nome: 'Liga Espanhola', times: timesDiv('ES') }, { nome: 'Liga Inglesa', times: timesDiv('EN') }]);

  // ============================================================================================ OS JOGADORES, AS FICHAS E OS DESFALQUES
  //   S.fichas[k][nome] = { am: amarelos, su: jogos de suspensão, le: jogos de lesão }  (nome do jogador; o seu é '__voce')
  //   S.est['k|nome'] = [gols, assistências, jogos, soma das notas]
  const VOCE = '__voce';
  const ficha = (S, k, n) => { const F = (S.fichas = S.fichas || {}), t = (F[k] = F[k] || {}); return (t[n] = t[n] || { am: 0, su: 0, le: 0 }); };
  const foraDe = (S, k) => { const F = S && S.fichas && S.fichas[k]; if (!F) return []; return Object.entries(F).filter(([, f]) => f.su > 0 || f.le > 0).map(([n, f]) => ({ n, su: f.su, le: f.le })); };
  const motivoTxt = (x) => { const f = x.n === VOCE && fem(); return x.su > 0 ? (x.su > 1 ? Tf(f ? 'suspensa ({0} jogos)' : 'suspenso ({0} jogos)', x.su) : T(f ? 'suspensa' : 'suspenso')) : Tf(f ? 'lesionada ({0} jogo(s))' : 'lesionado ({0} jogo(s))', x.le); };
  // depois do jogo de um time: quem estava fora cumpriu 1 jogo; os cartões e as lesões novas valem a partir do próximo
  function fecharFichas(S, k, cartoes) {
    for (const x of foraDe(S, k)) { const f = ficha(S, k, x.n); if (f.su > 0) f.su--; if (f.le > 0) f.le--; }   // a suspensão e a lesão correm juntas (cada jogo do time conta para as duas)
    for (const c of cartoes) {
      const f = ficha(S, k, c.n);
      if (c.vermelho) f.su += 1;
      else if (c.amarelo) { f.am += 1; if (f.am >= 3) { f.am = 0; f.su += 1; } }
      if (c.lesao > 0) f.le = Math.max(f.le, c.lesao);
    }
  }
  // os cartões e as lesões de um jogo simulado (11 titulares de cada lado)
  const P_AM = { GK: 0.03, DEF: 0.15, MID: 0.12, FWD: 0.08 };
  function cartoesSimulados(S, k) {
    const out = [];
    for (const j of titularesDe(S, k)) {
      const r = Math.random();
      if (r < 0.012) out.push({ n: j.nome, vermelho: true });
      else if (r < 0.012 + (P_AM[j.pos] || 0.1)) out.push({ n: j.nome, amarelo: true });
      if (Math.random() < 0.012) out.push({ n: j.nome, lesao: 1 + Math.floor(Math.random() * 3) });
    }
    return out;
  }
  // os 11 que jogam (sem os desfalques): o reserva da mesma posição entra no lugar
  function titularesDe(S, k) {
    const E = elencoT(k), fora = new Set(foraDe(S, k).map((x) => x.n)), T11 = E.slice(0, 11), banco = E.slice(11).filter((j) => !fora.has(j.nome));
    return T11.map((j) => { if (!fora.has(j.nome)) return j; const i = banco.findIndex((b) => b.pos === j.pos); return i >= 0 ? banco.splice(i, 1)[0] : banco.shift() || j; });
  }
  // o time no formato do motor, sem os desfalques (o reserva da posição sobe) e com a vaga da posição do jogador aberta
  function motor(k, S, voce) {
    let tm;
    if (TD(k)) tm = SBD.timeMotor(TD(k), voce ? { voce } : undefined);
    else { tm = VZD.timeMotor(TV(k)); if (voce) { const i = tm.elenco.findIndex((j, n) => n < 11 && (j.pos || j.posicao) === voce); if (i >= 0) { const sai = tm.elenco.splice(i, 1)[0]; tm.elenco.splice(Math.min(10, tm.elenco.length), 0, sai); } } }
    tm.id = 'lv_' + k;                                                   // fora do histórico do jogo (as fichas daqui são as do campeonato)
    tm.popularidade = 0.25 + estrelasT(k) * 0.12;
    const fora = new Set(foraDe(S, k).map((x) => x.n));
    if (fora.size) {
      const E = tm.elenco, n = Math.min(11, E.length);
      for (let i = 0; i < n; i++) {
        if (!fora.has(E[i].nome)) continue;
        let j = -1; for (let q = n; q < E.length; q++) if (!fora.has(E[q].nome) && E[q].pos === E[i].pos) { j = q; break; }
        if (j < 0) for (let q = n; q < E.length; q++) if (!fora.has(E[q].nome) && E[q].pos !== 'GK') { j = q; break; }
        if (j >= 0) { const t = E[i]; E[i] = E[j]; E[j] = t; }
      }
      tm.elenco = E.filter((j, i) => i < n || !fora.has(j.nome));
    }
    return tm;
  }

  // ============================================================================================ A SÚMULA (gols, assistências, notas)
  const PESO_GOL = { GK: 0.02, DEF: 0.7, MID: 2.2, FWD: 5 }, PESO_ASS = { GK: 0.1, DEF: 1, MID: 4, FWD: 2 };
  const sorteiaPeso = (L, peso) => { const tot = L.reduce((s, x) => s + peso(x), 0); let v = Math.random() * tot; for (const x of L) { v -= peso(x); if (v <= 0) return x; } return L[L.length - 1]; };
  function nota(x, g, a, res, sofr) {
    let n = 6 + res * 0.45 + g * 0.9 + a * 0.5 + ((x.media || 6) - 6) * 0.25 + (Math.random() + Math.random() + Math.random() - 1.5) * 0.7;
    if (x.pos === 'GK' || x.pos === 'DEF') n += sofr === 0 ? 0.7 : -0.18 * (sofr - 1);
    return r1(clampN(n, 3, 10));
  }
  function somaEst(S, k, n, g, a, nt) { const e = (S.est[k + '|' + n] = S.est[k + '|' + n] || [0, 0, 0, 0]); e[0] += g; e[1] += a; e[2] += 1; e[3] = r1(e[3] + nt); }
  // um jogo simulado: sorteia quem fez os gols e as assistências (pelo jeito de cada um) e dá as notas
  function sumulaSimulada(S, k, gols, sofr) {
    const L = titularesDe(S, k); if (!L.length) return;
    const G = new Map(), A = new Map();
    for (let i = 0; i < gols; i++) {
      const a = sorteiaPeso(L, (x) => PESO_GOL[x.pos] * Math.pow(((x.hab && x.hab.finalizacao) || 5) / 7, 2)); G.set(a, (G.get(a) | 0) + 1);
      if (Math.random() < 0.7) { const b = sorteiaPeso(L.filter((x) => x !== a), (x) => PESO_ASS[x.pos] * Math.pow(((x.hab && x.hab.passe) || 5) / 7, 2)); A.set(b, (A.get(b) | 0) + 1); }
    }
    const res = Math.sign(gols - sofr);
    for (const x of L) somaEst(S, k, x.nome, G.get(x) | 0, A.get(x) | 0, nota(x, G.get(x) | 0, A.get(x) | 0, res, sofr));
  }
  // o jogo que você jogou: os gols e as assistências da partida de verdade; a sua nota é a do jogo
  function sumulaJogada(S, ks, r, lado0) {
    const conta = [{}, {}];
    for (const x of r.golsLog || []) {
      if (x.autor) { const c = (conta[x.time][x.autor] = conta[x.time][x.autor] || { g: 0, a: 0 }); c.g++; }
      if (x.assist) { const c = (conta[x.time][x.assist] = conta[x.time][x.assist] || { g: 0, a: 0 }); c.a++; }
    }
    const [nos, eles] = r.placar;
    for (let t = 0; t < 2; t++) {
      const k = ks[t], E = elencoT(k), gols = t ? eles : nos, sofr = t ? nos : eles, res = Math.sign(gols - sofr);
      const nomes = (r.jogaram || []).filter((p) => p.time === t).map((p) => p.nome);
      for (const n of nomes) {
        const c = conta[t][n] || { g: 0, a: 0 }, j = E.find((x) => x.nome === n) || { pos: 'MID', media: 6.5 };
        somaEst(S, k, n, c.g, c.a, n === VOCE ? r1(clampN(r.nota || 6, 3, 10)) : nota(j, c.g, c.a, res, sofr));
      }
    }
  }
  function premiosDe(S) {
    const L = Object.entries(S.est || {}).map(([key, e]) => { const i = key.indexOf('|'); return { k: key.slice(0, i), n: key.slice(i + 1), g: e[0], a: e[1], j: e[2], s: e[3] }; });
    const minJ = Math.max(1, Math.floor((S.jogosNosso || 1) / 2));
    const melhor = L.filter((x) => x.j >= minJ).sort((a, b) => b.s / b.j - a.s / a.j || b.j - a.j)[0];
    const art = L.slice().sort((a, b) => b.g - a.g || b.a - a.a || a.j - b.j)[0], ass = L.slice().sort((a, b) => b.a - a.a || b.g - a.g || a.j - b.j)[0];
    const pk = (x, v) => (x && v > 0 ? { k: x.k, n: x.n, v } : null);
    return { art: pk(art, art ? art.g : 0), ass: pk(ass, ass ? ass.a : 0), melhor: melhor ? { k: melhor.k, n: melhor.n, v: r1(melhor.s / melhor.j) } : null };
  }
  function artilharia(S, campo, n) {
    const c = campo === 'a' ? 1 : 0;
    return Object.entries(S.est || {}).map(([key, e]) => { const i = key.indexOf('|'); return { k: key.slice(0, i), n: key.slice(i + 1), g: e[0], a: e[1], j: e[2] }; })
      .filter((x) => (c ? x.a : x.g) > 0).sort((x, y) => (c ? y.a - x.a || y.g - x.g : y.g - x.g || y.a - x.a) || x.j - y.j).slice(0, n || 10);
  }
  const nomeJog = (S, n) => (n === VOCE ? (S && S.voceNome) || T('Você') : n);

  // ============================================================================================ OS ESTÁDIOS
  const GRANDES = ['anel', 'fachada', 'concha'];
  const EA = () => window.EstadiosA || null;
  const modeloCasa = (k) => { const E = EA(); return E ? E.modeloDoClube(k) : ''; };
  const nomeEstadio = (m) => { const E = EA(); return E && m ? E.nome(m) : T('Estádio'); };
  // a final: num dos grandes que não seja a casa de nenhum dos dois (se todos forem, a Arena da Floresta)
  function estadioFinal(a, b, sem) {
    const donos = [modeloCasa(a), modeloCasa(b)], L = GRANDES.filter((m) => !donos.includes(m));
    return L.length ? L[(sem >>> 0) % L.length] : 'floresta';
  }

  // ============================================================================================ O CAMPEONATO (pontos corridos)
  //   S.rod[r] = [[ci, fi, gc, gf], ...] (índices em S.times; gc = -1: não jogado). Rápido: só o turno (19); padrão: turno e returno (38).
  function tabelaTurno(n) {
    const arr = embaralha([...Array(n).keys()]), ida = [];
    for (let k = 0; k < n - 1; k++) {
      const rod = [];
      for (let i = 0; i < n / 2; i++) { const a = arr[i], b = arr[n - 1 - i], casaA = (k + i) % 2 === 0; rod.push([casaA ? a : b, casaA ? b : a, -1, -1]); }
      ida.push(rod); arr.splice(1, 0, arr.pop());
    }
    return ida;
  }
  const HORAS = ['tarde', 'noite', 'dia', 'noite', 'tarde', 'noite', 'dia'];
  function novoCampeonato(div, formato, nosso) {
    const ks = timesDiv(div), ida = tabelaTurno(ks.length);
    const rod = formato === 'padrao' ? ida.concat(ida.map((r) => r.map(([c, f]) => [f, c, -1, -1]))) : ida;
    return { tipo: 'camp', v: 1, pais: europa(div) ? div : 'BR', div, formato, nosso, times: ks, rod, r: 0, est: {}, fichas: {}, jogosNosso: 0, fim: false, festa: false, gala: false, hist: [], sem: (Math.random() * 1e9) >>> 0, criado: Date.now() };
  }
  function classificacao(S) {
    const L = S.times.map((k, i) => ({ i, k, j: 0, p: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0 }));
    for (const rod of S.rod) for (const [c, f, a, b] of rod) {
      if (a < 0) continue;
      const A = L[c], B = L[f]; A.j++; B.j++; A.gp += a; A.gc += b; B.gp += b; B.gc += a;
      if (a > b) { A.v++; A.p += 3; B.d++; } else if (a < b) { B.v++; B.p += 3; A.d++; } else { A.e++; B.e++; A.p++; B.p++; }
    }
    return L.sort((x, y) => y.p - x.p || y.v - x.v || (y.gp - y.gc) - (x.gp - x.gc) || y.gp - x.gp || x.i - y.i);
  }
  const jogoDoNosso = (S, r) => { const i = S.times.indexOf(S.nosso), g = S.rod[r] && S.rod[r].find((x) => x[0] === i || x[1] === i); return g ? { g, c: S.times[g[0]], f: S.times[g[1]] } : null; };
  function simularJogo(S, kc, kf, neutro) {
    const p = SBD._t.simularPlacar(kc, kf, 1, neutro ? 0.97 : 1);
    sumulaSimulada(S, kc, p[0], p[1]); sumulaSimulada(S, kf, p[1], p[0]);
    const cc = cartoesSimulados(S, kc), cf = cartoesSimulados(S, kf);
    fecharFichas(S, kc, cc); fecharFichas(S, kf, cf);
    return p;
  }
  // fecha a rodada r: o seu jogo (já com o placar) e os outros simulados
  function fecharRodada(S, r, nossoJogo) {
    for (const g of S.rod[r]) {
      if (g[2] >= 0) continue;
      const kc = S.times[g[0]], kf = S.times[g[1]];
      if (nossoJogo && (kc === S.nosso || kf === S.nosso)) { g[2] = nossoJogo[0]; g[3] = nossoJogo[1]; continue; }
      const p = simularJogo(S, kc, kf); g[2] = p[0]; g[3] = p[1];
    }
    S.r = r + 1;
    if (S.r >= S.rod.length) S.fim = true;
  }
  const zonaCamp = (S, pos) => (europa(S.div) ? (pos <= 4 ? 'z1' : pos <= 6 ? 'z2' : pos > S.times.length - 3 ? 'z3' : '') : S.div === 'A' ? (pos <= 4 ? 'z1' : pos <= 6 ? 'z2' : pos > S.times.length - 4 ? 'z3' : '') : (pos <= 4 ? 'z1' : pos > S.times.length - 4 ? 'z3' : ''));
  function htmlTabela(S) {
    const cl = classificacao(S);
    return '<table class="lvTab"><tr><th>#</th><th style="text-align:left">' + escH(T('Time')) + '</th><th>P</th><th>J</th><th>V</th><th>E</th><th>D</th><th>' + escH(T('SG')) + '</th></tr>' +
      cl.map((x, i) => '<tr class="' + (x.k === S.nosso ? 'nos ' : '') + zonaCamp(S, i + 1) + '"><td>' + (i + 1) + '</td><td class="n"><img src="' + urlT(x.k) + '" alt="">' + escH(nomeT(x.k)) + '</td><td><b>' + x.p + '</b></td><td>' + x.j + '</td><td>' + x.v + '</td><td>' + x.e + '</td><td>' + x.d + '</td><td>' + (x.gp - x.gc) + '</td></tr>').join('') + '</table>' +
      '<p class="lvLeg">' + (europa(S.div) ? '<i style="background:#3f9d2a"></i>' + escH(T('Copa dos Campeões da Europa')) + '<i style="background:#2a7ad6"></i>' + escH(T('Torneio Europeu')) + '<i style="background:#c8202e"></i>' + escH(T('Rebaixamento'))
        : S.div === 'A' ? '<i style="background:#3f9d2a"></i>' + escH(T('Libertadores')) + '<i style="background:#2a7ad6"></i>' + escH(T('Pré-Libertadores')) + '<i style="background:#c8202e"></i>' + escH(T('Rebaixamento'))
        : '<i style="background:#3f9d2a"></i>' + escH(T('Acesso ao Brasileirão A')) + '<i style="background:#c8202e"></i>' + escH(T('Rebaixamento'))) + '</p>';
  }
  const linhaJogo = (S, c, f, gc, gf, pen, extra) => '<div class="lvJogo' + (c === S.nosso || f === S.nosso ? ' nos' : '') + '"><span><img src="' + urlT(c) + '" alt="">' + escH(siglaT(c)) + '</span><b>' + (gc < 0 ? 'x' : gc + ' x ' + gf) + (pen ? ' <small>(' + pen[0] + '-' + pen[1] + ')</small>' : '') + '</b><span>' + escH(siglaT(f)) + '<img src="' + urlT(f) + '" alt=""></span>' + (extra || '') + '</div>';
  function htmlRodada(S, r) {
    const rod = S.rod[r]; if (!rod) return '';
    return rod.map(([c, f, a, b]) => linhaJogo(S, S.times[c], S.times[f], a, b)).join('');
  }

  // ============================================================================================ A COPA (mata-mata em jogo único)
  const FASES_COPA = ['Primeira fase', 'Oitavas de final', 'Quartas de final', 'Semifinal', 'Final'];
  function novaCopa(nosso) {
    const forca = (k) => forcaT(k).media;
    const B = timesDiv('B').sort((a, b) => forca(b) - forca(a));
    let ks = timesDiv('A').concat(B.slice(0, 12));
    if (!ks.includes(nosso)) { ks.sort((a, b) => forca(b) - forca(a)); ks.pop(); ks.push(nosso); }
    ks.sort((a, b) => forca(b) - forca(a));
    const fortes = embaralha(ks.slice(0, 16)), fracos = embaralha(ks.slice(16));
    // nas primeiras fases o mais fraco joga em casa (como na Copa do Brasil de verdade)
    const fase0 = fortes.map((a, i) => ({ c: fracos[i], f: a, gc: -1, gf: -1, pen: null }));
    return { tipo: 'copa', v: 1, pais: 'BR', nosso, times: ks, fases: [fase0], est: {}, fichas: {}, jogosNosso: 0, campeao: null, fora: false, fim: false, festa: false, gala: false, hist: [], sem: (Math.random() * 1e9) >>> 0, criado: Date.now() };
  }
  const vencedor = (g) => (g.pen ? (g.pen[0] > g.pen[1] ? g.c : g.f) : g.gc > g.gf ? g.c : g.gc < g.gf ? g.f : g.c);
  function proximaFaseCopa(S) {
    const F = S.fases[S.fases.length - 1]; if (F.some((g) => g.gc < 0)) return;
    const w = F.map(vencedor);
    if (w.length === 1) { S.campeao = w[0]; S.fim = true; return; }
    const prox = [];
    for (let i = 0; i < w.length; i += 2) {
      const a = w[i], b = w[i + 1], fin = w.length === 2;
      const [c, f] = fin ? [a, b] : Math.random() < 0.5 ? [a, b] : [b, a];
      prox.push({ c, f, gc: -1, gf: -1, pen: null, neutro: fin ? estadioFinal(c, f, S.sem) : null });
    }
    S.fases.push(prox);
  }
  const jogoCopaNosso = (S) => { const F = S.fases[S.fases.length - 1]; return F.find((g) => g.gc < 0 && (g.c === S.nosso || g.f === S.nosso)) || null; };
  function simularJogoCopa(S, g) {
    const p = simularJogo(S, g.c, g.f, !!g.neutro); g.gc = p[0]; g.gf = p[1];
    if (g.gc === g.gf) g.pen = SBD._t.penaltis(g.c, g.f);
  }
  // fecha a fase atual: o seu jogo (já com o placar) e os outros simulados; se você caiu, a copa vai até o fim sozinha
  function fecharFaseCopa(S) {
    for (const g of S.fases[S.fases.length - 1]) if (g.gc < 0) simularJogoCopa(S, g);
    proximaFaseCopa(S);
    const ainda = S.fases[S.fases.length - 1].some((g) => g.c === S.nosso || g.f === S.nosso);
    if (!S.fim && !ainda) { S.fora = true; while (!S.fim) { for (const g of S.fases[S.fases.length - 1]) if (g.gc < 0) simularJogoCopa(S, g); proximaFaseCopa(S); } }
  }
  function htmlChave(S) {
    return S.fases.map((F, i) => '<div class="lvCard"><h3>' + escH(T(FASES_COPA[i + (5 - Math.round(Math.log2(S.times.length)))] || '')) + '</h3>' +
      F.map((g) => linhaJogo(S, g.c, g.f, g.gc, g.gf, g.pen, g.neutro ? '' : '')).join('') + '</div>').reverse().join('');
  }
  const faseNome = (S) => T(FASES_COPA[S.fases.length - 1] || '');

  // ============================================================================================ O CONFRONTO (a tela antes do jogo)
  //   m = { a (o seu time), b (o adversário), casa (true: você é o mandante), comp (texto), info (texto), estadio (nome),
  //         S (o campeonato/copa, para os desfalques), tabela (função que mostra a tabela/chave), cfg, podeEstadio }
  //   Abas: Confronto (os dois se encarando, os técnicos atrás) · Os times · Escalações · Desfalques. Devolve { cfg } ou null (voltar).
  const POSES_ENC = [
    (m) => { m.bracoE.rotation.set(-0.32, 0, 0.62); m.bracoD.rotation.set(0.32, 0, 0.62); usarCotovelo(m.bracoE, -1.05, 1.5); usarCotovelo(m.bracoD, 1.05, 1.5); usarCabeca(m, 0.12); },   // braços cruzados
    (m) => { m.bracoE.rotation.set(0.5, 0, 0.1); m.bracoD.rotation.set(-0.5, 0, 0.1); usarCotovelo(m.bracoE, -1.4, 0); usarCotovelo(m.bracoD, 1.4, 0); usarCabeca(m, 0.18); },           // mãos na cintura
    (m) => { m.bracoD.rotation.set(0.12, 0, 1.45); m.bracoE.rotation.set(0.08, 0, -0.08); usarCabeca(m, 0.08); m.corpo.rotation.z = -0.06; },                                    // apontando
    (m) => { m.corpo.rotation.z = 0.1; m.bracoE.rotation.set(0.22, 0, -0.2); m.bracoD.rotation.set(-0.22, 0, -0.2); usarCabeca(m, 0.36); },                                      // queixo erguido
    (m) => { m.bracoD.rotation.set(0.25, 0, 0.75); usarCotovelo(m.bracoD, 0.4, 1.9); m.bracoE.rotation.set(0.1, 0, 0); usarCabeca(m, 0.1); },                                      // punho no peito
    (m) => { m.bracoE.rotation.set(0.95, 0, 0.15); m.bracoD.rotation.set(-0.95, 0, 0.15); usarCotovelo(m.bracoE, 0, 1.35); usarCotovelo(m.bracoD, 0, 1.35); usarCabeca(m, 0.15); },   // "vem!"
    (m) => { m.bracoE.rotation.set(-0.42, 0, 0.5); usarCotovelo(m.bracoE, 0, 2.05); m.bracoD.rotation.set(-0.08, 0, -0.05); usarCabeca(m, 0.22); },                               // a mão no escudo
  ];
  const TEC_POSE = [
    (m) => { m.bracoE.rotation.set(-0.32, 0, 0.62); m.bracoD.rotation.set(0.32, 0, 0.62); usarCotovelo(m.bracoE, -1.05, 1.5); usarCotovelo(m.bracoD, 1.05, 1.5); },              // braços cruzados
    (m) => { m.bracoE.rotation.set(0.84, 0, -0.31); m.bracoD.rotation.set(-0.84, 0, -0.31); usarCotovelo(m.bracoE, -1.11, 1.93); usarCotovelo(m.bracoD, 1.11, 1.93); },           // mãos na cintura
    (m) => { m.bracoE.rotation.set(-0.17, 0, 0.97); usarCotovelo(m.bracoE, -1.14, -0.28); m.bracoD.rotation.set(0.11, 0, 1.23); usarCotovelo(m.bracoD, 0.63, 1.56); },          // a mão no queixo
  ];
  // um jogador do time (uniforme + aparência do elenco ou a sua)
  function boneco(k, j, num, uniforme) {
    const tm = TD(k) ? SBD.timeMotor(TD(k)) : VZD.timeMotor(TV(k)), U = uniforme || tm.uniforme, gk = j.pos === 'GK';
    const m = makeAthlete({ camisa: gk ? U.goleiro : U.camisa, listra: U.listra, gola: U.gola, numero: num, calcao: U.calcao, meia: gk ? U.goleiro : U.meia, sola: U.sola, emblema: tm.emblema,
      modelo: typeof modeloDaCamisa === 'function' ? modeloDaCamisa(U, gk) : null, peito: U.peito,
      pele: j.pele || '#946042', cabelo: j.cabelo || '#1C140F', estilo: j.estilo || 0, barba: j.barba, rosto: j.rosto, labio: j.labio, corBarba: j.corBarba, nomeCamisa: j.nomeCamisa, manga: j.manga, meiao: j.meiao, chuteira: j.chuteira,
      luva: gk ? 0xf2f2ee : null, enfeites: j.enfeites, nome: ' ', fundoNome: 'rgba(0,0,0,0)' });
    if (m.etiqueta) m.etiqueta.visible = false;
    ATLETAS.delete(m);                                                   // fora da lista do jogo
    return m;
  }
  // daPartida: o MESMO técnico que fica na beira do campo (os dados e o uniforme da partida montada: com o 2º uniforme,
  //   a roupa dele acompanha); fora da partida, o do time
  function tecnicoDe(k, daPartida) {
    const tm = TD(k) ? SBD.timeMotor(TD(k)) : VZD.timeMotor(TV(k));
    const P = daPartida && typeof PARTIDA !== 'undefined' ? PARTIDA : null, t = P && P.timesObj ? P.timesObj.findIndex((o) => o && o.id === tm.id) : -1;
    const m = t >= 0 ? bonecoTecnico(P.tecnicos[t], Object.assign({}, P.timesObj[t], { uniforme: P.uniformes ? P.uniformes[t] : P.timesObj[t].uniforme })) : bonecoTecnico(tm.tecnico, tm);
    if (m.etiqueta) m.etiqueta.visible = false; ATLETAS.delete(m); return m;
  }
  function estrela(k, S) { const E = titularesDe(S || null, k).slice(); return E.sort((x, y) => (y.media || 0) - (x.media || 0)).find((j) => j.pos !== 'GK') || E[0] || {}; }
  // o "você": a aparência do personagem escolhido (ou a padrão)
  function voceDe(cfg) {
    const pers = cfg.pers && typeof personagensSalvos === 'function' ? personagensSalvos().find((x) => x.slot === cfg.pers) : null;
    if (pers) return { nome: pers.nome, numero: pers.p.numero || 10, aparencia: Object.assign({}, pers.p.aparencia, { nomeCamisa: pers.p.nomeCamisa || '' }), genero: pers.p.genero };
    return { nome: T('Você'), numero: 10, aparencia: null };
  }
  function encarada(canvas, m) {
    let R = null, raf = 0, vivo = true; const feitos = [];
    const parar = () => { vivo = false; cancelAnimationFrame(raf); for (const x of feitos) { try { descartarBoneco(x.raiz); } catch (e) { /* nada */ } } try { if (R) { R.dispose(); R.forceContextLoss(); } } catch (e) { /* nada */ } };
    try {
      const w = Math.max(200, canvas.clientWidth || 300), h = Math.max(150, canvas.clientHeight || 220);
      R = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false }); R.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); R.setSize(w, h, false);
      const cena = new THREE.Scene(); cena.add(new THREE.HemisphereLight(0xfff4e0, 0x3a2c1e, 1.05)); const sol = new THREE.DirectionalLight(0xffffff, 1.0); sol.position.set(1.5, 4, 5); cena.add(sol);
      const cam = new THREE.PerspectiveCamera(24, w / h, 0.1, 60); cam.position.set(0, 1.25, 8.6); cam.lookAt(0, 1.05, 0);
      const ladoNosso = m.casa ? -1 : 1;                                 // a casa fica do lado esquerdo da tela
      const vc = voceDe(m.cfg), jN = vc.aparencia ? Object.assign({ pos: m.cfg.pos }, vc.aparencia) : estrela(m.a, m.S), jA = estrela(m.b, m.S);
      const mN = boneco(m.a, jN, vc.aparencia ? vc.numero : 10, m.uni ? m.uni.a : null), mA = boneco(m.b, jA, 10, m.uni ? m.uni.b : null);
      const tN = tecnicoDe(m.a), tA = tecnicoDe(m.b);
      for (const x of [mN, mA, tN, tA]) { feitos.push(x); cena.add(x.raiz); if (x.sombra) x.sombra.visible = false; }
      const pN = Math.floor(Math.random() * POSES_ENC.length); let pA = Math.floor(Math.random() * POSES_ENC.length); if (pA === pN) pA = (pA + 3) % POSES_ENC.length;
      POSES_ENC[pN](mN); POSES_ENC[pA](mA); TEC_POSE[Math.floor(Math.random() * 3)](tN); TEC_POSE[Math.floor(Math.random() * 3)](tA);
      mN.raiz.position.set(ladoNosso * 0.74, 0, 0); mA.raiz.position.set(-ladoNosso * 0.74, 0, 0);
      mN.raiz.rotation.y = ladoNosso < 0 ? -0.55 : Math.PI + 0.55; mA.raiz.rotation.y = ladoNosso < 0 ? Math.PI + 0.55 : -0.55;
      tN.raiz.position.set(ladoNosso * 2.15, 0, -1.7); tA.raiz.position.set(-ladoNosso * 2.15, 0, -1.7);
      tN.raiz.rotation.y = -Math.PI / 2 + ladoNosso * -0.45; tA.raiz.rotation.y = -Math.PI / 2 + ladoNosso * 0.45;   // os técnicos de frente para a câmera, um pouco virados para o meio
      const t0 = performance.now(), y0N = mN.corpo.position.y, y0A = mA.corpo.position.y;
      let wA = w, hA = h;
      const quadro = () => {
        if (!vivo) return;
        const cw = canvas.clientWidth, ch = canvas.clientHeight;      // (7.4.13) a tela mudou de tamanho (girou, redimensionou): acompanha
        if (cw > 50 && ch > 50 && (Math.abs(cw - wA) > 2 || Math.abs(ch - hA) > 2)) { wA = cw; hA = ch; R.setSize(cw, ch, false); cam.aspect = cw / ch; cam.updateProjectionMatrix(); }
        const t = (performance.now() - t0) / 1000;
        mN.corpo.position.y = y0N + Math.max(0, Math.sin(t * 2.1)) * 0.012; mA.corpo.position.y = y0A + Math.max(0, Math.sin(t * 2.1 + 1.3)) * 0.012;
        R.render(cena, cam); raf = requestAnimationFrame(quadro);
      };
      quadro();
    } catch (e) { console.warn('[Livre] encarada:', e); }
    return { parar };
  }
  const SETORES = [['gk', 'Goleiro'], ['def', 'Defesa'], ['mid', 'Meio'], ['fwd', 'Ataque']];
  function cardTime(k, S) {
    const t = TD(k) || TV(k), f = forcaT(k), tm = TD(k) ? SBD.timeMotor(TD(k)) : VZD.timeMotor(TV(k)), V = typeof visualTecnico === 'function' ? visualTecnico(tm.tecnico, tm) : null;
    const barras = SETORES.map(([s, n]) => { const v = f[s], cls = v - f.media >= 0.5 ? 'alto' : f.media - v >= 0.5 ? 'baixo' : ''; return '<div class="lvBarra"><span>' + escH(T(n)) + '</span><i><b class="' + cls + '" style="width:' + Math.round(clampN(v, 0, 10) * 10) + '%"></b></i><span>' + Math.round(v * 10) + '</span></div>'; }).join('');
    const TRAJE = { terno: 'de terno', agasalho: 'de agasalho do clube', polo: 'de polo do clube', social: 'de camisa social', jaqueta: 'de jaqueta' };
    const tat = typeof TATICAS !== 'undefined' && TATICAS[t.tatica] ? T(TATICAS[t.tatica].nome) : '';
    return '<div class="lvCard"><h3><img src="' + urlT(k) + '" alt="">' + escH(t.nome) + '</h3>' +
      '<p><span class="est">' + '★★★★★☆☆☆☆☆'.slice(5 - estrelasT(k), 10 - estrelasT(k)) + '</span> · ' + escH(Tf('média {0}', Math.round(f.media * 10))) + (TD(k) ? ' · ' + escH(T(nomeDiv(divT(k)))) : '') + '</p>' +
      '<p>' + escH(Tf('Técnico: {0}', t.tecnico)) + (V ? ' (' + escH(T(TRAJE[V.traje.tipo])) + (V.traje.oculos ? ', ' + escH(T(V.traje.oculos === 'escuro' ? 'óculos escuros' : 'de óculos')) : '') + (V.traje.bone ? ', ' + escH(T('de boné')) : '') + ')' : '') + '</p>' +
      '<p>' + escH(Tf('Esquema: {0}', t.formacao)) + (tat ? ' · ' + escH(tat) : '') + '</p>' + barras + (t.estilo || t.nota ? '<p style="opacity:.85">' + escH(T(t.estilo || t.nota)) + '</p>' : '') + '</div>';
  }
  const LINHAS_F = (f) => String(f || '4-4-2').split('-').map(Number).filter((x) => x > 0);
  function campoTime(k, S, espelho, voceK, pos) {
    const t = TD(k) || TV(k), E = elencoT(k), fora = new Set(foraDe(S, k).map((x) => x.n)), cor = t.uni[0];
    const T11 = titularesDe(S, k); let iu = -1;
    if (voceK) { iu = T11.findIndex((j) => j.pos === pos); }
    const L = LINHAS_F(t.formacao), linhas = [[0]]; let n = 1; for (const q of L) { const l = []; for (let i = 0; i < q && n < T11.length; i++) l.push(n++); linhas.push(l); }
    const out = [];
    linhas.forEach((l, li) => l.forEach((idx, i) => {
      const j = T11[idx]; if (!j) return;
      const fx = 7 + li * (86 / Math.max(1, linhas.length - 1)), fy = l.length === 1 ? 50 : 14 + i * (72 / (l.length - 1)), voce = idx === iu;
      out.push('<div class="lvJ' + (voce ? ' voce' : '') + '" style="left:' + (espelho ? 100 - fx : fx) + '%;top:' + fy + '%;--c:' + cor + '"><em>' + Math.round((j.media || 6) * 10) + '</em><i></i><span>' + escH(voce ? T('Você') : j.nome) + '</span></div>');
    }));
    const foraTxt = [...fora].filter((n2) => E.some((j) => j.nome === n2)).length;
    return '<div class="lvCard"><h3><img src="' + urlT(k) + '" alt="">' + escH(t.nome) + ' · ' + escH(t.formacao) + '</h3><div class="lvCampo">' + out.join('') + '</div>' + (foraTxt ? '<p style="opacity:.8">' + escH(Tf('{0} desfalque(s): o reserva da posição entra.', foraTxt)) + '</p>' : '') + '</div>';
  }
  function cardDesfalques(k, S) {
    const L = foraDe(S, k), F = (S && S.fichas && S.fichas[k]) || {};
    const pend = Object.entries(F).filter(([, f]) => f.am === 2 && !f.su).map(([n]) => n);
    return '<div class="lvCard"><h3><img src="' + urlT(k) + '" alt="">' + escH(nomeT(k)) + '</h3>' + (L.length ? '<ul class="lvLista">' + L.map((x) => '<li' + (x.n === VOCE ? ' class="nos"' : '') + '><span>' + escH(nomeJog(S, x.n)) + '</span><span>' + escH(motivoTxt(x)) + '</span></li>').join('') + '</ul>' : '<p>' + escH(T('Nenhum desfalque.')) + '</p>') +
      (pend.length ? '<p style="opacity:.8">' + escH(Tf('Pendurados (2 amarelos): {0}', pend.map((n) => nomeJog(S, n)).join(', '))) + '</p>' : '') + '</div>';
  }
  // (7.4.10) OS UNIFORMES NO CONFRONTO: dois quadradinhos para cada time (a camisa 1 e a 2 desenhadas nas cores delas); o
  //   marcado é o que entra em campo. Começa com o que o jogo escolheria sozinho (o visitante troca se as camisas forem parecidas).
  const tmDe = (k) => (TD(k) ? SBD.timeMotor(TD(k)) : VZD.timeMotor(TV(k)));
  const unisDe = (k) => { const tm = tmDe(k); return [tm.uniforme, tm.uniforme2 || tm.uniforme]; };
  function kitsAuto(a, b, casa) {
    try {
      const tA = tmDe(a), tB = tmDe(b), P = resolverPartida({ times: [tA, tB], mandante: casa ? 0 : 1 });
      return { [a]: P.uniformes[0] === tA.uniforme2 && tA.uniforme2 !== tA.uniforme ? 1 : 0, [b]: P.uniformes[1] === tB.uniforme2 && tB.uniforme2 !== tB.uniforme ? 1 : 0 };
    } catch (e) { return { [a]: 0, [b]: 0 }; }
  }
  function svgCamisa(U) {
    const c = U.camisa || '#888', l = U.listra && U.listra !== U.camisa ? U.listra : null, g = U.gola || c, k = U.calcao || '#222';
    return '<svg viewBox="0 0 28 30" width="28" height="30" aria-hidden="true"><path d="M8 2 L2 7 L5 12 L8 10 L8 22 L20 22 L20 10 L23 12 L26 7 L20 2 Q14 6 8 2 Z" fill="' + c + '" stroke="#0b0b0b" stroke-width="1.2"/>' +
      (l ? '<rect x="12" y="4" width="4" height="18" fill="' + l + '"/>' : '') + '<path d="M10.5 2.6 Q14 5.4 17.5 2.6" stroke="' + g + '" stroke-width="1.8" fill="none"/>' +
      '<rect x="8.5" y="23" width="11" height="6" fill="' + k + '" stroke="#0b0b0b" stroke-width="1"/></svg>';
  }
  const htmlKits = (k, kits) => '<div class="lvKits">' + unisDe(k).map((U, i) => '<button type="button" class="lvKit' + (kits[k] === i ? ' on' : '') + '" data-a="kit:' + escH(k) + ':' + i + '" title="' + escH(Tf('Uniforme {0}', i + 1)) + '">' + svgCamisa(U) + '<small>' + (i + 1) + '</small></button>').join('') + '</div>';
  async function confronto(m) {
    let cfg = Object.assign({}, m.cfg);
    const kits = m.kits || kitsAuto(m.a, m.b, m.casa);
    for (;;) {
      const a = m.a, b = m.b, kc = m.casa ? a : b, kf = m.casa ? b : a, ta = TD(kc) || TV(kc), tb = TD(kf) || TV(kf);
      const ABAS = [T('Confronto'), T('Os times'), T('Escalações'), T('Desfalques')];
      const el = tela('<div class="lvCaixa">' + topo(m.comp) + '<p class="lvSub">' + escH([m.info, m.estadio].filter(Boolean).join(' · ')) + '</p>' +
        '<div class="lvAbas">' + ABAS.map((x, i) => '<button type="button" class="pxBtn' + (i ? '' : ' on') + '" data-a="aba' + i + '">' + escH(x) + '</button>').join('') + '</div>' +
        '<div data-pag="0"><div class="lvPalco" style="--c1:' + ta.uni[0] + ';--c2:' + tb.uni[0] + '"><canvas></canvas>' +
        '<div class="lado a"><img src="' + urlT(kc) + '" alt=""><b>' + escH(ta.nome) + '</b><span class="est">' + '★★★★★☆☆☆☆☆'.slice(5 - estrelasT(kc), 10 - estrelasT(kc)) + '</span><small class="lvMed">' + escH(Tf('média {0}', Math.round(forcaT(kc).media * 10))) + '</small><span class="lvTag' + (m.neutro ? ' neutro' : '') + '">' + escH(T(m.neutro ? 'NEUTRO' : 'CASA')) + '</span>' + htmlKits(kc, kits) + '</div>' +
        '<div class="lado b"><img src="' + urlT(kf) + '" alt=""><b>' + escH(tb.nome) + '</b><span class="est">' + '★★★★★☆☆☆☆☆'.slice(5 - estrelasT(kf), 10 - estrelasT(kf)) + '</span><small class="lvMed">' + escH(Tf('média {0}', Math.round(forcaT(kf).media * 10))) + '</small><span class="lvTag fora' + (m.neutro ? ' neutro' : '') + '">' + escH(T(m.neutro ? 'NEUTRO' : 'FORA')) + '</span>' + htmlKits(kf, kits) + '</div>' +
        '<div class="xx">' + escH(ta.sigla + '  ×  ' + tb.sigla) + '</div></div></div>' +
        '<div data-pag="1" hidden><div class="lvOpc">' + cardTime(kc, m.S) + cardTime(kf, m.S) + '</div></div>' +
        '<div data-pag="2" hidden><div class="lvOpc">' + campoTime(kc, m.S, false, kc === a, cfg.pos) + campoTime(kf, m.S, true, kf === a, cfg.pos) + '</div></div>' +
        '<div data-pag="3" hidden><div class="lvOpc">' + cardDesfalques(kc, m.S) + cardDesfalques(kf, m.S) + '</div></div>' +
        '<div class="lvBtns"><button type="button" class="pxBtn" data-a="cfg">' + escH(T('Configurações')) + '</button>' + (m.tabela ? '<button type="button" class="pxBtn" data-a="tab">' + escH(T(m.tabelaNome || 'Classificação')) + '</button>' : '') +
        '<button type="button" class="pxBtn pxPrim" data-a="jogar">' + escH(T('JOGAR')) + ' ▶</button></div></div>');
      const uniDe = () => ({ a: unisDe(m.a)[kits[m.a]], b: unisDe(m.b)[kits[m.b]] });
      let palco = encarada(el.querySelector('.lvPalco canvas'), Object.assign({}, m, { cfg, uni: uniDe() }));
      let r;
      for (;;) {
        r = await escolha(el);
        if (r.a.startsWith('aba')) { const i = r.a.slice(3); for (const p of el.querySelectorAll('[data-pag]')) p.hidden = p.dataset.pag !== i; for (const x of el.querySelectorAll('.lvAbas .pxBtn')) x.classList.toggle('on', x.dataset.a === r.a); continue; }
        if (r.a.startsWith('kit:')) {                                    // trocou o uniforme: o quadradinho marcado e os bonecos do palco
          const [, k, n] = r.a.split(':'); kits[k] = Number(n);
          for (const x of el.querySelectorAll('.lvKit')) { const [, k2, n2] = x.dataset.a.split(':'); x.classList.toggle('on', kits[k2] === Number(n2)); }
          palco.parar(); const cv = el.querySelector('.lvPalco canvas'), novo = cv.cloneNode(); cv.replaceWith(novo);
          palco = encarada(novo, Object.assign({}, m, { cfg, uni: uniDe() }));
          continue;
        }
        break;
      }
      palco.parar();
      m.kits = kits;
      if (r.a === 'voltar') return null;
      if (r.a === 'jogar') return { cfg, kits: [kits[m.a], kits[m.b]] };
      if (r.a === 'cfg') { const c = await telaConfig({ cfg, estadio: m.podeEstadio }); if (c) cfg = c; continue; }
      if (r.a === 'tab') { await m.tabela(); continue; }
    }
  }

  // ============================================================================================ A PARTIDA
  //   J = { a, b (o seu time e o adversário), casa, campo ('serieA' | 'society' | 'futsal' | 'varzea'), modelo, comp: { tipo, nome, rodada, fase, mataMata },
  //         S (campeonato/copa ou null), cfg (as configurações), fogos, rodada }
  const horarioDe = (cfg, r) => (cfg.horario === 'auto' ? HORAS[(r | 0) % HORAS.length] : cfg.horario);
  const climaDe = (cfg) => (cfg.clima === 'sorteio' ? (Math.random() < 0.2 ? 'chuva' : 'seco') : cfg.clima || 'seco');
  function montarCfg(J) {
    const c = J.cfg, vc = voceDe(c);
    const tA = motor(J.a, J.S, c.pos), tB = motor(J.b, J.S);
    const campo = J.campo === 'society' ? 'society' : J.campo === 'futsal' ? 'futsal' : J.campo === 'varzea' ? 'varzeaCidade'
      : (typeof CAMPOS !== 'undefined' && CAMPOS.serieA && EA() ? Object.assign({}, CAMPOS.serieA, { modelo: J.modelo || modeloCasa(J.casa ? J.a : J.b) }) : 'oficial');
    const usuario = Object.assign({ posicao: c.pos || 'FWD' }, vc.aparencia ? { nome: vc.nome, numero: vc.numero, aparencia: vc.aparencia } : {});
    return { campo, times: [tA, tB], mandante: J.casa ? 0 : 1, fogos: !!J.fogos && typeof campo === 'object',
      competicao: Object.assign({ tipo: 'amistoso', nome: T('Amistoso'), rodada: 0, fase: '', mataMata: false, jogo: 'unico', placarIda: null }, J.comp || {}),
      dificuldade: c.dif || 'normal', clima: climaDe(c), gramado: 'baixo', horario: horarioDe(c, J.rodada), duracao: Number(c.dur) || 300, genero: 'M', usuario, taticas: [null, null], formacoes: [null, null],
      comemoracoes: [c.celeb1 || 'aviao', c.celeb2 || 'joelhada'], bola: c.bola || '', kits: J.kits || null,
      controleTime: c.controle === 'time' };   // (7.4.13) controlar o time inteiro (só aqui; o modo história nunca manda)   // (7.4.10) as comemorações, a bola e os uniformes escolhidos
  }
  // (7.4.10) retomar = { estado, clima, horario }: a partida salva no intervalo (começa no 2º tempo, sem a abertura). A partida
  //   pode ser salva no intervalo ("Salvar e sair"): aí volta { salvo: estado } e quem chamou guarda (guardarPausa).
  async function jogar(J, retomar) {
    const cfgE = montarCfg(J);
    if (retomar) { if (retomar.clima) cfgE.clima = retomar.clima; if (retomar.horario) cfgE.horario = retomar.horario; }
    jogouNaSessao = true;
    await preto(true, 350); esconder();
    let r = null;
    const bola = (on) => { try { if (window.FutebolCosmeticos && FutebolCosmeticos.usarBola) FutebolCosmeticos.usarBola(on && cfgE.bola ? cfgE.bola : null); } catch (e) { /* bola padrão */ } };   // (7.4.10)
    try {
      r = await Historia.partida({ cfg: cfgE, aviso: '', podeSalvar: !retomar, retomar: retomar ? retomar.estado : null,
        aoPronto: () => { bola(true); if (retomar) return preto(false, 450); return abertura(J, cfgE).catch((e) => { console.error('[Livre] abertura:', e); return preto(false, 400); }); } });
      if (r && r.salvo) r.salvo = { estado: r.salvo, clima: cfgE.clima, horario: cfgE.horario };
    } catch (e) { console.error('[Livre] partida:', e); try { Historia.abortar(); } catch (e2) { /* nada */ } }
    bola(false);
    try { Historia.descartarResultado(); } catch (e) { /* nada */ }   // as fichas e o histórico daqui são do campeonato (não mexem nas outras partidas)
    await preto(true, 500);
    return r;
  }

  // ---------------------------------------------------------------------------------------- A ABERTURA (a cena antes do apito)
  //   completa: o estádio por fora (com fogos nos jogos grandes) → o ônibus chegando e os jogadores descendo → o vestiário (o técnico
  //   falando) → a torcida → os times entrando em campo e perfilados. curta: o estádio e a entrada. Campo sem estádio do Brasileirão A
  //   (society, futsal, várzea): o vestiário e a entrada. O botão PULAR corta tudo.
  let legEl = null, pularEl = null;
  function legenda(t) { if (!legEl) { legEl = document.createElement('div'); legEl.id = 'lvLegenda'; document.body.appendChild(legEl); } legEl.textContent = t || ''; legEl.hidden = !t; }
  const caixaM = (w, h, d, cor, x, y, z, basic) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), basic ? new THREE.MeshBasicMaterial({ color: cor }) : new THREE.MeshLambertMaterial({ color: cor })); m.position.set(x, y, z); return m; };
  function texTexto(txt, w, h, fundo, cor, fonte) {
    const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
    g.fillStyle = fundo; g.fillRect(0, 0, w, h); g.fillStyle = cor; g.textAlign = 'center'; g.textBaseline = 'middle';
    // (7.4.19) nome grande: a fonte diminui até caber (antes o texto era espremido na largura e ficava "bugado")
    if (fonte || typeof textoQueCabe !== 'function') { g.font = fonte || ('bold ' + Math.round(h * 0.62) + 'px Arial'); g.fillText(String(txt).toUpperCase(), w / 2, h / 2 + 1, w - 8); }
    else textoQueCabe(g, String(txt).toUpperCase(), w / 2, h / 2 + 1, w - 8, Math.round(h * 0.62));
    const t = new THREE.CanvasTexture(c); t.magFilter = THREE.NearestFilter; return t;
  }
  function texImg(url) { const t = new THREE.TextureLoader().load(url); t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; return t; }
  const plano = (w, h, tex, x, y, z, ry) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshLambertMaterial({ map: tex, transparent: true })); m.position.set(x, y, z); m.rotation.y = ry || 0; return m; };
  function descartar(g) { if (!g) return; g.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) { const L = Array.isArray(o.material) ? o.material : [o.material]; for (const M of L) { if (M.map) M.map.dispose(); M.dispose(); } } }); if (g.parent) g.parent.remove(g); }
  // o ônibus do clube (nas cores do time, com a faixa, o nome e o escudo dos dois lados)
  const lumH = (c) => { const k = new THREE.Color(c); return k.r * 0.3 + k.g * 0.59 + k.b * 0.11; };
  function coresOnibus(t) {
    let c1 = t.uni[0], c2 = t.uni[1] || '#f2f2ee';
    if (lumH(c1) < 0.13 && lumH(c2) > 0.13) [c1, c2] = [c2, c1];               // ônibus preto vira um caixote: a cor viva na lataria
    if (Math.abs(lumH(c1) - lumH(c2)) < 0.12) c2 = lumH(c1) > 0.5 ? '#1b1d22' : '#f2f2ee';
    return [c1, c2];
  }
  function onibus(k) {
    const t = TD(k) || TV(k), [k1, k2] = coresOnibus(t), c1 = new THREE.Color(k1).getHex(), c2 = new THREE.Color(k2).getHex(), g = new THREE.Group();
    g.add(caixaM(12, 2.9, 2.55, c1, 0, 1.8, 0)); g.add(caixaM(12.04, 0.55, 2.59, new THREE.Color(k1).multiplyScalar(0.5).getHex(), 0, 0.6, 0));
    g.add(caixaM(11.0, 1.05, 2.6, 0x16202c, -0.4, 2.3, 0, true)); g.add(caixaM(11.9, 0.16, 2.4, 0xd5d8dc, 0, 3.33, 0));
    for (const s of [-1, 1]) { g.add(caixaM(12.02, 0.32, 0.04, c2, 0, 1.0, s * 1.28)); g.add(caixaM(4.0, 0.22, 0.04, c2, 3.4, 1.38, s * 1.28)); }   // a faixa
    g.add(caixaM(0.06, 1.6, 2.32, 0x16202c, 6.02, 2.05, 0, true)); g.add(caixaM(0.06, 0.18, 2.0, 0x1b1d22, 6.03, 1.1, 0));
    g.add(caixaM(0.06, 0.32, 1.6, c2, 6.03, 3.0, 0));
    for (const z of [-0.85, 0.85]) g.add(caixaM(0.08, 0.22, 0.4, 0xfff3c4, 6.04, 0.95, z, true));
    for (const z of [-0.85, 0.85]) g.add(caixaM(0.08, 0.22, 0.3, 0xc81e1e, -6.04, 0.95, z, true));
    for (const x of [-4, 3.6]) for (const z of [-1.2, 1.2]) { g.add(caixaM(1.0, 1.0, 0.36, 0x18191c, x, 0.5, z)); g.add(caixaM(0.42, 0.42, 0.38, 0x9aa0a8, x, 0.5, z)); }
    g.add(caixaM(1.1, 2.2, 0.03, 0x0d0f12, 4.45, 1.45, 1.29, true));      // a porta (aberta) do lado do estádio
    g.add(caixaM(1.1, 0.18, 0.5, 0x6d7178, 4.45, 0.2, 1.5));              // o degrau
    const nome = texTexto(t.nome, 512, 48, k2, lumH(k2) > 0.6 ? '#1a1a1a' : '#ffffff');
    for (const s of [-1, 1]) {
      // (7.4.10) o nome e o escudo um pouco para fora da lataria e da faixa (antes ficavam no mesmo plano e piscavam)
      g.add(plano(8.4, 0.62, nome, -1.2, 1.5, s * 1.345, s > 0 ? 0 : Math.PI));
      g.add(plano(1.1, 1.1, texImg(urlT(k)), -5.0, 1.6, s * 1.35, s > 0 ? 0 : Math.PI));
    }
    return g;
  }
  // os jogadores chegando: o agasalho de viagem do clube, o fone de ouvido e a mochila
  function viajante(k, j, i) {
    const tm = TD(k) ? SBD.timeMotor(TD(k)) : VZD.timeMotor(TV(k)), t = TD(k) || TV(k), [k1, k2] = coresOnibus(t);
    const escuro = '#' + new THREE.Color(k1).multiplyScalar(0.45).getHexString();
    const m = makeAthlete({ camisa: k1, listra: k2, gola: k2, numero: '', calcao: escuro, meia: escuro, calca: escuro, meiao: 2, manga: 1, sola: '#f2f2ee',
      pele: j.pele || '#946042', cabelo: j.cabelo || '#1C140F', estilo: j.estilo || 0, barba: j.barba, rosto: j.rosto, labio: j.labio, corBarba: j.corBarba,
      traje: { tipo: 'agasalho' }, emblema: tm.emblema, nome: ' ', fundoNome: 'rgba(0,0,0,0)' });
    try { vestirTecnico(m, { traje: { fone: ['#1b1d22', '#f2f2ee', '#c81e1e', '#2a72d6', '#f0c419'][i % 5], mochila: i % 3 === 1 ? null : (i % 2 ? '#1b1d22' : k2) } }); } catch (e) { /* sem acessórios */ }
    if (m.etiqueta) m.etiqueta.visible = false;
    ATLETAS.delete(m);
    return m;
  }
  // um torcedor (camisa do time, sem número) e um fotógrafo (roupa escura e a câmera)
  const PELES = ['#f1c9a5', '#e0ac7e', '#bf8159', '#946042', '#6b4127', '#4a2c1b'], CABELOS = ['#1c140f', '#3a2a1c', '#6b4a2b', '#b08a4a', '#d6d6d2'];
  function figurante(k, n, foto) {
    const tm = TD(k) ? SBD.timeMotor(TD(k)) : VZD.timeMotor(TV(k)), U = tm.uniforme, r = (x) => ((Math.sin(n * 12.9898 + x * 78.233) * 43758.5453) % 1 + 1) % 1;
    const m = makeAthlete(foto ? { camisa: '#2b2f36', listra: '#2b2f36', gola: '#2b2f36', numero: '', calcao: '#23262d', meia: '#23262d', calca: '#23262d', meiao: 2, manga: 1, sola: '#1d1f24',
      pele: PELES[Math.floor(r(1) * 6)], cabelo: CABELOS[Math.floor(r(2) * 5)], estilo: Math.floor(r(3) * 12), nome: ' ', fundoNome: 'rgba(0,0,0,0)' }
      : { camisa: U.camisa, listra: U.listra, gola: U.gola, numero: '', calcao: r(4) < 0.5 ? '#2f3a4f' : '#23262d', meia: '#2f3a4f', calca: r(4) < 0.5 ? '#2f3a4f' : '#23262d', meiao: 2, manga: r(5) < 0.7 ? 0 : 1, sola: '#f2f2ee',
      pele: PELES[Math.floor(r(1) * 6)], cabelo: CABELOS[Math.floor(r(2) * 5)], estilo: Math.floor(r(3) * 20), barba: r(6) < 0.3 ? 1 : 0, emblema: tm.emblema, nome: ' ', fundoNome: 'rgba(0,0,0,0)' });
    if (foto) { const cam = caixaM(0.26, 0.2, 0.18, 0x111214, 0.36, 1.62, 0); cam.add(caixaM(0.16, 0.12, 0.12, 0x1b1d22, 0.18, 0, 0)); m.troncoInteiro.add(cam); }
    if (m.etiqueta) m.etiqueta.visible = false;
    ATLETAS.delete(m);
    return m;
  }
  // a garagem do estádio (o ônibus entra, a torcida e a imprensa no gradil, a porta do vestiário no fundo)
  function garagem(k, nomeEst) {
    const t = TD(k) || TV(k), [k1] = coresOnibus(t), c1 = new THREE.Color(k1).getHex(), g = new THREE.Group();
    g.add(caixaM(70, 0.2, 22, 0x4a4d52, -10, -0.1, 0));
    for (const z of [-2.1, 2.1]) for (let x = -44; x < 9; x += 3) g.add(caixaM(1.8, 0.02, 0.12, 0xe8c547, x, 0.005, z, true));
    g.add(caixaM(14, 0.02, 0.12, 0xf2f2ee, 6, 0.005, 2.9, true));
    g.add(caixaM(70, 6, 0.4, 0x9a9890, -10, 3, -4.6));                                            // a parede do fundo
    g.add(caixaM(70, 0.9, 0.05, c1, -10, 1.3, -4.38)); g.add(caixaM(70, 0.12, 0.05, 0xf2f2ee, -10, 1.85, -4.38));
    g.add(caixaM(3.2, 3.0, 0.05, 0x0d0f12, 9.5, 1.5, -4.37, true));                                // a porta do vestiário
    g.add(caixaM(3.6, 0.25, 0.3, 0x6d7178, 9.5, 3.1, -4.3));
    const placa = texTexto(T('Vestiário') + ' · ' + nomeT(k), 512, 64, '#1b1d22', '#ffffff'); g.add(plano(3.4, 0.42, placa, 9.5, 3.55, -4.36, 0));
    g.add(plano(2.2, 2.2, texImg(urlT(k)), 0, 3.6, -4.36, 0));   // (7.4.11) o escudo no meio das duas colunas (x = -4 e 4)
    const nE = texTexto(nomeEst || '', 1024, 64, 'rgba(0,0,0,0)', '#f2f2ee'); g.add(plano(13, 0.8, nE, -12, 3.6, -4.36, 0));
    g.add(caixaM(70, 0.4, 22, 0x7d7b75, -10, 6.2, 0));                                             // a laje e as luzes
    for (let x = -40; x < 22; x += 6) g.add(caixaM(2.4, 0.06, 0.3, 0xffffff, x, 5.97, 0, true));
    for (let x = -36; x < 22; x += 8) if (x < -19.5 || x > -4.5) g.add(caixaM(0.7, 6, 0.7, 0x8f8d86, x, 3, -3.9));   // os pilares (encostados na parede; 7.4.10: nenhum na frente do nome do estádio)
    for (let z = -3.6; z <= 4.0; z += 0.6) g.add(caixaM(0.06, 1.05, 0.06, 0xb9bec6, 12.6, 0.52, z));
    g.add(caixaM(0.08, 0.08, 8.2, 0xb9bec6, 12.6, 1.05, 0.15)); g.add(caixaM(0.08, 0.08, 8.2, 0xb9bec6, 12.6, 0.3, 0.15));   // o gradil
    g.add(caixaM(0.4, 6, 22, 0x9a9890, 23, 3, 0));
    return g;
  }
  // a pose andando (pernas e braços balançando) e a sentada
  // (7.4.2) os passos de um jogador do jogo (a malha dele) andando na cena: o syncMeshes não anima com o jogo parado (deslizavam)
  function passos(p, fase) {
    const m = p.mesh; if (!m || !m.pernaE) return;
    const b = Math.sin(fase) * 0.55;
    m.pernaE.rotation.z = b; m.pernaD.rotation.z = -b; m.bracoE.rotation.z = -b * 0.75; m.bracoD.rotation.z = b * 0.75;
    m.raiz.position.y = Math.abs(Math.sin(fase)) * 0.035;
  }
  // a pose do hino: de pé e parado (zera o passo), respirando; peito (mão no peito) ou costas (mãos juntas atrás)
  function hino(p, i, t, juiz) {
    const m = p.mesh; if (!m || !m.pernaE) return;
    m.raiz.position.y = 0; m.raiz.rotation.x = m.raiz.rotation.z = 0; m.corpo.rotation.set(0, 0, 0);
    m.pernaE.rotation.set(0, 0, 0); m.pernaD.rotation.set(0, 0, 0);
    try { usarJoelhos(m, 0, 0); } catch (e) { /* sem joelho */ }
    const r = Math.sin(t * 2.1 + i * 1.3);
    m.corpo.position.y = 0.006 + r * 0.006;
    if (juiz) {
      m.bracoE.rotation.set(0.1, 0, 0.04); m.bracoD.rotation.set(-0.1, 0, 0.04);
      try { usarCotovelos(m, 0, 0); } catch (e) { /* nada */ }
    } else if (i % 3 === 1) {                                           // a mão direita no peito
      m.bracoE.rotation.set(0.1, 0, 0.05); try { usarCotovelo(m.bracoE, 0, 0); } catch (e) { /* nada */ }
      // (7.4.14) o antebraço vem PARA DENTRO (cotovelo 0,8 para dentro e 1,4 para a frente) e a mão encosta no peito, sem atravessar
      //   (medido: a mão fica 0,24 m à frente do meio do corpo, encostada na camisa). Antes ele só dobrava para a frente: a mão subia
      //   do lado do ombro, apontando para fora.
      m.bracoD.rotation.set(0.5, 0, 0.35); try { usarCotovelo(m.bracoD, 0.8, 1.4); } catch (e) { /* nada */ }
    } else {                                                            // as mãos juntas nas costas
      m.bracoE.rotation.set(-0.04, 0, -0.36); m.bracoD.rotation.set(0.04, 0, -0.36);
      try { usarCotovelo(m.bracoE, -1.35, -0.15); usarCotovelo(m.bracoD, 1.35, -0.15); } catch (e) { /* nada */ }
    }
    try { usarCabeca(m, 0.02 + r * 0.01); } catch (e) { /* nada */ }
  }
  function andar(m, fase, v) { const b = Math.sin(fase) * 0.5 * Math.min(1, v / 1.4); m.pernaE.rotation.z = b; m.pernaD.rotation.z = -b; m.bracoE.rotation.z = -b * 0.7; m.bracoD.rotation.z = b * 0.7; m.bracoE.rotation.x = 0.12; m.bracoD.rotation.x = -0.12; m.corpo.position.y = Math.abs(Math.sin(fase)) * 0.04; }
  function sentar(m) { m.raiz.position.y = -0.27; m.pernaE.rotation.z = m.pernaD.rotation.z = 1.5; usarJoelhos(m, -1.5, -1.5); m.bracoE.rotation.z = m.bracoD.rotation.z = 0.75; m.bracoE.rotation.x = 0.15; m.bracoD.rotation.x = -0.15; }
  const virar = (m, dx, dz) => { m.raiz.rotation.y = -Math.atan2(dz, dx); };
  function camOlha(px, py, pz, tx, ty, tz) { camera.position.set(px, py, pz); camera.lookAt(tx, ty, tz); }
  const ESP_HINO = 1.3;                                                // (7.4.10) a distância entre os jogadores perfilados no hino (era 0,95)

  async function abertura(J, cfgE) {
    const modo = J.cfg.abertura || 'completa';
    if (modo === 'nenhuma') { await preto(false, 600); return; }
    const E = EA(), A = E && typeof ESTADIO_A !== 'undefined' && ESTADIO_A ? E.atual() : null;
    const est0 = G.state, salvos = players.concat(officials).map((p) => ({ p, x: p.x, z: p.z, a: p.angle })), bolaV = ball.mesh.visible;
    G.state = 'menu'; G.semNomes = true; ball.mesh.visible = ball.shadow.visible = false;   // sem os nomes em cima das cabeças e sem o círculo do jogador
    for (const o of [userRing, targetRing, dribbleRing, aimArrow]) try { o.visible = false; } catch (e) { /* nada */ }
    setLetterbox(true); try { $('cineLabel').textContent = ''; } catch (e) { /* nada */ }
    let pular = false;
    if (!pularEl) { pularEl = document.createElement('button'); pularEl.type = 'button'; pularEl.id = 'lvPular'; pularEl.className = 'pxBtn'; document.body.appendChild(pularEl); }
    pularEl.textContent = T('Pular') + ' ▶'; pularEl.hidden = false; pularEl.onclick = () => { clique(); pular = true; preto(true, 160); };
    const lixo = [], ctx = { J, A, pular: () => pular };
    let ocultosEntrada = [];                                           // quem a entrada esconde dentro do túnel (volta a aparecer no fim)
    const cenas = A ? (modo === 'curta' ? ['estadio', 'entrada'] : ['estadio', 'onibus', 'vestiario', 'torcida', 'entrada']) : (modo === 'curta' ? ['entrada'] : ['vestiario', 'entrada']);
    const rodar = (dur, fn) => new Promise((ok) => {           // um plano: fn(t, rdt) a cada quadro até dur segundos (ou o pular)
      const t0 = performance.now(); let tl = t0;
      let feito = false;
      GANCHO_RENDER = () => {
        const agora = performance.now(), t = (agora - t0) / 1000, rdt = Math.min(0.05, (agora - tl) / 1000); tl = agora;
        fn(Math.min(t, dur), feito ? 0 : rdt);
        if (!feito && (t >= dur || pular)) { feito = true; ok(); }   // (7.4.2) o plano fica congelado no último quadro até o preto cobrir (antes o jogo aparecia no corte)
      };
    });
    const corte = async (setup) => { await preto(true, pretoEl && pretoEl.classList.contains('on') ? 0 : 220); await esperar(70); setLetterbox(true); try { $('cineLabel').textContent = ''; } catch (e) { /* nada */ } setup(); };
    const plano1 = async (dur, fn) => { const p = rodar(dur, fn); await preto(false, 260); await p; };   // o plano começa ainda no preto (a câmera já no lugar)
    const kM = J.casa ? J.a : J.b, nM = nomeT(kM);
    try {
      for (const c of cenas) {
        if (pular) break;
        if (c === 'estadio') {
          // (7.4.2) a cena começa ainda no preto (a câmera já lá fora) e volta para o preto um pouco antes de acabar: o campo com os
          //   jogadores posicionados nunca aparece entre um plano e outro (nem se tocar na tela para cortar a cena)
          G.torcidaCena = 0.3;
          const durE = J.fogos ? 6 : 4.6;
          const cortaTapa = () => preto(true, 140);
          window.addEventListener('pointerdown', cortaTapa, true);
          const fimE = setTimeout(() => preto(true, 320), durE * 1000 - 380);
          const pc = E.cena({ fogos: !!J.fogos, dur: durE, texto: A.nome + ' · ' + (J.comp && J.comp.nome ? J.comp.nome : T('Amistoso')), parar: () => pular });
          await esperar(90); await preto(false, 450);
          try { await pc; } finally { clearTimeout(fimE); window.removeEventListener('pointerdown', cortaTapa, true); }
          await preto(true, 0);
          setLetterbox(true); try { $('cineLabel').textContent = ''; } catch (e) { /* nada */ }
        } else if (c === 'onibus') {
          // a garagem do estádio: o ônibus entra, o técnico desce na frente e os jogadores (de agasalho, fone e mochila) vão para o vestiário
          const Y = -80, gar = garagem(J.a, A.nome), bus = onibus(J.a); gar.position.set(0, Y, 0); gar.add(bus); lixo.push(gar);
          const anda = [], tec = tecnicoDe(J.a, true); lixo.push({ boneco: tec });
          titularesDe(J.S, J.a).slice(0, 8).forEach((j, i) => { const m = viajante(J.a, j, i); m.raiz.visible = false; gar.add(m.raiz); lixo.push({ boneco: m }); anda.push({ m, t0: 3.35 + (i + 1) * 0.62, v: 1.35 }); });
          tec.raiz.visible = false; gar.add(tec.raiz); anda.unshift({ m: tec, t0: 3.0, v: 1.25 });
          const fas = [], fotos = [];
          for (let i = 0; i < 12; i++) { const m = figurante(J.a, i + 1, false); gar.add(m.raiz); lixo.push({ boneco: m }); m.raiz.position.set(13.1 + (i % 2) * 0.7 + (i % 3) * 0.08, 0, -3.3 + i * 0.62); virar(m, -1, (i % 4 - 1.5) * 0.2); fas.push(m); }
          for (let i = 0; i < 2; i++) {
            const m = figurante(J.a, 40 + i, true); gar.add(m.raiz); lixo.push({ boneco: m }); m.raiz.position.set(11.6 + i * 0.4, 0, 0.2 + i * 1.3); virar(m, -1, 0.35 - i * 0.2);   // perto do gradil, de frente para quem chega
            m.bracoE.rotation.set(0.35, 0, 1.75); m.bracoD.rotation.set(-0.35, 0, 1.75); usarCotovelo(m.bracoE, -1.0, 1.4); usarCotovelo(m.bracoD, 1.0, 1.4);
            const fl = caixaM(0.3, 0.3, 0.3, 0xffffff, 0.45, 1.66, 0, true); fl.visible = false; m.troncoInteiro.add(fl); fotos.push({ m, fl, prox: 3.4 + i * 0.7 });
          }
          // o caminho de cada um: desce do ônibus (z+), anda até a porta do vestiário (x+) e entra (z-)
          const P0 = [4.45, 1.5], P1 = [4.45, 2.5], P2 = [9.5, 2.5], P3 = [9.5, -4.6];
          const L1 = 1, L2 = 5.05, L3 = 7.1;
          const noCaminho = (d) => {
            if (d < L1) return [P0[0], P0[1] + d, 0, 1];
            if (d < L1 + L2) return [P1[0] + (d - L1), P1[1], 1, 0];
            if (d < L1 + L2 + L3) return [P2[0], P2[1] - (d - L1 - L2), 0, -1];
            return null;
          };
          await corte(() => { scene.add(gar); bus.position.set(-40, 0, 0); G.torcidaCena = 0.35; legenda(Tf('O ônibus do {0} chega ao estádio', nomeT(J.a))); });
          const DUR = 9;
          await plano1(DUR, (t) => {
            const kb = Math.min(1, t / 2.8); bus.position.x = -40 + 40 * (1 - Math.pow(1 - kb, 3));
            for (const w of anda) {
              const tt = t - w.t0; if (tt < 0) { w.m.raiz.visible = false; continue; }
              const q = noCaminho(tt * w.v); if (!q) { w.m.raiz.visible = false; continue; }
              w.m.raiz.visible = true; w.m.raiz.position.set(q[0], tt < 0.25 ? 0.18 * (1 - tt / 0.25) : 0, q[1]); virar(w.m, q[2] || 0.0001, q[3]); andar(w.m, tt * 6.2, w.v);
            }
            fas.forEach((m, i) => { const f = t * 7 + i * 1.7; m.bracoD.rotation.z = 2.6 + Math.sin(f) * 0.35; m.bracoE.rotation.z = i % 2 ? 2.6 + Math.cos(f) * 0.35 : 0.25; m.raiz.position.y = Math.max(0, Math.sin(f * 0.5 + i)) * 0.12; });
            for (const f of fotos) { f.fl.visible = t > f.prox && t < f.prox + 0.07; if (t > f.prox + 0.07) f.prox = t + 0.5 + Math.random() * 1.4; }
            const k = t / DUR, e = k * k * (3 - 2 * k);
            camOlha(-5 + 16.5 * e, Y + 1.9 - 0.25 * e, 10.5 - 2 * e, Math.max(bus.position.x + 1, -6 + 14 * e), Y + 1.4, 0.4);
          });
          legenda('');
        } else if (c === 'vestiario') {
          const Y = -40, g = new THREE.Group(), t = TD(J.a) || TV(J.a), c1 = new THREE.Color(t.uni[0]).getHex(), esc = new THREE.Color(t.uni[0]).multiplyScalar(0.6).getHex();
          g.position.set(0, Y, 0); lixo.push(g);
          g.add(caixaM(12.4, 0.2, 8.4, 0x5b6470, 0, -0.1, 0)); for (let x = -6; x < 6; x += 1) for (let z = -4; z < 4; z += 1) if ((x + z) % 2 === 0) g.add(caixaM(1, 0.02, 1, 0x4e5662, x + 0.5, 0.005, z + 0.5));
          g.add(caixaM(12.4, 3.6, 0.2, 0xe9e6dc, 0, 1.8, -4.1)); g.add(caixaM(0.2, 3.6, 8.4, 0xe9e6dc, -6.1, 1.8, 0)); g.add(caixaM(0.2, 3.6, 8.4, 0xe9e6dc, 6.1, 1.8, 0)); g.add(caixaM(12.4, 3.6, 0.2, 0xe9e6dc, 0, 1.8, 4.1));
          g.add(caixaM(12.4, 0.2, 8.4, 0xcfd2d6, 0, 3.6, 0, true));
          for (const [x, z, w, d] of [[0, -3.98, 12.2, 0.05], [-5.98, 0, 0.05, 8.2], [5.98, 0, 0.05, 8.2]]) g.add(caixaM(w, 1.1, d, c1, x, 0.55, z));   // a faixa na cor do time
          for (let i = 0; i < 10; i++) {                                    // os armários com as camisas
            const x = -5.2 + i * 1.12; g.add(caixaM(1.02, 2.15, 0.5, esc, x, 1.08, -3.7)); g.add(caixaM(0.6, 0.72, 0.06, c1, x, 1.55, -3.43)); g.add(caixaM(0.18, 0.1, 0.07, 0xffffff, x, 1.62, -3.39));
          }
          g.add(caixaM(11.4, 0.12, 0.55, 0x9b7448, 0, 0.45, -2.95)); for (const x of [-5, -2.5, 0, 2.5, 5]) g.add(caixaM(0.12, 0.45, 0.4, 0x6b4a2b, x, 0.22, -2.95));
          for (const x of [-3.5, 0, 3.5]) g.add(caixaM(1.4, 0.05, 0.35, 0xffffff, x, 3.48, 0, true));
          g.add(plano(1.3, 1.3, texImg(urlT(J.a)), 0, 2.85, -3.42, 0));
          const quadro = document.createElement('canvas'); quadro.width = 192; quadro.height = 120; { const q = quadro.getContext('2d'); q.fillStyle = '#f4f4f0'; q.fillRect(0, 0, 192, 120); q.strokeStyle = '#2a72d6'; q.lineWidth = 2; q.strokeRect(8, 8, 176, 104); q.beginPath(); q.moveTo(96, 8); q.lineTo(96, 112); q.stroke(); q.beginPath(); q.arc(96, 60, 14, 0, 7); q.stroke(); q.fillStyle = '#c8202e'; for (const [x, y] of [[30, 60], [55, 30], [55, 90], [75, 50], [75, 70], [118, 40], [118, 80]]) { q.beginPath(); q.arc(x, y, 4, 0, 7); q.fill(); } q.strokeStyle = '#1a1a1a'; q.beginPath(); q.moveTo(75, 50); q.lineTo(110, 30); q.moveTo(75, 70); q.lineTo(130, 96); q.stroke(); }
          const tq = new THREE.CanvasTexture(quadro); tq.magFilter = THREE.NearestFilter; g.add(plano(2.2, 1.4, tq, 5.94, 1.9, -0.8, -Math.PI / 2));
          const sent = titularesDe(J.S, J.a).slice(0, 9), bonecos = [];
          sent.forEach((j, i) => {
            const m = boneco(J.a, j, j.pos === 'GK' ? 1 : i + 2); g.add(m.raiz); lixo.push({ boneco: m });
            if (i < 7) { m.raiz.position.set(-4.4 + i * 1.3, 0, -2.9); virar(m, 0.0001, 1); sentar(m); usarCabeca(m, 0.08); }
            else { m.raiz.position.set(i === 7 ? -5.2 : 4.6, 0, -1.4 + (i - 7) * 0.6); virar(m, i === 7 ? 1 : -1, 0.6); m.bracoE.rotation.set(-0.32, 0, 0.62); m.bracoD.rotation.set(0.32, 0, 0.62); usarCotovelo(m.bracoE, -1.05, 1.5); usarCotovelo(m.bracoD, 1.05, 1.5); }
            bonecos.push(m);
          });
          const tec = tecnicoDe(J.a, true); g.add(tec.raiz); lixo.push({ boneco: tec }); tec.raiz.position.set(0.4, 0, 0.8); virar(tec, 0.0001, -1);
          const nomeTec = (TD(J.a) || TV(J.a)).tecnico;
          await corte(() => { scene.add(g); G.torcidaCena = 0.08; legenda(Tf('No vestiário, {0} passa as últimas instruções', nomeTec)); });
          await plano1(5.6, (tt) => {
            const fala = Math.sin(tt * 3.2), aponta = tt % 2.6 < 1.3;
            tec.bracoD.rotation.z = aponta ? 1.45 + fala * 0.12 : 0.9 + fala * 0.3; tec.bracoD.rotation.x = -0.15; tec.bracoE.rotation.z = aponta ? 0.2 : 0.7 + Math.cos(tt * 2.7) * 0.25; tec.bracoE.rotation.x = 0.2;
            tec.corpo.rotation.z = Math.sin(tt * 1.7) * 0.05;
            camOlha(4.6 - tt * 0.28, Y + 1.62, 3.3 - tt * 0.12, -0.6 + tt * 0.1, Y + 1.0, -2.3);
          });
          legenda('');
        } else if (c === 'torcida') {
          await corte(() => { G.torcidaCena = 0.95; try { crowd.comemorar(PARTIDA.mandante); } catch (e) { /* nada */ } legenda(Tf('A torcida do {0} faz a festa', nM)); });
          if (J.fogos) try { E.fogos({ dur: 4, ritmo: 2.4 }); } catch (e) { /* nada */ }
          await plano1(4.4, (tt) => { const x = -26 + tt * 11; camOlha(x, 1.6, HALF_W - 2.5, x * 0.8 + 4, 9.5, HALF_W + 30); if (tt > 2.2 && tt < 2.25) try { crowd.comemorar(PARTIDA.mandante); } catch (e) { /* nada */ } });
          legenda('');
        } else if (c === 'entrada') {
          // os dois times em fila (a casa à esquerda), o trio de arbitragem na frente, saindo do túnel até o meio do campo
          const casa = PARTIDA.mandante === 1 ? 1 : 0, filas = [TEAMS[casa].filter((p) => !p.out), TEAMS[1 - casa].filter((p) => !p.out)];
          const juizes = officials.filter((o) => o.mesh && o.mesh.raiz.visible);
          // eles saem do TÚNEL (o inflável do mandante, montado pelo jogo.js): a fila começa dentro dele e cada um só aparece
          //   depois do fundo do túnel; a placa do meio sai do lugar. Sem túnel (várzea, society, futsal), o portão do alambrado abre e a fila
          //   vem de fora do campo por ele.
          const abre = typeof mostrarTunel === 'function' && typeof TUNEL !== 'undefined' && (TUNEL.grupo || TUNEL.placa), tunel = abre && TUNEL.grupo;
          const fundo = tunel ? TUNEL.fundoZ + 0.4 : -Infinity;
          const z0 = tunel ? -(HALF_W + TUNEL_BOCA) + 0.6 : -(HALF_W + 3.2), v = 1.45, esp = 1.15;
          const surge = (p) => { if (p.mesh) p.mesh.raiz.visible = p.z > fundo; };
          ocultosEntrada = juizes.concat(filas[0], filas[1]);
          await corte(() => { if (abre) mostrarTunel(true); G.torcidaCena = 1; legenda(Tf('{0} x {1}: os times entram em campo', nomeT(PARTIDA.mandante === 1 ? J.b : J.a), nomeT(PARTIDA.mandante === 1 ? J.a : J.b))); });
          await plano1(5.2, (tt, rdt) => {
            const frente = z0 + v * tt;
            juizes.forEach((o, i) => { o.x = (i - (juizes.length - 1) / 2) * 0.8; o.z = frente + 1.6; o.vx = 0; o.vz = v; o.angle = Math.PI / 2; passos(o, tt * 6.4 + i * 1.3); surge(o); });
            filas.forEach((F, s) => F.forEach((p, i) => { p.x = (s ? 0.75 : -0.75); p.z = frente - i * esp; p.vx = 0; p.vz = v; p.angle = Math.PI / 2; passos(p, tt * 6.4 + i * 0.9 + s * 2.1); surge(p); }));
            camOlha(2.6, 1.45, -HALF_W + 7.5 + tt * 0.3, -0.2, 1.25, frente - 1.5);
          });
          if (pular) break;
          // perfilados no meio de campo (parados: a pose de pé de novo), de frente para a tribuna (a câmera passa por eles)
          // parados DE VERDADE no hino: as pernas juntas, o corpo reto, os braços para trás (as mãos juntas nas costas) ou,
          //   em alguns, a mão direita no peito; os juízes com os braços para baixo. Cada um respira no seu ritmo.
          const perfil = filas[0].concat(filas[1]);
          await corte(() => {
            // (7.4.10) o túnel some e quem estava dentro dele reaparece só com a tela já preta (antes sumia com o plano ainda na tela)
            for (const p of juizes.concat(filas[0], filas[1])) if (p.mesh) p.mesh.raiz.visible = true;
            if (abre) mostrarTunel(false);
            filas.forEach((F, s) => F.forEach((p, i) => { p.x = (s ? 1 : -1) * (1.7 + i * ESP_HINO); p.z = -2.6; p.vx = p.vz = 0; p.angle = -Math.PI / 2; }));
            juizes.forEach((o, i) => { o.x = (i - (juizes.length - 1) / 2) * 0.8; o.z = -2.6; o.vx = o.vz = 0; o.angle = -Math.PI / 2; });
            perfil.forEach((p, i) => hino(p, i, 0)); juizes.forEach((o, i) => hino(o, i, 0, true));
            legenda(T('O hino e a foto: os times perfilados'));
          });
          const L = 1.7 + 10 * ESP_HINO;
          await plano1(4.4, (tt) => {
            perfil.forEach((p, i) => hino(p, i, tt)); juizes.forEach((o, i) => hino(o, i, tt, true));
            const x = -L + (2 * L) * (tt / 4.4); camOlha(x * 0.85, 1.55, -8.4, x, 1.2, -2.6);
          });
          legenda('');
        }
      }
    } finally {
      await preto(true, pretoEl && pretoEl.classList.contains('on') ? 0 : 220);   // (7.4.2) arruma tudo no escuro
      GANCHO_RENDER = null; G.camOvo = null; G.torcidaCena = null; G.semNomes = false; legenda(''); if (pularEl) pularEl.hidden = true;
      try { if (typeof mostrarTunel === 'function') mostrarTunel(false); for (const p of ocultosEntrada) if (p.mesh) p.mesh.raiz.visible = true; } catch (e) { /* nada */ }   // (7.4.10) pulou no meio da entrada
      for (const x of lixo) { if (x.boneco) { try { descartarBoneco(x.boneco.raiz); } catch (e) { /* nada */ } } else descartar(x); }
      for (const s of salvos) { s.p.x = s.x; s.p.z = s.z; s.p.angle = s.a; s.p.vx = s.p.vz = 0; }
      ball.mesh.visible = bolaV; ball.shadow.visible = bolaV;
      if (G.state === 'menu') G.state = est0;
      setLetterbox(false); snapCamera();
      await esperar(120); await preto(false, 450);
    }
  }

  // ---------------------------------------------------------------------------------------- VOCÊ SUSPENSO: o jogo simulado (o placar correndo)
  async function jogoSemVoce(J, motivo) {
    const kc = J.casa ? J.a : J.b, kf = J.casa ? J.b : J.a;
    const p = SBD._t.simularPlacar(kc, kf, 1, J.neutro ? 0.97 : 1), minutos = [];
    for (let i = 0; i < p[0]; i++) minutos.push([1 + Math.floor(Math.random() * 90), 0]);
    for (let i = 0; i < p[1]; i++) minutos.push([1 + Math.floor(Math.random() * 90), 1]);
    minutos.sort((a, b) => a[0] - b[0]);
    const el = tela('<div class="lvCaixa lvTicker">' + topo(J.comp.nome, false) + '<p class="lvMsg">' + escH(motivo) + '</p>' +
      '<div class="lvVs"><div><img src="' + urlT(kc) + '" alt=""><b>' + escH(nomeT(kc)) + '</b></div><div class="pl">0 x 0</div><div><img src="' + urlT(kf) + '" alt=""><b>' + escH(nomeT(kf)) + '</b></div></div>' +
      '<p class="lvMsg mn">0\'</p><div class="lvBtns"><button type="button" class="pxBtn" data-a="rapido">' + escH(T('Adiantar')) + ' ▶▶</button></div></div>');
    await preto(false, 300);
    let rapido = false; el.querySelector('[data-a="rapido"]').onclick = () => { clique(); rapido = true; };
    const pl = [0, 0], plE = el.querySelector('.pl'), mn = el.querySelector('.mn');
    for (let m = 1; m <= 90; m++) {
      if (!rapido) await esperar(55);
      mn.textContent = m + '\'';
      for (const x of minutos) if (x[0] === m) { pl[x[1]]++; plE.textContent = pl[0] + ' x ' + pl[1]; mn.textContent = Tf('{0}\' — Gol do {1}!', m, nomeT(x[1] ? kf : kc)); try { Som.apito(); } catch (e) { /* nada */ } if (!rapido) await esperar(700); }
    }
    await esperar(500);
    return p;                                                            // [casa, fora]
  }

  // ---------------------------------------------------------------------------------------- O DEPOIS DO JOGO
  function resumoDoJogo(J, r) {
    const out = { gols: [[], []], cartoes: [[], []] };
    if (!r) return out;
    for (const x of r.golsLog || []) out.gols[x.time].push((x.autor === VOCE ? T('Você') : x.autor || T('Gol contra')) + (x.t != null ? ' ' + Math.max(1, Math.round(x.t / Math.max(1, Number(J.cfg.dur) || 300) * 90)) + '\'' : ''));
    for (const p of r.jogaram || []) { if (p.vermelho) out.cartoes[p.time].push('🟥 ' + (p.nome === VOCE ? T('Você') : p.nome)); else if (p.amarelo) out.cartoes[p.time].push('🟨 ' + (p.nome === VOCE ? T('Você') : p.nome)); }
    return out;
  }
  async function telaResultado(J, placarCF, r, extraHtml, botoes) {
    const kc = J.casa ? J.a : J.b, kf = J.casa ? J.b : J.a, R = resumoDoJogo(J, r), ladoC = J.casa ? 0 : 1;
    const nos = J.casa ? placarCF[0] : placarCF[1], eles = J.casa ? placarCF[1] : placarCF[0];
    const pen = r && r.penaltis ? (J.casa ? r.penaltis : [r.penaltis[1], r.penaltis[0]]) : J.pen || null;
    const venceu = pen ? (J.casa ? pen[0] > pen[1] : pen[1] > pen[0]) : nos > eles, emp = !pen && nos === eles;
    const lista = (i) => '<ul class="lvLista">' + R.gols[i].map((g) => '<li><span>⚽ ' + escH(g) + '</span></li>').join('') + R.cartoes[i].map((g) => '<li><span>' + escH(g) + '</span></li>').join('') + '</ul>';
    const el = tela('<div class="lvCaixa">' + topo((venceu ? T('VITÓRIA') : emp ? T('EMPATE') : T('DERROTA')) + ' · ' + J.comp.nome + (J.comp.fase ? ' · ' + J.comp.fase : ''), false) +
      '<div class="lvVs"><div><img src="' + urlT(kc) + '" alt=""><b>' + escH(nomeT(kc)) + '</b></div><div class="x">' + placarCF[0] + ' x ' + placarCF[1] + (pen ? '<br><small style="font-size:12px">' + escH(Tf('Pênaltis: {0} x {1}', pen[0], pen[1])) + '</small>' : '') + '</div><div><img src="' + urlT(kf) + '" alt=""><b>' + escH(nomeT(kf)) + '</b></div></div>' +
      (r ? '<div class="lvOpc"><div class="lvCard"><h3><img src="' + urlT(kc) + '" alt="">' + escH(siglaT(kc)) + '</h3>' + lista(ladoC) + '</div><div class="lvCard"><h3><img src="' + urlT(kf) + '" alt="">' + escH(siglaT(kf)) + '</h3>' + lista(1 - ladoC) + '</div></div>' +
        '<p class="lvMsg">' + escH(Tf('Sua nota: {0}', (r.nota || 0).toFixed ? r.nota.toFixed(1) : r.nota)) + (r.gols ? ' · ' + escH(Tf('{0} gol(s)', r.gols)) : '') + '</p>' : '') +
      (extraHtml || '') + '<div class="lvBtns">' + (botoes || [['ok', 'Continuar', true]]).map(([a, n, prim]) => '<button type="button" class="pxBtn' + (prim ? ' pxPrim' : '') + '" data-a="' + a + '">' + escH(T(n)) + (prim ? ' ▶' : '') + '</button>').join('') + '</div></div>');
    await preto(false, 400);
    return (await escolha(el)).a;
  }

  // ============================================================================================ AMISTOSO, VÁRZEA, SINTÉTICO E FUTSAL
  const NOME_TIPO = { camp: 'Campeonato', copa: 'Copa', amistoso: 'Amistoso', varzea: 'Várzea', sintetico: 'Sintético', futsal: 'Futsal' };
  async function modoAvulso(tipo) {
    const grupos = tipo === 'varzea' ? [{ nome: 'Várzea', times: timesDiv('VZ') }] : GRUPOS_TODOS();
    let a = null, b = null;
    for (;;) {
      if (!a) { a = await escolherTime(T('Escolha o seu time'), grupos, null, T(NOME_TIPO[tipo])); if (!a) return; }
      if (!b) { b = await escolherTime(T('Escolha o adversário'), grupos, [a], Tf('O seu time: {0}', nomeT(a))); if (!b) { a = null; continue; } }
      const cfg = Object.assign(cfgSalva(), { estadio: 'casa' });
      const campo = tipo === 'amistoso' ? 'serieA' : tipo === 'sintetico' ? 'society' : tipo === 'futsal' ? 'futsal' : 'varzea';
      const nomeCampo = campo === 'serieA' ? nomeEstadio(modeloCasa(a)) : T(campo === 'society' ? 'Campo society (6 x 6)' : campo === 'futsal' ? 'Quadra de futsal (6 x 6)' : 'Campo de várzea');
      for (;;) {
        const res = await confronto({ a, b, casa: true, comp: T(NOME_TIPO[tipo]), info: T(campo === 'serieA' ? 'Amistoso' : NOME_TIPO[tipo]), estadio: nomeCampo, cfg, S: null, podeEstadio: tipo === 'amistoso' });
        if (!res) { b = null; break; }
        Object.assign(cfg, res.cfg);
        const modelo = campo === 'serieA' ? (res.cfg.estadio && res.cfg.estadio !== 'casa' ? res.cfg.estadio : modeloCasa(a)) : null;
        const J = { a, b, casa: true, campo, modelo, comp: { tipo: 'amistoso', nome: T(NOME_TIPO[tipo]) }, S: null, cfg: res.cfg, kits: res.kits, rodada: Math.floor(Math.random() * 7) };
        const r = await jogar(J);
        if (r && r.salvo) { guardarPausa(tipo, J, r.salvo); await avisoSalvo(); return; }   // (7.4.10) salvou no intervalo
        const pl = r ? r.placar : [0, 0];
        const acao = await telaResultado(J, pl, r, '', [['denovo', 'Jogar de novo', true], ['trocar', 'Trocar os times'], ['menu', 'Menu da partida livre']]);
        if (acao === 'menu') return;
        if (acao === 'trocar') { a = null; b = null; break; }
      }
    }
  }

  // ============================================================================================ O CAMPEONATO E A COPA (com o jogo salvo)
  const salvos = () => ler(CHAVE, {});
  const salvar = (tipo, S) => { const D0 = salvos(); if (S) D0[tipo] = S; else delete D0[tipo]; gravar(CHAVE, D0); };
  // (7.4.10) A PARTIDA SALVA NO INTERVALO: uma só (futebolJs.livre.v1.pausa). tipo: 'camp' | 'copa' | o tipo avulso
  //   ('amistoso', 'varzea', 'sintetico', 'futsal'); J: o jogo (sem o campeonato, que já está salvo à parte); ret: o estado do 2º tempo
  const pausa = () => salvos().pausa || null;
  function guardarPausa(tipo, J, ret, placar) {
    const D0 = salvos(), Jl = Object.assign({}, J); delete Jl.S; delete Jl.g;
    D0.pausa = { tipo, J: Jl, ret, placar: placar || [0, 0], quando: Date.now() }; gravar(CHAVE, D0);
  }
  function apagarPausa() { const D0 = salvos(); delete D0.pausa; gravar(CHAVE, D0); }
  const placarPausa = (P) => { const pl = (P.ret && P.ret.estado && P.ret.estado.placar) || [0, 0]; return P.J.casa ? pl : [pl[1], pl[0]]; };   // [casa, fora]
  async function modoTorneio(tipo) {
    let S = salvos()[tipo];
    if (S && S.v === 1) {
      const resumo = tipo === 'camp' ? Tf('{0} · {1} · rodada {2} de {3}', T(nomeDiv(S.div)), nomeT(S.nosso), Math.min(S.r + 1, S.rod.length), S.rod.length) : Tf('Copa do Brasil · {0} · {1}', nomeT(S.nosso), S.fim ? T('encerrada') : faseNome(S));
      const el = tela('<div class="lvCaixa">' + topo(T(tipo === 'camp' ? 'Campeonato salvo' : 'Copa salva')) + '<p class="lvMsg">' + escH(T('Você tem um jogo salvo. Quer continuar ou começar um novo?')) + '</p>' +
        '<div class="lvCard"><h3><img src="' + urlT(S.nosso) + '" alt="">' + escH(resumo) + '</h3></div>' +
        '<div class="lvBtns"><button type="button" class="pxBtn pxPrim" data-a="cont">' + escH(T('Continuar')) + ' ▶</button><button type="button" class="pxBtn" data-a="novo">' + escH(T('Começar um novo')) + '</button></div></div>');
      const r = await escolha(el);
      if (r.a === 'voltar') return;
      if (r.a === 'novo') { if (!(await confirmar(T('Começar um novo?'), T('O jogo salvo será apagado. Tem certeza?'), T('Sim, começar um novo'), T('Não')))) return modoTorneio(tipo); S = null; }
    } else S = null;
    if (!S) {
      // o país (Brasil; no campeonato, também Espanha e Inglaterra: 7.5.2), a liga, o formato e o time
      const bPais = (a, nome, desc, off) => '<button type="button" class="pxBtn lvTipo" ' + (off ? 'disabled' : 'data-a="' + a + '"') + '><b>' + escH(T(nome)) + '</b><small>' + escH(T(desc)) + '</small></button>';
      const el = tela('<div class="lvCaixa">' + topo(T('Escolha o país')) + '<div class="lvGrade">' + bPais('BR', 'Brasil', tipo === 'camp' ? 'Brasileirão A e Brasileirão B' : 'Copa do Brasil') +
        (tipo === 'camp' ? bPais('ES', 'Espanha', 'Liga Espanhola: 20 times, a elite do país') + bPais('EN', 'Inglaterra', 'Liga Inglesa: 20 times, a elite do país')
          : bPais('', 'Em breve', 'Outros países', true)) + '</div></div>');
      const pais = (await escolha(el)).a;
      if (pais !== 'BR' && !(tipo === 'camp' && (pais === 'ES' || pais === 'EN'))) return;
      if (tipo === 'camp') {
        let div = pais;
        if (pais === 'BR') {
          const e2 = tela('<div class="lvCaixa">' + topo(T('Escolha o campeonato')) + '<div class="lvGrade">' +
            '<button type="button" class="pxBtn lvTipo" data-a="A"><b>' + escH(T('Brasileirão A')) + '</b><small>' + escH(T('Os 20 melhores do país')) + '</small></button>' +
            '<button type="button" class="pxBtn lvTipo" data-a="B"><b>' + escH(T('Brasileirão B')) + '</b><small>' + escH(T('20 times brigando pelo acesso')) + '</small></button></div></div>');
          div = (await escolha(e2)).a; if (div !== 'A' && div !== 'B') return;
        }
        const e3 = tela('<div class="lvCaixa">' + topo(T('Formato')) + '<div class="lvGrade">' +
          '<button type="button" class="pxBtn lvTipo" data-a="rapido"><b>' + escH(T('Rápido')) + '</b><small>' + escH(T('19 rodadas: todos se enfrentam uma vez')) + '</small></button>' +
          '<button type="button" class="pxBtn lvTipo" data-a="padrao"><b>' + escH(T('Padrão')) + '</b><small>' + escH(T('38 rodadas: turno e returno, como o de verdade')) + '</small></button></div></div>');
        const fmt = (await escolha(e3)).a; if (fmt !== 'rapido' && fmt !== 'padrao') return;
        const k = await escolherTime(T('Escolha o seu time'), [{ nome: nomeDiv(div), times: timesDiv(div) }]); if (!k) return;
        S = novoCampeonato(div, fmt, k);
      } else {
        const k = await escolherTime(T('Escolha o seu time'), GRUPOS_BR(), null, T('32 times: os 20 do Brasileirão A e os 12 melhores do Brasileirão B (o seu sempre entra).')); if (!k) return;
        S = novaCopa(k);
      }
      salvar(tipo, S);
    }
    return tipo === 'camp' ? hubCamp(S) : hubCopa(S);
  }
  const verTabela = async (S) => { const el = tela('<div class="lvCaixa">' + topo(T(S.tipo === 'camp' ? 'Classificação' : 'Chave da copa')) + (S.tipo === 'camp' ? htmlTabela(S) : htmlChave(S)) + '</div>'); await escolha(el); };
  async function verArtilharia(S) {
    const L = (c) => artilharia(S, c, 10).map((x, i) => '<li' + (x.n === VOCE ? ' class="nos"' : '') + '><span>' + (i + 1) + '. ' + escH(nomeJog(S, x.n)) + ' <small>(' + escH(siglaT(x.k)) + ')</small></span><b>' + (c === 'a' ? x.a : x.g) + '</b></li>').join('') || '<li><span>—</span></li>';
    const el = tela('<div class="lvCaixa">' + topo(T('Artilharia')) + '<div class="lvOpc"><div class="lvCard"><h3>' + escH(T('Gols')) + '</h3><ul class="lvLista">' + L('g') + '</ul></div><div class="lvCard"><h3>' + escH(T('Assistências')) + '</h3><ul class="lvLista">' + L('a') + '</ul></div></div></div>');
    await escolha(el);
  }
  async function verDesfalques(S, adv) {
    const el = tela('<div class="lvCaixa">' + topo(T('Cartões e desfalques')) + '<p class="lvSub">' + escH(T('3 amarelos ou 1 vermelho: 1 jogo de suspensão. Lesão: fora pelos jogos indicados.')) + '</p><div class="lvOpc">' + cardDesfalques(S.nosso, S) + (adv ? cardDesfalques(adv, S) : '') + '</div></div>');
    await escolha(el);
  }
  // o seu jogo de hoje (do campeonato ou da copa) no formato J
  function jogoDeHoje(S) {
    if (S.tipo === 'camp') {
      const j = jogoDoNosso(S, S.r); if (!j) return null;
      const casa = j.c === S.nosso, adv = casa ? j.f : j.c, mand = j.c;
      return { a: S.nosso, b: adv, casa, campo: 'serieA', modelo: modeloCasa(mand), rodada: S.r, S, fogos: S.r === S.rod.length - 1,
        comp: { tipo: 'liga', nome: T(nomeDiv(S.div)), rodada: S.r + 1, fase: '', mataMata: false }, info: Tf('Rodada {0} de {1}', S.r + 1, S.rod.length) };
    }
    const g = jogoCopaNosso(S); if (!g) return null;
    const casa = g.c === S.nosso, adv = casa ? g.f : g.c, fin = S.fases[S.fases.length - 1].length === 1;
    return { a: S.nosso, b: adv, casa, neutro: !!g.neutro, campo: 'serieA', modelo: g.neutro || modeloCasa(g.c), rodada: S.fases.length + 1, S, fogos: fin, g,
      comp: { tipo: 'copa', nome: T('Copa do Brasil'), rodada: 0, fase: faseNome(S), mataMata: true }, info: faseNome(S) };
  }
  async function jogarDoTorneio(S, tipo) {
    const J0 = jogoDeHoje(S); if (!J0) return;
    const PZ = pausa(), retoma = PZ && PZ.tipo === tipo && PZ.J && PZ.J.a === J0.a && PZ.J.b === J0.b ? PZ : null;   // (7.4.10) o jogo salvo no intervalo
    if (PZ && PZ.tipo === tipo && !retoma) apagarPausa();                     // (o jogo salvo não é mais o de hoje)
    const fora = retoma ? null : foraDe(S, S.nosso).find((x) => x.n === VOCE);
    const cfg = Object.assign(cfgSalva(), { estadio: 'casa' });
    const res = retoma ? { cfg: retoma.J.cfg, kits: retoma.J.kits } : await confronto(Object.assign({}, J0, { cfg, comp: J0.comp.nome + (J0.comp.fase ? ' · ' + J0.comp.fase : ''), estadio: nomeEstadio(J0.modelo) + (J0.neutro ? ' (' + T('neutro') + ')' : ''), tabela: () => verTabela(S), tabelaNome: tipo === 'camp' ? 'Classificação' : 'Chave' }));
    if (!res) return;
    const J = Object.assign({}, J0, { cfg: res.cfg, kits: res.kits }); S.voceNome = voceDe(res.cfg).nome;
    let placarCF, r = null;
    if (fora) {
      await preto(true, 300);
      placarCF = await jogoSemVoce(J, Tf('Você está {0}: o jogo vai ser simulado. Acompanhe o placar.', motivoTxt(fora)));
      // o placar do "jogo sem você" vale: a súmula e os cartões simulados dos dois (quem estava suspenso cumpre o jogo)
      const kc = J.casa ? J.a : J.b, kf = J.casa ? J.b : J.a;
      sumulaSimulada(S, kc, placarCF[0], placarCF[1]); sumulaSimulada(S, kf, placarCF[1], placarCF[0]);
      fecharFichas(S, kc, cartoesSimulados(S, kc)); fecharFichas(S, kf, cartoesSimulados(S, kf));
      if (tipo === 'camp') { const i = S.times.indexOf(S.nosso), g = S.rod[S.r].find((x) => x[0] === i || x[1] === i); g[2] = placarCF[0]; g[3] = placarCF[1]; fecharRodada(S, S.r, null); }
      else { const g = J.g; g.gc = placarCF[0]; g.gf = placarCF[1]; if (g.gc === g.gf) g.pen = SBD._t.penaltis(g.c, g.f); J.pen = g.pen; fecharFaseCopa(S); }
    } else {
      if (retoma) apagarPausa();
      r = await jogar(J, retoma ? retoma.ret : null);
      if (r && r.salvo) { guardarPausa(tipo, J, r.salvo); await avisoSalvo(); return; }   // (7.4.10) salvou no intervalo: o campeonato fica parado neste jogo
      if (!r) { placarCF = SBD._t.simularPlacar(J.casa ? J.a : J.b, J.casa ? J.b : J.a, 1, 1); }
      else placarCF = J.casa ? [r.placar[0], r.placar[1]] : [r.placar[1], r.placar[0]];
      if (r) {
        sumulaJogada(S, [J.a, J.b], r);
        for (let t = 0; t < 2; t++) fecharFichas(S, t ? J.b : J.a, (r.jogaram || []).filter((p) => p.time === t && (p.amarelo || p.vermelho || p.lesao)).map((p) => ({ n: p.nome, amarelo: p.amarelo, vermelho: p.vermelho, lesao: p.lesao })));
      }
      S.jogosNosso++;
      if (tipo === 'camp') fecharRodada(S, S.r, placarCF);
      else { const g = J.g; g.gc = placarCF[0]; g.gf = placarCF[1]; if (r && r.penaltis) g.pen = J.casa ? r.penaltis.slice() : [r.penaltis[1], r.penaltis[0]]; else if (g.gc === g.gf) g.pen = SBD._t.penaltis(g.c, g.f); J.pen = g.pen; fecharFaseCopa(S); }
    }
    S.hist.push({ c: J.casa ? J.a : J.b, f: J.casa ? J.b : J.a, gc: placarCF[0], gf: placarCF[1], pen: J.pen || null });
    salvar(tipo, S);
    // o que aconteceu na rodada / na copa e quem vai ficar fora no próximo jogo
    let extra = '';
    if (tipo === 'camp') {
      const cl = classificacao(S), pos = cl.findIndex((x) => x.k === S.nosso) + 1;
      extra = '<div class="lvCard"><h3>' + escH(Tf('A rodada · você está em {0}º ({1} pts)', pos, cl[pos - 1].p)) + '</h3>' + htmlRodada(S, S.r - 1) + '</div>';
    } else {
      extra = '<div class="lvCard"><h3>' + escH(T('Copa do Brasil')) + '</h3><p>' + escH(S.fora ? T('Eliminados da copa.') : S.campeao === S.nosso ? T('CAMPEÕES!') : T('Classificados para a próxima fase!')) + '</p></div>';
    }
    const novos = foraDe(S, S.nosso);
    if (novos.length) extra += '<div class="lvCard"><h3>' + escH(T('Desfalques para o próximo jogo')) + '</h3><ul class="lvLista">' + novos.map((x) => '<li' + (x.n === VOCE ? ' class="nos"' : '') + '><span>' + escH(nomeJog(S, x.n)) + '</span><span>' + escH(motivoTxt(x)) + '</span></li>').join('') + '</ul></div>';
    await telaResultado(J, placarCF, r, extra);
  }
  async function hubCamp(S) {
    for (;;) {
      if (S.fim) { const a = await fimDoTorneio(S, 'camp'); if (a === 'novo') { salvar('camp', null); return modoTorneio('camp'); } return; }
      const J = jogoDeHoje(S), cl = classificacao(S), pos = cl.findIndex((x) => x.k === S.nosso) + 1;
      const adv = J ? J.b : null;
      const el = tela('<div class="lvCaixa">' + topo(T(nomeDiv(S.div)) + ' · ' + nomeT(S.nosso)) +
        '<p class="lvSub">' + escH(Tf('Rodada {0} de {1} · {2}º lugar · {3} pts', S.r + 1, S.rod.length, pos, cl[pos - 1].p)) + '</p>' +
        (J ? '<div class="lvCard"><h3>' + escH(T('Próximo jogo')) + '</h3><div class="lvVs"><div><img src="' + urlT(J.casa ? J.a : J.b) + '" alt=""><b>' + escH(nomeT(J.casa ? J.a : J.b)) + '</b><span class="lvTag">' + escH(T('CASA')) + '</span></div><div class="x">x</div><div><img src="' + urlT(J.casa ? J.b : J.a) + '" alt=""><b>' + escH(nomeT(J.casa ? J.b : J.a)) + '</b><span class="lvTag fora">' + escH(T('FORA')) + '</span></div></div><p style="text-align:center">' + escH(nomeEstadio(J.modelo)) + '</p></div>' : '') +
        '<div class="lvBtns"><button type="button" class="pxBtn pxPrim" data-a="jogar">' + escH(T(pausa() && pausa().tipo === 'camp' ? 'Continuar o 2º tempo' : 'Próximo jogo')) + ' ▶</button></div>' +
        '<div class="lvBtns"><button type="button" class="pxBtn" data-a="tab">' + escH(T('Classificação')) + '</button><button type="button" class="pxBtn" data-a="rod">' + escH(T('Última rodada')) + '</button>' +
        '<button type="button" class="pxBtn" data-a="art">' + escH(T('Artilharia')) + '</button><button type="button" class="pxBtn" data-a="des">' + escH(T('Cartões e desfalques')) + '</button></div></div>');
      const r = await escolha(el);
      if (r.a === 'voltar') return;
      if (r.a === 'jogar') { await jogarDoTorneio(S, 'camp'); continue; }
      if (r.a === 'tab') await verTabela(S);
      if (r.a === 'art') await verArtilharia(S);
      if (r.a === 'des') await verDesfalques(S, adv);
      if (r.a === 'rod') { const e2 = tela('<div class="lvCaixa">' + topo(S.r ? Tf('Rodada {0}', S.r) : T('Última rodada')) + (S.r ? htmlRodada(S, S.r - 1) : '<p class="lvMsg">' + escH(T('Nenhuma rodada jogada ainda.')) + '</p>') + '</div>'); await escolha(e2); }
    }
  }
  async function hubCopa(S) {
    for (;;) {
      if (S.fim) { const a = await fimDoTorneio(S, 'copa'); if (a === 'novo') { salvar('copa', null); return modoTorneio('copa'); } return; }
      const J = jogoDeHoje(S);
      const el = tela('<div class="lvCaixa">' + topo(T('Copa do Brasil') + ' · ' + nomeT(S.nosso)) + '<p class="lvSub">' + escH(faseNome(S)) + '</p>' +
        (J ? '<div class="lvCard"><h3>' + escH(T('Próximo jogo')) + '</h3><div class="lvVs"><div><img src="' + urlT(J.g.c) + '" alt=""><b>' + escH(nomeT(J.g.c)) + '</b><span class="lvTag' + (J.neutro ? ' neutro' : '') + '">' + escH(T(J.neutro ? 'NEUTRO' : 'CASA')) + '</span></div><div class="x">x</div><div><img src="' + urlT(J.g.f) + '" alt=""><b>' + escH(nomeT(J.g.f)) + '</b><span class="lvTag fora' + (J.neutro ? ' neutro' : '') + '">' + escH(T(J.neutro ? 'NEUTRO' : 'FORA')) + '</span></div></div><p style="text-align:center">' + escH(nomeEstadio(J.modelo)) + (J.neutro ? ' · ' + escH(T('final em campo neutro')) : '') + '</p></div>' : '') +
        '<div class="lvBtns"><button type="button" class="pxBtn pxPrim" data-a="jogar">' + escH(T(pausa() && pausa().tipo === 'copa' ? 'Continuar o 2º tempo' : 'Próximo jogo')) + ' ▶</button></div>' +
        '<div class="lvBtns"><button type="button" class="pxBtn" data-a="tab">' + escH(T('Chave da copa')) + '</button><button type="button" class="pxBtn" data-a="art">' + escH(T('Artilharia')) + '</button><button type="button" class="pxBtn" data-a="des">' + escH(T('Cartões e desfalques')) + '</button></div></div>');
      const r = await escolha(el);
      if (r.a === 'voltar') return;
      if (r.a === 'jogar') { await jogarDoTorneio(S, 'copa'); continue; }
      if (r.a === 'tab') await verTabela(S);
      if (r.a === 'art') await verArtilharia(S);
      if (r.a === 'des') await verDesfalques(S, J && J.b);
    }
  }

  // ============================================================================================ O FIM: a festa do título, a noite dos prêmios e o resumo
  function jogadoresDaFesta(S, k, cfgU) {
    const vc = voceDe(cfgU), E = titularesDe(S, k), pos = cfgU.pos || 'FWD';
    let iu = E.findIndex((j) => j.pos === pos); if (iu < 0) iu = E.length - 1;
    const livres = [2, 3, 4, 5, 6, 7, 8, 10, 11, 9, 14, 15].filter((n) => n !== vc.numero);
    return E.map((j, i) => (i === iu ? Object.assign({ pele: '#946042', cabelo: '#1C140F', estilo: 0 }, vc.aparencia || {}, { numero: vc.numero, nomeCamisa: (vc.aparencia && vc.aparencia.nomeCamisa) || '', voce: true, gk: j.pos === 'GK' })
      : Object.assign({}, j, { numero: j.pos === 'GK' ? 1 : livres.shift(), gk: j.pos === 'GK' })));
  }
  // a tela de título do jogo (startScreen) volta depois de cada partida e cobriria a festa e a gala (que acontecem no 3D)
  function semTitulo() { const st = document.getElementById('startScreen'); if (st) st.hidden = true; }
  async function festaTitulo(S, tipo) {
    try {
      const F = await Fases.carregar('festa'), k = S.nosso, t = TD(k), tm = SBD.timeMotor(t), cfgU = cfgSalva();
      const fin = tipo === 'copa' ? S.fases[S.fases.length - 1][0] : null;
      const J = { a: k, b: fin ? (fin.c === k ? fin.f : fin.c) : S.times.find((x) => x !== k), casa: true, campo: 'serieA', modelo: fin && fin.neutro ? fin.neutro : modeloCasa(k), S, fogos: true,
        comp: { tipo: tipo === 'copa' ? 'copa' : 'liga', nome: T(tipo === 'copa' ? 'Copa do Brasil' : nomeDiv(S.div)) }, cfg: Object.assign({}, cfgU, { horario: 'noite', clima: 'seco' }) };
      const cfg = montarCfg(J);
      esconder(); await preto(true, 300); semTitulo();
      await F.campeao({ cfg, lado: -1, uni: Object.assign({}, tm.uniforme, { emblema: tm.emblema }), jogadores: jogadoresDaFesta(S, k, cfgU), trofeu: tipo === 'copa' ? 'cdb' : S.div === 'B' ? 'serieb' : 'seriea', cores: [t.uni[0], t.uni[1]], io: { preto, esperar } });
    } catch (e) { console.error('[Livre] festa do título:', e); }
  }
  function listaPremios(S) {
    const P = premiosDe(S), vc = voceDe(cfgSalva()), out = [];
    for (const tp of ['art', 'ass', 'melhor']) {
      const x = P[tp]; if (!x) continue;
      const voce = x.n === VOCE, j = elencoT(x.k).find((e) => e.nome === x.n) || {};
      const ap = voce ? Object.assign({ genero: vc.genero === 'F' ? 'F' : 'M', pele: '#946042', cabelo: '#1C140F', estilo: 0 }, vc.aparencia || {}) : Object.assign({ genero: 'M' }, j);
      out.push({ tipo: tp, nome: voce ? vc.nome : x.n, time: nomeT(x.k), k: x.k, ap, voce, v: x.v, voz: voce ? 2 : 3 });
    }
    return out;
  }
  async function galaPremios(S, tipo) {
    try {
      const lista = listaPremios(S); if (!lista.length) return;
      const F = await Fases.carregar('festa');
      esconder(); await preto(true, 300); semTitulo();
      await F.gala({ nivel: tipo === 'camp' && S.div === 'B' ? 'serieb' : 'seriea', titulo: tipo === 'copa' ? T('PRÊMIOS DA COPA DO BRASIL') : S.div === 'ES' ? T('PRÊMIOS DA LIGA ESPANHOLA') : S.div === 'EN' ? T('PRÊMIOS DA LIGA INGLESA') : S.div === 'A' ? T('PRÊMIOS DO BRASILEIRÃO A') : T('PRÊMIOS DO BRASILEIRÃO B'),
        saudacao: tipo === 'copa' ? T('Boa noite! Bem-vindos à festa de premiação da Copa do Brasil!') : S.div === 'ES' ? T('Boa noite! Bem-vindos à festa de premiação da Liga Espanhola!') : S.div === 'EN' ? T('Boa noite! Bem-vindos à festa de premiação da Liga Inglesa!') : null, premios: lista, io: { preto, esperar } });
    } catch (e) { console.error('[Livre] noite dos prêmios:', e); }
  }
  async function fimDoTorneio(S, tipo) {
    const campeao = tipo === 'camp' ? classificacao(S)[0].k : S.campeao;
    if (campeao === S.nosso && !S.festa) { S.festa = true; salvar(tipo, S); await festaTitulo(S, tipo); }
    if (!S.gala) { S.gala = true; salvar(tipo, S); await galaPremios(S, tipo); }
    const P = listaPremios(S), pos = tipo === 'camp' ? classificacao(S).findIndex((x) => x.k === S.nosso) + 1 : 0;
    const campanha = tipo === 'camp' ? Tf('O seu time terminou em {0}º lugar.', pos) : campeao === S.nosso ? T('O seu time é o campeão!') : Tf('O seu time caiu na fase: {0}.', T(FASES_COPA[S.hist.length - 1] || FASES_COPA[0]));
    const NOMEP = { art: 'Artilheiro', ass: 'Líder de assistências', melhor: 'Melhor jogador' };
    for (;;) {
      const el = tela('<div class="lvCaixa">' + topo(T(tipo === 'camp' ? nomeDiv(S.div) : 'Copa do Brasil') + ' · ' + T('Fim'), true) +
        '<div class="lvVs"><div><img src="' + urlT(campeao) + '" alt="" style="width:88px;height:88px"><b>' + escH(T('CAMPEÃO')) + '</b><b>' + escH(nomeT(campeao)) + '</b></div></div>' +
        '<p class="lvMsg" style="text-align:center">' + escH(campanha) + '</p>' +
        '<div class="lvCard"><h3>' + escH(T('Prêmios individuais')) + '</h3><ul class="lvLista">' + (P.map((x) => '<li' + (x.voce ? ' class="nos"' : '') + '><span>' + escH(T(NOMEP[x.tipo])) + '</span><span><b>' + escH(x.nome) + '</b> · ' + escH(x.time) + ' · ' + escH(x.tipo === 'art' ? Tf('{0} gols', x.v) : x.tipo === 'ass' ? Tf('{0} assistências', x.v) : Tf('nota média {0}', (+x.v).toFixed(1))) + '</span></li>').join('') || '<li><span>—</span></li>') + '</ul></div>' +
        '<div class="lvBtns"><button type="button" class="pxBtn" data-a="tab">' + escH(T(tipo === 'camp' ? 'Classificação' : 'Chave da copa')) + '</button><button type="button" class="pxBtn" data-a="art">' + escH(T('Artilharia')) + '</button>' +
        '<button type="button" class="pxBtn" data-a="gala">' + escH(T('Ver a premiação de novo')) + '</button><button type="button" class="pxBtn pxPrim" data-a="novo">' + escH(T('Começar um novo')) + '</button></div></div>');
      await preto(false, 400);
      const r = await escolha(el);
      if (r.a === 'voltar') return 'voltar';
      if (r.a === 'novo') return 'novo';
      if (r.a === 'tab') await verTabela(S);
      if (r.a === 'art') await verArtilharia(S);
      if (r.a === 'gala') { await galaPremios(S, tipo); jogouNaSessao = true; }
    }
  }

  // ============================================================================================ (7.4.10) A PARTIDA SALVA NO INTERVALO
  async function avisoSalvo() {
    const el = tela('<div class="lvCaixa">' + topo(T('Partida salva'), false) + '<p class="lvMsg">' + escH(T('A partida ficou salva no intervalo. Para jogar o 2º tempo, abra a partida livre e toque em "Continuar o 2º tempo".')) + '</p>' +
      '<div class="lvBtns"><button type="button" class="pxBtn pxPrim" data-a="ok">' + escH(T('Entendi')) + '</button></div></div>');
    await preto(false, 400);
    await escolha(el);
  }
  async function retomarPausa() {
    const PZ = pausa(); if (!PZ || !PZ.J) return;
    if (PZ.tipo === 'camp' || PZ.tipo === 'copa') {                        // o campeonato/a copa: o hub joga o jogo salvo
      const S = salvos()[PZ.tipo]; if (!S) { apagarPausa(); return; }
      return PZ.tipo === 'camp' ? hubCamp(S) : hubCopa(S);
    }
    const J = Object.assign({}, PZ.J, { S: null });
    apagarPausa();
    const r = await jogar(J, PZ.ret);
    if (r && r.salvo) { guardarPausa(PZ.tipo, J, r.salvo); return avisoSalvo(); }
    await telaResultado(J, r ? r.placar : [0, 0], r, '', [['ok', 'Menu da partida livre', true]]);
  }

  // ============================================================================================ O MENU DA PARTIDA LIVRE
  async function menuTipos() {
    const D0 = salvos(), PZ = D0.pausa;
    const item = (a, nome, desc, selo) => '<button type="button" class="pxBtn lvTipo" data-a="' + a + '">' + (selo ? '<span class="lvSelo">' + escH(T('SALVO')) + '</span>' : '') + '<b>' + escH(T(nome)) + '</b><small>' + escH(T(desc)) + '</small></button>';
    let cont = '';
    if (PZ && PZ.J) {                                                    // (7.4.10) a partida salva no intervalo
      const kc = PZ.J.casa ? PZ.J.a : PZ.J.b, kf = PZ.J.casa ? PZ.J.b : PZ.J.a, pl = placarPausa(PZ);
      cont = '<div class="lvCard lvPausa"><h3><img src="' + urlT(kc) + '" alt="">' + escH(siglaT(kc) + ' ' + pl[0] + ' x ' + pl[1] + ' ' + siglaT(kf)) + '<img src="' + urlT(kf) + '" alt=""></h3>' +
        '<p>' + escH(Tf('Partida salva no intervalo · {0}', T(NOME_TIPO[PZ.tipo] || PZ.tipo))) + '</p><div class="lvBtns"><button type="button" class="pxBtn pxPrim" data-a="retomar">' + escH(T('Continuar o 2º tempo')) + ' ▶</button>' +
        '<button type="button" class="pxBtn" data-a="descartar">' + escH(T('Descartar')) + '</button></div></div>';
    }
    const el = tela('<div class="lvCaixa">' + topo(T('Partida livre')) + cont + '<p class="lvSub">' + escH(T('Escolha o tipo de jogo.')) + '</p><div class="lvGrade">' +
      item('camp', 'Campeonato', 'Brasil (Brasileirão A ou B), Espanha ou Inglaterra: rápido (19 rodadas) ou padrão (38). Fica salvo.', !!D0.camp) +
      item('copa', 'Copa', 'Copa do Brasil: 32 times, mata-mata e a final num estádio grande. Fica salva.', !!D0.copa) +
      item('amistoso', 'Amistoso', 'Um jogo entre quaisquer times do Brasil, da Espanha e da Inglaterra, no estádio que você quiser.') +
      item('varzea', 'Várzea', 'Os times do Campeonato de Várzea, no campo de terra da cidadezinha.') +
      item('sintetico', 'Sintético', 'Os clubes do Brasil, da Espanha e da Inglaterra no society (6 x 6).') +
      item('futsal', 'Futsal', 'Os clubes do Brasil, da Espanha e da Inglaterra na quadra (6 x 6).') + '</div></div>');
    return (await escolha(el)).a;
  }
  // (7.4.13) depois do tipo de jogo: controlar UM jogador (o de sempre) ou o TIME INTEIRO. Fica guardado (e dá para mudar
  //   nas configurações do confronto).
  async function escolherControle(tipo) {
    const c = cfgSalva();
    const item = (a, nome, desc, on) => '<button type="button" class="pxBtn lvTipo' + (on ? ' on' : '') + '" data-a="' + a + '"><b>' + escH(T(nome)) + '</b><small>' + escH(T(desc)) + '</small></button>';
    const el = tela('<div class="lvCaixa">' + topo(T('Como você quer jogar?')) + '<p class="lvSub">' + escH(T(NOME_TIPO[tipo] || '') + ' · ' + T('Dá para mudar depois nas configurações da partida.')) + '</p><div class="lvGrade">' +
      item('um', 'Controlar um jogador', 'Você controla só o seu personagem, na posição escolhida. Os outros do time jogam sozinhos.', c.controle !== 'time') +
      item('time', 'Controlar o time inteiro', 'Você controla quem está com a bola ou mais perto dela, e o botão TROCAR passa para outro. O goleiro joga sozinho.', c.controle === 'time') + '</div></div>');
    const r = (await escolha(el)).a;
    if (r !== 'um' && r !== 'time') return null;
    gravar(CHAVE_CFG, Object.assign(cfgSalva(), { controle: r }));
    return r;
  }
  let aberto = false;
  async function abrir() {
    if (aberto) return; aberto = true;
    try {
      tela('<div class="lvCaixa"><p class="lvMsg">' + escH(T('Carregando')) + '…</p></div>');
      if (!SBD) SBD = (await Fases.carregar('serieb')).dados;
      if (!VZD) try { VZD = (await Fases.carregar('varzea')).dados; } catch (e) { console.warn('[Livre] várzea:', e); }
      for (;;) {
        const a = await menuTipos();
        if (a === 'voltar') break;
        if (a === 'descartar') { if (await confirmar(T('Descartar a partida salva?'), T('O 2º tempo dela não vai poder ser jogado.'), T('Sim, descartar'), T('Não'))) apagarPausa(); continue; }
        if (a !== 'retomar' && !(await escolherControle(a))) continue;   // (7.4.13) um jogador ou o time inteiro
        try { if (a === 'retomar') await retomarPausa(); else if (a === 'camp' || a === 'copa') await modoTorneio(a); else await modoAvulso(a); }
        catch (e) { console.error('[Livre]', e); try { await preto(false, 200); } catch (e2) { /* nada */ } }
      }
    } finally { aberto = false; }
    if (jogouNaSessao) { location.reload(); return; }                  // já teve jogo: o menu inicial volta limpo
    esconder();
  }

  // ============================================================================================ OS TEXTOS (en, es, it, fr)
  const TRAD = {
    // (7.4.13) um jogador ou o time inteiro
    "Controle": ["Control", "Control", "Controllo", "Contrôle"],
    "Um jogador": ["One player", "Un jugador", "Un giocatore", "Un joueur"],
    "Time inteiro": ["Whole team", "Todo el equipo", "Tutta la squadra", "Toute l'équipe"],
    "Um jogador: só você (na posição escolhida). Time inteiro: você controla quem está com a bola ou mais perto dela (o goleiro joga sozinho).": ["One player: just you (in the position you chose). Whole team: you control whoever has the ball or is closest to it (the keeper plays on his own).", "Un jugador: solo tú (en la posición elegida). Todo el equipo: controlas a quien tiene el balón o está más cerca de él (el portero juega solo).", "Un giocatore: solo tu (nel ruolo scelto). Tutta la squadra: controlli chi ha la palla o è più vicino (il portiere gioca da sé).", "Un joueur : seulement ton personnage (au poste choisi). Toute l'équipe : tu contrôles celui qui a le ballon ou qui en est le plus près (le gardien joue seul)."],
    "Como você quer jogar?": ["How do you want to play?", "¿Cómo quieres jugar?", "Come vuoi giocare?", "Comment veux-tu jouer ?"],
    "Dá para mudar depois nas configurações da partida.": ["You can change it later in the match settings.", "Puedes cambiarlo después en la configuración del partido.", "Puoi cambiarlo dopo nelle impostazioni della partita.", "Tu pourras le changer plus tard dans les réglages du match."],
    "Controlar um jogador": ["Control one player", "Controlar un jugador", "Controlla un giocatore", "Contrôler un joueur"],
    "Você controla só o seu personagem, na posição escolhida. Os outros do time jogam sozinhos.": ["You control only your character, in the position you chose. The rest of the team plays on its own.", "Controlas solo a tu personaje, en la posición elegida. El resto del equipo juega solo.", "Controlli solo il tuo personaggio, nel ruolo scelto. Il resto della squadra gioca da sé.", "Tu contrôles seulement ton personnage, au poste choisi. Le reste de l'équipe joue tout seul."],
    "Controlar o time inteiro": ["Control the whole team", "Controlar todo el equipo", "Controlla tutta la squadra", "Contrôler toute l'équipe"],
    "Você controla quem está com a bola ou mais perto dela, e o botão TROCAR passa para outro. O goleiro joga sozinho.": ["You control whoever has the ball or is closest to it, and the SWITCH button passes control to another. The keeper plays on his own.", "Controlas a quien tiene el balón o está más cerca de él, y el botón CAMBIAR pasa a otro. El portero juega solo.", "Controlli chi ha la palla o è più vicino, e il tasto CAMBIA passa a un altro. Il portiere gioca da sé.", "Tu contrôles celui qui a le ballon ou qui en est le plus près, et le bouton CHANGER passe à un autre. Le gardien joue seul."],
    // (7.4.10) a bola, as comemorações, os uniformes no confronto e a partida salva no intervalo
    'Bola': ['Ball', 'Pelota', 'Pallone', 'Ballon'], 'Comemoração 1': ['Celebration 1', 'Celebración 1', 'Esultanza 1', 'Célébration 1'], 'Comemoração 2': ['Celebration 2', 'Celebración 2', 'Esultanza 2', 'Célébration 2'],
    'Bola padrão': ['Standard ball', 'Pelota estándar', 'Pallone standard', 'Ballon standard'],
    'As duas comemorações do gol (os dois botões que aparecem depois de marcar).': ['Your two goal celebrations (the two buttons that show up after you score).', 'Tus dos celebraciones de gol (los dos botones que aparecen después de marcar).', 'Le tue due esultanze (i due pulsanti che compaiono dopo il gol).', 'Tes deux célébrations de but (les deux boutons qui apparaissent après avoir marqué).'],
    'A bola da partida (as bolas premium da loja também).': ['The match ball (the premium balls from the shop too).', 'La pelota del partido (también las premium de la tienda).', 'Il pallone della partita (anche quelli premium del negozio).', 'Le ballon du match (les ballons premium de la boutique aussi).'],
    'Uniforme {0}': ['Kit {0}', 'Uniforme {0}', 'Divisa {0}', 'Maillot {0}'],
    'Continuar o 2º tempo': ['Play the 2nd half', 'Jugar el 2.º tiempo', 'Gioca il 2º tempo', 'Jouer la 2e mi-temps'],
    'Partida salva no intervalo · {0}': ['Match saved at half-time · {0}', 'Partido guardado en el descanso · {0}', "Partita salvata all'intervallo · {0}", 'Match sauvegardé à la mi-temps · {0}'],
    'Descartar': ['Discard', 'Descartar', 'Scarta', 'Abandonner'], 'Descartar a partida salva?': ['Discard the saved match?', '¿Descartar el partido guardado?', 'Scartare la partita salvata?', 'Abandonner le match sauvegardé ?'],
    'O 2º tempo dela não vai poder ser jogado.': ['Its 2nd half will not be playable.', 'Su 2.º tiempo no se podrá jugar.', 'Il suo 2º tempo non potrà essere giocato.', 'Sa 2e mi-temps ne pourra pas être jouée.'],
    'Sim, descartar': ['Yes, discard', 'Sí, descartar', 'Sì, scarta', 'Oui, abandonner'], 'Partida salva': ['Match saved', 'Partido guardado', 'Partita salvata', 'Match sauvegardé'],
    'A partida ficou salva no intervalo. Para jogar o 2º tempo, abra a partida livre e toque em "Continuar o 2º tempo".': ['The match was saved at half-time. To play the 2nd half, open the quick match and tap "Play the 2nd half".', 'El partido quedó guardado en el descanso. Para jugar el 2.º tiempo, abre el partido libre y toca "Jugar el 2.º tiempo".', 'La partita è stata salvata all\'intervallo. Per giocare il 2º tempo, apri la partita libera e tocca "Gioca il 2º tempo".', 'Le match a été sauvegardé à la mi-temps. Pour jouer la 2e mi-temps, ouvre le match libre et touche « Jouer la 2e mi-temps ».'],
    'Entendi': ['Got it', 'Entendido', 'Ho capito', "J'ai compris"],
    'Clássica Ouro': ['Gold Classic', 'Clásica Oro', 'Classica Oro', 'Classique Or'], 'Hélice Tricolor': ['Tricolor Helix', 'Hélice Tricolor', 'Elica Tricolore', 'Hélice Tricolore'],
    'Oceano Profundo': ['Deep Ocean', 'Océano Profundo', 'Oceano Profondo', 'Océan Profond'], 'Raio Neon': ['Neon Bolt', 'Rayo Neón', 'Fulmine Neon', 'Éclair Néon'],
    'Chamas': ['Flames', 'Llamas', 'Fiamme', 'Flammes'], 'Carnaval': ['Carnival', 'Carnaval', 'Carnevale', 'Carnaval'], 'Mármore Real': ['Royal Marble', 'Mármol Real', 'Marmo Reale', 'Marbre Royal'], 'Galáxia': ['Galaxy', 'Galaxia', 'Galassia', 'Galaxie'],
    'Onça Pintada': ['Jaguar', 'Jaguar', 'Giaguaro', 'Jaguar'], 'Diamante Azul': ['Blue Diamond', 'Diamante Azul', 'Diamante Blu', 'Diamant Bleu'],
    'Rubi Imperial': ['Imperial Ruby', 'Rubí Imperial', 'Rubino Imperiale', 'Rubis Impérial'], 'Lenda Negra': ['Black Legend', 'Leyenda Negra', 'Leggenda Nera', 'Légende Noire'],
    "Vestiário": ["Locker room", "Vestuario", "Spogliatoio", "Vestiaire"],
    "19 rodadas: todos se enfrentam uma vez": ["19 rounds: everyone plays each other once", "19 jornadas: todos se enfrentan una vez", "19 giornate: tutti si affrontano una volta", "19 journées : tout le monde s'affronte une fois"],
    "20 times brigando pelo acesso": ["20 teams fighting for promotion", "20 equipos luchando por el ascenso", "20 squadre in lotta per la promozione", "20 équipes qui luttent pour la montée"],
    "3 amarelos ou 1 vermelho: 1 jogo de suspensão. Lesão: fora pelos jogos indicados.": ["3 yellows or 1 red: a 1-match ban. Injury: out for the matches shown.", "3 amarillas o 1 roja: 1 partido de sanción. Lesión: fuera los partidos indicados.", "3 gialli o 1 rosso: 1 giornata di squalifica. Infortunio: fuori per le partite indicate.", "3 jaunes ou 1 rouge : 1 match de suspension. Blessure : absent pour les matchs indiqués."],
    "32 times: os 20 do Brasileirão A e os 12 melhores do Brasileirão B (o seu sempre entra).": ["32 teams: the 20 from Brasileirão A and the 12 best from Brasileirão B (yours always gets in).", "32 equipos: los 20 del Brasileirão A y los 12 mejores del Brasileirão B (el tuyo siempre entra).", "32 squadre: le 20 del Brasileirão A e le 12 migliori del Brasileirão B (la tua entra sempre).", "32 équipes : les 20 du Brasileirão A et les 12 meilleures du Brasileirão B (la tienne entre toujours)."],
    "38 rodadas: turno e returno, como o de verdade": ["38 rounds: home and away, like the real one", "38 jornadas: ida y vuelta, como el de verdad", "38 giornate: andata e ritorno, come quello vero", "38 journées : aller et retour, comme le vrai"],
    "A cena antes do jogo: o estádio, o ônibus, o vestiário, a torcida e a entrada em campo.": ["The scene before the match: the stadium, the bus, the locker room, the crowd and the walk onto the pitch.", "La escena antes del partido: el estadio, el autobús, el vestuario, la afición y la salida al campo.", "La scena prima della partita: lo stadio, il pullman, lo spogliatoio, i tifosi e l'ingresso in campo.", "La scène avant le match : le stade, le bus, le vestiaire, les supporters et l'entrée sur le terrain."],
    "A rodada · você está em {0}º ({1} pts)": ["The round · you are {0}th ({1} pts)", "La jornada · estás {0}º ({1} pts)", "La giornata · sei {0}º ({1} pt)", "La journée · tu es {0}e ({1} pts)"],
    "A torcida do {0} faz a festa": ["The {0} fans are partying", "La afición del {0} hace la fiesta", "I tifosi del {0} fanno festa", "Les supporters de {0} font la fête"],
    "Abertura": ["Opening", "Apertura", "Apertura", "Ouverture"],
    "Acesso ao Brasileirão A": ["Promotion to Brasileirão A", "Ascenso al Brasileirão A", "Promozione nel Brasileirão A", "Montée au Brasileirão A"],
    "Adiantar": ["Fast-forward", "Adelantar", "Avanti veloce", "Avancer"],
    "Automático": ["Automatic", "Automático", "Automatico", "Automatique"],
    "Automático: o horário do jogo (o campeonato varia entre dia, tarde e noite).": ["Automatic: the match's own time (the league varies between day, afternoon and night).", "Automático: el horario del partido (el campeonato varía entre día, tarde y noche).", "Automatico: l'orario della partita (il campionato varia tra giorno, pomeriggio e sera).", "Automatique : l'heure du match (le championnat varie entre jour, après-midi et soir)."],
    "Boa noite! Bem-vindos à festa de premiação da Copa do Brasil!": ["Good evening! Welcome to the Copa do Brasil awards night!", "¡Buenas noches! ¡Bienvenidos a la gala de premios de la Copa do Brasil!", "Buonasera! Benvenuti alla serata dei premi della Copa do Brasil!", "Bonsoir ! Bienvenue à la soirée des prix de la Copa do Brasil !"],
    "Brasil": ["Brazil", "Brasil", "Brasile", "Brésil"],
    "CAMPEÃO": ["CHAMPION", "CAMPEÓN", "CAMPIONE", "CHAMPION"],
    "Campeonato": ["League", "Campeonato", "Campionato", "Championnat"],
    "Campeonato salvo": ["Saved league", "Campeonato guardado", "Campionato salvato", "Championnat sauvegardé"],
    "Campo de várzea": ["Dirt pitch", "Campo de barrio", "Campo di periferia", "Terrain de quartier"],
    "Campo society (5 x 5)": ["Small-sided pitch (5 v 5)", "Campo de fútbol 5 (5 x 5)", "Campo a 5 (5 x 5)", "Terrain de foot à 5 (5 x 5)"],
    "Campo society (6 x 6)": ["Small-sided pitch (6 v 6)", "Campo de fútbol 6 (6 x 6)", "Campo a 6 (6 x 6)", "Terrain de foot à 6 (6 x 6)"], "Quadra de futsal (6 x 6)": ["Futsal court (6 v 6)", "Cancha de futsal (6 x 6)", "Campo da futsal (6 x 6)", "Terrain de futsal (6 x 6)"],   // (7.4.19)
    "Cartões e desfalques": ["Cards and absentees", "Tarjetas y bajas", "Cartellini e assenti", "Cartons et absents"],
    "Chave": ["Bracket", "Cuadro", "Tabellone", "Tableau"],
    "Começar um novo": ["Start a new one", "Empezar uno nuevo", "Iniziarne uno nuovo", "En commencer un nouveau"],
    "Começar um novo?": ["Start a new one?", "¿Empezar uno nuevo?", "Iniziarne uno nuovo?", "En commencer un nouveau ?"],
    "Completa": ["Full", "Completa", "Completa", "Complète"],
    "Configurações da partida": ["Match settings", "Ajustes del partido", "Impostazioni della partita", "Réglages du match"],
    "Copa": ["Cup", "Copa", "Coppa", "Coupe"],
    "Copa do Brasil · {0} · {1}": ["Copa do Brasil · {0} · {1}", "Copa do Brasil · {0} · {1}", "Copa do Brasil · {0} · {1}", "Copa do Brasil · {0} · {1}"],
    "Copa do Brasil: 32 times, mata-mata e a final num estádio grande. Fica salva.": ["Copa do Brasil: 32 teams, knockout and the final in a big stadium. It is saved.", "Copa do Brasil: 32 equipos, eliminatorias y la final en un estadio grande. Se guarda.", "Copa do Brasil: 32 squadre, eliminazione diretta e la finale in un grande stadio. Viene salvata.", "Copa do Brasil : 32 équipes, élimination directe et la finale dans un grand stade. Elle est sauvegardée."],
    "Copa salva": ["Saved cup", "Copa guardada", "Coppa salvata", "Coupe sauvegardée"],
    "Desfalques": ["Absentees", "Bajas", "Assenti", "Absents"],
    "Desfalques para o próximo jogo": ["Absentees for the next match", "Bajas para el próximo partido", "Assenti per la prossima partita", "Absents pour le prochain match"],
    "Do time da casa": ["The home team's", "El del equipo local", "Quello della squadra di casa", "Celui de l'équipe à domicile"],
    "Duração": ["Length", "Duración", "Durata", "Durée"],
    "Em breve": ["Coming soon", "Próximamente", "Prossimamente", "Bientôt"],
    "Escolha o adversário": ["Choose the opponent", "Elige el rival", "Scegli l'avversario", "Choisis l'adversaire"],
    "Escolha o campeonato": ["Choose the league", "Elige el campeonato", "Scegli il campionato", "Choisis le championnat"],
    "Escolha o país": ["Choose the country", "Elige el país", "Scegli il paese", "Choisis le pays"],
    "Escolha o seu time": ["Choose your team", "Elige tu equipo", "Scegli la tua squadra", "Choisis ton équipe"],
    "Escolha o tipo de jogo.": ["Choose the type of game.", "Elige el tipo de juego.", "Scegli il tipo di partita.", "Choisis le type de jeu."],
    "Estádio": ["Stadium", "Estadio", "Stadio", "Stade"],
    "Fim": ["End", "Fin", "Fine", "Fin"],
    "Formato": ["Format", "Formato", "Formato", "Format"],
    "Futsal": ["Futsal", "Fútbol sala", "Calcio a 5", "Futsal"],
    "Gol contra": ["Own goal", "Gol en contra", "Autogol", "But contre son camp"],
    "JOGAR": ["PLAY", "JUGAR", "GIOCA", "JOUER"],
    "Libertadores": ["Libertadores", "Libertadores", "Libertadores", "Libertadores"],
    "Menu da partida livre": ["Quick match menu", "Menú del partido libre", "Menu della partita libera", "Menu du match libre"],
    "NEUTRO": ["NEUTRAL", "NEUTRAL", "NEUTRO", "NEUTRE"],
    "Nenhum desfalque.": ["No absentees.", "Ninguna baja.", "Nessun assente.", "Aucun absent."],
    "Nenhuma rodada jogada ainda.": ["No round played yet.", "Todavía no se jugó ninguna jornada.", "Nessuna giornata ancora giocata.", "Aucune journée jouée pour l'instant."],
    "No vestiário, {0} passa as últimas instruções": ["In the locker room, {0} gives the final instructions", "En el vestuario, {0} da las últimas instrucciones", "Nello spogliatoio, {0} dà le ultime istruzioni", "Au vestiaire, {0} donne les dernières consignes"],
    "Não": ["No", "No", "No", "Non"],
    "O hino e a foto: os times perfilados": ["The anthem and the photo: the teams lined up", "El himno y la foto: los equipos alineados", "L'inno e la foto: le squadre schierate", "L'hymne et la photo : les équipes alignées"],
    "O jogo salvo será apagado. Tem certeza?": ["The saved game will be deleted. Are you sure?", "La partida guardada se borrará. ¿Estás seguro?", "La partita salvata verrà cancellata. Sei sicuro?", "La partie sauvegardée sera effacée. Tu es sûr ?"],
    "O seu time caiu na fase: {0}.": ["Your team went out in: {0}.", "Tu equipo cayó en: {0}.", "La tua squadra è uscita in: {0}.", "Ton équipe a été éliminée en : {0}."],
    "O seu time terminou em {0}º lugar.": ["Your team finished {0}th.", "Tu equipo terminó en el {0}º lugar.", "La tua squadra ha chiuso al {0}º posto.", "Ton équipe a terminé {0}e."],
    "O seu time é o campeão!": ["Your team is the champion!", "¡Tu equipo es el campeón!", "La tua squadra è campione!", "Ton équipe est championne !"],
    "O seu time: {0}": ["Your team: {0}", "Tu equipo: {0}", "La tua squadra: {0}", "Ton équipe : {0}"],
    "O ônibus do {0} chega ao estádio": ["The {0} bus arrives at the stadium", "El autobús del {0} llega al estadio", "Il pullman del {0} arriva allo stadio", "Le bus de {0} arrive au stade"],
    "Os 20 melhores do país": ["The country's 20 best", "Los 20 mejores del país", "Le 20 migliori del paese", "Les 20 meilleures du pays"],
    "Os clubes da A e da B na quadra (5 x 5).": ["The Brasileirão A and B clubs on the court (5 v 5).", "Los clubes de la A y de la B en la cancha (5 x 5).", "I club della A e della B sul campo indoor (5 x 5).", "Les clubs de A et de B sur le terrain en salle (5 x 5)."],
    "Os clubes da A e da B na quadra (6 x 6).": ["The Brasileirão A and B clubs on the court (6 v 6).", "Los clubes de la A y de la B en la cancha (6 x 6).", "I club della A e della B sul campo indoor (6 x 6).", "Les clubs de A et de B sur le terrain en salle (6 x 6)."],
    "Os clubes da A e da B no society (5 x 5).": ["The Brasileirão A and B clubs on the small-sided pitch (5 v 5).", "Los clubes de la A y de la B en fútbol 5 (5 x 5).", "I club della A e della B nel calcio a 5 su erba (5 x 5).", "Les clubs de A et de B en foot à 5 (5 x 5)."],
    "Os clubes da A e da B no society (6 x 6).": ["The Brasileirão A and B clubs on the small-sided pitch (6 v 6).", "Los clubes de la A y de la B en fútbol 6 (6 x 6).", "I club della A e della B nel calcio a 6 su erba (6 x 6).", "Les clubs de A et de B en foot à 6 (6 x 6)."],
    "Os times do Campeonato de Várzea, no campo de terra da cidadezinha.": ["The amateur league teams, on the little town's dirt pitch.", "Los equipos del campeonato de barrio, en el campo de tierra del pueblito.", "Le squadre del campionato di periferia, sul campo in terra del paesino.", "Les équipes du championnat de quartier, sur le terrain en terre de la petite ville."],
    "Outros países": ["Other countries", "Otros países", "Altri paesi", "Autres pays"],
    "PRÊMIOS DA COPA DO BRASIL": ["COPA DO BRASIL AWARDS", "PREMIOS DE LA COPA DO BRASIL", "PREMI DELLA COPA DO BRASIL", "PRIX DE LA COPA DO BRASIL"],
    "Pendurados (2 amarelos): {0}": ["One booking from a ban (2 yellows): {0}", "Al límite (2 amarillas): {0}", "Diffidati (2 gialli): {0}", "Sous la menace (2 jaunes) : {0}"],
    "Personagem": ["Character", "Personaje", "Personaggio", "Personnage"],
    "Pré-Libertadores": ["Libertadores qualifiers", "Previa de la Libertadores", "Preliminari Libertadores", "Barrages Libertadores"],
    "Prêmios individuais": ["Individual awards", "Premios individuales", "Premi individuali", "Prix individuels"],
    "Próximo jogo": ["Next match", "Próximo partido", "Prossima partita", "Prochain match"],
    "Rebaixamento": ["Relegation", "Descenso", "Retrocessione", "Relégation"],
    "Rodada {0}": ["Round {0}", "Jornada {0}", "Giornata {0}", "Journée {0}"],
    "Rodada {0} de {1}": ["Round {0} of {1}", "Jornada {0} de {1}", "Giornata {0} di {1}", "Journée {0} sur {1}"],
    "Rodada {0} de {1} · {2}º lugar · {3} pts": ["Round {0} of {1} · {2}th place · {3} pts", "Jornada {0} de {1} · {2}º lugar · {3} pts", "Giornata {0} di {1} · {2}º posto · {3} pt", "Journée {0} sur {1} · {2}e place · {3} pts"],
    "Rápido": ["Quick", "Rápido", "Rapido", "Rapide"],
    "SALVO": ["SAVED", "GUARDADO", "SALVATO", "SAUVEGARDÉ"],
    "SG": ["GD", "DG", "DR", "DB"],
    "Sem abertura": ["No opening", "Sin apertura", "Senza apertura", "Sans ouverture"],
    "Sim, começar um novo": ["Yes, start a new one", "Sí, empezar uno nuevo", "Sì, iniziarne uno nuovo", "Oui, en commencer un nouveau"],
    "Sintético": ["Small-sided", "Fútbol 5", "Calcio a 5", "Foot à 5"],
    "Sorteado": ["Random", "Al azar", "Casuale", "Au hasard"],
    "Sua nota: {0}": ["Your rating: {0}", "Tu nota: {0}", "Il tuo voto: {0}", "Ta note : {0}"],
    "Brasileirão A ou B: rápido (19 rodadas) ou padrão (38). Fica salvo.": ["Brasileirão A or B: quick (19 rounds) or standard (38). It is saved.", "Brasileirão A o B: rápido (19 jornadas) o estándar (38). Se guarda.", "Brasileirão A o B: rapido (19 giornate) o standard (38). Viene salvato.", "Brasileirão A ou B : rapide (19 journées) ou standard (38). Il est sauvegardé."],
    "Só no amistoso: nos campeonatos o jogo é no estádio do mandante.": ["Friendly only: in competitions the match is at the home team's stadium.", "Solo en el amistoso: en los campeonatos se juega en el estadio del local.", "Solo in amichevole: nei tornei si gioca nello stadio di casa.", "Seulement en amical : en compétition, le match est au stade de l'équipe à domicile."],
    "Trocar os times": ["Change the teams", "Cambiar los equipos", "Cambia le squadre", "Changer les équipes"],
    "Um jogo entre quaisquer times da A e da B, no estádio que você quiser.": ["A match between any Brasileirão A and B teams, at the stadium you want.", "Un partido entre cualquier equipo de la A y de la B, en el estadio que quieras.", "Una partita tra qualsiasi squadra della A e della B, nello stadio che vuoi.", "Un match entre n'importe quelles équipes de A et de B, dans le stade de ton choix."],
    "Ver a premiação de novo": ["Watch the awards again", "Ver la premiación de nuevo", "Rivedi la premiazione", "Revoir la remise des prix"],
    "Você está {0}: o jogo vai ser simulado. Acompanhe o placar.": ["You are {0}: the match will be simulated. Follow the score.", "Estás {0}: el partido se simulará. Sigue el marcador.", "Sei {0}: la partita verrà simulata. Segui il punteggio.", "Tu es {0} : le match sera simulé. Suis le score."],
    "Você tem um jogo salvo. Quer continuar ou começar um novo?": ["You have a saved game. Continue it or start a new one?", "Tienes una partida guardada. ¿Quieres continuarla o empezar una nueva?", "Hai una partita salvata. Vuoi continuarla o iniziarne una nuova?", "Tu as une partie sauvegardée. Tu veux la continuer ou en commencer une nouvelle ?"],
    "Várzea": ["Amateur", "Barrio", "Periferia", "Quartier"],
    "de agasalho do clube": ["in the club tracksuit", "con el chándal del club", "con la tuta del club", "en survêtement du club"],
    "de boné": ["with a cap", "con gorra", "con il cappellino", "avec une casquette"],
    "de camisa social": ["in a dress shirt", "con camisa", "in camicia", "en chemise"],
    "de jaqueta": ["in a jacket", "con chaqueta", "con il giubbotto", "en blouson"],
    "de polo do clube": ["in the club polo", "con el polo del club", "con la polo del club", "en polo du club"],
    "de terno": ["in a suit", "de traje", "in giacca e cravatta", "en costume"],
    "de óculos": ["with glasses", "con gafas", "con gli occhiali", "avec des lunettes"],
    "óculos escuros": ["with sunglasses", "con gafas de sol", "con gli occhiali da sole", "avec des lunettes de soleil"],
    "encerrada": ["finished", "terminada", "conclusa", "terminée"],
    "final em campo neutro": ["final at a neutral ground", "final en campo neutral", "finale in campo neutro", "finale sur terrain neutre"],
    "lesionado ({0} jogo(s))": ["injured ({0} match(es))", "lesionado ({0} partido(s))", "infortunato ({0} partita/e)", "blessé ({0} match(s))"],
    "lesionada ({0} jogo(s))": ["injured ({0} match(es))", "lesionada ({0} partido(s))", "infortunata ({0} partita/e)", "blessée ({0} match(s))"],
    "neutro": ["neutral", "neutral", "neutro", "neutre"],
    "suspenso": ["suspended", "sancionado", "squalificato", "suspendu"],
    "suspensa": ["suspended", "sancionada", "squalificata", "suspendue"],
    "suspenso ({0} jogos)": ["suspended ({0} matches)", "sancionado ({0} partidos)", "squalificato ({0} partite)", "suspendu ({0} matchs)"],
    "suspensa ({0} jogos)": ["suspended ({0} matches)", "sancionada ({0} partidos)", "squalificata ({0} partite)", "suspendue ({0} matchs)"],
    "{0} desfalque(s): o reserva da posição entra.": ["{0} absentee(s): the backup in that position comes in.", "{0} baja(s): entra el suplente de la posición.", "{0} assente/i: entra la riserva del ruolo.", "{0} absent(s) : le remplaçant du poste entre."],
    "{0} gol(s)": ["{0} goal(s)", "{0} gol(es)", "{0} gol", "{0} but(s)"],
    "{0} x {1}: os times entram em campo": ["{0} v {1}: the teams walk out", "{0} x {1}: los equipos salen al campo", "{0} - {1}: le squadre entrano in campo", "{0} - {1} : les équipes entrent sur le terrain"],
    "{0} · {1} · rodada {2} de {3}": ["{0} · {1} · round {2} of {3}", "{0} · {1} · jornada {2} de {3}", "{0} · {1} · giornata {2} di {3}", "{0} · {1} · journée {2} sur {3}"],
    "Última rodada": ["Last round", "Última jornada", "Ultima giornata", "Dernière journée"],
    "Partida livre": ["Quick match", "Partido libre", "Partita libera", "Match libre"],
    // (7.5.2) as ligas da Espanha e da Inglaterra
    "Liga Espanhola": ["Spanish League", "Liga española", "Liga spagnola", "Championnat d'Espagne"],
    "Liga Inglesa": ["English League", "Liga inglesa", "Campionato inglese", "Championnat d'Angleterre"],
    "Espanha": ["Spain", "España", "Spagna", "Espagne"],
    "Inglaterra": ["England", "Inglaterra", "Inghilterra", "Angleterre"],
    "Liga Espanhola: 20 times, a elite do país": ["Spanish League: 20 teams, the country's elite", "Liga española: 20 equipos, la élite del país", "Liga spagnola: 20 squadre, l'élite del paese", "Championnat d'Espagne : 20 équipes, l'élite du pays"],
    "Liga Inglesa: 20 times, a elite do país": ["English League: 20 teams, the country's elite", "Liga inglesa: 20 equipos, la élite del país", "Campionato inglese: 20 squadre, l'élite del paese", "Championnat d'Angleterre : 20 équipes, l'élite du pays"],
    "Copa dos Campeões da Europa": ["European Champions Cup", "Copa de Campeones de Europa", "Coppa dei Campioni d'Europa", "Coupe des champions d'Europe"],
    "Torneio Europeu": ["European Trophy", "Torneo Europeo", "Torneo Europeo", "Tournoi européen"],
    "PRÊMIOS DA LIGA ESPANHOLA": ["SPANISH LEAGUE AWARDS", "PREMIOS DE LA LIGA ESPAÑOLA", "PREMI DELLA LIGA SPAGNOLA", "PRIX DU CHAMPIONNAT D'ESPAGNE"],
    "PRÊMIOS DA LIGA INGLESA": ["ENGLISH LEAGUE AWARDS", "PREMIOS DE LA LIGA INGLESA", "PREMI DEL CAMPIONATO INGLESE", "PRIX DU CHAMPIONNAT D'ANGLETERRE"],
    "Boa noite! Bem-vindos à festa de premiação da Liga Espanhola!": ["Good evening! Welcome to the Spanish League awards night!", "¡Buenas noches! ¡Bienvenidos a la gala de premios de la Liga española!", "Buonasera! Benvenuti alla serata dei premi della Liga spagnola!", "Bonsoir ! Bienvenue à la soirée des prix du Championnat d'Espagne !"],
    "Boa noite! Bem-vindos à festa de premiação da Liga Inglesa!": ["Good evening! Welcome to the English League awards night!", "¡Buenas noches! ¡Bienvenidos a la gala de premios de la Liga inglesa!", "Buonasera! Benvenuti alla serata dei premi del Campionato inglese!", "Bonsoir ! Bienvenue à la soirée des prix du Championnat d'Angleterre !"],
    "Brasil (Brasileirão A ou B), Espanha ou Inglaterra: rápido (19 rodadas) ou padrão (38). Fica salvo.": ["Brazil (Brasileirão A or B), Spain or England: quick (19 rounds) or standard (38). It is saved.", "Brasil (Brasileirão A o B), España o Inglaterra: rápido (19 jornadas) o estándar (38). Se guarda.", "Brasile (Brasileirão A o B), Spagna o Inghilterra: rapido (19 giornate) o standard (38). Viene salvato.", "Brésil (Brasileirão A ou B), Espagne ou Angleterre : rapide (19 journées) ou standard (38). Il est sauvegardé."],
    "Um jogo entre quaisquer times do Brasil, da Espanha e da Inglaterra, no estádio que você quiser.": ["A match between any teams from Brazil, Spain and England, at the stadium you want.", "Un partido entre cualquier equipo de Brasil, España e Inglaterra, en el estadio que quieras.", "Una partita tra qualsiasi squadra di Brasile, Spagna e Inghilterra, nello stadio che vuoi.", "Un match entre n'importe quelles équipes du Brésil, d'Espagne et d'Angleterre, dans le stade de ton choix."],
    "Os clubes do Brasil, da Espanha e da Inglaterra no society (6 x 6).": ["The clubs from Brazil, Spain and England on the small-sided pitch (6 v 6).", "Los clubes de Brasil, España e Inglaterra en fútbol 6 (6 x 6).", "I club di Brasile, Spagna e Inghilterra nel calcio a 6 su erba (6 x 6).", "Les clubs du Brésil, d'Espagne et d'Angleterre en foot à 6 (6 x 6)."],
    "Os clubes do Brasil, da Espanha e da Inglaterra na quadra (6 x 6).": ["The clubs from Brazil, Spain and England on the court (6 v 6).", "Los clubes de Brasil, España e Inglaterra en la cancha (6 x 6).", "I club di Brasile, Spagna e Inghilterra sul campo indoor (6 x 6).", "Les clubs du Brésil, d'Espagne et d'Angleterre sur le terrain en salle (6 x 6)."],
  };
  if (typeof I18N !== 'undefined') for (const k of Object.keys(TRAD)) if (!I18N[k]) I18N[k] = TRAD[k];

  window.FutebolJS.registrarFase({ id: 'livre', nome: 'Partida livre', nucleoMinimo: '7.4.1', iniciar: async () => {}, abrir,
    _t: { abertura, festaTitulo, galaPremios, fimDoTorneio, listaPremios, novoCampeonato, novaCopa, classificacao, fecharRodada, fecharFaseCopa, premiosDe, artilharia, foraDe, fecharFichas, motor, montarCfg, jogoDeHoje, estadioFinal, salvos, salvar, dados: () => ({ SBD, VZD }), preparar: async () => { if (!SBD) SBD = (await Fases.carregar('serieb')).dados; if (!VZD) VZD = (await Fases.carregar('varzea')).dados; } } });
})();
