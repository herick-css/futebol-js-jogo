// =====================================================================================================================
// UNIFORMES: o desenho das camisas 1 e 2 dos 40 times do Brasileirão A e do Brasileirão B e (7.5.2) dos 40 da Espanha e da Inglaterra e dos 56 de França, Alemanha e Itália e dos 82 de Argentina, Chile, Bolívia e Colômbia
//   (as paródias do serieb.js) e o espaço da
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
    ],    // ------------------------------------------------------------------------------------------------- (7.5.2) ESPANHA
    blaugrana: [        // Barcelona: listras largas azul-grená com detalhes dourados; a 2 é dourada
      { camadas: [{ t: 'listras', c: ['c', 'l'], n: 5 }], gola: 'redonda', golaCor: '#edbb00', punho: '#edbb00', numero: '#edbb00' },
      { gola: 'v', golaCor: '#a50044', golaCor2: '#004d98', punho: '#a50044', tex: { t: 'diagonais', k: 0.05 } },
    ],
    merengue: [         // Real Madrid: branca com detalhes dourados e gola polo; a 2 é azul-marinho
      { gola: 'polo', golaCor: '#c9a227', punho: '#c9a227', numero: '#1c2a4a', tex: { t: 'linhas', k: 0.03 } },
      { gola: 'v', golaCor: '#c9a227', punho: '#c9a227', tex: { t: 'riscas', k: 0.05 } },
    ],
    colchonero: [       // Atlético de Madrid: listras verticais vermelhas e brancas, gola azul; a 2 é azul-marinho
      { camadas: [{ t: 'listras', c: ['c', 'l'], n: 9 }], gola: 'redonda', golaCor: '#1d2f6f', punho: '#1d2f6f', numero: '#1d2f6f' },
      { gola: 'v', golaCor: '#c8202e', punho: '#c8202e', tex: { t: 'pontos', k: 0.04 } },
    ],
    submarino: [        // Villarreal: amarela com detalhes azuis; a 2 é azul
      { lateral: '#1d4fa0', lateralFrente: 0.025, gola: 'v', golaCor: '#1d4fa0', punho: '#1d4fa0', numero: '#1d4fa0', tex: { t: 'ondas', k: 0.05 } },
      { gola: 'v', golaCor: '#ffe02a', punho: '#ffe02a', tex: { t: 'ondas', k: 0.05 } },
    ],
    verdiblanco: [      // Betis: listras verticais verdes e brancas com gola polo; a 2 é amarela
      { camadas: [{ t: 'listras', c: ['c', 'l'], n: 9 }], gola: 'polo', golaCor: '#0b8f3c', punho: '#0b8f3c', numero: '#0b8f3c' },
      { gola: 'redonda', golaCor: '#0b8f3c', punho: '#0b8f3c', tex: { t: 'diagonais', k: 0.05 } },
    ],
    leones: [           // Athletic: listras vermelhas e brancas, calção preto; a 2 é verde
      { camadas: [{ t: 'listras', c: ['c', 'l'], n: 7 }], gola: 'redonda', golaCor: PR, punho: BR, numero: PR },
      { gola: 'v', golaCor: BR, punho: BR, tex: { t: 'curvas', k: 0.05 } },
    ],
    txuriurdin: [       // Real Sociedad: listras azuis e brancas com gola polo; a 2 é preta e laranja
      { camadas: [{ t: 'listras', c: ['c', 'l'], n: 9 }], gola: 'polo', golaCor: BR, punho: BR, numero: PR },
      { lateral: '#e8742a', lateralFrente: 0.03, gola: 'redonda', golaCor: '#e8742a', punho: '#e8742a' },
    ],
    celeste: [          // Celta: celeste com detalhes brancos e vermelhos; a 2 é azul-marinho
      { gola: 'redonda', golaCor: BR, golaCor2: '#c8202e', punho: BR, punho2: '#c8202e', tex: { t: 'xadrez', k: 0.03 } },
      { gola: 'v', golaCor: '#8ac6ea', punho: '#8ac6ea', tex: { t: 'riscas', k: 0.05 } },
    ],
    nervion: [          // Sevilla: branca com o vermelho na gola, nos punhos e nas laterais; a 2 é vermelha
      { lateral: '#d01c2a', lateralFrente: 0.02, gola: 'redonda', golaCor: '#d01c2a', punho: '#d01c2a', tex: { t: 'linhas', k: 0.03 } },
      { gola: 'v', golaCor: BR, punho: BR, tex: { t: 'diagonais', k: 0.05 } },
    ],
    murcielago: [       // Valencia: branca com preto e laranja; a 2 é preta com ombros laranja
      { gola: 'redonda', golaCor: PR, golaCor2: '#e8742a', punho: PR, punho2: '#e8742a', tex: { t: 'pontos', k: 0.04 } },
      { camadas: [{ t: 'ombros', c: '#e8742a', h: 0.06 }], gola: 'v', golaCor: '#e8742a', punho: '#e8742a' },
    ],
    azulon: [           // Getafe: azul com detalhes brancos; a 2 é branca
      { gola: 'v', golaCor: BR, punho: BR, tex: { t: 'riscas', k: 0.05 } },
      { lateral: '#1d4fa0', lateralFrente: 0.03, gola: 'v', golaCor: '#1d4fa0', punho: '#1d4fa0' },
    ],
    franjirrojo: [      // Rayo Vallecano: branca com a faixa diagonal vermelha; a 2 é preta com a faixa vermelha
      { camadas: [{ t: 'faixa', c: '#d01c2a', w: 0.17, dir: 1 }], gola: 'redonda', golaCor: '#d01c2a', punho: '#d01c2a', numero: PR },
      { camadas: [{ t: 'faixa', c: '#d01c2a', w: 0.17, dir: 1 }], gola: 'redonda', golaCor: '#d01c2a', punho: '#d01c2a', numero: BR },
    ],
    perico: [           // Espanyol: listras azuis e brancas, calção azul; a 2 é preta
      { camadas: [{ t: 'listras', c: ['c', 'l'], n: 7 }], gola: 'redonda', golaCor: '#1859b8', punho: '#1859b8', numero: PR },
      { gola: 'v', golaCor: '#1859b8', punho: '#1859b8', tex: { t: 'diagonais', k: 0.05 } },
    ],
    babazorro: [        // Alavés: listras finas azuis e brancas; a 2 é preta
      { camadas: [{ t: 'listras', c: ['c', 'l'], n: 11 }], gola: 'v', golaCor: '#1a3f99', punho: BR, numero: PR },
      { gola: 'redonda', golaCor: '#1a3f99', punho: '#1a3f99', tex: { t: 'linhas', k: 0.04 } },
    ],
    franjiverde: [      // Elche: branca com a faixa verde no peito, calção preto; a 2 é verde com a faixa branca
      { camadas: [{ t: 'banda', y: 0.3, f: [['#0f8a3c', 0.13]] }], gola: 'redonda', golaCor: '#0f8a3c', punho: '#0f8a3c', numero: PR },
      { camadas: [{ t: 'banda', y: 0.3, f: [[BR, 0.13]] }], gola: 'redonda', golaCor: BR, punho: BR },
    ],
    granota: [          // Levante: listras azul e grená; a 2 é branca
      { camadas: [{ t: 'listras', c: ['c', 'l'], n: 9 }], gola: 'v', golaCor: '#a3123a', punho: '#a3123a', numero: BR },
      { gola: 'v', golaCor: '#a3123a', golaCor2: '#1d3f8f', punho: '#a3123a', tex: { t: 'riscas', k: 0.05 } },
    ],
    rojillo: [          // Osasuna: vermelha com detalhes azul-marinho; a 2 é branca
      { gola: 'redonda', golaCor: '#1c2a4a', punho: '#1c2a4a', tex: { t: 'diagonais', k: 0.05 } },
      { lateral: '#c41a2a', lateralFrente: 0.03, gola: 'redonda', golaCor: '#c41a2a', punho: '#c41a2a' },
    ],
    racinguista: [      // Racing de Santander: branca com o verde na gola e nas laterais, calção preto; a 2 é verde
      { lateral: '#0f8a3c', lateralFrente: 0.02, gola: 'polo', golaCor: '#0f8a3c', punho: '#0f8a3c', tex: { t: 'linhas', k: 0.03 } },
      { gola: 'v', golaCor: PR, punho: PR, tex: { t: 'riscas', k: 0.05 } },
    ],
    branquiazul: [      // Deportivo: listras azuis e brancas; a 2 é grená
      { camadas: [{ t: 'listras', c: ['c', 'l'], n: 9 }], gola: 'redonda', golaCor: '#1f6fd0', punho: BR, numero: PR },
      { gola: 'v', golaCor: BR, punho: BR, tex: { t: 'pontos', k: 0.04 } },
    ],
    boquerones: [       // Málaga: listras celestes e brancas, calção azul; a 2 é preta
      { camadas: [{ t: 'listras', c: ['c', 'l'], n: 9 }], gola: 'redonda', golaCor: '#1a3f99', punho: '#1a3f99', numero: '#1a3f99' },
      { gola: 'v', golaCor: '#4aa0e8', punho: '#4aa0e8', tex: { t: 'ondas', k: 0.05 } },
    ],
    // ------------------------------------------------------------------------------------------------- (7.5.2) INGLATERRA
    gunners: [          // Arsenal: vermelha com as mangas brancas; a 2 é preta
      { manga: BR, punho: '#e0161e', gola: 'v', golaCor: BR, golaCor2: '#e0161e', numero: BR },
      { gola: 'v', golaCor: '#e0161e', punho: '#e0161e', tex: { t: 'riscas', k: 0.05 } },
    ],
    citizens: [         // Manchester City: azul-celeste com detalhes azul-marinho; a 2 é azul-marinho
      { gola: 'v', golaCor: '#1c2c5b', punho: '#1c2c5b', tex: { t: 'xadrez', k: 0.03 } },
      { gola: 'redonda', golaCor: '#6cabdd', punho: '#6cabdd', tex: { t: 'diagonais', k: 0.05 } },
    ],
    reddevils: [        // Manchester United: vermelha com gola polo preta, calção branco; a 2 é branca
      { gola: 'polo', golaCor: PR, punho: PR, numero: BR, tex: { t: 'linhas', k: 0.03 } },
      { gola: 'polo', golaCor: '#da1a2a', punho: '#da1a2a' },
    ],
    villans: [          // Aston Villa: grená com as mangas azul-celeste; a 2 é branca
      { manga: '#95bfe5', punho: '#95bfe5', gola: 'v', golaCor: '#95bfe5', numero: BR },
      { gola: 'v', golaCor: '#670e36', golaCor2: '#95bfe5', punho: '#670e36', tex: { t: 'riscas', k: 0.04 } },
    ],
    merseyreds: [       // Liverpool: toda vermelha com detalhes brancos; a 2 é branca
      { gola: 'v', golaCor: BR, punho: BR, numero: BR, tex: { t: 'pontos', k: 0.03 } },
      { gola: 'redonda', golaCor: '#c8102e', punho: '#c8102e' },
    ],
    cherries: [         // Bournemouth: listras vermelhas e pretas; a 2 é branca
      { camadas: [{ t: 'listras', c: ['c', 'l'], n: 11 }], gola: 'v', golaCor: PR, punho: PR, numero: BR },
      { gola: 'v', golaCor: '#da291c', punho: '#da291c' },
    ],
    blackcats: [        // Sunderland: listras vermelhas e brancas, calção preto; a 2 é azul-marinho
      { camadas: [{ t: 'listras', c: ['c', 'l'], n: 9 }], gola: 'v', golaCor: PR, punho: PR, numero: PR },
      { gola: 'v', golaCor: '#eb172b', punho: '#eb172b', tex: { t: 'linhas', k: 0.04 } },
    ],
    seagulls: [         // Brighton: listras azuis e brancas com as mangas azuis; a 2 é amarela
      { camadas: [{ t: 'listras', c: ['c', 'l'], n: 9 }], manga: 'c', punho: BR, gola: 'redonda', golaCor: '#0057b8', numero: PR },
      { gola: 'v', golaCor: '#0057b8', punho: '#0057b8' },
    ],
    bees: [             // Brentford: listras vermelhas e brancas, calção preto; a 2 é amarela e preta (as abelhas)
      { camadas: [{ t: 'listras', c: ['c', 'l'], n: 9 }], gola: 'redonda', golaCor: PR, punho: PR, numero: PR },
      { lateral: PR, lateralFrente: 0.03, gola: 'v', golaCor: PR, punho: PR, tex: { t: 'xadrez', k: 0.05 } },
    ],
    kingsroad: [        // Chelsea: azul-royal com detalhes brancos; a 2 é creme
      { gola: 'redonda', golaCor: BR, punho: BR, numero: BR, tex: { t: 'linhas', k: 0.03 } },
      { gola: 'v', golaCor: '#034694', punho: '#034694' },
    ],
    cottagers: [        // Fulham: branca com detalhes pretos; a 2 é vermelha
      { lateral: PR, lateralFrente: 0.02, gola: 'redonda', golaCor: PR, punho: PR },
      { gola: 'v', golaCor: PR, punho: PR, tex: { t: 'diagonais', k: 0.05 } },
    ],
    magpies: [          // Newcastle: listras verticais alvinegras; a 2 é verde-azulada
      { camadas: [{ t: 'listras', c: ['l', 'c'], n: 9 }], gola: 'redonda', golaCor: PR, punho: BR, numero: '#f2c230' },
      { gola: 'v', golaCor: BR, punho: BR, tex: { t: 'riscas', k: 0.05 } },
    ],
    toffees: [          // Everton: azul-royal com detalhes brancos; a 2 é âmbar
      { gola: 'v', golaCor: BR, punho: BR, numero: BR, tex: { t: 'xadrez', k: 0.03 } },
      { gola: 'redonda', golaCor: '#1c2a4a', punho: '#1c2a4a' },
    ],
    peacocks: [         // Leeds: toda branca com azul e amarelo; a 2 é azul
      { gola: 'v', golaCor: '#1d428a', golaCor2: '#ffcd00', punho: '#1d428a', punho2: '#ffcd00', tex: { t: 'linhas', k: 0.03 } },
      { gola: 'v', golaCor: '#ffcd00', punho: '#ffcd00', tex: { t: 'riscas', k: 0.05 } },
    ],
    eagles: [           // Crystal Palace: listras vermelhas e azuis; a 2 é branca com a faixa diagonal
      { camadas: [{ t: 'listras', c: ['l', 'c'], n: 7 }], gola: 'redonda', golaCor: '#1b458f', punho: '#1b458f', numero: BR },
      { camadas: [{ t: 'faixa', c: '#c4122e', w: 0.12, dir: -1, borda: '#1b458f', bw: 0.03 }], gola: 'redonda', golaCor: '#1b458f', punho: '#c4122e' },
    ],
    sherwood: [         // Nottingham Forest: vermelha com detalhes brancos; a 2 é branca
      { gola: 'v', golaCor: BR, punho: BR, numero: BR, tex: { t: 'curvas', k: 0.04 } },
      { gola: 'v', golaCor: '#dd0000', punho: '#dd0000' },
    ],
    lilywhites: [       // Tottenham: branca com gola polo azul-marinho; a 2 é azul-marinho
      { gola: 'polo', golaCor: '#132257', punho: '#132257', tex: { t: 'linhas', k: 0.025 } },
      { gola: 'v', golaCor: BR, punho: BR, tex: { t: 'diagonais', k: 0.05 } },
    ],
    skyblues: [         // Coventry: azul-celeste com detalhes brancos; a 2 é azul-marinho
      { gola: 'v', golaCor: BR, punho: BR, tex: { t: 'ondas', k: 0.04 } },
      { gola: 'v', golaCor: '#59a9e0', punho: '#59a9e0' },
    ],
    tractors: [         // Ipswich: azul com detalhes brancos; a 2 é vermelha
      { lateral: BR, lateralFrente: 0.02, gola: 'v', golaCor: BR, punho: BR, tex: { t: 'linhas', k: 0.03 } },
      { gola: 'redonda', golaCor: BR, punho: BR },
    ],
    tigers: [           // Hull City: listras âmbar e pretas, calção preto; a 2 é branca com listras de tigre
      { camadas: [{ t: 'listras', c: ['c', 'l'], n: 9 }], manga: 'c', punho: PR, gola: 'redonda', golaCor: PR, numero: PR },
      { gola: 'v', golaCor: PR, punho: '#f5a12d', tex: { t: 'tigre', k: 0.08 } },
    ],
    // ------------------------------------------------------------------------------------------------- FRANÇA
    capitale: [         // PSG: azul-marinho com a faixa vertical vermelha de bordas brancas; a 2 é branca com a faixa fina
      { camadas: [{ t: 'vfaixa', c: '#da291c', x: 0.5, w: 0.22, borda: BR, bw: 0.035 }], manga: 'c', gola: 'redonda', golaCor: '#da291c', punho: '#da291c', numero: BR },
      { camadas: [{ t: 'vfaixa', c: '#0b2a5b', x: 0.5, w: 0.13, borda: '#da291c', bw: 0.03 }], gola: 'redonda', golaCor: '#0b2a5b', punho: '#0b2a5b', numero: '#0b2a5b' },
    ],
    vieuxport: [        // Olympique de Marseille: branca com detalhes azul-celeste; a 2 é celeste
      { gola: 'v', golaCor: '#4fb3e8', punho: '#4fb3e8', numero: '#1c2a4a', tex: { t: 'linhas', k: 0.03 } },
      { gola: 'v', golaCor: BR, punho: BR, numero: '#1c2a4a', tex: { t: 'ondas', k: 0.05 } },
    ],
    gones: [            // Lyon: branca com a faixa diagonal vermelha e azul; a 2 é azul-marinho
      { camadas: [{ t: 'faixa', c: '#c8202e', w: 0.1, dir: 1, borda: '#1d4fa0', bw: 0.045 }], gola: 'redonda', golaCor: '#1d4fa0', punho: '#c8202e', numero: '#1d4fa0' },
      { gola: 'v', golaCor: '#c8202e', punho: '#c8202e', tex: { t: 'riscas', k: 0.05 } },
    ],
    rocher: [           // Monaco: metade vermelha e metade branca; a 2 é branca com o vermelho
      { camadas: [{ t: 'metade', c: BR, lado: 1 }], gola: 'redonda', golaCor: '#c9a227', punho: '#c9a227', numero: '#1c1c1f' },
      { lateral: '#d4111e', lateralFrente: 0.03, gola: 'v', golaCor: '#d4111e', punho: '#d4111e', tex: { t: 'diagonais', k: 0.04 } },
    ],
    dogues: [           // Lille: vermelha com detalhes azul-marinho, calção azul; a 2 é branca
      { gola: 'v', golaCor: '#1c2a4a', punho: '#1c2a4a', numero: BR, tex: { t: 'xadrez', k: 0.03 } },
      { gola: 'v', golaCor: '#d01f2f', golaCor2: '#1c2a4a', punho: '#d01f2f', tex: { t: 'linhas', k: 0.03 } },
    ],
    sangetor: [         // Lens: o "sangue e ouro", amarela com as mangas vermelhas; a 2 é preta com o dourado
      { manga: '#d71920', punho: '#f6d100', gola: 'redonda', golaCor: '#d71920', numero: '#d71920' },
      { gola: 'v', golaCor: '#f6d100', golaCor2: '#d71920', punho: '#f6d100', tex: { t: 'riscas', k: 0.05 } },
    ],
    breton: [           // Rennes: vermelha com os ombros pretos, calção preto; a 2 é branca
      { camadas: [{ t: 'ombros', c: PR, h: 0.1, hm: 0.3 }], gola: 'v', golaCor: PR, punho: PR, numero: BR },
      { gola: 'v', golaCor: '#e2001a', golaCor2: PR, punho: '#e2001a', tex: { t: 'linhas', k: 0.03 } },
    ],
    aiglons: [          // Nice: listras vermelhas e pretas, calção preto; a 2 é branca
      { camadas: [{ t: 'listras', c: ['c', 'l'], n: 9 }], gola: 'redonda', golaCor: PR, punho: PR, numero: BR },
      { gola: 'v', golaCor: '#c8102e', punho: '#c8102e', tex: { t: 'pontos', k: 0.04 } },
    ],
    alsacien: [         // Strasbourg: azul com detalhes brancos e calção branco; a 2 é branca
      { gola: 'v', golaCor: BR, punho: BR, numero: BR, tex: { t: 'ondas', k: 0.04 } },
      { lateral: '#1d5fbf', lateralFrente: 0.025, gola: 'v', golaCor: '#1d5fbf', punho: '#1d5fbf' },
    ],
    violets: [          // Toulouse: roxa com detalhes brancos; a 2 é branca com o roxo
      { gola: 'v', golaCor: BR, punho: BR, numero: BR, tex: { t: 'diagonais', k: 0.04 } },
      { camadas: [{ t: 'banda', y: 0.3, f: [['#5b2a86', 0.08]] }], gola: 'redonda', golaCor: '#5b2a86', punho: '#5b2a86' },
    ],
    merlus: [           // Lorient: laranja com detalhes pretos; a 2 é preta
      { gola: 'v', golaCor: PR, punho: PR, numero: PR, tex: { t: 'ondas', k: 0.05 } },
      { gola: 'v', golaCor: '#f47a20', punho: '#f47a20', tex: { t: 'linhas', k: 0.04 } },
    ],
    lumiere: [          // Paris FC: azul-marinho com o celeste nos detalhes; a 2 é branca
      { camadas: [{ t: 'banda', y: 0.34, f: [['#7fb8e6', 0.05]] }], gola: 'redonda', golaCor: '#7fb8e6', punho: '#7fb8e6', numero: BR },
      { gola: 'v', golaCor: '#16274d', punho: '#16274d', tex: { t: 'riscas', k: 0.04 } },
    ],
    finistere: [        // Brest: vermelha com detalhes brancos; a 2 é branca
      { gola: 'redonda', golaCor: BR, punho: BR, numero: BR, tex: { t: 'ondas', k: 0.05 } },
      { gola: 'redonda', golaCor: '#e2001a', punho: '#e2001a', tex: { t: 'linhas', k: 0.03 } },
    ],
    scoistes: [         // Angers: listras pretas e brancas; a 2 é branca
      { camadas: [{ t: 'listras', c: ['l', 'c'], n: 9 }], gola: 'redonda', golaCor: PR, punho: PR, numero: '#f2c230' },
      { gola: 'v', golaCor: PR, punho: PR, tex: { t: 'diagonais', k: 0.04 } },
    ],
    cielmarine: [       // Le Havre: metade celeste e metade azul-marinho; a 2 é branca
      { camadas: [{ t: 'metade', c: '#1c2a4a', lado: 1 }], gola: 'redonda', golaCor: '#1c2a4a', punho: BR, numero: BR },
      { gola: 'v', golaCor: '#7fc4ea', golaCor2: '#1c2a4a', punho: '#7fc4ea' },
    ],
    abbaye: [           // Auxerre: branca com detalhes azuis; a 2 é azul
      { lateral: '#1d4fa0', lateralFrente: 0.02, gola: 'v', golaCor: '#1d4fa0', punho: '#1d4fa0', numero: '#1d4fa0' },
      { gola: 'v', golaCor: BR, punho: BR, tex: { t: 'riscas', k: 0.05 } },
    ],
    champenois: [       // Troyes: azul com detalhes brancos; a 2 é branca
      { gola: 'redonda', golaCor: BR, punho: BR, numero: BR, tex: { t: 'pontos', k: 0.04 } },
      { gola: 'v', golaCor: '#1a4a9e', punho: '#1a4a9e' },
    ],
    vingtquatre: [      // Le Mans: vermelha com detalhes amarelos, calção preto; a 2 é branca
      { camadas: [{ t: 'banda', y: 0.3, f: [['#f2c230', 0.05], [PR, 0.04]] }], gola: 'v', golaCor: '#f2c230', punho: '#f2c230', numero: '#f2c230' },
      { gola: 'v', golaCor: '#d01c2a', punho: '#d01c2a', tex: { t: 'diagonais', k: 0.04 } },
    ],
    // ------------------------------------------------------------------------------------------------- ALEMANHA
    isar: [             // Bayern: vermelha com detalhes brancos; a 2 é branca com o vermelho e o azul
      { gola: 'redonda', golaCor: BR, punho: BR, numero: BR, tex: { t: 'xadrez', k: 0.035 } },
      { camadas: [{ t: 'banda', y: 0.32, f: [['#dc052d', 0.04], ['#0b2a5b', 0.03]] }], gola: 'v', golaCor: '#dc052d', punho: '#dc052d' },
    ],
    ruhrgelb: [         // Borussia Dortmund: amarela com a gola e os punhos pretos, calção preto; a 2 é preta com o amarelo
      { gola: 'v', golaCor: PR, punho: PR, numero: PR, tex: { t: 'diagonais', k: 0.05 } },
      { lateral: '#fde100', lateralFrente: 0.025, gola: 'v', golaCor: '#fde100', punho: '#fde100', numero: '#fde100' },
    ],
    messebullen: [      // RB Leipzig: branca com o vermelho e o azul-marinho; a 2 é azul-marinho
      { lateral: '#dd0741', lateralFrente: 0.02, gola: 'v', golaCor: '#0c2043', punho: '#dd0741', numero: '#0c2043' },
      { gola: 'v', golaCor: '#dd0741', punho: '#dd0741', tex: { t: 'riscas', k: 0.05 } },
    ],
    brustring: [        // Stuttgart: branca com o anel vermelho no peito; a 2 é vermelha com o anel branco
      { camadas: [{ t: 'banda', y: 0.3, f: [['#e32219', 0.11]] }], gola: 'redonda', golaCor: '#e32219', punho: '#e32219', numero: '#e32219' },
      { camadas: [{ t: 'banda', y: 0.3, f: [[BR, 0.11]] }], gola: 'redonda', golaCor: BR, punho: BR, numero: BR },
    ],
    kraichgau: [        // Hoffenheim: azul com detalhes brancos; a 2 é branca
      { gola: 'v', golaCor: BR, punho: BR, numero: BR, tex: { t: 'curvas', k: 0.04 } },
      { gola: 'v', golaCor: '#1961b5', punho: '#1961b5' },
    ],
    werkself: [         // Leverkusen: vermelha com as laterais e os ombros pretos; a 2 é branca
      { camadas: [{ t: 'ombros', c: PR, h: 0.08, hm: 0.25 }], lateral: PR, lateralFrente: 0.03, gola: 'v', golaCor: PR, punho: PR, numero: BR },
      { gola: 'v', golaCor: '#e32221', golaCor2: PR, punho: '#e32221', tex: { t: 'linhas', k: 0.03 } },
    ],
    breisgau: [         // Freiburg: vermelha com detalhes brancos e calção preto; a 2 é branca
      { gola: 'v', golaCor: BR, punho: BR, numero: BR, tex: { t: 'riscas', k: 0.04 } },
      { gola: 'v', golaCor: '#e2001a', punho: '#e2001a', tex: { t: 'pontos', k: 0.03 } },
    ],
    adlermain: [        // Eintracht Frankfurt: preta com detalhes vermelhos; a 2 é branca
      { lateral: '#e1000f', lateralFrente: 0.025, gola: 'v', golaCor: '#e1000f', punho: '#e1000f', numero: BR, tex: { t: 'diagonais', k: 0.04 } },
      { gola: 'redonda', golaCor: PR, golaCor2: '#e1000f', punho: PR },
    ],
    fugger: [           // Augsburg: metade vermelha e metade branca com o verde nos detalhes; a 2 é branca
      { camadas: [{ t: 'metade', c: BR, lado: 1 }], gola: 'redonda', golaCor: '#46714d', punho: '#46714d', numero: '#46714d' },
      { gola: 'v', golaCor: '#ba3733', golaCor2: '#46714d', punho: '#ba3733' },
    ],
    karneval: [         // Mainz: vermelha com detalhes brancos e calção branco; a 2 é branca
      { gola: 'v', golaCor: BR, punho: BR, numero: BR, tex: { t: 'pontos', k: 0.05 } },
      { gola: 'v', golaCor: '#c3141e', punho: '#c3141e' },
    ],
    eiserne: [          // Union Berlin: vermelha com detalhes brancos; a 2 é branca
      { gola: 'polo', golaCor: BR, punho: BR, numero: BR, tex: { t: 'linhas', k: 0.03 } },
      { gola: 'polo', golaCor: '#d4011d', punho: '#d4011d' },
    ],
    fohlen: [           // Borussia Mönchengladbach: branca com o preto e o verde; a 2 é preta com o verde
      { camadas: [{ t: 'banda', y: 0.3, f: [[PR, 0.05], ['#00a650', 0.04]] }], gola: 'v', golaCor: PR, punho: '#00a650', numero: PR },
      { gola: 'v', golaCor: '#00a650', punho: '#00a650', tex: { t: 'riscas', k: 0.05 } },
    ],
    rothosen: [         // Hamburgo: branca com detalhes azuis e o calção vermelho; a 2 é azul
      { gola: 'redonda', golaCor: '#0a3f86', punho: '#0a3f86', numero: '#0a3f86', tex: { t: 'xadrez', k: 0.03 } },
      { gola: 'v', golaCor: BR, punho: BR, tex: { t: 'ondas', k: 0.04 } },
    ],
    geissbock: [        // Colônia: branca com detalhes vermelhos; a 2 é vermelha
      { lateral: '#ed1c24', lateralFrente: 0.025, gola: 'redonda', golaCor: '#ed1c24', punho: '#ed1c24', numero: '#ed1c24' },
      { gola: 'redonda', golaCor: BR, punho: BR, tex: { t: 'diagonais', k: 0.04 } },
    ],
    weser: [            // Werder Bremen: verde com detalhes brancos; a 2 é branca com o verde
      { gola: 'v', golaCor: BR, punho: BR, numero: BR, tex: { t: 'ondas', k: 0.05 } },
      { camadas: [{ t: 'faixa', c: '#1d9053', w: 0.08, dir: 1 }], gola: 'v', golaCor: '#1d9053', punho: '#1d9053' },
    ],
    knappen: [          // Schalke: azul-royal com detalhes brancos e calção branco; a 2 é branca
      { gola: 'redonda', golaCor: BR, punho: BR, numero: BR, tex: { t: 'linhas', k: 0.035 } },
      { gola: 'redonda', golaCor: '#004d9d', punho: '#004d9d' },
    ],
    saarwunder: [       // Elversberg: preta com detalhes brancos; a 2 é branca
      { gola: 'v', golaCor: BR, punho: BR, numero: BR, tex: { t: 'riscas', k: 0.04 } },
      { gola: 'v', golaCor: PR, punho: PR, tex: { t: 'linhas', k: 0.03 } },
    ],
    paderquell: [       // Paderborn: listras azuis e pretas em degradê; a 2 é branca
      { camadas: [{ t: 'listras', c: ['c', 'l'], n: 7, funde: 0.4 }], gola: 'redonda', golaCor: BR, punho: BR, numero: BR },
      { gola: 'v', golaCor: '#1c3e8a', punho: '#1c3e8a' },
    ],
    // ------------------------------------------------------------------------------------------------- ITÁLIA
    biscione: [         // Inter: listras azuis e pretas; a 2 é branca
      { camadas: [{ t: 'listras', c: ['c', 'l'], n: 9 }], gola: 'redonda', golaCor: PR, punho: PR, numero: '#f2c230' },
      { gola: 'v', golaCor: '#0068a8', golaCor2: PR, punho: '#0068a8', tex: { t: 'riscas', k: 0.04 } },
    ],
    vesuvio: [          // Napoli: azul-celeste com detalhes brancos; a 2 é branca
      { gola: 'v', golaCor: BR, punho: BR, numero: BR, tex: { t: 'ondas', k: 0.05 } },
      { gola: 'v', golaCor: '#12a0d7', punho: '#12a0d7', tex: { t: 'linhas', k: 0.03 } },
    ],
    lupa: [             // Roma: grená com detalhes dourados; a 2 é branca
      { gola: 'v', golaCor: '#f0bc42', punho: '#f0bc42', numero: '#f0bc42', tex: { t: 'diagonais', k: 0.04 } },
      { gola: 'v', golaCor: '#8e1f2f', golaCor2: '#f0bc42', punho: '#8e1f2f' },
    ],
    lariani: [          // Como: azul com detalhes brancos; a 2 é branca
      { gola: 'polo', golaCor: BR, punho: BR, numero: BR, tex: { t: 'ondas', k: 0.04 } },
      { gola: 'polo', golaCor: '#1a4f9c', punho: '#1a4f9c' },
    ],
    diavolo: [          // Milan: listras vermelhas e pretas, calção branco; a 2 é branca
      { camadas: [{ t: 'listras', c: ['c', 'l'], n: 9 }], gola: 'redonda', golaCor: PR, punho: PR, numero: BR },
      { gola: 'redonda', golaCor: '#fb090b', golaCor2: PR, punho: '#fb090b', tex: { t: 'linhas', k: 0.03 } },
    ],
    signora: [          // Juventus: listras pretas e brancas; a 2 é preta com o dourado
      { camadas: [{ t: 'listras', c: ['l', 'c'], n: 9 }], gola: 'redonda', golaCor: PR, punho: PR, numero: '#f2c230' },
      { gola: 'v', golaCor: '#f2c230', punho: '#f2c230', numero: '#f2c230', tex: { t: 'riscas', k: 0.05 } },
    ],
    dea: [              // Atalanta: listras largas azuis e pretas; a 2 é branca
      { camadas: [{ t: 'listras', c: ['c', 'l'], n: 7 }], gola: 'v', golaCor: PR, punho: PR, numero: BR },
      { gola: 'v', golaCor: '#1e71b8', punho: '#1e71b8', tex: { t: 'pontos', k: 0.04 } },
    ],
    felsina: [          // Bologna: listras vermelhas e azuis, calção branco; a 2 é branca
      { camadas: [{ t: 'listras', c: ['c', 'l'], n: 7 }], gola: 'redonda', golaCor: '#1a2f62', punho: '#1a2f62', numero: BR },
      { gola: 'v', golaCor: '#a21c26', golaCor2: '#1a2f62', punho: '#a21c26' },
    ],
    aquile: [           // Lazio: azul-celeste com detalhes brancos; a 2 é azul-marinho
      { gola: 'v', golaCor: BR, punho: BR, numero: '#1c2a4a', tex: { t: 'diagonais', k: 0.04 } },
      { gola: 'v', golaCor: '#87d8f7', punho: '#87d8f7', tex: { t: 'riscas', k: 0.05 } },
    ],
    zebrette: [         // Udinese: listras finas pretas e brancas; a 2 é preta
      { camadas: [{ t: 'listras', c: ['c', 'l'], n: 13 }], gola: 'redonda', golaCor: PR, punho: PR, numero: '#f2c230' },
      { gola: 'v', golaCor: BR, punho: BR, tex: { t: 'linhas', k: 0.04 } },
    ],
    neroverdi: [        // Sassuolo: listras verdes e pretas; a 2 é branca
      { camadas: [{ t: 'listras', c: ['c', 'l'], n: 9 }], gola: 'redonda', golaCor: PR, punho: PR, numero: BR },
      { gola: 'v', golaCor: '#00a752', punho: '#00a752', tex: { t: 'pontos', k: 0.04 } },
    ],
    granata: [          // Torino: grená com detalhes brancos; a 2 é branca
      { gola: 'polo', golaCor: BR, punho: BR, numero: BR, tex: { t: 'linhas', k: 0.03 } },
      { camadas: [{ t: 'faixa', c: '#8a1e03', w: 0.09, dir: 1 }], gola: 'redonda', golaCor: '#8a1e03', punho: '#8a1e03' },
    ],
    crociati: [         // Parma: branca com a cruz preta; a 2 é amarela e azul
      { camadas: [{ t: 'vfaixa', c: PR, x: 0.5, w: 0.12 }, { t: 'banda', y: 0.3, f: [[PR, 0.1]] }], gola: 'redonda', golaCor: PR, punho: PR, numero: '#f2c230' },
      { camadas: [{ t: 'banda', y: 0.26, f: [['#1a3a8a', 0.16]] }], gola: 'redonda', golaCor: '#1a3a8a', punho: '#1a3a8a' },
    ],
    isolani: [          // Cagliari: metade vermelha e metade azul; a 2 é branca
      { camadas: [{ t: 'metade', c: '#0b2a5b', lado: 1 }], gola: 'redonda', golaCor: BR, punho: BR, numero: BR },
      { gola: 'v', golaCor: '#c8102e', golaCor2: '#0b2a5b', punho: '#c8102e' },
    ],
    giglio: [           // Fiorentina: roxa com detalhes brancos; a 2 é branca com o roxo
      { gola: 'v', golaCor: BR, punho: BR, numero: BR, tex: { t: 'curvas', k: 0.04 } },
      { camadas: [{ t: 'faixa', c: '#5b2b82', w: 0.08, dir: -1, borda: '#c8202e', bw: 0.02 }], gola: 'v', golaCor: '#5b2b82', punho: '#5b2b82' },
    ],
    grifone: [          // Genoa: metade vermelha e metade azul-marinho; a 2 é branca
      { camadas: [{ t: 'metade', c: '#a6192e', lado: 0 }], gola: 'redonda', golaCor: '#a6192e', punho: '#a6192e', numero: BR },
      { camadas: [{ t: 'banda', y: 0.3, f: [['#a6192e', 0.05], ['#1c2a5c', 0.05]] }], gola: 'redonda', golaCor: '#1c2a5c', punho: '#a6192e' },
    ],
    salento: [          // Lecce: listras amarelas e vermelhas, calção azul-marinho; a 2 é branca
      { camadas: [{ t: 'listras', c: ['c', 'l'], n: 9 }], gola: 'redonda', golaCor: '#d71920', punho: '#d71920', numero: '#1c2a4a' },
      { gola: 'v', golaCor: '#d71920', golaCor2: '#f6d100', punho: '#d71920' },
    ],
    laguna: [           // Venezia: preta com as faixas laranja e verde no peito; a 2 é branca
      { camadas: [{ t: 'banda', y: 0.3, f: [['#f47a20', 0.06], ['#1f8a4c', 0.06]] }], gola: 'v', golaCor: '#f47a20', punho: '#1f8a4c', numero: '#f47a20' },
      { camadas: [{ t: 'banda', y: 0.3, f: [['#f47a20', 0.05], ['#1f8a4c', 0.05]] }], gola: 'v', golaCor: PR, punho: PR },
    ],
    ciociari: [         // Frosinone: amarela com detalhes azuis; a 2 é azul
      { gola: 'v', golaCor: '#1d4fa0', punho: '#1d4fa0', numero: '#1d4fa0', tex: { t: 'riscas', k: 0.05 } },
      { gola: 'v', golaCor: '#f6d100', punho: '#f6d100', tex: { t: 'linhas', k: 0.03 } },
    ],
    brianza: [          // Monza: vermelha com a faixa diagonal branca; a 2 é branca com a faixa vermelha
      { camadas: [{ t: 'faixa', c: BR, w: 0.1, dir: 1 }], gola: 'v', golaCor: BR, punho: BR, numero: BR },
      { camadas: [{ t: 'faixa', c: '#d71920', w: 0.1, dir: 1 }], gola: 'v', golaCor: '#d71920', punho: '#d71920' },
    ],
    // ------------------------------------------------------------------------------------------------- ARGENTINA
    xeneize: [          // Boca: azul com a faixa horizontal amarela no peito; a 2 é amarela com a faixa azul
      { camadas: [{ t: 'banda', y: 0.3, f: [['#f2c230', 0.2]], manga: true }], gola: 'redonda', golaCor: '#f2c230', punho: '#f2c230', numero: '#f2c230' },
      { camadas: [{ t: 'banda', y: 0.3, f: [['#103f91', 0.14]] }], gola: 'v', golaCor: '#103f91', punho: '#103f91', numero: '#103f91' },
    ],
    bandaroja: [        // River: branca com a faixa diagonal vermelha; a 2 é vermelha com a faixa branca
      { camadas: [{ t: 'faixa', c: '#d41f2b', w: 0.2, dir: -1 }], gola: 'v', golaCor: '#d41f2b', punho: '#d41f2b', numero: PR },
      { camadas: [{ t: 'faixa', c: BR, w: 0.16, dir: -1 }], gola: 'v', golaCor: BR, punho: BR, numero: BR },
    ],
    academia: [         // Racing: listras celestes e brancas; a 2 é preta com detalhes celestes
      { camadas: [{ t: 'listras', c: ['c', 'l'], n: 7 }], gola: 'redonda', golaCor: BR, punho: '#6cb4e4', numero: '#1c2a4a' },
      { gola: 'v', golaCor: '#6cb4e4', punho: '#6cb4e4', numero: '#6cb4e4', tex: { t: 'riscas', k: 0.05 } },
    ],
    rojo: [             // Independiente: toda vermelha, gola branca, calção azul-escuro; a 2 é branca
      { gola: 'v', golaCor: BR, punho: BR, numero: BR, tex: { t: 'linhas', k: 0.03 } },
      { gola: 'v', golaCor: '#d0101e', punho: '#d0101e', numero: '#d0101e' },
    ],
    cuervo: [           // San Lorenzo: listras azuis e vermelhas; a 2 é branca com a faixa azul-grená
      { camadas: [{ t: 'listras', c: ['c', 'l'], n: 9 }], gola: 'redonda', golaCor: BR, punho: BR, numero: BR },
      { camadas: [{ t: 'banda', y: 0.32, f: [['#1b3a8a', 0.06], ['#c8202e', 0.06]] }], gola: 'redonda', golaCor: '#1b3a8a', punho: '#c8202e' },
    ],
    pincha: [           // Estudiantes: listras vermelhas e brancas; a 2 é branca com o vermelho
      { camadas: [{ t: 'listras', c: ['c', 'l'], n: 9 }], manga: 'c', gola: 'redonda', golaCor: '#d41f2b', punho: BR, numero: PR },
      { camadas: [{ t: 'vfaixa', c: '#d41f2b', x: 0.5, w: 0.1 }], gola: 'redonda', golaCor: '#d41f2b', punho: '#d41f2b' },
    ],
    lobotripero: [      // Gimnasia: branca com a faixa azul-escura no peito; a 2 é azul
      { camadas: [{ t: 'banda', y: 0.28, f: [['#0c2557', 0.16]], manga: true }], gola: 'redonda', golaCor: '#0c2557', punho: '#0c2557', numero: '#0c2557' },
      { camadas: [{ t: 'banda', y: 0.28, f: [[BR, 0.12]] }], gola: 'redonda', golaCor: BR, punho: BR, numero: BR },
    ],
    fortin: [           // Vélez: branca com o V azul no peito; a 2 é azul com o V branco
      { camadas: [{ t: 'v', c: '#1d4fa0', w: 0.14 }], gola: 'v', golaCor: '#1d4fa0', punho: '#1d4fa0', numero: '#1d4fa0' },
      { camadas: [{ t: 'v', c: BR, w: 0.12 }], gola: 'v', golaCor: BR, punho: BR, numero: BR },
    ],
    globo: [            // Huracán: branca com os detalhes vermelhos; a 2 é vermelha
      { lateral: '#d41f2b', lateralFrente: 0.03, gola: 'v', golaCor: '#d41f2b', punho: '#d41f2b', numero: '#d41f2b' },
      { gola: 'v', golaCor: BR, punho: BR, numero: BR, tex: { t: 'diagonais', k: 0.04 } },
    ],
    canalla: [          // Rosario Central: listras azuis e amarelas; a 2 é amarela com o azul
      { camadas: [{ t: 'listras', c: ['c', 'l'], n: 7 }], gola: 'redonda', golaCor: '#f2c230', punho: '#f2c230', numero: '#f2c230' },
      { lateral: '#123b8c', lateralFrente: 0.03, gola: 'v', golaCor: '#123b8c', punho: '#123b8c', numero: '#123b8c' },
    ],
    leproso: [          // Newell's: metade vermelha e metade preta; a 2 é branca
      { camadas: [{ t: 'metade', c: PR, lado: 1 }], gola: 'redonda', golaCor: PR, punho: PR, numero: BR },
      { camadas: [{ t: 'banda', y: 0.3, f: [['#d41f2b', 0.05], [PR, 0.05]] }], gola: 'redonda', golaCor: PR, punho: '#d41f2b' },
    ],
    bicho: [            // Argentinos Juniors: vermelha com a faixa diagonal branca fina; a 2 é branca
      { camadas: [{ t: 'faixa', c: BR, w: 0.07, dir: 1 }], gola: 'v', golaCor: BR, punho: BR, numero: BR },
      { camadas: [{ t: 'faixa', c: '#d41f2b', w: 0.07, dir: 1 }], gola: 'v', golaCor: '#d41f2b', punho: '#d41f2b' },
    ],
    granate: [          // Lanús: grená com detalhes brancos; a 2 é branca com a faixa grená
      { gola: 'v', golaCor: BR, punho: BR, numero: BR, tex: { t: 'riscas', k: 0.05 } },
      { camadas: [{ t: 'banda', y: 0.3, f: [['#7a1530', 0.1]] }], gola: 'v', golaCor: '#7a1530', punho: '#7a1530' },
    ],
    albiazul: [         // Talleres: listras azul-escuras e brancas; a 2 é branca com detalhes azuis
      { camadas: [{ t: 'listras', c: ['c', 'l'], n: 9 }], gola: 'redonda', golaCor: BR, punho: BR, numero: BR },
      { lateral: '#0c2557', lateralFrente: 0.03, gola: 'redonda', golaCor: '#0c2557', punho: '#0c2557', numero: '#0c2557' },
    ],
    pirata: [           // Belgrano: toda celeste; a 2 é branca com a faixa celeste
      { gola: 'redonda', golaCor: BR, punho: BR, numero: PR, tex: { t: 'ondas', k: 0.05 } },
      { camadas: [{ t: 'banda', y: 0.3, f: [['#5fb0e5', 0.1]] }], gola: 'redonda', golaCor: '#5fb0e5', punho: '#5fb0e5' },
    ],
    gloria: [           // Instituto: listras vermelhas e brancas finas; a 2 é branca
      { camadas: [{ t: 'listras', c: ['c', 'l'], n: 13 }], gola: 'v', golaCor: BR, punho: BR, numero: PR },
      { gola: 'v', golaCor: '#d41f2b', punho: '#d41f2b', numero: '#d41f2b', tex: { t: 'linhas', k: 0.03 } },
    ],
    halcon: [           // Defensa y Justicia: amarela com o verde; a 2 é verde
      { lateral: '#0e7a3e', lateralFrente: 0.035, gola: 'v', golaCor: '#0e7a3e', punho: '#0e7a3e', numero: '#0e7a3e' },
      { lateral: '#f2d200', lateralFrente: 0.03, gola: 'v', golaCor: '#f2d200', punho: '#f2d200', numero: '#f2d200' },
    ],
    taladro: [          // Banfield: listras verdes e brancas; a 2 é branca com a faixa verde
      { camadas: [{ t: 'listras', c: ['c', 'l'], n: 9 }], gola: 'redonda', golaCor: '#0e7a3e', punho: '#0e7a3e', numero: PR },
      { camadas: [{ t: 'faixa', c: '#0e7a3e', w: 0.1, dir: 1 }], gola: 'redonda', golaCor: '#0e7a3e', punho: '#0e7a3e' },
    ],
    matador: [          // Tigre: azul com a faixa horizontal vermelha; a 2 é branca
      { camadas: [{ t: 'banda', y: 0.34, f: [['#d41f2b', 0.16]], manga: true }], gola: 'redonda', golaCor: '#d41f2b', punho: '#d41f2b', numero: BR },
      { camadas: [{ t: 'banda', y: 0.34, f: [['#123b8c', 0.07], ['#d41f2b', 0.07]] }], gola: 'redonda', golaCor: '#123b8c', punho: '#d41f2b' },
    ],
    calamar: [          // Platense: branca com a faixa marrom no peito; a 2 é marrom
      { camadas: [{ t: 'banda', y: 0.3, f: [['#5a3a22', 0.14]], manga: true }], gola: 'v', golaCor: '#5a3a22', punho: '#5a3a22', numero: '#5a3a22' },
      { gola: 'v', golaCor: BR, punho: BR, numero: BR, tex: { t: 'riscas', k: 0.05 } },
    ],
    tatengue: [         // Unión: listras vermelhas e brancas largas; a 2 é branca
      { camadas: [{ t: 'listras', c: ['c', 'l'], n: 7 }], gola: 'redonda', golaCor: PR, punho: PR, numero: PR },
      { gola: 'redonda', golaCor: '#d41f2b', punho: '#d41f2b', numero: '#d41f2b', tex: { t: 'diagonais', k: 0.04 } },
    ],
    verdejunin: [       // Sarmiento: toda verde; a 2 é branca com o verde
      { gola: 'redonda', golaCor: BR, punho: BR, numero: BR, tex: { t: 'linhas', k: 0.03 } },
      { lateral: '#0e7a3e', lateralFrente: 0.03, gola: 'redonda', golaCor: '#0e7a3e', punho: '#0e7a3e', numero: '#0e7a3e' },
    ],
    ferroviario: [      // Central Córdoba: listras pretas e brancas; a 2 é branca
      { camadas: [{ t: 'listras', c: ['c', 'l'], n: 9 }], gola: 'redonda', golaCor: BR, punho: BR, numero: '#f2c230' },
      { gola: 'redonda', golaCor: PR, punho: PR, numero: PR, tex: { t: 'riscas', k: 0.05 } },
    ],
    decano: [           // Atlético Tucumán: listras celestes e brancas, calção azul-escuro; a 2 é azul-escura
      { camadas: [{ t: 'listras', c: ['c', 'l'], n: 9 }], gola: 'v', golaCor: '#0c2557', punho: '#0c2557', numero: '#0c2557' },
      { gola: 'v', golaCor: '#6cb4e4', punho: '#6cb4e4', numero: '#6cb4e4' },
    ],
    guapo: [            // Barracas Central: aros vermelhos e brancos; a 2 é branca
      { camadas: [{ t: 'aros', c: ['c', 'l'], n: 8 }], manga: 'c', gola: 'redonda', golaCor: BR, punho: BR, numero: PR },
      { gola: 'redonda', golaCor: '#d41f2b', punho: '#d41f2b', numero: '#d41f2b' },
    ],
    lepra: [            // Independiente Rivadavia: azul com detalhes brancos; a 2 é branca
      { gola: 'v', golaCor: BR, punho: BR, numero: BR, tex: { t: 'diagonais', k: 0.04 } },
      { camadas: [{ t: 'faixa', c: '#1d3fa0', w: 0.08, dir: -1 }], gola: 'v', golaCor: '#1d3fa0', punho: '#1d3fa0' },
    ],
    malevo: [           // Deportivo Riestra: toda preta; a 2 é branca
      { gola: 'v', golaCor: BR, punho: BR, numero: BR, tex: { t: 'linhas', k: 0.04 } },
      { gola: 'v', golaCor: PR, punho: PR, numero: PR },
    ],
    marplatense: [      // Aldosivi: listras amarelas e verdes; a 2 é verde
      { camadas: [{ t: 'listras', c: ['c', 'l'], n: 9 }], gola: 'redonda', golaCor: '#0e7a3e', punho: '#0e7a3e', numero: '#0e7a3e' },
      { gola: 'redonda', golaCor: '#f2d200', punho: '#f2d200', numero: '#f2d200', tex: { t: 'ondas', k: 0.05 } },
    ],
    blanquinegro: [     // Gimnasia de Mendoza: listras brancas e pretas; a 2 é preta
      { camadas: [{ t: 'listras', c: ['c', 'l'], n: 7 }], gola: 'redonda', golaCor: PR, punho: PR, numero: PR },
      { gola: 'redonda', golaCor: BR, punho: BR, numero: BR },
    ],
    imperio: [          // Estudiantes de Río Cuarto: listras celestes e brancas; a 2 é branca
      { camadas: [{ t: 'listras', c: ['c', 'l'], n: 11 }], gola: 'redonda', golaCor: PR, punho: PR, numero: PR },
      { gola: 'v', golaCor: '#6cb4e4', punho: '#6cb4e4', numero: '#6cb4e4' },
    ],
    // ------------------------------------------------------------------------------------------------- CHILE
    albomacul: [        // Colo-Colo: branca com detalhes pretos, calção preto; a 2 é preta
      { gola: 'polo', golaCor: PR, punho: PR, numero: PR, tex: { t: 'linhas', k: 0.03 } },
      { gola: 'polo', golaCor: BR, punho: BR, numero: BR },
    ],
    bulla: [            // Universidad de Chile: azul com o detalhe vermelho; a 2 é branca
      { gola: 'redonda', golaCor: '#d41f2b', golaCor2: BR, punho: '#d41f2b', numero: BR },
      { camadas: [{ t: 'banda', y: 0.3, f: [['#1d3fa0', 0.06], ['#d41f2b', 0.04]] }], gola: 'redonda', golaCor: '#1d3fa0', punho: '#1d3fa0' },
    ],
    cruzado: [          // Universidad Católica: branca com a faixa azul no peito; a 2 é azul
      { camadas: [{ t: 'banda', y: 0.3, f: [['#1d3fa0', 0.12]], manga: true }], gola: 'redonda', golaCor: '#1d3fa0', punho: '#1d3fa0', numero: '#1d3fa0' },
      { camadas: [{ t: 'banda', y: 0.3, f: [[BR, 0.1]] }], gola: 'redonda', golaCor: BR, punho: BR, numero: BR },
    ],
    ruletero: [         // Everton: azul com detalhes dourados; a 2 é dourada
      { lateral: '#f2c230', lateralFrente: 0.03, gola: 'v', golaCor: '#f2c230', punho: '#f2c230', numero: '#f2c230' },
      { gola: 'v', golaCor: '#0c2557', punho: '#0c2557', numero: '#0c2557' },
    ],
    baisano: [          // Palestino: branca com a faixa vertical verde e vermelha; a 2 é verde
      { camadas: [{ t: 'vfaixa', c: '#0e7a3e', x: 0.5, w: 0.16, borda: '#d41f2b', bw: 0.04 }], gola: 'redonda', golaCor: '#d41f2b', punho: '#0e7a3e', numero: PR },
      { camadas: [{ t: 'vfaixa', c: BR, x: 0.5, w: 0.1, borda: '#d41f2b', bw: 0.03 }], gola: 'redonda', golaCor: BR, punho: BR, numero: BR },
    ],
    acerero: [          // Huachipato: listras azuis e pretas; a 2 é branca
      { camadas: [{ t: 'listras', c: ['c', 'l'], n: 9 }], gola: 'redonda', golaCor: PR, punho: PR, numero: BR },
      { gola: 'redonda', golaCor: '#1d3fa0', punho: PR, numero: '#1d3fa0' },
    ],
    tomatero: [         // Deportes Limache: vermelha com o verde; a 2 é branca
      { lateral: '#0e7a3e', lateralFrente: 0.03, gola: 'v', golaCor: '#0e7a3e', punho: '#0e7a3e', numero: BR },
      { gola: 'v', golaCor: '#d41f2b', punho: '#d41f2b', numero: '#d41f2b' },
    ],
    bucanero: [         // Coquimbo: amarela com detalhes pretos; a 2 é preta
      { gola: 'v', golaCor: PR, punho: PR, numero: PR, tex: { t: 'ondas', k: 0.05 } },
      { gola: 'v', golaCor: '#f2c230', punho: '#f2c230', numero: '#f2c230' },
    ],
    lila: [             // Deportes Concepción: lilás; a 2 é branca
      { gola: 'redonda', golaCor: BR, punho: BR, numero: BR },
      { gola: 'redonda', golaCor: '#6a2c91', punho: '#6a2c91', numero: '#6a2c91' },
    ],
    chillanejo: [       // Ñublense: vermelha; a 2 é branca
      { gola: 'v', golaCor: BR, punho: BR, numero: BR, tex: { t: 'riscas', k: 0.05 } },
      { gola: 'v', golaCor: '#d41f2b', punho: '#d41f2b', numero: '#d41f2b' },
    ],
    papayero: [         // La Serena: vermelha com a faixa diagonal branca; a 2 é branca
      { camadas: [{ t: 'faixa', c: BR, w: 0.1, dir: 1 }], gola: 'redonda', golaCor: BR, punho: BR, numero: BR },
      { gola: 'redonda', golaCor: '#d41f2b', punho: '#d41f2b', numero: '#d41f2b' },
    ],
    italico: [          // Audax Italiano: verde com a faixa tricolor; a 2 é branca
      { camadas: [{ t: 'banda', y: 0.32, f: [[BR, 0.04], ['#d41f2b', 0.04]] }], gola: 'v', golaCor: BR, punho: BR, numero: BR },
      { gola: 'v', golaCor: '#0e7a3e', punho: '#0e7a3e', numero: '#0e7a3e' },
    ],
    rancagua: [         // O'Higgins: celeste; a 2 é branca
      { gola: 'redonda', golaCor: BR, punho: BR, numero: BR, tex: { t: 'diagonais', k: 0.04 } },
      { gola: 'redonda', golaCor: '#6cb4e4', punho: '#6cb4e4', numero: '#6cb4e4' },
    ],
    minero: [           // Cobresal: branca com o laranja; a 2 é laranja
      { camadas: [{ t: 'banda', y: 0.3, f: [['#f07a1a', 0.08], ['#0e7a3e', 0.03]] }], gola: 'redonda', golaCor: '#f07a1a', punho: '#f07a1a', numero: '#0e7a3e' },
      { gola: 'redonda', golaCor: BR, punho: BR, numero: BR },
    ],
    campanil: [         // Universidad de Concepción: amarela com o azul; a 2 é azul
      { lateral: '#1d3fa0', lateralFrente: 0.03, gola: 'v', golaCor: '#1d3fa0', punho: '#1d3fa0', numero: '#1d3fa0' },
      { gola: 'v', golaCor: '#f2d200', punho: '#f2d200', numero: '#f2d200' },
    ],
    cementero: [        // Unión La Calera: vermelha; a 2 é branca com a faixa vermelha
      { gola: 'redonda', golaCor: BR, punho: BR, numero: BR, tex: { t: 'linhas', k: 0.03 } },
      { camadas: [{ t: 'faixa', c: '#d41f2b', w: 0.08, dir: -1 }], gola: 'redonda', golaCor: '#d41f2b', punho: '#d41f2b' },
    ],
    // ------------------------------------------------------------------------------------------------- BOLÍVIA
    siemprelisto: [     // Always Ready: vermelha com a faixa diagonal branca; a 2 é branca
      { camadas: [{ t: 'faixa', c: BR, w: 0.12, dir: -1 }], gola: 'v', golaCor: BR, punho: BR, numero: BR },
      { camadas: [{ t: 'faixa', c: '#d41f2b', w: 0.1, dir: -1 }], gola: 'v', golaCor: '#d41f2b', punho: '#d41f2b' },
    ],
    celestepaz: [       // Bolívar: celeste; a 2 é branca com o celeste
      { gola: 'polo', golaCor: BR, punho: BR, numero: '#0c2557', tex: { t: 'linhas', k: 0.03 } },
      { lateral: '#5fb0e5', lateralFrente: 0.03, gola: 'polo', golaCor: '#5fb0e5', punho: '#5fb0e5', numero: '#5fb0e5' },
    ],
    atigrado: [         // The Strongest: listras amarelas e pretas; a 2 é preta
      { camadas: [{ t: 'listras', c: ['c', 'l'], n: 9 }], gola: 'redonda', golaCor: PR, punho: PR, numero: PR },
      { gola: 'redonda', golaCor: '#f2c230', punho: '#f2c230', numero: '#f2c230', tex: { t: 'tigre', k: 0.06 } },
    ],
    cerrorico: [        // Real Potosí: lilás; a 2 é branca
      { gola: 'v', golaCor: BR, punho: BR, numero: BR },
      { gola: 'v', golaCor: '#6a2c91', punho: '#6a2c91', numero: '#6a2c91' },
    ],
    refinero: [         // Oriente Petrolero: verde com a faixa vertical branca; a 2 é branca
      { camadas: [{ t: 'vfaixa', c: BR, x: 0.5, w: 0.16 }], gola: 'redonda', golaCor: BR, punho: BR, numero: '#0e7a3e' },
      { camadas: [{ t: 'vfaixa', c: '#0e7a3e', x: 0.5, w: 0.12 }], gola: 'redonda', golaCor: '#0e7a3e', punho: '#0e7a3e' },
    ],
    amanecer: [         // Aurora: celeste; a 2 é branca
      { gola: 'redonda', golaCor: BR, punho: BR, numero: BR, tex: { t: 'pontos', k: 0.05 } },
      { gola: 'redonda', golaCor: '#6cb4e4', punho: '#6cb4e4', numero: '#6cb4e4' },
    ],
    canero: [           // Guabirá: vermelha; a 2 é branca
      { gola: 'v', golaCor: BR, punho: BR, numero: BR },
      { gola: 'v', golaCor: '#d41f2b', punho: '#d41f2b', numero: '#d41f2b', tex: { t: 'riscas', k: 0.05 } },
    ],
    florecido: [        // Blooming: celeste com detalhes brancos; a 2 é branca
      { lateral: BR, lateralFrente: 0.03, gola: 'v', golaCor: BR, punho: BR, numero: BR },
      { gola: 'v', golaCor: '#5fb0e5', punho: '#5fb0e5', numero: '#5fb0e5' },
    ],
    banense: [          // Nacional Potosí: azul com o vermelho; a 2 é branca
      { camadas: [{ t: 'banda', y: 0.3, f: [['#d41f2b', 0.07]] }], gola: 'redonda', golaCor: '#d41f2b', punho: '#d41f2b', numero: BR },
      { gola: 'redonda', golaCor: '#1d3fa0', punho: '#1d3fa0', numero: '#1d3fa0' },
    ],
    petrolero: [        // Independiente Petrolero: amarela com o verde; a 2 é verde
      { camadas: [{ t: 'ombros', c: '#0e7a3e', h: 0.08 }], gola: 'v', golaCor: '#0e7a3e', punho: '#0e7a3e', numero: '#0e7a3e' },
      { gola: 'v', golaCor: '#f2d200', punho: '#f2d200', numero: '#f2d200' },
    ],
    carnavalero: [      // Real Oruro: azul com o amarelo; a 2 é amarela
      { camadas: [{ t: 'faixa', c: '#f2c230', w: 0.08, dir: 1 }], gola: 'v', golaCor: '#f2c230', punho: '#f2c230', numero: '#f2c230' },
      { gola: 'v', golaCor: '#1d3fa0', punho: '#1d3fa0', numero: '#1d3fa0' },
    ],
    balompie: [         // ABB: azul-escura com o dourado; a 2 é branca
      { lateral: '#f2c230', lateralFrente: 0.03, gola: 'redonda', golaCor: '#f2c230', punho: '#f2c230', numero: '#f2c230' },
      { gola: 'redonda', golaCor: '#0c2557', punho: '#0c2557', numero: '#0c2557' },
    ],
    chapare: [          // San Antonio Bulo Bulo: verde com o amarelo; a 2 é amarela
      { camadas: [{ t: 'banda', y: 0.3, f: [['#f2d200', 0.06]] }], gola: 'redonda', golaCor: '#f2d200', punho: '#f2d200', numero: '#f2d200' },
      { gola: 'redonda', golaCor: '#0e7a3e', punho: '#0e7a3e', numero: '#0e7a3e' },
    ],
    vinteno: [          // Universitario de Vinto: vermelha com a faixa vertical branca e preta; a 2 é branca
      { camadas: [{ t: 'vfaixa', c: BR, x: 0.5, w: 0.1, borda: PR, bw: 0.025 }], gola: 'redonda', golaCor: PR, punho: PR, numero: BR },
      { gola: 'redonda', golaCor: '#d41f2b', punho: '#d41f2b', numero: '#d41f2b' },
    ],
    chapaco: [          // Real Tomayapo: grená com o dourado; a 2 é dourada
      { gola: 'v', golaCor: '#f2c230', punho: '#f2c230', numero: '#f2c230' },
      { gola: 'v', golaCor: '#7a1530', punho: '#7a1530', numero: '#7a1530' },
    ],
    coronel: [          // Gualberto Villarroel: verde; a 2 é branca
      { gola: 'redonda', golaCor: BR, punho: BR, numero: BR, tex: { t: 'diagonais', k: 0.04 } },
      { gola: 'redonda', golaCor: '#0e7a3e', punho: '#0e7a3e', numero: '#0e7a3e' },
    ],
    // ------------------------------------------------------------------------------------------------- COLÔMBIA
    verdolaga: [        // Atlético Nacional: listras verdes e brancas; a 2 é branca com o verde
      { camadas: [{ t: 'listras', c: ['c', 'l'], n: 9 }], gola: 'v', golaCor: '#0e7a3e', punho: '#0e7a3e', numero: PR },
      { lateral: '#0e7a3e', lateralFrente: 0.03, gola: 'v', golaCor: '#0e7a3e', punho: '#0e7a3e', numero: '#0e7a3e' },
    ],
    currambero: [       // Junior: listras vermelhas e brancas, calção azul; a 2 é azul
      { camadas: [{ t: 'listras', c: ['c', 'l'], n: 9 }], gola: 'redonda', golaCor: '#1d3fa0', punho: '#1d3fa0', numero: '#1d3fa0' },
      { gola: 'redonda', golaCor: '#d41f2b', punho: '#d41f2b', numero: BR },
    ],
    volcanico: [        // Pasto: vermelha com o amarelo e o azul; a 2 é amarela
      { camadas: [{ t: 'banda', y: 0.3, f: [['#f2c230', 0.05], ['#1d3fa0', 0.05]] }], gola: 'v', golaCor: '#f2c230', punho: '#f2c230', numero: '#f2c230' },
      { gola: 'v', golaCor: '#d41f2b', punho: '#1d3fa0', numero: '#d41f2b' },
    ],
    escarlata: [        // América de Cali: escarlate; a 2 é branca
      { gola: 'v', golaCor: BR, punho: BR, numero: BR, tex: { t: 'linhas', k: 0.03 } },
      { gola: 'v', golaCor: '#d41f2b', punho: '#d41f2b', numero: '#d41f2b' },
    ],
    blancoblanco: [     // Once Caldas: branca, calção preto; a 2 é preta
      { gola: 'v', golaCor: PR, punho: PR, numero: PR },
      { gola: 'v', golaCor: BR, punho: BR, numero: BR, tex: { t: 'riscas', k: 0.05 } },
    ],
    musical: [          // Tolima: grená com o dourado; a 2 é dourada
      { camadas: [{ t: 'ombros', c: '#f2c230', h: 0.06, hm: 0.2 }], gola: 'v', golaCor: '#f2c230', punho: '#f2c230', numero: '#f2c230' },
      { gola: 'v', golaCor: '#7a1530', punho: '#7a1530', numero: '#7a1530' },
    ],
    cardenal: [         // Santa Fe: vermelha com mangas brancas; a 2 é branca
      { manga: BR, gola: 'redonda', golaCor: BR, punho: '#d41f2b', numero: BR },
      { manga: '#d41f2b', gola: 'redonda', golaCor: '#d41f2b', punho: BR, numero: '#d41f2b' },
    ],
    interbog: [         // Internacional de Bogotá: verde com o dourado; a 2 é branca
      { lateral: '#f2c230', lateralFrente: 0.03, gola: 'v', golaCor: '#f2c230', punho: '#f2c230', numero: '#f2c230' },
      { gola: 'v', golaCor: '#0e7a3e', punho: '#0e7a3e', numero: '#0e7a3e' },
    ],
    azucarero: [        // Deportivo Cali: verde com detalhes brancos; a 2 é branca
      { gola: 'redonda', golaCor: BR, punho: BR, numero: BR, tex: { t: 'diagonais', k: 0.04 } },
      { camadas: [{ t: 'banda', y: 0.3, f: [['#0e7a3e', 0.08]] }], gola: 'redonda', golaCor: '#0e7a3e', punho: '#0e7a3e' },
    ],
    embajador: [        // Millonarios: azul com detalhes brancos; a 2 é branca com o azul
      { gola: 'polo', golaCor: BR, punho: BR, numero: BR, tex: { t: 'estrelas', k: 0.06 } },
      { lateral: '#1d3fa0', lateralFrente: 0.03, gola: 'polo', golaCor: '#1d3fa0', punho: '#1d3fa0', numero: '#1d3fa0' },
    ],
    poderoso: [         // Independiente Medellín: vermelha com o azul; a 2 é azul
      { camadas: [{ t: 'faixa', c: '#1d3fa0', w: 0.12, dir: 1 }], gola: 'v', golaCor: '#1d3fa0', punho: '#1d3fa0', numero: BR },
      { camadas: [{ t: 'faixa', c: '#d41f2b', w: 0.1, dir: 1 }], gola: 'v', golaCor: '#d41f2b', punho: '#d41f2b', numero: BR },
    ],
    aguiladorada: [     // Águilas Doradas: dourada com o preto; a 2 é preta
      { camadas: [{ t: 'ombros', c: PR, h: 0.07 }], gola: 'v', golaCor: PR, punho: PR, numero: PR },
      { gola: 'v', golaCor: '#f2c230', punho: '#f2c230', numero: '#f2c230' },
    ],
    leopardo: [         // Bucaramanga: amarela com o verde; a 2 é verde
      { lateral: '#0e7a3e', lateralFrente: 0.03, gola: 'redonda', golaCor: '#0e7a3e', punho: '#0e7a3e', numero: '#0e7a3e', tex: { t: 'tigre', k: 0.05 } },
      { gola: 'redonda', golaCor: '#f2c230', punho: '#f2c230', numero: '#f2c230' },
    ],
    llanero: [          // Llaneros: vermelha com o verde; a 2 é branca
      { camadas: [{ t: 'banda', y: 0.32, f: [['#0e7a3e', 0.07]] }], gola: 'redonda', golaCor: '#0e7a3e', punho: '#0e7a3e', numero: BR },
      { gola: 'redonda', golaCor: '#d41f2b', punho: '#d41f2b', numero: '#d41f2b' },
    ],
    sabana: [           // Fortaleza: verde com o preto; a 2 é branca
      { camadas: [{ t: 'vfaixa', c: PR, x: 0.5, w: 0.08 }], gola: 'v', golaCor: PR, punho: PR, numero: BR },
      { gola: 'v', golaCor: '#0e7a3e', punho: '#0e7a3e', numero: '#0e7a3e' },
    ],
    felino: [           // Jaguares: verde com o amarelo; a 2 é branca
      { gola: 'v', golaCor: '#f2c230', punho: '#f2c230', numero: '#f2c230', tex: { t: 'tigre', k: 0.05 } },
      { gola: 'v', golaCor: '#0e7a3e', punho: '#0e7a3e', numero: '#0e7a3e' },
    ],
    vallenato: [        // Alianza (Valledupar): amarela com o verde; a 2 é verde
      { camadas: [{ t: 'faixa', c: '#0e7a3e', w: 0.08, dir: -1 }], gola: 'redonda', golaCor: '#0e7a3e', punho: '#0e7a3e', numero: '#0e7a3e' },
      { gola: 'redonda', golaCor: '#f2c230', punho: '#f2c230', numero: '#f2c230' },
    ],
    ajedrezado: [       // Boyacá Chicó: o xadrez preto e branco; a 2 é preta
      { camadas: [{ t: 'quadros', c: PR, n: 6 }], gola: 'redonda', golaCor: PR, punho: PR, numero: '#f2c230' },
      { gola: 'redonda', golaCor: BR, punho: BR, numero: BR, tex: { t: 'xadrez', k: 0.04 } },
    ],
    motilon: [          // Cúcuta: metade vermelha e metade preta; a 2 é branca
      { camadas: [{ t: 'metade', c: PR, lado: 1 }], gola: 'v', golaCor: PR, punho: PR, numero: BR },
      { gola: 'v', golaCor: '#d41f2b', punho: PR, numero: '#d41f2b' },
    ],
    matecana: [         // Pereira: listras amarelas e vermelhas; a 2 é vermelha
      { camadas: [{ t: 'listras', c: ['c', 'l'], n: 9 }], gola: 'redonda', golaCor: '#d41f2b', punho: '#d41f2b', numero: '#d41f2b' },
      { gola: 'redonda', golaCor: '#f2c230', punho: '#f2c230', numero: '#f2c230' },
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
