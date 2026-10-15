import React, { useState } from 'react';
import { 
  Heart, MessageCircle, Send, Bookmark, MoreHorizontal, 
  Sparkles, CheckCircle2, Play, ChevronLeft, ChevronRight, Copy
} from 'lucide-react';
import { cn } from '../../utils/cn';
import toast from 'react-hot-toast';

export default function BuzzMobilePreview({ client, post }) {
  const [currentSlide, setCurrentSlide] = useState(1);
  const totalSlides = post?.type === 'Carrossel' ? 4 : 1;

  const currentPost = post || {
    title: 'Exemplo de Publicação',
    caption: 'Legenda da publicação será exibida aqui com formatação e hashtags...',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=600&auto=format&fit=crop',
    type: 'Carrossel',
    channels: ['Instagram Feed']
  };

  const handleCopyCaption = () => {
    if (currentPost.caption) {
      navigator.clipboard.writeText(currentPost.caption);
      toast.success('Legenda copiada para a área de transferência!');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-2">
      {/* Mobile Device Frame */}
      <div className="w-[320px] bg-black rounded-[40px] border-[6px] border-zinc-800 shadow-2xl overflow-hidden relative text-white font-sans text-xs select-none">
        {/* Dynamic Island / Notch */}
        <div className="h-6 bg-black flex items-center justify-center relative pt-1">
          <div className="w-20 h-4 bg-zinc-900 rounded-full flex items-center justify-end px-2">
            <div className="w-2 h-2 rounded-full bg-blue-900/60" />
          </div>
        </div>

        {/* Instagram Header */}
        <div className="px-4 py-2.5 flex items-center justify-between border-b border-zinc-900 bg-black">
          <div className="flex items-center gap-2.5">
            <img 
              src={client?.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=300&auto=format&fit=crop'} 
              alt={client?.name || 'Cliente'} 
              className="w-7 h-7 rounded-full object-cover border border-zinc-700"
            />
            <div>
              <div className="font-bold text-[11px] flex items-center gap-1">
                {client?.handle?.replace('@', '') || 'cliente'}
                <CheckCircle2 size={10} className="text-blue-500 fill-blue-500" />
              </div>
              <div className="text-[9px] text-zinc-400 font-normal">{client?.city || 'Brasil'}</div>
            </div>
          </div>
          <MoreHorizontal size={14} className="text-zinc-400" />
        </div>

        {/* Post Media (Image/Carousel Preview) */}
        <div className="w-full h-72 bg-zinc-950 relative overflow-hidden flex items-center justify-center group">
          <img 
            src={currentPost.image || 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=600&auto=format&fit=crop'} 
            alt={currentPost.title} 
            className="w-full h-full object-cover"
          />

          {/* Type Badges */}
          {currentPost.type === 'Carrossel' && (
            <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-bold text-white shadow">
              {currentSlide}/{totalSlides}
            </div>
          )}

          {currentPost.type === 'Vídeo / Reels' && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Play size={20} className="text-white fill-white ml-0.5" />
              </div>
            </div>
          )}

          {/* Carousel Slide Navigators */}
          {currentPost.type === 'Carrossel' && (
            <div className="absolute inset-x-2 flex items-center justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={(e) => { e.stopPropagation(); setCurrentSlide(prev => Math.max(1, prev - 1)); }}
                disabled={currentSlide === 1}
                className="w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center pointer-events-auto disabled:opacity-30"
              >
                <ChevronLeft size={14} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setCurrentSlide(prev => Math.min(totalSlides, prev + 1)); }}
                disabled={currentSlide === totalSlides}
                className="w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center pointer-events-auto disabled:opacity-30"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Actions Bar */}
        <div className="px-3 py-2 flex items-center justify-between bg-black">
          <div className="flex items-center gap-3">
            <Heart size={18} className="text-white hover:text-red-500 transition-colors cursor-pointer" />
            <MessageCircle size={18} className="text-white cursor-pointer" />
            <Send size={18} className="text-white cursor-pointer" />
          </div>

          {currentPost.type === 'Carrossel' && (
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4].map(idx => (
                <div 
                  key={idx} 
                  className={cn("w-1.5 h-1.5 rounded-full transition-all", currentSlide === idx ? "bg-blue-500 w-3" : "bg-zinc-700")}
                />
              ))}
            </div>
          )}

          <Bookmark size={18} className="text-white cursor-pointer" />
        </div>

        {/* Likes and Caption */}
        <div className="px-3 pb-4 space-y-1.5 bg-black text-[11px] max-h-48 overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white">2.015 visualizações</span>
            <button 
              onClick={handleCopyCaption}
              className="text-[10px] text-zinc-400 hover:text-cs-primary flex items-center gap-1"
              title="Copiar Legenda"
            >
              <Copy size={10} /> Copiar
            </button>
          </div>

          <div className="leading-relaxed">
            <span className="font-bold mr-1.5">{client?.handle?.replace('@', '') || 'cliente'}</span>
            <span className="text-zinc-300 whitespace-pre-line">{currentPost.caption}</span>
          </div>

          <div className="text-[9px] text-zinc-500 uppercase tracking-wide pt-1">
            HÁ 2 HORAS • VER TRADUÇÃO
          </div>
        </div>

        {/* Home Indicator Bar */}
        <div className="h-4 bg-black flex items-center justify-center pb-1">
          <div className="w-28 h-1 bg-zinc-700 rounded-full" />
        </div>
      </div>
    </div>
  );
}
