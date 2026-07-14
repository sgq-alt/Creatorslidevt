export type SlideType = 'title' | 'results' | 'indicators' | 'improvements' | 'comparison' | 'closing';

export interface SlideTheme {
  id: string;
  name: string;
  background: string; // CSS bg class
  text: string;       // CSS text class
  accent: string;     // Accent color class
  secondary: string;  // Secondary/Card background class
  border: string;     // Border color class
}

export interface Metric {
  id: string;
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
}

export interface ImprovementStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface ComparisonItem {
  id: string;
  before: string;
  after: string;
}

export interface Slide {
  id: string;
  type: SlideType;
  title: string;
  subtitle?: string;
  content: string; // Paragraph or general text
  bulletPoints?: string[];
  metrics?: Metric[];
  steps?: ImprovementStep[];
  comparisons?: ComparisonItem[];
  imageUrl?: string;
  imageCaption?: string;
}

export interface Version {
  id: string;
  timestamp: string;
  description: string;
  author: string;
  slides: Slide[];
}

export interface Comment {
  id: string;
  slideId: string;
  author: string;
  avatar: string;
  text: string;
  timestamp: string;
  isSuggestion?: boolean;
  suggestionData?: {
    type: 'add_bullet' | 'update_title' | 'update_content';
    originalText?: string;
    suggestedText?: string;
  };
  status?: 'pending' | 'accepted' | 'declined';
}

export interface Presentation {
  id: string;
  title: string;
  themeId: 'beige' | 'blue' | 'green';
  category: string;
  lastSaved: string;
  slides: Slide[];
  comments: Comment[];
  versions: Version[];
}

export interface Collaborator {
  id: string;
  name: string;
  role: string;
  avatar: string;
  color: string;
  activeSlideId?: string;
  online: boolean;
}
