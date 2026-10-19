/* =====================================================================
   FUTEBOL JS · jogo.js · versão 4.1.3
   Arquivo gerado a partir do futebol-partida.html (não edite aqui: o código
   comentado é o mesmo, só que o CSS e a tela (HTML) entram por JavaScript).
   Precisa do Three.js r128 carregado antes (variável global THREE).
   ===================================================================== */
(function () {
  // Fontes do jogo (se a rede bloquear, o navegador usa fontes do sistema).
  var f = document.createElement('link'); f.rel = 'stylesheet';
  f.href = 'https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;600;700&family=Silkscreen:wght@400;700&display=swap';
  document.head.appendChild(f);
  // Estilos e a tela (HUD, menus, minigames).
  var st = document.createElement('style'); st.textContent = "\n/* Layout: o jogo ocupa a tela inteira; HUD presa \u00e0s bordas; minigames e cenas em camadas por cima do 3D.\n   Paleta puxada do Super Lan Master (azul-marinho + laranja). Visual \u00fanico escuro, por escolha. */\n:root {\n  --night: #071430;\n  --panel: rgba(7, 20, 48, 0.86);\n  --panel-solid: #0c1d3d;\n  --line: rgba(255, 255, 255, 0.22);\n  --chalk: #f2f2ee;\n  --muted: #a9b6cc;\n  --flood: #f7941d;\n  --blue: #2a72d6;\n  --red: #d9483b;\n  --good: #6bf08e;\n  --bad: #ff7676;\n  --font-display: 'Silkscreen', 'Courier New', monospace;\n  --font-body: 'Chakra Petch', system-ui, sans-serif;\n  color-scheme: dark;\n}\n/* Tudo do jogo fica dentro do #raizJogo. O \"transform\" faz os elementos \"fixed\" (HUD, menus)\n   se posicionarem em rela\u00e7\u00e3o a ele, e n\u00e3o \u00e0 p\u00e1gina: assim d\u00e1 para encaixar o jogo s\u00f3 na parte\n   VIS\u00cdVEL do iframe do Canva (ver ENCAIXE NA TELA no c\u00f3digo). */\n#raizJogo { position: absolute; left: 0; top: 0; width: 100%; height: 100%; overflow: hidden; transform: translateZ(0); }\nhtml, body {\n  height: 100%; margin: 0; overflow: hidden;\n  background: var(--night); color: var(--chalk);\n  font-family: var(--font-body);\n  touch-action: none; -webkit-user-select: none; user-select: none;\n  -webkit-tap-highlight-color: transparent;\n}\n[hidden] { display: none !important; }\nbutton { font-family: inherit; color: inherit; cursor: pointer; }\nbutton:focus-visible { outline: 3px solid var(--flood); outline-offset: 3px; }\n\n/* ---------- canvas 3D em baixa resolu\u00e7\u00e3o, ampliado sem suavizar (efeito PS1) ---------- */\n#game {\n  position: fixed; inset: 0; width: 100%; height: 100%; display: block;\n  image-rendering: crisp-edges; image-rendering: pixelated;\n}\n#touch { position: fixed; inset: 0; z-index: 1; }\n\n/* ---------- HUD ---------- */\n#hud { position: fixed; inset: 0; z-index: 2; pointer-events: none; transition: opacity 0.3s; }\n#score {\n  position: absolute; top: calc(10px + env(safe-area-inset-top, 0px)); left: 50%; transform: translateX(-50%);\n  display: flex; align-items: center; gap: 8px;\n  background: var(--panel); border: 2px solid var(--line); padding: 6px 12px;\n  font-family: var(--font-display); font-size: 14px; letter-spacing: 0.06em; white-space: nowrap;\n  font-variant-numeric: tabular-nums;\n}\n#score .tag { padding: 2px 6px; font-size: 11px; color: #fff; }\n#score .tag.a { background: var(--blue); }\n#score .tag.b { background: var(--red); }\n#score b { font-size: 18px; min-width: 1ch; text-align: center; }\n#clock { margin-left: 6px; color: var(--flood); }\n.hudBtn {\n  pointer-events: auto; position: absolute; top: calc(10px + env(safe-area-inset-top, 0px));\n  height: 44px; background: var(--panel); border: 2px solid var(--line);\n  font-family: var(--font-display); font-size: 11px; padding: 0 10px;\n}\n#pauseBtn { left: calc(12px + env(safe-area-inset-left, 0px)); width: 44px; font-size: 14px; padding: 0; }\n#camBtn { left: calc(62px + env(safe-area-inset-left, 0px)); }\n#fps {\n  position: absolute; top: calc(60px + env(safe-area-inset-top, 0px)); left: calc(12px + env(safe-area-inset-left, 0px));\n  font-family: var(--font-display); font-size: 10px; background: var(--panel); padding: 3px 6px; font-variant-numeric: tabular-nums;\n}\n#radar {\n  position: absolute; top: calc(10px + env(safe-area-inset-top, 0px)); right: calc(12px + env(safe-area-inset-right, 0px));\n  width: 64px; height: 100px; image-rendering: pixelated; border: 2px solid var(--line);\n}\n#toast {\n  position: absolute; top: calc(62px + env(safe-area-inset-top, 0px)); left: 50%; transform: translateX(-50%);\n  font-family: var(--font-display); font-size: 13px; letter-spacing: 0.05em; white-space: nowrap;\n  background: var(--panel); padding: 6px 12px; border-left: 4px solid var(--flood); opacity: 0;\n}\n#toast.show { animation: toast 1.6s ease forwards; }\n#toast.good { border-left-color: var(--good); }\n#toast.bad { border-left-color: var(--bad); }\n@keyframes toast { 0% { opacity: 0; transform: translate(-50%, -6px); } 12% { opacity: 1; transform: translate(-50%, 0); } 80% { opacity: 1; } 100% { opacity: 0; } }\n#banner {\n  position: fixed; z-index: 3; top: 34%; left: 50%; transform: translate(-50%, -50%); pointer-events: none;\n  font-family: var(--font-display); font-weight: 700; font-size: clamp(34px, 9vw, 72px);\n  color: var(--flood); text-shadow: 4px 4px 0 #000; white-space: nowrap; opacity: 0;\n}\n#banner.show { animation: banner 2.6s ease forwards; }\n#banner.b { color: var(--red); }\n@keyframes banner { 0% { opacity: 0; transform: translate(-50%, -50%) scale(2.2); } 15% { opacity: 1; transform: translate(-50%, -50%) scale(1); } 85% { opacity: 1; } 100% { opacity: 0; } }\n#hint {\n  position: absolute; bottom: calc(16px + env(safe-area-inset-bottom, 0px)); left: 50%; transform: translateX(-50%);\n  font-size: 13px; color: var(--muted); background: var(--panel); padding: 4px 10px; white-space: nowrap;\n}\n#hint:empty { display: none; }\n\n/* ---------- bot\u00f5es de a\u00e7\u00e3o ---------- */\n#actions {\n  position: absolute; right: calc(18px + env(safe-area-inset-right, 0px)); bottom: calc(18px + env(safe-area-inset-bottom, 0px));\n  display: grid; grid-template-columns: 80px 94px; grid-template-rows: 80px 94px; gap: 10px;\n  grid-template-areas: \". s3\" \"s2 s1\"; pointer-events: none;\n}\n.act {\n  pointer-events: auto; border-radius: 50%; border: 4px solid rgba(255, 255, 255, 0.55);\n  background: rgba(14, 37, 71, 0.72); font-family: var(--font-display); font-size: 11px; line-height: 1.2;\n  box-shadow: 0 4px 0 rgba(0, 0, 0, 0.45); padding: 4px; touch-action: none;\n}\n.act:active { transform: translateY(3px); box-shadow: 0 1px 0 rgba(0, 0, 0, 0.45); }\n.act.s1 { grid-area: s1; font-size: 12px; }\n.act.s2 { grid-area: s2; }\n.act.s3 { grid-area: s3; }\n.act.primary { color: #fff; background: rgba(247, 148, 29, 0.85); border-color: #071430; }\n.act.waiting { background: rgba(107, 240, 142, 0.8); color: #071430; }\n.act.far, .act.cool { opacity: 0.45; }\n\n/* ---------- joystick fixo (mesmo visual do Super Lan Master) + estamina ---------- */\n#joy {\n  position: absolute; left: calc(22px + env(safe-area-inset-left, 0px)); bottom: calc(30px + env(safe-area-inset-bottom, 0px));\n  width: 132px; height: 132px; border-radius: 50%; box-sizing: border-box;\n  background: rgba(14, 37, 71, 0.55); border: 4px solid rgba(255, 255, 255, 0.35);\n  transition: border-color 0.15s;\n}\n#joy.run { border-color: var(--flood); }\n#joy.tired { border-color: var(--bad); }\n#joy.aim { border-color: var(--good); }\n.knob {\n  position: absolute; left: 50%; top: 50%; width: 58px; height: 58px; margin: -29px 0 0 -29px;\n  border-radius: 50%; background: var(--flood); border: 4px solid #071430; box-sizing: border-box;\n}\n#joyLabel {\n  position: absolute; left: 50%; top: -22px; transform: translateX(-50%);\n  font-family: var(--font-display); font-size: 10px; color: var(--flood); white-space: nowrap; text-shadow: 1px 1px 0 #000;\n}\n#stamina {\n  position: absolute; left: calc(22px + env(safe-area-inset-left, 0px)); bottom: calc(12px + env(safe-area-inset-bottom, 0px));\n  width: 132px; height: 8px; background: rgba(7, 20, 48, 0.8); border: 2px solid rgba(255, 255, 255, 0.35); box-sizing: content-box;\n}\n#staminaFill { height: 100%; width: 100%; background: var(--good); transform-origin: left center; }\n#staminaFill.low { background: var(--bad); }\n#aimPad {\n  position: fixed; z-index: 3; width: 132px; height: 132px; margin: -66px 0 0 -66px; border-radius: 50%; box-sizing: border-box;\n  background: rgba(14, 37, 71, 0.45); border: 4px solid var(--good); pointer-events: none;\n}\n\n/* ---------- etapas do chute/passe ---------- */\n#stageBar {\n  position: fixed; z-index: 3; top: calc(60px + env(safe-area-inset-top, 0px)); left: 50%; transform: translateX(-50%);\n  display: flex; flex-direction: column; align-items: center; gap: 6px; pointer-events: none;\n  width: min(560px, calc(100% - 40px));\n}\n#stageSteps { display: flex; gap: 6px; align-items: center; }\n#stageSteps .step, #stageHint { display: none; }\nbody.mirando #toast { visibility: hidden; }   /* etapas e dicas v\u00e3o para o tutorial */\n#stageKind { font-family: var(--font-display); font-size: 12px; color: #fff; background: var(--flood); padding: 3px 8px; }\n.step { font-family: var(--font-display); font-size: 11px; padding: 3px 8px; background: var(--panel); color: var(--muted); border: 2px solid transparent; }\n.step.on { color: var(--chalk); border-color: var(--flood); }\n.step.done { color: var(--good); }\n#kickTimer { width: min(320px, 100%); height: 6px; background: var(--panel); }\n#kickTimerFill { height: 100%; width: 100%; background: var(--flood); transform-origin: left center; }\n#kickTimerFill.low { background: var(--bad); }\n#stageHint { margin: 0; font-size: 14px; background: var(--panel); padding: 5px 12px; text-align: center; text-wrap: balance; }\n#cancelKick, #skipBtn {\n  pointer-events: auto; position: fixed; z-index: 4;\n  right: calc(18px + env(safe-area-inset-right, 0px)); bottom: calc(16px + env(safe-area-inset-bottom, 0px));\n  background: var(--panel); border: 2px solid var(--line); padding: 8px 14px; font-family: var(--font-display); font-size: 11px;\n}\n#skipBtn { border-color: var(--flood); bottom: calc(13 * var(--avh, 1vh) + 10px); }\n\n#powerUI {\n  position: fixed; z-index: 3; right: calc(36px + env(safe-area-inset-right, 0px)); top: 50%; transform: translateY(-50%);\n  display: flex; flex-direction: column; align-items: center; gap: 6px; pointer-events: none;\n}\n#powerBar { position: relative; width: 40px; height: min(52 * var(--avh, 1vh), 260px); background: var(--panel-solid); border: 3px solid var(--chalk); overflow: hidden; }\n#powerOver { position: absolute; left: 0; right: 0; top: 0; height: 13%; background: rgba(255, 118, 118, 0.35); }\n#powerZone { position: absolute; left: 0; right: 0; background: rgba(107, 240, 142, 0.55); border-top: 2px solid var(--good); border-bottom: 2px solid var(--good); }\n#powerFill { position: absolute; left: 6px; right: 6px; bottom: 0; height: 0; background: var(--flood); }\n#powerLabel { font-family: var(--font-display); font-size: 11px; }\n\n#spinUI {\n  position: fixed; z-index: 3; left: 50%; top: 54%; transform: translate(-50%, -50%);\n  display: flex; flex-direction: column; align-items: center; gap: 8px; pointer-events: none;\n}\n#spinBall {\n  pointer-events: auto; position: relative; width: min(42 * var(--avh, 1vh), 220px); height: min(42 * var(--avh, 1vh), 220px); border-radius: 50%;\n  background:\n    radial-gradient(circle at 35% 30%, #ffffff 0 18%, transparent 19%),\n    radial-gradient(circle at 50% 50%, #f4f2ea 0 60%, #c9c6ba 100%);\n  border: 4px solid #1b1d1a; box-shadow: 0 6px 0 rgba(0, 0, 0, 0.5); touch-action: none;\n}\n#spinBall::before, #spinBall::after { content: \"\"; position: absolute; background: rgba(27, 29, 26, 0.35); }\n#spinBall::before { left: 50%; top: 6%; bottom: 6%; width: 2px; margin-left: -1px; }\n#spinBall::after { top: 50%; left: 6%; right: 6%; height: 2px; margin-top: -1px; }\n#spinDot { position: absolute; width: 22px; height: 22px; margin: -11px 0 0 -11px; border-radius: 50%; background: var(--red); border: 3px solid #1b1d1a; }\n.spinTag { position: absolute; font-family: var(--font-display); font-size: 9px; color: #1b1d1a; }\n#spinInfo { font-size: 14px; background: var(--panel); padding: 5px 12px; text-align: center; }\n\n/* ---------- faixas pretas de cinema e escurecimento ---------- */\n.bar { position: fixed; left: 0; right: 0; height: 0; background: #000; z-index: 3; transition: height 0.35s ease; pointer-events: none; }\n.bar.top { top: 0; }\n.bar.bottom { bottom: 0; }\nbody.cine .bar { height: calc(13 * var(--avh, 1vh)); }\nbody.cine #hud { opacity: 0; }\n#cineLabel {\n  position: fixed; z-index: 4; left: 50%; bottom: calc(13 * var(--avh, 1vh) + 12px); transform: translateX(-50%); pointer-events: none;\n  font-family: var(--font-display); font-size: 14px; color: var(--flood); text-shadow: 2px 2px 0 #000; white-space: nowrap;\n}\n#fade { position: fixed; inset: 0; z-index: 6; background: #000; opacity: 0; pointer-events: none; transition: opacity 0.35s ease; }\n#fade.on { opacity: 1; }\n\n/* ---------- minigames de tempo (drible / dom\u00ednio) ---------- */\n#timingLayer { position: fixed; inset: 0; z-index: 4; touch-action: none; }\n\n/* ---------- recep\u00e7\u00e3o: barra de tempo (mesma l\u00f3gica do martelo do Super Lan Master, visual deste jogo) ----------\n   Fica no alto, no mesmo lugar e com a mesma cara das etapas do chute (etiqueta laranja, barra\n   com borda de giz, faixa verde da for\u00e7a). Os bot\u00f5es aparecem no lugar dos bot\u00f5es de a\u00e7\u00e3o. */\n#recvLayer { position: fixed; inset: 0; z-index: 4; pointer-events: none; }\n#recvHead {\n  position: absolute; top: calc(60px + env(safe-area-inset-top, 0px)); left: 50%; transform: translateX(-50%);\n  width: min(460px, calc(100% - 300px)); min-width: 220px;\n  display: flex; flex-direction: column; align-items: center; gap: 6px;\n}\n#recvKind { font-family: var(--font-display); font-size: 12px; color: #fff; background: var(--flood); padding: 3px 8px; white-space: nowrap; }\n#recvKind.dificil { background: var(--red); }\n#hamTrack {\n  pointer-events: auto; position: relative; width: 100%; height: 30px; cursor: pointer; touch-action: none;\n  background: var(--panel-solid); border: 3px solid var(--chalk); box-sizing: border-box;\n}\n#hamTrack.erro { border-color: var(--bad); animation: tremeBarra 0.25s linear; }\n@keyframes tremeBarra { 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }\n#hamZone { position: absolute; top: 0; bottom: 0; background: rgba(107, 240, 142, 0.55); border-left: 2px solid var(--good); border-right: 2px solid var(--good); }\n#hamZone.flash { background: var(--good); }\n#hamMarker {\n  position: absolute; top: -7px; bottom: -7px; width: 8px; margin-left: -4px;\n  background: var(--flood); border: 2px solid #071430; box-sizing: border-box; will-change: left;\n}\n#recvTimer { width: 70%; height: 6px; background: var(--panel); }\n#recvTimerFill { height: 100%; width: 100%; background: var(--flood); transform-origin: left center; }\n#recvTimerFill.low { background: var(--bad); }\n#recvInfo { margin: 0; font-size: 14px; background: var(--panel); padding: 5px 12px; text-align: center; text-wrap: balance; }\n#recvInfo.ok { color: var(--good); font-family: var(--font-display); font-size: 13px; }\n#recvInfo.bad { color: var(--bad); font-family: var(--font-display); font-size: 13px; }\n/* Bot\u00f5es da recep\u00e7\u00e3o: mesmo formato e lugar dos bot\u00f5es de a\u00e7\u00e3o (redondos, canto direito). */\n#recvActs {\n  position: absolute; right: calc(18px + env(safe-area-inset-right, 0px)); bottom: calc(18px + env(safe-area-inset-bottom, 0px));\n  display: grid; grid-template-columns: 80px 94px; grid-template-rows: 80px 94px; gap: 10px;\n  grid-template-areas: \". s3\" \"s2 s1\"; pointer-events: none;\n}\nbody.recebendo #actions, body.recebendo #toast, body.recebendo #hint { visibility: hidden; }\n#recvActs .act { font-size: 10px; }\n#recvActs .act.s1 { font-size: 11px; }\n@media (max-width: 640px) { #recvHead { width: calc(100% - 40px); } }\n#cardChip {\n  position: absolute; top: calc(52px + env(safe-area-inset-top, 0px)); left: 50%; transform: translateX(-50%);\n  display: flex; gap: 4px; align-items: center; font-family: var(--font-display); font-size: 10px;\n  background: var(--panel); padding: 3px 8px;\n}\n#cardChip i { display: inline-block; width: 9px; height: 13px; border: 1px solid #000; }\n#cardChip i.am { background: #ffd400; }\n#cardChip i.vm { background: #e02020; }\n#timingHead {\n  position: absolute; top: calc(14 * var(--avh, 1vh) + 4px); left: 50%; transform: translateX(-50%);\n  display: flex; flex-direction: column; align-items: center; gap: 5px; pointer-events: none; width: min(420px, calc(100% - 40px));\n}\n#timingTitle { font-family: var(--font-display); font-size: 16px; color: var(--flood); text-shadow: 2px 2px 0 #000; }\n#timingInfo { font-size: 13px; background: var(--panel); padding: 3px 10px; font-variant-numeric: tabular-nums; }\n#timingTrack { width: 100%; height: 6px; background: var(--panel); }\n#timingProg { height: 100%; width: 100%; background: var(--flood); transform-origin: left center; }\n.tgt {\n  position: absolute; width: 78px; height: 78px; transform: translate(-50%, -50%); border-radius: 50%;\n  border: 4px solid var(--flood); background: rgba(247, 148, 29, 0.18);\n  display: grid; place-items: center; transition: opacity 0.3s;\n}\n.tgt .ring { position: absolute; inset: -4px; border-radius: 50%; border: 3px solid var(--chalk); pointer-events: none; }\n.tgt .num { font-family: var(--font-display); font-size: 18px; }\n.tgt .fb { position: absolute; top: -26px; font-family: var(--font-display); font-size: 11px; white-space: nowrap; text-shadow: 2px 2px 0 #000; }\n.tgt.perfect { border-color: var(--good); background: rgba(107, 240, 142, 0.3); }\n.tgt.perfect .fb { color: var(--good); }\n.tgt.good { border-color: var(--chalk); }\n.tgt.miss { border-color: var(--bad); background: rgba(255, 118, 118, 0.25); }\n.tgt.miss .fb { color: var(--bad); }\n.tgt.gone { opacity: 0; }\n\n/* ---------- telas (in\u00edcio, pausa, fim) ---------- */\n.screen {\n  position: fixed; inset: 0; z-index: 5; display: grid; place-items: center;\n  background: rgba(4, 10, 24, 0.72);\n  padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px));\n  padding-block: calc(12px + env(safe-area-inset-top, 0px)) calc(12px + env(safe-area-inset-bottom, 0px));\n  overflow-y: auto;\n}\n.card {\n  width: min(860px, 100%); background: var(--panel-solid); border: 3px solid var(--chalk);\n  box-shadow: 8px 8px 0 rgba(0, 0, 0, 0.5); padding: 18px 20px;\n  display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.5fr); gap: 20px; align-items: start;\n}\n.card .side { display: flex; flex-direction: column; gap: 12px; min-width: 0; }\n.eyebrow { margin: 0; font-family: var(--font-display); font-size: 11px; letter-spacing: 0.08em; color: var(--flood); }\n.card h1, .card h2 { margin: 0; font-family: var(--font-display); font-weight: 700; line-height: 1.05; text-wrap: balance; }\n.card h1 { font-size: clamp(30px, 5vw, 44px); }\n.card h2 { font-size: clamp(22px, 3.6vw, 30px); }\n.card p { margin: 0; font-size: 14px; color: var(--muted); line-height: 1.45; }\n.howto { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; font-size: 14px; line-height: 1.4; min-width: 0; }\n.howto li { border-left: 3px solid var(--line); padding-left: 10px; }\n.howto b { font-family: var(--font-display); font-size: 11px; font-weight: 400; color: var(--flood); display: block; letter-spacing: 0.05em; }\n.big {\n  background: var(--flood); color: #fff; border: 0; padding: 12px 16px;\n  font-family: var(--font-display); font-size: 14px; box-shadow: 0 4px 0 #8a4c06;\n}\n.big:active { transform: translateY(3px); box-shadow: 0 1px 0 #8a4c06; }\n.ghost { background: transparent; border: 2px solid var(--line); padding: 10px 14px; font-family: var(--font-display); font-size: 12px; }\n.btnRow { display: flex; gap: 10px; flex-wrap: wrap; }\n.stats { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px 16px; margin: 0; }\n.stats div { display: flex; justify-content: space-between; gap: 8px; border-bottom: 1px solid var(--line); padding: 4px 0; font-size: 14px; }\n.stats dt { color: var(--muted); }\n.stats dd { margin: 0; font-family: var(--font-display); font-size: 13px; font-variant-numeric: tabular-nums; }\n.finalScore { font-family: var(--font-display); font-size: clamp(30px, 6vw, 48px); display: flex; gap: 10px; align-items: center; }\n.rating { display: flex; align-items: baseline; gap: 10px; }\n.rating strong { font-family: var(--font-display); font-size: 34px; color: var(--flood); }\n.settings { display: flex; flex-direction: column; gap: 10px; }\n.settings label { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 4px 10px; font-size: 13px; }\n.settings input[type=range] { grid-column: 1 / -1; accent-color: var(--flood); width: 100%; }\n.settings output { font-family: var(--font-display); font-size: 11px; color: var(--flood); }\n.settings .check { display: flex; align-items: center; gap: 8px; }\n.settings .check input { accent-color: var(--flood); width: 18px; height: 18px; }\n.sectionTitle { margin: 0; font-family: var(--font-display); font-size: 12px; color: var(--chalk); letter-spacing: 0.06em; }\n\n@media (max-width: 640px) { .card { grid-template-columns: minmax(0, 1fr); } }\n@media (max-height: 430px) { .card { padding: 12px 14px; gap: 14px; } .howto { gap: 5px; font-size: 13px; } }\n\n#rotate {\n  position: fixed; inset: 0; z-index: 9; display: none; place-items: center; text-align: center;\n  background: var(--night); font-family: var(--font-display); font-size: 16px; padding: 24px; line-height: 1.6;\n}\n@media (orientation: portrait) and (max-width: 820px) { #rotate { display: grid; } }\n\n@media (prefers-reduced-motion: reduce) {\n  #toast.show, #banner.show { animation-duration: 0.01s; animation-fill-mode: none; opacity: 1; }\n  .bar, #fade { transition: none; }\n}\n";
  document.head.appendChild(st);
  document.body.insertAdjacentHTML('beforeend', "<div id=\"raizJogo\">\n<canvas id=\"game\"></canvas>\n<div id=\"touch\"></div>\n\n<div id=\"hud\">\n  <button id=\"pauseBtn\" class=\"hudBtn\" aria-label=\"Pausar\">II</button>\n  <button id=\"camBtn\" class=\"hudBtn\">C\u00c2M: BOLA</button>\n  <div id=\"fps\" hidden></div>\n  <div id=\"score\">\n    <span class=\"tag a\">AZU</span><b id=\"scoreA\">0</b><span>:</span><b id=\"scoreB\">0</b><span class=\"tag b\">VER</span>\n    <span id=\"clock\">05:00</span>\n  </div>\n  <canvas id=\"radar\" width=\"64\" height=\"100\" aria-label=\"Mapa do campo\"></canvas>\n  <div id=\"toast\"></div>\n  <div id=\"hint\"></div>\n  <div id=\"cardChip\" hidden></div>\n  <div id=\"actions\"></div>\n  <div id=\"joy\"><span id=\"joyLabel\"></span><div class=\"knob\" id=\"joyKnob\"></div></div>\n  <div id=\"stamina\" aria-label=\"Estamina\"><div id=\"staminaFill\"></div></div>\n</div>\n\n<div id=\"banner\"></div>\n<div class=\"bar top\"></div>\n<div class=\"bar bottom\"></div>\n<div id=\"cineLabel\"></div>\n<button id=\"skipBtn\" hidden>Pular \u25b6</button>\n<div id=\"fade\"></div>\n\n<div id=\"aimPad\" hidden><div class=\"knob\" id=\"aimKnob\"></div></div>\n\n<div id=\"stageBar\" hidden>\n  <div id=\"stageSteps\">\n    <span id=\"stageKind\">CHUTE</span>\n    <span class=\"step\" data-step=\"aim\">1 Mira</span>\n    <span class=\"step\" data-step=\"power\">2 For\u00e7a</span>\n    <span class=\"step\" data-step=\"spin\" id=\"stepSpin\">3 Efeito</span>\n  </div>\n  <div id=\"kickTimer\"><div id=\"kickTimerFill\"></div></div>\n  <p id=\"stageHint\"></p>\n</div>\n<button id=\"cancelKick\" hidden>Cancelar</button>\n\n<div id=\"powerUI\" hidden>\n  <span id=\"powerLabel\">M\u00c1X</span>\n  <div id=\"powerBar\">\n    <div id=\"powerOver\"></div>\n    <div id=\"powerZone\"></div>\n    <div id=\"powerFill\"></div>\n  </div>\n  <span class=\"step on\">FOR\u00c7A</span>\n</div>\n\n<div id=\"spinUI\" hidden>\n  <div id=\"spinBall\">\n    <span class=\"spinTag\" style=\"top:8%;left:50%;transform:translateX(-50%)\">CIMA</span>\n    <span class=\"spinTag\" style=\"bottom:8%;left:50%;transform:translateX(-50%)\">BAIXO</span>\n    <span class=\"spinTag\" style=\"left:7%;top:50%;transform:translateY(-130%)\">ESQ</span>\n    <span class=\"spinTag\" style=\"right:7%;top:50%;transform:translateY(-130%)\">DIR</span>\n    <div id=\"spinDot\" hidden></div>\n  </div>\n  <div id=\"spinInfo\"></div>\n</div>\n\n<div id=\"recvLayer\" hidden>\n  <div id=\"recvHead\">\n    <span id=\"recvKind\"></span>\n    <div id=\"hamTrack\"><div id=\"hamZone\"></div><div id=\"hamMarker\"></div></div>\n    <div id=\"recvTimer\"><div id=\"recvTimerFill\"></div></div>\n    <p id=\"recvInfo\"></p>\n  </div>\n  <div id=\"recvActs\"></div>\n</div>\n\n<div id=\"timingLayer\" hidden>\n  <div id=\"timingHead\">\n    <span id=\"timingTitle\"></span>\n    <span id=\"timingInfo\"></span>\n    <div id=\"timingTrack\"><div id=\"timingProg\"></div></div>\n  </div>\n</div>\n\n<div id=\"startScreen\" class=\"screen\">\n  <div class=\"card\">\n    <div class=\"side\">\n      <p class=\"eyebrow\">PROT\u00d3TIPO \u00b7 SISTEMA DE PARTIDA</p>\n      <h1>Futebol JS</h1>\n      <p>Voc\u00ea controla s\u00f3 o seu atacante (etiqueta laranja). Partida de teste 7 contra 7, com 5 minutos de rel\u00f3gio.</p>\n      <button id=\"startBtn\" class=\"big\">Come\u00e7ar partida</button>\n      <p id=\"versaoInfo\" style=\"font-size:11px;opacity:0.55;margin:0\"></p>\n    </div>\n    <ul class=\"howto\">\n      <li><b>ANDAR E CORRER</b>Joystick no canto esquerdo. Empurre at\u00e9 o fim para correr. A corrida gasta a barra verde (10 s de corrida) e ela volta devagar.</li>\n      <li><b>C\u00c2MERA</b>Por padr\u00e3o ela fica atr\u00e1s de voc\u00ea virada para a bola. O bot\u00e3o C\u00c2M troca para a c\u00e2mera fixa para frente.</li>\n      <li><b>CHUTAR / CRUZAR</b>Mire no gol para chutar. Mire num companheiro para cruzar: ele cabeceia, bate de primeira ou domina.</li>\n      <li><b>CHUTE</b>1. Arraste para mirar (a seta segue o dedo). 2. Segure e solte na faixa verde. 3. Toque no ponto da bola para o efeito.</li>\n      <li><b>PASSE</b>S\u00f3 dire\u00e7\u00e3o e for\u00e7a.</li>\n      <li><b>DRIBLE</b>O bot\u00e3o DRIBLAR aparece quando um marcador vem para cima de voc\u00ea. C\u00e2mera de lado, c\u00e2mera lenta e 2 toques em 2,2 s (no goleiro: 3 toques em 1,3 s). Depois precisa recarregar.</li>\n      <li><b>TEMPO PARA CHUTAR</b>Do clique at\u00e9 o chute voc\u00ea tem 6 s, ou o jogador fura. O marcador pode roubar a bola nesse tempo.</li>\n      <li><b>GOL SEU</b>At\u00e9 10 s para correr \u00e0 vontade e escolher a CELEBRA\u00c7\u00c3O 1 (avi\u00e3ozinho, voc\u00ea guia com o joystick) ou 2 (joelhada). Corra at\u00e9 a bandeirinha de escanteio, at\u00e9 as placas (no society: a grade) ou v\u00e1 buscar a bola no gol para comemora\u00e7\u00f5es especiais. Gol de outro jogador: a c\u00e2mera mostra a comemora\u00e7\u00e3o dele.</li>\n      <li><b>RECEBER A BOLA</b>Martele quando o marcador estiver na faixa verde (2 s). Bola baixa: dom\u00ednio; na altura do peito: dom\u00ednio no peito (com pulo se for alta); por cima da cabe\u00e7a: CABECEAR (toca para o mais perto) ou FINALIZAR (cabe\u00e7ada, voleio ou bicicleta).</li>\n      <li><b>DEFESA</b>DESARMAR ou CARRINHO. Por tr\u00e1s \u00e9 falta. 3 faltas = amarelo, mais 2 = vermelho. Carrinho por tr\u00e1s sem pegar a bola = vermelho direto.</li>\n      <li><b>NO COMPUTADOR</b>WASD ou setas, Shift corre. J chuta, K passa, L dribla, E pede a bola ou desarma, Q carrinho, C troca a c\u00e2mera. Na recep\u00e7\u00e3o: Espa\u00e7o martela (J finaliza, K cabeceia).</li>\n    </ul>\n  </div>\n</div>\n\n<div id=\"pauseScreen\" class=\"screen\" hidden>\n  <div class=\"card\">\n    <div class=\"side\">\n      <p class=\"eyebrow\">PAUSADO</p>\n      <h2>Seu desempenho</h2>\n      <dl class=\"stats\" id=\"pauseStats\"></dl>\n      <div class=\"btnRow\">\n        <button id=\"resumeBtn\" class=\"big\">Continuar</button>\n        <button id=\"restartBtn\" class=\"ghost\">Reiniciar</button>\n      </div>\n    </div>\n    <div class=\"settings\">\n      <p class=\"sectionTitle\">AJUSTES DE TESTE</p>\n      <label for=\"setBroken\">Chance do passe vir quebrado quando voc\u00ea pede<output id=\"outBroken\"></output>\n        <input id=\"setBroken\" type=\"range\" min=\"0\" max=\"100\" step=\"5\"></label>\n      <label for=\"setTackle\">For\u00e7a da marca\u00e7\u00e3o da IA em voc\u00ea<output id=\"outTackle\"></output>\n        <input id=\"setTackle\" type=\"range\" min=\"0\" max=\"60\" step=\"5\"></label>\n      <label for=\"setRes\">Resolu\u00e7\u00e3o interna (menor = mais pixelado e mais leve)<output id=\"outRes\"></output>\n        <input id=\"setRes\" type=\"range\" min=\"180\" max=\"540\" step=\"20\"></label>\n      <label for=\"setShake\">Tremida da c\u00e2mera na corrida<output id=\"outShake\"></output>\n        <input id=\"setShake\" type=\"range\" min=\"0\" max=\"20\" step=\"1\"></label>\n      <label class=\"check\" for=\"setFps\"><input id=\"setFps\" type=\"checkbox\"> Mostrar FPS e chamadas de desenho</label>\n    </div>\n  </div>\n</div>\n\n<div id=\"endScreen\" class=\"screen\" hidden>\n  <div class=\"card\">\n    <div class=\"side\">\n      <p class=\"eyebrow\" id=\"endTitle\">FIM DE JOGO</p>\n      <div class=\"finalScore\" id=\"finalScore\"></div>\n      <div class=\"rating\"><strong id=\"finalRating\">6.0</strong><p>Sua nota na partida. No modo hist\u00f3ria ela vai pesar nas propostas dos clubes.</p></div>\n      <button id=\"againBtn\" class=\"big\">Jogar de novo</button>\n    </div>\n    <dl class=\"stats\" id=\"endStats\"></dl>\n  </div>\n</div>\n\n<div id=\"rotate\">Gire o celular<br>para a horizontal</div>\n</div>");
})();

'use strict';
/* =====================================================================
   FUTEBOL JS · PROTÓTIPO DO SISTEMA DE PARTIDA (histórico; até a 14 a numeração era antiga)
   ---------------------------------------------------------------------
   Novidades da versão 4.1.3:
     - Chão da VÁRZEA (buildPitch, padrao 'manchas'): manchas de grama e terra viraram "círculos"
       de quadrados (grandes no miolo, pequenos na borda), cortadas na linha do campo; fora das
       linhas é tudo marrom, em quadrados de vários tons (paleta MARROM).
     - "bola para a torcida" ativa de verdade (a rede segura a bola; vale chegando na bola)
     - pular na grade também na várzea (mãos no alto da grade de 2,6 m, pés na tela)
     - drible com marcador atrás virou PROTEÇÃO: de costas/ombro, com contato; ele cai de costas
     - 11 x 11 (e 7 x 7): quem dá o bote é quem está na FRENTE do atacante (lateral/zagueiro),
       e ele fecha no atacante correndo ou perto do gol, em vez de só recuar
     - perder a bola: as mesmas 3 animações para você e para a IA (carrinho também), sem o
       "balançando"; drible errado usa uma delas
     - lado do banco mais largo (placa/grade a 6,5 m): bandeirinha, técnico, banco e reservas
       não se encostam mais
     - substituição em cenas: placa → câmera segue quem sai (sem tempo limite) → só quando ele
       chega batem as mãos; reservas andam pelo corredor do banco e ninguém senta em cima de ninguém
     - a bola pode sair do estádio (sem parede invisível); 2 cones com bola em cada lateral para
       o lateral, e no escanteio o goleiro adversário joga a bola reserva dele para o cobrador
     - quem vai cobrar (goleiro no tiro de meta, jogador caído) termina de levantar antes de ir
     - sombras sempre no chão (não sobem mais junto no pulo, no mergulho, na placa)
   Novidades da versão 4.1.2:
     - abraço no técnico refeito (abraço de lado, conferido caixa por caixa: ninguém entra no outro)
     - 5 reservas sentados no banco de cada time; quem vai entrar levanta e espera na linha
       (com o quarto árbitro) até a bola parar; quem sai vai sentar no banco
     - técnico com várias poses (mão na cintura no começo, braços cruzados, mão no queixo, aponta,
       chama o time, aplaude, reclama, mãos na cabeça, comemora); society sem banco/técnico
     - neve: empurrada para fora do campo; dentro, só quadradinhos da neve caindo
     - IA do 11 x 11 por função (zagueiro, lateral, volante, meia, aberto, ponta, centroavante):
       zaga fica atrás no ataque, atacantes adiantados e com corridas, alas levam e cruzam
     - comemorações por campo (society: pular na grade; várzea: sem placa) e a nova
       "bola para a torcida" (busca a bola no gol, leva para o lado, chuta e dá tchau)
   Novidades da versão 4.1.1:
     - replay: braço/perna/cabeça não somem mais (joelho, cotovelo e cabeça gravados como liga/desliga)
     - calção e camisa não piscam mais um dentro do outro (faces que coincidiam)
     - IA toma a bola de quem fica parado (2,2 s) ou anda para cima dela sem driblar
     - "DOMÍNIO PERFEITO" menor; mão levantada ao pedir a bola; empurrão no desarme por trás;
       4 variações de braço na disputa de corpo
     - comemoração secreta (abraço no técnico); técnico e banco de reservas com física
     - tela OPÇÕES DA PARTIDA (tudo o que já dá para mudar + o que vem "em breve")
     - replay de gol fora de campo (espectador) passa sozinho depois de uma câmera
   Novidades da versão 4.1.0:
     - disputa de PÊNALTIS no mata-mata empatado (você bate só o seu; o resto é automático)
     - lesões (leve/média/grave; o autocuidado da história pesa nas suas) e CARTÕES/LESÕES
       ENTRE PARTIDAS (suspensão por vermelho e 3 amarelos; quem está fora não é escalado)
     - SUBSTITUIÇÕES com cena (placa do 4º árbitro, sai/entra, "toca aqui"); o técnico troca
       cansados e lesionados na próxima parada; CANSAÇO da IA
     - você saiu lesionado: o jogo segue sem você (câmera de TV, mais rápido) e dá para pular
     - regras por campo (society: sem impedimento, sem acréscimos, lateral com o pé, trocas à vontade)
     - arredores de VÁRZEA (alambrado, torcida em pé, arquibancadinha, casinhas, terra) e de SOCIETY
     - duração: 5 min (padrão) ou 3 min (partida rápida)
     - resultado para o modo história: FutebolJS.ultimoResultado e o evento 'futebolJs:fim'

   Novidades da versão 4.0.0 (a numeração agora é 4.x.y, igual ao versao.txt):
     - SISTEMA DE PARTIDA REUTILIZÁVEL (seção 1b + "MONTAGEM DA PARTIDA" no fim): campo (tamanho,
       nº de jogadores, gol, aparência), times como dados (uniformes, reserva automático, nome,
       sigla, emblema, força, popularidade, formação, tática, técnico), 5 formações, 5 táticas,
       5 dificuldades, competição (liga/copa, rodada, mata-mata, ida/volta e agregado), banco de
       ~200 nomes com elencos salvos, técnico salvo, clima (seco/chuva/neve), gramado (alto/
       baixo), horário (dia/tarde/noite). API: window.FutebolJS (novaPartida, cadastrarTime...)
     - técnicos na área técnica; trocam a tática sozinhos (placar/tempo) ou pelo menu de pausa
     - torcida pela popularidade; cores da torcida = cores dos times
     - REPLAY do gol (10 s, 3 câmeras, repete até PULAR) e do impedimento (com as linhas)
     - goleiro: sai nos pés de quem chega devagar; espalma chute de dentro da área (segura 1/10);
       recuo de companheiro = joga com os pés (e pode ser pressionado)
     - zagueiros: quando só sobram eles, um sobe no bote e o outro cobre
     - perder a bola: passinhos desequilibrados, tropeço com o joelho no chão, ou queda
     - dribles por situação: arrancada, corte/carretel, pedalada, drible de corpo
     - domínio no peito de verdade (bola encosta no peito; lançamento pode virar peito)
     - torcida e som do gol seguram até a saída de bola; letreiro do gol some no iPhone
     - impedimento também vale para quem joga de primeira (cabeçada, voleio)

   Novidades da versão 3.10.7:
     - domínio difícil (ponto azul) vale para TODO domínio com risco, não só os acima de 50%
     - sons novos: trave/travessão metálico, "óóh" da torcida no chute para fora, passos na
       grama (só você correndo, baixinho); toques na bola com variações; gol com a torcida alta
       e constante em vez de explosão

   Novidades da versão 3.10.6:
     - relógio só corre com a bola rolando (parado na saída até o primeiro passe e em toda bola parada)
     - acréscimos (0, 30 s, 45 s ou 1 min) pelas paralisações; acabou o tempo, o juiz espera o lance
       terminar (gol no último lance vale; pênalti marcado no fim é cobrado)
     - cena do apito final: juiz apita, quem ganhou bate na mão do companheiro e dá tchau para a
       torcida, quem perdeu fica com as poses de derrota (botão Pular vai direto ao placar)
     - SONS gerados no código (sem arquivos): chute, toque, apito, torcida de fundo que reage ao
       lance, gol, defesa, cliques do domínio/drible e "fuuu" do drible. Botão SOM/MUDO no topo.

   Novidades da versão 3.10.5:
     - torcida: o pula-pula não acelera nem "embaralha" mais (a fase agora é somada no processador
       e dá a volta em 2π; antes ela crescia sem parar e saltava quando a velocidade mudava)
     - domínio DIFÍCIL: ponto azul pequeno (~3 marcadores) dentro da faixa verde. Azul = DOMÍNIO
       PERFEITO em câmera lenta; verde = não domina, mas conta como passe ruim (não erro seu)

   Novidades da versão 3.10.4:
     - disputa de corpo: correndo com a bola com o marcador do lado, ou dois correndo para a
       bola solta, cada um põe o braço (dobrado no cotovelo) do lado do outro e inclina o ombro
     - IA vai ao encontro da bola: prevê o voo com a curva do efeito, o quique e o atrito, e corre
       para o primeiro ponto onde alcança (na velocidade dela — pode não chegar)
     - depois do drible certo você continua correndo na direção do drible (até mexer no joystick,
       no máximo 2,5 s) e recupera 2 s de fôlego
     - falta e pênalti: você fica uns passos atrás da bola enquanto mira; escolhido tudo, corre,
       a perna vai para trás no último passo e a batida sai quando o pé chega na bola

   Novidades da versão 3.10.3:
     - mão na cintura de verdade: braço com COTOVELO e cabeça que abaixa (peças escondidas,
       iguais ao joelho, que só aparecem na pose de tristeza)
     - torcida nova: ~9 mil torcedores-sprite (sentado/em pé × azul/vermelho, 3 tons de pele,
       espelhados) numa arquibancada de degraus; pulam na placa de vídeo; gol faz a torcida do
       time explodir; de vez em quando passa uma "ola"
     - cavadinha: só funciona com o goleiro adiantado e depende da qualidade (força ~32%, pegar
       bem embaixo, mira); mal batida cai curta ou passa do travessão. Goleiro na linha pega.
     - goleiro pega o próprio rebote devagar (antes a bola ficava parada embaixo dele)

   Novidades da versão 13:
     - IA chuta de verdade: prepara (perna para trás) e bate forte, colocado ou de cavadinha;
       de longe chuta menos e erra mais. Cabeceia (passe, afastar, finalizar), voleio e bicicleta
       com as mesmas animações das suas
     - goleiro: bola no corpo é defesa (ou rebote), nunca "atravessa"; calcula o mergulho onde
       ele está (não na linha); chute de longe é mais fácil para ele
     - carrinho não gira no chão
     - lateral: sem animação de chute; braços vão para trás e jogam; câmera por cima do ombro;
       a câmera nunca fica atrás das placas
     - juiz não entra nas áreas e fica longe da bola; em bola parada fica num lugar de juiz
     - gol (contra ou a favor): todos param na hora e reagem (sem andar de costas)

   Novidades da versão 12:
     - gol sofrido: cada um reage de um jeito (mão na cintura, senta no chão, deita de costas)
     - PÊNALTI: falta dentro da área vira pênalti; todos saem da área, goleiro na linha; você
       bate com a seta (o goleiro escolhe um canto na hora do chute); a IA bate no canto
       (corrigido: a área conferida para "falta na área" era a do lado errado do campo)
     - bola parada sua já começa na seta (sem a tela de antes); mirando perto = passe rasteiro
     - IA não dá bote por trás; só o último homem persegue e ~10% das vezes faz a falta
     - bicicleta só nos ~19 m finais; na bola alta, bater na barra = cabecear (o seguro)
     - comemorações automáticas no seu gol: chutar a bandeirinha (ela balança) e subir na placa

   Versão 11.2:
     - joelhada conferida no 3D de verdade (Chromium + Three.js r128 rodando aqui): o tronco
       inclinava demais para trás e parecia que ele ia cair; agora fica quase reto

   Versão 11.1:
     - recepção decidida pela bola de VERDADE na chegada (avaliarChegada / CHEGADA): rasteira e
       até 15 m/s = domínio automático; o "escapou mesmo acertando" só vale para bola rápida
       de fato (19+ m/s), pingando forte ou alta demais, e a mensagem diz o motivo
     - drible: 2,2 s (no goleiro, 1,3 s)

   Novidades da versão 11:
     - bola parada sua (lateral, escanteio, falta): o joystick para o lado vira você e a câmera
       (até ~90° para cada lado); nenhuma bola parada tem relógio
     - arco de escanteio: só o quarto de círculo dentro do campo
     - joelhada com JOELHO: perna em duas partes só nessa animação (a versão com joelho fica
       escondida no resto do tempo, então não custa desempenho); não entra mais no gramado
     - chute/passe sem as etapas e dicas na tela (vão para o tutorial)
     - mirando, a câmera vira devagar para onde a seta aponta e abre a visão
     - aviãozinho: inclinação 15% menor e ombro colado no corpo com o braço aberto

   Versão 10:
     - impedimento: a câmera corta para o bandeirinha com a bandeira levantada
     - jogo parado (falta/impedimento/cobranças): você anda sozinho para a sua posição, longe
       da bola do adversário (9,15 m); quem cobra não pode ser desarmado; a IA espera o time
       se arrumar e toca para alguém
     - falta a seu favor: você só cobra no campo de ataque (perto do lance); lá atrás cobra o
       companheiro mais perto. Na sua cobrança não tem relógio
     - barreira: os braços voltam depois do pulo (o contador do pulo não zerava)
     - joelhada desliza ~2 s e fica pouco tempo parada; aviãozinho: você guia com o joystick e
       ele inclina para o lado da curva
     - gol de outro jogador: câmera na comemoração dele e a IA controla você
     - CHUTAR / CRUZAR: mirando num companheiro (e não no gol) vira cruzamento; ele cabeceia ou
       bate de primeira perto do gol, ou domina
     - goleiro: tronco reto segurando a bola (antes agachava e a bola ficava "dentro" dele)
     - 5 s parado com a bola: o adversário mais perto vem e desarma (limpo, sem falta)
     - drible no goleiro: 3 toques em ~1 s, precisa acertar os 3
     - carretel: às vezes o drible sai de carretel (bola por cima, com animação do calcanhar)

   Versão 9:
     - domínio com a mesma lógica do minigame de martelar do Super Lan Master (2 s), mas com o
       visual deste jogo (barra no alto, botões redondos); pé, peito, peito com pulo; se você
       estiver andando, continua andando depois de dominar
     - (9.1) a barra de domínio não fica mais presa na tela depois da jogada
     - bola por cima da cabeça: CABECEAR (toca no companheiro mais perto) ou FINALIZAR
       (cabeçada, voleio ou bicicleta, conforme você está virado para o gol)
     - bola muito rápida, alta ou quebrada pode escapar mesmo acertando o martelo
     - câmera lenta das ações com toque 25% mais lenta
     - goleiro contorna traves e rede; bola não gira nas mãos; bola nova com estrelas
     - juiz + 2 bandeirinhas, impedimento (linha no penúltimo defensor, só no campo adversário)
     - faltas: desarme por trás é falta; 3 faltas = amarelo, mais 2 = vermelho; carrinho por
       trás sem pegar a bola = vermelho direto; carrinho (botão CARRINHO / tecla Q)
     - cobrança de falta com barreira (cena) e cobrador esperando; você cobra igual ao chute
     - simplificação: falta dentro da área vira falta na entrada da área (pênalti fica para depois)

   Versão 8:
     - tiro de meta com bola reserva no suporte ao lado do gol; ela some quando o goleiro pega
       e reaparece (surgindo aos poucos, 3 s) depois da cobrança
     - drible só contra quem está na sua frente; queda do marcador refeita (bote, tropeço,
       mãos no chão) sem atravessar o gramado
     - goleiro segura a bola entre as mãos
     - câmera lenta das ações com toque 50% mais lenta (mira, drible, domínio)
     - IA com passe pelo alto e passe na frente do companheiro (ele corre para buscar)

   Versão 7 (desempenho): torcida pré-renderizada (o desfoque da v6 travava o jogo),
     bonecos e cenário juntados em poucas malhas (de ~630 para ~110 chamadas de desenho).

   Novidades da versão 6:
     - drible: 3 s de tela, câmera de lado em corte seco, sem mudar ninguém de lugar;
       o marcador estica a perna para a bola, erra, tropeça e cai de frente
     - chute/passe: o jogador se prepara em câmera lenta; 6 s para decidir ou ele fura,
       e dá para ter a bola roubada nesse tempo
     - gol seu: até 10 s com o jogador na mão (estamina infinita) e 2 comemorações
     - torcida com 3 andares, mais longe e suavizada
     - saída de bola: um toque só no PASSAR, com o companheiro do lado
     - chute no ângulo: cena lenta com cortes de câmera até o resultado (estilo Skyrim)

   Novidades da versão 5:
     - saída de bola de verdade: o atacante toca para o meia ao lado (todos parados até o toque)
     - volta a câmera de cinema (faixas pretas) na busca da bola em lateral, escanteio e tiro de meta
     - domínio: a tela abre antes e a bola desacelera para parar na sua frente, sem atravessar você
     - o botão DRIBLAR só aparece quando um marcador vem para cima de você

   Novidades da versão 4:
     - formação de ataque (todos sobem e abrem) e de defesa (bloco recua), com o atacante
       sempre esperando lá na frente; 2 companheiros dão apoio a quem está com a bola
     - a IA toca entre si e escolhe o melhor passe (sem preferência por você)
     - estamina de 10 s
     - bola fora sem cortes: o cobrador sai de onde está, busca a bola de verdade, leva até a
       linha e a cobrança só sai quando o time estiver posicionado, para a melhor opção
     - goleiro: bola entre as mãos, posição de defesa quando o ataque chega, e só mergulha
       se a bola vier no gol e ao alcance (senão só acompanha com os olhos)
     - na mira, só a seta gira (o jogador não gira junto)

   Novidades da versão 3:
     - câmera da bola (estilo "Rumo ao Estrelato"): fica atrás de você virada para a bola;
       o botão CÂM troca para a câmera fixa para frente. Os controles seguem a câmera.
     - estamina: 10 s de corrida contínua, 10 s para recuperar tudo
     - drible na direção em que você está indo, com zoom, e tempo de recarga
     - passe com só duas etapas (direção e força)
     - campo e gols maiores, placas de publicidade em volta, torcida mais longe e animada
     - goleiro com mergulho, pulo, postura de espera e bola nas mãos
     - IA com posições que variam, marcação de frente para a bola (de costas para o gol),
       meio agachada perto de quem conduz, e que contém em vez de grudar em você
     - lateral, escanteio e tiro de meta viram cenas curtas que dá para pular
     - revisão de desempenho (ver o comentário "DESEMPENHO" perto do fim)

   Como o código está organizado (procure pelos números):
     1. CONFIGURAÇÕES ........ números que dá para ajustar sem medo
     2. UTILITÁRIOS .......... funções pequenas de matemática
     3. CENA 3D ............... renderizador pixelado, luz, câmera
     4. CENÁRIO ............... gramado, placas, arquibancadas animadas, gols
     5. JOGADORES ............. boneco de blocos e criação dos times
     6. BOLA .................. bola em jogo e "bola morta" (a que saiu)
     7. ESTADO DO JOGO ........ variável G com tudo da partida
     8. IA .................... cérebro dos outros 13 jogadores e do goleiro
     9. FÍSICA DA BOLA ........ gravidade, quique, curva (efeito)
    10. CONTATOS E REGRAS ..... quem pega a bola, gol, saída de bola
    11. BOLA PARADA ........... cenas de lateral, escanteio e tiro de meta
    12. AÇÕES DO JOGADOR ...... chute, passe, domínio, desarme, estamina
    13. CENA DO DRIBLE ........ zoom + câmera lenta + animação automática
    14. MINIGAME DE TEMPO ..... motor usado no drible e no domínio
    15. ENTRADAS .............. joystick, mira, teclado
    16. HUD E TELAS ........... placar, botões, radar, menus
    17. CÂMERA E DESENHO ...... câmeras, tremida, animação dos bonecos
    18. LOOP PRINCIPAL ........ roda ~60 vezes por segundo

   Coordenadas do campo (em metros):
     - eixo X = comprimento. Seu time (AZUL) ataca para +X.
     - eixo Z = largura.
     - eixo Y = altura.
   ===================================================================== */

// ---------------------------------------------------------------------
// 1. CONFIGURAÇÕES
// ---------------------------------------------------------------------
// Versão do jogo (aparece na tela inicial; o carregador do Canva usa para avisar de atualização).
const VERSAO_JOGO = '14.0';
window.__FUTEBOL_VERSAO = VERSAO_JOGO;

const CONFIG = {
  RENDER_H: 320,             // altura interna do desenho em pixels (o Super Lan Master usa 360)
  FIELD_L: 96,               // comprimento do campo (m)
  FIELD_W: 62,               // largura do campo (m)
  GOAL_W: 8.6,               // largura do gol (maior que o real, para combinar com os bonecos cabeçudos)
  GOAL_H: 2.9,               // altura do gol
  BOARD_GAP: 4,              // distância das placas de publicidade até as linhas
  BALL_R: 0.22,
  MATCH_SECONDS: 300,

  USER_WALK: 3.2,            // seu jogador andando (m/s)
  USER_RUN: 7.2,             // ...correndo (joystick no fim)
  USER_WALK_BALL: 3.0,
  USER_RUN_BALL: 6.2,
  RUN_THRESHOLD: 0.92,       // quanto do joystick precisa empurrar para correr (0 a 1)
  STAMINA_RUN_TIME: 10,      // segundos de corrida contínua com a barra cheia
  STAMINA_REGEN_TIME: 10,    // segundos para encher a barra do zero
  STAMINA_REGEN_DELAY: 0.6,  // espera depois de parar de correr antes de recuperar
  STAMINA_MIN_TO_RUN: 0.15,  // depois de esgotar, precisa recuperar isso para correr de novo
  AI_SPEED: 6.0,
  AI_SPEED_BALL: 5.2,
  GK_SPEED: 5.5,

  CAM: { back: 6.4, height: 4.3, ahead: 3.0, lookY: 0.9, turn: 2.2 }, // turn = rapidez do giro da câmera da bola
  RUN_SHAKE: 0.07,           // força da tremida da câmera na corrida (0 = sem tremer)
  LABEL_RANGE: 15,           // até que distância aparecem as etiquetas de nome

  SLOWMO_AIM: 0.075,         // câmera lenta da mira (lenta, mas o marcador ainda chega e pode roubar)
  KICK_TIME_LIMIT: 6,        // segundos para escolher direção, força e efeito, senão o jogador fura
  CELEB_TIME: 10,            // segundos de comemoração livre depois do seu gol
  SHOT_CINE_SLOWMO: 0.2,     // câmera lenta da cena do chute no ângulo
  SLOWMO_DRIBBLE: 0.056,
  SLOWMO_TRAP: 0.0225,       // câmera lenta da recepção (minigame do martelo)

  SHOT_SPEED: [12, 32],
  PASS_SPEED: [6, 24],
  THROW_MAX: 15,             // velocidade máxima do arremesso lateral
  POWER_FILL_TIME: 1.1,
  SHOT_SWEET: [0.72, 0.88],

  DRIBBLE_TIME: 2.2,        // tela do drible (s)
  DRIBBLE_TIME_GK: 1.3,     // drible no goleiro (3 toques)
  DRIBBLE_TAPS: 2,
  DRIBBLE_NEEDED: 2,
  DRIBBLE_RANGE: 4,
  DRIBBLE_COOLDOWN: 8,       // segundos até poder driblar de novo

  BROKEN_PASS_CHANCE: 0.45,
  AI_TACKLE_CHANCE: 0.25,
  TACKLE_RANGE: 1.3,

  GRAVITY: 9.8,
  CURVE: 7,
  LIFT: 4,
};
// Medidas do campo. São "let" porque cada partida pode ter um campo diferente (aplicarDimensoes).
// ESC/ESC_W = tamanho deste campo em relação ao campo de referência (96 × 62): os números da IA
// que eram em metros (distâncias de marcação, de chute...) são multiplicados por eles.
let HALF_L = CONFIG.FIELD_L / 2;
let HALF_W = CONFIG.FIELD_W / 2;
let GOAL_HALF = CONFIG.GOAL_W / 2;
const BOX = { depth: 16, half: 20 };       // grande área
const SMALL_BOX = { depth: 5.5, half: 10 };// pequena área
let PEN_SPOT = 11, CIRCLE_R = 9;
let BOARD_X = HALF_L + CONFIG.BOARD_GAP, BOARD_Z = HALF_W + CONFIG.BOARD_GAP;
// (4.1.3) Lado do BANCO (z < 0): a placa/grade fica mais para fora, para caber bandeirinha, técnico,
// banco e reservas sem ninguém encostar em ninguém. Distâncias a partir da linha lateral:
//   bandeirinha 1,3 · placa do 4º árbitro 1,9 · quem espera para entrar e 4º árbitro 2,4 ·
//   técnico 3,2 · banco 4,8 · placa/grade 6,5 (o outro lado continua a 4).
let BOARD_ZN = BOARD_Z;
const LADO_BANCO = { extra: 2.5, placaTroca: 1.9, espera: 2.4, quarto: 2.4, tecnico: 3.2, banco: 4.8 };
const limZ = (sz) => (sz < 0 ? BOARD_ZN : BOARD_Z);   // placa/grade do lado sz
let ESC = 1, ESC_W = 1;
function aplicarDimensoes(campo) {
  CONFIG.FIELD_L = campo.comprimento; CONFIG.FIELD_W = campo.largura;
  HALF_L = CONFIG.FIELD_L / 2; HALF_W = CONFIG.FIELD_W / 2;
  ESC = CONFIG.FIELD_L / 96; ESC_W = CONFIG.FIELD_W / 62;
  CONFIG.GOAL_W = campo.gol && campo.gol.largura ? campo.gol.largura : 8.6 * clamp(ESC, 0.65, 1);
  CONFIG.GOAL_H = campo.gol && campo.gol.altura ? campo.gol.altura : 2.9;
  GOAL_HALF = CONFIG.GOAL_W / 2;
  BOX.depth = 16 * ESC; BOX.half = Math.min(20 * ESC_W, HALF_W - 3);
  SMALL_BOX.depth = 5.5 * ESC; SMALL_BOX.half = Math.min(10 * ESC_W, BOX.half - 2);
  PEN_SPOT = 11 * ESC; CIRCLE_R = 9 * Math.min(ESC, ESC_W);
  BOARD_X = HALF_L + CONFIG.BOARD_GAP; BOARD_Z = HALF_W + CONFIG.BOARD_GAP;
  BOARD_ZN = BOARD_Z + ((campo.estadio || 'arena') === 'society' ? 0 : LADO_BANCO.extra);
}

// ---------------------------------------------------------------------
// 2. UTILITÁRIOS
// ---------------------------------------------------------------------
const $ = (id) => document.getElementById(id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (a, b) => a + Math.random() * (b - a);
const dist2D = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const smooth = (t) => t * t * (3 - 2 * t);
function wrapAngle(d) {
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}
const turnToward = (a, b, step) => a + clamp(wrapAngle(b - a), -step, step);
function bezier(p0, p1, p2, t) {
  const u = 1 - t;
  return { x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x, z: u * u * p0.z + 2 * u * t * p1.z + t * t * p2.z };
}
function distPointSegment(pt, a, b) {
  const abx = b.x - a.x, abz = b.z - a.z;
  const len2 = abx * abx + abz * abz || 1;
  const t = clamp(((pt.x - a.x) * abx + (pt.z - a.z) * abz) / len2, 0, 1);
  return Math.hypot(a.x + abx * t - pt.x, a.z + abz * t - pt.z);
}
function nearestOf(list, pt, skip) {
  let best = null, bd = Infinity;
  for (const p of list) { if (p === skip) continue; const d = dist2D(p, pt); if (d < bd) { bd = d; best = p; } }
  return { p: best, d: bd };
}
// Traves e rede são sólidas para os jogadores: ninguém atravessa a lateral nem o fundo da rede,
// e as traves empurram para fora. (ox, oz) = posição antes do passo.
const GOAL_DEPTH = 2.2, BODY_R = 0.3;
function goalCollide(p, ox, oz) {
  for (const side of [-1, 1]) {
    const gx = side * HALF_L, bx = gx + side * GOAL_DEPTH;
    const rel = (p.x - gx) * side;                  // quanto está atrás da linha de fundo (dentro da área do gol)
    // Laterais da rede (z = ±metade do gol, entre a linha de fundo e o fundo da rede).
    if (rel > -0.05 && rel < GOAL_DEPTH + BODY_R) {
      for (const zn of [-GOAL_HALF, GOAL_HALF]) {
        const antes = oz - zn, agora = p.z - zn;
        if (Math.sign(antes) !== Math.sign(agora) || Math.abs(agora) < BODY_R) {
          const lado = Math.sign(antes) || 1;
          p.z = zn + lado * BODY_R;
        }
      }
    }
    // Fundo da rede.
    if (Math.abs(p.z) < GOAL_HALF && Math.abs(p.x - bx) < 1.2) {
      const lado = Math.sign(ox - bx) || -side;
      if (Math.sign(p.x - bx) !== lado || Math.abs(p.x - bx) < BODY_R) p.x = bx + lado * BODY_R;
    }
    // Traves (círculos).
    for (const zn of [-GOAL_HALF, GOAL_HALF]) {
      const dx = p.x - gx, dz = p.z - zn, d = Math.hypot(dx, dz), r = 0.12 + BODY_R;
      if (d < r && d > 0.0001) { p.x = gx + dx / d * r; p.z = zn + dz / d * r; }
    }
  }
}
// Caminho que contorna o gol: se o trajeto até o alvo cruza a armação, passa antes pela frente da trave.
function rotaGol(p, tx, tz) {
  for (const side of [-1, 1]) {
    const gx = side * HALF_L;
    const foraP = (p.x - gx) * side > -0.2, foraT = (tx - gx) * side > -0.2;
    if (foraP === foraT) continue;                  // os dois do mesmo lado da linha de fundo
    const fora = foraP ? p : { x: tx, z: tz }, dentro = foraP ? { x: tx, z: tz } : p;
    const k = (gx - dentro.x) / ((fora.x - dentro.x) || 1e-6);   // onde o trajeto cruza a linha de fundo
    const zc = dentro.z + (fora.z - dentro.z) * k;
    if (Math.abs(zc) < GOAL_HALF + 0.7) {
      const lado = Math.sign(fora.z) || 1;
      const wp = { x: gx - side * 0.9, z: lado * (GOAL_HALF + 1.0) };
      if (Math.hypot(p.x - wp.x, p.z - wp.z) > 0.4) return wp;
    }
  }
  return { x: tx, z: tz };
}

// Anda até um ponto (usado nas cenas), contornando o gol. Devolve true quando chegou.
// 4.1.1: jogadores esbarram no banco de reservas (retângulo) e no técnico (círculo).
const RAIO_JOGADOR = 0.32, RAIO_TECNICO = 0.32;
function colisaoArredores(p) {
  if (p.out) return;
  for (const B of BANCOS) {
    const cx = clamp(p.x, B.x0, B.x1), cz = clamp(p.z, B.z0, B.z1);
    const dx = p.x - cx, dz = p.z - cz, d = Math.hypot(dx, dz);
    if (d >= RAIO_JOGADOR) continue;
    if (d > 1e-4) { p.x = cx + dx / d * RAIO_JOGADOR; p.z = cz + dz / d * RAIO_JOGADOR; }
    else p.z = B.z1 + RAIO_JOGADOR;                 // caiu dentro: empurra para o lado do campo
    const nx = d > 1e-4 ? dx / d : 0, nz = d > 1e-4 ? dz / d : 1, vn = p.vx * nx + p.vz * nz;
    if (vn < 0) { p.vx -= vn * nx; p.vz -= vn * nz; }
  }
  for (const t of tecnicos) {
    if (t.abraco) continue;                          // abraçando: os dois ficam colados de propósito
    const tp = t.mesh.raiz.position, dx = p.x - tp.x, dz = p.z - tp.z, d = Math.hypot(dx, dz), min = RAIO_JOGADOR + RAIO_TECNICO;
    if (d >= min) continue;
    const nx = d > 1e-4 ? dx / d : 0, nz = d > 1e-4 ? dz / d : 1;
    p.x = tp.x + nx * min; p.z = tp.z + nz * min;
    const vn = p.vx * nx + p.vz * nz;
    if (vn < 0) { p.vx -= vn * nx; p.vz -= vn * nz; t.esbarrao = Math.max(t.esbarrao || 0, Math.min(0.5, -vn * 0.08)); }
  }
}

function walkTo(p, tx, tz, speed, dt) {
  const alvo = rotaGol(p, tx, tz);
  const desvio = alvo.x !== tx || alvo.z !== tz;
  tx = alvo.x; tz = alvo.z;
  const dx = tx - p.x, dz = tz - p.z, d = Math.hypot(dx, dz);
  if (d < 0.12 && !desvio) { p.vx = p.vz = 0; return true; }
  const step = Math.min(d, speed * dt);
  const ox = p.x, oz = p.z;
  p.x += dx / d * step; p.z += dz / d * step;
  goalCollide(p, ox, oz);
  colisaoArredores(p);
  p.vx = dx / d * speed; p.vz = dz / d * speed;
  p.angle = turnToward(p.angle, Math.atan2(dz, dx), 10 * dt);
  p.anim += speed * 2.6 * dt;
  return false;
}

// =====================================================================
// 1b. SISTEMA DE PARTIDA REUTILIZÁVEL (4.0.0)
// Tudo que muda de um jogo para outro (modo história) é DADO, não código espalhado:
//   PARTIDA ........ a partida atual: campo, times, competição, dificuldade, clima, gramado,
//                    horário, duração e quem é você (ver PARTIDA_PADRAO)
//   CAMPOS ......... modelos de campo (tamanho, nº de jogadores, gol, aparência do gramado)
//   TIMES .......... times cadastrados (uniformes, nome, sigla, emblema, força, popularidade,
//                    formação e tática preferidas, técnico). O ELENCO vem do banco de nomes.
//   FORMACOES ...... 5 formações; cada uma se adapta ao número de jogadores do campo
//   TATICAS ........ 5 táticas (números que mudam o jeito da IA jogar)
//   DIFICULDADES ... 5 níveis
//   NOMES .......... ~200 nomes; o elenco de cada time é sorteado UMA vez e salvo no aparelho
// Para jogar outra partida: FutebolJS.novaPartida({ ... }) — ver o fim do arquivo.
// Para acrescentar uma formação/tática/time: é só uma entrada nova nos objetos abaixo.
// =====================================================================

// ---- Campos. comprimento/largura em metros; jogadores = por time, contando o goleiro.
// estadio: 'arena' (arquibancada, placas, refletores) | 'varzea' (alambrado, torcida em pé,
//          arquibancadinha de cimento, postes simples) | 'society' (rede em volta, quadra fechada)
// regras (o que faltar vem de REGRAS_PADRAO): impedimento, acréscimos, lateral 'mao' ou 'pe',
//          substituições por time (99 = à vontade) e se os amarelos acumulam para suspensão.
const REGRAS_PADRAO = { impedimento: true, acrescimos: true, lateral: 'mao', substituicoes: 3, cartoesAcumulam: true };
const CAMPOS = {
  estadio: { nome: 'Estádio (7 x 7)', comprimento: 96, largura: 62, jogadores: 7, estadio: 'arena',
    regras: { substituicoes: 3 },
    aparencia: { gramaA: '#2f7a31', gramaB: '#37893a', fundo: '#2a6e2c', padrao: 'faixas', faixas: 16, linhas: '#e9ecdf' } },
  varzea: { nome: 'Várzea (7 x 7)', comprimento: 78, largura: 48, jogadores: 7, estadio: 'varzea',
    regras: { substituicoes: 5 },
    aparencia: { gramaA: '#5d7a33', gramaB: '#6b8a3a', fundo: '#7a6a45', padrao: 'manchas', faixas: 0, linhas: '#f1ead2' } },
  society: { nome: 'Society (5 x 5)', comprimento: 48, largura: 30, jogadores: 5, gol: { largura: 5.5, altura: 2.3 }, estadio: 'society',
    regras: { impedimento: false, acrescimos: false, lateral: 'pe', substituicoes: 99, cartoesAcumulam: false },
    aparencia: { gramaA: '#2c8a3e', gramaB: '#2c8a3e', fundo: '#1f5f2b', padrao: 'liso', faixas: 0, linhas: '#ffffff' } },
  oficial: { nome: 'Oficial (11 x 11)', comprimento: 105, largura: 68, jogadores: 11, estadio: 'arena',
    regras: { substituicoes: 5 },
    aparencia: { gramaA: '#2f7a31', gramaB: '#37893a', fundo: '#2a6e2c', padrao: 'xadrez', faixas: 14, linhas: '#e9ecdf' } },
};

// ---- Formações. "linhas" = quantos jogadores em cada linha, da defesa para o ataque, por
// número de jogadores de LINHA (sem o goleiro). Se o número não estiver na lista, o jogo divide
// proporcionalmente (ver montarFormacao). A primeira linha é zaga (DEF), a última é ataque
// (FWD), as do meio são meio-campo (MID).
const FORMACOES = {
  '4-4-2':   { nome: '4-4-2 (clássica)',    linhas: { 4: [2, 1, 1], 6: [2, 3, 1], 10: [4, 4, 2] } },
  '4-3-3':   { nome: '4-3-3 (ofensiva)',    linhas: { 4: [1, 2, 1], 6: [2, 2, 2], 10: [4, 3, 3] } },
  '5-3-2':   { nome: '5-3-2 (defensiva)',   linhas: { 4: [2, 1, 1], 6: [3, 2, 1], 10: [5, 3, 2] } },
  '3-5-2':   { nome: '3-5-2 (meio forte)',  linhas: { 4: [1, 2, 1], 6: [2, 3, 1], 10: [3, 5, 2] } },
  '4-2-3-1': { nome: '4-2-3-1 (compacta)',  linhas: { 4: [1, 1, 1, 1], 6: [2, 1, 2, 1], 10: [4, 2, 3, 1] } },
};

// ---- Táticas. Valores 1 = normal. Usados em aiCarry, bestPassReceiver, formationTarget,
// supportTarget e updateDrift:
//   passe ........ chance de tocar a cada decisão (livre)    pressao ... chance de tocar marcado
//   chute ........ multiplica a vontade de chutar             distIdeal . distância de passe preferida
//   bloco ........ desloca o time inteiro (m, negativo = recua)   largura .. abre/fecha o time
//   apoio ........ distância de quem vem dar apoio            corridas . chance de infiltração
//   contra ....... recuperou a bola: lançamento rápido para quem está lá na frente
//   cruzar ....... pelos lados, perto da área: cruza para a área
//   falso9 ....... o centroavante recua para receber e tocar (pivô)
//   zagaFica ..... no ataque a zaga não passa do meio
const TATICAS = {
  tikitaka:   { nome: 'Tiki-taka',     passe: 0.35, pressao: 0.85, chute: 0.75, distIdeal: 10, bloco: 2, largura: 0.9, apoio: 0.7, corridas: 0.25 },
  falso9:     { nome: 'Falso 9',       passe: 0.2, pressao: 0.7, chute: 1, distIdeal: 14, bloco: 0, largura: 1.05, apoio: 0.9, corridas: 0.6, falso9: true },
  retranca:   { nome: 'Retranca',      passe: 0.1, pressao: 0.6, chute: 1.2, distIdeal: 18, bloco: -8, largura: 0.75, apoio: 1.1, corridas: 0.08, zagaFica: true },
  contra:     { nome: 'Contra-ataque', passe: 0.1, pressao: 0.6, chute: 1.1, distIdeal: 22, bloco: -5, largura: 0.95, apoio: 1, corridas: 0.35, contra: true },
  aerea:      { nome: 'Bola aérea',    passe: 0.12, pressao: 0.6, chute: 0.9, distIdeal: 16, bloco: 1, largura: 1.35, apoio: 1, corridas: 0.3, cruzar: 0.55 },
};

// ---- Dificuldade. nivel entra na conta junto com a diferença de força dos times (ver
// calcularAjuste). Quanto mais "pesado" o jogo, melhor a IA adversária e pior a sua, mas tudo com
// TETO: você (o seu jogador, os minigames, o tempo) nunca muda, então sempre dá para ganhar.
const DIFICULDADES = {
  muito_facil:   { nome: 'Muito fácil',   nivel: -2 },
  facil:         { nome: 'Fácil',         nivel: -1 },
  normal:        { nome: 'Normal',        nivel: 0 },
  dificil:       { nome: 'Difícil',       nivel: 1 },
  muito_dificil: { nome: 'Muito difícil', nivel: 2 },
};

// ---- Times. Cores em '#rrggbb'. forca 0–100. popularidade 0–1 (quanto de torcida leva).
// uniforme2 é o reserva (usado quando as camisas dos dois times são parecidas).
// emblema: forma 'escudo' | 'circulo' | 'losango', duas cores e até 3 letras.
const TIMES = {
  azulao: { id: 'azulao', nome: 'Azulão FC', sigla: 'AZU', forca: 70, popularidade: 0.65, formacao: '4-4-2', tatica: 'tikitaka',
    uniforme: { camisa: '#0B4F9C', listra: '#F7941D', gola: '#08326A', calcao: '#F2F2EE', meia: '#0B4F9C', sola: '#F7941D', goleiro: '#1F9E5C' },
    uniforme2: { camisa: '#F2F2EE', listra: '#0B4F9C', gola: '#0B4F9C', calcao: '#0B4F9C', meia: '#F2F2EE', sola: '#0B4F9C', goleiro: '#E0B22A' },
    emblema: { forma: 'escudo', cor1: '#0B4F9C', cor2: '#F7941D', letras: 'AZ' },
    tecnico: { nome: 'Seu Bené', aparencia: { pele: '#946042', cabelo: '#D8D8D8', estilo: 2, roupa: '#1D2A44' } } },
  ataliba: { id: 'ataliba', nome: 'Ataliba EC', sigla: 'ATA', forca: 68, popularidade: 0.55, formacao: '4-3-3', tatica: 'contra',
    uniforme: { camisa: '#C8352B', listra: '#F2F2EE', gola: '#7E1E17', calcao: '#1B1D22', meia: '#C8352B', sola: '#F2F2EE', goleiro: '#E0B22A' },
    uniforme2: { camisa: '#1B1D22', listra: '#C8352B', gola: '#C8352B', calcao: '#1B1D22', meia: '#1B1D22', sola: '#C8352B', goleiro: '#1F9E5C' },
    emblema: { forma: 'circulo', cor1: '#C8352B', cor2: '#F2F2EE', letras: 'EC' },
    tecnico: { nome: 'Professor Moacir', aparencia: { pele: '#DDA67E', cabelo: '#3B2416', estilo: 0, roupa: '#3A0E0B' } } },
  verdao: { id: 'verdao', nome: 'Verdão da Várzea', sigla: 'VDV', forca: 55, popularidade: 0.35, formacao: '5-3-2', tatica: 'retranca',
    uniforme: { camisa: '#1F8A3B', listra: '#F2F2EE', gola: '#0F4A20', calcao: '#F2F2EE', meia: '#1F8A3B', sola: '#F2F2EE', goleiro: '#7A3BC8' },
    uniforme2: { camisa: '#F2F2EE', listra: '#1F8A3B', gola: '#1F8A3B', calcao: '#1F8A3B', meia: '#F2F2EE', sola: '#1F8A3B', goleiro: '#E0B22A' },
    emblema: { forma: 'losango', cor1: '#1F8A3B', cor2: '#F2F2EE', letras: 'V' },
    tecnico: { nome: 'Tio Zeca', aparencia: { pele: '#BF8159', cabelo: '#0E0E0E', estilo: 1, roupa: '#2B3A1F' } } },
  leoes: { id: 'leoes', nome: 'Leões do Norte', sigla: 'LEO', forca: 82, popularidade: 0.85, formacao: '4-2-3-1', tatica: 'falso9',
    uniforme: { camisa: '#F2C230', listra: '#111111', gola: '#111111', calcao: '#111111', meia: '#F2C230', sola: '#111111', goleiro: '#2A72D6' },
    uniforme2: { camisa: '#111111', listra: '#F2C230', gola: '#F2C230', calcao: '#111111', meia: '#111111', sola: '#F2C230', goleiro: '#F2F2EE' },
    emblema: { forma: 'escudo', cor1: '#111111', cor2: '#F2C230', letras: 'LN' },
    tecnico: { nome: 'Mister Raul', aparencia: { pele: '#F2C9A5', cabelo: '#6B4423', estilo: 0, roupa: '#111111' } } },
  tubaroes: { id: 'tubaroes', nome: 'Tubarões do Rio', sigla: 'TUB', forca: 62, popularidade: 0.5, formacao: '3-5-2', tatica: 'aerea',
    uniforme: { camisa: '#14A3B8', listra: '#F2F2EE', gola: '#0B5C68', calcao: '#F2F2EE', meia: '#14A3B8', sola: '#F2F2EE', goleiro: '#F7941D' },
    uniforme2: { camisa: '#0B5C68', listra: '#F2F2EE', gola: '#F2F2EE', calcao: '#0B5C68', meia: '#0B5C68', sola: '#F2F2EE', goleiro: '#E0B22A' },
    emblema: { forma: 'circulo', cor1: '#14A3B8', cor2: '#0B5C68', letras: 'TR' },
    tecnico: { nome: 'Dona Célia', aparencia: { pele: '#62402A', cabelo: '#0E0E0E', estilo: 1, roupa: '#0B5C68' } } },
  operarios: { id: 'operarios', nome: 'Operário da Vila', sigla: 'OPE', forca: 45, popularidade: 0.25, formacao: '4-4-2', tatica: 'contra',
    uniforme: { camisa: '#6E737A', listra: '#F7941D', gola: '#3B3F45', calcao: '#3B3F45', meia: '#6E737A', sola: '#F7941D', goleiro: '#1F9E5C' },
    uniforme2: { camisa: '#F7941D', listra: '#3B3F45', gola: '#3B3F45', calcao: '#3B3F45', meia: '#F7941D', sola: '#3B3F45', goleiro: '#1F9E5C' },
    emblema: { forma: 'escudo', cor1: '#3B3F45', cor2: '#F7941D', letras: 'OV' },
    tecnico: { nome: 'Mestre Dito', aparencia: { pele: '#946042', cabelo: '#0E0E0E', estilo: 2, roupa: '#3B3F45' } } },
};

// ---- Banco de nomes (apelidos de boleiro). O elenco de cada time é sorteado daqui uma vez e
// salvo (localStorage 'futebolJs.elencos.v1'), então o time tem sempre os mesmos jogadores.
const NOMES = [
  'Tiago', 'Bruno', 'Caio', 'Davi', 'Igor', 'Léo', 'Paulão', 'Marcão', 'Neto', 'Juninho', 'Rafa', 'Dudu', 'Pedrinho',
  'Alemão', 'Baiano', 'Biro', 'Bolota', 'Cabeça', 'Café', 'Careca', 'Cauã', 'Chicão', 'Cícero', 'Cleiton', 'Coxinha',
  'Danilo', 'Deco', 'Didi', 'Diego', 'Dinho', 'Edinho', 'Edu', 'Elias', 'Emerson', 'Everton', 'Fabinho', 'Fabrício',
  'Felipe', 'Fernandinho', 'Fumaça', 'Gabriel', 'Galego', 'Gegê', 'Gil', 'Gordo', 'Guga', 'Guilherme', 'Gustavo',
  'Hélio', 'Henrique', 'Hugo', 'Ian', 'Índio', 'Isaac', 'Jair', 'Japa', 'Jefinho', 'Jean', 'Jeferson', 'Joca',
  'Joel', 'Jonas', 'Jorginho', 'Josué', 'Júlio', 'Kaio', 'Kauê', 'Kelvin', 'Kiko', 'Lalo', 'Lau', 'Leandro',
  'Lelê', 'Lindomar', 'Luan', 'Lucas', 'Luisão', 'Magrão', 'Maicon', 'Manoel', 'Marcelinho', 'Mário', 'Mateus',
  'Maurício', 'Mineiro', 'Moisés', 'Morais', 'Naldo', 'Nando', 'Nei', 'Nenê', 'Nico', 'Nilo', 'Nonato', 'Otávio',
  'Pablo', 'Pardal', 'Paulinho', 'Pelado', 'Perninha', 'Pipoca', 'Preto', 'Quinho', 'Rafinha', 'Raí', 'Ramires',
  'Ratinho', 'Reinaldo', 'Renan', 'Ricardinho', 'Riquelme', 'Robson', 'Rodrigo', 'Romário', 'Ronaldinho', 'Rony',
  'Russo', 'Sabiá', 'Samuca', 'Sandro', 'Saulo', 'Serginho', 'Sidney', 'Silas', 'Sócrates', 'Tadeu', 'Talles',
  'Tatu', 'Téo', 'Thiaguinho', 'Tinga', 'Titi', 'Toninho', 'Tuca', 'Uelinton', 'Uri', 'Valdir', 'Vavá', 'Vini',
  'Vitinho', 'Wagner', 'Waldir', 'Wesley', 'Willian', 'Xande', 'Xavier', 'Xuxa', 'Yago', 'Yuri', 'Zé', 'Zeca',
  'Zinho', 'Zico', 'Abel', 'Adriano', 'Alan', 'Alex', 'Allan', 'Anderson', 'André', 'Arthur', 'Baco', 'Beto',
  'Bigode', 'Bira', 'Boca', 'Branco', 'Breno', 'Buiú', 'Canhoto', 'Carlinhos', 'Cascão', 'Charles', 'Chico',
  'Choco', 'Cocada', 'Cuca', 'Dagoberto', 'Dentinho', 'Denílson', 'Dida', 'Dorival', 'Dorinho', 'Eder', 'Elano',
  'Fininho', 'Formiga', 'Fred', 'Gaúcho', 'Giba', 'Grafite', 'Gringo', 'Jacaré', 'Kaká', 'Lagarto', 'Lambari',
  'Mancha', 'Marrom', 'Michel', 'Miro', 'Neguinho', 'Pato', 'Pezão', 'Piá', 'Quixadá', 'Sapo', 'Tico', 'Tobias',
];
const NOMES_TECNICO = ['Professor Carlão', 'Seu Bené', 'Mister Raul', 'Tio Zeca', 'Mestre Dito', 'Dona Célia', 'Professor Moacir',
  'Seu Jorjão', 'Comandante Lula', 'Doutor Valter', 'Professora Neide', 'Tio Juca'];

// ---- Armazenamento no aparelho (com proteção: no modo privado ele pode não existir).
const salvo = {
  ler(chave, padrao) { try { const v = localStorage.getItem(chave); return v ? JSON.parse(v) : padrao; } catch (e) { return padrao; } },
  gravar(chave, valor) { try { localStorage.setItem(chave, JSON.stringify(valor)); } catch (e) { /* sem espaço/privado */ } },
};

// Elenco do time (16 jogadores: nome + aparência). Sorteado na primeira vez e salvo. Os nomes
// não se repetem entre times enquanto o banco tiver nomes livres.
function elencoDoTime(time) {
  const todos = salvo.ler('futebolJs.elencos.v1', {});
  if (todos[time.id] && todos[time.id].length >= 16) return todos[time.id];
  const usados = new Set(Object.values(todos).flat().map((j) => j.nome));
  const livres = NOMES.filter((n) => !usados.has(n));
  const fonte = livres.length >= 16 ? livres : NOMES.slice();
  const elenco = [];
  for (let i = 0; i < 16; i++) {
    const nome = fonte.splice(Math.floor(Math.random() * fonte.length), 1)[0];
    elenco.push({ nome, pele: PELES[Math.floor(Math.random() * PELES.length)], cabelo: CABELOS[Math.floor(Math.random() * CABELOS.length)], estilo: Math.floor(Math.random() * 3) });
  }
  todos[time.id] = elenco;
  salvo.gravar('futebolJs.elencos.v1', todos);
  return elenco;
}

// Seu técnico: nome e aparência sorteados na primeira vez e salvos ('futebolJs.tecnico.v1').
// Para mudar: FutebolJS.salvarTecnico({ nome, aparencia: { pele, cabelo, estilo, roupa } }).
function tecnicoDoUsuario() {
  let t = salvo.ler('futebolJs.tecnico.v1', null);
  if (!t) {
    t = { nome: NOMES_TECNICO[Math.floor(Math.random() * NOMES_TECNICO.length)],
      aparencia: { pele: PELES[Math.floor(Math.random() * PELES.length)], cabelo: CABELOS[Math.floor(Math.random() * CABELOS.length)], estilo: Math.floor(Math.random() * 3), roupa: '#1D2A44' } };
    salvo.gravar('futebolJs.tecnico.v1', t);
  }
  return t;
}

// ---- A partida padrão (a de teste da tela inicial). Tudo opcional em novaPartida().
const PARTIDA_PADRAO = {
  campo: 'estadio',                 // chave de CAMPOS ou um objeto de campo
  times: ['azulao', 'ataliba'],     // [o seu time, o adversário] (chaves de TIMES ou objetos)
  mandante: 0,                      // de quem é o estádio (pesa na torcida)
  competicao: { tipo: 'amistoso', nome: 'Amistoso', rodada: 0, fase: '', mataMata: false, jogo: 'unico', placarIda: null },
  dificuldade: 'normal',
  clima: 'seco',                    // 'seco' | 'chuva' | 'neve'
  gramado: 'baixo',                 // 'baixo' | 'alto'
  horario: 'noite',                 // 'dia' | 'tarde' | 'noite'
  duracao: 300,                     // segundos de relógio: DURACOES.padrao (5 min) ou DURACOES.rapida (3 min)
  usuario: { nome: 'Você', posicao: 'FWD' },   // posição do seu jogador: 'FWD' | 'MID' | 'DEF'
  taticas: [null, null],            // null = a preferida do time
  formacoes: [null, null],
};
let PARTIDA = null;                 // a partida em andamento (montada por montarPartida)
const DURACOES = { padrao: 300, rapida: 180 };   // partida normal (5 min) e partida rápida (3 min)

// ---------------------------------------------------------------------
// 3. CENA 3D
// ---------------------------------------------------------------------
if (typeof THREE === 'undefined') {
  document.body.innerHTML = '<p style="padding:24px;font-family:sans-serif">Não foi possível carregar o Three.js. Verifique a conexão e recarregue.</p>';
  throw new Error('THREE não carregou');
}
const canvas = $('game');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(1);

const scene = new THREE.Scene();
const SKY = 0x0c1b2b;
scene.background = new THREE.Color(SKY);
scene.fog = new THREE.Fog(SKY, 45, 140);          // a névoa também ajuda a "desfocar" a torcida

const camera = new THREE.PerspectiveCamera(52, 1, 0.3, 320);
// Tudo do estádio (gramado, placas, arquibancada, gols) fica neste grupo: trocar de campo = esvaziar
// o grupo e montar de novo (montarEstadio).
const ESTADIO = new THREE.Group();
scene.add(ESTADIO);
const luzCeu = new THREE.HemisphereLight(0xdfeeff, 0x23401c, 0.85);   // mudam com o horário (aplicarAmbiente)
scene.add(luzCeu);
const sun = new THREE.DirectionalLight(0xffffff, 0.75);
sun.position.set(15, 40, 20);
scene.add(sun);

// ---------------------------------------------------------------------
// ENCAIXE NA TELA (o mesmo problema e a mesma solução do Super Lan Master)
//   O Canva pode deixar o iframe MAIOR que a tela (principalmente no celular deitado): o
//   design é esticado e a parte de baixo fica fora da tela. Um "sentinela" do tamanho da
//   página + IntersectionObserver contam quanto dele está visível de verdade, e o #raizJogo
//   (que contém tudo do jogo) é encaixado só nessa área. Fora do Canva, area = janela inteira.
// ---------------------------------------------------------------------
const raizJogo = $('raizJogo');
const AREA = { topo: 0, w: window.innerWidth, h: window.innerHeight, visivel: null };
function ajustarArea() {
  const hPagina = window.innerHeight, v = AREA.visivel;
  const cheio = document.fullscreenElement || document.webkitFullscreenElement;
  let topo = 0, altura = hPagina;
  if (v && !cheio && v.altura >= 120 && v.altura < hPagina - 2) { topo = Math.max(0, Math.round(v.topo)); altura = Math.round(v.altura); }
  if (topo !== AREA.topo || altura !== AREA.h || window.innerWidth !== AREA.w) {
    AREA.topo = topo; AREA.h = altura; AREA.w = window.innerWidth;
    raizJogo.style.top = topo + 'px'; raizJogo.style.height = altura + 'px';
    // "1% da altura VISÍVEL": substitui o "vh" do CSS (que mede o iframe inteiro, mesmo a parte
    // fora da tela — era isso que deixava as faixas pretas das cenas compridas demais).
    document.documentElement.style.setProperty('--avh', (altura / 100).toFixed(2) + 'px');
    if (typeof resize === 'function') resize();
  }
}
(function () {
  const sentinela = document.createElement('div');
  sentinela.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:100%;pointer-events:none;visibility:hidden';
  document.body.appendChild(sentinela);
  if (window.IntersectionObserver) {
    const limiares = [];
    for (let i = 0; i <= 50; i++) limiares.push(i / 50);
    new IntersectionObserver((entradas) => {
      const r = entradas[entradas.length - 1].intersectionRect;
      AREA.visivel = { topo: r.top, altura: r.height };
      ajustarArea();
    }, { threshold: limiares }).observe(sentinela);
  }
  window.addEventListener('resize', ajustarArea);
  document.addEventListener('fullscreenchange', ajustarArea);
})();

function resize() {
  const w = AREA.w || window.innerWidth, h = AREA.h || window.innerHeight;
  const ih = Math.max(1, Math.min(CONFIG.RENDER_H, h));
  renderer.setSize(Math.max(1, Math.round(ih * w / h)), ih, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

function pixelTexture(cnv, repeatX = 1, repeatY = 1) {
  const t = new THREE.CanvasTexture(cnv);
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestFilter;
  t.generateMipmaps = false;
  if (repeatX !== 1 || repeatY !== 1) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeatX, repeatY);
  }
  return t;
}
function drawTexture(w, h, draw, repeatX, repeatY) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  return pixelTexture(c, repeatX, repeatY);
}

// DESEMPENHO: materiais de cor sólida são reaproveitados (um por cor) em vez de criar um novo para cada peça.
const MAT_CACHE = new Map();
function mat(color) {
  if (!MAT_CACHE.has(color)) MAT_CACHE.set(color, new THREE.MeshLambertMaterial({ color }));
  return MAT_CACHE.get(color);
}

// DESEMPENHO: objetos que nunca se mexem não precisam recalcular a posição todo quadro.
function freeze(obj) {
  obj.traverse((o) => { o.updateMatrix(); o.matrixAutoUpdate = false; });
}

// ---------------------------------------------------------------------
// DESEMPENHO: "lote" de caixas. Cada objeto separado na cena custa uma chamada de desenho
// (e caixa com material diferente em cada face custa 6!). O lote junta várias caixas numa
// malha só: a cor de cada caixa vai nos vértices e as faces com desenho (rosto, camisa)
// apontam para um pedaço de uma textura única (o "atlas"). Resultado: 1 chamada de desenho.
// As faces seguem a mesma ordem e orientação da BoxGeometry do Three.js (+X, -X, +Y, -Y, +Z, -Z).
// ---------------------------------------------------------------------
const FACES = [
  ['z', 'y', 'x', -1, -1, 'd', 'h', 'w', 1], ['z', 'y', 'x', 1, -1, 'd', 'h', 'w', -1],
  ['x', 'z', 'y', 1, 1, 'w', 'd', 'h', 1], ['x', 'z', 'y', 1, -1, 'w', 'd', 'h', -1],
  ['x', 'y', 'z', 1, -1, 'w', 'h', 'd', 1], ['x', 'y', 'z', -1, -1, 'w', 'h', 'd', -1],
];
class Lote {
  // uvPadrao: pedaço do atlas usado pelas faces sem desenho ([u0, v0, u1, v1]).
  constructor(uvPadrao = [0, 0, 1, 1]) { this.pos = []; this.nor = []; this.uv = []; this.cor = []; this.idx = []; this.uvPadrao = uvPadrao; }
  // cor: 0xRRGGBB. faceUV(i): pedaço do atlas da face i (ou null para usar a cor).
  caixa(w, h, d, cor, x, y, z, faceUV) {
    const tam = { w, h, d };
    const r = ((cor >> 16) & 255) / 255, g = ((cor >> 8) & 255) / 255, b = (cor & 255) / 255;
    FACES.forEach(([u, v, ww, udir, vdir, Wk, Hk, Dk, sinal], i) => {
      const W = tam[Wk], H = tam[Hk], D = tam[Dk] * sinal;
      const reg = faceUV ? faceUV(i) : null;
      const area = reg || this.uvPadrao;
      const base = this.pos.length / 3;
      for (let iy = 0; iy < 2; iy++) for (let ix = 0; ix < 2; ix++) {
        const vec = { x: 0, y: 0, z: 0 }, n = { x: 0, y: 0, z: 0 };
        vec[u] = (ix * W - W / 2) * udir; vec[v] = (iy * H - H / 2) * vdir; vec[ww] = D / 2; n[ww] = sinal;
        this.pos.push(x + vec.x, y + vec.y, z + vec.z);
        this.nor.push(n.x, n.y, n.z);
        this.uv.push(area[0] + ix * (area[2] - area[0]), area[1] + (1 - iy) * (area[3] - area[1]));
        if (reg) this.cor.push(1, 1, 1); else this.cor.push(r, g, b);
      }
      this.idx.push(base, base + 2, base + 1, base + 2, base + 3, base + 1);
    });
    return this;
  }
  // Retângulo solto (rede do gol): 4 cantos na ordem cima-esq, cima-dir, baixo-esq, baixo-dir.
  quad(c0, c1, c2, c3, n) {
    const base = this.pos.length / 3;
    [[c0, 0, 1], [c1, 1, 1], [c2, 0, 0], [c3, 1, 0]].forEach(([c, a, bb]) => {
      this.pos.push(c[0], c[1], c[2]); this.nor.push(n[0], n[1], n[2]); this.uv.push(a, bb); this.cor.push(1, 1, 1);
    });
    this.idx.push(base, base + 2, base + 1, base + 2, base + 3, base + 1);
    return this;
  }
  malha(material) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.nor, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.cor, 3));
    g.setIndex(this.idx);
    return new THREE.Mesh(g, material);
  }
}
const MAT_CORES = new THREE.MeshLambertMaterial({ vertexColors: true });   // material de "só cores" 

// ---------------------------------------------------------------------
// 4. CENÁRIO
// ---------------------------------------------------------------------
function buildPitch() {
  const PPM = 8, M = CONFIG.BOARD_GAP + 2 + LADO_BANCO.extra;   // pixels por metro, margem até depois das placas
  const sx = CONFIG.FIELD_L + M * 2, sz = CONFIG.FIELD_W + M * 2;
  const c = document.createElement('canvas');
  c.width = sx * PPM; c.height = sz * PPM;
  const g = c.getContext('2d');
  const X = (m) => (m + sx / 2) * PPM;
  const Y = (m) => (m + sz / 2) * PPM;

  // Aparência vem do campo da partida (CAMPOS[...].aparencia) + gramado alto/baixo + neve.
  const A = (PARTIDA && PARTIDA.campo.aparencia) || CAMPOS.estadio.aparencia;
  const alto = PARTIDA && PARTIDA.gramado === 'alto', neve = PARTIDA && PARTIDA.clima === 'neve';
  g.fillStyle = A.fundo; g.fillRect(0, 0, c.width, c.height);
  const FW = CONFIG.FIELD_W * PPM;
  if (A.padrao === 'faixas' || A.padrao === 'xadrez') {
    const n = A.faixas || 16, sw = CONFIG.FIELD_L / n, linhasZ = A.padrao === 'xadrez' ? Math.max(2, Math.round(n * CONFIG.FIELD_W / CONFIG.FIELD_L)) : 1;
    for (let i = 0; i < n; i++) for (let j = 0; j < linhasZ; j++) {
      g.fillStyle = (i + j) % 2 ? A.gramaA : A.gramaB;
      g.fillRect(X(-HALF_L + i * sw), Y(-HALF_W) + j * FW / linhasZ, sw * PPM + 1, FW / linhasZ + 1);
    }
  } else {
    g.fillStyle = A.gramaA; g.fillRect(X(-HALF_L), Y(-HALF_W), CONFIG.FIELD_L * PPM, FW);
    if (A.padrao === 'manchas') {                 // várzea: grama irregular (QUADRADOS) e pedaços de terra
      // 4.1.3: nada de círculos lisos. Cada mancha é um "círculo" montado com quadrados: no miolo
      // quadrados grandes (~1 m) e na borda quadradinhos (~25 cm). Tudo cortado na linha do campo.
      const MARROM = ['#7a6a45', '#6b5a3e', '#85734b', '#8f7c52', '#5f4f36', '#74613f', '#9a8660'];
      const pick = (arr) => arr[Math.random() * arr.length | 0];
      const blocos = (cx, cz, r, cores) => {
        const big = 1.0, small = 0.25;
        const gx0 = Math.round(cx / big) * big, gz0 = Math.round(cz / big) * big;
        for (let x = gx0 - r; x <= gx0 + r; x += big) for (let z = gz0 - r; z <= gz0 + r; z += big) {
          const d = Math.hypot(x - cx, z - cz);
          if (d <= r * 0.72) { g.fillStyle = pick(cores); g.fillRect(X(x), Y(z), big * PPM, big * PPM); }
          else if (d <= r * 1.1) {                   // borda: quadradinhos aleatórios
            for (let a = 0; a < big; a += small) for (let b = 0; b < big; b += small) {
              if (Math.hypot(x + a - cx, z + b - cz) <= r && Math.random() < 0.75) { g.fillStyle = pick(cores); g.fillRect(X(x + a), Y(z + b), small * PPM, small * PPM); }
            }
          }
        }
      };
      g.save();
      g.beginPath(); g.rect(X(-HALF_L), Y(-HALF_W), CONFIG.FIELD_L * PPM, FW); g.clip();
      const VERDES = [A.gramaB, A.gramaB, A.gramaB, '#647f37'];
      for (let i = 0; i < 90; i++) blocos(rand(-HALF_L, HALF_L), rand(-HALF_W, HALF_W), rand(1.2, 3.6), VERDES);
      for (let i = 0; i < 55; i++) blocos(rand(-HALF_L, HALF_L), rand(-HALF_W, HALF_W), rand(0.8, 2.6), MARROM);
      g.restore();
      // Fora do campo é tudo marrom: quadrados de vários tons (nada de grama passando da linha).
      g.save();
      g.beginPath(); g.rect(0, 0, c.width, c.height); g.rect(X(-HALF_L), Y(-HALF_W), CONFIG.FIELD_L * PPM, FW); g.clip('evenodd');
      for (let x = -sx / 2; x < sx / 2; x += 0.5) for (let z = -sz / 2; z < sz / 2; z += 0.5) {
        g.fillStyle = pick(MARROM); g.fillRect(X(x), Y(z), 0.5 * PPM + 1, 0.5 * PPM + 1);
      }
      for (let i = 0; i < 260; i++) {                // quadrados grandes e pequenos por cima, para quebrar a repetição
        const t = pick([0.5, 1, 1, 1.5, 2]); g.fillStyle = pick(MARROM);
        g.fillRect(X(rand(-sx / 2, sx / 2)), Y(rand(-sz / 2, sz / 2)), t * PPM, t * PPM);
      }
      g.restore();
    }
  }
  // Grama alta: mais escura e com mais "fiapos". Baixa: pontinhos leves.
  for (let i = 0, n = alto ? 16000 : 9000; i < n; i++) {
    g.fillStyle = Math.random() < 0.5 ? (alto ? 'rgba(0,0,0,0.13)' : 'rgba(0,0,0,0.07)') : (alto ? 'rgba(160,220,120,0.07)' : 'rgba(255,255,255,0.05)');
    g.fillRect(Math.random() * c.width | 0, Math.random() * c.height | 0, alto ? 2 : 2, alto ? 3 : 2);
  }
  if (alto) { g.fillStyle = 'rgba(0,30,0,0.12)'; g.fillRect(0, 0, c.width, c.height); }
  if (neve) {
    // NEVE (4.1.2): "limparam o campo" — a neve foi empurrada para FORA das linhas (montes com a
    // borda irregular, a partir de ~0,8 m da linha) e dentro do campo só ficam quadradinhos
    // brancos da neve que está caindo (espalhados, sem cobrir tudo; mais perto das laterais).
    const NEVE = '#dfe9f8', folga = 0.8;
    g.fillStyle = NEVE;
    g.beginPath();
    g.rect(0, 0, c.width, c.height);
    g.rect(X(-HALF_L - folga - 0.6), Y(-HALF_W - folga - 0.6), (CONFIG.FIELD_L + (folga + 0.6) * 2) * PPM, (CONFIG.FIELD_W + (folga + 0.6) * 2) * PPM);
    g.fill('evenodd');
    // Borda do monte: bolotas ao longo do contorno (a pá não deixa reto).
    const borda = (x, z) => { g.beginPath(); g.arc(X(x), Y(z), rand(0.35, 0.9) * PPM, 0, Math.PI * 2); g.fill(); };
    for (let x = -HALF_L - 1.5; x <= HALF_L + 1.5; x += 0.45) for (const sz of [-1, 1]) borda(x, sz * (HALF_W + folga + rand(0.2, 0.7)));
    for (let z = -HALF_W - 1.5; z <= HALF_W + 1.5; z += 0.45) for (const sx2 of [-1, 1]) borda(sx2 * (HALF_L + folga + rand(0.2, 0.7)), z);
    // Textura do monte: sombrinhas azuladas e pegadas.
    for (let i = 0; i < 2600; i++) {
      const x = Math.random() * c.width, y = Math.random() * c.height;
      const mx = x / PPM - sx / 2, mz = y / PPM - sz / 2;
      if (Math.abs(mx) < HALF_L + folga + 0.3 && Math.abs(mz) < HALF_W + folga + 0.3) continue;
      g.fillStyle = Math.random() < 0.6 ? 'rgba(150,170,200,0.22)' : 'rgba(255,255,255,0.6)';
      g.fillRect(x | 0, y | 0, 2 + (Math.random() * 3 | 0), 2);
    }
    // Dentro do campo: quadradinhos (1 a 3 px = 12 a 37 cm). Uma parte solta, outra em grupinhos.
    const quad = (x, z, a) => { const t = 1 + (Math.random() * 3 | 0); g.fillStyle = 'rgba(236,244,255,' + a + ')'; g.fillRect(X(x) | 0, Y(z) | 0, t, t); };
    const area = CONFIG.FIELD_L * CONFIG.FIELD_W;
    for (let i = 0, n = area * 0.28 | 0; i < n; i++) {
      const z = rand(-HALF_W, HALF_W), lateral = Math.abs(z) / HALF_W;
      if (Math.random() > 0.35 + lateral * 0.65) continue;            // menos no meio (o pessoal pisa)
      quad(rand(-HALF_L, HALF_L), z, rand(0.55, 0.95));
    }
    for (let k = 0, nk = area / 90 | 0; k < nk; k++) {
      const cx = rand(-HALF_L, HALF_L), cz = rand(-HALF_W, HALF_W);
      for (let i = 0; i < 14; i++) quad(cx + rand(-1.4, 1.4), cz + rand(-1.4, 1.4), rand(0.5, 0.9));
    }
  }
  g.strokeStyle = A.linhas; g.fillStyle = A.linhas; g.lineWidth = 2;
  g.strokeRect(X(-HALF_L), Y(-HALF_W), CONFIG.FIELD_L * PPM, CONFIG.FIELD_W * PPM);
  g.beginPath(); g.moveTo(X(0), Y(-HALF_W)); g.lineTo(X(0), Y(HALF_W)); g.stroke();
  g.beginPath(); g.arc(X(0), Y(0), CIRCLE_R * PPM, 0, Math.PI * 2); g.stroke();
  g.fillRect(X(0) - 2, Y(0) - 2, 5, 5);
  const arcA = Math.acos((BOX.depth - PEN_SPOT) / CIRCLE_R);
  for (const s of [-1, 1]) {
    const gx = s * HALF_L;
    g.strokeRect(s > 0 ? X(gx - BOX.depth) : X(gx), Y(-BOX.half), BOX.depth * PPM, BOX.half * 2 * PPM);
    g.strokeRect(s > 0 ? X(gx - SMALL_BOX.depth) : X(gx), Y(-SMALL_BOX.half), SMALL_BOX.depth * PPM, SMALL_BOX.half * 2 * PPM);
    g.fillRect(X(gx - s * PEN_SPOT) - 2, Y(0) - 2, 5, 5);
    g.beginPath();
    if (s > 0) g.arc(X(gx - PEN_SPOT), Y(0), CIRCLE_R * PPM, Math.PI - arcA, Math.PI + arcA);
    else g.arc(X(gx + PEN_SPOT), Y(0), CIRCLE_R * PPM, -arcA, arcA);
    g.stroke();
    for (const zs of [-1, 1]) {                   // arcos de escanteio: só o quarto de círculo dentro do campo
      const a1 = Math.atan2(0, -s), a2 = Math.atan2(-zs, 0), d = wrapAngle(a2 - a1);   // da linha de fundo até a lateral
      g.beginPath(); g.arc(X(gx), Y(zs * HALF_W), 1 * PPM, a1, a1 + d, d < 0); g.stroke();
    }
  }
  const pitch = new THREE.Mesh(new THREE.PlaneGeometry(sx, sz), new THREE.MeshLambertMaterial({ map: pixelTexture(c) }));
  pitch.rotation.x = -Math.PI / 2;
  ESTADIO.add(pitch); freeze(pitch);
  const tipoEst = PARTIDA ? PARTIDA.campo.estadio : 'arena';   // chão de fora: grama escura, terra (várzea) ou cimento (society)
  const outer = new THREE.Mesh(new THREE.PlaneGeometry(320, 240), mat(neve ? 0xdde4ec : tipoEst === 'varzea' ? 0x6b5a3e : tipoEst === 'society' ? 0x55595f : 0x1c3a22));
  outer.rotation.x = -Math.PI / 2; outer.position.y = -0.02;
  ESTADIO.add(outer); freeze(outer);
  // Bandeirinhas de escanteio: cada uma é uma malha própria (4 chamadas de desenho em vez de 1)
  // porque a comemoração "chutar a bandeirinha" faz uma delas balançar. O pé fica na origem do
  // grupo, então girar o grupo inclina a haste a partir do chão.
  for (const xs of [-1, 1]) for (const zs of [-1, 1]) {
    const L = new Lote();
    L.caixa(0.06, 1.5, 0.06, 0xf2f2ee, 0, 0.75, 0);
    L.caixa(0.02, 0.3, 0.4, 0xf7941d, 0, 1.35, 0.2 * -zs);
    const g = new THREE.Group();
    g.add(L.malha(MAT_CORES));
    g.position.set(xs * HALF_L, 0, zs * HALF_W);
    ESTADIO.add(g);
    BANDEIRAS.push({ g, x: xs * HALF_L, z: zs * HALF_W, balanco: null });
  }
}
const BANDEIRAS = [];

// Placas de publicidade em volta do campo. Os "anúncios" são dos seus próprios projetos.
function buildBoards() {
  const ADS = [['SUPER LAN MASTER', '#0B4F9C', '#F7941D'], ['FUTEBOL JS', '#F7941D', '#071430'], ['PONTO COMUNITÁRIO', '#1f9e5c', '#ffffff'],
    ['ATALIBA', '#d8443a', '#ffffff'], ['ORBIT', '#071430', '#6bf08e'], ['CACHOLA', '#111111', '#6bf08e']];
  const tex = drawTexture(256, 16, (g) => {
    const w = 256 / ADS.length;
    ADS.forEach(([txt, bg, fg], i) => {
      g.fillStyle = bg; g.fillRect(i * w, 0, w, 16);
      g.fillStyle = fg; g.font = 'bold 8px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(txt, i * w + w / 2, 8.5, w - 4);
    });
  }, 1, 1);
  const H = 0.9;
  // DESEMPENHO: antes cada placa tinha um material por face (6 chamadas de desenho); agora é 1.
  // As faces de cima e das pontas usam um pedacinho escuro do próprio anúncio.
  const add = (len, x, z, alongX) => {
    const t = tex.clone(); t.needsUpdate = true; t.repeat.set(Math.max(1, Math.round(len / 34)), 1); t.wrapS = THREE.RepeatWrapping;
    const m = new THREE.MeshLambertMaterial({ map: t });
    const L = new Lote();
    const frente = alongX ? [4, 5] : [0, 1];
    const rr = t.repeat.x, escuro = [0.92 / rr, 0.1, 0.93 / rr, 0.2];   // pedaço preto (anúncio CACHOLA), já contando a repetição
    L.caixa(alongX ? len : 0.2, H, alongX ? 0.2 : len, 0xffffff, 0, 0, 0, (i) => (frente.includes(i) ? [0, 0, 1, 1] : escuro));
    const mesh = L.malha(m);
    mesh.position.set(x, H / 2, z);
    ESTADIO.add(mesh); freeze(mesh);
  };
  add(BOARD_X * 2, 0, -BOARD_ZN, true);
  add(BOARD_X * 2, 0, BOARD_Z, true);
  add(BOARD_Z + BOARD_ZN, -BOARD_X, (BOARD_Z - BOARD_ZN) / 2, false);
  add(BOARD_Z + BOARD_ZN, BOARD_X, (BOARD_Z - BOARD_ZN) / 2, false);
}

// ---------------------------------------------------------------------
// TORCIDA (v15): cada torcedor é um retângulo com uma textura transparente (sprite), sentado ou
// em pé numa arquibancada de degraus. São 4 tipos — sentado/em pé × camisa azul/vermelha — cada
// um em 3 tons de pele e virado para um lado ou outro (espelhado), então ninguém parece clone.
// DESEMPENHO: os ~9 mil torcedores ficam numa malha só (1 chamada de desenho, sem transparência
// "de verdade": o fundo é cortado com alphaTest, que é barato). O sobe-e-desce é calculado na
// PLACA DE VÍDEO (vertex shader): o processador só atualiza 3 números por quadro.
//   - normal: quem está em pé balança, quem está sentado mexe pouquinho
//   - gol: a torcida do time que marcou pula alta por ~7 s (a do outro time quase para)
//   - "ola": de vez em quando uma onda dá a volta no estádio
// ---------------------------------------------------------------------
const ARQ = { FILEIRAS: 18, ALT0: 1.0, DEGRAU_Y: 0.62, DEGRAU_Z: 1.0, DIST0: 13 };   // degraus da arquibancada
const crowd = (() => {
  // Atlas 128×64: 12 células de 16×32 px. Célula = (emPe × 6) + (time × 3) + pele.
  // Cores das camisas da torcida = cores dos dois times da partida (pintarAtlas troca).
  let CAMISAS = [['#0B4F9C', '#083a73'], ['#C8352B', '#8f241d']];
  const PELES_T = ['#F2C9A5', '#BF8159', '#62402A'];
  const CABELOS_T = ['#1C140F', '#6B4423', '#0E0E0E'];
  const desenharAtlas = (g) => {
    g.clearRect(0, 0, 128, 64);
    for (let i = 0; i < 12; i++) {
      const ox = (i % 8) * 16, oy = Math.floor(i / 8) * 32;
      const emPe = i >= 6, time = Math.floor(i / 3) % 2, pl = i % 3;
      const [cam, esc] = CAMISAS[time], pele = PELES_T[pl], cab = CABELOS_T[pl];
      const r = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(ox + x, oy + y, w, h); };
      if (emPe) {
        // Em pé, braços para cima (torcendo).
        r(5, 1, 6, 2, cab); r(5, 3, 6, 6, pele); r(6, 5, 1, 1, '#16120F'); r(9, 5, 1, 1, '#16120F');
        r(7, 9, 2, 1, pele);
        r(2, 2, 2, 6, pele); r(12, 2, 2, 6, pele);           // braços levantados
        r(2, 8, 2, 3, cam); r(12, 8, 2, 3, cam);              // mangas
        r(4, 10, 8, 7, cam); r(4, 17, 8, 2, esc);             // camisa
        r(4, 19, 8, 3, '#2a3550'); r(4, 22, 3, 7, '#2a3550'); r(9, 22, 3, 7, '#2a3550');   // calça
        r(4, 29, 3, 2, '#141414'); r(9, 29, 3, 2, '#141414');                              // tênis
      } else {
        // Sentado: só aparece da coxa para cima (as pernas ficam atrás do degrau da frente).
        r(5, 11, 6, 2, cab); r(5, 13, 6, 6, pele); r(6, 15, 1, 1, '#16120F'); r(9, 15, 1, 1, '#16120F');
        r(7, 19, 2, 1, pele);
        r(2, 20, 2, 3, cam); r(12, 20, 2, 3, cam); r(2, 23, 2, 4, pele); r(12, 23, 2, 4, pele);
        r(4, 20, 8, 6, cam); r(4, 26, 8, 2, esc);
        r(3, 28, 10, 4, '#2a3550');                           // joelhos/coxas
      }
    }
  };
  const tex = drawTexture(128, 64, desenharAtlas);
  tex.minFilter = THREE.NearestMipmapLinearFilter; tex.generateMipmaps = true;   // de longe não "pisca"

  // uFase: a "fase" do pula-pula de cada torcida, somada AQUI (no processador) quadro a quadro.
  // (v17) Antes o shader fazia sin(tempo × velocidade); quando a velocidade mudava (gol), o tempo
  // já estava grande e a fase dava saltos enormes — a torcida "acelerava" e embaralhava.
  const U = { uFase: { value: new THREE.Vector2(0, 0) }, uFesta: { value: new THREE.Vector2(0, 0) }, uOla: { value: -1 } };
  const material = new THREE.MeshLambertMaterial({ map: tex, alphaTest: 0.4, side: THREE.DoubleSide });
  material.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = 'attribute float aFase;\nattribute vec3 aJeito;\nuniform vec2 uFase;\nuniform vec2 uFesta;\nuniform float uOla;\n' +
      sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
        // aJeito: x = time (0 azul, 1 vermelho), y = em pé (1) ou sentado (0), z = posição na volta do estádio (0 a 1)
        float festa = aJeito.x < 0.5 ? uFesta.x : uFesta.y;
        float outro = aJeito.x < 0.5 ? uFesta.y : uFesta.x;
        float fase = aJeito.x < 0.5 ? uFase.x : uFase.y;
        float onda = max(0.0, sin(fase + aFase * 6.2832));
        float amp = mix(aJeito.y > 0.5 ? 0.09 : 0.02, aJeito.y > 0.5 ? 0.6 : 0.45, festa) * (1.0 - 0.8 * outro);
        float dOla = abs(fract(aJeito.z - uOla + 0.5) - 0.5);          // distância até a onda (dá a volta)
        float ola = uOla < 0.0 ? 0.0 : exp(-dOla * dOla * 1600.0) * 0.7;
        transformed.y += onda * amp + ola;`);
  };

  // Pinta (só posições). As fileiras são montadas em buildStands.
  const pos = [], nor = [], uv = [], fase = [], jeito = [], idx = [];
  const W = 0.8, H = 1.6, IN = 0.5 / 128, INV = 0.5 / 64;   // meio texel de margem
  // base: pé do torcedor; dir: direção em que ele OLHA (para o campo); ang: 0..1 na volta do estádio
  function torcedor(bx, by, bz, dirX, dirZ, time, emPe, ang) {
    const cel = (emPe ? 6 : 0) + time * 3 + (Math.random() * 3 | 0);
    let u0 = (cel % 8) * 16 / 128 + IN, u1 = ((cel % 8) * 16 + 16) / 128 - IN;
    const vT = 1 - Math.floor(cel / 8) * 32 / 64 - INV, vB = 1 - (Math.floor(cel / 8) * 32 + 32) / 64 + INV;
    if (Math.random() < 0.5) [u0, u1] = [u1, u0];   // espelhado
    // "Direita" de quem olha para ele vindo do campo = (−dz, 0, dx) da direção do olhar dele invertida.
    const rx = dirZ * W / 2, rz = -dirX * W / 2;
    const y0 = by - (emPe ? 0 : 0.05), y1 = y0 + H;
    const b = pos.length / 3;
    pos.push(bx - rx, y1, bz - rz, bx + rx, y1, bz + rz, bx - rx, y0, bz - rz, bx + rx, y0, bz + rz);
    for (let i = 0; i < 4; i++) { nor.push(dirX, 0, dirZ); jeito.push(time, emPe ? 1 : 0, ang); }
    uv.push(u0, vT, u1, vT, u0, vB, u1, vB);
    const f = Math.random(); fase.push(f, f, f, f);
    idx.push(b, b + 2, b + 1, b + 2, b + 3, b + 1);
  }
  function malha() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setAttribute('aFase', new THREE.Float32BufferAttribute(fase, 1));
    g.setAttribute('aJeito', new THREE.Float32BufferAttribute(jeito, 3));
    g.setIndex(idx);
    return new THREE.Mesh(g, material);
  }

  let festa = [0, 0], olaT = -1, proximaOla = rand(35, 70);
  // Chamado todo quadro pelo loop (só mexe em 3 uniforms).
  const DOIS_PI = Math.PI * 2;
  function atualizar(dt) {
    festa = festa.map((f) => Math.max(0, f - dt / 7));
    // (4.0.0) A festa SEGURA enquanto o jogo está no gol/comemoração/replay; só começa a baixar
    // quando todo mundo volta para o meio (saída de bola).
    if ((G.state === 'goal' || G.state === 'celebrate' || G.state === 'replay') && G.scoredBy >= 0) festa[G.scoredBy] = 1;
    const f0 = Math.min(1, festa[0] * 1.6), f1 = Math.min(1, festa[1] * 1.6);   // segura no máximo e depois cai
    U.uFesta.value.set(f0, f1);
    // Velocidade (rad/s) de cada torcida: 5 normal, até 10 na festa. Soma e dá a volta em 2π.
    U.uFase.value.set((U.uFase.value.x + dt * (5 + 5 * f0)) % DOIS_PI, (U.uFase.value.y + dt * (5 + 5 * f1)) % DOIS_PI);
    if (olaT >= 0) { olaT += dt / 11; if (olaT > 1) { olaT = -1; proximaOla = rand(45, 90); } }
    else if (G.state === 'play' && (proximaOla -= dt) <= 0) olaT = 0;
    U.uOla.value = olaT;
  }
  // Gol: a torcida desse time explode (e para a ola, se tiver).
  function comemorar(time) { festa[time] = 1; festa[1 - time] = Math.min(festa[1 - time], 0.2); olaT = -1; proximaOla = rand(45, 90); }
  // Nova partida: cores dos times (escurece um pouco para a parte de baixo da camisa).
  function pintarAtlas(cor0, cor1) {
    const esc = (h) => { const n = parseInt(h.slice(1), 16), k = 0.7; return '#' + [16, 8, 0].map((sh) => Math.round(((n >> sh) & 255) * k).toString(16).padStart(2, '0')).join(''); };
    CAMISAS = [[cor0, esc(cor0)], [cor1, esc(cor1)]];
    const g = tex.image.getContext('2d');
    desenharAtlas(g);
    tex.needsUpdate = true;
  }
  // Nova partida: esvazia a lista de torcedores (buildStands monta de novo).
  function limpar() { pos.length = nor.length = uv.length = fase.length = jeito.length = idx.length = 0; festa = [0, 0]; }
  return { torcedor, malha, atualizar, comemorar, pintarAtlas, limpar };
})();

// ---------------------------------------------------------------------
// SONS (v18) — todos GERADOS no código com a Web Audio API: nenhum arquivo para baixar.
// Cada som é uma "receita" de osciladores (tons) e ruído filtrado:
//   chute ........ "tum" grave (tom que cai rápido) + estalo de ruído; mais forte = mais alto
//   toque ........ o mesmo, curtinho e baixo (passe, domínio, bola chegando no pé)
//   apito ........ tom agudo (~2,8 kHz) com "tremido" de ~32 Hz (a bolinha do apito)
//   torcida ...... ruído filtrado em loop, sempre tocando baixinho; sobe com a bola perto do gol
//   gol .......... a torcida sobe e fica alta e constante uns 6 s (ruído + "vozes": vários tons
//                  desafinados juntos fazendo um "uôôô")
//   trave ........ "plém" metálico (tons não harmônicos)
//   óóh .......... chute para fora: vozes caindo de decepção
//   passos ....... "chhk" baixinho na grama, só você correndo
//   defesa ....... "pof" abafado das luvas + um "uuuh" curto da torcida
//   clique ....... bipes de interface (domínio e drible); domínio perfeito = arpejo
//   drible ....... "fuuu" (ruído varrendo de grave para agudo)
// DESEMPENHO: um único AudioContext, ruído criado UMA vez (2 s) e reaproveitado, no máximo
// 14 sons curtos tocando juntos. No celular o som só liga depois de um toque (botão JOGAR).
// ---------------------------------------------------------------------
const Som = (() => {
  let ctx = null, mestre = null, ruido = null, mudo = false, vozes = 0, golAtivo = null;
  let torcidaGain = null, torcidaFiltro = null, nivelAtual = -1;
  try { mudo = localStorage.getItem('futebolJsMudo') === '1'; } catch (e) { /* sem armazenamento */ }

  function ligar() {
    try {
      if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        ctx = new AC();
        const comp = ctx.createDynamicsCompressor();          // evita estourar quando soma tudo
        mestre = ctx.createGain(); mestre.gain.value = mudo ? 0 : 0.85;
        mestre.connect(comp); comp.connect(ctx.destination);
        ruido = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
        const d = ruido.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        montarTorcida();
      }
      if (ctx.state === 'suspended') ctx.resume();
    } catch (e) { ctx = null; }
  }
  const pronto = () => ctx && ctx.state !== 'closed' && !mudo && G.state !== 'paused';   // logo depois de ligar ele ainda pode estar 'suspended': o som sai assim que ele acorda
  // Limite de sons curtos ao mesmo tempo (cada um se "desconta" quando termina).
  function vaga(dur) {
    if (vozes >= 14) return false;
    vozes++; setTimeout(() => { vozes--; }, dur * 1000 + 50);
    return true;
  }
  // Envelope: sobe até "pico" em "ataque" segundos e some até "dur".
  function env(g, t0, ataque, pico, dur) {
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, pico), t0 + ataque);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  }
  function fonteRuido(t0, dur, loop) {
    const s = ctx.createBufferSource(); s.buffer = ruido; s.loop = !!loop;
    s.start(t0, Math.random() * 1.5);
    if (!loop) s.stop(t0 + dur + 0.05);
    return s;
  }
  function filtro(tipo, freq, Q) { const f = ctx.createBiquadFilter(); f.type = tipo; f.frequency.value = freq; f.Q.value = Q || 0.7; return f; }
  function ganho() { return ctx.createGain(); }
  // Tom com a frequência caindo de f0 para f1 (chute, toque, defesa).
  function tom(tipo, f0, f1, t0, dur, pico) {
    const o = ctx.createOscillator(), g = ganho();
    o.type = tipo; o.frequency.setValueAtTime(f0, t0); o.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
    env(g, t0, 0.005, pico, dur);
    o.connect(g); g.connect(mestre); o.start(t0); o.stop(t0 + dur + 0.05);
  }
  function estalo(t0, dur, tipo, freq, pico) {
    const s = fonteRuido(t0, dur), f = filtro(tipo, freq, 0.8), g = ganho();
    env(g, t0, 0.003, pico, dur);
    s.connect(f); f.connect(g); g.connect(mestre);
  }

  // ---- torcida de fundo: dois ruídos em loop (corpo grave + "falatório" médio)
  function montarTorcida() {
    torcidaGain = ganho(); torcidaGain.gain.value = 0.0001;
    torcidaFiltro = filtro('bandpass', 700, 0.5);
    const lp = filtro('lowpass', 2400, 0.5);
    const a = fonteRuido(ctx.currentTime, 0, true), b = fonteRuido(ctx.currentTime, 0, true);
    const corpo = filtro('bandpass', 300, 0.6), gCorpo = ganho(); gCorpo.gain.value = 0.6;
    // "Murmúrio": o volume do falatório sobe e desce devagar (oscilador lento no ganho).
    const gFala = ganho(); gFala.gain.value = 0.7;
    const lfo = ctx.createOscillator(), lfoG = ganho(); lfo.frequency.value = 0.23; lfoG.gain.value = 0.25;
    lfo.connect(lfoG); lfoG.connect(gFala.gain); lfo.start();
    a.connect(torcidaFiltro); torcidaFiltro.connect(gFala); gFala.connect(lp);
    b.connect(corpo); corpo.connect(gCorpo); gCorpo.connect(lp);
    lp.connect(torcidaGain); torcidaGain.connect(mestre);
  }
  // nivel 0..1 (chamado todo quadro; só mexe no som quando muda de verdade)
  function torcida(nivel) {
    if (!ctx || !torcidaGain) return;
    const n = Math.round(clamp(nivel, 0, 1) * 20) / 20;
    if (n === nivelAtual) return;
    nivelAtual = n;
    const t = ctx.currentTime;
    torcidaGain.gain.setTargetAtTime(0.05 + 0.2 * n, t, 0.6);
    torcidaFiltro.frequency.setTargetAtTime(600 + 700 * n, t, 0.6);
  }

  return {
    ligar, torcida,
    get mudo() { return mudo; },
    alternarMudo() {
      mudo = !mudo;
      try { localStorage.setItem('futebolJsMudo', mudo ? '1' : '0'); } catch (e) { /* ok */ }
      if (mestre) mestre.gain.setTargetAtTime(mudo ? 0 : 0.85, ctx.currentTime, 0.05);
      return mudo;
    },
    pausar(p) { if (ctx) { if (p) ctx.suspend(); else ctx.resume(); } },
    // forca 0..1
    chute(forca) {
      if (!pronto() || !vaga(0.25)) return;
      const t = ctx.currentTime, f = clamp(forca, 0, 1);
      tom('sine', 140 + 60 * f, 45, t, 0.18, 0.55 + 0.4 * f);
      estalo(t, 0.06, 'bandpass', 1800, 0.25 + 0.35 * f);
    },
    // v19: cada toque sai um pouco diferente — altura, duração, "estalo" e às vezes um
    // segundo toquinho (a bola quicando no pé). Assim passes seguidos não soam repetidos.
    toque(forca = 0.3) {
      if (!pronto() || !vaga(0.15)) return;
      const t = ctx.currentTime, f = clamp(forca, 0, 1);
      const f0 = rand(190, 300), dur = rand(0.055, 0.1);
      tom(Math.random() < 0.7 ? 'sine' : 'triangle', f0, f0 * rand(0.4, 0.55), t, dur, (0.18 + 0.25 * f) * rand(0.8, 1.15));
      estalo(t, rand(0.015, 0.035), Math.random() < 0.5 ? 'highpass' : 'bandpass', rand(1800, 3600), (0.05 + 0.1 * f) * rand(0.7, 1.3));
      if (Math.random() < 0.3) tom('sine', f0 * 0.8, f0 * 0.4, t + rand(0.03, 0.06), 0.05, 0.08 + 0.08 * f);   // quique no pé
    },
    // Trave/travessão: "plém" metálico — tons que NÃO são harmônicos entre si (é o que soa a metal),
    // cada um sumindo num tempo diferente, mais um estalo na batida.
    trave(vel = 15) {
      if (!pronto() || !vaga(1.6)) return;
      const t = ctx.currentTime, k = clamp(vel / 25, 0.3, 1);
      const base = rand(480, 560);
      [[1, 1.5, 0.3], [2.76, 1.1, 0.18], [5.4, 0.7, 0.1], [8.93, 0.45, 0.06]].forEach(([m, dur, pico]) => {
        tom('sine', base * m, base * m * 0.995, t, dur, pico * k);
      });
      estalo(t, 0.03, 'highpass', 3000, 0.3 * k);
    },
    // Chute para fora: "óóóh..." da torcida, caindo no fim (decepção).
    ohh() {
      if (!pronto() || !vaga(2)) return;
      const t = ctx.currentTime;
      const vog = filtro('bandpass', 520, 1.6), g = ganho();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.12, t + 0.25);
      g.gain.setValueAtTime(0.12, t + 0.7);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
      vog.connect(g); g.connect(mestre);
      for (let i = 0; i < 8; i++) {
        const o = ctx.createOscillator(), f0 = rand(190, 300);
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(f0, t); o.frequency.setValueAtTime(f0, t + 0.6);
        o.frequency.exponentialRampToValueAtTime(f0 * 0.78, t + 1.7);    // a voz "cai" no fim
        o.connect(vog); o.start(t + rand(0, 0.08)); o.stop(t + 1.85);
      }
      const s = fonteRuido(t, 1.8), bp = filtro('bandpass', 480, 1.2), gn = ganho();   // "ar" da multidão
      gn.gain.setValueAtTime(0.0001, t); gn.gain.linearRampToValueAtTime(0.14, t + 0.25);
      gn.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
      s.connect(bp); bp.connect(gn); gn.connect(mestre);
    },
    // Passo na grama: "chhk" bem baixinho (ruído médio-agudo curtinho) + um toque grave quase mudo.
    passo() {
      if (!pronto() || !vaga(0.1)) return;
      const t = ctx.currentTime;
      estalo(t, rand(0.04, 0.07), 'bandpass', rand(1500, 2600), rand(0.035, 0.055));
      tom('sine', rand(80, 100), 50, t, 0.05, 0.03);
    },
    apito(dur = 0.3, atraso = 0) {
      if (!pronto() || !vaga(dur + atraso)) return;
      const t = ctx.currentTime + atraso;
      const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ganho(), bp = filtro('bandpass', 2900, 3);
      o.type = 'sine'; o.frequency.value = 2850; o2.type = 'triangle'; o2.frequency.value = 2860;
      const lfo = ctx.createOscillator(), lfoG = ganho(); lfo.type = 'square'; lfo.frequency.value = 32; lfoG.gain.value = 130;
      lfo.connect(lfoG); lfoG.connect(o.frequency); lfoG.connect(o2.frequency);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.32, t + 0.02);
      g.gain.setValueAtTime(0.32, t + dur - 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(bp); o2.connect(bp); bp.connect(g); g.connect(mestre);
      for (const x of [o, o2, lfo]) { x.start(t); x.stop(t + dur + 0.05); }
    },
    apitoFinal() { this.apito(0.32, 0); this.apito(0.32, 0.5); this.apito(1.15, 1.0); },
    // Gol (v19): em vez da explosão, a torcida SOBE em ~1 s e fica alta e constante uns 6 s
    // (barulho de estádio + "vozes"), depois vai baixando devagar.
    // Gol: a torcida SOBE em ~1 s e fica alta e constante até a saída de bola (Som.fimGol(),
    // chamado no kickoff), aí baixa devagar em ~2,5 s. Segurança: no máximo 45 s.
    gol() {
      if (!pronto()) return;
      this.fimGol();
      const t = ctx.currentTime, MAX = 45;
      const s = fonteRuido(t, MAX), bp = filtro('bandpass', 900, 0.5), lp = filtro('lowpass', 3000, 0.5), g = ganho();
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.3, t + 1.1);
      s.connect(bp); bp.connect(lp); lp.connect(g); g.connect(mestre);
      const vog = filtro('bandpass', 700, 0.9), gv = ganho();
      gv.gain.setValueAtTime(0.0001, t); gv.gain.linearRampToValueAtTime(0.07, t + 1.0);
      vog.connect(gv); gv.connect(mestre);
      const fontes = [s];
      for (let i = 0; i < 9; i++) {
        const o = ctx.createOscillator(), f0 = rand(180, 330);
        o.type = 'sawtooth'; o.frequency.value = f0;
        const vib = ctx.createOscillator(), vg = ganho(); vib.frequency.value = rand(0.3, 1.2); vg.gain.value = f0 * 0.03;   // ondulação lenta
        vib.connect(vg); vg.connect(o.frequency);
        o.connect(vog); o.start(t + rand(0, 0.4)); o.stop(t + MAX); vib.start(t); vib.stop(t + MAX);
        fontes.push(o, vib);
      }
      golAtivo = { ganhos: [g, gv], fontes };
    },
    fimGol() {
      if (!ctx || !golAtivo) return;
      const t = ctx.currentTime, G2 = golAtivo; golAtivo = null;
      for (const g of G2.ganhos) { g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(Math.max(0.0001, g.gain.value), t); g.gain.linearRampToValueAtTime(0.0001, t + 2.5); }
      for (const f of G2.fontes) { try { f.stop(t + 2.6); } catch (e) { /* já parou */ } }
    },
    defesa() {
      if (!pronto() || !vaga(1.3)) return;
      const t = ctx.currentTime;
      estalo(t, 0.12, 'lowpass', 600, 0.7);                 // "pof" das luvas
      tom('sine', 110, 60, t, 0.12, 0.45);
      const s = fonteRuido(t, 1.3), bp = filtro('bandpass', 450, 1.4), g = ganho();   // "uuuh"
      env(g, t + 0.05, 0.2, 0.22, 1.3);
      s.connect(bp); bp.connect(g); g.connect(mestre);
    },
    // tipo: 'ok' | 'erro' | 'perfeito'
    clique(tipo = 'ok') {
      if (!pronto() || !vaga(0.35)) return;
      const t = ctx.currentTime;
      if (tipo === 'perfeito') { [880, 1320, 1760].forEach((f, i) => tom('sine', f, f, t + i * 0.07, 0.12, 0.22)); return; }
      if (tipo === 'erro') { tom('square', 320, 200, t, 0.09, 0.09); return; }
      tom('square', 1400, 1350, t, 0.04, 0.1);
    },
    drible() {
      if (!pronto() || !vaga(0.4)) return;
      const t = ctx.currentTime, s = fonteRuido(t, 0.4), bp = filtro('bandpass', 500, 1.2), g = ganho();
      bp.frequency.setValueAtTime(450, t); bp.frequency.exponentialRampToValueAtTime(3000, t + 0.32);
      env(g, t, 0.06, 0.35, 0.38);
      s.connect(bp); bp.connect(g); g.connect(mestre);
    },
  };
})();
// O som só pode ligar depois de um toque/clique do jogador (regra dos navegadores).
window.addEventListener('pointerdown', () => Som.ligar(), { passive: true, capture: true });
window.addEventListener('keydown', () => Som.ligar());

// Quão "quente" está o jogo para a torcida de fundo (0 a 1): bola perto de um gol, chute no ar.
function nivelTorcida() {
  if (G.state === 'menu' || G.state === 'end') return 0;
  if (G.state === 'goal' || G.state === 'celebrate' || G.state === 'fim') return 0.6;
  const d = Math.min(Math.abs(HALF_L - ball.x), Math.abs(-HALF_L - ball.x)) + Math.abs(ball.z) * 0.3;
  let n = clamp(1 - (d - 8) / 40, 0, 1) * 0.8;
  if (ball.isShot) n = 1;
  return n;
}

function buildStands() {
  // Arquibancada em degraus nos quatro lados: degraus (concreto + cadeiras) num lote só e os
  // torcedores em outro (ver "TORCIDA" acima). Atrás do SEU gol (x < 0) é quase tudo azul,
  // atrás do gol deles quase tudo vermelho; nas laterais mistura, com blocos de cada time.
  const T = new Lote();
  const { FILEIRAS, ALT0, DEGRAU_Y, DEGRAU_Z, DIST0 } = ARQ;
  // POPULARIDADE (4.0.0): quanto mais popular o mandante (e um pouco o visitante), mais gente.
  // ocupacao = chance de cada cadeira ter alguém. casa = parte da torcida do mandante.
  const P = PARTIDA, popM = P ? P.timesObj[P.mandante].popularidade : 0.6, popV = P ? P.timesObj[1 - P.mandante].popularidade : 0.5;
  const ocupacao = clamp(0.18 + 0.62 * popM + 0.18 * popV, 0.12, 0.97);
  const casa = P ? P.mandante : 0;
  const partCasa = clamp(0.5 + 0.35 * (popM - popV) + 0.15, 0.35, 0.92);   // fração azul/vermelho nas laterais
  const timeTorcedor = (x) => {                     // laterais: mais torcida da casa no lado do gol dela
    const ladoCasa = casa === 0 ? -1 : 1;           // time 0 defende o gol de x < 0
    const p = clamp(partCasa + (x * ladoCasa / HALF_L) * 0.25, 0.05, 0.95);
    return Math.random() < p ? casa : 1 - casa;
  };
  const angulo = (x, z) => (Math.atan2(z, x) / (Math.PI * 2) + 1) % 1;
  for (let r = 0; r < FILEIRAS; r++) {
    const y = ALT0 + r * DEGRAU_Y, d = DIST0 + r * DEGRAU_Z;
    const concreto = r % 2 ? 0x3a414c : 0x343a44, cadeira = 0x26334a;
    for (const s of [-1, 1]) {
      const lenX = CONFIG.FIELD_L + 2 * (d + DEGRAU_Z), lenZ = CONFIG.FIELD_W + 2 * (d + DEGRAU_Z);
      T.caixa(lenX, y, DEGRAU_Z, concreto, 0, y / 2, s * (HALF_W + d + DEGRAU_Z / 2));
      T.caixa(lenX, 0.14, 0.45, cadeira, 0, y + 0.07, s * (HALF_W + d + 0.72));
      T.caixa(DEGRAU_Z, y, lenZ, concreto, s * (HALF_L + d + DEGRAU_Z / 2), y / 2, 0);
      T.caixa(0.45, 0.14, lenZ, cadeira, s * (HALF_L + d + 0.72), y + 0.07, 0);
      // Laterais (olhando para o centro do campo, em −s no Z).
      for (let x = -(HALF_L + d) + 0.5; x < HALF_L + d; x += 0.75) {
        if (Math.random() > ocupacao) continue;              // cadeira vazia
        const time = timeTorcedor(x), z = s * (HALF_W + d + 0.62);
        crowd.torcedor(x + rand(-0.12, 0.12), y + 0.14, z, 0, -s, time, Math.random() < 0.45, angulo(x, z));
      }
      // Fundos (atrás dos gols), olhando em −s no X: organizada, mais gente em pé.
      for (let z = -(HALF_W + d) + 0.5; z < HALF_W + d; z += 0.75) {
        if (Math.random() > Math.min(0.97, ocupacao * 1.08)) continue;   // atrás do gol: organizada, um pouco mais cheia
        const dono = s < 0 ? 0 : 1, time = Math.random() < 0.85 ? dono : 1 - dono, x = s * (HALF_L + d + 0.62);
        crowd.torcedor(x, y + 0.14, z + rand(-0.12, 0.12), -s, 0, time, Math.random() < 0.7, angulo(x, z));
      }
    }
  }
  const degraus = T.malha(MAT_CORES); ESTADIO.add(degraus); freeze(degraus);
  const torcida = crowd.malha(); ESTADIO.add(torcida); freeze(torcida);
  // Telhados e postes de luz num lote; lâmpadas (que brilham) em outro.
  const E = new Lote(), Lp = new Lote();
  for (const s of [-1, 1]) E.caixa(CONFIG.FIELD_L + 56, 0.6, 12, 0x2c3340, 0, 15, s * (HALF_W + 31));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    E.caixa(0.8, 34, 0.8, 0x59606b, sx * (HALF_L + 33), 17, sz * (HALF_W + 33));
    Lp.caixa(4, 2, 0.8, 0xfff3c4, sx * (HALF_L + 33), 34, sz * (HALF_W + 33));
  }
  const estrutura = E.malha(MAT_CORES); ESTADIO.add(estrutura); freeze(estrutura);
  lampadasMat = new THREE.MeshBasicMaterial({ vertexColors: true });   // cor muda com o horário (aplicarAmbiente)
  const lampadas = Lp.malha(lampadasMat); ESTADIO.add(lampadas); freeze(lampadas);
}

function buildGoal(side) {
  // Armação (traves, travessão e suporte das bolas reservas): 1 chamada de desenho.
  const pr = 0.12, gx = side * HALF_L;
  const A = new Lote();
  for (const z of [-GOAL_HALF, GOAL_HALF]) A.caixa(pr * 2, CONFIG.GOAL_H, pr * 2, 0xffffff, gx, CONFIG.GOAL_H / 2, z);
  A.caixa(pr * 2, pr * 2, CONFIG.GOAL_W + pr * 2, 0xffffff, gx, CONFIG.GOAL_H, 0);
  A.caixa(0.6, 0.5, 0.6, 0x2c3340, gx + side * 1.6, 0.25, GOAL_HALF + 2.5);
  const arm = A.malha(MAT_CORES); ESTADIO.add(arm); freeze(arm);
  // Rede (fundo, teto e laterais): 1 chamada de desenho.
  const net = new THREE.MeshBasicMaterial({
    map: drawTexture(32, 32, (g) => {
      g.fillStyle = 'rgba(255,255,255,0.75)';
      for (let i = 0; i < 32; i += 4) { g.fillRect(i, 0, 1, 32); g.fillRect(0, i, 32, 1); }
    }, 7, 3),
    transparent: true, side: THREE.DoubleSide, depthWrite: false,
  });
  const fx = gx + side * 2.2, H = CONFIG.GOAL_H, Z = GOAL_HALF;
  const R = new Lote();
  R.quad([fx, H, -Z], [fx, H, Z], [fx, 0, -Z], [fx, 0, Z], [-side, 0, 0]);                 // fundo
  R.quad([gx, H, -Z], [fx, H, -Z], [gx, H, Z], [fx, H, Z], [0, -1, 0]);                    // teto
  for (const z of [-Z, Z]) R.quad([gx, H, z], [fx, H, z], [gx, 0, z], [fx, 0, z], [0, 0, -Math.sign(z)]); // laterais
  const rede = R.malha(net); ESTADIO.add(rede); freeze(rede);
}

// (o estádio é montado em montarPartida → montarEstadio, no fim do arquivo)

// ---------------------------------------------------------------------
// 5. JOGADORES
// Boneco de blocos com as medidas do personagem do Super Lan Master.
// Estrutura: raiz (posição e giro) → corpo (balanço/inclinação) → pernas e braços em "pivôs".
// O boneco "olha" para +X; o lado direito dele é +Z local.
// ---------------------------------------------------------------------
const PELES = ['#F2C9A5', '#DDA67E', '#BF8159', '#946042', '#62402A'];
const CABELOS = ['#1C140F', '#3B2416', '#6B4423', '#C9A15A', '#0E0E0E'];

// Atlas de cada jogador (128×32): rosto, área branca (para as peças de cor), frente e costas da camisa.
//   x 0–16, y 0–16: rosto   |  x 0–16, y 16–32: branco  |  x 16–48: camisa (frente)  |  x 48–80: camisa (costas)
const ATLAS_W = 128, ATLAS_H = 32;
const regiao = (x0, y0, x1, y1) => [x0 / ATLAS_W, 1 - y1 / ATLAS_H, x1 / ATLAS_W, 1 - y0 / ATLAS_H];
const UV_ROSTO = regiao(0, 0, 16, 16), UV_BRANCO = regiao(4, 20, 12, 28);
const UV_FRENTE = regiao(16, 0, 48, 32), UV_COSTAS = regiao(48, 0, 80, 32);

function pintarRosto(g, ox, oy, pele) {
  g.fillStyle = pele; g.fillRect(ox, oy, 16, 16);
  g.fillStyle = '#16120F';
  g.fillRect(ox + 3, oy + 5, 4, 1); g.fillRect(ox + 9, oy + 5, 4, 1);
  g.fillRect(ox + 4, oy + 7, 2, 3); g.fillRect(ox + 10, oy + 7, 2, 3);
  g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(ox + 7, oy + 9, 2, 2);
  g.fillStyle = '#7A3B2E'; g.fillRect(ox + 6, oy + 12, 4, 1);
}
function pintarCamisa(g, ox, cor, listra, gola, numero, costas, emblema) {
  g.fillStyle = cor; g.fillRect(ox, 0, 32, 32);
  g.fillStyle = listra; g.fillRect(ox, 22, 32, 4);
  g.fillStyle = gola; g.fillRect(ox + 11, 0, 10, 3);
  if (costas) {
    g.fillStyle = '#FFFFFF'; g.font = 'bold 15px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(String(numero), ox + 16, 12);
  } else {
    if (emblema) desenharEmblema(g, ox + 19, 5, 8, 9, emblema);   // emblema do time no peito
    else { g.fillStyle = '#FFFFFF'; g.fillRect(ox + 19, 6, 7, 8); g.fillStyle = listra; g.fillRect(ox + 20, 7, 5, 6); }
  }
}
function atlasJogador(o) {
  return drawTexture(ATLAS_W, ATLAS_H, (g) => {
    g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, ATLAS_W, ATLAS_H);
    pintarRosto(g, 0, 0, o.pele);
    pintarCamisa(g, 16, o.camisa, o.listra, o.gola, o.numero, false, o.emblema);
    pintarCamisa(g, 48, o.camisa, o.listra, o.gola, o.numero, true);
  });
}
function texNome(nome, fundo) {
  return drawTexture(128, 20, (g, w) => {
    g.clearRect(0, 0, w, 20);
    g.font = 'bold 12px Arial'; g.textAlign = 'center';
    const txt = nome.length > 16 ? nome.slice(0, 15) + '…' : nome;
    const larg = Math.min(w - 2, g.measureText(txt).width + 10);
    g.fillStyle = fundo || 'rgba(7,20,48,0.85)';
    g.fillRect((w - larg) / 2, 2, larg, 16);
    g.fillStyle = '#FFFFFF';
    g.fillText(txt, w / 2, 14);
  });
}

// DESEMPENHO: cada boneco era feito de ~20 caixas e algumas tinham 6 materiais — umas 39 chamadas de
// desenho por jogador (542 só nos jogadores). Agora as caixas de cada parte que se mexe junta viram
// UMA malha: corpo (com cabeça e cabelo), perna esquerda, perna direita, braço esquerdo e braço direito.
// São 5 malhas + sombra (+ a etiqueta, quando aparece) = 6 ou 7 por jogador.
// As medidas e as cores são exatamente as mesmas de antes.
// (4.1.3) SOMBRAS NO CHÃO: a sombra é filha do boneco, então subia junto no pulo, no mergulho, em
// cima da placa... Agora, uma vez por quadro (antes de desenhar), cada sombra é recolocada NO CHÃO
// embaixo do boneco, deitada, e diminui um pouco quanto mais alto ele está.
const ATLETAS = new Set();
const _somM = new THREE.Matrix4(), _somI = new THREE.Matrix4(), _somQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0)), _somS = new THREE.Vector3(), _somP = new THREE.Vector3();
function ajustarSombras() {
  for (const A of ATLETAS) {
    const r = A.raiz, s = A.sombra;
    if (!r.parent || !r.visible || !s.visible) continue;
    r.updateMatrixWorld(true);
    const h = Math.max(0, r.position.y), k = clamp(1 - h * 0.35, 0.55, 1);
    _somP.set(0, 0.9, 0).applyMatrix4(r.matrixWorld); _somP.y = 0.02;   // embaixo do quadril (deitado/mergulhando: embaixo do corpo)
    _somS.set(k, k, k);
    _somM.compose(_somP, _somQ, _somS);
    _somI.copy(r.matrixWorld).invert().multiply(_somM);
    _somI.decompose(s.position, s.quaternion, s.scale);
  }
}
function makeAthlete(o) {
  const raiz = new THREE.Group();
  raiz.rotation.order = 'YXZ';                    // primeiro gira (Y), depois inclina/cai
  const corpo = new THREE.Group();
  raiz.add(corpo);
  const material = new THREE.MeshLambertMaterial({ map: atlasJogador(o), vertexColors: true });
  const hex = (h) => (typeof h === 'number' ? h : parseInt(h.slice(1), 16));
  const pele = hex(o.pele), cabelo = hex(o.cabelo), camisa = hex(o.camisa);
  // Ordem 'ZXY' nos ombros e quadris: primeiro abre/fecha o braço para o lado (X), depois leva para a
  // frente (Z). Assim, com os braços para a frente, fechar as mãos realmente aproxima uma da outra.
  const pivo = (x, y, z) => { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.order = 'ZXY'; corpo.add(g); return g; };

  // Perna: normalmente é UMA malha (perna inteira, 1 chamada de desenho). Para a joelhada
  // existe uma segunda versão com JOELHO: coxa + canela (a canela gira no joelho, a 0,28 m do
  // quadril). Ela fica escondida e só aparece durante a joelhada — malha escondida não custa
  // chamada de desenho, então o jogo continua com o mesmo desempenho.
  const perna = (z) => {
    const p = pivo(0, 0.74, z), L = new Lote(UV_BRANCO);
    L.caixa(0.2, 0.28, 0.2, pele, 0, -0.14, 0);
    L.caixa(0.22, 0.34, 0.22, hex(o.meia), 0, -0.45, 0);
    L.caixa(0.32, 0.12, 0.24, 0x1d1f24, 0.04, -0.66, 0);
    L.caixa(0.33, 0.03, 0.25, hex(o.sola), 0.04, -0.715, 0);
    p.inteira = L.malha(material); p.add(p.inteira);
    const LC = new Lote(UV_BRANCO);
    LC.caixa(0.2, 0.28, 0.2, pele, 0, -0.14, 0);
    p.coxa = LC.malha(material); p.coxa.visible = false; p.add(p.coxa);
    const joelho = new THREE.Group();
    joelho.position.set(0, -0.28, 0); joelho.rotation.order = 'ZXY'; joelho.visible = false;
    const LK = new Lote(UV_BRANCO);                 // mesmas peças, agora medidas a partir do joelho
    LK.caixa(0.22, 0.34, 0.22, hex(o.meia), 0, -0.17, 0);
    LK.caixa(0.32, 0.12, 0.24, 0x1d1f24, 0.04, -0.38, 0);
    LK.caixa(0.33, 0.03, 0.25, hex(o.sola), 0.04, -0.435, 0);
    joelho.add(LK.malha(material)); p.add(joelho);
    p.joelho = joelho;
    return p;
  };
  // Braço: igual à perna — normalmente UMA malha (braço inteiro). Para poses com o braço dobrado
  // (mão na cintura) existe a versão com COTOVELO, a 0,30 m do ombro: "ombro" (manga + braço) e o
  // antebraço com a mão, que gira no cotovelo. Fica escondida e só aparece quando é usada.
  const braco = (z) => {
    const p = pivo(0, 1.27, z), L = new Lote(UV_BRANCO);
    const corMao = o.luva ? hex(o.luva) : pele;
    L.caixa(0.21, 0.24, 0.19, camisa, 0, -0.1, 0);
    L.caixa(0.16, 0.3, 0.15, pele, 0, -0.36, 0);
    L.caixa(0.17, 0.16, 0.17, corMao, 0, -0.57, 0);
    p.inteira = L.malha(material); p.add(p.inteira);
    const LO = new Lote(UV_BRANCO);
    LO.caixa(0.21, 0.24, 0.19, camisa, 0, -0.1, 0);
    LO.caixa(0.16, 0.17, 0.15, pele, 0, -0.295, 0);       // até um pouco depois do cotovelo (tapa a "dobra")
    p.ombro = LO.malha(material); p.ombro.visible = false; p.add(p.ombro);
    const cotovelo = new THREE.Group();
    cotovelo.position.set(0, -0.3, 0); cotovelo.rotation.order = 'ZXY'; cotovelo.visible = false;
    const LA = new Lote(UV_BRANCO);                 // antebraço e mão, medidos a partir do cotovelo
    LA.caixa(0.15, 0.24, 0.14, pele, 0, -0.1, 0);
    LA.caixa(0.17, 0.16, 0.17, corMao, 0, -0.27, 0);
    cotovelo.add(LA.malha(material)); p.add(cotovelo);
    p.cotovelo = cotovelo;
    return p;
  };
  const pernaE = perna(-0.13), pernaD = perna(0.13);
  const bracoE = braco(-0.39), bracoD = braco(0.39);

  const C = new Lote(UV_BRANCO);
  C.caixa(0.34, 0.26, 0.6, hex(o.calcao), 0, 0.8, 0);   // (4.1.1) 0,6: as laterais não ficam no mesmo plano da camisa (piscava)
  C.caixa(0.32, 0.58, 0.58, camisa, 0, 1.03, 0, (i) => (i === 0 ? UV_FRENTE : i === 1 ? UV_COSTAS : null)); // tronco
  C.caixa(0.16, 0.06, 0.18, pele, 0, 1.34, 0);                                                              // pescoço
  C.caixa(0.48, 0.52, 0.52, pele, 0, 1.62, 0, (i) => (i === 0 ? UV_ROSTO : null));                           // cabeça
  const CABELOS_ESTILO = [
    [[0.52, 0.14, 0.56, -0.01, 1.91, 0], [0.08, 0.32, 0.56, -0.25, 1.73, 0]],
    [[0.52, 0.24, 0.56, -0.01, 1.95, 0], [0.1, 0.4, 0.56, -0.24, 1.7, 0], [0.36, 0.2, 0.06, -0.04, 1.76, -0.27], [0.36, 0.2, 0.06, -0.04, 1.76, 0.27]],
    [[0.5, 0.06, 0.54, -0.01, 1.89, 0], [0.06, 0.18, 0.54, -0.24, 1.8, 0]],
  ];
  for (const [w, h, d, x, y, z] of CABELOS_ESTILO[o.estilo]) C.caixa(w, h, d, cabelo, x, y, z);
  const troncoInteiro = C.malha(material); corpo.add(troncoInteiro);
  // Cabeça que abaixa (tristeza): corpo SEM cabeça + cabeça num pivô no pescoço (y 1,36).
  // Mesmo truque do joelho: escondidos, não custam nada; só aparecem na pose de cabeça baixa.
  const CT = new Lote(UV_BRANCO);
  CT.caixa(0.34, 0.26, 0.6, hex(o.calcao), 0, 0.8, 0);
  CT.caixa(0.32, 0.58, 0.58, camisa, 0, 1.03, 0, (i) => (i === 0 ? UV_FRENTE : i === 1 ? UV_COSTAS : null));
  CT.caixa(0.16, 0.06, 0.18, pele, 0, 1.34, 0);
  const troncoSemCabeca = CT.malha(material); troncoSemCabeca.visible = false; corpo.add(troncoSemCabeca);
  const cabeca = new THREE.Group();
  cabeca.position.set(0.02, 1.36, 0); cabeca.rotation.order = 'ZXY'; cabeca.visible = false;
  const CB = new Lote(UV_BRANCO);
  CB.caixa(0.48, 0.52, 0.52, pele, -0.02, 0.26, 0, (i) => (i === 0 ? UV_ROSTO : null));
  for (const [w, h, d, x, y, z] of CABELOS_ESTILO[o.estilo]) CB.caixa(w, h, d, cabelo, x - 0.02, y - 1.36, z);
  cabeca.add(CB.malha(material)); corpo.add(cabeca);

  const etiqueta = new THREE.Sprite(new THREE.SpriteMaterial({ map: texNome(o.nome, o.fundoNome), depthTest: false, transparent: true }));
  etiqueta.scale.set(1.3, 0.2, 1);
  etiqueta.position.set(0, 2.3, 0);
  etiqueta.renderOrder = 10;
  raiz.add(etiqueta);
  const sombra = new THREE.Mesh(SHADOW_GEO, SHADOW_MAT);
  sombra.rotation.x = -Math.PI / 2; sombra.position.y = 0.02;
  raiz.add(sombra);
  const atleta = { raiz, corpo, pernaE, pernaD, bracoE, bracoD, etiqueta, troncoInteiro, troncoSemCabeca, cabeca, sombra };
  raiz.userData.atleta = atleta; ATLETAS.add(atleta);
  return atleta;
}
// Reação de quem tomou o gol (k vai de 0 a 1 em 0,7 s). Valores conferidos no gramado:
//   cintura: mãos na cintura DE VERDADE (v15): o braço abre ~66° para o lado e o cotovelo dobra
//            ~115° de volta, a mão para encostada no quadril (conta feita: mão a 0,97 m do chão,
//            colada na lateral do tronco); cabeça baixa no pivô do pescoço, ombros um pouco caídos
//   sentado: com joelho; as pernas sobem rápido (√k) e o corpo desce devagar (k²), assim
//            nada atravessa o chão no meio do movimento; quadril para a 15 cm do chão
//   deitado: mesma pose de "caído de costas" da bicicleta
function aplicarLamento(p, m) {
  const k = p.lamentoK;
  if (p.lamento === 'cintura') {
    m.bracoE.rotation.x = lerp(m.bracoE.rotation.x, 1.16, k); m.bracoD.rotation.x = lerp(m.bracoD.rotation.x, -1.16, k);
    m.bracoE.rotation.z = lerp(m.bracoE.rotation.z, 0, k); m.bracoD.rotation.z = lerp(m.bracoD.rotation.z, 0, k);
    usarCotovelos(m, -2.0 * k, 2.0 * k);          // antebraço volta para dentro até a mão no quadril
    m.corpo.rotation.z = lerp(m.corpo.rotation.z, -0.1, k);
    usarCabeca(m, -0.5 * k);                      // olhando para o chão
  } else if (p.lamento === 'sentado') {
    const kl = Math.sqrt(k), ky = k * k;
    m.raiz.position.y = -0.59 * ky; m.raiz.rotation.x = 0; m.raiz.rotation.z = 0;
    m.corpo.rotation.z = 0.25 * kl; m.corpo.position.y = 0;
    m.pernaE.rotation.z = 1.7 * kl; m.pernaD.rotation.z = 1.7 * kl;
    usarJoelhos(m, -0.6 * kl, -0.6 * kl);
    m.bracoE.rotation.z = m.bracoD.rotation.z = -0.7 * kl;     // mãos atrás, apoiando no chão
    m.bracoE.rotation.x = 0.3 * kl; m.bracoD.rotation.x = -0.3 * kl;
  } else {
    m.raiz.rotation.z = 1.45 * k; m.raiz.rotation.x = 0; m.raiz.position.y = 0.17 * k;
    m.corpo.rotation.z = 0; m.corpo.position.y = 0;
    m.pernaE.rotation.z = m.pernaD.rotation.z = 0;
    m.bracoE.rotation.z = m.bracoD.rotation.z = -0.2 * k;
    m.bracoE.rotation.x = 0.9 * k; m.bracoD.rotation.x = -0.9 * k;
  }
}

// Liga/desliga o joelho das duas pernas. ang = quanto a canela dobra para trás (negativo).
function usarJoelhos(m, angE, angD) {
  const liga = angE !== 0 || angD !== 0;
  if (liga !== !!m.joelhosLigados) {
    for (const pe of [m.pernaE, m.pernaD]) { pe.inteira.visible = !liga; pe.coxa.visible = liga; pe.joelho.visible = liga; }
    m.joelhosLigados = liga;
  }
  // (4.1.1) desligado = ângulo ZERO (antes o último ângulo ficava guardado e o replay religava a
  // peça dobrada: braço "sumindo" para dentro do corpo, perna torta).
  m.pernaE.joelho.rotation.z = liga ? angE : 0; m.pernaD.joelho.rotation.z = liga ? angD : 0;
}
// Liga/desliga o cotovelo dos dois braços. ang = dobra do antebraço (em X, para dentro do corpo:
// negativo no braço esquerdo, positivo no direito).
function usarCotovelos(m, angE, angD) { usarCotovelo(m.bracoE, angE, 0); usarCotovelo(m.bracoD, angD, 0); }
// Um braço só: ax = dobra para dentro/fora (X), az = dobra para a frente (Z, antebraço sobe à frente).
function usarCotovelo(b, ax, az) {
  const liga = ax !== 0 || az !== 0;
  if (liga !== !!b.cotLigado) { b.inteira.visible = !liga; b.ombro.visible = liga; b.cotovelo.visible = liga; b.cotLigado = liga; }
  b.cotovelo.rotation.x = liga ? ax : 0; b.cotovelo.rotation.z = liga ? az : 0;
}
// Liga/desliga a cabeça separada. ang negativo = abaixa (queixo para o peito).
function usarCabeca(m, ang) {
  const liga = ang !== 0;
  if (liga !== !!m.cabecaLigada) {
    m.troncoInteiro.visible = !liga; m.troncoSemCabeca.visible = liga; m.cabeca.visible = liga;
    m.cabecaLigada = liga;
  }
  m.cabeca.rotation.z = liga ? ang : 0;
}
const SHADOW_GEO = new THREE.CircleGeometry(0.38, 10);
const SHADOW_MAT = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3, depthWrite: false });

// Formação, nomes e cores dos times vêm dos DADOS da partida (FORMACOES, TIMES, NOMES).
const players = [];
const TEAMS = [[], []];          // DESEMPENHO: listas fixas por time, sem filtrar arrays todo quadro
let user = null;

// Os jogadores são criados em montarTimes() (montagem da partida, no fim do arquivo).

// ---------------------------------------------------------------------
// ARBITRAGEM: juiz e dois assistentes (bandeirinhas)
//   Juiz: acompanha a jogada na diagonal, um pouco atrás. Apita, aponta e mostra cartão.
//   Assistente 1: lateral de baixo (z negativo), cuida do ataque AZUL (metade x > 0).
//   Assistente 2: lateral de cima (z positivo), cuida do ataque VERMELHO (metade x < 0).
//   Cada assistente corre alinhado com o penúltimo defensor (ou com a bola, se ela estiver
//   mais à frente), nunca antes do meio-campo — é a linha do impedimento.
// ---------------------------------------------------------------------
const officials = [];
let referee = null;
function criarArbitragem() {
  const base = { camisa: '#161616', listra: '#E8C547', gola: '#3a3a3a', numero: '', calcao: 0x161616, meia: 0x161616, sola: 0xE8C547, estilo: 2 };
  const dados = [
    { role: 'REF', nome: 'Árbitro', x: -6, z: -10, pele: '#BF8159', cabelo: '#1C140F' },
    { role: 'AR', nome: 'Assistente', x: 10, z: -(HALF_W + 1.3), pele: '#DDA67E', cabelo: '#3B2416', cobre: 0 },
    { role: 'AR', nome: 'Assistente', x: -10, z: HALF_W + 1.3, pele: '#946042', cabelo: '#0E0E0E', cobre: 1 },
  ];
  dados.forEach((d, i) => {
    const mesh = makeAthlete(Object.assign({}, base, { pele: d.pele, cabelo: d.cabelo, nome: d.nome, fundoNome: 'rgba(30,30,30,0.9)' }));
    scene.add(mesh.raiz);
    const o = {
      id: 200 + i, role: d.role, team: 2, x: d.x, z: d.z, vx: 0, vz: 0, angle: Math.PI / 2, anim: 0,
      stun: 0, guard: 0, tackle: 0, fall: 0, fallKind: 'lado', diveT: 0, jumpT: 0, kickT: 0, celeb: null,
      isUser: false, mesh, refPose: null, refPoseT: 0, cobre: d.cobre, lineZ: d.z,
    };
    if (d.role === 'AR') {
      // Bandeira na mão direita: cabo + pano (1 malha).
      const L = new Lote();
      L.caixa(0.03, 0.55, 0.03, 0x2b2b2b, 0.04, -0.82, 0);
      L.caixa(0.02, 0.24, 0.32, 0xF7941D, 0.04, -1.0, 0.16);
      mesh.bracoD.add(L.malha(MAT_CORES));
    } else {
      // Cartão na mão direita (só aparece quando ele mostra).
      o.cartao = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.15, 0.1), new THREE.MeshBasicMaterial({ color: 0xffd400 }));
      o.cartao.position.set(0.02, -0.7, 0); o.cartao.visible = false;
      mesh.bracoD.add(o.cartao);
      referee = o;
    }
    officials.push(o);
  });
}

// Linha de impedimento de cada time atacante, em coordenada "rel" (x × direção do ataque):
// posição do PENÚLTIMO defensor adversário (o goleiro conta).
function atualizarLinhas() {
  for (const T of [0, 1]) {
    const dir = T === 0 ? 1 : -1;
    let a = -Infinity, b = -Infinity;
    for (const o of TEAMS[1 - T]) { const r = o.x * dir; if (r > a) { b = a; a = r; } else if (r > b) b = r; }
    G.offLine[T] = b === -Infinity ? (a === -Infinity ? HALF_L : a) : b;
  }
}
// Até onde um atacante pode ir sem ficar impedido (rel): a linha, a bola, ou o meio-campo.
const limiteLegal = (team) => Math.max(G.offLine[team], ball.x * (team === 0 ? 1 : -1), 0);

function updateOfficials(dt, rdt) {
  atualizarLinhas();
  for (const o of officials) {
    let tx, tz;
    if (o.role === 'REF') {
      // O juiz acompanha o lance de longe, na diagonal, e não entra nas áreas (a não ser no pênalti).
      // Em bola parada ele fica num lugar de juiz de verdade, longe do cobrador e do goleiro.
      const S = G.sp, lim = HALF_L - BOX.depth - 2;
      if (G.state === 'foul' && G.foul) {
        const s = G.foul.spot;
        tx = s.x + (s.x > 0 ? -2.5 : 2.5); tz = s.z + (s.z > 0 ? -3 : 3);
        tx = clamp(tx, -lim, lim);
      } else if (S && (G.state === 'restart' || S.phase === 'wait')) {
        const sx = S.ballSpot ? S.ballSpot : S.spot;
        if (S.kind === 'tiro de meta') { tx = S.side * (HALF_L - 32); tz = -Math.sign(sx.z || 1) * 8; }
        else if (S.kind === 'escanteio') { tx = S.side * (HALF_L - 20); tz = -S.zs * 6; }
        else if (S.kind === 'penalti') { tx = S.side * (HALF_L - BOX.depth - 1.5); tz = 9; }
        else if (S.kind === 'lateral') { tx = clamp(sx.x - (S.team === 0 ? 1 : -1) * 8, -lim, lim); tz = sx.z * 0.45; }
        else { tx = clamp(sx.x + (S.team === 0 ? 1 : -1) * 6, -lim, lim); tz = sx.z + (sx.z > 0 ? -7 : 7); }
      } else {
        const F = G.focus || ball;
        const atk = G.possession ? G.possession.dir : (ball.vx >= 0 ? 1 : -1);
        tx = clamp(F.x - atk * 9, -lim, lim); tz = F.z * 0.5 + (F.z >= 0 ? -10 : 10);
        // nunca em cima da bola: pelo menos 7 m
        const dbx = tx - ball.x, dbz = tz - ball.z, db = Math.hypot(dbx, dbz);
        if (db < 7) { const k = 7 / (db || 1); tx = ball.x + dbx * k; tz = ball.z + dbz * k; }
      }
      tx = clamp(tx, -HALF_L + 3, HALF_L - 3); tz = clamp(tz, -HALF_W + 2, HALF_W - 2);
    } else {
      const dir = o.cobre === 0 ? 1 : -1;
      tx = clamp(limiteLegal(o.cobre), 0, HALF_L) * dir; tz = o.lineZ;
      if (o.refPose === 'bandeira' || (G.foul && G.foul.ar === o)) { tx = o.x; tz = o.z; }   // parado com a bandeira
    }
    const des = seek(o, tx, tz, o.role === 'REF' ? 6.5 : 7);
    const k = Math.min(1, dt * 6);
    o.vx += (des.vx - o.vx) * k; o.vz += (des.vz - o.vz) * k;
    o.x += o.vx * dt; o.z += o.vz * dt;
    const alvo = o.refPose && o.role === 'REF' && G.foul ? G.foul.off : (G.foul && G.foul.ar === o ? { x: o.x, z: 0 } : ball);   // bandeirinha olha para o campo
    o.angle = turnToward(o.angle, Math.atan2(alvo.z - o.z, alvo.x - o.x), 6 * dt);
    o.anim += Math.hypot(o.vx, o.vz) * dt * 2.6;
    if (o.refPoseT > 0) { o.refPoseT -= rdt; if (o.refPoseT <= 0) o.refPose = null; }
    if (o.cartao) o.cartao.visible = o.refPose === 'cartao';
  }
}

// ---------------------------------------------------------------------
// IMPEDIMENTO (regra do futebol):
//   No momento do passe, um atacante está em posição de impedimento se estiver no campo de ataque
//   (depois do meio-campo), à frente da bola E à frente do penúltimo defensor.
//   Só vira infração se ELE participar do lance (receber/tocar na bola antes de outro jogador).
//   Não existe impedimento em lateral, escanteio e tiro de meta.
// ---------------------------------------------------------------------
function calcOffside(from) {
  const T = from.team, dir = from.dir;
  atualizarLinhas();
  const linha = G.offLine[T], bolaRel = ball.x * dir, set = new Set();
  for (const t of TEAMS[T]) {
    if (t === from) continue;
    const r = t.x * dir;
    if (r > 0 && r > bolaRel + 0.15 && r > linha + 0.15) set.add(t);
  }
  return set.size ? { team: T, set } : null;
}

function nomeDe(p) { return p.isUser ? 'você' : p.name; }

function callOffside(p) {
  const r0 = G.offside && G.offside.reg;
  const replayImp = r0 ? { t: r0.t, linhaX: r0.linhaX, atacX: r0.pos.has(p) ? r0.pos.get(p) : p.x } : null;
  G.offside = null;
  const ar = officials.find((o) => o.role === 'AR' && o.cobre === p.team);
  if (ar) { ar.refPose = 'bandeira'; ar.refPoseT = 2.6; ar.vx = ar.vz = 0; }
  referee.refPose = 'apito'; referee.refPoseT = 1.4; Som.apito(0.35);
  if (p.isUser) G.stats.impedimentos++;
  // A câmera mostra o BANDEIRINHA com a bandeira levantada (corte seco), não o juiz.
  iniciarParalisacao({ team: 1 - p.team, spot: { x: p.x, z: p.z }, off: p, vic: null, card: null, reason: 'impedimento', ar, cut: true, replayImp });
  showToast('Impedimento de ' + nomeDe(p) + '!', p.team === 0 ? 'bad' : 'good');
}

criarArbitragem();

const opponentsOf = (p) => TEAMS[1 - p.team];
const teamOf = (p) => TEAMS[p.team];

const flatRing = (r1, r2, color, opacity = 0.9) => {
  const m = new THREE.Mesh(new THREE.RingGeometry(r1, r2, 16), new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; scene.add(m); return m;
};
const userRing = flatRing(0.5, 0.68, 0xf7941d);
const targetRing = flatRing(0.7, 0.95, 0xffffff); targetRing.visible = false;
const dribbleRing = flatRing(0.6, 0.8, 0xff7676, 0.8); dribbleRing.visible = false;

const aimArrow = (() => {
  const s = new THREE.Shape();
  s.moveTo(0, -0.22); s.lineTo(4.2, -0.22); s.lineTo(4.2, -0.7); s.lineTo(5.8, 0);
  s.lineTo(4.2, 0.7); s.lineTo(4.2, 0.22); s.lineTo(0, 0.22); s.lineTo(0, -0.22);
  const mesh = new THREE.Mesh(new THREE.ShapeGeometry(s), new THREE.MeshBasicMaterial({ color: 0xf7941d, transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false }));
  mesh.rotation.x = -Math.PI / 2;
  const grp = new THREE.Group(); grp.add(mesh); grp.visible = false; scene.add(grp);
  return grp;
})();

// ---------------------------------------------------------------------
// COMEMORAÇÕES: animações por quadros-chave (os mesmos números do celebracoes.glb).
// Cada quadro-chave diz a pose naquele instante; entre um e outro o jogo interpola.
//   y = altura do boneco   lean = inclinação do tronco (negativo = para a frente)
//   roll = tombo de lado   aLz/aRz = braços para frente/cima (π ≈ apontando para cima)
//   aLx/aRx = braços abertos para os lados   lLz/lRz = pernas (negativo = para trás)
// vel = velocidade ao longo do tempo; giro = quanto ele vai virando (rad/s);
// swing = até quando as pernas continuam correndo por cima da pose.
// ---------------------------------------------------------------------
const POSE0 = { y: 0, lean: 0, roll: 0, aLz: 0, aRz: 0, aLx: 0.2, aRx: -0.2, lLz: 0, lRz: 0, jL: 0, jR: 0 };
const CELEBRACOES = {
  // Aviãozinho: quando é VOCÊ, só abre os braços e inclina para o lado da curva; para onde ele
  // vai é você que controla no joystick (os quadros-chave abaixo são da versão da IA).
  aviao: {
    nome: 'Aviãozinho', dur: 3.2, giro: 0.9, swing: 3.2, controlado: true,
    vel: [[0, 6.5], [2.8, 6.5], [3.2, 2]],
    keys: [
      [0.0, { y: 0, lean: -0.1, roll: 0, aLz: 0, aRz: 0, aLx: 0.3, aRx: -0.3, lLz: 0, lRz: 0 }],
      [0.4, { y: 0, lean: -0.15, roll: 0.3, aLz: 0, aRz: 0, aLx: 1.5, aRx: -1.5, lLz: 0, lRz: 0 }],
      [1.2, { y: 0, lean: -0.15, roll: -0.35, aLz: 0, aRz: 0, aLx: 1.5, aRx: -1.5, lLz: 0, lRz: 0 }],
      [2.0, { y: 0, lean: -0.15, roll: 0.35, aLz: 0, aRz: 0, aLx: 1.5, aRx: -1.5, lLz: 0, lRz: 0 }],
      [2.8, { y: 0, lean: -0.15, roll: -0.2, aLz: 0, aRz: 0, aLx: 1.5, aRx: -1.5, lLz: 0, lRz: 0 }],
      [3.2, { y: 0, lean: -0.05, roll: 0, aLz: 0, aRz: 0, aLx: 0.3, aRx: -0.3, lLz: 0, lRz: 0 }],
    ],
  },
  joelhada: {
    // v10: desliza ~2 s (perdendo velocidade aos poucos) e fica só ~0,6 s parado antes de levantar.
    // v11: com JOELHO (jL/jR = dobra da canela). Ajoelhado: tronco quase reto (só 0,15 para trás —
    // conferido no 3D de verdade: 0,4 parecia que ele ia cair de costas), coxa em pé, canela deitada
    // para trás e os joelhos a ~11 cm do chão. As chaves de 0,17 s e 2,65 s seguram o corpo mais alto enquanto
    // as pernas dobram/esticam (conferido quadro a quadro: nada entra no gramado).
    nome: 'Joelhada', dur: 2.85, giro: 0, swing: 0.12,
    vel: [[0, 7.5], [0.35, 7.5], [1.2, 5.5], [1.9, 2.5], [2.25, 0], [2.85, 0]],
    keys: [
      [0.0, { y: 0.03, lean: -0.2, roll: 0, aLz: 0, aRz: 0, aLx: 0.2, aRx: -0.2, lLz: 0, lRz: 0, jL: 0, jR: 0 }],
      [0.17, { y: 0.08, lean: 0.05, roll: 0, aLz: 1.4, aRz: 1.4, aLx: 0.3, aRx: -0.3, lLz: -0.08, lRz: -0.08, jL: -0.95, jR: -0.95 }],
      [0.35, { y: -0.34, lean: 0.15, roll: 0, aLz: 2.8, aRz: 2.8, aLx: 0.5, aRx: -0.5, lLz: -0.15, lRz: -0.15, jL: -1.9, jR: -1.9 }],
      [1.9, { y: -0.34, lean: 0.15, roll: 0, aLz: 2.8, aRz: 2.8, aLx: 0.5, aRx: -0.5, lLz: -0.15, lRz: -0.15, jL: -1.9, jR: -1.9 }],
      [2.2, { y: -0.34, lean: 0.15, roll: 0, aLz: 2.3, aRz: 2.3, aLx: 0.5, aRx: -0.5, lLz: -0.15, lRz: -0.15, jL: -1.9, jR: -1.9 }],
      [2.45, { y: -0.34, lean: 0.15, roll: 0, aLz: 2.9, aRz: 2.9, aLx: 0.5, aRx: -0.5, lLz: -0.15, lRz: -0.15, jL: -1.9, jR: -1.9 }],
      [2.65, { y: 0.12, lean: 0.05, roll: 0, aLz: 1.45, aRz: 1.45, aLx: 0.3, aRx: -0.3, lLz: -0.08, lRz: -0.08, jL: -0.95, jR: -0.95 }],
      [2.85, { y: 0, lean: 0, roll: 0, aLz: 0, aRz: 0, aLx: 0.2, aRx: -0.2, lLz: 0, lRz: 0, jL: 0, jR: 0 }],
    ],
  },
};
function celebPose(c, t) {
  const K = c.keys;
  if (t <= K[0][0]) return K[0][1];
  for (let i = 0; i < K.length - 1; i++) {
    const [t0, a] = K[i], [t1, b] = K[i + 1];
    if (t <= t1) {
      const f = smooth((t - t0) / (t1 - t0)), out = {};
      for (const key in POSE0) out[key] = lerp(a[key] ?? POSE0[key], b[key] ?? POSE0[key], f);   // jL/jR só existem na joelhada
      return out;
    }
  }
  return K[K.length - 1][1];
}
function celebVel(c, t) {
  const V = c.vel;
  for (let i = 0; i < V.length - 1; i++) if (t <= V[i + 1][0]) return lerp(V[i][1], V[i + 1][1], (t - V[i][0]) / (V[i + 1][0] - V[i][0]));
  return V[V.length - 1][1];
}

// ---------------------------------------------------------------------
// 6. BOLA (em jogo) e BOLA MORTA (a que saiu, fica rolando lá fora durante a cena)
// ---------------------------------------------------------------------
const ball = {
  x: 0, y: CONFIG.BALL_R, z: 0, vx: 0, vy: 0, vz: 0,
  spinSide: 0, spinVert: 0, lastKicker: null, broken: false,
  isShot: false, userShot: false, userPass: false, saveRolled: false, saveOk: false,
  hidden: false,                                  // escondida enquanto o cobrador vai buscar
};
// Bola com estrelas (como a bola de estrelas da foto): 12 estrelas pretas de 5 pontas sobre o branco,
// uma em cada vértice de um icosaedro. Cada triângulo da esfera é pintado de preto se o centro dele
// cair dentro da estrela mais próxima. Facetada de propósito (visual PS1).
const BALL_GEO = (() => {
  const geo0 = new THREE.IcosahedronGeometry(CONFIG.BALL_R, 3);
  const geo = geo0.index ? geo0.toNonIndexed() : geo0;
  const P = geo.attributes.position, n = P.count, colors = new Float32Array(n * 3);
  const phi = (1 + Math.sqrt(5)) / 2;
  const V = [[-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0], [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
    [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1]].map((v) => { const l = Math.hypot(...v); return v.map((c) => c / l); });
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const norm = (a) => { const l = Math.hypot(...a) || 1; return a.map((c) => c / l); };
  const R_FORA = 0.43, R_DENTRO = 0.19;            // raio (em radianos) das pontas e dos "vales" da estrela
  for (let i = 0; i < n; i += 3) {
    const c = norm([0, 1, 2].reduce((acc, k) => [acc[0] + P.getX(i + k), acc[1] + P.getY(i + k), acc[2] + P.getZ(i + k)], [0, 0, 0]));
    let v = V[0], best = -2;
    for (const w of V) { const d = dot(c, w); if (d > best) { best = d; v = w; } }
    const theta = Math.acos(Math.min(1, best));
    const a = norm(cross(v, Math.abs(v[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0])), b = cross(v, a);
    const ang = Math.atan2(dot(c, b), dot(c, a));
    const raio = R_DENTRO + (R_FORA - R_DENTRO) * Math.pow(Math.abs(Math.cos(ang * 2.5)), 1.6);
    const tom = theta < raio ? 0.07 : 0.9 + Math.random() * 0.08;
    for (let k = 0; k < 3; k++) colors.set([tom, tom, tom], (i + k) * 3);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return geo;
})();
const BALL_MAT = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
const BALL_SHADOW_GEO = new THREE.CircleGeometry(CONFIG.BALL_R * 1.3, 8);
const BALL_SHADOW_MAT = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35, depthWrite: false });
function makeBallMesh() {
  const m = new THREE.Mesh(BALL_GEO, BALL_MAT); scene.add(m);
  const s = new THREE.Mesh(BALL_SHADOW_GEO, BALL_SHADOW_MAT); s.rotation.x = -Math.PI / 2; scene.add(s);
  return { m, s };
}
{ const bm = makeBallMesh(); ball.mesh = bm.m; ball.shadow = bm.s; }
const ballSpeed = () => Math.hypot(ball.vx, ball.vz);

// Bolas reservas: uma em cima do suporte ao lado de cada gol. No tiro de meta o goleiro pega
// a reserva (ela some do suporte) e, depois da cobrança, aparece outra aos poucos (3 s).
// A bola que saiu fica lá fora e some devagar.
const RESERVA_FADE = 3;
const spares = [-1, 1].map((side) => {
  const m = new THREE.Mesh(BALL_GEO, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true, transparent: true }));
  m.position.set(side * (HALF_L + 1.6), 0.5 + CONFIG.BALL_R, GOAL_HALF + 2.5);
  scene.add(m);
  return { side, mesh: m, present: true, fade: 1 };
});
const spareOf = (side) => spares[side > 0 ? 1 : 0];
// (4.1.3) Bolas reservas das LATERAIS: 2 cones em cada lateral (do lado de fora, longe do banco e da
// linha do bandeirinha), cada um com uma bola em cima. Se a bola saiu longe (ou do estádio), quem
// cobra o lateral pega a do cone mais perto. Depois da cobrança aparece outra no cone (3 s).
const conesBola = [];
for (let i = 0; i < 4; i++) {
  const m = new THREE.Mesh(BALL_GEO, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true, transparent: true }));
  scene.add(m);
  conesBola.push({ mesh: m, x: 0, z: 0, zs: i < 2 ? -1 : 1, present: true, fade: 1 });
}
function montarCones() {
  const L = new Lote();
  conesBola.forEach((c, i) => {
    c.x = (i % 2 ? 1 : -1) * HALF_L * 0.42; c.z = c.zs * (HALF_W + 2.6);
    c.present = true; c.fade = 1;
    L.caixa(0.42, 0.06, 0.42, 0xf26a1b, c.x, 0.03, c.z);         // base
    L.caixa(0.26, 0.22, 0.26, 0xf26a1b, c.x, 0.17, c.z);
    L.caixa(0.18, 0.12, 0.18, 0xf2f2ee, c.x, 0.34, c.z);         // faixa branca
    L.caixa(0.12, 0.08, 0.12, 0xf26a1b, c.x, 0.44, c.z);
    c.mesh.position.set(c.x, 0.48 + CONFIG.BALL_R, c.z);
  });
  const m = L.malha(MAT_CORES); ESTADIO.add(m); freeze(m);
}
const lostBall = (() => {
  const m = new THREE.Mesh(BALL_GEO, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true, transparent: true }));
  m.visible = false; scene.add(m);
  return { mesh: m, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, life: 0 };
})();
function updateSpares(dt) {
  for (const sp of spares.concat(conesBola)) {
    if (sp.present && sp.fade < 1) sp.fade = Math.min(1, sp.fade + dt / RESERVA_FADE);
    sp.mesh.visible = sp.present;
    sp.mesh.material.opacity = sp.fade;
  }
  const L = lostBall;
  if (L.life > 0) {                               // bola que saiu: rola um pouco e some
    L.life -= dt;
    L.vy -= CONFIG.GRAVITY * dt;
    L.x += L.vx * dt; L.y += L.vy * dt; L.z += L.vz * dt;
    if (L.y < CONFIG.BALL_R) { L.y = CONFIG.BALL_R; L.vy = Math.abs(L.vy) > 1 ? -L.vy * 0.45 : 0; }
    if (Math.abs(L.x) > BOARD_X - 0.3 && L.y < 1) L.vx *= -0.3;
    const f = Math.max(0, 1 - 1.5 * dt); L.vx *= f; L.vz *= f;
    L.mesh.position.set(L.x, L.y, L.z);
    L.mesh.material.opacity = Math.min(1, L.life / 1.2);
  }
  L.mesh.visible = L.life > 0;
}

// ---------------------------------------------------------------------
// 7. ESTADO DO JOGO
//   'menu' 'play' 'aim' 'power' 'spin' 'dribble' 'trap' 'restart' (cena de bola parada)
//   'goal' 'paused' 'end'
// ---------------------------------------------------------------------
const PLAY_STATES = ['play', 'aim', 'power', 'spin', 'dribble', 'trap', 'restart', 'foul'];
const G = {
  state: 'menu',
  timeScale: 1, targetScale: 1,
  clock: CONFIG.MATCH_SECONDS,
  score: [0, 0],
  possession: null, lastTouch: null,
  userRequest: 0,
  goalTimer: 0, lastConceded: 0, fading: false,
  time: 0,
  kick: null, timing: null, cine: null, sp: null,     // sp = bola parada (lateral, escanteio, tiro de meta)
  focus: null,                                    // ponto que os times usam para se posicionar (bola ou local da cobrança)
  kickoffPending: null,                           // saída de bola esperando o primeiro toque
  dribbleWin: 0, dribbleOpp: null,                // janela em que dá para driblar (e contra quem)
  shotCine: null, celebT: 0,                      // cena do chute no ângulo / tempo de comemoração
  recv: null, recvFx: null, recvIgnore: 0,        // recepção: minigame do martelo e o efeito na bola
  offside: null, offLine: [HALF_L, HALF_L],       // impedimento: quem estava impedido no último passe / linhas
  foul: null,                                     // falta ou impedimento marcado (paralisação)
  passTarget: null,                               // quem vai receber o passe
  roleT: 0,
  chasers: [null, null], pressers: [null, null], covers: [null, null], support: [[], []],
  stats: null, mode: '', pausedFrom: null,
};
function resetStats() {
  G.stats = { gols: 0, chutes: 0, noAlvo: 0, passes: 0, passesOk: 0, dribles: 0, driblesOk: 0, dominios: 0, dominiosOk: 0, desarmes: 0, perdas: 0, faltas: 0, faltasSofridas: 0, impedimentos: 0, cartoes: '' };
}
resetStats();

// ---------------------------------------------------------------------
// 8. IA
// ---------------------------------------------------------------------
function seek(p, tx, tz, maxSpeed) {
  const dx = tx - p.x, dz = tz - p.z, d = Math.hypot(dx, dz);
  if (d < 0.15) return { vx: 0, vz: 0 };
  const s = Math.min(maxSpeed, d * 2.5);
  return { vx: dx / d * s, vz: dz / d * s };
}

// ---------------------------------------------------------------------
// DISPUTA DE CORPO (v16). Dois casos:
//   1) quem está com a bola corre e um adversário chega LADO A LADO (nem na frente, nem atrás);
//   2) bola solta: o mais perto de cada time corre para ela e os dois estão colados.
// Os dois ganham disputaAlvo; a animação (syncMeshes) põe o braço do lado do outro "protegendo".
// disputaLado: −1 = o outro está à esquerda, +1 = à direita (lado direito = (−sen a, cos a)).
// ---------------------------------------------------------------------
// Jeitos de proteger com o braço: ombro (ox = abre, oz = à frente) e cotovelo (cx = para fora,
// cz = antebraço à frente). 0 antebraço à frente · 1 braço esticado baixo (barreira) ·
// 2 cotovelo alto, ombro com ombro · 3 mão nas costas do adversário.
const DISPUTA_POSES = [
  { ox: 0.75, oz: 0.4, cx: 0, cz: 1.25 },
  { ox: 0.55, oz: 0.12, cx: 0, cz: 0.3 },
  { ox: 1.05, oz: 0.55, cx: 0.15, cz: 1.6 },
  { ox: 0.9, oz: -0.15, cx: 0.4, cz: 0.6 },
];
function ladoALado(p, o, dMax) {
  const rx = o.x - p.x, rz = o.z - p.z, d = Math.hypot(rx, rz);
  if (d > dMax || d < 0.05) return null;
  const fx = Math.cos(p.angle), fz = Math.sin(p.angle);
  const frente = rx * fx + rz * fz, lat = rx * -fz + rz * fx;
  if (Math.abs(frente) > 1.1 || Math.abs(lat) < 0.3) return null;
  return lat;
}
function atualizarDisputas(dt) {
  for (const p of players) p.disputaAlvo = null;
  const vivo = G.state === 'play' && !G.sp && !G.kickoffPending && !G.cine;
  if (vivo) {
    const h = G.possession;
    const pode = (p) => !p.out && p.stun <= 0 && p.role !== 'GK' && !p.scripted && !(p.slideT > 0);
    if (h && pode(h) && !h.carry && !h.throwIn && !h.setPiece && Math.hypot(h.vx, h.vz) > 2.5) {
      let best = null, bd = Infinity;
      for (const o of TEAMS[1 - h.team]) {
        if (!pode(o)) continue;
        const lat = ladoALado(h, o, 1.7);
        if (lat !== null && Math.abs(lat) < bd) { bd = Math.abs(lat); best = o; }
      }
      if (best) { h.disputaAlvo = best; best.disputaAlvo = h; }
    } else if (!h && ball.y < 1.3) {
      // Bola solta: o mais perto da bola de cada time, os dois correndo para ela e colados.
      const perto = [0, 1].map((t) => {
        let b = null, bd = 5;
        for (const p of TEAMS[t]) { if (!pode(p)) continue; const d = dist2D(p, ball); if (d < bd) { bd = d; b = p; } }
        return b;
      });
      const [a, b] = perto;
      const indo = (p) => { const sp = Math.hypot(p.vx, p.vz); if (sp < 2.5) return false; const dx = ball.x - p.x, dz = ball.z - p.z, d = Math.hypot(dx, dz) || 1; return (p.vx * dx + p.vz * dz) / (sp * d) > 0.5; };
      if (a && b && dist2D(a, b) < 1.8 && indo(a) && indo(b)) { a.disputaAlvo = b; b.disputaAlvo = a; }
    }
  }
  for (const p of players) {
    const o = p.disputaAlvo;
    if (o) {
      const lat = (o.x - p.x) * -Math.sin(p.angle) + (o.z - p.z) * Math.cos(p.angle);
      if (!p.disputaLado || Math.abs(lat) > 0.2) p.disputaLado = lat >= 0 ? 1 : -1;   // não fica trocando de braço
    }
    if (o && ((p.disputaK || 0) < 0.05 || (p.disputaTrocaT = (p.disputaTrocaT || 0) - dt) <= 0)) {
      p.disputaVar = Math.floor(Math.random() * DISPUTA_POSES.length); p.disputaTrocaT = rand(0.8, 1.6);   // outro jeito de proteger
    }
    p.disputaK = clamp((p.disputaK || 0) + (o ? dt * 5 : -dt * 4), 0, 1);
  }
}

// ---------------------------------------------------------------------
// ONDE DÁ PARA PEGAR A BOLA (v16). Simula o resto do voo dela com a MESMA física do jogo
// (gravidade, efeito que faz a curva, quique, atrito do gramado) em passos de 0,05 s e devolve o
// primeiro ponto em que ESTE jogador, na velocidade dele, chega antes da bola. Se ele não chega
// em nenhum, devolve o ponto em que ele chega "menos atrasado" — ele vai, mas pode não dar tempo.
// (Antes a IA corria para onde o passe ERA para ir; com efeito a bola curvava e ele ficava esperando.)
// ---------------------------------------------------------------------
function pontoDeEncontro(p, vel, tMax = 3) {
  const R = CONFIG.BALL_R, h = 0.05, reacao = 0.15;
  let x = ball.x, y = ball.y, z = ball.z, vx = ball.vx, vy = ball.vy, vz = ball.vz, ss = ball.spinSide, sv = ball.spinVert;
  let melhor = null, folgaMelhor = -Infinity;
  for (let t = h; t <= tMax + 1e-6; t += h) {
    const hs = Math.hypot(vx, vz);
    if (hs > 0.5) { const ax = (vz / hs) * ss * CONFIG.CURVE, az = (-vx / hs) * ss * CONFIG.CURVE; vx += ax * h; vz += az * h; }
    const ar = y > R + 0.02;
    vy += (-CONFIG.GRAVITY + (ar ? sv * CONFIG.LIFT : 0)) * h;
    if (ar) { vx *= 1 - 0.06 * h; vz *= 1 - 0.06 * h; }
    x += vx * h; y += vy * h; z += vz * h;
    if (y < R) { y = R; if (vy < -1.2) { vy = -vy * 0.5; vx *= 0.88; vz *= 0.88; ss *= 0.6; sv *= 0.5; } else vy = 0; }
    if (y <= R + 0.001 && vy === 0) {
      const s2 = Math.hypot(vx, vz);
      if (s2 < 0.15) { vx = vz = 0; } else { const ns = Math.max(0, s2 - (0.45 * s2 + 1.2) * ATRITO * h); vx *= ns / s2; vz *= ns / s2; }
      ss *= Math.max(0, 1 - 3 * h); sv = 0;
    }
    ss *= Math.exp(-0.35 * h);
    if (Math.abs(x) > HALF_L + 1 || Math.abs(z) > HALF_W + 1) break;   // saiu do campo: não adianta prever mais
    if (y > 2.3) continue;                        // alta demais para alcançar (passa por cima)
    const d = Math.max(0, Math.hypot(x - p.x, z - p.z) - 0.5);
    const folga = vel * Math.max(0, t - reacao) - d;
    if (folga >= 0) return { x, z, t };
    if (folga > folgaMelhor) { folgaMelhor = folga; melhor = { x, z, t }; }
    if (vx === 0 && vz === 0 && y <= R + 0.001) break;   // parou
  }
  return melhor || { x, z, t: tMax };
}

// Papéis recalculados a cada 0,3 s (e não todo quadro): dá um "tempo de reação" mais humano
// e também economiza processamento.
function updateRoles(dt) {
  G.roleT -= dt;
  if (G.roleT > 0) return;
  G.roleT = 0.3;
  const holder = G.possession;
  for (let t = 0; t < 2; t++) {
    let a = null, ad = Infinity, b = null, bd = Infinity;
    const target = holder || ball;
    for (const p of TEAMS[t]) {
      if (p.role === 'GK' || p.isUser || p.stun > 0 || p.scripted) continue;
      if (G.passTarget && G.passTarget.p === p) continue;   // já está indo receber o passe
      const d = dist2D(p, target) * (0.85 + (p.id % 3) * 0.1); // cada um "enxerga" a distância um pouco diferente
      if (d < ad) { b = a; bd = ad; a = p; ad = d; } else if (d < bd) { b = p; bd = d; }
    }
    const oppHas = holder && holder.team !== t && (holder.role !== 'GK' || holder.comPe);   // goleiro com a bola no pé também é pressionado
    const live = (G.state === 'play' || KICK_STATES.includes(G.state)) && !G.sp && !G.kickoffPending;  // na mira o marcador continua vindo
    const recebendo = G.passTarget && G.passTarget.p.team === t;  // o recebedor já vai na bola
    G.chasers[t] = live && !holder && !recebendo ? a : null;
    G.pressers[t] = live && oppHas ? a : null;
    G.covers[t] = live && oppHas ? b : null;
    // (4.1.3) Quem dá o bote é quem está NA FRENTE do atacante (entre ele e o gol), se estiver
    // perto. Antes era só o mais perto — muitas vezes alguém correndo ATRÁS dele (que não pode dar
    // bote por trás), e o lateral/zagueiro da frente só recuava: o atacante chegava na cara do gol.
    // Quem vinha atrás continua perseguindo como cobertura.
    if (live && oppHas) {
      const ownGx = (t === 0 ? -1 : 1) * HALF_L;
      const gx = ownGx - holder.x, gz = -holder.z, gl = Math.hypot(gx, gz) || 1;
      const naFrente = TEAMS[t].filter((p) => p.role !== 'GK' && !p.isUser && p.stun <= 0 && !p.scripted && !p.out
        && ((p.x - holder.x) * gx + (p.z - holder.z) * gz) / (gl * (dist2D(p, holder) || 1)) > 0.35 && dist2D(p, holder) < 18 * ESC)
        .sort((x, y) => dist2D(x, holder) - dist2D(y, holder));
      if (naFrente.length && naFrente[0] !== G.pressers[t]) {
        const atras = G.pressers[t];
        G.pressers[t] = naFrente[0];
        G.covers[t] = atras && atras !== naFrente[0] ? atras : (naFrente[1] || b);
      }
    }
    // Apoio: os 2 companheiros mais perto de quem está com a bola se oferecem para o passe (triângulos).
    G.support[t] = [];
    if (live && holder && holder.team === t) {
      const rel = holder.x * holder.dir;
      const near = TEAMS[t].filter((p) => p !== holder && p.role !== 'GK' && !p.isUser && p.stun <= 0
        && !(campoGrande() && ((p.funcao === 'zagueiro' && rel > -16 * ESC) || (p.funcao === 'volante' && rel > 22 * ESC))))   // 11 x 11: zagueiro não sobe para apoiar
        .sort((x, y) => dist2D(x, holder) - dist2D(y, holder));
      G.support[t] = near.slice(0, 2);
    }
  }
}

// "Desvio" de cada jogador: muda de alvo a cada poucos segundos. É o que tira a cara de formação engessada.
function updateDrift(p, dt, attacking) {
  const d = p.drift;
  d.t -= dt;
  if (d.t <= 0) {
    d.t = rand(2, 4.5);
    d.tx = rand(-4, 4); d.tz = rand(-5, 5);
    if (attacking && p.role === 'MID' && Math.random() < (taticaDe(p.team).corridas ?? 0.3)) p.runT = rand(2, 4); // infiltração (depende da tática)
    // Campo grande: atacantes e pontas fazem corridas mais vezes (a bola chega lá na frente).
    if (attacking && campoGrande() && (p.funcao === 'centroavante' || p.funcao === 'ponta') && Math.random() < 0.3 + (taticaDe(p.team).corridas ?? 0.3) * 0.5) p.runT = rand(1.5, 3);
    if (campoGrande() && (p.funcao === 'zagueiro' || p.funcao === 'volante')) p.runT = 0;
    if (attacking && Math.random() < 0.08) p.semLinhaT = rand(1.5, 3);               // distração: pode ficar impedido
  }
  if (campoGrande()) { d.tz = clamp(d.tz, -3, 3); if (p.funcao === 'zagueiro') d.tx = clamp(d.tx, -3, 1); }   // no 11 x 11 menos "passeio"
  const k = Math.min(1, dt * 0.8);
  d.x += (d.tx - d.x) * k; d.z += (d.tz - d.z) * k;
  if (p.runT > 0) p.runT -= dt;
  if (p.semLinhaT > 0) p.semLinhaT -= dt;
}

// Posição tática. Tudo é calculado "no sentido do ataque" do time (rel = x × dir):
//   ATAQUE (time com a bola): todos sobem, bem abertos, para ter opção de passe.
//   DEFESA (adversário com a bola): bloco recua para trás da bola, mais fechado no meio.
//   O atacante (FWD) não recua: fica lá na frente esperando o contra-ataque.
function formationTarget(p, attacking) {
  // As contas são feitas no campo de REFERÊNCIA (96 × 62) e depois escalam para o campo da
  // partida (ESC/ESC_W). A tática do time (TATICAS) empurra o bloco, abre/fecha e muda o 9.
  const F = G.focus || ball, TT = taticaDe(p.team);
  const bRel = F.x * p.dir / ESC, bz = F.z * p.dir / ESC_W;
  const bx0 = p.base.x / ESC, bz0 = p.base.z / ESC_W;
  const phase = attacking ? 'ataque' : (G.possession || G.sp ? 'defesa' : 'neutro');
  const wide = Math.abs(bz0) > 5;
  const larg = TT.largura || 1, bloco = TT.bloco || 0;
  let rx, rz;
  if (campoGrande() && p.funcao) {
    ({ rx, rz } = posicaoCampoGrande(p, phase, bRel, bz, bz0, TT));
  } else if (p.role === 'DEF') {
    rx = phase === 'ataque' ? clamp(bRel - 18, -36, TT.zagaFica ? -4 : 6) : phase === 'defesa' ? clamp(bRel - 9, -40, -10) : clamp(bRel - 13, -38, 0);
    rz = bz0 * (phase === 'ataque' ? 1.15 : 0.75) * larg + bz * 0.3;
  } else if (p.role === 'MID') {
    rx = phase === 'ataque' ? clamp(bRel + (wide ? 6 : -1), -20, 48 - 12)
      : phase === 'defesa' ? clamp(bRel - (wide ? 3 : 6), -34, 12) : clamp(bRel - 2, -28, 20);
    if (bx0 > -14 && TT.falso9 && phase === 'ataque') rx += 4;      // falso 9: os meias pisam na área no lugar dele
    rz = bz0 * (phase === 'ataque' ? 1.25 : 0.65) * larg + bz * (phase === 'ataque' ? 0.2 : 0.45);
  } else {
    rx = phase === 'ataque' ? clamp(bRel + 14, 0, 48 - 9) : clamp(bRel + 16, -2, 18);
    if (TT.falso9 && phase === 'ataque') rx = clamp(bRel + 2, -6, 48 - 18);   // falso 9: recua para receber (pivô)
    if (TT.contra && phase !== 'ataque') rx = Math.max(rx, 6);           // contra-ataque: o 9 fica lá na frente esperando
    if (TT.cruzar && phase === 'ataque') rx = clamp(bRel + 16, 0, 48 - 6); // bola aérea: o 9 vive dentro da área
    rz = bz * 0.4 + bz0 * 0.6;
  }
  rx += bloco * (phase === 'ataque' ? 0.5 : 1);
  rx += p.drift.x * 0.6 + (p.runT > 0 && !(campoGrande() && p.funcao) ? 8 : 0);
  rz += p.drift.z * 0.6;
  rx *= ESC; rz *= ESC_W;
  // Atacando: fica na linha do penúltimo defensor (de vez em quando um se distrai e passa dela).
  if (attacking && !(p.semLinhaT > 0) && PARTIDA.regras.impedimento) rx = Math.min(rx, limiteLegal(p.team) - 0.6);
  rx = clamp(rx, -HALF_L + 4 * ESC, HALF_L - 5 * ESC);
  rz = clamp(rz, -HALF_W + 2, HALF_W - 2);
  return { x: rx * p.dir, z: rz * p.dir };
}

// ---------------------------------------------------------------------
// CAMPO GRANDE (11 x 11) — 4.1.2. No 7 x 7 todo mundo sobe e desce junto (o campo é curto). No
// 11 x 11 isso ficava estranho: zagueiro parado no meio-campo no ataque, atacante voltando, todo
// mundo embolado. Aqui cada um tem uma FUNÇÃO (montarFormacao) e uma faixa do campo:
//   zagueiro ..... no ataque fica no próprio campo (até ~6 m antes do meio); só sai se a bola
//                  estiver lá atrás. Na defesa, linha baixa na frente da área.
//   lateral ...... sobe pelo lado (apoia e cruza), volta para a linha de 4 na defesa
//   volante ...... protege a zaga, nunca passa muito do meio
//   meia ......... acompanha a jogada um pouco atrás da bola e chega para receber
//   aberto/ponta . colado na lateral, adiantado; leva até o fundo para cruzar
//   centroavante . sempre na frente, na linha do último defensor; faz corridas para receber
// (valores no campo de referência 96 × 62, como o resto de formationTarget)
// ---------------------------------------------------------------------
const campoGrande = () => !!PARTIDA && PARTIDA.campo.jogadores >= 9;
function posicaoCampoGrande(p, phase, bRel, bz, bz0, TT) {
  const f = p.funcao, lado = Math.sign(bz0) || (p.id % 2 ? 1 : -1), larg = TT.largura || 1;
  const at = phase === 'ataque', df = phase === 'defesa';
  let rx, rz;
  switch (f) {
    case 'zagueiro':
      rx = at ? clamp(bRel - 30, -38, TT.zagaFica ? -12 : -6) : df ? clamp(bRel - 10, -42, -16) : clamp(bRel - 18, -40, -10);
      rz = bz0 * (at ? 1.1 : 0.8) + bz * 0.18;
      break;
    case 'lateral':
      rx = at ? clamp(bRel - 9, -34, TT.zagaFica ? 4 : 24) : df ? clamp(bRel - 9, -42, -10) : clamp(bRel - 14, -38, 0);
      rz = at ? lado * 26 * larg : bz0 * 0.85 + bz * 0.22;
      break;
    case 'volante':
      rx = at ? clamp(bRel - 14, -26, 8) : df ? clamp(bRel - 7, -34, -4) : clamp(bRel - 10, -30, 2);
      rz = bz0 * 0.8 + bz * 0.35;
      break;
    case 'meia':
      rx = at ? clamp(bRel - 3, -16, 32) : df ? clamp(bRel - 5, -30, 8) : clamp(bRel - 3, -24, 18);
      rz = bz0 * (at ? 1.2 : 0.7) * larg + bz * 0.3;
      break;
    case 'aberto':
      rx = at ? clamp(bRel + 4, -10, 38) : df ? clamp(bRel - 4, -30, 6) : clamp(bRel, -22, 20);
      rz = at ? lado * 24 * larg : bz0 * 0.8 + bz * 0.3;
      break;
    case 'ponta':
      rx = at ? clamp(bRel + 10, 0, 42) : clamp(bRel + 8, -8, 14);
      rz = at ? lado * 23 * larg : bz0 * 0.9;
      break;
    default:                                       // centroavante
      rx = at ? clamp(bRel + 16, 6, 42) : clamp(bRel + 14, -2, 16);
      if (TT.falso9 && at) rx = clamp(bRel + 2, -4, 30);
      if (TT.contra && !at) rx = Math.max(rx, 8);
      rz = bz * 0.3 + bz0 * 0.5;
  }
  // Ala chegando no fundo para cruzar: o 9, o meia e o ponta do outro lado ATACAM a área.
  const h = G.possession;
  if (at && h && h !== p && h.team === p.team && alaComBola(h) && Math.abs(h.dir * HALF_L - h.x) / ESC < 36) {
    const ladoBola = Math.sign(h.z * p.dir) || 1;
    if (f === 'centroavante') { rx = 41; rz = -ladoBola * 2; }
    else if ((f === 'ponta' || f === 'aberto') && Math.sign(bz0) !== ladoBola) { rx = 39; rz = -ladoBola * 7; }
    else if (f === 'meia') { rx = 33; rz = bz0 * 0.4; }
    return { rx, rz };
  }
  // Corrida para receber (infiltração): passa da linha do meio-campo/zaga adversária.
  if (p.runT > 0 && at) {
    rx += f === 'meia' ? 12 : 9;
    if (f === 'ponta' || f === 'aberto') rz *= 0.55;     // ponta corta para dentro na diagonal
    if (f === 'centroavante') rz = -Math.sign(bz || 1) * 7;   // o 9 sai para o lado contrário da bola
  }
  return { rx, rz };
}

// Apoio: um se oferece na diagonal à frente de quem conduz, o outro na diagonal de trás (para tocar e sair).
function supportTarget(p, holder, idx) {
  const side = Math.sign(p.z - holder.z) || (p.base.z >= 0 ? 1 : -1);
  const ap = (taticaDe(p.team).apoio || 1);         // tiki-taka: apoio mais perto; retranca: mais longe
  const ax = (idx === 0 ? 8 : -5) * ap * ESC, az = (idx === 0 ? 9 : 7) * ap * ESC_W;
  const relMax = limiteLegal(p.team) - 0.6;          // sem passar da linha do impedimento
  return {
    x: clamp(Math.min((holder.x + p.dir * ax) * p.dir, relMax) * p.dir, -HALF_L + 3, HALF_L - 4),
    z: clamp(holder.z + side * az, -HALF_W + 2, HALF_W - 2),
  };
}

// Sentado ou deitado depois de tomar gol: não anda.
const lamentandoNoChao = (p) => (p.lamento === 'sentado' || p.lamento === 'deitado') && p.lamentoAtraso <= 0 && (G.state === 'goal' || G.state === 'celebrate');

function aiThink(p, dt) {
  const holder = G.possession;
  if (lamentandoNoChao(p)) return { vx: 0, vz: 0 };
  if (G.state === 'celebrate') {
    // Companheiros correm para abraçar quem fez o gol; adversários voltam devagar.
    if (p.team === 0 && G.celebAuto) {
      // (4.1.2) Comemoração especial com câmera própria: os companheiros chegam pelos LADOS (em
      // relação à câmera), sem ficar na frente do lance.
      const c = cameraCelebAuto(), dx = c.px - user.x, dz = c.pz - user.z, l = Math.hypot(dx, dz) || 1;
      const i = TEAMS[0].filter((q) => !q.isUser && q.role !== 'GK').indexOf(p), lado = i % 2 ? 1 : -1, dist = 3.0 + Math.floor(i / 2) * 1.1;
      const tx = clamp(user.x + (-dz / l) * lado * dist - dx / l * 0.6, -BOARD_X + 0.8, BOARD_X - 0.8), tz = clamp(user.z + (dx / l) * lado * dist - dz / l * 0.6, -BOARD_ZN + 0.8, BOARD_Z - 0.8);
      return seek(p, tx, tz, p.role === 'GK' ? 0 : CONFIG.AI_SPEED);
    }
    if (p.team === 0) { const a = p.id * 1.3; return seek(p, user.x + Math.cos(a) * 1.6, user.z + Math.sin(a) * 1.6, G.celebT < 8.5 ? CONFIG.AI_SPEED : 0); }
    const t = formationTarget(p, false);
    return seek(p, t.x, t.z, CONFIG.AI_SPEED * 0.35);
  }
  if (G.state === 'foul') { const t = formationTarget(p, G.foul && p.team === G.foul.team); return seek(p, t.x, t.z, CONFIG.AI_SPEED * 0.45); }
  if (G.desarmeLimpo && G.desarmeLimpo.p === p) return seek(p, user.x, user.z, CONFIG.AI_SPEED * 1.1);
  if (G.state === 'goal' && G.golAutor) {
    const a = G.golAutor;
    if (p.team === a.team && G.goalT > 0.6 && p.role !== 'GK') { const ang = p.id * 1.3; return seek(p, a.x + Math.cos(ang) * 1.8, a.z + Math.sin(ang) * 1.8, CONFIG.AI_SPEED); }
    const t = formationTarget(p, false);
    return seek(p, t.x, t.z, CONFIG.AI_SPEED * 0.3);
  }
  if (holder === p) return aiCarry(p, dt);
  // Passe vindo para ele: corre até onde a bola vai chegar (ou até a bola, se ela já estiver perto).
  const PT = G.passTarget;
  if (PT && PT.p === p && !holder) {
    // v16: vai ao encontro da bola de verdade (com a curva do efeito), não ao ponto planejado.
    const vel = CONFIG.AI_SPEED * 1.05 * p.speedMul;
    const alvo = ballSpeed() > 1 ? pontoDeEncontro(p, vel) : ball;
    return seek(p, alvo.x, alvo.z, vel);
  }
  if (G.kickoffPending) return seek(p, p.kx, p.kz, CONFIG.AI_SPEED);   // parados até a saída de bola
  if (G.sp) { const t = restartTarget(p); return seek(p, t.x, t.z, CONFIG.AI_SPEED * 0.9 * p.speedMul); }
  const myTeamHas = holder && holder.team === p.team;
  updateDrift(p, dt, myTeamHas);
  const si = myTeamHas ? G.support[p.team].indexOf(p) : -1;
  if (si >= 0) { const t = supportTarget(p, holder, si); return seek(p, t.x, t.z, CONFIG.AI_SPEED * 0.9 * p.speedMul); }
  if (!holder && G.chasers[p.team] === p) {
    const vel = CONFIG.AI_SPEED * p.speedMul;
    const alvo = ballSpeed() > 1 ? pontoDeEncontro(p, vel) : ball;
    return seek(p, alvo.x, alvo.z, vel);
  }
  const oppHolds = holder && holder.team !== p.team;
  // (4.0.0) SÓ RESTARAM OS ZAGUEIROS (todo mundo do time que está entre o atacante e o gol é
  // zagueiro) e o atacante ainda está FORA da área: o mais perto dele SOBE para dar o bote e o
  // outro fica na cobertura, uns 7 m atrás, entre o atacante e o gol. Antes os dois recuavam
  // juntos até dentro da área.
  if (oppHolds && p.role === 'DEF' && holder.role !== 'GK') {
    const D = duplaDeZaga(p.team, holder);
    if (D) {
      if (D.sobe === p) {
        tryTackle(p, holder, dt);
        return seek(p, holder.x + holder.vx * 0.3, holder.z + holder.vz * 0.3, CONFIG.AI_SPEED * p.speedMul);
      }
      if (D.cobre === p) {
        const ownGx = -p.dir * HALF_L;
        let gx = ownGx - holder.x, gz = -holder.z; const gl = Math.hypot(gx, gz) || 1;
        const dist = Math.min(7, gl - BOX.depth * 0.5);
        return seek(p, holder.x + gx / gl * dist, holder.z + gz / gl * dist * 0.8, CONFIG.AI_SPEED * 0.95 * p.speedMul);
      }
    }
  }
  if (oppHolds && G.pressers[p.team] === p) {
    // Contenção: fica entre o atacante e o gol, a ~1,9 m, e de vez em quando dá o bote.
    p.commitT -= dt;
    if (p.commitT <= 0) { p.commitT = rand(1.2, 2.8); p.committing = Math.random() < 0.55 ? 0.7 : 0; }
    if (holder === user && KICK_STATES.includes(G.state)) p.committing = 0.5;   // você parou para chutar: ele vem no bote
    // (4.1.1) Você vindo para cima dele devagar (sem driblar, sem arrancar): ele NÃO recua mais —
    // fica e dá o bote. Antes ele ia andando de costas e você passava sem perder a bola.
    if (holder === user && !(user.boost > 0)) {
      const d = dist2D(p, holder), vu = Math.hypot(holder.vx, holder.vz);
      const vindo = vu > 0.3 && ((p.x - holder.x) * holder.vx + (p.z - holder.z) * holder.vz) / (d * vu || 1) > 0.5;
      if (d < 2.6 && (vu < 4.2 || vindo)) p.committing = Math.max(p.committing, 0.4);
    }
    // (4.1.3) Atacante correndo para cima dele ou já perto do gol: não fica só recuando — fecha
    // e dá o bote (antes ele ia de costas até a área e o atacante chegava na cara do gol).
    {
      const d = dist2D(p, holder), dGol = Math.hypot(-p.dir * HALF_L - holder.x, holder.z);
      const perigo = dGol < 30 * ESC, vu = Math.hypot(holder.vx, holder.vz);
      if (!porTras(p, holder) && (d < (perigo ? 2.6 : 1.9) && (vu > 3 || perigo))) p.committing = Math.max(p.committing, perigo ? 0.6 : 0.35);
    }
    // Foi passado para trás (driblado)? Às vezes corre atrás para tentar o bote por trás (arriscado).
    // Só o ÚLTIMO HOMEM (ninguém do time dele entre o atacante e o gol) persegue por trás.
    if (porTras(p, holder) && dist2D(p, holder) < 2.6 && !(p.chaseT > 0) && !(p.chaseCd > 0) && ultimoHomem(p, holder)) {
      p.chaseCd = 3; p.chaseT = 1.4; p.tackleT = 0.35;
      p.chaseFalta = Math.random() < 0.1;          // ~10%: faz a falta para parar o lance
    }
    p.chaseCd = (p.chaseCd || 0) - dt;
    if (p.chaseT > 0) { p.chaseT -= dt; p.committing = Math.max(p.committing, 0.1); }
    if (p.committing > 0) {
      p.committing -= dt;
      tryTackle(p, holder, dt);
      return seek(p, holder.x + holder.vx * 0.25, holder.z + holder.vz * 0.25, CONFIG.AI_SPEED * p.speedMul);
    }
    // Recua de frente para a bola mais devagar do que o atacante avança: ele consegue progredir.
    const ownGx = -p.dir * HALF_L;
    let gx = ownGx - holder.x, gz = -holder.z * 0.6;
    const gl = Math.hypot(gx, gz) || 1;
    return seek(p, holder.x + gx / gl * 2.4, holder.z + gz / gl * 2.4, CONFIG.AI_SPEED * 0.72 * p.speedMul);
  }
  if (oppHolds && G.covers[p.team] === p) {
    const ownGx = -p.dir * HALF_L;
    return seek(p, lerp(ball.x, ownGx, 0.3), lerp(ball.z, 0, 0.3), CONFIG.AI_SPEED * 0.9 * p.speedMul);
  }
  const t = formationTarget(p, myTeamHas);
  // Bola longe: trota. Bola perto: anda mais rápido.
  const far = dist2D(p, ball) > 35 ? 0.6 : 0.85;
  return seek(p, t.x, t.z, CONFIG.AI_SPEED * far * p.speedMul);
}

function aiCarry(p, dt) {
  if (G.state !== 'play') return { vx: 0, vz: 0 };
  if (G.sp && G.sp.taker === p) return aiSetPiece(p, dt);   // lateral/escanteio: espera e escolhe
  if (p.chutePrep > 0) {                           // preparando o chute: planta o pé e mira o gol
    p.chutePrep -= dt;
    p.angle = turnToward(p.angle, Math.atan2(-p.z, p.dir * HALF_L - p.x), 8 * dt);
    if (p.chutePrep <= 0) { p.chutePrep = 0; aiShoot(p); }
    return { vx: 0, vz: 0 };
  }
  p.think -= dt;
  if (G.kickoffPending && G.kickoffPending.taker === p) {  // saída de bola: toque curto para o meia
    if (p.think <= 0) passTo(p, G.kickoffPending.partner, false, 'short');
    return { vx: 0, vz: 0 };
  }
  if (p.team === 0 && G.userRequest > 0 && p.think <= 0 && user.stun <= 0) {
    passTo(p, user, Math.random() < CONFIG.BROKEN_PASS_CHANCE);
    G.userRequest = 0;
    return { vx: 0, vz: 0 };
  }
  const goalX = p.dir * HALF_L;
  const dGoal = Math.hypot(goalX - p.x, p.z);
  const dG = dGoal / ESC;                            // distância "no campo de referência"
  const near = nearestOf(opponentsOf(p), p);
  const TT = taticaDe(p.team);
  // Travado (andando pouco)? Conta o tempo para forçar uma decisão.
  p.stuckT = Math.hypot(p.vx, p.vz) < 1.5 ? (p.stuckT || 0) + dt : 0;
  if (p.think <= 0 || p.stuckT > 1.2) {
    p.think = rand(0.35, 0.75) * (p.team === 1 ? PARTIDA.ajuste.reacao : 1);
    const shootChance = (dG < 20 ? 0.6 : dG < 26 ? 0.25 : dG < 30 ? 0.08 : 0) * (TT.chute || 1);   // de longe chuta bem menos
    if (Math.abs(p.z) < 22 * ESC_W && Math.random() < shootChance) {
      p.chutePrep = p.chutePrepDur = 0.3;          // prepara o chute (perna para trás) e só então bate
      return { vx: 0, vz: 0 };
    }
    // CONTRA-ATAQUE: acabou de recuperar a bola (até 3 s) → lançamento para quem está mais na frente.
    if (TT.contra && G.time - (G.recuperouEm || 0) < 3 && (p.x * p.dir) < 10 * ESC) {
      const alvo = teamOf(p).filter((t) => t !== p && t.role !== 'GK' && t.stun <= 0 && (t.x - p.x) * p.dir > 14 * ESC)
        .sort((a, b) => (b.x - a.x) * p.dir)[0];
      if (alvo) { passTo(p, alvo, false, 'lob'); return { vx: 0, vz: 0 }; }
    }
    // BOLA AÉREA: pelos lados e perto da área → cruza para quem estiver na área.
    if (TT.cruzar && Math.abs(p.z) > HALF_W * 0.4 && dG < 34 && Math.random() < TT.cruzar) {
      const naArea = teamOf(p).filter((t) => t !== p && t.role !== 'GK' && Math.abs(goalX - t.x) < BOX.depth && Math.abs(t.z) < BOX.half);
      if (naArea.length) { passTo(p, naArea[Math.floor(Math.random() * naArea.length)], false, 'cross'); return { vx: 0, vz: 0 }; }
    }
    // CAMPO GRANDE (4.1.2): lateral, ponta e meia aberto com a bola pelo lado, no terço final →
    // leva até perto da linha de fundo e cruza para quem chegou na área (centroavante, meias).
    if (campoGrande() && alaComBola(p)) {
      const fundo = Math.abs(goalX - p.x) / ESC;
      const naArea = teamOf(p).filter((t) => t !== p && t.role !== 'GK' && Math.abs(goalX - t.x) < BOX.depth + 10 && Math.abs(t.z) < BOX.half + 4);
      const cruza = naArea.length && (fundo < 12 ? 0.85 : fundo < 22 ? 0.5 : fundo < 30 ? 0.25 : 0) + (near.d < 2.2 ? 0.25 : 0);
      if (cruza && Math.random() < cruza) {
        const alvo = naArea.sort((a, b) => nearestOf(opponentsOf(p), b).d - nearestOf(opponentsOf(p), a).d)[0];
        passTo(p, alvo, false, 'cross'); return { vx: 0, vz: 0 };
      }
      if (fundo < 30 && near.d > 2.2) p.think = Math.max(p.think, 0.5);   // segue conduzindo (não toca para trás à toa)
      if (fundo < 30 && near.d > 2.2) return conduzirPeloLado(p, near);
    }
    // FALSO 9: o centroavante recebe de costas e toca de primeira para quem vem de trás.
    const pivo = TT.falso9 && p.role === 'FWD' && dG > 18;
    if ((near.d < 3.2 && Math.random() < (TT.pressao ?? 0.6)) || Math.random() < (TT.passe ?? 0.1) || p.stuckT > 1.2 || (pivo && Math.random() < 0.7)) {
      const r = bestPassReceiver(p) || (p.stuckT > 1.2 ? nearestOf(teamOf(p), p, p).p : null);
      p.stuckT = 0;
      if (r) { passTo(p, r, r.isUser && Math.random() < CONFIG.BROKEN_PASS_CHANCE * 0.5); return { vx: 0, vz: 0 }; }
    }
  }
  if (campoGrande() && alaComBola(p) && Math.abs(goalX - p.x) / ESC < 34) return conduzirPeloLado(p, near);
  let dx = p.dir, dz = clamp(-p.z * 0.04, -0.6, 0.6);
  if (near.p && near.d < 5) {
    const ox = near.p.x - p.x, oz = near.p.z - p.z;
    const ahead = (ox * p.dir) / near.d;            // marcador na frente?
    // Sai para o lado contrário do marcador (e para o meio quando estiver colado na lateral).
    const side = Math.abs(oz) > 0.3 ? -Math.sign(oz) : (p.z > 0 ? -1 : 1);
    dz += side * (ahead > 0.3 ? 1.3 : 0.6);
    dx -= ox / near.d * 0.3;
  }
  const m = Math.hypot(dx, dz) || 1;
  return { vx: dx / m * CONFIG.AI_SPEED_BALL * p.speedMul, vz: dz / m * CONFIG.AI_SPEED_BALL * p.speedMul };
}

// Ala com a bola: lateral/ponta/meia aberto, pelo lado (longe do meio), no campo de ataque.
function alaComBola(p) {
  return (p.funcao === 'lateral' || p.funcao === 'ponta' || p.funcao === 'aberto') && Math.abs(p.z) > HALF_W * 0.42 && p.x * p.dir > 0;
}
// Conduz pelo corredor (paralelo à lateral) até a linha de fundo; desvia de quem vier na frente.
function conduzirPeloLado(p, near) {
  const faixa = Math.sign(p.z) * HALF_W * 0.78;
  let dx = p.dir, dz = clamp((faixa - p.z) * 0.15, -0.5, 0.5);
  if (near.p && near.d < 4) { const oz = near.p.z - p.z; dz += (Math.abs(oz) > 0.3 ? -Math.sign(oz) : -Math.sign(p.z)) * 0.8; }
  const m = Math.hypot(dx, dz) || 1, v = CONFIG.AI_SPEED_BALL * p.speedMul * 1.05;
  return { vx: dx / m * v, vz: dz / m * v };
}

function bestPassReceiver(p) {
  let best = null, bs = -Infinity;
  const opps = opponentsOf(p);
  for (const t of teamOf(p)) {
    if (t === p || t.role === 'GK' || t.stun > 0) continue;
    const d = dist2D(p, t);
    if (d < 5 || d > 40) continue;
    let blocked = false;
    for (const o of opps) if (distPointSegment(o, p, t) < 1.2) { blocked = true; break; }
    if (blocked && d < 12) continue;               // perto e bloqueado: não dá nem por cima
    if (PARTIDA.regras.impedimento && t.x * p.dir > limiteLegal(p.team) + 0.2 && Math.random() < 0.85) continue;   // impedido: evita o passe
    const forward = (t.x - p.x) * p.dir;
    const open = nearestOf(opps, t).d;
    const isSupport = G.support[p.team].includes(t) ? 1.5 : 0;   // quem veio dar apoio é boa opção
    // Campo grande: quem está correndo para receber e os alas abertos lá na frente valem mais;
    // zagueiro lá atrás só se não tiver outro jeito.
    const grande = campoGrande() ? ((t.runT > 0 && forwardOk(t, p)) ? 3 : 0) + ((t.funcao === 'ponta' || t.funcao === 'aberto' || t.funcao === 'lateral') && t.x * t.dir > 10 * ESC && Math.abs(t.z) > HALF_W * 0.42 ? 2.2 : 0) - (t.funcao === 'zagueiro' && (p.x * p.dir) > -10 * ESC ? 3 : 0) : 0;
    // Linha bloqueada ainda vale (o passe vai por cima), mas pesa um pouco contra.
    const s = forward * 0.5 * (taticaDe(p.team).contra ? 1.6 : 1) + Math.min(open, 8) - Math.abs(d - (taticaDe(p.team).distIdeal || 16) * ESC) * 0.12 + isSupport + grande - (blocked ? 1.5 : 0) + rand(0, 1.5);
    if (s > bs) { bs = s; best = t; }
  }
  return best;
}
// (a distância de passe preferida vem da tática: tiki-taka curto, contra-ataque longo)
const forwardOk = (t, p) => (t.x - p.x) * p.dir > 2;

// style: undefined = passe normal, 'throw' = arremesso lateral, 'cross' = cruzamento alto
// Passe da IA. Estilos: (normal: decide sozinho entre rasteiro e pelo alto), 'throw' lateral,
// 'cross' cruzamento, 'short' toque curto, 'long' chutão.
// Passe "no espaço": a bola vai 2 a 4 m à frente do companheiro (na direção do ataque e de
// onde ele já está correndo), para ele ter que correr e pegar em movimento.
function passTo(from, to, broken, style) {
  let tx = to.x + to.vx * 0.6, tz = to.z + to.vz * 0.6;
  const d0 = dist2D(from, to);
  if (!style || style === 'long' || style === 'cross') {
    const lead = style === 'cross' ? 1 : clamp(d0 * 0.15, 2, 4);
    let lx = to.dir * 1 + to.vx * 0.15, lz = -to.z * 0.02 + to.vz * 0.15;
    const ll = Math.hypot(lx, lz) || 1;
    tx += lx / ll * lead; tz += lz / ll * lead;
    tx = clamp(tx, -HALF_L + 1, HALF_L - 1); tz = clamp(tz, -HALF_W + 1, HALF_W - 1);
  }
  let dx = tx - from.x, dz = tz - from.z;
  const d = Math.hypot(dx, dz) || 1;
  dx /= d; dz /= d;
  // Pelo alto quando a linha está bloqueada, quando é longe, ou às vezes nas distâncias médias.
  if (!style) {
    let blocked = false;
    for (const o of opponentsOf(from)) if (distPointSegment(o, from, { x: tx, z: tz }) < 1.3) { blocked = true; break; }
    if ((blocked && d > 10) || d > 26 || (d > 14 && Math.random() < 0.25)) style = 'lob';
  }
  let speed = clamp(6 + d * 0.62, 9, 24);
  let vy = 0.6;
  if (style === 'lob') {
    // Parábola que cai no ponto do passe: tempo de voo T, subida vy = g·T/2, velocidade = distância / T.
    const T = clamp(0.7 + d * 0.035, 1.0, 1.9);
    vy = CONFIG.GRAVITY * T / 2; speed = d / T;
  }
  if (style === 'throw') { speed = Math.min(CONFIG.THROW_MAX, 6 + d * 0.5); vy = 3 + d * 0.04; }
  if (style === 'cross') { speed = clamp(d * 0.6, 12, 22); vy = 7 + d * 0.04; }
  if (style === 'short') { speed = clamp(3 + d * 1.1, 5, 9); vy = 0.2; }        // toque curto (saída de bola)
  if (style === 'long') { speed = clamp(d * 0.55, 16, 26); vy = 7 + d * 0.05; }   // chutão do goleiro
  if (broken) {
    if (Math.random() < 0.5) { vy = rand(6, 8); speed *= 0.75; }
    else { speed *= 1.45; vy = rand(1.5, 3); }
    const err = rand(-0.12, 0.12), c = Math.cos(err), s = Math.sin(err);
    [dx, dz] = [dx * c - dz * s, dx * s + dz * c];
  }
  from.angle = Math.atan2(dz, dx);
  kickBall(from, dx * speed, vy, dz * speed, 0, 0, style === 'throw');
  ball.broken = broken;
  // O companheiro sabe que o passe é para ele e corre até o ponto onde a bola vai chegar.
  G.passTarget = { p: to, x: tx, z: tz, t: 4 };
}

function aiBolaAerea(p) {
  const gx = p.dir * HALF_L, dGol = Math.hypot(gx - p.x, p.z);
  const dOwn = Math.hypot(-gx - p.x, p.z);
  // Mesmas regras que as suas: cabeçada ao gol só dentro da área; voleio/bicicleta até ~5 m fora.
  const fundo = Math.abs(gx - p.x), lat = Math.abs(p.z);
  const naArea = fundo < BOX.depth && lat < BOX.half, pertoDaArea = fundo < BOX.depth + 5 && lat < BOX.half + 3;
  if (pertoDaArea) {
    const ang = Math.abs(wrapAngle(Math.atan2(-p.z, gx - p.x) - p.angle));   // de costas = ~π
    let tipo = ball.y > 1.55 ? 'cabeca' : 'voleio';
    if (ang > 2.1) tipo = ball.y > 1.15 && Math.random() < 0.5 ? 'bicicleta' : 'cabeca';
    if (tipo !== 'cabeca' || naArea) { aiFinalizaAereo(p, tipo); return; }
  }
  if (dOwn < 30 && ball.lastKicker && ball.lastKicker.team !== p.team) { aiCabeceia(p, null); return; }   // afasta
  if (ball.y < 1.75) { givePossession(p); return; }                                                        // peito
  aiCabeceia(p, bestPassReceiver(p) || nearestOf(teamOf(p), p, p).p);
}

// Finalização aérea da IA: mesma pose que a sua (começa no quadro do contato).
function aiFinalizaAereo(p, tipo) {
  const gx = p.dir * HALF_L, tz = rand(-GOAL_HALF + 0.6, GOAL_HALF - 0.6);
  const ty = tipo === 'cabeca' ? rand(0.3, 2.0) : rand(0.3, 2.3);
  const dx = gx - ball.x, dz = tz - ball.z, D = Math.hypot(dx, dz) || 1;
  const sp = tipo === 'cabeca' ? rand(13, 18) : tipo === 'voleio' ? rand(20, 27) : rand(17, 23), T = D / sp;
  const vy = (ty - ball.y + 0.5 * CONFIG.GRAVITY * T * T) / T;
  if (tipo !== 'bicicleta') p.angle = Math.atan2(dz, dx);   // na bicicleta ele está de costas
  p.recvPose = { kind: tipo, t: CONTATO_T[tipo], dur: POSE_DUR[tipo], side: Math.random() < 0.5 ? 1 : -1 };
  kickBall(p, dx / D * sp, vy, dz / D * sp, 0, 0);
  p.kickT = 0;
  ball.isShot = true;
  const nome = { cabeca: 'Cabeçada', voleio: 'Voleio', bicicleta: 'Bicicleta' }[tipo];
  showToast(nome + ' de ' + p.name + '!', p.team === 0 ? 'good' : 'bad');
}

// Cabeceio da IA: para um companheiro ou, sem alvo, para longe do próprio gol.
function aiCabeceia(p, alvo) {
  let dx, dz, sp, vy;
  if (alvo) { dx = alvo.x - ball.x; dz = alvo.z - ball.z; const d = Math.hypot(dx, dz) || 1; sp = clamp(d * 0.55, 7, 13); vy = clamp(d * 0.18, 2.5, 5); dx /= d; dz /= d; }
  else { const a = Math.atan2(rand(-0.8, 0.8), p.dir); dx = Math.cos(a); dz = Math.sin(a); sp = rand(11, 15); vy = rand(4, 6); }
  p.angle = Math.atan2(dz, dx);
  p.recvPose = { kind: 'cabeca', t: CONTATO_T.cabeca, dur: POSE_DUR.cabeca, side: 1 };
  kickBall(p, dx * sp, vy, dz * sp, 0, 0);
  p.kickT = 0;
  if (alvo) G.passTarget = { p: alvo, x: ball.x + dx * sp * 1.2, z: ball.z + dz * sp * 1.2, t: 3 };
}

// Cabeçada ou batida de primeira depois de um cruzamento.
function finalizacaoDeCruzamento(p, como) {
  const gx = p.dir * HALF_L, tz = rand(-GOAL_HALF + 0.6, GOAL_HALF - 0.6);
  const ty = como === 'cabeca' ? rand(0.4, 2.2) : rand(0.3, 2.4);
  const dx = gx - ball.x, dz = tz - ball.z, D = Math.hypot(dx, dz) || 1;
  const sp = como === 'cabeca' ? rand(13, 18) : rand(18, 25), T = D / sp;
  const vy = (ty - ball.y + 0.5 * CONFIG.GRAVITY * T * T) / T;
  p.angle = Math.atan2(dz, dx);
  if (como === 'cabeca') p.jumpT = 0.5;            // sobe para cabecear
  kickBall(p, dx / D * sp, vy, dz / D * sp, 0, 0);
  if (como === 'cabeca') p.kickT = 0;
  ball.isShot = true;
  showToast((como === 'cabeca' ? 'Cabeçada de ' : 'De primeira, ') + p.name + '!', p.team === 0 ? 'good' : 'bad');
}

// Chute da IA (depois da preparação de ~0,3 s, ver aiCarry). Três jeitos:
//   forte ...... 24–31 m/s, meia altura, no canto longe do goleiro
//   colocado ... 18–23 m/s, rasteiro/baixo, com um pouco de curva
//   cavadinha .. quando o goleiro está adiantado: bola por cima dele
// O erro de mira cresce com a distância (de longe sai mais torto).
function aiShoot(p) {
  const goalX = p.dir * HALF_L, dGoal = Math.hypot(goalX - p.x, p.z);
  const gk = opponentsOf(p).find((o) => o.role === 'GK');
  const gkFora = gk && Math.abs(gk.x - goalX) > 4.5;
  let tipo = 'forte';
  if (gkFora && dGoal < 24 && Math.random() < 0.5) tipo = 'cavadinha';
  else if (Math.random() < (dGoal < 22 ? 0.5 : 0.25)) tipo = 'colocado';
  const longeDoGoleiro = gk ? (gk.z > 0 ? -1 : 1) : (Math.random() < 0.5 ? -1 : 1);
  const canto = Math.random() < 0.75 ? longeDoGoleiro : -longeDoGoleiro;
  let tz = canto * rand(GOAL_HALF - 1.4, GOAL_HALF - 0.45), ty, sp, curva = 0;
  if (tipo === 'forte') { sp = rand(24, 31); ty = rand(0.4, 1.9); }
  else if (tipo === 'colocado') { sp = rand(18, 23); ty = rand(0.25, 1.1); curva = -canto * 0.15; }
  else { sp = rand(11, 14); ty = rand(1.2, 2.0); tz = rand(-1.5, 1.5); }
  const mira = p.team === 1 ? PARTIDA.ajuste.miraAdv : PARTIDA.ajuste.miraNossa;   // dificuldade
  tz += rand(-1, 1) * dGoal * 0.05 * mira;         // erro pela distância
  ty += rand(-0.2, 0.5) * dGoal / 25;
  const dx = goalX - ball.x, dz = tz - ball.z, D = Math.hypot(dx, dz) || 1, T = D / sp;
  const vy = (ty - ball.y + 0.5 * CONFIG.GRAVITY * T * T) / T;
  p.angle = Math.atan2(dz, dx);
  kickBall(p, dx / D * sp, vy, dz / D * sp, curva, 0);
  p.kickT = 0.4;
  ball.isShot = true; ball.distChute = dGoal; ball.cavadinha = tipo === 'cavadinha';   // (depois do kickBall, que zera isso)
  if (ball.cavadinha) marcarCavadinha(1 - p.team, rand(0.45, 0.9));
}

// Guarda, no momento da cavadinha, o quanto o goleiro que vai ser encoberto está ADIANTADO
// (metros fora da linha do gol) e a qualidade do toque. A defesa usa isso (ver checkBallContacts):
//   goleiro na linha (até ~2,5 m) → a bola é lenta e alta, ele só dá uns passos e pega;
//   goleiro saindo (5 m ou mais) → aí sim ela encobre, mais ainda se for bem batida.
function marcarCavadinha(timeGoleiro, qual) {
  const gk = TEAMS[timeGoleiro].find((g) => g.role === 'GK');
  ball.cavAdiant = gk ? Math.abs(gk.x + gk.dir * HALF_L) : 0;   // o gol dele fica em x = -dir × HALF_L
  ball.cavQual = qual;
}

// ---------------------------------------------------------------------
// MERGULHO DO GOLEIRO (v14): dois tipos.
//   alto  → pula para cima e para o lado (corpo inclinado ~57°, sobe até 1 m), mãos lá no alto
//   baixo → se joga rente ao chão (corpo quase deitado), mãos na altura da bola rasteira
// Onde estão as mãos é calculado igual à pose desenhada: a bola só é defendida se passar perto
// do corpo/mãos (não dá mais para "defender" uma bola que passa por cima dele deitado).
// ---------------------------------------------------------------------
// Simula a bola solta (em passos de 0,1 s, com o atrito do gramado) e acha o primeiro ponto
// DENTRO da área que o goleiro alcança antes do adversário mais rápido.
function goleiroAlcancaBolaSolta(gk, ownGx) {
  let x = ball.x, z = ball.z, y = ball.y, vx = ball.vx, vz = ball.vz, vy = ball.vy;
  const adv = opponentsOf(gk);
  for (let t = 0.1; t <= 2.5; t += 0.1) {
    vy -= CONFIG.GRAVITY * 0.1; y += vy * 0.1;
    if (y < CONFIG.BALL_R) { y = CONFIG.BALL_R; vy = Math.abs(vy) * 0.45; vx *= 0.88; vz *= 0.88; }
    if (y < 0.4) { vx *= 0.94; vz *= 0.94; }
    x += vx * 0.1; z += vz * 0.1;
    if (Math.abs(x - ownGx) > BOX.depth || Math.abs(z) > BOX.half || y > 2.6) continue;
    const tGk = Math.hypot(x - gk.x, z - gk.z) / (CONFIG.GK_SPEED * 1.3);
    if (tGk > t + 0.15) continue;
    let tAdv = Infinity;
    for (const a of adv) if (!a.out) tAdv = Math.min(tAdv, Math.hypot(x - a.x, z - a.z) / CONFIG.USER_RUN);
    if (tGk <= tAdv) return { x, z };
    return null;                                    // o atacante chega antes: fica e protege o gol
  }
  return null;
}

function progressoMergulho(p) { return clamp(1 - p.diveT / p.diveDur, 0, 1); }
function tombMergulho(p) { return (p.diveTipo === 'alto' ? 1.0 : 1.4) * Math.min(1, progressoMergulho(p) * 3); }
function alturaMergulho(p) {
  const k = progressoMergulho(p);
  if (p.diveTipo === 'alto') return Math.sin(k * Math.PI) * 1.0;
  return Math.max(Math.sin(k * Math.PI) * 0.3, 0.3 * Math.min(1, k * 2));   // rente ao chão, sem entrar nele
}
// Segmento do corpo do goleiro (pés → mãos) em 3D, para saber se a bola passa nele.
function corpoGoleiro(gk) {
  const pe = { x: gk.x, y: 0, z: gk.z };
  if (gk.diveT > 0) {
    const tb = tombMergulho(gk), y0 = alturaMergulho(gk), lado = Math.sign(gk.diveVZ) || 1;
    pe.y = y0;
    return { a: pe, b: { x: gk.x, y: y0 + 2.0 * Math.cos(tb), z: gk.z + lado * 2.0 * Math.sin(tb) }, raio: 0.65 };
  }
  const topo = gk.jumpT > 0 ? 2.3 + Math.sin((1 - gk.jumpT / 0.5) * Math.PI) * 0.7 : 2.3;
  return { a: pe, b: { x: gk.x, y: topo, z: gk.z }, raio: 1.1 };   // em pé: braços alcançam ~1,1 m para os lados
}
function distSegmento3D(p, a, b) {
  const abx = b.x - a.x, aby = b.y - a.y, abz = b.z - a.z, l2 = abx * abx + aby * aby + abz * abz || 1;
  const t = clamp(((p.x - a.x) * abx + (p.y - a.y) * aby + (p.z - a.z) * abz) / l2, 0, 1);
  return Math.hypot(a.x + abx * t - p.x, a.y + aby * t - p.y, a.z + abz * t - p.z);
}

// Goleiro: postura de espera, acompanha a bola, mergulha, pula em bola alta e segura a bola nas mãos.
function gkThink(p, dt) {
  const ownGx = -p.dir * HALF_L;
  if (p.diveT > 0) {                              // no meio do mergulho: só segue o embalo
    p.diveT -= dt;
    const S = p.saidaPes;
    if (S && !S.feito && dist2D(p, ball) < 1.15) {  // saída nos pés: chegou na bola
      S.feito = true;
      const dono = G.possession;
      if (dono && dono.team !== p.team && Math.random() < S.chance) {
        givePossession(p, { silent: true });
        perderBola(dono, Math.random() < 0.5 ? 'queda' : 'joelho');
        if (dono.isUser) G.stats.perdas++;
        showToast(p.team === 1 ? 'O goleiro saiu nos pés!' : 'Nosso goleiro abafou!', p.team === 1 ? 'bad' : 'good');
        Som.defesa();
      }
    }
    if (p.diveT <= 0) {
      p.saidaPes = null;
      if (G.possession === p) { p.stun = 0.3; p.diveVX = 0; return { vx: 0, vz: 0 }; }   // pegou: levanta com a bola
      p.fall = 1; p.fallKind = 'lado'; p.fallSide = p.diveSide; p.stun = 0.7;          // termina deitado e levanta
    }
    return { vx: p.diveVX || 0, vz: p.diveVZ };
  }
  if (p.jumpT > 0) p.jumpT -= dt;
  // Pênalti contra: em cima da linha, no meio do gol, esperando a batida.
  if (G.sp && G.sp.kind === 'penalti' && p.team !== G.sp.team) { const t = restartTarget(p); return seek(p, t.x, t.z, CONFIG.GK_SPEED); }
  if (G.possession === p) {
    if (G.state !== 'play') return { vx: 0, vz: 0 };
    if (G.sp && G.sp.taker === p) return aiSetPiece(p, dt);    // tiro de meta
    p.hold -= dt;
    if (p.comPe) {
      // Recuo: com a bola no pé ele NÃO pode pegar com a mão. Domina e toca rápido (ou dá um
      // chutão se tiver adversário chegando perto).
      const perto = opponentsOf(p).some((o) => !o.out && dist2D(o, p) < 5);
      if (p.hold > 0.7) p.hold = 0.7;
      if (perto || p.hold <= 0) {
        const r = pickSetPieceTarget(p, 'goleiro');
        passTo(p, r, false, perto || dist2D(p, r) > 26 ? 'long' : undefined);
        if (r === user) G.userRequest = 0;
      }
      return { vx: 0, vz: 0 };
    }
    if (p.hold <= 0) {
      // Reposição: com a mão para alguém livre perto, ou chutão para quem estiver livre lá na frente.
      const r = pickSetPieceTarget(p, 'goleiro');
      passTo(p, r, false, dist2D(p, r) > 26 ? 'long' : 'throw');
      if (r === user) G.userRequest = 0;
    }
    return { vx: 0, vz: 0 };
  }
  const holder = G.possession;
  // Cara a cara (atacante sem zagueiro entre ele e o gol, a menos de ~26 m): às vezes (55%) o
  // goleiro sai para fechar o ângulo. Adiantado, ele fica vulnerável à cavadinha.
  if (G.state === 'play' && holder && holder.team !== p.team && holder.role !== 'GK') {
    const dH = Math.hypot(holder.x - ownGx, holder.z);
    const sozinho = dH < 26 * ESC && ultimoHomem({ team: p.team, dir: p.dir, x: p.x }, holder, true);
    if (sozinho) {
      if (p.saidaDe !== holder || G.time - p.saidaVisto > 2) { p.saidaDe = holder; p.vaiSair = Math.random() < 0.55; }
      p.saidaVisto = G.time;
      if (p.vaiSair && dH > 4) {
        const dist = clamp(dH * 0.55, 2.5, 11), ux = (holder.x - ownGx) / dH, uz = holder.z / dH;
        if (dist2D(p, holder) < 2.2) tryTackle(p, holder, dt);
        return seek(p, ownGx + ux * dist, uz * dist, CONFIG.GK_SPEED * 1.25);
      }
    } else p.saidaDe = null;
  }
  // Bola alta caindo na área dele (lançamento, cruzamento): vai buscar no ponto de queda.
  if (G.state === 'play' && !holder && !ball.isShot && ball.y > 1.2 && ball.lastKicker && ball.lastKicker.team !== p.team) {
    const g = CONFIG.GRAVITY, disc = ball.vy * ball.vy + 2 * g * (ball.y - 1.8);
    if (disc > 0) {
      const tq = (ball.vy + Math.sqrt(disc)) / g, qx = ball.x + ball.vx * tq, qz = ball.z + ball.vz * tq;
      if (tq < 2.5 && Math.abs(qx - ownGx) < BOX.depth && Math.abs(qz) < BOX.half && Math.hypot(qx - p.x, qz - p.z) < 12) {
        if (tq < 0.45 && dist2D(p, { x: qx, z: qz }) < 1.5 && p.jumpT <= 0) p.jumpT = 0.5;
        return seek(p, qx, qz, CONFIG.GK_SPEED * 1.3);
      }
    }
  }
  // Bola solta entrando na área (lançamento, passe longo, rebote): se ele chega antes do
  // atacante mais perto, sai para pegar — não fica parado na linha só porque não foi chute.
  if (G.state === 'play' && !holder && !ball.isShot) {
    const alvo = goleiroAlcancaBolaSolta(p, ownGx);
    if (alvo) return seek(p, alvo.x, alvo.z, CONFIG.GK_SPEED * 1.3);
  }
  if (G.state === 'play' && holder && holder.team !== p.team) {
    const inBox = Math.abs(holder.x - ownGx) < BOX.depth && Math.abs(holder.z) < BOX.half;
    // (4.0.0) SAÍDA NOS PÉS: atacante na área chegando devagar (andando, sem fôlego) ou colado
    // nele → o goleiro se joga rasteiro na bola e abafa. Andando: 85%; correndo colado: 55%.
    if (inBox && p.stun <= 0 && !(p.saidaCd > G.time)) {
      const dH = dist2D(p, holder), vH = Math.hypot(holder.vx, holder.vz);
      const lento = vH < 4.6 || holder.exhausted || (holder.isUser && !holder.running);
      if ((lento && dH < 3.4) || dH < 1.7) { iniciarSaidaNosPes(p, holder, lento ? 0.85 : 0.55); return { vx: p.diveVX, vz: p.diveVZ }; }
    }
    if (inBox && dist2D(p, holder) < 7) { tryTackle(p, holder, dt); return seek(p, holder.x, holder.z, CONFIG.GK_SPEED); }
  }
  if (G.state === 'play' && !holder) {
    const lineX = ownGx + p.dir * 0.9;
    // Plano onde ele vai interceptar: onde ELE está (se estiver perto do gol), não a linha do gol.
    // Antes a conta era feita na linha, e com ele 3 m adiantado a bola chegava antes do mergulho.
    const planoX = Math.abs(p.x - ownGx) < 6 ? p.x : lineX;
    if (ball.vx * -p.dir > 3 && ballSpeed() > 6) {
      const t = (planoX - ball.x) / ball.vx;
      if (t > 0 && t < 2.5) {
        const pz = ball.z + ball.vz * t;          // onde a bola vai cruzar a linha dele
        const py = ball.y + ball.vy * t - 0.5 * CONFIG.GRAVITY * t * t;
        const gap = pz - p.z;
        const noAlvo = Math.abs(pz) < GOAL_HALF + 0.3 && py < CONFIG.GOAL_H + 0.3;
        const alcanca = Math.abs(gap) < 3.4;      // distância máxima de um mergulho
        if (!noAlvo || !alcanca) {
          // Bola para fora ou longe demais: não pula, só acompanha com os olhos.
          return seek(p, lineX, clamp(p.z, -GOAL_HALF + 0.4, GOAL_HALF - 0.4), CONFIG.GK_SPEED);
        }
        if (t < 0.55 && Math.abs(gap) > 0.9) {
          // Mergulho: voa de lado e chega junto com a bola.
          p.diveDur = clamp(t + 0.15, 0.35, 0.7);
          p.diveT = p.diveDur;
          // O corpo deitado fica entre os pés e as mãos: mira para a bola passar no meio do corpo
          // (~1 m do ponto de partida), não nos pés.
          const alvoLat = gap - Math.sign(gap) * Math.min(Math.abs(gap), 1.0);
          p.diveVZ = clamp(alvoLat / Math.max(0.3, t), -9.5, 9.5); p.diveVX = 0;
          p.diveTipo = py > 1.4 ? 'alto' : 'baixo';   // pula para cima (bola alta) ou se joga no chão
          const right = Math.cos(p.angle);        // lado direito do goleiro em Z (ele olha para o campo)
          p.diveSide = Math.sign(gap * right) || 1;
          return { vx: 0, vz: p.diveVZ };
        }
        if (t < 0.5 && py > 2.0 && Math.abs(gap) < 1.2 && p.jumpT <= 0) p.jumpT = 0.5; // bola alta em cima dele: pula
        // Cavadinha: adiantado, ele volta de costas, devagar (por isso ela funciona). Perto da linha
        // ele só ajeita o corpo e espera a bola cair — e ela é lenta, dá tempo.
        const voltaDeCostas = ball.cavadinha && (ball.cavAdiant || 0) > 4;
        if (ball.cavadinha && !voltaDeCostas && t < 0.5 && py > 1.9 && Math.abs(gap) < 1.6 && p.jumpT <= 0) p.jumpT = 0.5;
        return seek(p, lineX, clamp(pz, -GOAL_HALF, GOAL_HALF), CONFIG.GK_SPEED * (voltaDeCostas ? 0.55 : 1.4));
      }
    }
    const inBox = Math.abs(ball.x - ownGx) < BOX.depth - 2 && Math.abs(ball.z) < BOX.half - 2;
    if (inBox && ballSpeed() < 9) return seek(p, ball.x, ball.z, CONFIG.GK_SPEED);
  }
  const F = G.focus || ball;
  const depth = 1.0 + clamp((50 - Math.abs(F.x - ownGx)) * 0.06, 0, 3);
  return seek(p, ownGx + p.dir * depth, clamp(F.z * 0.3, -GOAL_HALF + 0.5, GOAL_HALF - 0.5), CONFIG.GK_SPEED);
}

// ---------------------------------------------------------------------
// PERDER A BOLA (4.0.0): três reações, para você e para a IA.
//   'passinhos' ... 2–3 passos curtos desequilibrado (braços abertos, balançando) e volta
//   'joelho' ...... tropeça: um pé fica no chão na frente e o outro apoia com o JOELHO (não cai)
//   'queda' ....... cai de frente (a queda que já existia)
// tipo vazio = sorteio (34% / 38% / 28%). Vale para TODO desarme: seu, da IA em você, da IA na IA,
// carrinho, saída do goleiro e drible errado.
// ---------------------------------------------------------------------
const PERDA_DUR = { passinhos: 0.85, joelho: 1.15, queda: 1.4 };
function perderBola(p, tipo) {
  if (!p || p.role === 'GK') return;
  if (!tipo) { const r = Math.random(); tipo = r < 0.34 ? 'passinhos' : r < 0.72 ? 'joelho' : 'queda'; }   // (4.1.3) igual para você e para a IA
  const dur = PERDA_DUR[tipo];
  p.stun = Math.max(p.stun, dur);
  const sp = Math.hypot(p.vx, p.vz), a = sp > 0.3 ? Math.atan2(p.vz, p.vx) : p.angle;
  p.perda = { tipo, t: 0, dur, lado: Math.random() < 0.5 ? -1 : 1, vx: Math.cos(a) * 1.8, vz: Math.sin(a) * 1.8 };
  if (tipo === 'queda') { p.falling = true; p.fallKind = 'frente'; p.fallSide = p.perda.lado; }
}

// Goleiro se joga rasteiro (mergulho 'baixo') na direção da bola, um pouco à frente dela.
function iniciarSaidaNosPes(gk, holder, chance) {
  const tx = ball.x + holder.vx * 0.2, tz = ball.z + holder.vz * 0.2;
  const dx = tx - gk.x, dz = tz - gk.z, d = Math.hypot(dx, dz) || 1;
  const dur = clamp(d / 8.5, 0.3, 0.55);
  gk.diveDur = dur + 0.15; gk.diveT = gk.diveDur; gk.diveTipo = 'baixo';
  gk.diveVX = dx / d * (d / dur); gk.diveVZ = dz / d * (d / dur);
  const right = { x: -Math.sin(gk.angle), z: Math.cos(gk.angle) };
  gk.diveSide = Math.sign(dx * right.x + dz * right.z) || 1;
  gk.saidaPes = { chance, feito: false };
  gk.saidaCd = G.time + 3;
}

// Quem do time está entre o atacante e o próprio gol? Se forem SÓ zagueiros (2 ou mais) e o
// atacante estiver fora da área (até 35 m do gol), devolve quem sobe e quem cobre.
function duplaDeZaga(team, holder) {
  const ownGx = (team === 0 ? -1 : 1) * HALF_L;
  const dh = Math.abs(holder.x - ownGx);
  if (dh < BOX.depth + 1 || dh > 35 * ESC) return null;
  const atras = TEAMS[team].filter((q) => q.role !== 'GK' && !q.out && q.stun <= 0 && Math.abs(q.x - ownGx) < dh);
  if (atras.length < 2 || atras.some((q) => q.role !== 'DEF')) return null;
  atras.sort((a, b) => dist2D(a, holder) - dist2D(b, holder));
  return { sobe: atras[0], cobre: atras[1] };
}

function tryTackle(def, holder, dt) {
  const podeRoubar = G.state === 'play' || (KICK_STATES.includes(G.state) && holder === user);
  if (!podeRoubar || G.sp || G.kickoffPending || !holder || (holder.role === 'GK' && !holder.comPe) || holder.dash > 0 || holder.throwIn || holder.setPiece) return;
  const dTk = dist2D(def, holder);
  const atras = def.role !== 'GK' && porTras(def, holder);
  // Um pouco de longe (até ~3 m), às vezes o marcador se joga de carrinho — só de frente/de lado.
  if (def.role !== 'GK' && !atras && dTk > CONFIG.TACKLE_RANGE && dTk < 3.2 && Math.random() < 0.1 * dt && startSlide(def, holder)) return;
  if (dTk > CONFIG.TACKLE_RANGE) return;
  def.tackleT -= dt;
  if (def.tackleT > 0) return;
  def.tackleT = 0.5;
  if (def.role !== 'GK') {
    // Por trás a IA NÃO dá bote. A exceção é o último homem perseguindo o atacante: aí ele já
    // decidiu no começo da perseguição (10%) se vai parar o lance com falta (ou pênalti, na área).
    if (atras) {
      if (def.chaseFalta) {
        def.chaseFalta = false;
        if (Math.random() < 0.5 && startSlide(def, holder)) return;          // carrinho (por trás = vermelho)
        commitFoul(def, holder, { tipo: 'desarme', porTras: true });
      }
      return;
    }
    if (Math.random() < 0.1 && startSlide(def, holder)) return;              // de frente, às vezes vai de carrinho
  }
  let chance = holder.isUser ? CONFIG.AI_TACKLE_CHANCE : 0.22;
  if (holder.isUser && Math.hypot(holder.vx, holder.vz) < 4.2) chance = Math.min(0.6, chance * 2);   // você andando: bote mais fácil
  if (holder.boost > 0) chance *= 0.6;
  if (Math.random() < chance) {
    givePossession(def, { silent: true });
    perderBola(holder);
    if (holder.isUser) { G.stats.perdas++; showToast('Desarmado!', 'bad'); }
  } else if (def.role !== 'GK' && Math.random() < 0.07) {
    commitFoul(def, holder, { tipo: 'desarme' });        // errou o bote e acertou o pé: falta leve
  }
}

// Converte o joystick (relativo à câmera) em direção no campo.
// Câmera olhando para o ângulo "yaw": frente = (cos, sin), direita = (-sin, cos).
function screenToWorld(up, right, yaw = cam.yaw) {
  const fx = Math.cos(yaw), fz = Math.sin(yaw);
  return { x: up * fx - right * fz, z: up * fz + right * fx };
}

// Velocidade desejada do SEU jogador. Correr gasta estamina.
function userDesired(u, dt) {
  u.running = false;
  if (G.state === 'goal' && G.golAutor && G.golAutor !== u) {   // gol de outro: a IA controla você
    const a = G.golAutor;
    if (lamentandoNoChao(u)) return { vx: 0, vz: 0 };
    if (a.team === u.team && G.goalT > 0.5) return seek(u, a.x - Math.cos(a.angle) * 1.6, a.z - Math.sin(a.angle) * 1.6, CONFIG.USER_RUN * 0.9);
    const t = formationTarget(u, false);
    return seek(u, t.x, t.z, CONFIG.USER_WALK * 0.6);
  }
  if (G.state === 'celebrate' && u.celeb && !CELEBRACOES[u.celeb.name].controlado) {   // comemoração: o movimento é da animação
    const c = CELEBRACOES[u.celeb.name];
    u.angle += c.giro * dt;
    const v = celebVel(c, u.celeb.t);
    return { vx: Math.cos(u.angle) * v, vz: Math.sin(u.angle) * v };
  }
  // Paralisação e cena de cobrança: você anda SOZINHO para uma posição do time (longe da bola,
  // se a cobrança for do adversário). Assim você nunca fica parado em cima da bola.
  if ((G.state === 'foul' || G.state === 'restart') && !(G.sp && G.sp.taker === u)) {
    const t = alvoReposicao(u);
    const des = seek(u, t.x, t.z, CONFIG.USER_RUN * 0.75);
    return des;
  }
  const livre = G.state === 'play' || G.state === 'celebrate' || (G.state === 'trap' && G.recv);
  if (!livre || u.throwIn || (G.sp && G.sp.taker === u) || G.kickoffPending) return { vx: 0, vz: 0 };
  const inp = readMove();
  // Embalo do drible: sem joystick, segue correndo reto na direção em que passou pelo marcador.
  const E = u.embalo;
  if (E) {
    E.t -= dt;
    if (E.t <= 0 || inp.mag > 0.25 || G.possession !== u) u.embalo = null;
    else {
      u.running = true;
      const s0 = (G.possession === u ? CONFIG.USER_RUN_BALL : CONFIG.USER_RUN) * Math.min(1, E.t / 0.4 + 0.3);   // no fim vai soltando
      return { vx: E.x * s0, vz: E.z * s0 };
    }
  }
  if (inp.mag < 0.01) return { vx: 0, vz: 0 };
  const hasBall = G.possession === u;
  const canRun = !u.exhausted;
  let s;
  if (inp.run && canRun) {
    u.running = true;
    s = hasBall ? CONFIG.USER_RUN_BALL : CONFIG.USER_RUN;
  } else {
    s = (hasBall ? CONFIG.USER_WALK_BALL : CONFIG.USER_WALK) * Math.min(1, inp.mag / CONFIG.RUN_THRESHOLD);
  }
  if (u.boost > 0) s *= 1.25;
  const w = screenToWorld(inp.up / inp.mag, inp.right / inp.mag);
  let vx = w.x * s, vz = w.z * s;
  // Falta do adversário esperando a cobrança: você não consegue entrar nos 9,15 m da bola.
  const S = G.sp;
  if (S && (S.kind === 'falta' || S.kind === 'penalti') && S.team !== u.team && S.ballSpot) {
    const dx = u.x - S.ballSpot.x, dz = u.z - S.ballSpot.z, d = Math.hypot(dx, dz) || 1;
    if (d < 9.3) { const dentro = (vx * dx + vz * dz) / d; if (dentro < 0) { vx -= dentro * dx / d; vz -= dentro * dz / d; } if (d < 8.8) { vx += dx / d * 3; vz += dz / d * 3; } }
  }
  return { vx, vz };
}

// Para onde você vai sozinho enquanto o jogo está parado.
function alvoReposicao(u) {
  if (G.state === 'foul' && G.foul) {
    const F = G.foul, t = formationTarget(u, u.team === F.team);
    if (u.team !== F.team) afastarDe(t, F.spot, 9.6);
    else afastarDe(t, F.spot, 3);
    return t;
  }
  return restartTarget(u);
}
// Empurra o ponto t para ficar a pelo menos "raio" metros do ponto c.
function afastarDe(t, c, raio) {
  const dx = t.x - c.x, dz = t.z - c.z, d = Math.hypot(dx, dz);
  if (d >= raio) return t;
  const ux = d > 0.01 ? dx / d : -1, uz = d > 0.01 ? dz / d : 0;
  t.x = c.x + ux * raio; t.z = c.z + uz * raio;
  return t;
}

// Estamina: cai durante a corrida e só volta depois de um tempinho parado de correr.
function updateStamina(u, dt) {
  talvezLesaoMuscular(u, dt);
  if (G.state === 'celebrate') { u.stamina = 1; u.exhausted = false; return; }   // na comemoração não cansa
  if (u.running && Math.hypot(u.vx, u.vz) > 3) {
    u.stamina = Math.max(0, u.stamina - dt / CONFIG.STAMINA_RUN_TIME);
    u.regenWait = CONFIG.STAMINA_REGEN_DELAY;
    if (u.stamina <= 0.005 && !u.exhausted) { u.stamina = 0; u.exhausted = true; showToast('Sem fôlego!', 'bad'); }
  } else {
    u.regenWait -= dt;
    if (u.regenWait <= 0) u.stamina = Math.min(u.staminaMax ?? 1, u.stamina + dt / CONFIG.STAMINA_REGEN_TIME);   // lesão leve: máximo 70%
  }
  if (u.exhausted && u.stamina >= CONFIG.STAMINA_MIN_TO_RUN) u.exhausted = false;
}

function updatePlayers(dt) {
  const holder = G.possession;
  for (const p of players) {
    if (p.out) continue;                            // expulso: anda sozinho para fora (updateExpulsos)
    if (p.stun > 0) p.stun -= dt;
    if (p.controlCd > 0) p.controlCd -= dt;
    if (p.boost > 0) p.boost -= dt;
    if (p.tackleCd > 0) p.tackleCd -= dt;
    if (p.kickT > 0) p.kickT -= dt;
    if (p.empurrao > 0) p.empurrao -= dt;
    if (p.dribbleCd > 0) p.dribbleCd -= dt;
    if (p.wallBlockT > 0) p.wallBlockT -= dt;
    if (p.chutePrep > 0 && G.possession !== p) p.chutePrep = 0;   // perdeu a bola enquanto preparava
    if (p.throwAnim > 0) p.throwAnim -= dt;
    if (p.lamento && (G.state === 'goal' || G.state === 'celebrate' || G.state === 'fim')) {
      p.lamentoAtraso -= dt;
      if (p.lamentoAtraso <= 0) p.lamentoK = Math.min(1, p.lamentoK + dt / 0.7);
    }
    // Pulo da barreira (o goleiro conta o pulo dele no gkThink). Antes ninguém zerava esse
    // contador nos jogadores de linha, e quem pulava na barreira ficava de braços para cima pra sempre.
    if (p.role !== 'GK' && p.jumpT > 0) p.jumpT = Math.max(0, p.jumpT - dt);
    if (p.falling) { p.fall = Math.min(1, p.fall + dt * 2.8); if (p.fall >= 1) p.falling = false; }   // caindo aos poucos
    else if (p.fall > 0 && !p.scripted && p.stun < 0.5) p.fall = Math.max(0, p.fall - dt * 2.5);
    if (p.isUser) updateStamina(p, dt);
    if (p.scripted) continue;

    if (p.celeb) {
      p.celeb.t += dt;
      const cc = CELEBRACOES[p.celeb.name];
      const controlada = p.isUser && cc.controlado;            // a sua dura até o fim da comemoração
      if (!controlada && p.celeb.t >= cc.dur) p.celeb = null;
    }
    if (p.tackle > 0 && !p.scripted && p.stun < 0.8) p.tackle = Math.max(0, p.tackle - dt * 3);
    if (p.fall <= 0) p.fallKind = 'lado';
    let des = p.isUser ? userDesired(p, dt) : (p.role === 'GK' ? gkThink(p, dt) : aiThink(p, dt));
    // CANSAÇO DA IA (4.1.0): o fôlego cai correndo (bem menos andando) e o jogador perde até 20%
    // da velocidade. A taxa acompanha a duração: no fim da partida quem correu muito está ~45%.
    if (!p.isUser) {
      const spd = Math.hypot(p.vx, p.vz);
      if (G.state === 'play') p.folego = Math.max(0, (p.folego ?? 1) - dt * (spd > 4.6 ? 1 : spd > 2 ? 0.3 : 0) * 0.55 / (CONFIG.MATCH_SECONDS * 0.35));
      const fv = 0.8 + 0.2 * (p.folego ?? 1);
      des = { vx: des.vx * fv, vz: des.vz * fv };
    }
    // Gol sofrido: todo mundo para na hora (antes andavam de costas até a reação começar); quem
    // fica de mão na cintura depois volta devagar, de frente, para a posição.
    if (p.lamento && (G.state === 'goal' || G.state === 'celebrate')) {
      if (p.lamentoAtraso > 0 || p.lamento !== 'cintura' || p.lamentoK < 1) des = { vx: 0, vz: 0 };
      else { const t = formationTarget(p, false); des = seek(p, t.x, t.z, 1.1); }
    }
    if (p.celeb && !p.isUser) {                     // IA comemorando: o movimento vem da animação
      const c = CELEBRACOES[p.celeb.name];
      p.angle += c.giro * dt;
      const v = celebVel(c, p.celeb.t);
      des = { vx: Math.cos(p.angle) * v, vz: Math.sin(p.angle) * v };
    }
    if (p.stun > 0 && p.diveT <= 0) des = { vx: 0, vz: 0 };
    if (p.perda) {                                  // perdeu a bola: passinhos para a frente (e para)
      p.perda.t += dt;
      if (p.perda.t >= p.perda.dur) p.perda = null;
      else if (p.perda.tipo === 'passinhos') { const f = 1 - p.perda.t / p.perda.dur; des = { vx: p.perda.vx * f, vz: p.perda.vz * f }; p.anim += dt * 9; }
    }
    if (p.slideT > 0) { const v = lerp(1.5, 9, p.slideT / p.slideDur); des = { vx: p.slideDX * v, vz: p.slideDZ * v }; }
    if (p.dash > 0) { p.dash -= dt; des = { vx: p.dashVX, vz: p.dashVZ }; }

    const acc = p.dash > 0 || p.diveT > 0 || p.slideT > 0 ? 60 : 22;
    const dvx = des.vx - p.vx, dvz = des.vz - p.vz, dv = Math.hypot(dvx, dvz);
    const k = dv > 0 ? Math.min(1, acc * dt / dv) : 0;
    p.vx += dvx * k; p.vz += dvz * k;
    const ox = p.x, oz = p.z;
    p.x = clamp(p.x + p.vx * dt, -BOARD_X + 0.6, BOARD_X - 0.6);
    p.z = clamp(p.z + p.vz * dt, -BOARD_ZN + 0.6, BOARD_Z - 0.6);
    goalCollide(p, ox, oz);
    colisaoArredores(p);

    const sp = Math.hypot(p.vx, p.vz);
    if (p.slideT > 0 || p.slidePose > 0.15 || (p.recvPose && !p.isUser)) {
      // Carrinho (e levantando dele) ou cabeceio/voleio/bicicleta da IA: o corpo não gira.
    } else if (p.lamento && (G.state === 'goal' || G.state === 'celebrate')) {
      if (sp > 0.3) p.angle = turnToward(p.angle, Math.atan2(p.vz, p.vx), 6 * dt);   // triste: anda de frente
    } else if (p.isUser) {
      const ang0 = p.angle;
      if (sp > 0.3 && !p.recvPose && (G.state === 'play' || G.state === 'celebrate' || G.state === 'trap' || G.state === 'goal')) p.angle = turnToward(p.angle, Math.atan2(p.vz, p.vx), (p.celeb ? 4 : 12) * dt);
      // Velocidade da curva (para o aviãozinho inclinar para o lado em que você vira).
      p.giro = lerp(p.giro || 0, dt > 0 ? wrapAngle(p.angle - ang0) / dt : 0, Math.min(1, dt * 6));
    } else if (p.celeb) {
      // IA comemorando: o corpo segue a animação (não fica olhando para a bola).
    } else if (holder === p) {
      if (sp > 0.3) p.angle = turnToward(p.angle, Math.atan2(p.vz, p.vx), 12 * dt);
    } else if (p.diveT <= 0) {
      // Sem a bola, a IA fica de frente para a bola (de costas para o próprio gol quando defende).
      // Só vira o corpo para a direção da corrida quando está correndo forte para longe da bola.
      const toBall = Math.atan2(ball.z - p.z, ball.x - p.x);
      const runAng = Math.atan2(p.vz, p.vx);
      const face = sp > 4.6 && Math.abs(wrapAngle(runAng - toBall)) > 1.6 ? runAng : toBall;
      p.angle = turnToward(p.angle, face, 9 * dt);
    }
    p.anim += sp * dt * 2.6;

    // Postura agachada: marcando perto de quem conduz, ou goleiro com a bola no campo dele.
    let gw = 0;
    if (G.state === 'play' && !G.sp && holder && holder.team !== p.team && !p.isUser && dist2D(p, holder) < 6) gw = 0.8;
    if (p.role === 'GK' && holder !== p) {
      // Goleiro: posição de defesa (agachado, braços abertos) quando o ataque chega perto.
      const dBall = Math.abs(ball.x - (-p.dir * HALF_L));
      const ameaca = holder && holder.team !== p.team && dist2D(holder, { x: -p.dir * HALF_L, z: 0 }) < 30;
      gw = ameaca || dBall < 25 ? 1 : dBall < 45 ? 0.5 : 0;
    }
    p.guard += (gw - p.guard) * Math.min(1, dt * 4);
  }
  for (let i = 0; i < players.length; i++) for (let j = i + 1; j < players.length; j++) {
    const a = players[i], b = players[j];
    if (a.scripted || b.scripted || a.out || b.out) continue;
    const dx = b.x - a.x, dz = b.z - a.z, d2 = dx * dx + dz * dz;
    if (d2 > 0.0001 && d2 < 0.64) {
      const d = Math.sqrt(d2), push = (0.8 - d) / 2, nx = dx / d, nz = dz / d;
      a.x -= nx * push; a.z -= nz * push; b.x += nx * push; b.z += nz * push;
    }
  }
}

// ---------------------------------------------------------------------
// 9. FÍSICA DA BOLA
// ---------------------------------------------------------------------
function attachBall(p) {
  if (p.bolaFixa) {                                // cobrança com corrida: a bola fica parada na marca
    ball.x = p.bolaFixa.x; ball.z = p.bolaFixa.z; ball.y = CONFIG.BALL_R; ball.vx = ball.vy = ball.vz = 0;
    return;
  }
  const c = Math.cos(p.angle), s = Math.sin(p.angle);
  const nasMaos = p.carry || (p.role === 'GK' && !p.goalKick && !p.comPe && G.possession === p);
  if (p.throwIn) { ball.x = p.x + c * 0.12; ball.z = p.z + s * 0.12; ball.y = 2.15; }        // acima da cabeça
  else if (nasMaos && p.diveT > 0) {               // segurou no ar: a bola fica na ponta das mãos esticadas
    const C = corpoGoleiro(p);
    ball.x = C.b.x + c * 0.2; ball.y = Math.max(CONFIG.BALL_R, C.b.y); ball.z = C.b.z;
  } else if (nasMaos && p.fall > 0 && p.fallKind === 'lado') {   // caído de lado, abraçando a bola
    const tb = 1.35 * p.fall * p.fallSide, ly = 0.3 * Math.sin(Math.min(1, p.fall) * Math.PI / 2);
    ball.x = p.x + c * 0.55; ball.y = Math.max(CONFIG.BALL_R, ly + 1.08 * Math.cos(tb)); ball.z = p.z + s * 0.55 + Math.sign(tb) * Math.cos(p.angle) * 1.08 * Math.abs(Math.sin(tb));
  }
  else if (nasMaos) { ball.x = p.x + c * 0.55; ball.z = p.z + s * 0.55; ball.y = 1.08; }      // entre as mãos, na frente do peito
  else { ball.x = p.x + c * 0.62; ball.z = p.z + s * 0.62; ball.y = CONFIG.BALL_R; }
  ball.vx = p.vx; ball.vz = p.vz; ball.vy = 0;
}

function kickBall(from, vx, vy, vz, spinSide = 0, spinVert = 0, isThrow = false) {
  // Quem estava impedido no passe e jogou a bola DE PRIMEIRA (cabeçada, voleio, batida de primeira)
  // também está impedido — antes só o domínio (givePossession) conferia.
  if (G.offside && G.offside.set.has(from) && G.state === 'play' && !isThrow) { callOffside(from); return; }
  // Impedimento: vale para passes e chutes, menos lateral, escanteio e tiro de meta.
  const semImpedimento = isThrow || from.goalKick || (G.sp && G.sp.taker === from && G.sp.kind !== 'falta');
  const ehPenalti = !!(G.sp && G.sp.taker === from && G.sp.kind === 'penalti');
  G.offside = semImpedimento || !PARTIDA.regras.impedimento ? null : calcOffside(from);
  if (G.offside) {                                 // guarda o momento do passe para o replay do impedimento
    const T = G.offside.team, dir = T === 0 ? 1 : -1;
    G.offside.reg = { t: G.time, linhaX: G.offLine[T] * dir, pos: new Map([...G.offside.set].map((q) => [q, q.x])) };
  }
  G.possession = null;
  ball.vx = vx; ball.vy = vy; ball.vz = vz;
  ball.spinSide = spinSide; ball.spinVert = spinVert;
  ball.y = Math.max(ball.y, CONFIG.BALL_R + 0.01);
  ball.lastKicker = from; G.lastTouch = from;
  from.controlCd = 0.45;
  if (!isThrow) { const v = Math.hypot(vx, vy, vz); if (v > 17) Som.chute((v - 17) / 14); else Som.toque(v / 17); }
  if (!isThrow && !(from.role === 'GK' && !from.goalKick)) from.kickT = 0.35; // animação do chute
  if (isThrow) from.throwAnim = 0.3;               // lateral: braços jogam a bola para a frente
  from.throwIn = false; from.goalKick = false; from.setPiece = null; from.carry = false; from.comPe = false;
  if (G.sp && G.sp.taker === from && G.sp.kind === 'falta') {
    for (const p of players) if (p.wallSlot >= 0) { p.jumpT = 0.5; p.wallBlockT = 1.2; p.wallSlot = -1; }
  }
  if (G.sp && G.sp.taker === from && G.sp.kind === 'penalti') goleiroAdivinha(TEAMS[1 - from.team].find((p) => p.role === 'GK'));
  if (G.sp && G.sp.taker === from) {               // cobrança feita: jogo segue normal
    if (G.sp.kind === 'tiro de meta') { const sp = spareOf(G.sp.side); sp.present = true; sp.fade = 0; } // nova reserva surgindo
    const RS = G.sp.reserva;                         // (4.1.3) cone / suporte do goleiro: aparece outra
    if (RS && RS.cone) { RS.cone.present = true; RS.cone.fade = 0; }
    if (RS && RS.rack) { RS.rack.present = true; RS.rack.fade = 0; }
    if (RS && RS.gk) RS.gk.scripted = false;
    G.sp = null; G.focus = null; G.roleT = 0;
  }
  if (G.kickoffPending && G.kickoffPending.taker === from) { G.kickoffPending = null; G.roleT = 0; } // bola rolando
  ball.saveRolled = false; ball.saveOk = false; ball.broken = false;
  ball.isShot = false; ball.userShot = false; ball.userPass = false; ball.cruzamento = null; ball.distChute = 0;
  ball.penalti = ehPenalti; ball.cavadinha = false;
  ball.querPeito = Math.random() < 0.6;            // se cair na altura do peito, domina no peito (ver predictArrival)
}

// 4.1.1: a bola bate no banco de reservas (até a cobertura) e no técnico, e volta.
function bolaNosArredores(R) {
  for (const B of BANCOS) {
    if (ball.y > B.h) continue;
    const cx = clamp(ball.x, B.x0, B.x1), cz = clamp(ball.z, B.z0, B.z1);
    const dx = ball.x - cx, dz = ball.z - cz, d = Math.hypot(dx, dz);
    if (d >= R) continue;
    const nx = d > 1e-4 ? dx / d : 0, nz = d > 1e-4 ? dz / d : 1, vn = ball.vx * nx + ball.vz * nz;
    ball.x = cx + nx * R; ball.z = cz + nz * R;
    if (vn < 0) {
      ball.vx -= 1.45 * vn * nx; ball.vz -= 1.45 * vn * nz;
      if (-vn > 4) Som.toque(Math.min(0.5, -vn / 30));
    }
  }
  for (const t of tecnicos) {
    if (ball.y > 1.8) continue;
    const tp = t.mesh.raiz.position, dx = ball.x - tp.x, dz = ball.z - tp.z, d = Math.hypot(dx, dz), min = R + 0.28;
    if (d >= min) continue;
    const nx = d > 1e-4 ? dx / d : 0, nz = d > 1e-4 ? dz / d : 1, vn = ball.vx * nx + ball.vz * nz;
    ball.x = tp.x + nx * min; ball.z = tp.z + nz * min;
    if (vn < 0) {
      ball.vx -= 1.4 * vn * nx; ball.vz -= 1.4 * vn * nz; ball.vy = Math.max(ball.vy, Math.min(3, -vn * 0.2));
      t.esbarrao = 0.6; Som.toque(Math.min(0.5, -vn / 30));
      if (-vn > 9 && (t.reclamaT || 0) <= 0 && PLAY_STATES.includes(G.state)) { t.reclamaT = 6; showToast(t.nome + ' levou uma bolada!', ''); }
    }
  }
}

function updateBall(dt) {
  if (ball.hidden) return;
  if (G.celebAuto && G.celebAuto.tipo === 'bola' && G.celebAuto.naMao) return;   // na mão de quem comemora
  if (G.possession) { attachBall(G.possession); return; }
  if (G.recvFx) return;                           // bola indo até o pé/peito/cabeça na recepção
  if (G.sp && (G.sp.phase !== 'fetch' || G.sp.onRack)) return;  // nas mãos, parada no lugar, ou no suporte
  const R = CONFIG.BALL_R;
  const hs = ballSpeed();
  const airborne = ball.y > R + 0.02;
  if (hs > 0.5) {
    const ax = (ball.vz / hs) * ball.spinSide * CONFIG.CURVE;
    const az = (-ball.vx / hs) * ball.spinSide * CONFIG.CURVE;
    ball.vx += ax * dt; ball.vz += az * dt;
  }
  let ay = -CONFIG.GRAVITY;
  if (airborne) ay += ball.spinVert * CONFIG.LIFT;
  ball.vy += ay * dt;
  if (airborne) { const drag = 1 - 0.06 * dt; ball.vx *= drag; ball.vz *= drag; }
  ball.x += ball.vx * dt; ball.y += ball.vy * dt; ball.z += ball.vz * dt;
  if (ball.y < R) {
    ball.y = R;
    if (ball.vy < -1.2) {
      ball.vy = -ball.vy * QUIQUE; ball.vx *= 0.88; ball.vz *= 0.88;   // QUIQUE: clima/gramado
      ball.spinSide *= 0.6; ball.spinVert *= 0.5;
    } else ball.vy = 0;
  }
  if (ball.y <= R + 0.001 && ball.vy === 0) {
    const s = ballSpeed();
    if (s < 0.15) { ball.vx = 0; ball.vz = 0; }
    else { const ns = Math.max(0, s - (0.45 * s + 1.2) * ATRITO * dt); ball.vx *= ns / s; ball.vz *= ns / s; }
    ball.spinSide *= Math.max(0, 1 - 3 * dt);
    ball.spinVert = 0;
  }
  ball.spinSide *= Math.exp(-0.35 * dt);
  if (ballSpeed() < 6) ball.saveRolled = false;
  // (4.1.3) SEM PAREDE INVISÍVEL: a bola só bate no que existe — a placa de publicidade (0,9 m)
  // no estádio, a grade na várzea/society. Por cima dela, sai do estádio de verdade (e a cobrança
  // usa uma bola reserva: cone na lateral, goleiro joga a dele no escanteio — ver updateRestart).
  const obst = (PARTIDA && (PARTIDA.campo.estadio || 'arena') !== 'arena') ? ALTURA_GRADE : 0.9;
  for (const k of ['x', 'z']) {
    const v = 'v' + k, sg = Math.sign(ball[k]) || 1, lim = k === 'x' ? BOARD_X : limZ(sg);
    if (Math.abs(ball[k]) > lim - R && Math.abs(ball[k]) < lim + 0.35 && ball[k] * ball[v] > 0 && ball.y < obst) { ball[v] *= -0.35; ball[k] = sg * (lim - R); }
  }
  bolaNosArredores(R);

  for (const side of [-1, 1]) {
    const gx = side * HALF_L;
    for (const pz of [-GOAL_HALF, GOAL_HALF]) {
      const dx = ball.x - gx, dz = ball.z - pz, d = Math.hypot(dx, dz);
      if (d > 0.0001 && d < R + 0.12 && ball.y < CONFIG.GOAL_H + 0.12) {
        const nx = dx / d, nz = dz / d, vn = ball.vx * nx + ball.vz * nz;
        if (vn < 0) {
          ball.vx -= 1.7 * vn * nx; ball.vz -= 1.7 * vn * nz;
          ball.x = gx + nx * (R + 0.13); ball.z = pz + nz * (R + 0.13);
          if (G.state === 'play') showToast('Na trave!');
          Som.trave(Math.hypot(ball.vx, ball.vz));
        }
      }
    }
    if (Math.abs(ball.x - gx) < R + 0.12 && Math.abs(ball.z) < GOAL_HALF && Math.abs(ball.y - CONFIG.GOAL_H) < R + 0.12) {
      if (Math.sign(ball.y - CONFIG.GOAL_H) * ball.vy < 0) { ball.vy = -ball.vy * 0.6; if (G.state === 'play') showToast('No travessão!'); Som.trave(Math.hypot(ball.vx, ball.vy, ball.vz)); }
    }
  }
  // Segurança da recepção: a bola nunca atravessa você enquanto o minigame está aberto.
  if (G.state === 'trap' && G.recv && !G.recv.done) {
    const dx = ball.x - user.x, dz = ball.z - user.z, d = Math.hypot(dx, dz);
    if (d < 0.8 && d > 0.001) { ball.x = user.x + dx / d * 0.8; ball.z = user.z + dz / d * 0.8; }
  }
  if ((G.state === 'goal' || G.state === 'celebrate') && Math.abs(ball.x) > HALF_L) {
    const side = Math.sign(ball.x);
    if (Math.abs(ball.x) > HALF_L + 2) { ball.x = side * (HALF_L + 2); ball.vx *= -0.2; }
    // (4.1.3) A rede segura a bola: ela não volta rolando para fora do gol depois do gol.
    if ((ball.x - side * (HALF_L + 0.35)) * side < 0 && ball.vx * side < 0) { ball.vx = 0; ball.x = side * (HALF_L + 0.35); }
    if (ball.y < 0.3) { ball.vx *= 0.96; ball.vz *= 0.96; }
    if (Math.abs(ball.z) > GOAL_HALF - R) { ball.z = Math.sign(ball.z) * (GOAL_HALF - R); ball.vz *= -0.3; }
    if (ball.y > CONFIG.GOAL_H - R) { ball.y = CONFIG.GOAL_H - R; ball.vy = 0; }
  }
}

// ---------------------------------------------------------------------
// 10. CONTATOS E REGRAS
// ---------------------------------------------------------------------
function givePossession(p, opts = {}) {
  // Quem recebe estava impedido no momento do passe? Infração. Qualquer outro toque zera o lance.
  if (G.offside) {
    if (!opts.semImpedimento && G.offside.set.has(p) && G.state === 'play') { callOffside(p); return; }
    G.offside = null;
  }
  G.passTarget = null;
  if (!opts.silent && ball.userPass && p.team === 0 && p !== user) G.stats.passesOk++;
  if (!opts.silent && p.role !== 'GK') Som.toque(0.25);   // bola chegando no pé
  if (G.timeComBola !== p.team) { G.timeComBola = p.team; G.recuperouEm = G.time; }   // para o contra-ataque
  G.possession = p; G.lastTouch = p;
  p.comPe = !!opts.comPe;                          // goleiro com a bola no PÉ (recuo de companheiro)
  ball.vx = ball.vy = ball.vz = 0; ball.spinSide = ball.spinVert = 0;
  ball.broken = false; ball.isShot = false; ball.userShot = false; ball.userPass = false; ball.cruzamento = null; ball.penalti = false;
  p.think = rand(0.3, 0.6);
  p.controlCd = 0;
  if (p.team !== 0) G.userRequest = 0;
  if (p.role === 'GK') p.hold = 1.1;
}

function checkBallContacts() {
  if (G.possession) return;
  const sp3 = Math.hypot(ball.vx, ball.vy, ball.vz);
  for (const gk of players) {
    if (gk.role !== 'GK' || gk.controlCd > 0 || (gk.stun > 0 && gk.diveT <= 0) || (ball.lastKicker === gk && sp3 > 5)) continue;
    // (4.0.0) RECUO: bola tocada de propósito por um companheiro → o goleiro não pode pegar com a
    // mão. Ele domina com o pé (bola baixa, perto dele) e joga como jogador de linha.
    const LK = ball.lastKicker;
    if (LK && LK !== gk && LK.team === gk.team && !ball.isShot) {
      if (ball.y < 1.0 && dist2D(gk, ball) < 0.9 && sp3 < 22) {
        givePossession(gk, { comPe: true });
        if (gk.team === 0 || LK === user) showToast('Recuo: o goleiro joga com os pés');
        return;
      }
      continue;
    }   // rebote dele mesmo, já devagar: pode pegar
    const ownGx = -gk.dir * HALF_L;
    const inBox = Math.abs(ball.x - ownGx) < BOX.depth + 0.5 && Math.abs(ball.z) < BOX.half + 0.5;
    const reach = gk.diveT > 0 ? 2.0 : 1.2;
    const C = corpoGoleiro(gk);
    // A bola tem que passar no corpo/mãos. Bola rápida anda ~0,5 m por quadro: confere também os
    // pontos entre o quadro anterior e este (senão ela "pula" o goleiro sem ser vista).
    let dMin = Infinity;
    const passo = (1 / 60) * Math.max(0.05, G.timeScale);
    for (let s = 0; s <= 4; s++) {
      const f = s / 4 * passo;
      dMin = Math.min(dMin, distSegmento3D({ x: ball.x - ball.vx * f, y: ball.y - ball.vy * f, z: ball.z - ball.vz * f }, C.a, C.b));
    }
    if (!inBox || dMin > C.raio) continue;
    if (!ball.saveRolled) {
      ball.saveRolled = true;
      // Quão no meio do goleiro a bola passa: distância da linha da bola até ele (no chão) e
      // altura. Bola no corpo é defesa quase sempre; o gol precisa de um chute longe das mãos.
      const hs = Math.hypot(ball.vx, ball.vz) || 1;
      const passa = Math.abs((gk.x - ball.x) * ball.vz - (gk.z - ball.z) * ball.vx) / hs;
      const noCorpo = passa < 0.6 && ball.y < 2.1;
      let chance = clamp(1.45 - sp3 / 30, 0.2, 0.95) + clamp(1 - passa / reach, 0, 1) * 0.45;
      chance += gk.team === 1 ? PARTIDA.ajuste.goleiroAdv : PARTIDA.ajuste.goleiroNosso;   // dificuldade (teto abaixo)
      if (ball.y > 2.0 && gk.jumpT <= 0) chance -= 0.15;
      if (Math.abs(ball.spinSide) > 0.4) chance -= 0.08;
      if (sp3 < 8) chance = 0.97;
      // Chute de longe: o goleiro tem mais tempo para ver a bola (até +35% de chance de defender).
      if (ball.distChute) chance += clamp((ball.distChute - 14) / 25, 0, 0.35);
      // Chute de muito perto (cara a cara): o goleiro quase não tem tempo de reagir.
      if (ball.distChute && ball.distChute < 13) chance -= (13 - ball.distChute) / 13 * 0.75;
      if (!ball.isShot && sp3 < 22) chance = Math.max(chance, 0.88);   // lançamento/cruzamento: ele sai e segura
      if (noCorpo) chance = Math.max(chance, 0.92);
      if (ball.cavadinha) {
        // Quanto mais adiantado ele estava, menos alcança. Na linha (≤2 m) pega quase sempre;
        // a 6 m, ~45%; a 8 m ou mais, ~20%. Cavadinha bem batida tira até mais 25% — mas só
        // se ele estiver fora da linha (com ele parado no gol, não existe cavadinha boa).
        const adi = ball.cavAdiant || 0, q = ball.cavQual || 0;
        chance = clamp(0.95 - (adi - 2) * 0.12, 0.15, 0.95) - q * 0.25 * clamp((adi - 2) / 4, 0, 1);
        if (noCorpo && adi < 4) chance = Math.max(chance, 0.95);
      }
      if (ball.penalti && !noCorpo) chance = Math.min(chance, 0.5);   // pênalti bem batido: mesmo no canto certo é difícil
      if (ball.userShot && !noCorpo && !ball.cavadinha) chance = Math.min(chance, 0.88);   // TETO: chute seu longe do corpo sempre pode entrar
      ball.saveOk = Math.random() < chance;
      if (ball.userShot && gk.team === 1) { G.stats.noAlvo++; ball.userShot = false; }
      if (!ball.saveOk && (noCorpo || (sp3 > 12 && Math.random() < 0.5))) {   // no corpo nunca "atravessa": rebate
        ball.vx = -ball.vx * 0.3; ball.vz += rand(-7, 7); ball.vy = rand(2, 5);
        ball.lastKicker = gk; G.lastTouch = gk; gk.controlCd = 0.8; ball.isShot = false;
        showToast('Espalmou!'); Som.defesa();
        return;
      }
    }
    // Bola já devagar no pé dele (cavadinha curta, chute que morreu): pega, mesmo que a primeira
    // tentativa tenha falhado. Antes ela ficava parada embaixo dele para sempre.
    if (!ball.saveOk && sp3 < 5) ball.saveOk = true;
    if (ball.saveOk) {
      const wasShot = ball.isShot;
      // (4.0.0) Chute de DENTRO DA ÁREA em cima do goleiro: ele não tem tempo de encaixar —
      // espalma para um dos lados (para fora do gol). Só 1 em cada 10 ele segura.
      if (wasShot && ball.distChute && ball.distChute < BOX.depth && Math.random() >= 0.1) {
        const lado = Math.random() < 0.5 ? -1 : 1;
        ball.vx = gk.dir * rand(2, 6); ball.vz = lado * rand(6, 10); ball.vy = rand(1.5, 4);
        ball.spinSide = 0; ball.spinVert = 0;
        ball.lastKicker = gk; G.lastTouch = gk; gk.controlCd = 0.8; ball.isShot = false;
        if (ball.userShot && gk.team === 1) { G.stats.noAlvo++; ball.userShot = false; }
        showToast('Espalmou!'); Som.defesa();
        return;
      }
      givePossession(gk);
      if (wasShot) { showToast(gk.team === 1 ? 'Defesa do goleiro!' : 'Nosso goleiro defendeu!'); Som.defesa(); }
      return;
    }
  }
  const u = user;
  if (u.stun <= 0 && u.controlCd <= 0 && !u.out) {
    const d = dist2D(u, ball);
    // Recepção: bola vindo em você (prevista para chegar em menos de 0,4 s). Bola difícil
    // (alta, rápida ou quebrada) abre o minigame do martelo; bola fácil rasteira você domina direto.
    if (G.recvIgnore <= 0 && ball.lastKicker !== u && d < 14 && d > 0.9) {
      const closing = ((u.x - ball.x) * ball.vx + (u.z - ball.z) * ball.vz) / (d || 1);
      if (closing > 0.5) {
        const pr = predictArrival();
        if (pr && pr.t < 0.4) {
          const dificil = avaliarChegada(pr).precisaMinigame;   // rasteira e devagar: domínio automático
          const gkAdv = TEAMS[1].find((g) => g.role === 'GK');
          if (gkAdv && pr.y > 1.0 && dist2D(gkAdv, ball) < 3 && gkAdv.stun <= 0) { /* o goleiro chega antes: deixa ele pegar */ }
          else
          if (dificil && pr.y > RECV.ALT.alto) { G.recvIgnore = 0.8; showToast('Passou por cima'); }
          else if (dificil) { startReceive(pr); return; }
        }
      }
    }
    if (d < 0.9 && ball.y < 1.0) { givePossession(u); return; }
  }
  // Barreira: quem acabou de pular na cobrança bloqueia a bola até ~2,4 m de altura.
  for (const p of players) {
    if (!(p.wallBlockT > 0) || p.out || ball.lastKicker === p) continue;
    if (dist2D(p, ball) < 0.6 && ball.y < (p.jumpT > 0 ? 2.4 : 1.9) && sp3 > 6) {
      ball.vx *= -0.3; ball.vz = ball.vz * -0.3 + rand(-3, 3); ball.vy = rand(1.5, 4);
      ball.lastKicker = p; G.lastTouch = p; ball.isShot = false; ball.userShot = false; G.offside = null;
      showToast('Bateu na barreira!');
      return;
    }
  }
  // Cruzamento: o companheiro cabeceia (bola alta) ou bate de primeira (bola baixa) se estiver
  // perto do gol; longe do gol ele só domina.
  // Bola alta (1 a 2,5 m) chegando num jogador da IA: perto do gol ele finaliza (cabeçada,
  // voleio ou bicicleta, com animação); perto do próprio gol afasta de cabeça; no meio do campo
  // mata no peito ou cabeceia para um companheiro.
  if (sp3 > 3 && ball.y >= 1.0 && ball.y <= 2.5) {
    for (const p of players) {
      if (p.isUser || p.out || p.role === 'GK' || p.stun > 0 || p.controlCd > 0 || ball.lastKicker === p || p.recvPose) continue;
      if (dist2D(p, ball) > 0.95) continue;
      if (ball.isShot && ball.lastKicker && ball.lastKicker.team === p.team) continue;   // não atrapalha o chute do companheiro
      aiBolaAerea(p);
      return;
    }
  }
  const CZ = ball.cruzamento;
  if (CZ && sp3 > 3 && ball.y < 1.0) {             // cruzamento rasteiro: bate de primeira
    for (const p of TEAMS[CZ.team]) {
      if (p.isUser || p.out || p.role === 'GK' || p.stun > 0 || p.controlCd > 0) continue;
      if (dist2D(p, ball) > 0.95) continue;
      const dGol = Math.hypot(p.dir * HALF_L - p.x, p.z);
      if (dGol < 18 && Math.random() < 0.6) { finalizacaoDeCruzamento(p, 'pe'); return; }
    }
  }
  let best = null, bd = Infinity;
  for (const p of players) {
    if (p.isUser || p.out || p.role === 'GK' || p.stun > 0 || p.controlCd > 0) continue;
    const d = dist2D(p, ball);
    if (d < 0.85 && ball.y < 1.0 && d < bd) { best = p; bd = d; }
  }
  if (best) {
    if (sp3 > 17 && Math.random() < 0.45) {
      ball.vx *= -0.25; ball.vz = ball.vz * -0.25 + rand(-3, 3); ball.vy = rand(1, 3);
      ball.lastKicker = best; G.lastTouch = best; best.controlCd = 0.5;
    } else givePossession(best);
  }
}

// Saiu? Decide se foi gol, escanteio, tiro de meta ou lateral e começa a cena.
function handleBallOut() {
  const R = CONFIG.BALL_R;
  if (G.sp) return;                               // bola parada: está na linha de propósito
  if (Math.abs(ball.x) > HALF_L + R) {
    const side = Math.sign(ball.x);
    if (Math.abs(ball.z) < GOAL_HALF && (G.possession || ball.y < CONFIG.GOAL_H)) { scoreGoal(side > 0 ? 0 : 1); return; }
    if (ball.isShot || ball.distChute > 0) Som.ohh();   // chute para fora: "óóh..." da torcida
    const defending = side > 0 ? 1 : 0, attacking = 1 - defending;
    const touchTeam = G.lastTouch ? G.lastTouch.team : attacking;
    if (touchTeam === defending) startRestart('escanteio', attacking, { x: side * HALF_L, z: Math.sign(ball.z || 1) * HALF_W });
    else startRestart('tiro de meta', defending, { x: side * (HALF_L - SMALL_BOX.depth), z: Math.sign(ball.z || 1) * 4 });
    return;
  }
  if (Math.abs(ball.z) > HALF_W + R) {
    const team = G.lastTouch ? 1 - G.lastTouch.team : 0;
    startRestart('lateral', team, { x: clamp(ball.x, -HALF_L + 1, HALF_L - 1), z: Math.sign(ball.z) * HALF_W });
  }
}

function scoreGoal(team) {
  if (G.pen) { registrarCobranca(true); G.possession = null; ball.vx *= 0.2; ball.vz *= 0.2; return; }   // disputa: não conta no placar
  const byUser = team === 0 && (ball.lastKicker === user || G.possession === user);
  G.score[team]++;
  if (byUser) { G.stats.gols++; if (ball.userShot || G.possession === user) G.stats.noAlvo++; }
  ball.userShot = false;
  G.possession = null;
  G.lastConceded = team === 0 ? 1 : 0;
  G.scoredBy = team;
  G.tGol = G.time; G.ladoGol = Math.sign(ball.x) || 1; G.replayFeito = false;   // para o replay
  crowd.comemorar(team);
  Som.gol();
  // Quem tomou o gol reage de um jeito: mão na cintura (metade), senta no chão ou se joga de costas.
  for (const p of TEAMS[1 - team]) {
    const r = Math.random();
    p.lamento = r < 0.5 ? 'cintura' : r < 0.8 ? 'sentado' : 'deitado';
    p.lamentoK = 0; p.lamentoAtraso = rand(0.3, 1.4);   // cada um reage num tempo
  }
  showBanner(team === 0 ? (byUser ? 'GOL SEU!' : 'GOL!') : 'GOL DELES', team);
  hideKickUI();
  if (byUser) {
    // Gol SEU: até 10 s com o jogador na mão para comemorar.
    G.state = 'celebrate'; G.celebT = CONFIG.CELEB_TIME;
    G.targetScale = G.timeScale = 1;
    user.celeb = null; user.stun = 0; user.scripted = false;
  } else {
    // Gol de outro (companheiro ou adversário): a câmera vai para quem fez, que comemora sozinho;
    // a IA controla você (corre para abraçar se foi do seu time).
    let autor = ball.lastKicker && ball.lastKicker.team === team && !ball.lastKicker.out && ball.lastKicker.role !== 'GK' ? ball.lastKicker : null;
    if (!autor) autor = TEAMS[team].filter((p) => p.role !== 'GK').sort((a, b) => dist2D(a, ball) - dist2D(b, ball))[0];
    G.golAutor = autor || null;
    if (autor) { clearFlags(autor); autor.celeb = { name: Math.random() < 0.5 ? 'aviao' : 'joelhada', t: 0 }; autor.angle = Math.atan2(-autor.z, -autor.x * 0.3); }
    user.celeb = null; user.scripted = false;
    G.state = 'goal'; G.goalTimer = 5; G.goalT = 0; G.targetScale = 0.4;
    if (autor) showToast('Gol de ' + autor.name + '!', team === 0 ? 'good' : 'bad');
  }
}

function startCelebration(name) {
  if (G.state !== 'celebrate' || user.celeb || G.celebAuto) return;
  user.celeb = { name, t: 0 };
  showToast(CELEBRACOES[name].nome + '!', 'good');
}

// ---------------------------------------------------------------------
// COMEMORAÇÕES AUTOMÁTICAS (só no SEU gol, e só se nenhuma comemoração estiver rodando):
//   - chegou na bandeirinha de escanteio: corre, dá um chute nela (ela balança como uma mola) e
//     comemora de braços para cima olhando a torcida
//   - chegou nas placas de publicidade: sobe na placa (pernas com joelho), vira para o campo e
//     comemora lá em cima
// As duas tiram o controle do jogador e usam uma câmera própria até o fim da comemoração.
// ---------------------------------------------------------------------
// Quais comemorações automáticas existem em cada tipo de campo (4.1.2):
//   arena ..... técnico (secreta), bandeirinha, subir na placa, bola para a torcida
//   várzea .... sem placas de publicidade: técnico, bandeirinha, bola para a torcida
//   society ... sem técnico/bandeirinha/placa: PULAR NA GRADE e bola para a torcida
const CELEB_POR_CAMPO = {
  arena: ['tecnico', 'bandeira', 'placa', 'bola'],
  varzea: ['tecnico', 'bandeira', 'grade', 'bola'],   // (4.1.3) a várzea tem alambrado: dá para pular na grade
  society: ['grade', 'bola'],
};
function checarComemoracaoAuto() {
  if (G.state !== 'celebrate' || G.celebAuto || user.celeb) return;
  const u = user, pode = CELEB_POR_CAMPO[(PARTIDA && PARTIDA.campo.estadio) || 'arena'] || CELEB_POR_CAMPO.arena;
  // 4.1.1 (secreta): correu até o SEU técnico → abraça ele e os dois comemoram juntos.
  const tec = pode.includes('tecnico') && tecnicos.find((t) => t.team === u.team);
  if (tec && !G.abracoFeito) {
    const tp = tec.mesh.raiz.position;
    if (Math.hypot(u.x - tp.x, u.z - tp.z) < 2.0) { iniciarComemoracaoAuto('tecnico', tec); return; }
  }
  // 4.1.2: foi buscar a bola (lá no fundo da rede) → pega, leva para o lado, chuta para a torcida.
  // (4.1.3) Antes só valia com a bola parada no fundo da rede, e ela às vezes voltava rolando para
  // fora: aí nada acontecia. Agora vale onde a bola estiver, chegando nela andando para ela.
  if (pode.includes('bola') && !ball.hidden && G.celebT < CONFIG.CELEB_TIME - 0.7 && ballSpeed() < 4 && ball.y < 1.2) {
    const dx = ball.x - u.x, dz = ball.z - u.z, d = Math.hypot(dx, dz);
    const indo = d > 0.01 && (u.vx * dx + u.vz * dz) / d > 1.0;
    if (d < 0.9 || (d < 1.6 && indo)) { iniciarComemoracaoAuto('bola', ball); return; }
  }
  if (pode.includes('bandeira')) for (const b of BANDEIRAS) {
    if (Math.hypot(u.x - b.x, u.z - b.z) < 2.0) { iniciarComemoracaoAuto('bandeira', b); return; }
  }
  const nx = Math.abs(u.x) > BOARD_X - 1.3 ? Math.sign(u.x) : 0, nz = u.z > BOARD_Z - 1.3 ? 1 : u.z < -(BOARD_ZN - 1.3) ? -1 : 0;
  const alvo = nz ? { nx: 0, nz } : { nx, nz: 0 };
  if ((nx || nz) && pode.includes('placa')) iniciarComemoracaoAuto('placa', alvo);
  else if ((nx || nz) && pode.includes('grade')) iniciarComemoracaoAuto('grade', alvo);
}

function iniciarComemoracaoAuto(tipo, alvo) {
  const u = user, A = { tipo, t: 0, x0: u.x, z0: u.z, a0: u.angle };
  if (tipo === 'bandeira') {
    // Para a 0,8 m da bandeira, do lado de dentro do campo, de frente para ela.
    const ix = -Math.sign(alvo.x), iz = -Math.sign(alvo.z), l = Math.hypot(ix, iz);
    A.b = alvo; A.px = alvo.x + ix / l * 0.8; A.pz = alvo.z + iz / l * 0.8;
    A.chute = Math.atan2(alvo.z - A.pz, alvo.x - A.px);
    A.fora = Math.atan2(iz, ix);                   // depois do chute, vira para o campo (câmera) com a torcida atrás
    A.dur = 3.4;
  } else if (tipo === 'tecnico') {
    // Abraço no técnico (4.1.2, refeito com análise das caixas 3D): ABRAÇO DE LADO, os dois
    // virados para o campo. Você fica à esquerda do técnico e 0,3 m à frente dele (ombros
    // desencontrados: assim os braços de dentro passam um atrás do outro sem se atravessar).
    // Seu braço direito vai nas costas dele (alto), o esquerdo dele nas suas costas (baixo); os
    // braços de fora comemoram. Conferido peça por peça: nenhuma caixa entra na outra (o
    // balanço e o pulo são iguais para os dois, então continua sem encostar).
    const tp = alvo.mesh.raiz.position;
    A.tec = alvo; A.cx = tp.x; A.cz = tp.z;
    const fz = tp.z < 0 ? 1 : -1;                   // para onde fica o campo
    A.fx = 0; A.fz = fz;
    A.rx = -fz; A.rz = 0;                           // direita de quem olha para o campo
    A.px = A.cx - A.rx * ABRACO.lado + A.fx * ABRACO.frente; A.pz = A.cz - A.rz * ABRACO.lado + A.fz * ABRACO.frente;
    A.olhaCampo = Math.atan2(fz, 0);
    // Caminho: passa pela frente do técnico (nunca por dentro dele).
    A.mx = A.cx + A.fx * 1.3 + (A.px - A.cx) * 0.5; A.mz = A.cz + A.fz * 1.3 + (A.pz - A.cz) * 0.5;
    A.dur = 4.4;
    alvo.abraco = A;
    G.abracoFeito = true;
  } else if (tipo === 'bola') {
    // Bola para a torcida: entra no gol e pega a bola, leva para o lado (dentro do campo, ao lado
    // da área), larga, chuta para a arquibancada daquele lado e dá tchau.
    const lado = Math.sign(alvo.x) || 1, sz = Math.sign(alvo.z) || (Math.sign(u.z) || 1);
    A.lado = lado; A.sz = sz;
    A.bx0 = alvo.x; A.bz0 = alvo.z;
    A.pegaX = alvo.x - lado * 0.45; A.pegaZ = alvo.z;                 // para do lado de dentro da bola
    A.bocaX = lado * (HALF_L - 1.2); A.bocaZ = clamp(alvo.z, -GOAL_HALF + 0.8, GOAL_HALF - 0.8) * 0.5;
    A.px = lado * (HALF_L - 3); A.pz = sz * Math.min(HALF_W - 3, GOAL_HALF + 4.5);
    if (Math.abs(alvo.x) <= HALF_L) { A.bocaX = (A.pegaX + A.px) / 2; A.bocaZ = (A.pegaZ + A.pz) / 2; }   // bola fora do gol: vai direto
    A.olhaTorcida = Math.atan2(sz, 0);
    const lim = limZ(sz), alt = PARTIDA.campo.estadio === 'society' ? 12.5 : 10;
    A.chute = { vy: alt, vh: clamp((lim - Math.abs(A.pz)) * 0.8, 12, 22) };
    A.dur = 5.6;
    ball.vx = ball.vz = ball.vy = 0;
  } else {
    // Placa (e GRADE no society): vai até ela, de frente. Placa: sobe e fica em cima (0,9 m).
    // Grade (4.1.2): escala o alambrado até ~1,3 m, segura lá em cima e fica balançando.
    A.nx = alvo.nx; A.nz = alvo.nz;
    A.bx = alvo.nx ? alvo.nx * BOARD_X : clamp(u.x, -BOARD_X + 2, BOARD_X - 2);
    A.bz = alvo.nz ? alvo.nz * limZ(alvo.nz) : clamp(u.z, -BOARD_ZN + 2, BOARD_Z - 2);
    A.px = A.bx - A.nx * 0.55; A.pz = A.bz - A.nz * 0.55;   // de frente para a placa
    A.olhaPlaca = Math.atan2(A.nz, A.nx); A.olhaCampo = Math.atan2(-A.nz, -A.nx);
    A.dur = 5.0;
    if (tipo === 'grade') {
      A.px = A.bx - A.nx * 0.36; A.pz = A.bz - A.nz * 0.36; A.dur = 5.4;
      // Altura da subida: mãos no alto da grade (várzea, 2,6 m) ou no máximo 1,3 m (society, 5 m).
      A.sobe = clamp(ALTURA_GRADE - 1.85, 0.4, 1.3);
    }
  }
  G.celebAuto = A;
  u.scripted = true; u.vx = u.vz = 0;
  G.celebT = Math.max(G.celebT, A.dur + 0.6);
  showToast({ bandeira: 'Chutou a bandeirinha!', tecnico: 'Comemoração secreta: abraço no técnico!', placa: 'Subiu na placa!', grade: 'Pulou na grade!', bola: 'Bola para a torcida!' }[tipo], 'good');
}

function updateComemoracaoAuto(dt) {
  for (const b of BANDEIRAS) if (b.balanco) atualizarBandeira(b, dt);
  const A = G.celebAuto;
  if (!A) return;
  const u = user;
  A.t += dt;
  const t = A.t;
  if (A.tipo === 'bandeira') {
    if (t < 0.7) {                                 // corre até a bandeira
      const k = smooth(t / 0.7);
      const nx = lerp(A.x0, A.px, k), nz = lerp(A.z0, A.pz, k);
      u.vx = (nx - u.x) / Math.max(dt, 1e-4); u.vz = (nz - u.z) / Math.max(dt, 1e-4);
      u.x = nx; u.z = nz; u.anim += 7 * 2.6 * dt;
      u.angle = turnToward(u.angle, A.chute, 10 * dt);
    } else {
      u.vx = u.vz = 0;
      if (!A.chutou && t >= 0.75) { A.chutou = true; u.angle = A.chute; u.kickT = 0.35; }
      if (!A.b.balanco && t >= 0.88) A.b.balanco = { t: 0, dx: Math.cos(A.chute), dz: Math.sin(A.chute) };
      if (t > 1.3) u.angle = turnToward(u.angle, A.fora, 4 * dt);
    }
  } else if (A.tipo === 'bola') {
    atualizarCelebBola(A, u, t, dt);
  } else if (A.tipo === 'grade') {
    if (t < 0.5) {                                 // corre até a grade
      const k = smooth(t / 0.5);
      u.x = lerp(A.x0, A.px, k); u.z = lerp(A.z0, A.pz, k); u.anim += 7 * 2.6 * dt;
      u.angle = turnToward(u.angle, A.olhaPlaca, 10 * dt);
      A.y = 0;
    } else if (t < 1.5) {                          // escala (sobe 1,3 m)
      u.x = A.px; u.z = A.pz; u.angle = A.olhaPlaca;
      A.y = A.sobe * smooth(clamp((t - 0.5) / 1.0, 0, 1));
    } else {                                       // pendurado, balançando a grade
      u.x = A.px + (A.nz ? Math.sin(t * 9) * 0.05 : 0); u.z = A.pz + (A.nx ? Math.sin(t * 9) * 0.05 : 0);
      u.angle = A.olhaPlaca;
      A.y = A.sobe + Math.abs(Math.sin(t * 4.5)) * 0.12;
    }
    u.vx = u.vz = 0;
  } else if (A.tipo === 'tecnico') {
    if (t < ABRACO.chega) {                        // corre até o lado do técnico (curva pela frente dele)
      const k = smooth(t / ABRACO.chega), a = (1 - k) * (1 - k), b = 2 * k * (1 - k), c = k * k;
      const nx = a * A.x0 + b * A.mx + c * A.px, nz = a * A.z0 + b * A.mz + c * A.pz;
      const dx = nx - u.x, dz = nz - u.z;
      if (Math.hypot(dx, dz) > 1e-4) u.angle = turnToward(u.angle, Math.atan2(dz, dx), 12 * dt);
      u.x = nx; u.z = nz; u.anim += 7 * 2.6 * dt;
    } else {
      u.x = A.px; u.z = A.pz;
      u.angle = t < ABRACO.chega + 0.12 ? turnToward(u.angle, A.olhaCampo, 20 * dt) : A.olhaCampo;
    }
    u.vx = u.vz = 0;
  } else {
    if (t < 0.5) {                                 // chega na frente da placa
      const k = smooth(t / 0.5);
      u.x = lerp(A.x0, A.px, k); u.z = lerp(A.z0, A.pz, k); u.anim += 6 * 2.6 * dt;
      u.angle = turnToward(u.angle, A.olhaPlaca, 10 * dt);
      A.y = 0;
    } else if (t < 1.4) {                          // sobe (dois passos)
      const k = (t - 0.5) / 0.9;
      u.x = lerp(A.px, A.bx, smooth(clamp((k - 0.25) / 0.75, 0, 1))); u.z = lerp(A.pz, A.bz, smooth(clamp((k - 0.25) / 0.75, 0, 1)));
      A.y = 0.9 * smooth(clamp(k / 0.85, 0, 1));
      u.angle = A.olhaPlaca;
    } else {                                       // vira para o campo e comemora lá em cima
      u.x = A.bx; u.z = A.bz; A.y = 0.9;
      u.angle = turnToward(u.angle, A.olhaCampo, 5 * dt);
    }
    u.vx = u.vz = 0;
  }
}

// Bandeirinha chutada: inclina para longe do chute e volta balançando (mola amortecida).
function atualizarBandeira(b, dt) {
  const B = b.balanco;
  B.t += dt;
  const ang = 0.9 * Math.exp(-2.6 * B.t) * Math.cos(9 * B.t - 0.4) * Math.min(1, B.t / 0.06);
  b.g.rotation.z = -ang * B.dx; b.g.rotation.x = ang * B.dz;
  if (B.t > 3) { b.g.rotation.set(0, 0, 0); b.balanco = null; }
}

// Pose das comemorações automáticas (por cima de tudo, no fim do desenho do boneco).
function aplicarCelebAuto(p, m) {
  const A = G.celebAuto, t = A.t, agora = performance.now();
  if (A.tipo === 'tecnico') { if (t >= ABRACO.chega) poseAbraco(m, t, agora, 'jogador'); return; }
  if (A.tipo === 'bola') { poseCelebBola(A, m, t, agora); return; }
  if (A.tipo === 'grade') { poseGrade(A, m, t, agora); return; }
  if (A.tipo === 'bandeira') {
    if (t > 1.3) {                                 // braços para cima, pulinhos
      const k = smooth(clamp((t - 1.3) / 0.3, 0, 1));
      m.bracoE.rotation.z = m.bracoD.rotation.z = lerp(0, 2.9, k) + Math.sin(agora / 140) * 0.15 * k;
      m.bracoE.rotation.x = 0.35 * k; m.bracoD.rotation.x = -0.35 * k;
      m.raiz.position.y = Math.abs(Math.sin(agora / 170)) * 0.22 * k;
    }
    return;
  }
  m.raiz.position.y = A.y + (t > 1.6 ? Math.abs(Math.sin(agora / 200)) * 0.04 : 0);
  if (t >= 0.5 && t < 1.4) {
    // Subindo: um joelho de cada vez (coxa para a frente, canela dobrada) e mãos na placa.
    const k = (t - 0.5) / 0.9, passo = k < 0.5 ? 0 : 1, f = Math.sin((k % 0.5) / 0.5 * Math.PI);
    const coxaE = passo === 0 ? 1.4 * f : 0.3 * f, coxaD = passo === 1 ? 1.4 * f : 0.3 * f;
    m.pernaE.rotation.z = coxaE; m.pernaD.rotation.z = coxaD;
    usarJoelhos(m, -1.5 * (coxaE / 1.4), -1.5 * (coxaD / 1.4));
    m.bracoE.rotation.z = m.bracoD.rotation.z = 1.35; m.bracoE.rotation.x = 0.15; m.bracoD.rotation.x = -0.15;
    m.corpo.rotation.z = -0.25;
  } else if (t >= 1.4) {
    usarJoelhos(m, 0, 0);
    m.pernaE.rotation.z = m.pernaD.rotation.z = 0;
    const k = smooth(clamp((t - 1.5) / 0.4, 0, 1));
    m.bracoE.rotation.z = m.bracoD.rotation.z = lerp(0, 2.85, k) + Math.sin(agora / 160) * 0.2 * k;
    m.bracoE.rotation.x = 0.4 * k; m.bracoD.rotation.x = -0.4 * k;
    m.corpo.rotation.z = 0.1 * k;
  }
}

// ---- Bola para a torcida (4.1.2) ------------------------------------------------------------
//   0,0–0,7  corre até a bola (no fundo do gol)          0,7–1,0  abaixa e pega com as mãos
//   1,0–2,4  sai do gol com a bola nas mãos e vai para o lado (curva pela boca do gol)
//   2,4–2,8  larga a bola no pé                           2,8      chuta para a arquibancada
//   3,3–5,6  tchauzinho para a torcida
function atualizarCelebBola(A, u, t, dt) {
  if (t < 0.7) {
    const k = smooth(t / 0.7);
    const nx = lerp(A.x0, A.pegaX, k), nz = lerp(A.z0, A.pegaZ, k);
    if (Math.hypot(nx - u.x, nz - u.z) > 1e-4) u.angle = turnToward(u.angle, Math.atan2(nz - u.z, nx - u.x), 12 * dt);
    u.x = nx; u.z = nz; u.anim += 7 * 2.6 * dt;
  } else if (t < 1.0) {
    u.x = A.pegaX; u.z = A.pegaZ;
    u.angle = turnToward(u.angle, Math.atan2(A.bz0 - u.z, A.bx0 - u.x), 10 * dt);
    if (t > 0.85) A.naMao = true;
  } else if (t < 2.4) {
    const k = smooth((t - 1.0) / 1.4), a = (1 - k) * (1 - k), b = 2 * k * (1 - k), c = k * k;
    const nx = a * A.pegaX + b * A.bocaX + c * A.px, nz = a * A.pegaZ + b * A.bocaZ + c * A.pz;
    if (Math.hypot(nx - u.x, nz - u.z) > 1e-4) u.angle = turnToward(u.angle, Math.atan2(nz - u.z, nx - u.x), 8 * dt);
    u.x = nx; u.z = nz; u.anim += 4.5 * 2.6 * dt;
  } else {
    u.x = A.px; u.z = A.pz;
    u.angle = turnToward(u.angle, A.olhaTorcida, 9 * dt);
    if (t >= 2.4 && A.naMao) {                      // larga a bola na frente do pé
      A.naMao = false;
      ball.x = u.x + Math.cos(A.olhaTorcida) * 0.45; ball.z = u.z + Math.sin(A.olhaTorcida) * 0.45; ball.y = 0.9;
      ball.vx = ball.vz = 0; ball.vy = 0;
    }
    if (!A.chutou && t >= 2.8) {
      A.chutou = true; u.angle = A.olhaTorcida; u.kickT = 0.35;
      ball.x = u.x + Math.cos(A.olhaTorcida) * 0.45; ball.z = u.z + Math.sin(A.olhaTorcida) * 0.45; ball.y = CONFIG.BALL_R;
      ball.vx = rand(-1.5, 1.5); ball.vz = A.sz * A.chute.vh; ball.vy = A.chute.vy; ball.spinSide = 0;
      Som.chute(0.6);
    }
  }
  u.vx = u.vz = 0;
  if (A.naMao) {                                    // bola nas mãos, na frente do peito
    const f = u.angle;
    ball.x = u.x + Math.cos(f) * 0.42; ball.z = u.z + Math.sin(f) * 0.42; ball.y = t < 1.0 ? lerp(0.25, 1.0, smooth((t - 0.85) / 0.15)) : 1.0;
    ball.vx = ball.vz = ball.vy = 0;
  }
}
function poseCelebBola(A, m, t, agora) {
  if (t >= 0.7 && t < 1.05) {                       // abaixa para pegar
    const k = Math.sin(clamp((t - 0.7) / 0.35, 0, 1) * Math.PI);
    m.corpo.rotation.z = -0.75 * k;
    m.bracoE.rotation.z = m.bracoD.rotation.z = 0.9 * k; m.bracoE.rotation.x = -0.15 * k; m.bracoD.rotation.x = 0.15 * k;
  } else if (A.naMao) {                             // segurando a bola no peito
    m.bracoE.rotation.z = m.bracoD.rotation.z = 1.25; m.bracoE.rotation.x = -0.42; m.bracoD.rotation.x = 0.42;
    usarCotovelo(m.bracoE, -0.25, 0.35); usarCotovelo(m.bracoD, 0.25, 0.35);
  } else {
    usarCotovelo(m.bracoE, 0, 0); usarCotovelo(m.bracoD, 0, 0);
  }
  if (t > 3.3) {                                    // tchauzinho
    const k = smooth(clamp((t - 3.3) / 0.3, 0, 1));
    m.bracoD.rotation.z = lerp(m.bracoD.rotation.z, 2.85, k); m.bracoD.rotation.x = lerp(m.bracoD.rotation.x, -0.35 + Math.sin(agora / 95) * 0.4, k);
    m.bracoE.rotation.z = lerp(m.bracoE.rotation.z, 0.1, k); m.bracoE.rotation.x = lerp(m.bracoE.rotation.x, 0.1, k);
  }
}
// ---- Pular na grade (society) ---------------------------------------------------------------
function poseGrade(A, m, t, agora) {
  m.raiz.position.y = A.y;
  if (t < 0.5) return;
  usarCotovelo(m.bracoE, 0, 0); usarCotovelo(m.bracoD, 0, 0);
  if (t < 1.5) {
    // Escalando: um pé de cada vez na grade (coxa para a frente, canela dobrada) e mãos lá no alto.
    const k = (t - 0.5) / 1.0, f = Math.sin(k * Math.PI * 3);
    const coxaE = 0.6 + Math.max(0, f) * 0.45, coxaD = 0.6 + Math.max(0, -f) * 0.45;
    m.pernaE.rotation.z = coxaE; m.pernaD.rotation.z = coxaD;
    usarJoelhos(m, -1.15, -1.15);
    m.bracoE.rotation.z = 2.88 + Math.max(0, -f) * 0.12; m.bracoD.rotation.z = 2.88 + Math.max(0, f) * 0.12;
    m.bracoE.rotation.x = -0.12; m.bracoD.rotation.x = 0.12;
    m.corpo.rotation.z = -0.08;
  } else {
    // Pendurado: pés apoiados na tela, mãos lá em cima, sacudindo de um lado para o outro.
    // (4.1.3, conferido no 3D) pés encostados na tela e mãos segurando nela, sem atravessar.
    m.pernaE.rotation.z = 0.95; m.pernaD.rotation.z = 0.85;
    usarJoelhos(m, -1.1, -1.0);
    const solta = Math.sin(t * 2.2) > 0.55;         // de vez em quando solta um braço e soca o ar
    m.bracoE.rotation.z = 2.93 + Math.sin(t * 9) * 0.04; m.bracoE.rotation.x = -0.1;
    m.bracoD.rotation.z = solta ? 3.0 + Math.sin(agora / 90) * 0.15 : 2.93 - Math.sin(t * 9) * 0.04; m.bracoD.rotation.x = solta ? -0.6 : 0.1;
    m.corpo.rotation.x = Math.sin(t * 9) * 0.1;
    m.corpo.rotation.z = -0.06;
  }
}

// Abraço de lado (valores achados com busca + conferência das caixas 3D, ver comentário acima).
// lado/frente: onde você fica em relação ao técnico. Braço "dentro" = o que abraça.
const ABRACO = {
  lado: 1.11, frente: 0.3, chega: 0.6, pula: 2.2,
  jogador: { dentro: 'bracoD', z: -0.94, x: -0.25, fora: 'bracoE', fx: 0.4 },
  tecnico: { dentro: 'bracoE', z: -1.2, x: 0.54, fora: 'bracoD', fx: -0.4 },
};
function poseAbraco(m, t, agora, papel) {
  const Q = ABRACO[papel], tt = t - ABRACO.chega;
  const k = smooth(clamp(tt / 0.3, 0, 1));          // entra no abraço
  const bD = m[Q.dentro], bF = m[Q.fora];
  usarCotovelo(m.bracoE, 0, 0); usarCotovelo(m.bracoD, 0, 0);
  bD.rotation.z = lerp(0, Q.z, k); bD.rotation.x = lerp(0, Q.x, k);
  // Braço de fora: soco no ar (balança junto, mesmo ritmo nos dois).
  const soco = Math.sin(tt * 7) * 0.22;
  bF.rotation.z = lerp(0, 2.6 + soco, k); bF.rotation.x = Q.fx * k;
  m.pernaE.rotation.z = m.pernaD.rotation.z = 0;
  m.corpo.rotation.z = 0;
  // Balanço de um lado para o outro (os dois juntos, ±0,025: conferido sem encostar).
  m.corpo.rotation.x = Math.sin(tt * 4.2) * 0.025 * k;
  // Depois pulam juntos (mesmo pulo, mesma hora).
  const kp = smooth(clamp((t - ABRACO.pula) / 0.25, 0, 1));
  m.raiz.position.y = Math.abs(Math.sin((t - ABRACO.pula) * 5.2)) * 0.24 * kp;
}

// Câmera das comemorações automáticas.
function cameraCelebAuto() {
  const A = G.celebAuto, u = user;
  if (A.tipo === 'bola') {
    if (A.t < 1.0) return { px: A.lado * (HALF_L - 6), py: 2.2, pz: A.bz0 + 4.5, tx: A.bx0, ty: 0.6, tz: A.bz0 };   // pegando no gol
    // Depois: de trás dele, com a torcida daquele lado ao fundo.
    return { px: u.x - A.lado * 3.2, py: 1.9, pz: u.z - A.sz * 5.5, tx: u.x, ty: 1.4, tz: u.z + A.sz * 3 };
  }
  if (A.tipo === 'grade') {
    // Do campo, de trás dele, pegando a grade e a torcida do outro lado.
    return { px: A.bx - A.nx * 6 + A.nz * 1.6, py: 2.1, pz: A.bz - A.nz * 6 + A.nx * 1.6, tx: A.bx, ty: 2.0, tz: A.bz };
  }
  if (A.tipo === 'tecnico') {
    // Do lado do campo, de frente para os dois (de corpo inteiro, com o banco atrás).
    const mx = (u.x + A.cx) / 2, mz = (u.z + A.cz) / 2;
    const lado = A.t < ABRACO.chega ? 1.6 : 0.5;
    return { px: mx + A.rx * lado + A.fx * 4.6, py: 1.4, pz: mz + A.rz * lado + A.fz * 4.6, tx: mx, ty: 1.0, tz: mz };
  }
  if (A.tipo === 'bandeira') {
    const b = A.b, ix = -Math.sign(b.x), iz = -Math.sign(b.z), l = Math.hypot(ix, iz);
    if (A.t < 1.6) {
      // Até o chute: de lado (perpendicular ao chute, do lado de dentro do campo), vendo pé e bandeira.
      const dx = Math.cos(A.chute), dz = Math.sin(A.chute);
      let px = -dz, pz = dx;
      if (px * ix + pz * iz < 0) { px = -px; pz = -pz; }
      const mx = (u.x + b.x) / 2, mz = (u.z + b.z) / 2;
      return { px: mx + px * 4.2, py: 1.3, pz: mz + pz * 4.2, tx: mx, ty: 0.8, tz: mz };
    }
    // Depois: de frente para ele, com a bandeira balançando e a torcida atrás.
    return { px: u.x + ix / l * 4.6 + (-iz / l) * 1.2, py: 1.6, pz: u.z + iz / l * 4.6 + (ix / l) * 1.2, tx: (u.x * 2 + b.x) / 3, ty: 1.1, tz: (u.z * 2 + b.z) / 3 };
  }
  // Placa: de baixo para cima, do lado do campo, com a torcida atrás dele.
  return { px: A.bx - A.nx * 6 + A.nz * 1.5, py: 1.5, pz: A.bz - A.nz * 6 + A.nx * 1.5, tx: A.bx, ty: 1.7, tz: A.bz };
}

function endCelebration() {
  if (G.fading) return;
  if (!G.replayFeito) { G.replayFeito = true; iniciarReplayGol(endCelebration); return; }   // replay antes da saída
  G.fading = true;
  $('fade').classList.add('on');
  setTimeout(() => { kickoff(G.lastConceded); snapCamera(); $('fade').classList.remove('on'); G.fading = false; }, 380);
}

function clearFlags(p) {
  Object.assign(p, { driblePose: null, perda: null, saidaPes: null, fim: null, bolaFixa: null, embalo: null, disputaK: 0, stun: 0, dash: 0, boost: 0, controlCd: 0, diveT: 0, jumpT: 0, fall: 0, fallKind: 'lado', tackle: 0, guard: 0, scripted: false, throwIn: false, goalKick: false, setPiece: null, carry: false, pose: null, kickT: 0, celeb: null, lamento: null, lamentoK: 0, recvPose: null, chutePrep: 0, throwAnim: 0 });
}

// Saída de bola: o atacante fica na bola e o meia central ao lado dele, no próprio campo.
// Ninguém sai do lugar até o primeiro toque, que é sempre um passe curto para o meia.
function kickoff(team) {
  Som.fimGol();                                    // a torcida do gol baixa quando volta para o meio
  if (G.fimPendente) { apitoFinal(); return; }     // gol no último lance: em vez da saída, o apito final
  G.golAutor = null;
  if (G.celebAuto) { user.scripted = false; G.celebAuto = null; }
  G.abracoFeito = false;
  for (const t of tecnicos) t.abraco = null;
  // (se alguém foi expulso, outro assume a saída / o toque)
  const taker = TEAMS[team].find((p) => p.role === 'FWD') || TEAMS[team].find((p) => p.role === 'MID');
  const partner = TEAMS[team].find((p) => p.role === 'MID' && p.base.z === 0 && p !== taker)
    || TEAMS[team].find((p) => p !== taker && p.role !== 'GK');
  for (const p of players) {
    if (p.out) continue;
    let bx = p.base.x, bz = p.base.z;
    if (p === taker) { bx = -0.7; bz = 0; }
    else if (p.role === 'FWD') { bx = -(CIRCLE_R + 0.8); bz = p.base.z * 0.5; }   // dois atacantes: lado a lado
    if (p === partner) { bx = -0.7; bz = 2.0; }   // lado a lado com quem dá a saída
    Object.assign(p, { x: bx * p.dir, z: bz * p.dir, vx: 0, vz: 0, angle: p.dir > 0 ? 0 : Math.PI });
    p.kx = p.x; p.kz = p.z;                        // lugar de cada um até a bola rolar
    clearFlags(p);
  }
  partner.angle = Math.atan2(taker.z - partner.z, taker.x - partner.x);
  Object.assign(ball, { x: 0, y: CONFIG.BALL_R, z: 0, vx: 0, vy: 0, vz: 0, spinSide: 0, spinVert: 0, lastKicker: null, hidden: false });
  givePossession(taker, { silent: true });
  taker.think = 1.4;
  G.kickoffPending = { team, taker, partner };
  Som.apito(0.5);                                  // apito da saída de bola
  G.userRequest = 0;
  G.cine = null; G.corrida = null; G.dominioPerfeito = false; G.sp = null; G.focus = null; G.roleT = 0; G.shotCine = null; G.recv = null; G.recvFx = null; G.passTarget = null;
  esconderRecepcao(); user.recvPose = null;
  for (const sp of spares.concat(conesBola)) if (!sp.present) { sp.present = true; sp.fade = 1; }
  lostBall.life = 0; ball.hidden = false;
  setLetterbox(false); $('skipBtn').hidden = true; $('cineLabel').textContent = '';
  if (taker.isUser) showToast('Saída de bola: aperte PASSAR para tocar no ' + partner.name);
  G.state = 'play'; G.targetScale = 1; G.timeScale = 1;
}

// ---------------------------------------------------------------------
// 11. BOLA PARADA: lateral, escanteio e tiro de meta, sem cortes de câmera
// Fases (G.sp.phase):
//   'fetch' → o cobrador sai de onde está e vai buscar a bola de verdade (ela rola até parar nas placas)
//   'carry' → leva a bola nas mãos até o local da cobrança
//   'set'   → ajeita: no lateral segura acima da cabeça; no escanteio e no tiro de meta põe no chão
//   'wait'  → o jogo volta ('play'), mas a cobrança só sai quando o time estiver posicionado.
//             A IA escolhe a melhor opção; se o cobrador for você, a decisão é sua.
// ---------------------------------------------------------------------
const CORNER_ATTACK = [[7, -3], [9, 3], [12, -1], [6, 5], [15, 6]];   // [distância da linha de fundo, z]
const CORNER_DEFEND = [[5, -2], [5, 3], [8, 0], [10, -4], [11, 5]];
const SP_LABEL = { lateral: 'Lateral', escanteio: 'Escanteio', 'tiro de meta': 'Tiro de meta', falta: 'Falta', penalti: 'Pênalti' };

function startRestart(kind, team, spot, motivo) {
  if (G.pen && motivo !== 'disputa') { registrarCobranca(false); return; }   // pênaltis: bola para fora = perdeu
  G.paradas = (G.paradas || 0) + 1;                // conta para os acréscimos
  G.possession = null;
  G.kickoffPending = null; G.offside = null;
  ball.userPass = false; ball.userShot = false;
  const side = Math.sign(spot.x) || 1, zs = Math.sign(spot.z) || 1;
  const S = { kind, team, spot, side, zs, phase: 'fetch', t: 0, waitT: 0 };
  if (kind === 'lateral') {
    S.stand = { x: spot.x, z: zs * (HALF_W + 0.1) };                 // pés na linha
    S.face = Math.atan2(-zs, (team === 0 ? 1 : -1) * 0.6);
    if (PARTIDA.regras.lateral === 'pe') {           // society: lateral cobrado com o pé, bola no chão na linha
      S.pe = true; S.ballSpot = { x: spot.x, z: zs * (HALF_W - 0.25) };
    }
  } else if (kind === 'falta') {
    S.ballSpot = { x: spot.x, z: spot.z };
    const gx = (team === 0 ? 1 : -1) * HALF_L;     // gol que o time da falta ataca
    S.face = Math.hypot(gx - spot.x, spot.z) < 40 ? Math.atan2(-spot.z, gx - spot.x) : Math.atan2(0, gx - spot.x);
    S.motivo = motivo || 'falta';
  } else if (kind === 'penalti') {
    S.ballSpot = { x: spot.x, z: 0 };
    S.face = Math.atan2(0, side * HALF_L - spot.x);   // de frente para o gol
  } else if (kind === 'escanteio') {
    S.ballSpot = { x: side * (HALF_L - 0.3), z: zs * (HALF_W - 0.3) };
    S.face = Math.atan2(-S.ballSpot.z, side * (HALF_L - PEN_SPOT) - S.ballSpot.x);
  } else {
    S.ballSpot = { x: side * (HALF_L - SMALL_BOX.depth), z: zs * 4 };
    S.face = Math.atan2(-S.ballSpot.z * 0.2, -side);
  }
  if (S.ballSpot) S.stand = { x: S.ballSpot.x - Math.cos(S.face) * 0.62, z: S.ballSpot.z - Math.sin(S.face) * 0.62 };
  // Cobrador: no tiro de meta, o goleiro; nos outros, quem do time está mais perto do local da cobrança.
  if (kind === 'tiro de meta') {
    S.taker = TEAMS[team].find((p) => p.role === 'GK');
    // A bola do jogo vira a "bola perdida" lá fora; a bola em jogo passa a ser a reserva do suporte.
    Object.assign(lostBall, { x: ball.x, y: ball.y, z: ball.z, vx: ball.vx * 0.6, vy: ball.vy, vz: ball.vz * 0.6, life: 3 });
    const sp = spareOf(side);
    sp.present = false;
    Object.assign(ball, { x: sp.mesh.position.x, y: sp.mesh.position.y, z: sp.mesh.position.z, vx: 0, vy: 0, vz: 0 });
    S.onRack = true;                                // parada no suporte até o goleiro pegar
  }
  else if (kind === 'falta' && team === 0 && !user.out && voceCobra(spot)) S.taker = user;   // falta a favor na sua zona: você cobra
  else if (kind === 'penalti') {
    // Pênalti: no seu time, VOCÊ bate (é o atacante). No adversário, o atacante deles.
    S.taker = team === 0 && !user.out ? user : (TEAMS[team].find((p) => p.role === 'FWD') || TEAMS[team].find((p) => p.role !== 'GK'));
  }
  else {
    let best = null, bd = Infinity;
    for (const p of TEAMS[team]) { if (p.role === 'GK') continue; const d = dist2D(p, S.stand); if (d < bd) { bd = d; best = p; } }
    S.taker = best;
  }
  if (G.forcaCobrador) S.taker = G.forcaCobrador;  // disputa de pênaltis: a ordem decide
  S.taker.scripted = true;
  let ai = 0, di = 0, pi = 0;                      // vagas na área (escanteio) / fora da área (pênalti)
  for (const p of players) {
    p.slot = -1; p.slotPen = -1;
    if (kind === 'penalti' && p.role !== 'GK' && p !== S.taker && !p.out) p.slotPen = pi++;
    if (kind !== 'escanteio' || p.role === 'GK' || p === S.taker || p.isUser) continue;
    p.slot = p.team === team ? ai++ : di++;
  }
  G.sp = S;
  for (const p of players) p.wallSlot = -1;
  if (kind === 'falta') montarBarreira(S);
  G.focus = S.ballSpot ? { x: S.ballSpot.x, z: S.ballSpot.z } : { x: spot.x, z: spot.z };
  G.state = 'restart'; G.targetScale = 1; G.roleT = 0;
  hideKickUI();
  setLetterbox(true);                              // câmera de cinema enquanto o cobrador busca a bola
  $('skipBtn').hidden = false;
  const rotulo = kind === 'falta' && S.motivo === 'impedimento' ? 'Tiro livre (impedimento)' : SP_LABEL[kind];
  $('cineLabel').textContent = rotulo.toUpperCase() + (S.taker.isUser ? ' · SUA COBRANÇA' : ' · ' + (team === 0 ? 'AZUL' : 'VERMELHO'));
  if (kind !== 'falta') showToast(SP_LABEL[kind] + (S.taker.isUser ? ': sua cobrança' : team === 0 ? ' para o azul' : ' para o vermelho'));
  else if (S.wall.length) showToast('Barreira com ' + S.wall.length + (S.taker.isUser ? ' · sua cobrança' : ''));
}

// Você é atacante: só cobra falta no campo do adversário e se estiver por perto do lance.
// Falta lá atrás é do zagueiro/meia mais perto (como num time de verdade).
function voceCobra(spot) {
  return spot.x > 0 && dist2D(user, spot) < 28;
}

// Para onde cada jogador vai enquanto a cobrança não sai.
function restartTarget(p) {
  const S = G.sp;
  if (S && S.kind === 'penalti') {
    // Goleiro que defende: em cima da linha. Os outros: fora da área e fora da meia-lua (9,15 m),
    // espalhados dos dois lados.
    if (p.role === 'GK') return p.team !== S.team ? { x: S.side * (HALF_L - 0.4), z: 0 } : formationTarget(p, true);
    if (p.slotPen >= 0) {
      const i = p.slotPen, lado = i % 2 ? 1 : -1;
      return { x: S.side * (HALF_L - BOX.depth - 1.5 - (i % 3) * 1.2), z: clamp(lado * (6.8 + Math.floor(i / 2) * 3.2), -HALF_W + 2, HALF_W - 2) };
    }
  }
  if (S && S.kind === 'falta') {
    if (p.wallSlot >= 0 && S.wall[p.wallSlot]) return S.wall[p.wallSlot];
    const t = formationTarget(p, p.team === S.team);
    if (p.team !== S.team) afastarDe(t, S.ballSpot, 9.6);   // quem defende fica a 9,15 m da bola
    else afastarDe(t, S.ballSpot, 4);                         // companheiros dão espaço para o cobrador
    return t;
  }
  if (S && S.kind === 'escanteio' && p.slot >= 0) {
    const slots = p.team === S.team ? CORNER_ATTACK : CORNER_DEFEND;
    if (p.slot < slots.length) { const s = slots[p.slot]; return { x: S.side * (HALF_L - s[0] * ESC), z: s[1] * ESC_W * S.zs }; }   // escala com o campo
  }
  return formationTarget(p, S ? p.team === S.team : false);
}

// O time já está no lugar? (todo mundo da IA a menos de 3 m da sua posição)
function teamSettled(team) {
  for (const o of TEAMS[team]) {
    if (o.isUser || o.role === 'GK' || (G.sp && o === G.sp.taker)) continue;
    if (dist2D(o, restartTarget(o)) > 3) return false;
  }
  return true;
}

function updateRestart(dt) {
  const S = G.sp;
  if (!S || G.state !== 'restart') return;
  const p = S.taker;
  S.t += dt;
  if (S.phase !== 'set' && S.t > 14) { skipRestart(); return; }   // segurança: nunca trava
  // (4.1.3) Quem vai cobrar está no chão (goleiro depois do mergulho, jogador depois da falta)?
  // Primeiro termina a animação e LEVANTA; só então vai buscar a bola. Antes ele era "travado"
  // na pose do último quadro e ia andando deitado.
  if (S.phase === 'fetch' && levantandoParaCobrar(p, dt)) { S.t -= dt; return; }
  if (S.phase === 'fetch' && (S.kind === 'falta' || S.kind === 'penalti')) {
    // Falta: a bola já está no lugar; o cobrador só vai até ela.
    if (walkTo(p, S.stand.x, S.stand.z, 5.5, dt)) { S.phase = 'set'; S.t = 0; }
  } else if (S.phase === 'fetch') {
    // (4.1.3) Bola saiu do estádio ou foi parar longe: em vez de "o gandula devolver", usa uma
    // RESERVA — lateral: a bola do cone mais perto; escanteio: o goleiro adversário pega a dele
    // (no suporte atrás do gol) e joga para quem vai cobrar.
    const foraDoEstadio = Math.abs(ball.x) > BOARD_X + 0.3 || ball.z > BOARD_Z + 0.3 || ball.z < -(BOARD_ZN + 0.3);
    if (!S.onRack && !S.reserva && !ball.hidden && (foraDoEstadio || dist2D(ball, S.stand) > 10) && (S.kind === 'lateral' || S.kind === 'escanteio')) iniciarReserva(S);
    if (S.reserva && atualizarReserva(S, p, dt)) return;
    // Vai até a bola (mirando um pouco à frente se ela ainda rola); se ela está longe, vai para o local.
    let tx, tz;
    {
      const bx = ball.x + ball.vx * 0.3, bz = ball.z + ball.vz * 0.3;
      const dx = bx - p.x, dz = bz - p.z, d = Math.hypot(dx, dz) || 1;
      tx = bx - dx / d * 0.55; tz = bz - dz / d * 0.55;
    }
    walkTo(p, tx, tz, dist2D(p, { x: tx, z: tz }) > 10 ? 7 : 5, dt);
    if (dist2D(p, ball) < 1.1 && (ballSpeed() < 3 || S.gandula) && ball.y < 1.6) {
      S.phase = 'carry'; S.t = 0; S.onRack = false;
      p.carry = true;                              // pega a bola com as mãos
    }
  } else if (S.phase === 'carry') {
    p.guard = Math.max(0, p.guard - dt * 5);       // levando a bola: em pé, sem a postura de defesa
    const chegou = walkTo(p, S.stand.x, S.stand.z, 4.5, dt);
    attachBall(p);                                 // depois de andar: a bola acompanha as mãos no mesmo quadro
    if (chegou) { S.phase = 'set'; S.t = 0; }
  } else if (S.phase === 'set') {
    p.angle = turnToward(p.angle, S.face, 6 * dt);
    p.carry = false;
    if (S.kind === 'lateral' && !S.pe) { p.throwIn = true; attachBall(p); }
    else Object.assign(ball, { x: S.ballSpot.x, z: S.ballSpot.z, y: CONFIG.BALL_R, vx: 0, vy: 0, vz: 0 });
    const esperaBarreira = S.kind === 'falta' && !barreiraPronta(S) && S.t < 5;   // a cena espera a barreira se formar
    if (S.t > 0.5 && !esperaBarreira) startSetPieceWait();
  }
  if (S.phase !== 'set' && S.t > 12) skipRestart();  // segurança: nunca trava
}

function levantandoParaCobrar(p, dt) {
  if (p.diveT > 0) { p.diveT -= dt; const k = Math.max(0, p.diveT / (p.diveDur || 0.5)); p.x += (p.diveVX || 0) * k * dt; p.z += (p.diveVZ || 0) * k * dt; if (p.diveT <= 0) { p.fall = Math.max(p.fall, 1); p.fallKind = p.fallKind === 'frente' ? 'frente' : 'lado'; p.fallSide = p.diveSide || 1; } return true; }
  if (p.falling) { p.fall = Math.min(1, p.fall + dt * 2.8); if (p.fall >= 1) p.falling = false; return true; }
  if (p.perda) { p.perda.t += dt; if (p.perda.t >= p.perda.dur) p.perda = null; return true; }
  if (p.jumpT > 0) { p.jumpT = Math.max(0, p.jumpT - dt); return true; }
  if (p.fall > 0) { p.fall = Math.max(0, p.fall - dt * 2.2); p.vx = p.vz = 0; return true; }   // levantando
  p.stun = 0;
  return false;
}

// Começa a reposição com bola reserva (a bola do jogo vira "bola perdida" e some aos poucos).
function iniciarReserva(S) {
  Object.assign(lostBall, { x: ball.x, y: ball.y, z: ball.z, vx: ball.vx, vy: ball.vy, vz: ball.vz, life: 4 });
  ball.hidden = true; ball.vx = ball.vz = ball.vy = 0;
  if (S.kind === 'lateral') {
    const lado = conesBola.filter((c) => c.zs === S.zs);
    const cone = lado.filter((c) => c.present).sort((a, b) => Math.abs(a.x - S.stand.x) - Math.abs(b.x - S.stand.x))[0]
      || lado.sort((a, b) => Math.abs(a.x - S.stand.x) - Math.abs(b.x - S.stand.x))[0];
    S.reserva = { cone };
  } else {
    const gk = TEAMS[1 - S.team].find((q) => q.role === 'GK' && !q.out);
    const rack = spareOf(S.side);
    if (!gk) { S.reserva = { rack, direto: true }; return; }
    gk.scripted = true; gk.carry = false;
    S.reserva = { gk, rack, fase: 'vai', t: 0 };
  }
}
// Atualiza a reposição. Devolve true quando o cobrador já foi cuidado neste quadro.
function atualizarReserva(S, p, dt) {
  const R = S.reserva;
  if (R.cone) {
    if (!ball.hidden) return false;                // já está com ele (fase 'carry' cuida)
    const c = R.cone, alvo = { x: c.x, z: c.z - c.zs * 0.55 };   // do lado de dentro do cone
    walkTo(p, alvo.x, alvo.z, dist2D(p, alvo) > 10 ? 7 : 5, dt);
    if (dist2D(p, alvo) < 0.35) {
      c.present = false; ball.hidden = false;
      Object.assign(ball, { x: c.x, y: 0.48 + CONFIG.BALL_R, z: c.z, vx: 0, vy: 0, vz: 0 });
      S.phase = 'carry'; S.t = 0; p.carry = true;
    }
    return true;
  }
  if (R.direto) {                                  // (sem goleiro) a reserva aparece no canto
    R.rack.present = false; ball.hidden = false;
    Object.assign(ball, { x: S.ballSpot.x, y: CONFIG.BALL_R, z: S.ballSpot.z, vx: 0, vy: 0, vz: 0 });
    S.reserva = { rack: R.rack, feito: true };
    return false;
  }
  if (R.feito) return false;
  const gk = R.gk, rk = R.rack.mesh.position;
  R.t += dt;
  // O cobrador vai para o canto e espera virado para o goleiro.
  if (R.fase !== 'voando') {
    walkTo(p, S.stand.x, S.stand.z, dist2D(p, S.stand) > 10 ? 7 : 5, dt);
    if (dist2D(p, S.stand) < 0.2) p.angle = turnToward(p.angle, Math.atan2(gk.z - p.z, gk.x - p.x), 6 * dt);
  }
  if (R.fase === 'vai') {
    const alvo = { x: rk.x - S.side * 0.55, z: rk.z };
    walkTo(gk, alvo.x, alvo.z, 5, dt);
    if (dist2D(gk, alvo) < 0.3 || R.t > 6) {
      R.rack.present = false; ball.hidden = false; R.fase = 'lanca'; R.t = 0;
    }
  } else if (R.fase === 'lanca') {
    gk.vx = gk.vz = 0;
    gk.angle = turnToward(gk.angle, Math.atan2(p.z - gk.z, p.x - gk.x), 8 * dt);
    const f = gk.angle;
    Object.assign(ball, { x: gk.x + Math.cos(f) * 0.35, y: 1.25, z: gk.z + Math.sin(f) * 0.35, vx: 0, vy: 0, vz: 0 });
    gk.carry = true;
    // Joga quando o cobrador chegou no canto (ou depois de 6 s, por segurança).
    if ((dist2D(p, S.stand) < 0.5 && R.t > 0.5) || R.t > 6) {
      const dx = p.x - ball.x, dz = p.z - ball.z, d = Math.hypot(dx, dz) || 1;
      const T = clamp(0.55 + d * 0.045, 0.8, 1.6), y1 = 1.1;
      ball.vx = dx / T; ball.vz = dz / T; ball.vy = (y1 - ball.y + 0.5 * CONFIG.GRAVITY * T * T) / T;
      ball.lastKicker = gk; gk.carry = false; gk.throwAnim = 0.3; gk.scripted = false;
      R.fase = 'voando'; S.gandula = true;
      Som.toque(0.2);
    }
    return true;
  }
  return R.fase !== 'voando';
}

// "Pular": o cobrador já aparece no lugar com a bola; os outros continuam andando normalmente.
function skipRestart() {
  const S = G.sp;
  if (!S || G.state !== 'restart') return;
  const p = S.taker;
  if (S.reserva) {                                  // pulou no meio da reposição
    const R = S.reserva;
    if (R.cone) R.cone.present = false;
    if (R.rack) R.rack.present = false;
    if (R.gk) { R.gk.scripted = false; R.gk.carry = false; }
    ball.hidden = false;
  }
  p.x = S.stand.x; p.z = S.stand.z; p.angle = S.face; p.carry = false; S.onRack = false;
  if (S.kind === 'lateral' && !S.pe) p.throwIn = true;
  startSetPieceWait();
}

function startSetPieceWait() {
  const S = G.sp, p = S.taker;
  S.phase = 'wait'; S.waitT = 0;
  p.angle = S.face; p.vx = p.vz = 0; p.carry = false;
  p.scripted = false;
  p.throwIn = S.kind === 'lateral' && !S.pe;
  p.goalKick = S.kind === 'tiro de meta';
  p.setPiece = S.kind;
  $('skipBtn').hidden = true; $('cineLabel').textContent = '';
  setLetterbox(false);                             // volta para a câmera de jogo
  G.state = 'play'; G.roleT = 0;
  givePossession(p, { silent: true });
  // Sua cobrança já começa na SETA (sem a tela intermediária): mire no gol para chutar ou num
  // companheiro para tocar/cruzar. Lateral já é o arremesso. Sem relógio e sem câmera lenta.
  // Falta e pênalti: você se afasta uns passos da bola para a corrida (ver updateCobrador).
  if (p.isUser && (S.kind === 'falta' || S.kind === 'penalti')) p.bolaFixa = { x: S.ballSpot.x, z: S.ballSpot.z };
  if (p.isUser) startKick(S.kind === 'lateral' ? 'pass' : 'shot');
}

// ---------------------------------------------------------------------
// COBRANÇA COM CORRIDA (v16) — falta e pênalti seus.
//   Mirando/força/efeito: você fica ~2,4 m atrás da bola, na linha da seta e um pouco à
//   esquerda (chute de direita), e acompanha a seta se ela mudar.
//   Escolheu tudo: corre até a bola acelerando, a perna vai para trás no penúltimo passo e
//   a batida acontece quando o pé chega na bola (a física do chute é a mesma de sempre).
// ---------------------------------------------------------------------
function updateCobrador(dt) {
  const u = user, B = u.bolaFixa;
  if (!B) return;
  const k = G.kick;
  if (!k || G.possession !== u || !KICK_STATES.includes(G.state)) { u.bolaFixa = null; G.corrida = null; return; }
  const ang = Math.atan2(k.dirZ, k.dirX), fx = Math.cos(ang), fz = Math.sin(ang);
  const R = G.corrida;
  let tx, tz, vmax;
  if (!R) { tx = B.x - fx * 2.4 + fz * 0.9; tz = B.z - fz * 2.4 - fx * 0.9; vmax = 2.6; }        // esquerda = (fz, −fx)
  else { R.t += dt; R.v = Math.min(6, R.v + dt * 9); tx = B.x - fx * 0.55 + fz * 0.12; tz = B.z - fz * 0.55 - fx * 0.12; vmax = R.v; }
  const dx = tx - u.x, dz = tz - u.z, d = Math.hypot(dx, dz);
  const v = d > 0.01 ? Math.min(vmax, R ? vmax : d * 4) : 0;
  const passo = Math.min(d, v * dt);
  if (d > 0.01) { u.x += dx / d * passo; u.z += dz / d * passo; }
  u.vx = d > 0.01 ? dx / d * v : 0; u.vz = d > 0.01 ? dz / d * v : 0;
  u.anim += v * 2.6 * dt;
  if (!R) { u.angle = turnToward(u.angle, Math.atan2(B.z - u.z, B.x - u.x), 8 * dt); return; }   // de frente para a bola
  u.angle = turnToward(u.angle, d > 0.6 ? Math.atan2(dz, dx) : ang, 10 * dt);
  // Perna para trás ~0,19 s antes de chegar (é quando o balanço da perna encontra a bola).
  if (!R.balanco && (d - passo) / Math.max(1, v) < 0.19) { R.balanco = true; u.kickT = 0.35; }
  // (conta o que falta DEPOIS do passo deste quadro: outras regras empurram o jogador uns centímetros)
  if (d - passo < 0.06 || R.t > 2) {
    const kt = u.kickT;
    u.angle = ang; u.bolaFixa = null; G.corrida = null;
    executeUserKick();
    if (kt > 0) u.kickT = kt;                      // não recomeça a animação (ela já está no meio)
  }
}

// A IA cobra só depois de o time se posicionar e escolhe a melhor opção (nada aleatório, nem sempre você).
function aiSetPiece(p, dt) {
  const S = G.sp;
  S.waitT += dt;
  const ready = S.waitT > 1.5 && (teamSettled(p.team) || S.waitT > 6 || G.pen);
  if (!ready) return { vx: 0, vz: 0 };
  const r = pickSetPieceTarget(p, S.kind);
  const d = dist2D(p, r);
  if (S.kind === 'penalti') { aiPenalti(p); return { vx: 0, vz: 0 }; }
  if (S.kind === 'falta' && S.dGoal < 30 && S.motivo !== 'impedimento') { aiChuteDeFalta(p); return { vx: 0, vz: 0 }; }
  if (S.kind === 'lateral') passTo(p, r, false, S.pe ? 'short' : 'throw');
  else if (S.kind === 'escanteio') passTo(p, r, false, 'cross');
  else passTo(p, r, false, d > 26 ? 'long' : undefined);
  if (r === user) G.userRequest = 0;
  return { vx: 0, vz: 0 };
}

// Avalia cada companheiro: livre de marcação, distância boa para o tipo de cobrança e progresso.
// kind: 'lateral' | 'escanteio' | 'tiro de meta' | 'goleiro' (goleiro repondo com a mão/chutão)
function pickSetPieceTarget(p, kind) {
  let best = null, bs = -Infinity;
  const opps = opponentsOf(p);
  for (const t of teamOf(p)) {
    if (t === p || t.role === 'GK') continue;
    const d = dist2D(p, t), open = nearestOf(opps, t).d, fwd = (t.x - p.x) * p.dir;
    let s;
    if (kind === 'lateral') {
      if (d < 4 || d > 22) continue;
      s = Math.min(open, 8) * 1.4 + fwd * 0.2 - Math.max(0, d - 14) * 0.4;
    } else if (kind === 'escanteio') {
      const inBox = Math.abs(t.x - Math.sign(p.x) * HALF_L) < BOX.depth && Math.abs(t.z) < BOX.half;
      if (!inBox) continue;
      s = Math.min(open, 6) * 1.5 - Math.abs(t.z) * 0.1;
    } else {
      if (d < 8) continue;
      let blocked = false;
      for (const o of opps) if (distPointSegment(o, p, t) < 2) { blocked = true; break; }
      // Saída curta se tiver alguém livre perto; senão, bola longa para quem estiver livre lá na frente.
      s = d < 28 ? (open > 7 && !blocked ? 12 + open : -5) : (open > 4 ? 4 + fwd * 0.08 + open : -10);
    }
    if (t.isUser && G.userRequest > 0) s += 4;    // você pediu: entra como boa opção, não obrigatória
    s += rand(0, 0.6);
    if (s > bs) { bs = s; best = t; }
  }
  return best || nearestOf(teamOf(p), p, p).p;
}

// ---------------------------------------------------------------------
// FALTAS, CARTÕES E CARRINHO
//   - Desarme por trás é falta (dê o bote de frente ou de lado).
//   - Cada falta conta para o jogador: na 3ª, cartão amarelo; na 5ª, segundo amarelo = vermelho.
//   - Carrinho por trás que não pega a bola: vermelho direto.
//   - Expulso sai andando para fora do campo e o time joga com um a menos.
//     Se for você, a partida acaba.
//   Simplificação por enquanto: falta dentro da área vira falta na entrada da área (sem pênalti).
// ---------------------------------------------------------------------
// Último homem: nenhum companheiro de linha dele está mais perto do próprio gol que o atacante.
function ultimoHomem(def, atacante, contarTodos) {
  const gol = -def.dir * HALF_L;
  for (const t of TEAMS[def.team]) {
    if ((t === def && !contarTodos) || t.role === 'GK' || t.out) continue;
    if (Math.abs(t.x - gol) < Math.abs(atacante.x - gol)) return false;
  }
  return true;
}

// O "tacler" está atrás de quem tem a bola? (mais de ~115° em relação para onde a vítima olha)
function porTras(tacler, vitima) {
  const dx = tacler.x - vitima.x, dz = tacler.z - vitima.z, d = Math.hypot(dx, dz) || 1;
  return (dx * Math.cos(vitima.angle) + dz * Math.sin(vitima.angle)) / d < -0.42;
}

function commitFoul(off, vic, info = {}) {
  if (G.state !== 'play' && !KICK_STATES.includes(G.state)) return;
  if (off.out || off.role === 'GK') return;
  off.fouls = (off.fouls || 0) + 1;
  let card = null;
  if (info.red) card = 'vermelho';
  else if (off.fouls >= 5 && off.yellow) card = 'vermelho';                  // segundo amarelo
  else if (off.fouls >= 3 && !off.yellow) card = 'amarelo';
  if (card === 'amarelo') off.yellow = true;
  // (4.1.1) Por trás: empurrão nas costas — braços esticados para a frente e um passo de impacto.
  if (info.porTras) {
    off.empurrao = 0.55;
    const dx = vic.x - off.x, dz = vic.z - off.z, d = Math.hypot(dx, dz) || 1;
    off.angle = Math.atan2(dz, dx); off.dash = 0.15; off.dashVX = dx / d * 4; off.dashVZ = dz / d * 4;
  }
  // A vítima cai (tropeço de frente) e a bola para ali.
  vic.stun = Math.max(vic.stun, 1.8); vic.falling = true; vic.fallKind = 'frente'; vic.fallSide = Math.random() < 0.5 ? 1 : -1;
  if (G.kick) { G.kick = null; hideKickUI(); }
  G.possession = null;
  ball.vx *= 0.15; ball.vz *= 0.15; ball.vy = Math.min(ball.vy, 0);
  if (off.isUser) G.stats.faltas++;
  if (vic.isUser) G.stats.faltasSofridas++;
  talvezLesionar(vic, info.tipo === 'carrinho' ? 2 : 1);   // falta pode machucar (carrinho: o dobro)
  referee.refPose = 'apito'; referee.refPoseT = 1.3; Som.apito(0.4);
  showToast((info.tipo === 'carrinho' ? 'Carrinho faltoso de ' : 'Falta de ') + nomeDe(off) + '!', off.team === 0 ? 'bad' : 'good');
  iniciarParalisacao({ team: vic.team, spot: { x: vic.x, z: vic.z }, off, vic, card, reason: 'falta' });
}

// Jogo parado (falta ou impedimento): juiz vai até o lance, mostra o cartão se tiver, e aí
// começa a cena da cobrança (barreira + cobrador).
function iniciarParalisacao(F) {
  // Gol de quem cometeu a falta (o time que defende) = o gol que o time da cobrança ataca.
  // (Até a v11 o sinal estava trocado: a área conferida era a do outro lado do campo.)
  const s = F.spot, defGoal = (F.team === 0 ? 1 : -1) * HALF_L;
  // Falta dentro da área: PÊNALTI (bola na marca, a 11 m do gol). Impedimento nunca vira pênalti.
  if (F.reason === 'falta' && Math.abs(s.x - defGoal) < BOX.depth && Math.abs(s.z) < BOX.half) {
    F.penalti = true; s.x = defGoal + Math.sign(-defGoal) * PEN_SPOT; s.z = 0;
  }
  s.x = clamp(s.x, -HALF_L + 2, HALF_L - 2); s.z = clamp(s.z, -HALF_W + 1.5, HALF_W - 1.5);
  F.t = 0; F.cardShown = false;
  G.foul = F; G.offside = null; G.passTarget = null;
  G.recv = null; G.recvFx = null; esconderRecepcao(); user.recvPose = null;
  if (G.cine) { user.scripted = false; G.cine.opp.scripted = false; G.cine = null; }
  G.state = 'foul'; G.targetScale = 0.6;
  hideKickUI();
  setLetterbox(true);
  $('cineLabel').textContent = F.reason === 'impedimento' ? 'IMPEDIMENTO' : F.reason === 'lesao' ? 'ATENDIMENTO' : F.penalti ? 'PÊNALTI' : 'FALTA';
  if (F.penalti) showBanner('PÊNALTI!', F.team);
  $('skipBtn').hidden = false;
}

function updateFoul(rdt) {
  const F = G.foul;
  if (!F || G.state !== 'foul') return;
  F.t += rdt;
  if (F.t > 0.6) G.targetScale = 1;
  if (F.card && !F.cardShown && F.t > 1.3) mostrarCartao(F);
  if (F.t > (F.card ? 3.6 : 2.0)) iniciarCobrancaFalta(F);
}

function mostrarCartao(F) {
  F.cardShown = true;
  referee.refPose = 'cartao'; referee.refPoseT = 1.8;
  referee.cartao.material.color.setHex(F.card === 'amarelo' ? 0xffd400 : 0xe02020);
  const p = F.off;
  if (p.isUser) G.stats.cartoes += F.card === 'amarelo' ? 'A' : 'V';
  showToast((F.card === 'amarelo' ? 'Cartão amarelo para ' : 'Cartão vermelho! Expulso: ') + nomeDe(p), p.team === 0 ? 'bad' : 'good');
  if (F.card === 'vermelho') expulsar(p);
}

function expulsar(p) {
  p.out = true; p.red = true;
  const lista = TEAMS[p.team], i = lista.indexOf(p);
  if (i >= 0) lista.splice(i, 1);                   // a IA para de contar com ele
  p.saida = { x: p.x, z: Math.sign(p.z || 1) * (HALF_W + 6) };
  if (p.isUser) setTimeout(() => { if (G.state !== 'end') endMatch('expulso'); }, 1600);
}

// O expulso sai andando para fora do campo e some.
function updateExpulsos(dt) {
  for (const p of players) {
    if (!p.out || !p.saida) continue;
    p.scripted = true;
    if (walkTo(p, p.saida.x, p.saida.z, 3, dt)) { p.mesh.raiz.visible = false; p.saida = null; p.x = 999; p.z = 999; }
  }
}

function pularParalisacao() {
  const F = G.foul;
  if (!F || G.state !== 'foul') return;
  if (F.card && !F.cardShown) mostrarCartao(F);
  iniciarCobrancaFalta(F);
}

function iniciarCobrancaFalta(F) {
  if (F.reason === 'impedimento' && F.replayImp && !F.replayFeito) {   // antes da cobrança: replay com a linha
    F.replayFeito = true;
    iniciarReplayImpedimento(F.replayImp, () => iniciarCobrancaFalta(F));
    return;
  }
  G.foul = null;
  Object.assign(ball, { x: F.spot.x, y: CONFIG.BALL_R, z: F.spot.z, vx: 0, vy: 0, vz: 0, spinSide: 0, spinVert: 0, hidden: false });
  startRestart(F.penalti ? 'penalti' : 'falta', F.team, { x: F.spot.x, z: F.spot.z }, F.reason);
}

// Carrinho: desliza ~0,6 s. Se o pé pega a bola, desarme limpo. Se pega o adversário antes da bola,
// é falta — e por trás é vermelho direto.
function startSlide(p, alvo) {
  if (p.slideT > 0 || p.stun > 0 || p.out) return false;
  const dx = alvo.x - p.x, dz = alvo.z - p.z, d = Math.hypot(dx, dz) || 1;
  p.slideT = p.slideDur = 0.6; p.slideDX = dx / d; p.slideDZ = dz / d;
  p.angle = Math.atan2(dz, dx); p.slideGotBall = false; p.slideHit = false;
  return true;
}
// Ficou parado com a bola uns 5 s? O adversário mais perto vem e toma a bola com um desarme
// limpo (sem falta). Mexer-se (ou tocar/chutar) zera o contador.
function updateParadoComBola(dt) {
  const u = user;
  const conta = G.state === 'play' && G.possession === u && !G.sp && !G.kickoffPending && !u.throwIn && Math.hypot(u.vx, u.vz) < 0.6;
  u.paradoT = conta ? (u.paradoT || 0) + dt : 0;
  const L = G.desarmeLimpo;
  if (!L && u.paradoT > 2.2) {                     // (4.1.1) 2,2 s parado com a bola: o mais perto vem tomar
    const o = TEAMS[1].filter((p) => p.role !== 'GK' && !p.out && p.stun <= 0).sort((a, b) => dist2D(a, u) - dist2D(b, u))[0];
    if (o) G.desarmeLimpo = { p: o, t: 0 };
  }
  if (!G.desarmeLimpo) return;
  const D = G.desarmeLimpo;
  D.t += dt;
  if (G.possession !== u || G.state !== 'play' || D.t > 6) { G.desarmeLimpo = null; return; }
  if (dist2D(D.p, u) < 1.2) {
    D.p.tackle = 1; D.p.angle = Math.atan2(u.z - D.p.z, u.x - D.p.x);
    if (Math.random() > 0.8) { D.p.stun = 0.6; G.desarmeLimpo = null; u.paradoT = 0; showToast('Ele errou o bote! Saia daí', 'good'); return; }   // tentativa: 80%
    givePossession(D.p, { silent: true });
    perderBola(u); u.paradoT = 0; G.stats.perdas++;
    showToast('Ficou parado demais: desarmado!', 'bad');
    G.desarmeLimpo = null;
  }
}

function updateSlides(dt) {
  for (const p of players) {
    if (p.slidePose > 0 && !(p.slideT > 0) && p.stun <= 0.2) p.slidePose = Math.max(0, p.slidePose - dt * 3);
    if (!(p.slideT > 0)) continue;
    p.slideT -= dt;
    p.slidePose = Math.min(1, (p.slidePose || 0) + dt * 6);
    if (p.slideT <= 0) { p.stun = Math.max(p.stun, 0.45); continue; }   // levantando
    if (G.state !== 'play' || p.slideGotBall || p.slideHit) continue;
    const pe = { x: p.x + p.slideDX * 0.75, z: p.z + p.slideDZ * 0.75 };
    // 0) Carrinho POR TRÁS: se o corpo chega no adversário, ele é atingido antes da bola
    //    (a bola está na frente dele) → falta, e vermelho direto por não ter acertado a bola.
    let atingido = null;
    for (const o of TEAMS[1 - p.team]) if (o.role !== 'GK' && dist2D(p, o) <= 1.0) { atingido = o; break; }   // pernas esticadas alcançam o calcanhar
    if (atingido && porTras(p, atingido)) {
      p.slideHit = true;
      commitFoul(p, atingido, { tipo: 'carrinho', red: true });
      continue;
    }
    // 1) Pegou a bola?
    const dono = G.possession;
    if (dist2D(pe, ball) < 0.75 && ball.y < 0.7 && dono !== p) {
      p.slideGotBall = true;
      if (dono && dono.team !== p.team) { perderBola(dono, Math.random() < 0.55 ? 'queda' : 'joelho'); if (dono.isUser) G.stats.perdas++; }
      G.possession = null;
      const a = Math.atan2(p.slideDZ, p.slideDX) + rand(-0.5, 0.5), sp = rand(5, 8);
      kickBall(p, Math.cos(a) * sp, 0.4, Math.sin(a) * sp);
      p.kickT = 0; p.controlCd = 0.6;
      if (p.isUser) { G.stats.desarmes++; showToast('Carrinho na bola!', 'good'); }
      continue;
    }
    // 2) Pegou o adversário antes da bola?
    for (const o of TEAMS[1 - p.team]) {
      if (o.role === 'GK' || dist2D(p, o) > 0.85) continue;
      p.slideHit = true;
      commitFoul(p, o, { tipo: 'carrinho', red: porTras(p, o) });
      break;
    }
  }
}

// ---------------------------------------------------------------------
// COBRANÇA DE FALTA COM BARREIRA
//   Perto do gol (até ~34 m), o time que defende monta a barreira a 9,15 m da bola, na linha do gol
//   (2 a 4 jogadores, mais gente quanto mais perto). Os outros ficam a pelo menos 9,15 m.
//   Se a falta é a favor do seu time, VOCÊ cobra, no mesmo esquema do chute (mira, força, efeito)
//   ou do passe. A IA chuta por cima da barreira quando está perto, senão toca.
// ---------------------------------------------------------------------
function montarBarreira(S) {
  const atk = S.team === 0 ? 1 : -1, gx = atk * HALF_L;
  const dx = gx - S.ballSpot.x, dz = -S.ballSpot.z, d = Math.hypot(dx, dz) || 1;
  S.dGoal = d;
  S.wall = [];
  for (const p of players) p.wallSlot = -1;
  if (d > 34) return;
  const n = d < 20 ? 4 : d < 27 ? 3 : 2;
  const ux = dx / d, uz = dz / d, px = -uz, pz = ux;
  const lado = Math.sign(S.ballSpot.z) || 1;       // barreira cobre o lado da trave mais perto
  const cx = S.ballSpot.x + ux * 9.15, cz = S.ballSpot.z + uz * 9.15;
  const defensores = TEAMS[1 - S.team].filter((p) => p.role !== 'GK' && !p.isUser)
    .sort((a, b) => dist2D(a, S.ballSpot) - dist2D(b, S.ballSpot)).slice(0, n);
  defensores.forEach((p, i) => {
    const off = (i - (n - 1) / 2) * 0.62 + lado * 0.5 * Math.sign(pz * lado || 1);
    S.wall.push({ x: cx + px * off, z: cz + pz * off });
    p.wallSlot = i;
  });
}

function barreiraPronta(S) {
  for (const p of players) if (p.wallSlot >= 0 && S.wall[p.wallSlot] && dist2D(p, S.wall[p.wallSlot]) > 0.45) return false;
  return true;
}

// IA batendo pênalti: canto (85%) ou no meio, meia altura, forte.
function aiPenalti(p) {
  const gx = p.dir * HALF_L;
  const tz = Math.random() < 0.15 ? rand(-0.4, 0.4) : (Math.random() < 0.5 ? -1 : 1) * rand(GOAL_HALF - 1.1, GOAL_HALF - 0.4);
  const ty = rand(0.3, 1.9);
  const dx = gx - ball.x, dz = tz - ball.z, D = Math.hypot(dx, dz) || 1;
  const sp = rand(21, 27), T = D / sp;
  const vy = (ty - ball.y + 0.5 * CONFIG.GRAVITY * T * T) / T;
  p.angle = Math.atan2(dz, dx);
  kickBall(p, dx / D * sp, vy, dz / D * sp);
  ball.isShot = true;
}

// Goleiro no pênalti: escolhe um lado na hora do chute (40% cada canto, 20% fica) e pula já.
// Se acertar o lado, a bola passa perto das mãos e a defesa é decidida como num chute normal.
function goleiroAdivinha(gk) {
  if (!gk || gk.out) return;
  const r = Math.random(), lado = r < 0.4 ? -1 : r < 0.8 ? 1 : 0;
  if (lado === 0) { gk.jumpT = 0.5; return; }
  gk.diveDur = 0.65; gk.diveT = gk.diveDur;
  gk.diveVX = 0; gk.diveVZ = lado * 5.5; gk.diveTipo = Math.random() < 0.6 ? 'baixo' : 'alto';
  gk.diveSide = Math.sign(lado * Math.cos(gk.angle)) || 1;
}

// IA cobrando falta perto do gol: por cima da barreira, no canto do outro lado.
function aiChuteDeFalta(p) {
  const S = G.sp, atk = p.dir, gx = atk * HALF_L;
  const lado = -(Math.sign(S.ballSpot.z) || 1);
  const tz = lado * (GOAL_HALF - 0.7), ty = rand(1.4, 2.2);
  const dx = gx - ball.x, dz = tz - ball.z, D = Math.hypot(dx, dz) || 1;
  const sp = rand(19, 24), T = D / sp, tw = 9.15 / sp;
  let vy = (ty - ball.y + 0.5 * CONFIG.GRAVITY * T * T) / T;
  const vyBarreira = (2.35 - ball.y + 0.5 * CONFIG.GRAVITY * tw * tw) / tw;   // passar por cima da barreira
  vy = Math.max(vy, vyBarreira);
  p.angle = Math.atan2(dz, dx);
  kickBall(p, dx / D * sp, vy, dz / D * sp);
  ball.isShot = true;
}

// ---------------------------------------------------------------------
// 12. AÇÕES DO SEU JOGADOR
// Chute: mira → força → efeito.   Passe e lateral: mira → força.
// ---------------------------------------------------------------------
function startKick(kind) {
  if (G.state !== 'play' || G.possession !== user) return;
  // Bola parada: a câmera começa atrás de você, na direção da cobrança (antes ela vinha da
  // cena e a seta "para cima" podia apontar para fora do campo).
  if (user.setPiece || user.throwIn) cam.yaw = user.angle;
  const a0 = kind === 'shot' ? Math.atan2(-user.z, HALF_L - user.x) : user.angle;
  G.kick = {
    kind, throwIn: user.throwIn, dirX: Math.cos(a0), dirZ: Math.sin(a0), aimed: false,
    target: null, dist: 0, power: 0, over: 0, miss: 0, zone: [0, 1],
    ox: 0, oy: 0, spinT: 0, spinChosen: false, powerLabel: '',
    timer: CONFIG.KICK_TIME_LIMIT,                 // tempo para decidir (real, não sofre a câmera lenta)
    semLimite: !!user.setPiece || !!user.throwIn,   // bola parada (falta, escanteio, lateral): sem relógio
    yawRef: cam.yaw,                               // a mira usa a câmera do começo (a câmera gira depois)
    windup: 0,                                     // 0→1: preparação do chute em câmera lenta
  };
  G.state = 'aim'; G.targetScale = G.kick.semLimite ? 1 : CONFIG.SLOWMO_AIM;   // só a seta gira; bola parada não precisa de câmera lenta
  if (joy.id !== null) {
    aimPad.id = joy.id; aimPad.onJoy = true;
    aimPad.ox = joy.cx; aimPad.oy = joy.cy;
    aimPad.dx = joy.x * JOY_R; aimPad.dy = joy.y * JOY_R;
    joy.id = null; joy.x = joy.y = 0;
    applyAimVector();
    drawAimKnob();
  }
  showStage('aim');
}

function applyAimVector() {
  const len = Math.hypot(aimPad.dx, aimPad.dy);
  if (len < 12 || !G.kick) return;
  const w = screenToWorld(-aimPad.dy / len, aimPad.dx / len, G.kick.yawRef);  // a seta segue o dedo (câmera do começo da mira)
  setAimDir(w.x, w.z);
}
function setAimDir(dirX, dirZ) {
  const k = G.kick;
  k.dirX = dirX; k.dirZ = dirZ; k.aimed = true;
  k.target = k.kind === 'pass' ? findPassAssist(dirX, dirZ) : (k.kind === 'shot' ? alvoCruzamento(dirX, dirZ) : null);
  if (k.kind === 'shot') {
    k.cruzar = !!k.target;
    k.toqueCurto = !!k.target && dist2D(user, k.target) < 16;   // perto: toque rasteiro em vez de cruzamento
    $('stageKind').textContent = k.cruzar ? (k.toqueCurto ? 'PASSE' : 'CRUZAMENTO') : 'CHUTE';
  }
}

// CHUTAR / CRUZAR: se a seta aponta para o gol, é chute. Se aponta para um companheiro (e não
// para o gol), vira cruzamento para ele: a bola vai pelo alto e a IA dele domina ou finaliza.
function alvoCruzamento(dx, dz) {
  if (user.setPiece === 'penalti') return null;   // pênalti é chute
  const ang = Math.atan2(dz, dx);
  const O = user.bolaFixa || user;                // cobrança com corrida: conta a partir da bola
  const a1 = Math.atan2(-GOAL_HALF - 0.6 - O.z, HALF_L - O.x), a2 = Math.atan2(GOAL_HALF + 0.6 - O.z, HALF_L - O.x);
  const lo = Math.min(a1, a2), hi = Math.max(a1, a2);
  if (Math.abs(HALF_L - O.x) > 1 && ang >= lo && ang <= hi) return null;   // mirando no gol
  let best = null, bestDiff = 0.3;
  for (const t of TEAMS[0]) {
    if (t === user || t.role === 'GK') continue;
    const d = dist2D(user, t);
    if (d < 6 || d > 48) continue;
    const diff = Math.abs(wrapAngle(Math.atan2(t.z - user.z, t.x - user.x) - ang));
    if (diff < bestDiff) { bestDiff = diff; best = t; }
  }
  return best;
}

function findPassAssist(dx, dz) {
  let best = null, bestDiff = 0.45;
  for (const t of TEAMS[0]) {
    if (t === user) continue;
    const d = dist2D(user, t);
    if (d < 3 || d > 45) continue;
    const ang = Math.atan2(t.z - user.z, t.x - user.x);
    const diff = Math.abs(wrapAngle(ang - Math.atan2(dz, dx)));
    if (diff < bestDiff) { bestDiff = diff; best = t; }
  }
  return best;
}

function confirmAim() {
  if (G.state !== 'aim') return;
  const k = G.kick;
  if (k.target) {
    const tx = k.target.x + k.target.vx * 0.5, tz = k.target.z + k.target.vz * 0.5;
    const dx = tx - user.x, dz = tz - user.z, d = Math.hypot(dx, dz) || 1;
    k.dirX = dx / d; k.dirZ = dz / d; k.dist = d;
  }
  enterPower();
}

const power = { holding: false, t0: 0, value: 0, id: null };

function enterPower() {
  const k = G.kick;
  if (k.kind === 'shot') k.zone = CONFIG.SHOT_SWEET.slice();
  else if (k.target) {
    const s = clamp(5 + k.dist * 0.6, CONFIG.PASS_SPEED[0], CONFIG.PASS_SPEED[1]);
    const p = (s - CONFIG.PASS_SPEED[0]) / (CONFIG.PASS_SPEED[1] - CONFIG.PASS_SPEED[0]);
    k.zone = [clamp(p - 0.08, 0.03, 0.9), clamp(p + 0.08, 0.1, 0.98)];
  } else k.zone = [0.3, 0.55];
  $('powerZone').style.bottom = (k.zone[0] / 1.15 * 100) + '%';
  $('powerZone').style.height = ((k.zone[1] - k.zone[0]) / 1.15 * 100) + '%';
  power.holding = false; power.value = 0;
  $('powerFill').style.height = '0%';
  G.state = 'power';
  showStage('power');
}

function startPowerHold(id) {
  if (G.state !== 'power' || power.holding) return;
  power.holding = true; power.t0 = performance.now(); power.value = 0; power.id = id;
}

function updatePowerMeter() {
  if (!power.holding) return;
  power.value = (performance.now() - power.t0) / 1000 / CONFIG.POWER_FILL_TIME;
  if (power.value >= 1.15) { power.value = 1.15; releasePower(); }
  $('powerFill').style.height = (Math.min(power.value, 1.15) / 1.15 * 100) + '%';
}

function releasePower() {
  if (!power.holding || G.state !== 'power') return;
  power.holding = false;
  const k = G.kick, v = power.value;
  k.power = Math.min(1, v);
  k.over = Math.max(0, v - 1);
  k.miss = v < k.zone[0] ? k.zone[0] - v : v > k.zone[1] ? v - k.zone[1] : 0;
  k.powerLabel = k.miss === 0 ? 'Força certa!' : k.miss < 0.08 ? 'Quase na faixa' : (v > k.zone[1] ? 'Forte demais' : 'Fraco demais');
  if (k.kind === 'pass') { showToast(k.powerLabel, k.miss === 0 ? 'good' : ''); executeUserKick(); return; } // passe: só 2 etapas
  G.state = 'spin'; k.spinT = 0; k.spinChosen = false;
  $('spinDot').hidden = true;
  $('spinInfo').textContent = k.powerLabel + ' · toque na bola';
  showStage('spin');
}

function chooseSpin(ox, oy) {
  const k = G.kick;
  if (!k || k.spinChosen) return;
  k.spinChosen = true; k.ox = ox; k.oy = oy;
  const dot = $('spinDot');
  dot.hidden = false; dot.style.left = (50 + ox * 50) + '%'; dot.style.top = (50 + oy * 50) + '%';
  $('spinInfo').textContent = describeSpin(ox, oy);
  setTimeout(() => { if (G.state === 'spin' && G.kick === k) executeUserKick(); }, 380);
}

function describeSpin(ox, oy) {
  const parts = [];
  if (oy > 0.3) parts.push('sobe'); else if (oy < -0.3) parts.push('sai baixa e cai rápido');
  if (ox > 0.25) parts.push('curva para a esquerda'); else if (ox < -0.25) parts.push('curva para a direita');
  return parts.length ? 'A bola ' + parts.join(' e ') : 'Batida reta, sem efeito';
}

function executeUserKick() {
  const k = G.kick, u = user;
  if (u.bolaFixa && !G.corrida) {                  // falta/pênalti: primeiro a corrida até a bola
    k.spinChosen = true;
    hideKickUI();
    G.corrida = { t: 0, v: 1.5, balanco: false };
    return;
  }
  if (k.kind === 'shot' && k.cruzar && k.target) {
    // Cruzamento: a força e o efeito escolhidos mexem na precisão (fora da faixa = cruza torto).
    const torto = k.miss > 0.12 || k.over > 0.08;
    passTo(u, k.target, torto, k.toqueCurto ? undefined : 'cross');
    ball.spinSide = k.ox * 0.6; ball.spinVert = Math.max(0, k.oy) * 0.3;
    ball.userPass = true; ball.cruzamento = { team: u.team, alvo: k.target };
    G.stats.passes++;
    G.kick = null; G.state = 'play'; G.targetScale = 1;
    hideKickUI();
    showToast(torto ? (k.toqueCurto ? 'Passe torto!' : 'Cruzou torto!') : (k.toqueCurto ? 'Passe para ' : 'Cruzamento para ') + k.target.name, torto ? 'bad' : 'good');
    return;
  }
  const [mn, mx] = k.kind === 'shot' ? CONFIG.SHOT_SPEED : CONFIG.PASS_SPEED;
  let speed = lerp(mn, mx, k.power);
  if (k.throwIn) speed = Math.min(speed, CONFIG.THROW_MAX);
  const errMax = Math.min(0.5, k.miss * 1.6 + k.over * 1.2);
  const ang = Math.atan2(k.dirZ, k.dirX) + rand(-1, 1) * errMax;
  const low = Math.max(0, k.oy), high = Math.max(0, -k.oy);
  let vyFrac = k.kind === 'shot' ? 0.07 + low * 0.33 - high * 0.05 : 0.02 + low * 0.42;
  vyFrac += k.over * 0.6;
  if (k.kind === 'shot' && k.power > k.zone[1]) vyFrac += k.miss * 0.5;
  if (k.throwIn) vyFrac = Math.max(vyFrac, 0.22);
  vyFrac = clamp(vyFrac, 0.01, 0.8);
  // CAVADINHA: chute fraco (força abaixo de 50%) pegando bem embaixo da bola (efeito "sobe"
  // forte): a bola sobe alto e cai devagar — encobre o goleiro ADIANTADO.
  // v15: ela não é mais perfeita sempre. A qualidade (0 a 1) vem de três coisas:
  //   força perto de 32% (forte demais passa do gol, fraca demais cai na mão dele),
  //   tocar bem embaixo da bola (efeito "sobe" no máximo) e a mira (erro da barra).
  // Mal batida, ela cai CURTA (no colo do goleiro) ou LONGA (por cima do travessão).
  const cavadinha = k.kind === 'shot' && !k.cruzar && k.oy > 0.5 && k.power < 0.5;
  let vy = Math.max(0.3, speed * vyFrac);
  let hsp = speed * Math.sqrt(1 - vyFrac * vyFrac);
  let qualCav = 0;
  if (cavadinha) {
    const dGol = Math.hypot(HALF_L - u.x, u.z);
    const qForca = 1 - clamp(Math.abs(k.power - 0.32) / 0.2, 0, 1);
    const qToque = clamp((k.oy - 0.5) / 0.4, 0, 1);
    const qMira = 1 - clamp(errMax / 0.3, 0, 1);
    qualCav = qForca * 0.45 + qToque * 0.25 + qMira * 0.3;
    // Onde ela cai: perfeita = 0,5 m depois da linha. Ruim = até 5 m antes ou 3 m depois.
    const erro = (1 - qualCav) * (k.power < 0.32 ? -rand(1.5, 5) : rand(1, 3));
    vy = clamp(5 + dGol * 0.22, 6.5, 9.5);
    hsp = Math.max(4, dGol + 0.5 + erro) / (2 * vy / CONFIG.GRAVITY);
    showToast(qualCav > 0.65 ? 'Cavadinha!' : 'Cavadinha mal batida', qualCav > 0.65 ? 'good' : 'bad');
  }
  kickBall(u, Math.cos(ang) * hsp, vy, Math.sin(ang) * hsp, cavadinha ? 0 : k.ox, cavadinha ? 0 : k.oy, k.throwIn);  // sai de onde a bola está
  if (k.kind === 'shot') { ball.isShot = true; ball.userShot = true; G.stats.chutes++; ball.distChute = Math.hypot(HALF_L - u.x, u.z); ball.cavadinha = cavadinha; if (cavadinha) marcarCavadinha(1, qualCav); }
  else { ball.userPass = true; G.stats.passes++; }
  G.kick = null;
  G.state = 'play'; G.targetScale = 1;
  hideKickUI();
  if (k.kind === 'shot') checarCenaDoAngulo();
}

// Chute indo no ângulo (pode entrar, bater na trave ou sair por pouco)? Cena lenta com cortes.
function checarCenaDoAngulo() {
  const pr = predictShot();
  if (pr && pr.t > 0.35) {
    const az = Math.abs(pr.z);
    const pertoDaTrave = Math.abs(az - GOAL_HALF) < 0.8 && pr.y < CONFIG.GOAL_H + 0.5;
    const pertoDoTravessao = Math.abs(pr.y - CONFIG.GOAL_H) < 0.5 && az < GOAL_HALF + 0.8;
    if (pertoDaTrave || pertoDoTravessao) startShotCine(pr);
  }
}

// Simula a bola (mesma física do jogo, sem jogadores) até ela chegar na linha do gol adversário.
function predictShot() {
  const b = { x: ball.x, y: ball.y, z: ball.z, vx: ball.vx, vy: ball.vy, vz: ball.vz, ss: ball.spinSide, sv: ball.spinVert };
  const R = CONFIG.BALL_R, h = 1 / 120;
  for (let t = 0; t < 3; t += h) {
    const hs = Math.hypot(b.vx, b.vz);
    if (hs > 0.5) { const ax = (b.vz / hs) * b.ss * CONFIG.CURVE, az = (-b.vx / hs) * b.ss * CONFIG.CURVE; b.vx += ax * h; b.vz += az * h; }
    const air = b.y > R + 0.02;
    b.vy += (-CONFIG.GRAVITY + (air ? b.sv * CONFIG.LIFT : 0)) * h;
    if (air) { const dr = 1 - 0.06 * h; b.vx *= dr; b.vz *= dr; }
    b.x += b.vx * h; b.y += b.vy * h; b.z += b.vz * h;
    if (b.y < R) { b.y = R; if (b.vy < -1.2) { b.vy = -b.vy * 0.5; b.vx *= 0.88; b.vz *= 0.88; b.ss *= 0.6; b.sv *= 0.5; } else b.vy = 0; }
    if (b.y <= R + 0.001 && b.vy === 0) {
      const s = Math.hypot(b.vx, b.vz);
      if (s < 0.3) return null;
      const ns = Math.max(0, s - (0.45 * s + 1.2) * ATRITO * h); b.vx *= ns / s; b.vz *= ns / s; b.ss *= Math.max(0, 1 - 3 * h); b.sv = 0;
    }
    b.ss *= Math.exp(-0.35 * h);
    if (b.x >= HALF_L) return { t, z: b.z, y: b.y };
  }
  return null;
}

// Cena do chute no ângulo: tudo em câmera lenta, faixas de cinema e 3 cortes de câmera
// (atrás da bola → de lado, perto do gol → de trás do gol) até sair o resultado.
function startShotCine(pr) {
  G.shotCine = { t: 0, pr, seg: -1, cut: true, crossT: 0 };
  G.timeScale = G.targetScale = CONFIG.SHOT_CINE_SLOWMO;
  setLetterbox(true);
}
function updateShotCine(rdt) {
  const S = G.shotCine;
  if (!S) return;
  S.t += rdt;
  const seg = S.t < 1.0 ? 0 : S.t < 2.0 ? 1 : 2;
  if (seg !== S.seg) { S.seg = seg; S.cut = true; }
  if (!S.crossT && ball.x > HALF_L + 0.3) S.crossT = S.t;
  const acabou = G.state !== 'play' || G.possession || (S.crossT && S.t - S.crossT > 0.8) || S.t > 7 ||
    (ballSpeed() < 2 && ball.y < 0.5) || ball.vx < 0;
  if (!acabou) return;
  G.shotCine = null;
  setLetterbox(G.state === 'restart');             // se saiu, a cena da bola parada continua com as faixas
  if (G.state === 'play' || G.state === 'restart') G.targetScale = 1;
  if (G.state === 'restart' && G.sp && G.sp.kind === 'tiro de meta') showToast('Pra fora, por pouco!', 'bad');
}
function shotCameraGoal() {
  const S = G.shotCine;
  const hs = Math.hypot(ball.vx, ball.vz) || 1, dx = ball.vx / hs, dz = ball.vz / hs;
  const zs = Math.sign(S.pr.z) || 1;
  if (S.seg <= 0) return { px: ball.x - dx * 3 - dz * 0.8, py: ball.y + 0.9, pz: ball.z - dz * 3 + dx * 0.8, tx: ball.x + dx * 4, ty: ball.y, tz: ball.z + dz * 4 };
  if (S.seg === 1) return { px: HALF_L - 6, py: 1.3, pz: S.pr.z + zs * 8, tx: ball.x, ty: ball.y, tz: ball.z };
  return { px: HALF_L + 5.5, py: 1.7, pz: S.pr.z * 0.4, tx: ball.x, ty: ball.y, tz: ball.z };
}

// Passou do tempo: o jogador fura (chute) ou erra o passe — a bola sai fraca e torta.
function furar() {
  const k = G.kick;
  if (!k) return;
  const a = user.angle + rand(-1.4, 1.4), sp = rand(2.5, 4.5);
  kickBall(user, Math.cos(a) * sp, 0.3, Math.sin(a) * sp);
  if (k.kind === 'shot') G.stats.chutes++; else G.stats.passes++;
  G.kick = null; G.state = 'play'; G.targetScale = 1;
  hideKickUI();
  showToast(k.kind === 'shot' ? 'Furou! Demorou demais' : 'Errou o passe: demorou demais', 'bad');
}

// Atualiza o relógio do chute, a preparação e confere se o marcador roubou a bola.
function updateKickClock(rdt) {
  if (!KICK_STATES.includes(G.state) || !G.kick) return;
  if (G.possession !== user) {                     // roubaram enquanto você decidia
    G.kick = null; G.state = 'play'; G.targetScale = 1;
    hideKickUI();
    showToast('Roubaram a bola!', 'bad');
    return;
  }
  const k = G.kick;
  if (!k.semLimite) k.timer -= rdt;
  k.windup = Math.min(1, k.windup + rdt / 1.5);
  const f = $('kickTimerFill');
  f.style.transform = 'scaleX(' + Math.max(0, k.timer / CONFIG.KICK_TIME_LIMIT).toFixed(3) + ')';
  setClass(f, 'low', k.timer < 2);
  if (k.timer <= 0) furar();
}

function cancelKick() {
  if (!['aim', 'power', 'spin'].includes(G.state)) return;
  if (G.kick && G.kick.semLimite) return;          // bola parada: não tem para onde voltar
  G.kick = null; G.state = 'play'; G.targetScale = 1;
  hideKickUI();
}

// ---------------------------------------------------------------------
// RECEPÇÃO DE BOLA (domínio de pé, de peito, cabeceio e finalização acrobática)
// Mesma LÓGICA do minigame de martelar do Super Lan Master (o visual é o deste jogo): o marcador
// laranja vai e volta na barra em velocidade constante e você "bate" com ele dentro da faixa
// verde. Uma batida só, 2 s (tempo real). A barra fica no alto, igual às etapas do chute.
//
// A altura em que a bola vai chegar decide o que dá para fazer:
//   até 0,9 m ............ domínio de pé
//   0,9 a 1,5 m .......... domínio no peito
//   1,5 a 1,95 m ......... pulo + domínio no peito
//   1,95 a 2,9 m ......... por cima da cabeça: CABECEAR (toca para o companheiro mais perto)
//                          ou FINALIZAR (cabeçada se estiver de frente para o gol; voleio se de
//                          lado; bicicleta se de costas)
//   acima de 2,9 m ....... passa por cima, não dá para alcançar
// Bola muito rápida, quebrada ou no limite da altura pode dar errado MESMO acertando o tempo.
// ---------------------------------------------------------------------
const RECV = {
  JANELA: 2,                                       // segundos (reais) para martelar
  VEL: 1.0,                                        // velocidade do marcador (trilhos por segundo)
  FOLGA: 0.025,                                    // tolerância nas bordas da faixa verde
  ZONA: { pe: 0.26, peito: 0.22, peitoPulo: 0.2, alto: 0.2 },
  ALT: { pe: 0.9, peito: 1.5, peitoPulo: 1.95, alto: 2.9 },
};
const POSE_DUR = { peito: 0.6, peitoPulo: 0.65, cabeca: 0.7, bicicleta: 1.1, voleio: 0.95 };
const CONTATO_T = { pe: 0.2, peito: 0.22, peitoPulo: 0.26, cabeca: 0.26, bicicleta: 0.42, voleio: 0.36 };

// Simula a bola (e você andando) por até 1 s e diz quando e em que altura ela chega em você.
function predictArrival() {
  const u = user, R = CONFIG.BALL_R, h = 1 / 60;
  const b = { x: ball.x, y: ball.y, z: ball.z, vx: ball.vx, vy: ball.vy, vz: ball.vz };
  let ux = u.x, uz = u.z, quicou = false;
  for (let t = 0; t < 1.0; t += h) {
    b.vy -= CONFIG.GRAVITY * h;
    b.x += b.vx * h; b.y += b.vy * h; b.z += b.vz * h;
    if (b.y < R) { b.y = R; if (b.vy < -1.2) { b.vy = -b.vy * 0.5; quicou = true; } else b.vy = 0; }
    ux += u.vx * h; uz += u.vz * h;
    // (4.0.0) Bola caindo que passa na altura do PEITO pouco antes de chegar: você dá o passo
    // e mata no peito (até 2,4 m; antes a bola só era "vista" a 0,9 m, quando já estava na altura do pé, e
    // lançamento nunca virava domínio no peito). Sorteado uma vez por chute (60%).
    const dh = Math.hypot(b.x - ux, b.z - uz);
    if (ball.querPeito && dh < 2.4 && b.vy < -1.5 && b.y > RECV.ALT.pe + 0.05 && b.y < RECV.ALT.peito - 0.05)
      return { t, y: b.y, sp: Math.hypot(b.vx, b.vy, b.vz), vh: Math.hypot(b.vx, b.vz), vy: b.vy, quicou };
    if (dh < 0.9) return { t, y: b.y, sp: Math.hypot(b.vx, b.vy, b.vz), vh: Math.hypot(b.vx, b.vz), vy: b.vy, quicou };
  }
  return null;
}

// Como a bola REALMENTE chega em você (medido na previsão, não pelo tipo de passe):
//   vh = velocidade horizontal (m/s)   vy = velocidade vertical   y = altura   quicando = pingando
// Antes o jogo olhava a marca "passe quebrado" do lançamento, então um passe quebrado que já
// tinha perdido força chegava rasteiro e devagar e mesmo assim "dava errado". Agora vale o que
// a bola está fazendo na hora.
const CHEGADA = {
  AUTO_VH: 15,          // rasteira até 15 m/s (e sem pingar forte): domínio automático, sem minigame
  ALTURA_FACIL: 0.7,    // acima disso já precisa de domínio (peito, cabeça...)
  RAPIDA: 19,           // a partir daqui começa o risco de escapar mesmo acertando o tempo
  MUITO_RAPIDA: 24,
  PINGANDO_VY: 3,       // subindo/descendo mais rápido que isso perto do pé = bola pingando
};
function avaliarChegada(pr) {
  const vh = pr.vh ?? pr.sp, vy = pr.vy || 0;
  const pingando = (pr.quicou || Math.abs(vy) > CHEGADA.PINGANDO_VY) && pr.y < RECV.ALT.pe;
  const precisaMinigame = pr.y > CHEGADA.ALTURA_FACIL || vh > CHEGADA.AUTO_VH || (pingando && vh > 6);
  return { vh, pingando, precisaMinigame };
}

// Para onde você está virado em relação ao gol adversário decide o tipo de finalização.
function tipoFinalizacao() {
  const toGoal = Math.atan2(-user.z, HALF_L - user.x);
  const ang = Math.abs(wrapAngle(toGoal - user.angle));
  const tipo = ang < 1.05 ? 'cabecada' : ang < 2.1 ? 'voleio' : 'bicicleta';
  // Cabeçada ao gol só DENTRO da área; voleio e bicicleta até um pouco fora dela (~5 m).
  // Fora disso não tem finalização aérea — só o cabeceio de passe.
  const fundo = HALF_L - user.x, lat = Math.abs(user.z);
  const naArea = fundo < BOX.depth && lat < BOX.half;
  const pertoDaArea = fundo < BOX.depth + 5 && lat < BOX.half + 3;
  if (tipo === 'cabecada') return naArea ? tipo : null;
  return pertoDaArea ? tipo : null;
}
const NOME_FIN = { cabecada: 'CABEÇADA AO GOL', voleio: 'VOLEIO', bicicleta: 'BICICLETA' };

function startReceive(pr) {
  const kind = pr.y < RECV.ALT.pe ? 'pe' : pr.y < RECV.ALT.peito ? 'peito' : pr.y < RECV.ALT.peitoPulo ? 'peitoPulo' : 'alto';
  // Risco de dar errado mesmo acertando o tempo — pela bola de verdade (velocidade, pingo, altura).
  const av = avaliarChegada(pr);
  let risco = 0, motivo = '';
  if (av.vh > CHEGADA.MUITO_RAPIDA) { risco += 0.7; motivo = 'veio rápida demais'; }
  else if (av.vh > CHEGADA.RAPIDA) { risco += 0.3; motivo = 'veio muito forte'; }
  if (av.pingando && av.vh > 8) { risco += 0.25; motivo = motivo || 'veio pingando'; }
  if (kind === 'peitoPulo' && pr.y > 1.8) { risco += 0.3; motivo = motivo || 'veio alta demais'; }
  if (kind === 'alto' && pr.y > 2.6) { risco += 0.4; motivo = motivo || 'veio alta demais'; }
  risco = Math.min(0.9, risco);
  // DOMÍNIO DIFÍCIL (v17): em vez do sorteio, a barra ganha um PONTO AZUL bem pequeno (~3 vezes a
  // largura do marcador) dentro da faixa verde. Azul = DOMÍNIO PERFEITO (cena em câmera lenta).
  // Verde = não domina, mas a culpa é do passe (não conta como erro seu). Fora = erro seu.
  // (Só no domínio — pé, peito, pulo + peito. Bola alta continua como era.)
  // v19: vale para QUALQUER domínio com risco (antes só a partir de 50%, então a maioria das
  // bolas difíceis ainda caía no sorteio antigo de "acertou o tempo, mas a bola escapou").
  const dificil = risco > 0 && kind !== 'alto';
  const R = {
    kind, pr, risco, motivo, dificil, forcedMiss: !dificil && Math.random() < risco, fin: tipoFinalizacao(),
    t: 0, pos: 0, dir: 1, zona: { ini: 0, fim: 0 }, azul: null, done: false,
  };
  const tam = RECV.ZONA[kind];
  R.zona.ini = 0.06 + Math.random() * (0.88 - tam); R.zona.fim = R.zona.ini + tam;
  R.pos = R.zona.ini > 0.5 ? Math.random() * 0.15 : 0.85 + Math.random() * 0.1;   // começa longe da faixa
  R.dir = R.pos > 0.5 ? -1 : 1;
  G.recv = R;
  G.state = 'trap';
  G.timeScale = G.targetScale = CONFIG.SLOWMO_TRAP;
  if (kind !== 'alto') G.stats.dominios++;
  // Monta a tela do minigame.
  const titulos = { pe: 'DOMÍNIO', peito: 'PEITO', peitoPulo: 'PULO + PEITO', alto: 'BOLA ALTA' };
  const kEl = $('recvKind');
  const rotuloDificil = dificil || risco >= 0.5;
  kEl.textContent = titulos[kind] + (rotuloDificil ? ' · DIFÍCIL' : '');
  kEl.className = rotuloDificil ? 'dificil' : '';
  const zonaEl = $('hamZone');
  zonaEl.style.left = (R.zona.ini * 100) + '%'; zonaEl.style.width = (tam * 100) + '%';
  zonaEl.classList.remove('flash'); $('hamTrack').classList.remove('erro');
  // Botões redondos no lugar dos botões de ação (os de jogo somem enquanto isso).
  const B = $('recvActs');
  B.innerHTML = '';
  const botao = (txt, acao, slot, principal) => {
    const b = document.createElement('button');
    b.className = 'act ' + slot + (principal ? ' primary' : '');
    b.textContent = txt;
    b.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); martelar(acao); });
    B.appendChild(b);
  };
  if (kind === 'alto') {
    botao('CABECEAR', 'cabecear', R.fin ? 's2' : 's1', !R.fin);
    if (R.fin) botao(NOME_FIN[R.fin].replace(' AO GOL', ''), 'finalizar', 's1', true);
  }
  else botao('DOMINAR', 'dominar', 's1', true);
  $('recvInfo').textContent = kind === 'alto' ? 'Bata na faixa verde. Cabecear toca no companheiro mais perto.'
    : dificil ? 'Passe difícil: só o ponto AZUL domina' : 'Bata quando o marcador estiver na faixa verde';
  $('recvInfo').className = '';
  G.recvHideT = 0;
  $('recvLayer').hidden = false;
  document.body.classList.add('recebendo');
  // Ponto azul: medido depois de a barra aparecer (precisa da largura real em pixels).
  let azulEl = $('hamAzul');
  if (!azulEl) {
    azulEl = document.createElement('div'); azulEl.id = 'hamAzul';
    azulEl.style.cssText = 'position:absolute;top:0;bottom:0;background:#2a72d6;border-left:2px solid #9cc4ff;border-right:2px solid #9cc4ff;box-sizing:border-box;';
    $('hamTrack').insertBefore(azulEl, $('hamMarker'));
  }
  azulEl.hidden = !dificil;
  if (dificil) {
    const larg = $('hamTrack').getBoundingClientRect().width || 320, marc = $('hamMarker').getBoundingClientRect().width || 8;
    const tamAzul = clamp(3 * marc / larg, 0.035, 0.12);
    const ini = R.zona.ini + 0.15 * tam + Math.random() * Math.max(0, 0.7 * tam - tamAzul);   // dentro do verde, longe das bordas
    R.azul = { ini, fim: ini + tamAzul };
    azulEl.style.left = (ini * 100) + '%'; azulEl.style.width = (tamAzul * 100) + '%';
  }
  desenharMartelo();
}

function esconderRecepcao() {
  G.recvHideT = 0;
  $('recvLayer').hidden = true;
  document.body.classList.remove('recebendo');
}

function desenharMartelo() {
  const R = G.recv; if (!R) return;
  $('hamMarker').style.left = (R.pos * 100).toFixed(2) + '%';
  const resta = Math.max(0, 1 - R.t / RECV.JANELA);
  const f = $('recvTimerFill');
  f.style.transform = 'scaleX(' + resta.toFixed(3) + ')';
  f.classList.toggle('low', resta < 0.3);
}

// Roda em tempo REAL (não sofre a câmera lenta).
function updateReceive(rdt) {
  const R = G.recv;
  if (R && !R.done) {
    R.t += rdt;
    R.pos += R.dir * RECV.VEL * rdt;
    if (R.pos >= 1) { R.pos = 2 - R.pos; R.dir = -1; }
    if (R.pos <= 0) { R.pos = -R.pos; R.dir = 1; }
    desenharMartelo();
    if (R.t >= RECV.JANELA) resolveReceive(null, false, false);
  }
  // Esconde a barra um pouco depois da batida. Esse contador é separado do G.recv, porque o
  // G.recv é apagado assim que a jogada termina (era isso que deixava a tela presa na v9).
  if (G.recvHideT > 0) { G.recvHideT -= rdt; if (G.recvHideT <= 0) esconderRecepcao(); }
  updateRecvFx(rdt);
  updateRecvPose(rdt);
}

// A batida do martelo (botão, toque na barra ou Espaço).
function martelar(acao) {
  const R = G.recv;
  if (!R || R.done) return;
  if (!acao) acao = R.kind === 'alto' ? 'cabecear' : 'dominar';   // bater na barra / Espaço na bola alta = cabecear (o seguro)
  if (acao === 'finalizar' && !R.fin) acao = 'cabecear';
  const naFaixa = R.pos >= R.zona.ini - RECV.FOLGA && R.pos <= R.zona.fim + RECV.FOLGA;
  const info = $('recvInfo');
  if (R.dificil) {
    const noAzul = R.pos >= R.azul.ini && R.pos <= R.azul.fim;   // sem folga: é para ser difícil
    Som.clique(noAzul ? 'perfeito' : naFaixa ? 'ok' : 'erro');
    if (noAzul) { info.textContent = 'PERFEITO!'; info.className = 'ok'; $('hamAzul').style.background = '#9cc4ff'; }
    else if (naFaixa) { info.textContent = 'O passe veio ruim demais — não foi culpa sua'; info.className = ''; }
    else { info.textContent = 'Fora da faixa!'; info.className = 'bad'; $('hamTrack').classList.add('erro'); }
    R.perfeito = noAzul; R.culpaDoPasse = !noAzul && naFaixa;
    resolveReceive(acao, noAzul, naFaixa);
    return;
  }
  const ok = naFaixa && !R.forcedMiss;
  Som.clique(naFaixa ? 'ok' : 'erro');
  if (ok) { info.textContent = 'Na medida!'; info.className = 'ok'; $('hamZone').classList.add('flash'); }
  else if (naFaixa) { info.textContent = 'Acertou o tempo, mas a bola ' + (R.motivo || 'veio difícil') + '!'; info.className = 'bad'; }
  else { info.textContent = 'Fora da faixa!'; info.className = 'bad'; $('hamTrack').classList.add('erro'); }
  resolveReceive(acao, ok, naFaixa);
}

function resolveReceive(acao, ok) {
  const R = G.recv;
  R.done = true; G.recvHideT = 0.6;
  G.targetScale = 1;                               // o jogo volta à velocidade normal (você continua andando)
  if (R.kind === 'alto' && !acao) {                // não tentou nada: a bola passa por cima
    G.recv = null; G.state = 'play'; G.recvIgnore = 1.0;
    esconderRecepcao();
    return;
  }
  if (!acao) acao = 'dominar';                     // tempo esgotado no domínio: a bola bate e escapa
  let pose = null;
  if (R.kind === 'peito' || R.kind === 'peitoPulo') pose = R.kind;
  else if (R.kind === 'alto') pose = acao === 'cabecear' || R.fin === 'cabecada' ? 'cabeca' : R.fin;
  user.recvPose = pose ? { kind: pose, t: 0, dur: POSE_DUR[pose], side: Math.random() < 0.5 ? 1 : -1 } : null;
  G.recvFx = { t: 0, from: { x: ball.x, y: ball.y, z: ball.z }, contactT: CONTATO_T[pose || 'pe'], kind: R.kind, acao, ok, pose, fin: R.fin, fase: 'ida',
    perfeito: !!R.perfeito, culpaDoPasse: !!R.culpaDoPasse, passador: ball.lastKicker };
  if (R.perfeito) iniciarDominioPerfeito(G.recvFx);
}

// DOMÍNIO PERFEITO: faixas de cinema, tudo em câmera lenta e a bola chegando devagar no pé/peito.
// A pose de peito também anda mais devagar (dur maior). Acaba em fimRecepcao.
function iniciarDominioPerfeito(F) {
  F.contactT = 0.85;                               // a bola leva ~0,85 s (real) até o contato
  if (user.recvPose) user.recvPose.dur *= 2.2;
  G.targetScale = G.timeScale = 0.12;
  setLetterbox(true);
  showBanner('DOMÍNIO PERFEITO', 0, 2.6, true);    // (4.1.1) letreiro menor
  G.dominioPerfeito = true;
  G.recvHideT = 0.25;                              // a barra sai logo, para a cena aparecer
}

// Altura do pulo na pose de recepção (para posicionar a bola no peito/cabeça/pé).
function puloRecepcao(rp) {
  if (!rp) return 0;
  const u = clamp(rp.t / rp.dur, 0, 1);
  if (rp.kind === 'peitoPulo') return Math.sin(u * Math.PI) * 0.55;
  if (rp.kind === 'cabeca') return Math.sin(u * Math.PI) * 0.5;
  if (rp.kind === 'bicicleta') return u < 0.5 ? Math.sin(u / 0.5 * Math.PI / 2) * 0.9 : 0.9 - (u - 0.5) / 0.5 * 0.73;
  if (rp.kind === 'voleio') return u < 0.6 ? Math.sin(u / 0.6 * Math.PI / 2) * 0.6 : 0.6 - (u - 0.6) / 0.4 * 0.45;
  return 0;
}
const INCL_PEITO = 0.18;
function pontoContato(pose) {
  const c = Math.cos(user.angle), s = Math.sin(user.angle), j = puloRecepcao(user.recvPose);
  if (pose === 'peito' || pose === 'peitoPulo') {
    // Frente do peito (0,16 m do centro + raio da bola) a 1,15 m, girada junto com o tronco.
    const rp = user.recvPose, inc = rp ? INCL_PEITO * Math.sin(clamp(rp.t / rp.dur, 0, 1) * Math.PI) : 0;
    const lx = 0.16 + CONFIG.BALL_R + 0.01, ly = 1.15;
    const fx = lx * Math.cos(inc) - ly * Math.sin(inc), fy = lx * Math.sin(inc) + ly * Math.cos(inc);
    return { x: user.x + c * fx, y: fy + j, z: user.z + s * fx };
  }
  const P = { pe: [0.62, CONFIG.BALL_R], peito: [0.33, 1.12], peitoPulo: [0.33, 1.12], cabeca: [0.18, 2.08], bicicleta: [0.1, 1.35], voleio: [0.45, 1.0] }[pose || 'pe'];
  return { x: user.x + c * P[0], y: P[1] + j, z: user.z + s * P[0] };
}
function pontoPe() { return { x: user.x + Math.cos(user.angle) * 0.62, y: CONFIG.BALL_R, z: user.z + Math.sin(user.angle) * 0.62 }; }

// A bola vai (em tempo real) até o ponto de contato e aí acontece o resultado.
function updateRecvFx(rdt) {
  const F = G.recvFx;
  if (!F) return;
  F.t += rdt;
  if (F.fase === 'ida') {
    const c = pontoContato(F.pose), k = smooth(Math.min(1, F.t / F.contactT));
    ball.x = lerp(F.from.x, c.x, k); ball.y = lerp(F.from.y, c.y, k); ball.z = lerp(F.from.z, c.z, k);
    if (k >= 1) contatoRecepcao(F);
  } else if (F.fase === 'desce') {                 // domínio no peito: a bola escorre até o pé
    const p = pontoPe(), k = smooth(Math.min(1, (F.t - F.t0) / (F.perfeito ? 0.7 : 0.28)));
    ball.x = lerp(F.c0.x, p.x, k); ball.y = lerp(F.c0.y, p.y, k); ball.z = lerp(F.c0.z, p.z, k);
    if (k >= 1) { fimRecepcao(); givePossession(user); }
  } else if (F.fase === 'segura') {               // domínio perfeito de pé: bola colada no pé por 0,5 s
    const p = pontoPe(); ball.x = p.x; ball.y = p.y; ball.z = p.z;
    if (F.t - F.t0 > 0.5) { fimRecepcao(); givePossession(user); showToast('Dominou!', 'good'); }
  }
}

function contatoRecepcao(F) {
  if (G.offside && G.offside.set.has(user)) { fimRecepcao(); callOffside(user); return; }
  if (G.offside) G.offside = null;
  if (F.kind !== 'alto') {
    if (F.ok) {
      G.stats.dominiosOk++;
      if (F.kind === 'pe') {
        if (F.perfeito) { F.fase = 'segura'; F.t0 = F.t; return; }   // segura a cena mais um pouquinho com a bola no pé
        fimRecepcao(); givePossession(user); showToast('Dominou!', 'good');
      }
      else { F.fase = 'desce'; F.t0 = F.t; F.c0 = { x: ball.x, y: ball.y, z: ball.z }; showToast('Matou no peito!', 'good'); }
    } else {
      bolaEscapa();
      if (F.culpaDoPasse) {                        // verde no difícil: erro do passe, não seu
        G.stats.dominios = Math.max(0, G.stats.dominios - 1);
        const p = F.passador;
        showToast(p && p !== user && p.team === user.team ? 'Passe ruim de ' + p.name : 'A bola veio impossível', '');
      }
      fimRecepcao();
    }
    return;
  }
  if (F.acao === 'cabecear') { if (F.ok) cabecearPasse(); else toqueTorto('Cabeceou mal'); }
  else if (F.ok) finalizarAereo(F.fin);
  else toqueTorto(F.fin === 'cabecada' ? 'Cabeçada torta' : 'Pegou mal na bola');
  fimRecepcao();
}

function fimRecepcao() {
  if (G.dominioPerfeito) {                         // fim da cena: tira as faixas e o letreiro
    G.dominioPerfeito = false;
    setLetterbox(false);
    $('banner').className = '';
  }
  G.recvFx = null; G.recv = null;
  if (G.state === 'trap') G.state = 'play';
  G.targetScale = 1; G.recvIgnore = 0.6;
}

function bolaEscapa() {
  const a = user.angle + rand(-1.2, 1.2), s = rand(4, 7);
  Object.assign(ball, {
    vx: Math.cos(a) * s, vz: Math.sin(a) * s, vy: rand(2, 4), spinSide: 0, spinVert: 0,
    broken: false, lastKicker: user, userPass: false, userShot: false, isShot: false,
  });
  G.possession = null; G.lastTouch = user; user.controlCd = 0.7;
  showToast('A bola escapou!', 'bad');
}

// Cabeceio de passe: direção automática para o companheiro mais perto.
function cabecearPasse() {
  let alvo = null, bd = Infinity;
  for (const t of TEAMS[0]) { if (t === user || t.role === 'GK') continue; const d = dist2D(user, t); if (d < bd) { bd = d; alvo = t; } }
  if (!alvo) { toqueTorto('Ninguém para receber'); return; }
  const tx = alvo.x + alvo.vx * 0.5, tz = alvo.z + alvo.vz * 0.5;
  const dx = tx - ball.x, dz = tz - ball.z, d = Math.hypot(dx, dz) || 1;
  const sp = clamp(5 + d * 0.55, 7, 15);
  user.angle = Math.atan2(dz, dx);
  kickBall(user, dx / d * sp, 2.5 + d * 0.06, dz / d * sp);
  user.kickT = 0;                                  // é de cabeça: sem a animação da perna
  ball.userPass = true; G.stats.passes++;
  G.passTarget = { p: alvo, x: tx, z: tz, t: 3 };
  showToast('Cabeceou para ' + alvo.name, 'good');
}

// Finalização aérea direto para o gol (sem precisar mirar).
function finalizarAereo(tipo) {
  const tz = rand(-(GOAL_HALF - 0.8), GOAL_HALF - 0.8), ty = rand(0.5, 2.0);
  const dx = HALF_L - ball.x, dz = tz - ball.z, D = Math.hypot(dx, dz) || 1;
  const sp = tipo === 'cabecada' ? rand(16, 20) : rand(20, 25);
  const T = D / sp;
  const vy = (ty - ball.y + 0.5 * CONFIG.GRAVITY * T * T) / T;
  if (tipo === 'cabecada') user.angle = Math.atan2(dz, dx);
  kickBall(user, dx / D * sp, vy, dz / D * sp);
  if (tipo === 'cabecada') user.kickT = 0;
  ball.isShot = true; ball.userShot = true; G.stats.chutes++;
  showToast({ cabecada: 'Cabeçada!', voleio: 'Voleio!', bicicleta: 'Bicicleta!' }[tipo], 'good');
  checarCenaDoAngulo();
}

function toqueTorto(msg) {
  const a = user.angle + rand(-2, 2), sp = rand(4, 9);
  kickBall(user, Math.cos(a) * sp, rand(1.5, 4), Math.sin(a) * sp);
  user.kickT = 0;
  showToast(msg, 'bad');
}

// Pose de recepção anda em tempo real; no fim da bicicleta/voleio você cai e levanta.
function updateRecvPose(rdt) {
  for (const p of players) {                     // vale para você e para a IA (cabeceio, voleio, bicicleta)
    const rp = p.recvPose;
    if (!rp) continue;
    rp.t += rdt;
    if (rp.t >= rp.dur) {
      if (rp.kind === 'bicicleta') { p.fall = 1; p.fallKind = 'costas'; p.stun = Math.max(p.stun, 0.9); }
      if (rp.kind === 'voleio') { p.fall = 1; p.fallKind = 'lado'; p.fallSide = rp.side; p.stun = Math.max(p.stun, 0.7); }
      p.recvPose = null;
    }
  }
}

// Desenho das poses de recepção (chamado no fim do syncMeshes, por cima de tudo).
// Poses de quem perdeu a bola (ver perderBola). 'queda' usa a queda de frente de sempre.
function aplicarPerda(p, m) {
  const P = p.perda, u = clamp(P.t / P.dur, 0, 1);
  if (P.tipo === 'passinhos') {
    const f = 1 - u;
    m.raiz.rotation.x = Math.sin(P.t * 15) * 0.16 * f;                   // balança de um lado para o outro
    m.corpo.rotation.z = -0.12 * f + Math.sin(P.t * 11) * 0.12 * f;       // e para a frente/trás
    m.bracoE.rotation.x = 0.25 + 0.9 * f; m.bracoD.rotation.x = -0.25 - 0.9 * f;   // braços abertos
    m.bracoE.rotation.z = 0.35 * f; m.bracoD.rotation.z = 0.35 * f;
    const bal = Math.sin(p.anim) * 0.5 * f;                               // passos curtos
    m.pernaE.rotation.z = bal; m.pernaD.rotation.z = -bal;
  } else if (P.tipo === 'joelho') {
    // Desce em 22% do tempo, fica apoiado, levanta nos últimos 32%. Conta (perna 0,74 m):
    // quadril a 0,42 m do chão; perna de trás reta para baixo com a canela deitada para trás
    // (joelho no chão); perna da frente com a coxa ~96° à frente e a canela em pé (pé no chão).
    const k = u < 0.22 ? smooth(u / 0.22) : u < 0.68 ? 1 : 1 - smooth((u - 0.68) / 0.32);
    const esq = P.lado < 0;                                               // perna da frente = esquerda?
    const pf = esq ? m.pernaE : m.pernaD, pt = esq ? m.pernaD : m.pernaE;
    pf.rotation.z = 1.68 * k; pt.rotation.z = -0.05 * k;
    const jf = -1.68 * k, jt = -1.57 * k;
    if (esq) usarJoelhos(m, jf, jt); else usarJoelhos(m, jt, jf);
    m.raiz.position.y = -0.32 * k; m.raiz.rotation.x = 0; m.raiz.rotation.z = 0;
    m.corpo.rotation.z = -0.12 * k; m.corpo.position.y = 0;
    const bf = esq ? m.bracoE : m.bracoD, bt = esq ? m.bracoD : m.bracoE;  // mão no joelho da frente
    bf.rotation.z = 0.9 * k; bt.rotation.z = -0.5 * k;
    bf.rotation.x = (esq ? 0.15 : -0.15) * k; bt.rotation.x = (esq ? -0.35 : 0.35) * k;
  }
}

function aplicarPoseRecepcao(p, m) {
  const rp = p.recvPose, u = clamp(rp.t / rp.dur, 0, 1), w = Math.sin(u * Math.PI);
  let frente = 0, tomb = 0, incl = 0, aZL = 0, aZR = 0, aXL = 0.2, aXR = -0.2, lL = 0, lR = 0;
  let yLado = 0;
  if (rp.kind === 'peito' || rp.kind === 'peitoPulo') {
    // (4.0.0) Inclinação pequena: o "corpo" gira a partir dos PÉS, então 0,45 jogava o peito
    // ~0,5 m para trás e a bola ficava solta no ar na frente da barriga. A bola agora encosta
    // no peito de verdade (ver pontoContato).
    incl = INCL_PEITO * w;
    aZL = aZR = 0.5 * w; aXL = 0.8 * w; aXR = -0.8 * w;
    if (rp.kind === 'peitoPulo') { lL = 0.4 * w; lR = -0.25 * w; }
  } else if (rp.kind === 'cabeca') {
    incl = u < 0.35 ? 0.35 * (u / 0.35) : u < 0.6 ? lerp(0.35, -0.5, (u - 0.35) / 0.25) : lerp(-0.5, 0, (u - 0.6) / 0.4);
    aZL = aZR = 1.0 * w; aXL = 0.6 * w; aXR = -0.6 * w; lL = 0.45 * w; lR = -0.3 * w;
  } else if (rp.kind === 'bicicleta') {
    const a = smooth(Math.min(1, u / 0.45));
    frente = u < 0.5 ? 1.75 * a : lerp(1.75, 1.45, (u - 0.5) / 0.5);   // vira de costas no ar
    lR = u < 0.2 ? -0.5 * (u / 0.2) : u < 0.5 ? lerp(-0.5, 2.0, (u - 0.2) / 0.3) : lerp(2.0, 0, (u - 0.5) / 0.5);
    lL = u < 0.5 ? lerp(0.6, -0.4, u / 0.5) : lerp(-0.4, 0, (u - 0.5) / 0.5);
    aZL = aZR = -0.3; aXL = 1.0; aXR = -1.0;
  } else if (rp.kind === 'voleio') {
    const s = smooth(Math.min(1, u / 0.45));
    tomb = rp.side * 1.35 * s;                                          // deita de lado no ar
    lR = u < 0.45 ? lerp(-0.4, 2.2, u / 0.45) : lerp(2.2, 0.2, (u - 0.45) / 0.55);
    lL = -0.3 * s; aZL = aZR = 0.4; aXL = 0.9; aXR = -0.9;
    if (rp.side > 0) aXR = lerp(-0.9, -3.0, s); else aXL = lerp(0.9, 3.0, s);   // braço de baixo sobe
    yLado = 0.3 * s;
  }
  m.raiz.position.y = Math.max(puloRecepcao(rp), yLado); m.raiz.rotation.z = frente; m.raiz.rotation.x = tomb;
  m.corpo.rotation.z = incl; m.corpo.position.y = 0;
  m.bracoE.rotation.z = aZL; m.bracoD.rotation.z = aZR; m.bracoE.rotation.x = aXL; m.bracoD.rotation.x = aXR;
  m.pernaE.rotation.z = lL; m.pernaD.rotation.z = lR;
}

// Seu carrinho: em direção a quem está com a bola (se perto) ou para a frente.
function userCarrinho() {
  if (G.state !== 'play' || user.tackleCd > 0 || user.stun > 0 || G.possession === user) return;
  if (G.sp || (G.possession && G.possession.setPiece)) { showToast('Espere a cobrança'); return; }
  const h = G.possession;
  const alvo = h && h.team === 1 && dist2D(user, h) < 4.5 ? { x: h.x + h.vx * 0.2, z: h.z + h.vz * 0.2 }
    : { x: user.x + Math.cos(user.angle) * 3, z: user.z + Math.sin(user.angle) * 3 };
  if (startSlide(user, alvo)) user.tackleCd = 1.6;
}

// Saída de bola sua: toque curto e automático para o companheiro do lado.
function kickoffPass() {
  const K = G.kickoffPending;
  if (!K || G.possession !== user || G.state !== 'play') return;
  passTo(user, K.partner, false, 'short');
  ball.userPass = true; G.stats.passes++;
}

function requestBall() {
  const h = G.possession;
  if (G.state !== 'play' || !h || h.team !== 0 || h === user || G.userRequest > 0) return;
  G.userRequest = 4;
  h.think = Math.min(h.think, rand(0.25, 0.5));
  if (h.role === 'GK') h.hold = Math.min(h.hold, 0.4);
  showToast('Pedindo a bola!');
}

function tryUserTackle() {
  if (G.state !== 'play' || user.tackleCd > 0 || user.stun > 0) return;
  const h = G.possession;
  if (!h || h.team === 0) return;
  const d = dist2D(user, h);
  if (d > 2.4) { showToast('Chegue mais perto'); return; }
  if ((h.role === 'GK' && !h.comPe) || h.throwIn || h.setPiece || G.sp) { showToast('Não dá para tirar agora'); return; }
  user.tackleCd = 1.0;
  if (porTras(user, h)) { commitFoul(user, h, { tipo: 'desarme', porTras: true }); return; }   // por trás é falta (empurrão)
  const dx = h.x - user.x, dz = h.z - user.z, l = Math.hypot(dx, dz) || 1;
  user.dash = 0.12; user.dashVX = dx / l * 9; user.dashVZ = dz / l * 9;
  if (Math.random() < clamp(0.8 - d * 0.2, 0.25, 0.7)) {
    givePossession(user, { silent: true });
    perderBola(h); G.stats.desarmes++;
    showToast('Desarme!', 'good');
  } else {
    user.stun = 0.6;
    showToast('Errou o bote', 'bad');
  }
}

// ---------------------------------------------------------------------
// 13. CENA DO DRIBLE
// Acontece na direção em que você está indo (f), sem teleporte:
//   'approach' → zoom da câmera por cima do ombro, câmera lenta, você segue em frente
//                devagar enquanto acerta os 2 toques (5 s)
//   'success'  → você passa em curva pelo lado oposto ao do marcador; ele dá o bote e cai
//   'fail'     → ele toma a bola e você fica tonto
// Depois o DRIBLAR fica recarregando (CONFIG.DRIBBLE_COOLDOWN).
// ---------------------------------------------------------------------
function setLetterbox(on) { document.body.classList.toggle('cine', on); }

// Janela de drible: o botão só aparece quando um marcador vem para cima de você
// (aproximando, dando o bote, ou colado na sua frente). Fica 0,9 s aberto para não piscar.
function updateDribbleWindow(dt) {
  G.dribbleWin = Math.max(0, (G.dribbleWin || 0) - dt);
  if (G.state !== 'play' || G.possession !== user || user.dribbleCd > 0 || G.sp || G.kickoffPending || user.throwIn) {
    G.dribbleWin = 0; G.dribbleOpp = null; return;
  }
  const fx = Math.cos(user.angle), fz = Math.sin(user.angle);
  let best = null, bs = -Infinity;
  for (const o of TEAMS[1]) {
    if (o.stun > 0) continue;
    const dx = o.x - user.x, dz = o.z - user.z, d = Math.hypot(dx, dz);
    if (d > CONFIG.DRIBBLE_RANGE || d < 0.01) continue;
    const closing = -((o.vx - user.vx) * dx + (o.vz - user.vz) * dz) / d;   // >0: ele está chegando
    const ahead = (dx * fx + dz * fz) / d;
    // (4.0.0) Vale marcador de FRENTE (chegando), do LADO (colado, até 2,4 m) ou ATRÁS (te
    // perseguindo, até 2,6 m). Cada caso vira um drible diferente (ver tipoDeDrible).
    let s;
    if (ahead >= 0.35) { if (!(closing > 0.8 || o.committing > 0 || d < 2.4)) continue; s = 2 + ahead - d; }
    else if (ahead > -0.35) { if (d > 2.4) continue; s = 1 - d; }
    else { if (d > 2.6 || closing < -0.5) continue; s = -d; }
    if (s > bs) { bs = s; best = o; }
  }
  if (best) { G.dribbleOpp = best; G.dribbleWin = 0.9; }
  else if (G.dribbleWin <= 0) G.dribbleOpp = null;
}

// Qual drible combina com a situação:
//   marcador ATRÁS (perseguindo) ............ 'protecao' (4.1.3: protege de costas/ombro, com
//                                             contato; ele empurra, perde o equilíbrio e cai)
//   marcador do LADO ........................ 'corpo' (finge que vai para o lado dele e segue reto)
//   de FRENTE, você PARADO .................. 'pedalada' (pedaladas e arranque para o lado)
//   de FRENTE, você correndo (ou o goleiro) . 'frente' (corte com queda do marcador ou carretel)
function tipoDeDrible(u, o, vel) {
  if (o.role === 'GK') return 'frente';
  const dx = o.x - u.x, dz = o.z - u.z, d = Math.hypot(dx, dz) || 1;
  const ahead = (dx * Math.cos(u.angle) + dz * Math.sin(u.angle)) / d;
  if (ahead <= -0.35) return 'protecao';
  if (ahead < 0.35) return 'corpo';
  return vel < 1.5 ? 'pedalada' : 'frente';
}

function startDribble() {
  if (G.state !== 'play' || G.possession !== user) return;
  if (user.dribbleCd > 0 || G.dribbleWin <= 0 || !G.dribbleOpp) return;   // só no momento certo
  const fx = Math.cos(user.angle), fz = Math.sin(user.angle);
  const opp = G.dribbleOpp;
  G.dribbleWin = 0;
  user.dribbleCd = CONFIG.DRIBBLE_COOLDOWN;
  G.stats.dribles++;
  const vel = Math.hypot(user.vx, user.vz);
  const C = { phase: 'approach', t: 0, opp, fx, fz, px: -fz, pz: fx, speed: clamp(vel, 2.5, 5.5) };
  C.tipo = tipoDeDrible(user, opp, vel);
  if (C.tipo === 'pedalada') C.speed = 0;          // parado na frente dele: fica parado durante a tela
  C.rel = { x: opp.x - user.x, z: opp.z - user.z };   // marcador do lado/atrás acompanha você
  // De que lado da sua linha de corrida está o marcador (+1 = à sua direita)?
  C.oppSide = ((opp.x - user.x) * C.px + (opp.z - user.z) * C.pz) >= 0 ? 1 : -1;
  // O zoom vem do lado onde a câmera já está, para não "virar" a tela.
  C.camSide = ((cam.px - user.x) * C.px + (cam.pz - user.z) * C.pz) >= 0 ? 1 : -1;
  if (C.tipo === 'protecao') C.camSide = -C.oppSide;   // (4.1.3) do lado contrário ao dele: os dois de perfil
  user.scripted = true; opp.scripted = true; user.running = false;
  C.cut = true;                                    // corte seco para a câmera de lado
  G.cine = C;
  G.state = 'dribble'; G.targetScale = CONFIG.SLOWMO_DRIBBLE;
  setLetterbox(true);
  const W = AREA.w, H = AREA.h, placed = [];
  // Contra o GOLEIRO é mais difícil: 3 toques em sequência rápida dentro de ~1 s, precisa acertar os 3.
  const noGoleiro = opp.role === 'GK';
  C.noGoleiro = noGoleiro;
  const count = noGoleiro ? 3 : CONFIG.DRIBBLE_TAPS;
  // Os alvos se encaixam no tempo da tela: o último precisa terminar ~0,3 s antes do fim
  // (é a folga para julgar o toque atrasado).
  const tempo = noGoleiro ? CONFIG.DRIBBLE_TIME_GK : CONFIG.DRIBBLE_TIME;
  const approach = noGoleiro ? 0.35 : clamp(tempo * 0.36, 0.5, 1.0), firstAt = noGoleiro ? 0.05 : 0.25;
  const gap = count > 1 ? Math.max(noGoleiro ? 0.22 : 0.45, (tempo - firstAt - approach - 0.35) / (count - 1)) : 0;
  startTiming({
    title: noGoleiro ? 'DRIBLE NO GOLEIRO' : ({ arrancada: 'ARRANCADA', protecao: 'PROTEJA A BOLA', corpo: 'DRIBLE DE CORPO', pedalada: 'PEDALADA' }[C.tipo] || 'DRIBLE'), count, firstAt, gap, approach,
    duration: tempo, need: noGoleiro ? 3 : CONFIG.DRIBBLE_NEEDED,
    place: () => {
      let pos;
      for (let tries = 0; tries < 25; tries++) {
        pos = { x: rand(W * 0.22, W * 0.78), y: rand(H * 0.36, H * 0.72) };
        if (!placed.length || placed.every((q) => Math.hypot(pos.x - q.x, pos.y - q.y) > 170)) break;
      }
      placed.push(pos); return pos;
    },
    onFinish: finishDribbleMinigame,
  });
}

function finishDribbleMinigame(T) {
  const C = G.cine;
  if (G.state !== 'dribble' || !C) return;
  const o = C.opp, u = user;
  C.t = 0;
  C.o0 = { x: o.x, z: o.z };
  if (T.hits >= T.need) {
    C.phase = 'success';
    const lat = -C.oppSide;                        // passa pelo lado oposto ao do marcador
    const along = Math.max(4.5, ((o.x - u.x) * C.fx + (o.z - u.z) * C.fz) + 3.2);
    C.p0 = { x: u.x, z: u.z };
    C.p1 = { x: u.x + C.fx * along * 0.5 + C.px * lat * 2.0, z: u.z + C.fz * along * 0.5 + C.pz * lat * 2.0 };
    C.p2 = { x: u.x + C.fx * along + C.px * lat * 0.5, z: u.z + C.fz * along + C.pz * lat * 0.5 };
    C.b0 = { x: ball.x, z: ball.z };
    C.b1 = { x: C.p1.x + C.fx * 0.7 - C.px * lat * 0.3, z: C.p1.z + C.fz * 0.7 - C.pz * lat * 0.3 };
    C.b2 = { x: C.p2.x + C.fx * 0.7, z: C.p2.z + C.fz * 0.7 };
    C.lunge = { x: o.x + (u.x - o.x) * 0.4, z: o.z + (u.z - o.z) * 0.4 };   // bote onde a bola estava
    const lx = C.lunge.x - o.x, lz = C.lunge.z - o.z, ll = Math.hypot(lx, lz) || 1;
    C.stumble = { x: C.lunge.x + lx / ll * 0.9, z: C.lunge.z + lz / ll * 0.9 };  // embalo depois de errar
    C.fallSide = Math.random() < 0.5 ? 1 : -1;
    C.perfect = T.perfect === T.count;
    if (C.tipo !== 'frente') {                     // dribles novos: sem carretel, cada um com o seu caminho
      prepararDribleNovo(C, u, o);
      G.targetScale = 0.55;
      return;
    }
    // De vez em quando o drible sai de CARRETEL (carretilha): você levanta a bola com o
    // calcanhar por trás, ela passa por cima da sua cabeça e da do marcador, e você busca na frente.
    C.carretel = !C.noGoleiro && Math.random() < 0.3;
    if (C.carretel) {
      C.p1 = { x: u.x + C.fx * along * 0.5 + C.px * lat * 1.1, z: u.z + C.fz * along * 0.5 + C.pz * lat * 1.1 };
      C.p2 = { x: u.x + C.fx * along, z: u.z + C.fz * along };
      C.b2 = { x: C.p2.x + C.fx * 0.9, z: C.p2.z + C.fz * 0.9 };
      C.calcanhar = { x: u.x - C.fx * 0.25, z: u.z - C.fz * 0.25 };   // a bola vai para o calcanhar
      C.pulou = false;
    }
    G.targetScale = 0.55;
  } else {
    C.phase = 'fail';
    C.steal = { x: ball.x, z: ball.z };
    G.targetScale = 0.5;
  }
}

function updateCine(dt) {
  const C = G.cine;
  if (!C) return;
  const u = user, o = C.opp;
  C.t += dt;
  if (C.phase === 'approach') {
    // Você segue na sua direção (sem encostar no marcador).
    const nx = u.x + C.fx * C.speed * dt, nz = u.z + C.fz * C.speed * dt;
    if (Math.hypot(nx - o.x, nz - o.z) > 1.35) {
      u.x = nx; u.z = nz; u.vx = C.fx * C.speed; u.vz = C.fz * C.speed; u.anim += C.speed * 2.6 * dt;
    } else { u.vx = u.vz = 0; }
    o.vx = o.vz = 0;
    if (C.tipo === 'corpo' || C.tipo === 'arrancada' || C.tipo === 'protecao') { o.x = u.x + C.rel.x; o.z = u.z + C.rel.z; o.vx = u.vx; o.vz = u.vz; o.anim += C.speed * 2.6 * dt; }
    o.guard = Math.min(1, o.guard + dt * 6);
    o.angle = turnToward(o.angle, Math.atan2(ball.z - o.z, ball.x - o.x), 6 * dt);
  } else if (C.phase === 'success' && C.tipo !== 'frente') {
    atualizarDribleNovo(C, dt);
  } else if (C.phase === 'success' && C.carretel) {
    atualizarCarretel(C, dt);
  } else if (C.phase === 'success') {
    const k = Math.min(1, C.t / 0.95), e = smooth(k);
    const pt = bezier(C.p0, C.p1, C.p2, e), pt2 = bezier(C.p0, C.p1, C.p2, Math.min(1, e + 0.02));
    u.vx = (pt2.x - pt.x) * 300; u.vz = (pt2.z - pt.z) * 300;
    u.x = pt.x; u.z = pt.z;
    if (Math.hypot(u.vx, u.vz) > 0.1) u.angle = Math.atan2(u.vz, u.vx);
    u.anim += 7 * 2.6 * dt;
    const b = bezier(C.b0, C.b1, C.b2, Math.min(1, e * 1.05 + 0.03));
    ball.x = b.x; ball.z = b.z;
    ball.y = CONFIG.BALL_R + Math.sin(Math.min(1, e * 1.3) * Math.PI) * 0.35;
    // Marcador: 1) estica a perna para a bola (bote); 2) a bola some do pé dele, ele tenta
    // se virar para você e tropeça em 2 passinhos; 3) perde o equilíbrio e cai apoiando as mãos.
    if (k < 0.4) {
      const lk = smooth(k / 0.4);
      o.x = lerp(C.o0.x, C.lunge.x, lk); o.z = lerp(C.o0.z, C.lunge.z, lk);
      o.vx = (C.lunge.x - C.o0.x) * 2; o.vz = (C.lunge.z - C.o0.z) * 2; o.anim += 6 * dt;
      o.tackle = lk;
    } else if (k < 0.72) {
      const sk = smooth((k - 0.4) / 0.32);
      o.x = lerp(C.lunge.x, C.stumble.x, sk); o.z = lerp(C.lunge.z, C.stumble.z, sk);
      o.vx = (C.stumble.x - C.lunge.x) * 2; o.vz = (C.stumble.z - C.lunge.z) * 2; o.anim += 11 * dt;
      o.tackle = Math.max(0, 1 - sk * 2);
      o.angle = turnToward(o.angle, Math.atan2(u.z - o.z, u.x - o.x), 5 * dt);   // gira tentando acompanhar
    } else { o.vx = o.vz = 0; o.tackle = 0; }
    o.guard = Math.max(0, 1 - k * 3);
    o.fallKind = 'frente';
    o.fall = Math.pow(clamp((k - 0.55) / 0.35, 0, 1), 1.6);    // começa devagar e acelera (gravidade)
    o.fallSide = C.fallSide;
    if (k >= 1) endCine(true);
  } else if (C.phase === 'fail') {
    const k = Math.min(1, C.t / 0.6);
    o.x = lerp(C.o0.x, C.steal.x, smooth(k)); o.z = lerp(C.o0.z, C.steal.z, smooth(k));
    o.vx = (C.steal.x - C.o0.x) * 2; o.vz = (C.steal.z - C.o0.z) * 2; o.anim += 6 * dt;
    o.guard = 0;
    u.vx = u.vz = 0;
    // (4.1.3) Errou o drible: em vez de ficar balançando, você faz uma das animações de perder a
    // bola (passinhos, joelho no chão ou queda) — a mesma de um desarme.
    if (k >= 0.45 && G.possession === u) {
      givePossession(o, { silent: true });
      u.driblePose = null;
      perderBola(u);
      const a = Math.atan2(C.fz, C.fx); u.perda.vx = Math.cos(a) * 1.4; u.perda.vz = Math.sin(a) * 1.4;
    }
    if (u.perda) {                                  // você está "scripted" aqui: a animação anda aqui
      u.perda.t += dt;
      if (u.perda.tipo === 'passinhos') { const f = Math.max(0, 1 - u.perda.t / u.perda.dur); u.x += u.perda.vx * f * dt; u.z += u.perda.vz * f * dt; u.anim += dt * 9; }
    }
    if (k >= 1) endCine(false);
  }
}

// Animação do carretel (1,3 s):
//   0–15%  a bola rola para trás até o calcanhar
//   12–35% o calcanhar levanta a bola (perna de trás chuta para cima)
//   15–85% a bola faz um arco por cima de você e do marcador (até ~2,9 m)
//   o marcador olha para cima, pula tentando alcançar e não cai (só fica sem reação)
//   você passa por ele e pega a bola na frente.
function atualizarCarretel(C, dt) {
  const u = user, o = C.opp;
  const k = Math.min(1, C.t / 1.3);
  // Você: começa a correr depois do toque.
  const ek = smooth(clamp((k - 0.2) / 0.8, 0, 1));
  const pt = bezier(C.p0, C.p1, C.p2, ek), pt2 = bezier(C.p0, C.p1, C.p2, Math.min(1, ek + 0.02));
  u.vx = (pt2.x - pt.x) * 260; u.vz = (pt2.z - pt.z) * 260;
  u.x = pt.x; u.z = pt.z;
  if (k > 0.25 && Math.hypot(u.vx, u.vz) > 0.1) u.angle = Math.atan2(u.vz, u.vx);
  u.anim += (k > 0.25 ? 7 : 2) * 2.6 * dt;
  u.carretel = k < 0.12 ? 0 : k < 0.24 ? smooth((k - 0.12) / 0.12) : Math.max(0, 1 - (k - 0.24) / 0.12);
  // Bola.
  if (k < 0.15) {
    const bk = smooth(k / 0.15);
    ball.x = lerp(C.b0.x, C.calcanhar.x, bk); ball.z = lerp(C.b0.z, C.calcanhar.z, bk); ball.y = CONFIG.BALL_R;
  } else {
    const a = clamp((k - 0.15) / 0.7, 0, 1);
    ball.x = lerp(C.calcanhar.x, C.b2.x, a); ball.z = lerp(C.calcanhar.z, C.b2.z, a);
    ball.y = CONFIG.BALL_R + Math.sin(a * Math.PI) * 2.7;
  }
  // Marcador: acompanha a bola com o olhar e pula tentando alcançar.
  o.vx = o.vz = 0; o.tackle = 0; o.guard = Math.max(0, o.guard - dt * 4);
  o.angle = turnToward(o.angle, Math.atan2(ball.z - o.z, ball.x - o.x), 8 * dt);
  if (!C.pulou && k > 0.38) { C.pulou = true; o.jumpT = 0.5; }
  if (k >= 1) endCine(true);
}

// ---------------------------------------------------------------------
// DRIBLES NOVOS (4.0.0). Todos terminam com você correndo (C.p1 → C.p2 dá a direção de saída)
// e o marcador tropeçando em passinhos (perderBola 'passinhos', sem cair).
//   arrancada (0,9 s): dispara reto, empurrando a bola ~1,3 m à frente; ele fica para trás.
//   corpo (1,1 s): 0–0,4 s inclina e dá meio passo para o LADO DO MARCADOR (ele morde e vai
//                  junto, ~1 m); depois você segue RETO acelerando.
//   pedalada (1,6 s): 0–0,9 s duas pedaladas (perna passa por cima da bola, corpo balança e ele
//                  acompanha o balanço); depois arranca para o lado contrário da última.
// ---------------------------------------------------------------------
// Proteção de bola: onde o marcador encosta (atrás e para o lado do ombro) e as poses. Valores
// conferidos com as caixas 3D: encostam (ombro/braço no peito dele) sem um entrar no outro.
const PROT = { atras: 0.5, lado: 0.6, giro: 0.3, tras: 0.06, tomba: 0.03, bz: -0.35, bx: 0.7, bote: 0.15 };
function prepararDribleNovo(C, u, o) {
  C.p0 = { x: u.x, z: u.z }; C.b0 = { x: ball.x, z: ball.z }; C.o0 = { x: o.x, z: o.z };
  const f = { x: C.fx, z: C.fz }, lado = C.oppSide;            // +1: marcador à sua direita
  if (C.tipo === 'arrancada') {
    C.dur = 0.9; C.p1 = { x: u.x + f.x * 3, z: u.z + f.z * 3 }; C.p2 = { x: u.x + f.x * 6.5, z: u.z + f.z * 6.5 };
  } else if (C.tipo === 'protecao') {
    // Proteção (1,6 s): recua 15 cm e encosta as costas/o ombro nele; os dois se empurram;
    // ele perde o equilíbrio e cai de costas; você sai com a bola para a frente.
    C.dur = 1.6;
    C.encosta = { x: u.x - f.x * 0.15, z: u.z - f.z * 0.15 };
    C.oEncosta = { x: C.encosta.x - f.x * PROT.atras + C.px * lado * PROT.lado, z: C.encosta.z - f.z * PROT.atras + C.pz * lado * PROT.lado };
    C.oCai = { x: C.oEncosta.x - f.x * 0.45, z: C.oEncosta.z - f.z * 0.45 };
    C.p1 = { x: C.encosta.x + f.x * 1.5, z: C.encosta.z + f.z * 1.5 }; C.p2 = { x: C.encosta.x + f.x * 4.5, z: C.encosta.z + f.z * 4.5 };
    C.fallSide = lado;
  } else if (C.tipo === 'corpo') {
    C.dur = 1.1;
    C.finta = { x: u.x + C.px * lado * 0.35, z: u.z + C.pz * lado * 0.35 };
    C.p1 = { x: C.finta.x + f.x * 1.5, z: C.finta.z + f.z * 1.5 }; C.p2 = { x: u.x + f.x * 5.5, z: u.z + f.z * 5.5 };
    C.oMorde = { x: o.x + C.px * lado * 1.0 + f.x * 0.4, z: o.z + C.pz * lado * 1.0 + f.z * 0.4 };
  } else {                                                     // pedalada
    C.dur = 1.6;
    const sai = Math.random() < 0.5 ? -1 : 1;                   // lado do arranque
    C.saiLado = sai;
    C.p1 = { x: u.x + C.px * sai * 1.6 + f.x * 1.2, z: u.z + C.pz * sai * 1.6 + f.z * 1.2 };
    C.p2 = { x: u.x + C.px * sai * 1.4 + f.x * 5, z: u.z + C.pz * sai * 1.4 + f.z * 5 };
  }
  u.driblePose = { tipo: C.tipo, t: 0, sai: C.saiLado || 0, lado };
}

function atualizarDribleNovo(C, dt) {
  const u = user, o = C.opp, k = Math.min(1, C.t / C.dur);
  const P = u.driblePose; if (P) P.t = C.t;
  const mover = (x, z, v) => {                     // você vai para (x, z) nesse quadro
    const vx = (x - u.x) / Math.max(dt, 1e-4), vz = (z - u.z) / Math.max(dt, 1e-4);
    u.vx = vx; u.vz = vz; u.x = x; u.z = z; u.anim += (v || Math.hypot(vx, vz)) * 2.6 * dt;
  };
  const bolaNaFrente = (dist) => { ball.x = u.x + C.fx * dist; ball.z = u.z + C.fz * dist; ball.y = CONFIG.BALL_R; };
  const tropeca = (dirX, dirZ) => {                // marcador entra em "passinhos" uma vez
    if (C.tropecou) return;
    C.tropecou = true;
    o.vx = dirX * 2; o.vz = dirZ * 2;
    perderBola(o, 'passinhos'); o.perda.vx = dirX * 1.6; o.perda.vz = dirZ * 1.6;
  };
  if (o.perda) {                                   // a animação dele anda aqui (ele está "scripted")
    o.perda.t += dt;
    const f = Math.max(0, 1 - o.perda.t / o.perda.dur);
    o.x += o.perda.vx * f * dt; o.z += o.perda.vz * f * dt; o.anim += dt * 9;
  }
  if (C.tipo === 'protecao') {
    const t = C.t, ang = Math.atan2(C.fz, C.fx);
    if (t < 0.35) {                                 // encosta nele
      const a = smooth(t / 0.35);
      mover(lerp(C.p0.x, C.encosta.x, a), lerp(C.p0.z, C.encosta.z, a), 1.5);
      o.x = lerp(C.o0.x, C.oEncosta.x, a); o.z = lerp(C.o0.z, C.oEncosta.z, a); o.anim += 5 * dt;
      bolaNaFrente(0.55);
    } else if (t < 1.0) {                           // empurra-empurra: os dois balançam juntos
      const sw = Math.sin((t - 0.35) * 13) * 0.05;
      mover(C.encosta.x + C.px * sw, C.encosta.z + C.pz * sw, 0.5);
      o.x = C.oEncosta.x + C.px * sw * 1.2; o.z = C.oEncosta.z + C.pz * sw * 1.2;
      o.tackle = PROT.bote * Math.max(0, Math.sin((t - 0.35) * 9));      // tenta enfiar o pé
      ball.x = u.x + C.fx * 0.55 - C.px * C.oppSide * 0.12 * Math.max(0, Math.sin(t * 7)); ball.z = u.z + C.fz * 0.55 - C.pz * C.oppSide * 0.12 * Math.max(0, Math.sin(t * 7)); ball.y = CONFIG.BALL_R;
      if (!C.empurrou && t > 0.6) { C.empurrou = true; Som.toque(0.3); }
    } else {                                        // ele cai de costas e você sai com a bola
      const a = smooth((t - 1.0) / (C.dur - 1.0));
      const pt = bezier(C.encosta, C.p1, C.p2, a);
      mover(pt.x, pt.z, 8);
      bolaNaFrente(lerp(0.55, 1.1, a));
      const q = smooth(clamp((t - 1.0) / 0.35, 0, 1));
      o.x = lerp(C.oEncosta.x, C.oCai.x, q); o.z = lerp(C.oEncosta.z, C.oCai.z, q);
      o.tackle = 0; o.fallKind = 'costas'; o.fallSide = C.fallSide; o.fall = Math.pow(q, 1.4);
    }
    // Você de costas para ele, um pouco virado para mostrar o ombro (do lado dele).
    u.angle = t < 1.0 ? ang - C.oppSide * PROT.giro * smooth(Math.min(1, t / 0.3)) : turnToward(u.angle, ang, 10 * dt);
    o.angle = turnToward(o.angle, Math.atan2(ball.z - o.z, ball.x - o.x), 8 * dt);
    o.vx = o.vz = 0;
  } else if (C.tipo === 'arrancada') {
    const e = k * k * (3 - 2 * k);
    const pt = bezier(C.p0, C.p1, C.p2, e);
    mover(pt.x, pt.z, 9);
    u.angle = Math.atan2(C.fz, C.fx);
    bolaNaFrente(lerp(0.62, 1.3, Math.min(1, k * 2)));
    if (k > 0.15) tropeca(C.fx * 0.6, C.fz * 0.6);
  } else if (C.tipo === 'corpo') {
    if (C.t < 0.4) {
      const a = smooth(C.t / 0.4);
      mover(lerp(C.p0.x, C.finta.x, a), lerp(C.p0.z, C.finta.z, a), 2);
      bolaNaFrente(0.62);
      const m = smooth(Math.min(1, C.t / 0.35));   // ele "morde" a finta
      o.x = lerp(C.o0.x, C.oMorde.x, m); o.z = lerp(C.o0.z, C.oMorde.z, m); o.anim += 6 * dt; o.tackle = m * 0.8;
    } else {
      const a = smooth((C.t - 0.4) / (C.dur - 0.4));
      const pt = bezier(C.finta, C.p1, C.p2, a);
      mover(pt.x, pt.z, 8);
      u.angle = turnToward(u.angle, Math.atan2(C.fz, C.fx), 10 * dt);
      bolaNaFrente(lerp(0.62, 1.1, a));
      o.tackle = Math.max(0, o.tackle - dt * 4);
      tropeca(C.px * C.oppSide * 0.7, C.pz * C.oppSide * 0.7);   // vai embora para o lado da finta
    }
  } else {                                         // pedalada
    if (C.t < 0.9) {
      u.vx = u.vz = 0;
      ball.x = C.b0.x; ball.z = C.b0.z; ball.y = CONFIG.BALL_R;
      const balanco = Math.sin((C.t / 0.9) * Math.PI * 2);        // corpo vai para um lado e para o outro
      o.x = C.o0.x + C.px * balanco * 0.45; o.z = C.o0.z + C.pz * balanco * 0.45;   // ele acompanha
      o.anim += 4 * dt; o.guard = 1;
    } else {
      const a = smooth((C.t - 0.9) / (C.dur - 0.9));
      const pt = bezier(C.p0, C.p1, C.p2, a);
      mover(pt.x, pt.z, 8);
      const ex = C.p2.x - C.p0.x, ez = C.p2.z - C.p0.z;
      u.angle = turnToward(u.angle, Math.atan2(ez, ex), 8 * dt);
      const b = bezier(C.b0, { x: C.p1.x + C.fx * 0.8, z: C.p1.z + C.fz * 0.8 }, { x: C.p2.x + C.fx * 0.8, z: C.p2.z + C.fz * 0.8 }, Math.min(1, a * 1.08 + 0.04));
      ball.x = b.x; ball.z = b.z; ball.y = CONFIG.BALL_R;
      o.guard = 0;
      tropeca(-C.px * C.saiLado * 0.7, -C.pz * C.saiLado * 0.7);   // balançou para o lado errado
    }
  }
  if (k >= 1) endCine(true);
}

// Poses dos dribles novos (por cima de tudo, no fim do syncMeshes).
function aplicarDriblePose(p, m) {
  const P = p.driblePose;
  if (P.tipo === 'pedalada' && P.t < 0.9) {
    // Duas pedaladas: cada perna sobe à frente e gira por cima da bola, de dentro para fora.
    const fase = (P.t / 0.45) % 1, perna = P.t < 0.45 ? m.pernaD : m.pernaE, sinal = P.t < 0.45 ? -1 : 1;
    const arco = Math.sin(fase * Math.PI);
    perna.rotation.z = 0.75 * arco;
    perna.rotation.x = sinal * 0.55 * Math.sin(fase * Math.PI * 2);   // passa por cima da bola em arco
    const outra = perna === m.pernaD ? m.pernaE : m.pernaD; outra.rotation.z = -0.1; outra.rotation.x = 0;
    m.raiz.rotation.x = Math.sin((P.t / 0.9) * Math.PI * 2) * 0.2;    // balanço do corpo
    m.corpo.rotation.z = -0.15;
    m.bracoE.rotation.x = 0.7; m.bracoD.rotation.x = -0.7; m.bracoE.rotation.z = 0.2; m.bracoD.rotation.z = 0.2;
  } else if (P.tipo === 'protecao' && P.t < 1.0) {
    // Corpo para trás (encostado nele), ombro do lado dele baixo, braço de lá segurando ele e o
    // outro aberto para equilibrar.
    const a = smooth(Math.min(1, P.t / 0.3)), sw = Math.sin(P.t * 13) * 0.05;
    m.corpo.rotation.z = PROT.tras * a;
    m.raiz.rotation.x = (P.lado * PROT.tomba + sw) * a;
    const bL = P.lado > 0 ? m.bracoD : m.bracoE, bO = P.lado > 0 ? m.bracoE : m.bracoD, s = P.lado > 0 ? -1 : 1;
    bL.rotation.z = PROT.bz * a; bL.rotation.x = s * PROT.bx * a;
    bO.rotation.z = 0.25 * a; bO.rotation.x = -s * 0.6 * a;
    m.pernaE.rotation.z = 0.12 * a; m.pernaD.rotation.z = -0.12 * a;   // base aberta
  } else if (P.tipo === 'corpo' && P.t < 0.4) {
    const a = Math.sin((P.t / 0.4) * Math.PI);
    m.raiz.rotation.x = P.lado * 0.32 * a;         // tomba o corpo para o lado do marcador (a finta)
    m.corpo.rotation.z = -0.1;
    if (P.lado > 0) m.bracoE.rotation.x = 0.4 + 0.6 * a; else m.bracoD.rotation.x = -0.4 - 0.6 * a;
  } else {
    m.pernaE.rotation.x = 0; m.pernaD.rotation.x = 0;
    if (P.tipo === 'arrancada' || P.tipo === 'protecao' || P.tipo === 'corpo' || P.tipo === 'pedalada') m.corpo.rotation.z = Math.min(m.corpo.rotation.z, -0.22);   // inclinado na arrancada
  }
}

function endCine(success) {
  const C = G.cine;
  G.cine = null;
  user.scripted = false; C.opp.scripted = false; C.opp.guard = 0;
  setLetterbox(false);
  G.state = 'play'; G.targetScale = 1;
  if (success) {
    G.stats.driblesOk++;
    if (C.carretel) { C.opp.stun = 1.4; user.carretel = 0; }   // no carretel o marcador não cai, só fica parado
    else if (C.tipo === 'protecao') { C.opp.stun = 2.0; C.opp.fall = 1; C.opp.fallKind = 'costas'; user.driblePose = null; }   // caiu de costas
    else if (C.tipo !== 'frente') { C.opp.stun = Math.max(C.opp.stun, 1.0); user.driblePose = null; }   // tropeçou (passinhos), não cai
    else { C.opp.stun = 2.4; C.opp.fall = 1; }
    const ex = C.p2.x - C.p1.x, ez = C.p2.z - C.p1.z, el = Math.hypot(ex, ez) || 1;
    user.angle = Math.atan2(ez, ex);
    user.vx = ex / el * 6; user.vz = ez / el * 6;
    user.dash = 0.25; user.dashVX = ex / el * 7.5; user.dashVZ = ez / el * 7.5;
    // v16: continua CORRENDO na direção do drible (você estava tocando nos alvos, não no
    // joystick) até mexer no joystick, por no máximo 2,5 s. E o drible certo devolve 2 s de fôlego.
    user.embalo = { t: 2.5, x: ex / el, z: ez / el };
    user.stamina = Math.min(1, user.stamina + 2 / CONFIG.STAMINA_RUN_TIME);
    if (user.exhausted && user.stamina >= CONFIG.STAMINA_MIN_TO_RUN) user.exhausted = false;
    Som.drible();
    const nomes = { arrancada: 'Arrancada!', protecao: 'Protegeu a bola!', corpo: 'Drible de corpo!', pedalada: 'Pedalada!' };
    showToast(C.carretel ? 'CARRETEL!' : C.noGoleiro ? 'Driblou o goleiro!' : nomes[C.tipo] || (C.perfect ? 'Drible perfeito!' : 'Driblou!'), 'good');
  } else {
    if (!user.perda) perderBola(user);
    G.stats.perdas++;
    showToast('Perdeu no drible', 'bad');
  }
}

// ---------------------------------------------------------------------
// 14. MINIGAME DE TEMPO (drible e domínio). Usa o tempo REAL.
// ---------------------------------------------------------------------
function startTiming(opts) {
  const layer = $('timingLayer');
  layer.querySelectorAll('.tgt').forEach((n) => n.remove());
  layer.hidden = false;
  const targets = [];
  for (let i = 0; i < opts.count; i++) {
    const pos = opts.place(i);
    const el = document.createElement('div');
    el.className = 'tgt';
    el.style.left = pos.x + 'px'; el.style.top = pos.y + 'px';
    el.innerHTML = '<div class="ring"></div><span class="num">' + (i + 1) + '</span><span class="fb"></span>';
    el.hidden = true;
    layer.appendChild(el);
    const appear = opts.firstAt + i * opts.gap;
    targets.push({ x: pos.x, y: pos.y, el, ring: el.querySelector('.ring'), fb: el.querySelector('.fb'), appear, hitAt: appear + opts.approach, judged: false });
  }
  G.timing = Object.assign({}, opts, { t: 0, targets, hits: 0, perfect: 0, done: false, lastInfo: '' });
  $('timingTitle').textContent = opts.title;
  updateTimingHead();
}

function updateTiming(rdt) {
  const T = G.timing;
  if (!T || T.done) return;
  T.t += rdt;
  for (const tg of T.targets) {
    if (tg.judged) continue;
    if (T.t >= tg.appear) {
      tg.el.hidden = false;
      const k = Math.max(0, (tg.hitAt - T.t) / T.approach);
      tg.ring.style.transform = 'scale(' + (1 + k * 1.8).toFixed(3) + ')';
    }
    if (T.t > tg.hitAt + 0.3) judgeTarget(tg, 'miss');
  }
  updateTimingHead();
  if (T.targets.every((t) => t.judged) || T.t >= T.duration) finishTiming();
}

function updateTimingHead() {
  const T = G.timing;
  if (!T) return;
  const left = Math.max(0, T.duration - T.t);
  const info = left.toFixed(1) + ' s · acertos ' + T.hits + '/' + T.need;
  if (info !== T.lastInfo) { $('timingInfo').textContent = info; T.lastInfo = info; }
  $('timingProg').style.transform = 'scaleX(' + (left / T.duration).toFixed(3) + ')';
}

function tapTiming(x, y) {
  const T = G.timing;
  if (!T || T.done) return;
  let best = null;
  for (const tg of T.targets) {
    if (tg.judged || T.t < tg.appear) continue;
    if (Math.hypot(x - tg.x, y - tg.y) < 64 && (!best || tg.hitAt < best.hitAt)) best = tg;
  }
  if (!best) return;
  const err = Math.abs(T.t - best.hitAt);
  judgeTarget(best, err < 0.13 ? 'perfect' : err < 0.28 ? 'good' : 'miss');
}

function judgeTarget(tg, res) {
  const T = G.timing;
  tg.judged = true;
  Som.clique(res === 'miss' ? 'erro' : 'ok');
  if (res !== 'miss') T.hits++;
  if (res === 'perfect') T.perfect++;
  tg.el.classList.add(res);
  tg.fb.textContent = res === 'perfect' ? 'PERFEITO' : res === 'good' ? 'BOM' : 'ERROU';
  tg.ring.style.opacity = '0';
  setTimeout(() => tg.el.classList.add('gone'), 380);
}

function finishTiming() {
  const T = G.timing;
  T.done = true;
  for (const tg of T.targets) if (!tg.judged) judgeTarget(tg, 'miss');
  updateTimingHead();
  setTimeout(() => {
    if (G.timing !== T) return;
    $('timingLayer').hidden = true;
    G.timing = null;
    T.onFinish(T);
  }, 450);
}

// ---------------------------------------------------------------------
// 15. ENTRADAS
// ---------------------------------------------------------------------
const keys = {};
const JOY_R = 50;
const joy = { id: null, cx: 0, cy: 0, x: 0, y: 0 };
const aimPad = { id: null, ox: 0, oy: 0, dx: 0, dy: 0, onJoy: false };

function readMove() {
  let up = -joy.y, right = joy.x;
  let mag = Math.hypot(up, right);
  if (mag < 0.15) { up = right = mag = 0; }
  let run = mag >= CONFIG.RUN_THRESHOLD;
  if (mag === 0) {
    if (keys.KeyW || keys.ArrowUp) up += 1;
    if (keys.KeyS || keys.ArrowDown) up -= 1;
    if (keys.KeyD || keys.ArrowRight) right += 1;
    if (keys.KeyA || keys.ArrowLeft) right -= 1;
    mag = Math.hypot(up, right);
    if (mag > 0) { up /= mag; right /= mag; mag = keys.ShiftLeft || keys.ShiftRight ? 1 : CONFIG.RUN_THRESHOLD * 0.99; }
    run = mag >= CONFIG.RUN_THRESHOLD;
    if (mag > 0) { up *= mag; right *= mag; }
  }
  return { up, right, mag, run };
}

function setKnob(el, dx, dy) { el.style.transform = dx || dy ? 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px)' : ''; }

function moveJoy(e) {
  let dx = e.clientX - joy.cx, dy = e.clientY - joy.cy;
  const l = Math.hypot(dx, dy);
  if (l > JOY_R) { dx = dx / l * JOY_R; dy = dy / l * JOY_R; }
  joy.x = dx / JOY_R; joy.y = dy / JOY_R;
  setKnob($('joyKnob'), dx, dy);
}

function drawAimKnob() {
  let dx = aimPad.dx, dy = aimPad.dy;
  const l = Math.hypot(dx, dy);
  if (l > JOY_R) { dx = dx / l * JOY_R; dy = dy / l * JOY_R; }
  if (aimPad.onJoy) { setKnob($('joyKnob'), dx, dy); return; }
  const pad = $('aimPad');
  pad.hidden = false; pad.style.left = aimPad.ox + 'px'; pad.style.top = (aimPad.oy - AREA.topo) + 'px';   // dentro do #raizJogo
  setKnob($('aimKnob'), dx, dy);
}

$('touch').addEventListener('pointerdown', (e) => {
  e.preventDefault();
  if ((G.state === 'play' || G.state === 'celebrate' || G.state === 'trap') && joy.id === null && e.clientX < AREA.w * 0.5) {
    const r = $('joy').getBoundingClientRect();
    const bx = r.left + r.width / 2, by = r.top + r.height / 2;
    const nearBase = Math.hypot(e.clientX - bx, e.clientY - by) < 110;
    joy.id = e.pointerId; joy.cx = nearBase ? bx : e.clientX; joy.cy = nearBase ? by : e.clientY;
    moveJoy(e);
  } else if (G.state === 'aim' && aimPad.id === null) {
    aimPad.id = e.pointerId; aimPad.onJoy = false;
    aimPad.ox = e.clientX; aimPad.oy = e.clientY; aimPad.dx = aimPad.dy = 0;
    drawAimKnob();
  } else if (G.state === 'power') {
    startPowerHold(e.pointerId);
  }
});

window.addEventListener('pointermove', (e) => {
  if (e.pointerId === joy.id) moveJoy(e);
  else if (e.pointerId === aimPad.id && G.state === 'aim') {
    aimPad.dx = e.clientX - aimPad.ox; aimPad.dy = e.clientY - aimPad.oy;
    applyAimVector();
    drawAimKnob();
  }
});

function endPointer(e) {
  if (e.pointerId === joy.id) { joy.id = null; joy.x = joy.y = 0; setKnob($('joyKnob'), 0, 0); }
  if (e.pointerId === aimPad.id) {
    aimPad.id = null;
    $('aimPad').hidden = true; setKnob($('joyKnob'), 0, 0);
    if (G.state === 'aim') {
      if (G.kick && G.kick.aimed) confirmAim();
      else showToast('Arraste para escolher a direção');
    }
  }
  if (power.holding && e.pointerId === power.id) releasePower();
}
window.addEventListener('pointerup', endPointer);
window.addEventListener('pointercancel', endPointer);

$('spinBall').addEventListener('pointerdown', (e) => {
  e.preventDefault(); e.stopPropagation();
  if (G.state !== 'spin') return;
  const r = e.currentTarget.getBoundingClientRect();
  const rad = r.width / 2;
  let ox = (e.clientX - (r.left + rad)) / rad, oy = (e.clientY - (r.top + rad)) / rad;
  const m = Math.hypot(ox, oy);
  if (m > 1.05) return;
  if (m > 1) { ox /= m; oy /= m; }
  chooseSpin(ox, oy);
});

$('hamTrack').addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); martelar(null); });
$('timingLayer').addEventListener('pointerdown', (e) => { e.preventDefault(); tapTiming(e.clientX, e.clientY - AREA.topo); });
$('cancelKick').addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); cancelKick(); });
$('skipBtn').addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); if (G.state === 'subst') terminarSubstituicao(); else if (G.state === 'replay') terminarReplay(); else if (G.espectador && !G.pulando) pularParaResultado(); else if (G.state === 'fim') terminarCenaFinal(); else if (G.state === 'foul') pularParalisacao(); else skipRestart(); });

function toggleCamera() {
  cam.mode = cam.mode === 'bola' ? 'frente' : 'bola';
  $('camBtn').textContent = cam.mode === 'bola' ? 'CÂM: BOLA' : 'CÂM: FRENTE';
}
$('camBtn').addEventListener('click', toggleCamera);

window.addEventListener('keydown', (e) => {
  if (e.repeat) return;
  keys[e.code] = true;
  const mode = computeMode();
  if (G.state === 'restart' && (e.code === 'Enter' || e.code === 'Escape')) { skipRestart(); return; }
  if (G.state === 'foul' && (e.code === 'Enter' || e.code === 'Escape')) { pularParalisacao(); return; }
  if (G.state === 'aim' && (e.code === 'Enter' || e.code === 'KeyJ' || e.code === 'KeyK')) { confirmAim(); return; }
  if (e.code === 'KeyC') toggleCamera();
  if (G.recv && !G.recv.done) {
    if (e.code === 'Space' || e.code === 'KeyE') { e.preventDefault(); martelar(null); return; }
    if (e.code === 'KeyK' && G.recv.kind === 'alto') { martelar('cabecear'); return; }
    if (e.code === 'KeyJ') { martelar(G.recv.kind === 'alto' ? 'finalizar' : 'dominar'); return; }
  }
  if (G.state === 'celebrate') {
    if (e.code === 'Digit1') startCelebration('aviao');
    if (e.code === 'Digit2') startCelebration('joelhada');
    if (e.code === 'Enter') endCelebration();
  }
  if (e.code === 'KeyJ' && (mode === 'ball' || mode === 'setpiece')) startKick('shot');
  if (e.code === 'KeyK' && mode === 'kickoff') kickoffPass();
  else if (e.code === 'KeyK' && (mode === 'ball' || mode === 'setpiece' || mode === 'throw')) startKick('pass');
  if (e.code === 'KeyL' && mode === 'ball') startDribble();   // só funciona com a janela de drible aberta
  if (e.code === 'KeyE') { if (mode === 'team') requestBall(); else if (mode === 'defend') tryUserTackle(); }
  if (e.code === 'KeyQ' && (mode === 'defend' || mode === 'loose')) userCarrinho();
  if (e.code === 'Space') { e.preventDefault(); if (G.state === 'power') startPowerHold('key'); }
  if (e.code === 'Escape') cancelKick();
});
window.addEventListener('keyup', (e) => {
  keys[e.code] = false;
  if (e.code === 'Space' && power.holding && power.id === 'key') releasePower();
});
window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; });

function keyboardAim() {
  if (G.state !== 'aim' || aimPad.id !== null) return;
  let up = 0, right = 0;
  if (keys.KeyW || keys.ArrowUp) up += 1;
  if (keys.KeyS || keys.ArrowDown) up -= 1;
  if (keys.KeyD || keys.ArrowRight) right += 1;
  if (keys.KeyA || keys.ArrowLeft) right -= 1;
  const m = Math.hypot(up, right);
  if (m > 0) { const w = screenToWorld(up / m, right / m, G.kick ? G.kick.yawRef : cam.yaw); setAimDir(w.x, w.z); }
}

// ---------------------------------------------------------------------
// 16. HUD E TELAS
// DESEMPENHO: o HUD só escreve no DOM quando o valor muda (antes escrevia todo quadro).
// ---------------------------------------------------------------------
const hudCache = {};
function setText(id, txt) { if (hudCache[id] !== txt) { hudCache[id] = txt; $(id).textContent = txt; } }
function setClass(el, cls, on) { if (el.classList.contains(cls) !== on) el.classList.toggle(cls, on); }

// Letreiro pequeno (domínio perfeito e outros avisos que não podem tampar a jogada).
(function () { const st = document.createElement('style'); st.textContent = '#banner.pequeno{font-size:clamp(16px,3.6vw,28px)!important;top:22%!important;text-shadow:2px 2px 0 #000!important}'; document.head.appendChild(st); })();
// Avisos e letreiros SOMEM POR TEMPO (no JavaScript), não pelo fim da animação de CSS.
// (4.0.0) No iPhone/Safari com "Reduzir movimento" ligado, a regra de acessibilidade do CSS deixa
// a animação com opacidade 1 e sem fim — o "GOL DELES" ficava na tela para sempre.
let toastTimer = 0, bannerTimer = 0;
function showToast(text, tone = '') {
  const t = $('toast');
  t.textContent = text;
  t.className = '';
  void t.offsetWidth;
  t.className = 'show ' + tone;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.className = ''; }, 1700);
}
function showBanner(text, team, dur = 2.6, pequeno = false) {
  const b = $('banner');
  b.textContent = text;
  b.className = '';
  void b.offsetWidth;
  b.className = 'show' + (team === 1 ? ' b' : '') + (pequeno ? ' pequeno' : '');
  clearTimeout(bannerTimer);
  bannerTimer = setTimeout(() => { b.className = ''; }, dur * 1000);
}

const STAGE_HINTS = {
  aim: 'Arraste para mirar: a seta segue o seu dedo. Solte para confirmar.',
  power: 'Segure em qualquer lugar e solte quando a barra estiver na faixa verde.',
  spin: 'Toque no ponto da bola onde o pé vai bater.',
};
function showStage(stage) {
  document.body.classList.add('mirando');         // esconde os avisos de texto por cima da etiqueta
  const order = ['aim', 'power', 'spin'];
  $('stageBar').hidden = false;
  $('cancelKick').hidden = false;
  $('stageKind').textContent = G.kick.kind === 'shot' ? (G.kick.cruzar ? (G.kick.toqueCurto ? 'PASSE' : 'CRUZAMENTO') : (user.setPiece === 'penalti' ? 'PÊNALTI' : 'CHUTE')) : (G.kick.throwIn ? 'LATERAL' : 'PASSE');
  $('stepSpin').hidden = G.kick.kind !== 'shot';
  $('kickTimer').hidden = !!G.kick.semLimite;            // bola parada: sem relógio
  $('cancelKick').hidden = !!G.kick.semLimite;
  document.querySelectorAll('.step[data-step]').forEach((el) => {
    const i = order.indexOf(el.dataset.step), cur = order.indexOf(stage);
    el.classList.toggle('on', i === cur);
    el.classList.toggle('done', i < cur);
  });
  $('stageHint').textContent = STAGE_HINTS[stage];
  $('powerUI').hidden = stage !== 'power';
  $('spinUI').hidden = stage !== 'spin';
}

function hideKickUI() {
  document.body.classList.remove('mirando');
  $('stageBar').hidden = true; $('cancelKick').hidden = true;
  $('powerUI').hidden = true; $('spinUI').hidden = true; $('aimPad').hidden = true;
  aimArrow.visible = false; targetRing.visible = false;
  power.holding = false; aimPad.id = null;
  setKnob($('joyKnob'), 0, 0);
}

function computeMode() {
  if (G.state === 'celebrate') return G.celebAuto ? 'none' : 'celebrate';
  if (G.state !== 'play' || G.espectador) return 'none';
  if (G.possession === user) return user.throwIn ? 'throw' : G.kickoffPending ? 'kickoff' : (G.sp ? 'setpiece' : 'ball');
  if (G.possession && G.possession.team === 0) return 'team';
  if (G.possession && G.possession.team === 1) return 'defend';
  return 'loose';
}

function renderButtons(mode) {
  const A = $('actions');
  A.innerHTML = '';
  const mk = (label, slot, fn, cls = '', id = '') => {
    const b = document.createElement('button');
    b.className = 'act ' + slot + ' ' + cls;
    b.textContent = label;
    if (id) b.id = id;
    b.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); fn(); });
    A.appendChild(b);
    return b;
  };
  delete hudCache.dribBtn; delete hudCache.reqBtn;
  if (mode === 'ball') {
    mk('CHUTAR / CRUZAR', 's1', () => startKick('shot'), 'primary');
    mk('PASSAR', 's2', () => startKick('pass'));
    mk('DRIBLAR', 's3', startDribble, 'primary', 'dribBtn').hidden = true;   // aparece só quando dá para driblar
  } else if (mode === 'celebrate') {
    mk('CELEBRAÇÃO 1', 's1', () => startCelebration('aviao'), 'primary');
    mk('CELEBRAÇÃO 2', 's2', () => startCelebration('joelhada'), 'primary');
    mk('PULAR', 's3', endCelebration);
  } else if (mode === 'kickoff') {
    mk('PASSAR', 's1', kickoffPass, 'primary');            // um toque só: sem mira nem força
  } else if (mode === 'setpiece') {
    mk('CHUTAR / CRUZAR', 's1', () => startKick('shot'), 'primary');
    mk(G.sp && G.sp.kind === 'falta' ? 'PASSAR' : 'CRUZAR', 's2', () => startKick('pass'));
  } else if (mode === 'throw') {
    mk('LANÇAR', 's1', () => startKick('pass'), 'primary');
  } else if (mode === 'team') {
    mk('PEDIR BOLA', 's1', requestBall, 'primary', 'reqBtn');
  } else if (mode === 'defend') {
    mk('DESARMAR', 's1', tryUserTackle, 'primary', 'tackleBtn');
    mk('CARRINHO', 's2', userCarrinho);
  } else if (mode === 'loose') {
    mk('CARRINHO', 's2', userCarrinho);
  }
}

function fmtClock(s) {
  s = Math.max(0, Math.ceil(s));
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
}

let lastStaminaPct = -1;
function updateHUD() {
  setText('scoreA', String(G.score[0]));
  setText('scoreB', String(G.score[1]));
  atualizarAgregado();
  setText('clock', (G.acrescimoDado && G.acrescimo > 0 ? '+' : '') + fmtClock(G.clock));
  const mode = computeMode();
  if (mode !== G.mode) { G.mode = mode; renderButtons(mode); }
  const req = $('reqBtn');
  if (req) { setClass(req, 'waiting', G.userRequest > 0); setText('reqBtn', G.userRequest > 0 ? 'PEDINDO...' : 'PEDIR BOLA'); }
  const tk = $('tackleBtn');
  if (tk && G.possession) setClass(tk, 'far', dist2D(user, G.possession) > 2.4);
  const db = $('dribBtn');
  if (db) { const show = G.dribbleWin > 0; if (db.hidden === show) db.hidden = !show; }
  const j = $('joy');
  const aimingOnJoy = aimPad.onJoy && aimPad.id !== null;
  const pushingFull = Math.hypot(joy.x, joy.y) >= CONFIG.RUN_THRESHOLD || keys.ShiftLeft || keys.ShiftRight;
  const tired = user.exhausted && pushingFull;
  setClass(j, 'run', user.running);
  setClass(j, 'tired', tired && !user.running);
  setClass(j, 'aim', aimingOnJoy);
  setText('joyLabel', user.running ? 'CORRENDO' : tired ? 'CANSADO' : aimingOnJoy ? 'MIRA' : '');
  // Barra de estamina: só mexe no DOM quando muda 1% ou mais.
  const pct = Math.round(user.stamina * 100);
  if (pct !== lastStaminaPct) {
    lastStaminaPct = pct;
    const f = $('staminaFill');
    f.style.transform = 'scaleX(' + (pct / 100) + ')';
    setClass(f, 'low', user.exhausted || pct < 25);
  }
  const chip = user.red ? '<i class="vm"></i> EXPULSO' : user.yellow ? '<i class="am"></i> AMARELO · ' + (user.fouls || 0) + ' faltas' : (user.fouls ? (user.fouls) + (user.fouls === 1 ? ' falta' : ' faltas') : '');
  if (hudCache.chip !== chip) { hudCache.chip = chip; $('cardChip').innerHTML = chip; $('cardChip').hidden = !chip; }
  let hint = '';
  if (mode === 'celebrate') hint = 'Comemore! ' + Math.max(0, Math.ceil(G.celebT)) + ' s';
  else if (mode === 'loose') hint = 'Bola livre: corra até ela';
  else if (mode === 'defend' && G.possession && dist2D(user, G.possession) > 2.4) hint = 'Chegue perto para desarmar';
  setText('hint', hint);
}

// Radar: gol adversário em cima. A linha laranja mostra para onde a câmera está olhando.
const radar = $('radar'), rctx = radar.getContext('2d');
function drawRadar() {
  const w = radar.width, h = radar.height;
  rctx.fillStyle = '#12301c'; rctx.fillRect(0, 0, w, h);
  rctx.strokeStyle = 'rgba(233,236,223,0.45)'; rctx.lineWidth = 1;
  rctx.strokeRect(3.5, 3.5, w - 7, h - 7);
  rctx.beginPath(); rctx.moveTo(3, h / 2); rctx.lineTo(w - 3, h / 2); rctx.stroke();
  const RX = (z) => 4 + (z + HALF_W) / CONFIG.FIELD_W * (w - 8);
  const RY = (x) => 4 + (HALF_L - x) / CONFIG.FIELD_L * (h - 8);
  rctx.fillStyle = '#ece9dc';
  rctx.fillRect(RX(-GOAL_HALF), 1, RX(GOAL_HALF) - RX(-GOAL_HALF), 2);
  rctx.fillRect(RX(-GOAL_HALF), h - 3, RX(GOAL_HALF) - RX(-GOAL_HALF), 2);
  for (const p of players) {
    const s = p.isUser ? 5 : 3;
    rctx.fillStyle = p.isUser ? '#f7941d' : p.team === 0 ? '#5b8ff0' : '#ef6a5f';
    rctx.fillRect(Math.round(RX(p.z) - s / 2), Math.round(RY(p.x) - s / 2), s, s);
  }
  rctx.strokeStyle = '#f7941d';
  rctx.beginPath(); rctx.moveTo(RX(user.z), RY(user.x));
  rctx.lineTo(RX(user.z + Math.sin(cam.yaw) * 10), RY(user.x + Math.cos(cam.yaw) * 10)); rctx.stroke();
  rctx.fillStyle = '#ffffff';
  rctx.fillRect(Math.round(RX(ball.z) - 1), Math.round(RY(ball.x) - 1), 3, 3);
}

function statsHTML() {
  const s = G.stats;
  const rows = [
    ['Gols', s.gols], ['Chutes', s.chutes], ['No alvo', s.noAlvo],
    ['Passes certos', s.passesOk + '/' + s.passes], ['Dribles', s.driblesOk + '/' + s.dribles],
    ['Domínios', s.dominiosOk + '/' + s.dominios], ['Desarmes', s.desarmes], ['Bolas perdidas', s.perdas],
    ['Faltas cometidas', s.faltas], ['Faltas sofridas', s.faltasSofridas], ['Impedimentos', s.impedimentos],
    ['Cartões', s.cartoes ? s.cartoes.replace(/A/g, 'amarelo ').replace(/V/g, 'vermelho ').trim() : 'nenhum'],
  ];
  return rows.map(([k, v]) => '<div><dt>' + k + '</dt><dd>' + v + '</dd></div>').join('');
}

function matchRating() {
  const s = G.stats;
  const r = 6 + s.gols * 1.0 + s.noAlvo * 0.2 + s.passesOk * 0.1 - (s.passes - s.passesOk) * 0.2
    + s.driblesOk * 0.3 - (s.dribles - s.driblesOk) * 0.2 + s.dominiosOk * 0.1 - (s.dominios - s.dominiosOk) * 0.2
    + s.desarmes * 0.2 - s.perdas * 0.15
    - s.faltas * 0.1 - s.impedimentos * 0.15 - (s.cartoes.includes('A') ? 0.4 : 0) - (s.cartoes.includes('V') ? 2 : 0);
  return clamp(r, 3, 10).toFixed(1);
}

function resetMatch() {
  montarTimes(PARTIDA);                            // escalação nova (tira suspensos/lesionados, banco cheio)
  limparReplay();
  Object.assign(G, { subsFila: [], trocas: [], lesoes: [], espectador: false, pulando: false, subst: null, substToque: null, pen: null, penaltisPlacar: null, resultado: null });
  $('skipBtn').textContent = 'Pular ▶'; painelPenaltis();
  if (PARTIDA.usuarioIndisponivel) setTimeout(() => showToast('Atenção: você está ' + PARTIDA.usuarioIndisponivel + ' (no teste, joga assim mesmo)', 'bad'), 400);
  G.score = [0, 0]; G.clock = CONFIG.MATCH_SECONDS; G.paradas = 0; G.acrescimo = 0; G.acrescimoDado = false; G.fimPendente = false; G.kick = null; G.timing = null; G.foul = null; G.offside = null;
  resetStats();
  // Volta todo mundo (inclusive expulsos) e zera faltas e cartões.
  TEAMS[0].length = 0; TEAMS[1].length = 0;
  for (const p of players) {
    Object.assign(p, { out: false, red: false, yellow: false, fouls: 0, saida: null, slideT: 0, slidePose: 0, wallSlot: -1, wallBlockT: 0, falling: false });
    p.mesh.raiz.visible = true;
    TEAMS[p.team].push(p);
  }
  ['startScreen', 'pauseScreen', 'endScreen', 'timingLayer'].forEach((id) => { $(id).hidden = true; });
  esconderRecepcao();
  hideKickUI();
  user.stamina = 1; user.exhausted = false; user.dribbleCd = 0;
  kickoff(0);
  snapCamera();
}

// ---------------------------------------------------------------------
// TEMPO DE JOGO (v18)
//   - o relógio só corre com a bola ROLANDO: parado na saída de bola até o primeiro toque e
//     parado em toda bola parada (lateral, escanteio, tiro de meta, falta, pênalti) até a cobrança
//   - acréscimos pelas paralisações (cada bola parada conta 1): até 1 → nada; 2–4 → 30 s;
//     5–8 → 45 s; 9 ou mais → 1 min (numa partida de 5 min a IA sozinha para o jogo ~2 vezes).
//     Anunciados quando o tempo normal acaba.
//   - acabou o tempo: o juiz ESPERA o lance terminar. Termina quando a bola sai, tem falta,
//     o goleiro pega, ou ninguém está atacando (bola longe dos dois gols). Gol no último lance
//     vale, e o apito vem no lugar da saída. Pênalti marcado no fim é cobrado.
// ---------------------------------------------------------------------
const ESTADOS_DE_BOLA_ROLANDO = ['play', 'aim', 'power', 'spin', 'dribble', 'trap'];
function relogioCorre() {
  if (G.pen) return false;                         // disputa de pênaltis: sem relógio
  return ESTADOS_DE_BOLA_ROLANDO.includes(G.state) && !G.kickoffPending && !G.sp && !G.fimPendente;
}
function acrescimoPorParadas(n) { return n <= 1 ? 0 : n <= 4 ? 30 : n <= 8 ? 45 : 60; }

function verificarFimDeTempo(dt) {
  if (G.pen) return;
  if (G.fimPendente) {
    G.fimEspera += dt;
    // Segurança: um time trocando passes lá na frente para sempre — depois de 20 s, acaba
    // no primeiro momento sem chute/mira/drible em andamento.
    const travou = G.fimEspera > 20 && G.state === 'play' && !ball.isShot && !G.recvFx && !G.corrida;
    if (lanceAcabou() || travou) apitoFinal();
    return;
  }
  if (G.clock > 0 || !relogioCorre()) return;
  if (!G.acrescimoDado) {
    G.acrescimoDado = true;
    G.acrescimo = PARTIDA.regras.acrescimos ? acrescimoPorParadas(G.paradas || 0) : 0;
    if (G.acrescimo > 0) {
      G.clock = G.acrescimo;
      showToast('Acréscimos: +' + (G.acrescimo === 60 ? '1 min' : G.acrescimo + ' s') + ' (' + G.paradas + ' paralisações)');
      return;
    }
  }
  G.clock = 0; G.fimPendente = true; G.fimEspera = 0;
  if (lanceAcabou()) apitoFinal();
}

// O lance acabou? (ver regras acima)
function lanceAcabou() {
  const st = G.state;
  if (st === 'restart') return !(G.sp && G.sp.kind === 'penalti');
  if (st === 'foul') return !(G.foul && G.foul.penalti);
  if (st !== 'play') return false;                 // gol, mira, drible, domínio: ainda é lance
  if (G.sp || ball.isShot || G.recvFx || G.cine || G.corrida) return false;
  const perigo = (time, x) => Math.abs((time === 0 ? HALF_L : -HALF_L) - x) < 36 * ESC;   // perto do gol que esse time ataca
  const h = G.possession;
  if (h) return h.role === 'GK' || !perigo(h.team, h.x);
  if (Math.hypot(ball.vx, ball.vz) > 14) return false;   // bola viajando (lançamento, cruzamento)
  const t = G.lastTouch ? G.lastTouch.team : 0;
  if (G.passTarget && perigo(G.passTarget.p.team, G.passTarget.x)) return false;
  return !perigo(t, ball.x);
}

// ---------------------------------------------------------------------
// CENA DO APITO FINAL (v18), ~8 s (toque em PULAR para ir direto ao placar):
//   0–1,7 s  câmera no juiz apitando (três apitos: curto, curto, longo) e "FIM DE JOGO"
//   depois   câmera aberta no time que ganhou: duplas vão uma até a outra e batem na mão
//            ("toca aqui") e depois todos dão tchau para a torcida. O time que perdeu fica com
//            as poses de derrota (mão na cintura, sentado, deitado). Empate: todos dão tchau.
// ---------------------------------------------------------------------
function apitoFinal() {
  G.fimPendente = false;
  G.state = 'fim'; G.fimT = 0; G.fimCorte = true; G.fimFase = -1; G.fimBanner = false;
  G.targetScale = G.timeScale = 1;
  if (G.kick) { G.kick = null; }
  hideKickUI(); esconderRecepcao(); $('timingLayer').hidden = true;
  G.cine = null; G.corrida = null; G.recv = null; G.recvFx = null; G.shotCine = null; G.sp = null; G.foul = null; G.passTarget = null;
  if (G.dominioPerfeito) { G.dominioPerfeito = false; }
  G.possession = null; ball.vx *= 0.3; ball.vz *= 0.3;
  setLetterbox(true);
  $('skipBtn').hidden = false; $('cineLabel').textContent = '';
  Som.apitoFinal();
  const r = referee;
  r.angle = Math.atan2(-r.z, -r.x);                // de frente para o meio do campo (e para a câmera)
  r.refPose = 'apito'; r.refPoseT = 2.6;
  G.fimRef = { x: r.x, z: r.z, angle: r.angle };
  const vaiPenaltis = precisaPenaltis();
  G.vaiPenaltis = vaiPenaltis;
  const venc = vaiPenaltis ? -1 : G.score[0] > G.score[1] ? 0 : G.score[1] > G.score[0] ? 1 : -1;
  G.fimVencedor = venc;
  for (const p of players) {
    if (p.out) continue;
    Object.assign(p, { scripted: true, vx: 0, vz: 0, stun: 0, fall: 0, falling: false, slideT: 0, slidePose: 0, jumpT: 0, diveT: 0, carretel: 0, celeb: null, lamento: null, lamentoK: 0, recvPose: null, tackle: 0, guard: 0, kickT: 0, chutePrep: 0, disputaK: 0, fim: null, embalo: null, bolaFixa: null });
    if (venc >= 0 && p.team !== venc) {
      const r2 = Math.random();
      p.lamento = r2 < 0.5 ? 'cintura' : r2 < 0.8 ? 'sentado' : 'deitado';
      p.lamentoAtraso = rand(1.2, 2.2);
    } else if (!vaiPenaltis) p.fim = { tipo: 'tchau', t0: rand(1.6, 2.6) };
  }
  // Duplas do "toca aqui": jogadores de linha do vencedor, cada um com o companheiro mais perto.
  if (venc >= 0 && !vaiPenaltis) {
    const livres = TEAMS[venc].filter((p) => !p.out && p.role !== 'GK');
    while (livres.length >= 2) {
      const a = livres.shift();
      let bi = 0;
      for (let i = 1; i < livres.length; i++) if (dist2D(a, livres[i]) < dist2D(a, livres[bi])) bi = i;
      if (!livres.length || dist2D(a, livres[bi]) > 14) continue;   // longe demais de todos: só dá tchau
      const b = livres.splice(bi, 1)[0];
      const mx = (a.x + b.x) / 2, mz = (a.z + b.z) / 2;
      let ux = b.x - a.x, uz = b.z - a.z; const ul = Math.hypot(ux, uz) || 1; ux /= ul; uz /= ul;
      a.fim = { tipo: 'toca', par: b, alvo: { x: mx - ux * 0.45, z: mz - uz * 0.45 }, batida: 0, t0: 1.3 };
      b.fim = { tipo: 'toca', par: a, alvo: { x: mx + ux * 0.45, z: mz + uz * 0.45 }, batida: 0, t0: 1.3 };
    }
  }
}

function updateFimDeJogo(dt) {
  G.fimT += dt;
  const r = referee, R = G.fimRef;
  r.x = R.x; r.z = R.z; r.vx = r.vz = 0; r.angle = R.angle;
  if (G.fimT > 0.15 && !G.fimBanner) { G.fimBanner = true; showBanner('FIM DE JOGO', 0); }
  if (G.fimT > 2.6 && G.fimBanner === true) { G.fimBanner = 'saiu'; $('banner').className = ''; }
  for (const p of players) {
    if (p.out) continue;
    p.vx = p.vz = 0;
    const F = p.fim;
    if (!F || G.fimT < F.t0) continue;
    if (F.tipo === 'toca') {
      const dx = F.alvo.x - p.x, dz = F.alvo.z - p.z, d = Math.hypot(dx, dz);
      if (d > 0.08 && F.batida === 0) {
        const v = Math.min(4.6, d * 3), passo = Math.min(d, v * dt);   // trotando
        p.x += dx / d * passo; p.z += dz / d * passo; p.vx = dx / d * v; p.vz = dz / d * v;
        p.anim += v * 2.6 * dt;
        p.angle = turnToward(p.angle, Math.atan2(dz, dx), 8 * dt);
      } else {
        const q = F.par;
        p.angle = turnToward(p.angle, Math.atan2(q.z - p.z, q.x - p.x), 10 * dt);
        const parChegou = !q.fim || q.fim.tipo !== 'toca' || Math.hypot(q.fim.alvo.x - q.x, q.fim.alvo.z - q.z) <= 0.1;
        if (parChegou) F.batida += dt / 0.5;
        if (F.batida >= 0.5 && !F.estalo && p.id < q.id) { F.estalo = true; Som.toque(0.6); }   // o "plá" da mão
        if (F.batida >= 1) p.fim = { tipo: 'tchau', t0: G.fimT + rand(0, 0.3) };
      }
      if (G.fimT - F.t0 > 4) p.fim = { tipo: 'tchau', t0: G.fimT };   // não se encontraram: só dá tchau
    } else {
      // Tchau: vira para a arquibancada mais perto (as laterais).
      p.angle = turnToward(p.angle, Math.atan2(p.z >= 0 ? 1 : -1, 0), 4 * dt);
    }
  }
  if (G.fimT > (G.vaiPenaltis ? 2.8 : 8.5)) terminarCenaFinal();
}

function cameraFim() {
  const r = referee, fase = G.fimT < 1.7 ? 0 : G.fimT < 5.4 || G.fimVencedor < 0 ? 1 : 2;
  if (fase !== G.fimFase) { G.fimFase = fase; G.fimCorte = true; }   // corte seco entre as partes
  if (fase === 0) {                                // o juiz apitando, de frente
    const a = G.fimRef.angle;
    return { px: r.x + Math.cos(a) * 4.2, py: 1.9, pz: r.z + Math.sin(a) * 4.2, tx: r.x, ty: 1.5, tz: r.z };
  }
  const perto = (alvo, dist, alt) => {             // câmera do lado de dentro do campo, torcida ao fundo
    const lado = alvo.z > 0 ? -1 : 1;
    return { px: alvo.x + dist * 0.35, py: alt, pz: alvo.z + lado * dist, tx: alvo.x, ty: 1.0, tz: alvo.z };
  };
  const venc = G.fimVencedor;
  if (fase === 1) {
    // Quem ganhou: você (se foi o seu time ou empate) ou a dupla vencedora; mostra a dupla junta.
    let W = venc === 1 ? TEAMS[1].find((p) => p.fim && p.fim.par) || TEAMS[1][1] : user;
    const par = W.fim && W.fim.par;
    const alvo = par ? { x: (W.x + par.x) / 2, z: (W.z + par.z) / 2 } : W;
    return perto(alvo, 7.5, 2.6);
  }
  // Quem perdeu: você (se foi o seu time) ou o adversário mais perto de você, nas poses de derrota.
  const L = venc === 1 ? user : TEAMS[1].filter((p) => !p.out && p.role !== 'GK').sort((x, y) => dist2D(x, user) - dist2D(y, user))[0] || user;
  return perto(L, 5.5, 2.0);
}

function terminarCenaFinal() {
  if (G.state !== 'fim') return;
  Som.fimGol();
  setLetterbox(false); $('banner').className = ''; $('skipBtn').hidden = true;
  G.fimBanner = false; G.fimFase = -1;
  if (G.vaiPenaltis) { G.vaiPenaltis = false; G.state = 'play'; iniciarPenaltis(); return; }   // empate no mata-mata
  endMatch();
}

function endMatch(motivo) {
  G.state = 'end';
  G.pulando = false;
  const res = registrarResultado(motivo);
  $('endTitle').textContent = motivo === 'expulso' ? 'VOCÊ FOI EXPULSO' : 'FIM DE JOGO';
  esconderRecepcao();
  hideKickUI();
  $('timingLayer').hidden = true;
  $('finalScore').innerHTML = '<span>' + PARTIDA.timesObj[0].sigla + '</span><span>' + G.score[0] + '</span><span>:</span><span>' + G.score[1] + '</span><span>' + PARTIDA.timesObj[1].sigla + '</span>';
  let rc = $('resultadoComp');
  if (!rc) { rc = document.createElement('p'); rc.id = 'resultadoComp'; rc.style.cssText = 'font-size:12px;margin:4px 0;color:var(--flood)'; $('finalScore').after(rc); }
  rc.textContent = (resultadoCompeticao() + ' ' + textoFichas(res)).trim();
  $('finalRating').textContent = matchRating();
  $('endStats').innerHTML = statsHTML();
  $('endScreen').hidden = false;
}

function pauseGame() {
  if (!PLAY_STATES.includes(G.state) && G.state !== 'goal' && G.state !== 'celebrate') return;
  G.pausedFrom = G.state; G.state = 'paused'; Som.pausar(true);
  power.holding = false;
  $('pauseStats').innerHTML = statsHTML();
  atualizarTelaDeTatica();
  syncSettings();
  $('pauseScreen').hidden = false;
}
function resumeGame() {
  if (G.state !== 'paused') return;
  G.state = G.pausedFrom; Som.pausar(false);
  $('pauseScreen').hidden = true;
}

const SETTINGS = [
  { id: 'Broken', get: () => Math.round(CONFIG.BROKEN_PASS_CHANCE * 100), set: (v) => { CONFIG.BROKEN_PASS_CHANCE = v / 100; }, fmt: (v) => v + '%' },
  { id: 'Tackle', get: () => Math.round(CONFIG.AI_TACKLE_CHANCE * 100), set: (v) => { CONFIG.AI_TACKLE_CHANCE = v / 100; }, fmt: (v) => v + '%' },
  { id: 'Res', get: () => CONFIG.RENDER_H, set: (v) => { CONFIG.RENDER_H = v; resize(); }, fmt: (v) => v + 'p' },
  { id: 'Shake', get: () => Math.round(CONFIG.RUN_SHAKE * 100), set: (v) => { CONFIG.RUN_SHAKE = v / 100; }, fmt: (v) => v === 0 ? 'desligada' : String(v) },
];
function syncSettings() {
  for (const s of SETTINGS) { const v = s.get(); $('set' + s.id).value = v; $('out' + s.id).textContent = s.fmt(v); }
  $('setFps').checked = !$('fps').hidden;
}
for (const s of SETTINGS) {
  $('set' + s.id).addEventListener('input', (e) => { const v = Number(e.target.value); s.set(v); $('out' + s.id).textContent = s.fmt(v); });
}
$('setFps').addEventListener('change', (e) => { $('fps').hidden = !e.target.checked; });

$('pauseBtn').addEventListener('click', pauseGame);
// Botão de som (ao lado do radar). Lembra a escolha entre as partidas.
(function () {
  const b = document.createElement('button');
  b.id = 'somBtn'; b.className = 'hudBtn'; b.setAttribute('aria-label', 'Som');
  b.style.cssText = 'right:calc(84px + env(safe-area-inset-right, 0px));width:44px;padding:0;font-size:10px;';
  const pinta = () => { b.textContent = Som.mudo ? 'MUDO' : 'SOM'; b.style.opacity = Som.mudo ? '0.6' : '1'; };
  pinta();
  b.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); Som.ligar(); Som.alternarMudo(); pinta(); });
  $('pauseBtn').parentNode.appendChild(b);
})();
$('resumeBtn').addEventListener('click', resumeGame);
$('restartBtn').addEventListener('click', resetMatch);
$('againBtn').addEventListener('click', resetMatch);
// DIAGNÓSTICO DE TELA: toque 5 vezes na linha da versão (ou F9 no PC). Mostra os tamanhos que
// o jogo enxerga e um quadrado com um círculo: se o círculo aparecer oval, quem está esticando a
// imagem é a página de fora (o Canva), não o jogo.
(function () {
  let toques = 0, ultimo = 0;
  const painel = document.createElement('div');
  painel.style.cssText = 'position:fixed;z-index:20;left:8px;top:8px;background:rgba(7,20,48,.95);color:#fff;font:12px/1.4 monospace;padding:10px;border:2px solid #f7941d;display:none;max-width:90%';
  raizJogo.appendChild(painel);
  function mostrar() {
    const vv = window.visualViewport;
    painel.innerHTML = 'versão ' + VERSAO_JOGO + ' · ' + (window.__FUTEBOL_ORIGEM || 'direto') +
      '<br>janela (iframe): ' + innerWidth + ' × ' + innerHeight +
      '<br>área visível usada: ' + AREA.w + ' × ' + AREA.h + ' (topo ' + AREA.topo + ')' +
      '<br>tela do aparelho: ' + screen.width + ' × ' + screen.height + ' · dpr ' + devicePixelRatio +
      '<br>visualViewport: ' + (vv ? Math.round(vv.width) + ' × ' + Math.round(vv.height) + ' · zoom ' + vv.scale.toFixed(2) : '-') +
      '<br>dentro de iframe: ' + (window.top !== window.self ? 'sim' : 'não') +
      '<div style="margin-top:8px;width:100px;height:100px;border:2px solid #6bf08e;position:relative">' +
      '<div style="position:absolute;inset:8px;border-radius:50%;border:2px solid #f7941d"></div></div>' +
      'O círculo laranja está redondo? (toque aqui para fechar)';
    painel.style.display = 'block';
  }
  painel.addEventListener('pointerdown', (e) => { e.stopPropagation(); painel.style.display = 'none'; });
  $('versaoInfo').addEventListener('pointerdown', () => {
    const t = performance.now();
    toques = t - ultimo < 1500 ? toques + 1 : 1; ultimo = t;
    if (toques >= 5) { toques = 0; mostrar(); }
  });
  window.addEventListener('keydown', (e) => { if (e.code === 'F9') { e.preventDefault(); painel.style.display === 'block' ? (painel.style.display = 'none') : mostrar(); } });
})();
// Versão mostrada = o que está no versao.txt do GitHub (quem manda no número é você).
// O carregador do Canva compara o versao.txt de agora com window.__FUTEBOL_VERSAO para avisar
// que tem atualização; antes ele comparava com o número escrito aqui dentro do código, e se os
// dois fossem diferentes o aviso aparecia para sempre (mesmo depois de atualizar).
function mostrarVersao(v) {
  $('versaoInfo').textContent = 'versão ' + v + (window.__FUTEBOL_CARREGADOR ? ' · carregador ' + window.__FUTEBOL_CARREGADOR + ' · ' + (window.__FUTEBOL_ORIGEM || '') : '');
}
mostrarVersao(VERSAO_JOGO);
(function lerVersaoTxt() {
  const base = window.__FUTEBOL_ORIGEM === 'github' ? 'https://raw.githubusercontent.com/herick-css/futebol-js-jogo/main/futebol-js/'
    : window.__FUTEBOL_ORIGEM === 'jsdelivr' ? 'https://cdn.jsdelivr.net/gh/herick-css/futebol-js-jogo@main/futebol-js/' : '';
  if (!base && location.protocol === 'file:') return;          // aberto do pendrive: fica o número do código
  fetch(base + 'versao.txt?v=' + Math.floor(Date.now() / 60000), { cache: 'no-store' })
    .then((r) => (r.ok ? r.text() : ''))
    .then((t) => { t = t.trim(); if (t && t.length < 20) { window.__FUTEBOL_VERSAO = t; mostrarVersao(t); } })
    .catch(() => {});
})();
$('startBtn').addEventListener('click', () => {
  Som.ligar();
  try {
    const el = document.documentElement;
    if (el.requestFullscreen && window.matchMedia('(pointer: coarse)').matches) {
      el.requestFullscreen().then(() => screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape').catch(() => {})).catch(() => {});
    }
  } catch (err) { /* sem tela cheia, segue normal */ }
  montarPartida(lerTelaDeConfig());               // escolhas da tela (campo, times, clima...)
  resetMatch();
});

// ---------------------------------------------------------------------
// 17. CÂMERA E DESENHO
// Três câmeras:
//   - de jogo, modo BOLA (padrão): atrás de você, girando devagar para a bola. Com a bola no pé,
//     ela vira para o gol adversário misturado com a sua direção (como no Rumo ao Estrelato).
//   - de jogo, modo FRENTE: atrás de você, sempre olhando para o gol adversário.
//   - de cena: zoom do drible (por cima do ombro) e a câmera que acompanha o cobrador.
// ---------------------------------------------------------------------
const cam = { px: 0, py: 0, pz: 0, tx: 0, ty: 0, tz: 0, shake: 0, yaw: 0, mode: 'bola' };
const KICK_STATES = ['aim', 'power', 'spin'];

function updateYaw(rdt) {
  if (G.cine || G.shotCine || G.state === 'restart' || G.state === 'foul') return;   // nas cenas a câmera não gira
  let want, rapidez = CONFIG.CAM.turn;
  const S = G.sp;
  if (KICK_STATES.includes(G.state)) {
    // Mirando: a câmera vai virando devagar para o lado da seta (75% do caminho), mostrando para
    // onde você aponta sem tirar você da tela. A seta não depende disso (usa a câmera do começo).
    const k = G.kick;
    if (!k || !k.aimed) return;
    want = k.yawRef + wrapAngle(Math.atan2(k.dirZ, k.dirX) - k.yawRef) * 0.75;
    rapidez = 1.6;
  } else if (G.state === 'celebrate') {                  // comemoração: a câmera vai atrás de você
    const sp = Math.hypot(user.vx, user.vz);
    want = sp > 1.5 ? Math.atan2(user.vz, user.vx) : cam.yaw;
  } else if (cam.mode === 'frente') want = 0;
  else if (G.possession === user) {
    const toGoal = Math.atan2(-user.z * 0.3, HALF_L - user.x);
    want = toGoal + wrapAngle(user.angle - toGoal) * 0.35;
  } else {
    const dx = ball.x - user.x, dz = ball.z - user.z;
    want = Math.hypot(dx, dz) > 2 ? Math.atan2(dz, dx) : cam.yaw;
  }
  cam.yaw = wrapAngle(cam.yaw + wrapAngle(want - cam.yaw) * (1 - Math.exp(-rdt * rapidez)));
}

function cameraGoal() {
  const c = CONFIG.CAM;
  if (G.state === 'fim') return cameraFim();
  if (G.state === 'subst' && G.subst) return cameraSubstituicao();
  if (G.pen) return cameraPenaltis();
  if (G.espectador) return { px: ball.x * 0.9, py: 13, pz: -(HALF_W + 9), tx: ball.x, ty: 0, tz: ball.z * 0.8 };   // sem você: câmera de TV
  if (G.cine) {                                   // drible: câmera de lado, entre você e o marcador
    const C = G.cine, s = C.camSide, o = C.opp;
    const mx = (user.x + o.x) / 2, mz = (user.z + o.z) / 2;
    return { px: mx + C.px * s * 6.4, py: 1.8, pz: mz + C.pz * s * 6.4, tx: mx, ty: 1.0, tz: mz };
  }
  if (G.shotCine) return shotCameraGoal();
  if (G.celebAuto) return cameraCelebAuto();
  if (G.state === 'goal' && G.golAutor) {         // gol de outro: câmera na comemoração de quem fez
    const a = G.golAutor, ang = a.angle + 0.6;
    return { px: a.x + Math.cos(ang) * 6, py: 2.3, pz: a.z + Math.sin(ang) * 6, tx: a.x, ty: 1.0, tz: a.z };
  }
  if (G.state === 'foul' && G.foul && G.foul.ar) {  // impedimento: de dentro do campo, olhando o bandeirinha
    const a = G.foul.ar, zs = Math.sign(a.z) || 1;
    return { px: a.x - 3.2, py: 1.9, pz: a.z - zs * 6.5, tx: a.x, ty: 1.5, tz: a.z };
  }
  if (G.state === 'foul' && G.foul) {             // paralisação: o juiz chegando, apitando e mostrando cartão
    const s = G.foul.spot, r = referee;
    const mx = (s.x + r.x) / 2, mz = (s.z + r.z) / 2;
    let vx = -mx, vz = -mz * 1.3; const vl = Math.hypot(vx, vz) || 1; vx /= vl; vz /= vl;
    return { px: mx + vx * 7.5 - vz * 2, py: 2.6, pz: mz + vz * 7.5 + vx * 2, tx: mx, ty: 1.1, tz: mz };
  }
  if (G.state === 'restart' && G.sp && (G.sp.kind === 'falta' || G.sp.kind === 'penalti')) {   // falta/pênalti: atrás da bola, olhando o gol
    const S = G.sp, atk = S.team === 0 ? 1 : -1;
    let vx = atk * HALF_L - S.ballSpot.x, vz = -S.ballSpot.z; const vl = Math.hypot(vx, vz) || 1; vx /= vl; vz /= vl;
    return { px: S.ballSpot.x - vx * 6.5, py: 2.6, pz: S.ballSpot.z - vz * 6.5, tx: S.ballSpot.x + vx * 9, ty: 1.2, tz: S.ballSpot.z + vz * 9 };
  }
  if (G.state === 'restart' && G.sp) {            // cena: acompanha o cobrador, vista de dentro do campo
    const p = G.sp.taker;
    let vx = -p.x, vz = -p.z * 1.4;
    const vl = Math.hypot(vx, vz) || 1; vx /= vl; vz /= vl;
    return { px: p.x + vx * 6.5, py: 2.8, pz: p.z + vz * 6.5, tx: p.x, ty: 1.0, tz: p.z };
  }
  const fx = Math.cos(cam.yaw), fz = Math.sin(cam.yaw);
  let back = c.back, h = c.height, ahead = c.ahead;
  if (G.kick && KICK_STATES.includes(G.state)) {
    if (G.kick.throwIn) {
      // Lateral: atrás e de lado (por cima do ombro), alto o bastante para ver o campo e você.
      // (Conferido no 3D: só "atrás e alto" deixava você fora da tela.)
      const sx = -fz, sz = fx;                     // lado
      return { px: user.x - fx * 3 + sx * 2.5, py: 3.8, pz: user.z - fz * 3 + sz * 2.5, tx: user.x + fx * 8, ty: 0.5, tz: user.z + fz * 8 };
    }
    else { back += 1.6; h += 1.4; ahead += 5; }              // mirando: abre a visão
  }
  if (cam.mode === 'bola' && G.possession !== user) {   // bola longe: afasta um pouco para caber os dois
    const d = dist2D(user, ball);
    back += Math.min(5, d * 0.1); h += Math.min(2.5, d * 0.06);
  }
  // A câmera nunca vai para trás das placas (lá ela ficaria dentro da torcida e você não veria
  // nada — era o que acontecia no lateral e no escanteio). Se passar, ela para na placa e sobe.
  let px = user.x - fx * back, pz = user.z - fz * back;
  const sx = Math.max(0, Math.abs(px) - (BOARD_X - 0.8)), sz = Math.max(0, pz > 0 ? pz - (BOARD_Z - 0.8) : -pz - (BOARD_ZN - 0.8));
  if (sx || sz) { px = clamp(px, -(BOARD_X - 0.8), BOARD_X - 0.8); pz = clamp(pz, -(BOARD_ZN - 0.8), BOARD_Z - 0.8); h += (sx + sz) * 0.7; }
  return { px, py: h, pz, tx: user.x + fx * ahead, ty: c.lookY, tz: user.z + fz * ahead };
}

function snapCamera() {
  cam.yaw = 0;
  Object.assign(cam, cameraGoal());
}

function updateCamera(rdt) {
  updateYaw(rdt);
  const g = cameraGoal();
  let k = 1 - Math.exp(-rdt * (G.cine || G.shotCine || G.state === 'restart' || G.state === 'foul' ? 6 : 5));
  const corte = (G.cine && G.cine.cut) || (G.shotCine && G.shotCine.cut) || (G.foul && G.foul.cut) || (G.state === 'fim' && G.fimCorte);   // corte seco de câmera
  if (corte) { k = 1; G.fimCorte = false; if (G.cine) G.cine.cut = false; if (G.shotCine) G.shotCine.cut = false; if (G.foul) G.foul.cut = false; }
  cam.px = lerp(cam.px, g.px, k); cam.py = lerp(cam.py, g.py, k); cam.pz = lerp(cam.pz, g.pz, k);
  cam.tx = lerp(cam.tx, g.tx, k); cam.ty = lerp(cam.ty, g.ty, k); cam.tz = lerp(cam.tz, g.tz, k);
  const sp = Math.hypot(user.vx, user.vz);
  const want = user.running && sp > 4 && G.state === 'play' ? 1 : 0;
  cam.shake = lerp(cam.shake, want, 1 - Math.exp(-rdt * 6));
  const t = performance.now() / 1000, a = CONFIG.RUN_SHAKE * cam.shake;
  const sx = (Math.sin(t * 23.0) + Math.sin(t * 37.3) * 0.5) * a * 0.6;
  const sy = Math.abs(Math.sin(t * 11.5)) * a * 1.2;
  const sz = (Math.sin(t * 17.1) + Math.sin(t * 29.7) * 0.5) * a * 0.6;
  camera.position.set(cam.px + sx, cam.py + sy, cam.pz + sz);
  camera.lookAt(cam.tx + sx * 0.5, cam.ty + sy * 0.3, cam.tz + sz * 0.5);
}

// Animação dos bonecos (estilo Super Lan Master): membros "perseguem" o balanço do passo.
// Poses especiais: 'up' (braços para cima: comemoração, lateral, mergulho do goleiro)
// e 'hold' (braços para a frente: goleiro com a bola nas mãos).
function poseOf(p) {
  if (G.state === 'goal' && p.team === G.scoredBy && p.role !== 'GK') return 'up';
  if (G.state === 'celebrate' && p.team === 0 && !p.isUser && p.role !== 'GK' && dist2D(p, user) < 4) return 'up';
  if (p.throwIn || p.diveT > 0 || p.jumpT > 0) return 'up';
  if (p.carry || (p.role === 'GK' && G.possession === p && !p.goalKick && !p.comPe)) return 'hold';
  return null;
}

let CORPOS = players.concat(officials);      // jogadores + arbitragem (mesma animação)
function syncMeshes(dt) {
  const agora = performance.now();
  const k = Math.min(1, dt * 14);
  for (const p of CORPOS) {
    const m = p.mesh;
    const pose = poseOf(p);
    m.raiz.position.set(p.x, 0, p.z);
    m.raiz.rotation.y = -p.angle;
    const sp = Math.hypot(p.vx, p.vz);
    const correndo = sp > 4.6;
    // Passos na grama (só você, só correndo): um a cada meia volta do balanço da perna.
    if (p.isUser) {
      const passo = Math.floor(p.anim / Math.PI);
      if (passo !== p.ultimoPasso) { p.ultimoPasso = passo; if (correndo && p.fall === 0 && (G.state === 'play' || G.state === 'celebrate')) Som.passo(); }
    }
    const amp = sp < 0.3 ? 0 : (correndo ? 0.95 : 0.55 + Math.min(0.15, sp * 0.04));
    const bal = Math.sin(p.anim) * amp;
    // Pernas (com chute: a direita vai atrás e depois para a frente com força).
    let legR = -bal, legL = bal;
    if (p.kickT > 0) { const q = 1 - p.kickT / 0.35; legR = q < 0.35 ? -0.7 * (q / 0.35) : -0.7 + (q - 0.35) / 0.65 * 2.1; }
    // Bote do marcador: estica a perna direita na direção da bola, a esquerda fica para trás.
    if (p.tackle > 0) { legR = lerp(legR, 1.25, p.tackle); legL = lerp(legL, -0.4, p.tackle); }
    // Preparação do chute (enquanto você mira): perna de chute vai para trás devagar.
    // Preparação: seu chute/passe (G.kick.windup) ou o chute da IA (chutePrep). No lateral não
    // tem perna para trás: a preparação é dos braços (mais abaixo).
    const arremesso = p.isUser && G.kick && G.kick.throwIn;
    const prep = p.isUser && G.kick && !arremesso ? (p.bolaFixa ? 0 : G.kick.windup) : (p.chutePrep > 0 ? smooth(1 - p.chutePrep / p.chutePrepDur) : 0);
    if (prep > 0) { legR = lerp(legR, -0.95, prep); legL = lerp(legL, 0.15, prep); }
    if (p.fall > 0 && p.fallKind === 'frente') { legL = lerp(legL, -0.3, p.fall); legR = lerp(legR, -0.12, p.fall); } // pernas largadas
    if (p.carretel > 0) { legR = lerp(legR, -1.9, p.carretel); legL = lerp(legL, 0.25, p.carretel); }   // calcanhar levanta a bola por trás
    m.pernaE.rotation.z += (legL - m.pernaE.rotation.z) * k;
    m.pernaD.rotation.z += (legR - m.pernaD.rotation.z) * (p.kickT > 0 || p.carretel > 0 ? Math.min(1, dt * 30) : k);
    // Braços.
    let aZL = -bal * 0.8, aZR = bal * 0.8, aXL = p.guard * 0.7, aXR = -p.guard * 0.7;
    if (pose === 'up') { aZL = aZR = Math.PI * 0.92; aXL = 0.2; aXR = -0.2; }
    if (pose === 'hold') { aZL = aZR = 1.25; aXL = -0.15; aXR = 0.15; }   // mãos fechando dos lados da bola
    if (p.tackle > 0) { aZL = aZR = 0.6 * p.tackle; aXL = 0.9 * p.tackle; aXR = -0.9 * p.tackle; }
    const caiFrente = p.fall > 0 && p.fallKind === 'frente';
    if (p.fall > 0 && p.fallKind === 'costas') { aZL = aZR = -0.2 * p.fall; aXL = 0.9 * p.fall; aXR = -0.9 * p.fall; }
    if (caiFrente) {                              // braços esticados à frente para apoiar no chão
      const f = p.fall;
      aZL = lerp(aZL, 2.8, f); aZR = lerp(aZR, 2.7, f); aXL = 0.45 * f; aXR = -0.35 * f;   // conferido: nada abaixo do gramado
    }
    // Caído de lado: o braço de baixo vai para cima da cabeça (senão ele atravessa o gramado).
    if (p.fall > 0 && !caiFrente && p.fallKind !== 'costas') {
      if (p.fallSide > 0) aXR = lerp(aXR, -3.0, p.fall); else aXL = lerp(aXL, 3.0, p.fall);
    }
    if (prep > 0) { aXL = lerp(aXL, 0.75, prep); aXR = lerp(aXR, -0.45, prep); aZR = lerp(aZR, -0.4, prep); }
    // PEDINDO A BOLA (4.1.1): levanta a mão direita (balançando de leve) enquanto pede.
    if (p.isUser && G.userRequest > 0 && G.possession !== p && G.state === 'play') { aZR = 2.85 + Math.sin(agora / 110) * 0.18; aXR = -0.3; }
    // EMPURRÃO NAS COSTAS (4.1.1): os dois braços esticados para a frente.
    if (p.empurrao > 0) { const e = Math.sin(clamp(p.empurrao / 0.55, 0, 1) * Math.PI); aZL = aZR = lerp(aZL, 1.5, e); aXL = lerp(aXL, -0.1, e); aXR = lerp(aXR, 0.1, e); }
    // DISPUTA DE CORPO: o braço do lado do adversário "segura o espaço". (4.1.1) 4 jeitos
    // (DISPUTA_POSES), trocando a cada 0,8–1,6 s, com um balanço leve — fica mais natural.
    // O outro braço continua o balanço da corrida.
    const dk = p.disputaK > 0.01 && p.fall === 0 && !(p.tackle > 0) ? p.disputaK : 0;
    if (dk > 0) {
      const V = DISPUTA_POSES[p.disputaVar || 0], sw = Math.sin(p.anim * 0.5 + p.id) * 0.08;
      if (p.disputaLado < 0) { aXL = lerp(aXL, V.ox + sw, dk); aZL = lerp(aZL, V.oz + sw, dk); }
      else { aXR = lerp(aXR, -V.ox - sw, dk); aZR = lerp(aZR, V.oz + sw, dk); }
    }
    m.corpo.rotation.x = (p.disputaLado || 0) * 0.1 * dk;   // ombro inclinado para o lado dele
    p.dkVis = dk;
    if (G.substToque && G.substToque.includes(p)) { aZR = 2.5; aXR = -0.1; }   // substituição: "toca aqui"
    if (G.state === 'fim' && p.fim) {               // cena final: tchau para a torcida e "toca aqui"
      const F = p.fim, tt = G.fimT;
      if (F.tipo === 'tchau' && tt > F.t0) {
        aZR = 2.85; aXR = -0.35 + Math.sin(tt * 9 + p.id) * 0.4;      // braço direito no alto balançando
        aZL = -bal * 0.5; aXL = 0.1;
      } else if (F.tipo === 'toca' && F.batida > 0) {
        const b = Math.sin(Math.min(1, F.batida) * Math.PI);           // sobe, bate e desce
        aZR = lerp(aZR, 2.45, b); aXR = lerp(aXR, 0.15, b);            // mão um pouco para dentro, na direção do outro
      }
    }
    // Lateral: mirando, os braços vão para trás da cabeça; soltou, eles vêm para a frente.
    if (arremesso) { aZL = aZR = lerp(Math.PI * 0.92, 3.55, G.kick.windup); aXL = 0.25; aXR = -0.25; }
    if (p.throwAnim > 0) { const f = p.throwAnim / 0.3; aZL = aZR = lerp(1.5, 3.55, f); aXL = 0.25; aXR = -0.25; }
    // Arbitragem: apito (braço direito para cima, esquerdo apontando), cartão e bandeira levantada.
    if (p.refPose === 'apito') { aZR = 2.95; aXR = -0.1; aZL = 1.55; aXL = 0.1; }
    else if (p.refPose === 'cartao') { aZR = 3.05; aXR = -0.05; aZL = 0; aXL = 0.2; }
    else if (p.refPose === 'bandeira') { aZR = 3.0; aXR = -0.15; }
    // Barreira: mãos juntas na frente do corpo.
    if (p.wallSlot >= 0 && G.sp && G.sp.kind === 'falta') { aZL = aZR = 0.45; aXL = -0.35; aXR = 0.35; }
    m.bracoE.rotation.z += (aZL - m.bracoE.rotation.z) * k;
    m.bracoD.rotation.z += (aZR - m.bracoD.rotation.z) * k;
    m.bracoE.rotation.x += (aXL - m.bracoE.rotation.x) * k;
    m.bracoD.rotation.x += (aXR - m.bracoD.rotation.x) * k;
    // Corpo: passo, inclinação na corrida, agachado na marcação, cabisbaixo depois de levar gol.
    const sobe = sp > 0.3 ? Math.abs(Math.sin(p.anim)) * (correndo ? 0.08 : 0.05) : Math.sin(agora / 600 + p.id) * 0.008;
    // Segurando a bola nas mãos: tronco reto (sem agachar), senão as mãos descem e a bola
    // fica "dentro" do goleiro. Com o tronco reto as mãos fecham nos lados da bola (conferido).
    const segurando = pose === 'hold';
    m.corpo.position.y = caiFrente ? 0 : segurando ? 0 : sobe - p.guard * 0.12;
    let incl = correndo ? -0.16 : (sp > 0.3 ? -0.05 : 0);
    incl -= 0.18 * p.guard + 0.35 * p.tackle;
    if (prep > 0) incl = lerp(incl, 0.14, prep);
    if ((G.state === 'goal' || G.state === 'celebrate') && p.team !== G.scoredBy && p.team < 2) incl = -0.3;
    if (p.stun > 0 && p.fall === 0 && p.diveT <= 0 && !p.perda) incl += Math.sin(G.time * 18) * 0.15;   // (perdendo a bola: a animação dela manda)
    if (caiFrente) incl = lerp(incl, 0.12, p.fall);   // deitado, levanta um pouco a cabeça
    if (segurando) incl = 0;
    m.corpo.rotation.z += (incl - m.corpo.rotation.z) * k;
    // Altura: pulo do goleiro, voo do mergulho, pulinhos da comemoração.
    let y = 0;
    if (p.diveT > 0) y = alturaMergulho(p);
    else if (p.jumpT > 0) y = Math.sin((1 - p.jumpT / 0.5) * Math.PI) * 0.7;
    else if (pose === 'up' && (G.state === 'goal' || G.state === 'celebrate')) y = Math.abs(Math.sin(agora / 160 + p.id)) * 0.25;
    m.raiz.position.y = y;
    // Tombos: mergulho do goleiro (de lado) ou marcador driblado (cai de frente, meio de lado).
    let tomb = 0, frente = 0;
    if (p.diveT > 0) tomb = p.diveSide * tombMergulho(p);
    else if (caiFrente) {
      // Tomba para a frente acelerando (como quem tropeça) e termina deitado de bruços.
      // O corpo sobe 0,17 m conforme deita, para o peito e o rosto ficarem EM CIMA do gramado
      // (girar só pelos pés fazia a frente do corpo entrar no chão).
      const f = p.fall;
      frente = -1.5 * Math.pow(f, 1.25);
      tomb = 0.2 * p.fallSide * f;
      y = Math.max(y, 0.17 * f + Math.sin(Math.min(1, f) * Math.PI) * 0.06);
      m.raiz.position.y = y;
    }
    else if (p.fall > 0 && p.fallKind === 'costas') {
      // Deitado de costas (depois da bicicleta): corpo sobe para as costas ficarem em cima do gramado.
      frente = 1.45 * p.fall; y = Math.max(y, 0.17 * p.fall); m.raiz.position.y = y;
    }
    else if (p.fall > 0) {
      // De lado: o corpo sobe a "espessura" do ombro para deitar EM CIMA do gramado (conferido).
      tomb = p.fall * 1.35 * p.fallSide;
      y = Math.max(y, 0.3 * Math.sin(Math.min(1, p.fall) * Math.PI / 2)); m.raiz.position.y = y;
    }
    if (p.mancando && sp > 0.3 && !tomb) tomb = Math.sin(p.anim) * 0.13;   // lesionado: anda mancando
    m.raiz.rotation.x = tomb;
    m.raiz.rotation.z = frente;
    // Comemoração: a pose vem dos quadros-chave (por cima de tudo).
    if (p.celeb) {
      const c = CELEBRACOES[p.celeb.name];
      let P = celebPose(c, p.celeb.t);
      let corre = p.celeb.t < c.swing ? Math.sin(p.anim) * 0.9 : 0;
      if (p.isUser && c.controlado) {
        // Braços abrindo (0,3 s) e o corpo inclinando para dentro da curva que você faz.
        const ab = smooth(Math.min(1, p.celeb.t / 0.3));
        const roll = clamp((p.giro || 0) * 0.25, -0.5, 0.5);   // 15% menos que antes; braço não encosta no chão
        p.rollAviao = lerp(p.rollAviao || 0, roll, Math.min(1, dt * 8));
        P = { y: 0, lean: sp > 0.5 ? -0.18 : -0.05, roll: p.rollAviao * ab, aLz: 0, aRz: 0, aLx: lerp(0.2, 1.5, ab), aRx: lerp(-0.2, -1.5, ab), lLz: 0, lRz: 0 };
        corre = sp > 0.5 ? Math.sin(p.anim) * 0.9 : 0;
      }
      m.raiz.position.y = P.y; m.raiz.rotation.x = P.roll; m.raiz.rotation.z = 0;
      m.corpo.rotation.z = P.lean; m.corpo.position.y = 0;
      m.bracoE.rotation.z = P.aLz; m.bracoD.rotation.z = P.aRz;
      m.bracoE.rotation.x = P.aLx; m.bracoD.rotation.x = P.aRx;
      m.pernaE.rotation.z = P.lLz + corre; m.pernaD.rotation.z = P.lRz - corre;
      usarJoelhos(m, P.jL || 0, P.jR || 0);
    }
    if (p.slidePose > 0) {
      // Carrinho: deita para trás de lado, perna da frente esticada rente ao chão.
      const a = smooth(p.slidePose);
      m.raiz.rotation.z = lerp(m.raiz.rotation.z, 1.2, a); m.raiz.rotation.x = 0.25 * a;
      m.raiz.position.y = Math.max(m.raiz.position.y, 0.24 * a);
      m.pernaD.rotation.z = lerp(m.pernaD.rotation.z, 0.4, a); m.pernaE.rotation.z = lerp(m.pernaE.rotation.z, 0.75, a);
      m.bracoE.rotation.x = 0.9 * a; m.bracoD.rotation.x = -0.9 * a; m.bracoE.rotation.z = -0.4 * a; m.bracoD.rotation.z = -0.1 * a;   // conferido: nada abaixo do gramado
      m.corpo.rotation.z = 0.15 * a;
    }
    const lamentando = p.lamento && p.lamentoK > 0 && !p.celeb && (G.state === 'goal' || G.state === 'celebrate' || G.state === 'fim');
    if (lamentando) aplicarLamento(p, m);
    if (!(lamentando && p.lamento === 'cintura')) {   // fora da pose triste: volta braço inteiro e cabeça presa
      usarCotovelos(m, 0, 0);
      if (m.cabecaLigada) usarCabeca(m, 0);
      // Disputa de corpo: o antebraço do lado do adversário dobra para a frente ("protegendo").
      if (p.dkVis > 0) { const V = DISPUTA_POSES[p.disputaVar || 0]; usarCotovelo(p.disputaLado < 0 ? m.bracoE : m.bracoD, (p.disputaLado < 0 ? 1 : -1) * V.cx * p.dkVis, V.cz * p.dkVis); }
    }
    if (!p.celeb && !(p.lamento === 'sentado' && p.lamentoK > 0) && !(p.isUser && G.celebAuto) && m.joelhosLigados) usarJoelhos(m, 0, 0);
    if (p.isUser && G.celebAuto) aplicarCelebAuto(p, m);
    // Braço aberto para o lado (aviãozinho, apito...): o ombro chega um pouco para dentro, senão
    // aparece um vão entre o braço e o tronco (o pivô do ombro fica a 0,39 m do centro).
    m.bracoE.position.z = -0.39 + 0.09 * Math.abs(Math.sin(m.bracoE.rotation.x));
    m.bracoD.position.z = 0.39 - 0.09 * Math.abs(Math.sin(m.bracoD.rotation.x));
    if (p.recvPose) aplicarPoseRecepcao(p, m);
    if (p.perda) aplicarPerda(p, m);
    if (p.driblePose) aplicarDriblePose(p, m); else if (m.pernaE.rotation.x || m.pernaD.rotation.x) { m.pernaE.rotation.x = 0; m.pernaD.rotation.x = 0; }
    m.etiqueta.visible = G.state !== 'fim' && (p.isUser || dist2D(p, user) < CONFIG.LABEL_RANGE);   // na cena final, sem nomes
  }
  ball.mesh.visible = ball.shadow.visible = !ball.hidden;
  ball.mesh.position.set(ball.x, ball.y, ball.z);
  // Só gira quando está rolando/voando. Nas mãos (goleiro, lateral, cobrador levando) fica parada.
  const h = G.possession;
  const naMao = (h && (h.carry || h.throwIn || (h.role === 'GK' && !h.goalKick && !h.comPe))) || (G.sp && G.sp.taker && G.sp.taker.carry) || G.recvFx;
  if (!naMao) {
    ball.mesh.rotation.x += ball.vz * dt / CONFIG.BALL_R;
    ball.mesh.rotation.z -= ball.vx * dt / CONFIG.BALL_R;
  }
  ball.shadow.position.set(ball.x, 0.02, ball.z);
  ball.shadow.scale.setScalar(Math.max(0.4, 1 - (ball.y - CONFIG.BALL_R) * 0.12));
  userRing.position.set(user.x, 0.03, user.z);
  userRing.visible = !G.cine && !G.espectador;
  const kk = G.kick;
  aimArrow.visible = !!kk;
  if (kk) { aimArrow.position.set(ball.x, kk.throwIn ? 0.06 : 0.06, ball.z); aimArrow.rotation.y = -Math.atan2(kk.dirZ, kk.dirX); }
  targetRing.visible = !!(kk && kk.target);
  if (targetRing.visible) targetRing.position.set(kk.target.x, 0.04, kk.target.z);
  const showDr = G.dribbleWin > 0 && !!G.dribbleOpp;
  if (showDr) dribbleRing.position.set(G.dribbleOpp.x, 0.04, G.dribbleOpp.z);
  dribbleRing.visible = showDr;
}

// ---------------------------------------------------------------------
// 18. LOOP PRINCIPAL
// DESEMPENHO (o que foi revisado nesta versão):
//   - listas de time fixas (TEAMS) em vez de filtrar arrays várias vezes por quadro
//   - papéis da IA recalculados a cada 0,3 s, não todo quadro
//   - HUD só escreve no DOM quando o valor muda; barra de estamina e de tempo usam transform
//   - radar redesenhado 15×/s; torcida com 4 quadros prontos, só trocados 7×/s (v7)
//   - bonecos com 5 malhas cada e cenário em lotes: ~630 → ~110 chamadas de desenho (v7)
//   - materiais e geometrias de caixa reaproveitados; cenário parado com matrizes congeladas
//   - resolução interna baixa (RENDER_H) continua sendo o maior ganho
// ---------------------------------------------------------------------
function stepGame(dt, rdt) {
  if (relogioCorre()) G.clock -= dt;
  tecnicoPensa();
  verificarSubstituicoes();
  atualizarPenaltis(dt);
  verificarFimDeTempo(dt);
  if (G.userRequest > 0) G.userRequest -= dt;
  keyboardAim();
  updateRoles(dt);
  updatePlayers(dt);
  updateCobrador(rdt);
  atualizarDisputas(dt);
  updateBall(dt);
  updateCine(dt);
  updateRestart(dt);
  updateDribbleWindow(dt);
  updateKickClock(rdt);
  updateShotCine(rdt);
  updateSpares(dt);
  updateOfficials(dt, rdt);
  updateSlides(dt);
  updateParadoComBola(dt);
  checarComemoracaoAuto();
  updateComemoracaoAuto(dt);
  updateExpulsos(dt);
  updateFoul(rdt);
  if (G.state === 'fim') updateFimDeJogo(rdt);
  if (G.passTarget) { G.passTarget.t -= dt; if (G.passTarget.t <= 0 || G.state !== 'play') G.passTarget = null; }
  if (G.state === 'play') {
    handleBallOut();
    if (G.state === 'play') checkBallContacts();
  }
  if (G.state === 'power') updatePowerMeter();
  if (G.state === 'spin' && G.kick && !G.kick.spinChosen) {
    G.kick.spinT += rdt;
    if (G.kick.spinT > 6 && !G.kick.semLimite) chooseSpin(0, 0);
  }
  if (G.state === 'dribble') updateTiming(rdt);
  updateReceive(rdt);
  if (G.recvIgnore > 0) G.recvIgnore -= dt;
  if (G.state === 'celebrate') {
    G.celebT -= rdt;
    if (G.celebT <= 0) endCelebration();
  }
  if (G.state === 'goal') {
    G.goalTimer -= rdt;
    G.goalT = (G.goalT || 0) + rdt;
    if (G.goalT > 0.8) G.targetScale = 1;          // câmera lenta só no comecinho
    if (G.goalTimer <= 0 && !G.fading && !G.replayFeito) { G.replayFeito = true; iniciarReplayGol(() => {}); return; }   // replay antes da saída
    if (G.goalTimer <= 0 && !G.fading) {
      // Escurece a tela, reposiciona todo mundo e clareia (em vez do "teletransporte" à vista).
      G.fading = true;
      $('fade').classList.add('on');
      setTimeout(() => { kickoff(G.lastConceded); snapCamera(); $('fade').classList.remove('on'); G.fading = false; }, 380);
    }
  }
}

// =====================================================================
// REPLAY (4.0.0)
// Gravação: 30 vezes por segundo (do tempo de jogo) guarda a POSE PRONTA de cada boneco — a
// posição e o giro de cada peça (raiz, corpo, pernas, braços, joelhos, cotovelos, cabeça) — e da
// bola, num "anel" de ~11 s. Assim o replay mostra exatamente o que aconteceu, sem rodar a física
// de novo. (Memória: ~1.100 números por quadro × 340 quadros ≈ 1,5 MB.)
//   Gol: os 10 s antes do gol (+1,5 s depois) em 3 câmeras — TV (alta, da lateral), atrás do gol e
//        perto do lance (a última em câmera lenta). As 3 ficam se repetindo até você tocar em PULAR.
//   Impedimento: volta ao passe (2 s em câmera lenta) e congela no momento do passe com a linha
//        do penúltimo defensor (amarela) e a do atacante (vermelha) no gramado. Termina sozinho.
// =====================================================================
const REPLAY = { HZ: 30, MAX: 340, quadros: [], prox: 0, acc: 0, nCorpos: 0 };
const PECAS_POR_CORPO = 11, VAL_POR_CORPO = PECAS_POR_CORPO * 6 + 5, VAL_BOLA = 6;   // +5: visível, joelhos, cotovelo E/D, cabeça (ligados ou não)
function pecasDe(m) {
  return [m.raiz, m.corpo, m.pernaE, m.pernaD, m.bracoE, m.bracoD, m.pernaE.joelho, m.pernaD.joelho, m.bracoE.cotovelo, m.bracoD.cotovelo, m.cabeca];
}
function limparReplay() { REPLAY.quadros.length = 0; REPLAY.prox = 0; REPLAY.acc = 0; REPLAY.nCorpos = CORPOS.length; }
function gravarQuadro(dt) {
  if (REPLAY.nCorpos !== CORPOS.length) limparReplay();
  REPLAY.acc += dt;
  if (REPLAY.acc < 1 / REPLAY.HZ) return;
  REPLAY.acc = 0;
  let q = REPLAY.quadros[REPLAY.prox];
  if (!q) { q = { t: 0, d: new Float32Array(CORPOS.length * VAL_POR_CORPO + VAL_BOLA) }; REPLAY.quadros[REPLAY.prox] = q; }
  REPLAY.prox = (REPLAY.prox + 1) % REPLAY.MAX;
  q.t = G.time;
  const d = q.d;
  let k = 0;
  for (const p of CORPOS) {
    for (const o of pecasDe(p.mesh)) { d[k++] = o.position.x; d[k++] = o.position.y; d[k++] = o.position.z; d[k++] = o.rotation.x; d[k++] = o.rotation.y; d[k++] = o.rotation.z; }
    const m = p.mesh;
    d[k++] = m.raiz.visible ? 1 : 0;
    d[k++] = m.joelhosLigados ? 1 : 0; d[k++] = m.bracoE.cotLigado ? 1 : 0; d[k++] = m.bracoD.cotLigado ? 1 : 0; d[k++] = m.cabecaLigada ? 1 : 0;
  }
  const b = ball.mesh;
  d[k++] = b.position.x; d[k++] = b.position.y; d[k++] = b.position.z; d[k++] = b.rotation.x; d[k++] = b.rotation.z; d[k++] = b.visible ? 1 : 0;
}
// Quadros (em ordem de tempo) entre t0 e t1.
function trechoReplay(t0, t1) {
  const n = REPLAY.quadros.length, out = [];
  for (let i = 0; i < n; i++) {
    const q = REPLAY.quadros[(REPLAY.prox + i) % n];
    if (q && q.t >= t0 && q.t <= t1) out.push(q);
  }
  return out;
}
// Põe nos bonecos a pose entre o quadro A e o B (f = 0..1).
function aplicarQuadro(A, B, f) {
  const a = A.d, b = B.d;
  let k = 0;
  const L = (i) => a[i] + (b[i] - a[i]) * f;
  for (const p of CORPOS) {
    const m = p.mesh, pc = pecasDe(m);
    for (let j = 0; j < pc.length; j++) {
      const o = pc[j];
      o.position.set(L(k), L(k + 1), L(k + 2));
      const ry = j === 0 ? a[k + 4] + wrapAngle(b[k + 4] - a[k + 4]) * f : L(k + 4);   // giro do corpo pelo caminho curto
      o.rotation.set(L(k + 3), ry, L(k + 5));
      k += 6;
    }
    // Liga as peças dobráveis exatamente como estavam (as marcas gravadas, não o ângulo).
    const base = k - PECAS_POR_CORPO * 6, liga = (v, ang) => (v > 0.5 ? (ang || 0.0001) : 0);
    const jE = a[base + 6 * 6 + 5], jD = a[base + 7 * 6 + 5];
    usarJoelhos(m, liga(a[k + 1], jE), a[k + 1] > 0.5 ? jD : 0);
    usarCotovelo(m.bracoE, a[k + 2] > 0.5 ? a[base + 8 * 6 + 3] : 0, liga(a[k + 2], a[base + 8 * 6 + 5]));
    usarCotovelo(m.bracoD, a[k + 3] > 0.5 ? a[base + 9 * 6 + 3] : 0, liga(a[k + 3], a[base + 9 * 6 + 5]));
    usarCabeca(m, liga(a[k + 4], a[base + 10 * 6 + 5]));
    m.raiz.visible = a[k] > 0.5; k += 5;
    m.etiqueta.visible = false;
  }
  ball.mesh.position.set(L(k), L(k + 1), L(k + 2));
  ball.mesh.rotation.x = L(k + 3); ball.mesh.rotation.z = L(k + 4); ball.mesh.visible = a[k + 5] > 0.5;
  ball.shadow.position.set(ball.mesh.position.x, 0.02, ball.mesh.position.z); ball.shadow.visible = ball.mesh.visible;
  return { x: ball.mesh.position.x, y: ball.mesh.position.y, z: ball.mesh.position.z };
}

// Linhas do impedimento (só aparecem no replay).
const linhasImped = (() => {
  const g = new THREE.Group(); g.visible = false; scene.add(g);
  const faixa = (cor) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 1), new THREE.MeshBasicMaterial({ color: cor, transparent: true, opacity: 0.9 }));
    const parede = new THREE.Mesh(new THREE.PlaneGeometry(1, 2.2), new THREE.MeshBasicMaterial({ color: cor, transparent: true, opacity: 0.18, side: THREE.DoubleSide, depthWrite: false }));
    g.add(m); g.add(parede);
    return { m, parede };
  };
  return { g, def: faixa(0xffd400), atk: faixa(0xff3b30) };
})();
function posicionarLinha(L, x) {
  L.m.scale.z = CONFIG.FIELD_W; L.m.position.set(x, 0.03, 0);
  L.parede.scale.x = CONFIG.FIELD_W; L.parede.position.set(x, 1.1, 0); L.parede.rotation.y = Math.PI / 2;
}

function iniciarReplay(R) {
  if (!R.quadros || R.quadros.length < 4) { R.depois(); return; }   // sem gravação suficiente: segue o jogo
  R.t = 0; R.cam = 0; R.dur = R.quadros[R.quadros.length - 1].t - R.quadros[0].t;
  R.estadoAntes = G.state;
  G.replay = R; G.state = 'replay';
  setLetterbox(true);
  $('skipBtn').hidden = false; $('skipBtn').textContent = 'Pular replay ▶';
  hideKickUI(); esconderRecepcao();
  rotuloReplay();
}
function rotuloReplay() {
  const R = G.replay;
  const nomes = ['TV', 'ATRÁS DO GOL', 'PERTO DO LANCE'];
  $('cineLabel').textContent = R.tipo === 'gol' ? 'REPLAY · ' + nomes[R.cam] + ' (' + (R.cam + 1) + '/3)' : (R.congelado ? 'IMPEDIMENTO · amarela: penúltimo defensor · vermelha: atacante' : 'REPLAY DO IMPEDIMENTO');
}
function terminarReplay() {
  const R = G.replay;
  if (!R) return;
  G.replay = null;
  linhasImped.g.visible = false;
  setLetterbox(false);
  $('skipBtn').hidden = true; $('skipBtn').textContent = 'Pular ▶';
  $('cineLabel').textContent = '';
  for (const p of CORPOS) p.mesh.raiz.visible = p.role === 'AR' ? PARTIDA.regras.impedimento : (!p.out || p.saida !== null);
  G.state = R.estadoAntes;
  R.depois();
}
// Roda no lugar do jogo enquanto G.state === 'replay' (tempo real).
function atualizarReplay(rdt) {
  const R = G.replay;
  if (!R) return;
  const Q = R.quadros, t0 = Q[0].t;
  let vel = 1;
  if (R.tipo === 'gol' && R.cam === 2) vel = 0.6;                   // a câmera de perto é em câmera lenta
  if (R.tipo === 'imped') vel = 0.6;
  if (!R.congelado) R.t += rdt * vel;
  if (R.t >= R.dur) {
    if (R.tipo === 'gol') {
      // (4.1.1) fora de campo (espectador) ninguém está olhando o botão: uma câmera só e segue o jogo.
      if (G.espectador) { terminarReplay(); return; }
      R.t = 0; R.cam = (R.cam + 1) % 3; R.camPos = null; rotuloReplay();   // próxima câmera (e repete)
    }
    else if (!R.congelado) { R.congelado = true; R.t = R.dur; R.congT = 0; mostrarLinhas(R); rotuloReplay(); }
  }
  if (R.congelado) { R.congT += rdt; if (R.congT > 3.2) { terminarReplay(); return; } }
  // Quadro da vez (busca simples: os quadros estão em ordem).
  const tAlvo = t0 + Math.min(R.t, R.dur);
  let i = R.i || 0;
  if (i >= Q.length - 1 || Q[i].t > tAlvo) i = 0;
  while (i < Q.length - 2 && Q[i + 1].t <= tAlvo) i++;
  R.i = i;
  const A = Q[i], B = Q[Math.min(i + 1, Q.length - 1)];
  const f = B.t > A.t ? clamp((tAlvo - A.t) / (B.t - A.t), 0, 1) : 0;
  const bola = aplicarQuadro(A, B, f);
  cameraReplay(R, bola, rdt);
}
function cameraReplay(R, bola, rdt) {
  let px, py, pz, tx = bola.x, ty = Math.max(0.5, bola.y), tz = bola.z;
  if (R.tipo === 'imped') {                         // da lateral, alinhada com a linha do defensor
    const x = R.reg.linhaX;
    px = x; py = 7; pz = -(HALF_W + 9); tx = x; ty = 0; tz = 0;
  } else if (R.cam === 0) { px = bola.x * 0.85; py = 12; pz = -(HALF_W + 8); }                        // TV (em cima das placas)
  else if (R.cam === 1) { px = R.lado * (HALF_L + 9); py = 4.5; pz = bola.z * 0.3; }                   // atrás do gol, por cima da rede
  else { px = bola.x - R.lado * 5.5; py = 1.5; pz = bola.z + 4; }                                      // perto, rasteira
  const k = R.camPos ? 1 - Math.exp(-rdt * 4) : 1;
  R.camPos = R.camPos || { px, py, pz, tx, ty, tz };
  const C = R.camPos;
  C.px += (px - C.px) * k; C.py += (py - C.py) * k; C.pz += (pz - C.pz) * k;
  C.tx += (tx - C.tx) * k; C.ty += (ty - C.ty) * k; C.tz += (tz - C.tz) * k;
  camera.position.set(C.px, C.py, C.pz); camera.lookAt(C.tx, C.ty, C.tz);
}
function mostrarLinhas(R) {
  posicionarLinha(linhasImped.def, R.reg.linhaX);
  posicionarLinha(linhasImped.atk, R.reg.atacX);
  linhasImped.g.visible = true;
}

// Gol: os 10 s antes do gol (o gravador continua 1,5 s depois do gol para pegar a bola na rede).
function iniciarReplayGol(depois) {
  const tg = G.tGol || G.time;
  iniciarReplay({ tipo: 'gol', quadros: trechoReplay(tg - 10, tg + 1.5), lado: G.ladoGol || 1, depois });
}
// Impedimento: do passe menos 2 s até o passe.
function iniciarReplayImpedimento(reg, depois) {
  iniciarReplay({ tipo: 'imped', quadros: trechoReplay(reg.t - 2, reg.t + 0.01), reg, depois });
}

let last = performance.now(), radarT = 0, fpsT = 0, fpsN = 0;
function frame(now) {
  requestAnimationFrame(frame);
  const rdt = Math.min(0.05, (now - last) / 1000);
  last = now;
  let dt = 0;
  if (G.state === 'replay') atualizarReplay(rdt);   // replay: só mostra a gravação (o jogo fica parado)
  else if (G.pulando) { avancarRapido(); syncMeshes(1 / 60); updateCamera(rdt); }   // pulando para o resultado
  else if (G.state === 'subst') { atualizarSubstituicao(rdt); updateOfficials(0, rdt); syncMeshes(rdt); updateCamera(rdt); }   // cena da troca
  else {
    if (G.state !== 'paused' && G.state !== 'menu' && G.state !== 'end') {
      G.timeScale += (G.targetScale - G.timeScale) * Math.min(1, rdt * 10);
      dt = rdt * G.timeScale * (G.espectador && G.state === 'play' ? 2.5 : 1);   // sem você em campo: mais rápido
      G.time += dt;
      stepGame(dt, rdt);
    }
    if (G.state !== 'replay') {
      updateCamera(rdt);
      syncMeshes(dt);
      // Gravação do replay (para 1,5 s depois do gol, para guardar o lance).
      const pararDeGravar = (G.state === 'goal' || G.state === 'celebrate') && G.time > (G.tGol || 0) + 1.5;
      if (dt > 0 && !pararDeGravar && G.state !== 'menu') gravarQuadro(dt);
    }
  }
  crowd.atualizar(rdt);
  particulas.atualizar(rdt);
  atualizarTecnicos(rdt);
  atualizarBanco(rdt);
  ajustarSombras();
  Som.torcida(nivelTorcida());                             // torcida: só o relógio do shader (o resto é na placa de vídeo)
  renderer.render(scene, camera);
  radarT += rdt;
  if (radarT > 0.066) { radarT = 0; drawRadar(); }
  updateHUD();
  fpsT += rdt; fpsN++;
  if (fpsT >= 0.5) {
    if (!$('fps').hidden) $('fps').textContent = Math.round(fpsN / fpsT) + ' FPS · ' + renderer.info.render.calls + ' desenhos';
    fpsT = 0; fpsN = 0;
  }
}

// =====================================================================
// MONTAGEM DA PARTIDA (4.0.0) — transforma os DADOS (PARTIDA_PADRAO, TIMES, CAMPOS...) no jogo.
//   resolverPartida(cfg) .... junta cfg com o padrão e troca as chaves pelos objetos
//   montarPartida(cfg) ...... monta tudo: medidas, estádio, times, técnicos, clima/horário, placar
// =====================================================================

// Emblema desenhado num canvas (camisa: 7×8 px; placar: 26 px). forma + 2 cores + letras.
function desenharEmblema(g, x, y, w, h, emb) {
  if (!emb) { g.fillStyle = '#FFFFFF'; g.fillRect(x, y, w, h); return; }
  g.save();
  g.beginPath();
  if (emb.forma === 'circulo') g.arc(x + w / 2, y + h / 2, Math.min(w, h) / 2, 0, Math.PI * 2);
  else if (emb.forma === 'losango') { g.moveTo(x + w / 2, y); g.lineTo(x + w, y + h / 2); g.lineTo(x + w / 2, y + h); g.lineTo(x, y + h / 2); g.closePath(); }
  else { g.moveTo(x, y); g.lineTo(x + w, y); g.lineTo(x + w, y + h * 0.6); g.lineTo(x + w / 2, y + h); g.lineTo(x, y + h * 0.6); g.closePath(); }   // escudo
  g.fillStyle = emb.cor1; g.fill();
  g.clip();
  g.fillStyle = emb.cor2; g.fillRect(x, y + h * 0.42, w, h * 0.16);   // faixa
  if (w >= 16 && emb.letras) {
    g.fillStyle = emb.cor2; g.font = 'bold ' + Math.round(h * 0.38) + 'px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.strokeStyle = emb.cor1; g.lineWidth = 3; g.strokeText(emb.letras, x + w / 2, y + h * 0.5); g.fillText(emb.letras, x + w / 2, y + h * 0.5);
  }
  g.restore();
}

const corRGB = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const corDist = (a, b) => { const A = corRGB(a), B = corRGB(b); return Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]); };
const corFundoNome = (h) => { const [r, g, b] = corRGB(h); return 'rgba(' + Math.round(r * 0.45) + ',' + Math.round(g * 0.45) + ',' + Math.round(b * 0.45) + ',0.88)'; };

function resolverPartida(cfg = {}) {
  const P = Object.assign({}, PARTIDA_PADRAO, cfg);
  P.competicao = Object.assign({}, PARTIDA_PADRAO.competicao, cfg.competicao || {});
  P.usuario = Object.assign({}, PARTIDA_PADRAO.usuario, cfg.usuario || {});
  P.campo = typeof P.campo === 'string' ? Object.assign({ id: P.campo }, CAMPOS[P.campo] || CAMPOS.estadio) : Object.assign({}, CAMPOS.estadio, P.campo);
  P.campo.jogadores = clamp(Math.round(P.campo.jogadores || 7), 4, 11);
  P.regras = Object.assign({}, REGRAS_PADRAO, P.campo.regras || {}, cfg.regras || {});
  P.timesObj = P.times.map((t) => (typeof t === 'string' ? TIMES[t] : t));
  // Uniformes: se as camisas forem parecidas, o visitante (ou o time 1) usa o reserva.
  const U0 = P.timesObj[0].uniforme, U1 = P.timesObj[1].uniforme;
  const parecido = corDist(U0.camisa, U1.camisa) < 110;
  P.uniformes = [U0, U1];
  if (parecido) { const fora = P.mandante === 0 ? 1 : 0; P.uniformes[fora] = P.timesObj[fora].uniforme2 || P.uniformes[fora]; }
  P.formacoes = [0, 1].map((i) => (cfg.formacoes && cfg.formacoes[i]) || P.timesObj[i].formacao || '4-4-2');
  P.taticas = [0, 1].map((i) => (cfg.taticas && cfg.taticas[i]) || P.timesObj[i].tatica || 'tikitaka');
  P.elencos = P.timesObj.map(elencoDoTime);
  P.tecnicos = [tecnicoDoUsuario(), P.timesObj[1].tecnico || { nome: 'Técnico', aparencia: { pele: '#BF8159', cabelo: '#1C140F', estilo: 0, roupa: '#222222' } }];
  P.ajuste = calcularAjuste(P);
  return P;
}

// DIFICULDADE + DIFERENÇA DE FORÇA → "peso" do jogo (−1 fácil … +1 difícil) e o que ele muda.
// Tudo com teto: você não muda (velocidade, minigames, tempo de mira), então ganhar é sempre possível.
function calcularAjuste(P) {
  const nivel = (DIFICULDADES[P.dificuldade] || DIFICULDADES.normal).nivel;
  const dif = (P.timesObj[1].forca - P.timesObj[0].forca) / 40;   // adversário melhor → positivo
  const peso = clamp(nivel * 0.32 + dif * 0.55, -1, 1);
  return {
    peso,
    velAdv: 1 + 0.07 * peso,                       // adversários um pouco mais rápidos (máx. +7%)
    velNossa: 1 - 0.05 * Math.max(0, peso) + 0.04 * Math.max(0, -peso),
    desarme: clamp(0.25 + 0.1 * peso, 0.14, 0.35), // chance do bote da IA em você dar certo
    passeQuebrado: clamp(0.45 + 0.15 * peso, 0.25, 0.6),
    goleiroAdv: 0.07 * peso,                       // bônus na chance de defesa (o teto continua valendo)
    goleiroNosso: -0.06 * peso,
    miraAdv: 1 - 0.25 * peso,                      // erro do chute da IA (menor = chuta melhor)
    miraNossa: 1 + 0.2 * Math.max(0, peso),
    reacao: 1 - 0.2 * peso,                        // tempo de decisão da IA adversária
  };
}

// Posições da formação para n jogadores de linha. fx/fz em fração do meio-campo/meia-largura.
const NUMEROS = { GK: [1, 12], DEF: [2, 3, 4, 6, 5, 13, 14], MID: [8, 5, 7, 10, 11, 15, 16, 17], FWD: [9, 11, 7, 19, 18] };
function montarFormacao(chave, nLinha) {
  const F = FORMACOES[chave] || FORMACOES['4-4-2'];
  let linhas = F.linhas[nLinha] && F.linhas[nLinha].slice();
  if (!linhas) {                                  // não tem para esse número: divide proporcionalmente
    const base = F.linhas[10], tot = base.reduce((a, b) => a + b, 0);
    linhas = base.map((v) => Math.max(1, Math.floor(v * nLinha / tot)));
    let soma = linhas.reduce((a, b) => a + b, 0), i = 1;
    while (soma < nLinha) { linhas[i % linhas.length]++; soma++; i++; }
    while (soma > nLinha) { const j = linhas.indexOf(Math.max(...linhas)); linhas[j]--; soma--; }
  }
  const nL = linhas.length;
  const prof = (li) => (nL === 2 ? [-0.62, -0.03][li] : li === nL - 1 ? -0.03 : lerp(-0.66, -0.27, li / Math.max(1, nL - 2)));
  const slots = [{ role: 'GK', fx: -0.94, fz: 0, funcao: 'goleiro' }];
  const grande = nLinha >= 8;                     // 11 x 11 (e parecidos): pontas bem abertos
  linhas.forEach((m, li) => {
    const role = li === 0 ? 'DEF' : li === nL - 1 ? 'FWD' : 'MID';
    const abre = role === 'DEF' ? (m >= 4 ? 0.62 : 0.42) : role === 'FWD' ? (grande && m >= 3 ? 0.56 : 0.3) : (m >= 3 ? 0.62 : 0.42);
    for (let k = 0; k < m; k++) {
      const fz = m === 1 ? 0 : lerp(-abre, abre, k / (m - 1));
      const recuo = role === 'MID' && m >= 3 && Math.abs(fz) < 0.1 ? 0.04 : 0;   // volante do meio um pouco atrás
      // (4.1.2) Função dentro da linha — usada pela IA no campo grande:
      //   zagueiro / lateral · volante / meia / meia aberto · centroavante / ponta
      let funcao;
      if (role === 'DEF') funcao = Math.abs(fz) >= 0.5 ? 'lateral' : 'zagueiro';
      else if (role === 'FWD') funcao = m >= 3 && Math.abs(fz) > 0.1 ? 'ponta' : 'centroavante';
      else if (Math.abs(fz) >= 0.5) funcao = 'aberto';
      else funcao = (nL >= 4 && li === 1) || recuo ? 'volante' : 'meia';
      slots.push({ role, fx: prof(li) - recuo, fz, funcao });
    }
  });
  return slots;
}

// Tira do jogo (e da memória da placa de vídeo) um boneco.
function descartarBoneco(raiz) {
  if (raiz.userData.atleta) ATLETAS.delete(raiz.userData.atleta);
  scene.remove(raiz);
  raiz.traverse((o) => {
    if (o.geometry && o.geometry !== SHADOW_GEO) o.geometry.dispose();
    if (o.material && o.material !== SHADOW_MAT) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); }
  });
}

// Estádio de novo (campo novo, cores de torcida novas, mais ou menos gente).
function montarEstadio() {
  while (ESTADIO.children.length) {
    const o = ESTADIO.children.pop();
    o.traverse((q) => { if (q.geometry) q.geometry.dispose(); if (q.material && q.material.map && q.material !== crowd.material) q.material.map.dispose(); });
  }
  BANDEIRAS.length = 0;
  crowd.limpar();
  crowd.pintarAtlas(PARTIDA.uniformes[0].camisa, PARTIDA.uniformes[1].camisa);
  const tipo = PARTIDA.campo.estadio || 'arena';
  buildPitch();
  if (tipo === 'arena') { buildBoards(); buildStands(); } else buildArredores(tipo);
  buildGoal(-1); buildGoal(1);
  construirBancos();
  montarCones();
  for (const sp of spares) sp.mesh.position.set(sp.side * (HALF_L + 1.6), 0.5 + CONFIG.BALL_R, GOAL_HALF + 2.5);
}

// ---------------------------------------------------------------------
// ARREDORES DE VÁRZEA E SOCIETY (4.1.0). A arena (arquibancada grande, placas, refletores altos)
// continua em buildBoards/buildStands. Aqui:
//   várzea .. alambrado em volta (tela de arame + postes) no lugar das placas, torcida EM PÉ do
//             lado de fora, uma arquibancadinha de cimento de 3 degraus num dos lados, postes de
//             luz de madeira, casinhas e árvores ao fundo, chão de terra
//   society . quadra fechada com rede alta em volta, arquibancadinha de 2 degraus, postes de luz
// O limite da bola continua o mesmo (BOARD_X/BOARD_Z): ela bate no alambrado/rede e volta.
// ---------------------------------------------------------------------
function texturaTela(corFio, passo) {
  return drawTexture(32, 32, (g) => {
    g.clearRect(0, 0, 32, 32);
    g.strokeStyle = corFio; g.lineWidth = 1.4;
    for (let i = -32; i < 64; i += passo) {
      g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 32, 32); g.stroke();
      g.beginPath(); g.moveTo(i + 32, 0); g.lineTo(i, 32); g.stroke();
    }
  });
}
let ALTURA_GRADE = 5;                              // (4.1.3) a comemoração "pular na grade" usa
function buildArredores(tipo) {
  const varzea = tipo === 'varzea';
  const ALT = varzea ? 2.6 : 5;                    // altura do alambrado / da rede
  ALTURA_GRADE = ALT;
  const E = new Lote(), Lp = new Lote();
  // Tela: 4 paredes com a textura repetida (1 chamada de desenho).
  const tex = texturaTela(varzea ? 'rgba(170,175,180,0.9)' : 'rgba(30,60,35,0.85)', varzea ? 8 : 6);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(1, 1);
  const telaMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.25, side: THREE.DoubleSide, depthWrite: false });
  const R = new Lote([0, 0, 1, 1]);
  const parede = (x0, z0, x1, z1) => {
    const len = Math.hypot(x1 - x0, z1 - z0), rep = len / 1.2, rv = ALT / 1.2;
    const b = R.pos.length / 3;
    R.pos.push(x0, ALT, z0, x1, ALT, z1, x0, 0, z0, x1, 0, z1);
    for (let i = 0; i < 4; i++) { R.nor.push(0, 0, 1); R.cor.push(1, 1, 1); }
    R.uv.push(0, rv, rep, rv, 0, 0, rep, 0);
    R.idx.push(b, b + 2, b + 1, b + 2, b + 3, b + 1);
  };
  const X = BOARD_X, Z = BOARD_Z, Zn = BOARD_ZN, Zs = (s) => (s < 0 ? Zn : Z);   // (4.1.3) lado do banco mais largo
  parede(-X, -Zn, X, -Zn); parede(-X, Z, X, Z); parede(-X, -Zn, -X, Z); parede(X, -Zn, X, Z);
  const tela = R.malha(telaMat); ESTADIO.add(tela); freeze(tela);
  // Postes do alambrado e cano de cima.
  const corPoste = varzea ? 0x8a9096 : 0x2b3a2e;
  for (let x = -X; x <= X + 0.01; x += 3.2) for (const s of [-1, 1]) E.caixa(0.09, ALT, 0.09, corPoste, x, ALT / 2, s * Zs(s));
  for (let z = -Zn; z <= Z + 0.01; z += 3.2) for (const s of [-1, 1]) E.caixa(0.09, ALT, 0.09, corPoste, s * X, ALT / 2, z);
  for (const s of [-1, 1]) { E.caixa(X * 2, 0.07, 0.07, corPoste, 0, ALT, s * Zs(s)); E.caixa(0.07, 0.07, Z + Zn, corPoste, s * X, ALT, (Z - Zn) / 2); }
  // Arquibancadinha (num dos lados compridos, z > 0): degraus de cimento.
  const degraus = varzea ? 3 : 2, compr = Math.min(varzea ? 34 : 22, X * 1.4);
  for (let r = 0; r < degraus; r++) E.caixa(compr, 0.45 * (r + 1), 0.9, r % 2 ? 0x9a978f : 0x8c8a83, 0, 0.225 * (r + 1), Z + 1.6 + r * 0.9);
  // Postes de luz (4 nos cantos + 2 no meio). Na várzea de madeira, mais baixos.
  const altLuz = varzea ? 9 : 8, corLuz = varzea ? 0x6b4a2b : 0x59606b;
  for (const sx of [-1, 0, 1]) for (const sz of [-1, 1]) {
    const x = sx * (X + 1.5), z = sz * (Zs(sz) + (sx === 0 ? 5 : 1.5));
    E.caixa(0.25, altLuz, 0.25, corLuz, x, altLuz / 2, z);
    Lp.caixa(1.6, 0.6, 0.6, 0xfff3c4, x, altLuz + 0.2, z);
  }
  // Várzea: casinhas e árvores ao fundo, chão de terra em volta.
  if (varzea) {
    const cores = [0xd9c27a, 0xc96b4a, 0x7fa3c8, 0xe0e0d0, 0x9cc48a, 0xd98f6a, 0xb0b8c0];
    for (let i = 0; i < 26; i++) {
      const lado = i % 4, t = rand(-1, 1), w = rand(5, 9), h = rand(3.5, 7), d = rand(5, 8);
      let x, z;
      if (lado < 2) { x = t * (X + 20); z = (lado ? 1 : -1) * (Z + rand(14, 30)); } else { x = (lado === 2 ? 1 : -1) * (X + rand(14, 26)); z = t * (Z + 15); }
      E.caixa(w, h, d, cores[i % cores.length], x, h / 2, z);
      E.caixa(w + 0.6, 0.4, d + 0.6, 0x7a3b2b, x, h + 0.2, z);                     // telhado
    }
    for (let i = 0; i < 18; i++) {
      const a = rand(0, Math.PI * 2), r = rand(Math.max(X, Z) + 8, Math.max(X, Z) + 22);
      const x = Math.cos(a) * r * 1.1, z = Math.sin(a) * r * 0.8;
      E.caixa(0.5, 3, 0.5, 0x5a3a22, x, 1.5, z);
      E.caixa(rand(3, 4.5), rand(3, 4), rand(3, 4.5), i % 2 ? 0x2f6b2a : 0x3d7a31, x, 4.2, z);
    }
  }
  const est = E.malha(MAT_CORES); ESTADIO.add(est); freeze(est);
  lampadasMat = new THREE.MeshBasicMaterial({ vertexColors: true });
  const lamp = Lp.malha(lampadasMat); ESTADIO.add(lamp); freeze(lamp);
  // Torcida em pé do lado de fora da tela (e sentada/em pé na arquibancadinha). Popularidade
  // decide quanta gente: na várzea bem menos que num estádio.
  const P = PARTIDA, popM = P.timesObj[P.mandante].popularidade, popV = P.timesObj[1 - P.mandante].popularidade;
  const ocup = clamp(0.08 + 0.35 * popM + 0.12 * popV, 0.05, 0.6), casa = P.mandante;
  const ang = (x, z) => (Math.atan2(z, x) / (Math.PI * 2) + 1) % 1;
  const tor = (x, y, z, dx, dz, emPe) => crowd.torcedor(x, y, z, dx, dz, Math.random() < 0.65 ? casa : 1 - casa, emPe, ang(x, z));
  for (const s of [-1, 1]) for (let x = -X + 1; x < X; x += 0.8) for (let fila = 0; fila < 2; fila++) {
    if (s > 0 && Math.abs(x) < compr / 2) continue;                       // ali é a arquibancadinha
    if (Math.random() < ocup * (fila ? 0.6 : 1)) tor(x + rand(-0.2, 0.2), 0, s * (Zs(s) + 0.7 + fila * 0.9), 0, -s, true);
  }
  for (const s of [-1, 1]) for (let z = -Zn + 1; z < Z; z += 0.8) if (Math.random() < ocup * 0.5) tor(s * (X + 0.8), 0, z + rand(-0.2, 0.2), -s, 0, true);
  for (let r = 0; r < degraus; r++) for (let x = -compr / 2 + 0.5; x < compr / 2; x += 0.75) {
    if (Math.random() < Math.min(0.95, ocup * 1.7)) tor(x + rand(-0.12, 0.12), 0.45 * (r + 1), Z + 1.75 + r * 0.9, 0, -1, Math.random() < 0.4);
  }
  const torcida = crowd.malha(); ESTADIO.add(torcida); freeze(torcida);
}

// Bancos de reserva e área técnica (lado de baixo do campo, um de cada lado do meio).
// 4.1.1: os bancos têm corpo. BANCOS guarda o retângulo de cada um (no chão) para os jogadores
// esbarrarem e para a bola baixa bater e voltar. O técnico também tem corpo (um círculo).
const BANCOS = [];
// Society (4.1.2): sem banco, técnico e reservas à vista (depois isso vira dado do campo).
const temBanco = (P) => !!P && (P.campo.estadio || 'arena') !== 'society';
function construirBancos() {
  const L = new Lote(), z = -(HALF_W + LADO_BANCO.banco);
  BANCOS.length = 0;
  if (!temBanco(PARTIDA)) return;
  for (const sx of [-1, 1]) {
    const x = sx * Math.min(9, HALF_L * 0.25);
    BANCOS.push({ x0: x - 2.7, x1: x + 2.7, z0: z - 0.85, z1: z + 0.08, h: 2.3 });
    L.caixa(5, 0.45, 0.7, 0x2c3340, x, 0.225, z - 0.3);           // banco
    L.caixa(5.2, 2.2, 0.12, 0x59606b, x, 1.1, z - 0.75);          // fundo
    L.caixa(5.4, 0.1, 1.3, 0x9fd3ff, x, 2.25, z - 0.25);          // cobertura (4.1.2: mais alta, a cabeça cabia mal)
  }
  const m = L.malha(MAT_CORES); ESTADIO.add(m); freeze(m);
}

// ---------------------------------------------------------------------
// TÉCNICOS (4.0.0): um de cada time, na área técnica, com o nome e a aparência dele.
// Ficam fora da lista de jogadores (só são desenhados aqui). Quando o técnico muda a tática,
// ele levanta o braço e aparece um aviso. trocarTatica() vale para você (menu de pausa) e para a
// IA dos dois técnicos (tecnicoPensa: perdendo no fim vai para o ataque, ganhando fecha a casinha).
// ---------------------------------------------------------------------
const tecnicos = [];
function montarTecnicos(P) {
  for (const t of tecnicos) descartarBoneco(t.mesh.raiz);
  tecnicos.length = 0;
  if (!temBanco(P)) return;                        // society: sem técnico nem banco à vista (por enquanto)
  [0, 1].forEach((team) => {
    const T = P.tecnicos[team], A = T.aparencia || {};
    const roupa = A.roupa || '#222222';
    const mesh = makeAthlete({ camisa: roupa, listra: roupa, gola: '#111111', numero: '', calcao: roupa, meia: roupa, sola: '#1a1a1a',
      pele: A.pele || '#BF8159', cabelo: A.cabelo || '#1C140F', estilo: A.estilo || 0, nome: T.nome, fundoNome: 'rgba(20,20,20,0.85)', emblema: P.timesObj[team].emblema });
    mesh.etiqueta.visible = false;
    scene.add(mesh.raiz);
    const x = (team === 0 ? -1 : 1) * Math.min(9, HALF_L * 0.25) + (team === 0 ? 3.2 : -3.2), z = -(HALF_W + LADO_BANCO.tecnico);
    tecnicos.push({ team, mesh, x, z, nome: T.nome, gestoT: 0, passo: 0, acao: 'cintura', acaoT: rand(4, 7), alvoX: x, passoT: rand(2, 5), relogio: 0, pv: null });
    mesh.raiz.position.set(x, 0, z);
  });
}
function atualizarTecnicos(dt) {
  for (const t of tecnicos) {
    const m = t.mesh;
    t.gestoT = Math.max(0, t.gestoT - dt);
    t.reclamaT = Math.max(0, (t.reclamaT || 0) - dt);
    t.esbarrao = Math.max(0, (t.esbarrao || 0) - dt);
    if (t.abraco && G.celebAuto !== t.abraco) t.abraco = null;   // a comemoração acabou (ou foi cortada)
    if (t.abraco) {
      // Comemoração secreta: parado no lugar, virado para o campo; abre o braço esperando você.
      const A = t.abraco;
      m.raiz.position.set(A.cx, 0, A.cz);
      m.raiz.rotation.y = -A.olhaCampo;
      if (A.t < ABRACO.chega) {
        usarCotovelo(m.bracoE, 0, 0); usarCotovelo(m.bracoD, 0, 0);
        m.pernaE.rotation.z = m.pernaD.rotation.z = 0; m.corpo.rotation.z = 0; m.corpo.rotation.x = 0; m.raiz.position.y = 0;
        m.bracoE.rotation.z = 0.15; m.bracoE.rotation.x = 0.35;        // braço do abraço meio aberto (sem encostar em você chegando)
        m.bracoD.rotation.z = 2.6; m.bracoD.rotation.x = -0.3;         // e o outro já comemorando
      } else poseAbraco(m, A.t, performance.now(), 'tecnico');
      continue;
    }
    t.acaoT -= dt;
    escolherAcaoTecnico(t);
    // Anda na área técnica: escolhe um ponto (até 1,6 m para cada lado), vai devagar e para.
    t.passoT -= dt;
    if (t.passoT <= 0) { t.alvoX = t.x + rand(-1.6, 1.6); t.passoT = rand(3, 7); }
    const parado = t.acao === 'comemora' || t.acao === 'cabeca' || t.acao === 'gesto' || t.acao === 'reclama';
    const px = m.raiz.position.x, dx = t.alvoX - px;
    let andando = false;
    if (!parado && Math.abs(dx) > 0.05) { m.raiz.position.x = px + Math.sign(dx) * Math.min(Math.abs(dx), 0.9 * dt); andando = true; }
    m.raiz.position.z = t.z;
    // Olha para a bola (vira devagar).
    const alvoAng = Math.atan2(ball.z - t.z, ball.x - px);
    t.ang = turnToward(t.ang ?? alvoAng, alvoAng, 3 * dt);
    m.raiz.rotation.y = -t.ang;
    t.passo += andando ? dt : 0;
    const bal = andando ? Math.sin(t.passo * 6) * 0.32 : 0;
    m.pernaE.rotation.z = bal; m.pernaD.rotation.z = -bal;
    // Pose dos braços: mistura suave com a pose da ação.
    const T = poseTecnico(t.acao, t.relogio = (t.relogio || 0) + dt, t);
    const kk = 1 - Math.exp(-9 * dt);
    if (!t.pv) t.pv = Object.assign({}, T);
    for (const c of Object.keys(T)) t.pv[c] += (T[c] - t.pv[c]) * kk;
    const P = t.pv;
    m.bracoE.rotation.z = P.ez; m.bracoE.rotation.x = P.ex; usarCotovelo(m.bracoE, Math.abs(P.ecx) + Math.abs(P.ecz) > 0.02 ? P.ecx : 0, Math.abs(P.ecx) + Math.abs(P.ecz) > 0.02 ? P.ecz : 0);
    m.bracoD.rotation.z = P.dz; m.bracoD.rotation.x = P.dx; usarCotovelo(m.bracoD, Math.abs(P.dcx) + Math.abs(P.dcz) > 0.02 ? P.dcx : 0, Math.abs(P.dcx) + Math.abs(P.dcz) > 0.02 ? P.dcz : 0);
    usarCabeca(m, t.acao === 'cabeca' ? -0.35 : 0);
    m.corpo.rotation.x = 0;
    m.corpo.rotation.z = t.acao === 'reclama' ? -0.08 : 0;
    if (t.esbarrao > 0) m.corpo.rotation.z = -Math.sin(t.esbarrao * 20) * t.esbarrao * 0.5;   // esbarrão/bolada: cambaleia
    m.raiz.position.y = t.acao === 'comemora' ? Math.abs(Math.sin(t.relogio * 5.5)) * 0.22 : 0;
  }
}
// ---- Poses do técnico. Os ângulos com cotovelo saíram de IK (mão no alvo, cotovelo para fora)
// e foram conferidos caixa por caixa: nenhum pedaço do braço entra no tronco ou na cabeça.
//   cintura (a inicial) · cruzados · queixo (pensando) · cabeca (mãos na cabeça) · aponta ·
//   chama ("vem, sobe!") · aplaude · reclama (braços abertos) · comemora · gesto (troca de tática)
const TEC_CINTURA = { ez: -0.308, ex: 0.838, ecx: -1.112, ecz: 1.928, dz: -0.308, dx: -0.838, dcx: 1.112, dcz: 1.928 };
const TEC_POSES = {
  cintura: TEC_CINTURA,
  cruzados: { ez: 0.993, ex: -0.086, ecx: -1.284, ecz: -0.304, dz: 1.245, dx: 0.075, dcx: 1.387, dcz: 0.725 },
  queixo: { ez: 0.968, ex: -0.167, ecx: -1.144, ecz: -0.277, dz: 1.225, dx: 0.108, dcx: 0.627, dcz: 1.564 },
  cabeca: { ez: 2.991, ex: 0.366, ecx: -0.811, ecz: 0.209, dz: 2.991, dx: -0.366, dcx: 0.811, dcz: 0.209 },
};
function poseTecnico(acao, r, t) {
  const C = TEC_CINTURA, sn = Math.sin;
  switch (acao) {
    case 'aponta': return { ez: C.ez, ex: C.ex, ecx: C.ecx, ecz: C.ecz, dz: 1.55 + sn(r * 2) * 0.05, dx: -0.05, dcx: 0, dcz: 0 };
    case 'chama': return { ez: C.ez, ex: C.ex, ecx: C.ecx, ecz: C.ecz, dz: 1.7, dx: -0.15, dcx: 0.15, dcz: 0.75 + sn(r * 9) * 0.6 };
    case 'aplaude': { const c = 0.66 + Math.max(0, sn(r * 15)) * 0.1; return { ez: 1.25, ex: -c, ecx: 0, ecz: 0, dz: 1.25, dx: c, dcx: 0, dcz: 0 }; }
    case 'reclama': { const v = sn(r * 9) * 0.12; return { ez: 0.85 + v, ex: 0.7, ecx: 0, ecz: 0.75, dz: 0.85 - v, dx: -0.7, dcx: 0, dcz: 0.75 }; }
    case 'comemora': { const v = sn(r * 8) * 0.18; return { ez: 2.8 + v, ex: 0.35, ecx: 0, ecz: 0, dz: 2.8 - v, dx: -0.35, dcx: 0, dcz: 0 }; }
    case 'gesto': return { ez: C.ez, ex: C.ex, ecx: C.ecx, ecz: C.ecz, dz: 2.7 + sn(r * 6) * 0.12, dx: -0.2, dcx: 0, dcz: 0 };
    default: return TEC_POSES[acao] || C;
  }
}
// O que o técnico está fazendo agora. Eventos do jogo mandam (gol, troca de tática, bolada, falta);
// sem nada acontecendo ele varia sozinho: mão na cintura (mais comum), braços cruzados, mão no
// queixo, aponta para a bola, chama o time para frente, aplaude.
function escolherAcaoTecnico(t) {
  const golNosso = (G.state === 'goal' || G.state === 'celebrate' || G.state === 'replay') && G.scoredBy === t.team;
  const golDeles = (G.state === 'goal' || G.state === 'celebrate' || G.state === 'replay') && G.scoredBy === 1 - t.team;
  const mudar = (a, dur) => { if (t.acao !== a) t.relogio = 0; t.acao = a; t.acaoT = dur; };
  if (golNosso) { if (t.acao !== 'comemora') mudar('comemora', 4); return; }
  if (golDeles) { if (t.acao !== 'cabeca' && t.acao !== 'reclama' && t.acao !== 'cintura') mudar('cabeca', 2.5); else if (t.acaoT <= 0) mudar(t.acao === 'cabeca' ? 'cintura' : 'cabeca', 3); return; }
  if (t.gestoT > 0) { if (t.acao !== 'gesto') mudar('gesto', t.gestoT); return; }
  if (t.reclamaT > 4.5 && t.acao !== 'reclama') { mudar('reclama', 1.6); return; }
  if (G.state === 'foul' && G.foul && G.foul.team !== t.team && t.viuFalta !== G.foul) { t.viuFalta = G.foul; if (Math.random() < 0.6) { mudar('reclama', 2); return; } }
  if (t.acaoT > 0) return;
  const comBola = G.possession && G.possession.team === t.team;
  const ataque = (ball.x * (t.team === 0 ? 1 : -1)) > HALF_L * 0.2;
  const op = [['cintura', 3], ['cruzados', 2], ['queixo', 1], ['aponta', ataque ? 1.5 : 0.5], ['chama', comBola ? 1.5 : 0.3], ['aplaude', comBola && ataque ? 0.8 : 0.2]];
  let soma = op.reduce((a, o) => a + o[1], 0), r = Math.random() * soma;
  for (const [a, w] of op) { r -= w; if (r <= 0) { mudar(a, a === 'aplaude' ? rand(1.2, 2) : a === 'chama' ? rand(1.5, 2.5) : rand(3, 6.5)); return; } }
}
function trocarTatica(team, chave, porQuem) {
  if (!TATICAS[chave] || !PARTIDA || PARTIDA.taticas[team] === chave) return;
  PARTIDA.taticas[team] = chave;
  const t = tecnicos[team]; if (t) t.gestoT = 2.2;
  showToast((porQuem || (t ? t.nome : 'Técnico')) + ': ' + TATICAS[chave].nome + '!', team === 0 ? 'good' : '');
  atualizarInfoTatica();
}
// IA dos técnicos: olha o placar e o relógio a cada 15 s de jogo.
function tecnicoPensa() {
  if (!PARTIDA || !(G.state === 'play') || G.pen || (G.tecnicoT || 0) > G.time) return;
  G.tecnicoT = G.time + 15;
  tecnicoOlhaCansaco();
  const decorrido = 1 - G.clock / PARTIDA.duracao;
  for (const team of [0, 1]) {
    if (team === 0 && G.taticaManual) continue;    // você escolheu a do seu time: o técnico respeita
    const saldo = G.score[team] - G.score[1 - team] + (PARTIDA.competicao.placarIda && PARTIDA.competicao.jogo === 'volta' ? (team === 0 ? 1 : -1) * (PARTIDA.competicao.placarIda[0] - PARTIDA.competicao.placarIda[1]) : 0);
    const pref = PARTIDA.timesObj[team].tatica;
    let nova = pref;
    if (decorrido > 0.55 && saldo < 0) nova = PARTIDA.timesObj[team].forca >= 65 ? 'falso9' : 'aerea';
    else if (decorrido > 0.7 && saldo > 0) nova = 'retranca';
    else if (decorrido > 0.8 && saldo === 0 && PARTIDA.competicao.mataMata) nova = 'contra';
    if (nova !== PARTIDA.taticas[team]) trocarTatica(team, nova);
  }
}
const taticaDe = (team) => TATICAS[(PARTIDA && PARTIDA.taticas[team]) || 'tikitaka'];

// ---------------------------------------------------------------------
// CLIMA E HORÁRIO (4.0.0)
//   horário: céu, névoa e luzes (dia claro, tarde alaranjada, noite com refletores)
//   clima: seco / chuva (gotas, céu mais escuro, bola corre mais e quica menos) /
//          neve (flocos, gramado com manchas brancas, bola mais lenta)
//   gramado: alto (bola rola menos) / baixo
//   ATRITO multiplica o freio da bola no chão (updateBall, pontoDeEncontro, previsões).
// ---------------------------------------------------------------------
let ATRITO = 1, QUIQUE = 0.5;
const HORARIOS = {
  dia:   { ceu: 0x8ec5ee, luzCeu: [0xffffff, 0x4a6a35, 0.95], sol: [0xfff3dd, 0.95], solPos: [20, 60, 25], lampadas: 0x9aa0a8, nevoa: [70, 190] },
  tarde: { ceu: 0xe9a46e, luzCeu: [0xffe0bd, 0x4a4a30, 0.8], sol: [0xffb36b, 0.95], solPos: [60, 18, 30], lampadas: 0xb8b0a0, nevoa: [60, 170] },
  noite: { ceu: 0x0c1b2b, luzCeu: [0xdfeeff, 0x23401c, 0.85], sol: [0xffffff, 0.75], solPos: [15, 40, 20], lampadas: 0xfff3c4, nevoa: [45, 140] },
};
const CLIMAS = {
  seco:  { nome: 'Seco', atrito: 1, quique: 0.5, escurece: 0, nevoaPerto: 1 },
  chuva: { nome: 'Chuva', atrito: 0.72, quique: 0.35, escurece: 0.35, nevoaPerto: 0.75 },
  neve:  { nome: 'Neve', atrito: 1.45, quique: 0.3, escurece: 0.15, nevoaPerto: 0.8 },
};
let lampadasMat = null;                           // material das lâmpadas dos postes (buildStands)
function aplicarAmbiente(P) {
  const H = HORARIOS[P.horario] || HORARIOS.noite, C = CLIMAS[P.clima] || CLIMAS.seco;
  const ceu = new THREE.Color(H.ceu).lerp(new THREE.Color(0x4a5058), C.escurece);
  scene.background = ceu;
  scene.fog.color.copy(ceu);
  scene.fog.near = H.nevoa[0] * C.nevoaPerto; scene.fog.far = H.nevoa[1] * C.nevoaPerto;
  luzCeu.color.setHex(H.luzCeu[0]); luzCeu.groundColor.setHex(H.luzCeu[1]); luzCeu.intensity = H.luzCeu[2] * (1 - C.escurece * 0.35);
  sun.color.setHex(H.sol[0]); sun.intensity = H.sol[1] * (1 - C.escurece * 0.5); sun.position.set(...H.solPos);
  if (lampadasMat) lampadasMat.color.setHex(H.lampadas);
  ATRITO = C.atrito * (P.gramado === 'alto' ? 1.3 : 1);
  QUIQUE = C.quique * (P.gramado === 'alto' ? 0.85 : 1);
  particulas.definir(P.clima);
}

// Chuva e neve: uma malha de partículas que acompanha a câmera (1 chamada de desenho). As gotas
// caem no shader (o processador só manda o tempo e a posição da câmera).
const particulas = (() => {
  const N = 1400, CAIXA = 40, ALT = 22;
  let obj = null, tipo = 'seco';
  const U = { uTempo: { value: 0 }, uCam: { value: new THREE.Vector3() }, uVel: { value: 18 }, uVento: { value: 0 } };
  function criar(t) {
    if (obj) { scene.remove(obj); obj.geometry.dispose(); obj.material.dispose(); obj = null; }
    tipo = t;
    if (t !== 'chuva' && t !== 'neve') return;
    const chuva = t === 'chuva';
    const pos = new Float32Array(N * (chuva ? 6 : 3)), base = new Float32Array(N * (chuva ? 6 : 3));
    for (let i = 0; i < N; i++) {
      const x = rand(-CAIXA, CAIXA), y = rand(0, ALT), z = rand(-CAIXA, CAIXA);
      if (chuva) { pos.set([x, y, z, x + 0.05, y - 0.7, z], i * 6); base.set([x, y, z, x, y, z], i * 6); }
      else { pos.set([x, y, z], i * 3); base.set([x, y, z], i * 3); }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aBase', new THREE.BufferAttribute(base, 3));   // ponto de cima da gota (as 2 pontas andam juntas)
    U.uVel.value = chuva ? 18 : 1.6; U.uVento.value = chuva ? 0.5 : 0.8;
    const C = CAIXA.toFixed(1), C2 = (CAIXA * 2).toFixed(1), H = ALT.toFixed(1);
    const vs = `uniform float uTempo; uniform vec3 uCam; uniform float uVel; uniform float uVento;
      attribute vec3 aBase;
      void main() {
        vec3 off = position - aBase;
        vec3 b = aBase;
        b.y = mod(b.y - uTempo * uVel, ${H});                         // cai e volta lá de cima
        b.x += sin(uTempo * 0.7 + b.z) * uVento;                     // vento balançando
        b.x = uCam.x + mod(b.x - uCam.x + ${C}, ${C2}) - ${C};      // sempre em volta da câmera
        b.z = uCam.z + mod(b.z - uCam.z + ${C}, ${C2}) - ${C};
        gl_Position = projectionMatrix * viewMatrix * vec4(b + off, 1.0);
        gl_PointSize = 3.0;
      }`;
    const fs = chuva ? 'void main(){ gl_FragColor = vec4(0.75, 0.82, 0.95, 0.45); }' : 'void main(){ gl_FragColor = vec4(1.0, 1.0, 1.0, 0.9); }';
    const m = new THREE.ShaderMaterial({ uniforms: U, vertexShader: vs, fragmentShader: fs, transparent: true, depthWrite: false });
    obj = chuva ? new THREE.LineSegments(g, m) : new THREE.Points(g, m);
    obj.frustumCulled = false;
    scene.add(obj);
  }
  return {
    definir(t) { if (t !== tipo || (!obj && (t === 'chuva' || t === 'neve'))) criar(t); },
    atualizar(dt) { if (!obj) return; U.uTempo.value = (U.uTempo.value + dt) % 1000; U.uCam.value.copy(camera.position); },
  };
})();

// ---------------------------------------------------------------------
// PLACAR E INFORMAÇÕES DA PARTIDA (siglas, cores, emblemas, competição, tática)
// ---------------------------------------------------------------------
function textoCompeticao(P) {
  const C = P.competicao;
  if (!C || C.tipo === 'amistoso') return C && C.nome ? C.nome : 'Amistoso';
  if (C.tipo === 'liga') return (C.nome || 'Liga') + (C.rodada ? ' · Rodada ' + C.rodada : '');
  let t = (C.nome || 'Copa') + (C.fase ? ' · ' + C.fase : '');
  if (C.mataMata && C.jogo === 'volta' && C.placarIda) t += ' · Volta (ida ' + C.placarIda[0] + 'x' + C.placarIda[1] + ')';
  else if (C.mataMata && C.jogo === 'ida') t += ' · Ida';
  return t;
}
// Agregado (jogo de volta do mata-mata): placar da ida + o de agora. null fora do mata-mata de volta.
function agregado() {
  const C = PARTIDA && PARTIDA.competicao;
  if (!C || !C.mataMata || C.jogo !== 'volta' || !C.placarIda) return null;
  return [C.placarIda[0] + G.score[0], C.placarIda[1] + G.score[1]];
}
function atualizarPlacarFixo() {
  const P = PARTIDA, tags = document.querySelectorAll('#score .tag');
  [0, 1].forEach((i) => {
    const el = tags[i]; if (!el) return;
    el.textContent = P.timesObj[i].sigla;
    el.style.background = P.uniformes[i].camisa;
    el.style.color = corDist(P.uniformes[i].camisa, '#ffffff') < 120 ? '#111' : '#fff';
    let c = document.getElementById('emb' + i);
    if (!c) { c = document.createElement('canvas'); c.id = 'emb' + i; c.width = c.height = 26; c.style.cssText = 'width:18px;height:18px;image-rendering:auto;vertical-align:middle'; }
    const g = c.getContext('2d'); g.clearRect(0, 0, 26, 26); desenharEmblema(g, 1, 1, 24, 24, P.timesObj[i].emblema);
    if (i === 0) el.parentNode.insertBefore(c, el); else el.parentNode.insertBefore(c, el.nextSibling);
  });
  let info = $('compInfo');
  if (!info) {
    info = document.createElement('div'); info.id = 'compInfo';
    info.style.cssText = 'position:absolute;top:calc(58px + env(safe-area-inset-top,0px));left:50%;transform:translateX(-50%);font:600 10px var(--font-body);color:var(--muted);background:var(--panel);padding:2px 8px;border:1px solid var(--line);white-space:nowrap;pointer-events:none';
    $('score').parentNode.appendChild(info);
  }
  info.textContent = textoCompeticao(P);
  atualizarInfoTatica();
}
function atualizarAgregado() {
  const a = agregado(), info = $('compInfo');
  if (!info || !PARTIDA) return;
  const base = textoCompeticao(PARTIDA);
  const txt = a ? base + ' · Agregado ' + a[0] + 'x' + a[1] : base;
  if (info.textContent !== txt) info.textContent = txt;
}
function atualizarInfoTatica() {
  const el = $('taticaInfo');
  if (!el || !PARTIDA) return;
  el.textContent = PARTIDA.timesObj[0].nome + ': ' + TATICAS[PARTIDA.taticas[0]].nome + ' (' + PARTIDA.formacoes[0] + ') · ' +
    PARTIDA.timesObj[1].nome + ': ' + TATICAS[PARTIDA.taticas[1]].nome + ' (' + PARTIDA.formacoes[1] + ')';
}

// ---------------------------------------------------------------------
// MONTA A PARTIDA INTEIRA. Chamado no começo e sempre que a configuração muda.
// ---------------------------------------------------------------------
function montarPartida(cfg) {
  PARTIDA = resolverPartida(cfg);
  aplicarDimensoes(PARTIDA.campo);
  CONFIG.MATCH_SECONDS = PARTIDA.duracao;
  CONFIG.AI_TACKLE_CHANCE = PARTIDA.ajuste.desarme;
  CONFIG.BROKEN_PASS_CHANCE = PARTIDA.ajuste.passeQuebrado;
  montarEstadio();
  Object.assign(G, { subsFila: [], trocas: [], lesoes: [] });
  montarTimes(PARTIDA);                            // (resetMatch monta de novo a cada partida: suspensões/lesões novas)
  montarTecnicos(PARTIDA);
  for (const o of officials) if (o.role === 'AR') { o.lineZ = Math.sign(o.lineZ) * (HALF_W + 1.3); o.z = o.lineZ; o.mesh.raiz.visible = PARTIDA.regras.impedimento; }   // sem impedimento (society): sem bandeirinhas   // bandeirinhas na lateral do campo novo
  aplicarAmbiente(PARTIDA);
  atualizarPlacarFixo();
  limparReplay();
  G.taticaManual = false; G.tecnicoT = 0;
  return PARTIDA;
}

// ---------------------------------------------------------------------
// HISTÓRICO ENTRE PARTIDAS (4.1.0): cartões acumulados, suspensões e lesões de cada jogador,
// salvo no aparelho ('futebolJs.historico.v1'). Chave do jogador = nome; você = '__voce'.
//   amarelos .. 3 acumulados = 1 jogo de suspensão (se a regra do campo acumular)
//   vermelho .. 1 jogo de suspensão
//   lesão ..... leve (joga, mas sente), média (1–2 jogos), grave (4–8 jogos)
// Quem está suspenso/lesionado NÃO é escalado; quando o time joga sem ele, conta 1 jogo cumprido.
// ---------------------------------------------------------------------
const CHAVE_VOCE = '__voce';
function lerHistorico() { return salvo.ler('futebolJs.historico.v1', { times: {} }); }
function fichaDe(H, timeId, nome) {
  H.times[timeId] = H.times[timeId] || {};
  return (H.times[timeId][nome] = H.times[timeId][nome] || { amarelos: 0, suspenso: 0, lesao: null });
}
const indisponivel = (f) => f && (f.suspenso > 0 || (f.lesao && f.lesao.jogos > 0));
function motivoFora(f) {
  if (!f) return '';
  if (f.suspenso > 0) return 'suspenso (' + f.suspenso + ' jogo' + (f.suspenso > 1 ? 's' : '') + ')';
  if (f.lesao && f.lesao.jogos > 0) return 'lesão ' + f.lesao.tipo + ' (' + f.lesao.jogos + ' jogo' + (f.lesao.jogos > 1 ? 's' : '') + ')';
  return '';
}

// Cria UM jogador (escalação e substituição usam a mesma função).
function criarJogador(P, team, f, j, num, isUser) {
  const dir = team === 0 ? 1 : -1, T = P.timesObj[team], U = P.uniformes[team], isGK = f.role === 'GK';
  const nome = isUser ? P.usuario.nome : j.nome;
  const mesh = makeAthlete({
    camisa: isGK ? U.goleiro : U.camisa, listra: U.listra, gola: U.gola, numero: num,
    calcao: U.calcao, meia: isGK ? U.goleiro : U.meia, sola: U.sola, emblema: T.emblema,
    pele: j.pele, cabelo: j.cabelo, estilo: j.estilo, luva: isGK ? 0xf2f2ee : null,
    nome: isUser ? 'VOCÊ' : nome, fundoNome: isUser ? 'rgba(201,106,18,0.92)' : corFundoNome(U.camisa),
  });
  scene.add(mesh.raiz);
  const vel = team === 0 ? P.ajuste.velNossa : P.ajuste.velAdv;
  const base = { x: f.fx * HALF_L, z: f.fz * HALF_W };
  return {
    id: G.proxId++, team, dir, role: f.role, funcao: f.funcao || null, base, slotF: f, name: nome, numero: num, ficha: isUser ? CHAVE_VOCE : j.nome, dados: j,
    x: base.x * dir, z: base.z * dir, vx: 0, vz: 0, angle: dir > 0 ? 0 : Math.PI, anim: Math.random() * 6,
    stun: 0, controlCd: 0, think: 0, hold: 0, tackleT: 0.3, tackleCd: 0,
    dash: 0, dashVX: 0, dashVZ: 0, boost: 0,
    running: false, scripted: false, fall: 0, fallSide: 1, fallKind: 'lado', tackle: 0, guard: 0, kickT: 0, pose: null,
    celeb: null,
    diveT: 0, diveDur: 0.55, diveVX: 0, diveVZ: 0, diveSide: 1, jumpT: 0,
    throwIn: false, goalKick: false, setPiece: null, carry: false, slot: -1,
    speedMul: rand(0.9, 1.05) * (isUser ? 1 : vel), drift: { x: 0, z: 0, tx: 0, tz: 0, t: rand(0, 3) }, runT: 0,
    commitT: rand(0.5, 2), committing: 0, folego: 1,
    stamina: 1, exhausted: false, regenWait: 0, dribbleCd: 0, staminaMax: 1,
    isUser, mesh,
  };
}

function montarTimes(P) {
  for (const p of players) descartarBoneco(p.mesh.raiz);
  players.length = 0; TEAMS[0].length = 0; TEAMS[1].length = 0; user = null;
  G.proxId = 0;
  const H = lerHistorico();
  P.reservas = [[], []]; P.desfalques = [[], []]; P.numerosUsados = [new Set(), new Set()];
  P.participantes = [];
  for (let team = 0; team < 2; team++) {
    const T = P.timesObj[team];
    const slots = montarFormacao(P.formacoes[team], P.campo.jogadores - 1);
    const usados = P.numerosUsados[team];
    const numero = (role) => { const n = NUMEROS[role].find((v) => !usados.has(v)) || (20 + usados.size); usados.add(n); return n; };
    let userSlot = -1;
    if (team === 0) { userSlot = slots.findIndex((s) => s.role === P.usuario.posicao); if (userSlot < 0) userSlot = slots.findIndex((s) => s.role === 'FWD'); }
    // Quem pode jogar: tira suspensos e lesionados (eles cumprem este jogo).
    const disponiveis = [];
    for (const j of P.elencos[team]) {
      const f = H.times[T.id] && H.times[T.id][j.nome];
      if (indisponivel(f)) P.desfalques[team].push({ nome: j.nome, motivo: motivoFora(f) }); else disponiveis.push(j);
    }
    if (team === 0) {
      const fv = H.times[T.id] && H.times[T.id][CHAVE_VOCE];
      P.usuarioIndisponivel = indisponivel(fv) ? motivoFora(fv) : '';   // o modo história decide; no teste você joga assim mesmo
    }
    let k = 0;
    slots.forEach((f, i) => {
      const isUser = i === userSlot;
      const j = isUser ? Object.assign({ pele: '#946042', cabelo: '#1C140F', estilo: 0 }, P.usuario.aparencia || {}) : (disponiveis[k++] || P.elencos[team][i % P.elencos[team].length]);
      const p = criarJogador(P, team, f, j, numero(f.role), isUser);
      players.push(p); TEAMS[team].push(p); P.participantes.push(p);
      if (isUser) user = p;
    });
    P.reservas[team] = disponiveis.slice(k);           // banco: quem sobrou disponível
  }
  P.subsUsadas = [0, 0];
  CORPOS = players.concat(officials);
  montarReservasBanco(P);
}

// ---------------------------------------------------------------------
// RESERVAS NO BANCO (4.1.2). Até 5 de cada time sentados no banco (bonecos só de enfeite, fora da
// lista de jogadores). Quando o técnico pede uma troca, o reserva da vez LEVANTA, vai até a linha
// (do lado do quarto árbitro) e fica esperando, se aquecendo, até a bola parar — aí a cena da
// troca começa exatamente de onde ele está. Quem sai vai sentar no lugar que ficou vazio.
// O boneco segue o "estado" do jogo (fila de trocas), então nunca fica preso numa fase.
// ---------------------------------------------------------------------
const reservasBanco = [];
const BANCO_SENTA_Y = -0.185;                      // quadril a 0,555 m (assento a 0,45 m) — conferido sem atravessar o banco
function bancoX(team) { return (team === 0 ? -1 : 1) * Math.min(9, HALF_L * 0.25); }
function assentoBanco(team, i) { return { x: bancoX(team) + (i - 2) * 0.95, z: -(HALF_W + LADO_BANCO.banco) - 0.08 }; }
function esperaBanco(team, k) { const s = team === 0 ? 1 : -1; return { x: bancoX(team) - s * (0.6 + k * 0.8), z: -(HALF_W + LADO_BANCO.espera) }; }
function bonecoDoBanco(P, team, j, role, numero, isUser) {
  const T = P.timesObj[team], U = P.uniformes[team], gk = role === 'GK';
  const m = makeAthlete({ camisa: gk ? U.goleiro : U.camisa, listra: U.listra, gola: U.gola, numero: numero || '', calcao: U.calcao, meia: gk ? U.goleiro : U.meia, sola: U.sola,
    emblema: T.emblema, pele: j.pele, cabelo: j.cabelo, estilo: j.estilo || 0, luva: gk ? 0xf2f2ee : null, nome: isUser ? 'VOCÊ' : j.nome, fundoNome: corFundoNome(U.camisa) });
  m.etiqueta.visible = false;
  scene.add(m.raiz);
  return m;
}
function montarReservasBanco(P) {
  for (const d of reservasBanco) descartarBoneco(d.mesh.raiz);
  reservasBanco.length = 0;
  if (!temBanco(P)) return;
  for (const team of [0, 1]) {
    P.reservas[team].slice(0, 5).forEach((j, i) => {
      const a = assentoBanco(team, i);
      reservasBanco.push({ team, j, assento: i, mesh: bonecoDoBanco(P, team, j, 'MID', '', false), x: a.x, z: a.z, ang: Math.PI / 2, sentado: 1,
        pose: Math.random() < 0.7 ? 'joelhos' : 'cruzados', anim: Math.random() * 6, fase: Math.random() * 6 });
    });
  }
}
// Quem saiu senta no banco (no primeiro lugar livre), andando da linha até lá.
function sentarNoBanco(sai, team, direto) {
  if (!PARTIDA || !temBanco(PARTIDA)) return;
  // Lugar livre = nenhum boneco com esse lugar, a não ser quem já está entrando em campo (saiu da
  // lista de reservas: o boneco dele some no próximo quadro e o lugar fica para quem sai).
  const ocup = new Set(reservasBanco.filter((d) => d.team === team && (d.saiu || PARTIDA.reservas[team].includes(d.j))).map((d) => d.assento));
  let i = [0, 1, 2, 3, 4].find((k) => !ocup.has(k));
  if (i === undefined) return;
  const j = sai.isUser ? Object.assign({ pele: '#946042', cabelo: '#1C140F', estilo: 0, nome: 'VOCÊ' }, PARTIDA.usuario.aparencia || {}) : sai.dados || { pele: '#BF8159', cabelo: '#111', estilo: 0, nome: sai.name };
  const lado = Math.sign(sai.x - bancoX(team)) || 1;
  const a = assentoBanco(team, i);
  reservasBanco.push({ team, j, assento: i, saiu: true, mancando: !!sai.mancando, mesh: bonecoDoBanco(PARTIDA, team, j, sai.role, sai.numero, sai.isUser),
    x: direto ? a.x : clamp(sai.x, bancoX(team) - 6, bancoX(team) + 6), z: direto ? a.z : Math.min(sai.z, -(HALF_W + 0.8)), ang: direto ? Math.PI / 2 : Math.atan2(-1, 0), sentado: direto ? 1 : 0, pose: 'joelhos', anim: 0, fase: Math.random() * 6 });
}
function atualizarBanco(dt) {
  if (!PARTIDA || !reservasBanco.length) return;
  // Quem está na fila de troca (por time, na ordem) vai para a linha esperar.
  const fila = [0, 0], chamados = new Map();
  for (const it of G.subsFila) {
    const k = fila[it.team]++;
    const j = PARTIDA.reservas[it.team][k];
    if (j) chamados.set(j, k);
  }
  let alguemEsperando = false;
  for (let n = reservasBanco.length - 1; n >= 0; n--) {
    const d = reservasBanco[n];
    // Já entrou em campo (saiu da lista de reservas): o boneco some (o jogador de verdade assume).
    if (!d.saiu && !PARTIDA.reservas[d.team].includes(d.j)) { descartarBoneco(d.mesh.raiz); reservasBanco.splice(n, 1); continue; }
    const k = d.saiu ? undefined : chamados.get(d.j);
    const final = k !== undefined ? esperaBanco(d.team, k) : assentoBanco(d.team, d.assento);
    const espera = k !== undefined;
    // (4.1.3) Corredor na frente do banco: para entrar ou sair do lugar, primeiro vai reto para a
    // frente do próprio lugar e anda pelo corredor — nunca passa por cima de quem está sentado.
    const corredor = assentoBanco(d.team, 0).z + 1.1, naFileira = d.z < corredor - 0.3;
    let alvo = final;
    if (!espera && Math.abs(d.x - final.x) > 0.12) alvo = naFileira ? { x: d.x, z: corredor } : { x: final.x, z: corredor };
    else if (espera && naFileira) alvo = { x: d.x, z: corredor };
    const dx = alvo.x - d.x, dz = alvo.z - d.z, dist = Math.hypot(dx, dz);
    let andando = false;
    if (dist > 0.04) {
      if (d.sentado > 0) d.sentado = Math.max(0, d.sentado - dt / 0.45);          // levanta
      else {
        const v = d.mancando ? 1.2 : espera ? 2.6 : 1.8, st = Math.min(dist, v * dt);
        d.x += dx / dist * st; d.z += dz / dist * st; andando = true;
        d.ang = turnToward(d.ang, Math.atan2(dz, dx), 8 * dt);
        d.anim += v * 2.6 * dt;
      }
    } else {
      d.x = alvo.x; d.z = alvo.z;
      d.ang = turnToward(d.ang, Math.PI / 2, 6 * dt);                              // de frente para o campo
      if (!espera && alvo === final && Math.abs(Math.atan2(Math.sin(d.ang - Math.PI / 2), Math.cos(d.ang - Math.PI / 2))) < 0.15) { d.ang = Math.PI / 2; d.sentado = Math.min(1, d.sentado + dt / 0.45); }
    }
    if (espera && alvo === final && dist < 0.3) alguemEsperando = true;
    posarBoneco(d, andando, espera && alvo === final && dist <= 0.04, dt);
  }
  // Quarto árbitro aparece na linha enquanto alguém espera para entrar (a placa só na cena da troca).
  if (alguemEsperando && G.state !== 'subst') {
    const it = G.subsFila[0];
    if (it) { const q = garantirQuartoArbitro(), s = it.team === 0 ? 1 : -1; q.raiz.visible = true; q.raiz.position.set(bancoX(it.team) + s * 1.8, 0, -(HALF_W + LADO_BANCO.quarto)); q.raiz.rotation.y = -Math.PI / 2;
      q.bracoD.rotation.z = q.bracoE.rotation.z = 0.15; q.bracoD.rotation.x = -0.1; q.bracoE.rotation.x = 0.1; }
  } else if (quartoArbitro && G.state !== 'subst') quartoArbitro.raiz.visible = false;
}
// Pose do boneco do banco: mistura "em pé" e "sentado" (d.sentado de 0 a 1).
function posarBoneco(d, andando, aquecendo, dt) {
  const m = d.mesh, s = smooth(d.sentado), agora = performance.now() / 1000;
  m.raiz.position.set(d.x, BANCO_SENTA_Y * s, d.z);
  m.raiz.rotation.y = -d.ang;
  const bal = andando ? Math.sin(d.anim) * 0.55 : 0;
  m.pernaE.rotation.z = 1.5 * s + bal; m.pernaD.rotation.z = 1.5 * s - bal;
  usarJoelhos(m, s > 0.02 ? -1.5 * s : 0, s > 0.02 ? -1.5 * s : 0);
  m.corpo.rotation.z = 0; m.corpo.rotation.x = 0; m.corpo.position.y = 0;
  if (aquecendo) {                                 // esperando na linha: pulinhos e gira os braços
    const f = agora * 2.2 + d.fase, pul = Math.max(0, Math.sin(f * 3));
    m.raiz.position.y = pul * 0.12;
    m.bracoE.rotation.z = Math.sin(f * 2) * 1.6 + 1.2; m.bracoD.rotation.z = Math.sin(f * 2 + Math.PI) * 1.6 + 1.2;
    m.bracoE.rotation.x = 0.25; m.bracoD.rotation.x = -0.25;
    usarCotovelo(m.bracoE, 0, 0); usarCotovelo(m.bracoD, 0, 0);
    return;
  }
  if (s > 0.5 && d.pose === 'cruzados') {
    const C = TEC_POSES.cruzados;
    m.bracoE.rotation.z = C.ez; m.bracoE.rotation.x = C.ex; usarCotovelo(m.bracoE, C.ecx * s, C.ecz * s);
    m.bracoD.rotation.z = C.dz; m.bracoD.rotation.x = C.dx; usarCotovelo(m.bracoD, C.dcx * s, C.dcz * s);
  } else {
    // Mãos nos joelhos (sentado) ou balançando andando.
    usarCotovelo(m.bracoE, 0, 0); usarCotovelo(m.bracoD, 0, 0);
    m.bracoE.rotation.z = 0.75 * s - bal * 0.8; m.bracoD.rotation.z = 0.75 * s + bal * 0.8;
    m.bracoE.rotation.x = 0.12; m.bracoD.rotation.x = -0.12;
  }
  // (sem cabeça separada e sem sombra sentado: menos chamadas de desenho no celular)
  m.raiz.children.forEach((o) => { if (o.geometry === SHADOW_GEO) o.visible = s < 0.5; });
}
function garantirQuartoArbitro() {
  if (!quartoArbitro) {
    quartoArbitro = makeAthlete({ camisa: '#161616', listra: '#E8C547', gola: '#3a3a3a', numero: '', calcao: 0x161616, meia: 0x161616, sola: 0xE8C547, pele: '#DDA67E', cabelo: '#1C140F', estilo: 2, nome: '4º árbitro', fundoNome: 'rgba(30,30,30,0.9)' });
    quartoArbitro.etiqueta.visible = false; scene.add(quartoArbitro.raiz);
  }
  return quartoArbitro;
}

// ---------------------------------------------------------------------
// LESÕES (4.1.0). Acontecem em falta sofrida (e, para você, também correndo sem fôlego). Para
// VOCÊ, o autocuidado da história (PARTIDA.usuario.autocuidado, 0 a 1) pesa: pouco autocuidado =
// mais chance de se machucar e mais chance de ser grave.
//   leve .. continua jogando, mas sente (você: fôlego máximo 70%; IA: um pouco mais lenta)
//   média . sai do jogo (substituição) e fica 1–2 jogos fora
//   grave . sai do jogo e fica 4–8 jogos fora
// Você saindo: o jogo continua sem você (câmera de TV, mais rápido) e dá para pular para o fim.
// ---------------------------------------------------------------------
function chanceLesao(p) {
  if (!p.isUser) return 0.05;
  const a = clamp(PARTIDA.usuario.autocuidado ?? 0.7, 0, 1);
  return 0.06 * (1 + 2.5 * (1 - a));
}
function sortearGravidade(p) {
  const a = p.isUser ? clamp(PARTIDA.usuario.autocuidado ?? 0.7, 0, 1) : 0.7;
  const r = Math.random(), grave = 0.06 + 0.3 * (1 - a), media = 0.3;
  if (r < grave) return { tipo: 'grave', jogos: 4 + Math.floor(Math.random() * 5) };
  if (r < grave + media) return { tipo: 'média', jogos: 1 + Math.floor(Math.random() * 2) };
  return { tipo: 'leve', jogos: 0 };
}
function talvezLesionar(p, chanceExtra = 1) {
  if (!p || p.out || p.lesao || Math.random() >= chanceLesao(p) * chanceExtra) return false;
  lesionar(p);
  return true;
}
function lesionar(p, grav) {
  const L = grav || sortearGravidade(p);
  p.lesao = L;
  G.lesoes.push({ team: p.team, nome: p.isUser ? 'Você' : p.name, ficha: p.ficha, tipo: L.tipo, jogos: L.jogos });
  showToast((p.isUser ? 'Você se machucou' : p.name + ' se machucou') + ' (lesão ' + L.tipo + ')', p.team === 0 ? 'bad' : '');
  if (L.tipo === 'leve') {
    if (p.isUser) { p.staminaMax = 0.7; p.stamina = Math.min(p.stamina, 0.7); } else p.speedMul *= 0.92;
    return;
  }
  p.speedMul *= 0.7; p.mancando = true;
  pedirSubstituicao(p.team, p, 'lesão', true);
}
// Você correndo SEM FÔLEGO: lesão muscular (bem rara com autocuidado alto). O juiz para o jogo.
function talvezLesaoMuscular(u, dt) {
  if (u.lesao || !u.exhausted || !u.running || G.state !== 'play') return;
  const a = clamp(PARTIDA.usuario.autocuidado ?? 0.7, 0, 1);
  if (Math.random() < dt * 0.005 * Math.pow(1 - a, 1.5)) {
    perderBola(u, 'queda');
    lesionar(u);
    const dono = G.possession ? G.possession.team : 1 - u.team;
    if (G.possession === u) G.possession = null;
    referee.refPose = 'apito'; referee.refPoseT = 1.3; Som.apito(0.4);
    iniciarParalisacao({ team: dono, spot: { x: ball.x, z: ball.z }, off: u, vic: u, card: null, reason: 'lesao' });
  }
}

// ---------------------------------------------------------------------
// SUBSTITUIÇÕES (4.1.0). O técnico pede (cansado, lesionado) e a troca acontece na próxima
// parada (bola fora ou falta). Cena: placa do quarto árbitro, quem sai vai até a linha, os dois
// batem na mão e quem entra corre para o lugar. Limite por campo (PARTIDA.regras.substituicoes).
// ---------------------------------------------------------------------
function pedirSubstituicao(team, sai, motivo, urgente) {
  const P = PARTIDA;
  if (P.subsUsadas[team] >= P.regras.substituicoes || !P.reservas[team].length) return false;
  if (G.subsFila.some((s) => s.sai === sai)) return false;
  const item = { team, sai, motivo };
  if (urgente) G.subsFila.unshift(item); else G.subsFila.push(item);
  return true;
}
// Técnico olhando o cansaço (chamado junto com tecnicoPensa).
function tecnicoOlhaCansaco() {
  for (const team of [0, 1]) {
    if (G.subsFila.some((s) => s.team === team)) continue;
    const cansado = TEAMS[team].filter((p) => !p.isUser && !p.out && p.role !== 'GK' && (p.folego ?? 1) < 0.38)
      .sort((a, b) => a.folego - b.folego)[0];
    if (cansado) pedirSubstituicao(team, cansado, 'cansaço', false);
  }
}
// Momento de trocar: bola fora (busca da bola) ou falta (depois do apito).
function verificarSubstituicoes() {
  if (!G.subsFila.length || G.subst || G.pulando) {
    if (G.pulando && G.subsFila.length && (G.state === 'restart' || G.state === 'foul')) executarTrocaDireto(G.subsFila.shift());
    return;
  }
  const S = G.sp, F = G.foul;
  const parado = (G.state === 'restart' && S && (S.phase === 'fetch' || S.phase === 'carry')) || (G.state === 'foul' && F && F.t > 1.0);
  if (!parado) return;
  const item = G.subsFila[0];
  if (item.sai.out || !players.includes(item.sai)) { G.subsFila.shift(); return; }
  if (S && S.taker === item.sai) return;           // é o cobrador: espera a próxima
  G.subsFila.shift();
  iniciarSubstituicao(item);
}
// Troca o jogador nas listas (mesma posição da formação) e devolve quem entrou.
function trocarNasListas(item) {
  const P = PARTIDA, sai = item.sai, team = item.team;
  const j = P.reservas[team].shift();
  const f = sai.slotF || { role: sai.role, fx: sai.base.x / HALF_L, fz: sai.base.z / HALF_W };
  const usados = P.numerosUsados[team];
  const num = NUMEROS[f.role].find((v) => !usados.has(v)) || (20 + usados.size); usados.add(num);
  const entra = criarJogador(P, team, f, j, num, false);
  entra.folego = 1;
  const i = players.indexOf(sai), t = TEAMS[team].indexOf(sai);
  if (i >= 0) players[i] = entra;
  if (t >= 0) TEAMS[team][t] = entra;
  P.participantes.push(entra);
  P.subsUsadas[team]++;
  if (G.possession === sai) G.possession = null;
  if (G.passTarget && G.passTarget.p === sai) G.passTarget = null;
  for (const k of [0, 1]) { if (G.chasers[k] === sai) G.chasers[k] = null; if (G.pressers[k] === sai) G.pressers[k] = null; if (G.covers[k] === sai) G.covers[k] = null; }
  sai.out = true; sai.substituido = true;
  G.trocas.push({ team, sai: sai.isUser ? 'Você' : sai.name, numSai: sai.numero, entra: entra.name, numEntra: num, motivo: item.motivo });
  if (sai.isUser) virarEspectador();
  return entra;
}
// Sem cena (quando está pulando para o resultado).
function executarTrocaDireto(item) {
  if (!players.includes(item.sai)) return;
  const entra = trocarNasListas(item);
  descartarBoneco(item.sai.mesh.raiz);
  sentarNoBanco(item.sai, item.team, true);
  entra.x = item.sai.x; entra.z = item.sai.z;
  if (item.sai.isUser) { item.sai.x = 999; item.sai.z = 999; }
  CORPOS = players.concat(officials);
}

// Placa eletrônica do quarto árbitro (sprite com canvas): vermelho sai, verde entra.
const placaTroca = (() => {
  const c = document.createElement('canvas'); c.width = 64; c.height = 40;
  const tex = new THREE.CanvasTexture(c); tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.NearestFilter;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: true }));
  sp.scale.set(1.0, 0.62, 1); sp.visible = false; scene.add(sp);
  return {
    mostrar(x, z, numSai, numEntra) {
      const g = c.getContext('2d');
      g.fillStyle = '#111'; g.fillRect(0, 0, 64, 40);
      g.font = 'bold 17px monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillStyle = '#ff3b30'; g.fillText('▼' + numSai, 32, 11);
      g.fillStyle = '#4cd964'; g.fillText('▲' + numEntra, 32, 29);
      tex.needsUpdate = true; sp.position.set(x, 2.3, z); sp.visible = true;
    },
    esconder() { sp.visible = false; },
  };
})();
// Quarto árbitro segurando a placa (um boneco simples, criado uma vez).
let quartoArbitro = null;
function iniciarSubstituicao(item) {
  const sai = item.sai, team = item.team;
  const bx = (team === 0 ? -1 : 1) * Math.min(9, HALF_L * 0.25), linhaZ = -(HALF_W + LADO_BANCO.espera - 0.9);
  const entra = trocarNasListas(item);
  const ep = esperaBanco(team, 0);                 // (4.1.2) é onde o reserva estava esperando
  entra.x = ep.x; entra.z = ep.z; entra.angle = Math.PI / 2; entra.scripted = true;
  sai.scripted = true; sai.stun = 0; sai.fall = 0; sai.falling = false; sai.perda = null;
  garantirQuartoArbitro();
  quartoArbitro.raiz.visible = true;
  const qx = bx + (team === 0 ? 1.8 : -1.8);       // o quarto árbitro fica do lado, sem tapar o "toca aqui"
  quartoArbitro.raiz.position.set(qx, 0, -(HALF_W + LADO_BANCO.quarto)); quartoArbitro.raiz.rotation.y = -Math.PI / 2;
  quartoArbitro.bracoD.rotation.z = 2.5; quartoArbitro.bracoE.rotation.z = 2.5; quartoArbitro.bracoD.rotation.x = 0.2; quartoArbitro.bracoE.rotation.x = -0.2;
  placaTroca.mostrar(qx, -(HALF_W + LADO_BANCO.placaTroca), sai.numero, entra.numero);
  // (4.1.3) Quem sai vai até a frente de quem entra (0,9 m mais para o campo), SEM limite de tempo.
  G.subst = { t: 0, fase: 'placa', item, sai, entra, bx, qx, linhaZ, alvoSai: { x: entra.x, z: linhaZ }, estadoAntes: G.state, tocou: false };
  CORPOS = players.concat(officials, [sai]);       // quem sai continua sendo desenhado até sumir
  G.state = 'subst'; G.targetScale = 1;
  setLetterbox(true);
  $('skipBtn').hidden = false;
  $('cineLabel').textContent = 'SUBSTITUIÇÃO · ' + PARTIDA.timesObj[team].sigla + ' · sai ' + (sai.isUser ? 'você' : sai.name) + ' (' + sai.numero + '), entra ' + entra.name + ' (' + entra.numero + ')' + (item.motivo === 'lesão' ? ' · lesão' : '');
  Som.apito(0.25);
}
// Cena da troca (4.1.3), em fases — cada uma só acaba quando a anterior aconteceu DE VERDADE:
//   'placa' (1,3 s) .. câmera na placa do quarto árbitro; quem sai já começa a andar
//   'sai' ............ câmera acompanha quem sai até ele chegar na frente de quem entra (sem
//                      tempo limite: se ele estava longe, a câmera vai junto; dá para pular)
//   'toque' (0,6 s) .. os dois de frente batem as mãos
//   'troca' (1,4 s) .. quem entra corre para o lugar dele; quem sai vai para o banco (e senta)
function atualizarSubstituicao(rdt) {
  const S = G.subst;
  if (!S) return;
  S.t += rdt; S.tf = (S.tf || 0) + rdt;
  const sai = S.sai, entra = S.entra;
  const andar = (p, alvo, v, dt) => {
    const dx = alvo.x - p.x, dz = alvo.z - p.z, d = Math.hypot(dx, dz);
    if (d < 0.05) { p.vx = p.vz = 0; return true; }
    const s = Math.min(v, d / dt);
    p.vx = dx / d * s; p.vz = dz / d * s; p.x += p.vx * dt; p.z += p.vz * dt;
    p.angle = turnToward(p.angle, Math.atan2(dz, dx), 8 * dt); p.anim += s * 2.6 * dt;
    return d < 0.1;
  };
  const mudar = (f) => { S.fase = f; S.tf = 0; };
  entra.vx = entra.vz = 0;
  if (S.fase === 'placa' || S.fase === 'sai') {
    const longe = dist2D(sai, S.alvoSai) > 12;
    const chegou = andar(sai, S.alvoSai, sai.mancando ? (longe ? 3.0 : 2.0) : longe ? 6.5 : 4.2, rdt);   // longe: vem trotando (machucado, mancando)
    entra.angle = turnToward(entra.angle, Math.atan2(sai.z - entra.z, sai.x - entra.x), 6 * rdt);
    if (S.fase === 'placa' && S.tf > 1.3) mudar('sai');
    if (S.fase === 'sai' && chegou) { mudar('toque'); S.tocou = true; Som.toque(0.5); }
  } else if (S.fase === 'toque') {
    sai.vx = sai.vz = 0;
    sai.angle = Math.atan2(entra.z - sai.z, entra.x - sai.x); entra.angle = Math.atan2(sai.z - entra.z, sai.x - entra.x);
    sai.jumpT = 0; G.substToque = [sai, entra];
    if (S.tf > 0.6) { G.substToque = null; mudar('troca'); }
  } else {
    andar(entra, { x: entra.slotF ? entra.base.x * entra.dir : entra.x, z: entra.base.z * entra.dir }, 6, rdt);
    andar(sai, { x: sai.x + (S.bx - sai.x) * 0.2, z: -(HALF_W + LADO_BANCO.espera + 0.6) }, sai.mancando ? 1.6 : 2.4, rdt);
    if (S.tf > 1.4) terminarSubstituicao();
  }
}
function terminarSubstituicao() {
  const S = G.subst;
  if (!S) return;
  G.subst = null; G.substToque = null;
  descartarBoneco(S.sai.mesh.raiz);
  const pulouCena = S.fase !== 'troca';
  sentarNoBanco(S.sai, S.item.team, pulouCena);    // quem saiu vai sentar no banco (pulou a cena: já sentado)
  if (S.sai.isUser) { S.sai.x = 999; S.sai.z = 999; }
  S.entra.scripted = false;
  const pulou = S.fase !== 'troca';
  if (pulou) { S.entra.z = -(HALF_W - 1); S.entra.angle = Math.PI / 2; }   // pulou: já entra em campo
  CORPOS = players.concat(officials);
  placaTroca.esconder();
  if (quartoArbitro) quartoArbitro.raiz.visible = false;
  setLetterbox(G.state === 'foul' || S.estadoAntes === 'foul');
  $('cineLabel').textContent = '';
  $('skipBtn').hidden = !(S.estadoAntes === 'foul' || S.estadoAntes === 'restart');
  G.state = S.estadoAntes;
  if (S.item.sai.isUser) mostrarAvisoEspectador();
}
// Câmera da troca: na placa; depois acompanha quem sai; no "toca aqui", os dois com o banco atrás.
function cameraSubstituicao() {
  const S = G.subst, sai = S.sai;
  if (S.fase === 'placa') return { px: S.qx + 2.6, py: 2.0, pz: -(HALF_W) + 3.5, tx: S.qx, ty: 1.9, tz: -(HALF_W + LADO_BANCO.quarto) };
  if (S.fase === 'sai') {
    // Atrás e um pouco acima de quem sai, olhando para onde ele vai (o banco e quem entra ao fundo).
    const dx = S.alvoSai.x - sai.x, dz = S.alvoSai.z - sai.z, d = Math.hypot(dx, dz) || 1, k = Math.min(1, d / 6);
    return { px: sai.x - dx / d * 5.5 * k + 2.5, py: 3.6, pz: sai.z - dz / d * 5.5 * k + 5 * (1 - k) + 1.5, tx: sai.x + dx / d * 2 * k, ty: 1.0, tz: sai.z + dz / d * 2 * k };
  }
  const mx = (S.entra.x + sai.x) / 2;
  return { px: mx + 3.2, py: 2.1, pz: -(HALF_W) + 5.5, tx: mx, ty: 1.2, tz: -(HALF_W + LADO_BANCO.espera - 0.4) };
}

// ---------------------------------------------------------------------
// MODO ESPECTADOR (você saiu lesionado): câmera de TV, jogo 2,5× mais rápido e botão para pular
// direto para o resultado (o resto da partida é simulado rápido, sem cenas).
// ---------------------------------------------------------------------
function virarEspectador() {
  G.espectador = true;
  user.out = true;                                 // (sai de campo andando na cena; depois some)
  hideKickUI(); esconderRecepcao();
}
function mostrarAvisoEspectador() {
  showBanner('VOCÊ SAIU', 0, 2.2);
  $('skipBtn').hidden = false; $('skipBtn').textContent = 'Pular para o resultado ▶';
}
function pularParaResultado() {
  G.pulando = true;
  $('skipBtn').hidden = true;
}
// Roda muitos passos por quadro (sem cenas) até acabar. Chamado pelo loop quando G.pulando.
function avancarRapido() {
  for (let i = 0; i < 900 && G.state !== 'end'; i++) {
    if (G.state === 'replay') { terminarReplay(); continue; }
    if (G.state === 'subst') { terminarSubstituicao(); continue; }
    if (G.state === 'fim') { terminarCenaFinal(); continue; }
    if (G.state === 'penaltis') { simularPenaltisRestantes(); continue; }
    if (G.state === 'goal' || G.state === 'celebrate') { G.replayFeito = true; G.fading = false; kickoff(G.lastConceded); continue; }
    if (G.state === 'foul') { pularParalisacao(); continue; }
    if (G.state === 'restart') { skipRestart(); }
    G.time += 1 / 60;
    stepGame(1 / 60, 1 / 60);
  }
}

// ---------------------------------------------------------------------
// DISPUTA DE PÊNALTIS (4.1.0) — mata-mata empatado (no agregado, no jogo de volta).
// 5 cobranças alternadas e depois morte súbita. Você bate SÓ a sua (é o 1º do seu time por
// padrão: PARTIDA.usuario.ordemPenalti); as outras são automáticas (cobrador e goleiro da IA).
// Usa a cobrança de pênalti normal do jogo (com a sua corrida e a escolha do goleiro). O placar
// da partida não muda: os gols vão para G.pen.cob. Painel de bolinhas no alto da tela.
// ---------------------------------------------------------------------
function precisaPenaltis() {
  const C = PARTIDA.competicao;
  if (!C || !C.mataMata || C.jogo === 'ida') return false;
  const a = agregado() || G.score;
  return a[0] === a[1];
}
function iniciarPenaltis() {
  const ordemDe = (team) => {
    const linha = TEAMS[team].filter((p) => !p.out && p.role !== 'GK');
    const pesoRole = { FWD: 0, MID: 1, DEF: 2 };
    linha.sort((a, b) => pesoRole[a.role] - pesoRole[b.role]);
    if (team === 0 && !G.espectador && linha.includes(user)) {
      linha.splice(linha.indexOf(user), 1);
      const pos = clamp((PARTIDA.usuario.ordemPenalti || 1) - 1, 0, linha.length);
      linha.splice(pos, 0, user);
    }
    const gk = TEAMS[team].find((p) => p.role === 'GK' && !p.out);
    if (gk) linha.push(gk);                         // goleiro bate por último, se chegar nele
    return linha;
  };
  G.pen = { cob: [[], []], ordem: [ordemDe(0), ordemDe(1)], idx: [0, 0], vez: Math.random() < 0.5 ? 0 : 1, fase: 'prep', t: 0 };
  G.score0Pen = G.score.slice();
  setLetterbox(false); $('banner').className = '';
  showBanner('PÊNALTIS', 0, 2.2);
  painelPenaltis();
  proximaCobranca();
}
function painelPenaltis() {
  let el = $('penPainel');
  if (!el) {
    el = document.createElement('div'); el.id = 'penPainel';
    el.style.cssText = 'position:absolute;top:calc(84px + env(safe-area-inset-top,0px));left:50%;transform:translateX(-50%);background:var(--panel);border:2px solid var(--line);padding:4px 10px;font:700 12px var(--font-display);white-space:nowrap;pointer-events:none;z-index:3';
    $('score').parentNode.appendChild(el);
  }
  const P = G.pen;
  el.hidden = !P;
  if (!P) return;
  const linha = (t) => {
    const n = Math.max(5, P.cob[0].length, P.cob[1].length);
    let h = '<span style="display:inline-block;width:34px">' + PARTIDA.timesObj[t].sigla + '</span>';
    for (let i = 0; i < n; i++) {
      const r = P.cob[t][i];
      h += '<span style="display:inline-block;width:12px;height:12px;border-radius:50%;margin:0 2px;vertical-align:middle;background:' + (r === undefined ? '#3a4458' : r ? '#4cd964' : '#ff3b30') + '"></span>';
    }
    return h + ' <b>' + P.cob[t].filter(Boolean).length + '</b>';
  };
  el.innerHTML = linha(0) + '<br>' + linha(1);
}
// Coloca todo mundo no meio-campo (menos o goleiro que vai defender) e arma a próxima cobrança.
function proximaCobranca() {
  const P = G.pen, t = P.vez;
  const fila = P.ordem[t];
  if (!fila.length) { encerrarPenaltis(); return; }
  const cobrador = fila[P.idx[t] % fila.length];
  P.idx[t]++;
  P.cobrador = cobrador; P.chutou = false; P.fase = 'cobrando'; P.t = 0;
  const gkDef = TEAMS[1 - t].find((p) => p.role === 'GK' && !p.out);
  for (const p of players) if (!p.out) clearFlags(p);
  const side = t === 0 ? 1 : -1, spot = { x: side * (HALF_L - PEN_SPOT), z: 0 };
  Object.assign(ball, { x: spot.x, y: CONFIG.BALL_R, z: 0, vx: 0, vy: 0, vz: 0, spinSide: 0, spinVert: 0, hidden: false });
  G.possession = null; G.offside = null; G.kickoffPending = null;
  G.forcaCobrador = cobrador;
  startRestart('penalti', t, spot, 'disputa');
  G.forcaCobrador = null;
  skipRestart();                                   // já aparece na marca com a bola
  if (G.sp) G.sp.waitT = 0;
  if (gkDef) { gkDef.x = side * (HALF_L - 0.6); gkDef.z = 0; gkDef.vx = gkDef.vz = 0; gkDef.angle = side > 0 ? Math.PI : 0; }   // goleiro já na linha
  let k = 0;
  for (const p of players) {                       // o resto espera no meio-campo, olhando a cobrança
    if (p.out || p === cobrador || p === gkDef) continue;
    p.scripted = true;
    p.x = (p.team === 0 ? -1.5 : 1.5); p.z = -10 + (k++ % 14) * 1.4; p.vx = p.vz = 0;
    p.angle = side > 0 ? 0 : Math.PI;
  }
}
// Chamado todo quadro durante a disputa (depois do stepGame).
function atualizarPenaltis(dt) {
  const P = G.pen;
  if (!P) return;
  P.t += dt;
  if (P.fase === 'resultado') { if (P.t > 1.8) decidirOuSeguir(); return; }
  if (G.state !== 'play') return;
  if (!P.chutou && ball.lastKicker === P.cobrador && Math.hypot(ball.vx, ball.vz) > 3) { P.chutou = true; P.tChute = P.t; }
  if (!P.chutou) return;
  const gk = G.possession && G.possession.role === 'GK';
  if (gk || Math.hypot(ball.vx, ball.vz) < 0.8 || P.t - P.tChute > 4) registrarCobranca(false);
}
function registrarCobranca(gol) {
  const P = G.pen;
  if (!P || P.fase !== 'cobrando') return;
  P.cob[P.vez].push(gol);
  P.fase = 'resultado'; P.t = 0;
  showToast(gol ? 'GOL de ' + nomeDe(P.cobrador) + '!' : nomeDe(P.cobrador) + ' perdeu!', (gol === (P.vez === 0)) ? 'good' : 'bad');
  if (gol) { crowd.comemorar(P.vez); Som.gol(); setTimeout(() => Som.fimGol(), 1600); } else Som.ohh();
  painelPenaltis();
}
// Acabou? (5 para cada com conta de "não alcança mais"; depois morte súbita por rodada.)
function penaltisDecididos() {
  const P = G.pen, [a, b] = P.cob, ga = a.filter(Boolean).length, gb = b.filter(Boolean).length;
  if (a.length <= 5 && b.length <= 5) {
    const restA = 5 - a.length, restB = 5 - b.length;
    if (ga + restA < gb || gb + restB < ga) return true;
    return a.length === 5 && b.length === 5 && ga !== gb;
  }
  return a.length === b.length && ga !== gb;
}
function decidirOuSeguir() {
  const P = G.pen;
  if (penaltisDecididos()) { encerrarPenaltis(); return; }
  P.vez = 1 - P.vez;
  proximaCobranca();
}
function encerrarPenaltis() {
  const P = G.pen;
  const ga = P.cob[0].filter(Boolean).length, gb = P.cob[1].filter(Boolean).length;
  G.penaltisPlacar = [ga, gb];
  for (const p of players) p.scripted = false;
  G.pen = null; G.sp = null;
  showBanner(PARTIDA.timesObj[ga > gb ? 0 : 1].sigla + ' VENCE NOS PÊNALTIS', ga > gb ? 0 : 1, 2.6);
  G.state = 'fimPen';
  setTimeout(() => { painelPenaltis(); endMatch(); }, G.pulando ? 0 : 2600);
}
// Pulando para o resultado: o resto da disputa é sorteado (75% de acerto).
function simularPenaltisRestantes() {
  const P = G.pen;
  if (!P) return;
  P.fase = 'cobrando';
  let guard = 0;
  while (!penaltisDecididos() && guard++ < 60) { P.cob[P.vez].push(Math.random() < 0.75); P.vez = 1 - P.vez; }
  encerrarPenaltis();
}
function cameraPenaltis() {
  const t = G.pen ? G.pen.vez : 0, side = t === 0 ? 1 : -1, x = side * (HALF_L - PEN_SPOT);
  return { px: x - side * 7.5, py: 2.4, pz: 1.5, tx: side * HALF_L, ty: 1.2, tz: 0 };
}

// ---------------------------------------------------------------------
// FIM DA PARTIDA → HISTÓRICO E RESULTADO PARA O MODO HISTÓRIA (4.1.0)
// window.FutebolJS.ultimoResultado e o evento 'futebolJs:fim' (detail = o mesmo objeto).
// ---------------------------------------------------------------------
function registrarResultado(motivo) {
  const P = PARTIDA, H = lerHistorico(), R = P.regras;
  const susp = [], les = [];
  // Quem estava fora cumpriu 1 jogo.
  [0, 1].forEach((t) => {
    for (const d of P.desfalques[t]) {
      const f = fichaDe(H, P.timesObj[t].id, d.nome);
      if (f.suspenso > 0) f.suspenso--;
      else if (f.lesao && f.lesao.jogos > 0) { f.lesao.jogos--; if (f.lesao.jogos <= 0) f.lesao = null; }
    }
  });
  for (const p of P.participantes) {
    const f = fichaDe(H, P.timesObj[p.team].id, p.ficha);
    const nome = p.isUser ? 'Você' : p.name;
    if (p.red) { f.suspenso += 1; susp.push({ team: p.team, nome, motivo: 'vermelho' }); }
    else if (p.yellow && R.cartoesAcumulam) {
      f.amarelos = (f.amarelos || 0) + 1;
      if (f.amarelos >= 3) { f.amarelos = 0; f.suspenso += 1; susp.push({ team: p.team, nome, motivo: '3 amarelos' }); }
    }
    if (p.lesao) {
      if (p.lesao.jogos > 0) f.lesao = { tipo: p.lesao.tipo, jogos: p.lesao.jogos };
      les.push({ team: p.team, nome, tipo: p.lesao.tipo, jogos: p.lesao.jogos });
    }
  }
  salvo.gravar('futebolJs.historico.v1', H);
  const a = agregado();
  const res = {
    times: P.timesObj.map((t) => t.id), placar: G.score.slice(), agregado: a, penaltis: G.penaltisPlacar || null,
    vencedor: G.penaltisPlacar ? (G.penaltisPlacar[0] > G.penaltisPlacar[1] ? 0 : 1) : (a ? (a[0] > a[1] ? 0 : a[1] > a[0] ? 1 : -1) : (G.score[0] > G.score[1] ? 0 : G.score[1] > G.score[0] ? 1 : -1)),
    competicao: P.competicao, motivo: motivo || 'fim', nota: Number(matchRating()), estatisticas: Object.assign({}, G.stats),
    suspensos: susp, lesoes: les, trocas: G.trocas.slice(), voceSaiu: !!G.espectador,
  };
  G.resultado = res;
  window.FutebolJS.ultimoResultado = res;
  try { window.dispatchEvent(new CustomEvent('futebolJs:fim', { detail: res })); } catch (e) { /* navegador antigo */ }
  return res;
}
function textoFichas(res) {
  const partes = [];
  const meus = (lst) => lst.filter((x) => x.team === 0);
  if (G.penaltisPlacar) partes.push('Pênaltis ' + G.penaltisPlacar[0] + 'x' + G.penaltisPlacar[1] + '.');
  for (const s of meus(res.suspensos)) partes.push(s.nome + ': suspenso no próximo jogo (' + s.motivo + ').');
  for (const l of meus(res.lesoes)) partes.push(l.nome + ': lesão ' + l.tipo + (l.jogos ? ' (' + l.jogos + ' jogo' + (l.jogos > 1 ? 's' : '') + ' fora)' : ' (joga sentindo)') + '.');
  if (res.trocas.length) partes.push('Substituições: ' + res.trocas.filter((t) => t.team === 0).map((t) => t.sai + ' → ' + t.entra).join(', ') + '.');
  return partes.join(' ');
}

// ---------------------------------------------------------------------
// TELA INICIAL: "Configurar partida" (para testar o sistema; o modo história vai chamar
// FutebolJS.novaPartida direto). A última escolha fica salva no aparelho.
// ---------------------------------------------------------------------
const COMPETICOES_TESTE = {
  amistoso: { tipo: 'amistoso', nome: 'Amistoso' },
  liga: { tipo: 'liga', nome: 'Liga Ataliba', rodada: 5 },
  copaIda: { tipo: 'copa', nome: 'Copa da Vila', fase: 'Semifinal', mataMata: true, jogo: 'ida' },
  copaVolta: { tipo: 'copa', nome: 'Copa da Vila', fase: 'Semifinal', mataMata: true, jogo: 'volta', placarIda: [1, 2] },
  final: { tipo: 'copa', nome: 'Copa da Vila', fase: 'Final', mataMata: true, jogo: 'unico' },
};
function montarTelaDeConfig() {
  const side = $('startBtn').parentNode;
  const box = document.createElement('details');
  box.id = 'cfgPartida';
  box.style.cssText = 'margin:4px 0 8px;font-size:12px';
  const opc = (obj, nome) => Object.entries(obj).map(([k, v]) => '<option value="' + k + '">' + (nome ? nome(v, k) : v.nome) + '</option>').join('');
  const lista = (pares) => pares.map(([k, n]) => '<option value="' + k + '">' + n + '</option>').join('');
  const campo = (id, rot, html) => '<label style="display:flex;flex-direction:column;gap:2px;font-size:10px;letter-spacing:.04em;color:var(--muted)">' + rot +
    '<select id="' + id + '" style="font:600 12px var(--font-body);background:var(--panel-solid);color:var(--chalk);border:1px solid var(--line);padding:4px">' + html + '</select></label>';
  box.innerHTML = '<summary style="cursor:pointer;font-weight:700;letter-spacing:.06em">CONFIGURAR PARTIDA</summary>' +
    '<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin-top:6px">' +
    campo('cfgTime0', 'SEU TIME', opc(TIMES)) + campo('cfgTime1', 'ADVERSÁRIO', opc(TIMES)) + campo('cfgCampo', 'CAMPO', opc(CAMPOS)) +
    campo('cfgDif', 'DIFICULDADE', opc(DIFICULDADES)) + campo('cfgComp', 'COMPETIÇÃO', lista([['amistoso', 'Amistoso'], ['liga', 'Liga · rodada 5'], ['copaIda', 'Copa · semi (ida)'], ['copaVolta', 'Copa · semi (volta, ida 1x2)'], ['final', 'Copa · final']])) +
    campo('cfgMando', 'MANDANTE', lista([['0', 'Seu time'], ['1', 'Adversário']])) +
    campo('cfgClima', 'CLIMA', opc(CLIMAS)) + campo('cfgGrama', 'GRAMADO', lista([['baixo', 'Baixo'], ['alto', 'Alto']])) +
    campo('cfgHora', 'HORÁRIO', lista([['dia', 'Dia'], ['tarde', 'Tarde'], ['noite', 'Noite']])) +
    campo('cfgPos', 'SUA POSIÇÃO', lista([['FWD', 'Atacante'], ['MID', 'Meia'], ['DEF', 'Zagueiro']])) +
    campo('cfgDur', 'DURAÇÃO', lista([['300', '5 min (padrão)'], ['180', '3 min (rápida)']])) +
    campo('cfgForm', 'FORMAÇÃO (SEU TIME)', '<option value="">Preferida do time</option>' + opc(FORMACOES)) +
    campo('cfgTat', 'TÁTICA (SEU TIME)', '<option value="">Preferida do time</option>' + opc(TATICAS)) +
    '</div>';
  side.insertBefore(box, $('startBtn'));
  const intro = side.querySelector('p:not(.eyebrow)');
  if (intro) intro.textContent = 'Você controla só o seu jogador (etiqueta laranja). Toque em OPÇÕES DA PARTIDA para ver e escolher tudo o que já dá para mudar (times, campo, clima, competição, tempo...).';
  const ult = salvo.ler('futebolJs.ultimaPartida.v1', null);
  const val = (id, v) => { if (v !== undefined && v !== null && $(id).querySelector('option[value="' + v + '"]')) $(id).value = v; };
  val('cfgTime0', 'azulao'); val('cfgTime1', 'ataliba'); val('cfgCampo', 'estadio'); val('cfgDif', 'normal'); val('cfgHora', 'noite');
  if (ult) for (const [id, v] of Object.entries(ult)) val(id, v);
  montarTelaDeSelecao(box);
}

// ---------------------------------------------------------------------
// TELA DE SELEÇÃO (4.1.1): mostra TUDO o que já dá para mudar numa partida, em botões grandes
// (bom para o dedo). Ela só escreve nos <select> escondidos de "CONFIGURAR PARTIDA", então
// lerTelaDeConfig() continua sendo o único lugar que monta a partida. O que ainda não existe
// aparece como "EM BREVE" (placeholder) para você ver o que está faltando.
// ---------------------------------------------------------------------
const SELECAO_GRUPOS = [
  { titulo: 'TIMES', itens: [['cfgTime0', 'Seu time'], ['cfgTime1', 'Adversário'], ['cfgMando', 'Mandante (torcida e uniforme)']] },
  { titulo: 'CAMPO E AMBIENTE', itens: [['cfgCampo', 'Campo'], ['cfgClima', 'Clima'], ['cfgHora', 'Horário'], ['cfgGrama', 'Gramado']] },
  { titulo: 'JOGO', itens: [['cfgComp', 'Competição'], ['cfgDur', 'Tempo de jogo'], ['cfgDif', 'Dificuldade']] },
  { titulo: 'VOCÊ E O TÉCNICO', itens: [['cfgPos', 'Sua posição'], ['cfgForm', 'Formação'], ['cfgTat', 'Tática (muda no pause também)']] },
];
const SELECAO_EM_BREVE = [
  ['Bola', ['Clássica', 'Várzea gasta', 'Noturna']],
  ['Uniforme', ['Automático ✓', 'Titular', 'Reserva']],
  ['Árbitro', ['Normal ✓', 'Rigoroso', 'Deixa jogar']],
  ['Torcida', ['Pela popularidade ✓', 'Vazio', 'Lotado']],
  ['Prorrogação', ['Direto aos pênaltis ✓', '2 x 1 min']],
  ['Seu personagem', ['Aparência', 'Nome', 'Número']],
  ['Modo história', ['Carreira', 'Tabela da liga', 'Chave da copa']],
];
function infoSelecao(id, v) {
  if (id === 'cfgTime0' || id === 'cfgTime1') { const T = TIMES[v]; return T ? 'Força ' + T.forca + ' · torcida ' + Math.round(T.popularidade * 100) + '% · ' + T.formacao + ' · ' + TATICAS[T.tatica].nome + ' · técnico ' + T.tecnico.nome : ''; }
  if (id === 'cfgCampo') {
    const C = CAMPOS[v]; if (!C) return '';
    const R = Object.assign({}, REGRAS_PADRAO, C.regras || {});
    return C.comprimento + ' x ' + C.largura + ' m · ' + C.jogadores + ' por time · ' + (R.impedimento ? 'com impedimento' : 'sem impedimento') + ' · ' + (R.substituicoes >= 99 ? 'trocas livres' : R.substituicoes + ' trocas');
  }
  if (id === 'cfgClima') return v === 'chuva' ? 'Bola corre mais e quica menos' : v === 'neve' ? 'Bola segura no gramado' : 'Normal';
  if (id === 'cfgGrama') return v === 'alto' ? 'Bola rola mais devagar' : 'Bola rola rápido';
  if (id === 'cfgDif') return 'Mexe só na IA. Você nunca piora: sempre dá para ganhar.';
  if (id === 'cfgTat') return v && TATICAS[v] ? '' : 'Usa a tática preferida do seu time';
  if (id === 'cfgForm') return v ? '' : 'Usa a formação preferida do seu time';
  return '';
}
function montarTelaDeSelecao(box) {
  const css = document.createElement('style');
  css.textContent = `
#selecao { position: fixed; inset: 0; z-index: 7; background: var(--night); overflow-y: auto; touch-action: pan-y; -webkit-overflow-scrolling: touch;
  padding: calc(10px + env(safe-area-inset-top, 0px)) max(16px, env(safe-area-inset-right, 0px)) calc(16px + env(safe-area-inset-bottom, 0px)) max(16px, env(safe-area-inset-left, 0px)); box-sizing: border-box; }
#selecao .selTopo { position: sticky; top: calc(-10px - env(safe-area-inset-top, 0px)); z-index: 1; display: flex; gap: 8px; align-items: center; flex-wrap: wrap;
  background: var(--night); padding: 6px 0 8px; border-bottom: 2px solid var(--line); margin-bottom: 8px; }
#selecao .selTit { font-family: var(--font-display); font-size: 16px; color: var(--flood); margin-right: auto; }
#selecao .selTopo button { padding: 8px 14px; font-size: 12px; }
#selecao .selGrade { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr)); gap: 10px; }
#selecao .selGrupo { background: var(--panel-solid); border: 2px solid var(--line); padding: 8px 10px; display: flex; flex-direction: column; gap: 8px; }
#selecao .selGrupo.breve { border-style: dashed; }
#selecao h3 { margin: 0; font-family: var(--font-display); font-size: 11px; letter-spacing: .08em; color: var(--chalk); font-weight: 400; }
#selecao .selItem > span { display: block; font-size: 11px; color: var(--muted); margin-bottom: 4px; letter-spacing: .03em; }
#selecao .chips { display: flex; flex-wrap: wrap; gap: 5px; }
#selecao .chip { background: transparent; border: 2px solid var(--line); padding: 6px 9px; font: 600 12px var(--font-body); display: inline-flex; align-items: center; gap: 6px; min-height: 34px; }
#selecao .chip.on { background: var(--flood); border-color: var(--flood); color: #fff; }
#selecao .chip i { width: 10px; height: 10px; display: inline-block; border: 1px solid rgba(0,0,0,.6); }
#selecao .chip:disabled { opacity: .45; cursor: default; }
#selecao .selInfo { font-size: 11px; color: var(--good); margin-top: 3px; min-height: 0; }
#selecao .selInfo:empty { display: none; }
#selecao .tagBreve { font-family: var(--font-display); font-size: 9px; background: var(--red); color: #fff; padding: 2px 5px; margin-left: 6px; }
#cfgResumo { font-size: 12px !important; color: var(--chalk) !important; border-left: 3px solid var(--flood); padding-left: 8px; }
`;
  document.head.appendChild(css);
  const tela = document.createElement('div');
  tela.id = 'selecao'; tela.hidden = true;
  $('raizJogo').appendChild(tela);
  const corDe = (id, v) => (id === 'cfgTime0' || id === 'cfgTime1') && TIMES[v] ? TIMES[v].uniforme.camisa : null;
  const desenhar = () => {
    let h = '<div class="selTopo"><span class="selTit">OPÇÕES DA PARTIDA</span>' +
      '<button class="ghost" data-acao="voltar">Voltar</button><button class="big" data-acao="jogar">Jogar ▶</button></div><div class="selGrade">';
    for (const G0 of SELECAO_GRUPOS) {
      h += '<div class="selGrupo"><h3>' + G0.titulo + '</h3>';
      for (const [id, rot] of G0.itens) {
        const sel = $(id); if (!sel) continue;
        h += '<div class="selItem"><span>' + rot.toUpperCase() + '</span><div class="chips">';
        for (const o of sel.options) {
          const cor = corDe(id, o.value);
          h += '<button class="chip' + (o.value === sel.value ? ' on' : '') + '" data-id="' + id + '" data-v="' + o.value + '">' + (cor ? '<i style="background:' + cor + '"></i>' : '') + o.textContent + '</button>';
        }
        h += '</div><div class="selInfo">' + infoSelecao(id, sel.value) + '</div></div>';
      }
      h += '</div>';
    }
    h += '<div class="selGrupo breve"><h3>AINDA NÃO FEITO <span class="tagBreve">EM BREVE</span></h3>';
    for (const [rot, ops] of SELECAO_EM_BREVE) {
      h += '<div class="selItem"><span>' + rot.toUpperCase() + '</span><div class="chips">' + ops.map((o) => '<button class="chip" disabled>' + o + '</button>').join('') + '</div></div>';
    }
    h += '</div></div>';
    const rolagem = tela.scrollTop;
    tela.innerHTML = h;
    tela.scrollTop = rolagem;
    if ($('cfgTime0').value === $('cfgTime1').value) {
      const info = tela.querySelector('[data-id="cfgTime1"]').closest('.selItem').querySelector('.selInfo');
      info.textContent = 'Mesmo time dos dois lados: o jogo escolhe outro adversário.'; info.style.color = 'var(--bad)';
    }
  };
  tela.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b || b.disabled) return;
    if (b.dataset.acao === 'voltar') { tela.hidden = true; atualizarResumoConfig(); return; }
    if (b.dataset.acao === 'jogar') { tela.hidden = true; atualizarResumoConfig(); $('startBtn').click(); return; }
    if (b.dataset.id) { $(b.dataset.id).value = b.dataset.v; Som.clique && Som.clique(); desenhar(); atualizarResumoConfig(); }
  });
  // Botão na tela inicial + resumo do que está escolhido. O painel antigo fica como "avançado".
  const abrir = document.createElement('button');
  abrir.className = 'ghost'; abrir.id = 'selBtn'; abrir.style.borderColor = 'var(--flood)'; abrir.textContent = 'Opções da partida ⚙';
  abrir.addEventListener('click', () => { desenhar(); tela.hidden = false; tela.scrollTop = 0; });
  const resumo = document.createElement('p'); resumo.id = 'cfgResumo';
  box.parentNode.insertBefore(resumo, box);
  box.parentNode.insertBefore(abrir, box);
  box.querySelector('summary').textContent = 'AVANÇADO (LISTAS)';
  box.addEventListener('change', atualizarResumoConfig);
  atualizarResumoConfig();
}
function atualizarResumoConfig() {
  const r = $('cfgResumo'); if (!r) return;
  const txt = (id) => { const s = $(id); return s && s.selectedOptions[0] ? s.selectedOptions[0].textContent : ''; };
  r.textContent = txt('cfgTime0') + ' x ' + txt('cfgTime1') + ' · ' + txt('cfgCampo') + ' · ' + txt('cfgComp') + ' · ' + txt('cfgClima') + ', ' + txt('cfgHora').toLowerCase() + ' · ' + txt('cfgDur') + ' · ' + txt('cfgDif');
}
function lerTelaDeConfig() {
  const v = (id) => $(id).value;
  const t0 = v('cfgTime0'); let t1 = v('cfgTime1');
  if (t1 === t0) t1 = Object.keys(TIMES).find((k) => k !== t0);
  salvo.gravar('futebolJs.ultimaPartida.v1', Object.fromEntries(['cfgTime0', 'cfgTime1', 'cfgCampo', 'cfgDif', 'cfgComp', 'cfgMando', 'cfgClima', 'cfgGrama', 'cfgHora', 'cfgPos', 'cfgDur', 'cfgForm', 'cfgTat'].map((id) => [id, v(id)])));
  return {
    times: [t0, t1], campo: v('cfgCampo'), dificuldade: v('cfgDif'), competicao: COMPETICOES_TESTE[v('cfgComp')],
    mandante: Number(v('cfgMando')), clima: v('cfgClima'), gramado: v('cfgGrama'), horario: v('cfgHora'),
    duracao: Number(v('cfgDur')) || DURACOES.padrao,
    usuario: { posicao: v('cfgPos') }, formacoes: [v('cfgForm') || null, null], taticas: [v('cfgTat') || null, null],
  };
}

// PAUSA: o técnico do seu time pode trocar a tática no meio do jogo.
function montarTelaDeTatica() {
  const set = document.querySelector('#pauseScreen .settings');
  const box = document.createElement('div');
  box.innerHTML = '<p class="sectionTitle">TÉCNICO E TÁTICA</p>' +
    '<p id="tecnicoInfo" style="font-size:12px;margin:0 0 4px"></p>' +
    '<div id="taticaBtns" style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px"></div>' +
    '<p id="taticaInfo" style="font-size:11px;color:var(--muted);margin:0 0 10px"></p>';
  set.insertBefore(box, set.firstChild);
}
function atualizarTelaDeTatica() {
  if (!PARTIDA || !$('taticaBtns')) return;
  $('tecnicoInfo').textContent = 'Técnico: ' + PARTIDA.tecnicos[0].nome + ' · Formação ' + PARTIDA.formacoes[0];
  const B = $('taticaBtns');
  B.innerHTML = '';
  for (const [k, T] of Object.entries(TATICAS)) {
    const b = document.createElement('button');
    b.textContent = T.nome; b.className = PARTIDA.taticas[0] === k ? 'big' : 'ghost';
    b.style.cssText = 'font-size:11px;padding:6px 8px;min-height:0';
    b.addEventListener('click', () => { G.taticaManual = true; trocarTatica(0, k); atualizarTelaDeTatica(); });
    B.appendChild(b);
  }
  atualizarInfoTatica();
}

// Resultado na competição (tela final).
function resultadoCompeticao() {
  const P = PARTIDA, C = P.competicao, [a, b] = G.score, nos = P.timesObj[0].nome, eles = P.timesObj[1].nome;
  if (!C || C.tipo === 'amistoso') return '';
  if (C.tipo === 'liga') return (C.nome || 'Liga') + ': ' + (a > b ? '+3 pontos' : a === b ? '+1 ponto' : '0 ponto') + (C.rodada ? ' na rodada ' + C.rodada : '');
  if (!C.mataMata) return '';
  if (C.jogo === 'ida') return 'Jogo de ida: ' + a + 'x' + b + '. A decisão fica para a volta.';
  const ag = agregado() || [a, b];
  let quem = ag[0] > ag[1] ? nos : ag[1] > ag[0] ? eles : null;
  if (!quem && G.penaltisPlacar) quem = G.penaltisPlacar[0] > G.penaltisPlacar[1] ? nos : eles;
  const txt = C.jogo === 'volta' ? 'Agregado ' + ag[0] + 'x' + ag[1] + '. ' : '';
  return txt + (quem ? quem + (G.penaltisPlacar ? ' vence nos pênaltis e' : '') + ' passa de fase' + (C.fase === 'Final' ? ' — é campeão!' : '!') : 'Empate.');
}

montarTelaDeConfig();
montarTelaDeTatica();

// ---------------------------------------------------------------------
// API PARA O MODO HISTÓRIA (e para testes no console do navegador)
//   FutebolJS.novaPartida({ times: ['azulao', 'leoes'], campo: 'varzea', clima: 'chuva', ... })
//   FutebolJS.cadastrarTime({ id: 'meuTime', nome: ..., uniforme: {...}, ... })
//   FutebolJS.salvarTecnico({ nome: 'Fulano', aparencia: { pele, cabelo, estilo, roupa } })
//   FutebolJS.trocarTatica(0, 'retranca')
// ---------------------------------------------------------------------
window.FutebolJS = {
  versao: '4.1.3',
  novaPartida(cfg) { montarPartida(cfg); resetMatch(); return PARTIDA; },
  partida: () => PARTIDA,
  cadastrarTime(t) { TIMES[t.id] = t; return t; },
  salvarTecnico(t) { salvo.gravar('futebolJs.tecnico.v1', t); return t; },
  trocarTatica: (team, chave) => { if (team === 0) G.taticaManual = true; trocarTatica(team, chave); },
  elencoDoTime: (id) => elencoDoTime(TIMES[id]),
  TIMES, CAMPOS, FORMACOES, TATICAS, DIFICULDADES, CLIMAS, HORARIOS, NOMES, DURACOES,
};

montarPartida(Object.assign({}, PARTIDA_PADRAO, lerTelaDeConfig()));
kickoff(0);
G.state = 'menu';
snapCamera();
drawRadar();
requestAnimationFrame(frame);
