/* =====================================================================
   FUTEBOL JS · pizzaria.js · A PIZZARIA FORNO A LENHA E O TRABALHO DE ENTREGADOR (arquivo SEPARADO, como mercado.js)
   ---------------------------------------------------------------------
   6.1.0 — primeira versão.
   - Registrado com FutebolJS.registrarFase({ id: 'pizzaria' }) só para o jogo saber baixar o arquivo; NÃO roda como fase.
     A cidade (cidade.js) baixa em segundo plano junto do mercado.js e chama criar(api) (api = apiPizzaria() da cidade).
     Suba junto do cidade.js / interiores.js (mesma pasta futebol-js/).
   - HORÁRIO: a pizzaria abre das 17h até a meia-noite (H_ABRE / H_FECHA). O MÁRIO (o dono) fica no caixa e a CARLA (a pizzaiola)
     faz tudo: anota na mesa, abre a massa na bancada, assa no forno a lenha (a boca do forno brilha mais) e leva a pizza para a mesa.
   - CLIENTES (grupos de 1 ou 2 por mesa): entram, sentam, a Carla anota, a pizza chega (pixel art GRANDE cobrindo a mesa), eles comem
     (a pizza vai perdendo fatias: inteira → sem 2 → sem 4 → só uma → some), levantam, pagam no caixa do Mário e vão embora.
     Segunda a quarta: pouca gente · quinta: médio · sexta a domingo: cheio (nunca lota: sempre sobram 2 mesas).
   - O JOGADOR também pode comer: sentado numa mesa, "Pedir uma pizza" (8 sabores, 100 fakes). A pizza ENCHE a fome do dia e
     tira 3 de Saudável (comida não saudável); comer já satisfeito é como no lanche do Valdemar (mais 4 e passa mal 20 s depois).
   - 8 SABORES em pixel art 32 x 32 (SABORES / desenharPizza), com o estado de cada pizza (8, 6, 4 ou 1 fatia) e a fatia na mão.
   - O TRABALHO (quem escolheu a pizzaria na Fase 2): ENTREGADOR, quinta a domingo (4 x 3), das 17h à meia-noite.
       1. Falar com o Mário (ou tocar no caixa) para começar o turno. A Carla deixa o pedido pronto na RETIRADA (ponta do balcão).
       2. "Pegar o pedido": aparece o sabor e a pixel art. Lá fora, a BICICLETA fica parada na frente da pizzaria:
          "Colocar a pizza na bicicleta" e "Subir na bicicleta" (ela anda 1,5x a velocidade do jogador correndo).
       3. Ao subir, o mapa marca a CASA de um cliente (uma pessoa espera na frente dela, acenando) e começam os 30 SEGUNDOS.
       4. Bater em alguma coisa (parede, poste, carro, gente) derruba a bicicleta e a caixa: pegue a caixa, levante a bicicleta
          e continue. Pizza que caiu chega AMASSADA: "Essa pizza veio toda amassada! Sem gorjeta para você!"
       5. Pagamento: 70 fakes pela noite (proporcional se começar depois das 17h30 ou parar antes) + 5 de gorjeta por entrega no prazo
          (sem cair) − 5 por entrega atrasada. Na meia-noite não sai pedido novo; quem estiver entregando termina e recebe.
   - Salva em historia.cidade: pizzaria = { apresentou, conheceu, papo } e trabalhouHoje/trabalhouDia/trabalhouAlgumDia.
   ===================================================================== */
