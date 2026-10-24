/* =====================================================================
   FUTEBOL JS · mercado.js · O TRABALHO NO MERCADINHO BOM PREÇO (arquivo SEPARADO, como interiores.js)
   ---------------------------------------------------------------------
   5.4.0 — o mercado de verdade
   - HORÁRIO: o mercado abre das 8h às 22h. O turno do jogador (quem escolheu o mercado na Fase 2) é das 14h às 22h, de segunda a
     sexta, a partir do 2º dia (TURNO_*).
   - A ROSA (outra caixa) fica no caixa das 7h50 até o jogador começar. Ao começar, o Cadu libera a Rosa ("Rosa, você tá liberada do
     expediente já." / "Beleza!"), ela sai e a tela corta para o expediente.
   - O CADU: das 7h45 às 14h limpa e organiza a loja (varrendo, arrumando as gôndolas, o estoque). Às 14h vai para o 2º caixa (o do
     fundo) "fechar o caixa" até as 15h. Se o jogador trabalha hoje, às 15h ele vai para casa e volta às 21h50 para liberar o jogador
     às 22h (se ainda tiver cliente, ele diz que atende e fecha o caixa). Se o jogador NÃO trabalha hoje (outro emprego, fim de semana,
     1º dia), às 15h ele libera a Rosa e fica no caixa até as 22h.
   - Os dois têm CASA na cidade (cidade.js: a do Cadu é pertinho do mercado, a da Rosa do outro lado da avenida) e andam pela rua no
     horário (api.criarRuaAgendada, igual à Lúcia). Lá dentro, a posição deles sai do relógio (estadoCadu/estadoRosa).
   - 50 PRODUTOS em pixel art 16 x 16 (PRODUTOS + FORMAS), com marcas "de brincadeira" bem do Norte. Preços QUEBRADOS, em centavos:
     no CARTÃO paga o valor exato (digita na maquininha com os centavos); em DINHEIRO o total é arredondado para múltiplo de 5 centavos
     (não existe moeda de 1 centavo) e o troco usa notas (2, 5, 10, 20, 50) e MOEDAS (5, 10, 25 e 50 centavos e 1). Às vezes o cliente
     dá os centavos em moeda para facilitar o troco.
   - CARTÃO: animação do cartão chegando perto da maquininha (ondinhas de aproximação). 5 cartões diferentes (CARTOES).
   - Clientes: andam por uma GRADE de navegação da loja (caminho/andarM: não atravessam gôndola nem "teleportam"; quem fica preso
     atrás de alguém espera, contorna e, se precisar, passa por ele). Não entra cliente novo depois das 21h (H_ULTIMO_CLIENTE).
   - FALTA DE PRODUTO: cliente que quer algo de uma seção vazia = −3 fakes no fim do turno (FALTA). Troco errado continua −5.
   - O painel do turno aparece uma vez e vira o ícone "!" no canto superior esquerdo (api.painelRecolhivel, da cidade.js).
   5.3.1 — encaixe na 5.3.0 (cidade.js): sábado e domingo não tem turno; sem banho depois do futebol o Cadu não deixa começar;
           o fim do turno marca trabalhouAlgumDia (é o que libera a 1ª ligação do João para o futebol).
   5.3.0 — primeira versão (feita por um amigo do Herick): caixa, troco, reposição, o Cadu da Fase 1.
   - Registrado com FutebolJS.registrarFase({ id: 'mercado' }) só para o jogo saber baixar o arquivo; NÃO roda como fase.
     A cidade (cidade.js) baixa em segundo plano junto do interiores.js e chama criar(api): a api é um pacote de funções
     da cidade (fala, aviso, criarPessoa, seguir...). Suba junto do cidade.js / interiores.js (mesma pasta futebol-js/).
   - Se o jogador tirou o Cadu do armário na Fase 1 (historia.fase1.cadu.salvou), ele lembra e dá +15 fakes no salário (AUMENTO).
   - Salário: PAGA (95) pelo turno inteiro (+15 do Cadu), menos os descontos. Começar depois das 14h30, acelerar ou sair antes paga
     proporcional às horas trabalhadas.
   - Salva em historia.cidade: mercado = { apresentou, aumento, estoque: {...}, rosaLib: { dia, h } } e trabalhouHoje.
   ===================================================================== */
