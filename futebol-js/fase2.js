/* =====================================================================
   FUTEBOL JS · fase2.js · Fase 2 (arquivo SEPARADO do jogo.js)
   ---------------------------------------------------------------------
   Como funciona
     - O jogo.js NÃO traz este arquivo junto. Quando a Fase 1 termina, o jogo baixa o fase2.js do mesmo lugar de onde veio
       (GitHub → jsDelivr, ou a pasta local), roda e chama iniciar(ctx).
     - O carregador do Canva não muda: ele continua baixando só o jogo.js.
     - Suba o fase2.js no GitHub junto do jogo.js (mesma pasta futebol-js/) e atualize o versao.txt.

   O que a fase recebe em ctx
     ctx.historia   tudo o que está salvo da história: { fase1: {...}, fase2: {...} }  (cópia: mexer aqui não grava nada)
     ctx.personagem nome, apelido, nomeCamisa, numero, aparencia, pe, genero, voz...   (cópia)
     ctx.api        ferramentas do jogo: T, Tf, Tg, Tgf (textos nos 5 idiomas e no gênero do personagem), Dialogo, Escolha, Musica, Som,
                    Atributos, salvo, PERSONAGEM, esperar(ms) e api.historia (ler/gravar/tudo/limpar)
     ctx.raiz       elemento onde as telas da fase podem ser colocadas
   Como guardar o que a Fase 2 decidir
     ctx.api.historia.gravar('fase2', { ... })   → fica em futebolJs.historia.v1 sem apagar a fase1.
     ctx.api.historia.ler('fase1')               → o que a Fase 1 deixou.
   iniciar(ctx) devolve uma Promise que resolve quando a fase termina (o jogo então volta ao menu).
   nucleoMinimo = versão mais antiga do jogo.js em que esta fase funciona (se o jogo.js for mais velho, aparece "Em desenvolvimento...").

   VERSÃO DE PREPARAÇÃO (4.5.0): por enquanto a fase só MOSTRA o que a Fase 1 deixou salvo, numa tela de conferência.
   ===================================================================== */
