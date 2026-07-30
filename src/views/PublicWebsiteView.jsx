import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { 
  Volume2, 
  VolumeX, 
  ArrowRight, 
  X, 
  Play, 
  Sparkles, 
  LogIn, 
  Maximize2, 
  Compass, 
  Move,
  Info
} from 'lucide-react';

// Agency projects matrix
const PROJECTS_DATA = [
  {
    id: 'iluminismo',
    title: 'o iluminismo',
    category: 'estratégia digital & dados',
    image: '/assets/projects/iluminismo.png',
    client: 'CS Ag Analytics',
    year: '2026',
    role: 'Planejamento & BI',
    description: 'Campanha conceitual focada em clareza de dados, racionalismo analítico e design minimalista. Criamos uma estrutura de BI para tomada de decisões estratégicas em tempo real, baseada em comportamento do consumidor e análise preditiva.',
    details: 'Utilizando painéis integrados e IA generativa para decodificar comportamentos, o projeto gerou um aumento de 42% na eficiência de conversão. O design visual adota uma paleta monocromática com pontos de foco dourados, inspirada no Iluminismo europeu.'
  },
  {
    id: 'rupestre',
    title: 'arte rupestre',
    category: 'identidade visual & origem',
    image: '/assets/projects/rupestre.png',
    client: 'Origens SA',
    year: '2025',
    role: 'Branding & Direção de Arte',
    description: 'Resgate histórico da comunicação humana traduzido em elementos de marca contemporâneos. Uma homenagem à primeira forma de expressão gráfica da humanidade, combinando texturas orgânicas e minimalismo moderno.',
    details: 'Desenvolvemos tipografias proprietárias e texturas vetoriais que simulam pigmentos naturais e rochas, aplicados a uma identidade corporativa futurista. O contraste entre o primitivo e o tecnológico cria um posicionamento de marca único.'
  },
  {
    id: 'era-do-radio-tv',
    title: 'era do rádio e tv',
    category: 'campanha cross-media',
    image: '/assets/projects/era-do-radio-tv.png',
    client: 'Rede Difusora',
    year: '2026',
    role: 'Produção Multimídia',
    description: 'Campanha de reposicionamento inspirada na época de ouro da radiodifusão e das primeiras transmissões televisivas. Uma abordagem nostálgica e estilizada com tom de voz focado em contar histórias marcantes.',
    details: 'Produzimos spots de áudio analógicos e vídeos com filtros vintage integrados a campanhas digitais interativas. A ação engajou mais de 2 milhões de ouvintes/espectadores, provando que o storytelling clássico é atemporal quando combinado com precisão digital.'
  },
  {
    id: 'marketing-digital',
    title: 'amplificação de voz',
    category: 'performance & social media',
    image: '/assets/projects/marketing-digital.png',
    client: 'Comunica Global',
    year: '2025',
    role: 'Performance & Conteúdo',
    description: 'Aceleração de canais sociais através do conceito de amplificação orgânica e paga. Sintonizando marcas ao ritmo do público-alvo com posts de alto valor de design e interações baseadas em timing perfeito.',
    details: 'Uma estratégia de conteúdo centrada em micro-comunidades e impulsionada por inteligência artificial para otimização de criativos. Alcançamos recordes de compartilhamento orgânico e um custo de aquisição de leads 30% menor que a média de mercado.'
  },
  {
    id: 'sobre-nos',
    title: 'o legado cs ag',
    category: 'branding institucional',
    image: '/assets/projects/sobre.png',
    client: 'Comunicação Social Ag',
    year: 'Desde 2020',
    role: 'Quem Somos',
    description: 'Nossa própria essência destilada em uma narrativa de marca imersiva. Somos estrategistas que pensam, criativos que realizam e técnicos que refinam, tudo guiado pela busca incessante de impacto real.',
    details: 'Localizada em Poços de Caldas e atuando globalmente, a Comunicação Social Ag une design estratégico, desenvolvimento tecnológico proprietário e marketing focado em conversão para elevar marcas a novos patamares de relevância.'
  },
  {
    id: 'elite-os',
    title: 'plataforma eliteos',
    category: 'design de produto & saas',
    image: '/assets/projects/home-old.png',
    client: 'Elite OS Inc.',
    year: '2026',
    role: 'UX/UI & Full-stack',
    description: 'Como redesenhamos a gestão interna de agências criando um sistema operacional integrado de alta fidelidade. O EliteOS unifica CRM, controle de produção em Kanban e BI financeiro em uma única interface premium.',
    details: 'Desenvolvida com TailwindCSS e Supabase, a plataforma substitui dezenas de planilhas e softwares fragmentados. Possui camadas inteligentes de IA para briefing automático de tarefas, estimativa de horas e dashboards de rentabilidade operacional.'
  }
];

