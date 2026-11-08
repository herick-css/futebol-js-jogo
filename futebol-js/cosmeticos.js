/*
 * cosmeticos.js — cosméticos do Futebol JS (cabelo, barba, roupas, chuteiras e bola)
 * Feito no modo Cosméticos do Conversor FBX → Three.js em 08/11/2026, testado no jogo.js 6.6.10.
 * Para editar de novo: abra este arquivo no conversor (Cosméticos > Exportar > Abrir projeto).
 *
 *   Cortes: Cabelinho 3, Maicaninho 2
 *   Barbas: (nenhum)
 *   Roupas: (nenhum)
 *   Chuteiras: (nenhum)
 *   Bolas: (nenhum)
 *
 * COMO ENTRA NO JOGO
 *   Cortes, barbas e chuteiras vão para o FIM das listas do jogo (ESTILOS_CABELO, ESTILOS_BARBA, CHUTEIRAS):
 *   aparecem sozinhos no criador de personagem e no sorteio dos jogadores, e os índices antigos não mudam.
 *   Por isso, não apague nem mude a ordem de um cosmético que já está em uso (um personagem salvo guarda o número).
 *   Roupas viram uniformes:  FutebolCosmeticos.vestirTime('azulao', 'Nome da roupa')       (o 3º valor true = reserva)
 *   Bola:                     FutebolCosmeticos.usarBola('Nome da bola')                    (sem nome = a bola original)
 *
 *   Carregar (uma vez, antes de abrir o criador ou começar a partida):
 *     Fases.carregar('cosmeticos')            ou  <script src="cosmeticos.js"></script> depois do jogo.js
 */
