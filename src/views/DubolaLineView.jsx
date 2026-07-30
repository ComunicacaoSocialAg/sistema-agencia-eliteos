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
  Sun,
  Moon
} from 'lucide-react';
import { Link } from 'react-router-dom';

// 1. DYNAMIC TECHNIQUES MATRIX (Adapted per active flavor)
const baseTechniques = {
  peixe: {
    romantico: {
      name: "Arroseur & Grelhado Unilateral (A Arte do Regado Contínuo)",
      description: "Grelhe o filé em frigideira quente apoiado na pele. Com uma colher, pegue a manteiga derretida com ervas do fundo da panela e regue continuamente o topo do peixe. A pele fica super crocante e a carne derrete na boca."
    },
    almoco: {
      name: "Reação de Maillard Controlada (Selagem Rápida)",
      description: "Aqueça muito bem a frigideira com um fio de azeite. Coloque o peixe e não mexa por 3 minutos. Esse silêncio é o que permite a formação de uma crosta dourada selada e rica."
    },
    churrasco: {
      name: "Papillote em Brasa Ativa (Cozimento a Bafo de Ervas)",
      description: "Embrulhe o peixe temperado com ervas, limão e azeite em papel alumínio. Leve à grelha. O peixe cozinha no vapor dos seus próprios sucos, saindo extremamente úmido e macio."
    },
    brunch: {
      name: "Gravlax Expresso & Cura Aromática a Frio",
      description: "Cubra fatias de salmão com sal fino, açúcar mascavo e raspas cítricas por 10 minutos na geladeira. Lave rapidamente e seque bem antes de dispor sobre a torrada."
    }
  },
  burguer: {
    romantico: {
      name: "Pan-Sear & Butter Basting (Selagem e Banho de Manteiga)",
      description: "Frite o burger em fogo alto de um lado. Vire, adicione manteiga gelada, alho esmagado e tomilho. Incline a frigideira e regue sem parar até derreter o queijo."
    },
    almoco: {
      name: "Smashed Sear (Esmagamento Térmico Máximo para Crosta)",
      description: "Pressione a bola de carne bem gelada contra a chapa fervente com uma espátula pesada. Deixe criar uma crosta rendada escura de puro sabor umami antes de virar."
    },
    churrasco: {
      name: "Reverse Sear (Selagem Inversa com Braseiro)",
      description: "Cozinhe o hambúrguer grosso lentamente na parte alta da churrasqueira (calor indireto). Depois, desça para selar na brasa direta por 1 minuto de cada lado."
    },
    brunch: {
      name: "Gema Fondante e Selagem com Calor Residual",
      description: "Grelhe a carne artesanal de porco. Na mesma gordura, frite um ovo mantendo a gema mole. A gema cremosa criará uma emulsão instantânea ao fundir-se com a maionese."
    }
  },
  camarao: {
    romantico: {
      name: "Emulsion Glaze (Glaceado Aveludado)",
      description: "Salteie os camarões por 2 minutos. Desligue o fogo. Adicione a maionese especial e mexa energicamente. O calor residual derreterá a emulsão, envolvendo os camarões com um glacê brilhante."
    },
    almoco: {
      name: "Flash Sautéing (Salteado Rápido de Precisão)",
      description: "Aqueça o azeite até quase soltar fumaça. Adicione os camarões secos e salteie por exatamente 90 segundos de cada lado. O cozimento rápido retém toda a água interna."
    },
    churrasco: {
      name: "Skewered Charring (Tostado em Brasa com Casca)",
      description: "Espete os camarões com casca, pincele azeite e leve à brasa por 2 minutos. A casca protege a carne delicada e carameliza, infundindo um toque defumado irresistível."
    },
    brunch: {
      name: "Confit Suave em Banho de Azeite Aromático",
      description: "Cozinhe os camarões imersos em azeite de oliva morno (70°C, fogo ultra baixo) com alho e tomilho por 6 minutos. Escorra e monte sobre o pão tostado."
    }
  },
  cogumelos: {
    romantico: {
      name: "Deglaçagem com Vinho Branco & Redução",
      description: "Doure os cogumelos em manteiga. Quando estiverem bem tostados, despeje vinho branco seco. Mexa raspando o fundo da frigideira para resgatar os açúcares caramelizados."
    },
    almoco: {
      name: "Sauté Seco (Caramelização Pura sem Gordura)",
      description: "Toste os cogumelos em frigideira quente TOTALMENTE SECA. Sem óleo, sem sal. O vapor sai rápido e os açúcares concentram. Adicione gordura e temperos apenas no final."
    },
    churrasco: {
      name: "Charring Radiante em Grelha Dupla na Brasa",
      description: "Arrume cogumelos inteiros grandes na grelha. Pincele shoyu e azeite. Leve ao fogo médio da churrasqueira, virando sempre para defumar as fibras por igual."
    },
    brunch: {
      name: "Confit de Paris em Ervas Finas e Alho",
      description: "Fatie os cogumelos e asse-os submersos em azeite extra virgem, dentes de alho e tomilho em forno baixo por 20 minutos até ficarem incrivelmente amanteigados."
    }
  },
  batatas: {
    romantico: {
      name: "Batatas Fondant à Provençal (Cocção Lenta)",
      description: "Doure as bases de batatas cilíndricas na manteiga. Adicione caldo aromático até a metade e leve ao forno. O caldo reduz e as batatas absorvem a gordura, derretendo por dentro."
    },
    almoco: {
      name: "Double-Cook Crisp (Fervura com Vinagre e Assagem)",
      description: "Ferva as batatas com água e um toque de vinagre de maçã por 5 minutos (ativa a pectina). Escorra, seque, envolva em azeite e asse em fogo máximo para casca de vidro."
    },
    churrasco: {
      name: "Ember-Baking (Assado Rústico sob Cinzas)",
      description: "Embrulhe as batatas com sal grosso em papel alumínio. Coloque sob as cinzas quentes da churrasqueira por 35 minutos. O calor radiante carameliza os amidos internos."
    },
    brunch: {
      name: "Gourmet Rösti (Desidratação Mecânica e Fritura)",
      description: "Rale as batatas cruas e esprema em um pano limpo para tirar toda a umidade celular. Tempere e frite na manteiga em fogo médio, moldando uma panqueca rendada e ultra crocante."
    }
  }
};

// 2. FLAVOR DETAILS AND INTERACTIVE CONFIG
const FLAVORS = {
  alho: {
    id: 'alho',
    name: 'Sabor Alho',
    fullName: 'Maionese Dubola Sabor Alho',
    slogan: 'O toque intenso e aromático que consagra sua mesa.',
    description: 'A Maionese Dubola Sabor Alho é a tradução da cremosidade robusta. Com alho nobre perfeitamente selecionado, ela traz notas rústicas e aromáticas, conferindo picância suave e textura de emulsão perfeita.',
    primaryColor: 'purple',
    accentText: 'text-purple-400',
    accentBg: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    glowColor: 'rgba(139, 92, 246, 0.12)',
    buttonGradient: 'bg-gradient-to-r from-purple-600 to-fuchsia-600 shadow-purple-600/20 hover:shadow-purple-600/40',
    borderClass: 'border-purple-500/10',
    borderFocus: 'border-purple-500/30',
    borderActive: 'border-purple-500',
    bgClass: 'bg-[#0e0717]',
    activeHighlightText: 'text-purple-500 bg-purple-500/10 border border-purple-500/35 shadow-[0_0_8px_rgba(139,92,246,0.15)]',
    nutrition: {
      ingredients: "Água, óleo de soja, ovos pasteurizados, alho nobre desidratado, vinagre, açúcar mascavo, sal marinho, condimentos naturais, ácido cítrico, aroma natural de alho silvestre.",
      table: [
        { label: 'Valor Energético', qty: '48 kcal', vd: '2%' },
        { label: 'Carboidratos', qty: '0.4 g', vd: '0%' },
        { label: 'Proteínas', qty: '0.1 g', vd: '0%' },
        { label: 'Gorduras Totais', qty: '5.2 g', vd: '9%' },
        { label: 'Gorduras Saturadas', qty: '0.8 g', vd: '4%' },
        { label: 'Sódio', qty: '92 mg', vd: '4%' }
      ]
    },
    pairings: {
      peixe: {
        title: "Salmão Grelhado com Alho e Tomilho",
        desc: "O casamento perfeito do calor e perfume do alho. A Maionese Dubola Sabor Alho derrete sutilmente sobre as fibras quentes do salmão, intensificando os aromas herbáceos e a suculência natural do peixe grelhado.",
        tips: "Adicione as folhas de tomilho fresco diretamente sobre a colherada de maionese ao servir.",
        difficulty: "Fácil",
        time: "15 min"
      },
      burguer: {
        title: "Smash Burger de Costela com Cebola Tostada",
        desc: "Uma explosão umami. A maionese de alho confere uma camada rica e rústica que se une perfeitamente à crosta tostada do burger e ao adocicado da cebola grelhada.",
        tips: "Pincele o pão brioche com manteiga de alho antes de selar para uma harmonia extrema.",
        difficulty: "Fácil",
        time: "10 min"
      },
      batatas: {
        title: "Batatas Fritas com Alecrim e Flor de Sal",
        desc: "O clássico supremo de boteco gourmet. Batatas fritas estalando de quentes mergulhadas na cremosidade intensa de alho. O alecrim frito acentua o tom herbal das especiarias.",
        tips: "Sirva as batatas imediatamente após fritar, polvilhadas com sal grosso moído fino.",
        difficulty: "Fácil",
        time: "15 min"
      },
      camarao: {
        title: "Camarões Salteados ao Alho e Óleo",
        desc: "Uma releitura sofisticada. O camarão salteado de forma rápida ganha uma untuosidade perfumada maravilhosa ao ser finalizado com a colherada fria da nossa maionese sabor alho.",
        tips: "Retire o camarão da frigideira um pouco antes de terminar e finalize misturando a maionese fora do fogo.",
        difficulty: "Médio",
        time: "12 min"
      }
    }
  },
  tradicional: {
    id: 'tradicional',
    name: 'Tradicional',
    fullName: 'Maionese Dubola Tradicional',
    slogan: 'A perfeição clássica elevada ao nível extraordinário.',
    description: 'A Maionese Dubola Tradicional resgata a essência da maionese de verdade. Feita com ovos selecionados e óleo de altíssima pureza, ela entrega uma emulsão sedosa, leve e extremamente equilibrada.',
    primaryColor: 'blue',
    accentText: 'text-blue-400',
    accentBg: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    glowColor: 'rgba(37, 99, 235, 0.12)',
    buttonGradient: 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-600/20 hover:shadow-blue-600/40',
    borderClass: 'border-blue-500/10',
    borderFocus: 'border-blue-500/30',
    borderActive: 'border-blue-500',
    bgClass: 'bg-[#060e1d]',
    activeHighlightText: 'text-blue-500 bg-blue-500/10 border border-blue-500/35 shadow-[0_0_8px_rgba(37,99,235,0.15)]',
    nutrition: {
      ingredients: "Água, óleo de soja selecionado, ovos caipiras pasteurizados, vinagre de maçã, açúcar orgânico, sal marinho fino, suco de limão siciliano, antioxidante natural de alecrim.",
      table: [
        { label: 'Valor Energético', qty: '52 kcal', vd: '3%' },
        { label: 'Carboidratos', qty: '0.2 g', vd: '0%' },
        { label: 'Proteínas', qty: '0.1 g', vd: '0%' },
        { label: 'Gorduras Totais', qty: '5.6 g', vd: '10%' },
        { label: 'Gorduras Saturadas', qty: '0.9 g', vd: '5%' },
        { label: 'Sódio', qty: '88 mg', vd: '4%' }
      ]
    },
    pairings: {
      peixe: {
        title: "Filet de Pescada com Salada Russa",
        desc: "A maionese tradicional é o elo químico perfeito para unir vegetais cozidos al dente a um filé de peixe branco crocante. Traz leveza e sutil acidez de limão.",
        tips: "Corte os vegetais em cubos milimétricos perfeitos antes de misturar à maionese gelada.",
        difficulty: "Fácil",
        time: "20 min"
      },
      burguer: {
        title: "Burger Clássico com Queijo e Alface",
        desc: "O equilíbrio dos clássicos. A maionese tradicional envolve a carne suculenta e o queijo prato derretido, protegendo o pão contra a umidade da alface fresca.",
        tips: "Espalhe a maionese tradicional em ambas as metades do pão brioche selado.",
        difficulty: "Fácil",
        time: "10 min"
      },
      batatas: {
        title: "Batatas Canoa com Sal de Ervas",
        desc: "A verdadeira experiência de dip. A consistência encorpada e sedosa da maionese tradicional envolve as batatas assadas, ressaltando o amido macio interno.",
        tips: "Polvilhe páprica doce e orégano sobre a maionese no ramequim.",
        difficulty: "Fácil",
        time: "20 min"
      },
      camarao: {
        title: "Camarões Cozidos com Dip de Limão",
        desc: "Elegância pura para um brunch. Camarões temperados no vapor, servidos frios ao lado de um ramequim de maionese tradicional batida com gotinhas extras de limão siciliano.",
        tips: "Sirva sobre gelo moído para manter o frescor absoluto do camarão.",
        difficulty: "Fácil",
        time: "15 min"
      }
    }
  },
  tartaro: {
    id: 'tartaro',
    name: 'Sabor Tártaro',
    fullName: 'Maionese Dubola Tártaro',
    slogan: 'O equilíbrio sublime entre textura e frescor cítrico.',
    description: 'A Maionese Dubola Tártaro é a tradução do equilíbrio culinário. Ela harmoniza a textura aveludada artesanal à acidez crocante de picles finos, cebola roxa e especiarias nobres. Perfeita para elevar pratos litorâneos.',
    primaryColor: 'orange',
    accentText: 'text-orange-400',
    accentBg: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
    glowColor: 'rgba(234, 88, 12, 0.12)',
    buttonGradient: 'bg-gradient-to-r from-orange-600 to-amber-600 shadow-orange-600/20 hover:shadow-orange-600/40',
    borderClass: 'border-orange-500/10',
    borderFocus: 'border-orange-500/30',
    borderActive: 'border-orange-500',
    bgClass: 'bg-[#110502]',
    activeHighlightText: 'text-orange-500 bg-orange-500/10 border border-orange-500/35 shadow-[0_0_8px_rgba(234,88,12,0.15)]',
    nutrition: {
      ingredients: "Água, óleo de soja, ovos pasteurizados, picles de pepinos nobres picados, cebola roxa fresca, mostarda em grãos, vinagre, sal marinho, suco de limão taiti, especiarias selecionadas.",
      table: [
        { label: 'Valor Energético', qty: '46 kcal', vd: '2%' },
        { label: 'Carboidratos', qty: '0.5 g', vd: '0%' },
        { label: 'Proteínas', qty: '0.1 g', vd: '0%' },
        { label: 'Gorduras Totais', qty: '5.0 g', vd: '9%' },
        { label: 'Gorduras Saturadas', qty: '0.7 g', vd: '3%' },
        { label: 'Sódio', qty: '98 mg', vd: '5%' }
      ]
    },
    pairings: {
      peixe: {
        title: "Filé de Salmão Grelhado Unilateral",
        desc: "O casamento litorâneo definitivo. A acidez elegante e a crocância dos picles na Maionese Tártaro cortam perfeitamente a gordura saudável do salmão, limpando o paladar.",
        tips: "Coloque uma generosa colherada de tártaro frio ao lado do peixe pelando de quente.",
        difficulty: "Médio",
        time: "15 min"
      },
      burguer: {
        title: "Burger Gourmet com Queijo Camembert",
        desc: "O toque de bistrô. Picles finos e mostarda em grãos da maionese tártaro quebram a robustez da carne bovina grelhada na brasa, conferindo um frescor espetacular.",
        tips: "Misture cebolas roxas caramelizadas sob a carne para contrastar com a acidez do tártaro.",
        difficulty: "Fácil",
        time: "10 min"
      },
      batatas: {
        title: "Batatas Rústicas com Páprica e Alecrim",
        desc: "O dip dos sonhos. A textura pedaçuda de picles e cebola roxa faz de cada mergulho de batata assada rústica quente uma experiência tátil crocante fantástica.",
        tips: "Asse as batatas em temperatura máxima para criar uma casca firme capaz de carregar o creme.",
        difficulty: "Fácil",
        time: "30 min"
      },
      camarao: {
        title: "Camarões Empanados na Farinha Panko",
        desc: "Crocância em dobro. A casca dourada e aerada do camarão frito encontra o ápice na cremosidade texturizada de picles e cebola roxa do tártaro.",
        tips: "Borrife raspas de limão taiti sobre os camarões fritos antes de mergulhar.",
        difficulty: "Médio",
        time: "20 min"
      }
    }
  }
};

