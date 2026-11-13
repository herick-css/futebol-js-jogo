/* =====================================================================
   FUTEBOL JS · bar.js · O BAR DO JAIRO (arquivo SEPARADO, como restaurante.js)
   ---------------------------------------------------------------------
   7.1.5 — primeira versão.
   - Registrado com FutebolJS.registrarFase({ id: 'bar' }) só para o jogo saber baixar o arquivo; NÃO roda como fase.
     A cidade baixa em segundo plano e chama criar(api) (api = apiBar() da cidade). A sala vem do interiores.js (R.bar).
   - HORÁRIO: das 16h às 2h. O JAIRO (o dono, careca de bigode, com o pano no ombro) fica atrás do balcão: limpa os copos, tira chope
     e serve. MOVIMENTO: de segunda a quarta fica quase vazio, quinta enche um pouco e de sexta a domingo LOTA (o pico é das 21h à 1h).
   - O POVO: entra pela porta, escolhe o que fazer e troca de vez em quando: bebe na banqueta do balcão ou nas mesas (o copo fica no
     balcão/mesa e sobe para os goles), fica de pé conversando, DANÇA na pista (4 jeitos de dançar, no ritmo da música), FUMA na área
     de fumantes (o cigarro, a brasa e a fumaça) e assiste à sinuca. Com a casa lotada, a música muda e mais gente vai para a pista.
   - A MÚSICA: duas, feitas aqui (WebAudio): o TEMA do bar (um samba-rock de boteco: cavaquinho, surdo, pandeiro, tamborim, baixo e um
     sax com o tema) e uma MAIS INTENSA quando lota (128 bpm: bumbo reto, palmas, chimbal, baixo pulsando, acordes e arpejo).
     O piso da pista acende no ritmo; o globo gira e as luzes coloridas passeiam pelo chão.
   - O SEU VALDEMAR: fecha a lanchonete às 20h e vem a pé para o bar (na rua dá para ver). Lá dentro, pela hora: BEBE no balcão
     (até 22h40), DANÇA (até 23h30), JOGA SINUCA com alguém (até 0h36), FUMA (até 1h15) e vai para casa (1h20).
   - 15 PRODUTOS com pixel art (32 x 32): 6 bebidas alcoólicas, 3 sem álcool e 6 petiscos. A bebida alcoólica só é vendida DEPOIS do
     salto para os 18 anos (antes, o Jairo não vende). Efeitos: Saudável, a fome (petiscos), o porre (o personagem cambaleia e a tela
     escurece nas bordas; 3 doses no mesmo dia = RESSACA no próximo jogo; exagerou muito = vomita).
   - O HOMEM DE CAPUZ (sábado e domingo, das 18h20 à 1h30): vem de fora da cidade (na rua dá para ver ele chegando) e fica no cantinho
     escuro. Com ele dá para jogar no BICHO: 20 bichos (com a pixel art de cada um), todos com a mesma chance. Aposta-se uma
     quantia de fakes num bicho (1 por dia; conta pontos de PROBLEMÁTICO). No dia seguinte chega um E-MAIL dele com o bicho que saiu:
     acertou = 3 vezes o que apostou; errou = perdeu tudo.
   - A SINUCA: na mesa joga-se contra quem estiver lá (sinuca.js), só por diversão ou valendo 50 fakes (ganhou = recebe 100). Os
     oponentes têm dias, horários e habilidades diferentes; o SEU VALDEMAR (na hora da sinuca dele) é o mais difícil de todos.
   - Salva em historia.cidade (dados): bar = { conheceu, papoJ, teor, doses, bicho, sinuca, ... }.
   ===================================================================== */
