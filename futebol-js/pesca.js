/* =====================================================================
   FUTEBOL JS · pesca.js · A PESCA NO LAGO DO SAPO CURURU (arquivo SEPARADO, como academia.js)
   ---------------------------------------------------------------------
   6.4.0 — primeira versão.
   6.6.7 — O DUKE (duke.js, arquivo novo: o modelo 3D): no dia 13 de MAIO, pela data do APARELHO, cada mordida tem 7% de chance de ser
           ele (uma vez por dia). Briga de lendário, sem pular para fora. Pegou: ele LEVITA para fora da água, gira até ficar de frente,
           ENCARA o jogador (3 planos), volta para a água e o jogador diz "O que foi que acabou de acontecer....?". Não vai para a caixa
           nem para o catálogo (só conta em pesca.dukeVisto). PP.dukeForcado = 'sempre' força o dia/a mordida (testes).
   6.6.8 — ligado pelo painel do desenvolvedor (cidade.js: dukeDev), o Duke pode aparecer de novo no mesmo dia.
   - Registrado com FutebolJS.registrarFase({ id: 'pesca' }) só para o jogo saber baixar o arquivo; NÃO roda como fase.
     A cidade (cidade.js) baixa em segundo plano junto do academia.js e chama criar(api) (api = apiPesca() da cidade).
     A casinha (o prédio) é montada no cidade.js (casinhaPesca, CASA_PESCA); daqui vêm o Bené, o quadro do catálogo, a persiana,
     o Cadu no lago, a loja, o catálogo, a caixa e o MINIGAME. Suba junto do cidade.js / mercado.js / jogo.js.
   - O CADU (sábado e domingo): sai de casa e chega no píer às 6h; fica sentado na beira do píer pescando (lança, espera, fisga,
     puxa, às vezes pega um peixe e guarda no balde, às vezes escapa) até as 20h, quando volta para casa. Falando com ele: pedir uma
     varinha → ele empresta a de BAMBU (fica com o jogador), dá 10 minhocas e a caixa de isopor → "Você quer pescar agora?".
     O mercado fica com o pai dele (mercado.js: seu Raimundo).
   - O BENÉ mora na casinha (abre das 6h às 20h; fora disso a persiana fica fechada): vende ISCAS e VARAS e compra os peixes da caixa.
     O QUADRO do catálogo fica na parede da casinha (a imagem mostra os peixes já pescados) e abre o catálogo a qualquer hora.
   - 60 PEIXES brasileiros (PEIXES): raridade (comum, incomum, raro, épico, lendário), horário (manhã 5h–11h, tarde 11h–17h,
     entardecer 17h–20h, noite 20h–5h), isca favorita, vara adequada, origem e faixa de peso. No catálogo, os dados de cada peixe só
     aparecem depois que ele é pescado pela 1ª vez.
   - PESO: magro (×0,5), comum (×1) ou pesado (×2), conforme onde o peso caiu na faixa da espécie (abaixo de 25% = magro, acima de
     78% = pesado). PREÇO = base da raridade (15 · 25 · 50 · 80 · 150) × multiplicador (arredondado: os fakes são inteiros).
   - 8 ISCAS (3 a 25 fakes a unidade) e 5 VARAS (bambu, presente do Cadu, até a de titânio por 2000). Iscas melhores: o peixe morde
     mais rápido, a hora de fisgar dura mais e a briga é mais fácil — com limite para raros, épicos e lendários (FACIL_RAR). Varas
     melhores: lançam mais longe, aguentam mais tensão, recolhem mais rápido e trazem peixes mais raros (RAR_VARA). Isca favorita:
     o peixe aparece mais e morde mais rápido. Lançar longe (para o meio do lago, mais fundo) ajuda a achar os raros.
   - ONDE: de qualquer lugar da beira do lago ou do píer com água na frente ("Pescar aqui"); só nos dias de folga (em dia de trabalho
     o personagem diz que é melhor não pescar). Com o Cadu, a conversa leva para a ponta do píer, do lado dele.
   - MINIGAME (como o chute da partida): mira arrastando o dedo na tela (◀ ▶ / A D no teclado), segurar LANÇAR para encher a barra de força e soltar; a boia cai na água;
     beliscadas (não fisgue ainda!); quando a boia afunda: FISGAR; a briga: segurar PUXAR recolhe a linha, mas quando o peixe corre
     a tensão sobe — solte antes de arrebentar, e não deixe a linha frouxa demais. O peixe vai para a CAIXA (até 30).
   6.6.0 — a pesca ficou mais "lógica":
   - O LAGO tem manchas ESCURAS (poços fundos) e CLARAS (bancos de areia): é a profundidade de verdade (cidade.js: profLago), a mesma que
     pinta a água. O LANÇAMENTO ganha uma NOTA (0–100) pela profundidade de ONDE A ISCA CAIU: nota alta = peixes mais raros, mais pesados
     e que mordem mais rápido; nota baixa = o contrário (e os peixinhos de beira gostam do raso, os bagres do fundo). A barra do LANÇAR
     agora é só a DISTÂNCIA (vai e volta, como a força do chute): não tem lançamento bom ou ruim pela força, só pelo lugar. A vara espalha
     um pouco (as melhores são mais precisas).
   - NOTA MÁXIMA (93+, o miolo de um poço): a cena do LANÇAMENTO PERFEITO — o mesmo lançamento em 4 câmeras (de lado, seguindo a isca
     desde a ponta da vara, de longe com o arco todo e rente à água onde ela cai), em câmera lenta, e a mensagem. Tocar pula.
   - A MONTAGEM na ponta da linha: boia (nova), linha curtinha, chumbinho, anzol e a ISCA da vez (uma para cada tipo). Pendurada, ela
     balança com a vara; voa atrás da boia; volta sem a isca quando o peixe comeu.
   - A BRIGA: a barra de TENSÃO tem a FAIXA BOA (verde). Segurar PUXAR sobe a tensão, soltar desce; o peixe correndo puxa para cima.
     Só na faixa a linha é recolhida e o peixe cansa. Abaixo dela enche o "linha frouxa" (cheio: o peixe cospe o anzol); acima, o
     "linha esticada" (cheio: arrebenta). A faixa é mais estreita para peixe raro e pesado (e com vara fraca para o peixe), mais larga com
     isca boa e vara boa, e ANDA nos peixes raros. Simulado no Node (sim3.js do desenvolvimento) com jogadores "bom/médio/fraco".
   - VIBRAÇÃO do celular: leve na beliscada, forte na mordida, pulsos na briga (arrancada, linha esticando cada vez mais forte, linha
     frouxa, o molinete), forte ao arrebentar e no peixe pego.
   - O primeiro peixe do dia: +5 no "tranquilo" (Espectros; escala −100 a +100 = +0,5 numa de 0 a 10). Guarda o dia em pesca.tranqDia.
   - PIXEL ART nova dos 60 peixes (80×48, artePeixe): perfil da espécie, rabo e nadadeiras pelo tipo, degradê pontilhado, sombras,
     escamas/placas/couro, linha lateral, guelra, olho com brilho, bigodes, desenhos e contorno. O PEIXE 3D sai da MESMA arte (cada pixel
     vira um bloquinho com a grossura do corpo). O quadro da casinha ficou 512×320.
   6.6.1 — SOLTAR o peixe na hora (guardar ou soltar): o jogador fala (magrinho: "deixa engordar"; gordinho e raro: "mesmo assim vou
     soltar") e o Cadu reage pela raridade (concordando com o magrinho; cada vez mais espantado com os outros). Lendário solto na frente do
     Cadu: CENA SECRETA (ele larga a vara, levanta revoltado e depois se acalma; pesca.cenaSecretaCadu conta as vezes; pesca.soltos).
     A linha não atravessa madeira/chão (fica por cima); madeira (píer, deque com folga, canoa) não conta como água, nem na briga.
     Mira e anéis sempre por cima da água. O peixe mostrado fica um pouco à frente das mãos.
   - TEXTOS: TRAD (en, es, it, fr) — as traduções daqui valem PRIMEIRO dentro da pesca (tr/trf): "LANÇAR" no jogo é o lateral do futebol
     (THROW); aqui é lançar a isca (CAST). Os nomes dos peixes ficam em PEIXES[].tr.
   - Salva em historia.cidade: pesca = { vara, varas, iscas, isca, caixa: [{ i, kg, c }], cat: { i: { n, rec, cl } }, total, ganhos, lendarios,
     caduVara, caduLago, caduMinhoca (dia em que o Cadu deu minhoca), conheceBene, papo, tranqDia, bagre } e mercado.conheceu/reconheceu (o 1º encontro com
     o Cadu pode ser aqui no lago).
   - O BAGRE-TROVÃO (evento escondido, fora do catálogo): pescando entre 0h e 1h com CHUVA, um raio cai no lago (cena em câmera lenta) e algo
     puxa a isca ("Eita..."). A briga é de lendário, mais comprida, com ROCK (Rock: sintetizado), raios caindo, choque na linha e saltos com
     faíscas; o relógio para enquanto dura. Perdeu: silêncio e o desabafo. Pegou: o jogador não sabe o que é e guarda para o seu Bené
     (pesca.bagre = { dia, kg }). No outro dia, falando com o Bené: ele não sabe o que é, oferece 10.000 fakes e vai buscar o dinheiro; o bicho
     acorda, voa, engole quem passava na trilha e some no céu; o jogador pede para ele ficar com o dinheiro e esquecer (pesca.bagre.fim = true).
     A arte (arteBagre, 112×64) vira o 3D como os outros peixes, mais uma malha do que brilha (arteBagreLuz).
   ===================================================================== */
(function () {
  'use strict';

  // ------------------------------------------------------------------ textos (pt → en, es, it, fr); os nomes dos peixes vêm em PEIXES[].tr
  const TRAD = {
    'O dia todo': ['All day', 'Todo el día', 'Tutto il giorno', 'Toute la journée'],
    'Catálogo do lago': ['Lake catalog', 'Catálogo del lago', 'Catalogo del lago', 'Catalogue du lac'],
    'Descobertos: {0}/60': ['Discovered: {0}/60', 'Descubiertos: {0}/60', 'Scoperti: {0}/60', 'Découverts : {0}/60'],
    'Seu Bené': ['Mr. Bené', 'Don Bené', 'Signor Bené', 'M. Bené'],
    'Cadu': ['Cadu', 'Cadu', 'Cadu', 'Cadu'],
    'Já são 20h! Vou nessa. Boa pescaria!': ['It’s 8 PM already! I’m heading out. Good fishing!', '¡Ya son las 20h! Me voy. ¡Buena pesca!', 'Sono già le 20! Vado. Buona pesca!', 'Il est déjà 20 h ! J’y vais. Bonne pêche !'],
    'Opa! Peguei: {0}!': ['Oh! Got one: {0}!', '¡Epa! Pesqué: {0}!', 'Oh! Preso: {0}!', 'Oh ! J’en ai un : {0} !'],
    'Ah, escapou!': ['Ah, it got away!', '¡Ah, se escapó!', 'Ah, è scappato!', 'Ah, il s’est échappé !'],
    'Falar com o Cadu': ['Talk to Cadu', 'Hablar con Cadu', 'Parla con Cadu', 'Parler à Cadu'],
    'Pescar': ['Fish', 'Pescar', 'Pesca', 'Pêcher'],
    'Pescar aqui': ['Fish here', 'Pescar aquí', 'Pesca qui', 'Pêcher ici'],
    'Eu acho melhor não pescar hoje, por conta do trabalho...': ['I think I’d better not fish today, because of work...', 'Creo que mejor no pesco hoy, por el trabajo...', 'Credo sia meglio non pescare oggi, per via del lavoro...', 'Je crois que je ferais mieux de ne pas pêcher aujourd’hui, à cause du travail...'],
    'Equipamento': ['Gear', 'Equipo', 'Attrezzatura', 'Équipement'],
    'Falar com o seu Bené': ['Talk to Mr. Bené', 'Hablar con don Bené', 'Parla con il signor Bené', 'Parler à M. Bené'],
    'Casinha da pesca fechada. Abre às 6h.': ['Fishing shack closed. Opens at 6 AM.', 'Casita de pesca cerrada. Abre a las 6h.', 'Casetta della pesca chiusa. Apre alle 6.', 'Cabane de pêche fermée. Ouvre à 6 h.'],
    'Ver o catálogo': ['See the catalog', 'Ver el catálogo', 'Guarda il catalogo', 'Voir le catalogue'],
    'Preciso de uma vara para pescar...': ['I need a rod to fish...', 'Necesito una caña para pescar...', 'Mi serve una canna per pescare...', 'Il me faut une canne pour pêcher...'],
    'O Cadu está bem ali. Posso pedir uma emprestada!': ['Cadu is right there. I can ask to borrow one!', 'Cadu está ahí mismo. ¡Le puedo pedir una prestada!', 'Cadu è proprio lì. Posso chiedergliene una in prestito!', 'Cadu est juste là. Je peux lui en emprunter une !'],
    'O seu Bené vende varas na casinha. E dizem que o Cadu pesca aqui no fim de semana.': ['Mr. Bené sells rods at the shack. And they say Cadu fishes here on weekends.', 'Don Bené vende cañas en la casita. Y dicen que Cadu pesca aquí los fines de semana.', 'Il signor Bené vende canne nella casetta. E dicono che Cadu peschi qui nel fine settimana.', 'M. Bené vend des cannes à la cabane. Et on dit que Cadu pêche ici le week-end.'],
    'Espera aí... {0}?! É você mesmo?!': ['Wait a sec... {0}?! Is that really you?!', 'Espera... ¿{0}?! ¡¿Eres tú de verdad?!', 'Aspetta... {0}?! Sei proprio tu?!', 'Attends... {0} ?! C’est vraiment toi ?!'],
    'Você me tirou daquele armário na escola, lembra? Eu nunca esqueci isso.': ['You got me out of that locker at school, remember? I never forgot that.', 'Me sacaste de aquel casillero en la escuela, ¿te acuerdas? Nunca lo olvidé.', 'Mi hai tirato fuori da quell’armadietto a scuola, ricordi? Non l’ho mai dimenticato.', 'Tu m’as sorti de ce casier à l’école, tu te souviens ? Je ne l’ai jamais oublié.'],
    'E ainda veio conversar comigo depois. Pouca gente fazia isso.': ['And you even came to talk to me afterwards. Not many people did that.', 'Y después hasta viniste a hablar conmigo. Poca gente hacía eso.', 'E dopo sei pure venuto a parlarmi. In pochi lo facevano.', 'Et tu es même venu me parler après. Peu de gens faisaient ça.'],
    'Cadu?! Quanto tempo!': ['Cadu?! Long time no see!', '¡¿Cadu?! ¡Cuánto tiempo!', 'Cadu?! Quanto tempo!', 'Cadu ?! Ça fait longtemps !'],
    'Opa! Eu sou o Cadu. Você me parece familiar... de onde será?': ['Hey! I’m Cadu. You look familiar... where from, I wonder?', '¡Hola! Soy Cadu. Me resultas familiar... ¿de dónde será?', 'Ehi! Sono Cadu. Mi sembri familiare... chissà da dove?', 'Salut ! Moi, c’est Cadu. Ta tête me dit quelque chose... d’où, je me demande ?'],
    'O meu pai tem o mercado lá na avenida. Durante a semana eu ajudo ele, mas sábado e domingo é dia de pescar!': ['My dad has the market over on the avenue. I help him during the week, but Saturday and Sunday are for fishing!', 'Mi papá tiene el mercado en la avenida. Entre semana lo ayudo, ¡pero sábado y domingo son para pescar!', 'Mio padre ha il mercato sul viale. In settimana lo aiuto, ma sabato e domenica si pesca!', 'Mon père a la supérette sur l’avenue. Je l’aide en semaine, mais le samedi et le dimanche, c’est la pêche !'],
    'E aí! Sábado e domingo eu venho pescar aqui. É o meu descanso.': ['Hey! On Saturdays and Sundays I come fishing here. It’s my break.', '¡Hola! Sábados y domingos vengo a pescar aquí. Es mi descanso.', 'Ehi! Il sabato e la domenica vengo a pescare qui. È il mio riposo.', 'Salut ! Le samedi et le dimanche, je viens pêcher ici. C’est mon repos.'],
    'Hoje é fim de semana, o mercado fica com o meu pai. Descansa e volta segunda!': ["It's the weekend, my dad takes care of the market. Rest and come back Monday!", 'Hoy es fin de semana, el mercado se queda con mi papá. ¡Descansa y vuelve el lunes!', 'Oggi è fine settimana, il mercato lo tiene mio padre. Riposati e torna lunedì!', 'C’est le week-end, c’est mon père qui tient la supérette. Repose-toi et reviens lundi !'],
    'O que você diz?': ['What do you say?', '¿Qué dices?', 'Cosa dici?', 'Que dis-tu ?'],
    'Me empresta uma varinha?': ['Can I borrow a rod?', '¿Me prestas una caña?', 'Mi presti una canna?', 'Tu me prêtes une canne ?'],
    'Só vim dar um oi!': ['Just came to say hi!', '¡Solo vine a saludar!', 'Sono passato solo a salutare!', 'Je suis juste venu dire bonjour !'],
    'Valeu! Aparece mais vezes. Sábado e domingo eu tô sempre aqui.': ['Thanks! Come by more often. I’m always here on Saturdays and Sundays.', '¡Gracias! Ven más seguido. Sábados y domingos siempre estoy aquí.', 'Grazie! Passa più spesso. Il sabato e la domenica sono sempre qui.', 'Merci ! Passe plus souvent. Le samedi et le dimanche, je suis toujours là.'],
    'Claro! Tenho uma de bambu sobrando. Pode ficar com ela, sério.': ['Sure! I’ve got a spare bamboo one. You can keep it, really.', '¡Claro! Tengo una de bambú de sobra. Quédatela, en serio.', 'Certo! Ne ho una di bambù in più. Tienila pure, davvero.', 'Bien sûr ! J’en ai une en bambou en trop. Tu peux la garder, vraiment.'],
    'Toma também umas minhocas e essa caixa de isopor pra guardar os peixes. Cabem uns 30.': ['Here are some worms too, and this cooler to keep your fish. It holds about 30.', 'Toma también unas lombrices y esta caja térmica para guardar los peces. Caben unos 30.', 'Prendi anche dei lombrichi e questa ghiacciaia per tenere i pesci. Ne entrano circa 30.', 'Tiens aussi des vers et cette glacière pour garder les poissons. Elle en contient une trentaine.'],
    'Você ganhou: vara de bambu, 10 minhocas e a caixa de isopor!': ['You got: bamboo rod, 10 worms and the cooler!', '¡Recibiste: caña de bambú, 10 lombrices y la caja térmica!', 'Hai ricevuto: canna di bambù, 10 lombrichi e la ghiacciaia!', 'Tu as reçu : canne en bambou, 10 vers et la glacière !'],
    'Se acabar a isca, o seu Bené vende lá na casinha. Ele também compra os peixes.': ['If you run out of bait, Mr. Bené sells it at the shack. He also buys the fish.', 'Si se te acaba la carnada, don Bené vende en la casita. También compra los peces.', 'Se finisci l’esca, il signor Bené la vende nella casetta. Compra anche i pesci.', 'Si tu n’as plus d’appâts, M. Bené en vend à la cabane. Il achète aussi les poissons.'],
    'Tá sem isca? Toma umas minhocas, por minha conta.': ['Out of bait? Here are some worms, on me.', '¿Sin carnada? Toma unas lombrices, invito yo.', 'Senza esca? Prendi dei lombrichi, offro io.', 'Plus d’appâts ? Tiens, des vers, c’est cadeau.'],
    '+5 minhocas': ['+5 worms', '+5 lombrices', '+5 lombrichi', '+5 vers'],
    'Já tem vara, é? Então leva essa de bambu também, de lembrança!': ['You already have a rod, huh? Then take this bamboo one too, as a keepsake!', '¿Ya tienes caña, eh? ¡Entonces llévate esta de bambú también, de recuerdo!', 'Hai già una canna, eh? Allora prendi anche questa di bambù, per ricordo!', 'Tu as déjà une canne, hein ? Alors prends aussi celle en bambou, en souvenir !'],
    'Você quer pescar agora?': ['Do you want to fish now?', '¿Quieres pescar ahora?', 'Vuoi pescare adesso?', 'Tu veux pêcher maintenant ?'],
    'Sim': ['Yes', 'Sí', 'Sì', 'Oui'],
    'Conversar': ['Chat', 'Charlar', 'Chiacchierare', 'Discuter'],
    'Agora não': ['Not now', 'Ahora no', 'Non ora', 'Pas maintenant'],
    'Você já pescou {0} tipos de peixe! Tá ficando craque.': ['You’ve already caught {0} kinds of fish! You’re getting good at this.', '¡Ya pescaste {0} tipos de peces! Te estás volviendo un crack.', 'Hai già pescato {0} tipi di pesce! Stai diventando bravissimo.', 'Tu as déjà pêché {0} sortes de poissons ! Tu deviens un as.'],
    'Beleza! Quando quiser, é só chegar.': ['Alright! Whenever you want, just come by.', '¡Dale! Cuando quieras, solo ven.', 'Va bene! Quando vuoi, basta venire.', 'D’accord ! Quand tu veux, tu viens.'],
    'Bora! Fica ali na ponta do píer, do meu lado.': ['Let’s go! Stand there at the end of the pier, next to me.', '¡Vamos! Ponte ahí en la punta del muelle, a mi lado.', 'Andiamo! Mettiti in fondo al pontile, accanto a me.', 'C’est parti ! Mets-toi au bout du ponton, à côté de moi.'],
    'Opa! Eu sou o Bené. Moro nessa casinha faz trinta anos.': ['Hey there! I’m Bené. I’ve lived in this shack for thirty years.', '¡Hola! Soy Bené. Vivo en esta casita hace treinta años.', 'Ehi! Sono Bené. Vivo in questa casetta da trent’anni.', 'Salut ! Moi, c’est Bené. J’habite cette cabane depuis trente ans.'],
    'Vendo isca e vara, e compro todo peixe que você pescar aqui no lago.': ['I sell bait and rods, and I buy every fish you catch here in the lake.', 'Vendo carnada y cañas, y compro todo pez que pesques aquí en el lago.', 'Vendo esche e canne, e compro ogni pesce che peschi qui nel lago.', 'Je vends des appâts et des cannes, et j’achète tous les poissons que tu pêches dans le lac.'],
    'E naquele quadro da parede eu anoto cada peixe que aparece. São sessenta tipos, acredita?': ['And on that board on the wall I note down every fish that shows up. Sixty kinds, can you believe it?', 'Y en ese cuadro de la pared anoto cada pez que aparece. Son sesenta tipos, ¿lo puedes creer?', 'E su quella bacheca al muro annoto ogni pesce che compare. Sono sessanta tipi, ci credi?', 'Et sur ce tableau au mur, je note chaque poisson qui apparaît. Soixante sortes, tu le crois ?'],
    'Tá sem vara? O Cadu, filho do seu Raimundo do mercado, pesca aqui sábado e domingo. Ele sempre empresta uma. Ou compra aqui comigo, ué!': ['No rod? Cadu, Mr. Raimundo’s son from the market, fishes here on Saturdays and Sundays. He always lends one. Or buy one from me, of course!', '¿Sin caña? Cadu, el hijo de don Raimundo del mercado, pesca aquí sábados y domingos. Siempre presta una. ¡O cómprala aquí conmigo!', 'Senza canna? Cadu, il figlio del signor Raimundo del mercato, pesca qui il sabato e la domenica. Ne presta sempre una. Oppure comprala da me!', 'Pas de canne ? Cadu, le fils de M. Raimundo de la supérette, pêche ici le samedi et le dimanche. Il en prête toujours une. Ou achète-la chez moi, pardi !'],
    'Fechar': ['Close', 'Cerrar', 'Chiudi', 'Fermer'],
    'Loja do seu Bené': ['Mr. Bené’s shop', 'Tienda de don Bené', 'Negozio del signor Bené', 'Boutique de M. Bené'],
    'Iscas': ['Bait', 'Carnadas', 'Esche', 'Appâts'],
    'Varas': ['Rods', 'Cañas', 'Canne', 'Cannes'],
    'Vender ({0})': ['Sell ({0})', 'Vender ({0})', 'Vendi ({0})', 'Vendre ({0})'],
    'Catálogo': ['Catalog', 'Catálogo', 'Catalogo', 'Catalogue'],
    '{0} fakes cada': ['{0} fakes each', '{0} fakes cada una', '{0} fakes l’una', '{0} fakes l’unité'],
    'em uso': ['in use', 'en uso', 'in uso', 'utilisé'],
    'Usar': ['Use', 'Usar', 'Usa', 'Utiliser'],
    'Alcance {0} m': ['Range {0} m', 'Alcance {0} m', 'Gittata {0} m', 'Portée {0} m'],
    'Resistência': ['Strength', 'Resistencia', 'Resistenza', 'Résistance'],
    'Peixes raros': ['Rare fish', 'Peces raros', 'Pesci rari', 'Poissons rares'],
    'Em uso': ['In use', 'En uso', 'In uso', 'Utilisée'],
    'Presente do Cadu': ['Gift from Cadu', 'Regalo de Cadu', 'Regalo di Cadu', 'Cadeau de Cadu'],
    'Comprar ({0})': ['Buy ({0})', 'Comprar ({0})', 'Compra ({0})', 'Acheter ({0})'],
    'A caixa está vazia. Vá pescar!': ['The cooler is empty. Go fishing!', 'La caja está vacía. ¡Ve a pescar!', 'La ghiacciaia è vuota. Vai a pescare!', 'La glacière est vide. Va pêcher !'],
    'Você ainda não tem peixes para vender.': ['You don’t have any fish to sell yet.', 'Todavía no tienes peces para vender.', 'Non hai ancora pesci da vendere.', 'Tu n’as pas encore de poissons à vendre.'],
    'Vender tudo ({0} fakes)': ['Sell all ({0} fakes)', 'Vender todo ({0} fakes)', 'Vendi tutto ({0} fakes)', 'Tout vendre ({0} fakes)'],
    'Sem dinheiro suficiente.': ['Not enough money.', 'No te alcanza el dinero.', 'Soldi insufficienti.', 'Pas assez d’argent.'],
    'Tá aqui: {0} × {1}. Boa pescaria!': ['Here you go: {0} × {1}. Good fishing!', 'Aquí tienes: {0} × {1}. ¡Buena pesca!', 'Ecco qua: {0} × {1}. Buona pesca!', 'Voilà : {0} × {1}. Bonne pêche !'],
    'Taí a sua primeira vara! Leva essa caixa de isopor também, cabem 30 peixes.': ['There’s your first rod! Take this cooler too, it holds 30 fish.', '¡Ahí está tu primera caña! Llévate también esta caja térmica, caben 30 peces.', 'Ecco la tua prima canna! Prendi anche questa ghiacciaia, ci stanno 30 pesci.', 'Voilà ta première canne ! Prends aussi cette glacière, elle contient 30 poissons.'],
    'A de titânio! Com essa você segura até pirarucu, rapaz.': ['The titanium one! With this you can hold even an arapaima, my friend.', '¡La de titanio! Con esta aguantas hasta un paiche, muchacho.', 'Quella di titanio! Con questa tieni pure un arapaima, ragazzo.', 'Celle en titane ! Avec ça, tu tiens même un arapaïma, mon gars.'],
    'Vara nova! Agora é só escolher a isca certa.': ['New rod! Now just pick the right bait.', '¡Caña nueva! Ahora solo elige la carnada correcta.', 'Canna nuova! Ora basta scegliere l’esca giusta.', 'Nouvelle canne ! Il ne reste qu’à choisir le bon appât.'],
    'Rapaz! Faz anos que eu não vejo um desses! Vou contar pra cidade inteira.': ['Wow! I haven’t seen one of these in years! I’m telling the whole town.', '¡Muchacho! ¡Hace años que no veo uno de estos! Se lo voy a contar a todo el pueblo.', 'Ragazzo! Sono anni che non ne vedo uno! Lo racconterò a tutta la città.', 'Mon gars ! Ça fait des années que je n’en ai pas vu un ! Je vais le dire à toute la ville.'],
    'Que peixão! Esse é dos bons.': ['What a fish! That’s a great one.', '¡Qué pescado! Este es de los buenos.', 'Che pescione! Questo è dei migliori.', 'Quel poisson ! Un des meilleurs.'],
    'Peixe bom! Tá aqui o seu dinheiro.': ['Good fish! Here’s your money.', '¡Buen pescado! Aquí está tu dinero.', 'Bel pesce! Ecco i tuoi soldi.', 'Beau poisson ! Voilà ton argent.'],
    'Todos': ['All', 'Todos', 'Tutti', 'Tous'],
    'Nenhum peixe desta raridade ainda.': ['No fish of this rarity yet.', 'Aún ningún pez de esta rareza.', 'Ancora nessun pesce di questa rarità.', 'Aucun poisson de cette rareté pour l’instant.'],
    'Os dados de cada peixe aparecem depois que você pescar ele pela primeira vez.': ['Each fish’s details appear after you catch it for the first time.', 'Los datos de cada pez aparecen después de pescarlo por primera vez.', 'I dati di ogni pesce compaiono dopo averlo pescato la prima volta.', 'Les infos de chaque poisson apparaissent après l’avoir pêché une première fois.'],
    'Voltar': ['Back', 'Volver', 'Indietro', 'Retour'],
    'Nome': ['Name', 'Nombre', 'Nome', 'Nom'],
    'Dica': ['Hint', 'Pista', 'Indizio', 'Astuce'],
    'Pesque este peixe para descobrir.': ['Catch this fish to find out.', 'Pesca este pez para descubrirlo.', 'Pesca questo pesce per scoprirlo.', 'Pêche ce poisson pour le découvrir.'],
    'Raridade': ['Rarity', 'Rareza', 'Rarità', 'Rareté'],
    'Origem': ['Origin', 'Origen', 'Origine', 'Origine'],
    'Horário': ['Time of day', 'Horario', 'Orario', 'Horaire'],
    'Isca favorita': ['Favorite bait', 'Carnada favorita', 'Esca preferita', 'Appât préféré'],
    'Vara adequada': ['Right rod', 'Caña adecuada', 'Canna adatta', 'Canne adaptée'],
    'Peso': ['Weight', 'Peso', 'Peso', 'Poids'],
    'magro': ['thin', 'flaco', 'magro', 'maigre'],
    'até {0}': ['up to {0}', 'hasta {0}', 'fino a {0}', 'jusqu’à {0}'],
    'pesado': ['heavy', 'pesado', 'pesante', 'lourd'],
    'acima de {0}': ['over {0}', 'más de {0}', 'oltre {0}', 'plus de {0}'],
    'Recorde': ['Record', 'Récord', 'Record', 'Record'],
    'Pescados': ['Caught', 'Pescados', 'Pescati', 'Pêchés'],
    'Valor': ['Value', 'Valor', 'Valore', 'Valeur'],
    'Caixa de peixes': ['Fish cooler', 'Caja de peces', 'Ghiacciaia dei pesci', 'Glacière à poissons'],
    'A caixa está vazia.': ['The cooler is empty.', 'La caja está vacía.', 'La ghiacciaia è vuota.', 'La glacière est vide.'],
    'vale {0} fakes': ['worth {0} fakes', 'vale {0} fakes', 'vale {0} fakes', 'vaut {0} fakes'],
    'Soltar': ['Release', 'Soltar', 'Libera', 'Relâcher'],
    'O peixe voltou para o lago.': ['The fish went back to the lake.', 'El pez volvió al lago.', 'Il pesce è tornato nel lago.', 'Le poisson est retourné dans le lac.'],
    'Venda os peixes na casinha do seu Bené.': ['Sell your fish at Mr. Bené’s shack.', 'Vende los peces en la casita de don Bené.', 'Vendi i pesci nella casetta del signor Bené.', 'Vends les poissons à la cabane de M. Bené.'],
    'Escolha a isca': ['Choose the bait', 'Elige la carnada', 'Scegli l’esca', 'Choisis l’appât'],
    'Você está sem isca. Compre na casinha do seu Bené.': ['You’re out of bait. Buy some at Mr. Bené’s shack.', 'No tienes carnada. Compra en la casita de don Bené.', 'Sei senza esca. Comprala nella casetta del signor Bené.', 'Tu n’as plus d’appâts. Achètes-en à la cabane de M. Bené.'],
    'Escolha a vara': ['Choose the rod', 'Elige la caña', 'Scegli la canna', 'Choisis la canne'],
    'Estou sem isca... O seu Bené vende lá na casinha.': ['I’m out of bait... Mr. Bené sells it at the shack.', 'No tengo carnada... Don Bené vende en la casita.', 'Sono senza esca... Il signor Bené la vende nella casetta.', 'Je n’ai plus d’appâts... M. Bené en vend à la cabane.'],
    'Boa pescaria!': ['Good fishing!', '¡Buena pesca!', 'Buona pesca!', 'Bonne pêche !'],
    'Valeu pela companhia!': ['Thanks for the company!', '¡Gracias por la compañía!', 'Grazie per la compagnia!', 'Merci pour la compagnie !'],
    'Sair': ['Leave', 'Salir', 'Esci', 'Sortir'],
    'Fôlego do peixe': ['Fish stamina', 'Aliento del pez', 'Fiato del pesce', 'Endurance du poisson'],
    'TENSÃO': ['TENSION', 'TENSIÓN', 'TENSIONE', 'TENSION'],
    'Sem isca! Compre na casinha do seu Bené.': ['No bait! Buy some at Mr. Bené’s shack.', '¡Sin carnada! Compra en la casita de don Bené.', 'Niente esca! Comprala nella casetta del signor Bené.', 'Plus d’appâts ! Achètes-en à la cabane de M. Bené.'],
    'Água funda': ['Deep water', 'Agua profunda', 'Acqua profonda', 'Eau profonde'],
    'Água média': ['Medium water', 'Agua media', 'Acqua media', 'Eau moyenne'],
    'Água rasa': ['Shallow water', 'Agua baja', 'Acqua bassa', 'Eau peu profonde'],
    'Beliscou...': ['A nibble...', 'Picó...', 'Un assaggio...', 'Ça mordille...'],
    'FISGA!': ['STRIKE!', '¡CLAVA!', 'FERRA!', 'FERRE !'],
    'Puxou cedo! O peixe se assustou.': ['Too early! The fish got scared.', '¡Tiraste antes! El pez se asustó.', 'Troppo presto! Il pesce si è spaventato.', 'Trop tôt ! Le poisson a pris peur.'],
    'Fisgou!': ['Hooked!', '¡Enganchado!', 'Ferrato!', 'Ferré !'],
    'Levou um choque!': ['You got shocked!', '¡Te dio un choque!', 'Hai preso la scossa!', 'Tu as pris une décharge !'],
    'A linha arrebentou!': ['The line snapped!', '¡Se rompió la línea!', 'La lenza si è spezzata!', 'La ligne a cassé !'],
    'O peixe se soltou do anzol...': ['The fish slipped off the hook...', 'El pez se soltó del anzuelo...', 'Il pesce si è sganciato dall’amo...', 'Le poisson s’est décroché de l’hameçon...'],
    'Acabou a linha! O peixe levou tudo.': ['Out of line! The fish took it all.', '¡Se acabó la línea! El pez se llevó todo.', 'Lenza finita! Il pesce si è portato via tutto.', 'Plus de fil ! Le poisson a tout emporté.'],
    'Arrebentou? Solta a linha quando ele correr!': ['Snapped? Let the line out when it runs!', '¿Se rompió? ¡Suelta la línea cuando corra!', 'Spezzata? Molla la lenza quando scappa!', 'Cassé ? Lâche du fil quand il file !'],
    'Ih, escapou! Faz parte.': ['Oops, it got away! It happens.', '¡Uy, se escapó! Pasa.', 'Ops, è scappato! Capita.', 'Oups, il s’est échappé ! Ça arrive.'],
    'Vale {0} fakes': ['Worth {0} fakes', 'Vale {0} fakes', 'Vale {0} fakes', 'Vaut {0} fakes'],
    'NOVO NO CATÁLOGO!': ['NEW IN THE CATALOG!', '¡NUEVO EN EL CATÁLOGO!', 'NUOVO NEL CATALOGO!', 'NOUVEAU DANS LE CATALOGUE !'],
    'NOVO RECORDE!': ['NEW RECORD!', '¡NUEVO RÉCORD!', 'NUOVO RECORD!', 'NOUVEAU RECORD !'],
    'Primeira vez que eu pego esse peixe! Vou mostrar pro seu Bené.': ['First time I catch this fish! I’m showing it to Mr. Bené.', '¡Primera vez que pesco este pez! Se lo voy a mostrar a don Bené.', 'È la prima volta che prendo questo pesce! Lo mostro al signor Bené.', 'C’est la première fois que je pêche ce poisson ! Je vais le montrer à M. Bené.'],
    'Soltar este peixe': ['Release this fish', 'Soltar este pez', 'Libera questo pesce', 'Relâcher ce poisson'],
    'Soltar o mais barato da caixa ({0}) e guardar este': ['Release the cheapest one in the cooler ({0}) and keep this one', 'Soltar el más barato de la caja ({0}) y guardar este', 'Liberare il più economico della ghiacciaia ({0}) e tenere questo', 'Relâcher le moins cher de la glacière ({0}) et garder celui-ci'],
    'A caixa está cheia ({0}/{1}). O que fazer?': ['The cooler is full ({0}/{1}). What now?', 'La caja está llena ({0}/{1}). ¿Qué hago?', 'La ghiacciaia è piena ({0}/{1}). Che faccio?', 'La glacière est pleine ({0}/{1}). Que faire ?'],
    'Guardado na caixa ({0}/{1})': ['Stored in the cooler ({0}/{1})', 'Guardado en la caja ({0}/{1})', 'Messo nella ghiacciaia ({0}/{1})', 'Rangé dans la glacière ({0}/{1})'],
    'Já tá tarde... melhor ir pra casa.': ['It’s late... better head home.', 'Ya es tarde... mejor me voy a casa.', 'È tardi... meglio tornare a casa.', 'Il est tard... mieux vaut rentrer.'],
    'O peixe comeu a isca e fugiu...': ['The fish ate the bait and got away...', 'El pez se comió la carnada y se fue...', 'Il pesce ha mangiato l’esca ed è fuggito...', 'Le poisson a mangé l’appât et s’est enfui...'],
    'Caixa {0}/{1}': ['Cooler {0}/{1}', 'Caja {0}/{1}', 'Ghiacciaia {0}/{1}', 'Glacière {0}/{1}'],
    'LANÇAR': ['CAST', 'LANZAR', 'LANCIA', 'LANCER'],
    'SEM ISCA': ['NO BAIT', 'SIN CARNADA', 'NIENTE ESCA', 'PAS D’APPÂT'],
    'SOLTE!': ['RELEASE!', '¡SUELTA!', 'MOLLA!', 'LÂCHE !'],
    'RECOLHER': ['REEL IN', 'RECOGER', 'RECUPERA', 'RAMENER'],
    'FISGAR!': ['STRIKE!', '¡CLAVAR!', 'FERRA!', 'FERRER !'],
    'PUXAR': ['PULL', 'TIRAR', 'TIRA', 'TIRER'],
    'Distância {0} m': ['Distance {0} m', 'Distancia {0} m', 'Distanza {0} m', 'Distance {0} m'],
    'Mire com ◀ ▶ e segure LANÇAR. Solte na faixa verde!': ['Aim with ◀ ▶ and hold CAST. Release in the green zone!', 'Apunta con ◀ ▶ y mantén LANZAR. ¡Suelta en la franja verde!', 'Mira con ◀ ▶ e tieni premuto LANCIA. Molla nella fascia verde!', 'Vise avec ◀ ▶ et maintiens LANCER. Lâche dans la zone verte !'],
    'Espere a boia afundar. Se ela só tremer, não puxe!': ['Wait for the bobber to sink. If it only twitches, don’t pull!', 'Espera a que el corcho se hunda. Si solo tiembla, ¡no tires!', 'Aspetta che il galleggiante affondi. Se trema soltanto, non tirare!', 'Attends que le bouchon coule. S’il tremble seulement, ne tire pas !'],
    'Linha frouxa! Segure PUXAR!': ['Slack line! Hold PULL!', '¡Línea floja! ¡Mantén TIRAR!', 'Lenza molle! Tieni premuto TIRA!', 'Ligne molle ! Maintiens TIRER !'],
    "A isca caiu fora d'água!": ['The bait landed out of the water!', '¡La carnada cayó fuera del agua!', 'L’esca è caduta fuori dall’acqua!', 'L’appât est tombé hors de l’eau !'],
    'Isca boa faz o peixe morder mais rápido. Mas os grandões não se impressionam fácil, não.': ['Good bait makes fish bite faster. But the big ones aren’t easily impressed.', 'Una buena carnada hace que el pez muerda más rápido. Pero los grandes no se impresionan fácil.', 'Un’esca buona fa abboccare prima il pesce. Ma i pezzi grossi non si fanno impressionare facilmente.', 'Un bon appât fait mordre le poisson plus vite. Mais les gros ne se laissent pas impressionner facilement.'],
    'Se a boia só tremer, espera! Fisga quando ela afundar de vez.': ['If the bobber only twitches, wait! Strike when it goes all the way under.', 'Si el corcho solo tiembla, ¡espera! Clava cuando se hunda del todo.', 'Se il galleggiante trema soltanto, aspetta! Ferra quando affonda del tutto.', 'Si le bouchon tremble seulement, attends ! Ferre quand il coule pour de bon.'],
    'Quando o peixe correr, solta a linha. Se segurar, arrebenta!': ['When the fish runs, let the line out. If you hold on, it snaps!', 'Cuando el pez corra, suelta la línea. ¡Si aguantas, se rompe!', 'Quando il pesce scappa, molla la lenza. Se tieni, si spezza!', 'Quand le poisson file, lâche du fil. Si tu tiens, ça casse !'],
    'Mas não deixa a linha frouxa demais, senão ele cospe o anzol.': ['But don’t leave the line too slack, or it spits out the hook.', 'Pero no dejes la línea muy floja, o escupe el anzuelo.', 'Ma non lasciare la lenza troppo molle, sennò sputa l’amo.', 'Mais ne laisse pas la ligne trop molle, sinon il recrache l’hameçon.'],
    'Cada peixe tem a sua hora. De noite aparecem os bagres grandes, mas não vai ficar acordado até tarde, hein.': ['Every fish has its time. The big catfish come out at night, but don’t stay up too late, okay?', 'Cada pez tiene su hora. De noche aparecen los bagres grandes, pero no te quedes despierto hasta tarde, ¿eh?', 'Ogni pesce ha la sua ora. Di notte escono i pesci gatto grossi, ma non fare troppo tardi, eh.', 'Chaque poisson a son heure. La nuit, les gros poissons-chats sortent, mais ne veille pas trop tard, hein.'],
    'O seu Bené anota todo peixe que a gente pega naquele quadro da casinha.': ['Mr. Bené writes down every fish we catch on that board at the shack.', 'Don Bené anota cada pez que pescamos en ese cuadro de la casita.', 'Il signor Bené annota ogni pesce che prendiamo su quella bacheca della casetta.', 'M. Bené note chaque poisson qu’on pêche sur le tableau de la cabane.'],
    'Dizem que tem um pirarucu nesse lago. Só com vara muito boa pra segurar um bicho desses.': ['They say there’s an arapaima in this lake. You’d need a really good rod to hold a beast like that.', 'Dicen que hay un paiche en este lago. Solo con una caña muy buena aguantas un bicho así.', 'Dicono che in questo lago ci sia un arapaima. Serve una canna davvero buona per tenere una bestia così.', 'On dit qu’il y a un arapaïma dans ce lac. Il faut une très bonne canne pour tenir une bête pareille.'],
    '{0}! Tá magrinho, coitado... mas vale!': ['{0}! It’s a skinny one, poor thing... but it counts!', '¡{0}! Está flaquito, pobre... ¡pero vale!', '{0}! È magrolino, poverino... ma vale!', '{0} ! Il est tout maigre, le pauvre... mais ça compte !'],
    'Peguei! {0}!': ['Got it! {0}!', '¡Lo pesqué! ¡{0}!', 'Preso! {0}!', 'Je l’ai ! {0} !'],
    '{0}! E esse tá gordinho, hein!': ['{0}! And this one’s nice and chunky!', '¡{0}! ¡Y este está gordito, eh!', '{0}! E questo è bello paffuto!', '{0} ! Et celui-là est bien dodu !'],
    '{0}! Meio magrinho, mas não é qualquer peixe!': ['{0}! A bit skinny, but it’s not just any fish!', '¡{0}! Algo flaquito, ¡pero no es cualquier pez!', '{0}! Un po’ magrolino, ma non è un pesce qualunque!', '{0} ! Un peu maigre, mais ce n’est pas n’importe quel poisson !'],
    'Olha só: {0}! Não é todo dia que aparece!': ['Look at that: {0}! You don’t see that every day!', 'Mira nomás: ¡{0}! ¡No aparece todos los días!', 'Guarda un po’: {0}! Non capita tutti i giorni!', 'Regarde-moi ça : {0} ! On n’en voit pas tous les jours !'],
    '{0}! Que peixe pesado, que beleza!': ['{0}! What a heavy fish, beautiful!', '¡{0}! ¡Qué pez pesado, qué belleza!', '{0}! Che pesce pesante, che bellezza!', '{0} ! Quel poisson lourd, quelle beauté !'],
    '{0}?! Magrinho, mas é raro!': ['{0}?! Skinny, but it’s rare!', '¿¡{0}!? Flaquito, ¡pero es raro!', '{0}?! Magrolino, ma è raro!', '{0} ?! Maigre, mais il est rare !'],
    'Não acredito! {0}! Esse é raro!': ['I can’t believe it! {0}! This one’s rare!', '¡No lo puedo creer! ¡{0}! ¡Este es raro!', 'Non ci credo! {0}! Questo è raro!', 'Je n’y crois pas ! {0} ! Il est rare, celui-là !'],
    '{0}! Enorme! Que peixe raro!': ['{0}! Huge! What a rare fish!', '¡{0}! ¡Enorme! ¡Qué pez tan raro!', '{0}! Enorme! Che pesce raro!', '{0} ! Énorme ! Quel poisson rare !'],
    '{0}?! Tá magro, mas é um peixe épico!': ['{0}?! It’s thin, but it’s an epic fish!', '¿¡{0}!? Está flaco, ¡pero es un pez épico!', '{0}?! È magro, ma è un pesce epico!', '{0} ?! Il est maigre, mais c’est un poisson épique !'],
    'UAU! {0}! Que peixe incrível!': ['WOW! {0}! What an amazing fish!', '¡GUAU! ¡{0}! ¡Qué pez increíble!', 'WOW! {0}! Che pesce incredibile!', 'WAOUH ! {0} ! Quel poisson incroyable !'],
    'Meu Deus! {0} gigante!! Ninguém vai acreditar!': ['Oh my God! A giant {0}!! Nobody’s going to believe this!', '¡Dios mío! ¡¡{0} gigante!! ¡Nadie lo va a creer!', 'Mio Dio! {0} gigante!! Nessuno ci crederà!', 'Mon Dieu ! {0} géant !! Personne ne va me croire !'],
    '{0}... LENDÁRIO! Mesmo magrinho, é lendário!': ['{0}... LEGENDARY! Even skinny, it’s legendary!', '{0}... ¡LEGENDARIO! ¡Aunque flaquito, es legendario!', '{0}... LEGGENDARIO! Anche magrolino, è leggendario!', '{0}... LÉGENDAIRE ! Même maigre, il est légendaire !'],
    'Isso é... {0}! UM PEIXE LENDÁRIO!': ['This is... {0}! A LEGENDARY FISH!', 'Esto es... ¡{0}! ¡UN PEZ LEGENDARIO!', 'Questo è... {0}! UN PESCE LEGGENDARIO!', 'C’est... {0} ! UN POISSON LÉGENDAIRE !'],
    '{0} GIGANTE!!! Isso é história pra contar pro resto da vida!': ['A GIANT {0}!!! That’s a story for the rest of my life!', '¡¡¡{0} GIGANTE!!! ¡Esto es para contarlo toda la vida!', '{0} GIGANTE!!! Questa è una storia da raccontare per tutta la vita!', '{0} GÉANT !!! C’est une histoire à raconter toute ma vie !'],
    'Haha, esse é pequeno, mas conta!': ['Haha, that one’s small, but it counts!', 'Jaja, este es chiquito, ¡pero cuenta!', 'Haha, questo è piccolo, ma conta!', 'Haha, il est petit, mais ça compte !'],
    'Boa! Esse dá pra fritar.': ['Nice! That one’s good for frying.', '¡Bien! Ese sirve para freír.', 'Bello! Questo è da friggere.', 'Bien joué ! Celui-là, il est bon à frire.'],
    'Opa, esse tá bem servido!': ['Whoa, that one’s a hefty one!', '¡Epa, ese está bien servido!', 'Oh, questo è bello grosso!', 'Oh, celui-là est bien costaud !'],
    'Olha só! Mandou bem!': ['Look at that! Nice one!', '¡Mira nomás! ¡Bien hecho!', 'Guarda un po’! Ben fatto!', 'Regarde ça ! Bien joué !'],
    'Boa! Esse não aparece toda hora.': ['Nice! You don’t see those all the time.', '¡Bien! Ese no aparece todo el tiempo.', 'Bello! Questo non capita spesso.', 'Bien ! On n’en voit pas tout le temps.'],
    'Que bicho bonito! Mandou bem demais!': ['What a beautiful fish! You nailed it!', '¡Qué bicho tan lindo! ¡Lo hiciste genial!', 'Che bestia bellissima! Bravissimo!', 'Quelle belle bête ! Super bien joué !'],
    'Caramba! Esse é raro, hein!': ['Wow! That one’s rare!', '¡Caramba! ¡Ese es raro, eh!', 'Caspita! Questo è raro, eh!', 'Ouah ! Celui-là est rare, hein !'],
    'Que peixão! Esse é raro e ainda é grande!': ['What a fish! Rare and big too!', '¡Qué pescado! ¡Es raro y además grande!', 'Che pescione! È raro e pure grosso!', 'Quel poisson ! Rare, et gros en plus !'],
    'NÃO ACREDITO! Faz anos que eu tento pegar um desses!': ['NO WAY! I’ve been trying to catch one of those for years!', '¡NO LO PUEDO CREER! ¡Hace años que intento pescar uno de esos!', 'NON CI CREDO! Sono anni che provo a prenderne uno!', 'C’EST PAS VRAI ! Ça fait des années que j’essaie d’en attraper un !'],
    'Rapaz! Isso é um troféu! Tira uma foto!': ['Man! That’s a trophy! Take a picture!', '¡Muchacho! ¡Eso es un trofeo! ¡Sácale una foto!', 'Ragazzo! È un trofeo! Fai una foto!', 'Mon gars ! C’est un trophée ! Prends une photo !'],
    'Eu... eu tô sonhando? Um peixe lendário na minha frente!': ['Am... am I dreaming? A legendary fish right in front of me!', 'Yo... ¿estoy soñando? ¡Un pez legendario frente a mí!', 'Sto... sto sognando? Un pesce leggendario davanti a me!', 'Je... je rêve ? Un poisson légendaire devant moi !'],
    'Ninguém vai acreditar quando eu contar! LENDÁRIO!': ['Nobody will believe it when I tell them! LEGENDARY!', '¡Nadie me va a creer cuando lo cuente! ¡LEGENDARIO!', 'Nessuno ci crederà quando lo racconterò! LEGGENDARIO!', 'Personne ne me croira quand je le raconterai ! LÉGENDAIRE !'],
    'E aí, vai querer o quê hoje?': ['So, what’ll it be today?', 'Bueno, ¿qué vas a querer hoy?', 'Allora, cosa ti serve oggi?', 'Alors, qu’est-ce que ce sera aujourd’hui ?'],
    'Opa! Que bom te ver!': ['Hey! Good to see you!', '¡Hola! ¡Qué bueno verte!', 'Ehi! Che bello vederti!', 'Salut ! Content de te voir !'],
    'Fala! O lago tá bom hoje.': ['Hey! The lake’s good today.', '¡Qué tal! El lago está bueno hoy.', 'Ciao! Il lago è buono oggi.', 'Salut ! Le lac est bon aujourd’hui.'],
    'Comum': ['Common', 'Común', 'Comune', 'Commun'],
    'Incomum': ['Uncommon', 'Poco común', 'Non comune', 'Peu commun'],
    'Raro': ['Rare', 'Raro', 'Raro', 'Rare'],
    'Épico': ['Epic', 'Épico', 'Epico', 'Épique'],
    'Lendário': ['Legendary', 'Legendario', 'Leggendario', 'Légendaire'],
    'comum': ['average', 'normal', 'nella media', 'moyen'],
    'Manhã (5h–11h)': ['Morning (5 AM–11 AM)', 'Mañana (5h–11h)', 'Mattina (5–11)', 'Matin (5 h–11 h)'],
    'Tarde (11h–17h)': ['Afternoon (11 AM–5 PM)', 'Tarde (11h–17h)', 'Pomeriggio (11–17)', 'Après-midi (11 h–17 h)'],
    'Entardecer (17h–20h)': ['Dusk (5 PM–8 PM)', 'Atardecer (17h–20h)', 'Tramonto (17–20)', 'Crépuscule (17 h–20 h)'],
    'Noite (20h–5h)': ['Night (8 PM–5 AM)', 'Noche (20h–5h)', 'Notte (20–5)', 'Nuit (20 h–5 h)'],
    'Amazônia': ['Amazon', 'Amazonía', 'Amazzonia', 'Amazonie'],
    'Pantanal': ['Pantanal', 'Pantanal', 'Pantanal', 'Pantanal'],
    'Rio São Francisco': ['São Francisco River', 'Río São Francisco', 'Fiume São Francisco', 'Fleuve São Francisco'],
    'Bacia do Paraná': ['Paraná Basin', 'Cuenca del Paraná', 'Bacino del Paraná', 'Bassin du Paraná'],
    'Rio Paraíba do Sul': ['Paraíba do Sul River', 'Río Paraíba do Sul', 'Fiume Paraíba do Sul', 'Fleuve Paraíba do Sul'],
    'Todo o Brasil': ['All of Brazil', 'Todo Brasil', 'Tutto il Brasile', 'Tout le Brésil'],
    'Minhoca': ['Earthworm', 'Lombriz', 'Lombrico', 'Ver de terre'],
    'Massinha': ['Dough bait', 'Masa', 'Pastella', 'Pâte'],
    'Milho': ['Sweet corn', 'Maíz', 'Mais', 'Maïs'],
    'Grilo': ['Cricket', 'Grillo', 'Grillo', 'Grillon'],
    'Camarão': ['Shrimp', 'Camarón', 'Gamberetto', 'Crevette'],
    'Frutinha da mata': ['Wild fruit', 'Fruta del monte', 'Frutto selvatico', 'Fruit sauvage'],
    'Tuvira viva': ['Live tuvira (knifefish)', 'Morenita viva (tuvira)', 'Tuvira viva', 'Tuvira vivante'],
    'Isca artificial': ['Artificial lure', 'Señuelo artificial', 'Esca artificiale', 'Leurre artificiel'],
    'Vara de bambu': ['Bamboo rod', 'Caña de bambú', 'Canna di bambù', 'Canne en bambou'],
    'Vara de fibra': ['Fiberglass rod', 'Caña de fibra', 'Canna in fibra', 'Canne en fibre'],
    'Vara de carbono': ['Carbon rod', 'Caña de carbono', 'Canna in carbonio', 'Canne en carbone'],
    'Vara com molinete': ['Rod and reel', 'Caña con carrete', 'Canna con mulinello', 'Canne à moulinet'],
    'Vara de titânio': ['Titanium rod', 'Caña de titanio', 'Canna in titanio', 'Canne en titane'],
    // (6.6.0) a nota do lançamento, o lançamento perfeito, a briga com a faixa boa, o tranquilo e as dicas novas do Cadu
    'Poço fundo': ['Deep pool', 'Pozo hondo', 'Pozza profonda', 'Fosse profonde'],
    'Nota {0}': ['Score {0}', 'Nota {0}', 'Voto {0}', 'Note {0}'],
    'Água rasa demais...': ['Way too shallow...', 'Agua demasiado baja...', 'Acqua troppo bassa...', 'Eau bien trop peu profonde...'],
    'Lançamento fraco': ['Weak cast', 'Lanzamiento flojo', 'Lancio debole', 'Lancer faible'],
    'Bom lançamento': ['Good cast', 'Buen lanzamiento', 'Buon lancio', 'Bon lancer'],
    'Ótimo lançamento!': ['Great cast!', '¡Gran lanzamiento!', 'Ottimo lancio!', 'Excellent lancer !'],
    'LANÇAMENTO PERFEITO!': ['PERFECT CAST!', '¡LANZAMIENTO PERFECTO!', 'LANCIO PERFETTO!', 'LANCER PARFAIT !'],
    'Toque para pular': ['Tap to skip', 'Toca para saltar', 'Tocca per saltare', 'Touchez pour passer'],
    'DISTÂNCIA': ['DISTANCE', 'DISTANCIA', 'DISTANZA', 'DISTANCE'],
    'Linha frouxa': ['Slack line', 'Línea floja', 'Lenza molle', 'Ligne molle'],
    'Linha esticada': ['Strained line', 'Línea tensa', 'Lenza tesa', 'Ligne tendue'],
    'Arraste para mirar. Segure LANÇAR: a barra é a distância. Mire nas manchas escuras (fundo)!': ['Drag to aim. Hold CAST: the bar is the distance. Aim for the dark patches (deep water)!', 'Arrastra para apuntar. Mantén LANZAR: la barra es la distancia. ¡Apunta a las manchas oscuras (hondo)!', 'Trascina per mirare. Tieni premuto LANCIA: la barra è la distanza. Mira alle chiazze scure (acqua profonda)!', 'Glisse pour viser. Maintiens LANCER : la barre est la distance. Vise les taches sombres (eau profonde) !'],
    'Solte na distância certa!': ['Release at the right distance!', '¡Suelta en la distancia justa!', 'Molla alla distanza giusta!', 'Lâche à la bonne distance !'],
    'O peixe está correndo! Solte a linha!': ['The fish is running! Let the line out!', '¡El pez está corriendo! ¡Suelta la línea!', 'Il pesce sta scappando! Molla la lenza!', 'Le poisson file ! Laisse filer la ligne !'],
    'Linha esticada demais! Solte!': ['Line too tight! Let go!', '¡Línea demasiado tensa! ¡Suelta!', 'Lenza troppo tesa! Molla!', 'Ligne trop tendue ! Lâche !'],
    'Mantenha a tensão na faixa verde.': ['Keep the tension in the green zone.', 'Mantén la tensión en la franja verde.', 'Tieni la tensione nella fascia verde.', 'Garde la tension dans la zone verte.'],
    'Pescar acalma a cabeça. Você está mais tranquilo hoje.': ['Fishing clears the mind. You feel calmer today.', 'Pescar calma la cabeza. Hoy estás más tranquilo.', 'Pescare rilassa la mente. Oggi sei più tranquillo.', 'Pêcher apaise l’esprit. Tu es plus serein aujourd’hui.'],
    'Tá vendo as manchas escuras na água? Ali é fundo. Isca bem no meio da mancha escura é peixe grande!': ['See the dark patches in the water? That’s the deep part. Bait right in the middle of a dark patch means big fish!', '¿Ves las manchas oscuras en el agua? Ahí es hondo. ¡Carnada justo en el medio de la mancha oscura es pez grande!', 'Vedi le chiazze scure nell’acqua? Lì è profondo. Esca proprio al centro della chiazza scura vuol dire pesce grosso!', 'Tu vois les taches sombres dans l’eau ? C’est profond. Un appât pile au milieu d’une tache sombre, c’est un gros poisson !'],
    'As partes clarinhas são banco de areia. Ali só dá peixinho.': ['The light parts are sandbars. Only tiny fish there.', 'Las partes claritas son bancos de arena. Ahí solo hay pececitos.', 'Le parti chiare sono banchi di sabbia. Lì ci sono solo pesciolini.', 'Les parties claires sont des bancs de sable. Il n’y a que du menu fretin.'],
    'Deixa a tensão na faixa verde. Peixe raro faz a faixa ficar andando, aí é que é difícil!': ['Keep the tension in the green zone. Rare fish make the zone move around, that’s the hard part!', 'Deja la tensión en la franja verde. Los peces raros hacen que la franja se mueva, ¡eso es lo difícil!', 'Tieni la tensione nella fascia verde. I pesci rari fanno muovere la fascia, ed è lì che è difficile!', 'Garde la tension dans la zone verte. Les poissons rares font bouger la zone, c’est ça le plus dur !'],
    // (6.6.1) soltar o peixe, a reação do Cadu e a cena secreta
    'O que fazer com o peixe?': ['What should I do with the fish?', '¿Qué hago con el pez?', 'Cosa faccio con il pesce?', 'Que faire du poisson ?'],
    'Guardar na caixa': ['Keep it in the cooler', 'Guardar en la caja', 'Metterlo nella cassetta', 'Le garder dans la glacière'],
    'Soltar no lago': ['Release it', 'Soltarlo en el lago', 'Rilasciarlo nel lago', 'Le relâcher'],
    'Tá magrinho... É melhor soltar pra ele engordar um pouco. Depois a gente pesca ele de novo!': ['He’s skinny... Better let him go so he can fatten up. We’ll catch him again later!', 'Está flaquito... Mejor soltarlo para que engorde un poco. ¡Después lo pescamos de nuevo!', 'È magrolino... Meglio liberarlo, così ingrassa un po’. Poi lo ripeschiamo!', 'Il est maigrichon... Mieux vaut le relâcher pour qu’il grossisse. On le repêchera plus tard !'],
    '{0} gordinho e raro... mas mesmo assim, vou soltar esse.': ['A chunky, rare {0}... but I’m letting this one go anyway.', '{0} gordito y raro... pero igual voy a soltar este.', '{0} bello grasso e raro... ma lo libero lo stesso.', '{0} bien dodu et rare... mais je le relâche quand même.'],
    'Tá gordinho... mas vou soltar esse mesmo. Vai, {0}!': ['He’s a chunky one... but I’m letting him go. Off you go, {0}!', 'Está gordito... pero voy a soltarlo igual. ¡Vete, {0}!', 'È bello grasso... ma lo libero lo stesso. Vai, {0}!', 'Il est bien dodu... mais je le relâche. Allez, {0} !'],
    'Volta pro lago, {0}! Cresce mais um pouco.': ['Back to the lake, {0}! Grow a little more.', '¡Vuelve al lago, {0}! Crece un poco más.', 'Torna nel lago, {0}! Cresci ancora un po’.', 'Retourne dans le lac, {0} ! Grandis encore un peu.'],
    'Um lendário... e mesmo assim eu vou soltar. O lago merece ele mais do que eu. Vai, {0}!': ['A legendary... and I’m still letting it go. The lake deserves it more than I do. Go, {0}!', 'Un legendario... y aun así lo voy a soltar. El lago lo merece más que yo. ¡Ve, {0}!', 'Un leggendario... e lo libero lo stesso. Il lago se lo merita più di me. Vai, {0}!', 'Un légendaire... et je le relâche quand même. Le lac le mérite plus que moi. Va, {0} !'],
    'Boa! Deixa ele crescer.': ['Nice! Let him grow.', '¡Bien! Déjalo crecer.', 'Bravo! Lascialo crescere.', 'Bien ! Laisse-le grandir.'],
    'Apesar de ser incomum de ver, é melhor mesmo. Ele volta maior.': ['Even though you don’t see those often, it’s the right call. He’ll come back bigger.', 'Aunque no se ve seguido, es mejor así. Vuelve más grande.', 'Anche se non se ne vedono spesso, è meglio così. Tornerà più grande.', 'Même si on n’en voit pas souvent, c’est mieux. Il reviendra plus gros.'],
    'Raro assim é difícil de largar... mas magrinho desse jeito, é melhor mesmo.': ['A rare one is hard to let go... but this skinny, it’s for the best.', 'Uno raro cuesta soltarlo... pero así de flaquito, es lo mejor.', 'Uno raro è difficile da lasciare... ma così magro, è meglio.', 'Un rare, c’est dur à relâcher... mais aussi maigre, c’est mieux.'],
    'Um épico magrinho... tá certo. Dói no coração, mas tá certo.': ['A skinny epic... you’re right. It hurts, but you’re right.', 'Un épico flaquito... tienes razón. Duele, pero tienes razón.', 'Un epico magrolino... hai ragione. Fa male, ma hai ragione.', 'Un épique maigrichon... tu as raison. Ça fait mal, mais tu as raison.'],
    'Eu não soltaria esse nem se viesse só o esqueleto! É quase impossível pescar um... mas tá, o peixe é seu.': ['I wouldn’t let that one go even if it were just the skeleton! It’s almost impossible to catch one... but fine, it’s your fish.', '¡Yo no soltaría ese ni aunque viniera solo el esqueleto! Es casi imposible pescar uno... pero bueno, el pez es tuyo.', 'Io non lo libererei nemmeno se fosse solo lo scheletro! È quasi impossibile pescarne uno... ma va bene, il pesce è tuo.', 'Je ne relâcherais pas celui-là même si ce n’était que le squelette ! C’est presque impossible d’en pêcher un... mais bon, c’est ton poisson.'],
    'Soltou? Tranquilo, desse tem de monte no lago.': ['Let it go? No worries, there are plenty of those in the lake.', '¿Lo soltaste? Tranquilo, de esos hay un montón.', 'L’hai liberato? Tranquillo, ce ne sono un sacco nel lago.', 'Tu l’as relâché ? Pas grave, il y en a plein dans le lac.'],
    'Ué, vai soltar? Esse não aparece toda hora, hein!': ['Wait, you’re letting it go? Those don’t show up every day!', '¿Eh, lo vas a soltar? ¡Ese no aparece todos los días!', 'Ehi, lo liberi? Quello non capita tutti i giorni!', 'Hein, tu le relâches ? On n’en voit pas tous les jours !'],
    'Peraí... você soltou um peixe RARO?! Assim, de boa?!': ['Hold on... you let a RARE fish go?! Just like that?!', 'Espera... ¿soltaste un pez RARO?! ¿¡Así, tranquilo?!', 'Aspetta... hai liberato un pesce RARO?! Così, tranquillo?!', 'Attends... tu as relâché un poisson RARE ?! Comme ça, tranquille ?!'],
    'NÃO! Um ÉPICO?! Você... soltou... um épico. Eu preciso sentar. Eu já tô sentado. Eu preciso sentar MAIS.': ['NO! An EPIC?! You... let... an epic go. I need to sit down. I’m already sitting. I need to sit down MORE.', '¡NO! ¿¡Un ÉPICO?! Tú... soltaste... un épico. Necesito sentarme. Ya estoy sentado. Necesito sentarme MÁS.', 'NO! Un EPICO?! Tu... hai liberato... un epico. Devo sedermi. Sono già seduto. Devo sedermi DI PIÙ.', 'NON ! Un ÉPIQUE ?! Tu... as relâché... un épique. Il faut que je m’assoie. Je suis déjà assis. Il faut que je m’assoie ENCORE PLUS.'],
    '...': ['...', '...', '...', '...'],
    'Espera. Você... SOLTOU... UM LENDÁRIO?!': ['Wait. You... RELEASED... A LEGENDARY?!', 'Espera. ¿Tú... SOLTASTE... UN LEGENDARIO?!', 'Aspetta. Tu... hai LIBERATO... UN LEGGENDARIO?!', 'Attends. Tu as... RELÂCHÉ... UN LÉGENDAIRE ?!'],
    'Sabe há quantos anos eu sento nesse píer esperando um desses?! ANOS!': ['Do you know how many years I’ve sat on this pier waiting for one of those?! YEARS!', '¿¡Sabes cuántos años llevo sentado en este muelle esperando uno de esos?! ¡AÑOS!', 'Sai da quanti anni mi siedo su questo pontile aspettandone uno?! ANNI!', 'Tu sais depuis combien d’années je m’assois sur ce ponton à en attendre un ?! DES ANNÉES !'],
    'EU VOU PULAR NESSE LAGO ATRÁS DELE!': ['I’M JUMPING IN THIS LAKE AFTER IT!', '¡ME VOY A TIRAR AL LAGO A BUSCARLO!', 'MI BUTTO NEL LAGO A RIPRENDERLO!', 'JE VAIS SAUTER DANS CE LAC POUR LE RATTRAPER !'],
    'Calma, Cadu! Calma!': ['Easy, Cadu! Easy!', '¡Calma, Cadu! ¡Calma!', 'Calma, Cadu! Calma!', 'Du calme, Cadu ! Du calme !'],
    'Tá. Tá bom. Respira, Cadu. Respira.': ['Okay. Okay. Breathe, Cadu. Breathe.', 'Vale. Está bien. Respira, Cadu. Respira.', 'Ok. Va bene. Respira, Cadu. Respira.', 'D’accord. Ça va. Respire, Cadu. Respire.'],
    'Mas se alguém perguntar, eu nunca vi isso. Combinado?': ['But if anyone asks, I never saw that. Deal?', 'Pero si alguien pregunta, yo nunca vi esto. ¿Trato?', 'Ma se qualcuno chiede, io non ho mai visto niente. D’accordo?', 'Mais si quelqu’un demande, je n’ai jamais vu ça. Marché conclu ?'],
    'Combinado.': ['Deal.', 'Trato hecho.', 'D’accordo.', 'Marché conclu.'],
    'DE NOVO?! Você soltou OUTRO lendário?!': ['AGAIN?! You released ANOTHER legendary?!', '¡¿OTRA VEZ?! ¿Soltaste OTRO legendario?!', 'DI NUOVO?! Hai liberato UN ALTRO leggendario?!', 'ENCORE ?! Tu as relâché UN AUTRE légendaire ?!'],
    'Eu não acredito. Eu NÃO acredito. Eu vou contar pro seu Bené!': ['I can’t believe it. I CAN’T believe it. I’m telling Mr. Bené!', 'No lo puedo creer. NO lo puedo creer. ¡Se lo voy a contar al señor Bené!', 'Non ci credo. NON ci credo. Lo dico al signor Bené!', 'J’y crois pas. J’y crois PAS. Je vais le dire à monsieur Bené !'],
    '...tá. Tá bom. Mas eu tô de olho em você, hein.': ['...fine. Okay. But I’m keeping an eye on you.', '...vale. Está bien. Pero te estoy vigilando, eh.', '...va bene. Ok. Ma ti tengo d’occhio, eh.', '...bon. D’accord. Mais je t’ai à l’œil, hein.'],
    'Eita...': ['Whoa...', 'Epa...', 'Ehi...', 'Oh là...'],
    'Eita, eita, EITA! Tem alguma coisa ENORME aqui!': ['Whoa, whoa, WHOA! There’s something HUGE down there!', '¡Epa, epa, EPA! ¡Hay algo ENORME aquí!', 'Ehi, ehi, EHI! C’è qualcosa di ENORME qui!', 'Oh là, oh là, OH LÀ ! Il y a un truc ÉNORME là-dessous !'],
    'Algo ENORME fisgou a isca!': ['Something HUGE took the bait!', '¡Algo ENORME mordió el anzuelo!', 'Qualcosa di ENORME ha abboccato!', 'Un truc ÉNORME a mordu à l’hameçon !'],
    'Ele não quer sair da água!': ['It won’t come out of the water!', '¡No quiere salir del agua!', 'Non vuole uscire dall’acqua!', 'Il ne veut pas sortir de l’eau !'],
    'A tempestade ficou mais forte!': ['The storm is getting stronger!', '¡La tormenta se hizo más fuerte!', 'La tempesta è diventata più forte!', 'L’orage redouble !'],
    'Ele está cansando! Segura firme!': ['It’s getting tired! Hold on tight!', '¡Se está cansando! ¡Aguanta firme!', 'Si sta stancando! Tieni duro!', 'Il fatigue ! Tiens bon !'],
    'Choque na linha!': ['Shock on the line!', '¡Descarga en el sedal!', 'Scossa sulla lenza!', 'Décharge dans la ligne !'],
    'Mas que PORRA foi essa?!': ['What the HELL was that?!', '¡¿Pero qué CARAJOS fue eso?!', 'Ma che CAZZO era quello?!', 'Mais c’était quoi ce BORDEL ?!'],
    'Que... que bicho é esse?!': ['What... what IS this thing?!', '¿Qué... qué bicho es este?!', 'Ma... ma che bestia è questa?!', 'Mais... c’est quoi cette bestiole ?!'],
    'Eu não faço ideia do que seja isso. Nem parece pertencer a esse lugar...': ['I have no idea what this is. It doesn’t even look like it belongs here...', 'No tengo ni idea de qué es esto. Ni parece de este lugar...', 'Non ho idea di cosa sia. Non sembra nemmeno di questo posto...', 'Je n’ai aucune idée de ce que c’est. On dirait même que ça ne vient pas d’ici...'],
    'Amanhã eu vou perguntar pro seu Bené. Ele deve saber o que é.': ['Tomorrow I’ll ask Mr. Bené. He must know what it is.', 'Mañana le pregunto a don Bené. Él debe saber qué es.', 'Domani chiedo al signor Bené. Lui saprà cos’è.', 'Demain je demanderai à M. Bené. Il doit savoir ce que c’est.'],
    'Você guardou o bicho misterioso para mostrar ao seu Bené.': ['You stored the mysterious creature to show Mr. Bené.', 'Guardaste el bicho misterioso para mostrárselo a don Bené.', 'Hai messo da parte la bestia misteriosa per mostrarla al signor Bené.', 'Tu as rangé la bête mystérieuse pour la montrer à M. Bené.'],
    'Não consta no catálogo': ['Not in the catalog', 'No está en el catálogo', 'Non è nel catalogo', 'Absent du catalogue'],
    'Seu Bené! O senhor precisa ver o que eu pesquei ontem, à meia-noite, no meio da tempestade.': ['Mr. Bené! You need to see what I caught last night, at midnight, in the middle of the storm.', '¡Don Bené! Tiene que ver lo que pesqué anoche, a medianoche, en plena tormenta.', 'Signor Bené! Deve vedere cosa ho pescato ieri, a mezzanotte, in piena tempesta.', 'M. Bené ! Il faut que vous voyiez ce que j’ai pêché hier, à minuit, en pleine tempête.'],
    'Pode mostrar! Põe aí no balcão.': ['Go ahead! Put it on the counter.', '¡Muéstramelo! Ponlo ahí en el mostrador.', 'Fammi vedere! Mettilo sul bancone.', 'Montre ! Pose-le sur le comptoir.'],
    'No balcão não cabe, não...': ['It won’t fit on the counter...', 'En el mostrador no cabe...', 'Sul bancone non ci sta...', 'Ça ne tient pas sur le comptoir...'],
    'Mas o que é que é ISSO?!': ['What on earth is THAT?!', '¡¿Pero qué es ESO?!', 'Ma che cos’è QUESTO?!', 'Mais qu’est-ce que c’est que ÇA ?!'],
    'Rapaz... faz trinta anos que eu pesco nesse lago e nunca vi um bicho desses.': ['Boy... I’ve fished this lake for thirty years and never seen anything like it.', 'Muchacho... llevo treinta años pescando en este lago y nunca vi un bicho así.', 'Ragazzo... pesco in questo lago da trent’anni e non ho mai visto una bestia così.', 'Mon garçon... je pêche dans ce lac depuis trente ans et je n’ai jamais vu une bête pareille.'],
    'Eu não faço a menor ideia do que seja. Nem sei se isso é peixe de verdade!': ['I haven’t the faintest idea what it is. I don’t even know if it’s a real fish!', 'No tengo la menor idea de qué es. ¡Ni sé si es un pez de verdad!', 'Non ho la minima idea di cosa sia. Non so nemmeno se è un pesce vero!', 'Je n’ai pas la moindre idée de ce que c’est. Je ne sais même pas si c’est un vrai poisson !'],
    'Olha esse brilho... Um bicho desses não tem preço. O valor disso deve ser inestimável!': ['Look at that glow... A creature like this has no price. It must be priceless!', 'Mira ese brillo... Un bicho así no tiene precio. ¡Su valor debe ser incalculable!', 'Guarda che luce... Una bestia così non ha prezzo. Deve valere una fortuna inestimabile!', 'Regarde cette lueur... Une bête pareille n’a pas de prix. Ça doit valoir une fortune inestimable !'],
    'Olha, eu te pago 10.000 fakes por ele. Espera aí que eu vou buscar o dinheiro lá no fundo.': ['Look, I’ll pay you 10,000 fakes for it. Hang on, I’ll get the money from the back.', 'Mira, te pago 10.000 fakes por él. Espera, que voy a buscar el dinero al fondo.', 'Senti, ti pago 10.000 fakes. Aspetta che vado a prendere i soldi sul retro.', 'Écoute, je t’en donne 10 000 fakes. Attends, je vais chercher l’argent au fond.'],
    'Seu Bené... acho que ele se mexeu.': ['Mr. Bené... I think it just moved.', 'Don Bené... creo que se movió.', 'Signor Bené... credo che si sia mosso.', 'M. Bené... je crois qu’il a bougé.'],
    'Pensando melhor... fica com o dinheiro e não fala pra ninguém que isso aconteceu...': ['On second thought... keep the money and don’t tell anyone this happened...', 'Pensándolo mejor... quédese con el dinero y no le cuente a nadie lo que pasó...', 'Ripensandoci... tenga i soldi e non dica a nessuno quello che è successo...', 'À la réflexion... gardez l’argent et ne dites à personne ce qui s’est passé...'],
    'O que foi que acabou de acontecer....?': ['What... just happened....?', '¿Qué... acaba de pasar....?', 'Che cosa... è appena successo....?', 'Qu’est-ce qui... vient de se passer....?'],
    'Combinado. Eu não vi nada. E você também não viu nada.': ['Deal. I didn’t see a thing. And neither did you.', 'Trato hecho. Yo no vi nada. Y tú tampoco viste nada.', 'D’accordo. Io non ho visto niente. E nemmeno tu.', 'Marché conclu. Je n’ai rien vu. Et toi non plus.'],
  };
  if (typeof I18N !== 'undefined') for (const k of Object.keys(TRAD)) if (!I18N[k]) I18N[k] = TRAD[k];

  // ------------------------------------------------------------------ dados: raridades, pesos, iscas, varas, horários e origens
  const RARIDADES = ['Comum', 'Incomum', 'Raro', 'Épico', 'Lendário'];
  const COR_RAR = ['#d8d4c8', '#7ad35a', '#4fb7f0', '#c97af0', '#f2c230'];
  const PRECO_RAR = [15, 25, 50, 80, 150];
  const CLASSES = ['magro', 'comum', 'pesado'], MULT = [0.5, 1, 2];
  const ISCAS = [   // tier = posição (0 = a mais simples); cor = a do pote na prateleira da casinha
    { id: 'minhoca', nome: 'Minhoca', preco: 3, cor: '#c86a5a' },
    { id: 'massinha', nome: 'Massinha', preco: 4, cor: '#e8d8b0' },
    { id: 'milho', nome: 'Milho', preco: 6, cor: '#f2d040' },
    { id: 'grilo', nome: 'Grilo', preco: 8, cor: '#6a8a3a' },
    { id: 'camarao', nome: 'Camarão', preco: 11, cor: '#f0a080' },
    { id: 'frutinha', nome: 'Frutinha da mata', preco: 14, cor: '#a8402a' },
    { id: 'tuvira', nome: 'Tuvira viva', preco: 19, cor: '#5a6a5a' },
    { id: 'artificial', nome: 'Isca artificial', preco: 25, cor: '#3fb7f0' },
  ];
  const VARAS = [   // alc = alcance do lançamento (m) · res = quanto aguenta de tensão · rec = recolher (m/s) · L = comprimento
    { id: 'bambu', nome: 'Vara de bambu', preco: 0, alc: 16, res: 1.0, rec: 1.6, L: 2.2, cores: ['#c9a45c', '#8a6a34', '#c9a45c'] },
    { id: 'fibra', nome: 'Vara de fibra', preco: 250, alc: 18, res: 1.15, rec: 1.85, L: 2.1, cores: ['#f2d040', '#1c1c1f', '#c8352b'] },
    { id: 'carbono', nome: 'Vara de carbono', preco: 600, alc: 20, res: 1.3, rec: 2.1, L: 2.3, cores: ['#2a2a2e', '#c8352b', '#8a8a90'] },
    { id: 'molinete', nome: 'Vara com molinete', preco: 1100, alc: 22, res: 1.45, rec: 2.4, L: 2.4, cores: ['#1f5a8a', '#d8d8d8', '#1c1c1f'], molinete: true },
    { id: 'titanio', nome: 'Vara de titânio', preco: 2000, alc: 24, res: 1.65, rec: 2.8, L: 2.5, cores: ['#9aa6b4', '#d8b030', '#2a2a2e'], molinete: true },
  ];
  // chance de cada raridade (%) com cada vara (comum, incomum, raro, épico, lendário)
  const RAR_VARA = [[72, 23, 5, 0, 0], [58, 28, 11, 3, 0], [47, 30, 15, 6, 2], [39, 30, 18, 9, 4], [32, 28, 21, 12, 7]];
  // quanto a isca boa ajuda em cada raridade (1 = ajuda toda; os raros quase não ficam mais fáceis)
  const FACIL_RAR = [1, 0.85, 0.6, 0.4, 0.25];
  const HORAS = { m: 'Manhã (5h–11h)', t: 'Tarde (11h–17h)', e: 'Entardecer (17h–20h)', n: 'Noite (20h–5h)' };
  const ORIGENS = { am: 'Amazônia', pt: 'Pantanal', sf: 'Rio São Francisco', pr: 'Bacia do Paraná', ps: 'Rio Paraíba do Sul', br: 'Todo o Brasil' };
  // forma: t = tipo (p padrão, a alto, d disco, b bagre, l longo, c cascudo, r arraia, e enguia); c = costas, b = barriga, n = nadadeiras;
  //   p = desenho (0 nada, 1 listras em pé, 2 pintas escuras, 3 faixa deitada, 4 ocelos, 5 zebra, 6 escamas vermelhas atrás, 7 pintas claras,
  //   8 rabo listrado); pc = cor do desenho; x = detalhes (a mais alto, f fino, g grosso, k pinta atrás da guelra, d dentes, r rabo grande,
  //   o ocelo no rabo, L bigodes longos, B barbilhões no queixo, c comprido, R olho vermelho, T rabo vermelho, w pintinhas brancas,
  //   P bico de pato, S focinho comprido, H cabeça larga, m manchas laranja)
  const P_ = (id, nome, tr, r, kg0, kg1, h, isca, vara, o, f) => ({ id, nome, tr, r, kg0, kg1, h, isca, vara, o, f });
  const PEIXES = [
    // ---- COMUNS (18)
    P_('lambari', 'Lambari', ['Lambari tetra', 'Lambari', 'Lambari', 'Lambari'], 0, 0.02, 0.12, 'mt', 1, 0, 'br', { t: 'p', c: '#c9d2d6', b: '#eef2f2', n: '#e8b030', p: 0, x: 'k' }),
    P_('piaba', 'Piaba', ['Piaba', 'Piaba', 'Piaba', 'Piaba'], 0, 0.01, 0.06, 'mte', 1, 0, 'am', { t: 'p', c: '#b8c4b0', b: '#e8ecdc', n: '#d06040', p: 3, pc: '#3a6a8a' }),
    P_('cara', 'Cará', ['Acara', 'Acará', 'Acarà', 'Acara'], 0, 0.1, 0.6, 'mt', 0, 0, 'br', { t: 'a', c: '#8a8a5a', b: '#c8c090', n: '#6a6a40', p: 1, pc: '#4a4a30' }),
    P_('mandi', 'Mandi', ['Mandi catfish', 'Bagre mandí', 'Pesce gatto mandi', 'Poisson-chat mandi'], 0, 0.1, 0.7, 'ten', 0, 0, 'br', { t: 'b', c: '#b8b0a0', b: '#ece4d4', n: '#9a8a70', p: 2, pc: '#5a5040' }),
    P_('sardinha', 'Sardinha-de-água-doce', ['Freshwater sardine', 'Sardina de agua dulce', "Sardina d'acqua dolce", "Sardine d'eau douce"], 0, 0.05, 0.35, 'm', 1, 0, 'am', { t: 'p', c: '#d0d8dc', b: '#f4f6f6', n: '#c0c8cc', p: 0, x: 'f' }),
    P_('bodo', 'Bodó', ['Bodó pleco', 'Carachama bodó', 'Bodó', 'Bodó'], 0, 0.2, 1.0, 'en', 0, 0, 'am', { t: 'c', c: '#4a4030', b: '#7a6a50', n: '#3a3024', p: 2, pc: '#2a2418' }),
    P_('jaraqui', 'Jaraqui', ['Jaraqui', 'Yaraquí', 'Jaraqui', 'Jaraqui'], 0, 0.2, 0.9, 'mt', 1, 0, 'am', { t: 'p', c: '#a8b0b4', b: '#e0e6e8', n: '#2a2a2a', p: 8, pc: '#e8c040' }),
    P_('branquinha', 'Branquinha', ['Branquinha', 'Branquiña', 'Branquinha', 'Branquinha'], 0, 0.1, 0.6, 'mt', 1, 0, 'am', { t: 'p', c: '#dfe4e6', b: '#f6f8f8', n: '#c8ccc8', p: 0, x: 'a' }),
    P_('piau', 'Piau', ['Piau (leporinus)', 'Boga (piau)', 'Piau', 'Piau'], 0, 0.3, 2.0, 'mt', 2, 0, 'br', { t: 'p', c: '#a89a68', b: '#e0d8b0', n: '#8a7a48', p: 2, pc: '#3a3020', x: '3' }),
    P_('curimbata', 'Curimbatá', ['Curimbatá', 'Sábalo (curimbatá)', 'Curimbatá', 'Curimbatá'], 0, 0.5, 3.0, 'm', 1, 0, 'br', { t: 'p', c: '#9aa0a0', b: '#dcdcd4', n: '#c06a40', p: 0 }),
    P_('cascudo', 'Cascudo', ['Pleco', 'Cascudo', 'Pleco', 'Pléco'], 0, 0.2, 1.2, 'n', 0, 0, 'br', { t: 'c', c: '#5a4a38', b: '#8a7a60', n: '#4a3a28', p: 2, pc: '#2a2018' }),
    P_('jundia', 'Jundiá', ['Silver catfish (jundiá)', 'Bagre sapo (jundiá)', 'Jundiá', 'Jundiá'], 0, 0.5, 3.0, 'en', 0, 0, 'br', { t: 'b', c: '#6a6458', b: '#c8c0b0', n: '#5a5448', p: 0 }),
    P_('saguiru', 'Saguiru', ['Saguiru', 'Saguirú', 'Saguiru', 'Saguiru'], 0, 0.1, 0.5, 't', 1, 0, 'br', { t: 'p', c: '#c0c4b8', b: '#ecece4', n: '#a8aca0', p: 0, x: 'a' }),
    P_('cachorro', 'Peixe-cachorro', ['Dogfish characin', 'Pez perro', 'Pesce cane', 'Poisson-chien'], 0, 0.1, 0.7, 'me', 3, 0, 'br', { t: 'l', c: '#c8ccc0', b: '#f0f0e8', n: '#d0a040', p: 0, x: 'd' }),
    P_('cangati', 'Cangati', ['Cangati catfish', 'Bagre cangatí', 'Cangati', 'Cangati'], 0, 0.05, 0.35, 'n', 0, 0, 'br', { t: 'b', c: '#4a4038', b: '#8a7a68', n: '#3a3028', p: 7, pc: '#d8c8a0' }),
    P_('aracu', 'Aracu', ['Headstander (aracu)', 'Lisa (aracú)', 'Aracu', 'Aracu'], 0, 0.2, 1.5, 'mt', 2, 0, 'am', { t: 'p', c: '#b8b098', b: '#e8e4d4', n: '#9a9478', p: 1, pc: '#4a4430' }),
    P_('tamoata', 'Tamoatá', ['Hoplo catfish (tamoatá)', 'Cascarudo (tamoatá)', 'Tamoatá', 'Tamoatá'], 0, 0.1, 0.6, 'mt', 0, 0, 'br', { t: 'c', c: '#5a4a3a', b: '#a89070', n: '#4a3a2a', p: 0, x: 'f' }),
    P_('barrigudinho', 'Barrigudinho', ['Guppy', 'Guppy', 'Guppy', 'Guppy'], 0, 0.005, 0.03, 'mte', 1, 0, 'br', { t: 'p', c: '#a0a890', b: '#d8dcc8', n: '#e86040', p: 0, x: 'r' }),
    // ---- INCOMUNS (15)
    P_('traira', 'Traíra', ['Trahira (wolf fish)', 'Tararira', 'Traíra', 'Traíra'], 1, 0.5, 3.5, 'en', 4, 1, 'br', { t: 'l', c: '#6a5a3a', b: '#b8a878', n: '#5a4a2a', p: 2, pc: '#3a3020', x: 'g' }),
    P_('pescada', 'Pescada-branca', ['Silver croaker', 'Corvina de río', 'Corvina di fiume', "Courbine d'eau douce"], 1, 0.5, 3.0, 'e', 4, 1, 'am', { t: 'p', c: '#c8ccd0', b: '#f0f0f0', n: '#d8d0b0', p: 0 }),
    P_('matrinxa', 'Matrinxã', ['Matrinxã', 'Sábalo cola roja (matrinxã)', 'Matrinxã', 'Matrinxã'], 1, 0.5, 3.0, 'm', 5, 1, 'am', { t: 'p', c: '#a0aab0', b: '#e4e8ea', n: '#c04030', p: 0, x: 'k' }),
    P_('piranha', 'Piranha-vermelha', ['Red-bellied piranha', 'Piraña roja', 'Piranha rosso', 'Piranha à ventre rouge'], 1, 0.2, 1.2, 'mt', 4, 0, 'am', { t: 'a', c: '#8a9098', b: '#d8402a', n: '#c03020', p: 7, pc: '#c8ccd0', x: 'd' }),
    P_('pacu', 'Pacu', ['Pacu', 'Pacú', 'Pacu', 'Pacu'], 1, 1.0, 6.0, 't', 5, 1, 'pt', { t: 'a', c: '#6a6a68', b: '#c88a40', n: '#4a4a48', p: 0 }),
    P_('acaraacu', 'Acará-açu', ['Oscar', 'Óscar', 'Oscar', 'Oscar'], 1, 0.3, 1.5, 'mt', 3, 0, 'am', { t: 'a', c: '#3a3a2a', b: '#5a4a30', n: '#2a2a20', p: 4, pc: '#e86030', x: 'm' }),
    P_('jacunda', 'Jacundá', ['Pike cichlid', 'Juanita (jacundá)', 'Ciclide luccio', 'Cichlidé-brochet'], 1, 0.1, 0.6, 'mt', 3, 0, 'am', { t: 'l', c: '#8a8058', b: '#c8c098', n: '#6a6040', p: 3, pc: '#2a2418', x: 'o' }),
    P_('apapa', 'Apapá', ['Apapá (pellona)', 'Sardinata (apapá)', 'Apapá', 'Apapá'], 1, 0.3, 1.8, 'm', 4, 1, 'am', { t: 'p', c: '#d8e0e4', b: '#f6f8fa', n: '#e0c060', p: 0, x: 'a' }),
    P_('mapara', 'Mapará', ['Mapará catfish', 'Mapará', 'Mapará', 'Mapará'], 1, 0.5, 2.0, 'n', 4, 1, 'am', { t: 'b', c: '#b8c0c8', b: '#eef0f2', n: '#a0a8b0', p: 0, x: 'L' }),
    P_('cuiucuiu', 'Cuiú-cuiú', ['Thorny catfish (cuiú-cuiú)', 'Bagre sierra (cuiú-cuiú)', 'Pesce gatto spinoso', 'Poisson-chat épineux'], 1, 0.5, 3.0, 'n', 2, 1, 'am', { t: 'b', c: '#4a4440', b: '#8a8070', n: '#3a3430', p: 3, pc: '#d8d0b8' }),
    P_('pirapitinga', 'Pirapitinga', ['Pirapitinga (red pacu)', 'Paco (pirapitinga)', 'Pirapitinga', 'Pirapitinga'], 1, 1.0, 8.0, 't', 5, 1, 'am', { t: 'a', c: '#8a8a88', b: '#d06840', n: '#2a2a2a', p: 0 }),
    P_('bagre', 'Bagre-amarelo', ['Yellow catfish', 'Bagre amarillo', 'Pesce gatto giallo', 'Poisson-chat jaune'], 1, 0.3, 2.5, 'n', 0, 0, 'br', { t: 'b', c: '#b89a48', b: '#e8d8a0', n: '#a08038', p: 0 }),
    P_('jeju', 'Jeju', ['Jeju (trahira)', 'Yeyú', 'Jeju', 'Jeju'], 1, 0.1, 0.7, 'mt', 3, 0, 'br', { t: 'l', c: '#5a5030', b: '#a89868', n: '#4a4020', p: 0 }),
    P_('pacupeba', 'Pacu-peba', ['Pacu-peba', 'Pacú peba', 'Pacu-peba', 'Pacu-peba'], 1, 0.3, 1.5, 'mt', 2, 0, 'sf', { t: 'a', c: '#9aa0a4', b: '#e0a050', n: '#7a8084', p: 0 }),
    P_('piabanha', 'Piabanha', ['Piabanha', 'Piabanha', 'Piabanha', 'Piabanha'], 1, 0.5, 3.0, 'm', 5, 1, 'ps', { t: 'p', c: '#7a8a80', b: '#d8dcd4', n: '#c04030', p: 0 }),
    // ---- RAROS (12)
    P_('tucunare', 'Tucunaré-amarelo', ['Butterfly peacock bass', 'Tucunaré amarillo', 'Tucunaré giallo', 'Tucunaré jaune'], 2, 0.8, 4.5, 'me', 7, 2, 'am', { t: 'p', c: '#d8b030', b: '#f0e090', n: '#d07030', p: 1, pc: '#2a2a20', x: 'og' }),
    P_('aruana', 'Aruanã', ['Silver arowana', 'Arawana plateada', 'Arowana argentata', 'Arowana argenté'], 2, 1.0, 4.5, 'm', 3, 1, 'am', { t: 'l', c: '#c8d0d0', b: '#eef2f2', n: '#b0b8b8', p: 0, x: 'B' }),
    P_('piranhapreta', 'Piranha-preta', ['Black piranha', 'Piraña negra', 'Piranha nero', 'Piranha noir'], 2, 1.0, 3.5, 'mt', 4, 2, 'am', { t: 'a', c: '#4a4e58', b: '#6a6e78', n: '#1a1a1a', p: 0, x: 'dR' }),
    P_('cachorra', 'Cachorra', ['Payara (vampire fish)', 'Payara', 'Payara', 'Payara'], 2, 1.0, 7.0, 'me', 6, 2, 'am', { t: 'l', c: '#c0c8cc', b: '#eef0f2', n: '#e0a030', p: 0, x: 'dg' }),
    P_('pintado', 'Pintado', ['Spotted sorubim', 'Surubí pintado', 'Surubim maculato', 'Surubim tacheté'], 2, 2.0, 15, 'n', 6, 2, 'pt', { t: 'b', c: '#7a7e86', b: '#f0f0ee', n: '#6a6e76', p: 2, pc: '#1a1a1e', x: 'Lc' }),
    P_('cachara', 'Cachara', ['Barred sorubim', 'Surubí atigrado', 'Surubim tigrato', 'Surubim tigré'], 2, 2.0, 12, 'n', 6, 2, 'pt', { t: 'b', c: '#8a8a8a', b: '#f0f0ee', n: '#7a7a7a', p: 1, pc: '#1a1a1e', x: 'Lc' }),
    P_('dourado', 'Dourado', ['Golden dorado', 'Dorado', 'Dorado', 'Dorado'], 2, 2.0, 10, 'm', 7, 2, 'pr', { t: 'p', c: '#e0a020', b: '#f0d060', n: '#d07020', p: 3, pc: '#b07818', x: 'gd' }),
    P_('tambaqui', 'Tambaqui', ['Tambaqui (black pacu)', 'Gamitana (tambaquí)', 'Tambaqui', 'Tambaqui'], 2, 3.0, 20, 't', 5, 2, 'am', { t: 'a', c: '#7a7a48', b: '#2a2a28', n: '#2a2a28', p: 0, x: 'g' }),
    P_('piraputanga', 'Piraputanga', ['Piraputanga', 'Piraputanga', 'Piraputanga', 'Piraputanga'], 2, 0.5, 3.0, 'm', 5, 1, 'pt', { t: 'p', c: '#b0b8c0', b: '#eceff2', n: '#e04020', p: 0, x: 'k' }),
    P_('barbado', 'Barbado', ['Barbado catfish', 'Barbado', 'Barbado', 'Barbado'], 2, 1.0, 6.0, 'n', 6, 2, 'pt', { t: 'b', c: '#9a948a', b: '#e8e4dc', n: '#8a847a', p: 0, x: 'LL' }),
    P_('jurupoca', 'Jurupoca', ['Flatnose catfish (jurupoca)', 'Bagre pico de pato', 'Jurupoca', 'Jurupoca'], 2, 1.0, 5.0, 'n', 4, 2, 'pt', { t: 'b', c: '#8a7a60', b: '#e0d4c0', n: '#7a6a50', p: 2, pc: '#3a3020', x: 'P' }),
    P_('bicuda', 'Bicuda', ['Pike-characin (bicuda)', 'Picuda', 'Bicuda', 'Bicuda'], 2, 1.0, 5.0, 'm', 7, 2, 'am', { t: 'l', c: '#c0c8c8', b: '#eef2f2', n: '#e06030', p: 3, pc: '#6a7880', x: 'fS' }),
    // ---- ÉPICOS (9)
    P_('tucunareacu', 'Tucunaré-açu', ['Speckled peacock bass', 'Tucunaré pintado', 'Tucunaré maculato', 'Tucunaré moucheté'], 3, 3.0, 10, 'm', 7, 3, 'am', { t: 'p', c: '#c8b040', b: '#f0e0a0', n: '#c87028', p: 1, pc: '#2a2a20', x: 'ogw' }),
    P_('pirarara', 'Pirarara', ['Redtail catfish', 'Bagre cola roja', 'Pesce gatto coda rossa', 'Poisson-chat à queue rouge'], 3, 5.0, 45, 'n', 5, 3, 'am', { t: 'b', c: '#2e2e30', b: '#ece4cc', n: '#d83020', p: 0, x: 'gT' }),
    P_('trairao', 'Trairão', ['Giant trahira', 'Tararira gigante', 'Traíra gigante', 'Traíra géante'], 3, 3.0, 15, 'en', 6, 3, 'am', { t: 'l', c: '#4a3a28', b: '#9a8a68', n: '#3a2a18', p: 2, pc: '#2a1e10', x: 'g' }),
    P_('arraia', 'Arraia-de-fogo', ['Ocellate river stingray', 'Raya motoro', 'Razza motoro', 'Raie motoro'], 3, 3.0, 20, 't', 4, 3, 'am', { t: 'r', c: '#6a5038', b: '#e8dcc8', n: '#5a4028', p: 4, pc: '#e88030' }),
    P_('poraque', 'Poraquê', ['Electric eel', 'Anguila eléctrica', 'Anguilla elettrica', 'Anguille électrique'], 3, 3.0, 20, 'n', 6, 3, 'am', { t: 'e', c: '#3a3a32', b: '#d87030', n: '#2a2a24', p: 0 }),
    P_('disco', 'Acará-disco', ['Discus', 'Disco', 'Discus', 'Discus'], 3, 0.1, 0.45, 't', 4, 1, 'am', { t: 'd', c: '#c86a30', b: '#e09050', n: '#b05a28', p: 5, pc: '#3aa0d0' }),
    P_('filhote', 'Filhote', ['Young piraíba (filhote)', 'Piraíba joven (filhote)', 'Piraíba giovane', 'Jeune piraíba'], 3, 5.0, 40, 'n', 6, 4, 'am', { t: 'b', c: '#8a8a80', b: '#e8e8e0', n: '#7a7a70', p: 2, pc: '#2a2a24', x: 'gc' }),
    P_('dourada', 'Dourada', ['Gilded catfish', 'Dorado (bagre)', 'Pesce gatto dorato', 'Silure doré'], 3, 5.0, 30, 'mn', 6, 3, 'am', { t: 'b', c: '#c8c0a0', b: '#f0ecdc', n: '#5a5048', p: 0, x: 'c' }),
    P_('lenha', 'Peixe-lenha', ['Firewood catfish', 'Pez leña', 'Pesce legno', 'Poisson-bois'], 3, 5.0, 25, 'n', 6, 3, 'am', { t: 'b', c: '#6a6a60', b: '#e4e4dc', n: '#5a5a50', p: 3, pc: '#e8e8e0', x: 'cS' }),
    // ---- LENDÁRIOS (6)
    P_('pirarucu', 'Pirarucu', ['Arapaima (pirarucu)', 'Paiche (pirarucú)', 'Arapaima (pirarucu)', 'Arapaïma (pirarucu)'], 4, 30, 200, 'mt', 7, 4, 'am', { t: 'l', c: '#4a5040', b: '#8a8a70', n: '#3a3a30', p: 6, pc: '#c8302a', x: 'g' }),
    P_('piraiba', 'Piraíba', ['Piraíba (giant catfish)', 'Piraíba (valentón)', 'Piraíba', 'Piraíba'], 4, 50, 200, 'n', 6, 4, 'am', { t: 'b', c: '#6a6a68', b: '#e8e8e2', n: '#5a5a58', p: 0, x: 'gc' }),
    P_('jau', 'Jaú', ['Jaú catfish', 'Bagre sapo (jaú)', 'Pesce gatto jaú', 'Poisson-chat jaú'], 4, 20, 120, 'en', 6, 4, 'am', { t: 'b', c: '#4a3e30', b: '#c8b890', n: '#3a2e20', p: 2, pc: '#2a2018', x: 'gH' }),
    P_('acarizebra', 'Acari-zebra', ['Zebra pleco', 'Pleco cebra', 'Pleco zebra', 'Pléco zèbre'], 4, 0.02, 0.08, 'n', 1, 2, 'am', { t: 'c', c: '#f0f0f0', b: '#e8e8e8', n: '#f0f0f0', p: 5, pc: '#141414' }),
    P_('aruanapreto', 'Aruanã-preto', ['Black arowana', 'Arawana negra', 'Arowana nera', 'Arowana noir'], 4, 1.0, 5.0, 'm', 3, 3, 'am', { t: 'l', c: '#2a2a34', b: '#4a4a58', n: '#c8a040', p: 0, x: 'B' }),
    P_('piracanjuba', 'Piracanjuba', ['Piracanjuba', 'Pira-pitá (piracanjuba)', 'Piracanjuba', 'Piracanjuba'], 4, 2.0, 8.0, 'm', 5, 3, 'pr', { t: 'p', c: '#b8b8a0', b: '#ecece0', n: '#d84828', p: 7, pc: '#3a3a30' }),
  ];
  const PEIXE_TR = {}; for (const p of PEIXES) { PEIXE_TR[p.nome] = p.tr; if (typeof I18N !== 'undefined' && !I18N[p.nome]) I18N[p.nome] = p.tr; }

  // ------------------------------------------------------------------ a matemática (pura: dá para testar fora do jogo)
  const clampN = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerpN = (a, b, k) => a + (b - a) * k;
  const blocoHora = (h) => (h >= 5 && h < 11 ? 'm' : h >= 11 && h < 17 ? 't' : h >= 17 && h < 20 ? 'e' : 'n');
  // (6.6.0) o LANÇAMENTO dá uma NOTA (0–100) pela PROFUNDIDADE de onde a isca caiu (a cor da água: miolo escuro de poço = 100, banco de
  //   areia claro ≈ 10). q = nota/100. Nota alta: mais raros, mais pesados e mordem mais rápido; nota baixa: o contrário.
  const NOTA_PERFEITA = 93;
  const faixaNota = (n) => (n >= NOTA_PERFEITA ? 4 : n >= 78 ? 3 : n >= 55 ? 2 : n >= 30 ? 1 : 0);
  // quem gosta de fundo (+1: bagres, cascudos, arraia, poraquê) e quem gosta de beira (−1: os peixinhos de escama)
  const gostoFundo = (p) => ('bcre'.indexOf(p.f.t) >= 0 ? 1 : (p.f.t === 'p' || p.f.t === 'a') && p.kg1 <= 0.4 ? -1 : 0);
  // qual peixe vai morder: raridade pela vara e pela nota do lançamento, espécie pela hora, pela isca e pela profundidade
  function sortearPeixe(h, vara, isca, q, rnd) {
    rnd = rnd || Math.random; q = clampN(q == null ? 0.5 : q, 0, 1);
    const b = blocoHora(h), perf = q * 100 >= NOTA_PERFEITA ? 1.2 : 1;
    const dm = [1.3 - 0.5 * q, 1.05 - 0.1 * q, 0.65 + 0.6 * q, (0.5 + 0.9 * q) * perf, (0.4 + 1.2 * q) * perf];
    const disp = [[], [], [], [], []]; PEIXES.forEach((p, i) => { if (p.h.indexOf(b) >= 0) disp[p.r].push(i); });
    const pesos = []; let tot = 0;
    for (let r = 0; r < 5; r++) {
      const L = disp[r], base = RAR_VARA[vara][r] * dm[r]; if (!L.length || base <= 0) continue;
      let sl = 0; const ws = L.map((i) => { const w = (1 + 0.5 * gostoFundo(PEIXES[i]) * (q - 0.5) * 2); sl += w; return w; });
      L.forEach((i, k) => { const fav = PEIXES[i].isca === isca ? (r === 4 ? 2 : 3) : 1, w = base * ws[k] / sl * fav; pesos.push([i, w]); tot += w; });
    }
    let x = rnd() * tot; for (const [i, w] of pesos) { x -= w; if (x <= 0) return i; }
    return pesos[pesos.length - 1][0];
  }
  // peso dentro da faixa da espécie (varas melhores e lançamentos melhores puxam para cima) e a classe (0 magro, 1 comum, 2 pesado)
  function sortearPeso(i, vara, rnd, q) {
    rnd = rnd || Math.random; q = clampN(q == null ? 0.5 : q, 0, 1);
    const p = PEIXES[i], t = Math.pow(rnd(), (1.3 - 0.12 * vara) * (1.4 - 0.8 * q)), kg = p.kg0 + (p.kg1 - p.kg0) * t;
    return { kg: kg < 1 ? Math.round(kg * 1000) / 1000 : Math.round(kg * 10) / 10, classe: classeDe(i, kg) };
  }
  function classeDe(i, kg) { const p = PEIXES[i], t = (kg - p.kg0) / ((p.kg1 - p.kg0) || 1); return t < 0.25 ? 0 : t > 0.78 ? 2 : 1; }
  const limiteMagro = (i) => { const p = PEIXES[i]; return p.kg0 + (p.kg1 - p.kg0) * 0.25; };
  const limitePesado = (i) => { const p = PEIXES[i]; return p.kg0 + (p.kg1 - p.kg0) * 0.78; };
  const precoPeixe = (i, classe) => Math.round(PRECO_RAR[PEIXES[i].r] * MULT[classe]);
  // o quanto custa pegar este peixe com esta vara e esta isca
  function dificuldade(i, classe, vara, isca) {
    const p = PEIXES[i], r = p.r, er = (isca / 7) * FACIL_RAR[r], fav = p.isca === isca, falta = Math.max(0, p.vara - vara), fc = [0.85, 1, 1.18][classe];
    return {
      espera: [lerpN(14, 4, er), lerpN(26, 8, er)].map((v) => v * [1, 1.1, 1.25, 1.4, 1.6][r] * (fav ? 0.7 : 1)),   // segundos até morder (de–até)
      janela: lerpN(0.85, 1.45, er) * [1, 0.92, 0.82, 0.72, 0.62][r] * (fav ? 1.15 : 1),                         // segundos para fisgar
      beliscadas: Math.max(0, Math.round(lerpN(3, 0.6, er) + r * 0.3)),                                         // falsos toques antes
      forca: Math.min(1.3, [0.3, 0.42, 0.6, 0.78, 0.95][r] * fc * (1 + 0.22 * falta) * (1 - 0.3 * er)),
      folego: [5, 7, 11, 15, 22][r] * fc * (1 - 0.45 * er) * (1 + 0.15 * falta),
      firmeza: lerpN(0.5, 0.9, er),                                       // o anzol bem preso (isca boa) solta menos com a linha frouxa
      tranco: 1 + 0.6 * (1 - er),                                         // isca ruim: a corrida do peixe dá tranco mais forte na linha
      // (6.6.0) a FAIXA BOA da tensão: mais estreita para peixe raro e pesado, mais larga com isca boa e vara boa (vara fraca para o peixe: estreita)
      zona: clampN([0.42, 0.36, 0.3, 0.25, 0.2][r] * [1.1, 1, 0.88][classe] * (1 + 0.3 * er) * (1 + 0.05 * vara) * (1 - 0.14 * falta), 0.13, 0.5),
      deriva: [0.02, 0.05, 0.09, 0.13, 0.17][r] * (1 - 0.3 * er),         // o quanto a faixa anda (os raros ficam mudando)
      tremor: [0.05, 0.07, 0.1, 0.13, 0.16][r] * fc,                      // as sacudidas de cabeça (a tensão treme)
      falta, er,
    };
  }
  // A BRIGA (6.6.0). Segurar PUXAR sobe a tensão (e recolhe a linha); soltar deixa ela cair. O peixe correndo puxa a tensão para cima.
  //   A tensão tem que ficar na FAIXA BOA (verde): só ali a linha é recolhida de verdade e o peixe cansa. Abaixo dela, a linha frouxa vai
  //   enchendo o "frouxo" (cheio = o peixe cospe o anzol); acima, o "esticado" (cheio = a linha arrebenta). A faixa anda nos peixes raros.
  //   B = { dist, tensao, zc, zw, frouxo, estica, folego, corre, ... } · seg = segurando PUXAR
  //   devolve null (continua) ou 'pegou' | 'arrebentou' | 'soltou' | 'linha' (acabou a linha)
  function novaBriga(dist, d, vara, rnd) {
    rnd = rnd || Math.random; const V = VARAS[vara];
    return { dist, tensao: 0.45, folego: d.folego, folego0: d.folego, forca: d.forca, corre: false, tFase: 0.9 + rnd() * 0.7, firmeza: d.firmeza, tranco: d.tranco,
      res: V.res, rec: V.rec, alc: V.alc, lado: 0, ladoAlvo: 0, t: 0, choque: 0,
      zw: d.zona, deriva: d.deriva, tremor: d.tremor, fase: rnd() * 6.28, zc: 0.5, lo: 0.5 - d.zona / 2, hi: 0.5 + d.zona / 2, frouxo: 0, estica: 0, onde: 0 };
  }
  function zonaBriga(B) {
    const w = B.zw * (B.folego <= 0 ? 1.3 : 1), dv = B.deriva;
    const c = clampN(0.5 + dv * Math.sin(B.t * (0.55 + dv * 2.5) + B.fase) + dv * 0.45 * Math.sin(B.t * 1.7 + B.fase * 2) + (B.corre ? dv * 0.4 : 0), w / 2 + 0.05, 0.95 - w / 2);
    B.zc = c; B.lo = c - w / 2; B.hi = c + w / 2;
  }
  function passoBriga(B, seg, dt, rnd) {
    rnd = rnd || Math.random; B.t += dt; B.tFase -= dt;
    const cansado = B.folego <= 0;
    if (B.tFase <= 0) {
      if (B.corre) { B.corre = false; B.tFase = (1.0 + rnd() * 1.4) * (1 + 0.9 * (1 - Math.max(0, B.folego) / B.folego0)); }
      else { B.corre = cansado ? rnd() < 0.3 : true; B.tFase = B.corre ? (0.7 + rnd() * 1.1) * (0.6 + B.forca) * (cansado ? 0.5 : 1) : 0.8 + rnd() * 0.7; if (B.corre) B.ladoAlvo = (rnd() < 0.5 ? -1 : 1) * (0.25 + rnd() * 0.4); }
    }
    zonaBriga(B);
    const F = B.forca * (cansado ? 0.55 : 1);
    // a tensão: segurando, sobe (cada vez mais devagar perto do topo); soltando, cai até o quanto o peixe está puxando
    const puxa = B.corre ? B.hi - B.zw * 0.3 + 0.3 * (F * B.tranco / B.res - 0.6) : 0.04;   // com a vara certa, o peixe correndo fica no alto da faixa
    let alvo, k;
    if (seg) { alvo = 1.08 + (B.corre ? 0.3 * F : 0); k = 1.25 + 0.4 * F; }
    else { alvo = puxa; k = B.corre ? 2.2 : 1.7; }
    B.tensao += (alvo - B.tensao) * (1 - Math.exp(-k * dt));
    B.tensao += B.tremor * (Math.sin(B.t * 11.3 + B.fase) + 0.6 * Math.sin(B.t * 27.1)) * dt * (B.corre ? 3.2 : 1.6);
    B.tensao = clampN(B.tensao, 0, 1);
    if (B.choque > 0) B.choque -= dt;
    B.lado += (B.ladoAlvo * (B.corre ? 1 : 0.4) - B.lado) * Math.min(1, dt * 1.5);
    const T = B.tensao, dentro = T >= B.lo && T <= B.hi; B.onde = T < B.lo ? -1 : T > B.hi ? 1 : 0;
    // a linha: recolhe segurando (bem dentro da faixa, pouco fora dela); o peixe correndo leva linha (menos com a linha esticada)
    if (seg) B.dist -= dt * B.rec * 1.5 * (dentro ? 1 : T > B.hi ? 0.45 : 0.15) * (1 - 0.35 * F * (B.corre ? 1 : 0.4));
    if (B.corre) B.dist += dt * (0.3 + 2.2 * F) * (1 - 0.65 * T);
    // o fôlego do peixe: cansa de verdade quando a tensão está na faixa
    B.folego -= dt * (dentro ? (B.corre ? 1.7 : 0.7) : 0.15);
    // frouxo e esticado
    if (T < B.lo) B.frouxo += dt * (0.5 + 1.0 * (B.lo - T) / Math.max(0.05, B.lo)) * (1.25 - B.firmeza) * (B.corre ? 1.35 : 1);
    else B.frouxo = Math.max(0, B.frouxo - dt * 0.4);
    if (T > B.hi) B.estica += dt * (0.3 + 1.7 * Math.pow((T - B.hi) / Math.max(0.05, 1 - B.hi), 1.5)) / Math.sqrt(B.res);
    else B.estica = Math.max(0, B.estica - dt * 0.45);
    if (B.estica >= 1) return 'arrebentou';
    if (B.frouxo >= 1) return 'soltou';
    if (B.dist > B.alc + 6) return 'linha';
    if (B.dist <= 1.0) return 'pegou';
    return null;
  }
  const DADOS = { RARIDADES, COR_RAR, PRECO_RAR, CLASSES, MULT, ISCAS, VARAS, RAR_VARA, FACIL_RAR, HORAS, ORIGENS, PEIXES };
  const LOGICA = { blocoHora, sortearPeixe, sortearPeso, classeDe, precoPeixe, dificuldade, novaBriga, passoBriga, zonaBriga, limiteMagro, limitePesado, faixaNota, gostoFundo, NOTA_PERFEITA };

  // ------------------------------------------------------------------ textos curtos e números
  // as traduções DAQUI valem primeiro (ex.: "LANÇAR" no jogo é o lateral do futebol = THROW; aqui é lançar a isca = CAST)
  const IDX_L = { en: 0, es: 1, it: 2, fr: 3 };
  function tr(t) {
    const L = typeof Idioma !== 'undefined' ? Idioma.atual : 'pt';
    if (L !== 'pt' && IDX_L[L] != null) { const v = TRAD[t] || (PEIXE_TR[t]); if (v && v[IDX_L[L]]) return v[IDX_L[L]]; }
    return typeof T === 'function' ? T(t) : t;
  }
  const trf = (t, ...a) => tr(t).replace(/\{(\d+)\}/g, (m, n) => (a[n] != null ? a[n] : m));
  const virgula = () => !(typeof Idioma !== 'undefined' && Idioma.atual === 'en');
  function fmtKg(kg) {
    if (kg < 1) return Math.max(1, Math.round(kg * 1000)) + ' g';
    const s = (Math.round(kg * 10) / 10).toFixed(1); return (virgula() ? s.replace('.', ',') : s) + ' kg';
  }
  const nomePeixe = (i) => tr(PEIXES[i].nome);
  const nomeRar = (r) => tr(RARIDADES[r]);
  const nomeClasse = (c) => tr(CLASSES[c]);
  const horasTxt = (h) => (h.length >= 4 ? tr('O dia todo') : h.split('').map((k) => tr(HORAS[k])).join(' · '));
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pk = (l) => l[Math.floor(Math.random() * l.length)];
  const suave = (k) => { k = clampN(k, 0, 1); return k * k * (3 - 2 * k); };
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ------------------------------------------------------------------ sons (sintetizados, como os do academia.js)
  let ruido = null;
  function audio() { if (typeof Som === 'undefined' || !Som.audio || Som.mudo) return null; return Som.audio; }
  function tom(A, f, t, dur, vol, tipo, ate) {
    const o = A.ctx.createOscillator(), g = A.ctx.createGain(); o.type = tipo || 'sine'; o.frequency.setValueAtTime(f, t); if (ate) o.frequency.exponentialRampToValueAtTime(ate, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(A.mestre); o.start(t); o.stop(t + dur + 0.02);
  }
  function chiado(A, t, dur, vol, freq) {
    const c = A.ctx; if (!ruido || ruido.sampleRate !== c.sampleRate) { ruido = c.createBuffer(1, c.sampleRate, c.sampleRate); const d = ruido.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s.buffer = ruido; f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = 1.2;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(f); f.connect(g); g.connect(A.mestre); s.start(t, Math.random() * 0.5, dur + 0.02);
  }
  const com = (fn) => () => { const A = audio(); if (!A) return; try { fn(A, A.ctx.currentTime + 0.01); } catch (e) { /* sem som */ } };
  const SOM = {
    lanca: com((A, t) => { chiado(A, t, 0.32, 0.1, 2800); tom(A, 1100, t, 0.28, 0.02, 'sine', 380); }),
    agua: com((A, t) => { chiado(A, t, 0.45, 0.2, 650); chiado(A, t + 0.04, 0.25, 0.08, 1900); }),
    ploc: com((A, t) => { tom(A, 460, t, 0.13, 0.12, 'sine', 150); chiado(A, t, 0.18, 0.1, 900); }),
    toc: com((A, t) => tom(A, 760, t, 0.05, 0.05, 'sine', 520)),
    clique: com((A, t) => tom(A, 2300, t, 0.018, 0.022, 'square')),
    zum: com((A, t) => tom(A, 1700, t, 0.22, 0.025, 'sawtooth', 1150)),
    arrebenta: com((A, t) => { tom(A, 1900, t, 0.08, 0.08, 'square', 280); chiado(A, t, 0.14, 0.1, 3200); }),
    choque: com((A, t) => { for (let i = 0; i < 7; i++) tom(A, 110 + Math.random() * 90, t + i * 0.035, 0.05, 0.08, 'sawtooth'); }),
    erro: com((A, t) => tom(A, 230, t, 0.25, 0.07, 'square', 110)),
    pegou: com((A, t) => { for (const [i, f] of [[0, 660], [1, 880], [2, 1320]]) tom(A, f, t + i * 0.08, 0.14, 0.05, 'triangle'); }),
    raro: com((A, t) => { for (const [i, f] of [[0, 523], [1, 659], [2, 784], [3, 1047]]) tom(A, f, t + i * 0.09, 0.22, 0.05, 'triangle'); }),
    lendario: com((A, t) => { for (const [i, f] of [[0, 392], [1, 523], [2, 659], [3, 784], [4, 1047], [5, 1319]]) tom(A, f, t + i * 0.11, 0.35, 0.055, 'triangle'); tom(A, 1568, t + 0.7, 0.8, 0.04, 'sine'); }),
    moeda: com((A, t) => { tom(A, 3100, t, 0.05, 0.03, 'triangle'); tom(A, 4200, t + 0.03, 0.08, 0.025, 'triangle'); }),
  };
  // ruído grave e comprido, com o volume tremendo (o ronco do trovão)
  function ronco(A, t, dur, vol, freq) {
    chiado(A, t, 0.01, 0.0001, 100);
    const c = A.ctx, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s.buffer = ruido; s.loop = true; f.type = 'lowpass'; f.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.1);
    for (let k = 1; k < 8; k++) g.gain.exponentialRampToValueAtTime(Math.max(0.0003, vol * (1 - k / 8) * (0.5 + 0.5 * Math.random())), t + dur * k / 8);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(f); f.connect(g); g.connect(A.mestre); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
  }
  Object.assign(SOM, {
    trovaoPerto: com((A, t) => { chiado(A, t, 0.2, 0.55, 3600); chiado(A, t, 0.4, 0.4, 900); tom(A, 62, t, 0.7, 0.3, 'sine', 30); ronco(A, t + 0.04, 3.4, 0.5, 260); }),
    trovaoLonge: (atraso) => com((A, t) => ronco(A, t + (atraso || 0), 2.6, 0.24, 170))(),
    zap: com((A, t) => { for (let k = 0; k < 6; k++) tom(A, 900 + Math.random() * 1700, t + k * 0.03, 0.03, 0.05, 'square'); chiado(A, t, 0.2, 0.08, 5200); }),
    estalos: com((A, t) => { for (let k = 0; k < 10; k++) chiado(A, t + Math.random() * 0.6, 0.025, 0.12, 2400 + Math.random() * 3000); }),
    nhac: com((A, t) => { tom(A, 190, t, 0.28, 0.32, 'sine', 55); chiado(A, t, 0.22, 0.2, 420); tom(A, 95, t + 0.24, 0.2, 0.2, 'sine', 50); }),
    rugido: com((A, t) => { tom(A, 72, t, 1.3, 0.16, 'sawtooth', 44); tom(A, 146, t, 1.1, 0.07, 'square', 88); ronco(A, t, 1.4, 0.22, 340); }),
    pum: com((A, t) => { tom(A, 120, t, 0.18, 0.25, 'sine', 60); chiado(A, t, 0.12, 0.12, 700); }),
  });

  // ROCK de briga (só com o bagre-trovão): bateria, baixo, power chords distorcidos e um solo em Mi menor, a 150 bpm.
  //   nivel 1: bateria, guitarra e baixo · 2: entra o solo · 3: chimbal dobrado, bumbo e virada. final(): o acorde final com o prato.
  const Rock = (() => {
    let R = null;
    const PASSO = 60 / 150 / 2, RAIZ = [40, 36, 43, 38];
    const SOLO = [[76, 0, 74, 76, 79, 0, 76, 74], [72, 0, 71, 72, 76, 0, 72, 71], [71, 0, 74, 79, 78, 0, 74, 71], [74, 0, 78, 81, 79, 78, 76, 74]];
    const hz = (n) => 440 * Math.pow(2, (n - 69) / 12);
    const curvaDist = (k) => { const n = 512, c = new Float32Array(n); for (let i = 0; i < n; i++) { const x = i / (n - 1) * 2 - 1; c[i] = (1 + k) * x / (1 + k * Math.abs(x)); } return c; };
    function osc(r, tipo, f, t, dur, vol, dest, ate) { const o = r.c.createOscillator(), g = r.c.createGain(); o.type = tipo; o.frequency.setValueAtTime(f, t); if (ate) o.frequency.exponentialRampToValueAtTime(ate, t + dur); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + 0.03); }
    function barulho(r, t, dur, vol, tipoF, freq, dest, q) { const s = r.c.createBufferSource(), f = r.c.createBiquadFilter(), g = r.c.createGain(); s.buffer = r.rb; f.type = tipoF; f.frequency.value = freq; if (q) f.Q.value = q; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(f); f.connect(g); g.connect(dest); s.start(t, Math.random() * 0.8); s.stop(t + dur + 0.03); }
    const bumbo = (r, t, v) => { osc(r, 'sine', 150, t, 0.17, 0.95 * v, r.bat, 42); osc(r, 'triangle', 95, t, 0.05, 0.4 * v, r.bat, 50); };
    const caixa = (r, t, v) => { barulho(r, t, 0.18, 0.55 * v, 'bandpass', 1900, r.bat, 0.8); osc(r, 'triangle', 210, t, 0.09, 0.35 * v, r.bat, 160); };
    const chimbal = (r, t, v, aberto) => barulho(r, t, aberto ? 0.22 : 0.045, 0.2 * v, 'highpass', 7200, r.bat);
    const prato = (r, t) => barulho(r, t, 1.7, 0.3, 'highpass', 4800, r.bat);
    function guitarra(r, raiz, t, dur, v) { for (const [d, q] of [[0, 1], [7, 0.8], [12, 0.6]]) { const f = hz(raiz + 12 + d); osc(r, 'sawtooth', f, t, dur, 0.15 * v * q, r.gt); osc(r, 'square', f * 1.004, t, dur, 0.06 * v * q, r.gt); } }
    function solo(r, n, t, dur) {
      const c = r.c, o = c.createOscillator(), g = c.createGain(), lfo = c.createOscillator(), lg = c.createGain(); o.type = 'sawtooth'; o.frequency.setValueAtTime(hz(n), t);
      lfo.frequency.value = 5.5; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(hz(n) * 0.014, t + Math.min(dur, 0.25)); lfo.connect(lg); lg.connect(o.frequency);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.12, t + 0.02); g.gain.setValueAtTime(0.1, t + dur * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(r.ld); o.start(t); lfo.start(t); o.stop(t + dur + 0.03); lfo.stop(t + dur + 0.03);
    }
    function passo(r, p, t) {
      const n = r.nivel, ps = p % 8, cp = Math.floor(p / 8) % 4, raiz = RAIZ[cp], intro = p < 16;
      if (ps === 0 || ps === 3 || ps === 4 || (n >= 3 && ps === 7)) bumbo(r, t, 1);
      if (ps === 2 || ps === 6) caixa(r, t, 1);
      if (n >= 3 && cp === 3 && ps >= 6) { caixa(r, t + PASSO / 2, 0.7); caixa(r, t + PASSO * 0.75, 0.8); }
      chimbal(r, t, ps % 2 ? 0.7 : 1, ps === 7 && n >= 2); if (n >= 3) chimbal(r, t + PASSO / 2, 0.5);
      if ((p % 32 === 0 && !intro) || r.pratoJa) { prato(r, t); r.pratoJa = false; }
      const aberta = ps === 0 || ps === 3; guitarra(r, raiz, t, aberta ? PASSO * 1.9 : PASSO * 0.5, aberta ? 1 : 0.72);
      if (p >= 8) osc(r, 'sawtooth', hz(raiz - 12 + (ps === 7 ? 7 : 0)), t, PASSO * 0.85, 0.3, r.bx);
      if (n >= 2 && !intro) { const nota = SOLO[cp][ps]; if (nota) { let d = 1; while (ps + d < 8 && !SOLO[cp][ps + d]) d++; solo(r, nota + (n >= 3 && cp % 2 ? 12 : 0), t, PASSO * d * 0.95); } }
    }
    function agenda() { const r = R; if (!r) return; const ate = r.c.currentTime + 0.15; while (r.prox < ate) { passo(r, r.p, r.prox); r.prox += PASSO; r.p++; } }
    function montar(A) {
      const c = A.ctx, r = { c, nivel: 1, p: 0, pratoJa: false };
      r.rb = c.createBuffer(1, c.sampleRate, c.sampleRate); const d = r.rb.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      r.saida = c.createGain(); r.saida.gain.setValueAtTime(0.0001, c.currentTime); r.saida.gain.exponentialRampToValueAtTime(0.34, c.currentTime + 0.6); r.saida.connect(A.mestre);
      r.bat = c.createGain(); r.bat.gain.value = 0.9; r.bat.connect(r.saida);
      r.gt = c.createGain(); const ws = c.createWaveShaper(); ws.curve = curvaDist(60); ws.oversample = '2x'; const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3200; const gg = c.createGain(); gg.gain.value = 0.5; r.gt.connect(ws); ws.connect(lp); lp.connect(gg); gg.connect(r.saida);
      r.bx = c.createGain(); const lb = c.createBiquadFilter(); lb.type = 'lowpass'; lb.frequency.value = 650; r.bx.connect(lb); lb.connect(r.saida);
      r.ld = c.createGain(); const ws2 = c.createWaveShaper(); ws2.curve = curvaDist(25); const l2 = c.createBiquadFilter(); l2.type = 'lowpass'; l2.frequency.value = 4200; const eco = c.createDelay(1); eco.delayTime.value = PASSO * 1.5; const fb = c.createGain(); fb.gain.value = 0.28;
      r.ld.connect(ws2); ws2.connect(l2); l2.connect(r.saida); l2.connect(eco); eco.connect(fb); fb.connect(eco); fb.connect(r.saida);
      r.prox = c.currentTime + 0.1; return r;
    }
    function soltar(r, seg) { setTimeout(() => { try { r.saida.disconnect(); } catch (e) { /* já foi */ } }, seg * 1000); }
    return {
      tocar() { const A = audio(); if (!A || R) return; try { R = montar(A); R.tm = setInterval(agenda, 25); agenda(); } catch (e) { R = null; } },
      nivel(n) { if (R && n > R.nivel) { R.nivel = n; R.pratoJa = true; } },
      parar(corte) {
        const r = R; if (!r) return; R = null; clearInterval(r.tm);
        try { const t = r.c.currentTime; r.saida.gain.cancelScheduledValues(t); r.saida.gain.setValueAtTime(Math.max(0.0001, r.saida.gain.value), t); r.saida.gain.exponentialRampToValueAtTime(0.0001, t + (corte ? 0.05 : 1.2)); } catch (e) { /* sem som */ }
        soltar(r, corte ? 0.4 : 2);
      },
      final() {
        const r = R; if (!r) return; R = null; clearInterval(r.tm);
        try { const t = Math.max(r.c.currentTime + 0.02, r.prox); bumbo(r, t, 1.2); prato(r, t); guitarra(r, 40, t, 2.8, 1.25); osc(r, 'sawtooth', hz(28), t, 2.6, 0.32, r.bx); solo(r, 88, t, 2.2);
          r.saida.gain.setValueAtTime(0.34, t + 2.2); r.saida.gain.exponentialRampToValueAtTime(0.0001, t + 3.2); } catch (e) { /* sem som */ }
        soltar(r, 4);
      },
      tocando: () => !!R,
    };
  })();

  // ------------------------------------------------------------------ a FORMA de cada peixe (a mesma para o boneco 3D e o desenho do catálogo)
  //   O corpo é feito de 6 fatias ao longo do comprimento (do focinho para o rabo): altura e largura de cada uma (fração de H e W).
  const FATIAS_X = [0.40, 0.25, 0.10, -0.05, -0.19, -0.31], FATIA_L = 0.15;
  const PERFIS = {
    p: { H: 0.28, W: 0.12, hf: [0.55, 0.85, 1, 0.95, 0.72, 0.42], wf: [0.7, 0.9, 1, 0.92, 0.7, 0.45] },
    a: { H: 0.5, W: 0.14, hf: [0.62, 0.92, 1, 0.94, 0.66, 0.32], wf: [0.7, 0.9, 1, 0.92, 0.7, 0.45] },
    d: { H: 0.85, W: 0.1, hf: [0.7, 0.95, 1, 0.97, 0.8, 0.4], wf: [0.7, 0.9, 1, 0.92, 0.7, 0.45] },
    b: { H: 0.19, W: 0.2, hf: [0.62, 0.86, 1, 0.92, 0.72, 0.45], wf: [1.05, 1, 0.95, 0.8, 0.6, 0.4] },
    l: { H: 0.17, W: 0.13, hf: [0.72, 0.92, 1, 1, 0.9, 0.62], wf: [0.8, 0.95, 1, 0.95, 0.8, 0.55] },
    c: { H: 0.2, W: 0.24, hf: [0.7, 0.92, 1, 0.9, 0.62, 0.38], wf: [1, 1, 0.95, 0.8, 0.6, 0.4] },
    e: { H: 0.09, W: 0.075, hf: [0.85, 1, 1, 1, 0.92, 0.7], wf: [0.85, 1, 1, 1, 0.9, 0.7] },
  };
  function formaDe(i) {
    const f = PEIXES[i].f, x = f.x || '', base = PERFIS[f.t] || PERFIS.p;
    let H = base.H, W = base.W;
    if (x.indexOf('a') >= 0) H *= 1.2; if (x.indexOf('f') >= 0) H *= 0.75; if (x.indexOf('g') >= 0) { W *= 1.25; H *= 1.1; } if (x.indexOf('c') >= 0) H *= 0.85;
    const wf = base.wf.slice(); if (x.indexOf('H') >= 0) { wf[0] *= 1.3; wf[1] *= 1.2; }
    return { H, W, hf: base.hf, wf, x, t: f.t };
  }
  // kg/m³ "de forma": comprimento = raiz cúbica (kg / k)
  const K_FORMA = { p: 11, a: 22, d: 30, b: 9, l: 7, c: 14, r: 30, e: 2.5 };
  const comprimentoDe = (i, kg) => Math.cbrt(Math.max(0.004, kg) / (K_FORMA[PEIXES[i].f.t] || 11));
  // pseudo-aleatório fixo por peixe (as pintas ficam sempre no mesmo lugar)
  const sem = (i, k) => { const v = Math.sin(i * 91.7 + k * 17.31) * 43758.5453; return v - Math.floor(v); };

  // ------------------------------------------------------------------ (6.6.0) a PIXEL ART de cada peixe: 80×48, vista de lado (a arraia, de cima)
  //   Um "pintor" de pixels: o corpo sai do perfil da espécie (formaDe), o rabo e as nadadeiras do tipo (e de alguns ids), as cores têm
  //   degradê pontilhado (costas → barriga), sombra nas costas e embaixo, brilho no flanco, escamas (ou placas, ou couro liso), linha
  //   lateral, guelra, olho com brilho, boca, bigodes, os desenhos da espécie e um contorno escuro. A MESMA arte vira o peixe 3D: cada
  //   pixel vira um bloquinho com a grossura do corpo naquele ponto (geoDeArte, lá no módulo).
  const ARTE_W = 80, ARTE_H = 48;
  const hexC = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const mixC = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
  const mulC = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
  const claroC = (a, k) => mixC(a, [255, 255, 255], k);
  const hexDe = (c) => '#' + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const BAYER = [[0.125, 0.625], [0.875, 0.375]];
  const RABO_REDONDO = new Set(['cara', 'acaraacu', 'jacunda', 'traira', 'trairao', 'jeju', 'tamoata', 'disco', 'aruana', 'aruanapreto', 'tucunare', 'tucunareacu', 'bodo', 'barrigudinho', 'pirarucu', 'cascudo', 'acarizebra', 'cangati']);
  const CICLIDEOS = new Set(['cara', 'acaraacu', 'jacunda', 'tucunare', 'tucunareacu', 'disco']);
  const PACUS = new Set(['pacu', 'pirapitinga', 'tambaqui', 'pacupeba', 'piranha', 'piranhapreta']);
  const SEM_ADIPOSA = new Set(['pescada', 'apapa', 'barrigudinho', 'aruana', 'aruanapreto', 'pirarucu', 'traira', 'trairao', 'jeju']);
  // Catmull-Rom nos pontos (u decrescente): valor em u
  function curva(U, V, u) {
    if (u >= U[0]) return V[0]; const n = U.length; if (u <= U[n - 1]) return V[n - 1];
    let k = 0; while (k < n - 2 && u < U[k + 1]) k++;
    const s = (U[k] - u) / (U[k] - U[k + 1]), p0 = V[Math.max(0, k - 1)], p1 = V[k], p2 = V[k + 1], p3 = V[Math.min(n - 1, k + 2)];
    return 0.5 * (2 * p1 + (-p0 + p2) * s + (2 * p0 - 5 * p1 + 4 * p2 - p3) * s * s + (-p0 + 3 * p1 - 3 * p2 + p3) * s * s * s);
  }
  // { w, h, cor: [ [r,g,b] | null ], tipo (1 corpo, 2 nadadeira, 3 contorno), esp (grossura, em comprimentos), K (pixels por comprimento), cx, cy, deCima }
  const cacheArte = new Map();
  function artePeixe(i) {
    if (cacheArte.has(i)) return cacheArte.get(i);
    const A = PEIXES[i].f.t === 'r' ? arteArraia(i) : arteLado(i); cacheArte.set(i, A); return A;
  }
  function arteLado(i) {
    const p = PEIXES[i], f = p.f, F = formaDe(i), t = f.t, X = F.x, id = p.id, W = ARTE_W, Hh = ARTE_H;
    const cor = new Array(W * Hh).fill(null), tipo = new Uint8Array(W * Hh), esp = new Float32Array(W * Hh);
    const C = hexC(f.c), Bc = hexC(f.b), N = hexC(f.n), PC = hexC(f.pc || '#2a2a2a');
    const tem = (k) => X.indexOf(k) >= 0, cic = CICLIDEOS.has(id), pacu = PACUS.has(id), enguia = t === 'e';
    const comp = enguia ? 1.15 : 1;
    // --- o perfil (altura e largura ao longo do comprimento; u = 0,5 é o focinho, −0,5 o fim do rabo)
    const nariz = { b: 0.55, c: 0.6, l: 0.32, p: 0.24, a: 0.34, d: 0.5, e: 0.6 }[t] || 0.26, hf = F.hf, wf = F.wf;
    const UP = enguia ? [0.5, 0.46, 0.4, 0.25, 0.1, -0.05, -0.19, -0.31, -0.42, -0.5] : [0.5, 0.465, 0.4, 0.25, 0.1, -0.05, -0.19, -0.31, -0.37, -0.4];
    const HP = enguia ? [0.55, 0.9, 1, 1, 1, 0.98, 0.9, 0.72, 0.42, 0.06] : [nariz * hf[0], (0.62 + 0.38 * nariz) * hf[0], hf[0], hf[1], hf[2], hf[3], hf[4], hf[5], 0.6 * hf[5], 0.56 * hf[5]];
    const WP = enguia ? [0.5, 0.85, 1, 1, 1, 0.95, 0.85, 0.7, 0.45, 0.15] : [0.35 * wf[0], 0.75 * wf[0], wf[0], wf[1], wf[2], wf[3], wf[4], wf[5], 0.45 * wf[5], 0.35 * wf[5]];
    const hAt = (u) => F.H * Math.max(0.02, curva(UP, HP, u)), wAt = (u) => F.W * Math.max(0.05, curva(UP, WP, u));
    const aTop = { b: 0.6, c: 0.66, a: 0.5, d: 0.5, p: 0.53, l: 0.5, e: 0.5 }[t] || 0.52;
    // --- quanto cabe: pixels por comprimento (K) e onde fica o meio (cx, cy)
    const bigode = t === 'b' || tem('L') ? (tem('L') ? 0.2 : 0.11) : 0, bico = tem('S') || tem('P') ? 0.1 : 0;
    const th = F.H * (tem('r') ? 1.35 : 0.95) * (t === 'b' ? 0.9 : 1);
    const dors = t === 'c' ? 0.6 : t === 'b' ? 0.5 : pacu ? 0.42 : 0.34, anal = enguia ? 0.55 : 0.26;
    const cima = Math.max(F.H * aTop + F.H * dors * 0.95, enguia ? 0 : th / 2), baixo = Math.max(F.H * (1 - aTop) + F.H * anal, enguia ? 0 : th / 2);
    const uMin = -0.5 * comp, uMax = 0.5 * comp + Math.max(bico, bigode * 0.9);
    const K = Math.min(68, (W - 5) / (uMax - uMin), (Hh - 5) / (cima + baixo));
    const cx = W / 2 - (uMin + uMax) / 2 * K, cy = 2.5 + cima * K + ((Hh - 5) - (cima + baixo) * K) / 2;
    const Xu = (u) => cx + u * comp * K, Uof = (x) => (x + 0.5 - cx) / (comp * K);
    const put = (x, y, c, tp, e) => { x = Math.round(x); y = Math.round(y); if (x < 0 || y < 0 || x >= W || y >= Hh) return; const k = y * W + x; if (tp === 2 && tipo[k] === 1) return; cor[k] = c; tipo[k] = tp; esp[k] = e == null ? 0.016 : e; };
    const ehCorpo = (x, y) => x >= 0 && y >= 0 && x < W && y < Hh && tipo[y * W + x] === 1;
    // --- o corpo (guarda o alto e o baixo de cada coluna)
    const topo = new Float32Array(W).fill(NaN), base = new Float32Array(W).fill(NaN);
    const x0 = Math.floor(Xu(enguia ? -0.5 : -0.4)), x1 = Math.ceil(Xu(0.5)) - 1;
    for (let x = x0; x <= x1; x++) {
      const u = Uof(x), h = hAt(u) * K, a = cy - h * aTop, b = cy + h * (1 - aTop); topo[x] = a; base[x] = b;
      let y0 = Math.round(a), y1 = Math.round(b) - 1; if (y1 < y0) { y0 = y1 = Math.round((a + b) / 2 - 0.5); }
      const yc = (a + b) / 2, hh = Math.max(0.5, (b - a) / 2), w = wAt(u);
      for (let y = y0; y <= y1; y++) { const k = (y + 0.5 - yc) / hh; put(x, y, C, 1, w * Math.sqrt(Math.max(0.08, 1 - k * k))); }
    }
    // focinho comprido (bicuda, peixe-lenha) ou bico de pato (jurupoca)
    if (tem('S') || tem('P')) {
      const xa = x1 + 1, xb = Math.round(Xu(0.5 + 0.1 / comp)), hb = (base[x1] - topo[x1]), ym = topo[x1] + hb * (tem('P') ? 0.6 : 0.55);
      for (let x = xa; x <= xb; x++) { const s = (x - xa) / Math.max(1, xb - xa), hh = tem('P') ? hb * 0.22 * (s > 0.8 ? 0.7 : 1) : Math.max(0.5, hb * 0.28 * (1 - s)); for (let y = Math.round(ym - hh); y <= Math.round(ym + hh) - 1 || y === Math.round(ym - hh); y++) put(x, y, C, 1, 0.02); topo[x] = ym - hh; base[x] = ym + hh; }
    }
    // --- o rabo
    const xp = Math.round(Xu(-0.37)), xt = Math.round(Xu(-0.5)), uPed = -0.38, hPed = hAt(uPed) * K, ycT = cy + hPed * (0.5 - aTop), thp = th * K;
    const tc = tem('T') ? hexC('#d83020') : N;
    if (!enguia) {
      const red = RABO_REDONDO.has(id), trunc = t === 'c', fundo = pacu || t === 'b' ? 0.45 : 0.72;
      for (let x = xp; x >= xt; x--) {
        const s = (xp - x) / Math.max(1, xp - xt);
        let out, inn = 0;
        if (red) out = s < 0.6 ? lerpN(hPed / 2, thp / 2 * 0.9, suave(s / 0.6)) : thp / 2 * 0.9 * Math.sqrt(Math.max(0, 1 - ((s - 0.6) / 0.42) ** 2));
        else if (trunc) out = lerpN(hPed / 2, thp / 2, s);
        else { out = lerpN(hPed / 2, thp / 2, Math.pow(s, 0.85)); inn = s > 0.3 ? (s - 0.3) / 0.7 * thp / 2 * fundo : 0; }
        for (let y = Math.floor(ycT - out); y <= Math.ceil(ycT + out); y++) {
          const dy = y + 0.5 - ycT; if (Math.abs(dy) > out + 0.3 || Math.abs(dy) < inn) continue;
          let c = tc; if ((Math.round(Math.abs(dy)) % 2) === 0) c = mulC(c, 0.84);
          if (s < 0.18) c = mixC(c, C, 0.45);
          if (f.p === 8) c = ((x + Math.round(Math.abs(dy))) >> 1) % 2 ? PC : N;
          if (f.p === 6 && s > 0.55) c = mixC(c, PC, 0.65);
          if (Math.abs(Math.abs(dy) - out) < 0.8 && s > 0.3) c = claroC(c, 0.12);
          put(x, y, c, 2);
        }
        if (trunc && s > 0.9) { put(x - 1, ycT - out - 1, tc, 2); put(x - 2, ycT - out - 1, tc, 2); put(x - 1, ycT + out, tc, 2); put(x - 2, ycT + out, tc, 2); }
      }
    }
    // --- as nadadeiras: [u da frente, u de trás, altura (fração de H), forma]
    const ND = [], NA = [];
    if (enguia) NA.push([0.28, -0.5, 0.55, 'enguia']);
    else if (cic) { if (id === 'disco') { ND.push([0.32, -0.34, 0.22, 'baixa']); NA.push([0.12, -0.34, 0.22, 'baixa']); } else { ND.push([0.3, -0.3, id.indexOf('tucunare') === 0 ? 0.32 : 0.3, id.indexOf('tucunare') === 0 ? 'dupla' : 'longa']); NA.push([-0.06, -0.32, 0.26, 'longa']); } }
    else if (pacu) { ND.push([0.12, -0.08, 0.42, 'tri']); ND.push([-0.26, -0.32, 0.1, 'adip']); NA.push([-0.04, -0.33, 0.26, 'tri']); }
    else if (t === 'b') { ND.push([0.25, 0.1, 0.5, 'espinho']); ND.push([-0.1, -0.34, 0.13, 'baixa']); NA.push([-0.06, -0.32, 0.2, 'baixa']); }
    else if (t === 'c') { ND.push([0.28, 0.0, 0.6, 'vela']); ND.push([-0.27, -0.32, 0.12, 'adip']); NA.push([-0.14, -0.26, 0.16, 'tri']); }
    else if (id === 'aruana' || id === 'aruanapreto' || id === 'pirarucu') { ND.push([-0.15, -0.4, 0.24, 'baixa']); NA.push([-0.1, -0.4, 0.24, 'baixa']); }
    else if (t === 'l' && (id === 'traira' || id === 'trairao' || id === 'jeju')) { ND.push([0.1, -0.12, 0.32, 'redonda']); NA.push([-0.14, -0.3, 0.24, 'redonda']); }
    else if (t === 'l') { ND.push([-0.06, -0.22, 0.32, 'tri']); ND.push([-0.28, -0.33, 0.1, 'adip']); NA.push([-0.1, -0.32, 0.24, 'tri']); }
    else { ND.push([0.1, -0.06, 0.36, 'tri']); if (!SEM_ADIPOSA.has(id)) ND.push([-0.25, -0.31, 0.1, 'adip']); NA.push([-0.1, -0.3, 0.24, 'tri']); }
    const perfilN = (forma, s, x) => {
      if (forma === 'tri') return s < 0.28 ? s / 0.28 : 1 - (s - 0.28) / 0.72 * 0.8;
      if (forma === 'longa') { let v = 0.55 + 0.45 * suave((s - 0.35) / 0.5); if (s < 0.5 && x % 2) v -= 0.14; if (s > 0.9) v *= 1 - (s - 0.9) / 0.1 * 0.6; return s < 0.06 ? v * s / 0.06 : v; }
      if (forma === 'dupla') { if (s < 0.06) return s / 0.06 * 0.6; if (s < 0.44) return 0.6 - (x % 2) * 0.14; if (s < 0.52) return 0.28; return Math.sin(Math.PI * Math.min(1, (s - 0.52) / 0.48 * 0.92 + 0.08)) * 1.0; }
      if (forma === 'baixa') return (0.8 + 0.2 * Math.sin(Math.PI * s)) * (s < 0.1 ? s / 0.1 : s > 0.9 ? (1 - s) / 0.1 : 1);
      if (forma === 'vela') return Math.pow(Math.sin(Math.PI * Math.min(1, s * 1.08)), 0.65);
      if (forma === 'espinho') return s < 0.14 ? 1 : (1 - (s - 0.14) / 0.86) * 0.85;
      if (forma === 'redonda') return Math.pow(Math.sin(Math.PI * s), 0.6);
      if (forma === 'adip') return Math.sin(Math.PI * s);
      if (forma === 'enguia') return (0.65 + 0.35 * Math.sin(Math.PI * s)) * (0.88 + 0.12 * Math.sin(x * 1.1)) * (s > 0.92 ? (1 - s) / 0.08 : 1);
      return 0;
    };
    const nadadeira = ([u0, u1, alt, forma], emCima) => {
      const xa = Math.round(Xu(u0)), xb = Math.round(Xu(u1));
      for (let x = xa; x >= xb; x--) {
        if (!(topo[x] === topo[x])) continue;
        const s = (xa - x) / Math.max(1, xa - xb), hh = alt * F.H * K * perfilN(forma, s, x); if (hh < 0.5) continue;
        const ad = forma === 'adip';
        for (let k = 0; k < Math.round(hh); k++) {
          const y = emCima ? Math.round(topo[x]) - 1 - k : Math.round(base[x]) + k;
          let c = ad ? mixC(C, N, 0.3) : N;
          if (!ad && (x % 2 === 0)) c = mulC(c, 0.82);
          if (forma === 'espinho' && s < 0.14) c = mulC(N, 0.7);
          if (forma === 'vela' && k === Math.round(hh) - 1 && x % 3 === 0) c = mulC(N, 0.6);
          if (k >= Math.round(hh) - 1 && !ad) c = claroC(c, 0.14);
          if (f.p === 6 && !emCima && s > 0.4) c = mixC(c, PC, 0.5);
          put(x, y, c, 2);
        }
      }
    };
    for (const n of ND) nadadeira(n, true);
    for (const n of NA) nadadeira(n, false);
    if (!enguia) nadadeira([t === 'b' ? 0.02 : 0.07, t === 'b' ? -0.08 : -0.02, t === 'c' ? 0.24 : 0.17, 'tri'], false);   // pélvica
    // --- as cores do corpo: degradê pontilhado, sombras, brilho e a textura da pele
    const escama = t === 'p' || t === 'a' || t === 'l' || t === 'd', placas = t === 'c', liso = t === 'b' || enguia;
    const vb = t === 'b' ? 0.58 : t === 'c' ? 0.74 : enguia ? 0.62 : 0.52;
    for (let x = 0; x < W; x++) {
      if (!(topo[x] === topo[x])) continue;
      const a = topo[x], b = base[x], u = Uof(x);
      for (let y = 0; y < Hh; y++) {
        if (!ehCorpo(x, y)) continue;
        const v = (y + 0.5 - a) / Math.max(1, b - a);
        let c = v < vb - 0.1 ? C : v > vb + 0.1 ? Bc : ((v - (vb - 0.1)) / 0.2 > BAYER[y % 2][x % 2] ? Bc : C);
        if (f.p === 6 && u < 0.05) c = mixC(c, PC, suave((0.05 - u) / 0.4) * 0.55 * (v > 0.3 ? 1 : 0.4));
        if (v < 0.1) c = mulC(c, 0.78); else if (v < 0.2) c = mulC(c, 0.9); else if (v > 0.88) c = mulC(c, 0.84);
        if (!liso && !placas && v > 0.2 && v < 0.3 && u > -0.25 && u < 0.32) c = claroC(c, 0.13);
        if (escama && u < 0.3 && u > -0.37 && v > 0.08 && v < 0.9) {
          const r = Math.floor(y / 3), xx = x + (r % 2) * 2;
          if (y % 3 === 2 && xx % 4 === 0) c = mulC(c, 0.84);
          else if (y % 3 === 0 && xx % 4 === 1) c = claroC(c, 0.07);
          if (f.p === 6 && u < 0 && y % 3 === 2 && xx % 4 <= 1) c = mixC(c, PC, 0.7);
        }
        if (placas) { if (x % 4 === 0 && v > 0.12) c = mulC(c, 0.78); if (y % 4 === 0) c = mulC(c, 0.9); if (sem(i, x * 13 + y * 7) < 0.12) c = claroC(c, 0.15); }
        if (liso && sem(i, x * 31 + y * 17) < 0.06) c = mulC(c, 0.9);
        cor[y * W + x] = c;
      }
    }
    // --- desenhos da espécie (só no corpo)
    const pinta = (x, y, r, c, sobre) => { for (let dy = -Math.ceil(r); dy <= Math.ceil(r); dy++) for (let dx = -Math.ceil(r); dx <= Math.ceil(r); dx++) { if (dx * dx + dy * dy > r * r + 0.6) continue; const xx = Math.round(x + dx), yy = Math.round(y + dy); if (ehCorpo(xx, yy) || (sobre && xx >= 0 && yy >= 0 && xx < W && yy < Hh && cor[yy * W + xx])) cor[yy * W + xx] = c; } };
    const yAt = (x, v) => topo[x] + (base[x] - topo[x]) * v;
    const colX = (u) => Math.round(Xu(u));
    if (f.p === 1) {                                                   // listras em pé (cachara: muitas e finas)
      const fin = id === 'cachara', L = fin ? [0.3, 0.22, 0.14, 0.06, -0.02, -0.1, -0.18, -0.26] : id.indexOf('tucunare') === 0 ? [0.2, 0.03, -0.14] : id === 'aracu' ? [0.26, 0.14, 0.02, -0.1, -0.22] : [0.24, 0.1, -0.04, -0.18];
      for (const u of L) { const xc = colX(u), lw = fin ? 1 : Math.max(2, Math.round(K * 0.035)); for (let x = xc - (lw >> 1); x < xc - (lw >> 1) + lw; x++) { if (!(topo[x] === topo[x])) continue; const ya = Math.round(yAt(x, 0.04)), yb = Math.round(yAt(x, fin ? 0.9 : 0.78)); for (let y = ya; y <= yb; y++) { const xw = fin ? x + Math.round(Math.sin(y * 0.7 + u * 20) * 0.6) : x; if (!fin && (y === yb || y === ya) && sem(i, x + y * 3) < 0.5) continue; if (ehCorpo(xw, y)) cor[y * W + xw] = mixC(cor[y * W + xw], PC, 0.85); } } }
    }
    if (f.p === 2 || f.p === 7) {                                      // pintas (escuras ou claras); piau: 3 manchas grandes no meio
      if (tem('3')) for (const u of [0.18, -0.02, -0.22]) { const xc = colX(u); pinta(xc, yAt(xc, 0.48), Math.max(1.5, K * 0.03), PC); }
      else { const n = Math.round(10 + (F.H * K) * 0.6); for (let k = 0; k < n; k++) { const u = 0.34 - sem(i, k) * 0.7, xc = colX(u); if (!(topo[xc] === topo[xc])) continue; pinta(xc, yAt(xc, 0.12 + sem(i, k + 50) * (f.p === 2 && t === 'b' ? 0.55 : 0.7)), sem(i, k + 90) < 0.3 ? 1.2 : 0.6, f.p === 7 ? claroC(PC, 0.1) : PC); }
        if (id === 'pintado') for (let k = 0; k < 14; k++) { const xc = Math.round(xt + sem(i, k + 200) * (xp - xt)), yc = ycT + (sem(i, k + 210) - 0.5) * thp * 0.8; if (cor[Math.round(yc) * W + xc]) pinta(xc, yc, 0.6, PC, true); } }
    }
    if (f.p === 3) {                                                   // faixa deitada (piaba: azul brilhante no alto; dourado: linhas de pontinhos)
      if (id === 'dourado') { for (let x = 0; x < W; x++) { if (!(topo[x] === topo[x]) || Uof(x) > 0.3) continue; for (let y = 0; y < Hh; y++) if (ehCorpo(x, y) && y % 3 === 1 && (x + (Math.floor(y / 3) % 2)) % 3 === 0) cor[y * W + x] = PC; } }
      else { const v0 = id === 'piaba' ? 0.36 : 0.44, lw = id === 'lenha' || id === 'cuiucuiu' ? 1 : Math.max(1, Math.round(F.H * K * 0.1)); for (let x = colX(0.36); x >= colX(-0.37); x--) { if (!(topo[x] === topo[x])) continue; const y0 = Math.round(yAt(x, v0)); for (let k = 0; k < lw; k++) if (ehCorpo(x, y0 + k)) cor[(y0 + k) * W + x] = id === 'piaba' ? claroC(PC, 0.25 * (k === 0)) : PC; if (id === 'cuiucuiu' && x % 3 === 0 && ehCorpo(x, y0 - 1)) cor[(y0 - 1) * W + x] = claroC(PC, 0.3); } }
    }
    if (f.p === 5) {
      if (id === 'disco') { for (let k = 0; k < 7; k++) { for (let x = colX(0.36); x >= colX(-0.34); x--) { if (!(topo[x] === topo[x])) continue; const y = Math.round(yAt(x, 0.1 + k * 0.13) + Math.sin(x * 0.55 + k) * 1.1); if (ehCorpo(x, y)) cor[y * W + x] = PC; } } }
      else { for (let k = 0; k < 7; k++) { const xc0 = colX(0.36 - k * 0.105); for (let y = 0; y < Hh; y++) { const xw = xc0 + Math.round(Math.sin(y * 0.6 + k) * 1.2); for (let d = 0; d < 2; d++) if (ehCorpo(xw + d, y)) cor[y * W + xw + d] = PC; } } }
    }
    if (f.p === 4 && t !== 'r') { const xc = colX(-0.34); pinta(xc, ycT, 2.6, PC); pinta(xc, ycT, 1.2, [16, 16, 16]); }
    if (tem('o')) { const xc = colX(-0.345); pinta(xc, ycT, 2.4, hexC('#f08030')); pinta(xc, ycT, 1.3, [20, 18, 16]); }
    if (tem('m')) for (let k = 0; k < 5; k++) { const xc = colX(0.22 - k * 0.12); pinta(xc, yAt(xc, 0.5 + (sem(i, k) - 0.5) * 0.4), 1.4 + sem(i, k + 5), hexC('#e86030')); }
    if (tem('w')) for (let k = 0; k < 14; k++) { const xc = colX(0.32 - sem(i, k + 3) * 0.64); if (topo[xc] === topo[xc]) pinta(xc, yAt(xc, 0.12 + sem(i, k + 7) * 0.5), 0.4, hexC('#f8f4e8')); }
    if (tem('k')) { const xc = colX(0.26); pinta(xc, yAt(xc, 0.4), 1.3, [16, 16, 16]); }
    // --- linha lateral, guelra, nadadeira peitoral, olho, boca, dentes e bigodes
    if (!placas) for (let x = colX(0.3); x >= colX(-0.36); x--) { if (!(topo[x] === topo[x])) continue; const y = Math.round(yAt(x, liso ? 0.46 : 0.4)); if (ehCorpo(x, y) && (liso || x % 2 === 0)) cor[y * W + x] = liso ? claroC(cor[y * W + x], 0.22) : claroC(cor[y * W + x], 0.3); }
    { const xg = colX(enguia ? 0.36 : t === 'b' ? 0.31 : 0.3); if (topo[xg] === topo[xg]) for (let y = Math.round(yAt(xg, 0.18)); y <= Math.round(yAt(xg, 0.86)); y++) { const v = (y + 0.5 - topo[xg]) / (base[xg] - topo[xg]), xx = xg - Math.round(Math.sin(Math.PI * v) * 1.6); if (ehCorpo(xx, y)) cor[y * W + xx] = mulC(cor[y * W + xx], 0.66); if (ehCorpo(xx - 1, y)) cor[y * W + xx - 1] = claroC(cor[y * W + xx - 1], 0.1); } }
    if (!enguia) { const xa = colX(0.29), xb = colX(t === 'b' || t === 'c' ? 0.12 : 0.17); for (let x = xa; x >= xb; x--) { if (!(topo[x] === topo[x])) continue; const s = (xa - x) / Math.max(1, xa - xb), yc = yAt(x, 0.64 + s * 0.08), hh = Math.max(0.5, (base[x] - topo[x]) * lerpN(0.12, 0.0, Math.pow(s, 0.8))); for (let y = Math.round(yc - hh); y <= Math.round(yc + hh); y++) if (ehCorpo(x, y)) cor[y * W + x] = mixC(cor[y * W + x], (y % 2 ? mulC(N, 0.8) : N), 0.55 - s * 0.15); } }
    const xo = colX(t === 'b' ? 0.415 : t === 'c' ? 0.37 : enguia ? 0.43 : 0.395), hcab = (base[xo] - topo[xo]) || 4, yo = yAt(xo, t === 'b' || t === 'c' ? 0.3 : 0.36);
    {                                                                  // o olho: íris (clara, ou vermelha), pupila escura para a frente e um pontinho de brilho
      const es = Math.max(2, Math.min(pacu ? 5 : 4, Math.round(hcab * (t === 'b' ? 0.13 : 0.2) + 0.6))), ex = Math.round(xo - es / 2), ey = Math.round(yo - es / 2);
      const iris = tem('R') ? hexC('#d02020') : t === 'b' || t === 'c' ? hexC('#cfc6a4') : hexC('#f0e2b0');
      for (let dy = 0; dy < es; dy++) for (let dx = 0; dx < es; dx++) { if (es >= 3 && (dx === 0 || dx === es - 1) && (dy === 0 || dy === es - 1)) continue; if (ehCorpo(ex + dx, ey + dy)) cor[(ey + dy) * W + ex + dx] = iris; }
      const ps = es >= 3 ? 2 : 1, px0 = ex + es - ps - (es >= 4 ? 1 : 0), py0 = ey + (es >= 4 ? 1 : es - ps);
      for (let dy = 0; dy < ps; dy++) for (let dx = 0; dx < ps; dx++) if (ehCorpo(px0 + dx, py0 + dy)) cor[(py0 + dy) * W + px0 + dx] = [14, 14, 16];
      if (es >= 3 && ehCorpo(px0, py0)) cor[py0 * W + px0] = [250, 250, 244];
      if (es >= 3) for (let dx = 0; dx < es; dx++) if (ehCorpo(ex + dx, ey - 1) && dx > 0 && dx < es - 1) cor[(ey - 1) * W + ex + dx] = mulC(cor[(ey - 1) * W + ex + dx], 0.75);   // a "sobrancelha" (sombra em cima do olho)
    }
    { const xm = Math.round(Xu(0.5)) - 1, ym = Math.round(yAt(Math.min(W - 1, xm), id.indexOf('aruana') === 0 ? 0.3 : 0.56)), up = id.indexOf('aruana') === 0;
      for (let k = 0; k < Math.max(2, Math.round(K * 0.04)); k++) { const x = xm - k, y = up ? ym + Math.round(k * 0.6) : ym; if (ehCorpo(x, y)) cor[y * W + x] = mulC(cor[y * W + x], 0.45); }
      if (tem('d')) for (let k = 1; k < 4; k += 1) { const x = xm - k; if (ehCorpo(x, ym + 1)) cor[(ym + 1) * W + x] = k % 2 ? [248, 248, 240] : cor[(ym + 1) * W + x]; if (k % 2 && ehCorpo(x, ym - 1)) cor[(ym - 1) * W + x] = [248, 248, 240]; }
      if (t === 'b' || tem('L')) {                                    // bigodes: um em cima (longo nos 'L') e dois no queixo
        const Lb = (tem('L') ? 0.2 : 0.1) * K, bc = mixC(N, [230, 220, 200], 0.35);
        for (let k = 0; k <= Lb; k++) { const x = xm + 1 + k, y = Math.round(yAt(Math.min(W - 1, xm), 0.42) - Math.sin(k / Lb * 2.2) * Lb * 0.18 + (k / Lb) * Lb * 0.25); put(x, y, bc, 2, 0.01); }
        for (const [vv, LL] of [[0.85, 0.55], [0.9, 0.4]]) for (let k = 0; k <= Lb * LL; k++) put(xm - 1 + k * 0.7, yAt(Math.min(W - 1, xm), vv) + k * 0.55, bc, 2, 0.01);
      }
      if (tem('B')) { const bc = mulC(N, 0.9); for (let k = 0; k < Math.round(K * 0.1); k++) put(xm + k, base[Math.min(W - 1, xm)] - 1 + k * 0.15, bc, 2, 0.01); }
    }
    // --- o contorno (um pixel escuro em volta, puxando para a cor vizinha)
    const fora = [];
    for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) {
      if (cor[y * W + x]) continue; let viz = null, e = 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= W || yy >= Hh) continue; const k = yy * W + xx; if (cor[k] && tipo[k] !== 3) { if (!viz || tipo[k] === 1) { viz = cor[k]; e = tipo[k] === 1 ? esp[k] * 0.8 : 0.014; } } }
      if (viz) fora.push([y * W + x, mixC(mulC(viz, 0.32), [22, 14, 8], 0.35), e]);
    }
    for (const [k, c, e] of fora) { cor[k] = c; tipo[k] = 3; esp[k] = Math.max(0.01, e); }
    return { w: W, h: Hh, cor, tipo, esp, K: K * comp, cx, cy, deCima: false };
  }
  // a arraia (de cima): disco com ocelos laranja, olhos em cima, borda mais clara, rabo com ferrão
  function arteArraia(i) {
    const p = PEIXES[i], f = p.f, W = ARTE_W, Hh = ARTE_H, cor = new Array(W * Hh).fill(null), tipo = new Uint8Array(W * Hh), esp = new Float32Array(W * Hh);
    const C = hexC(f.c), N = hexC(f.n), PC = hexC(f.pc || '#e88030'), rx = 19, ry = 21, cxD = 49, cy = 24, K = 2 * rx + 26;
    const put = (x, y, c, tp, e) => { x = Math.round(x); y = Math.round(y); if (x < 0 || y < 0 || x >= W || y >= Hh) return; const k = y * W + x; cor[k] = c; tipo[k] = tp; esp[k] = e; };
    for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) {
      const nx = (x + 0.5 - cxD) / rx, ny = (y + 0.5 - cy) / ry, r = Math.hypot(nx, ny); if (r > 1) continue;
      let c = C; if (r > 0.86) c = claroC(C, 0.12); else if (sem(i, x * 11 + y * 5) < 0.12) c = mulC(C, 0.88);
      if (r < 0.5 && nx > -0.2 && Math.abs(ny) < 0.25) c = mulC(c, 0.92);
      put(x, y, c, 1, 0.13 * Math.sqrt(Math.max(0.05, 1 - r * r)));
    }
    for (const sg of [-1, 1]) for (let k = 0; k < 7; k++) for (let j = 0; j < 4 - (k >> 1); j++) put(cxD - rx + 3 - k * 0.5 + j, cy + sg * (ry - 7 + k), mulC(C, 0.9), 2, 0.02);   // as pélvicas
    for (let x = cxD - rx; x >= cxD - rx - 26; x--) { const s = (cxD - rx - x) / 26, hh = lerpN(2.2, 0.5, s); for (let y = Math.round(cy - hh); y <= Math.round(cy + hh) - 1 || y === Math.round(cy - hh); y++) put(x, y, (x % 3 === 0 ? mulC(N, 0.8) : N), 1, 0.03 * (1 - s) + 0.01); }
    for (let k = 0; k < 6; k++) put(cxD - rx - 12 - k, cy - 2 - (k >> 1), [232, 224, 200], 2, 0.008);   // o ferrão
    const ang = 2.39996;                                                // ocelos em espiral (ângulo de ouro): anel escuro, laranja e o miolo
    for (let k = 0; k < 11; k++) {
      const rr = 0.22 + 0.62 * Math.sqrt((k + 0.5) / 11), a = k * ang + sem(i, k) * 0.4, x = cxD + Math.cos(a) * rr * rx * 0.92, y = cy + Math.sin(a) * rr * ry * 0.92;
      for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) { const d = Math.hypot(dx, dy), xx = Math.round(x + dx), yy = Math.round(y + dy), q = yy * W + xx; if (xx < 0 || yy < 0 || xx >= W || yy >= Hh || tipo[q] !== 1) continue; if (d <= 0.8) cor[q] = mixC(PC, [250, 236, 140], 0.55); else if (d <= 2.1) cor[q] = PC; else if (d <= 3.0) cor[q] = mulC(C, 0.5); }
    }
    for (const sg of [-1, 1]) { const x = cxD + 9, y = cy + sg * 4; put(x, y, [16, 16, 16], 1, 0.15); put(x + 1, y, [16, 16, 16], 1, 0.15); put(x - 1, y, mulC(C, 0.6), 1, 0.15); put(x - 3, y + sg, mulC(C, 0.45), 1, 0.13); put(x, y - 1, claroC(C, 0.3), 1, 0.15); }
    const fora = [];
    for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) { if (cor[y * W + x]) continue; let viz = null; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < W && yy < Hh && cor[yy * W + xx] && tipo[yy * W + xx] !== 3) viz = cor[yy * W + xx]; } if (viz) fora.push([y * W + x, mixC(mulC(viz, 0.32), [22, 14, 8], 0.35)]); }
    for (const [k, c] of fora) { cor[k] = c; tipo[k] = 3; esp[k] = 0.012; }
    return { w: W, h: Hh, cor, tipo, esp, K, cx: cxD - 13, cy, deCima: true };
  }
  // o BAGRE-TROVÃO (fora do catálogo): 112×64, de lado, a cabeça para a direita. Corpo de bagre (cabeça larga e achatada, barriga reta),
  //   azul de tempestade com nuvens escuras nas costas, um RAIO descendo pelo flanco, pintinhas elétricas, a nadadeira de cima em pontas de
  //   raio, o rabo serrilhado, as bordas das nadadeiras estalando, o olho de ouro e os bigodes compridos que brilham.
  //   luz[k] = 1 marca o que acende no escuro (vira uma segunda malha, sem sombra, um pouco para fora do corpo).
  function arteBagre() {
    if (cacheArte.has('bagre')) return cacheArte.get('bagre');
    const W = 112, Hh = 64, NN = W * Hh, cor = new Array(NN).fill(null), tipo = new Uint8Array(NN), esp = new Float32Array(NN), luz = new Uint8Array(NN);
    const K = 96, cx = 52, cy = 31, Hm = 0.235, Wm = 0.19, aTop = 0.6;
    const COSTA = hexC('#15214a'), FLANCO = hexC('#2b4c92'), BARRIGA = hexC('#c4cfea'), NAD = hexC('#222963'), RAIO = hexC('#86eeff'), NUC = hexC('#fdfbe6'), AZUL = hexC('#3c8cff'), OURO = hexC('#ffd447');
    const UP = [0.5, 0.46, 0.4, 0.3, 0.16, 0.02, -0.14, -0.27, -0.36, -0.4];
    const HP = [0.3, 0.5, 0.72, 0.9, 1, 0.94, 0.76, 0.54, 0.34, 0.31];
    const WP = [0.75, 0.98, 1, 0.98, 0.88, 0.76, 0.58, 0.42, 0.3, 0.28];
    const Xu = (u) => cx + u * K, Uof = (x) => (x + 0.5 - cx) / K, colX = (u) => Math.round(Xu(u));
    const hAt = (u) => Hm * curva(UP, HP, u), wAt = (u) => Wm * curva(UP, WP, u);
    const den = (x, y) => x >= 0 && y >= 0 && x < W && y < Hh;
    const put = (x, y, c, tp, e, l) => { x = Math.round(x); y = Math.round(y); if (!den(x, y)) return; const k = y * W + x; if (tp === 2 && tipo[k] === 1) return; cor[k] = c; tipo[k] = tp; esp[k] = e == null ? 0.016 : e; luz[k] = l ? 1 : 0; };
    const ehCorpo = (x, y) => den(x, y) && tipo[y * W + x] === 1;
    const tem = (x, y) => den(x, y) && !!cor[y * W + x];
    const pinta = (x, y, c, l) => { x = Math.round(x); y = Math.round(y); if (!tem(x, y)) return; cor[y * W + x] = c; if (l != null) luz[y * W + x] = l ? 1 : 0; };
    const reta = (xa, ya, xb, yb, fn) => { const n = Math.max(1, Math.ceil(Math.max(Math.abs(xb - xa), Math.abs(yb - ya)))); for (let k = 0; k <= n; k++) fn(Math.round(xa + (xb - xa) * k / n), Math.round(ya + (yb - ya) * k / n), k / n); };
    const ruido = (x, y) => Math.sin(x * 0.31 + y * 0.17) + Math.sin(x * 0.13 - y * 0.41 + 1.3) + Math.sin((x + y) * 0.21 + 2.1);
    const hs = (k) => { const v = Math.sin(k * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
    // --- o corpo
    const topo = new Float32Array(W).fill(NaN), base = new Float32Array(W).fill(NaN);
    const x0 = colX(-0.4), x1 = colX(0.5) - 1;
    for (let x = x0; x <= x1; x++) {
      const u = Uof(x), h = hAt(u) * K, a = cy - h * aTop, b = cy + h * (1 - aTop); topo[x] = a; base[x] = b;
      const yc = (a + b) / 2, hh = Math.max(0.5, (b - a) / 2), w = wAt(u);
      for (let y = Math.round(a); y <= Math.round(b) - 1; y++) { const k = (y + 0.5 - yc) / hh; put(x, y, FLANCO, 1, w * Math.sqrt(Math.max(0.08, 1 - k * k))); }
    }
    for (const [dx, dy] of [[0, 0], [-1, 0], [0, 1]]) { const x = x1 + dx, y = Math.round(topo[x1]) + dy; if (ehCorpo(x, y)) { cor[y * W + x] = null; tipo[y * W + x] = 0; } }   // o focinho arredondado
    const yAt = (x, v) => topo[x] + (base[x] - topo[x]) * v;
    // --- o rabo: bifurcado, o lobo de cima mais comprido, a borda de trás serrilhada
    const xp = colX(-0.37), xt = colX(-0.5), hP = hAt(-0.38) * K, ycT = cy + hP * (0.5 - aTop);
    const lobo = [];
    for (let x = xp; x >= xt; x--) {
      const s = (xp - x) / Math.max(1, xp - xt), sup = lerpN(hP / 2, 17, Math.pow(s, 0.75)), inf = s < 0.86 ? lerpN(hP / 2, 13, Math.pow(s, 0.8)) : -1;
      const inn = s > 0.22 ? (s - 0.22) / 0.78 * 11 : 0, serr = s > 0.4 && x % 3 === 0 ? 1.6 : 0;
      lobo.push({ x, s, sup, inf, inn });
      for (let y = Math.floor(ycT - sup - serr); y <= Math.ceil(ycT + Math.max(0, inf) + serr); y++) {
        const dy = y + 0.5 - ycT;
        if (dy < 0 ? -dy > sup + serr + 0.3 : (inf < 0 || dy > inf + serr + 0.3)) continue;
        if (Math.abs(dy) < inn) continue;
        let c = NAD; if (Math.round(Math.abs(dy)) % 2 === 0) c = mulC(c, 0.8); if (s < 0.16) c = mixC(c, FLANCO, 0.55);
        put(x, y, c, 2, 0.014);
      }
    }
    // --- as nadadeiras: a de cima em pontas de raio, a adiposa comprida, a anal ondulada e a pélvica
    const crista = [[0, 1], [0.34, 0.48], [0.39, 0.84], [0.66, 0.36], [0.71, 0.62], [1, 0.1]];
    const perfil = (L, s) => { for (let k = 0; k < L.length - 1; k++) if (s <= L[k + 1][0]) return lerpN(L[k][1], L[k + 1][1], (s - L[k][0]) / (L[k + 1][0] - L[k][0])); return L[L.length - 1][1]; };
    { const xa = colX(0.215), xb = colX(0.03);
      for (let x = xa; x >= xb; x--) {
        const s = (xa - x) / (xa - xb), hh = Math.round(0.155 * K * perfil(crista, s));
        for (let k = 0; k < hh; k++) { const y = Math.round(topo[x]) - 1 - k; let c = x >= xa - 1 ? mixC(NAD, NUC, 0.3) : x % 2 ? mulC(NAD, 0.8) : NAD; if (k < 2) c = mixC(c, FLANCO, 0.4); put(x, y, c, 2, 0.016); }
      } }
    { const xa = colX(-0.13), xb = colX(-0.31);
      for (let x = xa; x >= xb; x--) { const s = (xa - x) / (xa - xb), hh = Math.round(0.046 * K * Math.pow(Math.sin(Math.PI * s), 0.6)); for (let k = 0; k < hh; k++) put(x, Math.round(topo[x]) - 1 - k, mixC(FLANCO, NAD, 0.55), 2, 0.02); } }
    { const xa = colX(-0.07), xb = colX(-0.33);
      for (let x = xa; x >= xb; x--) { const s = (xa - x) / (xa - xb), env = s < 0.1 ? s / 0.1 : s > 0.88 ? (1 - s) / 0.12 : 1, hh = Math.round((0.058 * K * (0.78 + 0.22 * Math.sin(Math.PI * s)) + Math.sin(x * 1.3) * 0.8) * env);
        for (let k = 0; k < hh; k++) put(x, Math.round(base[x]) + k, x % 2 ? mulC(NAD, 0.82) : NAD, 2, 0.014); } }
    { const xa = colX(0.05), xb = colX(-0.035);
      for (let x = xa; x >= xb; x--) { const s = (xa - x) / (xa - xb), hh = Math.round(0.07 * K * (s < 0.25 ? s / 0.25 : 1 - (s - 0.25) / 0.75 * 0.85)); for (let k = 0; k < hh; k++) put(x, Math.round(base[x]) + k, x % 2 ? mulC(NAD, 0.82) : NAD, 2, 0.014); } }
    // --- as cores do corpo: costas escuras com nuvens, flanco azul, barriga clara (degradê pontilhado)
    for (let x = x0; x <= x1; x++) {
      const a = topo[x], b = base[x], u = Uof(x);
      for (let y = 0; y < Hh; y++) {
        if (!ehCorpo(x, y)) continue;
        const v = (y + 0.5 - a) / Math.max(1, b - a);
        let c = v < 0.44 ? mixC(COSTA, FLANCO, suave(v / 0.44)) : FLANCO;
        if (v > 0.56) c = v > 0.72 ? BARRIGA : ((v - 0.56) / 0.16 > BAYER[y % 2][x % 2] ? BARRIGA : FLANCO);
        if (v < 0.5) { const n = ruido(x, y); if (n > 1.35) c = mulC(c, 0.78); else if (n < -1.7) c = claroC(c, 0.08); }
        if (u > 0.3 && v < 0.36) c = mulC(c, 0.86);
        if (v < 0.09) c = mulC(c, 0.72); else if (v > 0.9) c = mulC(c, 0.8);
        if (v > 0.18 && v < 0.26 && u > -0.3 && u < 0.36) c = claroC(c, 0.1);
        if (v > 0.74 && (y % 3 === 0) && hs(x * 7 + y) < 0.3) c = mulC(c, 0.92);
        cor[y * W + x] = c;
      }
    }
    // --- pintinhas elétricas nas costas
    for (let k = 0; k < 22; k++) {
      const u = 0.3 - hs(k + 3) * 0.64, x = colX(u); if (!(topo[x] === topo[x])) continue;
      const y = Math.round(yAt(x, 0.12 + hs(k + 40) * 0.26));
      if (hs(k + 90) < 0.3) { pinta(x, y, NUC, 1); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) pinta(x + dx, y + dy, RAIO, 1); }
      else pinta(x, y, RAIO, 1);
    }
    // --- o RAIO no flanco (núcleo claro, brilho ciano e um halo azul) e dois galhos
    const raio = (pts, grosso) => {
      for (let k = 0; k < pts.length - 1; k++) {
        const [xa, ya] = pts[k], [xb, yb] = pts[k + 1];
        reta(xa, ya, xb, yb, (x, y) => {
          if (grosso) { pinta(x, y - 2, mixC(cor[(y - 2) * W + x] || FLANCO, AZUL, 0.55)); pinta(x, y + 2, mixC(cor[(y + 2) * W + x] || FLANCO, AZUL, 0.55)); pinta(x, y - 1, RAIO, 1); pinta(x, y + 1, RAIO, 1); pinta(x, y, NUC, 1); }
          else { pinta(x, y - 1, mixC(cor[(y - 1) * W + x] || FLANCO, AZUL, 0.45)); pinta(x, y + 1, mixC(cor[(y + 1) * W + x] || FLANCO, AZUL, 0.45)); pinta(x, y, RAIO, 1); }
        });
      }
    };
    { const pts = []; let x = colX(0.26), sg = -1, q = 0;
      while (x > colX(-0.34)) { const u = Uof(x), f = clampN((0.26 - u) / 0.6, 0, 1), amp = lerpN(3.4, 1.4, f) * (0.6 + hs(q + 7) * 0.7); pts.push([x, Math.round(yAt(x, lerpN(0.3, 0.52, f)) + sg * amp)]); if (hs(q + 21) > 0.2) sg = -sg; x -= 4 + Math.round(hs(q + 33) * 4); q++; }
      pts.push([colX(-0.355), Math.round(yAt(colX(-0.355), 0.52))]); raio(pts, true);
      const g1 = pts[2], g2 = pts[5];
      raio([g1, [g1[0] - 3, g1[1] - 4], [g1[0] - 2, g1[1] - 7], [g1[0] - 6, g1[1] - 10]], false);
      raio([g2, [g2[0] - 3, g2[1] + 3], [g2[0] - 2, g2[1] + 6], [g2[0] - 5, g2[1] + 8]], false); }
    // --- a guelra (com as fendas acesas)
    { const xg = colX(0.325); for (let y = Math.round(yAt(xg, 0.16)); y <= Math.round(yAt(xg, 0.84)); y++) { const v = (y + 0.5 - topo[xg]) / (base[xg] - topo[xg]), xx = xg - Math.round(Math.sin(Math.PI * v) * 2); pinta(xx, y, mulC(cor[y * W + xx] || FLANCO, 0.6)); if (y % 3 === 0 && v > 0.3 && v < 0.7) pinta(xx - 1, y, RAIO, 1); } }
    // --- a nadadeira peitoral (grande, por cima do corpo, apontando para trás e para baixo): o espinho da frente serrilhado
    { const xa = colX(0.31), xb = colX(0.1), y0 = yAt(xa, 0.66);
      for (let x = xa; x >= xb; x--) {
        const s = (xa - x) / (xa - xb), yc = y0 + s * 7, hh = lerpN(1.2, 4.3, Math.pow(s, 0.7)) * (s > 0.84 ? 1 - (s - 0.84) / 0.16 * 0.6 : 1);
        for (let y = Math.round(yc - hh); y <= Math.round(yc + hh); y++) {
          let c = mixC(NAD, FLANCO, 0.2); if (((y - Math.round(yc) + Math.round(s * 3)) & 1) === 0) c = mulC(c, 0.8);
          if (y === Math.round(yc - hh)) c = mixC(NAD, NUC, 0.32);
          if (s > 0.8 && y >= Math.round(yc + hh) - 1) { c = RAIO; }
          const k = y * W + x; if (!den(x, y)) continue;
          if (tipo[k] === 1) { cor[k] = c; luz[k] = c === RAIO ? 1 : 0; } else put(x, y, c, 2, 0.014, c === RAIO);
        }
        if (x % 3 === 0) { const y = Math.round(yc - hh) - 1; if (den(x, y)) { const k = y * W + x; if (tipo[k] === 1) cor[k] = mixC(NAD, NUC, 0.25); else put(x, y, mixC(NAD, NUC, 0.25), 2, 0.012); } }
      } }
    // --- o olho de ouro (pupila em fenda, brilho) e a "sobrancelha" elétrica
    { const xo = colX(0.43), yo = Math.round(yAt(xo, 0.3)), ex = xo - 2, ey = yo - 2;
      for (let dy = -1; dy < 5; dy++) for (let dx = -1; dx < 5; dx++) { const borda = dx < 0 || dy < 0 || dx > 3 || dy > 3; if (borda && !((dx < 0 || dx > 3) && (dy < 0 || dy > 3))) pinta(ex + dx, ey + dy, mixC(COSTA, [10, 8, 20], 0.5)); }
      for (let dy = 0; dy < 4; dy++) for (let dx = 0; dx < 4; dx++) { if ((dx === 0 || dx === 3) && (dy === 0 || dy === 3)) continue; pinta(ex + dx, ey + dy, dy < 2 ? claroC(OURO, 0.25) : OURO, 1); }
      for (let dy = 0; dy < 4; dy++) pinta(ex + 2, ey + dy, [18, 12, 30], 1);
      pinta(ex + 1, ey + 1, NUC, 1);
      for (let dx = -1; dx < 5; dx++) pinta(ex + dx, ey - 2 - (dx > 2 ? 1 : 0), dx % 2 ? RAIO : NUC, 1); }
    // --- a boca larga (lábio claro, dentinhos)
    const xm = x1, ym = Math.round(yAt(xm, 0.62));
    for (let k = 0; k < 11; k++) { const x = xm - k, y = ym + (k > 7 ? 1 : 0); pinta(x, y, [18, 12, 34]); pinta(x, y - 1, mixC(FLANCO, BARRIGA, 0.45)); if (k === 1 || k === 3 || k === 5) pinta(x, y + 1, NUC); }
    // --- os bigodes: dois compridos (um sobe e enrola, o outro desce), em zigue-zague como raio, e três curtinhos no queixo
    const bigs = new Set();
    const bigode = (pts) => {
      let tot = 0; for (let k = 0; k < pts.length - 1; k++) tot += Math.hypot(pts[k + 1][0] - pts[k][0], pts[k + 1][1] - pts[k][1]);
      let ac = 0;
      for (let k = 0; k < pts.length - 1; k++) {
        const [xa, ya] = pts[k], [xb, yb] = pts[k + 1], L = Math.hypot(xb - xa, yb - ya);
        reta(xa, ya, xb, yb, (x, y, t) => { const f = (ac + L * t) / tot, c = mixC(OURO, NUC, f * 0.7); if (!ehCorpo(x, y)) { put(x, y, c, 2, 0.012, true); bigs.add(y * W + x); } if (f < 0.4 && !ehCorpo(x, y + 1) && den(x, y + 1)) { put(x, y + 1, mulC(OURO, 0.8), 2, 0.012, true); bigs.add((y + 1) * W + x); } });
        ac += L;
      }
    };
    bigode([[xm - 7, ym - 1], [xm - 2, ym - 3], [xm + 3, ym - 4], [xm + 7, ym - 7], [xm + 9, ym - 11], [xm + 8, ym - 15], [xm + 5, ym - 18], [xm + 1, ym - 19], [xm - 2, ym - 21]]);
    bigode([[xm - 6, ym + 1], [xm - 1, ym + 3], [xm + 4, ym + 4], [xm + 8, ym + 7], [xm + 10, ym + 11], [xm + 9, ym + 15], [xm + 6, ym + 18], [xm + 2, ym + 19]]);
    for (const [u, L] of [[0.475, 6], [0.445, 7], [0.415, 5]]) { const x = colX(u), yb = Math.round(base[x]); for (let k = 0; k < L; k++) { const xx = x + Math.round(k * 0.35), c = k >= L - 2 ? OURO : mulC(OURO, 0.72); if (!tem(xx, yb + k)) { put(xx, yb + k, c, 2, 0.01, k >= L - 2); bigs.add((yb + k) * W + xx); } } }
    // --- os raios nos lobos do rabo
    for (const sg of [-1, 1]) {
      const pts = []; let k = 0;
      for (const L of lobo) { if (L.s < 0.1 || (sg > 0 && L.inf < 0)) continue; if (k++ % 3) continue; const out = sg < 0 ? L.sup : L.inf; pts.push([L.x, Math.round(ycT + sg * (L.inn + (out - L.inn) * 0.5) + ((pts.length % 2) ? 1.2 : -1.2))]); }
      for (let q = 0; q < pts.length - 1; q++) reta(pts[q][0], pts[q][1], pts[q + 1][0], pts[q + 1][1], (x, y) => { if (tem(x, y) && tipo[y * W + x] === 2) { cor[y * W + x] = q < 1 ? RAIO : NUC; luz[y * W + x] = 1; } });
    }
    // --- a borda das nadadeiras estalando (um pixel aceso, outro não)
    { const borda = [];
      for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) { const k = y * W + x; if (tipo[k] !== 2 || luz[k] || bigs.has(k)) continue; let fora = false; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!tem(x + dx, y + dy)) fora = true; if (fora) borda.push(k); }
      for (const k of borda) { const x = k % W, y = (k / W) | 0; if ((x + y) % 2 === 0) { cor[k] = mixC(NAD, RAIO, 0.8); luz[k] = 1; } else cor[k] = mixC(NAD, RAIO, 0.4); } }
    // --- o contorno (escuro; perto do que brilha, puxa para o azul)
    const fora = [];
    for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) {
      if (cor[y * W + x]) continue; let viz = null, e = 0, acesa = false;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const xx = x + dx, yy = y + dy; if (!den(xx, yy)) continue; const k = yy * W + xx; if (cor[k] && tipo[k] !== 3 && !bigs.has(k)) { if (luz[k]) acesa = true; if (!viz || tipo[k] === 1) { viz = cor[k]; e = tipo[k] === 1 ? esp[k] * 0.8 : 0.012; } } }
      if (viz) fora.push([y * W + x, acesa ? mixC(mulC(AZUL, 0.55), [10, 10, 30], 0.3) : mixC(mulC(viz, 0.3), [12, 10, 26], 0.4), e]);
    }
    for (const [k, c, e] of fora) { cor[k] = c; tipo[k] = 3; esp[k] = Math.max(0.01, e); }
    const A = { w: W, h: Hh, cor, tipo, esp, luz, K, cx, cy, deCima: false };
    cacheArte.set('bagre', A); return A;
  }
  // só o que acende, um pouco mais grosso (fica por fora do corpo) e mais claro
  function arteBagreLuz() {
    if (cacheArte.has('bagreLuz')) return cacheArte.get('bagreLuz');
    const A = arteBagre(), n = A.cor.length, cor = new Array(n).fill(null), esp = new Float32Array(n);
    for (let k = 0; k < n; k++) if (A.luz[k] && A.cor[k]) { cor[k] = claroC(A.cor[k], 0.12); esp[k] = A.esp[k] + 0.008; }
    const L = Object.assign({}, A, { cor, esp }); cacheArte.set('bagreLuz', L); return L;
  }
  // o DESENHO num canvas (guardado); silhueta = peixe ainda não pescado (só a sombra, sem detalhe)
  const cacheIcone = new Map();
  function iconePeixe(i, silhueta) {
    const ch = i + (silhueta ? 's' : ''); if (cacheIcone.has(ch)) return cacheIcone.get(ch);
    const A = artePeixe(i), cv = document.createElement('canvas'); cv.width = A.w; cv.height = A.h;
    const g = cv.getContext('2d'), im = g.createImageData(A.w, A.h), d = im.data;
    for (let k = 0; k < A.cor.length; k++) { const c = A.cor[k]; if (!c) continue; const s = silhueta ? (A.tipo[k] === 3 ? [16, 10, 4] : [42, 28, 16]) : c; d[k * 4] = Math.max(0, Math.min(255, s[0])); d[k * 4 + 1] = Math.max(0, Math.min(255, s[1])); d[k * 4 + 2] = Math.max(0, Math.min(255, s[2])); d[k * 4 + 3] = 255; }
    g.putImageData(im, 0, 0); cacheIcone.set(ch, cv); return cv;
  }

  // ================================================================== o módulo (um por cidade aberta)
  function criar(api) {
    const S = () => api.S();
    const CP = api.CASA_PESCA, QP = api.QUADRO_PESCA, CX = (CP.x0 + CP.x1) / 2, CZ = (CP.z0 + CP.z1) / 2;
    // lugares no píer (o píer vai de x -54 a -37, z 54,4 a 56,2; o tabuado fica a 0,42 m): o jogador pesca perto da ponta, virado
    //   para o oeste (o meio do lago); o Cadu senta na quina sul da ponta, com as pernas para fora, virado para o sul (fica um pouco à
    //   frente e à esquerda do jogador: a câmera, atrás do jogador, vê os dois pescando).
    const PONTA = { x: -52.7, z: 55.0 }, YAW_BASE = Math.PI, Y_PIER = 0.42, Y_AGUA = 0.05;
    const LUGAR_CADU = { x: -53.55, z: 56.02, yaw: -Math.PI / 2 }, BALDE = { x: -52.95, z: 56.0 }, ISOPOR = { x: -51.85, z: 54.75 };
    // o caminho do Cadu: pela rede até o fim da trilha do lago (x -41) e depois areia → píer → o lugar dele
    const DESTINO_CADU = { x: -41, z: 46, fim: [[-36.8, 49.8], [-36.6, 53.4], [-37.4, 55.3], [-51.4, 55.3], [LUGAR_CADU.x, 55.5]] };
    const H_CADU_CHEGA = 6, H_CADU_SAI = 20, H_ABRE = 6, H_FECHA = 20, CAIXA_MAX = 30;
    const BALCAO = { x: CX + 0.85, z: CP.z1 + 0.62 }, QUADRO = { x: CX + QP.u, z: CP.z1 + 0.55 };
    const P = { cadu: null, caduRua: null, bene: null, mg: null, quadro: null, texQuadro: null, verQuadro: -1, persiana: null, isopor: null, balde: null,
      cp: null, versao: 0, tAviso: 0, montado: false, fx: [], raios: [], flash: 0, flashEl: null, cenaBene: null, painel: null, css: false };

    // ---------------------------------------------------------------- dados salvos
    function dadosP() {
      const d = S().dados, p = d.pesca || (d.pesca = {});
      if (!Array.isArray(p.varas)) p.varas = []; if (!p.iscas || typeof p.iscas !== 'object') p.iscas = {}; if (!Array.isArray(p.caixa)) p.caixa = []; if (!p.cat || typeof p.cat !== 'object') p.cat = {};
      if (p.vara == null || p.varas.indexOf(p.vara) < 0) p.vara = p.varas.length ? p.varas[p.varas.length - 1] : null;
      if (p.isca == null || p.isca < 0 || p.isca > 7) p.isca = 0;
      return p;
    }
    const temVara = () => dadosP().varas.length > 0;
    const nIsca = (k) => dadosP().iscas[k] | 0;
    const totalIscas = () => ISCAS.reduce((s, _, k) => s + nIsca(k), 0);
    const descobertos = () => Object.keys(dadosP().cat).length;
    const gravar = () => { try { api.gravar(S().dados.ponto || 'chegada'); } catch (e) { /* sem save */ } };
    const hora = () => S().dados.hora;
    const fimDeSemana = () => !!(api.fimDeSemana && api.fimDeSemana());
    const caduNoLago = () => fimDeSemana() && hora() >= H_CADU_CHEGA && hora() < H_CADU_SAI;
    const aberta = () => hora() >= H_ABRE && hora() < H_FECHA;
    const grupo = () => { const s = S(); return s.grupoCidade || s.grupo; };
    const V3 = new THREE.Vector3();
    const mundo = (o) => { o.getWorldPosition(V3); return { x: V3.x - api.OX, y: V3.y, z: V3.z }; };   // posição na cidade (o grupo da cidade fica em x = OX)
    const listaNpcs = () => { const s = S(); return s.dentro && s.fora ? s.fora.npcs : s.npcs; };
    function aviso(txt, seg) { api.aviso(txt); P.tAviso = seg || 3; }

    // ---------------------------------------------------------------- modelos: gente, vara, boia, linha, isopor, balde, peixe
    const acha = (lista, n) => Math.max(0, lista.findIndex((x) => x.nome === n));
    function modelo(ap, fem, roupa, cores) {
      const s = S(); let m = null, opt = null;
      try { if (s.f2 && s.f2.modeloPessoa) { const r = s.f2.modeloPessoa({ ap, fem, roupa, cores }); m = r.m; opt = r.opt; } } catch (e) { console.warn('[Pesca] modelo:', e); }
      if (!m) { opt = Object.assign({ camisa: cores[0], listra: cores[0], gola: cores[2], calcao: cores[1], meia: cores[1], sola: '#e6e6e0', corTexto: '#F2F2EE', numero: '', nome: ' ', fundoNome: 'rgba(0,0,0,0)', manga: 0, meiao: 1, cabecao: 1, escala: 1 }, ap); m = makeAthlete(opt); m.etiqueta.visible = false; m.sombra.visible = false; }
      return { m, opt };
    }
    // os mesmos óculos do Cadu (mercado.js / fase1.js)
    function oculos(m, opt) {
      const kc = (opt && opt.cabecao) || 1, Lg = new Lote(), c = 0x111118;
      const xf = 0.258 * kc, yo = 1.36 + 0.245 * kc + 0.035, zo = 0.0975 * kc, gw = 0.17 * kc, gh = 0.15 * kc, e = 0.03 * kc, d = 0.04 * kc;
      for (const sz of [-1, 1]) {
        const zc = sz * zo;
        Lg.caixa(d, e, gw, c, xf, yo + gh / 2 - e / 2, zc); Lg.caixa(d, e, gw, c, xf, yo - gh / 2 + e / 2, zc);
        Lg.caixa(d, gh, e, c, xf, yo, zc - gw / 2 + e / 2); Lg.caixa(d, gh, e, c, xf, yo, zc + gw / 2 - e / 2);
        Lg.caixa(0.03 * kc, e, 0.09 * kc, c, 0.25 * kc, yo + 0.04 * kc, sz * 0.215 * kc);
        Lg.caixa(0.24 * kc, e, e, c, 0.13 * kc, yo + 0.04 * kc, sz * 0.256 * kc);
      }
      Lg.caixa(d, e, 0.06 * kc, c, xf, yo + 0.03 * kc, 0);
      m.corpo.add(Lg.malha(MAT_CORES));
    }
    function chapeu(m, tipo) {                                          // 'palha' (Bené) ou 'bone' (Cadu no lago)
      const G = new api.Geo();
      if (tipo === 'palha') { G.box(0.78, 0.04, 0.78, '#d8b860', 0, 1.93, 0); G.box(0.5, 0.17, 0.5, '#e0c470', 0, 1.96, 0); G.box(0.51, 0.05, 0.51, '#8a3a2a', 0, 1.98, 0); }
      else { G.box(0.54, 0.13, 0.55, '#2a6a8a', -0.02, 1.9, 0); G.box(0.24, 0.035, 0.42, '#2a6a8a', 0.34, 1.9, 0); G.box(0.1, 0.06, 0.12, '#f2f2ee', 0.25, 1.95, 0); }
      m.corpo.add(G.malha(api.MAT));
    }
    // a VARA: 4 pedaços encadeados (o cabo e 3 da vara) para ela VERGAR; a origem é onde a mão segura. +y = do cabo para a ponta.
    function criarVara(v) {
      const V = VARAS[v], raiz = new THREE.Group(), segs = [], Ls = (V.L - 0.45) / 3;
      let pai = raiz;
      for (let k = 0; k < 4; k++) {
        const g = new THREE.Group(), G = new api.Geo();
        if (k === 0) {
          G.box(0.05, 0.45, 0.05, V.cores[1], 0, -0.2, 0);                  // cabo (de 20 cm atrás da mão até 25 cm à frente)
          G.box(0.032, Ls, 0.032, V.cores[0], 0, 0.25, 0);
          if (V.molinete) { G.box(0.03, 0.08, 0.03, '#8a8a90', 0.05, -0.02, 0); G.box(0.07, 0.07, 0.09, V.cores[2], 0.1, -0.05, 0); G.box(0.02, 0.05, 0.05, '#d8d8d8', 0.1, -0.03, 0.06); }
        } else G.box([0.032, 0.025, 0.018][k - 1], Ls, [0.032, 0.025, 0.018][k - 1], V.cores[0], 0, 0, 0);
        if (v === 0) for (let y = 0.3; y < Ls; y += 0.36) G.box(0.04, 0.025, 0.04, V.cores[1], 0, (k === 0 ? 0.25 : 0) + y, 0);   // os nós do bambu
        G.box(0.02, 0.02, 0.035, V.cores[2], 0, (k === 0 ? 0.25 : 0) + Ls * 0.5, 0);   // passador da linha
        g.add(G.malha(api.MAT)); g.position.y = k === 0 ? 0 : (k === 1 ? 0.25 + Ls : Ls); pai.add(g); segs.push(g); pai = g;
      }
      const ponta = new THREE.Object3D(); ponta.position.y = Ls; pai.add(ponta);
      return { raiz, segs, ponta, v };
    }
    function vergar(Vr, b) { for (let k = 1; k < 4; k++) Vr.segs[k].rotation.z = b * [0, 0.22, 0.32, 0.42][k]; }
    // na mão direita (antebraço = cotovelo): o ângulo deixa a vara para a frente e uns 40° para cima na pose de segurar
    function varaNaMao(m, Vr) { Vr.raiz.position.set(0, -0.27, 0); Vr.raiz.rotation.set(0, 0, -2.47); m.bracoD.cotovelo.add(Vr.raiz); }
    function tirarVara(Vr) { if (Vr && Vr.raiz.parent) Vr.raiz.parent.remove(Vr.raiz); }
    // (6.6.0) a BOIA (bico branco, faixa amarela, cabeça vermelha e a antena) — a origem fica na linha d'água
    function criarBoia() {
      const G = new api.Geo();
      G.box(0.034, 0.03, 0.034, '#f4f4ec', 0, -0.085, 0); G.box(0.072, 0.056, 0.072, '#f4f4ec', 0, -0.058, 0); G.box(0.08, 0.014, 0.08, '#f2c230', 0, -0.004, 0);
      G.box(0.08, 0.052, 0.08, '#e83a2a', 0, 0.01, 0); G.box(0.05, 0.022, 0.05, '#c8281c', 0, 0.062, 0); G.box(0.012, 0.085, 0.012, '#1c1c1f', 0, 0.084, 0); G.box(0.02, 0.02, 0.02, '#e83a2a', 0, 0.166, 0);
      const m = G.malha(api.MAT); m.visible = false; grupo().add(m); return m;
    }
    // o ANZOL com o CHUMBINHO e a ISCA (uma de cada tipo, só a da vez fica visível). Origem = o olho do anzol (a linha chega aqui de cima).
    //   Tudo um pouco maior que o de verdade, para dar para ver da câmera.
    function criarAnzol() {
      const g = new THREE.Group(), A = new api.Geo(), pr = '#c8ccd2';
      A.box(0.026, 0.026, 0.026, '#7a7e86', 0, 0.06, 0); A.box(0.014, 0.012, 0.014, '#9aa0a8', 0, 0.086, 0);             // o chumbinho
      A.box(0.008, 0.065, 0.008, pr, 0, -0.065, 0); A.box(0.014, 0.008, 0.008, pr, 0, 0.0, 0);                           // a haste e o olho
      A.box(0.034, 0.008, 0.008, pr, 0.013, -0.072, 0); A.box(0.008, 0.03, 0.008, pr, 0.028, -0.066, 0); A.box(0.007, 0.007, 0.008, '#e8ecf0', 0.022, -0.045, 0);   // a curva, a ponta e a farpa
      g.add(A.malha(api.MAT));
      const iscas = ISCAS.map((_, k) => {
        const G = new api.Geo();
        if (k === 0) { for (const [x, y, c] of [[-0.012, -0.02, '#c86a5a'], [0.008, -0.04, '#a84a3a'], [0.022, -0.058, '#c86a5a'], [0.03, -0.034, '#a84a3a'], [-0.016, -0.06, '#c86a5a'], [-0.02, -0.085, '#a84a3a']]) G.box(0.022, 0.026, 0.02, c, x, y, 0); }
        else if (k === 1) { G.box(0.05, 0.046, 0.046, '#e8d8b0', 0.01, -0.075, 0); G.box(0.04, 0.012, 0.04, '#f4ead0', 0.006, -0.03, 0); G.box(0.012, 0.01, 0.02, '#fff8e8', 0.022, -0.04, 0.02); }
        else if (k === 2) { for (const [x, y] of [[0, -0.022], [0.002, -0.048], [0.02, -0.07]]) { G.box(0.024, 0.024, 0.02, '#f2d040', x, y, 0); G.box(0.01, 0.01, 0.022, '#e0b020', x + 0.006, y + 0.012, 0); } }
        else if (k === 3) { G.box(0.056, 0.022, 0.022, '#6a8a3a', 0.008, -0.058, 0); G.box(0.02, 0.02, 0.02, '#4a6a2a', 0.044, -0.056, 0); for (const sx of [-0.016, 0.004, 0.024]) G.box(0.006, 0.026, 0.03, '#4a6a2a', sx, -0.078, 0); G.box(0.004, 0.03, 0.004, '#2a3a1a', 0.05, -0.04, 0.006); }
        else if (k === 4) { for (const [x, y, w] of [[0.026, -0.03, 0.022], [0.016, -0.05, 0.024], [0.0, -0.064, 0.024], [-0.018, -0.066, 0.02]]) G.box(w, 0.02, 0.02, '#f0a080', x, y, 0); G.box(0.016, 0.03, 0.026, '#e07050', -0.032, -0.072, 0); G.box(0.006, 0.006, 0.026, '#101010', 0.034, -0.016, 0); G.box(0.03, 0.003, 0.003, '#c86040', 0.05, -0.012, 0); }
        else if (k === 5) { G.box(0.044, 0.042, 0.042, '#a8402a', 0.012, -0.072, 0); G.box(0.012, 0.012, 0.012, '#d86a4a', 0.02, -0.044, 0.016); G.box(0.006, 0.018, 0.006, '#4a3a20', 0.012, -0.03, 0); G.box(0.024, 0.006, 0.014, '#5a8a3a', 0.024, -0.02, 0); }
        else if (k === 6) { G.box(0.1, 0.02, 0.016, '#5a6a5a', 0.012, -0.075, 0); G.box(0.08, 0.008, 0.017, '#8a9a8a', 0.012, -0.079, 0); G.box(0.02, 0.026, 0.004, '#4a5a4a', -0.044, -0.079, 0); G.box(0.006, 0.006, 0.018, '#101010', 0.052, -0.068, 0); }
        else { G.box(0.074, 0.026, 0.02, '#3fb7f0', 0.012, -0.08, 0); G.box(0.07, 0.01, 0.021, '#f2f2ee', 0.012, -0.08, 0); G.box(0.008, 0.008, 0.022, '#101010', 0.04, -0.066, 0); G.box(0.026, 0.018, 0.004, '#d8d8d8', 0.06, -0.074, 0);
          for (const dx of [-0.012, 0.0, 0.012]) G.box(0.004, 0.022, 0.004, pr, -0.01 + dx, -0.104, dx * 0.6); }
        const mm = G.malha(api.MAT); mm.visible = false; g.add(mm); return mm;
      });
      g.iscas = iscas; g.visible = false; grupo().add(g); return g;
    }
    function iscaNoAnzol(g, k) { g.iscas.forEach((m, q) => { m.visible = q === k; }); }
    const MAT_LINHA = new THREE.LineBasicMaterial({ color: 0xe8e8e0, transparent: true, opacity: 0.8 });
    function criarLinha() {
      const N = 16, g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(new Array(N * 3).fill(0), 3));
      const l = new THREE.Line(g, MAT_LINHA); l.frustumCulled = false; l.visible = false; grupo().add(l); return l;
    }
    // a linha da ponta da vara (a) até a boia/peixe (b), com barriga (sag) — quanto mais tensa, mais reta
    // a altura da superfície num ponto: o tabuado (píer/deque) ou o chão; na água, a água
    function superficie(x, z) { let y = 0; try { y = api.altura(x, z) || 0; } catch (e) { /* ok */ } if (api.dentroLago(x, z, 0) && !(api.naDeque && api.naDeque(x, z))) y = Math.max(y, Y_AGUA); return y; }
    function linhaDe(L, a, b, sag) {
      const pos = L.geometry.attributes.position, N = pos.count;
      for (let k = 0; k < N; k++) {
        const t = k / (N - 1), x = a.x + (b.x - a.x) * t, z = a.z + (b.z - a.z) * t; let y = a.y + (b.y - a.y) * t - sag * 4 * t * (1 - t);
        if (k > 0 && k < N - 1) y = Math.max(y, superficie(x, z) + 0.02);   // (6.6.1) a linha fica POR CIMA da madeira (píer, deque) e do chão, não atravessa
        pos.setXYZ(k, x, y, z);
      }
      pos.needsUpdate = true; L.visible = true;
    }
    function criarIsopor() {
      const G = new api.Geo(); G.box(0.56, 0.36, 0.4, '#f4f4ec', 0, 0, 0); G.box(0.58, 0.02, 0.42, '#d8d8d0', 0, 0.36, 0);
      const corpo = G.malha(api.MAT), g = new THREE.Group(); g.add(corpo);
      const T2 = new api.Geo(); T2.box(0.58, 0.06, 0.42, '#3a64b8', 0, 0, 0.21); T2.box(0.2, 0.03, 0.06, '#f2f2ee', 0, 0.06, 0.38);
      const tampa = T2.malha(api.MAT); tampa.position.set(0, 0.38, -0.21); g.add(tampa); g.tampa = tampa;
      g.position.set(ISOPOR.x, Y_PIER, ISOPOR.z); g.rotation.y = 0.15; g.visible = false; grupo().add(g); return g;
    }
    function criarBalde() {
      const G = new api.Geo(); G.box(0.3, 0.32, 0.3, '#2f7fb8', 0, 0, 0); G.box(0.32, 0.03, 0.32, '#3a8ac8', 0, 0.3, 0); G.box(0.26, 0.02, 0.26, '#5a9ad0', 0, 0.24, 0);
      const m = G.malha(api.MAT); m.position.set(BALDE.x, Y_PIER, BALDE.z); m.visible = false; grupo().add(m); return m;
    }
    // (6.6.0) o PEIXE 3D sai da MESMA pixel art: cada pixel vira um bloquinho (frente e trás com a cor do pixel; os lados só onde o vizinho
    //   é mais fino), com a grossura do corpo naquele ponto — o peixe tem volume e mostra todos os detalhes do desenho.
    //   Comprimento 1 (cabeça para +x), centrado; a escala é o comprimento de verdade (ver comprimentoDe). A arraia fica deitada.
    const geoPeixes = new Map();
    function geoDeArte(A) {
      const pos = [], nor = [], col = [], W = A.w, H = A.h, K = A.K, E = (x, y) => (x < 0 || y < 0 || x >= W || y >= H || !A.cor[y * W + x] ? 0 : Math.round(A.esp[y * W + x] * 400) / 400);
      const P = (x, y, z) => (A.deCima ? [(x - A.cx) / K, z, (y - A.cy) / K] : [(x - A.cx) / K, (A.cy - y) / K, z]);
      const Nn = (nx, ny, nz) => (A.deCima ? [nx, nz, -ny] : [nx, ny, nz]);
      const quad = (a, b, c, d, n, k) => { for (const v of [a, b, c, a, c, d]) { pos.push(v[0], v[1], v[2]); nor.push(n[0], n[1], n[2]); col.push(k[0], k[1], k[2]); } };
      const cc = (c) => [Math.max(0, Math.min(255, c[0])) / 255, Math.max(0, Math.min(255, c[1])) / 255, Math.max(0, Math.min(255, c[2])) / 255];
      for (let y = 0; y < H; y++) {
        let x = 0;
        while (x < W) {                                                   // frente e trás: juntando os pixels iguais vizinhos da linha
          const c = A.cor[y * W + x]; if (!c) { x++; continue; }
          const e = E(x, y); let x2 = x + 1; while (x2 < W && A.cor[y * W + x2] === c && E(x2, y) === e) x2++;
          const h = e / 2, k = cc(c);
          const f = A.deCima ? [P(x, y, h), P(x2, y, h), P(x2, y + 1, h), P(x, y + 1, h)] : [P(x, y + 1, h), P(x2, y + 1, h), P(x2, y, h), P(x, y, h)];
          const t = A.deCima ? [P(x, y + 1, -h), P(x2, y + 1, -h), P(x2, y, -h), P(x, y, -h)] : [P(x2, y + 1, -h), P(x, y + 1, -h), P(x, y, -h), P(x2, y, -h)];
          if (A.deCima) { quad(f[3], f[2], f[1], f[0], Nn(0, 0, 1), k); quad(t[3], t[2], t[1], t[0], Nn(0, 0, -1), k); }
          else { quad(f[0], f[1], f[2], f[3], Nn(0, 0, 1), k); quad(t[0], t[1], t[2], t[3], Nn(0, 0, -1), k); }
          x = x2;
        }
      }
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {          // os lados: só a parte que fica para fora do vizinho
        const c = A.cor[y * W + x]; if (!c) continue; const e = E(x, y), k = cc(mulC(c, 0.86));
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const en = E(x + dx, y + dy); if (en >= e) continue;
          const faixas = en > 0 ? [[en / 2, e / 2], [-e / 2, -en / 2]] : [[-e / 2, e / 2]];
          for (const [z0, z1] of faixas) {
            let a, b, c2, d, n;
            if (dx === 1) { a = P(x + 1, y + 1, z0); b = P(x + 1, y + 1, z1); c2 = P(x + 1, y, z1); d = P(x + 1, y, z0); n = [1, 0, 0]; }
            else if (dx === -1) { a = P(x, y + 1, z1); b = P(x, y + 1, z0); c2 = P(x, y, z0); d = P(x, y, z1); n = [-1, 0, 0]; }
            else if (dy === 1) { a = P(x, y + 1, z1); b = P(x + 1, y + 1, z1); c2 = P(x + 1, y + 1, z0); d = P(x, y + 1, z0); n = [0, -1, 0]; }
            else { a = P(x, y, z0); b = P(x + 1, y, z0); c2 = P(x + 1, y, z1); d = P(x, y, z1); n = [0, 1, 0]; }
            const nn = Nn(n[0], n[1], n[2]);
            // a ordem dos cantos tem que olhar para fora (confere pela normal)
            const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = d[0] - a[0], vy = d[1] - a[1], vz = d[2] - a[2];
            const cx2 = uy * vz - uz * vy, cy2 = uz * vx - ux * vz, cz2 = ux * vy - uy * vx;
            if (cx2 * nn[0] + cy2 * nn[1] + cz2 * nn[2] < 0) quad(a, d, c2, b, nn, k); else quad(a, b, c2, d, nn, k);
          }
        }
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
      g.computeBoundingSphere(); return g;
    }
    function geoPeixe(i) { if (geoPeixes.has(i)) return geoPeixes.get(i); const g = geoDeArte(artePeixe(i)); geoPeixes.set(i, g); return g; }
    function malhaPeixe(i, kg) { const m = new THREE.Mesh(geoPeixe(i), api.MAT), L = comprimentoDe(i, kg); m.scale.setScalar(L); m.userData.L = L; return m; }

    // ---------------------------------------------------------------- água: anéis e respingos (poucos objetos, reaproveitados)
    let geoAnel = null, geoGota = null;
    function anel(x, z, tam, forca) {
      if (!geoAnel) { geoAnel = new THREE.RingGeometry(0.82, 1, 20); geoAnel.rotateX(-Math.PI / 2); geoGota = new THREE.BoxGeometry(0.05, 0.05, 0.05); }
      const m = new THREE.Mesh(geoAnel, new THREE.MeshBasicMaterial({ color: 0xf4fbff, transparent: true, opacity: 0.8, depthWrite: false }));
      m.position.set(x, Y_AGUA + 0.03, z); m.renderOrder = 6; m.scale.setScalar(0.08); grupo().add(m);
      P.fx.push({ m, t: 0, dur: 1.1 + (forca || 0) * 0.6, tam: tam || 0.9, tipo: 'anel' });
    }
    function respingo(x, z, n, forca) {
      anel(x, z, 0.6 + (forca || 0) * 0.8, forca);
      for (let k = 0; k < (n || 6); k++) {
        const m = new THREE.Mesh(geoGota, new THREE.MeshBasicMaterial({ color: 0xe8f6ff, transparent: true, opacity: 0.95 }));
        const a = Math.random() * 6.28, v = 0.8 + Math.random() * 1.6 * (1 + (forca || 0));
        m.position.set(x, Y_AGUA + 0.05, z); grupo().add(m);
        P.fx.push({ m, t: 0, dur: 0.9, vx: Math.cos(a) * v * 0.6, vy: 2 + Math.random() * 2 * (1 + (forca || 0)), vz: Math.sin(a) * v * 0.6, tipo: 'gota' });
      }
    }
    function tickFx(dt) {
      for (let k = P.fx.length - 1; k >= 0; k--) {
        const e = P.fx[k]; e.t += dt; const u = Math.min(1, e.t / e.dur);
        if (e.fn) e.fn(e, u, dt);
        else if (e.tipo === 'anel') { e.m.scale.setScalar(0.08 + e.tam * suave(u)); e.m.material.opacity = 0.8 * (1 - u); }
        else { e.vy -= 9.8 * dt; e.m.position.x += e.vx * dt; e.m.position.y += e.vy * dt; e.m.position.z += e.vz * dt; if (e.m.position.y < Y_AGUA) e.t = e.dur; e.m.material.opacity = 0.95 * (1 - u * 0.6); }
        if (e.t >= e.dur) { if (e.m.parent) e.m.parent.remove(e.m); e.m.material.dispose(); P.fx.splice(k, 1); }
      }
    }

    // ---------------------------------------------------------------- efeitos da tempestade: brilho, faíscas, vapor, anel colorido, RAIOS e o clarão
    let texHalo = null;
    function halo(cor, tam, op) {                                        // um brilho redondo (soma luz; não liga para a neblina)
      if (!texHalo) {
        const cv = document.createElement('canvas'); cv.width = cv.height = 64; const g = cv.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
        gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.22, 'rgba(255,255,255,0.6)'); gr.addColorStop(0.55, 'rgba(255,255,255,0.16)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = gr; g.fillRect(0, 0, 64, 64); texHalo = new THREE.CanvasTexture(cv);
      }
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: texHalo, color: cor, transparent: true, opacity: op == null ? 0.8 : op, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
      s.scale.set(tam, tam, 1); s.renderOrder = 8; return s;
    }
    // o BAGRE-TROVÃO em 3D: a pixel art em bloquinhos (como os outros peixes), mais a malha do que acende (sem sombra) e um brilho em volta
    let geoBagre = null, geoBagreLuz = null, matBagreLuz = null;
    function malhaBagre(kg) {
      if (!geoBagre) { geoBagre = geoDeArte(arteBagre()); geoBagreLuz = geoDeArte(arteBagreLuz()); matBagreLuz = new THREE.MeshBasicMaterial({ vertexColors: true, fog: false }); }
      const m = new THREE.Mesh(geoBagre, api.MAT), L = Math.cbrt(Math.max(1, kg) / K_FORMA.b); m.scale.setScalar(L); m.userData.L = L;
      m.add(new THREE.Mesh(geoBagreLuz, matBagreLuz));
      const h = halo(0x5fd8ff, 1.5, 0.3); m.add(h); m.userData.halo = h; m.userData.bagre = true;
      return m;
    }
    function tirarMalha(o) { if (!o) return; if (o.parent) o.parent.remove(o); o.traverse((q) => { if (q.isSprite && q.material) q.material.dispose(); }); }
    const geoCubo = new THREE.BoxGeometry(1, 1, 1);
    function faiscas(x, y, z, n, forca, cor) {
      for (let k = 0; k < n; k++) {
        const m = new THREE.Mesh(geoCubo, new THREE.MeshBasicMaterial({ color: cor || (Math.random() < 0.55 ? 0xbff6ff : 0xfff3b0), transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
        const tam = 0.035 + Math.random() * 0.05, a = Math.random() * 6.28, v = (1.4 + Math.random() * 3) * (forca || 1);
        m.scale.setScalar(tam); m.position.set(x, y, z); m.renderOrder = 9; grupo().add(m);
        P.fx.push({ m, t: 0, dur: 0.3 + Math.random() * 0.45, vx: Math.cos(a) * v * 0.7, vy: (0.4 + Math.random() * 0.9) * v, vz: Math.sin(a) * v * 0.7, tam, fn: tickFaisca });
      }
    }
    function tickFaisca(e, u, dt) { e.vy -= 7 * dt; e.m.position.x += e.vx * dt; e.m.position.y += e.vy * dt; e.m.position.z += e.vz * dt; e.m.scale.setScalar(e.tam * (1 - u * 0.75)); e.m.material.opacity = u > 0.5 ? 2 * (1 - u) : 1; }
    function vapor(x, z, n) {                                            // fumacinha redonda subindo da água
      for (let k = 0; k < n; k++) {
        const m = halo(0xc8d4e2, 1, 0.3); m.material.blending = THREE.NormalBlending; const tam = 0.7 + Math.random() * 0.6;
        m.scale.set(tam, tam, 1); m.position.set(x + rnd(-0.6, 0.6), Y_AGUA + 0.2, z + rnd(-0.6, 0.6)); m.renderOrder = 7; grupo().add(m);
        P.fx.push({ m, t: 0, dur: 1.6 + Math.random() * 0.9, vy: 0.5 + Math.random() * 0.6, tam, fn: tickVapor });
      }
    }
    function tickVapor(e, u, dt) { e.m.position.y += e.vy * dt; const k = e.tam * (1 + u * 1.6); e.m.scale.set(k, k, 1); e.m.material.opacity = 0.3 * (1 - u) * Math.min(1, u * 6); }
    function anelCor(x, z, tam, cor, dur) {
      if (!geoAnel) anel(0, -900, 0.1);
      const m = new THREE.Mesh(geoAnel, new THREE.MeshBasicMaterial({ color: cor, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
      m.position.set(x, Y_AGUA + 0.035, z); m.renderOrder = 7; m.scale.setScalar(0.1); grupo().add(m);
      P.fx.push({ m, t: 0, dur: dur || 1.2, tam, fn: (e, u) => { e.m.scale.setScalar(0.1 + e.tam * suave(u)); e.m.material.opacity = 0.9 * (1 - u); } });
    }
    function brilhoEm(x, y, z, tam, dur, cor) {
      const s = halo(cor || 0x9fe8ff, tam * 0.5, 0.9); s.position.set(x, y, z); grupo().add(s);
      P.fx.push({ m: s, t: 0, dur: dur || 0.8, tam, fn: (e, u) => { const k = e.tam * (0.5 + 0.5 * suave(u * 2)); e.m.scale.set(k, k, 1); e.m.material.opacity = 0.9 * (1 - u); } });
    }
    // um RAIO: um caminho torto de a até b (com galhos). Cada pedaço é um núcleo quase branco e um brilho ciano por fora.
    //   o = { desce (segundos até tocar: em câmera lenta na cena), esp, galhos, aoTocar, some (segundos apagando) }. Aparece de a para b.
    const V_CIMA = new THREE.Vector3(0, 1, 0), V_DIR = new THREE.Vector3();
    function criarRaio(a, b, o) {
      o = o || {};
      const g = new THREE.Group(), segs = [], esp = o.esp || 0.12;
      const nucleo = new THREE.MeshBasicMaterial({ color: 0xf4fbff, transparent: true, opacity: 1, depthWrite: false, fog: false });
      const brilho = new THREE.MeshBasicMaterial({ color: 0x6fdcff, transparent: true, opacity: 0.42, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
      const pedaco = (p, q, e, ord) => {
        const dx = q.x - p.x, dy = q.y - p.y, dz = q.z - p.z, L = Math.hypot(dx, dy, dz) || 0.01; V_DIR.set(dx / L, dy / L, dz / L);
        for (const [mat, k] of [[nucleo, 1], [brilho, 3.8]]) {
          const ms = new THREE.Mesh(geoCubo, mat); ms.position.set((p.x + q.x) / 2, (p.y + q.y) / 2, (p.z + q.z) / 2); ms.quaternion.setFromUnitVectors(V_CIMA, V_DIR);
          ms.scale.set(e * k, L + e * k * 0.4, e * k); ms.renderOrder = 9; ms.visible = false; ms.frustumCulled = false; g.add(ms); segs.push({ m: ms, ord });
        }
      };
      const caminho = (p, q, n, desvio, e, ord0, ordL, galhos) => {
        let ant = p; const pts = [p];
        for (let k = 1; k <= n; k++) {
          const u = k / n, j = k === n ? 0 : desvio * (1 - u * 0.35);
          const c = { x: lerpN(p.x, q.x, u) + (Math.random() - 0.5) * 2 * j, y: lerpN(p.y, q.y, u) + (k === n ? 0 : (Math.random() - 0.5) * j * 0.5), z: lerpN(p.z, q.z, u) + (Math.random() - 0.5) * 2 * j };
          pedaco(ant, c, e, ord0 + u * ordL); pts.push(c); ant = c;
        }
        for (let k = 0; k < (galhos || 0); k++) {
          const i = 1 + Math.floor(Math.random() * Math.max(1, n - 3)), s = pts[i], L = Math.hypot(q.x - p.x, q.y - p.y, q.z - p.z) * (0.12 + Math.random() * 0.18), ang = Math.random() * 6.28, sy = Math.sign(q.y - p.y) || -1;
          caminho(s, { x: s.x + Math.cos(ang) * L * 0.7, y: s.y + sy * L * 0.7, z: s.z + Math.sin(ang) * L * 0.7 }, 4, L * 0.18, e * 0.5, ord0 + i / n * ordL, ordL * 0.3, 0);
        }
      };
      const L = Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z), n = Math.max(4, Math.min(22, Math.round(L / 1.6)));
      caminho(a, b, n, o.desvio != null ? o.desvio : Math.min(2.2, L * 0.07), esp, 0, 1, o.galhos == null ? 3 : o.galhos);
      grupo().add(g);
      const R = { g, segs, nucleo, brilho, t: 0, desce: o.desce || 0.1, some: o.some || 0.5, aoTocar: o.aoTocar, tocou: false, b };
      P.raios.push(R); return R;
    }
    function tickRaios(dt) {
      for (let k = P.raios.length - 1; k >= 0; k--) {
        const R = P.raios[k]; R.t += dt; const frente = R.t / R.desce;
        for (const s of R.segs) s.m.visible = s.ord <= frente;
        if (frente >= 1 && !R.tocou) { R.tocou = true; if (R.aoTocar) try { R.aoTocar(R); } catch (e) { console.error(e); } }
        if (frente >= 1) {
          const tf = R.t - R.desce, op = tf < 0.08 ? 1 : tf < 0.13 ? 0.12 : tf < 0.24 ? 1 : tf < 0.29 ? 0.2 : tf < 0.4 ? 0.9 : Math.max(0, 0.9 - (tf - 0.4) / R.some);
          R.nucleo.opacity = op; R.brilho.opacity = op * 0.45;
          if (tf > 0.4 + R.some) { if (R.g.parent) R.g.parent.remove(R.g); R.nucleo.dispose(); R.brilho.dispose(); P.raios.splice(k, 1); }
        }
      }
    }
    // o CLARÃO: a tela clareia (por cima de tudo, sem pegar o toque) e a cidade também (a luz do relâmpago do clima)
    function relampago(k) {
      P.flash = Math.max(P.flash || 0, k);
      try { const C = S().clima; if (C) C.flash = Math.max(C.flash || 0, k * 1.2); } catch (e) { /* sem clima */ }
      if (!P.flashEl) { const el = document.createElement('div'); el.id = 'pcFlash'; el.style.cssText = 'position:fixed;inset:0;z-index:12;pointer-events:none;background:#eaf6ff;opacity:0'; (document.getElementById('raizJogo') || document.body).appendChild(el); P.flashEl = el; }
    }
    function tickFlash(dt) {
      if (!P.flashEl) return;
      P.flash = Math.max(0, (P.flash || 0) - dt * 3); P.flashEl.style.opacity = String(Math.min(0.88, P.flash * 0.8));
      if (P.flash <= 0) { P.flashEl.remove(); P.flashEl = null; }
    }
    // animações por quadro para as cenas: fn(t, dt) devolve true quando acabou
    const anims = [];
    function animar(fn) { return new Promise((ok) => anims.push({ fn, ok, t: 0 })); }
    function tickAnims(dt) { for (let k = anims.length - 1; k >= 0; k--) { const a = anims[k]; a.t += dt; let fim = true; try { fim = a.fn(a.t, dt); } catch (e) { console.error(e); } if (fim) { anims.splice(k, 1); a.ok(); } } }

    // ---------------------------------------------------------------- a casinha: persiana (fechada à noite) e o QUADRO do catálogo
    function criarPersiana() {
      const cv = document.createElement('canvas'); cv.width = 32; cv.height = 64; const g = cv.getContext('2d');
      for (let y = 0; y < 64; y += 4) { g.fillStyle = (y / 4) % 2 ? '#8a9a8c' : '#a4b2a4'; g.fillRect(0, y, 32, 4); g.fillStyle = '#5f6e62'; g.fillRect(0, y + 3, 32, 1); }
      const tx = new THREE.CanvasTexture(cv); tx.magFilter = THREE.NearestFilter; tx.minFilter = THREE.NearestFilter; tx.generateMipmaps = false;
      const m = new THREE.Mesh(new THREE.BoxGeometry(2.42, 2.15, 0.05), new THREE.MeshLambertMaterial({ map: tx }));
      m.position.set(BALCAO.x, 2.15 / 2, CP.z1 + 0.03); m.visible = false; grupo().add(m); return m;
    }
    function criarQuadro() {
      const cv = document.createElement('canvas'); cv.width = 512; cv.height = 320;
      const tx = new THREE.CanvasTexture(cv); tx.magFilter = THREE.NearestFilter; tx.minFilter = THREE.LinearFilter; tx.generateMipmaps = false;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(QP.w, QP.h), new THREE.MeshLambertMaterial({ map: tx, emissive: 0x222222, emissiveMap: tx }));
      m.position.set(CX + QP.u, QP.y + QP.h / 2, CP.z1 + 0.046); grupo().add(m); P.texQuadro = tx; P.cvQuadro = cv; return m;
    }
    function desenharQuadro() {                                          // (6.6.0) 512×320: cada peixe numa plaquinha de 48×44 com o desenho novo
      const cv = P.cvQuadro; if (!cv) return; const g = cv.getContext('2d'), p = dadosP();
      g.imageSmoothingEnabled = false; g.fillStyle = '#3a2414'; g.fillRect(0, 0, 512, 320);
      g.fillStyle = '#f0a020'; g.font = "bold 22px Silkscreen, 'Courier New', monospace"; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(tr('Catálogo do lago').toUpperCase(), 256, 20);
      PEIXES.forEach((pe, i) => {
        const c = i % 10, l = Math.floor(i / 10), x = 12 + c * 49, y = 40 + l * 44, tem = !!p.cat[i];
        g.fillStyle = tem ? COR_RAR[pe.r] : '#5a3a20'; g.fillRect(x, y, 47, 42); g.fillStyle = tem ? '#f4ead2' : '#2e1c0e'; g.fillRect(x + 2, y + 2, 43, 38);
        g.imageSmoothingEnabled = true; g.drawImage(iconePeixe(i, !tem), 0, 0, ARTE_W, ARTE_H, x + 2, y + 8, 43, 26); g.imageSmoothingEnabled = false;
      });
      g.fillStyle = '#fff0c8'; g.font = "bold 16px Silkscreen, 'Courier New', monospace"; g.fillText(trf('Descobertos: {0}/60', descobertos()), 256, 306);
      P.texQuadro.needsUpdate = true; P.verQuadro = P.versao;
    }

    // ---------------------------------------------------------------- O CADU NO LAGO (sábado e domingo, 6h–20h) e o BENÉ na casinha
    const AP_CADU = () => ({ pele: PELES_FITZ[3].cor, cabelo: CORES_CABELO[1].cor, estilo: acha(ESTILOS_CABELO, 'Franja'), rosto: acha(ROSTOS, 'Padrão'), labio: 2, barba: 0 });
    function criarCaduPescador() {
      const { m, opt } = modelo(AP_CADU(), false, 0, ['#3a8a6a', '#d8c39a', '#f2f2ee', '#f2f2ee']);   // camiseta verde, bermuda cáqui e boné
      oculos(m, opt); chapeu(m, 'bone');
      const A = api.atorDe(m, opt, 'pescaNPC'); A.vel = 1.9; return A;
    }
    const AP_BENE = () => ({ pele: PELES_FITZ[4].cor, cabelo: CORES_CABELO[7].cor, estilo: acha(ESTILOS_CABELO, 'Ralo'), rosto: acha(ROSTOS, 'Sorridente'), labio: 3, barba: acha(ESTILOS_BARBA, 'Média'), corBarba: CORES_CABELO[7].cor });
    function criarBene() {
      const { m, opt } = modelo(AP_BENE(), false, 15, ['#f2f2ee', '#3a5a7a', '#c8352b', '#2a2a2a']);   // regata branca, bermuda azul e chapéu de palha
      chapeu(m, 'palha');
      const A = api.atorDe(m, opt, 'pescaNPC'); return A;
    }
    const viagensCaduLago = () => (fimDeSemana() ? [{ ida: true, chega: H_CADU_CHEGA }, { ida: false, sai: H_CADU_SAI }] : []);
    // monta tudo (precisa da cidade pronta e do jogador na rua): chamado pela cidade (montarRuaPesca)
    function montarRua() {
      const s = S(); if (P.montado || !s || !s.jog || s.dentro) return;
      P.montado = true;
      P.quadro = criarQuadro(); desenharQuadro(); P.persiana = criarPersiana(); P.isopor = criarIsopor(); P.balde = criarBalde();
      // o Cadu de rua (casa ⇄ píer) e o Cadu sentado no píer (o mesmo boneco não serve: um anda pelo relógio, o outro pesca)
      P.caduRua = api.criarRuaAgendada(criarCaduPescador(), 'cadu', DESTINO_CADU, viagensCaduLago, 1.9);
      const C = P.cadu = criarCaduPescador(); C.sentado = true; C.assento = Y_PIER; listaNpcs().push(C); api.sumirV(C);
      P.cp = { e: 'espera', t: 8, vara: criarVara(0), boia: criarBoia(), linha: criarLinha(), bx: 0, bz: 0, peixe: null, balde: 0, tAnel: 0 };
      varaNaMao(C.m, P.cp.vara); P.cp.vara.raiz.visible = false;
      const B = P.bene = criarBene(); listaNpcs().push(B); api.sumirV(B);
      s.falantesExtra = s.falantesExtra || {}; s.falantesExtra.bene = { A: B, nome: tr('Seu Bené'), voz: 4 };
    }
    // o Cadu pescando sozinho: espera → fisga → puxa → pega (balde) ou escapa → lança de novo
    function novoLanceCadu(cp, ja) { cp.bx = LUGAR_CADU.x + rnd(-1.6, 1.6); cp.bz = LUGAR_CADU.z + rnd(5, 8); cp.e = ja ? 'espera' : 'lanca'; cp.t = ja ? rnd(6, 25) : 1.3; }
    function falaCadu(txt) {                                             // comentário curto do Cadu: no minigame vai para o recado; na rua, aviso (só de perto)
      if (P.mg) { if (!P.mg.ocupado) msgMg(tr('Cadu') + ': ' + txt, 3); return; }
      const s = S(), C = P.cadu; if (s.modo !== 'livre' || !C || Math.hypot(s.jog.x - C.x, s.jog.z - C.z) > 14) return;
      aviso(tr('Cadu') + ': ' + txt, 3);
    }
    function tickCaduLago(dt) {
      const s = S(), C = P.cadu, cp = P.cp; if (!C || !cp) return;
      const deve = caduNoLago() && !s.dentro;
      if (deve && C.oculto) {
        api.surgirV(C, LUGAR_CADU.x, LUGAR_CADU.z, LUGAR_CADU.yaw); C.sentado = true; C.assento = Y_PIER; C.y = 0;
        P.balde.visible = true; cp.vara.raiz.visible = true; novoLanceCadu(cp, true); cp.boia.visible = true;
      } else if (!deve && !C.oculto) {
        api.sumirV(C); cp.vara.raiz.visible = false; cp.boia.visible = false; cp.linha.visible = false; P.balde.visible = false; tirarPeixeCadu(cp);
        if (P.mg && P.mg.comCadu && hora() >= H_CADU_SAI) { msgMg(tr('Cadu') + ': ' + tr('Já são 20h! Vou nessa. Boa pescaria!'), 4); P.mg.comCadu = false; }
      }
      if (C.oculto) return;
      if (cp.e === 'brabo') { C.x = LUGAR_CADU.x; C.z = LUGAR_CADU.z; return; }   // (6.6.1) a cena secreta: de pé, revoltado (quem mexe é a cena)
      C.yawAlvo = LUGAR_CADU.yaw; C.x = LUGAR_CADU.x; C.z = LUGAR_CADU.z;
      cp.t -= dt;
      if (cp.e === 'espera') { if (cp.t <= 0 && !C.conversando) { cp.e = 'fisga'; cp.t = 0.35; cp.peixe = sortearPeixe(hora(), 0, 0, 0.25); cp.pega = Math.random() < 0.72; } }
      else if (cp.e === 'fisga') { if (cp.t <= 0) { cp.e = 'puxa'; cp.t = rnd(2.4, 4.6); cp.t0 = cp.t; anel(cp.bx, cp.bz, 0.8); } }
      else if (cp.e === 'puxa') {
        const k = 1 - Math.max(0, cp.t) / cp.t0; cp.px = lerpN(cp.bx, LUGAR_CADU.x, k * 0.8); cp.pz = lerpN(cp.bz, LUGAR_CADU.z + 1.2, k * 0.8);
        cp.tAnel -= dt; if (cp.tAnel <= 0) { cp.tAnel = 0.35; anel(cp.px, cp.pz, 0.5); }
        if (cp.t <= 0) {
          if (cp.pega) { cp.e = 'pega'; cp.t = 2.4; const pw = sortearPeso(cp.peixe, 0); cp.kg = pw.kg; segurarPeixeCadu(cp); respingo(cp.px, cp.pz, 5, 0); falaCadu(trf('Opa! Peguei: {0}!', nomePeixe(cp.peixe))); }
          else { cp.e = 'escapa'; cp.t = 1.4; respingo(cp.px, cp.pz, 4, 0); falaCadu(tr('Ah, escapou!')); }
        }
      } else if (cp.e === 'pega') { if (cp.t <= 0.9 && cp.mPeixe) { tirarPeixeCadu(cp); cp.balde++; } if (cp.t <= 0) novoLanceCadu(cp, false); }
      else if (cp.e === 'escapa') { if (cp.t <= 0) novoLanceCadu(cp, false); }
      else if (cp.e === 'lanca') { if (cp.t <= 0.55 && !cp.solto) { cp.solto = true; cp.voo = 0; } if (cp.solto) cp.voo += dt; if (cp.t <= 0) { cp.solto = false; cp.e = 'espera'; cp.t = rnd(14, 40); anel(cp.bx, cp.bz, 0.6); } }
    }
    function segurarPeixeCadu(cp) { tirarPeixeCadu(cp); const m = malhaPeixe(cp.peixe, cp.kg); m.rotation.z = -Math.PI / 2; m.position.set(0, -0.3 - m.userData.L * 0.45, 0); P.cadu.m.bracoE.cotovelo.add(m); cp.mPeixe = m; }
    function tirarPeixeCadu(cp) { if (cp.mPeixe && cp.mPeixe.parent) cp.mPeixe.parent.remove(cp.mPeixe); cp.mPeixe = null; }
    // a pose do Cadu sentado com a vara (por cima da pose de sentado do poseAtor, que já rodou neste quadro)
    function poseCaduLago() {
      const C = P.cadu, cp = P.cp; if (!C || C.oculto || !cp) return;
      const longe = !!C.m.longe; cp.vara.raiz.visible = !longe && cp.e !== 'brabo'; if (longe || cp.e === 'brabo') { cp.linha.visible = false; if (cp.e !== 'brabo') return; }
      const m = C.m, t = S().t; let dz = 0.55, cz = 1.05, ez = 0.7, ecz = 0.95, ex = -0.42, b = 0.05;
      if (cp.e === 'espera') { dz += Math.sin(t * 0.8) * 0.03; }
      else if (cp.e === 'fisga') { dz = 1.35; cz = 0.9; b = 0.4; }
      else if (cp.e === 'puxa') { dz = 1.0 + Math.sin(t * 9) * 0.05; cz = 0.85; b = 0.55 + Math.sin(t * 13) * 0.08; ecz = 1.2 + Math.sin(t * 7) * 0.3; }
      else if (cp.e === 'pega') { dz = 0.9; ez = 2.0; ecz = 0.35; ex = -0.15; }
      else if (cp.e === 'escapa') { dz = 0.5 + Math.max(0, cp.t - 1.0) * 1.5; b = 0; }
      else if (cp.e === 'brabo') { const k = cp.furia || 0; dz = 2.5 + Math.sin(t * 13) * 0.45 * k; ez = 2.5 + Math.sin(t * 13 + 1.7) * 0.45 * k; cz = 0.4; ecz = 0.4; ex = 0; b = 0; }
      else if (cp.e === 'lanca') { const u = 1 - cp.t / 1.3; dz = u < 0.45 ? 0.55 + suave(u / 0.45) * 1.9 : 2.45 - suave((u - 0.45) / 0.3) * 2.0; cz = 1.05 - Math.min(1, u * 2) * 0.3; }
      if (C.fala && cp.e !== 'brabo') { ez = 0.9 + Math.sin(t * 6) * 0.3; ecz = 0.8; }
      m.bracoD.rotation.z = dz; m.bracoD.rotation.x = 0.12; usarCotovelo(m.bracoD, 0, cz);
      m.bracoE.rotation.z = ez; m.bracoE.rotation.x = ex; usarCotovelo(m.bracoE, 0, ecz);
      vergar(cp.vara, SINAL_VERGA * b);
      if (cp.e === 'brabo') { cp.boia.visible = false; return; }
      // a linha e a boia
      const a = mundo(cp.vara.ponta);
      let bx = cp.bx, bz = cp.bz, by = Y_AGUA + 0.02 + Math.sin(t * 2.2) * 0.012;
      if (cp.e === 'puxa' || cp.e === 'pega' || cp.e === 'escapa') { bx = cp.px; bz = cp.pz; by = cp.e === 'puxa' ? Y_AGUA - 0.05 : Y_AGUA + 0.02; }
      if (cp.e === 'lanca') { if (!cp.solto) { bx = a.x; by = a.y - 0.3; bz = a.z; } else { const u = clampN(cp.voo / 0.55, 0, 1); bx = lerpN(a.x, cp.bx, u); bz = lerpN(a.z, cp.bz, u); by = lerpN(a.y, Y_AGUA + 0.02, u) + Math.sin(u * Math.PI) * 1.4; } }
      cp.boia.visible = cp.e !== 'pega'; cp.boia.position.set(bx, by, bz);
      if (cp.e === 'pega' && cp.mPeixe) linhaDe(cp.linha, a, mundo(cp.mPeixe), 0.02); else linhaDe(cp.linha, a, { x: bx, y: by + 0.17, z: bz }, cp.e === 'puxa' ? 0.05 : 0.3);
      // olhando para o jogador quando ele chega perto (só a cabeça)
      const s = S(), J = s.jog, dj = Math.hypot(J.x - C.x, J.z - C.z);
      if (dj < 5 || C.conversando) { const ang = Math.atan2(-(J.z - C.z), J.x - C.x) - C.yaw, a2 = ((ang + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI; usarCabeca(m, -0.0001); m.cabeca.rotation.y = clampN(a2, -1.1, 1.1); }
    }
    function tickBene() {
      const s = S(), A = P.bene; if (!A) return;
      const ab = aberta() && !s.dentro;
      if (ab && A.oculto) { api.surgirV(A, BALCAO.x, CP.z1 - 0.8, -Math.PI / 2); A.x = BALCAO.x; A.z = CP.z1 - 0.8; }
      else if (!ab && !A.oculto) api.sumirV(A);
      if (P.persiana) P.persiana.visible = !aberta();
      if (A.oculto || A.m.longe) return;
      if (P.cenaBene) { const C = P.cenaBene; A.x = C.bx; A.z = C.bz; A.yawAlvo = C.byaw; A.andando = !!C.anda; return; }
      A.x = BALCAO.x; A.z = CP.z1 - 0.8;
      const J = s.jog, dj = Math.hypot(J.x - A.x, J.z - A.z), m = A.m, t = s.t;
      if (dj < 7 || A.conversando) { const ang = Math.atan2(-(J.z - A.z), J.x - A.x); A.yawAlvo = -Math.PI / 2 + clampN(((ang + Math.PI / 2 + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI, -0.7, 0.7); }
      else {
        A.yawAlvo = -Math.PI / 2;                                         // sozinho: passa um pano no balcão de vez em quando
        if (Math.sin(t * 0.21) > 0.55) { const w = Math.sin(t * 3); m.bracoD.rotation.z = 1.05 + w * 0.12; m.bracoD.rotation.x = 0.15 + w * 0.25; usarCotovelo(m.bracoD, 0, 0.45); }
      }
    }

    // ---------------------------------------------------------------- interação (na rua)
    function alvos(v) {
      const s = S(); if (!s || s.dentro || P.mg || !P.montado) return;
      const C = P.cadu;
      if (C && !C.oculto) v.push({ x: C.x + 0.3, z: C.z - 0.75, r: 1.6, txt: tr('Falar com o Cadu'), fn: falarComCaduLago, y: 1.7, pri: !temVara() });   // sem vara: falar com ele ganha do "Pescar"
      const Lp = lugarPesca();                                            // na beira do lago (ou no píer) com água na frente: "Pescar aqui"
      if (Lp) { const d = dirDe(Lp.yaw); v.push({ x: s.jog.x + d.x * 1.0, z: s.jog.z + d.z * 1.0, r: 1.25, txt: tr('Pescar aqui'), fn: () => pescarAqui(Lp), y: 0.9 }); }
      v.push({ x: BALCAO.x, z: BALCAO.z, r: 1.7, txt: aberta() ? tr('Falar com o seu Bené') : tr('Casinha da pesca fechada. Abre às 6h.'), fn: aberta() ? falarComBene : async () => {}, y: 2.6 });
      v.push({ x: QUADRO.x, z: QUADRO.z, r: 1.3, txt: tr('Ver o catálogo'), fn: () => abrirCatalogo(), y: 2.3 });
    }
    // dá para pescar de QUALQUER lugar da beira do lago (e do píer): basta ter água na frente. Vale a direção para onde o jogador olha;
    //   se não tiver água ali, a direção com água mais perto dela.
    function lugarPesca() {
      const s = S(), J = s.jog, L = api.LAGO; if (!J || s.dentro || J.sentado) return null;
      if (Math.abs(J.x - L.cx) > L.rx + 6 || Math.abs(J.z - L.cz) > L.rz + 6) return null;
      const agua = (yaw) => { const d = dirDe(yaw); for (const r of [1.6, 2.6, 3.6]) if (naAgua(J.x + d.x * r, J.z + d.z * r)) return true; return false; };
      if (agua(J.yaw)) return { x: J.x, z: J.z, yaw: J.yaw };
      let melhor = null, dm = 9;
      for (let k = 0; k < 24; k++) { const y = k / 24 * Math.PI * 2; if (!agua(y)) continue; const da = Math.abs(angN(y - J.yaw)); if (da < dm) { dm = da; melhor = y; } }
      return melhor == null ? null : { x: J.x, z: J.z, yaw: melhor };
    }
    // a pesca só fica liberada nos dias de folga (em dia de trabalho, o personagem prefere não pescar)
    const diaDeTrabalho = () => !!api.empregoEscolhido() && !fimDeSemana();
    async function semPescaHoje() { await api.fala('jog', tr('Eu acho melhor não pescar hoje, por conta do trabalho...')); Dialogo.esconder(); }
    async function pescarAqui(Lp) {
      if (diaDeTrabalho()) { await semPescaHoje(); return; }
      if (!temVara()) {
        await api.fala('jog', tr('Preciso de uma vara para pescar...'));
        if (P.cadu && !P.cadu.oculto) await api.fala('jog', tr('O Cadu está bem ali. Posso pedir uma emprestada!'));
        else await api.fala('jog', tr('O seu Bené vende varas na casinha. E dizem que o Cadu pesca aqui no fim de semana.'));
        Dialogo.esconder(); return;
      }
      const C = P.cadu, perto = !!(C && !C.oculto && Math.hypot(C.x - Lp.x, C.z - Lp.z) < 6);
      await pescar(perto, Lp);
    }
    const PAPOS_LAGO = [
      'Isca boa faz o peixe morder mais rápido. Mas os grandões não se impressionam fácil, não.',
      'Tá vendo as manchas escuras na água? Ali é fundo. Isca bem no meio da mancha escura é peixe grande!',
      'As partes clarinhas são banco de areia. Ali só dá peixinho.',
      'Se a boia só tremer, espera! Fisga quando ela afundar de vez.',
      'Quando o peixe correr, solta a linha. Se segurar, arrebenta!',
      'Mas não deixa a linha frouxa demais, senão ele cospe o anzol.',
      'Deixa a tensão na faixa verde. Peixe raro faz a faixa ficar andando, aí é que é difícil!',
      'Cada peixe tem a sua hora. De noite aparecem os bagres grandes, mas não vai ficar acordado até tarde, hein.',
      'O seu Bené anota todo peixe que a gente pega naquele quadro da casinha.',
      'Dizem que tem um pirarucu nesse lago. Só com vara muito boa pra segurar um bicho desses.',
    ];
    async function falarComCaduLago() {
      const s = S(), d = s.dados, p = dadosP(), A = P.cadu; if (!A) return;
      const dm = d.mercado || (d.mercado = {});
      s.falantesExtra = s.falantesExtra || {}; s.falantesExtra.cadu = { A, nome: tr('Cadu'), voz: 2 };
      A.conversando = true; let vai = false;
      try {
        const h1 = (api.historia().ler('fase1')) || {}, cad = h1.cadu || null, salvou = !!(cad && cad.salvou);
        if (!dm.conheceu && !dm.apresentou && !dm.reconheceu) {          // o primeiro encontro com o Cadu foi aqui no lago
          if (salvou) {
            await api.fala('cadu', trf('Espera aí... {0}?! É você mesmo?!', api.nomeJog()));
            await api.fala('cadu', tr('Você me tirou daquele armário na escola, lembra? Eu nunca esqueci isso.'));
            if (cad.conversou) await api.fala('cadu', tr('E ainda veio conversar comigo depois. Pouca gente fazia isso.'));
            await api.fala('jog', tr('Cadu?! Quanto tempo!'));
          } else await api.fala('cadu', tr('Opa! Eu sou o Cadu. Você me parece familiar... de onde será?'));
          await api.fala('cadu', tr('O meu pai tem o mercado lá na avenida. Durante a semana eu ajudo ele, mas sábado e domingo é dia de pescar!'));
          dm.conheceu = true; dm.reconheceu = true; p.caduLago = true; gravar();
        } else if (!p.caduLago) {
          await api.fala('cadu', tr('E aí! Sábado e domingo eu venho pescar aqui. É o meu descanso.'));
          if (api.empregoEscolhido() === 'mercado') await api.fala('cadu', tr('Hoje é fim de semana, o mercado fica com o meu pai. Descansa e volta segunda!'));
          p.caduLago = true; gravar();
        }
        if (!temVara()) {
          const r = await Escolha.mostrar(tr('O que você diz?'), [tr('Me empresta uma varinha?'), tr('Só vim dar um oi!')]);
          if (r !== 0) { await api.fala('jog', tr('Só vim dar um oi!')); await api.fala('cadu', tr('Valeu! Aparece mais vezes. Sábado e domingo eu tô sempre aqui.')); Dialogo.esconder(); return; }
          await api.fala('jog', tr('Me empresta uma varinha?'));
          await api.fala('cadu', tr('Claro! Tenho uma de bambu sobrando. Pode ficar com ela, sério.'));
          await api.fala('cadu', tr('Toma também umas minhocas e essa caixa de isopor pra guardar os peixes. Cabem uns 30.'));
          if (p.varas.indexOf(0) < 0) p.varas.unshift(0); p.vara = 0; p.iscas[0] = nIsca(0) + 10; p.isca = 0; p.caduVara = true; gravar(); SOM.pegou();
          aviso(tr('Você ganhou: vara de bambu, 10 minhocas e a caixa de isopor!'), 4);
          await api.fala('cadu', tr('Se acabar a isca, o seu Bené vende lá na casinha. Ele também compra os peixes.'));
        } else if (totalIscas() === 0 && p.caduMinhoca !== d.dia) {
          await api.fala('cadu', tr('Tá sem isca? Toma umas minhocas, por minha conta.'));
          p.iscas[0] = nIsca(0) + 5; p.caduMinhoca = d.dia; p.isca = 0; gravar(); aviso(tr('+5 minhocas'), 2.5);
        } else if (p.varas.indexOf(0) < 0 && !p.caduVara) {             // comprou vara antes de falar com ele: ganha a de bambu de lembrança
          await api.fala('cadu', tr('Já tem vara, é? Então leva essa de bambu também, de lembrança!'));
          p.varas.unshift(0); p.caduVara = true; gravar();
        }
        if (diaDeTrabalho()) { await semPescaHoje(); return; }
        const r = await Escolha.mostrar(tr('Você quer pescar agora?'), [tr('Sim'), tr('Conversar'), tr('Agora não')]);
        if (r === 1) {
          const Q = PAPOS_LAGO[(p.papo | 0) % PAPOS_LAGO.length]; p.papo = (p.papo | 0) + 1;
          await api.fala('cadu', tr(Q));
          const n = descobertos(); if (n >= 5 && (p.papo % 3) === 0) await api.fala('cadu', trf('Você já pescou {0} tipos de peixe! Tá ficando craque.', n));
          Dialogo.esconder(); return;
        }
        if (r !== 0) { await api.fala('cadu', tr('Beleza! Quando quiser, é só chegar.')); Dialogo.esconder(); return; }
        await api.fala('cadu', tr('Bora! Fica ali na ponta do píer, do meu lado.')); Dialogo.esconder();
        vai = true;
      } finally { if (P.cadu) P.cadu.conversando = false; }
      if (vai) await pescar(true);
    }
    async function falarComBene() {
      const s = S(), p = dadosP(), A = P.bene; if (!A) return;
      s.falantesExtra = s.falantesExtra || {}; s.falantesExtra.bene = { A, nome: tr('Seu Bené'), voz: 4 };
      A.conversando = true;
      try {
        if (!p.conheceBene) {
          await api.fala('bene', tr('Opa! Eu sou o Bené. Moro nessa casinha faz trinta anos.'));
          await api.fala('bene', tr('Vendo isca e vara, e compro todo peixe que você pescar aqui no lago.'));
          await api.fala('bene', tr('E naquele quadro da parede eu anoto cada peixe que aparece. São sessenta tipos, acredita?'));
          if (!temVara()) await api.fala('bene', tr('Tá sem vara? O Cadu, filho do seu Raimundo do mercado, pesca aqui sábado e domingo. Ele sempre empresta uma. Ou compra aqui comigo, ué!'));
          p.conheceBene = true; gravar();
        } else if (!p.bagre || p.bagre.fim) await api.fala('bene', tr(pk(['E aí, vai querer o quê hoje?', 'Opa! Que bom te ver!', 'Fala! O lago tá bom hoje.'])));
        if (p.bagre && !p.bagre.fim) { await cenaBagreBene(); Dialogo.esconder(); return; }
        Dialogo.esconder();
        await abrirLoja();
      } finally { if (P.bene) P.bene.conversando = false; }
    }

    // ---------------------------------------------------------------- ícones das iscas e das varas (pixel art 16x16)
    const cacheIco = new Map();
    function iconeIsca(k) {
      if (cacheIco.has('i' + k)) return cacheIco.get('i' + k);
      const cv = document.createElement('canvas'); cv.width = 16; cv.height = 16; const g = cv.getContext('2d'), px = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
      const c = ISCAS[k].cor;
      if (k === 0) { for (let x = 1; x < 15; x++) px(x, 7 + Math.round(Math.sin(x * 0.9) * 2), 1, 2, x % 3 ? c : '#a84a3a'); }
      else if (k === 1) { px(4, 4, 8, 8, c); px(3, 5, 10, 6, c); px(5, 5, 2, 2, '#fff8e8'); px(8, 9, 3, 2, '#c8b890'); }
      else if (k === 2) { for (let y = 3; y < 13; y += 2) for (let x = 5; x < 11; x += 2) px(x, y, 2, 2, (x + y) % 4 ? c : '#e0b020'); px(4, 12, 8, 2, '#6a9a3a'); }
      else if (k === 3) { px(4, 7, 8, 3, c); px(11, 6, 3, 3, '#4a6a2a'); px(3, 10, 1, 4, '#4a6a2a'); px(6, 10, 1, 3, '#4a6a2a'); px(9, 10, 1, 4, '#4a6a2a'); px(13, 4, 1, 3, '#2a3a1a'); px(12, 7, 1, 1, '#101010'); }
      else if (k === 4) { px(3, 5, 3, 3, c); px(5, 7, 4, 3, c); px(8, 9, 4, 3, c); px(11, 11, 3, 2, '#e07050'); px(3, 4, 1, 1, '#101010'); px(1, 3, 3, 1, '#c86040'); }
      else if (k === 5) { px(4, 5, 8, 8, c); px(3, 6, 10, 6, c); px(5, 6, 2, 2, '#d86a4a'); px(7, 2, 2, 3, '#4a3a20'); px(9, 2, 4, 2, '#5a8a3a'); }
      else if (k === 6) { px(2, 7, 11, 3, c); px(1, 8, 2, 1, c); px(12, 6, 3, 5, '#4a5a4a'); px(3, 8, 9, 1, '#8a9a8a'); px(3, 7, 1, 1, '#101010'); }
      else { px(3, 6, 9, 4, c); px(2, 7, 2, 2, '#2a7ab0'); px(4, 6, 2, 2, '#f2f2ee'); px(5, 7, 1, 1, '#101010'); px(12, 5, 1, 6, '#c8c8c8'); px(13, 4, 2, 1, '#c8c8c8'); px(13, 11, 2, 1, '#c8c8c8'); px(6, 10, 1, 3, '#c8c8c8'); }
      cacheIco.set('i' + k, cv); return cv;
    }
    function iconeVara(v) {
      if (cacheIco.has('v' + v)) return cacheIco.get('v' + v);
      const cv = document.createElement('canvas'); cv.width = 16; cv.height = 16; const g = cv.getContext('2d'), V = VARAS[v];
      for (let k = 0; k < 13; k++) { g.fillStyle = k < 4 ? V.cores[1] : V.cores[0]; g.fillRect(1 + k, 14 - k, 2, 1); if (v === 0 && k % 4 === 3) { g.fillStyle = V.cores[1]; g.fillRect(1 + k, 14 - k, 2, 1); } }
      if (V.molinete) { g.fillStyle = V.cores[2]; g.fillRect(4, 13, 3, 2); }
      g.fillStyle = '#e8e8e0'; g.fillRect(14, 1, 1, 10);
      cacheIco.set('v' + v, cv); return cv;
    }
    const imgDe = (cv, w, h, cls) => { const im = document.createElement('img'); im.src = cv.toDataURL(); im.width = w; im.height = h; im.className = cls || 'pcIco'; im.draggable = false; return im; };

    // ---------------------------------------------------------------- CSS dos painéis e da tela do minigame (madeira e laranja, como o mapa da cidade)
    function cssPesca() {
      if (document.getElementById('pcCss')) return;
      const st = document.createElement('style'); st.id = 'pcCss';
      st.textContent = `
#pcPainel{position:fixed;inset:0;z-index:16;display:flex;align-items:center;justify-content:center;background:rgba(6,6,8,.45);font-family:var(--font-body);padding:calc(8px + env(safe-area-inset-top,0px)) max(8px,env(safe-area-inset-right,0px)) calc(8px + env(safe-area-inset-bottom,0px)) max(8px,env(safe-area-inset-left,0px));box-sizing:border-box}
#pcPainel .pxBtn,#pcHud .pxBtn{width:auto;min-width:0;white-space:nowrap}
#pcPainel .pxBtn.pcBt,#pcPainel .pxBtn.pxPrim.pcBt{height:34px;min-height:0;padding:0 10px;font-size:12px;line-height:1}
#pcPainel .pxBtn.pcX{width:38px;padding:0;flex:none}
#pcHud .pxBtn.pcInfo,#pcHud .pxBtn.pcPeq{height:36px;min-height:0;font-size:12px;line-height:1}
#pcHud .pxBtn.pxPrim.pcAcao{height:64px;font-size:16px}
#pcPainel .pxBtn.pxPrim,#pcHud .pxBtn.pxPrim{color:#2a1206}
#pcPainel .pcCard{width:min(720px,100%);height:100%;max-height:100%;overflow:hidden;display:flex;flex-direction:column;background:#2a1206;border:4px solid #f0a020;color:#fff0c8;box-shadow:0 6px 0 rgba(0,0,0,.45);box-sizing:border-box}
#pcPainel .pcTopo{flex:none;display:flex;align-items:center;gap:8px;padding:8px 10px;border-bottom:3px solid #5a3414}
#pcPainel .pcTit{font:700 15px/1.2 var(--font-display);letter-spacing:.06em;color:#f0a020;text-transform:uppercase;flex:1;min-width:0}
#pcPainel .pcGrana{font:700 13px/1 var(--font-display);color:#8fe04a;white-space:nowrap}
#pcPainel .pcAbas{flex:none;display:flex;gap:6px;padding:8px 10px 0;flex-wrap:wrap}
#pcPainel .pcAba{height:34px;padding:0 12px;font-size:12px}
#pcPainel .pcAba.on{outline:2px solid #fff0c8;outline-offset:1px}
#pcPainel .pcCorpo{flex:1 1 auto;min-height:0;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;padding:10px;display:flex;flex-direction:column;gap:7px}
#pcPainel .pcCorpo>*{flex:none}
#pcPainel .pcMsg{flex:none;min-height:18px;padding:0 10px 8px;font-size:13px;color:#ffe08a}
.pcLinha{display:flex;align-items:center;gap:10px;background:#3a1c0a;border:2px solid #5a3414;padding:6px 8px}
.pcLinha.on{border-color:#f0a020}
.pcIco{width:80px;height:48px;image-rendering:pixelated;flex:none}
.pcIcoP{width:32px;height:32px;image-rendering:pixelated;flex:none}
.pcTxt{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}
.pcNome{font:700 13px/1.2 var(--font-display)}
.pcSub{font-size:12px;opacity:.85;line-height:1.3}
.pcBts{display:flex;gap:5px;flex-wrap:wrap;justify-content:flex-end;flex:none;max-width:52%}
.pcBt{height:34px;padding:0 10px;font-size:12px}
.pcGrade{display:grid;grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:6px}
.pcCel{display:flex;flex-direction:column;align-items:center;gap:3px;padding:5px 3px;background:#3a1c0a;border:2px solid #5a3414;cursor:pointer;font-size:11px;text-align:center;line-height:1.15;color:#fff0c8}
.pcCel img{width:80px;height:48px;image-rendering:pixelated}
.pcFil{display:flex;gap:5px;flex-wrap:wrap}
.pcFicha{display:flex;gap:12px;flex-wrap:wrap;align-items:flex-start}
.pcFicha img{width:240px;height:144px;max-width:100%;image-rendering:pixelated;background:#f4ead2;border:3px solid #5a3414}
.pcDados{display:grid;grid-template-columns:auto 1fr;gap:3px 10px;font-size:13px;flex:1;min-width:200px}
.pcDados b{color:#f0a020;font-weight:700}
#pcHud{position:fixed;inset:0;z-index:11;pointer-events:none;font-family:var(--font-body);color:#fff0c8}
#pcHud .pcArrasto{position:absolute;inset:0;pointer-events:auto;touch-action:none;cursor:grab}
#pcHud .pcQuad{width:38px;height:38px;padding:0;display:grid;place-items:center;position:relative;background:rgba(42,18,6,.86);border:3px solid #f0a020;color:#fff0c8;box-sizing:border-box;cursor:pointer;pointer-events:auto;font:700 15px/1 var(--font-display);text-shadow:0 2px 0 #2a1206}
#pcHud .pcQuad:active{transform:translateY(2px)}
#pcHud .pcQuad:disabled{opacity:.5}
#pcHud .pcQuad img{width:24px;height:24px;image-rendering:pixelated;pointer-events:none}
#pcHud .pcQuad .pcBadge{position:absolute;right:-6px;bottom:-7px;min-width:14px;padding:1px 3px;background:#2a1206;border:2px solid #f0a020;font:700 9px/1 var(--font-display);color:#fff0c8;text-shadow:none}
#pcHud .pcEsq{position:absolute;left:max(10px,env(safe-area-inset-left,0px));top:calc(8px + env(safe-area-inset-top,0px));display:flex;gap:6px;align-items:flex-start;pointer-events:none}
#pcHud .pcMenu{display:flex;flex-direction:column;gap:4px;pointer-events:auto}
#pcHud .pcMenu[hidden]{display:none}
#pcHud .pcDir{position:absolute;right:max(10px,env(safe-area-inset-right,0px));top:calc(50px + env(safe-area-inset-top,0px));display:flex;flex-direction:column;gap:6px;align-items:flex-end;pointer-events:none}
#pcHud .pcInfo{display:flex;align-items:center;gap:6px;height:30px;padding:0 8px 0 4px;font-size:11px;text-align:left;min-width:120px}
#pcHud .pcInfo img{width:20px;height:20px;image-rendering:pixelated}
#pcHud .pcRecado{position:absolute;left:50%;top:calc(10px + env(safe-area-inset-top,0px));transform:translateX(-50%);max-width:min(440px,56vw);text-align:center;font:700 13px/1.25 var(--font-display);color:#fff0c8;text-shadow:0 2px 0 #2a1206,0 0 5px #2a1206;letter-spacing:.04em}
#pcHud .pcDica{position:absolute;left:50%;bottom:calc(10px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);max-width:min(440px,58vw);text-align:center;font:600 11px/1.25 var(--font-body);background:rgba(42,18,6,.62);border:2px solid rgba(90,52,20,.8);padding:3px 8px;opacity:.9}
#pcHud .pcDica:empty{display:none}
#pcHud .pcAcao{position:absolute;right:max(14px,env(safe-area-inset-right,0px));bottom:calc(14px + env(safe-area-inset-bottom,0px));width:118px;height:52px;font-size:14px;pointer-events:auto;touch-action:none}
#pcHud .pxBtn.pxPrim.pcAcao{height:52px;font-size:14px}
#pcHud .pcAcao.urgente{animation:pcPisca .25s steps(1) infinite}
@keyframes pcPisca{50%{filter:brightness(1.6)}}
#pcHud .pcBarra{position:absolute;right:calc(140px + env(safe-area-inset-right,0px));bottom:calc(14px + env(safe-area-inset-bottom,0px));width:26px;height:104px;background:#1c0e04;border:3px solid #5a3414;box-sizing:border-box}
#pcHud .pcBarra .pcZona{position:absolute;left:0;right:0}
#pcHud .pcBarra .pcEnche{position:absolute;left:3px;right:3px;bottom:0;background:#fff0c8;opacity:.9}
#pcHud .pcBarra .pcMarca{position:absolute;left:-6px;right:-6px;height:3px;background:#fff;box-shadow:0 0 0 1px #2a1206}
#pcHud .pcBarra .pcRot{position:absolute;left:50%;top:-15px;transform:translateX(-50%);font:700 9px/1 var(--font-display);white-space:nowrap;text-shadow:0 1px 0 #2a1206}
#pcHud .pcBriga{position:absolute;right:calc(176px + env(safe-area-inset-right,0px));bottom:calc(16px + env(safe-area-inset-bottom,0px));display:flex;flex-direction:column;gap:3px;align-items:flex-end;font:700 10px/1.2 var(--font-display);text-shadow:0 1px 0 #2a1206}
#pcHud .pcFol{width:72px;height:6px;background:#1c0e04;border:2px solid #5a3414}
#pcHud .pcFol i{display:block;height:100%;background:#e8452f}
#pcHud .pcChoque{position:absolute;inset:0;background:#d8f0ff;opacity:0;transition:opacity .25s;pointer-events:none}
#pcHud .pcBarra{transition:border-color .12s}
#pcHud .pcBarra .pcFaixaZ{position:absolute;left:0;right:0;background:#3fae4a;opacity:.85;box-shadow:inset 0 0 0 1px #8fe04a}
#pcHud .pcBarra .pcTique{position:absolute;left:0;right:0;height:2px;background:rgba(42,18,6,.75)}
#pcHud .pcRisT{font-size:9px;opacity:.92}
#pcHud .pcRis{width:72px;height:5px;background:#1c0e04;border:2px solid #5a3414}
#pcHud .pcRis i{display:block;height:100%;width:0}
#pcHud .pcFr i{background:#5fa8f0}
#pcHud .pcEs i{background:#ff7a3a}
#pcHud .pcNota{position:absolute;left:50%;top:24%;transform:translate(-50%,-6px);display:flex;flex-direction:column;align-items:center;gap:3px;opacity:0;transition:opacity .25s,transform .25s;pointer-events:none;text-align:center}
#pcHud .pcNota.on{opacity:1;transform:translate(-50%,0)}
#pcHud .pcNota b{font:700 34px/1 var(--font-display);text-shadow:0 3px 0 #2a1206,0 0 6px #2a1206}
#pcHud .pcNota span{font:700 13px/1.1 var(--font-display);letter-spacing:.06em;text-shadow:0 2px 0 #2a1206,0 0 5px #2a1206;white-space:nowrap}
#pcHud .pcCine{position:absolute;inset:0;pointer-events:none;display:none}
#pcHud.cine .pcCine{display:block}
#pcHud .pcCine i{position:absolute;left:0;right:0;height:11%;background:#000}
#pcHud .pcCine i.t{top:0}
#pcHud .pcCine i.b{bottom:0}
#pcHud .pcPlano{position:absolute;right:max(14px,env(safe-area-inset-right,0px));top:calc(11% + 8px);font:700 10px/1 var(--font-display);color:#fff0c8;opacity:.75;letter-spacing:.12em}
#pcHud .pcPular{position:absolute;right:max(14px,env(safe-area-inset-right,0px));bottom:calc(11% + 8px);font:600 10px/1 var(--font-body);color:#fff0c8;opacity:.7}
#pcHud .pcPerf{position:absolute;left:50%;top:40%;transform:translate(-50%,-50%) scale(.55);opacity:0;font:700 clamp(20px,5.4vw,42px)/1.1 var(--font-display);color:#ffd84a;text-shadow:0 3px 0 #7a3a06,0 0 16px rgba(255,200,60,.75);letter-spacing:.06em;white-space:nowrap;transition:transform .4s cubic-bezier(.2,1.6,.4,1),opacity .2s}
#pcHud .pcPerf.on{opacity:1;transform:translate(-50%,-50%) scale(1)}
#pcHud.cine .pcEsq,#pcHud.cine .pcDir,#pcHud.cine .pcAcao,#pcHud.cine .pcBarra,#pcHud.cine .pcDica,#pcHud.cine .pcRecado,#pcHud.cine .pcBriga,#pcHud.cine .pcNota{display:none}
#pcBanner{position:fixed;left:50%;top:calc(6px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:13;display:flex;flex-direction:column;align-items:center;gap:1px;padding:3px 12px 4px;background:rgba(42,18,6,.88);border:3px solid #f0a020;color:#fff0c8;text-align:center;pointer-events:none;max-width:min(520px,58vw);box-sizing:border-box}
#pcBanner .pcL1{font:700 13px/1.15 var(--font-display);letter-spacing:.06em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
#pcBanner .pcL2{font:600 11px/1.2 var(--font-body);opacity:.95}
#pcBanner .pcNovo{color:#8fe04a;font-weight:700}
@media (max-height:430px){#pcHud .pcBarra{height:88px}}
`;
      document.head.appendChild(st);
    }
    // painel genérico (fecha com o X ou Esc): devolve { el, corpo, msg, abas(lista, ativa, fn), fechar }
    function painel(titulo, aoFechar) {
      cssPesca(); fecharPainel();
      const el = document.createElement('div'); el.id = 'pcPainel';
      el.innerHTML = '<div class="pcCard"><div class="pcTopo"><div class="pcTit"></div><div class="pcGrana"></div><button type="button" class="pxBtn pcBt pcX">✕</button></div><div class="pcAbas"></div><div class="pcCorpo"></div><div class="pcMsg"></div></div>';
      (document.getElementById('raizJogo') || document.body).appendChild(el);
      const q = (s) => el.querySelector(s), P2 = { el, corpo: q('.pcCorpo'), msg: q('.pcMsg'), abasEl: q('.pcAbas'), tit: q('.pcTit') };
      P2.tit.textContent = titulo; q('.pcX').setAttribute('aria-label', tr('Fechar'));
      P2.grana = () => { q('.pcGrana').textContent = S().dados.fakes + ' fakes'; }; P2.grana();
      P2.fechar = () => { if (P.painel !== P2) return; window.removeEventListener('keydown', tecla, true); el.remove(); P.painel = null; if (aoFechar) aoFechar(); };
      const tecla = (e) => { if (e.code === 'Escape') { e.preventDefault(); e.stopPropagation(); P2.fechar(); } };
      window.addEventListener('keydown', tecla, true); q('.pcX').onclick = () => P2.fechar();
      P2.abas = (lista, ativa, fn) => { P2.abasEl.innerHTML = ''; lista.forEach((t, k) => { const b = botao(t, k === ativa); b.classList.add('pcAba'); if (k === ativa) b.classList.add('on'); b.onclick = () => fn(k); P2.abasEl.appendChild(b); }); };
      P.painel = P2; return P2;
    }
    function fecharPainel() { if (P.painel) P.painel.fechar(); }
    function botao(txt, prim) { const b = document.createElement('button'); b.type = 'button'; b.className = 'pxBtn pcBt' + (prim ? ' pxPrim' : ''); b.textContent = txt; return b; }
    function linha(ico, nome, sub, cor) {
      const L = document.createElement('div'); L.className = 'pcLinha'; if (ico) L.appendChild(ico);
      const t = document.createElement('div'); t.className = 'pcTxt'; t.innerHTML = '<span class="pcNome"></span><span class="pcSub"></span>';
      t.firstChild.textContent = nome; if (cor) t.firstChild.style.color = cor; t.lastChild.textContent = sub || ''; L.appendChild(t);
      const bs = document.createElement('div'); bs.className = 'pcBts'; L.appendChild(bs); L.bts = bs; return L;
    }
    const valorCaixa = () => dadosP().caixa.reduce((s, f) => s + precoPeixe(f.i, f.c), 0);

    // ---------------------------------------------------------------- A LOJA DO BENÉ: iscas, varas e venda dos peixes
    function abrirLoja(aba) {
      return new Promise((ok) => {
        let trocando = false;                                              // indo para o catálogo: a loja volta quando ele fechar
        const Pn = painel(tr('Loja do seu Bené'), () => { if (!trocando) ok(); });
        let atual = aba || 0;
        const desenha = () => {
          Pn.grana(); Pn.abas([tr('Iscas'), tr('Varas'), trf('Vender ({0})', dadosP().caixa.length), tr('Catálogo')], atual, (k) => { if (k === 3) { trocando = true; Pn.fechar(); abrirCatalogo().then(() => abrirLoja(atual)).then(ok); return; } atual = k; Pn.msg.textContent = ''; desenha(); Pn.corpo.scrollTop = 0; });
          const C = Pn.corpo; C.innerHTML = ''; const p = dadosP(), d = S().dados;
          if (atual === 0) {
            ISCAS.forEach((I, k) => {
              const L = linha(imgDe(iconeIsca(k), 32, 32, 'pcIcoP'), tr(I.nome) + '  ×' + nIsca(k), trf('{0} fakes cada', I.preco) + (p.isca === k ? ' · ' + tr('em uso') : ''));
              if (p.isca === k) L.classList.add('on');
              for (const n of [1, 5, 10]) { const b = botao('+' + n + ' (' + (I.preco * n) + ')'); b.disabled = !d.devInfinito && d.fakes < I.preco * n; b.onclick = () => comprarIsca(k, n, Pn, desenha); L.bts.appendChild(b); }
              if (nIsca(k) > 0 && p.isca !== k) { const b = botao(tr('Usar')); b.onclick = () => { p.isca = k; gravar(); desenha(); }; L.bts.appendChild(b); }
              C.appendChild(L);
            });
          } else if (atual === 1) {
            VARAS.forEach((V, v) => {
              const tem = p.varas.indexOf(v) >= 0, est = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);
              const L = linha(imgDe(iconeVara(v), 32, 32, 'pcIcoP'), tr(V.nome), trf('Alcance {0} m', V.alc) + ' · ' + tr('Resistência') + ' ' + est(v + 1) + ' · ' + tr('Peixes raros') + ' ' + est(v + 1));
              if (p.vara === v) L.classList.add('on');
              if (tem) { const b = botao(p.vara === v ? tr('Em uso') : tr('Usar'), p.vara !== v); b.disabled = p.vara === v; b.onclick = () => { p.vara = v; gravar(); desenha(); }; L.bts.appendChild(b); }
              else if (v === 0) { const s = document.createElement('span'); s.className = 'pcSub'; s.textContent = tr('Presente do Cadu'); L.bts.appendChild(s); }
              else { const b = botao(trf('Comprar ({0})', V.preco), true); b.disabled = !d.devInfinito && d.fakes < V.preco; b.onclick = () => comprarVara(v, Pn, desenha); L.bts.appendChild(b); }
              C.appendChild(L);
            });
          } else {
            if (!p.caixa.length) { const t = document.createElement('div'); t.className = 'pcSub'; t.textContent = temVara() ? tr('A caixa está vazia. Vá pescar!') : tr('Você ainda não tem peixes para vender.'); C.appendChild(t); return; }
            const tudo = botao(trf('Vender tudo ({0} fakes)', valorCaixa()), true); tudo.onclick = () => venderPeixes(p.caixa.map((_, k) => k), Pn, desenha); C.appendChild(tudo);
            p.caixa.map((f, k) => ({ f, k })).sort((a, b) => precoPeixe(b.f.i, b.f.c) - precoPeixe(a.f.i, a.f.c)).forEach(({ f, k }) => {
              const L = linha(imgDe(iconePeixe(f.i), 80, 48), nomePeixe(f.i), nomeRar(PEIXES[f.i].r) + ' · ' + fmtKg(f.kg) + ' · ' + nomeClasse(f.c) + ' (×' + String(MULT[f.c]).replace('.', virgula() ? ',' : '.') + ')', COR_RAR[PEIXES[f.i].r]);
              const b = botao(trf('Vender ({0})', precoPeixe(f.i, f.c))); b.onclick = () => venderPeixes([k], Pn, desenha); L.bts.appendChild(b); C.appendChild(L);
            });
          }
        };
        desenha();
      });
    }
    function pagar(v) { const d = S().dados; if (!d.devInfinito && d.fakes < v) return false; d.fakes -= v; if (d.devInfinito && d.fakes < 0) d.fakes = 0; api.somDinheiro(); api.mostrarDinheiro(false); api.gastoNaTela(v); return true; }
    function comprarIsca(k, n, Pn, desenha) {
      const I = ISCAS[k]; if (!pagar(I.preco * n)) { Pn.msg.textContent = tr('Sem dinheiro suficiente.'); SOM.erro(); return; }
      const p = dadosP(); p.iscas[k] = nIsca(k) + n; if (nIsca(p.isca) <= 0) p.isca = k; gravar();
      Pn.msg.textContent = tr('Seu Bené') + ': ' + trf('Tá aqui: {0} × {1}. Boa pescaria!', n, tr(I.nome)); desenha();
    }
    function comprarVara(v, Pn, desenha) {
      const V = VARAS[v]; if (!pagar(V.preco)) { Pn.msg.textContent = tr('Sem dinheiro suficiente.'); SOM.erro(); return; }
      const p = dadosP(), primeira = !p.varas.length; if (p.varas.indexOf(v) < 0) p.varas.push(v); p.varas.sort((a, b) => a - b); p.vara = v; gravar(); SOM.raro();
      Pn.msg.textContent = tr('Seu Bené') + ': ' + (primeira ? tr('Taí a sua primeira vara! Leva essa caixa de isopor também, cabem 30 peixes.') : v === 4 ? tr('A de titânio! Com essa você segura até pirarucu, rapaz.') : tr('Vara nova! Agora é só escolher a isca certa.'));
      desenha();
    }
    function venderPeixes(lista, Pn, desenha) {
      const p = dadosP(); let tot = 0, melhor = -1;
      const tira = lista.slice().sort((a, b) => b - a);
      for (const k of tira) { const f = p.caixa[k]; if (!f) continue; tot += precoPeixe(f.i, f.c); melhor = Math.max(melhor, PEIXES[f.i].r); p.caixa.splice(k, 1); }
      if (!tot) return;
      const d = S().dados; d.fakes += tot; p.ganhos = (p.ganhos | 0) + tot; api.somDinheiro(); api.mostrarDinheiro(true); api.ganhoNaTela(tot); SOM.moeda(); gravar();
      Pn.msg.textContent = tr('Seu Bené') + ': ' + (melhor >= 4 ? tr('Rapaz! Faz anos que eu não vejo um desses! Vou contar pra cidade inteira.') : melhor === 3 ? tr('Que peixão! Esse é dos bons.') : tr('Peixe bom! Tá aqui o seu dinheiro.')) + ' (+' + tot + ')';
      desenha();
    }

    // ---------------------------------------------------------------- O CATÁLOGO (no quadro da casinha e no minigame)
    function abrirCatalogo() {
      return new Promise((ok) => {
        const Pn = painel(tr('Catálogo do lago'), ok); let filtro = -1;
        const desenhaLista = () => {
          const p = dadosP(); Pn.tit.textContent = tr('Catálogo do lago') + ' · ' + descobertos() + '/60';
          Pn.abas([tr('Todos')].concat(RARIDADES.map((r) => tr(r))), filtro + 1, (k) => { filtro = k - 1; desenhaLista(); });
          const C = Pn.corpo; C.innerHTML = ''; const G = document.createElement('div'); G.className = 'pcGrade'; C.appendChild(G);
          PEIXES.forEach((pe, i) => {
            if (filtro >= 0 && (!p.cat[i] || pe.r !== filtro)) return;
            const tem = !!p.cat[i], c = document.createElement('button'); c.type = 'button'; c.className = 'pcCel';
            c.appendChild(imgDe(iconePeixe(i, !tem), 80, 48, ''));
            const n = document.createElement('span'); n.textContent = tem ? nomePeixe(i) : '???'; c.appendChild(n);
            if (tem) c.style.borderColor = COR_RAR[pe.r];
            c.onclick = () => ficha(i); G.appendChild(c);
          });
          if (filtro >= 0 && !G.children.length) { const t = document.createElement('div'); t.className = 'pcSub'; t.textContent = tr('Nenhum peixe desta raridade ainda.'); C.appendChild(t); }
          Pn.msg.textContent = tr('Os dados de cada peixe aparecem depois que você pescar ele pela primeira vez.');
        };
        const ficha = (i) => {
          const p = dadosP(), c = p.cat[i], pe = PEIXES[i], C = Pn.corpo; C.innerHTML = ''; Pn.msg.textContent = '';
          Pn.abas([tr('Voltar')], -1, () => desenhaLista());
          const F = document.createElement('div'); F.className = 'pcFicha'; F.appendChild(imgDe(iconePeixe(i, !c), 240, 144, ''));
          const D = document.createElement('div'); D.className = 'pcDados'; F.appendChild(D);
          const par = (k, v, cor) => { const a = document.createElement('b'); a.textContent = k; const b = document.createElement('span'); b.textContent = v; if (cor) b.style.color = cor; D.appendChild(a); D.appendChild(b); };
          if (!c) { par(tr('Nome'), '???'); par(tr('Dica'), tr('Pesque este peixe para descobrir.')); }
          else {
            par(tr('Nome'), nomePeixe(i), COR_RAR[pe.r]); par(tr('Raridade'), nomeRar(pe.r), COR_RAR[pe.r]); par(tr('Origem'), tr(ORIGENS[pe.o]));
            par(tr('Horário'), horasTxt(pe.h)); par(tr('Isca favorita'), tr(ISCAS[pe.isca].nome)); par(tr('Vara adequada'), tr(VARAS[pe.vara].nome));
            par(tr('Peso'), fmtKg(pe.kg0) + ' – ' + fmtKg(pe.kg1)); par(tr('magro'), trf('até {0}', fmtKg(limiteMagro(i)))); par(tr('pesado'), trf('acima de {0}', fmtKg(limitePesado(i))));
            par(tr('Recorde'), fmtKg(c.rec)); par(tr('Pescados'), c.n + '  (' + CLASSES.map((k, q) => nomeClasse(q) + ' ' + ((c.cl && c.cl[q]) | 0)).join(' · ') + ')');
            par(tr('Valor'), CLASSES.map((k, q) => nomeClasse(q) + ' ' + precoPeixe(i, q)).join(' · ') + ' fakes');
          }
          C.appendChild(F);
        };
        desenhaLista();
      });
    }

    // ---------------------------------------------------------------- a CAIXA (no minigame: ver e soltar) e as escolhas de isca/vara
    function abrirCaixa() {
      return new Promise((ok) => {
        const Pn = painel(tr('Caixa de peixes'), ok);
        const desenha = () => {
          const p = dadosP(), C = Pn.corpo; C.innerHTML = ''; Pn.tit.textContent = tr('Caixa de peixes') + ' · ' + p.caixa.length + '/' + CAIXA_MAX; Pn.abasEl.innerHTML = '';
          if (!p.caixa.length) { const t = document.createElement('div'); t.className = 'pcSub'; t.textContent = tr('A caixa está vazia.'); C.appendChild(t); }
          p.caixa.forEach((f, k) => {
            const L = linha(imgDe(iconePeixe(f.i), 80, 48), nomePeixe(f.i), nomeRar(PEIXES[f.i].r) + ' · ' + fmtKg(f.kg) + ' · ' + nomeClasse(f.c) + ' · ' + trf('vale {0} fakes', precoPeixe(f.i, f.c)), COR_RAR[PEIXES[f.i].r]);
            const b = botao(tr('Soltar')); b.onclick = () => { p.caixa.splice(k, 1); gravar(); Pn.msg.textContent = tr('O peixe voltou para o lago.'); desenha(); }; L.bts.appendChild(b); C.appendChild(L);
          });
          Pn.msg.textContent = Pn.msg.textContent || tr('Venda os peixes na casinha do seu Bené.');
        };
        desenha();
      });
    }
    function escolherIsca() {
      return new Promise((ok) => {
        const Pn = painel(tr('Escolha a isca'), ok), p = dadosP();
        ISCAS.forEach((I, k) => {
          if (nIsca(k) <= 0) return;
          const L = linha(imgDe(iconeIsca(k), 32, 32, 'pcIcoP'), tr(I.nome) + '  ×' + nIsca(k), p.isca === k ? tr('em uso') : '');
          if (p.isca === k) L.classList.add('on');
          const b = botao(p.isca === k ? tr('Em uso') : tr('Usar'), p.isca !== k); b.onclick = () => { p.isca = k; gravar(); Pn.fechar(); }; L.bts.appendChild(b); Pn.corpo.appendChild(L);
        });
        if (!Pn.corpo.children.length) Pn.msg.textContent = tr('Você está sem isca. Compre na casinha do seu Bené.');
      });
    }
    function escolherVara() {
      return new Promise((ok) => {
        const Pn = painel(tr('Escolha a vara'), ok), p = dadosP();
        p.varas.forEach((v) => {
          const V = VARAS[v], L = linha(imgDe(iconeVara(v), 32, 32, 'pcIcoP'), tr(V.nome), trf('Alcance {0} m', V.alc));
          if (p.vara === v) L.classList.add('on');
          const b = botao(p.vara === v ? tr('Em uso') : tr('Usar'), p.vara !== v); b.onclick = () => { p.vara = v; gravar(); Pn.fechar(); }; L.bts.appendChild(b); Pn.corpo.appendChild(L);
        });
      });
    }

    // ================================================================ O MINIGAME (na ponta do píer ou na beira, em 3D, como o chute da partida)
    //   estados: mira → forca (segurando LANÇAR: a barra é só a DISTÂNCIA, vai e volta) → swing → voo (a boia no ar) → [cine, se foi
    //   PERFEITO] → espera (beliscadas) → mordida (FISGAR!) → fisgou → briga → pegou (troféu, reação, caixa) | falhou (escapou/arrebentou)
    //   → recolhe → mira. Outro: assustou (puxou na beliscada).
    //   (6.6.0) A NOTA do lançamento vem de ONDE a isca caiu (a profundidade: a cor da água). Nota máxima = cena do LANÇAMENTO PERFEITO.
    const SINAL_VERGA = -1;
    // mostrando o peixe: o jogador vira um pouco para o lado (m.yaw0 - 0.45) e a câmera vem de frente                                            // (conferido na tela: assim a ponta verga para o lado da linha)
    const dirDe = (yaw) => ({ x: Math.cos(yaw), z: -Math.sin(yaw) });
    const angN = (a) => ((a + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
    // (6.6.1) madeira não é água: o píer, o deque oeste (com folga para fora) e a canoa
    const CANOA = { x0: -46.0, x1: -42.4, z0: 52.95, z1: 53.95 };
    function naAgua(x, z) {
      if (api.naDeque ? api.naDeque(x, z) : false) return false; const pr = api.PIER; if (x > pr.x0 - 0.4 && x < pr.x1 + 0.4 && z > pr.z0 - 0.4 && z < pr.z1 + 0.4) return false;
      const dq = api.DEQUE_OESTE; if (dq && x > dq.x0 - 0.5 && x < dq.x1 + 0.4 && z > dq.z0 - 0.4 && z < dq.z1 + 0.4) return false;
      if (x > CANOA.x0 && x < CANOA.x1 && z > CANOA.z0 && z < CANOA.z1) return false;
      return api.dentroLago(x, z, -0.7);
    }
    // a profundidade (0 raso … 1 miolo do poço): a mesma da cor da água (cidade.js: profLago)
    function profundidade(x, z) { if (api.profLago) return api.profLago(x, z); const L = api.LAGO, r = Math.hypot((x - L.cx) / L.rx, (z - L.cz) / L.rz); return clampN((0.62 - r) / 0.5, 0, 1); }
    const notaDe = (x, z) => Math.round(clampN(profundidade(x, z), 0, 1) * 100);
    // a distância pela barra (0 = 3 m, cheia = o alcance da vara) e o quanto cada vara espalha (varas melhores são mais precisas)
    const distLance = (v, vara) => 3 + clampN(v, 0, 1) * (VARAS[vara].alc - 3);
    const ESPALHA = [[0.055, 0.05], [0.05, 0.045], [0.045, 0.04], [0.04, 0.035], [0.035, 0.03]];   // [ângulo (rad), distância (fração)]
    const T_FORCA = 1.25;                                                // segundos para a barra ir de vazia a cheia (e volta)
    const NOMES_NOTA = ['Água rasa demais...', 'Lançamento fraco', 'Bom lançamento', 'Ótimo lançamento!', 'LANÇAMENTO PERFEITO!'];
    const CORES_NOTA = ['#8fc0ff', '#d8d4c8', '#8fe04a', '#f0a020', '#ffd84a'];
    const nomeFundo = (pf) => tr(pf >= 0.85 ? 'Poço fundo' : pf >= 0.6 ? 'Água funda' : pf >= 0.3 ? 'Água média' : 'Água rasa');
    function msgMg(txt, seg) { const m = P.mg; if (!m) return; m.U.recado.textContent = txt; m.tRec = seg || 2; }
    // VIBRAÇÃO do celular (leve na beliscada, forte na mordida, pulsos na briga): uma de cada vez, sem atropelar
    let vibAte = 0;
    function vib(pd, forte) {
      try { if (typeof navigator === 'undefined' || !navigator.vibrate) return; const t = performance.now(); if (!forte && t < vibAte) return; navigator.vibrate(pd); vibAte = t + (Array.isArray(pd) ? pd.reduce((a, b) => a + b, 0) : pd) + 30; } catch (e) { /* sem vibrar */ }
    }

    async function pescar(comCadu, lugar) {
      const s = S(), J = s.jog, p = dadosP(); if (!temVara() || P.mg) return;
      if (diaDeTrabalho()) { await semPescaHoje(); return; }
      prepararDuke();                                                     // (6.6.7) 13 de maio: baixa o duke.js
      const Lg = lugar || { x: PONTA.x, z: PONTA.z, yaw: YAW_BASE };
      if (totalIscas() <= 0) {
        if (comCadu && p.caduMinhoca !== s.dados.dia) { await api.fala('cadu', tr('Tá sem isca? Toma umas minhocas, por minha conta.')); p.iscas[0] = nIsca(0) + 5; p.caduMinhoca = s.dados.dia; p.isca = 0; gravar(); Dialogo.esconder(); }
        else { await api.fala('jog', tr('Estou sem isca... O seu Bené vende lá na casinha.')); Dialogo.esconder(); return; }
      }
      if (nIsca(p.isca) <= 0) p.isca = ISCAS.findIndex((_, k) => nIsca(k) > 0);
      await api.preto(true, 350);
      J.sentado = false; J.rota = null; J.andando = false; J.correndo = false; J.x = Lg.x; J.z = Lg.z; J.yaw = J.yawAlvo = Lg.yaw;
      const yChao = api.altura(Lg.x, Lg.z);
      const U = montarHud(), ui = api.UI(); const esqAntes = ui.esq.hidden, ctlAntes = ui.ctl ? ui.ctl.hidden : true; ui.esq.hidden = true; if (ui.ctl) ui.ctl.hidden = true; api.aviso('');   // (6.6.0) o joystick da cidade some na pesca (não serve para nada aqui)
      const m = P.mg = { e: 'mira', t: 0, ang: 0, ang0: 0, mira: 0, segura: false, forca: 0, comCadu: !!comCadu, U, tRec: 0, pausa: false, ocupado: false,
        vara: criarVara(p.vara), boiaM: criarBoia(), linha: criarLinha(), lider: criarLinha(), anzol: criarAnzol(), boiaP: null, bite: null, B: null, cam: null, pontos: [], alvoM: null,
        ox: Lg.x, oz: Lg.z, yaw0: Lg.yaw, y: yChao, lim: lugar ? 1.4 : 0.75, temIsca: true, nota: 50, pend: { x: 0, z: 0, vx: 0, vz: 0, ox: null } };
      varaNaMao(J.m, m.vara); P.isopor.visible = true; P.isopor.tampa.rotation.x = 0;
      if (lugar) {                                                        // a caixa de isopor do lado do jogador (do lado que for terra firme)
        const d = dirDe(Lg.yaw), lx = -d.z, lz = d.x; let ix = Lg.x + lx * 0.8 - d.x * 0.25, iz = Lg.z + lz * 0.8 - d.z * 0.25;
        if (api.dentroLago(ix, iz, 0.2)) { ix = Lg.x - lx * 0.8 - d.x * 0.25; iz = Lg.z - lz * 0.8 - d.z * 0.25; }
        if (api.dentroLago(ix, iz, 0.2)) { ix = Lg.x - d.x * 0.8; iz = Lg.z - d.z * 0.8; }
        P.isopor.position.set(ix, api.altura(ix, iz), iz); P.isopor.rotation.y = Lg.yaw + Math.PI / 2;
      } else { P.isopor.position.set(ISOPOR.x, Y_PIER, ISOPOR.z); P.isopor.rotation.y = 0.15; }
      for (let k = 0; k < 7; k++) { const d = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.02, 0.13), new THREE.MeshBasicMaterial({ color: 0xfff0c8, transparent: true, opacity: 0.75, depthWrite: false })); d.visible = false; d.renderOrder = 7; grupo().add(d); m.pontos.push(d); }
      { if (!geoAnel) anel(0, -900, 0.1); const a = new THREE.Mesh(geoAnel, new THREE.MeshBasicMaterial({ color: 0xf0a020, transparent: true, opacity: 0.85, depthWrite: false })); a.visible = false; a.renderOrder = 7; grupo().add(a); m.alvoM = a; }
      window.addEventListener('keydown', teclaMg, true); window.addEventListener('keyup', teclaMg, true);
      if (m.comCadu) msgMg(tr('Cadu') + ': ' + tr('Boa pescaria!'), 2.5);
      tickMg(0.016); s.cam.snap = true;
      await api.preto(false, 350);
      await new Promise((ok) => { m.fim = ok; });
      if (m.bagre) fimBagre(m); Rock.parar(true);
      await api.preto(true, 350);
      window.removeEventListener('keydown', teclaMg, true); window.removeEventListener('keyup', teclaMg, true);
      fecharPainel(); esconderBanner(); tirarVara(m.vara);
      for (const o of [m.boiaM, m.linha, m.lider, m.anzol, m.alvoM].concat(m.pontos)) { if (o.parent) o.parent.remove(o); if (o.material && o.material !== MAT_LINHA) o.material.dispose(); if (o.geometry && o.geometry !== geoAnel) o.geometry.dispose(); }
      m.anzol.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
      if (m.trofeu && m.trofeu.m.parent) m.trofeu.m.parent.remove(m.trofeu.m);
      if (m.voa && m.voa.m.parent) m.voa.m.parent.remove(m.voa.m);
      P.isopor.visible = false; U.el.remove(); P.mg = null;
      for (const v of (api.vitorias ? api.vitorias() : [])) { v.k = 0; v.px = v.pz = null; v.m.rotation.set(0, 0, 0); v.m.position.y = 0; }   // as vitórias-régias param de balançar
      const ss = S(); if (ss) { ss.camCena = null; ss.cam.snap = true; ss.jog.yaw = ss.jog.yawAlvo = 0; ui.esq.hidden = esqAntes; if (ui.ctl) ui.ctl.hidden = ctlAntes; }
      gravar();
      await api.preto(false, 350);
      if (m.comCadu && P.cadu && !P.cadu.oculto) aviso(tr('Cadu') + ': ' + tr('Valeu pela companhia!'), 2.5);
    }
    function sairDaPesca() { const m = P.mg; if (!m || m.ocupado || m.saindo || P.painel) return; if (['mira', 'espera', 'recolhe', 'assustou'].indexOf(m.e) < 0) return; m.saindo = true; if (m.fim) m.fim(); }
    async function painelNoMg(fn) {
      const m = P.mg; if (!m || m.ocupado || P.painel || m.e !== 'mira') return;
      m.pausa = true; m.mira = 0;
      try { await fn(); } finally { if (P.mg) { P.mg.pausa = false; trocarVaraMg(); } }
    }
    function trocarVaraMg() { const m = P.mg, p = dadosP(); if (!m || m.vara.v === p.vara) return; tirarVara(m.vara); m.vara = criarVara(p.vara); varaNaMao(S().jog.m, m.vara); }
    function teclaMg(e) {
      const m = P.mg; if (!m || P.painel) return;
      const desce = e.type === 'keydown';
      if (m.e === 'cine' && m.cine) { if (['Space', 'Enter', 'KeyE', 'Escape'].indexOf(e.code) >= 0) { e.preventDefault(); e.stopPropagation(); if (desce && !e.repeat) m.cine.pular = true; } return; }
      if (m.ocupado) return;
      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyE') { e.preventDefault(); e.stopPropagation(); if (desce && e.repeat) return; apertar(desce); }
      else if (e.code === 'ArrowLeft' || e.code === 'KeyA') { e.preventDefault(); e.stopPropagation(); m.mira = desce ? 1 : (m.mira > 0 ? 0 : m.mira); }
      else if (e.code === 'ArrowRight' || e.code === 'KeyD') { e.preventDefault(); e.stopPropagation(); m.mira = desce ? -1 : (m.mira < 0 ? 0 : m.mira); }
      else if (e.code === 'Escape' && desce) { e.preventDefault(); e.stopPropagation(); sairDaPesca(); }
    }
    function montarHud() {
      cssPesca();
      const el = document.createElement('div'); el.id = 'pcHud';
      el.innerHTML = '<div class="pcArrasto"></div><div class="pcChoque"></div>' +
        '<div class="pcEsq"><button type="button" class="pcQuad pcMenuB"><span class="pcMenuI"></span><span class="pcBadge"></span></button>' +
        '<div class="pcMenu" hidden><button type="button" class="pxBtn pcInfo pcIsca"></button><button type="button" class="pxBtn pcInfo pcVara"></button><button type="button" class="pxBtn pcInfo pcCaixa"></button><button type="button" class="pxBtn pcInfo pcCat"></button></div></div>' +
        '<div class="pcDir"><button type="button" class="pcQuad pcSair">✕</button></div>' +
        '<div class="pcRecado"></div><div class="pcDica"></div><div class="pcNota"><b></b><span></span></div>' +
        '<div class="pcBarra"><div class="pcZonas"></div><div class="pcFaixaZ"></div><div class="pcEnche"></div><div class="pcMarca"></div><span class="pcRot"></span></div>' +
        '<div class="pcBriga"><span class="pcDist"></span><span class="pcFolT"></span><div class="pcFol"><i></i></div>' +
        '<span class="pcRisT pcFrT"></span><div class="pcRis pcFr"><i></i></div><span class="pcRisT pcEsT"></span><div class="pcRis pcEs"><i></i></div></div>' +
        '<div class="pcCine"><i class="t"></i><i class="b"></i><span class="pcPlano"></span><div class="pcPerf"></div><span class="pcPular"></span></div>' +
        '<button type="button" class="pxBtn pxPrim pcAcao"></button>';
      (document.getElementById('raizJogo') || document.body).appendChild(el);
      const q = (s) => el.querySelector(s);
      const U = { el, isca: q('.pcIsca'), vara: q('.pcVara'), caixa: q('.pcCaixa'), cat: q('.pcCat'), sair: q('.pcSair'), recado: q('.pcRecado'), dica: q('.pcDica'),
        menuB: q('.pcMenuB'), menuI: q('.pcMenuI'), badge: q('.pcBadge'), menu: q('.pcMenu'), arrasto: q('.pcArrasto'), nota: q('.pcNota'), notaN: q('.pcNota b'), notaT: q('.pcNota span'),
        barra: q('.pcBarra'), zonas: q('.pcZonas'), faixa: q('.pcFaixaZ'), enche: q('.pcEnche'), marca: q('.pcMarca'), rot: q('.pcRot'), briga: q('.pcBriga'), dist: q('.pcDist'), folT: q('.pcFolT'), fol: q('.pcFol i'),
        fr: q('.pcFr i'), es: q('.pcEs i'), frT: q('.pcFrT'), esT: q('.pcEsT'), cine: q('.pcCine'), plano: q('.pcPlano'), perf: q('.pcPerf'), pular: q('.pcPular'),
        acao: q('.pcAcao'), choque: q('.pcChoque'), modo: '', cache: {} };
      U.cat.textContent = tr('Catálogo'); U.folT.textContent = tr('Fôlego do peixe'); U.frT.textContent = tr('Linha frouxa'); U.esT.textContent = tr('Linha esticada');
      U.perf.textContent = tr('LANÇAMENTO PERFEITO!'); U.pular.textContent = tr('Toque para pular');
      U.sair.setAttribute('aria-label', tr('Sair')); U.sair.title = tr('Sair'); U.menuB.setAttribute('aria-label', tr('Equipamento')); U.menuB.title = tr('Equipamento');
      // o menu do equipamento (isca, vara, caixa, catálogo) fica recolhido num quadradinho: tocar abre/fecha (fecha sozinho depois de uns segundos)
      let tMenu = 0;
      const menu = (abre) => { clearTimeout(tMenu); U.menu.hidden = !abre; if (abre) tMenu = setTimeout(() => { U.menu.hidden = true; }, 6000); };
      U.menuB.onclick = () => { SOM.toc(); menu(U.menu.hidden); };
      U.fecharMenu = () => menu(false);
      const segurar = (b, on, off) => {
        b.addEventListener('pointerdown', (e) => { e.preventDefault(); try { b.setPointerCapture(e.pointerId); } catch (x) { /* ok */ } on(); });
        for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) b.addEventListener(ev, () => off());
        b.addEventListener('contextmenu', (e) => e.preventDefault());
      };
      segurar(U.acao, () => apertar(true), () => apertar(false));
      // mirar arrastando o dedo na tela (como girar a câmera na cidade); na cena do lançamento perfeito, tocar pula
      const arr = { id: null, x: 0 };
      U.arrasto.addEventListener('pointerdown', (e) => { const m = P.mg; if (m && m.e === 'cine') { m.cine.pular = true; return; } if (arr.id != null) return; arr.id = e.pointerId; arr.x = e.clientX; try { U.arrasto.setPointerCapture(e.pointerId); } catch (x) { /* ok */ } if (!U.menu.hidden) menu(false); });
      U.arrasto.addEventListener('pointermove', (e) => {
        if (e.pointerId !== arr.id) return; const dx = e.clientX - arr.x; arr.x = e.clientX; const m = P.mg;
        if (!m || m.pausa || m.ocupado || !(m.e === 'mira' || m.e === 'forca')) return;
        m.ang = clampN(m.ang - dx * 0.0075, -m.lim, m.lim);
      });
      const solta = (e) => { if (e.pointerId === arr.id) arr.id = null; };
      U.arrasto.addEventListener('pointerup', solta); U.arrasto.addEventListener('pointercancel', solta);
      const noMenu = (fn) => () => { menu(false); painelNoMg(fn); };
      U.isca.onclick = noMenu(escolherIsca); U.vara.onclick = noMenu(escolherVara); U.caixa.onclick = noMenu(abrirCaixa); U.cat.onclick = noMenu(abrirCatalogo);
      U.sair.onclick = () => sairDaPesca();
      return U;
    }
    // a barra: no lançamento é a DISTÂNCIA (marquinhas a cada 25%); na briga é a TENSÃO com a FAIXA BOA (verde) andando por cima
    function zonasBarra(U, modo) {
      if (U.modo === modo) return; U.modo = modo;
      U.zonas.innerHTML = modo === 'forca' ? '<div class="pcZona" style="bottom:0;height:100%;background:linear-gradient(to top,#3a5a8a,#3f8fd0 60%,#9fd2ea);opacity:.6"></div>' + [25, 50, 75].map((v) => '<div class="pcTique" style="bottom:' + v + '%"></div>').join('')
        : '<div class="pcZona" style="bottom:0;height:100%;background:#3a2a1a;opacity:.7"></div>';
      U.faixa.style.display = modo === 'forca' ? 'none' : '';
      U.rot.textContent = modo === 'forca' ? tr('DISTÂNCIA') : tr('TENSÃO');
    }
    function apertar(on) {
      const m = P.mg; if (!m) return;
      if (m.e === 'cine') { if (on) m.cine.pular = true; return; }
      if (m.pausa || m.ocupado) { if (!on) m.segura = false; return; }
      m.segura = on;
      if (on) { if (m.e === 'mira') comecarForca(); else if (m.e === 'espera') puxarNaEspera(); else if (m.e === 'mordida') fisgar(); }
      else if (m.e === 'forca') soltarLance();
    }
    function irPara(e) { const m = P.mg; m.e = e; m.t = 0; if (e === 'mira') { m.boiaP = null; m.arrebentou = false; m.bite = null; m.B = null; m.de = null; m.comida = false; } }
    function comecarForca() {
      const m = P.mg, p = dadosP();
      if (nIsca(p.isca) <= 0) { const k = ISCAS.findIndex((_, q) => nIsca(q) > 0); if (k < 0) { msgMg(tr('Sem isca! Compre na casinha do seu Bené.'), 2.5); SOM.erro(); return; } p.isca = k; }
      m.e = 'forca'; m.t = 0; m.forca = 0; m.temIsca = true; m.iscaLance = p.isca;
    }
    // soltou: a barra diz a distância; a vara espalha um pouco (ângulo e distância). A nota já fica decidida aqui (a cena perfeita começa já)
    function soltarLance() {
      const m = P.mg, p = dadosP(), v = m.forca, E = ESPALHA[p.vara] || ESPALHA[0];
      const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
      m.dist = distLance(v, p.vara) * (1 + gauss() * E[1]); m.forcaUsada = Math.max(0.25, v);
      const yaw = m.yaw0 + m.ang + gauss() * E[0], d = dirDe(yaw);
      m.alvo = { x: m.ox + d.x * m.dist, z: m.oz + d.z * m.dist }; m.voo = null; m.e = 'swing'; m.t = 0; SOM.lanca();
      m.nota = naAgua(m.alvo.x, m.alvo.z) ? notaDe(m.alvo.x, m.alvo.z) : 0;
      if (m.nota >= NOTA_PERFEITA) comecarCine();
    }
    function pousou(semRespingo) {
      const m = P.mg, a = m.alvo; m.boiaP = { x: a.x, y: Y_AGUA, z: a.z };
      if (!naAgua(a.x, a.z)) { msgMg(tr("A isca caiu fora d'água!"), 2.2); SOM.erro(); m.e = 'falhou'; m.t = 1.0; m.de = { x: a.x, y: Y_AGUA + 0.3, z: a.z }; return; }
      if (!semRespingo) { respingo(a.x, a.z, 5, 0); SOM.agua(); }
      novaEspera(false);
      const n = m.nota, fx = faixaNota(n), pf = profundidade(a.x, a.z);
      mostrarNota(n, fx); msgMg(nomeFundo(pf) + ' · ' + trf('Nota {0}', n), 2.4);
    }
    function mostrarNota(n, fx) {
      const U = P.mg.U; U.notaN.textContent = String(n); U.notaN.style.color = CORES_NOTA[fx]; U.notaT.textContent = tr(NOMES_NOTA[fx]); U.notaT.style.color = CORES_NOTA[fx];
      U.nota.classList.add('on'); clearTimeout(U.tNota); U.tNota = setTimeout(() => U.nota.classList.remove('on'), 1900);
      if (fx >= 3) SOM.pegou(); else if (fx === 0) SOM.erro();
    }
    // a espera: o peixe (e o peso) já são sorteados com a NOTA; a nota também apressa (ou atrasa) a mordida
    function novaEspera(re) {
      const m = P.mg, p = dadosP(), q = (m.nota | 0) / 100, i = sortearPeixe(hora(), p.vara, p.isca, q), pw = sortearPeso(i, p.vara, undefined, q), d = dificuldade(i, pw.classe, p.vara, p.isca);
      const W = rnd(d.espera[0], d.espera[1]) * (api.chuva() ? 0.85 : 1) * (re ? 1.15 : 1) * (1.3 - 0.55 * q);
      const nb = d.beliscadas + (q < 0.3 ? 1 : 0);
      const bel = []; for (let k = 0; k < nb; k++) { const tb = rnd(1.5, Math.max(2, W - 1.4)); if (bel.every((x) => Math.abs(x - tb) > 1.2)) bel.push(tb); } bel.sort((a, c) => a - c);
      m.bite = { i, kg: pw.kg, classe: pw.classe, d, W, bel, isca: p.isca, nota: m.nota }; m.e = 'espera'; m.t = 0; m.belAtiva = -1; m.beliscando = false;
      if (dukeLivre() && (P.dukeForcado === 'sempre' || Math.random() < CHANCE_DUKE)) {   // (6.6.7) 13 de maio: quem mordeu foi ELE (briga de lendário)
        const ib = Math.max(0, PEIXES.findIndex((q) => q.id === 'pirarucu'));
        p.dukeDia = chaveDuke(); gravar();
        m.bite = { i: ib, kg: Math.round(rnd(40, 60) * 10) / 10, classe: 1, d: dificuldade(ib, 1, p.vara, p.isca), W, bel, isca: p.isca, nota: m.nota, duke: true };
      }
    }
    // ---- (6.6.7) O DUKE: no dia 13 de maio (a data do APARELHO, não a do jogo), cada mordida tem uma chancezinha de ser ele. Uma vez por dia.
    //   A briga é a de um lendário (sem pular para fora: ninguém vê o que é). Pegou: ele LEVITA para fora da água e ENCARA o jogador; o
    //   jogador encara ele... e ele volta para a água. Não vai para a caixa nem para o catálogo (fica só p.dukeVisto). O modelo 3D vem do
    //   duke.js, que só é baixado nesse dia (FutebolJS.carregarFase('duke'), ao começar a pescar).
    const CHANCE_DUKE = 0.07;
    const hojeDuke = () => { if (P.dukeForcado) return true; const d = new Date(); return d.getMonth() === 4 && d.getDate() === 13; };
    const chaveDuke = () => { const d = new Date(); return P.dukeForcado ? 'teste' : d.getFullYear() + '-05-13'; };
    const dukeLivre = () => hojeDuke() && !!P.dukeCriar && (P.dukeForcado === 'sempre' || dadosP().dukeDia !== chaveDuke());   // (6.6.8) ligado pelo painel do desenvolvedor: pode repetir
    function prepararDuke() {
      if (!hojeDuke() || P.dukeCriar || P.dukeBaixando) return;
      P.dukeBaixando = true;
      try { window.FutebolJS.carregarFase('duke').then((f) => { if (f && f.criar) P.dukeCriar = f.criar; }, () => { /* sem o arquivo: hoje não tem Duke */ }).finally(() => { P.dukeBaixando = false; }); }
      catch (e) { P.dukeBaixando = false; }
    }
    const DUKE_ESC = 1.45 / 336, DUKE_MEIO = 143;                         // o modelo tem ~336 de comprimento (z, a cara para +z): fica com ~1,45 m
    async function cenaDuke() {
      const m = P.mg, s = S(), p = dadosP(), o = m.peixeP || m.boiaP || { x: m.ox, z: m.oz };
      m.e = 'pegou'; m.t = 0; m.ocupado = true; m.segura = false; m.B = null; tirarPulo(m);
      let mod = null; try { mod = P.dukeCriar(); } catch (e) { console.error(e); }
      if (!mod) { escapou(tr('O peixe se soltou do anzol...')); return; }
      const g = new THREE.Group(); mod.raiz.scale.setScalar(DUKE_ESC); mod.raiz.position.y = -DUKE_MEIO * DUKE_ESC; g.add(mod.raiz); g.visible = false; grupo().add(g);
      p.dukeVisto = (p.dukeVisto | 0) + 1; gravar();
      const D = m.duke = { g, mod, t: 0, x: o.x, z: o.z, cam: null, boca: null, ok: null };
      m.U.el.classList.add('cine'); m.U.plano.textContent = ''; m.U.pular.textContent = ''; s.cam.snap = true; vib([30, 80, 30], true);
      await new Promise((ok) => { D.ok = ok; });
      if (P.mg !== m) return;
      D.parou = true; D.cam = null; m.camRosto = true; s.cam.snap = true;
      await api.esperar(1100);
      try { await api.fala('jog', tr('O que foi que acabou de acontecer....?')); Dialogo.esconder(); } catch (e) { console.error(e); }
      if (P.mg !== m) return;
      fimDuke(m); m.camRosto = false; m.ocupado = false; s.cam.snap = true;
      m.boiaP = { x: D.x, y: Y_AGUA, z: D.z }; recolher();
    }
    function fimDuke(m) {
      const D = m && m.duke; if (!D) return;
      try { D.mod.descartar(); } catch (e) { /* ok */ } if (D.g.parent) D.g.parent.remove(D.g);
      m.duke = null; m.U.el.classList.remove('cine'); m.U.pular.textContent = tr('Toque para pular');
    }
    // a cena, quadro a quadro: borbulha · LEVITA (girando até ficar de frente para o jogador, pingando) · encara (3 planos: por cima do
    //   ombro do jogador, por cima do "ombro" dele e o rosto dele, que inclina a cabeça) · desce de volta · a água se acalma
    const T_DK = [0.9, 4.3, 10.3, 13.1, 14.6];
    function tickDuke(m, dt) {
      const D = m.duke; if (!D || !D.g) return;
      D.t += dt; const t = D.t, J = S().jog, yJ = J.y || m.y, g = D.g, [T1, T2, T3, T4, T5] = T_DK, topo = Y_AGUA + 1.4;
      const vx = J.x - D.x, vz = J.z - D.z, L = Math.hypot(vx, vz) || 1, ux = vx / L, uz = vz / L, nx = -uz, nz = ux, aJ = Math.atan2(-uz, ux);   // u: dele para o jogador
      let y = Y_AGUA - 1.4, giro = 1.7, inclina = 0;
      if (t < T1) { if (Math.random() < dt * 14) anel(D.x + rnd(-0.7, 0.7), D.z + rnd(-0.7, 0.7), 0.35, 0); }
      else if (t < T2) {
        const u = suave((t - T1) / (T2 - T1)); y = lerpN(Y_AGUA - 1.1, topo, u); giro = 1.7 * (1 - suave(Math.min(1, (t - T1) / (T2 - T1 - 0.6))));
        if (!D.saiu && y > Y_AGUA - 0.4) { D.saiu = true; respingo(D.x, D.z, 16, 1.1); anel(D.x, D.z, 2.2, 1); SOM.agua(); }
        if (D.saiu && Math.random() < dt * 9) { const a = Math.random() * 6.28, r = rnd(0.1, 0.5); respingo(D.x + Math.cos(a) * r, D.z + Math.sin(a) * r, 1, 0); }   // pingando
      } else if (t < T3) {
        y = topo + Math.sin((t - T2) * 1.5) * 0.05; giro = 0;
        if (t > T2 + 4.2 && t < T2 + 5.6) inclina = Math.sin((t - T2 - 4.2) / 1.4 * Math.PI) * 0.22;   // inclina a cabeça, encarando
      } else if (t < T4) {
        const u = suave((t - T3) / (T4 - T3)); y = lerpN(topo, Y_AGUA - 1.5, u); giro = 0;
        if (!D.entrou && y < Y_AGUA + 0.1) { D.entrou = true; respingo(D.x, D.z, 18, 1.2); anel(D.x, D.z, 2.6, 1); SOM.agua(); vib(60, true); }
      } else { if (Math.random() < dt * 3) anel(D.x + rnd(-0.5, 0.5), D.z + rnd(-0.5, 0.5), 0.6, 0); if (t > T5 && D.ok) { const f = D.ok; D.ok = null; f(); } }
      g.visible = t >= T1 && t < T4 + 0.3;
      g.position.set(D.x, y, D.z); g.rotation.set(0, aJ + Math.PI / 2 + giro, inclina);
      g.updateMatrixWorld(true); V3b.set(0, -0.06, 0.6).applyMatrix4(g.matrixWorld);   // a boca (a cara fica em +z, ~0,6 m na frente do meio)
      D.boca = y > Y_AGUA - 0.15 && g.visible ? { x: V3b.x - api.OX, y: V3b.y, z: V3b.z } : { x: D.x, y: Y_AGUA - 0.02, z: D.z };
      // a câmera
      const mx = (D.x + J.x) / 2, mz = (D.z + J.z) / 2, lado = { px: mx + nx * (3.4 + L * 0.35), py: yJ + 1.5, pz: mz + nz * (3.4 + L * 0.35), tx: mx, ty: 0.9, tz: mz };
      if (D.parou) return;                                                 // acabou: a câmera é a do rosto do jogador (camRosto)
      D.plano = t < T2 ? 0 : t < T2 + 2.3 ? 1 : t < T2 + 4.2 ? 2 : t < T3 ? 3 : 4;
      if (t < T2 || t >= T3) D.cam = lado;
      else if (t < T2 + 2.3) D.cam = { px: J.x + ux * 1.7 + nx * 1.0, py: yJ + 2.1, pz: J.z + uz * 1.7 + nz * 1.0, tx: lerpN(J.x, D.x, 0.7), ty: lerpN(yJ + 1.5, y, 0.7), tz: lerpN(J.z, D.z, 0.7) };   // por cima do ombro do jogador: ele, lá no alto
      else if (t < T2 + 4.2) D.cam = { px: D.x + ux * 1.2 - nx * 1.3, py: topo + 0.2, pz: D.z + uz * 1.2 - nz * 1.3, tx: J.x, ty: yJ + 1.4, tz: J.z };   // do lado dele, na frente: o jogador encarando (ele no canto do quadro)
      else D.cam = { px: D.x + ux * 2.3, py: topo + 0.15, pz: D.z + uz * 2.3, tx: D.x, ty: y, tz: D.z };   // o rosto dele, de perto
    }

    function tickEspera() {
      const m = P.mg, b = m.bite; let ativa = -1;
      if (!m.bagre && m.t > 1.5 && !m.beliscando && bagreLivre()) { comecarBagre(); return; }
      for (let k = 0; k < b.bel.length; k++) if (m.t >= b.bel[k] && m.t < b.bel[k] + 0.4) ativa = k;
      if (ativa >= 0 && m.belAtiva !== ativa) { m.belAtiva = ativa; SOM.toc(); anel(m.boiaP.x, m.boiaP.z, 0.35); msgMg(tr('Beliscou...'), 0.9); vib(18); }
      m.beliscando = ativa >= 0 || (m.belAtiva >= 0 && m.t < b.bel[m.belAtiva] + 0.55);
      if (m.t >= b.W) {
        const p = dadosP(); p.iscas[b.isca] = Math.max(0, nIsca(b.isca) - 1); gravar();            // mordeu: a isca foi (pegando ou não)
        m.comida = true; m.e = 'mordida'; m.t = 0; SOM.ploc(); respingo(m.boiaP.x, m.boiaP.z, 4, 0.2); msgMg(tr('FISGA!'), 1);
        vib([90, 40, 170], true);
      }
    }
    function puxarNaEspera() {
      const m = P.mg;
      if (m.beliscando) { msgMg(tr('Puxou cedo! O peixe se assustou.'), 2); SOM.erro(); m.e = 'assustou'; m.t = 0; return; }
      recolher();
    }
    function fisgar() {
      const m = P.mg, b = m.bite, p = dadosP(), bonus = m.t < b.d.janela * 0.45 ? 0.08 : -0.05;
      m.B = novaBriga(Math.hypot(m.boiaP.x - m.ox, m.boiaP.z - m.oz), b.d, p.vara); m.B.firmeza = clampN(m.B.firmeza + bonus, 0.3, 0.98);
      m.ang0 = angN(Math.atan2(-(m.boiaP.z - m.oz), m.boiaP.x - m.ox) - m.yaw0);
      m.peixeP = { x: m.boiaP.x, z: m.boiaP.z }; m.e = 'fisgou'; m.t = 0; m.proxChoque = rnd(4, 7); m.corriaAntes = false; m.tVib = 0;
      SOM.ploc(); respingo(m.boiaP.x, m.boiaP.z, 6, 0.3); msgMg(tr('Fisgou!'), 1.2); vib(60, true);
    }
    function tickBriga(dt) {
      const m = P.mg, B = m.B, pe = PEIXES[m.bite.i];
      const r = passoBriga(B, m.segura && !m.pausa, dt);
      // (6.6.1) o peixe nunca passa por baixo da madeira (píer, deque, canoa) nem pela terra: se o lugar novo não é água, ele fica onde estava
      let d = dirDe(m.yaw0 + m.ang0 + B.lado), np = { x: m.ox + d.x * B.dist, z: m.oz + d.z * B.dist };
      if (!naAgua(np.x, np.z) && B.dist > 1.6) { B.lado *= 0.8; B.ladoAlvo = -B.ladoAlvo * 0.5; d = dirDe(m.yaw0 + m.ang0 + B.lado); np = { x: m.ox + d.x * B.dist, z: m.oz + d.z * B.dist }; if (!naAgua(np.x, np.z) && m.peixeP) np = m.peixeP; }
      m.peixeP = np;
      if (B.corre) { m.tAnel = (m.tAnel || 0) - dt; if (m.tAnel <= 0) { m.tAnel = 0.25; anel(m.peixeP.x, m.peixeP.z, 0.5 + B.forca * 0.6); } if (!m.segura) { m.tZum = (m.tZum || 0) - dt; if (m.tZum <= 0) { m.tZum = 0.45; SOM.zum(); } } }
      else if (m.segura) { m.tCli = (m.tCli || 0) - dt; if (m.tCli <= 0) { m.tCli = 0.085; SOM.clique(); } }
      // vibração da briga: arrancada do peixe, linha esticando (cada vez mais forte e mais rápido), linha frouxa (dois toquinhos) e o molinete
      m.tVib = (m.tVib || 0) - dt;
      if (B.corre && !m.corriaAntes) {
        if (!m.pulo && !m.bite.duke && (m.bagre ? Math.random() < 0.55 : (pe.f.t === 'p' || pe.f.t === 'l') && pe.r >= 2 && Math.random() < 0.4)) m.pulo = { t: 0, m: null };   // (6.6.7) o Duke não pula
        vib(70, true); m.tVib = 0.25;
      } else if (B.onde > 0) { if (m.tVib <= 0) { m.tVib = lerpN(0.32, 0.1, clampN(B.estica, 0, 1)); vib(Math.round(22 + 34 * clampN(B.estica, 0, 1))); } }
      else if (B.onde < 0 && B.frouxo > 0.2) { if (m.tVib <= 0) { m.tVib = 0.7; vib([12, 60, 12]); } }
      else if (m.segura && B.onde === 0) { if (m.tVib <= 0) { m.tVib = 0.24; vib(8); } }
      m.corriaAntes = B.corre;
      if (pe.id === 'poraque') {                                          // o poraquê dá choque de vez em quando: a tensão pula
        m.proxChoque -= dt;
        if (m.proxChoque <= 0) { m.proxChoque = rnd(5, 9); B.tensao = Math.min(0.97, B.tensao + 0.22); SOM.choque(); msgMg(tr('Levou um choque!'), 1.4); m.choque = 0.45; m.U.choque.style.opacity = '0.55'; vib([60, 40, 60], true); }
      }
      if (m.bagre) tickBrigaBagre(dt);
      if (m.choque > 0) { m.choque -= dt; if (m.choque <= 0) m.U.choque.style.opacity = '0'; }
      if (m.bagre && r) {
        if (r === 'pegou') cenaPegouBagre();
        else { if (r !== 'soltou') { SOM.arrebenta(); vib(300, true); } else vib([40, 40, 40], true); bagreEscapou(tr(r === 'arrebentou' ? 'A linha arrebentou!' : r === 'soltou' ? 'O peixe se soltou do anzol...' : 'Acabou a linha! O peixe levou tudo.'), r !== 'soltou'); }
        return;
      }
      if (r === 'pegou') { if (m.bite.duke) cenaDuke(); else cenaPegou(); }
      else if (r === 'arrebentou') { SOM.arrebenta(); vib(300, true); escapou(tr('A linha arrebentou!'), true); }
      else if (r === 'soltou') { vib([40, 40, 40], true); escapou(tr('O peixe se soltou do anzol...')); }
      else if (r === 'linha') { SOM.arrebenta(); vib(300, true); escapou(tr('Acabou a linha! O peixe levou tudo.'), true); }
    }
    function escapou(txt, arrebentou) {
      const m = P.mg, onde = m.peixeP || m.boiaP; msgMg(txt, 2.4); if (!arrebentou) SOM.erro();
      m.e = 'falhou'; m.t = 0; m.de = { x: onde.x, y: Y_AGUA + 0.02, z: onde.z }; m.arrebentou = !!arrebentou; m.B = null; tirarPulo(m);
      if (m.comCadu && P.cadu && !P.cadu.oculto && Math.random() < 0.6) setTimeout(() => { if (P.mg && P.mg.comCadu) msgMg(tr('Cadu') + ': ' + (arrebentou ? tr('Arrebentou? Solta a linha quando ele correr!') : tr('Ih, escapou! Faz parte.')), 2.6); }, 1500);
    }
    function recolher() { const m = P.mg; m.de = m.boiaP ? { x: m.boiaP.x, y: m.boiaP.y || Y_AGUA, z: m.boiaP.z } : mundo(m.vara.ponta); m.e = 'recolhe'; m.t = 0; m.bite = null; }
    function tirarPulo(m) { if (m.pulo && m.pulo.m) tirarMalha(m.pulo.m); m.pulo = null; }

    // ---- (6.6.0) a cena do LANÇAMENTO PERFEITO: o mesmo lançamento visto de 4 câmeras (em câmera lenta), a isca caindo no miolo do poço
    //   e a mensagem. A linha do tempo: tau < 0 = o jogador armando, 0–T_SWING = o balanço da vara, depois o voo (dur) e a água.
    const T_SWING = 0.17;
    const durVoo = (m) => 0.45 + m.dist / 32;
    function comecarCine() {
      const m = P.mg; m.e = 'cine'; m.t = 0; m.ocupado = true; m.segura = false;
      const D = durVoo(m), fim = T_SWING + D;
      // de que lado fica a câmera de lado: o contrário de onde o Cadu está (para ele não tampar)
      const d0 = dirDe(m.yaw0 + m.ang), C0 = P.cadu && !P.cadu.oculto && m.comCadu ? P.cadu : null;
      const lado = C0 && ((C0.x - m.ox) * -d0.z + (C0.z - m.oz) * d0.x) > 0 ? -1 : 1;
      m.cine = { k: -1, tp: 0, tau: -0.25, pular: false, caiu: false, msg: false, D, lado,
        planos: [{ de: -0.25, ate: T_SWING + 0.12, vel: 0.42, nome: 'lado' }, { de: 0.0, ate: T_SWING + D * 0.72, vel: 0.55, nome: 'isca' },
          { de: T_SWING - 0.02, ate: T_SWING + D * 0.94, vel: 0.85, nome: 'aberta' }, { de: T_SWING + D * 0.55, ate: fim + 0.95, vel: 0.45, nome: 'agua' }] };
      m.U.el.classList.add('cine'); m.U.perf.classList.remove('on'); proximoPlano(m); SOM.zum();
    }
    function proximoPlano(m) {
      const C = m.cine; C.k++; if (C.k >= C.planos.length) return fimCine(m);
      const pl = C.planos[C.k]; C.tp = 0; C.tau = pl.de; S().cam.snap = true;
      m.U.plano.textContent = (C.k + 1) + '/4';
    }
    function fimCine(m) {
      const C = m.cine; m.U.el.classList.remove('cine'); m.U.perf.classList.remove('on'); m.cine = null; m.ocupado = false;
      if (!C.caiu) { respingo(m.alvo.x, m.alvo.z, 8, 0.4); SOM.agua(); }
      S().cam.snap = true; pousou(true);
    }
    // onde a isca está no tempo tau (o mesmo voo do lançamento de verdade)
    function lanceEm(m, tau, tip) {
      const C = m.cine;
      if (tau < T_SWING) { C.e = tau < 0 ? 'forca' : 'swing'; C.t = Math.max(0, tau); m.boiaP = null; return; }
      if (!C.de) C.de = tip;                                               // a isca sai da ponta da vara no fim do balanço
      const u = clampN((tau - T_SWING) / C.D, 0, 1); C.e = u >= 1 ? 'agua' : 'voo'; C.t = tau;
      m.boiaP = { x: lerpN(C.de.x, m.alvo.x, u), y: lerpN(C.de.y, Y_AGUA, u) + Math.sin(u * Math.PI) * (1.2 + m.dist * 0.12), z: lerpN(C.de.z, m.alvo.z, u) };
      if (u >= 1) m.boiaP = { x: m.alvo.x, y: Y_AGUA + 0.015, z: m.alvo.z };
    }
    function tickCine(dt, tip) {
      const m = P.mg, C = m.cine;
      if (C.pular) {                                                     // pular: vai direto para a isca caindo na água (e, se já caiu, acaba)
        C.pular = false; if (C.msg) { fimCine(m); return; }
        C.k = 3; const p4 = C.planos[3]; C.tau = Math.max(C.tau, T_SWING + C.D - 0.02); C.tp = (C.tau - p4.de) / p4.vel; S().cam.snap = true; m.U.plano.textContent = '4/4';
      }
      const P2 = C.planos[C.k]; C.tp += dt; C.tau = P2.de + C.tp * P2.vel;
      lanceEm(m, C.tau, tip);
      if (P2.nome === 'agua' && !C.caiu && C.tau >= T_SWING + C.D) {
        C.caiu = true; respingo(m.alvo.x, m.alvo.z, 10, 0.5); SOM.agua(); anel(m.alvo.x, m.alvo.z, 1.4, 0.6);
      }
      if (P2.nome === 'agua' && C.caiu && !C.msg && C.tau >= T_SWING + C.D + 0.25) { C.msg = true; m.U.perf.classList.add('on'); SOM.lendario(); vib([30, 40, 30, 40, 120], true); }
      if (C.tau >= P2.ate) proximoPlano(m);
    }
    function camCine(m, J) {
      const C = m.cine, pl = C.planos[C.k], d = dirDe(m.yaw0 + m.ang), lado = { x: -d.z * C.lado, z: d.x * C.lado }, yJ = J.y || m.y, A = m.alvo, b = m.boiaP;
      if (pl.nome === 'lado') {                                            // de lado, perto: o balanço da vara (do lado sem o Cadu)
        return { px: J.x + lado.x * 2.7 + d.x * 0.35, py: yJ + 1.35, pz: J.z + lado.z * 2.7 + d.z * 0.35, tx: J.x + d.x * 0.7, ty: yJ + 1.45, tz: J.z + d.z * 0.7 };
      }
      if (pl.nome === 'isca') {                                            // seguindo a isca: da ponta da vara até perto da água
        const tip = mundo(m.vara.ponta), o = b || { x: tip.x, y: tip.y - 0.5, z: tip.z };
        return { px: o.x - d.x * 1.5 + lado.x * 0.35, py: o.y + 0.45, pz: o.z - d.z * 1.5 + lado.z * 0.35, tx: o.x + d.x * 2.2, ty: o.y - 0.15, tz: o.z + d.z * 2.2 };
      }
      if (pl.nome === 'aberta') {                                          // de longe, de lado: o arco inteiro
        const mx = (J.x + A.x) / 2, mz = (J.z + A.z) / 2, k = m.dist * 0.55 + 4;
        return { px: mx + lado.x * k, py: yJ + 2.2 + m.dist * 0.08, pz: mz + lado.z * k, tx: mx, ty: 1.0, tz: mz };
      }
      // rente à água, do outro lado do ponto onde ela cai, olhando de volta
      return { px: A.x + d.x * 2.4 + lado.x * 1.2, py: Y_AGUA + 0.32, pz: A.z + d.z * 2.4 + lado.z * 1.2, tx: A.x - d.x * 0.6, ty: Y_AGUA + 0.35, tz: A.z - d.z * 0.6 };
    }

    // ---- pegou: o peixe sai da água, o troféu, a reação, o catálogo e a caixa
    const REACAO = [   // [raridade][classe]: o que o jogador diz ({0} = nome do peixe)
      ['{0}! Tá magrinho, coitado... mas vale!', 'Peguei! {0}!', '{0}! E esse tá gordinho, hein!'],
      ['{0}! Meio magrinho, mas não é qualquer peixe!', 'Olha só: {0}! Não é todo dia que aparece!', '{0}! Que peixe pesado, que beleza!'],
      ['{0}?! Magrinho, mas é raro!', 'Não acredito! {0}! Esse é raro!', '{0}! Enorme! Que peixe raro!'],
      ['{0}?! Tá magro, mas é um peixe épico!', 'UAU! {0}! Que peixe incrível!', 'Meu Deus! {0} gigante!! Ninguém vai acreditar!'],
      ['{0}... LENDÁRIO! Mesmo magrinho, é lendário!', 'Isso é... {0}! UM PEIXE LENDÁRIO!', '{0} GIGANTE!!! Isso é história pra contar pro resto da vida!'],
    ];
    const REACAO_CADU = [
      ['Haha, esse é pequeno, mas conta!', 'Boa! Esse dá pra fritar.', 'Opa, esse tá bem servido!'],
      ['Olha só! Mandou bem!', 'Boa! Esse não aparece toda hora.', 'Que bicho bonito! Mandou bem demais!'],
      ['Caramba! Esse é raro, hein!', 'Caramba! Esse é raro, hein!', 'Que peixão! Esse é raro e ainda é grande!'],
      ['NÃO ACREDITO! Faz anos que eu tento pegar um desses!', 'NÃO ACREDITO! Faz anos que eu tento pegar um desses!', 'Rapaz! Isso é um troféu! Tira uma foto!'],
      ['Eu... eu tô sonhando? Um peixe lendário na minha frente!', 'Eu... eu tô sonhando? Um peixe lendário na minha frente!', 'Ninguém vai acreditar quando eu contar! LENDÁRIO!'],
    ];
    function mostrarBanner(b, novo, recorde) {
      // no topo da tela, compacto (2 linhas), sem tampar o que o jogador está vendo
      esconderBanner(); const pe = PEIXES[b.i], el = document.createElement('div'); el.id = 'pcBanner'; el.style.borderColor = COR_RAR[pe.r];
      el.innerHTML = '<div class="pcL1"><span class="pcRar"></span> · <span class="pcNomeP"></span></div><div class="pcL2"><span class="pcPeso"></span> · <span class="pcValor"></span>' + (novo || recorde ? ' · <span class="pcNovo"></span>' : '') + '</div>';
      const q = (s) => el.querySelector(s);
      q('.pcRar').textContent = nomeRar(pe.r).toUpperCase(); q('.pcRar').style.color = COR_RAR[pe.r]; q('.pcNomeP').textContent = nomePeixe(b.i);
      q('.pcPeso').textContent = fmtKg(b.kg) + ' ' + nomeClasse(b.classe) + ' (×' + String(MULT[b.classe]).replace('.', virgula() ? ',' : '.') + ')';
      q('.pcValor').textContent = trf('Vale {0} fakes', precoPeixe(b.i, b.classe));
      if (novo || recorde) q('.pcNovo').textContent = novo ? tr('NOVO NO CATÁLOGO!') : tr('NOVO RECORDE!');
      (document.getElementById('raizJogo') || document.body).appendChild(el);
      if (P.mg) P.mg.U.recado.style.visibility = 'hidden';               // o recado fica embaixo do banner
    }
    function esconderBanner() { const el = document.getElementById('pcBanner'); if (el) el.remove(); if (P.mg) P.mg.U.recado.style.visibility = ''; }
    async function cenaPegou() {
      const m = P.mg, b = m.bite, p = dadosP(), s = S(), J = s.jog, pe = PEIXES[b.i];
      m.e = 'pegou'; m.t = 0; m.ocupado = true; m.segura = false; m.B = null; tirarPulo(m);
      const peixe = malhaPeixe(b.i, b.kg); grupo().add(peixe);
      m.voa = { m: peixe, de: { x: m.peixeP.x, y: Y_AGUA, z: m.peixeP.z }, t: 0 };
      respingo(m.peixeP.x, m.peixeP.z, 8, Math.min(1, peixe.userData.L)); SOM.agua();
      await api.esperar(720); if (P.mg !== m) return;
      m.voa = null; if (peixe.parent) peixe.parent.remove(peixe);
      if (peixe.userData.L < 0.3) peixe.scale.setScalar(0.3);          // (6.6.1) peixinho muito pequeno: mostra um pouco maior (senão some na mão)
      // MOSTRANDO O PEIXE: os braços esticados para a frente, o peixe deitado de lado (o corpo inteiro virado para a câmera) e apoiado
      //   em cima das mãos, longe do peito. Peixe grande: as mãos mais abertas (uma em cada ponta).
      const grande = peixe.userData.L > 1.1, ab = poseTrofeu(peixe.userData.L);
      peixe.geometry.computeBoundingBox(); const bb = peixe.geometry.boundingBox, k = peixe.scale.x;
      peixe.position.set(ab.x + 0.03, ab.y + 0.05 - bb.min.y * k, 0); peixe.rotation.set(0, Math.PI / 2, 0); J.m.corpo.add(peixe);
      m.trofeu = { m: peixe, grande, ab };
      m.vara.raiz.visible = false;
      const c = p.cat[b.i] || (p.cat[b.i] = { n: 0, rec: 0, cl: [0, 0, 0] }), novo = !c.n, recorde = !novo && b.kg > c.rec;
      c.n++; c.cl[b.classe] = (c.cl[b.classe] | 0) + 1; if (b.kg > c.rec) c.rec = b.kg;
      p.total = (p.total | 0) + 1; if (pe.r === 4) p.lendarios = (p.lendarios | 0) + 1; P.versao++;
      // (6.6.0) o primeiro peixe do dia acalma: +5 no "tranquilo" (escala −100 a +100; seria +0,5 numa de 0 a 10). Uma vez por dia.
      const dd = s.dados.dia, tranq = p.tranqDia !== dd; if (tranq) { p.tranqDia = dd; try { if (typeof Espectros !== 'undefined') Espectros.mover('tranquilo', 5, 'pescou no lago'); } catch (e) { /* ok */ } }
      gravar();
      (pe.r >= 4 ? SOM.lendario : pe.r >= 2 ? SOM.raro : SOM.pegou)(); vib(pe.r >= 3 ? [60, 40, 60, 40, 220] : [60, 40, 160], true);
      mostrarBanner(b, novo, recorde);
      await api.esperar(1000);
      try {
        await api.fala('jog', trf(REACAO[pe.r][b.classe], nomePeixe(b.i)));
        if (novo && pe.r >= 2) await api.fala('jog', tr('Primeira vez que eu pego esse peixe! Vou mostrar pro seu Bené.'));
        if (m.comCadu && P.cadu && !P.cadu.oculto) { s.falantesExtra = s.falantesExtra || {}; s.falantesExtra.cadu = { A: P.cadu, nome: tr('Cadu'), voz: 2 }; await api.fala('cadu', tr(REACAO_CADU[pe.r][b.classe])); }
        // (6.6.1) guardar na caixa ou SOLTAR (com as falas do jogador e a reação do Cadu)
        const op = await Escolha.mostrar(tr('O que fazer com o peixe?'), [tr('Guardar na caixa'), tr('Soltar no lago')], { centro: true }); Dialogo.esconder();
        if (op === 1) await soltarPeixe(b, peixe, m); else await guardarNaCaixa(b, peixe, m);
      } catch (e) { console.error(e); }
      esconderBanner(); if (peixe.parent) peixe.parent.remove(peixe); m.trofeu = null; m.guarda = null; m.vara.raiz.visible = true;
      if (P.isopor) P.isopor.tampa.rotation.x = 0;
      gravar(); m.ocupado = false; if (P.mg === m) { irPara('mira'); if (tranq) setTimeout(() => { if (P.mg === m) msgMg(tr('Pescar acalma a cabeça. Você está mais tranquilo hoje.'), 3.2); }, 1800); }
    }
    // ---- (6.6.1) SOLTAR o peixe: a fala do jogador (magrinho: "deixa engordar"; gordinho e raro: "mesmo assim vou soltar") e o Cadu reagindo
    //   pela raridade (magrinho: ele concorda; gordinho/normal: cada vez mais espantado). Lendário (não magrinho) com o Cadu: a CENA SECRETA.
    const FALA_SOLTA = {
      magro: 'Tá magrinho... É melhor soltar pra ele engordar um pouco. Depois a gente pesca ele de novo!',
      gordoRaro: '{0} gordinho e raro... mas mesmo assim, vou soltar esse.',
      gordo: 'Tá gordinho... mas vou soltar esse mesmo. Vai, {0}!',
      comum: 'Volta pro lago, {0}! Cresce mais um pouco.',
      lendario: 'Um lendário... e mesmo assim eu vou soltar. O lago merece ele mais do que eu. Vai, {0}!',
    };
    const CADU_SOLTA_MAGRO = ['Boa! Deixa ele crescer.', 'Apesar de ser incomum de ver, é melhor mesmo. Ele volta maior.', 'Raro assim é difícil de largar... mas magrinho desse jeito, é melhor mesmo.',
      'Um épico magrinho... tá certo. Dói no coração, mas tá certo.', 'Eu não soltaria esse nem se viesse só o esqueleto! É quase impossível pescar um... mas tá, o peixe é seu.'];
    const CADU_SOLTA = ['Soltou? Tranquilo, desse tem de monte no lago.', 'Ué, vai soltar? Esse não aparece toda hora, hein!', 'Peraí... você soltou um peixe RARO?! Assim, de boa?!',
      'NÃO! Um ÉPICO?! Você... soltou... um épico. Eu preciso sentar. Eu já tô sentado. Eu preciso sentar MAIS.'];
    async function soltarPeixe(b, peixe, m) {
      const p = dadosP(), pe = PEIXES[b.i], c = b.classe, r = pe.r, nome = nomePeixe(b.i), s = S();
      const comCadu = m.comCadu && P.cadu && !P.cadu.oculto;
      const fj = c === 0 ? FALA_SOLTA.magro : r === 4 ? FALA_SOLTA.lendario : c === 2 && r >= 2 ? FALA_SOLTA.gordoRaro : c === 2 ? FALA_SOLTA.gordo : FALA_SOLTA.comum;
      await api.fala('jog', trf(fj, nome));
      p.soltos = (p.soltos | 0) + 1; gravar();
      if (comCadu) {
        s.falantesExtra = s.falantesExtra || {}; s.falantesExtra.cadu = { A: P.cadu, nome: tr('Cadu'), voz: 2 };
        if (c === 0) await api.fala('cadu', tr(CADU_SOLTA_MAGRO[r]));
        else if (r === 4) { Dialogo.esconder(); await jogarNaAgua(peixe, m); await cenaSecretaCadu(m); return; }
        else await api.fala('cadu', tr(CADU_SOLTA[r]));
      }
      Dialogo.esconder();
      await jogarNaAgua(peixe, m);
      msgMg(tr('O peixe voltou para o lago.'), 2);
    }
    // o peixe sai das mãos, faz um arco e cai na água na frente do jogador
    async function jogarNaAgua(peixe, m) {
      const pos = mundo(peixe), d = dirDe(m.yaw0), alvo = { x: m.ox + d.x * 2.2, z: m.oz + d.z * 2.2 };
      if (peixe.parent) peixe.parent.remove(peixe); peixe.position.set(pos.x, pos.y, pos.z); peixe.rotation.set(0, m.yaw0 + Math.PI / 2, 0); grupo().add(peixe);
      m.trofeu = null; m.solta = { m: peixe, de: pos, alvo, t: 0 }; SOM.toc();
      await api.esperar(620);
      m.solta = null; if (peixe.parent) peixe.parent.remove(peixe); respingo(alvo.x, alvo.z, 8, 0.4); SOM.agua(); anel(alvo.x, alvo.z, 1.0, 0.3);
      await api.esperar(400);
    }
    // a CENA SECRETA: soltou um lendário na frente do Cadu. Ele larga a vara, levanta, fica revoltado... e depois se acalma.
    async function cenaSecretaCadu(m) {
      const p = dadosP(), C = P.cadu, cp = P.cp, s = S(), vez = (p.cenaSecretaCadu | 0) + 1; p.cenaSecretaCadu = vez; gravar();
      const antes = { e: cp.e, t: cp.t }; tirarPeixeCadu(cp);
      cp.e = 'brabo'; cp.furia = 0.3; C.sentado = false; C.conversando = true;
      C.yawAlvo = C.yaw = Math.atan2(-(m.oz - C.z), m.ox - C.x);          // vira para o jogador
      m.camCadu = true; s.cam.snap = true; SOM.erro(); vib([80, 60, 80, 60, 200], true);
      try {
        const F = (t) => api.fala('cadu', tr(t));
        if (vez > 1) {
          cp.furia = 1; await F('DE NOVO?! Você soltou OUTRO lendário?!'); await F('Eu não acredito. Eu NÃO acredito. Eu vou contar pro seu Bené!');
          cp.furia = 0.2; await F('...tá. Tá bom. Mas eu tô de olho em você, hein.');
        } else {
          await F('...');
          cp.furia = 0.6; await F('Espera. Você... SOLTOU... UM LENDÁRIO?!');
          cp.furia = 1; await F('Sabe há quantos anos eu sento nesse píer esperando um desses?! ANOS!');
          await F('EU VOU PULAR NESSE LAGO ATRÁS DELE!');
          await api.fala('jog', tr('Calma, Cadu! Calma!'));
          cp.furia = 0.15; await F('...');
          await F('Tá. Tá bom. Respira, Cadu. Respira.');
          await F('Mas se alguém perguntar, eu nunca vi isso. Combinado?');
          await api.fala('jog', tr('Combinado.'));
        }
        Dialogo.esconder();
      } finally {
        m.camCadu = false; s.cam.snap = true; cp.furia = 0; C.conversando = false;
        if (P.cadu === C) { C.sentado = true; C.assento = Y_PIER; C.yawAlvo = C.yaw = LUGAR_CADU.yaw; cp.e = 'espera'; cp.t = Math.max(6, antes.t || 8); cp.vara.raiz.visible = true; }
      }
      msgMg(tr('O peixe voltou para o lago.'), 2);
    }
    async function guardarNaCaixa(b, peixe, m) {
      const p = dadosP();
      if (p.caixa.length >= CAIXA_MAX) {
        let barato = -1, vb = 1e9; p.caixa.forEach((f, k) => { const v = precoPeixe(f.i, f.c); if (v < vb) { vb = v; barato = k; } });
        const ops = [tr('Soltar este peixe')]; if (barato >= 0 && vb <= precoPeixe(b.i, b.classe)) ops.push(trf('Soltar o mais barato da caixa ({0}) e guardar este', nomePeixe(p.caixa[barato].i)));
        const r = await Escolha.mostrar(trf('A caixa está cheia ({0}/{1}). O que fazer?', p.caixa.length, CAIXA_MAX), ops, { centro: true }); Dialogo.esconder();
        if (r !== 1) { msgMg(tr('O peixe voltou para o lago.'), 2); { const d = dirDe(m.yaw0); respingo(m.ox + d.x * 1.6, m.oz + d.z * 1.6, 4, 0.1); } return; }
        p.caixa.splice(barato, 1);
      }
      p.caixa.push({ i: b.i, kg: b.kg, c: b.classe }); gravar();
      // a tampa do isopor abre e o peixe entra
      const pos = mundo(peixe); if (peixe.parent) peixe.parent.remove(peixe); peixe.position.set(pos.x, pos.y, pos.z); peixe.rotation.set(0, 0.15, 0); grupo().add(peixe);
      P.isopor.tampa.rotation.x = -1.1; m.guarda = { m: peixe, de: pos, t: 0, k0: peixe.scale.x }; SOM.toc();
      await api.esperar(560);
      if (peixe.parent) peixe.parent.remove(peixe); P.isopor.tampa.rotation.x = 0; SOM.toc();
      msgMg(trf('Guardado na caixa ({0}/{1})', p.caixa.length, CAIXA_MAX), 2);
    }

    // ---- o BAGRE-TROVÃO: pescando à MEIA-NOITE (0h–1h) num dia de CHUVA, um raio cai na água e algo puxa a isca. A briga é de lendário,
    //   mais comprida (o bicho não sai da água descansado), com rock, raios caindo no lago, choque na linha e saltos cheios de faíscas.
    //   Não entra no catálogo nem na caixa: fica guardado (pesca.bagre = { dia, kg }) para mostrar ao seu Bené no outro dia.
    //   Perdeu: silêncio... e o jogador solta o que ficou entalado. O relógio para durante o evento (a briga não atravessa as 2h).
    const bagreLivre = () => { const p = dadosP(); return !p.bagre && p.bagreNoite !== S().dados.dia && hora() < 1 && api.chuva(); };   // uma vez por noite
    function segurarTempestade() { const C = S().clima; if (!C) return; C.estado = 'chuva'; C.t = Math.min(C.t || 0, 1); C.dur = Math.max(C.dur || 0, 600); C.trov = 999; }
    function soltarTempestade() { const C = S().clima; if (!C) return; C.t = 0; C.dur = 50 + Math.random() * 40; C.trov = 6 + Math.random() * 8; }
    function comecarBagre() {
      const m = P.mg, p = dadosP(), isca = m.bite ? m.bite.isca : p.isca, ib = Math.max(0, PEIXES.findIndex((q) => q.id === 'pirarucu'));
      const d = dificuldade(ib, 2, p.vara, isca);
      d.folego *= 3; d.zona = clampN(d.zona * 1.38, 0.14, 0.5); d.tremor *= 1.1;   // (simulado: a chance é a de um lendário, mas a briga dura uns 2× mais)
      p.iscas[isca] = Math.max(0, nIsca(isca) - 1); p.bagreNoite = S().dados.dia; gravar(); m.comida = true;
      m.bite = { i: ib, kg: Math.round(rnd(150, 185) * 10) / 10, classe: 2, d, W: 0, bel: [], isca, nota: m.nota, bagre: true };
      const bp = m.boiaP, a = Math.atan2(-(bp.z - m.oz), bp.x - m.ox), dd = dirDe(a);
      let ix = bp.x + dd.x * 3.2, iz = bp.z + dd.z * 3.2; if (!naAgua(ix, iz)) { ix = bp.x + dd.x * 1.4; iz = bp.z + dd.z * 1.4; }
      m.bagre = { e: 'raio', imp: { x: ix, z: iz }, lado: Math.random() < 0.5 ? -1 : 1, fase: 0, tBolha: 0 };
      m.e = 'raio'; m.t = 0; m.ocupado = true; m.segura = false; m.beliscando = false; m.camB = null;
      m.U.el.classList.add('cine'); m.U.plano.textContent = ''; m.U.pular.textContent = '';
      segurarTempestade(); SOM.trovaoLonge(0.1);
    }
    function impactoRaio() {
      const m = P.mg; if (!m || !m.bagre) return; const I = m.bagre.imp; m.bagre.tocou = true;
      relampago(1.4); SOM.trovaoPerto(); SOM.estalos(); vib([200, 60, 120], true);
      respingo(I.x, I.z, 18, 1.3); anel(I.x, I.z, 2.6, 1); anelCor(I.x, I.z, 3.6, 0x8ff0ff, 1.5); anelCor(I.x, I.z, 1.8, 0xffffff, 0.7);
      faiscas(I.x, Y_AGUA + 0.1, I.z, 34, 1.7); vapor(I.x, I.z, 12); brilhoEm(I.x, Y_AGUA + 0.4, I.z, 8, 1.1, 0x9fe8ff);
    }
    // a cena do raio: o céu, o raio caindo (câmera lenta, a câmera desce junto), a água fervendo, algo nadando até a boia, o puxão e o "eita"
    function tickCenaRaio(dt) {
      const m = P.mg, G = m.bagre, t = m.t, I = G.imp, bp = m.boiaP;
      segurarTempestade();
      if (t > 0.35 && !G.f1) { G.f1 = true; relampago(0.35); }
      if (t > 0.85 && !G.f2) { G.f2 = true; relampago(0.25); SOM.trovaoLonge(0.3); }
      if (t >= 1.4 && !G.raio) G.raio = criarRaio({ x: I.x + rnd(-3, 3), y: 34, z: I.z + rnd(-3, 3) }, { x: I.x, y: Y_AGUA, z: I.z }, { desce: 1.15, esp: 0.2, galhos: 7, some: 0.7, aoTocar: impactoRaio });
      if (G.tocou && t < 4.6) { G.tBolha -= dt; if (G.tBolha <= 0) { G.tBolha = 0.14; anel(I.x + rnd(-0.8, 0.8), I.z + rnd(-0.8, 0.8), 0.35, 0); if (Math.random() < 0.35) faiscas(I.x + rnd(-0.5, 0.5), Y_AGUA + 0.05, I.z + rnd(-0.5, 0.5), 3, 0.6); if (Math.random() < 0.25) vapor(I.x, I.z, 1); } }
      if (t >= 3.1 && t < 4.5) {                                          // a sombra acesa nadando do raio até a boia
        if (!G.sombra) { G.sombra = halo(0x5fd8ff, 2.4, 0.55); grupo().add(G.sombra); }
        const u = suave((t - 3.1) / 1.25); G.sombra.position.set(lerpN(I.x, bp.x, u), Y_AGUA + 0.03, lerpN(I.z, bp.z, u)); G.sombra.material.opacity = 0.45 + 0.2 * Math.sin(t * 30);
        if (Math.random() < dt * 9) anel(G.sombra.position.x, G.sombra.position.z, 0.5, 0.2);
      }
      if (t >= 4.5 && !G.puxou) {
        G.puxou = true; if (G.sombra) { tirarMalha(G.sombra); G.sombra = null; }
        respingo(bp.x, bp.z, 14, 0.9); anelCor(bp.x, bp.z, 1.8, 0x8ff0ff, 1); faiscas(bp.x, Y_AGUA + 0.1, bp.z, 16, 1.1); SOM.agua(); SOM.ploc(); SOM.zap(); vib([120, 40, 200], true);
        m.peixeP = { x: bp.x, z: bp.z };
      }
      if (t >= 5.4 && !G.eita) { G.eita = true; relampago(0.55); SOM.trovaoLonge(0.4); dizerEita(m); }
      m.camB = camRaio(m, t);
    }
    function camRaio(m, t) {
      const J = S().jog, G = m.bagre, I = G.imp, bp = m.boiaP, yJ = J.y || m.y, a = Math.atan2(-(I.z - m.oz), I.x - m.ox), d = dirDe(a), lado = { x: -d.z * G.lado, z: d.x * G.lado };
      if (t < 1.4) { const k = t / 1.4; return { px: J.x - d.x * (3.4 - k * 0.8) + lado.x * 1.3, py: yJ + 1.25, pz: J.z - d.z * (3.4 - k * 0.8) + lado.z * 1.3, tx: I.x, ty: 2.2 + k * 2.2, tz: I.z }; }
      if (t < 2.8) { const k = clampN((t - 1.4) / 1.15, 0, 1), ty = Math.max(1.0, lerpN(26, Y_AGUA, k * k)); return { px: I.x + lado.x * 10 - d.x * 3, py: 1.3, pz: I.z + lado.z * 10 - d.z * 3, tx: I.x, ty, tz: I.z }; }
      if (t < 4.4) { const mx = (I.x + bp.x) / 2, mz = (I.z + bp.z) / 2; return { px: mx + lado.x * 4.2 - d.x * 1.5, py: 1.0, pz: mz + lado.z * 4.2 - d.z * 1.5, tx: mx, ty: 0.15, tz: mz }; }
      if (t < 5.4) return { px: bp.x - d.x * 2.0 + lado.x * 1.1, py: 0.75, pz: bp.z - d.z * 2.0 + lado.z * 1.1, tx: bp.x, ty: 0.05, tz: bp.z };
      const f = dirDe(J.yaw); return { px: J.x + f.x * 1.75 + lado.x * 0.45, py: yJ + 1.55, pz: J.z + f.z * 1.75 + lado.z * 0.45, tx: J.x, ty: yJ + 1.42, tz: J.z };
    }
    async function dizerEita(m) {
      try { await api.fala('jog', tr('Eita...')); await api.fala('jog', tr('Eita, eita, EITA! Tem alguma coisa ENORME aqui!')); Dialogo.esconder(); } catch (e) { console.error(e); }
      if (P.mg === m && m.bagre) comecarBrigaBagre();
    }
    function comecarBrigaBagre() {
      const m = P.mg, G = m.bagre, p = dadosP(), b = m.bite;
      m.U.el.classList.remove('cine'); m.ocupado = false; m.camB = null; S().cam.snap = true;
      m.B = novaBriga(Math.hypot(m.boiaP.x - m.ox, m.boiaP.z - m.oz), b.d, p.vara); m.B.firmeza = clampN(m.B.firmeza + 0.05, 0.3, 0.98);
      m.ang0 = angN(Math.atan2(-(m.boiaP.z - m.oz), m.boiaP.x - m.ox) - m.yaw0);
      m.peixeP = { x: m.boiaP.x, z: m.boiaP.z }; m.e = 'fisgou'; m.t = 0; m.proxChoque = rnd(6, 9); m.corriaAntes = false; m.tVib = 0;
      G.e = 'briga'; G.fase = 1; G.tRaio = rnd(3, 5); G.tFaisca = 0;
      Rock.tocar(); msgMg(tr('Algo ENORME fisgou a isca!'), 2.6);
    }
    // um raio caindo no lago (longe, ou perto nas fases mais bravas)
    function raioPerto(m, perto) {
      const d = dirDe(m.yaw0 + rnd(-1.1, 1.1)), dist = perto ? rnd(9, 16) : rnd(22, 45), x = m.ox + d.x * dist, z = m.oz + d.z * dist, agua = naAgua(x, z);
      criarRaio({ x: x + rnd(-5, 5), y: 42, z: z + rnd(-5, 5) }, { x, y: agua ? Y_AGUA : superficie(x, z), z }, { desce: 0.12, esp: perto ? 0.15 : 0.22, galhos: 3, aoTocar: () => {
        relampago(perto ? 0.9 : 0.5); if (perto) SOM.trovaoPerto(); else SOM.trovaoLonge(dist / 70);
        if (agua) { respingo(x, z, perto ? 10 : 4, 0.8); anelCor(x, z, 2.6, 0x8ff0ff, 1.2); if (perto) faiscas(x, Y_AGUA + 0.1, z, 14, 1.2); }
      } });
    }
    // os extras da briga com o bagre (depois do passoBriga de cada quadro)
    function tickBrigaBagre(dt) {
      const m = P.mg, B = m.B, G = m.bagre, f = B.folego / B.folego0;
      segurarTempestade();
      if (!B.corre && B.dist < 4.5 && f > 0.25) {                        // chegou perto ainda descansado: dispara de novo
        B.corre = true; B.tFase = 1.4 + Math.random() * 0.9; B.ladoAlvo = (Math.random() < 0.5 ? -1 : 1) * (0.35 + Math.random() * 0.3);
        msgMg(tr('Ele não quer sair da água!'), 1.8);
      }
      const fase = f > 0.66 ? 1 : f > 0.33 ? 2 : 3;
      if (fase > G.fase) {
        G.fase = fase; Rock.nivel(fase); raioPerto(m, true); vib([80, 40, 80], true);
        msgMg(tr(fase === 2 ? 'A tempestade ficou mais forte!' : 'Ele está cansando! Segura firme!'), 2.6);
      }
      G.tRaio -= dt; if (G.tRaio <= 0) { G.tRaio = [0, rnd(5, 8), rnd(3.5, 5.5), rnd(2.2, 3.6)][G.fase]; raioPerto(m, G.fase >= 2 && Math.random() < 0.5); }
      if (G.fase >= 2) {                                                  // choque na linha
        m.proxChoque -= dt;
        if (m.proxChoque <= 0) {
          m.proxChoque = rnd(5, 8) - G.fase * 0.8; B.tensao = Math.min(0.97, B.tensao + 0.14); SOM.choque(); SOM.zap(); msgMg(tr('Choque na linha!'), 1.3);
          m.choque = 0.4; m.U.choque.style.opacity = '0.5'; vib([60, 40, 60], true);
          const tip = mundo(m.vara.ponta); faiscas(tip.x, tip.y, tip.z, 10, 0.6); faiscas(m.peixeP.x, Y_AGUA + 0.1, m.peixeP.z, 12, 0.9);
        }
      }
      G.tFaisca -= dt;
      if (G.tFaisca <= 0) { G.tFaisca = B.corre ? 0.12 : 0.4; faiscas(m.peixeP.x + rnd(-0.3, 0.3), Y_AGUA + 0.05, m.peixeP.z + rnd(-0.3, 0.3), B.corre ? 4 : 2, 0.6); if (B.corre) anelCor(m.peixeP.x, m.peixeP.z, 0.9, 0x5fd8ff, 0.6); }
      if (m.pulo && m.pulo.m && !m.pulo.fx) {                             // o salto: clarão, faíscas e raiozinhos do corpo para a água
        m.pulo.fx = true; relampago(0.45); SOM.zap(); SOM.estalos();
        for (let k = 0; k < 3; k++) { const o = m.peixeP, a = Math.random() * 6.28, r = rnd(0.8, 1.8); criarRaio({ x: o.x, y: 1.1, z: o.z }, { x: o.x + Math.cos(a) * r, y: Y_AGUA, z: o.z + Math.sin(a) * r }, { desce: 0.03, esp: 0.04, galhos: 0, some: 0.25, desvio: 0.25 }); }
      }
    }
    // o brilho do bicho embaixo d'água (na briga, e fugindo quando escapa)
    function tickLuzBagre(m, dt) {
      const G = m.bagre; if (!G) return;
      const onde = G.foge ? G.foge : (m.e === 'briga' || m.e === 'fisgou') && m.peixeP ? m.peixeP : null;
      if (!onde) { if (G.luz) { tirarMalha(G.luz); G.luz = null; } return; }
      if (!G.luz) { G.luz = halo(0x5fd8ff, 2.4, 0.5); grupo().add(G.luz); }
      if (G.foge) { const F = G.foge; F.t += dt; F.x += F.vx * dt; F.z += F.vz * dt; if (F.t > 2.6) { tirarMalha(G.luz); G.luz = null; G.foge = null; return; } }
      const t = S().t, fade = G.foge ? 1 - G.foge.t / 2.6 : 1, k = 2.2 + Math.sin(t * 7) * 0.3 + (m.B && m.B.corre ? 0.6 : 0);
      G.luz.position.set(onde.x, Y_AGUA + 0.03, onde.z); G.luz.scale.set(k, k, 1); G.luz.material.opacity = (0.38 + 0.14 * Math.sin(t * 23)) * fade;
    }
    function fimBagre(m) {
      const G = m.bagre; if (G) { if (G.luz) tirarMalha(G.luz); if (G.sombra) tirarMalha(G.sombra); }
      m.bagre = null; m.camB = null; m.camRosto = false; m.U.el.classList.remove('cine'); soltarTempestade();
    }
    // perdeu: a música corta, o brilho foge pelo lago... silêncio... e o desabafo
    async function bagreEscapou(txt, arrebentou) {
      const m = P.mg, G = m.bagre, onde = m.peixeP || m.boiaP;
      Rock.parar(true);
      m.e = 'perdeu'; m.t = 0; m.ocupado = true; m.segura = false; m.de = { x: onde.x, y: Y_AGUA + 0.02, z: onde.z }; m.arrebentou = !!arrebentou; m.B = null; tirarPulo(m);
      msgMg(txt, 2.4);
      const d = dirDe(Math.atan2(-(onde.z - m.oz), onde.x - m.ox)); G.e = 'perdeu'; G.foge = { x: onde.x, z: onde.z, vx: d.x * 4, vz: d.z * 4, t: 0 };
      setTimeout(() => { if (P.mg === m) criarRaio({ x: onde.x + d.x * 30 + rnd(-6, 6), y: 44, z: onde.z + d.z * 30 + rnd(-6, 6) }, { x: onde.x + d.x * 22, y: Y_AGUA, z: onde.z + d.z * 22 }, { desce: 0.1, esp: 0.2, galhos: 2, aoTocar: () => { relampago(0.45); SOM.trovaoLonge(0.5); } }); }, 900);
      await api.esperar(1600); if (P.mg !== m) return;
      m.camRosto = true; S().cam.snap = true;
      await api.esperar(2400); if (P.mg !== m) return;
      try { await api.fala('jog', '...'); await api.fala('jog', tr('Mas que PORRA foi essa?!')); Dialogo.esconder(); } catch (e) { console.error(e); }
      if (P.mg !== m) return;
      fimBagre(m); m.ocupado = false; S().cam.snap = true; recolher();
    }
    // pegou: o bicho sai da água no meio de um clarão, o jogador mostra (não sabe o que é) e guarda para levar ao seu Bené
    async function cenaPegouBagre() {
      const m = P.mg, b = m.bite, p = dadosP(), s = S(), J = s.jog;
      m.e = 'pegou'; m.t = 0; m.ocupado = true; m.segura = false; m.B = null; tirarPulo(m); m.bagre.e = 'pegou';
      Rock.final();
      const peixe = malhaBagre(b.kg); grupo().add(peixe);
      m.voa = { m: peixe, de: { x: m.peixeP.x, y: Y_AGUA, z: m.peixeP.z }, t: 0 };
      respingo(m.peixeP.x, m.peixeP.z, 18, 1.2); SOM.agua(); relampago(1.1); SOM.trovaoPerto(); faiscas(m.peixeP.x, Y_AGUA + 0.2, m.peixeP.z, 28, 1.4); if (naAgua(m.peixeP.x, m.peixeP.z)) { anelCor(m.peixeP.x, m.peixeP.z, 3, 0x8ff0ff, 1.3); vapor(m.peixeP.x, m.peixeP.z, 6); }
      await api.esperar(720); if (P.mg !== m) return;
      m.voa = null; if (peixe.parent) peixe.parent.remove(peixe);
      const ab = poseTrofeu(peixe.userData.L), k = peixe.scale.x;
      peixe.position.set(ab.x + 0.03, ab.y + 0.05 + 0.1 * k, 0); peixe.rotation.set(0, Math.PI / 2, 0); J.m.corpo.add(peixe);   // apoiado pela barriga (os bigodes e a nadadeira de baixo ficam pendurados)
      m.trofeu = { m: peixe, grande: true, ab }; m.vara.raiz.visible = false;
      SOM.lendario(); vib([60, 40, 60, 40, 220], true); bannerBagre(b.kg); relampago(0.6);
      await api.esperar(1200);
      try {
        await api.fala('jog', tr('Que... que bicho é esse?!'));
        await api.fala('jog', tr('Eu não faço ideia do que seja isso. Nem parece pertencer a esse lugar...'));
        await api.fala('jog', tr('Amanhã eu vou perguntar pro seu Bené. Ele deve saber o que é.'));
        Dialogo.esconder();
      } catch (e) { console.error(e); }
      p.bagre = { dia: s.dados.dia, kg: b.kg }; gravar();
      const w = mundo(peixe); faiscas(w.x, w.y, w.z, 14, 0.8); SOM.zap();
      await animar((t) => { peixe.scale.setScalar(k * Math.max(0.02, 1 - t / 0.45)); return t >= 0.45; });
      esconderBanner(); tirarMalha(peixe); m.trofeu = null; m.vara.raiz.visible = true;
      fimBagre(m); m.ocupado = false; gravar();
      if (P.mg === m) { irPara('mira'); msgMg(tr('Você guardou o bicho misterioso para mostrar ao seu Bené.'), 3.4); }
    }
    function bannerBagre(kg) {
      esconderBanner(); const el = document.createElement('div'); el.id = 'pcBanner'; el.style.borderColor = '#6fe0ff';
      el.innerHTML = '<div class="pcL1"><span class="pcRar"></span> · <span class="pcNomeP"></span></div><div class="pcL2"></div>';
      const q = (x) => el.querySelector(x); q('.pcRar').textContent = '???'; q('.pcRar').style.color = '#8ff0ff'; q('.pcNomeP').textContent = '???';
      q('.pcL2').textContent = fmtKg(kg) + ' · ' + tr('Não consta no catálogo');
      (document.getElementById('raizJogo') || document.body).appendChild(el); if (P.mg) P.mg.U.recado.style.visibility = 'hidden';
    }
    // ---- no outro dia, o bicho vai para o seu Bené: ele não sabe o que é, oferece 10.000 fakes e vai buscar o dinheiro... o bicho ACORDA,
    //   levanta voo, dá uma volta sobre o lago, engole quem estava passando na trilha e some no céu num raio. Ninguém viu nada.
    const BENE_FRENTE = () => ({ x: BALCAO.x, z: CP.z1 - 0.8 });
    function camEm(px, py, pz, tx, ty, tz) { const s = S(); s.camCena = { px, py, pz, tx, ty, tz }; }
    async function cenaBagreBene() {
      const s = S(), p = dadosP(), A = P.bene, J = s.jog, zf = CP.z1;
      const C = P.cenaBene = { bx: BALCAO.x, bz: zf - 0.8, byaw: -Math.PI / 2, anda: false, susto: 0 };
      const fala = (q, txt) => api.fala(q, tr(txt));
      let peixe = null, pessoa = null;
      try { const ui = api.UI(); if (ui && ui.ctl) ui.ctl.hidden = true; } catch (e) { /* ok */ }
      try {
        J.andando = J.correndo = false; J.x = BALCAO.x - 1.55; J.z = zf + 1.3; J.yaw = J.yawAlvo = Math.atan2(-((zf - 0.2) - J.z), BALCAO.x - J.x);
        const cam0 = () => camEm(BALCAO.x + 1.3, 2.5, zf + 4.4, BALCAO.x - 0.35, 0.95, zf + 0.5);
        cam0(); s.cam.snap = true;
        await fala('jog', 'Seu Bené! O senhor precisa ver o que eu pesquei ontem, à meia-noite, no meio da tempestade.');
        await fala('bene', 'Pode mostrar! Põe aí no balcão.');
        await fala('jog', 'No balcão não cabe, não...');
        Dialogo.esconder(); await api.preto(true, 300);
        peixe = malhaBagre(p.bagre.kg || 160); peixe.geometry.computeBoundingBox();
        const bb = peixe.geometry.boundingBox, k = peixe.scale.x, F0 = { x: BALCAO.x + 0.35, z: zf + 1.25 }; F0.y = superficie(F0.x, F0.z) + bb.max.z * k + 0.01;
        peixe.position.set(F0.x, F0.y, F0.z); peixe.rotation.set(-Math.PI / 2, 0, 0); grupo().add(peixe);
        await api.preto(false, 300); SOM.pum();
        await fala('bene', 'Mas o que é que é ISSO?!');
        await fala('bene', 'Rapaz... faz trinta anos que eu pesco nesse lago e nunca vi um bicho desses.');
        await fala('bene', 'Eu não faço a menor ideia do que seja. Nem sei se isso é peixe de verdade!');
        await fala('bene', 'Olha esse brilho... Um bicho desses não tem preço. O valor disso deve ser inestimável!');
        await fala('bene', 'Olha, eu te pago 10.000 fakes por ele. Espera aí que eu vou buscar o dinheiro lá no fundo.');
        Dialogo.esconder();
        // o Bené vai até o fundo da casinha (de costas)
        C.anda = true; C.byaw = Math.PI / 2;
        await animar((t) => { C.bz = lerpN(zf - 0.8, zf - 1.3, Math.min(1, t / 0.6)); C.bx = lerpN(BALCAO.x, BALCAO.x - 0.6, Math.min(1, t / 0.6)); if (t >= 0.6) C.anda = false; return t >= 0.9; });
        // o bicho estremece: faíscas, o brilho acende
        await animar((t) => { peixe.rotation.z = Math.sin(t * 40) * 0.05 * Math.min(1, t); peixe.position.y = F0.y + Math.abs(Math.sin(t * 22)) * 0.03; if (Math.random() < 0.18) { const w = mundo(peixe); faiscas(w.x + rnd(-0.8, 0.8), w.y + 0.2, w.z + rnd(-0.3, 0.3), 3, 0.5); } if (t > 0.3 && !C.z1) { C.z1 = true; SOM.zap(); } camEm(F0.x - 0.4, 1.45, F0.z + 2.1, F0.x + 0.2, F0.y + 0.1, F0.z); return t >= 1.1; });
        peixe.rotation.z = 0; peixe.position.y = F0.y; cam0();
        await fala('jog', 'Seu Bené... acho que ele se mexeu.');
        Dialogo.esconder();
        // quem estava passando pela trilha
        pessoa = api.criarPessoa(s.f2, Math.random, Math.random() < 0.5, false); pessoa.tipo = 'cena'; pessoa.x = -37.4; pessoa.z = 49.5; listaNpcs().push(pessoa);
        api.andar(pessoa, [[-39.19, 48.01], [-41.82, 46.82], [-45.06, 47.15], [-48.52, 47.15], [-52, 47.15], [-55.2, 45.24]], 1.3);
        await voo(peixe, F0, pessoa, C);
        tirarMalha(peixe); peixe = null;
        if (pessoa) { api.descartarPessoa(pessoa); pessoa = null; }
        // o silêncio
        C.bx = BENE_FRENTE().x; C.bz = zf - 0.95; C.byaw = -Math.PI / 2; C.susto = 0; J.yaw = J.yawAlvo = Math.atan2(-(C.bz - J.z), C.bx - J.x);
        camEm(BALCAO.x + 0.2, 1.75, zf + 3.3, BALCAO.x - 0.7, 1.4, zf + 0.2); s.cam.snap = true;
        await api.esperar(1400);
        await api.fala('jog', '...'); await api.fala('bene', '...');
        await fala('jog', 'Pensando melhor... fica com o dinheiro e não fala pra ninguém que isso aconteceu...');
        await fala('bene', 'Combinado. Eu não vi nada. E você também não viu nada.');
        Dialogo.esconder();
      } catch (e) { console.error(e); }
      finally {
        if (peixe) tirarMalha(peixe); if (pessoa) api.descartarPessoa(pessoa);
        p.bagre.fim = true; p.bagre.visto = s.dados.dia; gravar();
        P.cenaBene = null; s.camCena = null; s.cam.snap = true;
      }
    }
    // o VOO: acorda e sobe (raiozinhos no chão), ruge, dá uma volta sobre o lago, mergulha em quem passava, engole, e sobe num raio
    function voo(peixe, F0, pessoa, C) {
      const s = S(), J = s.jog, zf = CP.z1, L = peixe.userData.L, centro = { x: BALCAO.x + 2.2, y: 4.6, z: zf + 8.2 }, R0 = 4.6;
      let pos = { x: F0.x, y: F0.y, z: F0.z }, ant = { x: pos.x, y: pos.y, z: pos.z }, alvoCam = { x: pos.x, y: pos.y, z: pos.z }, ang0 = null, mergulho = null, engoliu = false, subiu = false, sumiu = false, raioOk = false;
      const olhar = (q, de) => { const dx = q.x - de.x, dz = q.z - de.z; return Math.atan2(-dz, dx); };
      return animar((t, dt) => {
        if (t < 1.4) {                                                    // acorda e levanta, virando de pé
          const u = suave(t / 1.4); pos = { x: F0.x, y: F0.y + u * 2.0, z: F0.z };
          peixe.rotation.set(-Math.PI / 2 * (1 - u), Math.sin(t * 3) * 0.3 * u, Math.sin(t * 30) * 0.04 * (1 - u));
          if (Math.random() < 0.3) criarRaio({ x: pos.x + rnd(-0.6, 0.6), y: pos.y, z: pos.z + rnd(-0.3, 0.3) }, { x: pos.x + rnd(-1.2, 1.2), y: superficie(pos.x, pos.z) + 0.02, z: pos.z + rnd(-0.6, 0.6) }, { desce: 0.02, esp: 0.035, galhos: 0, some: 0.18, desvio: 0.2 });
          if (t > 0.1 && !C.a1) { C.a1 = true; relampago(0.7); SOM.trovaoPerto(); SOM.estalos(); C.susto = 1; C.byaw = -Math.PI / 2; }
          if (t > 1.0 && !C.a2) { C.a2 = true; SOM.rugido(); faiscas(pos.x, pos.y, pos.z, 20, 1); }
          camEm(BALCAO.x - 0.8, 1.4, zf + 5.6, pos.x, pos.y + 0.2, pos.z);
        } else if (t < 4.9) {                                             // a volta sobre o lago
          if (ang0 == null) ang0 = Math.atan2(pos.z - centro.z, pos.x - centro.x);
          const u = (t - 1.4) / 3.5, a = ang0 + u * Math.PI * 2 * 0.92, rr = lerpN(Math.hypot(pos.x - centro.x, pos.z - centro.z), R0, Math.min(1, u * 3));
          const alvo = { x: centro.x + Math.cos(a) * rr, y: centro.y + Math.sin(u * Math.PI * 2) * 0.8, z: centro.z + Math.sin(a) * rr };
          pos = { x: lerpN(pos.x, alvo.x, Math.min(1, dt * 6)), y: lerpN(pos.y, alvo.y, Math.min(1, dt * 4)), z: lerpN(pos.z, alvo.z, Math.min(1, dt * 6)) };
          camEm(BALCAO.x - 3.4, 1.7, zf + 1.4, lerpN(centro.x, pos.x, 0.35), lerpN(centro.y, pos.y, 0.35), lerpN(centro.z, pos.z, 0.35));   // de longe, a volta inteira no quadro
          if (Math.random() < dt * 3) { const w = pos; faiscas(w.x, w.y, w.z, 4, 0.5); }
        } else if (t < 6.2) {                                             // o mergulho em quem passava
          if (!mergulho) {                                                 // a câmera de lado (perpendicular ao mergulho), do lado longe da casinha
            mergulho = { de: { x: pos.x, y: pos.y, z: pos.z } }; pessoa.rota = null; pessoa.andando = false; SOM.rugido();
            const hx = pessoa.x - pos.x, hz = pessoa.z - pos.z, hl = Math.hypot(hx, hz) || 1, ux = hx / hl, uz = hz / hl; let nx = -uz, nz = ux;
            if ((pessoa.x + nx - CX) ** 2 + (pessoa.z + nz - CZ) ** 2 < (pessoa.x - nx - CX) ** 2 + (pessoa.z - nz - CZ) ** 2) { nx = -nx; nz = -nz; }
            mergulho.cam = { px: pessoa.x + nx * 5.2 - ux * 1.5, py: 1.55, pz: pessoa.z + nz * 5.2 - uz * 1.5, tx: pessoa.x - ux * 1.3, ty: 1.7, tz: pessoa.z - uz * 1.3 };
          }
          pessoa.yawAlvo = olhar(pos, pessoa); C.susto = 1;
          const u = clampN((t - 4.9) / 1.15, 0, 1), hx = pessoa.x - mergulho.de.x, hz = pessoa.z - mergulho.de.z, hl = Math.hypot(hx, hz) || 1, rec = L * 0.5 + 0.12;
          const cab = { x: pessoa.x - hx / hl * rec, y: superficie(pessoa.x, pessoa.z) + 1.45, z: pessoa.z - hz / hl * rec };   // a BOCA para na cabeça (o corpo fica de fora)
          pos = { x: lerpN(mergulho.de.x, cab.x, suave(u)), y: lerpN(mergulho.de.y, cab.y, 1 - (1 - u) * (1 - u)), z: lerpN(mergulho.de.z, cab.z, suave(u)) };
          { const c = mergulho.cam; camEm(c.px, c.py, c.pz, c.tx, c.ty, c.tz); }
        } else if (t < 7.1) {                                             // NHAC
          if (!engoliu) { engoliu = true; SOM.nhac(); faiscas(pos.x, pos.y, pos.z, 26, 1.1); relampago(0.4); vib([80, 40, 140], true); if (pessoa.blob) pessoa.blob.visible = false; }
          const u = clampN((t - 6.2) / 0.3, 0, 1), r = pessoa.m.raiz, fr = dirDe(peixe.rotation.y), boca = { x: pos.x + fr.x * L * 0.47, y: pos.y - 0.05 * L, z: pos.z + fr.z * L * 0.47 };
          r.scale.setScalar(Math.max(0.01, 1 - u)); r.position.set(lerpN(pessoa.x, boca.x, u), lerpN(superficie(pessoa.x, pessoa.z), boca.y - 0.4 * (1 - u), u), lerpN(pessoa.z, boca.z, u));
          if (u >= 1) r.visible = false;
          peixe.scale.setScalar(L * (1 + Math.sin((t - 6.2) * 18) * 0.06 * (t < 6.8 ? 1 : 0)));
          pos.y += dt * 0.6; { const c = mergulho.cam; camEm(c.px, c.py, c.pz, c.tx, c.ty, c.tz); }
        } else if (t < 8.5) {                                             // sobe num raio e some
          const u = t - 7.1; pos = { x: pos.x, y: pos.y + dt * (3 + u * u * 30), z: pos.z };
          if (!subiu) { subiu = true; SOM.rugido(); }
          if (u > 0.45 && !raioOk) { raioOk = true; criarRaio({ x: pos.x, y: pos.y, z: pos.z }, { x: pos.x + rnd(-3, 3), y: 70, z: pos.z + rnd(-3, 3) }, { desce: 0.08, esp: 0.3, galhos: 4, some: 0.8, aoTocar: () => { relampago(1.4); SOM.trovaoPerto(); } }); }
          if (u > 0.6 && !sumiu) { sumiu = true; peixe.visible = false; }
          if (Math.random() < 0.5 && !sumiu) faiscas(pos.x, pos.y - 0.5, pos.z, 2, 0.4);
          { const c = mergulho.cam; camEm(c.px, c.py, c.pz, lerpN(c.tx, pos.x, 0.7), Math.min(pos.y, 16), lerpN(c.tz, pos.z, 0.7)); }
        } else {
          camEm(J.x - 0.6, 1.2, J.z + 3.0, J.x + 2.5, 9, J.z + 6);
          if (t > 9.6) return true;
        }
        // o corpo segue a direção do movimento (de pé, a cabeça na frente)
        if (t >= 1.4 && t < 7.1) { const vx = pos.x - ant.x, vz = pos.z - ant.z, vy = pos.y - ant.y, h = Math.hypot(vx, vz); if (h > 1e-4) peixe.rotation.set(0, Math.atan2(-vz, vx), clampN(Math.atan2(vy, h), -1.1, 1.1)); }
        if (t >= 7.1) peixe.rotation.set(0, peixe.rotation.y, lerpN(peixe.rotation.z, 1.45, Math.min(1, dt * 6)));
        peixe.position.set(pos.x, pos.y, pos.z); ant = { x: pos.x, y: pos.y, z: pos.z };
        alvoCam = { x: lerpN(alvoCam.x, pos.x, Math.min(1, dt * 5)), y: lerpN(alvoCam.y, pos.y, Math.min(1, dt * 5)), z: lerpN(alvoCam.z, pos.z, Math.min(1, dt * 5)) };
        J.yawAlvo = olhar(pos, J);
        return false;
      });
    }
    // as poses durante a cena (por cima das poses normais deste quadro): o susto do Bené e do jogador (braços para cima)
    function poseCenaBene() {
      const C = P.cenaBene; if (!C) return;
      const t = S().t;
      if (C.susto > 0) { for (const M of [P.bene && P.bene.m, S().jog.m]) { if (!M) continue; M.bracoE.rotation.z = M.bracoD.rotation.z = 2.7 + Math.sin(t * 9) * 0.12; usarCotovelo(M.bracoE, 0, 0.5); usarCotovelo(M.bracoD, 0, 0.5); } }
    }
    // ---- a cada quadro do minigame
    function tickMg(dt) {
      const s = S(), m = P.mg, J = s.jog;
      if (!m.pausa && m.e !== 'cine' && !m.bagre && !m.duke) api.tickHorario(dt);
      m.t += dt; if (m.tRec > 0) { m.tRec -= dt; if (m.tRec <= 0) m.U.recado.textContent = ''; }
      if ((m.e === 'mira' || m.e === 'forca') && !m.pausa) m.ang = clampN(m.ang + m.mira * dt * 0.9, -m.lim, m.lim);
      const fixo = m.e === 'briga' || m.e === 'fisgou' || m.e === 'pegou';
      J.x = m.ox; J.z = m.oz; J.yaw = J.yawAlvo = m.trofeu ? (m.yaw0 - 0.45) : m.yaw0 + (fixo ? m.ang0 : m.ang); J.andando = false; J.correndo = false; J.sentado = false;
      if (!m.ocupado && !m.saindo && hora() >= 1.85 && hora() < 5 && (m.e === 'mira' || m.e === 'espera')) { msgMg(tr('Já tá tarde... melhor ir pra casa.'), 3); m.ocupado = false; m.saindo = true; if (m.fim) m.fim(); }
      poseJogMg(m, J);
      J.m.raiz.updateMatrixWorld(true);
      const tip = mundo(m.vara.ponta);
      switch (m.e) {
        case 'forca': { const x = (m.t / T_FORCA) % 2; m.forca = x <= 1 ? x : 2 - x; break; }   // vai e volta: soltar na hora certa é a distância certa
        case 'swing': if (m.t >= T_SWING) { m.voo = { de: tip, t: 0, dur: durVoo(m) }; m.e = 'voo'; m.t = 0; } break;
        case 'voo': { const v = m.voo; v.t += dt; const u = clampN(v.t / v.dur, 0, 1); m.boiaP = { x: lerpN(v.de.x, m.alvo.x, u), y: lerpN(v.de.y, Y_AGUA, u) + Math.sin(u * Math.PI) * (1.2 + m.dist * 0.12), z: lerpN(v.de.z, m.alvo.z, u) }; if (u >= 1) pousou(); break; }
        case 'cine': tickCine(dt, tip); break;
        case 'raio': tickCenaRaio(dt); break;
        case 'espera': tickEspera(); break;
        case 'mordida': if (m.t > m.bite.d.janela) escapou(tr('O peixe comeu a isca e fugiu...')); break;
        case 'fisgou': if (m.t >= 0.3) { m.e = 'briga'; m.t = 0; } break;
        case 'briga': tickBriga(dt); break;
        case 'assustou': if (m.t >= 1.6) novaEspera(true); break;
        case 'falhou': if (m.t >= 1.8) recolher(); break;
        case 'recolhe': { const u = clampN(m.t / 0.7, 0, 1); m.boiaP = { x: lerpN(m.de.x, tip.x, u), y: lerpN(m.de.y, tip.y - 0.55, u) + Math.sin(u * Math.PI) * 0.3, z: lerpN(m.de.z, tip.z, u) }; if (Math.random() < dt * 12) SOM.clique(); if (u >= 1) irPara('mira'); break; }
        default: break;
      }
      if (P.mg !== m) return;
      tickLuzBagre(m, dt); if (m.duke) tickDuke(m, dt);
      if (m.camRosto || (m.e === 'raio' && m.t >= 5.6) || (m.trofeu && m.trofeu.m.userData.bagre)) { m.tPisca = (m.tPisca || 0) - dt; if (m.tPisca <= 0) { m.tPisca = rnd(0.7, 1.5); const C = s.clima; if (C) C.flash = Math.max(C.flash || 0, rnd(0.25, 0.45)); } }   // relâmpagos longe iluminando o rosto
      visualMg(m, tip, dt); camMg(m, J, dt); hudMg(m);
    }
    // o estado "de verdade" para desenhar (na cena do perfeito, o estado do lançamento que está passando)
    const estadoV = (m) => (m.e === 'cine' && m.cine ? (m.cine.e === 'agua' ? 'espera' : m.cine.e || 'swing') : m.e === 'raio' ? (m.bagre && m.bagre.puxou ? 'fisgou' : 'espera') : m.e === 'perdeu' ? 'falhou' : m.e);
    // os braços para mostrar o peixe (achados por busca no boneco do jogador): pequeno = mãos juntas; grande = uma mão em cada ponta.
    //   Devolve também onde ficam as mãos no tronco (x para a frente, y para cima), para apoiar o peixe em cima delas.
    function poseTrofeu(L) {
      const g = clampN((L - 0.4) / 1.0, 0, 1);                           // grande: mais baixo (na altura da barriga), para não tampar o rosto
      return { rz: lerpN(1.35, 0.85, g), rx: lerpN(0.5, 0.1, g), cz: 0.02, x: lerpN(0.49, 0.43, g), y: lerpN(1.16, 0.9, g) };
    }
    const tempoV = (m) => (m.e === 'cine' && m.cine ? m.cine.t || 0 : m.t);
    // pose do jogador com a vara (por cima da pose normal, que já rodou neste quadro)
    function poseJogMg(m, J) {
      const M = J.m, t = S().t, e = estadoV(m), tt = tempoV(m); let dz = 0.55, dx = 0.12, cz = 1.05, ez = 0.72, ex = -0.42, ecz = 0.95, lean = 0, joelho = 0;
      if (m.trofeu) {                                                  // mostrando o peixe para a câmera: braços esticados, mãos embaixo dele
        const a = m.trofeu.ab, bal = Math.sin(t * 1.6) * 0.02;
        M.bracoE.rotation.z = M.bracoD.rotation.z = a.rz + bal; M.bracoE.rotation.x = -a.rx; M.bracoD.rotation.x = a.rx;
        usarCotovelo(M.bracoE, 0.001, a.cz); usarCotovelo(M.bracoD, 0.001, a.cz); M.corpo.rotation.z = -0.04; return;
      }
      switch (e) {
        case 'mira': dz += Math.sin(t * 1.3) * 0.02; break;
        case 'forca': { const k = m.forca; dz = 0.55 + 1.9 * k; cz = 1.05 - 0.35 * k; ez = 0.72 + 1.1 * k; lean = 0.12 * k; break; }
        case 'swing': { const u = clampN(tt / 0.24, 0, 1), k = m.forcaUsada || 0.5; dz = lerpN(0.55 + 1.9 * k, 0.3, suave(u)); cz = lerpN(1.05 - 0.35 * k, 0.85, u); ez = lerpN(0.72 + 1.1 * k, 0.6, suave(u)); lean = lerpN(0.12 * k, -0.08, u); break; }
        case 'voo': dz = 0.35; cz = 0.9; ez = 0.62; lean = -0.06; break;
        case 'espera': case 'mordida': case 'assustou': dz = 0.5 + Math.sin(t * 1.1) * 0.02; break;
        case 'fisgou': dz = 1.45; cz = 0.85; lean = 0.12; break;
        case 'briga': { const B = m.B, te = B ? B.tensao : 0.3; dz = 0.95 + te * 0.25 + (B && B.corre ? Math.sin(t * 30) * 0.03 : 0); dx = 0.15; cz = 0.85; ez = 0.95; ex = -0.5; ecz = 1.05 + (m.segura ? Math.sin(t * 16) * 0.28 : 0); lean = 0.15 + te * 0.12; joelho = 0.22 + te * 0.15; break; }
        case 'recolhe': dz = 0.75; ecz = 1.05 + Math.sin(t * 16) * 0.28; break;
        case 'falhou': if (tt < 1.3) { dz = 0.9; cz = 1.2; ez = 2.75; ecz = 1.9; ex = 0; } break;
        default: break;
      }
      M.bracoD.rotation.z = dz; M.bracoD.rotation.x = dx; usarCotovelo(M.bracoD, 0, cz);
      M.bracoE.rotation.z = ez; M.bracoE.rotation.x = ex; usarCotovelo(M.bracoE, 0, ecz);
      M.corpo.rotation.z = lean; if (joelho) usarJoelhos(M, -joelho, -joelho);
    }
    // a montagem na ponta da linha: a BOIA, o LÍDER (linha curtinha) e o ANZOL com a isca. Pendurada balança (atrasa o movimento da ponta).
    function rigMg(m, tip, e, dt) {
      const B = m.boiaM, A = m.anzol, Ld = m.lider, t = S().t, pd = m.pend; let bp = null, an = null, isca = false;
      const pendura = e === 'mira' || e === 'forca' || e === 'swing' || (e === 'recolhe' && m.t > 0.66);
      if (pendura) {                                                     // pendurada na ponta da vara (um pêndulo simples)
        if (pd.ox == null) { pd.ox = tip.x; pd.oz = tip.z; }
        const vx = (tip.x - pd.ox) / Math.max(dt, 1e-3), vz = (tip.z - pd.oz) / Math.max(dt, 1e-3); pd.ox = tip.x; pd.oz = tip.z;
        pd.vx += (-pd.x * 26 - vx * 1.4 - pd.vx * 3.2) * dt; pd.vz += (-pd.z * 26 - vz * 1.4 - pd.vz * 3.2) * dt;
        pd.x = clampN(pd.x + pd.vx * dt, -0.5, 0.5); pd.z = clampN(pd.z + pd.vz * dt, -0.5, 0.5);
        bp = { x: tip.x + pd.x * 0.6, y: tip.y - 0.48, z: tip.z + pd.z * 0.6 }; an = { x: tip.x + pd.x, y: tip.y - 0.82, z: tip.z + pd.z };
        isca = m.e === 'recolhe' ? !m.comida && m.temIsca : nIsca(dadosP().isca) > 0;
      } else {
        pd.ox = null; pd.x = pd.z = pd.vx = pd.vz = 0;
        if (e === 'voo' || e === 'recolhe') { bp = m.boiaP; if (bp) { const d = dirDe(m.yaw0 + m.ang); an = { x: bp.x - d.x * 0.25 * (e === 'voo' ? 1 : -1), y: bp.y - 0.3, z: bp.z - d.z * 0.25 * (e === 'voo' ? 1 : -1) }; isca = e === 'voo' ? m.temIsca : !m.comida && m.temIsca; } if (e === 'recolhe' && m.arrebentou) bp = an = null; }
        else if (e === 'espera' || e === 'assustou') bp = { x: m.boiaP.x, y: Y_AGUA + 0.015 + Math.sin(t * 2) * 0.01 - (m.beliscando ? 0.05 : 0), z: m.boiaP.z };
        else if (e === 'mordida') bp = { x: m.boiaP.x, y: Y_AGUA - 0.12 + Math.sin(t * 25) * 0.02, z: m.boiaP.z };
        else if ((e === 'briga' || e === 'fisgou') && m.peixeP) bp = { x: m.peixeP.x - dirDe(m.yaw0 + m.ang0).x * 0.6, y: Y_AGUA - 0.03 + Math.sin(t * 9) * 0.015, z: m.peixeP.z - dirDe(m.yaw0 + m.ang0).z * 0.6 };
        else if (e === 'falhou' && m.de && !m.arrebentou) bp = m.de;
      }
      B.visible = !!bp; if (bp) B.position.set(bp.x, bp.y, bp.z);
      A.visible = !!an; if (an) { A.position.set(an.x, an.y, an.z); A.rotation.y = m.yaw0 + m.ang + Math.PI / 2; iscaNoAnzol(A, isca ? (m.e === 'mira' || m.e === 'forca' ? dadosP().isca : m.iscaLance) : -1); }
      if (bp && an) linhaDe(Ld, { x: bp.x, y: bp.y - 0.085, z: bp.z }, { x: an.x, y: an.y + 0.1, z: an.z }, 0); else Ld.visible = false;
      return bp;
    }
    // a boca do peixe (a ponta da frente do modelo), na posição da cidade: é onde a linha fica presa quando ele sai da água
    const V3b = new THREE.Vector3();
    function bocaPeixe(o) {
      const g = o.geometry; if (!g.boundingBox) g.computeBoundingBox(); const bb = g.boundingBox;
      o.updateMatrixWorld(true); V3b.set(bb.max.x * 0.96, (bb.min.y + bb.max.y) * 0.5, 0); o.localToWorld(V3b);
      return { x: V3b.x - api.OX, y: V3b.y, z: V3b.z };
    }
    // as VITÓRIAS-RÉGIAS balançam quando a linha passa por cima delas (o pedaço da linha perto da água) ou a boia/o peixe passa nelas
    function tickVitorias(dt, a, b) {
      const L = api.vitorias ? api.vitorias() : []; if (!L.length) return;
      for (const v of L) {
        if (a && b) {
          const ax = lerpN(a.x, b.x, 0.55), az = lerpN(a.z, b.z, 0.55), dx = b.x - ax, dz = b.z - az, l2 = dx * dx + dz * dz || 1;
          const u = clampN(((v.x - ax) * dx + (v.z - az) * dz) / l2, 0, 1), px = ax + dx * u, pz = az + dz * u, d = Math.hypot(v.x - px, v.z - pz);
          if (d < v.r + 0.08) {
            const px0 = v.px == null ? px : v.px, pz0 = v.pz == null ? pz : v.pz, mov = Math.hypot(px - px0, pz - pz0);
            if (mov > 0.004 || v.k < 0.15) { v.k = Math.min(1, v.k + 0.5 + mov * 4); v.dx = clampN((px - px0) * 30, -1, 1) || 0.6; v.dz = clampN((pz - pz0) * 30, -1, 1) || 0.4; }
            v.px = px; v.pz = pz;
          } else { v.px = v.pz = null; }
        }
        if (v.k > 0.001) {
          v.t += dt; v.k *= Math.exp(-dt * 1.6);
          const w = Math.sin(v.t * 9) * v.k, w2 = Math.cos(v.t * 7.3) * v.k;
          v.m.rotation.x = v.dz * w * 0.16; v.m.rotation.z = -v.dx * w2 * 0.16; v.m.position.y = Math.sin(v.t * 11) * v.k * 0.025; v.m.rotation.y = w * 0.05;
          if (v.k <= 0.001) { v.k = 0; v.m.rotation.set(0, 0, 0); v.m.position.y = 0; }
        }
      }
    }
    function visualMg(m, tip, dt) {
      const L = m.linha, t = S().t, e = estadoV(m), bp = rigMg(m, tip, e, dt);
      let verga = 0.04, fim = null;
      // o peixe pulando fora da água na corrida (os raros "de escama"): a cabeça virada para o jogador (é a boca que a linha puxa),
      //   sobe de nariz para cima e desce de nariz para baixo (meio de lado, para aparecer). Atualizado ANTES da linha, para ela sair da boca já neste quadro.
      if (m.pulo && m.peixeP && m.bite) {
        const pl = m.pulo; if (!pl.m) { pl.m = m.bite.bagre ? malhaBagre(m.bite.kg) : malhaPeixe(m.bite.i, m.bite.kg); grupo().add(pl.m); respingo(m.peixeP.x, m.peixeP.z, m.bite.bagre ? 12 : 6, m.bite.bagre ? 0.9 : 0.3); }
        pl.t += dt; const u = pl.t / (m.bite.bagre ? 1.05 : 0.75), Lp = pl.m.userData.L, J = S().jog, yawJ = Math.atan2(-(J.z - m.peixeP.z), J.x - m.peixeP.x);
        pl.m.position.set(m.peixeP.x, Y_AGUA + Math.sin(Math.min(1, u) * Math.PI) * Math.min(1.9, 0.6 + Lp * 0.8), m.peixeP.z); if (pl.lado == null) pl.lado = Math.random() < 0.5 ? -1 : 1; pl.m.rotation.set(0, yawJ + pl.lado * 0.8, 0.9 - Math.min(1, u) * 1.8);   // meio de lado (dá para ver o peixe), com a boca ainda para o lado da vara
        if (u >= 1) { respingo(m.peixeP.x, m.peixeP.z, m.bite.bagre ? 14 : 7, m.bite.bagre ? 1 : 0.4); SOM.agua(); if (m.bite.bagre) { anelCor(m.peixeP.x, m.peixeP.z, 2.4, 0x8ff0ff, 1); faiscas(m.peixeP.x, Y_AGUA + 0.1, m.peixeP.z, 12, 1); } tirarPulo(m); }
      }
      if ((m.e === 'briga' || m.e === 'fisgou') && m.peixeP) {
        const te = m.B ? m.B.tensao : 0.6, pl = m.pulo && m.pulo.m ? m.pulo : null;
        fim = pl ? bocaPeixe(pl.m) : { x: m.peixeP.x, y: Y_AGUA - 0.04, z: m.peixeP.z };
        linhaDe(L, tip, fim, pl ? 0.04 : 0.3 * (1 - te)); verga = 0.15 + te * 0.95 + (pl ? 0.25 : 0);   // pulando fora d'água: a linha vai na boca dele
      }
      else if (m.e === 'pegou' && m.voa) linhaDe(L, tip, bocaPeixe(m.voa.m), 0.03);
      else if (m.e === 'pegou' && m.duke && m.duke.boca) linhaDe(L, tip, m.duke.boca, 0.12);   // (6.6.7) a linha até a boca do Duke, lá no alto
      else if (bp) { const puxa = m.e === 'raio' && e === 'fisgou'; linhaDe(L, tip, { x: bp.x, y: bp.y + 0.17, z: bp.z }, puxa ? 0.02 : e === 'voo' ? 0.04 : (e === 'mira' || e === 'forca' || e === 'swing') ? 0 : 0.32); if (e === 'mordida') verga = 0.2; if (puxa) verga = 0.95 + Math.sin(t * 24) * 0.06; if (bp.y < 0.5) fim = bp; }
      else L.visible = false;
      tickVitorias(dt, fim ? tip : null, fim);                            // a linha (o pedaço perto da água) passando por cima das vitórias-régias
      vergar(m.vara, SINAL_VERGA * verga);
      // o peixe saindo da água até a mão
      if (m.voa) { const v = m.voa; v.t += dt; const u = clampN(v.t / 0.7, 0, 1), J = S().jog, alvo = { x: J.x + Math.cos(J.yaw) * 0.5, y: m.y + 1.15, z: J.z - Math.sin(J.yaw) * 0.5 };
        v.m.position.set(lerpN(v.de.x, alvo.x, suave(u)), lerpN(v.de.y, alvo.y, u) + Math.sin(u * Math.PI) * 1.4, lerpN(v.de.z, alvo.z, suave(u))); v.m.rotation.set(0, J.yaw, Math.sin(t * 20) * 0.5); }
      // (6.6.1) soltando: o peixe faz um arco até a água
      if (m.solta) { const g = m.solta; g.t += dt; const u = clampN(g.t / 0.55, 0, 1); g.m.position.set(lerpN(g.de.x, g.alvo.x, u), lerpN(g.de.y, Y_AGUA, u) + Math.sin(u * Math.PI) * 0.7, lerpN(g.de.z, g.alvo.z, u)); g.m.rotation.z = -u * 1.6 + Math.sin(t * 22) * 0.3; }
      // guardando no isopor
      if (m.guarda) { const g = m.guarda; g.t += dt; const u = clampN(g.t / 0.5, 0, 1); g.m.position.set(lerpN(g.de.x, P.isopor.position.x, u), lerpN(g.de.y, m.y + 0.35, u) + Math.sin(u * Math.PI) * 0.4, lerpN(g.de.z, P.isopor.position.z, u)); g.m.scale.setScalar(g.k0 * (1 - u * 0.6)); }
      // a mira: pontinhos na água até onde a boia vai cair (e o anel do alvo enquanto enche a barra)
      const mira = m.e === 'mira' || m.e === 'forca', d = dirDe(m.yaw0 + m.ang), Dm = distLance(m.e === 'forca' ? m.forca : 0.5, dadosP().vara);
      m.pontos.forEach((pt, k) => { const dd = 3 + (Dm - 3) * (k + 1) / m.pontos.length, x = m.ox + d.x * dd, z = m.oz + d.z * dd; pt.visible = mira && naAgua(x, z); pt.position.set(x, Y_AGUA + 0.045, z); });
      if (m.alvoM) { m.alvoM.visible = m.e === 'forca'; const x = m.ox + d.x * Dm, z = m.oz + d.z * Dm; m.alvoM.position.set(x, Y_AGUA + 0.05, z); m.alvoM.scale.setScalar(0.5 + Dm * 0.03); m.alvoM.material.color.setHex(naAgua(x, z) ? 0xf0a020 : 0xd8402a); }
    }
    function camMg(m, J, dt) {
      const s = S(), yaw = m.yaw0 + (m.e === 'briga' || m.e === 'fisgou' || m.e === 'pegou' ? m.ang0 : m.ang), d = dirDe(yaw), dir = { x: -d.z, z: d.x }, yJ = J.y || m.y;
      const snap = s.cam.snap; s.cam.snap = false;                       // (a cidade não zera o snap enquanto tem câmera de cena: zera aqui)
      let c;
      if (m.e === 'cine' && m.cine) { m.cam = camCine(m, J); s.camCena = m.cam; return; }
      if (m.e === 'raio' && m.camB) { m.cam = Object.assign(m.cam || {}, m.camB); s.camCena = m.cam; return; }   // a cena do raio corta seco entre os planos
      if (m.duke && m.duke.cam) {                                          // (6.6.7) o Duke: corta seco entre os planos, e anda suave dentro de cada um
        const c2 = m.duke.cam, D = m.duke;
        if (D.camAnt !== D.plano || !m.cam || snap) { D.camAnt = D.plano; m.cam = Object.assign({}, c2); }
        else { const k = 1 - Math.exp(-dt * 4); for (const q in c2) m.cam[q] += (c2[q] - m.cam[q]) * k; }
        s.camCena = m.cam; return;
      }
      if (m.camCadu && P.cadu) {                                          // (6.6.1) a cena secreta: por cima do ombro do jogador, olhando o Cadu
        const C = P.cadu, vx = J.x - C.x, vz = J.z - C.z, L = Math.hypot(vx, vz) || 1, ux = vx / L, uz = vz / L;   // de frente para o Cadu (ele olha para o jogador), um pouco de lado
        c = { px: C.x + ux * 0.9 + uz * 2.7, py: yJ + 1.5, pz: C.z + uz * 0.9 - ux * 2.7, tx: C.x + ux * 0.35, ty: yJ + 1.05, tz: C.z + uz * 0.35 };   // de lado: os dois no quadro, o Cadu em destaque
      }
      else if (m.camRosto) { const f = dirDe(J.yaw), dl = { x: -f.z, z: f.x }; c = { px: J.x + f.x * 1.8 + dl.x * 0.5, py: yJ + 1.5, pz: J.z + f.z * 1.8 + dl.z * 0.5, tx: J.x, ty: yJ + 1.38, tz: J.z }; }
      else if (m.trofeu || (m.e === 'pegou' && !m.voa)) {                    // de frente (um pouco para o lado de fora do píer, para o Cadu não tampar); peixe grande = câmera mais longe
        const L = m.trofeu ? m.trofeu.m.userData.L || 0.5 : 0.5, bg = m.trofeu && m.trofeu.m.userData.bagre, k = 2.6 + Math.min(2.2, L * 0.7) + (bg ? 1.2 : 0), dT = dirDe((m.yaw0 - (bg ? 0.75 : 0.45)));   // o bicho é enorme: mais de lado, para o rosto aparecer
        c = { px: J.x + dT.x * k, py: yJ + 1.75 + Math.min(0.8, L * 0.2) + (bg ? 0.1 : 0), pz: J.z + dT.z * k, tx: J.x, ty: yJ + 0.8 + (bg ? 0.35 : 0), tz: J.z };   // mira no peito: o jogador e o peixe ficam na metade de cima da tela (a fala fica embaixo e o banner, fininho, no topo)
      }
      else if ((m.e === 'briga' || m.e === 'fisgou' || m.e === 'pegou') && m.peixeP) { const f = m.peixeP; c = { px: J.x - d.x * 4.4 + dir.x * 1.6, py: yJ + 2.9, pz: J.z - d.z * 4.4 + dir.z * 1.6, tx: lerpN(J.x, f.x, 0.55), ty: 0.4, tz: lerpN(J.z, f.z, 0.55) }; }
      else {
        // mirando: um pouco mais alto, para dar para ver as manchas escuras (fundo) e claras (raso) da água
        let tx = J.x + d.x * 11, tz = J.z + d.z * 11;
        if (m.boiaP && (m.e === 'espera' || m.e === 'mordida' || m.e === 'assustou' || m.e === 'voo')) { tx = lerpN(tx, m.boiaP.x, 0.5); tz = lerpN(tz, m.boiaP.z, 0.5); }
        const alto = m.e === 'mira' || m.e === 'forca';
        c = { px: J.x - d.x * (alto ? 4.4 : 4.9) + dir.x * 1.3, py: yJ + (alto ? 3.9 : 3.0), pz: J.z - d.z * (alto ? 4.4 : 4.9) + dir.z * 1.3, tx, ty: 0.2, tz };
      }
      if (!m.cam || snap) m.cam = Object.assign({}, c);
      else { const k = 1 - Math.exp(-dt * 3.2); for (const q in c) m.cam[q] += (c[q] - m.cam[q]) * k; }
      if (m.bagre && m.B && m.B.corre) { const a = 0.05 + (m.bagre.fase || 1) * 0.015, j = () => (Math.random() - 0.5) * a; s.camCena = { px: m.cam.px + j(), py: m.cam.py + j(), pz: m.cam.pz + j(), tx: m.cam.tx, ty: m.cam.ty, tz: m.cam.tz }; }   // o tremor quando o bicho corre
      else s.camCena = m.cam;
    }
    function hudMg(m) {
      const U = m.U, p = dadosP(), C = U.cache, set = (el, k, v) => { if (C[k] !== v) { C[k] = v; el.textContent = v; } };
      const iscaTxt = tr(ISCAS[p.isca].nome) + ' ×' + nIsca(p.isca);
      if (C.iscaK !== p.isca || C.iscaTxt !== iscaTxt) { C.iscaK = p.isca; C.iscaTxt = iscaTxt; U.isca.innerHTML = ''; U.isca.appendChild(imgDe(iconeIsca(p.isca), 20, 20, '')); U.isca.appendChild(document.createTextNode(iscaTxt)); U.menuI.replaceChildren(imgDe(iconeIsca(p.isca), 24, 24, '')); }
      if (C.varaK !== p.vara) { C.varaK = p.vara; U.vara.innerHTML = ''; U.vara.appendChild(imgDe(iconeVara(p.vara), 20, 20, '')); U.vara.appendChild(document.createTextNode(tr(VARAS[p.vara].nome))); }
      set(U.caixa, 'cx', trf('Caixa {0}/{1}', p.caixa.length, CAIXA_MAX)); set(U.badge, 'bd', p.caixa.length + '/' + CAIXA_MAX);
      const livre = m.e === 'mira' && !m.ocupado; for (const b of [U.isca, U.vara, U.caixa, U.cat]) b.disabled = !livre;
      if (!livre && !U.menu.hidden) U.fecharMenu();
      U.sair.disabled = m.ocupado || ['mira', 'espera', 'recolhe', 'assustou'].indexOf(m.e) < 0;
      U.arrasto.style.cursor = (m.e === 'mira' || m.e === 'forca') ? 'grab' : 'default';
      let rot = '...', ativo = false, urg = false;
      if (m.e === 'mira') { rot = nIsca(p.isca) > 0 || totalIscas() > 0 ? tr('LANÇAR') : tr('SEM ISCA'); ativo = true; }
      else if (m.e === 'forca') { rot = tr('SOLTE!'); ativo = true; }
      else if (m.e === 'espera' || m.e === 'assustou') { rot = tr('RECOLHER'); ativo = m.e === 'espera'; }
      else if (m.e === 'mordida') { rot = tr('FISGAR!'); ativo = true; urg = true; }
      else if (m.e === 'briga' || m.e === 'fisgou') { rot = tr('PUXAR'); ativo = true; }
      set(U.acao, 'acao', rot); U.acao.disabled = !ativo || m.ocupado; U.acao.classList.toggle('urgente', urg);
      // a barra: distância no lançamento (com os metros em cima); tensão na briga (com a faixa boa)
      const B = m.B;
      if (m.e === 'mira' || m.e === 'forca') {
        zonasBarra(U, 'forca'); U.barra.style.display = ''; U.enche.style.height = (m.e === 'forca' ? m.forca * 100 : 0) + '%'; U.enche.style.background = '#fff0c8'; U.enche.style.opacity = '0.9'; U.marca.style.display = 'none'; U.barra.style.borderColor = '';
        set(U.rot, 'rot', m.e === 'forca' ? Math.round(distLance(m.forca, p.vara)) + ' m' : tr('DISTÂNCIA'));
      } else if ((m.e === 'briga' || m.e === 'fisgou') && B) {
        zonasBarra(U, 'tensao'); U.barra.style.display = ''; set(U.rot, 'rot', tr('TENSÃO'));
        U.faixa.style.bottom = (B.lo * 100) + '%'; U.faixa.style.height = ((B.hi - B.lo) * 100) + '%';
        U.enche.style.height = Math.min(100, B.tensao * 100) + '%'; U.enche.style.background = B.onde > 0 ? '#ff6a50' : B.onde < 0 ? '#8fc0ff' : '#fff0c8'; U.enche.style.opacity = '0.45';
        U.marca.style.display = ''; U.marca.style.bottom = 'calc(' + Math.min(100, B.tensao * 100) + '% - 1px)';
        U.barra.style.borderColor = B.onde > 0 ? '#e8452f' : B.onde < 0 ? '#3f8fd0' : '#3fae4a';
      } else U.barra.style.display = 'none';
      if (B && (m.e === 'briga' || m.e === 'fisgou')) {
        U.briga.style.display = ''; set(U.dist, 'dist', trf('Distância {0} m', Math.max(0, B.dist).toFixed(1).replace('.', virgula() ? ',' : '.')));
        U.fol.style.width = Math.max(0, B.folego / B.folego0 * 100) + '%'; U.fr.style.width = clampN(B.frouxo, 0, 1) * 100 + '%'; U.es.style.width = clampN(B.estica, 0, 1) * 100 + '%';
      } else U.briga.style.display = 'none';
      let dica = '';
      if (m.e === 'mira') dica = tr('Arraste para mirar. Segure LANÇAR: a barra é a distância. Mire nas manchas escuras (fundo)!');
      else if (m.e === 'forca') dica = tr('Solte na distância certa!');
      else if (m.e === 'espera') dica = tr('Espere a boia afundar. Se ela só tremer, não puxe!');
      else if (m.e === 'briga' && B) dica = B.corre && B.onde >= 0 ? tr('O peixe está correndo! Solte a linha!') : B.onde > 0 ? tr('Linha esticada demais! Solte!') : B.onde < 0 ? tr('Linha frouxa! Segure PUXAR!') : tr('Mantenha a tensão na faixa verde.');
      set(U.dica, 'dica', dica);
    }

    // ================================================================ a cada quadro (depois do tickJogador e do tickPessoas)
    function tick(dt) {
      const s = S(); if (!s) return;
      if (P.tAviso > 0) { P.tAviso -= dt; if (P.tAviso <= 0 && s.modo === 'livre') api.aviso(''); }
      if (!P.montado) { if (!s.dentro && s.jog) montarRua(); if (!P.montado) return; }
      if (P.versao !== P.verQuadro) desenharQuadro();
      tickFx(dt); tickRaios(dt); tickFlash(dt); tickAnims(dt);
      if (matBagreLuz) { const k = 0.82 + 0.12 * Math.sin(s.t * 9) + (Math.random() < 0.04 ? 0.25 : 0); matBagreLuz.color.setRGB(k, k, k); }
      tickCaduLago(dt); tickBene();
      if (!s.dentro) { if (P.cadu && !P.cadu.oculto) { P.cadu.m.raiz.updateMatrixWorld(true); poseCaduLago(); } }
      if (P.mg) tickMg(dt);
      poseCenaBene();
    }
    function limpar() {
      try { fecharPainel(); esconderBanner(); const h = document.getElementById('pcHud'); if (h) h.remove(); } catch (e) { /* ok */ }
      window.removeEventListener('keydown', teclaMg, true); window.removeEventListener('keyup', teclaMg, true);
      if (P.mg && P.mg.duke) fimDuke(P.mg); if (P.mg && P.mg.fim) P.mg.fim(); P.mg = null;
      Rock.parar(true); if (P.flashEl) { P.flashEl.remove(); P.flashEl = null; }
      for (const g of geoPeixes.values()) g.dispose(); geoPeixes.clear();
      if (geoBagre) { geoBagre.dispose(); geoBagreLuz.dispose(); matBagreLuz.dispose(); geoBagre = geoBagreLuz = matBagreLuz = null; }
      if (P.texQuadro) P.texQuadro.dispose();
    }

    return { alvos, tick, limpar, montarRua, aberta, _P: P, _api: api, _f: { cenaDuke, prepararDuke, dadosP, pescar, abrirLoja, abrirCatalogo, abrirCaixa, falarComCaduLago, falarComBene, caduNoLago, naAgua, profundidade, iconePeixe, malhaPeixe, apertar, sairDaPesca, PONTA, LUGAR_CADU, DESTINO_CADU }, _dados: DADOS, _logica: LOGICA };
  }

  window.FutebolJS.registrarFase({ id: 'pesca', nome: 'Pesca', nucleoMinimo: '6.4.0', iniciar: async () => {}, criar, _dados: DADOS, _logica: LOGICA, _arte: { artePeixe } });
})();