// 3. BASE PROTEIN RECIPES FOR DYNAMIC GENERATION
const baseRecipes = {
  peixe: {
    romantico: {
      name: "Filé de Salmão Selado com Crosta Crocante & Crema de Dubola",
      prepTime: "25 minutos",
      difficulty: "Média",
      servings: "2 porções",
      ingredients: [
        "2 filés de salmão fresco (200g cada, com pele)",
        "1 colher de sopa de manteiga de garrafa",
        "Raspas finas de 1 limão siciliano",
        "Flor de sal marinho e pimenta-do-reino moída na hora",
        "1 ramo de salsinha fresca micro-picada",
        "Fio de azeite extra virgem de oliva"
      ],
      steps: [
        "Seque perfeitamente a pele do salmão com papel toalha e tempere com flor de sal e pimenta-do-reino.",
        "Aqueça o azeite e a manteiga em fogo alto até começar a espumar. Coloque o salmão com a pele voltada para baixo. Pressione levemente por 30 segundos.",
        "Deixe grelhar por 4 minutos sem mover para criar uma casca crocante. Vire e cozinhe por apenas mais 2 minutos.",
        "Retire do fogo e deixe a proteína descansar na tábua por 1 minuto para assentar os sucos térmicos.",
        "Disponha os filés em pratos aquecidos. Coroe a proteína com uma quenelle escultural de Maionese Dubola, salpicando raspas de limão e salsinha por cima.",
        "Servir imediatamente. O calor residual do peixe fundirá levemente a maionese criando um glacê aveludado."
      ]
    },
    almoco: {
      name: "Peixe Branco em Reação de Maillard com Banho de Dubola",
      prepTime: "15 minutos",
      difficulty: "Fácil",
      servings: "2 porções",
      ingredients: [
        "2 filés de peixe branco firme (pargo, tilápia ou robalo)",
        "Suco de 1/2 limão taiti",
        "1 colher de sopa de azeite extra virgem",
        "Sal refinado e pimenta branca moída"
      ],
      steps: [
        "Tempere os filés de peixe branco com sal marinho, pimenta branca e gotas de limão taiti.",
        "Aqueça uma frigideira antiaderente de fundo triplo com o azeite e sele o peixe por 3 minutos de um lado. Não mexa.",
        "Vire com espátula de metal fina e doure por mais 2 minutos até soltar da panela de forma limpa.",
        "Transfira o filé dourado para o prato de servir ainda fumegante.",
        "Pincele uma camada generosa de Maionese Dubola sobre toda a superfície superior, criando uma película rica e protetora.",
        "Acompanhe com salada de folhas verdes e arroz aromático de jasmim."
      ]
    },
    churrasco: {
      name: "Papillote de Tambaqui na Brasa com Emulsão Térmica de Dubola",
      prepTime: "30 minutos",
      difficulty: "Média",
      servings: "4 porções",
      ingredients: [
        "1kg de lombo de Tambaqui ou Pintado em postas grossas",
        "2 limões caipiras ou cravo",
        "Sal grosso triturado",
        "1 ramo de coentro ou salsinha fresca"
      ],
      steps: [
        "Tempere as postas de peixe com sal grosso triturado e suco de limão caipira.",
        "Crie um pacote selado (papillote) usando folhas de alumínio ou bananeira, adicionando ramos de ervas e um fio de azeite.",
        "Disponha o pacote sobre a grelha em brasa média por 20 minutos para cozinhar no próprio vapor celular.",
        "Abra o pacote com cuidado para não queimar-se com o vapor acumulado.",
        "Aplique colheradas generosas de Maionese Dubola sobre o peixe quente e deixe o calor da grelha derreter o creme por 2 minutos.",
        "Sirva com farofa de banana e fatias grelhadas de limão."
      ]
    },
    brunch: {
      name: "Toast Nórdico de Salmão Curado e Creme de Dubola",
      prepTime: "12 minutos",
      difficulty: "Fácil",
      servings: "2 porções",
      ingredients: [
        "4 fatias de pão de fermentação natural (sourdough)",
        "150g de salmão curado ou defumado em fatias finas",
        "1 colher de chá de alcaparras pequenas",
        "Ramos de endro (dill) fresco",
        "Cebola roxa cortada em tiras ultra-finas"
      ],
      steps: [
        "Toste as fatias de sourdough na chapa com um fio leve de azeite de oliva.",
        "Espalhe uma camada farta de Maionese Dubola sobre cada fatia de pão dourado, cobrindo de borda a borda.",
        "Disponha as lâminas delicadas de salmão curado de forma ondulada sobre a base cremosa.",
        "Decore com tiras de cebola roxa, alcaparras lavadas e ramos frescos de endro.",
        "Finalize com um toque de pimenta preta moída e sirva aberto no prato."
      ]
    }
  },
  burguer: {
    romantico: {
      name: "Artisan Burger de Costela com Queijo Fundido & Toque de Dubola",
      prepTime: "20 minutos",
      difficulty: "Média",
      servings: "2 porções",
      ingredients: [
        "2 blends de costela de 150g cada (20% de gordura)",
        "100g de queijo camembert ou brie em fatias",
        "2 pães brioche nobres",
        "1 cebola roxa caramelizada na manteiga",
        "Sal de parrilla e pimenta preta moída"
      ],
      steps: [
        "Aqueça a chapa de ferro até quase soltar fumaça. Grelhe os blends de costela por 3 minutos de um lado.",
        "Vire a carne, tempere com sal de parrilla e coloque as fatias de queijo sobre o topo. Abafe por 2 minutos.",
        "Toste os pães brioche cortados ao meio na manteiga até dourar a face.",
        "Aplique a Maionese Dubola nas duas metades do pão tostado de forma homogênea.",
        "Disponha a cebola roxa caramelizada na base do pão, coloque o burger com o queijo derretido e feche.",
        "Pressione levemente o burger para que os sucos e a maionese se fundam de forma irresistível."
      ]
    },
    almoco: {
      name: "Double Smash Burger com Crosta de Renda & Dubola",
      prepTime: "15 minutos",
      difficulty: "Fácil",
      servings: "2 porções",
      ingredients: [
        "4 bolas de blend bovino de 80g cada bem geladas",
        "4 fatias de queijo cheddar inglês de alta fusão",
        "2 pães de hambúrguer clássicos com gergelim",
        "Sal e pimenta preta moídos na hora"
      ],
      steps: [
        "Aqueça a chapa de ferro ao máximo absoluto. Coloque as bolas de carne gelada bem espaçadas.",
        "Pressione imediatamente com prensa de metal com força extrema até ficarem ultra finas. Tempere na hora.",
        "Deixe fritar por 90 segundos sem mover para criar uma crosta marrom rendada. Vire com espátula rígida rasgando a chapa.",
        "Coloque uma fatia de cheddar sobre cada carne por 30 segundos. Empilhe as carnes duas a duas.",
        "Passe a Maionese Dubola no pão de gergelim levemente tostado.",
        "Monte os smashes duplos no pão e devore quente."
      ]
    },
    churrasco: {
      name: "Double Burger de Fraldinha na Brasa com Cobertura Dubola",
      prepTime: "25 minutos",
      difficulty: "Média",
      servings: "4 porções",
      ingredients: [
        "4 blends de fraldinha de 180g cada (grossos)",
        "8 fatias de queijo muçarela artesanal",
        "4 pães de hambúrguer rústicos",
        "Sal grosso triturado de churrasco"
      ],
      steps: [
        "Tempere os burgers grossos de fraldinha com sal grosso triturado minutos antes de grelhar.",
        "Disponha os burgers na parte alta da churrasqueira (calor indireto) por 10 minutos para aquecimento lento.",
        "Desça a carne para a grelha inferior diretamente sobre o carvão em brasa vermelha incandescente por 1 minuto de cada lado.",
        "Adicione o queijo nos últimos segundos e abafe com abafador de hambúrguer para derreter.",
        "Corte os pães rústicos e toste na grelha. Besunte fartamente com Maionese Dubola.",
        "Coloque o burger suculento no pão quente e sirva com o aroma de fumaça da brasa."
      ]
    },
    brunch: {
      name: "Sausage Egg Muffin com Gema Mole & Dubola",
      prepTime: "15 minutos",
      difficulty: "Fácil",
      servings: "2 porções",
      ingredients: [
        "2 blends de linguiça artesanal suína de 100g (achatados)",
        "2 ovos caipiras grandes",
        "2 pães tipo English Muffin ou brioche redondo",
        "Manteiga de sal, pimenta-do-reino"
      ],
      steps: [
        "Molde a carne de linguiça suína como um burger e frite em fogo médio por 4 minutos de cada lado até cozinhar bem.",
        "Em um aro de metal na frigideira com manteiga, frite o ovo caipira mantendo a gema perfeitamente mole e líquida.",
        "Toste os muffins na manteiga até ficarem dourados e crocantes.",
        "Espalhe uma camada generosa de Maionese Dubola na base do pão.",
        "Disponha a carne suína, o ovo com gema fondante e finalize com pimenta-do-reino moída na hora antes de fechar."
      ]
    }
  },
  camarao: {
    romantico: {
      name: "Camarões Glaceados em Emulsão de Espumante & Dubola",
      prepTime: "20 minutos",
      difficulty: "Média",
      servings: "2 porções",
      ingredients: [
        "300g de camarões grandes limpos (pistola)",
        "50ml de espumante brut ou vinho branco",
        "1 colher de sopa de azeite de oliva",
        "Sal marinho e raspas de limão siciliano"
      ],
      steps: [
        "Seque muito bem os camarões limpos com papel toalha. Tempere levemente com sal marinho.",
        "Aqueça o azeite em fogo alto até começar a fumegar. Adicione os camarões e salteie por 1 minuto.",
        "Despeje o espumante na frigideira para deglaçar, deixando borbulhar e reduzir quase por completo por 1 minuto.",
        "Desligue o fogo imediatamente para não enrijecer o crustáceo.",
        "Incorpore a Maionese Dubola na panela morna e mexa em círculos rápidos para criar um molho aveludado.",
        "Sirva em pratos fundos decorados com raspas de limão siciliano e torradas de brioche."
      ]
    },
    almoco: {
      name: "Salteado Rápido de Camarão com Arroz Cremoso de Dubola",
      prepTime: "15 minutos",
      difficulty: "Fácil",
      servings: "2 porções",
      ingredients: [
        "250g de camarões médios limpos",
        "1 dente de alho picado finamente",
        "1 colher de sopa de manteiga",
        "Sal, pimenta calabresa e cheiro-verde picado"
      ],
      steps: [
        "Aqueça a frigideira com a manteiga e o alho picado até perfumar (sem queimar).",
        "Jogue os camarões de uma vez e salteie vigorosamente por 2 a 3 minutos até formarem curvas rosadas em forma de 'C'.",
        "Desligue o calor e salpique cheiro-verde picado e pimenta calabresa.",
        "Em um bowl separado, adicione a Maionese Dubola ao arroz branco quente e mexa bem, transformando-o em um arroz super cremoso instantâneo.",
        "Disponha o arroz cremoso nos pratos e cubra com os camarões salteados quentes por cima."
      ]
    },
    churrasco: {
      name: "Brochete de Camarão na Grelha com Banho de Dubola",
      prepTime: "20 minutos",
      difficulty: "Média",
      servings: "4 porções",
      ingredients: [
        "800g de camarões gigantes com casca inteiros",
        "2 colheres de sopa de azeite de oliva",
        "Sal grosso triturado de churrasco",
        "Limão caipira cortado ao meio"
      ],
      steps: [
        "Passe os camarões gigantes com casca em espetos duplos de metal ou bambu (previamente hidratados).",
        "Pincele a casca com azeite de oliva e salpique o sal grosso triturado.",
        "Leve à grelha sob brasa forte por apenas 2 minutos de cada lado até as cascas ficarem douradas e chamuscadas.",
        "Borrife suco de limão caipira sobre o espeto ainda na brasa.",
        "Retire da churrasqueira, sirva em uma travessa de madeira e pincele a Maionese Dubola diretamente sobre a casca tostada para servir quente."
      ]
    },
    brunch: {
      name: "Brioche Shrimp Roll com Maionese Dubola e Chives",
      prepTime: "15 minutos",
      difficulty: "Fácil",
      servings: "2 porções",
      ingredients: [
        "2 pães de brioche alongados (estilo hot dog premium)",
        "250g de camarões pequenos cozidos no vapor frios",
        "Folhas de cebolinha francesa (chives) picadas",
        "Fio de limão siciliano e pimenta branca"
      ],
      steps: [
        "Corte o topo dos pães brioche e doure as laterais em frigideira quente com manteiga.",
        "Em um bowl médio, misture os camarões cozidos frios com a Maionese Dubola de forma homogênea.",
        "Tempere a mistura de camarão com gotinhas de limão siciliano, pimenta branca e sal refinado.",
        "Recheie generosamente o centro do pão brioche morno com a salada fria de camarão.",
        "Salpique a cebolinha francesa picada por cima para decorar e dar um leve toque picante e herbal."
      ]
    }
  },
  cogumelos: {
    romantico: {
      name: "Cogumelos Paris Deglaçados no Vinho Branco & Creme Dubola",
      prepTime: "20 minutos",
      difficulty: "Média",
      servings: "2 porções",
      ingredients: [
        "300g de cogumelos Paris frescos cortados em quartos",
        "1 colher de sopa de manteiga com sal",
        "50ml de vinho branco seco clássico",
        "Sal marinho refinado e tomilho fresco"
      ],
      steps: [
        "Limpe os cogumelos com um pano úmido (não lave em água) e corte-os em quatro partes.",
        "Derreta a manteiga na frigideira em fogo alto. Doure os cogumelos por 4 minutos até que a superfície fique marrom escura.",
        "Despeje o vinho branco clássico para deglaçar, raspando os açúcares com colher de madeira. Deixe reduzir.",
        "Apague o fogo, junte ramos de tomilho fresco e incorpore a Maionese Dubola, mexendo para formar uma emulsão sedosa.",
        "Sirva em pratos aquecidos acompanhado de torradas crocantes de pão italiano rústico."
      ]
    },
    almoco: {
      name: "Sauté Seco de Cogumelos Shimeji com Maionese Dubola",
      prepTime: "15 minutos",
      difficulty: "Fácil",
      servings: "2 porções",
      ingredients: [
        "250g de cogumelos Shimeji escuros desfiados",
        "1 colher de sopa de shoyu especial",
        "1 colher de sopa de cebolinha verde picada",
        "Fio de azeite de oliva"
      ],
      steps: [
        "Aqueça uma frigideira pesada de ferro TOTALMENTE SECA até que irradie calor intenso.",
        "Adicione os Shimejis desfiados diretamente, sem óleo ou sal. Pressione por 2 minutos para liberar a umidade natural.",
        "Assim que começarem a dourar, adicione um fio de azeite, o shoyu e salteie por mais 1 minuto.",
        "Desligue o fogo e incorpore a Maionese Dubola misturando vigorosamente na frigideira quente.",
        "Finalize salpicando cebolinha verde picada e sirva como entrada ou prato principal."
      ]
    },
    churrasco: {
      name: "Portobellos Gigantes na Grelha Defumados com Dubola",
      prepTime: "25 minutos",
      difficulty: "Média",
      servings: "4 porções",
      ingredients: [
        "4 cogumelos Portobello grandes inteiros",
        "2 colheres de sopa de azeite de oliva",
        "1 dente de alho amassado",
        "Sal e pimenta preta moída"
      ],
      steps: [
        "Retire os talos dos cogumelos Portobello e pincele os chapéus com azeite de oliva misturado com alho amassado, sal e pimenta.",
        "Coloque os cogumelos com a cavidade voltada para baixo na grelha sobre brasa média por 6 minutos.",
        "Vire os chapéus, coloque uma generosa colherada de Maionese Dubola dentro de cada cavidade e deixe grelhar por mais 8 minutos.",
        "A maionese aquecerá lentamente fundindo-se com o suco terroso do cogumelo sob a fumaça do carvão.",
        "Retire com cuidado e sirva como um hambúrguer vegetariano de alta gastronomia."
      ]
    },
    brunch: {
      name: "Toast de Cogumelos Confitados sobre Avocado e Creme Dubola",
      prepTime: "20 minutos",
      difficulty: "Média",
      servings: "2 porções",
      ingredients: [
        "4 cogumelos Paris ou Portobello cortados em lâminas",
        "150ml de azeite extra virgem de oliva",
        "2 fatias de pão sourdough rústico",
        "1 avocado maduro amassado com sal e limão"
      ],
      steps: [
        "Em uma panelinha rasa, coloque as lâminas de cogumelo totalmente submersas no azeite com dentes de alho e tomilho.",
        "Cozinhe em fogo ultra baixo (confit) por 15 minutos até ficarem macios e aveludados. Escorra.",
        "Toste as fatias de sourdough e monte a cama de avocado amassado e temperado.",
        "Distribua os cogumelos confitados escorridos sobre o avocado.",
        "Finalize coroando com zigue-zagues elegantes de Maionese Dubola gelada por cima das lâminas mornas de cogumelo."
      ]
    }
  },
  batatas: {
    romantico: {
      name: "Batatas Fondant na Manteiga de Ervas com Toque Dubola",
      prepTime: "30 minutos",
      difficulty: "Média",
      servings: "2 porções",
      ingredients: [
        "4 batatas grandes descascadas cortadas em cilindros retos",
        "50g de manteiga de alta qualidade",
        "200ml de caldo de galinha ou legumes caseiro",
        "Alecrim, dente de alho amassado e sal marinho"
      ],
      steps: [
        "Aqueça a manteiga e doure os topos e bases dos cilindros de batata em frigideira pesada até criar casca dourada.",
        "Adicione o caldo de legumes caseiro quente, alecrim e alho amassado até a metade das batatas. Tempere com sal.",
        "Transfira a frigideira ao forno a 180°C por 20 minutos até que o caldo reduza e as batatas fiquem macias.",
        "Ao retirar, disponha as batatas douradas nos pratos de servir.",
        "Coloque uma porção de Maionese Dubola gelada sobre o topo de cada cilindro quente.",
        "A maionese derreterá suavemente napando as batatas fondant de forma luxuosa."
      ]
    },
    almoco: {
      name: "Batatas Canoa Super Crocantes com Trio Dip de Dubola",
      prepTime: "25 minutos",
      difficulty: "Fácil",
      servings: "2 porções",
      ingredients: [
        "3 batatas médias lavadas cortadas em canoas (com casca)",
        "2 colheres de sopa de amido de milho fino",
        "Páprica defumada, sal e alecrim fresco",
        "Azeite de oliva extra virgem"
      ],
      steps: [
        "Cozinhe as batatas canoas em água fervente com sal por 5 minutos (pré-cozimento). Escorra muito bem.",
        "Em um bowl grande, envolva as batatas mornas com o amido de milho, páprica defumada, sal e azeite.",
        "Espalhe em assadeira antiaderente sem empilhar e asse a 220°C por 15-20 minutos até ficarem douradas e crocantes.",
        "Transfira para uma cesta de servir.",
        "Sirva acompanhado de um ramequim generoso de Maionese Dubola gelada para chuchar a cada mordida crocante."
      ]
    },
    churrasco: {
      name: "Batatas Assadas na Brasa Recheadas de Queijo & Dubola",
      prepTime: "40 minutos",
      difficulty: "Fácil",
      servings: "4 porções",
      ingredients: [
        "4 batatas grandes lavadas inteiras (com casca)",
        "150g de queijo muçarela ou requeijão de corte",
        "Sal grosso triturado de churrasco",
        "Papel alumínio resistente"
      ],
      steps: [
        "Envolva cada batata individualmente em folhas duplas de papel alumínio resistente.",
        "Coloque diretamente no leito de cinzas ou carvão quente da churrasqueira por 35 minutos até amolecer por completo.",
        "Retire, corte o topo longitudinalmente e pressione as pontas para abrir uma cavidade interna.",
        "Insira os pedaços de queijo e mexa com um garfo no miolo quente da batata para derreter de forma cremosa.",
        "Coroe a abertura da batata assada com duas colheres cheias de Maionese Dubola, salpicando sal grosso triturado por cima."
      ]
    },
    brunch: {
      name: "Rösti de Batata Gourmet com Recheio Cremoso de Dubola",
      prepTime: "25 minutos",
      difficulty: "Média",
      servings: "2 porções",
      ingredients: [
        "3 batatas médias raladas cruas descascadas",
        "1 ovo caipira pequeno batido levemente",
        "Sal marinho fino, pimenta-do-reino e noz-moscada",
        "Manteiga com sal para fritar"
      ],
      steps: [
        "Rale as batatas cruas no ralo grosso. Envolva em pano limpo e esprema com força máxima para retirar todo o suco celular.",
        "Misture a batata ralada seca com o ovo batido, sal, pimenta e noz-moscada ralada na hora.",
        "Aqueça a manteiga na frigideira de 15cm. Espalhe metade da batata ralada alisando com as costas de colher.",
        "Adicione colheres fartas de Maionese Dubola no centro da batata, deixando 1.5cm de borda livre.",
        "Cubra com o restante da batata ralada. Cozinhe por 8 minutos, vire e doure por mais 8 minutos.",
        "Sirva cortada em triângulos revelando o centro cremoso derretendo no interior do disco crocante."
      ]
    }
  }
};