(function () {
  'use strict';

  // ------------------------------------------------------------------ textos (pt → en, es, it, fr)
  const TRAD = {
    'Pizzaria fechada. Abre às 17h.': ['Pizzeria closed. Opens at 5 PM.', 'Pizzería cerrada. Abre a las 17h.', 'Pizzeria chiusa. Apre alle 17.', 'Pizzeria fermée. Ouvre à 17 h.'],
    'Mário': ['Mário', 'Mário', 'Mario', 'Mário'], 'Carla': ['Carla', 'Carla', 'Carla', 'Carla'], 'Cliente': ['Customer', 'Cliente', 'Cliente', 'Client'],
    'Falar com o Mário': ['Talk to Mário', 'Hablar con Mário', 'Parla con Mario', 'Parler à Mário'],
    'Falar com a Carla': ['Talk to Carla', 'Hablar con Carla', 'Parla con Carla', 'Parler à Carla'],
    'Começar o turno': ['Start the shift', 'Empezar el turno', 'Inizia il turno', 'Commencer le service'],
    'Pedir uma pizza': ['Order a pizza', 'Pedir una pizza', 'Ordina una pizza', 'Commander une pizza'],
    'Levantar': ['Stand up', 'Levantarse', 'Alzati', 'Se lever'],
    'Pegar o pedido': ['Pick up the order', 'Tomar el pedido', 'Prendi l’ordine', 'Prendre la commande'],
    'O pedido ainda está no forno...': ['The order is still in the oven...', 'El pedido todavía está en el horno...', 'L’ordine è ancora nel forno...', 'La commande est encore au four...'],
    'Pegar a pizza': ['Pick up the pizza', 'Tomar la pizza', 'Prendi la pizza', 'Ramasser la pizza'],
    'Levantar a bicicleta': ['Lift the bike', 'Levantar la bicicleta', 'Rialza la bici', 'Relever le vélo'],
    'Colocar a pizza na bicicleta': ['Put the pizza on the bike', 'Poner la pizza en la bicicleta', 'Metti la pizza sulla bici', 'Mettre la pizza sur le vélo'],
    'Subir na bicicleta': ['Get on the bike', 'Subir a la bicicleta', 'Sali sulla bici', 'Monter sur le vélo'],
    'Descer da bicicleta': ['Get off the bike', 'Bajar de la bicicleta', 'Scendi dalla bici', 'Descendre du vélo'],
    'Entregar a pizza': ['Deliver the pizza', 'Entregar la pizza', 'Consegna la pizza', 'Livrer la pizza'],
    'Pedido: {0}': ['Order: {0}', 'Pedido: {0}', 'Ordine: {0}', 'Commande : {0}'],
    'coloque na bicicleta e suba': ['put it on the bike and get on', 'ponla en la bicicleta y sube', 'mettila sulla bici e sali', 'mets-la sur le vélo et monte'],
    'ATRASADA +{0} s': ['LATE +{0} s', 'ATRASADA +{0} s', 'IN RITARDO +{0} s', 'EN RETARD +{0} s'],
    '(amassada)': ['(squashed)', '(aplastada)', '(schiacciata)', '(écrasée)'],
    'Entrega: leve a pizza até a bicicleta, na frente da pizzaria.': ['Delivery: take the pizza to the bike, in front of the pizzeria.', 'Entrega: lleva la pizza a la bicicleta, frente a la pizzería.', 'Consegna: porta la pizza alla bici, davanti alla pizzeria.', 'Livraison : apporte la pizza au vélo, devant la pizzeria.'],
    'Entrega: siga a marca até a casa do cliente. Você tem 30 segundos!': ['Delivery: follow the marker to the customer’s house. You have 30 seconds!', 'Entrega: sigue la marca hasta la casa del cliente. ¡Tienes 30 segundos!', 'Consegna: segui il segnale fino alla casa del cliente. Hai 30 secondi!', 'Livraison : suis le repère jusqu’à la maison du client. Tu as 30 secondes !'],
    'Volte para a pizzaria e pegue o próximo pedido.': ['Go back to the pizzeria and pick up the next order.', 'Vuelve a la pizzería y toma el próximo pedido.', 'Torna in pizzeria e prendi il prossimo ordine.', 'Retourne à la pizzeria et prends la prochaine commande.'],
    'Pegue a pizza e levante a bicicleta.': ['Pick up the pizza and lift the bike.', 'Toma la pizza y levanta la bicicleta.', 'Raccogli la pizza e rialza la bici.', 'Ramasse la pizza et relève le vélo.'],
    'Você caiu da bicicleta! A pizza amassou...': ['You fell off the bike! The pizza got squashed...', '¡Te caíste de la bicicleta! La pizza se aplastó...', 'Sei caduto dalla bici! La pizza si è schiacciata...', 'Tu es tombé du vélo ! La pizza s’est écrasée...'],
    'Você caiu da bicicleta!': ['You fell off the bike!', '¡Te caíste de la bicicleta!', 'Sei caduto dalla bici!', 'Tu es tombé du vélo !'],
    'Coloque a pizza na bicicleta antes de subir.': ['Put the pizza on the bike before getting on.', 'Pon la pizza en la bicicleta antes de subir.', 'Metti la pizza sulla bici prima di salire.', 'Mets la pizza sur le vélo avant de monter.'],
    'Você já está com um pedido.': ['You already have an order.', 'Ya tienes un pedido.', 'Hai già un ordine.', 'Tu as déjà une commande.'],
    'Chegou rapidinho! Toma aqui a sua gorjeta.': ['That was quick! Here’s your tip.', '¡Llegó rapidito! Toma tu propina.', 'Che velocità! Ecco la tua mancia.', 'C’était rapide ! Voilà ton pourboire.'],
    'Valeu! Chegou quentinha!': ['Thanks! It’s still hot!', '¡Gracias! ¡Llegó calentita!', 'Grazie! È arrivata calda!', 'Merci ! Elle est encore chaude !'],
    'Essa pizza veio toda amassada! Sem gorjeta para você!': ['This pizza came all squashed! No tip for you!', '¡Esta pizza llegó toda aplastada! ¡Sin propina para ti!', 'Questa pizza è arrivata tutta schiacciata! Niente mancia per te!', 'Cette pizza est arrivée tout écrasée ! Pas de pourboire pour toi !'],
    'Demorou, hein! A pizza já chegou fria.': ['Took you long enough! The pizza is already cold.', '¡Tardaste, eh! La pizza ya llegó fría.', 'Ce ne hai messo di tempo! La pizza è già fredda.', 'T’en as mis du temps ! La pizza est déjà froide.'],
    'No prazo! +{0} fakes de gorjeta': ['On time! +{0} fakes tip', '¡A tiempo! +{0} fakes de propina', 'In tempo! +{0} fakes di mancia', 'À l’heure ! +{0} fakes de pourboire'],
    'Amassada: sem gorjeta': ['Squashed: no tip', 'Aplastada: sin propina', 'Schiacciata: niente mancia', 'Écrasée : pas de pourboire'],
    'Atrasada: −{0} fakes': ['Late: −{0} fakes', 'Atrasada: −{0} fakes', 'In ritardo: −{0} fakes', 'En retard : −{0} fakes'],
    'Entregas: {0}': ['Deliveries: {0}', 'Entregas: {0}', 'Consegne: {0}', 'Livraisons : {0}'],
    'No prazo: {0}': ['On time: {0}', 'A tiempo: {0}', 'In tempo: {0}', 'À l’heure : {0}'],
    'Atrasadas: {0}': ['Late: {0}', 'Atrasadas: {0}', 'In ritardo: {0}', 'En retard : {0}'],
    'Acelerar final do turno': ['Fast-forward to the end of the shift', 'Acelerar el final del turno', 'Accelera la fine del turno', 'Accélérer la fin du service'],
    'Acelerar até a meia-noite? Você recebe só pelas horas trabalhadas até agora.': ['Fast-forward to midnight? You only get paid for the hours worked so far.', '¿Acelerar hasta la medianoche? Solo cobras las horas trabajadas hasta ahora.', 'Accelerare fino a mezzanotte? Vieni pagato solo per le ore lavorate finora.', 'Accélérer jusqu’à minuit ? Tu n’es payé que pour les heures travaillées jusqu’ici.'],
    'Acelerar': ['Fast-forward', 'Acelerar', 'Accelera', 'Accélérer'], 'Continuar trabalhando': ['Keep working', 'Seguir trabajando', 'Continua a lavorare', 'Continuer à travailler'],
    'Termine a entrega antes.': ['Finish the delivery first.', 'Termina la entrega primero.', 'Finisci prima la consegna.', 'Termine d’abord la livraison.'],
    'Encerrar o turno agora? Você recebe só pelas horas trabalhadas.': ['End the shift now? You only get paid for the hours worked.', '¿Terminar el turno ahora? Solo cobras las horas trabajadas.', 'Chiudere il turno adesso? Vieni pagato solo per le ore lavorate.', 'Terminer le service maintenant ? Tu n’es payé que pour les heures travaillées.'],
    'Encerrar o turno': ['End the shift', 'Terminar el turno', 'Chiudi il turno', 'Terminer le service'],
    'Quer começar o seu turno de entregas agora?': ['Do you want to start your delivery shift now?', '¿Quieres empezar tu turno de entregas ahora?', 'Vuoi iniziare adesso il tuo turno di consegne?', 'Tu veux commencer ton service de livraison maintenant ?'],
    'Sim, vamos trabalhar': ['Yes, let’s work', 'Sí, a trabajar', 'Sì, al lavoro', 'Oui, au travail'], 'Ainda não': ['Not yet', 'Todavía no', 'Non ancora', 'Pas encore'],
    'Ah, você é o novo entregador! Eu sou o Mário, o dono da Forno a Lenha.': ['Ah, you’re the new delivery person! I’m Mário, the owner of Forno a Lenha.', '¡Ah, eres el nuevo repartidor! Soy Mário, el dueño de Forno a Lenha.', 'Ah, sei il nuovo fattorino! Io sono Mario, il proprietario del Forno a Lenha.', 'Ah, c’est toi le nouveau livreur ! Moi c’est Mário, le patron du Forno a Lenha.'],
    'Você trabalha de quinta a domingo, das 17h até a meia-noite.': ['You work Thursday to Sunday, from 5 PM to midnight.', 'Trabajas de jueves a domingo, de las 17h a la medianoche.', 'Lavori dal giovedì alla domenica, dalle 17 a mezzanotte.', 'Tu travailles du jeudi au dimanche, de 17 h à minuit.'],
    'Pega o pedido ali na ponta do balcão, põe na bicicleta lá fora e voa! O cliente fica esperando na frente de casa.': ['Grab the order at the end of the counter, put it on the bike outside and fly! The customer waits in front of the house.', 'Toma el pedido en la punta del mostrador, ponlo en la bicicleta afuera ¡y vuela! El cliente espera frente a su casa.', 'Prendi l’ordine in fondo al bancone, mettilo sulla bici fuori e vola! Il cliente aspetta davanti a casa.', 'Prends la commande au bout du comptoir, mets-la sur le vélo dehors et file ! Le client attend devant chez lui.'],
    'São 30 segundos para chegar. São {0} fakes por noite, mais {1} de gorjeta por entrega no prazo, e menos {2} por entrega atrasada.': ['You have 30 seconds to get there. It’s {0} fakes a night, plus {1} tip per on-time delivery, and minus {2} per late delivery.', 'Son 30 segundos para llegar. Son {0} fakes por noche, más {1} de propina por entrega a tiempo y menos {2} por entrega atrasada.', 'Hai 30 secondi per arrivare. Sono {0} fakes a sera, più {1} di mancia per ogni consegna in tempo e meno {2} per ogni consegna in ritardo.', 'Tu as 30 secondes pour arriver. C’est {0} fakes par soir, plus {1} de pourboire par livraison à l’heure et moins {2} par livraison en retard.'],
    'E cuidado com a bicicleta! Se cair, a pizza amassa e o cliente não dá gorjeta.': ['And careful with the bike! If you fall, the pizza gets squashed and the customer won’t tip.', '¡Y cuidado con la bicicleta! Si te caes, la pizza se aplasta y el cliente no da propina.', 'E attento alla bici! Se cadi, la pizza si schiaccia e il cliente non dà la mancia.', 'Et fais attention au vélo ! Si tu tombes, la pizza s’écrase et le client ne donne pas de pourboire.'],
    'E eu sou a Carla, a pizzaiola! Pode deixar que as pizzas saem quentinhas.': ['And I’m Carla, the pizza maker! Don’t worry, the pizzas come out nice and hot.', '¡Y yo soy Carla, la pizzera! Tranquilo, las pizzas salen calentitas.', 'E io sono Carla, la pizzaiola! Tranquillo, le pizze escono belle calde.', 'Et moi c’est Carla, la pizzaiola ! T’inquiète, les pizzas sortent bien chaudes.'],
    'Hoje não é seu dia! Você trabalha de quinta a domingo, a partir das 17h.': ['Today isn’t your day! You work Thursday to Sunday, from 5 PM.', '¡Hoy no te toca! Trabajas de jueves a domingo, desde las 17h.', 'Oggi non è il tuo giorno! Lavori dal giovedì alla domenica, dalle 17.', 'Ce n’est pas ton jour aujourd’hui ! Tu travailles du jeudi au dimanche, à partir de 17 h.'],
    'Seu turno de hoje já acabou. Bom descanso!': ['Your shift today is over. Get some rest!', 'Tu turno de hoy ya terminó. ¡Descansa!', 'Il tuo turno di oggi è finito. Riposati!', 'Ton service est terminé pour aujourd’hui. Repose-toi bien !'],
    'Já tá quase na hora de fechar, hoje não dá mais. Até a próxima!': ['It’s almost closing time, not today anymore. See you next time!', 'Ya casi cerramos, hoy ya no da. ¡Hasta la próxima!', 'È quasi ora di chiudere, oggi non si fa più. Alla prossima!', 'On ferme bientôt, ce sera pas pour aujourd’hui. À la prochaine !'],
    'Eita... você tá com cheiro de quem acabou de jogar bola! Vai tomar um banho e volta, beleza?': ['Whoa... you smell like you just played football! Go take a shower and come back, okay?', 'Uy... ¡hueles a que acabas de jugar al fútbol! Ve a bañarte y vuelve, ¿sí?', 'Ehi... hai l’odore di chi ha appena giocato a calcio! Vai a farti una doccia e torna, ok?', 'Ouh... tu sens le foot à plein nez ! Va prendre une douche et reviens, d’accord ?'],
    'Bom trabalho! O próximo pedido tá saindo.': ['Good job! The next order is coming out.', '¡Buen trabajo! El próximo pedido ya sale.', 'Ottimo lavoro! Il prossimo ordine sta uscendo.', 'Bon travail ! La prochaine commande arrive.'],
    'Bem-vindo à Forno a Lenha! Senta aí que a Carla já te atende.': ['Welcome to Forno a Lenha! Take a seat, Carla will be right with you.', '¡Bienvenido a Forno a Lenha! Siéntate, que Carla ya te atiende.', 'Benvenuto al Forno a Lenha! Siediti, Carla arriva subito.', 'Bienvenue au Forno a Lenha ! Assieds-toi, Carla arrive.'],
    'Deu meia-noite! Fechou por hoje.': ['It’s midnight! That’s it for today.', '¡Ya es medianoche! Cerramos por hoy.', 'È mezzanotte! Per oggi abbiamo chiuso.', 'Il est minuit ! C’est fini pour aujourd’hui.'],
    'Você fez {0} entrega(s): {1} no prazo, {2} amassada(s) e {3} atrasada(s). Toma: {4} fakes.': ['You made {0} deliveries: {1} on time, {2} squashed and {3} late. Here: {4} fakes.', 'Hiciste {0} entrega(s): {1} a tiempo, {2} aplastada(s) y {3} atrasada(s). Toma: {4} fakes.', 'Hai fatto {0} consegne: {1} in tempo, {2} schiacciate e {3} in ritardo. Tieni: {4} fakes.', 'Tu as fait {0} livraison(s) : {1} à l’heure, {2} écrasée(s) et {3} en retard. Tiens : {4} fakes.'],
    'Turno encerrado: +{0} fakes': ['Shift over: +{0} fakes', 'Turno terminado: +{0} fakes', 'Turno finito: +{0} fakes', 'Service terminé : +{0} fakes'],
    'Deu meia-noite! Termina essa entrega e o turno acaba.': ['It’s midnight! Finish this delivery and the shift is over.', '¡Es medianoche! Termina esta entrega y se acaba el turno.', 'È mezzanotte! Finisci questa consegna e il turno è finito.', 'Il est minuit ! Termine cette livraison et le service est fini.'],
    'Vamos fechar! Boa noite!': ['We’re closing! Good night!', '¡Vamos a cerrar! ¡Buenas noches!', 'Chiudiamo! Buonanotte!', 'On ferme ! Bonne nuit !'],
    'Cardápio da Forno a Lenha (você tem {0} fakes)': ['Forno a Lenha menu (you have {0} fakes)', 'Menú de Forno a Lenha (tienes {0} fakes)', 'Menù del Forno a Lenha (hai {0} fakes)', 'Carte du Forno a Lenha (tu as {0} fakes)'],
    'Nada, obrigado': ['Nothing, thanks', 'Nada, gracias', 'Niente, grazie', 'Rien, merci'],
    'fakes': ['fakes', 'fakes', 'fakes', 'fakes'],
    'Ih... tá faltando dinheiro aí, hein?': ['Uh-oh... looks like you’re short on money, huh?', 'Uy... te falta plata, ¿eh?', 'Uh... mancano un po’ di soldi, eh?', 'Oh... il te manque des sous, hein ?'],
    'Saindo uma {0}!': ['One {0} coming up!', '¡Sale una {0}!', 'Arriva una {0}!', 'Une {0}, ça arrive !'],
    'Ufa... essa pizza matou a minha fome!': ['Phew... that pizza killed my hunger!', 'Uf... ¡esa pizza me mató el hambre!', 'Uff... quella pizza mi ha tolto la fame!', 'Ouf... cette pizza m’a coupé la faim !'],
    'Acho que eu exagerei...': ['I think I overdid it...', 'Creo que me pasé...', 'Credo di aver esagerato...', 'Je crois que j’ai abusé...'],
    'Eu estou com hábitos não saudáveis, isso com certeza vai me prejudicar nos jogos....': ['My habits are really unhealthy, this is definitely going to hurt me in games....', 'Tengo hábitos poco saludables, esto seguro me va a perjudicar en los partidos....', 'Ho abitudini poco sane, questo mi danneggerà di sicuro nelle partite....', 'J’ai des habitudes pas saines, ça va sûrement me pénaliser en match....'],
    'Opa, deixa eu anotar...': ['Okay, let me write it down...', 'A ver, déjame anotar...', 'Ok, lasciami scrivere...', 'Bon, je note...'],
    'Tô no forno, já já sai mais uma!': ['I’m at the oven, another one is coming out soon!', '¡Estoy en el horno, ya sale otra!', 'Sono al forno, ne esce un’altra tra poco!', 'Je suis au four, une autre sort bientôt !'],
    'Corre que essa tá quentinha!': ['Hurry, this one’s nice and hot!', '¡Corre que esta está calentita!', 'Corri che questa è bella calda!', 'File, celle-là est bien chaude !'],
    'Você não trabalha aqui... mas fica à vontade, tem pizza boa!': ['You don’t work here... but make yourself at home, the pizza’s good!', 'No trabajas aquí... pero ponte cómodo, ¡la pizza es buena!', 'Non lavori qui... ma fai come a casa tua, la pizza è buona!', 'Tu ne travailles pas ici... mais fais comme chez toi, la pizza est bonne !'],
    'Mussarela': ['Mozzarella', 'Mozzarella', 'Mozzarella', 'Mozzarella'], 'Calabresa': ['Calabrese sausage', 'Calabresa', 'Salsiccia calabrese', 'Saucisse calabraise'],
    'Margherita': ['Margherita', 'Margarita', 'Margherita', 'Margherita'], 'Portuguesa': ['Portuguese', 'Portuguesa', 'Portoghese', 'Portugaise'],
    'Frango com Requeijão': ['Chicken & cream cheese', 'Pollo con queso crema', 'Pollo e formaggio cremoso', 'Poulet et fromage crémeux'],
    'Quatro Queijos': ['Four Cheese', 'Cuatro Quesos', 'Quattro Formaggi', 'Quatre Fromages'], 'Pepperoni': ['Pepperoni', 'Pepperoni', 'Salamino piccante', 'Pepperoni'],
    'Chocolate com Morango': ['Chocolate & Strawberry', 'Chocolate con Fresa', 'Cioccolato e Fragole', 'Chocolat et Fraise'],
    'Mário: {0}': ['Mário: {0}', 'Mário: {0}', 'Mario: {0}', 'Mário : {0}'],
    'A Carla cobra a pizza da mesa, você só entrega!': ['Carla takes care of the tables, you just deliver!', '¡Carla atiende las mesas, tú solo entregas!', 'Ai tavoli ci pensa Carla, tu consegni e basta!', 'Carla s’occupe des tables, toi tu livres !'],
    // conversas com o Mário (papo, uma por vez)
    'Sabia que essa receita de massa era da minha avó?': ['Did you know this dough recipe was my grandma’s?', '¿Sabías que esta receta de masa era de mi abuela?', 'Sapevi che questa ricetta dell’impasto era di mia nonna?', 'Tu savais que cette recette de pâte était celle de ma grand-mère ?'],
    'Sério? Dá pra sentir!': ['Really? You can tell!', '¿En serio? ¡Se nota!', 'Davvero? Si sente!', 'Sérieux ? Ça se sent !'], 'Ela que te ensinou?': ['Did she teach you?', '¿Ella te enseñó?', 'Te l’ha insegnata lei?', 'C’est elle qui t’a appris ?'],
    'Né? Por isso a gente não muda nada.': ['Right? That’s why we don’t change a thing.', '¿Verdad? Por eso no cambiamos nada.', 'Vero? Per questo non cambiamo niente.', 'Hein ? C’est pour ça qu’on ne change rien.'],
    'Ensinou! E eu ensinei a Carla, que hoje faz melhor que eu.': ['She did! And I taught Carla, who does it better than me now.', '¡Sí! Y yo le enseñé a Carla, que hoy lo hace mejor que yo.', 'Sì! E io l’ho insegnata a Carla, che ora la fa meglio di me.', 'Oui ! Et je l’ai apprise à Carla, qui la fait mieux que moi aujourd’hui.'],
    'Sexta e sábado isso aqui vira uma loucura!': ['Friday and Saturday this place goes crazy!', '¡Viernes y sábado esto se vuelve una locura!', 'Venerdì e sabato qui diventa una follia!', 'Le vendredi et le samedi, c’est la folie ici !'],
    'Imagino!': ['I can imagine!', '¡Me imagino!', 'Immagino!', 'J’imagine !'], 'E dá conta?': ['Can you handle it?', '¿Y das abasto?', 'E ce la fate?', 'Et vous tenez le coup ?'],
    'Ainda bem que a Carla é rápida no forno.': ['Good thing Carla is quick at the oven.', 'Menos mal que Carla es rápida en el horno.', 'Per fortuna Carla è veloce al forno.', 'Heureusement que Carla est rapide au four.'],
    'Com pizza boa, a gente dá conta de tudo!': ['With good pizza, we can handle anything!', '¡Con pizza buena, damos abasto con todo!', 'Con una buona pizza, ce la facciamo con tutto!', 'Avec une bonne pizza, on gère tout !'],
    'Qual é o seu sabor preferido?': ['What’s your favorite flavor?', '¿Cuál es tu sabor favorito?', 'Qual è il tuo gusto preferito?', 'C’est quoi ta pizza préférée ?'],
    'Calabresa, sempre!': ['Calabrese, always!', '¡Calabresa, siempre!', 'Calabrese, sempre!', 'Calabraise, toujours !'], 'A doce de chocolate!': ['The chocolate one!', '¡La dulce de chocolate!', 'Quella dolce al cioccolato!', 'Celle au chocolat !'],
    'Clássico! Não tem erro.': ['A classic! Can’t go wrong.', '¡Un clásico! No falla.', 'Un classico! Non si sbaglia.', 'Un classique ! On ne se trompe pas.'],
    'A da Carla com morango? Ela capricha nessa!': ['Carla’s one with strawberries? She really nails that one!', '¿La de Carla con fresa? ¡Esa le sale increíble!', 'Quella di Carla con le fragole? Lì dà il meglio!', 'Celle de Carla aux fraises ? Elle la réussit à merveille !'],
    'A Carla tá no forno, mas manda um oi!': ['Carla is at the oven, but she says hi!', 'Carla está en el horno, ¡pero te manda saludos!', 'Carla è al forno, ma ti saluta!', 'Carla est au four, mais elle te passe le bonjour !'],
    'Oi! Tô com as mãos na massa, literalmente!': ['Hi! My hands are in the dough, literally!', '¡Hola! Tengo las manos en la masa, ¡literalmente!', 'Ciao! Ho le mani in pasta, letteralmente!', 'Salut ! J’ai les mains dans la pâte, littéralement !'],
    'O segredo é o forno bem quente!': ['The secret is a really hot oven!', '¡El secreto es el horno bien caliente!', 'Il segreto è il forno bello caldo!', 'Le secret, c’est un four bien chaud !'],
  };
  for (const k of Object.keys(TRAD)) if (!I18N[k]) I18N[k] = TRAD[k];

  // ------------------------------------------------------------------ regras (fáceis de ajustar)
  const H_ABRE = 17, H_FECHA = 24, H_EQUIPE = 16.75, H_ULTIMO_GRUPO = 23.25, H_TURNO = 17, H_CHEIO_ATE = 17.5, H_ULTIMO_TURNO = 23;
  const DIAS_TRABALHO = [3, 4, 5, 6];                                  // diaSemana(): 0 = segunda → quinta, sexta, sábado e domingo (4 x 3)
  const PAGA = 70, GORJETA = 5, ATRASO = 5, PRAZO = 30;                // por noite · por entrega no prazo · por entrega atrasada · segundos
  const PRECO_PIZZA = 100, SAUDE_PIZZA = -3, SAUDE_EXAGERO = -4;       // a pizza do jogador (enche a fome do dia)
  const VEL_BIKE = 1.5;                                                // × a velocidade do jogador correndo
  const DIST_MIN = 40, DIST_MAX = 140;                                 // (m, pela rede de calçadas) da pizzaria até a casa do cliente
  const BIKE_PARADA = { x: 3.4, z: 8.05, yaw: 0 };                     // na calçada, na frente da pizzaria (a porta fica em x 1,2 · z 8,6)
  const SELIM = 0.18;                                                  // o selim fica 0,18 m atrás do centro da bicicleta
  const COMIDA_SEG = 10;                                               // segundos que o jogador leva para comer a pizza
  const ESTADOS = [8, 6, 4, 1];                                        // fatias que sobram em cada estado (depois some)

  // ------------------------------------------------------------------ (6.1.0) OS 8 SABORES — pixel art 32 x 32, no capricho
  //   Tábua de madeira redonda, borda dourada com bolhas, base (queijo / molho / chocolate) com manchas de luz e sombra, coberturas
  //   próprias de cada sabor e as linhas do corte das 8 fatias. As fatias que já foram comidas mostram a tábua (com farelos).
  const SABORES = [
    { id: 'mussarela', nome: 'Mussarela' }, { id: 'calabresa', nome: 'Calabresa' }, { id: 'margherita', nome: 'Margherita' },
    { id: 'portuguesa', nome: 'Portuguesa' }, { id: 'frango', nome: 'Frango com Requeijão' }, { id: 'queijos', nome: 'Quatro Queijos' },
    { id: 'pepperoni', nome: 'Pepperoni' }, { id: 'chocolate', nome: 'Chocolate com Morango' },
  ];
  const NP = 32, CX = 15.5, R_PIZZA = 13.6, R_BORDA = 11.7, R_TABUA = 15.6;
  // gerador fixo (as coberturas ficam sempre no mesmo lugar)
  const semente = (s) => () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  // as coberturas de cada sabor: lista de [x, y, tipo] em coordenadas da pizza (0..31)
  const COBERTURAS = {};
  function coberturas(id) {
    if (COBERTURAS[id]) return COBERTURAS[id];
    const r = semente(id.split('').reduce((a, c) => a * 31 + c.charCodeAt(0), 7)), L = [];
    const ponto = (rMax) => { for (;;) { const x = r() * 32, y = r() * 32; if (Math.hypot(x - CX, y - CX) < rMax) return [x, y]; } };
    const espalhar = (n, tipo, rMax) => { for (let i = 0; i < n; i++) { const [x, y] = ponto(rMax || 9.6); L.push([x, y, tipo]); } };
    // distribuição "em anel" (um por fatia, mais um no meio) para as coberturas grandes não se amontoarem
    const anel = (n, raio, tipo, gira) => { for (let i = 0; i < n; i++) { const a = (i + 0.5) / n * Math.PI * 2 + (gira || 0); L.push([CX + Math.cos(a) * raio, CX + Math.sin(a) * raio, tipo]); } };
    // (as menores primeiro: as grandes são desenhadas por cima)
    if (id === 'mussarela') { espalhar(22, 'oregano'); anel(5, 6.6, 'azeitona', 0.3); L.push([CX, CX, 'azeitona']); }
    else if (id === 'calabresa') { espalhar(8, 'oregano'); espalhar(6, 'cebola', 9.2); anel(7, 7.4, 'calabresa', 0.2); anel(3, 3.1, 'calabresa', 1.1); }
    else if (id === 'margherita') { anel(5, 6.6, 'bufala', 0.5); L.push([CX, CX, 'bufala']); anel(6, 4.2, 'manjericao', 0.1); anel(4, 8.8, 'manjericao', 0.9); }
    else if (id === 'portuguesa') { espalhar(14, 'ervilha', 9.8); espalhar(5, 'cebola', 9); espalhar(8, 'presunto', 9.2); anel(4, 8.6, 'azeitona', 0.2); anel(3, 5.4, 'ovo', 0.6); }
    else if (id === 'frango') { espalhar(10, 'milho', 10); espalhar(70, 'frango', 10.2); anel(6, 6.8, 'requeijao', 0.4); L.push([CX, CX, 'requeijao']); }
    else if (id === 'queijos') { espalhar(6, 'oregano'); const tipos = ['qBranco', 'qCheddar', 'qProvolone', 'qGorgonzola']; for (let i = 0; i < 8; i++) { const a = (i + 0.5) / 8 * Math.PI * 2, r0 = i % 2 ? 7.6 : 3.9; L.push([CX + Math.cos(a) * r0, CX + Math.sin(a) * r0, tipos[i % 4]]); } }
    else if (id === 'pepperoni') { espalhar(10, 'oregano'); anel(7, 7.6, 'pepperoni', 0.25); anel(3, 3.4, 'pepperoni', 0.9); }
    else if (id === 'chocolate') { espalhar(16, 'granulado', 10); for (let i = 0; i < 3; i++) L.push([CX, CX, 'fio' + i]); anel(6, 7.4, 'morango', 0.4); anel(2, 2.8, 'morango', 1.6); }
    COBERTURAS[id] = L; return L;
  }
  const BASE = {
    mussarela: ['#f6d36a', '#ffe9a0', '#e8b84a'], calabresa: ['#f6d36a', '#ffe9a0', '#e8b84a'], margherita: ['#c8352b', '#e0503a', '#a8241c'],
    portuguesa: ['#f6d36a', '#ffe9a0', '#e8b84a'], frango: ['#f4dca0', '#fff0c8', '#e4c47a'], queijos: ['#f0d27a', '#fae6a8', '#dcb85a'],
    pepperoni: ['#f4c25a', '#ffe08a', '#e0a040'], chocolate: ['#4a2810', '#6a3a1a', '#36190a'],
  };
  // a cor de um pixel da pizza (null = fora da pizza). x, y em 0..31 (o centro do pixel é x + 0,5). corPizza.base diz se o pixel
  // é só a base (queijo/molho/chocolate) — a linha do corte das fatias só passa por cima da base, não das coberturas.
  function corPizza(id, x, y) {
    const px = x + 0.5, py = y + 0.5, dx = px - CX - 0.5, dy = py - CX - 0.5, r = Math.hypot(dx, dy);
    corPizza.base = false;
    if (r > R_PIZZA) return null;
    if (r > R_BORDA) {                                                  // a borda: dourada, contorno escuro por fora, brilho em cima, bolhinhas
      if (r > R_PIZZA - 0.75) return '#8a4e18';
      const luz = dx + dy < -6, bolha = (x * 7 + y * 13) % 11 === 0;
      if (id === 'chocolate' && r < R_BORDA + 0.8) return '#6a3a1a';
      return bolha ? '#f6d080' : r > R_PIZZA - 1.6 ? '#c88430' : luz ? '#f2c46a' : '#e0a448';
    }
    if (r > R_BORDA - 0.7) return id === 'chocolate' ? '#40220e' : id === 'margherita' ? '#8a1a14' : '#d8962c';   // onde a borda encontra o recheio
    const B = BASE[id], n = Math.sin(px * 1.7 + py * 0.9) + Math.sin(px * 0.6 - py * 1.9) + Math.sin((px + py) * 1.13);
    let c = n > 1.2 ? B[1] : n < -1.3 ? B[2] : B[0]; corPizza.base = true;
    if (id === 'margherita' && n > 1.6) c = '#f0e6c8';                 // um pouco de queijo derretido no molho
    if (id === 'chocolate' && n > 1.5) c = '#8a5a2a';                   // brilho do chocolate
    for (const [cx, cy, t] of coberturas(id)) {
      const d = Math.hypot(px - cx, py - cy), ox = px - cx, oy = py - cy, lz = ox + oy < -0.6;   // lz: lado da luz (em cima, à esquerda)
      let k = null;
      if (t === 'oregano' && d < 0.6) k = '#4a6a2a';
      else if (t === 'azeitona' && d < 1.7) k = d < 0.7 ? '#6a6a70' : d > 1.25 ? '#0e0e12' : '#24242a';
      else if (t === 'calabresa' && d < 2.5) k = d > 2.0 ? '#6a1e10' : lz && d < 1.5 ? '#d8704a' : ((Math.round(cx * 7 + px) + Math.round(py)) % 5 === 0 ? '#f0b090' : '#b0402a');
      else if (t === 'cebola' && d < 1.6 && d > 0.9) k = oy < 0.4 ? '#efe0f2' : null;
      else if (t === 'bufala' && d < 2.3) k = d > 1.9 ? '#e0d2b4' : lz ? '#ffffff' : '#fbf6ea';
      else if (t === 'manjericao' && Math.abs(ox) + Math.abs(oy) < 1.7) k = ox + oy < 0 ? '#5cc05a' : '#2a7a34';
      else if (t === 'presunto' && Math.abs(ox) < 1.8 && Math.abs(oy) < 1.2) k = (Math.abs(ox) > 1.3 || Math.abs(oy) > 0.75) ? '#c86a6a' : oy < -0.2 ? '#f8b8b8' : '#e88a8a';
      else if (t === 'ovo' && d < 2.3) k = d < 1.0 ? (lz ? '#ffd84a' : '#f2b820') : d > 1.9 ? '#d8d0c0' : '#fbf8f0';
      else if (t === 'ervilha' && d < 0.8) k = lz ? '#8ad050' : '#5a9a2e';
      else if (t === 'frango' && Math.abs(ox) < 1.1 && Math.abs(oy) < 0.55) k = (Math.floor(cx * 3) % 3) === 0 ? '#a8642a' : (Math.floor(cy * 5) % 2 ? '#c8803a' : '#e0a860');
      else if (t === 'requeijao' && d < 2.0) k = d > 1.55 ? '#d8ccb0' : lz ? '#ffffff' : '#fbf6ea';
      else if (t === 'milho' && d < 0.8) k = '#f6e040';
      else if (t === 'qBranco' && d < 3.0) k = d > 2.55 ? '#d8ccb0' : lz ? '#ffffff' : '#f6f0e0';
      else if (t === 'qCheddar' && d < 2.9) k = d > 2.45 ? '#b8601a' : lz ? '#f8b860' : '#f0962e';
      else if (t === 'qProvolone' && d < 2.9) k = d > 2.45 ? '#b88a30' : ((x * 3 + y * 7) % 9 === 0 ? '#a8701e' : lz ? '#f8e098' : '#ecc860');
      else if (t === 'qGorgonzola' && d < 3.0) k = d > 2.55 ? '#a8a898' : (Math.abs(ox - oy * 0.7) < 0.45 || Math.abs(ox + oy - 1) < 0.4) ? '#3a6a80' : '#ecece0';
      else if (t === 'pepperoni' && d < 2.5) k = d > 2.05 ? '#6a1010' : ((x * 3 + y * 5) % 7 === 0 ? '#8a1a1a' : lz && d < 1.6 ? '#e8604a' : '#c02a22');
      else if (t === 'morango' && d < 2.5) { const folha = oy < -1.4 && Math.abs(ox) < 1.4; k = folha ? (ox < 0 ? '#5cc05a' : '#2a8a3a') : d > 2.05 ? '#7a0a14' : ((Math.round(px * 2) + Math.round(py * 3)) % 4 === 0 ? '#f6e8a0' : lz ? '#f25060' : '#d8202a'); }
      else if (t === 'granulado' && d < 0.6) k = ['#f4ece0', '#f2c230', '#f05a8a'][Math.floor(cx) % 3];
      else if (t.startsWith('fio') && Math.abs(Math.sin((px * 0.55 + (+t[3]) * 2.1)) * 7 + CX - py + (+t[3] - 1) * 6) < 0.6 && r < R_BORDA - 0.8) k = '#f8f0e4';
      if (k) { c = k; corPizza.base = false; }
    }
    return c;
  }
  // em qual fatia (0..7) fica o pixel: o ângulo a partir do "meio-dia", no sentido horário
  const fatiaDe = (x, y) => { const a = Math.atan2(y + 0.5 - CX - 0.5, x + 0.5 - CX - 0.5) + Math.PI / 2; return Math.floor((((a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) / (Math.PI / 4)) % 8; };
  const CACHE = new Map();
  // a pizza na tábua com 'n' fatias (8, 6, 4 ou 1). Guardada: desenha uma vez só.
  function canvasPizza(id, n) {
    const k = id + ':' + n; if (CACHE.has(k)) return CACHE.get(k);
    const cv = document.createElement('canvas'); cv.width = cv.height = NP; const g = cv.getContext('2d');
    const tem = (f) => f < n;                                           // come em ordem: some primeiro a fatia 7, depois a 6...
    for (let y = 0; y < NP; y++) for (let x = 0; x < NP; x++) {
      const r = Math.hypot(x + 0.5 - CX - 0.5, y + 0.5 - CX - 0.5); if (r > R_TABUA) continue;
      let c = r > R_TABUA - 1.1 ? '#4a2a14' : (Math.floor((y + x * 0.25) / 2) % 3 === 0 ? '#8a5a32' : '#9a683a');   // a tábua (veios), mais escura que a borda
      if (r > R_TABUA - 2 && r <= R_TABUA - 1.1) c = '#7a4a26';
      const p = corPizza(id, x, y), ehBase = corPizza.base, f = fatiaDe(x, y);
      if (p && tem(f)) {
        c = p;
        // o corte entre as fatias: uma linha mais escura (só onde as duas fatias ainda estão lá)
        const a = Math.atan2(y + 0.5 - CX - 0.5, x + 0.5 - CX - 0.5) + Math.PI / 2, aa = ((a % (Math.PI / 4)) + Math.PI / 4) % (Math.PI / 4), dist = Math.min(aa, Math.PI / 4 - aa) * r;
        if (dist < 0.42 && ehBase && r < R_BORDA - 0.6 && r > 1.2 && tem((f + 7) % 8) && tem((f + 1) % 8)) c = id === 'chocolate' ? '#2e1808' : id === 'margherita' ? '#8a1a14' : '#d0902a';
      } else if (p) {                                                   // a fatia foi comida: tábua com farelos e uma manchinha
        if ((x * 5 + y * 3) % 31 === 0 && r < R_PIZZA) c = id === 'chocolate' ? '#5a3418' : '#e8b050';
        else if ((x * 11 + y * 7) % 41 === 0) c = BASE[id][2];
      }
      g.fillStyle = c; g.fillRect(x, y, 1, 1);
    }
    CACHE.set(k, cv); return cv;
  }
  // a FATIA na mão (16 x 16): bico para baixo, borda em cima
  function canvasFatia(id) {
    const k = 'fatia:' + id; if (CACHE.has(k)) return CACHE.get(k);
    const N = 16, cv = document.createElement('canvas'); cv.width = cv.height = N; const g = cv.getContext('2d'), mapa = [];
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const dy = 14.5 - y, larg = dy * 0.42; if (dy < 0 || dy > 14 || Math.abs(x + 0.5 - 8) > larg + 0.3) continue;
      const r = dy / 14 * R_PIZZA, a = -Math.PI / 2 + (x + 0.5 - 8) / Math.max(1, larg) * (Math.PI / 8) * 0.95;
      const c = corPizza(id, Math.round(CX + 0.5 + Math.cos(a) * r - 0.5), Math.round(CX + 0.5 + Math.sin(a) * r - 0.5));
      if (c) { mapa.push([x, y]); g.fillStyle = c; g.fillRect(x, y, 1, 1); }
    }
    // contorno escuro
    const tem = new Set(mapa.map(([x, y]) => x + ',' + y)); g.fillStyle = '#2a1206';
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (!tem.has(x + ',' + y) && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => tem.has((x + a) + ',' + (y + b)))) g.fillRect(x, y, 1, 1);
    CACHE.set(k, cv); return cv;
  }
  // a tampa da caixa de pizza (logo da Forno a Lenha)
  function canvasCaixa() {
    if (CACHE.has('caixa')) return CACHE.get('caixa');
    const cv = document.createElement('canvas'); cv.width = cv.height = 32; const g = cv.getContext('2d');
    g.fillStyle = '#f2ead8'; g.fillRect(0, 0, 32, 32); g.fillStyle = '#c8352b'; g.fillRect(0, 0, 32, 2); g.fillRect(0, 30, 32, 2); g.fillRect(0, 0, 2, 32); g.fillRect(30, 0, 2, 32);
    g.fillStyle = '#e8dcc0'; for (let i = 4; i < 28; i += 3) g.fillRect(3, i, 26, 1);
    // chaminha
    g.fillStyle = '#f2a020'; g.fillRect(14, 6, 4, 6); g.fillRect(13, 9, 6, 4); g.fillStyle = '#c8352b'; g.fillRect(15, 4, 2, 3); g.fillRect(15, 10, 2, 3); g.fillStyle = '#ffe08a'; g.fillRect(15, 11, 2, 2);
    g.fillStyle = '#c8352b'; g.font = 'bold 6px monospace'; g.textAlign = 'center'; g.fillText('FORNO', 16, 21); g.fillText('A LENHA', 16, 27);
    CACHE.set('caixa', cv); return cv;
  }
  // um <canvas> para a tela (HUD, cardápio): cópia da pixel art no tamanho pedido
  function iconePizza(id, n, px) {
    const src = canvasPizza(id, n == null ? 8 : n), cv = document.createElement('canvas'); cv.width = cv.height = NP; cv.getContext('2d').drawImage(src, 0, 0);
    cv.style.cssText = 'width:' + (px || 48) + 'px;height:' + (px || 48) + 'px;image-rendering:pixelated;display:block;';
    return cv;
  }

  // ------------------------------------------------------------------ sons (WebAudio)
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
    porta: com((A, t) => { tom(A, 1760, t, 0.5, 0.04, 'sine'); tom(A, 1319, t + 0.16, 0.6, 0.04, 'sine'); }),
    campainha: com((A, t) => { for (const d of [0, 0.16]) { tom(A, 2637, t + d, 0.22, 0.05, 'triangle'); tom(A, 3520, t + d, 0.18, 0.03, 'sine'); } }),   // trim-trim da bicicleta
    bater: com((A, t) => { chiado(A, t, 0.25, 0.22, 600); tom(A, 110, t, 0.3, 0.12, 'sine', 50); chiado(A, t + 0.08, 0.3, 0.12, 2400); }),
    caixa: com((A, t) => { chiado(A, t, 0.12, 0.12, 900); tom(A, 140, t + 0.02, 0.15, 0.08, 'sine', 70); }),
    forno: com((A, t) => { for (let i = 0; i < 6; i++) chiado(A, t + i * 0.07 + Math.random() * 0.03, 0.05, 0.05, 1800 + Math.random() * 1500); chiado(A, t, 0.6, 0.04, 400); }),
    certo: com((A, t) => { for (const [i, f] of [[0, 660], [1, 880], [2, 1320]]) tom(A, f, t + i * 0.08, 0.14, 0.05, 'triangle'); }),
    erro: com((A, t) => tom(A, 220, t, 0.25, 0.07, 'square', 110)),
    prato: com((A, t) => { tom(A, 1900, t, 0.12, 0.03, 'triangle'); chiado(A, t, 0.06, 0.05, 3000); }),
    tique: com((A, t) => tom(A, 1500, t, 0.04, 0.03, 'square')),
  };
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pk = (l) => l[Math.floor(Math.random() * l.length)];
  const clampN = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerpN = (a, b, k) => a + (b - a) * k;

  // ================================================================== o módulo (um por cidade aberta)
  function criar(api) {
    const S = () => api.S();
    const M = { entrandoRua: [], R: null, D: null, mario: null, carla: null, tex: new Map(), nav: null, grupos: [], tarefas: [], prox: 3, pizzasMesa: new Map(), avisos: [], tAviso: 0, bike: null, pedido: null, cliRua: null, fogoK: 0 };

    const dadosP = () => { const d = S().dados; if (!d.pizzaria) d.pizzaria = {}; return d.pizzaria; };
    const hora = () => S().dados.hora;
    const aberto = () => { const h = hora(); return h >= H_ABRE && h < H_FECHA; };
    const equipeLa = () => { const h = hora(); return h >= H_EQUIPE && h < H_FECHA; };
    const ehMeuEmprego = () => api.empregoEscolhido() === 'pizzaria';
    const diaDeTrabalho = () => DIAS_TRABALHO.includes(api.diaSemana());
    const U = () => { const s = S(); return s && s.turnoPizza && !s.turnoPizza.fim ? s.turnoPizza : null; };
    const texDe = (cv, chave) => { if (M.tex.has(chave)) return M.tex.get(chave); const t = new THREE.CanvasTexture(cv); t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; M.tex.set(chave, t); return t; };
    const texPizza = (id, n) => texDe(canvasPizza(id, n), 'p:' + id + ':' + n);

    // ---------------------------------------------------------------- MÁRIO e CARLA (modelos)
    function modelo(ap, fem, roupa, cores, fallback) {
      const s = S(); let m = null, opt = null;
      try { if (s.f2 && s.f2.modeloPessoa) { const r = s.f2.modeloPessoa({ ap, fem, roupa, cores }); m = r.m; opt = r.opt; } } catch (e) { console.warn('[Pizzaria] modelo:', e); }
      if (!m) { opt = Object.assign({ camisa: cores[0], listra: cores[0], gola: cores[2], calcao: cores[1], meia: cores[1], sola: '#e6e6e0', corTexto: '#F2F2EE', numero: '', nome: ' ', fundoNome: 'rgba(0,0,0,0)', manga: 0, meiao: 1, cabecao: 1, escala: 1 }, ap); m = makeAthlete(opt); m.etiqueta.visible = false; m.sombra.visible = false; }
      return { m, opt };
    }
    const acha = (lista, n) => Math.max(0, lista.findIndex((x) => x.nome === n));
    function criarMario() {
      const ap = { pele: PELES_FITZ[2].cor, cabelo: CORES_CABELO[6].cor, estilo: acha(ESTILOS_CABELO, 'Raspado'), rosto: 0, labio: 2, corBarba: CORES_CABELO[6].cor, barba: Math.max(0, ESTILOS_BARBA.findIndex((b) => /bigode/i.test(b.nome))) };
      const { m, opt } = modelo(ap, false, 0, ['#f2f2ee', '#2a2a2e', '#1f7a4d', '#f2f2ee']);
      const G = new api.Geo(); G.box(0.05, 0.66, 0.48, '#1f7a4d', 0.17, 0.5, 0); G.box(0.04, 0.05, 0.6, '#c8352b', 0.18, 0.98, 0); G.box(0.02, 0.1, 0.16, '#f2f2ee', 0.2, 1.12, 0.1);   // avental verde com a faixa
      m.corpo.add(G.malha(api.MAT));
      const A = api.atorDe(m, opt, 'equipePz'); A.vel = 1.3; A.poseP = 'caixa'; return A;
    }
    function criarCarla() {
      const ap = Object.assign(gerarAparencia(8812, 'F'), { pele: PELES_FITZ[3].cor, cabelo: CORES_CABELO[1].cor });
      const { m, opt } = modelo(ap, true, 1, ['#f4f4ec', '#2a2a2e', '#c8352b', '#c8352b']);
      const kc = (opt && opt.cabecao) || 1, G = new api.Geo();
      G.box(0.05, 0.62, 0.46, '#c8352b', 0.17, 0.5, 0); G.box(0.04, 0.05, 0.56, '#f4f4ec', 0.18, 0.95, 0);                        // avental vermelho
      const yc = 1.36 + 0.49 * kc;                                                                                              // CHAPÉU de pizzaiola (touca branca)
      G.box(0.5 * kc, 0.12, 0.5 * kc, '#f4f4f0', 0, yc - 0.03, 0); G.box(0.58 * kc, 0.2, 0.58 * kc, '#ffffff', 0, yc + 0.08, 0); G.box(0.5 * kc, 0.06, 0.5 * kc, '#e8e8e2', 0, yc + 0.28, 0);
      m.corpo.add(G.malha(api.MAT));
      const A = api.atorDe(m, opt, 'equipePz'); A.vel = 2.0; A.poseP = 'massa'; return A;
    }
    // objetos de mão da Carla: bloquinho, lápis, a pá do forno e a pizza
    function objetosCarla(A) {
      if (A.obj) return A.obj;
      const bloco = new api.Geo(); bloco.box(0.04, 0.2, 0.15, '#f4f4ec', 0, -0.36, 0); bloco.box(0.045, 0.03, 0.15, '#c8352b', 0, -0.27, 0);
      const lapis = new api.Geo(); lapis.box(0.02, 0.16, 0.02, '#f2c230', 0, -0.34, 0);
      const pa = new api.Geo(); pa.box(1.25, 0.04, 0.05, '#8a5a2a', 0.62, 0, 0); pa.box(0.44, 0.02, 0.4, '#c8a070', 1.38, 0, 0);
      const o = { bloco: bloco.malha(api.MAT), lapis: lapis.malha(api.MAT), pa: pa.malha(api.MAT), pizza: null };
      A.m.bracoE.cotovelo.add(o.bloco); A.m.bracoD.cotovelo.add(o.lapis);
      o.pa.position.set(0.28, 0.98, 0.0); A.m.corpo.add(o.pa);
      const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.62), new THREE.MeshLambertMaterial({ transparent: true, alphaTest: 0.5 }));
      pl.rotation.x = -Math.PI / 2; pl.position.set(0.5, 1.02, 0); A.m.corpo.add(pl); o.pizza = pl;
      const cx = new THREE.Group(); cx.add(caixaMesh()); cx.position.set(0.5, 1.0, 0); A.m.corpo.add(cx); o.caixa = cx;
      for (const k of ['bloco', 'lapis', 'pa', 'pizza', 'caixa']) o[k].visible = false;
      A.obj = o; return o;
    }
    // a caixa de pizza (papelão com a tampa da Forno a Lenha)
    function caixaMesh() {
      const g = new THREE.Group(), G = new api.Geo(); G.box(0.48, 0.07, 0.48, '#e8dcc0', 0, 0, 0);
      g.add(G.malha(api.MAT));
      const tampa = new THREE.Mesh(new THREE.PlaneGeometry(0.47, 0.47), new THREE.MeshLambertMaterial({ map: texDe(canvasCaixa(), 'caixa') }));
      tampa.rotation.x = -Math.PI / 2; tampa.position.y = 0.072; g.add(tampa);
      return g;
    }

    // ---------------------------------------------------------------- a fatia na mão (sprite que olha para a câmera, entre as mãos)
    function darFatia(A, id) {
      if (A.fatiaSp && A.fatiaId === id) return;
      tirarFatia(A);
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: texDe(canvasFatia(id), 'f:' + id), transparent: true, alphaTest: 0.1 }));
      sp.scale.set(0.26, 0.26, 1); sp.position.set(0.44, 1.32, 0); A.m.corpo.add(sp); A.fatiaSp = sp; A.fatiaId = id;
    }
    function tirarFatia(A) { if (A.fatiaSp) { if (A.fatiaSp.parent) A.fatiaSp.parent.remove(A.fatiaSp); A.fatiaSp.material.dispose(); } A.fatiaSp = null; A.fatiaId = null; }

    // ---------------------------------------------------------------- NAVEGAÇÃO NA PIZZARIA: grade de 0,35 m e A* (como no mercado.js)
    const CEL = 0.35, RR = 0.33;
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
      for (let r = 1; r < 12; r++) { let melhor = null, bd = 1e9;
        for (let dj = -r; dj <= r; dj++) for (let di = -r; di <= r; di++) { if (Math.max(Math.abs(di), Math.abs(dj)) !== r) continue; const a = i + di, b = j + dj; if (a < 0 || b < 0 || a >= N.nx || b >= N.nz || !N.livre[b * N.nx + a]) continue; const d = di * di + dj * dj; if (d < bd) { bd = d; melhor = [a, b]; } }
        if (melhor) return melhor; }
      return [i, j];
    }
    function pontoLivre(x, z) { if (livreEst(x, z)) return { x, z }; const [i, j] = celLivreMaisPerto(...cel(x, z)); return cen(i, j); }
    function vista(a, b) { const d = Math.hypot(b.x - a.x, b.z - a.z), n = Math.ceil(d / 0.12); for (let k = 1; k <= n; k++) { const u = k / n; if (!livreEst(a.x + (b.x - a.x) * u, a.z + (b.z - a.z) * u)) return false; } return true; }
    function caminho(x0, z0, x1, z1) {
      if (!M.nav) montarNav();
      const N = M.nav, fim = pontoLivre(x1, z1), [si, sj] = celLivreMaisPerto(...cel(x0, z0)), [ti, tj] = cel(fim.x, fim.z);
      if (vista({ x: x0, z: z0 }, fim)) return [fim];
      const idx = (i, j) => j * N.nx + i, n = N.nx * N.nz, g = new Float32Array(n).fill(1e9), de = new Int32Array(n).fill(-1), fechado = new Uint8Array(n);
      const h = (i, j) => Math.hypot(i - ti, j - tj), aberto2 = [[h(si, sj), si, sj]]; g[idx(si, sj)] = 0;
      let achou = false;
      while (aberto2.length) {
        let mi = 0; for (let k = 1; k < aberto2.length; k++) if (aberto2[k][0] < aberto2[mi][0]) mi = k;
        const [, i, j] = aberto2[mi]; aberto2[mi] = aberto2[aberto2.length - 1]; aberto2.pop();
        const k0 = idx(i, j); if (fechado[k0]) continue; fechado[k0] = 1;
        if (i === ti && j === tj) { achou = true; break; }
        for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
          if (!di && !dj) continue; const a = i + di, b = j + dj; if (a < 0 || b < 0 || a >= N.nx || b >= N.nz) continue;
          const k1 = idx(a, b); if (!N.livre[k1] || fechado[k1]) continue;
          if (di && dj && (!N.livre[idx(i + di, j)] || !N.livre[idx(i, j + dj)])) continue;
          const ng = g[k0] + (di && dj ? 1.414 : 1); if (ng < g[k1]) { g[k1] = ng; de[k1] = k0; aberto2.push([ng + h(a, b), a, b]); }
        }
      }
      if (!achou) return [fim];
      const cel2 = []; for (let k = idx(ti, tj); k >= 0; k = de[k]) cel2.push(cen(k % N.nx, Math.floor(k / N.nx)));
      cel2.reverse(); cel2.push(fim);
      const out = []; let a = { x: x0, z: z0 }, k = 0;
      while (k < cel2.length) { let far = k; for (let q = cel2.length - 1; q > k; q--) if (vista(a, cel2[q])) { far = q; break; } out.push(cel2[far]); a = cel2[far]; k = far + 1; }
      return out;
    }
    function genteNaFrente(A, nx, nz) {
      const s = S();
      for (const B of s.npcs.concat([s.jog])) { if (B === A || B.oculto || B.sentado) continue; const dn = Math.hypot(nx - B.x, nz - B.z); if (dn < 0.55 && dn < Math.hypot(A.x - B.x, A.z - B.z) - 1e-4) return true; }
      return false;
    }
    // anda pela rota (A.rotaP); devolve true quando chega. Gente na frente: espera, contorna e, se demorar, passa por ela.
    function andarP(A, dt) {
      const R = A.rotaP; if (!R || !R.length) { A.andando = false; return true; }
      const q = R[0], dx = q.x - A.x, dz = q.z - A.z, d = Math.hypot(dx, dz), v = (A.vel || 1.2) * dt;
      if (d <= Math.max(v, 0.04)) { A.x = q.x; A.z = q.z; R.shift(); A.esperaP = 0; if (!R.length) { A.andando = false; return true; } return false; }
      const tenta = (ux, uz, fantasma) => { const nx = A.x + ux * v, nz = A.z + uz * v; if (!livreEst(nx, nz) && livreEst(A.x, A.z)) return false; if (!fantasma && genteNaFrente(A, nx, nz)) return false; A.x = nx; A.z = nz; A.yawAlvo = Math.atan2(-uz, ux); return true; };
      const ux = dx / d, uz = dz / d, esp = A.esperaP || 0, paciencia = A === M.carla || A === M.mario ? 0.9 : 2.2;
      let ok = tenta(ux, uz, false);
      if (!ok && esp > 0.6) for (const ang of [0.6, -0.6, 1.1, -1.1]) { const c = Math.cos(ang), s2 = Math.sin(ang); if (tenta(ux * c - uz * s2, ux * s2 + uz * c, false)) { ok = true; break; } }
      if (!ok && esp > paciencia) ok = tenta(ux, uz, true);
      A.andando = ok; A.correndo = false; A.esperaP = ok ? Math.max(0, esp - dt * 2) : esp + dt;
      return false;
    }
    const irPara = (A, x, z) => { A.rotaP = caminho(A.x, A.z, x, z); };

    // ---------------------------------------------------------------- entrou / saiu (a sala vem do interiores.js, com R.pizzaria)
    function entrou(R, idx) {
      const s = S(); M.R = R; M.D = R.pizzaria || null; if (!M.D) return;
      s.falantesExtra = s.falantesExtra || {}; M.nav = null; montarNav();
      M.mesas = M.D.mesas.map((T0, i) => ({ i, x: T0.x, z: T0.z, assentos: T0.assentos.map((k) => idx[k]).filter(Boolean), grupo: null }));
      M.grupos = []; M.tarefas = []; M.prox = rnd(2, 5); M.avisos = []; M.tAviso = 0; M.pizzasMesa = new Map(); M.caixaPronta = false; M.caixaM = null;
      montarCardapio();
      if (equipeLa()) {
        M.mario = colocar('mario', criarMario, T('Mário'), 1, M.D.mario);
        M.carla = colocar('carla', criarCarla, T('Carla'), 0, M.D.carla);
        objetosCarla(M.carla); M.carla.estP = 'livre';
        if (aberto()) {                                                  // já tem gente quando você entra, cada grupo num ponto da visita
          const alvo = alvoGrupos(), livres = M.mesas.filter(mesaLivre).sort(() => Math.random() - 0.5);   // (a mesa do encontro com a Lúcia já vem reservada)
          for (let i = 0; i < Math.max(0, alvo - 1) && i < livres.length; i++) novoGrupo(livres[i], pk(['come', 'come', 'come', 'espera']));
        }
        if (U()) mostrarCaixaPronta(!M.pedido);
      }
      SOM.porta();
    }
    function colocar(chave, criarFn, nome, voz, p) {
      const s = S(), A = criarFn(); s.npcs.push(A);
      s.falantesExtra[chave] = { A, nome, voz };
      const q = pontoLivre(p.x, p.z); A.x = q.x; A.z = q.z; A.yaw = A.yawAlvo = p.yaw || 0;
      return A;
    }
    function saiu() {
      const s = S();
      for (const [, m] of M.pizzasMesa) if (m.parent) m.parent.remove(m);
      M.pizzasMesa = new Map();
      if (s.falantesExtra) { delete s.falantesExtra.mario; delete s.falantesExtra.carla; }
      for (const A of s.npcs) tirarFatia(A);
      if (M.tAviso > 0 || M.avisos.length) api.aviso('');
      if (s.jog) { s.jog.esperaPedido = false; tirarFatia(s.jog); }
      if (M.pedJog && M.pedJog.fase !== 'come') { s.dados.fakes += PRECO_PIZZA; api.mostrarDinheiro(true); }   // saiu (a pizzaria fechou) antes da pizza chegar: devolve o dinheiro
      M.pedJog = null;
      M.R = null; M.D = null; M.mario = null; M.carla = null; M.nav = null; M.grupos = []; M.tarefas = []; M.mesas = null; M.caixaM = null; M.avisos = []; M.tAviso = 0;
    }
    // o quadro do cardápio na parede (com a pixel art dos 8 sabores)
    function montarCardapio() {
      const P = M.D.cardapio; if (!P) return;
      const W = 160, H = 96, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
      g.fillStyle = '#1f2a22'; g.fillRect(0, 0, W, H); g.fillStyle = '#6a4428'; g.fillRect(0, 0, W, 3); g.fillRect(0, H - 3, W, 3); g.fillRect(0, 0, 3, H); g.fillRect(W - 3, 0, 3, H);
      g.fillStyle = '#f2efe6'; g.font = 'bold 9px monospace'; g.textAlign = 'center'; g.fillText('PIZZAS · 100', W / 2, 12);
      SABORES.forEach((sb, i) => {
        const cx = 8 + (i % 4) * 38, cy = 17 + Math.floor(i / 4) * 39;
        g.drawImage(canvasPizza(sb.id, 8), cx + 3, cy, 28, 28);
        g.fillStyle = '#f2efe6'; g.font = '5px monospace'; g.fillText(sb.nome.split(' ')[0].toUpperCase().slice(0, 10), cx + 17, cy + 35);
      });
      const tx = new THREE.CanvasTexture(cv); tx.magFilter = THREE.NearestFilter; tx.minFilter = THREE.LinearFilter; M.tex.set('cardapio' + Math.random(), tx);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 1.5), new THREE.MeshLambertMaterial({ map: tx })); m.position.set(P.x, P.y, P.z); M.R.grupo.add(m);
    }

    // ---------------------------------------------------------------- CLIENTES (grupos de 1 ou 2 por mesa)
    const FLUXO = ['vazio', 'vazio', 'vazio', 'medio', 'cheio', 'cheio', 'cheio'];
    function alvoGrupos() { const f = FLUXO[api.diaSemana()], n = M.mesas ? M.mesas.length : 8; return Math.min(n - 2, f === 'vazio' ? 2 : f === 'medio' ? 4 : 6); }
    const mesaLivre = (T0) => !T0.grupo && T0.assentos.every((a) => !a.ocupado);
    // onde a pessoa fica de pé ao lado da cadeira (do lado do corredor do meio)
    function pontoDaCadeira(a, T0) { const lado = T0.z < 1.4 ? 1 : -1; return pontoLivre(a.x, a.z + lado * 0.72); }
    // onde a Carla fica para anotar/servir (do lado da mesa que não tem cadeira, virado para o corredor)
    function pontoDaCarla(T0) { return pontoLivre(T0.x, T0.z - 0.95); }
    function novoGrupo(T0, fase) {
      const s = S(), n = Math.random() < 0.6 ? 2 : 1, g = { mesa: T0, membros: [], fase: fase || 'entra', sabor: pk(SABORES).id, estado: 0, t: 0, tEst: 0 };
      T0.grupo = g;
      for (let i = 0; i < n; i++) {
        const a = T0.assentos[i], A = api.criarPessoa(s.f2, Math.random, Math.random() < 0.5);
        A.tipo = 'clientePz'; A.vel = 1.1 + Math.random() * 0.3; A.pz = { g, a }; a.ocupado = A;
        if (g.fase === 'entra') {
          const e = entradaLivre(i); A.x = e.x; A.z = e.z; A.yaw = A.yawAlvo = Math.PI / 2;
          const p = pontoDaCadeira(a, T0); A.rotaP = caminho(A.x, A.z, p.x, p.z);
        } else { sentarNPC(A, a); }
        s.npcs.push(A); api.poseAtor(A, 0.016); g.membros.push(A);
      }
      M.grupos.push(g);
      if (g.fase === 'entra') SOM.porta();
      else if (g.fase === 'espera') { g.t = 0; M.tarefas.push({ tipo: 'anotar', g }); }
      else if (g.fase === 'come') { g.estado = Math.floor(Math.random() * 3); g.tEst = rnd(2, 7); mostrarPizzaMesa(T0, g.sabor, g.estado); for (const A of g.membros) { A.comendo = 1; darFatia(A, g.sabor); } }
      return g;
    }
    function entradaLivre(k) { const e = M.R.entrada; return pontoLivre(e.x + (k ? 0.9 : 0), e.z + (k ? 0.3 : 0)); }
    function sentarNPC(A, a) { A.sentado = true; A.x = a.x; A.z = a.z; A.assento = a.h; A.yaw = A.yawAlvo = a.yaw; A.andando = false; A.rotaP = null; }
    function levantarNPC(A) { const a = A.pz.a, p = pontoDaCadeira(a, A.pz.g.mesa); A.sentado = false; A.assento = 0.52; A.x = p.x; A.z = p.z; A.comendo = 0; tirarFatia(A); }
    function mostrarPizzaMesa(T0, id, estado) {
      let m = M.pizzasMesa.get(T0.i);
      if (estado == null || estado >= ESTADOS.length) { if (m) { if (m.parent) m.parent.remove(m); m.material.dispose(); M.pizzasMesa.delete(T0.i); } return; }
      if (!m) {
        m = new THREE.Mesh(new THREE.PlaneGeometry(0.82, 0.82), new THREE.MeshLambertMaterial({ transparent: true, alphaTest: 0.5 }));
        m.rotation.x = -Math.PI / 2; m.position.set(T0.x, 0.812, T0.z); M.R.grupo.add(m); M.pizzasMesa.set(T0.i, m);
      }
      const t = texPizza(id, ESTADOS[estado]); if (m.material.map !== t) { m.material.map = t; m.material.needsUpdate = true; }
    }
    function tickFluxo(dt) {
      if (!M.mesas || !M.carla) return;
      M.prox -= dt; if (M.prox > 0) return; M.prox = rnd(7, 14);
      if (!aberto() || hora() >= H_ULTIMO_GRUPO) return;
      const ativos = M.grupos.filter((g) => g.fase !== 'sai').length;
      if (ativos >= alvoGrupos()) return;
      const livres = M.mesas.filter(mesaLivre); if (livres.length < 3) return;   // nunca lota
      novoGrupo(pk(livres), 'entra');
    }
    // (chamado pela cidade em tickPessoas para cada cliente)
    function tickCliente(A, dt) {
      const P = A.pz; if (!P || !M.D) return; const g = P.g;
      if (A.saindo) { A.tSai = (A.tSai || 0) + dt; const sd = M.R.saida; if (andarP(A, dt) || Math.hypot(A.x - sd.x, A.z - sd.z) < 1.0 || A.tSai > 25) sairCliente(A); return; }
      if (g.fase === 'entra') {
        if (!A.sentado) { A.tEntra = (A.tEntra || 0) + dt; if (andarP(A, dt) || A.tEntra > 30) sentarNPC(A, P.a); }
        if (g.membros.every((B) => B.sentado)) { g.fase = 'espera'; g.t = 0; M.tarefas.push({ tipo: 'anotar', g }); }
      } else if (g.fase === 'paga') {
        if (A.rotaP && A.rotaP.length) andarP(A, dt); else { A.andando = false; A.yawAlvo = Math.PI / 2; }   // no caixa, olhando o Mário
      }
    }
    function sairCliente(A) {
      const s = S(), g = A.pz && A.pz.g; tirarFatia(A); api.descartarPessoa(A);
      if (g) { g.membros = g.membros.filter((B) => B !== A && s.npcs.includes(B)); if (!g.membros.length) { M.grupos = M.grupos.filter((q) => q !== g); if (g.mesa.grupo === g) g.mesa.grupo = null; } }
    }
    // a vida do grupo (o que não é andar: comer, levantar, pagar)
    function tickGrupos(dt) {
      const s = S();
      for (const g of M.grupos.slice()) {
        g.membros = g.membros.filter((A) => s.npcs.includes(A));
        if (!g.membros.length) { M.grupos = M.grupos.filter((q) => q !== g); if (g.mesa.grupo === g) g.mesa.grupo = null; continue; }
        g.t += dt;
        if (g.fase === 'espera') { const k = Math.floor(g.t / 2.6) % 3; g.membros.forEach((A, i) => { A.fala = g.membros.length > 1 && k === i; }); }   // conversando enquanto esperam
        else if (g.fase === 'anota') { const k = Math.floor(g.t / 0.9) % 2; g.membros.forEach((A, i) => { A.fala = k === (i % 2); }); }
        else if (g.fase === 'come') {
          g.tEst -= dt;
          for (const A of g.membros) { A.comendo = 1; darFatia(A, g.sabor); A.fala = false; }
          if (g.tEst <= 0) {
            g.estado++; g.tEst = rnd(6, 10);
            mostrarPizzaMesa(g.mesa, g.sabor, g.estado);
            if (g.estado >= ESTADOS.length) {                            // comeram tudo: levantam e vão pagar
              for (const A of g.membros) levantarNPC(A);
              for (const a of g.mesa.assentos) if (a.ocupado && a.ocupado.pz && a.ocupado.pz.g === g) a.ocupado = null;
              g.fase = 'paga'; g.t = 0; g.pagou = false;
              const P = M.D.pagar; g.membros.forEach((A, i) => { A.rotaP = caminho(A.x, A.z, P.x - i * 0.75, P.z + i * 0.35); });
            }
          }
        } else if (g.fase === 'paga') {
          const P = M.D.pagar, chegou = g.membros[0] && !(g.membros[0].rotaP && g.membros[0].rotaP.length) && Math.hypot(g.membros[0].x - P.x, g.membros[0].z - P.z) < 1.2;
          if (chegou && M.mario && !M.mario.conversando) {
            g.tc = (g.tc || 0) + dt; M.mario.cobrando = g.tc < 1.8; g.membros[0].fala = g.tc < 0.9;
            if (g.tc > 1.0 && !g.pagou) { g.pagou = true; api.somCaixa(); }
            if (g.tc > 2.0) { M.mario.cobrando = false; g.fase = 'sai'; for (const A of g.membros) { A.fala = false; A.saindo = true; A.rotaP = caminho(A.x, A.z, M.R.saida.x, M.R.saida.z); } if (g.mesa.grupo === g) g.mesa.grupo = null; }
          } else if (g.t > 30) { g.fase = 'sai'; for (const A of g.membros) { A.saindo = true; A.rotaP = caminho(A.x, A.z, M.R.saida.x, M.R.saida.z); } if (g.mesa.grupo === g) g.mesa.grupo = null; }
        }
      }
    }

    // ---------------------------------------------------------------- A CARLA: anota → bancada → forno → leva (fila de tarefas)
    //   tarefas: { tipo: 'anotar', g } (anota e já faz a pizza da mesa) · { tipo: 'entrega' } (caixa para a retirada) · { tipo: 'jogador' }
    function proximaTarefa() {
      const T0 = M.tarefas; if (!T0.length) return null;
      const i = Math.max(T0.findIndex((t) => t.tipo === 'jogador'), -1), j = T0.findIndex((t) => t.tipo === 'entrega');
      const k = i >= 0 ? i : j >= 0 ? j : 0; return T0.splice(k, 1)[0];
    }
    function passosDa(t) {
      const D = M.D, c = D.carla, f = D.forno;
      const mesa = t.tipo === 'anotar' ? t.g.mesa : t.tipo === 'jogador' ? (M.pedJog && M.pedJog.mesa) : null;
      const L = [];
      if (t.tipo === 'anotar') { const p = pontoDaCarla(mesa); L.push({ ir: p, olha: mesa }, { pose: 'anota', s: 2.4, ao: 'anotou' }); }
      L.push({ ir: c, yaw: c.yaw }, { pose: 'massa', s: t.tipo === 'anotar' ? 2.6 : 1.8 });
      L.push({ ir: f, yaw: f.yaw }, { pose: 'forno', s: t.tipo === 'anotar' ? 3.2 : 2.4, ao: 'forno' }, { pose: 'forno2', s: 0.5, ao: 'tirou' });
      if (t.tipo === 'entrega') L.push({ ir: { x: D.retirada.x, z: D.balcaoEntrega.z - 0.85 }, yaw: -Math.PI / 2 }, { pose: 'poe', s: 0.7, ao: 'caixa' });
      else if (mesa) { const p = pontoDaCarla(mesa); L.push({ ir: p, olha: mesa }, { pose: 'poe', s: 0.7, ao: 'serviu' }); }
      return L;
    }
    function tickCarla(dt) {
      const C = M.carla; if (!C) return;
      const o = objetosCarla(C);
      if (C.conversando) { C.andando = false; C.poseP = null; return; }
      if (!C.tarefa) {
        const t = proximaTarefa();
        if (t) {
          if (t.tipo === 'anotar' && (!t.g || !M.grupos.includes(t.g) || t.g.fase !== 'espera')) return;
          C.tarefa = t; C.passos = passosDa(t); C.passo = null; o.pizza.visible = false; o.caixa.visible = false;
          if (t.tipo === 'anotar') t.g.fase = 'aguarda';
        } else {                                                         // sem nada: na bancada, abrindo massa devagar
          const c = M.D.carla;
          if (Math.hypot(C.x - c.x, C.z - c.z) > 0.3) { if (!C.rotaP || !C.rotaP.length) irPara(C, c.x, c.z); andarP(C, dt); C.poseP = null; }
          else { C.andando = false; C.yawAlvo = c.yaw; C.poseP = 'massaLenta'; }
          return;
        }
      }
      if (!C.passo) {
        C.passo = C.passos.shift();
        if (!C.passo) { C.tarefa = null; o.pizza.visible = false; o.caixa.visible = false; return; }
        if (C.passo.ir) irPara(C, C.passo.ir.x, C.passo.ir.z);
        C.passo.t = 0;
      }
      const P = C.passo, t = C.tarefa;
      if (P.ir) {
        C.poseP = o.pizza.visible || o.caixa.visible ? 'leva' : null;
        if (andarP(C, dt)) { C.yawAlvo = P.olha ? Math.atan2(-(P.olha.z - C.z), P.olha.x - C.x) : P.yaw; C.passo = null; }
        return;
      }
      C.andando = false; C.poseP = P.pose; P.t += dt;
      if (P.pose === 'forno') M.fogoK = 1;
      if (P.t < P.s) return;
      // o que acontece no fim de cada passo
      if (P.ao === 'anotou' && t.g) { t.g.fase = 'preparando'; for (const A of t.g.membros) A.fala = false; }
      else if (P.ao === 'forno') SOM.forno();
      else if (P.ao === 'tirou') { if (t.tipo === 'entrega') o.caixa.visible = true; else { const id = t.tipo === 'jogador' ? (M.pedJog && M.pedJog.sabor) : t.g.sabor; if (id) { o.pizza.material.map = texPizza(id, 8); o.pizza.material.needsUpdate = true; o.pizza.visible = true; } } }
      else if (P.ao === 'caixa') { o.caixa.visible = false; mostrarCaixaPronta(true); SOM.caixa(); }
      else if (P.ao === 'serviu') {
        o.pizza.visible = false; SOM.prato();
        if (t.tipo === 'anotar' && M.grupos.includes(t.g)) { const g = t.g; g.fase = 'come'; g.estado = 0; g.tEst = rnd(6, 10); mostrarPizzaMesa(g.mesa, g.sabor, 0); }
        else if (t.tipo === 'jogador' && M.pedJog) { M.pedJog.fase = 'come'; M.pedJog.t = 0; mostrarPizzaMesa(M.pedJog.mesa, M.pedJog.sabor, 0); }
      }
      C.passo = null;
    }
    // a caixa pronta na retirada (ponta oeste do balcão)
    function mostrarCaixaPronta(sim) {
      M.caixaPronta = !!sim;
      if (!M.R) return;
      if (sim && !M.caixaM) { const b = M.D.balcaoEntrega, c = caixaMesh(); c.position.set(b.x, b.y, b.z); c.rotation.y = 0.2; M.R.grupo.add(c); M.caixaM = c; }
      if (!sim && M.caixaM) { if (M.caixaM.parent) M.caixaM.parent.remove(M.caixaM); M.caixaM = null; }
    }

    // ---------------------------------------------------------------- as poses de quem trabalha (por cima do poseAtor)
    function posesEquipe() {
      const s = S(), t = s.t || 0;
      const C = M.carla;
      if (C) {
        const o = objetosCarla(C), m = C.m, p = C.andando ? (C.poseP === 'leva' ? 'leva' : null) : C.poseP;
        o.bloco.visible = o.lapis.visible = p === 'anota'; o.pa.visible = p === 'forno' || p === 'forno2';
        if (p && !C.fala) {
          if (p === 'massa' || p === 'massaLenta') {                    // abrindo a massa: as duas mãos empurram e puxam na bancada
            const v = p === 'massa' ? 7 : 3.2, w = Math.sin(t * v), w2 = Math.sin(t * v + Math.PI);
            m.bracoD.rotation.z = 0.95 + w * 0.22; m.bracoE.rotation.z = 0.95 + w2 * 0.22; m.bracoD.rotation.x = -0.25; m.bracoE.rotation.x = 0.25;
            usarCotovelo(m.bracoD, 0, 0.55 - w * 0.25); usarCotovelo(m.bracoE, 0, 0.55 - w2 * 0.25); m.corpo.rotation.z = -0.18 + Math.abs(w) * 0.05;
          } else if (p === 'anota') {                                    // bloquinho na mão esquerda, lápis na direita, escrevendo
            const w = Math.sin(t * 14) * 0.06;
            m.bracoE.rotation.z = 0.85; m.bracoE.rotation.x = 0.35; usarCotovelo(m.bracoE, 0, 1.3);
            m.bracoD.rotation.z = 0.8 + w; m.bracoD.rotation.x = -0.1; usarCotovelo(m.bracoD, 0, 1.45 + w);
            usarCabeca(m, -0.12);
          } else if (p === 'forno' || p === 'forno2') {                  // a pá entra e sai do forno
            const w = p === 'forno' ? Math.sin(t * 2.4) * 0.12 : -0.2;
            o.pa.position.x = 0.28 + w; m.bracoD.rotation.z = m.bracoE.rotation.z = 1.25; m.bracoD.rotation.x = -0.2; m.bracoE.rotation.x = 0.2;
            usarCotovelo(m.bracoD, 0, 0.2); usarCotovelo(m.bracoE, 0, 0.35); m.corpo.rotation.z = -0.12;
          } else if (p === 'leva' || p === 'poe') {                      // segurando a pizza (ou a caixa) na frente do corpo
            const k = p === 'poe' ? 0.25 : 0;
            m.bracoD.rotation.z = m.bracoE.rotation.z = 1.2 + k; m.bracoD.rotation.x = -0.32; m.bracoE.rotation.x = 0.32; usarCotovelo(m.bracoD, 0, 0.5); usarCotovelo(m.bracoE, 0, 0.5);
            if (p === 'poe') m.corpo.rotation.z = -0.3;
          }
        }
        if (C.andando && C.poseP === 'leva') { const m2 = C.m; m2.bracoD.rotation.z = m2.bracoE.rotation.z = 1.2; m2.bracoD.rotation.x = -0.32; m2.bracoE.rotation.x = 0.32; usarCotovelo(m2.bracoD, 0, 0.5); usarCotovelo(m2.bracoE, 0, 0.5); }
      }
      const Mr = M.mario;
      if (Mr && !Mr.andando && !Mr.fala) {
        const m = Mr.m;
        if (Mr.cobrando) { const w = Math.sin(t * 9), w2 = Math.sin(t * 9 + 1.7); m.bracoD.rotation.z = 0.95 + w * 0.3; m.bracoE.rotation.z = 0.85 + w2 * 0.25; usarCotovelo(m.bracoD, 0, 1.0 + w * 0.2); usarCotovelo(m.bracoE, 0, 1.1); }
        else { const w = Math.sin(t * 0.8); m.bracoD.rotation.z = m.bracoE.rotation.z = 0.5; usarCotovelo(m.bracoD, 0, 0.6 + w * 0.05); usarCotovelo(m.bracoE, 0, 0.6); m.corpo.rotation.z = -0.06; }   // mãos apoiadas no balcão
      }
    }

    // ---------------------------------------------------------------- interação lá dentro
    function alvos(v) {
      const s = S(), J = s.jog, D = M.D; if (!D) return;
      if (M.mario && equipeLa()) v.push({ x: M.mario.x, z: M.mario.z, r: 2.6, txt: T('Falar com o Mário'), fn: falarComMario, y: 2.5 });
      if (M.carla && !M.carla.tarefa) v.push({ x: M.carla.x, z: M.carla.z, r: 1.8, txt: T('Falar com a Carla'), fn: falarComCarla, y: 2.4 });
      if (podeComecar()) v.push({ x: D.pagar.x, z: D.pagar.z, r: 2.0, txt: T('Começar o turno'), fn: comecarTurno, y: 2.3, pri: true });
      if (U() && !M.pedido && !(U().fechando)) v.push({ x: D.retirada.x, z: D.retirada.z, r: 1.6, txt: M.caixaPronta ? T('Pegar o pedido') : T('O pedido ainda está no forno...'), fn: M.caixaPronta ? pegarPedido : async () => {}, y: 2.2, pri: M.caixaPronta });
    }
    // sentado numa mesa da pizzaria: pedir pizza ou levantar
    function alvosSentado() {
      const s = S(), J = s.jog, a = s.sentadoEm; if (!a || !M.mesas) return null;
      const v = [];
      if (!M.pedJog && aberto() && M.carla && !U()) v.push({ x: J.x, z: J.z, r: 9, txt: T('Pedir uma pizza'), fn: pedirPizza, pri: true });
      if (!J.esperaPedido) v.push({ x: J.x, z: J.z, r: 9, txt: T('Levantar'), fn: async () => { api.levantar(); } });
      return v;
    }
    const mesaDoAssento = (a) => (M.mesas || []).find((T0) => T0.assentos.includes(a)) || null;
    async function pedirPizza() {
      const s = S(), d = s.dados, J = s.jog, a = s.sentadoEm, mesa = mesaDoAssento(a); if (!mesa) return;
      const i = await cardapioUI(d.fakes);
      const sb = SABORES[i]; if (!sb) return;
      if (d.fakes < PRECO_PIZZA) { await api.fala('carla', T('Ih... tá faltando dinheiro aí, hein?')); Dialogo.esconder(); return; }
      d.fakes -= PRECO_PIZZA; api.somDinheiro(); api.mostrarDinheiro(false); api.gastoNaTela(PRECO_PIZZA);
      M.pedJog = { sabor: sb.id, mesa, fase: 'espera', t: 0, estado: 0 }; J.esperaPedido = true;
      if (mesa.grupo == null) mesa.grupo = { jogador: true, membros: [], fase: 'jogador' };
      M.tarefas.push({ tipo: 'jogador' });
      api.aviso(Tf('Saindo uma {0}!', T(sb.nome))); setTimeout(() => { const ss = S(); if (ss && ss.modo === 'livre') api.aviso(''); }, 2600);
    }
    function tickPedidoJogador(dt) {
      const P = M.pedJog, s = S(), J = s.jog; if (!P) return;
      if (!J.sentado || s.sentadoEm == null || mesaDoAssento(s.sentadoEm) !== P.mesa) { if (P.fase !== 'come') { J.esperaPedido = false; } }
      if (P.fase !== 'come') return;
      P.t += dt; J.comendo = 0.5; darFatia(J, P.sabor);
      const est = Math.min(ESTADOS.length, Math.floor(P.t / (COMIDA_SEG / ESTADOS.length)) + 1) - 1;
      if (est !== P.estado) { P.estado = est; mostrarPizzaMesa(P.mesa, P.sabor, est); }
      if (P.t >= COMIDA_SEG) { mostrarPizzaMesa(P.mesa, P.sabor, null); J.comendo = 0; tirarFatia(J); J.esperaPedido = false; if (P.mesa.grupo && P.mesa.grupo.jogador) P.mesa.grupo = null; M.pedJog = null; comeuPizza(P.sabor); }
    }
    async function comeuPizza(id) {
      const s = S(), d = s.dados, cheio = (d.fome || 0) <= 0;
      d.fome = 0; d.ruinsNoMes = d.ruinsNoMes || { mes: d.mes || 1, n: 0 }; d.ruinsNoMes.n++; d.comidas = (d.comidas || 0) + 1; d.comeuDia = d.dia;
      try { Espectros.mover('saudavel', SAUDE_PIZZA, 'comeu pizza'); Espectros.condicao('refeicaoPesada', true); if (cheio) Espectros.mover('saudavel', SAUDE_EXAGERO, 'comeu sem fome'); } catch (e) { console.warn('[Pizzaria] saúde:', e); }
      if (s.missao) { s.missao = ''; }
      api.gravar(d.ponto || 'chegada');
      if (s.modo !== 'livre') return;
      s.modo = 'cena'; api.UI().ctl.hidden = true;
      try {
        if (cheio) { await api.fala('jog', T('Acho que eu exagerei...')); s.vomitoT = 20; }
        else await api.fala('jog', T('Ufa... essa pizza matou a minha fome!'));
        if (Sono.deveAvisarSaude()) await api.fala('jog', T('Eu estou com hábitos não saudáveis, isso com certeza vai me prejudicar nos jogos....'));
        Dialogo.esconder();
      } catch (e) { console.error(e); }
      const ss = S(); if (ss && ss.ativo && ss.modo === 'cena') api.liberar();
    }
    // o cardápio (8 sabores com a pixel art), como o do seu Valdemar
    function cardapioUI(fakes) {
      return new Promise((res) => {
        const el = document.createElement('div'); el.id = 'pzCardapio';
        el.style.cssText = 'position:fixed;inset:0;z-index:22;display:grid;place-items:center;background:rgba(6,4,2,.6);padding:10px;box-sizing:border-box;';
        const card = document.createElement('div');
        card.style.cssText = 'width:min(620px,100%);max-height:96%;overflow:auto;background:#2a1206;border:4px solid #c8352b;color:#fff0c8;padding:10px 12px;box-sizing:border-box;display:flex;flex-direction:column;gap:8px;font-family:var(--font-body);';
        const h = document.createElement('div'); h.style.cssText = 'font:700 14px/1.2 var(--font-display);letter-spacing:.08em;text-transform:uppercase;color:#f2c230;';
        h.textContent = Tf('Cardápio da Forno a Lenha (você tem {0} fakes)', fakes);
        const grade = document.createElement('div'); grade.className = 'pzGrade';
        grade.style.cssText = 'display:flex;flex-wrap:nowrap;gap:8px;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;touch-action:pan-x;padding-bottom:6px;';
        const fim = (i) => { el.remove(); res(i); };
        SABORES.forEach((sb, i) => {
          const b = document.createElement('button'); b.type = 'button'; b.dataset.i = i;
          b.style.cssText = 'flex:0 0 118px;scroll-snap-align:start;display:flex;flex-direction:column;gap:4px;align-items:center;padding:8px 4px;background:#3a1c0a;border:3px solid #8a5a2a;color:#fff0c8;cursor:pointer;font:700 11px/1.2 var(--font-display);text-align:center;';
          b.appendChild(iconePizza(sb.id, 8, 72));
          const n = document.createElement('span'); n.textContent = T(sb.nome); const p = document.createElement('span'); p.style.color = '#f2c230'; p.textContent = PRECO_PIZZA + ' ' + T('fakes');
          b.append(n, p); b.onclick = () => fim(i); grade.appendChild(b);
        });
        const nada = document.createElement('button'); nada.type = 'button'; nada.className = 'pxBtn'; nada.textContent = T('Nada, obrigado'); nada.style.cssText = 'align-self:center;--p:var(--p2,2px);height:38px;padding:0 14px;font-size:12px;'; nada.onclick = () => fim(-1);
        card.append(h, grade, nada); el.appendChild(card); (document.getElementById('raizJogo') || document.body).appendChild(el);
      });
    }

    // ---- conversas
    const PAPOS_MARIO = [
      { p: 'Sabia que essa receita de massa era da minha avó?', a: ['Sério? Dá pra sentir!', 'Né? Por isso a gente não muda nada.'], b: ['Ela que te ensinou?', 'Ensinou! E eu ensinei a Carla, que hoje faz melhor que eu.'] },
      { p: 'Sexta e sábado isso aqui vira uma loucura!', a: ['Imagino!', 'Ainda bem que a Carla é rápida no forno.'], b: ['E dá conta?', 'Com pizza boa, a gente dá conta de tudo!'] },
      { p: 'Qual é o seu sabor preferido?', a: ['Calabresa, sempre!', 'Clássico! Não tem erro.'], b: ['A doce de chocolate!', 'A da Carla com morango? Ela capricha nessa!'] },
    ];
    async function falarComMario() {
      const s = S(), C = M.mario, J = s.jog;
      if (C) { C.yawAlvo = Math.atan2(-(J.z - C.z), J.x - C.x); C.conversando = true; }
      try { await conversaMario(); } finally { if (M.mario) { M.mario.conversando = false; M.mario.yawAlvo = M.D ? M.D.mario.yaw : M.mario.yawAlvo; } Dialogo.esconder(); }
    }
    async function conversaMario() {
      const s = S(), d = s.dados, dp = dadosP();
      if (!ehMeuEmprego()) {
        if (!dp.conheceu) { await api.fala('mario', T('Bem-vindo à Forno a Lenha! Senta aí que a Carla já te atende.')); dp.conheceu = true; api.gravar(d.ponto || 'chegada'); return; }
        const Q = PAPOS_MARIO[(dp.papo | 0) % PAPOS_MARIO.length]; dp.papo = (dp.papo | 0) + 1;
        await api.fala('mario', T(Q.p));
        const r = await Escolha.mostrar(T(Q.p), [T(Q.a[0]), T(Q.b[0])]);
        const R = r === 1 ? Q.b : Q.a; await api.fala('jog', T(R[0])); await api.fala('mario', T(R[1]));
        return;
      }
      if (!dp.apresentou) {
        await api.fala('mario', T('Ah, você é o novo entregador! Eu sou o Mário, o dono da Forno a Lenha.'));
        await api.fala('mario', T('Você trabalha de quinta a domingo, das 17h até a meia-noite.'));
        await api.fala('mario', T('Pega o pedido ali na ponta do balcão, põe na bicicleta lá fora e voa! O cliente fica esperando na frente de casa.'));
        await api.fala('mario', Tf('São 30 segundos para chegar. São {0} fakes por noite, mais {1} de gorjeta por entrega no prazo, e menos {2} por entrega atrasada.', PAGA, GORJETA, ATRASO));
        await api.fala('mario', T('E cuidado com a bicicleta! Se cair, a pizza amassa e o cliente não dá gorjeta.'));
        if (M.carla) { const C = M.carla; C.conversando = true; C.yawAlvo = Math.atan2(-(s.jog.z - C.z), s.jog.x - C.x); await api.fala('carla', T('E eu sou a Carla, a pizzaiola! Pode deixar que as pizzas saem quentinhas.')); C.conversando = false; }
        dp.apresentou = true; dp.conheceu = true; api.gravar('chegada');
      }
      if (U()) { await api.fala('mario', T('Bom trabalho! O próximo pedido tá saindo.')); return; }
      if (!diaDeTrabalho()) { await api.fala('mario', T('Hoje não é seu dia! Você trabalha de quinta a domingo, a partir das 17h.')); return; }
      if (d.trabalhouHoje) { await api.fala('mario', T('Seu turno de hoje já acabou. Bom descanso!')); return; }
      if (d.precisaBanho) { await api.fala('mario', T('Eita... você tá com cheiro de quem acabou de jogar bola! Vai tomar um banho e volta, beleza?')); return; }
      if (hora() >= H_ULTIMO_TURNO || hora() < 12) { await api.fala('mario', T('Já tá quase na hora de fechar, hoje não dá mais. Até a próxima!')); return; }
      Dialogo.esconder(); await perguntarEComecar();
    }
    async function falarComCarla() {
      const s = S(), C = M.carla, J = s.jog; if (!C) return;
      C.conversando = true; C.yawAlvo = Math.atan2(-(J.z - C.z), J.x - C.x);
      try { await api.fala('carla', T(pk(['Oi! Tô com as mãos na massa, literalmente!', 'O segredo é o forno bem quente!', U() ? 'Corre que essa tá quentinha!' : 'Tô no forno, já já sai mais uma!']))); }
      finally { if (M.carla) M.carla.conversando = false; Dialogo.esconder(); }
    }
    function podeComecar() {
      const s = S(), d = s.dados, h = hora();
      return ehMeuEmprego() && !!dadosP().apresentou && !s.turnoPizza && diaDeTrabalho() && !d.trabalhouHoje && !d.precisaBanho && h >= H_TURNO && h < H_ULTIMO_TURNO && !!M.mario;
    }
    async function comecarTurno() {
      const C = M.mario; if (C) { C.conversando = true; const J = S().jog; C.yawAlvo = Math.atan2(-(J.z - C.z), J.x - C.x); }
      try { await perguntarEComecar(); } finally { if (M.mario) M.mario.conversando = false; }
    }
    async function perguntarEComecar() {
      const r = await Escolha.mostrar(T('Quer começar o seu turno de entregas agora?'), [T('Sim, vamos trabalhar'), T('Ainda não')], { centro: true });
      Dialogo.esconder(); if (r !== 0) return;
      iniciarTurno();
    }

    // ================================================================ O TURNO (entregas de bicicleta)
    function iniciarTurno() {
      const s = S();
      s.turnoPizza = { entregas: 0, noPrazo: 0, amassadas: 0, atrasadas: 0, inicio: s.dados.hora, fim: false };
      s.trabalhando = true;
      mostrarCaixaPronta(true);
      montarPainel(); atualizarPainel();
      falaRapida(T('Mário'), T('Corre que essa tá quentinha!'));
    }
    function falaRapida(quem, txt) { M.avisos.push(quem + ': ' + txt); if (M.avisos.length === 1 && M.tAviso <= 0) proxAviso(); }
    function proxAviso() { const t = M.avisos[0]; if (!t) { api.aviso(''); return; } api.aviso(t); M.tAviso = 3.2; }
    function tickAvisos(dt) { if (M.tAviso <= 0) return; M.tAviso -= dt; if (M.tAviso <= 0) { M.avisos.shift(); if (M.avisos.length) proxAviso(); else { const s = S(); if (s && s.modo === 'livre') api.aviso(''); } } }
    function avisoRapido(txt, ms) { api.aviso(txt); clearTimeout(M.tAv2); M.tAv2 = setTimeout(() => { const s = S(); if (s && s.modo === 'livre' && !M.avisos.length) api.aviso(''); }, ms || 2600); }

    // ---- o pedido: { sabor, onde: 'mao'|'bike'|'chao'|null, caiu, t0, t, casa, cli, entregue }
    function pegarPedido() {
      const s = S(); if (!U() || M.pedido) { if (M.pedido) avisoRapido(T('Você já está com um pedido.')); return; }
      if (!M.caixaPronta) return;
      mostrarCaixaPronta(false);
      M.pedido = { sabor: pk(SABORES).id, onde: 'mao', caiu: false, t0: null, t: 0 };
      darCaixaNaMao(); SOM.caixa();
      M.tarefas.push({ tipo: 'entrega' });                               // a Carla já começa o próximo
      mostrarHud(true);
      s.missao = T('Entrega: leve a pizza até a bicicleta, na frente da pizzaria.'); api.mostrarMissao();
      const B = garantirBike(); api.definirMarca(B.x, B.z);
    }
    function darCaixaNaMao() { const J = S().jog; tirarCaixaDaMao(); const c = caixaMesh(); c.position.set(0.44, 0.86, 0); J.m.corpo.add(c); J.caixaPz = c; }
    function tirarCaixaDaMao() { const s = S(); if (!s || !s.jog) return; const J = s.jog; if (J.caixaPz && J.caixaPz.parent) J.caixaPz.parent.remove(J.caixaPz); J.caixaPz = null; }
    function poseCaixa(J) {
      if (!J.caixaPz) return; const m = J.m;
      m.bracoE.rotation.z = m.bracoD.rotation.z = 1.15; m.bracoE.rotation.x = 0.2; m.bracoD.rotation.x = -0.2; usarCotovelo(m.bracoE, 0, 0.6); usarCotovelo(m.bracoD, 0, 0.6);
    }

    // ---------------------------------------------------------------- A BICICLETA (na cidade)
    //   grupo (posição/yaw) → corpo (tomba de lado na queda) → quadro, rodas (giram), pedivela (gira), o caixote de entrega com a pizza.
    function garantirBike() {
      if (M.bike) return M.bike;
      const s = S(), g = new THREE.Group(), corpo = new THREE.Group(); g.add(corpo);
      const matQ = new THREE.MeshLambertMaterial({ color: 0xc8352b }), matP = new THREE.MeshLambertMaterial({ color: 0x1c1c1f }), matC = new THREE.MeshLambertMaterial({ color: 0xc9ced4 });
      const tubo = (x0, y0, x1, y1, esp, mat) => { const L = Math.hypot(x1 - x0, y1 - y0), m = new THREE.Mesh(new THREE.BoxGeometry(L, esp || 0.05, esp || 0.05), mat || matQ); m.position.set((x0 + x1) / 2, (y0 + y1) / 2, 0); m.rotation.z = Math.atan2(y1 - y0, x1 - x0); corpo.add(m); return m; };
      const rodas = [];
      for (const x of [-0.52, 0.52]) {
        const r = new THREE.Group(); r.position.set(x, 0.33, 0);
        r.add(new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.035, 6, 18), matP));
        for (let k = 0; k < 4; k++) { const raio = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.012, 0.012), matC); raio.rotation.z = k * Math.PI / 4; r.add(raio); }
        corpo.add(r); rodas.push(r);
      }
      const rear = { x: -0.52, y: 0.33 }, front = { x: 0.52, y: 0.33 }, selim = { x: -0.18, y: 0.86 }, guidao = { x: 0.36, y: 0.98 }, eixo = { x: -0.04, y: 0.36 };
      tubo(rear.x, rear.y, selim.x, selim.y - 0.04); tubo(rear.x, rear.y, eixo.x, eixo.y); tubo(eixo.x, eixo.y, selim.x, selim.y - 0.04);
      tubo(eixo.x, eixo.y, guidao.x - 0.05, guidao.y - 0.16); tubo(selim.x + 0.02, selim.y - 0.1, guidao.x - 0.05, guidao.y - 0.12);
      tubo(front.x, front.y, guidao.x, guidao.y, 0.045, matC);
      const sel = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.06, 0.15), matP); sel.position.set(selim.x, selim.y, 0); corpo.add(sel);
      const gui = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.04, 0.56), matC); gui.position.set(guidao.x, guidao.y + 0.02, 0); corpo.add(gui);
      for (const z of [-0.28, 0.28]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 0.1), matP); p.position.set(guidao.x, guidao.y + 0.02, z); corpo.add(p); }
      // pedivela + pedais
      const ped = new THREE.Group(); ped.position.set(eixo.x, eixo.y, 0);
      for (const sz of [-1, 1]) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.17, 0.02), matC); b.position.set(0, sz * 0.085, sz * 0.09); ped.add(b); const pe = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.025, 0.07), matP); pe.position.set(0, sz * 0.17, sz * 0.13); ped.add(pe); }
      corpo.add(ped);
      // o caixote de entrega atrás (bagageiro) e a caixa de pizza dentro dele
      const G = new api.Geo(); G.box(0.5, 0.03, 0.42, '#3a3a3e', -0.5, 0.74, 0);
      G.box(0.5, 0.18, 0.03, '#c8352b', -0.5, 0.77, 0.21); G.box(0.5, 0.18, 0.03, '#c8352b', -0.5, 0.77, -0.21); G.box(0.03, 0.18, 0.42, '#c8352b', -0.25, 0.77, 0); G.box(0.03, 0.18, 0.42, '#c8352b', -0.75, 0.77, 0);
      G.box(0.03, 0.42, 0.03, '#3a3a3e', -0.62, 0.33, 0.12); G.box(0.03, 0.42, 0.03, '#3a3a3e', -0.62, 0.33, -0.12);
      corpo.add(G.malha(api.MAT));
      const carga = caixaMesh(); carga.position.set(-0.5, 0.78, 0); carga.visible = false; corpo.add(carga);
      const desc = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.34, 0.03), matP); desc.position.set(-0.05, 0.18, 0.12); desc.rotation.x = -0.5; corpo.add(desc);   // descanso
      s.grupoCidade.add(g);
      M.bike = { g, corpo, rodas, ped, carga, desc, x: BIKE_PARADA.x, z: BIKE_PARADA.z, yaw: BIKE_PARADA.yaw, estado: 'parada', tomba: 0, giro: 0, pedal: 0 };
      posBike(); return M.bike;
    }
    function posBike() {
      const B = M.bike; if (!B) return;
      const y = api.altura(B.x, B.z); B.g.position.set(B.x, y, B.z); B.g.rotation.y = B.yaw;
      B.corpo.rotation.x = B.estado === 'caida' ? B.tomba * 1.42 : B.estado === 'parada' ? 0.08 : 0; B.corpo.position.y = B.estado === 'caida' ? B.tomba * 0.03 : 0;
      B.desc.visible = B.estado === 'parada';
      for (const r of B.rodas) r.rotation.z = -B.giro; B.ped.rotation.z = -B.pedal;
      B.carga.visible = !!(M.pedido && M.pedido.onde === 'bike');
    }
    function guardarBike() { const B = garantirBike(); B.x = BIKE_PARADA.x; B.z = BIKE_PARADA.z; B.yaw = BIKE_PARADA.yaw; B.estado = 'parada'; B.tomba = 0; posBike(); }
    const montado = () => !!(M.bike && M.bike.estado === 'montada');
    function subir() {
      const s = S(), J = s.jog, B = garantirBike(), P = M.pedido;
      if (P && P.onde === 'mao') { avisoRapido(T('Coloque a pizza na bicicleta antes de subir.')); return; }
      J.x = B.x - Math.cos(B.yaw) * SELIM; J.z = B.z + Math.sin(B.yaw) * SELIM; J.yaw = J.yawAlvo = B.yaw; J.rota = null; B.estado = 'montada';
      s.veiculo = { mult: VEL_BIKE, bater: bater, bloq: 0 };
      SOM.campainha();
      if (P && P.onde === 'bike' && P.t0 == null) comecarCorrida();
    }
    function descer(semPasso) {
      const s = S(), J = s.jog, B = M.bike; if (!B) return;
      s.veiculo = null; B.estado = 'parada'; posBike();
      if (!semPasso) { const sx = Math.sin(J.yaw) * 0.7, sz = Math.cos(J.yaw) * 0.7; for (const k of [1, -1]) { if (api.livre(J.x + sx * k, J.z + sz * k)) { J.x += sx * k; J.z += sz * k; break; } } }
    }
    // BATEU: a bicicleta tomba, a caixa voa para o chão e o jogador cambaleia
    function bater() {
      const s = S(), J = s.jog, B = M.bike, P = M.pedido; if (!B || B.estado !== 'montada') return;
      s.veiculo = null; B.estado = 'caida'; B.tomba = 0;
      SOM.bater(); J.esbarrao = 0.9; J.andando = false;
      const fx = Math.cos(J.yaw), fz = -Math.sin(J.yaw);
      for (const k of [[-0.55, 0.6], [-0.55, -0.6], [-0.9, 0]]) { const x = J.x + fx * k[0] - fz * k[1], z = J.z + fz * k[0] + fx * k[1]; if (api.livre(x, z)) { J.x = x; J.z = z; break; } }
      if (P && P.onde === 'bike') {
        P.onde = 'chao'; P.caiu = true;
        let q = null; for (const [d, l] of [[1.2, 0.7], [1.2, -0.7], [0.4, 1.1], [0.4, -1.1], [-0.3, 0.9]]) { const x = B.x + fx * d - fz * l, z = B.z + fz * d + fx * l; if (api.livreNPC(x, z, null, true, true)) { q = { x, z }; break; } }
        q = q || { x: B.x, z: B.z };
        P.chao = q; mostrarCaixaChao(q, B);
        avisoRapido(T('Você caiu da bicicleta! A pizza amassou...'), 3200);
        s.missao = T('Pegue a pizza e levante a bicicleta.'); api.mostrarMissao();
      } else avisoRapido(T('Você caiu da bicicleta!'), 2400);
      mostrarHud(!!P);
    }
    function mostrarCaixaChao(q, B) {
      tirarCaixaChao(); const s = S(), c = caixaMesh(); c.position.set(B ? B.x : q.x, api.altura(q.x, q.z) + 0.75, B ? B.z : q.z); c.rotation.y = Math.random() * 3; s.grupoCidade.add(c);
      M.caixaChao = { m: c, de: { x: c.position.x, z: c.position.z }, para: q, t: 0 };
    }
    function tirarCaixaChao() { if (M.caixaChao && M.caixaChao.m.parent) M.caixaChao.m.parent.remove(M.caixaChao.m); M.caixaChao = null; }
    function tickCaixaChao(dt) {
      const C = M.caixaChao; if (!C || C.t >= 1) return; C.t = Math.min(1, C.t + dt / 0.45);
      const y0 = api.altura(C.para.x, C.para.z), k = C.t;
      C.m.position.set(lerpN(C.de.x, C.para.x, k), y0 + 0.75 * (1 - k) + Math.sin(k * Math.PI) * 0.5 + 0.0, lerpN(C.de.z, C.para.z, k)); C.m.rotation.z = (1 - k) * 0.6; C.m.rotation.x = Math.sin(k * 9) * 0.3 * (1 - k);
    }

    // a missão certa para o momento da entrega (depois de cair, volta a apontar para o cliente)
    function missaoDaEntrega() {
      const s = S(), P = M.pedido; if (!P) return;
      if (P.onde === 'chao' || (M.bike && M.bike.estado === 'caida')) { s.missao = T('Pegue a pizza e levante a bicicleta.'); api.mostrarMissao(); return; }
      if (P.t0 == null) return;
      s.missao = T('Entrega: siga a marca até a casa do cliente. Você tem 30 segundos!'); api.mostrarMissao();
      if (P.casa) api.definirMarca(P.casa.sx, P.casa.sz);
    }
    // ---- o cliente esperando na frente de casa
    function distCaminho(x0, z0, x1, z1) {
      try { const r = api.caminhoRede(x0, z0, x1, z1); let d = 0, a = { x: x0, z: z0 }; for (const q of r) { d += Math.hypot(q.x - a.x, q.z - a.z); a = q; } return d; }
      catch (e) { return Math.hypot(x1 - x0, z1 - z0) * 1.3; }
    }
    function escolherCasa() {
      const s = S(), B = garantirBike(), cands = [];
      for (const c of s.casas || []) {
        if (c.marca || c.especial) continue;
        if (Math.hypot(c.sx - B.x, c.sz - B.z) > DIST_MAX) continue;
        const d = distCaminho(B.x, B.z, c.sx, c.sz);                       // pela rede de calçadas (o caminho de verdade)
        if (d < DIST_MIN || d > DIST_MAX) continue;
        if (!api.livreNPC(c.sx, c.sz, null, true)) continue;
        cands.push(c);
      }
      if (!cands.length) for (const c of s.casas || []) if (!c.marca && !c.especial) cands.push(c);
      return cands.length ? pk(cands) : null;
    }
    function comecarCorrida() {
      const s = S(), P = M.pedido, c = escolherCasa(); if (!P) return;
      P.t0 = s.t; P.t = 0; P.casa = c;
      if (c) {
        const A = api.criarPessoa(s.f2, Math.random, Math.random() < 0.5);
        A.tipo = 'clientePzRua'; A.x = c.sx; A.z = c.sz; A.yaw = A.yawAlvo = Math.atan2(-(c.sz - c.z), c.sx - c.x); A.vel = 1.2;
        s.npcs.push(A); api.poseAtor(A, 0.016); M.cliRua = A;
        s.falantesExtra = s.falantesExtra || {}; s.falantesExtra.clientePz = { A, nome: T('Cliente'), voz: 2 };
        // a pizzinha em cima da cabeça
        const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: texPizza(P.sabor, 8), transparent: true, alphaTest: 0.3, depthTest: false })); sp.scale.set(0.55, 0.55, 1); sp.renderOrder = 20; s.grupoCidade.add(sp); A.pzIcone = sp;
        api.definirMarca(c.sx, c.sz);
      }
      s.missao = T('Entrega: siga a marca até a casa do cliente. Você tem 30 segundos!'); api.mostrarMissao();
    }
    function tirarClienteRua() {
      const s = S(), A = M.cliRua; if (!A) return;
      if (A.pzIcone && A.pzIcone.parent) A.pzIcone.parent.remove(A.pzIcone); A.pzIcone = null;
      if (A.caixaPz && A.caixaPz.parent) A.caixaPz.parent.remove(A.caixaPz);
      if (s && s.falantesExtra) delete s.falantesExtra.clientePz;
      if (s && s.npcs.includes(A)) api.descartarPessoa(A);
      M.cliRua = null;
    }
    // ENTREGAR: o jogador desce (se estiver na bicicleta), entrega a caixa e o cliente responde
    async function entregar() {
      const s = S(), J = s.jog, P = M.pedido, A = M.cliRua, u = U() || s.turnoPizza; if (!P || !A) return;
      if (montado()) descer(true);
      s.modo = 'cena'; api.UI().ctl.hidden = true; J.andando = false;
      const atraso = P.t > PRAZO;
      try {
        J.yawAlvo = Math.atan2(-(A.z - J.z), A.x - J.x); A.yawAlvo = Math.atan2(-(J.z - A.z), J.x - A.x);
        if (P.onde !== 'mao') darCaixaNaMao();
        P.onde = null; P.entregue = true; if (M.bike) posBike(); tirarCaixaChao();
        await api.esperar(450);
        tirarCaixaDaMao(); const c = caixaMesh(); c.position.set(0.44, 0.86, 0); A.m.corpo.add(c); A.caixaPz = c; A.segura = true;
        if (A.pzIcone) A.pzIcone.visible = false;
        mostrarHud(false);
        if (u) u.entregas++;
        if (atraso) { if (u) u.atrasadas++; SOM.erro(); await api.fala('clientePz', T('Demorou, hein! A pizza já chegou fria.')); avisoRapido(Tf('Atrasada: −{0} fakes', ATRASO), 2600); }
        else if (P.caiu) { if (u) u.amassadas++; SOM.erro(); await api.fala('clientePz', T('Essa pizza veio toda amassada! Sem gorjeta para você!')); avisoRapido(T('Amassada: sem gorjeta'), 2600); }
        else { if (u) u.noPrazo++; SOM.certo(); api.somDinheiro(); await api.fala('clientePz', T(Math.random() < 0.5 ? 'Chegou rapidinho! Toma aqui a sua gorjeta.' : 'Valeu! Chegou quentinha!')); avisoRapido(Tf('No prazo! +{0} fakes de gorjeta', GORJETA), 2600); }
        Dialogo.esconder();
      } catch (e) { console.error(e); }
      // o cliente entra em casa com a pizza
      if (A && P.casa) { A.rotaRua = [{ x: P.casa.x, z: P.casa.z }]; A.entrando = true; M.entrandoRua.push(A); M.cliRua = null; if (s.falantesExtra) delete s.falantesExtra.clientePz; }
      M.pedido = null; atualizarPainel();
      if (s.turnoPizza && s.turnoPizza.fechando) { await encerrar(false); }
      else { s.missao = T('Volte para a pizzaria e pegue o próximo pedido.'); api.mostrarMissao(); const Pt = (api.PORTAS || []).find((q) => q.nome === 'pizzaria'); if (Pt) api.definirMarca(Pt.x, Pt.z); }
      const ss = S(); if (ss && ss.ativo && ss.modo === 'cena') api.liberar();
    }
    // quem já recebeu a pizza: anda até a porta de casa segurando a caixa e some
    function tickEntrandoRua(dt) {
      const s = S();
      for (const A of M.entrandoRua.slice()) {
        A.tEntra = (A.tEntra || 0) + dt;
        const m = A.m; m.bracoE.rotation.z = m.bracoD.rotation.z = 1.15; m.bracoE.rotation.x = 0.2; m.bracoD.rotation.x = -0.2; usarCotovelo(m.bracoE, 0, 0.6); usarCotovelo(m.bracoD, 0, 0.6);
        if (api.seguir(A, A.rotaRua, 1.2, dt) || A.tEntra > 6 || !s.npcs.includes(A)) {
          if (A.pzIcone && A.pzIcone.parent) A.pzIcone.parent.remove(A.pzIcone);
          if (s.npcs.includes(A)) api.descartarPessoa(A);
          M.entrandoRua = M.entrandoRua.filter((q) => q !== A);
        }
      }
    }
    function tickClienteRua(dt) {
      const s = S(), A = M.cliRua; if (!A) return;
      if (A.pzIcone) A.pzIcone.position.set(A.x, (A.y || 0) + 2.35 + Math.sin(s.t * 4) * 0.08, A.z);
      if (A.segura) { const m = A.m; m.bracoE.rotation.z = m.bracoD.rotation.z = 1.15; m.bracoE.rotation.x = 0.2; m.bracoD.rotation.x = -0.2; usarCotovelo(m.bracoE, 0, 0.6); usarCotovelo(m.bracoD, 0, 0.6); return; }
      const J = s.jog, d = Math.hypot(J.x - A.x, J.z - A.z);
      if (d < 30 && !A.fala) {                                          // acenando para o entregador
        A.yawAlvo = Math.atan2(-(J.z - A.z), J.x - A.x);
        const m = A.m; m.bracoD.rotation.z = 2.75; m.bracoD.rotation.x = -0.35 + Math.sin(s.t * 9) * 0.35; usarCotovelo(m.bracoD, 0, 0.2);
      }
    }

    // ---------------------------------------------------------------- interação na rua (a cidade chama quando o jogador está fora)
    function alvosRua(v) {
      const s = S(), J = s.jog, P = M.pedido, B = M.bike, A = M.cliRua;
      if (!U() && !P) { if (B && B.estado !== 'parada') guardarBike(); return; }
      if (!B) return;
      if (P && P.onde === 'chao' && P.chao) v.push({ x: P.chao.x, z: P.chao.z, r: 1.5, txt: T('Pegar a pizza'), fn: async () => { P.onde = 'mao'; tirarCaixaChao(); darCaixaNaMao(); SOM.caixa(); mostrarHud(true); missaoDaEntrega(); }, y: 1.2, pri: true });
      if (B.estado === 'caida') v.push({ x: B.x, z: B.z, r: 1.6, txt: T('Levantar a bicicleta'), fn: async () => { B.estado = 'parada'; B.tomba = 0; if (P && P.onde === 'mao') { P.onde = 'bike'; tirarCaixaDaMao(); } posBike(); SOM.caixa(); missaoDaEntrega(); }, y: 1.4, pri: !(P && P.onde === 'chao') });
      else if (B.estado === 'parada') {
        if (P && P.onde === 'mao') v.push({ x: B.x, z: B.z, r: 1.6, txt: T('Colocar a pizza na bicicleta'), fn: async () => { P.onde = 'bike'; tirarCaixaDaMao(); posBike(); SOM.caixa(); missaoDaEntrega(); }, y: 1.4, pri: true });
        else v.push({ x: B.x, z: B.z, r: 1.6, txt: T('Subir na bicicleta'), fn: async () => subir(), y: 1.4, pri: !!(P && P.onde === 'bike') });
      }
      if (P && A && !A.segura && (P.onde === 'mao' || (P.onde === 'bike' && B.estado === 'parada' && Math.hypot(B.x - A.x, B.z - A.z) < 5))) v.push({ x: A.x, z: A.z, r: 2.4, txt: T('Entregar a pizza'), fn: entregar, y: 2.4, pri: true });
    }
    // montado: só descer e entregar (portas, bancos etc. ficam para depois de descer)
    function alvosMontado() {
      const s = S(), J = s.jog, P = M.pedido, A = M.cliRua, v = [];
      if (P && A && !A.segura && P.onde === 'bike' && Math.hypot(J.x - A.x, J.z - A.z) < 2.8) return [{ x: A.x, z: A.z, r: 2.8, txt: T('Entregar a pizza'), fn: entregar, y: 2.4, pri: true }];   // perto do cliente: só entregar
      v.push({ x: J.x, z: J.z, r: 9, txt: T('Descer da bicicleta'), fn: async () => descer() });
      return v;
    }
    // a pose de quem está na bicicleta (por cima do poseAtor) e a bicicleta acompanhando
    function tickBike(dt) {
      const s = S(), B = M.bike; if (!B) return;
      const J = s.jog;
      if (B.estado === 'montada') {
        B.yaw = J.yaw; B.x = J.x + Math.cos(J.yaw) * SELIM; B.z = J.z - Math.sin(J.yaw) * SELIM;
        const v = J.andando ? (J.vel || 0) : 0; B.giro += v * dt / 0.3; B.pedal += v * dt / 0.75;
        const m = J.m, w = B.pedal, ALT = 0.2;
        m.raiz.position.y = J.y + ALT; m.raiz.rotation.x = 0; m.raiz.rotation.z = 0;
        m.corpo.rotation.z = -0.34;
        m.pernaE.rotation.z = 1.12 + Math.sin(w) * 0.42; m.pernaD.rotation.z = 1.12 - Math.sin(w) * 0.42;
        usarJoelhos(m, -1.35 - Math.cos(w) * 0.42, -1.35 + Math.cos(w) * 0.42);
        m.bracoE.rotation.z = m.bracoD.rotation.z = 1.22; m.bracoE.rotation.x = 0.1; m.bracoD.rotation.x = -0.1; usarCotovelo(m.bracoE, 0, 0.18); usarCotovelo(m.bracoD, 0, 0.18);
      } else {
        if (B.estado === 'caida') B.tomba = Math.min(1, B.tomba + dt / 0.35);
      }
      posBike();
    }

    // ---------------------------------------------------------------- HUD da entrega (sabor + pixel art + cronômetro)
    function mostrarHud(sim) {
      let el = document.getElementById('pzEntrega');
      if (!sim) { if (el) el.hidden = true; return; }
      if (!el) {
        el = document.createElement('div'); el.id = 'pzEntrega';
        el.style.cssText = 'position:fixed;z-index:9;left:50%;transform:translateX(-50%);top:calc(84px + env(safe-area-inset-top,0px));display:flex;align-items:center;gap:8px;background:rgba(42,18,6,.92);border:3px solid #f2c230;color:#fff0c8;padding:4px 10px 4px 6px;font:700 12px/1.2 var(--font-display);white-space:nowrap;max-width:calc(100% - 24px);pointer-events:none;';
        el.innerHTML = '<span class="pzIc"></span><span style="display:flex;flex-direction:column;gap:2px"><span class="pzNome"></span><span class="pzT" style="font-size:11px"></span></span>';
        (document.getElementById('raizJogo') || document.body).appendChild(el);
      }
      el.hidden = false; atualizarHud(true);
    }
    function atualizarHud(forca) {
      const el = document.getElementById('pzEntrega'), P = M.pedido; if (!el || el.hidden || !P) return;
      const ic = el.querySelector('.pzIc'); if (forca || ic.dataset.k !== P.sabor) { ic.dataset.k = P.sabor; ic.replaceChildren(iconePizza(P.sabor, 8, 40)); }
      const nome = Tf('Pedido: {0}', T(SABORES.find((q) => q.id === P.sabor).nome)) + (P.caiu ? ' ' + T('(amassada)') : '');
      let t, cor;
      if (P.t0 == null) { t = T('coloque na bicicleta e suba'); cor = '#fff0c8'; }
      else if (P.t <= PRAZO) { const r = Math.ceil(PRAZO - P.t); t = '⏱ ' + r + ' s'; cor = r <= 10 ? '#ff8a6a' : '#8fe04a'; }
      else { t = Tf('ATRASADA +{0} s', Math.floor(P.t - PRAZO)); cor = '#ff5a4a'; }
      const n = el.querySelector('.pzNome'), tt = el.querySelector('.pzT');
      if (n.textContent !== nome) n.textContent = nome; if (tt.textContent !== t) tt.textContent = t; tt.style.color = cor;
      el.style.borderColor = P.t0 != null && P.t > PRAZO ? '#c8352b' : '#f2c230';
    }

    // ---- o painel do turno (alto, no meio): hora, entregas, no prazo, atrasadas e "Acelerar"
    function montarPainel() {
      if (M.painel) { api.painelRecolhivel(M.painel); return; }
      const p = document.createElement('div'); p.id = 'pzTurno';
      p.style.cssText = 'position:fixed;z-index:9;left:50%;transform:translateX(-50%);top:calc(48px + env(safe-area-inset-top,0px));display:flex;align-items:center;gap:8px;background:rgba(42,18,6,.9);border:3px solid #c8352b;color:#fff0c8;padding:3px 6px 3px 8px;font:700 11px/1.2 var(--font-display);white-space:nowrap;max-width:calc(100% - 24px);';
      p.innerHTML = '<span class="pTxt"></span><button type="button" class="pxBtn pAcel" style="--p:var(--p2,2px);min-height:26px;font-size:9px;padding:0 6px"></button>';
      (document.getElementById('raizJogo') || document.body).appendChild(p);
      M.painel = p; M.pTxt = p.querySelector('.pTxt'); M.pAcel = p.querySelector('.pAcel'); M.pAcel.textContent = T('Acelerar final do turno');
      M.pAcel.onclick = () => { const s = S(); if (s && s.modo === 'livre' && U()) { api.som(); if (M.pedido) { avisoRapido(T('Termine a entrega antes.')); return; } s.modo = 'cena'; api.UI().ctl.hidden = true; acelerar().finally(() => { const ss = S(); if (ss && ss.ativo && ss.modo === 'cena') api.liberar(); }); } };
      api.painelRecolhivel(p);
    }
    function atualizarPainel() {
      const s = S(), u = s && s.turnoPizza; if (!u || !M.painel) return;
      const txt = api.fmtHora(s.dados.hora) + ' → 00:00 · ' + Tf('Entregas: {0}', u.entregas) + ' · ' + Tf('No prazo: {0}', u.noPrazo) + (u.atrasadas ? ' · ' + Tf('Atrasadas: {0}', u.atrasadas) : '');
      if (M.pTxt.textContent !== txt) M.pTxt.textContent = txt;
    }
    function fecharPainel() { if (M.painel) { api.fimPainel(M.painel); M.painel.remove(); M.painel = null; } }
    async function acelerar() {
      const r = await Escolha.mostrar(T('Acelerar até a meia-noite? Você recebe só pelas horas trabalhadas até agora.'), [T('Acelerar'), T('Continuar trabalhando')], { centro: true });
      Dialogo.esconder(); const s = S(); if (r !== 0 || !U() || M.pedido) return;
      const h = s.dados.hora; await api.preto(true, 450); s.dados.hora = 0.0; await encerrar(true, h, true); await api.preto(false, 450);
    }
    // (cidade: "Entrar no prédio" no meio do turno) encerra antes, pagando o que trabalhou
    async function encerrarAntes() {
      const r = await Escolha.mostrar(T('Encerrar o turno agora? Você recebe só pelas horas trabalhadas.'), [T('Encerrar o turno'), T('Continuar trabalhando')], { centro: true });
      Dialogo.esconder(); if (r !== 0 || !U()) return false;
      await encerrar(true, hora(), true); return true;
    }
    // ---- FIM DO TURNO: paga e conta como dia trabalhado
    async function encerrar(antes, hParou, semConversa) {
      const s = S(), u = s.turnoPizza, d = s.dados; if (!u || u.fim) return; u.fim = true;
      const hAbs = (h) => (h < 12 ? h + 24 : h);
      const ini = Math.max(H_TURNO, u.inicio <= H_CHEIO_ATE ? H_TURNO : u.inicio), fimH = antes ? clampN(hAbs(hParou), ini, H_FECHA) : H_FECHA;
      const frac = clampN((fimH - ini) / (H_FECHA - H_TURNO), 0, 1), base = Math.round(PAGA * frac), paga = Math.max(0, base + u.noPrazo * GORJETA - u.atrasadas * ATRASO);
      d.trabalhouHoje = true; d.trabalhouDia = d.dia; d.trabalhouAlgumDia = true; d.fakes += paga; api.somDinheiro(); api.ganhoNaTela(paga); api.mostrarDinheiro(true);
      s.trabalhando = false; fecharPainel(); mostrarHud(false); tirarCaixaDaMao(); tirarCaixaChao(); if (M.cliRua) tirarClienteRua();
      if (montado()) descer(true);
      M.pedido = null; mostrarCaixaPronta(false); M.tarefas = M.tarefas.filter((t) => t.tipo !== 'entrega');
      if (s.missao) { s.missao = ''; } api.definirMarca(null);
      guardarBike();
      api.gravar('chegada');
      const espera = s.modo !== 'livre'; if (!espera) { s.modo = 'cena'; api.UI().ctl.hidden = true; }
      M.avisos = []; M.tAviso = 0; api.aviso('');
      try {
        if (M.mario && s.dentro && !semConversa) {
          await api.fala('mario', T('Deu meia-noite! Fechou por hoje.'));
          await api.fala('mario', Tf('Você fez {0} entrega(s): {1} no prazo, {2} amassada(s) e {3} atrasada(s). Toma: {4} fakes.', u.entregas, u.noPrazo, u.amassadas, u.atrasadas, paga));
          Dialogo.esconder();
        } else avisoRapido(Tf('Turno encerrado: +{0} fakes', paga), 3600);
      } catch (e) { console.error(e); }
      s.turnoPizza = null;
      if (!espera && s.ativo && s.modo === 'cena') api.liberar();
      return paga;
    }
    function tickTurno(dt) {
      const s = S(), u = s.turnoPizza; if (!u || u.fim) return;
      const P = M.pedido;
      if (P && P.t0 != null) { P.t = s.t - P.t0; atualizarHud(); }
      const h = hora(), passou = h < 12;                                  // depois da meia-noite (o turno começa às 17h)
      if (passou && !u.fechando) {
        u.fechando = true; mostrarCaixaPronta(false);
        if (!P) { if (s.modo === 'livre') encerrar(false); else u.fimPendente = true; }
        else falaRapida(T('Mário'), T('Deu meia-noite! Termina essa entrega e o turno acaba.'));
      }
      if (u.fimPendente && s.modo === 'livre' && !M.pedido) { u.fimPendente = false; encerrar(false); }
      atualizarPainel();
    }
    // 00h com o jogador lá dentro (sem turno): o Mário avisa e ele sai
    async function fecharPizzaria() {
      const s = S(); s.modo = 'cena'; api.UI().ctl.hidden = true; api.aviso('');
      try { if (s.jog.sentado) api.levantar(); if (M.mario) { await api.fala('mario', T('Vamos fechar! Boa noite!')); Dialogo.esconder(); } await api.sairDoLugar(); } catch (e) { console.error(e); }
      const ss = S(); if (ss && ss.ativo && ss.modo === 'cena') api.liberar();
    }

    // ---- a cada quadro (depois do tickJogador e do tickPessoas)
    function tick(dt) {
      const s = S(); if (!s) return;
      const dentro = s.dentro && s.dentro.nome === 'pizzaria' && M.D;
      tickTurno(dt); tickAvisos(dt);
      if (dentro) {
        tickFluxo(dt); tickGrupos(dt); tickCarla(dt); posesEquipe(); tickPedidoJogador(dt);
        // o fogo do forno: tremeluz (mais forte quando a Carla está assando)
        M.fogoK = Math.max(0, M.fogoK - dt * 0.8);
        if (M.D.fogo) { const f = 0.75 + Math.sin(s.t * 13) * 0.08 + Math.sin(s.t * 7.3) * 0.07 + M.fogoK * 0.2; M.D.fogo.material.opacity = Math.min(1, f); M.D.fogo.material.color.setHSL(0.07 + Math.sin(s.t * 5) * 0.012, 1, 0.5 + M.fogoK * 0.12); }
        if (M.D.brilho) M.D.brilho.material.opacity = 0.14 + Math.sin(s.t * 9) * 0.03 + M.fogoK * 0.12;
        if (M.caixaM) M.caixaM.position.y = M.D.balcaoEntrega.y;
        if (!U() && !aberto() && s.modo === 'livre' && !M.fechando && hora() < 12) { M.fechando = true; fecharPizzaria().finally(() => { M.fechando = false; }); }
      } else if (!s.dentro) {
        garantirBike(); tickBike(dt); tickClienteRua(dt); tickEntrandoRua(dt); tickCaixaChao(dt);
      }
      poseCaixa(s.jog);
    }
    // (cidade: encontro com a Lúcia começando com a gente lá dentro) quem está na mesa dela vai embora, com a pizza
    function liberarMesa(x, z) {
      const T0 = (M.mesas || []).find((q) => Math.abs(q.x - x) < 1 && Math.abs(q.z - z) < 1); if (!T0) return;
      const g = T0.grupo; if (g && g.membros) for (const A of g.membros.slice()) { if (A.pz && A.pz.a && A.pz.a.ocupado === A) A.pz.a.ocupado = null; sairCliente(A); }
      M.grupos = M.grupos.filter((q) => q !== g); T0.grupo = null; mostrarPizzaMesa(T0, null, null);
      M.tarefas = M.tarefas.filter((t) => !(t.g && t.g === g));
    }
    // uma pizza inteira em pixel art (plano deitado), para quem quiser pôr numa mesa (a cidade usa no encontro com a Lúcia)
    function meshPizza(id) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.62), new THREE.MeshLambertMaterial({ map: texPizza(id, 8), transparent: true, alphaTest: 0.5 })); m.rotation.x = -Math.PI / 2; return m; }
    function limpar() {
      fecharPainel(); const el = document.getElementById('pzEntrega'); if (el) el.remove(); const c = document.getElementById('pzCardapio'); if (c) c.remove();
      for (const t of M.tex.values()) t.dispose(); M.tex.clear();
    }

    return {
      aberto, entrou, saiu, alvos, alvosSentado, alvosRua, alvosMontado, montado, tick, tickCliente, limpar, encerrarAntes, liberarMesa, meshPizza,
      emTurno: () => !!U(), _M: M,
      _f: { iniciarTurno, pegarPedido, subir, descer, bater, entregar, encerrar, comecarCorrida, escolherCasa, garantirBike, guardarBike, novoGrupo, mostrarPizzaMesa, pedirPizza, falarComMario, alvoGrupos, cardapioUI },
      _regras: { H_ABRE, H_FECHA, PAGA, GORJETA, ATRASO, PRAZO, PRECO_PIZZA, VEL_BIKE, DIAS_TRABALHO },
    };
  }

  window.FutebolJS.registrarFase({ id: 'pizzaria', nome: 'Pizzaria', nucleoMinimo: '6.1.0', iniciar: async () => {}, criar, SABORES, canvasPizza, canvasFatia });
})();
