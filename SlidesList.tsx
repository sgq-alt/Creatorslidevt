import React, { useState, useEffect, useCallback } from 'react';
import { Presentation, Slide, SlideType, Comment, Version, Collaborator } from './types';
import PresentationSelector from './components/PresentationSelector';
import SlidesList from './components/SlidesList';
import SlideWorkspace from './components/SlideWorkspace';
import RightSidebar from './components/RightSidebar';
import { Sparkles, Printer, FileDown, Download, Layers, HelpCircle, Save, CheckCircle2, UserCheck, Play, X, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { initAuth, googleSignIn, logout, isGoogleAuthReady } from './utils/googleAuth';
import { exportToGoogleSheets } from './utils/googleSheetsExport';
import { exportToPPTX } from './utils/pptxExport';
import { getDefaultPresentations } from './utils/defaultData';

const COLLABORATORS: Collaborator[] = [
  {
    id: 'collab_1',
    name: 'Mariana (Gestora)',
    role: 'Gestora Executiva de Processos',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    color: 'bg-rose-500',
    online: true,
  },
  {
    id: 'collab_2',
    name: 'Carlos (BI)',
    role: 'Engenheiro de BI e Analytics',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    color: 'bg-indigo-500',
    online: true,
  },
  {
    id: 'collab_3',
    name: 'Ana (Lean / Qualidade)',
    role: 'Especialista em Qualidade e Lean',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80',
    color: 'bg-emerald-500',
    online: true,
  },
  {
    id: 'collab_4',
    name: 'Roberto (Diretor)',
    role: 'Diretor Geral de Operações',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    color: 'bg-amber-500',
    online: false,
  }
];

export default function App() {
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [activePresId, setActivePresId] = useState<string>('');
  const [activeSlideId, setActiveSlideId] = useState<string>('');
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [hasPendingSync, setHasPendingSync] = useState<boolean>(false);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  
  // Google Workspace Integration states
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [needsGoogleSetupMsg, setNeedsGoogleSetupMsg] = useState(false);
  const [exportingToSheets, setExportingToSheets] = useState(false);
  const [exportedSheetUrl, setExportedSheetUrl] = useState<string | null>(null);
  const [sheetsError, setSheetsError] = useState<string | null>(null);
  
  // Track offline-only edits
  const [offlineQueue, setOfflineQueue] = useState<Record<string, Presentation>>({});

  // Listen to Google Auth changes if Firebase config is ready
  useEffect(() => {
    if (isGoogleAuthReady()) {
      const unsubscribe = initAuth(
        (user, token) => {
          setGoogleUser(user);
          setGoogleToken(token);
        },
        () => {
          setGoogleUser(null);
          setGoogleToken(null);
        }
      );
      return () => unsubscribe();
    }
  }, []);

  // Google Sheets Export triggers
  const handleExportSheetsClick = async () => {
    if (!isGoogleAuthReady()) {
      setNeedsGoogleSetupMsg(true);
      return;
    }

    if (!googleUser || !googleToken) {
      try {
        const result = await googleSignIn();
        if (result) {
          setGoogleUser(result.user);
          setGoogleToken(result.accessToken);
          runSheetsExport(result.accessToken);
        }
      } catch (err: any) {
        setSheetsError('Falha ao autenticar com o Google: ' + err.message);
      }
    } else {
      runSheetsExport(googleToken);
    }
  };

  const runSheetsExport = async (token: string) => {
    if (!activePresentation) return;
    setExportingToSheets(true);
    setSheetsError(null);
    setExportedSheetUrl(null);

    try {
      const result = await exportToGoogleSheets(activePresentation, token);
      setExportedSheetUrl(result.spreadsheetUrl);
    } catch (err: any) {
      console.error(err);
      setSheetsError(err.message || 'Erro inesperado ao exportar para o Google Planilhas.');
    } finally {
      setExportingToSheets(false);
    }
  };

  // Fetch presentations from server with robust local fallback
  const loadPresentations = async () => {
    let loadedData: Presentation[] | null = null;
    try {
      const res = await fetch('/api/presentations');
      if (res.ok) {
        loadedData = await res.json();
      } else {
        console.warn('Servidor retornou erro ao carregar apresentações. Usando cache local.');
      }
    } catch (err) {
      console.error('Falha ao conectar com o servidor. Carregando dados locais.', err);
      setIsOffline(true);
    }

    if (loadedData && loadedData.length > 0) {
      setPresentations(loadedData);
      localStorage.setItem('slideai_all_presentations', JSON.stringify(loadedData));
      
      setActivePresId((prev) => prev || loadedData![0].id);
      if (loadedData[0].slides && loadedData[0].slides.length > 0) {
        setActiveSlideId((prev) => prev || loadedData[0].slides[0].id);
      }
    } else {
      // Try loading from localStorage
      const cached = localStorage.getItem('slideai_all_presentations');
      if (cached) {
        try {
          const cachedData = JSON.parse(cached) as Presentation[];
          if (cachedData.length > 0) {
            setPresentations(cachedData);
            setActivePresId((prev) => prev || cachedData[0].id);
            if (cachedData[0].slides && cachedData[0].slides.length > 0) {
              setActiveSlideId((prev) => prev || cachedData[0].slides[0].id);
            }
            return;
          }
        } catch (e) {
          console.error('Erro ao fazer parse do cache local', e);
        }
      }

      // No cache and no server response (or error) -> Load defaults!
      const defaults = getDefaultPresentations();
      setPresentations(defaults);
      localStorage.setItem('slideai_all_presentations', JSON.stringify(defaults));
      setActivePresId((prev) => prev || defaults[0].id);
      if (defaults[0].slides && defaults[0].slides.length > 0) {
        setActiveSlideId((prev) => prev || defaults[0].slides[0].id);
      }
    }
  };

  useEffect(() => {
    loadPresentations();
  }, []);

  // Offline/Online triggers
  useEffect(() => {
    const goOnline = () => {
      setIsOffline(false);
      triggerAutomaticSync();
    };
    const goOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, [offlineQueue]);

  const activePresentation = presentations.find((p) => p.id === activePresId);
  const activeSlide = activePresentation?.slides.find((s) => s.id === activeSlideId);

  // Sync queued presentations to backend
  const triggerAutomaticSync = async () => {
    const queueItems = Object.values(offlineQueue);
    if (queueItems.length === 0) return;

    try {
      const res = await fetch('/api/presentations/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(queueItems),
      });
      if (res.ok) {
        const result = await res.json();
        setOfflineQueue({});
        setHasPendingSync(false);
        setPresentations(result.data);
        localStorage.setItem('slideai_all_presentations', JSON.stringify(result.data));
      }
    } catch (err) {
      console.error('Sync failed:', err);
    }
  };

  // Save changes (with automatic server sync or offline queuing)
  const savePresentationState = useCallback(async (updatedPres: Presentation) => {
    // 1. Update React state locally
    setPresentations((prev) => {
      const next = prev.map((p) => (p.id === updatedPres.id ? updatedPres : p));
      localStorage.setItem('slideai_all_presentations', JSON.stringify(next));
      return next;
    });

    // 2. Persist to localStorage as robust safety backup
    localStorage.setItem(`slideai_pres_${updatedPres.id}`, JSON.stringify(updatedPres));

    if (navigator.onLine && !isOffline) {
      try {
        const res = await fetch('/api/presentations', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-User-Author': 'Usuário (Colaborador)'
          },
          body: JSON.stringify(updatedPres),
        });
        if (res.ok) {
          const freshData = await res.json();
          // Merge version history return from backend
          setPresentations((prev) => {
            const next = prev.map((p) => (p.id === freshData.id ? freshData : p));
            localStorage.setItem('slideai_all_presentations', JSON.stringify(next));
            return next;
          });
        }
      } catch (err) {
        console.warn('Network issue during save. Queuing for sync.', err);
        setOfflineQueue((prev) => ({ ...prev, [updatedPres.id]: updatedPres }));
        setHasPendingSync(true);
      }
    } else {
      setOfflineQueue((prev) => ({ ...prev, [updatedPres.id]: updatedPres }));
      setHasPendingSync(true);
    }
  }, [isOffline]);

  // Rename or change category of current presentation
  const handleRenamePresentation = (id: string, newTitle: string, newCategory: string) => {
    const target = presentations.find((p) => p.id === id);
    if (!target) return;
    const updated = { ...target, title: newTitle, category: newCategory };
    savePresentationState(updated);
  };

  // Switch Theme
  const handleChangeTheme = (themeId: 'beige' | 'blue' | 'green' | 'charcoal' | 'terracotta') => {
    if (!activePresentation) return;
    const updated = { ...activePresentation, themeId };
    savePresentationState(updated);
  };

  // Create new presentation from scratch
  const handleCreatePresentation = (title: string, themeId: 'beige' | 'blue' | 'green' | 'charcoal' | 'terracotta', category: string) => {
    const newPres: Presentation = {
      id: `pres_${Date.now()}`,
      title,
      themeId,
      category,
      lastSaved: new Date().toISOString(),
      slides: [
        {
          id: `slide_${Date.now()}_1`,
          type: 'title',
          title: title,
          subtitle: 'Apresentação Corporativa Inteligente',
          content: 'Descreva aqui o propósito principal desta apresentação, as metas estratégicas e o escopo de análise.',
        },
      ],
      comments: [],
      versions: [],
    };

    setPresentations((prev) => {
      const next = [...prev, newPres];
      localStorage.setItem('slideai_all_presentations', JSON.stringify(next));
      return next;
    });
    setActivePresId(newPres.id);
    setActiveSlideId(newPres.slides[0].id);
    savePresentationState(newPres);
  };

  // Delete presentation
  const handleDeletePresentation = (id: string) => {
    const remaining = presentations.filter((p) => p.id !== id);
    setPresentations(remaining);
    localStorage.setItem('slideai_all_presentations', JSON.stringify(remaining));
    if (remaining.length > 0) {
      setActivePresId(remaining[0].id);
      if (remaining[0].slides.length > 0) {
        setActiveSlideId(remaining[0].slides[0].id);
      }
    }
    // Delete database item or sync
    if (navigator.onLine && !isOffline) {
      fetch(`/api/presentations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, delete: true }) // simplify backend handle
      }).catch(err => console.log(err));
    }
  };

  // Slide level CRUD
  const handleAddSlide = (type: SlideType) => {
    if (!activePresentation) return;

    // Seeding customized initial templates based on selection to save user effort
    let initialSlide: Slide = {
      id: `slide_${Date.now()}`,
      type,
      title: '',
      subtitle: '',
      content: '',
    };

    switch (type) {
      case 'title':
        initialSlide = {
          ...initialSlide,
          title: 'Novo Título do Slide',
          subtitle: 'Breve explicação conceitual da meta',
          content: 'Destaque aqui a visão geral corporativa.',
        };
        break;
      case 'results':
        initialSlide = {
          ...initialSlide,
          title: 'Resultados e Métricas Relevantes',
          subtitle: 'Visão consolidadas de faturamento e produtividade',
          content: 'A otimização de gargalos resultou em crescimento estruturado em todas as unidades.',
          metrics: [
            { id: `m_${Date.now()}_1`, label: 'Produtividade', value: '94.2%', change: '+4.5% vs Meta', trend: 'up' },
            { id: `m_${Date.now()}_2`, label: 'Custo de Produção', value: 'R$ 1.2M', change: '-5.3% redução', trend: 'up' },
            { id: `m_${Date.now()}_3`, label: 'Refugo Operacional', value: '1.2%', change: '-0.3% queda', trend: 'up' },
          ]
        };
        break;
      case 'indicators':
        initialSlide = {
          ...initialSlide,
          title: 'Indicadores de Desempenho (KPIs)',
          subtitle: 'Acompanhamento de metas e qualidade de processos',
          content: 'Abaixo estão descritos os principais índices de performance operacional aferidos de forma automática.',
          bulletPoints: [
            'Tempo médio de ciclo reduzido para 12 segundos',
            'SLA de atendimento cumprido em 98.4% das cargas',
            'Nível de refugo estável no patamar histórico'
          ],
          metrics: [
            { id: `m_${Date.now()}_4`, label: 'SLA Entrega', value: '98.4%', change: '+1.4% vs Q1', trend: 'up' },
          ]
        };
        break;
      case 'improvements':
        initialSlide = {
          ...initialSlide,
          title: 'Iniciativas de Melhoria Contínua',
          subtitle: 'Projetos Lean e automação industrial',
          content: 'Plano estratégico para erradicação de perdas operacionais por meio de automação e treinamento da equipe.',
          steps: [
            { id: `s_${Date.now()}_1`, title: 'Treinamento de Células de Trabalho', description: 'Metodologia 5S aplicada na expedição', status: 'completed' },
            { id: `s_${Date.now()}_2`, title: 'Integração de Sensores IoT', description: 'Monitoramento contínuo das injetoras', status: 'in_progress' },
          ]
        };
        break;
      case 'comparison':
        initialSlide = {
          ...initialSlide,
          title: 'Análise Antes vs. Depois',
          subtitle: 'Ganhos reais obtidos com o redesenho do processo',
          content: 'Comparação prática detalhando os ganhos obtidos na substituição das esteiras mecânicas.',
          comparisons: [
            { id: `c_${Date.now()}_1`, before: 'Processamento manual com alto risco ergonômico', after: 'Braço robótico com zero incidências e 4x mais velocidade' },
          ]
        };
        break;
      case 'closing':
        initialSlide = {
          ...initialSlide,
          title: 'Próximos Passos e Agradecimentos',
          subtitle: 'Visão de futuro e metas para o Q3',
          content: 'Manteremos o foco em expandir a eficiência do chão de fábrica e concluir as auditorias programadas.',
          bulletPoints: [
            'Expansão das células automatizadas',
            'Homologação de novos insumos',
            'Abertura do canal de contato para dúvidas técnico-operacionais'
          ]
        };
        break;
    }

    const updatedSlides = [...activePresentation.slides, initialSlide];
    const updated = { ...activePresentation, slides: updatedSlides };
    
    savePresentationState(updated);
    setActiveSlideId(initialSlide.id);
  };

  const handleDeleteSlide = (slideId: string) => {
    if (!activePresentation || activePresentation.slides.length <= 1) return;
    const remainingSlides = activePresentation.slides.filter((s) => s.id !== slideId);
    
    const updated = { ...activePresentation, slides: remainingSlides };
    savePresentationState(updated);
    
    if (activeSlideId === slideId) {
      setActiveSlideId(remainingSlides[0].id);
    }
  };

  const handleMoveSlide = (slideId: string, direction: 'up' | 'down') => {
    if (!activePresentation) return;
    const index = activePresentation.slides.findIndex((s) => s.id === slideId);
    if (index === -1) return;

    const newSlides = [...activePresentation.slides];
    if (direction === 'up' && index > 0) {
      const temp = newSlides[index];
      newSlides[index] = newSlides[index - 1];
      newSlides[index - 1] = temp;
    } else if (direction === 'down' && index < newSlides.length - 1) {
      const temp = newSlides[index];
      newSlides[index] = newSlides[index + 1];
      newSlides[index + 1] = temp;
    }

    const updated = { ...activePresentation, slides: newSlides };
    savePresentationState(updated);
  };

  const handleUpdateSlide = (updatedSlide: Slide) => {
    if (!activePresentation) return;
    const updatedSlides = activePresentation.slides.map((s) =>
      s.id === updatedSlide.id ? updatedSlide : s
    );
    const updated = { ...activePresentation, slides: updatedSlides };
    savePresentationState(updated);
  };

  // Restore previous version from history
  const handleRestoreVersion = (version: Version) => {
    if (!activePresentation) return;
    const restored = {
      ...activePresentation,
      slides: version.slides,
      lastSaved: new Date().toISOString(),
    };
    savePresentationState(restored);
    if (version.slides.length > 0) {
      setActiveSlideId(version.slides[0].id);
    }
  };

  // Comments and suggestions
  const handleAddComment = (text: string, isSuggestion?: boolean, suggestionData?: any) => {
    if (!activePresentation || !activeSlideId) return;

    const newComment: Comment = {
      id: `comm_${Date.now()}`,
      slideId: activeSlideId,
      author: 'Você (Autor)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      text,
      timestamp: new Date().toISOString(),
      isSuggestion,
      suggestionData,
      status: isSuggestion ? 'pending' : undefined,
    };

    const updated = {
      ...activePresentation,
      comments: [...activePresentation.comments, newComment],
    };
    savePresentationState(updated);
  };

  const handleResolveComment = (commentId: string, action: 'accept' | 'decline') => {
    if (!activePresentation) return;

    const updatedComments = activePresentation.comments.map((c) => {
      if (c.id !== commentId) return c;
      return { ...c, status: action === 'accept' ? 'accepted' : 'declined' };
    }) as Comment[];

    let updatedSlides = [...activePresentation.slides];

    // If accepted and is suggestion, apply suggested changes immediately to the slide!
    const targetComment = activePresentation.comments.find((c) => c.id === commentId);
    if (action === 'accept' && targetComment?.isSuggestion && targetComment.suggestionData) {
      const suggest = targetComment.suggestionData;
      updatedSlides = updatedSlides.map((s) => {
        if (s.id !== targetComment.slideId) return s;
        if (suggest.type === 'update_content') {
          return { ...s, content: suggest.suggestedText || s.content };
        }
        return s;
      });
    }

    const updated = {
      ...activePresentation,
      comments: updatedComments,
      slides: updatedSlides,
    };
    savePresentationState(updated);
  };

  // Inject a simulated live collaborator comment based on slide content
  const triggerSimulatedComment = useCallback(() => {
    if (!activePresentation || !activeSlideId) return;

    const liveCollabs = COLLABORATORS.filter(c => c.id !== 'collab_4'); // Online guys
    const randomCollab = liveCollabs[Math.floor(Math.random() * liveCollabs.length)];

    // Generate smart comment based on slide type
    let commentText = 'Ficou muito bom o slide. Sugiro apenas darmos destaque a esse número!';
    let isSuggest = false;
    let suggestData = null;

    switch (activeSlide?.type) {
      case 'results':
        commentText = `Podemos adicionar a evolução trimestral nas reuniões operacionais? Esse faturamento ficou excelente!`;
        isSuggest = true;
        suggestData = {
          type: 'update_content',
          suggestedText: 'Receita Operacional e Lucro Líquido consolidados superaram a projeção anual em 15.4%.'
        };
        break;
      case 'indicators':
        commentText = `Muito consistente. A taxa de OTIF está impecável, parabéns equipe de logística!`;
        break;
      case 'improvements':
        commentText = `Sugiro reescrever a descrição da segunda melhoria para deixar mais clara para o Roberto ler.`;
        isSuggest = true;
        suggestData = {
          type: 'update_content',
          suggestedText: 'Monitoramento IoT ativo em 100% das extrusoras principais para prevenção de perdas por ociosidade.'
        };
        break;
      case 'comparison':
        commentText = `A diferença visual de setup rápido ficou muito impactante. Ótimo slide de antes e depois!`;
        break;
    }

    const newComment: Comment = {
      id: `comm_sim_${Date.now()}`,
      slideId: activeSlideId,
      author: randomCollab.name,
      avatar: randomCollab.avatar,
      text: commentText,
      timestamp: new Date().toISOString(),
      isSuggestion: isSuggest,
      suggestionData: suggestData,
      status: isSuggest ? 'pending' : undefined,
    };

    const updated = {
      ...activePresentation,
      comments: [...activePresentation.comments, newComment],
    };

    setPresentations((prev) =>
      prev.map((p) => (p.id === activePresentation.id ? updated : p))
    );
  }, [activePresentation, activeSlideId, activeSlide]);

  return (
    <div className="min-h-screen bg-[#F4F1EA] flex flex-col font-sans select-none overflow-hidden">
      {/* 1. TOP HEADER BANNER */}
      <header className="bg-white border-b border-[#E8E2D6] px-6 py-4 flex items-center justify-between shadow-xs no-print">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#4B6B4C] rounded-lg flex items-center justify-center text-white font-bold text-sm">
            S
          </div>
          <div>
            <h1 className="text-sm font-bold text-[#2D5A82] tracking-tight font-display">SlideAI Studio</h1>
            <p className="text-[10px] text-[#8C857A] font-medium">Apresentações de Resultados com IA e Colaboração em Nuvem</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Google Connection / Sheets export buttons */}
          {googleUser ? (
            <div className="flex items-center gap-2 border-r border-[#E8E2D6] pr-2 mr-1">
              <img
                src={googleUser.photoURL || ''}
                alt={googleUser.displayName || ''}
                className="w-5 h-5 rounded-full object-cover border"
                referrerPolicy="no-referrer"
                title={`Conectado como ${googleUser.email}`}
              />
              <span className="text-[10px] font-bold text-[#4B6B4C] max-w-[80px] truncate" title={googleUser.displayName || ''}>
                {googleUser.displayName?.split(' ')[0]}
              </span>
              <button
                onClick={async () => {
                  await logout();
                  setGoogleUser(null);
                  setGoogleToken(null);
                }}
                className="text-[9px] font-bold text-red-600 hover:underline"
                title="Sair do Google"
              >
                Sair
              </button>
            </div>
          ) : isGoogleAuthReady() ? (
            <button
              onClick={handleExportSheetsClick}
              className="px-3 py-1.5 border border-[#E8E2D6] hover:bg-stone-50 text-[#8C857A] hover:text-[#5C574F] text-xs font-semibold rounded-md flex items-center gap-1 transition-all"
              title="Fazer Login com Google"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#4B6B4C]" />
              <span>Conectar Google</span>
            </button>
          ) : null}

          <button
            onClick={handleExportSheetsClick}
            className="px-4 py-1.5 bg-[#4B6B4C] text-white hover:bg-[#3D573E] text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all shadow-xs"
            title="Exportar apresentação em abas organizadas no Google Planilhas"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Exportar Planilha</span>
          </button>

          <button
            onClick={() => activePresentation && exportToPPTX(activePresentation)}
            className="px-4 py-1.5 bg-[#D95D39] text-white hover:bg-[#C24F2C] text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all shadow-xs"
            title="Baixar apresentação completa em formato PowerPoint (.pptx)"
            disabled={!activePresentation}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Baixar PowerPoint (PPTX)</span>
          </button>

          <button
            onClick={() => setIsPrinting(true)}
            className="px-4 py-1.5 border border-[#4B6B4C] text-[#4B6B4C] hover:bg-[#4B6B4C] hover:text-white text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all shadow-xs"
            title="Exportar apresentação para PDF via impressão"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Exportar PDF</span>
          </button>
          
          <div className="flex -space-x-1.5 ml-2">
            {COLLABORATORS.map((c) => (
              <div key={c.id} className="relative group" title={`${c.name} - ${c.role}`}>
                <img
                  src={c.avatar}
                  alt={c.name}
                  className="w-6 h-6 rounded-full border-2 border-white object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white ${
                  c.online ? 'bg-emerald-500' : 'bg-[#8C857A]'
                }`} />
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* 2. PRESENTATION SELECTOR / TABS */}
      <PresentationSelector
        presentations={presentations}
        activeId={activePresId}
        onSelect={(id) => {
          setActivePresId(id);
          const pres = presentations.find((p) => p.id === id);
          if (pres && pres.slides.length > 0) {
            setActiveSlideId(pres.slides[0].id);
          }
        }}
        onCreate={handleCreatePresentation}
        onDelete={handleDeletePresentation}
        onRename={handleRenamePresentation}
        isOffline={isOffline}
        onSync={triggerAutomaticSync}
        hasPendingSync={hasPendingSync}
      />

      {/* 3. CORE WORKSPACE */}
      {activePresentation && activeSlide ? (
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden no-print">
          {/* Left panel: Miniature cards */}
          <SlidesList
            slides={activePresentation.slides}
            activeSlideId={activeSlideId}
            themeId={activePresentation.themeId}
            onSelectSlide={setActiveSlideId}
            onAddSlide={handleAddSlide}
            onDeleteSlide={handleDeleteSlide}
            onMoveSlide={handleMoveSlide}
            onChangeTheme={handleChangeTheme}
          />

          {/* Center panel: Canvas editor workspace */}
          <SlideWorkspace
            slide={activeSlide}
            themeId={activePresentation.themeId}
            presentationTitle={activePresentation.title}
            onUpdateSlide={handleUpdateSlide}
            isOffline={isOffline}
          />

          {/* Right panel: Collab, versions, team */}
          <RightSidebar
            comments={activePresentation.comments || []}
            versions={activePresentation.versions || []}
            collaborators={COLLABORATORS}
            activeSlideId={activeSlideId}
            onAddComment={handleAddComment}
            onResolveComment={handleResolveComment}
            onRestoreVersion={handleRestoreVersion}
            onApplyAIPrompt={() => {}}
            onTriggerSimulatedComment={triggerSimulatedComment}
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-10 text-stone-400 font-sans italic">
          Nenhuma apresentação ou slide selecionado. Crie ou selecione um para começar.
        </div>
      )}

      {/* 4. PRINT PREVIEW OVERLAY / PDF GENERATOR VIEW */}
      {isPrinting && activePresentation && (
        <div className="fixed inset-0 bg-stone-900 z-50 overflow-y-auto p-8 flex flex-col items-center">
          {/* Header controls inside print preview overlay */}
          <div className="w-full max-w-4xl bg-white rounded-xl p-4 flex items-center justify-between border mb-6 no-print">
            <div>
              <h3 className="text-sm font-bold text-stone-800">Modo de Exportação de Slides (PDF)</h3>
              <p className="text-[10px] text-stone-500">Cada slide abaixo será impresso em formato de paisagem perfeito sem menus ou botões.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsPrinting(false)}
                className="px-4 py-2 border hover:bg-stone-50 rounded-lg text-stone-700 text-xs font-semibold"
              >
                Voltar ao Editor
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm"
              >
                <Printer className="w-4 h-4" /> Confirmar Impressão / Salvar PDF
              </button>
            </div>
          </div>

          {/* The list of printable slides rendered in standard landscape card sheets */}
          <div className="print-page-container space-y-8 print:space-y-0 w-full max-w-4xl">
            {activePresentation.slides.map((s, index) => {
              const theme = activePresentation.themeId === 'beige' ? 'bg-[#faf8f5] text-[#2c2724]' : activePresentation.themeId === 'blue' ? 'bg-[#f0f4f8] text-[#1a2d42]' : 'bg-[#f4f7f5] text-[#193224]';
              const secondaryColor = activePresentation.themeId === 'beige' ? 'bg-[#f4f0ea]' : activePresentation.themeId === 'blue' ? 'bg-[#e1e7f0]' : 'bg-[#e5ebe7]';
              return (
                <div
                  key={s.id}
                  className={`slide-print-card aspect-[16/10] w-full ${theme} rounded-2xl p-10 shadow-lg flex flex-col justify-between overflow-hidden relative border`}
                >
                  <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-mono text-stone-500/70 border-b pb-2">
                    <span>{activePresentation.title}</span>
                    <span>Slide {index + 1} de {activePresentation.slides.length}</span>
                  </div>

                  <div className="my-auto space-y-5">
                    <h1 className="text-3xl font-bold font-display tracking-tight leading-tight">{s.title}</h1>
                    {s.subtitle && <p className="text-sm font-semibold opacity-80 italic">{s.subtitle}</p>}
                    
                    <div className="grid grid-cols-12 gap-6 items-center">
                      <div className={`${s.imageUrl ? 'col-span-7' : 'col-span-12'} space-y-4 text-xs leading-relaxed`}>
                        {s.content && <p className="text-stone-700">{s.content}</p>}
                        
                        {s.bulletPoints && s.bulletPoints.length > 0 && (
                          <ul className="space-y-1.5 list-disc pl-5 font-medium">
                            {s.bulletPoints.map((bp, bIdx) => (
                              <li key={bIdx}>{bp}</li>
                            ))}
                          </ul>
                        )}

                        {s.metrics && s.metrics.length > 0 && (
                          <div className="grid grid-cols-3 gap-2.5 pt-2">
                            {s.metrics.map((m) => (
                              <div key={m.id} className={`p-3 rounded-lg ${secondaryColor} border flex flex-col`}>
                                <span className="text-[9px] font-bold text-stone-500 uppercase">{m.label}</span>
                                <span className="text-xl font-bold my-0.5">{m.value}</span>
                                <span className="text-[9px] font-semibold">{m.change}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {s.steps && s.steps.length > 0 && (
                          <div className="space-y-2 pt-2">
                            {s.steps.map((step) => (
                              <div key={step.id} className={`p-2.5 rounded-lg border ${secondaryColor} flex items-center gap-2`}>
                                <div className={`w-3 h-3 rounded-full ${step.status === 'completed' ? 'bg-emerald-600' : 'border border-stone-400'}`} />
                                <div>
                                  <h4 className="font-bold text-stone-900 text-[11px]">{step.title}</h4>
                                  <p className="text-stone-600 text-[10px]">{step.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {s.comparisons && s.comparisons.length > 0 && (
                          <div className="grid grid-cols-2 gap-3 pt-2">
                            {s.comparisons.map((c) => (
                              <div key={c.id} className="p-3 rounded-lg border bg-white space-y-1">
                                <div className="p-1.5 bg-red-50 text-red-900 border rounded text-[10px]">
                                  <span className="font-bold uppercase text-[8px] text-red-500 block mb-0.5">Antes</span>
                                  {c.before}
                                </div>
                                <div className="p-1.5 bg-emerald-50 text-emerald-900 border rounded text-[10px]">
                                  <span className="font-bold uppercase text-[8px] text-emerald-600 block mb-0.5">Depois</span>
                                  {c.after}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {s.imageUrl && (
                        <div className="col-span-5">
                          <img src={s.imageUrl} className="w-full aspect-[4/3] rounded-lg object-cover border" referrerPolicy="no-referrer" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[8px] font-mono text-stone-400 border-t pt-3">
                    <span>Exportado via SlideAI platform</span>
                    <span>Página {index + 1}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- GOOGLE SHEETS WORKSPACE INTEGRATION MODALS --- */}

      {/* 1. Setup Required Modal */}
      {needsGoogleSetupMsg && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-[#E8E2D6] shadow-xl text-stone-800 space-y-4">
            <div className="flex items-start justify-between">
              <h3 className="text-sm font-bold text-[#2D5A82] uppercase tracking-wide">Integração do Google Planilhas</h3>
              <button onClick={() => setNeedsGoogleSetupMsg(false)} className="p-1 hover:bg-stone-100 rounded-full">
                <X className="w-4 h-4 text-[#8C857A]" />
              </button>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              A exportação para o Google Planilhas requer que as credenciais do Google Workspace estejam configuradas e aceitas na sua plataforma.
            </p>
            <div className="bg-[#FDFBF7] border border-[#E8E2D6] rounded-xl p-4 text-xs space-y-2">
              <span className="font-bold text-[#4B6B4C] block">Instruções para Ativar:</span>
              <ol className="list-decimal list-inside space-y-1 text-stone-600">
                <li>Veja o cartão de <strong className="text-stone-800">Conexão do Google Workspace</strong> que foi aberto no bate-papo.</li>
                <li>Clique em <strong className="text-stone-800">Aceitar / Confirmar</strong>.</li>
                <li>Uma vez habilitado, você poderá clicar em <strong className="text-stone-800">Exportar Planilha</strong> para vincular sua conta Google e salvar seus resultados em tempo real!</li>
              </ol>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setNeedsGoogleSetupMsg(false)}
                className="px-5 py-2 bg-[#4B6B4C] hover:bg-[#3D573E] text-white font-bold rounded-lg text-xs shadow-xs"
              >
                Entendi, continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Loading / Processing Modal */}
      {exportingToSheets && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-[#E8E2D6] shadow-xl flex flex-col items-center justify-center text-center space-y-4">
            <Loader2 className="w-10 h-10 text-[#4B6B4C] animate-spin" />
            <div>
              <h3 className="font-bold text-stone-800 text-sm">Criando Planilha Inteligente</h3>
              <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                Formatando as abas operacionais (Métricas, Planos de Ação e Comparativos Antes vs Depois)...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Export Success Modal */}
      {exportedSheetUrl && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-[#CAD6CE] shadow-xl text-stone-800 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Exportado com Sucesso!</span>
              </div>
              <button onClick={() => setExportedSheetUrl(null)} className="p-1 hover:bg-stone-100 rounded-full">
                <X className="w-4 h-4 text-[#8C857A]" />
              </button>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Sua apresentação <strong className="text-stone-800">"{activePresentation?.title}"</strong> foi exportada perfeitamente. O arquivo foi estruturado em abas dinâmicas detalhadas para facilitar suas análises de indicadores e melhorias.
            </p>
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 text-xs flex flex-col gap-1.5 text-stone-700">
              <span className="font-bold text-emerald-800">Abas Criadas:</span>
              <ul className="list-disc list-inside space-y-0.5 text-stone-600 text-[11px]">
                <li><strong>Visão Geral:</strong> Resumo executivo e lista de slides.</li>
                <li><strong>Métricas e KPIs:</strong> Consolidação de dados e sinalizações.</li>
                <li><strong>Plano de Ação:</strong> Iniciativas e monitoramento de status.</li>
                <li><strong>Comparativos:</strong> Histórico de SMED/Melhorias antes vs depois.</li>
              </ul>
            </div>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setExportedSheetUrl(null)}
                className="px-4 py-2 border hover:bg-stone-50 text-stone-600 font-semibold rounded-lg text-xs"
              >
                Fechar
              </button>
              <a
                href={exportedSheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs"
              >
                <span>Abrir Google Planilhas</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 4. Error Modal */}
      {sheetsError && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-red-100 shadow-xl text-stone-800 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-1.5 text-red-700 font-bold text-sm">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                <span>Ocorreu um Erro</span>
              </div>
              <button onClick={() => setSheetsError(null)} className="p-1 hover:bg-stone-100 rounded-full">
                <X className="w-4 h-4 text-[#8C857A]" />
              </button>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Não foi possível concluir o processo com o Google Planilhas:
            </p>
            <div className="bg-red-50 text-red-900 border border-red-100 text-[11px] p-3 rounded-xl font-mono break-words leading-relaxed">
              {sheetsError}
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSheetsError(null)}
                className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-lg text-xs"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