export default function DubolaLineView() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [activeFlavor, setActiveFlavor] = useState('alho');
  const [selectedPairing, setSelectedPairing] = useState('peixe');
  const [hoveredHotspot, setHoveredHotspot] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef(null);
  const videoRef = useRef(null);

  // IA Chef States
  const [selectedProtein, setSelectedProtein] = useState('peixe');
  const [selectedOccasion, setSelectedOccasion] = useState('romantico');
  const [recipeState, setRecipeState] = useState('idle'); // 'idle' | 'loading' | 'ready'
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStepText, setLoadingStepText] = useState('');
  const [generatedRecipe, setGeneratedRecipe] = useState(null);

  // IA Chef Extras & Custom Inputs
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [customIngredient, setCustomIngredient] = useState('');

  // Masterclass states
  const [viewMode, setViewMode] = useState('standard'); // 'standard' | 'masterclass'
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);

  // Nutritional Table active flavor state (independent or matches activeFlavor)
  const [nutritionActiveFlavor, setNutritionActiveFlavor] = useState('alho');

  // Track active flavor changes to align the nutritional switcher for better UX
  useEffect(() => {
    setNutritionActiveFlavor(activeFlavor);
  }, [activeFlavor]);

  // Track scroll position for parallax
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  // Track mouse position over the Hero for interactive ambient glow
  const handleMouseMove = (e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  const currentFlavorData = FLAVORS[activeFlavor];

  const getFlavorBg = (flavor, isDark) => {
    if (flavor === 'alho') return isDark ? 'bg-[#0e0717]' : 'bg-[#FAF7FD]';
    if (flavor === 'tradicional') return isDark ? 'bg-[#060e1d]' : 'bg-[#F4F7FA]';
    return isDark ? 'bg-[#110502]' : 'bg-[#FAF7F2]';
  };

  const getHeaderBgAndBorder = (flavor, isDark) => {
    if (flavor === 'alho') return isDark ? 'bg-[#0e0717]/85 border-purple-950/20' : 'bg-[#FAF7FD]/85 border-purple-200/40';
    if (flavor === 'tradicional') return isDark ? 'bg-[#060e1d]/85 border-blue-950/20' : 'bg-[#F4F7FA]/85 border-blue-200/40';
    return isDark ? 'bg-[#110502]/85 border-orange-950/20' : 'bg-[#FAF7F2]/85 border-orange-200/40';
  };

  const getActiveTabClass = (tabId, isDark) => {
    if (isDark) {
      if (tabId === 'alho') return 'text-purple-400 bg-purple-500/10 border border-stone-850';
      if (tabId === 'tradicional') return 'text-blue-400 bg-blue-500/10 border border-stone-850';
      return 'text-orange-400 bg-orange-500/10 border border-stone-850';
    } else {
      if (tabId === 'alho') return 'bg-purple-600 text-white shadow-md shadow-purple-600/20';
      if (tabId === 'tradicional') return 'bg-blue-600 text-white shadow-md shadow-blue-600/20';
      return 'bg-orange-500 text-white shadow-md shadow-orange-500/20';
    }
  };

  const getPairingActiveButtonClass = (flavor, isDark) => {
    if (isDark) {
      if (flavor === 'alho') return 'bg-purple-500/10 border-purple-500 text-white';
      if (flavor === 'tradicional') return 'bg-blue-500/10 border-blue-500 text-white';
      return 'bg-orange-500/10 border-orange-500 text-white';
    } else {
      if (flavor === 'alho') return 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-500/25';
      if (flavor === 'tradicional') return 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/25';
      return 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/25';
    }
  };

  // Helper to dynamically highlight active mayonnaise inside recipes with flavor specific colors
  const highlightMaionese = (text) => {
    if (!text) return "";
    
    const alhoName = "Maionese Dubola Sabor Alho";
    const tradName = "Maionese Dubola Tradicional";
    const tartName = "Maionese Dubola Tártaro";
    const genericName = "Maionese Dubola";

    if (text.includes(alhoName)) {
      const parts = text.split(alhoName);
      return (
        <span>
          {parts[0]}
          <span className={`font-extrabold px-1.5 py-0.5 rounded border inline-block ${
            isDarkMode 
              ? 'text-purple-400 bg-purple-500/10 border-purple-500/35 shadow-[0_0_8px_rgba(139,92,246,0.15)]' 
              : 'text-purple-800 bg-purple-50 border-purple-250 shadow-[0_0_8px_rgba(139,92,246,0.06)]'
          }`}>
            {alhoName}
          </span>
          {parts[1]}
        </span>
      );
    }
    if (text.includes(tradName)) {
      const parts = text.split(tradName);
      return (
        <span>
          {parts[0]}
          <span className={`font-extrabold px-1.5 py-0.5 rounded border inline-block ${
            isDarkMode 
              ? 'text-blue-400 bg-blue-500/10 border-blue-500/35 shadow-[0_0_8px_rgba(59,130,246,0.15)]' 
              : 'text-blue-800 bg-blue-50 border-blue-250 shadow-[0_0_8px_rgba(59,130,246,0.06)]'
          }`}>
            {tradName}
          </span>
          {parts[1]}
        </span>
      );
    }
    if (text.includes(tartName)) {
      const parts = text.split(tartName);
      return (
        <span>
          {parts[0]}
          <span className={`font-extrabold px-1.5 py-0.5 rounded border inline-block ${
            isDarkMode 
              ? 'text-orange-400 bg-orange-500/10 border-orange-500/35 shadow-[0_0_8px_rgba(234,88,12,0.15)]' 
              : 'text-orange-850 bg-orange-50 border-orange-250 shadow-[0_0_8px_rgba(234,88,12,0.06)]'
          }`}>
            {tartName}
          </span>
          {parts[1]}
        </span>
      );
    }
    if (text.includes(genericName)) {
      const parts = text.split(genericName);
      const highlightColorClass = 
        isDarkMode 
          ? activeFlavor === 'alho' 
            ? 'text-purple-400 bg-purple-500/10 border-purple-500/35' 
            : activeFlavor === 'tradicional' 
            ? 'text-blue-400 bg-blue-500/10 border-blue-500/35' 
            : 'text-orange-400 bg-orange-500/10 border-orange-500/35'
          : activeFlavor === 'alho'
          ? 'text-purple-800 bg-purple-50 border-purple-250'
          : activeFlavor === 'tradicional'
          ? 'text-blue-800 bg-blue-50 border-blue-250'
          : 'text-orange-850 bg-orange-50 border-orange-250';
      return (
        <span>
          {parts[0]}
          <span className={`font-extrabold px-1.5 py-0.5 rounded border inline-block ${highlightColorClass}`}>
            {genericName}
          </span>
          {parts[1]}
        </span>
      );
    }
    return text;
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
    setLoadingStepText('Analisando harmonização virtual...');

    const steps = [
      { progress: 15, text: 'Mapeando ingredientes da geladeira virtual...' },
      { progress: 35, text: `Analisando assinatura e emulsão da ${currentFlavorData.fullName}...` },
      { progress: 60, text: 'Ajustando técnicas mundiais de alta culinária...' },
      { progress: 85, text: 'Formatando os passos da Masterclass interativa...' },
      { progress: 100, text: 'Receita calculada com perfeição!' }
    ];

    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            const base = baseRecipes[selectedProtein]?.[selectedOccasion] || baseRecipes.peixe.romantico;
            
            // Dynamic Composition Engine: clone structure
            let recipe = JSON.parse(JSON.stringify(base));

            // Dynamic Title Rewrite based on active flavor
            recipe.name = recipe.name.replace("Dubola", currentFlavorData.fullName);

            // Dynamic Ingredients Inject
            recipe.ingredients = recipe.ingredients.map(ing => {
              if (ing.includes("Maionese Dubola")) {
                return `4 colheres de sopa de ${currentFlavorData.fullName} (a assinatura do prato)`;
              }
              return ing;
            });
            
            // Inject dynamic ingredient if not already in list
            const flavorIng = `4 colheres de sopa de ${currentFlavorData.fullName} (o elemento de harmonização química)`;
            if (!recipe.ingredients.some(i => i.includes(currentFlavorData.fullName))) {
              recipe.ingredients.splice(1, 0, flavorIng);
            }

            // Assign professional techniques based on active flavor and protein/occasion
            const techBase = baseTechniques[selectedProtein]?.[selectedOccasion] || baseTechniques.peixe.romantico;
            
            // Flavor customized sensory cues
            let flavorSensoryCues = {
              visual: "O creme se espalha harmoniosamente criando uma crosta aveludada.",
              acoustic: "Um chiado suave de bolhas térmicas estabilizadas no prato.",
              tactile: "Equilíbrio térmico e elasticidade aveludada imediata ao garfar."
            };

            if (activeFlavor === 'alho') {
              flavorSensoryCues = {
                visual: "Você verá pequenos pontinhos dourados aromáticos flutuarem no creme roxo-púrpura derretendo.",
                acoustic: "O chiado sutil do alho liberando óleos essenciais ao tocar a proteína.",
                tactile: "Uma cremosidade encorpada, aveludada e quente."
              };
            } else if (activeFlavor === 'tradicional') {
              flavorSensoryCues = {
                visual: "O salmão brilha sob uma camada sedosa e lisa de cor marfim clássico.",
                acoustic: "Silêncio perfeito. A emulsão estabiliza a proteína na temperatura ideal.",
                tactile: "Aveludado macio que derrete instantaneamente na boca."
              };
            } else if (activeFlavor === 'tartaro') {
              flavorSensoryCues = {
                visual: "Destaques esverdeados de picles finos e tons vermelhos de cebola roxa flutuando no creme.",
                acoustic: "Um estalo sutil das sementes de mostarda e do picles sob os talheres.",
                tactile: "Contraste vibrante entre o quente da proteína e a crocância fria dos picles."
              };
            }

            recipe.technique = {
              name: techBase.name,
              description: techBase.description,
              science: activeFlavor === 'alho' 
                ? "Os óleos sulfurados do alho ligam-se termicamente aos amidos e gorduras da proteína, amaciando a textura e liberando compostos altamente voláteis que estimulam as papilas olfativas."
                : activeFlavor === 'tradicional'
                ? "A perfeita emulsão de ovos caipiras e óleos leves cria uma barreira lipídica protetora que impede o escape dos sucos internos da carne, mantendo-a incrivelmente suculenta."
                : "Os ácidos cítricos do limão e os ácidos láticos dos picles quebram as cadeias lipídicas pesadas na superfície da proteína grelhada, ativando uma resposta de frescor imediato no paladar.",
              sensoryCues: flavorSensoryCues,
              glossary: {
                "Reação de Maillard": "Reação entre aminoácidos e açúcares redutores sob calor que dá sabor tostado rico.",
                "Napar": "Cobrir um alimento por inteiro com uma camada uniforme de molho espesso de forma escultural.",
                "Confitar": "Cozimento extremamente lento de alimentos totalmente submersos em gordura morna aromatizada."
              }
            };

            // Custom Virtual Fridge additions injection
            const customIngredients = customIngredient
              ? customIngredient.split(',').map(item => item.trim()).filter(Boolean)
              : [];
            
            const allAdditions = [...selectedExtras, ...customIngredients];

            if (allAdditions.length > 0) {
              let additionsText = "";
              if (allAdditions.length === 1) {
                additionsText = allAdditions[0];
              } else {
                additionsText = allAdditions.slice(0, -1).join(', ') + ' & ' + allAdditions[allAdditions.length - 1];
              }

              // Adjust title
              recipe.name = `${recipe.name} com Toque de ${additionsText}`;

              // Inject ingredients
              allAdditions.forEach(addition => {
                recipe.ingredients.push(`50g de ${addition} especial fresco(a)`);
              });

              // Add dynamic steps
              let prepSteps = [];
              let integrationSteps = [];
              let secrets = [];

              selectedExtras.forEach(extra => {
                if (extra === 'Abacate') {
                  prepSteps.push("Prepare um leque de Abacate temperado com gotas de limão para base de frescor.");
                  integrationSteps.push(`Disponha o abacate na base do prato, aplicando a ${currentFlavorData.fullName} logo acima.`);
                  secrets.push("A gordura natural do abacate traz doçura suave que suaviza a picância do alho ou acidez do tártaro.");
                } else if (extra === 'Tomate Cereja') {
                  prepSteps.push("Toste os Tomates Cereja em frigideira quente com azeite até as cascas estouraram.");
                  integrationSteps.push("Salpique os tomates tostados sobre a montagem para infusão de sucos quentes.");
                  secrets.push("O tomate tostado adiciona umami ácido quente que ativa a maionese.");
                } else if (extra === 'Bacon Crocante') {
                  prepSteps.push("Frite tiras de bacon em fogo baixo até ficarem extremamente crocantes e secas.");
                  integrationSteps.push(`Salpique bacon esmigalhado sobre a ${currentFlavorData.fullName} no final.`);
                  secrets.push("A crocância defumada do bacon cria um contraste tátil maravilhoso com a emulsão macia.");
                } else if (extra === 'Queijo Ralado') {
                  prepSteps.push("Crie uma tuile crocante e rendada dourando o queijo ralado na frigideira.");
                  integrationSteps.push("Posicione a tuile de queijo dourada ao lado da proteína.");
                  secrets.push("O queijo tostado enriquece a receita com sal marinho curado.");
                } else if (extra === 'Alecrim') {
                  prepSteps.push("Frite o alecrim fresco em azeite quente por 30 segundos até perfumar.");
                  integrationSteps.push("Decore com as agulhas crocantes de alecrim frito.");
                  secrets.push("Os óleos do alecrim criam ponte aromática perfeita com os temperos da maionese.");
                } else if (extra === 'Rúcula') {
                  prepSteps.push("Misture as folhas de rúcula com um fio leve de azeite extra virgem.");
                  integrationSteps.push("Monte um ninho verde de rúcula fresca sob a proteína quente.");
                  secrets.push("O picante vegetal da rúcula dá leveza e equilíbrio à untuosidade.");
                } else if (extra === 'Limão Siciliano') {
                  prepSteps.push("Use um ralador microplane para colher raspas finas e cítricas de limão siciliano.");
                  integrationSteps.push(`Finalize borrifando raspas cítricas e gotas frescas sobre a ${currentFlavorData.fullName}.`);
                  secrets.push("O perfume e acidez do limão limpam o paladar e realçam as ervas.");
                } else if (extra === 'Alcaparras') {
                  prepSteps.push("Seque e frite as alcaparras em azeite fervente por 1 minuto até abrirem.");
                  integrationSteps.push("Disponha as alcaparras crocantes por cima para pequenas explosões salinas.");
                  secrets.push("Fritar alcaparras retira a acidez forte da conserva, deixando-as com sabor tostado.");
                }
              });

              customIngredients.forEach(custom => {
                prepSteps.push(`Prepare o/a ${custom} fresco(a) salteando com azeite até liberar os aromas naturais.`);
                integrationSteps.push(`Incorpore delicadamente o/a ${custom} cozido(a) na lateral do prato.`);
                secrets.push(`O ingrediente caseiro ${custom} adiciona um toque rústico único e exclusivo.`);
              });

              recipe.steps.splice(2, 0, ...prepSteps);
              recipe.steps.splice(recipe.steps.length - 1, 0, ...integrationSteps);
              
              if (secrets.length > 0) {
                recipe.chefSecret = `${recipe.chefSecret || ""} ${secrets.join(' ')}`;
              }
            }

            // Dynamic Sophistication Index
            let baseScore = 65;
            if (selectedProtein === 'peixe') baseScore = 72;
            else if (selectedProtein === 'burguer') baseScore = 60;
            else if (selectedProtein === 'camarao') baseScore = 84;
            else if (selectedProtein === 'cogumelos') baseScore = 76;
            
            let occasionBonus = 0;
            if (selectedOccasion === 'romantico') occasionBonus = 15;
            else if (selectedOccasion === 'churrasco') occasionBonus = 10;
            
            const extraBonus = selectedExtras.length * 3 + (customIngredient ? 5 : 0);
            recipe.sophisticationScore = Math.min(100, baseScore + occasionBonus + extraBonus);

            // Structure Steps for Masterclass Mode
            recipe.steps = recipe.steps.map((text, idx) => {
              let category = "Execução";
              let cues = null;
              
              const stepLower = text.toLowerCase();
              if (idx === 0) {
                category = "Mise en Place (Organização)";
              } else if (stepLower.includes("grelhar") || stepLower.includes("selar") || stepLower.includes("frite") || stepLower.includes("assar") || stepLower.includes("sauté") || stepLower.includes("tostar")) {
                category = "Cocção e Técnica";
                cues = recipe.technique.sensoryCues;
              } else if (stepLower.includes("descansar") || stepLower.includes("repousar") || stepLower.includes("descanso")) {
                category = "Descanso Térmico";
                cues = {
                  visual: "Você verá as fibras da proteína relaxarem, retendo os sucos celulares no centro da carne.",
                  acoustic: "Silêncio perfeito. A panela está fria e a proteína repousa sossegada.",
                  tactile: "Ao tocar a lateral com a colher, ela oferece maciez resiliente e elástica."
                };
              } else if (stepLower.includes("maionese") || stepLower.includes("crema") || stepLower.includes("dubola") || stepLower.includes("alho") || stepLower.includes("tártaro") || stepLower.includes("tradicional")) {
                category = "Napar e Harmonização";
                cues = {
                  visual: `A ${currentFlavorData.fullName} deve coroar a proteína, derretendo levemente nas bordas.`,
                  acoustic: "Ruído zero. A textura cremosa e fresca envolve o prato.",
                  tactile: "Uma mistura de contrastes térmicos fantástica ao primeiro corte."
                };
              } else if (stepLower.includes("prepare") || stepLower.includes("misture") || stepLower.includes("corte")) {
                category = "Preparo de Acompanhamentos";
              }

              // Replace generic Maionese Dubola in steps with fullName
              let stepTextClean = text.replace("Maionese Dubola", currentFlavorData.fullName);

              return {
                text: stepTextClean,
                category: category,
                cues: cues
              };
            });

            // Reset Masterclass
            setViewMode('standard');
            setActiveStepIndex(0);
            setCompletedSteps([]);

            setGeneratedRecipe(recipe);
            setRecipeState('ready');
          }, 300);
          return 100;
        }

        const nextVal = prev + 5;
        const matchingStep = steps.find(s => nextVal >= s.progress && nextVal < (s.progress + 10));
        if (matchingStep) {
          setLoadingStepText(matchingStep.text);
        }
        return nextVal;
      });
    }, 100);
  };

  const currentPairings = currentFlavorData.pairings;

  // Active hotspots coordinates mapped specifically to the group bottles image
  // Left Bottle: Alho, Center Bottle: Tradicional, Right Bottle: Tártaro
  const hotspots = [
    {
      id: 'alho-bottle',
      x: '22%',
      y: '35%',
      flavor: 'alho',
      title: 'Maionese Dubola Alho',
      desc: 'Toque rústico de alhos nobres selecionados, com textura de emulsão super encorpada e picância na medida ideal.'
    },
    {
      id: 'tradicional-bottle',
      x: '50%',
      y: '32%',
      flavor: 'tradicional',
      title: 'Maionese Dubola Tradicional',
      desc: 'A pureza e o equilíbrio dos clássicos com ovos caipiras e acidez sutil de limão siciliano orgânico.'
    },
    {
      id: 'tartaro-bottle',
      x: '78%',
      y: '35%',
      flavor: 'tartaro',
      title: 'Maionese Dubola Tártaro',
      desc: 'Equilíbrio litorâneo perfeito de picles de pepinos em conserva artesanal, mostarda em grãos e cebola roxa fresca.'
    },
    // Ingredient Hotspots dispostos na base real da foto
    {
      id: 'ing-alho-cebola',
      x: '14%',
      y: '78%',
      title: 'Alho Rústico & Cebola Roxa',
      desc: 'Especiarias frescas colhidas sob rigorosos padrões para garantir aroma marcante e sabor persistente sem acidez agressiva.'
    },
    {
      id: 'ing-cenoura-azeitona',
      x: '48%',
      y: '82%',
      title: 'Cenouras & Azeitonas Nobres',
      desc: 'Textura e frescor que compõem o visual premium e adicionam notas adocicadas e salinas orgânicas.'
    },
    {
      id: 'ing-picles-ervas',
      x: '72%',
      y: '80%',
      title: 'Picles Crocantes & Ervas Finas',
      desc: 'Trabalhados milimetricamente de acordo com a nossa receita caseira secreta para crocância real que você mastiga.'
    },
    {
      id: 'ing-sal-pimenta',
      x: '86%',
      y: '88%',
      title: 'Flor de Sal & Pimenta Ativa',
      desc: 'Finalização tátil que realça as papilas gustativas através do perfeito balanço mineral.'
    }
  ];

  return (
    <div 
      className={`min-h-screen font-sans transition-all duration-700 overflow-x-hidden relative ${
        isDarkMode ? 'text-stone-100' : 'text-stone-900'
      } ${getFlavorBg(activeFlavor, isDarkMode)}`}
      style={{
        backgroundImage: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, ${
          isDarkMode ? currentFlavorData.glowColor : 'rgba(234, 88, 12, 0.04)'
        } 0%, transparent 65%)`
      }}
    >
      {/* Background Grid Particles */}
      <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,${
        isDarkMode ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.02)'
      }_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-30`}></div>

      {/* Dynamic Ambient Blur Glows */}
      <div className={`absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none transition-all duration-700 ${
        activeFlavor === 'alho' 
          ? (isDarkMode ? 'bg-purple-600/10' : 'bg-purple-600/4') 
          : activeFlavor === 'tradicional' 
          ? (isDarkMode ? 'bg-blue-600/10' : 'bg-blue-600/4') 
          : (isDarkMode ? 'bg-orange-600/10' : 'bg-orange-600/4')
      }`}></div>
      <div className={`absolute bottom-1/3 right-10 w-[500px] h-[500px] rounded-full blur-[160px] pointer-events-none transition-all duration-700 ${
        activeFlavor === 'alho' 
          ? (isDarkMode ? 'bg-fuchsia-600/5' : 'bg-fuchsia-600/2') 
          : activeFlavor === 'tradicional' 
          ? (isDarkMode ? 'bg-indigo-600/5' : 'bg-indigo-600/2') 
          : (isDarkMode ? 'bg-amber-600/5' : 'bg-amber-600/2')
      }`}></div>

      {/* Header Navigation */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b px-6 py-4 flex items-center justify-between transition-all duration-500 ${
        getHeaderBgAndBorder(activeFlavor, isDarkMode)
      }`}>
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 group">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-extrabold text-sm shadow-lg transition-all group-hover:scale-105 ${
              activeFlavor === 'alho' 
                ? 'bg-gradient-to-tr from-purple-600 to-fuchsia-600 shadow-purple-600/20' 
                : activeFlavor === 'tradicional' 
                ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-blue-600/20' 
                : 'bg-gradient-to-tr from-[#ea580c] to-[#f97316] shadow-orange-600/20'
            }`}>
              D
            </div>
            <span className={`font-black text-xl tracking-tight transition-colors ${
              isDarkMode ? 'text-white' : 'text-stone-900'
            }`}>DUBOLA</span>
            <span className={`text-[10px] border font-bold px-2 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline-block transition-colors ${currentFlavorData.accentBg}`}>
              LINHA PREMIUM
            </span>
          </Link>
        </div>

        <nav className={`hidden md:flex items-center gap-6 text-sm font-semibold transition-colors duration-500 ${
          isDarkMode ? 'text-stone-300' : 'text-stone-605'
        }`}>
          <a href="#hero" className={`transition-colors duration-300 ${isDarkMode ? 'hover:text-white' : 'hover:text-stone-900'}`}>Maioneses</a>
          <a href="#harmonizacao" className={`transition-colors duration-300 ${isDarkMode ? 'hover:text-white' : 'hover:text-stone-900'}`}>Harmonização</a>
          <a href="#chef-ia" className={`transition-colors duration-300 flex items-center gap-1 ${isDarkMode ? 'hover:text-white' : 'hover:text-stone-900'}`}>
            <Sparkles size={13} className="text-stone-400 animate-pulse" /> Chef IA
          </a>
          <a href="#ingredientes" className={`transition-colors duration-300 ${isDarkMode ? 'hover:text-white' : 'hover:text-stone-900'}`}>Ingredientes</a>
          <a href="#onde-comprar" className={`transition-colors duration-300 ${isDarkMode ? 'hover:text-white' : 'hover:text-stone-900'}`}>Comprar</a>
        </nav>

        <div className="flex items-center gap-4">
          {/* Theme Toggle Switch */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-xl border transition-all duration-300 flex items-center justify-center ${
              isDarkMode 
                ? 'bg-white/5 border-stone-850 text-amber-405 hover:bg-white/10 hover:border-stone-750 shadow-md' 
                : 'bg-white border-stone-200 text-[#ea580c] hover:bg-stone-50 hover:border-stone-300 shadow-sm'
            }`}
            title={isDarkMode ? "Mudar para modo claro" : "Mudar para modo escuro"}
          >
            {isDarkMode ? (
              <Sun size={15} className="transition-transform duration-500 rotate-0 hover:rotate-90" />
            ) : (
              <Moon size={15} className="transition-transform duration-500 rotate-0 hover:-rotate-12" />
            )}
          </button>

          <Link 
            to="/" 
            className={`text-xs font-bold px-4 py-2 rounded-xl transition-all duration-300 border ${
              isDarkMode 
                ? 'text-stone-400 hover:text-white bg-white/5 hover:bg-white/10 border-stone-850 hover:border-stone-750' 
                : 'text-stone-600 hover:text-stone-900 bg-white hover:bg-stone-50 border-stone-200 hover:border-stone-300 shadow-sm'
            }`}
          >
            Dashboard
          </Link>
          <a 
            href="#onde-comprar" 
            className={`text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all hover:scale-[1.02] active:scale-[0.98] ${currentFlavorData.buttonGradient}`}
          >
            COMPRE AGORA
          </a>
        </div>
      </header>

      {/* HERO SECTION WITH DYNAMIC SINGLE-COLUMN LAYOUT AND FLAVOR TABS */}
      <section 
        id="hero" 
        ref={heroRef}
        onMouseMove={handleMouseMove}
        className="relative min-h-[90vh] lg:min-h-[95vh] flex items-center justify-center py-12 lg:py-20 px-6 overflow-hidden"
      >
        <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
          <video
            ref={videoRef}
            preload="auto"
            autoPlay
            muted
            playsInline
            onPlay={() => setIsVideoPlaying(true)}
            onPlaying={() => setIsVideoPlaying(true)}
            onPause={() => setIsVideoPlaying(false)}
            onEnded={(e) => {
              e.target.currentTime = 0;
              setIsVideoPlaying(false);
            }}
            className="w-full h-full object-cover scale-[1.06] origin-center transition-opacity duration-700"
          >
            <source src="/mp_.mp4" type="video/mp4" />
          </video>

          {/* Dynamic Fallback image with fade transition and crop scale */}
          <img 
            src="/maionese-linha.jpg" 
            alt="Maionese Dubola Linha" 
            className={`absolute inset-0 w-full h-full object-cover scale-[1.06] origin-center transition-opacity duration-1000 ${
              isVideoPlaying ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          />
        </div>

        <div className="max-w-7xl mx-auto w-full relative z-20 flex justify-end px-4 sm:px-8 lg:px-16">
          
          {/* Premium Centered Copy Card with dynamic theme text and selector tabs */}
          <div className={`space-y-6 text-center border p-6 sm:p-10 rounded-[36px] shadow-2xl relative z-30 transition-[background-color,border-color,box-shadow] duration-500 max-w-[480px] w-full ${
            isDarkMode 
              ? activeFlavor === 'alho' 
                ? 'bg-[#10081c]/40 backdrop-blur-2xl border-purple-500/10 shadow-purple-950/20' 
                : activeFlavor === 'tradicional' 
                ? 'bg-[#081021]/40 backdrop-blur-2xl border-blue-500/10 shadow-blue-950/20' 
                : 'bg-[#140804]/40 backdrop-blur-2xl border-orange-500/10 shadow-orange-950/20'
              : activeFlavor === 'alho'
              ? 'bg-white/80 backdrop-blur-2xl border-purple-200/50 shadow-purple-100/30'
              : activeFlavor === 'tradicional'
              ? 'bg-white/80 backdrop-blur-2xl border-blue-200/50 shadow-blue-100/30'
              : 'bg-white/80 backdrop-blur-2xl border-orange-200/50 shadow-orange-100/30'
          }`}
          style={{
            transform: `translateY(${scrollY * -0.05}px)`
          }}>
            
            {/* Sabor Fast Selector Tabs */}
            <div className="flex justify-center w-full">
              <div className={`flex flex-wrap gap-2 p-1.5 rounded-2xl border transition-all duration-300 ${
                isDarkMode ? 'bg-stone-950/70 border-stone-850' : 'bg-stone-100/80 border-stone-200'
              }`}>
                {[
                  { id: 'alho', label: 'Sabor Alho' },
                  { id: 'tradicional', label: 'Tradicional' },
                  { id: 'tartaro', label: 'Sabor Tártaro' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFlavor(tab.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                      activeFlavor === tab.id 
                        ? getActiveTabClass(tab.id, isDarkMode)
                        : isDarkMode 
                        ? 'text-stone-400 hover:text-stone-200 hover:bg-white/5' 
                        : 'text-stone-550 hover:text-stone-850 hover:bg-stone-200/50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-center w-full">
              <div className={`inline-flex items-center gap-2 border font-extrabold px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest ${
                isDarkMode ? 'bg-stone-950/45 border-white/5 text-stone-300' : 'bg-white border-stone-200/80 text-stone-705 shadow-sm'
              }`}>
                <Sparkles size={11} className={`animate-spin duration-[5000ms] ${currentFlavorData.accentText}`} /> Portfólio Premium Dubola
              </div>
            </div>

            <div className="space-y-4">
              <h1 className={`text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-tight transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-stone-900'
              }`}>
                {currentFlavorData.slogan.split(' ').map((word, i) => {
                  const length = currentFlavorData.slogan.split(' ').length;
                  if (i >= length - 2) {
                    return (
                      <span key={i} className={`text-transparent bg-clip-text bg-gradient-to-r ${currentFlavorData.accentText} ${
                        activeFlavor === 'alho' ? 'from-purple-500 to-fuchsia-500' : activeFlavor === 'tradicional' ? 'from-blue-600 to-sky-500' : 'from-orange-500 to-amber-500'
                      } ml-1`}>
                        {word}{' '}
                      </span>
                    );
                  }
                  return word + ' ';
                })}
              </h1>
              <p className={`text-sm sm:text-base font-light leading-relaxed max-w-2xl mx-auto transition-colors duration-500 ${
                isDarkMode ? 'text-stone-300' : 'text-stone-605'
              }`}>
                {currentFlavorData.description}
              </p>
            </div>

            {/* Micro Feature Badges */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-y py-5 transition-colors duration-500 ${
              isDarkMode ? 'border-stone-850' : 'border-stone-200'
            }`}>
              <div className="flex flex-col sm:flex-row items-center sm:justify-center text-center sm:text-left gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-550">
                  <Leaf size={16} />
                </div>
                <div>
                  <div className={`text-[10px] font-bold uppercase ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>Saudável</div>
                  <div className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Livre de Transgênicos</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:justify-center text-center sm:text-left gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  activeFlavor === 'alho' ? 'bg-purple-500/10 text-purple-500' : activeFlavor === 'tradicional' ? 'bg-blue-500/10 text-blue-500' : 'bg-orange-500/10 text-orange-500'
                }`}>
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <div className={`text-[10px] font-bold uppercase ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>Garantia</div>
                  <div className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Ingredientes Puros</div>
                </div>
              </div>
            </div>

            {/* Actions CTA buttons */}
            <div className="space-y-3 pt-3 max-w-lg mx-auto w-full">
              <a
                href="#onde-comprar"
                className={`w-full text-white py-4 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 text-center border border-white/10 ${currentFlavorData.buttonGradient}`}
              >
                <ShoppingBag size={14} /> COMPRE AGORA
              </a>
              <a
                href="#chef-ia"
                className={`w-full text-center py-4 rounded-2xl font-bold text-xs border transition-all flex items-center justify-center gap-2 ${
                  isDarkMode 
                    ? 'text-stone-300 bg-white/5 hover:bg-white/10 border-stone-850' 
                    : 'text-stone-700 bg-stone-100 hover:bg-stone-200/70 border-stone-200 shadow-sm'
                }`}
              >
                <Sparkles size={14} className={currentFlavorData.accentText} /> COZINHAR COM IA CHEF
              </a>
            </div>

            <div className={`text-[10px] flex items-center justify-center gap-1.5 transition-colors duration-500 ${
              isDarkMode ? 'text-stone-400' : 'text-stone-500'
            }`}>
              <Info size={11} className={currentFlavorData.accentText} /> 
              <span>Use o seletor acima para alternar entre os sabores</span>
            </div>

          </div>

        </div>
      </section>

      {/* DYNAMIC PAIRING SIMULATOR */}
      <section id="harmonizacao" className={`border-y py-20 relative transition-all duration-700 ${
        isDarkMode ? 'bg-stone-950/40 border-stone-900/60' : 'bg-white/50 border-stone-200/60'
      }`}>
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          
          <div className="text-center space-y-3">
            <div className={`text-xs font-black uppercase tracking-widest ${currentFlavorData.accentText}`}>Experiência Harmonizada</div>
            <h2 className={`text-3xl md:text-4xl font-extrabold transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Combinações Recomendadas</h2>
            <p className={`max-w-xl mx-auto text-sm transition-colors duration-500 ${isDarkMode ? 'text-stone-400' : 'text-stone-605'}`}>
              Descubra como harmonizar a <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>{currentFlavorData.fullName}</span> com proteínas selecionadas para criar sabores inigualáveis.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left buttons selector */}
            <div className="lg:col-span-4 flex flex-col gap-3">
              {[
                { id: 'peixe', label: 'Litoral & Peixes', icon: Fish, tag: 'Harmonia Clássica' },
                { id: 'burguer', label: 'Smash Burgers', icon: Flame, tag: 'Toque de Bistrô' },
                { id: 'batatas', label: 'Dips & Batatas', icon: Grid, tag: 'Acompanhamento Ideal' },
                { id: 'camarao', label: 'Frutos do Mar', icon: UtensilsCrossed, tag: 'Crocância e Sabor' }
              ].map((item) => {
                const PairingIcon = item.icon;
                const isActive = selectedPairing === item.id;
                
                let activePairingButtonClass = getPairingActiveButtonClass(activeFlavor, isDarkMode);

                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedPairing(item.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-4 ${
                      isActive 
                        ? 'border shadow-lg ' + activePairingButtonClass
                        : isDarkMode
                        ? 'bg-white/[0.01] border-stone-900 text-stone-400 hover:text-stone-250 hover:bg-white/[0.02] hover:border-stone-800'
                        : 'bg-white border-stone-200/80 text-stone-600 hover:text-stone-900 hover:bg-stone-50 hover:border-stone-300 shadow-sm'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isActive 
                        ? activeFlavor === 'alho' ? 'bg-purple-600 text-white' : activeFlavor === 'tradicional' ? 'bg-blue-600 text-white' : 'bg-orange-600 text-white'
                        : isDarkMode ? 'bg-stone-900 ' + currentFlavorData.accentText : 'bg-stone-100 ' + currentFlavorData.accentText
                    }`}>
                      <PairingIcon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-[10px] uppercase tracking-wider font-extrabold mb-0.5 ${currentFlavorData.accentText}`}>{item.tag}</div>
                      <div className={`font-bold text-sm truncate ${isActive ? (isDarkMode ? 'text-white' : 'text-stone-900') : (isDarkMode ? 'text-stone-300' : 'text-stone-700')}`}>{item.label}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right details card */}
            <div className={`border rounded-3xl p-6 md:p-8 space-y-6 min-h-[320px] flex flex-col justify-between shadow-2xl relative overflow-hidden transition-all duration-500 ${
              isDarkMode ? 'bg-stone-950/70 border-stone-850' : 'bg-white border-stone-200'
            }`}>
              <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[40px] pointer-events-none transition-colors ${
                activeFlavor === 'alho' ? 'bg-purple-600/5' : activeFlavor === 'tradicional' ? 'bg-blue-600/5' : 'bg-orange-600/5'
              }`}></div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] border font-black px-3 py-1 rounded-full uppercase tracking-wider ${currentFlavorData.accentBg}`}>
                    Combinação Aprovada
                  </span>
                  <div className={`flex items-center gap-4 text-xs ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                    <span className="flex items-center gap-1">
                      <Clock size={13} className={currentFlavorData.accentText} /> {currentPairings[selectedPairing].time}
                    </span>
                    <span className="flex items-center gap-1">
                      <Flame size={13} className={currentFlavorData.accentText} /> {currentPairings[selectedPairing].difficulty}
                    </span>
                  </div>
                </div>

                <h3 className={`text-xl md:text-2xl font-black ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>{currentPairings[selectedPairing].title}</h3>
                
                <p className={`text-sm leading-relaxed font-light ${isDarkMode ? 'text-stone-300' : 'text-stone-605'}`}>
                  {currentPairings[selectedPairing].desc}
                </p>
              </div>

              <div className={`border rounded-2xl p-4 flex items-start gap-3 transition-colors duration-500 ${
                isDarkMode ? 'bg-stone-950 border-white/5' : 'bg-stone-50 border-stone-200'
              }`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  activeFlavor === 'alho' ? 'bg-purple-500/10 text-purple-500' : activeFlavor === 'tradicional' ? 'bg-blue-500/10 text-blue-500' : 'bg-orange-500/10 text-orange-500'
                }`}>
                  <Lightbulb size={16} />
                </div>
                <div>
                  <div className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${currentFlavorData.accentText}`}>Dica de Ouro</div>
                  <p className={`text-xs leading-relaxed font-normal ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                    {currentPairings[selectedPairing].tips}
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* IA CHEF RECIPE GENERATOR */}
      <section id="chef-ia" className={`relative py-24 border-t transition-colors duration-705 ${
        isDarkMode ? 'bg-gradient-to-b from-stone-950/20 to-[#0c0615]/10 border-stone-900/40' : 'bg-gradient-to-b from-white/30 to-[#f9f5fc]/40 border-stone-200/50'
      } overflow-hidden`}>
        {/* Ambient Blur Glows */}
        <div className={`absolute top-1/2 left-0 w-96 h-96 rounded-full blur-[120px] pointer-events-none transition-colors ${
          activeFlavor === 'alho' ? 'bg-purple-600/5' : activeFlavor === 'tradicional' ? 'bg-blue-600/5' : 'bg-orange-600/5'
        }`}></div>
        <div className={`absolute bottom-0 right-0 w-80 h-80 rounded-full blur-[100px] pointer-events-none transition-colors ${
          activeFlavor === 'alho' ? 'bg-fuchsia-600/5' : activeFlavor === 'tradicional' ? 'bg-indigo-600/5' : 'bg-amber-600/5'
        }`}></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10 space-y-12">
          <div className="text-center space-y-3">
            <div className={`inline-flex items-center gap-1.5 border font-extrabold px-3.5 py-1.5 rounded-full text-xs uppercase tracking-widest ${currentFlavorData.accentBg}`}>
              <Sparkles size={12} className="animate-spin duration-[6000ms]" /> Alta Gastronomia em Casa
            </div>
            <h2 className={`text-3xl md:text-5xl font-black tracking-tight transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Criador de Receitas com IA Chef</h2>
            <p className={`max-w-xl mx-auto text-sm leading-relaxed font-light transition-colors duration-500 ${isDarkMode ? 'text-stone-400' : 'text-stone-605'}`}>
              Escolha a proteína e a ocasião gastronômica. Nosso chef virtual gerará uma receita profissional explicada passo a passo usando a <strong className={isDarkMode ? 'text-white' : 'text-stone-900'}>{currentFlavorData.fullName}</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Control Panel Card */}
            <div className={`backdrop-blur-xl border p-6 md:p-8 rounded-3xl shadow-2xl space-y-6 transition-all duration-500 ${
              isDarkMode ? 'bg-[#121214]/85 border-stone-850' : 'bg-white border-stone-200'
            }`}>
              <div className="space-y-4">
                <label className={`text-xs font-black uppercase tracking-wider flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-stone-800'}`}>
                  <Fish size={14} className={currentFlavorData.accentText} /> 1. Escolha a Proteína Principal
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'peixe', label: 'Salmão/Peixe' },
                    { id: 'burguer', label: 'Hambúrguer' },
                    { id: 'camarao', label: 'Camarão' },
                    { id: 'cogumelos', label: 'Cogumelos' },
                    { id: 'batatas', label: 'Batatas' }
                  ].map(prot => (
                    <button
                      key={prot.id}
                      onClick={() => setSelectedProtein(prot.id)}
                      className={`py-3 px-2 rounded-xl text-[11px] font-bold text-center border transition-all ${
                        selectedProtein === prot.id
                          ? activeFlavor === 'alho' ? 'bg-purple-500/10 border-purple-500 text-purple-505 font-extrabold shadow-sm' : activeFlavor === 'tradicional' ? 'bg-blue-500/10 border-blue-500 text-blue-505 font-extrabold shadow-sm' : 'bg-orange-500/10 border-orange-500 text-orange-505 font-extrabold shadow-sm'
                          : isDarkMode 
                          ? 'bg-stone-900 border-stone-850 text-stone-400 hover:text-stone-200 hover:bg-stone-800' 
                          : 'bg-stone-50 border-stone-200 text-stone-605 hover:text-stone-900 hover:bg-stone-100'
                      }`}
                    >
                      {prot.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className={`text-xs font-black uppercase tracking-wider flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-stone-800'}`}>
                  <Compass size={14} className={currentFlavorData.accentText} /> 2. Qual é a Ocasião?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'romantico', label: 'Jantar Romântico' },
                    { id: 'almoco', label: 'Almoço Prático' },
                    { id: 'churrasco', label: 'Churrasco com Amigos' },
                    { id: 'brunch', label: 'Brunch Especial' }
                  ].map(occ => (
                    <button
                      key={occ.id}
                      onClick={() => setSelectedOccasion(occ.id)}
                      className={`py-3 px-3 rounded-xl text-xs font-bold text-center border transition-all ${
                        selectedOccasion === occ.id
                          ? activeFlavor === 'alho' ? 'bg-purple-500/10 border-purple-500 text-purple-505 font-extrabold shadow-sm' : activeFlavor === 'tradicional' ? 'bg-blue-500/10 border-blue-500 text-blue-505 font-extrabold shadow-sm' : 'bg-orange-500/10 border-orange-500 text-orange-505 font-extrabold shadow-sm'
                          : isDarkMode 
                          ? 'bg-stone-900 border-stone-850 text-stone-400 hover:text-stone-200 hover:bg-stone-800' 
                          : 'bg-stone-50 border-stone-200 text-stone-605 hover:text-stone-900 hover:bg-stone-100'
                      }`}
                    >
                      {occ.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Virtual Fridge Ingredients */}
              <div className={`space-y-4 pt-2 border-t transition-colors duration-500 ${isDarkMode ? 'border-stone-850' : 'border-stone-200'}`}>
                <label className={`text-xs font-black uppercase tracking-wider flex items-center justify-between ${isDarkMode ? 'text-white' : 'text-stone-800'}`}>
                  <span className="flex items-center gap-2">
                    <Grid size={14} className={currentFlavorData.accentText} /> 3. Geladeira Virtual (Opcional)
                  </span>
                  <span className={`text-[10px] font-normal ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>Selecione para acrescentar</span>
                </label>

                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                  {extraOptions.map(opt => {
                    const isSelected = selectedExtras.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleToggleExtra(opt.id)}
                        className={`flex items-center justify-between p-3 rounded-xl text-left text-xs border transition-all ${
                          isSelected
                            ? activeFlavor === 'alho' ? 'bg-purple-500/5 border-purple-500/40 text-purple-505 font-bold' : activeFlavor === 'tradicional' ? 'bg-blue-500/5 border-blue-500/40 text-blue-505 font-bold' : 'bg-orange-500/5 border-orange-500/40 text-orange-505 font-bold'
                            : isDarkMode
                            ? 'bg-stone-950 border-stone-900 text-stone-400 hover:text-stone-250 hover:bg-stone-900/50'
                            : 'bg-stone-50 border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {isSelected ? (
                          <Check size={12} className={currentFlavorData.accentText} />
                        ) : (
                          <span className="text-[9px] text-stone-500">+</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Custom input box */}
                <div className="space-y-2">
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-stone-450' : 'text-stone-500'}`}>Escreva outro ingrediente extra</span>
                  <input
                    type="text"
                    value={customIngredient}
                    onChange={(e) => setCustomIngredient(e.target.value)}
                    placeholder="Ex: Cogumelo Seco, Castanhas, Abobrinha..."
                    className={`w-full rounded-xl px-4 py-3 text-xs focus:outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-stone-950 border border-stone-900 hover:border-stone-800 text-white placeholder:text-stone-550 focus:border-stone-750 focus:ring-1 focus:ring-stone-750' 
                        : 'bg-stone-50 border border-stone-200 hover:border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-stone-450 focus:ring-1 focus:ring-stone-450'
                    }`}
                  />
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleGenerateRecipe}
                disabled={recipeState === 'loading'}
                className={`w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-white/5 ${
                  recipeState === 'loading' ? 'bg-stone-800 text-stone-500' : currentFlavorData.buttonGradient
                }`}
              >
                {recipeState === 'loading' ? (
                  <span>CALIBRANDO RECEITA DE CHEF...</span>
                ) : (
                  <>
                    <Sparkles size={14} className="animate-pulse" /> GERAR RECEITA EXCLUSIVA
                  </>
                )}
              </button>
            </div>

            {/* Generated Recipe Screen */}
            <div className="lg:col-span-7 min-h-[460px] flex flex-col items-center justify-center">
              
              {/* State: Idle */}
              {recipeState === 'idle' && (
                <div className={`w-full border rounded-3xl p-12 text-center space-y-4 shadow-sm transition-all duration-500 ${
                  isDarkMode ? 'bg-[#121214]/50 border-stone-900' : 'bg-white border-stone-200 shadow-sm'
                }`}>
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto border ${
                    isDarkMode ? 'bg-stone-950 border-stone-850 text-stone-500' : 'bg-stone-50 border-stone-200 text-stone-400 shadow-inner'
                  }`}>
                    <ChefHat size={28} />
                  </div>
                  <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Receita não iniciada</h3>
                  <p className={`text-xs max-w-sm mx-auto leading-relaxed font-light ${isDarkMode ? 'text-stone-400' : 'text-stone-505'}`}>
                    Escolha a proteína e a ocasião no painel ao lado e clique em **Gerar Receita** para iniciar a mentoria gastronômica.
                  </p>
                </div>
              )}

              {/* State: Loading */}
              {recipeState === 'loading' && (
                <div className={`w-full border rounded-3xl p-12 text-center space-y-6 shadow-2xl transition-all duration-500 ${
                  isDarkMode ? 'bg-[#121214]/70 border-stone-850' : 'bg-white border-stone-200'
                }`}>
                  <div className="relative w-16 h-16 mx-auto">
                    <div className={`w-full h-full rounded-2xl animate-spin duration-[3000ms] border-2 border-t-transparent ${
                      activeFlavor === 'alho' ? 'border-purple-600' : activeFlavor === 'tradicional' ? 'border-blue-600' : 'border-orange-600'
                    }`}></div>
                    <ChefHat size={20} className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${currentFlavorData.accentText}`} />
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className={`text-sm font-bold uppercase tracking-widest ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>IA Chef Dubola</h4>
                    <p className={`text-xs max-w-xs mx-auto animate-pulse font-normal ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>{loadingStepText}</p>
                  </div>

                  {/* Progress bar container */}
                  <div className={`w-full h-1 rounded-full overflow-hidden max-w-xs mx-auto ${isDarkMode ? 'bg-stone-900' : 'bg-stone-200'}`}>
                    <div 
                      className={`h-full transition-all duration-300 ${
                        activeFlavor === 'alho' ? 'bg-purple-600' : activeFlavor === 'tradicional' ? 'bg-blue-600' : 'bg-orange-600'
                      }`}
                      style={{ width: `${loadingProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* State: Ready */}
              {recipeState === 'ready' && generatedRecipe && (
                <div className={`w-full border rounded-3xl overflow-hidden shadow-2xl space-y-0 text-left animate-in fade-in zoom-in-98 duration-300 transition-all duration-500 ${
                  isDarkMode ? 'bg-[#121214]/90 border-stone-850' : 'bg-white border-stone-250 shadow-stone-100/30'
                }`}>
                  
                  {/* Recipe Header Panel */}
                  <div className={`p-6 md:p-8 border-b space-y-4 relative ${
                    isDarkMode 
                      ? activeFlavor === 'alho' ? 'bg-purple-950/10 border-stone-850/80' : activeFlavor === 'tradicional' ? 'bg-blue-950/10 border-stone-850/80' : 'bg-orange-950/10 border-stone-850/80'
                      : activeFlavor === 'alho' ? 'bg-purple-50/50 border-stone-200/80' : activeFlavor === 'tradicional' ? 'bg-blue-50/50 border-stone-200/80' : 'bg-orange-50/50 border-stone-200/80'
                  }`}>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <span className={`text-[9px] border font-black px-3 py-1 rounded-full uppercase tracking-wider ${currentFlavorData.accentBg}`}>
                        Receita Calibrada
                      </span>
                      
                      {/* Sophistication Index Slider Gauge */}
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] uppercase font-black tracking-widest ${isDarkMode ? 'text-stone-450' : 'text-stone-500'}`}>Índice de Sofisticação</span>
                        <div className={`border rounded-xl px-3 py-1 flex items-center gap-1.5 shadow-inner ${
                          isDarkMode ? 'bg-stone-950 border-stone-900' : 'bg-stone-50 border-stone-200'
                        }`}>
                          <span className={`text-xs font-black ${currentFlavorData.accentText}`}>{generatedRecipe.sophisticationScore}%</span>
                          <span className={`text-[9px] font-bold uppercase ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                            {generatedRecipe.sophisticationScore > 85 ? 'Michelin' : generatedRecipe.sophisticationScore > 70 ? 'Gourmet' : 'Bistrô'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <h3 className={`text-xl md:text-3xl font-black leading-tight ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                      {generatedRecipe.name}
                    </h3>

                    {/* Metadata line */}
                    <div className={`flex flex-wrap gap-4 text-xs border-t pt-4 ${isDarkMode ? 'text-stone-400 border-stone-900/60' : 'text-stone-500 border-stone-200/60'}`}>
                      <span className="flex items-center gap-1.5"><Clock size={13} className={currentFlavorData.accentText} /> {generatedRecipe.prepTime}</span>
                      <span className="flex items-center gap-1.5"><Flame size={13} className={currentFlavorData.accentText} /> Nível {generatedRecipe.difficulty}</span>
                      <span className="flex items-center gap-1.5"><UtensilsCrossed size={13} className={currentFlavorData.accentText} /> {generatedRecipe.servings}</span>
                    </div>

                    {/* Standard or Masterclass Selector Tab */}
                    <div className={`flex p-0.5 border rounded-xl w-fit mt-2 ${
                      isDarkMode ? 'bg-stone-950 border-stone-850' : 'bg-stone-100 border-stone-200'
                    }`}>
                      <button
                        onClick={() => setViewMode('standard')}
                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                          viewMode === 'standard'
                            ? activeFlavor === 'alho' ? 'bg-purple-600 text-white' : activeFlavor === 'tradicional' ? 'bg-blue-600 text-white' : 'bg-orange-600 text-white'
                            : isDarkMode ? 'text-stone-400 hover:text-stone-200' : 'text-stone-500 hover:text-stone-800'
                        }`}
                      >
                        Ingredientes & Passos
                      </button>
                      <button
                        onClick={() => {
                          setViewMode('masterclass');
                          setActiveStepIndex(0);
                        }}
                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 ${
                          viewMode === 'masterclass'
                            ? activeFlavor === 'alho' ? 'bg-purple-600 text-white' : activeFlavor === 'tradicional' ? 'bg-blue-600 text-white' : 'bg-orange-600 text-white'
                            : isDarkMode ? 'text-stone-400 hover:text-stone-205' : 'text-stone-500 hover:text-stone-800'
                        }`}
                      >
                        <ChefHat size={11} /> Masterclass
                      </button>
                    </div>
                  </div>

                  {/* Mode: Standard (Ingredients and Steps list) */}
                  {viewMode === 'standard' && (
                    <div className="p-6 md:p-8 space-y-8 max-h-[500px] overflow-y-auto custom-scrollbar">
                      
                      {/* Ingredients */}
                      <div className="space-y-4">
                        <h4 className={`text-xs font-black uppercase tracking-wider flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-stone-800'}`}>
                          <Check size={14} className={currentFlavorData.accentText} /> Ingredientes Necessários
                        </h4>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          {generatedRecipe.ingredients.map((ing, idx) => (
                            <li key={idx} className={`border p-3 rounded-xl text-xs leading-relaxed flex items-start gap-2 ${
                              isDarkMode ? 'bg-stone-950/65 border-stone-900 text-stone-300' : 'bg-stone-50 border-stone-200 text-stone-705'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${
                                activeFlavor === 'alho' ? 'bg-purple-500' : activeFlavor === 'tradicional' ? 'bg-blue-500' : 'bg-orange-500'
                              }`} />
                              <span>{highlightMaionese(ing)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Steps List */}
                      <div className={`space-y-4 pt-4 border-t ${isDarkMode ? 'border-stone-900/60' : 'border-stone-200/60'}`}>
                        <h4 className={`text-xs font-black uppercase tracking-wider flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-stone-800'}`}>
                          <BookOpen size={14} className={currentFlavorData.accentText} /> Passo a Passo Recomendado
                        </h4>
                        <ol className="space-y-3">
                          {generatedRecipe.steps.map((step, idx) => (
                            <li key={idx} className={`border p-4 rounded-2xl text-xs leading-relaxed flex items-start gap-3 ${
                              isDarkMode ? 'bg-stone-950/50 border-stone-900/60 text-stone-300' : 'bg-stone-50/70 border-stone-200/80 text-stone-705'
                            }`}>
                              <span className={`w-6 h-6 rounded-lg text-white font-black text-[10px] flex items-center justify-center shrink-0 ${
                                activeFlavor === 'alho' ? 'bg-purple-600' : activeFlavor === 'tradicional' ? 'bg-blue-600' : 'bg-orange-600'
                              }`}>{idx + 1}</span>
                              <div className="flex-1 space-y-1">
                                <span className={`text-[9px] uppercase tracking-wider font-extrabold ${currentFlavorData.accentText}`}>
                                  {step.category}
                                </span>
                                <p className="leading-relaxed font-light">{highlightMaionese(step.text)}</p>
                              </div>
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* Chef's Secret Box */}
                      {generatedRecipe.chefSecret && (
                        <div className={`border rounded-2xl p-4 flex items-start gap-3 transition-colors duration-500 ${
                          isDarkMode 
                            ? activeFlavor === 'alho' ? 'bg-purple-950/5 border-purple-500/15' : activeFlavor === 'tradicional' ? 'bg-blue-950/5 border-blue-500/15' : 'bg-orange-950/5 border-orange-500/15'
                            : activeFlavor === 'alho' ? 'bg-purple-50/50 border-purple-200/50' : activeFlavor === 'tradicional' ? 'bg-blue-50/50 border-blue-200/50' : 'bg-orange-50/50 border-orange-200/50'
                        }`}>
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            activeFlavor === 'alho' ? 'bg-purple-500/10 text-purple-550' : activeFlavor === 'tradicional' ? 'bg-blue-500/10 text-blue-550' : 'bg-orange-500/10 text-orange-550'
                          }`}>
                            <Lightbulb size={16} />
                          </div>
                          <div>
                            <div className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${currentFlavorData.accentText}`}>O Segredo Químico do Chef</div>
                            <p className={`text-xs leading-relaxed font-normal ${isDarkMode ? 'text-stone-400' : 'text-stone-605'}`}>
                              {highlightMaionese(generatedRecipe.chefSecret)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mode: Masterclass Step-by-Step interactive presentation */}
                  {viewMode === 'masterclass' && (
                    <div className="p-6 md:p-8 space-y-6">
                      
                      {/* Active Step presentation card */}
                      <div className={`border rounded-3xl p-5 md:p-6 space-y-4 shadow-inner relative overflow-hidden ${
                        isDarkMode ? 'bg-stone-950 border-stone-900' : 'bg-stone-50 border-stone-200'
                      }`}>
                        
                        <div className={`flex items-center justify-between border-b pb-3 ${isDarkMode ? 'border-stone-900' : 'border-stone-200'}`}>
                          <span className={`text-[10px] uppercase font-black tracking-widest ${currentFlavorData.accentText}`}>
                            {generatedRecipe.steps[activeStepIndex].category}
                          </span>
                          <span className={`text-xs font-bold ${isDarkMode ? 'text-stone-500' : 'text-stone-450'}`}>
                            Passo {activeStepIndex + 1} de {generatedRecipe.steps.length}
                          </span>
                        </div>

                        {/* Interactive Step checkbox to track progress */}
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => {
                              if (completedSteps.includes(activeStepIndex)) {
                                setCompletedSteps(completedSteps.filter(s => s !== activeStepIndex));
                              } else {
                                setCompletedSteps([...completedSteps, activeStepIndex]);
                              }
                            }}
                            className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-1 transition-all ${
                              completedSteps.includes(activeStepIndex)
                                ? activeFlavor === 'alho' ? 'bg-purple-600 border-purple-500 text-white' : activeFlavor === 'tradicional' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-orange-600 border-orange-500 text-white'
                                : isDarkMode
                                ? 'bg-stone-900 border-stone-850 text-transparent hover:border-stone-700'
                                : 'bg-white border-stone-300 text-transparent hover:border-stone-400'
                            }`}
                          >
                            <Check size={14} />
                          </button>
                          
                          <div className="flex-1 space-y-1">
                            <p className={`text-sm md:text-base leading-relaxed font-light ${isDarkMode ? 'text-stone-200' : 'text-stone-800'}`}>
                              {highlightMaionese(generatedRecipe.steps[activeStepIndex].text)}
                            </p>
                          </div>
                        </div>

                        {/* Active Technique Section inside Step */}
                        {generatedRecipe.steps[activeStepIndex].category === 'Cocção e Técnica' && (
                          <div className={`mt-4 pt-4 border-t space-y-3 ${isDarkMode ? 'border-stone-900' : 'border-stone-200'}`}>
                            <div className="flex items-center gap-2">
                              <Zap size={14} className={currentFlavorData.accentText} />
                              <span className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-stone-800'}`}>
                                Técnica Aplicada: {generatedRecipe.technique.name}
                              </span>
                            </div>
                            <p className={`text-xs leading-relaxed font-light ${isDarkMode ? 'text-stone-400' : 'text-stone-605'}`}>
                              {generatedRecipe.technique.description}
                            </p>
                            <div className={`p-3.5 rounded-xl border space-y-1 ${
                              isDarkMode ? 'bg-stone-900/60 border-white/5' : 'bg-white border-stone-200'
                            }`}>
                              <span className={`text-[9px] uppercase font-black tracking-widest flex items-center gap-1 ${currentFlavorData.accentText}`}>
                                <Info size={10} /> Explicação Científica (O Porquê)
                              </span>
                              <p className={`text-[11px] leading-relaxed font-normal ${isDarkMode ? 'text-stone-400' : 'text-stone-605'}`}>
                                {generatedRecipe.technique.science}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Active Sensory cues */}
                        {generatedRecipe.steps[activeStepIndex].cues && (
                          <div className={`mt-4 pt-4 border-t space-y-3 ${isDarkMode ? 'border-stone-900' : 'border-stone-200'}`}>
                            <div className="flex items-center gap-2">
                              <Volume2 size={14} className={currentFlavorData.accentText} />
                              <span className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-stone-800'}`}>
                                Sinais dos Sentidos (Toque do Chef)
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                              <div className={`p-2.5 rounded-xl border ${isDarkMode ? 'bg-stone-900 border-stone-850' : 'bg-white border-stone-200 shadow-sm'}`}>
                                <span className={`text-[9px] font-bold uppercase tracking-wide block mb-0.5 ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>Visão</span>
                                <p className={`text-[10px] leading-relaxed font-light ${isDarkMode ? 'text-stone-300' : 'text-stone-705'}`}>{generatedRecipe.steps[activeStepIndex].cues.visual}</p>
                              </div>
                              <div className={`p-2.5 rounded-xl border ${isDarkMode ? 'bg-stone-900 border-stone-850' : 'bg-white border-stone-200 shadow-sm'}`}>
                                <span className={`text-[9px] font-bold uppercase tracking-wide block mb-0.5 ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>Audição</span>
                                <p className={`text-[10px] leading-relaxed font-light ${isDarkMode ? 'text-stone-300' : 'text-stone-705'}`}>{generatedRecipe.steps[activeStepIndex].cues.acoustic}</p>
                              </div>
                              <div className={`p-2.5 rounded-xl border ${isDarkMode ? 'bg-stone-900 border-stone-850' : 'bg-white border-stone-200 shadow-sm'}`}>
                                <span className={`text-[9px] font-bold uppercase tracking-wide block mb-0.5 ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>Tato</span>
                                <p className={`text-[10px] leading-relaxed font-light ${isDarkMode ? 'text-stone-300' : 'text-stone-705'}`}>{generatedRecipe.steps[activeStepIndex].cues.tactile}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Dynamic Glossary Terms */}
                        {generatedRecipe.steps[activeStepIndex].category === 'Cocção e Técnica' && (
                          <div className="flex flex-wrap gap-2 pt-2">
                            {Object.entries(generatedRecipe.technique.glossary).map(([term, definition]) => (
                              <div key={term} className="group relative">
                                <span className={`text-[10px] border px-2.5 py-1 rounded-lg cursor-help font-bold inline-block transition-colors ${
                                  isDarkMode 
                                    ? 'bg-stone-900 text-stone-300 border-stone-800 hover:border-stone-600' 
                                    : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300 shadow-sm'
                                }`}>
                                  Glossário: {term}
                                </span>
                                <div className={`absolute bottom-full left-0 mb-2 w-64 border text-[10px] rounded-xl p-3 shadow-2xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 pointer-events-none z-50 leading-relaxed ${
                                  isDarkMode 
                                    ? 'bg-stone-950 border-stone-800 text-stone-300' 
                                    : 'bg-white border-stone-200 text-stone-700 shadow-lg'
                                }`}>
                                  <strong className={`block mb-0.5 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>{term}</strong>
                                  {definition}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                      </div>

                      {/* Step slider controls */}
                      <div className={`flex items-center justify-between pt-2 border-t ${isDarkMode ? 'border-stone-900' : 'border-stone-200'}`}>
                        <button
                          disabled={activeStepIndex === 0}
                          onClick={() => setActiveStepIndex(activeStepIndex - 1)}
                          className={`px-4 py-2.5 rounded-xl text-xs font-bold border disabled:opacity-30 disabled:hover:bg-transparent transition-all flex items-center gap-1.5 ${
                            isDarkMode 
                              ? 'border-stone-850 hover:bg-stone-900 hover:text-white text-stone-400' 
                              : 'border-stone-200 hover:bg-stone-105 hover:text-stone-900 text-stone-600 shadow-sm'
                          }`}
                        >
                          <ArrowLeft size={13} /> Anterior
                        </button>

                        {/* Progress Indicators Bar */}
                        <div className="hidden sm:flex items-center gap-1.5">
                          {generatedRecipe.steps.map((_, idx) => (
                            <div 
                              key={idx}
                              onClick={() => setActiveStepIndex(idx)}
                              className={`h-1.5 rounded-full cursor-pointer transition-all duration-300 ${
                                activeStepIndex === idx
                                  ? activeFlavor === 'alho' ? 'w-6 bg-purple-500' : activeFlavor === 'tradicional' ? 'bg-blue-500 w-6' : 'bg-orange-500 w-6'
                                  : completedSteps.includes(idx)
                                  ? activeFlavor === 'alho' ? 'bg-purple-800 w-2.5' : activeFlavor === 'tradicional' ? 'bg-blue-800 w-2.5' : 'bg-orange-800 w-2.5'
                                  : isDarkMode ? 'bg-stone-850 w-2.5 hover:bg-stone-700' : 'bg-stone-250 w-2.5 hover:bg-stone-300'
                              }`}
                            />
                          ))}
                        </div>

                        {activeStepIndex < generatedRecipe.steps.length - 1 ? (
                          <button
                            onClick={() => {
                              // Auto complete current step
                              if (!completedSteps.includes(activeStepIndex)) {
                                setCompletedSteps([...completedSteps, activeStepIndex]);
                              }
                              setActiveStepIndex(activeStepIndex + 1);
                            }}
                            className={`px-5 py-2.5 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${currentFlavorData.buttonGradient}`}
                          >
                             Próximo Passo <ArrowRight size={13} />
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              if (!completedSteps.includes(activeStepIndex)) {
                                setCompletedSteps([...completedSteps, activeStepIndex]);
                              }
                              alert('Parabéns! Você concluiu a Masterclass Culinária Dubola. Agora é só empratar e saborear!');
                            }}
                            className={`px-5 py-2.5 text-white rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 transition-all flex items-center gap-1.5`}
                          >
                            Concluir Aula <Check size={13} />
                          </button>
                        )}
                      </div>

                    </div>
                  )}

                </div>
              )}

            </div>

          </div>

        </div>
      </section>

      {/* MULTI-TAB INGREDIENTS & NUTRITION FACTS */}
      <section id="ingredientes" className={`max-w-6xl mx-auto px-6 py-20 space-y-12 border-t transition-colors duration-700 ${
        isDarkMode ? 'border-stone-900/60' : 'border-stone-200'
      }`}>
        
        <div className="text-center space-y-3">
          <div className={`text-xs font-black uppercase tracking-widest ${currentFlavorData.accentText}`}>Garantia de Qualidade</div>
          <h2 className={`text-3xl md:text-4xl font-extrabold transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Ingredientes & Nutricional</h2>
          <p className={`max-w-xl mx-auto text-sm transition-colors duration-500 ${isDarkMode ? 'text-stone-400' : 'text-stone-605'}`}>
            Nossas maioneses são formuladas com foco em pureza absoluta, livres de transgênicos ou corantes industriais nocivos.
          </p>
        </div>

        <div className={`border p-6 md:p-10 rounded-[32px] shadow-2xl max-w-4xl mx-auto space-y-8 transition-all duration-500 ${
          isDarkMode ? 'bg-[#121214]/65 border-stone-850' : 'bg-white border-stone-200'
        }`}>
          
          {/* Tabs header selector for nutrition table */}
          <div className={`flex justify-center p-1 border rounded-2xl w-fit mx-auto ${
            isDarkMode ? 'bg-stone-950 border-stone-900' : 'bg-stone-100 border-stone-200'
          }`}>
            {[
              { id: 'alho', label: 'Sabor Alho', activeClass: isDarkMode ? 'bg-purple-600/10 border-purple-500 text-purple-400' : 'bg-purple-600 border-purple-600 text-white shadow-sm' },
              { id: 'tradicional', label: 'Tradicional', activeClass: isDarkMode ? 'bg-blue-600/10 border-blue-500 text-blue-400' : 'bg-blue-600 border-blue-600 text-white shadow-sm' },
              { id: 'tartaro', label: 'Sabor Tártaro', activeClass: isDarkMode ? 'bg-orange-600/10 border-orange-500 text-orange-400' : 'bg-orange-500 border-orange-500 text-white shadow-sm' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setNutritionActiveFlavor(tab.id)}
                className={`px-5 py-2.5 rounded-xl text-xs font-black tracking-wider transition-all border ${
                  nutritionActiveFlavor === tab.id
                    ? tab.activeClass
                    : 'border-transparent text-stone-400 hover:text-stone-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start animate-in fade-in duration-300" key={nutritionActiveFlavor}>
            
            {/* Left Col: Ingredients list */}
            <div className="md:col-span-6 space-y-4">
              <h4 className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${isDarkMode ? 'text-white' : 'text-stone-850'}`}>
                <Check size={14} className={FLAVORS[nutritionActiveFlavor].accentText} /> Composição de Ingredientes
              </h4>
              <p className={`text-sm leading-relaxed font-light ${isDarkMode ? 'text-stone-300' : 'text-stone-605'}`}>
                {FLAVORS[nutritionActiveFlavor].nutrition.ingredients}
              </p>
              <div className={`p-4 rounded-2xl border space-y-2.5 ${
                isDarkMode ? 'bg-stone-950 border-stone-900' : 'bg-stone-50 border-stone-200'
              }`}>
                <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold uppercase">
                  <Leaf size={14} /> 100% Livre de Transgênicos
                </div>
                <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-stone-450' : 'text-stone-605'}`}>
                  Utilizamos exclusivamente óleos não modificados geneticamente e ovos de fornecedores auditados e certificados com selo de bem-estar animal.
                </p>
              </div>
            </div>

            {/* Right Col: Official Nutrition Table */}
            <div className={`border rounded-3xl p-5 md:p-6 shadow-inner space-y-4 ${
              isDarkMode ? 'bg-stone-950 border-stone-900' : 'bg-stone-50 border-stone-200'
            }`}>
              <div className={`border-b pb-2 flex items-center justify-between ${isDarkMode ? 'border-stone-900' : 'border-stone-200'}`}>
                <div>
                  <h4 className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-stone-850'}`}>Tabela Nutricional Oficial</h4>
                  <span className={`text-[9px] font-bold uppercase ${isDarkMode ? 'text-stone-500' : 'text-stone-450'}`}>Porção de 12g (1 Colher de Sopa)</span>
                </div>
                <span className={`text-[10px] font-normal ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>Sabor: {FLAVORS[nutritionActiveFlavor].name}</span>
              </div>

              <div className="space-y-2">
                <div className={`grid grid-cols-3 text-[9px] font-black uppercase tracking-widest pb-1 border-b ${
                  isDarkMode ? 'text-stone-450 border-stone-900/60' : 'text-stone-500 border-stone-200'
                }`}>
                  <span>Nutriente</span>
                  <span className="text-right">Quantidade</span>
                  <span className="text-right">%VD (*)</span>
                </div>
                {FLAVORS[nutritionActiveFlavor].nutrition.table.map((row, idx) => (
                  <div key={idx} className={`grid grid-cols-3 text-xs py-1.5 border-b leading-relaxed font-light hover:bg-white/[0.01] ${
                    isDarkMode ? 'text-stone-300 border-stone-900/30' : 'text-stone-700 border-stone-200/50'
                  }`}>
                    <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>{row.label}</span>
                    <span className="text-right font-normal">{row.qty}</span>
                    <span className={`text-right font-bold ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>{row.vd}</span>
                  </div>
                ))}
              </div>

              <span className={`text-[8px] block font-light leading-relaxed ${isDarkMode ? 'text-stone-550' : 'text-stone-450'}`}>
                * % Valores Diários de referência com base em uma dieta de 2.000 kcal ou 8.400 kJ. Seus valores diários podem ser maiores ou menores dependendo de suas necessidades energéticas. (**) VD não estabelecido.
              </span>
            </div>

          </div>

        </div>
      </section>

      {/* WHERE TO BUY SECTION */}
      <section id="onde-comprar" className={`border-t py-24 text-center relative overflow-hidden transition-colors duration-700 ${
        isDarkMode ? 'bg-stone-950 border-stone-900/60' : 'bg-white border-stone-200/80'
      }`}>
        {/* Ambient Ring Pulsing */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border opacity-5 pointer-events-none transition-all duration-700 ${
          activeFlavor === 'alho' ? 'border-purple-400' : activeFlavor === 'tradicional' ? 'border-blue-400' : 'border-orange-400'
        }`}></div>
        
        <div className="max-w-4xl mx-auto px-6 relative z-10 space-y-8">
          <div className="space-y-3">
            <div className={`text-xs font-black uppercase tracking-widest ${currentFlavorData.accentText}`}>Gourmet ao seu Alcance</div>
            <h2 className={`text-3xl md:text-5xl font-black leading-tight transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Consagre Seus Pratos Hoje</h2>
            <p className={`max-w-xl mx-auto text-sm leading-relaxed font-light transition-colors duration-500 ${isDarkMode ? 'text-stone-300' : 'text-stone-605'}`}>
              Leve para sua geladeira o toque premium de sofisticação que consagrará seus lanches, peixes, batatas e receitas caseiras.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
            {/* Alho */}
            <div className={`border p-6 rounded-3xl w-60 shadow-2xl flex flex-col justify-between h-48 transition-all hover:scale-[1.02] duration-300 ${
              isDarkMode ? 'bg-[#121214]/65 border-stone-850 hover:border-purple-500/25' : 'bg-stone-50/80 border-stone-200 hover:border-purple-500/40 shadow-purple-100/10'
            }`}>
              <div className="space-y-1 text-left">
                <span className="text-[10px] text-purple-500 bg-purple-500/10 border border-purple-500/20 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider w-fit block mb-1">Garlic Special</span>
                <h4 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Dubola Sabor Alho</h4>
                <p className={`text-[11px] leading-normal font-light ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>Intenso, rústico e altamente aromático para suas carnes.</p>
              </div>
              <button 
                onClick={() => { setActiveFlavor('alho'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className={`w-full font-bold text-[10px] uppercase py-2.5 rounded-xl border transition-all tracking-wider ${
                  isDarkMode 
                    ? 'bg-stone-900 hover:bg-stone-850 text-white border-stone-800' 
                    : 'bg-white hover:bg-stone-100 text-stone-805 border-stone-300 shadow-sm'
                }`}
              >
                Focar Sabor Alho
              </button>
            </div>

            {/* Tradicional */}
            <div className={`border p-6 rounded-3xl w-60 shadow-2xl flex flex-col justify-between h-48 transition-all hover:scale-[1.02] duration-300 ${
              isDarkMode ? 'bg-[#121214]/65 border-stone-850 hover:border-blue-500/25' : 'bg-stone-50/80 border-stone-200 hover:border-blue-500/40 shadow-blue-100/10'
            }`}>
              <div className="space-y-1 text-left">
                <span className="text-[10px] text-blue-500 bg-blue-500/10 border border-blue-500/20 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider w-fit block mb-1">Standard Gold</span>
                <h4 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Dubola Tradicional</h4>
                <p className={`text-[11px] leading-normal font-light ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>Equilíbrio, leveza e a aveludada emulsão de ovos caipiras.</p>
              </div>
              <button 
                onClick={() => { setActiveFlavor('tradicional'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className={`w-full font-bold text-[10px] uppercase py-2.5 rounded-xl border transition-all tracking-wider ${
                  isDarkMode 
                    ? 'bg-stone-900 hover:bg-stone-850 text-white border-stone-800' 
                    : 'bg-white hover:bg-stone-100 text-stone-805 border-stone-300 shadow-sm'
                }`}
              >
                Focar Tradicional
              </button>
            </div>

            {/* Tártaro */}
            <div className={`border p-6 rounded-3xl w-60 shadow-2xl flex flex-col justify-between h-48 transition-all hover:scale-[1.02] duration-300 ${
              isDarkMode ? 'bg-[#121214]/65 border-stone-850 hover:border-orange-500/25' : 'bg-stone-50/80 border-stone-200 hover:border-orange-500/40 shadow-orange-100/10'
            }`}>
              <div className="space-y-1 text-left">
                <span className="text-[10px] text-orange-500 bg-orange-500/10 border border-orange-500/20 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider w-fit block mb-1">Citric Coastal</span>
                <h4 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Dubola Sabor Tártaro</h4>
                <p className={`text-[11px] leading-normal font-light ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>Acidez cítrica com pedacinhos de picles nobres e cebola.</p>
              </div>
              <button 
                onClick={() => { setActiveFlavor('tartaro'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className={`w-full font-bold text-[10px] uppercase py-2.5 rounded-xl border transition-all tracking-wider ${
                  isDarkMode 
                    ? 'bg-stone-900 hover:bg-stone-850 text-white border-stone-800' 
                    : 'bg-white hover:bg-stone-100 text-stone-805 border-stone-300 shadow-sm'
                }`}
              >
                Focar Sabor Tártaro
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 max-w-sm mx-auto">
            <button className={`w-full py-4 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2 ${currentFlavorData.buttonGradient}`}>
              <Store size={14} /> Localizar Lojas Parceiras
            </button>
            <button className={`w-full py-4 font-black text-xs uppercase tracking-widest rounded-2xl border transition-all ${
              isDarkMode 
                ? 'text-stone-300 bg-white/5 hover:bg-white/10 hover:text-white border-stone-850' 
                : 'text-stone-700 bg-stone-100 hover:bg-stone-200 hover:text-stone-900 border-stone-200 shadow-sm'
            }`}>
              Seja um Distribuidor
            </button>
          </div>

        </div>
      </section>

      {/* Elegant minimalist footer */}
      <footer className={`border-t py-12 text-center text-xs transition-colors duration-500 ${
        isDarkMode ? 'bg-stone-950/70 border-stone-950 text-stone-550' : 'bg-stone-100/90 border-stone-200 text-stone-500'
      }`}>
        <p className="max-w-md mx-auto leading-relaxed">
          &copy; {new Date().getFullYear()} Dubola Alimentos Premium Ltda. Todos os direitos reservados.<br />
          Sabor artesanal, pureza certificada, excelência inegociável.
        </p>
      </footer>
    </div>
  );
}
