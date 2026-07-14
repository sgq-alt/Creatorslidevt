import { SlideTheme } from '../types';

export const THEMES: Record<'beige' | 'blue' | 'green' | 'charcoal' | 'terracotta', SlideTheme> = {
  beige: {
    id: 'beige',
    name: 'Areia Minimalista (Natural Tones)',
    background: 'bg-[#FDFBF7] text-[#333333]', // Warm off-white background, dark grey text
    text: 'text-[#333333]',
    accent: 'border-[#4B6B4C] text-[#4B6B4C] bg-[#FDFBF7]', // forest green border/text
    secondary: 'bg-[#F4F1EA] border-[#E8E2D6]', // warm sand/beige card
    border: 'border-[#E8E2D6]',
  },
  blue: {
    id: 'blue',
    name: 'Azul Prisma (Natural Tones)',
    background: 'bg-[#F0F4F8] text-[#1C2D42]', // light blue-grey background
    text: 'text-[#1C2D42]',
    accent: 'border-[#2D5A82] text-[#2D5A82] bg-[#F0F4F8]', // prisma blue accent
    secondary: 'bg-[#E1E7F0] border-[#C7D5E6]', // light blue card
    border: 'border-[#C7D5E6]',
  },
  green: {
    id: 'green',
    name: 'Verde Floresta (Natural Tones)',
    background: 'bg-[#F4F7F5] text-[#193224]', // light moss background
    text: 'text-[#193224]',
    accent: 'border-[#4B6B4C] text-[#4B6B4C] bg-[#FDFBF7]', // forest green accent
    secondary: 'bg-[#E5EBE7] border-[#CAD6CE]', // light green card
    border: 'border-[#CAD6CE]',
  },
  charcoal: {
    id: 'charcoal',
    name: 'Carvão Tecnológico (Elegant Dark)',
    background: 'bg-[#1E1E1E] text-[#F3F4F6]', // dark charcoal background
    text: 'text-[#F3F4F6]',
    accent: 'border-[#10B981] text-[#10B981] bg-[#1E1E1E]', // neon emerald accent
    secondary: 'bg-[#2D2D2D] border-[#3E3E3E]', // dark card
    border: 'border-[#3E3E3E]',
  },
  terracotta: {
    id: 'terracotta',
    name: 'Terracota Quente (Warm Clay)',
    background: 'bg-[#FFF9F5] text-[#4A2D1F]', // warm terracotta background
    text: 'text-[#4A2D1F]',
    accent: 'border-[#D95D39] text-[#D95D39] bg-[#FFF9F5]', // terracotta orange accent
    secondary: 'bg-[#FCECE3] border-[#F3D6C5]', // soft terracotta card
    border: 'border-[#F3D6C5]',
  },
};
