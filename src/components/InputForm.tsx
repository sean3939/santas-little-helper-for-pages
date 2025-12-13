import React, { useState } from 'react';
import { InputMode, ScanInput } from '../types';

interface InputFormProps {
  onScan: (input: ScanInput) => void;
  disabled: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onScan, disabled }) => {
  const [mode, setMode] = useState<InputMode>('news');
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onScan({ type: mode, content: content.trim() });
    }
  };

  const getPlaceholder = () => {
    switch (mode) {
      case 'news': return 'Enter a Name (e.g., "Sam Altman"), + context if necessary...';
      case 'wiki': return 'Paste Wikipedia URL here (e.g., https://en.wikipedia.org/wiki/Santa_Claus)';
      case 'github': return 'GitHub Username (e.g., nearform)';
      case 'reddit': return 'Reddit Username (e.g., spez)';
      default: return '';
    }
  };

  return (
    <div className="bg-slate-800/80 backdrop-blur-md border border-santa-gold rounded-xl p-6 shadow-2xl max-w-2xl w-full mx-auto relative z-10">
      
      {/* Tabs */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {[
          { id: 'news', label: '📰 In the News', type: 'news' },
          { id: 'wiki', label: '📜 Wiki Legacy', type: 'wiki' },
          { id: 'github', label: '💻 Code-based', type: 'github' },
          { id: 'reddit', label: '👽 Karma', type: 'reddit' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setMode(tab.type as InputMode); setContent(''); }}
            className={`py-3 px-2 rounded-lg font-bold text-sm md:text-base transition-all ${
              mode === tab.type 
                ? 'bg-santa-red text-white shadow-lg scale-105' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-santa-gold font-santa text-xl capitalize">
            {mode === 'news' ? 'Anything newsworthy?' : 
             mode === 'wiki' ? 'Wikipedia Record' :
             mode === 'github' ? 'GitHub Profile' : 'Redditor Profile'}
          </label>
          
          <div className="flex w-full bg-slate-900 border border-slate-600 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-santa-gold">
            <input
              type="text"
              className="flex-1 bg-transparent p-3 text-white outline-none placeholder-slate-500"
              placeholder={getPlaceholder()}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={disabled}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={disabled || !content}
          className={`w-full py-4 rounded-lg font-santa text-2xl font-bold uppercase tracking-wide transition-all ${
            disabled 
              ? 'bg-slate-600 text-slate-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-santa-green to-emerald-600 text-white hover:from-emerald-600 hover:to-santa-green shadow-lg hover:shadow-green-900/50 transform hover:-translate-y-1'
          }`}
        >
          {disabled ? "Finding out who's naughty or nice..." : 'Check the List 🎅'}
        </button>
      </form>
    </div>
  );
};

export default InputForm;