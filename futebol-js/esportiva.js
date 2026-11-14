/* =====================================================================
   FUTEBOL JS · esportiva.js · A GOLAÇO ESPORTES (arquivo SEPARADO, como bar.js)
   ---------------------------------------------------------------------
   7.1.9 — primeira versão: o LAYOUT da loja e a seção de COMEMORAÇÕES.
   - Registrado com FutebolJS.registrarFase({ id: 'esportiva' }) só para o jogo saber baixar o arquivo; NÃO roda como fase.
     A cidade baixa em segundo plano e chama criar(api) (api = apiEsportiva() da cidade). A sala vem do interiores.js (R.esportiva):
     quadrada, com uma seção em cada canto (chuteiras, roupas, bolas, acessórios), o campinho das comemorações no meio e o caixa ao norte.
   - A EQUIPE (uniforme azul e amarelo): a MARTA no caixa e um vendedor em cada seção: BIRO (chuteiras), KELLY (roupas), JUCA (bolas),
     TATI (acessórios) e o DEDÉ (comemorações), que de vez em quando faz uma dancinha no campinho para chamar cliente.
   - PSEUDO-CLIENTES: algumas pessoas passeiam pela loja, param nas prateleiras, olham e vão embora (a loja é do jogador: eles não compram).
   - COMEMORAÇÕES: 20 animações novas (os quadros-chave ficam no jogo.js, em CELEBRACOES, com loja: true), 300 fakes cada.
     Com o Dedé abre o CATÁLOGO (painel à direita): VER faz o jogador testar a comemoração ali no campinho, LEVAR põe na sacola.
     Quem cobra é a Marta, no CAIXA (paga tudo o que está na sacola). As compradas ficam para sempre; no catálogo escolhe-se qual vai
     em cada um dos 2 botões de comemoração da partida (BOTÃO 1 / BOTÃO 2).
   - As outras seções (chuteiras, roupas, bolas, acessórios) já têm o lugar, a decoração e o vendedor; as vendas delas vêm depois.
   - Salva em historia.cidade (dados): celeb = { tem: [chaves compradas], slots: [botão 1, botão 2] } · esportiva = { conheceu... }.
   ===================================================================== */
