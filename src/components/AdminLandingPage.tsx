import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Lock,
  User,
  KeyRound,
  ArrowLeft,
  AlertCircle,
  LogOut,
  Eye,
  EyeOff,
} from 'lucide-react';
import { AdminView } from './AdminView';

interface AdminLandingPageProps {
  onReturnToParticipant: () => void;
}

interface AdminSession {
  token: string;
  username: string;
  role: string;
}

export const AdminLandingPage: React.FC<AdminLandingPageProps> = ({
  onReturnToParticipant,
}) => {
  const [adminSession, setAdminSession] = useState<AdminSession | null>(() => {
    try {
      const saved = sessionStorage.getItem('assessment_admin_session');

      if (!saved) {
        return null;
      }

      const parsed = JSON.parse(saved);

      if (parsed?.token && parsed?.username) {
        return parsed;
      }

      return null;
    } catch {
      return null;
    }
  });

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (adminSession?.token) {
      sessionStorage.setItem(
        'assessment_admin_session',
        JSON.stringify(adminSession)
      );
    }
  }, [adminSession]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      let data: any = null;
      try {
        data = await response.json();
      } catch {
        throw new Error(`Server connection error (${response.status}). Please try again.`);
      }

      if (!response.ok || !data?.success || !data?.token) {
        throw new Error(
          data?.error || 'Invalid administrator username or password.'
        );
      }

      const session: AdminSession = {
        token: data.token,
        username: data.admin?.username || username.trim(),
        role: data.admin?.role || 'Administrator',
      };

      sessionStorage.setItem(
        'assessment_admin_session',
        JSON.stringify(session)
      );

      setAdminSession(session);
      setUsername('');
      setPassword('');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to login as administrator.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    const savedSession = adminSession;

    try {
      if (savedSession?.token) {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${savedSession.token}`,
          },
        });
      }
    } catch {
      // Even if the server logout request fails,
      // clear the local session.
    }

    sessionStorage.removeItem('assessment_admin_session');

    setAdminSession(null);
    setUsername('');
    setPassword('');
    setError(null);
  };

  /*
   * Authenticated Administrator Dashboard
   *
   * There is intentionally NO fake administrator profile here.
   */
  if (adminSession) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        {/* Simple Administrator Header */}
        <header className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-4 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>

              <div>
                <h1 className="text-base sm:text-lg font-bold text-white">
                  Administrator Console
                </h1>

                <p className="text-xs text-slate-400">
                  Signed in as {adminSession.username}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSignOut}
                className="px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>

              <button
                type="button"
                onClick={onReturnToParticipant}
                className="px-3 py-2 text-xs font-semibold text-cyan-300 hover:text-cyan-200 bg-cyan-950/80 hover:bg-cyan-900/80 border border-cyan-800 rounded-xl transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Participant Portal</span>
              </button>
            </div>
          </div>
        </header>

        {/* Administrator Dashboard */}
        <main className="flex-1">
          <AdminView onBackToParticipant={onReturnToParticipant} />
        </main>
      </div>
    );
  }

  /*
   * Administrator Login Page
   *
   * This page intentionally contains only the login interface.
   * No fake person/profile/security information is displayed.
   */
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-900/40 border border-cyan-500/30">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>

            <div>
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Examination Proctoring Authority
              </h1>

              <p className="text-[11px] text-slate-400">
                Authorized Administrator &amp; Staff Assessment Portal
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onReturnToParticipant}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Candidate Portal</span>
          </button>
        </div>
      </header>

      {/* Login Area */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
            {/* Login Heading */}
            <div className="text-center mb-7">
              <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-cyan-950 border border-cyan-800 flex items-center justify-center">
                <Lock className="w-6 h-6 text-cyan-400" />
              </div>

              <h2 className="text-2xl font-bold text-white tracking-tight">
                Admin Login
              </h2>

              <p className="text-xs text-slate-400 mt-2">
                Sign in to access the administrator assessment dashboard.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-5 p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Username */}
              <div>
                <label
                  htmlFor="admin-username-input"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2"
                >
                  Admin Username
                </label>

                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />

                  <input
                    type="text"
                    id="admin-username-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter admin username"
                    autoComplete="username"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="admin-password-input"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2"
                >
                  Admin Password
                </label>

                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />

                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="admin-password-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    autoComplete="current-password"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all font-mono"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                id="btn-admin-sign-in"
                disabled={loading}
                className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-cyan-950 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span>Signing in...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Login as Administrator</span>
                  </>
                )}
              </button>
            </form>

            {/* Back to Participant */}
            <button
              type="button"
              onClick={onReturnToParticipant}
              className="w-full mt-4 py-2.5 px-4 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              ← Back to Participant Login
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-4 px-6 text-center text-xs text-slate-600">
        Examination Proctoring Authority • Administrator Portal
      </footer>
    </div>
  );
};