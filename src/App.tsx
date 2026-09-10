import React, { useState, useEffect } from 'react';
import { ParticipantLogin } from './components/ParticipantLogin';
import { QuizInstructions } from './components/QuizInstructions';
import { QuizView } from './components/QuizView';
import { QuizSubmitted } from './components/QuizSubmitted';
import { AdminLandingPage } from './components/AdminLandingPage';
import {
  ParticipantSession,
  QuizState,
  Question,
  QuizSubmissionResult,
} from './types';

const checkAdminPath = () => {
  const p = window.location.pathname.toLowerCase();
  const h = window.location.hash.toLowerCase();
  return (
    p.startsWith('/admin') ||
    p.includes('portal-secret-x2026') ||
    h === '#admin' ||
    h.includes('portal-secret-x2026')
  );
};

export default function App() {
  const [isAdminView, setIsAdminView] = useState<boolean>(() => {
    return checkAdminPath();
  });

  const [currentStep, setCurrentStep] = useState<
    'login' | 'instructions' | 'quiz' | 'submitted'
  >('login');

  const [participant, setParticipant] =
    useState<ParticipantSession | null>(null);

  const [quizState, setQuizState] = useState<QuizState | null>(null);

  const [questions, setQuestions] = useState<Question[]>([]);

  const [startLoading, setStartLoading] = useState(false);

  const [submissionInfo, setSubmissionInfo] = useState<{
    status: string;
    timeTakenFormatted: string;
  }>({
    status: '',
    timeTakenFormatted: '',
  });

  const [submissionResult, setSubmissionResult] =
    useState<QuizSubmissionResult | null>(null);

  // Check URL path on mount & listen to navigation changes
  useEffect(() => {
    const checkPath = () => {
      setIsAdminView(checkAdminPath());
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.ctrlKey &&
        e.shiftKey &&
        (e.key === 'A' || e.key === 'a')
      ) {
        setIsAdminView((prev) => !prev);
      }
    };

    window.addEventListener('popstate', checkPath);
    window.addEventListener('hashchange', checkPath);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', checkPath);
      window.removeEventListener('hashchange', checkPath);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Fetch Questions from backend
  const fetchQuestions = async () => {
    try {
      const res = await fetch('/api/quiz/questions');
      const data = await res.json();

      if (data.success && data.questions) {
        setQuestions(data.questions);
      }
    } catch (err) {
      console.error('Failed to load questions:', err);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // Check for existing participant session in localStorage
  useEffect(() => {
    const savedParticipantStr =
      localStorage.getItem('active_participant');

    if (!savedParticipantStr) {
      return;
    }

    try {
      const saved = JSON.parse(savedParticipantStr);

      if (saved && saved.id) {
        fetch(
          `/api/quiz/state?participantId=${encodeURIComponent(
            saved.id
          )}`
        )
          .then((res) => res.json())
          .then((data) => {
            if (data.success && data.state) {
              setParticipant(saved);
              setQuizState(data.state);

              if (
                data.state.status === 'completed' ||
                data.state.status === 'time_expired'
              ) {
                setSubmissionInfo({
                  status: data.state.status,
                  timeTakenFormatted:
                    data.state.time_taken_formatted,
                });

                setCurrentStep('submitted');
              } else if (data.state.status === 'in_progress') {
                setCurrentStep('quiz');
              } else {
                setCurrentStep('instructions');
              }
            }
          })
          .catch((e) =>
            console.warn('Session restoration failed:', e)
          );
      }
    } catch (e) {
      console.error('Error restoring session:', e);
    }
  }, []);

  // Participant login success
  const handleLoginSuccess = (
    user: ParticipantSession,
    state: QuizState
  ) => {
    setParticipant(user);
    setQuizState(state);

    localStorage.setItem(
      'active_participant',
      JSON.stringify(user)
    );

    if (
      state.status === 'completed' ||
      state.status === 'time_expired'
    ) {
      setSubmissionInfo({
        status: state.status,
        timeTakenFormatted: state.time_taken_formatted,
      });

      setCurrentStep('submitted');
    } else if (state.status === 'in_progress') {
      setCurrentStep('quiz');
    } else {
      setCurrentStep('instructions');
    }
  };

  // Start quiz
  const handleStartQuiz = async () => {
    if (!participant) return;

    setStartLoading(true);

    try {
      const res = await fetch('/api/quiz/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participantId: participant.id,
        }),
      });

      const data = await res.json();

      if (data.success && data.state) {
        setQuizState(data.state);
        setCurrentStep('quiz');
      } else {
        alert(
          data.error || 'Failed to start quiz session.'
        );
      }
    } catch (err) {
      console.error('Error starting quiz:', err);
      alert('Network error while starting quiz.');
    } finally {
      setStartLoading(false);
    }
  };

  // Quiz submitted
  const handleQuizSubmitted = (
    status: string,
    timeTakenFormatted: string,
    result?: QuizSubmissionResult | null
  ) => {
    setSubmissionInfo({
      status,
      timeTakenFormatted,
    });

    if (result) {
      setSubmissionResult(result);
    }

    setCurrentStep('submitted');
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('active_participant');

    setParticipant(null);
    setQuizState(null);
    setSubmissionResult(null);

    // IMPORTANT:
    // Clear the previous submitted result when logging out.
    setSubmissionInfo({
      status: '',
      timeTakenFormatted: '',
    });

    setCurrentStep('login');
  };

  // Navigate to Admin
  const navigateToAdmin = () => {
    window.location.hash = '#admin';
    setIsAdminView(true);
  };

  // Navigate back to Participant
  const navigateToParticipant = () => {
    if (
      window.location.pathname.toLowerCase().includes('portal-secret-x2026') ||
      window.location.pathname.toLowerCase().startsWith('/admin')
    ) {
      window.history.pushState({}, '', '/');
    }
    window.location.hash = '';
    setIsAdminView(false);
  };

  // Render Admin Landing Page
  if (isAdminView) {
    return (
      <AdminLandingPage
        onReturnToParticipant={navigateToParticipant}
      />
    );
  }

  // Render Participant Login
  if (currentStep === 'login' || !participant) {
    return (
      <ParticipantLogin
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // Render Instructions
  if (currentStep === 'instructions' && quizState) {
    return (
      <QuizInstructions
        participant={participant}
        quizState={quizState}
        onStartQuiz={handleStartQuiz}
        onLogout={handleLogout}
        loading={startLoading}
      />
    );
  }

  // Render Quiz
  if (currentStep === 'quiz' && quizState) {
    return (
      <QuizView
        participant={participant}
        initialState={quizState}
        questions={questions}
        onQuizSubmitted={handleQuizSubmitted}
      />
    );
  }

  // Render Submitted Result
  if (currentStep === 'submitted') {
    return (
      <QuizSubmitted
        participant={participant}
        status={submissionInfo.status}
        timeTakenFormatted={
          submissionInfo.timeTakenFormatted
        }
        initialResult={submissionResult}
        onLogout={handleLogout}
      />
    );
  }

  return null;
}