import React, { useState } from 'react';
import { UserCheck, ArrowRight, ShieldAlert, FileText, Clock, Award, KeyRound, Eye, EyeOff } from 'lucide-react';
import { ParticipantSession, QuizState } from '../types';

interface ParticipantLoginProps {
  onLoginSuccess: (participant: ParticipantSession, state: QuizState) => void;
  onNavigateToAdmin?: () => void;
}

export const ParticipantLogin: React.FC<ParticipantLoginProps> = ({
  onLoginSuccess,
  onNavigateToAdmin,
}) => {
  const [participantId, setParticipantId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!participantId.trim()) {
      setError('Please enter your Assigned Participant ID (e.g. ZENTRIX001).');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your Password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId: participantId.trim().toUpperCase(),
          password: password.trim(),
        }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        throw new Error(`Server connection error (${res.status}). Please verify API endpoint.`);
      }

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Authentication failed');
      }

      onLoginSuccess(data.participant, data.state);
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 md:p-8">
      {/* Top Brand Header */}
      <header className="max-w-xl mx-auto w-full flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-600 flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-900/30 text-lg">
            Q
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Quiz Assessment Platform</h1>
            <p className="text-xs text-slate-400">Candidate Examination Portal</p>
          </div>
        </div>
      </header>

      {/* Main Login Card - Single Centered Screen */}
      <main className="max-w-md mx-auto w-full my-auto py-8">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl backdrop-blur-sm">
          <div className="mb-6 text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 mb-3 shadow-inner">
              <UserCheck className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Participant Login</h2>
            <p className="text-sm text-slate-400 mt-1">
              Enter your Participant Details and Password to begin the assessment.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-sm flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="input-participant-id" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Participant ID <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="input-participant-id"
                  type="text"
                  value={participantId}
                  onChange={(e) => setParticipantId(e.target.value)}
                  placeholder="e.g. ZENTRIX001"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl py-2.5 px-3.5 text-sm text-white placeholder-slate-500 font-mono transition-colors uppercase"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label htmlFor="input-participant-password" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Password <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="input-participant-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter assigned password"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl py-2.5 pl-3.5 pr-10 text-sm text-white placeholder-slate-500 font-mono transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="btn-login-submit"
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-cyan-900/40 flex items-center justify-center gap-2 text-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span>Starting Session...</span>
              ) : (
                <>
                  <span>Enter Assessment</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Assessment Summary Badges */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-xs text-slate-400">
            <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
              <Clock className="w-3.5 h-3.5 mx-auto mb-1 text-cyan-400" />
              <span className="block font-semibold text-slate-200">35 Min</span>
              <span className="text-[10px] text-slate-500">Duration</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
              <FileText className="w-3.5 h-3.5 mx-auto mb-1 text-cyan-400" />
              <span className="block font-semibold text-slate-200">10 Questions</span>
              <span className="text-[10px] text-slate-500">Questions</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
              <Award className="w-3.5 h-3.5 mx-auto mb-1 text-cyan-400" />
              <span className="block font-semibold text-slate-200">50 Marks</span>
              <span className="text-[10px] text-slate-500">5 Marks Each</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-xl mx-auto w-full pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
        <div>Assessment Examination Terminal &copy; 2026</div>
        {onNavigateToAdmin && (
          <button
            type="button"
            onClick={onNavigateToAdmin}
            className="text-slate-400 hover:text-cyan-400 text-xs transition-colors cursor-pointer flex items-center gap-1 font-mono"
          >
            Admin Portal &rarr;
          </button>
        )}
      </footer>
    </div>
  );
};