(function () {
  'use strict';
  const PRECO = 300;
  const TRAD = {
    'Marta': ['Marta', 'Marta', 'Marta', 'Marta'], 'Biro': ['Biro', 'Biro', 'Biro', 'Biro'], 'Kelly': ['Kelly', 'Kelly', 'Kelly', 'Kelly'], 'Juca': ['Juca', 'Juca', 'Juca', 'Juca'], 'Tati': ['Tati', 'Tati', 'Tati', 'Tati'], 'Dedé': ['Dedé', 'Dedé', 'Dedé', 'Dedé'],
    'Falar com {0}': ['Talk to {0}', 'Hablar con {0}', 'Parla con {0}', 'Parler à {0}'],
    'Caixa da loja': ['Store checkout', 'Caja de la tienda', 'Cassa del negozio', 'Caisse du magasin'],
    'Ver as comemorações': ['See the celebrations', 'Ver las celebraciones', 'Vedi le esultanze', 'Voir les célébrations'],
    // o catálogo
    'COMEMORAÇÕES': ['CELEBRATIONS', 'CELEBRACIONES', 'ESULTANZE', 'CÉLÉBRATIONS'],
    '{0} fakes': ['{0} fakes', '{0} fakes', '{0} fakes', '{0} fakes'],
    'Você tem {0} fakes': ['You have {0} fakes', 'Tienes {0} fakes', 'Hai {0} fakes', 'Tu as {0} fakes'],
    'Sacola: {0} ({1} fakes)': ['Bag: {0} ({1} fakes)', 'Bolsa: {0} ({1} fakes)', 'Borsa: {0} ({1} fakes)', 'Sac : {0} ({1} fakes)'],
    'Sacola vazia': ['Empty bag', 'Bolsa vacía', 'Borsa vuota', 'Sac vide'],
    'Botão 1: {0}': ['Button 1: {0}', 'Botón 1: {0}', 'Pulsante 1: {0}', 'Bouton 1 : {0}'], 'Botão 2: {0}': ['Button 2: {0}', 'Botón 2: {0}', 'Pulsante 2: {0}', 'Bouton 2 : {0}'],
    'VER': ['WATCH', 'VER', 'GUARDA', 'VOIR'], 'LEVAR': ['TAKE', 'LLEVAR', 'PRENDI', 'PRENDRE'], 'TIRAR': ['REMOVE', 'QUITAR', 'TOGLI', 'RETIRER'],
    'BOTÃO 1': ['BUTTON 1', 'BOTÓN 1', 'PULSANTE 1', 'BOUTON 1'], 'BOTÃO 2': ['BUTTON 2', 'BOTÓN 2', 'PULSANTE 2', 'BOUTON 2'],
    'É sua': ['Yours', 'Es tuya', 'È tua', 'À toi'], 'Na sacola': ['In the bag', 'En la bolsa', 'Nella borsa', 'Dans le sac'], 'De graça': ['Free', 'Gratis', 'Gratis', 'Gratuit'],
    'FECHAR': ['CLOSE', 'CERRAR', 'CHIUDI', 'FERMER'],
    'O que está na sacola você paga no caixa, com a Marta.': ['What’s in the bag you pay for at the checkout, with Marta.', 'Lo que está en la bolsa lo pagas en la caja, con Marta.', 'Quello che c’è nella borsa lo paghi alla cassa, da Marta.', 'Ce qui est dans le sac se paie à la caisse, avec Marta.'],
    // o Dedé
    'E aí, craque! Aqui é o cantinho das comemorações. Gol sem festa não vale!': ['Hey, star! This is the celebrations corner. A goal without a party doesn’t count!', '¡Ey, crack! Este es el rincón de las celebraciones. ¡Gol sin fiesta no vale!', 'Ehi, campione! Questo è l’angolo delle esultanze. Un gol senza festa non vale!', 'Salut, champion ! Ici, c’est le coin des célébrations. Un but sans fête, ça ne compte pas !'],
    'Tenho 20 comemorações, {0} fakes cada. Pode testar todas aqui no campinho antes de levar.': ['I’ve got 20 celebrations, {0} fakes each. You can try them all here on the little pitch before taking any.', 'Tengo 20 celebraciones, {0} fakes cada una. Puedes probarlas todas aquí en la canchita antes de llevarlas.', 'Ho 20 esultanze, {0} fakes l’una. Puoi provarle tutte qui sul campetto prima di prenderle.', 'J’ai 20 célébrations, {0} fakes chacune. Tu peux toutes les essayer ici sur le petit terrain avant de les prendre.'],
    'O que você escolher vai para a sacola. Depois é só pagar com a Marta, no caixa.': ['Whatever you pick goes in the bag. Then just pay Marta at the checkout.', 'Lo que elijas va a la bolsa. Después solo pagas con Marta, en la caja.', 'Quello che scegli va nella borsa. Poi paghi da Marta, alla cassa.', 'Ce que tu choisis va dans le sac. Ensuite, tu paies à Marta, à la caisse.'],
    'Bora ver o que combina com você!': ['Let’s see what suits you!', '¡Vamos a ver qué va contigo!', 'Vediamo cosa fa per te!', 'Voyons ce qui te va !'],
    'Essa ficou a sua cara!': ['That one is so you!', '¡Esa te queda perfecta!', 'Questa è proprio da te!', 'Celle-là, c’est tout toi !'],
    'Boa escolha! Passa no caixa que a Marta fecha a conta.': ['Good choice! Stop by the checkout and Marta will ring you up.', '¡Buena elección! Pasa por la caja y Marta te cobra.', 'Bella scelta! Passa alla cassa, ci pensa Marta.', 'Bon choix ! Passe à la caisse, Marta s’occupe du reste.'],
    'Volta quando quiser treinar a comemoração!': ['Come back whenever you want to practice your celebration!', '¡Vuelve cuando quieras practicar la celebración!', 'Torna quando vuoi provare l’esultanza!', 'Reviens quand tu veux répéter ta célébration !'],
    // os outros vendedores
    'Chuteira boa é meio gol! Olha à vontade.': ['Good boots are half a goal! Look around.', '¡Un buen botín es medio gol! Mira con calma.', 'Una buona scarpa è mezzo gol! Guarda pure.', 'De bons crampons, c’est la moitié du but ! Regarde tranquillement.'],
    'Estou arrumando o estoque. Daqui a uns dias já dá para comprar.': ['I’m sorting the stock. In a few days you’ll be able to buy.', 'Estoy acomodando el stock. En unos días ya se puede comprar.', 'Sto sistemando il magazzino. Tra qualche giorno si potrà comprare.', 'Je range le stock. Dans quelques jours, tu pourras acheter.'],
    'Camisa, short, agasalho... aqui a gente veste o time inteiro.': ['Shirts, shorts, tracksuits... we dress the whole team here.', 'Camisetas, shorts, buzos... aquí vestimos al equipo entero.', 'Maglie, pantaloncini, tute... qui vestiamo tutta la squadra.', 'Maillots, shorts, survêtements... ici, on habille toute l’équipe.'],
    'As peças novas chegam essa semana. Volta depois!': ['The new pieces arrive this week. Come back later!', 'Las prendas nuevas llegan esta semana. ¡Vuelve después!', 'I capi nuovi arrivano questa settimana. Torna più tardi!', 'Les nouveautés arrivent cette semaine. Reviens plus tard !'],
    'Bola de campo, de society, de futsal... tem de tudo.': ['Field balls, small-sided, futsal... we’ve got everything.', 'Pelota de campo, de fútbol 7, de futsal... hay de todo.', 'Palloni da campo, da calcetto, da futsal... c’è di tutto.', 'Ballons de terrain, de foot à 7, de futsal... il y a de tout.'],
    'Só não estou vendendo ainda: falta etiquetar. Logo, logo!': ['I’m just not selling yet: still need to tag them. Very soon!', 'Solo que todavía no vendo: falta etiquetar. ¡Prontito!', 'Solo che non vendo ancora: mancano le etichette. Presto!', 'Je ne vends pas encore : il faut étiqueter. Très bientôt !'],
    'Caneleira, luva, boné, garrafinha... o detalhe que faz a diferença.': ['Shin guards, gloves, caps, bottles... the detail that makes the difference.', 'Canilleras, guantes, gorras, botellas... el detalle que marca la diferencia.', 'Parastinchi, guanti, cappellini, borracce... il dettaglio che fa la differenza.', 'Protège-tibias, gants, casquettes, gourdes... le détail qui fait la différence.'],
    'A máquina do cartão dessa seção quebrou. Semana que vem eu vendo!': ['This section’s card machine broke. Next week I’ll be selling!', 'Se rompió la máquina de tarjetas de esta sección. ¡La semana que viene vendo!', 'Si è rotto il POS di questo reparto. La settimana prossima vendo!', 'Le terminal de carte de ce rayon est en panne. La semaine prochaine, je vends !'],
    // a Marta (caixa)
    'Bem-vindo à Golaço Esportes! Escolhe com os vendedores e paga aqui comigo.': ['Welcome to Golaço Sports! Choose with the salespeople and pay here with me.', '¡Bienvenido a Golaço Deportes! Elige con los vendedores y paga aquí conmigo.', 'Benvenuto alla Golaço Sport! Scegli con i commessi e paga qui da me.', 'Bienvenue chez Golaço Sports ! Choisis avec les vendeurs et paie ici avec moi.'],
    'Bem-vinda à Golaço Esportes! Escolhe com os vendedores e paga aqui comigo.': ['Welcome to Golaço Sports! Choose with the salespeople and pay here with me.', '¡Bienvenida a Golaço Deportes! Elige con los vendedores y paga aquí conmigo.', 'Benvenuta alla Golaço Sport! Scegli con i commessi e paga qui da me.', 'Bienvenue chez Golaço Sports ! Choisis avec les vendeurs et paie ici avec moi.'],
    'A sua sacola está vazia. O Dedé, ali no campinho, mostra as comemorações.': ['Your bag is empty. Dedé, over at the little pitch, shows the celebrations.', 'Tu bolsa está vacía. Dedé, ahí en la canchita, muestra las celebraciones.', 'La tua borsa è vuota. Dedé, lì al campetto, mostra le esultanze.', 'Ton sac est vide. Dedé, là-bas sur le petit terrain, montre les célébrations.'],
    'Na sacola: {0}. Dá {1} fakes.': ['In the bag: {0}. That’s {1} fakes.', 'En la bolsa: {0}. Son {1} fakes.', 'Nella borsa: {0}. Fanno {1} fakes.', 'Dans le sac : {0}. Ça fait {1} fakes.'],
    'Pagar {0} fakes': ['Pay {0} fakes', 'Pagar {0} fakes', 'Paga {0} fakes', 'Payer {0} fakes'], 'Agora não': ['Not now', 'Ahora no', 'Non ora', 'Pas maintenant'],
    'Faltam {0} fakes. Tira alguma coisa da sacola com o Dedé ou volta depois.': ['You’re {0} fakes short. Take something out of the bag with Dedé or come back later.', 'Faltan {0} fakes. Quita algo de la bolsa con Dedé o vuelve después.', 'Mancano {0} fakes. Togli qualcosa dalla borsa con Dedé o torna più tardi.', 'Il manque {0} fakes. Retire quelque chose du sac avec Dedé ou reviens plus tard.'],
    'Prontinho! Já é tudo seu.': ['All done! It’s all yours.', '¡Listo! Ya es todo tuyo.', 'Fatto! È tutto tuo.', 'Voilà ! Tout est à toi.'],
    'A comemoração "{0}" já ficou no seu botão {1}. Para trocar, é com o Dedé.': ['The "{0}" celebration is already on your button {1}. To change it, talk to Dedé.', 'La celebración "{0}" ya quedó en tu botón {1}. Para cambiarla, habla con Dedé.', 'L’esultanza "{0}" è già sul tuo pulsante {1}. Per cambiarla, vai da Dedé.', 'La célébration « {0} » est déjà sur ton bouton {1}. Pour changer, va voir Dedé.'],
    'Agora é fazer gol para estrear!': ['Now go score a goal to show it off!', '¡Ahora a hacer un gol para estrenarla!', 'Adesso serve un gol per inaugurarla!', 'Maintenant, il faut marquer pour l’inaugurer !'],
    'Sem pressa. A sacola fica aqui guardada enquanto você estiver na loja.': ['No rush. The bag stays here while you’re in the store.', 'Sin apuro. La bolsa queda guardada aquí mientras estés en la tienda.', 'Con calma. La borsa resta qui finché sei in negozio.', 'Pas de souci. Le sac reste ici tant que tu es dans le magasin.'],
  };
  const fem = () => typeof PERSONAGEM !== 'undefined' && PERSONAGEM.genero === 'F';
  const Tx = (k) => (typeof T === 'function' ? T(k) : k);
  const Tfx = (k, ...a) => { let s = Tx(k); a.forEach((v, i) => { s = s.split('{' + i + '}').join(v); }); return s; };
  const clampN = (v, a, b) => Math.max(a, Math.min(b, v));
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pk = (l) => l[Math.floor(Math.random() * l.length)];
  const AZUL = '#1c3aa0', AMAR = '#f2c230';
  // a equipe: [chave, nome, seção, sexo, semente da aparência]
  const EQUIPE = [
    { k: 'marta', nome: 'Marta', sec: 'caixa', sexo: 'F', seed: 6101 }, { k: 'biro', nome: 'Biro', sec: 'chuteiras', sexo: 'M', seed: 6102 }, { k: 'kelly', nome: 'Kelly', sec: 'roupas', sexo: 'F', seed: 6103 },
    { k: 'juca', nome: 'Juca', sec: 'bolas', sexo: 'M', seed: 6104 }, { k: 'tati', nome: 'Tati', sec: 'acessorios', sexo: 'F', seed: 6105 }, { k: 'dede', nome: 'Dedé', sec: 'comemoracoes', sexo: 'M', seed: 6106 },
  ];
  const PAPO = {
    biro: ['Chuteira boa é meio gol! Olha à vontade.', 'Estou arrumando o estoque. Daqui a uns dias já dá para comprar.'],
    kelly: ['Camisa, short, agasalho... aqui a gente veste o time inteiro.', 'As peças novas chegam essa semana. Volta depois!'],
    juca: ['Bola de campo, de society, de futsal... tem de tudo.', 'Só não estou vendendo ainda: falta etiquetar. Logo, logo!'],
    tati: ['Caneleira, luva, boné, garrafinha... o detalhe que faz a diferença.', 'A máquina do cartão dessa seção quebrou. Semana que vem eu vendo!'],
  };
  const DANCAS_DEDE = ['robo', 'passinho', 'dancinha', 'coracao', 'musculoso', 'reverencia', 'piao'];

  function criar(api) {
    const S = () => api.S();
    const M = { R: null, D: null, nav: null, eq: {}, gente: [], sacola: [], previa: null, painel: null, prox: 4, dede: null };
    const dadosC = () => { const d = S().dados; if (!d.celeb || !Array.isArray(d.celeb.tem)) d.celeb = { tem: [], slots: ['aviao', 'joelhada'] }; if (!Array.isArray(d.celeb.slots)) d.celeb.slots = ['aviao', 'joelhada']; return d.celeb; };
    const dadosE = () => { const d = S().dados; if (!d.esportiva) d.esportiva = {}; return d.esportiva; };
    const CELS = () => (typeof CELEBRACOES !== 'undefined' ? CELEBRACOES : {});
    const daLoja = () => Object.keys(CELS()).filter((k) => CELS()[k].loja);
    const tem = (k) => !CELS()[k].loja || dadosC().tem.includes(k);

    function modelo(ap, fem2, roupa, cores) {
      const s = S(); let m = null, opt = null;
      try { if (s.f2 && s.f2.modeloPessoa) { const r = s.f2.modeloPessoa({ ap, fem: fem2, roupa, cores }); m = r.m; opt = r.opt; } } catch (e) { console.warn('[Esportiva] modelo:', e); }
      if (!m) { opt = Object.assign({ camisa: cores[0], listra: cores[0], gola: cores[2], calcao: cores[1], meia: cores[1], sola: '#e6e6e0', corTexto: '#F2F2EE', numero: '', nome: ' ', fundoNome: 'rgba(0,0,0,0)', manga: 0, meiao: 1, cabecao: 1, escala: 1 }, ap); m = makeAthlete(opt); }
      return { m, opt };
    }
    function criarEquipe(E) {
      const s = S(), ap = api.gerarAparencia(E.seed, E.sexo), { m, opt } = modelo(ap, E.sexo === 'F', 0, [AZUL, '#1c1c1f', AMAR, '#f4f4ec']);
      const G = new api.Geo(); G.box(0.02, 0.1, 0.16, AMAR, 0.185, 1.12, 0.12); G.box(0.36, 0.05, 0.5, AMAR, 0, 0.62, 0);   // o crachá e a faixa amarela da cintura
      m.corpo.add(G.malha(api.MAT));
      const A = api.atorDe(m, opt, 'equipeEsp'); A.eq = E; s.npcs.push(A); M.eq[E.k] = A;
      const P = E.sec === 'caixa' ? M.D.caixa : M.D.secoes[E.sec]; A.x = P.x; A.z = P.z; A.yaw = A.yawAlvo = P.yaw; A.casa = P;
      s.falantesExtra = s.falantesExtra || {}; s.falantesExtra['esp_' + E.k] = { A, nome: Tx(E.nome), voz: E.sexo === 'F' ? 0 : 2 };
      return A;
    }

    // ---------------------------------------------------------------- NAVEGAÇÃO: grade de 0,35 m e A* (como no bar.js)
    const CEL = 0.35, RR = 0.3;
    function livreEst(x, z) {
      const L = M.R.lim; if (x < L.x0 || x > L.x1 || z < L.z0 || z > L.z1) return false;
      for (const b of M.R.col) if (x > b.x0 - RR && x < b.x1 + RR && z > b.z0 - RR && z < b.z1 + RR) return false;
      return true;
    }
    function montarNav() {
      const L = M.R.lim, nx = Math.floor((L.x1 - L.x0) / CEL) + 1, nz = Math.floor((L.z1 - L.z0) / CEL) + 1, livre = new Uint8Array(nx * nz);
      for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) livre[j * nx + i] = livreEst(L.x0 + i * CEL, L.z0 + j * CEL) ? 1 : 0;
      M.nav = { nx, nz, livre, x0: L.x0, z0: L.z0 };
    }
    const cel = (x, z) => { const N = M.nav; return [clampN(Math.round((x - N.x0) / CEL), 0, N.nx - 1), clampN(Math.round((z - N.z0) / CEL), 0, N.nz - 1)]; };
    const cen = (i, j) => ({ x: M.nav.x0 + i * CEL, z: M.nav.z0 + j * CEL });
    function celLivreMaisPerto(i, j) {
      const N = M.nav; if (N.livre[j * N.nx + i]) return [i, j];
      for (let r = 1; r < 14; r++) { let melhor = null, bd = 1e9;
        for (let dj = -r; dj <= r; dj++) for (let di = -r; di <= r; di++) { if (Math.max(Math.abs(di), Math.abs(dj)) !== r) continue; const a = i + di, b = j + dj; if (a < 0 || b < 0 || a >= N.nx || b >= N.nz || !N.livre[b * N.nx + a]) continue; const d = di * di + dj * dj; if (d < bd) { bd = d; melhor = [a, b]; } }
        if (melhor) return melhor; }
      return [i, j];
    }
    function pontoLivre(x, z) { if (livreEst(x, z)) return { x, z }; const [i, j] = celLivreMaisPerto(...cel(x, z)); return cen(i, j); }
    function vista(a, b) { const d = Math.hypot(b.x - a.x, b.z - a.z), n = Math.ceil(d / 0.12); for (let k = 1; k <= n; k++) { const u = k / n; if (!livreEst(a.x + (b.x - a.x) * u, a.z + (b.z - a.z) * u)) return false; } return true; }
    function caminho(x0, z0, x1, z1, exato) {
      if (!M.nav) montarNav();
      const N = M.nav, fim = exato ? { x: x1, z: z1 } : pontoLivre(x1, z1), fimL = pontoLivre(x1, z1), [si, sj] = celLivreMaisPerto(...cel(x0, z0)), [ti, tj] = cel(fimL.x, fimL.z);
      if (vista({ x: x0, z: z0 }, fimL)) return exato && (fim.x !== fimL.x || fim.z !== fimL.z) ? [fimL, fim] : [fim];
      const idx = (i, j) => j * N.nx + i, n = N.nx * N.nz, g = new Float32Array(n).fill(1e9), de = new Int32Array(n).fill(-1), fechado = new Uint8Array(n);
      const h = (i, j) => Math.hypot(i - ti, j - tj), ab = [[h(si, sj), si, sj]]; g[idx(si, sj)] = 0;
      let achou = false;
      while (ab.length) {
        let mi = 0; for (let k = 1; k < ab.length; k++) if (ab[k][0] < ab[mi][0]) mi = k;
        const [, i, j] = ab[mi]; ab[mi] = ab[ab.length - 1]; ab.pop();
        const k0 = idx(i, j); if (fechado[k0]) continue; fechado[k0] = 1;
        if (i === ti && j === tj) { achou = true; break; }
        for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
          if (!di && !dj) continue; const a = i + di, b = j + dj; if (a < 0 || b < 0 || a >= N.nx || b >= N.nz) continue;
          const k1 = idx(a, b); if (!N.livre[k1] || fechado[k1]) continue;
          if (di && dj && (!N.livre[idx(i + di, j)] || !N.livre[idx(i, j + dj)])) continue;
          const ng = g[k0] + (di && dj ? 1.414 : 1); if (ng < g[k1]) { g[k1] = ng; de[k1] = k0; ab.push([ng + h(a, b), a, b]); }
        }
      }
      if (!achou) return [fim];
      const cs = []; for (let k = idx(ti, tj); k >= 0; k = de[k]) cs.push(cen(k % N.nx, Math.floor(k / N.nx)));
      cs.reverse(); cs.push(fimL);
      const out = []; let a = { x: x0, z: z0 }, k = 0;
      while (k < cs.length) { let far = k; for (let q = cs.length - 1; q > k; q--) if (vista(a, cs[q])) { far = q; break; } out.push(cs[far]); a = cs[far]; k = far + 1; }
      if (exato) out.push(fim);
      return out;
    }
    function genteNaFrente(A, nx, nz) {
      const s = S();
      for (const B of s.npcs.concat([s.jog])) { if (B === A || B.oculto || B.sentado) continue; const dn = Math.hypot(nx - B.x, nz - B.z); if (dn < 0.5 && dn < Math.hypot(A.x - B.x, A.z - B.z) - 1e-4) return true; }
      return false;
    }
    function andarP(A, dt) {
      const R = A.rotaP; if (!R || !R.length) { A.andando = false; return true; }
      const q = R[0], dx = q.x - A.x, dz = q.z - A.z, d = Math.hypot(dx, dz), v = (A.vel || 1.2) * dt;
      if (d <= Math.max(v, 0.04)) { A.x = q.x; A.z = q.z; R.shift(); A.esperaP = 0; if (!R.length) { A.andando = false; return true; } return false; }
      const tenta = (ux, uz, fantasma) => { const nx = A.x + ux * v, nz = A.z + uz * v; if (!fantasma && !livreEst(nx, nz) && livreEst(A.x, A.z)) return false; if (!fantasma && genteNaFrente(A, nx, nz)) return false; A.x = nx; A.z = nz; A.yawAlvo = Math.atan2(-uz, ux); return true; };
      const ux = dx / d, uz = dz / d, esp = A.esperaP || 0;
      let ok = tenta(ux, uz, false);
      if (!ok && esp > 0.3) for (const ang of [0.6, -0.6, 1.1, -1.1]) { const c = Math.cos(ang), s2 = Math.sin(ang); if (tenta(ux * c - uz * s2, ux * s2 + uz * c, false)) { ok = true; break; } }
      if (!ok && esp > 1.2) ok = tenta(ux, uz, true);
      A.andando = ok; A.correndo = false; A.esperaP = ok ? Math.max(0, esp - dt * 2) : esp + dt;
      return false;
    }
    const irPara = (A, x, z, exato) => { A.rotaP = caminho(A.x, A.z, x, z, exato); };
    async function andarJog(x, z, vel) { const J = S().jog, r = caminho(J.x, J.z, x, z); await api.andar(J, r.map((p) => [p.x, p.z]), vel || 1.7); }


    // ---------------------------------------------------------------- AS POSES DAS COMEMORAÇÕES (a mesma função da partida: jogo.js)
    function posar(A, c, t) {
      const m = A.m, r = m.raiz, P = celebPose(c, t), corre = t < c.swing ? Math.sin(t * 11) * 0.9 : 0;
      aplicarPoseCeleb(m, c, P, corre, { x: r.position.x, y: r.position.y, z: r.position.z }, -A.yaw); aplicarPoseCelebExtras(m, P);
    }
    function soltar(A) {                                                 // volta o boneco ao normal (o poseAtor cuida do resto)
      const m = A.m, r = m.raiz; r.rotation.order = 'XYZ'; r.rotation.x = 0; r.rotation.z = 0; m.corpo.rotation.y = 0; m.corpo.rotation.z = 0;
      m.pernaE.rotation.x = 0; m.pernaD.rotation.x = 0; usarCotovelo(m.bracoE, 0, 0); usarCotovelo(m.bracoD, 0, 0); usarJoelhos(m, 0, 0); if (m.cabecaLigada) usarCabeca(m, 0);
    }
    // o jogador testando no campinho (VER no catálogo)
    function ver(k) {
      const s = S(), J = s.jog, c = CELS()[k], Pc = M.D.palco; if (!c || M.previa) return;
      let dist = 0; for (let t = 0; t < c.dur; t += 0.05) dist += celebVel(c, t) * 0.05;
      J.x = Pc.x0; J.z = Pc.z; J.yaw = J.yawAlvo = 0; J.andando = false; J.correndo = false;
      M.previa = { k, c, t: 0, fator: dist > 0.1 ? Math.min(1, (Pc.x1 - Pc.x0) / dist) : 1 };
      if (M.dede) { soltar(M.eq.dede); M.dede = null; }
      try { api.som && api.som('pop'); } catch (e) { /* sem som */ }
    }
    function tickPrevia(dt) {
      const s = S(), J = s.jog, Pv = M.previa; if (!Pv) return;
      const c = Pv.c, C = M.D.campo; if (!Pv.pausa) Pv.t += dt;   // (pausa: só para os testes)
      const v = celebVel(c, Math.min(Pv.t, c.dur)) * Pv.fator; J.yaw -= c.giro * dt * 0.6; J.yawAlvo = J.yaw;
      J.x = clampN(J.x + Math.cos(J.yaw) * v * dt, C.x0 + 1.2, C.x1 - 0.4); J.z = clampN(J.z - Math.sin(J.yaw) * v * dt, C.z0 + 0.5, C.z1 - 0.5);
      posar(J, c, Math.min(Pv.t, c.dur));
      if (Pv.t >= c.dur + 0.15) { soltar(J); M.previa = null; if (M.painel) M.painel.render(); }
    }
    // o Dedé chamando cliente: de vez em quando faz uma comemoração parado, na beira do campinho
    function tickDede(dt) {
      const A = M.eq.dede; if (!A) return;
      if (M.dede) { M.dede.t += dt; posar(A, M.dede.c, Math.min(M.dede.t, M.dede.c.dur)); if (M.dede.t >= M.dede.c.dur) { soltar(A); M.dede = null; M.proxDede = rnd(9, 18); } return; }
      if (A.falando || M.previa || M.painel || S().modo !== 'livre') return;
      M.proxDede = (M.proxDede == null ? rnd(3, 7) : M.proxDede) - dt;
      if (M.proxDede <= 0) { const k = pk(DANCAS_DEDE.filter((q) => CELS()[q])); if (k) M.dede = { k, c: CELS()[k], t: 0 }; else M.proxDede = 20; }
    }

    // ---------------------------------------------------------------- OS PSEUDO-CLIENTES (passeiam, olham as prateleiras e vão embora)
    const pontoLivreOlhar = (A) => { const usados = new Set(M.gente.filter((q) => q !== A && q.es).map((q) => q.es.i)), J = S().jog; const L = M.D.olhar.map((p, i) => i).filter((i) => !usados.has(i) && Math.hypot(M.D.olhar[i][0] - J.x, M.D.olhar[i][1] - J.z) > 1.0); return L.length ? pk(L) : -1; };
    function novoCliente(jaDentro) {
      const s = S(), A = api.criarPessoa(s.f2, Math.random, Math.random() < 0.45); A.tipo = 'clienteEsp'; A.vel = 1.0 + Math.random() * 0.25;
      const i = pontoLivreOlhar(A); if (i < 0) { api.descartarPessoa(A); return null; }
      A.es = { i, fase: jaDentro ? 'olha' : 'indo', t: 0, dur: rnd(4, 9), resta: 2 + Math.floor(Math.random() * 4) };
      const p = M.D.olhar[i];
      if (jaDentro) { A.x = p[0]; A.z = p[1]; A.yaw = A.yawAlvo = p[2]; A.es.t = rnd(0, 4); }
      else { const e = M.R.entrada; A.x = e.x + rnd(-0.3, 0.3); A.z = e.z + 0.4; A.yaw = A.yawAlvo = Math.PI / 2; irPara(A, p[0], p[1]); }
      s.npcs.push(A); api.poseAtor(A, 0.016); M.gente.push(A); return A;
    }
    function poseOlha(A, m) {                                           // a mão no queixo, pensando (ou as duas na cintura)
      if (A.es && A.es.jeito) { m.bracoE.rotation.x = 1.1; m.bracoD.rotation.x = -1.1; usarCotovelo(m.bracoE, -1.9, 0); usarCotovelo(m.bracoD, 1.9, 0); }
      else { m.bracoD.rotation.z = 0.95; usarCotovelo(m.bracoD, 0, 1.95); m.bracoE.rotation.z = 0.75; usarCotovelo(m.bracoE, -1.3, 0.2); usarCabeca(m, -0.1 + Math.sin((A.t || 0) * 0.8) * 0.08); }
    }
    function tickCliente(A, dt) {
      const E = A.es; if (!E || !M.D) return; E.t += dt;
      if (E.fase === 'sai') { if (andarP(A, dt) || E.t > 30) { M.gente = M.gente.filter((q) => q !== A); api.descartarPessoa(A); } return; }
      if (E.fase === 'indo') { if (andarP(A, dt) || E.t > 25) { const p = M.D.olhar[E.i]; E.fase = 'olha'; E.t = 0; E.dur = rnd(4, 9); A.yawAlvo = p[2]; A.andando = false; E.jeito = Math.random() < 0.35; A.poseFn = Math.random() < 0.6 ? poseOlha : null; } return; }
      if (E.t > E.dur) {
        A.poseFn = null; E.resta--;
        const i = E.resta > 0 ? pontoLivreOlhar(A) : -1;
        if (i < 0) { E.fase = 'sai'; E.t = 0; E.i = -1; const sd = M.R.saida; A.rotaP = caminho(A.x, A.z, sd.x, sd.z - 0.6); A.rotaP.push({ x: sd.x, z: sd.z + 0.2 }); }
        else { E.i = i; E.fase = 'indo'; E.t = 0; irPara(A, M.D.olhar[i][0], M.D.olhar[i][1]); }
      }
    }
    const alvoClientes = () => (api.diaSemana() >= 5 ? 5 : 3);
    function tickFluxo(dt) {
      M.prox -= dt; if (M.prox > 0) return; M.prox = rnd(6, 14);
      if (M.gente.filter((A) => A.es && A.es.fase !== 'sai').length < alvoClientes()) novoCliente(false);
    }

    // ---------------------------------------------------------------- O CATÁLOGO DAS COMEMORAÇÕES (painel à direita: o campinho fica à vista)
    function abrirPainel() {
      return new Promise((fim) => {
        const d = S().dados, C = dadosC();
        const el = document.createElement('div'); el.id = 'espCatalogo';
        el.style.cssText = 'position:fixed;z-index:22;right:8px;top:8px;bottom:8px;width:min(350px,48vw);background:#101a3c;border:4px solid ' + AMAR + ';color:#f4f0e6;display:flex;flex-direction:column;font-family:var(--font-body);box-shadow:-6px 6px 0 #0008;';
        const cab = document.createElement('div'); cab.style.cssText = 'padding:8px 10px;background:' + AZUL + ';border-bottom:3px solid ' + AMAR + ';display:flex;flex-direction:column;gap:3px;';
        const tit = document.createElement('div'); tit.style.cssText = 'font:700 14px/1.1 var(--font-display);letter-spacing:.08em;color:' + AMAR + ';'; tit.textContent = Tx('COMEMORAÇÕES');
        const inf = document.createElement('div'); inf.style.cssText = 'font:600 11.5px/1.35 var(--font-body);white-space:pre-line;';
        cab.append(tit, inf);
        const lista = document.createElement('div'); lista.style.cssText = 'flex:1;overflow:auto;padding:6px;display:flex;flex-direction:column;gap:5px;';
        const pe = document.createElement('div'); pe.style.cssText = 'padding:6px 8px;border-top:3px solid ' + AMAR + ';display:flex;flex-direction:column;gap:5px;align-items:stretch;';
        const nota = document.createElement('div'); nota.style.cssText = 'font:600 10.5px/1.3 var(--font-body);color:#c8d0ea;'; nota.textContent = Tx('O que está na sacola você paga no caixa, com a Marta.');
        const fechar = document.createElement('button'); fechar.type = 'button'; fechar.className = 'pxBtn'; fechar.textContent = Tx('FECHAR'); fechar.style.cssText = '--p:var(--p2,2px);height:38px;font-size:12px;';
        pe.append(nota, fechar);
        const bt = (txt, cor, fn, on) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = txt; b.style.cssText = 'flex:1;min-width:0;height:28px;border:2px solid ' + (on ? '#fff' : '#0b1430') + ';background:' + cor + ';color:' + (cor === AMAR ? '#101a3c' : '#fff') + ';font:700 10px/1 var(--font-display);letter-spacing:.03em;cursor:pointer;padding:0 4px;'; b.onclick = fn; return b; };
        function render() {
          const nomeDe = (k) => Tx(CELS()[k].nome);
          inf.textContent = Tfx('Você tem {0} fakes', d.fakes) + '\n' + (M.sacola.length ? Tfx('Sacola: {0} ({1} fakes)', M.sacola.length, M.sacola.length * PRECO) : Tx('Sacola vazia')) + '\n' + Tfx('Botão 1: {0}', nomeDe(C.slots[0])) + ' · ' + Tfx('Botão 2: {0}', nomeDe(C.slots[1]));
          const rolagem = lista.scrollTop; lista.innerHTML = '';
          for (const k of ['aviao', 'joelhada'].concat(daLoja())) {
            const c = CELS()[k], meu = tem(k), naSac = M.sacola.includes(k), vendo = M.previa && M.previa.k === k;
            const lin = document.createElement('div'); lin.dataset.k = k; lin.style.cssText = 'background:' + (vendo ? '#2a3a7a' : '#1a2650') + ';border:2px solid ' + (meu ? '#3fb76a' : naSac ? AMAR : '#2a3a7a') + ';padding:5px 6px;display:flex;flex-direction:column;gap:4px;';
            const top = document.createElement('div'); top.style.cssText = 'display:flex;justify-content:space-between;align-items:center;gap:6px;';
            const n = document.createElement('span'); n.style.cssText = 'font:700 12.5px/1.1 var(--font-display);'; n.textContent = nomeDe(k);
            const tag = document.createElement('span'); tag.style.cssText = 'font:700 10px/1 var(--font-display);padding:3px 5px;white-space:nowrap;background:' + (meu ? '#1f7a4d' : naSac ? '#8a6a10' : '#0b1430') + ';color:' + (meu || naSac ? '#fff' : AMAR) + ';';
            tag.textContent = !c.loja ? Tx('De graça') : meu ? Tx('É sua') : naSac ? Tx('Na sacola') : Tfx('{0} fakes', PRECO);
            top.append(n, tag);
            const bs = document.createElement('div'); bs.style.cssText = 'display:flex;gap:4px;';
            bs.appendChild(bt(Tx('VER'), '#3a64b8', () => { ver(k); render(); }));
            if (meu) { bs.appendChild(bt(Tx('BOTÃO 1'), C.slots[0] === k ? '#1f7a4d' : '#2a3a7a', () => equipar(0, k), C.slots[0] === k)); bs.appendChild(bt(Tx('BOTÃO 2'), C.slots[1] === k ? '#1f7a4d' : '#2a3a7a', () => equipar(1, k), C.slots[1] === k)); }
            else if (naSac) bs.appendChild(bt(Tx('TIRAR'), '#a3162a', () => { M.sacola = M.sacola.filter((q) => q !== k); render(); }));
            else bs.appendChild(bt(Tx('LEVAR'), AMAR, () => { M.sacola.push(k); try { api.som && api.som('pop'); } catch (e) { /* nada */ } render(); }));
            lin.append(top, bs); lista.appendChild(lin);
          }
          lista.scrollTop = rolagem;
        }
        function equipar(i, k) { if (C.slots[1 - i] === k) C.slots[1 - i] = C.slots[i]; C.slots[i] = k; api.gravar(d.ponto || 'chegada'); render(); }
        fechar.onclick = () => { if (M.previa) { soltar(S().jog); M.previa = null; } el.remove(); M.painel = null; fim(); };
        el.append(cab, lista, pe); (document.getElementById('raizJogo') || document.body).appendChild(el);
        M.painel = { el, render }; render();
      });
    }
    async function catalogo() {
      const s = S(), J = s.jog, d = s.dados, E = dadosE(), A = M.eq.dede; if (!A || M.painel) return;
      s.modo = 'cena'; api.UI().ctl.hidden = true; api.aviso(''); A.falando = true; if (M.dede) { soltar(A); M.dede = null; }
      const y0 = A.yawAlvo; A.yawAlvo = Math.atan2(-(J.z - A.z), J.x - A.x);
      try {
        if (!E.dede) {
          await api.fala('esp_dede', Tx('E aí, craque! Aqui é o cantinho das comemorações. Gol sem festa não vale!'));
          await api.fala('esp_dede', Tfx('Tenho 20 comemorações, {0} fakes cada. Pode testar todas aqui no campinho antes de levar.', PRECO));
          await api.fala('esp_dede', Tx('O que você escolher vai para a sacola. Depois é só pagar com a Marta, no caixa.'));
          E.dede = true; api.gravar(d.ponto || 'chegada');
        } else await api.fala('esp_dede', Tx('Bora ver o que combina com você!'));
        Dialogo.esconder();
        await andarJog(M.D.palco.x0, M.D.palco.z, 2.4); J.yawAlvo = 0; A.yawAlvo = Math.atan2(-(M.D.palco.z - A.z), 0 - A.x);
        const n0 = M.sacola.length;
        await abrirPainel();
        A.yawAlvo = Math.atan2(-(J.z - A.z), J.x - A.x);
        await api.fala('esp_dede', M.sacola.length > n0 ? Tx('Boa escolha! Passa no caixa que a Marta fecha a conta.') : M.sacola.length ? Tx('O que você escolher vai para a sacola. Depois é só pagar com a Marta, no caixa.') : Tx('Volta quando quiser treinar a comemoração!'));
      } catch (e) { console.error('[Esportiva] catálogo:', e); }
      finally {
        A.falando = false; A.yawAlvo = y0; if (M.painel) { M.painel.el.remove(); M.painel = null; } if (M.previa) { soltar(J); M.previa = null; }
        try { Dialogo.esconder(); } catch (e) { /* nada */ }
        const ss = S(); if (ss && ss.ativo && ss.modo === 'cena') api.liberar();
      }
    }
    // os outros vendedores: a seção ainda não vende
    async function falarVendedor(k) {
      const A = M.eq[k], J = S().jog; if (!A) return; const y0 = A.yawAlvo; A.yawAlvo = Math.atan2(-(J.z - A.z), J.x - A.x); A.falando = true;
      try { for (const t of PAPO[k]) await api.fala('esp_' + k, Tx(t)); } finally { A.falando = false; A.yawAlvo = y0; Dialogo.esconder(); }
    }
    // a Marta, no caixa: cobra o que está na sacola
    async function caixa() {
      const s = S(), d = s.dados, E = dadosE(), C = dadosC(), A = M.eq.marta; if (!A) return;
      A.falando = true;
      try {
        if (!E.marta) { await api.fala('esp_marta', fem() ? Tx('Bem-vinda à Golaço Esportes! Escolhe com os vendedores e paga aqui comigo.') : Tx('Bem-vindo à Golaço Esportes! Escolhe com os vendedores e paga aqui comigo.')); E.marta = true; api.gravar(d.ponto || 'chegada'); }
        if (!M.sacola.length) { await api.fala('esp_marta', Tx('A sua sacola está vazia. O Dedé, ali no campinho, mostra as comemorações.')); return; }
        const total = M.sacola.length * PRECO, nomes = M.sacola.map((k) => Tx(CELS()[k].nome)).join(', ');
        await api.fala('esp_marta', Tfx('Na sacola: {0}. Dá {1} fakes.', nomes, total));
        if (d.fakes < total) { await api.fala('esp_marta', Tfx('Faltam {0} fakes. Tira alguma coisa da sacola com o Dedé ou volta depois.', total - d.fakes)); return; }
        const r = await Escolha.mostrar(Tx('Caixa da loja'), [Tfx('Pagar {0} fakes', total), Tx('Agora não')]);
        if (r !== 0) { await api.fala('esp_marta', Tx('Sem pressa. A sacola fica aqui guardada enquanto você estiver na loja.')); return; }
        d.fakes -= total; for (const k of M.sacola) if (!C.tem.includes(k)) C.tem.push(k);
        const ult = M.sacola[M.sacola.length - 1]; M.sacola = [];
        let botao = 0; if (!C.slots.includes(ult)) { botao = CELS()[C.slots[1]].loja && !CELS()[C.slots[0]].loja ? 1 : 2; C.slots[botao - 1] = ult; }   // a última comprada já entra num botão (troca primeiro uma das de graça)
        E.compras = (E.compras | 0) + 1; E.gasto = (E.gasto | 0) + total;
        api.gravar(d.ponto || 'chegada'); api.somCaixa(); api.somDinheiro(); api.mostrarDinheiro(false); api.gastoNaTela(total);
        await api.fala('esp_marta', Tx('Prontinho! Já é tudo seu.'));
        if (botao) await api.fala('esp_marta', Tfx('A comemoração "{0}" já ficou no seu botão {1}. Para trocar, é com o Dedé.', Tx(CELS()[ult].nome), botao));
        await api.fala('esp_marta', Tx('Agora é fazer gol para estrear!'));
      } catch (e) { console.error('[Esportiva] caixa:', e); }
      finally { A.falando = false; try { Dialogo.esconder(); } catch (e) { /* nada */ } }
    }

    // ---------------------------------------------------------------- entrou / saiu / interação / a cada quadro
    function entrou(R, idx) {
      const s = S(); M.R = R; M.D = R.esportiva || null; if (!M.D) return; void idx;
      M.nav = null; montarNav(); M.eq = {}; M.gente = []; M.sacola = []; M.previa = null; M.painel = null; M.dede = null; M.proxDede = null; M.prox = rnd(3, 8);
      for (const E of EQUIPE) criarEquipe(E);
      for (let i = 0; i < alvoClientes() - 1; i++) novoCliente(true);
      void s;
    }
    function saiu() {
      const s = S(), J = s.jog;
      if (M.previa && J) soltar(J); if (M.painel) M.painel.el.remove();
      if (s.falantesExtra) for (const k of Object.keys(s.falantesExtra)) if (k.startsWith('esp_')) delete s.falantesExtra[k];
      M.R = null; M.D = null; M.nav = null; M.eq = {}; M.gente = []; M.sacola = []; M.previa = null; M.painel = null; M.dede = null;
    }
    function alvos(v) {
      const s = S(), D = M.D; if (!D || s.modo !== 'livre') return;
      for (const E of EQUIPE) {
        const A = M.eq[E.k]; if (!A) continue;
        if (E.sec === 'caixa') v.push({ x: D.pagar.x, z: D.pagar.z, r: 1.7, txt: Tx('Caixa da loja') + (M.sacola.length ? ' (' + M.sacola.length + ')' : ''), fn: caixa, y: 2.3, pri: true });
        else if (E.k === 'dede') v.push({ x: A.x, z: A.z, r: 1.8, txt: Tx('Ver as comemorações'), fn: catalogo, y: 2.4, pri: true });
        else v.push({ x: A.x, z: A.z + 0.5, r: 1.6, txt: Tfx('Falar com {0}', Tx(E.nome)), fn: () => falarVendedor(E.k), y: 2.4 });
      }
    }
    function tick(dt) {
      const s = S(); if (!s || !M.D || !s.dentro || s.dentro.nome !== 'esportiva') return;
      tickPrevia(dt); tickDede(dt); tickFluxo(dt);
      for (const E of EQUIPE) { const A = M.eq[E.k]; if (A && !A.falando && E.k !== 'dede' && s.modo === 'livre') { const J = s.jog, perto = Math.hypot(J.x - A.x, J.z - A.z) < 3.2; A.yawAlvo = perto ? Math.atan2(-(J.z - A.z), J.x - A.x) : A.casa.yaw; } }   // quem está perto: o vendedor olha para o jogador
    }
    function limpar() { if (M.painel) { M.painel.el.remove(); M.painel = null; } }
    const dbg = { M, ver, catalogo, caixa, abrirPainel, daLoja, dadosC, posar, soltar, falarVendedor, novoCliente };
    if (typeof window !== 'undefined') window.__esportiva = dbg;
    return { entrou, saiu, chegou: () => false, tickCliente, tick, alvos, alvosSentado: () => null, liberarMesa() {}, limpar, _f: dbg };
  }

  if (typeof I18N !== 'undefined') for (const k of Object.keys(TRAD)) if (!I18N[k]) I18N[k] = TRAD[k];
  window.FutebolJS.registrarFase({ id: 'esportiva', nome: 'Golaço Esportes', nucleoMinimo: '7.1.9', iniciar: async () => {}, criar, dados: { PRECO, TRAD } });
})();
