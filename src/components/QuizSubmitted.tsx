import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Award,
  LogOut,
  ChevronDown,
  ChevronUp,
  ZoomIn,
  X,
  FileText,
  Check,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { ParticipantSession, QuizSubmissionResult, QuestionReviewItem } from '../types';

interface QuizSubmittedProps {
  participant: ParticipantSession;
  status: string;
  timeTakenFormatted: string;
  onLogout: () => void;
  initialResult?: QuizSubmissionResult | null;
}

export const QuizSubmitted: React.FC<QuizSubmittedProps> = ({
  participant,
  status,
  timeTakenFormatted,
  onLogout,
  initialResult = null,
}) => {
  const [result, setResult] = useState<QuizSubmissionResult | null>(initialResult);
  const [loading, setLoading] = useState<boolean>(!initialResult);
  const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect'>('all');
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});
  const [modalImage, setModalImage] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    if (initialResult) {
      setResult(initialResult);
      setLoading(false);
      return;
    }

    let isMounted = true;
    const fetchResult = async () => {
      try {
        const res = await fetch(`/api/quiz/result?participantId=${encodeURIComponent(participant.id)}`);
        const data = await res.json();
        if (isMounted && data.success && data.result) {
          setResult(data.result);
        }
      } catch (err) {
        console.error('Failed to load quiz results:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchResult();
    return () => {
      isMounted = false;
    };
  }, [participant.id, initialResult]);

  const toggleExpand = (questionId: string) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const expandAll = () => {
    if (!result) return;
    const all: Record<string, boolean> = {};
    result.reviews.forEach((r) => {
      all[r.questionId] = true;
    });
    setExpandedQuestions(all);
  };

  const collapseAll = () => {
    setExpandedQuestions({});
  };

  const isTimeExpired = status === 'time_expired' || result?.status === 'time_expired';

  const filteredReviews = result?.reviews.filter((r) => {
    if (filter === 'correct') return r.isCorrect;
    if (filter === 'incorrect') return !r.isCorrect;
    return true;
  }) || [];

  const getGradeTitle = (pct: number) => {
    if (pct >= 90) return 'Distinction (Mastery)';
    if (pct >= 75) return 'Proficient (High Honors)';
    if (pct >= 50) return 'Qualified (Passing Grade)';
    return 'Candidate Review Required';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 md:p-8">
      {/* Top Navigation Bar */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-600 flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-900/30 text-base">
            Q
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Assessment Evaluation Portal</h1>
            <p className="text-xs text-slate-400">Official Result Calculation &amp; Answer Review</p>
          </div>
        </div>

        <button
          id="btn-submitted-logout"
          onClick={onLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit / Logout</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto w-full my-6 space-y-6">
        {/* Candidate & Completion Hero Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner shadow-emerald-500/20 flex-shrink-0">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                    Assessment Completed
                  </h2>
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                      isTimeExpired
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {isTimeExpired ? 'Time Expired' : 'Completed'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Candidate: <span className="text-white font-semibold">{participant.name}</span> &bull; ID:{' '}
                  <span className="font-mono text-cyan-300 font-semibold">{participant.id}</span>
                </p>
              </div>
            </div>

            {/* Overall Score Pill */}
            {result && (
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl px-5 py-3.5 text-right flex flex-col items-end shadow-md">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Calculated Points
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-3xl font-black text-white font-mono tracking-tight">
                    {result.score}
                  </span>
                  <span className="text-sm font-semibold text-slate-400 font-mono">
                    / {result.totalMarks} pts
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-emerald-400 mt-0.5 flex items-center gap-1 font-mono">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  {result.percentage}% ({getGradeTitle(result.percentage)})
                </span>
              </div>
            )}
          </div>

          {/* 4 Core Result Metrics Grid */}
          {result && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
              {/* Metric 1: Total Points */}
              <div
                id="metric-points"
                className="bg-slate-950/60 border border-slate-800/90 rounded-2xl p-4 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Total Score</span>
                  <Award className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="my-2">
                  <div className="text-2xl font-black text-white font-mono">{result.score} / {result.totalMarks}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {result.correctCount} of {result.totalQuestions} questions correct
                  </div>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(4, result.percentage)}%` }}
                  />
                </div>
              </div>

              {/* Metric 2: Time Taken */}
              <div
                id="metric-time"
                className="bg-slate-950/60 border border-slate-800/90 rounded-2xl p-4 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Time Taken</span>
                  <Clock className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="my-2">
                  <div className="text-2xl font-black text-emerald-300 font-mono">
                    {result.timeTakenFormatted || timeTakenFormatted || '0 min 00 sec'}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Allocated limit: 35 min 00 sec</div>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {Math.round((result.timeTakenSeconds / (35 * 60)) * 100)}% of time utilized
                </div>
              </div>

              {/* Metric 3: Tab Switches */}
              <div
                id="metric-tab-switches"
                className="bg-slate-950/60 border border-slate-800/90 rounded-2xl p-4 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Tab Switches</span>
                  {result.tabSwitchCount === 0 ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  )}
                </div>
                <div className="my-2">
                  <div
                    className={`text-2xl font-black font-mono ${
                      result.tabSwitchCount === 0 ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {result.tabSwitchCount}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {result.tabSwitchCount === 0
                      ? 'Clean proctoring session'
                      : 'Integrity events logged'}
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block w-fit ${
                    result.tabSwitchCount === 0
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80'
                      : 'bg-amber-950/80 text-amber-300 border border-amber-800/80'
                  }`}
                >
                  {result.tabSwitchCount === 0 ? 'Zero Violations' : `${result.tabSwitchCount} Page Unfocus Events`}
                </span>
              </div>

              {/* Metric 4: Answer Rate */}
              <div
                id="metric-accuracy"
                className="bg-slate-950/60 border border-slate-800/90 rounded-2xl p-4 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Question Breakdown</span>
                  <Layers className="w-4 h-4 text-purple-400" />
                </div>
                <div className="my-2">
                  <div className="text-2xl font-black text-white font-mono">
                    {result.answeredCount} / {result.totalQuestions}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    <span className="text-emerald-400 font-semibold">{result.correctCount} Correct</span> &bull;{' '}
                    <span className="text-rose-400 font-semibold">{result.incorrectCount} Incorrect</span>
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {result.totalQuestions - result.answeredCount === 0
                    ? 'All 10 Questions Answered'
                    : `${result.totalQuestions - result.answeredCount} Skipped`}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Answer Key & Question-by-Question Review */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-sm space-y-6">
          {/* Header Controls: Filters & Expand/Collapse */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                Assessment Question Review &amp; Correct Answers
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Review your submitted answer against the verified answer key and detailed technical explanations.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              {/* Filter Tabs */}
              <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    filter === 'all'
                      ? 'bg-cyan-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All (10)
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('correct')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    filter === 'correct'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Correct ({result?.correctCount ?? 0})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('incorrect')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    filter === 'incorrect'
                      ? 'bg-rose-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Incorrect ({result?.incorrectCount ?? 0})
                </button>
              </div>

              {/* Expand / Collapse All */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={expandAll}
                  className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Expand all explanations"
                >
                  Expand
                </button>
                <button
                  type="button"
                  onClick={collapseAll}
                  className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Collapse all explanations"
                >
                  Collapse
                </button>
              </div>
            </div>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs">Calculating official scores and loading review data...</p>
            </div>
          )}

          {/* Questions List */}
          {!loading && result && (
            <div className="space-y-4">
              {filteredReviews.length === 0 ? (
                <div className="p-8 text-center text-slate-400 border border-dashed border-slate-800 rounded-2xl text-xs">
                  No questions match the selected filter.
                </div>
              ) : (
                filteredReviews.map((item) => {
                  const isExpanded = expandedQuestions[item.questionId] !== false; // default expanded
                  return (
                    <div
                      key={item.questionId}
                      id={`review-question-${item.questionNumber}`}
                      className={`border rounded-2xl overflow-hidden transition-all ${
                        item.isCorrect
                          ? 'bg-slate-950/70 border-emerald-900/60 shadow-sm'
                          : 'bg-slate-950/70 border-rose-900/60 shadow-sm'
                      }`}
                    >
                      {/* Review Card Header */}
                      <div className="p-4 md:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80">
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs font-mono shadow ${
                              item.isCorrect
                                ? 'bg-emerald-500 text-slate-950'
                                : 'bg-rose-500 text-white'
                            }`}
                          >
                            Q{item.questionNumber}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-white tracking-tight">{item.title}</h4>
                              {item.isDragDrop && (
                                <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-mono font-semibold">
                                  Drag &amp; Drop Puzzle
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400">
                              Max Score: {item.maxMarks} Marks &bull; Awarded:{' '}
                              <span
                                className={`font-bold font-mono ${
                                  item.isCorrect ? 'text-emerald-400' : 'text-rose-400'
                                }`}
                              >
                                {item.marksEarned} Marks
                              </span>
                            </span>
                          </div>
                        </div>

                        {/* Status Badges & Toggle Button */}
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                              item.isCorrect
                                ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-700'
                                : 'bg-rose-950/90 text-rose-300 border border-rose-700'
                            }`}
                          >
                            {item.isCorrect ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Correct (+{item.maxMarks})</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                                <span>Incorrect (0/{item.maxMarks})</span>
                              </>
                            )}
                          </span>

                          <button
                            type="button"
                            onClick={() => toggleExpand(item.questionId)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
                            title={isExpanded ? 'Collapse' : 'Expand'}
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Question Body */}
                      <div className="p-4 md:p-5 space-y-4">
                        {/* Question Text */}
                        <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-sans">
                          {item.questionText}
                        </p>

                        {/* Diagram / Code Graphic */}
                        {item.imagePath && (
                          <div className="relative group rounded-xl overflow-hidden border border-slate-800 bg-slate-900/60 max-w-xl">
                            <img
                              src={item.imagePath}
                              alt={`Question ${item.questionNumber} Diagram`}
                              className="w-full h-auto max-h-56 object-contain p-2"
                              loading="lazy"
                            />
                            <button
                              type="button"
                              onClick={() => setModalImage({ url: item.imagePath, title: item.title })}
                              className="absolute top-2 right-2 px-2.5 py-1 text-xs bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg flex items-center gap-1 shadow cursor-pointer transition-opacity opacity-80 group-hover:opacity-100"
                            >
                              <ZoomIn className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Zoom Diagram</span>
                            </button>
                          </div>
                        )}

                        {/* Side-by-Side Answers Comparison */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                          {/* Candidate's Submitted Answer */}
                          <div
                            className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                              item.isCorrect
                                ? 'bg-emerald-950/20 border-emerald-800/60'
                                : 'bg-rose-950/20 border-rose-800/60'
                            }`}
                          >
                            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800/60">
                              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                Your Submitted Response:
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                  item.isCorrect
                                    ? 'bg-emerald-900/60 text-emerald-300'
                                    : 'bg-rose-900/60 text-rose-300'
                                }`}
                              >
                                {item.isCorrect ? 'Matched Key' : 'Incorrect'}
                              </span>
                            </div>
                            <div className="font-mono text-xs text-slate-200 break-words whitespace-pre-wrap leading-snug">
                              {item.isDragDrop ? (
                                <div className="space-y-1">
                                  <span className="text-[10px] text-slate-400 block font-sans">
                                    Assembled Sequence:
                                  </span>
                                  <span
                                    className={`font-bold ${
                                      item.isCorrect ? 'text-emerald-300' : 'text-rose-300'
                                    }`}
                                  >
                                    {item.selectedOptionText}
                                  </span>
                                </div>
                              ) : (
                                <div>
                                  {item.selectedOption ? (
                                    <span>
                                      <strong className="text-cyan-400 font-bold mr-1">
                                        [{item.selectedOption}]
                                      </strong>
                                      {item.selectedOptionText}
                                    </span>
                                  ) : (
                                    <span className="text-slate-500 italic">Not Answered / Skipped</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Verified Correct Answer Key */}
                          <div className="p-3.5 rounded-xl border bg-emerald-950/30 border-emerald-700/80 flex flex-col justify-between shadow-sm">
                            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-emerald-800/60">
                              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" />
                                Verified Correct Answer:
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-900/80 text-emerald-200">
                                Solution Key
                              </span>
                            </div>
                            <div className="font-mono text-xs text-emerald-100 break-words whitespace-pre-wrap leading-snug">
                              {item.isDragDrop ? (
                                <div className="space-y-1">
                                  <span className="text-[10px] text-emerald-300/80 block font-sans">
                                    Correct Sequential Assembly:
                                  </span>
                                  <span className="font-bold text-emerald-200">
                                    {item.correctAnswerText}
                                  </span>
                                </div>
                              ) : (
                                <div>
                                  <strong className="text-emerald-400 font-bold mr-1">
                                    [{item.correctAnswer}]
                                  </strong>
                                  {item.correctAnswerText}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Detailed Technical Explanation Dropdown */}
                        {isExpanded && item.explanation && (
                          <div className="mt-3 p-3.5 bg-slate-900/90 border border-cyan-900/40 rounded-xl space-y-1.5 text-xs text-slate-300">
                            <div className="font-semibold text-cyan-400 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                              Technical Explanation &amp; Solution Logic:
                            </div>
                            <div className="font-sans whitespace-pre-wrap leading-relaxed text-slate-300 pl-1 text-[11px]">
                              {item.explanation}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Assessment results have been securely archived in the institutional database.</span>
            </div>

            <button
              id="btn-return-login-bottom"
              onClick={onLogout}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2.5 px-6 rounded-xl text-xs transition-colors shadow flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out / Return to Assessment Home</span>
            </button>
          </div>
        </div>
      </main>

      {/* Image Zoom Modal */}
      {modalImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setModalImage(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white truncate">{modalImage.title}</h4>
              <button
                type="button"
                onClick={() => setModalImage(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-slate-950 rounded-xl p-2 flex items-center justify-center max-h-[80vh] overflow-auto">
              <img
                src={modalImage.url}
                alt={modalImage.title}
                className="max-w-full max-h-[75vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="max-w-5xl mx-auto w-full pt-6 border-t border-slate-800 text-center text-xs text-slate-400">
        Assessment Security Protocol &bull; Candidate ID: {participant.id} &bull; Proctoring Complete
      </footer>
    </div>
  );
};