(function () {
  'use strict';

  // ------------------------------------------------------------------ textos (pt → en, es, it, fr)
  const TRAD = {
    'Jairo': ['Jairo', 'Jairo', 'Jairo', 'Jairo'], 'Seu Valdemar': ['Mr. Valdemar', 'Don Valdemar', 'Signor Valdemar', 'M. Valdemar'],
    'Homem de capuz': ['Hooded man', 'Hombre encapuchado', 'Uomo incappucciato', 'Homme à capuche'],
    'Balcão do Jairo': ['Jairo’s counter', 'Barra de Jairo', 'Bancone di Jairo', 'Comptoir de Jairo'],
    'No balcão do Jairo': ['At Jairo’s counter', 'En la barra de Jairo', 'Al bancone di Jairo', 'Au comptoir de Jairo'],
    'Pedir algo': ['Order something', 'Pedir algo', 'Ordina qualcosa', 'Commander quelque chose'],
    'Conversar com o Jairo': ['Chat with Jairo', 'Hablar con Jairo', 'Chiacchiera con Jairo', 'Discuter avec Jairo'],
    'Levantar': ['Get up', 'Levantarse', 'Alzati', 'Se lever'], 'Nada': ['Nothing', 'Nada', 'Niente', 'Rien'],
    'O bar abre às 16h.': ['The bar opens at 4 PM.', 'El bar abre a las 16h.', 'Il bar apre alle 16.', 'Le bar ouvre à 16 h.'],
    'O bar já fechou.': ['The bar is already closed.', 'El bar ya cerró.', 'Il bar è già chiuso.', 'Le bar est déjà fermé.'],
    'Jogar sinuca': ['Play pool', 'Jugar al billar', 'Gioca a biliardo', 'Jouer au billard'],
    'Falar com o homem de capuz': ['Talk to the hooded man', 'Hablar con el encapuchado', 'Parla con l’uomo incappucciato', 'Parler à l’homme à capuche'],
    'Falar com o seu Valdemar': ['Talk to Mr. Valdemar', 'Hablar con don Valdemar', 'Parla con il signor Valdemar', 'Parler à M. Valdemar'],
    'Dançar': ['Dance', 'Bailar', 'Balla', 'Danser'], 'Dançando...': ['Dancing...', 'Bailando...', 'Sto ballando...', 'En train de danser...'],
    'Bebendo...': ['Drinking...', 'Bebiendo...', 'Sto bevendo...', 'En train de boire...'], 'Comendo...': ['Eating...', 'Comiendo...', 'Sto mangiando...', 'En train de manger...'],
    // o cardápio
    'Bar do Jairo ({0} fakes)': ['Jairo’s Bar ({0} fakes)', 'Bar de Jairo ({0} fakes)', 'Bar di Jairo ({0} fakes)', 'Bar de Jairo ({0} fakes)'],
    'Bebidas alcoólicas': ['Alcoholic drinks', 'Bebidas alcohólicas', 'Bevande alcoliche', 'Boissons alcoolisées'],
    'Sem álcool': ['Non-alcoholic', 'Sin alcohol', 'Analcoliche', 'Sans alcool'], 'Petiscos': ['Bar snacks', 'Picoteo', 'Stuzzichini', 'Amuse-gueules'],
    'Proibido para menores': ['Not for minors', 'Prohibido para menores', 'Vietato ai minori', 'Interdit aux mineurs'],
    'Álcool': ['Alcohol', 'Alcohol', 'Alcol', 'Alcool'], 'Petisco': ['Snack', 'Picoteo', 'Stuzzichino', 'Amuse-gueule'], 'Bebida': ['Drink', 'Bebida', 'Bevanda', 'Boisson'],
    'Nada, obrigado': ['Nothing, thanks', 'Nada, gracias', 'Niente, grazie', 'Rien, merci'], 'Nada, obrigada': ['Nothing, thanks', 'Nada, gracias', 'Niente, grazie', 'Rien, merci'],
    // os 15 produtos
    'Cerveja long neck': ['Long-neck beer', 'Cerveza long neck', 'Birra long neck', 'Bière long neck'],
    'Chope': ['Draft beer', 'Caña de cerveza', 'Birra alla spina', 'Demi pression'],
    'Caipirinha': ['Caipirinha', 'Caipiriña', 'Caipirinha', 'Caïpirinha'],
    'Dose de cachaça': ['Shot of cachaça', 'Chupito de cachaza', 'Bicchierino di cachaça', 'Shot de cachaça'],
    'Caipiroska de morango': ['Strawberry caipiroska', 'Caipiroska de fresa', 'Caipiroska alla fragola', 'Caïpiroska à la fraise'],
    'Batida de coco': ['Coconut batida', 'Batida de coco', 'Batida al cocco', 'Batida à la noix de coco'],
    'Refrigerante': ['Soda', 'Refresco', 'Bibita gassata', 'Soda'], 'Suco de laranja': ['Orange juice', 'Jugo de naranja', 'Succo d’arancia', 'Jus d’orange'],
    'Água com gás': ['Sparkling water', 'Agua con gas', 'Acqua frizzante', 'Eau gazeuse'],
    'Batata frita': ['French fries', 'Papas fritas', 'Patatine fritte', 'Frites'],
    'Bolinho de bacalhau': ['Cod fritters', 'Buñuelos de bacalao', 'Frittelle di baccalà', 'Beignets de morue'],
    'Calabresa acebolada': ['Sausage with onions', 'Longaniza encebollada', 'Salsiccia con cipolle', 'Saucisse aux oignons'],
    'Pastel de feira': ['Fried pastel', 'Pastel frito', 'Pastel fritto', 'Pastel frit'],
    'Amendoim torrado': ['Roasted peanuts', 'Maní tostado', 'Arachidi tostate', 'Cacahuètes grillées'],
    'Frango a passarinho': ['Fried chicken bites', 'Pollo frito en trocitos', 'Bocconcini di pollo fritti', 'Bouchées de poulet frit'],
    // Jairo
    'É pra já!': ['Coming right up!', '¡Ya mismo!', 'Arriva subito!', 'Tout de suite !'],
    'Taí: {0}. São {1} fakes.': ['Here you go: {0}. That’s {1} fakes.', 'Aquí tienes: {0}. Son {1} fakes.', 'Ecco: {0}. Sono {1} fakes.', 'Voilà : {0}. Ça fait {1} fakes.'],
    'Bebida alcoólica só pra maior de idade, campeão. Posso te servir um refri, um suco ou um petisco.': ['Alcohol is for adults only, champ. I can get you a soda, a juice or a snack.', 'Alcohol solo para mayores de edad, campeón. Te puedo servir un refresco, un jugo o algo para picar.', 'Alcol solo per maggiorenni, campione. Posso darti una bibita, un succo o uno stuzzichino.', 'L’alcool, c’est réservé aux majeurs, champion. Je peux te servir un soda, un jus ou un amuse-gueule.'],
    'Bebida alcoólica só pra maior de idade, campeã. Posso te servir um refri, um suco ou um petisco.': ['Alcohol is for adults only, champ. I can get you a soda, a juice or a snack.', 'Alcohol solo para mayores de edad, campeona. Te puedo servir un refresco, un jugo o algo para picar.', 'Alcol solo per maggiorenni, campionessa. Posso darti una bibita, un succo o uno stuzzichino.', 'L’alcool, c’est réservé aux majeures, championne. Je peux te servir un soda, un jus ou un amuse-gueule.'],
    'Tá faltando grana aí, hein?': ['You’re a little short on cash, huh?', 'Te falta plata, ¿eh?', 'Ti mancano un po’ di soldi, eh?', 'Il te manque un peu d’argent, hein ?'],
    'Bem-vindo ao Bar do Jairo! Cerveja gelada, petisco quente e a sinuca lá no fundo.': ['Welcome to Jairo’s Bar! Cold beer, hot snacks and the pool table in the back.', '¡Bienvenido al Bar de Jairo! Cerveza helada, picoteo caliente y el billar al fondo.', 'Benvenuto al Bar di Jairo! Birra fredda, stuzzichini caldi e il biliardo in fondo.', 'Bienvenue au Bar de Jairo ! Bière fraîche, amuse-gueules chauds et le billard au fond.'],
    'Bem-vinda ao Bar do Jairo! Cerveja gelada, petisco quente e a sinuca lá no fundo.': ['Welcome to Jairo’s Bar! Cold beer, hot snacks and the pool table in the back.', '¡Bienvenida al Bar de Jairo! Cerveza helada, picoteo caliente y el billar al fondo.', 'Benvenuta al Bar di Jairo! Birra fredda, stuzzichini caldi e il biliardo in fondo.', 'Bienvenue au Bar de Jairo ! Bière fraîche, amuse-gueules chauds et le billard au fond.'],
    'Só não vendo bebida pra menor de idade, tá? Regra da casa.': ['I just don’t sell alcohol to minors, okay? House rule.', 'Solo no le vendo alcohol a menores, ¿sí? Regla de la casa.', 'Solo non vendo alcol ai minorenni, va bene? Regola della casa.', 'Je ne vends juste pas d’alcool aux mineurs, d’accord ? Règle de la maison.'],
    'No fim de semana isso aqui lota. Durante a semana é mais sossegado.': ['On weekends this place gets packed. During the week it’s quieter.', 'El fin de semana esto se llena. Entre semana es más tranquilo.', 'Nel weekend qui è pieno. In settimana è più tranquillo.', 'Le week-end, c’est bondé. En semaine, c’est plus calme.'],
    'Movimento bom hoje!': ['Busy night tonight!', '¡Buen movimiento hoy!', 'Bel movimento stasera!', 'Belle affluence ce soir !'],
    'Sinal de que a cerveja tá gelada.': ['Means the beer is cold.', 'Señal de que la cerveza está helada.', 'Vuol dire che la birra è fredda.', 'Ça veut dire que la bière est bien fraîche.'],
    'Hoje tá parado, hein?': ['Slow tonight, huh?', 'Hoy está tranquilo, ¿eh?', 'Stasera è morto, eh?', 'C’est calme ce soir, hein ?'],
    'Meio de semana é assim. Espera o sábado pra ver.': ['Midweek is like that. Wait till Saturday.', 'Entre semana es así. Espera al sábado.', 'A metà settimana è così. Aspetta sabato.', 'En milieu de semaine, c’est comme ça. Attends samedi.'],
    'Esse bar é meio caído, né?': ['This bar is kind of a dump, huh?', 'Este bar está medio venido a menos, ¿no?', 'Questo bar è un po’ squallido, eh?', 'Ce bar est un peu miteux, non ?'],
    'Caído é o seu time, que perdeu domingo.': ['Your team is the dump, they lost on Sunday.', 'Venido a menos está tu equipo, que perdió el domingo.', 'Squallida è la tua squadra, che ha perso domenica.', 'Miteuse, c’est ton équipe, qui a perdu dimanche.'],
    'O seu Valdemar vem todo dia, sabia? Fecha a lanchonete e vem direto pra cá.': ['Mr. Valdemar comes every day, you know? He closes the snack bar and comes straight here.', 'Don Valdemar viene todos los días, ¿sabías? Cierra la cafetería y viene directo para acá.', 'Il signor Valdemar viene tutti i giorni, sai? Chiude la paninoteca e viene dritto qui.', 'M. Valdemar vient tous les jours, tu savais ? Il ferme sa buvette et vient directement ici.'],
    'Sério? Todo dia?': ['Really? Every day?', '¿En serio? ¿Todos los días?', 'Davvero? Tutti i giorni?', 'Sérieux ? Tous les jours ?'],
    'Todo santo dia. E na sinuca ninguém ganha dele.': ['Every single day. And nobody beats him at pool.', 'Todos los santos días. Y en el billar nadie le gana.', 'Ogni santo giorno. E a biliardo nessuno lo batte.', 'Tous les jours que Dieu fait. Et au billard, personne ne le bat.'],
    'Ele bebe demais.': ['He drinks too much.', 'Él bebe demasiado.', 'Beve troppo.', 'Il boit trop.'],
    'Ele trabalha doze horas por dia. Deixa o homem.': ['He works twelve hours a day. Leave the man alone.', 'Trabaja doce horas por día. Deja al hombre.', 'Lavora dodici ore al giorno. Lascialo stare.', 'Il bosse douze heures par jour. Laisse-le tranquille.'],
    'Ninguém ganha? Duvido.': ['Nobody? I doubt it.', '¿Nadie? Lo dudo.', 'Nessuno? Ne dubito.', 'Personne ? J’en doute.'],
    'Vai lá desafiar ele depois das onze e meia. Depois me conta.': ['Go challenge him after eleven thirty. Then tell me how it went.', 'Ve a desafiarlo después de las once y media. Después me cuentas.', 'Vai a sfidarlo dopo le undici e mezza. Poi mi racconti.', 'Va le défier après onze heures et demie. Tu me raconteras.'],
    // o jogador
    'Ahh... desceu redondo.': ['Ahh... that went down smooth.', 'Ahh... entró redondito.', 'Ahh... è andata giù liscia.', 'Ahh... ça passe tout seul.'],
    'Opa... a cabeça já tá girando.': ['Whoa... my head is already spinning.', 'Uy... la cabeza ya me da vueltas.', 'Ops... la testa mi gira già.', 'Oh là... ma tête tourne déjà.'],
    'Acho que já bebi demais por hoje... amanhã vou sentir.': ['I think I’ve had too much for today... I’ll feel it tomorrow.', 'Creo que ya bebí demasiado por hoy... mañana lo voy a sentir.', 'Credo di aver bevuto troppo per oggi... domani lo sentirò.', 'Je crois que j’ai trop bu pour aujourd’hui... je vais le sentir demain.'],
    'Refrescante!': ['Refreshing!', '¡Refrescante!', 'Rinfrescante!', 'Rafraîchissant !'],
    'Hmm, crocante! Mas é fritura pura...': ['Mmm, crunchy! But it’s pure grease...', '¡Mmm, crocante! Pero es pura fritura...', 'Mmm, croccante! Ma è puro fritto...', 'Mmm, croustillant ! Mais c’est de la pure friture...'],
    'Belisquei e matei a fome.': ['A little snack and I’m not hungry anymore.', 'Piqué algo y se me fue el hambre.', 'Ho spiluccato e mi è passata la fame.', 'J’ai grignoté et je n’ai plus faim.'],
    'Acho que eu exagerei...': ['I think I overdid it...', 'Creo que me pasé...', 'Credo di aver esagerato...', 'Je crois que j’ai exagéré...'],
    // Valdemar no bar
    'Ô, {0}! Depois de doze horas na chapa, eu mereço uma gelada, né?': ['Hey, {0}! After twelve hours at the griddle, I deserve a cold one, right?', '¡Eh, {0}! Después de doce horas en la plancha, me merezco una helada, ¿no?', 'Ehi, {0}! Dopo dodici ore alla piastra, mi merito una birra fresca, no?', 'Hé, {0} ! Après douze heures au grill, je mérite une bonne bière, non ?'],
    'Isso aqui é que é vida! Bora dançar, {0}!': ['This is the life! Let’s dance, {0}!', '¡Esto sí es vida! ¡Vamos a bailar, {0}!', 'Questa sì che è vita! Balliamo, {0}!', 'Ça, c’est la vie ! Allez, on danse, {0} !'],
    'Tá querendo apanhar na sinuca? Tô com o taco quente hoje!': ['Looking to get beaten at pool? My cue is on fire tonight!', '¿Quieres que te gane al billar? ¡Hoy tengo el taco caliente!', 'Vuoi prenderle a biliardo? Stasera la mia stecca è bollente!', 'Tu veux te prendre une raclée au billard ? Ma queue est en feu ce soir !'],
    'Só um cigarrinho e eu vou pra casa. Não conta pra ninguém que eu fumo, hein?': ['Just one cigarette and I’m off home. Don’t tell anyone I smoke, huh?', 'Solo un cigarrito y me voy a casa. No le cuentes a nadie que fumo, ¿eh?', 'Solo una sigaretta e vado a casa. Non dire a nessuno che fumo, eh?', 'Juste une petite cigarette et je rentre. Ne dis à personne que je fume, hein ?'],
    'Bora jogar uma!': ['Let’s play one!', '¡Juguemos una!', 'Giochiamone una!', 'On en fait une !'], 'Fica pra próxima.': ['Maybe next time.', 'Será la próxima.', 'Sarà per la prossima.', 'Ce sera pour la prochaine fois.'],
    // a sinuca (oponentes e frases)
    'Não tem ninguém pra jogar agora.': ['There’s nobody to play with right now.', 'No hay nadie para jugar ahora.', 'Non c’è nessuno con cui giocare adesso.', 'Il n’y a personne pour jouer maintenant.'],
    'Jogar contra quem?': ['Play against whom?', '¿Jugar contra quién?', 'Giocare contro chi?', 'Jouer contre qui ?'],
    'Agora não': ['Not now', 'Ahora no', 'Non ora', 'Pas maintenant'],
    'Valendo 50 fakes (ganhou, leva 100)': ['For 50 fakes (win and take 100)', 'Por 50 fakes (si ganas, te llevas 100)', 'Per 50 fakes (se vinci, ne prendi 100)', 'Pour 50 fakes (gagne et repars avec 100)'],
    'Só por diversão': ['Just for fun', 'Solo por diversión', 'Solo per divertimento', 'Juste pour le plaisir'],
    'Vale quanto?': ['What are we playing for?', '¿Por cuánto?', 'Per quanto?', 'On joue pour combien ?'],
    'Zé Pinguço': ['Drunk Zé', 'Zé Borrachín', 'Zé l’Ubriacone', 'Zé le Pochtron'], 'Dona Marlene': ['Mrs. Marlene', 'Doña Marlene', 'Signora Marlene', 'Mme Marlene'],
    'Tonhão': ['Big Tony', 'Toñón', 'Tonhão', 'Gros Toni'], 'Cleiton Taco de Ouro': ['Cleiton Golden Cue', 'Cleiton Taco de Oro', 'Cleiton Stecca d’Oro', 'Cleiton Queue d’Or'],
    '{0} ({1})': ['{0} ({1})', '{0} ({1})', '{0} ({1})', '{0} ({1})'],
    'Bora! Mas não chora depois, hein?': ['Let’s go! But no crying afterwards, huh?', '¡Vamos! Pero después no llores, ¿eh?', 'Andiamo! Ma poi non piangere, eh?', 'C’est parti ! Mais ne pleure pas après, hein ?'],
    'Hic! Bora... qual é a branca mesmo?': ['Hic! Let’s go... which one’s the cue ball again?', '¡Hic! Vamos... ¿cuál era la blanca?', 'Hic! Andiamo... qual è la bianca?', 'Hic ! Allez... c’est laquelle, la blanche ?'],
    'Vamos, querida. Jogo sinuca desde antes de você nascer.': ['Come on, dear. I’ve been playing pool since before you were born.', 'Vamos, querida. Juego al billar desde antes de que nacieras.', 'Andiamo, cara. Gioco a biliardo da prima che tu nascessi.', 'Allez, ma chère. Je joue au billard depuis avant ta naissance.'],
    'Vamos, querido. Jogo sinuca desde antes de você nascer.': ['Come on, dear. I’ve been playing pool since before you were born.', 'Vamos, querido. Juego al billar desde antes de que nacieras.', 'Andiamo, caro. Gioco a biliardo da prima che tu nascessi.', 'Allez, mon cher. Je joue au billard depuis avant ta naissance.'],
    'Encosta aí. Mas eu não alivio pra ninguém.': ['Step up. But I don’t go easy on anyone.', 'Acércate. Pero yo no le aflojo a nadie.', 'Fatti avanti. Ma io non faccio sconti a nessuno.', 'Approche. Mais je ne fais de cadeau à personne.'],
    'Taco de Ouro não perde. Escreve aí.': ['Golden Cue doesn’t lose. Write that down.', 'Taco de Oro no pierde. Anótalo.', 'Stecca d’Oro non perde. Scrivilo.', 'Queue d’Or ne perd pas. Note-le.'],
    'Hehe... quer mesmo apanhar do velho aqui? Vem!': ['Hehe... you really want the old man to beat you? Come on!', 'Jeje... ¿de verdad quieres que te gane el viejo? ¡Ven!', 'Ehehe... vuoi davvero prenderle dal vecchio? Vieni!', 'Héhé... tu veux vraiment te faire battre par le vieux ? Viens !'],
    'Boa! Joga bem, hein!': ['Nice! You play well!', '¡Bien! ¡Juegas bien, eh!', 'Bravo! Giochi bene, eh!', 'Bien joué ! Tu joues bien, hein !'],
    'Hehe, fica pra próxima!': ['Hehe, better luck next time!', '¡Jeje, será la próxima!', 'Ehehe, sarà per la prossima!', 'Héhé, ce sera pour la prochaine fois !'],
    'Ganhei do seu Valdemar!': ['I beat Mr. Valdemar!', '¡Le gané a don Valdemar!', 'Ho battuto il signor Valdemar!', 'J’ai battu M. Valdemar !'],
    'Ô loco... faz vinte anos que ninguém ganha de mim aqui. Respeito!': ['Wow... nobody has beaten me here in twenty years. Respect!', 'Uy... hace veinte años que nadie me gana aquí. ¡Respeto!', 'Accidenti... sono vent’anni che nessuno mi batte qui. Rispetto!', 'Ça alors... ça fait vingt ans que personne ne me bat ici. Respect !'],
    'Você não tem 50 fakes pra apostar.': ['You don’t have 50 fakes to bet.', 'No tienes 50 fakes para apostar.', 'Non hai 50 fakes da scommettere.', 'Tu n’as pas 50 fakes à parier.'],
    'Essa foi fácil.': ['That was easy.', 'Esa fue fácil.', 'Facile.', 'Trop facile.'], 'Olha essa!': ['Look at that!', '¡Mira esa!', 'Guarda questa!', 'Regarde-moi ça !'],
    'Ih, errei.': ['Oops, missed.', 'Uy, fallé.', 'Ops, sbagliato.', 'Oups, raté.'], 'A mesa tá torta!': ['The table is crooked!', '¡La mesa está torcida!', 'Il tavolo è storto!', 'La table est penchée !'],
    'Hic!': ['Hic!', '¡Hic!', 'Hic!', 'Hic !'], 'Cadê a caçapa?': ['Where’s the pocket?', '¿Dónde está la tronera?', 'Dov’è la buca?', 'Elle est où, la poche ?'],
    'Treinou, hein?': ['Been practicing, huh?', 'Entrenaste, ¿eh?', 'Hai fatto pratica, eh?', 'Tu as pratiqué, hein ?'], 'Aprende, criança.': ['Learn, kid.', 'Aprende, criatura.', 'Impara, giovane.', 'Apprends, la jeunesse.'],
    'Quarenta anos de sinuca, meu filho.': ['Forty years of pool, son.', 'Cuarenta años de billar, hijo.', 'Quarant’anni di biliardo, figliolo.', 'Quarante ans de billard, mon fils.'],
    'Quarenta anos de sinuca, minha filha.': ['Forty years of pool, dear.', 'Cuarenta años de billar, hija.', 'Quarant’anni di biliardo, figliola.', 'Quarante ans de billard, ma fille.'],
    'Hoje não é o meu dia.': ['Today’s not my day.', 'Hoy no es mi día.', 'Oggi non è la mia giornata.', 'Ce n’est pas mon jour.'],
    'Sorte de principiante!': ['Beginner’s luck!', '¡Suerte de principiante!', 'Fortuna del principiante!', 'La chance du débutant !'],
    'Taco de Ouro sempre ganha.': ['Golden Cue always wins.', 'Taco de Oro siempre gana.', 'Stecca d’Oro vince sempre.', 'Queue d’Or gagne toujours.'],
    // o homem de capuz e o bicho
    'Psiu... chega mais. Ninguém precisa saber, tá?': ['Psst... come closer. Nobody needs to know, okay?', 'Psst... acércate. Nadie tiene que saber, ¿sí?', 'Psst... avvicinati. Nessuno deve saperlo, ok?', 'Psst... approche. Personne n’a besoin de savoir, d’accord ?'],
    'Eu sou de fora, só venho no fim de semana. Aqui a gente faz uma fezinha no bicho.': ['I’m from out of town, I only come on weekends. Here we place a little bet on the animal game.', 'Soy de afuera, solo vengo los fines de semana. Aquí hacemos una apuestita al juego del bicho.', 'Vengo da fuori, vengo solo nel weekend. Qui si fa una puntatina al gioco degli animali.', 'Je viens d’ailleurs, je ne viens que le week-end. Ici, on fait un petit pari sur le jeu des animaux.'],
    'São 20 bichos. Você escolhe um e quanto quer apostar.': ['There are 20 animals. You pick one and how much you want to bet.', 'Son 20 bichos. Eliges uno y cuánto quieres apostar.', 'Sono 20 animali. Ne scegli uno e quanto vuoi puntare.', 'Il y a 20 animaux. Tu en choisis un et combien tu veux parier.'],
    'Amanhã eu te mando um e-mail dizendo qual bicho saiu. Todos têm a mesma chance.': ['Tomorrow I’ll send you an email saying which animal came out. They all have the same chance.', 'Mañana te mando un e-mail diciendo qué bicho salió. Todos tienen la misma chance.', 'Domani ti mando un’e-mail con l’animale uscito. Hanno tutti la stessa probabilità.', 'Demain je t’envoie un e-mail pour te dire quel animal est sorti. Ils ont tous la même chance.'],
    'Acertou, leva três vezes o que apostou. Errou, perdeu tudo.': ['Guess right and you get three times your bet. Guess wrong and you lose it all.', 'Si aciertas, te llevas tres veces lo apostado. Si fallas, pierdes todo.', 'Se indovini, prendi tre volte la puntata. Se sbagli, perdi tutto.', 'Tu gagnes, tu repars avec trois fois la mise. Tu perds, tu perds tout.'],
    'Fazer uma fezinha': ['Place a little bet', 'Hacer una apuestita', 'Fare una puntatina', 'Faire un petit pari'],
    'Como funciona?': ['How does it work?', '¿Cómo funciona?', 'Come funziona?', 'Comment ça marche ?'],
    'Deixa pra lá': ['Never mind', 'Déjalo', 'Lascia stare', 'Laisse tomber'],
    'Já anotei a sua de hoje: {1}, {0} fakes. Amanhã chega o e-mail.': ['I already wrote down yours for today: {1}, {0} fakes. The email comes tomorrow.', 'Ya anoté la tuya de hoy: {1}, {0} fakes. Mañana llega el e-mail.', 'Ho già segnato la tua di oggi: {1}, {0} fakes. Domani arriva l’e-mail.', 'J’ai déjà noté ton pari du jour : {1}, {0} fakes. L’e-mail arrive demain.'],
    'Sem grana, sem bicho.': ['No money, no animal game.', 'Sin plata, no hay bicho.', 'Niente soldi, niente animali.', 'Pas d’argent, pas de pari.'],
    'Tá anotado: {1}, {0} fakes.': ['Written down: {1}, {0} fakes.', 'Anotado: {1}, {0} fakes.', 'Segnato: {1}, {0} fakes.', 'C’est noté : {1}, {0} fakes.'],
    'Tomara que dê {0}...': ['I hope it comes out {0}...', 'Ojalá salga {0}...', 'Speriamo che esca {0}...', 'Pourvu que ça sorte : {0}...'],
    'JOGO DO BICHO': ['ANIMAL GAME', 'JUEGO DEL BICHO', 'GIOCO DEGLI ANIMALI', 'JEU DES ANIMAUX'],
    'Todos os 20 bichos têm a mesma chance (1 em 20). Acertou: 3 vezes o valor. Errou: perde tudo.': ['All 20 animals have the same chance (1 in 20). Right: 3 times the bet. Wrong: you lose it all.', 'Los 20 bichos tienen la misma chance (1 en 20). Aciertas: 3 veces el valor. Fallas: pierdes todo.', 'Tutti i 20 animali hanno la stessa probabilità (1 su 20). Indovini: 3 volte la puntata. Sbagli: perdi tutto.', 'Les 20 animaux ont la même chance (1 sur 20). Gagné : 3 fois la mise. Perdu : tu perds tout.'],
    'Escolha um bicho': ['Pick an animal', 'Elige un bicho', 'Scegli un animale', 'Choisis un animal'],
    'Quanto?': ['How much?', '¿Cuánto?', 'Quanto?', 'Combien ?'], 'Apostar': ['Bet', 'Apostar', 'Punta', 'Parier'], 'Cancelar': ['Cancel', 'Cancelar', 'Annulla', 'Annuler'],
    // o e-mail
    'Novo e-mail': ['New email', 'Nuevo e-mail', 'Nuova e-mail', 'Nouvel e-mail'],
    'Caixa de entrada': ['Inbox', 'Bandeja de entrada', 'Posta in arrivo', 'Boîte de réception'],
    'De: {0}': ['From: {0}', 'De: {0}', 'Da: {0}', 'De : {0}'], 'Assunto: {0}': ['Subject: {0}', 'Asunto: {0}', 'Oggetto: {0}', 'Objet : {0}'],
    'Resultado do bicho': ['Animal game result', 'Resultado del bicho', 'Risultato del gioco degli animali', 'Résultat du jeu des animaux'],
    'E aí, {0}.': ['Hey, {0}.', 'Hola, {0}.', 'Ehi, {0}.', 'Salut, {0}.'],
    'No sorteio de ontem deu {0} (grupo {1}).': ['Yesterday’s draw came out {0} (group {1}).', 'En el sorteo de ayer salió {0} (grupo {1}).', 'Nell’estrazione di ieri è uscito {0} (gruppo {1}).', 'Au tirage d’hier, c’est sorti {0} (groupe {1}).'],
    'Lembrando: os 20 bichos tinham a mesma chance, 1 em 20.': ['Remember: all 20 animals had the same chance, 1 in 20.', 'Recuerda: los 20 bichos tenían la misma chance, 1 en 20.', 'Ricorda: i 20 animali avevano la stessa probabilità, 1 su 20.', 'Pour rappel : les 20 animaux avaient la même chance, 1 sur 20.'],
    'A sua aposta: {1}, {0} fakes.': ['Your bet: {1}, {0} fakes.', 'Tu apuesta: {1}, {0} fakes.', 'La tua puntata: {1}, {0} fakes.', 'Ton pari : {1}, {0} fakes.'],
    'ACERTOU! Já caiu na sua conta: {0} fakes.': ['YOU WON! It’s already in your account: {0} fakes.', '¡ACERTASTE! Ya está en tu cuenta: {0} fakes.', 'HAI VINTO! Sono già sul tuo conto: {0} fakes.', 'GAGNÉ ! C’est déjà sur ton compte : {0} fakes.'],
    'Não foi dessa vez. Perdeu os {0} fakes.': ['Not this time. You lost the {0} fakes.', 'No fue esta vez. Perdiste los {0} fakes.', 'Non è andata. Hai perso i {0} fakes.', 'Pas cette fois. Tu as perdu les {0} fakes.'],
    'Fim de semana tem mais.': ['More next weekend.', 'El fin de semana hay más.', 'Il weekend ce n’è ancora.', 'Le week-end prochain, il y en a encore.'],
    '— O homem de capuz': ['— The hooded man', '— El encapuchado', '— L’uomo incappucciato', '— L’homme à capuche'],
    'Fechar': ['Close', 'Cerrar', 'Chiudi', 'Fermer'], 'Abrir': ['Open', 'Abrir', 'Apri', 'Ouvrir'],
    // os 20 bichos
    'Avestruz': ['Ostrich', 'Avestruz', 'Struzzo', 'Autruche'], 'Águia': ['Eagle', 'Águila', 'Aquila', 'Aigle'], 'Burro': ['Donkey', 'Burro', 'Asino', 'Âne'],
    'Borboleta': ['Butterfly', 'Mariposa', 'Farfalla', 'Papillon'], 'Cachorro': ['Dog', 'Perro', 'Cane', 'Chien'], 'Cabra': ['Goat', 'Cabra', 'Capra', 'Chèvre'],
    'Carneiro': ['Ram', 'Carnero', 'Montone', 'Bélier'], 'Camelo': ['Camel', 'Camello', 'Cammello', 'Chameau'], 'Cobra': ['Snake', 'Serpiente', 'Serpente', 'Serpent'],
    'Coelho': ['Rabbit', 'Conejo', 'Coniglio', 'Lapin'], 'Cavalo': ['Horse', 'Caballo', 'Cavallo', 'Cheval'], 'Elefante': ['Elephant', 'Elefante', 'Elefante', 'Éléphant'],
    'Galo': ['Rooster', 'Gallo', 'Gallo', 'Coq'], 'Gato': ['Cat', 'Gato', 'Gatto', 'Chat'], 'Jacaré': ['Alligator', 'Yacaré', 'Alligatore', 'Caïman'],
    'Leão': ['Lion', 'León', 'Leone', 'Lion'], 'Macaco': ['Monkey', 'Mono', 'Scimmia', 'Singe'], 'Porco': ['Pig', 'Cerdo', 'Maiale', 'Cochon'],
    'Pavão': ['Peacock', 'Pavo real', 'Pavone', 'Paon'], 'Peru': ['Turkey', 'Pavo', 'Tacchino', 'Dindon'],
  };
  const fem = () => typeof PERSONAGEM !== 'undefined' && PERSONAGEM.genero === 'F';
  const Tx = (k) => (typeof T === 'function' ? T(k) : k);
  const Tfx = (k, ...a) => { let s = Tx(k); a.forEach((v, i) => { s = s.split('{' + i + '}').join(v); }); return s; };

  // ------------------------------------------------------------------ regras (fáceis de ajustar)
  const H_ABRE = 16, H_FECHA = 26, H_JAIRO = 15.5;                     // horas "estendidas": 26 = 2h da manhã
  const PORTA_BAR = { x: -100.2, z: 8.6 };                             // a porta do bar na rua (PORTAS da cidade) · a fachada fica em z 10,4
  const LUZ = { ceu: '#ffcf9a', chao: '#2a1a14', hi: 0.52, sol: '#ffb070', si: 0.36, sp: [8, 30, 14] };   // a meia-luz do bar
  const LOTADO = 14;                                                  // a partir de quantas pessoas a música muda
  const VAL = [{ f: 'bebe', a: 21.85, b: 22.67 }, { f: 'danca', a: 22.67, b: 23.5 }, { f: 'sinuca', a: 23.5, b: 24.6 }, { f: 'fuma', a: 24.6, b: 25.25 }, { f: 'sai', a: 25.25, b: 25.6 }];
  const CAPUZ_H = [18.3, 25.5];
  const FLUXO = ['vazio', 'vazio', 'vazio', 'medio', 'cheio', 'cheio', 'cheio'];   // segunda a domingo (como na cidade)
  const CURVA = {                                                     // [hora estendida, pessoas] (o povo, sem contar Jairo, Valdemar, capuz e a sinuca)
    vazio: [[16, 1], [19, 2], [21, 3], [24, 3], [25.5, 1], [26, 0]],
    medio: [[16, 2], [19, 5], [21, 8], [24, 8], [25.5, 3], [26, 0]],
    cheio: [[16, 4], [18, 8], [20, 14], [21.5, 20], [24.5, 20], [25.6, 8], [26, 0]],
  };

  // ------------------------------------------------------------------ OS 15 PRODUTOS
  //   tipo: alcool · bebida · petisco | dose: quanto "sobe" | saude: Saudável | enche: a fome (petiscos) | npc: peso para o povo pedir
  const PRODUTOS = [
    { id: 'longneck', nome: 'Cerveja long neck', preco: 18, tipo: 'alcool', dose: 1, saude: -2, npc: 6 },
    { id: 'chope', nome: 'Chope', preco: 15, tipo: 'alcool', dose: 1, saude: -2, npc: 6, torneira: true },
    { id: 'caipirinha', nome: 'Caipirinha', preco: 30, tipo: 'alcool', dose: 1.5, saude: -2, npc: 2 },
    { id: 'cachaca', nome: 'Dose de cachaça', preco: 12, tipo: 'alcool', dose: 1.5, saude: -3, npc: 1 },
    { id: 'caipiroska', nome: 'Caipiroska de morango', preco: 35, tipo: 'alcool', dose: 1.5, saude: -2, npc: 2 },
    { id: 'batida', nome: 'Batida de coco', preco: 28, tipo: 'alcool', dose: 1, saude: -2, npc: 1 },
    { id: 'refri', nome: 'Refrigerante', preco: 10, tipo: 'bebida', saude: -1, npc: 2 },
    { id: 'suco', nome: 'Suco de laranja', preco: 15, tipo: 'bebida', saude: 1, npc: 1 },
    { id: 'agua', nome: 'Água com gás', preco: 8, tipo: 'bebida', saude: 0, npc: 1 },
    { id: 'batata', nome: 'Batata frita', preco: 40, tipo: 'petisco', saude: -2, enche: 1 },
    { id: 'bacalhau', nome: 'Bolinho de bacalhau', preco: 55, tipo: 'petisco', saude: -2, enche: 1 },
    { id: 'calabresa', nome: 'Calabresa acebolada', preco: 45, tipo: 'petisco', saude: -2, enche: 1 },
    { id: 'pastel', nome: 'Pastel de feira', preco: 35, tipo: 'petisco', saude: -2, enche: 1 },
    { id: 'amendoim', nome: 'Amendoim torrado', preco: 12, tipo: 'petisco', saude: -1, enche: 0.5 },
    { id: 'frango', nome: 'Frango a passarinho', preco: 50, tipo: 'petisco', saude: -2, enche: 1 },
  ];
  const PROD = {}; PRODUTOS.forEach((p) => { PROD[p.id] = p; });
  const BICHOS = ['Avestruz', 'Águia', 'Burro', 'Borboleta', 'Cachorro', 'Cabra', 'Carneiro', 'Camelo', 'Cobra', 'Coelho', 'Cavalo', 'Elefante', 'Galo', 'Gato', 'Jacaré', 'Leão', 'Macaco', 'Porco', 'Pavão', 'Peru'];

  // ================================================================== PIXEL ART
  function hash(x, y, s) { let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 1442695041)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; }
  const escurece = (c, f) => { if (c[0] !== '#') return c; const n = parseInt(c.slice(1), 16), q = (k) => Math.max(0, Math.min(255, Math.round(k * f))); return '#' + ((1 << 24) | (q((n >> 16) & 255) << 16) | (q((n >> 8) & 255) << 8) | q(n & 255)).toString(16).slice(1); };
  // uma "tela" de pixels: buf guarda a cor de cada pixel (para o contorno), e no fim vira um canvas
  function tela(W, H) {
    const buf = new Array(W * H).fill(null);
    const P = {
      W, H, buf,
      px(x, y, c) { x = Math.floor(x); y = Math.floor(y); if (!c || x < 0 || y < 0 || x >= W || y >= H) return; buf[y * W + x] = c; },
      get(x, y) { return x < 0 || y < 0 || x >= W || y >= H ? null : buf[y * W + x]; },
      ret(x0, y0, w, h, c) { for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) P.px(x, y, typeof c === 'function' ? c(x, y) : c); },
      elip(cx, cy, rx, ry, c) { for (let y = Math.floor(cy - ry - 1); y <= cy + ry + 1; y++) for (let x = Math.floor(cx - rx - 1); x <= cx + rx + 1; x++) { const u = (x + 0.5 - cx) / rx, v = (y + 0.5 - cy) / ry; if (u * u + v * v <= 1) P.px(x, y, typeof c === 'function' ? c(x, y, u, v) : c); } },
      contorno(cor) { const L = []; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { if (buf[y * W + x]) continue; if (P.get(x - 1, y) || P.get(x + 1, y) || P.get(x, y - 1) || P.get(x, y + 1)) L.push(y * W + x); } for (const i of L) buf[i] = cor; },
      sombra(cor) { const L = []; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (!buf[y * W + x] && P.get(x - 1, y - 1)) L.push(y * W + x); for (const i of L) buf[i] = cor; },
      canvas() { const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d'); for (let i = 0; i < W * H; i++) if (buf[i]) { g.fillStyle = buf[i]; g.fillRect(i % W, (i / W) | 0, 1, 1); } return cv; },
    };
    return P;
  }
  const VID = '#d6ecf4', VID2 = '#a8c8d8', BRILHO = '#ffffff';       // o vidro (claro, escuro) e o brilho
  // um copo de vidro: larg(y) = meia largura na linha y (y0..y1, de cima para baixo); conteudo(x, y, u) = a cor de dentro (ou null)
  function copo(P, cx, y0, y1, larg, conteudo, fundo) {
    for (let y = y0; y <= y1; y++) {
      const w = larg(y); for (let x = Math.round(cx - w); x <= Math.round(cx + w) - 1; x++) {
        const u = (x + 0.5 - cx) / w; let c = conteudo ? conteudo(x, y, u) : null;
        if (Math.abs(u) > 0.82) c = u < 0 ? VID : VID2; else if (!c) c = 'rgba(214,236,244,0.35)';
        if (u > -0.62 && u < -0.45 && y > y0 + 1 && y < y1 - 2) c = BRILHO;
        P.px(x, y, c);
      }
    }
    if (fundo) for (let y = y1 + 1; y <= y1 + fundo; y++) { const w = larg(y1) * 1.04; for (let x = Math.round(cx - w); x <= Math.round(cx + w) - 1; x++) P.px(x, y, y === y1 + fundo ? VID2 : VID); }
  }
  // o prato branco (visto de cima), com a aba e a sombrinha (como os do restaurante)
  function prato(P, cx, cy, r, cor) {
    for (let y = 0; y < P.H; y++) for (let x = 0; x < P.W; x++) {
      const dx = x + 0.5 - cx, dy = y + 0.5 - cy, d = Math.hypot(dx, dy);
      if (d <= r) { const aba = d > r - 3; const luz = -(dx + dy) / (d || 1); P.px(x, y, aba ? (luz > 0.5 ? '#ffffff' : luz < -0.5 ? '#c8c8c0' : cor || '#f2f2ee') : d > r - 4 ? '#dcdcd4' : cor || '#ecece6'); }
    }
  }
  const DESENHO = {
    longneck(P) {
      const cx = 16;
      for (let y = 2; y <= 29; y++) {
        const w = y < 4 ? 2.6 : y < 11 ? 1.9 : y < 14 ? 1.9 + (y - 10) * 0.75 : 4.1;
        for (let x = Math.round(cx - w); x < Math.round(cx + w); x++) {
          const u = (x + 0.5 - cx) / w; let c = u < -0.45 ? '#b8641e' : u > 0.5 ? '#3e1a06' : '#6e3410';
          if (y < 4) c = u < 0 ? '#f2d070' : '#c8952a';                           // a tampinha
          else if (y >= 6 && y <= 8) c = u < -0.3 ? '#f2d070' : '#c8952a';        // o selo dourado do gargalo
          else if (y >= 17 && y <= 24) { c = y === 19 || y === 20 ? '#c8352b' : u < -0.4 ? '#fffaf0' : '#f2e6c0'; if (y === 22 && Math.abs(u) < 0.5 && x % 2) c = '#c8952a'; }
          else if (u > -0.3 && u < -0.15 && y > 13) c = '#e8a050';               // o reflexo
          if (y > 12 && hash(x, y, 4) > 0.9 && c === '#6e3410') c = '#9a5a2a';   // as gotinhas (gelada)
          P.px(x, y, c);
        }
      }
    },
    chope(P) {
      const larg = (y) => (y < 11 ? 6.4 : 6.4 - (y - 11) * 0.17);
      copo(P, 16, 9, 27, larg, (x, y, u) => { if (y < 12) return u < -0.3 ? '#fffdf6' : '#f4ecd8'; const k = (y - 12) / 15; if (hash(x, y, 7) > 0.88) return '#ffe9a0'; return k < 0.3 ? '#f8c040' : k < 0.7 ? '#f2b030' : '#e0961c'; }, 2);
      for (let x = 10; x <= 22; x++) { const h = 2 + Math.round(Math.sin(x * 1.3) * 1.2 + hash(x, 1, 3)); for (let y = 9 - h; y < 9; y++) P.px(x, y, y === 9 - h ? '#ffffff' : '#fbf6ea'); }   // a espuma transbordando
    },
    caipirinha(P) {
      const larg = (y) => 7 - (y - 12) * 0.06;
      copo(P, 16, 12, 28, larg, (x, y, u) => {
        if (y < 14) return null; const q = hash(Math.floor(x / 3), Math.floor((y + (x % 2)) / 3), 5);
        if (q > 0.72) return hash(x, y, 2) > 0.5 ? '#ffffff' : '#e2f6fb';                 // o gelo
        if (q > 0.52 && y > 17) return (x + y) % 3 ? '#4f8f2a' : '#a8d878';              // o limão
        if (y > 25) return '#f8f4e0';                                                     // o açúcar no fundo
        return '#e8f0c8';
      }, 2);
      for (let k = 0; k < 13; k++) P.px(20 - Math.round(k * 0.3), 3 + k, k < 3 ? '#1c1c1f' : '#2a2a2e');   // o canudinho
    },
    cachaca(P) {
      // a garrafa de vidro (atrás, à esquerda) e o copinho cheio (na frente, à direita)
      for (let y = 3; y <= 28; y++) { const w = y < 9 ? 1.6 : y < 12 ? 1.6 + (y - 8) * 0.9 : 4.2; for (let x = Math.round(9 - w); x < Math.round(9 + w); x++) { const u = (x + 0.5 - 9) / w; let c = y < 5 ? '#a8742a' : y < 13 ? (u < 0 ? VID : VID2) : y >= 18 && y <= 23 ? (y === 18 || y === 23 ? '#c8952a' : '#2f6a3a') : u < -0.5 ? '#f8e8a8' : '#e8c460'; if (Math.abs(u) > 0.8 && y >= 5) c = u < 0 ? VID : VID2; if (y === 20 && Math.abs(u) < 0.5) c = '#f2e6c8'; P.px(x, y, c); } }
      copo(P, 21, 19, 27, () => 4.2, (x, y) => (y < 21 ? null : hash(x, y, 3) > 0.85 ? '#fff4c0' : '#f2d27a'), 2);
    },
    caipiroska(P) {
      const larg = (y) => 7 - (y - 12) * 0.06;
      copo(P, 16, 12, 28, larg, (x, y) => {
        if (y < 14) return null; const q = hash(Math.floor(x / 3), Math.floor((y + (x % 2)) / 3), 9);
        if (q > 0.74) return hash(x, y, 2) > 0.5 ? '#ffffff' : '#ffe6ee';
        if (q > 0.5 && y > 16) return hash(x, y, 8) > 0.82 ? '#f8e0a0' : '#d8302a';       // os morangos (com as sementinhas)
        return y > 25 ? '#f8d0d8' : '#f29aac';
      }, 2);
      P.ret(18, 8, 4, 4, (x, y) => (hash(x, y, 1) > 0.8 ? '#f8e0a0' : '#d8302a')); P.px(19, 7, '#3f8a3a'); P.px(20, 7, '#5aaa4a'); P.px(20, 6, '#3f8a3a');   // o morango na borda
      for (let k = 0; k < 12; k++) P.px(12 + Math.round(k * 0.2), 4 + k, '#2a2a2e');
    },
    batida(P) {
      // a taça: o bojo, a haste e o pé
      for (let y = 8; y <= 18; y++) { const v = (y - 8) / 10, w = 8 * Math.sqrt(Math.max(0, 1 - v * v * 0.85)); for (let x = Math.round(16 - w); x < Math.round(16 + w); x++) { const u = (x + 0.5 - 16) / w; let c = y < 10 ? null : hash(x, y, 4) > 0.86 ? '#ffffff' : hash(x, y, 6) > 0.95 ? '#a8642a' : u < -0.4 ? '#fffaf0' : '#f2e6c8'; if (Math.abs(u) > 0.85) c = u < 0 ? VID : VID2; if (!c) c = 'rgba(214,236,244,0.35)'; P.px(x, y, c); } }
      P.ret(15, 19, 2, 7, (x) => (x === 15 ? VID : VID2)); P.ret(11, 26, 10, 2, (x, y) => (y === 27 ? VID2 : VID));
      for (let k = 0; k < 6; k++) { P.px(21 + k * 0.6, 7 + Math.sin(k) * 0.5, '#5a3418'); P.px(21 + k * 0.6, 8 + Math.sin(k) * 0.5, '#fffaf0'); }   // a lasquinha de coco na borda
    },
    refri(P) {
      for (let y = 6; y <= 28; y++) for (let x = 10; x <= 21; x++) {
        const u = (x + 0.5 - 16) / 6; let c = u < -0.55 ? '#e8605a' : u > 0.6 ? '#8a1a14' : '#c8302a';
        if (y < 8 || y > 26) c = u < -0.3 ? '#e8ecf0' : u > 0.4 ? '#8c9199' : '#c9ced4';   // a tampa e o fundo de alumínio
        else if (Math.abs(y - 16 - Math.sin(x * 0.7) * 1.5) < 1.3) c = '#fffaf0';           // a onda branca
        else if (hash(x, y, 3) > 0.93) c = '#f8a8a0';                                        // as gotinhas
        P.px(x, y, c);
      }
      P.ret(14, 5, 4, 1, '#9aa1ab'); P.ret(15, 4, 2, 1, '#c9ced4');
    },
    suco(P) {
      copo(P, 15, 7, 28, () => 5.2, (x, y) => (y < 9 ? null : hash(x, y, 5) > 0.86 ? '#f8c868' : y > 24 ? '#e8902a' : '#f2a432'), 2);
      for (let y = 2; y <= 14; y++) for (let x = 16; x <= 29; x++) { const d = Math.hypot(x + 0.5 - 22.5, y + 0.5 - 8); if (d > 5.4) continue; const a = Math.atan2(y + 0.5 - 8, x + 0.5 - 22.5); P.px(x, y, d > 4.6 ? '#e8742a' : d > 3.9 ? '#fff4d8' : d < 0.8 ? '#fff4d8' : Math.abs(Math.sin(a * 4)) < 0.16 ? '#fff4d8' : hash(x, y, 9) > 0.8 ? '#ffd070' : '#f8a830'); }   // a rodela de laranja na borda
      for (let k = 0; k < 12; k++) P.px(12 + Math.round(k * 0.25), 1 + k, k % 3 === 0 ? '#ffffff' : '#d8302a');   // o canudo listrado
    },
    agua(P) {
      for (let y = 3; y <= 28; y++) { const w = y < 6 ? 2.2 : y < 9 ? 2.2 + (y - 5) * 1.0 : 4.8; for (let x = Math.round(16 - w); x < Math.round(16 + w); x++) { const u = (x + 0.5 - 16) / w; let c = y < 6 ? (u < 0 ? '#2f6aa8' : '#1f4a8a') : y >= 16 && y <= 21 ? (Math.abs(y - 18.5 - Math.sin(x) * 0.8) < 0.8 ? '#ffffff' : '#2f6aa8') : hash(x, y, 2) > 0.9 ? '#ffffff' : u < -0.4 ? '#d8eef8' : '#a8d8f0'; if (Math.abs(u) > 0.82 && y >= 6 && (y < 16 || y > 21)) c = u < 0 ? VID : VID2; P.px(x, y, c); } }
    },
    batata(P) {
      prato(P, 16, 16, 14.5, '#f4f0e0');
      for (let k = 0; k < 34; k++) {                                     // os palitos (em pé, deitados e na diagonal)
        const a = hash(k, 1, 11) * Math.PI, L = 5 + Math.floor(hash(k, 2, 11) * 4), x0 = 8 + hash(k, 3, 11) * 14, y0 = 8 + hash(k, 4, 11) * 14;
        for (let s = 0; s < L; s++) for (let w = 0; w < 2; w++) { const x = x0 + Math.cos(a) * s - Math.sin(a) * w, y = y0 + Math.sin(a) * s + Math.cos(a) * w; P.px(x, y, s === 0 || s === L - 1 ? '#c88a30' : w ? '#e0aa40' : '#f8d870'); }
      }
      P.elip(24, 24, 3.6, 3.6, (x, y, u, v) => (u * u + v * v > 0.6 ? '#f2f2ee' : u + v < -0.5 ? '#e8503a' : '#b8241a'));   // o potinho de ketchup
    },
    bacalhau(P) {
      prato(P, 16, 16, 14.5);
      for (const [x, y] of [[11, 11], [19, 10], [10, 19], [18, 18], [23, 15]]) P.elip(x, y, 4, 3, (px, py, u, v) => (u + v > 0.75 ? '#7a3e14' : u + v < -0.7 ? '#f0c070' : hash(px, py, 3) > 0.8 ? '#e8b060' : '#c8803a'));
      P.elip(23, 23, 3, 2, (x, y, u) => (u < -0.3 ? '#fffbe0' : '#f2e04a')); P.px(8, 15, '#3f8a3a'); P.px(9, 16, '#5aaa4a'); P.px(14, 22, '#3f8a3a');
    },
    calabresa(P) {
      prato(P, 16, 16, 14.5);
      for (let k = 0; k < 11; k++) { const x = 8 + hash(k, 1, 21) * 16, y = 8 + hash(k, 2, 21) * 16; P.elip(x, y, 3, 3, (px, py, u, v) => { const d = u * u + v * v; return d > 0.62 ? '#6a1a10' : hash(px, py, 4) > 0.75 ? '#f0b8a0' : u + v < -0.4 ? '#d8604a' : '#b23a28'; }); }
      for (let k = 0; k < 5; k++) { const x = 9 + hash(k, 5, 22) * 14, y = 9 + hash(k, 6, 22) * 14; P.elip(x, y, 3.4, 2.4, (px, py, u, v) => { const d = u * u + v * v; return d > 0.5 ? (hash(px, py, 7) > 0.5 ? '#fffaf0' : '#e8d0e0') : null; }); }   // os anéis de cebola
      for (let k = 0; k < 7; k++) P.px(22 + k, 6 + k * 0.4, '#d8b070');   // o palito
    },
    pastel(P) {
      prato(P, 16, 16, 14.5);
      for (const [x0, y0] of [[5, 7], [12, 16]]) for (let y = 0; y < 9; y++) for (let x = 0; x < 15; x++) {
        if ((x === 0 || x === 14) && (y === 0 || y === 8)) continue;                     // os cantos arredondados
        const borda = x === 0 || y === 0 || x === 14 || y === 8, u = x / 14, v = y / 8;
        let c = borda ? ((x + y) % 2 ? '#b87a28' : '#d89a3a') : u + v < 0.45 ? '#fbe08a' : u + v > 1.45 ? '#c8862e' : '#eebc50';   // a massa estufada (clara em cima, mais tostada embaixo)
        if (!borda && hash(x0 + x, y0 + y, 5) > 0.84) c = '#fff4c0'; else if (!borda && hash(x0 + x, y0 + y, 6) > 0.9) c = '#d8963a';   // as bolhas da fritura
        P.px(x0 + x, y0 + y, c);
      }
    },
    amendoim(P) {
      P.elip(16, 17, 14, 12, (x, y, u, v) => { const d = u * u + v * v; return d > 0.8 ? (u + v < 0 ? '#c8945a' : '#7a4e28') : d > 0.7 ? '#5a3618' : '#6a4222'; });   // a cumbuca de madeira
      for (let k = 0; k < 60; k++) { const x = 7 + hash(k, 1, 31) * 18, y = 8 + hash(k, 2, 31) * 17; if (((x - 16) / 10.5) ** 2 + ((y - 17) / 9) ** 2 > 1) continue; const pele = hash(k, 3, 31) > 0.72; P.elip(x, y, 2.2, 1.5, (px, py, u, v) => (pele ? (u + v < 0 ? '#c8603a' : '#8a3418') : u + v < -0.5 ? '#fff0c8' : u + v > 0.6 ? '#c08040' : '#f0c27a')); }
    },
    frango(P) {
      prato(P, 16, 16, 14.5);
      for (let k = 0; k < 9; k++) { const x = 8 + hash(k, 1, 41) * 15, y = 8 + hash(k, 2, 41) * 15; P.elip(x, y, 3.2 + hash(k, 3, 41) * 1.2, 2.6, (px, py, u, v) => { const n = hash(px, py, 6); return u + v > 0.8 ? '#7a3e12' : n > 0.75 ? '#f0b858' : n < 0.18 ? '#a85a1a' : '#c8782a'; }); }
      for (let k = 0; k < 9; k++) P.px(9 + hash(k, 4, 42) * 14, 9 + hash(k, 5, 42) * 14, '#fff0b8');   // o alho frito
      P.elip(24, 23, 2.6, 2, (x, y, u) => (u < -0.2 ? '#a8d878' : '#4f8f2a')); P.px(10, 22, '#3f8a3a'); P.px(11, 23, '#5aaa4a');
    },
  };
  const CACHE = new Map();
  function canvasProduto(id) {
    if (CACHE.has('p:' + id)) return CACHE.get('p:' + id);
    const P = tela(32, 32); DESENHO[id](P); P.contorno('rgba(26,14,6,0.92)'); P.sombra('rgba(0,0,0,0.22)');
    const cv = P.canvas(); CACHE.set('p:' + id, cv); return cv;
  }
  // o cigarro (16 x 16): o papel, o filtro e a brasa
  function canvasCigarro() {
    if (CACHE.has('cig')) return CACHE.get('cig');
    const P = tela(16, 16); for (let k = 0; k < 9; k++) { P.px(3 + k, 9 - k * 0.35, k < 3 ? '#e8a040' : '#f4f2ea'); P.px(3 + k, 10 - k * 0.35, k < 3 ? '#c8802a' : '#d8d4c8'); }
    P.px(12, 6, '#ff5a20'); P.px(12, 7, '#c8302a'); P.contorno('rgba(26,14,6,0.7)');
    const cv = P.canvas(); CACHE.set('cig', cv); return cv;
  }
  // ---- OS 20 BICHOS (16 x 14, de lado, olhando para a direita): letras = cores; o contorno escuro vem depois
  const BICHO_ART = [
    { pal: { a: '#d8a090', b: '#2a2a2e', w: '#f4f4ec', c: '#e8b860', e: '#111111' }, px: [
      '...........aa...', '..........aaea..', '..........aaacc.', '...........a....', '...........a....', '...........a....', '....bbbbbb.a....', '..bbbbbbbbba....', '.wwbbbbbbbbb....', 'wwbbbbbbbbbb....', '..bbbbbbbbb.....', '.....a...a......', '.....a...a......', '....aa..aa......'] },
    { pal: { b: '#6a4022', d: '#4a2a14', w: '#f4f4ec', c: '#f2c230', e: '#111111' }, px: [
      '..........www...', '.........wwwwcc.', '.........wweww.c', '........bbwww...', '.......bbbbbb...', '.....bbdbbbbb...', '...bbbdbbbbbb...', '.bbbbdbbbbbbb...', 'bbbbdbbbbbbb....', '....bbbbbbb.....', '.....bbbbb......', '......c..c......', '.....cc.cc......'] },
    { pal: { a: '#8c8a86', b: '#c8c4bc', d: '#4a4844', w: '#f2f0ea', e: '#111111', c: '#3a3a3e' }, px: [
      '...........a..a.', '...........a..a.', '...........aaaa.', '..........daaaa.', '..........daeaab', '..aaaaaaaadaaabb', '.daaaaaaaaaa..b.', 'd.aaaaaaaaaa....', '..aaaaaaaaaa....', '..abbbbbbbba....', '...a.a...a.a....', '...a.a...a.a....', '...c.c...c.c....'] },
    { espelho: true, pal: { a: '#f28a2a', b: '#c8521a', w: '#fff4d8', c: '#3a2a1a', d: '#2a1a10' }, px: [
      '..d.....', '...d....', '.aaaa..c', 'aawwaa.c', 'aawaaaac', 'aaaaaaac', '.aaaaaac', '...aaa.c', '..bbbbbc', '.bbwbbbc', '.bbbbbb.', '..bbbb..'] },
    { pal: { a: '#c8904a', b: '#f4ecd8', d: '#7a4a22', e: '#111111' }, px: [
      '..........dd....', '.........daad...', '.........aaeaa..', '.........aaaaae.', '..a.......abbb..', '...aaaaaaaaab...', '...aaaaaaaaa....', '...aaaaaaaaa....', '...abbbbbbba....', '...a.a...a.a....', '...a.a...a.a....', '...a.a...a.a....'] },
    { pal: { a: '#ece8e0', b: '#b8b4ac', h: '#8a6a4a', e: '#111111', c: '#5a5650' }, px: [
      '..........hh....', '.........h..h...', '..........aaa...', '..........aeaa..', '.........aaaaab.', '..aaaaaaaaaab...', '.aaaaaaaaaa.c...', '..aaaaaaaaa.c...', '..abbbbbbba.....', '...a.a..a.a.....', '...a.a..a.a.....', '...c.c..c.c.....'] },
    { pal: { w: '#f4f0e4', s: '#d8d0c0', a: '#3a3430', h: '#c8a070', e: '#f4f0e4' }, px: [
      '................', '..........hhh...', '..wswsws.haaah..', '.wswswswshaeaa..', 'swswswswswaaaa..', 'wswswswswshaa...', 'swswswswsws.....', '.wswswswsws.....', '..swswswsw......', '...a.a..a.a.....', '...a.a..a.a.....', '...a.a..a.a.....'] },
    { pal: { a: '#d8a860', b: '#a87830', e: '#111111' }, px: [
      '............aa..', '...........aaea.', '...........aaaab', '....aa.....a....', '...aaaa.aa.a....', '..aaaaaaaaaa....', '.aaaaaaaaaaa....', '.aaaaaaaaaa.....', '..abbbbbbba.....', '...a.a..a.a.....', '...a.a..a.a.....', '...a.a..a.a.....', '...b.b..b.b.....'] },
    { pal: { a: '#3f9a3a', b: '#d8d850', e: '#111111', r: '#d8302a', d: '#2a6a2a' }, px: [
      '..........aaaa..', '.........aaeaaa.', '.........aaaaa.r', '..........aaa.r.', '...........aa...', '....adada..aa...', '...aabbbaa.aa...', '..aa.....aaaa...', '..aa......aa....', '...aa...........', '....adadadad....', '...........aaa..'] },
    { pal: { w: '#f4f0ea', p: '#f0a0b0', e: '#111111', g: '#c8c4c0' }, px: [
      '.........ww.....', '.........wpw....', '..........wpw...', '..........www...', '.........wwwww..', '.........wwewwp.', '....wwww.wwwww..', '...wwwwwwwwww...', '..wwwwwwwwwww...', '.gwwwwwwwwww....', '..wwwwwwwwwg....', '...gg..gggg.....'] },
    { pal: { a: '#8a4a22', d: '#2a1a10', w: '#f4f0ea', e: '#111111', c: '#3a3a3e' }, px: [
      '...........dd...', '..........daaa..', '.........ddaeaa.', '.........daaaaaa', '........dda..aw.', '..aaaaaaaaa.....', '.daaaaaaaaa.....', 'dd.aaaaaaaa.....', 'd..aaaaaaaa.....', '...a.a...a.a....', '...a.a...a.a....', '...c.c...c.c....'] },
    { pal: { a: '#9a9aa2', b: '#6a6a72', w: '#f4f0e4', e: '#111111' }, px: [
      '..........aaaa..', '....aaaaaaaaaaa.', '...aaaaaaaaabaea', '..aaaaaaaaaabaaa', '.aaaaaaaaaaabaaw', '.aaaaaaaaaaabaaa', '.aaaaaaaaaaa..a.', '.aaaaaaaaaaa..a.', '..aa.aa..aa...a.', '..aa.aa..aa..aa.', '..bb.bb..bb.....'] },
    { pal: { r: '#d8302a', a: '#c8602a', d: '#2a3a5a', y: '#f2c230', e: '#111111' }, px: [
      '..........rr....', '.........rrr....', '.........aaay...', '..dd.....aeayy..', '.ddd....aaaa....', 'ddd.....aar.....', 'dd..aaaaaar.....', 'dd.aaaaaaa......', '.daaaaaaaa......', '..aaaaaaa.......', '....y..y........', '...yy.yy........'] },
    { pal: { a: '#e8a050', b: '#b86a2a', g: '#6cae3e', p: '#f0a0b0' }, px: [
      '..........a...a.', '..........aa.aa.', '..........aaaaa.', '..........agaga.', '..a.......aapaa.', '...a......aaaa..', '...aaaaaaaaaa...', '...abababababa..', '...aaaaaaaaaa...', '...a.a....a.a...', '...a.a....a.a...', '...aaa....aaa...'] },
    { pal: { a: '#4a7a3a', b: '#a8b860', w: '#f4f0e4', e: '#f2c230', d: '#2f5a28' }, px: [
      '................', '................', '...........aea..', '.ad.ad.ad.aaaaa.', 'aaaaaaaaaaaaaaaa', 'aaaaaaaaaaaawawa', '.abbbbbbbbbaaaaa', '..a.a....a.a....', '..a.a....a.a....'] },
    { pal: { m: '#a8521a', a: '#e8b050', e: '#111111', n: '#5a3418' }, px: [
      '.........mmmm...', '........mmaaam..', '........maaeam..', '........maaaan..', '........mmaaam..', '.a.......mmmm...', '..aaaaaaaaam....', '..aaaaaaaaaa....', '..aaaaaaaaaa....', '..a.a....a.a....', '..a.a....a.a....', '.mm.............'] },
    { pal: { a: '#7a4a2a', f: '#e8c8a0', e: '#111111' }, px: [
      '..........aaa...', '.........affaa..', '.........afeff..', '.........affff..', '..........aaa...', '.........aaaaa..', '........aaaaaff.', '........aaaaa...', '...a....aaaaa...', '...a...aa...aa..', '....aaa.f...f...'] },
    { pal: { p: '#f0a0a8', d: '#d87888', n: '#e88898', e: '#111111' }, px: [
      '................', '..........pp....', '...........pppp.', '..pppppppppppepd', '.pppppppppppppnn', 'dpppppppppppppnn', '.pppppppppppppp.', '..pppppppppppp..', '..dddddddddddd..', '...p.p....p.p...', '...d.d....d.d...'] },
    { pal: { b: '#2a5ad8', g: '#1f9a6a', t: '#3fb7b0', y: '#f2c230', e: '#111111' }, px: [
      '..gtgtg.........', '.gtytgtg........', 'gtgtytgtgt..bb..', 'tgtgtgytgt.bbe..', 'gtytgtgtgt.bb.y.', 'tgtgtytgt..bb...', '.tgtgtgt..bbb...', '..gtgtgbbbbbb...', '....gtbbbbbb....', '......bbbbb.....', '.......y..y.....', '......yy.yy.....'] },
    { pal: { a: '#5a3a22', t: '#8a5a2a', w: '#f4ecd8', r: '#d8302a', c: '#9ab0c8', y: '#d8a030', e: '#111111' }, px: [
      '..t.t.t.........', '.twtwtwt........', 'tawawawat..cc...', 'aaaaaaaat.cce...', 'taaaaaaaa.ccr...', '.aaaaaaaaaar....', '..aaaaaaaaar....', '...aaaaaaa......', '.....y..y.......', '....yy.yy.......'] },
  ];
  function canvasBicho(i) {
    if (CACHE.has('b:' + i)) return CACHE.get('b:' + i);
    const A = BICHO_ART[i], rows = A.espelho ? A.px.map((r) => r + r.split('').reverse().join('')) : A.px;
    const P = tela(20, 18), oy = Math.floor((18 - rows.length) / 2), ox = 2;
    rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) { const c = A.pal[r[x]]; if (!c) continue; let cc = c; if (r[x] !== 'e' && hash(x, y, i) > 0.86) cc = escurece(c, 0.88); P.px(ox + x, oy + y, cc); } });
    P.contorno('#1a0f08');
    const cv = P.canvas(); CACHE.set('b:' + i, cv); return cv;
  }
  function icone(cv, tam) { const c = document.createElement('canvas'); c.width = cv.width; c.height = cv.height; c.getContext('2d').drawImage(cv, 0, 0); c.style.cssText = 'width:' + tam + 'px;height:' + Math.round(tam * cv.height / cv.width) + 'px;image-rendering:pixelated;'; return c; }

  // ------------------------------------------------------------------ util
  const clampN = (v, a, b) => Math.max(a, Math.min(b, v));
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pk = (l) => l[Math.floor(Math.random() * l.length)];
  const lerpC = (curva, h) => { if (h <= curva[0][0]) return curva[0][1]; for (let i = 1; i < curva.length; i++) if (h <= curva[i][0]) { const [a, va] = curva[i - 1], [b, vb] = curva[i]; return va + (vb - va) * (h - a) / (b - a); } return curva[curva.length - 1][1]; };
  const sorteio = (pesos) => { let t = 0; for (const [, w] of pesos) t += w; let x = Math.random() * t; for (const [k, w] of pesos) { x -= w; if (x <= 0) return k; } return pesos[pesos.length - 1][0]; };

  // ================================================================== A MÚSICA DO BAR (dois arranjos, troca suave quando lota)
  function criarMusica() {
    const st = { bus: null, ruido: null, timer: 0, prox: 0, comp: 0, modo: 'tema', modoAlvo: 'tema', t0: 0, bpm: 104, ini: performance.now() };
    const audio = () => (typeof Som !== 'undefined' && Som.audio && !Som.mudo ? Som.audio : null);
    const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
    function nota(c, dst, m, t, dur, vol, tipo, corte, ataque, vib) {
      const o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter();
      o.type = tipo; o.frequency.value = hz(m); f.type = 'lowpass'; f.frequency.value = corte || 3000;
      if (vib) { const l = c.createOscillator(), lg = c.createGain(); l.frequency.value = 5.2; lg.gain.value = hz(m) * 0.012; l.connect(lg); lg.connect(o.frequency); l.start(t + 0.12); l.stop(t + dur + 0.05); }
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + (ataque || 0.006)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(f); f.connect(g); g.connect(dst); o.start(t); o.stop(t + dur + 0.05);
    }
    function chiado(c, dst, t, dur, vol, freq, tipo, q) {
      if (!st.ruido || st.ruido.sampleRate !== c.sampleRate) { st.ruido = c.createBuffer(1, c.sampleRate, c.sampleRate); const d = st.ruido.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
      const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s.buffer = st.ruido; f.type = tipo || 'highpass'; f.frequency.value = freq; if (q) f.Q.value = q;
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(f); f.connect(g); g.connect(dst); s.start(t, Math.random() * 0.5, dur + 0.02);
    }
    function bumbo(c, dst, t, f0, f1, dur, vol) { const o = c.createOscillator(), g = c.createGain(); o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur * 0.6); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(dst); o.start(t); o.stop(t + dur + 0.02); }
    // ---- O TEMA: samba-rock de boteco (104 bpm), em lá menor
    const TEMA_AC = [
      { r: 45, n: [57, 60, 64, 67] }, { r: 50, n: [57, 60, 62, 66] }, { r: 43, n: [55, 59, 62, 66] }, { r: 48, n: [55, 59, 60, 64] },
      { r: 41, n: [57, 60, 64, 65] }, { r: 47, n: [57, 59, 62, 65] }, { r: 40, n: [56, 59, 62, 64] }, { r: 45, n: [57, 60, 64, 67] },
    ];
    const TEMA_MEL = [
      [[0, 76, 3], [3, 74, 1], [4, 72, 2], [6, 69, 2], [8, 72, 2], [10, 74, 2], [12, 76, 4]],
      [[0, 78, 2], [2, 76, 2], [4, 74, 4], [10, 72, 2], [12, 74, 4]],
      [[0, 71, 3], [3, 74, 1], [4, 78, 4], [8, 79, 2], [10, 78, 2], [12, 74, 4]],
      [[0, 76, 6], [8, 72, 2], [10, 71, 2], [12, 67, 4]],
      [[0, 69, 2], [2, 72, 2], [4, 76, 2], [6, 77, 4], [10, 76, 2], [12, 72, 4]],
      [[0, 74, 2], [2, 77, 2], [4, 74, 2], [6, 71, 4], [12, 69, 2], [14, 71, 2]],
      [[0, 68, 3], [3, 71, 1], [4, 74, 2], [6, 76, 2], [8, 80, 4], [12, 79, 2], [14, 76, 2]],
      [[0, 81, 6], [8, 76, 2], [10, 72, 2], [12, 69, 4]],
    ];
    function compassoTema(c, dst, t0, n) {
      const B = 60 / 104, S = B / 4, A = TEMA_AC[n % 8], prox = TEMA_AC[(n + 1) % 8], volta = Math.floor(n / 8) % 3;
      // o cavaquinho: palhetada de partido-alto (acorde arpejado bem rápido, para cima e para baixo)
      for (const [s, desce] of [[0, 1], [3, 0], [5, 1], [8, 1], [10, 0], [13, 1], [15, 0]]) {
        const notas = desce ? A.n : A.n.slice().reverse();
        notas.forEach((m, i) => nota(c, dst, m + 12, t0 + s * S + i * 0.009, S * 1.7, 0.028, 'square', 2600, 0.002));
      }
      // o baixo: tônica, quinta, tônica e a nota de passagem para o próximo acorde
      for (const [s, m, d] of [[0, A.r, 5], [6, A.r + 7, 2], [8, A.r, 4], [12, A.r + 7, 2], [14, prox.r + (prox.r > A.r ? -1 : 1), 2]]) nota(c, dst, m, t0 + s * S, d * S * 1.05, 0.26, 'triangle', 700);
      // o surdo (abafado no 1, aberto no 2), o pandeiro e o tamborim (teleco-teco)
      bumbo(c, dst, t0, 95, 60, 0.14, 0.16); bumbo(c, dst, t0 + 8 * S, 85, 48, 0.4, 0.34);
      for (let i = 0; i < 16; i++) chiado(c, dst, t0 + i * S, 0.045, i % 4 === 3 ? 0.06 : 0.022, 6500);
      for (const s of [0, 8]) bumbo(c, dst, t0 + s * S + S * 0.5, 220, 140, 0.08, 0.05);
      for (const s of [0, 3, 6, 8, 11, 14]) chiado(c, dst, t0 + s * S, 0.03, 0.06, 3200, 'bandpass', 3);
      // o sax com o tema (na 2.ª volta uma oitava abaixo com uma terça; na 3.ª ele "conversa" com a cuíca)
      if (volta !== 2 || n % 2 === 0) for (const [s, m, d] of TEMA_MEL[n % 8]) {
        const mm = volta === 1 ? m - 12 : m;
        nota(c, dst, mm, t0 + s * S, d * S * 1.15, 0.05, 'sawtooth', 1900, 0.03, true);
        if (volta === 1) nota(c, dst, mm + 4, t0 + s * S, d * S * 1.1, 0.02, 'sawtooth', 1600, 0.03);
      }
      if (volta === 2 && n % 2) for (const s of [0, 4, 8, 12]) { const o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(380, t0 + s * S); o.frequency.exponentialRampToValueAtTime(s % 8 ? 700 : 260, t0 + s * S + S * 1.5); g.gain.setValueAtTime(0.0001, t0 + s * S); g.gain.linearRampToValueAtTime(0.06, t0 + s * S + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t0 + s * S + S * 1.8); o.connect(g); g.connect(dst); o.start(t0 + s * S); o.stop(t0 + s * S + S * 2); }   // a cuíca
      return B * 4;
    }
    // ---- O LOTADO: 128 bpm, bumbo reto, palmas, chimbal, baixo no contratempo, acordes e arpejo (o "abaixa" no bumbo)
    const LOT_AC = [{ r: 45, n: [69, 72, 76] }, { r: 41, n: [69, 72, 77] }, { r: 48, n: [67, 72, 76] }, { r: 43, n: [67, 71, 74] }];
    function compassoLotado(c, dst, t0, n) {
      const B = 60 / 128, S = B / 4, A = LOT_AC[n % 4], parte = n % 16, virada = parte === 15;
      const resto = c.createGain(); resto.connect(dst);
      for (let b = 0; b < 4; b++) { const t = t0 + b * B; if (!(virada && b >= 2)) bumbo(c, dst, t, 150, 42, 0.3, 0.55); resto.gain.setValueAtTime(0.45, t); resto.gain.linearRampToValueAtTime(1, t + B * 0.6); }   // o "pump" (sidechain)
      for (const s of [4, 12]) { chiado(c, resto, t0 + s * S, 0.12, 0.2, 1400, 'bandpass', 1.2); chiado(c, resto, t0 + s * S + 0.012, 0.18, 0.1, 1100, 'bandpass', 1); }   // as palmas
      for (let i = 0; i < 16; i++) chiado(c, resto, t0 + i * S, i % 4 === 2 ? 0.16 : 0.03, i % 4 === 2 ? 0.07 : 0.03, 8000);   // chimbal fechado / aberto
      for (const s of [2, 6, 10, 14]) { nota(c, resto, A.r, t0 + s * S, S * 1.7, 0.22, 'sawtooth', 420, 0.004); nota(c, resto, A.r + 12, t0 + s * S, S * 1.2, 0.07, 'square', 900, 0.004); }
      if (parte >= 4) for (const s of [3, 6, 11, 14]) for (const m of A.n) nota(c, resto, m - 12, t0 + s * S, S * 1.2, 0.03, 'sawtooth', 2400, 0.004);   // os acordes
      if (parte >= 8 && !virada) { const ar = A.n.concat([A.n[0] + 12]); const corte = 1200 + (parte - 8) * 350; for (let i = 0; i < 16; i++) nota(c, resto, ar[i % 4] + 12, t0 + i * S, S * 0.9, 0.022, 'square', corte, 0.002); }   // o arpejo abrindo
      if (virada) { for (let i = 0; i < 16; i++) chiado(c, resto, t0 + i * S, 0.06, 0.03 + i * 0.008, 2200, 'bandpass', 1.5); chiado(c, resto, t0, B * 4, 0.04, 600, 'highpass'); }   // a virada (caixa e subida)
      return B * 4;
    }
    function laco() {
      const A = audio(); if (!A || !st.bus) return; const c = A.ctx;
      if (st.prox < c.currentTime) st.prox = c.currentTime + 0.05;
      while (st.prox < c.currentTime + 1.0) {
        if (st.modo !== st.modoAlvo) {                                 // troca de música no fim do compasso: some uma, entra a outra
          st.modo = st.modoAlvo; st.comp = 0; st.bpm = st.modo === 'tema' ? 104 : 128; st.t0 = st.prox;
          const g = st.bus.gain; g.cancelScheduledValues(st.prox - 0.4); g.setValueAtTime(g.value, st.prox - 0.4); g.linearRampToValueAtTime(0.25, st.prox); g.linearRampToValueAtTime(0.8, st.prox + 1.5);
        }
        st.prox += (st.modo === 'tema' ? compassoTema : compassoLotado)(c, st.bus, st.prox, st.comp++);
      }
    }
    return {
      tocar(modo) {
        const A = audio(); st.modo = st.modoAlvo = modo || 'tema'; st.bpm = st.modo === 'tema' ? 104 : 128; st.ini = performance.now();
        if (!A || st.bus) return;
        try { if (typeof Musica !== 'undefined' && Musica.tocando) Musica.parar(); } catch (e) { /* nada */ }
        const c = A.ctx; if (c.state === 'suspended') c.resume();
        st.bus = c.createGain(); st.bus.gain.value = 0; st.bus.connect(A.mestre); st.bus.gain.linearRampToValueAtTime(0.8, c.currentTime + 1.5);
        st.comp = 0; st.prox = c.currentTime + 0.15; st.t0 = st.prox; laco(); st.timer = setInterval(laco, 200);
      },
      parar() {
        clearInterval(st.timer); st.timer = 0; if (!st.bus) return; const b = st.bus; st.bus = null;
        try { const c = b.context; b.gain.cancelScheduledValues(c.currentTime); b.gain.setValueAtTime(b.gain.value, c.currentTime); b.gain.linearRampToValueAtTime(0, c.currentTime + 1.0); } catch (e) { /* nada */ }
        setTimeout(() => { try { b.disconnect(); } catch (e) { /* nada */ } }, 1600);
      },
      modo(m) { st.modoAlvo = m; if (!st.bus) { st.modo = m; st.bpm = m === 'tema' ? 104 : 128; } },
      // o tempo em batidas (para o piso e a dança): pelo relógio do áudio; sem som, pelo relógio da página
      batidas() { const A = audio(); if (A && st.bus) return Math.max(0, (A.ctx.currentTime - st.t0) * st.bpm / 60); return (performance.now() - st.ini) / 1000 * st.bpm / 60; },
      get modoAtual() { return st.modo; }, get tocando() { return !!st.bus; }, get bpm() { return st.bpm; },
    };
  }

  // ================================================================== o módulo (um por cidade aberta)
  function criar(api) {
    const S = () => api.S();
    const M = { R: null, D: null, nav: null, gente: [], jairo: null, val: null, capuz: null, opo: new Map(), banq: [], mesas: [], tex: new Map(), mats: new Map(), fumaca: [], decor: [], rua: {}, atoresRua: [], servindo: false, musica: criarMusica(), bat: 0, prox: 3, jogoNPC: null, bolas: [] };
    const dadosB = () => { const d = S().dados; if (!d.bar) d.bar = {}; return d.bar; };
    const hora = () => S().dados.hora;
    const hx = () => { const h = hora(); return h < 6 ? h + 24 : h; };
    const aberto = () => { const h = hx(); return h >= H_ABRE && h < H_FECHA; };
    const jairoLa = () => { const h = hx(); return h >= H_JAIRO && h < H_FECHA + 0.15; };
    const tAbs = () => { const d = S().dados; return (d.dia || 1) * 24 + hx(); };
    const fimDeSemana = () => api.diaSemana() >= 5;
    const capuzLa = () => fimDeSemana() && hx() >= CAPUZ_H[0] && hx() < CAPUZ_H[1];
    const faseVal = () => { const h = hx(); for (const F of VAL) if (h >= F.a && h < F.b) return F.f; return null; };
    const nomeJ = () => api.nomeJog();
    const lotado = () => M.gente.length >= LOTADO;
    const alvoGente = () => (aberto() ? Math.round(lerpC(CURVA[FLUXO[api.diaSemana()]], hx())) : 0);
    const texDe = (cv, chave) => { if (M.tex.has(chave)) return M.tex.get(chave); const t = new THREE.CanvasTexture(cv); t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; M.tex.set(chave, t); return t; };
    const matSprite = (chave, cv) => { if (M.mats.has(chave)) return M.mats.get(chave); const m = new THREE.SpriteMaterial({ map: texDe(cv, chave), transparent: true, alphaTest: 0.1 }); M.mats.set(chave, m); return m; };

    // ---------------------------------------------------------------- OS MODELOS: Jairo, o Valdemar (de folga), o capuz e os da sinuca
    function modelo(ap, fem2, roupa, cores) {
      const s = S(); let m = null, opt = null;
      try { if (s.f2 && s.f2.modeloPessoa) { const r = s.f2.modeloPessoa({ ap, fem: fem2, roupa, cores }); m = r.m; opt = r.opt; } } catch (e) { console.warn('[Bar] modelo:', e); }
      if (!m) { opt = Object.assign({ camisa: cores[0], listra: cores[0], gola: cores[2], calcao: cores[1], meia: cores[1], sola: '#e6e6e0', corTexto: '#F2F2EE', numero: '', nome: ' ', fundoNome: 'rgba(0,0,0,0)', manga: 0, meiao: 1, cabecao: 1, escala: 1 }, ap); m = makeAthlete(opt); }
      return { m, opt };
    }
    const acha = (lista, n, d) => { const i = (lista || []).findIndex((x) => x.nome === n); return i >= 0 ? i : d; };
    const EC = () => (typeof ESTILOS_CABELO !== 'undefined' ? ESTILOS_CABELO : null), EB = () => (typeof ESTILOS_BARBA !== 'undefined' ? ESTILOS_BARBA : null);
    function apJairo() { return Object.assign(api.gerarAparencia(4471, 'M'), { pele: '#9a6a48', cabelo: '#1c140e', corBarba: '#1c140e', estilo: acha(EC(), 'Careca', 3), barba: Math.max(0, (EB() || []).findIndex((b) => /bigode/i.test(b.nome))) }); }
    function apValdemar() { const B = EB() || []; return { pele: '#c98e65', cabelo: '#b9b6ae', estilo: 2, rosto: 0, labio: 3, corBarba: '#9a968c', barba: Math.max(0, B.findIndex((b) => /bigode/i.test(b.nome))) }; }
    function enfeitarJairo(m) {                                          // o avental vinho e o pano de prato no ombro
      const G = new api.Geo(); G.box(0.05, 0.62, 0.46, '#6a1a24', 0.17, 0.5, 0); G.box(0.04, 0.05, 0.6, '#3a0e14', 0.18, 1.0, 0);
      G.box(0.3, 0.04, 0.16, '#f2f2ee', -0.02, 1.28, 0.3); G.box(0.04, 0.3, 0.16, '#e8e8e2', 0.12, 1.0, 0.33); G.box(0.04, 0.24, 0.16, '#e8e8e2', -0.16, 1.05, 0.33);
      m.corpo.add(G.malha(api.MAT));
    }
    function enfeitarCapuz(m, opt) {                                     // o moletom com capuz (o rosto fica na sombra) e o bolso da frente
      const k = (opt && opt.cabecao) || 1, G = new api.Geo(), cor = '#2a2a30', esc = '#1a1a1e', y0 = 1.3;
      G.box(0.6 * k, 0.09, 0.66 * k, cor, -0.03 * k, y0 + 0.62 * k, 0); G.box(0.07, 0.66 * k, 0.66 * k, cor, -0.31 * k, y0, 0);
      for (const sz of [-1, 1]) G.box(0.58 * k, 0.66 * k, 0.07, cor, -0.03 * k, y0, sz * 0.32 * k);
      G.box(0.1, 0.12, 0.66 * k, esc, 0.25 * k, y0 + 0.52 * k, 0);
      G.box(0.035, 0.18, 0.3, esc, 0.19, 0.72, 0); G.box(0.02, 0.12, 0.02, '#c9ced4', 0.2, 1.1, 0.08); G.box(0.02, 0.12, 0.02, '#c9ced4', 0.2, 1.1, -0.08);   // o bolso e os cordões
      m.corpo.add(G.malha(api.MAT));
      const sombra = new THREE.Mesh(new THREE.PlaneGeometry(0.42 * k, 0.3 * k), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.55, depthWrite: false }));
      sombra.rotation.y = Math.PI / 2; sombra.position.set(0.262 * k, y0 + 0.44 * k, 0); m.corpo.add(sombra);   // a sombra do capuz no rosto
    }
    function novoAtor(ap, fem2, roupa, cores, tipo) { const { m, opt } = modelo(ap, fem2, roupa, cores); const A = api.atorDe(m, opt, tipo || 'clienteBar'); A.vel = 1.2; return A; }
    function criarJairo() { const A = novoAtor(apJairo(), false, 0, ['#1c1c1f', '#2a2a2e', '#1c1c1f', '#1c1c1f'], 'equipeBar'); enfeitarJairo(A.m); A.vel = 1.4; return A; }
    function criarVal() { const A = novoAtor(apValdemar(), false, 0, ['#f2f2ee', '#2a3f66', '#f2f2ee', '#f2f2ee'], 'equipeBar'); A.vel = 1.15; return A; }
    function criarCapuz() { const ap = Object.assign(api.gerarAparencia(9091, 'M'), { barba: 1 }); const A = novoAtor(ap, false, 0, ['#2a2a30', '#1c1c22', '#2a2a30', '#1c1c1f'], 'equipeBar'); enfeitarCapuz(A.m, A.opt); return A; }

    // ---------------------------------------------------------------- OS OPONENTES DA SINUCA
    const OPONENTES = [
      { id: 'ze', nome: 'Zé Pinguço', estrelas: 1, erro: 6, erroF: 0.14, sim: 0, burro: 0.3, dias: [0, 1, 2, 3, 4, 5, 6], h: [16.5, 25.6], seed: 3301, sexo: 'M', roupa: ['#c8a040', '#3a3a3e', '#c8a040', '#1c1c1f'],
        desafio: 'Hic! Bora... qual é a branca mesmo?', quips: { acerta: ['Olha essa!', 'Hic!'], erra: ['Cadê a caçapa?', 'Hic!', 'A mesa tá torta!'], ganha: ['Hehe, fica pra próxima!'], perde: ['Hoje não é o meu dia.'] } },
      { id: 'marlene', nome: 'Dona Marlene', estrelas: 2, erro: 2.8, erroF: 0.09, sim: 2, dias: [1, 3, 5], h: [18, 24], seed: 7762, sexo: 'F', roupa: ['#8a3a7a', '#2a2a3e', '#f2f2ee', '#1c1c1f'],
        desafioF: 'Vamos, querida. Jogo sinuca desde antes de você nascer.', desafio: 'Vamos, querido. Jogo sinuca desde antes de você nascer.', quips: { acerta: ['Essa foi fácil.'], erra: ['Ih, errei.'], ganha: ['Aprende, criança.'], perde: ['Sorte de principiante!'] } },
      { id: 'tonhao', nome: 'Tonhão', estrelas: 3, erro: 2.0, erroF: 0.07, sim: 3, dias: [2, 4, 5, 6], h: [19, 25.6], seed: 5120, sexo: 'M', roupa: ['#3a64b8', '#2a2a2e', '#f2f2ee', '#1c1c1f'],
        desafio: 'Encosta aí. Mas eu não alivio pra ninguém.', quips: { acerta: ['Olha essa!'], erra: ['A mesa tá torta!'], ganha: ['Hehe, fica pra próxima!'], perde: ['Treinou, hein?'] } },
      { id: 'cleiton', nome: 'Cleiton Taco de Ouro', estrelas: 4, erro: 1.1, erroF: 0.05, sim: 5, dias: [4, 5], h: [20, 25.6], seed: 8890, sexo: 'M', roupa: ['#c8952a', '#1c1c1f', '#1c1c1f', '#1c1c1f'],
        desafio: 'Taco de Ouro não perde. Escreve aí.', quips: { acerta: ['Essa foi fácil.', 'Taco de Ouro sempre ganha.'], erra: ['A mesa tá torta!'], ganha: ['Taco de Ouro sempre ganha.'], perde: ['Sorte de principiante!'] } },
      { id: 'valdemar', nome: 'Seu Valdemar', estrelas: 5, erro: 0.5, erroF: 0.04, sim: 8, posicao: true, val: true,
        desafio: 'Hehe... quer mesmo apanhar do velho aqui? Vem!', quips: { acerta: ['Olha essa!', 'Quarenta anos de sinuca, meu filho.'], erra: ['Ih, errei.'], ganha: ['Quarenta anos de sinuca, meu filho.'], perde: ['Treinou, hein?'] } },
    ];
    const OPO = {}; OPONENTES.forEach((o) => { OPO[o.id] = o; });
    const oponenteLa = (o) => (o.val ? faseVal() === 'sinuca' : o.dias.includes(api.diaSemana()) && hx() >= o.h[0] && hx() < o.h[1]);

    // ---------------------------------------------------------------- PROPS: o copo/a garrafa na mão (sprite, como o cafezinho), o cigarro, o taco
    function darNaMao(A, chave, cv, tam) {
      tirarDaMao(A);
      const sp = new THREE.Sprite(matSprite(chave, cv)); sp.scale.set(tam || 0.38, tam || 0.38, 1); sp.position.set(0.02, 0.09, 0); sp.center.set(0.08, 0.5);   // como o cafezinho da cafeteria (deslocado para não cobrir o rosto)
      const piv = new THREE.Group(); piv.position.set(0.03, -0.3, 0); piv.add(sp); A.m.bracoD.cotovelo.add(piv); A.mao = { piv, sp, chave };
    }
    function tirarDaMao(A) { if (A.mao && A.mao.piv.parent) A.mao.piv.parent.remove(A.mao.piv); A.mao = null; }
    const darBebida = (A, id) => darNaMao(A, 'p:' + id, canvasProduto(id), 0.4);
    const darCigarro = (A) => { darNaMao(A, 'cig', canvasCigarro(), 0.24); A.brasa = 0; };
    function copoNoBalcao(A, id, x, y, z) {                              // o copo descansando no balcão / na mesa (entre um gole e outro)
      tirarCopoApoio(A); const sp = new THREE.Sprite(matSprite('p:' + id, canvasProduto(id))); sp.scale.set(0.3, 0.3, 1); sp.center.set(0.5, 0.06); sp.position.set(x, y, z); M.R.grupo.add(sp); A.apoio = sp;
    }
    function tirarCopoApoio(A) { if (A.apoio && A.apoio.parent) A.apoio.parent.remove(A.apoio); A.apoio = null; }
    let geoTaco = null;
    function malhaTaco() {
      if (!geoTaco) { const G = new api.Geo(); G.box(0.95, 0.055, 0.055, '#f0d49a', 0.27, -0.028, 0); G.box(0.5, 0.08, 0.08, '#4a2a14', -0.45, -0.04, 0); G.box(0.05, 0.085, 0.085, '#e8b030', -0.19, -0.043, 0); G.box(0.04, 0.058, 0.058, '#fffaf0', 0.75, -0.029, 0); G.box(0.03, 0.058, 0.058, '#3a64b8', 0.785, -0.029, 0); geoTaco = G.malha(api.MAT); }
      return new THREE.Mesh(geoTaco.geometry, geoTaco.material);
    }
    function darTaco(A) { if (A.taco) return; const t = malhaTaco(); A.m.corpo.add(t); A.taco = t; }
    function tirarTaco(A) { if (A.taco && A.taco.parent) A.taco.parent.remove(A.taco); A.taco = null; }

    // ---------------------------------------------------------------- AS POSES (A.poseFn, por cima do poseAtor)
    function poseBar(A, m, r, dt) {
      const P = A.poseB, t = A.t || 0;
      if (P === 'gole' || P === 'segura') {                            // o copo: parado na frente do peito ou subindo para o gole
        const gole = P === 'gole' ? Math.max(0, Math.sin(Math.min(1, (A.tg || 0) / 1.4) * Math.PI)) : 0;
        const oz = 0.78 + gole * 0.5, cz = 1.3 + gole * 0.32; m.bracoD.rotation.z = oz; m.bracoD.rotation.x = 0.28 + gole * 0.2; usarCotovelo(m.bracoD, 0, cz);
        if (A.mao) A.mao.piv.rotation.z = -(oz + cz) + gole * 0.9;
        if (gole > 0.3) usarCabeca(m, 0.1 * gole);
        A.tg = (A.tg || 0) + dt;
      } else if (P === 'come') {                                      // beliscando o petisco: a mão vai do balcão à boca
        const k = Math.max(0, Math.sin(t * 2.6)); m.bracoD.rotation.z = 0.7 + k * 0.6; m.bracoD.rotation.x = 0.2 + k * 0.2; usarCotovelo(m.bracoD, 0, 0.6 + k * 1.1);
        m.bracoE.rotation.z = 0.5; usarCotovelo(m.bracoE, 0, 0.7); if (k > 0.8) usarCabeca(m, -0.04 + Math.sin(t * 11) * 0.06);
      } else if (P === 'fuma') {                                      // fumando: o braço esquerdo cruzado, a mão direita vai à boca de tempos em tempos
        const ciclo = (t + (A.off || 0)) % 6, puxa = ciclo < 1.3 ? Math.sin(ciclo / 1.3 * Math.PI) : 0;
        m.bracoE.rotation.z = 0.55; m.bracoE.rotation.x = -0.55; usarCotovelo(m.bracoE, 0, 1.45);
        m.bracoD.rotation.z = 0.55 + puxa * 0.72; m.bracoD.rotation.x = 0.35 + puxa * 0.1; usarCotovelo(m.bracoD, 0, 1.3 + puxa * 0.42);
        if (A.mao) A.mao.piv.rotation.z = -(m.bracoD.rotation.z + 1.3 + puxa * 0.42) + 0.4;
        A.brasa = puxa; A.solta = ciclo > 1.4 && ciclo < 2.6;
        if (puxa > 0.5) usarCabeca(m, 0.05);
      } else if (P === 'danca') poseDanca(A, m, r);
      else if (P === 'taco') {                                        // esperando a vez: o taco em pé, segurado pela mão direita
        m.bracoD.rotation.z = 0.32; m.bracoD.rotation.x = 0.15; usarCotovelo(m.bracoD, 0, 0.45);
        if (A.taco) { A.taco.rotation.set(0, 0, Math.PI / 2 - 0.08); A.taco.position.set(0.24, 0.62, 0.36); }
        if (A.torce) { const k = Math.abs(Math.sin(t * 7)); m.bracoE.rotation.z = 2.4 + k * 0.3; usarCotovelo(m.bracoE, 0, 0.3); }
      } else if (P === 'mira') {                                      // debruçado na mesa mirando: o taco vai e vem e, no fim, a tacada
        const T0 = A.tm || 0, puxa = T0 < A.durMira ? (0.5 - 0.5 * Math.cos(T0 * 5.2)) : Math.max(0, 1 - (T0 - A.durMira) * 9) * -0.4;
        m.corpo.rotation.z = -0.62; m.pernaE.rotation.z = 0.32; m.pernaD.rotation.z = -0.18; usarJoelhos(m, -0.12, 0);
        m.bracoE.rotation.z = 1.5; m.bracoE.rotation.x = -0.35; usarCotovelo(m.bracoE, 0, 0.25);
        m.bracoD.rotation.z = 0.25 - puxa * 0.25; m.bracoD.rotation.x = 0.3; usarCotovelo(m.bracoD, 0, 1.25 + puxa * 0.3);
        if (A.taco) { A.taco.rotation.set(0, 0, 0.62); A.taco.position.set(0.15 - puxa * 0.14, 1.02, 0.15); }
        A.tm = T0 + dt;
      }
    }
    function poseDanca(A, m, r) {
      const b = M.bat + (A.off || 0), s1 = Math.sin(b * Math.PI), s2 = Math.sin(b * Math.PI * 2), ab = Math.abs(s1), est = A.estilo || 0;
      const forte = M.musica.modoAtual === 'lotado' ? 1.25 : 0.85;
      r.position.y = A.y + ab * 0.05 * forte;
      if (est === 0) {                                                // o balanço: braços dobrados indo e vindo, o corpo de lado a lado
        m.corpo.rotation.x = s1 * 0.06 * forte; m.bracoE.rotation.z = 0.5 + s1 * 0.4; m.bracoD.rotation.z = 0.5 - s1 * 0.4; usarCotovelo(m.bracoE, 0, 1.3); usarCotovelo(m.bracoD, 0, 1.3);
        m.pernaE.rotation.z = s1 * 0.15; m.pernaD.rotation.z = -s1 * 0.15; usarJoelhos(m, -0.15 - ab * 0.15, -0.15 - (1 - ab) * 0.15);
      } else if (est === 1) {                                         // as mãos para cima, balançando
        m.bracoE.rotation.z = m.bracoD.rotation.z = 2.75 + s2 * 0.12; m.bracoE.rotation.x = -0.25 + s1 * 0.3; m.bracoD.rotation.x = 0.25 + s1 * 0.3; usarCotovelo(m.bracoE, 0, 0.25); usarCotovelo(m.bracoD, 0, 0.25);
        usarJoelhos(m, -0.1 - ab * 0.25, -0.1 - ab * 0.25); m.corpo.rotation.x = s1 * 0.06;
      } else if (est === 2) {                                         // o passinho: as pernas alternando e os braços "socando"
        m.pernaE.rotation.z = s1 * 0.42; m.pernaD.rotation.z = -s1 * 0.42; usarJoelhos(m, -0.2, -0.2);
        const p = Math.max(0, s2); m.bracoE.rotation.z = 0.35 + p * 0.5; m.bracoD.rotation.z = 0.35 + (1 - p) * 0.5; usarCotovelo(m.bracoE, 0, 1.6); usarCotovelo(m.bracoD, 0, 1.6);
        m.corpo.rotation.y = s1 * 0.25;
      } else {                                                        // rebolando: as mãos na cintura, o quadril vai e volta
        m.bracoE.rotation.z = 0.15; m.bracoE.rotation.x = 0.55; m.bracoD.rotation.z = 0.15; m.bracoD.rotation.x = -0.55; usarCotovelo(m.bracoE, 0, 1.7); usarCotovelo(m.bracoD, 0, 1.7);
        m.corpo.rotation.y = s1 * 0.4; m.corpo.rotation.x = s1 * 0.06; usarJoelhos(m, -0.25, -0.25);
      }
    }
    function pose(A, p) { A.poseB = p; A.poseFn = p ? poseBar : null; if (!p && A.m.corpo) A.m.corpo.rotation.y = 0; }

    // ---------------------------------------------------------------- NAVEGAÇÃO: grade de 0,35 m e A* (como no restaurante.js)
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

    // ---------------------------------------------------------------- OS LUGARES (pontos de cada atividade)
    const EMPE = [[-1.6, -0.9], [-1.0, -1.5], [0.4, -2.4], [1.2, -1.9], [-1.4, 5.4], [-0.6, 6.0], [3.0, 6.6], [3.9, 7.0], [9.6, 2.4], [9.9, 1.4], [4.4, 2.3], [5.0, 2.6]];
    const FUMO = [[8.3, 5.9], [8.4, 7.2], [10.1, 7.2], [10.15, 5.95]];
    const OLHA = [[3.6, -2.7], [8.5, -2.6], [8.6, -6.4], [3.6, -6.3]];
    const MIRA = [[4.05, -4.4, 0], [7.95, -4.4, Math.PI], [5.2, -3.1, Math.PI / 2], [6.8, -3.1, Math.PI / 2], [5.2, -5.7, -Math.PI / 2], [6.8, -5.7, -Math.PI / 2]];
    const ESPERA_SIN = [[4.0, -2.75], [8.1, -2.75], [8.15, -6.1]];
    const ocupados = (tipo) => new Set(M.gente.filter((A) => A.br && A.br.tipo === tipo && A.br.k != null).map((A) => A.br.k));
    const reservaVal = (a) => a === M.banq[0] && (() => { const h = hx(); return h >= VAL[0].a - 0.3 && h < VAL[0].b; })();
    function pontoNaPista() {
      const P = M.D.pista; let melhor = null, bd = -1;
      for (let k = 0; k < 14; k++) {
        const x = rnd(P.x0 + 0.6, P.x1 - 0.6), z = rnd(P.z0 + 0.6, P.z1 - 0.6); let dm = 9;
        for (const A of M.gente.concat(M.val ? [M.val] : [])) if (A.br && A.br.tipo === 'danca' && A.br.alvo) dm = Math.min(dm, Math.hypot(A.br.alvo.x - x, A.br.alvo.z - z));
        if (dm > bd) { bd = dm; melhor = { x, z }; }
      }
      return melhor;
    }
    const naPista = () => M.gente.filter((A) => A.br && A.br.tipo === 'danca').length;

    // ---------------------------------------------------------------- O POVO: chega, faz as coisas e vai embora
    function escolherAtividade(A) {
      const intenso = M.musica.modoAtual === 'lotado' || lotado();
      const banqL = M.banq.filter((a) => !a.ocupado && !reservaVal(a)), cadeiras = M.mesas.flatMap((T0) => T0.assentos.filter((a) => a && !a.ocupado));
      const fumoL = FUMO.map((p, k) => k).filter((k) => !ocupados('fumo').has(k)), empeL = EMPE.map((p, k) => k).filter((k) => !ocupados('empe').has(k)), olhaL = OLHA.map((p, k) => k).filter((k) => !ocupados('olha').has(k));
      const pesos = [];
      if (banqL.length) pesos.push(['banqueta', intenso ? 1.5 : 3]);
      if (cadeiras.length) pesos.push(['mesa', intenso ? 2 : 3]);
      if (naPista() < 14) pesos.push(['danca', intenso ? 4.5 : M.gente.length > 5 ? 1.2 : 0.5]);
      if (fumoL.length) pesos.push(['fumo', 1.1]);
      if (empeL.length) pesos.push(['empe', intenso ? 1.2 : 1]);
      if (olhaL.length && (M.jogoNPC || M.opo.size)) pesos.push(['olha', 0.7]);
      if (!pesos.length) pesos.push(['empe', 1]);
      const tipo = A.br && pesos.length > 1 ? sorteio(pesos.filter(([k]) => k !== A.br.tipo)) : sorteio(pesos);
      const br = { tipo, fase: 'indo', t: 0, dur: rnd(40, 90), k: null, alvo: null, a: null, beb: A.bebida || escolherBebida() };
      A.bebida = br.beb;
      if (tipo === 'banqueta') { br.a = pk(banqL); br.a.ocupado = A; br.alvo = pontoDaCadeira(br.a); }
      else if (tipo === 'mesa') { const comGente = M.mesas.filter((T0) => T0.assentos.some((a) => a && a.ocupado && a.ocupado !== S().jog) && T0.assentos.some((a) => a && !a.ocupado)); const T0 = comGente.length && Math.random() < 0.6 ? pk(comGente) : pk(M.mesas.filter((q) => q.assentos.some((a) => a && !a.ocupado))); br.a = pk(T0.assentos.filter((a) => a && !a.ocupado)); br.a.ocupado = A; br.mesa = T0; br.alvo = pontoDaCadeira(br.a); }
      else if (tipo === 'danca') { br.alvo = pontoNaPista(); br.estilo = Math.floor(Math.random() * 4); }
      else if (tipo === 'fumo') { br.k = pk(fumoL); br.alvo = { x: FUMO[br.k][0], z: FUMO[br.k][1] }; br.dur = rnd(25, 45); }
      else if (tipo === 'empe') { br.k = (empeL.length ? pk(empeL) : 0); br.alvo = { x: EMPE[br.k][0], z: EMPE[br.k][1] }; }
      else if (tipo === 'olha') { br.k = pk(olhaL); br.alvo = { x: OLHA[br.k][0], z: OLHA[br.k][1] }; }
      return br;
    }
    function escolherBebida() { return sorteio(PRODUTOS.filter((p) => p.npc).map((p) => [p.id, p.npc])); }
    function pontoDaCadeira(a) { const fx = Math.cos(a.yaw), fz = -Math.sin(a.yaw); return pontoLivre(a.x - fx * 0.6, a.z - fz * 0.6); }
    function sentarNPC(A, a) { A.sentado = true; A.x = a.x; A.z = a.z; A.assento = a.h; A.yaw = A.yawAlvo = a.yaw; A.andando = false; A.rotaP = null; }
    function comecarAtividade(A, imediato) {
      const br = A.br; br.fase = 'fazendo'; br.t = 0; A.andando = false; A.rotaP = null;
      if (br.tipo === 'banqueta' || br.tipo === 'mesa') {
        sentarNPC(A, br.a); pose(A, null); tirarDaMao(A);
        const fx = Math.cos(br.a.yaw), fz = -Math.sin(br.a.yaw);
        if (br.tipo === 'banqueta') copoNoBalcao(A, br.beb, br.a.x + 0.1, 1.12, -5.28); else copoNoBalcao(A, br.beb, br.a.x + fx * 0.42 + fz * 0.12, 0.77, br.a.z + fz * 0.42 - fx * 0.12);
        br.prox = rnd(1, imediato ? 9 : 4);
      } else if (br.tipo === 'danca') { A.estilo = br.estilo; A.off = Math.random() * 0.25; pose(A, 'danca'); tirarDaMao(A); A.yawAlvo = Math.atan2(-(1.4 - A.z), -7.0 - A.x) + rnd(-1.2, 1.2); br.vira = rnd(4, 9); }
      else if (br.tipo === 'fumo') { darCigarro(A); A.off = Math.random() * 6; pose(A, 'fuma'); A.yawAlvo = Math.atan2(-(6.6 - A.z), 9.3 - A.x); }
      else if (br.tipo === 'empe') { darBebida(A, br.beb); A.tg = 99; pose(A, 'segura'); br.prox = rnd(2, 6); const viz = M.gente.find((B) => B !== A && B.br && B.br.tipo === 'empe' && B.br.fase === 'fazendo' && Math.hypot(B.x - A.x, B.z - A.z) < 1.6); A.yawAlvo = viz ? Math.atan2(-(viz.z - A.z), viz.x - A.x) : rnd(-3, 3); br.viz = viz || null; }
      else if (br.tipo === 'olha') { pose(A, null); A.yawAlvo = Math.atan2(-(-4.4 - A.z), 6.0 - A.x); }
    }
    function terminarAtividade(A) {
      const br = A.br; if (!br) return;
      if (br.a && br.a.ocupado === A) br.a.ocupado = null;
      if (A.sentado) { const p = pontoDaCadeira(br.a || { x: A.x, z: A.z, yaw: A.yaw }); A.sentado = false; A.assento = 0.52; A.x = p.x; A.z = p.z; }
      tirarCopoApoio(A); tirarDaMao(A); pose(A, null); A.fala = false; A.brasa = 0; A.solta = false;
    }
    function novaPessoa(reg, jaDentro) {
      const s = S(), e = reg || null;
      const A = e && api.semente ? api.criarPessoa(s.f2, api.semente(e.seed), e.fem) : api.criarPessoa(s.f2, Math.random, Math.random() < 0.5);
      A.tipo = 'clienteBar'; A.vel = 1.0 + Math.random() * 0.3; if (e) A.reg = e; A.fica = rnd(90, 260); A.tvida = 0;
      A.br = escolherAtividade(A);
      if (jaDentro) { const p = A.br.alvo || { x: 0, z: 2 }; A.x = p.x; A.z = p.z; comecarAtividade(A, true); A.br.t = rnd(0, A.br.dur * 0.8); A.tvida = rnd(0, A.fica * 0.6); }
      else { const ent = M.R.entrada; A.x = ent.x + rnd(-0.3, 0.3); A.z = ent.z + 0.4; A.yaw = A.yawAlvo = Math.PI / 2; irPara(A, A.br.alvo.x, A.br.alvo.z); }
      s.npcs.push(A); api.poseAtor(A, 0.016); M.gente.push(A); return A;
    }
    function mandarEmbora(A) { terminarAtividade(A); A.br = { tipo: 'sai', fase: 'saindo', t: 0 }; const sd = M.R.saida; A.rotaP = caminho(A.x, A.z, sd.x, sd.z - 0.6); A.rotaP.push({ x: sd.x, z: sd.z + 0.2 }); }
    function sumirPessoa(A) {
      terminarAtividade(A); if (A.reg && api.lojaSaiu) api.lojaSaiu('bar', A.reg);
      M.gente = M.gente.filter((q) => q !== A); api.descartarPessoa(A);
    }
    // (chamado pela cidade em tickPessoas para cada um do povo)
    function tickCliente(A, dt) {
      const br = A.br; if (!br || !M.D) return; br.t += dt; A.tvida = (A.tvida || 0) + dt;
      if (br.tipo === 'sai') { if (andarP(A, dt) || br.t > 25) sumirPessoa(A); return; }
      if (br.fase === 'indo') {
        if (andarP(A, dt) || br.t > 22) {
          if (br.tipo === 'banqueta' || br.tipo === 'mesa') { if (br.a.ocupado !== A) { A.br = escolherAtividade(A); irPara(A, A.br.alvo.x, A.br.alvo.z); return; } }
          comecarAtividade(A);
        }
        return;
      }
      // fazendo
      if (br.tipo === 'banqueta' || br.tipo === 'mesa') {                // os goles: o copo sai do balcão/mesa, vai à boca e volta
        br.prox -= dt;
        if (br.prox <= 0 && !A.poseB) { darBebida(A, br.beb); if (A.apoio) A.apoio.visible = false; A.tg = 0; pose(A, 'gole'); br.prox = 1.5; br.golando = true; }
        else if (br.prox <= 0 && br.golando) { pose(A, null); tirarDaMao(A); if (A.apoio) A.apoio.visible = true; br.golando = false; br.prox = rnd(5, 11); }
        if (br.tipo === 'mesa' && !br.golando) { const viz = br.mesa.assentos.filter((a) => a && a.ocupado && a.ocupado !== A && a.ocupado.br); if (viz.length) { const k = Math.floor((S().t || 0) / 2.2 + (A.reg ? A.reg.seed % 3 : 0)) % (viz.length + 1); A.fala = k === 0 && Math.sin((S().t || 0) * 1.3 + A.x) > -0.2; } else A.fala = false; }
      } else if (br.tipo === 'empe') {
        br.prox -= dt; if (br.prox <= 0) { A.tg = 0; pose(A, 'gole'); br.prox = rnd(6, 11); } else if (A.poseB === 'gole' && A.tg > 1.5) { pose(A, 'segura'); A.tg = 99; }
        A.fala = !!br.viz && A.poseB !== 'gole' && Math.floor(br.t / 2.5) % 2 === (A.x > (br.viz.x || 0) ? 0 : 1);
      } else if (br.tipo === 'danca') { br.vira -= dt; if (br.vira <= 0) { br.vira = rnd(4, 9); A.yawAlvo += rnd(-1.6, 1.6); } }
      else if (br.tipo === 'fumo') { if (A.solta && !A.soltou) { A.soltou = true; soltarFumaca(A, true); } else if (!A.solta) A.soltou = false; A.tf = (A.tf || 0) - dt; if (A.tf <= 0) { A.tf = 0.7; soltarFumaca(A, false); } }
      else if (br.tipo === 'olha') { A.torce = M.jogoNPC && M.jogoNPC.vibra > 0; if (A.torce) { A.fala = true; } else A.fala = false; }
      // troca de atividade ou vai embora
      if (br.t > br.dur && !br.golando && A.poseB !== 'gole') {
        if (A.tvida > A.fica || (!aberto() && hx() > 25.8)) { mandarEmbora(A); return; }
        terminarAtividade(A); A.br = escolherAtividade(A); irPara(A, A.br.alvo.x, A.br.alvo.z);
      }
    }
    // o registro da cidade: quem chega da rua entra pela porta
    function portaLivre() { const e = M.R.entrada; for (const A of S().npcs) if (!A.sentado && Math.hypot(A.x - e.x, A.z - e.z) < 1.0) return false; return true; }
    function chegou(ents) {
      if (!M.D || !aberto() || !portaLivre() || hx() > 25.5) return false;
      if (M.gente.length >= alvoGente() + 1) return false;
      for (const e of ents) novaPessoa(e, false);
      return true;
    }
    function tickFluxo(dt) {
      M.prox -= dt; if (M.prox > 0) return; M.prox = rnd(3, 7);
      const alvo = alvoGente(), n = M.gente.filter((A) => A.br && A.br.tipo !== 'sai').length;
      if (n < alvo && portaLivre() && hx() < 25.5) novaPessoa(null, false);
      else if (n > alvo + 1) { const A = M.gente.find((q) => q.br && q.br.tipo !== 'sai' && q.br.fase === 'fazendo' && !q.br.golando); if (A) mandarEmbora(A); }
    }
    function povoar() {
      const alvo = alvoGente(); let n = 0;
      if (api.lojaGente) for (const e of api.lojaGente('bar')) { if (n >= alvo) { api.lojaSaiu('bar', e); continue; } novaPessoa(e, true); n++; }
      for (; n < Math.round(alvo * 0.9); n++) novaPessoa(null, true);
    }

    // ---------------------------------------------------------------- A FUMAÇA (sprites que sobem, crescem e somem)
    let texFumo = null;
    function soltarFumaca(A, baforada) {
      if (!M.R) return;
      if (!texFumo) { const cv = document.createElement('canvas'); cv.width = cv.height = 32; const g = cv.getContext('2d'), gr = g.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, 'rgba(220,220,225,0.9)'); gr.addColorStop(1, 'rgba(220,220,225,0)'); g.fillStyle = gr; g.fillRect(0, 0, 32, 32); texFumo = new THREE.CanvasTexture(cv); }
      const v = new THREE.Vector3();
      if (baforada) { A.m.raiz.updateMatrixWorld(true); v.set(0, 0, 0); A.m.corpo.localToWorld(v.set(0.4, 1.62, 0)); }
      else if (A.mao) { A.mao.sp.updateMatrixWorld(true); A.mao.sp.getWorldPosition(v); v.y += 0.08; } else return;
      M.R.grupo.worldToLocal(v);
      for (let k = 0; k < (baforada ? 4 : 1); k++) {
        const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: texFumo, transparent: true, depthWrite: false, opacity: baforada ? 0.5 : 0.3 }));
        sp.position.copy(v); sp.position.x += rnd(-0.05, 0.05); sp.scale.setScalar(baforada ? 0.18 : 0.08); M.R.grupo.add(sp);
        const fx = baforada ? Math.cos(A.yaw) * 0.25 : 0, fz = baforada ? -Math.sin(A.yaw) * 0.25 : 0;
        M.fumaca.push({ sp, t: 0, dur: baforada ? rnd(2.2, 3.2) : rnd(1.6, 2.4), vx: fx + rnd(-0.05, 0.05), vz: fz + rnd(-0.05, 0.05), vy: rnd(0.18, 0.3), cresce: baforada ? 0.5 : 0.22, op: sp.material.opacity });
      }
    }
    function tickFumaca(dt) {
      for (const F of M.fumaca) { F.t += dt; const u = F.t / F.dur; F.sp.position.x += F.vx * dt; F.sp.position.z += F.vz * dt; F.sp.position.y += F.vy * dt; F.vx *= 0.97; F.vz *= 0.97; F.sp.scale.setScalar(F.sp.scale.x + F.cresce * dt); F.sp.material.opacity = F.op * (1 - u); }
      const fora = M.fumaca.filter((F) => F.t >= F.dur); for (const F of fora) { if (F.sp.parent) F.sp.parent.remove(F.sp); F.sp.material.dispose(); }
      if (fora.length) M.fumaca = M.fumaca.filter((F) => F.t < F.dur);
    }

    // ---------------------------------------------------------------- A PISTA (o piso de luz), o globo, as luzes, a TV e as bolas da sinuca
    function montarPista() {
      const P = M.D.pista, W = P.x1 - P.x0, D = P.z1 - P.z0, cv = document.createElement('canvas'); cv.width = 64; cv.height = 64;
      const tex = new THREE.CanvasTexture(cv); tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearFilter;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshBasicMaterial({ map: tex })); m.rotation.x = -Math.PI / 2; m.position.set((P.x0 + P.x1) / 2, 0.046, (P.z0 + P.z1) / 2); M.R.grupo.add(m);
      M.pista = { cv, g: cv.getContext('2d'), tex, m, ult: -1 }; desenharPista(0);
      // as luzes coloridas que passeiam pelo chão
      const cv2 = document.createElement('canvas'); cv2.width = cv2.height = 64; const g2 = cv2.getContext('2d'), gr = g2.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g2.fillStyle = gr; g2.fillRect(0, 0, 64, 64);
      const t2 = new THREE.CanvasTexture(cv2); M.tex.set('spot', t2); M.spots = [];
      const CORES = [0xff3aa0, 0x3ae8ff, 0xf2e030, 0x7a5aff, 0x5aff8a];
      for (let i = 0; i < 5; i++) { const s = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), new THREE.MeshBasicMaterial({ map: t2, color: CORES[i], transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false })); s.rotation.x = -Math.PI / 2; s.position.y = 0.06; s.renderOrder = 3; M.R.grupo.add(s); M.spots.push({ s, f: 0.13 + i * 0.05, ph: i * 1.7 }); }
      // o globo espelhado
      const cv3 = document.createElement('canvas'); cv3.width = 32; cv3.height = 16; const g3 = cv3.getContext('2d'); for (let y = 0; y < 16; y += 2) for (let x = 0; x < 32; x += 2) { const v = 120 + Math.floor(Math.random() * 135); g3.fillStyle = 'rgb(' + v + ',' + v + ',' + (v + 10) + ')'; g3.fillRect(x, y, 2, 2); }
      const t3 = new THREE.CanvasTexture(cv3); t3.magFilter = THREE.NearestFilter; M.tex.set('globo', t3);
      const gl = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 8), new THREE.MeshBasicMaterial({ map: t3 })); gl.position.set(M.D.globo.x, M.D.globo.y, M.D.globo.z); M.R.grupo.add(gl); M.globo = gl;
    }
    const PAL_TEMA = ['#7a2a5a', '#2a3a7a', '#7a5a1a', '#1f5a4a', '#5a2a7a'], PAL_LOT = ['#ff3aa0', '#3ae8ff', '#f2e030', '#9a5aff', '#5aff8a', '#ff7a2a'];
    function desenharPista(b) {
      const P = M.pista, g = P.g, lot = M.musica.modoAtual === 'lotado', pal = lot ? PAL_LOT : PAL_TEMA, k = Math.floor(b);
      for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) {
        const on = lot ? hash(i, j, k) > 0.45 : ((i + j + k) % 3 === 0 || hash(i, j, k >> 1) > 0.78);
        const c = on ? pal[Math.floor(hash(i, j, k * 7 + 1) * pal.length)] : '#1c1424';
        g.fillStyle = c; g.fillRect(i * 8, j * 8, 8, 8); g.fillStyle = 'rgba(0,0,0,0.45)'; g.fillRect(i * 8, j * 8 + 7, 8, 1); g.fillRect(i * 8 + 7, j * 8, 1, 8);
        if (on) { g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(i * 8 + 1, j * 8 + 1, 2, 1); }
      }
      P.tex.needsUpdate = true;
    }
    function montarTV() {
      const T0 = M.D.tv, cv = document.createElement('canvas'); cv.width = 96; cv.height = 54;
      const tex = new THREE.CanvasTexture(cv); tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearFilter;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(T0.w, T0.h), new THREE.MeshBasicMaterial({ map: tex })); m.position.set(T0.x, T0.y, T0.z); M.R.grupo.add(m);
      M.tv = { cv, g: cv.getContext('2d'), tex, t: 0, jog: Array.from({ length: 10 }, (v, i) => ({ x: 10 + Math.random() * 76, y: 12 + Math.random() * 34, time: i % 2, vx: 0, vy: 0 })), bola: { x: 48, y: 28 } , placar: [Math.floor(Math.random() * 3), Math.floor(Math.random() * 3)] };
    }
    function desenharTV(dt) {
      const V = M.tv; if (!V) return; V.t += dt; if (V.t < 0.12) return; V.t = 0;
      const g = V.g, B = V.bola;
      g.fillStyle = '#2f8a3a'; g.fillRect(0, 0, 96, 54); g.fillStyle = '#35963f'; for (let x = 0; x < 96; x += 12) g.fillRect(x, 8, 6, 46);
      g.fillStyle = '#e8f4e8'; g.fillRect(4, 8, 88, 1); g.fillRect(4, 53, 88, 1); g.fillRect(4, 8, 1, 46); g.fillRect(91, 8, 1, 46); g.fillRect(48, 8, 1, 46);
      g.strokeStyle = '#e8f4e8'; g.beginPath(); g.arc(48.5, 31, 6, 0, Math.PI * 2); g.stroke(); g.strokeRect(4.5, 22.5, 8, 17); g.strokeRect(83.5, 22.5, 8, 17);
      B.x += (Math.random() - 0.5) * 6; B.y += (Math.random() - 0.5) * 4; B.x = clampN(B.x, 8, 88); B.y = clampN(B.y, 12, 50);
      for (const j of V.jog) { j.vx += (B.x - j.x) * 0.02 + (Math.random() - 0.5) * 0.8; j.vy += (B.y - j.y) * 0.02 + (Math.random() - 0.5) * 0.8; j.vx *= 0.8; j.vy *= 0.8; j.x = clampN(j.x + j.vx, 6, 90); j.y = clampN(j.y + j.vy, 10, 52); g.fillStyle = j.time ? '#f2f2ee' : '#c8302a'; g.fillRect(Math.round(j.x), Math.round(j.y) - 1, 2, 3); g.fillStyle = '#1c1c1f'; g.fillRect(Math.round(j.x), Math.round(j.y) + 2, 2, 1); }
      g.fillStyle = '#ffffff'; g.fillRect(Math.round(B.x), Math.round(B.y), 1, 1);
      g.fillStyle = 'rgba(0,0,0,0.7)'; g.fillRect(2, 1, 40, 7); g.fillStyle = '#ffffff'; g.font = 'bold 6px monospace'; g.fillText('VER ' + V.placar[0] + 'x' + V.placar[1] + ' BRA', 4, 7);
      if (Math.random() < 0.002) V.placar[Math.random() < 0.5 ? 0 : 1]++;
      V.tex.needsUpdate = true;
    }
    function montarBolasMesa() {                                       // as bolas de enfeite no pano (mexem quando alguém tacada)
      const Sd = M.D.sinuca, CORES = ['#f8f6ee', '#f2c230', '#2f6ad8', '#d8302a', '#7a3fb0', '#e8742a', '#1f9a4d', '#8a2a20', '#1c1c1f'];
      const geo = new THREE.SphereGeometry(0.04, 8, 6); M.geoBola = geo; M.bolas = [];
      for (let i = 0; i < 10; i++) { const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color: CORES[i % 9] })); m.position.set(Sd.x + rnd(-1.1, 1.1), Sd.y + 0.04, Sd.z + rnd(-0.5, 0.5)); M.R.grupo.add(m); M.bolas.push({ m, de: m.position.clone(), para: m.position.clone(), t: 1 }); }
    }
    function mexerBolas() {
      const Sd = M.D.sinuca; let vivas = M.bolas.filter((b) => b.m.visible);
      if (vivas.length < 4) { for (const b of M.bolas) { b.m.visible = true; b.de.copy(b.m.position); b.para.set(Sd.x + rnd(-1.1, 1.1), Sd.y + 0.04, Sd.z + rnd(-0.5, 0.5)); b.t = 0; } return; }
      for (let k = 0; k < 3; k++) { const b = pk(vivas); b.de.copy(b.m.position); b.para.set(clampN(b.m.position.x + rnd(-0.8, 0.8), Sd.x - 1.15, Sd.x + 1.15), b.m.position.y, clampN(b.m.position.z + rnd(-0.4, 0.4), Sd.z - 0.55, Sd.z + 0.55)); b.t = 0; }
      if (Math.random() < 0.5) { const b = pk(vivas.slice(1)); if (b) b.cai = true; }
    }
    function tickBolas(dt) { for (const b of M.bolas) if (b.t < 1) { b.t = Math.min(1, b.t + dt * 1.6); const e = 1 - Math.pow(1 - b.t, 3); b.m.position.lerpVectors(b.de, b.para, e); if (b.t >= 1 && b.cai) { b.cai = false; b.m.visible = false; } } }

    // ---------------------------------------------------------------- O JAIRO (atrás do balcão: limpa copo, anda, tira chope e serve)
    function tickJairo(dt) {
      const s = S(), A = M.jairo; if (!A) return;
      if (A.servindoJog) return;                                         // a cena do pedido manda nele
      const B = M.D.barman; A.tj = (A.tj || 0) - dt;
      if (A.rotaP && A.rotaP.length) { if (andarP(A, dt)) { A.yawAlvo = -Math.PI / 2; if (A.vaiTirar) { A.vaiTirar = false; pose(A, null); A.poseJ = 'chope'; A.tj = 2.2; } } return; }
      if (A.poseJ === 'chope') { const k = Math.sin((s.t || 0) * 3); A.m.bracoD.rotation.z = 1.1 + k * 0.05; if (A.tj <= 0) { A.poseJ = null; A.tj = rnd(3, 8); } return; }
      if (A.tj <= 0) {
        const r = Math.random();
        if (r < 0.35) { const x = rnd(-10.0, -3.2); A.rotaP = [{ x, z: B.z }]; }                // vai para outra ponta do balcão
        else if (r < 0.6) { A.rotaP = [{ x: rnd(-8.2, -7.1), z: B.z }]; A.vaiTirar = true; }      // tira um chope
        else { A.limpa = !A.limpa; }
        A.tj = rnd(4, 9);
      }
      if (A.limpa && !A.rotaP) { A.poseFn = poseJairo; } else if (!A.poseJ) A.poseFn = null;
    }
    function poseJairo(A, m) {
      const t = A.t || 0;
      if (A.poseJ === 'serve') { m.bracoD.rotation.z = 1.2; m.bracoE.rotation.z = 1.0; usarCotovelo(m.bracoD, 0, 0.6); usarCotovelo(m.bracoE, 0, 0.7); return; }
      if (A.poseJ === 'tira') { m.bracoD.rotation.z = 1.25; m.bracoD.rotation.x = 0.2; usarCotovelo(m.bracoD, 0, 0.9 + Math.sin(t * 6) * 0.05); m.bracoE.rotation.z = 0.9; usarCotovelo(m.bracoE, 0, 1.1); return; }
      // limpando o copo com o pano: a mão direita gira em volta da esquerda
      m.bracoE.rotation.z = 0.85; m.bracoE.rotation.x = -0.25; usarCotovelo(m.bracoE, 0, 1.2);
      m.bracoD.rotation.z = 0.9 + Math.sin(t * 6) * 0.12; m.bracoD.rotation.x = 0.3 + Math.cos(t * 6) * 0.1; usarCotovelo(m.bracoD, 0, 1.15);
      usarCabeca(m, -0.08);
    }

    // ---------------------------------------------------------------- O SEU VALDEMAR (bebe, dança, sinuca, fuma, vai embora)
    function tickVal(dt, entrando) {
      const s = S(), f = faseVal();
      if (!M.val) {
        if (!f || f === 'sai') return;
        const V = M.val = criarVal(); s.npcs.push(V); s.falantesExtra = s.falantesExtra || {}; s.falantesExtra.valb = { A: V, nome: Tx('Seu Valdemar'), voz: 1 };
        V.br = { tipo: 'val' }; V.fv = null;
        if (entrando) { const p = alvoVal(f); V.x = p.x; V.z = p.z; V.fv = f; comecarVal(V, f); }
        else { const e = M.R.entrada; V.x = e.x; V.z = e.z + 0.4; V.yaw = V.yawAlvo = Math.PI / 2; V.fv = f; V.chegando = true; const p = alvoVal(f); V.rotaP = caminho(V.x, V.z, p.x, p.z, f === 'bebe'); }
        return;
      }
      const V = M.val;
      if (V.saindo) { if (andarP(V, dt) || (V.ts = (V.ts || 0) + dt) > 25) { tirarVal(); } return; }
      if (V.jogandoComJog) return;                                     // está jogando com o jogador (a cena manda)
      if (!f || f === 'sai') { if (!V.emSinuca) { fimVal(V); V.saindo = true; const sd = M.R.saida; V.rotaP = caminho(V.x, V.z, sd.x, sd.z - 0.6); V.rotaP.push({ x: sd.x, z: sd.z + 0.2 }); } return; }
      if (f !== V.fv) { fimVal(V); V.fv = f; V.chegando = true; const p = alvoVal(f); V.rotaP = caminho(V.x, V.z, p.x, p.z, f === 'bebe'); return; }
      if (V.chegando) { if (andarP(V, dt) || (V.tc = (V.tc || 0) + dt) > 25) { V.chegando = false; V.tc = 0; comecarVal(V, f); } return; }
      // fazendo a fase
      if (f === 'bebe' && V.semBanq) { V.prox = (V.prox || 0) - dt; if (V.prox <= 0) { V.prox = rnd(5, 9); V.tg = 0; pose(V, 'gole'); } else if (V.poseB === 'gole' && V.tg > 1.5) { V.tg = 99; pose(V, 'segura'); } }
      else if (f === 'bebe') { V.prox = (V.prox || 0) - dt; if (V.prox <= 0 && !V.golando) { darBebida(V, 'longneck'); if (V.apoio) V.apoio.visible = false; V.tg = 0; pose(V, 'gole'); V.golando = true; V.prox = 1.5; } else if (V.prox <= 0 && V.golando) { pose(V, null); tirarDaMao(V); if (V.apoio) V.apoio.visible = true; V.golando = false; V.prox = rnd(4, 8); } }
      else if (f === 'fuma') { if (V.solta && !V.soltou) { V.soltou = true; soltarFumaca(V, true); } else if (!V.solta) V.soltou = false; V.tf = (V.tf || 0) - dt; if (V.tf <= 0) { V.tf = 0.7; soltarFumaca(V, false); } }
      else if (f === 'danca') { V.vira = (V.vira || 3) - dt; if (V.vira <= 0) { V.vira = rnd(3, 7); V.yawAlvo += rnd(-1.5, 1.5); V.estilo = pk([0, 2]); } }
    }
    function alvoVal(f) {
      if (f === 'bebe') { const a = M.banq[0].ocupado && M.banq[0].ocupado !== M.val ? M.banq.find((q) => !q.ocupado) || M.banq[0] : M.banq[0]; M.val.banq = a; return pontoDaCadeira(a); }
      if (f === 'danca') { const p = pontoNaPista(); M.val.br = { tipo: 'danca', alvo: p }; return p; }
      if (f === 'sinuca') return { x: ESPERA_SIN[0][0], z: ESPERA_SIN[0][1] };
      if (f === 'fuma') return { x: FUMO[3][0], z: FUMO[3][1] };
      return M.R.saida;
    }
    function comecarVal(V, f) {
      V.andando = false; V.rotaP = null;
      if (f === 'bebe') {
        const a = V.banq || M.banq[0]; if (a.ocupado && a.ocupado !== V) { const q = M.banq.find((b) => !b.ocupado); if (q) V.banq = q; }
        if (V.banq.ocupado && V.banq.ocupado !== V) {                    // tudo cheio: um do povo cede a banqueta para ele (nunca o jogador)
          const q = M.banq.find((b) => b.ocupado && b.ocupado.br && M.gente.includes(b.ocupado));
          if (q) { const o = q.ocupado; terminarAtividade(o); o.br = escolherAtividade(o); irPara(o, o.br.alvo.x, o.br.alvo.z); V.banq = q; }
          else { darBebida(V, 'longneck'); V.tg = 99; pose(V, 'segura'); V.semBanq = true; return; }   // nem isso: bebe de pé no balcão (raro)
        }
        const b = V.banq; b.ocupado = V; sentarNPC(V, b); copoNoBalcao(V, 'longneck', b.x + 0.1, 1.12, -5.28); V.prox = 2; }
      else if (f === 'danca') { V.estilo = 0; V.off = 0.1; pose(V, 'danca'); }
      else if (f === 'sinuca') { V.emSinuca = true; darTaco(V); pose(V, 'taco'); }
      else if (f === 'fuma') { const ocupante = M.gente.find((A) => A.br && A.br.tipo === 'fumo' && A.br.k === 3); if (ocupante) { terminarAtividade(ocupante); ocupante.br = escolherAtividade(ocupante); irPara(ocupante, ocupante.br.alvo.x, ocupante.br.alvo.z); } darCigarro(V); V.off = 0; pose(V, 'fuma'); V.yawAlvo = Math.atan2(-(6.6 - V.z), 9.3 - V.x); }
    }
    function fimVal(V) {
      if (V.sentado && V.banq) { const p = pontoDaCadeira(V.banq); V.sentado = false; V.assento = 0.52; V.x = p.x; V.z = p.z; if (V.banq.ocupado === V) V.banq.ocupado = null; }
      tirarCopoApoio(V); tirarDaMao(V); tirarTaco(V); pose(V, null); V.golando = false; V.emSinuca = false; V.brasa = 0; V.solta = false; V.semBanq = false;
    }
    function tirarVal() { const s = S(), V = M.val; if (!V) return; fimVal(V); api.descartarPessoa(V); M.val = null; if (s.falantesExtra) delete s.falantesExtra.valb; }

    // ---------------------------------------------------------------- A SINUCA DOS NPCs (os oponentes que estão lá, e o Valdemar)
    function tickOponentes(dt, entrando) {
      const s = S();
      for (const o of OPONENTES) {
        if (o.val) continue;
        const la = aberto() && oponenteLa(o), A = M.opo.get(o.id);
        if (la && !A) {
          const ap = api.gerarAparencia(o.seed, o.sexo), B = novoAtor(ap, o.sexo === 'F', 0, o.roupa, 'equipeBar'); B.opo = o; s.npcs.push(B); M.opo.set(o.id, B);
          s.falantesExtra = s.falantesExtra || {}; s.falantesExtra['op_' + o.id] = { A: B, nome: Tx(o.nome), voz: o.sexo === 'F' ? 0 : 2 };
          const k = M.opo.size - 1, p = ESPERA_SIN[k % ESPERA_SIN.length];
          if (entrando) { B.x = p[0]; B.z = p[1]; } else { const e = M.R.entrada; B.x = e.x; B.z = e.z + 0.4; B.rotaP = caminho(B.x, B.z, p[0], p[1]); }
          darTaco(B); pose(B, 'taco'); B.espera = p;
        } else if (!la && A && !A.jogandoComJog && !A.saindo) { if (M.jogoNPC && M.jogoNPC.js.includes(A)) M.jogoNPC = null; tirarTaco(A); pose(A, null); A.saindo = true; const sd = M.R.saida; A.rotaP = caminho(A.x, A.z, sd.x, sd.z - 0.6); A.rotaP.push({ x: sd.x, z: sd.z + 0.2 }); }
      }
      for (const [id, A] of M.opo) {
        if (A.saindo) { if (andarP(A, dt) || (A.ts = (A.ts || 0) + dt) > 25) { api.descartarPessoa(A); M.opo.delete(id); if (s.falantesExtra) delete s.falantesExtra['op_' + id]; } continue; }
        if (A.rotaP && A.rotaP.length && !A.jogandoComJog) { andarP(A, dt); if (!A.rotaP.length) { A.yawAlvo = Math.atan2(-(M.D.sinuca.z - A.z), M.D.sinuca.x - A.x); if (A.poseB !== 'mira') pose(A, 'taco'); } }
      }
      tickJogoNPC(dt);
    }
    function jogadoresSinuca() {
      const L = []; for (const A of M.opo.values()) if (!A.saindo && !A.jogandoComJog && !(A.rotaP && A.rotaP.length && !M.jogoNPC)) L.push(A);
      if (M.val && M.val.emSinuca && !M.val.chegando && !M.val.jogandoComJog) L.unshift(M.val);
      return L;
    }
    function tickJogoNPC(dt) {
      if (M.jogando) return;                                          // o jogador está jogando: a mesa é dele
      const L = jogadoresSinuca();
      if (L.length < 2) { if (M.jogoNPC) { for (const A of M.jogoNPC.js) if (A.poseB === 'mira') { pose(A, 'taco'); } M.jogoNPC = null; } return; }
      let J0 = M.jogoNPC;
      if (!J0 || !L.includes(J0.js[0]) || !L.includes(J0.js[1])) { J0 = M.jogoNPC = { js: [L[0], L[1]], vez: 0, fase: 'vai', t: 0, vibra: 0 }; irMira(J0); }
      J0.t += dt; J0.vibra = Math.max(0, J0.vibra - dt);
      const A = J0.js[J0.vez], O = J0.js[1 - J0.vez];
      if (J0.fase === 'vai') { if (andarP(A, dt) || J0.t > 12) { J0.fase = 'mira'; J0.t = 0; A.yawAlvo = J0.mira[2]; A.tm = 0; A.durMira = rnd(1.8, 3.4); pose(A, 'mira'); } }
      else if (J0.fase === 'mira') { if (A.tm > A.durMira) { J0.fase = 'olha'; J0.t = 0; somTacada(); mexerBolas(); if (Math.random() < 0.4) J0.vibra = 1.4; } }
      else if (J0.fase === 'olha') { if (J0.t > 1.4) { pose(A, 'taco'); J0.fase = 'troca'; J0.t = 0; } }
      else if (J0.fase === 'troca') { if (Math.random() < 0.55) J0.vez = 1 - J0.vez; irMira(J0); J0.fase = 'vai'; J0.t = 0; }
      if (O && O.poseB !== 'taco' && !(O.rotaP && O.rotaP.length)) pose(O, 'taco');
      if (O && !(O.rotaP && O.rotaP.length)) O.yawAlvo = Math.atan2(-(M.D.sinuca.z - O.z), M.D.sinuca.x - O.x);
      if (O && J0.fase === 'vai' && !(O.rotaP && O.rotaP.length) && Math.hypot(O.x - A.x, O.z - A.z) < 0.8) { const p = ESPERA_SIN.find((q) => Math.hypot(q[0] - A.x, q[1] - A.z) > 1.5) || ESPERA_SIN[1]; O.rotaP = caminho(O.x, O.z, p[0], p[1]); }
    }
    function irMira(J0) { const A = J0.js[J0.vez]; J0.mira = pk(MIRA); A.rotaP = caminho(A.x, A.z, J0.mira[0], J0.mira[1], true); pose(A, 'taco'); }
    function somTacada() {
      const A = typeof Som !== 'undefined' && Som.audio && !Som.mudo ? Som.audio : null; if (!A) return; const c = A.ctx, J = S().jog;
      const dist = Math.hypot(J.x - M.D.sinuca.x, J.z - M.D.sinuca.z), vol = clampN(0.25 - dist * 0.018, 0.02, 0.25);
      for (let k = 0; k < 3; k++) { const t = c.currentTime + k * rnd(0.08, 0.2); const b = c.createBuffer(1, 2000, c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / 160); const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s.buffer = b; f.type = 'bandpass'; f.frequency.value = 3200; f.Q.value = 3; g.gain.value = vol * (k ? 0.6 : 1); s.connect(f); f.connect(g); g.connect(A.mestre); s.start(t); }
    }

    // ---------------------------------------------------------------- O HOMEM DE CAPUZ (lá dentro)
    function tickCapuz(dt, entrando) {
      const s = S(), la = aberto() && capuzLa();
      if (la && !M.capuz) {
        const A = M.capuz = criarCapuz(); s.npcs.push(A); s.falantesExtra = s.falantesExtra || {}; s.falantesExtra.capuz = { A, nome: Tx('Homem de capuz'), voz: 3 };
        if (entrando) { sentarCapuz(A); } else { const e = M.R.entrada; A.x = e.x; A.z = e.z + 0.4; A.yaw = A.yawAlvo = Math.PI / 2; A.rotaP = caminho(A.x, A.z, ...Object.values(pontoDaCadeira(M.capuzA))); A.chegando = true; }
      } else if (!la && M.capuz && !M.capuz.saindo && !M.capuz.falando) {
        const A = M.capuz; if (A.sentado) { const p = pontoDaCadeira(M.capuzA); A.sentado = false; A.x = p.x; A.z = p.z; M.capuzA.ocupado = null; }
        pose(A, null); A.saindo = true; const sd = M.R.saida; A.rotaP = caminho(A.x, A.z, sd.x, sd.z - 0.6); A.rotaP.push({ x: sd.x, z: sd.z + 0.2 });
      }
      const A = M.capuz; if (!A) return;
      if (A.chegando) { if (andarP(A, dt) || (A.tc = (A.tc || 0) + dt) > 25) { A.chegando = false; sentarCapuz(A); } }
      else if (A.saindo) { if (andarP(A, dt) || (A.ts = (A.ts || 0) + dt) > 25) { api.descartarPessoa(A); M.capuz = null; if (s.falantesExtra) delete s.falantesExtra.capuz; if (M.caderno) M.caderno.visible = false; } }
    }
    function sentarCapuz(A) {
      const a = M.capuzA; if (a.ocupado && a.ocupado !== A) { const o = a.ocupado; if (o.br) { terminarAtividade(o); o.br = escolherAtividade(o); irPara(o, o.br.alvo.x, o.br.alvo.z); } }
      a.ocupado = A; sentarNPC(A, a); A.poseFn = poseCapuz;
      if (!M.caderno) { const G = new api.Geo(); G.box(0.22, 0.02, 0.16, '#f2f2ee', 0, 0, 0); G.box(0.22, 0.004, 0.012, '#3a64b8', 0, 0.02, 0.03); G.box(0.012, 0.012, 0.15, '#c8302a', 0.05, 0.021, -0.02); M.caderno = G.malha(api.MAT); M.R.grupo.add(M.caderno); }
      M.caderno.visible = true; M.caderno.position.set(M.D.capuz.x - 0.12, 0.775, M.D.capuz.z + 0.05);
    }
    function poseCapuz(A, m) {                                         // os braços apoiados na mesa, a cabeça baixa (de vez em quando olha em volta)
      const t = A.t || 0; m.bracoE.rotation.z = m.bracoD.rotation.z = 0.95; m.bracoE.rotation.x = -0.3; m.bracoD.rotation.x = 0.3; usarCotovelo(m.bracoE, 0, 1.0); usarCotovelo(m.bracoD, 0, 1.0);
      usarCabeca(m, A.fala ? -0.02 : -0.12 + Math.max(0, Math.sin(t * 0.4)) * 0.08);
    }

    // ---------------------------------------------------------------- entrou / saiu
    function entrou(R, idx) {
      const s = S(); M.R = R; M.D = R.bar || null; if (!M.D) return;
      if (s.dentro) s.dentro.luz = LUZ;
      s.falantesExtra = s.falantesExtra || {}; M.nav = null; montarNav();
      M.banq = M.D.banquetas.map((k) => idx[k]).filter(Boolean);
      M.mesas = M.D.mesas.map((T0) => ({ x: T0.x, z: T0.z, assentos: T0.assentos.map((k) => idx[k]).filter(Boolean) }));
      M.capuzA = idx[M.D.capuz.assento]; if (M.D.capuzMesa) for (const k of M.D.capuzMesa) { const a = idx[k]; if (a) a.reservado = true; }
      M.gente = []; M.opo = new Map(); M.val = null; M.capuz = null; M.jogoNPC = null; M.caderno = null; M.fumaca = []; M.prox = rnd(2, 5); M.servindo = false; M.jogando = false;
      montarPista(); montarTV(); montarBolasMesa();
      if (jairoLa()) { const A = M.jairo = criarJairo(), B = M.D.barman; s.npcs.push(A); A.x = B.x; A.z = B.z; A.yaw = A.yawAlvo = B.yaw; s.falantesExtra.jairo = { A, nome: Tx('Jairo'), voz: 2 }; }
      if (aberto()) { povoar(); tickVal(0, true); tickCapuz(0, true); tickOponentes(0, true); }
      if (aberto()) M.musica.tocar(lotado() ? 'lotado' : 'tema');
    }
    function saiu() {
      const s = S();
      if (api.lojaRestam) { const L = []; for (const A of M.gente) if (A.reg) L.push({ e: A.reg, resta: Math.max(0.05, (A.fica - (A.tvida || 0)) / 3600 * 24 / 0.9 * 0.25) }); api.lojaRestam('bar', L); }
      if (s.falantesExtra) for (const k of Object.keys(s.falantesExtra)) if (k === 'jairo' || k === 'valb' || k === 'capuz' || k.startsWith('op_')) delete s.falantesExtra[k];
      const J = s.jog; if (J) { tirarDaMao(J); if (J.poseFn === poseBar) J.poseFn = null; J.poseB = null; if (J.m) J.m.raiz.rotation.z = 0; }
      M.musica.parar(); try { if (typeof Musica !== 'undefined') Musica.tocar('jazz'); } catch (e) { /* sem música */ }
      for (const F of M.fumaca) F.sp.material.dispose(); M.fumaca = [];
      M.R = null; M.D = null; M.nav = null; M.gente = []; M.jairo = null; M.val = null; M.capuz = null; M.opo = new Map(); M.jogoNPC = null; M.pista = null; M.spots = null; M.globo = null; M.tv = null; M.bolas = []; M.caderno = null;
    }

    // ---------------------------------------------------------------- interação lá dentro
    function alvos(v) {
      const s = S(), D = M.D; if (!D || s.modo !== 'livre' || M.servindo) return;
      const pronto = aberto() && M.jairo;
      v.push({ x: D.pedir.x, z: D.pedir.z, r: 1.7, txt: pronto ? Tx('Balcão do Jairo') : hx() < H_ABRE ? Tx('O bar abre às 16h.') : Tx('O bar já fechou.'), fn: pronto ? () => menuBalcao(false) : async () => {}, y: 2.3, pri: !!pronto });
      if (aberto()) v.push({ x: D.sinuca.x, z: D.sinuca.z, r: 2.3, txt: Tx('Jogar sinuca'), fn: menuSinuca, y: 1.8 });
      if (M.capuz && M.capuz.sentado) v.push({ x: M.capuz.x + 0.6, z: M.capuz.z - 0.4, r: 1.6, txt: Tx('Falar com o homem de capuz'), fn: falarCapuz, y: 2.0, pri: true });
      if (M.val && !M.val.chegando && !M.val.saindo) v.push({ x: M.val.x, z: M.val.z, r: 1.4, txt: Tx('Falar com o seu Valdemar'), fn: falarVal, y: 2.4 });
      if (aberto()) { const P = D.pista; v.push({ x: (P.x0 + P.x1) / 2, z: (P.z0 + P.z1) / 2, r: 2.6, txt: Tx('Dançar'), fn: dancarJog, y: 1.4 }); }
    }
    function alvosSentado() {
      const s = S(), J = s.jog;
      if (M.servindo) return [{ x: J.x, z: J.z, r: 9, txt: M.servindo === 'come' ? Tx('Comendo...') : M.servindo === 'danca' ? Tx('Dançando...') : Tx('Bebendo...'), fn: async () => {} }];
      if (J.sentado && s.sentadoEm && M.banq.includes(s.sentadoEm)) return [{ x: J.x, z: J.z, r: 9, txt: Tx('No balcão do Jairo'), fn: () => menuBalcao(true) }];
      return null;
    }
    async function menuBalcao(sentado) {
      if (!M.jairo || !aberto()) { if (sentado) api.levantar(); return; }
      const ops = [Tx('Pedir algo'), Tx('Conversar com o Jairo'), sentado ? Tx('Levantar') : Tx('Nada')];
      const i = await Escolha.mostrar(Tx('No balcão do Jairo'), ops, { centro: true });
      if (i === 0) await escolherProduto(); else if (i === 1) await falarJairo(); else if (sentado) api.levantar();
    }
    // o cardápio (os 15 produtos com a pixel art, o preço e a etiqueta), como o do restaurante
    function cardapioUI(fakes, adulto) {
      return new Promise((res) => {
        const el = document.createElement('div'); el.id = 'barCardapio';
        el.style.cssText = 'position:fixed;inset:0;z-index:22;display:grid;place-items:center;background:rgba(8,4,2,.66);padding:10px;box-sizing:border-box;';
        const card = document.createElement('div');
        card.style.cssText = 'width:min(700px,100%);max-height:94%;overflow:auto;background:#2a1a12;border:4px solid #c8952a;color:#f4ead8;padding:10px 12px;box-sizing:border-box;display:flex;flex-direction:column;gap:8px;font-family:var(--font-body);';
        const h = document.createElement('div'); h.style.cssText = 'font:700 14px/1.2 var(--font-display);letter-spacing:.08em;text-transform:uppercase;color:#ff7ac0;text-shadow:0 0 6px #ff3aa0;'; h.textContent = Tfx('Bar do Jairo ({0} fakes)', fakes); card.appendChild(h);
        const fim = (id) => { el.remove(); res(id); };
        for (const [tit, tipo] of [['Bebidas alcoólicas', 'alcool'], ['Sem álcool', 'bebida'], ['Petiscos', 'petisco']]) {
          const t = document.createElement('div'); t.style.cssText = 'font:700 11px/1 var(--font-display);letter-spacing:.1em;color:#f2c230;text-transform:uppercase;margin-top:2px;'; t.textContent = Tx(tit) + (tipo === 'alcool' ? '  · +18' : ''); card.appendChild(t);
          const grade = document.createElement('div'); grade.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(108px,1fr));gap:7px;';
          PRODUTOS.filter((p) => p.tipo === tipo).forEach((p) => {
            const proib = p.tipo === 'alcool' && !adulto, pode = fakes >= p.preco && !proib;
            const b = document.createElement('button'); b.type = 'button'; b.dataset.id = p.id;
            b.style.cssText = 'position:relative;display:flex;flex-direction:column;gap:3px;align-items:center;padding:7px 4px;background:#3a2418;border:3px solid ' + (p.tipo === 'alcool' ? '#c8952a' : p.tipo === 'bebida' ? '#3fb7b0' : '#d8742a') + ';color:#f4ead8;cursor:pointer;font:700 10.5px/1.2 var(--font-display);text-align:center;opacity:' + (pode ? 1 : 0.5) + ';';
            b.appendChild(icone(canvasProduto(p.id), 64));
            const n = document.createElement('span'); n.textContent = Tx(p.nome);
            const etq = document.createElement('span'); etq.style.cssText = 'font:600 9.5px/1 var(--font-body);padding:2px 5px;background:' + (proib ? '#a3162a' : p.tipo === 'alcool' ? '#8a5a1a' : p.tipo === 'bebida' ? '#1f6a66' : '#8a3a1a') + ';';
            etq.textContent = proib ? Tx('Proibido para menores') : p.tipo === 'alcool' ? Tx('Álcool') + ' +18' : p.tipo === 'bebida' ? Tx('Bebida') : Tx('Petisco');
            const pr = document.createElement('span'); pr.style.color = '#f2c230'; pr.textContent = p.preco + ' ' + Tx('fakes');
            b.append(n, etq, pr);
            if (proib) { const x = document.createElement('span'); x.textContent = '18'; x.style.cssText = 'position:absolute;top:4px;right:4px;width:22px;height:22px;border-radius:50%;border:2px solid #d8302a;color:#d8302a;font:700 10px/18px var(--font-display);background:#fff4e8;'; b.appendChild(x); }
            b.onclick = () => fim(p.id); grade.appendChild(b);
          });
          card.appendChild(grade);
        }
        const nada = document.createElement('button'); nada.type = 'button'; nada.className = 'pxBtn'; nada.textContent = fem() ? Tx('Nada, obrigada') : Tx('Nada, obrigado'); nada.style.cssText = 'align-self:center;--p:var(--p2,2px);height:38px;padding:0 14px;font-size:12px;'; nada.onclick = () => fim(null);
        card.appendChild(nada); el.appendChild(card); (document.getElementById('raizJogo') || document.body).appendChild(el);
      });
    }
    async function escolherProduto() {
      const s = S(), d = s.dados; if (M.servindo) return;
      const adulto = api.adulto(), id = await cardapioUI(d.fakes, adulto); if (!id) return;
      const p = PROD[id];
      if (p.tipo === 'alcool' && !adulto) { await api.fala('jairo', fem() ? Tx('Bebida alcoólica só pra maior de idade, campeã. Posso te servir um refri, um suco ou um petisco.') : Tx('Bebida alcoólica só pra maior de idade, campeão. Posso te servir um refri, um suco ou um petisco.')); Dialogo.esconder(); return; }
      if (d.fakes < p.preco) { await api.fala('jairo', Tx('Tá faltando grana aí, hein?')); Dialogo.esconder(); return; }
      await servir(p);
    }
    // ================================================================ A CENA DO PEDIDO: o Jairo vem, prepara, entrega, cobra; o jogador bebe/come
    async function servir(p) {
      const s = S(), J = s.jog, d = s.dados, D = M.D, Jr = M.jairo; if (!D || !Jr) return;
      M.servindo = p.tipo === 'petisco' ? 'come' : 'bebe'; s.modo = 'cena'; api.UI().ctl.hidden = true; api.aviso(''); J.andando = false; J.correndo = false;
      const cheio = (d.fome || 0) <= 0;
      let prato = null;
      try {
        const naBanqueta = J.sentado && s.sentadoEm && M.banq.includes(s.sentadoEm);
        if (!naBanqueta) { if (J.sentado) api.levantar(); await andarJog(D.pedir.x, D.pedir.z, 1.6); J.yawAlvo = Math.PI / 2; await api.esperar(250); }
        const xs = clampN(J.x, -10.0, -3.0);
        Jr.servindoJog = true; pose(Jr, null); Jr.poseJ = null;
        if (p.torneira) { Jr.rotaP = [{ x: -7.7, z: D.barman.z }]; while (Jr.rotaP && Jr.rotaP.length) { andarP(Jr, 1 / 60); await api.esperar(16); } Jr.yawAlvo = -Math.PI / 2; Jr.poseJ = 'tira'; Jr.poseFn = poseJairo; await api.fala('jairo', Tx('É pra já!')); await api.esperar(900); }
        else { await api.fala('jairo', Tx('É pra já!')); Jr.yawAlvo = Math.PI / 2; await api.esperar(700); Jr.yawAlvo = -Math.PI / 2; }
        Jr.poseJ = null; Jr.poseFn = null;
        Jr.rotaP = [{ x: xs, z: D.barman.z }]; let tt = 0; while (Jr.rotaP && Jr.rotaP.length && tt < 5) { andarP(Jr, 1 / 60); tt += 1 / 60; await api.esperar(16); }
        Jr.yawAlvo = -Math.PI / 2; Jr.poseJ = 'serve'; Jr.poseFn = poseJairo;
        // entrega no balcão: o copo (sprite) ou a porção (o prato no balcão, visto de cima)
        if (p.tipo === 'petisco') { prato = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.42), new THREE.MeshLambertMaterial({ map: texDe(canvasProduto(p.id), 'p:' + p.id), transparent: true, alphaTest: 0.1 })); prato.rotation.x = -Math.PI / 2; prato.position.set(xs, 1.125, -5.3); M.R.grupo.add(prato); }
        else copoNoBalcao(J, p.id, xs, 1.12, -5.25);
        await api.esperar(400); Jr.poseJ = null; Jr.poseFn = null;
        await api.fala('jairo', Tfx('Taí: {0}. São {1} fakes.', Tx(p.nome), p.preco));
        d.fakes = Math.max(0, d.fakes - p.preco); api.somCaixa(); api.somDinheiro(); api.mostrarDinheiro(false); api.gastoNaTela(p.preco);
        Dialogo.esconder(); Jr.servindoJog = false;
        // consumindo
        if (p.tipo === 'petisco') {
          pose(J, 'come');
          for (let k = 0; k < 4; k++) { await api.esperar(1500); if (prato) prato.material.opacity = 1; if (prato && k >= 1) { const e = k / 4; prato.scale.setScalar(1); prato.material.map = texDe(petiscoComido(p.id, e), 'pc:' + p.id + ':' + k); prato.material.needsUpdate = true; } }
          pose(J, null);
        } else {
          tirarCopoApoio(J); darBebida(J, p.id); J.tg = 99; pose(J, 'segura'); await api.esperar(500);
          for (let k = 0; k < 3; k++) { J.tg = 0; pose(J, 'gole'); await api.esperar(1500); pose(J, 'segura'); J.tg = 99; await api.esperar(700); }
          pose(J, null); tirarDaMao(J);
        }
        await efeitos(p, cheio);
        const db = dadosB(); db.prod = db.prod || {}; db.prod[p.id] = (db.prod[p.id] | 0) + 1; api.gravar(d.ponto || 'chegada');
      } catch (e) { console.error('[Bar] servir:', e); }
      finally {
        M.servindo = false; if (Jr) { Jr.servindoJog = false; Jr.poseJ = null; Jr.poseFn = null; }
        if (prato) { const pr = prato; setTimeout(() => { if (pr.parent) pr.parent.remove(pr); pr.material.dispose(); pr.geometry.dispose(); }, 5000); }
        tirarDaMao(J); tirarCopoApoio(J); if (J.poseFn === poseBar) J.poseFn = null; J.poseB = null;
        try { Dialogo.esconder(); } catch (e) { /* nada */ }
        const ss = S(); if (ss && ss.ativo && ss.modo === 'cena') api.liberar();
      }
    }
    // a porção sendo comida: some uma parte dos pedaços (os pixels por cima do prato), com migalhas
    function petiscoComido(id, e) {
      const chave = 'pc:' + id + ':' + e; if (CACHE.has(chave)) return CACHE.get(chave);
      const P = tela(32, 32); DESENHO[id](P);                            // a porção inteira e só a louça (o que difere é comida)
      const Q = tela(32, 32); if (id === 'amendoim') Q.elip(16, 17, 13, 11, (x, y, u, v) => { const d = u * u + v * v; return d > 0.78 ? (u + v < 0 ? '#a8743a' : '#6a4422') : d > 0.68 ? '#4a2e16' : '#5a3a20'; }); else prato(Q, 16, 16, 14.5, id === 'batata' ? '#f4f0e0' : undefined);
      for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) {
        const i = y * 32 + x; if (P.buf[i] === Q.buf[i]) continue;
        if (hash(Math.floor(x / 4), Math.floor(y / 4), 77) < e * 1.05 && hash(x, y, 78) < 0.93) P.buf[i] = Q.buf[i];   // comido (sobram migalhas)
      }
      P.contorno('rgba(26,14,6,0.92)'); P.sombra('rgba(0,0,0,0.22)');
      const cv = P.canvas(); CACHE.set(chave, cv); return cv;
    }
    // os efeitos (como no restaurante): Saudável, a fome, o porre, a ressaca, passar mal
    async function efeitos(p, cheio) {
      const s = S(), d = s.dados, db = dadosB();
      try {
        if (p.tipo === 'alcool') {
          Espectros.mover('saudavel', p.saude, 'bebeu ' + p.nome);
          const agora = tAbs(), teor0 = db.teor ? Math.max(0, db.teor.v - (agora - db.teor.t) * 0.7) : 0, teor = teor0 + p.dose;
          db.teor = { v: teor, t: agora };
          if (!db.doses || db.doses.dia !== d.dia) db.doses = { dia: d.dia, n: 0 }; db.doses.n += 1;
          api.gravar(d.ponto || 'chegada');
          if (db.doses.n >= 3 && !Espectros.condicao('ressaca')) { Espectros.condicao('ressaca', true); await api.fala('jog', Tx('Acho que já bebi demais por hoje... amanhã vou sentir.')); }
          else if (teor >= 2.5) await api.fala('jog', Tx('Opa... a cabeça já tá girando.'));
          else await api.fala('jog', Tx('Ahh... desceu redondo.'));
          if (teor >= 5.5) { s.vomitoT = 6; Espectros.mover('tranquilo', -2, 'porre no bar'); await api.fala('jog', Tx('Acho que eu exagerei...')); }
        } else if (p.tipo === 'bebida') {
          if (p.saude) Espectros.mover('saudavel', p.saude, 'bebeu ' + p.nome);
          await api.fala('jog', Tx('Refrescante!'));
        } else {
          d.fome = Math.max(0, (d.fome || 0) - p.enche); d.comidas = (d.comidas || 0) + 1; d.comeuDia = d.dia;
          d.ruinsNoMes = d.ruinsNoMes || { mes: d.mes || 1, n: 0 }; d.ruinsNoMes.n++;
          Espectros.mover('saudavel', p.saude, 'comeu ' + p.nome);
          if (cheio) { Espectros.mover('saudavel', -4, 'comeu sem fome'); await api.fala('jog', Tx('Acho que eu exagerei...')); s.vomitoT = 20; }
          else if (p.id === 'amendoim') await api.fala('jog', Tx('Belisquei e matei a fome.'));
          else await api.fala('jog', Tx('Hmm, crocante! Mas é fritura pura...'));
        }
        if (s.missao && p.tipo === 'petisco') { s.missao = ''; try { api.recolherMissao(); } catch (e) { /* nada */ } }
        if (typeof Sono !== 'undefined' && Sono.deveAvisarSaude && Sono.deveAvisarSaude()) await api.fala('jog', Tx('Eu estou com hábitos não saudáveis, isso com certeza vai me prejudicar nos jogos....'));
      } catch (e) { console.warn('[Bar] efeitos:', e); }
      api.gravar(d.ponto || 'chegada'); Dialogo.esconder();
    }
    const teorAgora = () => { const db = dadosB(); return db.teor ? Math.max(0, db.teor.v - (tAbs() - db.teor.t) * 0.7) : 0; };
    // o porre: o personagem cambaleia e a tela escurece nas bordas
    function tickPorre() {
      const s = S(), J = s.jog; if (!J || !J.m) return;
      const k = clampN((teorAgora() - 1.5) / 3, 0, 1);
      if (!M.vinheta && k > 0) { const el = document.createElement('div'); el.id = 'barPorre'; el.style.cssText = 'position:fixed;inset:0;z-index:5;pointer-events:none;background:radial-gradient(ellipse at center,rgba(60,20,70,0.12) 30%,rgba(30,0,40,0.92) 100%);opacity:0;transition:opacity .6s;'; (document.getElementById('raizJogo') || document.body).appendChild(el); M.vinheta = el; }
      if (M.vinheta) { const o = k * (0.55 + Math.sin((s.t || 0) * 1.3) * 0.12); M.vinheta.style.opacity = o.toFixed(3); if (k <= 0) { M.vinheta.remove(); M.vinheta = null; } }
      const cv = document.getElementById('game'); M.tFiltro = (M.tFiltro || 0) + 1;   // a visão embaralhada (desfoque e a cor puxando para o roxo), atualizada a cada 6 quadros
      if (cv && k > 0 && M.tFiltro % 6 === 0) cv.style.filter = 'blur(' + (k * 0.9).toFixed(2) + 'px) saturate(' + (1 + k * 0.4).toFixed(2) + ') hue-rotate(' + (Math.sin((s.t || 0) * 0.9) * 14 * k).toFixed(1) + 'deg)';
      else if (cv && k <= 0 && cv.style.filter) cv.style.filter = '';
      if (k > 0 && !J.sentado && s.modo !== 'cena') { J.m.raiz.rotation.z = Math.sin((s.t || 0) * 1.7) * 0.07 * k; J.m.raiz.rotation.x = Math.sin((s.t || 0) * 1.1) * 0.04 * k; M.cambaleia = true; }
      else if (M.cambaleia) { J.m.raiz.rotation.z = 0; J.m.raiz.rotation.x = 0; M.cambaleia = false; }
    }

    // ---- conversas
    const PAPOS_JAIRO = [
      { p: 'Movimento bom hoje!', a: ['Movimento bom hoje!', 'Sinal de que a cerveja tá gelada.'], vazio: ['Hoje tá parado, hein?', 'Meio de semana é assim. Espera o sábado pra ver.'], c: ['Esse bar é meio caído, né?', 'Caído é o seu time, que perdeu domingo.'] },
      { p: 'O seu Valdemar vem todo dia, sabia? Fecha a lanchonete e vem direto pra cá.', a: ['Sério? Todo dia?', 'Todo santo dia. E na sinuca ninguém ganha dele.'], b: ['Ninguém ganha? Duvido.', 'Vai lá desafiar ele depois das onze e meia. Depois me conta.'], c: ['Ele bebe demais.', 'Ele trabalha doze horas por dia. Deixa o homem.'] },
    ];
    async function falarJairo() {
      const s = S(), Jr = M.jairo, db = dadosB(); if (!Jr) return;
      try {
        if (!db.conheceu) {
          await api.fala('jairo', fem() ? Tx('Bem-vinda ao Bar do Jairo! Cerveja gelada, petisco quente e a sinuca lá no fundo.') : Tx('Bem-vindo ao Bar do Jairo! Cerveja gelada, petisco quente e a sinuca lá no fundo.'));
          await api.fala('jairo', Tx('Só não vendo bebida pra menor de idade, tá? Regra da casa.'));
          await api.fala('jairo', Tx('No fim de semana isso aqui lota. Durante a semana é mais sossegado.'));
          db.conheceu = true; api.gravar(s.dados.ponto || 'chegada'); return;
        }
        const Q = PAPOS_JAIRO[(db.papoJ | 0) % PAPOS_JAIRO.length]; db.papoJ = (db.papoJ | 0) + 1;
        if (Q.vazio) {                                                  // o papo do movimento: depende de como está a casa
          const cheio = M.gente.length >= 8, R0 = cheio ? Q.a : Q.vazio;
          const r = await Escolha.mostrar(Tx(R0[0]), [Tx(R0[0]), Tx(Q.c[0])]);
          if (r === 1) { await api.falaGrossa('jairo', 'jairo', Tx(Q.c[0]), Tx(Q.c[1])); return; }
          await api.fala('jog', Tx(R0[0])); await api.fala('jairo', Tx(R0[1])); return;
        }
        await api.fala('jairo', Tx(Q.p));
        const r = await Escolha.mostrar(Tx(Q.p), [Tx(Q.a[0]), Tx(Q.b[0]), Tx(Q.c[0])]);
        if (r === 2) { await api.falaGrossa('jairo', 'jairo', Tx(Q.c[0]), Tx(Q.c[1])); return; }
        const Rr = r === 1 ? Q.b : Q.a; await api.fala('jog', Tx(Rr[0])); await api.fala('jairo', Tx(Rr[1]));
      } finally { Dialogo.esconder(); }
    }
    async function falarVal() {
      const V = M.val; if (!V) return; const f = V.fv, nome = nomeJ();
      const yv = V.yawAlvo; if (!V.sentado && f !== 'sinuca') V.yawAlvo = Math.atan2(-(S().jog.z - V.z), S().jog.x - V.x);
      try {
        if (f === 'bebe') await api.fala('valb', Tfx('Ô, {0}! Depois de doze horas na chapa, eu mereço uma gelada, né?', nome));
        else if (f === 'danca') await api.fala('valb', Tfx('Isso aqui é que é vida! Bora dançar, {0}!', nome));
        else if (f === 'fuma') await api.fala('valb', Tx('Só um cigarrinho e eu vou pra casa. Não conta pra ninguém que eu fumo, hein?'));
        else if (f === 'sinuca') {
          await api.fala('valb', Tx('Tá querendo apanhar na sinuca? Tô com o taco quente hoje!'));
          const r = await Escolha.mostrar(Tx('Tá querendo apanhar na sinuca? Tô com o taco quente hoje!'), [Tx('Bora jogar uma!'), Tx('Fica pra próxima.')]);
          Dialogo.esconder(); if (r === 0) { await desafiar(OPO.valdemar); return; }
        }
      } finally { Dialogo.esconder(); if (M.val && !M.val.sentado && f === 'danca') M.val.yawAlvo = yv; }
    }

    // ================================================================ A SINUCA DO JOGADOR
    function oponentesPresentes() {
      const L = [];
      if (M.val && M.val.emSinuca && !M.val.chegando) L.push(OPO.valdemar);
      for (const [id, A] of M.opo) if (!A.saindo && !(A.rotaP && A.rotaP.length && !M.jogoNPC)) L.push(OPO[id]);
      return L;
    }
    async function menuSinuca() {
      const L = oponentesPresentes();
      if (!L.length) { await api.fala('jog', Tx('Não tem ninguém pra jogar agora.')); Dialogo.esconder(); return; }
      const ops = L.map((o) => Tfx('{0} ({1})', Tx(o.nome), '★'.repeat(o.estrelas) + '☆'.repeat(5 - o.estrelas))).concat([Tx('Agora não')]);
      const i = await Escolha.mostrar(Tx('Jogar contra quem?'), ops);
      if (i >= 0 && i < L.length) await desafiar(L[i]);
    }
    const atorDoOponente = (o) => (o.val ? M.val : M.opo.get(o.id));
    async function desafiar(o) {
      const s = S(), d = s.dados, A = atorDoOponente(o); if (!A || M.jogando) return;
      const quem = o.val ? 'valb' : 'op_' + o.id;
      const r = await Escolha.mostrar(Tx('Vale quanto?'), [Tx('Valendo 50 fakes (ganhou, leva 100)'), Tx('Só por diversão'), Tx('Agora não')]);
      if (r === 2 || r < 0) return;
      const aposta = r === 0 ? 50 : 0;
      if (aposta && d.fakes < aposta) { await api.fala('jog', Tx('Você não tem 50 fakes pra apostar.')); Dialogo.esconder(); return; }
      let mod = null;
      try { mod = typeof Fases !== 'undefined' ? await Fases.carregar('sinuca') : null; } catch (e) { console.warn('[Bar] sinuca.js não veio:', e); }
      const jogar = mod && ((mod.dados && mod.dados.jogar) || (mod.criar && mod.criar().jogar)); if (!jogar) return;
      s.modo = 'cena'; api.UI().ctl.hidden = true; api.aviso(''); M.jogando = true; A.jogandoComJog = true;
      const J = s.jog;
      try {
        await api.fala(quem, Tx(o.desafioF && fem() ? o.desafioF : o.desafio)); Dialogo.esconder();
        // os dois vão para a mesa (o jogador na cabeceira oeste, o oponente do outro lado)
        if (M.jogoNPC) { for (const B of M.jogoNPC.js) if (B !== A) { B.rotaP = null; pose(B, 'taco'); } M.jogoNPC = null; }
        if (J.sentado) api.levantar();
        A.rotaP = caminho(A.x, A.z, MIRA[1][0], MIRA[1][1], true); pose(A, 'taco');
        const vaiA = (async () => { let t = 0; while (A.rotaP && A.rotaP.length && t < 8) { andarP(A, 1 / 60); t += 1 / 60; await api.esperar(16); } A.yawAlvo = Math.PI; })();
        await andarJog(MIRA[0][0], MIRA[0][1], 1.8); J.yawAlvo = 0; await vaiA;
        if (aposta) { d.fakes -= aposta; api.somDinheiro(); api.mostrarDinheiro(false); api.gastoNaTela(aposta); api.gravar(d.ponto || 'chegada'); }
        await api.esperar(300);
        s.pausado = true;
        const quips = JSON.parse(JSON.stringify(o.quips)); if (fem()) for (const k of Object.keys(quips)) quips[k] = quips[k].map((q) => (q === 'Quarenta anos de sinuca, meu filho.' ? 'Quarenta anos de sinuca, minha filha.' : q));
        const res = await jogar({ oponente: { nome: Tx(o.nome), estrelas: o.estrelas, erro: o.erro, erroF: o.erroF, sim: o.sim, posicao: o.posicao, burro: o.burro, quips }, aposta, nomeJog: nomeJ(), audio: typeof Som !== 'undefined' && !Som.mudo ? Som.audio : null, manter: () => { const ss = S(); if (ss) ss.pausado = true; } });
        s.pausado = false;
        d.hora += 0.4; if (d.hora >= 24) d.hora -= 24;               // a partida levou uns 25 minutos
        const db = dadosB(); db.sinuca = db.sinuca || {}; const st = db.sinuca[o.id] = db.sinuca[o.id] || { v: 0, d: 0 };
        if (res.venceu) {
          st.v++;
          if (aposta) { d.fakes += aposta * 2; api.somDinheiro(); api.mostrarDinheiro(false); api.ganhoNaTela(aposta * 2); }
          if (o.val) { await api.fala('jog', Tx('Ganhei do seu Valdemar!')); await api.fala('valb', Tx('Ô loco... faz vinte anos que ninguém ganha de mim aqui. Respeito!')); if (!db.venceuValdemar) { db.venceuValdemar = true; Espectros.mover('confiante', 3, 'ganhou do Valdemar na sinuca'); } }
          else await api.fala(quem, Tx('Boa! Joga bem, hein!'));
        } else { st.d++; await api.fala(quem, Tx(o.val ? (fem() ? 'Quarenta anos de sinuca, minha filha.' : 'Quarenta anos de sinuca, meu filho.') : 'Hehe, fica pra próxima!')); }
        api.gravar(d.ponto || 'chegada');
      } catch (e) { console.error('[Bar] sinuca:', e); s.pausado = false; }
      finally {
        M.jogando = false; if (A) { A.jogandoComJog = false; pose(A, 'taco'); }
        try { Dialogo.esconder(); } catch (e) { /* nada */ }
        const ss = S(); if (ss) { ss.pausado = false; if (ss.ativo && ss.modo === 'cena') api.liberar(); }
      }
    }

    // ================================================================ DANÇAR (o jogador na pista)
    async function dancarJog() {
      const s = S(), J = s.jog; if (M.servindo) return;
      M.servindo = 'danca'; s.modo = 'cena'; api.UI().ctl.hidden = true; api.aviso('');
      try {
        if (J.sentado) api.levantar(); const p = pontoNaPista(); await andarJog(p.x, p.z, 1.7);
        J.estilo = Math.floor(Math.random() * 4); J.off = 0; pose(J, 'danca');
        for (let k = 0; k < 4; k++) { await api.esperar(2200); J.estilo = (J.estilo + 1 + Math.floor(Math.random() * 3)) % 4; }
      } catch (e) { console.error('[Bar] dançar:', e); }
      finally { pose(J, null); M.servindo = false; const ss = S(); if (ss && ss.ativo && ss.modo === 'cena') api.liberar(); }
    }

    // ================================================================ O JOGO DO BICHO (o homem de capuz)
    async function falarCapuz() {
      const s = S(), d = s.dados, db = dadosB(), A = M.capuz; if (!A) return;
      A.falando = true;
      try {
        if (!db.capuz) {
          for (const k of ['Psiu... chega mais. Ninguém precisa saber, tá?', 'Eu sou de fora, só venho no fim de semana. Aqui a gente faz uma fezinha no bicho.', 'São 20 bichos. Você escolhe um e quanto quer apostar.', 'Amanhã eu te mando um e-mail dizendo qual bicho saiu. Todos têm a mesma chance.', 'Acertou, leva três vezes o que apostou. Errou, perdeu tudo.']) await api.fala('capuz', Tx(k));
          db.capuz = true; api.gravar(d.ponto || 'chegada');
        } else await api.fala('capuz', Tx('Psiu... chega mais. Ninguém precisa saber, tá?'));
        if (db.bicho && db.bicho.dia === d.dia) { await api.fala('capuz', Tfx('Já anotei a sua de hoje: {1}, {0} fakes. Amanhã chega o e-mail.', db.bicho.valor, Tx(BICHOS[db.bicho.animal]))); return; }
        const r = await Escolha.mostrar(Tx('Homem de capuz'), [Tx('Fazer uma fezinha'), Tx('Como funciona?'), Tx('Deixa pra lá')]);
        if (r === 1) { for (const k of ['São 20 bichos. Você escolhe um e quanto quer apostar.', 'Amanhã eu te mando um e-mail dizendo qual bicho saiu. Todos têm a mesma chance.', 'Acertou, leva três vezes o que apostou. Errou, perdeu tudo.']) await api.fala('capuz', Tx(k)); return; }
        if (r !== 0) return;
        if (d.fakes < 10) { await api.fala('capuz', Tx('Sem grana, sem bicho.')); return; }
        Dialogo.esconder();
        const esc = await bichoUI(d.fakes); if (!esc) return;
        d.fakes -= esc.valor; api.somDinheiro(); api.mostrarDinheiro(false); api.gastoNaTela(esc.valor);
        db.bicho = { dia: d.dia, animal: esc.animal, valor: esc.valor }; db.bichoN = (db.bichoN | 0) + 1;
        try { Espectros.mover('tranquilo', -3, 'jogo do bicho'); } catch (e) { /* nada */ }
        api.gravar(d.ponto || 'chegada');
        await api.fala('capuz', Tfx('Tá anotado: {1}, {0} fakes.', esc.valor, Tx(BICHOS[esc.animal])));
        await api.fala('jog', Tfx('Tomara que dê {0}...', Tx(BICHOS[esc.animal])));
      } finally { A.falando = false; Dialogo.esconder(); }
    }
    function bichoUI(fakes) {
      return new Promise((res) => {
        const el = document.createElement('div'); el.id = 'barBicho';
        el.style.cssText = 'position:fixed;inset:0;z-index:22;display:grid;place-items:center;background:rgba(6,4,10,.72);padding:10px;box-sizing:border-box;';
        const card = document.createElement('div');
        card.style.cssText = 'width:min(720px,100%);max-height:96%;overflow:auto;background:#1c1620;border:4px solid #7a5a9a;color:#efe6f4;padding:10px 12px;box-sizing:border-box;display:flex;flex-direction:column;gap:8px;font-family:var(--font-body);';
        const h = document.createElement('div'); h.style.cssText = 'font:700 15px/1.2 var(--font-display);letter-spacing:.1em;color:#f2c230;text-align:center;'; h.textContent = Tx('JOGO DO BICHO');
        const info = document.createElement('div'); info.style.cssText = 'font:600 11.5px/1.35 var(--font-body);color:#c8b8d8;text-align:center;'; info.textContent = Tx('Todos os 20 bichos têm a mesma chance (1 em 20). Acertou: 3 vezes o valor. Errou: perde tudo.');
        const sub = document.createElement('div'); sub.style.cssText = 'font:700 11px/1 var(--font-display);letter-spacing:.08em;color:#b89ad8;text-transform:uppercase;'; sub.textContent = Tx('Escolha um bicho');
        const grade = document.createElement('div'); grade.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(84px,1fr));gap:5px;';
        let animal = -1, valor = 0; const bts = [];
        BICHOS.forEach((nome, i) => {
          const b = document.createElement('button'); b.type = 'button'; b.dataset.i = String(i);
          b.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:2px;padding:5px 3px;background:#2a2230;border:3px solid #4a3a5a;color:#efe6f4;cursor:pointer;font:700 10.5px/1.15 var(--font-display);';
          const num = document.createElement('span'); num.style.cssText = 'font:700 9px/1 var(--font-display);color:#9a8aaa;'; num.textContent = (i + 1 < 10 ? '0' : '') + (i + 1);
          const n = document.createElement('span'); n.textContent = Tx(nome);
          b.append(num, icone(canvasBicho(i), 50), n); b.onclick = () => { animal = i; for (const q of bts) q.style.borderColor = '#4a3a5a'; b.style.borderColor = '#f2c230'; atualizar(); };
          bts.push(b); grade.appendChild(b);
        });
        const sub2 = document.createElement('div'); sub2.style.cssText = sub.style.cssText; sub2.textContent = Tx('Quanto?');
        const linha = document.createElement('div'); linha.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;justify-content:center;';
        const vbts = [];
        for (const v of [10, 20, 50, 100, 200, 500]) { const b = document.createElement('button'); b.type = 'button'; b.className = 'pxBtn'; b.textContent = v + ' ' + Tx('fakes'); b.disabled = v > fakes; b.style.cssText = '--p:var(--p2,2px);height:36px;padding:0 10px;font-size:12px;opacity:' + (v > fakes ? 0.4 : 1) + ';'; b.onclick = () => { if (v > fakes) return; valor = v; for (const q of vbts) q.style.outline = ''; b.style.outline = '3px solid #f2c230'; atualizar(); }; vbts.push(b); linha.appendChild(b); }
        const fimL = document.createElement('div'); fimL.style.cssText = 'display:flex;gap:10px;justify-content:center;margin-top:4px;';
        const ok = document.createElement('button'); ok.type = 'button'; ok.className = 'pxBtn'; ok.textContent = Tx('Apostar'); ok.style.cssText = '--p:var(--p2,2px);height:40px;padding:0 18px;font-size:13px;';
        const no = document.createElement('button'); no.type = 'button'; no.className = 'pxBtn'; no.textContent = Tx('Cancelar'); no.style.cssText = '--p:var(--p2,2px);height:40px;padding:0 14px;font-size:12px;';
        const atualizar = () => { ok.disabled = animal < 0 || !valor; ok.style.opacity = ok.disabled ? 0.45 : 1; };
        ok.onclick = () => { if (animal < 0 || !valor) return; el.remove(); res({ animal, valor }); }; no.onclick = () => { el.remove(); res(null); };
        fimL.append(ok, no); atualizar();
        card.append(h, info, sub, grade, sub2, linha, fimL); el.appendChild(card); (document.getElementById('raizJogo') || document.body).appendChild(el);
      });
    }
    // o E-MAIL do resultado (no dia seguinte, a partir das 7h30)
    async function mostrarEmail() {
      const s = S(), d = s.dados, db = dadosB(), b = db.bicho; if (!b || b.avisado) return;
      b.avisado = true; const sai = Math.floor(Math.random() * 20), ganhou = sai === b.animal, premio = b.valor * 3;
      b.saiu = sai; b.ganhou = ganhou; if (ganhou) { d.fakes += premio; db.bichoGanhos = (db.bichoGanhos | 0) + premio; }
      api.gravar(d.ponto || 'chegada');
      s.modo = 'cena'; api.UI().ctl.hidden = true; api.aviso('');
      try {
        await new Promise((ok) => {
          const el = document.createElement('div'); el.id = 'barEmail';
          el.style.cssText = 'position:fixed;inset:0;z-index:24;display:grid;place-items:center;background:rgba(4,8,14,.55);padding:12px;box-sizing:border-box;';
          const jan = document.createElement('div'); jan.style.cssText = 'width:min(460px,100%);background:#f4f6f8;border:4px solid #1c2a36;color:#1c2a36;box-shadow:0 8px 0 #0008;display:flex;flex-direction:column;font-family:var(--font-body);';
          const barra = document.createElement('div'); barra.style.cssText = 'background:#2f6aa8;color:#fff;font:700 12px/1 var(--font-display);letter-spacing:.06em;padding:8px 10px;display:flex;justify-content:space-between;';
          barra.innerHTML = '<span>✉ ' + Tx('Caixa de entrada') + '</span><span>1</span>';
          const cab = document.createElement('div'); cab.style.cssText = 'padding:8px 12px;border-bottom:2px solid #c8d4de;font:600 12px/1.45 var(--font-body);color:#3a4a58;';
          cab.innerHTML = ''; const de = document.createElement('div'); de.textContent = Tfx('De: {0}', 'o.capuz@bicho.mail'); const as = document.createElement('div'); as.style.cssText = 'font-weight:700;color:#1c2a36;'; as.textContent = Tfx('Assunto: {0}', Tx('Resultado do bicho')); cab.append(de, as);
          const corpo = document.createElement('div'); corpo.style.cssText = 'padding:10px 12px;display:flex;gap:12px;align-items:flex-start;';
          const fig = document.createElement('div'); fig.style.cssText = 'flex:none;display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px;background:#1c1620;border:3px solid ' + (ganhou ? '#f2c230' : '#7a5a9a') + ';';
          const num = document.createElement('span'); num.style.cssText = 'font:700 10px/1 var(--font-display);color:#f2c230;'; num.textContent = (sai + 1 < 10 ? '0' : '') + (sai + 1);
          const nm = document.createElement('span'); nm.style.cssText = 'font:700 10px/1 var(--font-display);color:#efe6f4;'; nm.textContent = Tx(BICHOS[sai]);
          fig.append(num, icone(canvasBicho(sai), 80), nm);
          const txt = document.createElement('div'); txt.style.cssText = 'font:600 13px/1.45 var(--font-body);display:flex;flex-direction:column;gap:6px;';
          const lin = [Tfx('E aí, {0}.', nomeJ()), Tfx('No sorteio de ontem deu {0} (grupo {1}).', Tx(BICHOS[sai]), (sai + 1 < 10 ? '0' : '') + (sai + 1)), Tx('Lembrando: os 20 bichos tinham a mesma chance, 1 em 20.'), Tfx('A sua aposta: {1}, {0} fakes.', b.valor, Tx(BICHOS[b.animal]))];
          for (const l of lin) { const p = document.createElement('div'); p.textContent = l; txt.appendChild(p); }
          const res = document.createElement('div'); res.style.cssText = 'font:700 13px/1.4 var(--font-body);color:' + (ganhou ? '#1f7a4d' : '#a3162a') + ';'; res.textContent = ganhou ? Tfx('ACERTOU! Já caiu na sua conta: {0} fakes.', premio) : Tfx('Não foi dessa vez. Perdeu os {0} fakes.', b.valor); txt.appendChild(res);
          const ass = document.createElement('div'); ass.style.cssText = 'color:#5a6a78;'; ass.textContent = Tx('Fim de semana tem mais.') + ' ' + Tx('— O homem de capuz'); txt.appendChild(ass);
          corpo.append(fig, txt);
          const pe = document.createElement('div'); pe.style.cssText = 'padding:8px 12px 12px;display:flex;justify-content:flex-end;';
          const fe = document.createElement('button'); fe.type = 'button'; fe.className = 'pxBtn'; fe.textContent = Tx('Fechar'); fe.style.cssText = '--p:var(--p2,2px);height:38px;padding:0 16px;font-size:12px;';
          fe.onclick = () => { el.remove(); ok(); }; pe.appendChild(fe);
          jan.append(barra, cab, corpo, pe); el.appendChild(jan); (document.getElementById('raizJogo') || document.body).appendChild(el);
          const A = typeof Som !== 'undefined' && Som.audio && !Som.mudo ? Som.audio : null; if (A) try { const t0 = A.ctx.currentTime + 0.01; for (const [k, f] of [[0, 1568], [0.12, 2093]]) { const o = A.ctx.createOscillator(), g = A.ctx.createGain(); o.frequency.value = f; g.gain.setValueAtTime(0.06, t0 + k); g.gain.exponentialRampToValueAtTime(0.0001, t0 + k + 0.22); o.connect(g); g.connect(A.mestre); o.start(t0 + k); o.stop(t0 + k + 0.25); } } catch (e) { /* sem som */ }
        });
        if (ganhou) { api.somDinheiro(); api.mostrarDinheiro(false); api.ganhoNaTela(premio); }
      } finally { const ss = S(); if (ss && ss.ativo && ss.modo === 'cena') api.liberar(); }
    }
    function tickEmail() {
      const s = S(), d = s.dados, b = d.bar && d.bar.bicho; if (!b || b.avisado) return;
      if ((d.dia || 1) > b.dia && d.hora >= 7.5 && d.hora < 23.9 && s.modo === 'livre' && !s.pausado && !M.servindo) mostrarEmail().catch((e) => console.error('[Bar] e-mail:', e));
    }

    // ================================================================ NA RUA: o homem de capuz chegando (e indo embora) de fora da cidade
    function tickRua() {
      const s = S(), d = s.dados; if (s.dentro || !s.jog || !fimDeSemana()) return;
      const h = hx(), dia = d.dia || 1;
      for (const E of [{ k: 'capC', h: CAPUZ_H[0] - 0.35, ida: true }, { k: 'capS', h: CAPUZ_H[1], ida: false }]) {
        if (M.rua[E.k] === dia || h < E.h || h > E.h + 0.6) continue;
        M.rua[E.k] = dia;
        if (Math.hypot(s.jog.x - PORTA_BAR.x, s.jog.z - PORTA_BAR.z) > 90 || (s.modo !== 'livre' && s.modo !== 'cena')) continue;
        try {
          const ap = Object.assign(api.gerarAparencia(9091, 'M'), { barba: 1 }), A = api.criarNPCFixo(ap, false, 0, ['#2a2a30', '#1c1c22', '#2a2a30', '#1c1c1f']); A.tipo = 'cena'; enfeitarCapuz(A.m, A.opt);
          const xLonge = -118, zc = 7.6, zp = 10.0, pts = E.ida ? [[PORTA_BAR.x - 0.8, zc], [PORTA_BAR.x, zp]] : [[PORTA_BAR.x, zc], [xLonge, zc]];
          if (E.ida) { A.x = xLonge; A.z = zc; } else { A.x = PORTA_BAR.x; A.z = zp; }
          A.yaw = A.yawAlvo = Math.atan2(-(pts[0][1] - A.z), pts[0][0] - A.x); M.atoresRua.push(A);
          api.andar(A, pts, 1.15).then(() => { M.atoresRua = M.atoresRua.filter((q) => q !== A); try { api.descartarPessoa(A); } catch (e) { /* já saiu */ } });
        } catch (e) { console.warn('[Bar] rua:', e); }
      }
    }

    // ---- a cada quadro (depois do tickJogador e do tickPessoas)
    function tick(dt) {
      const s = S(); if (!s) return;
      tickRua(); tickEmail(); tickPorre();
      if (!M.D || !s.dentro || s.dentro.nome !== 'bar') return;
      // a música, o ritmo, o piso e as luzes
      const querLot = M.gente.length >= LOTADO ? 'lotado' : M.gente.length <= LOTADO - 3 ? 'tema' : M.musica.modoAtual;
      if (aberto() && !M.musica.tocando && typeof Som !== 'undefined' && Som.audio && !Som.mudo) M.musica.tocar(querLot); else M.musica.modo(querLot);
      if (!aberto() && M.musica.tocando && !M.gente.length) M.musica.parar();
      M.bat = M.musica.batidas();
      if (M.pista && Math.floor(M.bat * (M.musica.modoAtual === 'lotado' ? 1 : 0.5)) !== M.pista.ult) { M.pista.ult = Math.floor(M.bat * (M.musica.modoAtual === 'lotado' ? 1 : 0.5)); desenharPista(M.pista.ult); }
      if (M.globo) M.globo.rotation.y += dt * 0.8;
      if (M.spots) { const lot = M.musica.modoAtual === 'lotado', P = M.D.pista, cx = (P.x0 + P.x1) / 2, cz = (P.z0 + P.z1) / 2, tt = s.t || 0; for (const L of M.spots) { L.s.position.x = cx + Math.sin(tt * L.f * (lot ? 2.2 : 1) + L.ph) * 3.6; L.s.position.z = cz + Math.cos(tt * L.f * 1.3 * (lot ? 2.2 : 1) + L.ph * 1.7) * 3.0; L.s.material.opacity = (lot ? 0.55 : 0.32) * (0.7 + 0.3 * Math.abs(Math.sin(M.bat * Math.PI))); } }
      desenharTV(dt); tickBolas(dt); tickFumaca(dt);
      // a equipe e os de horário
      if (!M.jairo && jairoLa()) { const A = M.jairo = criarJairo(), B = M.D.barman; s.npcs.push(A); A.x = B.x; A.z = B.z; A.yaw = A.yawAlvo = B.yaw; s.falantesExtra.jairo = { A, nome: Tx('Jairo'), voz: 2 }; }
      tickJairo(dt);
      if (aberto() || M.val) tickVal(dt, false);
      tickCapuz(dt, false); tickOponentes(dt, false);
      if (aberto()) tickFluxo(dt);
      else if (M.gente.length) for (const A of M.gente.slice()) if (A.br && A.br.tipo !== 'sai') mandarEmbora(A);   // fechou: todo mundo vai embora
      // a brasa do cigarro acende quando puxa
      for (const A of M.gente.concat(M.val ? [M.val] : [])) if (A.mao && A.mao.chave === 'cig') A.mao.sp.material.color.setRGB(1, 1 - (A.brasa || 0) * 0.15, 1 - (A.brasa || 0) * 0.3);
    }
    function liberarMesa() { /* o bar não tem encontro marcado */ }
    function limpar() {
      for (const A of M.atoresRua) { try { api.descartarPessoa(A); } catch (e) { /* nada */ } }
      M.atoresRua = []; M.musica.parar(); if (M.vinheta) { M.vinheta.remove(); M.vinheta = null; }
      const cv = document.getElementById('game'); if (cv && cv.style.filter) cv.style.filter = '';
      for (const [, t] of M.tex) t.dispose(); M.tex = new Map(); for (const [, m] of M.mats) m.dispose(); M.mats = new Map();
    }
    const dbg = { pose, darBebida, darCigarro, darTaco, criarVal, criarCapuz, criarJairo, poseJairo, poseCapuz, soltarFumaca, M, PRODUTOS, BICHOS, canvasProduto, canvasBicho, canvasCigarro, servir, desafiar, falarCapuz, mostrarEmail, bichoUI, cardapioUI, oponentesPresentes, alvoGente, faseVal, OPONENTES, petiscoComido, tickRua, dancarJog };
    if (typeof window !== 'undefined') window.__bar = dbg;
    return { entrou, saiu, chegou, tickCliente, tick, alvos, alvosSentado, liberarMesa, limpar, aberto, _f: dbg };
  }

  // as traduções entram no jogo (as chaves que já existem na cidade continuam valendo)
  if (typeof I18N !== 'undefined') for (const k of Object.keys(TRAD)) if (!I18N[k]) I18N[k] = TRAD[k];
  const dados = { PRODUTOS, BICHOS, canvasProduto, canvasBicho, TRAD };
  if (typeof window !== 'undefined') window.__barArte = dados;
  window.FutebolJS.registrarFase({ id: 'bar', nome: 'Bar', nucleoMinimo: '7.1', iniciar: async () => {}, criar, dados });
})();
