import React, { useState } from 'react';
import { Presentation } from '../types';
import { Plus, Trash2, Edit2, Check, CloudOff, CloudLightning, FileText, FolderPlus, Compass } from 'lucide-react';

interface PresentationSelectorProps {
  presentations: Presentation[];
  activeId: string;
  onSelect: (id: string) => void;
  onCreate: (title: string, themeId: 'beige' | 'blue' | 'green' | 'charcoal' | 'terracotta', category: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newTitle: string, newCategory: string) => void;
  isOffline: boolean;
  onSync: () => void;
  hasPendingSync: boolean;
}

export default function PresentationSelector({
  presentations,
  activeId,
  onSelect,
  onCreate,
  onDelete,
  onRename,
  isOffline,
  onSync,
  hasPendingSync,
}: PresentationSelectorProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTheme, setNewTheme] = useState<'beige' | 'blue' | 'green' | 'charcoal' | 'terracotta'>('beige');
  const [newCategory, setNewCategory] = useState('Geral');
  
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');

  const activePresentation = presentations.find((p) => p.id === activeId);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onCreate(newTitle, newTheme, newCategory);
    setNewTitle('');
    setShowCreateModal(false);
  };

  const startEditing = () => {
    if (!activePresentation) return;
    setEditTitle(activePresentation.title);
    setEditCategory(activePresentation.category || 'Geral');
    setIsEditing(true);
  };

  const saveRename = () => {
    if (!editTitle.trim()) return;
    onRename(activeId, editTitle, editCategory);
    setIsEditing(false);
  };

  return (
    <div className="bg-white border-b border-[#E8E2D6] px-6 py-3 no-print">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Top bar Left: Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <div className="flex items-center gap-1.5 mr-3 text-[#8C857A] text-sm font-semibold">
            <Compass className="w-4 h-4 text-[#8C857A]" />
            <span>Apresentações:</span>
          </div>

          {presentations.map((p) => {
            const isActive = p.id === activeId;
            return (
              <button
                key={p.id}
                onClick={() => onSelect(p.id)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#4B6B4C] text-white shadow-sm'
                    : 'bg-[#F4F1EA] text-[#5C574F] hover:bg-[#E8E2D6]'
                }`}
              >
                <FileText className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#8C857A]'}`} />
                <div className="text-left">
                  <div className="font-semibold leading-tight">{p.title}</div>
                  <span className="text-[10px] opacity-75 block">{p.category || 'Geral'}</span>
                </div>
              </button>
            );
          })}

          <button
            onClick={() => setShowCreateModal(true)}
            className="p-2 bg-[#E8E2D6] text-[#4B6B4C] hover:bg-[#CAD6CE] rounded-lg transition-colors flex items-center justify-center"
            title="Criar Nova Apresentação"
          >
            <Plus className="w-4 h-4 font-bold" />
          </button>
        </div>

        {/* Top bar Right: Status and active presentation actions */}
        <div className="flex items-center gap-3 self-end md:self-auto text-xs">
          {/* Connection Status indicator */}
          <div className="flex items-center gap-2">
            {isOffline ? (
              <div className="flex items-center gap-1.5 bg-amber-50 text-amber-800 px-3 py-1.5 rounded-full font-medium border border-amber-200 shadow-xs animate-pulse">
                <CloudOff className="w-3.5 h-3.5 text-amber-600" />
                <span>Modo Offline</span>
                {hasPendingSync && (
                  <button
                    onClick={onSync}
                    className="ml-1 px-2 py-0.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10px]"
                    title="Sincronizar alterações pendentes"
                  >
                    Sincronizar
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-[#F4F7F5] text-[#4B6B4C] px-3 py-1.5 rounded-full font-semibold border border-[#CAD6CE]">
                <CloudLightning className="w-3.5 h-3.5 text-[#4B6B4C]" />
                <span>Sincronizado Nuvem</span>
              </div>
            )}
          </div>

          {activePresentation && (
            <div className="flex items-center gap-1 bg-stone-50 border border-stone-200 rounded-lg p-1">
              {isEditing ? (
                <div className="flex items-center gap-1 px-1 py-0.5">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="px-2 py-1 border border-stone-300 rounded text-xs text-stone-800 bg-white focus:outline-hidden"
                    placeholder="Título da Apresentação"
                  />
                  <input
                    type="text"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="px-2 py-1 border border-stone-300 rounded text-[10px] text-stone-800 bg-white focus:outline-hidden w-20"
                    placeholder="Categoria"
                  />
                  <button
                    onClick={saveRename}
                    className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={startEditing}
                    className="p-1.5 hover:bg-stone-200 rounded text-stone-600 flex items-center gap-1"
                    title="Editar Título"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {presentations.length > 1 && (
                    <button
                      onClick={() => {
                        if (confirm(`Excluir a apresentação "${activePresentation.title}"?`)) {
                          onDelete(activePresentation.id);
                        }
                      }}
                      className="p-1.5 hover:bg-red-100 hover:text-red-700 rounded text-stone-500"
                      title="Excluir Apresentação"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-[#333333]/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#FDFBF7] rounded-xl shadow-xl max-w-md w-full p-6 border border-[#E8E2D6] animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-2 text-[#2D5A82] mb-4 border-b border-[#E8E2D6] pb-3">
              <FolderPlus className="w-5 h-5 text-[#4B6B4C]" />
              <h3 className="text-sm font-bold">Nova Apresentação</h3>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#5C574F] font-bold mb-1">Título</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Relatório de Indicadores Trimestrais"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E8E2D6] rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#4B6B4C]"
                />
              </div>

              <div>
                <label className="block text-[#5C574F] font-bold mb-1">Categoria / Tema de Negócio</label>
                <input
                  type="text"
                  placeholder="Ex: Resultados Operacionais, Sustentabilidade"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E8E2D6] rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#4B6B4C]"
                />
              </div>

              <div>
                <label className="block text-[#5C574F] font-bold mb-1.5">Esquema de Cores Minimalista</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewTheme('beige')}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      newTheme === 'beige' ? 'border-[#4B6B4C] bg-[#FDFBF7] ring-1 ring-[#4B6B4C]' : 'border-[#E8E2D6] bg-white'
                    }`}
                  >
                    <div className="w-full h-3 rounded bg-[#FDFBF7] border border-[#E8E2D6] mb-1" />
                    <span className="font-bold text-[#333333] block text-[10px]">Areia Minimalista</span>
                    <span className="text-[9px] text-[#8C857A]">Bege e Verde</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewTheme('blue')}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      newTheme === 'blue' ? 'border-[#2D5A82] bg-[#F0F4F8] ring-1 ring-[#2D5A82]' : 'border-[#E8E2D6] bg-white'
                    }`}
                  >
                    <div className="w-full h-3 rounded bg-[#F0F4F8] border border-[#C7D5E6] mb-1" />
                    <span className="font-bold text-[#1C2D42] block text-[10px]">Azul Prisma</span>
                    <span className="text-[9px] text-[#8C857A]">Tons de Azul</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewTheme('green')}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      newTheme === 'green' ? 'border-[#4B6B4C] bg-[#F4F7F5] ring-1 ring-[#4B6B4C]' : 'border-[#E8E2D6] bg-white'
                    }`}
                  >
                    <div className="w-full h-3 rounded bg-[#F4F7F5] border border-[#CAD6CE] mb-1" />
                    <span className="font-bold text-[#193224] block text-[10px]">Verde Floresta</span>
                    <span className="text-[9px] text-[#8C857A]">Verde e Sálvia</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewTheme('charcoal')}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      newTheme === 'charcoal' ? 'border-[#10B981] bg-[#1E1E1E] ring-1 ring-[#10B981]' : 'border-[#E8E2D6] bg-white'
                    }`}
                  >
                    <div className="w-full h-3 rounded bg-[#1E1E1E] border border-[#3E3E3E] mb-1" />
                    <span className="font-bold text-[#F3F4F6] block text-[10px]">Carvão Tecnológico</span>
                    <span className="text-[9px] text-[#8C857A]">Dark Industrial</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewTheme('terracotta')}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      newTheme === 'terracotta' ? 'border-[#D95D39] bg-[#FFF9F5] ring-1 ring-[#D95D39]' : 'border-[#E8E2D6] bg-white'
                    }`}
                  >
                    <div className="w-full h-3 rounded bg-[#FFF9F5] border border-[#F3D6C5] mb-1" />
                    <span className="font-bold text-[#4A2D1F] block text-[10px]">Terracota Quente</span>
                    <span className="text-[9px] text-[#8C857A]">Laranja e Argila</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#E8E2D6]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-[#E8E2D6] hover:bg-[#F4F1EA] text-[#8C857A] rounded-lg font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#4B6B4C] hover:bg-[#3D573E] text-white font-bold rounded-lg shadow-xs"
                >
                  Criar Apresentação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
