// =====================================================================================================================
// UNIFORMES: o desenho das camisas 1 e 2 dos 40 times da Série A e da Série B (as paródias do serieb.js) e o espaço da
//   pixel art no peito. Cada time tem [uniforme 1, uniforme 2]; o motor do desenho fica no jogo.js (compilarModelo e
//   pintarCamisaModelo: lá está a lista de camadas e texturas). As cores das camisas continuam vindo do serieb.js (uni e
//   uni2): 'c' aqui é a camisa daquele uniforme, 'l' a listra, 'g' a gola, 'k' o calção; o resto é cor escrita.
//
//   O desenho segue o padrão de cada clube parodiado (camisas 2026 quando já lançadas, senão o tradicional):
//   aros = listras horizontais, listras = verticais, faixa = diagonal, banda = faixas no peito, vfaixa = faixa vertical.
//
//   A PIXEL ART DO PEITO: sem nada aqui, o peito leva o escudo do time (EMB_A / EMB_B do serieb.js) reduzido para 16 x 16.
//   Para pôr outra arte, escreva em PEITO[chave do time] uma pixel art de 16 x 16 (pal: as cores; px: 16 linhas de 16
//   letras separadas por |, a = 1ª cor da pal, b = 2ª..., ponto = transparente). Exemplo (um quadradinho):
//     PEITO.urubu = { pal: ['#1c1c1f', '#c8202e'], px: '................|.aaaaaaaaaaaaaa.|.abbbbbbbbbbbba.|...' };
// =====================================================================================================================
(() => {
  const BR = '#f4f4f0', PR = '#1c1c1f';

  const KITS = {
    // ------------------------------------------------------------------------------------------------- SÉRIE A
    urubu: [            // Flamengo: rubro-negro em listras horizontais, mangas pretas e gola polo; a 2 é branca com as faixas no peito
      { camadas: [{ t: 'aros', c: ['c', 'l'], n: 9 }], manga: PR, punho: 'c', gola: 'polo', golaCor: PR, tex: { t: 'pontos', k: 0.05 } },
      { camadas: [{ t: 'banda', y: 0.3, f: [['#c8202e', 0.065], [PR, 0.065], ['#c8202e', 0.065], [PR, 0.065]] }], gola: 'redonda', golaCor: PR, punho: PR, punho2: '#c8202e', tex: { t: 'linhas', k: 0.03 } },
    ],
    periquito: [        // Palmeiras 2026 (o Porco da Pompeia): verde com as laterais e a gola brancas; a 2 é branca com gola verde (7.4.10: sem o vermelho)
      { lateral: BR, lateralFrente: 0.035, gola: 'redonda', golaCor: BR, golaCor2: BR, punho: BR, punho2: BR, tex: { t: 'riscas', k: 0.05 } },
      { gola: 'redonda', golaCor: '#0b6b3a', golaCor2: BR, punho: '#0b6b3a', punho2: BR, tex: { t: 'xadrez', k: 0.035 } },
    ],
    raposa: [           // Cruzeiro 2026: azul com textura de estrelas sutis; a 2 é branca
      { gola: 'redonda', golaCor: BR, punho: BR, tex: { t: 'estrelas', k: 0.13 } },
      { gola: 'v', golaCor: '#1d4fb0', punho: '#1d4fb0', tex: { t: 'estrelas', k: 0.06 } },
    ],
    leaocaipira: [      // Mirassol: amarelo com detalhes verdes; a 2 é verde com detalhes amarelos
      { lateral: '#127a3a', lateralFrente: 0.03, gola: 'v', golaCor: '#127a3a', punho: '#127a3a', tex: { t: 'diagonais', k: 0.05 } },
      { lateral: '#f2c230', lateralFrente: 0.03, gola: 'v', golaCor: '#f2c230', punho: '#f2c230', tex: { t: 'riscas', k: 0.06 } },
    ],
    laranjeiras: [      // Fluminense 2026: listras finas grená e verde separadas por filetes brancos, gola V branca; a 2 é branca com gola e punhos tricolores
      { camadas: [{ t: 'listras', c: ['#7a1f2b', '#0f6b3a'], n: 11, risca: BR, rw: 0.2 }], gola: 'v', golaCor: BR, punho: BR },
      { gola: 'redonda', golaCor: '#0f6b3a', golaCor2: '#7a1f2b', punho: '#0f6b3a', punho2: '#7a1f2b', tex: { t: 'xadrez', k: 0.035 } },
    ],
    glorioso: [         // Botafogo: listras verticais alvinegras com as mangas pretas; a 2 é branca com as laterais pretas
      { camadas: [{ t: 'listras', c: [PR, BR], n: 9 }], manga: PR, punho: BR, gola: 'redonda', golaCor: PR, numero: BR },
      { lateral: PR, lateralFrente: 0.035, gola: 'v', golaCor: PR, punho: PR, tex: { t: 'pontos', k: 0.04 } },
    ],
    esquadrao: [        // Bahia: branca com azul e vermelho na gola, nos punhos e nas laterais; a 2 é a listrada tricolor
      { lateral: '#1f5bc4', lateralFrente: 0.03, gola: 'v', golaCor: '#1f5bc4', golaCor2: '#c8202e', punho: '#1f5bc4', punho2: '#c8202e', tex: { t: 'diagonais', k: 0.035 } },
      { camadas: [{ t: 'listras', c: ['#1f5bc4', BR, '#c8202e', BR], p: [2, 1, 2, 1], n: 12 }], manga: '#1f5bc4', punho: BR, gola: 'redonda', golaCor: '#1f5bc4', numero: PR },
    ],
    morumbi: [          // São Paulo: branca com as faixas vermelha e preta no peito; a 2 (2026) é a listrada tricolor com ombros pretos e gola polo branca
      { camadas: [{ t: 'banda', y: 0.24, f: [['#c8202e', 0.08], [BR, 0.03], [PR, 0.08]] }], gola: 'redonda', golaCor: PR, punho: '#c8202e', punho2: PR, tex: { t: 'linhas', k: 0.025 } },
      { camadas: [{ t: 'listras', c: ['#c8202e', BR, PR, BR], n: 12 }, { t: 'ombros', c: PR, h: 0.09, hm: 0.3 }], gola: 'polo', golaCor: BR, punho: PR, numero: BR },
    ],
    imortal: [          // Grêmio 2026: listras azul-celeste e pretas em degradê separadas por filetes brancos; mangas e laterais pretas
      { camadas: [{ t: 'listras', c: ['#2a7fd6', PR], n: 7, risca: BR, rw: 0.14, funde: 0.45 }], lateral: PR, manga: PR, punho: BR, gola: 'redonda', golaCor: PR, numero: BR },
      { gola: 'redonda', golaCor: '#2a7fd6', golaCor2: PR, punho: '#2a7fd6', punho2: PR, tex: { t: 'riscas', k: 0.03 } },
    ],
    touro: [            // Bragantino: branca com o vermelho nas laterais e na gola; a 2 é vermelha escurecendo para baixo
      { lateral: '#d01c2a', lateralFrente: 0.03, gola: 'v', golaCor: '#d01c2a', punho: '#d01c2a', tex: { t: 'diagonais', k: 0.04 } },
      { camadas: [{ t: 'degrade', c: '#7a0f16', de: 0.35, ate: 1.05 }], gola: 'v', golaCor: BR, punho: BR },
    ],
    galo: [             // Atlético-MG: listras verticais alvinegras (as mangas pretas); a 2 é preta com riscos finos
      { camadas: [{ t: 'listras', c: [PR, BR], n: 8 }], manga: PR, punho: BR, gola: 'redonda', golaCor: PR, numero: BR },
      { gola: 'v', golaCor: BR, punho: BR, tex: { t: 'linhas', k: 0.08 } },
    ],
    peixe: [            // Santos: branca lisa com os detalhes pretos; a 2 é a listrada alvinegra
      { gola: 'redonda', golaCor: PR, punho: PR, tex: { t: 'pontos', k: 0.035 } },
      { camadas: [{ t: 'listras', c: [PR, BR], n: 10 }], manga: PR, punho: BR, gola: 'redonda', golaCor: BR, numero: BR },
    ],
    timao: [            // Corinthians 2026: branca com traços curvos nas laterais e gola virada; a 2 é preta com listras brancas finas
      { gola: 'polo', golaCor: PR, punho: PR, tex: { t: 'curvas', k: 0.16 } },
      { camadas: [{ t: 'listras', c: [PR], n: 13, risca: BR, rw: 0.13 }], gola: 'polo', golaCor: BR, punho: BR, numero: BR },
    ],
    colina: [           // Vasco 2026: preta com a faixa diagonal branca e grafismos de água; a 2 é branca com a faixa preta, gola e mangas pretas
      { camadas: [{ t: 'faixa', c: BR, w: 0.19 }], gola: 'redonda', golaCor: BR, punho: BR, tex: { t: 'ondas', k: 0.09 } },
      { camadas: [{ t: 'faixa', c: PR, w: 0.19 }], manga: PR, punho: BR, gola: 'redonda', golaCor: PR, tex: { t: 'ondas', k: 0.06 } },
    ],
    leaodabarra: [      // Vitória: listras horizontais vermelhas e pretas; a 2 é branca com as faixas rubro-negras no peito
      { camadas: [{ t: 'aros', c: ['c', PR], n: 10 }], gola: 'v', golaCor: PR, punho: PR },
      { camadas: [{ t: 'banda', y: 0.4, f: [['#c8202e', 0.07], [PR, 0.07]] }], gola: 'v', golaCor: '#c8202e', punho: '#c8202e', punho2: PR },
    ],
    saci: [             // Internacional 2026: vermelha com linhas discretas e gola branca; a 2 é branca
      { gola: 'redonda', golaCor: BR, punho: BR, tex: { t: 'linhas', k: 0.08 } },
      { gola: 'v', golaCor: '#d0181f', punho: '#d0181f', tex: { t: 'pontos', k: 0.04 } },
    ],
    coxa: [             // Coritiba: branca com as duas faixas verdes no peito; a 2 é verde com as faixas brancas
      { camadas: [{ t: 'banda', y: 0.27, f: [['#0a6b34', 0.06], [BR, 0.045], ['#0a6b34', 0.06]] }], gola: 'redonda', golaCor: '#0a6b34', punho: '#0a6b34' },
      { camadas: [{ t: 'banda', y: 0.27, f: [[BR, 0.06], ['#0a6b34', 0.045], [BR, 0.06]] }], gola: 'redonda', golaCor: BR, punho: BR },
    ],
    furacao: [          // Athletico-PR: listras horizontais vermelhas e pretas; a 2 é branca com a faixa diagonal rubro-negra
      { camadas: [{ t: 'aros', c: ['c', PR], n: 8 }], gola: 'redonda', golaCor: PR, punho: PR },
      { camadas: [{ t: 'faixa', c: '#c8202e', w: 0.12, dir: -1, borda: PR, bw: 0.035 }], gola: 'redonda', golaCor: PR, punho: '#c8202e' },
    ],
    verdaooeste: [      // Chapecoense: verde com detalhes brancos e laterais mais escuras; a 2 é branca com uma faixa verde no peito
      { lateral: '#0a5a2d', lateralFrente: 0.03, gola: 'v', golaCor: BR, punho: BR, tex: { t: 'diagonais', k: 0.05 } },
      { camadas: [{ t: 'banda', y: 0.34, f: [['#0e7a3e', 0.045]] }], gola: 'v', golaCor: '#0e7a3e', punho: '#0e7a3e' },
    ],
    leaoazul: [         // Remo: azul-marinho com gola polo branca; a 2 é branca com o marinho
      { gola: 'polo', golaCor: BR, punho: BR, tex: { t: 'riscas', k: 0.07 } },
      { gola: 'polo', golaCor: '#14234a', punho: '#14234a', tex: { t: 'pontos', k: 0.04 } },
    ],

    // ------------------------------------------------------------------------------------------------- SÉRIE B
    fortalecer: [       // Fortaleza: listras horizontais vermelhas e azuis com filetes brancos; a 2 é branca com as faixas no peito
      { camadas: [{ t: 'aros', c: ['#c8202e', '#1d4fa0'], n: 8, risca: BR, rw: 0.16 }], gola: 'v', golaCor: BR, punho: '#1d4fa0' },
      { camadas: [{ t: 'banda', y: 0.3, f: [['#c8202e', 0.055], ['#1d4fa0', 0.055]] }], gola: 'v', golaCor: '#1d4fa0', punho: '#c8202e' },
    ],
    aurora: [           // Novorizontino (o Tigre do Vale): amarelo com as laterais pretas e listras de tigre; a 2 é preta
      { lateral: PR, lateralFrente: 0.03, gola: 'v', golaCor: PR, punho: PR, tex: { t: 'tigre', k: 0.09 } },
      { gola: 'v', golaCor: '#f2c230', punho: '#f2c230', tex: { t: 'tigre', k: 0.12 } },
    ],
    carvoeiro: [        // Criciúma: amarela com a faixa vertical preta no meio (com filete branco) e a textura de pelo de tigre; a 2 é branca
      { camadas: [{ t: 'vfaixa', c: PR, w: 0.15, borda: BR, bw: 0.02 }], gola: 'redonda', golaCor: PR, punho: PR, tex: { t: 'tigre', k: 0.08 } },
      { camadas: [{ t: 'vfaixa', c: '#f2c230', w: 0.1, borda: PR, bw: 0.025 }], gola: 'redonda', golaCor: PR, punho: '#f2c230' },
    ],
    vovo: [             // Ceará 2026: listras verticais alvinegras; a 2 é branca
      { camadas: [{ t: 'listras', c: [PR, BR], n: 9 }], manga: PR, punho: BR, gola: 'v', golaCor: BR, numero: BR },
      { lateral: PR, lateralFrente: 0.03, gola: 'v', golaCor: PR, punho: PR, tex: { t: 'pontos', k: 0.04 } },
    ],
    esmeraldino: [      // Goiás: verde com gola polo branca; a 2 é branca com uma faixa diagonal verde fina
      { gola: 'polo', golaCor: BR, punho: BR, tex: { t: 'xadrez', k: 0.045 } },
      { camadas: [{ t: 'faixa', c: '#1f7a3a', w: 0.07, dir: -1 }], gola: 'polo', golaCor: '#1f7a3a', punho: '#1f7a3a' },
    ],
    juventa: [          // Juventude: listras verticais verdes e brancas; a 2 é branca com as laterais verdes
      { camadas: [{ t: 'listras', c: ['#1f7a3a', BR], p: [3, 2], n: 9 }], manga: '#1f7a3a', punho: BR, gola: 'v', golaCor: BR, numero: PR },
      { lateral: '#1f7a3a', lateralFrente: 0.03, gola: 'v', golaCor: '#1f7a3a', punho: '#1f7a3a' },
    ],
    dourado: [          // Cuiabá: listras horizontais em degradê (a 26/27 real é amarela com o verde; aqui a 1 segue a cor do serieb.js, verde)
      { camadas: [{ t: 'aros', c: ['#127a3a', '#f2c230'], p: [3, 1], n: 7, funde: 0.5, y0: 0.08 }], gola: 'redonda', golaCor: '#f2c230', punho: '#f2c230' },
      { camadas: [{ t: 'aros', c: ['#f2c230', '#127a3a'], p: [3, 1], n: 7, funde: 0.5, y0: 0.08 }], gola: 'redonda', golaCor: '#127a3a', punho: '#127a3a' },
    ],
    rubronegro: [       // Sport: listras horizontais vermelhas e pretas largas; a 2 é branca com as faixas rubro-negras
      { camadas: [{ t: 'aros', c: ['c', PR], n: 7 }], gola: 'polo', golaCor: PR, punho: PR },
      { camadas: [{ t: 'banda', y: 0.36, f: [['#c8202e', 0.06], [PR, 0.06], ['#c8202e', 0.06]] }], gola: 'polo', golaCor: PR, punho: '#c8202e' },
    ],
    dragao: [           // Atlético-GO: listras verticais vermelhas e pretas; a 2 é preta com a faixa diagonal vermelha
      { camadas: [{ t: 'listras', c: ['c', PR], n: 9 }], manga: PR, punho: 'c', gola: 'v', golaCor: PR, numero: BR },
      { camadas: [{ t: 'faixa', c: '#c8202e', w: 0.08 }], gola: 'v', golaCor: '#c8202e', punho: '#c8202e' },
    ],
    avante: [           // Avaí: listras verticais azuis e brancas; a 2 é branca com as laterais azuis
      { camadas: [{ t: 'listras', c: ['#1d5fb0', BR], n: 9 }], manga: '#1d5fb0', punho: BR, gola: 'redonda', golaCor: BR, numero: PR },
      { lateral: '#1d5fb0', lateralFrente: 0.03, gola: 'redonda', golaCor: '#1d5fb0', punho: '#1d5fb0' },
    ],
    regatas: [          // CRB: listras horizontais vermelhas e brancas; a 2 é branca com a faixa vermelha no peito
      { camadas: [{ t: 'aros', c: ['c', BR], n: 9 }], gola: 'v', golaCor: BR, punho: 'c', numero: PR },
      { camadas: [{ t: 'banda', y: 0.33, f: [['#c8202e', 0.09]] }], gola: 'v', golaCor: '#c8202e', punho: '#c8202e' },
    ],
    coelhao: [          // América-MG: verde com as laterais pretas e a gola branca; a 2 é branca com as faixas verde e preta
      { lateral: PR, lateralFrente: 0.035, gola: 'polo', golaCor: BR, punho: PR, tex: { t: 'xadrez', k: 0.04 } },
      { camadas: [{ t: 'banda', y: 0.3, f: [['#1f8a3a', 0.06], [PR, 0.03]] }], gola: 'polo', golaCor: '#1f8a3a', punho: '#1f8a3a' },
    ],
    fantasma: [         // Operário-PR: listras verticais alvinegras; a 2 é branca
      { camadas: [{ t: 'listras', c: [PR, BR], n: 10 }], manga: PR, punho: BR, gola: 'redonda', golaCor: BR, numero: BR },
      { lateral: PR, lateralFrente: 0.03, gola: 'redonda', golaCor: PR, punho: PR },
    ],
    vilarubra: [        // Vila Nova: vermelha com detalhes brancos; a 2 é branca com o vermelho
      { gola: 'v', golaCor: BR, punho: BR, tex: { t: 'diagonais', k: 0.06 } },
      { lateral: '#c8202e', lateralFrente: 0.03, gola: 'v', golaCor: '#c8202e', punho: '#c8202e' },
    ],
    timbu: [            // Náutico 2026: listras verticais vermelhas e brancas com as laterais brancas, mangas vermelhas, gola V com contorno azul;
      //                   a 2 é branca com filetes verticais finos, gola vermelha atrás e branca na frente
      { camadas: [{ t: 'listras', c: ['c', BR], n: 10 }], lateral: BR, lateralFrente: 0.04, manga: 'c', punho: BR, gola: 'v', golaCor: 'c', golaCor2: '#1d4fa0', numero: PR },
      { camadas: [{ t: 'listras', c: [BR], n: 16, risca: '#e2e2de', rw: 0.12 }], gola: 'v', golaCor: BR, golaCor2: '#c8202e', punho: '#c8202e' },
    ],
    delrei: [           // Athletic Club (MG): listras verticais alvinegras; a 2 é branca com as laterais pretas
      { camadas: [{ t: 'listras', c: [PR, BR], p: [3, 2], n: 9 }], manga: PR, punho: BR, gola: 'v', golaCor: BR, numero: BR },
      { lateral: PR, lateralFrente: 0.03, gola: 'v', golaCor: PR, punho: PR, tex: { t: 'linhas', k: 0.03 } },
    ],
    bernao: [           // São Bernardo (o Tigre do ABC): amarelo com as laterais pretas e listras de tigre; a 2 é preta
      { lateral: PR, lateralFrente: 0.03, gola: 'redonda', golaCor: PR, punho: PR, tex: { t: 'tigre', k: 0.1 } },
      { lateral: '#f2c230', lateralFrente: 0.03, gola: 'redonda', golaCor: '#f2c230', punho: '#f2c230', tex: { t: 'tigre', k: 0.12 } },
    ],
    pinguela: [         // Ponte Preta: branca com a faixa diagonal preta (do ombro esquerdo); a 2 é preta com a faixa branca
      { camadas: [{ t: 'faixa', c: PR, w: 0.17, dir: -1 }], gola: 'redonda', golaCor: PR, punho: PR },
      { camadas: [{ t: 'faixa', c: BR, w: 0.17, dir: -1 }], gola: 'redonda', golaCor: BR, punho: BR },
    ],
    fogareu: [          // Botafogo-SP: vermelha com listras finas brancas e pretas; a 2 é branca com os filetes vermelho e preto
      { camadas: [{ t: 'listras', c: ['c', BR, PR, BR], p: [5, 1, 1, 1], n: 16 }], manga: 'c', punho: PR, gola: 'redonda', golaCor: PR, numero: BR },
      { camadas: [{ t: 'listras', c: [BR, '#c8202e', BR, PR], p: [5, 1, 1, 1], n: 16 }], manga: BR, punho: '#c8202e', gola: 'redonda', golaCor: '#c8202e', numero: PR },
    ],
    tubarao: [          // Londrina (o Tubarão): azul-celeste com ondas e detalhes brancos; a 2 é branca com o celeste
      { gola: 'v', golaCor: BR, punho: BR, tex: { t: 'ondas', k: 0.1 } },
      { lateral: '#3a9ad8', lateralFrente: 0.03, gola: 'v', golaCor: '#3a9ad8', punho: '#3a9ad8', tex: { t: 'ondas', k: 0.05 } },
    ],
  };

  // a pixel art do peito (16 x 16) de cada time; sem nada, vai o escudo do time reduzido (ver o começo do arquivo)
  const PEITO = {};

  const kit = (k, n) => {
    const K = KITS[k], M = K && K[n ? 1 : 0];
    if (!M && !PEITO[k]) return null;
    const r = {};
    if (M) r.modelo = M;
    if (PEITO[k]) r.peito = PEITO[k];
    return r;
  };
  window.Uniformes = { kit, KITS, PEITO, times: () => Object.keys(KITS) };
  if (window.FutebolJS && window.FutebolJS.registrarFase) window.FutebolJS.registrarFase({ id: 'uniformes', nome: 'Uniformes dos times', nucleoMinimo: '7.4', iniciar: async () => {}, Uniformes: window.Uniformes });
})();
