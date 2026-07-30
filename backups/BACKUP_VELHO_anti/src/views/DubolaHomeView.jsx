import { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Check, 
  Leaf, 
  Compass, 
  ArrowRight, 
  ArrowLeft,
  UtensilsCrossed, 
  Info, 
  X, 
  Heart, 
  ShoppingBag, 
  Star, 
  Grid,
  ShieldCheck,
  Eye,
  Clock,
  Flame,
  Lightbulb,
  Fish,
  Zap,
  Coffee,
  ChefHat,
  Store,
  BookOpen,
  Volume2,
  Award,
  RotateCcw
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Full culinary techniques matrix mapped dynamically based on Protein × Occasion
const techniquesMatrix = {
  peixe: {
    romantico: {
      name: "Arroseur & Grelhado Unilateral (A Arte do Regado Contínuo à Francesa)",
      science: "Cozinhar o peixe de um lado só na pele conduz o calor de forma extremamente suave para a carne, enquanto a manteiga quente no topo finaliza a cocção sem agredir as fibras delicadas do salmão.",
      description: "Grelhe o filé em frigideira quente apoiado apenas na pele. Com uma colher, pegue a manteiga derretida espumante com ervas do fundo da panela e regue continuamente o topo do peixe. A pele fica super crocante como um vidro e a carne derrete na boca.",
      sensoryCues: {
        visual: "O salmão muda gradualmente de cor de baixo para cima, ficando opaco nas laterais e brilhante no topo.",
        acoustic: "Um chiado suave de bolhas na manteiga, sem espirros violentos ou silêncio total.",
        tactile: "Ao tocar a lateral do peixe com a espátula, ele deve parecer macio e elástico."
      },
      glossary: {
        Arroseur: "Técnica francesa de regar a proteína continuamente com gordura quente durante a fritura.",
        Unilateral: "Cozinhar o alimento por apenas um dos lados na frigideira, usando calor ascendente."
      }
    },
    almoco: {
      name: "Reação de Maillard Controlada (Selagem Rápida em Alta Temperatura)",
      science: "A alta temperatura reorganiza os aminoácidos e açúcares na superfície do peixe, criando dezenas de novos compostos aromáticos (umami) que não existiam antes.",
      description: "Aqueça muito bem a frigideira com um fio de azeite. Coloque o peixe e não mexa por 3 minutos. Esse silêncio na frigideira é o que permite a formação de uma crosta dourada e selada.",
      sensoryCues: {
        visual: "Bordas douradas caramelizadas aparecendo sob o filé.",
        acoustic: "Um estalo forte e constante que indica alta transferência de calor.",
        tactile: "O filé se solta sozinho da panela quando a crosta está perfeitamente selada."
      },
      glossary: {
        Maillard: "Reação química entre aminoácidos e açúcares redutores que dá sabor e cor de tostado aos alimentos."
      }
    },
    churrasco: {
      name: "Papillote em Brasa Ativa (Cozimento a Bafo de Ervas Cítricas)",
      science: "O peixe é cozido em ambiente hermeticamente vedado usando sua própria umidade celular e o vapor dos temperos, impedindo a perda de sucos e aromas preciosos.",
      description: "Embrulhe o peixe temperado com ervas, fatias de limão e azeite em papel alumínio ou folha de bananeira. Leve à grelha. O peixe cozinha no vapor dos seus próprios temperos, saindo incrivelmente macio e suculento.",
      sensoryCues: {
        visual: "O papel alumínio infla como um balão com o vapor preso sob pressão.",
        acoustic: "Um leve murmúrio interno de líquido borbulhando dentro do embrulho.",
        tactile: "Ao pressionar de leve com a pinça de churrasco, o pacote deve parecer macio e inflado."
      },
      glossary: {
        Papillote: "Técnica de embrulhar o alimento em papel ou folha para cozinhá-lo no próprio vapor."
      }
    },
    brunch: {
      name: "Gravlax Expresso & Cura Aromática a Frio",
      science: "O sal e o açúcar extraem a umidade superficial do peixe por osmose, concentrando os sabores naturais e curando levemente as fibras sem calor, aumentando a densidade da carne.",
      description: "Cubra fatias finas de salmão com uma mistura de sal marinho fino, açúcar mascavo, raspas de limão siciliano e endro por 10 minutos na geladeira. Lave rapidamente em água fria corrente e seque bem antes de servir.",
      sensoryCues: {
        visual: "A carne do salmão ganha uma cor translúcida de joia e uma firmeza elegante nas bordas.",
        acoustic: "Silêncio absoluto do processo de cura a frio.",
        tactile: "As fatias se dobram sem quebrar, oferecendo uma textura aveludada ao toque."
      },
      glossary: {
        Cura: "Processo de conservação e saborização usando sal, açúcar ou fumaça.",
        Gravlax: "Estilo nórdico tradicional de curar salmão cru com sal, açúcar e dill."
      }
    }
  },
  burguer: {
    romantico: {
      name: "Pan-Sear & Butter Basting (Selagem Clássica e Banho de Manteiga)",
      science: "O banho de manteiga derretida na frigideira conduz o calor uniformemente sobre as bordas do hambúrguer, enquanto as ervas e o alho infundem notas amanteigadas profundas.",
      description: "Frite o burger em fogo alto de um lado. Vire-o, adicione uma colher de sopa de manteiga gelada, um dente de alho esmagado e tomilho. Incline a frigideira e regue o burger sem parar até o queijo camembert derreter por completo.",
      sensoryCues: {
        visual: "Manteiga espumando e adquirindo uma cor âmbar rica (manteiga noisette).",
        acoustic: "Um borbulhar espumante e aromático constante.",
        tactile: "Ao pressionar o centro do hambúrguer com o dedo, ele deve oferecer resistência firme, mas com elasticidade (ao ponto)."
      },
      glossary: {
        Basting: "Regar constantemente o alimento na frigideira com manteiga ou gordura aromática.",
        Noisette: "Manteiga aquecida até dourar levemente, liberando aroma amendoado característico."
      }
    },
    almoco: {
      name: "Smashed Sear (Esmagamento Térmico Máximo para Crosta de Renda)",
      science: "Esmagar a carne contra o metal superaquecido maximiza a área de contato direto, forçando uma Reação de Maillard ultra-rápida em toda a superfície antes que o interior seque.",
      description: "Faça uma bola de carne bem gelada. Jogue na chapa fervendo e esmague imediatamente com uma espátula pesada até ficar bem fino. Tempere na hora. Deixe criar uma crosta de renda marrom escuro antes de virar.",
      sensoryCues: {
        visual: "Bordas do burger rendadas, tostadas e ultra finas, com sucos borbulhando no topo da carne crua.",
        acoustic: "Chiado violento de alta pressão que atesta a evaporação da umidade superficial.",
        tactile: "Uma crosta firme e rígida ao passar a espátula por baixo antes de virar."
      },
      glossary: {
        Smash: "Técnica de prensar a carne diretamente na chapa para criar máxima crosta de sabor.",
        Sear: "Selar a superfície rapidamente para formar uma crosta crocante."
      }
    },
    churrasco: {
      name: "Reverse Sear (Selagem Inversa com Braseiro Passivo)",
      science: "Cozinhar a carne lentamente em temperatura baixa uniforme preserva a estrutura interna de água, seguida de selagem rápida em calor extremo para reter os sucos.",
      description: "Coloque o hambúrguer grosso na parte alta da churrasqueira (calor indireto) até atingir a temperatura morna interna. Depois, desça a carne para a grelha de baixo, diretamente sobre o carvão em brasa vermelha, por apenas 1 minuto de cada lado.",
      sensoryCues: {
        visual: "Uma cor dourada escura externa uniforme e miolo perfeitamente rosado e suculento.",
        acoustic: "Gotejar de gordura na brasa gerando pequenas labaredas aromáticas.",
        tactile: "O hambúrguer deve parecer flexível e incrivelmente suculento ao toque da pinça."
      },
      glossary: {
        'Reverse Sear': "Método de cocção lento em baixa temperatura seguido por uma selagem rápida em calor extremo."
      }
    },
    brunch: {
      name: "Gema Fondante e Emulsão Térmica de Proteínas",
      science: "A gema do ovo frito atua como um emulsificante natural riquíssimo, que se funde quimicamente com os pedaços aromáticos da Maionese ao se misturarem na boca.",
      description: "Grelhe o burger de sausage artesanal de porco. Na mesma gordura, frite um ovo caipira mantendo a gema perfeitamente mole. Ao montar, coloque a maionese logo abaixo do ovo. A gema e a maionese se fundirão a cada mordida.",
      sensoryCues: {
        visual: "A gema de cor laranja brilhante escorrendo lentamente sobre a carne ao cortar.",
        acoustic: "O estalo suave da clara de ovo fritando na manteiga quente.",
        tactile: "Uma textura super aveludada e cremosa na primeira garfada."
      },
      glossary: {
        Emulsionar: "Combinar dois líquidos que normalmente não se misturam em uma textura cremosa homogênea.",
        Fondante: "Diz-se de um ingrediente cozido até atingir um ponto extremamente cremoso, que derrete na boca."
      }
    }
  },
  camarao: {
    romantico: {
      name: "Emulsion Glaze (Glaceado Aveludado com Calor Residual)",
      science: "A água e os açúcares liberados pelo camarão se ligam à gordura e à acidez da maionese e da manteiga fria fora do fogo direto, criando um molho perfeitamente aveludado (glacê).",
      description: "Salteie os camarões rapidamente por 2 minutos. Desligue o fogo. Adicione a Maionese Dubola selecionada e mexa energicamente na panela morna. O calor residual derreterá a maionese envolvendo cada camarão com um molho brilhante.",
      sensoryCues: {
        visual: "Uma película brilhante e cremosa cobrindo perfeitamente os camarões rosados.",
        acoustic: "Um chiado suave que cessa enquanto você mexe o molho fora do fogo.",
        tactile: "O molho deve cobrir as costas da colher em consistência de 'nape' perfeito."
      },
      glossary: {
        Glacear: "Cobrir o alimento com uma calda ou molho espesso e brilhante.",
        Nape: "Consistência de molho ideal que cobre as costas de uma colher sem escorrer."
      }
    },
    almoco: {
      name: "Flash Sautéing (Salteado Rápido de Precisão)",
      science: "Cozinhar crustáceos por tempo mínimo absoluto impede que suas proteínas se encolham e expulsem a água interna, o que os deixaria com textura borrachuda.",
      description: "Aqueça o azeite até quase soltar fumaça. Adicione os camarões secos e salteie por exatamente 90 segundos de cada lado até ficarem rosados no formato da letra C. Tire da panela imediatamente.",
      sensoryCues: {
        visual: "O camarão curvando-se levemente em forma de 'C' (ponto ideal), não de 'O' (passou do ponto e encolheu).",
        acoustic: "Sons rápidos de estalos de azeite quente.",
        tactile: "Ao morder, o camarão deve oferecer uma resistência leve e estalar sob o dente."
      },
      glossary: {
        Saltear: "Cozinhar rapidamente alimentos picados ou finos em pouca gordura bem quente, mexendo sempre."
      }
    },
    churrasco: {
      name: "Skewered Charring & Lemon Spray (Tostado de Alta Brasa com Casca)",
      science: "A casca protege a carne delicada do camarão contra o calor direto extremo da churrasqueira, enquanto o açúcar natural da casca carameliza, infundindo sabor defumado.",
      description: "Monte os camarões em espetos com casca. Pincele azeite e leve à brasa máxima por 2 minutos de cada lado. O carvão vai tostar a casca. Borrife limão no final e sirva para descascar na hora, mergulhando na maionese.",
      sensoryCues: {
        visual: "Marcas pretas de grelha sobre a casca laranja avermelhada brilhante.",
        acoustic: "O estalo seco da casca caramelizando no calor direto da brasa.",
        tactile: "A casca fica quebradiça e se solta facilmente da carne úmida."
      },
      glossary: {
        Defumar: "Aromatizar alimentos expondo-os à fumaça de madeira ou carvão aquecido."
      }
    },
    brunch: {
      name: "Confit Suave em Banho de Azeite Aromático",
      science: "Cozinhar o camarão submerso em óleo morno (baixa temperatura) amacia as fibras de forma ultra delicada, mantendo os camarões perfeitamente macios e hidratados.",
      description: "Coloque os camarões em uma panelinha totalmente cobertos com azeite de oliva morno (cerca de 70°C, fogo ultra baixo) com dentes de alho e alecrim por 6 minutos. Escorra e monte sobre o pão brioche com a maionese base.",
      sensoryCues: {
        visual: "O camarão muda de cor para um rosa pálido muito suave e elegante.",
        acoustic: "Silêncio total na panela, sem fritar ou estalar.",
        tactile: "Textura extraordinariamente macia, que se corta com o garfo."
      },
      glossary: {
        Confitar: "Cozinhar lentamente alimentos submersos em gordura a temperaturas baixas."
      }
    }
  },
  cogumelos: {
    romantico: {
      name: "Deglaçagem com Vinho Branco & Redução de Umami",
      science: "O álcool e a acidez do vinho branco dissolvem os açúcares caramelizados ricos em umami grudados no fundo da panela, incorporando-os de volta aos cogumelos.",
      description: "Doure os cogumelos em manteiga. Quando estiverem bem tostados, despeje uma taça de vinho branco seco. Mexa raspando o fundo da frigideira. Deixe reduzir até restar um molho espesso e brilhante, ligando tudo com a Maionese Dubola.",
      sensoryCues: {
        visual: "O líquido ferve intensamente e depois reduz a um xarope brilhante que envolve os cogumelos.",
        acoustic: "Um som efervescente alto que acalma à medida que o álcool do vinho evapora.",
        tactile: "Os cogumelos devem parecer macios e envoltos em molho aveludado."
      },
      glossary: {
        Deglaçar: "Adicionar líquido a uma panela quente para dissolver os resíduos de alimento caramelizados no fundo.",
        Umami: "O quinto sabor básico, que significa 'saboroso', presente em cogumelos tostados."
      }
    },
    almoco: {
      name: "Sauté Seco (Técnica de Caramelização sem Gordura)",
      science: "Adicionar gordura no início fecha os poros do cogumelo, fazendo com que cozinhe no próprio vapor. Tostar a seco primeiro elimina a água celular rapidamente, permitindo caramelização pura.",
      description: "Coloque os cogumelos fatiados na frigideira bem quente TOTALMENTE SECA. Sem óleo, sem sal. Pressione-os. Eles vão soltar vapor e tostar. Só quando estiverem dourados adicione o azeite, o sal e a Maionese Dubola.",
      sensoryCues: {
        visual: "Os cogumelos diminuem de tamanho e mudam de cinza para marrom dourado rico e tostado.",
        acoustic: "O chiado inicial de água evaporando que cessa quando começa a tostar de verdade.",
        tactile: "Textura firme e carnuda, sem ficar murcho ou esponjoso."
      },
      glossary: {
        'Sauté Seco': "Método de tostar alimentos em frigideira quente sem nenhuma gordura inicial."
      }
    },
    churrasco: {
      name: "Charring Radiante em Grelha Fechada na Brasa",
      science: "O calor seco radiante do carvão remove a umidade superficial rapidamente, concentrando os compostos terrosos dos cogumelos com notas defumadas de madeira carbonizada.",
      description: "Arrume cogumelos inteiros grandes em uma grelha dupla de churrasqueira. Pincele shoyu e azeite. Leve ao fogo médio da churrasqueira. Vire a grelha de tempos em tempos para defumar por igual antes de misturar com a Maionese.",
      sensoryCues: {
        visual: "Bordas dos cogumelos levemente chamuscadas e enrugadas de puro sabor concentrado.",
        acoustic: "Gotas de shoyu e azeite caindo na brasa gerando chiados rápidos.",
        tactile: "Textura elástica e suculenta, liberando suco saboroso ao apertar."
      },
      glossary: {
        Chamuscar: "Expor rapidamente o alimento ao fogo direto para tostar a superfície."
      }
    },
    brunch: {
      name: "Confit de Paris em Ervas Finas e Alho",
      science: "Cozinhar os cogumelos imersos em gordura rica quebra a quitina de suas paredes celulares de forma suave, tornando sua textura incrivelmente amanteigada e macia.",
      description: "Fatie cogumelos Paris frescos e coloque em uma assadeira pequena cobertos de azeite extra virgem, alho esmagado e tomilho. Asse em fogo baixo por 20 minutos. Escorra esse azeite perfumado e use os cogumelos amantesigados com a Maionese no topo de um toast.",
      sensoryCues: {
        visual: "Cogumelos brilhantes, macios e translúcidos, perfeitamente cozidos.",
        acoustic: "Um cozimento silencioso e perfumado no forno baixo.",
        tactile: "Textura macia amanteigada que derrete ao toque."
      },
      glossary: {
        Confitar: "Cozinhar lentamente alimentos submersos em gordura a temperaturas baixas."
      }
    }
  },
  batatas: {
    romantico: {
      name: "Basselback Parcial & Tostado por Convecção (Sanfona Crocante)",
      science: "Fatiar a batata em lâminas finas sem cortar até o fim expõe uma área de superfície gigantesca ao calor direto, fazendo com que as bordas assem com textura de batata frita, enquanto a base se mantém macia como purê.",
      description: "Corte as batatas com fatias finas paralelas, sem chegar à base. Pincele manteiga noisette derretida entre as fatias. Asse em forno bem alto a 220°C até abrir como um leque e tostar as bordas. Sirva coroando com Maionese fria nos vãos.",
      sensoryCues: {
        visual: "Um leque de batata dourado que se abre no prato, com pétalas ultra-crocantes.",
        acoustic: "Um estalo seco ao pressionar cada lâmina tostada com o garfo.",
        tactile: "Pétalas externas duras e quebradiças, com miolo central ultra macio."
      },
      glossary: {
        Hasselback: "Estilo sueco de preparar batatas fatiadas em finas tiras unidas pela base antes de assar."
      }
    },
    almoco: {
      name: "Air-Fryer Triple-Cooked (Textura de Pub Inglês)",
      science: "Cozinhar a batata rapidamente em água antes de fritar gelatiniza os amidos superficiais. A secagem completa seguida de calor por convecção de ar remove a água residual, forçando uma crosta ultra rígida.",
      description: "Corte as batatas em gomos. Ferva em água com sal por 5 minutos e escorra. Seque com papel toalha e chacoalhe para criar uma superfície áspera de amido. Regue com azeite e leve à Air-Fryer a 200°C por 20 minutos até dourar.",
      sensoryCues: {
        visual: "Uma superfície borbulhante, opaca e marrom-dourada com bolhas microscópicas de crocância.",
        acoustic: "Um barulho oco e seco de 'vidro quebradiço' ao bater as batatas umas nas outras.",
        tactile: "Uma carcaça crocante inquebrável por fora e um purê de batata úmido por dentro."
      },
      glossary: {
        Convecção: "Método de transferência de calor por meio da movimentação de ar quente ao redor do alimento."
      }
    },
    churrasco: {
      name: "Rescaldo Ativo em Papel Alumínio (Cozimento em Cinzas Quentes)",
      science: "Enterrar a batata diretamente no carvão cozido utiliza a altíssima densidade de calor térmico das cinzas, cozinhando o núcleo uniformemente sem queimar a polpa devido à vedação do alumínio.",
      description: "Embrulhe batatas inglesas grandes temperadas com sal grosso em três camadas de papel alumínio. Enterre-as diretamente sob as cinzas da churrasqueira por 40 minutos. Abra a batata ao meio, esmague o miolo com garfo e incorpore a Maionese Dubola.",
      sensoryCues: {
        visual: "Vapor denso e aromático subindo ao cortar a batata macia ao meio no prato.",
        acoustic: "Silêncio absoluto do cozimento subterrâneo nas cinzas.",
        tactile: "A casca externa cede completamente ao toque mais leve de um garfo, desfazendo-se."
      },
      glossary: {
        Rescaldo: "Técnica primitiva e eficiente de cozinhar alimentos diretamente nas cinzas e brasas que restaram do fogo principal."
      }
    },
    brunch: {
      name: "Rösti com Ligas Térmicas Naturais de Amido",
      science: "Retirar toda a água da batata ralada usando um pano permite que os amidos remanescentes formem uma liga natural ao entrar em contato com a manteiga quente, criando uma crosta rendada.",
      description: "Rale as batatas cruas. Coloque-as em um pano de prato limpo e esprema com toda a força para tirar TODA a água. Misture com sal e noz-moscada. Frite na manteiga em fogo médio, dourando as bordas para formar uma panqueca rendada e crocante.",
      sensoryCues: {
        visual: "Uma crosta marrom-dourada rendada e fios de batata ultra-crocantes nas bordas da panqueca.",
        acoustic: "Um chiado fino, alegre e constante da manteiga fritando os fios de batata.",
        tactile: "Uma estrutura firme e crocante nas bordas que amacia suavemente no centro."
      },
      glossary: {
        Rösti: "Prato tradicional suíço feito de batata ralada frita na manteiga até dourar."
      }
    }
  }
};

// Complete recipe database per Mayonnaise Flavor x Protein x Occasion
const recipesDatabase = {
  alho: {
    peixe: {
      romantico: {
        name: "Lombo de Salmão Unilateral ao Regado de Manteiga de Tomilho e Crema de Alho Dubola",
        prepTime: "22 minutos",
        difficulty: "Média",
        servings: "2 porções",
        ingredients: [
          "2 filés de salmão fresco (200g cada, com pele)",
          "4 colheres de sopa de Maionese Dubola Sabor Alho (cremosa e intensa)",
          "1 colher de sopa de manteiga noisette",
          "3 dentes de alho esmagados com casca",
          "1 ramo de tomilho e alecrim frescos",
          "Flor de sal e pimenta-do-reino moída na hora",
          "Fio de azeite extra virgem de oliva"
        ],
        steps: [
          "Seque perfeitamente a pele do salmão e tempere a carne com sal marinho e pimenta preta.",
          "Aqueça o azeite em fogo alto. Deposite o salmão com a pele para baixo. Pressione com a espátula por 30 segundos para nivelar a pele.",
          "Adicione a manteiga, os dentes de alho esmagados e as ervas. Com uma colher, recolha a manteiga espumante e regue o topo do salmão sem parar (técnica arroseur) por 4 minutos.",
          "Vire o peixe para selar o topo por meros 45 segundos e retire da panela. Deixe descansar por 1 minuto.",
          "Sirva sobre um espelho generoso de Maionese Dubola Sabor Alho fria. O calor do peixe liberará os óleos aromáticos do alho na maionese, criando uma sinergia elegante."
        ],
        chefSecret: "A emulsão de alho nobre atua como uma barreira que equilibra a gordura natural do salmão grelhado, oferecendo uma nota tostada e aveludada incomparável."
      },
      almoco: {
        name: "Filé de Pescada Grelhado com Crosta Rápida de Alho Dubola & Ervas Finas",
        prepTime: "15 minutos",
        difficulty: "Fácil",
        servings: "2 porções",
        ingredients: [
          "2 filés de peixe branco alto (pescada amarela, linguado ou pargo)",
          "3 colheres de sopa de Maionese Dubola Sabor Alho",
          "1 colher de sopa de salsinha e cebolinha picadas",
          "Fio de azeite extra virgem",
          "Sal e suco de limão siciliano"
        ],
        steps: [
          "Tempere os filés de peixe branco com sal e um leve toque de suco de limão siciliano.",
          "Em fogo médio-alto, aqueça o azeite na frigideira e doure o peixe por 3 minutos de um lado até formar uma leve crosta dourada.",
          "Vire o peixe, espalhe uma camada fina de Maionese Dubola Sabor Alho sobre o lado grelhado e salpique com as ervas finas.",
          "Tampe a frigideira por 2 minutos para permitir que o peixe termine de cozinhar no próprio vapor e a maionese de alho gratine levemente.",
          "Sirva fumegante com arroz de brócolis ou vegetais salteados."
        ],
        chefSecret: "Abafar a maionese de alho sobre o peixe cria uma cobertura úmida que retém toda a água interna do peixe branco, evitando que ele resseque."
      },
      churrasco: {
        name: "Lombo de Tambaqui na Brasa com Manteiga de Alho Assado Dubola & Alecrim",
        prepTime: "30 minutos",
        difficulty: "Média",
        servings: "4 porções",
        ingredients: [
          "1kg de lombo de Tambaqui ou outro peixe de couro",
          "1 pote de Maionese Dubola Sabor Alho",
          "1 cabeça de alho inteira assada na brasa",
          "Sal grosso triturado",
          "Azeite de oliva e alecrim para pincelar"
        ],
        steps: [
          "Tempere o peixe com sal grosso triturado de maneira uniforme.",
          "Coloque na grelha da churrasqueira, primeiro com a carne para baixo por 12 minutos. Pincele a casca com azeite.",
          "Assou de um lado, vire o peixe com a pele para baixo. Esmague a polpa do alho assado nas cinzas e misture com a Maionese de Alho Dubola.",
          "Espalhe essa mistura rica sobre a carne grelhada e deixe assar por mais 15 minutos, permitindo que a brasa caramelize o topo.",
          "Retire, decore com raminhos de alecrim e sirva com limão grelhado."
        ],
        chefSecret: "O alho assado na brasa perde sua agressividade pungente e ganha um dulçor que, combinado com a Maionese de Alho Dubola, cria uma crosta defumada inigualável."
      },
      brunch: {
        name: "Bruschetta de Salmão Curado a Frio com Aioli Suave de Alho Dubola",
        prepTime: "12 minutos",
        difficulty: "Fácil",
        servings: "2 porções",
        ingredients: [
          "4 fatias de pão sourdough rústico tostado com azeite",
          "150g de salmão curado (ou defumado) em lâminas finas",
          "4 colheres de sopa de Maionese Dubola Sabor Alho",
          "Azeite de oliva extra virgem",
          "Raspas de limão taiti e cebolete picada"
        ],
        steps: [
          "Aqueça uma chapa e toste as fatias de sourdough pinceladas com azeite até ficarem douradas e crocantes.",
          "Espalhe uma camada farta de Maionese Dubola Sabor Alho sobre cada fatia ainda quente.",
          "Arrume as lâminas de salmão por cima de forma elegante e drapeada.",
          "Finalize com raspas de limão taiti, cebolete picada e pimenta preta moída na hora.",
          "Sirva imediatamente como o prato principal de um brunch sofisticado."
        ],
        chefSecret: "O calor sutil do pão tostado ativa os aromas de alho assado da Maionese, fazendo com que ela derreta sutilmente sob o salmão defumado gelado."
      }
    },
    burguer: {
      romantico: {
        name: "Costela Burguer Premium com Camembert & Aioli de Alho Dubola no Brioche",
        prepTime: "20 minutos",
        difficulty: "Média",
        servings: "2 porções",
        ingredients: [
          "2 blends de costela bovina premium de 180g cada",
          "100g de queijo camembert fatiado",
          "2 pães de brioche amanteigados",
          "4 colheres de sopa de Maionese Dubola Sabor Alho",
          "Cebola caramelizada no mel de engenho e alecrim",
          "Sal de parrilla e pimenta do reino"
        ],
        steps: [
          "Molde os burgers e refrigere por 30 minutos antes de grelhar.",
          "Aqueça uma frigideira de ferro até quase soltar fumaça. Sele os burgers com sal de parrilla por 3 minutos de cada lado.",
          "Na virada da carne, adicione as fatias de camembert no topo e abafe por 1 minuto com uma colher de água na frigideira para criar vapor e derreter.",
          "Toste os brioches na manteiga até dourar perfeitamente.",
          "Monte aplicando a Maionese de Alho Dubola na base e no topo do pão, adicione o burger com camembert e finalize com a cebola caramelizada.",
          "Feche e sirva imediatamente para derreter corações."
        ],
        chefSecret: "A Maionese Dubola Sabor Alho traz notas amendoadas de alho cozido que conversam perfeitamente com a casca aveludada e terrosa do queijo camembert."
      },
      almoco: {
        name: "Double Smash Express com Queijo Prato e Molho Cremoso de Alho Dubola",
        prepTime: "10 minutos",
        difficulty: "Fácil",
        servings: "1 porção",
        ingredients: [
          "2 smash burgers de carne bovina (80g cada, bem gelados)",
          "2 fatias de queijo prato de boa fusão",
          "1 pão brioche macio",
          "3 colheres de sopa de Maionese Dubola Sabor Alho",
          "Sal e pimenta preta moída"
        ],
        steps: [
          "Aqueça uma chapa ou frigideira grossa em fogo máximo por 5 minutos.",
          "Coloque as duas bolas de carne geladas na chapa. Esmague com a espátula pesada até ficarem bem finas. Tempere imediatamente com sal e pimenta.",
          "Deixe grelhar por 90 segundos sem mexer para formar uma crosta escura. Vire os burgers, coloque o queijo prato por cima e empilhe um sobre o outro.",
          "Toste o pão rapidamente. Passe a Maionese de Alho Dubola nos dois lados do pão brioche.",
          "Monte os burgers duplos empilhados e sirva quente em papel manteiga."
        ],
        chefSecret: "A gordura do smash burger grelhado de forma rápida retém o calor que ativa o caráter untuoso do alho assado na maionese Dubola."
      },
      churrasco: {
        name: "Burger de Costela Reduzida na Brasa com Crosta de Alho Gourmet Dubola",
        prepTime: "25 minutos",
        difficulty: "Média",
        servings: "4 porções",
        ingredients: [
          "4 blends de costela de 160g cada",
          "4 fatias de queijo provolone defumado",
          "4 pães australianos",
          "1 pote de Maionese Dubola Sabor Alho",
          "Sal de parrilla"
        ],
        steps: [
          "Prepare o braseiro da churrasqueira até ficar vermelho e sem chamas.",
          "Coloque as carnes na grelha a 15cm do carvão quente por 4 minutos de um lado.",
          "Vire os hambúrgueres, salpique sal de parrilla e coloque a fatia de queijo provolone.",
          "Suba os burgers para a parte mais alta da churrasqueira para derreter o provolone com o calor indireto por 3 minutos.",
          "Toste o pão australiano na grelha. Espalhe uma generosa camada de Maionese Dubola Sabor Alho na base, posicione o burger defumado com provolone e feche."
        ],
        chefSecret: "O provolone defumado e a maionese de alho formam uma parceria clássica do churrasco brasileiro, trazendo peso e intensidade de sabor à carne de costela."
      },
      brunch: {
        name: "Egg & Sausage Biscuit com Aioli de Alho Premium Dubola",
        prepTime: "15 minutos",
        difficulty: "Fácil",
        servings: "2 porções",
        ingredients: [
          "2 biscuits ingleses (ou pão brioche de forma redondo)",
          "2 burgers de linguiça suína toscana temperada (100g cada)",
          "2 ovos caipiras caipiras",
          "4 colheres de sopa de Maionese Dubola Sabor Alho",
          "1 colher de sopa de manteiga para fritar os ovos"
        ],
        steps: [
          "Grelhe as carnes de linguiça toscana na frigideira quente por 4 minutos de cada lado até estarem cozidas e douradas.",
          "Em outra frigideira, frite os ovos na manteiga mantendo a gema mole e a clara cozida.",
          "Abra os biscuits e toste levemente no calor residual da gordura da linguiça.",
          "Espalhe uma colher de sopa generosa de Maionese de Alho Dubola em cada lado.",
          "Monte a carne de linguiça, coloque o ovo frito com gema mole no topo e feche com delicadeza."
        ],
        chefSecret: "Quando a gema morna do ovo escorre e se mistura à Maionese Dubola Sabor Alho, cria-se uma emulsão de gema e alho com textura inigualável."
      }
    },
    camarao: {
      romantico: {
        name: "Camarões Pistola no Salteado Rápido com Glacê de Alho Assado Dubola & Páprica",
        prepTime: "18 minutos",
        difficulty: "Média",
        servings: "2 porções",
        ingredients: [
          "400g de camarões pistola limpos (com cauda)",
          "4 colheres de sopa de Maionese Dubola Sabor Alho",
          "1 colher de chá de páprica defumada espanhola",
          "1 colher de sopa de manteiga gelada",
          "Fio de azeite, sal e raspas de limão siciliano"
        ],
        steps: [
          "Seque muito bem os camarões com papel toalha e tempere com sal e páprica defumada.",
          "Aqueça o azeite em uma frigideira larga em fogo máximo até quase fumegar. Salteie os camarões por 90 segundos de um lado. Vire e doure por mais 60 segundos.",
          "Desligue o fogo imediatamente para evitar que os camarões passem do ponto.",
          "Adicione a Maionese Dubola Sabor Alho e a manteiga gelada diretamente na frigideira quente fora do fogo. Mexa energicamente até derreter e cobrir os camarões com um glacê aveludado brilhante.",
          "Sirva salpicando raspas de limão siciliano por cima."
        ],
        chefSecret: "A Maionese Dubola Sabor Alho combinada com a manteiga gelada fora do fogo emulsiona com o calor residual, criando um molho cremoso que não se separa."
      },
      almoco: {
        name: "Salteado de Camarão e Abobrinha com Toque Aromático de Alho Dubola",
        prepTime: "12 minutos",
        difficulty: "Fácil",
        servings: "2 porções",
        ingredients: [
          "300g de camarões limpos tamanho médio",
          "1 abobrinha italiana cortada em meias-luas finas",
          "3 colheres de sopa de Maionese Dubola Sabor Alho",
          "1 colher de sopa de azeite",
          "Sal e pimenta preta"
        ],
        steps: [
          "Aqueça o azeite na frigideira e refogue a abobrinha por 3 minutos até amaciar levemente, mantendo-a crocante.",
          "Adicione os camarões e salteie tudo junto em fogo alto por mais 3 minutos.",
          "Assim que os camarões ficarem rosados, abaixe o fogo.",
          "Adicione a Maionese Dubola Sabor Alho, misturando bem por 30 segundos até envolver todos os ingredientes.",
          "Transfira para um prato fundo e sirva quente."
        ],
        chefSecret: "A abobrinha absorve a água liberada pelo camarão que, ligada à emulsão de alho, forma um molho cremoso rústico fantástico."
      },
      churrasco: {
        name: "Espetinho de Camarões na Brasa com Banho de Aioli de Alho Defumado",
        prepTime: "20 minutos",
        difficulty: "Média",
        servings: "4 porções",
        ingredients: [
          "600g de camarões grandes inteiros com casca",
          "1 pote de Maionese Dubola Sabor Alho",
          "Suco de 1 limão taiti",
          "Pimenta calabresa seca e azeite",
          "Sal grosso"
        ],
        steps: [
          "Tempere os camarões com sal grosso, azeite e uma pitada de pimenta calabresa.",
          "Monte-os em espetos duplos para facilitar o manuseio na churrasqueira.",
          "Leve ao braseiro forte por 2 minutos de cada lado até as cascas tostarem levemente e ficarem rosa brilhante.",
          "Retire da grelha, borrife o suco de limão taiti sobre as cascas quentes.",
          "Sirva em uma travessa acompanhados de uma tigela generosa de Maionese Dubola Sabor Alho para descascar e mergulhar na hora."
        ],
        chefSecret: "Grelhar os camarões com casca protege a umidade interna da carne contra o calor seco do carvão, enquanto a maionese de alho completa as notas defumadas."
      },
      brunch: {
        name: "Shrimp Roll Gourmet no Brioche com Maionese de Alho Dubola e Dill",
        prepTime: "15 minutos",
        difficulty: "Média",
        servings: "2 porções",
        ingredients: [
          "2 pães de hot dog de brioche cortados no topo",
          "250g de camarões cozidos no vapor e resfriados",
          "4 colheres de sopa de Maionese Dubola Sabor Alho",
          "1 colher de sopa de salsão picado ultra-fino",
          "Ramos de endro (dill) fresco e manteiga para dourar"
        ],
        steps: [
          "Toste as laterais dos pães de brioche em uma frigideira com bastante manteiga até dourarem.",
          "Em um bowl, misture os camarões resfriados, a Maionese Dubola Sabor Alho e o salsão picado.",
          "Tempere com sal e pimenta preta moída a gosto.",
          "Recheie os pães de brioche dourados com a salada cremosa de camarão gelado.",
          "Decore com ramos de dill fresco e sirva imediatamente."
        ],
        chefSecret: "O contraste de temperaturas entre o brioche quente e amanteigado e a salada gelada de camarão com alho cria uma experiência de paladar rica e dinâmica."
      }
    },
    cogumelos: {
      romantico: {
        name: "Trio de Cogumelos no Sauté com Deglaçagem de Vinho do Porto & Aioli de Alho",
        prepTime: "18 minutos",
        difficulty: "Média",
        servings: "2 porções",
        ingredients: [
          "300g de cogumelos frescos (Paris, Shiitake e Shimeji)",
          "4 colheres de sopa de Maionese Dubola Sabor Alho",
          "50ml de Vinho do Porto tinto (ou vinho tinto seco)",
          "1 colher de sopa de manteiga sem sal",
          "Sal marinho, tomilho e fio de azeite"
        ],
        steps: [
          "Limpe os cogumelos com um pano úmido e corte-os em pedaços grandes e rústicos.",
          "Aqueça a frigideira com o azeite e toste os cogumelos a seco por 3 minutos.",
          "Adicione a manteiga, o sal e o tomilho. Deixe dourar por mais 2 minutos.",
          "Despeje o Vinho do Porto para deglaçar o fundo da panela, raspando os resíduos caramelizados com a colher. Deixe o vinho reduzir até virar um xarope.",
          "Desligue o fogo. Adicione a Maionese Dubola Sabor Alho e mexa energicamente para fundir o molho de vinho reduzido com a emulsão de alho.",
          "Sirva imediatamente sobre fatias de sourdough tostadas."
        ],
        chefSecret: "A doçura complexa do Vinho do Porto reduzido e o sabor defumado da Maionese de Alho Dubola criam uma cobertura de sabor umami rica e luxuosa."
      },
      almoco: {
        name: "Shiitake Sauté Seco com Molho de Alho Dubola Express",
        prepTime: "10 minutos",
        difficulty: "Fácil",
        servings: "2 porções",
        ingredients: [
          "200g de cogumelos Shiitake fatiados",
          "3 colheres de sopa de Maionese Dubola Sabor Alho",
          "1 colher de sopa de cebolinha picada",
          "Fio de azeite e pitada de sal"
        ],
        steps: [
          "Aqueça muito bem uma frigideira antiaderente sem gordura.",
          "Coloque os cogumelos Shiitake fatiados e deixe tostar a seco por 3 minutos até soltarem a água celular.",
          "Adicione o fio de azeite e o sal, salteando por mais 2 minutos.",
          "Reduza o fogo para o mínimo, adicione a Maionese de Alho Dubola e a cebolinha picada.",
          "Misture rapidamente por 20 segundos apenas para incorporar e sirva quente."
        ],
        chefSecret: "Tostar o shiitake a seco primeiro impede que ele fique com textura esponjosa, concentrando seu sabor terroso para receber a maionese de alho."
      },
      churrasco: {
        name: "Portobellos Gigantes na Brasa Recheados com Provolone e Alho Dubola",
        prepTime: "25 minutos",
        difficulty: "Média",
        servings: "4 porções",
        ingredients: [
          "4 cogumelos Portobello grandes inteiros",
          "1 pote de Maionese Dubola Sabor Alho",
          "100g de queijo provolone ralado",
          "Azeite de oliva e orégano fresco"
        ],
        steps: [
          "Remova os talos dos cogumelos Portobello com cuidado e limpe os chapéus.",
          "Pincele os chapéus externamente com azeite de oliva.",
          "Misture o queijo provolone ralado com 4 colheres de sopa de Maionese Dubola Sabor Alho.",
          "Recheie as cavidades dos Portobellos com a mistura cremosa.",
          "Leve à grelha da churrasqueira na parte média-alta, com o recheio para cima, por 15-20 minutos, até o cogumelo murchar e o queijo de alho gratinar por completo."
        ],
        chefSecret: "O Portobello assa em seu próprio vapor na churrasqueira, enquanto a maionese de alho e o provolone gratinam formando uma tampa dourada crocante."
      },
      brunch: {
        name: "Shimeji Toast com Ovos Mexidos Cremosos e Toque de Alho Dubola",
        prepTime: "12 minutos",
        difficulty: "Fácil",
        servings: "2 porções",
        ingredients: [
          "2 fatias de sourdough ou pão rústico",
          "150g de cogumelos Shimeji desfeitos",
          "3 ovos caipiras",
          "3 colheres de sopa de Maionese Dubola Sabor Alho",
          "Manteiga e sal de cozinha"
        ],
        steps: [
          "Refogue o shimeji com um pouco de manteiga na frigideira por 4 minutos até amaciar.",
          "Em outra panelinha em fogo muito baixo, cozinhe os ovos batidos com uma colher de manteiga, mexendo sem parar até obter um creme úmido.",
          "Toste os pães.",
          "Passe 1 colher de sopa de Maionese de Alho Dubola na base de cada pão, distribua os ovos mexidos cremosos e coroe com o shimeji refogado no topo.",
          "Sirva imediatamente quente."
        ],
        chefSecret: "A Maionese de Alho na base do pão cria uma barreira impermeável que impede que a umidade dos ovos amoleça a torrada rústica."
      }
    },
    batatas: {
      romantico: {
        name: "Batatas Hasselback Douradas com Manteiga de Ervas e Creme de Alho Dubola",
        prepTime: "40 minutos",
        difficulty: "Média",
        servings: "2 porções",
        ingredients: [
          "2 batatas inglesas grandes e alongadas",
          "4 colheres de sopa de Maionese Dubola Sabor Alho",
          "2 colheres de sopa de manteiga derretida com alecrim e tomilho",
          "Flor de sal e pimenta-do-reino moída",
          "Cebolete fresca picada"
        ],
        steps: [
          "Lave bem as batatas e seque. Coloque a batata entre dois cabos de colheres de pau para servirem de limitadores.",
          "Fatie a batata em lâminas bem finas de 2mm, sem chegar ao fundo.",
          "Pincele a batata com a manteiga derretida com ervas, forçando para entrar nos vãos. Salpique sal e pimenta.",
          "Asse em forno a 200°C por 40 minutos, pincelando com mais manteiga na metade do tempo, até abrir como leque e dourar.",
          "Retire do forno, coloque quenelles de Maionese Dubola Sabor Alho fria entre as fatias quentes e salpique cebolete."
        ],
        chefSecret: "A batata quente faz a maionese de alho derreter parcialmente nos vãos, fundindo a textura crocante com um interior ultra cremoso perfumado."
      },
      almoco: {
        name: "Batata Frita Rústica Crocante com Dip Gourmet de Alho Dubola",
        prepTime: "20 minutos",
        difficulty: "Fácil",
        servings: "2 porções",
        ingredients: [
          "3 batatas médias cortadas em gomos (estilo rústico)",
          "1 pote de Maionese Dubola Sabor Alho",
          "1 colher de sopa de azeite",
          "Sal grosso triturado e páprica doce"
        ],
        steps: [
          "Corte as batatas em gomos e cozinhe em água fervente com sal por 5 minutos.",
          "Escorra bem e chacoalhe no escorredor para marcar as bordas de amido.",
          "Misture as batatas com o azeite, sal e páprica. Leve à Air-Fryer a 200°C por 15-20 minutos até ficarem bem crocantes.",
          "Transfira para um bowl de servir.",
          "Sirva as batatas rústicas quentes acompanhadas de um pote de Maionese Dubola Sabor Alho gelada."
        ],
        chefSecret: "A aspereza do amido cozido antes de fritar cria mini-cavernas de crocância na batata que retêm a Maionese de Alho de forma fantástica."
      },
      churrasco: {
        name: "Batata de Rescaldo na Brasa Recheada com Aioli de Alho Dubola & Crisp de Bacon",
        prepTime: "45 minutos",
        difficulty: "Média",
        servings: "4 porções",
        ingredients: [
          "4 batatas inglesas grandes inteiras com casca",
          "1 pote de Maionese Dubola Sabor Alho",
          "100g de bacon cortado em cubos pequenos",
          "Sal grosso e papel alumínio"
        ],
        steps: [
          "Embrulhe cada batata lavada com sal grosso em 3 camadas de papel alumínio.",
          "Enterre-as diretamente sob as brasas da churrasqueira por 40 minutos.",
          "Enquanto as batatas assam, frite os cubinhos de bacon na própria gordura até ficarem bem crocantes. Escorra.",
          "Retire as batatas das cinzas, remova o papel alumínio e faça um corte profundo longitudinal em cada uma.",
          "Esmague o miolo quente com um garfo, adicione 2 colheres de sopa de Maionese de Alho Dubola em cada uma e misture bem. Cubra com os crisps de bacon."
        ],
        chefSecret: "A untuosidade da batata assada nas cinzas funde-se perfeitamente com as notas defumadas do bacon e a cremosidade do alho gourmet."
      },
      brunch: {
        name: "Hash Browns de Batata com Molho de Alho Dubola e Ovo Pochê",
        prepTime: "20 minutos",
        difficulty: "Média",
        servings: "2 porções",
        ingredients: [
          "2 batatas médias raladas finas",
          "2 ovos caipiras frescos",
          "4 colheres de sopa de Maionese Dubola Sabor Alho",
          "Manteiga para dourar",
          "Sal e pimenta preta"
        ],
        steps: [
          "Rale as batatas cruas, esprema com força em um pano limpo para extrair toda a água residual.",
          "Misture com sal e frite na manteiga em formato de panquecas redondas em fogo médio até dourar os dois lados.",
          "Prepare dois ovos pochê em água fervente com vinagre por 3 minutos.",
          "Posicione as hash browns crocantes nos pratos de brunch, cubra com o ovo pochê.",
          "Finalize aplicando um fio escultural de Maionese Dubola Sabor Alho ao redor e sirva quente."
        ],
        chefSecret: "A quebra da gema mole do ovo pochê derramando-se sobre a hash brown crocante e a maionese de alho cria o molho de brunch mais nobre possível."
      }
    }
  },
  tradicional: {
    peixe: {
      romantico: {
        name: "Lombo de Bacalhau Confitado ao Perfume de Azeite Extra Virgem e Emulsão Ouro Tradicional Dubola",
        prepTime: "30 minutos",
        difficulty: "Média",
        servings: "2 porções",
        ingredients: [
          "2 lombos de bacalhau dessalgado premium (220g cada)",
          "4 colheres de sopa de Maionese Dubola Tradicional",
          "300ml de azeite de oliva extra virgem",
          "2 dentes de alho esmagados com casca",
          "1 ramo de tomilho fresco",
          "Raspas de 1/2 limão siciliano"
        ],
        steps: [
          "Coloque os lombos de bacalhau em uma panela pequena e cubra totalmente com o azeite de oliva. Adicione o alho e o tomilho.",
          "Leve ao fogo mínimo (técnica confit). O azeite não deve fritar, apenas borbulhar levemente (cerca de 70°C) por 15-18 minutos até as pétalas começarem a se separar.",
          "Retire o bacalhau do azeite com cuidado e escorra.",
          "Disponha o bacalhau confitado em pratos aquecidos.",
          "Coroe com uma quenelle rica de Maionese Tradicional Dubola fria, finalizando com as raspas de limão siciliano sobre a maionese.",
          "Sirva imediatamente com batatas ao murro."
        ],
        chefSecret: "A textura aveludada do bacalhau confitado é realçada pela consistência de ouro da nossa Maionese Tradicional, criando uma fusão purista inesquecível."
      },
      almoco: {
        name: "Filé de Tilápia Grelhado com Emulsão Cítrica Tradicional Dubola",
        prepTime: "15 minutos",
        difficulty: "Fácil",
        servings: "2 porções",
        ingredients: [
          "2 filés de tilápia fresca",
          "3 colheres de sopa de Maionese Dubola Tradicional",
          "Suco de 1/2 limão taiti",
          "1 colher de sopa de azeite",
          "Sal e pimenta preta"
        ],
        steps: [
          "Tempere os filés de tilápia com sal, pimenta preta e suco de limão.",
          "Aqueça o azeite em uma frigideira antiaderente. Grelhe o peixe por 3 minutos de um lado até dourar.",
          "Vire e grelhe por mais 2 minutos.",
          "Transfira os filés quentes para o prato e cubra-os imediatamente com uma camada uniforme de Maionese Tradicional Dubola.",
          "Deixe descansar por 30 segundos enquanto a maionese amacia com o calor residual do filé."
        ],
        chefSecret: "A Maionese Tradicional derrete levemente sobre a tilápia recém-grelhada, agindo como um molho aveludado instantâneo de limão e ovos."
      },
      churrasco: {
        name: "Salmão Grelhado na Brasa com Molho Tradicional Dubola de Ervas Verdes",
        prepTime: "25 minutos",
        difficulty: "Média",
        servings: "4 porções",
        ingredients: [
          "1kg de filé de salmão inteiro com pele",
          "1 pote de Maionese Dubola Tradicional",
          "1 xícara de ervas frescas picadas (salsinha, cebolinha, coentro e hortelã)",
          "Sal grosso triturado e azeite"
        ],
        steps: [
          "Tempere a carne do salmão com sal grosso e pincele a pele com azeite.",
          "Leve à churrasqueira com a pele voltada para baixo, assando em brasa média por 15 minutos até a pele ficar crocante.",
          "Vire o filé com cuidado para assar a carne por mais 5 minutos.",
          "Em um bowl, misture a Maionese Tradicional Dubola com a xícara de ervas verdes frescas picadas.",
          "Retire o peixe da brasa e sirva fatiado cobrindo com o molho tradicional de ervas."
        ],
        chefSecret: "As ervas frescas colhidas cortam a riqueza lipídica do salmão e da maionese, gerando um equilíbrio de frescor ideal para a brasa."
      },
      brunch: {
        name: "Toast Benedict com Gravlax de Salmão e Maionese Tradicional Ouro Dubola",
        prepTime: "12 minutos",
        difficulty: "Média",
        servings: "2 porções",
        ingredients: [
          "2 fatias de pão brioche ou muffin inglês",
          "100g de salmão defumado",
          "2 ovos caipiras pochê",
          "4 colheres de sopa de Maionese Dubola Tradicional",
          "1 colher de chá de suco de limão siciliano e raspas"
        ],
        steps: [
          "Toste as fatias de brioche na manteiga.",
          "Prepare dois ovos pochê mantendo a gema ultra líquida.",
          "Em uma tigelinha, misture a Maionese Tradicional Dubola com o suco de limão siciliano para afinar a emulsão aveludada.",
          "Disponha o salmão defumado sobre os brioches tostados, coloque o ovo pochê por cima.",
          "Nape generosamente com o molho holandês rápido feito de maionese tradicional cítrica."
        ],
        chefSecret: "A nossa Maionese Tradicional atua como um atalho genial para o molho holandês clássico, oferecendo estabilidade e sabor rico sem o risco de desandar."
      }
    },
    burguer: {
      romantico: {
        name: "Double Cheese Premium com Emmenthal Derretido & Emulsão de Ouro Dubola",
        prepTime: "20 minutos",
        difficulty: "Média",
        servings: "2 porções",
        ingredients: [
          "2 blends de fraldinha e acém de 160g cada",
          "100g de queijo emmenthal ralado",
          "2 pães de brioche amanteigados",
          "4 colheres de sopa de Maionese Dubola Tradicional",
          "Sal marinho e pimenta-do-reino moída"
        ],
        steps: [
          "Grelhe as carnes na chapa bem quente por 3 minutos de um lado. Tempere ao virar.",
          "Adicione o queijo emmenthal sobre cada blend, abafe com tampa e deixe fundir até derreter em fios.",
          "Toste os pães brioche na chapa com manteiga noisette.",
          "Passe uma generosa camada de Maionese Tradicional Dubola nas duas metades do pão.",
          "Disponha a carne com queijo derretido, feche e sirva imediatamente para a explosão de sabor umami."
        ],
        chefSecret: "A simplicidade de uma maionese tradicional de ouro realça o sabor primário da carne grelhada e as notas amendoadas do queijo emmenthal derretido."
      },
      almoco: {
        name: "Classic Cheeseburger Rápido de Almoço com Maionese Tradicional",
        prepTime: "10 minutos",
        difficulty: "Fácil",
        servings: "1 porção",
        ingredients: [
          "1 blend de carne bovina (120g)",
          "1 fatia de queijo cheddar inglês",
          "1 pão brioche macio",
          "3 colheres de sopa de Maionese Dubola Tradicional",
          "Fatias de tomate fresco e sal"
        ],
        steps: [
          "Grelhe o blend bovino em chapa quente por 3 minutos de um lado.",
          "Vire o hambúrguer, adicione o cheddar inglês por cima e deixe derreter.",
          "Toste o pão rapidamente. Passe a Maionese Tradicional Dubola na base e no topo do pão.",
          "Monte posicionando a rodela de tomate fresco, a carne com cheddar derretido e feche."
        ],
        chefSecret: "Uma boa maionese tradicional une a umidade do tomate com o queijo fundido, amarrando a mordida perfeitamente."
      },
      churrasco: {
        name: "Burger Prensado na Brasa com Cebola Grelhada e Molho Tradicional Dubola",
        prepTime: "25 minutos",
        difficulty: "Média",
        servings: "4 porções",
        ingredients: [
          "4 blends de carne moída de 150g cada",
          "4 fatias de queijo cheddar",
          "2 cebolas cortadas em rodelas grossas",
          "1 pote de Maionese Dubola Tradicional",
          "Sal e pimenta"
        ],
        steps: [
          "Grelhe as rodelas de cebola na churrasqueira até ficarem douradas e doces.",
          "Leve os hambúrgueres à grelha forte por 3 minutos. Vire as carnes, salpique sal e cubra com o queijo.",
          "Toste os pães na grelha.",
          "Misture a cebola grelhada picada com a Maionese Tradicional Dubola para criar um molho de cebola rústico.",
          "Espalhe a maionese de cebola nos pães, coloque o burger defumado e sirva quente."
        ],
        chefSecret: "O calor da cebola grelhada se funde com a Maionese Tradicional, liberando açúcares que harmonizam com o sabor do carvão."
      },
      brunch: {
        name: "Breakfast Sandwich de Bacon e Ovo Frito com Maionese Tradicional Dubola",
        prepTime: "15 minutos",
        difficulty: "Fácil",
        servings: "2 porções",
        ingredients: [
          "2 pães brioche redondos ou croissant",
          "4 fatias de bacon crocante",
          "2 ovos caipiras",
          "4 colheres de sopa de Maionese Dubola Tradicional",
          "Sal e pimenta"
        ],
        steps: [
          "Frite as fatias de bacon na frigideira até ficarem douradas e ultra crocantes. Escorra.",
          "Na gordura do bacon, frite os ovos mantendo a gema mole e a clara perfeitamente cozida.",
          "Abra os pães e doure levemente.",
          "Passe a Maionese Tradicional Dubola generosamente nos dois lados do pão.",
          "Monte aplicando o bacon crocante, o ovo frito por cima e feche com delicadeza."
        ],
        chefSecret: "A Maionese Tradicional age como um lubrificante de sabor rico que contrasta com a textura crocante e salgada das fatias de bacon."
      }
    },
    camarao: {
      romantico: {
        name: "Camarões ao Sauté com Azeite de Alecrim e Emulsão Tradicional Ouro Dubola",
        prepTime: "18 minutos",
        difficulty: "Média",
        servings: "2 porções",
        ingredients: [
          "400g de camarões limpos tamanho médio-alto",
          "4 colheres de sopa de Maionese Dubola Tradicional",
          "1 colher de sopa de manteiga sem sal gelada",
          "Fio de azeite extra virgem",
          "Sal e pimenta-do-reino moída na hora"
        ],
        steps: [
          "Seque os camarões com papel toalha e tempere levemente com sal.",
          "Aqueça o azeite em fogo alto. Salteie os camarões por exatamente 90 segundos de um lado até dourarem. Vire e grelhe por 60 segundos.",
          "Desligue o fogo imediatamente.",
          "Incorpore a Maionese Tradicional Dubola e a manteiga gelada na frigideira morna fora do fogo direto, mexendo sem parar.",
          "Observe a emulsão de ovos e manteiga cobrir os camarões com um glacê aveludado e sirva quente."
        ],
        chefSecret: "A nossa Maionese Tradicional serve de base estável para re-emulsionar com a manteiga gelada sob calor residual, oferecendo um brilho espetacular."
      },
      almoco: {
        name: "Stir-Fry Rápido de Camarão com Brócolis e Molho Tradicional",
        prepTime: "12 minutos",
        difficulty: "Fácil",
        servings: "2 porções",
        ingredients: [
          "300g de camarões médios limpos",
          "1 xícara de flores de brócolis cozidas al dente",
          "3 colheres de sopa de Maionese Dubola Tradicional",
          "1 colher de sopa de azeite e sal"
        ],
        steps: [
          "Aqueça o azeite na frigideira e salteie o brócolis por 2 minutos.",
          "Adicione os camarões e cozinhe em fogo alto por 3 minutos até ficarem rosados.",
          "Abaixe o fogo para o mínimo.",
          "Misture a Maionese Tradicional Dubola rapidamente por 20 segundos para criar um molho branco aveludado envolvendo o prato.",
          "Transfira para os pratos de almoço."
        ],
        chefSecret: "A simplicidade da maionese tradicional preserva a doçura marinha dos camarões e as notas crocantes dos brócolis frescos."
      },
      churrasco: {
        name: "Camarões Gigantes na Brasa com Casca e Dip Tradicional Dubola",
        prepTime: "20 minutes",
        difficulty: "Média",
        servings: "4 porções",
        ingredients: [
          "600g de camarões gigantes inteiros com casca",
          "1 pote de Maionese Dubola Tradicional",
          "Suco de 1 limão siciliano",
          "Sal grosso e azeite"
        ],
        steps: [
          "Tempere os camarões com sal grosso e azeite.",
          "Arrume-os na grelha dupla da churrasqueira sobre brasa forte por 2 minutos de cada lado até as cascas tostarem.",
          "Retire, esprema o suco de limão siciliano por cima das cascas ainda fumegantes.",
          "Sirva com um pote de Maionese Tradicional Dubola fresca para descascar e passar na hora."
        ],
        chefSecret: "A casca carbonizada na brasa adiciona notas defumadas que são ressaltadas pelo creme puro e estável da maionese tradicional."
      },
      brunch: {
        name: "Brioche Toast de Ovos Mexidos Cremosos, Camarão e Maionese Tradicional Dubola",
        prepTime: "15 minutos",
        difficulty: "Média",
        servings: "2 porções",
        ingredients: [
          "2 fatias grossas de pão brioche",
          "150g de camarões cozidos e resfriados",
          "3 ovos caipiras caipiras",
          "4 colheres de sopa de Maionese Dubola Tradicional",
          "Manteiga e sal de cozinha"
        ],
        steps: [
          "Toste as fatias de brioche na frigideira com manteiga até dourarem.",
          "Refogue os camarões rapidamente por 1 minuto na chapa.",
          "Em fogo baixo, cozinhe os ovos batidos com manteiga, mexendo sem parar para mantê-los úmidos e cremosos.",
          "Espalhe a Maionese Tradicional Dubola na base das torradas.",
          "Arrume os ovos mexidos cremosos sobre as torradas e decore com os camarões quentes."
        ],
        chefSecret: "A Maionese Tradicional e os ovos mexidos cremosos têm a mesma afinidade química de emulsão de gemas, resultando em uma textura incrivelmente sedosa."
      }
    },
    cogumelos: {
      romantico: {
        name: "Cogumelos Paris Flambados ao Conhaque com Base Ouro Tradicional Dubola",
        prepTime: "18 minutos",
        difficulty: "Média",
        servings: "2 porções",
        ingredients: [
          "300g de cogumelos Paris frescos cortados ao meio",
          "4 colheres de sopa de Maionese Dubola Tradicional",
          "30ml de Conhaque de boa qualidade",
          "1 colher de sopa de manteiga sem sal",
          "Sal marinho, tomilho e fio de azeite"
        ],
        steps: [
          "Limpe os cogumelos com pano úmido e corte-os ao meio.",
          "Aqueça a frigideira com azeite e manteiga e doure os cogumelos por 4 minutos até caramelizarem.",
          "Despeje o conhaque na frigideira e incline de leve para pegar fogo (flambar) com segurança. Deixe as chamas cessarem.",
          "Tempere com sal e folhas de tomilho fresco.",
          "Desligue o fogo. Adicione a Maionese Tradicional Dubola e misture rapidamente, deixando a maionese incorporar os sucos flambados do cogumelo.",
          "Sirva imediatamente quente com torradas."
        ],
        chefSecret: "Flambar os cogumelos com conhaque elimina o álcool deixando aromas doces que enriquecem a emulsão de ovos caipiras da maionese."
      },
      almoco: {
        name: "Sauté Seco de Cogumelos Shimeji com Maionese Tradicional",
        prepTime: "10 minutos",
        difficulty: "Fácil",
        servings: "2 porções",
        ingredients: [
          "200g de cogumelos Shimeji desfeitos",
          "3 colheres de sopa de Maionese Dubola Tradicional",
          "Fio de azeite e pitada de sal"
        ],
        steps: [
          "Aqueça a frigideira vazia até ficar muito quente.",
          "Coloque os cogumelos Shimeji desfeitos e toste a seco por 3 minutos sem mexer para extrair a umidade.",
          "Adicione o azeite e o sal, salteando por mais 2 minutos.",
          "Reduza o fogo, adicione a Maionese Tradicional Dubola.",
          "Mexa rapidamente por 20 segundos para envolver e sirva quente."
        ],
        chefSecret: "O shimeji tostado sem gordura adquire notas amendoadas que harmonizam com o sabor purista da maionese tradicional de gema."
      },
      churrasco: {
        name: "Espetinho de Portobello e Pimentão na Brasa com Creme Tradicional Dubola",
        prepTime: "25 minutos",
        difficulty: "Média",
        servings: "4 porções",
        ingredients: [
          "4 cogumelos Portobello cortados em quatro",
          "1 pimentão vermelho cortado em cubos grandes",
          "1 pote de Maionese Dubola Tradicional",
          "Azeite, sal e orégano fresco"
        ],
        steps: [
          "Monte os pedaços de Portobello intercalados com o pimentão vermelho em espetos.",
          "Pincele azeite e salpique sal e orégano.",
          "Leve à grelha da churrasqueira por 4 minutos de cada lado até os vegetais murcharem e tostarem levemente.",
          "Retire do fogo e sirva os espetos quentes acompanhados da Maionese Tradicional Dubola como dip."
        ],
        chefSecret: "A doçura natural do pimentão assado e a textura carnuda do Portobello encontram o par ideal no creme tradicional estável de Dubola."
      },
      brunch: {
        name: "Avocado Toast com Cogumelos Paris Salteados e Maionese Tradicional Dubola",
        prepTime: "12 minutos",
        difficulty: "Fácil",
        servings: "2 porções",
        ingredients: [
          "2 fatias de pão rústico de sourdough tostado",
          "1 abacate maduro amassado com sal e limão",
          "150g de cogumelos Paris fatiados refogados",
          "4 colheres de sopa de Maionese Dubola Tradicional"
        ],
        steps: [
          "Toste os pães sourdough com azeite na chapa.",
          "Espalhe o abacate amassado de forma uniforme nas torradas.",
          "Arrume os cogumelos Paris fatiados refogados por cima do abacate.",
          "Finalize aplicando uma colher de sopa de Maionese Tradicional Dubola no topo de cada toast.",
          "Salpique pimenta preta moída na hora e sirva."
        ],
        chefSecret: "A gordura vegetal do abacate e a gordura animal da Maionese Tradicional se unem na boca, suavizadas pelo sabor terroso do cogumelo Paris."
      }
    },
    batatas: {
      romantico: {
        name: "Mil-Folhas de Batata Crocante com Parmesão & Emulsão de Ouro Dubola",
        prepTime: "40 minutos",
        difficulty: "Média",
        servings: "2 porções",
        ingredients: [
          "3 batatas médias cortadas em lâminas ultra-finas (no mandolim)",
          "4 colheres de sopa de Maionese Dubola Tradicional",
          "50g de queijo parmesão ralado fino",
          "Manteiga derretida, sal e tomilho fresco"
        ],
        steps: [
          "Corte as batatas em lâminas ultra finas no mandolim. Lave e seque bem.",
          "Misture as lâminas com a manteiga derretida, sal e tomilho.",
          "Empilhe as lâminas de batata em uma forma pequena forrada com papel manteiga, pressionando bem.",
          "Asse em forno a 180°C por 35 minutos até assar o centro e dourar as bordas superiores.",
          "Desenforme, corte em cubos perfeitos, salpique queijo parmesão e sirva com quenelles de Maionese Tradicional Dubola."
        ],
        chefSecret: "A compactação das lâminas de batata cria uma textura parecida com massa folhada que derrete na boca com a maionese tradicional."
      },
      almoco: {
        name: "Batata Frita Rústica Crocante com Dip Tradicional Ouro Dubola",
        prepTime: "20 minutos",
        difficulty: "Fácil",
        servings: "2 porções",
        ingredients: [
          "3 batatas médias cortadas em palito",
          "1 pote de Maionese Dubola Tradicional",
          "1 colher de sopa de azeite e sal marinho"
        ],
        steps: [
          "Corte as batatas em palitos grossos. Ferva em água com sal por 5 minutos.",
          "Escorra e seque completamente.",
          "Regue com azeite e sal, levando à Air-Fryer a 200°C por 18 minutos até dourarem.",
          "Sirva as batatas bem quentes acompanhadas do dip fresco de Maionese Tradicional Dubola."
        ],
        chefSecret: "O clássico mundial inabalável: batata crocante e maionese pura de ovos caipiras, elevado pelo frescor de Dubola."
      },
      churrasco: {
        name: "Batata Doce Assada no Rescaldo da Brasa com Maionese Tradicional",
        prepTime: "45 minutos",
        difficulty: "Média",
        servings: "4 porções",
        ingredients: [
          "4 batatas doces inteiras com casca",
          "1 pote de Maionese Tradicional Dubola",
          "Sal e pimenta"
        ],
        steps: [
          "Embrulhe as batatas doces temperadas com sal em papel alumínio.",
          "Enterre diretamente sob as cinzas quentes da churrasqueira por 40 minutos.",
          "Retire, remova o alumínio e corte longitudinalmente.",
          "Esmague a polpa adocicada e cremosa e incorpore a Maionese Tradicional Dubola quente."
        ],
        chefSecret: "A doçura natural da batata doce caramelizada na brasa ganha contraste sutil com a maionese tradicional de ouro."
      },
      brunch: {
        name: "Batata Rösti Suíça com Salmão Curado e Creme Tradicional Dubola",
        prepTime: "20 minutos",
        difficulty: "Média",
        servings: "2 porções",
        ingredients: [
          "2 batatas raladas grossas",
          "100g de salmão curado (ou defumado)",
          "4 colheres de sopa de Maionese Dubola Tradicional",
          "Manteiga para fritar, sal e noz-moscada"
        ],
        steps: [
          "Rale as batatas cruas, esprema com força em pano seco para retirar a água.",
          "Frite na manteiga até dourar os dois lados, formando uma panqueca crocante.",
          "Arrume as fatias de salmão curado por cima.",
          "Finalize aplicando a Maionese Tradicional Dubola gelada nas bordas e sirva."
        ],
        chefSecret: "A crocância rendada dos fios de batata frita e a untuosidade da maionese tradicional criam a base perfeita para o salmão nórdico."
      }
    }
  },
  tartaro: {
    peixe: {
      romantico: {
        name: "Salmão Selado com Crosta de Ervas Cítricas & Crema de Tártaro Dubola",
        prepTime: "25 minutos",
        difficulty: "Média",
        servings: "2 porções",
        ingredients: [
          "2 filés de salmão fresco (200g cada, com pele)",
          "4 colheres de sopa de Maionese Dubola Tártaro (o coração do prato)",
          "1 colher de sopa de manteiga de garrafa noisette",
          "Raspas finas de 1 limão siciliano orgânico",
          "Flor de sal marinho e pimenta-do-reino preta moída na hora",
          "1 ramo de salsinha fresca micro-picada",
          "Fio de azeite extra virgem de oliva"
        ],
        steps: [
          "Seque perfeitamente a pele do salmão com papel toalha e tempere com flor de sal e pimenta-do-reino moída na hora.",
          "Aqueça o azeite e a manteiga em fogo alto até começar a espumar. Coloque o salmão com a pele voltada para baixo. Pressione levemente por 30 segundos para garantir uma pele ultra crocante.",
          "Deixe grelhar por 4 minutos sem mover. Vire e grelhe por apenas mais 2 minutos para manter o centro suculento e rosado.",
          "Retire do fogo e deixe descansar por 1 minuto.",
          "Disponha os filés em pratos aquecidos. Coroe cada filé com uma quenelle escultural de Maionese Dubola Tártaro fria, salpicando por cima as raspas de limão siciliano e a salsinha fresca.",
          "Sirva imediatamente. O calor residual do salmão fundirá sutilmente a Maionese Tártaro, criando um molho aveludado inesquecível."
        ],
        chefSecret: "O choque térmico entre o salmão super quente e a Maionese Tártaro gelada ativa as notas cítricas e acentua a crocância dos picles nobres da nossa maionese!"
      },
      almoco: {
        name: "Grelhado Litorâneo Rápido com Banho Tártaro Dubola",
        prepTime: "15 minutos",
        difficulty: "Fácil",
        servings: "2 porções",
        ingredients: [
          "2 filés de peixe branco (pargo, pescada amarela ou tilápia)",
          "3 colheres de sopa de Maionese Dubola Tártaro",
          "Suco de 1/2 limão taiti",
          "1 colher de sopa de azeite",
          "Sal e pimenta preta moída"
        ],
        steps: [
          "Tempere os filés de peixe com sal, pimenta preta e o suco do limão taiti.",
          "Aqueça uma frigideira antiaderente com o azeite e grelhe o peixe por cerca de 3 minutos de cada lado até ficar levemente dourado.",
          "Transfira para o prato de servir.",
          "Cubra generosamente com a Maionese Dubola Tártaro, espalhando uma camada uniforme enquanto o filé ainda está fumegante.",
          "Acompanhe com arroz branco ou uma salada verde simples."
        ],
        chefSecret: "A Maionese Dubola Tártaro traz toda a complexidade de cebola roxa e picles que um peixe branco simples precisa para se transformar em prato de chef."
      },
      churrasco: {
        name: "Lombo de Tambaqui na Brasa Glaceado com Tártaro e Limão Caipira",
        prepTime: "30 minutos",
        difficulty: "Média",
        servings: "4 porções",
        ingredients: [
          "1kg de lombo ou banda de Tambaqui (ou outro peixe de couro)",
          "1 pote de Maionese Dubola Tártaro",
          "2 limões caipiras ou cravo",
          "Sal grosso triturado",
          "Pimenta-do-reino moída na hora"
        ],
        steps: [
          "Tempere o tambaqui com sal grosso triturado e suco de um limão caipira.",
          "Leve à grelha bem quente na churrasqueira, primeiro com a carne para baixo por 10 minutos, depois vire e asse com a pele para baixo por mais 15 minutos.",
          "Faltando 5 minutos para tirar da churrasqueira, pincele uma generosa camada de Maionese Dubola Tártaro sobre toda a superfície da carne.",
          "Deixe o calor da brasa caramelizar levemente a maionese, fundindo a textura cremosa com as notas defumadas.",
          "Retire, salpique raspas do segundo limão e sirva com fatias grelhadas de limão caipira."
        ],
        chefSecret: "O tártaro caramelizado na brasa cria uma crosta ácida e defumada inacreditável que harmoniza perfeitamente com peixes amazônicos untuosos."
      },
      brunch: {
        name: "Smørrebrød Nórdico de Salmão Defumado e Maionese Tártaro Dubola",
        prepTime: "12 minutos",
        difficulty: "Fácil",
        servings: "2 porções",
        ingredients: [
          "4 fatias de pão de centeio ou sourdough rústico",
          "150g de salmão defumado premium em fatias finas",
          "4 colheres de sopa cheias de Maionese Dubola Tártaro",
          "1 colher de chá de alcaparras lavadas",
          "Ramos de endro (dill) fresco",
          "Fatias ultra-finas de cebola roxa"
        ],
        steps: [
          "Toste levemente as fatias de pão de centeio ou sourdough.",
          "Espalhe 1 colher de sopa cheia de Maionese Dubola Tártaro sobre cada fatia, criando uma base rica e uniforme.",
          "Distribua as fatias de salmão defumado por cima de forma harmoniosa.",
          "Decore com fatias finas de cebola roxa, algumas alcaparras e ramos frescos de endro.",
          "Finalize com uma pitada de pimenta preta moída na hora."
        ],
        chefSecret: "A combinação clássica nórdica de salmão e endro atinge a perfeição com a crocância de picles que a Maionese Dubola Tártaro entrega."
      }
    },
    burguer: {
      romantico: {
        name: "Artisan Burger de Costela com Camembert Derretido e Maionese Tártaro Dubola",
        prepTime: "20 minutos",
        difficulty: "Média",
        servings: "2 porções",
        ingredients: [
          "2 blends de costela bovina de 150g cada",
          "100g de queijo camembert ou brie cortado em fatias",
          "2 pães australianos",
          "4 colheres de sopa de Maionese Dubola Tártaro",
          "1 cebola roxa caramelizada em fio de mel de engenho",
          "Sal e pimenta preta"
        ],
        steps: [
          "Grelhe os blends de costela em fogo bem alto por 3-4 minutos de cada lado. Tempere com sal e pimenta moída na hora ao virar.",
          "Adicione as fatias de queijo camembert sobre os burgers e abafe até derreter de forma sedosa.",
          "Toste o pão australiano cortado ao meio com um toque de manteiga.",
          "Disponha a cebola roxa caramelizada com mel de engenho na base do pão.",
          "Coloque o burger com queijo derretido e cubra generosamente com a Maionese Dubola Tártaro no topo.",
          "Feche e sirva imediatamente para uma experiência digna de bistrô francês."
        ],
        chefSecret: "O queijo camembert derretido e a acidez crocante do picles do tártaro equilibram a doçura da cebola roxa caramelizada, entregando o perfeito quinto sabor (umami)."
      },
      almoco: {
        name: "Double Smash Clássico de Almoço Express com Molho Tártaro",
        prepTime: "10 minutos",
        difficulty: "Fácil",
        servings: "1 porção",
        ingredients: [
          "2 burgers de 80g de carne bovina moída",
          "2 fatias de queijo prato ou cheddar",
          "1 pão de brioche",
          "3 colheres de sopa de Maionese Dubola Tártaro",
          "Sal e pimenta preta"
        ],
        steps: [
          "Aqueça uma chapa ou frigideira bem grossa de ferro em fogo máximo por 5 minutos.",
          "Posicione as duas bolas de carne geladas e esmague imediatamente com a espátula pesada até ficarem bem finas. Adicione sal e pimenta preta no topo.",
          "Grelhe por 90 segundos sem mexer para formar uma crosta escura. Vire os hambúrgueres, adicione o queijo prato no topo de cada um e empilhe.",
          "Toste o pão brioche amanteigado.",
          "Espalhe Maionese Tártaro Dubola em ambas as metades do pão, posicione o double smash derretido e feche."
        ],
        chefSecret: "O calor imediato do smash burger funde as notas herbáceas do tártaro, criando um molho untuoso e fresco sob a mordida."
      },
      churrasco: {
        name: "Premium Burger na Brasa com Provolone Defumado e Maionese Tártaro Dubola",
        prepTime: "25 minutos",
        difficulty: "Média",
        servings: "4 porções",
        ingredients: [
          "4 blends premium de fraldinha com gordura de peito de 160g cada",
          "4 fatias grossas de queijo provolone",
          "4 pães brioche",
          "1 pote de Maionese Dubola Tártaro",
          "Sal grosso triturado"
        ],
        steps: [
          "Grelhe as carnes na churrasqueira sobre calor direto forte por 4 minutos de um lado. Tempere com sal grosso triturado.",
          "Vire os hambúrgueres, coloque a fatia de queijo provolone e suba a grelha para fogo indireto médio por mais 3 minutos.",
          "Toste os pães de brioche na grelha até dourarem.",
          "Espalhe uma camada farta de Maionese Tártaro Dubola na base e no topo dos pães.",
          "Coloque o burger com provolone derretido e defumado e feche."
        ],
        chefSecret: "O caráter robusto do provolone defumado e a acidez fresca dos picles da Maionese Tártaro cortam a gordura rica do blend premium de fraldinha."
      },
      brunch: {
        name: "Egg & Sausage Biscuit com Aioli de Tártaro Dubola",
        prepTime: "15 minutos",
        difficulty: "Fácil",
        servings: "2 porções",
        ingredients: [
          "2 muffins ingleses ou biscuits amanteigados",
          "2 patties de linguiça artesanal suína (100g cada)",
          "2 ovos caipiras",
          "4 colheres de sopa de Maionese Dubola Tártaro",
          "1 colher de sopa de manteiga para os ovos"
        ],
        steps: [
          "Grelhe os patties de linguiça suína na chapa por 4 minutos de cada lado até dourarem por completo.",
          "Frite os ovos na manteiga, mantendo as gemas perfeitamente moles.",
          "Toste os muffins ingleses na frigideira com manteiga.",
          "Passe 1 colher de sopa cheia de Maionese Tártaro Dubola em cada metade do muffin.",
          "Monte os patties de linguiça, coloque o ovo frito com gema mole no topo e feche com cuidado."
        ],
        chefSecret: "O creme cítrico de tártaro e a gema morna do ovo escorrendo criam uma emulsão rica e ácida na boca."
      }
    },
    camarao: {
      romantico: {
        name: "Camarões Pistola no Sauté Rápido com Glacê de Tártaro Dubola & Páprica",
        prepTime: "18 minutos",
        difficulty: "Média",
        servings: "2 porções",
        ingredients: [
          "400g de camarões pistola limpos (com cauda)",
          "4 colheres de sopa de Maionese Dubola Tártaro",
          "1 colher de chá de páprica doce defumada",
          "1 colher de sopa de manteiga gelada",
          "Fio de azeite, sal e raspas de limão"
        ],
        steps: [
          "Seque os camarões com papel toalha e misture com sal e páprica defumada.",
          "Aqueça o azeite em fogo alto até quase fumegar. Salteie os camarões por 90 segundos de um lado. Vire e grelhe por 60 segundos.",
          "Desligue o fogo.",
          "Adicione a Maionese Dubola Tártaro e a manteiga gelada diretamente na frigideira quente fora do fogo direto.",
          "Mexa energicamente até cobrir os camarões com um glacê aveludado e sirva quente."
        ],
        chefSecret: "A Maionese Tártaro combinada com a manteiga gelada fora do fogo emulsiona sob o calor residual do crustáceo, criando um molho untuoso fantástico."
      },
      almoco: {
        name: "Salteado Litorâneo de Camarão e Abobrinha com Tártaro Dubola",
        prepTime: "12 minutos",
        difficulty: "Fácil",
        servings: "2 porções",
        ingredients: [
          "300g de camarões limpos tamanho médio",
          "1 abobrinha cortada em meias-luas",
          "3 colheres de sopa de Maionese Dubola Tártaro",
          "1 colher de sopa de azeite e pitada de sal"
        ],
        steps: [
          "Refogue a abobrinha com azeite por 3 minutos até amaciar.",
          "Adicione os camarões e salteie em fogo alto por mais 3 minutos.",
          "Assim que os camarões ficarem rosados, abaixe o fogo.",
          "Adicione a Maionese Dubola Tártaro, misturando bem por 30 segundos até envolver todos os ingredientes."
        ],
        chefSecret: "A abobrinha absorve os sucos marinhos que, ligados à acidez do tártaro, criam um molho instantâneo saboroso."
      },
      churrasco: {
        name: "Camarões Inteiros na Brasa com Dip de Tártaro Dubola",
        prepTime: "20 minutos",
        difficulty: "Média",
        servings: "4 porções",
        ingredients: [
          "600g de camarões grandes inteiros com casca",
          "1 pote de Maionese Dubola Tártaro",
          "Suco de 1 limão caipira",
          "Sal grosso e azeite"
        ],
        steps: [
          "Tempere os camarões com sal grosso e azeite.",
          "Arrume-os na grelha da churrasqueira sobre brasa forte por 2 minutos de cada lado até as cascas tostarem.",
          "Retire, esprema o suco do limão caipira por cima.",
          "Sirva quente acompanhado de uma tigela generosa de Maionese Dubola Tártaro para passar as carnes úmidas."
        ],
        chefSecret: "Grelhar com casca retém a suculência do camarão, e a maionese tártaro traz o contraponto cítrico necessário."
      },
      brunch: {
        name: "Shrimp Roll com Maionese Tártaro Dubola e Dill",
        prepTime: "15 minutos",
        difficulty: "Média",
        servings: "2 porções",
        ingredients: [
          "2 pães de brioche amanteigados para hot dog",
          "250g de camarões cozidos e resfriados",
          "4 colheres de sopa de Maionese Dubola Tártaro",
          "Ramos de endro (dill) e manteiga"
        ],
        steps: [
          "Toste as laterais dos pães brioche na manteiga.",
          "Em um bowl, misture os camarões resfriados com a Maionese Tártaro Dubola.",
          "Tempere com sal e pimenta moída a gosto.",
          "Recheie os pães com a salada de camarão e decore com ramos de dill fresco."
        ],
        chefSecret: "O contraste de temperaturas entre o brioche amanteigado quente e os camarões com tártaro gelado é espetacular."
      }
    },
    cogumelos: {
      romantico: {
        name: "Cogumelos Paris Flambados ao Conhaque com Crema de Tártaro Dubola",
        prepTime: "18 minutos",
        difficulty: "Média",
        servings: "2 porções",
        ingredients: [
          "300g de cogumelos Paris frescos cortados ao meio",
          "4 colheres de sopa de Maionese Dubola Tártaro",
          "30ml de Conhaque",
          "1 colher de sopa de manteiga sem sal",
          "Sal marinho, tomilho e fio de azeite"
        ],
        steps: [
          "Limpe os cogumelos com pano úmido e corte-os ao meio.",
          "Aqueça a frigideira com azeite e manteiga e doure os cogumelos por 4 minutos.",
          "Despeje o conhaque na frigideira e flambe com segurança. Deixe as chamas cessarem.",
          "Tempere com sal e folhas de tomilho.",
          "Desligue o fogo. Adicione a Maionese Tártaro Dubola e misture rapidamente, incorporando os sucos caramelizados do cogumelo Paris."
        ],
        chefSecret: "O conhaque deixa notas amadeiradas doces que realçam a acidez e as ervas finas da Maionese Tártaro."
      },
      almoco: {
        name: "Sauté Seco de Cogumelos Paris com Molho Tártaro Express",
        prepTime: "10 minutos",
        difficulty: "Fácil",
        servings: "2 porções",
        ingredients: [
          "200g de cogumelos Paris fatiados",
          "3 colheres de sopa de Maionese Dubola Tártaro",
          "Fio de azeite e sal"
        ],
        steps: [
          "Aqueça a frigideira até ficar bem quente.",
          "Coloque os cogumelos fatiados a seco por 3 minutos até soltarem a água.",
          "Adicione o azeite e o sal, salteando por mais 2 minutos.",
          "Reduza o fogo, adicione a Maionese Tártaro Dubola e sirva."
        ],
        chefSecret: "Tostar a seco primeiro impede o aspecto esponjoso do cogumelo, concentrando os açúcares para a emulsão cítrica."
      },
      churrasco: {
        name: "Cogumelos Portobello Recheados com Provolone e Tártaro na Brasa",
        prepTime: "25 minutos",
        difficulty: "Média",
        servings: "4 porções",
        ingredients: [
          "4 cogumelos Portobello grandes",
          "1 pote de Maionese Dubola Tártaro",
          "100g de queijo provolone ralado",
          "Azeite de oliva e sal"
        ],
        steps: [
          "Remova os talos e limpe os Portobellos.",
          "Pincele os chapéus externamente com azeite.",
          "Misture o queijo provolone ralado com 4 colheres de sopa de Maionese Tártaro Dubola.",
          "Recheie os cogumelos com a mistura cremosa.",
          "Leve à grelha da churrasqueira na parte média-alta por 15 minutos até gratinar."
        ],
        chefSecret: "O cogumelo assa no vapor sob a tampa cremosa de provolone e tártaro, derretendo no paladar."
      },
      brunch: {
        name: "Avocado Toast com Cogumelos Paris e Maionese Tártaro",
        prepTime: "12 minutos",
        difficulty: "Fácil",
        servings: "2 porções",
        ingredients: [
          "2 fatias de sourdough tostadas",
          "1 abacate amassado com limão e sal",
          "150g de cogumelos Paris refogados",
          "4 colheres de sopa de Maionese Dubola Tártaro"
        ],
        steps: [
          "Toste os pães com azeite.",
          "Espalhe o abacate amassado sobre os sourdough.",
          "Disponha os cogumelos refogados quentes.",
          "Coroe com colheradas generosas de Maionese Tártaro Dubola gelada."
        ],
        chefSecret: "A untuosidade natural do abacate e o frescor aromático do tártaro criam uma base espetacular para os cogumelos terrosos."
      }
    },
    batatas: {
      romantico: {
        name: "Batatas Hasselback Douradas com Manteiga de Ervas e Crema de Tártaro Dubola",
        prepTime: "40 minutos",
        difficulty: "Média",
        servings: "2 porções",
        ingredients: [
          "2 batatas inglesas médias",
          "4 colheres de sopa de Maionese Dubola Tártaro",
          "2 colheres de sopa de manteiga derretida com alecrim",
          "Flor de sal e pimenta moída",
          "Cebolete picada"
        ],
        steps: [
          "Fatie as batatas em lâminas finas de 2mm sem cortar a base.",
          "Pincele com manteiga derretida e asse a 200°C por 40 minutos.",
          "Retire do forno.",
          "Coloque colheradas de Maionese Tártaro Dubola gelada nos vãos das batatas quentes.",
          "Salpique cebolete por cima."
        ],
        chefSecret: "A batata quente derrete levemente a maionese cítrica nos vãos, equilibrando a crocância com a cremosidade."
      },
      almoco: {
        name: "Batata Frita Rústica Crocante com Dip Tártaro Dubola",
        prepTime: "20 minutos",
        difficulty: "Fácil",
        servings: "2 porções",
        ingredients: [
          "3 batatas médias cortadas em gomos",
          "1 pote de Maionese Dubola Tártaro",
          "1 colher de sopa de azeite e sal"
        ],
        steps: [
          "Corte as batatas em gomos e cozinhe em água por 5 minutos.",
          "Escorra e seque perfeitamente.",
          "Leve à Air-Fryer a 200°C por 18 minutos até dourar.",
          "Sirva quente com a Maionese Tártaro Dubola gelada."
        ],
        chefSecret: "Batatas rústicas com pele tostada casam perfeitamente com a acidez crocante de picles da maionese."
      },
      churrasco: {
        name: "Batata de Rescaldo Recheada com Tártaro Dubola & Crisp de Bacon",
        prepTime: "45 minutos",
        difficulty: "Média",
        servings: "4 porções",
        ingredients: [
          "4 batatas inglesas inteiras",
          "1 pote de Maionese Dubola Tártaro",
          "100g de bacon em cubos fritos e crocantes",
          "Sal grosso e papel alumínio"
        ],
        steps: [
          "Embrulhe as batatas lavadas com sal grosso em alumínio.",
          "Enterre sob as cinzas da churrasqueira por 40 minutos.",
          "Abra longitudinalmente.",
          "Esmague o miolo, misture com 2 colheres de Maionese Tártaro em cada uma e bacon crocante."
        ],
        chefSecret: "O bacon salgado e crocante contrasta de forma majestosa com a acidez fresca e textura cremosa do tártaro."
      },
      brunch: {
        name: "Hash Browns com Molho Tártaro Dubola e Ovo Pochê",
        prepTime: "20 minutos",
        difficulty: "Média",
        servings: "2 porções",
        ingredients: [
          "2 batatas médias raladas",
          "2 ovos caipiras frescos",
          "4 colheres de sopa de Maionese Dubola Tártaro",
          "Manteiga e sal"
        ],
        steps: [
          "Rale as batatas cruas, esprema em pano limpo para retirar a água.",
          "Frite na manteiga em formato de panquecas até dourar.",
          "Prepare dois ovos pochê (gema líquida) por 3 minutos.",
          "Arrume as hash browns crocantes, coloque o ovo pochê no topo e a Maionese Tártaro Dubola ao redor."
        ],
        chefSecret: "A gema morna líquida funde-se com a maionese cítrica, criando um creme único sobre a batata frita."
      }
    }
  }
};

const productsData = {
  alho: {
    id: 'alho',
    name: 'Sabor Alho',
    tagline: 'A Complexidade Aveludada do Alho Assado',
    desc: 'Uma maionese nobre que combina a intensidade do alho assado lentamente na casca com a acidez suave da cebola roxa caramelizada. Perfeita para elevar carnes vermelhas, sanduíches rústicos e o clássico pão de alho na grelha.',
    theme: {
      primary: '#7c3aed',
      secondary: '#6d28d9',
      glow: 'rgba(124, 58, 237, 0.15)',
      radialBg: 'from-[#1a082e] via-[#11051c] to-[#08020e]',
      border: 'border-violet-500/20',
      text: 'text-violet-400',
      badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
      btnGrad: 'from-[#7c3aed] to-[#5b21b6]',
      btnShadow: 'shadow-violet-600/20 hover:shadow-violet-600/40',
      hotspotColor: 'bg-violet-500 border-violet-300'
    },
    metrics: {
      intensity: 95,
      acidity: 40,
      creaminess: 90,
      sophistication: 88
    },
    hotspots: [
      { id: 'alho-assado', x: '21%', y: '74%', name: 'Alho Assado na Brasa', desc: 'Dentes de alho premium assados lentamente com casca em fogo brando até virarem uma pasta adocicada e aromática, sem o amargor do alho cru.' },
      { id: 'cebola-roxa', x: '13%', y: '70%', name: 'Cebola Roxa Caramelizada', desc: 'Fatias finas de cebola roxa selecionada, salteadas e caramelizadas suavemente para conferir uma nota adocicada de fundo e elegância visual.' },
      { id: 'alecrim-fresco', x: '7%', y: '79%', name: 'Alecrim Fresco', desc: 'Folhas frescas de alecrim liberando óleos essenciais que perfumam a emulsão com notas amadeiradas profundas e mediterrâneas.' }
    ],
    nutritional: {
      calories: '38 kcal',
      fat: '4.1 g',
      sodium: '72 mg',
      carb: '0.2 g',
      extra: 'Livre de Gorduras Trans'
    }
  },
  tradicional: {
    id: 'tradicional',
    name: 'Sabor Tradicional',
    tagline: 'A Emulsão Ouro Pura de Gemas Caipiras',
    desc: 'O ápice da maionese purista. Desenvolvida com gemas selecionadas de ovos caipiras, um toque sutil de limão siciliano orgânico e grãos de mostarda moídos na pedra. Uma consistência firme e aveludada incomparável que realça qualquer ingrediente nobre.',
    theme: {
      primary: '#2563eb',
      secondary: '#1d4ed8',
      glow: 'rgba(37, 99, 235, 0.15)',
      radialBg: 'from-[#08183a] via-[#051026] to-[#020617]',
      border: 'border-blue-500/20',
      text: 'text-blue-400',
      badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      btnGrad: 'from-[#2563eb] to-[#1e40af]',
      btnShadow: 'shadow-blue-600/20 hover:shadow-blue-600/40',
      hotspotColor: 'bg-blue-500 border-blue-300'
    },
    metrics: {
      intensity: 75,
      acidity: 55,
      creaminess: 98,
      sophistication: 92
    },
    hotspots: [
      { id: 'gemas-caipiras', x: '35%', y: '48%', name: 'Gemas de Ovos Caipiras', desc: 'Gemas selecionadas de aves criadas soltas, fornecendo coloração dourada natural e uma consistência incrivelmente sedosa e cremosa.' },
      { id: 'mostarda-pedra', x: '47%', y: '72%', name: 'Mostarda Moída na Pedra', desc: 'Sementes de mostarda esmagadas a frio na pedra, conferindo uma sutil complexidade aromática que amarra a acidez e as gorduras.' },
      { id: 'limao-siciliano', x: '57%', y: '76%', name: 'Toque de Limão Siciliano', desc: 'Suco fresco e raspas de limão siciliano premium, adicionando a nota cítrica essencial que limpa o paladar e equilibra a cremosidade.' }
    ],
    nutritional: {
      calories: '40 kcal',
      fat: '4.3 g',
      sodium: '68 mg',
      carb: '0.1 g',
      extra: 'Emulsão Ouro Estabilizada'
    }
  },
  tartaro: {
    id: 'tartaro',
    name: 'Sabor Tártaro',
    tagline: 'A Harmonia Cítrica com Picles e Ervas Finas',
    desc: 'Uma obra-prima refrescante que equilibra picles de pepino curados em vinagre aromático com cenouras baby glaceadas cortadas de forma ultra-fina e um buquê de endro e salsinha. Desenvolvida sob medida para salmão, burguers e frutos do mar.',
    theme: {
      primary: '#ea580c',
      secondary: '#d97706',
      glow: 'rgba(234, 88, 12, 0.15)',
      radialBg: 'from-[#2e0f05] via-[#1c0802] to-[#0d0300]',
      border: 'border-orange-500/20',
      text: 'text-orange-400',
      badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      btnGrad: 'from-[#ea580c] to-[#c2410c]',
      btnShadow: 'shadow-orange-600/20 hover:shadow-orange-600/40',
      hotspotColor: 'bg-orange-500 border-orange-300'
    },
    metrics: {
      intensity: 85,
      acidity: 78,
      creaminess: 88,
      sophistication: 95
    },
    hotspots: [
      { id: 'picles-premium', x: '67%', y: '80%', name: 'Picles Crocantes Premium', desc: 'Picles premium curados em conserva artesanal de vinagre aromático e sementes de mostarda. Trazem a acidez que corta a untuosidade de pratos ricos.' },
      { id: 'cenoura-baby', x: '49%', y: '80%', name: 'Cenouras Baby Glaceadas', desc: 'Cenouras baby cortadas de forma ultra-fina, adicionando uma textura crocante e um dulçor sutil totalmente orgânico.' },
      { id: 'azeitonas-verdes', x: '52%', y: '85%', name: 'Azeitonas Verdes Fatiadas', desc: 'Azeitonas verdes em fatias delicadas, agregando uma nota salgada e oleosa nobre que completa o buquê de temperos.' }
    ],
    nutritional: {
      calories: '36 kcal',
      fat: '3.9 g',
      sodium: '75 mg',
      carb: '0.3 g',
      extra: 'Com Picles Reais e Ervas Finas'
    }
  }
};

const extraOptions = [
  { id: 'Abacate', label: 'Abacate' },
  { id: 'Tomate Cereja', label: 'Tomate Cereja' },
  { id: 'Queijo Ralado', label: 'Queijo Ralado' },
  { id: 'Bacon Crocante', label: 'Bacon Crocante' },
  { id: 'Alecrim', label: 'Alecrim' },
  { id: 'Rúcula', label: 'Rúcula' },
  { id: 'Limão Siciliano', label: 'Limão Siciliano' },
  { id: 'Alcaparras', label: 'Alcaparras' }
];

export default function DubolaHomeView() {
  const [activeProduct, setActiveProduct] = useState('tartaro'); // 'alho' | 'tradicional' | 'tartaro'
  const [hoveredHotspot, setHoveredHotspot] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef(null);

  // Chef IA States
  const [selectedProtein, setSelectedProtein] = useState('peixe');
  const [selectedOccasion, setSelectedOccasion] = useState('romantico');
  const [recipeFlavor, setRecipeFlavor] = useState('tartaro');
  const [recipeState, setRecipeState] = useState('idle'); // 'idle' | 'loading' | 'ready'
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStepText, setLoadingStepText] = useState('');
  const [generatedRecipe, setGeneratedRecipe] = useState(null);

  // Chef IA Extras & Custom Inputs
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [customIngredient, setCustomIngredient] = useState('');

  const [viewMode, setViewMode] = useState('standard'); // 'standard' | 'masterclass'
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);

  const currentProduct = productsData[activeProduct];

  // Sync recipe flavor when active flavor switches (unless already in a generated state)
  useEffect(() => {
    if (recipeState !== 'ready') {
      setRecipeFlavor(activeProduct);
    }
  }, [activeProduct, recipeState]);

  // Track scroll position for parallax
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track mouse for radial hover glow
  const handleMouseMove = (e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  const handleToggleExtra = (extraId) => {
    if (selectedExtras.includes(extraId)) {
      setSelectedExtras(selectedExtras.filter(e => e !== extraId));
    } else {
      setSelectedExtras([...selectedExtras, extraId]);
    }
  };

  const handleGenerateRecipe = () => {
    setRecipeState('loading');
    setLoadingProgress(0);
    setLoadingStepText('Analisando harmonização gastronômica...');

    const steps = [
      { progress: 15, text: 'Verificando geladeira virtual e mapeando frescor...' },
      { progress: 35, text: `Mapeando assinatura química e textura da Maionese ${productsData[recipeFlavor].name}...` },
      { progress: 60, text: 'Selecionando técnicas renomadas de cocção para a proteína...' },
      { progress: 85, text: 'Personalizando emulsões e injetando segredos do chef...' },
      { progress: 100, text: 'Receita calibrada!' }
    ];

    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            const baseRecipe = recipesDatabase[recipeFlavor]?.[selectedProtein]?.[selectedOccasion] || recipesDatabase.tradicional.peixe.romantico;
            
            // Dynamic Composition Engine
            let recipe = JSON.parse(JSON.stringify(baseRecipe));
            
            // Assign professional technique dynamically
            const proteinTechs = techniquesMatrix[selectedProtein] || techniquesMatrix.peixe;
            recipe.technique = proteinTechs[selectedOccasion] || proteinTechs.romantico;
            
            // Parse custom inputs (separated by comma)
            const customIngredients = customIngredient
              ? customIngredient.split(',').map(item => item.trim()).filter(Boolean)
              : [];
              
            const allAdditions = [...selectedExtras, ...customIngredients];
            
            if (allAdditions.length > 0) {
              // 1. DYNAMIC TITLE IMPROVEMENT
              let additionsText = "";
              if (allAdditions.length === 1) {
                additionsText = allAdditions[0];
              } else {
                additionsText = allAdditions.slice(0, -1).join(', ') + ' & ' + allAdditions[allAdditions.length - 1];
              }
              
              if (recipe.name.includes(" ao Molho") || recipe.name.includes(" com Molho")) {
                recipe.name = recipe.name.replace(" ao Molho", ` com ${additionsText} ao Molho`);
                recipe.name = recipe.name.replace(" com Molho", ` com ${additionsText} e Molho`);
              } else {
                recipe.name = `${recipe.name} com Toque de ${additionsText}`;
              }
              
              // 2. DYNAMIC INGREDIENTS INJECTION
              allAdditions.forEach(addition => {
                const exists = recipe.ingredients.some(ing => ing.toLowerCase().includes(addition.toLowerCase()));
                if (!exists) {
                  recipe.ingredients.push(`${addition} fresco (selecionado no simulador)`);
                }
              });

              // 3. DYNAMIC STEPS INJECTION IN CHEF IA
              recipe.steps.splice(recipe.steps.length - 2, 0, `Incorpore com delicadeza o toque fresco de ${additionsText} à montagem, casando texturas.`);
            }

            setGeneratedRecipe(recipe);
            setRecipeState('ready');
            setViewMode('standard');
            setActiveStepIndex(0);
            setCompletedSteps([]);
          }, 400);
          return 100;
        }
        
        // Find appropriate text for current progress step
        const currentStep = steps.find(s => prev < s.progress);
        if (currentStep) {
          setLoadingStepText(currentStep.text);
        }
        
        return prev + 5;
      });
    }, 120);
  };

  const highlightDubola = (text) => {
    if (!text) return "";
    
    // Check which mayonnaise brand needs highlighting
    const brands = ["Maionese Dubola Tártaro", "Maionese Dubola Sabor Alho", "Maionese Dubola Tradicional", "Maionese Tártaro Dubola", "Maionese de Alho Dubola", "Maionese Tradicional Dubola"];
    
    let highlightedText = text;
    let foundBrand = null;
    
    for (const brand of brands) {
      if (text.includes(brand)) {
        foundBrand = brand;
        break;
      }
    }
    
    if (foundBrand) {
      const parts = text.split(foundBrand);
      let badgeColor = "text-orange-500 bg-orange-500/10 border-orange-500/35";
      if (foundBrand.toLowerCase().includes("alho")) {
        badgeColor = "text-violet-400 bg-violet-500/10 border-violet-500/35";
      } else if (foundBrand.toLowerCase().includes("tradicional")) {
        badgeColor = "text-blue-400 bg-blue-500/10 border-blue-500/35";
      }
      
      return (
        <span>
          {parts[0]}
          <span className={`font-extrabold border px-1.5 py-0.5 rounded shadow-[0_0_8px_rgba(255,255,255,0.02)] inline-block ${badgeColor}`}>
            {foundBrand}
          </span>
          {parts[1]}
        </span>
      );
    }
    return text;
  };

  const currentTheme = currentProduct.theme;

  return (
    <div 
      className={`min-h-screen bg-gradient-to-b ${currentTheme.radialBg} text-stone-100 font-sans antialiased overflow-x-hidden transition-all duration-700 ease-out`}
    >
      {/* Ambient Glows */}
      <div 
        className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[150px] pointer-events-none animate-pulse duration-[8000ms] transition-all duration-700"
        style={{ backgroundColor: currentTheme.glow }}
      ></div>
      <div className="absolute bottom-1/3 right-10 w-[500px] h-[500px] bg-stone-900/10 rounded-full blur-[160px] pointer-events-none"></div>

      {/* Header Navigation */}
      <header className="sticky top-0 z-50 bg-stone-950/85 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between transition-all duration-300">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 group">
            <div 
              className="w-9 h-9 rounded-xl bg-gradient-to-tr flex items-center justify-center text-white font-extrabold text-sm shadow-lg group-hover:scale-105 transition-all duration-500"
              style={{ 
                backgroundImage: `linear-gradient(to top right, ${currentTheme.primary}, ${currentTheme.secondary})`,
                boxShadow: `0 10px 15px -3px ${currentTheme.glow}`
              }}
            >
              D
            </div>
            <span className="font-black text-xl tracking-tight text-white group-hover:text-stone-300 transition-colors">DUBOLA</span>
            <span className={`text-[10px] border font-bold px-2 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline-block transition-colors duration-500 ${currentTheme.badge}`}>
              LINHA PREMIUM
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-stone-300">
          <a href="#hero" className="hover:text-white transition-colors">A Linha</a>
          <a href="#sabores" className="hover:text-white transition-colors">Sabores</a>
          <a href="#chef-ia" className="hover:text-white transition-colors flex items-center gap-1">
            <Sparkles size={13} className="text-stone-400 animate-pulse" /> Chef IA Multissabor
          </a>
          <a href="#comparativo" className="hover:text-white transition-colors">Comparativo</a>
        </nav>

        <div className="flex items-center gap-4">
          <Link 
            to="/" 
            className="text-xs font-bold text-stone-400 hover:text-white bg-white/5 hover:bg-white/10 border border-stone-800 hover:border-stone-700 px-4 py-2 rounded-xl transition-all"
          >
            Voltar ao Dashboard
          </Link>
          <a 
            href="#onde-comprar" 
            className="text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              backgroundImage: `linear-gradient(to right, ${currentTheme.primary}, ${currentTheme.secondary})`,
              boxShadow: `0 10px 15px -3px ${currentTheme.glow}`
            }}
          >
            ONDE COMPRAR
          </a>
        </div>
      </header>

      {/* HERO SECTION WITH INTERACTIVE GROUP IMAGE */}
      <section 
        id="hero" 
        ref={heroRef}
        onMouseMove={handleMouseMove}
        className="relative min-h-[95vh] flex items-center justify-center py-16 lg:py-24 px-6 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-20">
          
          {/* Left Column: Interactive Product Group Shot */}
          <div className="col-span-1 lg:col-span-6 flex flex-col items-center relative">
            
            {/* Split Glow background overlay behind active bottle area */}
            <div 
              className="absolute w-[280px] h-[400px] rounded-full blur-[100px] opacity-40 transition-all duration-700"
              style={{
                backgroundColor: currentTheme.primary,
                left: activeProduct === 'alho' ? '10%' : activeProduct === 'tradicional' ? '30%' : '50%',
                top: '20%'
              }}
            />

            {/* Gorgeous Frame for Group Picture */}
            <div className="relative w-full max-w-[540px] rounded-3xl overflow-hidden border border-white/10 bg-stone-950/40 p-2 shadow-2xl backdrop-blur-md">
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl">
                <img 
                  src="/maionese-linha.jpg" 
                  alt="Linha Completa de Maioneses Dubola"
                  className="w-full h-full object-cover transition-all duration-700 ease-in-out select-none"
                  style={{
                    transform: `scale(1.03) translateY(${scrollY * 0.05}px)`,
                    filter: activeProduct === 'alho' 
                      ? 'contrast(1.08) saturate(1.05) hue-rotate(-20deg)' 
                      : activeProduct === 'tradicional' 
                        ? 'contrast(1.05) saturate(1.03) hue-rotate(180deg)' 
                        : 'contrast(1.05) saturate(1.05)'
                  }}
                />
                
                {/* Product Area Highlights overlay */}
                <div 
                  className={`absolute inset-0 bg-violet-600/5 pointer-events-none transition-opacity duration-500 ${activeProduct === 'alho' ? 'opacity-100' : 'opacity-0'}`}
                />
                <div 
                  className={`absolute inset-0 bg-blue-600/5 pointer-events-none transition-opacity duration-500 ${activeProduct === 'tradicional' ? 'opacity-100' : 'opacity-0'}`}
                />
                <div 
                  className={`absolute inset-0 bg-orange-600/5 pointer-events-none transition-opacity duration-500 ${activeProduct === 'tartaro' ? 'opacity-100' : 'opacity-0'}`}
                />
              </div>

              {/* Dynamic Hotspots Rendered based on the active product */}
              {currentProduct.hotspots.map((spot) => (
                <div 
                  key={spot.id}
                  className="absolute"
                  style={{ left: spot.x, top: spot.y }}
                >
                  <button
                    onMouseEnter={() => setHoveredHotspot(spot.id)}
                    onMouseLeave={() => setHoveredHotspot(null)}
                    onClick={() => setHoveredHotspot(hoveredHotspot === spot.id ? null : spot.id)}
                    className={`w-6 h-6 rounded-full text-white border border-white/50 flex items-center justify-center font-bold text-xs animate-ping absolute pointer-events-none transition-colors duration-500 ${currentTheme.hotspotColor}`}
                  />
                  <button
                    onMouseEnter={() => setHoveredHotspot(spot.id)}
                    onMouseLeave={() => setHoveredHotspot(null)}
                    onClick={() => setHoveredHotspot(hoveredHotspot === spot.id ? null : spot.id)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shadow-2xl transition-all duration-300 relative border ${
                      hoveredHotspot === spot.id 
                        ? 'bg-white text-stone-980 scale-110 border-white' 
                        : 'text-white border-white/20 hover:scale-105'
                    }`}
                    style={{
                      backgroundColor: hoveredHotspot === spot.id ? '#ffffff' : currentTheme.primary,
                      color: hoveredHotspot === spot.id ? currentTheme.primary : '#ffffff'
                    }}
                  >
                    <Eye size={10} />
                  </button>

                  {/* Hotspot Card Overlay */}
                  <div 
                    className={`absolute -left-28 sm:left-8 -top-32 w-56 sm:w-64 bg-stone-900/98 backdrop-blur-xl border rounded-2xl p-4 shadow-2xl transition-all duration-300 pointer-events-none z-30 ${
                      hoveredHotspot === spot.id 
                        ? 'opacity-100 translate-y-0 scale-100' 
                        : 'opacity-0 translate-y-4 scale-95'
                    }`}
                    style={{ borderColor: currentTheme.primary + '50' }}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="p-1 rounded bg-white/5 text-white">
                        <Leaf size={12} className={currentTheme.text} />
                      </span>
                      <h4 className="text-xs font-bold text-white tracking-wide">{spot.name}</h4>
                    </div>
                    <p className="text-[10px] text-stone-300 leading-relaxed font-medium">
                      {spot.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Flavor Indicator Badge */}
            <div className="mt-4 flex items-center gap-2 bg-stone-950/60 border border-white/5 px-4 py-2 rounded-2xl backdrop-blur-md">
              <span className="w-2.5 h-2.5 rounded-full animate-pulse transition-colors duration-500" style={{ backgroundColor: currentTheme.primary }}></span>
              <p className="text-xs font-bold text-stone-300 uppercase tracking-widest">
                Mostrando ingredientes da <span className="text-white font-extrabold">{currentProduct.name}</span>
              </p>
            </div>
          </div>

          {/* Right Column: Editorial Marketing copy & active flavor tabs */}
          <div className="col-span-1 lg:col-span-6 flex flex-col justify-center space-y-6 text-left">
            
            {/* Dynamic Sabor Showcase Switcher Header */}
            <div className="flex items-center gap-2 p-1.5 bg-stone-950/80 border border-white/5 rounded-2xl w-fit">
              <button 
                onClick={() => setActiveProduct('alho')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-500 ${
                  activeProduct === 'alho' 
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/25' 
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Gourmet Alho
              </button>
              <button 
                onClick={() => setActiveProduct('tradicional')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-500 ${
                  activeProduct === 'tradicional' 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Tradicional Ouro
              </button>
              <button 
                onClick={() => setActiveProduct('tartaro')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-500 ${
                  activeProduct === 'tartaro' 
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/25' 
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Premium Tártaro
              </button>
            </div>

            <div className="space-y-3">
              <span className={`text-xs font-black uppercase tracking-widest transition-colors duration-500 ${currentTheme.text}`}>
                A Assinatura Gastronômica Dubola
              </span>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                Maionese Dubola <br />
                <span className="bg-gradient-to-r bg-clip-text text-transparent transition-all duration-500" style={{ backgroundImage: `linear-gradient(to right, #ffffff, ${currentTheme.primary})` }}>
                  {currentProduct.name}
                </span>
              </h1>
              <p className="text-base text-stone-300 leading-relaxed font-medium">
                {currentProduct.desc}
              </p>
            </div>

            {/* Flavor Characteristics Progress Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-stone-950/40 border border-white/5 rounded-3xl backdrop-blur-md">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] uppercase font-black text-stone-400 tracking-wider">
                  <span>Intensidade de Sabor</span>
                  <span className="text-white font-black">{currentProduct.metrics.intensity}%</span>
                </div>
                <div className="h-1.5 w-full bg-stone-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-700 ease-out" 
                    style={{ width: `${currentProduct.metrics.intensity}%`, backgroundColor: currentTheme.primary }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] uppercase font-black text-stone-400 tracking-wider">
                  <span>Acidez Perfeita</span>
                  <span className="text-white font-black">{currentProduct.metrics.acidity}%</span>
                </div>
                <div className="h-1.5 w-full bg-stone-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-700 ease-out" 
                    style={{ width: `${currentProduct.metrics.acidity}%`, backgroundColor: currentTheme.primary }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] uppercase font-black text-stone-400 tracking-wider">
                  <span>Cremosidade Ouro</span>
                  <span className="text-white font-black">{currentProduct.metrics.creaminess}%</span>
                </div>
                <div className="h-1.5 w-full bg-stone-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-700 ease-out" 
                    style={{ width: `${currentProduct.metrics.creaminess}%`, backgroundColor: currentTheme.primary }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] uppercase font-black text-stone-400 tracking-wider">
                  <span>Sofisticação de Receita</span>
                  <span className="text-white font-black">{currentProduct.metrics.sophistication}%</span>
                </div>
                <div className="h-1.5 w-full bg-stone-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-700 ease-out" 
                    style={{ width: `${currentProduct.metrics.sophistication}%`, backgroundColor: currentTheme.primary }}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <a 
                href="#chef-ia" 
                className="w-full sm:w-auto bg-white text-stone-950 hover:bg-stone-150 px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-2xl transition-all active:scale-[0.98]"
              >
                <Sparkles size={14} className="text-stone-900 fill-stone-900" />
                SIMULAR COM CHEF IA
              </a>
              
              <a 
                href="#onde-comprar" 
                className="w-full sm:w-auto text-center border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all"
              >
                COMPRAR AGORA
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* THREE PRODUCTS CARDS PRESENTATION SECTION */}
      <section id="sabores" className="py-24 px-6 relative border-t border-white/5 bg-stone-950/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-xs font-black text-stone-400 uppercase tracking-widest">
              Conheça as Variedades
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              A Triologia Gastronômica Dubola
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed font-medium">
              Três formulações impecáveis criadas sob o rigor culinário europeu, usando apenas ingredientes selecionados para proporcionar experiências únicas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Object.values(productsData).map((prod) => {
              const isActive = activeProduct === prod.id;
              
              return (
                <div 
                  key={prod.id}
                  onClick={() => setActiveProduct(prod.id)}
                  className={`cursor-pointer rounded-3xl p-8 border text-left flex flex-col justify-between h-[360px] transition-all duration-500 relative group overflow-hidden ${
                    isActive 
                      ? 'bg-stone-900/80 border-white/25 scale-[1.02] shadow-2xl' 
                      : 'bg-stone-950/50 border-white/5 hover:border-white/10 hover:scale-[1.01]'
                  }`}
                  style={{
                    boxShadow: isActive ? `0 10px 30px -5px ${prod.theme.glow}` : 'none'
                  }}
                >
                  {/* Subtle color flare on active */}
                  <div 
                    className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] pointer-events-none transition-opacity duration-500 ${isActive ? 'opacity-30' : 'opacity-0'}`}
                    style={{ backgroundColor: prod.theme.primary }}
                  />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-black uppercase tracking-widest border px-2 py-0.5 rounded-full ${prod.theme.badge}`}>
                        SABORIZADA
                      </span>
                      <Award size={16} className={isActive ? prod.theme.text : 'text-stone-600'} />
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-2xl font-black tracking-tight text-white group-hover:text-stone-300 transition-colors">
                        Dubola {prod.name}
                      </h3>
                      <p className="text-[11px] font-bold text-stone-400 italic">
                        {prod.tagline}
                      </p>
                    </div>

                    <p className="text-xs text-stone-300 leading-relaxed font-medium">
                      {prod.desc.slice(0, 140)}...
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/5 pt-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                      Explorar Receitas
                    </span>
                    <button 
                      className={`p-2 rounded-xl flex items-center justify-center transition-all ${
                        isActive 
                          ? 'text-white' 
                          : 'text-stone-600 bg-white/5 group-hover:text-white'
                      }`}
                      style={{ backgroundColor: isActive ? prod.theme.primary : 'transparent' }}
                    >
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* UNIVERSAL DYNAMIC CHEF IA RECEIPE SIMULATOR */}
      <section id="chef-ia" className="py-24 px-6 relative border-t border-white/5">
        <div className="max-w-4xl mx-auto space-y-12">
          
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-stone-900 border border-white/5 rounded-full">
              <Sparkles size={12} className="text-stone-400 animate-spin" />
              <span className="text-[10px] font-black uppercase tracking-widest text-stone-300">Inteligência Gastronômica</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Chef IA Dubola Premium
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 max-w-xl mx-auto font-medium">
              Combine proteínas nobres com técnicas culinárias de bistrô global e a maionese Dubola ideal. Aprenda a ciência por trás de cada selagem e regado com o Modo Masterclass.
            </p>
          </div>

          <div className="bg-stone-900/50 border border-white/5 rounded-3xl p-6 sm:p-8 space-y-8 backdrop-blur-md">
            
            {/* Step 1: Select Mayonnaise base */}
            <div className="space-y-3 text-left">
              <label className="text-[11px] font-black uppercase tracking-widest text-stone-400">
                1. Selecione a Maionese Base
              </label>
              <div className="grid grid-cols-3 gap-3">
                {Object.values(productsData).map((prod) => (
                  <button
                    key={prod.id}
                    onClick={() => setRecipeFlavor(prod.id)}
                    className={`p-3 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between ${
                      recipeFlavor === prod.id
                        ? 'bg-stone-900 border-white/20 font-bold scale-[1.01]'
                        : 'bg-stone-950/40 border-white/5 text-stone-400 hover:text-white'
                    }`}
                    style={{
                      boxShadow: recipeFlavor === prod.id ? `0 4px 12px -2px ${prod.theme.glow}` : 'none'
                    }}
                  >
                    <span className="text-[9px] font-bold text-stone-400 uppercase">Dubola</span>
                    <span className={`text-xs font-extrabold mt-1 ${recipeFlavor === prod.id ? 'text-white' : 'text-stone-400'}`}>
                      {prod.name.replace('Sabor ', '')}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Select Protein */}
            <div className="space-y-3 text-left">
              <label className="text-[11px] font-black uppercase tracking-widest text-stone-400">
                2. Selecione a Base / Proteína
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { id: 'peixe', label: 'Salmão / Peixe', icon: Fish },
                  { id: 'burguer', label: 'Burger Artesanal', icon: ChefHat },
                  { id: 'camarao', label: 'Camarão Nobre', icon: Zap },
                  { id: 'cogumelos', label: 'Cogumelos', icon: Leaf },
                  { id: 'batatas', label: 'Batata Rústica', icon: Coffee }
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = selectedProtein === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedProtein(item.id)}
                      className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 text-center transition-all ${
                        isSelected 
                          ? 'bg-stone-800 text-white font-bold border-white/20 scale-[1.02]' 
                          : 'bg-stone-950/40 border-white/5 text-stone-400 hover:text-white hover:bg-stone-900/30'
                      }`}
                    >
                      <Icon size={16} className={isSelected ? productsData[recipeFlavor].theme.text : 'text-stone-500'} />
                      <span className="text-[10px] tracking-wide font-extrabold">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Select Occasion */}
            <div className="space-y-3 text-left">
              <label className="text-[11px] font-black uppercase tracking-widest text-stone-400">
                3. Escolha a Ocasião
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'romantico', label: 'Jantar Romântico', desc: 'Técnicas Francesas' },
                  { id: 'almoco', label: 'Almoço Prático', desc: 'Rápido & Marcante' },
                  { id: 'churrasco', label: 'Braseiro de Churrasco', desc: 'Notas de Fumaça' },
                  { id: 'brunch', label: 'Brunch Sofisticado', desc: 'Texturas Úmidas' }
                ].map((item) => {
                  const isSelected = selectedOccasion === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedOccasion(item.id)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        isSelected 
                          ? 'bg-stone-800 text-white border-white/20 scale-[1.01]' 
                          : 'bg-stone-950/40 border-white/5 text-stone-400 hover:text-white hover:bg-stone-900/30'
                      }`}
                    >
                      <div className="text-[10px] font-extrabold">{item.label}</div>
                      <div className="text-[9px] text-stone-500 font-bold mt-0.5">{item.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 4: Extras & Custom inputs */}
            <div className="space-y-4 text-left border-t border-white/5 pt-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-stone-400">
                  4. Adicione Toques Extras
                </label>
                <div className="flex flex-wrap gap-2">
                  {extraOptions.map((opt) => {
                    const active = selectedExtras.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleToggleExtra(opt.id)}
                        className={`px-3 py-1.5 rounded-full border text-[10px] font-extrabold uppercase tracking-wider transition-all ${
                          active 
                            ? 'bg-white text-stone-950 border-white font-bold' 
                            : 'bg-stone-950/50 border-white/5 text-stone-400 hover:text-white'
                        }`}
                      >
                        {active && <Check size={8} className="inline mr-1 stroke-[4]" />}
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-stone-400">
                  Tem outro ingrediente na geladeira? Digite aqui:
                </label>
                <input 
                  type="text" 
                  value={customIngredient}
                  onChange={(e) => setCustomIngredient(e.target.value)}
                  placeholder="Ex: Cogumelo Trufado, Ervilha Torta, Cebola Roxa (separe por vírgula)"
                  className="w-full bg-stone-950/60 border border-white/5 focus:border-white/20 rounded-2xl px-4 py-3 text-xs text-white placeholder:text-stone-600 focus:outline-none focus:ring-1 focus:ring-white/10 transition-all font-medium"
                />
              </div>
            </div>

            {/* Action Trigger Button */}
            <button
              onClick={handleGenerateRecipe}
              disabled={recipeState === 'loading'}
              className="w-full text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 duration-500"
              style={{
                backgroundImage: `linear-gradient(to right, ${productsData[recipeFlavor].theme.primary}, ${productsData[recipeFlavor].theme.secondary})`,
                boxShadow: `0 10px 25px -5px ${productsData[recipeFlavor].theme.glow}`
              }}
            >
              <Sparkles size={14} className="animate-pulse" />
              {recipeState === 'loading' ? 'ANALISANDO COMBINAÇÕES...' : 'GERAR HARMONIZAÇÃO DE CHEF'}
            </button>

            {/* Simulated Loading Engine UI */}
            {recipeState === 'loading' && (
              <div className="space-y-3 animate-in fade-in duration-300">
                <div className="h-1.5 w-full bg-stone-950 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="h-full rounded-full transition-all duration-150 ease-out"
                    style={{ 
                      width: `${loadingProgress}%`,
                      backgroundImage: `linear-gradient(to right, ${productsData[recipeFlavor].theme.primary}, ${productsData[recipeFlavor].theme.secondary})`
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-[9px] uppercase font-black text-stone-400 tracking-wider">
                  <span>{loadingStepText}</span>
                  <span>{loadingProgress}%</span>
                </div>
              </div>
            )}

          </div>

          {/* Generated Recipe Presentation & Interactive Masterclass Dashboard */}
          {recipeState === 'ready' && generatedRecipe && (
            <div className="bg-stone-900 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 text-left animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-2xl relative overflow-hidden">
              
              {/* Soft Theme Background glow inside the recipe block */}
              <div 
                className="absolute -top-24 -left-24 w-64 h-64 rounded-full blur-[100px] opacity-15 pointer-events-none transition-all duration-500"
                style={{ backgroundColor: productsData[recipeFlavor].theme.primary }}
              />

              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-white/5 pb-5">
                <div className="space-y-1.5">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 border rounded-full ${productsData[recipeFlavor].theme.badge}`}>
                    Receita Calibrada com Dubola {productsData[recipeFlavor].name}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                    {generatedRecipe.name}
                  </h3>
                </div>

                {/* Sophistication Meter Card */}
                <div className="p-3 bg-stone-950/60 border border-white/5 rounded-2xl text-center sm:text-right shrink-0">
                  <div className="text-[8px] font-black text-stone-500 uppercase tracking-widest">
                    Termômetro de Sofisticação
                  </div>
                  <div className="flex items-center gap-2 mt-1 justify-center sm:justify-end">
                    <span className="text-xs font-black text-white">
                      {selectedOccasion === 'romantico' ? 'Bistrô Premium' : selectedOccasion === 'almoco' ? 'Gourmet Express' : selectedOccasion === 'churrasco' ? 'Estrela Brasa' : 'Brunch Rústico'}
                    </span>
                    <span className={`w-2 h-2 rounded-full`} style={{ backgroundColor: productsData[recipeFlavor].theme.primary }}></span>
                  </div>
                </div>
              </div>

              {/* View Mode Selectors: Standard List vs Chef Masterclass Step-by-Step */}
              <div className="flex items-center border-b border-white/5 pb-4">
                <button
                  onClick={() => setViewMode('standard')}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 -mb-[18px] ${
                    viewMode === 'standard'
                      ? 'border-white text-white'
                      : 'border-transparent text-stone-500 hover:text-stone-300'
                  }`}
                >
                  <BookOpen size={12} className="inline mr-1.5" />
                  Lista Clássica
                </button>
                <button
                  onClick={() => setViewMode('masterclass')}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 -mb-[18px] flex items-center ${
                    viewMode === 'masterclass'
                      ? 'text-white'
                      : 'border-transparent text-stone-500 hover:text-stone-300'
                  }`}
                  style={{ borderBottomColor: viewMode === 'masterclass' ? productsData[recipeFlavor].theme.primary : 'transparent' }}
                >
                  <ChefHat size={12} className="inline mr-1.5" style={{ color: viewMode === 'masterclass' ? productsData[recipeFlavor].theme.primary : 'inherit' }} />
                  Modo Masterclass do Chef
                </button>
              </div>

              {/* Standard List view mode */}
              {viewMode === 'standard' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-4 animate-in fade-in duration-300">
                  
                  {/* Left Column: Metadata & Ingredients */}
                  <div className="md:col-span-5 space-y-4">
                    <div className="flex items-center gap-4 text-xs font-bold text-stone-400 bg-stone-950/40 p-3 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>{generatedRecipe.prepTime}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Flame size={12} />
                        <span>{generatedRecipe.difficulty}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <UtensilsCrossed size={12} />
                        <span>{generatedRecipe.servings}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-widest text-stone-400">
                        Ingredientes Necessários
                      </h4>
                      <ul className="space-y-2">
                        {generatedRecipe.ingredients.map((ing, idx) => (
                          <li key={idx} className="text-xs text-stone-200 flex items-start gap-2 leading-relaxed">
                            <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: productsData[recipeFlavor].theme.primary }} />
                            <span>{highlightDubola(ing)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Right Column: Cooking steps & technique card */}
                  <div className="md:col-span-7 space-y-6">
                    
                    {/* Prestigious Culinary Technique Spotlight */}
                    <div className="p-5 bg-stone-950/60 border border-white/5 rounded-2xl relative overflow-hidden">
                      <div className="flex items-center gap-2 text-xs font-extrabold text-white mb-2">
                        <Award size={14} className={productsData[recipeFlavor].theme.text} />
                        <span>Técnica em Destaque: {generatedRecipe.technique.name}</span>
                      </div>
                      <p className="text-[11px] text-stone-300 leading-relaxed mb-3">
                        {generatedRecipe.technique.description}
                      </p>
                      
                      {/* Technique Physics/Chemistry Explanation */}
                      <div className="border-t border-white/5 pt-3 mt-3">
                        <div className="flex items-start gap-2">
                          <Lightbulb size={12} className="text-amber-500 mt-0.5 shrink-0" />
                          <div className="space-y-0.5 text-left">
                            <div className="text-[9px] uppercase font-black text-stone-400 tracking-wider">A Ciência na Panela</div>
                            <p className="text-[10px] text-stone-400 leading-relaxed">
                              {generatedRecipe.technique.science}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sequential Recipe Steps */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-stone-400">
                        Modo de Preparo Tradicional
                      </h4>
                      <ol className="space-y-3">
                        {generatedRecipe.steps.map((step, idx) => (
                          <li key={idx} className="text-xs text-stone-300 leading-relaxed flex gap-3 items-start">
                            <span className="font-extrabold text-white bg-stone-950 border border-white/10 w-5 h-5 rounded-md flex items-center justify-center shrink-0 text-[10px]">
                              {idx + 1}
                            </span>
                            <span>{highlightDubola(step)}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Chef Secret Box */}
                    <div className="p-4 border-l-2 border-amber-500 bg-amber-500/5 text-stone-300 rounded-r-xl">
                      <div className="text-[9px] font-black uppercase text-amber-500 tracking-wider flex items-center gap-1.5 mb-1">
                        <Info size={10} />
                        O Segredo do Chef
                      </div>
                      <p className="text-[11px] leading-relaxed italic">
                        "{generatedRecipe.chefSecret}"
                      </p>
                    </div>

                  </div>

                </div>
              )}

              {/* Interactive Chef Masterclass step-by-step view mode */}
              {viewMode === 'masterclass' && (
                <div className="pt-6 space-y-6 animate-in fade-in duration-300">
                  
                  {/* Technique Badge on Masterclass Header */}
                  <div className="p-4 bg-stone-950/60 border border-white/5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-0.5 text-left">
                      <div className="text-[8px] font-black text-stone-500 uppercase tracking-widest">
                        Técnica Principal Aprendida
                      </div>
                      <div className="text-xs font-black text-white">
                        {generatedRecipe.technique.name}
                      </div>
                    </div>
                    
                    {/* Mini technique glossary definition */}
                    <div className="flex items-center gap-2 border-l border-white/5 pl-4 shrink-0">
                      {Object.keys(generatedRecipe.technique.glossary || {}).map((term) => (
                        <div key={term} className="text-[9px] bg-white/5 border border-white/10 rounded-lg p-2 max-w-xs text-left">
                          <span className="font-black text-white block">{term}:</span>
                          <span className="text-stone-400 text-[8px] font-medium leading-tight block">{generatedRecipe.technique.glossary[term]}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Progress Indicator for steps */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-stone-950 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className="h-full rounded-full transition-all duration-300"
                        style={{ 
                          width: `${((activeStepIndex + 1) / generatedRecipe.steps.length) * 100}%`,
                          backgroundColor: productsData[recipeFlavor].theme.primary
                        }}
                      />
                    </div>
                    <span className="text-[9px] font-black text-stone-400 uppercase tracking-wider shrink-0">
                      Passo {activeStepIndex + 1} de {generatedRecipe.steps.length}
                    </span>
                  </div>

                  {/* Active Step Panel */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    
                    {/* Left: Step directions and Sensory Cues */}
                    <div className="md:col-span-8 bg-stone-950/40 border border-white/5 rounded-3xl p-6 space-y-6">
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">
                            Instrução de Execução
                          </span>
                          <button
                            onClick={() => {
                              if (completedSteps.includes(activeStepIndex)) {
                                setCompletedSteps(completedSteps.filter(s => s !== activeStepIndex));
                              } else {
                                setCompletedSteps([...completedSteps, activeStepIndex]);
                              }
                            }}
                            className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border ${
                              completedSteps.includes(activeStepIndex)
                                ? 'bg-green-500/10 border-green-500 text-green-400'
                                : 'bg-white/5 border-white/10 text-stone-400 hover:text-white'
                            }`}
                          >
                            {completedSteps.includes(activeStepIndex) ? (
                              <span className="flex items-center gap-1">
                                <Check size={10} /> Executado
                              </span>
                            ) : (
                              'Marcar Executado'
                            )}
                          </button>
                        </div>
                        <p className="text-sm text-stone-100 leading-relaxed font-bold">
                          {highlightDubola(generatedRecipe.steps[activeStepIndex])}
                        </p>
                      </div>

                      {/* Sensory Cues Grid */}
                      <div className="border-t border-white/5 pt-4 space-y-3">
                        <div className="text-[9px] font-black uppercase text-stone-400 tracking-wider flex items-center gap-1">
                          <Volume2 size={12} className={productsData[recipeFlavor].theme.text} />
                          Mapeamento Físico de Sentidos (O que esperar nesta etapa)
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="bg-stone-900/60 p-3 rounded-2xl border border-white/5">
                            <span className="text-[8px] font-black text-stone-500 uppercase block mb-1">Visual</span>
                            <p className="text-[10px] text-stone-300 leading-relaxed">
                              {generatedRecipe.technique.sensoryCues.visual}
                            </p>
                          </div>
                          <div className="bg-stone-900/60 p-3 rounded-2xl border border-white/5">
                            <span className="text-[8px] font-black text-stone-500 uppercase block mb-1">Som / Chiado</span>
                            <p className="text-[10px] text-stone-300 leading-relaxed">
                              {generatedRecipe.technique.sensoryCues.acoustic}
                            </p>
                          </div>
                          <div className="bg-stone-900/60 p-3 rounded-2xl border border-white/5">
                            <span className="text-[8px] font-black text-stone-500 uppercase block mb-1">Toque / Textura</span>
                            <p className="text-[10px] text-stone-300 leading-relaxed">
                              {generatedRecipe.technique.sensoryCues.tactile}
                            </p>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Right: Masterclass Science glossary & Chef Advice */}
                    <div className="md:col-span-4 space-y-4">
                      
                      {/* Molecular Science Block */}
                      <div className="bg-stone-950/60 border border-white/5 rounded-3xl p-5 space-y-2">
                        <div className="text-[9px] font-black uppercase text-amber-500 tracking-wider flex items-center gap-1">
                          <Lightbulb size={11} className="text-amber-500" />
                          Por que funciona? (A Ciência)
                        </div>
                        <p className="text-[10px] text-stone-300 leading-relaxed">
                          {generatedRecipe.technique.science}
                        </p>
                      </div>

                      {/* Chef Advice on flavor interaction */}
                      <div className="bg-stone-950/40 border border-white/5 rounded-3xl p-5 space-y-2">
                        <div className="text-[9px] font-black uppercase text-stone-400 tracking-wider">
                          Harmonização Culinária
                        </div>
                        <p className="text-[10px] text-stone-400 leading-relaxed italic">
                          "{generatedRecipe.chefSecret}"
                        </p>
                      </div>

                    </div>

                  </div>

                  {/* Masterclass controls */}
                  <div className="flex justify-between items-center border-t border-white/5 pt-4">
                    <button
                      onClick={() => setActiveStepIndex(Math.max(0, activeStepIndex - 1))}
                      disabled={activeStepIndex === 0}
                      className="px-4 py-2.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 text-xs font-bold text-white transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1.5"
                    >
                      <ArrowLeft size={13} />
                      Anterior
                    </button>

                    {activeStepIndex === generatedRecipe.steps.length - 1 ? (
                      <button
                        onClick={() => {
                          alert("Parabéns! Você concluiu a Masterclass Culinária Dubola. Agora é só empratar com orgulho!");
                          setViewMode('standard');
                        }}
                        className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all duration-500 hover:scale-[1.02]"
                        style={{
                          backgroundImage: `linear-gradient(to right, ${productsData[recipeFlavor].theme.primary}, ${productsData[recipeFlavor].theme.secondary})`
                        }}
                      >
                        <span className="flex items-center gap-1.5 justify-center">
                          <Check size={14} /> FINALIZAR MASTERCLASS
                        </span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (!completedSteps.includes(activeStepIndex)) {
                            setCompletedSteps([...completedSteps, activeStepIndex]);
                          }
                          setActiveStepIndex(activeStepIndex + 1);
                        }}
                        className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all duration-500 hover:scale-[1.02] flex items-center gap-1.5"
                        style={{
                          backgroundImage: `linear-gradient(to right, ${productsData[recipeFlavor].theme.primary}, ${productsData[recipeFlavor].theme.secondary})`
                        }}
                      >
                        Próximo Passo
                        <ArrowRight size={13} />
                      </button>
                    )}
                  </div>

                </div>
              )}

              {/* Back to specifications button */}
              <div className="flex justify-end pt-2 border-t border-white/5">
                <button
                  onClick={() => {
                    setGeneratedRecipe(null);
                    setRecipeState('idle');
                  }}
                  className="text-[9px] font-black uppercase text-stone-500 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <RotateCcw size={10} />
                  Calibrar Nova Receita
                </button>
              </div>

            </div>
          )}

        </div>
      </section>

      {/* TASTE & DETAILS COMPARATIVE TABLE */}
      <section id="comparativo" className="py-24 px-6 relative border-t border-white/5 bg-stone-950/40">
        <div className="max-w-4xl mx-auto space-y-16">
          <div className="text-center max-w-xl mx-auto space-y-4">
            <span className="text-xs font-black text-stone-400 uppercase tracking-widest">
              Análise Editorial Comparativa
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Tabela de Especificações
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed font-medium">
              Compare as características técnicas, notas de sabor de cada maionese e encontre a combinação ideal.
            </p>
          </div>

          <div className="rounded-3xl border border-white/5 bg-stone-950/80 p-1 overflow-hidden shadow-2xl backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/5 bg-stone-900/60">
                    <th className="p-4 font-black uppercase tracking-wider text-stone-400">Atributo Culinário</th>
                    {Object.values(productsData).map(prod => (
                      <th key={prod.id} className="p-4 font-black uppercase tracking-wider text-white">
                        Dubola {prod.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td className="p-4 font-extrabold text-stone-300">Base Lipídica</td>
                    <td className="p-4 text-stone-400 font-medium">Óleos Leves Selecionados</td>
                    <td className="p-4 text-stone-400 font-medium">Gemas Caipiras Ouro</td>
                    <td className="p-4 text-stone-400 font-medium">Conservas Aromáticas</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-extrabold text-stone-300">Assinatura de Acidez</td>
                    <td className="p-4 text-stone-400 font-medium">Suave Cebola Roxa</td>
                    <td className="p-4 text-stone-400 font-medium">Limão Siciliano Puro</td>
                    <td className="p-4 text-stone-400 font-medium">Vinagre de Picles Nobre</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-extrabold text-stone-300">Notas Aromáticas</td>
                    <td className="p-4 text-stone-400 font-medium">Alho Assado na Cinza & Alecrim</td>
                    <td className="p-4 text-stone-400 font-medium">Mostarda moída na pedra</td>
                    <td className="p-4 text-stone-400 font-medium">Pepinos crocantes, cenoura & dill</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-extrabold text-stone-300">Harmonização Estrela</td>
                    <td className="p-4 text-stone-400 font-medium">Fraldinha, Costela, Pão de Alho</td>
                    <td className="p-4 text-stone-400 font-medium">Burgers Clássicos, Mil-Folhas</td>
                    <td className="p-4 text-stone-400 font-medium">Salmão, Camarão Pistola, Peixes</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-extrabold text-stone-300">Calorias (por porção 12g)</td>
                    <td className="p-4 text-stone-400 font-medium">38 kcal</td>
                    <td className="p-4 text-stone-400 font-medium">40 kcal</td>
                    <td className="p-4 text-stone-400 font-medium">36 kcal</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-extrabold text-stone-300">Badges Culinários</td>
                    <td className="p-4 text-stone-400 font-medium">Sem Gorduras Trans</td>
                    <td className="p-4 text-stone-400 font-medium">Sem Glúten, Ovos Caipiras</td>
                    <td className="p-4 text-stone-400 font-medium">Livre de Corantes Artificiais</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* CONVERSION CALL-TO-ACTION SECTION */}
      <section id="onde-comprar" className="py-24 px-6 relative border-t border-white/5 bg-gradient-to-t from-stone-950 to-stone-900/10">
        <div className="max-w-2xl mx-auto text-center space-y-8 relative z-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
            <Store size={12} className={currentTheme.text} />
            <span className="text-[10px] font-black uppercase tracking-widest text-stone-300">Leve Para Sua Geladeira</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Experimente a Linha Completa
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-medium">
            Encontre a maionese Dubola mais próxima nas melhores redes de supermercados gourmet e empórios do país. Escale o sabor do seu dia a dia.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button 
              onClick={() => alert("Simulando compra da caixa de degustação com os 3 sabores!")}
              className="w-full sm:w-auto text-stone-950 bg-white hover:bg-stone-150 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-2xl active:scale-[0.98]"
            >
              COMPRAR KIT TRIO EXPERIÊNCIA
            </button>
            <button 
              onClick={() => alert("Localizando empórios gourmet próximos da sua localidade no Brasil...")}
              className="w-full sm:w-auto border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
            >
              ENCONTRAR EMPÓRIO PARCEIRO
            </button>
          </div>

          {/* Institutional footer elements */}
          <div className="pt-16 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-6 text-left">
            <div className="space-y-1">
              <span className="text-[9px] font-black text-stone-500 uppercase tracking-widest block">Sac Dubola</span>
              <span className="text-xs text-stone-300 block">sac@dubola.com.br</span>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-black text-stone-500 uppercase tracking-widest block">Qualidade</span>
              <span className="text-xs text-stone-300 block">100% Livre de Glúten</span>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-black text-stone-500 uppercase tracking-widest block">Agência OS</span>
              <span className="text-xs text-stone-300 block">comunicacaosocialag.com</span>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-black text-stone-500 uppercase tracking-widest block">Desenvolvido por</span>
              <span className="text-xs text-stone-300 block">Antigravity AI Coder</span>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