(function (global) {
  // ======================================================================== DADOS
  // cabelo: caixas [largura, altura, fundo, x, y, z, mistura com a pele, giroX°, giroY°, giroZ°, cantos] + pintura da cabeça (linhas 0 a 15)
  // (giro e cantos são opcionais; cantos = 8 cantos [x, y, z] numa caixa de tamanho 1, para deformar a caixa.
  //  Precisam do jogo.js com o Lote.caixa que aceita giro e cantos)
  // barba: pixels 16x16 no rosto ('#' barba, ':' por fazer, 's' sombra, '.' nada) + caixas finas
  // chuteira: paleta + pixels 16x16 (número da cor em hexadecimal) · bola: paleta + uma cor por triângulo (320)
  const COSMETICOS = {
  cabelos: [
    {"nome":"Cabelinho 3","caixas":[[0.523,0.145,0.645,0,1.855,0],[0.415,0.211,0.63,0.315,1.945,0],[0.481,0.134,0.593,-0.018,1.761,0],[0.223,0.086,0.466,0.94,2.422,0],[0.415,0.264,0.656,0.523,2.049,0],[0.365,0.222,0.601,0.701,2.163,0],[0.438,0.122,0.54,-0.03,1.681,0],[0.293,0.149,0.552,0.803,2.257,0],[0.269,0.137,0.526,0.867,2.339,0]],"a":0,"s":1,"f":5,"n":5,"nf":12,"t":1,"p":9,"tipo":"liso","risco":3},
    {"nome":"Maicaninho 2","caixas":[[0.294,0.073,0.464,0.271,2.083,0,0,-90,23.1,0,[-0.5,-0.5,-0.5,0.111,-0.5,-0.493,-0.5,0.5,-0.5,0.111,0.5,-0.493,-0.049,-0.5,0.5,0.5,-0.5,0.445,-0.049,0.5,0.5,0.5,0.5,0.445]],[0.421,0.111,0.694,0.097,2.136,0,0,-90,0,0,[-0.5,-0.5,-0.499,0.132,-0.5,-0.5,-0.5,0.5,-0.499,0.132,0.5,-0.5,-0.335,-0.5,0.5,0.5,-0.5,0.399,-0.335,0.5,0.5,0.5,0.5,0.399]],[0.098,0.037,0.165,-0.267,1.643,0,0,90,-78.2,-180,[-0.286,-0.5,-0.367,0.5,-0.5,-0.49,-0.295,0.5,-0.38,0.494,0.5,-0.5,-0.497,-0.5,0.5,0.339,-0.5,0.451,-0.5,0.5,0.495,0.337,0.5,0.447]],[0.487,0.55,0.32,-0.012,1.748,0,0,-90,0,0],[0.085,0.037,0.16,-0.241,1.562,0,0,-90,-79.8,0,[-0.5,-0.5,-0.487,0.496,-0.5,-0.408,-0.5,0.5,-0.5,0.497,0.5,-0.424,-0.497,-0.5,0.462,0.5,-0.5,0.5,-0.497,0.5,0.455,0.5,0.5,0.493]],[0.164,0.046,0.315,0.336,1.914,0,0,-90,63,0,[-0.5,-0.5,-0.446,0.085,-0.5,-0.5,-0.5,0.5,-0.446,0.085,0.5,-0.5,-0.123,-0.5,0.5,0.5,-0.5,0.387,-0.123,0.5,0.5,0.5,0.5,0.387]],[0.156,0.067,0.358,-0.274,1.807,0,0,90,-87.2,-180],[0.107,0.043,0.205,-0.27,1.709,0,0,90,-87.2,-180,[-0.375,-0.5,-0.338,0.5,-0.5,-0.493,-0.38,0.5,-0.35,0.497,0.5,-0.5,-0.499,-0.5,0.5,0.43,-0.5,0.472,-0.5,0.5,0.497,0.43,0.5,0.472]],[0.253,0.088,0.512,-0.306,1.935,0,0,-90,-50.9,0,[-0.333,-0.5,-0.496,0.484,-0.5,-0.5,-0.333,0.5,-0.496,0.484,0.5,-0.5,-0.5,-0.5,0.361,0.5,-0.5,0.5,-0.5,0.5,0.361,0.5,0.5,0.5]],[0.337,0.096,0.635,-0.139,2.084,0,0,-90,-24.7,0,[-0.5,-0.5,-0.492,0.289,-0.5,-0.5,-0.5,0.5,-0.492,0.289,0.5,-0.5,-0.406,-0.5,0.464,0.5,-0.5,0.5,-0.406,0.5,0.464,0.5,0.5,0.5]],[0.21,0.058,0.391,0.331,1.989,0,0,-90,44.6,0,[-0.5,-0.5,-0.483,0.098,-0.5,-0.5,-0.5,0.5,-0.483,0.098,0.5,-0.5,-0.116,-0.5,0.5,0.5,-0.5,0.4,-0.116,0.5,0.5,0.5,0.5,0.4]]],"a":0,"s":4,"f":4,"n":8,"nf":10,"t":1,"p":3,"tipo":"liso"},
  ],
  barbas: [],
  roupas: [],
  chuteiras: [],
  bolas: [],
  bolaPadrao: null,
  };

  // ======================================================================== INSTALADOR (o mesmo do preview do conversor)
  /* =====================================================================
   * INSTALADOR DE COSMÉTICOS — o MESMO código roda no preview do conversor e dentro do jogo.
   *   instalarCosmeticos(J, D)
   *     J = as listas e funções de desenho do jogo (ESTILOS_CABELO, ESTILOS_BARBA, CHUTEIRAS, BALL_GEO,
   *         pintarRosto, pintarChuteira, pintarCamisa...). No jogo, são as variáveis do jogo.js.
   *     D = os cosméticos: { cabelos, barbas, roupas, chuteiras, bolas, bolaPadrao }
   *   Os itens novos entram NO FIM das listas: os índices antigos não mudam (personagens salvos continuam iguais).
   *   Devolve { cabelos: {nome: índice}, barbas: {...}, chuteiras: {...}, roupas: {nome: uniforme}, bolas: [...] }.
   * ===================================================================== */
  function instalarCosmeticos(J, D) {
    D = D || {};
    const THREE = J.THREE || (typeof window !== 'undefined' ? window.THREE : null);
    const res = { cabelos: {}, barbas: {}, chuteiras: {}, roupas: {}, bolas: [] };
    // troca um cosmético de mesmo nome (instalar de novo) ou põe no fim da lista
    const colocar = (lista, item) => {
      const i = lista.findIndex((x) => x && x.cosmetico && x.nome === item.nome);
      if (i >= 0) { lista[i] = item; return i; }
      lista.push(item); return lista.length - 1;
    };
    const hex6 = (c) => {
      if (typeof c === 'number') return '#' + c.toString(16).padStart(6, '0');
      c = String(c || '').trim().toLowerCase();
      if (/^#[0-9a-f]{3}$/.test(c)) c = '#' + c[1] + c[1] + c[2] + c[2] + c[3] + c[3];
      return c;
    };
    const rgb = (c) => { const n = parseInt(hex6(c).slice(1), 16) || 0; return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
    const misturar = (a, b, t) => { const A = rgb(a), B = rgb(b); return '#' + A.map((v, k) => Math.round(v + (B[k] - v) * t).toString(16).padStart(2, '0')).join(''); };
    const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
    const novoCanvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  
    // ------------------------------------------------------------------ CABELO: caixas + pintura da cabeça (mesmo formato do HC do jogo)
    for (const h of D.cabelos || []) {
      const item = Object.assign({ a: 0, s: 4, f: 4, n: 8, nf: 10, t: 1, p: 3, tipo: 'liso' }, h, { caixas: (h.caixas || []).map((c) => c.map((v) => (Array.isArray(v) ? v.slice() : v))), cosmetico: true });
      if (!item.risco) delete item.risco;
      if (!item.careca) delete item.careca;
      if (!item.g) delete item.g;
      res.cabelos[h.nome] = colocar(J.ESTILOS_CABELO, item);
    }
    // caixas giradas ([..., mistura, giroX, giroY, giroZ]) precisam do jogo.js com o Lote.caixa que aceita giro
    const temGiro = (D.cabelos || []).concat(D.barbas || []).some((x) => (x.caixas || []).some((c) => c[7] || c[8] || c[9]));
    if (temGiro && J.Lote && J.Lote.prototype.caixa.length < 9) console.warn('Cosméticos: este jogo.js ainda não gira as caixas do cabelo/barba; elas vão aparecer retas. Atualize o jogo.js (remendo do giro).');
    // caixas deformadas ([..., giroZ, cantos]) precisam do Lote.caixa que aceita cantos
    const temCantos = (D.cabelos || []).concat(D.barbas || []).some((x) => (x.caixas || []).some((c) => Array.isArray(c[10])));
    if (temCantos && J.Lote && J.Lote.prototype.caixa.length < 10) console.warn('Cosméticos: este jogo.js ainda não deforma as caixas do cabelo/barba; elas vão aparecer como caixas retas. Atualize o jogo.js (remendo dos cantos).');
  
    // ------------------------------------------------------------------ BARBA: volumes (caixas) + desenho no rosto (16x16)
    //   pixels: 16 linhas de 16 letras. '#' = barba · ':' = barba por fazer (clarinha) · 's' = sombra na pele (rala) · '.' = nada
    for (const b of D.barbas || []) {
      res.barbas[b.nome] = colocar(J.ESTILOS_BARBA, { nome: b.nome, grupo: b.grupo === 'bigode' ? 'bigode' : 'barba', id: 'cosmetico', caixas: (b.caixas || []).map((c) => c.map((v) => (Array.isArray(v) ? v.slice() : v))), pixels: b.pixels || [], cosmetico: true });
    }
    if (!J.pintarRosto.__cosmeticos) {
      const original = J.pintarRosto;
      const rascunho = novoCanvas(16, 16), rg = rascunho.getContext('2d', { willReadFrequently: true });
      const PROTEGIDOS = new Set(['#c42a3e', '#db4a5e', '#b01e35', '#f08a98', '#f6f2ea']);   // batom e dentes
      // pixels da boca (para a barba nunca cobrir): desenha o rosto com duas cores de lábio e vê o que mudou
      const mascaraBoca = (pele, o) => {
        const fim = (J.LABIOS ? J.LABIOS.length : 8) - 1;
        original(rg, 0, 0, pele, Object.assign({}, o, { labio: 0 }));
        const a = rg.getImageData(0, 0, 16, 16).data;
        original(rg, 0, 0, pele, Object.assign({}, o, { labio: fim }));
        const b = rg.getImageData(0, 0, 16, 16).data;
        const m = new Uint8Array(256);
        for (let i = 0; i < 256; i++) if (a[i * 4] !== b[i * 4] || a[i * 4 + 1] !== b[i * 4 + 1] || a[i * 4 + 2] !== b[i * 4 + 2]) m[i] = 1;
        for (const [x, y] of [[7, 9], [8, 9], [7, 10], [8, 10]]) m[y * 16 + x] = 1;          // nariz
        return m;
      };
      const novo = function (g, ox, oy, pele, o) {
        original.apply(this, arguments);
        o = o || {};
        const B = J.ESTILOS_BARBA[o.barba | 0];
        if (!B || !B.pixels || !B.pixels.length) return;
        const m = mascaraBoca(pele, o);
        const atual = g.getImageData(ox, oy, 16, 16).data;
        const cor = hex6(o.corBarba != null ? o.corBarba : (o.cabelo != null ? o.cabelo : '#1C140F'));
        const sombra = misturar(hex6(pele), '#1a0f0a', 0.32);
        for (let y = 0; y < 16; y++) {
          const linha = B.pixels[y] || '';
          for (let x = 0; x < 16; x++) {
            const c = linha[x];
            if (!c || c === '.' || m[y * 16 + x]) continue;
            const k = (y * 16 + x) * 4;
            const aqui = '#' + [atual[k], atual[k + 1], atual[k + 2]].map((v) => v.toString(16).padStart(2, '0')).join('');
            if (PROTEGIDOS.has(aqui)) continue;
            if (c === ':') { g.globalAlpha = 0.3; g.fillStyle = cor; }
            else if (c === 's') g.fillStyle = sombra;
            else g.fillStyle = cor;
            g.fillRect(ox + x, oy + y, 1, 1);
            g.globalAlpha = 1;
          }
        }
      };
      novo.__cosmeticos = true; novo.mascaraBoca = mascaraBoca; novo.original = original;
      J.pintarRosto = novo;
    }
  
    // ------------------------------------------------------------------ CHUTEIRA: desenho 16x16 (vai em todas as faces da chuteira)
    //   paleta: até 16 cores · pixels: 16 linhas de 16 letras (0-9, a-f = cor da paleta)
    for (const c of D.chuteiras || []) {
      const paleta = (c.paleta && c.paleta.length ? c.paleta : ['#17171B']).map(hex6);
      res.chuteiras[c.nome] = colocar(J.CHUTEIRAS, { nome: c.nome, base: paleta[0], det: paleta[1] || paleta[0], pad: 'pixels', paleta, pixels: c.pixels || [], cosmetico: true });
    }
    if (!J.pintarChuteira.__cosmeticos) {
      const original = J.pintarChuteira;
      const novo = function (g, ox, oy, c) {
        if (!c || c.pad !== 'pixels') return original.apply(this, arguments);
        g.fillStyle = c.paleta[0]; g.fillRect(ox, oy, 16, 16);
        for (let y = 0; y < 16; y++) {
          const linha = c.pixels[y] || '';
          for (let x = 0; x < 16; x++) {
            const i = parseInt(linha[x], 16);
            if (!(i > 0) || !c.paleta[i]) continue;
            g.fillStyle = c.paleta[i]; g.fillRect(ox + x, oy + y, 1, 1);
          }
        }
      };
      novo.__cosmeticos = true; novo.original = original;
      J.pintarChuteira = novo;
    }
  
    // ------------------------------------------------------------------ ROUPAS: uniforme (cores) + padrão na camisa
    //   O jogo reconhece a camisa pelas 3 cores (camisa + faixa + gola). O padrão pinta por cima da cor da camisa,
    //   então faixa, gola, número e emblema continuam por cima.
    const PADROES = {
      liso: () => false,
      listras: (x, y, L) => x % (L * 2) < L,
      listrasH: (x, y, L) => y % (L * 2) < L,
      faixa: (x, y, L) => Math.abs(x - y) < L,
      metade: (x) => x >= 16,
      xadrez: (x, y, L) => ((Math.floor(x / L) + Math.floor(y / L)) & 1) === 1,
      peito: (x, y, L) => y >= 8 && y < 8 + L,
      ombros: (x, y, L) => y < L,
      degrade: (x, y) => y / 32 > BAYER[(y & 3) * 4 + (x & 3)] / 16 + 0.15,
      pontos: (x, y, L) => x % (L + 2) < 2 && y % (L + 2) < 2,
    };
    res.padroes = Object.keys(PADROES);
    J.__roupas = J.__roupas || new Map();
    for (const r of D.roupas || []) {
      const U = { camisa: hex6(r.camisa), listra: hex6(r.listra), gola: hex6(r.gola), calcao: hex6(r.calcao), meia: hex6(r.meia), sola: hex6(r.sola), goleiro: hex6(r.goleiro || '#1F9E5C') };
      res.roupas[r.nome] = U;
      J.__roupas.set(U.camisa + '|' + U.listra + '|' + U.gola, Object.assign({}, r, U));
    }
    if (!J.pintarCamisa.__cosmeticos) {
      const original = J.pintarCamisa;
      const novo = function (g, ox, cor, listra, gola, numero, costas, emblema, nomeCamisa, corTexto) {
        const R = J.__roupas.get(hex6(cor) + '|' + hex6(listra) + '|' + hex6(gola));
        if (R && R.numero && !corTexto) corTexto = R.numero;
        original.call(this, g, ox, cor, listra, gola, numero, costas, emblema, nomeCamisa, corTexto);
        const teste = R && PADROES[R.padrao];
        if (!teste || R.padrao === 'liso' || (costas && R.soFrente)) return;
        const L = Math.max(1, R.larg | 0 || 3), base = rgb(cor), c2 = R.cor2 || '#FFFFFF';
        const img = g.getImageData(ox, 0, 32, 32), d = img.data, alvo = rgb(c2);
        for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) {
          const k = (y * 32 + x) * 4;
          if (d[k] !== base[0] || d[k + 1] !== base[1] || d[k + 2] !== base[2]) continue;    // só onde ficou a cor da camisa
          if (!teste(costas ? 31 - x : x, y, L)) continue;                                    // costas: espelhado (fica do mesmo lado do corpo)
          d[k] = alvo[0]; d[k + 1] = alvo[1]; d[k + 2] = alvo[2];
        }
        g.putImageData(img, ox, 0);
      };
      novo.__cosmeticos = true; novo.original = original;
      J.pintarCamisa = novo;
    }
  
    // ------------------------------------------------------------------ BOLA: uma cor por triângulo do icosaedro do jogo (320 triângulos)
    //   paleta: cores · tri: 320 letras (0-9, a-z = cor da paleta), na ordem dos triângulos do BALL_GEO
    const geo = J.BALL_GEO, cores = geo && geo.attributes.color;
    if (cores && !J.__bolaOriginal) J.__bolaOriginal = Float32Array.from(cores.array);
    J.__bolas = J.__bolas || {};
    for (const b of D.bolas || []) { J.__bolas[b.nome] = b; res.bolas.push(b.nome); }
    res.usarBola = (nome) => {
      if (!cores) return false;
      const b = nome && J.__bolas[nome];
      if (!b) { cores.array.set(J.__bolaOriginal); cores.needsUpdate = true; return !nome; }
      const n = cores.count / 3, tri = b.tri || '';
      if (tri.length !== n) { console.warn('Cosméticos: a bola "' + nome + '" foi feita para ' + tri.length + ' triângulos e a do jogo tem ' + n + '.'); return false; }
      const pal = (b.paleta || ['#ffffff']).map((c) => rgb(c).map((v) => v / 255));
      for (let t = 0; t < n; t++) {
        const c = pal[parseInt(tri[t], 36)] || pal[0];
        for (let k = 0; k < 3; k++) cores.array.set(c, (t * 3 + k) * 3);
      }
      cores.needsUpdate = true;
      return true;
    };
    if (D.bolaPadrao) res.usarBola(D.bolaPadrao);
    return res;
  }

  // ======================================================================== LIGAR NO JOGO
  // As listas e funções do jogo.js são variáveis globais (fora de função): este arquivo enxerga e acrescenta nelas.
  if (typeof ESTILOS_CABELO === 'undefined' || typeof pintarRosto !== 'function') {
    console.warn('cosmeticos.js: carregue depois do jogo.js (não achei as listas do jogo).');
    return;
  }
  const J = {
    THREE: global.THREE, ESTILOS_CABELO, ESTILOS_BARBA, CHUTEIRAS, LABIOS, BALL_GEO, Lote: typeof Lote !== 'undefined' ? Lote : null,
    get pintarRosto() { return pintarRosto; }, set pintarRosto(f) { pintarRosto = f; },
    get pintarChuteira() { return pintarChuteira; }, set pintarChuteira(f) { pintarChuteira = f; },
    get pintarCamisa() { return pintarCamisa; }, set pintarCamisa(f) { pintarCamisa = f; },
  };
  const res = instalarCosmeticos(J, COSMETICOS);
  global.FutebolCosmeticos = {
    dados: COSMETICOS,
    indices: { cabelos: res.cabelos, barbas: res.barbas, chuteiras: res.chuteiras },
    roupas: res.roupas,          // { nome: uniforme } no formato do TIMES (camisa, listra, gola, calcao, meia, sola, goleiro)
    bolas: res.bolas,
    usarBola: res.usarBola,
    // veste um time com uma roupa: vestirTime('azulao', 'Meu uniforme') · reserva = true troca o uniforme2
    vestirTime(time, nome, reserva) {
      const U = res.roupas[nome], t = typeof TIMES !== 'undefined' && TIMES[time];
      if (!U || !t) { console.warn('cosmeticos.js: time ou roupa não existe', time, nome); return false; }
      t[reserva ? 'uniforme2' : 'uniforme'] = Object.assign({}, U);
      return true;
    },
  };
  // carregar pelo mesmo caminho das fases: Fases.carregar('cosmeticos')
  if (global.FutebolJS && typeof global.FutebolJS.registrarFase === 'function') global.FutebolJS.registrarFase({ id: 'cosmeticos', iniciar() {} });
})(typeof window !== 'undefined' ? window : globalThis);
