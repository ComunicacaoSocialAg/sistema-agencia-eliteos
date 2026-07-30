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
      science: "A gema do ovo frito atua como um emulsificante natural riquíssimo, que se funde quimicamente com os pedaços cítricos da Maionese Tártaro ao se misturarem na boca.",
      description: "Grelhe o burger de sausage artesanal de porco. Na mesma gordura, frite um ovo caipira mantendo a gema perfeitamente mole. Ao montar, coloque a Maionese Tártaro logo abaixo do ovo. A gema e a maionese se fundirão a cada mordida.",
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
      science: "A água e os açúcares liberados pelo camarão se ligam à gordura e à acidez do tártaro e da manteiga fria fora do fogo direto, criando um molho perfeitamente aveludado (glacê).",
      description: "Salteie os camarões rapidamente por 2 minutos. Desligue o fogo. Adicione uma colher de sopa de Maionese Tártaro Dubola e mexa energicamente na panela morna. O calor residual derreterá a maionese envolvendo cada camarão com um molho brilhante.",
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
      description: "Monte os camarões em espetos com casca. Pincele azeite e leve à brasa máxima por 2 minutos de cada lado. O carvão vai tostar a casca. Borrife limão siciliano no final e sirva para descascar na hora, mergulhando no tártaro.",
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
      description: "Coloque os camarões em uma panelinha totalmente cobertos com azeite de oliva morno (cerca de 70°C, fogo ultra baixo) com dentes de alho e alecrim por 6 minutos. Escorra e monte sobre o pão brioche com Maionese Tártaro.",
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
      description: "Doure os cogumelos em manteiga. Quando estiverem bem tostados, despeje uma taça de vinho branco seco. Mexa raspando o fundo da frigideira. Deixe reduzir até restar um molho espesso e brilhante, ligando tudo.",
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
      description: "Coloque os cogumelos fatiados na frigideira bem quente TOTALMENTE SECA. Sem óleo, sem sal. Pressione-os. Eles vão soltar vapor e tostar. Só quando estiverem dourados adicione o azeite, o sal e a Maionese Tártaro.",
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
      description: "Arrume cogumelos inteiros grandes em uma grelha dupla de churrasqueira. Pincele shoyu e azeite. Leve ao fogo médio da churrasqueira. Vire a grelha de tempos em tempos para defumar por igual antes de misturar ao tártaro.",
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
      description: "Fatie cogumelos Paris frescos e coloque em uma assadeira pequena cobertos de azeite extra virgem, alho esmagado e tomilho. Asse em fogo baixo por 20 minutos. Escorra esse azeite perfumado e use os cogumelos amantesigados no topo do avocado toast.",
      sensoryCues: {
        visual: "Cogumelos brilhantes, macios e translúcidos, perfeitamente cozidos.",
        acoustic: "Um cozimento silencioso e perfumado no forno baixo.",
        tactile: "Textura macia amanteigada que derrete ao toque."
      },
      glossary: {
        Confitar: "Cozinhar lentamente alimentos submersos em gordura a temperaturas baixas.",
        Quitina: "Fibra insolúvel que forma as paredes celulares dos cogumelos, resistente ao cozimento comum."
      }
    }
  },
  batatas: {
    romantico: {
      name: "Batatas Fondant à Provençal (Cocção Lenta em Manteiga)",
      science: "Cozinhar as batatas de pé imersas em uma mistura de manteiga derretida e caldo aromático de frango/legumes faz com que o amido da batata absorva a riqueza líquida até o centro.",
      description: "Corte as batatas em cilindros retos. Doure as bases na manteiga. Adicione caldo de legumes aromatizado com alho e alecrim até o meio das batatas. Leve ao forno. O caldo reduz e as batatas absorvem a manteiga, ficando cremosas por dentro.",
      sensoryCues: {
        visual: "O caldo se transforma em uma emulsão dourada, espessa e rica na panela.",
        acoustic: "Um borbulhar suave e ritmado de manteiga e caldo integrados no forno.",
        tactile: "Um garfo entra nas laterais da batata com facilidade absoluta (textura de purê de veludo)."
      },
      glossary: {
        Fondant: "Estilo de cozimento lento em gordura e líquido aromático até o alimento ficar derretendo por dentro."
      }
    },
    almoco: {
      name: "Double-Cook Crisp & Pectina Ativada",
      science: "Ferver as batatas in água com sal e um toque de vinagre ativa a pectina, mantendo os pedaços inteiros. A assagem ou fritura posterior em alta temperatura expande a casca criando micro-bolhas crocantes.",
      description: "Ferva as batatas cortadas em canoa em água salgada com uma colher de vinagre de maçã por 5 minutos. Escorra e seque bem. Envolva em azeite e asse em fogo máximo. O vinagre garante que o interior fique macio e a casca ultra crocante.",
      sensoryCues: {
        visual: "Micro-rugosidades e bolhas douradas de ar na superfície da batata assada, criando uma casca de vidro.",
        acoustic: "O barulho crocante e oco ao chacoalhar as batatas prontas na cesta ou tigela.",
        tactile: "Uma casca rígida que quebra estalando ao ser pressionada."
      },
      glossary: {
        Pectina: "Fibra estrutural das plantas que mantém a rigidez do vegetal ao cozinhar.",
        'Dupla Cocção': "Processo de cozinhar o alimento em duas etapas de temperatura ou métodos diferentes."
      }
    },
    churrasco: {
      name: "Ember-Baking (Assado Rústico sob Cinzas Quentes)",
      science: "O calor uniforme das cinzas e carvões em repouso penetra a batata em todas as direções de forma lenta, caramelizando os amidos internos para máxima doçura natural.",
      description: "Embrulhe batatas grandes lavadas com sal grosso em duas folhas de papel alumínio. Cave um espaço nas cinzas quentes e repouse as batatas lá por 35 minutos. Ao abrir, a casca estará tostada e o interior macio como um purê natural.",
      sensoryCues: {
        visual: "Fumaça aromática escapando ao abrir o papel de alumínio, revelando um miolo fumegante e dourado.",
        acoustic: "O chiado sutil de sucos da batata vaporizando no papel alumínio.",
        tactile: "La batata se deforma facilmente ao ser apertada com a mão protegida."
      },
      glossary: {
        'Cinzas Quentes': "Resíduo de carvão queimado que armazena calor uniforme e moderado, ideal para cozimento lento."
      }
    },
    brunch: {
      name: "Gourmet Rösti (Desidratação Mecânica e Caramelização)",
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

export default function DubolaView() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('ingredientes');
  const [selectedPairing, setSelectedPairing] = useState('peixe');
  const [hoveredHotspot, setHoveredHotspot] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef(null);
  const videoRef = useRef(null);

  // Chef IA States
  const [selectedProtein, setSelectedProtein] = useState('peixe');
  const [selectedOccasion, setSelectedOccasion] = useState('romantico');
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

  const highlightTarta = (text) => {
    if (!text) return "";
    const parts = text.split("Maionese Dubola Tártaro");
    if (parts.length > 1) {
      return (
        <span>
          {parts[0]}
          <span className="font-extrabold text-orange-500 bg-orange-500/10 border border-orange-500/35 px-1.5 py-0.5 rounded shadow-[0_0_8px_rgba(234,88,12,0.15)] inline-block">
            Maionese Dubola Tártaro
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

  // Track scroll position for parallax effects
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  // Track mouse position over the Hero for interactive radial light
  const handleMouseMove = (e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  // Parallax / Dynamic glow based on mouse
  const handleGenerateRecipe = () => {
    setRecipeState('loading');
    setLoadingProgress(0);
    setLoadingStepText('Analisando harmonização gastronômica...');

    const steps = [
      { progress: 15, text: 'Verificando geladeira virtual e mapeando frescor...' },
      { progress: 35, text: 'Mapeando assinatura química e acidez da Maionese Tártaro...' },
      { progress: 60, text: 'Selecionando técnicas renomadas de cocção para a proteína...' },
      { progress: 85, text: 'Personalizando emulsões e injetando segredos do chef...' },
      { progress: 100, text: 'Receita calibrada!' }
    ];

    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            const baseRecipe = aiRecipes[selectedProtein]?.[selectedOccasion] || aiRecipes.peixe.romantico;
            
            // Dynamic Composition Engine
            let recipe = JSON.parse(JSON.stringify(baseRecipe));
            
            // Assign professional technique dynamically based on protein AND occasion
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
              } else if (recipe.name.includes(" & Toque Final")) {
                recipe.name = recipe.name.replace(" & Toque Final", ` com ${additionsText} & Toque Final`);
              } else if (recipe.name.includes(" com Coroa de")) {
                recipe.name = recipe.name.replace(" com Coroa de", ` com ${additionsText} & Coroa de`);
              } else {
                recipe.name = `${recipe.name} com Toque de ${additionsText}`;
              }
              
              // 2. DYNAMIC INGREDIENTS INJECTION
              allAdditions.forEach(addition => {
                const exists = recipe.ingredients.some(ing => ing.toLowerCase().includes(addition.toLowerCase()));
                if (!exists) {
                  recipe.ingredients.push(`50g de ${addition} especial fresco(a)`);
                }
              });
              
              // 3. DYNAMIC INTELLECTUAL STEPS INJECTION (Professional yet easy techniques)
              let prepSteps = [];
              let integrationSteps = [];
              let secrets = [];
              
              selectedExtras.forEach(extra => {
                if (extra === 'Abacate') {
                  prepSteps.push("Prepare um leque escultural de Abacate cortado em fatias finas (ou amasse-o levemente temperando com flor de sal e gotas de limão para criar uma base cremosa de frescor).");
                  integrationSteps.push("Posicione o Abacate temperado como base da montagem, aplicando a Maionese Dubola Tártaro sobre ele para criar uma fusão aveludada de sabores.");
                  secrets.push("O abacate cru traz gorduras saudáveis que limpam o paladar quando encontram a acidez do tártaro.");
                } else if (extra === 'Tomate Cereja') {
                  prepSteps.push("Aqueça uma frigideira com azeite de oliva e salteie os Tomates Cereja inteiros com uma pitada de açúcar e sal até as cascas começarem a estourar (blistering), liberando o néctar doce.");
                  integrationSteps.push("Disponha os Tomates Cereja confitados quentes sobre o prato finalizado, criando um lindo contraste térmico com o molho tártaro fresco.");
                  secrets.push("Os tomates tostados adicionam umami doce natural e calor à harmonização.");
                } else if (extra === 'Bacon Crocante') {
                  prepSteps.push("Frite as fatias de Bacon Crocante em uma frigideira fria em fogo baixo, permitindo que a gordura derreta lentamente até ficarem ultra douradas e sequinhas.");
                  integrationSteps.push("Salpique o bacon crocante esmigalhado por cima da Maionese Tártaro na etapa final para adicionar crocância extrema e toque defumado.");
                  secrets.push("A crocância defumada do bacon quebra a maciez das proteínas e a untuosidade da maionese.");
                } else if (extra === 'Queijo Ralado') {
                  prepSteps.push("Crie um disco fino de Queijo Ralado em frigideira quente para formar uma tuile crocante e rendada de queijo, ou reserve para polvilhar finamente.");
                  integrationSteps.push("Decore com pedaços da tuile crocante de queijo ou polvilhe-o delicadamente para gratinar sutilmente sob a proteína quente.");
                  secrets.push("O queijo dourado ativa notas salgadas ricas (umami de cura) que casam perfeitamente com a cebola roxa do tártaro.");
                } else if (extra === 'Alecrim') {
                  prepSteps.push("Bata levemente o ramo de Alecrim fresco nas mãos para ativar os óleos e frite-o rapidamente por 30 segundos no azeite quente para liberar os aromas herbáceos.");
                  integrationSteps.push("Use as folhas de alecrim crocantes fritas para salpicar a montagem final, injetando perfume herbal no prato.");
                  secrets.push("O óleo de alecrim frito cria uma ponte aromática maravilhosa com as ervas finas do tártaro.");
                } else if (extra === 'Rúcula') {
                  prepSteps.push("Em um bowl, misture as folhas de Rúcula fresca com um fio leve de azeite extra virgem e gotas de limão para ativar sua picância.");
                  integrationSteps.push("Crie um ninho ou cama verde com a rúcula temperada sob a proteína principal, oferecendo um leito fresco e picante.");
                  secrets.push("A rúcula fresca e picante confere leveza vegetal e frescor imediato.");
                } else if (extra === 'Limão Siciliano') {
                  prepSteps.push("Use um ralador microplane para retirar raspas (zeste) perfumadas do Limão Siciliano, cuidando para não ralar a parte branca amarga.");
                  integrationSteps.push("Regue a proteína grelhada com gotas do suco fresco e salpique as raspas cítricas por cima da Maionese Tártaro.");
                  secrets.push("O perfume do limão siciliano corta qualquer gordura e ilumina a experiência sensorial.");
                } else if (extra === 'Alcaparras') {
                  prepSteps.push("Seque muito bem as Alcaparras e doure-as em azeite bem quente por 1 minuto até desabrocharem e ficarem perfeitamente crocantes.");
                  integrationSteps.push("Distribua as alcaparras crocantes por cima do tártaro, garantindo pequenas pérolas de sabor salino e crocância.");
                  secrets.push("Alcaparras fritas perdem a acidez agressiva de conserva e ganham sabor tostado fantástico.");
                }
              });
              
              customIngredients.forEach(custom => {
                prepSteps.push(`Prepare o/a ${custom} selecionado(a) da sua geladeira despertando seus sabores naturais com um toque sutil de calor e azeite (técnica sweating, cozinhando sem queimar).`);
                integrationSteps.push(`Incorpore delicadamente o/a ${custom} no prato, permitindo que sua assinatura pessoal se mescle com a Maionese Dubola Tártaro.`);
                secrets.push(`O toque caseiro de ${custom} adiciona exclusividade e frescor rústico à receita.`);
              });

              // Inject steps into the recipe
              // Inject prep steps after the main protein prep (usually step index 1 or 2)
              if (recipe.steps.length > 2) {
                recipe.steps.splice(2, 0, ...prepSteps);
              } else {
                recipe.steps.push(...prepSteps);
              }

              // Inject integration steps right before the final step
              if (recipe.steps.length > 1) {
                recipe.steps.splice(recipe.steps.length - 1, 0, ...integrationSteps);
              } else {
                recipe.steps.push(...integrationSteps);
              }
              
              // 4. DYNAMIC CHEF SECRET INJECTION
              if (secrets.length > 0) {
                recipe.chefSecret = `${recipe.chefSecret} ${secrets.join(' ')}`;
              }
            }

            // Calculate Dynamic Sophistication Score
            let baseScore = 65;
            if (selectedProtein === 'peixe') baseScore = 70;
            else if (selectedProtein === 'burguer') baseScore = 60;
            else if (selectedProtein === 'camarao') baseScore = 85;
            else if (selectedProtein === 'cogumelos') baseScore = 75;
            else if (selectedProtein === 'batatas') baseScore = 65;

            let occasionBonus = 0;
            if (selectedOccasion === 'romantico') occasionBonus = 15;
            else if (selectedOccasion === 'churrasco') occasionBonus = 10;
            else if (selectedOccasion === 'brunch') occasionBonus = 8;

            const extraBonus = selectedExtras.length * 3 + (customIngredient ? 5 : 0);
            recipe.sophisticationScore = Math.min(100, baseScore + occasionBonus + extraBonus);

            // Dynamically enrich steps into structured Masterclass steps
            recipe.steps = recipe.steps.map((stepText, index) => {
              let category = "Execução";
              let cues = null;
              
              const textLower = stepText.toLowerCase();
              if (index === 0) {
                category = "Mise en Place (Organização)";
              } else if (textLower.includes("grelhar") || textLower.includes("selar") || textLower.includes("frite") || textLower.includes("assar") || textLower.includes("sauté") || textLower.includes("tostar")) {
                category = "Cocção e Técnica";
                cues = recipe.technique.sensoryCues; // Assign the elite sensory cues from the matrix
              } else if (textLower.includes("descansar") || textLower.includes("repousar") || textLower.includes("descanso")) {
                category = "Descanso Térmico";
                cues = {
                  visual: "Você verá as fibras da proteína relaxarem e os sucos internos assentarem de forma homogênea.",
                  acoustic: "Silêncio completo na tábua de corte. A proteína está fora da frigideira.",
                  tactile: "A carne ou peixe recupera sua elasticidade e maciez naturais ao toque leve da espátula."
                };
              } else if (textLower.includes("tártaro") || textLower.includes("maionese")) {
                category = "Napar e Harmonização";
                cues = {
                  visual: "A Maionese Dubola Tártaro deve coroar o prato criando um contraste cremoso e texturizado.",
                  acoustic: "Sons suaves de montagem e decoração final.",
                  tactile: "Equilíbrio térmico ideal entre a proteína quente e a maionese refrigerada."
                };
              } else if (textLower.includes("prepare") || textLower.includes("misture") || textLower.includes("bata") || textLower.includes("corte")) {
                category = "Preparo de Acompanhamentos";
              }

              return {
                text: stepText,
                category: category,
                cues: cues
              };
            });
            
            // Reset masterclass progress states
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
    }, 120);
  };

  const pairings = {
    peixe: {
      title: "Filé de Salmão ou Peixe Branco Grelhado",
      desc: "O casamento mais tradicional da culinária litorânea. A acidez elegante da Maionese Tártaro Dubola contrasta com a untuosidade natural do peixe grelhado, limpando o paladar e ressaltando as notas delicadas do mar.",
      tips: "Espalhe uma camada fina logo após retirar do fogo para criar um molho aveludado instantâneo.",
      difficulty: "Fácil",
      time: "15 min"
    },
    burguer: {
      title: "Burguer Gourmet Smash",
      desc: "Transforme o hambúrguer de final de semana em uma obra-prima de bistrô. O toque cítrico e a crocância dos picles na maionese quebram a robustez da carne bovina grelhada na brasa, agregando frescor a cada mordida.",
      tips: "Combina perfeitamente com pão brioche levemente tostado na manteiga e queijo cheddar inglês.",
      difficulty: "Fácil",
      time: "10 min"
    },
    batatas: {
      title: "Batatas Rústicas com Alecrim",
      desc: "Esqueça o ketchup industrial. A consistência encorpada da nossa maionese funciona como o dip perfeito para batatas assadas com casca, alecrim e sal grosso, trazendo uma dimensão herbácea inigualável.",
      tips: "Sirva a maionese levemente refrigerada em um ramequim ao lado das batatas pelando de quentes.",
      difficulty: "Médio",
      time: "35 min"
    },
    camarao: {
      title: "Camarões Empanados na Panko",
      desc: "A crocância dourada do camarão empanado encontra o ápice do sabor ao mergulhar na cremosidade texturizada do tártaro. As sementes de mostarda e a cebola roxa picada fininho explodem em sabor a cada garfada.",
      tips: "Adicione raspas de limão siciliano por cima para uma experiência ainda mais aromática.",
      difficulty: "Médio",
      time: "20 min"
    }
  };

  const aiRecipes = {
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
          "Manteiga para o pão"
        ],
        steps: [
          "Toste o pão de brioche selando a parte interna na manteiga.",
          "Aqueça uma chapa ou frigideira de ferro até fumegar. Coloque a carne e esmague-a com uma espátula pesada.",
          "Tempere com sal e pimenta. Deixe dourar por 1 minuto e meio, vire, coloque o queijo e empilhe os dois burgers.",
          "Espalhe a Maionese Dubola Tártaro nas duas partes do pão.",
          "Monte o hambúrguer duplo e abocanhe imediatamente enquanto escorre a maionese cremosíssima."
        ],
        chefSecret: "A Maionese Tártaro substitui todos os outros condimentos, pois já reúne a acidez do picles, o dulçor da cebola roxa e o creme emulsionado nobre."
      },
      churrasco: {
        name: "Burger Defumado de Picanha na Brasa com Tártaro Dubola Supreme",
        prepTime: "20 minutos",
        difficulty: "Fácil",
        servings: "4 porções",
        ingredients: [
          "4 blends de picanha bovina de 180g",
          "8 fatias de bacon crocante assado",
          "4 fatias de queijo provolone defumado",
          "4 pães de brioche rústico",
          "1 pote de Maionese Dubola Tártaro"
        ],
        steps: [
          "Prepare a churrasqueira com carvão bem avermelhado e sem chamas.",
          "Grelhe os burgers de picanha por 4 minutos de cada lado para ponto para malpassado, adicionando o queijo provolone nos minutos finais para derreter.",
          "Grelhe a parte interna dos pães por 30 segundos na grelha.",
          "Monte aplicando colheradas fartas de Maionese Dubola Tártaro na base do pão, o burger com provolone derretido e duas fatias de bacon crocante por cima."
        ],
        chefSecret: "O queijo provolone e o bacon defumados contrastam gloriosamente com as ervas finas e o frescor cítrico da nossa maionese tártaro."
      },
      brunch: {
        name: "Breakfast Burger de Sausage Caseira com Ovo Frito e Tártaro Dubola",
        prepTime: "15 minutos",
        difficulty: "Média",
        servings: "2 porções",
        ingredients: [
          "200g de carne de porco temperada moída (estilo linguiça toscana artesanal)",
          "2 ovos caipiras",
          "2 pães de hambúrguer tipo muffin inglês ou brioche",
          "4 colheres de sopa de Maionese Dubola Tártaro",
          "Folhas de espinafre baby"
        ],
        steps: [
          "Molde a carne de linguiça em formato de disco e doure na frigideira por 3-4 minutos de cada lado.",
          "Na mesma frigideira, frite os ovos mantendo a gema mole.",
          "Toste os pães muffin inglês ou brioche.",
          "Monte colocando folhas de espinafre, a carne dourada de porco, o ovo frito com gema mole e coroe com uma camada generosa de Maionese Dubola Tártaro."
        ],
        chefSecret: "A gema mole do ovo se mistura à Maionese Dubola Tártaro e à carne de porco saborosa, formando um creme untuoso de textura divinal!"
      }
    },
    camarao: {
      romantico: {
        name: "Risoto de Camarão com Limão Siciliano & Toque Final de Tártaro Dubola",
        prepTime: "30 minutos",
        difficulty: "Média",
        servings: "2 porções",
        ingredients: [
          "150g de arroz arbório",
          "250g de camarões grandes limpos",
          "1 taça de vinho branco seco",
          "1 litro de caldo de legumes caseiro quente",
          "3 colheres de sopa de Maionese Dubola Tártaro",
          "1 colher de manteiga gelada",
          "Raspas de 1 limão siciliano"
        ],
        steps: [
          "Grelhe os camarões rapidamente em azeite quente por 1 minuto de cada lado. Tempere com sal e pimenta e reserve.",
          "Na mesma panela, refogue o arroz arbório. Adicione o vinho branco e mexa até evaporar.",
          "Adicione o caldo quente concha por concha, mexendo sempre, por 18 minutos até o arroz ficar al dente.",
          "Desligue o fogo. Adicione a manteiga gelada, os camarões grelhados e incorpore 3 colheres de sopa de Maionese Dubola Tártaro para dar a cremosidade final (substituindo parte do parmesão por um toque cítrico e refrescante).",
          "Salpique as raspas de limão siciliano por cima e sirva imediatamente."
        ],
        chefSecret: "Usar a Maionese Tártaro Dubola na finalização do risoto de frutos do mar traz cremosidade com acidez na medida exata, sem pesar o prato!"
      },
      almoco: {
        name: "Wrap Tropical de Camarão Crocante e Tártaro Dubola",
        prepTime: "12 minutos",
        difficulty: "Fácil",
        servings: "2 porções",
        ingredients: [
          "2 pães folha ou tortilhas de trigo grandes",
          "200g de camarões médios limpos e empanados",
          "4 colheres de sopa de Maionese Dubola Tártaro",
          "Fatias de abacate ou manga picada",
          "Mix de folhas verdes (alface, rúcula)"
        ],
        steps: [
          "Aqueça as tortilhas em uma frigideira por 30 segundos de cada lado.",
          "Espalhe a Maionese Dubola Tártaro no centro de cada tortilha.",
          "Distribua o mix de folhas, os pedaços de abacate/manga e os camarões empanados bem quentes e crocantes.",
          "Dobre as pontas e enrole firmemente os wraps.",
          "Corte ao meio na diagonal e sirva frio."
        ],
        chefSecret: "O abacate ou manga trazem um toque tropical adocicado que brilha intensamente ao encontrar o tempero herbal da nossa maionese tártaro."
      },
      churrasco: {
        name: "Espetinhos de Camarão Gigante na Grelha Lambuzados de Tártaro Dubola",
        prepTime: "15 minutos",
        difficulty: "Fácil",
        servings: "4 porções",
        ingredients: [
          "600g de camarões VG com casca e limpos por dentro",
          "4 colheres de sopa de azeite",
          "1 pote de Maionese Dubola Tártaro",
          "Flor de sal e limão"
        ],
        steps: [
          "Espete os camarões em espetos de bambu previamente umedecidos com água.",
          "Pincele os camarões com azeite de oliva e salpique flor de sal.",
          "Grelhe na churrasqueira bem quente por 2 minutos de cada lado até ficarem rosados e com marcas da grelha.",
          "Retire da churrasqueira e pincele generosamente a Maionese Dubola Tártaro sobre os camarões quentes.",
          "Sirva imediatamente com gomos de limão para espremer por cima."
        ],
        chefSecret: "A casca do camarão grelhada acumula os sabores defumados da brasa que se fundem perfeitamente à Maionese Tártaro ao serem descascados à mesa."
      },
      brunch: {
        name: "Brioche Shrimp Roll ao Estilo Dubola de Nova York",
        prepTime: "15 minutos",
        difficulty: "Fácil",
        servings: "2 porções",
        ingredients: [
          "2 pães de brioche alongados (estilo hot dog premium)",
          "250g de camarões pequenos ou médios cozidos no vapor",
          "4 colheres de sopa cheias de Maionese Dubola Tártaro",
          "1 colher de manteiga derretida",
          "Cebolinha fresca francesa picada",
          "Suco de limão siciliano"
        ],
        steps: [
          "Abra os pães de brioche no topo e pincele as laterais externas com manteiga derretida. Toste na chapa até dourar uniformemente.",
          "Em um bowl, misture os camarões frios cozidos com a Maionese Dubola Tártaro, gotas de limão siciliano e a cebolinha picada.",
          "Recheie generosamente o brioche tostado e quente com a mistura cremosa e fria de camarão.",
          "Finalize com mais cebolinha salpicada por cima e uma pitada de páprica doce."
        ],
        chefSecret: "Este clássico americano ganha complexidade com os pedacinhos de cebola roxa e picles crocantes da Maionese Tártaro Dubola, superando a maionese convencional."
      }
    },
    cogumelos: {
      romantico: {
        name: "Cogumelos Eryngii Grelhados com Fondue Tártaro Dubola e Azeite de Trufas",
        prepTime: "20 minutos",
        difficulty: "Média",
        servings: "2 porções",
        ingredients: [
          "4 cogumelos Eryngii grandes (ou Portobello)",
          "4 colheres de sopa de Maionese Dubola Tártaro",
          "Fio de azeite trufado",
          "Tomilho fresco",
          "Sal de Maldon"
        ],
        steps: [
          "Fatie os cogumelos longitudinalmente com cerca de 1cm de espessura. Faça cortes diagonais suaves na carne do cogumelo.",
          "Grelhe em frigideira de ferro com azeite comum e ramos de tomilho até que fiquem bem macios e dourados (cerca de 4 minutos de cada lado).",
          "Disponha os cogumelos quentes em um prato sofisticado.",
          "Regue delicadamente com o azeite trufado e tempere com sal de Maldon.",
          "Sirva acompanhado de uma taça de Maionese Dubola Tártaro ligeiramente aquecida em banho-maria ou em temperatura ambiente para mergulhar os cogumelos."
        ],
        chefSecret: "A textura carnuda dos cogumelos Eryngii combinada com a untuosidade trufada e a acidez fresca do tártaro cria uma explosão sensorial requintada."
      },
      almoco: {
        name: "Sanduíche Rústico de Cogumelos Salteados com Molho Tártaro",
        prepTime: "12 minutos",
        difficulty: "Fácil",
        servings: "2 porções",
        ingredients: [
          "200g de cogumelos Shimeji ou Paris",
          "4 fatias de pão sourdough ou ciabatta",
          "3 colheres de sopa de Maionese Dubola Tártaro",
          "Queijo de coalho grelhado (opcional)",
          "Azeite, sal e pimenta"
        ],
        steps: [
          "Salteie os cogumelos em fogo alto com azeite até dourarem. Tempere com sal e pimenta.",
          "Toste os pães ciabatta na frigideira.",
          "Passe uma generosa quantidade de Maionese Dubola Tártaro nas fatias de pão.",
          "Monte o sanduíche com os cogumelos quentes e o queijo de coalho grelhado.",
          "Feche e sirva quente."
        ],
        chefSecret: "A Maionese Dubola Tártaro confere cremosidade imediata aos cogumelos secos salteados, criando um recheio úmido e suculento."
      },
      churrasco: {
        name: "Espeto de Shimeji Negro na Grelha com Glacê Tártaro Dubola",
        prepTime: "15 minutos",
        difficulty: "Fácil",
        servings: "4 porções",
        ingredients: [
          "400g de cogumelos Shimeji inteiros em ramalhetes grandes",
          "4 colheres de sopa de Maionese Dubola Tártaro",
          "Shoyu e azeite",
          "Gergelim torrado"
        ],
        steps: [
          "Regue os ramalhetes de shimeji com shoyu e um fio de azeite.",
          "Coloque-os em grelha dupla de churrasqueira (fechada) e leve à brasa média por 8 minutos, virando na metade do tempo.",
          "Retire e, ainda muito quente, envolva os cogumelos com a Maionese Dubola Tártaro.",
          "Salpique gergelim torrado por cima e sirva imediatamente."
        ],
        chefSecret: "O umami do shoyu carameliza na brasa e encontra o contraponto perfeito na acidez aromática da Maionese Tártaro."
      },
      brunch: {
        name: "Avocado Toast com Ovos Benedict, Cogumelos Paris Salteados & Molho Tártaro Dubola",
        prepTime: "15 minutos",
        difficulty: "Média",
        servings: "2 porções",
        ingredients: [
          "150g de cogumelos Paris frescos fatiados",
          "1 colher de sopa de azeite extra virgem",
          "4 fatias de pão rústico de fermentação natural",
          "1 abacate maduro (avocado) amassado com sal e limão",
          "2 ovos pochê perfeitos",
          "4 colheres de sopa de Maionese Dubola Tártaro",
          "Broto de alfafa e pimenta caiena"
        ],
        steps: [
          "Toste bem as fatias de sourdough e monte a base espalhando o abacate amassado e temperado sobre as torradas.",
          "Em uma frigideira bem quente com azeite, salteie os cogumelos fatiados até que fiquem macios e dourados.",
          "Disponha os cogumelos salteados sobre o creme de abacate e depois coloque o ovo pochê por cima.",
          "Aqueça levemente a Maionese Dubola Tártaro batendo com uma colher de água morna para fluidificar um pouco.",
          "Nape (cubra) o ovo pochê com este creme tártaro fluido. Finalize com pimenta caiena e brotos."
        ],
        chefSecret: "A combinação terrosa dos cogumelos com a acidez do tártaro e a cremosidade do abacate eleva o clássico brunch a uma experiência de bistrô."
      }
    },
    batatas: {
      romantico: {
        name: "Batatas Fondant à Provençal com Coroa de Tártaro Dubola",
        prepTime: "35 minutos",
        difficulty: "Média",
        servings: "2 porções",
        ingredients: [
          "4 batatas grandes descascadas e cortadas em cilindros perfeitos",
          "100g de manteiga com sal",
          "3 dentes de alho esmagados",
          "Ramos de tomilho e alecrim",
          "1 xícara de caldo de frango ou legumes",
          "4 colheres de sopa de Maionese Dubola Tártaro"
        ],
        steps: [
          "Em uma frigideira funda que possa ir ao forno, derreta a manteiga e doure os cilindros de batata de pé até que fiquem bem tostados dos dois lados planos.",
          "Adicione os dentes de alho, tomilho e alecrim na manteiga aromática. Despeje o caldo de legumes até a metade da altura das batatas.",
          "Leve ao forno pré-aquecido a 200°C por 20 minutos até que as batatas absorvam o caldo e fiquem ultra macias por dentro.",
          "Retire do forno e monte em prato elegante.",
          "Coroe cada batata fondant dourada com uma colherada escultural de Maionese Dubola Tártaro fri.",
          "Decore com folhas frescas de tomilho."
        ],
        chefSecret: "A batata fondant desmancha na boca com riqueza de manteiga e ervas, encontrando na Maionese Dubola Tártaro o equilíbrio ideal de frescor e crocância de picles."
      },
      almoco: {
        name: "Batatas Canoa Super Crocantes com Trio Dip de Tártaro Dubola",
        prepTime: "25 minutos",
        difficulty: "Fácil",
        servings: "2 porções",
        ingredients: [
          "3 batatas médias cortadas em formato canoa (com casca)",
          "2 colheres de sopa de amido de milho",
          "Páprica defumada, sal e alecrim",
          "1 pote de Maionese Dubola Tártaro",
          "Azeite de oliva"
        ],
        steps: [
          "Cozinhe as batatas canoa em água fervente com sal por 5 minutos (pré-cozimento). Escorra bem.",
          "Envolva as batatas com o amido de milho, páprica, sal e azeite.",
          "Disponha em assadeira e asse em forno a 220°C (ou na airfryer) por 15-20 minutos até ficarem super crocantes por fora.",
          "Transfira para uma cesta estilosa.",
          "Sirva acompanhado de um pote bem farto de Maionese Dubola Tártaro para chuchar (dip) a cada mordida."
        ],
        chefSecret: "O amido de milho cria micro-rugosidades na superfície da batata assada, o que ajuda a reter o máximo de creme tártaro em cada mergulho!"
      },
      churrasco: {
        name: "Batatas Assadas no Papel Alumínio Recheadas de Queijo e Tártaro Dubola",
        prepTime: "40 minutos",
        difficulty: "Fácil",
        servings: "4 porções",
        ingredients: [
          "4 batatas monalisa bem grandes lavadas",
          "150g de queijo muçarela ou requijão cremoso de corte",
          "1 pote de Maionese Dubola Tártaro",
          "Papel alumínio para embrulhar"
        ],
        steps: [
          "Embrulhe cada batata no papel alumínio e coloque diretamente na brasa da churrasqueira por 35 minutos (até enfiar um garfo macio).",
          "Abra o papel alumínio por cima, faça um corte longitudinal profundo na batata e esprema levemente as pontas para abrir uma cavidade.",
          "Coloque o queijo na cavidade e deixe o próprio calor da batata derreter.",
          "Finalize recheando a batata com 2 colheres de sopa de Maionese Dubola Tártaro bem cremosa por cima do queijo.",
          "Salpique cebolinha verde picada."
        ],
        chefSecret: "O vapor criado dentro do papel alumínio deixa a batata extremamente macia (estilo baked potato americana), ideal para receber a untuosidade de queijo e tártaro."
      },
      brunch: {
        name: "Rösti de Batata Gourmet com Recheio Tártaro Dubola",
        prepTime: "25 minutos",
        difficulty: "Média",
        servings: "2 porções",
        ingredients: [
          "3 batatas médias raladas cruas",
          "1 ovo pequeno batido",
          "Sal, pimenta-do-reino e noz-moscada",
          "4 colheres de sopa de Maionese Dubola Tártaro",
          "Manteiga para fritar"
        ],
        steps: [
          "Esprema a batata ralada em um pano de prato limpo para retirar o máximo de líquido possível.",
          "Misture a batata com o ovo batido, sal, pimenta e uma pitada de noz-moscada.",
          "Aqueça manteiga em frigideira pequena. Coloque metade da batata ralada, alisando para formar um disco.",
          "Coloque 3 colheres de Maionese Dubola Tártaro no centro, deixando 1cm de borda limpa.",
          "Cubra com a outra metade da batata. Frite em fogo médio por 8 minutos de cada lado até ficar dourado e crocante.",
          "Sirva quente com o recheio tártaro derretendo por dentro."
        ],
        chefSecret: "A Maionese Tártaro Dubola dentro da batata Rösti cria um centro incrivelmente cremoso e úmido que surpreende ao cortar!"
      }
    }
  };

  const hotspots = [
    {
      id: 1,
      x: '27%',
      y: '53%',
      title: 'Picles Especial Crocante',
      desc: 'Pepinos em conserva de receita própria, garantindo crocância real e acidez perfeitamente calibrada para cortar a untuosidade.'
    },
    {
      id: 2,
      x: '61%',
      y: '78%',
      title: 'Cebola Roxa Picada',
      desc: 'Trabalhada milimetricamente para liberar o frescor adocicado e aroma marcante que você percebe na textura.'
    },
    {
      id: 3,
      x: '34%',
      y: '18%',
      title: 'Livre de Transgênicos',
      desc: 'Selo de garantia de ingredientes puros e selecionados para um sabor autêntico e saudável.'
    }
  ];

  return (
    <div 
      className={`min-h-screen font-sans selection:bg-[#ea580c]/30 overflow-x-hidden relative transition-colors duration-700 ${
        isDarkMode ? 'bg-[#110502] text-stone-100' : 'bg-[#faf6f2] text-stone-900'
      }`}
      style={{
        backgroundImage: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, ${
          isDarkMode ? 'rgba(234, 88, 12, 0.12)' : 'rgba(234, 88, 12, 0.05)'
        } 0%, transparent 60%)`
      }}
    >
      {/* Dynamic Background Particle Starfield */}
      <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,${isDarkMode ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.02)'}_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-40`}></div>

      {/* Ambient Glows */}
      <div className={`absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none animate-pulse duration-[8000ms] transition-colors duration-700 ${
        isDarkMode ? 'bg-[#ea580c]/10' : 'bg-[#ea580c]/6'
      }`}></div>
      <div className={`absolute bottom-1/3 right-10 w-[500px] h-[500px] rounded-full blur-[160px] pointer-events-none transition-colors duration-700 ${
        isDarkMode ? 'bg-[#d97706]/5' : 'bg-[#d97706]/3'
      }`}></div>

      {/* Header Navigation */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b px-6 py-4 flex items-center justify-between transition-all duration-500 ${
        isDarkMode ? 'bg-[#110502]/85 border-orange-950/20' : 'bg-[#faf6f2]/85 border-orange-200/40'
      }`}>
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#ea580c] to-[#f97316] flex items-center justify-center text-white font-extrabold text-sm shadow-lg shadow-orange-600/20 group-hover:scale-105 transition-all">
              D
            </div>
            <span className={`font-black text-xl tracking-tight transition-colors duration-500 ${isDarkMode ? 'text-white group-hover:text-orange-500' : 'text-stone-900 group-hover:text-orange-600'}`}>DUBOLA</span>
            <span className="text-[10px] bg-orange-500/10 text-orange-400 border border-orange-500/20 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline-block">PREMIUM</span>
          </Link>
        </div>

        <nav className={`hidden md:flex items-center gap-6 text-sm font-semibold transition-colors duration-500 ${
          isDarkMode ? 'text-stone-300' : 'text-stone-600'
        }`}>
          <a href="#hero" className={`transition-colors duration-300 ${isDarkMode ? 'hover:text-orange-400' : 'hover:text-orange-600'}`}>A Maionese</a>
          <a href="#harmonizacao" className={`transition-colors duration-300 ${isDarkMode ? 'hover:text-orange-400' : 'hover:text-orange-600'}`}>Harmonização</a>
          <a href="#chef-ia" className={`transition-colors duration-300 flex items-center gap-1 ${isDarkMode ? 'hover:text-orange-400' : 'hover:text-orange-600'}`}>
            <Sparkles size={13} className="text-orange-400 animate-pulse" /> Chef IA
          </a>
          <a href="#ingredientes" className={`transition-colors duration-300 ${isDarkMode ? 'hover:text-orange-400' : 'hover:text-orange-600'}`}>Ingredientes</a>
          <a href="#tabela" className={`transition-colors duration-300 ${isDarkMode ? 'hover:text-orange-400' : 'hover:text-orange-600'}`}>Nutricional</a>
        </nav>

        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-xl border transition-all duration-300 flex items-center justify-center ${
              isDarkMode 
                ? 'bg-white/5 border-stone-800 text-amber-400 hover:bg-white/10 hover:border-stone-700 shadow-md' 
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
                ? 'text-stone-400 hover:text-white bg-white/5 hover:bg-white/10 border-stone-800 hover:border-stone-700' 
                : 'text-stone-600 hover:text-stone-900 bg-white hover:bg-stone-50 border-stone-200 hover:border-stone-300 shadow-sm'
            }`}
          >
            Voltar ao Dashboard
          </Link>
          <a 
            href="#onde-comprar" 
            className="bg-gradient-to-r from-[#ea580c] to-[#d97706] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-orange-600/20 hover:shadow-orange-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
          >
            ONDE COMPRAR
          </a>
        </div>
      </header>

      {/* HERO SECTION WITH DYNAMIC FULL-BLEED PARALLAX BACKGROUND */}
      <section 
        id="hero" 
        ref={heroRef}
        onMouseMove={handleMouseMove}
        className="relative min-h-[90vh] lg:min-h-[95vh] flex items-center justify-center py-16 lg:py-24 px-6 overflow-hidden"
      >
        <video
          ref={videoRef}
          preload="auto"
          autoPlay
          muted
          playsInline
          onEnded={(e) => {
            e.target.currentTime = 0;
          }}
          className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none opacity-100 scale-[1.06] origin-center"
        >
          <source src="/magnific_os-vegetais-caindo.-nao-a_xgdohQFjfW.mp4" type="video/mp4" />
        </video>

        {/* Content Wrapper Centered Panel */}
        <div className="max-w-7xl mx-auto w-full relative z-20 flex justify-end px-4 sm:px-8 lg:px-16">
          
          {/* Premium Centered Copy Card in High-End Glassmorphism */}
          <div className={`space-y-6 text-center backdrop-blur-2xl p-6 sm:p-10 rounded-[36px] relative z-30 transition-all duration-700 max-w-[480px] w-full border ${
            isDarkMode 
              ? 'bg-[#130704]/40 border-orange-500/10 shadow-2xl shadow-black/60 text-white' 
              : 'bg-white/70 border-orange-200/40 shadow-xl shadow-stone-200/30 text-stone-900'
          }`}
               style={{
                 transform: `translateY(${scrollY * -0.05}px)`
               }}
          >
            <div className={`inline-flex items-center gap-2 font-bold px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest transition-colors duration-500 ${
              isDarkMode 
                ? 'bg-[#ea580c]/10 border border-[#ea580c]/20 text-[#f97316]' 
                : 'bg-[#ea580c]/10 border border-[#ea580c]/25 text-[#ea580c]'
            }`}>
              <Sparkles size={11} className="animate-spin duration-[4000ms]" /> Linha Premium Dubola
            </div>

            <div className="space-y-4">
              <h1 className={`text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-tight transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-stone-950'
              }`}>
                O toque de chef que seu <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600">prato merece.</span>
              </h1>
              <p className={`text-sm sm:text-base font-light leading-relaxed max-w-2xl mx-auto transition-colors duration-500 ${
                isDarkMode ? 'text-stone-300' : 'text-stone-700'
              }`}>
                A <strong className={`font-semibold ${isDarkMode ? 'text-white' : 'text-stone-950'}`}>Maionese Dubola Tártaro</strong> é a tradução do equilíbrio culinário. Ela harmoniza a textura aveludada artesanal à acidez crocante de picles finos, cebola roxa e especiarias. Perfeita para elevar hambúrgueres, peixes e petiscos a um novo patamar de sabor.
              </p>
            </div>

            {/* Micro Feature Icons */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-y py-5 transition-colors duration-500 ${
              isDarkMode ? 'border-stone-800/60' : 'border-stone-200/60'
            }`}>
              <div className="flex flex-col sm:flex-row items-center sm:justify-center text-center sm:text-left gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                  <Leaf size={16} />
                </div>
                <div>
                  <div className={`text-[10px] font-bold uppercase ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>Saudável</div>
                  <div className={`text-xs font-bold transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-stone-950'}`}>Livre de Transgênicos</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:justify-center text-center sm:text-left gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                  <Sparkles size={16} />
                </div>
                <div>
                  <div className={`text-[10px] font-bold uppercase ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>Textura</div>
                  <div className={`text-xs font-bold transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-stone-950'}`}>Pedacinhos de Picles</div>
                </div>
              </div>
            </div>

            {/* Premium Info Note */}
            <div className={`rounded-2xl p-4 text-[11px] flex flex-col sm:flex-row items-center justify-center gap-2 max-w-2xl mx-auto border transition-colors duration-500 ${
              isDarkMode 
                ? 'bg-orange-500/5 border-orange-500/10 text-stone-300' 
                : 'bg-orange-500/10 border-orange-200/50 text-stone-800'
            }`}>
              <Lightbulb size={16} className="text-orange-500 shrink-0" />
              <div>
                <span className="font-semibold text-orange-500">Ingredientes Reais:</span> Elaborada com pepino em conserva especial, cebola roxa milimetricamente picada e especiarias nobres sobre emulsão cremosa livre de transgênicos.
              </div>
            </div>

            {/* Call to Actions */}
            <div className="space-y-3 pt-2 max-w-lg mx-auto w-full">
              <a 
                href="#onde-comprar" 
                className="w-full py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-600/30 hover:shadow-orange-600/50 hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group relative overflow-hidden border border-amber-400/20"
              >
                <ShoppingBag size={14} className="animate-bounce group-hover:scale-110 transition-transform" />
                COMPRE AGORA
                <span className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
              </a>
              
              <div className="flex gap-3">
                <a 
                  href="#onde-comprar" 
                  className={`flex-1 px-4 py-3 border rounded-2xl font-bold text-[11px] uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 ${
                    isDarkMode 
                      ? 'bg-white/5 border-stone-800 hover:border-orange-500/30 text-stone-200 hover:text-white hover:bg-white/10' 
                      : 'bg-white hover:bg-stone-50 border-stone-200 hover:border-orange-500/30 text-stone-700 hover:text-stone-950 shadow-sm'
                  }`}
                >
                  Onde Encontrar
                  <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </a>
                
                <a 
                  href="#harmonizacao" 
                  className={`flex-1 px-4 py-3 border rounded-2xl font-bold text-[11px] uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 ${
                    isDarkMode 
                      ? 'bg-white/5 border-stone-800 hover:border-orange-500/30 text-stone-400 hover:text-orange-400 hover:bg-white/10' 
                      : 'bg-white hover:bg-stone-50 border-stone-200 hover:border-orange-500/30 text-stone-500 hover:text-orange-600 shadow-sm'
                  }`}
                >
                  <Compass size={12} /> Harmonizar
                </a>
              </div>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <div className="flex items-center gap-1 text-amber-500">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={11} fill="currentColor" />
                ))}
              </div>
              <span className={`text-[11px] transition-colors duration-500 ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                Avaliação <strong className={isDarkMode ? 'text-white' : 'text-stone-900'}>4.9/5</strong> pelos melhores chefs de hambúrgueres.
              </span>
            </div>
            
          </div>
        </div>
      </section>

      {/* Gourmet Pairing Selector Section */}
      <section id="harmonizacao" className={`py-20 relative transition-all duration-700 border-y ${
        isDarkMode ? 'bg-[#18181b]/50 border-stone-900/60' : 'bg-white/40 backdrop-blur-md border-stone-200/50'
      }`}>
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          
          <div className="text-center space-y-3">
            <div className="text-orange-500 text-xs font-black uppercase tracking-widest">Experiência Gastronômica</div>
            <h2 className={`text-3xl md:text-4xl font-extrabold transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>A Harmonização Perfeita</h2>
            <p className={`max-w-xl mx-auto text-sm transition-colors duration-500 ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
              Desenvolvemos a Maionese Tártaro Dubola para ser incrivelmente versátil. Descubra como combiná-la com diferentes pratos e elevar a sua culinária cotidiana.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left selector buttons */}
            <div className="lg:col-span-4 flex flex-col gap-3">
              {[
                { id: 'peixe', label: 'Peixes Grelhados', icon: Fish, tag: 'A Harmonização Clássica' },
                { id: 'burguer', label: 'Smash Burgers', icon: Flame, tag: 'O Upgrade do Lanche' },
                { id: 'batatas', label: 'Batatas Rústicas', icon: Grid, tag: 'O Dip Definitivo' },
                { id: 'camarao', label: 'Frutos do Mar Panko', icon: UtensilsCrossed, tag: 'A Crocância Suprema' }
              ].map((item) => {
                const PairingIcon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedPairing(item.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-4 ${
                      selectedPairing === item.id 
                        ? (isDarkMode 
                            ? 'bg-gradient-to-r from-orange-600/10 to-transparent border-orange-500 text-white shadow-lg shadow-orange-600/5' 
                            : 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20'
                          )
                        : (isDarkMode
                            ? 'bg-white/[0.01] border-stone-900 text-stone-400 hover:text-stone-200 hover:bg-white/[0.03] hover:border-stone-800'
                            : 'bg-white border-stone-200 text-stone-600 hover:text-orange-600 hover:bg-orange-50/20 hover:border-orange-200/60 shadow-sm'
                          )
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                      selectedPairing === item.id 
                        ? (isDarkMode ? 'bg-orange-500 text-white shadow-md' : 'bg-white/20 text-white') 
                        : (isDarkMode ? 'bg-stone-900 text-orange-400' : 'bg-orange-50 text-orange-600 border border-orange-100/50')
                    }`}>
                      <PairingIcon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-[10px] uppercase tracking-wider font-extrabold mb-0.5 ${
                        selectedPairing === item.id 
                          ? (isDarkMode ? 'text-orange-400' : 'text-orange-100')
                          : 'text-orange-500'
                      }`}>{item.tag}</div>
                      <div className={`font-bold text-sm truncate ${
                        selectedPairing === item.id 
                          ? 'text-white' 
                          : (isDarkMode ? 'text-stone-300' : 'text-stone-700')
                      }`}>{item.label}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right card detail view */}
            <div className={`lg:col-span-8 border rounded-3xl p-6 md:p-8 space-y-6 min-h-[320px] flex flex-col justify-between shadow-2xl relative overflow-hidden transition-all duration-700 ${
              isDarkMode 
                ? 'bg-stone-950/80 border-stone-900 text-white shadow-black/40' 
                : 'bg-white border-stone-200/80 text-stone-900 shadow-xl shadow-stone-100/50'
            }`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/5 rounded-full blur-[40px] pointer-events-none"></div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] border font-black px-3 py-1 rounded-full uppercase tracking-wider transition-colors duration-500 ${
                    isDarkMode ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-orange-500/10 text-orange-700 border-orange-200/50'
                  }`}>
                    Harmonização Recomendada
                  </span>
                  <div className={`flex items-center gap-4 text-xs ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                    <span className="flex items-center gap-1 font-medium">
                      <Clock size={13} className="text-orange-500" /> {pairings[selectedPairing].time}
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      <Flame size={13} className="text-orange-500" /> {pairings[selectedPairing].difficulty}
                    </span>
                  </div>
                </div>

                <h3 className={`text-xl md:text-2xl font-black transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-stone-950'}`}>{pairings[selectedPairing].title}</h3>
                
                <p className={`text-sm leading-relaxed font-light transition-colors duration-500 ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
                  {pairings[selectedPairing].desc}
                </p>
              </div>

              <div className={`border rounded-2xl p-4 flex items-start gap-3 transition-colors duration-500 ${
                isDarkMode ? 'bg-[#110502] border-orange-950/40' : 'bg-orange-50/30 border-orange-100'
              }`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                  isDarkMode ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-orange-500/15 text-orange-700 border-orange-200'
                }`}>
                  <Lightbulb size={16} />
                </div>
                <div>
                  <div className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${isDarkMode ? 'text-orange-400' : 'text-orange-700'}`}>
                    Dica de Ouro
                  </div>
                  <p className={`text-xs leading-relaxed font-normal ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                    {pairings[selectedPairing].tips}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Interactive AI Recipe Generator Section */}
      <section id="chef-ia" className={`relative py-24 border-t overflow-hidden transition-all duration-700 ${
        isDarkMode ? 'bg-gradient-to-b from-[#18181b]/30 to-[#110502] border-stone-900/60' : 'bg-gradient-to-b from-white/40 to-[#faf9f6] border-stone-200/50'
      }`}>
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-orange-600/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-amber-600/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10 space-y-12">
          <div className="text-center space-y-3">
            <div className={`inline-flex items-center gap-1.5 border font-extrabold px-3.5 py-1.5 rounded-full text-xs uppercase tracking-widest transition-colors duration-500 ${
              isDarkMode ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' : 'bg-orange-500/5 border-orange-200 text-orange-700'
            }`}>
              <Sparkles size={12} className="animate-spin duration-[5000ms]" /> Chef de Cozinha Virtual
            </div>
            <h2 className={`text-3xl md:text-5xl font-black tracking-tight transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Criador de Receitas com IA</h2>
            <p className={`max-w-xl mx-auto text-sm leading-relaxed transition-colors duration-500 ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
              Diga o que você tem na geladeira e a ocasião ideal. Nossa inteligência gastronômica criará uma receita requintada onde a estrela é a <span className={isDarkMode ? 'text-white font-semibold' : 'text-stone-950 font-extrabold'}>Maionese Dubola Tártaro</span>.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Control Panel Card */}
            <div className={`lg:col-span-5 backdrop-blur-xl border p-6 md:p-8 rounded-3xl shadow-2xl space-y-6 transition-all duration-700 ${
              isDarkMode ? 'bg-[#141416]/80 border-stone-800 shadow-black/40' : 'bg-white border-stone-200 shadow-stone-100/30'
            }`}>
              {/* Ingredient Selection */}
              <div className="space-y-3">
                <label className={`block text-xs font-black uppercase tracking-wider transition-colors duration-500 ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                  1. Escolha a Proteína ou Base Principal
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'peixe', label: 'Salmão / Peixe', icon: Fish },
                    { id: 'burguer', label: 'Hambúrguer', icon: Flame },
                    { id: 'camarao', label: 'Camarão', icon: UtensilsCrossed },
                    { id: 'cogumelos', label: 'Cogumelos', icon: Leaf },
                    { id: 'batatas', label: 'Batatas Rústicas', icon: Grid },
                  ].map((p) => {
                    const ProteinIcon = p.icon;
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          setSelectedProtein(p.id);
                          if (recipeState === 'ready') setRecipeState('idle');
                        }}
                        className={`flex items-center gap-2.5 p-3.5 rounded-xl border text-xs font-bold transition-all text-left ${
                          selectedProtein === p.id
                            ? (isDarkMode 
                                ? 'bg-orange-600/10 border-orange-500 text-white shadow-md shadow-orange-500/5' 
                                : 'bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/10'
              {/* Occasion Selection */}
              <div className="space-y-3">
                <label className={`block text-xs font-black uppercase tracking-wider transition-colors duration-500 ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                  2. Escolha a Ocasião do Prato
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'romantico', label: 'Jantar Romântico', icon: Heart },
                    { id: 'almoco', label: 'Almoço Rápido', icon: Zap },
                    { id: 'churrasco', label: 'Churrasco / Brasa', icon: Flame },
                    { id: 'brunch', label: 'Brunch Gourmet', icon: Coffee },
                  ].map((o) => {
                    const OccasionIcon = o.icon;
                    return (
                      <button
                        key={o.id}
                        onClick={() => {
                          setSelectedOccasion(o.id);
                          if (recipeState === 'ready') setRecipeState('idle');
                        }}
                        className={`flex items-center gap-2.5 p-3.5 rounded-xl border text-xs font-bold transition-all text-left ${
                          selectedOccasion === o.id
                            ? (isDarkMode 
                                ? 'bg-orange-600/10 border-orange-500 text-white shadow-md shadow-orange-500/5' 
                                : 'bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/10'
                              )
                            : (isDarkMode
                                ? 'bg-stone-900/30 border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-900/60'
                                : 'bg-white border-stone-200 text-stone-600 hover:text-[#ea580c] hover:bg-orange-50/10 hover:border-orange-200/50 shadow-sm'
                              )
                        }`}
                      >
                        <OccasionIcon size={16} className={selectedOccasion === o.id ? (isDarkMode ? 'text-orange-400 animate-pulse' : 'text-white') : (isDarkMode ? 'text-stone-400' : 'text-stone-500')} />
                        <span className="truncate">{o.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Extra Ingredients Selector (Virtual Fridge) */}
              <div className="space-y-3">
                <label className={`block text-xs font-black uppercase tracking-wider transition-colors duration-500 ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                  3. O que mais tem na sua geladeira? (Opcional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {extraOptions.map((opt) => {
                    const isSelected = selectedExtras.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          handleToggleExtra(opt.id);
                          if (recipeState === 'ready') setRecipeState('idle');
                        }}
                        className={`px-3 py-1.5 rounded-full border text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? (isDarkMode 
                                ? 'bg-orange-500/20 border-orange-500 text-white' 
                                : 'bg-orange-500 border-orange-500 text-white shadow-sm'
                              )
                            : (isDarkMode
                                ? 'bg-stone-900/30 border-stone-800 text-stone-400 hover:text-stone-350 hover:bg-stone-900/60'
                                : 'bg-white border-stone-200 text-stone-600 hover:text-orange-600 hover:bg-orange-50/10 hover:border-orange-200 shadow-sm'
                              )
                        }`}
                      >
                        {isSelected && <Check size={10} className={isDarkMode ? "text-orange-500" : "text-white"} />}
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Typed Ingredient */}
              <div className="space-y-2">
                <label className={`block text-[10px] font-black uppercase tracking-wider transition-colors duration-500 ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                  Outro ingrediente específico?
                </label>
                <input
                  type="text"
                  value={customIngredient}
                  onChange={(e) => {
                    setCustomIngredient(e.target.value);
                    if (recipeState === 'ready') setRecipeState('idle');
                  }}
                  placeholder="Ex: manjericão, mel, presunto..."
                  className={`w-full border focus:border-orange-500/40 rounded-xl px-4 py-3 text-xs outline-none transition-all ${
                    isDarkMode 
                      ? 'bg-stone-950/60 border-stone-800 text-white placeholder-stone-700' 
                      : 'bg-white border-stone-200 text-stone-900 placeholder-stone-400 shadow-inner'
                  }`}
                />
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerateRecipe}
                disabled={recipeState === 'loading'}
                className="w-full py-4 px-6 bg-gradient-to-r from-[#ea580c] to-[#d97706] hover:from-[#f97316] hover:to-[#ea580c] disabled:opacity-50 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-600/20 hover:shadow-orange-600/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Sparkles size={14} className={recipeState === 'loading' ? 'animate-spin' : ''} />
                {recipeState === 'loading' ? 'GERANDO COM IA...' : 'GERAR RECEITA COM IA'}
              </button>
            </div>

            {/* Display / Output Screen */}
            <div className={`lg:col-span-7 min-h-[460px] border rounded-3xl p-6 md:p-8 flex flex-col justify-center relative overflow-hidden shadow-2xl transition-all duration-700 ${
              isDarkMode 
                ? 'bg-stone-950/40 border-stone-900 shadow-black/40' 
                : 'bg-white border-stone-200 shadow-stone-100/30'
            }`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/5 rounded-full blur-[40px] pointer-events-none"></div>

              {recipeState === 'idle' && (
                <div className="text-center space-y-4 py-12 animate-in fade-in duration-300">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-inner transition-colors duration-500 ${
                    isDarkMode ? 'bg-orange-500/5 border border-orange-500/10 text-orange-400' : 'bg-orange-50 border border-orange-100 text-orange-600'
                  }`}>
                    <ChefHat size={32} />
                  </div>
                  <div className="space-y-1">
                    <h3 className={`text-lg font-bold transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Pronto para Criar</h3>
                    <p className={`text-xs max-w-sm mx-auto transition-colors duration-500 ${isDarkMode ? 'text-stone-500' : 'text-stone-600'}`}>
                      Selecione a proteína e a ocasião ao lado e clique em "Gerar Receita" para acionar o algoritmo de gastronomia Dubola.
                    </p>
                  </div>
                </div>
              )}

              {recipeState === 'loading' && (
                <div className="space-y-6 py-12 text-center animate-in fade-in duration-300">
                  <div className="relative w-20 h-20 mx-auto">
                    {/* Ring animation */}
                    <div className={`absolute inset-0 rounded-full border-4 ${isDarkMode ? 'border-orange-500/10' : 'border-orange-500/20'}`}></div>
                    <div className="absolute inset-0 rounded-full border-4 border-t-orange-500 animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-orange-400">
                      <Sparkles size={28} className="animate-pulse" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className={`text-sm font-bold transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>O Chef IA está cozinhando...</h4>
                    <p className="text-xs text-orange-500 font-semibold animate-pulse h-4">
                      {loadingStepText}
                    </p>
                  </div>

                  <div className={`max-w-xs mx-auto rounded-full h-1.5 overflow-hidden ${isDarkMode ? 'bg-stone-900' : 'bg-stone-200'}`}>
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-amber-500 h-full transition-all duration-150 ease-out"
                      style={{ width: `${loadingProgress}%` }}
                    ></div>
                  </div>
                  
                  <span className={`text-[10px] block transition-colors duration-500 ${isDarkMode ? 'text-stone-500' : 'text-stone-600'}`}>
                    Processando com modelo de linguagem culinário Dubola v4.2
                  </span>
                </div>
              )}

              {recipeState === 'ready' && generatedRecipe && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
                  {/* Recipe Header Card */}
                  <div className={`border p-6 rounded-3xl relative overflow-hidden backdrop-blur-md transition-all duration-700 ${
                    isDarkMode ? 'bg-stone-950/40 border-stone-800 shadow-black/30' : 'bg-white border-stone-200/80 shadow-stone-100/35'
                  }`}>
                    {/* Background glow effects */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl -z-10"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl -z-10"></div>
                    
                    <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5 ${isDarkMode ? 'border-stone-900' : 'border-stone-200'}`}>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[9px] border font-black px-2.5 py-1 rounded-full uppercase tracking-wider transition-colors duration-500 ${
                            isDarkMode ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-orange-500/5 text-orange-600 border-orange-200'
                          }`}>
                            Receita Exclusiva IA Dubola
                          </span>
                          {/* Sophistication Badge */}
                          {generatedRecipe.sophisticationScore >= 86 ? (
                            <span className="text-[9px] bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-500 border border-yellow-500/30 font-black px-2.5 py-1 rounded-full uppercase tracking-wider animate-pulse flex items-center gap-1">
                              <Award size={10} /> Estrela Michelin em Casa
                            </span>
                          ) : generatedRecipe.sophisticationScore >= 71 ? (
                            <span className="text-[9px] bg-purple-500/10 text-purple-600 border border-purple-500/20 font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                              <Sparkles size={10} /> Alta Gastronomia Doméstica
                            </span>
                          ) : (
                            <span className="text-[9px] bg-amber-500/10 text-amber-600 border border-amber-500/20 font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                              <ChefHat size={10} /> Bistrô Cotidiano
                            </span>
                          )}
                        </div>
                        <h3 className={`text-xl md:text-2xl font-black mt-2.5 leading-tight font-serif transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-stone-950'}`}>
                          {generatedRecipe.name}
                        </h3>
                      </div>
                      
                      <div className="flex gap-3 text-[10px] shrink-0">
                        <div className={`border px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors duration-500 ${
                          isDarkMode ? 'bg-stone-900/60 border-stone-800 text-stone-400' : 'bg-stone-50 border-stone-200 text-stone-600'
                        }`}>
                          <Clock size={13} className="text-orange-500" /> 
                          <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>{generatedRecipe.prepTime}</span>
                        </div>
                        <div className={`border px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors duration-500 ${
                          isDarkMode ? 'bg-stone-900/60 border-stone-800 text-stone-400' : 'bg-stone-50 border-stone-200 text-stone-600'
                        }`}>
                          <Flame size={13} className="text-orange-500" /> 
                          <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>{generatedRecipe.prepTime}</span>
                        </div>
                      </div>
                    </div>

                    {/* Sophistication Meter Gauge */}
                    <div className={`mt-5 border p-4 rounded-2xl transition-colors duration-500 ${
                      isDarkMode ? 'bg-stone-900/40 border-stone-800/80' : 'bg-stone-50 border-stone-200'
                    }`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-[10px] font-black uppercase tracking-wider transition-colors duration-500 ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                          Termômetro de Sofisticação Culinária
                        </span>
                        <span className="text-xs font-black text-orange-500">
                          {generatedRecipe.sophisticationScore}%
                        </span>
                      </div>
                      
                      {/* Gauge Bar */}
                      <div className={`w-full h-2.5 rounded-full relative overflow-hidden border shadow-inner ${
                        isDarkMode ? 'bg-stone-950 border-stone-900' : 'bg-stone-200 border-stone-300'
                      }`}>
                        <div 
                          className="h-full bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(234,88,12,0.4)]"
                          style={{ width: `${generatedRecipe.sophisticationScore}%` }}
                        ></div>
                      </div>
                      
                      <p className={`text-[10.5px] mt-2.5 leading-relaxed font-light transition-colors duration-500 ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                        {generatedRecipe.sophisticationScore >= 86 ? (
                          <span>
                            <strong>Complexidade Máxima:</strong> Prato digno de restaurante estrelado. Utiliza a avançada técnica <em>{generatedRecipe.technique.name}</em> equilibrada com a untuosidade cítrica da <strong>Maionese Dubola Tártaro</strong>, criando contrastes físicos e químicos ideais.
                          </span>
                        ) : generatedRecipe.sophisticationScore >= 71 ? (
                          <span>
                            <strong>Técnica Superior:</strong> Apresenta refino gastronômico com a técnica <em>{generatedRecipe.technique.name}</em>, onde a acidez viva e a crocância de picles da <strong>Maionese Dubola Tártaro</strong> sustentam e elevam os sabores primários.
                          </span>
                        ) : (
                          <span>
                            <strong>Clássico de Bistrô:</strong> Uma preparação elegante e prática usando a técnica <em>{generatedRecipe.technique.name}</em> com a cremosidade e acidez perfeitas da <strong>Maionese Dubola Tártaro</strong> como fio condutor.
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Toggle View Mode Switcher */}
                    <div className={`mt-6 flex border p-1.5 rounded-2xl transition-colors duration-500 ${
                      isDarkMode ? 'bg-stone-950/80 border-stone-800' : 'bg-stone-100 border-stone-200'
                    }`}>
                      <button
                        onClick={() => setViewMode('standard')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-300 ${
                          viewMode === 'standard' 
                            ? (isDarkMode 
                                ? 'bg-gradient-to-r from-stone-900 to-stone-800 text-orange-400 border border-stone-800 shadow-md' 
                                : 'bg-white text-orange-700 border border-stone-200 shadow-sm'
                              )
                            : (isDarkMode ? 'text-stone-400 hover:text-stone-200' : 'text-stone-600 hover:text-stone-900')
                        }`}
                      >
                        <Compass size={14} /> Modo Clássico
                      </button>
                      <button
                        onClick={() => {
                          setViewMode('masterclass');
                          setActiveStepIndex(0);
                          setCompletedSteps([]);
                        }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-300 ${
                          viewMode === 'masterclass' 
                            ? (isDarkMode
                                ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg shadow-orange-950/30'
                                : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20'
                              )
                            : (isDarkMode ? 'text-stone-400 hover:text-stone-200' : 'text-stone-600 hover:text-stone-900')
                        }`}
                      >
                        <BookOpen size={14} /> Aula Masterclass
                      </button>
                    </div>

                    {/* Content Rendering */}
                    <div className="mt-6">
                      {viewMode === 'standard' ? (
                        /* Standard Classic View */
                        <div className="space-y-6 animate-in fade-in duration-300">
                          {/* Technique Highlight */}
                          {generatedRecipe.technique && (
                            <div className={`border rounded-2xl p-5 flex items-start gap-4 transition-colors duration-500 ${
                              isDarkMode ? 'bg-gradient-to-r from-orange-950/15 to-amber-950/10 border-orange-500/10' : 'bg-orange-50/40 border-orange-100/50'
                            }`}>
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                                isDarkMode ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-orange-500/20 text-orange-700 border-orange-200'
                              }`}>
                                <ChefHat size={18} />
                              </div>
                              <div className="space-y-1">
                                <span className={`text-[9px] font-black uppercase tracking-widest block ${isDarkMode ? 'text-orange-400' : 'text-orange-700'}`}>
                                  Técnica de Elite Aplicada
                                </span>
                                <h5 className={`text-sm font-bold transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                                  {generatedRecipe.technique.name}
                                </h5>
                                <p className={`text-[11px] leading-relaxed font-light transition-colors duration-500 ${isDarkMode ? 'text-stone-450' : 'text-stone-600'}`}>
                                  {generatedRecipe.technique.description}
                                </p>
                                <div className={`mt-2.5 pt-2 border-t ${isDarkMode ? 'border-orange-950/30' : 'border-orange-200/50'}`}>
                                  <span className={`text-[9px] font-black uppercase tracking-widest block mb-0.5 ${isDarkMode ? 'text-amber-500' : 'text-orange-700'}`}>
                                    A Ciência Química Culinária:
                                  </span>
                                  <p className={`text-[10px] font-light leading-relaxed transition-colors duration-500 ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                                    {generatedRecipe.technique.science}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Ingredients List */}
                          <div className="space-y-3">
                            <h4 className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${isDarkMode ? 'text-orange-400' : 'text-orange-700'}`}>
                              <Check size={13} className="text-orange-500" /> Ingredientes Necessários:
                            </h4>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-light pl-1">
                              {generatedRecipe.ingredients.map((ing, i) => (
                                <li key={i} className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors duration-500 ${
                                  isDarkMode ? 'bg-stone-900/30 border-stone-800/40 text-stone-300' : 'bg-stone-50 border-stone-200 text-stone-700 shadow-sm'
                                }`}>
                                  <div className="flex items-center gap-2">
                                    <span className="text-orange-500 shrink-0">•</span>
                                    <span>
                                      {ing.includes("Maionese Dubola Tártaro") ? (
                                        <span className={`font-extrabold px-2 py-0.5 rounded border ${
                                          isDarkMode ? 'text-orange-400 bg-orange-500/5 border-orange-500/15' : 'text-orange-700 bg-orange-50 border-orange-200'
                                        }`}>
                                          Maionese Dubola Tártaro
                                        </span>
                                      ) : ing.includes("especial fresco(a)") ? (
                                        ing.replace(" especial fresco(a)", "")
                                      ) : (
                                        ing
                                      )}
                                    </span>
                                  </div>
                                  {ing.includes("especial fresco(a)") && (
                                    <span className="text-[8px] text-[#ea580c] font-black bg-[#ea580c]/10 border border-[#ea580c]/25 px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                                      Geladeira
                                    </span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Steps List */}
                          <div className="space-y-3">
                            <h4 className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${isDarkMode ? 'text-orange-400' : 'text-orange-700'}`}>
                              <Compass size={13} className="text-orange-500" /> Modo de Preparo Clássico:
                            </h4>
                            <ol className="space-y-3 pl-1">
                              {generatedRecipe.steps.map((step, i) => (
                                <li key={i} className={`text-xs leading-relaxed font-light flex gap-3.5 items-start p-3 rounded-xl border transition-colors duration-500 ${
                                  isDarkMode ? 'bg-stone-900/15 border-stone-800/30 text-stone-350' : 'bg-stone-50 border-stone-200 text-stone-700 shadow-sm'
                                }`}>
                                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 border transition-colors duration-500 ${
                                    isDarkMode ? 'bg-stone-900 text-orange-400 border-stone-800' : 'bg-white text-orange-650 border-stone-200 shadow-sm'
                                  }`}>
                                    {i + 1}
                                  </span>
                                  <span className={`flex-1 mt-0.5 ${isDarkMode ? 'text-stone-300' : 'text-stone-800'}`}>
                                    {highlightTarta(step.text)}
                                  </span>
                                </li>
                              ))}
                            </ol>
                          </div>

                          {/* Chef Secret */}
                          <div className={`border rounded-2xl p-5 flex items-start gap-4 transition-colors duration-500 ${
                            isDarkMode ? 'bg-[#130704] border-orange-500/10' : 'bg-orange-50/50 border-orange-100/50'
                          }`}>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                              isDarkMode ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-orange-500/20 text-orange-700 border-orange-200'
                            }`}>
                              <Lightbulb size={18} />
                            </div>
                            <div className="space-y-1">
                              <div className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-orange-400' : 'text-orange-700'}`}>
                                O Segredo do Chef
                              </div>
                              <p className={`text-xs leading-relaxed font-light transition-colors duration-500 ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
                                {generatedRecipe.chefSecret}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Masterclass Step-by-Step View */
                        <div className="animate-in fade-in duration-300">
                          {/* Victory Screen triggered when all steps are completed */}
                          {completedSteps.length === generatedRecipe.steps.length ? (
                            <div className={`border rounded-3xl p-8 text-center space-y-6 relative overflow-hidden transition-colors duration-500 ${
                              isDarkMode 
                                ? 'bg-gradient-to-b from-stone-900 to-stone-950 border-yellow-500/20 shadow-black/40' 
                                : 'bg-gradient-to-b from-yellow-50/50 to-white border-yellow-500/30 shadow-xl shadow-yellow-100/20'
                            }`}>
                              <div className="absolute inset-0 bg-yellow-500/[0.01] pointer-events-none"></div>
                              
                              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 text-stone-950 flex items-center justify-center mx-auto shadow-xl shadow-yellow-950/20 animate-bounce">
                                <Award size={36} />
                              </div>
                              
                              <div className="space-y-2">
                                <span className="text-[9px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/35 font-black px-3 py-1 rounded-full uppercase tracking-widest">
                                  Aula Concluída com Excelência
                                </span>
                                <h4 className={`text-2xl font-black font-serif transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                                  Parabéns, Chef de Elite!
                                </h4>
                                <p className={`text-xs max-w-md mx-auto leading-relaxed transition-colors duration-500 ${isDarkMode ? 'text-stone-400' : 'text-stone-650'}`}>
                                  Você dominou com perfeição a técnica de alta gastronomia <strong>{generatedRecipe.technique.name.split(' (')[0]}</strong> e equilibrou com maestria a assinatura química da <strong>Maionese Dubola Tártaro</strong>!
                                </p>
                              </div>

                              <div className={`border-t pt-5 max-w-sm mx-auto space-y-3.5 transition-colors duration-500 ${isDarkMode ? 'border-stone-800' : 'border-stone-150'}`}>
                                <div className="flex justify-between items-center text-xs">
                                  <span className={isDarkMode ? 'text-stone-500' : 'text-stone-400'}>Prato Executado:</span>
                                  <span className={`font-bold text-right truncate max-w-[200px] ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>{generatedRecipe.name}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                  <span className={isDarkMode ? 'text-stone-500' : 'text-stone-400'}>Grau de Refino:</span>
                                  <span className="font-extrabold text-yellow-500">
                                    {generatedRecipe.sophisticationScore}% - {
                                      generatedRecipe.sophisticationScore >= 86 ? 'Estrela Michelin em Casa' :
                                      generatedRecipe.sophisticationScore >= 71 ? 'Alta Gastronomia Doméstica' : 'Bistrô Cotidiano'
                                    }
                                  </span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                  <span className={isDarkMode ? 'text-stone-500' : 'text-stone-400'}>Técnica Consolidada:</span>
                                  <span className="font-bold text-orange-500">{generatedRecipe.technique.name.split(' (')[0]}</span>
                                </div>
                              </div>

                              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-3">
                                <button
                                  onClick={() => {
                                    setCompletedSteps([]);
                                    setActiveStepIndex(0);
                                  }}
                                  className={`px-6 py-3 rounded-xl border text-xs font-bold transition-all ${
                                    isDarkMode 
                                      ? 'bg-stone-900 border-stone-800 text-white hover:bg-stone-800 hover:border-stone-700' 
                                      : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50 hover:border-stone-300 shadow-sm'
                                  }`}
                                >
                                  Refazer Aula Prática
                                </button>
                                <button
                                  onClick={() => setViewMode('standard')}
                                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 text-xs font-bold text-white hover:from-orange-500 hover:to-amber-500 shadow-lg shadow-orange-950/20 transition-all"
                                >
                                  Ver Receita Completa
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* Step Slider */
                            <div className="space-y-6">
                              {/* Step Progress Bar */}
                              <div className="space-y-2">
                                <div className="flex justify-between items-center text-[10px]">
                                  <span className={`font-black uppercase tracking-wider ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>
                                    Progresso da Aula
                                  </span>
                                  <span className="font-black text-orange-500">
                                    {Math.round((completedSteps.length / generatedRecipe.steps.length) * 100)}% concluído
                                  </span>
                                </div>
                                <div className={`w-full h-1.5 rounded-full overflow-hidden border ${isDarkMode ? 'bg-stone-950 border-stone-900' : 'bg-stone-200 border-stone-300'}`}>
                                  <div 
                                    className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-300 rounded-full"
                                    style={{ width: `${(completedSteps.length / generatedRecipe.steps.length) * 100}%` }}
                                  ></div>
                                </div>
                              </div>

                              {/* Active Step Box */}
                              <div className={`border rounded-2xl p-6 space-y-4 relative transition-colors duration-500 ${
                                isDarkMode ? 'bg-stone-900/40 border-stone-800/80' : 'bg-stone-50 border-stone-200 shadow-sm'
                              }`}>
                                {/* Category Badge */}
                                <div className="flex justify-between items-center gap-2">
                                  {(() => {
                                    const step = generatedRecipe.steps[activeStepIndex];
                                    let badgeClass = isDarkMode ? "bg-stone-800 text-stone-400 border-stone-700/30" : "bg-stone-200 text-stone-600 border-stone-300/40";
                                    if (step.category === "Mise en Place (Organização)") {
                                      badgeClass = "bg-blue-500/10 text-blue-550 border-blue-500/25";
                                    } else if (step.category === "Cocção e Técnica") {
                                      badgeClass = "bg-red-500/10 text-red-550 border-red-500/25";
                                    } else if (step.category === "Descanso Térmico") {
                                      badgeClass = "bg-teal-500/10 text-teal-550 border-teal-500/25";
                                    } else if (step.category === "Napar e Harmonização") {
                                      badgeClass = "bg-amber-500/10 text-amber-600 border-amber-500/25";
                                    } else if (step.category === "Preparo de Acompanhamentos") {
                                      badgeClass = "bg-emerald-500/10 text-emerald-550 border-emerald-500/25";
                                    }
                                    return (
                                      <span className={`text-[9px] font-black border px-2.5 py-1 rounded-full uppercase tracking-wider ${badgeClass}`}>
                                        {step.category}
                                      </span>
                                    );
                                  })()}
                                  <span className={`text-[10px] font-bold ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>
                                    Passo {activeStepIndex + 1} de {generatedRecipe.steps.length}
                                  </span>
                                </div>

                                {/* Step Text */}
                                <p className={`text-sm md:text-base font-serif leading-relaxed min-h-[70px] transition-colors duration-500 ${isDarkMode ? 'text-stone-100' : 'text-stone-900'}`}>
                                  {highlightTarta(generatedRecipe.steps[activeStepIndex].text)}
                                </p>

                                {/* Checkbox control to mark step completed */}
                                <button
                                  onClick={() => {
                                    if (completedSteps.includes(activeStepIndex)) {
                                      setCompletedSteps(completedSteps.filter(i => i !== activeStepIndex));
                                    } else {
                                      setCompletedSteps([...completedSteps, activeStepIndex]);
                                      // Auto advance to next step if there is one
                                      if (activeStepIndex < generatedRecipe.steps.length - 1) {
                                        setTimeout(() => {
                                          setActiveStepIndex(prev => prev + 1);
                                        }, 400);
                                      }
                                    }
                                  }}
                                  className={`w-full py-3 rounded-xl border flex items-center justify-center gap-2.5 text-xs font-bold transition-all duration-300 ${
                                    completedSteps.includes(activeStepIndex)
                                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 font-extrabold shadow-sm shadow-emerald-500/5'
                                      : (isDarkMode
                                          ? 'bg-stone-950/60 border-stone-800 text-stone-400 hover:text-stone-300 hover:bg-stone-900/65'
                                          : 'bg-white border-stone-200 text-stone-600 hover:text-stone-950 hover:bg-stone-50 hover:border-stone-300 shadow-sm'
                                        )
                                  }`}
                                >
                                  {completedSteps.includes(activeStepIndex) ? (
                                    <>
                                      <Check size={14} className="animate-in zoom-in duration-200" /> Passo Concluído!
                                    </>
                                  ) : (
                                    <>
                                      <div className={`w-3.5 h-3.5 rounded border ${isDarkMode ? 'border-stone-700' : 'border-stone-300 bg-stone-50'}`}></div> Marcar Passo como Concluído
                                    </>
                                  )}
                                </button>
                              </div>

                              {/* Sensory Cues Pane */}
                              <div className={`border rounded-2xl p-5 space-y-3.5 transition-colors duration-500 ${
                                isDarkMode ? 'bg-stone-900/20 border-stone-800/60' : 'bg-stone-100/50 border-stone-200/50 shadow-sm'
                              }`}>
                                <span className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                                  <Eye size={12} className="text-orange-500" /> Sinais Sensoriais do Chef
                                </span>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                  {/* Visual Cue */}
                                  <div className={`p-3 rounded-xl border space-y-1 text-left transition-colors duration-500 ${
                                    isDarkMode ? 'bg-stone-900/40 border-stone-800/40' : 'bg-white border-stone-200 shadow-sm'
                                  }`}>
                                    <span className="text-[9px] font-black text-blue-500 uppercase tracking-wider flex items-center gap-1">
                                      <Eye size={10} /> Visão
                                    </span>
                                    <p className={`text-[10.5px] font-light leading-relaxed transition-colors duration-500 ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
                                      {generatedRecipe.steps[activeStepIndex].cues?.visual || "Observe a mudança de textura, coloração e liberação de vapor à medida que o calor se propaga."}
                                    </p>
                                  </div>

                                  {/* Auditory Cue */}
                                  <div className={`p-3 rounded-xl border space-y-1 text-left transition-colors duration-500 ${
                                    isDarkMode ? 'bg-stone-900/40 border-stone-800/40' : 'bg-white border-stone-200 shadow-sm'
                                  }`}>
                                    <span className="text-[9px] font-black text-amber-600 uppercase tracking-wider flex items-center gap-1">
                                      <Volume2 size={10} /> Audição
                                    </span>
                                    <p className={`text-[10.5px] font-light leading-relaxed transition-colors duration-500 ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
                                      {generatedRecipe.steps[activeStepIndex].cues?.acoustic || "Ouça o sussurro suave da cocção. Se começar a estalar de forma violenta, controle a chama."}
                                    </p>
                                  </div>

                                  {/* Tactile Cue */}
                                  <div className={`p-3 rounded-xl border space-y-1 text-left transition-colors duration-500 ${
                                    isDarkMode ? 'bg-stone-900/40 border-stone-800/40' : 'bg-white border-stone-200 shadow-sm'
                                  }`}>
                                    <span className="text-[9px] font-black text-rose-500 uppercase tracking-wider flex items-center gap-1">
                                      <Flame size={10} /> Tato / Resistência
                                    </span>
                                    <p className={`text-[10.5px] font-light leading-relaxed transition-colors duration-500 ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
                                      {generatedRecipe.steps[activeStepIndex].cues?.tactile || "Toque de leve com a ponta do garfo ou pinça para aferir a firmeza e maciez adequadas."}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Culinary Science Glossary Focus */}
                              {generatedRecipe.steps[activeStepIndex].category === "Cocção e Técnica" && (
                                <div className={`border rounded-2xl p-4 flex gap-3 text-left transition-colors duration-500 ${
                                  isDarkMode ? 'bg-gradient-to-r from-orange-950/10 via-stone-900/10 to-stone-950/5 border-orange-500/10' : 'bg-orange-50/30 border-orange-100/50 shadow-sm'
                                }`}>
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border mt-0.5 ${
                                    isDarkMode ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-orange-500/20 text-orange-700 border-orange-200'
                                  }`}>
                                    <BookOpen size={14} />
                                  </div>
                                  <div className="space-y-1">
                                    <span className={`text-[9px] font-black uppercase tracking-widest block ${isDarkMode ? 'text-orange-400' : 'text-orange-700'}`}>
                                      Ciência na Prática: {generatedRecipe.technique.name.split(' (')[0]}
                                    </span>
                                    <p className={`text-[10px] leading-relaxed font-light transition-colors duration-500 ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                                      {generatedRecipe.technique.science}
                                    </p>
                                  </div>
                                </div>
                              )}

                              {/* Mini-Dictionary / Technique Glossary */}
                              <div className={`border p-4 rounded-2xl space-y-2 text-left transition-colors duration-500 ${
                                isDarkMode ? 'bg-stone-950/60 border-stone-800' : 'bg-stone-100/50 border-stone-200'
                              }`}>
                                <span className={`text-[9px] font-black uppercase tracking-wider block ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>
                                  Mini-Dicionário de Técnicas da Aula
                                </span>
                                <div className="flex flex-wrap gap-2">
                                  {Object.entries(generatedRecipe.technique.glossary || {
                                    "Mise en Place": "Organização prévia e pesagem de todos os ingredientes antes de ligar o fogo.",
                                    "Napar": "Cobrir um alimento de forma uniforme com um molho espesso e aveludado.",
                                    "Caramelização": "Transformação química de açúcares pelo calor, gerando cor dourada e sabores complexos."
                                  }).map(([term, definition]) => (
                                    <div key={term} className={`text-[10px] border px-2.5 py-1.5 rounded-xl flex-1 min-w-[200px] transition-colors duration-500 ${
                                      isDarkMode ? 'bg-stone-900/80 border-stone-800 text-stone-300' : 'bg-white border-stone-200 text-stone-700 shadow-sm'
                                    }`}>
                                      <strong className="text-orange-500 block font-bold mb-0.5">{term}</strong>
                                      <span className={`font-light ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>{definition}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Slider Navigation Buttons */}
                              <div className="flex justify-between items-center gap-4 pt-2">
                                <button
                                  disabled={activeStepIndex === 0}
                                  onClick={() => setActiveStepIndex(prev => prev - 1)}
                                  className={`px-4 py-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-bold disabled:opacity-20 disabled:pointer-events-none ${
                                    isDarkMode 
                                      ? 'border-stone-800 bg-stone-900/40 text-stone-300 hover:text-white hover:bg-stone-800' 
                                      : 'border-stone-200 bg-white text-stone-700 hover:text-stone-950 hover:bg-stone-50 shadow-sm'
                                  }`}
                                >
                                  <ArrowLeft size={14} /> Voltar
                                </button>

                                <div className="flex gap-2">
                                  {activeStepIndex === generatedRecipe.steps.length - 1 ? (
                                    <button
                                      onClick={() => {
                                        // Force complete all steps to show victory screen
                                        const allIndexes = Array.from({ length: generatedRecipe.steps.length }, (_, i) => i);
                                        setCompletedSteps(allIndexes);
                                      }}
                                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-lg shadow-orange-950/20 transition-all flex items-center gap-1.5 text-xs font-bold"
                                    >
                                      Finalizar Aula <Award size={14} />
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => setActiveStepIndex(prev => prev + 1)}
                                      className={`px-5 py-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-bold ${
                                        isDarkMode 
                                          ? 'bg-stone-900 hover:bg-stone-800 border-stone-800 text-stone-300 hover:text-white' 
                                          : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-700 hover:text-stone-950 shadow-sm'
                                      }`}
                                    >
                                      Próximo <ArrowRight size={14} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Product Details Tabs (Nutritional Info & Ingredients) */}
      <section id="ingredientes" className="max-w-6xl mx-auto px-6 py-20 space-y-12">
        
        <div className={`flex flex-col md:flex-row items-start md:items-end justify-between gap-6 border-b pb-6 ${
          isDarkMode ? 'border-stone-900' : 'border-stone-200'
        }`}>
          <div className="text-left space-y-2">
            <div className="text-orange-500 text-xs font-black uppercase tracking-widest">Informações Técnicas</div>
            <h2 className={`text-3xl font-extrabold transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Transparência & Qualidade</h2>
          </div>

          <div className={`flex rounded-xl p-1 shrink-0 border transition-all duration-500 ${
            isDarkMode ? 'bg-stone-950 border-stone-800' : 'bg-stone-100 border-stone-200'
          }`}>
            <button
              onClick={() => setActiveTab('ingredientes')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'ingredientes' 
                  ? 'bg-[#ea580c] text-white shadow-sm' 
                  : (isDarkMode ? 'text-stone-400 hover:text-stone-200' : 'text-stone-500 hover:text-stone-800')
              }`}
            >
              Ingredientes
            </button>
            <button
              onClick={() => setActiveTab('tabela')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'tabela' 
                  ? 'bg-[#ea580c] text-white shadow-sm' 
                  : (isDarkMode ? 'text-stone-400 hover:text-stone-200' : 'text-stone-500 hover:text-stone-800')
              }`}
            >
              Tabela Nutricional
            </button>
          </div>
        </div>

        {activeTab === 'ingredientes' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
            {[
              { title: 'Óleos Vegetais Premium', desc: 'Base aveludada emulsionada com ovos pasteurizados para garantir segurança alimentar e cremosidade duradoura.' },
              { title: 'Picles Especial Crocante', desc: 'Pepinos em conserva milimetricamente triturados para manter pedaços reais que explodem em sabor ácido e textura.' },
              { title: 'Cebola Roxa e Alho', desc: 'Aromatizantes frescos fundamentais que sustentam a base da culinária clássica francesa em nossa receita.' },
              { title: 'Sementes de Mostarda Inteiras', desc: 'Trazem um sutil toque terroso e picante, além de embelezar o visual da maionese.' },
              { title: 'Salsinha e Especiarias Finas', desc: 'Adicionam o frescor verde necessário para equilibrar a gordura e dar cor ao creme.' },
              { title: 'Acidez Equilibrada de Limão', desc: 'Um toque final cítrico para um sabor de molho artesanal feito na hora.' }
            ].map((ing, i) => (
              <div key={i} className={`border rounded-2xl p-5 space-y-2 transition-all duration-500 hover:border-orange-500/20 hover:scale-[1.01] ${
                isDarkMode 
                  ? 'bg-stone-950 border-stone-900 shadow-black/20' 
                  : 'bg-white border-stone-200 shadow-lg shadow-stone-100/30'
              }`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${
                  isDarkMode ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-500/15 text-orange-700'
                }`}>
                  0{i+1}
                </div>
                <h4 className={`text-sm font-extrabold transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>{ing.title}</h4>
                <p className={`text-xs leading-relaxed font-light transition-colors duration-500 ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>{ing.desc}</p>
              </div>
            ))}
          </div>
        ) : (
          <div id="tabela" className={`border rounded-3xl p-6 md:p-8 max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300 transition-colors duration-500 ${
            isDarkMode 
              ? 'bg-stone-950 border-stone-900 shadow-black/20' 
              : 'bg-white border-stone-200 shadow-xl shadow-stone-100/40'
          }`}>
            <div className={`flex items-center justify-between border-b pb-4 ${isDarkMode ? 'border-stone-800' : 'border-stone-200'}`}>
              <div>
                <h3 className={`text-lg font-bold transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Informação Nutricional</h3>
                <p className={`text-xs transition-colors duration-500 ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>Porção de 12g (1 colher de sopa)</p>
              </div>
              <span className={`text-xs font-extrabold uppercase px-3 py-1 rounded-full border transition-colors duration-500 ${
                isDarkMode 
                  ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' 
                  : 'bg-orange-500/10 border-orange-200/50 text-orange-700'
              }`}>
                VD% Base 2000kcal
              </span>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Valor Energético', value: '45 kcal = 189 kJ', pct: '2%' },
                { label: 'Carboidratos', value: '0.6 g', pct: '0%' },
                { label: 'Proteínas', value: '0.1 g', pct: '0%' },
                { label: 'Gorduras Totais', value: '4.8 g', pct: '9%' },
                { label: '  Gorduras Saturadas', value: '0.7 g', pct: '3%' },
                { label: '  Gorduras Trans', value: '0 g', pct: '**' },
                { label: 'Fibra Alimentar', value: '0 g', pct: '0%' },
                { label: 'Sódio', value: '88 mg', pct: '4%' }
              ].map((row, idx) => (
                <div 
                  key={idx} 
                  className={`flex justify-between py-2 text-xs border-b ${
                    isDarkMode ? 'border-stone-900/60' : 'border-stone-200/60'
                  } ${
                    row.label.startsWith(' ') 
                      ? `pl-4 ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}` 
                      : `font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`
                  }`}
                >
                  <span>{row.label}</span>
                  <div className="flex gap-12">
                    <span className={isDarkMode ? 'text-stone-300' : 'text-stone-650'}>{row.value}</span>
                    <span className={`w-10 text-right font-bold ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>{row.pct}</span>
                  </div>
                </div>
              ))}
            </div>

            <p className={`text-[10px] leading-relaxed font-light transition-colors duration-500 ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>
              * % Valores Diários de referência com base em uma dieta de 2.000 kcal ou 8.400 kJ. Seus valores diários podem ser maiores ou menores dependendo de suas necessidades energéticas. ** VD não estabelecido.
            </p>
          </div>
        )}
      </section>

      {/* Where to Buy / Footer Call to Action */}
      <section id="onde-comprar" className={`py-24 border-t text-center relative overflow-hidden transition-all duration-700 ${
        isDarkMode ? 'bg-gradient-to-t from-[#110502] to-[#18181b]/30 border-stone-900/60' : 'bg-gradient-to-t from-[#faf8f5] to-white border-stone-200/50'
      }`}>
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#ea580c]/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto px-6 space-y-8 relative z-10">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-lg transition-colors duration-500 ${
            isDarkMode ? 'bg-orange-500/10 border border-orange-500/20 text-orange-400' : 'bg-orange-50 border border-orange-200/40 text-[#ea580c]'
          }`}>
            <Store size={32} />
          </div>
          
          <div className="space-y-3">
            <h2 className={`text-3xl md:text-5xl font-black tracking-tight transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Leve a Experiência Dubola Para Casa</h2>
            <p className={`max-w-xl mx-auto text-sm leading-relaxed transition-colors duration-500 ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
              Disponível nas principais redes de supermercados premium, empórios gourmet e aplicativos de entrega rápida em todo o país.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto pt-4">
            {['Pão de Açúcar', 'St. Marche', 'Zaffari', 'Zona Sul', 'Supernosso', 'Verdemar', 'Mambo', 'Oba Hortifruti'].map((market, idx) => (
              <div 
                key={idx} 
                className={`border rounded-xl py-3 px-4 text-xs font-bold transition-all shadow-md ${
                  isDarkMode 
                    ? 'bg-stone-950 border-stone-900 text-stone-300 hover:text-white hover:border-orange-500/20' 
                    : 'bg-white border-stone-200 text-stone-600 hover:text-orange-650 hover:border-orange-200 hover:bg-orange-50/5'
                }`}
              >
                {market}
              </div>
            ))}
          </div>

          <div className="pt-6">
            <p className={`text-xs transition-colors duration-500 ${isDarkMode ? 'text-stone-500' : 'text-stone-500'}`}>
              Quer revender a linha Dubola no seu estabelecimento? <a href="#contato" className="text-orange-500 font-bold hover:underline">Fale com nosso comercial</a>.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`border-t py-8 px-6 text-center text-xs transition-colors duration-500 ${
        isDarkMode ? 'bg-stone-950/65 border-stone-950 text-stone-500' : 'bg-stone-50 border-stone-200 text-stone-600'
      }`}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-orange-500 flex items-center justify-center text-white font-black text-[10px] shadow-sm">
              D
            </div>
            <span className={`font-extrabold transition-colors duration-500 ${isDarkMode ? 'text-stone-200' : 'text-stone-900'}`}>DUBOLA</span>
            <span className={`text-[10px] transition-colors duration-500 ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>© 2026 Dubola Alimentos S.A. Todos os direitos reservados.</span>
          </div>
          
          <div className="flex gap-6">
            <a href="#termos" className={`transition-colors duration-300 ${isDarkMode ? 'text-stone-450 hover:text-orange-400' : 'text-stone-500 hover:text-orange-600'}`}>Termos de Uso</a>
            <a href="#privacidade" className={`transition-colors duration-300 ${isDarkMode ? 'text-stone-450 hover:text-orange-400' : 'text-stone-500 hover:text-orange-600'}`}>Políticas de Privacidade</a>
            <a href="#sac" className={`transition-colors duration-300 ${isDarkMode ? 'text-stone-450 hover:text-orange-400' : 'text-stone-500 hover:text-orange-600'}`}>Fale Conosco (SAC)</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