(function () {
  'use strict';

  const esc = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const TXT_PERFIL = { bom: 'Disse que era bom em álgebra', ruim: 'Disse que era ruim em álgebra', nao: 'Disse que não conhecia álgebra' };
  const TXT_JOAO = { surpresa: 'Perguntou "Por quê?" (o João disse que era surpresa)', combinado: 'Respondeu "Beleza, combinado!"' };
  const TXT_LUCIA = { confiante: 'Disse que ia se sair bem', precisa: 'Disse que ia precisar de ajuda' };
  const TXT_TRACO = { talento: 'Talento natural', forca: 'Força de vontade' };
  const NOMES_ATRIB = { chute: 'Chute', passe: 'Passe', efeito: 'Efeito', velocidade: 'Velocidade', resistencia: 'Resistência', drible: 'Drible', dominio: 'Domínio' };

  function resultadoDaPartida(p) {
    if (!p) return null;
    const pl = Array.isArray(p.placar) ? p.placar[0] + ' x ' + p.placar[1] : String(p.placar);
    const quem = p.venceu ? 'vitória' : p.empate ? 'empate' : 'derrota';
    return pl + ' (' + quem + ')' + (p.expulso ? ' · foi expulso' : '') + ' · gols seus: ' + (p.gols == null ? '?' : p.gols) +
      ' · anúncios assistidos para jogar de novo: ' + (p.tentativas || 0);
  }

  // Linhas [rótulo, valor] do que a Fase 1 deixou salvo.
  function linhasDaFase1(f1, per) {
    const L = [];
    const nome = per && (per.apelido || per.nome);
    if (nome) L.push(['Personagem', nome + (per.nomeCamisa ? ' · camisa ' + per.nomeCamisa : '') + (per.numero ? ' nº ' + per.numero : '') + ' · pé ' + (per.pe === 'E' ? 'esquerdo' : 'direito') + ' · gênero ' + (per.genero === 'F' ? 'feminino' : 'masculino')]);
    if (!f1) { L.push(['Fase 1', 'nada salvo (a Fase 1 não foi jogada nesta história)']); return L; }
    L.push(['Aula de álgebra', (TXT_PERFIL[f1.perfil] || '—') + ' · acertou ' + (f1.acertos == null ? '?' : f1.acertos) + ' de 3']);
    L.push(['João', f1.joao ? (TXT_JOAO[f1.joao] || f1.joao) : 'não conversou antes do fim da aula']);
    L.push(['Lúcia', f1.lucia ? (TXT_LUCIA[f1.lucia] || f1.lucia) : 'não conversou']);
    L.push(['Cena da mariposa com a Lúcia', f1.mariposa ? 'aconteceu' : 'não aconteceu']);
    if (f1.cadu) L.push(['Cadu (o menino do armário)', 'foi salvo do armário' + (f1.cadu.conversou ? ' · conversou com ele (perguntou ' + (f1.cadu.pergunta === 'porque' ? '"Por que ele fez aquilo?"' : '"Você está bem?"') + ')' : ' · ainda não conversaram')]);
    L.push(['Primeira partida', resultadoDaPartida(f1.partida) || 'não chegou a jogar']);
    L.push(['Traço da história', f1.traco ? (TXT_TRACO[f1.traco] || f1.traco) : '—']);
    if (f1.atributos) L.push(['Atributos', Object.keys(f1.atributos).map((k) => (NOMES_ATRIB[k] || k) + ' ' + f1.atributos[k]).join(' · ')]);
    return L;
  }

  function montarTela(ctx) {
    const f1 = ctx.historia && ctx.historia.fase1;
    const linhas = linhasDaFase1(f1, ctx.personagem);
    const el = document.createElement('div');
    el.id = 'fase2Tela';
    el.style.cssText = 'position:fixed;inset:0;z-index:30;background:#000;color:#f2f2ee;overflow-y:auto;box-sizing:border-box;padding:14px 16px;font:14px/1.45 system-ui,sans-serif';
    el.innerHTML =
      '<div style="max-width:620px;margin:0 auto">' +
        '<p style="margin:4px 0 0;font:700 12px/1 var(--font-display,monospace);letter-spacing:.14em;color:#f7941d">FASE 2 · EM DESENVOLVIMENTO</p>' +
        '<h2 style="margin:6px 0 10px;font:700 clamp(17px,4.6vh,24px)/1.2 var(--font-display,monospace);letter-spacing:.06em;text-transform:uppercase">O que a Fase 1 deixou salvo</h2>' +
        '<dl style="margin:0">' + linhas.map((l) => '<dt style="margin-top:8px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#f0a020">' + esc(l[0]) + '</dt><dd style="margin:2px 0 0">' + esc(l[1]) + '</dd>').join('') + '</dl>' +
        '<details style="margin:14px 0 0"><summary style="cursor:pointer;color:#9fb4d8">Dados brutos (futebolJs.historia.v1)</summary>' +
          '<pre style="white-space:pre-wrap;word-break:break-word;font-size:11px;background:#0b1730;padding:8px;margin:6px 0 0">' + esc(JSON.stringify(ctx.historia, null, 2)) + '</pre></details>' +
        '<p style="margin:14px 0 0;font-size:12px;opacity:.65">Esta tela é só de conferência. A Fase 2 ainda vai ser desenvolvida neste arquivo (fase2.js).</p>' +
        '<div style="margin:14px 0 18px"><button type="button" class="pxBtn pxPrim" id="fase2Voltar" style="min-width:160px">Voltar ao menu</button></div>' +
      '</div>';
    return el;
  }

  async function iniciar(ctx) {
    const tela = montarTela(ctx);
    try {
      (ctx.raiz || document.body).appendChild(tela);
      await new Promise((fim) => {
        tela.querySelector('#fase2Voltar').addEventListener('click', () => { try { if (ctx.api.Som && ctx.api.Som.clique) ctx.api.Som.clique(); } catch (e) { /* sem som */ } fim(); });
      });
    } finally { tela.remove(); }                       // mesmo se algo falhar, a tela da fase não fica por cima do jogo
  }

  window.FutebolJS.registrarFase({ id: 'fase2', nome: 'Fase 2', nucleoMinimo: '4.5.0', iniciar });
})();
