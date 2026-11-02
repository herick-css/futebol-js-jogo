/* =====================================================================
   FUTEBOL JS · pesca.js · A PESCA NO LAGO DO SAPO CURURU (arquivo SEPARADO, como academia.js)
   ---------------------------------------------------------------------
   6.4.0 — primeira versão.
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
   - TEXTOS: TRAD (en, es, it, fr) — as traduções daqui valem PRIMEIRO dentro da pesca (tr/trf): "LANÇAR" no jogo é o lateral do futebol
     (THROW); aqui é lançar a isca (CAST). Os nomes dos peixes ficam em PEIXES[].tr.
   - Salva em historia.cidade: pesca = { vara, varas, iscas, isca, caixa: [{ i, kg, c }], cat: { i: { n, rec, cl } }, total, ganhos, lendarios,
     caduVara, caduLago, caduMinhoca (dia em que o Cadu deu minhoca), conheceBene, papo } e mercado.conheceu/reconheceu (o 1º encontro com
     o Cadu pode ser aqui no lago).
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
    'Arraste a tela para mirar e segure LANÇAR. Solte na faixa verde!': ['Drag the screen to aim and hold CAST. Release in the green zone!', 'Arrastra la pantalla para apuntar y mantén LANZAR. ¡Suelta en la franja verde!', 'Trascina lo schermo per mirare e tieni premuto LANCIA. Rilascia nella fascia verde!', 'Fais glisser l’écran pour viser et maintiens LANCER. Relâche dans la zone verte !'],
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
    'FORÇA': ['POWER', 'FUERZA', 'FORZA', 'FORCE'],
    'TENSÃO': ['TENSION', 'TENSIÓN', 'TENSIONE', 'TENSION'],
    'Sem isca! Compre na casinha do seu Bené.': ['No bait! Buy some at Mr. Bené’s shack.', '¡Sin carnada! Compra en la casita de don Bené.', 'Niente esca! Comprala nella casetta del signor Bené.', 'Plus d’appâts ! Achètes-en à la cabane de M. Bené.'],
    'A linha embolou! Desembolando...': ['The line got tangled! Untangling...', '¡Se enredó la línea! Desenredando...', 'La lenza si è aggrovigliata! La sto sbrogliando...', 'La ligne s’est emmêlée ! Je la démêle...'],
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
    'Solte na faixa verde!': ['Release in the green zone!', '¡Suelta en la franja verde!', 'Molla nella fascia verde!', 'Lâche dans la zone verte !'],
    'Espere a boia afundar. Se ela só tremer, não puxe!': ['Wait for the bobber to sink. If it only twitches, don’t pull!', 'Espera a que el corcho se hunda. Si solo tiembla, ¡no tires!', 'Aspetta che il galleggiante affondi. Se trema soltanto, non tirare!', 'Attends que le bouchon coule. S’il tremble seulement, ne tire pas !'],
    'O peixe está correndo! Solte antes de arrebentar!': ['The fish is running! Let go before the line snaps!', '¡El pez está corriendo! ¡Suelta antes de que se rompa!', 'Il pesce sta scappando! Molla prima che si spezzi!', 'Le poisson file ! Lâche avant que ça casse !'],
    'Linha frouxa! Segure PUXAR!': ['Slack line! Hold PULL!', '¡Línea floja! ¡Mantén TIRAR!', 'Lenza molle! Tieni premuto TIRA!', 'Ligne molle ! Maintiens TIRER !'],
    'Segure PUXAR para recolher.': ['Hold PULL to reel in.', 'Mantén TIRAR para recoger.', 'Tieni premuto TIRA per recuperare.', 'Maintiens TIRER pour ramener.'],
    "A isca caiu fora d'água!": ['The bait landed out of the water!', '¡La carnada cayó fuera del agua!', 'L’esca è caduta fuori dall’acqua!', 'L’appât est tombé hors de l’eau !'],
    'Isca boa faz o peixe morder mais rápido. Mas os grandões não se impressionam fácil, não.': ['Good bait makes fish bite faster. But the big ones aren’t easily impressed.', 'Una buena carnada hace que el pez muerda más rápido. Pero los grandes no se impresionan fácil.', 'Un’esca buona fa abboccare prima il pesce. Ma i pezzi grossi non si fanno impressionare facilmente.', 'Un bon appât fait mordre le poisson plus vite. Mais les gros ne se laissent pas impressionner facilement.'],
    'Joga a isca lá pro meio do lago. Lá é mais fundo e aparece peixe mais raro.': ['Cast toward the middle of the lake. It’s deeper there and rarer fish show up.', 'Tira la carnada hacia el medio del lago. Ahí es más hondo y aparecen peces más raros.', 'Lancia l’esca verso il centro del lago. Lì è più profondo e ci sono pesci più rari.', 'Lance l’appât vers le milieu du lac. C’est plus profond et il y a des poissons plus rares.'],
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
  // qual peixe vai morder: raridade pela vara (e pela profundidade: prof 0 = beira, 1 = meio do lago), espécie pela hora e pela isca
  function sortearPeixe(h, vara, isca, prof, rnd) {
    rnd = rnd || Math.random;
    const b = blocoHora(h), dm = [1.15 - 0.3 * prof, 1, 0.8 + 0.4 * prof, 0.7 + 0.6 * prof, 0.6 + 0.8 * prof];
    const disp = [[], [], [], [], []]; PEIXES.forEach((p, i) => { if (p.h.indexOf(b) >= 0) disp[p.r].push(i); });
    const pesos = []; let tot = 0;
    for (let r = 0; r < 5; r++) {
      const L = disp[r], base = RAR_VARA[vara][r] * dm[r]; if (!L.length || base <= 0) continue;
      for (const i of L) { const fav = PEIXES[i].isca === isca ? (r === 4 ? 2 : 3) : 1, w = base / L.length * fav; pesos.push([i, w]); tot += w; }
    }
    let x = rnd() * tot; for (const [i, w] of pesos) { x -= w; if (x <= 0) return i; }
    return pesos[pesos.length - 1][0];
  }
  // peso dentro da faixa da espécie (varas melhores puxam para cima) e a classe (0 magro, 1 comum, 2 pesado)
  function sortearPeso(i, vara, rnd) {
    rnd = rnd || Math.random; const p = PEIXES[i], t = Math.pow(rnd(), 1.3 - 0.12 * vara), kg = p.kg0 + (p.kg1 - p.kg0) * t;
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
      forca: Math.min(1.3, [0.3, 0.42, 0.6, 0.78, 0.95][r] * fc * (1 + 0.3 * falta) * (1 - 0.3 * er)),
      folego: [5, 7, 11, 15, 22][r] * fc * (1 - 0.45 * er) * (1 + 0.15 * falta),
      firmeza: lerpN(0.5, 0.9, er),                                       // o anzol bem preso (isca boa) solta menos com a linha frouxa
      tranco: 1 + 0.6 * (1 - er),                                         // isca ruim: a corrida do peixe dá tranco mais forte na linha
      falta, er,
    };
  }
  // A BRIGA. B = { dist, tensao, folego, folego0, forca, corre, tFase, frouxa, res, rec, alc, choque } · seg = segurando PUXAR
  //   devolve null (continua) ou 'pegou' | 'arrebentou' | 'soltou' | 'linha' (acabou a linha)
  function novaBriga(dist, d, vara, rnd) {
    rnd = rnd || Math.random; const V = VARAS[vara];
    return { dist, tensao: 0.3, folego: d.folego, folego0: d.folego, forca: d.forca, corre: false, tFase: 0.6 + rnd() * 0.6, frouxa: 0, solta: 0, firmeza: d.firmeza, tranco: d.tranco,
      res: V.res, rec: V.rec, alc: V.alc, lado: 0, ladoAlvo: 0, t: 0, choque: 0 };
  }
  function passoBriga(B, seg, dt, rnd) {
    rnd = rnd || Math.random; B.t += dt; B.tFase -= dt;
    const cansado = B.folego <= 0;
    if (B.tFase <= 0) {
      if (B.corre) { B.corre = false; B.tFase = (0.9 + rnd() * 1.3) * (1 + 0.9 * (1 - Math.max(0, B.folego) / B.folego0)); }
      else { B.corre = cansado ? rnd() < 0.3 : true; B.tFase = B.corre ? (0.7 + rnd() * 1.1) * (0.6 + B.forca) * (cansado ? 0.5 : 1) : 0.8 + rnd() * 0.7; if (B.corre) B.ladoAlvo = (rnd() < 0.5 ? -1 : 1) * (0.25 + rnd() * 0.4); }
    }
    const F = B.forca * (cansado ? 0.55 : 1);
    let alvo, k;
    if (seg) {
      if (B.corre) { alvo = 0.55 + 0.9 * F / B.res; k = (1.4 + 1.2 * F) * B.tranco; B.dist += dt * Math.max(0, 2.0 * F - 0.6); }
      else { alvo = 0.35 + 0.35 * F / B.res; k = 1.8; B.dist -= dt * B.rec * (1 - 0.3 * F); }
      B.folego -= dt * (B.corre ? 1.6 : 0.35);
    } else {
      if (B.corre) { alvo = 0.12 + 0.15 * F; k = 2; B.dist += dt * (1.0 + 2.2 * F); B.folego -= dt * 0.6; }
      else { alvo = 0; k = 1.2; B.folego -= dt * 0.1; }
    }
    B.tensao += (alvo - B.tensao) * (1 - Math.exp(-k * dt)); if (B.tensao < 0) B.tensao = 0;
    if (B.choque > 0) B.choque -= dt;
    B.lado += (B.ladoAlvo * (B.corre ? 1 : 0.4) - B.lado) * Math.min(1, dt * 1.5);
    if (B.tensao < 0.12 && !B.corre) B.frouxa += dt; else B.frouxa = Math.max(0, B.frouxa - dt * 2);
    if (B.corre && B.tensao < 0.2) B.solta += dt * (1 - B.firmeza) * 0.9;   // correndo com a linha bamba: o anzol vai soltando
    if (B.tensao >= 1) return 'arrebentou';
    if (B.frouxa > 2.2 || B.solta >= 1) return 'soltou';
    if (B.dist > B.alc + 6) return 'linha';
    if (B.dist <= 1.0) return 'pegou';
    return null;
  }
  const DADOS = { RARIDADES, COR_RAR, PRECO_RAR, CLASSES, MULT, ISCAS, VARAS, RAR_VARA, FACIL_RAR, HORAS, ORIGENS, PEIXES };
  const LOGICA = { blocoHora, sortearPeixe, sortearPeso, classeDe, precoPeixe, dificuldade, novaBriga, passoBriga, limiteMagro, limitePesado };

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

  // o DESENHO (pixel art, vista de lado; a arraia é vista de cima) num canvas pequeno, guardado; silhueta = peixe ainda não pescado
  const cacheIcone = new Map();
  function iconePeixe(i, silhueta) {
    const ch = i + (silhueta ? 's' : ''); if (cacheIcone.has(ch)) return cacheIcone.get(ch);
    const W = 48, Hc = 32, cv = document.createElement('canvas'); cv.width = W; cv.height = Hc; const g = cv.getContext('2d');
    const p = PEIXES[i], f = p.f, F = formaDe(i), K = 38, cx = 23, cy = 16;
    const cor = (c) => (silhueta ? '#24170c' : c);
    const ret = (x0, y0, x1, y1, c) => { const a = Math.round(Math.min(x0, x1)), b = Math.round(Math.min(y0, y1)), w = Math.max(1, Math.round(Math.abs(x1 - x0))), h = Math.max(1, Math.round(Math.abs(y1 - y0))); g.fillStyle = cor(c); g.fillRect(a, b, w, h); };
    const X = (u) => cx + u * K, Y = (v) => cy - v * K;
    if (f.t === 'r') {                                                // arraia: de cima (disco + rabo)
      const R = 0.36 * K; for (let yy = -R; yy <= R; yy++) { const w = Math.sqrt(Math.max(0, R * R - yy * yy)); ret(cx + 4 - w, cy + yy, cx + 4 + w, cy + yy + 1, f.c); }
      ret(cx + 4 - R - 13, cy - 0.5, cx + 4 - R + 1, cy + 0.5, f.n);
      if (!silhueta) { for (let k = 0; k < 9; k++) { const a = sem(i, k) * 6.28, r = (0.25 + sem(i, k + 20) * 0.6) * R; ret(cx + 4 + Math.cos(a) * r - 1, cy + Math.sin(a) * r - 1, cx + 4 + Math.cos(a) * r + 1, cy + Math.sin(a) * r + 1, f.pc || '#e88030'); }
        ret(cx + 10, cy - 4, cx + 12, cy - 2, '#101010'); ret(cx + 10, cy + 2, cx + 12, cy + 4, '#101010'); }
      cacheIcone.set(ch, cv); return cv;
    }
    const H = F.H, comp = f.t === 'e' ? 1.15 : 1;
    // rabo (nadadeira caudal): dois lóbulos (a enguia não tem)
    if (f.t !== 'e') {
      const th = H * (F.x.indexOf('r') >= 0 ? 1.35 : 0.95) * (f.t === 'b' ? 0.9 : 1), tc = F.x.indexOf('T') >= 0 ? '#d83020' : f.n;
      ret(X(-0.5), Y(th / 2), X(-0.38), Y(0.04), tc); ret(X(-0.5), Y(-0.04), X(-0.38), Y(-th / 2), tc);
      ret(X(-0.4), Y(0.06), X(-0.36), Y(-0.06), tc);
      if (f.p === 8 && !silhueta) for (let k = 0; k < 3; k++) ret(X(-0.49 + k * 0.04), Y(th / 2), X(-0.47 + k * 0.04), Y(-th / 2), f.pc);
    }
    // nadadeira de cima e de baixo
    ret(X(f.t === 'l' ? -0.24 : -0.08), Y(H / 2 + H * 0.28), X(f.t === 'l' ? -0.04 : 0.16), Y(H / 2 - 0.01), f.n);
    ret(X(-0.24), Y(-H / 2 + 0.01), X(-0.1), Y(-H / 2 - H * 0.18), f.n);
    if (f.t === 'e') ret(X(-0.5), Y(-H / 2 + 0.01), X(0.2), Y(-H / 2 - H * 0.5), f.n);
    // corpo: fatias (costas em cima, barriga embaixo)
    FATIAS_X.forEach((xc, k) => {
      const h = H * F.hf[k], x0 = X((xc - FATIA_L / 2) * comp), x1 = X((xc + FATIA_L / 2) * comp);
      ret(x0, Y(h / 2), x1, Y(-h / 2 + h * 0.42), f.c); ret(x0, Y(-h / 2 + h * 0.42), x1, Y(-h / 2), f.p === 6 && k >= 3 ? f.pc : f.b);
    });
    if (F.x.indexOf('S') >= 0 || F.x.indexOf('P') >= 0) ret(X(0.475), Y(H * 0.12), X(0.58), Y(-H * 0.08), f.c);   // focinho comprido / bico de pato
    if (silhueta) { cacheIcone.set(ch, cv); return cv; }
    // desenhos
    const pc = f.pc || '#2a2a2a';
    if (f.p === 1) for (const xc of [0.24, 0.08, -0.08, -0.22]) ret(X(xc - 0.02), Y(H * 0.42), X(xc + 0.02), Y(-H * 0.3), pc);
    if (f.p === 5) for (let k = 0; k < 8; k++) { const xc = 0.36 - k * 0.09; ret(X(xc - 0.015), Y(H * 0.45), X(xc + 0.015), Y(-H * 0.45), pc); }
    if (f.p === 2 || f.p === 7) for (let k = 0; k < (F.x.indexOf('3') >= 0 ? 3 : 9); k++) { const xc = F.x.indexOf('3') >= 0 ? 0.2 - k * 0.2 : 0.34 - sem(i, k) * 0.66, yc = F.x.indexOf('3') >= 0 ? 0 : (sem(i, k + 9) - 0.5) * H * 0.7; ret(X(xc) - 1, Y(yc) - 1, X(xc) + 1, Y(yc) + 1, pc); }
    if (f.p === 3) ret(X(0.38), Y(0.012), X(-0.36), Y(-0.012), pc);
    if (f.p === 4 || F.x.indexOf('o') >= 0) { ret(X(-0.37) - 2, Y(0.02) - 2, X(-0.37) + 2, Y(0.02) + 2, f.p === 4 ? pc : '#e86030'); ret(X(-0.37) - 1, Y(0.02) - 1, X(-0.37) + 1, Y(0.02) + 1, '#101010'); }
    if (F.x.indexOf('m') >= 0) for (let k = 0; k < 4; k++) ret(X(0.2 - k * 0.14) - 1, Y((sem(i, k) - 0.5) * H * 0.6) - 1, X(0.2 - k * 0.14) + 2, Y((sem(i, k) - 0.5) * H * 0.6) + 1, '#e86030');
    if (F.x.indexOf('w') >= 0) for (let k = 0; k < 8; k++) ret(X(0.3 - sem(i, k + 3) * 0.6), Y((sem(i, k + 7) - 0.5) * H * 0.6), X(0.3 - sem(i, k + 3) * 0.6) + 1, Y((sem(i, k + 7) - 0.5) * H * 0.6) + 1, '#f8f4e8');
    if (F.x.indexOf('k') >= 0) ret(X(0.27) - 1, Y(0.03) - 1, X(0.27) + 1, Y(0.03) + 1, '#101010');
    if (f.b === '#d8402a' || F.x.indexOf('v') >= 0) { /* barriga vermelha já está na cor */ }
    // olho, boca, bigodes
    const ex = X(0.38), ey = Y(H * 0.12);
    ret(ex - 1, ey - 1, ex + 2, ey + 2, F.x.indexOf('R') >= 0 ? '#d02020' : '#f4f0e0'); ret(ex, ey, ex + 1, ey + 1, '#101010');
    if (F.x.indexOf('d') >= 0) ret(X(0.44), Y(-H * 0.18), X(0.47), Y(-H * 0.24), '#f8f8f0');
    if (f.t === 'b' || F.x.indexOf('L') >= 0) { const L = F.x.indexOf('L') >= 0 ? 0.22 : 0.12; ret(X(0.46), Y(-H * 0.05), X(0.46 + L), Y(-H * 0.05) + 1, f.n); ret(X(0.44), Y(-H * 0.28), X(0.44 + L * 0.7), Y(-H * 0.28) + 1, f.n); }
    if (F.x.indexOf('B') >= 0) ret(X(0.46), Y(-H * 0.32), X(0.56), Y(-H * 0.32) + 1, f.n);
    cacheIcone.set(ch, cv); return cv;
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
      cp: null, versao: 0, tAviso: 0, montado: false, fx: [], painel: null, css: false };

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
    function criarBoia() {
      const G = new api.Geo(); G.box(0.08, 0.07, 0.08, '#e83a2a', 0, 0.02, 0); G.box(0.075, 0.06, 0.075, '#f4f4ec', 0, -0.04, 0); G.box(0.015, 0.1, 0.015, '#1c1c1f', 0, 0.09, 0);
      const m = G.malha(api.MAT); m.visible = false; grupo().add(m); return m;
    }
    const MAT_LINHA = new THREE.LineBasicMaterial({ color: 0xe8e8e0, transparent: true, opacity: 0.8 });
    function criarLinha() {
      const N = 16, g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(new Array(N * 3).fill(0), 3));
      const l = new THREE.Line(g, MAT_LINHA); l.frustumCulled = false; l.visible = false; grupo().add(l); return l;
    }
    // a linha da ponta da vara (a) até a boia/peixe (b), com barriga (sag) — quanto mais tensa, mais reta
    function linhaDe(L, a, b, sag) {
      const pos = L.geometry.attributes.position, N = pos.count;
      for (let k = 0; k < N; k++) { const t = k / (N - 1); pos.setXYZ(k, a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t - sag * 4 * t * (1 - t), a.z + (b.z - a.z) * t); }
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
    // o PEIXE 3D: comprimento 1 (cabeça para +x), centrado; a escala é o comprimento de verdade (ver comprimentoDe)
    const geoPeixes = new Map();
    function geoPeixe(i) {
      if (geoPeixes.has(i)) return geoPeixes.get(i);
      const p = PEIXES[i], f = p.f, F = formaDe(i), G = new api.Geo(), box = (w, h, d, cor, x, yc, z) => G.box(w, h, d, cor, x, yc - h / 2, z);
      if (f.t === 'r') {                                                // arraia: disco achatado + rabo
        for (let k = -4; k <= 4; k++) { const wx = Math.sqrt(1 - (k / 4.6) * (k / 4.6)) * 0.62; box(wx, 0.03, 0.075, f.c, 0.12, 0.015, k * 0.075); box(wx, 0.025, 0.075, f.b, 0.12, -0.012, k * 0.075); }
        box(0.55, 0.022, 0.022, f.n, -0.45, 0.01, 0); for (let k = 0; k < 9; k++) { const a = sem(i, k) * 6.28, r = 0.08 + sem(i, k + 20) * 0.18; box(0.04, 0.005, 0.04, f.pc, 0.12 + Math.cos(a) * r, 0.033, Math.sin(a) * r); }
        box(0.03, 0.02, 0.03, '#101010', 0.32, 0.04, 0.06); box(0.03, 0.02, 0.03, '#101010', 0.32, 0.04, -0.06);
      } else {
        const H = F.H, W = F.W, comp = f.t === 'e' ? 1.15 : 1;
        FATIAS_X.forEach((xc, k) => {
          const h = H * F.hf[k], w = W * F.wf[k], x = xc * comp, L = FATIA_L * comp + 0.002;
          box(L, h * 0.58, w, f.c, x, h / 2 - h * 0.29, 0); box(L, h * 0.42, w * 0.96, f.p === 6 && k >= 3 ? f.pc : f.b, x, -h / 2 + h * 0.21, 0);
          const lado = w / 2 + 0.003;                                     // desenhos nos dois lados
          for (const sz of [-1, 1]) {
            if (f.p === 1 && k >= 1 && k <= 4) box(0.035, h * 0.72, 0.006, f.pc, x, h * 0.05, sz * lado);
            if (f.p === 5) { box(0.025, h * 0.85, 0.006, f.pc, x - 0.035, 0, sz * lado); box(0.025, h * 0.85, 0.006, f.pc, x + 0.04, 0, sz * lado); }
            if (f.p === 3) box(L, Math.max(0.012, h * 0.08), 0.006, f.pc, x, 0, sz * lado);
            if ((f.p === 2 || f.p === 7) && k <= 4) for (let q = 0; q < 2; q++) box(0.03, 0.03, 0.006, f.pc, x + (sem(i, k * 3 + q) - 0.5) * 0.12, (sem(i, k * 5 + q) - 0.5) * h * 0.6, sz * lado);
            if (F.x.indexOf('w') >= 0 && k <= 4) box(0.02, 0.02, 0.006, '#f8f4e8', x + (sem(i, k + 40) - 0.5) * 0.1, (sem(i, k + 50) - 0.5) * h * 0.5, sz * lado);
          }
        });
        const tc = F.x.indexOf('T') >= 0 ? '#d83020' : f.n;
        if (f.t !== 'e') { const th = H * (F.x.indexOf('r') >= 0 ? 1.35 : 0.95) * (f.t === 'b' ? 0.9 : 1);
          box(0.13, th * 0.46, 0.018, tc, -0.445, th * 0.27, 0); box(0.13, th * 0.46, 0.018, tc, -0.445, -th * 0.27, 0); box(0.05, H * 0.3, 0.02, tc, -0.385, 0, 0);
          if (f.p === 8) for (let k = 0; k < 3; k++) box(0.02, th * 0.9, 0.022, f.pc, -0.48 + k * 0.035, 0, 0); }
        box(0.22, H * 0.28, 0.018, f.n, f.t === 'l' ? -0.14 : 0.04, H / 2 + H * 0.12, 0);                 // de cima
        box(0.14, H * 0.18, 0.018, f.n, -0.17, -H / 2 - H * 0.07, 0);                                     // de baixo
        if (f.t === 'e') box(0.7, H * 0.45, 0.016, f.n, -0.15, -H / 2 - H * 0.2, 0);
        for (const sz of [-1, 1]) box(0.1, 0.012, 0.07, f.n, 0.24, -H * 0.2, sz * (W * 0.45 + 0.03));                    // peitorais
        if (F.x.indexOf('S') >= 0 || F.x.indexOf('P') >= 0) box(0.12, H * (F.x.indexOf('P') >= 0 ? 0.18 : 0.22), W * (F.x.indexOf('P') >= 0 ? 0.9 : 0.4), f.c, 0.53, 0, 0);
        const ew = W * F.wf[0] / 2 + 0.006;
        for (const sz of [-1, 1]) {
          box(0.055, 0.055, 0.006, F.x.indexOf('R') >= 0 ? '#d02020' : '#f4f0e0', 0.38, H * 0.12, sz * ew); box(0.03, 0.03, 0.008, '#101010', 0.385, H * 0.12, sz * (ew + 0.002));
          if (f.p === 4 || F.x.indexOf('o') >= 0) { box(0.06, 0.06, 0.006, f.p === 4 ? f.pc : '#e86030', -0.36, 0.01, sz * (W * F.wf[5] / 2 + 0.004)); box(0.03, 0.03, 0.008, '#101010', -0.36, 0.01, sz * (W * F.wf[5] / 2 + 0.006)); }
          if (F.x.indexOf('k') >= 0) box(0.035, 0.035, 0.006, '#101010', 0.27, 0.02, sz * (W * F.wf[1] / 2 + 0.004));
          if (F.x.indexOf('m') >= 0) for (let q = 0; q < 3; q++) box(0.05, 0.035, 0.006, '#e86030', 0.18 - q * 0.15, (sem(i, q) - 0.5) * H * 0.5, sz * (W / 2 + 0.004));
          if (f.t === 'b' || F.x.indexOf('L') >= 0) { const L = F.x.indexOf('L') >= 0 ? 0.32 : 0.18; box(L, 0.012, 0.012, f.n, 0.48 + L / 2, -H * 0.05, sz * W * 0.3); box(L * 0.7, 0.01, 0.01, f.n, 0.46 + L * 0.35, -H * 0.3, sz * W * 0.18); }
          if (F.x.indexOf('B') >= 0) box(0.1, 0.01, 0.01, f.n, 0.52, -H * 0.32, sz * 0.012);
        }
        if (F.x.indexOf('d') >= 0) for (let q = -1; q <= 1; q++) box(0.015, 0.03, 0.015, '#f8f8f0', 0.47, -H * 0.12, q * W * 0.12);
      }
      const geo = G.malha(api.MAT).geometry; geoPeixes.set(i, geo); return geo;
    }
    function malhaPeixe(i, kg) { const m = new THREE.Mesh(geoPeixe(i), api.MAT), L = comprimentoDe(i, kg); m.scale.setScalar(L); m.userData.L = L; return m; }

    // ---------------------------------------------------------------- água: anéis e respingos (poucos objetos, reaproveitados)
    let geoAnel = null, geoGota = null;
    function anel(x, z, tam, forca) {
      if (!geoAnel) { geoAnel = new THREE.RingGeometry(0.82, 1, 20); geoAnel.rotateX(-Math.PI / 2); geoGota = new THREE.BoxGeometry(0.05, 0.05, 0.05); }
      const m = new THREE.Mesh(geoAnel, new THREE.MeshBasicMaterial({ color: 0xf4fbff, transparent: true, opacity: 0.8, depthWrite: false }));
      m.position.set(x, Y_AGUA + 0.012, z); m.scale.setScalar(0.08); grupo().add(m);
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
        const e = P.fx[k]; e.t += dt; const u = e.t / e.dur;
        if (e.tipo === 'anel') { e.m.scale.setScalar(0.08 + e.tam * suave(u)); e.m.material.opacity = 0.8 * (1 - u); }
        else { e.vy -= 9.8 * dt; e.m.position.x += e.vx * dt; e.m.position.y += e.vy * dt; e.m.position.z += e.vz * dt; if (e.m.position.y < Y_AGUA) e.t = e.dur; e.m.material.opacity = 0.95 * (1 - u * 0.6); }
        if (e.t >= e.dur) { if (e.m.parent) e.m.parent.remove(e.m); e.m.material.dispose(); P.fx.splice(k, 1); }
      }
    }

    // ---------------------------------------------------------------- a casinha: persiana (fechada à noite) e o QUADRO do catálogo
    function criarPersiana() {
      const cv = document.createElement('canvas'); cv.width = 32; cv.height = 64; const g = cv.getContext('2d');
      for (let y = 0; y < 64; y += 4) { g.fillStyle = (y / 4) % 2 ? '#8a9a8c' : '#a4b2a4'; g.fillRect(0, y, 32, 4); g.fillStyle = '#5f6e62'; g.fillRect(0, y + 3, 32, 1); }
      const tx = new THREE.CanvasTexture(cv); tx.magFilter = THREE.NearestFilter; tx.minFilter = THREE.NearestFilter; tx.generateMipmaps = false;
      const m = new THREE.Mesh(new THREE.BoxGeometry(2.42, 2.15, 0.05), new THREE.MeshLambertMaterial({ map: tx }));
      m.position.set(BALCAO.x, 2.15 / 2, CP.z1 + 0.03); m.visible = false; grupo().add(m); return m;
    }
    function criarQuadro() {
      const cv = document.createElement('canvas'); cv.width = 256; cv.height = 160;
      const tx = new THREE.CanvasTexture(cv); tx.magFilter = THREE.NearestFilter; tx.minFilter = THREE.LinearFilter; tx.generateMipmaps = false;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(QP.w, QP.h), new THREE.MeshLambertMaterial({ map: tx, emissive: 0x222222, emissiveMap: tx }));
      m.position.set(CX + QP.u, QP.y + QP.h / 2, CP.z1 + 0.046); grupo().add(m); P.texQuadro = tx; P.cvQuadro = cv; return m;
    }
    function desenharQuadro() {
      const cv = P.cvQuadro; if (!cv) return; const g = cv.getContext('2d'), p = dadosP();
      g.imageSmoothingEnabled = false; g.fillStyle = '#3a2414'; g.fillRect(0, 0, 256, 160);
      g.fillStyle = '#f0a020'; g.font = "bold 12px Silkscreen, 'Courier New', monospace"; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(tr('Catálogo do lago').toUpperCase(), 128, 11);
      PEIXES.forEach((pe, i) => {
        const c = i % 10, l = Math.floor(i / 10), x = 8 + c * 24, y = 22 + l * 20, tem = !!p.cat[i];
        g.fillStyle = tem ? COR_RAR[pe.r] : '#5a3a20'; g.fillRect(x, y, 23, 19); g.fillStyle = tem ? '#f4ead2' : '#2e1c0e'; g.fillRect(x + 1, y + 1, 21, 17);
        g.drawImage(iconePeixe(i, !tem), 0, 0, 48, 32, x + 1, y + 2, 21, 14);
      });
      g.fillStyle = '#fff0c8'; g.font = "bold 9px Silkscreen, 'Courier New', monospace"; g.fillText(trf('Descobertos: {0}/60', descobertos()), 128, 152);
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
      const longe = !!C.m.longe; cp.vara.raiz.visible = !longe; if (longe) { cp.linha.visible = false; return; }
      const m = C.m, t = S().t; let dz = 0.55, cz = 1.05, ez = 0.7, ecz = 0.95, ex = -0.42, b = 0.05;
      if (cp.e === 'espera') { dz += Math.sin(t * 0.8) * 0.03; }
      else if (cp.e === 'fisga') { dz = 1.35; cz = 0.9; b = 0.4; }
      else if (cp.e === 'puxa') { dz = 1.0 + Math.sin(t * 9) * 0.05; cz = 0.85; b = 0.55 + Math.sin(t * 13) * 0.08; ecz = 1.2 + Math.sin(t * 7) * 0.3; }
      else if (cp.e === 'pega') { dz = 0.9; ez = 2.0; ecz = 0.35; ex = -0.15; }
      else if (cp.e === 'escapa') { dz = 0.5 + Math.max(0, cp.t - 1.0) * 1.5; b = 0; }
      else if (cp.e === 'lanca') { const u = 1 - cp.t / 1.3; dz = u < 0.45 ? 0.55 + suave(u / 0.45) * 1.9 : 2.45 - suave((u - 0.45) / 0.3) * 2.0; cz = 1.05 - Math.min(1, u * 2) * 0.3; }
      if (C.fala) { ez = 0.9 + Math.sin(t * 6) * 0.3; ecz = 0.8; }
      m.bracoD.rotation.z = dz; m.bracoD.rotation.x = 0.12; usarCotovelo(m.bracoD, 0, cz);
      m.bracoE.rotation.z = ez; m.bracoE.rotation.x = ex; usarCotovelo(m.bracoE, 0, ecz);
      vergar(cp.vara, SINAL_VERGA * b);
      // a linha e a boia
      const a = mundo(cp.vara.ponta);
      let bx = cp.bx, bz = cp.bz, by = Y_AGUA + 0.02 + Math.sin(t * 2.2) * 0.012;
      if (cp.e === 'puxa' || cp.e === 'pega' || cp.e === 'escapa') { bx = cp.px; bz = cp.pz; by = cp.e === 'puxa' ? Y_AGUA - 0.05 : Y_AGUA + 0.02; }
      if (cp.e === 'lanca') { if (!cp.solto) { bx = a.x; by = a.y - 0.3; bz = a.z; } else { const u = clampN(cp.voo / 0.55, 0, 1); bx = lerpN(a.x, cp.bx, u); bz = lerpN(a.z, cp.bz, u); by = lerpN(a.y, Y_AGUA + 0.02, u) + Math.sin(u * Math.PI) * 1.4; } }
      cp.boia.visible = cp.e !== 'pega'; cp.boia.position.set(bx, by, bz);
      if (cp.e === 'pega' && cp.mPeixe) linhaDe(cp.linha, a, mundo(cp.mPeixe), 0.02); else linhaDe(cp.linha, a, { x: bx, y: by + 0.06, z: bz }, cp.e === 'puxa' ? 0.05 : 0.3);
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
      'Joga a isca lá pro meio do lago. Lá é mais fundo e aparece peixe mais raro.',
      'Se a boia só tremer, espera! Fisga quando ela afundar de vez.',
      'Quando o peixe correr, solta a linha. Se segurar, arrebenta!',
      'Mas não deixa a linha frouxa demais, senão ele cospe o anzol.',
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
        } else await api.fala('bene', tr(pk(['E aí, vai querer o quê hoje?', 'Opa! Que bom te ver!', 'Fala! O lago tá bom hoje.'])));
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
.pcIco{width:48px;height:32px;image-rendering:pixelated;flex:none}
.pcIcoP{width:32px;height:32px;image-rendering:pixelated;flex:none}
.pcTxt{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}
.pcNome{font:700 13px/1.2 var(--font-display)}
.pcSub{font-size:12px;opacity:.85;line-height:1.3}
.pcBts{display:flex;gap:5px;flex-wrap:wrap;justify-content:flex-end;flex:none;max-width:52%}
.pcBt{height:34px;padding:0 10px;font-size:12px}
.pcGrade{display:grid;grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:6px}
.pcCel{display:flex;flex-direction:column;align-items:center;gap:3px;padding:5px 3px;background:#3a1c0a;border:2px solid #5a3414;cursor:pointer;font-size:11px;text-align:center;line-height:1.15;color:#fff0c8}
.pcCel img{width:72px;height:48px;image-rendering:pixelated}
.pcFil{display:flex;gap:5px;flex-wrap:wrap}
.pcFicha{display:flex;gap:12px;flex-wrap:wrap;align-items:flex-start}
.pcFicha img{width:192px;height:128px;image-rendering:pixelated;background:#f4ead2;border:3px solid #5a3414}
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
#pcHud .pcBarra{position:absolute;right:calc(140px + env(safe-area-inset-right,0px));bottom:calc(14px + env(safe-area-inset-bottom,0px));width:20px;height:104px;background:#1c0e04;border:3px solid #5a3414;box-sizing:border-box}
#pcHud .pcBarra .pcZona{position:absolute;left:0;right:0}
#pcHud .pcBarra .pcEnche{position:absolute;left:3px;right:3px;bottom:0;background:#fff0c8;opacity:.9}
#pcHud .pcBarra .pcMarca{position:absolute;left:-6px;right:-6px;height:3px;background:#fff;box-shadow:0 0 0 1px #2a1206}
#pcHud .pcBarra .pcRot{position:absolute;left:50%;top:-15px;transform:translateX(-50%);font:700 9px/1 var(--font-display);white-space:nowrap;text-shadow:0 1px 0 #2a1206}
#pcHud .pcBriga{position:absolute;right:calc(170px + env(safe-area-inset-right,0px));bottom:calc(16px + env(safe-area-inset-bottom,0px));display:flex;flex-direction:column;gap:3px;align-items:flex-end;font:700 10px/1.2 var(--font-display);text-shadow:0 1px 0 #2a1206}
#pcHud .pcFol{width:72px;height:6px;background:#1c0e04;border:2px solid #5a3414}
#pcHud .pcFol i{display:block;height:100%;background:#e8452f}
#pcHud .pcChoque{position:absolute;inset:0;background:#d8f0ff;opacity:0;transition:opacity .25s;pointer-events:none}
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
              const L = linha(imgDe(iconePeixe(f.i), 48, 32), nomePeixe(f.i), nomeRar(PEIXES[f.i].r) + ' · ' + fmtKg(f.kg) + ' · ' + nomeClasse(f.c) + ' (×' + String(MULT[f.c]).replace('.', virgula() ? ',' : '.') + ')', COR_RAR[PEIXES[f.i].r]);
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
            c.appendChild(imgDe(iconePeixe(i, !tem), 72, 48, ''));
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
          const F = document.createElement('div'); F.className = 'pcFicha'; F.appendChild(imgDe(iconePeixe(i, !c), 192, 128, ''));
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
            const L = linha(imgDe(iconePeixe(f.i), 48, 32), nomePeixe(f.i), nomeRar(PEIXES[f.i].r) + ' · ' + fmtKg(f.kg) + ' · ' + nomeClasse(f.c) + ' · ' + trf('vale {0} fakes', precoPeixe(f.i, f.c)), COR_RAR[PEIXES[f.i].r]);
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

    // ================================================================ O MINIGAME (na ponta do píer, em 3D, como o chute da partida)
    //   estados: mira → forca (segurando LANÇAR) → swing → voo (a boia no ar) → espera (beliscadas) → mordida (FISGAR!) → fisgou → briga
    //   → pegou (troféu, reação, caixa) | falhou (escapou/arrebentou) → recolhe → mira. Outros: embolou (força no vermelho), assustou.
    const SINAL_VERGA = -1;
    // mostrando o peixe: o jogador vira um pouco para o lado (m.yaw0 - 0.45) e a câmera vem de frente                                            // (conferido na tela: assim a ponta verga para o lado da linha)
    const dirDe = (yaw) => ({ x: Math.cos(yaw), z: -Math.sin(yaw) });
    const angN = (a) => ((a + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
    function naAgua(x, z) { const pr = api.PIER; if (x > pr.x0 - 0.4 && x < pr.x1 + 0.4 && z > pr.z0 - 0.4 && z < pr.z1 + 0.4) return false; return api.dentroLago(x, z, -0.7); }
    function profundidade(x, z) { const L = api.LAGO, r = Math.hypot((x - L.cx) / L.rx, (z - L.cz) / L.rz); return clampN((0.62 - r) / 0.5, 0, 1); }
    const distLance = (v, vara) => 4 + Math.min(v, 0.93) / 0.93 * (VARAS[vara].alc - 4) * (v > 0.93 ? 1.04 : 1);
    function msgMg(txt, seg) { const m = P.mg; if (!m) return; m.U.recado.textContent = txt; m.tRec = seg || 2; }

    async function pescar(comCadu, lugar) {
      const s = S(), J = s.jog, p = dadosP(); if (!temVara() || P.mg) return;
      if (diaDeTrabalho()) { await semPescaHoje(); return; }
      const Lg = lugar || { x: PONTA.x, z: PONTA.z, yaw: YAW_BASE };
      if (totalIscas() <= 0) {
        if (comCadu && p.caduMinhoca !== s.dados.dia) { await api.fala('cadu', tr('Tá sem isca? Toma umas minhocas, por minha conta.')); p.iscas[0] = nIsca(0) + 5; p.caduMinhoca = s.dados.dia; p.isca = 0; gravar(); Dialogo.esconder(); }
        else { await api.fala('jog', tr('Estou sem isca... O seu Bené vende lá na casinha.')); Dialogo.esconder(); return; }
      }
      if (nIsca(p.isca) <= 0) p.isca = ISCAS.findIndex((_, k) => nIsca(k) > 0);
      await api.preto(true, 350);
      J.sentado = false; J.rota = null; J.andando = false; J.correndo = false; J.x = Lg.x; J.z = Lg.z; J.yaw = J.yawAlvo = Lg.yaw;
      const yChao = api.altura(Lg.x, Lg.z);
      const U = montarHud(), ui = api.UI(); const esqAntes = ui.esq.hidden; ui.esq.hidden = true; api.aviso('');
      const m = P.mg = { e: 'mira', t: 0, ang: 0, ang0: 0, mira: 0, segura: false, forca: 0, comCadu: !!comCadu, U, tRec: 0, pausa: false, ocupado: false,
        vara: criarVara(p.vara), boiaM: criarBoia(), linha: criarLinha(), boiaP: null, bite: null, B: null, cam: null, pontos: [], alvoM: null,
        ox: Lg.x, oz: Lg.z, yaw0: Lg.yaw, y: yChao, lim: lugar ? 1.4 : 0.75 };
      varaNaMao(J.m, m.vara); P.isopor.visible = true; P.isopor.tampa.rotation.x = 0;
      if (lugar) {                                                        // a caixa de isopor do lado do jogador (do lado que for terra firme)
        const d = dirDe(Lg.yaw), lx = -d.z, lz = d.x; let ix = Lg.x + lx * 0.8 - d.x * 0.25, iz = Lg.z + lz * 0.8 - d.z * 0.25;
        if (api.dentroLago(ix, iz, 0.2)) { ix = Lg.x - lx * 0.8 - d.x * 0.25; iz = Lg.z - lz * 0.8 - d.z * 0.25; }
        if (api.dentroLago(ix, iz, 0.2)) { ix = Lg.x - d.x * 0.8; iz = Lg.z - d.z * 0.8; }
        P.isopor.position.set(ix, api.altura(ix, iz), iz); P.isopor.rotation.y = Lg.yaw + Math.PI / 2;
      } else { P.isopor.position.set(ISOPOR.x, Y_PIER, ISOPOR.z); P.isopor.rotation.y = 0.15; }
      for (let k = 0; k < 7; k++) { const d = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.02, 0.13), new THREE.MeshBasicMaterial({ color: 0xfff0c8, transparent: true, opacity: 0.75, depthWrite: false })); d.visible = false; grupo().add(d); m.pontos.push(d); }
      { if (!geoAnel) anel(0, -900, 0.1); const a = new THREE.Mesh(geoAnel, new THREE.MeshBasicMaterial({ color: 0xf0a020, transparent: true, opacity: 0.85, depthWrite: false })); a.visible = false; grupo().add(a); m.alvoM = a; }
      window.addEventListener('keydown', teclaMg, true); window.addEventListener('keyup', teclaMg, true);
      if (m.comCadu) msgMg(tr('Cadu') + ': ' + tr('Boa pescaria!'), 2.5);
      tickMg(0.016); s.cam.snap = true;
      await api.preto(false, 350);
      await new Promise((ok) => { m.fim = ok; });
      await api.preto(true, 350);
      window.removeEventListener('keydown', teclaMg, true); window.removeEventListener('keyup', teclaMg, true);
      fecharPainel(); esconderBanner(); tirarVara(m.vara);
      for (const o of [m.boiaM, m.linha, m.alvoM].concat(m.pontos)) { if (o.parent) o.parent.remove(o); if (o.material && o.material !== MAT_LINHA) o.material.dispose(); if (o.geometry && o.geometry !== geoAnel) o.geometry.dispose(); }
      if (m.trofeu && m.trofeu.m.parent) m.trofeu.m.parent.remove(m.trofeu.m);
      if (m.voa && m.voa.m.parent) m.voa.m.parent.remove(m.voa.m);
      P.isopor.visible = false; U.el.remove(); P.mg = null;
      const ss = S(); if (ss) { ss.camCena = null; ss.cam.snap = true; ss.jog.yaw = ss.jog.yawAlvo = 0; ui.esq.hidden = esqAntes; }
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
      const m = P.mg; if (!m || P.painel || m.ocupado) return;
      const desce = e.type === 'keydown';
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
        '<div class="pcRecado"></div><div class="pcDica"></div>' +
        '<div class="pcBarra"><div class="pcZonas"></div><div class="pcEnche"></div><div class="pcMarca"></div><span class="pcRot"></span></div>' +
        '<div class="pcBriga"><span class="pcDist"></span><span class="pcFolT"></span><div class="pcFol"><i></i></div></div>' +
        '<button type="button" class="pxBtn pxPrim pcAcao"></button>';
      (document.getElementById('raizJogo') || document.body).appendChild(el);
      const q = (s) => el.querySelector(s);
      const U = { el, isca: q('.pcIsca'), vara: q('.pcVara'), caixa: q('.pcCaixa'), cat: q('.pcCat'), sair: q('.pcSair'), recado: q('.pcRecado'), dica: q('.pcDica'),
        menuB: q('.pcMenuB'), menuI: q('.pcMenuI'), badge: q('.pcBadge'), menu: q('.pcMenu'), arrasto: q('.pcArrasto'),
        barra: q('.pcBarra'), zonas: q('.pcZonas'), enche: q('.pcEnche'), marca: q('.pcMarca'), rot: q('.pcRot'), briga: q('.pcBriga'), dist: q('.pcDist'), folT: q('.pcFolT'), fol: q('.pcFol i'), acao: q('.pcAcao'), choque: q('.pcChoque'), modo: '', cache: {} };
      U.cat.textContent = tr('Catálogo'); U.folT.textContent = tr('Fôlego do peixe');
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
      // mirar arrastando o dedo na tela (como girar a câmera na cidade)
      const arr = { id: null, x: 0 };
      U.arrasto.addEventListener('pointerdown', (e) => { if (arr.id != null) return; arr.id = e.pointerId; arr.x = e.clientX; try { U.arrasto.setPointerCapture(e.pointerId); } catch (x) { /* ok */ } if (!U.menu.hidden) menu(false); });
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
    // a barra (como a de força do chute): zonas de cor por baixo, o preenchimento e a marca
    function zonasBarra(U, modo) {
      if (U.modo === modo) return; U.modo = modo;
      const Z = modo === 'forca' ? [[0, 12, '#3f7fd0'], [12, 80, '#3fae4a'], [80, 93, '#e8c030'], [93, 100, '#d8402a']] : [[0, 15, '#3f7fd0'], [15, 70, '#3fae4a'], [70, 88, '#e8c030'], [88, 100, '#d8402a']];
      U.zonas.innerHTML = Z.map(([a, b, c]) => '<div class="pcZona" style="bottom:' + a + '%;height:' + (b - a) + '%;background:' + c + ';opacity:.55"></div>').join('');
      U.rot.textContent = modo === 'forca' ? tr('FORÇA') : tr('TENSÃO');
    }
    function apertar(on) {
      const m = P.mg; if (!m) return;
      if (m.pausa || m.ocupado) { if (!on) m.segura = false; return; }
      m.segura = on;
      if (on) { if (m.e === 'mira') comecarForca(); else if (m.e === 'espera') puxarNaEspera(); else if (m.e === 'mordida') fisgar(); }
      else if (m.e === 'forca') soltarLance();
    }
    function irPara(e) { const m = P.mg; m.e = e; m.t = 0; if (e === 'mira') { m.boiaP = null; m.arrebentou = false; m.bite = null; m.B = null; m.de = null; } }
    function comecarForca() {
      const m = P.mg, p = dadosP();
      if (nIsca(p.isca) <= 0) { const k = ISCAS.findIndex((_, q) => nIsca(q) > 0); if (k < 0) { msgMg(tr('Sem isca! Compre na casinha do seu Bené.'), 2.5); SOM.erro(); return; } p.isca = k; }
      m.e = 'forca'; m.t = 0; m.forca = 0;
    }
    function soltarLance() {
      const m = P.mg, p = dadosP(), v = m.forca, faixa = v < 0.12 ? 0 : v < 0.8 ? 1 : v < 0.93 ? 2 : 3;
      if (faixa === 3 && Math.random() < 0.4) { msgMg(tr('A linha embolou! Desembolando...'), 2.3); SOM.erro(); m.e = 'embolou'; m.t = 0; return; }
      const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
      m.dist = distLance(v, p.vara) * (1 + gauss() * 0.05); m.forcaUsada = v;
      const yaw = m.yaw0 + m.ang + gauss() * [0.06, 0.035, 0.08, 0.2][faixa], d = dirDe(yaw);
      m.alvo = { x: m.ox + d.x * m.dist, z: m.oz + d.z * m.dist }; m.voo = null; m.e = 'swing'; m.t = 0; SOM.lanca();
    }
    function pousou() {
      const m = P.mg, a = m.alvo; m.boiaP = { x: a.x, y: Y_AGUA, z: a.z };
      if (!naAgua(a.x, a.z)) { msgMg(tr("A isca caiu fora d'água!"), 2.2); SOM.erro(); m.e = 'falhou'; m.t = 1.0; m.de = { x: a.x, y: Y_AGUA + 0.3, z: a.z }; return; }
      respingo(a.x, a.z, 5, 0); SOM.agua(); novaEspera(false);
      const pf = profundidade(a.x, a.z); msgMg(pf > 0.6 ? tr('Água funda') : pf > 0.25 ? tr('Água média') : tr('Água rasa'), 1.6);
    }
    function novaEspera(re) {
      const m = P.mg, p = dadosP(), b = m.boiaP, pf = profundidade(b.x, b.z), i = sortearPeixe(hora(), p.vara, p.isca, pf), pw = sortearPeso(i, p.vara), d = dificuldade(i, pw.classe, p.vara, p.isca);
      const W = rnd(d.espera[0], d.espera[1]) * (api.chuva() ? 0.85 : 1) * (re ? 1.15 : 1);
      const bel = []; for (let k = 0; k < d.beliscadas; k++) { const tb = rnd(1.5, Math.max(2, W - 1.4)); if (bel.every((x) => Math.abs(x - tb) > 1.2)) bel.push(tb); } bel.sort((a, c) => a - c);
      m.bite = { i, kg: pw.kg, classe: pw.classe, d, W, bel, isca: p.isca }; m.e = 'espera'; m.t = 0; m.belAtiva = -1; m.beliscando = false;
    }
    function tickEspera() {
      const m = P.mg, b = m.bite; let ativa = -1;
      for (let k = 0; k < b.bel.length; k++) if (m.t >= b.bel[k] && m.t < b.bel[k] + 0.4) ativa = k;
      if (ativa >= 0 && m.belAtiva !== ativa) { m.belAtiva = ativa; SOM.toc(); anel(m.boiaP.x, m.boiaP.z, 0.35); msgMg(tr('Beliscou...'), 0.9); }
      m.beliscando = ativa >= 0 || (m.belAtiva >= 0 && m.t < b.bel[m.belAtiva] + 0.55);
      if (m.t >= b.W) {
        const p = dadosP(); p.iscas[b.isca] = Math.max(0, nIsca(b.isca) - 1); gravar();            // mordeu: a isca foi (pegando ou não)
        m.e = 'mordida'; m.t = 0; SOM.ploc(); respingo(m.boiaP.x, m.boiaP.z, 4, 0.2); msgMg(tr('FISGA!'), 1);
        try { if (navigator.vibrate) navigator.vibrate(120); } catch (e) { /* sem vibrar */ }
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
      m.peixeP = { x: m.boiaP.x, z: m.boiaP.z }; m.e = 'fisgou'; m.t = 0; m.proxChoque = rnd(4, 7); m.corriaAntes = false;
      SOM.ploc(); respingo(m.boiaP.x, m.boiaP.z, 6, 0.3); msgMg(tr('Fisgou!'), 1.2);
    }
    function tickBriga(dt) {
      const m = P.mg, B = m.B, pe = PEIXES[m.bite.i];
      const r = passoBriga(B, m.segura && !m.pausa, dt), d = dirDe(m.yaw0 + m.ang0 + B.lado);
      m.peixeP = { x: m.ox + d.x * B.dist, z: m.oz + d.z * B.dist };
      if (B.corre) { m.tAnel = (m.tAnel || 0) - dt; if (m.tAnel <= 0) { m.tAnel = 0.25; anel(m.peixeP.x, m.peixeP.z, 0.5 + B.forca * 0.6); } if (!m.segura) { m.tZum = (m.tZum || 0) - dt; if (m.tZum <= 0) { m.tZum = 0.45; SOM.zum(); } } }
      else if (m.segura) { m.tCli = (m.tCli || 0) - dt; if (m.tCli <= 0) { m.tCli = 0.085; SOM.clique(); } }
      if (B.corre && !m.corriaAntes) {
        if ((pe.f.t === 'p' || pe.f.t === 'l') && pe.r >= 2 && Math.random() < 0.4 && !m.pulo) m.pulo = { t: 0, m: null };
        try { if (navigator.vibrate) navigator.vibrate(50); } catch (e) { /* sem vibrar */ }
      }
      m.corriaAntes = B.corre;
      if (pe.id === 'poraque') {                                          // o poraquê dá choque de vez em quando: a tensão pula
        m.proxChoque -= dt;
        if (m.proxChoque <= 0) { m.proxChoque = rnd(5, 9); B.tensao = Math.min(0.97, B.tensao + 0.22); SOM.choque(); msgMg(tr('Levou um choque!'), 1.4); m.choque = 0.45; m.U.choque.style.opacity = '0.55'; try { if (navigator.vibrate) navigator.vibrate([60, 40, 60]); } catch (e) { /* ok */ } }
      }
      if (m.choque > 0) { m.choque -= dt; if (m.choque <= 0) m.U.choque.style.opacity = '0'; }
      if (r === 'pegou') cenaPegou();
      else if (r === 'arrebentou') { SOM.arrebenta(); escapou(tr('A linha arrebentou!'), true); }
      else if (r === 'soltou') escapou(tr('O peixe se soltou do anzol...'));
      else if (r === 'linha') { SOM.arrebenta(); escapou(tr('Acabou a linha! O peixe levou tudo.'), true); }
    }
    function escapou(txt, arrebentou) {
      const m = P.mg, onde = m.peixeP || m.boiaP; msgMg(txt, 2.4); if (!arrebentou) SOM.erro();
      m.e = 'falhou'; m.t = 0; m.de = { x: onde.x, y: Y_AGUA + 0.02, z: onde.z }; m.arrebentou = !!arrebentou; m.B = null; tirarPulo(m);
      if (m.comCadu && P.cadu && !P.cadu.oculto && Math.random() < 0.6) setTimeout(() => { if (P.mg && P.mg.comCadu) msgMg(tr('Cadu') + ': ' + (arrebentou ? tr('Arrebentou? Solta a linha quando ele correr!') : tr('Ih, escapou! Faz parte.')), 2.6); }, 1500);
    }
    function recolher() { const m = P.mg; m.de = m.boiaP ? { x: m.boiaP.x, y: m.boiaP.y || Y_AGUA, z: m.boiaP.z } : mundo(m.vara.ponta); m.e = 'recolhe'; m.t = 0; m.bite = null; }
    function tirarPulo(m) { if (m.pulo && m.pulo.m && m.pulo.m.parent) m.pulo.m.parent.remove(m.pulo.m); m.pulo = null; }

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
      const grande = peixe.userData.L > 1.1;
      peixe.position.set(grande ? 0.56 : 0.46, grande ? 0.98 : 1.12, 0); peixe.rotation.set(0, Math.PI / 2, 0); J.m.corpo.add(peixe); m.trofeu = { m: peixe, grande };
      m.vara.raiz.visible = false;
      const c = p.cat[b.i] || (p.cat[b.i] = { n: 0, rec: 0, cl: [0, 0, 0] }), novo = !c.n, recorde = !novo && b.kg > c.rec;
      c.n++; c.cl[b.classe] = (c.cl[b.classe] | 0) + 1; if (b.kg > c.rec) c.rec = b.kg;
      p.total = (p.total | 0) + 1; if (pe.r === 4) p.lendarios = (p.lendarios | 0) + 1; P.versao++; gravar();
      (pe.r >= 4 ? SOM.lendario : pe.r >= 2 ? SOM.raro : SOM.pegou)();
      mostrarBanner(b, novo, recorde);
      await api.esperar(1000);
      try {
        await api.fala('jog', trf(REACAO[pe.r][b.classe], nomePeixe(b.i)));
        if (novo && pe.r >= 2) await api.fala('jog', tr('Primeira vez que eu pego esse peixe! Vou mostrar pro seu Bené.'));
        if (m.comCadu && P.cadu && !P.cadu.oculto) { s.falantesExtra = s.falantesExtra || {}; s.falantesExtra.cadu = { A: P.cadu, nome: tr('Cadu'), voz: 2 }; await api.fala('cadu', tr(REACAO_CADU[pe.r][b.classe])); }
        Dialogo.esconder();
        await guardarNaCaixa(b, peixe, m);
      } catch (e) { console.error(e); }
      esconderBanner(); if (peixe.parent) peixe.parent.remove(peixe); m.trofeu = null; m.guarda = null; m.vara.raiz.visible = true;
      if (P.isopor) P.isopor.tampa.rotation.x = 0;
      gravar(); m.ocupado = false; if (P.mg === m) irPara('mira');
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

    // ---- a cada quadro do minigame
    function tickMg(dt) {
      const s = S(), m = P.mg, J = s.jog;
      if (!m.pausa) api.tickHorario(dt);
      m.t += dt; if (m.tRec > 0) { m.tRec -= dt; if (m.tRec <= 0) m.U.recado.textContent = ''; }
      if ((m.e === 'mira' || m.e === 'forca') && !m.pausa) m.ang = clampN(m.ang + m.mira * dt * 0.9, -m.lim, m.lim);
      const fixo = m.e === 'briga' || m.e === 'fisgou' || m.e === 'pegou';
      J.x = m.ox; J.z = m.oz; J.yaw = J.yawAlvo = m.trofeu ? (m.yaw0 - 0.45) : m.yaw0 + (fixo ? m.ang0 : m.ang); J.andando = false; J.correndo = false; J.sentado = false;
      if (!m.ocupado && !m.saindo && hora() >= 1.85 && hora() < 5 && (m.e === 'mira' || m.e === 'espera')) { msgMg(tr('Já tá tarde... melhor ir pra casa.'), 3); m.ocupado = false; m.saindo = true; if (m.fim) m.fim(); }
      poseJogMg(m, J);
      J.m.raiz.updateMatrixWorld(true);
      const tip = mundo(m.vara.ponta);
      switch (m.e) {
        case 'forca': m.forca = Math.min(1, m.t / 1.15); if (m.forca >= 1) soltarLance(); break;
        case 'embolou': if (m.t >= 2.4) irPara('mira'); break;
        case 'swing': if (m.t >= 0.17) { m.voo = { de: tip, t: 0, dur: 0.45 + m.dist / 32 }; m.e = 'voo'; m.t = 0; } break;
        case 'voo': { const v = m.voo; v.t += dt; const u = clampN(v.t / v.dur, 0, 1); m.boiaP = { x: lerpN(v.de.x, m.alvo.x, u), y: lerpN(v.de.y, Y_AGUA, u) + Math.sin(u * Math.PI) * (1.2 + m.dist * 0.12), z: lerpN(v.de.z, m.alvo.z, u) }; if (u >= 1) pousou(); break; }
        case 'espera': tickEspera(); break;
        case 'mordida': if (m.t > m.bite.d.janela) escapou(tr('O peixe comeu a isca e fugiu...')); break;
        case 'fisgou': if (m.t >= 0.3) { m.e = 'briga'; m.t = 0; } break;
        case 'briga': tickBriga(dt); break;
        case 'assustou': if (m.t >= 1.6) novaEspera(true); break;
        case 'falhou': if (m.t >= 1.8) recolher(); break;
        case 'recolhe': { const u = clampN(m.t / 0.7, 0, 1); m.boiaP = { x: lerpN(m.de.x, tip.x, u), y: lerpN(m.de.y, tip.y - 0.4, u) + Math.sin(u * Math.PI) * 0.3, z: lerpN(m.de.z, tip.z, u) }; if (Math.random() < dt * 12) SOM.clique(); if (u >= 1) irPara('mira'); break; }
        default: break;
      }
      if (P.mg !== m) return;
      visualMg(m, tip, dt); camMg(m, J, dt); hudMg(m);
    }
    // pose do jogador com a vara (por cima da pose normal, que já rodou neste quadro)
    function poseJogMg(m, J) {
      const M = J.m, t = S().t; let dz = 0.55, dx = 0.12, cz = 1.05, ez = 0.72, ex = -0.42, ecz = 0.95, lean = 0, joelho = 0;
      if (m.trofeu) {                                                  // segurando o peixe com as duas mãos
        const g = m.trofeu.grande; M.bracoE.rotation.z = M.bracoD.rotation.z = g ? 0.85 : 1.12; M.bracoE.rotation.x = -0.3; M.bracoD.rotation.x = 0.3;
        usarCotovelo(M.bracoE, 0, g ? 1.25 : 0.72); usarCotovelo(M.bracoD, 0, g ? 1.25 : 0.72); M.corpo.rotation.z = g ? 0.1 : 0; return;
      }
      switch (m.e) {
        case 'mira': case 'embolou': dz += Math.sin(t * 1.3) * 0.02; if (m.e === 'embolou') { ez = 1.0; ecz = 1.4 + Math.sin(t * 9) * 0.3; } break;
        case 'forca': { const k = m.forca; dz = 0.55 + 1.9 * k; cz = 1.05 - 0.35 * k; ez = 0.72 + 1.1 * k; lean = 0.12 * k; break; }
        case 'swing': { const u = clampN(m.t / 0.24, 0, 1), k = m.forcaUsada || 0.5; dz = lerpN(0.55 + 1.9 * k, 0.3, suave(u)); cz = lerpN(1.05 - 0.35 * k, 0.85, u); ez = lerpN(0.72 + 1.1 * k, 0.6, suave(u)); lean = lerpN(0.12 * k, -0.08, u); break; }
        case 'voo': dz = 0.35; cz = 0.9; ez = 0.62; lean = -0.06; break;
        case 'espera': case 'mordida': case 'assustou': dz = 0.5 + Math.sin(t * 1.1) * 0.02; break;
        case 'fisgou': dz = 1.45; cz = 0.85; lean = 0.12; break;
        case 'briga': { const B = m.B, te = B ? B.tensao : 0.3; dz = 0.95 + te * 0.25 + (B && B.corre ? Math.sin(t * 30) * 0.03 : 0); dx = 0.15; cz = 0.85; ez = 0.95; ex = -0.5; ecz = 1.05 + (m.segura ? Math.sin(t * 16) * 0.28 : 0); lean = 0.15 + te * 0.12; joelho = 0.22 + te * 0.15; break; }
        case 'recolhe': dz = 0.75; ecz = 1.05 + Math.sin(t * 16) * 0.28; break;
        case 'falhou': if (m.t < 1.3) { dz = 0.9; cz = 1.2; ez = 2.75; ecz = 1.9; ex = 0; } break;
        default: break;
      }
      M.bracoD.rotation.z = dz; M.bracoD.rotation.x = dx; usarCotovelo(M.bracoD, 0, cz);
      M.bracoE.rotation.z = ez; M.bracoE.rotation.x = ex; usarCotovelo(M.bracoE, 0, ecz);
      M.corpo.rotation.z = lean; if (joelho) usarJoelhos(M, -joelho, -joelho);
    }
    function visualMg(m, tip, dt) {
      const L = m.linha, t = S().t; let bp = null, mostra = false;
      if (m.e === 'voo' || m.e === 'recolhe') { bp = m.boiaP; mostra = !!bp && !(m.e === 'recolhe' && m.arrebentou); }
      else if (m.e === 'espera' || m.e === 'assustou') { bp = { x: m.boiaP.x, y: Y_AGUA + 0.015 + Math.sin(t * 2) * 0.01 - (m.beliscando ? 0.05 : 0), z: m.boiaP.z }; mostra = true; }
      else if (m.e === 'mordida') { bp = { x: m.boiaP.x, y: Y_AGUA - 0.14 + Math.sin(t * 25) * 0.02, z: m.boiaP.z }; mostra = true; }
      else if (m.e === 'falhou' && m.de && !m.arrebentou) { bp = m.de; mostra = true; }
      m.boiaM.visible = mostra; if (bp) m.boiaM.position.set(bp.x, bp.y, bp.z);
      let verga = 0.04;
      if ((m.e === 'briga' || m.e === 'fisgou') && m.peixeP) { const te = m.B ? m.B.tensao : 0.6; linhaDe(L, tip, { x: m.peixeP.x, y: Y_AGUA - 0.04, z: m.peixeP.z }, 0.3 * (1 - te)); verga = 0.15 + te * 0.95; }
      else if (m.e === 'pegou' && m.voa) linhaDe(L, tip, { x: m.voa.m.position.x, y: m.voa.m.position.y, z: m.voa.m.position.z }, 0.03);
      else if (mostra) { linhaDe(L, tip, { x: bp.x, y: bp.y + 0.06, z: bp.z }, m.e === 'voo' ? 0.04 : 0.32); if (m.e === 'mordida') verga = 0.2; }
      else L.visible = false;
      vergar(m.vara, SINAL_VERGA * verga);
      // o peixe saindo da água até a mão
      if (m.voa) { const v = m.voa; v.t += dt; const u = clampN(v.t / 0.7, 0, 1), J = S().jog, alvo = { x: J.x + Math.cos(J.yaw) * 0.5, y: m.y + 1.15, z: J.z - Math.sin(J.yaw) * 0.5 };
        v.m.position.set(lerpN(v.de.x, alvo.x, suave(u)), lerpN(v.de.y, alvo.y, u) + Math.sin(u * Math.PI) * 1.4, lerpN(v.de.z, alvo.z, suave(u))); v.m.rotation.set(0, J.yaw, Math.sin(t * 20) * 0.5); }
      // guardando no isopor
      if (m.guarda) { const g = m.guarda; g.t += dt; const u = clampN(g.t / 0.5, 0, 1); g.m.position.set(lerpN(g.de.x, P.isopor.position.x, u), lerpN(g.de.y, m.y + 0.35, u) + Math.sin(u * Math.PI) * 0.4, lerpN(g.de.z, P.isopor.position.z, u)); g.m.scale.setScalar(g.k0 * (1 - u * 0.6)); }
      // o peixe pulando fora da água na corrida (os raros "de escama")
      if (m.pulo && m.peixeP && m.bite) {
        const pl = m.pulo; if (!pl.m) { pl.m = malhaPeixe(m.bite.i, m.bite.kg); grupo().add(pl.m); respingo(m.peixeP.x, m.peixeP.z, 6, 0.3); }
        pl.t += dt; const u = pl.t / 0.75, Lp = pl.m.userData.L;
        pl.m.position.set(m.peixeP.x, Y_AGUA + Math.sin(Math.min(1, u) * Math.PI) * (0.6 + Lp * 0.8), m.peixeP.z); pl.m.rotation.set(0, m.yaw0 + m.ang0 + Math.PI / 2, -0.9 + u * 1.8);
        if (u >= 1) { respingo(m.peixeP.x, m.peixeP.z, 7, 0.4); SOM.agua(); tirarPulo(m); }
      }
      // a mira: pontinhos na água até onde a boia vai cair (e o anel do alvo enquanto enche a força)
      const mira = m.e === 'mira' || m.e === 'forca', d = dirDe(m.yaw0 + m.ang), Dm = distLance(m.e === 'forca' ? m.forca : 0.55, dadosP().vara);
      m.pontos.forEach((pt, k) => { const dd = 3 + (Dm - 3) * (k + 1) / m.pontos.length, x = m.ox + d.x * dd, z = m.oz + d.z * dd; pt.visible = mira && naAgua(x, z); pt.position.set(x, Y_AGUA + 0.02, z); });
      if (m.alvoM) { m.alvoM.visible = m.e === 'forca'; const x = m.ox + d.x * Dm, z = m.oz + d.z * Dm; m.alvoM.position.set(x, Y_AGUA + 0.025, z); m.alvoM.scale.setScalar(0.5 + Dm * 0.03); m.alvoM.material.color.setHex(naAgua(x, z) ? 0xf0a020 : 0xd8402a); }
    }
    function camMg(m, J, dt) {
      const s = S(), yaw = m.yaw0 + (m.e === 'briga' || m.e === 'fisgou' || m.e === 'pegou' ? m.ang0 : m.ang), d = dirDe(yaw), dir = { x: -d.z, z: d.x }, yJ = J.y || m.y;
      let c;
      if (m.trofeu || (m.e === 'pegou' && !m.voa)) {                    // de frente (um pouco para o lado de fora do píer, para o Cadu não tampar); peixe grande = câmera mais longe
        const L = m.trofeu ? m.trofeu.m.userData.L || 0.5 : 0.5, k = 2.6 + Math.min(2.2, L * 0.7), dT = dirDe((m.yaw0 - 0.45));
        c = { px: J.x + dT.x * k, py: yJ + 1.75 + Math.min(0.8, L * 0.2), pz: J.z + dT.z * k, tx: J.x, ty: yJ + 0.8, tz: J.z };   // mira no peito: o jogador e o peixe ficam na metade de cima da tela (a fala fica embaixo e o banner, fininho, no topo)
      }
      else if ((m.e === 'briga' || m.e === 'fisgou' || m.e === 'pegou') && m.peixeP) { const f = m.peixeP; c = { px: J.x - d.x * 4.4 + dir.x * 1.6, py: yJ + 2.9, pz: J.z - d.z * 4.4 + dir.z * 1.6, tx: lerpN(J.x, f.x, 0.55), ty: 0.4, tz: lerpN(J.z, f.z, 0.55) }; }
      else {
        let tx = J.x + d.x * 10, tz = J.z + d.z * 10;
        if (m.boiaP && (m.e === 'espera' || m.e === 'mordida' || m.e === 'assustou' || m.e === 'voo')) { tx = lerpN(tx, m.boiaP.x, 0.5); tz = lerpN(tz, m.boiaP.z, 0.5); }
        c = { px: J.x - d.x * 4.9 + dir.x * 1.3, py: yJ + 3.0, pz: J.z - d.z * 4.9 + dir.z * 1.3, tx, ty: 0.2, tz };
      }
      if (!m.cam || s.cam.snap) m.cam = Object.assign({}, c);
      else { const k = 1 - Math.exp(-dt * 3.2); for (const q in c) m.cam[q] += (c[q] - m.cam[q]) * k; }
      s.camCena = m.cam;
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
      // barra
      const B = m.B;
      if (m.e === 'mira' || m.e === 'forca') { zonasBarra(U, 'forca'); U.barra.style.display = ''; U.enche.style.height = (m.e === 'forca' ? m.forca * 100 : 0) + '%'; U.marca.style.display = 'none'; }
      else if ((m.e === 'briga' || m.e === 'fisgou') && B) { zonasBarra(U, 'tensao'); U.barra.style.display = ''; U.enche.style.height = Math.min(100, B.tensao * 100) + '%'; U.enche.style.background = B.tensao > 0.88 ? '#ff6a50' : B.tensao < 0.15 ? '#8fc0ff' : '#fff0c8'; U.marca.style.display = 'none'; }
      else U.barra.style.display = 'none';
      if (B && (m.e === 'briga' || m.e === 'fisgou')) { U.briga.style.display = ''; set(U.dist, 'dist', trf('Distância {0} m', Math.max(0, B.dist).toFixed(1).replace('.', virgula() ? ',' : '.'))); U.fol.style.width = Math.max(0, B.folego / B.folego0 * 100) + '%'; }
      else U.briga.style.display = 'none';
      let dica = '';
      if (m.e === 'mira') dica = tr('Arraste a tela para mirar e segure LANÇAR. Solte na faixa verde!');
      else if (m.e === 'forca') dica = tr('Solte na faixa verde!');
      else if (m.e === 'espera') dica = tr('Espere a boia afundar. Se ela só tremer, não puxe!');
      else if (m.e === 'briga' && B) dica = B.corre ? tr('O peixe está correndo! Solte antes de arrebentar!') : B.frouxa > 0.7 ? tr('Linha frouxa! Segure PUXAR!') : tr('Segure PUXAR para recolher.');
      set(U.dica, 'dica', dica);
    }

    // ================================================================ a cada quadro (depois do tickJogador e do tickPessoas)
    function tick(dt) {
      const s = S(); if (!s) return;
      if (P.tAviso > 0) { P.tAviso -= dt; if (P.tAviso <= 0 && s.modo === 'livre') api.aviso(''); }
      if (!P.montado) { if (!s.dentro && s.jog) montarRua(); if (!P.montado) return; }
      if (P.versao !== P.verQuadro) desenharQuadro();
      tickFx(dt);
      tickCaduLago(dt); tickBene();
      if (!s.dentro) { if (P.cadu && !P.cadu.oculto) { P.cadu.m.raiz.updateMatrixWorld(true); poseCaduLago(); } }
      if (P.mg) tickMg(dt);
    }
    function limpar() {
      try { fecharPainel(); esconderBanner(); const h = document.getElementById('pcHud'); if (h) h.remove(); } catch (e) { /* ok */ }
      window.removeEventListener('keydown', teclaMg, true); window.removeEventListener('keyup', teclaMg, true);
      if (P.mg && P.mg.fim) P.mg.fim(); P.mg = null;
      for (const g of geoPeixes.values()) g.dispose(); geoPeixes.clear();
      if (P.texQuadro) P.texQuadro.dispose();
    }

    return { alvos, tick, limpar, montarRua, aberta, _P: P, _f: { dadosP, pescar, abrirLoja, abrirCatalogo, abrirCaixa, falarComCaduLago, falarComBene, caduNoLago, naAgua, profundidade, iconePeixe, malhaPeixe, apertar, sairDaPesca, PONTA, LUGAR_CADU, DESTINO_CADU }, _dados: DADOS, _logica: LOGICA };
  }

  window.FutebolJS.registrarFase({ id: 'pesca', nome: 'Pesca', nucleoMinimo: '6.4.0', iniciar: async () => {}, criar, _dados: DADOS, _logica: LOGICA });
})();