(function () {
  'use strict';

  // ------------------------------------------------------------------ textos (pt → en, es, it, fr)
  const TRAD = {
    'Mercado fechado. Abre às 14h.': ['Market closed. Opens at 2 PM.', 'Mercado cerrado. Abre a las 14h.', 'Mercato chiuso. Apre alle 14.', 'Supérette fermée. Ouvre à 14 h.'],
    'Falar com o Cadu': ['Talk to Cadu', 'Hablar con Cadu', 'Parla con Cadu', 'Parler à Cadu'],
    'Cadu': ['Cadu', 'Cadu', 'Cadu', 'Cadu'],
    'Higiênico': ['Toiletries', 'Higiene', 'Igiene', 'Hygiène'], 'Comida': ['Food', 'Comida', 'Cibo', 'Nourriture'], 'Bebida': ['Drinks', 'Bebida', 'Bevande', 'Boissons'], 'Fruta': ['Fruit', 'Fruta', 'Frutta', 'Fruits'],
    'na gôndola de higiênicos': ['on the toiletries shelf', 'en la góndola de higiene', "sullo scaffale dell'igiene", "dans le rayon hygiène"],
    'na gôndola de comida': ['on the food shelf', 'en la góndola de comida', 'sullo scaffale del cibo', 'dans le rayon alimentation'],
    'no freezer de bebidas': ['in the drinks freezer', 'en el congelador de bebidas', 'nel frigo delle bevande', 'dans le congélateur à boissons'],
    'na ilha de frutas': ['on the fruit island', 'en la isla de frutas', "sull'isola della frutta", "sur l'îlot des fruits"],
    'Pegar caixa: {0}': ['Take box: {0}', 'Tomar caja: {0}', 'Prendi scatola: {0}', 'Prendre le carton : {0}'],
    'Devolver caixa': ['Put the box back', 'Devolver caja', 'Rimetti la scatola', 'Reposer le carton'],
    'Repor: {0}': ['Restock: {0}', 'Reponer: {0}', 'Rifornisci: {0}', 'Réapprovisionner : {0}'],
    'Atender cliente': ['Serve customer', 'Atender cliente', 'Servi il cliente', 'Servir le client'],
    'Largue a caixa antes de atender.': ['Put the box down before serving.', 'Deja la caja antes de atender.', 'Posa la scatola prima di servire.', 'Pose le carton avant de servir.'],
    'Caixa': ['Checkout', 'Caja', 'Cassa', 'Caisse'],
    'Você já está com uma caixa. Leve até a seção ou devolva no estoque.': ['You are already holding a box. Take it to the section or put it back in the stockroom.', 'Ya tienes una caja. Llévala a la sección o devuélvela al almacén.', 'Hai già una scatola. Portala al reparto o rimettila in magazzino.', 'Tu portes déjà un carton. Apporte-le au rayon ou repose-le dans la réserve.'],
    'Essa seção ainda está cheia.': ['That section is still full.', 'Esa sección todavía está llena.', 'Quel reparto è ancora pieno.', 'Ce rayon est encore plein.'],
    'Repor {0} {1}!': ['Restock {0} {1}!', '¡Reponer {0} {1}!', 'Rifornisci {0} {1}!', 'Réapprovisionner {0} {1} !'],
    'Seção reabastecida!': ['Section restocked!', '¡Sección repuesta!', 'Reparto rifornito!', 'Rayon réapprovisionné !'],
    'Atendidos: {0}': ['Served: {0}', 'Atendidos: {0}', 'Serviti: {0}', 'Servis : {0}'],
    'Erros: {0}': ['Mistakes: {0}', 'Errores: {0}', 'Errori: {0}', 'Erreurs : {0}'],
    'Repor:': ['Restock:', 'Reponer:', 'Rifornire:', 'Réappro :'],
    'Acelerar final do turno': ['Skip to end of shift', 'Acelerar el final del turno', 'Accelera fine turno', 'Accélérer la fin du service'],
    'Esteira': ['Conveyor', 'Cinta', 'Nastro', 'Tapis'],
    'Toque em cada produto para passar no leitor.': ['Tap each product to scan it.', 'Toca cada producto para pasarlo por el lector.', 'Tocca ogni prodotto per passarlo al lettore.', 'Touche chaque produit pour le scanner.'],
    'TOTAL': ['TOTAL', 'TOTAL', 'TOTALE', 'TOTAL'],
    'Pagamento': ['Payment', 'Pago', 'Pagamento', 'Paiement'],
    'Esperando passar as compras...': ['Waiting for the items to be scanned...', 'Esperando que pases las compras...', 'In attesa di passare la spesa...', 'En attente du passage des articles...'],
    'Dinheiro': ['Cash', 'Efectivo', 'Contanti', 'Espèces'], 'Cartão': ['Card', 'Tarjeta', 'Carta', 'Carte'],
    'O cliente pagou com:': ['The customer paid with:', 'El cliente pagó con:', 'Il cliente ha pagato con:', 'Le client a payé avec :'],
    'Recebido: {0}': ['Received: {0}', 'Recibido: {0}', 'Ricevuto: {0}', 'Reçu : {0}'],
    'TROCO: {0}': ['CHANGE: {0}', 'CAMBIO: {0}', 'RESTO: {0}', 'MONNAIE : {0}'],
    'Gaveta (toque nas notas)': ['Drawer (tap the bills)', 'Cajón (toca los billetes)', 'Cassetto (tocca le banconote)', 'Tiroir (touche les billets)'],
    'Na sua mão: {0}': ['In your hand: {0}', 'En tu mano: {0}', 'In mano: {0}', 'Dans ta main : {0}'],
    'Toque numa nota da mão para devolver à gaveta.': ['Tap a bill in your hand to put it back.', 'Toca un billete de tu mano para devolverlo al cajón.', 'Tocca una banconota in mano per rimetterla nel cassetto.', 'Touche un billet dans ta main pour le remettre.'],
    'Entregar troco': ['Give change', 'Dar cambio', 'Dai il resto', 'Rendre la monnaie'],
    'Sem troco: concluir': ['No change: finish', 'Sin cambio: terminar', 'Niente resto: concludi', 'Pas de monnaie : terminer'],
    'Troco certo! Obrigado!': ['Correct change! Thank you!', '¡Cambio correcto! ¡Gracias!', 'Resto giusto! Grazie!', 'Bonne monnaie ! Merci !'],
    'Opa, tá faltando troco! (−{0} fakes)': ["Hey, you're short on change! (−{0} fakes)", '¡Oye, falta cambio! (−{0} fakes)', 'Ehi, manca del resto! (−{0} fakes)', 'Hé, il manque de la monnaie ! (−{0} fakes)'],
    'Você me deu troco a mais! (−{0} fakes)': ['You gave me too much change! (−{0} fakes)', '¡Me diste cambio de más! (−{0} fakes)', 'Mi hai dato troppo resto! (−{0} fakes)', "Tu m'as rendu trop ! (−{0} fakes)"],
    'Maquininha': ['Card machine', 'Datáfono', 'POS', 'Terminal de paiement'],
    'Digite o valor e aperte OK.': ['Type the amount and press OK.', 'Escribe el valor y pulsa OK.', "Digita l'importo e premi OK.", 'Tape le montant et appuie sur OK.'],
    'VALOR INCORRETO': ['WRONG AMOUNT', 'VALOR INCORRECTO', 'IMPORTO ERRATO', 'MONTANT INCORRECT'],
    'APROXIME O CARTÃO': ['TAP THE CARD', 'ACERQUE LA TARJETA', 'AVVICINA LA CARTA', 'APPROCHEZ LA CARTE'],
    'APROVADO': ['APPROVED', 'APROBADO', 'APPROVATO', 'ACCEPTÉ'],
    'Obrigado, até mais!': ['Thanks, see you!', '¡Gracias, hasta luego!', 'Grazie, a presto!', 'Merci, à bientôt !'],
    'Fechar': ['Close', 'Cerrar', 'Chiudi', 'Fermer'],
    'Oi! Bem-vindo ao Mercadinho Bom Preço! Qualquer coisa, é só chamar.': ['Hi! Welcome to Bom Preço Minimarket! Just call me if you need anything.', '¡Hola! ¡Bienvenido al Minimercado Bom Preço! Cualquier cosa, me llamas.', 'Ciao! Benvenuto al Minimarket Bom Preço! Per qualsiasi cosa, chiamami.', 'Salut ! Bienvenue à la supérette Bom Preço ! Au besoin, appelle-moi.'],
    'Ei... você não é aquele que me tirou do armário lá na escola? Valeu de novo, viu!': ["Hey... aren't you the one who got me out of that locker at school? Thanks again!", 'Oye... ¿no eres tú el que me sacó del casillero en la escuela? ¡Gracias otra vez!', "Ehi... non sei tu quello che mi ha tirato fuori dall'armadietto a scuola? Grazie ancora!", "Hé... c'est pas toi qui m'as sorti du casier à l'école ? Merci encore !"],
    'Espera aí... {0}?! É você mesmo?!': ['Wait... {0}?! Is that really you?!', 'Espera... ¿{0}?! ¿¡Eres tú de verdad?!', 'Aspetta... {0}?! Sei proprio tu?!', 'Attends... {0} ?! C’est vraiment toi ?!'],
    'Você me tirou daquele armário na escola, lembra? Eu nunca esqueci isso.': ['You got me out of that locker at school, remember? I never forgot that.', 'Me sacaste de aquel casillero en la escuela, ¿te acuerdas? Nunca lo olvidé.', "Mi hai tirato fuori da quell'armadietto a scuola, ricordi? Non l'ho mai dimenticato.", "Tu m'as sorti de ce casier à l'école, tu te souviens ? Je ne l'ai jamais oublié."],
    'E ainda veio conversar comigo depois. Pouca gente fazia isso.': ['And you even came to talk to me afterwards. Not many people did that.', 'Y encima viniste a hablar conmigo después. Poca gente hacía eso.', 'E poi sei anche venuto a parlarmi. Poche persone lo facevano.', 'Et tu es même venu me parler après. Peu de gens faisaient ça.'],
    'Cadu?! Quanto tempo!': ['Cadu?! Long time no see!', '¡¿Cadu?! ¡Cuánto tiempo!', 'Cadu?! Quanto tempo!', 'Cadu ?! Ça fait longtemps !'],
    'Esse mercado é do meu pai. Eu tô ajudando ele em algumas coisas por aqui.': ["This market is my dad's. I'm helping him out with a few things around here.", 'Este mercado es de mi papá. Lo estoy ayudando con algunas cosas por aquí.', 'Questo mercato è di mio padre. Lo sto aiutando con alcune cose qui.', "Cette supérette est à mon père. Je l'aide pour quelques trucs ici."],
    'E por aquele dia na escola... vou aumentar o seu salário em 15 fakes. É o mínimo!': ["And for that day at school... I'm raising your pay by 15 fakes. It's the least I can do!", 'Y por aquel día en la escuela... te subo el sueldo 15 fakes. ¡Es lo mínimo!', 'E per quel giorno a scuola... ti aumento lo stipendio di 15 fakes. È il minimo!', 'Et pour ce jour-là à l’école... j’augmente ton salaire de 15 fakes. C’est la moindre des choses !'],
    'Você me parece familiar... mas não sei bem de onde.': ["You look familiar... but I can't quite place you.", 'Me resultas familiar... pero no sé bien de dónde.', 'Mi sembri familiare... ma non so bene da dove.', 'Tu me dis quelque chose... mais je ne sais pas trop d’où.'],
    'O expediente é das 14h às 22h. Você fica no caixa: passa as compras, recebe e dá o troco certinho, ou passa na maquininha.': ["The shift is from 2 PM to 10 PM. You're on the checkout: scan the items, take the money and give the right change, or use the card machine.", 'El turno es de 14h a 22h. Estás en la caja: pasas las compras, cobras y das el cambio justo, o pasas la tarjeta.', 'Il turno è dalle 14 alle 22. Stai alla cassa: passi la spesa, incassi e dai il resto giusto, o usi il POS.', 'Le service est de 14 h à 22 h. Tu es en caisse : tu scannes, tu encaisses et tu rends la monnaie juste, ou tu passes la carte.'],
    'Quando faltar mercadoria numa seção, pega a caixa certa no estoque, ali no fundo, e repõe na seção.': ['When a section runs low, grab the right box in the stockroom at the back and restock it.', 'Cuando falte mercancía en una sección, toma la caja correcta en el almacén, allá al fondo, y repón la sección.', 'Quando un reparto si svuota, prendi la scatola giusta in magazzino, in fondo, e rifornisci.', 'Quand un rayon se vide, prends le bon carton dans la réserve, au fond, et remets en rayon.'],
    'O salário é {0} fakes pelo turno. Cada troco errado desconta {1} fakes.': ['The pay is {0} fakes per shift. Each wrong change costs {1} fakes.', 'El sueldo es {0} fakes por turno. Cada cambio equivocado descuenta {1} fakes.', 'La paga è {0} fakes per turno. Ogni resto sbagliato costa {1} fakes.', 'Le salaire est de {0} fakes par service. Chaque erreur de monnaie coûte {1} fakes.'],
    'Você começa amanhã! O expediente é das 14h às 22h.': ['You start tomorrow! The shift is from 2 PM to 10 PM.', '¡Empiezas mañana! El turno es de 14h a 22h.', 'Inizi domani! Il turno è dalle 14 alle 22.', 'Tu commences demain ! Le service est de 14 h à 22 h.'],
    'Seu turno de hoje já acabou. Até amanhã!': ['Your shift is over for today. See you tomorrow!', 'Tu turno de hoy ya terminó. ¡Hasta mañana!', 'Il tuo turno di oggi è finito. A domani!', 'Ton service est fini pour aujourd’hui. À demain !'],
    'Quer começar o seu turno no caixa agora?': ['Do you want to start your checkout shift now?', '¿Quieres empezar tu turno en la caja ahora?', 'Vuoi iniziare il tuo turno alla cassa adesso?', 'Tu veux commencer ton service en caisse maintenant ?'],
    'Sim, vamos trabalhar': ["Yes, let's work", 'Sí, a trabajar', 'Sì, al lavoro', 'Oui, au travail'], 'Ainda não': ['Not yet', 'Todavía no', 'Non ancora', 'Pas encore'],
    'Boa! O caixa é seu. Os clientes já vão chegando.': ['Great! The checkout is yours. Customers will start coming in.', '¡Bien! La caja es tuya. Los clientes ya van llegando.', 'Bene! La cassa è tua. I clienti stanno arrivando.', 'Super ! La caisse est à toi. Les clients arrivent.'],
    'Bom trabalho! O caixa é seu.': ['Good job! The checkout is yours.', '¡Buen trabajo! La caja es tuya.', 'Buon lavoro! La cassa è tua.', 'Bon travail ! La caisse est à toi.'],
    'Fique no caixa: atenda quem estiver na fila e reponha as seções quando o jogo pedir.': ['Stay at the checkout: serve whoever is in line and restock the sections when asked.', 'Quédate en la caja: atiende a quien esté en la fila y repón las secciones cuando el juego lo pida.', 'Resta alla cassa: servi chi è in fila e rifornisci i reparti quando richiesto.', 'Reste en caisse : sers les clients de la file et réapprovisionne les rayons quand on te le demande.'],
    'Sair agora encerra o seu turno: você recebe só pelas horas trabalhadas.': ['Leaving now ends your shift: you only get paid for the hours worked.', 'Salir ahora termina tu turno: solo cobras las horas trabajadas.', 'Uscire ora chiude il tuo turno: vieni pagato solo per le ore lavorate.', 'Partir maintenant termine ton service : tu ne touches que les heures travaillées.'],
    'Sair mesmo assim': ['Leave anyway', 'Salir de todos modos', 'Esci comunque', 'Partir quand même'], 'Continuar trabalhando': ['Keep working', 'Seguir trabajando', 'Continua a lavorare', 'Continuer à travailler'],
    'Acelerar até as 22h? Você recebe só pelas horas trabalhadas até agora.': ['Skip to 10 PM? You only get paid for the hours worked so far.', '¿Acelerar hasta las 22h? Solo cobras las horas trabajadas hasta ahora.', 'Accelerare fino alle 22? Vieni pagato solo per le ore lavorate finora.', 'Accélérer jusqu’à 22 h ? Tu ne touches que les heures travaillées jusqu’ici.'],
    'Acelerar': ['Skip', 'Acelerar', 'Accelera', 'Accélérer'],
    'Fechou o caixa por hoje! Você atendeu {0} clientes. Toma: {1} fakes.': ['Checkout closed for today! You served {0} customers. Here: {1} fakes.', '¡Caja cerrada por hoy! Atendiste a {0} clientes. Toma: {1} fakes.', 'Cassa chiusa per oggi! Hai servito {0} clienti. Tieni: {1} fakes.', 'Caisse fermée pour aujourd’hui ! Tu as servi {0} clients. Tiens : {1} fakes.'],
    'Teve {0} troco(s) errado(s): {1} fakes de desconto.': ['There were {0} wrong change(s): {1} fakes deducted.', 'Hubo {0} cambio(s) equivocado(s): {1} fakes de descuento.', 'Ci sono stati {0} resti sbagliati: {1} fakes di trattenuta.', 'Il y a eu {0} erreur(s) de monnaie : {1} fakes retenus.'],
    'Vamos fechar! Até amanhã!': ["We're closing! See you tomorrow!", '¡Vamos a cerrar! ¡Hasta mañana!', 'Stiamo chiudendo! A domani!', 'On ferme ! À demain !'],
    'Produtos': ['Items', 'Productos', 'Prodotti', 'Articles'],
    // (5.3.1)
    'Hoje é fim de semana, o mercado fica com o meu pai. Descansa e volta segunda!': ["It's the weekend, my dad takes care of the market. Rest and come back Monday!", 'Hoy es fin de semana, el mercado se queda con mi papá. ¡Descansa y vuelve el lunes!', 'Oggi è fine settimana, il mercato lo gestisce mio padre. Riposati e torna lunedì!', "C'est le week-end, c'est mon père qui tient la supérette. Repose-toi et reviens lundi !"],
    'Eita... você tá com cheiro de quem acabou de jogar bola! Vai em casa, toma um banho e depois volta, beleza?': ["Whoa... you smell like you just played football! Go home, take a shower and come back, okay?", 'Uy... ¡hueles a que acabas de jugar al fútbol! Ve a casa, dúchate y luego vuelve, ¿vale?', "Ehi... hai l'odore di chi ha appena giocato a calcio! Vai a casa, fatti una doccia e poi torna, ok?", "Oh là... tu sens le foot ! Rentre chez toi, prends une douche et reviens, d'accord ?"],
    // produtos
    'Sabonete': ['Soap', 'Jabón', 'Sapone', 'Savon'], 'Papel higiênico': ['Toilet paper', 'Papel higiénico', 'Carta igienica', 'Papier toilette'], 'Pasta de dente': ['Toothpaste', 'Pasta de dientes', 'Dentifricio', 'Dentifrice'], 'Xampu': ['Shampoo', 'Champú', 'Shampoo', 'Shampooing'], 'Desodorante': ['Deodorant', 'Desodorante', 'Deodorante', 'Déodorant'],
    'Arroz': ['Rice', 'Arroz', 'Riso', 'Riz'], 'Feijão': ['Beans', 'Frijoles', 'Fagioli', 'Haricots'], 'Macarrão': ['Pasta', 'Fideos', 'Pasta', 'Pâtes'], 'Biscoito': ['Cookies', 'Galletas', 'Biscotti', 'Biscuits'], 'Café em pó': ['Ground coffee', 'Café molido', 'Caffè macinato', 'Café moulu'],
    'Refrigerante': ['Soda', 'Refresco', 'Bibita', 'Soda'], 'Suco': ['Juice', 'Jugo', 'Succo', 'Jus'], 'Água': ['Water', 'Agua', 'Acqua', 'Eau'], 'Leite': ['Milk', 'Leche', 'Latte', 'Lait'],
    'Banana': ['Banana', 'Plátano', 'Banana', 'Banane'], 'Maçã': ['Apple', 'Manzana', 'Mela', 'Pomme'], 'Laranja': ['Orange', 'Naranja', 'Arancia', 'Orange'], 'Mamão': ['Papaya', 'Papaya', 'Papaya', 'Papaye'],
    // (5.4.0)
    'Rosa': ['Rosa', 'Rosa', 'Rosa', 'Rosa'],
    'Rosa, você tá liberada do expediente já.': ["Rosa, you're free to go now.", 'Rosa, ya puedes irte, terminó tu turno.', 'Rosa, sei libera, il tuo turno è finito.', "Rosa, tu peux y aller, ton service est fini."],
    'Beleza! Bom trabalho aí, viu?': ['Great! Have a good shift, okay?', '¡Genial! Buen trabajo, ¿eh?', 'Perfetto! Buon lavoro, eh?', "Super ! Bon courage, hein ?"],
    'Seu turno começa às 14h. Chega um pouquinho antes que eu libero o caixa pra você!': ['Your shift starts at 2 PM. Come a little earlier and I will hand you the checkout!', 'Tu turno empieza a las 14h. ¡Llega un poco antes y te dejo la caja!', 'Il tuo turno inizia alle 14. Vieni un po’ prima e ti lascio la cassa!', 'Ton service commence à 14 h. Viens un peu avant et je te laisse la caisse !'],
    'Já tá quase na hora de fechar, hoje não dá mais. Amanhã às 14h, hein!': ["It's almost closing time, not today anymore. Tomorrow at 2 PM, okay!", 'Ya casi cerramos, hoy ya no da. ¡Mañana a las 14h, eh!', 'È quasi ora di chiudere, oggi non si fa più. Domani alle 14, eh!', "C'est presque l'heure de fermer, plus pour aujourd'hui. Demain à 14 h, hein !"],
    'Vou fechar o caixa aqui do fundo. Fico até as 15h!': ["I'm closing out the back register. I'll stay until 3 PM!", 'Voy a cerrar la caja del fondo. ¡Me quedo hasta las 15h!', 'Chiudo la cassa qui in fondo. Resto fino alle 15!', 'Je fais la caisse du fond. Je reste jusqu’à 15 h !'],
    'Tô indo nessa! Volto às 21h50 pra fechar com você.': ["I'm off! I'll be back at 9:50 PM to close with you.", '¡Me voy! Vuelvo a las 21h50 para cerrar contigo.', 'Vado! Torno alle 21:50 per chiudere con te.', 'J’y vais ! Je reviens à 21 h 50 pour fermer avec toi.'],
    'Rosa, pode ir! Eu assumo o caixa.': ['Rosa, you can go! I’ll take over the checkout.', '¡Rosa, puedes irte! Yo me quedo con la caja.', 'Rosa, puoi andare! Prendo io la cassa.', 'Rosa, tu peux y aller ! Je prends la caisse.'],
    'Valeu, Cadu! Até amanhã!': ['Thanks, Cadu! See you tomorrow!', '¡Gracias, Cadu! ¡Hasta mañana!', 'Grazie, Cadu! A domani!', 'Merci, Cadu ! À demain !'],
    'Cheguei! Às 22h eu fecho com você.': ["I'm here! At 10 PM I'll close with you.", '¡Llegué! A las 22h cierro contigo.', 'Sono arrivato! Alle 22 chiudo con te.', 'Me voilà ! À 22 h je ferme avec toi.'],
    'Deu 22h! Pode ir, que eu fecho aqui.': ["It's 10 PM! You can go, I'll close up.", '¡Son las 22h! Puedes irte, yo cierro.', 'Sono le 22! Puoi andare, chiudo io.', 'Il est 22 h ! Tu peux y aller, je ferme.'],
    'Pode deixar que eu atendo esses últimos e fecho o caixa. Não se preocupa, pode ir!': ["Leave it, I'll serve these last ones and close the register. Don't worry, you can go!", 'Deja, yo atiendo a estos últimos y cierro la caja. ¡No te preocupes, puedes irte!', 'Lascia, servo io questi ultimi e chiudo la cassa. Non preoccuparti, puoi andare!', 'Laisse, je sers les derniers et je ferme la caisse. Ne t’en fais pas, tu peux y aller !'],
    'Faltou produto na prateleira {0} vez(es): {1} fakes de desconto.': ['Shelves were out of stock {0} time(s): {1} fakes deducted.', 'Faltó producto en la estantería {0} vez(ces): {1} fakes de descuento.', 'Mancava merce sullo scaffale {0} volta/e: {1} fakes di trattenuta.', 'Rayon vide {0} fois : {1} fakes retenus.'],
    'Faltou {0} na prateleira! (−{1} fakes)': ['{0} was out of stock! (−{1} fakes)', '¡Faltó {0} en la estantería! (−{1} fakes)', 'Mancava {0} sullo scaffale! (−{1} fakes)', 'Plus de {0} en rayon ! (−{1} fakes)'],
    'Faltas: {0}': ['Out of stock: {0}', 'Faltas: {0}', 'Mancanze: {0}', 'Ruptures : {0}'],
    'Em dinheiro (arredondado): {0}': ['In cash (rounded): {0}', 'En efectivo (redondeado): {0}', 'In contanti (arrotondato): {0}', 'En espèces (arrondi) : {0}'],
    'Notas': ['Bills', 'Billetes', 'Banconote', 'Billets'], 'Moedas': ['Coins', 'Monedas', 'Monete', 'Pièces'],
    'Gaveta (toque nas notas e moedas)': ['Drawer (tap the bills and coins)', 'Cajón (toca billetes y monedas)', 'Cassetto (tocca banconote e monete)', 'Tiroir (touche les billets et les pièces)'],
    'Digite o valor com os centavos e aperte OK.': ['Type the amount with the cents and press OK.', 'Escribe el valor con los centavos y pulsa OK.', "Digita l'importo con i centesimi e premi OK.", 'Tape le montant avec les centimes et appuie sur OK.'],
    'Mercado fechado. Abre às 8h.': ['Market closed. Opens at 8 AM.', 'Mercado cerrado. Abre a las 8h.', 'Mercato chiuso. Apre alle 8.', 'Supérette fermée. Ouvre à 8 h.'],
    'Abacaxi': ['Pineapple', 'Piña', 'Ananas', 'Ananas'], 'Melancia': ['Watermelon', 'Sandía', 'Anguria', 'Pastèque'],
  };
  for (const k of Object.keys(TRAD)) if (!I18N[k]) I18N[k] = TRAD[k];

  // ------------------------------------------------------------------ regras (fáceis de ajustar)
  const H_ABRE = 8, H_TURNO = 14, H_CHEIO_ATE = 14.5, H_FECHA = 22, H_ULTIMO_CLIENTE = 21;   // mercado 8h–22h · turno do jogador 14h–22h
  const H_CADU_CHEGA = 7.75, H_ROSA_CHEGA = 7 + 50 / 60, H_CADU_CAIXA2 = 14, H_CADU_SAI = 15, H_CADU_VOLTA = 21 + 50 / 60;
  const PAGA = 95, AUMENTO = 15, DESCONTO = 5, FALTA = 3;     // salário fixo · aumento do Cadu · troco errado · produto em falta
  const EST_MAX = 14, REPOR_EM = 5;                          // unidades por seção · abaixo disso o jogo pede para repor
  const SECOES = ['higiene', 'comida', 'bebida', 'fruta'];
  const NOME_SEC = { higiene: 'Higiênico', comida: 'Comida', bebida: 'Bebida', fruta: 'Fruta' };
  const ONDE_SEC = { higiene: 'na gôndola de higiênicos', comida: 'na gôndola de comida', bebida: 'no freezer de bebidas', fruta: 'na ilha de frutas' };
  const COR_SEC = { higiene: '#3a64b8', comida: '#e8742a', bebida: '#3fb7b0', fruta: '#6cae3e' };
  // ------------------------------------------------------------------ (5.4.0) PIXEL ART DOS PRODUTOS (16 x 16, contorno automático)
  //   Cada produto: [nome, preço em CENTAVOS, forma, cores { a: principal, b: rótulo/2ª cor, c: detalhe (tampa, folha...) }].
  //   As formas desenham numa grade 16 x 16; depois o contorno escuro é posto em volta de tudo (contornar).
  const ESCURO = '#2a1206';
  function grade() { return { px: new Array(256).fill(null), r(x, y, w, h, cor) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (i >= 0 && i < 16 && j >= 0 && j < 16) this.px[j * 16 + i] = cor; }, p(x, y, cor) { this.r(x, y, 1, 1, cor); } }; }
  const clarear = (hex, k) => { const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255; r = Math.round(r + (255 - r) * k); g = Math.round(g + (255 - g) * k); b = Math.round(b + (255 - b) * k); return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1); };
  const escurecer = (hex, k) => { const n = parseInt(hex.slice(1), 16); const f = (v) => Math.round(v * (1 - k)); return '#' + ((1 << 24) | (f(n >> 16) << 16) | (f((n >> 8) & 255) << 8) | f(n & 255)).toString(16).slice(1); };
  const FORMAS = {
    garrafa(G, c) { G.r(6, 0, 4, 2, c.c); G.r(6, 2, 4, 3, c.a); G.r(5, 4, 6, 1, c.a); G.r(4, 5, 8, 10, c.a); G.r(4, 8, 8, 4, c.b); G.r(5, 6, 1, 8, clarear(c.a, 0.45)); G.r(10, 6, 1, 8, escurecer(c.a, 0.25)); G.r(6, 9, 4, 2, clarear(c.b, 0.5)); },
    lata(G, c) { G.r(4, 1, 8, 1, '#c9ced4'); G.r(4, 2, 8, 12, c.a); G.r(4, 14, 8, 1, '#9aa0a6'); G.r(4, 6, 8, 4, c.b); G.r(5, 2, 1, 12, clarear(c.a, 0.45)); G.r(10, 2, 1, 12, escurecer(c.a, 0.3)); G.r(6, 7, 4, 2, c.c); },
    caixa(G, c) { G.r(2, 3, 12, 11, c.a); G.r(2, 3, 12, 2, c.b); G.r(4, 7, 8, 4, c.b); G.r(5, 8, 6, 2, c.c); G.r(2, 13, 12, 1, escurecer(c.a, 0.3)); G.r(3, 5, 1, 8, clarear(c.a, 0.4)); },
    caixinha(G, c) { G.r(5, 3, 6, 11, c.a); G.r(5, 3, 6, 2, c.b); G.r(5, 8, 6, 3, c.b); G.r(9, 0, 1, 4, '#f2f2ee'); G.r(10, 0, 1, 1, '#f2f2ee'); G.r(6, 9, 3, 1, c.c); G.r(5, 5, 1, 8, clarear(c.a, 0.4)); },
    pacote(G, c) { G.r(4, 1, 8, 1, escurecer(c.a, 0.2)); for (let i = 4; i < 12; i += 2) G.p(i, 0, escurecer(c.a, 0.2)); G.r(3, 2, 10, 12, c.a); G.r(4, 14, 8, 1, c.a); G.r(3, 6, 10, 4, c.b); G.r(5, 7, 6, 2, c.c); G.r(4, 3, 1, 10, clarear(c.a, 0.4)); },
    saco(G, c) { G.r(3, 2, 10, 1, escurecer(c.a, 0.2)); G.r(2, 3, 12, 11, c.a); G.r(3, 14, 10, 1, c.a); G.r(4, 5, 8, 6, c.b); for (let j = 6; j < 10; j++) for (let i = 5; i < 11; i++) if ((i + j) % 2) G.p(i, j, c.c); G.r(3, 4, 1, 9, clarear(c.a, 0.4)); },
    pote(G, c) { G.r(3, 5, 10, 2, c.c); G.r(4, 4, 8, 1, c.c); G.r(3, 7, 10, 7, c.a); G.r(3, 9, 10, 3, c.b); G.r(4, 14, 8, 1, escurecer(c.a, 0.3)); G.r(4, 8, 1, 5, clarear(c.a, 0.4)); },
    tubo(G, c) { G.r(1, 6, 2, 4, c.c); G.r(3, 5, 10, 6, c.a); G.r(13, 4, 2, 8, escurecer(c.a, 0.2)); G.r(5, 6, 6, 3, c.b); G.r(3, 5, 10, 1, clarear(c.a, 0.45)); },
    barra(G, c) { G.r(2, 5, 12, 7, c.a); G.r(3, 4, 10, 1, c.a); G.r(3, 12, 10, 1, escurecer(c.a, 0.25)); G.r(4, 7, 8, 3, c.b); G.r(3, 5, 10, 1, clarear(c.a, 0.5)); },
    rolos(G, c) { for (const [x, y] of [[2, 2], [8, 2], [2, 8], [8, 8]]) { G.r(x, y, 6, 6, c.a); G.r(x + 2, y + 2, 2, 2, c.c); G.p(x + 1, y + 1, clarear(c.a, 0.6)); } G.r(2, 6, 12, 1, c.b); },
    frasco(G, c) { G.r(6, 0, 4, 3, c.c); G.r(7, 3, 2, 1, c.c); G.r(5, 4, 6, 11, c.a); G.r(5, 7, 6, 4, c.b); G.r(6, 5, 1, 9, clarear(c.a, 0.45)); },
    spray(G, c) { G.r(6, 0, 4, 2, c.c); G.r(5, 2, 6, 1, '#c9ced4'); G.r(5, 3, 6, 12, c.a); G.r(5, 6, 6, 5, c.b); G.r(6, 4, 1, 10, clarear(c.a, 0.45)); G.r(9, 7, 1, 3, c.c); },
    bandeja(G, c) { G.r(1, 6, 14, 7, c.a); for (const x of [2, 6, 10]) for (const y of [5, 8]) { G.r(x, y, 3, 3, c.b); G.p(x, y, clarear(c.b, 0.5)); } G.r(1, 12, 14, 1, escurecer(c.a, 0.3)); },
    pao(G, c) { G.r(2, 4, 12, 10, c.b); G.r(3, 3, 10, 1, c.b); G.r(3, 5, 10, 7, c.a); G.r(4, 4, 8, 1, clarear(c.a, 0.3)); G.r(2, 10, 12, 2, c.c); },
    redonda(G, c) { G.r(5, 3, 6, 1, c.a); G.r(3, 4, 10, 1, c.a); G.r(2, 5, 12, 6, c.a); G.r(3, 11, 10, 2, c.a); G.r(5, 13, 6, 1, c.a); G.r(7, 0, 1, 4, '#6a4428'); G.r(8, 1, 3, 2, c.c); G.r(4, 5, 2, 2, clarear(c.a, 0.5)); G.r(11, 9, 1, 2, escurecer(c.a, 0.3)); },
    banana(G, c) { const cor = c.a; for (let i = 0; i < 3; i++) { const dy = i * 2; G.r(2, 9 - dy, 3, 2, cor); G.r(4, 10 - dy, 4, 2, cor); G.r(8, 9 - dy, 3, 2, cor); G.r(11, 7 - dy, 2, 2, cor); G.r(13, 5 - dy, 1, 2, cor); } G.r(12, 1, 2, 2, c.c); G.r(1, 9, 1, 2, '#3a2a12'); G.r(4, 10, 4, 1, clarear(cor, 0.4)); },
    mamao(G, c) { G.r(5, 1, 6, 2, c.a); G.r(3, 3, 10, 9, c.a); G.r(4, 12, 8, 2, c.a); G.r(6, 14, 4, 1, c.a); G.r(5, 4, 6, 7, c.b); for (const [x, y] of [[7, 6], [8, 7], [7, 8], [8, 9]]) G.p(x, y, ESCURO); G.r(7, 0, 2, 1, c.c); },
    oval(G, c) { G.r(5, 2, 6, 1, c.a); G.r(3, 3, 10, 10, c.a); G.r(5, 13, 6, 1, c.a); for (const [x, y] of [[5, 5], [9, 4], [7, 8], [11, 9], [4, 10], [9, 11]]) G.p(x, y, c.b); G.r(4, 4, 2, 2, clarear(c.a, 0.35)); G.r(7, 1, 2, 1, c.c); },
    cacho(G, c) { for (const [x, y] of [[4, 4], [8, 4], [6, 7], [10, 7], [3, 8], [7, 10], [5, 12], [9, 11]]) { G.r(x, y, 3, 3, c.a); G.p(x, y, clarear(c.a, 0.5)); } G.r(7, 0, 1, 4, '#6a4428'); G.r(8, 1, 3, 2, c.c); },
    abacaxi(G, c) { for (const [x, w] of [[6, 1], [8, 1], [5, 1], [9, 1], [7, 1]]) G.r(x, 0 + (x === 7 ? 0 : 1), w, 4, c.c); G.r(4, 4, 8, 1, c.a); G.r(3, 5, 10, 9, c.a); G.r(4, 14, 8, 1, c.a); for (let j = 6; j < 14; j += 2) for (let i = 4 + (j % 4 ? 1 : 0); i < 12; i += 2) G.p(i, j, c.b); },
    melancia(G, c) { G.r(1, 4, 14, 1, c.c); G.r(1, 5, 14, 3, c.b); G.r(2, 8, 12, 2, c.b); G.r(4, 10, 8, 2, c.b); G.r(1, 3, 14, 1, '#1f6a2a'); G.r(1, 2, 14, 1, c.a); for (const x of [4, 7, 10, 12]) G.p(x, 6, ESCURO); for (const x of [5, 9]) G.p(x, 8, ESCURO); },
  };
  function contornar(G) {
    const v = G.px.slice();
    for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) {
      if (v[j * 16 + i]) continue;
      const viz = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => { const x = i + dx, y = j + dy; return x >= 0 && x < 16 && y >= 0 && y < 16 && v[y * 16 + x] && v[y * 16 + x] !== ESCURO; });
      if (viz) G.px[j * 16 + i] = ESCURO;
    }
  }
  const PRODUTOS = {          // [nome, preço em centavos, forma, { a, b, c }]
    higiene: [
      ['Sabonete Dovinho', 349, 'barra', { a: '#f2f2ee', b: '#3a64b8', c: '#f2c230' }],
      ['Papel Higiênico Nevasca', 1290, 'rolos', { a: '#f6f6f2', b: '#3fa0d8', c: '#c9ced4' }],
      ['Creme Dental Colgado', 487, 'tubo', { a: '#e8452f', b: '#f2f2ee', c: '#f2f2ee' }],
      ['Xampu Sedosa', 1179, 'frasco', { a: '#d95fa0', b: '#f6d2e6', c: '#7a4fb0' }],
      ['Desodorante Rexoninha', 1399, 'spray', { a: '#2a72d6', b: '#f2f2ee', c: '#1c1c1f' }],
      ['Sabão em Pó Omô', 1689, 'caixa', { a: '#3a64b8', b: '#e8452f', c: '#f2f2ee' }],
      ['Detergente Ypezinho', 259, 'frasco', { a: '#f2c230', b: '#2e8a4a', c: '#2e8a4a' }],
      ['Esponja Bombrilha', 389, 'pacote', { a: '#c8352b', b: '#f2c230', c: '#8c9199' }],
      ['Fralda Pampero', 3990, 'pacote', { a: '#7ab8d8', b: '#f2f2ee', c: '#f2c230' }],
      ['Repelente Off-Igarapé', 1549, 'spray', { a: '#1f7a4d', b: '#f2c230', c: '#1c1c1f' }],
      ['Água Sanitária Q-Boa Demais', 579, 'garrafa', { a: '#f2f2ee', b: '#3a64b8', c: '#3a64b8' }],
      ['Cotonete Cotonetinho', 449, 'caixinha', { a: '#f2f2ee', b: '#7ab8d8', c: '#3a64b8' }],
    ],
    comida: [
      ['Arroz Tio João Grilo', 2490, 'saco', { a: '#f2f2ee', b: '#c8352b', c: '#f4e9c8' }],
      ['Feijão Kicaldinho', 899, 'saco', { a: '#f2c230', b: '#5a3418', c: '#3a1f0e' }],
      ['Macarrão Renatinha', 469, 'pacote', { a: '#3a64b8', b: '#f2c230', c: '#f4e0b0' }],
      ['Biscoito Trakinhas', 329, 'pacote', { a: '#6a3b22', b: '#e8452f', c: '#f2f2ee' }],
      ['Café Pilãozinho', 1890, 'pacote', { a: '#c8352b', b: '#f2c230', c: '#3a2213' }],
      ['Miojo Nissim Senhor', 199, 'pacote', { a: '#e8742a', b: '#c8352b', c: '#f2c230' }],
      ['Achocolatado Nescaú', 879, 'lata', { a: '#f2c230', b: '#5a3418', c: '#2e8a4a' }],
      ['Leite em Pó Ninhu', 2199, 'lata', { a: '#f2f2ee', b: '#f2c230', c: '#3a64b8' }],
      ["Farinha d'Uarini", 1250, 'saco', { a: '#f2f2ee', b: '#e8c85a', c: '#f2d27a' }],
      ['Tucupi da Vovó', 990, 'garrafa', { a: '#f2c230', b: '#f2f2ee', c: '#c8352b' }],
      ['Castanha do Amazonas', 1590, 'pacote', { a: '#8a5a2a', b: '#f2e6c8', c: '#5a3418' }],
      ['Bombom Garotinho', 2290, 'caixa', { a: '#f2c230', b: '#c8352b', c: '#6a3b22' }],
      ['Margarina Quali-Ali', 749, 'pote', { a: '#f2e6a8', b: '#2a72d6', c: '#f2c230' }],
      ['Sardinha Coqueirinho', 619, 'lata', { a: '#3a64b8', b: '#f2f2ee', c: '#c9ced4' }],
      ['Goma de Tapioca', 690, 'saco', { a: '#f2f2ee', b: '#8fd06a', c: '#ffffff' }],
      ['Salsicha Sadinha', 1149, 'pacote', { a: '#c8352b', b: '#f2f2ee', c: '#e8946a' }],
      ['Ovos da Granja do Seu Zé', 1499, 'bandeja', { a: '#9aa07a', b: '#f4e9d0', c: '#ffffff' }],
      ['Pão de Forma Pullmano', 899, 'pao', { a: '#d89a5a', b: '#f2f2ee', c: '#3a64b8' }],
    ],
    bebida: [
      ['Guaraná Barezinho', 699, 'garrafa', { a: '#2e8a4a', b: '#c8352b', c: '#c8352b' }],
      ['Refri Cola-Coca', 899, 'garrafa', { a: '#3a1f0e', b: '#c8352b', c: '#c8352b' }],
      ['Guaraná Antarticão', 449, 'lata', { a: '#2e8a4a', b: '#f2f2ee', c: '#c8352b' }],
      ['Suco de Cupuaçu Polpinha', 1299, 'caixinha', { a: '#f2e6c8', b: '#8a5a2a', c: '#2e8a4a' }],
      ['Água Mineral Igarapé', 249, 'garrafa', { a: '#9ec7dd', b: '#2a72d6', c: '#2a72d6' }],
      ['Leite Itambézinho', 589, 'caixinha', { a: '#f2f2ee', b: '#2a72d6', c: '#c8352b' }],
      ['Toddyinho', 329, 'caixinha', { a: '#f2c230', b: '#5a3418', c: '#c8352b' }],
      ['Energético Red Boi', 1099, 'lata', { a: '#2a3f66', b: '#c9ced4', c: '#c8352b' }],
      ['Chá Matte Leãozinho', 599, 'garrafa', { a: '#c8902a', b: '#c8352b', c: '#f2c230' }],
      ['Suco Del Vale do Javari', 849, 'caixinha', { a: '#e8742a', b: '#2e8a4a', c: '#f2c230' }],
      ['Açaí no Litro', 1500, 'garrafa', { a: '#4a1f4a', b: '#7a4fb0', c: '#2e8a4a' }],
      ['Iogurte Danadinho', 699, 'pote', { a: '#f6d2e6', b: '#3a64b8', c: '#f2f2ee' }],
    ],
    fruta: [
      ['Banana-pacovã', 599, 'banana', { a: '#f2c230', b: '#f2c230', c: '#5f8a2a' }],
      ['Maçã', 299, 'redonda', { a: '#c8352b', b: '#c8352b', c: '#4f9a3f' }],
      ['Laranja', 189, 'redonda', { a: '#f0a020', b: '#f0a020', c: '#4f9a3f' }],
      ['Mamão', 649, 'mamao', { a: '#e8a030', b: '#f07a3a', c: '#4f9a3f' }],
      ['Cupuaçu', 1190, 'oval', { a: '#8a5a2a', b: '#6a4428', c: '#4f9a3f' }],
      ['Tucumã', 899, 'cacho', { a: '#f07a1a', b: '#f07a1a', c: '#4f9a3f' }],
      ['Abacaxi', 799, 'abacaxi', { a: '#e0a020', b: '#a8761a', c: '#4f9a3f' }],
      ['Melancia', 1890, 'melancia', { a: '#2e8a4a', b: '#e8452f', c: '#f6f1e8' }],
    ],
  };
  const imgProd = new Map();
  function canvasProduto(P) {                       // P = [nome, preço, forma, cores] → canvas 16 x 16 (guardado: desenha uma vez só)
    if (imgProd.has(P[0])) return imgProd.get(P[0]);
    const G = grade(); (FORMAS[P[2]] || FORMAS.caixa)(G, P[3]); contornar(G);
    const cv = document.createElement('canvas'); cv.width = cv.height = 16; const g = cv.getContext('2d');
    G.px.forEach((cor, k) => { if (cor) { g.fillStyle = cor; g.fillRect(k % 16, (k / 16) | 0, 1, 1); } });
    imgProd.set(P[0], cv); return cv;
  }
  function iconeProduto(P, tam) { const src = canvasProduto(P), cv = document.createElement('canvas'); cv.width = cv.height = 16; cv.getContext('2d').drawImage(src, 0, 0); cv.style.cssText = 'width:' + tam + 'px;height:' + tam + 'px;image-rendering:pixelated;display:block;flex:0 0 auto;'; return cv; }

  // ------------------------------------------------------------------ (5.4.0) DINHEIRO EM CENTAVOS: notas, moedas e cartões em pixel art
  const fmt = (c) => 'F$ ' + (Math.round(c) / 100).toFixed(2).replace('.', ',');
  const NOTAS = [                                            // valor em centavos (as cores das notas do real)
    { v: 200, cor: '#7fa7c9', esc: '#41698c' }, { v: 500, cor: '#b49ad0', esc: '#6e548f' }, { v: 1000, cor: '#d9785a', esc: '#9a4426' },
    { v: 2000, cor: '#f0c24e', esc: '#b07c18' }, { v: 5000, cor: '#d39a5e', esc: '#8a5a2a' }, { v: 10000, cor: '#64b0d8', esc: '#2a6f96' },
  ];
  const MOEDAS = [                                           // 5 e 10 centavos de cobre/dourada, 25 dourada, 50 prateada, 1 bimetálica
    { v: 5, cor: '#c47a3a', esc: '#7a4420', tam: 15 }, { v: 10, cor: '#d4a537', esc: '#8a6a1a', tam: 16 }, { v: 25, cor: '#e0b83a', esc: '#8a6a1a', tam: 18 },
    { v: 50, cor: '#c9ccd1', esc: '#6e737a', tam: 18 }, { v: 100, cor: '#d4a537', esc: '#6e737a', tam: 20, borda: '#c9ccd1' },
  ];
  const GAVETA_NOTAS = [200, 500, 1000, 2000, 5000], GAVETA_MOEDAS = [5, 10, 25, 50, 100];
  const ehMoeda = (v) => v <= 100;
  function desenharNota(v, larg) {
    const N = NOTAS.find((n) => n.v === v), cv = document.createElement('canvas'); cv.width = 48; cv.height = 22; const g = cv.getContext('2d');
    g.fillStyle = N.esc; g.fillRect(0, 0, 48, 22); g.fillStyle = N.cor; g.fillRect(1, 1, 46, 20);
    g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(3, 3, 42, 1); g.fillRect(3, 18, 42, 1);
    g.fillStyle = N.esc; g.fillRect(30, 5, 12, 12); g.fillStyle = 'rgba(255,255,255,0.45)'; g.fillRect(32, 7, 8, 8);
    g.fillStyle = N.esc; g.fillRect(34, 9, 4, 4);
    g.fillStyle = '#2a1206'; g.font = 'bold 10px monospace'; g.textBaseline = 'middle'; g.fillText(String(v / 100), 4, 11.5);
    cv.style.cssText = 'width:' + (larg || 72) + 'px;height:auto;image-rendering:pixelated;display:block;';
    return cv;
  }
  function desenharMoeda(v, larg) {
    const M = MOEDAS.find((m) => m.v === v), n = 20, cv = document.createElement('canvas'); cv.width = cv.height = n; const g = cv.getContext('2d');
    const r = M.tam / 2, c = n / 2;
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const d = Math.hypot(i + 0.5 - c, j + 0.5 - c); if (d > r) continue;
      g.fillStyle = d > r - 1.2 ? '#2a1206' : M.borda && d > r - 4 ? M.borda : d > r - 2.4 ? M.esc : M.cor; g.fillRect(i, j, 1, 1);
    }
    g.fillStyle = 'rgba(255,255,255,0.55)'; g.fillRect(c - r + 3, c - 2, 1, 3); g.fillRect(c - 2, c - r + 3, 3, 1);
    g.fillStyle = '#2a1206'; g.font = 'bold 8px monospace'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(v === 100 ? '1' : String(v), c + 0.5, c + 1);
    cv.style.cssText = 'width:' + (larg || 30) + 'px;height:auto;image-rendering:pixelated;display:block;';
    return cv;
  }
  const desenharDinheiro = (v, larg) => (ehMoeda(v) ? desenharMoeda(v, Math.round((larg || 56) * 0.5)) : desenharNota(v, larg));
  const CARTOES = [                                          // 5 cartões "de brincadeira" (cor do cartão, faixa, texto)
    { nome: 'NUBANCO', a: '#7a2fb0', b: '#a85fe0', t: '#f2f2ee' },
    { nome: 'ITAÚNA', a: '#ec7000', b: '#f6a040', t: '#1c2a6e' },
    { nome: 'BRASESCO', a: '#cc092f', b: '#e8455f', t: '#f2f2ee' },
    { nome: 'CAIXINHA', a: '#005ca9', b: '#f39200', t: '#f2f2ee' },
    { nome: 'BANCO DO BRAZIU', a: '#f8d117', b: '#2a5ab8', t: '#1f3a8a' },
  ];
  function desenharCartao(i, larg) {
    const C = CARTOES[i % CARTOES.length], W = 96, H = 60, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
    g.fillStyle = '#2a1206'; g.fillRect(2, 0, W - 4, H); g.fillRect(0, 2, W, H - 4); g.fillRect(1, 1, W - 2, H - 2);
    g.fillStyle = C.a; g.fillRect(3, 2, W - 6, H - 4); g.fillRect(2, 3, W - 4, H - 6);
    g.fillStyle = C.b; g.fillRect(2, 38, W - 4, 6);                                        // a faixa
    for (let k = 0; k < 6; k++) { g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(56 + k * 6, 3, 3, H - 6); }  // listrinhas de brilho
    g.fillStyle = '#e8c55a'; g.fillRect(10, 18, 16, 12); g.fillStyle = '#b8902a'; g.fillRect(10, 23, 16, 1); g.fillRect(17, 18, 1, 12); g.fillRect(14, 18, 1, 5); g.fillRect(21, 25, 1, 5);   // chip
    g.fillStyle = C.t; for (const [k, a] of [[0, 3], [1, 5], [2, 7]]) { g.fillRect(32 + k * 4, 24 - a / 2, 1, a); }   // ))) aproximação
    g.font = 'bold 9px monospace'; g.textBaseline = 'top'; g.fillStyle = C.t; g.fillText(C.nome, 8, 6);
    g.font = '7px monospace'; g.fillText('**** **** **** ' + String(1000 + (i * 1373) % 9000), 8, 48);
    cv.style.cssText = 'width:' + (larg || 96) + 'px;height:auto;image-rendering:pixelated;display:block;';
    return cv;
  }

  // ------------------------------------------------------------------ sons (WebAudio, como os da cafeteria)
  const audio = () => (typeof Som !== 'undefined' && Som.audio && Som.audio.ctx && !Som.mudo ? Som.audio : null);
  let ruido = null;
  function tom(A, f, t, dur, vol, tipo, ate) {
    const c = A.ctx, o = c.createOscillator(), g = c.createGain(); o.type = tipo || 'square'; o.frequency.setValueAtTime(f, t); if (ate) o.frequency.exponentialRampToValueAtTime(ate, t + dur * 0.9);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(A.mestre); o.start(t); o.stop(t + dur + 0.05);
  }
  function chiado(A, t, dur, vol, freq) {
    const c = A.ctx; if (!ruido || ruido.sampleRate !== c.sampleRate) { ruido = c.createBuffer(1, c.sampleRate, c.sampleRate); const d = ruido.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s.buffer = ruido; f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = 1.2;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(f); f.connect(g); g.connect(A.mestre); s.start(t, Math.random() * 0.5, dur + 0.02);
  }
  const com = (fn) => () => { const A = audio(); if (!A) return; try { fn(A, A.ctx.currentTime + 0.01); } catch (e) { /* sem som */ } };
  const SOM = {
    bip: com((A, t) => tom(A, 1850, t, 0.09, 0.06, 'square')),                                           // leitor de código de barras
    nota: com((A, t) => { chiado(A, t, 0.07, 0.1, 3500); chiado(A, t + 0.05, 0.05, 0.06, 5000); }),       // nota de papel
    moeda: com((A, t) => { tom(A, 3100, t, 0.05, 0.03, 'triangle'); tom(A, 4200, t + 0.03, 0.08, 0.025, 'triangle'); }),   // (5.4.0) moedinha
    tecla: com((A, t) => tom(A, 1200, t, 0.04, 0.04, 'square')),
    erro: com((A, t) => tom(A, 220, t, 0.25, 0.07, 'square', 110)),
    aprox: com((A, t) => { for (let i = 0; i < 3; i++) tom(A, 2400, t + i * 0.12, 0.05, 0.025, 'sine'); }),   // (5.4.0) cartão chegando perto
    aprovado: com((A, t) => { tom(A, 1568, t, 0.12, 0.05, 'square'); tom(A, 2093, t + 0.13, 0.18, 0.05, 'square'); }),
    certo: com((A, t) => { for (const [i, f] of [[0, 660], [1, 880], [2, 1320]]) tom(A, f, t + i * 0.08, 0.14, 0.05, 'triangle'); }),
    caixa: com((A, t) => { chiado(A, t, 0.12, 0.12, 900); tom(A, 140, t + 0.02, 0.15, 0.08, 'sine', 70); }),   // caixa de papelão no chão
    porta: com((A, t) => { tom(A, 1760, t, 0.5, 0.04, 'sine'); tom(A, 1319, t + 0.16, 0.6, 0.04, 'sine'); }),
  };
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pk = (l) => l[Math.floor(Math.random() * l.length)];
  const clampN = (v, a, b) => Math.max(a, Math.min(b, v));
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ================================================================== o módulo (um por cidade aberta)
  function criar(api) {
    const S = () => api.S();
    const M = { R: null, D: null, cadu: null, rosa: null, marcas: {}, esteiraM: [], tex: new Map(), nav: null, avisos: [], tAviso: 0 };

    const dadosM = () => { const d = S().dados; if (!d.mercado) d.mercado = {}; const m = d.mercado; if (!m.estoque) m.estoque = { higiene: EST_MAX, comida: EST_MAX, bebida: EST_MAX, fruta: EST_MAX }; return m; };
    const hora = () => S().dados.hora;
    const aberto = () => { const h = hora(); return h >= H_ABRE && h < H_FECHA; };
    const ehMeuEmprego = () => api.empregoEscolhido() === 'mercado';
    const fimDeSemana = () => !!(api.fimDeSemana && api.fimDeSemana());
    // o jogador trabalha HOJE no caixa? (se não: outro emprego, fim de semana ou 1º dia → o Cadu cobre o 2º turno)
    const jogadorTrabalhaHoje = () => ehMeuEmprego() && !fimDeSemana() && (S().dados.dia || 1) >= 2;
    const rosaLiberadaHoje = () => { const L = dadosM().rosaLib; return !!(L && L.dia === S().dados.dia); };
    const salario = () => PAGA + (dadosM().aumento ? AUMENTO : 0);

    // ---------------------------------------------------------------- as pessoas do mercado (modelos)
    function criarCadu() {
      const s = S(), acha = (lista, n) => Math.max(0, lista.findIndex((x) => x.nome === n));
      const ap = { pele: PELES_FITZ[3].cor, cabelo: CORES_CABELO[1].cor, estilo: acha(ESTILOS_CABELO, 'Franja'), rosto: acha(ROSTOS, 'Padrão'), labio: 2, barba: 0 };
      let m = null, opt = null;
      try { if (s.f2 && s.f2.modeloPessoa) { const r = s.f2.modeloPessoa({ ap, fem: false, roupa: 0, cores: ['#c8352b', '#2a3f66', '#f2f2ee', '#f2f2ee'] }); m = r.m; opt = r.opt; } } catch (e) { console.warn('[Mercado] Cadu:', e); }
      if (!m) { opt = Object.assign({ camisa: '#c8352b', listra: '#c8352b', gola: '#f2f2ee', calcao: '#2a3f66', meia: '#2a3f66', sola: '#e6e6e0', corTexto: '#F2F2EE', numero: '', nome: ' ', fundoNome: 'rgba(0,0,0,0)', manga: 0, meiao: 1, cabecao: 1, escala: 1 }, ap); m = makeAthlete(opt); m.etiqueta.visible = false; m.sombra.visible = false; }
      avental(m, '#1f7a4d'); oculos(m, opt);
      const A = api.atorDe(m, opt, 'parado'); A.vel = 1.5; return A;
    }
    function criarRosa() {
      const s = S(), ap = Object.assign(gerarAparencia(7310, 'F'), { pele: PELES_FITZ[2].cor });
      let m = null, opt = null;
      try { if (s.f2 && s.f2.modeloPessoa) { const r = s.f2.modeloPessoa({ ap, fem: true, roupa: 1, cores: ['#f2f2ee', '#1c1c1f', '#c8352b', '#c8352b'] }); m = r.m; opt = r.opt; } } catch (e) { console.warn('[Mercado] Rosa:', e); }
      if (!m) { opt = Object.assign({ camisa: '#f2f2ee', listra: '#c8352b', gola: '#c8352b', calcao: '#1c1c1f', meia: '#1c1c1f', sola: '#e6e6e0', corTexto: '#F2F2EE', numero: '', nome: ' ', fundoNome: 'rgba(0,0,0,0)', manga: 0, meiao: 1, cabecao: 1, escala: 1 }, ap); m = makeAthlete(opt); m.etiqueta.visible = false; m.sombra.visible = false; }
      avental(m, '#1f7a4d');
      const A = api.atorDe(m, opt, 'parado'); A.vel = 1.4; return A;
    }
    function avental(m, cor) {                                          // avental verde do mercado + crachá
      const G = new api.Geo(); G.box(0.05, 0.62, 0.46, cor, 0.17, 0.55, 0); G.box(0.04, 0.05, 0.5, '#f2c230', 0.18, 0.86, 0); G.box(0.02, 0.08, 0.14, '#f2f2ee', 0.2, 1.1, -0.1);
      m.corpo.add(G.malha(api.MAT));
    }
    // os mesmos óculos da Fase 1 (fase1.js: oculos), na cabeça de adulto (cabeça tamanho 1)
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
    function vassoura(A) {                                              // a vassoura do Cadu (aparece só quando ele varre)
      if (A.vassoura) return A.vassoura;
      const g = new THREE.Group(), G = new api.Geo();
      G.box(0.045, 1.3, 0.045, '#8a5a2a', 0, -1.3, 0); G.box(0.14, 0.1, 0.5, '#c8352b', 0, -1.4, 0); G.box(0.16, 0.12, 0.52, '#f2c230', 0, -1.52, 0);
      g.add(G.malha(api.MAT)); g.position.set(0.42, 1.0, 0.08); A.m.corpo.add(g); A.vassoura = g; g.visible = false; return g;
    }

    // ---------------------------------------------------------------- (5.4.0) Cadu e Rosa na RUA (de casa até o mercado e de volta)
    function viagensCadu() {
      if (!jogadorTrabalhaHoje()) return [{ ida: true, chega: H_CADU_CHEGA }, { ida: false, sai: H_FECHA + 0.1 }];
      return [{ ida: true, chega: H_CADU_CHEGA }, { ida: false, sai: H_CADU_SAI }, { ida: true, chega: H_CADU_VOLTA }, { ida: false, sai: H_FECHA + 0.2 }];
    }
    function saidaRosa() { if (!jogadorTrabalhaHoje()) return H_CADU_SAI; const L = dadosM().rosaLib; return L && L.dia === S().dados.dia ? L.h : H_FECHA; }
    function viagensRosa() { return [{ ida: true, chega: H_ROSA_CHEGA }, { ida: false, sai: saidaRosa() }]; }
    function montarRua() {
      api.criarRuaAgendada(criarCadu(), 'cadu', 'supermercado', viagensCadu, 1.6);
      api.criarRuaAgendada(criarRosa(), 'rosa', 'supermercado', viagensRosa, 1.5);
    }

    // ---------------------------------------------------------------- (5.4.0) dentro da loja: onde cada um deve estar a cada hora
    //   cada estado: { id, x, z, yaw, pose } | { id: 'limpa' } (anda entre os pontos de limpeza) | null (não está na loja)
    function estadoCadu(h) {
      const D = M.D; if (!D) return null;
      if (h < H_CADU_CHEGA) return null;
      if (h < H_CADU_CAIXA2) return { id: 'limpa' };
      if (h < H_CADU_SAI) return { id: 'caixa2', x: D.cadu.x, z: D.cadu.z, yaw: D.cadu.yaw, pose: 'conta' };
      if (!jogadorTrabalhaHoje()) return h < H_FECHA + 0.1 ? { id: 'caixa1', x: D.caixaNPC.x, z: D.caixaNPC.z, yaw: D.caixaNPC.yaw, pose: 'caixa' } : null;
      if (h < H_CADU_VOLTA) return null;
      return h < H_FECHA + 0.2 ? { id: 'libera', x: D.caixa.jog.x + 0.95, z: D.caixa.jog.z + 0.55, yaw: Math.PI * 0.8, pose: null } : null;
    }
    function estadoRosa(h) {
      const D = M.D; if (!D) return null;
      if (h < H_ROSA_CHEGA || h >= saidaRosa()) return null;
      const U = S().turnoMercado; if (U && !U.fim) return null;            // o caixa é do jogador
      return { id: 'caixa1', x: D.caixaNPC.x, z: D.caixaNPC.z, yaw: D.caixaNPC.yaw, pose: 'caixa' };
    }
    const LIMPEZA = [                                                    // onde o Cadu limpa/organiza (pose, para onde olha)
      { x: -5.3, z: -4.5, yaw: Math.PI, pose: 'organiza' }, { x: -1.6, z: -1.5, yaw: Math.PI / 2, pose: 'varre' }, { x: 2.8, z: -8.2, yaw: Math.PI / 2, pose: 'organiza' },
      { x: -7.6, z: 1.7, yaw: -Math.PI / 2, pose: 'organiza' }, { x: 6.5, z: -3.0, yaw: 0, pose: 'varre' }, { x: 2.4, z: 1.8, yaw: Math.PI, pose: 'varre' },
      { x: 10.9, z: -4.6, yaw: 0, pose: 'organiza' }, { x: -2.2, z: -5.5, yaw: 0, pose: 'organiza' }, { x: 0.5, z: 6.0, yaw: Math.PI / 2, pose: 'varre' },
    ];
    // avisos curtos de quem trabalha ("Cadu: ..."), um depois do outro, sem parar o jogo
    function falaRapida(quem, txt) { M.avisos.push(quem + ': ' + txt); if (M.avisos.length === 1 && M.tAviso <= 0) proxAviso(); }
    function proxAviso() { const t = M.avisos[0]; if (!t) { api.aviso(''); return; } api.aviso(t); M.tAviso = 3.4; }
    function tickAvisos(dt) { if (M.tAviso <= 0) return; M.tAviso -= dt; if (M.tAviso <= 0) { M.avisos.shift(); if (M.avisos.length) proxAviso(); else { const s = S(); if (s && s.modo === 'livre') api.aviso(''); } } }

    function colocar(chave, criarFn, nome, voz, e, instantaneo) {
      const s = S(), D = M.D; let A = M[chave];
      if (!A) {
        A = criarFn(); s.npcs.push(A); M[chave] = A; A.estM = null;
        s.falantesExtra = s.falantesExtra || {}; s.falantesExtra[chave] = { A, nome, voz };
        if (instantaneo) { const p = e.id === 'limpa' ? pk(LIMPEZA) : e; const q = pontoLivre(p.x, p.z); A.x = q.x; A.z = q.z; A.yaw = A.yawAlvo = p.yaw || 0; if (e.id === 'limpa') { A.limpa = { p, t: rnd(5, 9) }; A.poseM = p.pose; } else A.poseM = e.pose; A.estM = e.id; }
        else { const en = M.R.entrada; A.x = en.x; A.z = en.z; A.yaw = A.yawAlvo = Math.PI / 2; SOM.porta(); }
      }
      return A;
    }
    function tirar(chave) {
      const s = S(), A = M[chave]; if (!A) return;
      if (s.falantesExtra) delete s.falantesExtra[chave];
      api.descartarPessoa(A); M[chave] = null;
    }
    function tickPessoal(chave, estadoFn, criarFn, nome, voz, dt, instantaneo) {
      const e = estadoFn(hora()); let A = M[chave];
      if (!e) {                                                          // não devia estar aqui: sai pela porta
        if (!A) return;
        if (instantaneo) { tirar(chave); return; }
        if (A.estM !== 'sai') { aoMudar(chave, A.estM, null); A.estM = 'sai'; A.poseM = null; A.limpa = null; const sd = M.R.saida; A.rotaM = caminho(A.x, A.z, sd.x, sd.z); }
        { const sd = M.R.saida; if (andarM(A, dt) || Math.hypot(A.x - sd.x, A.z - sd.z) < 0.9) tirar(chave); }   // chegou na porta (mesmo com alguém parado nela)
        return;
      }
      A = colocar(chave, criarFn, nome, voz, e, instantaneo);
      if (A.estM !== e.id) {                                              // mudou de estado: anda até o novo lugar
        const ant = A.estM; A.estM = e.id; A.poseM = null; A.limpa = null;
        if (e.id === 'limpa') { const p = pk(LIMPEZA); A.limpa = { p, t: rnd(6, 10) }; A.rotaM = caminho(A.x, A.z, p.x, p.z); }
        else A.rotaM = caminho(A.x, A.z, e.x, e.z);
        aoMudar(chave, ant, e.id);
      }
      if (A.rotaM && A.rotaM.length) { A.poseM = null; if (andarM(A, dt)) { const p = A.limpa ? A.limpa.p : e; A.yawAlvo = p.yaw || 0; A.poseM = p.pose; } return; }
      if (A.limpa) {                                                     // limpando: de tempos em tempos muda de canto
        A.limpa.t -= dt; A.poseM = A.limpa.p.pose; A.yawAlvo = A.limpa.p.yaw;
        if (A.limpa.t <= 0) { let p = pk(LIMPEZA); if (p === A.limpa.p) p = LIMPEZA[(LIMPEZA.indexOf(p) + 1) % LIMPEZA.length]; A.limpa = { p, t: rnd(6, 10) }; A.poseM = null; A.rotaM = caminho(A.x, A.z, p.x, p.z); }
      } else { A.yawAlvo = e.yaw; A.poseM = e.pose; }
    }
    function aoMudar(chave, de, para) {                                   // o que eles falam quando o horário muda (com o jogador lá dentro)
      if (chave !== 'cadu') return;
      if (para === 'caixa2') falaRapida(T('Cadu'), T('Vou fechar o caixa aqui do fundo. Fico até as 15h!'));
      else if (para === 'caixa1' && de === 'caixa2') { falaRapida(T('Cadu'), T('Rosa, pode ir! Eu assumo o caixa.')); if (M.rosa) falaRapida(T('Rosa'), T('Valeu, Cadu! Até amanhã!')); }
      else if (para === 'libera') falaRapida(T('Cadu'), T('Cheguei! Às 22h eu fecho com você.'));
      else if (para === null && de === 'caixa2') falaRapida(T('Cadu'), T('Tô indo nessa! Volto às 21h50 pra fechar com você.'));
    }
    // poses de trabalho (por cima da pose normal do poseAtor, que já rodou neste quadro)
    function posesTrabalho() {
      const s = S();
      for (const A of [M.cadu, M.rosa]) {
        if (!A) continue;
        const V = A.vassoura; if (V) V.visible = A.poseM === 'varre';
        if (!A.poseM || A.andando) continue;
        const m = A.m, t = s.t || 0;
        if (A.poseM === 'varre') {
          vassoura(A).visible = true; const w = Math.sin(t * 3.6);
          A.vassoura.rotation.x = w * 0.35; A.vassoura.rotation.z = 0.42;   // a ponta de baixo vai para a frente dele
          m.bracoD.rotation.z = 0.75; m.bracoE.rotation.z = 0.55; m.bracoD.rotation.x = -0.15 + w * 0.2; m.bracoE.rotation.x = 0.35 + w * 0.2;
          usarCotovelo(m.bracoD, 0, 0.55); usarCotovelo(m.bracoE, 0, 0.75);
        } else if (A.poseM === 'organiza') {
          const w = Math.sin(t * 2.2), w2 = Math.sin(t * 2.2 + 1.3);
          m.bracoD.rotation.z = 1.65 + w * 0.25; usarCotovelo(m.bracoD, 0, 0.35 + Math.max(0, w2) * 0.4);
          m.bracoE.rotation.z = 1.0 + w2 * 0.2; usarCotovelo(m.bracoE, 0, 0.8);
        } else if (A.poseM === 'conta') {
          const w = Math.sin(t * 5);
          m.bracoD.rotation.z = m.bracoE.rotation.z = 0.95; m.bracoD.rotation.x = -0.15; m.bracoE.rotation.x = 0.15;
          usarCotovelo(m.bracoD, 0, 1.25 + w * 0.12); usarCotovelo(m.bracoE, 0, 1.25 - w * 0.12);
        } else if (A.poseM === 'caixa') {
          const w = Math.sin(t * 1.3);
          m.bracoD.rotation.z = 0.85 + Math.max(0, w) * 0.25; m.bracoE.rotation.z = 0.7; usarCotovelo(m.bracoD, 0, 1.0); usarCotovelo(m.bracoE, 0, 1.1);
        }
      }
    }

    // ---------------------------------------------------------------- (5.4.0) NAVEGAÇÃO NA LOJA: grade de 0,35 m e A*
    const CEL = 0.35, RR = 0.33;
    function livreEst(x, z) {                                             // só paredes e móveis (gente fica de fora)
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
      for (let r = 1; r < 12; r++) { let melhor = null, bd = 1e9;
        for (let dj = -r; dj <= r; dj++) for (let di = -r; di <= r; di++) { if (Math.max(Math.abs(di), Math.abs(dj)) !== r) continue; const a = i + di, b = j + dj; if (a < 0 || b < 0 || a >= N.nx || b >= N.nz || !N.livre[b * N.nx + a]) continue; const d = di * di + dj * dj; if (d < bd) { bd = d; melhor = [a, b]; } }
        if (melhor) return melhor; }
      return [i, j];
    }
    function pontoLivre(x, z) { if (livreEst(x, z)) return { x, z }; const [i, j] = celLivreMaisPerto(...cel(x, z)); return cen(i, j); }
    function vista(a, b) {                                                // dá para ir em linha reta de a até b?
      const d = Math.hypot(b.x - a.x, b.z - a.z), n = Math.ceil(d / 0.12);
      for (let k = 1; k <= n; k++) { const u = k / n; if (!livreEst(a.x + (b.x - a.x) * u, a.z + (b.z - a.z) * u)) return false; }
      return true;
    }
    function caminho(x0, z0, x1, z1) {
      if (!M.nav) montarNav();
      const N = M.nav, fim = pontoLivre(x1, z1), [si, sj] = celLivreMaisPerto(...cel(x0, z0)), [ti, tj] = cel(fim.x, fim.z);
      if (vista({ x: x0, z: z0 }, fim)) return [fim];
      const idx = (i, j) => j * N.nx + i, n = N.nx * N.nz, g = new Float32Array(n).fill(1e9), de = new Int32Array(n).fill(-1), fechado = new Uint8Array(n);
      const h = (i, j) => Math.hypot(i - ti, j - tj), aberto = [[h(si, sj), si, sj]]; g[idx(si, sj)] = 0;
      let achou = false;
      while (aberto.length) {
        let mi = 0; for (let k = 1; k < aberto.length; k++) if (aberto[k][0] < aberto[mi][0]) mi = k;
        const [, i, j] = aberto[mi]; aberto[mi] = aberto[aberto.length - 1]; aberto.pop();
        const k0 = idx(i, j); if (fechado[k0]) continue; fechado[k0] = 1;
        if (i === ti && j === tj) { achou = true; break; }
        for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
          if (!di && !dj) continue; const a = i + di, b = j + dj; if (a < 0 || b < 0 || a >= N.nx || b >= N.nz) continue;
          const k1 = idx(a, b); if (!N.livre[k1] || fechado[k1]) continue;
          if (di && dj && (!N.livre[idx(i + di, j)] || !N.livre[idx(i, j + dj)])) continue;   // sem cortar quina
          const ng = g[k0] + (di && dj ? 1.414 : 1); if (ng < g[k1]) { g[k1] = ng; de[k1] = k0; aberto.push([ng + h(a, b), a, b]); }
        }
      }
      if (!achou) return [fim];
      const cel2 = []; for (let k = idx(ti, tj); k >= 0; k = de[k]) cel2.push(cen(k % N.nx, Math.floor(k / N.nx)));
      cel2.reverse(); cel2.push(fim);
      // encurta: pula pontos quando dá para ir direto
      const out = []; let a = { x: x0, z: z0 }, k = 0;
      while (k < cel2.length) { let far = k; for (let q = cel2.length - 1; q > k; q--) if (vista(a, cel2[q])) { far = q; break; } out.push(cel2[far]); a = cel2[far]; k = far + 1; }
      return out;
    }
    // anda pela rota (A.rotaM). Gente parada na frente: espera, tenta contornar e, se demorar, passa por ela (nunca pela gôndola).
    function genteNaFrente(A, nx, nz) {
      const s = S();
      for (const B of s.npcs.concat([s.jog])) {
        if (B === A || B.oculto) continue;
        const dn = Math.hypot(nx - B.x, nz - B.z); if (dn < 0.55 && dn < Math.hypot(A.x - B.x, A.z - B.z) - 1e-4) return true;
      }
      return false;
    }
    function andarM(A, dt) {
      const R = A.rotaM; if (!R || !R.length) { A.andando = false; return true; }
      const q = R[0], dx = q.x - A.x, dz = q.z - A.z, d = Math.hypot(dx, dz), v = (A.vel || 1.2) * dt;
      if (d <= Math.max(v, 0.04)) { A.x = q.x; A.z = q.z; R.shift(); A.esperaM = 0; if (!R.length) { A.andando = false; return true; } return false; }
      const tenta = (ux, uz, fantasma) => { const nx = A.x + ux * v, nz = A.z + uz * v; if (!livreEst(nx, nz)) return false; if (!fantasma && genteNaFrente(A, nx, nz)) return false; A.x = nx; A.z = nz; A.yawAlvo = Math.atan2(-uz, ux); return true; };
      const ux = dx / d, uz = dz / d, esp = A.esperaM || 0;
      let ok = tenta(ux, uz, false);
      if (!ok && esp > 0.7) for (const ang of [0.6, -0.6, 1.1, -1.1]) { const c = Math.cos(ang), s2 = Math.sin(ang); if (tenta(ux * c - uz * s2, ux * s2 + uz * c, false)) { ok = true; break; } }
      if (!ok && esp > 2.6) ok = tenta(ux, uz, true);
      if (!ok && esp > 2.6 && !livreEst(A.x + ux * v, A.z + uz * v)) { const fim = R[R.length - 1]; A.rotaM = caminho(A.x, A.z, fim.x, fim.z); A.esperaM = 0; }
      A.andando = ok; A.correndo = false; A.esperaM = ok ? Math.max(0, esp - dt * 2) : esp + dt;
      return false;
    }

    // ---------------------------------------------------------------- entrou / saiu
    function entrou(R) {
      const s = S(); M.R = R; M.D = R.mercado || null; if (!M.D) return;
      s.falantesExtra = s.falantesExtra || {}; M.nav = null; montarNav();
      M.avisos = []; M.tAviso = 0;
      tickPessoal('cadu', estadoCadu, criarCadu, T('Cadu'), 2, 0, true);
      tickPessoal('rosa', estadoRosa, criarRosa, T('Rosa'), 0, 0, true);
      for (const sec of SECOES) mostrarEstoque(sec);
      SOM.porta();
    }
    function saiu() {
      const s = S();
      if (s.turnoMercado && !s.turnoMercado.fim) { s.turnoMercado.fim = true; fecharUI(); }
      limparEsteira(); tirarCaixaDaMao();
      for (const k of Object.keys(M.marcas)) { const mk = M.marcas[k]; if (mk && mk.parent) mk.parent.remove(mk); } M.marcas = {};
      if (s.falantesExtra) { delete s.falantesExtra.cadu; delete s.falantesExtra.rosa; }
      if (M.tAviso > 0 || M.avisos.length) api.aviso('');               // o aviso "Cadu: ..." não vai junto para a rua
      M.R = null; M.D = null; M.cadu = null; M.rosa = null; M.nav = null; M.avisos = []; M.tAviso = 0;
    }
    function mostrarEstoque(sec) {
      const R = M.R; if (!R || !R.estoque || !R.estoque[sec]) return;
      const n = Math.ceil(clampN(dadosM().estoque[sec], 0, EST_MAX) / EST_MAX * R.estoque[sec].length);
      R.estoque[sec].forEach((m, i) => { m.visible = i < n; });
    }

    // ---------------------------------------------------------------- interação
    function alvos(v) {
      const s = S(), J = s.jog, U = s.turnoMercado, D = M.D; if (!D) return;
      const C = M.cadu; if (C && C.estM !== 'sai' && !(C.rotaM && C.rotaM.length)) v.push({ x: C.x, z: C.z, r: 1.7, txt: T('Falar com o Cadu'), fn: falarComCadu, y: 2.5 });
      if (!U || U.fim) return;
      const cx = D.caixa.jog, prim = U.fila[0];
      if (prim && prim.cm.fase === 'esteira') v.push({ x: cx.x, z: cx.z, r: 1.5, txt: J.caixaM ? T('Largue a caixa antes de atender.') : T('Atender cliente'), fn: J.caixaM ? async () => {} : () => atender(prim), y: 2.3, pri: true });
      for (const E of (M.R.mercadoEstoque || [])) {
        if (J.caixaM === E.sec) v.push({ x: E.x, z: E.z, r: 1.3, txt: T('Devolver caixa'), fn: async () => { tirarCaixaDaMao(); SOM.caixa(); }, y: 1.9, pri: true });
        else v.push({ x: E.x, z: E.z, r: 1.3, txt: Tf('Pegar caixa: {0}', T(NOME_SEC[E.sec])), fn: () => pegarCaixa(E.sec), y: 1.9 });
      }
      if (J.caixaM) { const P = D.secoes[J.caixaM]; v.push({ x: P.x, z: P.z, r: 1.6, txt: Tf('Repor: {0}', T(NOME_SEC[J.caixaM])), fn: () => repor(J.caixaM), y: 2.4, pri: true }); }
    }
    async function pegarCaixa(sec) {
      const J = S().jog;
      if (J.caixaM) { api.aviso(T('Você já está com uma caixa. Leve até a seção ou devolva no estoque.')); setTimeout(() => api.aviso(''), 2400); return; }
      if (dadosM().estoque[sec] >= EST_MAX) { api.aviso(T('Essa seção ainda está cheia.')); setTimeout(() => api.aviso(''), 2000); return; }
      SOM.caixa(); darCaixaNaMao(sec);
    }
    async function repor(sec) {
      const s = S(), J = s.jog, P = M.D.secoes[sec];
      J.yawAlvo = Math.atan2(-(P.z - J.z), P.x - J.x);
      await api.esperar(500); SOM.caixa(); await api.esperar(700);
      dadosM().estoque[sec] = EST_MAX; mostrarEstoque(sec); tirarCaixaDaMao(); SOM.certo();
      if (s.turnoMercado) s.turnoMercado.repor.delete(sec); atualizarMarcas();
      api.aviso(T('Seção reabastecida!')); setTimeout(() => api.aviso(''), 1600);
    }
    function darCaixaNaMao(sec) {
      const J = S().jog; tirarCaixaDaMao();
      const G = new api.Geo(); G.box(0.42, 0.34, 0.5, '#c89a64', 0, 0, 0, '#d8b080'); G.box(0.43, 0.06, 0.51, COR_SEC[sec], 0, 0.2, 0);
      const m = G.malha(api.MAT); m.position.set(0.42, 0.78, 0); J.m.corpo.add(m); J.caixaMesh = m; J.caixaM = sec;
    }
    function tirarCaixaDaMao() { const s = S(); if (!s) return; const J = s.jog; if (J.caixaMesh && J.caixaMesh.parent) J.caixaMesh.parent.remove(J.caixaMesh); J.caixaMesh = null; J.caixaM = null; }
    function poseCaixa(J) {
      if (!J.caixaM) return;
      const m = J.m; m.bracoE.rotation.z = m.bracoD.rotation.z = 1.15; m.bracoE.rotation.x = 0.18; m.bracoD.rotation.x = -0.18;
      usarCotovelo(m.bracoE, 0, 0.55); usarCotovelo(m.bracoD, 0, 0.55);
    }

    // ---- conversa com o Cadu (apresentação na primeira vez, depois a oferta do turno)
    async function falarComCadu() {
      const s = S(), d = s.dados, dm = dadosM(), C = M.cadu, J = s.jog;
      if (C) { C.yawAlvo = Math.atan2(-(J.z - C.z), J.x - C.x); C.poseM = null; }
      const h1 = api.historia().ler('fase1') || {}, cad = h1.cadu || null, salvou = !!(cad && cad.salvou);
      const fim = () => { Dialogo.esconder(); };
      if (!ehMeuEmprego()) {
        await api.fala('cadu', salvou ? T('Ei... você não é aquele que me tirou do armário lá na escola? Valeu de novo, viu!') : T('Oi! Bem-vindo ao Mercadinho Bom Preço! Qualquer coisa, é só chamar.'));
        fim(); return;
      }
      if (!dm.apresentou) {
        if (salvou) {
          await api.fala('cadu', Tf('Espera aí... {0}?! É você mesmo?!', api.nomeJog()));
          await api.fala('cadu', T('Você me tirou daquele armário na escola, lembra? Eu nunca esqueci isso.'));
          if (cad.conversou) await api.fala('cadu', T('E ainda veio conversar comigo depois. Pouca gente fazia isso.'));
          await api.fala('jog', T('Cadu?! Quanto tempo!'));
          await api.fala('cadu', T('Esse mercado é do meu pai. Eu tô ajudando ele em algumas coisas por aqui.'));
          await api.fala('cadu', T('E por aquele dia na escola... vou aumentar o seu salário em 15 fakes. É o mínimo!'));
          dm.aumento = true;
        } else await api.fala('cadu', T('Você me parece familiar... mas não sei bem de onde.'));
        await api.fala('cadu', T('O expediente é das 14h às 22h. Você fica no caixa: passa as compras, recebe e dá o troco certinho, ou passa na maquininha.'));
        await api.fala('cadu', T('Quando faltar mercadoria numa seção, pega a caixa certa no estoque, ali no fundo, e repõe na seção.'));
        await api.fala('cadu', Tf('O salário é {0} fakes pelo turno. Cada troco errado desconta {1} fakes.', salario(), DESCONTO));
        dm.apresentou = true; api.gravar('chegada');
      }
      fim();
      if (s.turnoMercado) { await api.fala('cadu', T('Bom trabalho! O caixa é seu.')); fim(); return; }
      if ((d.dia || 1) < 2) { await api.fala('cadu', T('Você começa amanhã! O expediente é das 14h às 22h.')); fim(); return; }
      if (fimDeSemana()) { await api.fala('cadu', T('Hoje é fim de semana, o mercado fica com o meu pai. Descansa e volta segunda!')); fim(); return; }
      if (d.trabalhouHoje) { await api.fala('cadu', T('Seu turno de hoje já acabou. Até amanhã!')); fim(); return; }
      if (d.precisaBanho) { await api.fala('cadu', T('Eita... você tá com cheiro de quem acabou de jogar bola! Vai em casa, toma um banho e depois volta, beleza?')); fim(); return; }
      if (hora() < H_TURNO - 0.25) { await api.fala('cadu', T('Seu turno começa às 14h. Chega um pouquinho antes que eu libero o caixa pra você!')); fim(); return; }
      if (hora() >= H_ULTIMO_CLIENTE) { await api.fala('cadu', T('Já tá quase na hora de fechar, hoje não dá mais. Amanhã às 14h, hein!')); fim(); return; }
      const r = await Escolha.mostrar(T('Quer começar o seu turno no caixa agora?'), [T('Sim, vamos trabalhar'), T('Ainda não')], { centro: true });
      fim(); if (r !== 0) return;
      await liberarRosa();
      await iniciarTurno();
    }
    // (5.4.0) o Cadu libera a Rosa: ela se despede e sai; a tela corta para o expediente
    async function liberarRosa() {
      const R = M.rosa;
      if (R) {
        const C = M.cadu; if (C) C.yawAlvo = Math.atan2(-(R.z - C.z), R.x - C.x);
        R.poseM = null; R.yawAlvo = C ? Math.atan2(-(C.z - R.z), C.x - R.x) : R.yawAlvo;
        await api.fala('cadu', T('Rosa, você tá liberada do expediente já.'));
        await api.fala('rosa', T('Beleza! Bom trabalho aí, viu?'));
        Dialogo.esconder();
      }
      dadosM().rosaLib = { dia: S().dados.dia, h: hora() };              // a partir de agora ela vai para casa (na rua também)
      if (R) { for (let t = 0; t < 3.2 && M.rosa; t += 0.1) await api.esperar(100); }
    }

    // ================================================================ O TURNO
    async function iniciarTurno() {
      const s = S(), D = M.D;
      s.turnoMercado = { fila: [], atendidos: 0, erros: 0, faltas: 0, prox: 2, fim: false, repor: new Set(), inicio: s.dados.hora };
      s.trabalhando = true;
      for (const A of s.npcs) if (A.cli && A.cli.fase === 'fica') A.cli.t = Math.min(A.cli.t, 2 + Math.random() * 8);
      await api.preto(true, 350);
      if (M.rosa) tirar('rosa');                                          // (se ela ainda estava saindo)
      const J = s.jog, p = D.caixa.jog; J.x = p.x; J.z = p.z; J.yaw = J.yawAlvo = p.yaw; J.rota = null; s.cam.yaw = 2.55; s.cam.snap = true;   // câmera do lado nordeste: vê o caixa, a fila e o corredor
      await api.preto(false, 350);
      montarPainel(); atualizarPainel();
      for (const sec of SECOES) if (dadosM().estoque[sec] <= REPOR_EM) s.turnoMercado.repor.add(sec);
      atualizarMarcas();
      api.aviso(T('Fique no caixa: atenda quem estiver na fila e reponha as seções quando o jogo pedir.')); setTimeout(() => { const ss = S(); if (ss && ss.turnoMercado && !M.avisos.length) api.aviso(''); }, 5000);
    }
    function ritmo() { const f = ['vazio', 'vazio', 'vazio', 'medio', 'cheio', 'cheio', 'cheio'][api.diaSemana()]; return f === 'vazio' ? [13, 19] : f === 'medio' ? [10, 15] : [7, 11]; }
    function tickTurno(dt) {
      const s = S(), U = s.turnoMercado; if (!U || U.fim) return;
      if (s.dados.hora >= H_FECHA) { encerrar(false); return; }
      U.prox -= dt;
      const ativos = s.npcs.filter((A) => A.cm && A.cm.fase !== 'sai').length;
      if (U.prox <= 0) {
        const [a, b] = ritmo(); U.prox = rnd(a, b);
        if (ativos < 6 && U.fila.length < 4 && s.dados.hora < H_ULTIMO_CLIENTE) novoCliente();   // (5.4.0) depois das 21h não entra mais ninguém
      }
      atualizarPainel();
    }
    function entradaLivre() {
      const s = S(), e = M.R.entrada;
      return [[0, 0], [1.1, 0], [-1.1, 0], [0, -1.1]].map(([dx, dz]) => ({ x: e.x + dx, z: e.z + dz })).find((q) => Math.hypot(q.x - s.jog.x, q.z - s.jog.z) > 0.9 && livreEst(q.x, q.z) && !genteNaFrente({ x: 99, z: 99 }, q.x, q.z)) || null;
    }
    function novoCliente() {
      const s = S(), e = entradaLivre(); if (!e) return;
      const nSec = Math.random() < 0.55 ? 1 : 2, secs = SECOES.slice().sort(() => Math.random() - 0.5).slice(0, nSec);
      const A = api.criarPessoa(s.f2, Math.random, Math.random() < 0.5);
      A.tipo = 'clienteMerc'; A.x = e.x; A.z = e.z; A.yaw = A.yawAlvo = Math.PI / 2; A.vel = 1.15 + Math.random() * 0.3;
      A.cm = { fase: 'compra', secs, itens: [], t: 0 };
      proximaCompra(A); s.npcs.push(A); api.poseAtor(A, 0.016); SOM.porta();
    }
    function proximaCompra(A) {
      const C = A.cm, D = M.D;
      if (!C.secs.length) { entrarNaFila(A); return; }
      const sec = C.secs.shift(), ar = D.secoes[sec].compra, p = pontoLivre(rnd(ar.x0, ar.x1), rnd(ar.z0, ar.z1));
      C.secAtual = sec; C.fase = 'compra'; C.chegou = false; C.t = 0; A.rotaM = caminho(A.x, A.z, p.x, p.z);
    }
    function pegarProdutos(A) {
      const C = A.cm, sec = C.secAtual, est = dadosM().estoque, quer = 1 + Math.floor(Math.random() * 3), n = Math.min(est[sec], quer);
      for (let i = 0; i < n; i++) { const P = pk(PRODUTOS[sec]); C.itens.push({ nome: P[0], preco: P[1], P, sec }); }
      est[sec] -= n; mostrarEstoque(sec);
      const U = S().turnoMercado;
      if (U && n < quer) {                                               // (5.4.0) queria e não tinha na prateleira: −3 fakes
        U.faltas++; atualizarPainel(); SOM.erro();
        api.aviso(Tf('Faltou {0} na prateleira! (−{1} fakes)', T(NOME_SEC[sec]).toLowerCase(), FALTA)); setTimeout(() => { const ss = S(); if (ss && ss.turnoMercado && !M.avisos.length) api.aviso(''); }, 2600);
      }
      if (U && est[sec] <= REPOR_EM && !U.repor.has(sec)) {
        U.repor.add(sec); atualizarMarcas();
        if (n >= quer) { api.aviso(Tf('Repor {0} {1}!', T(NOME_SEC[sec]).toUpperCase(), T(ONDE_SEC[sec]))); setTimeout(() => { const ss = S(); if (ss && ss.turnoMercado && !M.avisos.length) api.aviso(''); }, 3200); }
      }
    }
    function entrarNaFila(A) {
      const U = S().turnoMercado;
      if (!A.cm.itens.length || !U || U.fim) { sairCliente(A); return; }
      U.fila.push(A); A.cm.fase = 'fila'; posicionarFila();
    }
    function posicionarFila() {
      const U = S().turnoMercado, F = M.D.fila; if (!U) return;
      U.fila.forEach((A, i) => {
        const p = i < F.length ? F[i] : (A.cm.extraFila && A.cm.extraFila.i === i ? A.cm.extraFila : (A.cm.extraFila = { i, x: F[F.length - 1].x, z: F[F.length - 1].z - 1.1 * (i - F.length + 1) }));   // fila maior: continua a linha
        if (A.cm.alvoFila !== p) { A.cm.alvoFila = p; A.rotaM = caminho(A.x, A.z, p.x, p.z); }
        if (A.cm.fase === 'esteira' && i > 0) A.cm.fase = 'fila';
      });
    }
    function sairCliente(A) {
      const D = M.D, sd = M.R.saida; A.cm.fase = 'sai'; A.cm.tSai = 0;
      const r1 = caminho(A.x, A.z, D.depois.x, D.depois.z), ult = r1[r1.length - 1] || A;
      A.rotaM = r1.concat(caminho(ult.x, ult.z, sd.x, sd.z));
    }
    function tickCliente(A, dt) {
      const C = A.cm; if (!C || !M.D) return;
      if (C.fase === 'compra') {
        if (!C.chegou) { if (andarM(A, dt)) { C.chegou = true; C.t = rnd(2.2, 4.2); const P = M.D.secoes[C.secAtual]; A.yawAlvo = Math.atan2(-(P.z - A.z), P.x - A.x) + rnd(-0.6, 0.6); } return; }
        A.andando = false; C.t -= dt;
        if (C.t <= 0) { pegarProdutos(A); proximaCompra(A); }
      } else if (C.fase === 'fila' || C.fase === 'esteira') {
        const U = S().turnoMercado, i = U ? U.fila.indexOf(A) : -1;
        if (andarM(A, dt)) {
          A.andando = false; A.yawAlvo = i === 0 ? 0 : -Math.PI / 2;
          if (i === 0 && C.fase === 'fila') { C.fase = 'esteira'; porNaEsteira(A); }
        }
      } else if (C.fase === 'pago') {
        C.t -= dt; A.andando = false; if (C.t <= 0) sairCliente(A);
      } else if (C.fase === 'sai') {
        C.tSai += dt; const sd = M.R.saida;
        if (andarM(A, dt) || Math.hypot(A.x - sd.x, A.z - sd.z) < 0.9 || C.tSai > 30) { tirarSacola(A); api.descartarPessoa(A); }
      }
    }
    // os produtos aparecem na esteira (com a pixel art de cada um), em fila, do começo dela até o leitor
    function texProduto(P) {
      if (M.tex.has(P[0])) return M.tex.get(P[0]);
      const t = new THREE.CanvasTexture(canvasProduto(P)); t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; M.tex.set(P[0], t); return t;
    }
    function porNaEsteira(A) {
      limparEsteira();
      const E = M.D.caixa.esteira, n = A.cm.itens.length, s = S();
      A.cm.itens.forEach((it, i) => {
        const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: texProduto(it.P), transparent: true, alphaTest: 0.5 })); sp.scale.set(0.3, 0.3, 1);
        sp.position.set(E.x + (Math.random() - 0.5) * 0.2, E.y + 0.15, E.z0 + (E.z1 - E.z0) * (n > 1 ? i / (n - 1) : 0.5)); s.grupo.add(sp); M.esteiraM.push(sp);
      });
    }
    function limparEsteira() { for (const m of M.esteiraM) { if (m.parent) m.parent.remove(m); if (m.material) m.material.dispose(); } M.esteiraM = []; }
    function darSacola(A) { tirarSacola(A); const G = new api.Geo(); G.box(0.22, 0.3, 0.14, '#f4f4f0', 0, -0.32, 0); G.box(0.02, 0.08, 0.1, '#c8352b', 0.11, -0.18, 0); const m = G.malha(api.MAT); A.m.bracoE.cotovelo.add(m); A.sacola = m; }
    function tirarSacola(A) { if (A.sacola && A.sacola.parent) A.sacola.parent.remove(A.sacola); A.sacola = null; }

    // ---- marcas "!" em cima das seções que precisam de reposição
    function atualizarMarcas() {
      const s = S(), U = s.turnoMercado, D = M.D; if (!D) return;
      for (const sec of SECOES) {
        const quer = !!(U && !U.fim && U.repor.has(sec));
        let mk = M.marcas[sec];
        if (quer && !mk) {
          const cv = document.createElement('canvas'); cv.width = 16; cv.height = 20; const g = cv.getContext('2d');
          g.fillStyle = '#2a1206'; g.fillRect(3, 0, 10, 20); g.fillStyle = COR_SEC[sec]; g.fillRect(4, 1, 8, 18); g.fillStyle = '#fff6e0'; g.fillRect(7, 3, 2, 9); g.fillRect(7, 14, 2, 3);
          const tx = new THREE.CanvasTexture(cv); tx.magFilter = tx.minFilter = THREE.NearestFilter;
          mk = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, depthTest: false, transparent: true })); mk.scale.set(0.45, 0.56, 1); mk.renderOrder = 20;
          mk.position.set(D.secoes[sec].x, 2.7, D.secoes[sec].z); s.grupo.add(mk); M.marcas[sec] = mk;
        } else if (!quer && mk) { if (mk.parent) mk.parent.remove(mk); M.marcas[sec] = null; }
      }
    }

    // ================================================================ O CAIXA (o joguinho)
    async function atender(A) {
      const s = S(), J = s.jog, D = M.D;
      J.yawAlvo = D.caixa.jog.yaw; A.cm.fase = 'caixa';
      const ok = await abrirCaixa(A);
      limparEsteira();
      const U = s.turnoMercado; if (!U || U.fim) return;
      U.fila = U.fila.filter((q) => q !== A); posicionarFila();
      if (ok) { U.atendidos++; darSacola(A); A.cm.fase = 'pago'; A.cm.t = 0.6; }
      else { A.cm.fase = 'esteira'; U.fila.unshift(A); posicionarFila(); porNaEsteira(A); }   // fechou no meio: o cliente continua esperando
      atualizarPainel();
    }
    // (5.4.0) como o cliente paga (tudo em centavos): cartão = valor exato; dinheiro = total arredondado para múltiplo de 5 centavos,
    //   com notas que cubram o valor e, às vezes, os centavos em moeda (para facilitar o troco)
    function pagamentoDe(total) {
      if (M.forcarPag !== 'dinheiro' && (M.forcarPag === 'cartao' || Math.random() < 0.42)) return { tipo: 'cartao', total, cartao: Math.floor(Math.random() * CARTOES.length) };
      const T5 = Math.max(5, Math.round(total / 5) * 5), opcoes = [];
      for (const v of [200, 500, 1000, 2000, 5000, 10000]) if (v >= T5) { opcoes.push([v]); break; }
      { const m10 = Math.ceil(T5 / 1000) * 1000; const ns = []; let r = m10; for (const v of [10000, 5000, 2000, 1000]) while (r >= v) { ns.push(v); r -= v; } if (!r && ns.length <= 3) opcoes.push(ns); }
      if (T5 <= 5000) opcoes.push([5000]); else opcoes.push([10000]);
      if (T5 <= 2000) opcoes.push([2000]);
      const notas = pk(opcoes.filter((ns) => ns.reduce((a, b) => a + b, 0) >= T5)).slice().sort((a, b) => b - a);
      const itens = notas.slice(); let pago = notas.reduce((a, b) => a + b, 0);
      const cent = T5 % 100;
      if (cent && Math.random() < 0.35 && pago - T5 >= 100) { let r = cent; for (const v of [50, 25, 10, 5]) while (r >= v) { itens.push(v); r -= v; } pago += cent; }   // "toma os centavos, pra facilitar"
      return { tipo: 'dinheiro', total: T5, itens, pago };
    }
    function abrirCaixa(A) {
      return new Promise((res) => {
        const s = S(), U = s.turnoMercado, itens = A.cm.itens.map((it) => Object.assign({ passado: false }, it));
        let total = 0, pag = null, mao = [], fim = false;
        const peq = (window.innerHeight || 400) < 430;                   // celular deitado: tudo um pouco menor para caber
        const el = document.createElement('div'); el.id = 'mcCaixa';
        el.style.cssText = 'position:fixed;inset:0;z-index:22;display:grid;place-items:center;background:rgba(6,4,2,.55);padding:max(6px,env(safe-area-inset-top,0px)) max(8px,env(safe-area-inset-right,0px)) max(6px,env(safe-area-inset-bottom,0px)) max(8px,env(safe-area-inset-left,0px));box-sizing:border-box;';
        const card = document.createElement('div');
        card.style.cssText = 'display:grid;grid-template-columns:minmax(150px,1fr) minmax(130px,180px) minmax(200px,1.3fr);gap:8px;width:min(920px,100%);max-height:100%;overflow:auto;background:#2a1206;border:4px solid #c8352b;color:#fff0c8;padding:' + (peq ? 6 : 8) + 'px;box-sizing:border-box;font-family:var(--font-body);';
        const col = () => { const c = document.createElement('div'); c.style.cssText = 'display:flex;flex-direction:column;gap:' + (peq ? 4 : 6) + 'px;min-width:0;background:#3a1c0a;border:3px solid #4a2c14;padding:' + (peq ? 4 : 6) + 'px;position:relative;'; return c; };
        const tit = (t) => { const h = document.createElement('div'); h.style.cssText = 'font:700 11px/1.2 var(--font-display);letter-spacing:.06em;text-transform:uppercase;color:#f0a020;'; h.textContent = t; return h; };
        // 1) a esteira (os produtos com a pixel art)
        const cE = col(), lista = document.createElement('div'); lista.style.cssText = 'display:flex;flex-wrap:wrap;gap:5px;align-content:flex-start;min-height:60px;';
        const dicaE = document.createElement('div'); dicaE.style.cssText = 'font:400 11px/1.3 var(--font-body);color:#d8c8a8;'; dicaE.textContent = T('Toque em cada produto para passar no leitor.');
        cE.append(tit(T('Esteira')), dicaE, lista);
        // 2) o visor (lista do que passou e o total)
        const cV = col(); cV.style.background = '#14200f'; cV.style.borderColor = '#2f4a22';
        const linhas = document.createElement('div'); linhas.style.cssText = 'flex:1 1 auto;min-height:40px;max-height:' + (peq ? 120 : 160) + 'px;overflow:auto;font:400 10px/1.35 monospace;color:#9be070;';
        const tot = document.createElement('div'); tot.style.cssText = 'font:700 16px/1.1 monospace;color:#c8ff8a;text-align:right;border-top:2px dashed #2f4a22;padding-top:4px;';
        const totD = document.createElement('div'); totD.style.cssText = 'font:700 10px/1.2 monospace;color:#f2c230;text-align:right;min-height:12px;';
        cV.append(tit(T('Caixa')), linhas, tot, totD);
        // 3) o pagamento
        const cP = col(), corpoP = document.createElement('div'); corpoP.style.cssText = 'display:flex;flex-direction:column;gap:' + (peq ? 4 : 6) + 'px;';
        const msg = document.createElement('div'); msg.style.cssText = 'min-height:14px;font:700 11px/1.3 var(--font-display);';
        const topoP = document.createElement('div'); topoP.style.cssText = 'display:flex;justify-content:space-between;align-items:center;gap:6px;';
        const btnFechar = document.createElement('button'); btnFechar.type = 'button'; btnFechar.className = 'pxBtn'; btnFechar.textContent = T('Fechar'); btnFechar.style.cssText = '--p:var(--p2,2px);min-height:24px;font-size:9px;padding:0 8px;';
        topoP.append(tit(T('Pagamento')), btnFechar);
        cP.append(topoP, corpoP, msg);
        card.append(cE, cV, cP); el.appendChild(card); (document.getElementById('raizJogo') || document.body).appendChild(el);
        const mensagem = (t, cor) => { msg.textContent = t || ''; msg.style.color = cor || '#fff0c8'; };
        const fechar = (ok) => { if (fim) return; fim = true; clearInterval(vigia); el.remove(); res(ok); };
        const concluir = () => { fim = true; clearInterval(vigia); setTimeout(() => { el.remove(); res(true); }, 900); };
        btnFechar.onclick = () => { api.som(); fechar(false); };
        const vigia = setInterval(() => { const ss = S(); if (!ss || !ss.ativo || !ss.turnoMercado || ss.turnoMercado.fim) fechar(false); }, 250);

        function desenharEsteira() {
          lista.innerHTML = '';
          itens.forEach((it) => {
            if (it.passado) return;
            const b = document.createElement('button'); b.type = 'button'; b.dataset.prod = '1';
            b.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:2px;width:' + (peq ? 64 : 72) + 'px;padding:3px 2px;background:#2a1206;border:2px solid #8a5a2a;color:#fff0c8;cursor:pointer;font:700 8px/1.1 var(--font-display);';
            b.appendChild(iconeProduto(it.P, peq ? 30 : 36)); const n = document.createElement('span'); n.textContent = T(it.nome); b.appendChild(n);
            b.onclick = () => passar(it); lista.appendChild(b);
          });
        }
        function desenharVisor() {
          linhas.innerHTML = itens.filter((it) => it.passado).map((it) => '<div style="display:flex;justify-content:space-between;gap:6px"><span>' + esc(T(it.nome)) + '</span><span>' + fmt(it.preco).replace('F$ ', '') + '</span></div>').join('');
          linhas.scrollTop = linhas.scrollHeight;
          tot.textContent = T('TOTAL') + ' ' + fmt(total);
        }
        function passar(it) {
          if (it.passado || fim) return;
          it.passado = true; total += it.preco; SOM.bip();
          const m = M.esteiraM.pop(); if (m && m.parent) { m.parent.remove(m); if (m.material) m.material.dispose(); }   // o produto sai da esteira 3D
          desenharEsteira(); desenharVisor();
          if (itens.every((q) => q.passado)) setTimeout(() => { if (!fim) cobrar(); }, 450);
        }
        function cobrar() {
          dicaE.textContent = ''; pag = pagamentoDe(total);
          if (pag.tipo === 'cartao') maquininha(); else dinheiro();
        }
        // ---- DINHEIRO: o que o cliente deu, o troco e a gaveta (notas e moedas)
        function dinheiro() {
          const troco = pag.pago - pag.total; corpoP.innerHTML = '';
          if (pag.total !== total) totD.textContent = Tf('Em dinheiro (arredondado): {0}', fmt(pag.total));
          const l1 = document.createElement('div'); l1.style.cssText = 'font:400 11px/1.2 var(--font-body);'; l1.textContent = T('O cliente pagou com:');
          const ns = document.createElement('div'); ns.style.cssText = 'display:flex;gap:4px;flex-wrap:wrap;align-items:center;'; for (const v of pag.itens) ns.appendChild(desenharDinheiro(v, peq ? 44 : 56));
          const info = document.createElement('div'); info.style.cssText = 'font:700 12px/1.3 var(--font-display);'; info.innerHTML = esc(Tf('Recebido: {0}', fmt(pag.pago))) + '<br><span style="color:#8fe04a;font-size:15px">' + esc(Tf('TROCO: {0}', fmt(troco))) + '</span>';
          const g = document.createElement('div'); g.style.cssText = 'font:700 10px/1.2 var(--font-display);color:#f0a020;'; g.textContent = T('Gaveta (toque nas notas e moedas)');
          const gaveta = document.createElement('div'); gaveta.style.cssText = 'display:flex;flex-direction:column;gap:4px;background:#1f0f06;border:2px solid #4a2c14;padding:4px;';
          const linhaN = document.createElement('div'), linhaM = document.createElement('div');
          linhaN.style.cssText = linhaM.style.cssText = 'display:flex;gap:4px;flex-wrap:wrap;align-items:center;';
          const botao = (v, larg, alvo) => { const b = document.createElement('button'); b.type = 'button'; b.dataset.v = v; b.style.cssText = 'padding:0;border:0;background:none;cursor:pointer;'; b.appendChild(desenharDinheiro(v, larg)); b.onclick = () => { if (fim) return; mao.push(v); (ehMoeda(v) ? SOM.moeda : SOM.nota)(); desenharMao(); }; alvo.appendChild(b); };
          for (const v of GAVETA_NOTAS) botao(v, peq ? 46 : 54, linhaN);
          for (const v of GAVETA_MOEDAS) botao(v, peq ? 56 : 64, linhaM);
          gaveta.append(linhaN, linhaM);
          const naMaoT = document.createElement('div'); naMaoT.style.cssText = 'font:700 11px/1.2 var(--font-display);';
          const naMao = document.createElement('div'); naMao.style.cssText = 'display:flex;gap:3px;flex-wrap:wrap;min-height:22px;align-items:center;';
          const dica = document.createElement('div'); dica.style.cssText = 'font:400 10px/1.2 var(--font-body);color:#c8b898;'; dica.textContent = T('Toque numa nota da mão para devolver à gaveta.');
          const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'pxBtn pxPrim'; btn.style.cssText = '--p:var(--p2,2px);min-height:32px;font-size:11px;';
          btn.textContent = troco === 0 ? T('Sem troco: concluir') : T('Entregar troco');
          function desenharMao() {
            naMao.innerHTML = ''; const soma = mao.reduce((a, b) => a + b, 0); naMaoT.textContent = Tf('Na sua mão: {0}', fmt(soma));
            mao.forEach((v, i) => { const b = document.createElement('button'); b.type = 'button'; b.style.cssText = 'padding:0;border:0;background:none;cursor:pointer;'; b.appendChild(desenharDinheiro(v, peq ? 32 : 40)); b.onclick = () => { if (fim) return; mao.splice(i, 1); SOM.nota(); desenharMao(); }; naMao.appendChild(b); });
          }
          btn.onclick = () => {
            if (fim) return; const soma = mao.reduce((a, b) => a + b, 0);
            if (soma === troco) { SOM.certo(); api.somCaixa(); mensagem(T('Troco certo! Obrigado!'), '#8fe04a'); concluir(); return; }
            U.erros++; SOM.erro(); atualizarPainel();
            mensagem(soma < troco ? Tf('Opa, tá faltando troco! (−{0} fakes)', DESCONTO) : Tf('Você me deu troco a mais! (−{0} fakes)', DESCONTO), '#ff8a6a');
          };
          if (peq) { dica.style.display = 'none'; l1.style.display = 'none'; }
          if (troco === 0) { gaveta.style.display = 'none'; g.style.display = 'none'; dica.style.display = 'none'; naMaoT.style.display = 'none'; }
          corpoP.append(l1, ns, info, g, gaveta, naMaoT, naMao, dica, btn); desenharMao();
        }
        // ---- CARTÃO: digitar o valor com os centavos na maquininha, apertar OK e o cartão chega perto
        function maquininha() {
          corpoP.innerHTML = ''; let dig = '';
          const linha = document.createElement('div'); linha.style.cssText = 'display:flex;gap:8px;align-items:flex-start;justify-content:center;flex-wrap:wrap;';
          const maq = document.createElement('div'); maq.style.cssText = 'background:#1c1c1f;border:3px solid #0a0a0c;padding:5px;display:flex;flex-direction:column;gap:4px;width:' + (peq ? 150 : 180) + 'px;position:relative;';
          const visor = document.createElement('div'); visor.style.cssText = 'background:#9fc47a;color:#14200f;font:700 15px/1.2 monospace;padding:3px 6px;text-align:right;min-height:20px;border:2px solid #4a6a2a;';
          const estado = document.createElement('div'); estado.style.cssText = 'font:700 9px/1.2 monospace;color:#9fc47a;min-height:11px;text-align:center;';
          const kp = document.createElement('div'); kp.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:3px;';
          const tecla = (t, fn, cor) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = t; b.dataset.tecla = t; b.style.cssText = 'min-height:' + (peq ? 24 : 28) + 'px;background:' + (cor || '#3a3a3e') + ';color:#fff;border:2px solid #0a0a0c;font:700 13px/1 monospace;cursor:pointer;'; b.onclick = () => { if (!fim) fn(); }; kp.appendChild(b); };
          const mostrar = () => { visor.textContent = fmt(+dig || 0).replace('F$ ', ''); };
          for (const n of ['1', '2', '3', '4', '5', '6', '7', '8', '9']) tecla(n, () => { if (dig.length < 6) dig += n; SOM.tecla(); mostrar(); estado.textContent = ''; });
          tecla('⌫', () => { dig = dig.slice(0, -1); SOM.tecla(); mostrar(); }, '#a8442a'); tecla('0', () => { if (dig && dig.length < 6) dig += '0'; SOM.tecla(); mostrar(); });
          tecla('OK', () => {
            if (+dig === pag.total) { kp.style.pointerEvents = 'none'; aproximarCartao(); }
            else { SOM.erro(); estado.textContent = T('VALOR INCORRETO'); dig = ''; mostrar(); }
          }, '#1f7a4d');
          // o cartão do cliente: chega de lado, encosta na maquininha (ondinhas de aproximação) e aprova
          const cart = document.createElement('div'); cart.style.cssText = 'position:absolute;right:-8px;top:-6px;opacity:0;transform:translate(90px,-30px) rotate(18deg);transition:transform .55s cubic-bezier(.2,.8,.3,1),opacity .3s;pointer-events:none;z-index:2;';
          cart.appendChild(desenharCartao(pag.cartao, peq ? 74 : 92));
          const ondas = document.createElement('div'); ondas.style.cssText = 'position:absolute;left:50%;top:-4px;transform:translateX(-50%);font:700 16px/1 monospace;color:#8fe04a;opacity:0;pointer-events:none;letter-spacing:-2px;';
          ondas.textContent = ')))';
          function aproximarCartao() {
            estado.textContent = T('APROXIME O CARTÃO');
            cart.style.opacity = '1'; requestAnimationFrame(() => { cart.style.transform = 'translate(-4px,-30px) rotate(-8deg)'; });   // encosta em cima da maquininha (sem tapar o visor)
            setTimeout(() => { if (fim) return; SOM.aprox(); ondas.style.opacity = '1'; ondas.animate([{ transform: 'translateX(-50%) scale(.6)', opacity: 1 }, { transform: 'translateX(-50%) scale(1.5)', opacity: 0 }], { duration: 420, iterations: 3 }); }, 560);
            setTimeout(() => { if (fim) return; estado.textContent = T('APROVADO'); SOM.aprovado(); mensagem(T('Obrigado, até mais!'), '#8fe04a'); cart.style.transform = 'translate(90px,-10px) rotate(14deg)'; cart.style.opacity = '0'; concluir(); }, 1900);
          }
          const d1 = document.createElement('div'); d1.style.cssText = 'font:400 11px/1.3 var(--font-body);color:#d8c8a8;'; d1.textContent = T('Digite o valor com os centavos e aperte OK.');
          const l1 = document.createElement('div'); l1.style.cssText = 'font:700 12px/1.2 var(--font-display);'; l1.textContent = T('Cartão') + ' · ' + T('Maquininha') + ' · ' + fmt(pag.total);
          maq.append(visor, estado, kp, ondas); linha.append(maq); maq.appendChild(cart);
          corpoP.append(l1, d1, linha); mostrar();
        }
        corpoP.innerHTML = '<div style="font:400 11px/1.3 var(--font-body);color:#c8b898">' + esc(T('Esperando passar as compras...')) + '</div>';
        desenharEsteira(); desenharVisor();
      });
    }
    function fecharUI() { const e = document.getElementById('mcCaixa'); if (e) e.remove(); if (M.painel) api.fimPainel(M.painel); }

    // ---- o painel do turno (alto, no meio): hora, atendidos, erros, faltas, o que repor e "Acelerar" — aparece uma vez e vira o ícone "!"
    function montarPainel() {
      if (M.painel) { api.painelRecolhivel(M.painel); return; }
      const p = document.createElement('div'); p.id = 'mcTurno';
      p.style.cssText = 'position:fixed;z-index:9;left:50%;transform:translateX(-50%);top:calc(48px + env(safe-area-inset-top,0px));display:flex;align-items:center;gap:8px;background:rgba(42,18,6,.9);border:3px solid #c8352b;color:#fff0c8;padding:3px 6px 3px 8px;font:700 11px/1.2 var(--font-display);white-space:nowrap;max-width:calc(100% - 24px);';
      p.innerHTML = '<span class="mTxt"></span><span class="mRep" style="display:flex;gap:3px;align-items:center"></span><button type="button" class="pxBtn mAcel" style="--p:var(--p2,2px);min-height:26px;font-size:9px;padding:0 6px"></button>';
      (document.getElementById('raizJogo') || document.body).appendChild(p);
      M.painel = p; M.pTxt = p.querySelector('.mTxt'); M.pRep = p.querySelector('.mRep'); M.pAcel = p.querySelector('.mAcel');
      M.pAcel.textContent = T('Acelerar final do turno');
      M.pAcel.onclick = () => { const s = S(); if (s && s.modo === 'livre' && s.turnoMercado && !s.turnoMercado.fim) { api.som(); s.modo = 'cena'; api.UI().ctl.hidden = true; acelerar().finally(() => { const ss = S(); if (ss && ss.ativo && ss.modo === 'cena') api.liberar(); }); } };
      api.painelRecolhivel(p);
    }
    function atualizarPainel() {
      const s = S(), U = s && s.turnoMercado; if (!U || !M.painel) return;
      const txt = api.fmtHora(s.dados.hora) + ' → ' + api.fmtHora(H_FECHA) + ' · ' + Tf('Atendidos: {0}', U.atendidos) + ' · ' + Tf('Erros: {0}', U.erros) + (U.faltas ? ' · ' + Tf('Faltas: {0}', U.faltas) : '') + (U.repor.size ? ' · ' + T('Repor:') : '');
      if (M.pTxt.textContent !== txt) M.pTxt.textContent = txt;
      const k = [...U.repor].join(','); if (M.pRep.dataset.k !== k) { M.pRep.dataset.k = k; M.pRep.innerHTML = ''; for (const sec of U.repor) { const q = document.createElement('div'); q.style.cssText = 'width:14px;height:14px;background:' + COR_SEC[sec] + ';border:2px solid #2a1206;'; q.title = T(NOME_SEC[sec]); M.pRep.appendChild(q); } }
    }
    async function acelerar() {
      const r = await Escolha.mostrar(T('Acelerar até as 22h? Você recebe só pelas horas trabalhadas até agora.'), [T('Acelerar'), T('Continuar trabalhando')], { centro: true });
      Dialogo.esconder(); const s = S(); if (r !== 0 || !s.turnoMercado || s.turnoMercado.fim) return;
      const h = s.dados.hora; await api.preto(true, 450); s.dados.hora = H_FECHA - 0.01; await encerrar(true, h); await api.preto(false, 450);
    }
    async function sairNoTurno() {
      const r = await Escolha.mostrar(T('Sair agora encerra o seu turno: você recebe só pelas horas trabalhadas.'), [T('Sair mesmo assim'), T('Continuar trabalhando')], { centro: true });
      Dialogo.esconder(); const s = S(); if (r !== 0 || !s.turnoMercado) return;
      await encerrar(true, s.dados.hora); await api.sairDoLugar();
    }
    // ---- fim do turno: paga (proporcional se começou tarde ou parou antes), desconta erros e faltas; o Cadu libera o jogador
    async function encerrar(antes, hParou) {
      const s = S(), U = s.turnoMercado, d = s.dados; if (!U || U.fim) return; U.fim = true;
      const restavam = U.fila.length + s.npcs.filter((A) => A.cm && A.cm.fase !== 'sai' && A.cm.fase !== 'pago').length > 0;
      s.trabalhando = false; fecharUI(); tirarCaixaDaMao(); limparEsteira();
      for (const A of s.npcs.slice()) if (A.cm && A.cm.fase !== 'sai') { tirarSacola(A); sairCliente(A); }
      U.fila = []; atualizarMarcas();
      const ini = Math.max(H_TURNO, U.inicio <= H_CHEIO_ATE ? H_TURNO : U.inicio), fimH = antes ? clampN(hParou, ini, H_FECHA) : H_FECHA;
      const frac = clampN((fimH - ini) / (H_FECHA - H_TURNO), 0, 1), bruto = Math.round(salario() * frac), desc = U.erros * DESCONTO + U.faltas * FALTA, paga = Math.max(0, bruto - desc);
      d.trabalhouHoje = true; d.trabalhouAlgumDia = true; d.fakes += paga; api.somDinheiro(); api.ganhoNaTela(paga); api.mostrarDinheiro(true);   // trabalhouAlgumDia: libera a ligação do João
      api.gravar('chegada');
      const espera = s.modo !== 'livre'; if (!espera) { s.modo = 'cena'; api.UI().ctl.hidden = true; }
      M.avisos = []; M.tAviso = 0; api.aviso('');
      try {
        if (M.cadu) {
          if (!antes) await api.fala('cadu', restavam ? T('Pode deixar que eu atendo esses últimos e fecho o caixa. Não se preocupa, pode ir!') : T('Deu 22h! Pode ir, que eu fecho aqui.'));
          await api.fala('cadu', Tf('Fechou o caixa por hoje! Você atendeu {0} clientes. Toma: {1} fakes.', U.atendidos, paga));
          if (U.erros) await api.fala('cadu', Tf('Teve {0} troco(s) errado(s): {1} fakes de desconto.', U.erros, U.erros * DESCONTO));
          if (U.faltas) await api.fala('cadu', Tf('Faltou produto na prateleira {0} vez(es): {1} fakes de desconto.', U.faltas, U.faltas * FALTA));
          Dialogo.esconder();
        }
      } catch (e) { console.error(e); }
      s.turnoMercado = null;
      if (!espera && s.ativo && s.modo === 'cena') api.liberar();
    }
    // 22h com o jogador lá dentro (sem turno): quem estiver avisa e ele sai
    async function fecharMercado() {
      const s = S(); s.modo = 'cena'; api.UI().ctl.hidden = true; api.aviso('');
      try { if (M.cadu) { await api.fala('cadu', T('Vamos fechar! Até amanhã!')); Dialogo.esconder(); } await api.sairDoLugar(); } catch (e) { console.error(e); }
      const ss = S(); if (ss && ss.ativo && ss.modo === 'cena') api.liberar();
    }

    // ---- a cada quadro (depois do tickJogador e do tickPessoas)
    function tick(dt) {
      const s = S(); if (!s) return;
      const dentro = s.dentro && s.dentro.nome === 'supermercado' && M.D;
      if (s.turnoMercado) tickTurno(dt);
      if (dentro) {
        tickPessoal('cadu', estadoCadu, criarCadu, T('Cadu'), 2, dt, false);
        tickPessoal('rosa', estadoRosa, criarRosa, T('Rosa'), 0, dt, false);
        posesTrabalho(); tickAvisos(dt);
        poseCaixa(s.jog);
        for (const k of Object.keys(M.marcas)) { const mk = M.marcas[k]; if (mk) mk.position.y = 2.7 + Math.sin(s.t * 4) * 0.08; }
        if (!s.turnoMercado && !aberto() && s.modo === 'livre' && !M.fechando) { M.fechando = true; fecharMercado().finally(() => { M.fechando = false; }); }
      }
    }
    function limpar() { fecharUI(); if (M.painel) { M.painel.remove(); M.painel = null; } for (const t of M.tex.values()) t.dispose(); M.tex.clear(); }

    return { aberto, entrou, saiu, alvos, tick, tickCliente, sairNoTurno, limpar, montarRua, _M: M, _f: { caminho, estadoCadu, estadoRosa, pagamentoDe, jogadorTrabalhaHoje, iniciarTurno, liberarRosa, falarComCadu, encerrar }, _regras: { H_ABRE, H_TURNO, H_FECHA, PAGA, AUMENTO, DESCONTO, FALTA, EST_MAX, REPOR_EM } };
  }

  window.FutebolJS.registrarFase({ id: 'mercado', nome: 'Mercado', nucleoMinimo: '5.0.0', iniciar: async () => {}, criar, PRODUTOS });
})();
