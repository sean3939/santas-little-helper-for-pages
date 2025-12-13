export interface GiftSuggestion {
  item_name: string;
  reason: string;
}

export interface SantaVerdict {
  verdict: 'Naughty' | 'Nice';
  score: number;
  title: string;
  reasoning: string;
  visual_prompt: string;
  gift_description: string;
  suggested_gifts?: GiftSuggestion[];
}

export interface AppState {
  status: 'idle' | 'fetching_data' | 'judging' | 'generating_image' | 'complete' | 'error';
  error: string | null;
  verdict: SantaVerdict | null;
  generatedImage: string | null; // Base64 string
}

export type InputMode = 'news' | 'wiki' | 'github' | 'reddit';

export interface ScanInput {
  type: InputMode;
  content: string; // Text content, URL, or Username
}