export default function PublicWebsiteView() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // States
  const [introStep, setIntroStep] = useState('waiting'); // 'waiting' | 'playing' | 'completed'
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [activeProject, setActiveProject] = useState(null);
  const [hoveredProject, setHoveredProject] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Refs for audio and Three.js variables
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const cardMeshesRef = useRef([]);
  const groupRef = useRef(null);

  // Dragging state variables
  const isMouseDown = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const targetRotation = useRef({ x: 0, y: 0 });
  const currentRotation = useRef({ x: 0, y: 0 });
  const rotationVelocity = useRef({ x: 0, y: 0 });
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  // Audio setup
  const initAudio = () => {
    if (audioRef.current) return;
    
    const audio = new Audio('/assets/brand/som-piano.mp3');
    audio.loop = true;
    audioRef.current = audio;

    // Web Audio API to analyze audio for visual pulsing
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      audioContextRef.current = ctx;

      const source = ctx.createMediaElementSource(audio);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      source.connect(analyser);
      analyser.connect(ctx.destination);
    } catch (e) {
      console.warn("Web Audio API not fully supported or blocked:", e);
    }
  };

  const startExperience = async () => {
    initAudio();
    setIntroStep('playing');

    if (audioEnabled && audioRef.current) {
      try {
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }
        audioRef.current.volume = 0.5;
        audioRef.current.play();
      } catch (err) {
        console.warn("Audio autoplay blocked by browser:", err);
      }
    }

    // GSAP Intro Sequence timeline
    const tl = gsap.timeline({
      onComplete: () => {
        setIntroStep('completed');
      }
    });

    tl.to('.intro-text-1', { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out', delay: 0.5 })
      .to('.intro-text-1', { opacity: 0, y: -20, duration: 0.8, ease: 'power3.in', delay: 1.5 })
      .to('.intro-text-2', { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' })
      .to('.intro-text-2', { opacity: 0, y: -20, duration: 0.8, ease: 'power3.in', delay: 1.5 })
      .to('.intro-logo', { opacity: 1, scale: 1, duration: 1.5, ease: 'back.out(1.2)' })
      .to('.intro-tagline', { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }, '-=0.8')
      .to('.intro-curtain', { opacity: 0, duration: 1.5, delay: 1.5 });
  };

  const skipIntro = () => {
    setIntroStep('completed');
    if (audioEnabled && audioRef.current) {
      audioRef.current.volume = 0.3;
      audioRef.current.play().catch(() => {});
    }
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (audioEnabled) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {});
      }
    }
    setAudioEnabled(!audioEnabled);
  };

  // Three.js Gallery Setup
  useEffect(() => {
    if (introStep !== 'completed' || !canvasRef.current) return;

    // Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Background space fog
    scene.background = new THREE.Color(0x09090b);
    scene.fog = new THREE.FogExp2(0x09090b, 0.015);

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 0.1); // Camera inside the sphere center
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    // Group to hold the cards and rotate
    const galleryGroup = new THREE.Group();
    scene.add(galleryGroup);
    groupRef.current = galleryGroup;

    // Faint golden particle stars (Es Devlin depth)
    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 600;
    const posArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 60;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.08,
      color: 0xf7d406,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending
    });
    const starField = new THREE.Points(particleGeo, particleMat);
    galleryGroup.add(starField);

    // Texture Loader
    const textureLoader = new THREE.TextureLoader();
    const radius = 16; // Radius of sphere shell
    const cardWidth = 6.2;
    const cardHeight = 4.0;
    const cardGeometry = new THREE.PlaneGeometry(cardWidth, cardHeight, 16, 16);

    const meshes = [];

    // Create cards on a cylindrical/spherical dome grid
    PROJECTS_DATA.forEach((proj, index) => {
      // Cylindrical/Spherical distribution
      const total = PROJECTS_DATA.length;
      
      // Calculate angles: distribute them around the circle
      const angle = (index / total) * Math.PI * 2;
      
      // Alternate heights for volumetric layout
      const height = (index % 2 === 0 ? 2 : -2) + (Math.random() * 0.4 - 0.2);

      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);
      const y = height;

      // Load texture
      const texture = textureLoader.load(proj.image, () => {
        setLoadingProgress((prev) => prev + (100 / total));
      });
      texture.colorSpace = THREE.SRGBColorSpace;

      // Mesh material
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85
      });

      const mesh = new THREE.Mesh(cardGeometry, material);
      mesh.position.set(x, y, z);
      
      // Orient towards camera center
      mesh.lookAt(0, 0, 0);
      mesh.userData = { project: proj, originalPosition: new THREE.Vector3(x, y, z) };

      galleryGroup.add(mesh);
      meshes.push(mesh);
    });

    cardMeshesRef.current = meshes;

    // Ambient Lighting (just in case we use standard materials later, currently basic)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Dynamic rotation animation variables
    let animationFrameId;
    const dragFactor = 0.002;
    const friction = 0.95;

    // Game loop
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Dampening rotation (inertia)
      if (!isMouseDown.current) {
        // Apply friction to velocity
        rotationVelocity.current.x *= friction;
        rotationVelocity.current.y *= friction;

        // Apply velocity to target rotation
        targetRotation.current.x += rotationVelocity.current.x;
        targetRotation.current.y += rotationVelocity.current.y;
      }

      // Limit vertical rotation to avoid flipping upside down
      targetRotation.current.y = Math.max(-Math.PI / 8, Math.min(Math.PI / 8, targetRotation.current.y));

      // Lerp/Easing scroll simulation
      currentRotation.current.x += (targetRotation.current.x - currentRotation.current.x) * 0.08;
      currentRotation.current.y += (targetRotation.current.y - currentRotation.current.y) * 0.08;

      // Rotate group
      galleryGroup.rotation.y = currentRotation.current.x;
      galleryGroup.rotation.x = currentRotation.current.y;

      // Faint particle rotation
      starField.rotation.y += 0.0003;

      // Audio analysis for subtle card pulsing
      if (analyserRef.current) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Calculate average volume
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        const pulse = 1 + (average / 255) * 0.03; // max 3% pulse

        // Pulsate camera or meshes
        meshes.forEach((mesh) => {
          if (hoveredProject && mesh.userData.project.id === hoveredProject.id) {
            // Keep hovered card large and unaffected by small audio pulse
          } else {
            mesh.scale.set(pulse, pulse, pulse);
          }
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    // Event Handlers for interaction
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Drag / Touch handlers
    const onMouseDown = (e) => {
      isMouseDown.current = true;
      setIsDragging(false);
      previousMousePosition.current = {
        x: e.clientX,
        y: e.clientY
      };
      rotationVelocity.current = { x: 0, y: 0 };
    };

    const onMouseMove = (e) => {
      // Calculate normal coordinates for Raycasting
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;

      // Perform raycasting when not dragging
      if (!isMouseDown.current) {
        raycaster.current.setFromCamera(mouse.current, camera);
        const intersects = raycaster.current.intersectObjects(meshes);

        if (intersects.length > 0) {
          const intersectedMesh = intersects[0].object;
          const proj = intersectedMesh.userData.project;
          
          if (!hoveredProject || hoveredProject.id !== proj.id) {
            setHoveredProject(proj);
            document.body.style.cursor = 'pointer';

            // Scale up hovered mesh
            gsap.to(intersectedMesh.scale, {
              x: 1.15,
              y: 1.15,
              z: 1.15,
              duration: 0.3,
              overwrite: 'auto'
            });
            // Glow effect: increase opacity
            intersectedMesh.material.opacity = 1.0;
          }
        } else {
          if (hoveredProject) {
            // Restore scale of previously hovered card
            const prevMesh = meshes.find(m => m.userData.project.id === hoveredProject.id);
            if (prevMesh) {
              gsap.to(prevMesh.scale, {
                x: 1,
                y: 1,
                z: 1,
                duration: 0.3,
                overwrite: 'auto'
              });
              prevMesh.material.opacity = 0.85;
            }
            setHoveredProject(null);
            document.body.style.cursor = 'default';
          }
        }
        return;
      }

      // Dragging logic
      setIsDragging(true);
      const deltaX = e.clientX - previousMousePosition.current.x;
      const deltaY = e.clientY - previousMousePosition.current.y;

      targetRotation.current.x += deltaX * dragFactor;
      targetRotation.current.y += deltaY * dragFactor;

      // Record velocity
      rotationVelocity.current.x = deltaX * dragFactor * 0.4;
      rotationVelocity.current.y = deltaY * dragFactor * 0.4;

      previousMousePosition.current = {
        x: e.clientX,
        y: e.clientY
      };
    };

    const onMouseUp = (e) => {
      isMouseDown.current = false;
      
      // If it wasn't a drag, it's a click!
      if (!isDragging && hoveredProject) {
        setActiveProject(hoveredProject);
        
        // Zoom camera in towards the clicked mesh
        const clickedMesh = meshes.find(m => m.userData.project.id === hoveredProject.id);
        if (clickedMesh && cameraRef.current) {
          // Get the position of the mesh
          const targetPos = new THREE.Vector3();
          clickedMesh.getWorldPosition(targetPos);
          
          // Animate camera slightly towards it
          const camTarget = targetPos.clone().multiplyScalar(0.7); // move 70% of the way
          gsap.to(cameraRef.current.position, {
            x: camTarget.x,
            y: camTarget.y,
            z: camTarget.z,
            duration: 0.8,
            ease: 'power3.out'
          });
        }
      }
    };

    // Touch support
    const onTouchStart = (e) => {
      if (e.touches.length === 1) {
        onMouseDown(e.touches[0]);
      }
    };

    const onTouchMove = (e) => {
      if (e.touches.length === 1) {
        onMouseMove(e.touches[0]);
      }
    };

    const onTouchEnd = (e) => {
      onMouseUp(e);
    };

    const canvas = canvasRef.current;
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchmove', onTouchMove, { passive: true });
    canvas.addEventListener('touchend', onTouchEnd);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (canvas) {
        canvas.removeEventListener('mousedown', onMouseDown);
        canvas.removeEventListener('mousemove', onMouseMove);
        canvas.removeEventListener('mouseup', onMouseUp);
        canvas.removeEventListener('touchstart', onTouchStart);
        canvas.removeEventListener('touchmove', onTouchMove);
        canvas.removeEventListener('touchend', onTouchEnd);
      }
      
      // Dispose materials & geometries
      meshes.forEach((mesh) => {
        mesh.geometry.dispose();
        mesh.material.dispose();
      });
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, [introStep]);

  // Audio cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Back from project details view
  const closeDetails = () => {
    setActiveProject(null);
    // Animate camera back to center
    if (cameraRef.current) {
      gsap.to(cameraRef.current.position, {
        x: 0,
        y: 0,
        z: 0.1,
        duration: 0.8,
        ease: 'power3.out'
      });
    }
  };

  return (
    <div ref={containerRef} className="relative w-screen h-screen overflow-hidden bg-black text-white font-sans select-none">
      
      {/* 1. INTRO WAITING SCREEN (Click to enable audio/interact) */}
      {introStep === 'waiting' && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 px-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(247,212,6,0.03)_0%,transparent_70%)] pointer-events-none" />
          
          <div className="max-w-md w-full flex flex-col items-center text-center space-y-8 animate-in fade-in duration-1000">
            {/* Holographic glowing paper speech bubble (branding) */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <div className="absolute inset-0 bg-yellow-500/10 rounded-full blur-2xl animate-pulse" />
              <img 
                src="/assets/brand/logo-sem-fundo.png" 
                alt="Comunicação Social Ag" 
                className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(247,212,6,0.3)] animate-bounce"
                style={{ animationDuration: '4s' }}
              />
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl font-extrabold tracking-widest uppercase text-white font-display">
                comunicação social ag
              </h1>
              <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold font-body">
                agência de publicidade estratégica
              </p>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed font-body max-w-sm">
              Preparamos uma experiência imersiva 3D para apresentar nossos maiores projetos. Ative o som para uma experiência sensorial completa.
            </p>

            <button 
              onClick={startExperience}
              className="group relative flex items-center gap-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-xl shadow-yellow-500/10 hover:shadow-yellow-500/20 active:scale-95"
            >
              <Play size={14} className="fill-black group-hover:scale-110 transition-transform" />
              iniciar experiência
            </button>
          </div>

          <div className="absolute bottom-6 text-[10px] text-zinc-600 font-mono tracking-widest uppercase">
            © 2026 comunicação social ag • todos os direitos reservados
          </div>
        </div>
      )}

      {/* 2. INTRO CINEMATIC SCREEN (GSAP Sequencer playing) */}
      {introStep === 'playing' && (
        <div className="absolute inset-0 z-40 bg-black flex items-center justify-center px-6">
          <button 
            onClick={skipIntro}
            className="absolute top-6 right-6 z-50 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
          >
            pular intro
          </button>

          {/* Intro texts (controlled by GSAP) */}
          <div className="text-center absolute space-y-2">
            <h2 className="intro-text-1 opacity-0 translate-y-10 text-3xl font-bold tracking-widest font-display text-zinc-400">
              somos a <span className="text-white font-extrabold">amplificação</span> da sua voz.
            </h2>
            <h2 className="intro-text-2 opacity-0 translate-y-10 text-3xl font-bold tracking-widest font-display text-zinc-400">
              pensamos como <span className="text-white font-extrabold">estrategistas</span>, executamos como <span className="text-white font-extrabold">criativos</span>.
            </h2>
            
            <div className="intro-logo opacity-0 scale-75 flex flex-col items-center space-y-4">
              <img 
                src="/assets/brand/logo-sem-fundo.png" 
                alt="CS Ag Logo" 
                className="w-32 h-32 object-contain filter drop-shadow-[0_0_20px_rgba(247,212,6,0.2)]" 
              />
              <h1 className="text-4xl font-extrabold tracking-[0.2em] text-white uppercase font-display">
                comunicação social ag
              </h1>
              <p className="intro-tagline opacity-0 translate-y-4 text-[10px] text-yellow-500 uppercase tracking-[0.4em] font-bold">
                transformando marcas em potência
              </p>
            </div>
          </div>

          {/* Curtain fade-out */}
          <div className="intro-curtain absolute inset-0 bg-black/0 pointer-events-none" />
        </div>
      )}

      {/* 3. MAIN WEBGL CANVAS FOR THREEJS */}
      {introStep === 'completed' && (
        <>
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0 block bg-zinc-950" />
          
          {/* Ambient Scenic Glow Backdrop */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(247,212,6,0.015)_0%,transparent_80%)] pointer-events-none z-10" />

          {/* Interactive HUD Overlay */}
          <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-6 md:p-8">
            
            {/* Header */}
            <header className="flex items-center justify-between pointer-events-auto">
              <div className="flex items-center gap-3">
                <img 
                  src="/assets/brand/logo-sem-fundo.png" 
                  alt="CS Ag Logo" 
                  className="h-8 w-8 object-contain" 
                />
                <span className="font-extrabold tracking-[0.25em] text-sm text-white uppercase font-display">
                  comunicação social ag
                </span>
              </div>

              {/* Navigation links & Login CTA */}
              <nav className="flex items-center gap-6">
                <button 
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-2 text-zinc-400 hover:text-yellow-500 transition-colors text-[10px] uppercase font-bold tracking-widest"
                >
                  <LogIn size={12} />
                  área do cliente
                </button>
              </nav>
            </header>

            {/* Bottom HUD: Active project tooltip or dragging guide */}
            <footer className="flex flex-col md:flex-row md:items-end justify-between gap-4 pointer-events-auto">
              
              {/* Project Hover Tooltip (Bottom Left) */}
              <div className="min-h-[100px] flex flex-col justify-end max-w-md">
                {hoveredProject ? (
                  <div className="space-y-1 animate-in slide-in-from-bottom-2 duration-300">
                    <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest block">
                      {hoveredProject.category}
                    </span>
                    <h3 className="text-4xl font-extrabold tracking-wider lowercase text-white font-display">
                      {hoveredProject.title}
                    </h3>
                    <p className="text-xs text-zinc-400 font-body leading-relaxed pt-1">
                      {hoveredProject.description}
                    </p>
                    <div className="flex items-center gap-2 pt-2 text-[10px] text-white/50 uppercase tracking-widest font-mono">
                      <span>clique para explorar</span>
                      <ArrowRight size={10} className="text-yellow-500" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5 opacity-60">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block">
                      explore o portfólio
                    </span>
                    <h3 className="text-2xl font-bold tracking-wide text-zinc-400 font-display flex items-center gap-2">
                      <Move size={16} className="text-yellow-500/80 animate-pulse" />
                      arrastar para navegar
                    </h3>
                    <p className="text-[10px] text-zinc-600 font-body">
                      clique e arraste o mouse em qualquer direção dentro do domo tridimensional.
                    </p>
                  </div>
                )}
              </div>

              {/* HUD Controls (Bottom Right) */}
              <div className="flex items-center gap-3">
                {/* Audio Toggle */}
                <button 
                  onClick={toggleAudio}
                  className="p-3 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80 rounded-xl text-zinc-400 hover:text-white transition-all shadow-xl backdrop-blur-md"
                  title={audioEnabled ? "Mutar Som" : "Ativar Som"}
                >
                  {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>
              </div>

            </footer>
          </div>
        </>
      )}

      {/* 4. DETAIL OVERLAY PANEL (Glassmorphism layout) */}
      {activeProject && (
        <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-300">
          
          {/* Close Backdrop Click Area */}
          <div className="absolute inset-0 z-0" onClick={closeDetails} />

          {/* Slider Panel */}
          <div className="relative z-10 w-full max-w-xl bg-zinc-950/80 border-l border-zinc-800/80 backdrop-blur-2xl h-full flex flex-col overflow-y-auto custom-scrollbar shadow-2xl p-6 md:p-10 animate-in slide-in-from-right duration-500 ease-out">
            
            {/* Header / Back CTA */}
            <div className="flex items-center justify-between pb-6 border-b border-zinc-800/60">
              <button 
                onClick={closeDetails}
                className="group flex items-center gap-2 text-zinc-400 hover:text-white text-[10px] uppercase font-bold tracking-widest transition-colors"
              >
                <X size={14} className="group-hover:rotate-90 transition-transform duration-300" />
                voltar à galeria
              </button>
              
              <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
                casag // portfolio
              </div>
            </div>

            {/* Content Container */}
            <div className="py-8 space-y-8 flex-1">
              
              {/* Media image */}
              <div className="relative rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl aspect-[16/10] bg-zinc-900 group">
                <img 
                  src={activeProject.image} 
                  alt={activeProject.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
              </div>

              {/* Title & Metadata */}
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-yellow-500 font-bold uppercase tracking-widest block mb-1">
                    {activeProject.category}
                  </span>
                  <h2 className="text-4xl font-extrabold tracking-wide lowercase text-white font-display">
                    {activeProject.title}
                  </h2>
                </div>

                {/* Grid Metadata */}
                <div className="grid grid-cols-2 gap-4 bg-zinc-900/40 border border-zinc-900 rounded-xl p-4 text-xs font-body">
                  <div>
                    <span className="text-zinc-500 block uppercase tracking-widest text-[9px] font-bold">Cliente</span>
                    <span className="text-zinc-200">{activeProject.client}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block uppercase tracking-widest text-[9px] font-bold">Ano</span>
                    <span className="text-zinc-200">{activeProject.year}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block uppercase tracking-widest text-[9px] font-bold">Escopo</span>
                    <span className="text-zinc-200">{activeProject.role}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block uppercase tracking-widest text-[9px] font-bold">Status</span>
                    <span className="text-green-500 flex items-center gap-1.5 font-bold uppercase text-[9px] tracking-wider pt-0.5">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" /> entregue
                    </span>
                  </div>
                </div>
              </div>

              {/* Text Blocks */}
              <div className="space-y-4 font-body leading-relaxed text-sm text-zinc-300">
                <p className="font-semibold text-zinc-100">
                  {activeProject.description}
                </p>
                <p className="text-xs text-zinc-400">
                  {activeProject.details}
                </p>
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-zinc-800/60 flex items-center justify-between">
              <button 
                onClick={() => navigate('/login')}
                className="w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-lg shadow-yellow-500/10 hover:shadow-yellow-500/20"
              >
                solicitar orçamento semelhante
                <ArrowRight size={14} />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
