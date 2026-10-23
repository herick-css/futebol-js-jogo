/* =====================================================================
   FUTEBOL JS · fase2.js · Fase 2 — "Dez anos depois" (arquivo SEPARADO do jogo.js)
   ---------------------------------------------------------------------
   Como funciona
     - O jogo.js NÃO traz este arquivo junto. Quando a Fase 1 termina, o jogo baixa o fase2.js do mesmo lugar de onde veio
       (GitHub → jsDelivr, ou a pasta local), roda e chama iniciar(ctx).
     - O carregador do Canva não muda: ele continua baixando só o jogo.js.
     - Suba o fase2.js no GitHub junto do jogo.js (mesma pasta futebol-js/) e atualize o versao.txt.
     - Como a Fase 1, este arquivo usa as variáveis internas do jogo.js (makeAthlete, Lote, scene, camera, GANCHO_RENDER, Dialogo,
       Escolha, Musica, Som, T/Tf/Tg, I18N, HistoriaSave...). Por isso nucleoMinimo exige a versão do jogo.js em que ele foi feito.

   O que a fase recebe em ctx
     ctx.historia   tudo o que está salvo da história: { fase1: {...}, fase2: {...} }  (cópia: mexer aqui não grava nada)
     ctx.personagem nome, apelido, nomeCamisa, numero, aparencia, pe, genero, voz...   (cópia)
     ctx.args       { retomar: 'inicio' | 'emprego' | 'escada' | 'fim' } quando a fase é aberta por um save (tela CARREGAR; o jogo.js 4.6.0 chama a fase)
     ctx.api        ferramentas do jogo: T, Tf, Tg, Tgf, Dialogo, Escolha, Musica, Som, Atributos, salvo, PERSONAGEM, esperar(ms) e api.historia
     ctx.raiz       elemento onde as telas da fase podem ser colocadas

   O QUE ESTA FASE FAZ (por enquanto)
     1. Continua a narração da Fase 1 (tela preta): "Mas... isso não é tudo..." e salva o jogo (história + espaço de save "CARREGAR").
     2. A tela de anos avança 10 anos (a mesma tela de "12 anos atrás": de {ano-12} até {ano-2}) e o personagem diz "Quando eu tinha 16...".
     3. O QUARTO do personagem (às escuras: ele acorda, liga a luz, usa o computador/guarda-roupa/banheiro) com cores e objetos
        de quarto masculino ou feminino (PERSONAGEM.genero). Dois pôsteres (imagens minúsculas embutidas em POSTER_A / POSTER_B).
     4. O guarda-roupa: 18 roupas masculinas e 21 femininas, cada uma com 4 cores: primária, secundária, detalhes e borda do emblema.
     5. O computador: navegador → site "LoggedOn" → 3 notificações de vaga → escolher UM emprego (Mercado, Cafeteria ou Pizzaria).
        Qualquer um dá pontos em "Tranquilo" (espectro Tranquilo ↔ Problemático). A escolha fica salva.
     6. A escada do prédio (4 lances, câmeras fixas que mudam) com o vizinho que fuma, até a porta da rua.
        Na porta da rua a fase passa o bastão para a CIDADEZINHA (cidade.js, arquivo separado; se ele não vier, fica o "Continua...").

   NOVIDADES DESTA RODADA (só o fase2.js; o espaço de save agora vem de F.slotHistoria(), que já está no jogo.js)
     - Escada: a câmera do saguão fica do lado de fora, olhando para dentro: a porta da rua (portão de grade) fica virada para a câmera e o
       andar da pessoa é na direção dela. Sumiu o chão do térreo "barrado" atrás do armário de medidores (o resto do vão é preto).
     - Guarda-roupa: 4ª cor (borda do emblema do peito); moletons, jaquetas e agasalhos caem POR CIMA da calça; 3 regatas masculinas,
       3 regatas e 3 tops femininos (no fim das listas: os ids salvos continuam valendo; saves antigos com 3 cores ganham a 4ª branca).
     - Chuveiro: banho estilo The Sims (corte seco, só pele, de costas para a câmera, tarja pixelada 2D (quadrado sempre virado para a câmera), água e vapor, o personagem se veste de novo).
     - Quarto: cobertor e travesseiros não atravessam mais a cama; skate no chão; quadro de campo de verdade (masculino); bola com física
       (bolaTick: andar e encostar faz rolar, bate nas paredes e nos móveis, não gruda no pé).

   O QUE FICA SALVO (FutebolJS.historia.ler('fase2'))
     { ponto, ano, idade, luz, roupa: { id, cores:[c1,c2,c3,c4] }, emprego: 'mercado'|'cafeteria'|'pizzaria'|null,
       tranquilo: número (positivo = Tranquilo, negativo = Problemático),
       vizinho: { pediuCigarro, mandouFumarFora, perguntouComer, sabeValdemar } }
     e um save no espaço da tela CARREGAR: { fase:'fase2', ponto, autosave:true, historia, personagem, versao }. Espaço usado: o que já
     tem autosave da fase 2; senão o primeiro vazio; senão o mais antigo. Salva no começo ('inicio'), ao escolher o emprego
     ('emprego') e ao chegar na escada ('escada'). Textos novos: tabela TRAD_F2 (en/es/it/fr), registrada no I18N ao carregar.
   ===================================================================== */
