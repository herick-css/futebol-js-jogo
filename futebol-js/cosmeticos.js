/*
 * cosmeticos.js — cosméticos do Futebol JS (cabelo, barba, roupas, chuteiras e bola)
 * Feito no modo Cosméticos do Conversor FBX → Three.js em 08/11/2026, testado no jogo.js 6.6.10.
 * Para editar de novo: abra este arquivo no conversor (Cosméticos > Exportar > Abrir projeto).
 *
 *   Cortes: Cascão, Nevou, Platinado disfarçado, Reflexo, Risco duplo, Raio, Estrela, Tribal, Três riscos, Desenho em V, Moicano espetado, Falso moicano, Moicano vermelho, Na régua, Black disfarçado, Flat top, Black moicano, Twist, Nudred, Dread disfarçado, Trança nagô, Samurai, Mullet disfarçado, Crop francês, Corte César, Surfista, Espetado, Cacheado disfarçado, Lambido, Cogumelo
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
    {"nome":"Cascão","g":"M","caixas":[[0.5,0.022,0.54,-0.01,1.886,0,0.72],[0.25,0.06,0.3,0.12,1.918,0,0,0,0,0,[-0.5,-0.5,-0.06,0.5,-0.5,-0.5,-0.5,0.5,-0.06,0.5,0.5,-0.5,-0.5,-0.5,0.06,0.5,-0.5,0.5,-0.5,0.5,0.06,0.5,0.5,0.5]],[0.03,0.03,0.22,0.245,1.9,0]],"s":0,"f":4,"n":0,"nf":5,"t":0,"p":1,"tipo":"degrade"},
    {"nome":"Nevou","g":"U","caixas":[[0.5,0.04,0.54,-0.01,1.895,0]],"cor":"#E6DCBC","s":2,"f":8,"n":5,"nf":10,"t":0,"p":2,"tipo":"degrade"},
    {"nome":"Platinado disfarçado","g":"M","caixas":[[0.48,0.09,0.52,-0.01,1.925,0,"#ECE5CC"],[0.5,0.03,0.54,-0.01,1.89,0],[0.06,0.05,0.4,0.23,1.9,0,"#ECE5CC"]],"s":1,"f":10,"n":2,"nf":11,"t":0,"p":2,"tipo":"degrade"},
    {"nome":"Reflexo","g":"U","caixas":[[0.5,0.1,0.54,-0.01,1.925,0],[0.09,0.08,0.09,0.15,1.995,0.13,"#C9A35A",0,0,0,[-0.5,-0.5,-0.5,0.5,-0.5,-0.5,-0.275,0.5,-0.275,0.275,0.5,-0.275,-0.5,-0.5,0.5,0.5,-0.5,0.5,-0.275,0.5,0.275,0.275,0.5,0.275]],[0.09,0.1,0.09,0.15,2.005,-0.12,"#D9B46A",0,0,0,[-0.5,-0.5,-0.5,0.5,-0.5,-0.5,-0.275,0.5,-0.275,0.275,0.5,-0.275,-0.5,-0.5,0.5,0.5,-0.5,0.5,-0.275,0.5,0.275,0.275,0.5,0.275]],[0.09,0.12,0.09,0.04,2.015,0.02,"#C9A35A",0,0,0,[-0.5,-0.5,-0.5,0.5,-0.5,-0.5,-0.275,0.5,-0.275,0.275,0.5,-0.275,-0.5,-0.5,0.5,0.5,-0.5,0.5,-0.275,0.5,0.275,0.275,0.5,0.275]],[0.09,0.08,0.09,0.04,1.995,0.18,"#D9B46A",0,0,0,[-0.5,-0.5,-0.5,0.5,-0.5,-0.5,-0.275,0.5,-0.275,0.275,0.5,-0.275,-0.5,-0.5,0.5,0.5,-0.5,0.5,-0.275,0.5,0.275,0.275,0.5,0.275]],[0.09,0.1,0.09,0.04,2.005,-0.17,"#C9A35A",0,0,0,[-0.5,-0.5,-0.5,0.5,-0.5,-0.5,-0.275,0.5,-0.275,0.275,0.5,-0.275,-0.5,-0.5,0.5,0.5,-0.5,0.5,-0.275,0.5,0.275,0.275,0.5,0.275]],[0.09,0.12,0.09,-0.07,2.015,0.1,"#D9B46A",0,0,0,[-0.5,-0.5,-0.5,0.5,-0.5,-0.5,-0.275,0.5,-0.275,0.275,0.5,-0.275,-0.5,-0.5,0.5,0.5,-0.5,0.5,-0.275,0.5,0.275,0.275,0.5,0.275]],[0.09,0.08,0.09,-0.07,1.995,-0.08,"#C9A35A",0,0,0,[-0.5,-0.5,-0.5,0.5,-0.5,-0.5,-0.275,0.5,-0.275,0.275,0.5,-0.275,-0.5,-0.5,0.5,0.5,-0.5,0.5,-0.275,0.5,0.275,0.275,0.5,0.275]],[0.09,0.1,0.09,-0.17,2.005,0,"#D9B46A",0,0,0,[-0.5,-0.5,-0.5,0.5,-0.5,-0.5,-0.275,0.5,-0.275,0.275,0.5,-0.275,-0.5,-0.5,0.5,0.5,-0.5,0.5,-0.275,0.5,0.275,0.275,0.5,0.275]],[0.09,0.12,0.09,-0.17,2.015,0.17,"#C9A35A",0,0,0,[-0.5,-0.5,-0.5,0.5,-0.5,-0.5,-0.275,0.5,-0.275,0.275,0.5,-0.275,-0.5,-0.5,0.5,0.5,-0.5,0.5,-0.275,0.5,0.275,0.275,0.5,0.275]],[0.09,0.08,0.09,-0.17,1.995,-0.16,"#D9B46A",0,0,0,[-0.5,-0.5,-0.5,0.5,-0.5,-0.5,-0.275,0.5,-0.275,0.275,0.5,-0.275,-0.5,-0.5,0.5,0.5,-0.5,0.5,-0.275,0.5,0.275,0.275,0.5,0.275]]],"s":3,"f":9,"n":4,"nf":10,"t":1,"p":2,"tipo":"degrade"},
    {"nome":"Risco duplo","g":"M","caixas":[[0.5,0.1,0.54,-0.01,1.925,0]],"s":5,"f":10,"n":6,"nf":11,"t":1,"p":2,"tipo":"degrade","desenho":["................","................","...#########....","................","....########....","................","................","................","................","................","................","................","................","................","................","................"]},
    {"nome":"Raio","g":"M","caixas":[[0.5,0.1,0.54,-0.01,1.925,0]],"s":6,"f":11,"n":6,"nf":11,"t":1,"p":2,"tipo":"degrade","desenho":["................",".........##.....",".......##.......",".....######.....",".......##.......",".....##.........","...##...........","................","................","................","................","................","................","................","................","................"]},
    {"nome":"Estrela","g":"M","caixas":[[0.5,0.1,0.54,-0.01,1.925,0]],"s":6,"f":11,"n":6,"nf":11,"t":1,"p":2,"tipo":"degrade","desenho":["................",".......#........","......###.......","....#######.....",".....#####......",".....##.##......","....#.....#.....","................","................","................","................","................","................","................","................","................"]},
    {"nome":"Tribal","g":"M","caixas":[[0.5,0.09,0.54,-0.01,1.92,0]],"s":6,"f":11,"n":6,"nf":11,"t":1,"p":2,"tipo":"degrade","desenho":["................","..##............","...###....#.....",".....######.....","...........#....","..#####.........",".......###......","................","................","................","................","................","................","................","................","................"],"desenhoNuca":["................","................","..##......##....","...###..###.....",".....####.......","................","................","................","................","................","................","................","................","................","................","................"]},
    {"nome":"Três riscos","g":"M","caixas":[[0.5,0.1,0.54,-0.01,1.925,0]],"s":6,"f":11,"n":6,"nf":11,"t":1,"p":2,"tipo":"degrade","desenho":["................",".......#..#..#..","......#..#..#...",".....#..#..#....","....#..#..#.....","................","................","................","................","................","................","................","................","................","................","................"]},
    {"nome":"Desenho em V","g":"M","caixas":[[0.5,0.1,0.54,-0.01,1.925,0]],"s":2,"f":10,"n":7,"nf":12,"t":1,"p":2,"tipo":"degrade","desenhoNuca":["................","................","#..............#",".#............#.","..#..........#..","...#........#...","....#......#....",".....#....#.....","......#..#......","................","................","................","................","................","................","................"]},
    {"nome":"Moicano espetado","g":"M","caixas":[[0.46,0.05,0.13,-0.02,1.9,0],[0.1,0.16,0.1,0.17,1.98,0,0,0,0,12,[-0.5,-0.5,-0.5,0.5,-0.5,-0.5,-0.15,0.5,-0.15,0.15,0.5,-0.15,-0.5,-0.5,0.5,0.5,-0.5,0.5,-0.15,0.5,0.15,0.15,0.5,0.15]],[0.1,0.2,0.1,0.07,2,0,0,0,0,6,[-0.5,-0.5,-0.5,0.5,-0.5,-0.5,-0.15,0.5,-0.15,0.15,0.5,-0.15,-0.5,-0.5,0.5,0.5,-0.5,0.5,-0.15,0.5,0.15,0.15,0.5,0.15]],[0.1,0.22,0.1,-0.04,2.01,0,0,0,0,0,[-0.5,-0.5,-0.5,0.5,-0.5,-0.5,-0.15,0.5,-0.15,0.15,0.5,-0.15,-0.5,-0.5,0.5,0.5,-0.5,0.5,-0.15,0.5,0.15,0.15,0.5,0.15]],[0.1,0.2,0.1,-0.15,2,0,0,0,0,-10,[-0.5,-0.5,-0.5,0.5,-0.5,-0.5,-0.15,0.5,-0.15,0.15,0.5,-0.15,-0.5,-0.5,0.5,0.5,-0.5,0.5,-0.15,0.5,0.15,0.15,0.5,0.15]],[0.09,0.15,0.09,-0.23,1.95,0,0,0,0,-28,[-0.5,-0.5,-0.5,0.5,-0.5,-0.5,-0.15,0.5,-0.15,0.15,0.5,-0.15,-0.5,-0.5,0.5,0.5,-0.5,0.5,-0.15,0.5,0.15,0.15,0.5,0.15]]],"s":0,"f":6,"n":0,"nf":8,"t":0,"p":0},
    {"nome":"Falso moicano","g":"M","caixas":[[0.5,0.07,0.54,-0.01,1.91,0],[0.42,0.12,0.2,0,1.99,0,0,0,0,0,[-0.5,-0.5,-0.5,0.5,-0.5,-0.5,-0.425,0.5,-0.175,0.425,0.5,-0.175,-0.5,-0.5,0.5,0.5,-0.5,0.5,-0.425,0.5,0.175,0.425,0.5,0.175]]],"s":1,"f":9,"n":2,"nf":11,"t":1,"p":2,"tipo":"degrade"},
    {"nome":"Moicano vermelho","g":"M","caixas":[[0.46,0.05,0.1,-0.02,1.9,0,"#B8262B"],[0.05,0.24,0.09,-0.255,1.78,0,"#B8262B"],[0.44,0.24,0.07,-0.03,2.03,0,"#C8302C",0,0,0,[-0.5,-0.5,-0.5,0.5,-0.5,-0.5,-0.525,0.5,-0.35,0.075,0.5,-0.35,-0.5,-0.5,0.5,0.5,-0.5,0.5,-0.525,0.5,0.35,0.075,0.5,0.35]]],"s":0,"f":5,"n":0,"nf":7,"t":0,"p":1},
    {"nome":"Na régua","g":"M","caixas":[[0.5,0.08,0.54,-0.01,1.915,0]],"s":6,"f":7,"n":9,"nf":10,"t":1,"p":3,"tipo":"liso"},
    {"nome":"Black disfarçado","g":"U","caixas":[[0.47,0.25,0.5,-0.02,2,0,0,0,0,0,[-0.5,-0.5,-0.5,0.5,-0.5,-0.5,-0.47,0.5,-0.47,0.47,0.5,-0.47,-0.5,-0.5,0.5,0.5,-0.5,0.5,-0.47,0.5,0.47,0.47,0.5,0.47]],[0.5,0.03,0.54,-0.01,1.89,0]],"s":1,"f":9,"n":2,"nf":11,"t":1,"p":2,"tipo":"degrade"},
    {"nome":"Flat top","g":"M","caixas":[[0.46,0.34,0.5,-0.01,2.04,0],[0.5,0.03,0.54,-0.01,1.89,0]],"s":1,"f":8,"n":2,"nf":10,"t":1,"p":2,"tipo":"degrade"},
    {"nome":"Black moicano","g":"M","caixas":[[0.5,0.24,0.21,-0.02,1.99,0,0,0,0,0,[-0.5,-0.5,-0.5,0.5,-0.5,-0.5,-0.43,0.5,-0.36,0.43,0.05,-0.36,-0.5,-0.5,0.5,0.5,-0.5,0.5,-0.43,0.5,0.36,0.43,0.05,0.36]],[0.06,0.26,0.2,-0.255,1.78,0]],"s":1,"f":9,"n":1,"nf":10,"t":1,"p":1,"tipo":"degrade"},
    {"nome":"Twist","g":"U","caixas":[[0.5,0.08,0.54,-0.01,1.915,0],[0.075,0.17,0.075,0.15,1.99,-0.17,0,-6.800000000000001,0,14,[-0.5,-0.5,-0.5,0.5,-0.5,-0.5,-0.275,0.5,-0.275,0.275,0.5,-0.275,-0.5,-0.5,0.5,0.5,-0.5,0.5,-0.275,0.5,0.275,0.275,0.5,0.275]],[0.075,0.17,0.075,0.15,1.99,-0.06,0,-2.4,0,14,[-0.5,-0.5,-0.5,0.5,-0.5,-0.5,-0.275,0.5,-0.275,0.275,0.5,-0.275,-0.5,-0.5,0.5,0.5,-0.5,0.5,-0.275,0.5,0.275,0.275,0.5,0.275]],[0.075,0.17,0.075,0.16,1.99,0.05,0,2,0,14,[-0.5,-0.5,-0.5,0.5,-0.5,-0.5,-0.275,0.5,-0.275,0.275,0.5,-0.275,-0.5,-0.5,0.5,0.5,-0.5,0.5,-0.275,0.5,0.275,0.275,0.5,0.275]],[0.075,0.17,0.075,0.16,1.99,0.16,0,6.4,0,14,[-0.5,-0.5,-0.5,0.5,-0.5,-0.5,-0.275,0.5,-0.275,0.275,0.5,-0.275,-0.5,-0.5,0.5,0.5,-0.5,0.5,-0.275,0.5,0.275,0.275,0.5,0.275]],[0.075,0.17,0.075,0.05,1.99,-0.17,0,-6.800000000000001,0,0,[-0.5,-0.5,-0.5,0.5,-0.5,-0.5,-0.275,0.5,-0.275,0.275,0.5,-0.275,-0.5,-0.5,0.5,0.5,-0.5,0.5,-0.275,0.5,0.275,0.275,0.5,0.275]],[0.075,0.17,0.075,0.05,1.99,-0.06,0,-2.4,0,0,[-0.5,-0.5,-0.5,0.5,-0.5,-0.5,-0.275,0.5,-0.275,0.275,0.5,-0.275,-0.5,-0.5,0.5,0.5,-0.5,0.5,-0.275,0.5,0.275,0.275,0.5,0.275]],[0.075,0.17,0.075,0.06,1.99,0.05,0,2,0,0,[-0.5,-0.5,-0.5,0.5,-0.5,-0.5,-0.275,0.5,-0.275,0.275,0.5,-0.275,-0.5,-0.5,0.5,0.5,-0.5,0.5,-0.275,0.5,0.275,0.275,0.5,0.275]],[0.075,0.17,0.075,0.06,1.99,0.16,0,6.4,0,0,[-0.5,-0.5,-0.5,0.5,-0.5,-0.5,-0.275,0.5,-0.275,0.275,0.5,-0.275,-0.5,-0.5,0.5,0.5,-0.5,0.5,-0.275,0.5,0.275,0.275,0.5,0.275]],[0.075,0.17,0.075,-0.05,1.99,-0.17,0,-6.800000000000001,0,0,[-0.5,-0.5,-0.5,0.5,-0.5,-0.5,-0.275,0.5,-0.275,0.275,0.5,-0.275,-0.5,-0.5,0.5,0.5,-0.5,0.5,-0.275,0.5,0.275,0.275,0.5,0.275]],[0.075,0.17,0.075,-0.05,1.99,-0.06,0,-2.4,0,0,[-0.5,-0.5,-0.5,0.5,-0.5,-0.5,-0.275,0.5,-0.275,0.275,0.5,-0.275,-0.5,-0.5,0.5,0.5,-0.5,0.5,-0.275,0.5,0.275,0.275,0.5,0.275]],[0.075,0.17,0.075,-0.04,1.99,0.05,0,2,0,0,[-0.5,-0.5,-0.5,0.5,-0.5,-0.5,-0.275,0.5,-0.275,0.275,0.5,-0.275,-0.5,-0.5,0.5,0.5,-0.5,0.5,-0.275,0.5,0.275,0.275,0.5,0.275]],[0.075,0.17,0.075,-0.04,1.99,0.16,0,6.4,0,0,[-0.5,-0.5,-0.5,0.5,-0.5,-0.5,-0.275,0.5,-0.275,0.275,0.5,-0.275,-0.5,-0.5,0.5,0.5,-0.5,0.5,-0.275,0.5,0.275,0.275,0.5,0.275]],[0.075,0.17,0.075,-0.15,1.99,-0.17,0,-6.800000000000001,0,-10,[-0.5,-0.5,-0.5,0.5,-0.5,-0.5,-0.275,0.5,-0.275,0.275,0.5,-0.275,-0.5,-0.5,0.5,0.5,-0.5,0.5,-0.275,0.5,0.275,0.275,0.5,0.275]],[0.075,0.17,0.075,-0.15,1.99,-0.06,0,-2.4,0,-10,[-0.5,-0.5,-0.5,0.5,-0.5,-0.5,-0.275,0.5,-0.275,0.275,0.5,-0.275,-0.5,-0.5,0.5,0.5,-0.5,0.5,-0.275,0.5,0.275,0.275,0.5,0.275]],[0.075,0.17,0.075,-0.14,1.99,0.05,0,2,0,-10,[-0.5,-0.5,-0.5,0.5,-0.5,-0.5,-0.275,0.5,-0.275,0.275,0.5,-0.275,-0.5,-0.5,0.5,0.5,-0.5,0.5,-0.275,0.5,0.275,0.275,0.5,0.275]],[0.075,0.17,0.075,-0.14,1.99,0.16,0,6.4,0,-10,[-0.5,-0.5,-0.5,0.5,-0.5,-0.5,-0.275,0.5,-0.275,0.275,0.5,-0.275,-0.5,-0.5,0.5,0.5,-0.5,0.5,-0.275,0.5,0.275,0.275,0.5,0.275]]],"s":2,"f":9,"n":3,"nf":10,"t":1,"p":2,"tipo":"degrade"},
    {"nome":"Nudred","g":"U","caixas":[[0.5,0.1,0.54,-0.01,1.925,0],[0.08,0.06,0.08,0.16,1.975,-0.18],[0.08,0.06,0.08,0.16,1.985,-0.08],[0.08,0.06,0.08,0.16,1.995,0],[0.08,0.06,0.08,0.16,1.975,0.1],[0.08,0.06,0.08,0.16,1.985,0.18],[0.08,0.06,0.08,0.08,1.995,-0.17],[0.08,0.06,0.08,0.08,1.975,-0.09],[0.08,0.06,0.08,0.08,1.985,0.01],[0.08,0.06,0.08,0.08,1.995,0.09],[0.08,0.06,0.08,0.08,1.975,0.19],[0.08,0.06,0.08,0,1.985,-0.18],[0.08,0.06,0.08,0,1.995,-0.08],[0.08,0.06,0.08,0,1.975,0],[0.08,0.06,0.08,0,1.985,0.1],[0.08,0.06,0.08,0,1.995,0.18],[0.08,0.06,0.08,-0.08,1.975,-0.17],[0.08,0.06,0.08,-0.08,1.985,-0.09],[0.08,0.06,0.08,-0.08,1.995,0.01],[0.08,0.06,0.08,-0.08,1.975,0.09],[0.08,0.06,0.08,-0.08,1.985,0.19],[0.08,0.06,0.08,-0.16,1.995,-0.18],[0.08,0.06,0.08,-0.16,1.975,-0.08],[0.08,0.06,0.08,-0.16,1.985,0],[0.08,0.06,0.08,-0.16,1.995,0.1],[0.08,0.06,0.08,-0.16,1.975,0.18]],"s":3,"f":9,"n":4,"nf":10,"t":1,"p":2,"tipo":"degrade"},
    {"nome":"Dread disfarçado","g":"U","caixas":[[0.5,0.09,0.54,-0.01,1.92,0],[0.06,0.24,0.06,-0.22,1.86,-0.18,0,0,0,-18],[0.06,0.16,0.06,0.12,1.98,-0.14,0,0,0,-35],[0.06,0.18,0.06,-0.05,2,-0.21,0,0,0,-55],[0.06,0.24,0.06,-0.22,1.86,-0.09,0,0,0,-18],[0.06,0.16,0.06,0.12,1.98,-0.05,0,0,0,-35],[0.06,0.18,0.06,-0.05,2,-0.12,0,0,0,-55],[0.06,0.24,0.06,-0.22,1.86,0,0,0,0,-18],[0.06,0.16,0.06,0.12,1.98,0.04,0,0,0,-35],[0.06,0.18,0.06,-0.05,2,-0.03,0,0,0,-55],[0.06,0.24,0.06,-0.22,1.86,0.09,0,0,0,-18],[0.06,0.16,0.06,0.12,1.98,0.13,0,0,0,-35],[0.06,0.18,0.06,-0.05,2,0.06,0,0,0,-55],[0.06,0.24,0.06,-0.22,1.86,0.18,0,0,0,-18],[0.06,0.16,0.06,0.12,1.98,0.22,0,0,0,-35],[0.06,0.18,0.06,-0.05,2,0.15,0,0,0,-55]],"s":2,"f":9,"n":7,"nf":10,"t":1,"p":2,"tipo":"degrade"},
    {"nome":"Trança nagô","g":"U","caixas":[[0.5,0.045,0.075,-0.01,1.9,-0.2],[0.045,0.34,0.075,-0.255,1.72,-0.2],[0.5,0.045,0.075,-0.01,1.9,-0.1],[0.045,0.34,0.075,-0.255,1.72,-0.1],[0.5,0.045,0.075,-0.01,1.9,0],[0.045,0.34,0.075,-0.255,1.72,0],[0.5,0.045,0.075,-0.01,1.9,0.1],[0.045,0.34,0.075,-0.255,1.72,0.1],[0.5,0.045,0.075,-0.01,1.9,0.2],[0.045,0.34,0.075,-0.255,1.72,0.2]],"s":0,"f":3,"n":0,"nf":2,"t":1,"p":2,"tipo":"liso","desenho":["++.++.++.++.++..","++.++.++.++.++..","++.++.++.++.++..","................","................","................","................","................","................","................","................","................","................","................","................","................"]},
    {"nome":"Samurai","g":"M","caixas":[[0.5,0.1,0.54,-0.03,1.925,0],[0.44,0.04,0.44,-0.04,1.99,0],[0.14,0.1,0.11,-0.18,2.02,0],[0.11,0.12,0.14,-0.18,2.025,0]],"s":1,"f":3,"n":1,"nf":3,"t":1,"p":1,"tipo":"degrade","desenho":["................","................","................","...##########...","................","................","................","................","................","................","................","................","................","................","................","................"]},
    {"nome":"Mullet disfarçado","g":"M","caixas":[[0.5,0.12,0.54,-0.02,1.935,0],[0.12,0.38,0.42,-0.28,1.7,0]],"s":1,"f":8,"n":9,"nf":11,"t":1,"p":2,"tipo":"degrade"},
    {"nome":"Crop francês","g":"M","caixas":[[0.52,0.12,0.56,-0.01,1.93,0],[0.06,0.08,0.5,0.25,1.86,0],[0.1,0.03,0.1,0.12,2,0.1],[0.1,0.03,0.1,-0.06,2,-0.1]],"s":1,"f":10,"n":2,"nf":11,"t":2,"p":2,"tipo":"degrade"},
    {"nome":"Corte César","g":"M","caixas":[[0.5,0.08,0.54,-0.01,1.915,0],[0.05,0.05,0.52,0.25,1.87,0]],"s":4,"f":8,"n":7,"nf":10,"t":1,"p":2,"tipo":"liso"},
    {"nome":"Surfista","g":"U","caixas":[[0.54,0.16,0.58,-0.02,1.95,0],[0.36,0.22,0.05,-0.05,1.8,0.29],[0.36,0.22,0.05,-0.05,1.8,-0.29],[0.1,0.3,0.56,-0.28,1.77,0],[0.06,0.13,0.26,0.255,1.865,0.13,0,10,0,0],[0.06,0.09,0.24,0.255,1.885,-0.09,0,-6,0,0]],"s":6,"f":7,"n":9,"nf":10,"t":2,"p":5},
    {"nome":"Espetado","g":"M","caixas":[[0.5,0.08,0.54,-0.01,1.915,0],[0.12,0.17,0.12,0.16,2,0.12,0,7.199999999999999,0,25,[-0.5,-0.5,-0.5,0.5,-0.5,-0.5,-0.075,0.5,-0.075,0.075,0.5,-0.075,-0.5,-0.5,0.5,0.5,-0.5,0.5,-0.075,0.5,0.075,0.075,0.5,0.075]],[0.12,0.17,0.12,0.16,2,-0.1,0,-6,0,25,[-0.5,-0.5,-0.5,0.5,-0.5,-0.5,-0.075,0.5,-0.075,0.075,0.5,-0.075,-0.5,-0.5,0.5,0.5,-0.5,0.5,-0.075,0.5,0.075,0.075,0.5,0.075]],[0.12,0.17,0.12,0.06,2,0.02,0,1.2,0,12,[-0.5,-0.5,-0.5,0.5,-0.5,-0.5,-0.075,0.5,-0.075,0.075,0.5,-0.075,-0.5,-0.5,0.5,0.5,-0.5,0.5,-0.075,0.5,0.075,0.075,0.5,0.075]],[0.12,0.17,0.12,0.05,2,0.18,0,10.799999999999999,0,12,[-0.5,-0.5,-0.5,0.5,-0.5,-0.5,-0.075,0.5,-0.075,0.075,0.5,-0.075,-0.5,-0.5,0.5,0.5,-0.5,0.5,-0.075,0.5,0.075,0.075,0.5,0.075]],[0.12,0.17,0.12,0.05,2,-0.17,0,-10.200000000000001,0,12,[-0.5,-0.5,-0.5,0.5,-0.5,-0.5,-0.075,0.5,-0.075,0.075,0.5,-0.075,-0.5,-0.5,0.5,0.5,-0.5,0.5,-0.075,0.5,0.075,0.075,0.5,0.075]],[0.12,0.17,0.12,-0.06,2,0.1,0,6,0,0,[-0.5,-0.5,-0.5,0.5,-0.5,-0.5,-0.075,0.5,-0.075,0.075,0.5,-0.075,-0.5,-0.5,0.5,0.5,-0.5,0.5,-0.075,0.5,0.075,0.075,0.5,0.075]],[0.12,0.17,0.12,-0.06,2,-0.08,0,-4.8,0,0,[-0.5,-0.5,-0.5,0.5,-0.5,-0.5,-0.075,0.5,-0.075,0.075,0.5,-0.075,-0.5,-0.5,0.5,0.5,-0.5,0.5,-0.075,0.5,0.075,0.075,0.5,0.075]],[0.12,0.17,0.12,-0.16,2,0.02,0,1.2,0,-12,[-0.5,-0.5,-0.5,0.5,-0.5,-0.5,-0.075,0.5,-0.075,0.075,0.5,-0.075,-0.5,-0.5,0.5,0.5,-0.5,0.5,-0.075,0.5,0.075,0.075,0.5,0.075]],[0.12,0.17,0.12,-0.17,2,0.17,0,10.200000000000001,0,-14,[-0.5,-0.5,-0.5,0.5,-0.5,-0.5,-0.075,0.5,-0.075,0.075,0.5,-0.075,-0.5,-0.5,0.5,0.5,-0.5,0.5,-0.075,0.5,0.075,0.075,0.5,0.075]],[0.12,0.17,0.12,-0.17,2,-0.15,0,-9,0,-14,[-0.5,-0.5,-0.5,0.5,-0.5,-0.5,-0.075,0.5,-0.075,0.075,0.5,-0.075,-0.5,-0.5,0.5,0.5,-0.5,0.5,-0.075,0.5,0.075,0.075,0.5,0.075]]],"s":3,"f":8,"n":5,"nf":10,"t":1,"p":2},
    {"nome":"Cacheado disfarçado","g":"U","caixas":[[0.48,0.15,0.52,-0.01,1.95,0],[0.12,0.08,0.12,0.14,2.03,0.14],[0.12,0.08,0.12,0.14,2.04,-0.12],[0.12,0.08,0.12,0.04,2.05,0],[0.12,0.08,0.12,0.03,2.03,0.17],[0.12,0.08,0.12,0.03,2.04,-0.16],[0.12,0.08,0.12,-0.08,2.05,0.1],[0.12,0.08,0.12,-0.08,2.03,-0.08],[0.12,0.08,0.12,-0.18,2.04,0.02],[0.12,0.08,0.12,-0.17,2.05,0.16],[0.12,0.08,0.12,-0.17,2.03,-0.15]],"s":1,"f":9,"n":2,"nf":11,"t":1,"p":2,"tipo":"degrade"},
    {"nome":"Lambido","g":"M","caixas":[[0.5,0.1,0.18,-0.02,1.925,-0.18],[0.52,0.14,0.34,-0.02,1.945,0.1],[0.06,0.06,0.32,0.25,1.9,0.1,0,0,0,-10]],"s":4,"f":7,"n":8,"nf":11,"t":1,"p":2,"tipo":"liso"},
    {"nome":"Cogumelo","g":"U","caixas":[[0.54,0.14,0.58,-0.01,1.945,0],[0.06,0.1,0.58,0.26,1.85,0],[0.54,0.1,0.04,-0.01,1.85,0.285],[0.54,0.1,0.04,-0.01,1.85,-0.285],[0.04,0.1,0.58,-0.26,1.85,0]],"s":3,"f":9,"n":4,"nf":10,"t":3,"p":3,"tipo":"degrade"}
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
