import React, { useState } from 'react';
import { Target, CheckCircle2, XCircle, MoveRight } from 'lucide-react';
import { QuestionOption } from '../types';

interface OptionDropZoneProps {
  selectedOption: string | null;
  options: QuestionOption[];
  onSelectOption: (optionId: string) => void;
  onClearOption: () => void;
}

export const OptionDropZone: React.FC<OptionDropZoneProps> = ({
  selectedOption,
  options,
  onSelectOption,
  onClearOption,
}) => {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (!isOver) setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    const optionId = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('optionId');
    if (optionId && options.some((o) => o.id === optionId)) {
      onSelectOption(optionId);
    }
  };

  const selectedOpt = options.find((o) => o.id === selectedOption);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative rounded-xl border-2 transition-all p-4 ${
        isOver
          ? 'border-cyan-400 bg-cyan-950/40 shadow-lg shadow-cyan-500/20 scale-[1.01]'
          : selectedOpt
          ? 'border-emerald-500/80 bg-emerald-950/20 shadow-md'
          : 'border-dashed border-slate-700 bg-slate-900/40 hover:border-slate-600'
      }`}
    >
      {selectedOpt ? (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500 text-slate-950 font-black text-base flex items-center justify-center shadow flex-shrink-0">
              {selectedOpt.id}
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Selected Answer Locked in</span>
              </div>
              <p className="text-sm font-medium text-slate-200 mt-0.5 line-clamp-2">
                {selectedOpt.text}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={onClearOption}
              className="px-2.5 py-1 text-xs text-slate-400 hover:text-rose-400 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors flex items-center gap-1"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Clear Choice</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-3 py-2 text-center text-slate-400">
          <div className={`p-2 rounded-lg ${isOver ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
            <Target className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-200">
              {isOver ? 'Release to Drop Selected Option Here' : 'Drag an option here or click any card below'}
            </p>
            <p className="text-xs text-slate-400">
              Drop target automatically registers and confirms your answer
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