(function () {
  'use strict';

  const esc = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const esperar = (ms) => (typeof Cena !== 'undefined' ? Cena.esperar(ms) : new Promise((r) => setTimeout(r, ms)));   // (4.8.2) pulável (botão "Pular cena")
  const pulando = () => typeof Cena !== 'undefined' && Cena.pulando;
  const rad = Math.PI / 180;
  const OX = 2000;                       // onde as cenas ficam no mundo (longe do campo, da Fase 1 e do criador)
  const IDADE = 16, ANOS_ATRAS = 12, ANOS_FRENTE = 10;
  let UI = null, S = null, API = null;

  // ------------------------------------------------------------------ pôsteres (imagens minúsculas de propósito: baixa qualidade)
  const POSTER_A = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAkACQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwCdPC+noCFnm+U56qT0+lVr3RbOGNtkkz7sAjKj+lO/tGVlMSA+dg7TnrVRUmWJmnkLzA7hzj04/Q0mxrUdb6VbGaNYWkZS21vmGR+lbS6XZptDTspP97aP6VS0ue5aOSMxqTCdyHcBgkfj61Df6hPE6eYCzEZLY7Uaiuaq6XZuu7z2/Aj/AAorC/tSZsmJSV/KimFzVTS4Qqr5LKAevmcisFxfTXtyluP3cD/Mc9sn862/tMm7PyhAoYknnBJH9KqwXJjeYqjkSSZJ45/+tXKq1R/Z/EhS8jRt4hbf6RawmUSqNzFwevNMKW+os8M0QWSMYKg44pkFysUbwqDgDjjj8KY0oSUTAYYjaT3xVSqTi9i+WTXNbQf/AGTAoAEUgAHGJBRTTdMT96isPrcv5TP2y/lMGa5kYbc4HtT4LqVIGw546e1FFW27EX0Fgu55JQGlbHtVtpn6E5ooobfNY1o6z1AOT3ooorne5zz+Jn//2Q==';
  const POSTER_B = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAhACwDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDKi2pNgnAqeSzbcG7NTVjWWUZIXPU0/wAx92xmAA4yaRKTY+xiSR2EikbSeQR/Wq86He656GrkcflyBoztcruyBncPpUJhD85+Z+RmhKSbuU1oVZchBgVEJB3FWZlcMqkYNN8hT944NMgnC4VvUdMVBcTlz8gBLDjH8I71eZfnyp6LUTgLA5CgEg8D1pRdncpOwWszFAWPRStQGc+dGAoG1Rz681WR9sZIPO7irunqJpiQoLBQRntWstjV/C3/AF/WpdeJph5zIAfpVWSLLnIq7mcxmPHFV2YocFSx9ax9DEkX+lU7r/Vn6GiimtxrczD/AKlPrWvpP+s/4AKKK1fwmktjUX7r1UfrRRXOtzN7H//Z';

  // ------------------------------------------------------------------ guarda-roupa
  // t: bermuda | calca | short | saia | vestido | jardineira.  m: 1 = manga longa.  c: [primária, secundária, terciária]
  //   primária = blusa/vestido · secundária = calça, short, saia (ou a barra do vestido) · terciária = detalhes (barra, gola, meias)
  const PAL = ['#f2f2ee', '#1c1c1f', '#8c9199', '#c8352b', '#e8742a', '#f2c230', '#6cae3e', '#1f7a4d', '#3fb7b0', '#3a64b8', '#1f3a73', '#7a4fb0',
    '#d95fa0', '#f4a6c0', '#7a4a2a', '#d8c39a', '#4a6fa5', '#2a3f66', '#9bd1f0', '#a3162a', '#556b2f', '#ffb199', '#b9b6ae', '#5b5f66'];
  const ROUPAS = {
    M: [
      { n: 'Camiseta e bermuda', t: 'bermuda', c: ['#3a64b8', '#8c9199', '#f2f2ee'] },
      { n: 'Camiseta e calça jeans', t: 'calca', c: ['#f2f2ee', '#2a3f66', '#c8352b'] },
      { n: 'Moletom com capuz', t: 'calca', m: 1, capuz: 1, solta: 1, c: ['#7a7e86', '#1c1c1f', '#f2f2ee'] },
      { n: 'Polo e bermuda', t: 'bermuda', c: ['#1f7a4d', '#d8c39a', '#f2f2ee'] },
      { n: 'Camiseta de barra colorida', t: 'calca', c: ['#f2f2ee', '#4a6fa5', '#c8352b'] },
      { n: 'Jaqueta e calça', t: 'calca', m: 1, jaqueta: 1, solta: 1, c: ['#1c1c1f', '#2a3f66', '#f2c230'] },
      { n: 'Camisa social e calça', t: 'calca', m: 1, c: ['#9bd1f0', '#1f3a73', '#f2f2ee'] },
      { n: 'Camisa de time e short', t: 'short', time: 1, c: ['#c8352b', '#f2f2ee', '#1c1c1f'] },
      { n: 'Agasalho esportivo', t: 'calca', m: 1, solta: 1, c: ['#1f3a73', '#1f3a73', '#f2f2ee'] },
      { n: 'Camiseta e short curto', t: 'short', c: ['#e8742a', '#1c1c1f', '#f2f2ee'] },
      { n: 'Camiseta de manga longa', t: 'calca', m: 1, c: ['#556b2f', '#1c1c1f', '#d8c39a'] },
      { n: 'Moletom e bermuda', t: 'bermuda', m: 1, capuz: 1, solta: 1, c: ['#a3162a', '#8c9199', '#f2f2ee'] },
      { n: 'Camiseta e jeans escuro', t: 'calca', c: ['#7a4fb0', '#2a3f66', '#f2f2ee'] },
      { n: 'Camiseta larga e bermuda', t: 'bermuda', solta: 1, c: ['#f2c230', '#1c1c1f', '#1c1c1f'] },
      { n: 'Camisa social e bermuda', t: 'bermuda', c: ['#f2f2ee', '#7a4a2a', '#1f3a73'] },
      { n: 'Regata e bermuda', t: 'bermuda', regata: 1, c: ['#f2f2ee', '#2a3f66', '#c8352b'] },
      { n: 'Regata de time e short', t: 'short', time: 1, regata: 1, c: ['#3a64b8', '#f2f2ee', '#f2c230'] },
      { n: 'Regata e calça jeans', t: 'calca', regata: 1, c: ['#1c1c1f', '#4a6fa5', '#f2f2ee'] },
    ],
    F: [
      { n: 'Camiseta e short', t: 'short', c: ['#d95fa0', '#4a6fa5', '#f2f2ee'] },
      { n: 'Camiseta e calça jeans', t: 'calca', c: ['#f2f2ee', '#4a6fa5', '#d95fa0'] },
      { n: 'Vestido simples', t: 'vestido', c: ['#7a4fb0', '#f2f2ee', '#f2f2ee'] },
      { n: 'Saia e camiseta', t: 'saia', c: ['#f2f2ee', '#d95fa0', '#1c1c1f'] },
      { n: 'Moletom e legging', t: 'calca', m: 1, capuz: 1, solta: 1, c: ['#f4a6c0', '#1c1c1f', '#f2f2ee'] },
      { n: 'Vestido com barra', t: 'vestido', c: ['#3a64b8', '#f2f2ee', '#f2f2ee'] },
      { n: 'Jaqueta e saia', t: 'saia', m: 1, jaqueta: 1, solta: 1, c: ['#c8352b', '#1c1c1f', '#f2f2ee'] },
      { n: 'Blusa de manga longa e calça', t: 'calca', m: 1, c: ['#3fb7b0', '#2a3f66', '#f2f2ee'] },
      { n: 'Camisa social e saia', t: 'saia', c: ['#f2f2ee', '#1f3a73', '#3a64b8'] },
      { n: 'Polo e short', t: 'short', c: ['#6cae3e', '#f2f2ee', '#f2f2ee'] },
      { n: 'Jardineira', t: 'jardineira', c: ['#f2f2ee', '#4a6fa5', '#f2c230'] },
      { n: 'Vestido de manga longa', t: 'vestido', m: 1, c: ['#a3162a', '#1c1c1f', '#1c1c1f'] },
      { n: 'Agasalho esportivo', t: 'calca', m: 1, solta: 1, c: ['#7a4fb0', '#7a4fb0', '#f2f2ee'] },
      { n: 'Camiseta e bermuda', t: 'bermuda', c: ['#ffb199', '#d8c39a', '#f2f2ee'] },
      { n: 'Blusa e saia longa', t: 'saia', longa: 1, c: ['#f2c230', '#1f7a4d', '#f2f2ee'] },
      { n: 'Regata e short', t: 'short', regata: 1, c: ['#f2f2ee', '#4a6fa5', '#d95fa0'] },
      { n: 'Regata e calça jeans', t: 'calca', regata: 1, c: ['#d95fa0', '#4a6fa5', '#f2f2ee'] },
      { n: 'Regata e saia', t: 'saia', regata: 1, c: ['#3fb7b0', '#f2f2ee', '#1c1c1f'] },
      { n: 'Top e short', t: 'short', top: 1, c: ['#e8742a', '#2a3f66', '#f2f2ee'] },
      { n: 'Top e calça jeans', t: 'calca', top: 1, c: ['#f2f2ee', '#4a6fa5', '#d95fa0'] },
      { n: 'Top e saia', t: 'saia', top: 1, c: ['#7a4fb0', '#1c1c1f', '#f2f2ee'] },
    ],
  };
  const NU = { n: 'Nu', t: 'short', nu: 1, c: ['#000000', '#000000', '#000000', '#000000'] };          // só no banho (as cores viram a pele em vestirNu)
  const PIJAMA = { M: { n: 'Pijama', t: 'short', c: ['#6b7a99', '#6b7a99', '#6b7a99'] }, F: { n: 'Pijama', t: 'short', c: ['#e9a3c4', '#e9a3c4', '#e9a3c4'] } };

  const c4 = (c) => [c[0], c[1], c[2], c[3] || '#f2f2ee'];                  // (4.7.3) 4ª cor: a BORDA do emblema do peito (saves antigos, com 3 cores, ganham branco)
  const hexN = (h) => (typeof h === 'number' ? h : parseInt(String(h).slice(1), 16));
  const sombra = (h, k) => { const n = hexN(h); const r = Math.round(((n >> 16) & 255) * k), g = Math.round(((n >> 8) & 255) * k), b = Math.round((n & 255) * k); return (r << 16) | (g << 8) | b; };

  // opções do makeAthlete para uma roupa + as 3 cores
  function roupaOpts(R, c, pele) {
    const o = { camisa: c[0], calcao: c[1], listra: c[2], gola: c[2], meia: '#f2f2ee', sola: '#e6e6e0', manga: R.m ? 1 : 0, meiao: 1, numero: '', nomeCamisa: null, emblema: null };
    if (R.t === 'calca') { o.meia = c[1]; o.meiao = 1; }
    else if (R.t === 'bermuda') { o.meia = pele; o.meiao = 1; }
    else if (R.t === 'short') { o.meiao = 0; o.meia = '#f2f2ee'; }
    else if (R.t === 'saia') { o.meiao = 0; o.meia = '#f2f2ee'; }
    else if (R.t === 'vestido') { o.camisa = c[0]; o.calcao = c[0]; o.listra = c[1]; o.gola = c[2]; o.meiao = 0; }
    else if (R.t === 'jardineira') { o.meia = c[1]; o.meiao = 1; o.gola = c[0]; }
    if (R.nu) { o.camisa = o.calcao = o.listra = o.gola = o.meia = o.sola = pele; o.meiao = 0; o.manga = 0; }          // (4.7.3) banho: o corpo todo é só pele
    if (R.time) {
      o.meiao = 2; o.meia = c[2]; o.numero = '10'; o.nomeCamisa = (PERSONAGEM.nomeCamisa || '').toUpperCase();
      o.emblema = { forma: 'escudo', cor1: c[2], cor2: c[0], letras: 'FC' };
    }
    return o;
  }
  // (4.7.3) o emblema do peito é desenhado pelo jogo.js com borda sempre branca: aqui ele é repintado na textura da camisa com a 4ª cor
  function pintarEmblema(m, R, c) {
    let cv = null, tex = null;
    m.raiz.traverse((o) => { if (!cv && o.material && o.material.map && o.material.map.image && o.material.map.image.getContext && o.material.map.image.width === 128) { tex = o.material.map; cv = tex.image; } });
    if (!cv) return;
    const g = cv.getContext('2d'), css = (h) => (typeof h === 'number' ? '#' + h.toString(16).padStart(6, '0') : h), borda = css(c[3]);
    if (!R.time) {                                              // quadradinho do peito: borda (4ª cor) + miolo da cor de detalhe
      g.fillStyle = borda; g.fillRect(35, 6, 7, 8); g.fillStyle = css(c[2]); g.fillRect(36, 7, 5, 6);
    } else {                                                    // escudo do time: contorno com a 4ª cor
      g.fillStyle = css(c[0]); g.fillRect(34, 4, 10, 11);
      const escudo = (x, y, w, h, cor) => { g.fillStyle = cor; g.beginPath(); g.moveTo(x, y); g.lineTo(x + w, y); g.lineTo(x + w, y + h * 0.6); g.lineTo(x + w / 2, y + h); g.lineTo(x, y + h * 0.6); g.closePath(); g.fill(); };
      escudo(35, 5, 8, 9, borda); escudo(36, 6, 6, 7, css(c[2]));
      g.fillStyle = css(c[0]); g.fillRect(36, 9, 6, 1);
    }
    tex.needsUpdate = true;
  }
  // braços de regata/top: o ombro (primeira caixa de cada malha do braço) fica da cor da pele
  function pintarBracos(m, pele) {
    const n = hexN(pele), r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
    for (const br of [m.bracoE, m.bracoD]) for (const mesh of [br.inteira, br.ombro]) {
      const at = mesh && mesh.geometry && mesh.geometry.attributes.color; if (!at) continue;
      for (let i = 0; i < 24 && i < at.count; i++) at.setXYZ(i, r, g, b);
      at.needsUpdate = true;
    }
  }
  // as pernas de calça/bermuda: a coxa (primeira caixa de cada malha da perna) ganha a cor da calça
  function pintarCoxas(m, cor) {
    const n = hexN(cor), r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
    for (const pe of [m.pernaE, m.pernaD]) for (const mesh of [pe.inteira, pe.coxa]) {
      const at = mesh && mesh.geometry && mesh.geometry.attributes.color; if (!at) continue;
      for (let i = 0; i < 24 && i < at.count; i++) at.setXYZ(i, r, g, b);
      at.needsUpdate = true;
    }
  }
  // pernas inteiras da cor da pele (sem bota nem meia): o banho
  function pintarPernasTodas(m, pele) {
    const n = hexN(pele), r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
    for (const pe of [m.pernaE, m.pernaD]) {
      const meshes = [pe.inteira, pe.coxa]; pe.traverse((o) => { if (o.isMesh && meshes.indexOf(o) < 0) meshes.push(o); });
      for (const mesh of meshes) { const at = mesh && mesh.geometry && mesh.geometry.attributes.color; if (!at) continue; for (let i = 0; i < at.count; i++) at.setXYZ(i, r, g, b); at.needsUpdate = true; }
    }
  }
  // peças extras coladas no corpo (saia, capuz, jaqueta, jardineira)
  function extrasRoupa(m, R, c, pele) {
    const L = new Lote(); let tem = false;
    const F = (w, h, d, cor, x, y, z) => { L.caixa(w, h, d, hexN(cor), x, y, z); tem = true; };
    if (R.t === 'saia' || R.t === 'vestido') {
      const cs = R.t === 'vestido' ? c[0] : c[1];
      F(0.46, 0.16, 0.7, cs, 0, 0.83, 0); F(0.5, 0.14, 0.74, cs, 0, 0.68, 0);
      if (R.t === 'vestido' && R.m === undefined) F(0.52, 0.06, 0.76, c[1], 0, 0.6, 0);
      if (R.longa) { F(0.54, 0.2, 0.78, cs, 0, 0.5, 0); F(0.56, 0.22, 0.8, cs, 0, 0.3, 0); }
      else if (R.t === 'vestido') F(0.54, 0.12, 0.78, c[0], 0, 0.54, 0);
    }
    if (R.solta) {                                              // (4.7.3) a barra da blusa/moletom cai POR CIMA da calça (antes o tronco acabava na cintura e a calça "subia" por dentro)
      F(0.37, 0.22, 0.63, c[0], 0, 0.72, 0); F(0.38, 0.05, 0.64, sombra(c[0], 0.88), 0, 0.615, 0);
      if (R.capuz) F(0.03, 0.13, 0.34, sombra(c[0], 0.9), 0.185, 0.9, 0);          // bolso canguru
    }
    if (R.regata || R.top) { F(0.327, 0.1, 0.24, pele, 0, 1.27, 0); }              // decote fundo (frente e costas); os braços ficam de fora
    if (R.top) F(0.327, 0.27, 0.587, pele, 0, 0.875, 0);                           // top curto: a barriga aparece
    if (R.capuz) { F(0.2, 0.3, 0.5, sombra(c[0], 0.85), -0.2, 1.42, 0); F(0.04, 0.16, 0.42, sombra(c[0], 0.82), 0.17, 0.86, 0); }
    if (R.jaqueta) { F(0.06, 0.12, 0.5, c[2], 0.165, 1.32, 0); F(0.03, 0.56, 0.04, c[2], 0.168, 1.03, 0); }
    if (R.t === 'jardineira') { F(0.04, 0.36, 0.44, c[1], 0.17, 1.0, 0); F(0.04, 0.3, 0.07, c[1], 0.17, 1.28, 0.15); F(0.04, 0.3, 0.07, c[1], 0.17, 1.28, -0.15); }
    if (tem) m.corpo.add(L.malha(MAT_CORES));
  }

  // ------------------------------------------------------------------ interface
  function montarUI() {
    if (UI) return UI;
    const css = document.createElement('style');
    css.id = 'f2Css';
    css.textContent = `
#f2Preto { position: fixed; inset: 0; z-index: 20; background: #000; opacity: 1; transition: opacity 0.9s ease; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 18px; color: #fff; text-align: center; padding: 0 20px; box-sizing: border-box; --mx-ink: #2a1206; --mx-creme: #fff0c8; }
#f2Preto[hidden] { display: none; }
#f2Preto.claro { opacity: 0; pointer-events: none; }
#f2Preto .f2Num { margin: 0; font: 700 clamp(56px, 24vh, 130px)/1 var(--font-display); letter-spacing: 0.06em; color: #fff; font-variant-numeric: tabular-nums; display: none; }
#f2Preto .f2Num.on { display: block; }
#f2Preto .f2Leg { margin: 0; font: 700 clamp(15px, 4.6vh, 26px)/1.35 var(--font-display); letter-spacing: 0.12em; text-transform: uppercase; opacity: 0; transition: opacity 0.8s ease; }
#f2Preto .f2Leg.on { opacity: 1; }
#f2Preto .pxBtn { width: min(320px, 90%); --p: var(--p3, 3px); height: 46px; white-space: nowrap; font-size: 14px; }
#f2Missao { position: fixed; z-index: 9; left: max(10px, env(safe-area-inset-left, 0px)); top: calc(8px + env(safe-area-inset-top, 0px)); max-width: min(46vw, 420px); box-sizing: border-box; --p: var(--p2, 2px); padding: 3px 8px;
  border: solid transparent; border-width: calc(var(--p) * 4); border-image: var(--sp-madeira) 4 fill / calc(var(--p) * 4) stretch; image-rendering: pixelated;
  font: 700 12px/1.25 var(--font-display); letter-spacing: 0.04em; color: #fff0c8; text-shadow: 0 2px 0 #2a1206; }
#f2Missao[hidden], #f2Ctl[hidden], #f2Pc[hidden], #f2Roupa[hidden], #f2Aviso[hidden], #f2Toast[hidden] { display: none; }
#f2Ctl { position: fixed; inset: 0; z-index: 9; pointer-events: none; --mx-ink: #2a1206; --mx-creme: #fff0c8; }
#f2Ctl .f2Pad { position: absolute; left: max(18px, env(safe-area-inset-left, 0px)); bottom: calc(18px + env(safe-area-inset-bottom, 0px)); width: 112px; height: 112px; border-radius: 50%; pointer-events: auto; touch-action: none;
  background: rgba(21, 13, 6, 0.38); border: 4px solid rgba(255, 240, 200, 0.55); box-sizing: border-box; }
#f2Ctl .f2Knob { position: absolute; left: 50%; top: 50%; width: 46px; height: 46px; margin: -23px 0 0 -23px; border-radius: 50%; background: #f0a020; border: 4px solid #2a1206; box-sizing: border-box; }
#f2Ctl .f2Dica { position: absolute; right: max(18px, env(safe-area-inset-right, 0px)); bottom: calc(86px + env(safe-area-inset-bottom, 0px)); max-width: 46vw; text-align: right; font: 700 13px/1.2 var(--font-display); letter-spacing: 0.04em;
  color: #fff0c8; text-shadow: 0 2px 0 #2a1206, 0 0 6px #000; min-height: 16px; }
#f2Ctl .f2Btn { position: absolute; right: max(18px, env(safe-area-inset-right, 0px)); bottom: calc(18px + env(safe-area-inset-bottom, 0px)); width: 128px; pointer-events: auto; --p: var(--p3, 3px); height: 52px; font-size: 14px; }
#f2Ctl .f2Btn:disabled { opacity: 0.45; }
#f2Aviso { position: fixed; z-index: 10; left: 50%; bottom: calc(24% + env(safe-area-inset-bottom, 0px)); transform: translateX(-50%); padding: 6px 14px; font: 700 14px/1.2 var(--font-display); letter-spacing: 0.06em; color: #fff0c8;
  background: rgba(42, 18, 6, 0.86); border: 3px solid #f0a020; pointer-events: none; text-align: center; }
#f2Toast { position: fixed; z-index: 22; left: 50%; top: 20%; transform: translateX(-50%); padding: 10px 18px; text-align: center; background: rgba(42, 18, 6, 0.92); border: 3px solid #f0a020; color: #fff0c8;
  font: 700 15px/1.3 var(--font-display); letter-spacing: 0.08em; text-transform: uppercase; opacity: 0; transition: opacity 0.6s ease; pointer-events: none; }
#f2Toast.on { opacity: 1; }
#f2Toast b { color: #f0a020; font-size: 19px; display: block; }
/* ---- guarda-roupa ---- */
#f2Roupa { position: fixed; z-index: 12; top: 0; right: 0; bottom: 0; width: min(46vw, 400px); box-sizing: border-box; padding: calc(8px + env(safe-area-inset-top, 0px)) max(8px, env(safe-area-inset-right, 0px)) calc(8px + env(safe-area-inset-bottom, 0px)) 8px;
  display: flex; flex-direction: column; gap: 6px; --mx-ink: #2a1206; --mx-creme: #fff0c8; color: #fff0c8; background: linear-gradient(90deg, rgba(10,6,3,0), rgba(10,6,3,0.82) 14%); }
#f2Roupa .rTit { margin: 0 0 0 14px; font: 700 15px/1.2 var(--font-display); letter-spacing: 0.1em; text-transform: uppercase; text-shadow: 0 2px 0 #2a1206; }
#f2Roupa .rCorpo { flex: 1 1 auto; min-height: 0; overflow-y: auto; margin-left: 14px; padding-right: 4px; }
#f2Roupa .rGrade { display: grid; grid-template-columns: repeat(2, 1fr); gap: 5px; }
#f2Roupa .pxBtn { --p: var(--p2, 2px); height: auto; min-height: 38px; font-size: 11px; line-height: 1.15; padding: 3px 4px; white-space: normal; }
#f2Roupa .pxBtn.on { border-image-source: var(--sp-laranja); color: #fff; }
#f2Roupa .rSec { margin: 10px 0 4px; font: 700 12px/1.2 var(--font-display); letter-spacing: 0.08em; text-transform: uppercase; color: #f0a020; }
#f2Roupa .rSec small { font-weight: 400; opacity: 0.8; text-transform: none; letter-spacing: 0; }
#f2Roupa .rCores { display: grid; grid-template-columns: repeat(12, 1fr); gap: 3px; }
#f2Roupa .rAbas { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin-left: 14px; }
#f2Roupa .rCor { aspect-ratio: 1; border: 2px solid #2a1206; padding: 0; cursor: pointer; box-sizing: border-box; }
#f2Roupa .rCor.on { border-color: #fff0c8; outline: 2px solid #f0a020; }
#f2Roupa .rFim { margin-left: 14px; }
/* ---- computador ---- */
#f2Pc { position: fixed; inset: 0; z-index: 13; display: grid; place-items: center; background: rgba(6, 4, 2, 0.72); padding: 8px; box-sizing: border-box; --mx-ink: #2a1206; --mx-creme: #fff0c8; font-family: system-ui, sans-serif; }
#f2Pc .pcMonitor { position: relative; width: min(900px, 100%); height: min(560px, 100%); box-sizing: border-box; background: #1b1d22; border: 10px solid #34373f; border-bottom-width: 16px; border-radius: 8px; display: flex; flex-direction: column; overflow: hidden; }
#f2Pc .pcTela { position: relative; flex: 1 1 auto; min-height: 0; overflow: hidden; background: linear-gradient(160deg, #1a4a7a, #0d2a4a 55%, #14395c); color: #1c1c1f; }
#f2Pc .pcBarra { flex: 0 0 auto; height: 26px; display: flex; align-items: center; gap: 8px; padding: 0 8px; background: #20242c; color: #dfe6f2; font-size: 12px; }
#f2Pc .pcBarra .pcHora { margin-left: auto; }
#f2Pc .pcSair { position: absolute; z-index: 2; right: 6px; top: 6px; border: 0; background: rgba(0,0,0,0.55); color: #fff; font: 700 12px/1 system-ui; padding: 6px 10px; cursor: pointer; border-radius: 4px; }
#f2Pc .pcIcones { position: absolute; left: 14px; top: 14px; display: grid; gap: 14px; grid-template-columns: 78px; }
#f2Pc .pcIcone { background: none; border: 0; color: #fff; text-align: center; font: 600 12px/1.2 system-ui; cursor: pointer; padding: 4px; border-radius: 4px; }
#f2Pc .pcIcone:hover, #f2Pc .pcIcone:focus-visible { background: rgba(255,255,255,0.18); outline: none; }
#f2Pc .pcIcone span { display: block; font-size: 34px; line-height: 1.1; }
#f2Pc .pcJanela { position: absolute; inset: 22px 22px 8px 22px; background: #fff; border-radius: 6px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 6px 24px rgba(0,0,0,0.5); }
#f2Pc .pcAbas { flex: 0 0 auto; display: flex; align-items: center; gap: 6px; background: #dfe3ea; padding: 5px 8px 0; font-size: 12px; }
#f2Pc .pcAba { background: #fff; padding: 5px 12px; border-radius: 6px 6px 0 0; max-width: 40%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
#f2Pc .pcUrl { flex: 0 0 auto; display: flex; gap: 6px; align-items: center; background: #fff; padding: 6px 8px; border-bottom: 1px solid #d5d9e0; }
#f2Pc .pcUrl div { flex: 1; background: #eef1f5; border-radius: 12px; padding: 5px 12px; font-size: 13px; color: #444; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
#f2Pc .pcPag { flex: 1 1 auto; min-height: 0; overflow-y: auto; background: #f3f2ef; }
#f2Pc .pcBusca { padding: 22px 16px; text-align: center; }
#f2Pc .pcBusca h3 { margin: 0 0 12px; font-size: 26px; color: #3a64b8; letter-spacing: 0.04em; }
#f2Pc .pcCampo { max-width: 420px; margin: 0 auto 16px; background: #fff; border: 1px solid #ccd; border-radius: 20px; padding: 8px 14px; text-align: left; color: #777; font-size: 14px; }
#f2Pc .pcFavs { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
#f2Pc .pcFav { background: #fff; border: 1px solid #ccd; border-radius: 8px; padding: 10px 14px; font-size: 13px; cursor: pointer; min-width: 110px; }
#f2Pc .pcFav:hover, #f2Pc .pcFav:focus-visible { border-color: #3a64b8; outline: none; }
#f2Pc .pcMsg { margin: 14px 0 0; font-size: 13px; color: #8a5a00; min-height: 18px; }
#f2Pc .loTopo { display: flex; align-items: center; gap: 10px; background: #fff; padding: 8px 14px; border-bottom: 1px solid #d5d9e0; position: sticky; top: 0; z-index: 1; }
#f2Pc .loLogo { display: flex; align-items: center; font: 800 20px/1 system-ui; color: #26478f; letter-spacing: -0.02em; }
#f2Pc .loLogo i { font-style: normal; background: #3a64b8; color: #fff; border-radius: 4px; padding: 2px 5px; margin-left: 3px; }
#f2Pc .loBusca { flex: 1; background: #eaf0f6; border-radius: 4px; padding: 6px 10px; font-size: 12px; color: #667; }
#f2Pc .loSino { position: relative; background: none; border: 0; font-size: 22px; cursor: pointer; padding: 2px 6px; }
#f2Pc .loSino b { position: absolute; right: -2px; top: -4px; background: #d11a2a; color: #fff; font: 700 11px/1 system-ui; border-radius: 10px; padding: 3px 6px; }
#f2Pc .loSino.pulsa b { animation: f2Pulsa 1s infinite; }
@keyframes f2Pulsa { 50% { transform: scale(1.3); } }
#f2Pc .loCorpo { padding: 14px; max-width: 640px; margin: 0 auto; }
#f2Pc .loCard { background: #fff; border: 1px solid #d5d9e0; border-radius: 8px; padding: 12px 14px; margin-bottom: 10px; }
#f2Pc .loCard h4 { margin: 0 0 4px; font-size: 16px; color: #1c1c1f; }
#f2Pc .loCard p { margin: 0 0 6px; font-size: 13px; color: #555; }
#f2Pc .loCard small { color: #777; }
#f2Pc .loVaga { display: flex; gap: 12px; align-items: center; cursor: pointer; width: 100%; text-align: left; font: inherit; }
#f2Pc .loVaga:hover, #f2Pc .loVaga:focus-visible { border-color: #3a64b8; outline: none; }
#f2Pc .loIco { flex: 0 0 auto; font-size: 34px; width: 54px; height: 54px; display: grid; place-items: center; background: #eaf0f6; border-radius: 8px; }
#f2Pc .loBtn { background: #3a64b8; color: #fff; border: 0; border-radius: 20px; padding: 9px 20px; font: 700 14px/1 system-ui; cursor: pointer; }
#f2Pc .loBtn.sec { background: #fff; color: #3a64b8; border: 1px solid #3a64b8; }
#f2Pc .loBtns { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 8px; }
#f2Pc .pcCarrega { display: grid; place-items: center; height: 100%; color: #667; font-size: 14px; }
#f2Pc .pcCarrega::before { content: ''; width: 34px; height: 34px; border: 4px solid #ccd; border-top-color: #3a64b8; border-radius: 50%; animation: f2Gira 0.8s linear infinite; margin-bottom: 40px; position: absolute; }
@keyframes f2Gira { to { transform: rotate(360deg); } }
body.f2Ativo #dialogo, body.f2Ativo #escolha { z-index: 21; }`;
    document.head.appendChild(css);
    const raiz = $('raizJogo') || document.body;
    const preto = document.createElement('div'); preto.id = 'f2Preto'; preto.hidden = true; preto.innerHTML = '<p class="f2Num"></p><p class="f2Leg"></p>';
    const missao = document.createElement('div'); missao.id = 'f2Missao'; missao.hidden = true;
    const ctl = document.createElement('div'); ctl.id = 'f2Ctl'; ctl.hidden = true;
    ctl.innerHTML = '<div class="f2Pad" aria-label="Mover"><div class="f2Knob"></div></div><div class="f2Dica"></div><button type="button" class="pxBtn pxPrim f2Btn"></button>';
    const aviso = document.createElement('div'); aviso.id = 'f2Aviso'; aviso.hidden = true;
    const toast = document.createElement('div'); toast.id = 'f2Toast'; toast.hidden = true;
    const pc = document.createElement('div'); pc.id = 'f2Pc'; pc.hidden = true;
    const roupa = document.createElement('div'); roupa.id = 'f2Roupa'; roupa.hidden = true;
    raiz.append(preto, missao, ctl, aviso, toast, pc, roupa);
    UI = { preto, num: preto.querySelector('.f2Num'), leg: preto.querySelector('.f2Leg'), missao, ctl, pad: ctl.querySelector('.f2Pad'), knob: ctl.querySelector('.f2Knob'), dica: ctl.querySelector('.f2Dica'), btn: ctl.querySelector('.f2Btn'), aviso, toast, pc, roupa, css };
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
    return UI;
  }
  const preto = async (ligado, ms) => {
    UI.preto.hidden = false; UI.preto.style.transitionDuration = pulando() ? '0s' : ((ms == null ? 900 : ms) / 1000) + 's'; await esperar(30);
    UI.preto.classList.toggle('claro', !ligado); await esperar(ms == null ? 900 : ms); if (!ligado) UI.preto.hidden = true;
  };
  const legenda = async (txt, ms) => { UI.leg.textContent = txt; UI.leg.classList.add('on'); await esperar(ms || 2600); UI.leg.classList.remove('on'); await esperar(850); };
  const aviso = (txt) => { if (!txt) { UI.aviso.hidden = true; return; } UI.aviso.textContent = txt; UI.aviso.hidden = false; };
  async function toast(html, ms) { UI.toast.innerHTML = html; UI.toast.hidden = false; await esperar(30); UI.toast.classList.add('on'); await esperar(ms || 2600); UI.toast.classList.remove('on'); await esperar(650); UI.toast.hidden = true; }
  const missao = (txt) => { UI.missao.textContent = txt || ''; UI.missao.hidden = !txt; };

  // ------------------------------------------------------------------ sons (sintetizados, como o resto do jogo)
  const audio = () => { const A = typeof Som !== 'undefined' && Som.audio; return A && !Som.mudo ? A : null; };
  let _ruido = null;
  function bufRuido(ctx) { if (_ruido && _ruido.sampleRate === ctx.sampleRate) return _ruido; const b = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; _ruido = b; return b; }
  function somClique() {
    const A = audio(); if (!A) return; const { ctx, mestre } = A, t0 = ctx.currentTime;
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'square'; o.frequency.setValueAtTime(1500, t0); o.frequency.exponentialRampToValueAtTime(600, t0 + 0.04);
    g.gain.setValueAtTime(0.12, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.06); o.connect(g); g.connect(mestre); o.start(t0); o.stop(t0 + 0.08);
  }
  function somRonco() {                                          // barriga roncando: grave que oscila e desce
    const A = audio(); if (!A) return; const { ctx, mestre } = A;
    for (const [d, dur, f0] of [[0, 1.1, 95], [1.35, 0.8, 80]]) {
      const t0 = ctx.currentTime + 0.05 + d;
      const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter(), lfo = ctx.createOscillator(), lg = ctx.createGain();
      o.type = 'sawtooth'; o2.type = 'square';
      o.frequency.setValueAtTime(f0, t0); o.frequency.exponentialRampToValueAtTime(f0 * 0.55, t0 + dur); o2.frequency.setValueAtTime(f0 * 1.5, t0); o2.frequency.exponentialRampToValueAtTime(f0 * 0.8, t0 + dur);
      f.type = 'lowpass'; f.frequency.setValueAtTime(260, t0); f.frequency.exponentialRampToValueAtTime(140, t0 + dur); f.Q.value = 6;
      lfo.frequency.value = 17; lg.gain.value = 0.5; lfo.connect(lg); lg.connect(g.gain);
      g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(0.5, t0 + 0.12); g.gain.linearRampToValueAtTime(0.35, t0 + dur * 0.6); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(f); o2.connect(f); f.connect(g); g.connect(mestre);
      o.start(t0); o2.start(t0); lfo.start(t0); o.stop(t0 + dur + 0.1); o2.stop(t0 + dur + 0.1); lfo.stop(t0 + dur + 0.1);
    }
  }
  function somAgua(dur, graveInicio) {                           // descarga (grave que sobe) ou torneira (chiado agudo)
    const A = audio(); if (!A) return; const { ctx, mestre } = A, t0 = ctx.currentTime + 0.02;
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = bufRuido(ctx); s.loop = true;
    f.type = graveInicio ? 'lowpass' : 'highpass';
    if (graveInicio) { f.frequency.setValueAtTime(500, t0); f.frequency.linearRampToValueAtTime(1800, t0 + dur * 0.4); f.frequency.linearRampToValueAtTime(400, t0 + dur); } else f.frequency.value = 2600;
    g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(graveInicio ? 0.45 : 0.16, t0 + 0.15); g.gain.setValueAtTime(graveInicio ? 0.4 : 0.16, t0 + dur - 0.3); g.gain.linearRampToValueAtTime(0.0001, t0 + dur);
    s.connect(f); f.connect(g); g.connect(mestre); s.start(t0); s.stop(t0 + dur + 0.1);
  }
  function somPorta(bate) {
    const A = audio(); if (!A) return; const { ctx, mestre } = A, t0 = ctx.currentTime;
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(bate ? 150 : 110, t0); o.frequency.exponentialRampToValueAtTime(50, t0 + 0.18);
    g.gain.setValueAtTime(bate ? 0.6 : 0.3, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.22); o.connect(g); g.connect(mestre); o.start(t0); o.stop(t0 + 0.25);
    if (bate) { const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g2 = ctx.createGain(); s.buffer = bufRuido(ctx); f.type = 'lowpass'; f.frequency.value = 900; g2.gain.setValueAtTime(0.35, t0); g2.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.12); s.connect(f); f.connect(g2); g2.connect(mestre); s.start(t0); s.stop(t0 + 0.15); }
  }

  // ------------------------------------------------------------------ texturas
  const texMadeira = (c1, c2) => drawTexture(32, 32, (g, w, h) => { g.fillStyle = c1; g.fillRect(0, 0, w, h); g.fillStyle = c2; for (let y = 0; y < h; y += 8) { g.fillRect(0, y, w, 1); g.fillRect((y * 5 + 3) % w, y, 1, 8); } g.fillStyle = 'rgba(255,255,255,0.07)'; for (let i = 0; i < 14; i++) g.fillRect((i * 13) % w, (i * 7) % h, 3, 1); });
  const texParedeQuarto = (cor, rodape) => drawTexture(32, 64, (g, w, h) => {
    g.fillStyle = cor; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,0.06)'; for (let i = 0; i < 30; i++) g.fillRect((i * 29) % w, (i * 11) % 50, 2, 1);
    g.fillStyle = rodape; g.fillRect(0, 56, w, 8); g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(0, 55, w, 1);
  });
  const texParedeBanheiro = () => drawTexture(32, 64, (g, w, h) => {
    g.fillStyle = '#cfe6ee'; g.fillRect(0, 0, w, h); g.fillStyle = '#b4d2dc'; for (let x = 0; x < w; x += 8) g.fillRect(x, 0, 1, 40); for (let y = 0; y < 40; y += 8) g.fillRect(0, y, w, 1);
    g.fillStyle = '#e8f4f8'; g.fillRect(0, 40, w, 24); g.fillStyle = '#7fa9b8'; g.fillRect(0, 40, w, 2); g.fillStyle = '#b4d2dc'; for (let y = 48; y < 64; y += 8) g.fillRect(0, y, w, 1);
  });
  const texParedeEscada = () => drawTexture(32, 32, (g, w, h) => {                       // período de 1,4 m (um lance): faixa escura embaixo (rodapé) e parede clara em cima
    g.fillStyle = '#e6d9b0'; g.fillRect(0, 0, w, h); g.fillStyle = '#d9caa0'; for (let i = 0; i < 20; i++) g.fillRect((i * 29) % w, (i * 11) % 20, 2, 1);
    g.fillStyle = '#7d8c86'; g.fillRect(0, 22, w, 10); g.fillStyle = '#5f6c67'; g.fillRect(0, 22, w, 1);
  });
  const texPortaRua = () => drawTexture(34, 43, (g, w, h) => {       // portão de ferro azul com grade: os vãos entre as barras ficam TRANSPARENTES (dá para ver o saguão por trás)
    g.clearRect(0, 0, w, h);
    g.fillStyle = '#243a57'; g.fillRect(0, 0, w, 3); g.fillRect(0, 0, 3, h); g.fillRect(w - 3, 0, 3, h); g.fillRect(0, h - 3, w, 3);       // moldura
    g.fillStyle = '#2f4f74'; for (let x = 5; x < w - 4; x += 4) g.fillRect(x, 3, 2, h - 6);                                                  // barras
    g.fillStyle = '#1c2d46'; g.fillRect(0, 14, w, 3); g.fillRect(0, 27, w, 3);                                                               // travessas
    g.fillStyle = '#aab5c2'; g.fillRect(w - 8, 21, 3, 3);                                                                                    // fechadura
  });
  const texPlaca = (txt, fundo, cor) => drawTexture(48, 24, (g, w, h) => { g.fillStyle = fundo; g.fillRect(0, 0, w, h); g.fillStyle = cor; g.fillRect(0, 0, w, 2); g.fillRect(0, h - 2, w, 2); g.fillStyle = cor; g.font = 'bold 15px monospace'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, w / 2, h / 2 + 1); });
  const texCampo = () => drawTexture(48, 32, (g, w, h) => {       // (4.7.3) pôster: campo de futebol visto de cima (listras no gramado, linhas brancas, áreas, círculo central, gols)
    for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? '#3f8f3a' : '#4aa043'; g.fillRect(0, Math.floor(i * h / 6), w, Math.ceil(h / 6)); }
    g.strokeStyle = '#f4f4ee'; g.lineWidth = 1; g.fillStyle = '#f4f4ee';
    g.strokeRect(2.5, 2.5, w - 5, h - 5);                                   // linhas laterais e de fundo
    g.beginPath(); g.moveTo(w / 2, 2.5); g.lineTo(w / 2, h - 2.5); g.stroke(); // meio de campo
    g.beginPath(); g.arc(w / 2, h / 2, 5, 0, Math.PI * 2); g.stroke();      // círculo central
    g.fillRect(Math.round(w / 2) - 1, Math.round(h / 2) - 1, 2, 2);
    g.strokeRect(2.5, h / 2 - 8.5, 8, 17); g.strokeRect(w - 10.5, h / 2 - 8.5, 8, 17);            // grandes áreas
    g.strokeRect(2.5, h / 2 - 4.5, 3, 9); g.strokeRect(w - 5.5, h / 2 - 4.5, 3, 9);               // pequenas áreas
    g.fillRect(8, Math.round(h / 2), 1, 1); g.fillRect(w - 9, Math.round(h / 2), 1, 1);           // marcas do pênalti
    g.fillStyle = '#e8e8e0'; g.fillRect(0, Math.floor(h / 2) - 2, 2, 4); g.fillRect(w - 2, Math.floor(h / 2) - 2, 2, 4);   // traves dos gols
  });
  const texBolaF = () => drawTexture(32, 16, (g, w, h) => { g.fillStyle = '#f4f4f0'; g.fillRect(0, 0, w, h); g.fillStyle = '#1c1c1f'; for (const [x, y] of [[4, 4], [14, 3], [24, 5], [9, 11], [20, 11], [29, 11]]) g.fillRect(x, y, 4, 4); });
  function texDaImagem(url) {                                    // pôster: imagem minúscula, sem suavizar (pixels grandes de propósito)
    const img = new Image(), tx = new THREE.Texture(img); tx.magFilter = tx.minFilter = THREE.NearestFilter; tx.generateMipmaps = false;
    img.onload = () => { tx.needsUpdate = true; }; img.src = url; return tx;
  }

  // ------------------------------------------------------------------ personagens
  const ci = (n) => Math.max(0, ESTILOS_CABELO.findIndex((c) => new RegExp(n, 'i').test(c.nome)));
  const bi = (n) => Math.max(0, ESTILOS_BARBA.findIndex((c) => new RegExp(n, 'i').test(c.nome)));
  function criar(grupo, d, esc) {
    const o = Object.assign({ camisa: '#F2F2EE', listra: '#F2F2EE', gola: '#F2F2EE', calcao: 0x2a4f9a, meia: '#F2F2EE', sola: '#d9d9d9', corTexto: '#F2F2EE', numero: '', nome: ' ', fundoNome: 'rgba(0,0,0,0)',
      barba: 0, manga: 0, meiao: 1, labio: 3, cabecao: 1.08, escala: 0.9 }, d);
    const m = makeAthlete(o);
    m.etiqueta.visible = false; m.sombra.visible = false;
    grupo.add(m.raiz);
    const A = { m, opt: o, x: 0, y: 0, z: 0, yaw: Math.PI / 2, yawAlvo: Math.PI / 2, rota: null, rotaRes: null, vel: 1.9, fase: 0, fala: false, pose: 'pe', assento: 0.46, oculto: false, extra: 0, seguir: true };
    const blob = new THREE.Mesh(new THREE.CircleGeometry(0.3 * (o.escala / 0.9), 12), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.34, depthWrite: false }));
    blob.rotation.x = -Math.PI / 2; grupo.add(blob); A.blob = blob;
    S.elenco.push(A);
    return A;
  }
  function descartarAtor(A) {
    ATLETAS.delete(A.m); if (A.m.raiz.parent) A.m.raiz.parent.remove(A.m.raiz); if (A.blob && A.blob.parent) A.blob.parent.remove(A.blob);
    A.m.raiz.traverse((o) => { if (o.geometry && o.geometry !== SHADOW_GEO) o.geometry.dispose(); if (o.material && o.material !== SHADOW_MAT && o.material !== MAT_CORES) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); } });
  }
  // aparência do jogador (a que ele criou) com 16 anos: proporção de adolescente, sem barba
  function aparenciaJogador() {
    const ap = PERSONAGEM.aparencia || {};
    return { pele: ap.pele || '#946042', cabelo: ap.cabelo || '#1C140F', estilo: ap.estilo | 0, rosto: ap.rosto | 0, labio: ap.labio == null ? 3 : ap.labio, corBarba: ap.cabelo || '#1C140F', barba: 0, cabecao: 1.08, escala: 0.9 };
  }
  // troca a roupa (refaz o modelo, como o vestir() da Fase 1) — R: roupa, c: 3 cores
  function vestirRoupa(A, R, c) {
    const velho = A.m, pai = velho.raiz.parent;
    const base = A.base || A.opt; c = c4(c);
    const opt = Object.assign({}, base, roupaOpts(R, c, base.pele));
    const m = makeAthlete(opt);
    m.etiqueta.visible = false; m.sombra.visible = false;
    if (R.t === 'calca' || R.t === 'bermuda' || R.t === 'jardineira') pintarCoxas(m, c[1]);
    if (R.nu) pintarPernasTodas(m, base.pele);
    if (R.regata || R.top) pintarBracos(m, base.pele);
    extrasRoupa(m, R, c, base.pele);
    pintarEmblema(m, R, c);
    if (pai) { pai.add(m.raiz); pai.remove(velho.raiz); }
    velho.raiz.traverse((o) => { if (o.geometry && o.geometry !== SHADOW_GEO) o.geometry.dispose(); if (o.material && o.material !== SHADOW_MAT && o.material !== MAT_CORES) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); } });
    ATLETAS.delete(velho);
    A.m = m; A.opt = opt; A.base = base; A.mats = null; A.roupaAtual = { R, c: c.slice() };
    if (A.cigarro) { A.cigarro = null; fazCigarro(A); }
  }
  // (cidade.js) o personagem com a roupa salva no guarda-roupa, sem ator nem cena: a cidadezinha usa isto (Fases.carregar('fase2').modeloJogador)
  function vestirModelo(base, R, c) {
    const opt = Object.assign({ corTexto: '#F2F2EE', numero: '', nome: ' ', fundoNome: 'rgba(0,0,0,0)', barba: 0, manga: 0, meiao: 1, labio: 3, cabecao: 1.08, escala: 0.9 }, base, roupaOpts(R, c, base.pele)), m = makeAthlete(opt);
    m.etiqueta.visible = false; m.sombra.visible = false;
    if (R.t === 'calca' || R.t === 'bermuda' || R.t === 'jardineira') pintarCoxas(m, c[1]);
    if (R.regata || R.top) pintarBracos(m, base.pele);
    extrasRoupa(m, R, c, base.pele); pintarEmblema(m, R, c);
    return { m, opt };
  }
  function modeloJogador(d) {
    const fem = PERSONAGEM.genero === 'F', lista = ROUPAS[fem ? 'F' : 'M'], pij = PIJAMA[fem ? 'F' : 'M'];
    const rs = d && d.roupa, R = rs && rs.id >= 0 && lista[rs.id] ? lista[rs.id] : (lista[0] || pij), c = c4(rs && rs.cores ? rs.cores : R.c);
    return vestirModelo(aparenciaJogador(), R, c);
  }
  // (cidade.js) as pessoas da cidade: adultas (corpo e cabeça normais), com as mesmas roupas do guarda-roupa (menos as de time, que levam o nome do jogador)
  function modeloPessoa(o) {
    const lista = ROUPAS[o.fem ? 'F' : 'M'].filter((R) => !R.time), R = lista[(o.roupa | 0) % lista.length], c = c4(o.cores || R.c);
    const ap = o.ap || {}, base = { pele: ap.pele, cabelo: ap.cabelo, estilo: ap.estilo | 0, rosto: ap.rosto | 0, labio: ap.labio == null ? 3 : ap.labio, corBarba: ap.corBarba || ap.cabelo, barba: o.fem ? 0 : ap.barba | 0, cabecao: o.cabecao || 1, escala: o.escala || 1 };
    return vestirModelo(base, R, c);
  }
  function fazCigarro(A) {
    const L = new Lote(); L.caixa(0.16, 0.028, 0.028, 0xf2f2ee, 0.1, 0, 0); L.caixa(0.03, 0.03, 0.03, 0xe8742a, 0.2, 0, 0);
    const mesh = L.malha(MAT_CORES); mesh.position.set(0.02, -0.62, 0.0); mesh.rotation.z = 0.2; A.m.bracoD.add(mesh); A.cigarro = mesh;
  }

  // poses (as mesmas ideias da Fase 1, com a altura do chão A.y)
  function posePe(A, t, dt, andando) {
    const m = A.m, r = m.raiz, e = Math.min(1, dt * 10);
    usarJoelhos(m, 0, 0); usarCotovelo(m.bracoE, 0, 0); usarCotovelo(m.bracoD, 0, 0); r.rotation.z = 0; r.rotation.x = 0; m.corpo.rotation.z = 0;
    if (andando) {
      A.fase += dt * A.vel * 4.6; const s = Math.sin(A.fase);
      m.pernaE.rotation.z = s * 0.75; m.pernaD.rotation.z = -s * 0.75; m.bracoE.rotation.z = -s * 0.6; m.bracoD.rotation.z = s * 0.6;
      r.position.y = A.y + Math.abs(Math.cos(A.fase)) * 0.025;
    } else {
      m.pernaE.rotation.z = lerp(m.pernaE.rotation.z, 0, e); m.pernaD.rotation.z = lerp(m.pernaD.rotation.z, 0, e);
      m.bracoE.rotation.z = lerp(m.bracoE.rotation.z, A.fala ? Math.sin(t * 5) * 0.35 + 0.4 : 0, e); m.bracoD.rotation.z = lerp(m.bracoD.rotation.z, A.fala ? Math.sin(t * 5 + 2) * 0.35 + 0.4 : 0, e);
      r.position.y = A.y;
    }
    m.bracoE.rotation.x = m.bracoD.rotation.x = 0;
  }
  function poseSentado(A, t, dt, digita) {
    const m = A.m, r = m.raiz, e = Math.min(1, dt * 12), es = A.opt.escala || 1;
    usarCotovelo(m.bracoE, 0, 0); usarCotovelo(m.bracoD, 0, 0); r.rotation.z = 0; r.rotation.x = 0; m.corpo.rotation.z = 0;
    r.position.y = A.y + A.assento - 0.67 * es; m.pernaE.rotation.z = m.pernaD.rotation.z = 1.5; usarJoelhos(m, -1.5, -1.5);
    m.bracoE.rotation.z = lerp(m.bracoE.rotation.z, digita ? 1.25 : 0.5, e); m.bracoD.rotation.z = lerp(m.bracoD.rotation.z, digita ? 1.25 + Math.sin(t * 9) * 0.06 : 0.5, e);
    m.bracoE.rotation.x = m.bracoD.rotation.x = 0;
  }
  function poseDeitado(A) {                                      // de costas, cabeça no travesseiro (x/z = onde ficam os pés)
    const m = A.m, r = m.raiz, es = A.opt.escala || 1;
    usarJoelhos(m, 0, 0); usarCotovelo(m.bracoE, 0, 0); usarCotovelo(m.bracoD, 0, 0);
    m.pernaE.rotation.z = m.pernaD.rotation.z = 0; m.bracoE.rotation.z = m.bracoD.rotation.z = 0.05; m.bracoE.rotation.x = -0.12; m.bracoD.rotation.x = 0.12; m.corpo.rotation.z = 0;
    r.rotation.z = Math.PI / 2; r.rotation.x = 0; r.position.y = A.y + 0.2 * es;
  }
  function poseLava(A, t, dt) {                                  // mãos juntas na pia, esfregando
    const m = A.m, r = m.raiz; usarJoelhos(m, 0, 0); usarCotovelo(m.bracoE, 0, 0); usarCotovelo(m.bracoD, 0, 0); r.rotation.z = 0; r.rotation.x = 0; m.corpo.rotation.z = 0; r.position.y = A.y;
    m.pernaE.rotation.z = m.pernaD.rotation.z = 0;
    const f = Math.sin(t * 11) * 0.12;
    m.bracoE.rotation.z = 0.85 + f; m.bracoD.rotation.z = 0.85 - f; m.bracoE.rotation.x = -0.28; m.bracoD.rotation.x = 0.28;
  }
  function poseBanho(A, t, dt) {                                 // de costas para a câmera, as duas mãos esfregando o cabelo debaixo do chuveiro
    const m = A.m, r = m.raiz, e = Math.min(1, dt * 10); usarJoelhos(m, 0, 0); usarCotovelo(m.bracoE, 0, 0); usarCotovelo(m.bracoD, 0, 0); r.rotation.z = 0; r.rotation.x = 0; m.corpo.rotation.z = 0; r.position.y = A.y;
    m.pernaE.rotation.z = m.pernaD.rotation.z = 0;
    const f = Math.sin(t * 8.5), g = Math.cos(t * 8.5);
    m.bracoE.rotation.z = lerp(m.bracoE.rotation.z, 2.5 + f * 0.14, e); m.bracoD.rotation.z = lerp(m.bracoD.rotation.z, 2.5 - f * 0.14, e);
    m.bracoE.rotation.x = lerp(m.bracoE.rotation.x, 0.2 + g * 0.08, e); m.bracoD.rotation.x = lerp(m.bracoD.rotation.x, -0.2 + g * 0.08, e);
    m.corpo.rotation.y = Math.sin(t * 4.2) * 0.05;
  }
  function poseLiga(A, t, dt) {                                  // estica o braço direito até o interruptor
    const m = A.m, r = m.raiz, e = Math.min(1, dt * 14); usarJoelhos(m, 0, 0); usarCotovelo(m.bracoE, 0, 0); usarCotovelo(m.bracoD, 0, 0); r.rotation.z = 0; r.rotation.x = 0; m.corpo.rotation.z = 0; r.position.y = A.y;
    m.pernaE.rotation.z = lerp(m.pernaE.rotation.z, 0, e); m.pernaD.rotation.z = lerp(m.pernaD.rotation.z, 0, e);
    m.bracoD.rotation.z = lerp(m.bracoD.rotation.z, 2.1, e); m.bracoE.rotation.z = lerp(m.bracoE.rotation.z, 0, e); m.bracoD.rotation.x = 0; m.bracoE.rotation.x = 0;
  }
  function poseFuma(A, t, dt) {                                  // encostado, de braços soltos; de tempos em tempos leva o cigarro à boca
    const m = A.m, r = m.raiz, e = Math.min(1, dt * 8); usarJoelhos(m, 0, 0); r.rotation.z = 0; r.rotation.x = 0; m.corpo.rotation.z = 0; r.position.y = A.y;
    m.pernaE.rotation.z = lerp(m.pernaE.rotation.z, 0.08, e); m.pernaD.rotation.z = lerp(m.pernaD.rotation.z, -0.05, e);
    const ciclo = (t * 0.28 + A.fase) % 1, puxa = ciclo > 0.55 && ciclo < 0.8, k = puxa ? 1 : 0; A.puxando = puxa;
    usarCotovelo(m.bracoD, 0, k ? 2.1 : 0.25);
    m.bracoD.rotation.z = lerp(m.bracoD.rotation.z, k ? 0.8 : 0.3, e); m.bracoD.rotation.x = 0;
    m.bracoE.rotation.z = lerp(m.bracoE.rotation.z, 0.15, e); m.bracoE.rotation.x = 0; usarCotovelo(m.bracoE, 0, 0);
    m.corpo.rotation.z = lerp(m.corpo.rotation.z, k ? -0.05 : 0.02, e);
  }
  function tickAtor(A, t, dt) {
    const m = A.m, r = m.raiz, es = A.opt.escala || 1;
    let mov = false;
    if (A.rota && A.rota.length) {
      const p = A.rota[0], dx = p.x - A.x, dz = p.z - A.z, d = Math.hypot(dx, dz), st = A.vel * dt;
      if (d <= st) { A.x = p.x; A.z = p.z; A.rota.shift(); if (!A.rota.length) { A.rota = null; const rr = A.rotaRes; A.rotaRes = null; if (rr) rr(); } }
      else { A.x += dx / d * st; A.z += dz / d * st; A.yawAlvo = Math.atan2(-dz, dx); mov = true; }
    }
    if (A === S.jog && A.livreAndando) mov = true;
    const dy = ((A.yawAlvo - A.yaw + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI; A.yaw += dy * Math.min(1, dt * 10);
    if (A.seguir && S.altura) { const ty = S.altura(A.x, A.z, A); A.y = A.ySnap ? ty : A.y + (ty - A.y) * Math.min(1, dt * 22); A.ySnap = false; }
    if (mov) posePe(A, t, dt, true);
    else if (A.pose === 'sentado') poseSentado(A, t, dt, A.digita);
    else if (A.pose === 'deitado') poseDeitado(A);
    else if (A.pose === 'lava') poseLava(A, t, dt);
    else if (A.pose === 'liga') poseLiga(A, t, dt);
    else if (A.pose === 'banho') poseBanho(A, t, dt);
    else if (A.pose === 'fuma') poseFuma(A, t, dt);
    else posePe(A, t, dt, false);
    r.position.x = A.x; r.position.z = A.z; r.rotation.y = A.yaw;
    r.visible = !A.oculto;
    if (A.blob) { A.blob.visible = !A.oculto && A.pose !== 'deitado'; A.blob.position.set(A.x, A.y + 0.03, A.z); }
  }

  // ------------------------------------------------------------------ cenários (tudo montado longe do campo; fora das paredes é preto sólido)
  function planoParede(g, mat, w, h, ry, px, cy, pz, tw, th) {          // plano virado para DENTRO (visto de fora ele some: a câmera pode ficar atrás da parede)
    const geo = new THREE.PlaneGeometry(w, h), uv = geo.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / tw, uv.getY(i) * h / th + (cy - h / 2) / th);
    const m = new THREE.Mesh(geo, mat); m.rotation.y = ry; m.position.set(px, cy, pz); g.add(m); return m;
  }
  const chaoPreto = (g) => { const c = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshBasicMaterial({ color: 0x000000 })); c.rotation.x = -Math.PI / 2; c.position.y = -0.04; g.add(c); };
  const dentro = (x, z, r, R) => x > r[0] - R && x < r[1] + R && z > r[2] - R && z < r[3] + R;
  function fazSeta() {
    const La = new Lote(); La.caixa(0.18, 0.18, 0.18, 0xffd92b, 0, 0.3, 0); La.caixa(0.34, 0.12, 0.34, 0xffd92b, 0, 0.12, 0); La.caixa(0.1, 0.12, 0.1, 0xffd92b, 0, 0.0, 0);
    return La.malha(new THREE.MeshBasicMaterial({ vertexColors: true }));
  }

  // ----- O QUARTO (8 x 5,6 m). Câmera fixa de frente, sem a parede da frente. Cores e objetos mudam com o gênero.
  const Q = { W: 8, D: 5.6, ALT: 2.8 };
  const Q_CAM = [0.2, 4.7, 7.3, 0, 0.55, -0.45];
  Q.cama = { cx: -3.05, x0: -3.8, x1: -2.3, z0: -2.8, z1: -0.7 };
  Q.guarda = { cx: -0.5, x0: -1.4, x1: 0.4, z0: -2.8, z1: -2.2, spot: [-0.5, -1.5] };
  Q.mesa = { cx: 2.4, x0: 1.45, x1: 3.35, z0: -2.8, z1: -2.0, cadeira: [2.4, -1.5] };
  Q.luz = { x: 1.05, spot: [1.05, -2.3] };
  Q.pBanheiro = { z: 0.2, spot: [3.35, 0.2] };
  Q.pSaida = { z: 1.5, spot: [-3.35, 1.5] };
  const Q_RETS = [[Q.cama.x0, Q.cama.x1, Q.cama.z0, Q.cama.z1], [Q.guarda.x0, Q.guarda.x1, Q.guarda.z0, Q.guarda.z1 + 0.05], [Q.mesa.x0, Q.mesa.x1, Q.mesa.z0, Q.mesa.z1 + 0.15], [3.15, 3.55, -2.7, -2.1],
    [3.3, 3.8, 2.15, 2.65], [-3.8, -3.3, 2.15, 2.65]];   // (4.9.x) os dois vasos de planta perto da porta agora têm corpo (o jogador e a bola batem neles)
  function montarQuarto(fem) {
    const g = new THREE.Group(); g.position.set(OX, 0, 0);
    const mats = S.matsQuarto = [];
    const basic = (p) => { const m = new THREE.MeshBasicMaterial(p); m.userData.c0 = m.color.clone(); mats.push(m); return m; };
    const brilho = (cor) => new THREE.MeshBasicMaterial({ color: cor });               // não escurece com o quarto (tela do PC, luzinhas)
    const P = fem
      ? { parede: '#e7b3cf', rodape: '#b9759a', piso1: '#d9b98c', piso2: '#c8a679', tapete: 0xf6e4ee, tapete2: 0xe9a3c4, madeira: 0xf2ede8, lencol: 0xf7d6e6, coberta: 0xb78bd6, trav: 0xffffff, armario: 0xf2e6ee, puxador: 0xc88aa8, mesa: 0xf2ede8, cadeira: 0xb78bd6 }
      : { parede: '#86a6cc', rodape: '#4a5f82', piso1: '#b98a58', piso2: '#a3774a', tapete: 0x2f4a7a, tapete2: 0x3e5f98, madeira: 0x6b4a2c, lencol: 0x9bb5d8, coberta: 0x2f4a7a, trav: 0xf2f2ee, armario: 0x7a5430, puxador: 0xd8d8d0, mesa: 0xa9784a, cadeira: 0x3a3f4a };
    const tw = texParedeQuarto(P.parede, P.rodape); tw.wrapS = tw.wrapT = THREE.RepeatWrapping;
    const mp = basic({ map: tw });
    const { W, D, ALT } = Q;
    planoParede(g, mp, W, ALT, 0, 0, ALT / 2, -D / 2, 2.5, ALT);                         // fundo
    planoParede(g, mp, D, ALT, Math.PI / 2, -W / 2, ALT / 2, 0, 2.5, ALT);               // esquerda
    planoParede(g, mp, D, ALT, -Math.PI / 2, W / 2, ALT / 2, 0, 2.5, ALT);               // direita
    const pf = texMadeira(P.piso1, P.piso2); pf.wrapS = pf.wrapT = THREE.RepeatWrapping; pf.repeat.set(W / 1.5, D / 1.5);
    const piso = new THREE.Mesh(new THREE.PlaneGeometry(W, D), basic({ map: pf })); piso.rotation.x = -Math.PI / 2; g.add(piso);
    chaoPreto(g);
    const tap = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 2.2), basic({ color: P.tapete })); tap.rotation.x = -Math.PI / 2; tap.position.set(0.3, 0.012, 0.5); g.add(tap);
    const tap2 = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 1.6), basic({ color: P.tapete2 })); tap2.rotation.x = -Math.PI / 2; tap2.position.set(0.3, 0.014, 0.5); g.add(tap2);
    const L = new Lote(), F = (w, h, d, c, x, y, z) => L.caixa(w, h, d, c, x, y, z);
    // cama (cabeceira na parede do fundo)
    const cb = Q.cama;
    F(1.56, 0.26, 2.1, P.madeira, cb.cx, 0.17, -1.75); F(1.5, 0.22, 2.0, P.lencol, cb.cx, 0.42, -1.75); F(1.64, 0.95, 0.08, P.madeira, cb.cx, 0.72, -2.76); F(1.64, 0.4, 0.08, P.madeira, cb.cx, 0.33, -0.7);
    F(0.5, 0.12, 0.36, P.trav, cb.cx - 0.35, 0.59, -2.45); F(0.5, 0.12, 0.36, P.trav, cb.cx + 0.3, 0.59, -2.45);   // (4.7.3) dois travesseiros lado a lado (antes um entrava no outro)
    F(1.54, 0.42, 0.8, P.coberta, cb.cx, 0.72, -1.16); F(1.56, 0.1, 0.3, sombra(P.coberta === 0x2f4a7a ? '#5f7fb8' : '#d9b8ee', 1), cb.cx, 0.9, -1.6);   // (4.7.3) o cobertor termina antes do pé da cama (antes passava por dentro dele)
    // guarda-roupa
    const gr = Q.guarda;
    F(1.8, 2.2, 0.6, P.armario, gr.cx, 1.1, -2.5); F(0.03, 2.1, 0.02, sombra(P.armario, 0.7), gr.cx, 1.1, -2.19); F(0.03, 2.12, 0.02, sombra(P.armario, 0.7), gr.cx - 0.45, 1.1, -2.19); F(0.03, 2.12, 0.02, sombra(P.armario, 0.7), gr.cx + 0.45, 1.1, -2.19);
    F(0.05, 0.3, 0.05, P.puxador, gr.cx - 0.08, 1.1, -2.17); F(0.05, 0.3, 0.05, P.puxador, gr.cx + 0.08, 1.1, -2.17);
    // mesa, cadeira e computador (a tela é de fora)
    const ms = Q.mesa;
    F(1.9, 0.06, 0.8, P.mesa, ms.cx, 0.74, -2.4); for (const sx of [-0.88, 0.88]) F(0.06, 0.72, 0.7, sombra(P.mesa, 0.8), ms.cx + sx, 0.36, -2.4);
    F(0.7, 0.42, 0.05, 0x1c1c1f, ms.cx, 1.12, -2.62); F(0.1, 0.2, 0.1, 0x1c1c1f, ms.cx, 0.87, -2.62); F(0.34, 0.02, 0.2, 0x1c1c1f, ms.cx, 0.78, -2.58);
    F(0.5, 0.025, 0.18, 0x2a2d33, ms.cx, 0.775, -2.28); F(0.07, 0.025, 0.1, 0x2a2d33, ms.cx + 0.4, 0.775, -2.28); F(0.22, 0.46, 0.46, 0x2a2d33, 3.15, 0.23, -2.42);
    F(0.5, 0.06, 0.5, P.cadeira, ms.cadeira[0], 0.43, ms.cadeira[1]); F(0.5, 0.52, 0.06, P.cadeira, ms.cadeira[0], 0.74, ms.cadeira[1] + 0.22); F(0.06, 0.4, 0.06, 0x2a2d33, ms.cadeira[0], 0.2, ms.cadeira[1]); F(0.44, 0.04, 0.44, 0x2a2d33, ms.cadeira[0], 0.03, ms.cadeira[1]);
    const tela = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.34), brilho(0x6fb4ff)); tela.position.set(ms.cx, 1.12, -2.588); g.add(tela);
    // interruptor (parede do fundo) com uma lucinha verde para achar no escuro
    F(0.12, 0.18, 0.03, 0xf2f2ee, Q.luz.x, 1.3, -D / 2 + 0.02); F(0.05, 0.07, 0.03, 0xc9c9c0, Q.luz.x, 1.3, -D / 2 + 0.04);
    const ponto = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.035, 0.02), brilho(0x4dff7a)); ponto.position.set(Q.luz.x, 1.41, -D / 2 + 0.05); g.add(ponto);
    // portas: banheiro (parede direita) e saída (parede esquerda)
    F(0.06, 2.05, 0.95, fem ? 0xf2ede8 : 0xb98042, W / 2 - 0.04, 1.03, Q.pBanheiro.z); F(0.1, 0.08, 1.16, sombra(P.madeira, 1), W / 2 - 0.05, 2.1, Q.pBanheiro.z); F(0.1, 2.1, 0.08, sombra(P.madeira, 1), W / 2 - 0.05, 1.05, Q.pBanheiro.z - 0.55); F(0.1, 2.1, 0.08, sombra(P.madeira, 1), W / 2 - 0.05, 1.05, Q.pBanheiro.z + 0.55);
    F(0.1, 0.06, 0.06, 0xd8d8d0, W / 2 - 0.1, 1.0, Q.pBanheiro.z - 0.35);
    F(0.06, 2.05, 0.95, 0xe8e2d4, -W / 2 + 0.04, 1.03, Q.pSaida.z); F(0.1, 0.08, 1.16, 0x7a5430, -W / 2 + 0.05, 2.1, Q.pSaida.z); F(0.1, 2.1, 0.08, 0x7a5430, -W / 2 + 0.05, 1.05, Q.pSaida.z - 0.55); F(0.1, 2.1, 0.08, 0x7a5430, -W / 2 + 0.05, 1.05, Q.pSaida.z + 0.55);
    F(0.1, 0.06, 0.06, 0xd8d8d0, -W / 2 + 0.1, 1.0, Q.pSaida.z + 0.35);
    // objetos de cada tipo de quarto
    if (fem) {
      F(0.34, 0.3, 0.26, 0x9c6a43, cb.cx + 0.3, 0.84, -2.4); F(0.28, 0.26, 0.26, 0x9c6a43, cb.cx + 0.3, 1.08, -2.4); F(0.1, 0.1, 0.06, 0x9c6a43, cb.cx + 0.16, 1.24, -2.4); F(0.1, 0.1, 0.06, 0x9c6a43, cb.cx + 0.44, 1.24, -2.4); F(0.12, 0.08, 0.04, 0xe8c9a0, cb.cx + 0.3, 1.05, -2.27);   // ursinho
      for (const [px, pz] of [[3.55, 2.4], [-3.55, 2.4]]) { F(0.34, 0.3, 0.34, 0xc8683c, px, 0.15, pz); F(0.5, 0.4, 0.5, 0x2f8a4a, px, 0.5, pz); F(0.3, 0.3, 0.3, 0x3fb65e, px, 0.85, pz); }                 // plantas
      F(0.04, 1.5, 0.62, 0xe8d3a0, -W / 2 + 0.03, 1.0, -0.8); F(0.02, 1.4, 0.52, 0xbfe4f5, -W / 2 + 0.05, 1.0, -0.8);                                                                       // espelho
    } else {
      F(0.3, 0.1, 0.12, 0x1c1c1f, -1.55, 0.05, -1.9); F(0.1, 0.05, 0.05, 0xe8742a, -1.55, 0.12, -1.9); F(0.3, 0.1, 0.12, 0x1c1c1f, -1.55, 0.05, -1.7); F(0.1, 0.05, 0.05, 0xe8742a, -1.55, 0.12, -1.7);   // chuteiras
      F(0.2, 0.03, 0.72, 0xc8352b, 3.45, 0.115, 1.55); for (const sz of [-0.24, 0.24]) for (const sx of [-0.06, 0.06]) F(0.05, 0.07, 0.05, 0xf2f2ee, 3.45 + sx * 1.3, 0.04, 1.55 + sz);          // (4.7.3) skate deitado no chão (antes flutuava e atravessava a parede)
      { const mc = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.8), basic({ map: texCampo() })); mc.rotation.y = Math.PI / 2; mc.position.set(-W / 2 + 0.013, 1.62, -0.8); g.add(mc);     // quadro com um campo de verdade
        F(0.03, 0.05, 1.28, 0x3a2a1a, -W / 2 + 0.018, 2.04, -0.8); F(0.03, 0.05, 1.28, 0x3a2a1a, -W / 2 + 0.018, 1.2, -0.8); F(0.03, 0.89, 0.05, 0x3a2a1a, -W / 2 + 0.018, 1.62, -1.43); F(0.03, 0.89, 0.05, 0x3a2a1a, -W / 2 + 0.018, 1.62, -0.17); }
    }
    const mob = L.malha(MAT_CORES); g.add(mob);
    let bola = null, bolaSombra = null;
    if (!fem) {                                                                                                                                            // (4.7.3) a bola do quarto tem física (bolaTick)
      bola = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 8), new THREE.MeshLambertMaterial({ map: texBolaF() })); bola.position.set(0.9, 0.17, 1.6); g.add(bola);
      bolaSombra = new THREE.Mesh(new THREE.CircleGeometry(0.17, 12), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3, depthWrite: false })); bolaSombra.rotation.x = -Math.PI / 2; bolaSombra.position.set(0.9, 0.02, 1.6); g.add(bolaSombra);
    }
    else for (let i = 0; i < 14; i++) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.03), brilho([0xffd92b, 0xff7ab8, 0x7ad8ff, 0xb98bff][i % 4])); l.position.set(-3.7 + i * 0.55, 2.5 - Math.abs(Math.sin(i * 0.5)) * 0.18, -D / 2 + 0.03); g.add(l); }   // luzinhas
    // pôsteres colados na parede (imagens minúsculas, de baixa qualidade, com fita nos cantos)
    const poster = (url, w, h, x, y) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), basic({ map: texDaImagem(url) })); m.position.set(x, y, -D / 2 + 0.012); g.add(m);
      const Lf = new Lote(); for (const sx of [-1, 1]) for (const sy of [-1, 1]) Lf.caixa(0.09, 0.09, 0.012, 0xe8e0c0, x + sx * w / 2, y + sy * h / 2, -D / 2 + 0.016);
      g.add(Lf.malha(MAT_CORES));
    };
    poster(POSTER_A, 0.82, 0.82, -3.05, 1.85);
    poster(POSTER_B, 1.1, 0.82, 2.4, 1.95);
    const seta = fazSeta(); g.add(seta);
    scene.add(g);
    return { g, seta, tela, mats, bola, bolaSombra };
  }

  // ----- O BANHEIRO (4,4 x 4,4 m): porta na parede da esquerda; vaso, pia e chuveiro no fundo
  const B_CAM = [0.1, 3.3, 4.2, 0.1, 0.65, -0.7];
  const B = { vaso: { x: -0.9, spot: [-0.9, -1.2], sent: [-0.9, -1.78] }, pia: { x: 0.5, spot: [0.5, -1.35] }, chuveiro: { spot: [1.55, -0.45] }, porta: { z: 0.6, spot: [-1.7, 0.6] } };
  const B_RETS = [[-1.2, -0.6, -2.2, -1.5], [0.1, 0.95, -2.2, -1.72], [1.05, 2.2, -2.2, -0.85]];
  function montarBanheiro() {
    const g = new THREE.Group(); g.position.set(OX + 100, 0, 0);
    const basic = (p) => new THREE.MeshBasicMaterial(p);
    const tw = texParedeBanheiro(); tw.wrapS = tw.wrapT = THREE.RepeatWrapping; const mp = basic({ map: tw });
    const W = 4.4, D = 4.4, ALT = 2.6;
    planoParede(g, mp, W, ALT, 0, 0, ALT / 2, -D / 2, 2.2, ALT); planoParede(g, mp, D, ALT, Math.PI / 2, -W / 2, ALT / 2, 0, 2.2, ALT); planoParede(g, mp, D, ALT, -Math.PI / 2, W / 2, ALT / 2, 0, 2.2, ALT);
    const pf = drawTexture(32, 32, (c, w, h) => { c.fillStyle = '#e9edf0'; c.fillRect(0, 0, w, h); c.fillStyle = '#c9d2d8'; c.fillRect(0, 0, w, 1); c.fillRect(0, 0, 1, h); c.fillRect(16, 16, 16, 16); c.fillRect(0, 0, 16, 16); }); pf.wrapS = pf.wrapT = THREE.RepeatWrapping; pf.repeat.set(W / 0.8, D / 0.8);
    const piso = new THREE.Mesh(new THREE.PlaneGeometry(W, D), basic({ map: pf })); piso.rotation.x = -Math.PI / 2; g.add(piso);
    chaoPreto(g);
    const tap = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.8), basic({ color: 0x6aa6c8 })); tap.rotation.x = -Math.PI / 2; tap.position.set(0.1, 0.012, -0.9); g.add(tap);
    const L = new Lote(), F = (w, h, d, c, x, y, z) => L.caixa(w, h, d, c, x, y, z);
    F(0.5, 0.45, 0.2, 0xf4f4f0, B.vaso.x, 0.62, -2.08); F(0.42, 0.38, 0.5, 0xf4f4f0, B.vaso.x, 0.2, -1.84); F(0.44, 0.04, 0.46, 0xe6e6e0, B.vaso.x, 0.4, -1.82); F(0.08, 0.04, 0.06, 0xb9b6ae, B.vaso.x, 0.86, -2.0);
    F(0.2, 0.7, 0.2, 0xf4f4f0, B.pia.x, 0.35, -2.05); F(0.62, 0.12, 0.44, 0xf4f4f0, B.pia.x, 0.76, -1.98); F(0.06, 0.12, 0.06, 0xb9b6ae, B.pia.x, 0.9, -2.13); F(0.04, 0.04, 0.14, 0xb9b6ae, B.pia.x, 0.96, -2.07);
    F(0.84, 0.74, 0.03, 0x8a8f96, B.pia.x, 1.6, -2.19); F(0.76, 0.66, 0.02, 0xbfe4f5, B.pia.x, 1.6, -2.17);
    F(1.1, 0.1, 1.3, 0xe6e6e0, 1.65, 0.05, -1.55); F(0.04, 1.0, 0.04, 0xb9b6ae, 2.05, 1.5, -2.14); F(0.04, 0.04, 0.3, 0xb9b6ae, 2.05, 2.0, -2.0); F(0.2, 0.04, 0.2, 0xb9b6ae, 2.05, 1.96, -1.86);
    F(0.4, 0.55, 0.04, 0xf2f2ee, 0.0 + 1.2, 1.2, -2.18);                                                                                  // toalha
    F(0.06, 2.05, 0.95, 0xe8e2d4, -W / 2 + 0.04, 1.03, B.porta.z); F(0.1, 0.08, 1.16, 0x7a5430, -W / 2 + 0.05, 2.1, B.porta.z); F(0.1, 2.1, 0.08, 0x7a5430, -W / 2 + 0.05, 1.05, B.porta.z - 0.55); F(0.1, 2.1, 0.08, 0x7a5430, -W / 2 + 0.05, 1.05, B.porta.z + 0.55);
    F(0.1, 0.06, 0.06, 0xd8d8d0, -W / 2 + 0.1, 1.0, B.porta.z + 0.35);
    g.add(L.malha(MAT_CORES));
    const vidro = new THREE.MeshLambertMaterial({ color: 0xbfe4f5, transparent: true, opacity: 0.28, depthWrite: false });
    const v1 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 2.0, 1.3), vidro); v1.position.set(1.1, 1.05, -1.55); g.add(v1);
    const v2 = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.0, 0.04), vidro); v2.position.set(1.65, 1.05, -0.9); g.add(v2);
    const seta = fazSeta(); g.add(seta);
    scene.add(g);
    return { g, seta, vidro };
  }

  // ----- A ESCADA DO PRÉDIO: um anel quadrado em volta de um vão vazio. Quatro lances de 1,4 m cada, de cima (5,6 m) até o térreo.
  //   Vista de cima (norte para cima):   NW(5,6) ──N──▶ NE(4,2)      lance N: x de -IN a +IN (desce para o leste)
  //                                       ▲               │          lance E: z de -IN a +IN (desce para o sul)
  //                                       W               E          lance S: x de +IN a -IN (desce para o oeste)
  //                                       │               ▼          lance W: z de +IN a -IN (desce para o norte)
  //                                     SW(1,4) ◀──S── SE(2,8)       No canto NW há DOIS andares: o de cima (5,6) e o térreo (0, o saguão).
  const IN = 2.4, OUT = 5.0, MID = 3.7, ALTO = 12, NIVEL = { NW: 5.6, NE: 4.2, SE: 2.8, SW: 1.4, T: 0 };
  const rotK = (k, x, z) => { for (let i = 0; i < k; i++) { const t = x; x = -z; z = t; } return [x, z]; };
  const degrau = (a, b, u) => (u <= 0 ? a : u >= 1 ? b : a + (b - a) * (Math.min(8, Math.floor(u * 9)) + 1) / 10);
  function zonaEsc(x, z) {
    if (Math.abs(x) < IN && Math.abs(z) < IN) return 'vazio';
    if (x < -IN && z < -IN) return 'NW'; if (x > IN && z < -IN) return 'NE'; if (x > IN && z > IN) return 'SE'; if (x < -IN && z > IN) return 'SW';
    if (z < -IN) return 'N'; if (x > IN) return 'E'; if (z > IN) return 'S'; return 'W';
  }
  function alturaEsc(x, z, A) {
    switch (zonaEsc(x, z)) {
      case 'N': return degrau(5.6, 4.2, (x + IN) / (2 * IN));
      case 'E': return degrau(4.2, 2.8, (z + IN) / (2 * IN));
      case 'S': return degrau(2.8, 1.4, (IN - x) / (2 * IN));
      case 'W': return degrau(1.4, 0, (IN - z) / (2 * IN));
      case 'NE': return 4.2; case 'SE': return 2.8; case 'SW': return 1.4;
      case 'NW': return A && A.y > 2.8 ? 5.6 : 0;
      default: return A ? A.y : 0;
    }
  }
  function viga(g, x0, y0, z0, x1, y1, z1, esp, cor) {                 // barra inclinada (corrimão)
    const a = new THREE.Vector3(x0, y0, z0), b = new THREE.Vector3(x1, y1, z1), d = b.clone().sub(a), len = d.length();
    const m = new THREE.Mesh(new THREE.BoxGeometry(len, esp, esp), new THREE.MeshLambertMaterial({ color: cor }));
    m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), d.normalize()); g.add(m); return m;
  }
  // porta de apartamento na parede externa: (x, z) é o ponto na parede; (nx, nz) a normal para dentro do prédio
  function portaApto(pai, x, y, z, nx, nz, num, cor) {
    const G = new THREE.Group(); G.position.set(x, y, z); G.rotation.y = Math.atan2(nx, nz);
    const L = new Lote(), F = (w, h, d, c, px, py, pz) => L.caixa(w, h, d, c, px, py, pz);
    F(1.22, 0.1, 0.12, 0x5b4630, 0, 2.16, 0.05); F(0.1, 2.16, 0.12, 0x5b4630, -0.56, 1.08, 0.05); F(0.1, 2.16, 0.12, 0x5b4630, 0.56, 1.08, 0.05); F(0.9, 0.03, 0.34, 0x3a3f4a, 0, 0.02, 0.2);
    G.add(L.malha(MAT_CORES));
    const escuro = new THREE.Mesh(new THREE.PlaneGeometry(1.02, 2.1), new THREE.MeshBasicMaterial({ color: 0x050403 })); escuro.position.set(0, 1.05, 0.012); escuro.visible = false; G.add(escuro);
    const pivo = new THREE.Group(); pivo.position.set(-0.51, 0, 0.04); G.add(pivo);
    const Lf = new Lote(); Lf.caixa(1.0, 2.08, 0.06, cor, 0.5, 1.04, 0); Lf.caixa(0.05, 0.05, 0.1, 0xd8d8d0, 0.88, 1.0, 0.05); Lf.caixa(0.04, 0.04, 0.04, 0x1c1c1f, 0.5, 1.62, 0.04);
    pivo.add(Lf.malha(MAT_CORES));
    const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.15), new THREE.MeshBasicMaterial({ map: texPlaca(num, '#f2f2ee', '#3a3f4a') })); pl.position.set(0.5, 1.8, 0.035); pivo.add(pl);
    pai.add(G);
    return { G, pivo, escuro, abrir(v) { pivo.rotation.y = v; escuro.visible = v > 0.05; } };
  }
  function montarEscada() {
    const g = new THREE.Group(); g.position.set(OX + 200, 0, 0);
    const pecas = [], portas = {};
    const basic = (p) => new THREE.MeshBasicMaterial(p);
    const tx = texParedeEscada(); tx.wrapS = tx.wrapT = THREE.RepeatWrapping;
    const mp = basic({ map: tx });
    planoParede(g, mp, 2 * OUT, ALTO, 0, 0, ALTO / 2, -OUT, 2.6, 1.4); planoParede(g, mp, 2 * OUT, ALTO, Math.PI / 2, -OUT, ALTO / 2, 0, 2.6, 1.4);
    planoParede(g, mp, 2 * OUT, ALTO, -Math.PI / 2, OUT, ALTO / 2, 0, 2.6, 1.4); planoParede(g, mp, 2 * OUT, ALTO, Math.PI, 0, ALTO / 2, OUT, 2.6, 1.4);
    chaoPreto(g);
    // chão do térreo: ladrilho de xadrez cinza
    const tl = drawTexture(16, 16, (c, w, h) => { c.fillStyle = '#b9b6ae'; c.fillRect(0, 0, w, h); c.fillStyle = '#9c998f'; c.fillRect(0, 0, 8, 8); c.fillRect(8, 8, 8, 8); }); tl.wrapS = tl.wrapT = THREE.RepeatWrapping; tl.repeat.set((OUT - IN) / 1.0, (OUT - IN) / 1.0);
    // (4.7.3) só o saguão tem chão: o resto do térreo (o vão e o que ficava "barrado" atrás do armário) não existe mais, vira preto
    const chao = new THREE.Mesh(new THREE.PlaneGeometry(OUT - IN, OUT - IN), basic({ map: tl })); chao.rotation.x = -Math.PI / 2; chao.position.set(-MID, 0.002, -MID); g.add(chao);
    const peca = (yMin) => { const G = new THREE.Group(); G.userData.yMin = yMin; g.add(G); pecas.push(G); return G; };
    const cinza = [0xa89f88, 0x9a917b], pisoPat = 0x8f8874;
    // patamares dos cantos de cima (NW 5,6 · NE 4,2 · SE 2,8 · SW 1,4)
    const cantos = [['NW', -1, -1], ['NE', 1, -1], ['SE', 1, 1], ['SW', -1, 1]];
    for (const [n, sx, sz] of cantos) {
      const y = NIVEL[n], G = peca(y), L = new Lote();
      L.caixa(OUT - IN, 0.3, OUT - IN, pisoPat, sx * MID, y - 0.15, sz * MID);
      L.caixa(OUT - IN, 0.06, 0.1, 0x8c8676, sx * MID, y + 0.03, sz * (IN + 0.05));                                // frisos
      G.add(L.malha(MAT_CORES));
    }
    // lances
    const lances = [['N', 0, NIVEL.NW, NIVEL.NE], ['E', 1, NIVEL.NE, NIVEL.SE], ['S', 2, NIVEL.SE, NIVEL.SW], ['W', 3, NIVEL.SW, NIVEL.T]];
    for (const [nome, k, yA, yB] of lances) {
      const yMin = Math.min(yA, yB), G = peca(yMin), L = new Lote(), larg = OUT - IN, passo = 2 * IN / 9;
      for (let i = 0; i < 9; i++) {
        const lx = -IN + (i + 0.5) * passo, lz = -(IN + OUT) / 2, topo = yA + (yB - yA) * (i + 1) / 10;
        const [wx, wz] = rotK(k, lx, lz), alongX = k % 2 === 0;
        L.caixa(alongX ? passo : larg, 0.22, alongX ? larg : passo, cinza[i % 2], wx, topo - 0.11, wz);
      }
      // corrimão do lado do vão (borda interna) + montantes
      const pts = [];
      for (let i = 0; i <= 9; i++) {
        const lx = -IN + i * passo + (i === 9 ? 0 : 0), lz = -IN + 0.1, yy = i === 0 ? yA : i === 9 ? yB : yA + (yB - yA) * i / 10;
        const [wx, wz] = rotK(k, Math.min(IN, Math.max(-IN, lx)), lz); pts.push([wx, yy, wz]);
        if (i > 0 && i < 9) { L.caixa(0.05, 1.0, 0.05, 0x4a4f58, wx, yy + 0.5, wz); }
      }
      G.add(L.malha(MAT_CORES));
      viga(G, pts[0][0], pts[0][1] + 1.0, pts[0][2], pts[9][0], pts[9][1] + 1.0, pts[9][2], 0.07, 0x3a3f4a);
      viga(G, pts[0][0], pts[0][1] + 0.5, pts[0][2], pts[9][0], pts[9][1] + 0.5, pts[9][2], 0.04, 0x4a4f58);
      // janela na parede externa, no meio do lance
      const [jx, jz] = rotK(k, 0, -OUT + 0.02), jy = (yA + yB) / 2 + 1.55, [nx, nz] = rotK(k, 0, 1);
      const jan = new THREE.Group(); jan.position.set(jx, jy, jz); jan.rotation.y = Math.atan2(nx, nz);
      const Lj = new Lote(); Lj.caixa(1.3, 0.08, 0.06, 0x6b5a3a, 0, 0.78, 0); Lj.caixa(1.3, 0.08, 0.06, 0x6b5a3a, 0, -0.78, 0); Lj.caixa(0.08, 1.64, 0.06, 0x6b5a3a, -0.65, 0, 0); Lj.caixa(0.08, 1.64, 0.06, 0x6b5a3a, 0.65, 0, 0); Lj.caixa(0.05, 1.5, 0.05, 0x6b5a3a, 0, 0, 0);
      jan.add(Lj.malha(MAT_CORES)); const vidro = new THREE.Mesh(new THREE.PlaneGeometry(1.24, 1.5), basic({ color: 0xcfe9ff })); vidro.position.z = -0.01; jan.add(vidro); G.add(jan);
    }
    // portas dos apartamentos (cada uma no grupo do patamar do seu andar)
    const peNW = pecas[0], peNE = pecas[1], peSE = pecas[2], peSW = pecas[3];
    portas.minha = portaApto(peNW, -OUT + 0.03, 5.6, -MID, 1, 0, '41', 0xb98042);
    portaApto(peNW, -MID + 0.3, 5.6, -OUT + 0.03, 0, 1, '42', 0x8a4a3a);
    portaApto(peNE, MID, 4.2, -OUT + 0.03, 0, 1, '31', 0x6d8a5a); portaApto(peNE, OUT - 0.03, 4.2, -MID, -1, 0, '32', 0xb98042);
    portas.vizinho = portaApto(peSE, OUT - 0.03, 2.8, MID, -1, 0, '21', 0x7a5430); portaApto(peSE, MID, 2.8, OUT - 0.03, 0, -1, '22', 0x4a6fa5);
    portaApto(peSW, -MID, 1.4, OUT - 0.03, 0, -1, '11', 0x8a4a3a); portaApto(peSW, -OUT + 0.03, 1.4, MID, 1, 0, '12', 0x6d8a5a);
    // barreira do alto: o patamar NW de cima não desce direto para o lance W (é um precipício) → corrimão
    { const Lb = new Lote(); const y = 5.6;
      for (let i = 0; i <= 5; i++) Lb.caixa(0.06, 1.0, 0.06, 0x4a4f58, -OUT + 0.15 + i * (OUT - IN - 0.3) / 5, y + 0.5, -IN - 0.06);
      peNW.add(Lb.malha(MAT_CORES)); viga(peNW, -OUT + 0.15, y + 1.0, -IN - 0.06, -IN - 0.15, y + 1.0, -IN - 0.06, 0.07, 0x3a3f4a); viga(peNW, -OUT + 0.15, y + 0.5, -IN - 0.06, -IN - 0.15, y + 0.5, -IN - 0.06, 0.04, 0x4a4f58); }
    // térreo (saguão): porta da rua na parede norte, caixas de correio na oeste, armário de medidores no lugar do lance N
    const T = peca(0), LT = new Lote(), FT = (w, h, d, c, x, y, z) => LT.caixa(w, h, d, c, x, y, z);
    FT(OUT - IN, 0.04, OUT - IN, 0x8c8676, -MID, 0.0, -MID); FT(0.1, 2.3, 0.1, 0x5b4630, -MID - 0.9, 1.15, -OUT + 0.06); FT(0.1, 2.3, 0.1, 0x5b4630, -MID + 0.9, 1.15, -OUT + 0.06); FT(1.9, 0.1, 0.1, 0x5b4630, -MID, 2.25, -OUT + 0.06); FT(1.5, 0.04, 0.3, 0x3a3f4a, -MID, 0.02, -OUT + 0.3);   // (4.7.3) só a moldura: a folha é o portão de grade (o lado de fora, abaixo)
    FT(0.08, 2.0, 0.08, 0xd8d8d0, -MID - 0.1, 1.0, -OUT + 0.17); FT(0.08, 2.0, 0.08, 0xd8d8d0, -MID + 0.1, 1.0, -OUT + 0.17);
    for (let i = 0; i < 6; i++) { FT(0.06, 0.2, 0.28, i % 2 ? 0x8c9199 : 0x6c7279, -OUT + 0.06, 1.1 + (i >> 1) * 0.24, -4.2 + (i & 1) * 0.34 + 0.0); FT(0.02, 0.05, 0.1, 0xf2c230, -OUT + 0.1, 1.15 + (i >> 1) * 0.24, -4.2 + (i & 1) * 0.34); }
    FT(0.14, 0.62, OUT - IN, 0x9a9484, -IN, 0.31, -MID); FT(0.2, 0.06, OUT - IN, 0xb3ad9c, -IN, 0.65, -MID);               // (4.7.3) mureta baixa no lugar do armário alto: o lado do saguão deixou de ser uma parede enorme
    T.add(LT.malha(MAT_CORES));
    const vidroPorta = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 2.14), basic({ color: 0xeaf6ff })); vidroPorta.position.set(-MID, 1.07, -OUT + 0.14); T.add(vidroPorta);
    // (4.7.3) a câmera do saguão fica do lado de fora, olhando para dentro: a porta da rua (portão de ferro azul com grade) fica virada para ela
    const foraPorta = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 2.14), basic({ map: texPortaRua(), transparent: true, alphaTest: 0.5, side: THREE.DoubleSide })); foraPorta.rotation.y = Math.PI; foraPorta.position.set(-MID, 1.07, -OUT - 0.012); T.add(foraPorta);
    portas.rua = { vidro: vidroPorta, fora: foraPorta };
    const plM = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.2), basic({ map: texPlaca('LUZ', '#f2c230', '#2a1206') })); plM.position.set(-OUT + 0.62, 1.7, -OUT + 0.04); T.add(plM);   // placa dos medidores, agora ao lado da porta
    const seta = fazSeta(); g.add(seta);
    scene.add(g);
    return { g, pecas, portas, seta };
  }
  // câmera de cada setor: a mesma "forma" girada de 90° em 90°. Fica fixa (só o olhar acompanha o personagem de leve).
  const CAM_SETOR = { N: { k: 0, base: 4.9 }, E: { k: 1, base: 3.5 }, S: { k: 2, base: 2.1 }, W: { k: 3, base: 0.7 } };
  function camEscada(J) {
    const z = zonaEsc(J.x, J.z), nw = z === 'NW' && J.y <= 2.8;
    if (nw) return [-1.2, 5.2, -8.4, -3.9, 0.7, -3.5, 'L'];     // (4.7.3) do lado de fora do prédio, olhando para dentro: a saída fica na direção da câmera
    const set = z === 'N' || z === 'NW' || z === 'NE' ? 'N' : z === 'E' || z === 'SE' ? 'E' : z === 'S' || z === 'SW' ? 'S' : 'W';
    const c = CAM_SETOR[set], k = c.k, [ux] = rotK((4 - k) % 4, J.x, J.z);                    // ux: posição do personagem ao longo do lance (no referencial N)
    const [px, pz] = rotK(k, 0, 2.0), [tx, tz] = rotK(k, ux * 0.62, -3.7);
    return [px, c.base + 3.1, pz, tx, c.base + 0.55, tz, set];
  }

  // ------------------------------------------------------------------ dados, texto e save
  const OFFS = { quarto: 0, banheiro: 100, escada: 200 };
  const VAGAS = [
    { id: 'mercado', ico: '🛒', emp: 'Mercadinho Bom Preço', titulo: 'Mercado - Reposição e Limpeza', desc: 'Repor as prateleiras, organizar o estoque e manter o salão limpo.', info: 'Meio período · perto de casa' },
    { id: 'cafeteria', ico: '☕', emp: 'Café da Esquina', titulo: 'Cafeteria - Atendente', desc: 'Atender os clientes no balcão, anotar os pedidos e servir as mesas.', info: 'Meio período · ambiente tranquilo' },
    { id: 'pizzaria', ico: '🛵', emp: 'Pizzaria Forno a Lenha', titulo: 'Entregador - Pizzaria', desc: 'Levar as pizzas quentinhas para as casas do bairro, de bicicleta.', info: 'Meio período · à noite' },
  ];
  const PONTOS_TRANQUILO = 2;            // qualquer emprego dá pontos no lado "Tranquilo" (negativo = Problemático)
  const NOME_PONTO = { inicio: 'Dez anos depois', emprego: 'Emprego escolhido', escada: 'A escada do prédio', fim: 'Saída do prédio' };
  const dadosPadrao = () => ({ ponto: 'inicio', ano: 0, idade: IDADE, luz: false, roupa: null, emprego: null, tranquilo: 0, vizinho: { pediuCigarro: false, mandouFumarFora: false, perguntouComer: false, sabeValdemar: false } });
  const nomeJog = () => PERSONAGEM.apelido || PERSONAGEM.nome || T('Você');
  const Tx = (m, f) => T(PERSONAGEM.genero === 'F' ? f : m);
  // ---------------------------------------------------------------------------------------------------
  // IDIOMAS: textos novos da Fase 2 (chave = português; ordem [en, es, it, fr]). Só entra o que ainda NÃO existe na tabela I18N do jogo.js.
  const TRAD_F2 = {
    'Você': ['You', 'Tú', 'Tu', 'Toi'],
    'Modo história · Fase 2 · {0}': ['Story mode · Phase 2 · {0}', 'Modo historia · Fase 2 · {0}', 'Modalità storia · Fase 2 · {0}', 'Mode histoire · Phase 2 · {0}'],
    'Fase 2 · {0}': ['Phase 2 · {0}', 'Fase 2 · {0}', 'Fase 2 · {0}', 'Phase 2 · {0}'],
    'Dez anos depois': ['Ten years later', 'Diez años después', 'Dieci anni dopo', 'Dix ans plus tard'],
    'Emprego escolhido': ['Job chosen', 'Empleo elegido', 'Lavoro scelto', 'Emploi choisi'],
    'A escada do prédio': ['The building stairs', 'La escalera del edificio', 'Le scale del palazzo', "L'escalier de l'immeuble"],
    'Saída do prédio': ['Building exit', 'Salida del edificio', "Uscita del palazzo", "Sortie de l'immeuble"],
    'Jogo salvo': ['Game saved', 'Juego guardado', 'Partita salvata', 'Jeu sauvegardé'],
    'Interruptor': ['Light switch', 'Interruptor', 'Interruttore', 'Interrupteur'],
    'Guarda-roupa': ['Wardrobe', 'Armario', 'Armadio', 'Armoire'],
    'Computador': ['Computer', 'Computadora', 'Computer', 'Ordinateur'],
    'Banheiro': ['Bathroom', 'Baño', 'Bagno', 'Salle de bain'],
    'Sair do quarto': ['Leave the room', 'Salir del cuarto', 'Uscire dalla camera', 'Sortir de la chambre'],
    'Vaso sanitário': ['Toilet', 'Inodoro', 'Water', 'Toilettes'],
    'Pia': ['Sink', 'Lavabo', 'Lavandino', 'Lavabo'],
    'Chuveiro': ['Shower', 'Ducha', 'Doccia', 'Douche'],
    'Voltar ao quarto': ['Back to the bedroom', 'Volver al cuarto', 'Tornare in camera', 'Retourner dans la chambre'],
    'Conversar com o vizinho': ['Talk to the neighbor', 'Hablar con el vecino', 'Parlare con il vicino', 'Parler au voisin'],
    'Entrar no apartamento': ['Enter the apartment', 'Entrar al apartamento', "Entrare nell'appartamento", "Entrer dans l'appartement"],
    'Sair do prédio': ['Leave the building', 'Salir del edificio', 'Uscire dal palazzo', "Sortir de l'immeuble"],
    'Vizinho': ['Neighbor', 'Vecino', 'Vicino', 'Voisin'],
    'Missão: veja o computador.': ['Mission: check the computer.', 'Misión: mira la computadora.', 'Missione: guarda il computer.', "Mission : regarde l'ordinateur."],
    'Missão: acenda a luz.': ['Mission: turn on the light.', 'Misión: enciende la luz.', 'Missione: accendi la luce.', 'Mission : allume la lumière.'],
    'Missão: troque de roupa e saia do quarto.': ['Mission: change clothes and leave the room.', 'Misión: cámbiate de ropa y sal del cuarto.', 'Missione: cambiati e esci dalla camera.', 'Mission : change de vêtements et sors de la chambre.'],
    'Missão: encontre um lugar para comer.': ['Mission: find a place to eat.', 'Misión: encuentra un lugar para comer.', 'Missione: trova un posto dove mangiare.', 'Mission : trouve un endroit pour manger.'],
    'Missão: vá até a lanchonete do seu Valdemar.': ["Mission: go to Mr. Valdemar's snack bar.", 'Misión: ve a la lonchería de don Valdemar.', 'Missione: vai al chiosco di Valdemar.', 'Mission : va au snack de monsieur Valdemar.'],
    'Procure um lugar para comer. Cuidado com os degraus!': ['Look for a place to eat. Watch the steps!', '¡Busca un lugar para comer. Cuidado con los escalones!', 'Cerca un posto dove mangiare. Attenzione ai gradini!', 'Cherche un endroit pour manger. Attention aux marches !'],
    'Use o direcional para andar e o botão Interagir.': ['Use the joystick to walk and the Interact button.', 'Usa el joystick para caminar y el botón Interactuar.', 'Usa il joystick per camminare e il pulsante Interagisci.', 'Utilise le joystick pour marcher et le bouton Interagir.'],
    'Interagir': ['Interact', 'Interactuar', 'Interagisci', 'Interagir'],
    'Eu preciso ver se alguém respondeu as minhas candidaturas de emprego no LoggedOn': ['I need to see if anyone answered my job applications on LoggedOn', 'Necesito ver si alguien respondió a mis solicitudes de empleo en LoggedOn', 'Devo vedere se qualcuno ha risposto alle mie candidature di lavoro su LoggedOn', "Je dois voir si quelqu'un a répondu à mes candidatures d'emploi sur LoggedOn"],
    'Hmm... está tudo escuro...': ['Hmm... it is all dark...', 'Hmm... está todo oscuro...', 'Hmm... è tutto buio...', 'Hmm... il fait tout noir...'],
    'Preciso acender a luz.': ['I need to turn on the light.', 'Necesito encender la luz.', 'Devo accendere la luce.', "Il faut que j'allume la lumière."],
    'Quando eu tinha {0} anos, eu já precisava ser independente...': ['When I was {0}, I already had to be independent...', 'Cuando yo tenía {0} años, ya necesitaba ser independiente...', 'Quando avevo {0} anni, dovevo già essere indipendente...', "Quand j'avais {0} ans, je devais déjà être indépendant..."],
    'Mas... isso não é tudo.': ['But... that is not all.', 'Pero... eso no es todo.', 'Ma... non è tutto qui.', 'Mais... ce n\'est pas tout.'],
    'Eu não cheguei onde eu estou só por causa dessa partida...': ['I did not get where I am only because of that match...', 'No llegué a donde estoy solo por ese partido...', 'Non sono arrivato dove sono solo per quella partita...', "Je ne suis pas arrivé là où j'en suis seulement à cause de ce match..."],
    'Na verdade, ela foi só o começo...': ['In fact, it was only the beginning...', 'En realidad, fue solo el comienzo...', "In realtà, è stato solo l'inizio...", "En fait, ce n'était que le début..."],
    'Cor principal': ['Main color', 'Color principal', 'Colore principale', 'Couleur principale'],
    'Cor secundária': ['Secondary color', 'Color secundario', 'Colore secondario', 'Couleur secondaire'],
    'Cor da borda do emblema': ['Emblem border color', 'Color del borde del emblema', 'Colore del bordo dello stemma', 'Couleur du contour de l\'écusson'],
    'o quadradinho ou escudo do peito': ['the little square or crest on the chest', 'el cuadradito o escudo del pecho', 'il quadratino o lo stemma sul petto', 'le petit carré ou l\'écusson sur la poitrine'],
    'Regata e bermuda': ['Tank top and bermuda shorts', 'Camiseta sin mangas y bermudas', 'Canotta e bermuda', 'Débardeur et bermuda'],
    'Regata de time e short': ['Team tank top and shorts', 'Camiseta de equipo sin mangas y short', 'Canotta della squadra e pantaloncini', 'Débardeur d\'équipe et short'],
    'Regata e calça jeans': ['Tank top and jeans', 'Camiseta sin mangas y vaqueros', 'Canotta e jeans', 'Débardeur et jean'],
    'Regata e short': ['Tank top and shorts', 'Camiseta sin mangas y short', 'Canotta e pantaloncini', 'Débardeur et short'],
    'Regata e saia': ['Tank top and skirt', 'Camiseta sin mangas y falda', 'Canotta e gonna', 'Débardeur et jupe'],
    'Top e short': ['Crop top and shorts', 'Top corto y short', 'Top corto e pantaloncini', 'Brassière et short'],
    'Top e calça jeans': ['Crop top and jeans', 'Top corto y vaqueros', 'Top corto e jeans', 'Brassière et jean'],
    'Top e saia': ['Crop top and skirt', 'Top corto y falda', 'Top corto e gonna', 'Brassière et jupe'],
    'Ahh, agora sim! Banho tomado.': ['Ahh, that feels better! All clean.', '¡Ahh, ahora sí! Ya me bañé.', 'Ahh, ora sì! Doccia fatta.', 'Ahh, ça fait du bien ! Douche prise.'],
    'Cor dos detalhes': ['Detail color', 'Color de los detalles', 'Colore dei dettagli', 'Couleur des détails'],
    'blusa, camiseta ou vestido': ['top, T-shirt or dress', 'blusa, camiseta o vestido', 'top, maglietta o vestito', 'haut, t-shirt ou robe'],
    'calça, short ou saia': ['pants, shorts or skirt', 'pantalón, short o falda', 'pantaloni, pantaloncini o gonna', 'pantalon, short ou jupe'],
    'gola, barra, listras': ['collar, hem, stripes', 'cuello, dobladillo, rayas', 'colletto, orlo, righe', 'col, ourlet, rayures'],
    'Roupa': ['Outfit', 'Ropa', 'Vestito', 'Tenue'],
    'Cores': ['Colors', 'Colores', 'Colori', 'Couleurs'],
    'Pronto': ['Done', 'Listo', 'Fatto', 'Prêt'],
    'Voltar': ['Back', 'Volver', 'Indietro', 'Retour'],
    'Pijama': ['Pajamas', 'Pijama', 'Pigiama', 'Pyjama'],
    // guarda-roupa masculino
    'Camiseta e bermuda': ['T-shirt and bermuda shorts', 'Camiseta y bermudas', 'Maglietta e bermuda', 'T-shirt et bermuda'],
    'Camiseta e calça jeans': ['T-shirt and jeans', 'Camiseta y jeans', 'Maglietta e jeans', 'T-shirt et jean'],
    'Moletom com capuz': ['Hoodie', 'Sudadera con capucha', 'Felpa con cappuccio', 'Sweat à capuche'],
    'Polo e bermuda': ['Polo and bermuda shorts', 'Polo y bermudas', 'Polo e bermuda', 'Polo et bermuda'],
    'Camiseta de barra colorida': ['Color-trimmed T-shirt', 'Camiseta con borde de color', 'Maglietta con bordo colorato', 'T-shirt à bordure colorée'],
    'Jaqueta e calça': ['Jacket and pants', 'Chaqueta y pantalón', 'Giacca e pantaloni', 'Veste et pantalon'],
    'Camisa social e calça': ['Dress shirt and pants', 'Camisa de vestir y pantalón', 'Camicia elegante e pantaloni', 'Chemise et pantalon'],
    'Camisa de time e short': ['Team jersey and shorts', 'Camiseta de equipo y short', 'Maglia da squadra e pantaloncini', "Maillot d'équipe et short"],
    'Agasalho esportivo': ['Tracksuit', 'Equipo deportivo', 'Tuta sportiva', 'Survêtement'],
    'Camiseta e short curto': ['T-shirt and short shorts', 'Camiseta y short corto', 'Maglietta e pantaloncini corti', 'T-shirt et short court'],
    'Camiseta de manga longa': ['Long-sleeve T-shirt', 'Camiseta de manga larga', 'Maglietta a maniche lunghe', 'T-shirt à manches longues'],
    'Moletom e bermuda': ['Sweatshirt and bermuda shorts', 'Sudadera y bermudas', 'Felpa e bermuda', 'Sweat et bermuda'],
    'Camiseta e jeans escuro': ['T-shirt and dark jeans', 'Camiseta y jeans oscuros', 'Maglietta e jeans scuri', 'T-shirt et jean foncé'],
    'Camiseta larga e bermuda': ['Baggy T-shirt and bermuda shorts', 'Camiseta holgada y bermudas', 'Maglietta larga e bermuda', 'T-shirt ample et bermuda'],
    'Camisa social e bermuda': ['Dress shirt and bermuda shorts', 'Camisa de vestir y bermudas', 'Camicia elegante e bermuda', 'Chemise et bermuda'],
    // guarda-roupa feminino
    'Camiseta e short': ['T-shirt and shorts', 'Camiseta y short', 'Maglietta e pantaloncini', 'T-shirt et short'],
    'Vestido simples': ['Simple dress', 'Vestido sencillo', 'Vestito semplice', 'Robe simple'],
    'Saia e camiseta': ['Skirt and T-shirt', 'Falda y camiseta', 'Gonna e maglietta', 'Jupe et T-shirt'],
    'Moletom e legging': ['Sweatshirt and leggings', 'Sudadera y leggings', 'Felpa e leggings', 'Sweat et legging'],
    'Vestido com barra': ['Dress with trim', 'Vestido con ribete', 'Vestito con bordo', 'Robe à bordure'],
    'Jaqueta e saia': ['Jacket and skirt', 'Chaqueta y falda', 'Giacca e gonna', 'Veste et jupe'],
    'Blusa de manga longa e calça': ['Long-sleeve top and pants', 'Blusa de manga larga y pantalón', 'Top a maniche lunghe e pantaloni', 'Haut à manches longues et pantalon'],
    'Camisa social e saia': ['Dress shirt and skirt', 'Camisa de vestir y falda', 'Camicia elegante e gonna', 'Chemise et jupe'],
    'Polo e short': ['Polo and shorts', 'Polo y short', 'Polo e pantaloncini', 'Polo et short'],
    'Jardineira': ['Overalls', 'Overol', 'Salopette', 'Salopette'],
    'Vestido de manga longa': ['Long-sleeve dress', 'Vestido de manga larga', 'Vestito a maniche lunghe', 'Robe à manches longues'],
    'Blusa e saia longa': ['Top and long skirt', 'Blusa y falda larga', 'Top e gonna lunga', 'Haut et jupe longue'],
    // computador / LoggedOn
    '{0} respondeu à sua candidatura': ['{0} replied to your application', '{0} respondió a tu solicitud', '{0} ha risposto alla tua candidatura', '{0} a répondu à votre candidature'],
    'Nova aba': ['New tab', 'Nueva pestaña', 'Nuova scheda', 'Nouvel onglet'],
    'Buscar vagas, empresas e pessoas': ['Search jobs, companies and people', 'Buscar empleos, empresas y personas', 'Cerca lavori, aziende e persone', 'Rechercher des offres, des entreprises et des personnes'],
    'Notificações': ['Notifications', 'Notificaciones', 'Notifiche', 'Notifications'],
    'Navegador': ['Browser', 'Navegador', 'Browser', 'Navigateur'],
    'Arquivos': ['Files', 'Archivos', 'File', 'Fichiers'],
    'Jogos': ['Games', 'Juegos', 'Giochi', 'Jeux'],
    'Pesquisar na internet...': ['Search the internet...', 'Buscar en internet...', 'Cerca su internet...', 'Rechercher sur internet...'],
    'Notícias': ['News', 'Noticias', 'Notizie', 'Actualités'],
    'Vídeos': ['Videos', 'Videos', 'Video', 'Vidéos'],
    'Futebol': ['Football', 'Fútbol', 'Calcio', 'Football'],
    'Carregando...': ['Loading...', 'Cargando...', 'Caricamento...', 'Chargement...'],
    'Olá, {0}!': ['Hello, {0}!', '¡Hola, {0}!', 'Ciao, {0}!', 'Bonjour, {0} !'],
    'Você tem 3 notificações novas: empresas responderam às suas candidaturas.': ['You have 3 new notifications: companies replied to your applications.', 'Tienes 3 notificaciones nuevas: las empresas respondieron a tus solicitudes.', 'Hai 3 nuove notifiche: le aziende hanno risposto alle tue candidature.', 'Vous avez 3 nouvelles notifications : des entreprises ont répondu à vos candidatures.'],
    'Ver notificações': ['See notifications', 'Ver notificaciones', 'Vedi le notifiche', 'Voir les notifications'],
    'Suas candidaturas': ['Your applications', 'Tus solicitudes', 'Le tue candidature', 'Vos candidatures'],
    '3 enviadas · 3 respostas': ['3 sent · 3 replies', '3 enviadas · 3 respuestas', '3 inviate · 3 risposte', '3 envoyées · 3 réponses'],
    'escolha UMA vaga para aceitar': ['choose ONE job to accept', 'elige UN empleo para aceptar', 'scegli UN lavoro da accettare', 'choisissez UNE offre à accepter'],
    'Aceitar esta vaga': ['Accept this job', 'Aceptar este empleo', 'Accetta questo lavoro', 'Accepter cette offre'],
    'Aceitar esta vaga?': ['Accept this job?', '¿Aceptar este empleo?', 'Accettare questo lavoro?', 'Accepter cette offre ?'],
    'Você só pode aceitar uma vaga.': ['You can only accept one job.', 'Solo puedes aceptar un empleo.', 'Puoi accettare un solo lavoro.', 'Vous ne pouvez accepter qu\'une seule offre.'],
    'Sim, aceitar': ['Yes, accept', 'Sí, aceptar', 'Sì, accetta', 'Oui, accepter'],
    'Vaga aceita!': ['Job accepted!', '¡Empleo aceptado!', 'Lavoro accettato!', 'Offre acceptée !'],
    'A empresa vai entrar em contato com você.': ['The company will contact you.', 'La empresa se pondrá en contacto contigo.', "L'azienda ti contatterà.", "L'entreprise va vous contacter."],
    'Fechar o computador': ['Close the computer', 'Cerrar la computadora', 'Chiudere il computer', "Fermer l'ordinateur"],
    'Sair do computador': ['Leave the computer', 'Dejar la computadora', 'Lasciare il computer', "Quitter l'ordinateur"],
    'Agora não... eu preciso ver as candidaturas.': ['Not now... I need to check the applications.', 'Ahora no... necesito ver las solicitudes.', 'Ora no... devo vedere le candidature.', 'Pas maintenant... je dois voir les candidatures.'],
    'Tranquilo': ['Easygoing', 'Tranquilo', 'Tranquillo', 'Tranquille'],
    'Você escolheu um emprego': ['You chose a job', 'Elegiste un empleo', 'Hai scelto un lavoro', 'Vous avez choisi un emploi'],
    // vagas
    'Mercadinho Bom Preço': ['Bom Preço Minimarket', 'Minimercado Bom Preço', 'Minimarket Bom Preço', 'Supérette Bom Preço'],
    'Café da Esquina': ['Corner Café', 'Café de la Esquina', "Caffè all'Angolo", 'Café du Coin'],
    'Pizzaria Forno a Lenha': ['Wood-Fired Oven Pizzeria', 'Pizzería Horno de Leña', 'Pizzeria Forno a Legna', 'Pizzeria au Feu de Bois'],
    'Mercado - Reposição e Limpeza': ['Market - Restocking and Cleaning', 'Mercado - Reposición y Limpieza', 'Mercato - Rifornimento e Pulizia', 'Marché - Réapprovisionnement et Nettoyage'],
    'Cafeteria - Atendente': ['Café - Attendant', 'Cafetería - Atención al cliente', 'Caffetteria - Addetto al banco', 'Café - Serveur'],
    'Entregador - Pizzaria': ['Delivery Rider - Pizzeria', 'Repartidor - Pizzería', 'Fattorino - Pizzeria', 'Livreur - Pizzeria'],
    'Repor as prateleiras, organizar o estoque e manter o salão limpo.': ['Restock the shelves, organize the stockroom and keep the floor clean.', 'Reponer los estantes, organizar el almacén y mantener el salón limpio.', 'Rifornire gli scaffali, organizzare il magazzino e tenere pulito il negozio.', 'Réapprovisionner les rayons, ranger le stock et garder la salle propre.'],
    'Atender os clientes no balcão, anotar os pedidos e servir as mesas.': ['Serve customers at the counter, take orders and wait the tables.', 'Atender a los clientes en el mostrador, anotar pedidos y servir las mesas.', 'Servire i clienti al banco, prendere le ordinazioni e servire ai tavoli.', 'Servir les clients au comptoir, prendre les commandes et servir les tables.'],
    'Levar as pizzas quentinhas para as casas do bairro, de bicicleta.': ['Take hot pizzas to homes around the neighborhood, by bicycle.', 'Llevar pizzas calientes a las casas del barrio, en bicicleta.', 'Portare le pizze calde alle case del quartiere, in bicicletta.', 'Livrer des pizzas chaudes dans le quartier, à vélo.'],
    'Meio período · perto de casa': ['Part-time · close to home', 'Medio tiempo · cerca de casa', 'Part-time · vicino a casa', 'Mi-temps · près de chez soi'],
    'Meio período · ambiente tranquilo': ['Part-time · relaxed atmosphere', 'Medio tiempo · ambiente tranquilo', 'Part-time · ambiente tranquillo', 'Mi-temps · ambiance tranquille'],
    'Meio período · à noite': ['Part-time · evenings', 'Medio tiempo · por la noche', 'Part-time · la sera', 'Mi-temps · le soir'],
    // casa / vizinho / banheiro
    'Eu não preciso tomar banho agora.': ['I do not need a shower right now.', 'No necesito bañarme ahora.', 'Non ho bisogno di fare la doccia adesso.', "Je n'ai pas besoin de prendre une douche maintenant."],
    'Antes de sair, eu preciso ver as candidaturas no computador.': ['Before leaving, I need to check the applications on the computer.', 'Antes de salir, necesito ver las solicitudes en la computadora.', 'Prima di uscire, devo vedere le candidature al computer.', "Avant de sortir, je dois voir les candidatures sur l'ordinateur."],
    'Eu não vou sair de pijama... Preciso me trocar.': ['I am not going out in pajamas... I need to change.', 'No voy a salir en pijama... Tengo que cambiarme.', 'Non esco in pigiama... Devo cambiarmi.', 'Je ne sors pas en pyjama... Je dois me changer.'],
    'Nossa... que fome!': ['Wow... I am so hungry!', 'Uf... ¡qué hambre!', 'Accidenti... che fame!', "Oh là là... j'ai trop faim !"],
    'Talvez eu devesse dar uma volta pela cidadezinha e ver o que encontro por aí.': ['Maybe I should take a walk around the little town and see what I find.', 'Quizás debería dar una vuelta por el pueblito y ver qué encuentro.', 'Forse dovrei fare un giro per il paesino e vedere cosa trovo.', 'Je devrais peut-être faire un tour dans la petite ville et voir ce que je trouve.'],
    'O que você vai fazer?': ['What are you going to do?', '¿Qué vas a hacer?', 'Cosa farai?', 'Que vas-tu faire ?'],
    'Pedir um cigarro': ['Ask for a cigarette', 'Pedir un cigarrillo', 'Chiedere una sigaretta', 'Demander une cigarette'],
    'Pedir para ir fumar em outro lugar': ['Ask him to smoke somewhere else', 'Pedirle que fume en otro lugar', 'Chiedergli di fumare altrove', 'Lui demander de fumer ailleurs'],
    'Perguntar sobre um lugar para comer': ['Ask about a place to eat', 'Preguntar por un lugar para comer', 'Chiedere di un posto dove mangiare', 'Demander où manger'],
    'Deixar para lá': ['Never mind', 'Dejarlo así', 'Lasciar perdere', 'Laisser tomber'],
    'Moço, você me dá um cigarro?': ['Mister, can you give me a cigarette?', 'Señor, ¿me da un cigarrillo?', 'Signore, mi dà una sigaretta?', 'Monsieur, vous me donnez une cigarette ?'],
    'Cigarro?! Você é de menor, nem devia pensar nisso!': ['A cigarette?! You are underage, you should not even think about it!', '¡¿Un cigarrillo?! ¡Eres menor de edad, ni deberías pensarlo!', 'Una sigaretta?! Sei minorenne, non dovresti nemmeno pensarci!', 'Une cigarette ?! Tu es mineur, tu ne devrais même pas y penser !'],
    'Eu mesmo odeio esse vício... ele vicia demais. Lembre-se disso quando for mais velho.': ['I hate this habit myself... it is so addictive. Remember that when you are older.', 'Yo mismo odio este vicio... engancha demasiado. Acuérdate de esto cuando seas mayor.', "Io stesso odio questo vizio... crea troppa dipendenza. Ricordatelo quando sarai più grande.", "Moi-même, je déteste ce vice... il rend trop dépendant. Souviens-toi de ça quand tu seras plus grand."],
    'Moço, dá para fumar em outro lugar? A fumaça fica subindo pela escada...': ['Mister, could you smoke somewhere else? The smoke keeps going up the stairs...', 'Señor, ¿podría fumar en otro lugar? El humo sube por la escalera...', 'Signore, potrebbe fumare altrove? Il fumo sale per le scale...', "Monsieur, vous pourriez fumer ailleurs ? La fumée monte dans l'escalier..."],
    'Tsc... eu não posso nem fumar em paz nesse prédio?!': ['Tsk... can I not even smoke in peace in this building?!', 'Tsk... ¡¿ni siquiera puedo fumar en paz en este edificio?!', 'Tsk... non posso nemmeno fumare in pace in questo palazzo?!', "Tss... je ne peux même pas fumer en paix dans cet immeuble ?!"],
    'Que saco! Dá licença, vou fumar lá dentro!': ['What a pain! Excuse me, I will smoke inside!', '¡Qué fastidio! Con permiso, ¡voy a fumar adentro!', 'Che seccatura! Permesso, vado a fumare dentro!', "Quelle barbe ! Excusez-moi, je vais fumer à l'intérieur !"],
    'Eita... ele ficou bravo.': ['Whoa... he got angry.', 'Vaya... se enojó.', 'Accidenti... si è arrabbiato.', 'Ouh là... il s\'est fâché.'],
    'Moço, você sabe onde tem um lugar para comer por aqui?': ['Mister, do you know where there is a place to eat around here?', 'Señor, ¿sabe dónde hay un lugar para comer por aquí?', 'Signore, sa dove si può mangiare qui vicino?', "Monsieur, vous savez où on peut manger par ici ?"],
    'Hm? Ah, vai na lanchonete do seu Valdemar, é pertinho daqui.': ["Hm? Ah, go to Mr. Valdemar's snack bar, it is very close.", 'Mm? Ah, ve a la lonchería de don Valdemar, está muy cerca.', 'Hm? Ah, vai al chiosco di Valdemar, è vicinissimo.', "Hm ? Ah, va au snack de monsieur Valdemar, c'est tout près."],
    'O podrão de lá é divino!': ['The "podrão" there is divine!', '¡El "podrão" de allí es divino!', 'Il "podrão" di lì è divino!', 'Le « podrão » de là-bas est divin !'],
    'Podrão? Vou lá conferir. Valeu!': ['"Podrão"? I will go check it out. Thanks!', '¿"Podrão"? Voy a probarlo. ¡Gracias!', '"Podrão"? Vado a vedere. Grazie!', '« Podrão » ? Je vais voir ça. Merci !'],
    'Continua...': ['To be continued...', 'Continuará...', 'Continua...', 'À suivre...'],
  };
  for (const k of Object.keys(TRAD_F2)) if (!I18N[k]) I18N[k] = TRAD_F2[k];
  // Variantes FEMININAS (it/fr; null = igual): só as falas do jogador ou ditas a ele que mudam de gênero nesses idiomas.
  const TRAD_F2_F = {
    'Eu não cheguei onde eu estou só por causa dessa partida...': [null, null, 'Non sono arrivata dove sono solo per quella partita...', "Je ne suis pas arrivée là où j'en suis seulement à cause de ce match..."],
    'Quando eu tinha {0} anos, eu já precisava ser independente...': [null, null, null, "Quand j'avais {0} ans, je devais déjà être indépendante..."],
    'Cigarro?! Você é de menor, nem devia pensar nisso!': [null, null, null, 'Une cigarette ?! Tu es mineure, tu ne devrais même pas y penser !'],
    'Eu mesmo odeio esse vício... ele vicia demais. Lembre-se disso quando for mais velho.': [null, null, null, "Moi-même, je déteste ce vice... il rend trop dépendant. Souviens-toi de ça quand tu seras plus grande."],
  };
  // T com variante feminina (só quando o personagem é feminino e o idioma não é o português).
  const Tj = (chave) => {
    if (PERSONAGEM.genero === 'F' && Idioma.atual !== 'pt') { const x = TRAD_F2_F[chave]; const v = x && x[_IDX[Idioma.atual]]; if (v) return v; }
    return T(chave);
  };
  const Tjf = (chave, ...a) => Tj(chave).replace(/\{(\d+)\}/g, (m, n) => (a[n] != null ? a[n] : m));
  const vozJog = () => (typeof PERSONAGEM.voz === 'number' ? PERSONAGEM.voz : 2);

  function gravarSlot(d) {                                       // espaço do CARREGAR: reaproveita o autosave desta história, senão o primeiro vazio, senão o mais antigo
    const F = window.FutebolJS; if (!F || !F.salvarJogo || !F.listarSaves) return;
    const lista = F.listarSaves(); let slot = (F.slotHistoria && F.slotHistoria()) || (lista.findIndex((s) => s && s.autosave) + 1);   // (4.7.3) o espaço escolhido ao começar a história vem primeiro
    if (!slot) slot = lista.findIndex((s) => !s) + 1;
    if (!slot) { let velho = Infinity; slot = 1; lista.forEach((s, i) => { const t = s && s.data ? Date.parse(s.data) || 0 : 0; if (t < velho) { velho = t; slot = i + 1; } }); }
    const per = JSON.parse(JSON.stringify(PERSONAGEM)); delete per.historia;
    F.salvarJogo(slot, { nome: nomeJog(), resumo: Tf('Modo história · Fase 2 · {0}', T(NOME_PONTO[d.ponto] || d.ponto)), fase: 'fase2', ponto: d.ponto, autosave: true, historia: API.historia.tudo(), personagem: per, versao: API.versao });
  }
  function gravar(ponto) {
    const d = S.dados; d.ponto = ponto;
    try { API.historia.gravar('fase2', JSON.parse(JSON.stringify(d))); } catch (e) { console.warn('[Fase 2] save da história:', e); }
    try { gravarSlot(d); } catch (e) { console.warn('[Fase 2] save do CARREGAR:', e); }
  }

  // ------------------------------------------------------------------ mundo, luz e câmera
  function prepararMundo() {
    const M = S.mundo = { bg: scene.background, fogN: scene.fog ? scene.fog.near : 0, fogF: scene.fog ? scene.fog.far : 0, vis: [], luz: [], gancho: GANCHO_RENDER };
    scene.background = new THREE.Color(0x000000);
    if (scene.fog) { scene.fog.near = 1e5; scene.fog.far = 2e5; }
    for (const c of scene.children) { if (c.isLight) M.luz.push([c, c.intensity]); else { M.vis.push([c, c.visible]); c.visible = false; } }
  }
  function restaurarMundo() {
    const M = S.mundo; if (!M) return;
    scene.background = M.bg; if (scene.fog) { scene.fog.near = M.fogN; scene.fog.far = M.fogF; }
    for (const [c, v] of M.vis) c.visible = v;
    for (const [l, i] of M.luz) l.intensity = i;
  }
  function brilho(k) {                                           // k: 1 = luz acesa · perto de 0 = quarto no escuro
    S.k = k; for (const [l, i] of S.mundo.luz) l.intensity = i * k;
    for (const m of (S.quarto.mats || [])) m.color.copy(m.userData.c0).multiplyScalar(k);
    if (S.quarto.tela) S.quarto.tela.material.color.setHex(k > 0.5 ? 0x6fb4ff : 0x0b0f16);
  }
  const esconderBola = () => { try { ball.mesh.visible = ball.shadow.visible = false; userRing.visible = false; targetRing.visible = false; dribbleRing.visible = false; aimArrow.visible = false; } catch (e) { /* sem bola */ } };
  function camAlvo() {
    if (S.camEspecial) return S.camEspecial;
    if (S.lugar === 'quarto') return Q_CAM; if (S.lugar === 'banheiro') return B_CAM;
    return camEscada(S.jog);
  }
  function atualizarMapa() {
    const C = S.cam; let fx = C.tx - C.px, fz = C.tz - C.pz; const d = Math.hypot(fx, fz) || 1; S.mapa = { fx: fx / d, fz: fz / d };
  }
  function entrada() {
    const j = UI.joy, t = UI.teclas; let ix = j.x, iy = j.y;
    if (t.ArrowLeft || t.KeyA) ix -= 1; if (t.ArrowRight || t.KeyD) ix += 1; if (t.ArrowUp || t.KeyW) iy -= 1; if (t.ArrowDown || t.KeyS) iy += 1;
    const m = Math.hypot(ix, iy); if (m > 1) { ix /= m; iy /= m; }
    return { ix, iy, m: Math.min(1, m) };
  }
  function livre(x, z, A) {
    if (S.lugar === 'quarto') {
      if (x < -Q.W / 2 + 0.3 || x > Q.W / 2 - 0.3 || z < -Q.D / 2 + 0.35 || z > 2.4) return false;
      for (const r of Q_RETS) if (dentro(x, z, r, 0.22)) return false;
      return true;
    }
    if (S.lugar === 'banheiro') {
      if (x < -1.9 || x > 1.9 || z < -1.95 || z > 2.0) return false;
      for (const r of B_RETS) if (dentro(x, z, r, 0.22)) return false;
      return true;
    }
    const m = Math.max(Math.abs(x), Math.abs(z)); if (m < IN + 0.32 || m > OUT - 0.32) return false;
    const z1 = zonaEsc(A.x, A.z), z2 = zonaEsc(x, z);
    if (z1 === 'NW' && z2 === 'W' && A.y > 2.8) return false;                 // no andar de cima, o canto NW não desce direto para o lance W (é o vão)
    if (z1 === 'NW' && z2 === 'N' && A.y <= 2.8) return false;                // no térreo, o lance N é parede (armário de medidores)
    if (S.viz && !S.viz.oculto && Math.hypot(x - S.viz.x, z - S.viz.z) < 0.55 && Math.hypot(A.x - S.viz.x, A.z - S.viz.z) >= 0.55) return false;
    return true;
  }
  function mover(dt) {
    const J = S.jog, e = entrada();
    if (e.m < 0.12) { atualizarMapa(); J.livreAndando = false; return; }
    const M = S.mapa || { fx: 0, fz: -1 };
    const dx = M.fx * -e.iy - M.fz * e.ix, dz = M.fz * -e.iy + M.fx * e.ix, sp = 2.15 * dt;
    let moveu = false;
    if (livre(J.x + dx * sp, J.z, J)) { J.x += dx * sp; moveu = true; }
    if (livre(J.x, J.z + dz * sp, J)) { J.z += dz * sp; moveu = true; }
    J.livreAndando = moveu; J.vel = 2.15 * Math.max(0.5, e.m);
    const d = Math.hypot(dx, dz) || 1; J.yawAlvo = Math.atan2(-dz, dx); S.face = { x: dx / d, z: dz / d };
  }

  // ------------------------------------------------------------------ interações
  function alvos() {
    const L = S.lugar, D = S.dados, J = S.jog, v = [];
    if (L === 'quarto') {
      if (S.escuro) return [{ id: 'luz', x: Q.luz.spot[0], z: Q.luz.spot[1], r: 1.25, alt: 1.9, txt: T('Interruptor'), fn: ligarLuz }];
      v.push({ id: 'guarda', x: Q.guarda.spot[0], z: Q.guarda.spot[1], r: 1.0, alt: 2.5, txt: T('Guarda-roupa'), fn: abrirGuardaRoupa });
      v.push({ id: 'pc', x: 2.4, z: -1.15, r: 0.95, alt: 1.9, txt: T('Computador'), fn: usarPc });
      v.push({ id: 'banh', x: Q.pBanheiro.spot[0], z: Q.pBanheiro.spot[1], r: 0.9, alt: 2.5, txt: T('Banheiro'), fn: irBanheiro });
      v.push({ id: 'saida', x: Q.pSaida.spot[0], z: Q.pSaida.spot[1], r: 0.9, alt: 2.5, txt: T('Sair do quarto'), fn: sairQuarto });
    } else if (L === 'banheiro') {
      v.push({ id: 'vaso', x: B.vaso.spot[0], z: B.vaso.spot[1], r: 0.95, alt: 1.5, txt: T('Vaso sanitário'), fn: usarVaso });
      v.push({ id: 'pia', x: B.pia.spot[0], z: B.pia.spot[1], r: 0.9, alt: 1.5, txt: T('Pia'), fn: usarPia });
      v.push({ id: 'chuveiro', x: B.chuveiro.spot[0], z: B.chuveiro.spot[1], r: 0.95, alt: 2.4, txt: T('Chuveiro'), fn: usarChuveiro });
      v.push({ id: 'porta', x: B.porta.spot[0], z: B.porta.spot[1], r: 0.85, alt: 2.5, txt: T('Voltar ao quarto'), fn: voltarDoBanheiro });
    } else {
      if (S.viz && !S.viz.oculto) v.push({ id: 'viz', x: S.viz.x, z: S.viz.z, r: 1.55, alt: 2.5, txt: T('Conversar com o vizinho'), fn: conversarViz });
      if (J.y > 5) v.push({ id: 'minha', x: -4.35, z: -MID, r: 0.9, alt: 2.6, txt: T('Entrar no apartamento'), fn: voltarAoQuarto });
      if (J.y < 1 && zonaEsc(J.x, J.z) === 'NW') v.push({ id: 'rua', x: -MID, z: -4.3, r: 1.2, alt: 2.7, txt: T('Sair do prédio'), fn: sairDoPredio });
    }
    return v;
  }
  function alvoAtual() {
    if (!S || S.modo !== 'livre') return null;
    const J = S.jog; let best = null, bs = 1e9;
    for (const a of alvos()) { const d = Math.hypot(a.x - J.x, a.z - J.z); if (d > a.r) continue; const s = d - 0.4 * ((a.x - J.x) * S.face.x + (a.z - J.z) * S.face.z) / (d || 1); if (s < bs) { bs = s; best = a; } }
    return best;
  }
  async function interagir() {
    if (performance.now() < (S.bloq || 0)) return;
    const a = alvoAtual(); if (!a) return;
    somClique(); S.modo = 'cena'; UI.ctl.hidden = true; aviso('');
    try { await a.fn(a); } catch (e) { console.error(e); }
    if (S && S.ativo && !S.fimDaFase && S.modo === 'cena') liberar();
  }
  function liberar() { S.modo = 'livre'; UI.ctl.hidden = false; S.bloq = performance.now() + 350; S.jog.pose = 'pe'; S.jog.rota = null; S.camEspecial = null; }

  // ------------------------------------------------------------------ cena: falas e movimentos
  const olhar = (A, x, z) => { A.yawAlvo = Math.atan2(-(z - A.z), x - A.x); };
  const andar = (A, pts, vel) => new Promise((ok) => { A.vel = vel || 1.9; A.rota = pts.map((p) => ({ x: p[0] != null ? p[0] : p.x, z: p[1] != null ? p[1] : p.z })); A.rotaRes = ok; });
  async function fala(quem, texto) {
    const A = quem === 'jog' ? S.jog : quem === 'viz' ? S.viz : null;
    if (A) A.fala = true;
    await Dialogo.mostrar([texto], { nome: quem === 'jog' ? nomeJog() : quem === 'viz' ? T('Vizinho') : '', voz: quem === 'viz' ? 4 : vozJog(), manter: true });
    if (A) A.fala = false;
  }
  async function dizer(...ls) { for (const [q, t] of ls) await fala(q, t); Dialogo.esconder(); }
  function mudarLugar(l, x, z, yaw, y) {
    S.lugar = l; S.palco.position.x = OX + OFFS[l];
    S.quarto.g.visible = l === 'quarto'; S.banh.g.visible = l === 'banheiro'; S.esc.g.visible = l === 'escada';
    const J = S.jog; J.x = x; J.z = z; J.rota = null; J.yaw = J.yawAlvo = yaw; J.pose = 'pe'; J.ySnap = true; J.y = y || 0;
    if (camera.fov !== (l === 'escada' ? 64 : 52)) { camera.fov = l === 'escada' ? 64 : 52; camera.updateProjectionMatrix(); }
    S.altura = l === 'escada' ? alturaEsc : () => 0; S.camSnap = true; S.camEspecial = null; S.mapa = null;
    if (S.viz) { S.viz.oculto = l !== 'escada' || S.viz.sumiu; if (S.viz.blob) S.viz.blob.visible = !S.viz.oculto; }
    brilho(l === 'quarto' && S.escuro ? 0.1 : 1);
  }
  async function trocarLugar(l, x, z, yaw, y) { await preto(true, 450); mudarLugar(l, x, z, yaw, y); await esperar(120); await preto(false, 450); }

  // ----- acender a luz
  async function ligarLuz() {
    const J = S.jog;
    await andar(J, [[Q.luz.spot[0], Q.luz.spot[1]]], 1.9); J.yawAlvo = Math.PI / 2; await esperar(250);
    J.pose = 'liga'; await esperar(450);
    somClique(); S.escuro = false; S.dados.luz = true;
    for (const k of [0.5, 0.1, 0.8, 0.4]) { brilho(k); await esperar(70); }
    S.brilhoAlvo = 1; brilho(1); await esperar(500);
    J.pose = 'pe'; olhar(J, 2.4, -2.5);
    Musica.tocar('jazz');
    missao(T('Missão: veja o computador.'));
    await dizer(['jog', T('Eu preciso ver se alguém respondeu as minhas candidaturas de emprego no LoggedOn')]);
  }

  // ----- guarda-roupa
  function abrirGuardaRoupa() {
    return new Promise(async (fim) => {
      const J = S.jog, lista = ROUPAS[S.fem ? 'F' : 'M'], R0 = S.dados.roupa;
      await andar(J, [[Q.guarda.spot[0], -0.95]], 2.3); J.yawAlvo = -Math.PI / 2; await esperar(250);
      S.camEspecial = [0.85, 1.25, 2.5, 0.85, 1.0, -1.0]; S.modo = 'roupa'; UI.ctl.hidden = true; aviso('');
      let idx = R0 ? R0.id : -1, cores = R0 ? c4(R0.cores) : c4(PIJAMA[S.fem ? 'F' : 'M'].c);
      const nomeDe = (i) => (i < 0 ? PIJAMA[S.fem ? 'F' : 'M'].n : lista[i].n);
      const rot = [T('Cor principal'), T('Cor secundária'), T('Cor dos detalhes'), T('Cor da borda do emblema')], dica = [T('blusa, camiseta ou vestido'), T('calça, short ou saia'), T('gola, barra, listras'), T('o quadradinho ou escudo do peito')];
      const aplicar = () => { const R = idx < 0 ? PIJAMA[S.fem ? 'F' : 'M'] : lista[idx]; vestirRoupa(J, R, cores); S.dados.roupa = { id: idx, cores: cores.slice() }; };
      let aba = 'roupa';
      const render = () => {
        const bt = [-1].concat(lista.map((_, i) => i)).map((i) => '<button type="button" class="pxBtn' + (i === idx ? ' on' : '') + '" data-r="' + i + '">' + esc(T(nomeDe(i))) + '</button>').join('');
        const sw = (n) => '<p class="rSec">' + esc(rot[n]) + ' <small>(' + esc(dica[n]) + ')</small></p><div class="rCores">' + PAL.map((h) => '<button type="button" class="rCor' + (cores[n].toLowerCase() === h ? ' on' : '') + '" data-c="' + n + '" data-v="' + h + '" style="background:' + h + '" aria-label="' + h + '"></button>').join('') + '</div>';
        const corpo = aba === 'roupa' ? '<div class="rGrade">' + bt + '</div>' : sw(0) + sw(1) + sw(2) + sw(3);
        UI.roupa.innerHTML = '<p class="rTit">' + esc(T('Guarda-roupa')) + '</p><div class="rAbas"><button type="button" class="pxBtn' + (aba === 'roupa' ? ' on' : '') + '" data-aba="roupa">' + esc(T('Roupa')) + '</button><button type="button" class="pxBtn' + (aba === 'cores' ? ' on' : '') + '" data-aba="cores">' + esc(T('Cores')) + '</button></div><div class="rCorpo">' + corpo + '</div><div class="rFim"><button type="button" class="pxBtn pxPrim" data-fim="1">' + esc(T('Pronto')) + '</button></div>';
      };
      UI.roupa.hidden = false; render();
      UI.roupa.onclick = (e) => {
        const b = e.target.closest('button'); if (!b) return; somClique();
        if (b.dataset.aba) { aba = b.dataset.aba; render(); return; }
        if (b.dataset.fim) { UI.roupa.hidden = true; UI.roupa.onclick = null; S.camEspecial = null; S.modo = 'cena'; fim(); return; }
        if (b.dataset.r != null) { idx = Number(b.dataset.r); cores = c4((idx < 0 ? PIJAMA[S.fem ? 'F' : 'M'] : lista[idx]).c); }
        else if (b.dataset.c != null) cores[Number(b.dataset.c)] = b.dataset.v;
        aplicar(); render();
      };
      aplicar(); S.jog.yawAlvo = -Math.PI / 2;
    });
  }

  // ----- computador, navegador e o site LoggedOn
  function abrirPc() {
    return new Promise((fim) => {
      const el = UI.pc, D = S.dados; el.hidden = false; S.modo = 'pc';
      let etapa = 'desktop', sel = null, msg = '', fechou = false;
      const hora = () => { const d = new Date(); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
      const sair = (r) => { if (fechou) return; fechou = true; el.hidden = true; el.onclick = null; fim(r); };
      const vagaPorId = (id) => VAGAS.find((v) => v.id === id);
      const cardVaga = (v, botao) => '<button type="button" class="loCard loVaga" data-a="vaga" data-v="' + v.id + '"><span class="loIco">' + v.ico + '</span><span><h4>' + esc(T(v.titulo)) + '</h4><p>' + esc(Tf('{0} respondeu à sua candidatura', T(v.emp))) + '</p><small>' + esc(T(v.info)) + '</small></span></button>';
      const janela = (url, corpo) => '<div class="pcJanela"><div class="pcAbas"><div class="pcAba">' + esc(url === 'buscador.net' ? T('Nova aba') : 'LoggedOn') + '</div></div><div class="pcUrl"><div>' + esc(url) + '</div></div><div class="pcPag">' + corpo + '</div></div>';
      const topoLo = (sino) => '<div class="loTopo"><span class="loLogo">Logged<i>On</i></span><span class="loBusca">' + esc(T('Buscar vagas, empresas e pessoas')) + '</span>' + (sino ? '<button type="button" class="loSino pulsa" data-a="sino" aria-label="' + esc(T('Notificações')) + '">🔔<b>3</b></button>' : '<span class="loSino">🔔</span>') + '</div>';
      const render = () => {
        let tela = '';
        if (etapa === 'desktop') {
          tela = '<div class="pcIcones"><button type="button" class="pcIcone" data-a="nav"><span>🌐</span>' + esc(T('Navegador')) + '</button><button type="button" class="pcIcone" data-a="outro"><span>📁</span>' + esc(T('Arquivos')) + '</button><button type="button" class="pcIcone" data-a="outro"><span>🎮</span>' + esc(T('Jogos')) + '</button></div><p class="pcMsg" style="position:absolute;left:14px;bottom:10px;color:#ffd98a">' + esc(msg) + '</p>';
        } else if (etapa === 'busca') {
          tela = janela('buscador.net', '<div class="pcBusca"><h3>Buscador</h3><div class="pcCampo">' + esc(T('Pesquisar na internet...')) + '</div><div class="pcFavs"><button type="button" class="pcFav" data-a="lo">💼 LoggedOn</button><button type="button" class="pcFav" data-a="outro">📰 ' + esc(T('Notícias')) + '</button><button type="button" class="pcFav" data-a="outro">▶️ ' + esc(T('Vídeos')) + '</button><button type="button" class="pcFav" data-a="outro">⚽ ' + esc(T('Futebol')) + '</button></div><p class="pcMsg">' + esc(msg) + '</p></div>');
        } else if (etapa === 'carrega') {
          tela = janela('loggedon.com', '<div class="pcCarrega">' + esc(T('Carregando...')) + '</div>');
        } else if (etapa === 'lo') {
          tela = janela('loggedon.com/inicio', topoLo(true) + '<div class="loCorpo"><div class="loCard"><h4>' + esc(Tf('Olá, {0}!', nomeJog())) + '</h4><p>' + esc(T('Você tem 3 notificações novas: empresas responderam às suas candidaturas.')) + '</p><div class="loBtns"><button type="button" class="loBtn" data-a="sino">🔔 ' + esc(T('Ver notificações')) + '</button></div></div><div class="loCard"><p><b>' + esc(T('Suas candidaturas')) + '</b></p><p>' + esc(T('3 enviadas · 3 respostas')) + '</p></div></div>');
        } else if (etapa === 'notifs') {
          tela = janela('loggedon.com/notificacoes', topoLo(false) + '<div class="loCorpo"><p><b>' + esc(T('Notificações')) + '</b> · ' + esc(T('escolha UMA vaga para aceitar')) + '</p>' + VAGAS.map((v) => cardVaga(v)).join('') + '<div class="loBtns"><button type="button" class="loBtn sec" data-a="inicio">' + esc(T('Voltar')) + '</button></div></div>');
        } else if (etapa === 'vaga') {
          const v = vagaPorId(sel);
          tela = janela('loggedon.com/vagas/' + v.id, topoLo(false) + '<div class="loCorpo"><div class="loCard"><span class="loIco">' + v.ico + '</span><h4>' + esc(T(v.titulo)) + '</h4><p><b>' + esc(T(v.emp)) + '</b></p><p>' + esc(T(v.desc)) + '</p><small>' + esc(T(v.info)) + '</small><div class="loBtns"><button type="button" class="loBtn" data-a="aceitar">' + esc(T('Aceitar esta vaga')) + '</button><button type="button" class="loBtn sec" data-a="notifs">' + esc(T('Voltar')) + '</button></div></div></div>');
        } else if (etapa === 'conf') {
          const v = vagaPorId(sel);
          tela = janela('loggedon.com/vagas/' + v.id, topoLo(false) + '<div class="loCorpo"><div class="loCard"><h4>' + esc(T('Aceitar esta vaga?')) + '</h4><p>' + esc(T(v.titulo)) + '</p><p><small>' + esc(T('Você só pode aceitar uma vaga.')) + '</small></p><div class="loBtns"><button type="button" class="loBtn" data-a="sim">' + esc(T('Sim, aceitar')) + '</button><button type="button" class="loBtn sec" data-a="vaga" data-v="' + v.id + '">' + esc(T('Voltar')) + '</button></div></div></div>');
        } else {
          const v = vagaPorId(D.emprego);
          tela = janela('loggedon.com/aceito', topoLo(false) + '<div class="loCorpo"><div class="loCard"><h4>✅ ' + esc(T('Vaga aceita!')) + '</h4><p>' + esc(T(v.titulo)) + ' · ' + esc(T(v.emp)) + '</p><p><small>' + esc(T('A empresa vai entrar em contato com você.')) + '</small></p><div class="loBtns"><button type="button" class="loBtn" data-a="fim">' + esc(T('Fechar o computador')) + '</button></div></div></div>');
        }
        el.innerHTML = '<div class="pcMonitor"><div class="pcTela">' + tela + '<button type="button" class="pcSair" data-a="sair">✕ ' + esc(T('Sair do computador')) + '</button></div><div class="pcBarra"><span>' + esc(T('Computador')) + '</span><span class="pcHora">' + hora() + '</span></div></div>';
      };
      el.onclick = async (e) => {
        const b = e.target.closest('[data-a]'); if (!b || fechou) return; somClique();
        const a = b.dataset.a;
        if (a === 'sair') return sair(null);
        if (a === 'fim') return sair(D.emprego);
        if (a === 'outro') { msg = T('Agora não... eu preciso ver as candidaturas.'); render(); return; }
        if (a === 'nav') { etapa = 'busca'; msg = ''; render(); return; }
        if (a === 'lo') { etapa = 'carrega'; render(); await esperar(1100); if (fechou) return; etapa = D.emprego ? 'feito' : 'lo'; render(); return; }
        if (a === 'sino' || a === 'notifs') { etapa = D.emprego ? 'feito' : 'notifs'; render(); return; }
        if (a === 'inicio') { etapa = 'lo'; render(); return; }
        if (a === 'vaga') { sel = b.dataset.v; etapa = 'vaga'; render(); return; }
        if (a === 'aceitar') { etapa = 'conf'; render(); return; }
        if (a === 'sim') { D.emprego = sel; D.tranquilo += PONTOS_TRANQUILO; etapa = 'feito'; render(); return; }
      };
      render();
    });
  }
  async function usarPc() {
    const J = S.jog, tinha = !!S.dados.emprego;
    await andar(J, [[2.4, -1.5]], 1.8); J.yawAlvo = Math.PI / 2; J.pose = 'sentado'; J.digita = true; J.assento = 0.46; await esperar(500);
    const r = await abrirPc();
    J.digita = false; S.modo = 'cena'; await esperar(300);
    J.pose = 'pe'; await andar(J, [[2.4, -1.15]], 1.8);
    if (r && !tinha) {
      toast('<b>' + esc(T('Tranquilo')) + ' +' + PONTOS_TRANQUILO + '</b>' + esc(T('Você escolheu um emprego')), 2800);
      gravar('emprego');
      await esperar(500); somRonco(); await esperar(2700);
      missao(T('Missão: troque de roupa e saia do quarto.'));
      await dizer(['jog', T('Nossa... que fome!')], ['jog', T('Talvez eu devesse dar uma volta pela cidadezinha e ver o que encontro por aí.')]);
    }
  }

  // ----- banheiro
  async function irBanheiro() {
    const J = S.jog; await andar(J, [[Q.pBanheiro.spot[0], Q.pBanheiro.spot[1]]], 2.0); J.yawAlvo = 0; somPorta(false);
    await trocarLugar('banheiro', -1.55, B.porta.z, 0); S.modo = 'cena';
  }
  async function voltarDoBanheiro() {
    const J = S.jog; await andar(J, [[-1.78, B.porta.z]], 2.0); J.yawAlvo = Math.PI; somPorta(false);
    await trocarLugar('quarto', 3.15, Q.pBanheiro.z, Math.PI);
  }
  async function usarVaso() {
    const J = S.jog;
    await andar(J, [[B.vaso.sent[0], -1.35], [B.vaso.sent[0], B.vaso.sent[1]]], 1.7); J.yawAlvo = -Math.PI / 2; J.pose = 'sentado'; J.digita = false; J.assento = 0.42;
    await esperar(2600); J.pose = 'pe'; await andar(J, [[B.vaso.spot[0], B.vaso.spot[1]]], 1.7); somAgua(2.4, true); J.yawAlvo = Math.PI / 2; await esperar(2400);
  }
  async function usarPia() {
    const J = S.jog;
    await andar(J, [[B.pia.x, -1.4]], 1.8); J.yawAlvo = Math.PI / 2; await esperar(200); J.pose = 'lava'; somAgua(2.6, false); await esperar(2700);
    J.pose = 'pe'; await andar(J, [[B.pia.spot[0], B.pia.spot[1]]], 1.8);
  }
  // ----- o banho (estilo The Sims): corte seco, o personagem só de pele, de costas para a câmera, com a tarja pixelada no meio
  const texTarja = (pele) => drawTexture(6, 6, (g, w, h) => {          // mosaico de pixels grandes em tons de pele e cinza, trocado a cada instante (a "tremida" da tarja)
    const n = hexN(pele);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const f = 0.72 + Math.random() * 0.5, cinza = Math.random() < 0.28 ? 0.55 : 0, v = (c) => Math.max(0, Math.min(255, Math.round(c * f * (1 - cinza) + 140 * cinza)));
      g.fillStyle = 'rgb(' + v((n >> 16) & 255) + ',' + v((n >> 8) & 255) + ',' + v(n & 255) + ')'; g.fillRect(x, y, 1, 1);
    }
  });
  function tarja(A, ligar) {
    if (A.tarja) { if (A.tarja.parent) A.tarja.parent.remove(A.tarja); A.tarja.material.dispose(); A.tarja = null; }
    for (const t of (S.tarjaTex || [])) t.dispose();
    S.tarjaTex = null; if (!ligar) return;
    const ts = S.tarjaTex = [texTarja(A.opt.pele), texTarja(A.opt.pele), texTarja(A.opt.pele)];
    // 2D de verdade: um quadrado (Sprite) que fica SEMPRE virado para a câmera, desenhado por cima de tudo, como a tarja do The Sims
    const mt = new THREE.Sprite(new THREE.SpriteMaterial({ map: ts[0], depthTest: false, depthWrite: false }));
    mt.scale.set(0.52, 0.52, 1); mt.position.set(0, 0.8, 0); mt.renderOrder = 30; A.m.corpo.add(mt); A.tarja = mt; S.tarjaK = 0;
  }
  function aguaTick(dt) {                                        // gotas caindo do chuveiro e vapor subindo
    const W = S.agua; if (!W) return;
    if (W.on) {
      W.acc += dt * 90; while (W.acc >= 1) { W.acc -= 1; const d = new THREE.Mesh(W.geoGota, W.matGota); d.position.set(1.45 + Math.random() * 0.65, 1.92, -1.55 + Math.random() * 0.5); d.userData.v = 3.2 + Math.random() * 1.2; d.userData.vx = 0; W.g.add(d); W.gotas.push(d); }
      W.vac += dt * 5; if (W.vac >= 1 && W.vapor.length < 16) { W.vac = 0; const p = new THREE.Mesh(W.geoVapor, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.22, depthWrite: false })); p.position.set(1.35 + Math.random() * 0.8, 0.5 + Math.random() * 0.4, -1.2 - Math.random() * 0.9); p.userData.t = 0; W.g.add(p); W.vapor.push(p); }
    }
    for (let i = W.gotas.length - 1; i >= 0; i--) { const d = W.gotas[i]; d.position.y -= d.userData.v * dt; d.position.x += d.userData.vx * dt; if (d.position.y < 0.12) { W.g.remove(d); W.gotas.splice(i, 1); } }
    for (let i = W.vapor.length - 1; i >= 0; i--) { const p = W.vapor[i]; p.userData.t += dt; p.position.y += 0.32 * dt; p.scale.setScalar(1 + p.userData.t * 0.9); p.material.opacity = Math.max(0, 0.22 * (1 - p.userData.t / 1.8)); if (p.userData.t > 1.8) { W.g.remove(p); p.material.dispose(); W.vapor.splice(i, 1); } }
    if (S.jog.tarja && S.tarjaTex) { S.tarjaK += dt; if (S.tarjaK > 0.11) { S.tarjaK = 0; S.jog.tarja.material.map = S.tarjaTex[Math.floor(Math.random() * S.tarjaTex.length)]; S.jog.tarja.material.needsUpdate = true; } }
  }
  async function usarChuveiro() {
    const J = S.jog; olhar(J, 1.9, -1.6); await esperar(250);
    const antes = J.roupaAtual ? { R: J.roupaAtual.R, c: J.roupaAtual.c.slice() } : { R: PIJAMA[S.fem ? 'F' : 'M'], c: PIJAMA[S.fem ? 'F' : 'M'].c.slice() };
    const W = S.agua = { on: false, g: S.banh.g, gotas: [], vapor: [], acc: 0, vac: 0, geoGota: new THREE.BoxGeometry(0.03, 0.22, 0.03), geoVapor: new THREE.BoxGeometry(0.26, 0.26, 0.26), matGota: new THREE.MeshBasicMaterial({ color: 0xa8dcff, transparent: true, opacity: 0.9 }) };
    try {
      somClique(); await preto(true, 280);                       // corte rápido (igual ao de levantar da cama)
      const pele = (J.base || J.opt).pele;
      vestirRoupa(J, NU, [pele, pele, pele, pele]); tarja(J, true);
      J.rota = null; J.x = 1.8; J.z = -1.58; J.yaw = J.yawAlvo = Math.PI / 2; J.pose = 'banho'; J.seguir = true; J.ySnap = true;
      S.camEspecial = [1.45, 2.3, 3.3, 1.8, 1.0, -1.6]; S.camSnap = true; S.banh.vidro.opacity = 0.1;
      W.on = true; await esperar(160); await preto(false, 280);
      somAgua(4.6, false); await esperar(4700);
      W.on = false; await preto(true, 280);
      tarja(J, false); vestirRoupa(J, antes.R, antes.c);
      J.pose = 'pe'; J.x = B.chuveiro.spot[0]; J.z = B.chuveiro.spot[1]; J.yaw = J.yawAlvo = Math.PI / 2; J.ySnap = true;
      S.camEspecial = null; S.camSnap = true; S.banh.vidro.opacity = 0.28;
      for (const d of W.gotas.splice(0)) W.g.remove(d); for (const p of W.vapor.splice(0)) { W.g.remove(p); p.material.dispose(); }
      await esperar(160); await preto(false, 280);
      await dizer(['jog', T('Ahh, agora sim! Banho tomado.')]);
    } finally {
      W.on = false; if (S.banh.vidro) S.banh.vidro.opacity = 0.28; if (J.tarja) tarja(J, false);
      if (J.roupaAtual && J.roupaAtual.R === NU) vestirRoupa(J, antes.R, antes.c);
      for (const d of W.gotas.splice(0)) W.g.remove(d); for (const p of W.vapor.splice(0)) { W.g.remove(p); p.material.dispose(); }
      W.geoGota.dispose(); W.geoVapor.dispose(); W.matGota.dispose(); S.agua = null;
    }
  }

  // ----- sair do quarto / voltar
  async function sairQuarto() {
    const D = S.dados, J = S.jog;
    await andar(J, [[Q.pSaida.spot[0], Q.pSaida.spot[1]]], 2.0); J.yawAlvo = Math.PI;
    if (!D.emprego) { await dizer(['jog', T('Antes de sair, eu preciso ver as candidaturas no computador.')]); return; }
    if (!D.roupa || D.roupa.id < 0) { await dizer(['jog', T('Eu não vou sair de pijama... Preciso me trocar.')]); return; }
    gravar('escada');
    missao(T('Missão: encontre um lugar para comer.'));
    somPorta(false);
    await preto(true, 600); S.noTerreo = false; mudarLugar('escada', -OUT + 0.55, -MID, 0, 5.6);
    S.esc.portas.minha.abrir(1.35); S.camSnap = true; await esperar(200); await preto(false, 700);
    await andar(J, [[-4.1, -MID]], 1.6); S.esc.portas.minha.abrir(0); somPorta(true); await esperar(250);
    aviso(T('Procure um lugar para comer. Cuidado com os degraus!')); setTimeout(() => aviso(''), 3500);
  }
  async function voltarAoQuarto() {
    const J = S.jog; await andar(J, [[-OUT + 0.6, -MID]], 1.7); S.esc.portas.minha.abrir(1.35); somPorta(false); await esperar(250);
    await trocarLugar('quarto', Q.pSaida.spot[0] + 0.2, Q.pSaida.spot[1], 0); S.esc.portas.minha.abrir(0);
  }

  // ----- o vizinho que fuma
  const PUFF_GEO = new THREE.BoxGeometry(0.12, 0.12, 0.12);
  function criarVizinho() {
    const V = criar(S.palco, { pele: '#c9926b', cabelo: '#9a9a9a', estilo: ci('Ralo'), rosto: 0, labio: 3, corBarba: '#9a9a9a', barba: bi('Por fazer'), camisa: '#d9d4c4', listra: '#d9d4c4', gola: '#d9d4c4', calcao: 0x4a5568,
      meia: '#d8c39a', sola: '#5b4630', manga: 0, meiao: 0, cabecao: 1.22, escala: 1.0 });
    V.x = 3.95; V.z = 4.45; V.y = 2.8; V.ySnap = true; V.yaw = V.yawAlvo = Math.PI * 0.75; V.pose = 'fuma'; V.fase = 0.2; V.oculto = true; V.assento = 0.46;
    fazCigarro(V); S.viz = V;
  }
  function soltarFumaca() {
    const V = S.viz, p = new THREE.Mesh(PUFF_GEO, new THREE.MeshBasicMaterial({ color: 0xdddddd, transparent: true, opacity: 0.55, depthWrite: false }));
    p.position.set(V.x + Math.cos(V.yaw) * 0.28, V.y + 1.62, V.z - Math.sin(V.yaw) * 0.28); p.userData.t = 0; S.palco.add(p); S.fumaca.push(p);
  }
  function fumacaTick(dt) {
    for (let i = S.fumaca.length - 1; i >= 0; i--) {
      const p = S.fumaca[i]; p.userData.t += dt; const k = p.userData.t / 2.4;
      p.position.y += dt * 0.32; p.position.x += dt * 0.05; p.scale.setScalar(1 + k * 2.6); p.material.opacity = 0.55 * (1 - k);
      if (k >= 1) { S.palco.remove(p); p.material.dispose(); S.fumaca.splice(i, 1); }
    }
  }
  const animPorta = (porta, de, ate, ms) => new Promise((ok) => { const t0 = performance.now(); const f = (n) => { const k = pulando() ? 1 : Math.min(1, (n - t0) / ms); porta.abrir(de + (ate - de) * k); if (k < 1) requestAnimationFrame(f); else ok(); }; requestAnimationFrame(f); });
  async function conversarViz() {
    const J = S.jog, V = S.viz, vz = S.dados.vizinho;
    const dx = J.x - V.x, dz = J.z - V.z, d = Math.hypot(dx, dz) || 1;
    if (d > 1.35) await andar(J, [[V.x + dx / d * 1.2, V.z + dz / d * 1.2]], 2.0);
    olhar(J, V.x, V.z); olhar(V, J.x, J.z); V.pose = 'pe'; await esperar(250);
    for (;;) {
      Dialogo.esconder();
      const r = await Escolha.mostrar(T('O que você vai fazer?'), [T('Pedir um cigarro'), T('Pedir para ir fumar em outro lugar'), T('Perguntar sobre um lugar para comer'), T('Deixar para lá')]);
      if (r === 3) break;
      if (r === 0) {
        vz.pediuCigarro = true;
        await dizer(['jog', T('Moço, você me dá um cigarro?')], ['viz', Tj('Cigarro?! Você é de menor, nem devia pensar nisso!')],
          ['viz', Tj('Eu mesmo odeio esse vício... ele vicia demais. Lembre-se disso quando for mais velho.')]);
      } else if (r === 1) {
        vz.mandouFumarFora = true;
        await dizer(['jog', T('Moço, dá para fumar em outro lugar? A fumaça fica subindo pela escada...')], ['viz', T('Tsc... eu não posso nem fumar em paz nesse prédio?!')],
          ['viz', T('Que saco! Dá licença, vou fumar lá dentro!')]);
        const P = S.esc.portas.vizinho;
        await andar(V, [[4.3, MID]], 1.7); V.yawAlvo = 0; await esperar(150);
        somPorta(false); await animPorta(P, 0, 1.35, 450);
        await andar(V, [[4.95, MID]], 1.4); V.oculto = true; V.sumiu = true; if (V.blob) V.blob.visible = false;
        await animPorta(P, 1.35, 0, 350); somPorta(true); await esperar(500);
        olhar(J, 4.6, MID); await dizer(['jog', T('Eita... ele ficou bravo.')]);
        gravar('escada');
        return;
      } else if (r === 2) {
        vz.perguntouComer = vz.sabeValdemar = true;
        await dizer(['jog', T('Moço, você sabe onde tem um lugar para comer por aqui?')], ['viz', T('Hm? Ah, vai na lanchonete do seu Valdemar, é pertinho daqui.')],
          ['viz', T('O podrão de lá é divino!')], ['jog', T('Podrão? Vou lá conferir. Valeu!')]);
        missao(T('Missão: vá até a lanchonete do seu Valdemar.'));
        gravar('escada');
      }
      if (r !== 2) await esperar(100);
    }
    Dialogo.esconder(); if (!V.sumiu) V.pose = 'fuma';
  }

  // ----- a porta da rua
  async function sairDoPredio() {
    const J = S.jog; S.fimDaFase = true; missao(''); aviso('');
    await andar(J, [[-MID, -OUT + 1.0]], 1.8); J.yawAlvo = Math.PI / 2; await esperar(300);
    somPorta(false); { const R = S.esc.portas.rua; R.vidro.material.color.setHex(0xffffff); R.fora.material.map = null; R.fora.material.alphaTest = 0; R.fora.material.color.setHex(0xffffff); R.fora.material.needsUpdate = true; }
    await andar(J, [[-MID, -OUT + 0.25]], 1.2);
    gravar('fim');
    await preto(true, 1400);
    // (cidade.js) lá fora é a CIDADEZINHA (arquivo separado). Se ela não carregar, fica o "Continua..." de antes.
    let ok = false; try { ok = !!(await Fases.carregar('cidade')); } catch (e) { console.warn('[Fase 2] cidade.js não carregou:', e); }
    if (ok) S.paraCidade = true; else await legenda(T('Continua...'), 3600);
    if (S.fimRes) S.fimRes();
  }

  // ----- a bola do quarto masculino: física simples (a gente encosta andando e ela sai rolando; não gruda no pé)
  const BOLA_R = 0.17;
  function bolaTick(dt) {
    const B = S.bolaQ, J = S.jog; if (!B || !J) return;
    if (B.jx == null) { B.jx = J.x; B.jz = J.z; }
    const cl = (v) => Math.max(-3, Math.min(3, v)), pvx = cl((J.x - B.jx) / Math.max(dt, 1e-3)), pvz = cl((J.z - B.jz) / Math.max(dt, 1e-3)); B.jx = J.x; B.jz = J.z;
    if (S.lugar !== 'quarto') return;
    // empurrão: o jogador é um círculo de 0,27 m; só empurra se estiver indo na direção da bola
    const dx = B.x - J.x, dz = B.z - J.z, d = Math.hypot(dx, dz), lim = BOLA_R + 0.27;
    if (d < lim && d > 1e-4 && !J.oculto && J.pose !== 'deitado') {
      const nx = dx / d, nz = dz / d, vn = pvx * nx + pvz * nz;
      if (vn > 0.15) { const v = Math.min(5.5, vn * 1.5 + 0.6); const at = B.vx * nx + B.vz * nz; if (v > at) { B.vx += (v - at) * nx; B.vz += (v - at) * nz; } }
      B.x = J.x + nx * lim; B.z = J.z + nz * lim;
    }
    const sp = Math.hypot(B.vx, B.vz);
    if (sp > 0.01) {
      const k = Math.max(0, 1 - (0.7 + 1.1 / Math.max(sp, 0.6)) * dt);              // atrito: rola um pouco e para
      B.vx *= k; B.vz *= k;
      B.x += B.vx * dt; B.z += B.vz * dt;
      // paredes do quarto (a frente é aberta, mas a bola não sai)
      const xm = Q.W / 2 - 0.12 - BOLA_R, zm0 = -Q.D / 2 + 0.05 + BOLA_R, zm1 = Q.D / 2 - 0.2 - BOLA_R;
      if (B.x < -xm) { B.x = -xm; B.vx = Math.abs(B.vx) * 0.55; } else if (B.x > xm) { B.x = xm; B.vx = -Math.abs(B.vx) * 0.55; }
      if (B.z < zm0) { B.z = zm0; B.vz = Math.abs(B.vz) * 0.55; } else if (B.z > zm1) { B.z = zm1; B.vz = -Math.abs(B.vz) * 0.55; }
      // móveis (cama, guarda-roupa, mesa, computador): a bola bate e volta
      for (const r of Q_RETS) {
        const x0 = r[0] - BOLA_R, x1 = r[1] + BOLA_R, z0 = r[2] - BOLA_R, z1 = r[3] + BOLA_R;
        if (B.x > x0 && B.x < x1 && B.z > z0 && B.z < z1) {
          const pe = B.x - x0, pd = x1 - B.x, pt = B.z - z0, pf = z1 - B.z, m = Math.min(pe, pd, pt, pf);
          if (m === pe) { B.x = x0; B.vx = -Math.abs(B.vx) * 0.5; } else if (m === pd) { B.x = x1; B.vx = Math.abs(B.vx) * 0.5; } else if (m === pt) { B.z = z0; B.vz = -Math.abs(B.vz) * 0.5; } else { B.z = z1; B.vz = Math.abs(B.vz) * 0.5; }
        }
      }
      // gira rolando: eixo = cima x direção do movimento
      const ds = Math.hypot(B.vx, B.vz) * dt; if (ds > 1e-5) { B.eixo.set(B.vz, 0, -B.vx).normalize(); B.q.setFromAxisAngle(B.eixo, ds / BOLA_R); B.mesh.quaternion.premultiply(B.q); }
    } else { B.vx = B.vz = 0; }
    B.mesh.position.set(B.x, BOLA_R, B.z); if (B.sombra) B.sombra.position.set(B.x, 0.02, B.z);
  }

  // ------------------------------------------------------------------ o quadro
  function gancho(rdt) {
    if (!S || !S.ativo) return;
    const dt = Math.min(0.05, rdt || 0.016);
    esconderBola();
    // (4.8.2) "Pular cena": enquanto pula, a cena roda 25 passos por quadro (andar, portas, fumaça...) até o fim, com corte seco de câmera
    const nPassos = typeof Cena !== 'undefined' ? Cena.passos() : 1;
    for (let i = 0; i < nPassos; i++) {
      S.t += dt;
      if (S.modo === 'livre') mover(dt);
      for (const A of S.elenco) tickAtor(A, S.t, dt);
      if (S.viz && !S.viz.oculto) { const p = !!S.viz.puxando; if (S.viz._p && !p) soltarFumaca(); S.viz._p = p; }
      fumacaTick(dt); if (S.agua) aguaTick(dt); bolaTick(dt);
    }
    if (nPassos > 1) S.camSnap = true;
    if (typeof Cena !== 'undefined') Cena.marcar(S.modo === 'cena');
    const cast = new Map(S.elenco.map((a) => [a.m, a]));
    for (const a of ATLETAS) { const A = cast.get(a); a.raiz.visible = A ? !A.oculto : false; }
    if (S.lugar === 'escada') for (const p of S.esc.pecas) p.visible = p.userData.yMin <= S.cam.py - 1.0;
    // câmera (corte seco quando muda o setor da escada; suave dentro do setor)
    const v = camAlvo(), id = S.camEspecial ? 'esp' : S.lugar + (S.lugar === 'escada' ? v[6] : '');
    if (S.lugar === 'escada' && id !== S.camId) S.camSnap = true; S.camId = id;
    const C = S.cam, k = S.camSnap ? 1 : 1 - Math.exp(-dt * (S.camEspecial ? 3.2 : 2.6)); S.camSnap = false;
    const nomes = ['px', 'py', 'pz', 'tx', 'ty', 'tz']; for (let i = 0; i < 6; i++) C[nomes[i]] += (v[i] - C[nomes[i]]) * k;
    const ox = OX + OFFS[S.lugar];
    camera.position.set(ox + C.px, C.py, C.pz); camera.lookAt(ox + C.tx, C.ty, C.tz);
    // seta e dica
    const a = S.modo === 'livre' ? alvoAtual() : null;
    for (const o of [S.quarto, S.banh, S.esc]) o.seta.visible = false;
    const seta = S.lugar === 'quarto' ? S.quarto.seta : S.lugar === 'banheiro' ? S.banh.seta : S.esc.seta;
    if (a) { seta.visible = true; seta.position.set(a.x, a.alt + (S.lugar === 'escada' ? S.jog.y : 0) + Math.sin(S.t * 4) * 0.07, a.z); seta.rotation.y = S.t * 2; }
    if (S.modo === 'livre') {
      const txt = a ? a.txt : ''; if (UI.dica.textContent !== txt) UI.dica.textContent = txt;
      UI.btn.disabled = !a; const bt = T('Interagir'); if (UI.btn.textContent !== bt) UI.btn.textContent = bt;
    }
  }
  function descartarGrupo(g) {
    if (!g) return; scene.remove(g);
    g.traverse((o) => {
      if (o.geometry && o.geometry !== SHADOW_GEO && o.geometry !== PUFF_GEO) o.geometry.dispose();
      const ms = Array.isArray(o.material) ? o.material : [o.material];
      for (const m of ms) if (m && m !== MAT_CORES && m !== SHADOW_MAT) { if (m.map) m.map.dispose(); m.dispose(); }
    });
  }
  function limpar(f1p) {
    if (!S) return;
    S.ativo = false; GANCHO_RENDER = null; camera.clearViewOffset(); if (camera.fov !== 52) { camera.fov = 52; camera.updateProjectionMatrix(); }
    for (const A of S.elenco) descartarAtor(A);
    for (const p of (S.fumaca || [])) p.material.dispose();
    descartarGrupo(S.palco); if (S.quarto) descartarGrupo(S.quarto.g); if (S.banh) descartarGrupo(S.banh.g); if (S.esc) descartarGrupo(S.esc.g);
    restaurarMundo();
    document.body.classList.remove('f2Ativo');
    UI.missao.hidden = true; UI.ctl.hidden = true; UI.pc.hidden = true; UI.roupa.hidden = true; UI.aviso.hidden = true; UI.toast.hidden = true; UI.leg.classList.remove('on'); UI.num.classList.remove('on');
    Dialogo.esconder(); Musica.parar();
    if (f1p) { f1p.hidden = false; f1p.classList.remove('claro'); }
    UI.preto.hidden = true; UI.preto.classList.add('claro');
    S = null;
  }

  // ------------------------------------------------------------------ roteiro
  async function anos(a0, a1) {
    UI.leg.classList.remove('on'); UI.num.textContent = String(a0); UI.num.classList.add('on'); await esperar(1500);
    const dur = 3600, ini = performance.now();
    await new Promise((fim) => { const passo = (n) => { const k = pulando() ? 1 : Math.min(1, (n - ini) / dur), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; UI.num.textContent = String(Math.round(a0 + (a1 - a0) * e)); if (k < 1) requestAnimationFrame(passo); else fim(); }; requestAnimationFrame(passo); });
    await esperar(1300); UI.num.classList.remove('on'); await esperar(300);
  }
  function aparecerNaCama() {
    const J = S.jog; J.seguir = false; J.pose = 'deitado'; J.x = Q.cama.cx; J.z = -0.95; J.y = 0.52; J.yaw = J.yawAlvo = -Math.PI / 2; J.rota = null;
  }
  async function iniciar(ctx) {
    API = ctx.api; montarUI();
    const retomar = ctx.args && ctx.args.retomar;
    const dados = dadosPadrao(), svF2 = ctx.historia && ctx.historia.fase2;
    if (retomar && retomar !== 'inicio' && svF2) Object.assign(dados, JSON.parse(JSON.stringify(svF2)));
    dados.ano = new Date().getFullYear() - ANOS_ATRAS + ANOS_FRENTE;
    S = { ativo: true, modo: 'cena', lugar: 'quarto', elenco: [], t: 0, k: 1, dados, fem: PERSONAGEM.genero === 'F', escuro: false, face: { x: 0, z: -1 }, fumaca: [], camSnap: true, mapa: null,
      cam: { px: Q_CAM[0], py: Q_CAM[1], pz: Q_CAM[2], tx: Q_CAM[3], ty: Q_CAM[4], tz: Q_CAM[5] }, altura: () => 0 };
    const f1p = document.getElementById('f1Preto');
    let paraCidade = false;
    document.body.classList.add('f2Ativo');
    try {
      UI.preto.hidden = false; UI.preto.style.transitionDuration = '0s'; UI.preto.classList.remove('claro'); UI.leg.classList.remove('on'); UI.num.classList.remove('on');
      await esperar(40); if (f1p) f1p.hidden = true;
      prepararMundo();
      S.palco = new THREE.Group(); scene.add(S.palco);
      S.quarto = montarQuarto(S.fem); S.banh = montarBanheiro(); S.esc = montarEscada();
      S.quarto.g.visible = S.banh.g.visible = S.esc.g.visible = false;
      if (S.quarto.bola) S.bolaQ = { mesh: S.quarto.bola, sombra: S.quarto.bolaSombra, x: 0.9, z: 1.6, vx: 0, vz: 0, jx: null, jz: null, eixo: new THREE.Vector3(), q: new THREE.Quaternion() };
      GANCHO_RENDER = gancho;
      // o personagem (com 16 anos: sem barba) e a roupa
      const ap = aparenciaJogador(), pij = PIJAMA[S.fem ? 'F' : 'M'];
      S.jog = criar(S.palco, Object.assign({}, ap, roupaOpts(pij, pij.c, ap.pele)));
      const rs = dados.roupa, lista = ROUPAS[S.fem ? 'F' : 'M'];
      vestirRoupa(S.jog, rs && rs.id >= 0 && lista[rs.id] ? lista[rs.id] : pij, rs ? rs.cores : pij.c);
      if (!dados.vizinho.mandouFumarFora) criarVizinho();
      brilho(1);
      const fim = new Promise((r) => { S.fimRes = r; });
      const ponto = retomar && svF2 ? retomar : 'inicio';

      if (ponto === 'inicio') {
        Musica.tocar('jazz');
        const nome = nomeJog();
        await Dialogo.mostrar([T('Mas... isso não é tudo.'), Tj('Eu não cheguei onde eu estou só por causa dessa partida...'), T('Na verdade, ela foi só o começo...')], { nome, voz: vozJog() });
        gravar('inicio');
        await toast('<b>' + esc(T('Jogo salvo')) + '</b>' + esc(Tf('Fase 2 · {0}', T(NOME_PONTO.inicio))), 2200);
        const ano0 = new Date().getFullYear();
        await anos(ano0 - ANOS_ATRAS, ano0 - ANOS_ATRAS + ANOS_FRENTE);
        await Dialogo.mostrar([Tjf('Quando eu tinha {0} anos, eu já precisava ser independente...', IDADE)], { nome, voz: vozJog() });
        Dialogo.esconder(); Musica.parar();
        S.escuro = true; mudarLugar('quarto', 0, 0, 0, 0); aparecerNaCama();
        missao('');
        await preto(false, 1500); await esperar(1500);
        await dizer(['jog', T('Hmm... está tudo escuro...')]);
        await preto(true, 450); S.jog.seguir = true; S.jog.pose = 'pe'; S.jog.x = -1.9; S.jog.z = -1.3; S.jog.yaw = S.jog.yawAlvo = 0; S.jog.ySnap = true; await esperar(150); await preto(false, 450);
        await dizer(['jog', T('Preciso acender a luz.')]);
        missao(T('Missão: acenda a luz.'));
        liberar(); aviso(T('Use o direcional para andar e o botão Interagir.')); setTimeout(() => aviso(''), 4500);
      } else if (ponto === 'emprego') {
        dados.luz = true; mudarLugar('quarto', 2.4, -1.15, Math.PI); Musica.tocar('jazz');
        missao(T('Missão: troque de roupa e saia do quarto.')); await preto(false, 900); liberar();
      } else if (ponto === 'fim' && await Fases.carregar('cidade').then(() => true, () => false)) {
        S.paraCidade = true; S.fimRes();                               // (cidade.js) o save da porta da rua abre a cidadezinha
      } else {
        dados.luz = true; S.noTerreo = false; mudarLugar('escada', -4.1, -MID, 0, 5.6); Musica.tocar('jazz');
        missao(dados.vizinho.sabeValdemar ? T('Missão: vá até a lanchonete do seu Valdemar.') : T('Missão: encontre um lugar para comer.')); await preto(false, 900); liberar();
      }
      await fim;
      paraCidade = !!S.paraCidade;
    } finally {
      limpar(f1p);
    }
    // (cidade.js) a Fase 2 terminou na porta da rua: a cidadezinha começa já no preto (ela mesma cobre a tela antes de qualquer espera)
    if (paraCidade) { const rc = await Fases.executar('cidade', { origem: 'fase2' }); if (!rc.ok) console.warn('[Cidade] não rodou:', rc); }
  }

  window.FutebolJS.registrarFase({ id: 'fase2', nome: 'Fase 2', nucleoMinimo: '4.6.0', iniciar, modeloJogador, modeloPessoa });
})();
