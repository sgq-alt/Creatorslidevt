import React, { useState } from 'react';
import { Slide, SlideType, Metric, ImprovementStep, ComparisonItem } from '../types';
import { THEMES } from '../utils/theme';
import { Sparkles, Edit, Save, Plus, Trash, ArrowUpRight, ArrowDownRight, RefreshCw, CheckCircle2, Circle, AlertCircle, Image as ImageIcon, Check, UploadCloud } from 'lucide-react';
import { getMockedTopics, getMockedRefinement, getMockedImageQuery } from '../utils/mockAI';

// Client-side canvas image compressor to keep database sizes healthy (<2MB base64 JPEGs)
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const MAX_WIDTH = 1000;
        const MAX_HEIGHT = 1000;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          if (width > height) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          } else {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(dataUrl);
      };
      img.onerror = () => {
        reject(new Error('Formato de imagem inválido.'));
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Falha ao ler arquivo.'));
    reader.readAsDataURL(file);
  });
};


interface SlideWorkspaceProps {
  slide: Slide;
  themeId: 'beige' | 'blue' | 'green' | 'charcoal' | 'terracotta';
  presentationTitle: string;
  onUpdateSlide: (updatedSlide: Slide) => void;
  isOffline: boolean;
}

export default function SlideWorkspace({
  slide,
  themeId,
  presentationTitle,
  onUpdateSlide,
  isOffline,
}: SlideWorkspaceProps) {
  const theme = THEMES[themeId] || THEMES.beige;

  // Local state for loaders
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [loadingRefine, setLoadingRefine] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  
  // Local state for simple inputs
  const [newBullet, setNewBullet] = useState('');
  const [imageSearchKeywords, setImageSearchKeywords] = useState('');
  const [imageTab, setImageTab] = useState<'upload' | 'search'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setUploadError(null);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (!file.type.startsWith('image/')) {
        setUploadError('Por favor, selecione apenas arquivos de imagem (PNG, JPG, WebP).');
        return;
      }
      try {
        const base64Data = await compressImage(file);
        handleChange('imageUrl', base64Data);
        handleChange('imageCaption', `Imagem do computador: ${file.name}`);
      } catch (err: any) {
        setUploadError('Erro ao processar imagem: ' + err.message);
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      try {
        const base64Data = await compressImage(file);
        handleChange('imageUrl', base64Data);
        handleChange('imageCaption', `Imagem do computador: ${file.name}`);
      } catch (err: any) {
        setUploadError('Erro ao processar imagem: ' + err.message);
      }
    }
  };

  // Handle simple text changes
  const handleChange = (field: keyof Slide, value: any) => {
    onUpdateSlide({ ...slide, [field]: value });
  };

  // Metric updates
  const handleMetricChange = (metricId: string, updates: Partial<Metric>) => {
    const updatedMetrics = (slide.metrics || []).map((m) =>
      m.id === metricId ? { ...m, ...updates } : m
    );
    handleChange('metrics', updatedMetrics);
  };

  const addMetric = () => {
    const newMetric: Metric = {
      id: `met_${Date.now()}`,
      label: 'Novo Indicador',
      value: '0.0%',
      change: 'vs Mês Anterior',
      trend: 'stable',
    };
    handleChange('metrics', [...(slide.metrics || []), newMetric]);
  };

  const removeMetric = (id: string) => {
    handleChange('metrics', (slide.metrics || []).filter((m) => m.id !== id));
  };

  // Step updates (Improvements slide)
  const handleStepChange = (stepId: string, updates: Partial<ImprovementStep>) => {
    const updatedSteps = (slide.steps || []).map((s) =>
      s.id === stepId ? { ...s, ...updates } : s
    );
    handleChange('steps', updatedSteps);
  };

  const addStep = () => {
    const newStep: ImprovementStep = {
      id: `step_${Date.now()}`,
      title: 'Nova Iniciativa',
      description: 'Descrição sucinta do plano de ação ou melhoria.',
      status: 'pending',
    };
    handleChange('steps', [...(slide.steps || []), newStep]);
  };

  const removeStep = (id: string) => {
    handleChange('steps', (slide.steps || []).filter((s) => s.id !== id));
  };

  // Comparison updates
  const handleComparisonChange = (compId: string, updates: Partial<ComparisonItem>) => {
    const updatedComps = (slide.comparisons || []).map((c) =>
      c.id === compId ? { ...c, ...updates } : c
    );
    handleChange('comparisons', updatedComps);
  };

  const addComparison = () => {
    const newComp: ComparisonItem = {
      id: `comp_${Date.now()}`,
      before: 'Cenário anterior (ex: gargalo de tempo, alto refugo, desperdício)',
      after: 'Cenário pós-melhoria (ex: processo automatizado, redução de custo)',
    };
    handleChange('comparisons', [...(slide.comparisons || []), newComp]);
  };

  const removeComparison = (id: string) => {
    handleChange('comparisons', (slide.comparisons || []).filter((c) => c.id !== id));
  };

  // Bullet point list updates
  const addBullet = () => {
    if (!newBullet.trim()) return;
    handleChange('bulletPoints', [...(slide.bulletPoints || []), newBullet.trim()]);
    setNewBullet('');
  };

  const removeBullet = (index: number) => {
    const filtered = (slide.bulletPoints || []).filter((_, idx) => idx !== index);
    handleChange('bulletPoints', filtered);
  };

  // AI ACTIONS

  // 1. Generate Slide Topics / Bullet Points
  const handleAIGenerateTopics = async () => {
    setLoadingTopics(true);
    try {
      const response = await fetch('/api/gemini/generate-topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: presentationTitle,
          slideType: slide.type,
          context: `${slide.title} - ${slide.subtitle || ''} - ${slide.content || ''}`,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.topics && data.topics.length > 0) {
          handleChange('bulletPoints', data.topics);
          setLoadingTopics(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Backend indisponível para geração de tópicos. Usando fallback local.', err);
    }

    // Fallback local
    const mocked = getMockedTopics(slide.type, presentationTitle, `${slide.title} ${slide.content}`);
    handleChange('bulletPoints', mocked);
    setLoadingTopics(false);
  };

  // 2. Refine text using IA
  const handleAIRefineText = async () => {
    if (!slide.content) return;
    setLoadingRefine(true);
    try {
      const response = await fetch('/api/gemini/suggest-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slideTitle: slide.title,
          currentText: slide.content,
          type: slide.type,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.suggestedText) {
          handleChange('content', data.suggestedText);
          setLoadingRefine(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Backend indisponível para refinar texto. Usando fallback local.', err);
    }

    // Fallback local
    const mockedText = getMockedRefinement(slide.type, slide.title || '', slide.content);
    handleChange('content', mockedText);
    setLoadingRefine(false);
  };

  // 3. AI Image Suggestion / Auto Fetch
  const handleAISuggestImage = async () => {
    setLoadingImage(true);
    let query = 'business productivity';
    let description = 'Foto executiva conceitual';
    let dynamicUrl = `https://images.unsplash.com/photo-1542744173-8e0ee268cfec?w=800&auto=format&fit=crop&q=80`;

    try {
      const response = await fetch('/api/gemini/suggest-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slideTitle: slide.title,
          slideContent: `${slide.subtitle || ''} ${slide.content || ''}`,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        query = data.searchTerm || 'business productivity';
        description = data.description || 'Foto conceitual';
        
        dynamicUrl = `https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80`; // analytical default
        if (query.includes('energy') || query.includes('solar')) {
          dynamicUrl = `https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800&auto=format&fit=crop&q=80`;
        } else if (query.includes('logistics') || query.includes('warehouse')) {
          dynamicUrl = `https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80`;
        } else if (query.includes('team') || query.includes('collaboration')) {
          dynamicUrl = `https://images.unsplash.com/photo-1531538606174-0f90ff5dce83?w=800&auto=format&fit=crop&q=80`;
        } else if (query.includes('factory') || query.includes('automation') || query.includes('smed')) {
          dynamicUrl = `https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80`;
        } else if (query.includes('growth') || query.includes('chart') || query.includes('metrics')) {
          dynamicUrl = `https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80`;
        }
        
        handleChange('imageUrl', dynamicUrl);
        handleChange('imageCaption', `IA recomendou: "${description}" (Busca: ${query})`);
        setLoadingImage(false);
        return;
      }
    } catch (err) {
      console.warn('Backend indisponível para sugestão de imagem. Usando fallback local.', err);
    }

    // Fallback local
    const localRec = getMockedImageQuery(slide.title || '');
    handleChange('imageUrl', localRec.imageUrl);
    handleChange('imageCaption', `IA recomendou: "${localRec.description}" (Busca: ${localRec.searchTerm})`);
    setLoadingImage(false);
  };

  const selectCustomImageUrl = (keyword: string) => {
    if (!keyword) return;
    const cleanKw = keyword.toLowerCase();
    let url = `https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800`;
    if (cleanKw.includes('solar') || cleanKw.includes('energia')) {
      url = `https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800`;
    } else if (cleanKw.includes('grafico') || cleanKw.includes('metrica')) {
      url = `https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800`;
    } else if (cleanKw.includes('fabrica') || cleanKw.includes('maquina')) {
      url = `https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800`;
    } else if (cleanKw.includes('logistica') || cleanKw.includes('caixa')) {
      url = `https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800`;
    }
    handleChange('imageUrl', url);
    handleChange('imageCaption', `Imagem atualizada para tema: "${keyword}"`);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F4F1EA] p-6 flex flex-col items-center justify-start">
      {/* 1. SLIDE CANVAS / PREVIEW SCREEN */}
      <div 
        id={`slide-canvas-${slide.id}`}
        className={`w-full max-w-4xl aspect-[16/10] ${theme.background} border ${theme.border} rounded-2xl shadow-lg p-10 flex flex-col justify-between overflow-hidden relative transition-all duration-300 print:shadow-none print:border-none print:rounded-none`}
      >
        {/* Decorative subtle visual header indicating layout & slide metadata */}
        <div className="flex justify-between items-start text-[10px] uppercase tracking-widest font-mono text-[#8C857A] border-b border-[#E8E2D6] pb-2.5 print-hidden">
          <span>{presentationTitle}</span>
          <span>Slide {slide.type}</span>
        </div>

        {/* Dynamic content rendering based on Slide Type */}
        <div className="my-auto space-y-6">
          
          {/* Main Titles */}
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold font-display tracking-tight leading-tight">
              {slide.title || 'Clique para definir o título'}
            </h1>
            {slide.subtitle && (
              <p className="text-sm md:text-base font-medium opacity-80 italic">
                {slide.subtitle}
              </p>
            )}
          </div>

          {/* Core Body Container - Splitting into columns if image is present */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className={`${slide.imageUrl ? 'md:col-span-7' : 'md:col-span-12'} space-y-5 text-sm leading-relaxed`}>
              
              {/* Slide text content */}
              {slide.content && (
                <p className="text-stone-700/90 font-sans text-sm md:text-base leading-relaxed">
                  {slide.content}
                </p>
              )}

              {/* Slide Bullet points / Topics */}
              {slide.bulletPoints && slide.bulletPoints.length > 0 && (
                <ul className="space-y-2.5 list-disc pl-5">
                  {slide.bulletPoints.map((bp, i) => (
                    <li key={i} className="text-stone-800 font-medium">
                      {bp}
                    </li>
                  ))}
                </ul>
              )}

              {/* Slide metrics (RESULTS OR INDICATORS layouts) */}
              {slide.metrics && slide.metrics.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3">
                  {slide.metrics.map((m) => (
                    <div 
                      key={m.id} 
                      className={`p-4 rounded-xl border ${theme.secondary} ${theme.border} flex flex-col justify-between shadow-xs relative group/metric`}
                    >
                      <button 
                        onClick={() => removeMetric(m.id)}
                        className="absolute top-1.5 right-1.5 p-1 text-stone-400 hover:text-red-600 rounded opacity-0 group-hover/metric:opacity-100 transition-opacity no-print"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">{m.label}</span>
                      <span className="text-2xl font-bold font-display my-1">{m.value}</span>
                      <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${
                        m.trend === 'up' ? 'text-emerald-700' : m.trend === 'down' ? 'text-red-700' : 'text-stone-500'
                      }`}>
                        {m.trend === 'up' ? <ArrowUpRight className="w-3.5 h-3.5" /> : m.trend === 'down' ? <ArrowDownRight className="w-3.5 h-3.5" /> : null}
                        {m.change}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Slide steps (IMPROVEMENTS layout) */}
              {slide.steps && slide.steps.length > 0 && (
                <div className="space-y-3 pt-2">
                  {slide.steps.map((s) => (
                    <div 
                      key={s.id} 
                      className={`p-3.5 rounded-xl border ${theme.secondary} ${theme.border} flex items-start gap-3.5 relative group/step shadow-xs`}
                    >
                      <button 
                        onClick={() => removeStep(s.id)}
                        className="absolute top-1.5 right-1.5 p-1 text-stone-400 hover:text-red-600 rounded opacity-0 group-hover/step:opacity-100 transition-opacity no-print"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                      
                      {/* Checkbox Status handler */}
                      <button 
                        onClick={() => {
                          const nextStatus = s.status === 'completed' ? 'pending' : s.status === 'pending' ? 'in_progress' : 'completed';
                          handleStepChange(s.id, { status: nextStatus });
                        }}
                        className="mt-0.5 shrink-0 hover:scale-110 transition-transform no-print"
                      >
                        {s.status === 'completed' ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : s.status === 'in_progress' ? (
                          <RefreshCw className="w-5 h-5 text-amber-500 animate-spin-slow" />
                        ) : (
                          <Circle className="w-5 h-5 text-stone-400" />
                        )}
                      </button>

                      {/* Printable static checked icon */}
                      <div className="hidden print:block mt-1">
                        <div className={`w-3.5 h-3.5 rounded-full ${s.status === 'completed' ? 'bg-emerald-600' : 'border border-stone-400'}`} />
                      </div>

                      <div className="flex-1">
                        <h4 className="font-semibold text-stone-900 text-xs md:text-sm">{s.title}</h4>
                        <p className="text-stone-600 text-[11px] md:text-xs mt-0.5">{s.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Slide comparison blocks (COMPARISON layout) */}
              {slide.comparisons && slide.comparisons.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {slide.comparisons.map((c) => (
                    <div 
                      key={c.id} 
                      className={`p-4 rounded-xl border ${theme.border} bg-white shadow-xs relative group/comp`}
                    >
                      <button 
                        onClick={() => removeComparison(c.id)}
                        className="absolute top-1.5 right-1.5 p-1 text-stone-400 hover:text-red-600 rounded opacity-0 group-hover/comp:opacity-100 transition-opacity no-print"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                      
                      <div className="space-y-3 text-xs">
                        <div className="bg-red-50 text-red-900 border border-red-100 p-2.5 rounded-lg">
                          <span className="font-mono text-[9px] uppercase tracking-wider font-bold block text-red-500 mb-1">Cenário Anterior (Gargalo)</span>
                          <p className="font-medium">{c.before}</p>
                        </div>
                        <div className="bg-emerald-50 text-emerald-900 border border-emerald-100 p-2.5 rounded-lg">
                          <span className="font-mono text-[9px] uppercase tracking-wider font-bold block text-emerald-600 mb-1">Cenário Atual (Melhoria)</span>
                          <p className="font-medium">{c.after}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>

            {/* Slide Image Illustration column */}
            {slide.imageUrl && (
              <div className="md:col-span-5 flex flex-col items-center">
                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden border border-stone-200 shadow-xs bg-stone-100 relative group/img">
                  <img
                    src={slide.imageUrl}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <button
                    onClick={() => handleChange('imageUrl', '')}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black text-white rounded-lg opacity-0 group-hover/img:opacity-100 transition-opacity no-print"
                    title="Excluir Imagem"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
                {slide.imageCaption && (
                  <span className="text-[10px] text-stone-500 mt-2 text-center max-w-full truncate block leading-tight italic">
                    {slide.imageCaption}
                  </span>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Decorative subtle visual footer with logo and page numbering */}
        <div className="flex justify-between items-center text-[9px] font-mono text-stone-400 border-t pt-3.5">
          <div className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#d4af37]" />
            <span className="font-semibold">SlideAI platform</span>
          </div>
          <span>Apresentação de Resultados</span>
        </div>
      </div>

      {/* 2. DYNAMIC SLIDE CONTENT EDITOR PANEL */}
      <div className="w-full max-w-4xl bg-white border border-[#e5e5e5] rounded-xl p-6 mt-6 shadow-xs space-y-6 no-print text-xs">
        <div className="flex items-center justify-between border-b pb-3 border-stone-100">
          <div className="flex items-center gap-2">
            <Edit className="w-4 h-4 text-stone-500" />
            <h2 className="text-sm font-bold text-stone-800">Painel de Edição do Slide</h2>
          </div>
          <span className="text-[10px] bg-[#f4f4f4] px-2.5 py-1 rounded-full font-mono text-stone-600">
            Formato: {slide.type.toUpperCase()}
          </span>
        </div>

        {/* AI Smart Assistant Panel */}
        <div className="bg-[#fcfbf9] border border-[#f0ece3] rounded-xl p-4 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-stone-800 font-bold text-xs">
              <Sparkles className="w-4 h-4 text-[#d4af37] animate-pulse" />
              <span>Assistente de IA Integrado (Gemini)</span>
            </div>
            {isOffline && (
              <span className="text-[10px] text-amber-700 font-medium">Instável: Operação Offline</span>
            )}
          </div>
          <p className="text-stone-500 text-[11px] leading-relaxed">
            Utilize inteligência artificial para otimizar os textos de suas reuniões operacionais, gerar tópicos automaticamente para cada modelo ou encontrar ilustrações dinâmicas de apoio técnico.
          </p>

          <div className="flex flex-wrap gap-2.5 pt-1">
            <button
              onClick={handleAIGenerateTopics}
              disabled={loadingTopics}
              className="px-3.5 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors font-medium flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingTopics ? 'animate-spin' : ''}`} />
              <span>Gerar Tópicos IA</span>
            </button>

            <button
              onClick={handleAIRefineText}
              disabled={loadingRefine || !slide.content}
              className="px-3.5 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors font-medium flex items-center gap-1.5 disabled:opacity-50"
              title="Aprimorar parágrafo principal para português formal executivo"
            >
              <Sparkles className={`w-3.5 h-3.5 text-yellow-400 ${loadingRefine ? 'animate-pulse' : ''}`} />
              <span>Melhorar Texto com IA</span>
            </button>

            <button
              onClick={handleAISuggestImage}
              disabled={loadingImage}
              className="px-3.5 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors font-medium flex items-center gap-1.5 disabled:opacity-50"
            >
              <ImageIcon className={`w-3.5 h-3.5 ${loadingImage ? 'animate-pulse' : ''}`} />
              <span>Ilustração Inteligente IA</span>
            </button>
          </div>
        </div>

        {/* Input Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-stone-600 font-semibold mb-1">Título do Slide</label>
            <input
              type="text"
              value={slide.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none"
              placeholder="Digite o título do slide"
            />
          </div>

          <div>
            <label className="block text-stone-600 font-semibold mb-1">Subtítulo (Opcional)</label>
            <input
              type="text"
              value={slide.subtitle || ''}
              onChange={(e) => handleChange('subtitle', e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none"
              placeholder="Digite o subtítulo informativo"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-stone-600 font-semibold mb-1">Parágrafo / Descrição Principal</label>
            <textarea
              value={slide.content}
              onChange={(e) => handleChange('content', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none font-sans"
              placeholder="Destaque aqui a conclusão executiva do slide..."
            />
          </div>
        </div>

        {/* Dynamic Lists Section based on slide layout type */}
        
        {/* Metric block editing */}
        {(slide.type === 'results' || slide.type === 'indicators') && (
          <div className="space-y-3 pt-3 border-t border-stone-100">
            <div className="flex justify-between items-center">
              <span className="font-bold text-stone-800 text-xs">Blocos de Indicadores / Métricas</span>
              <button
                onClick={addMetric}
                className="px-3 py-1.5 bg-[#eaeaea] hover:bg-stone-200 text-stone-700 rounded-lg font-medium flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Indicador
              </button>
            </div>
            
            {slide.metrics && slide.metrics.length > 0 ? (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {slide.metrics.map((m, idx) => (
                  <div key={m.id} className="grid grid-cols-1 sm:grid-cols-4 gap-2 p-3 bg-stone-50 rounded-lg border border-stone-200">
                    <div>
                      <span className="text-[10px] text-stone-500 font-semibold block mb-1">Nome KPI</span>
                      <input
                        type="text"
                        value={m.label}
                        onChange={(e) => handleMetricChange(m.id, { label: e.target.value })}
                        className="w-full px-2 py-1.5 border border-stone-300 rounded bg-white"
                        placeholder="Ex: EBITDA"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-500 font-semibold block mb-1">Valor Atual</span>
                      <input
                        type="text"
                        value={m.value}
                        onChange={(e) => handleMetricChange(m.id, { value: e.target.value })}
                        className="w-full px-2 py-1.5 border border-stone-300 rounded bg-white"
                        placeholder="Ex: R$ 450k"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-500 font-semibold block mb-1">Comparativo</span>
                      <input
                        type="text"
                        value={m.change}
                        onChange={(e) => handleMetricChange(m.id, { change: e.target.value })}
                        className="w-full px-2 py-1.5 border border-stone-300 rounded bg-white"
                        placeholder="Ex: +12% vs Q1"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-500 font-semibold block mb-1">Sinal Operacional</span>
                      <div className="flex gap-1">
                        <select
                          value={m.trend}
                          onChange={(e) => handleMetricChange(m.id, { trend: e.target.value as 'up' | 'down' | 'stable' })}
                          className="flex-1 px-2 py-1.5 border border-stone-300 rounded bg-white focus:outline-none"
                        >
                          <option value="up">Crescimento (Verde)</option>
                          <option value="down">Declínio (Vermelho)</option>
                          <option value="stable">Estável (Cinza)</option>
                        </select>
                        <button
                          onClick={() => removeMetric(m.id)}
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Excluir indicador"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-stone-400 italic text-[11px]">Nenhuma métrica cadastrada para este slide. Clique no botão acima para adicionar.</p>
            )}
          </div>
        )}

        {/* Improvement steps editing */}
        {slide.type === 'improvements' && (
          <div className="space-y-3 pt-3 border-t border-stone-100">
            <div className="flex justify-between items-center">
              <span className="font-bold text-stone-800 text-xs">Ações / Iniciativas Operacionais</span>
              <button
                onClick={addStep}
                className="px-3 py-1.5 bg-[#eaeaea] hover:bg-stone-200 text-stone-700 rounded-lg font-medium flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Ação
              </button>
            </div>

            {slide.steps && slide.steps.length > 0 ? (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {slide.steps.map((s) => (
                  <div key={s.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-3 bg-stone-50 rounded-lg border border-stone-200 items-end">
                    <div className="sm:col-span-4">
                      <span className="text-[10px] text-stone-500 font-semibold block mb-1">Iniciativa / Projeto</span>
                      <input
                        type="text"
                        value={s.title}
                        onChange={(e) => handleStepChange(s.id, { title: e.target.value })}
                        className="w-full px-2 py-1.5 border border-stone-300 rounded bg-white"
                        placeholder="Ex: Compra de Sensores"
                      />
                    </div>
                    <div className="sm:col-span-5">
                      <span className="text-[10px] text-stone-500 font-semibold block mb-1">Descrição detalhada</span>
                      <input
                        type="text"
                        value={s.description}
                        onChange={(e) => handleStepChange(s.id, { description: e.target.value })}
                        className="w-full px-2 py-1.5 border border-stone-300 rounded bg-white"
                        placeholder="Ex: Instalação rápida nas injetoras principais"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-[10px] text-stone-500 font-semibold block mb-1">Status</span>
                      <select
                        value={s.status}
                        onChange={(e) => handleStepChange(s.id, { status: e.target.value as any })}
                        className="w-full px-2 py-1.5 border border-stone-300 rounded bg-white focus:outline-none"
                      >
                        <option value="pending">Pendente</option>
                        <option value="in_progress">Em Andamento</option>
                        <option value="completed">Concluído</option>
                      </select>
                    </div>
                    <div className="sm:col-span-1 flex justify-end">
                      <button
                        onClick={() => removeStep(s.id)}
                        className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Remover iniciativa"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-stone-400 italic text-[11px]">Nenhuma iniciativa cadastrada. Adicione para alimentar o fluxo de melhorias.</p>
            )}
          </div>
        )}

        {/* Comparison editing */}
        {slide.type === 'comparison' && (
          <div className="space-y-3 pt-3 border-t border-stone-100">
            <div className="flex justify-between items-center">
              <span className="font-bold text-stone-800 text-xs">Comparativos Antes vs. Depois</span>
              <button
                onClick={addComparison}
                className="px-3 py-1.5 bg-[#eaeaea] hover:bg-stone-200 text-stone-700 rounded-lg font-medium flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Novo Comparativo
              </button>
            </div>

            {slide.comparisons && slide.comparisons.length > 0 ? (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {slide.comparisons.map((c) => (
                  <div key={c.id} className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-stone-50 rounded-lg border border-stone-200 relative group/edit-comp">
                    <button
                      onClick={() => removeComparison(c.id)}
                      className="absolute top-2 right-2 p-1 text-stone-400 hover:text-red-600 rounded"
                      title="Excluir par"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                    <div>
                      <span className="text-[10px] text-red-700 font-bold block mb-1">Cenário com Gargalo (Antes)</span>
                      <textarea
                        value={c.before}
                        onChange={(e) => handleComparisonChange(c.id, { before: e.target.value })}
                        rows={2}
                        className="w-full px-2 py-1.5 border border-stone-300 rounded bg-white text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-700 font-bold block mb-1">Cenário pós-Melhoria (Depois)</span>
                      <textarea
                        value={c.after}
                        onChange={(e) => handleComparisonChange(c.id, { after: e.target.value })}
                        rows={2}
                        className="w-full px-2 py-1.5 border border-[#cad6ce] rounded bg-white text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-stone-400 italic text-[11px]">Nenhuma comparação cadastrada para este slide. Adicione para ilustrar a melhoria.</p>
            )}
          </div>
        )}

        {/* Bullet Points / Bullet points editing */}
        <div className="space-y-3 pt-3 border-t border-stone-100">
          <label className="block text-stone-600 font-semibold mb-1">Marcadores / Bullet Points (Tópicos do Slide)</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newBullet}
              onChange={(e) => setNewBullet(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addBullet()}
              className="flex-1 px-3 py-2 border border-stone-300 rounded-lg focus:outline-none"
              placeholder="Adicionar novo tópico ou detalhe do slide..."
            />
            <button
              onClick={addBullet}
              className="px-4 py-2 bg-[#1e1e1e] text-white rounded-lg hover:bg-stone-800 transition-colors"
            >
              Adicionar
            </button>
          </div>

          {slide.bulletPoints && slide.bulletPoints.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1.5">
              {slide.bulletPoints.map((bp, index) => (
                <div
                  key={index}
                  className="px-3 py-1 bg-[#f4f4f4] border border-stone-200 rounded-full flex items-center gap-1.5 text-stone-700 hover:border-red-200 hover:bg-red-50 transition-colors"
                >
                  <span className="font-medium">{bp}</span>
                  <button
                    onClick={() => removeBullet(index)}
                    className="p-0.5 text-stone-400 hover:text-red-600"
                    title="Excluir tópico"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-stone-400 italic text-[11px]">Sem marcadores ou tópicos adicionais. Escreva um acima ou use a IA.</p>
          )}
        </div>

        {/* Custom Image Section (Local Upload or IA Search) */}
        <div className="space-y-4 pt-4 border-t border-stone-100">
          <div className="flex items-center justify-between">
            <label className="block text-stone-600 font-semibold text-xs uppercase tracking-wider">Imagem ou Ilustração do Slide</label>
            <div className="flex bg-[#F4F1EA] rounded-lg p-0.5 border border-[#E8E2D6]">
              <button
                type="button"
                onClick={() => setImageTab('upload')}
                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${
                  imageTab === 'upload'
                    ? 'bg-white text-[#4B6B4C] shadow-xs'
                    : 'text-[#8C857A] hover:text-[#5C574F]'
                }`}
              >
                Upload do Computador
              </button>
              <button
                type="button"
                onClick={() => setImageTab('search')}
                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${
                  imageTab === 'search'
                    ? 'bg-white text-[#4B6B4C] shadow-xs'
                    : 'text-[#8C857A] hover:text-[#5C574F]'
                }`}
              >
                Buscar Ilustração IA
              </button>
            </div>
          </div>

          {imageTab === 'upload' ? (
            <div className="space-y-3">
              {/* Drag and Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('local-slide-image-file')?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[140px] ${
                  isDragging
                    ? 'border-[#4B6B4C] bg-[#CAD6CE]/20'
                    : 'border-[#E8E2D6] bg-[#FDFBF7] hover:border-[#8C857A] hover:bg-[#F4F1EA]'
                }`}
              >
                <input
                  type="file"
                  id="local-slide-image-file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <UploadCloud className={`w-8 h-8 mb-2 transition-colors ${isDragging ? 'text-[#4B6B4C]' : 'text-[#8C857A]'}`} />
                <span className="font-bold text-[#333333] text-xs">
                  Arraste sua imagem aqui ou clique para selecionar
                </span>
                <span className="text-[10px] text-[#8C857A] mt-1">
                  Formatos suportados: PNG, JPG, WebP. Compressão inteligente ativa.
                </span>
              </div>

              {uploadError && (
                <div className="flex items-center gap-1.5 text-red-600 font-semibold text-[10px] bg-red-50 p-2 rounded-md border border-red-100">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={imageSearchKeywords}
                  onChange={(e) => setImageSearchKeywords(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && selectCustomImageUrl(imageSearchKeywords)}
                  className="flex-1 px-3 py-2 border border-stone-300 rounded-lg focus:outline-none"
                  placeholder="Digite o tema (ex: grafico, fabrica, solar, logistica)"
                />
                <button
                  onClick={() => selectCustomImageUrl(imageSearchKeywords)}
                  className="px-4 py-2 bg-[#4B6B4C] hover:bg-[#3D573E] text-white font-bold rounded-lg transition-colors shadow-xs shrink-0"
                >
                  Buscar
                </button>
              </div>
            </div>
          )}

          {slide.imageUrl && (
            <div className="bg-[#F4F7F5] border border-[#CAD6CE] rounded-lg p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-10 h-10 rounded overflow-hidden border border-[#E8E2D6] shrink-0">
                  <img
                    src={slide.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-[#4B6B4C] font-bold block leading-none mb-1">Imagem Ativa</span>
                  <span className="text-[10px] text-[#8C857A] block truncate italic">
                    {slide.imageCaption || slide.imageUrl}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  handleChange('imageUrl', '');
                  handleChange('imageCaption', '');
                }}
                className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded"
                title="Remover Imagem"
              >
                <Trash className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
