import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  CheckCircle,
  Clock,
  RefreshCw,
  Search,
  Eye,
  RotateCcw,
  LogOut,
  AlertTriangle,
  Award,
  Calendar,
  X,
} from 'lucide-react';
import { AdminDashboardData, AdminParticipantRow } from '../types';

interface AdminViewProps {
  onBackToParticipant: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  onBackToParticipant,
}) => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedParticipant, setSelectedParticipant] =
    useState<AdminParticipantRow | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  /*
   * Get the currently logged-in administrator token.
   */
  const getAdminToken = (): string => {
    try {
      const session = JSON.parse(
        sessionStorage.getItem('assessment_admin_session') || '{}'
      );

      return session?.token || '';
    } catch {
      return '';
    }
  };

  /*
   * Load administrator dashboard data.
   */
  const fetchAdminData = async () => {
    try {
      const token = getAdminToken();

      if (!token) {
        throw new Error(
          'Administrator session expired. Please log in again.'
        );
      }

      const res = await fetch('/api/admin/dashboard', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(
          json.error ||
            json.message ||
            'Failed to load administrator dashboard.'
        );
      }

      setData(json);
      setError(null);
    } catch (err: any) {
      console.error('Admin dashboard error:', err);
      setError(
        err?.message || 'Error fetching administrator dashboard.'
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * Initial dashboard load.
   */
  useEffect(() => {
    fetchAdminData();
  }, []);

  /*
   * Automatic dashboard refresh.
   */
  useEffect(() => {
    if (!autoRefresh) {
      return;
    }

    const interval = setInterval(() => {
      fetchAdminData();
    }, 3000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  /*
   * Reset one participant.
   */
  const handleResetParticipant = async (participantId: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to reset participant ${participantId}?\n\n` +
        `This will clear their answers, score, timer, and tab-switch records.`
    );

    if (!confirmed) {
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      const token = getAdminToken();

      if (!token) {
        throw new Error(
          'Administrator session expired. Please log in again.'
        );
      }

      const res = await fetch('/api/admin/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          participantId,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(
          json.error ||
            json.message ||
            'Failed to reset participant.'
        );
      }

      if (
        selectedParticipant?.participantId === participantId
      ) {
        setSelectedParticipant(null);
      }

      await fetchAdminData();

      window.alert(
        `Participant ${participantId} has been reset successfully.`
      );
    } catch (err: any) {
      console.error('Reset participant error:', err);

      const message =
        err?.message || 'Failed to reset participant.';

      setError(message);
      window.alert(`Failed to reset participant:\n\n${message}`);
    } finally {
      setActionLoading(false);
    }
  };

  /*
   * Reset ALL currently active participant sessions.
   */
  const handleResetAll = async () => {
    const totalParticipants =
      data?.summary?.totalParticipants ?? 0;

    if (totalParticipants === 0) {
      window.alert(
        'There are currently no participant sessions to reset.'
      );
      return;
    }

    const confirmed = window.confirm(
      `CAUTION\n\n` +
        `Are you sure you want to reset ALL ${totalParticipants} current participant session(s)?\n\n` +
        `This will permanently clear:\n` +
        `• All answers\n` +
        `• All scores\n` +
        `• All timers\n` +
        `• All tab-switch records\n` +
        `• All active quiz sessions\n\n` +
        `Real participants can log in and create new sessions afterward.`
    );

    if (!confirmed) {
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      const token = getAdminToken();

      if (!token) {
        throw new Error(
          'Administrator session expired. Please log in again.'
        );
      }

      const res = await fetch('/api/admin/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          resetAll: true,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(
          json.error ||
            json.message ||
            'Failed to reset all participant sessions.'
        );
      }

      setSelectedParticipant(null);

      /*
       * Immediately reload the dashboard.
       * After resetAll(), the backend should return zero sessions.
       */
      await fetchAdminData();

      window.alert(
        `All participant sessions have been reset successfully.\n\n` +
          `Reset count: ${json.resetCount ?? totalParticipants}`
      );
    } catch (err: any) {
      console.error('Reset all error:', err);

      const message =
        err?.message ||
        'Failed to reset all participant sessions.';

      setError(message);
      window.alert(
        `Failed to reset all participant sessions:\n\n${message}`
      );
    } finally {
      setActionLoading(false);
    }
  };

  /*
   * Search and status filtering.
   */
  const filteredLeaderboard = (
    data?.leaderboard || []
  ).filter((row) => {
    const query = searchQuery.toLowerCase().trim();

    const matchesSearch =
      row.name.toLowerCase().includes(query) ||
      row.participantId.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === 'all' ||
      row.statusCode === statusFilter;

    return matchesSearch && matchesStatus;
  });

  /*
   * Selected participant answer details.
   */
  const participantAnswers = (
    data?.answers || []
  ).filter(
    (a) =>
      a.participant_id ===
      selectedParticipant?.participantId
  );

  /*
   * Selected participant tab-switch details.
   */
  const participantTabSwitches = (
    data?.tabSwitches || []
  ).filter(
    (ts) =>
      ts.participant_id ===
      selectedParticipant?.participantId
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col p-4 md:p-8">
      {/* =========================================================
          ADMIN HEADER
      ========================================================= */}
      <header className="max-w-7xl mx-auto w-full flex flex-wrap items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-950/40">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Administrator Assessment Dashboard

              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-indigo-950 text-indigo-300 border border-indigo-800">
                Authorized Session
              </span>
            </h1>

            <p className="text-xs text-slate-400">
              Live Cohort Monitoring, Real-Time Tab Switches &
              Automated Evaluation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Auto Refresh */}
          <button
            id="btn-toggle-autorefresh"
            type="button"
            onClick={() => setAutoRefresh((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
              autoRefresh
                ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                autoRefresh ? 'animate-spin' : ''
              }`}
            />

            <span>
              Auto-Refresh {autoRefresh ? 'ON (3s)' : 'OFF'}
            </span>
          </button>

          {/* Manual Refresh */}
          <button
            id="btn-admin-refresh"
            type="button"
            onClick={fetchAdminData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          {/* Reset All */}
          <button
            id="btn-reset-all"
            type="button"
            disabled={actionLoading || loading}
            onClick={handleResetAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/50 hover:bg-rose-900/80 border border-rose-800/80 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw
              className={`w-3.5 h-3.5 ${
                actionLoading ? 'animate-spin' : ''
              }`}
            />

            <span>
              {actionLoading ? 'Resetting...' : 'Reset All'}
            </span>
          </button>

          {/* Participant View */}
          <button
            id="btn-back-participant"
            type="button"
            onClick={onBackToParticipant}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Participant View</span>
          </button>
        </div>
      </header>

      {/* =========================================================
          MAIN CONTENT
      ========================================================= */}
      <main className="max-w-7xl mx-auto w-full my-6 flex-1 space-y-6">
        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError(null)}
              className="ml-auto text-rose-400 hover:text-white"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* =========================================================
            SUMMARY CARDS
        ========================================================= */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* Total */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Total Participants</span>
              <Users className="w-4 h-4 text-cyan-400" />
            </div>

            <div className="text-2xl font-bold text-white font-mono mt-2">
              {data?.summary?.totalParticipants ?? 0}
            </div>

            <div className="text-[11px] text-slate-500 mt-1">
              Active / recorded sessions
            </div>
          </div>

          {/* Completed */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Completed</span>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </div>

            <div className="text-2xl font-bold text-emerald-400 font-mono mt-2">
              {data?.summary?.completed ?? 0}
            </div>

            <div className="text-[11px] text-slate-500 mt-1">
              Submitted & Evaluated
            </div>
          </div>

          {/* Running */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Started / Running</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>

            <div className="text-2xl font-bold text-amber-400 font-mono mt-2">
              {data?.summary?.started ?? 0}
            </div>

            <div className="text-[11px] text-slate-500 mt-1">
              Active 35-Min Timer
            </div>
          </div>

          {/* Not Started */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Not Started</span>
              <Calendar className="w-4 h-4 text-slate-400" />
            </div>

            <div className="text-2xl font-bold text-slate-300 font-mono mt-2">
              {data?.summary?.notStarted ?? 0}
            </div>

            <div className="text-[11px] text-slate-500 mt-1">
              Awaiting Login
            </div>
          </div>

          {/* Time Expired */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Time Expired</span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>

            <div className="text-2xl font-bold text-rose-400 font-mono mt-2">
              {data?.summary?.timeExpired ?? 0}
            </div>

            <div className="text-[11px] text-slate-500 mt-1">
              Auto-Submitted at 35m
            </div>
          </div>
        </section>

        {/* =========================================================
            LEADERBOARD
        ========================================================= */}
        <section className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm">
          {/* Controls */}
          <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-400" />
                Participant Leaderboard & Performance Ranking
              </h2>

              <p className="text-xs text-slate-400 mt-0.5">
                Sorted by:{' '}
                <strong>
                  Highest Marks → Lowest Marks
                </strong>{' '}
                | Tie-breaker:{' '}
                <strong>Shortest Time Taken</strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />

                <input
                  id="admin-search-input"
                  type="text"
                  placeholder="Search participant..."
                  value={searchQuery}
                  onChange={(e) =>
                    setSearchQuery(e.target.value)
                  }
                  className="bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-500 transition-colors w-44 sm:w-56"
                />
              </div>

              {/* Status */}
              <select
                id="admin-status-filter"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
                className="bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl py-1.5 px-3 text-xs text-slate-300 transition-colors"
              >
                <option value="all">
                  All Statuses
                </option>

                <option value="completed">
                  Completed
                </option>

                <option value="in_progress">
                  In Progress
                </option>

                <option value="not_started">
                  Not Started
                </option>

                <option value="time_expired">
                  Time Expired
                </option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 uppercase tracking-wider text-[11px] font-semibold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3 text-center">
                    Rank
                  </th>

                  <th className="py-3 px-4">
                    Participant
                  </th>

                  <th className="py-3 px-3 text-center">
                    Answered
                  </th>

                  <th className="py-3 px-3 text-center">
                    Marks
                  </th>

                  <th className="py-3 px-3 text-center">
                    Max Marks
                  </th>

                  <th className="py-3 px-3 text-center">
                    Time Taken
                  </th>

                  <th className="py-3 px-3 text-center">
                    Start Time
                  </th>

                  <th className="py-3 px-3 text-center">
                    Submission Time
                  </th>

                  <th className="py-3 px-3 text-center">
                    Tab Switches
                  </th>

                  <th className="py-3 px-3 text-center">
                    Status
                  </th>

                  <th className="py-3 px-3 text-center">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td
                      colSpan={11}
                      className="py-12 text-center text-slate-500"
                    >
                      Loading participant rankings...
                    </td>
                  </tr>
                ) : filteredLeaderboard.length === 0 ? (
                  <tr>
                    <td
                      colSpan={11}
                      className="py-12 text-center text-slate-500"
                    >
                      No participant sessions found.
                    </td>
                  </tr>
                ) : (
                  filteredLeaderboard.map((row) => {
                    const isTopThree =
                      row.rank <= 3 &&
                      (row.statusCode === 'completed' ||
                        row.statusCode === 'time_expired');

                    return (
                      <tr
                        key={row.participantId}
                        className={`hover:bg-slate-800/40 transition-colors ${
                          row.statusCode === 'completed'
                            ? 'bg-slate-900/30'
                            : row.statusCode ===
                              'in_progress'
                            ? 'bg-amber-950/10'
                            : ''
                        }`}
                      >
                        {/* Rank */}
                        <td className="py-3.5 px-3 text-center font-mono font-bold">
                          {isTopThree ? (
                            <span
                              className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                                row.rank === 1
                                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40'
                                  : row.rank === 2
                                  ? 'bg-slate-300/20 text-slate-200 border border-slate-300/40'
                                  : 'bg-amber-700/20 text-amber-500 border border-amber-700/40'
                              }`}
                            >
                              {row.rank}
                            </span>
                          ) : (
                            <span className="text-slate-500">
                              {row.rank}
                            </span>
                          )}
                        </td>

                        {/* Participant */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-white">
                            {row.name}
                          </div>

                          <div className="font-mono text-[10px] text-cyan-400">
                            {row.participantId}
                          </div>
                        </td>

                        {/* Answered */}
                        <td className="py-3.5 px-3 text-center font-mono text-slate-300 font-semibold">
                          {row.answered}
                        </td>

                        {/* Marks */}
                        <td className="py-3.5 px-3 text-center font-mono font-bold text-sm">
                          <span
                            className={
                              row.marksObtained >= 35
                                ? 'text-emerald-400'
                                : row.marksObtained > 0
                                ? 'text-cyan-300'
                                : 'text-slate-500'
                            }
                          >
                            {row.marks}
                          </span>
                        </td>

                        {/* Max Marks */}
                        <td className="py-3.5 px-3 text-center font-mono text-slate-400">
                          {row.maxMarks}
                        </td>

                        {/* Time */}
                        <td className="py-3.5 px-3 text-center font-mono text-slate-300">
                          {row.timeTaken}
                        </td>

                        {/* Start */}
                        <td className="py-3.5 px-3 text-center font-mono text-slate-400 text-[11px]">
                          {row.startTime}
                        </td>

                        {/* Submission */}
                        <td className="py-3.5 px-3 text-center font-mono text-slate-400 text-[11px]">
                          {row.submissionTime}
                        </td>

                        {/* Tab Switches */}
                        <td className="py-3.5 px-3 text-center font-mono">
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                              row.tabSwitches > 0
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : 'text-slate-500'
                            }`}
                          >
                            {row.tabSwitches}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-3 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider inline-block ${
                              row.statusCode === 'completed'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : row.statusCode ===
                                  'in_progress'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                                : row.statusCode ===
                                  'time_expired'
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : 'bg-slate-950 text-slate-500 border border-slate-800'
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* View */}
                            <button
                              id={`btn-view-${row.participantId.toLowerCase()}`}
                              type="button"
                              onClick={() =>
                                setSelectedParticipant(row)
                              }
                              disabled={actionLoading}
                              className="p-1.5 text-slate-400 hover:text-white bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors disabled:opacity-50"
                              title="Inspect Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Reset */}
                            <button
                              id={`btn-reset-${row.participantId.toLowerCase()}`}
                              type="button"
                              onClick={() =>
                                handleResetParticipant(
                                  row.participantId
                                )
                              }
                              disabled={actionLoading}
                              className="p-1.5 text-rose-400 hover:text-rose-200 bg-rose-950/40 border border-rose-900/60 hover:bg-rose-900/70 rounded-lg transition-colors disabled:opacity-50"
                              title="Reset Attempt"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* =========================================================
          PARTICIPANT INSPECTOR MODAL
      ========================================================= */}
      {selectedParticipant && (
        <div
          id="admin-inspect-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          onClick={() =>
            setSelectedParticipant(null)
          }
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">
                    {selectedParticipant.name}
                  </h3>

                  <span className="font-mono text-xs text-cyan-400 font-semibold">
                    ({selectedParticipant.participantId})
                  </span>
                </div>

                <div className="text-xs text-slate-400 mt-0.5">
                  Rank #{selectedParticipant.rank} •
                  Marks: {selectedParticipant.marks} •
                  Time: {selectedParticipant.timeTaken}
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedParticipant(null)
                }
                className="p-2 text-slate-400 hover:text-white bg-slate-950 border border-slate-800 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Telemetry */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-slate-500">
                    Status
                  </div>

                  <div className="font-semibold text-white mt-1">
                    {selectedParticipant.status}
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-slate-500">
                    Score Obtained
                  </div>

                  <div className="font-semibold text-emerald-400 mt-1 font-mono text-sm">
                    {selectedParticipant.marks}
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-slate-500">
                    Time Taken
                  </div>

                  <div className="font-semibold text-cyan-300 mt-1 font-mono">
                    {selectedParticipant.timeTaken}
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-slate-500">
                    Tab Violations
                  </div>

                  <div className="font-semibold text-amber-400 mt-1 font-mono">
                    {selectedParticipant.tabSwitches}{' '}
                    Events
                  </div>
                </div>
              </div>

              {/* Answers */}
              <div>
                <h4 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
                  <span>
                    Questions & Answer Submissions
                  </span>

                  <span className="text-xs text-slate-400 font-normal">
                    Answered:{' '}
                    {selectedParticipant.answered}
                  </span>
                </h4>

                <div className="space-y-2">
                  {(data?.allQuestions || []).map(
                    (q) => {
                      const ans =
                        participantAnswers.find(
                          (a) =>
                            a.question_id ===
                            q.question_id
                        );

                      const chosen =
                        ans?.selected_option;

                      const isCorrect =
                        Boolean(chosen) &&
                        chosen!
                          .trim()
                          .toUpperCase() ===
                          q.correct_answer
                            .trim()
                            .toUpperCase();

                      return (
                        <div
                          key={q.question_id}
                          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-4 ${
                            chosen
                              ? isCorrect
                                ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-300'
                                : 'bg-rose-950/30 border-rose-800/80 text-rose-300'
                              : 'bg-slate-950/60 border-slate-800 text-slate-400'
                          }`}
                        >
                          <div className="flex-1">
                            <div className="font-semibold text-white">
                              Q{q.question_number}.{' '}
                              {q.title}
                            </div>

                            <div className="text-[11px] text-slate-400 mt-0.5">
                              Correct Key:{' '}
                              <strong className="text-slate-200">
                                {q.correct_answer}
                              </strong>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-right font-mono">
                            <div>
                              <div className="text-[10px] text-slate-500 uppercase">
                                Selected
                              </div>

                              <div className="font-bold text-sm">
                                {chosen ? (
                                  <span>
                                    {chosen}
                                  </span>
                                ) : (
                                  <span className="text-slate-600 font-normal">
                                    None
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="min-w-[50px] text-right">
                              <span
                                className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                                  isCorrect
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : chosen
                                    ? 'bg-rose-500/20 text-rose-400'
                                    : 'bg-slate-800 text-slate-500'
                                }`}
                              >
                                {isCorrect
                                  ? '+5 Marks'
                                  : '0 Marks'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Tab Switch Audit */}
              <div>
                <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />

                  Tab Switch Audit Trail (
                  {participantTabSwitches.length}{' '}
                  Events)
                </h4>

                {participantTabSwitches.length ===
                0 ? (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-500 text-center">
                    No tab switches or application
                    switches were detected during this
                    session.
                  </div>
                ) : (
                  <div className="bg-slate-950 rounded-xl border border-slate-800 p-3 max-h-48 overflow-y-auto space-y-2">
                    {participantTabSwitches.map(
                      (ts, index) => (
                        <div
                          key={ts.id || index}
                          className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 font-mono"
                        >
                          <span className="text-amber-400 font-semibold">
                            #{index + 1} Violation •{' '}
                            {ts.event_type}
                          </span>

                          <span className="text-slate-400">
                            {new Date(
                              ts.timestamp
                            ).toLocaleTimeString(
                              [],
                              {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              }
                            )}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 flex justify-between">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() =>
                  handleResetParticipant(
                    selectedParticipant.participantId
                  )
                }
                className="px-4 py-2 text-xs font-semibold text-rose-400 hover:text-white bg-rose-950/40 hover:bg-rose-900/80 border border-rose-900 rounded-xl transition-colors disabled:opacity-50"
              >
                {actionLoading
                  ? 'Resetting...'
                  : 'Reset This Candidate'}
              </button>

              <button
                type="button"
                onClick={() =>
                  setSelectedParticipant(null)
                }
                className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};