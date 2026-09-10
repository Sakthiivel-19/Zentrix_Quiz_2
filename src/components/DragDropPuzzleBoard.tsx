import React, { useState, useEffect } from 'react';
import { GripVertical, RotateCcw, Check, Sparkles, ArrowRight } from 'lucide-react';
import { PUZZLE_QUESTIONS, PuzzlePiece } from '../data/puzzlePieces';
import { QuestionOption } from '../types';

interface DragDropPuzzleBoardProps {
  questionId: string;
  options: QuestionOption[];
  selectedOption: string | null;
  onSelectOption: (optionId: string) => void;
  onClearOption?: () => void;
}

export const DragDropPuzzleBoard: React.FC<DragDropPuzzleBoardProps> = ({
  questionId,
  options,
  selectedOption,
  onSelectOption,
  onClearOption,
}) => {
  const puzzleData = PUZZLE_QUESTIONS[questionId];
  if (!puzzleData) return null;

  // Parse option sequences: e.g. "6 -> 7 -> 3 -> 1 -> 2 -> 4 -> 5 -> 8 -> 9"
  const optionSequenceMap = React.useMemo<Record<string, string[]>>(() => {
    const map: Record<string, string[]> = {};
    options.forEach((opt) => {
      const parts = opt.text
        .split('->')
        .map((s) => s.trim())
        .filter(Boolean);
      if (parts.length === puzzleData.totalPieces) {
        map[opt.id] = parts;
      }
    });
    return map;
  }, [options, puzzleData.totalPieces]);

  // 9 slots: index 0 to 8 storing pieceId or null
  const [slots, setSlots] = useState<(string | null)[]>(() => {
    if (selectedOption) {
      if (optionSequenceMap[selectedOption]) {
        return [...optionSequenceMap[selectedOption]];
      }
      if (selectedOption.includes('->')) {
        const parts = selectedOption.split('->').map((s) => s.trim());
        if (parts.length === puzzleData.totalPieces) {
          return parts;
        }
      }
    }
    return Array(puzzleData.totalPieces).fill(null);
  });
  const [draggedPieceId, setDraggedPieceId] = useState<string | null>(null);
  const [dragSourceSlotIndex, setDragSourceSlotIndex] = useState<number | null>(null);

  // Sync board with selected option on mount if empty
  useEffect(() => {
    if (selectedOption) {
      let targetSeq: string[] | null = null;
      if (optionSequenceMap[selectedOption]) {
        targetSeq = optionSequenceMap[selectedOption];
      } else if (selectedOption.includes('->')) {
        const parts = selectedOption.split('->').map((s) => s.trim());
        if (parts.length === puzzleData.totalPieces) {
          targetSeq = parts;
        }
      }

      if (targetSeq) {
        const seqToApply = targetSeq;
        setSlots((prev) => {
          const matches = prev.every((s, idx) => s === seqToApply[idx]);
          const isBlank = prev.every((s) => s === null);
          if (isBlank && !matches) {
            return [...seqToApply];
          }
          return prev;
        });
      }
    }
  }, [selectedOption, optionSequenceMap, puzzleData.totalPieces]);

  // Deterministically scramble available pieces pool so they are not in ascending 1..9 order
  const displayPieces = React.useMemo(() => {
    const scrambleOrder: Record<string, string[]> = {
      q1: ['4', '8', '2', '6', '1', '9', '3', '7', '5'],
      q7: ['7', '3', '9', '1', '5', '2', '8', '4', '6'],
    };
    const order = scrambleOrder[questionId];
    if (!order) return puzzleData.pieces;
    return [...puzzleData.pieces].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  }, [questionId, puzzleData.pieces]);

  // Which pieces are already placed
  const placedPieceIds = new Set(slots.filter(Boolean) as string[]);

  // Check if current slot arrangement matches any option
  const checkAndMatchSequence = (currentSlots: (string | null)[]) => {
    const isFull = currentSlots.every((s) => s !== null);
    if (!isFull) return;

    const currentSequence = currentSlots.join('->');
    for (const [optId, seq] of Object.entries(optionSequenceMap)) {
      if ((seq as string[]).join('->') === currentSequence) {
        onSelectOption(optId);
        return;
      }
    }
    // If full but custom non-matching sequence, register custom sequence
    onSelectOption(currentSequence);
  };

  // Drag start from pool
  const handleDragStartFromPool = (e: React.DragEvent, pieceId: string) => {
    e.dataTransfer.setData('text/plain', pieceId);
    e.dataTransfer.setData('source', 'pool');
    setDraggedPieceId(pieceId);
    setDragSourceSlotIndex(null);
  };

  // Drag start from an existing slot
  const handleDragStartFromSlot = (e: React.DragEvent, slotIdx: number, pieceId: string) => {
    e.dataTransfer.setData('text/plain', pieceId);
    e.dataTransfer.setData('source', `slot-${slotIdx}`);
    setDraggedPieceId(pieceId);
    setDragSourceSlotIndex(slotIdx);
  };

  // Drag over slot
  const handleDragOverSlot = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Drop on slot
  const handleDropOnSlot = (targetSlotIdx: number) => {
    if (!draggedPieceId) return;

    const newSlots = [...slots];
    if (dragSourceSlotIndex !== null) {
      // Dragged from one slot to another -> swap
      const existingTargetPiece = newSlots[targetSlotIdx];
      newSlots[targetSlotIdx] = draggedPieceId;
      newSlots[dragSourceSlotIndex] = existingTargetPiece;
    } else {
      // Dragged from pool into slot
      const oldIdx = newSlots.indexOf(draggedPieceId);
      if (oldIdx !== -1) {
        newSlots[oldIdx] = null;
      }
      newSlots[targetSlotIdx] = draggedPieceId;
    }

    setSlots(newSlots);
    setDraggedPieceId(null);
    setDragSourceSlotIndex(null);

    // Trigger parent check outside of state updater
    checkAndMatchSequence(newSlots);
  };

  // Click to place piece in first available slot
  const handleClickPoolPiece = (pieceId: string) => {
    const existingIdx = slots.indexOf(pieceId);
    if (existingIdx !== -1) {
      handleRemoveFromSlot(existingIdx);
      return;
    }

    // Find first empty slot
    const firstEmptyIdx = slots.indexOf(null);
    if (firstEmptyIdx !== -1) {
      const next = [...slots];
      next[firstEmptyIdx] = pieceId;
      setSlots(next);
      checkAndMatchSequence(next);
    }
  };

  // Remove piece from slot
  const handleRemoveFromSlot = (slotIdx: number) => {
    const next = [...slots];
    next[slotIdx] = null;
    setSlots(next);
  };

  // Reset all slots
  const handleResetBoard = () => {
    setSlots(Array(puzzleData.totalPieces).fill(null));
    if (onClearOption) {
      onClearOption();
    }
  };

  // Formatted sequence string
  const isComplete = slots.every((s) => s !== null);
  const currentSequenceDisplay = slots.map((s, idx) => s || `[#${idx + 1}]`).join('  →  ');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
            <GripVertical className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              Code Assembly Drag &amp; Drop Board
            </h3>
            <p className="text-xs text-slate-400">Drag or click code pieces into sequential slots 1 to {puzzleData.totalPieces}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetBoard}
            className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Board</span>
          </button>
        </div>
      </div>

      {/* Assembly Slots (1 to 9) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
          <span>Sequential Order Slots:</span>
          <span className="font-mono text-cyan-400">
            {slots.filter(Boolean).length} / {puzzleData.totalPieces} placed
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
          {slots.map((pieceId, idx) => {
            const piece = pieceId ? puzzleData.pieces.find((p) => p.id === pieceId) : null;
            return (
              <div
                key={idx}
                onDragOver={handleDragOverSlot}
                onDrop={() => handleDropOnSlot(idx)}
                className={`relative min-h-[72px] rounded-xl border p-2 flex flex-col justify-between transition-all select-none ${
                  piece
                    ? 'bg-slate-900/90 border-cyan-500/80 shadow-md shadow-cyan-950/50 text-white cursor-grab'
                    : 'bg-slate-950/60 border-dashed border-slate-800 hover:border-slate-700 text-slate-500'
                }`}
                draggable={Boolean(piece)}
                onDragStart={(e) => piece && handleDragStartFromSlot(e, idx, piece.id)}
              >
                {/* Slot Number Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                    #{idx + 1}
                  </span>
                  {piece && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFromSlot(idx)}
                      className="text-slate-500 hover:text-rose-400 text-[10px] font-bold px-1 cursor-pointer"
                      title="Remove piece"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Piece Content in Slot */}
                {piece ? (
                  <div className="mt-1 font-mono text-[11px] leading-tight text-cyan-300">
                    <span className="inline-block px-1 py-0.2 rounded bg-cyan-900/50 text-cyan-200 font-bold mr-1">
                      [{piece.id}]
                    </span>
                    <span className="text-slate-200 truncate block">{piece.code.split('\n')[0]}</span>
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-600 text-center py-2 italic font-mono">
                    Slot #{idx + 1}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Assembled Sequence Status Bar */}
      <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs">
          <span className="text-slate-400 font-semibold mr-2">Current Sequence:</span>
          <span className="font-mono text-cyan-300 font-medium text-xs break-all">
            {currentSequenceDisplay}
          </span>
        </div>

        {isComplete && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950/80 border border-emerald-700 rounded-lg text-emerald-300 text-xs font-semibold">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sequence Assembled &amp; Auto-Saved!</span>
          </div>
        )}
      </div>

      {/* Available Pieces Pool */}
      <div className="space-y-1.5">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Available Code Pieces (Click or Drag into Slots):</span>
          <span className="text-[11px] text-slate-500 lowercase">click to auto-place</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {displayPieces.map((piece) => {
            const isPlaced = placedPieceIds.has(piece.id);
            return (
              <div
                key={piece.id}
                draggable={!isPlaced}
                onDragStart={(e) => handleDragStartFromPool(e, piece.id)}
                onClick={() => handleClickPoolPiece(piece.id)}
                className={`p-2.5 rounded-xl border transition-all flex items-start gap-2.5 text-xs select-none ${
                  isPlaced
                    ? 'bg-slate-950/40 border-slate-900 opacity-40 cursor-pointer line-through text-slate-500'
                    : 'bg-slate-900/80 border-slate-800 hover:border-cyan-700 hover:bg-slate-800/60 cursor-grab active:cursor-grabbing text-slate-200'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 font-mono ${
                    isPlaced ? 'bg-slate-800 text-slate-500' : 'bg-cyan-600 text-white shadow-sm'
                  }`}
                >
                  {piece.id}
                </div>
                <div className="flex-1 min-w-0 font-mono text-[11px] leading-snug whitespace-pre-wrap">
                  {piece.code}
                </div>
                {isPlaced && (
                  <span className="text-[10px] text-slate-500 font-mono">Placed</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
