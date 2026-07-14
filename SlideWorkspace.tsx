import React, { useState, useEffect } from 'react';
import { Comment, Version, Collaborator, Slide } from '../types';
import { Users, MessageSquare, History, Play, Check, X, Send, Award, Clock, ArrowLeftRight } from 'lucide-react';

interface RightSidebarProps {
  comments: Comment[];
  versions: Version[];
  collaborators: Collaborator[];
  activeSlideId: string;
  onAddComment: (text: string, isSuggestion?: boolean, suggestionData?: any) => void;
  onResolveComment: (commentId: string, action: 'accept' | 'decline') => void;
  onRestoreVersion: (version: Version) => void;
  onApplyAIPrompt: (prompt: string) => void;
  onTriggerSimulatedComment: () => void;
}

export default function RightSidebar({
  comments,
  versions,
  collaborators,
  activeSlideId,
  onAddComment,
  onResolveComment,
  onRestoreVersion,
  onApplyAIPrompt,
  onTriggerSimulatedComment,
}: RightSidebarProps) {
  const [activeTab, setActiveTab] = useState<'comments' | 'history' | 'team'>('comments');
  const [newCommentText, setNewCommentText] = useState('');
  const [isSuggestion, setIsSuggestion] = useState(false);
  const [suggestedValue, setSuggestedValue] = useState('');

  // Auto-trigger simulated comments every 90 seconds to show dynamic live collaboration
  useEffect(() => {
    const timer = setInterval(() => {
      onTriggerSimulatedComment();
    }, 90000);
    return () => clearInterval(timer);
  }, [onTriggerSimulatedComment]);

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    if (isSuggestion && suggestedValue.trim()) {
      onAddComment(newCommentText, true, {
        type: 'update_content',
        originalText: '',
        suggestedText: suggestedValue,
      });
    } else {
      onAddComment(newCommentText);
    }

    setNewCommentText('');
    setSuggestedValue('');
    setIsSuggestion(false);
  };

  const slideComments = comments.filter((c) => c.slideId === activeSlideId);

  return (
    <div className="w-full md:w-80 border-l border-[#e5e5e5] bg-[#fafafa] flex flex-col h-full no-print text-xs">
      {/* Tab Selectors */}
      <div className="grid grid-cols-3 border-b border-[#e5e5e5] bg-white text-[11px] font-semibold text-stone-500">
        <button
          onClick={() => setActiveTab('comments')}
          className={`py-3.5 flex flex-col items-center gap-1 border-b-2 transition-all ${
            activeTab === 'comments'
              ? 'border-stone-800 text-stone-900 bg-stone-50'
              : 'border-transparent hover:bg-stone-50'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-stone-500" />
          <span>Comentários ({slideComments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`py-3.5 flex flex-col items-center gap-1 border-b-2 transition-all ${
            activeTab === 'history'
              ? 'border-stone-800 text-stone-900 bg-stone-50'
              : 'border-transparent hover:bg-stone-50'
          }`}
        >
          <History className="w-4 h-4 text-stone-500" />
          <span>Histórico ({versions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('team')}
          className={`py-3.5 flex flex-col items-center gap-1 border-b-2 transition-all ${
            activeTab === 'team'
              ? 'border-stone-800 text-stone-900 bg-stone-50'
              : 'border-transparent hover:bg-stone-50'
          }`}
        >
          <Users className="w-4 h-4 text-stone-500" />
          <span>Equipe ({collaborators.filter(c => c.online).length})</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4">
        
        {/* TAB 1: COMMENTS AND SUGGESTIONS */}
        {activeTab === 'comments' && (
          <div className="space-y-4 h-full flex flex-col">
            
            <div className="flex justify-between items-center bg-stone-50 border p-3 rounded-lg">
              <span className="font-semibold text-stone-700">Fluxo Colaborativo</span>
              <button
                onClick={onTriggerSimulatedComment}
                className="px-2 py-1 bg-[#1e1e1e] hover:bg-stone-800 text-white text-[10px] rounded-md font-medium"
                title="Simula a entrada instantânea de sugestões de outros membros da equipe"
              >
                Injetar Comentário IA
              </button>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[350px] pr-1">
              {slideComments.length > 0 ? (
                slideComments.map((c) => (
                  <div key={c.id} className="p-3 bg-white border border-stone-200 rounded-xl space-y-2 shadow-xs">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <img
                          src={c.avatar}
                          alt={c.author}
                          className="w-5 h-5 rounded-full object-cover border border-stone-200"
                          referrerPolicy="no-referrer"
                        />
                        <span className="font-bold text-stone-800 text-[11px]">{c.author}</span>
                      </div>
                      <span className="text-[9px] text-stone-400">
                        {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-stone-700 leading-relaxed">{c.text}</p>

                    {/* Collaborative UI for accept/decline edits */}
                    {c.isSuggestion && c.suggestionData && (
                      <div className="bg-[#fcfbf7] border border-[#f5f0db] p-2.5 rounded-lg text-[11px] space-y-1.5">
                        <div className="font-semibold text-amber-800 flex items-center gap-1">
                          <Award className="w-3.5 h-3.5" />
                          <span>Sugestão de Alteração</span>
                        </div>
                        <p className="text-stone-600">
                          Alterar conteúdo para: <span className="font-mono bg-white px-1 border block mt-1 py-1 rounded text-stone-800 font-medium">{c.suggestionData.suggestedText}</span>
                        </p>
                        
                        {c.status === 'pending' ? (
                          <div className="flex gap-1.5 pt-1">
                            <button
                              onClick={() => onResolveComment(c.id, 'accept')}
                              className="flex-1 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium flex items-center justify-center gap-1 text-[10px]"
                            >
                              <Check className="w-3 h-3" /> Aceitar
                            </button>
                            <button
                              onClick={() => onResolveComment(c.id, 'decline')}
                              className="flex-1 py-1 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded font-medium flex items-center justify-center gap-1 text-[10px]"
                            >
                              <X className="w-3 h-3" /> Recusar
                            </button>
                          </div>
                        ) : (
                          <div className={`text-[10px] font-semibold text-center py-0.5 rounded ${
                            c.status === 'accepted' ? 'bg-emerald-50 text-emerald-800' : 'bg-stone-100 text-stone-500'
                          }`}>
                            {c.status === 'accepted' ? '✓ Alteração Aplicada' : '✗ Sugestão Recusada'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-stone-400 italic">
                  Nenhum comentário ou sugestão técnica neste slide. Adicione uma nova sugestão para colaborar.
                </div>
              )}
            </div>

            {/* Comment Form */}
            <form onSubmit={handleSendComment} className="border-t pt-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-stone-500 font-semibold text-[10px]">Colaborar neste slide</span>
                <button
                  type="button"
                  onClick={() => setIsSuggestion(!isSuggestion)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                    isSuggestion
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {isSuggestion ? 'Sugestão de texto ativada' : 'Escrever como sugestão'}
                </button>
              </div>

              {isSuggestion && (
                <input
                  type="text"
                  required={isSuggestion}
                  placeholder="Texto a ser injetado caso aceito..."
                  value={suggestedValue}
                  onChange={(e) => setSuggestedValue(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-stone-800 focus:outline-none"
                />
              )}

              <div className="flex gap-1.5">
                <input
                  type="text"
                  required
                  placeholder={isSuggestion ? "Explicar por que fazer essa alteração..." : "Adicionar comentário..."}
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 border border-stone-300 rounded-lg text-stone-800 focus:outline-none"
                />
                <button
                  type="submit"
                  className="p-1.5 bg-[#1e1e1e] hover:bg-stone-800 text-white rounded-lg flex items-center justify-center shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: DETAILED VERSION HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="border-b pb-2">
              <span className="text-stone-500 font-semibold text-[10px] uppercase block tracking-wider">Histórico de Versões</span>
              <p className="text-[10px] text-stone-400 mt-0.5">Clique em restaurar para voltar a uma versão anterior.</p>
            </div>

            <div className="space-y-3.5">
              {versions.length > 0 ? (
                versions.map((v, idx) => (
                  <div key={v.id} className="p-3 bg-white border border-stone-200 rounded-xl space-y-2 relative group/version">
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <span className="font-bold text-stone-800 text-[11px] block">{v.description}</span>
                        <div className="flex items-center gap-1.5 text-stone-400 text-[10px]">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(v.timestamp).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}</span>
                        </div>
                      </div>
                      
                      {idx === 0 ? (
                        <span className="text-[9px] bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded-full font-bold">Atual</span>
                      ) : (
                        <button
                          onClick={() => {
                            if (confirm('Deseja restaurar esta versão da apresentação? Isso substituirá seus slides atuais.')) {
                              onRestoreVersion(v);
                            }
                          }}
                          className="px-2 py-1 bg-[#1e1e1e] hover:bg-stone-800 text-white rounded text-[10px] font-semibold"
                        >
                          Restaurar
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-[10px] text-stone-500 border-t pt-1.5">
                      <span>Autor:</span>
                      <span className="font-semibold text-stone-700">{v.author}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-stone-400 italic">Nenhum histórico disponível para esta apresentação.</div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: TEAM MEMBERS */}
        {activeTab === 'team' && (
          <div className="space-y-4">
            <div className="border-b pb-2">
              <span className="text-stone-500 font-semibold text-[10px] uppercase block tracking-wider">Membros Conectados</span>
              <p className="text-[10px] text-stone-400 mt-0.5">Controles de compartilhamento e edição paralela em tempo real.</p>
            </div>

            <div className="space-y-3">
              {collaborators.map((collab) => (
                <div key={collab.id} className="flex items-center justify-between p-2.5 bg-white border border-stone-200 rounded-xl shadow-xs">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <img
                        src={collab.avatar}
                        alt={collab.name}
                        className="w-7 h-7 rounded-full object-cover border border-stone-100"
                        referrerPolicy="no-referrer"
                      />
                      <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                        collab.online ? 'bg-emerald-500' : 'bg-stone-300'
                      }`} />
                    </div>

                    <div>
                      <span className="font-bold text-stone-800 block text-[11px] leading-tight">{collab.name}</span>
                      <span className="text-[10px] text-stone-400 block">{collab.role}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    {collab.online ? (
                      <span className="text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-100 px-1.5 py-0.5 rounded-full font-semibold">
                        Ativo
                      </span>
                    ) : (
                      <span className="text-[9px] bg-stone-100 text-stone-400 px-1.5 py-0.5 rounded-full">
                        Offline
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
