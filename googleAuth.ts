import { Slide, SlideType } from '../types';
import { THEMES } from '../utils/theme';
import { Plus, Trash2, ArrowUp, ArrowDown, Layout, Palette } from 'lucide-react';

interface SlidesListProps {
  slides: Slide[];
  activeSlideId: string;
  themeId: 'beige' | 'blue' | 'green';
  onSelectSlide: (id: string) => void;
  onAddSlide: (type: SlideType) => void;
  onDeleteSlide: (id: string) => void;
  onMoveSlide: (id: string, direction: 'up' | 'down') => void;
  onChangeTheme: (themeId: 'beige' | 'blue' | 'green') => void;
}

export default function SlidesList({
  slides,
  activeSlideId,
  themeId,
  onSelectSlide,
  onAddSlide,
  onDeleteSlide,
  onMoveSlide,
  onChangeTheme,
}: SlidesListProps) {
  const activeTheme = THEMES[themeId] || THEMES.beige;

  // Render a tiny miniature representation of the slide layout
  const renderLayoutMiniature = (type: SlideType) => {
    switch (type) {
      case 'title':
        return (
          <div className="w-full h-10 border border-stone-200 bg-white rounded flex flex-col justify-center items-center gap-0.5 p-1">
            <div className="w-2/3 h-1 bg-stone-700 rounded-xs" />
            <div className="w-1/2 h-0.5 bg-stone-400 rounded-xs" />
          </div>
        );
      case 'results':
        return (
          <div className="w-full h-10 border border-stone-200 bg-white rounded p-1 flex flex-col justify-between">
            <div className="w-1/3 h-1 bg-stone-700 rounded-xs" />
            <div className="grid grid-cols-3 gap-1">
              <div className="h-4 bg-amber-50 border border-amber-200 rounded-xs" />
              <div className="h-4 bg-blue-50 border border-blue-200 rounded-xs" />
              <div className="h-4 bg-emerald-50 border border-emerald-200 rounded-xs" />
            </div>
          </div>
        );
      case 'indicators':
        return (
          <div className="w-full h-10 border border-stone-200 bg-white rounded p-1 flex flex-col justify-between">
            <div className="w-1/2 h-1 bg-stone-700 rounded-xs" />
            <div className="grid grid-cols-2 gap-1">
              <div className="h-4 bg-stone-50 border border-stone-200 rounded-xs" />
              <div className="h-4 bg-stone-50 border border-stone-200 rounded-xs" />
            </div>
          </div>
        );
      case 'improvements':
        return (
          <div className="w-full h-10 border border-stone-200 bg-white rounded p-1 flex flex-col gap-1">
            <div className="w-1/2 h-1 bg-stone-700 rounded-xs" />
            <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /><div className="w-3/4 h-0.5 bg-stone-300" /></div>
            <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-amber-500" /><div className="w-1/2 h-0.5 bg-stone-300" /></div>
          </div>
        );
      case 'comparison':
        return (
          <div className="w-full h-10 border border-stone-200 bg-white rounded p-1 flex flex-col justify-between">
            <div className="w-1/3 h-1 bg-stone-700 rounded-xs" />
            <div className="grid grid-cols-2 gap-1">
              <div className="h-4 bg-red-50 border border-red-100 rounded-xs" />
              <div className="h-4 bg-emerald-50 border border-emerald-100 rounded-xs" />
            </div>
          </div>
        );
      case 'closing':
        return (
          <div className="w-full h-10 border border-stone-200 bg-white rounded p-1 flex flex-col justify-center items-center gap-1">
            <div className="w-3/4 h-1 bg-stone-700 rounded-xs" />
            <div className="w-1/2 h-0.5 bg-stone-300" />
            <div className="w-1/3 h-0.5 bg-stone-300" />
          </div>
        );
    }
  };

  const getSlideTypeName = (type: SlideType) => {
    switch (type) {
      case 'title': return 'Título / Capa';
      case 'results': return 'Resultados';
      case 'indicators': return 'Indicadores';
      case 'improvements': return 'Melhorias';
      case 'comparison': return 'Antes & Depois';
      case 'closing': return 'Encerramento';
    }
  };

  return (
    <div className="w-full md:w-64 border-r border-[#E8E2D6] bg-white flex flex-col h-full no-print text-xs">
      {/* Dynamic Theme Quick Selector */}
      <div className="p-4 border-b border-[#E8E2D6] bg-[#FDFBF7]">
        <div className="flex items-center gap-2 mb-3 text-[#2D5A82] font-bold text-xs">
          <Palette className="w-4 h-4 text-[#2D5A82]" />
          <span>Esquema Visual (IA)</span>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {(['beige', 'blue', 'green'] as const).map((tId) => (
            <button
              key={tId}
              onClick={() => onChangeTheme(tId)}
              className={`p-1.5 rounded-lg border text-center transition-all ${
                themeId === tId
                  ? 'border-[#4B6B4C] bg-[#FDFBF7] ring-1 ring-[#4B6B4C] font-bold'
                  : 'border-[#E8E2D6] bg-white hover:bg-[#F4F1EA]'
              }`}
            >
              <div className={`w-full h-2.5 rounded-xs mb-1 ${THEMES[tId].background} border ${THEMES[tId].border}`} />
              <span className="text-[9px] text-[#5C574F] font-semibold">
                {tId === 'beige' ? 'Bege' : tId === 'blue' ? 'Azul' : 'Verde'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Slide List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="flex items-center justify-between text-[#8C857A] font-bold text-[11px] mb-2">
          <span>ORDEM DOS SLIDES</span>
          <span>{slides.length} slides</span>
        </div>

        {slides.map((slide, index) => {
          const isActive = slide.id === activeSlideId;
          return (
            <div
              key={slide.id}
              className={`group relative p-2.5 rounded-lg border transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-white border-[#4B6B4C] shadow-sm ring-1 ring-[#4B6B4C]'
                  : 'bg-[#FDFBF7] border-[#E8E2D6] hover:border-[#8C857A] hover:bg-[#F4F1EA]'
              }`}
              onClick={() => onSelectSlide(slide.id)}
            >
              {/* Slide Thumbnail representation */}
              <div className="mb-1.5 opacity-80 group-hover:opacity-100">
                {renderLayoutMiniature(slide.type)}
              </div>

              {/* Title & Type */}
              <div className="flex justify-between items-start gap-1">
                <div>
                  <div className="font-bold text-[#333333] leading-tight truncate max-w-[140px]">
                    {slide.title || 'Slide sem título'}
                  </div>
                  <div className="text-[10px] text-[#8C857A] font-medium">
                    {index + 1}. {getSlideTypeName(slide.type)}
                  </div>
                </div>

                {/* Operations overlay */}
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                  <button
                    disabled={index === 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveSlide(slide.id, 'up');
                    }}
                    className="p-1 text-[#8C857A] hover:text-[#2D5A82] disabled:opacity-30 rounded hover:bg-[#E8E2D6]/40"
                    title="Mover para Cima"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    disabled={index === slides.length - 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveSlide(slide.id, 'down');
                    }}
                    className="p-1 text-[#8C857A] hover:text-[#2D5A82] disabled:opacity-30 rounded hover:bg-[#E8E2D6]/40"
                    title="Mover para Baixo"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                  {slides.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSlide(slide.id);
                      }}
                      className="p-1 text-[#8C857A] hover:text-red-600 rounded hover:bg-[#E8E2D6]/40"
                      title="Excluir Slide"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Slide Controls */}
      <div className="p-4 border-t border-[#E8E2D6] bg-[#FDFBF7]">
        <div className="flex items-center gap-1 text-[#4B6B4C] font-bold mb-2.5">
          <Layout className="w-4 h-4 text-[#4B6B4C]" />
          <span>Inserir Novo Slide (IA)</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {(['title', 'results', 'indicators', 'improvements', 'comparison', 'closing'] as SlideType[]).map((type) => (
            <button
              key={type}
              onClick={() => onAddSlide(type)}
              className="px-2 py-1.5 bg-white hover:bg-[#4B6B4C] hover:text-white rounded text-[10px] text-[#5C574F] font-semibold text-left truncate transition-colors flex items-center gap-1 border border-[#E8E2D6]"
              title={`Criar Slide de ${getSlideTypeName(type)}`}
            >
              <Plus className="w-3 h-3 text-[#8C857A] group-hover:text-white shrink-0" />
              <span>{getSlideTypeName(type).split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
