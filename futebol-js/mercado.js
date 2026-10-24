/* =====================================================================
   FUTEBOL JS · mercado.js · O TRABALHO NO MERCADINHO BOM PREÇO (arquivo SEPARADO, como interiores.js)
   ---------------------------------------------------------------------
   5.3.1 — encaixe na 5.3.0 (cidade.js): sábado e domingo não tem turno; sem banho depois do futebol o Cadu não deixa começar;
           o fim do turno marca trabalhouAlgumDia (é o que libera a 1ª ligação do João para o futebol).
   5.3.0 — primeira versão
   - Registrado com FutebolJS.registrarFase({ id: 'mercado' }) só para o jogo saber baixar o arquivo; NÃO roda como fase.
     A cidade (cidade.js) baixa em segundo plano junto do interiores.js e chama criar(api): a api é um pacote de funções
     da cidade (fala, aviso, criarPessoa, seguir...). Suba junto do cidade.js / interiores.js (mesma pasta futebol-js/).
   - O mercado abre das 14h às 22h (H_ABRE/H_FECHA). Fora disso a porta diz "Mercado fechado".
   - O CADU (o menino de óculos da Fase 1, crescido) trabalha lá: o mercado é do pai dele. Se o jogador tirou o Cadu do armário
     na Fase 1 (historia.fase1.cadu.salvou), ele lembra e dá +15 fakes no salário (AUMENTO). Se não, só acha o jogador familiar.
   - Quem escolheu o emprego do mercado (fase2.emprego === 'mercado') trabalha no CAIXA das 14h às 22h, a partir do 2º dia:
       · os clientes entram, pegam produtos nas seções (higiênico, comida, bebida, fruta), entram na fila e põem as compras na esteira;
       · no caixa ("Atender cliente"): passar cada produto (bip), aparece o TOTAL; o cliente paga em DINHEIRO (aparece o troco:
         pegue as notas de 2, 5, 10, 20 e 50 na gaveta) ou CARTÃO (digite o valor na maquininha);
       · as seções vão esvaziando: quando uma fica com pouco, o jogo pede para REPOR. Pegue a caixa certa no ESTOQUE (canto nordeste)
         e leve até a seção (frutas na ilha, bebidas no freezer...).
   - Salário: PAGA (95) pelo turno inteiro (+15 se o Cadu lembrou), menos DESCONTO (5) por troco errado. Começar depois das 14h30,
     acelerar ou sair antes paga proporcional às horas trabalhadas (o desconto vale do mesmo jeito).
   - Os produtos ainda são quadradinhos coloridos (as artes em pixel vêm depois): PRODUTOS tem nome, preço e cor de cada um.
   - Salva em historia.cidade: mercado = { apresentou, aumento, estoque: { higiene, comida, bebida, fruta } } e trabalhouHoje (o
     mesmo da cafeteria: um emprego por dia).
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
  };
  for (const k of Object.keys(TRAD)) if (!I18N[k]) I18N[k] = TRAD[k];

  // ------------------------------------------------------------------ regras (fáceis de ajustar)
  const H_ABRE = 14, H_FECHA = 22, H_CHEIO_ATE = 14.5;      // começar até 14h30 conta como turno inteiro
  const PAGA = 95, AUMENTO = 15, DESCONTO = 5;               // salário fixo · aumento do Cadu · desconto por troco errado
  const EST_MAX = 14, REPOR_EM = 5;                          // unidades por seção · abaixo disso o jogo pede para repor
  const SECOES = ['higiene', 'comida', 'bebida', 'fruta'];
  const NOME_SEC = { higiene: 'Higiênico', comida: 'Comida', bebida: 'Bebida', fruta: 'Fruta' };
  const ONDE_SEC = { higiene: 'na gôndola de higiênicos', comida: 'na gôndola de comida', bebida: 'no freezer de bebidas', fruta: 'na ilha de frutas' };
  const COR_SEC = { higiene: '#3a64b8', comida: '#e8742a', bebida: '#3fb7b0', fruta: '#6cae3e' };
  const PRODUTOS = {          // [nome, preço em fakes, cor do quadradinho]
    higiene: [['Sabonete', 3, '#f4a6c0'], ['Papel higiênico', 8, '#f2f2ee'], ['Pasta de dente', 5, '#7ab8d8'], ['Xampu', 9, '#7a4fb0'], ['Desodorante', 7, '#9ec7e8']],
    comida: [['Arroz', 12, '#f4e0b0'], ['Feijão', 9, '#5a3418'], ['Macarrão', 4, '#f2c230'], ['Biscoito', 3, '#c8352b'], ['Café em pó', 11, '#3a2213']],
    bebida: [['Refrigerante', 7, '#c8352b'], ['Suco', 5, '#e8742a'], ['Água', 2, '#9ec7dd'], ['Leite', 4, '#f2f2ee']],
    fruta: [['Banana', 4, '#f2c230'], ['Maçã', 6, '#c8352b'], ['Laranja', 5, '#f0a020'], ['Mamão', 7, '#e8742a']],
  };
  // notas (as cores das notas do real). A de 100 só aparece no pagamento: não se usa para dar troco.
  const NOTAS = [
    { v: 2, cor: '#7fa7c9', esc: '#41698c' }, { v: 5, cor: '#b49ad0', esc: '#6e548f' }, { v: 10, cor: '#d9785a', esc: '#9a4426' },
    { v: 20, cor: '#f0c24e', esc: '#b07c18' }, { v: 50, cor: '#d39a5e', esc: '#8a5a2a' }, { v: 100, cor: '#64b0d8', esc: '#2a6f96' },
  ];
  const TROCO = [2, 5, 10, 20, 50];
  const nota = (v) => NOTAS.find((n) => n.v === v);
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pk = (l) => l[Math.floor(Math.random() * l.length)];
  const clampN = (v, a, b) => Math.max(a, Math.min(b, v));
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // um valor dá para devolver só com notas de 2, 5, 10, 20 e 50? (só 1 e 3 não dão)
  const trocoPossivel = (t) => t === 0 || (t >= 2 && t !== 3);

  // ------------------------------------------------------------------ pixel art: nota de dinheiro (48 x 22) e quadradinho de produto
  function desenharNota(v, alt) {
    const N = nota(v), cv = document.createElement('canvas'); cv.width = 48; cv.height = 22; const g = cv.getContext('2d');
    g.fillStyle = N.esc; g.fillRect(0, 0, 48, 22); g.fillStyle = N.cor; g.fillRect(1, 1, 46, 20);
    g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(3, 3, 42, 1); g.fillRect(3, 18, 42, 1);
    g.fillStyle = N.esc; g.fillRect(30, 5, 12, 12); g.fillStyle = 'rgba(255,255,255,0.45)'; g.fillRect(32, 7, 8, 8);   // o "bicho" da nota (um selo)
    g.fillStyle = N.esc; g.fillRect(34, 9, 4, 4);
    g.fillStyle = '#2a1206'; g.font = 'bold 10px monospace'; g.textBaseline = 'middle'; g.fillText(String(v), 4, 11.5);
    cv.style.cssText = 'width:' + (alt || 72) + 'px;height:auto;image-rendering:pixelated;display:block;';
    return cv;
  }
  function quadradinho(cor, tam) {
    const d = document.createElement('div');
    d.style.cssText = 'width:' + tam + 'px;height:' + tam + 'px;background:' + cor + ';border:2px solid #2a1206;box-shadow:inset -3px -3px 0 rgba(0,0,0,.22),inset 2px 2px 0 rgba(255,255,255,.35);flex:0 0 auto;';
    return d;
  }

  // ------------------------------------------------------------------ sons (WebAudio, como os da cafeteria)
  const audio = () => (typeof Som !== 'undefined' && Som.audio && !Som.mudo ? Som.audio : null);
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
    tecla: com((A, t) => tom(A, 1200, t, 0.04, 0.04, 'square')),
    erro: com((A, t) => tom(A, 220, t, 0.25, 0.07, 'square', 110)),
    aprovado: com((A, t) => { tom(A, 1568, t, 0.12, 0.05, 'square'); tom(A, 2093, t + 0.13, 0.18, 0.05, 'square'); }),
    certo: com((A, t) => { for (const [i, f] of [[0, 660], [1, 880], [2, 1320]]) tom(A, f, t + i * 0.08, 0.14, 0.05, 'triangle'); }),
    caixa: com((A, t) => { chiado(A, t, 0.12, 0.12, 900); tom(A, 140, t + 0.02, 0.15, 0.08, 'sine', 70); }),   // caixa de papelão no chão
    porta: com((A, t) => { tom(A, 1760, t, 0.5, 0.04, 'sine'); tom(A, 1319, t + 0.16, 0.6, 0.04, 'sine'); }),
  };

  // ================================================================== o módulo (um por cidade aberta)
  function criar(api) {
    const S = () => api.S();
    const M = { R: null, cadu: null, caixaNPC: null, marcas: {}, esteiraM: [] };

    const dadosM = () => { const d = S().dados; if (!d.mercado) d.mercado = {}; const m = d.mercado; if (!m.estoque) m.estoque = { higiene: EST_MAX, comida: EST_MAX, bebida: EST_MAX, fruta: EST_MAX }; return m; };
    const aberto = () => { const h = S().dados.hora; return h >= H_ABRE && h < H_FECHA; };
    const ehMeuEmprego = () => api.empregoEscolhido() === 'mercado';

    // ---- o Cadu adulto: pele 4 da escala, cabelo castanho-escuro de franja e os óculos de armação preta (como na Fase 1); uniforme do mercado
    function criarCadu() {
      const s = S(), acha = (lista, n) => Math.max(0, lista.findIndex((x) => x.nome === n));
      const ap = { pele: PELES_FITZ[3].cor, cabelo: CORES_CABELO[1].cor, estilo: acha(ESTILOS_CABELO, 'Franja'), rosto: acha(ROSTOS, 'Padrão'), labio: 2, barba: 0 };
      let m = null, opt = null;
      try { if (s.f2 && s.f2.modeloPessoa) { const r = s.f2.modeloPessoa({ ap, fem: false, roupa: 0, cores: ['#c8352b', '#2a3f66', '#f2f2ee', '#f2f2ee'] }); m = r.m; opt = r.opt; } } catch (e) { console.warn('[Mercado] Cadu:', e); }
      if (!m) { opt = Object.assign({ camisa: '#c8352b', listra: '#c8352b', gola: '#f2f2ee', calcao: '#2a3f66', meia: '#2a3f66', sola: '#e6e6e0', corTexto: '#F2F2EE', numero: '', nome: ' ', fundoNome: 'rgba(0,0,0,0)', manga: 0, meiao: 1, cabecao: 1, escala: 1 }, ap); m = makeAthlete(opt); m.etiqueta.visible = false; m.sombra.visible = false; }
      const G = new api.Geo(); G.box(0.05, 0.62, 0.46, '#1f7a4d', 0.17, 0.55, 0); G.box(0.04, 0.05, 0.5, '#f2c230', 0.18, 0.86, 0); G.box(0.02, 0.08, 0.14, '#f2f2ee', 0.2, 1.1, -0.1);   // avental verde + crachá
      m.corpo.add(G.malha(api.MAT));
      oculos(m, opt);
      const A = api.atorDe(m, opt, 'parado'); return A;
    }
    // os mesmos óculos da Fase 1 (fase1.js: oculos), na cabeça de adulto (cabeça tamanho 1)
    function oculos(m, opt) {
      const kc = (opt && opt.cabecao) || 1, Lg = new Lote(), c = 0x111118;
      const xf = 0.258 * kc, yo = 1.36 + 0.245 * kc + 0.035,   /* +3,5 cm: a cabeça do adulto fica um pouco mais alta que a da criança */ zo = 0.0975 * kc, gw = 0.17 * kc, gh = 0.15 * kc, e = 0.03 * kc, d = 0.04 * kc;
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
    function criarCaixaNPC() {
      const A = api.criarPessoa(S().f2, Math.random, Math.random() < 0.6);
      const G = new api.Geo(); G.box(0.05, 0.62, 0.46, '#1f7a4d', 0.17, 0.55, 0); A.m.corpo.add(G.malha(api.MAT));
      A.tipo = 'parado'; return A;
    }

    // ---- entrou no mercado: Cadu, a pessoa do caixa (se não for o turno do jogador), o estoque das seções
    function entrou(R) {
      const s = S(); M.R = R; M.D = R.mercado || null; if (!M.D) return;
      s.falantesExtra = s.falantesExtra || {};
      if (aberto()) {
        const C = criarCadu(), p = M.D.cadu; C.x = p.x; C.z = p.z; C.yaw = C.yawAlvo = p.yaw; s.npcs.push(C); M.cadu = C;
        s.falantesExtra.cadu = { A: C, nome: T('Cadu'), voz: 2 };
        const N = criarCaixaNPC(), q = M.D.caixaNPC; N.x = q.x; N.z = q.z; N.yaw = N.yawAlvo = q.yaw; s.npcs.push(N); M.caixaNPC = N;
      }
      for (const sec of SECOES) mostrarEstoque(sec);
      SOM.porta();
    }
    function saiu() {
      const s = S();
      if (s.turnoMercado && !s.turnoMercado.fim) { s.turnoMercado.fim = true; fecharUI(); }   // (sair pelo "Sair" já encerra antes; aqui é só segurança)
      limparEsteira(); tirarCaixaDaMao();
      for (const k of Object.keys(M.marcas)) { const mk = M.marcas[k]; if (mk && mk.parent) mk.parent.remove(mk); } M.marcas = {};
      if (s.falantesExtra) delete s.falantesExtra.cadu;
      M.R = null; M.D = null; M.cadu = null; M.caixaNPC = null;
    }
    function mostrarEstoque(sec) {
      const R = M.R; if (!R || !R.estoque || !R.estoque[sec]) return;
      const n = Math.ceil(clampN(dadosM().estoque[sec], 0, EST_MAX) / EST_MAX * R.estoque[sec].length);
      R.estoque[sec].forEach((m, i) => { m.visible = i < n; });
    }

    // ---- interação
    function alvos(v) {
      const s = S(), J = s.jog, U = s.turnoMercado, D = M.D; if (!D) return;
      if (M.cadu) v.push({ x: M.cadu.x, z: M.cadu.z, r: 1.7, txt: T('Falar com o Cadu'), fn: falarComCadu, y: 2.5 });
      if (!U || U.fim) return;
      const cx = D.caixa.jog;
      const prim = U.fila[0];
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
    // a caixa de papelão nas mãos (pose: os dois braços para a frente)
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
      if (C) C.yawAlvo = Math.atan2(-(J.z - C.z), J.x - C.x);
      const h1 = api.historia().ler('fase1') || {}, cad = h1.cadu || null, salvou = !!(cad && cad.salvou);
      if (!ehMeuEmprego()) {
        await api.fala('cadu', salvou ? T('Ei... você não é aquele que me tirou do armário lá na escola? Valeu de novo, viu!') : T('Oi! Bem-vindo ao Mercadinho Bom Preço! Qualquer coisa, é só chamar.'));
        Dialogo.esconder(); return;
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
      Dialogo.esconder();
      if (s.turnoMercado) { await api.fala('cadu', T('Bom trabalho! O caixa é seu.')); Dialogo.esconder(); return; }
      if ((d.dia || 1) < 2) { await api.fala('cadu', T('Você começa amanhã! O expediente é das 14h às 22h.')); Dialogo.esconder(); return; }
      if (api.fimDeSemana && api.fimDeSemana()) { await api.fala('cadu', T('Hoje é fim de semana, o mercado fica com o meu pai. Descansa e volta segunda!')); Dialogo.esconder(); return; }   // (5.3.1)
      if (d.trabalhouHoje) { await api.fala('cadu', T('Seu turno de hoje já acabou. Até amanhã!')); Dialogo.esconder(); return; }
      if (d.precisaBanho) { await api.fala('cadu', T('Eita... você tá com cheiro de quem acabou de jogar bola! Vai em casa, toma um banho e depois volta, beleza?')); Dialogo.esconder(); return; }   // (5.3.1)
      const r = await Escolha.mostrar(T('Quer começar o seu turno no caixa agora?'), [T('Sim, vamos trabalhar'), T('Ainda não')], { centro: true });
      Dialogo.esconder(); if (r !== 0) return;
      await api.fala('cadu', T('Boa! O caixa é seu. Os clientes já vão chegando.')); Dialogo.esconder();
      await iniciarTurno();
    }
    const salario = () => PAGA + (dadosM().aumento ? AUMENTO : 0);

    // ================================================================ O TURNO
    async function iniciarTurno() {
      const s = S(), D = M.D;
      s.turnoMercado = { fila: [], clientes: [], atendidos: 0, erros: 0, prox: 2, fim: false, repor: new Set(), inicio: s.dados.hora };
      s.trabalhando = true;
      for (const A of s.npcs) if (A.cli && A.cli.fase === 'fica') A.cli.t = Math.min(A.cli.t, 2 + Math.random() * 8);   // os clientes "de enfeite" vão embora
      if (M.caixaNPC) { const N = M.caixaNPC; M.caixaNPC = null; await api.preto(true, 300); api.descartarPessoa(N); }   // o jogador assume o caixa
      else await api.preto(true, 300);
      const J = s.jog, p = D.caixa.jog; J.x = p.x; J.z = p.z; J.yaw = J.yawAlvo = p.yaw; J.rota = null; s.cam.yaw = 2.55; s.cam.snap = true;   // câmera do lado nordeste: vê o caixa, a fila e o corredor (o 2º caixa não tapa). (5.3.1) o snap estava dentro do comentário
      await api.preto(false, 300);
      montarPainel(); atualizarPainel();
      for (const sec of SECOES) if (dadosM().estoque[sec] <= REPOR_EM) s.turnoMercado.repor.add(sec);
      atualizarMarcas();
      api.aviso(T('Fique no caixa: atenda quem estiver na fila e reponha as seções quando o jogo pedir.')); setTimeout(() => { const ss = S(); if (ss && ss.turnoMercado) api.aviso(''); }, 5000);
    }
    function ritmo() { const f = ['vazio', 'vazio', 'vazio', 'medio', 'cheio', 'cheio', 'cheio'][api.diaSemana()]; return f === 'vazio' ? [13, 19] : f === 'medio' ? [10, 15] : [7, 11]; }
    function tickTurno(dt) {
      const s = S(), U = s.turnoMercado; if (!U || U.fim) return;
      if (s.dados.hora >= H_FECHA) { encerrar(false); return; }
      U.prox -= dt;
      const restam = (H_FECHA - s.dados.hora) / api.H_POR_S;                   // segundos reais até as 22h
      const ativos = s.npcs.filter((A) => A.cm && A.cm.fase !== 'sai').length;
      if (U.prox <= 0) {
        const [a, b] = ritmo(); U.prox = rnd(a, b);
        if (ativos < 6 && U.fila.length < 4 && restam > 40) novoCliente();
      }
      atualizarPainel();
    }
    function entradaLivre() {
      const s = S(), e = M.R.entrada;
      return [[0, 0], [1.1, 0], [-1.1, 0], [0, -1.1]].map(([dx, dz]) => ({ x: e.x + dx, z: e.z + dz })).find((q) => Math.hypot(q.x - s.jog.x, q.z - s.jog.z) > 0.9 && api.livreNPC(q.x, q.z, null, false)) || null;
    }
    function novoCliente() {
      const s = S(), D = M.D, e = entradaLivre(); if (!e) return;
      const est = dadosM().estoque, comEstoque = SECOES.filter((k) => est[k] > 0); if (!comEstoque.length) return;
      const nSec = Math.random() < 0.55 ? 1 : 2, secs = comEstoque.slice().sort(() => Math.random() - 0.5).slice(0, nSec);
      const A = api.criarPessoa(s.f2, Math.random, Math.random() < 0.5);
      A.tipo = 'clienteMerc'; A.x = e.x; A.z = e.z; A.yaw = A.yawAlvo = Math.PI / 2; A.vel = 1.15 + Math.random() * 0.3;
      A.cm = { fase: 'compra', secs, itens: [], rota: null, t: 0 };
      proximaCompra(A); s.npcs.push(A); api.poseAtor(A, 0.016); SOM.porta();
    }
    function proximaCompra(A) {
      const C = A.cm, D = M.D;
      if (!C.secs.length) { entrarNaFila(A); return; }
      const sec = C.secs.shift(), ar = D.secoes[sec].compra, x = rnd(ar.x0, ar.x1), z = rnd(ar.z0, ar.z1);
      C.secAtual = sec; C.rota = [{ x, z }]; C.fase = 'compra'; C.t = 0;
    }
    function pegarProdutos(A) {
      const C = A.cm, sec = C.secAtual, est = dadosM().estoque, n = Math.min(est[sec], 1 + Math.floor(Math.random() * 3));
      for (let i = 0; i < n; i++) { const [nome, preco, cor] = pk(PRODUTOS[sec]); C.itens.push({ nome, preco, cor, sec }); }
      est[sec] -= n; mostrarEstoque(sec);
      const U = S().turnoMercado;
      if (U && est[sec] <= REPOR_EM && !U.repor.has(sec)) {                 // a seção está acabando: o jogo pede para repor
        U.repor.add(sec); atualizarMarcas();
        api.aviso(Tf('Repor {0} {1}!', T(NOME_SEC[sec]).toUpperCase(), T(ONDE_SEC[sec]))); setTimeout(() => { const ss = S(); if (ss && ss.turnoMercado) api.aviso(''); }, 3200);
      }
    }
    function entrarNaFila(A) {
      const U = S().turnoMercado;
      if (!A.cm.itens.length || !U || U.fim) { sairCliente(A); return; }      // não achou nada (seção vazia): vai embora
      U.fila.push(A); A.cm.fase = 'fila'; posicionarFila();
    }
    function posicionarFila() {
      const U = S().turnoMercado, F = M.D.fila; if (!U) return;
      U.fila.forEach((A, i) => { const p = F[Math.min(i, F.length - 1)]; A.cm.alvoFila = p; A.cm.rota = [{ x: p.x, z: p.z }]; if (A.cm.fase === 'esteira' && i > 0) A.cm.fase = 'fila'; });
    }
    function sairCliente(A) {
      const D = M.D, sd = M.R.saida; A.cm.fase = 'sai'; A.cm.tSai = 0;
      A.cm.rota = [{ x: D.depois.x, z: D.depois.z }, { x: sd.x, z: sd.z }];
    }
    function tickCliente(A, dt) {
      const C = A.cm; if (!C) return;
      if (C.fase === 'compra') {
        if (!C.chegou) { if (api.seguir(A, C.rota, A.vel, dt)) { C.chegou = true; C.t = rnd(2.2, 4.2); A.yawAlvo = A.yaw + rnd(-1.2, 1.2); } return; }
        A.andando = false; C.t -= dt;
        if (C.t <= 0) { C.chegou = false; pegarProdutos(A); proximaCompra(A); }
      } else if (C.fase === 'fila' || C.fase === 'esteira') {
        const U = S().turnoMercado, i = U ? U.fila.indexOf(A) : -1;
        if (api.seguir(A, C.rota, A.vel, dt) || !C.rota.length) {
          A.andando = false; A.yawAlvo = i === 0 ? 0 : -Math.PI / 2;
          if (i === 0 && C.fase === 'fila') { C.fase = 'esteira'; porNaEsteira(A); }
        }
      } else if (C.fase === 'pago') {
        C.t -= dt; A.andando = false; if (C.t <= 0) sairCliente(A);
      } else if (C.fase === 'sai') {
        C.tSai += dt; const q = C.rota[C.rota.length - 1] || M.R.saida;
        if (api.seguir(A, C.rota, A.vel, dt) || Math.hypot(A.x - q.x, A.z - q.z) < 1.1 || C.tSai > 16) { tirarSacola(A); api.descartarPessoa(A); }
      }
    }
    // os produtos aparecem na esteira (quadradinhos coloridos), em fila, do começo dela até o leitor
    function porNaEsteira(A) {
      limparEsteira();
      const E = M.D.caixa.esteira, n = A.cm.itens.length, s = S();
      A.cm.itens.forEach((it, i) => {
        const G = new api.Geo(), w = 0.16 + Math.random() * 0.06; G.box(w, 0.12 + Math.random() * 0.08, w, it.cor, 0, 0, 0);
        const m = G.malha(api.MAT); m.position.set(E.x + (Math.random() - 0.5) * 0.25, E.y, E.z0 + (E.z1 - E.z0) * (n > 1 ? i / (n - 1) : 0.5)); s.grupo.add(m); M.esteiraM.push(m);
      });
    }
    function limparEsteira() { for (const m of M.esteiraM) if (m.parent) m.parent.remove(m); M.esteiraM = []; }
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
      const U = s.turnoMercado; if (!U || U.fim) return;            // o turno acabou com a janela aberta
      if (U) { U.fila = U.fila.filter((q) => q !== A); posicionarFila(); }
      if (ok) { if (U) U.atendidos++; darSacola(A); A.cm.fase = 'pago'; A.cm.t = 0.6; }
      else { A.cm.fase = 'esteira'; if (U) { U.fila.unshift(A); posicionarFila(); } porNaEsteira(A); }   // fechou no meio: o cliente continua esperando
      atualizarPainel();
    }
    // escolhe como o cliente paga: cartão ou dinheiro (com notas que deixem um troco que dá para dar)
    function pagamentoDe(total) {
      if (M.forcarPag !== 'dinheiro' && (M.forcarPag === 'cartao' || Math.random() < 0.42)) return { tipo: 'cartao' };   // (M.forcarPag: para testes)
      const opcoes = [];
      for (const v of [2, 5, 10, 20, 50, 100]) if (v >= total) { opcoes.push([v]); break; }
      { const m10 = Math.ceil(total / 10) * 10; const ns = []; let r = m10; for (const v of [100, 50, 20, 10]) while (r >= v) { ns.push(v); r -= v; } if (!r && ns.length <= 3) opcoes.push(ns); }
      if (total <= 50) opcoes.push([50]); if (total > 50) opcoes.push([100]);
      if (total <= 20) opcoes.push([20]);
      const validas = opcoes.filter((ns) => { const pg = ns.reduce((a, b) => a + b, 0); return pg >= total && trocoPossivel(pg - total); });
      const ns = validas.length ? pk(validas) : [];
      if (!ns.length) return { tipo: 'cartao' };
      return { tipo: 'dinheiro', notas: ns.sort((a, b) => b - a), pago: ns.reduce((a, b) => a + b, 0) };
    }
    function abrirCaixa(A) {
      return new Promise((res) => {
        const s = S(), U = s.turnoMercado, itens = A.cm.itens.map((it) => Object.assign({ passado: false }, it));
        let total = 0, pag = null, mao = [], fim = false;
        const el = document.createElement('div'); el.id = 'mcCaixa';
        el.style.cssText = 'position:fixed;inset:0;z-index:22;display:grid;place-items:center;background:rgba(6,4,2,.55);padding:max(6px,env(safe-area-inset-top,0px)) max(8px,env(safe-area-inset-right,0px)) max(6px,env(safe-area-inset-bottom,0px)) max(8px,env(safe-area-inset-left,0px));box-sizing:border-box;';
        const card = document.createElement('div');
        card.style.cssText = 'display:grid;grid-template-columns:minmax(150px,1fr) minmax(120px,170px) minmax(190px,1.25fr);gap:8px;width:min(900px,100%);max-height:100%;overflow:auto;background:#2a1206;border:4px solid #c8352b;color:#fff0c8;padding:8px;box-sizing:border-box;font-family:var(--font-body);';
        const col = () => { const c = document.createElement('div'); c.style.cssText = 'display:flex;flex-direction:column;gap:6px;min-width:0;background:#3a1c0a;border:3px solid #4a2c14;padding:6px;'; return c; };
        const tit = (t) => { const h = document.createElement('div'); h.style.cssText = 'font:700 11px/1.2 var(--font-display);letter-spacing:.06em;text-transform:uppercase;color:#f0a020;'; h.textContent = t; return h; };
        // 1) a esteira
        const cE = col(), lista = document.createElement('div'); lista.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;align-content:flex-start;min-height:60px;';
        const dicaE = document.createElement('div'); dicaE.style.cssText = 'font:400 11px/1.3 var(--font-body);color:#d8c8a8;'; dicaE.textContent = T('Toque em cada produto para passar no leitor.');
        cE.append(tit(T('Esteira')), dicaE, lista);
        // 2) o visor (lista do que passou e o total)
        const cV = col(); cV.style.background = '#14200f'; cV.style.borderColor = '#2f4a22';
        const linhas = document.createElement('div'); linhas.style.cssText = 'flex:1 1 auto;min-height:40px;max-height:150px;overflow:auto;font:400 11px/1.35 monospace;color:#9be070;';
        const tot = document.createElement('div'); tot.style.cssText = 'font:700 18px/1.1 monospace;color:#c8ff8a;text-align:right;border-top:2px dashed #2f4a22;padding-top:4px;';
        cV.append(tit(T('Caixa')), linhas, tot);
        // 3) o pagamento
        const cP = col(), corpoP = document.createElement('div'); corpoP.style.cssText = 'display:flex;flex-direction:column;gap:6px;';
        const msg = document.createElement('div'); msg.style.cssText = 'min-height:16px;font:700 11px/1.3 var(--font-display);';
        const topoP = document.createElement('div'); topoP.style.cssText = 'display:flex;justify-content:space-between;align-items:center;gap:6px;';
        const btnFechar = document.createElement('button'); btnFechar.type = 'button'; btnFechar.className = 'pxBtn'; btnFechar.textContent = T('Fechar'); btnFechar.style.cssText = '--p:var(--p2,2px);min-height:24px;font-size:9px;padding:0 8px;';
        topoP.append(tit(T('Pagamento')), btnFechar);
        cP.append(topoP, corpoP, msg);
        card.append(cE, cV, cP); el.appendChild(card); (document.getElementById('raizJogo') || document.body).appendChild(el);
        const mensagem = (t, cor) => { msg.textContent = t || ''; msg.style.color = cor || '#fff0c8'; };
        const fechar = (ok) => { if (fim) return; fim = true; clearInterval(vigia); el.remove(); res(ok); };
        btnFechar.onclick = () => { api.som(); fechar(false); };
        const vigia = setInterval(() => { const ss = S(); if (!ss || !ss.ativo || !ss.turnoMercado || ss.turnoMercado.fim) fechar(false); }, 250);

        function desenharEsteira() {
          lista.innerHTML = '';
          itens.forEach((it) => {
            if (it.passado) return;
            const b = document.createElement('button'); b.type = 'button';
            b.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:3px;width:62px;padding:4px 2px;background:#2a1206;border:2px solid #8a5a2a;color:#fff0c8;cursor:pointer;font:700 9px/1.1 var(--font-display);';
            b.appendChild(quadradinho(it.cor, 30)); const n = document.createElement('span'); n.textContent = T(it.nome); b.appendChild(n);
            b.onclick = () => passar(it); lista.appendChild(b);
          });
        }
        function desenharVisor() {
          linhas.innerHTML = itens.filter((it) => it.passado).map((it) => '<div style="display:flex;justify-content:space-between;gap:6px"><span>' + esc(T(it.nome)) + '</span><span>' + it.preco + '</span></div>').join('');
          linhas.scrollTop = linhas.scrollHeight;
          tot.textContent = T('TOTAL') + ' ' + total;
        }
        function passar(it) {
          if (it.passado || fim) return;
          it.passado = true; total += it.preco; SOM.bip();
          const m = M.esteiraM.pop(); if (m && m.parent) m.parent.remove(m);   // o quadradinho sai da esteira 3D
          desenharEsteira(); desenharVisor();
          if (itens.every((q) => q.passado)) setTimeout(() => { if (!fim) cobrar(); }, 450);
        }
        function cobrar() {
          dicaE.textContent = ''; pag = pagamentoDe(total);
          if (pag.tipo === 'cartao') maquininha(); else dinheiro();
        }
        // ---- DINHEIRO: mostra as notas que o cliente deu, o troco e a gaveta
        function dinheiro() {
          const troco = pag.pago - total; corpoP.innerHTML = '';
          const peq = (window.innerHeight || 400) < 430;                 // (5.3.1) celular deitado: notas menores para o botão caber na tela
          const l1 = document.createElement('div'); l1.style.cssText = 'font:400 11px/1.2 var(--font-body);'; l1.textContent = T('O cliente pagou com:');
          const ns = document.createElement('div'); ns.style.cssText = 'display:flex;gap:4px;flex-wrap:wrap;'; for (const v of pag.notas) ns.appendChild(desenharNota(v, peq ? 44 : 58));
          const info = document.createElement('div'); info.style.cssText = 'font:700 12px/1.3 var(--font-display);'; info.innerHTML = esc(Tf('Recebido: {0}', pag.pago)) + '<br><span style="color:#8fe04a;font-size:16px">' + esc(Tf('TROCO: {0}', troco)) + '</span>';
          const g = document.createElement('div'); g.style.cssText = 'font:700 10px/1.2 var(--font-display);color:#f0a020;'; g.textContent = T('Gaveta (toque nas notas)');
          const gaveta = document.createElement('div'); gaveta.style.cssText = 'display:flex;gap:4px;flex-wrap:wrap;background:#1f0f06;border:2px solid #4a2c14;padding:4px;';
          for (const v of TROCO) { const b = document.createElement('button'); b.type = 'button'; b.style.cssText = 'padding:0;border:0;background:none;cursor:pointer;'; b.appendChild(desenharNota(v, peq ? 46 : 56)); b.onclick = () => { if (fim) return; mao.push(v); SOM.nota(); desenharMao(); }; gaveta.appendChild(b); }
          const naMaoT = document.createElement('div'); naMaoT.style.cssText = 'font:700 11px/1.2 var(--font-display);';
          const naMao = document.createElement('div'); naMao.style.cssText = 'display:flex;gap:3px;flex-wrap:wrap;min-height:24px;';
          const dica = document.createElement('div'); dica.style.cssText = 'font:400 10px/1.2 var(--font-body);color:#c8b898;'; dica.textContent = T('Toque numa nota da mão para devolver à gaveta.');
          const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'pxBtn pxPrim'; btn.style.cssText = '--p:var(--p2,2px);min-height:34px;font-size:11px;';
          btn.textContent = troco === 0 ? T('Sem troco: concluir') : T('Entregar troco');
          function desenharMao() {
            naMao.innerHTML = ''; const soma = mao.reduce((a, b) => a + b, 0); naMaoT.textContent = Tf('Na sua mão: {0}', soma);
            mao.forEach((v, i) => { const b = document.createElement('button'); b.type = 'button'; b.style.cssText = 'padding:0;border:0;background:none;cursor:pointer;'; b.appendChild(desenharNota(v, peq ? 32 : 40)); b.onclick = () => { if (fim) return; mao.splice(i, 1); SOM.nota(); desenharMao(); }; naMao.appendChild(b); });
          }
          btn.onclick = () => {
            if (fim) return; const soma = mao.reduce((a, b) => a + b, 0);
            if (soma === troco) { SOM.certo(); api.somCaixa(); mensagem(T('Troco certo! Obrigado!'), '#8fe04a'); fim = true; clearInterval(vigia); setTimeout(() => { el.remove(); res(true); }, 900); return; }
            U.erros++; SOM.erro(); atualizarPainel();
            mensagem(soma < troco ? Tf('Opa, tá faltando troco! (−{0} fakes)', DESCONTO) : Tf('Você me deu troco a mais! (−{0} fakes)', DESCONTO), '#ff8a6a');
          };
          if (peq) { dica.style.display = 'none'; l1.style.display = 'none'; }
          if (troco === 0) { gaveta.style.display = 'none'; g.style.display = 'none'; dica.style.display = 'none'; naMaoT.style.display = 'none'; }
          corpoP.append(l1, ns, info, g, gaveta, naMaoT, naMao, dica, btn); desenharMao();
        }
        // ---- CARTÃO: digitar o valor na maquininha e apertar OK
        function maquininha() {
          corpoP.innerHTML = ''; let dig = '';
          const l1 = document.createElement('div'); l1.style.cssText = 'font:700 12px/1.2 var(--font-display);'; l1.textContent = T('Cartão') + ' · ' + T('Maquininha');
          const maq = document.createElement('div'); maq.style.cssText = 'background:#1c1c1f;border:3px solid #0a0a0c;padding:6px;display:flex;flex-direction:column;gap:5px;width:min(200px,100%);align-self:center;';
          const visor = document.createElement('div'); visor.style.cssText = 'background:#9fc47a;color:#14200f;font:700 16px/1.2 monospace;padding:4px 6px;text-align:right;min-height:22px;border:2px solid #4a6a2a;';
          const estado = document.createElement('div'); estado.style.cssText = 'font:700 9px/1.2 monospace;color:#9fc47a;min-height:11px;text-align:center;';
          const kp = document.createElement('div'); kp.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:4px;';
          const tecla = (t, fn, cor) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = t; b.style.cssText = 'min-height:28px;background:' + (cor || '#3a3a3e') + ';color:#fff;border:2px solid #0a0a0c;font:700 13px/1 monospace;cursor:pointer;'; b.onclick = () => { if (!fim) fn(); }; kp.appendChild(b); };
          const mostrar = () => { visor.textContent = dig || '0'; };
          for (const n of ['1', '2', '3', '4', '5', '6', '7', '8', '9']) tecla(n, () => { if (dig.length < 4) dig += n; SOM.tecla(); mostrar(); estado.textContent = ''; });
          tecla('⌫', () => { dig = dig.slice(0, -1); SOM.tecla(); mostrar(); }, '#a8442a'); tecla('0', () => { if (dig && dig.length < 4) dig += '0'; SOM.tecla(); mostrar(); });
          tecla('OK', () => {
            if (+dig === total) { estado.textContent = T('APROXIME O CARTÃO'); kp.style.pointerEvents = 'none'; setTimeout(() => { if (fim) return; estado.textContent = T('APROVADO'); SOM.aprovado(); mensagem(T('Obrigado, até mais!'), '#8fe04a'); fim = true; clearInterval(vigia); setTimeout(() => { el.remove(); res(true); }, 900); }, 800); }
            else { SOM.erro(); estado.textContent = T('VALOR INCORRETO'); dig = ''; mostrar(); }
          }, '#1f7a4d');
          const d1 = document.createElement('div'); d1.style.cssText = 'font:400 11px/1.3 var(--font-body);color:#d8c8a8;'; d1.textContent = T('Digite o valor e aperte OK.');
          maq.append(visor, estado, kp); corpoP.append(l1, d1, maq); mostrar();
        }
        corpoP.innerHTML = '<div style="font:400 11px/1.3 var(--font-body);color:#c8b898">' + esc(T('Esperando passar as compras...')) + '</div>';
        desenharEsteira(); desenharVisor();
      });
    }
    function fecharUI() { for (const id of ['mcCaixa']) { const e = document.getElementById(id); if (e) e.remove(); } if (M.painel) M.painel.hidden = true; }

    // ---- o painel do turno (alto, no meio): hora, atendidos, erros, o que repor e "Acelerar"
    function montarPainel() {
      if (M.painel) { M.painel.hidden = false; return; }
      const p = document.createElement('div'); p.id = 'mcTurno';
      p.style.cssText = 'position:fixed;z-index:9;left:50%;transform:translateX(-50%);top:calc(48px + env(safe-area-inset-top,0px));display:flex;align-items:center;gap:8px;background:rgba(42,18,6,.9);border:3px solid #c8352b;color:#fff0c8;padding:3px 6px 3px 8px;font:700 11px/1.2 var(--font-display);white-space:nowrap;max-width:calc(100% - 24px);';
      p.innerHTML = '<span class="mTxt"></span><span class="mRep" style="display:flex;gap:3px;align-items:center"></span><button type="button" class="pxBtn mAcel" style="--p:var(--p2,2px);min-height:26px;font-size:9px;padding:0 6px"></button>';
      (document.getElementById('raizJogo') || document.body).appendChild(p);
      M.painel = p; M.pTxt = p.querySelector('.mTxt'); M.pRep = p.querySelector('.mRep'); M.pAcel = p.querySelector('.mAcel');
      M.pAcel.textContent = T('Acelerar final do turno');
      M.pAcel.onclick = () => { const s = S(); if (s && s.modo === 'livre' && s.turnoMercado && !s.turnoMercado.fim) { api.som(); s.modo = 'cena'; api.UI().ctl.hidden = true; acelerar().finally(() => { const ss = S(); if (ss && ss.ativo && ss.modo === 'cena') api.liberar(); }); } };
    }
    function atualizarPainel() {
      const s = S(), U = s && s.turnoMercado; if (!U || !M.painel) return;
      const txt = api.fmtHora(s.dados.hora) + ' → ' + api.fmtHora(H_FECHA) + ' · ' + Tf('Atendidos: {0}', U.atendidos) + ' · ' + Tf('Erros: {0}', U.erros) + (U.repor.size ? ' · ' + T('Repor:') : '');
      if (M.pTxt.textContent !== txt) M.pTxt.textContent = txt;
      const k = [...U.repor].join(','); if (M.pRep.dataset.k !== k) { M.pRep.dataset.k = k; M.pRep.innerHTML = ''; for (const sec of U.repor) { const q = quadradinho(COR_SEC[sec], 14); q.title = T(NOME_SEC[sec]); M.pRep.appendChild(q); } }
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
    // ---- fim do turno: paga (proporcional se começou tarde ou parou antes), desconta os erros e o Cadu fala
    async function encerrar(antes, hParou) {
      const s = S(), U = s.turnoMercado, d = s.dados; if (!U || U.fim) return; U.fim = true;
      s.trabalhando = false; fecharUI(); tirarCaixaDaMao(); limparEsteira();
      for (const A of s.npcs.slice()) if (A.cm && A.cm.fase !== 'sai') { tirarSacola(A); sairCliente(A); }
      U.fila = []; atualizarMarcas();
      const ini = Math.max(H_ABRE, U.inicio <= H_CHEIO_ATE ? H_ABRE : U.inicio), fimH = antes ? clampN(hParou, ini, H_FECHA) : H_FECHA;
      const frac = clampN((fimH - ini) / (H_FECHA - H_ABRE), 0, 1), bruto = Math.round(salario() * frac), desc = U.erros * DESCONTO, paga = Math.max(0, bruto - desc);
      d.trabalhouHoje = true; d.trabalhouAlgumDia = true; d.fakes += paga;   // (5.3.1) trabalhouAlgumDia: libera a ligação do João api.somDinheiro(); api.ganhoNaTela(paga); api.mostrarDinheiro(true);
      api.gravar('chegada');
      const espera = s.modo !== 'livre'; if (!espera) { s.modo = 'cena'; api.UI().ctl.hidden = true; }
      try {
        if (M.cadu) {
          await api.fala('cadu', Tf('Fechou o caixa por hoje! Você atendeu {0} clientes. Toma: {1} fakes.', U.atendidos, paga));
          if (U.erros) await api.fala('cadu', Tf('Teve {0} troco(s) errado(s): {1} fakes de desconto.', U.erros, desc));
          Dialogo.esconder();
        }
      } catch (e) { console.error(e); }
      s.turnoMercado = null;
      if (!espera && s.ativo && s.modo === 'cena') api.liberar();
    }
    // 22h com o jogador lá dentro (sem turno): o Cadu avisa e ele sai
    async function fecharMercado() {
      const s = S(); s.modo = 'cena'; api.UI().ctl.hidden = true; api.aviso('');
      try { if (M.cadu) { await api.fala('cadu', T('Vamos fechar! Até amanhã!')); Dialogo.esconder(); } await api.sairDoLugar(); } catch (e) { console.error(e); }
      const ss = S(); if (ss && ss.ativo && ss.modo === 'cena') api.liberar();
    }

    // ---- a cada quadro (depois do tickJogador)
    function tick(dt) {
      const s = S(); if (!s) return;
      const dentro = s.dentro && s.dentro.nome === 'supermercado' && M.D;
      if (s.turnoMercado) tickTurno(dt);
      if (dentro) {
        poseCaixa(s.jog);
        for (const k of Object.keys(M.marcas)) { const mk = M.marcas[k]; if (mk) mk.position.y = 2.7 + Math.sin(s.t * 4) * 0.08; }
        if (!s.turnoMercado && !aberto() && s.modo === 'livre' && !M.fechando) { M.fechando = true; fecharMercado().finally(() => { M.fechando = false; }); }
      }
    }
    function limpar() { fecharUI(); if (M.painel) { M.painel.remove(); M.painel = null; } }

    return { aberto, entrou, saiu, alvos, tick, tickCliente, sairNoTurno, limpar, _M: M, _regras: { H_ABRE, H_FECHA, PAGA, AUMENTO, DESCONTO, EST_MAX, REPOR_EM } };
  }

  window.FutebolJS.registrarFase({ id: 'mercado', nome: 'Mercado', nucleoMinimo: '5.0.0', iniciar: async () => {}, criar });
})();
