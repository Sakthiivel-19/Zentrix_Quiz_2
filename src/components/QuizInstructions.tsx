import React from 'react';
import { Clock, AlertTriangle, CheckCircle2, Shield, Play, LogOut } from 'lucide-react';
import { ParticipantSession, QuizState } from '../types';

interface QuizInstructionsProps {
  participant: ParticipantSession;
  quizState: QuizState;
  onStartQuiz: () => void;
  onLogout: () => void;
  loading: boolean;
}

export const QuizInstructions: React.FC<QuizInstructionsProps> = ({
  participant,
  quizState,
  onStartQuiz,
  onLogout,
  loading,
}) => {
  const isAlreadyInProgress = quizState.status === 'in_progress';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 md:p-8">
      {/* Top Bar */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-600 flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-900/30">
            Q
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Assessment Guidelines & Instructions</h1>
            <p className="text-xs text-slate-400">Candidate verification complete</p>
          </div>
        </div>

        <button
          id="btn-instructions-logout"
          onClick={onLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Logout
        </button>
      </header>

      {/* Main Instructions Card */}
      <main className="max-w-4xl mx-auto w-full my-auto py-8">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 md:p-10 shadow-2xl backdrop-blur-sm">
          {/* Welcome Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                Registered Candidate
              </span>
              <h2 className="text-2xl font-bold text-white mt-0.5">{participant.name}</h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">Participant ID: {participant.id}</p>
            </div>

            <div className="flex items-center gap-3 bg-slate-950/70 border border-slate-800 px-4 py-2.5 rounded-xl">
              <Clock className="w-5 h-5 text-cyan-400" />
              <div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider">Duration</div>
                <div className="text-sm font-bold text-white font-mono">35 Minutes</div>
              </div>
            </div>
          </div>

          {/* Key Assessment Rules */}
          <div className="mt-8 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-400" />
              Important Examination Guidelines
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">10 Questions & 50 Total Marks</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Each correct question awards <strong>5 marks</strong>. No negative marks for incorrect or unattempted questions.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
                <Clock className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">Continuous 35-Minute Timer</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    The timer runs continuously on the server once started. Refreshing or reopening the tab does not pause or reset the timer.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">Strict Tab-Switch Monitoring</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Leaving the quiz tab, switching applications, or minimizing the browser window is actively logged and counted on your record.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">Real-Time Answer Autosave</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Every option you click is immediately saved to the server. You can freely navigate between questions before submitting.
                  </p>
                </div>
              </div>
            </div>

            {/* Note on Timer Expiry */}
            <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-900/50 text-xs text-cyan-200/90 leading-relaxed">
              <strong>Notice:</strong> When the 35-minute timer expires, your test will automatically lock and submit your answers to the evaluation system.
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-400">
              {isAlreadyInProgress ? (
                <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                  Assessment is already in progress. Timer is actively running.
                </span>
              ) : (
                <span>Clicking Start Quiz will immediately begin your 35-minute countdown.</span>
              )}
            </div>

            <button
              id="btn-start-quiz"
              onClick={onStartQuiz}
              disabled={loading}
              className="w-full sm:w-auto min-w-[200px] bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-cyan-900/40 flex items-center justify-center gap-2 text-sm transition-all disabled:opacity-50"
            >
              {loading ? (
                <span>Initializing Quiz...</span>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>{isAlreadyInProgress ? 'Resume Active Quiz' : 'Start Quiz Now'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full pt-6 border-t border-slate-800 text-center text-xs text-slate-400">
        Assessment Security Protocol v3.2 &bull; 16 Registered Candidates
      </footer>
    </div>
  );
};
