import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Send,
  ZoomIn,
  X,
  ShieldAlert,
  CheckCircle2,
  RotateCcw,
  HelpCircle,
} from 'lucide-react';
import {
  Question,
  ParticipantSession,
  QuizState,
  QuizSubmissionResult,
} from '../types';
import { DragDropPuzzleBoard } from './DragDropPuzzleBoard';
import { PUZZLE_QUESTIONS } from '../data/puzzlePieces';
import { QUESTION_PROMPTS } from '../data/questionPrompts';

interface QuizViewProps {
  participant: ParticipantSession;
  initialState: QuizState;
  questions: Question[];
  onQuizSubmitted: (
    status: string,
    timeTakenFormatted: string,
    result?: QuizSubmissionResult | null
  ) => void;
}

export const QuizView: React.FC<QuizViewProps> = ({
  participant,
  initialState,
  questions,
  onQuizSubmitted,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >(initialState.answers || {});

  const [tabSwitchCount, setTabSwitchCount] = useState(
    initialState.tab_switch_count || 0
  );

  const [showWarningModal, setShowWarningModal] = useState(false);

  const [savingStatus, setSavingStatus] = useState<
    'idle' | 'saving' | 'saved'
  >('idle');

  const [isNavigating, setIsNavigating] = useState(false);

  const savePromiseRef = useRef<Promise<boolean> | null>(null);

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    return Math.max(0, initialState.timeRemaining);
  });

  const timerExpiredRef = useRef<boolean>(false);
  const isLeavingRef = useRef<boolean>(false);

  const totalQuestions = questions.length;

  // =========================================================
  // FINAL SUBMISSION
  // =========================================================

  const handleFinalSubmit = useCallback(
    async (forceTimeExpired: boolean = false) => {
      if (isSubmitting) return;

      // Make sure the latest answer has finished saving
      if (savePromiseRef.current) {
        await savePromiseRef.current;
      }

      setIsSubmitting(true);

      try {
        const res = await fetch('/api/quiz/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            participantId: participant.id,
            forceTimeExpired,
          }),
        });

        const data = await res.json();

        if (data.success) {
          onQuizSubmitted(
            data.status,
            data.timeTakenFormatted,
            data.result || null
          );
        } else {
          alert(
            'Submission error: ' +
              (data.error || 'Failed to submit quiz.')
          );

          setIsSubmitting(false);
        }
      } catch (err) {
        console.error('Submit error:', err);
        setIsSubmitting(false);
      }
    },
    [isSubmitting, onQuizSubmitted, participant.id]
  );

  // =========================================================
  // TIMER
  // =========================================================

  useEffect(() => {
    if (secondsRemaining <= 0) {
      if (!timerExpiredRef.current) {
        timerExpiredRef.current = true;
        handleFinalSubmit(true);
      }

      return;
    }

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);

          if (!timerExpiredRef.current) {
            timerExpiredRef.current = true;
            handleFinalSubmit(true);
          }

          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsRemaining, handleFinalSubmit]);

  // =========================================================
  // SERVER TIMER SYNC
  // =========================================================

  useEffect(() => {
    const syncInterval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/quiz/state?participantId=${encodeURIComponent(
            participant.id
          )}`
        );

        const data = await res.json();

        if (data.success && data.state) {
          if (
            data.state.status === 'completed' ||
            data.state.status === 'time_expired'
          ) {
            onQuizSubmitted(
              data.state.status,
              data.state.time_taken_formatted
            );

            return;
          }

          setSecondsRemaining(data.state.timeRemaining);
          setTabSwitchCount(data.state.tab_switch_count);
        }
      } catch (err) {
        console.warn('Sync timer warning:', err);
      }
    }, 25000);

    return () => clearInterval(syncInterval);
  }, [participant.id, onQuizSubmitted]);

  // =========================================================
  // TAB SWITCH DETECTION
  // =========================================================

  const reportTabSwitch = useCallback(
    async (eventType: string) => {
      try {
        const res = await fetch('/api/quiz/tab-switch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            participantId: participant.id,
            eventType,
          }),
        });

        const data = await res.json();

        if (data.success) {
          setTabSwitchCount(data.tabSwitchCount);
        }
      } catch (err) {
        console.error('Failed to report tab switch:', err);
      }
    },
    [participant.id]
  );

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        isLeavingRef.current = true;
        reportTabSwitch('visibilitychange_hidden');
      } else if (
        document.visibilityState === 'visible' &&
        isLeavingRef.current
      ) {
        isLeavingRef.current = false;
        setShowWarningModal(true);
      }
    };
    const handleWindowBlur = () => {
      if (isLeavingRef.current) return;
      isLeavingRef.current = true;
      reportTabSwitch('window_blur');
    };

    const handleWindowFocus = () => {
      if (isLeavingRef.current) {
        isLeavingRef.current = false;
        setShowWarningModal(true);
      }
    };

    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange
    );

    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange
      );

      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [reportTabSwitch]);

  // =========================================================
  // SAVE ANSWER
  // =========================================================

  const handleSelectOption = async (
    questionId: string,
    optionId: string
  ) => {
    if (isSubmitting || secondsRemaining <= 0) return;

    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));

    setSavingStatus('saving');

    const savePromise = (async () => {
      try {
        const res = await fetch('/api/quiz/answer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            participantId: participant.id,
            questionId,
            selectedOption: optionId,
          }),
        });

        const data = await res.json();

        if (data.success) {
          setSavingStatus('saved');

          setTimeout(() => {
            setSavingStatus('idle');
          }, 1800);

          return true;
        }

        setSavingStatus('idle');
        return false;
      } catch (err) {
        console.error('Autosave error:', err);
        setSavingStatus('idle');
        return false;
      }
    })();

    savePromiseRef.current = savePromise;

    await savePromise;

    if (savePromiseRef.current === savePromise) {
      savePromiseRef.current = null;
    }
  };

  // =========================================================
  // CLEAR ANSWER
  // =========================================================

  const handleClearOption = async (questionId: string) => {
    setSelectedAnswers((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });

    setSavingStatus('saving');

    const savePromise = (async () => {
      try {
        const res = await fetch('/api/quiz/answer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            participantId: participant.id,
            questionId,
            selectedOption: '',
          }),
        });

        const data = await res.json();

        if (data.success) {
          setSavingStatus('saved');

          setTimeout(() => {
            setSavingStatus('idle');
          }, 1800);

          return true;
        }

        setSavingStatus('idle');
        return false;
      } catch (err) {
        console.error('Clear option error:', err);
        setSavingStatus('idle');
        return false;
      }
    })();

    savePromiseRef.current = savePromise;

    await savePromise;

    if (savePromiseRef.current === savePromise) {
      savePromiseRef.current = null;
    }
  };

  // =========================================================
  // CURRENT QUESTION
  // =========================================================

  const currentQ = questions[currentQuestionIndex];

  const answeredCount = Object.keys(selectedAnswers).length;

  const currentChosenOption = currentQ
    ? selectedAnswers[currentQ.id]
    : undefined;

  const isPuzzleQuestion = Boolean(
    currentQ && PUZZLE_QUESTIONS[currentQ.id]
  );

  const promptData = currentQ
    ? QUESTION_PROMPTS[currentQ.id]
    : undefined;

  const currentPromptText =
    currentQ?.questionText ||
    promptData?.prompt ||
    currentQ?.title ||
    '';

  const currentPromptDetail = promptData?.detail;

  // =========================================================
  // TIMER DISPLAY
  // =========================================================

  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;

  const isCriticalTime = secondsRemaining <= 180;
  const isWarningTime = secondsRemaining <= 600;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">

      {/* =====================================================
          TOP HEADER
      ===================================================== */}

      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 shadow-md">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">

          {/* Participant */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-600 font-bold text-white flex items-center justify-center text-sm shadow-md">
              {participant.id.slice(-3)}
            </div>

            <div>
              <div className="text-sm font-bold text-white leading-tight">
                {participant.name}
              </div>

              <div className="text-[11px] text-slate-400 font-mono">
                ID: {participant.id}
              </div>
            </div>
          </div>

          {/* Timer / Security */}
          <div className="flex items-center gap-2 sm:gap-4">

            <div
              id="timer-badge"
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-xl border font-mono font-bold text-sm sm:text-base transition-colors ${
                isCriticalTime
                  ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse'
                  : isWarningTime
                  ? 'bg-amber-950/70 border-amber-500 text-amber-300'
                  : 'bg-slate-950 border-cyan-700/60 text-cyan-300'
              }`}
            >
              <Clock className="w-4 h-4" />

              <span>
                {mins < 10 ? '0' : ''}
                {mins}:{secs < 10 ? '0' : ''}
                {secs}
              </span>
            </div>

            <div
              id="badge-tab-switches"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                tabSwitchCount > 0
                  ? 'bg-amber-950/50 border-amber-700 text-amber-300'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />

              <span>
                Tab Switches:{' '}
                <strong>{tabSwitchCount}</strong>
              </span>
            </div>

            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-xl">
              <span>Answered:</span>

              <strong className="text-cyan-400">
                {answeredCount}/{totalQuestions}
              </strong>
            </div>
          </div>

          {/* Submit */}
          <button
            id="btn-open-submit-modal"
            type="button"
            onClick={() => setShowSubmitModal(true)}
            className="flex items-center gap-2 px-4 py-1.5 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl shadow-md transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Quiz</span>
          </button>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="max-w-6xl mx-auto w-full flex-1 p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* LEFT */}
        <section className="lg:col-span-8 space-y-5">

          {/* Question */}
          <div
            id="card-question-container"
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 md:p-7 shadow-xl backdrop-blur-sm"
          >

            <div className="flex items-center justify-between pb-4 border-b border-slate-800">

              <div className="flex items-center gap-3">

                <span className="px-3 py-1 bg-cyan-950 text-cyan-400 font-mono font-bold text-xs rounded-lg border border-cyan-800">
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </span>

                <span className="text-xs text-slate-400 font-medium">
                  Marks:{' '}
                  <strong className="text-white">5</strong>
                </span>

                {isPuzzleQuestion && (
                  <span className="px-2.5 py-0.5 bg-amber-950/60 text-amber-300 border border-amber-800/80 rounded-md text-[11px] font-medium">
                    Code Assembly Challenge
                  </span>
                )}
              </div>

              {/* Save status */}
              <div className="text-xs flex items-center gap-1.5 font-medium">

                {savingStatus === 'saving' && (
                  <span className="text-amber-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                    Saving answer...
                  </span>
                )}

                {savingStatus === 'saved' && (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Answer saved
                  </span>
                )}

                {savingStatus === 'idle' && currentChosenOption && (
                  <span className="text-slate-500 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Saved
                  </span>
                )}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-3 pt-2">

              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                {currentQ.title}
              </h2>

              {/* Prompt */}
              <div className="p-4 rounded-xl bg-slate-950/90 border border-cyan-900/60 shadow-inner">

                <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 mb-1.5 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Question:</span>
                </div>

                <p className="text-slate-100 text-sm sm:text-base font-semibold leading-relaxed">
                  {currentPromptText}
                </p>

                {currentPromptDetail && (
                  <p className="text-xs text-slate-400 mt-1.5 font-normal">
                    {currentPromptDetail}
                  </p>
                )}
              </div>
            </div>

            {/* Image */}
            <div className="mt-4 relative bg-slate-950 rounded-xl border border-slate-800 overflow-hidden group">

              <img
                src={currentQ.imagePath}
                alt={`Question ${currentQuestionIndex + 1}`}
                className="w-full h-auto object-contain max-h-[440px] mx-auto select-none"
                loading="eager"
              />

              <button
                type="button"
                onClick={() => setZoomImage(currentQ.imagePath)}
                className="absolute top-3 right-3 bg-slate-900/80 hover:bg-slate-900 text-slate-300 hover:text-white p-2 rounded-lg border border-slate-700 backdrop-blur-sm transition-all opacity-90 group-hover:opacity-100 flex items-center gap-1 text-xs shadow-md cursor-pointer"
                title="Expand image"
              >
                <ZoomIn className="w-4 h-4" />
                <span>Zoom</span>
              </button>
            </div>
          </div>

          {/* =================================================
              PUZZLE / OPTIONS
          ================================================= */}

          {isPuzzleQuestion ? (

            <div
              id="card-puzzle-container"
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 md:p-7 shadow-xl backdrop-blur-sm"
            >

              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">

                <div className="flex items-center gap-2.5">

                  <div className="w-7 h-7 rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-800/50 flex items-center justify-center font-bold text-xs">
                    D&amp;D
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Drag &amp; Drop Workspace
                    </h3>

                    <p className="text-xs text-slate-400">
                      Arrange the 9 code pieces in sequence to answer Question{' '}
                      {currentQuestionIndex + 1}
                    </p>
                  </div>
                </div>

                {currentChosenOption && (
                  <div className="flex items-center gap-2">

                    <span className="px-2.5 py-1 rounded-lg bg-emerald-950/70 border border-emerald-700/80 text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Sequence Saved
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        handleClearOption(currentQ.id)
                      }
                      className="text-xs text-slate-400 hover:text-rose-400 transition-colors px-2 py-1 hover:bg-slate-800 rounded-md flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Clear
                    </button>
                  </div>
                )}
              </div>

              <DragDropPuzzleBoard
                key={currentQ.id}
                questionId={currentQ.id}
                options={currentQ.options}
                selectedOption={currentChosenOption || null}
                onSelectOption={(optId) =>
                  handleSelectOption(currentQ.id, optId)
                }
                onClearOption={() =>
                  handleClearOption(currentQ.id)
                }
              />
            </div>

          ) : (

            <div
              id="card-answer-container"
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 md:p-7 shadow-xl backdrop-blur-sm"
            >

              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-800">

                <div className="flex items-center gap-2.5">

                  <div className="w-7 h-7 rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-800/50 flex items-center justify-center font-bold text-xs">
                    A
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Answer Options
                    </h3>

                    <p className="text-xs text-slate-400">
                      Select your final answer for Question{' '}
                      {currentQuestionIndex + 1}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">

                  {currentChosenOption ? (
                    <>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-950/70 border border-emerald-700/80 text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Selected: Option {currentChosenOption}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          handleClearOption(currentQ.id)
                        }
                        className="text-xs text-slate-400 hover:text-rose-400 transition-colors px-2 py-1 hover:bg-slate-800 rounded-md flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Clear
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-slate-500 font-mono">
                      No option selected
                    </span>
                  )}
                </div>
              </div>

              {/* Options */}
              <div className="mt-5 space-y-3">

                {currentQ.options.map((opt) => {

                  const isSelected =
                    currentChosenOption === opt.id;

                  return (
                    <button
                      key={opt.id}
                      id={`btn-option-${currentQ.id}-${opt.id.toLowerCase()}`}
                      type="button"
                      onClick={() =>
                        handleSelectOption(
                          currentQ.id,
                          opt.id
                        )
                      }
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 select-none cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-950/70 border-cyan-500 shadow-md ring-1 ring-cyan-500/50 text-white'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 text-slate-300'
                      }`}
                    >

                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 transition-all ${
                          isSelected
                            ? 'bg-cyan-500 text-slate-950 shadow-sm font-black'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {opt.id}
                      </div>

                      <div className="flex-1 text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-line font-mono sm:font-sans pt-1">
                        {opt.text}
                      </div>

                      {isSelected && (
                        <div className="text-cyan-400 p-1 flex-shrink-0">
                          <CheckCircle2 className="w-5 h-5 fill-cyan-950" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* =================================================
              PREVIOUS / NEXT
          ================================================= */}

          <div
            id="nav-question-controls"
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-sm flex items-center justify-between"
          >

            {/* Previous */}
            <button
              id="btn-prev-question"
              type="button"
              disabled={
                currentQuestionIndex === 0 ||
                savingStatus === 'saving' ||
                isNavigating
              }
              onClick={async () => {
                if (savePromiseRef.current) {
                  await savePromiseRef.current;
                }

                setCurrentQuestionIndex((prev) =>
                  Math.max(0, prev - 1)
                );
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Question</span>
            </button>

            {/* Counter */}
            <span className="text-xs font-mono text-slate-400">
              Question{' '}
              <strong className="text-white">
                {currentQuestionIndex + 1}
              </strong>{' '}
              of {totalQuestions}
            </span>

            {/* Next */}
            <button
              id="btn-next-question"
              type="button"
              disabled={
                savingStatus === 'saving' ||
                isNavigating
              }
              onClick={async () => {

                setIsNavigating(true);

                if (savePromiseRef.current) {
                  await savePromiseRef.current;
                }

                // Q10
                if (
                  currentQuestionIndex ===
                  totalQuestions - 1
                ) {
                  setShowSubmitModal(true);
                  setIsNavigating(false);
                  return;
                }

                // Move exactly one question forward
                setCurrentQuestionIndex((prev) =>
                  Math.min(
                    totalQuestions - 1,
                    prev + 1
                  )
                );

                setIsNavigating(false);
              }}
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl shadow transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>
                {currentQuestionIndex ===
                totalQuestions - 1
                  ? 'Review & Submit'
                  : 'Next Question'}
              </span>

              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* =====================================================
            RIGHT SIDE
        ===================================================== */}

        <aside className="lg:col-span-4 space-y-4">

          {/* Question Navigation */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm">

            <h3 className="text-sm font-bold text-white mb-1">
              Question Navigation
            </h3>

            <p className="text-xs text-slate-400 mb-4">
              Use Next Question to move forward. Previous questions can be reviewed.
            </p>

            <div className="grid grid-cols-5 gap-2.5">

              {questions.map((q, idx) => {

                const isCurrent =
                  idx === currentQuestionIndex;

                const isAnswered =
                  Boolean(selectedAnswers[q.id]);

                // IMPORTANT:
                // Future questions cannot be clicked.
                const isFutureQuestion =
                  idx > currentQuestionIndex;

                return (
                  <button
                    key={q.id}
                    id={`btn-nav-question-${idx + 1}`}
                    type="button"
                    disabled={isFutureQuestion}
                    onClick={async () => {

                      if (isFutureQuestion) return;

                      if (savePromiseRef.current) {
                        await savePromiseRef.current;
                      }

                      setCurrentQuestionIndex(idx);
                    }}
                    className={`h-11 rounded-xl font-mono text-xs font-bold transition-all relative flex flex-col items-center justify-center border ${
                      isCurrent
                        ? 'border-cyan-400 ring-2 ring-cyan-500/50 bg-cyan-950 text-cyan-200'
                        : isAnswered
                        ? 'border-emerald-600/80 bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/50'
                        : isFutureQuestion
                        ? 'border-slate-900 bg-slate-950/40 text-slate-700 cursor-not-allowed opacity-50'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <span>Q{idx + 1}</span>

                    {isAnswered && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-0.5"></span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-5 pt-4 border-t border-slate-800 grid grid-cols-2 gap-2 text-[11px] text-slate-400">

              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-emerald-950 border border-emerald-600 flex items-center justify-center text-[8px] text-emerald-400">
                  ✓
                </span>

                <span>
                  Answered ({answeredCount})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-slate-950 border border-slate-800"></span>

                <span>
                  Unanswered ({totalQuestions - answeredCount})
                </span>
              </div>
            </div>
          </div>

          {/* Proctoring */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 text-xs text-slate-400 space-y-2.5">

            <div className="text-slate-300 font-semibold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              Proctoring Active
            </div>

            <p>
              Your session is protected. Tab-switch counter persists across browser reloads.
            </p>

            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-400 flex items-center justify-between">

              <span>Tab Switches Recorded:</span>

              <span className="font-bold text-amber-400">
                {tabSwitchCount}
              </span>
            </div>
          </div>
        </aside>
      </main>

      {/* =====================================================
          TAB SWITCH WARNING
      ===================================================== */}

      {showWarningModal && (
        <div
          id="modal-tab-switch-warning"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <div className="bg-slate-900 border-2 border-amber-500/80 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">

            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">

              <h3 className="text-lg font-bold text-white tracking-tight">
                Warning: Leaving the quiz page has been detected.
              </h3>

              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                You switched tabs, minimized the browser, or navigated away from the active quiz.
                This event has been recorded in your examination logs.
              </p>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center font-mono text-xs text-slate-300">
              Total Recorded Violations:{' '}
              <strong className="text-amber-400 text-sm">
                {tabSwitchCount}
              </strong>
            </div>

            <button
              id="btn-dismiss-tab-warning"
              type="button"
              onClick={() =>
                setShowWarningModal(false)
              }
              className="w-full bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors"
            >
              I Understand &amp; Resume Quiz
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          SUBMIT CONFIRMATION
      ===================================================== */}

      {showSubmitModal && (
        <div
          id="modal-confirm-submit"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">

            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto">
              <Send className="w-6 h-6" />
            </div>

            <div className="text-center">

              <h3 className="text-lg font-bold text-white tracking-tight">
                Ready to Submit Quiz?
              </h3>

              <p className="text-xs text-slate-400 mt-1">
                Please review your progress before final submission.
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">

              <div className="flex justify-between text-slate-300">
                <span>Total Questions:</span>

                <span className="font-bold text-white">
                  {totalQuestions}
                </span>
              </div>

              <div className="flex justify-between text-emerald-400">
                <span>Answered:</span>

                <span className="font-bold">
                  {answeredCount}
                </span>
              </div>

              <div className="flex justify-between text-amber-400">
                <span>Unanswered:</span>

                <span className="font-bold">
                  {totalQuestions - answeredCount}
                </span>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>Time Remaining:</span>

                <span className="font-mono font-bold text-cyan-300">
                  {mins}:{secs < 10 ? '0' : ''}
                  {secs}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center leading-relaxed">
              Once submitted, you will not be able to change your answers.
            </p>

            <div className="flex gap-3 pt-2">

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() =>
                  setShowSubmitModal(false)
                }
                className="flex-1 py-2.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
              >
                Cancel &amp; Review
              </button>

              <button
                id="btn-confirm-final-submit"
                type="button"
                disabled={isSubmitting}
                onClick={() =>
                  handleFinalSubmit(false)
                }
                className="flex-1 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl shadow-lg transition-all disabled:opacity-50"
              >
                {isSubmitting
                  ? 'Submitting...'
                  : 'Yes, Submit Test'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          ZOOM IMAGE
      ===================================================== */}

      {zoomImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setZoomImage(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-slate-950 p-2 rounded-2xl border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              type="button"
              onClick={() => setZoomImage(null)}
              className="absolute top-4 right-4 bg-slate-900/90 text-white p-2 rounded-full border border-slate-700 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <img
              src={zoomImage}
              alt="Expanded Question"
              className="w-full h-auto max-h-[85vh] object-contain rounded-xl select-none"
            />
          </div>
        </div>
      )}
    </div>
  );
};